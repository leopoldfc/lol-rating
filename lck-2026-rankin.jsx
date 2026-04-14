import { useState, useMemo } from "react";

const PLAYERS = [
  { name: "Ruler", team: "Gen.G", role: "BOT", games: 19, winRate: 89.5, kda: 5.9, avgKills: 6.2, avgDeaths: 2.2, avgAssists: 6.7, csm: 10.3, gpm: 544, kp: 63.7, dmgPct: 26.9, goldPct: 25.2, dpm: 906, gd15: 260, csd15: 7, xpd15: 212 },
  { name: "Chovy", team: "Gen.G", role: "MID", games: 19, winRate: 89.5, kda: 6.1, avgKills: 4.6, avgDeaths: 1.9, avgAssists: 7.4, csm: 9.8, gpm: 457, kp: 59.4, dmgPct: 23.8, goldPct: 21.2, dpm: 803, gd15: 418, csd15: 6, xpd15: 256 },
  { name: "Kiin", team: "Gen.G", role: "TOP", games: 19, winRate: 89.5, kda: 6.6, avgKills: 3.9, avgDeaths: 1.8, avgAssists: 8.0, csm: 8.8, gpm: 442, kp: 60.3, dmgPct: 23.8, goldPct: 20.5, dpm: 801, gd15: 432, csd15: 5, xpd15: 253 },
  { name: "Canyon", team: "Gen.G", role: "JGL", games: 19, winRate: 89.5, kda: 6.8, avgKills: 4.5, avgDeaths: 2.1, avgAssists: 9.8, csm: 7.6, gpm: 432, kp: 70.5, dmgPct: 18.0, goldPct: 20.0, dpm: 600, gd15: 186, csd15: 1, xpd15: 95 },
  { name: "Duro", team: "Gen.G", role: "SUP", games: 19, winRate: 89.5, kda: 6.1, avgKills: 0.9, avgDeaths: 2.5, avgAssists: 14.5, csm: 0.9, gpm: 284, kp: 76.2, dmgPct: 7.5, goldPct: 13.2, dpm: 252, gd15: 100, csd15: -6, xpd15: -53 },
  { name: "ShowMaker", team: "Dplus KIA", role: "MID", games: 32, winRate: 56.3, kda: 3.6, avgKills: 3.8, avgDeaths: 2.7, avgAssists: 5.9, csm: 9.1, gpm: 422, kp: 63.3, dmgPct: 23.4, goldPct: 21.2, dpm: 697, gd15: 355, csd15: 6, xpd15: 216 },
  { name: "Smash", team: "Dplus KIA", role: "BOT", games: 32, winRate: 56.3, kda: 4.5, avgKills: 5.1, avgDeaths: 2.4, avgAssists: 5.7, csm: 10.6, gpm: 510, kp: 69.1, dmgPct: 28.3, goldPct: 25.7, dpm: 831, gd15: 44, csd15: 3, xpd15: 232 },
  { name: "Siwoo", team: "Dplus KIA", role: "TOP", games: 32, winRate: 56.3, kda: 2.4, avgKills: 2.3, avgDeaths: 2.9, avgAssists: 4.6, csm: 9.0, gpm: 394, kp: 45.0, dmgPct: 22.8, goldPct: 19.9, dpm: 677, gd15: -36, csd15: 5, xpd15: 41 },
  { name: "Lucid", team: "Dplus KIA", role: "JGL", games: 32, winRate: 56.3, kda: 3.1, avgKills: 3.6, avgDeaths: 3.6, avgAssists: 7.6, csm: 6.9, gpm: 394, kp: 71.0, dmgPct: 17.5, goldPct: 19.8, dpm: 527, gd15: 138, csd15: 6, xpd15: 379 },
  { name: "Kellin", team: "Dplus KIA", role: "SUP", games: 27, winRate: 55.6, kda: 4.2, avgKills: 0.9, avgDeaths: 3.0, avgAssists: 11.6, csm: 1.0, gpm: 269, kp: 73.1, dmgPct: 8.0, goldPct: 13.5, dpm: 244, gd15: 24, csd15: -2, xpd15: 45 },
  { name: "Peyz", team: "T1", role: "BOT", games: 23, winRate: 60.9, kda: 4.2, avgKills: 5.9, avgDeaths: 2.9, avgAssists: 6.2, csm: 10.2, gpm: 520, kp: 62.8, dmgPct: 27.7, goldPct: 25.3, dpm: 876, gd15: 221, csd15: 2, xpd15: -80 },
  { name: "Faker", team: "T1", role: "MID", games: 23, winRate: 60.9, kda: 3.3, avgKills: 3.7, avgDeaths: 3.1, avgAssists: 6.7, csm: 9.1, gpm: 422, kp: 54.5, dmgPct: 22.6, goldPct: 20.6, dpm: 696, gd15: -132, csd15: -4, xpd15: -161 },
  { name: "Oner", team: "T1", role: "JGL", games: 23, winRate: 60.9, kda: 4.1, avgKills: 4.8, avgDeaths: 3.0, avgAssists: 7.6, csm: 7.1, gpm: 419, kp: 65.6, dmgPct: 17.8, goldPct: 20.4, dpm: 552, gd15: -22, csd15: -1, xpd15: -105 },
  { name: "Doran", team: "T1", role: "TOP", games: 23, winRate: 60.9, kda: 3.1, avgKills: 3.1, avgDeaths: 2.9, avgAssists: 6.0, csm: 8.8, gpm: 413, kp: 51.7, dmgPct: 24.1, goldPct: 20.2, dpm: 753, gd15: 154, csd15: 2, xpd15: 75 },
  { name: "Keria", team: "T1", role: "SUP", games: 23, winRate: 60.9, kda: 5.0, avgKills: 0.8, avgDeaths: 2.7, avgAssists: 12.8, csm: 1.0, gpm: 276, kp: 69.1, dmgPct: 7.8, goldPct: 13.4, dpm: 242, gd15: 99, csd15: 0, xpd15: 361 },
  { name: "Vicla", team: "BNK FearX", role: "MID", games: 27, winRate: 55.6, kda: 3.7, avgKills: 4.0, avgDeaths: 2.9, avgAssists: 6.7, csm: 9.3, gpm: 423, kp: 63.5, dmgPct: 24.8, goldPct: 21.3, dpm: 757, gd15: 161, csd15: 1, xpd15: 265 },
  { name: "Diable", team: "BNK FearX", role: "BOT", games: 27, winRate: 55.6, kda: 3.6, avgKills: 5.6, avgDeaths: 3.1, avgAssists: 5.6, csm: 10.1, gpm: 517, kp: 66.9, dmgPct: 27.8, goldPct: 25.9, dpm: 848, gd15: 213, csd15: 5, xpd15: 113 },
  { name: "Raptor", team: "BNK FearX", role: "JGL", games: 27, winRate: 55.6, kda: 3.4, avgKills: 3.7, avgDeaths: 3.6, avgAssists: 8.4, csm: 6.5, gpm: 396, kp: 75.1, dmgPct: 17.0, goldPct: 19.9, dpm: 516, gd15: -18, csd15: -5, xpd15: -212 },
  { name: "Clear", team: "BNK FearX", role: "TOP", games: 27, winRate: 55.6, kda: 2.4, avgKills: 2.4, avgDeaths: 3.3, avgAssists: 5.6, csm: 8.6, gpm: 385, kp: 49.5, dmgPct: 22.4, goldPct: 19.4, dpm: 675, gd15: -210, csd15: -4, xpd15: 16 },
  { name: "Career", team: "BNK FearX", role: "SUP", games: 32, winRate: 56.3, kda: 3.5, avgKills: 0.7, avgDeaths: 3.3, avgAssists: 10.7, csm: 1.1, gpm: 263, kp: 72.6, dmgPct: 7.9, goldPct: 13.3, dpm: 232, gd15: -86, csd15: 2, xpd15: -9 },
  { name: "Scout", team: "DN SOOPers", role: "MID", games: 21, winRate: 38.1, kda: 3.5, avgKills: 3.8, avgDeaths: 3.1, avgAssists: 7.1, csm: 9.4, gpm: 427, kp: 73.2, dmgPct: 24.5, goldPct: 21.7, dpm: 707, gd15: 3, csd15: 1, xpd15: 72 },
  { name: "Taeyoon", team: "DN SOOPers", role: "BOT", games: 21, winRate: 38.1, kda: 2.3, avgKills: 5.0, avgDeaths: 4.1, avgAssists: 4.6, csm: 9.7, gpm: 505, kp: 65.2, dmgPct: 27.5, goldPct: 25.7, dpm: 792, gd15: 112, csd15: 9, xpd15: -28 },
  { name: "Sponge", team: "DN SOOPers", role: "JGL", games: 21, winRate: 38.1, kda: 2.7, avgKills: 3.0, avgDeaths: 4.2, avgAssists: 8.4, csm: 6.7, gpm: 387, kp: 75.8, dmgPct: 16.1, goldPct: 19.7, dpm: 473, gd15: -220, csd15: 0, xpd15: -69 },
  { name: "kingen", team: "DN SOOPers", role: "TOP", games: 21, winRate: 38.1, kda: 2.4, avgKills: 2.2, avgDeaths: 2.8, avgAssists: 4.5, csm: 8.7, gpm: 380, kp: 44.0, dmgPct: 23.1, goldPct: 19.4, dpm: 686, gd15: -280, csd15: -12, xpd15: -307 },
  { name: "Lehends", team: "DN SOOPers", role: "SUP", games: 21, winRate: 38.1, kda: 2.9, avgKills: 0.7, avgDeaths: 3.6, avgAssists: 9.6, csm: 1.2, gpm: 264, kp: 68.4, dmgPct: 8.8, goldPct: 13.5, dpm: 255, gd15: 55, csd15: 4, xpd15: 40 },
  { name: "Bdd", team: "KT Rolster", role: "MID", games: 17, winRate: 35.3, kda: 3.4, avgKills: 2.8, avgDeaths: 2.6, avgAssists: 5.9, csm: 9.5, gpm: 398, kp: 67.6, dmgPct: 26.1, goldPct: 20.8, dpm: 666, gd15: 109, csd15: 4, xpd15: 11 },
  { name: "Aiming", team: "KT Rolster", role: "BOT", games: 17, winRate: 35.3, kda: 3.2, avgKills: 4.5, avgDeaths: 2.6, avgAssists: 4.1, csm: 10.1, gpm: 501, kp: 73.8, dmgPct: 27.5, goldPct: 26.2, dpm: 718, gd15: -129, csd15: -8, xpd15: -206 },
  { name: "Cuzz", team: "KT Rolster", role: "JGL", games: 17, winRate: 35.3, kda: 2.6, avgKills: 2.5, avgDeaths: 3.4, avgAssists: 6.2, csm: 7.0, gpm: 387, kp: 76.2, dmgPct: 17.7, goldPct: 20.3, dpm: 448, gd15: 48, csd15: -1, xpd15: -68 },
  { name: "PerfecT", team: "KT Rolster", role: "TOP", games: 17, winRate: 35.3, kda: 2.5, avgKills: 1.8, avgDeaths: 2.4, avgAssists: 4.1, csm: 9.0, gpm: 375, kp: 44.9, dmgPct: 21.2, goldPct: 19.6, dpm: 549, gd15: -93, csd15: 2, xpd15: -70 },
  { name: "Delight", team: "KT Rolster", role: "SUP", games: 14, winRate: 35.7, kda: 3.0, avgKills: 0.6, avgDeaths: 3.7, avgAssists: 10.6, csm: 1.2, gpm: 268, kp: 76.5, dmgPct: 5.9, goldPct: 13.9, dpm: 165, gd15: -4, csd15: 6, xpd15: -88 },
  { name: "Clozer", team: "Kiwoom DRX", role: "MID", games: 33, winRate: 45.5, kda: 3.4, avgKills: 3.5, avgDeaths: 2.8, avgAssists: 6.1, csm: 9.7, gpm: 407, kp: 61.4, dmgPct: 22.8, goldPct: 21.0, dpm: 633, gd15: -52, csd15: 1, xpd15: -42 },
  { name: "Jiwoo", team: "Kiwoom DRX", role: "BOT", games: 33, winRate: 45.5, kda: 3.4, avgKills: 5.6, avgDeaths: 3.5, avgAssists: 6.2, csm: 9.3, gpm: 499, kp: 73.3, dmgPct: 28.9, goldPct: 25.7, dpm: 845, gd15: -59, csd15: -8, xpd15: -18 },
  { name: "Pyosik", team: "Kiwoom DRX", role: "JGL", games: 33, winRate: 45.5, kda: 4.1, avgKills: 3.1, avgDeaths: 2.7, avgAssists: 8.0, csm: 7.1, gpm: 388, kp: 74.4, dmgPct: 15.6, goldPct: 20.0, dpm: 437, gd15: 85, csd15: 2, xpd15: 154 },
  { name: "DuDu", team: "Kiwoom DRX", role: "TOP", games: 33, winRate: 45.5, kda: 3.3, avgKills: 2.8, avgDeaths: 2.4, avgAssists: 5.1, csm: 9.0, gpm: 405, kp: 50.0, dmgPct: 26.6, goldPct: 20.9, dpm: 711, gd15: 225, csd15: 2, xpd15: 129 },
  { name: "Andil", team: "Kiwoom DRX", role: "SUP", games: 33, winRate: 45.5, kda: 2.8, avgKills: 0.7, avgDeaths: 4.3, avgAssists: 11.5, csm: 0.9, gpm: 260, kp: 75.3, dmgPct: 8.4, goldPct: 13.5, dpm: 244, gd15: -97, csd15: -4, xpd15: -51 },
  { name: "Rich", team: "OKSavingsBank BRO", role: "TOP", games: 33, winRate: 45.5, kda: 3.0, avgKills: 2.5, avgDeaths: 2.7, avgAssists: 5.7, csm: 8.4, gpm: 383, kp: 50.4, dmgPct: 24.9, goldPct: 19.8, dpm: 719, gd15: -169, csd15: -4, xpd15: -181 },
  { name: "Willer", team: "OKSavingsBank BRO", role: "JGL", games: 33, winRate: 45.5, kda: 3.1, avgKills: 3.1, avgDeaths: 3.7, avgAssists: 8.2, csm: 6.8, gpm: 386, kp: 71.6, dmgPct: 16.0, goldPct: 19.9, dpm: 475, gd15: -138, csd15: -2, xpd15: -191 },
  { name: "Ucal", team: "OKSavingsBank BRO", role: "MID", games: 33, winRate: 45.5, kda: 3.2, avgKills: 3.9, avgDeaths: 3.2, avgAssists: 6.4, csm: 9.3, gpm: 409, kp: 65.8, dmgPct: 21.8, goldPct: 21.1, dpm: 636, gd15: -450, csd15: -6, xpd15: -273 },
  { name: "deokdam", team: "OKSavingsBank BRO", role: "BOT", games: 33, winRate: 45.5, kda: 3.0, avgKills: 4.3, avgDeaths: 3.3, avgAssists: 5.4, csm: 9.4, gpm: 475, kp: 63.5, dmgPct: 26.5, goldPct: 24.5, dpm: 751, gd15: -439, csd15: -9, xpd15: -308 },
  { name: "Peter", team: "OKSavingsBank BRO", role: "SUP", games: 26, winRate: 50.0, kda: 2.9, avgKills: 0.9, avgDeaths: 3.9, avgAssists: 10.5, csm: 1.1, gpm: 265, kp: 75.7, dmgPct: 7.8, goldPct: 13.5, dpm: 215, gd15: 44, csd15: 3, xpd15: -219 },
  { name: "Teddy", team: "HLE", role: "BOT", games: 19, winRate: 31.6, kda: 2.8, avgKills: 4.2, avgDeaths: 3.3, avgAssists: 4.9, csm: 9.9, gpm: 472, kp: 66.2, dmgPct: 27.3, goldPct: 25.1, dpm: 762, gd15: 108, csd15: 5, xpd15: 125 },
  { name: "Zeka", team: "HLE", role: "MID", games: 14, winRate: 35.7, kda: 3.1, avgKills: 3.6, avgDeaths: 3.0, avgAssists: 5.7, csm: 9.0, gpm: 400, kp: 66.1, dmgPct: 21.3, goldPct: 20.7, dpm: 575, gd15: 97, csd15: 0, xpd15: -72 },
  { name: "Kanavi", team: "HLE", role: "JGL", games: 14, winRate: 35.7, kda: 2.4, avgKills: 3.8, avgDeaths: 4.4, avgAssists: 6.9, csm: 6.9, gpm: 393, kp: 72.2, dmgPct: 17.5, goldPct: 20.3, dpm: 492, gd15: -106, csd15: -2, xpd15: -108 },
  { name: "Roamer", team: "NS", role: "TOP", games: 19, winRate: 31.6, kda: 2.7, avgKills: 2.9, avgDeaths: 3.2, avgAssists: 5.8, csm: 8.9, gpm: 386, kp: 68.2, dmgPct: 23.1, goldPct: 20.6, dpm: 633, gd15: -386, csd15: -6, xpd15: -291 },
  { name: "Casting", team: "NS", role: "MID", games: 19, winRate: 31.6, kda: 2.6, avgKills: 1.8, avgDeaths: 2.5, avgAssists: 4.7, csm: 8.6, gpm: 373, kp: 47.8, dmgPct: 24.9, goldPct: 19.9, dpm: 683, gd15: 23, csd15: 1, xpd15: 150 },
  { name: "GIDEON", team: "NS", role: "JGL", games: 19, winRate: 31.6, kda: 2.5, avgKills: 3.1, avgDeaths: 3.7, avgAssists: 6.2, csm: 7.0, gpm: 381, kp: 70.7, dmgPct: 13.9, goldPct: 20.4, dpm: 390, gd15: 5, csd15: 0, xpd15: -24 },
  { name: "Gumayusi", team: "KT Rolster", role: "BOT", games: 14, winRate: 35.7, kda: 3.1, avgKills: 4.4, avgDeaths: 3.2, avgAssists: 5.6, csm: 10.4, gpm: 505, kp: 69.0, dmgPct: 29.9, goldPct: 26.1, dpm: 831, gd15: -212, csd15: -1, xpd15: -14 },
  { name: "Zeus", team: "HLE", role: "TOP", games: 14, winRate: 35.7, kda: 2.2, avgKills: 1.8, avgDeaths: 3.7, avgAssists: 6.4, csm: 8.1, gpm: 369, kp: 56.9, dmgPct: 25.4, goldPct: 19.0, dpm: 700, gd15: 16, csd15: 4, xpd15: -129 },
];

