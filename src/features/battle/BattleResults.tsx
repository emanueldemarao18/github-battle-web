import { useState } from 'react';
import { categoryLabels, type Battle, type Profile } from './schema';

const number = new Intl.NumberFormat('en-US');
const formatValue = (value: number | null) => value === null ? 'Unavailable' : number.format(value);
function Player({ profile, score, side }: { profile: Profile; score: number; side: string }) {
  return <article className="player-result">
    <p className="eyebrow">{side}</p>
    <img className="avatar" src={profile.avatarUrl} width="72" height="72" alt="" referrerPolicy="no-referrer" />
    <h3>{profile.name || profile.username}</h3>
    <a href={profile.profileUrl} target="_blank" rel="noreferrer">@{profile.username} ↗</a>
    <p className="score">{score}<span> / 100</span></p>
    <p className="muted text-xs">Fetched {new Date(profile.fetchedAt).toLocaleString('en-US')}</p>
  </article>;
}

export function BattleResults({ battle }: { battle: Battle }) {
  const [copyState, setCopyState] = useState('');
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = '';
  shareUrl.search = new URLSearchParams({ left: battle.left.username, right: battle.right.username }).toString();
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl.href);
      setCopyState('Link copied.');
    } catch {
      setCopyState('Copy the link from the field below.');
    }
  }
  return <section aria-labelledby="result-title" className="results">
    <div className="result-heading">
      <div><p className="eyebrow">The verdict</p><h2 id="result-title">{battle.tie ? 'It’s a tie.' : `${battle.winner} wins.`}</h2></div>
      <span className="badge">Live comparison</span>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Player profile={battle.left} score={battle.leftScore} side="Player 01" />
      <Player profile={battle.right} score={battle.rightScore} side="Player 02" />
    </div>
    <div className="table-wrap">
      <table>
        <caption>Category breakdown</caption>
        <thead><tr><th scope="col">Category</th><th scope="col">{battle.left.username}</th><th scope="col">{battle.right.username}</th></tr></thead>
        <tbody>{battle.categories.map((category) => <tr key={category.name}>
          <th scope="row">{categoryLabels[category.name]}<small>Weight {category.weight}{!category.available && ' · Not scored'}</small></th>
          {(['left', 'right'] as const).map((side) => <td key={side}>
            {formatValue(category[`${side}Value`])}
            <small>{category.available && category[`${side}Points`] !== null ? `${category[`${side}Points`]} pts` : 'Not scored'}</small>
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {battle.notes.length > 0 && <aside className="notes" aria-label="Comparison notes"><h3>About these results</h3><ul>{battle.notes.map((note, index) => <li key={index}>{note}</li>)}</ul></aside>}
    <div className="share"><div><h3>Good rivals deserve a rematch.</h3><p className="muted">Share this matchup. Opening it fetches fresh results.</p></div><button className="secondary" onClick={() => void copyLink()}>Copy battle link ↗</button></div>
    {copyState && <div><p role="status">{copyState}</p><label className="sr-only" htmlFor="share-link">Battle link</label><input id="share-link" readOnly value={shareUrl.href} onFocus={(event) => event.target.select()} /></div>}
  </section>;
}
