const url = 'https://lol.fandom.com/api.php?action=cargoquery&format=json&tables=TournamentRosters&fields=Team,RosterLinks,Roles&where=Tournament%3D%22LCK%2F2026%20Season%2FCup%22&limit=50';

const res = await fetch(url);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
