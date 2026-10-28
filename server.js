import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const UA = { 'User-Agent': 'GameVerdict/2.0 (live-review-aggregator)' };
const jfetch = async (url, ms = 7000) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(t); }
};

/** CheapShark: price + metacritic score/link + steamAppID candidate */
async function cheapSharkLookup(query) {
  const deals = await jfetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(query)}&limit=8`);
  if (!Array.isArray(deals) || !deals.length) return null;
  const withSteam = deals.filter(d => d.steamAppID && d.steamAppID !== '0');
  const ranked = (withSteam.length ? withSteam : deals).sort(
    (a, b) => (parseInt(b.steamRatingCount, 10) || 0) - (parseInt(a.steamRatingCount, 10) || 0)
  );
  const b = ranked[0];
  return {
    title: b.title,
    steamAppID: b.steamAppID && b.steamAppID !== '0' ? String(b.steamAppID) : null,
    steamRatingPercent: parseInt(b.steamRatingPercent, 10) || null,
    steamRatingText: b.steamRatingText || null,
    steamRatingCount: parseInt(b.steamRatingCount, 10) || 0,
    metacriticScore: parseInt(b.metacriticScore, 10) || null,
    metacriticLink: b.metacriticLink ? `https://www.metacritic.com${b.metacriticLink}` : null,
    salePrice: parseFloat(b.salePrice) || null,
    normalPrice: parseFloat(b.normalPrice) || 59.99,
    thumb: b.thumb || null,
    dealID: b.dealID || null
  };
}

/** Resolve a Steam appID via store search when CheapShark has none */
async function steamSearchAppId(query) {
  const data = await jfetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=en&cc=US`);
  const items = data?.items;
  if (!Array.isArray(items) || !items.length) return null;
  const q = query.toLowerCase();
  const exact = items.find(i => i.name?.toLowerCase() === q) || items[0];
  return exact?.id ? String(exact.id) : null;
}

async function steamAppDetails(appID) {
  const data = await jfetch(`https://store.steampowered.com/api/appdetails?appids=${appID}&l=en&cc=US`);
  return data?.[appID]?.success ? data[appID].data : null;
}

/** Real player reviews: summary + top helpful review texts (with raw playtime for median-hours). */
async function steamReviews(appID) {
  const data = await jfetch(
    `https://store.steampowered.com/appreviews/${appID}?json=1&language=all&purchase_type=all&num_per_page=20&filter=all&summary_num_reviews=100`,
    8000
  );
  if (!data?.query_summary) return null;
  const q = data.query_summary;
  const total = (q.total_positive || 0) + (q.total_negative || 0);
  const pct = total ? Math.round((q.total_positive / total) * 100) : null;
  const reviews = (data.reviews || []).slice(0, 8).map(r => ({
    source: 'Steam',
    author: `Steam player (${Math.round((r.author?.playtime_forever || 0) / 60)} hrs)`,
    quote: (r.review || '').slice(0, 280),
    votes: r.votes_up || 0,
    votedUp: r.voted_up !== false,
    playtimeMins: typeof r.author?.playtime_forever === 'number' ? r.author.playtime_forever : null,
    url: r.recommendationid ? `https://steamcommunity.com/id/reviews/` : null
  })).filter(r => r.quote && r.quote.length > 40);
  return {
    percent: pct,
    text: q.review_score_desc || null,
    total,
    reviews
  };
}

/** Recent-sample trend: % positive across the 20 most recent reviews (n-guarded upstream). */
async function steamRecentSample(appID) {
  const data = await jfetch(
    `https://store.steampowered.com/appreviews/${appID}?json=1&language=all&purchase_type=all&num_per_page=20&filter=recent`,
    8000
  );
  const list = Array.isArray(data?.reviews) ? data.reviews : [];
  const votes = list.filter(r => typeof r.voted_up === 'boolean');
  if (!votes.length) return null;
  const up = votes.filter(r => r.voted_up).length;
  return { pct: Math.round((up / votes.length) * 100), n: votes.length };
}

/** ProtonDB Deck tier: real handheld signal instead of a static guess. */
async function protonLookup(appID) {
  if (!appID) return null;
  const data = await jfetch(`https://www.protondb.com/api/v1/reports/summaries/${appID}.json`);
  if (!data?.tier) return null;
  return { tier: String(data.tier), total: data.total || 0 };
}

const COOP_TAGS = ['co-op', 'online co-op', 'lan co-op', 'shared/split screen', 'remote play together', 'cross-platform multiplayer'];

