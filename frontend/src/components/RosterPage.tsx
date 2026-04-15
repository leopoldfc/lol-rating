import { useState } from 'react';
import type { Player, Role } from '../types';
import { ROLE_COLOR, getPlayerStats, fmt } from '../utils';
import PlayerModal from './PlayerModal';

const ROLE_ORDER: Role[] = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];
const ROLE_LABEL: Record<Role, string> = { TOP: 'Top', JGL: 'Jungle', MID: 'Mid', BOT: 'Bot', SUP: 'Support' };

const TEAM_COLOR: Record<string, string> = {
  'Gen.G': '#b8960a', 'T1': '#c0001f', 'Dplus Kia': '#0a3a8a',
  'BNK FEARX': '#d43050', 'DRX': '#005fa3',
  'BRION': '#00703c', 'DN SOOPers': '#4a3a8a',
  'KT Rolster': '#cc0000', 'Hanwha Life': '#d45c00', 'NS RedForce': '#aa0020',
};

interface Props {
  players: Player[];
  tournament?: string;
}

export default function RosterPage({ players, tournament }: Props) {
  const [selected, setSelected] = useState<Player | null>(null);

  // Grouper les joueurs par équipe
  const teamMap = new Map<string, Player[]>();
  for (const p of players) {
    if (!p.team) continue;
    if (!teamMap.has(p.team)) teamMap.set(p.team, []);
    teamMap.get(p.team)!.push(p);
  }

  // Trier les équipes par win rate moyen décroissant
  const teams = Array.from(teamMap.entries()).sort((a, b) => {
    const avgWr = (ps: Player[]) => {
      const s = ps.map(p => getPlayerStats(p, tournament)?.winRate ?? 0);
      return s.reduce((a, b) => a + b, 0) / s.length;
    };
    return avgWr(b[1]) - avgWr(a[1]);
  });

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {teams.map(([teamName, teamPlayers]) => {
          const color = TEAM_COLOR[teamName] ?? '#555';

          // Trier les joueurs dans l'ordre TOP JGL MID BOT SUP
          const sorted = [...teamPlayers].sort((a, b) => {
            const ia = ROLE_ORDER.indexOf(a.role as Role);
            const ib = ROLE_ORDER.indexOf(b.role as Role);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
          });

          // Win rate d'équipe = moyenne des starters (5 premiers)
          const starters = sorted.filter(p => ROLE_ORDER.includes(p.role as Role)).slice(0, 5);
          const teamWr = starters.length
            ? starters.reduce((s, p) => s + (getPlayerStats(p, tournament)?.winRate ?? 0), 0) / starters.length
            : 0;

          return (
            <div key={teamName} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              {/* Team header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: `${color}12`,
                borderTop: `3px solid ${color}`,
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: 'var(--text-primary)',
                }}>{teamName}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: teamWr >= 60 ? 'var(--green)' : teamWr >= 45 ? 'var(--text-primary)' : 'var(--red)',
                  }}>{fmt(teamWr)}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Win Rate</div>
                </div>
              </div>

              {/* Players */}
              <div style={{ padding: '4px 0' }}>
                {sorted.map(p => {
                  const stats = getPlayerStats(p, tournament);
                  const roleColor = ROLE_COLOR[p.role as Role] ?? '#888';
                  const isStarter = ROLE_ORDER.includes(p.role as Role);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelected(p)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 1fr auto',
                        alignItems: 'center',
                        padding: '9px 18px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-subtle)',
                        opacity: isStarter ? 1 : 0.55,
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Rôle */}
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isStarter ? roleColor : 'var(--text-muted)',
                      }}>
                        {p.role ? ROLE_LABEL[p.role as Role] ?? p.role : '—'}
                      </span>

                      {/* Nom */}
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 15,
                        fontWeight: 600,
                        color: isStarter ? '#fff' : 'var(--text-secondary)',
                      }}>{p.name}</span>

                      {/* Stats rapides */}
                      {stats && isStarter ? (
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                              {fmt(stats.kda)}
                            </div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>KDA</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                              {fmt(stats.dpm, 0)}
                            </div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DPM</div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stats ? `${stats.games}G` : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <PlayerModal player={selected} onClose={() => setSelected(null)} tournament={tournament} />
      )}
    </>
  );
}
