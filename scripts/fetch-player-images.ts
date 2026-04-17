/**
 * Fetch player images from the Lolesports API and save them locally.
 * Updates all export.json files in frontend/public/leagues/.
 *
 * Usage: npx tsx scripts/fetch-player-images.ts
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'frontend/public/player-images');
const API_KEY    = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ─── 1. Fetch all players from Lolesports ─────────────────────────────────────

const res   = await fetch('https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US', {
  headers: { 'x-api-key': API_KEY },
});
const json  = await res.json() as any;
const teams: any[] = json?.data?.teams ?? [];
const allPlayers   = teams.flatMap((t: any) => t.players ?? []);
console.log(`✓ Lolesports  ${allPlayers.length} joueurs récupérés`);

// ─── 2. Build lookup: normalized summonerName → image URL ─────────────────────

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const byName = new Map<string, string>();
for (const p of allPlayers) {
  if (!p.image || !p.summonerName) continue;
  if (p.image.includes('placeholder') || p.image.includes('silhouette')) continue;
  byName.set(normalize(p.summonerName), p.image);
}

function findImageUrl(playerName: string): string | null {
  const key = normalize(playerName);
  if (byName.has(key)) return byName.get(key)!;

  // partial match for minor spelling differences (min length 4)
  for (const [k, v] of byName) {
    if (k.length >= 4 && key.length >= 4 && (k.includes(key) || key.includes(k))) return v;
  }
  return null;
}

// ─── 3. Download helper ───────────────────────────────────────────────────────

async function downloadBuffer(url: string): Promise<Buffer> {
  const r = await fetch(url, { headers: { 'User-Agent': 'lol-player-images-fetcher/1.0' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

async function downloadImage(playerName: string, url: string): Promise<string | null> {
  const ext   = (url.split('.').pop() ?? 'png').split('?')[0];
  const fname = `${safeName(playerName)}.${ext}`;
  const dest  = path.join(IMAGES_DIR, fname);

  try {
    const buf = await downloadBuffer(url);
    if (buf.length < 2000) return null;
    fs.writeFileSync(dest, buf);
    return `/player-images/${fname}`;
  } catch {
    return null;
  }
}

// ─── 4. Process all league export.json files ─────────────────────────────────

const leagueDir = path.join(ROOT, 'frontend/public/leagues');

function findExportFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) results.push(...findExportFiles(full));
    else if (entry === 'export.json') results.push(full);
  }
  return results;
}

const exportFiles = findExportFiles(leagueDir).sort();

let totalUpdated = 0;
let totalMissed  = 0;

for (const exportFile of exportFiles) {
  if (!fs.existsSync(exportFile)) continue;

  const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  if (!data.playerImages) data.playerImages = {};

  const playerNames: string[] = [...new Set<string>(
    (data.players ?? []).map((p: any) => p.name).filter(Boolean)
  )];

  let updated = 0;
  let missed  = 0;

  for (const playerName of playerNames) {
    const remoteUrl = findImageUrl(playerName);
    if (!remoteUrl) {
      if (!data.playerImages[playerName]) { missed++; process.stdout.write(`  ✗ ${playerName}\n`); }
      continue;
    }

    const localPath = await downloadImage(playerName, remoteUrl);
    if (localPath) {
      data.playerImages[playerName] = localPath;
      updated++;
    } else {
      missed++;
    }
  }

  if (updated > 0) {
    fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));
  }

  const total = playerNames.length;
  const ok    = total - missed;
  const label = path.relative(leagueDir, path.dirname(exportFile));
  console.log(`  ${label.padEnd(28)} ${ok}/${total} images`);
  totalUpdated += updated;
  totalMissed  += missed;
}

console.log(`\n✓ Terminé     ${totalUpdated} images téléchargées, ${totalMissed} introuvables`);
