export interface Tournament {
  id?: number;
  slug: string;
  name: string;
  league: string;
  year: number;
  split?: string;
  region: string;
  tier?: string;
  totalGames?: number;
  avgGameDuration?: string;
  scrapedAt?: string;
}
