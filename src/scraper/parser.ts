import * as cheerio from 'cheerio';
import type { RawPlayerRow } from '../models/player.js';

function parseNum(val: string): number {
  const cleaned = val.replace('%', '').replace(',', '.').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseGolggId(href: string): number {
  // href pattern: "./player-stats/1250/..."  or "/players/player-stats/1250/..."
  const match = href.match(/player-stats\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Parse le tableau HTML de la page player list gol.gg
 * Le tableau a les colonnes dans cet ordre :
 * Rank | Player | Team | G | W% | KDA | K | D | A | CSM | GPM | KP | DMG% | GOLD% | VS% | DPM | VSPM | WPM | WCPM | VWPM | GD@15 | CSD@15 | XPD@15 | FB% | FBV% | Penta | Solo
 */
export function parsePlayerList(html: string, role?: string): RawPlayerRow[] {
  const $ = cheerio.load(html);
  const players: RawPlayerRow[] = [];

  // Le tableau principal est le premier tableau avec classe "table"
  const table = $('table.table').first();
  if (!table.length) {
    console.warn('Aucun tableau trouvé sur la page');
    return players;
  }

  table.find('tbody tr').each((_, row) => {
    try {
      const cells = $(row).find('td');
      if (cells.length < 10) return; // ligne incomplète

      // Colonne 1 : Player (contient lien avec ID + nom + drapeau)
      const playerCell = $(cells[1]);
      const playerLink = playerCell.find('a').first();
      const href = playerLink.attr('href') ?? '';
      const golggId = parseGolggId(href);
      if (!golggId) return;

      const name = playerLink.text().trim();
      if (!name) return;

      // Drapeau pays : <img> avec class "flag" ou alt contenant le pays
      const flagImg = playerCell.find('img').first();
      const country = flagImg.attr('alt')?.trim() ?? '';

      // Colonne 2 : Team
      const team = $(cells[2]).text().trim();

      // Colonnes stats (indices 3 à fin)
      const g = cells.length;
      const get = (i: number) => $(cells[i]).text().trim();

      const row_data: RawPlayerRow = {
        golggId,
        name,
        country,
        team,
        role,
        games:      parseNum(get(3)),
        winRate:    parseNum(get(4)),
        kda:        parseNum(get(5)),
        avgKills:   parseNum(get(6)),
        avgDeaths:  parseNum(get(7)),
        avgAssists: parseNum(get(8)),
        csm:        parseNum(get(9)),
        gpm:        parseNum(get(10)),
        kp:         parseNum(get(11)),
        dmgPct:     parseNum(get(12)),
        goldPct:    parseNum(get(13)),
        vsPct:      parseNum(get(14)),
        dpm:        parseNum(get(15)),
        vspm:       parseNum(get(16)),
        avgWpm:     parseNum(get(17)),
        avgWcpm:    parseNum(get(18)),
        avgVwpm:    parseNum(get(19)),
        gd15:       parseNum(get(20)),
        csd15:      parseNum(get(21)),
        xpd15:      parseNum(get(22)),
        fbPct:      parseNum(g > 23 ? get(23) : '0'),
        fbVictim:   parseNum(g > 24 ? get(24) : '0'),
        pentaKills: parseNum(g > 25 ? get(25) : '0'),
        soloKills:  parseNum(g > 26 ? get(26) : '0'),
      };

      players.push(row_data);
    } catch (err) {
      console.warn(`Erreur parsing ligne joueur: ${err}`);
    }
  });

  return players;
}

/**
 * Extrait les métadonnées d'un tournoi depuis la page tournament-stats
 */
export function parseTournamentStats(html: string): {
  totalGames?: number;
  avgGameDuration?: string;
} {
  const $ = cheerio.load(html);
  const result: { totalGames?: number; avgGameDuration?: string } = {};

  // Chercher "X games" dans les stats générales
  $('div, td, span').each((_, el) => {
    const text = $(el).text().trim();
    const gamesMatch = text.match(/^(\d+)\s+games?$/i);
    if (gamesMatch) {
      result.totalGames = parseInt(gamesMatch[1], 10);
    }
    const durationMatch = text.match(/^(\d{2}:\d{2})$/);
    if (durationMatch) {
      result.avgGameDuration = durationMatch[1];
    }
  });

  return result;
}
