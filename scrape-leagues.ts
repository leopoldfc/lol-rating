/**
 * Scrape la liste des tournois actifs depuis gol.gg
 * Filtre sur LPL, LEC, LCK, LCS, First Stand, MSI, Worlds
 * Affiche les tournois trouvés + suggestions leagues.ts
 *
 * Usage : npx tsx scrape-leagues.ts
 *         npx tsx scrape-leagues.ts --all     (tous les tournois sans filtre)
 *         npx tsx scrape-leagues.ts --debug   (inspecte le JSON brut)
 */

import fetch from 'node-fetch';

const BASE    = 'https://gol.gg';
const HEADERS = { 'User-Agent': 'lol-esports-scraper/1.0 (stats research bot)', 'Accept': 'text/html' };

// Préfixes des leagues qui nous intéressent (insensible à la casse)
const LEAGUE_FILTERS = ['LCK ', 'LPL ', 'LEC ', 'LCS ', 'FIRST STAND', '2026 FIRST', 'MSI', 'WORLDS'];
// Exclusions explicites (sous-leagues non souhaitées)
const LEAGUE_EXCLUDE = ['LCK CL'];

interface Tournament {
  name: string;
  url: string;
  slug: string;
}

function isTargetLeague(name: string): boolean {
  const upper = name.toUpperCase();
  if (LEAGUE_EXCLUDE.some(e => upper.startsWith(e.toUpperCase()))) return false;
  return LEAGUE_FILTERS.some(f => upper.startsWith(f) || upper === f.trim());
}

async function fetchTournaments(season = 'S16'): Promise<Tournament[]> {
  const body = new URLSearchParams({ season, league: '' });
  const res  = await fetch(`${BASE}/tournament/ajax.trlist.php`, {
    method:  'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json() as any[];

  if (process.argv.includes('--debug')) {
    console.log('Sample entry:', JSON.stringify(data[0], null, 2));
    process.exit(0);
  }

  return data.map(t => {
    const name = (t.trname ?? '').trim();
    return {
      name,
      url:  `${BASE}/tournament/tournament-stats/${encodeURIComponent(name)}/page-summary/`,
      slug: name,
    };
  }).filter(t => t.name);
}

async function main() {
  const showAll = process.argv.includes('--all');

  console.log('Fetching tournaments from gol.gg...\n');

  const all        = await fetchTournaments();
  const tournaments = showAll ? all : all.filter(t => isTargetLeague(t.name));

  if (tournaments.length === 0) {
    console.log('No matching tournaments found.');
    if (!showAll) console.log('Tip: run with --all to see all tournaments.');
    return;
  }

  console.log(`Found ${tournaments.length} tournament(s)${showAll ? '' : ' (LCK/LPL/LEC/LCS/First Stand/MSI/Worlds)'}:\n`);

  for (const t of tournaments) {
    console.log(`  ${t.name}`);
    console.log(`  ${t.url}`);
    console.log();
  }

  console.log('--- leagues.ts entries ---\n');

  for (const t of tournaments) {
    const id    = t.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const label = t.name;
    const file  = `${id}/export.json`;
    console.log(`  {`);
    console.log(`    id:        '${id}',`);
    console.log(`    label:     '${label}',`);
    console.log(`    title:     '${label}',`);
    console.log(`    file:      '${file}',`);
    console.log(`    available: false,`);
    console.log(`  },`);
    console.log();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
