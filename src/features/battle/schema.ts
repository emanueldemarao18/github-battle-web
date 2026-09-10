import { z } from 'zod';

const count = z.number().int().nonnegative();
const profileSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.url().refine((value) => new URL(value).protocol === 'https:'),
  profileUrl: z.url().refine((value) => new URL(value).protocol === 'https:'),
  followers: count,
  repositories: count,
  stars: count,
  commits: count.nullable(),
  longestStreak: count.nullable(),
  fetchedAt: z.iso.datetime({ offset: true }),
});

export const categoryNames = ['followers', 'repositories', 'stars', 'commits', 'longestStreak'] as const;
export const categoryLabels: Record<(typeof categoryNames)[number], string> = {
  followers: 'Followers', repositories: 'Repositories', stars: 'Stars',
  commits: 'Commits · past year', longestStreak: 'Longest streak · past year',
};

export const battleSchema = z.object({
  left: profileSchema,
  right: profileSchema,
  categories: z.array(z.object({
    name: z.enum(categoryNames),
    weight: z.number().int(),
    leftValue: count.nullable(),
    rightValue: count.nullable(),
    available: z.boolean(),
    leftPoints: z.number().nullable(),
    rightPoints: z.number().nullable(),
  })).length(5).refine((items) => new Set(items.map((item) => item.name)).size === 5),
  leftScore: z.number().min(0).max(100),
  rightScore: z.number().min(0).max(100),
  winner: z.string().nullable(),
  tie: z.boolean(),
  notes: z.array(z.string()),
  sharePath: z.string(),
});

export type Battle = z.infer<typeof battleSchema>;
export type Profile = z.infer<typeof profileSchema>;
