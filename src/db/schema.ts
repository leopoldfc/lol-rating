export const SCHEMA = `
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  golgg_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  current_team TEXT,
  current_role TEXT
);

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  league TEXT NOT NULL,
  year INTEGER NOT NULL,
  split TEXT,
  region TEXT NOT NULL,
  tier TEXT,
  total_games INTEGER,
  avg_game_duration TEXT,
  scraped_at DATETIME
);

CREATE TABLE IF NOT EXISTS player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  team TEXT,
  role TEXT,
  games INTEGER,
  win_rate REAL,
  kda REAL,
  avg_kills REAL,
  avg_deaths REAL,
  avg_assists REAL,
  csm REAL,
  gpm REAL,
  kp REAL,
  dmg_pct REAL,
  gold_pct REAL,
  vs_pct REAL,
  dpm REAL,
  vspm REAL,
  avg_wpm REAL,
  avg_wcpm REAL,
  avg_vwpm REAL,
  gd15 REAL,
  csd15 REAL,
  xpd15 REAL,
  fb_pct REAL,
  fb_victim REAL,
  penta_kills INTEGER,
  solo_kills INTEGER,

  UNIQUE(player_id, tournament_id)
);

CREATE INDEX IF NOT EXISTS idx_stats_tournament ON player_stats(tournament_id);
CREATE INDEX IF NOT EXISTS idx_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_stats_role ON player_stats(role);
CREATE INDEX IF NOT EXISTS idx_tournaments_league_year ON tournaments(league, year);
`;