/** Store-category signals: controller/co-op feature flags, IAP, age + descriptors. Null-safe. */
function extractStoreSignals(details) {
  if (!details) return { features: null, family: null, hasInAppPurchases: null };
  const cats = Array.isArray(details.categories) ? details.categories.map(c => c.description || '') : [];
  const lower = cats.map(c => c.toLowerCase());
  const controller = lower.some(c => /full controller support/.test(c)) ? 'full'
    : lower.some(c => /partial controller/.test(c)) ? 'partial' : null;
  const coop = cats.filter(c => COOP_TAGS.some(t => c.toLowerCase().includes(t)));
  const cd = details.content_descriptors;
  const descriptors = Array.isArray(cd) ? [] : (cd?.notes ? [cd.notes] : []);
  const ageRaw = details.required_age;
  const requiredAge = ageRaw != null && String(ageRaw).trim() !== '' ? parseInt(ageRaw, 10) : null;
  return {
    features: { controller, coop },
    family: (requiredAge != null || descriptors.length) ? { requiredAge, descriptors } : null,
    hasInAppPurchases: cats.length ? lower.some(c => /in-app purchases/.test(c)) : null
  };
}

const STEAM_KEY = process.env.STEAM_API_KEY || '';

/** Resolve a vanity name to a SteamID64 (needs STEAM_API_KEY). */
async function resolveVanity(vanity) {
  if (!STEAM_KEY) return null;
  const data = await jfetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_KEY}&vanityurl=${encodeURIComponent(vanity)}`);
  return data?.response?.steamid || null;
}

/** Owned library: persona + games with playtime and last-played timestamps. */
async function steamLibraryById(steamId) {
  const [summary, owned, recent] = await Promise.all([
    jfetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamId}`),
    jfetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`),
    jfetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_KEY}&steamid=${steamId}&count=10`)
  ]);
  const player = summary?.response?.players?.[0] || null;
  const rawGames = owned?.response?.games;
  const games = Array.isArray(rawGames) ? rawGames.map(g => ({
    appid: g.appid,
    name: g.name || `App ${g.appid}`,
    playtimeMins: g.playtime_forever || 0,
    playtime2wksMins: g.playtime_2weeks || 0,
    rtimeLastPlayed: g.rtime_last_played || 0
  })) : null; // null = private or unreachable, [] = genuinely empty
  const recentGames = Array.isArray(recent?.response?.games) ? recent.response.games.map(g => ({
    appid: g.appid,
    name: g.name || `App ${g.appid}`,
    playtime2wksMins: g.playtime_2weeks || 0,
    playtimeMins: g.playtime_forever || 0
  })) : [];
  return {
    steamId,
    persona: player ? { name: player.personaname || 'Steam player', avatar: player.avatarmedium || null } : null,
    gameCount: owned?.response?.game_count ?? (games ? games.length : 0),
    games,
    recent: recentGames
  };
}

/** Batched store details for owned games (public API, no key). Capped upstream. */
async function steamDetailsBatch(ids) {
  const data = await jfetch(`https://store.steampowered.com/api/appdetails?appids=${ids.join(',')}&l=en&cc=US`, 10000);
  return ids.map(id => {
    const d = data?.[String(id)]?.success ? data[String(id)].data : null;
    if (!d) return { appid: id, ok: false };
    return {
      appid: id,
      ok: true,
      name: d.name || `App ${id}`,
      genres: (d.genres || []).map(g => g.description).slice(0, 4),
      developers: (d.developers || []).slice(0, 2),
      header: d.header_image || null,
      ...extractStoreSignals(d),
      metacritic: d.metacritic?.score ? { score: d.metacritic.score, url: d.metacritic.url || null } : null
    };
  });
}

