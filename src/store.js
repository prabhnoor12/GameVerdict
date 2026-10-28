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

export const filteredGames = computed(() => {
  let list = [...GameData.CURATED_GAMES];
  if (store.activeFilter === 'short') {
    list = list.filter((g) => g.realityCheck.mainStoryHours > 0 && g.realityCheck.mainStoryHours <= 20);
  } else if (store.activeFilter === 'gamepass') {
    list = list.filter((g) => (g.subscriptionServices || []).some((s) => s.toLowerCase().includes('game pass')));
  } else if (store.activeFilter === 'deck') {
    list = list.filter((g) => (g.realityCheck.steamDeckRating || '').toLowerCase().includes('verif'));
  } else if (store.activeFilter === 'masterpiece') {
    list = list.filter((g) => g.unifiedConsensusPercent >= 95);
  }
  const by = store.sortBy;
  list.sort((a, b) =>
    by === 'price'
      ? a.basePriceUsd - b.basePriceUsd
      : by === 'hours'
        ? a.realityCheck.mainStoryHours - b.realityCheck.mainStoryHours
        : b.unifiedConsensusPercent - a.unifiedConsensusPercent
  );
  return list;
});

export const weeksToBeat = computed(() =>
  ((store.currentGame.realityCheck.mainStoryHours || 30) / store.weeklyHours).toFixed(1)
);

export const costPerHour = computed(() =>
  (store.currentGame.basePriceUsd / (store.currentGame.realityCheck.mainStoryHours || 30)).toFixed(2)
);

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
    store.wishlist.push({ id: game.id, title: game.title, price: game.basePriceUsd, addedAt: Date.now() });
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
  history.replaceState(null, '', `#game=${game.id}`);
}

export async function search() {
  const q = store.query.trim();
  if (!q) return;
  toast(`Distilling consensus for "${q}"...`);
  const result = await GameData.searchGame(q);
  selectGame(result);
  document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
  toast(result.isLive ? `Live consensus loaded for "${result.title}"` : `Verdict generated for ${result.title}`);
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
  const found = m && GameData.CURATED_GAMES.find((g) => g.id === m);
  if (found) store.currentGame = found;
}
