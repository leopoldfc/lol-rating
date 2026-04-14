import { Command } from 'commander';
import { scrapeTournament } from './scraper/golgg.js';
import { exportToJson, exportByLeague } from './export/json-export.js';
import { runMigrations, getDb } from './db/migrations.js';
import {
  TOURNAMENTS,
  getTournamentsByLeague,
  getTournamentsByYear,
  getTournamentByName,
  type League,
} from './config/tournaments.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const program = new Command();

program
  .name('lol-scraper')
  .description('Scraper de stats joueurs LoL Esports depuis gol.gg')
  .version('1.0.0');

// ─── scrape ───────────────────────────────────────────────────────────────────

program
  .command('scrape')
  .description('Scraper les stats joueurs depuis gol.gg')
  .option('-t, --tournament <name>', 'Nom du tournoi (ex: "LCK Cup 2026")')
  .option('-l, --league <league>', 'Scraper tous les tournois d\'une ligue (ex: LCK)')
  .option('-y, --year <year>', 'Filtrer par année', parseInt)
  .option('--all', 'Scraper tous les tournois configurés')
  .option('--export', 'Exporter en JSON après le scraping')
  .option('-o, --output <dir>', 'Dossier d\'export JSON', './data/exports')
  .action(async (opts) => {
    runMigrations();

    let configs = [];

    if (opts.tournament) {
      const config = getTournamentByName(opts.tournament);
      if (!config) {
        console.error(`Tournoi inconnu: "${opts.tournament}"`);
        console.error('Utilisez "list" pour voir les tournois disponibles.');
        process.exit(1);
      }
      configs = [config];
    } else if (opts.league) {
      configs = getTournamentsByLeague(opts.league as League);
      if (opts.year) configs = configs.filter(t => t.year === opts.year);
      if (!configs.length) {
        console.error(`Aucun tournoi configuré pour ${opts.league}${opts.year ? ` ${opts.year}` : ''}`);
        process.exit(1);
      }
    } else if (opts.all) {
      configs = TOURNAMENTS;
    } else {
      console.error('Précisez --tournament, --league ou --all');
      process.exit(1);
    }

    console.log(`${configs.length} tournoi(s) à scraper\n`);
    for (const config of configs) {
      await scrapeTournament(config);
    }

    if (opts.export) {
      console.log('\nExport JSON...');
      exportToJson(configs.map(c => c.slug), opts.output);
    }

    console.log('\nTerminé.');
  });

// ─── export ───────────────────────────────────────────────────────────────────

program
  .command('export')
  .description('Exporter les données en JSON pour le frontend')
  .option('-t, --tournament <name>', 'Nom du tournoi')
  .option('-l, --league <league>', 'Exporter tous les tournois d\'une ligue')
  .option('-y, --year <year>', 'Filtrer par année', parseInt)
  .option('-o, --output <dir>', 'Dossier de sortie', './data/exports')
  .action((opts) => {
    if (opts.tournament) {
      const config = getTournamentByName(opts.tournament);
      if (!config) {
        console.error(`Tournoi inconnu: "${opts.tournament}"`);
        process.exit(1);
      }
      exportToJson([config.slug], opts.output);
    } else if (opts.league) {
      exportByLeague(opts.league, opts.year, opts.output);
    } else {
      console.error('Précisez --tournament ou --league');
      process.exit(1);
    }
  });

// ─── list ─────────────────────────────────────────────────────────────────────

program
  .command('list')
  .description('Lister les tournois configurés')
  .option('-l, --league <league>', 'Filtrer par ligue')
  .option('-y, --year <year>', 'Filtrer par année', parseInt)
  .action((opts) => {
    let configs = TOURNAMENTS;
    if (opts.league) configs = configs.filter(t => t.league === opts.league);
    if (opts.year) configs = configs.filter(t => t.year === opts.year);

    if (!configs.length) {
      console.log('Aucun tournoi trouvé.');
      return;
    }

    console.log(`\n${'Nom'.padEnd(35)} ${'Ligue'.padEnd(8)} ${'Année'.padEnd(6)} ${'Split'.padEnd(12)} ${'Tier'.padEnd(4)} Région`);
    console.log('─'.repeat(80));
    for (const t of configs) {
      console.log(
        `${t.name.padEnd(35)} ${t.league.padEnd(8)} ${String(t.year).padEnd(6)} ${t.split.padEnd(12)} ${t.tier.padEnd(4)} ${t.region}`
      );
    }
    console.log(`\n${configs.length} tournoi(s)`);
  });

// ─── discover ─────────────────────────────────────────────────────────────────

program
  .command('discover')
  .description('Découvrir les tournois disponibles sur gol.gg')
  .option('-l, --league <league>', 'Filtrer par ligue (ex: LCK)')
  .option('-y, --year <year>', 'Filtrer par année')
  .action(async (opts) => {
    console.log('Récupération de la liste des tournois sur gol.gg...');

    const url = 'https://gol.gg/tournament/list/';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'lol-esports-scraper/1.0' },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const found: { name: string; slug: string }[] = [];

    $('table.table tbody tr').each((_, row) => {
      const link = $(row).find('a').first();
      const href = link.attr('href') ?? '';
      const name = link.text().trim();
      const match = href.match(/tournament-stats\/(.+?)\//);
      if (match && name) {
        found.push({ name, slug: match[1] });
      }
    });

    const configuredSlugs = new Set(TOURNAMENTS.map(t => t.slug));

    let results = found;
    if (opts.league) {
      results = results.filter(t =>
        t.name.toUpperCase().includes(opts.league.toUpperCase())
      );
    }
    if (opts.year) {
      results = results.filter(t => t.name.includes(opts.year));
    }

    const newOnes = results.filter(t => !configuredSlugs.has(t.slug));
    const existing = results.filter(t => configuredSlugs.has(t.slug));

    console.log(`\n${results.length} tournoi(s) trouvé(s) — ${newOnes.length} nouveau(x)\n`);

    if (existing.length) {
      console.log('Déjà configurés :');
      for (const t of existing) console.log(`  ✓ ${t.name}`);
    }

    if (newOnes.length) {
      console.log('\nNouveaux (à ajouter dans src/config/tournaments.ts) :');
      for (const t of newOnes) {
        console.log(`  + ${t.name}`);
        console.log(`    slug: '${t.slug}'`);
      }
    }
  });

program.parse();
