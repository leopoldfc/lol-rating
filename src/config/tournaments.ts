export interface TournamentConfig {
  slug: string;
  name: string;
  league: League;
  year: number;
  split: string;
  region: Region;
  tier: 'S' | 'A' | 'B';
  season?: string;      // Paramètre season pour l'URL gol.gg (ex: S16, S15, ALL)
  startDate?: string;
  endDate?: string;
}

export type League =
  | 'LCK' | 'LEC' | 'LPL' | 'LCS'
  | 'PCS' | 'VCS' | 'LJL' | 'CBLOL'
  | 'LLA' | 'TCL' | 'LCO'
  | 'MSI' | 'WORLDS';

export type Region =
  | 'KR' | 'EU' | 'CN' | 'NA'
  | 'SEA' | 'VN' | 'JP' | 'BR'
  | 'LATAM' | 'TR' | 'OCE'
  | 'INTERNATIONAL';

export const TOURNAMENTS: TournamentConfig[] = [
  // === LCK 2026 ===
  {
    slug: 'LCK%20Cup%202026',
    name: 'LCK Cup 2026',
    league: 'LCK',
    year: 2026,
    split: 'Cup',
    region: 'KR',
    tier: 'A',
    season: 'S16',
  },
  {
    slug: 'LCK%202026%20Rounds%201-2',
    name: 'LCK 2026 Rounds 1-2',
    league: 'LCK',
    year: 2026,
    split: 'Spring',
    region: 'KR',
    tier: 'S',
    season: 'S16',
  },

  // === LEC 2026 ===
  // ... à compléter

  // === INTERNATIONAUX ===
  // ... à compléter
];

export function getTournamentsByLeague(league: League): TournamentConfig[] {
  return TOURNAMENTS.filter(t => t.league === league);
}

export function getTournamentsByYear(year: number): TournamentConfig[] {
  return TOURNAMENTS.filter(t => t.year === year);
}

export function getTournamentsByRegion(region: Region): TournamentConfig[] {
  return TOURNAMENTS.filter(t => t.region === region);
}

export function getTournamentByName(name: string): TournamentConfig | undefined {
  return TOURNAMENTS.find(t => t.name.toLowerCase() === name.toLowerCase());
}
