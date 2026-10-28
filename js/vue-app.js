import { GameData } from './game-data.js';

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const query = ref('');
    const currentGame = ref(GameData.CURATED_GAMES[0]);
    const activeFilter = ref('all');
    const sortBy = ref('consensus');
    const weeklyHours = ref(8);
    const toastMsg = ref('');
    const showToastFlag = ref(false);
    const wishlist = ref(JSON.parse(localStorage.getItem('gv:wishlist:v1') || '[]'));
    const compareList = ref([]);
    const showWishlist = ref(false);
    const showCoffee = ref(false);
    let toastTimer = null;

    const showToast = (msg) => {
      toastMsg.value = msg;
      showToastFlag.value = true;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (showToastFlag.value = false), 2500);
    };

    const filteredGames = computed(() => {
      let list = [...GameData.CURATED_GAMES];
      if (activeFilter.value === 'short') list = list.filter((g) => g.realityCheck.mainStoryHours > 0 && g.realityCheck.mainStoryHours <= 20);
      if (activeFilter.value === 'gamepass') list = list.filter((g) => (g.subscriptionServices || []).some((s) => s.toLowerCase().includes('game pass')));
      if (activeFilter.value === 'deck') list = list.filter((g) => (g.realityCheck.steamDeckRating || '').toLowerCase().includes('verif'));
      if (activeFilter.value === 'masterpiece') list = list.filter((g) => g.unifiedConsensusPercent >= 95);
      const by = sortBy.value;
      list.sort((a, b) =>
        by === 'price' ? a.basePriceUsd - b.basePriceUsd
        : by === 'hours' ? a.realityCheck.mainStoryHours - b.realityCheck.mainStoryHours
        : b.unifiedConsensusPercent - a.unifiedConsensusPercent);
      return list;
    });

    const weeksToBeat = computed(() => ((currentGame.value.realityCheck.mainStoryHours || 30) / weeklyHours.value).toFixed(1));
    const costPerHour = computed(() => (currentGame.value.basePriceUsd / (currentGame.value.realityCheck.mainStoryHours || 30)).toFixed(2));

    const saveWishlist = () => localStorage.setItem('gv:wishlist:v1', JSON.stringify(wishlist.value));
    const isWishlisted = (g) => wishlist.value.some((w) => w.id === g.id);
    const toggleWishlist = (g) => {
      isWishlisted(g)
        ? (wishlist.value = wishlist.value.filter((w) => w.id !== g.id))
        : wishlist.value.push({ id: g.id, title: g.title, price: g.basePriceUsd, addedAt: Date.now() });
      saveWishlist();
      showToast(isWishlisted(g) ? `Saved "${g.title}" to wishlist` : `Removed "${g.title}" from wishlist`);
    };
    const toggleCompare = (g) => {
      if (compareList.value.some((c) => c.id === g.id)) {
        compareList.value = compareList.value.filter((c) => c.id !== g.id);
      } else {
        if (compareList.value.length >= 3) { showToast('Compare holds max 3 titles'); return; }
        compareList.value.push(g);
      }
    };

    const selectGame = (g) => {
      currentGame.value = g;
      history.replaceState(null, '', `#game=${g.id}`);
    };

    const search = async () => {
      const q = query.value.trim();
      if (!q) return;
      showToast(`Distilling consensus for "${q}"...`);
      const result = await GameData.searchGame(q);
      selectGame(result);
      document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
      showToast(result.isLive ? `Live consensus loaded for "${result.title}"` : `Verdict generated for ${result.title}`);
    };

    const share = () => {
      navigator.clipboard?.writeText(`${location.origin}${location.pathname}#game=${currentGame.value.id}`)
        .then(() => showToast('Game verdict link copied!')).catch(() => showToast('Link ready in URL bar'));
    };

    onMounted(() => {
      const m = (location.hash.match(/#game=(.+)/) || [])[1];
      const found = m && GameData.CURATED_GAMES.find((g) => g.id === m);
      if (found) currentGame.value = found;
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); document.getElementById('searchInput')?.focus(); }
      });
    });

    const scrollToCalculator = () => document.getElementById('roiCalculatorCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return {
      query, currentGame, activeFilter, sortBy, weeklyHours, toastMsg, showToastFlag,
      wishlist, compareList, showWishlist, showCoffee, scrollToCalculator,
      filteredGames, weeksToBeat, costPerHour,
      presets: GameData.FILTER_PRESETS, showToast, isWishlisted, toggleWishlist,
      toggleCompare, selectGame, search, share
    };
  }
}).mount('#vueApp');
