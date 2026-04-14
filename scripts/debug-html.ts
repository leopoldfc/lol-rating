import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const res = await fetch('https://gol.gg/players/list/season-S16/split-ALL/tournament-LCK%20Cup%202026/', {
  headers: { 'User-Agent': 'lol-scraper/1.0' },
});
const html = await res.text();
const $ = cheerio.load(html);

const table = $('table.table_list');
console.log(`Lignes tbody: ${table.find('tbody tr').length}`);

// Première ligne complète
const firstRow = table.find('tbody tr').first();
console.log('\nPremière ligne HTML:');
console.log(firstRow.html()?.slice(0, 2000));
