/**
 * Fetch recent match results from Lolesports API
 * Output → frontend/public/news.json
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../frontend/public/news.json');
const LOLESPORTS_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const LS_HEADERS = { 'x-api-key': LOLESPORTS_KEY };

// Leagues to fetch schedule for
const LEAGUES = [
  { id: '98767991310872058', name: 'LCK',         slug: 'lck' },
  { id: '98767991314006698', name: 'LPL',         slug: 'lpl' },
  { id: '98767991302996019', name: 'LEC',         slug: 'lec' },
  { id: '98767991299243165', name: 'LCS',         slug: 'lcs' },
  { id: '113464388705111224', name: 'First Stand', slug: 'first_stand' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Lolesports schedule ──────────────────────────────────────────────────────

interface MatchResult {
  id: string;
  startTime: string;
  state: 'completed' | 'inProgress' | 'unstarted';
  blockName: string;
  league: string;
  leagueSlug: string;
  teamA: { name: string; code: string; image: string; wins: number };
  teamB: { name: string; code: string; image: string; wins: number };
  bestOf: number;
}

async function fetchSchedule(leagueId: string, leagueName: string, leagueSlug: string): Promise<MatchResult[]> {
  try {
    const url = `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=${leagueId}`;
    const res = await fetch(url, { headers: LS_HEADERS });
    if (!res.ok) { console.warn(`Schedule ${leagueName} HTTP ${res.status}`); return []; }
    const json = await res.json() as any;
    const events: any[] = json.data?.schedule?.events ?? [];

    const results: MatchResult[] = events
      .filter(e => e.type === 'match' && e.match?.teams?.length === 2)
      .map(e => {
        const [a, b] = e.match.teams;
        return {
          id: e.match.id,
          startTime: e.startTime,
          state: e.state,
          blockName: e.blockName ?? '',
          league: leagueName,
          leagueSlug,
          teamA: { name: a.name, code: a.code, image: a.image, wins: a.result?.gameWins ?? 0 },
          teamB: { name: b.name, code: b.code, image: b.image, wins: b.result?.gameWins ?? 0 },
          bestOf: e.match.strategy?.count ?? 1,
        };
      });

    console.log(`  ${leagueName}: ${results.length} matches`);
    return results;
  } catch (e) {
    console.warn(`Schedule ${leagueName} failed:`, (e as Error).message);
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching match schedules...');
  const allMatches: MatchResult[] = [];
  for (const league of LEAGUES) {
    const matches = await fetchSchedule(league.id, league.name, league.slug);
    allMatches.push(...matches);
    await sleep(300);
  }

  // Sort: inProgress first, then unstarted, then completed (most recent first)
  const stateOrder = { inProgress: 0, unstarted: 1, completed: 2 };
  allMatches.sort((a, b) => {
    const sd = stateOrder[a.state] - stateOrder[b.state];
    if (sd !== 0) return sd;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  const output = {
    scrapedAt: new Date().toISOString(),
    matches: allMatches,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`\nDone. ${allMatches.length} matches → ${OUT}`);
}

main().catch(console.error);
