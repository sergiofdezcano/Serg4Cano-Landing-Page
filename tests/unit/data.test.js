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
});
