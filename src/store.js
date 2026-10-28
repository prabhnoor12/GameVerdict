import { reactive, computed } from 'vue';
import { GameData } from '../js/game-data.js';
import seedData from './data/seeded-games.json';

GameData.setSeedPool(seedData.games || [], { generatedAt: seedData.generatedAt || null, count: seedData.count || 0 });

const WISHLIST_KEY = 'gv:wishlist:v1';
const LIBRARY_KEY = 'gv:steam-library:v1';
const MANUAL_KEY = 'gv:manual-games:v1';

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const store = reactive({
  query: '',
  currentGame: GameData.CURATED_GAMES[0],
  activeFilter: 'all',
  sortBy: 'consensus',
  weeklyHours: 8,
  useSalePrice: true,
  hoursMode: 'main', // 'main' | 'completionist'
  isLoading: false,
  searchError: '',
  suggestions: [],
  wishlist: loadWishlist(),
  compareList: [],
  steamInput: '',
  steamLibrary: loadJson(LIBRARY_KEY, null),
  manualGames: loadJson(MANUAL_KEY, []),
  libraryDetails: {},
  libraryLoading: false,
  libraryError: '',
  enrichProgress: '',
  achievements: {},
  priceDrops: [],
  checkingPrices: false,
  priceDropBadge: 0,
  lastPriceCheckAt: 0,
  syncUrl: '',
  syncKey: '',
  syncStatus: 'disconnected',
  syncError: '',
  syncing: false,
  myRatings: {},
  device: loadJson('gv:device:v1', 'pc'),
  onboarded: loadJson('gv:onboarded:v1', false),
  showLibrary: false,
  showWishlist: false,
  showCoffee: false,
  toastMsg: '',
  toastVisible: false,
  presets: GameData.FILTER_PRESETS
});

let toastTimer = null;
const toastQueue = [];
function showToast(msg) {
  store.toastMsg = msg;
  store.toastVisible = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    store.toastVisible = false;
    if (toastQueue.length) {
      const next = toastQueue.shift();
      // Brief beat so the swap reads as a new message, not a flicker.
      setTimeout(() => showToast(next), 250);
    }
  }, 2500);
}
export function toast(msg) {
  if (!msg) return;
  if (store.toastVisible) {
    if (toastQueue.length < 3) toastQueue.push(msg);
    return;
  }
  showToast(msg);
}

