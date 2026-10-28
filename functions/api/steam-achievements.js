// Cloudflare Pages Function: GET /api/steam-achievements?steamid=<17-digit>&appid=<id>
// Needs a STEAM_API_KEY env var. One game per call — fetch on demand only.

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
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'GameVerdict/2.0 (achievements)' } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

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
    return json({ error: 'Steam API key not configured. Set STEAM_API_KEY.' }, 503);
  }

  const url = new URL(request.url);
  const steamId = (url.searchParams.get('steamid') || '').trim();
  const appId = (url.searchParams.get('appid') || '').trim();
  if (!/^\d{17,}$/.test(steamId) || !/^\d+$/.test(appId)) {
    return json({ error: 'Missing query parameters "steamid" (17-digit) and "appid"' }, 400);
  }

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = cache ? new Request(url.toString(), request) : null;
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const data = await jfetch(
    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${key}&steamid=${steamId}`
  );
  const list = data?.playerstats?.achievements;
  if (!Array.isArray(list)) {
    return json({
      success: false,
      steamId,
      appId: Number(appId),
      error: 'No achievements found (private profile or no achievements in this game).',
    });
  }

  const res = json(
    { success: true, steamId, appId: Number(appId), total: list.length, unlocked: list.filter((a) => a.achieved === 1).length },
    200,
    { 'Cache-Control': 'public, max-age=3600' }
  );
  if (cache) {
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res;
}
