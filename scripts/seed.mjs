// Weekly top-100 seed: pulls currently-played titles through the REAL verdict
// pipeline (GameData.searchGame -> local /api/live-game) and snapshots the
// built cards to src/data/seeded-games.json. No invented data: anything the
// pipeline cannot verify is skipped, never fabricated.
//
// Usage:
//   npm start                                  # terminal 1: local API (no key needed)
//   npm run seed                               # terminal 2: seed top 100
//   node scripts/seed.mjs --limit=5            # quick sample
//   SEED_API_BASE=http://localhost:3000 node scripts/seed.mjs
//
// Source: SteamSpy top100in2weeks (free, keyless). Falls back to an evergreen
// hand list when SteamSpy is unreachable.

const API_BASE = process.env.SEED_API_BASE || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FALLBACK_TOP = [
  'Counter-Strike 2', 'Dota 2', 'Elden Ring', "Baldur's Gate 3", 'Stardew Valley',
  'Cyberpunk 2077', 'Balatro', 'Hades II', 'Starfield', 'Red Dead Redemption 2',
  'The Witcher 3', 'Terraria', 'Factorio', 'RimWorld', 'Slay the Spire',
  'Portal 2', 'Hollow Knight', 'God of War', 'Helldivers 2', 'Black Myth: Wukong'
];

async function topNames(limit) {
  try {
    const r = await fetch('https://steamspy.com/api.php?request=top100in2weeks', {
      headers: { 'User-Agent': 'GameVerdict/2.0 (seed)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) throw new Error(`SteamSpy ${r.status}`);
    const body = await r.json();
    const names = Object.values(body).map((g) => g.name).filter(Boolean);
    if (names.length >= 10) return names.slice(0, limit);
    throw new Error('SteamSpy returned too few titles');
  } catch (err) {
    console.warn(`[seed] SteamSpy unavailable (${err.message}) — using evergreen fallback`);
    return FALLBACK_TOP.slice(0, limit);
  }
}

function parseArgs() {
  const out = { limit: 100 };
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--limit=(\d+)$/);
    if (m) out.limit = Math.max(1, Math.min(200, parseInt(m[1], 10)));
  }
  return out;
}

const { limit } = parseArgs();
globalThis.GAMEVERDICT_API_BASE = API_BASE;
const { GameData } = await import('../js/game-data.js');

// Sanity: the local API must answer before a long run burns time.
try {
  const probe = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(8000) });
  if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
} catch (err) {
  console.error(`[seed] Local API unreachable at ${API_BASE} (${err.message}). Run \`npm start\` first.`);
  process.exit(1);
}

const names = await topNames(limit);
console.log(`[seed] Seeding ${names.length} titles via ${API_BASE} …`);

const games = [];
let skipped = 0;
for (const [i, name] of names.entries()) {
  try {
    const card = await GameData.searchGame(name);
    if (card.unknownScores || card.coverage === 'estimated') {
      skipped++;
      console.log(`[seed] ${i + 1}/${names.length} SKIP (unverifiable): ${name}`);
    } else {
      games.push(card);
      console.log(`[seed] ${i + 1}/${names.length} OK: ${card.title} (${card.unifiedConsensusPercent}%, ${card.coverage})`);
    }
  } catch (err) {
    skipped++;
    console.log(`[seed] ${i + 1}/${names.length} SKIP (error): ${name} — ${err.message}`);
  }
  await sleep(2500); // stay polite to upstream Steam endpoints (avoids rate-limit aborts)
}

const { writeFileSync, mkdirSync } = await import('fs');
mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
writeFileSync(
  new URL('../src/data/seeded-games.json', import.meta.url),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: games.length, games }, null, 1)
);
console.log(`[seed] Wrote ${games.length} cards (skipped ${skipped}) to src/data/seeded-games.json`);
