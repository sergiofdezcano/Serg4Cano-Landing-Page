// Every editable data file must match its schema. This is the check that
// catches a typo before it reaches the live site.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as s from '../../src/lib/schemas.js';

const read = (name) => JSON.parse(readFileSync(new URL(`../../src/data/${name}`, import.meta.url), 'utf8'));

const files = {
  'profile.json': s.profileSchema,
  'setup.json': s.setupSchema,
  'recommendations.json': s.recommendationsSchema,
  'deals.json': s.dealsSchema,
  'tweets.json': s.tweetsSchema,
  'videos.json': s.videosSchema,
  'tweet-cache.json': s.tweetCacheSchema,
  'steam-offers.json': s.steamOffersSchema,
};

describe('data files', () => {
  for (const [name, schema] of Object.entries(files)) {
    it(`${name} is valid`, () => {
      const result = schema.safeParse(read(name));
      expect(result.error?.issues ?? []).toEqual([]);
    });
  }

  it('every stream platform has a social link', () => {
    const profile = read('profile.json');
    const ids = profile.socials.map((x) => x.id);
    expect(profile.streamPlatforms.filter((p) => !ids.includes(p))).toEqual([]);
  });

  it('affiliate links to Instant Gaming carry the referral tag', () => {
    const bad = read('recommendations.json').filter((r) => r.url.includes('instant-gaming') && !r.url.includes('igr=serg4Cano'));
    expect(bad).toEqual([]);
  });

  it('rejects a deal without a URL', () => {
    expect(s.dealsSchema.safeParse([{ brand: 'X', discount: '10%', description: 'd' }]).success).toBe(false);
  });

  const offer = {
    id: 1,
    name: 'Juego',
    discountPercent: 50,
    originalPrice: 19.99,
    finalPrice: 9.99,
    image: 'https://shared.akamai.steamstatic.com/x.jpg',
    url: 'https://store.steampowered.com/app/1/',
    endsAt: null,
  };
  const offersFile = (o) => ({ updatedAt: '2026-11-08T12:00:00.000Z', offers: [o] });

  it('accepts a valid steam offer', () => {
    expect(s.steamOffersSchema.safeParse(offersFile(offer)).success).toBe(true);
  });

  it('rejects a steam offer without url', () => {
    const { url, ...noUrl } = offer;
    expect(s.steamOffersSchema.safeParse(offersFile(noUrl)).success).toBe(false);
  });

  it('rejects a steam offer with a non-numeric discount', () => {
    expect(s.steamOffersSchema.safeParse(offersFile({ ...offer, discountPercent: '50%' })).success).toBe(false);
  });
});
