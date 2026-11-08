// YouTube exposes public RSS feeds per playlist. For channel UCxxxx:
//   UULFxxxx = long videos only, UUSHxxxx = Shorts only.
export function playlistIds(channelId) {
  const suffix = channelId.slice(2);
  return { videos: `UULF${suffix}`, shorts: `UUSH${suffix}` };
}

export function feedUrl(playlistId) {
  return `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

export function parseFeed(xml, { shorts = false } = {}) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entries
    .map((entry) => {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (!id || title === undefined || !published) return null;
      const url = shorts ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`;
      return { id, title: decode(title).trim(), published, url };
    })
    .filter(Boolean);
}

// Titles carry a tail of hashtags that reads as noise on the page.
export function cleanTitle(title) {
  return title.replace(/(\s+#[\p{L}\p{N}_]+)+\s*$/u, '').trim() || title;
}
