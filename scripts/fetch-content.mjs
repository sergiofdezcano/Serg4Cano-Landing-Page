// Refreshes src/data/videos.json and src/data/tweet-cache.json.
// Runs before every build. If a source fails, the last good data stays,
// so the site never ships empty.
import { readFile, writeFile } from 'node:fs/promises';
import { feedUrl, parseFeed, playlistIds } from '../src/lib/youtube.js';
import { syndicationUrl, toTweet, tweetId } from '../src/lib/tweets.js';

const root = new URL('../src/data/', import.meta.url);
const readJson = async (name, fallback) => {
  try {
    return JSON.parse(await readFile(new URL(name, root), 'utf8'));
  } catch {
    return fallback;
  }
};
const writeJson = (name, data) => writeFile(new URL(name, root), JSON.stringify(data, null, 2) + '\n');

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function refreshVideos(profile) {
  const previous = await readJson('videos.json', { updatedAt: '', videos: [], shorts: [] });
  const ids = playlistIds(profile.youtubeChannelId);
  try {
    const [videosXml, shortsXml] = await Promise.all([fetchText(feedUrl(ids.videos)), fetchText(feedUrl(ids.shorts))]);
    const videos = parseFeed(videosXml).slice(0, 7);
    const shorts = parseFeed(shortsXml, { shorts: true }).slice(0, 10);
    if (!videos.length && !shorts.length) throw new Error('feeds came back empty');
    await writeJson('videos.json', {
      updatedAt: new Date().toISOString(),
      videos: videos.length ? videos : previous.videos,
      shorts: shorts.length ? shorts : previous.shorts,
    });
    console.log(`youtube: ${videos.length} videos, ${shorts.length} shorts`);
  } catch (err) {
    console.warn(`youtube: keeping previous data (${err.message})`);
    if (!previous.updatedAt) await writeJson('videos.json', previous);
  }
}

async function refreshTweets() {
  const urls = await readJson('tweets.json', []);
  const cache = await readJson('tweet-cache.json', []);
  const byId = new Map(cache.map((t) => [t.id, t]));
  const result = [];
  const seen = new Set();
  for (const url of urls) {
    const id = tweetId(url);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    try {
      const raw = JSON.parse(await fetchText(syndicationUrl(id)));
      if (!raw.text) throw new Error('no text (deleted or private?)');
      result.push(toTweet(raw, url));
    } catch (err) {
      console.warn(`tweet ${id}: ${byId.has(id) ? 'using cached copy' : 'skipped'} (${err.message})`);
      if (byId.has(id)) result.push(byId.get(id));
    }
  }
  await writeJson('tweet-cache.json', result);
  console.log(`tweets: ${result.length}/${urls.length}`);
}

const profile = await readJson('profile.json', null);
await Promise.all([refreshVideos(profile), refreshTweets()]);
