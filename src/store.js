import { reactive, computed } from 'vue';
import { GameData } from '../js/game-data.js';

const WISHLIST_KEY = 'gv:wishlist:v1';

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
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
  showWishlist: false,
  showCoffee: false,
  toastMsg: '',
  toastVisible: false,
  presets: GameData.FILTER_PRESETS
});

let toastTimer = null;
export function toast(msg) {
  store.toastMsg = msg;
  store.toastVisible = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (store.toastVisible = false), 2500);
}

function allGames() {
  const seen = new Set();
  return [...GameData.recentLive, ...GameData.CURATED_GAMES].filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
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
