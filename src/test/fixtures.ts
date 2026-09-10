import { categoryNames, type Battle, type Profile } from '../features/battle/schema';

function profile(username: string): Profile {
  return { username, name: null, avatarUrl: 'https://avatars.githubusercontent.com/u/1', profileUrl: `https://github.com/${username}`, followers: 10, repositories: 5, stars: 20, commits: null, longestStreak: null, fetchedAt: '2026-09-10T12:00:00Z' };
}

export const battleFixture: Battle = {
  left: profile('octocat'), right: profile('torvalds'),
  leftScore: 12.34, rightScore: 87.66, winner: 'torvalds', tie: false,
  categories: categoryNames.map((name) => ({ name, weight: 20, leftValue: name === 'commits' || name === 'longestStreak' ? null : 10, rightValue: name === 'commits' || name === 'longestStreak' ? null : 10, available: name !== 'commits' && name !== 'longestStreak', leftPoints: name === 'commits' || name === 'longestStreak' ? null : 10, rightPoints: name === 'commits' || name === 'longestStreak' ? null : 10 })),
  notes: ['Contribution metrics are unavailable.'],
  sharePath: '/api/battles?left=octocat&right=torvalds',
};
