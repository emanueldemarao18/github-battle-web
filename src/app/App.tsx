import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getBattle, validatePlayers } from '../features/battle/api';
import { BattleResults } from '../features/battle/BattleResults';
import type { Battle } from '../features/battle/schema';

export function App() {
  const initial = useRef(new URLSearchParams(window.location.search));
  const [left, setLeft] = useState(initial.current.get('left') || '');
  const [right, setRight] = useState(initial.current.get('right') || '');
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  async function compare(first: string, second: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBattle(null);
    setLoading(false);
    const validation = validatePlayers(first, second);
    setError(validation);
    if (validation) return;
    setLoading(true);
    try {
      const result = await getBattle(first, second, controller.signal);
      if (controller.signal.aborted) return;
      setBattle(result);
      const url = new URL(window.location.href);
      url.search = new URLSearchParams({ left: result.left.username, right: result.right.username }).toString();
      window.history.replaceState(null, '', url);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const first = initial.current.get('left');
    const second = initial.current.get('right');
    if (first !== null || second !== null) void compare(first || '', second || '');
    return () => request.current?.abort();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void compare(left, right);
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><a className="brand" href={import.meta.env.BASE_URL}><span className="brand-icon" aria-hidden="true">&gt;_</span> GitHub Battle<span className="brand-dot">.</span></a><a className="source-link" href="https://github.com/emanueldemarao18/github-battle-web" target="_blank" rel="noreferrer">Source code ↗</a></header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow"><span className="status-dot" /> The open-source arena</p>
        <h1 id="hero-title">Great code.<br /><span>Friendly rivalry.</span></h1>
        <p className="hero-description">Two GitHub profiles. Five categories. One battle.<br className="hidden sm:block" /> Pick your players and see how the numbers stack up.</p>
      </section>
      <section className="arena" aria-labelledby="arena-title">
        <div className="arena-heading"><h2 id="arena-title">Choose your contenders</h2><span className="muted text-xs">01 — SET UP A BATTLE</span></div>
        <form onSubmit={submit} noValidate aria-busy={loading}>
          <div className="contenders">
            <label htmlFor="left"><span className="eyebrow">Player 01</span><span className="input-wrap"><span aria-hidden="true">@</span><input id="left" name="left" value={left} onChange={(event) => setLeft(event.target.value)} placeholder="octocat" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={39} aria-describedby={error ? 'battle-error' : 'username-help'} /></span></label>
            <span className="versus" aria-hidden="true">VS</span>
            <label htmlFor="right"><span className="eyebrow">Player 02</span><span className="input-wrap"><span aria-hidden="true">@</span><input id="right" name="right" value={right} onChange={(event) => setRight(event.target.value)} placeholder="torvalds" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={39} aria-describedby={error ? 'battle-error' : 'username-help'} /></span></label>
          </div>
          <div className="form-bottom"><p id="username-help" className="muted">Personal GitHub accounts only. No sign-in needed.</p><button className="primary" disabled={loading} type="submit">{loading ? 'Battle in progress…' : 'Start battle'}<span aria-hidden="true"> ↗</span></button></div>
        </form>
      </section>
      {error && <div role="alert" className="error" id="battle-error"><strong>Couldn’t start this battle.</strong><p>{error}</p></div>}
      <div role="status" className={loading ? 'loading' : 'sr-only'}>{loading ? 'Fetching profiles and comparing their stats. This can take a moment.' : battle ? (battle.tie ? 'Battle complete. It’s a tie.' : `Battle complete. ${battle.winner} wins.`) : ''}</div>
      {battle ? <BattleResults key={`${battle.left.username}-${battle.right.username}-${battle.left.fetchedAt}`} battle={battle} /> : !loading && <section className="how-it-works" aria-labelledby="how-title"><p className="eyebrow" id="how-title">A little competition. A lot to discover.</p><div className="grid gap-8 sm:grid-cols-3">
        <article><span className="step">01 / PICK</span><h3>Find your rival</h3><p>Compare yourself with a friend, a collaborator or a developer you admire.</p></article>
        <article><span className="step">02 / COMPARE</span><h3>Go beyond the stars</h3><p>Explore followers, repositories, stars, commits and the longest contribution streak.</p></article>
        <article><span className="step">03 / SHARE</span><h3>Keep it friendly</h3><p>Share the matchup and start a conversation. Numbers don’t tell the whole developer story.</p></article>
      </div></section>}
    </main>
    <footer><div className="footer-project"><a href={import.meta.env.BASE_URL}>GitHub Battle<span className="brand-dot">.</span></a><p>A little friendly competition.</p></div><p className="footer-credit">Built by <a href="https://github.com/emanueldemarao18" target="_blank" rel="noreferrer">Emanuel De Marão ↗</a></p></footer>
  </>;
}
