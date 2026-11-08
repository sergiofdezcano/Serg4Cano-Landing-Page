// Schemas for every editable data file. A bad file fails the build
// instead of shipping a broken page.
import { z } from 'astro/zod';

const url = z.string().url();
const socialId = z.enum(['youtube', 'twitch', 'kick', 'tiktok', 'x', 'instagram', 'discord']);

export const profileSchema = z.object({
  name: z.string().min(1),
  bio: z.string().min(1),
  email: z.string().email(),
  youtubeChannelId: z.string().regex(/^UC[\w-]{22}$/),
  schedule: z.object({
    days: z.array(z.number().int().min(0).max(6)).min(1),
    label: z.string(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string(),
    timezoneLabel: z.string(),
    durationMinutes: z.number().int().positive(),
  }),
  socials: z.array(z.object({ id: socialId, label: z.string(), handle: z.string(), url })).min(1),
  streamPlatforms: z.array(socialId),
});

export const setupSchema = z.array(
  z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    url: url.optional(),
    image: z.string().optional(),
    affiliate: z.boolean().default(false),
  }),
);

export const recommendationsSchema = z.array(
  z.object({
    title: z.string().min(1),
    note: z.string().min(1),
    url,
    kind: z.enum(['tienda', 'juego', 'recurso']),
    affiliate: z.boolean(),
  }),
);

export const dealsSchema = z.array(
  z.object({
    brand: z.string().min(1),
    discount: z.string().min(1),
    description: z.string().min(1),
    code: z.string().min(1).optional(),
    url,
    sponsor: z.boolean().default(false),
  }),
);

export const tweetsSchema = z.array(url.regex(/\/status\/\d+/));

const video = z.object({
  id: z.string().regex(/^[\w-]{11}$/),
  title: z.string(),
  published: z.string(),
  url,
});

export const videosSchema = z.object({
  updatedAt: z.string(),
  videos: z.array(video),
  shorts: z.array(video),
});

export const tweetCacheSchema = z.array(
  z.object({
    id: z.string(),
    url,
    text: z.string(),
    createdAt: z.string(),
    likes: z.number(),
    name: z.string(),
    handle: z.string(),
  }),
);
