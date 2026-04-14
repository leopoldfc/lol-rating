export interface Player {
  id?: number;
  golggId: number;
  name: string;
  country?: string;
  currentTeam?: string;
  currentRole?: string;
}

export interface PlayerStats {
  id?: number;
  playerId: number;
  tournamentId: number;
  team?: string;
  role?: string;
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

export interface RawPlayerRow {
  golggId: number;
  name: string;
  country: string;
  team: string;
  role?: string;
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
