export interface SplitConfig {
  id: string;
  label: string;
  tournament: string;   // clé dans player.tournaments
  children?: SplitConfig[]; // sous-sélecteur dropdown
}

export interface LeagueConfig {
  id: string;
  label: string;       // affiché dans le sélecteur
  title: string;       // titre header (ex: "LCK 2026")
  file: string;        // chemin du JSON sous /leagues/
  available: boolean;  // false = "coming soon"
  splits?: SplitConfig[];
}

export const LEAGUES: LeagueConfig[] = [
  {
    id:        'lck-2026',
    label:     'LCK 2026',
    title:     'LCK 2026',
    file:      'lck-2026/export.json',
    available: true,
    splits: [
      { id: 'combined', label: 'Combined',  tournament: 'LCK 2026'              },
      { id: 'cup',      label: 'Cup',       tournament: 'LCK Cup 2026'          },
      { id: 'rounds',   label: 'Rounds 1-2', tournament: 'LCK 2026 Rounds 1-2' },
    ],
  },
  {
    id:        'lpl-2026',
    label:     'LPL 2026',
    title:     'LPL 2026',
    file:      'lpl-2026/export.json',
    available: true,
    splits: [
      { id: 'combined', label: 'Combined', tournament: 'LPL 2026' },
      { id: 'split1comb', label: 'Split 1', tournament: 'LPL 2026 Split 1 Combined', children: [
        { id: 'split1comb', label: 'Combined', tournament: 'LPL 2026 Split 1 Combined' },
        { id: 'split1',     label: 'Season',   tournament: 'LPL 2026 Split 1'          },
        { id: 'split1po',   label: 'Playoffs', tournament: 'LPL 2026 Split 1 Playoffs' },
      ]},
      { id: 'split2', label: 'Split 2', tournament: 'LPL 2026 Split 2' },
    ],
  },
  {
    id:        'lec-2026',
    label:     'LEC 2026',
    title:     'LEC 2026',
    file:      'lec-2026/export.json',
    available: true,
    splits: [
      { id: 'combined', label: 'Combined',      tournament: 'LEC Versus 2026' },
      { id: 'versus',   label: 'Versus',        tournament: 'LEC 2026 Versus', children: [
        { id: 'versus',       label: 'Combined',  tournament: 'LEC 2026 Versus'          },
        { id: 'versusSeason', label: 'Season',    tournament: 'LEC 2026 Versus Season'   },
        { id: 'playoffs',     label: 'Playoffs',  tournament: 'LEC 2026 Versus Playoffs' },
      ]},
      { id: 'spring',   label: 'Spring Season', tournament: 'LEC 2026 Spring Season' },
    ],
  },
  {
    id:        'lcs-2026',
    label:     'LCS 2026',
    title:     'LCS 2026',
    file:      'lcs-2026/export.json',
    available: true,
    splits: [
      { id: 'combined', label: 'Combined', tournament: 'LCS 2026'          },
      { id: 'lockin',   label: 'Lock-In',  tournament: 'LCS 2026 Lock-In'  },
      { id: 'spring',   label: 'Spring',   tournament: 'LCS 2026 Spring'   },
    ],
  },
  {
    id:        'first-stand-2026',
    label:     'First Stand 2026',
    title:     'First Stand 2026',
    file:      'first-stand-2026/export.json',
    available: true,
  },
];
