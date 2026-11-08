// Loads and validates every data file once. Invalid data throws at build time.
import profileRaw from '../data/profile.json';
import setupRaw from '../data/setup.json';
import recommendationsRaw from '../data/recommendations.json';
import dealsRaw from '../data/deals.json';
import tweetsRaw from '../data/tweets.json';
import videosRaw from '../data/videos.json';
import tweetCacheRaw from '../data/tweet-cache.json';
import {
  profileSchema,
  setupSchema,
  recommendationsSchema,
  dealsSchema,
  tweetsSchema,
  videosSchema,
  tweetCacheSchema,
} from './schemas.js';

function parse(name, schema, raw) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`src/data/${name} is invalid:\n${issues}`);
  }
  return result.data;
}

export const profile = parse('profile.json', profileSchema, profileRaw);
export const setup = parse('setup.json', setupSchema, setupRaw);
export const recommendations = parse('recommendations.json', recommendationsSchema, recommendationsRaw);
export const deals = parse('deals.json', dealsSchema, dealsRaw);
parse('tweets.json', tweetsSchema, tweetsRaw);
export const videos = parse('videos.json', videosSchema, videosRaw);
export const tweets = parse('tweet-cache.json', tweetCacheSchema, tweetCacheRaw);

export const social = (id) => profile.socials.find((s) => s.id === id);

export function formatDate(iso) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' }).format(
    new Date(iso),
  );
}