function allGames() {
  const seen = new Set();
  return [...GameData.recentLive, ...GameData.getSeedPool(), ...GameData.CURATED_GAMES].filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

export const seedMeta = computed(() => GameData.getSeedMeta());

/** Surprise pick from the unplayed backlog, weighted by value-per-hour. */
export function surprise() {
  const { pick, reason } = GameData.surprisePick(enrichedOwned.value, store.weeklyHours, Math.random);
  if (!pick) {
    toast('Nothing to pick — import your library or add games first');
    return { pick: null, reason: '' };
  }
  toast(`🎲 ${reason}`);
  return { pick, reason };
}

export function effectivePrice(game) {
  if (!game) return 0;
  if (store.useSalePrice && game.salePrice != null && game.salePrice < game.basePriceUsd) return game.salePrice;
  return game.basePriceUsd;
}

export function activeHours(game) {
  const g = game || store.currentGame;
  return store.hoursMode === 'completionist'
    ? (g?.realityCheck?.completionistHours || 0)
    : (g?.realityCheck?.mainStoryHours || 0);
}

export const filteredGames = computed(() => {
  let list = allGames();
  if (store.activeFilter === 'short') {
    list = list.filter((g) => g.realityCheck.mainStoryHours > 0 && g.realityCheck.mainStoryHours <= 20);
  } else if (store.activeFilter === 'gamepass') {
    list = list.filter((g) => (g.subscriptionServices || []).some((s) => s.toLowerCase().includes('game pass')));
  } else if (store.activeFilter === 'deck') {
    list = list.filter((g) => GameData.getDeckInfo(g.realityCheck.steamDeckRating).status === 'Verified');
  } else if (store.activeFilter === 'masterpiece') {
    list = list.filter((g) => g.unifiedConsensusPercent >= 95);
  } else if (store.activeFilter === 'clean') {
    list = list.filter((g) => GameData.isCleanMtx(g));
  } else if (store.activeFilter === 'value') {
    list = list.filter((g) => {
      const c = GameData.costPerHourOf(g, { useSale: store.useSalePrice, hoursMode: store.hoursMode });
      return c != null && c.value < 1.5;
    });
  } else if (store.activeFilter === 'coop') {
    list = list.filter((g) => GameData.hasCoop(g));
  }
  const by = store.sortBy;
  list.sort((a, b) => {
    if (by === 'price') return effectivePrice(a) - effectivePrice(b);
    if (by === 'hours') return (a.realityCheck.mainStoryHours || 0) - (b.realityCheck.mainStoryHours || 0);
    if (by === 'value') {
      const ca = GameData.costPerHourOf(a, { useSale: store.useSalePrice, hoursMode: store.hoursMode });
      const cb = GameData.costPerHourOf(b, { useSale: store.useSalePrice, hoursMode: store.hoursMode });
      return (ca?.value ?? Infinity) - (cb?.value ?? Infinity);
    }
    return (b.unifiedConsensusPercent ?? -1) - (a.unifiedConsensusPercent ?? -1);
  });
  return list;
});

/** Similar-games recommendations for the open verdict card. */
export const similarGames = computed(() =>
  GameData.getSimilar(store.currentGame, allGames(), 3)
);

/** Autocomplete suggestions from known titles (curated + recent live). */
export function refreshSuggestions() {
  const q = store.query.trim().toLowerCase();
  if (q.length < 2) {
    store.suggestions = [];
    return;
  }
  store.suggestions = allGames()
    .filter((g) =>
      g.title.toLowerCase().includes(q) ||
      g.developer?.toLowerCase().includes(q) ||
      g.genres.some((x) => x.toLowerCase().includes(q))
    )
    .slice(0, 6);
}

function knownHours() {
  const g = store.currentGame;
  if (g?.realityCheck?.hoursUnknown) return null;
  return activeHours() || 30;
}

export const weeksToBeat = computed(() => {
  const h = knownHours();
  return h == null ? null : (h / store.weeklyHours).toFixed(1);
});

export const costPerHour = computed(() => {
  const h = knownHours();
  return h == null ? null : (effectivePrice(store.currentGame) / h).toFixed(2);
});

/** Whole-backlog queue totals from the wishlist. */
export const backlogTotals = computed(() => {
  const rated = (id) =>
    GameData.CURATED_GAMES.find((g) => g.id === id) ||
    GameData.recentLive.find((g) => g.id === id);
  let hours = 0, cost = 0;
  for (const w of store.wishlist) {
    const g = rated(w.id);
    const h = store.hoursMode === 'completionist'
      ? (g?.realityCheck?.completionistHours || 30)
      : (g?.realityCheck?.mainStoryHours || 30);
    hours += h;
    cost += w.price ?? g?.basePriceUsd ?? 0;
  }
  return {
    hours,
    cost,
    weeks: store.weeklyHours ? hours / store.weeklyHours : 0,
    avgPerHour: hours ? cost / hours : 0
  };
});

function saveWishlist() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(store.wishlist));
}

export function isWishlisted(game) {
  return store.wishlist.some((w) => w.id === game.id);
}

export function toggleWishlist(game) {
  if (isWishlisted(game)) {
    store.wishlist = store.wishlist.filter((w) => w.id !== game.id);
    toast(`Removed "${game.title}" from wishlist`);
  } else {
    store.wishlist.push({ id: game.id, title: game.title, price: effectivePrice(game), addedAt: Date.now() });
    toast(`Saved "${game.title}" to wishlist`);
  }
  saveWishlist();
}

export function toggleCompare(game) {
  if (store.compareList.some((c) => c.id === game.id)) {
    store.compareList = store.compareList.filter((c) => c.id !== game.id);
  } else {
    if (store.compareList.length >= 3) {
      toast('Compare holds max 3 titles');
      return;
    }
    store.compareList.push(game);
  }
}

export function selectGame(game) {
  store.currentGame = game;
  store.suggestions = [];
  history.replaceState(null, '', `#game=${game.id}`);
}

export async function search() {
  const q = store.query.trim();
  if (!q || store.isLoading) return;
  store.isLoading = true;
  store.searchError = '';
  toast(`Distilling consensus for "${q}"...`);
  try {
    const result = await GameData.searchGame(q);
    selectGame(result);
    document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
    if (result.isEstimate) {
      store.searchError = result.estimateNote || 'Offline estimate shown — live reviews unreachable.';
      toast(`Estimate shown for ${result.title} (live API unreachable)`);
    } else {
      toast(result.isLive ? `Live consensus loaded for "${result.title}"` : `Verdict generated for ${result.title}`);
    }
  } catch {
    store.searchError = 'Search failed — check your connection and try again.';
    toast('Search failed — try again');
  } finally {
    store.isLoading = false;
  }
}

