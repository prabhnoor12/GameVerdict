// Cloudflare Pages Function: GET /api/steam-library?input=<steamid|vanity|profile url>
// Needs a STEAM_API_KEY env var (free at https://steamcommunity.com/dev/apikey).

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', ...extraHeaders },
  });

const jfetch = async (url, ms = 8000) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'GameVerdict/2.0 (library-import)' } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

async function resolveVanity(key, vanity) {
  const data = await jfetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${encodeURIComponent(vanity)}`
  );
  return data?.response?.steamid || null;
}

async function steamLibraryById(key, steamId) {
  const [summary, owned, recent] = await Promise.all([
    jfetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`),
    jfetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    ),
    jfetch(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${steamId}&count=10`
    ),
  ]);
  const player = summary?.response?.players?.[0] || null;
  const rawGames = owned?.response?.games;
  const games = Array.isArray(rawGames)
    ? rawGames.map((g) => ({
        appid: g.appid,
        name: g.name || `App ${g.appid}`,
        playtimeMins: g.playtime_forever || 0,
        playtime2wksMins: g.playtime_2weeks || 0,
        rtimeLastPlayed: g.rtime_last_played || 0,
      }))
    : null;
  const recentGames = Array.isArray(recent?.response?.games)
    ? recent.response.games.map((g) => ({
        appid: g.appid,
        name: g.name || `App ${g.appid}`,
        playtime2wksMins: g.playtime_2weeks || 0,
        playtimeMins: g.playtime_forever || 0,
      }))
    : [];
  return {
    steamId,
    persona: player ? { name: player.personaname || 'Steam player', avatar: player.avatarmedium || null } : null,
    gameCount: owned?.response?.game_count ?? (games ? games.length : 0),
    games,
    recent: recentGames,
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const key = env?.STEAM_API_KEY || '';
  if (!key) {
    return json({ error: 'Steam API key not configured. Set STEAM_API_KEY (free at steamcommunity.com/dev/apikey).' }, 503);
  }

  const url = new URL(request.url);
  const input = (url.searchParams.get('input') || '').trim();
  if (!input) {
    return json({ error: 'Missing query parameter "input"' }, 400);
  }

  let steamId = /^\d{17,}$/.test(input) ? input : null;
  if (!steamId) {
    const vanity = (input.match(/steamcommunity\.com\/id\/([^/?#]+)/i)?.[1] || input).replace(/\/+$/, '');
    steamId = await resolveVanity(key, vanity);
  }
  if (!steamId) {
    return json({ error: 'Steam profile not found. Check the URL, ID, or vanity name.' }, 404);
  }

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = cache ? new Request(url.toString(), request) : null;
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const lib = await steamLibraryById(key, steamId);
  if (lib.games == null) {
    return json({ success: false, steamId, private: true, error: 'Game library is private. Set the Steam profile game details to Public.' });
  }

  const res = json({ success: true, ...lib }, 200, { 'Cache-Control': 'public, max-age=3600' });
  if (cache) {
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res;
}
