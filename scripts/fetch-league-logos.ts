/**
 * Fetch league logos from the Lolesports API and save them locally.
 * Updates leagues.ts with logo paths.
 *
 * Usage: npx tsx scripts/fetch-league-logos.ts
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const LOGOS_DIR   = path.join(ROOT, 'frontend/public/league-logos');
const API_KEY     = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

fs.mkdirSync(LOGOS_DIR, { recursive: true });

// ─── 1. Fetch all leagues from Lolesports ─────────────────────────────────────

const res  = await fetch('https://esports-api.lolesports.com/persisted/gw/getLeagues?hl=en-US', {
  headers: { 'x-api-key': API_KEY },
});
const json = await res.json() as any;
const leagues: { name: string; slug: string; image: string }[] = json?.data?.leagues ?? [];
console.log(`✓ Lolesports  ${leagues.length} leagues récupérées`);

// ─── 2. Build lookup: slug + normalized name → image URL ──────────────────────

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const bySlug = new Map<string, string>();
const byNorm = new Map<string, string>();
for (const l of leagues) {
  if (!l.image || !l.slug) continue;
  bySlug.set(l.slug, l.image);
  byNorm.set(normalize(l.name), l.image);
}

// Manual aliases: our league id prefix → Lolesports slug
const ALIASES: Record<string, string> = {
  'lck':         'lck',
  'lpl':         'lpl',
  'lec':         'lec',
  'lcs':         'lcs',
  'lfl':         'lfl',
  'first-stand': 'first-stand',
  'msi':         'msi',
  'worlds':      'worlds',
};

function findLogoUrl(leagueId: string): string | null {
  // leagueId = e.g. "lck-2026", "first-stand-2025"
  const prefix = leagueId.replace(/-\d{4}$/, '');  // strip year suffix
  const slug   = ALIASES[prefix] ?? prefix;

  if (bySlug.has(slug)) return bySlug.get(slug)!;
  if (byNorm.has(normalize(slug))) return byNorm.get(normalize(slug))!;

  // partial match
  for (const [k, v] of bySlug) {
    if (k.includes(slug) || slug.includes(k)) return v;
  }
  return null;
}

// ─── 3. Download helper ───────────────────────────────────────────────────────

async function downloadBuffer(url: string): Promise<Buffer> {
  const r = await fetch(url, { headers: { 'User-Agent': 'lol-logos-fetcher/1.0' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function downloadLogo(leagueId: string, url: string): Promise<string | null> {
  const ext   = (url.split('.').pop() ?? 'png').split('?')[0];
  const fname = `${leagueId}.${ext}`;
  const dest  = path.join(LOGOS_DIR, fname);

  try {
    const buf = await downloadBuffer(url);
    if (buf.length < 500) return null;  // placeholder
    fs.writeFileSync(dest, buf);
    return `/league-logos/${fname}`;
  } catch {
    return null;
  }
}

// ─── 4. Process all league IDs from leagues.ts ───────────────────────────────

// Extract all unique league id prefixes (without year) from leagues.ts
const leaguesTs = fs.readFileSync(path.join(ROOT, 'frontend/src/leagues.ts'), 'utf8');
const idMatches = [...leaguesTs.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);

// Only top-level league ids (contain exactly one dash or specific patterns)
const leagueIds = [...new Set(
  idMatches.filter(id => /^[a-z].*-\d{4}$/.test(id))
)];

console.log(`\nLeagues à traiter: ${leagueIds.join(', ')}\n`);

const results: Record<string, string> = {};

for (const leagueId of leagueIds) {
  const remoteUrl = findLogoUrl(leagueId);
  if (!remoteUrl) {
    console.log(`  ✗ ${leagueId.padEnd(22)} introuvable`);
    continue;
  }

  const localPath = await downloadLogo(leagueId, remoteUrl);
  if (localPath) {
    results[leagueId] = localPath;
    console.log(`  ✓ ${leagueId.padEnd(22)} → ${localPath}`);
  } else {
    console.log(`  ✗ ${leagueId.padEnd(22)} téléchargement échoué`);
  }
}

// ─── 5. Print leagues.ts logo additions ──────────────────────────────────────

console.log('\n─── Ajouts à faire dans leagues.ts ───\n');
for (const [id, logoPath] of Object.entries(results)) {
  console.log(`  ${id}: logo: '${logoPath}'`);
}

console.log(`\n✓ Terminé  ${Object.keys(results).length}/${leagueIds.length} logos téléchargés`);
console.log(`  Logos dans: frontend/public/league-logos/`);
