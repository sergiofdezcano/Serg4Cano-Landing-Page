import { describe, expect, it } from 'vitest';
import { nextSlot, splitDuration } from '../../src/lib/schedule.js';
import { cleanTitle, parseFeed, playlistIds } from '../../src/lib/youtube.js';
import { syndicationToken, toTweet, tweetId } from '../../src/lib/tweets.js';

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
});
