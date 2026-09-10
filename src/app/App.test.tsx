import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { battleFixture } from '../test/fixtures';

async function fillPlayers() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Player 01' }), 'octocat');
  await user.type(screen.getByRole('textbox', { name: 'Player 02' }), 'torvalds');
  return user;
}

describe('battle flow', () => {
  it('does not fetch before valid submission', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Start battle' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter valid GitHub usernames');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows loading, then the API winner and scores without recalculating from categories', async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>((done) => { resolve = done; })));
    render(<App />);
    const user = await fillPlayers();
    await user.click(screen.getByRole('button', { name: 'Start battle' }));
    expect(screen.getByRole('button', { name: /Battle in progress/ })).toBeDisabled();
    resolve(new Response(JSON.stringify(battleFixture)));
    expect(await screen.findByRole('heading', { name: 'torvalds wins.' })).toBeVisible();
    expect(screen.getByText('12.34')).toBeVisible();
    expect(screen.getByText('87.66')).toBeVisible();
    expect(screen.getAllByText('Unavailable')).toHaveLength(4);
    expect(screen.getByText('Contribution metrics are unavailable.')).toBeVisible();
    expect(window.location.search).toBe('?left=octocat&right=torvalds');
  });

  it('runs a shared matchup and displays the API tie', async () => {
    window.history.replaceState(null, '', '/github-battle-web/?left=octocat&right=torvalds');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...battleFixture, leftScore: 50, rightScore: 50, winner: null, tie: true }))));
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'It’s a tie.' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Player 01' })).toHaveValue('octocat');
  });

  it('allows retry after a missing user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 404 })).mockResolvedValueOnce(new Response(JSON.stringify(battleFixture))));
    render(<App />);
    const user = await fillPlayers();
    await user.click(screen.getByRole('button', { name: 'Start battle' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be found');
    await user.click(screen.getByRole('button', { name: 'Start battle' }));
    expect(await screen.findByRole('heading', { name: 'torvalds wins.' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('provides a selectable Pages link if clipboard access fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'));
    window.history.replaceState(null, '', '/github-battle-web/?left=octocat&right=torvalds');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(battleFixture))));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Copy battle link/ }));
    expect(await screen.findByLabelText('Battle link')).toHaveValue(`${window.location.origin}/github-battle-web/?left=octocat&right=torvalds`);
  });

  it('aborts the request on unmount', async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    window.history.replaceState(null, '', '/?left=octocat&right=torvalds');
    const view = render(<App />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const signal = fetchMock.mock.calls[0]![1].signal as AbortSignal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });
});