/** OpenCritic public API (best-effort, no key): search then score */
async function openCriticLookup(title, steamAppID) {
  try {
    const search = await jfetch(`https://api.opencritic.com/api/game/search?criteria=${encodeURIComponent(title)}`);
    const list = Array.isArray(search) ? search : search?.results || search?.games || null;
    if (!Array.isArray(list) || !list.length) return { score: null, reviews: [] };
    const q = title.toLowerCase();
    const game = list.find(g => (g.name || '').toLowerCase() === q) || list[0];
    const id = game?.id;
    if (!id) return { score: null, reviews: [] };
    const detail = await jfetch(`https://api.opencritic.com/api/game/${id}`);
    const score = detail?.topCriticScore ?? detail?.averageScore ?? game?.topCriticScore ?? null;
    const reviews = (detail?.reviews || game?.reviews || []).slice(0, 4).map(r => ({
      source: 'OpenCritic',
      author: r.outletName || r.publication?.name || r.author || 'Critic',
      quote: (r.snippet || r.quote || r.title || '').slice(0, 280),
      score: r.score ?? null,
      url: r.externalUrl || (r.url ? `https://opencritic.com${r.url}` : 'https://opencritic.com')
    })).filter(r => r.quote && r.quote.length > 30);
    return { score: typeof score === 'number' ? Math.round(score) : null, url: `https://opencritic.com/game/${id}/a`, reviews };
  } catch { return { score: null, reviews: [] }; }
}

/**
 * GET /api/live-game?q=<title>
 * Aggregates: CheapShark (price/Metacritic) + Steam store (metadata, real reviews) + OpenCritic (critic score/quotes)
 */