const ROLE_ICONS = { TOP: "⚔️", JGL: "🌿", MID: "🔮", BOT: "🎯", SUP: "🛡️" };
const ROLE_COLORS = { TOP: "#e74c3c", JGL: "#2ecc71", MID: "#9b59b6", BOT: "#e67e22", SUP: "#3498db" };

const TEAM_COLORS = {
  "Gen.G": "#aa8a00",
  "T1": "#e2012d",
  "Dplus KIA": "#0a2e6b",
  "BNK FearX": "#ff4655",
  "Kiwoom DRX": "#0064b4",
  "OKSavingsBank BRO": "#00a651",
  "DN SOOPers": "#1a1a2e",
  "KT Rolster": "#ff0000",
  "HLE": "#ff6b00",
  "NS": "#d4001e",
};

function computeRating(p) {
  const roleWeights = {
    TOP: { kda: 0.12, winRate: 0.18, dpm: 0.15, csm: 0.08, gd15: 0.15, kp: 0.08, dmgPct: 0.14, gpm: 0.10 },
    JGL: { kda: 0.14, winRate: 0.18, dpm: 0.08, csm: 0.03, gd15: 0.12, kp: 0.18, dmgPct: 0.07, gpm: 0.10, xpd15: 0.10 },
    MID: { kda: 0.12, winRate: 0.18, dpm: 0.15, csm: 0.10, gd15: 0.15, kp: 0.08, dmgPct: 0.12, gpm: 0.10 },
    BOT: { kda: 0.10, winRate: 0.18, dpm: 0.18, csm: 0.10, gd15: 0.12, kp: 0.08, dmgPct: 0.14, gpm: 0.10 },
    SUP: { kda: 0.15, winRate: 0.20, dpm: 0.03, csm: 0.0, gd15: 0.05, kp: 0.25, dmgPct: 0.02, gpm: 0.05, xpd15: 0.05, avgAssists: 0.20 },
  };
  const w = roleWeights[p.role] || roleWeights.MID;
  const norms = {
    kda: { min: 1.3, max: 7.0 },
    winRate: { min: 28, max: 92 },
    dpm: { min: 150, max: 920 },
    csm: { min: 0.8, max: 11 },
    gd15: { min: -460, max: 450 },
    kp: { min: 42, max: 78 },
    dmgPct: { min: 5, max: 30 },
    gpm: { min: 240, max: 560 },
    xpd15: { min: -320, max: 400 },
    avgAssists: { min: 0.5, max: 15 },
  };
  let score = 0;
  for (const [stat, weight] of Object.entries(w)) {
    const n = norms[stat];
    if (!n || p[stat] === undefined) continue;
    const normalized = Math.max(0, Math.min(1, (p[stat] - n.min) / (n.max - n.min)));
    score += normalized * weight;
  }
  return Math.round(score * 1000) / 10;
}

