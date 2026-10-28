// Cloudflare Pages Function: GET /api/steam-details?ids=1,2,3 (max 40)
// Public Steam store API, no key needed.

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

const jfetch = async (url, ms = 10000) => {
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

const COOP_TAGS = ['co-op', 'online co-op', 'lan co-op', 'shared/split screen', 'remote play together', 'cross-platform multiplayer'];

/** Store-category signals: controller/co-op feature flags, IAP, age + descriptors. Null-safe. */
function extractStoreSignals(details) {
  if (!details) return { features: null, family: null, hasInAppPurchases: null };
  const cats = Array.isArray(details.categories) ? details.categories.map((c) => c.description || '') : [];
  const lower = cats.map((c) => c.toLowerCase());
  const controller = lower.some((c) => /full controller support/.test(c))
    ? 'full'
    : lower.some((c) => /partial controller/.test(c))
      ? 'partial'
      : null;
  const coop = cats.filter((c) => COOP_TAGS.some((t) => c.toLowerCase().includes(t)));
  const cd = details.content_descriptors;
  const descriptors = Array.isArray(cd) ? [] : cd?.notes ? [cd.notes] : [];
  const ageRaw = details.required_age;
  const requiredAge = ageRaw != null && String(ageRaw).trim() !== '' ? parseInt(ageRaw, 10) : null;
  return {
    features: { controller, coop },
    family: requiredAge != null || descriptors.length ? { requiredAge, descriptors } : null,
    hasInAppPurchases: cats.length ? lower.some((c) => /in-app purchases/.test(c)) : null,
  };
}

async function steamDetailsBatch(ids) {
  const data = await jfetch(`https://store.steampowered.com/api/appdetails?appids=${ids.join(',')}&l=en&cc=US`);
  return ids.map((id) => {
    const d = data?.[String(id)]?.success ? data[String(id)].data : null;
    if (!d) return { appid: id, ok: false };
    return {
      appid: id,
      ok: true,
      name: d.name || `App ${id}`,
      genres: (d.genres || []).map((g) => g.description).slice(0, 4),
      developers: (d.developers || []).slice(0, 2),
      header: d.header_image || null,
      ...extractStoreSignals(d),
      metacritic: d.metacritic?.score ? { score: d.metacritic.score, url: d.metacritic.url || null } : null,
    };
  });
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const ids = (url.searchParams.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .slice(0, 40)
    .map(Number);
  if (!ids.length) {
    return json({ error: 'Missing query parameter "ids" (comma-separated Steam app IDs, max 40)' }, 400);
  }

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = cache ? new Request(url.toString(), request) : null;
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const details = await steamDetailsBatch(ids);
  const res = json({ success: true, details }, 200, { 'Cache-Control': 'public, max-age=86400' });
  if (cache) {
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res;
}
