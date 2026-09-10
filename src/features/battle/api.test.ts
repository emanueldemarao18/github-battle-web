import { describe, expect, it, vi } from 'vitest';
import { battleFixture } from '../../test/fixtures';
import { getBattle, validatePlayers } from './api';

describe('battle API', () => {
  it('sends trimmed query parameters without credentials and preserves API scores', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(battleFixture)));
    vi.stubGlobal('fetch', fetchMock);
    expect(await getBattle(' octocat ', 'torvalds')).toEqual(battleFixture);
    const [url, options] = fetchMock.mock.calls[0]!;
    expect((url as URL).searchParams.get('left')).toBe('octocat');
    expect((url as URL).pathname).toBe('/api/battles');
    expect(options).toMatchObject({ credentials: 'omit', headers: { Accept: 'application/json, application/problem+json' } });
  });

  it.each([400, 404, 422, 429, 502, 503, 500])('handles HTTP %i even without a JSON error body', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('upstream error', { status })));
    await expect(getBattle('octocat', 'torvalds')).rejects.toThrow();
  });

  it.each([{ ...battleFixture, leftScore: '12.34' }, { ...battleFixture, categories: [] }, { ...battleFixture, left: { ...battleFixture.left, profileUrl: 'javascript:alert(1)' } }])('rejects invalid successful responses', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    await expect(getBattle('octocat', 'torvalds')).rejects.toThrow('unexpected response');
  });

  it('explains network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(getBattle('octocat', 'torvalds')).rejects.toThrow('Could not connect');
  });

  it('distinguishes a timeout from cancellation', async () => {
    const timeout = new AbortController();
    timeout.abort(new DOMException('Timed out', 'TimeoutError'));
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout.signal.reason));
    await expect(getBattle('octocat', 'torvalds')).rejects.toThrow('took too long');
    const cancelled = new AbortController();
    cancelled.abort();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cancelled.signal.reason));
    await expect(getBattle('octocat', 'torvalds', cancelled.signal)).rejects.toBe(cancelled.signal.reason);
  });
});

describe('username validation', () => {
  it.each(['', '-abc', 'abc-', 'a--b', 'some user', 'a/b', 'a'.repeat(40)])('rejects invalid username %s', (value) => {
    expect(validatePlayers(value, 'octocat')).not.toBeNull();
  });
  it('rejects case-insensitive duplicate users', () => expect(validatePlayers(' OCTOCAT ', 'octocat')).toContain('different'));
  it('accepts a valid pair', () => expect(validatePlayers('a-b', 'octocat')).toBeNull());
});
