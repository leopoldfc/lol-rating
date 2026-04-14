import { useEffect, useState } from 'react';
import type { ExportData, Player } from './types';
import { enrichPlayers } from './utils';
import RankingTable from './components/RankingTable';
import RosterPage from './components/RosterPage';
import FALLBACK_PLAYERS from './fallback-data';

type Page = 'rankings' | 'rosters';

function useExportData() {
  const [data, setData] = useState<ExportData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/exports/lck-cup-2026.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: ExportData) => setData(d))
      .catch(() => setError(true));
  }, []);

  return { data, error };
}

export default function App() {
  const { data, error } = useExportData();
  const [page, setPage] = useState<Page>('rankings');

  const rawPlayers: Player[] = data?.players ?? FALLBACK_PLAYERS;
  const tournament = data?.metadata.tournaments[0];
  const players = enrichPlayers(rawPlayers, tournament?.name);

  const league = tournament?.league ?? 'LCK';
  const year   = tournament?.year   ?? 2026;

  return (
    <div>
      <header className="header">
        <div className="header__content">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
            <h1 className="header__title">{league} {year}</h1>
            <span className="header__subtitle">
              {page === 'rankings' ? 'Player Rankings' : 'Team Rosters'}
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'rankings', label: 'Rankings' },
              { key: 'rosters',  label: 'Rosters'  },
            ] as { key: Page; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                style={{
                  padding: '5px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${page === key ? 'var(--gold-border)' : 'var(--border-light)'}`,
                  background: page === key ? 'var(--gold-ghost)' : 'transparent',
                  color: page === key ? 'var(--gold)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="header__meta" style={{ marginTop: 8 }}>
            {tournament
              ? `${tournament.name}${tournament.totalGames ? ` · ${tournament.totalGames} games` : ''} · ${players.length} joueurs`
              : `LCK Cup 2026 · ${players.length} joueurs · Données de démonstration`}
            {error && <span style={{ color: 'var(--red)', marginLeft: 8 }}>· JSON non trouvé</span>}
          </p>
        </div>
      </header>

      <main className="page container">
        {page === 'rankings' && (
          <RankingTable
            players={players}
            tournament={tournament?.name}
            tournamentName={tournament?.name}
          />
        )}
        {page === 'rosters' && (
          <RosterPage
            players={players}
            tournament={tournament?.name}
          />
        )}

        <footer className="footer">
          <p>
            Données : <strong>gol.gg</strong> ·
            Scraper : <strong>lol-esports-scraper</strong> ·
            Rating composite pondéré par rôle
          </p>
        </footer>
      </main>
    </div>
  );
}
