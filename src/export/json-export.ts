import fs from 'fs';
import path from 'path';
import { getDb } from '../db/migrations.js';
import { getAllTournaments, getTournamentBySlug, getStatsByTournament } from '../db/queries.js';
import type { TournamentConfig } from '../config/tournaments.js';

interface ExportTournamentMeta {
  name: string;
  league: string;
  year: number;
  split?: string;
  totalGames?: number;
  scrapedAt?: string;
}

interface ExportPlayerTournamentStats {
  games: number;
  winRate: number;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  csm: number;
  gpm: number;
  kp: number;
  dmgPct: number;
  goldPct: number;
  vsPct: number;
  dpm: number;
  vspm: number;
  avgWpm: number;
  avgWcpm: number;
  avgVwpm: number;
  gd15: number;
  csd15: number;
  xpd15: number;
  fbPct: number;
  fbVictim: number;
  pentaKills: number;
  soloKills: number;
}

interface ExportPlayer {
  id: number;
  name: string;
  country: string;
  team: string;
  role: string;
  tournaments: Record<string, ExportPlayerTournamentStats>;
  aggregated: {
    totalGames: number;
    avgWinRate: number;
    avgKda: number;
  };
}

interface ExportData {
  metadata: {
    exportedAt: string;
    tournaments: ExportTournamentMeta[];
  };
  players: ExportPlayer[];
}

function rowToStats(row: any): ExportPlayerTournamentStats {
  return {
    games: row.games,
    winRate: row.win_rate,
    kda: row.kda,
    avgKills: row.avg_kills,
    avgDeaths: row.avg_deaths,
    avgAssists: row.avg_assists,
    csm: row.csm,
    gpm: row.gpm,
    kp: row.kp,
    dmgPct: row.dmg_pct,
    goldPct: row.gold_pct,
    vsPct: row.vs_pct,
    dpm: row.dpm,
    vspm: row.vspm,
    avgWpm: row.avg_wpm,
    avgWcpm: row.avg_wcpm,
    avgVwpm: row.avg_vwpm,
    gd15: row.gd15,
    csd15: row.csd15,
    xpd15: row.xpd15,
    fbPct: row.fb_pct,
    fbVictim: row.fb_victim,
    pentaKills: row.penta_kills,
    soloKills: row.solo_kills,
  };
}

/**
 * Exporte les données d'un ou plusieurs tournois en JSON
 */
export function exportToJson(tournamentSlugs: string[], outputDir: string): string {
  fs.mkdirSync(outputDir, { recursive: true });

  const db = getDb();
  const tournamentsMeta: ExportTournamentMeta[] = [];
  const playerMap = new Map<number, ExportPlayer>();

  for (const slug of tournamentSlugs) {
    const tournament = getTournamentBySlug(slug);
    if (!tournament || !tournament.id) {
      console.warn(`Tournoi non trouvé en base: ${slug}`);
      continue;
    }

    tournamentsMeta.push({
      name: tournament.name,
      league: tournament.league,
      year: tournament.year,
      split: tournament.split,
      totalGames: tournament.totalGames,
      scrapedAt: tournament.scrapedAt,
    });

    const rows = getStatsByTournament(tournament.id);

    for (const row of rows) {
      const golggId: number = row.golgg_id;

      if (!playerMap.has(golggId)) {
        playerMap.set(golggId, {
          id: golggId,
          name: row.name,
          country: row.country ?? '',
          team: row.team ?? '',
          role: row.role ?? '',
          tournaments: {},
          aggregated: { totalGames: 0, avgWinRate: 0, avgKda: 0 },
        });
      }

      const player = playerMap.get(golggId)!;
      player.team = row.team ?? player.team;
      player.role = row.role ?? player.role;
      player.tournaments[tournament.name] = rowToStats(row);
    }
  }

  // Calcul des agrégats
  for (const player of playerMap.values()) {
    const statsArr = Object.values(player.tournaments);
    const totalGames = statsArr.reduce((sum, s) => sum + s.games, 0);
    const avgWinRate = statsArr.length
      ? statsArr.reduce((sum, s) => sum + s.winRate * s.games, 0) / totalGames
      : 0;
    const avgKda = statsArr.length
      ? statsArr.reduce((sum, s) => sum + s.kda * s.games, 0) / totalGames
      : 0;

    player.aggregated = {
      totalGames,
      avgWinRate: Math.round(avgWinRate * 10) / 10,
      avgKda: Math.round(avgKda * 100) / 100,
    };
  }

  const output: ExportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      tournaments: tournamentsMeta,
    },
    players: Array.from(playerMap.values()).sort(
      (a, b) => b.aggregated.avgKda - a.aggregated.avgKda
    ),
  };

  // Nom du fichier basé sur les tournois
  const filename = tournamentSlugs.length === 1
    ? `${decodeURIComponent(tournamentSlugs[0]).replace(/\s+/g, '-').toLowerCase()}.json`
    : `export-${new Date().toISOString().slice(0, 10)}.json`;

  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✓ Export JSON: ${filePath} (${output.players.length} joueurs)`);

  return filePath;
}

/**
 * Exporte tous les tournois d'une ligue/année
 */
export function exportByLeague(league: string, year: number | undefined, outputDir: string): string {
  const db = getDb();
  let query = 'SELECT slug FROM tournaments WHERE league = ?';
  const params: any[] = [league];
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  const rows = db.prepare(query).all(...params) as { slug: string }[];
  const slugs = rows.map(r => r.slug);

  if (!slugs.length) {
    console.warn(`Aucun tournoi trouvé pour ${league}${year ? ` ${year}` : ''}`);
    return '';
  }

  return exportToJson(slugs, outputDir);
}