export function share() {
  const url = `${location.origin}${location.pathname}#game=${store.currentGame.id}`;
  navigator.clipboard
    ?.writeText(url)
    .then(() => toast('Game verdict link copied!'))
    .catch(() => toast('Link ready in URL bar'));
}

export function initFromHash() {
  const m = (location.hash.match(/#game=(.+)/) || [])[1];
  if (!m) return;
  const found =
    GameData.CURATED_GAMES.find((g) => g.id === m) ||
    GameData.recentLive.find((g) => g.id === m);
  if (found) store.currentGame = found;
}

/* ---------- Steam library import + owned-backlog triage ---------- */

function saveLibrary() {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(store.steamLibrary));
  } catch { /* quota: session-only, import stays usable */ }
}

function saveManual() {
  localStorage.setItem(MANUAL_KEY, JSON.stringify(store.manualGames));
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export async function importLibrary() {
  const raw = store.steamInput.trim();
  const parsed = GameData.parseSteamInput(raw);
  if (!parsed) {
    store.libraryError = 'Paste a Steam profile URL, SteamID64, or vanity name.';
    return;
  }
  store.libraryLoading = true;
  store.libraryError = '';
  try {
    const res = await fetch(`/api/steam-library?input=${encodeURIComponent(raw)}`);
    const body = await res.json();
    if (!res.ok || !body.success) {
      store.libraryError = body.error || 'Import failed — try again.';
      return;
    }
    store.steamLibrary = {
      steamId: body.steamId,
      persona: body.persona,
      games: body.games,
      importedAt: Date.now()
    };
    store.libraryDetails = {};
    saveLibrary();
    toast(`Imported ${body.games.length} owned games`);
    enrichLibrary();
  } catch {
    store.libraryError = 'Import failed — check your connection and try again.';
  } finally {
    store.libraryLoading = false;
  }
}

export function clearLibrary() {
  store.steamLibrary = null;
  store.libraryDetails = {};
  store.enrichProgress = '';
  try { localStorage.removeItem(LIBRARY_KEY); } catch { /* noop */ }
}

/** Enrich owned games with store genres in 40-id batches, played-first. Capped at 120. */
export async function enrichLibrary() {
  const lib = store.steamLibrary;
  if (!lib?.games?.length) return;
  const played = lib.games.filter((g) => g.playtimeMins > 0).sort((a, b) => b.playtimeMins - a.playtimeMins);
  const unplayed = lib.games.filter((g) => !g.playtimeMins);
  const queue = [...played, ...unplayed].slice(0, 120).filter((g) => !store.libraryDetails[g.appid]);
  for (let i = 0; i < queue.length; i += 40) {
    const batch = queue.slice(i, i + 40);
    store.enrichProgress = `Enriching ${Math.min(i + 40, queue.length)}/${queue.length}…`;
    try {
      const res = await fetch(`/api/steam-details?ids=${batch.map((g) => g.appid).join(',')}`);
      const body = await res.json();
      if (body.success) {
        for (const d of body.details) store.libraryDetails[d.appid] = d;
      }
    } catch { /* keep going with the next batch */ }
  }
  store.enrichProgress = '';
}

/** Owned games merged with details, hour estimates, session fit, curated matches. */
export const enrichedOwned = computed(() => {
  const lib = store.steamLibrary;
  const rows = [];
  for (const g of lib?.games || []) {
    const d = store.libraryDetails[g.appid];
    const genres = d?.ok ? d.genres || [] : [];
    const curated = GameData.CURATED_GAMES.find((c) => c.steamAppID === String(g.appid)) || null;
    const estMainHrs = curated
      ? curated.realityCheck.mainStoryHours
      : genres.length ? GameData.estimateHours(genres, hashStr(String(g.appid))).main : null;
    rows.push({
      ...g,
      genres,
      header: d?.ok ? d.header : null,
      curated,
      estMainHrs,
      fit: GameData.sessionFit(genres)
    });
  }
  for (const m of store.manualGames) {
    rows.push({
      appid: null, name: m.name, playtimeMins: m.playtimeMins || 0,
      playtime2wksMins: 0, rtimeLastPlayed: 0,
      genres: [], header: null, curated: null,
      estMainHrs: m.estMainHrs, fit: 'either', manual: true, manualId: m.id
    });
  }
  return rows;
});

export const libraryStats = computed(() =>
  GameData.computeLibraryStats((store.steamLibrary?.games || []).concat(
    store.manualGames.map((m) => ({ playtimeMins: m.playtimeMins || 0, rtimeLastPlayed: 0 }))
  ))
);

export const triage = computed(() => GameData.finishOrCut(enrichedOwned.value));

export const seriesWatch = computed(() => GameData.seriesGroups(enrichedOwned.value));

export const weeknightQueue = computed(() =>
  enrichedOwned.value
    .filter((g) => g.fit === 'short' && (g.playtimeMins || 0) === 0 && g.estMainHrs != null)
    .slice(0, 8)
);

export const weekendQueue = computed(() =>
  enrichedOwned.value
    .filter((g) => g.fit === 'epic' && (g.playtimeMins || 0) === 0 && g.estMainHrs != null)
    .sort((a, b) => (b.curated?.unifiedConsensusPercent ?? 0) - (a.curated?.unifiedConsensusPercent ?? 0))
    .slice(0, 8)
);

/** Sale patience: wishlist cost vs queue position at the user's pace. */
export const wishlistPatience = computed(() => {
  const months = backlogTotals.value.weeks / 4.3;
  return store.wishlist.map((w) => ({
    ...w,
    waitVerdict: months > 6
      ? `Your queue is ${months.toFixed(0)} months deep — don't buy until a 50%+ sale.`
      : months > 2
        ? `You'll reach this in ~${months.toFixed(0)} months — wait for 30%+ off.`
        : 'Near the front of your queue — a small discount justifies it.'
  }));
});

export function addManualGame(name, estMainHrs) {
  const title = String(name || '').trim();
  const hrs = Number(estMainHrs);
  if (!title || !(hrs > 0)) {
    toast('Give the game a title and estimated main-story hours');
    return;
  }
  store.manualGames.push({ id: `manual-${Date.now()}`, name: title, estMainHrs: hrs, playtimeMins: 0 });
  saveManual();
  toast(`Added "${title}" to your backlog`);
}

export async function verdictForOwned(owned) {
  if (owned?.curated) {
    selectGame({ ...owned.curated });
    document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  store.query = owned.name;
  await search();
}

/* ---------- Casual onboarding: three questions over existing state ---------- */

const VIBE_MAP = {
  epic: { sortBy: 'consensus', activeFilter: 'masterpiece' },
  quick: { sortBy: 'hours', activeFilter: 'short' },
  social: { sortBy: 'consensus', activeFilter: 'coop' },
  story: { sortBy: 'consensus', activeFilter: 'all' }
};

export function completeOnboarding({ hours, device, vibe }) {
  if (hours > 0) store.weeklyHours = hours;
  if (device) {
    store.device = device;
    try { localStorage.setItem('gv:device:v1', JSON.stringify(device)); } catch { /* noop */ }
  }
  const map = VIBE_MAP[vibe];
  if (map) {
    store.sortBy = map.sortBy;
    store.activeFilter = map.activeFilter;
  }
  store.onboarded = true;
  try { localStorage.setItem('gv:onboarded:v1', JSON.stringify(true)); } catch { /* noop */ }
  toast('Tuned to your time, device, and vibe');
}

export function setDevice(device) {
  store.device = device;
  try { localStorage.setItem('gv:device:v1', JSON.stringify(device)); } catch { /* noop */ }
}

/* ---------- Regulars: achievements on demand + wishlist price drops ---------- */

export async function fetchAchievements(appid) {
  const id = Number(appid);
  if (!id || store.achievements[id]?.done) return store.achievements[id] || null;
  const steamId = store.steamLibrary?.steamId;
  if (!steamId) {
    toast('Import your Steam library first to track achievements');
    return null;
  }
  store.achievements[id] = { loading: true };
  try {
    const res = await fetch(`/api/steam-achievements?steamid=${steamId}&appid=${id}`);
    const body = await res.json();
    store.achievements[id] = body.success
      ? { done: true, total: body.total, unlocked: body.unlocked, pct: GameData.achievementPct(body) }
      : { done: true, error: body.error || 'No achievements found' };
  } catch {
    store.achievements[id] = { done: true, error: 'Request failed — try again' };
  }
  return store.achievements[id];
}

/* ---------- Supabase cloud sync (disconnected until configured) ---------- */

export async function connectSync() {
  const { connect, currentUserId } = await import('../js/supabase-client.js');
  store.syncing = true;
  store.syncError = '';
  try {
    const res = await connect({ url: store.syncUrl, anonKey: store.syncKey });
    if (!res.ok) {
      store.syncStatus = 'disconnected';
      store.syncError = res.error;
      return;
    }
    const userId = await currentUserId();
    store.syncStatus = userId ? 'synced' : 'connected';
    store.syncUrl = '';
    store.syncKey = '';
    toast(userId ? 'Cloud sync on — welcome back' : 'Connected — sign in to sync');
  } finally {
    store.syncing = false;
  }
}

export async function syncNow() {
  if (store.syncing) return;
  const mod = await import('../js/sync.js');
  store.syncing = true;
  try {
    const pulled = await mod.pullRemote({ wishlist: store.wishlist, manualGames: store.manualGames });
    if (pulled.skipped) {
      toast('Sync needs a connected, signed-in Supabase project');
      return;
    }
    if (pulled.ok) {
      store.wishlist = pulled.wishlist;
      store.manualGames = pulled.manualGames;
      if (pulled.prefs?.weeklyHours) store.weeklyHours = pulled.prefs.weeklyHours;
      if (pulled.prefs?.device) store.device = pulled.prefs.device;
      saveWishlist();
      saveManual();
    }
    const pushed = await mod.pushLocal({
      wishlist: store.wishlist,
      manualGames: store.manualGames,
      prefs: { weeklyHours: store.weeklyHours, device: store.device }
    });
    if (pushed.ok) toast(`Synced ${pushed.pushed} rows to the cloud`);
  } finally {
    store.syncing = false;
  }
}

export async function rateGame(gameKey, score) {
  const mod = await import('../js/sync.js');
  const res = await mod.submitRating(gameKey, score);
  if (res.skipped) {
    toast('Ratings need cloud sync — connect Supabase first');
    return res;
  }
  if (res.ok) {
    store.myRatings[gameKey] = score;
    toast(`Rated ${score}/10 — thanks, it counts`);
  } else {
    toast(res.error || 'Rating failed — try again');
  }
  return res;
}

const PRICE_CHECK_KEY = 'gv:price-check:v1';
const PRICE_CHECK_TTL_MS = 24 * 3600 * 1000; // auto-check at most once a day

function loadPriceCheck() {
  try {
    const raw = JSON.parse(localStorage.getItem(PRICE_CHECK_KEY) || '{}');
    return { at: raw.at || 0, notified: Array.isArray(raw.notified) ? raw.notified : [] };
  } catch {
    return { at: 0, notified: [] };
  }
}

function savePriceCheck(notified) {
  store.lastPriceCheckAt = Date.now();
  try {
    localStorage.setItem(PRICE_CHECK_KEY, JSON.stringify({ at: store.lastPriceCheckAt, notified }));
  } catch { /* private mode: memory only */ }
}

// Restore last-check stamp for the "checked X ago" hint.
store.lastPriceCheckAt = loadPriceCheck().at;

/**
 * Price check: compare saved wishlist prices against live prices.
 * Manual runs check everything and report in full. Auto runs (once daily,
 * newest `limit` titles) stay silent unless there are *new* drops, which
 * surface as a badge + digest toast.
 */
export async function checkPrices(opts = {}) {
  const { auto = false, limit = 0 } = opts;
  if (store.checkingPrices || !store.wishlist.length) return;
  if (auto && Date.now() - loadPriceCheck().at < PRICE_CHECK_TTL_MS) return;
  store.checkingPrices = true;
  store.priceDrops = [];
  try {
    let queue = [...store.wishlist].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    if (limit > 0) queue = queue.slice(0, limit);
    for (const w of queue) {
      try {
        const result = await GameData.searchGame(w.title);
        const now = result.salePrice != null && result.salePrice < result.basePriceUsd
          ? result.salePrice : result.basePriceUsd;
        const drop = GameData.dropFor(w.price, now);
        if (drop) store.priceDrops.push({ ...w, ...drop });
      } catch { /* one title failing must not stop the rest */ }
      await new Promise((r) => setTimeout(r, 800));
    }
    const seen = new Set(loadPriceCheck().notified);
    const fresh = store.priceDrops.filter((d) => !seen.has(d.id));
    savePriceCheck(store.priceDrops.map((d) => d.id));
    if (!store.priceDrops.length) {
      store.priceDropBadge = 0;
      if (!auto) toast('No drops right now — patience pays');
    } else if (auto) {
      store.priceDropBadge = fresh.length;
      if (fresh.length) {
        toast(fresh.length === 1
          ? `💸 ${fresh[0].title} dropped to $${fresh[0].now.toFixed(2)} (−${fresh[0].pct}%)`
          : `💸 ${fresh.length} new price drops on your wishlist`);
      }
    } else {
      // Manual run means the user is looking at the drawer right now.
      store.priceDropBadge = 0;
      toast(`💸 ${store.priceDrops.length} price drop${store.priceDrops.length > 1 ? 's' : ''} on your wishlist`);
    }
  } finally {
    store.checkingPrices = false;
  }
}
