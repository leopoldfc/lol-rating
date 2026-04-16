import { useEffect, useState } from 'react';
import type { ExportData, Player } from './types';
import { enrichPlayers } from './utils';
import RankingTable from './components/RankingTable';
import RosterPage from './components/RosterPage';
import { LEAGUES, type LeagueConfig, type SplitConfig } from './leagues';

type Page = 'rankings' | 'rosters';

function useExportData(league: LeagueConfig) {
  const [data, setData]   = useState<ExportData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!league.available) { setData(null); setError(false); return; }
    setData(null); setError(false);
    fetch(`/leagues/${league.file}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: ExportData) => setData(d))
      .catch(() => setError(true));
  }, [league.id]);

  return { data, error };
}

/* ── Styles boutons nav ──────────────────────── */
const navBtn = (active: boolean): React.CSSProperties => ({
  padding: '5px 14px',
  borderRadius: 'var(--r-sm)',
  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--line)'}`,
  background: active ? 'var(--accent-dim)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'all var(--t-fast)',
});

const leagueBtn = (active: boolean, available: boolean): React.CSSProperties => ({
  padding: '5px 13px',
  borderRadius: 'var(--r-sm)',
  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--line)'}`,
  background: active ? 'var(--accent-dim)' : 'transparent',
  color: active ? 'var(--accent)' : available ? 'var(--text-3)' : 'var(--text-4)',
  fontFamily: 'var(--font-display)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  cursor: available ? 'pointer' : 'default',
  opacity: available ? 1 : 0.4,
  transition: 'all var(--t-fast)',
});

const splitBtn = (active: boolean): React.CSSProperties => ({
  padding: '3px 11px',
  borderRadius: 'var(--r-xs)',
  border: `1px solid ${active ? 'rgba(212,245,60,0.25)' : 'var(--line)'}`,
  background: active ? 'var(--accent-faint)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-3)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'all var(--t-fast)',
});

// Aplatit tous les splits (top-level + children) pour trouver le split actif
function findSplit(splits: SplitConfig[], id: string | null): SplitConfig | null {
  for (const s of splits) {
    if (s.id === id) return s;
    if (s.children) {
      const found = s.children.find(c => c.id === id);
      if (found) return found;
    }
  }
  return splits[0] ?? null;
}

// Retourne le split top-level parent d'un id donné (ou lui-même)
function parentSplit(splits: SplitConfig[], id: string | null): SplitConfig | null {
  for (const s of splits) {
    if (s.id === id) return s;
    if (s.children?.some(c => c.id === id)) return s;
  }
  return splits[0] ?? null;
}

export default function App() {
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id);
  const [page, setPage]         = useState<Page>('rankings');
  const [splitId, setSplitId]   = useState<string | null>(null);

  const league = LEAGUES.find(l => l.id === leagueId) ?? LEAGUES[0];
  const { data, error } = useExportData(league);

  const handleSetLeague = (id: string) => { setLeagueId(id); setSplitId(null); };

  const mainTournament   = data?.metadata.tournaments[0];
  const activeSplit      = league.splits ? findSplit(league.splits, splitId) : null;
  const activeTournament = activeSplit?.tournament ?? mainTournament?.name;

  const rawPlayers: Player[] = data?.players ?? [];
  const players = enrichPlayers(rawPlayers, activeTournament);

  return (
    <div>
      <header className="header">
        <div className="header__content container">

          {/* Ligne 1 : titre + page */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h1 className="header__title">{league.title}</h1>
              <span className="header__subtitle">
                {page === 'rankings' ? 'Rankings' : 'Rosters'}
              </span>
            </div>

            {/* Pages */}
            <div style={{ display: 'flex', gap: 3 }}>
              {(['rankings', 'rosters'] as Page[]).map(p => (
                <button key={p} onClick={() => setPage(p)} style={navBtn(page === p)}>
                  {p === 'rankings' ? 'Rankings' : 'Rosters'}
                </button>
              ))}
            </div>
          </div>

          {/* Ligne 2 : leagues */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {LEAGUES.map(l => (
              <button key={l.id} onClick={() => l.available && handleSetLeague(l.id)}
                style={leagueBtn(leagueId === l.id, l.available)}>
                {l.label}
              </button>
            ))}
            {error && (
              <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)', marginLeft: 8, alignSelf: 'center' }}>
                data unavailable
              </span>
            )}
          </div>

          {/* Ligne 3 : splits */}
          {league.splits && league.splits.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', marginTop: 8 }}>
              {league.splits.map(s => {
                const activeParent = league.splits ? parentSplit(league.splits, splitId)?.id === s.id : false;
                const active       = activeParent;

                if (s.children && s.children.length > 0) {
                  // Bouton avec dropdown <select> intégré
                  const activeChild = s.children.find(c => c.id === splitId) ?? s.children[0];
                  return (
                    <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                      <select
                        value={activeChild.id}
                        onChange={e => setSplitId(e.target.value)}
                        style={{
                          ...splitBtn(active),
                          appearance: 'none' as const,
                          WebkitAppearance: 'none' as const,
                          paddingRight: 20,
                          cursor: 'pointer',
                          backgroundImage: 'none',
                        }}
                      >
                        {s.children.map(c => (
                          <option key={c.id} value={c.id}
                            style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                            {s.label} · {c.label}
                          </option>
                        ))}
                      </select>
                      <span style={{
                        position: 'absolute', right: 5, pointerEvents: 'none',
                        fontSize: 7, color: active ? 'var(--accent)' : 'var(--text-3)',
                      }}>▼</span>
                    </span>
                  );
                }

                return (
                  <button key={s.id} onClick={() => setSplitId(s.id)} style={splitBtn(active)}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </header>

      <main className="page container">
        {!league.available ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              {league.label}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
              Coming soon
            </div>
          </div>
        ) : (
          <>
            {page === 'rankings' && (
              <RankingTable
                players={players}
                tournament={activeTournament}
                tournamentName={activeSplit?.label ?? mainTournament?.name}
              />
            )}
            {page === 'rosters' && (
              <RosterPage players={players} tournament={activeTournament} />
            )}
          </>
        )}

        <footer className="footer">
          <p>Data · <strong>gol.gg</strong> · LIR percentile rating by role</p>
        </footer>
      </main>
    </div>
  );
}
