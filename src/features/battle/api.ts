import { battleSchema, type Battle } from './schema';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://github-battle-emanuel.azurewebsites.net';
const errorMessages: Record<number, string> = {
  400: 'Use two different personal GitHub accounts. Organizations are not supported.',
  404: 'A GitHub user could not be found. Check both usernames and try again.',
  422: 'This profile has too many repositories to compare. Try another account.',
  429: 'Too many requests. Please wait a little before trying again.',
  502: 'GitHub could not be reached. Please try again later.',
  503: 'GitHub is temporarily limiting requests. Please try again later.',
};

export function validatePlayers(left: string, right: string): string | null {
  const username = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!username.test(left.trim()) || !username.test(right.trim())) {
    return 'Enter valid GitHub usernames: 1–39 letters, numbers or single hyphens, with no hyphen at either end.';
  }
  if (left.trim().toLowerCase() === right.trim().toLowerCase()) return 'Choose two different GitHub users.';
  return null;
}

export async function getBattle(left: string, right: string, signal?: AbortSignal): Promise<Battle> {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/api/battles`);
  url.search = new URLSearchParams({ left: left.trim(), right: right.trim() }).toString();
  const timeout = AbortSignal.timeout(45_000);
  let response: Response;
  try {
    response = await fetch(url, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: { Accept: 'application/json, application/problem+json' },
      credentials: 'omit',
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(timeout.aborted
      ? 'The battle took too long. Please try again.'
      : 'Could not connect to the battle service. Please try again shortly.');
  }
  if (!response.ok) throw new Error(errorMessages[response.status] || 'The battle service returned an error. Please try again later.');
  const parsed = battleSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error('The battle service returned an unexpected response. Please try again later.');
  return parsed.data;
}