async function fetchLiveGameFromWeb(query) {
  const cs = await cheapSharkLookup(query);
  let appID = cs?.steamAppID || null;
  if (!appID) appID = await steamSearchAppId(query);
  if (!appID && !cs) return null;

  const [details, steamRev, steamRecent, proton] = appID
    ? await Promise.all([steamAppDetails(appID), steamReviews(appID), steamRecentSample(appID), protonLookup(appID)])
    : [null, null, null, null];
  const oc = await openCriticLookup(cs?.title || details?.name || query, appID);

  const title = details?.name || cs?.title || query;
  const steamPct = steamRev?.percent ?? cs?.steamRatingPercent ?? null;
  const steamText = steamRev?.text ?? cs?.steamRatingText ?? 'Unknown';
  const steamCount = steamRev?.total ?? cs?.steamRatingCount ?? 0;
  const metaScore = cs?.metacriticScore ?? null;

  const platforms = [];
  if (details?.platforms?.windows) platforms.push('PC (Steam)');
  if (details?.platforms?.mac) platforms.push('Mac');
  if (details?.platforms?.linux) platforms.push('Linux/Deck');
  if (!platforms.length && cs) platforms.push('PC (Steam)', 'Windows');

  return {
    title,
    steamAppID: appID,
    developer: details?.developers?.join(', ') || null,
    publisher: details?.publishers?.join(', ') || null,
    releaseDate: details?.release_date?.date || null,
    genres: (details?.genres || []).map(g => g.description).slice(0, 4),
    headerImg: details?.header_image || (appID ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appID}/header.jpg` : cs?.thumb),
    platforms,
    steamRatingPercent: steamPct,
    steamRatingText: steamText,
    steamRatingCount: steamCount,
    steamReviews: steamRev?.reviews || [],
    steamRecent: steamRecent || null,
    deckProton: proton || null,
    ...extractStoreSignals(details),
    metacriticScore: metaScore,
    metacriticLink: cs?.metacriticLink || null,
    openCriticScore: oc.score,
    openCriticUrl: oc.url || null,
    openCriticReviews: oc.reviews || [],
    salePrice: cs?.salePrice ?? null,
    normalPrice: details?.price_overview?.final
      ? details.price_overview.final / 100
      : (cs?.normalPrice ?? 59.99),
    priceText: details?.price_overview?.final_formatted || null,
    thumb: cs?.thumb || null,
    sources: [
      steamPct != null && 'Steam',
      metaScore != null && 'Metacritic',
      oc.score != null && 'OpenCritic',
      'CheapShark'
    ].filter(Boolean)
  };
}

/** In-memory cache for live lookups (1h TTL, max 100 entries). */
const liveCache = new Map();
const LIVE_CACHE_TTL_MS = 60 * 60 * 1000;
function cacheGet(key) {
  const hit = liveCache.get(key);
  if (hit && Date.now() - hit.ts < LIVE_CACHE_TTL_MS) return hit.data;
  liveCache.delete(key);
  return null;
}
function cacheSet(key, data) {
  liveCache.set(key, { data, ts: Date.now() });
  if (liveCache.size > 100) liveCache.delete(liveCache.keys().next().value);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (reqUrl.pathname === '/api/live-game') {
    const query = reqUrl.searchParams.get('q') || reqUrl.searchParams.get('query') || '';
    if (!query.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameter "q"' }));
      return;
    }
    const key = query.trim().toLowerCase();
    const cached = cacheGet(key);
    if (cached) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'HIT' });
      res.end(JSON.stringify({ success: true, query, data: cached, cached: true }));
      return;
    }
    const liveData = await fetchLiveGameFromWeb(query.trim());
    if (liveData) cacheSet(key, liveData);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'MISS' });
    res.end(JSON.stringify({ success: !!liveData, query, data: liveData }));
    return;
  }

  if (reqUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, steamKey: !!STEAM_KEY }));
    return;
  }

  if (reqUrl.pathname === '/api/steam-library') {
    const input = (reqUrl.searchParams.get('input') || '').trim();
    if (!input) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameter "input"' }));
      return;
    }
    if (!STEAM_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Steam API key not configured. Set STEAM_API_KEY (free at steamcommunity.com/dev/apikey).' }));
      return;
    }
    let steamId = /^\d{17,}$/.test(input) ? input : null;
    if (!steamId) {
      const vanity = (input.match(/steamcommunity\.com\/id\/([^/?#]+)/i)?.[1] || input).replace(/\/+$/, '');
      steamId = await resolveVanity(vanity);
    }
    if (!steamId) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Steam profile not found. Check the URL, ID, or vanity name.' }));
      return;
    }
    const cacheKey = `lib:${steamId}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'HIT' });
      res.end(JSON.stringify({ success: true, cached: true, ...cached }));
      return;
    }
    const lib = await steamLibraryById(steamId);
    if (lib.games == null) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, steamId, private: true, error: 'Game library is private. Set the Steam profile game details to Public.' }));
      return;
    }
    cacheSet(cacheKey, lib);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'MISS' });
    res.end(JSON.stringify({ success: true, ...lib }));
    return;
  }

  if (reqUrl.pathname === '/api/steam-details') {
    const ids = (reqUrl.searchParams.get('ids') || '').split(',')
      .map(s => s.trim()).filter(s => /^\d+$/.test(s)).slice(0, 40)
      .map(Number);
    if (!ids.length) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameter "ids" (comma-separated Steam app IDs, max 40)' }));
      return;
    }
    const cacheKey = `det:${[...ids].sort((a, b) => a - b).join(',')}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400', 'X-Cache': 'HIT' });
      res.end(JSON.stringify({ success: true, cached: true, details: cached }));
      return;
    }
    const details = await steamDetailsBatch(ids);
    cacheSet(cacheKey, details);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400', 'X-Cache': 'MISS' });
    res.end(JSON.stringify({ success: true, details }));
    return;
  }

  if (reqUrl.pathname === '/api/steam-achievements') {
    const steamId = (reqUrl.searchParams.get('steamid') || '').trim();
    const appId = (reqUrl.searchParams.get('appid') || '').trim();
    if (!/^\d{17,}$/.test(steamId) || !/^\d+$/.test(appId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameters "steamid" (17-digit) and "appid"' }));
      return;
    }
    if (!STEAM_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Steam API key not configured. Set STEAM_API_KEY.' }));
      return;
    }
    const cacheKey = `ach:${steamId}:${appId}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'HIT' });
      res.end(JSON.stringify({ success: true, cached: true, ...cached }));
      return;
    }
    const data = await jfetch(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_KEY}&steamid=${steamId}`);
    const list = data?.playerstats?.achievements;
    if (!Array.isArray(list)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, steamId, appId: Number(appId), error: 'No achievements found (private profile or no achievements in this game).' }));
      return;
    }
    const result = { steamId, appId: Number(appId), total: list.length, unlocked: list.filter(a => a.achieved === 1).length };
    cacheSet(cacheKey, result);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Cache': 'MISS' });
    res.end(JSON.stringify({ success: true, ...result }));
    return;
  }

  // Static frontend: prefer Vite build output (dist/), fall back to repo root (dev sources)
  const distDir = path.join(__dirname, 'dist');
  const useDist = fs.existsSync(path.join(distDir, 'index.html'));
  const baseDir = useDist ? distDir : __dirname;
  const rel = reqUrl.pathname === '/' ? 'index.html' : decodeURIComponent(reqUrl.pathname.slice(1));

  let filePath = path.join(baseDir, rel);
  if (!path.resolve(filePath).startsWith(path.resolve(baseDir))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  // SPA fallback: unknown paths serve index.html (preserves #game= deep links on refresh)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(baseDir, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.code}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🎮 GameVerdict Server running live at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`⚡ Live multi-source API: http://localhost:${PORT}/api/live-game?q=cyberpunk\n`);
});
