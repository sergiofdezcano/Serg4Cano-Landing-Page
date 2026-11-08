import { describe, expect, it, vi } from 'vitest';
import { nextSlot, splitDuration } from '../../src/lib/schedule.js';
import { cleanTitle, parseFeed, playlistIds } from '../../src/lib/youtube.js';
import { latestTweets, syndicationToken, toTweet, tweetId } from '../../src/lib/tweets.js';
import { tweets as renderedTweets } from '../../src/lib/data.js';
import { activeOffers, formatEuros, toSteamOffers } from '../../src/lib/steam.js';

const schedule = { days: [1, 3, 5], time: '20:00', timezone: 'Europe/Madrid', durationMinutes: 180 };

describe('nextSlot', () => {
  // 2026-11-09 is a Monday. Madrid is UTC+1 in November.
  it('counts down to tonight when the stream has not started', () => {
    const r = nextSlot(schedule, new Date('2026-11-09T18:00:00Z')); // 19:00 Madrid
    expect(r).toEqual({ live: false, secondsUntil: 3600 });
  });

  it('is live inside the slot', () => {
    const r = nextSlot(schedule, new Date('2026-11-09T20:00:00Z')); // 21:00 Madrid
    expect(r.live).toBe(true);
    expect(r.secondsLeft).toBe(2 * 3600);
  });

  it('stays live past midnight for a slot that started the day before', () => {
    const r = nextSlot({ ...schedule, time: '23:00' }, new Date('2026-11-09T23:30:00Z')); // Tue 00:30 Madrid
    expect(r.live).toBe(true);
  });

  it('jumps to the next scheduled day after the slot ends', () => {
    const r = nextSlot(schedule, new Date('2026-11-09T23:30:00Z')); // Mon 00:30 Tue Madrid
    expect(r.live).toBe(false);
    expect(r.secondsUntil).toBe(24 * 3600 + 19.5 * 3600); // Wed 20:00
  });

  it('wraps from Friday night to Monday', () => {
    const r = nextSlot(schedule, new Date('2026-11-14T10:00:00Z')); // Sat 11:00 Madrid
    expect(r.secondsUntil).toBe(2 * 86400 + 9 * 3600);
  });

  it('respects summer time', () => {
    const r = nextSlot(schedule, new Date('2026-07-06T17:00:00Z')); // Mon 19:00 Madrid (UTC+2)
    expect(r.secondsUntil).toBe(3600);
  });
});

