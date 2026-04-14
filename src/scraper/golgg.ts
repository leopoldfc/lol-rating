import fetch from 'node-fetch';
import { RateLimiter } from './rate-limiter.js';
import { parsePlayerList, parseTournamentStats } from './parser.js';
import { upsertPlayer, upsertTournament, upsertPlayerStats } from '../db/queries.js';
import { runMigrations } from '../db/migrations.js';
import type { TournamentConfig } from '../config/tournaments.js';
import type { RawPlayerRow } from '../models/player.js';

const USER_AGENT = 'lol-esports-scraper/1.0 (stats research bot; github.com/leopoldfoucher/lol-ranking)';
const BASE_URL = 'https://gol.gg';
const ROLES = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'] as const;

const rateLimiter = new RateLimiter(1);

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    await rateLimiter.wait();
    try {
      console.log(`  GET ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  Tentative ${attempt} échouée: ${err}. Retry dans 2s...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error('Unreachable');
}

/**
 * Scrape la page player list pour un rôle donné afin d'obtenir les rôles des joueurs.
 * gol.gg filtre par rôle via des paramètres dans l'URL ou des boutons JS.
 * On scrape chaque rôle séparément et on fusionne.
 */
async function scrapePlayersByRole(tournamentSlug: string, season: string): Promise<Map<number, string>> {
  const roleMap = new Map<number, string>();

  for (const role of ROLES) {
    const url = `${BASE_URL}/players/list/season-${season}/split-ALL/tournament-${tournamentSlug}/role-${role}/`;
    try {
      const html = await fetchHtml(url);
      const players = parsePlayerList(html, role);
      for (const p of players) {
        if (p.golggId && !roleMap.has(p.golggId)) {
          roleMap.set(p.golggId, role);
        }
      }
      console.log(`  Role ${role}: ${players.length} joueurs`);
    } catch (err) {
      console.warn(`  Impossible de récupérer le rôle ${role}: ${err}`);
    }
  }

  return roleMap;
}

/**
 * Scrape tous les joueurs d'un tournoi (sans filtre de rôle = tous les rôles)
 */
async function scrapeAllPlayers(tournamentSlug: string, season: string): Promise<RawPlayerRow[]> {
  const url = `${BASE_URL}/players/list/season-${season}/split-ALL/tournament-${tournamentSlug}/`;
  const html = await fetchHtml(url);
  return parsePlayerList(html);
}

/**
 * Scrape les métadonnées d'un tournoi
 */
async function scrapeTournamentMeta(tournamentSlug: string): Promise<{ totalGames?: number; avgGameDuration?: string }> {
  const url = `${BASE_URL}/tournament/tournament-stats/${tournamentSlug}/`;
  try {
    const html = await fetchHtml(url);
    return parseTournamentStats(html);
  } catch (err) {
    console.warn(`  Impossible de récupérer les métadonnées du tournoi: ${err}`);
    return {};
  }
}

/**
 * Scrape complet d'un tournoi et sauvegarde en base
 */
export async function scrapeTournament(config: TournamentConfig): Promise<void> {
  runMigrations();

  console.log(`\nScraping: ${config.name}`);
  console.log('─'.repeat(50));

  // 1. Métadonnées du tournoi
  console.log('1/3 Métadonnées tournoi...');
  const meta = await scrapeTournamentMeta(config.slug);

  const tournamentId = upsertTournament({
    slug: config.slug,
    name: config.name,
    league: config.league,
    year: config.year,
    split: config.split,
    region: config.region,
    tier: config.tier,
    totalGames: meta.totalGames,
    avgGameDuration: meta.avgGameDuration,
    scrapedAt: new Date().toISOString(),
  });
  console.log(`  Tournament ID: ${tournamentId}, games: ${meta.totalGames ?? '?'}`);

  const season = config.season ?? 'ALL';

  // 2. Rôles par joueur
  console.log('2/3 Récupération des rôles...');
  const roleMap = await scrapePlayersByRole(config.slug, season);
  console.log(`  ${roleMap.size} joueurs avec rôle identifié`);

  // 3. Tous les joueurs + stats
  console.log('3/3 Stats joueurs...');
  const players = await scrapeAllPlayers(config.slug, season);
  console.log(`  ${players.length} joueurs trouvés`);

  let saved = 0;
  let errors = 0;

  for (const raw of players) {
    try {
      const role = roleMap.get(raw.golggId) ?? raw.role;

      const playerId = upsertPlayer({
        golggId: raw.golggId,
        name: raw.name,
        country: raw.country,
        currentTeam: raw.team,
        currentRole: role,
      });

      upsertPlayerStats({
        playerId,
        tournamentId,
        team: raw.team,
        role,
        games: raw.games,
        winRate: raw.winRate,
        kda: raw.kda,
        avgKills: raw.avgKills,
        avgDeaths: raw.avgDeaths,
        avgAssists: raw.avgAssists,
        csm: raw.csm,
        gpm: raw.gpm,
        kp: raw.kp,
        dmgPct: raw.dmgPct,
        goldPct: raw.goldPct,
        vsPct: raw.vsPct,
        dpm: raw.dpm,
        vspm: raw.vspm,
        avgWpm: raw.avgWpm,
        avgWcpm: raw.avgWcpm,
        avgVwpm: raw.avgVwpm,
        gd15: raw.gd15,
        csd15: raw.csd15,
        xpd15: raw.xpd15,
        fbPct: raw.fbPct,
        fbVictim: raw.fbVictim,
        pentaKills: raw.pentaKills,
        soloKills: raw.soloKills,
      });

      saved++;
    } catch (err) {
      console.warn(`  Erreur sauvegarde ${raw.name}: ${err}`);
      errors++;
    }
  }

  console.log(`\n✓ ${config.name} — ${saved} joueurs sauvegardés, ${errors} erreurs`);
}
