// Cloudflare Pages Function: GET /api/live-game?q=<title>
// File-based routing maps this file to the /api/live-game path, so the
// frontend's existing fetch('/api/live-game?q=...') works with no changes.
// Runs on the Workers runtime: Web-standard APIs only (fetch, URL,
// AbortController, caches). No Node built-ins (http, fs, path, process).

const UA = { 'User-Agent': 'GameVerdict/2.0 (live-review-aggregator)' };

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

const jfetch = async (url, ms = 7000) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

/** CheapShark: price + metacritic score/link + steamAppID candidate */
async function cheapSharkLookup(query) {
  const deals = await jfetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(query)}&limit=8`);
  if (!Array.isArray(deals) || !deals.length) return null;
  const withSteam = deals.filter((d) => d.steamAppID && d.steamAppID !== '0');
  const ranked = (withSteam.length ? withSteam : deals).sort(
    (a, b) => (parseInt(b.steamRatingCount, 10) || 0) - (parseInt(a.steamRatingCount, 10) || 0),
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
    dealID: b.dealID || null,
  };
}

/** Resolve a Steam appID via store search when CheapShark has none */
async function steamSearchAppId(query) {
  const data = await jfetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=en&cc=US`);
  const items = data?.items;
  if (!Array.isArray(items) || !items.length) return null;
  const q = query.toLowerCase();
  const exact = items.find((i) => i.name?.toLowerCase() === q) || items[0];
  return exact?.id ? String(exact.id) : null;
}

async function steamAppDetails(appID) {
  const data = await jfetch(`https://store.steampowered.com/api/appdetails?appids=${appID}&l=en&cc=US`);
  return data?.[appID]?.success ? data[appID].data : null;
}

/** Real player reviews: summary + top helpful review texts */
async function steamReviews(appID) {
  const data = await jfetch(
    `https://store.steampowered.com/appreviews/${appID}?json=1&language=all&purchase_type=all&num_per_page=10&filter=all&summary_num_reviews=100`,
    8000,
  );
  if (!data?.query_summary) return null;
  const q = data.query_summary;
  const total = (q.total_positive || 0) + (q.total_negative || 0);
  const pct = total ? Math.round((q.total_positive / total) * 100) : null;
  const reviews = (data.reviews || [])
    .slice(0, 6)
    .map((r) => ({
      source: 'Steam',
      author: `Steam player (${Math.round((r.author?.playtime_forever || 0) / 60)} hrs)`,
      quote: (r.review || '').slice(0, 280),
      votes: r.votes_up || 0,
      votedUp: r.voted_up !== false,
      url: r.recommendationid ? `https://steamcommunity.com/id/reviews/` : null,
    }))
    .filter((r) => r.quote && r.quote.length > 40);
  return {
    percent: pct,
    text: q.review_score_desc || null,
    total,
    reviews,
  };
}

/** OpenCritic public API (best-effort, no key): search then score */
async function openCriticLookup(title, steamAppID) {
  try {
    const search = await jfetch(`https://api.opencritic.com/api/game/search?criteria=${encodeURIComponent(title)}`);
    const list = Array.isArray(search) ? search : search?.results || search?.games || null;
    if (!Array.isArray(list) || !list.length) return { score: null, reviews: [] };
    const q = title.toLowerCase();
    const game = list.find((g) => (g.name || '').toLowerCase() === q) || list[0];
    const id = game?.id;
    if (!id) return { score: null, reviews: [] };
    const detail = await jfetch(`https://api.opencritic.com/api/game/${id}`);
    const score = detail?.topCriticScore ?? detail?.averageScore ?? game?.topCriticScore ?? null;
    const reviews = (detail?.reviews || game?.reviews || [])
      .slice(0, 4)
      .map((r) => ({
        source: 'OpenCritic',
        author: r.outletName || r.publication?.name || r.author || 'Critic',
        quote: (r.snippet || r.quote || r.title || '').slice(0, 280),
        score: r.score ?? null,
        url: r.externalUrl || (r.url ? `https://opencritic.com${r.url}` : 'https://opencritic.com'),
      }))
      .filter((r) => r.quote && r.quote.length > 30);
    return { score: typeof score === 'number' ? Math.round(score) : null, url: `https://opencritic.com/game/${id}/a`, reviews };
  } catch {
    return { score: null, reviews: [] };
  }
}

/**
 * Aggregates: CheapShark (price/Metacritic) + Steam store (metadata, real
 * reviews) + OpenCritic (critic score/quotes). Same shape as server.js.
 */
async function fetchLiveGameFromWeb(query) {
  const cs = await cheapSharkLookup(query);
  let appID = cs?.steamAppID || null;
  if (!appID) appID = await steamSearchAppId(query);
  if (!appID && !cs) return null;

  const [details, steamRev] = appID
    ? await Promise.all([steamAppDetails(appID), steamReviews(appID)])
    : [null, null];
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
    genres: (details?.genres || []).map((g) => g.description).slice(0, 4),
    headerImg:
      details?.header_image ||
      (appID ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appID}/header.jpg` : cs?.thumb),
    platforms,
    steamRatingPercent: steamPct,
    steamRatingText: steamText,
    steamRatingCount: steamCount,
    steamReviews: steamRev?.reviews || [],
    metacriticScore: metaScore,
    metacriticLink: cs?.metacriticLink || null,
    openCriticScore: oc.score,
    openCriticUrl: oc.url || null,
    openCriticReviews: oc.reviews || [],
    salePrice: cs?.salePrice ?? null,
    normalPrice: details?.price_overview?.final ? details.price_overview.final / 100 : (cs?.normalPrice ?? 59.99),
    priceText: details?.price_overview?.final_formatted || null,
    thumb: cs?.thumb || null,
    sources: [
      steamPct != null && 'Steam',
      metaScore != null && 'Metacritic',
      oc.score != null && 'OpenCritic',
      'CheapShark',
    ].filter(Boolean),
  };
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
  const query = url.searchParams.get('q') || url.searchParams.get('query') || '';
  if (!query.trim()) {
    return json({ error: 'Missing query parameter "q"' }, 400);
  }

  // Cache successful lookups at the edge for 1 hour (key includes the query).
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = cache ? new Request(url.toString(), request) : null;
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const liveData = await fetchLiveGameFromWeb(query.trim());

  if (!liveData) {
    // Don't cache misses: the game may appear in upstream APIs later.
    return json({ success: false, query, data: null });
  }

  const res = json({ success: true, query, data: liveData }, 200, {
    'Cache-Control': 'public, max-age=3600',
  });
  if (cache) {
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res;
}