it('splitDuration', () => {
  expect(splitDuration(90061)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
});

describe('youtube', () => {
  it('derives long-video and Shorts playlists from the channel id', () => {
    expect(playlistIds('UCWOIPHrXrZiloYqhVIsMa7g')).toEqual({
      videos: 'UULFWOIPHrXrZiloYqhVIsMa7g',
      shorts: 'UUSHWOIPHrXrZiloYqhVIsMa7g',
    });
  });

  it('parses feed entries and decodes entities', () => {
    const xml = `<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Hola &amp; adiós</title>
      <published>2026-11-01T10:00:00+00:00</published></entry><entry><title>broken</title></entry></feed>`;
    expect(parseFeed(xml, { shorts: true })).toEqual([
      {
        id: 'abcdefghijk',
        title: 'Hola & adiós',
        published: '2026-11-01T10:00:00+00:00',
        url: 'https://www.youtube.com/shorts/abcdefghijk',
      },
    ]);
  });

  it('strips trailing hashtags only', () => {
    expect(cleanTitle('La #1 de BF6 #battlefield6 #bf6')).toBe('La #1 de BF6');
    expect(cleanTitle('#solo')).toBe('#solo');
  });
});

describe('tweets', () => {
  it('extracts the id and builds the syndication token', () => {
    expect(tweetId('https://x.com/serg4Cano/status/2100138635525771297?s=20')).toBe('2100138635525771297');
    expect(syndicationToken('2100138635525771297')).toMatch(/^[a-z0-9]+$/);
  });

  it('trims the trailing media link', () => {
    const t = toTweet(
      { id_str: '1', text: 'Mirad esto https://t.co/abc', created_at: 'x', favorite_count: 3, user: { name: 'S', screen_name: 's' } },
      'https://x.com/s/status/1',
    );
    expect(t.text).toBe('Mirad esto');
    expect(t.likes).toBe(3);
  });

  it('extracts the same id from url variants', () => {
    const urls = [
      'https://x.com/serg4Cano/status/123?s=20',
      'https://x.com/serg4Cano/status/123?t=abcDEF&s=09',
      'https://twitter.com/serg4Cano/status/123',
      'https://x.com/serg4Cano/status/123/photo/1',
    ];
    expect(urls.map(tweetId)).toEqual(['123', '123', '123', '123']);
  });

  const tweet = (id, createdAt) => ({ id, url: `https://x.com/s/status/${id}`, text: id, createdAt, likes: 0, name: 'S', handle: 's' });

  it('keeps the 6 most recent tweets, newest first', () => {
    const input = [
      tweet('1', '2026-01-05T10:00:00.000Z'),
      tweet('2', '2026-03-01T10:00:00.000Z'),
      tweet('3', '2025-12-31T23:00:00.000Z'),
      tweet('4', '2026-02-10T10:00:00.000Z'),
      tweet('5', '2026-01-20T10:00:00.000Z'),
      tweet('6', '2025-11-01T10:00:00.000Z'),
      tweet('7', '2026-02-28T10:00:00.000Z'),
      tweet('8', '2026-01-01T10:00:00.000Z'),
    ];
    expect(latestTweets(input).map((t) => t.id)).toEqual(['2', '7', '4', '5', '1', '8']);
  });

  it('drops duplicated tweet ids', () => {
    const input = [tweet('9', '2026-01-01T10:00:00.000Z'), tweet('9', '2026-01-01T10:00:00.000Z'), tweet('10', '2026-01-02T10:00:00.000Z')];
    expect(latestTweets(input).map((t) => t.id)).toEqual(['10', '9']);
  });

  it('returns an empty list for no tweets', () => {
    expect(latestTweets([])).toEqual([]);
  });

  it('data.js exposes at most 6 tweets', async () => {
    const isNewestFirst = (list) => {
      const times = list.map((t) => Date.parse(t.createdAt));
      return times.every((time, i) => i === 0 || times[i - 1] >= time);
    };
    expect(renderedTweets.length).toBeLessThanOrEqual(6);
    expect(isNewestFirst(renderedTweets)).toBe(true);

    // Same check with a cache that holds more than 6 tweets, unordered and with a duplicate.
    const cache = ['3', '1', '8', '5', '2', '7', '4', '6', '8'].map((id) => tweet(id, `2026-01-0${id}T10:00:00.000Z`));
    vi.resetModules();
    vi.doMock('../../src/data/tweet-cache.json', () => ({ default: cache }));
    try {
      const { tweets } = await import('../../src/lib/data.js');
      expect(tweets.map((t) => t.id)).toEqual(['8', '7', '6', '5', '4', '3']);
      expect(isNewestFirst(tweets)).toBe(true);
    } finally {
      vi.doUnmock('../../src/data/tweet-cache.json');
      vi.resetModules();
    }
  });
});

describe('steam offers', () => {
  const item = (id, discount_percent = 50, extra = {}) => ({
    id,
    name: `Juego ${id}`,
    discounted: discount_percent > 0,
    discount_percent,
    original_price: 1999,
    final_price: 999,
    currency: 'EUR',
    header_image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`,
    discount_expiration: 1794243600,
    ...extra,
  });
  // Minimal featuredcategories response: one item without discount, a duplicated id and more than 6 valid items.
  const fixture = {
    specials: {
      items: [item(1, 0), item(2), item(3), item(2, 75), item(4), item(5), item(6), item(7), item(8), item(9)],
    },
  };

  it('keeps discounted items, unique by id, in Steam order, at most 6', () => {
    expect(toSteamOffers(fixture).map((o) => o.id)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it('converts cents to euros and builds the store url', () => {
    expect(toSteamOffers(fixture)[0]).toEqual({
      id: 2,
      name: 'Juego 2',
      discountPercent: 50,
      originalPrice: 19.99,
      finalPrice: 9.99,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2/header.jpg',
      url: 'https://store.steampowered.com/app/2/',
      endsAt: new Date(1794243600 * 1000).toISOString(),
    });
  });

  it('keeps offers without an end date as null', () => {
    const offers = toSteamOffers({ specials: { items: [item(9, 10, { discount_expiration: undefined })] } });
    expect(offers[0].endsAt).toBeNull();
  });

  it('leaves out items that would not pass the schema instead of failing the batch', () => {
    const raw = {
      specials: {
        items: [
          item(1, 50, { header_image: undefined }),
          item(2, '50'),
          item(3, 50, { name: undefined }),
          item(4, 50, { final_price: 'gratis' }),
          item(undefined),
          item(5),
        ],
      },
    };
    expect(toSteamOffers(raw).map((o) => o.id)).toEqual([5]);
  });

  it('returns no offers for an empty or malformed response', () => {
    expect(toSteamOffers({})).toEqual([]);
    expect(toSteamOffers(null)).toEqual([]);
  });

  it('drops expired offers and keeps the ones without an end date', () => {
    const now = new Date('2026-11-08T12:00:00Z');
    const offers = [
      { id: 1, endsAt: '2026-11-08T11:59:59.000Z' },
      { id: 2, endsAt: null },
      { id: 3, endsAt: '2026-11-09T00:00:00.000Z' },
    ];
    expect(activeOffers(offers, now).map((o) => o.id)).toEqual([2, 3]);
  });

  it('data.js drops expired offers from the cached copy', async () => {
    const offer = (id, endsAt) => ({
      id,
      name: `Juego ${id}`,
      discountPercent: 50,
      originalPrice: 19.99,
      finalPrice: 9.99,
      image: 'https://shared.akamai.steamstatic.com/x.jpg',
      url: `https://store.steampowered.com/app/${id}/`,
      endsAt,
    });
    const cache = { updatedAt: '2020-01-01T00:00:00.000Z', offers: [offer(1, '2020-01-02T00:00:00.000Z'), offer(2, null)] };
    vi.resetModules();
    vi.doMock('../../src/data/steam-offers.json', () => ({ default: cache }));
    try {
      const { steamOffers } = await import('../../src/lib/data.js');
      expect(steamOffers.offers.map((o) => o.id)).toEqual([2]);
      expect(steamOffers.updatedAt).toBe('2020-01-01T00:00:00.000Z');
    } finally {
      vi.doUnmock('../../src/data/steam-offers.json');
      vi.resetModules();
    }
  });

  it('formats euros the Spanish way', () => {
    expect(formatEuros(14.99).replace(/\s/g, ' ')).toBe('14,99 €');
  });
});
