// Public tweet data from X's embed CDN (the same source react-tweet uses).
export function tweetId(url) {
  return url.match(/\/status\/(\d+)/)?.[1] ?? null;
}

export function syndicationToken(id) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

export function syndicationUrl(id) {
  return `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=es&token=${syndicationToken(id)}`;
}

// The section shows at most 6 tweets: two full rows of the 3-column desktop grid.
const MAX_TWEETS = 6;

// Unique by id, newest first by publication date, at most MAX_TWEETS.
export function latestTweets(tweets) {
  const unique = [...new Map(tweets.map((t) => [t.id, t])).values()];
  return unique.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, MAX_TWEETS);
}

export function toTweet(raw, url) {
  const [start, end] = raw.display_text_range ?? [0, raw.text.length];
  const text = [...raw.text].slice(start, end).join('').replace(/\s*https:\/\/t\.co\/\w+$/, '');
  return {
    id: raw.id_str,
    url,
    text: text.trim(),
    createdAt: raw.created_at,
    likes: raw.favorite_count ?? 0,
    name: raw.user?.name ?? '',
    handle: raw.user?.screen_name ?? '',
  };
}