PLAYERS.forEach(p => { p.rating = computeRating(p); });

export default function LCKRanking() {
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [sortBy, setSortBy] = useState("rating");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = useMemo(() => {
    let list = selectedRole === "ALL" ? [...PLAYERS] : PLAYERS.filter(p => p.role === selectedRole);
    list.sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
    return list;
  }, [selectedRole, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const topPlayer = filtered[0];

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ opacity: 0.3, fontSize: 10 }}>▼</span>;
    return <span style={{ color: "#f0c040", fontSize: 10 }}>{sortDir === "desc" ? "▼" : "▲"}</span>;
  };

  return (
    <div style={{
      background: "#0a0a0f",
      minHeight: "100vh",
      fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
      color: "#e8e6e3",
      padding: 0,
      margin: 0,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Bebas+Neue&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #2a0a1e 100%)",
        borderBottom: "2px solid #f0c040",
        padding: "24px 32px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(240,192,64,0.03) 60px, rgba(240,192,64,0.03) 61px)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 42,
              letterSpacing: 4,
              color: "#f0c040",
              margin: 0,
              lineHeight: 1,
            }}>LCK 2026</h1>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18,
              fontWeight: 300,
              color: "rgba(240,192,64,0.6)",
              letterSpacing: 6,
              textTransform: "uppercase",
            }}>Player Rankings</span>
          </div>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 300,
            letterSpacing: 1,
          }}>
            LCK Cup 2026 · Composite Rating · {PLAYERS.length} Players · Updated April 2026
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Role Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["ALL", "TOP", "JGL", "MID", "BOT", "SUP"].map(role => (
            <button key={role} onClick={() => setSelectedRole(role)} style={{
              background: selectedRole === role
                ? (role === "ALL" ? "rgba(240,192,64,0.15)" : `${ROLE_COLORS[role]}22`)
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${selectedRole === role ? (role === "ALL" ? "#f0c040" : ROLE_COLORS[role]) : "rgba(255,255,255,0.08)"}`,
              color: selectedRole === role ? (role === "ALL" ? "#f0c040" : ROLE_COLORS[role]) : "rgba(255,255,255,0.5)",
              padding: "8px 18px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}>
              {role === "ALL" ? "ALL ROLES" : `${ROLE_ICONS[role]} ${role}`}
            </button>
          ))}
        </div>

        {/* Top Player Card */}
        {topPlayer && (
          <div style={{
            background: `linear-gradient(135deg, rgba(240,192,64,0.08) 0%, rgba(240,192,64,0.02) 100%)`,
            border: "1px solid rgba(240,192,64,0.2)",
            borderRadius: 8,
            padding: "20px 28px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 120,
              color: "rgba(240,192,64,0.05)",
              lineHeight: 1,
            }}>#1</div>
            <div style={{
              width: 64, height: 64,
              background: "linear-gradient(135deg, #f0c040, #d4a030)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              color: "#0a0a0f",
              flexShrink: 0,
            }}>1</div>
            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  color: "#f0c040",
                  letterSpacing: 2,
                }}>{topPlayer.name}</span>
                <span style={{
                  fontSize: 13,
                  color: ROLE_COLORS[topPlayer.role],
                  fontWeight: 600,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{ROLE_ICONS[topPlayer.role]} {topPlayer.role}</span>
                <span style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                }}>{topPlayer.team}</span>
              </div>
              <div style={{ display: "flex", gap: 32, marginTop: 8, flexWrap: "wrap" }}>
                {[
                  { label: "RATING", value: topPlayer.rating.toFixed(1), color: "#f0c040" },
                  { label: "KDA", value: topPlayer.kda.toFixed(1), color: "#fff" },
                  { label: "DPM", value: topPlayer.dpm, color: "#fff" },
                  { label: "WIN%", value: topPlayer.winRate + "%", color: topPlayer.winRate > 55 ? "#2ecc71" : "#fff" },
                  { label: "GD@15", value: (topPlayer.gd15 > 0 ? "+" : "") + topPlayer.gd15, color: topPlayer.gd15 > 0 ? "#2ecc71" : "#e74c3c" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: s.color, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(240,192,64,0.3)" }}>
                {[
                  { key: null, label: "#", w: 40 },
                  { key: null, label: "PLAYER", w: null },
                  { key: "rating", label: "RATING", w: 70 },
                  { key: "kda", label: "KDA", w: 55 },
                  { key: "avgKills", label: "K", w: 40 },
                  { key: "avgDeaths", label: "D", w: 40 },
                  { key: "avgAssists", label: "A", w: 40 },
                  { key: "csm", label: "CS/M", w: 55 },
                  { key: "dpm", label: "DPM", w: 55 },
                  { key: "dmgPct", label: "DMG%", w: 55 },
                  { key: "kp", label: "KP%", w: 55 },
                  { key: "gd15", label: "GD@15", w: 60 },
                  { key: "winRate", label: "WIN%", w: 55 },
                  { key: "games", label: "G", w: 35 },
                ].map(col => (
                  <th key={col.label} onClick={() => col.key && toggleSort(col.key)} style={{
                    padding: "10px 6px",
                    textAlign: col.label === "PLAYER" ? "left" : "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 2,
                    color: sortBy === col.key ? "#f0c040" : "rgba(255,255,255,0.4)",
                    cursor: col.key ? "pointer" : "default",
                    whiteSpace: "nowrap",
                    width: col.w || "auto",
                    userSelect: "none",
                    textTransform: "uppercase",
                  }}>
                    {col.label} {col.key && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const isSelected = selectedPlayer === p.name;
                const isHovered = hoveredRow === i;
                return (
                  <tr key={p.name + p.team}
                    onClick={() => setSelectedPlayer(isSelected ? null : p.name)}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isSelected ? "rgba(240,192,64,0.08)" : isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <span style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 16,
                        color: i < 3 ? "#f0c040" : i < 10 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                      }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: "10px 6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          fontSize: 11,
                          color: ROLE_COLORS[p.role],
                          fontWeight: 600,
                          opacity: 0.8,
                          width: 22,
                          textAlign: "center",
                        }}>{ROLE_ICONS[p.role]}</span>
                        <div>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: i < 3 ? "#f0c040" : "#e8e6e3",
                            letterSpacing: 0.5,
                          }}>{p.name}</div>
                          <div style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.3)",
                            fontWeight: 300,
                            marginTop: -1,
                          }}>{p.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 18,
                        color: p.rating >= 70 ? "#f0c040" : p.rating >= 55 ? "#e8e6e3" : "rgba(255,255,255,0.5)",
                        position: "relative",
                      }}>
                        {p.rating.toFixed(1)}
                        <div style={{
                          position: "absolute",
                          bottom: -2, left: "50%", transform: "translateX(-50%)",
                          height: 2,
                          width: `${Math.min(100, p.rating)}%`,
                          background: p.rating >= 70 ? "#f0c040" : p.rating >= 55 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                          borderRadius: 1,
                        }} />
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600, color: p.kda >= 5 ? "#2ecc71" : p.kda >= 3 ? "#e8e6e3" : "#e74c3c" }}>{p.kda.toFixed(1)}</td>
                    <td style={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.avgKills.toFixed(1)}</td>
                    <td style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{p.avgDeaths.toFixed(1)}</td>
                    <td style={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.avgAssists.toFixed(1)}</td>
                    <td style={{ textAlign: "center", color: p.csm >= 10 ? "#f0c040" : "rgba(255,255,255,0.6)" }}>{p.csm.toFixed(1)}</td>
                    <td style={{ textAlign: "center", color: p.dpm >= 800 ? "#f0c040" : "rgba(255,255,255,0.6)" }}>{p.dpm}</td>
                    <td style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>{p.dmgPct}%</td>
                    <td style={{ textAlign: "center", color: p.kp >= 73 ? "#3498db" : "rgba(255,255,255,0.6)" }}>{p.kp}%</td>
                    <td style={{
                      textAlign: "center",
                      fontWeight: 500,
                      color: p.gd15 > 200 ? "#2ecc71" : p.gd15 > 0 ? "rgba(46,204,113,0.6)" : p.gd15 > -200 ? "rgba(231,76,60,0.6)" : "#e74c3c",
                    }}>{(p.gd15 > 0 ? "+" : "") + p.gd15}</td>
                    <td style={{
                      textAlign: "center",
                      fontWeight: 600,
                      color: p.winRate >= 60 ? "#2ecc71" : p.winRate >= 45 ? "#e8e6e3" : "#e74c3c",
                    }}>{p.winRate}%</td>
                    <td style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{p.games}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Player Detail */}
        {selectedPlayer && (() => {
          const p = PLAYERS.find(x => x.name === selectedPlayer);
          if (!p) return null;
          const rank = filtered.findIndex(x => x.name === selectedPlayer) + 1;
          const allByRole = PLAYERS.filter(x => x.role === p.role).sort((a, b) => b.rating - a.rating);
          const roleRank = allByRole.findIndex(x => x.name === p.name) + 1;

          const bars = [
            { label: "KDA", value: p.kda, max: 7, color: "#f0c040" },
            { label: "DPM", value: p.dpm, max: 920, color: "#e74c3c" },
            { label: "CS/M", value: p.csm, max: 11, color: "#2ecc71" },
            { label: "KP%", value: p.kp, max: 80, color: "#3498db" },
            { label: "DMG%", value: p.dmgPct, max: 30, color: "#9b59b6" },
            { label: "GPM", value: p.gpm, max: 560, color: "#e67e22" },
          ];

          return (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(240,192,64,0.15)",
              borderRadius: 8,
              padding: "24px 28px",
              marginTop: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#f0c040", letterSpacing: 2 }}>{p.name}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: ROLE_COLORS[p.role], fontWeight: 600 }}>{ROLE_ICONS[p.role]} {p.role}</span>
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300, marginTop: 2 }}>
                    {p.team} · #{rank} Overall · #{roleRank} {p.role} · {p.games} games played
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 48,
                  color: "#f0c040",
                  lineHeight: 1,
                }}>{p.rating.toFixed(1)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 20 }}>
                {bars.map(b => (
                  <div key={b.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontWeight: 500 }}>{b.label}</span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: b.color }}>{typeof b.value === "number" && b.value % 1 !== 0 ? b.value.toFixed(1) : b.value}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(100, (b.value / b.max) * 100)}%`,
                        background: b.color,
                        borderRadius: 2,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
                {[
                  { l: "AVG LINE", v: `${p.avgKills.toFixed(1)} / ${p.avgDeaths.toFixed(1)} / ${p.avgAssists.toFixed(1)}` },
                  { l: "GD@15", v: (p.gd15 > 0 ? "+" : "") + p.gd15, c: p.gd15 > 0 ? "#2ecc71" : "#e74c3c" },
                  { l: "CSD@15", v: (p.csd15 > 0 ? "+" : "") + p.csd15, c: p.csd15 > 0 ? "#2ecc71" : "#e74c3c" },
                  { l: "GOLD%", v: p.goldPct + "%" },
                  { l: "XPD@15", v: (p.xpd15 > 0 ? "+" : "") + p.xpd15, c: p.xpd15 > 0 ? "#2ecc71" : "#e74c3c" },
                  { l: "WIN RATE", v: p.winRate + "%", c: p.winRate >= 55 ? "#2ecc71" : "#e74c3c" },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 500 }}>{s.l}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: s.c || "#e8e6e3", marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Barlow', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "rgba(255,255,255,0.35)" }}>Méthodologie du Rating</strong> — Score composite (0-100) basé sur des stats pondérées par rôle : KDA, DPM, CS/min, KP%, DMG%, GPM, GD@15, Win Rate. Les poids varient selon le rôle (ex: KP% plus important pour les supports, DPM pour les ADC).
          Données issues du LCK Cup 2026 via Games of Legends.
        </div>
      </div>
    </div>
  );
}
