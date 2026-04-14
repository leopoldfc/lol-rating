# lol-rating — État du projet

## Ce que c'est

Un système de ranking de joueurs professionnels League of Legends, similaire à HLTV pour CS:GO.  
Démarre avec la **LCK 2026**, conçu pour supporter toutes les ligues majeures.

Stack : Node.js + TypeScript (scraper) · React + Vite (frontend) · SQLite (stockage) · gol.gg (source de données)

---

## Ce qui est fait

### Scraper (`src/` + `scripts/`)

- **`src/scraper/golgg.ts`** — scraper principal gol.gg avec rate-limiting, retry, détection de rôles via filtre URL
- **`src/scraper/parser.ts`** — parsing HTML cheerio → données structurées. La table gol.gg a la classe `table_list` (pas `table`). Colonnes : td[0]=joueur, td[1]=pays, td[2]=games, td[3]=W%, td[4]=KDA...
- **`src/scraper/rate-limiter.ts`** — 1 req/sec max
- **`src/config/tournaments.ts`** — registre des tournois avec `season` (ex: `S16` pour 2026, pas `ALL`)
- **`src/db/`** — SQLite via better-sqlite3 : schema, migrations, queries (upsert idempotent)
- **`src/index.ts`** — CLI commander : `scrape`, `export`, `list`, `discover`, flag `--export`
- **`scripts/scrape-lck-cup-2026.ts`** — script dédié LCK Cup 2026 : scrape l'URL globale + dispatch rôles via `data/roster.json`

### Données

- **`data/roster.json`** — roster LCK 2026 par équipe (10 équipes, 5 rôles chacune + remplaçants). Clés `SUP2`, `BOT2`... sont normalisées automatiquement.
- **`data/exports/lck-cup-2026.json`** — export JSON généré, lu par le frontend
- **`data/db/lol-ranking.sqlite`** — base SQLite (gitignored)

### Frontend (`frontend/`)

React + Vite 5 (Node 22.9 — ne pas upgrader Vite au-delà de v5, incompatible)

- **`src/App.tsx`** — charge le JSON via fetch, fallback sur données hardcodées si absent. Nav : Rankings / Rosters
- **`src/components/RankingTable.tsx`** — tableau trié/filtrable par rôle + search, carte #1 hero, clic → modal
- **`src/components/PlayerModal.tsx`** — stats détaillées avec jauges, note globale en haut à droite
- **`src/components/RosterPage.tsx`** — grille des équipes triées par win rate, joueurs dans l'ordre TOP→JGL→MID→BOT→SUP
- **`src/components/RoleTag.tsx`** — badge rôle coloré
- **`src/utils.ts`** — `computeRating()` pondéré par rôle, helpers `fmt`, `fmtSign`, `getPlayerStats`
- **`src/fallback-data.ts`** — 48 joueurs LCK hardcodés (utilisés si JSON absent)
- **`frontend/vite.config.ts`** — middleware custom qui sert `/data/*` depuis `../data/` (contournement Vite publicDir)
- **`frontend/index.html`** — titre : `lol-rating`

### Scripts npm (racine)

```bash
npm run dev      # scrape LCK Cup 2026 PUIS lance le frontend (predev hook)
npm run start    # CLI scraper
```

---

## URL patterns gol.gg

```
# Stats joueurs d'un tournoi
https://gol.gg/players/list/season-S16/split-ALL/tournament-LCK%20Cup%202026/

# Avec filtre rôle
https://gol.gg/players/list/season-S16/split-ALL/tournament-LCK%20Cup%202026/role-TOP/

# Stats tournoi (métadonnées)
https://gol.gg/tournament/tournament-stats/LCK%20Cup%202026/
```

Le paramètre `season` vaut `S16` pour 2026 (pas `ALL`). Il est défini dans `TournamentConfig.season`.

---

## Points techniques importants

- **Vite middleware** : la raison pour laquelle `/data/exports/lck-cup-2026.json` est accessible depuis le frontend est un plugin inline dans `vite.config.ts` qui intercepte `/data/*` et lit depuis `../data/`. Sans ça, Vite retourne index.html (SPA fallback).
- **Parsing gol.gg** : le sélecteur correct est `table.table_list` (pas `table.table`). Les indices des colonnes commencent à 0 = joueur (pas de colonne rank).
- **Rôles** : le scraper principal (`golgg.ts`) détecte les rôles via 5 appels avec filtre `/role-TOP/` etc. Le script dédié (`scripts/scrape-lck-cup-2026.ts`) utilise `data/roster.json` à la place (plus fiable).
- **Rate limiting Leaguepedia** : l'API Cargo de lol.fandom.com rate-limite très vite. La table `Players` fonctionne (testée), la table `TournamentRosters` aussi. Mettre minimum 5s entre chaque requête.
- **Node version** : 22.9.0 — Vite 8 ne supporte pas cette version, rester sur Vite 5.

---

## Ce qui reste à faire (idées)

- Ajouter d'autres tournois LCK 2026 (Rounds 1-2, etc.) dans `data/roster.json` et `src/config/tournaments.ts`
- Page de comparaison joueurs (structure CSS `.compare` déjà dans index.css)
- Calcul de rating cross-tournois avec pondération par tier (S/A/B)
- Support d'autres ligues (LEC, LPL...) — architecture prête
- API REST pour servir les données
- Scheduling automatique (cron) pour re-scraper les tournois en cours

---

## Fichiers à ignorer / temporaires

- `test-leaguepedia.js` — fichier de test API Leaguepedia, peut être supprimé
- `scripts/debug-html.ts` — script de debug du parsing HTML, peut être supprimé
- `lck-2026-rankin.jsx` — ancien prototype JSX avec données hardcodées, remplacé par le frontend React
