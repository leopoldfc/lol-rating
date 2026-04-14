import { getDb } from './migrations.js';
import type { Player, PlayerStats } from '../models/player.js';
import type { Tournament } from '../models/tournament.js';

// --- Players ---

export function upsertPlayer(player: Omit<Player, 'id'>): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO players (golgg_id, name, country, current_team, current_role)
    VALUES (@golggId, @name, @country, @currentTeam, @currentRole)
    ON CONFLICT(golgg_id) DO UPDATE SET
      name = excluded.name,
      country = excluded.country,
      current_team = excluded.current_team,
      current_role = excluded.current_role
  `);
  const result = stmt.run(player);
  if (result.lastInsertRowid) return result.lastInsertRowid as number;
  const row = db.prepare('SELECT id FROM players WHERE golgg_id = ?').get(player.golggId) as { id: number };
  return row.id;
}

export function getPlayerByGolggId(golggId: number): Player | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM players WHERE golgg_id = ?').get(golggId) as any;
  if (!row) return undefined;
  return {
    id: row.id,
    golggId: row.golgg_id,
    name: row.name,
    country: row.country,
    currentTeam: row.current_team,
    currentRole: row.current_role,
  };
}

// --- Tournaments ---

export function upsertTournament(tournament: Omit<Tournament, 'id'>): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tournaments (slug, name, league, year, split, region, tier, total_games, avg_game_duration, scraped_at)
    VALUES (@slug, @name, @league, @year, @split, @region, @tier, @totalGames, @avgGameDuration, @scrapedAt)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      total_games = excluded.total_games,
      avg_game_duration = excluded.avg_game_duration,
      scraped_at = excluded.scraped_at
  `);
  const result = stmt.run(tournament);
  if (result.lastInsertRowid) return result.lastInsertRowid as number;
  const row = db.prepare('SELECT id FROM tournaments WHERE slug = ?').get(tournament.slug) as { id: number };
  return row.id;
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tournaments WHERE slug = ?').get(slug) as any;
  if (!row) return undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    league: row.league,
    year: row.year,
    split: row.split,
    region: row.region,
    tier: row.tier,
    totalGames: row.total_games,
    avgGameDuration: row.avg_game_duration,
    scrapedAt: row.scraped_at,
  };
}

export function getAllTournaments(): Tournament[] {
  const db = getDb();
  return (db.prepare('SELECT * FROM tournaments ORDER BY year DESC, league ASC').all() as any[]).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    league: row.league,
    year: row.year,
    split: row.split,
    region: row.region,
    tier: row.tier,
    totalGames: row.total_games,
    avgGameDuration: row.avg_game_duration,
    scrapedAt: row.scraped_at,
  }));
}

// --- Player Stats ---

export function upsertPlayerStats(stats: Omit<PlayerStats, 'id'>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO player_stats (
      player_id, tournament_id, team, role, games, win_rate, kda,
      avg_kills, avg_deaths, avg_assists, csm, gpm, kp,
      dmg_pct, gold_pct, vs_pct, dpm, vspm,
      avg_wpm, avg_wcpm, avg_vwpm,
      gd15, csd15, xpd15, fb_pct, fb_victim, penta_kills, solo_kills
    ) VALUES (
      @playerId, @tournamentId, @team, @role, @games, @winRate, @kda,
      @avgKills, @avgDeaths, @avgAssists, @csm, @gpm, @kp,
      @dmgPct, @goldPct, @vsPct, @dpm, @vspm,
      @avgWpm, @avgWcpm, @avgVwpm,
      @gd15, @csd15, @xpd15, @fbPct, @fbVictim, @pentaKills, @soloKills
    )
    ON CONFLICT(player_id, tournament_id) DO UPDATE SET
      team = excluded.team, role = excluded.role, games = excluded.games,
      win_rate = excluded.win_rate, kda = excluded.kda,
      avg_kills = excluded.avg_kills, avg_deaths = excluded.avg_deaths, avg_assists = excluded.avg_assists,
      csm = excluded.csm, gpm = excluded.gpm, kp = excluded.kp,
      dmg_pct = excluded.dmg_pct, gold_pct = excluded.gold_pct, vs_pct = excluded.vs_pct,
      dpm = excluded.dpm, vspm = excluded.vspm,
      avg_wpm = excluded.avg_wpm, avg_wcpm = excluded.avg_wcpm, avg_vwpm = excluded.avg_vwpm,
      gd15 = excluded.gd15, csd15 = excluded.csd15, xpd15 = excluded.xpd15,
      fb_pct = excluded.fb_pct, fb_victim = excluded.fb_victim,
      penta_kills = excluded.penta_kills, solo_kills = excluded.solo_kills
  `).run(stats);
}

export function getStatsByTournament(tournamentId: number): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT ps.*, p.golgg_id, p.name, p.country
    FROM player_stats ps
    JOIN players p ON p.id = ps.player_id
    WHERE ps.tournament_id = ?
    ORDER BY ps.kda DESC
  `).all(tournamentId) as any[];
}

export function getStatsByPlayer(golggId: number): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT ps.*, t.name as tournament_name, t.league, t.year, t.split
    FROM player_stats ps
    JOIN players p ON p.id = ps.player_id
    JOIN tournaments t ON t.id = ps.tournament_id
    WHERE p.golgg_id = ?
    ORDER BY t.year DESC
  `).all(golggId) as any[];
}
