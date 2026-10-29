/**
 * Sync primitives between localStorage state and Supabase. Supabase is
 * always configured; every op requires a live client and (for writes and
 * private reads) a signed-in user, else `{ ok: false, error }`.
 */
import { db, currentUserId } from './supabase-client.js';

/** Last-write-wins merge on a key field. Pure — covered by golden tests. */
export function mergeRows(localRows, remoteRows, key, stamp) {
  const out = new Map();
  for (const r of remoteRows || []) out.set(r[key], { ...r });
  for (const r of localRows || []) {
    const prev = out.get(r[key]);
    if (!prev || (r[stamp] || 0) >= (prev[stamp] || 0)) out.set(r[key], { ...r });
  }
  return [...out.values()];
}

function needClient() {
  const client = db();
  return client ? { client } : { error: 'Cloud sync is unavailable — reload and try again.' };
}

async function authed() {
  const { client, error } = needClient();
  if (error) return { ok: false, error };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: 'Sign in to sync your library across devices.' };
  return { client, userId };
}

/** Push local wishlist + manual games + prefs. */
export async function pushLocal({ wishlist, manualGames, prefs }) {
  const a = await authed();
  if (a.error) return a;
  const { client, userId } = a;
  let pushed = 0;
  if (wishlist?.length) {
    const { error } = await client.from('wishlist_items').upsert(
      wishlist.map((w) => ({ user_id: userId, game_id: w.id, title: w.title, price: w.price, added_at: w.addedAt || 0 }))
    );
    if (!error) pushed += wishlist.length;
  }
  if (manualGames?.length) {
    const { error } = await client.from('manual_games').upsert(
      manualGames.map((m) => ({ user_id: userId, id: m.id, name: m.name, est_main_hrs: m.estMainHrs, playtime_mins: m.playtimeMins || 0 }))
    );
    if (!error) pushed += manualGames.length;
  }
  if (prefs) {
    await client.from('prefs').upsert({ user_id: userId, weekly_hours: prefs.weeklyHours ?? null, device: prefs.device ?? null });
  }
  return { ok: true, pushed };
}

/** Pull remote rows and merge over local by timestamp. */
export async function pullRemote(local) {
  const a = await authed();
  if (a.error) return a;
  const { client, userId } = a;
  const [w, m, p] = await Promise.all([
    client.from('wishlist_items').select('*').eq('user_id', userId),
    client.from('manual_games').select('*').eq('user_id', userId),
    client.from('prefs').select('*').eq('user_id', userId).maybeSingle()
  ]);
  return {
    ok: true,
    wishlist: mergeRows(
      local.wishlist || [],
      (w.data || []).map((r) => ({ id: r.game_id, title: r.title, price: Number(r.price), addedAt: r.added_at || 0 })),
      'id', 'addedAt'
    ),
    manualGames: mergeRows(
      local.manualGames || [],
      (m.data || []).map((r) => ({ id: r.id, name: r.name, estMainHrs: Number(r.est_main_hrs), playtimeMins: Number(r.playtime_mins) || 0 })),
      'id', 'addedAt'
    ),
    prefs: p.data ? { weeklyHours: p.data.weekly_hours, device: p.data.device } : null
  };
}

/** Submit (or update) my 1–10 rating for a game. */
export async function submitRating(gameKey, score) {
  const s = Number(score);
  if (!(s >= 1 && s <= 10)) return { ok: false, error: 'Score must be 1–10.' };
  const a = await authed();
  if (a.error) return a;
  const { error } = await a.client.from('ratings').upsert({ user_id: a.userId, game_key: gameKey, score: s });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Community average for a game. Public read — works signed out. */
export async function communityAverage(gameKey) {
  const { client, error } = needClient();
  if (error) return { ok: false, error };
  const { data, error: qerr } = await client.from('rating_averages').select('*').eq('game_key', gameKey).maybeSingle();
  if (qerr || !data) return { ok: true, avg: null, votes: 0 };
  return { ok: true, avg: Number(data.avg_score), votes: data.votes };
}

/** Top community-rated games by vote count. Public read — works signed out. */
export async function topCommunity(limit = 5) {
  const { client, error } = needClient();
  if (error) return { ok: false, error };
  const n = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const { data, error: qerr } = await client
    .from('rating_averages').select('*').order('votes', { ascending: false }).limit(n);
  if (qerr) return { ok: false, error: qerr.message };
  return { ok: true, rows: data || [] };
}

/** Load a shareable verdict snapshot by id. Public read — works signed out. */
export async function fetchSnapshot(id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ''))) return { ok: false, error: 'That shared verdict link is invalid.' };
  const { client, error } = needClient();
  if (error) return { ok: false, error };
  const { data, error: qerr } = await client.from('verdict_snapshots').select('*').eq('id', id).maybeSingle();
  if (qerr || !data) return { ok: false, error: 'That shared verdict link is invalid or expired.' };
  return { ok: true, snapshot: data };
}

/** Persist a shareable verdict snapshot. Returns { id } for future ?v= links. */
export async function saveSnapshot(game) {
  const a = await authed();
  if (a.error) return a;
  const { data, error } = await a.client.from('verdict_snapshots').insert({
    user_id: a.userId,
    game_key: game.id,
    title: game.title,
    score: game.unifiedConsensusPercent,
    badge: game.verdictBadge,
    card: game
  }).select('id').single();
  return error ? { ok: false, error: error.message } : { ok: true, id: data.id };
}

/** Watchlist upsert for the (future) weekly price cron. */
export async function watchPrice({ gameKey, title, targetPrice, webhook }) {
  const a = await authed();
  if (a.error) return a;
  const { error } = await a.client.from('watchlists').upsert({
    user_id: a.userId, game_key: gameKey, title,
    target_price: targetPrice ?? null, webhook: webhook || null
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
