<template>
  <div class="min-h-full flex flex-col font-sans select-none overflow-x-hidden relative bg-zinc-950">
    <div class="fixed inset-0 pointer-events-none z-0 backdrop-blur-cinema opacity-40 transition-all duration-700" :style="backdropStyle"></div>

    <header class="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 h-14 flex items-center justify-between gap-2 shrink-0">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md font-black text-sm shrink-0">GV</div>
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-bold text-sm sm:text-base text-white tracking-tight whitespace-nowrap">GameVerdict</span>
          <span class="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 whitespace-nowrap">Backlog Reality</span>
        </div>
      </div>
      <nav aria-label="Primary" class="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
        <button
          v-for="t in tabs"
          :key="t.id"
          @click="setTab(t.id)"
          :aria-current="store.activeTab === t.id ? 'page' : undefined"
          :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition min-h-[36px]', store.activeTab === t.id ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-300 hover:text-white']"
        >{{ t.label }}</button>
      </nav>
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button @click="openWishlist" aria-label="Open wishlist" class="relative px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition">
          <span class="hidden sm:inline">Wishlist ({{ store.wishlist.length }})</span><span class="sm:hidden">Saved ({{ store.wishlist.length }})</span>
          <span v-if="store.priceDropBadge" class="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black flex items-center justify-center shadow-lg">{{ store.priceDropBadge }}</span>
        </button>
        <button @click="share" aria-label="Share this verdict" class="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition">
          <span>Share</span>
        </button>
        <button @click="store.showAuth = true" :aria-label="store.userEmail ? `Account: ${store.userEmail}` : 'Sign in'" :class="['px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg border font-medium text-xs flex items-center gap-1.5 transition', store.userEmail ? 'bg-emerald-950 border-emerald-700 text-emerald-300 hover:border-emerald-500' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-zinc-300']">
          <span v-if="store.userEmail" class="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black flex items-center justify-center shrink-0">{{ accountInitial }}</span>
          <span>{{ accountLabel }}</span>
        </button>
        <button @click="store.showCoffee = true" aria-label="Support the project" class="btn-coffee px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span class="hidden sm:inline">Support</span><span class="sm:hidden">Give</span>
        </button>
      </div>
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
      <div v-if="store.activeTab === 'verdict'" class="flex flex-col gap-6">
        <section v-if="store.communityTop.length" aria-label="Community top rated" class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <h2 class="font-bold text-sm text-white">Community top rated</h2>
            <span class="text-[11px] text-zinc-500">Live votes from signed-in players</span>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              v-for="row in store.communityTop"
              :key="row.game_key"
              @click="researchCommunity(row.title)"
              class="px-3 py-1.5 rounded-xl text-xs border bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-emerald-500 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[36px]"
            >
              <span class="font-medium">{{ row.title }}</span>
              <span class="font-mono text-teal-300 text-[10px">{{ row.avg_score }}/10</span>
              <span class="text-zinc-500 text-[10px]">({{ row.votes }})</span>
            </button>
          </div>
        </section>
        <TonightStrip />
        <SearchHero />
        <VerdictSkeleton v-if="store.isLoading" />
        <VerdictCard v-else :game="store.currentGame" />
      </div>

      <div v-if="store.activeTab === 'backlog'" class="flex flex-col gap-6">
        <section aria-label="Wishlist queue" class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <h2 class="font-bold text-white text-sm">Wishlist queue ({{ store.wishlist.length }})</h2>
            <button @click="openWishlist" class="text-xs text-emerald-300 hover:text-emerald-200 font-bold">Open full list</button>
          </div>
          <div v-if="!store.wishlist.length" class="text-xs text-zinc-500">Nothing saved yet — open a verdict and tap Save.</div>
          <div v-else class="text-xs text-zinc-400">
            Total <span class="text-white font-mono font-bold">{{ backlogTotals.hours }}h</span> ·
            <span class="text-white font-mono font-bold">{{ backlogTotals.weeks.toFixed(1) }} weeks</span> at your pace ·
            <span class="text-emerald-400 font-mono font-bold">${{ backlogTotals.cost.toFixed(2) }}</span>
          </div>
          <div v-if="store.priceDrops.length" class="space-y-1.5">
            <div v-for="d in store.priceDrops.slice(0, 3)" :key="d.id" class="text-xs bg-emerald-950/60 border border-emerald-700 rounded-xl px-3 py-2">
              <span class="text-emerald-300 font-bold">{{ d.title }}: ${{ d.saved.toFixed(2) }} → ${{ d.now.toFixed(2) }} (−{{ d.pct }}%)</span>
            </div>
          </div>
          <div v-else class="text-[11px] text-zinc-500">Price drops appear here after a check — no need to open the drawer.</div>
        </section>
        <section aria-label="My ratings" class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <h2 class="font-bold text-white text-sm">My ratings ({{ ratedList.length }})</h2>
            <span v-if="!ratedList.length" class="text-[11px] text-zinc-500">Rate any verdict — it counts toward the community average.</span>
          </div>
          <div v-for="r in ratedList.slice(0, 10)" :key="r.id" class="flex items-center gap-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
            <span class="text-zinc-200 font-medium truncate flex-1">{{ r.title }}</span>
            <span class="font-mono text-teal-300 font-bold shrink-0">{{ r.score }}/10</span>
            <button @click="openRated(r.title)" class="text-emerald-300 hover:text-emerald-200 font-bold shrink-0">Open</button>
            <button @click="removeRating(r.id)" class="text-zinc-500 hover:text-rose-300 shrink-0" :aria-label="`Remove rating for ${r.title}`">Remove</button>
          </div>
        </section>
        <RoiCalculator />
        <LibraryPanel />
      </div>

      <div v-if="store.activeTab === 'compare'" class="flex flex-col gap-4">
        <section aria-label="Compare titles" class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-3">
          <h2 class="font-bold text-white text-sm">Compare ({{ store.compareList.length }}/3)</h2>
          <p v-if="!store.compareList.length" class="text-xs text-zinc-500">Tap Compare on any verdict to pin it here. Scores, hours, and value side by side.</p>
          <div v-else class="overflow-x-auto">
            <table class="text-xs w-full">
              <tr class="text-zinc-500">
                <td class="py-1 pr-2"></td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 font-bold text-white whitespace-nowrap">{{ g.title }}</td>
              </tr>
              <tr>
                <td class="text-zinc-500 pr-2 py-1">Decision</td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 text-zinc-200">{{ compareDecision(g) }}</td>
              </tr>
              <tr>
                <td class="text-zinc-500 pr-2 py-1">Score</td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 font-mono text-emerald-400">{{ g.unifiedConsensusPercent == null ? '—' : `${g.unifiedConsensusPercent}%` }}</td>
              </tr>
              <tr>
                <td class="text-zinc-500 pr-2 py-1">Hours</td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 text-zinc-200">{{ g.realityCheck.hoursUnknown ? '—' : `${g.realityCheck.mainStoryHours}h` }}</td>
              </tr>
              <tr>
                <td class="text-zinc-500 pr-2 py-1">Value</td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 text-zinc-200">{{ compareValue(g) }}</td>
              </tr>
              <tr>
                <td class="text-zinc-500 pr-2 py-1">Price</td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1 text-zinc-200">${{ g.basePriceUsd.toFixed(2) }}</td>
              </tr>
              <tr>
                <td></td>
                <td v-for="g in store.compareList" :key="g.id" class="px-2 py-1">
                  <div class="flex gap-2">
                    <button @click="selectAndVerdict(g)" class="text-emerald-300 hover:text-emerald-200 font-bold">Open</button>
                    <button @click="toggleCompare(g)" class="text-rose-400 hover:text-rose-300">Remove</button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </section>
      </div>
    </main>

    <footer class="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 relative z-10">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>GameVerdict — Zero-fluff gaming consensus and backlog reality engine.</div>
        <div class="flex items-center gap-4">
          <button @click="store.showCoffee = true" class="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"><span>Support the Project</span></button>
          <span>No ads · Zero tracking · 100% Free</span>
        </div>
      </div>
    </footer>

    <div v-if="!store.onboarded" class="fixed inset-0 z-50 flex justify-end bg-black/60" @click.self="dismissOnboarding">
      <div class="w-96 max-w-[92vw] bg-zinc-900 border-l border-zinc-800 p-5 overflow-y-auto">
        <OnboardingQuiz />
        <button @click="dismissOnboarding" class="mt-3 text-[11px] text-zinc-500 hover:text-white w-full text-center py-2">Not now — let me browse</button>
      </div>
    </div>

    <div v-if="store.showWishlist" class="fixed inset-0 z-50 flex justify-end bg-black/60" @click.self="store.showWishlist = false">
      <div class="w-72 max-w-[85vw] bg-zinc-900 border-l border-zinc-800 p-4 space-y-2 overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-white text-sm">Saved ({{ store.wishlist.length }})</h3>
          <button @click="store.showWishlist = false" class="text-zinc-400 hover:text-white">Close</button>
        </div>
        <div v-if="!store.wishlist.length" class="text-xs text-zinc-500">Nothing saved yet — open a verdict and tap Save.</div>
        <button v-else @click="checkPrices" :disabled="store.checkingPrices" class="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-700 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60 text-xs font-bold min-h-[40px]">
          {{ store.checkingPrices ? 'Checking live prices…' : 'Check for price drops' }}
        </button>
        <div v-if="store.lastPriceCheckAt" class="text-[10px] text-zinc-400 text-center">Auto-checks daily · last checked {{ lastCheckAge }}</div>
        <div v-for="d in store.priceDrops" :key="d.id" class="text-xs bg-emerald-950/60 border border-emerald-700 rounded-xl px-3 py-2">
          <span class="text-emerald-300 font-bold">{{ d.title }}: ${{ d.saved.toFixed(2) }} → ${{ d.now.toFixed(2) }} (−{{ d.pct }}%)</span>
        </div>
        <div v-if="store.wishlist.length" class="text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
          Queue: <span class="text-white font-mono font-bold">{{ backlogTotals.hours }}h</span> · <span class="text-white font-mono font-bold">{{ backlogTotals.weeks.toFixed(1) }} wks</span> · <span class="text-emerald-400 font-mono font-bold">${{ backlogTotals.cost.toFixed(2) }}</span>
        </div>
        <div v-for="w in wishlistPatience" :key="w.id" class="text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 space-y-0.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-zinc-200 font-medium truncate">{{ w.title }}</span>
            <span class="text-emerald-400 font-mono ml-2 shrink-0">${{ w.price.toFixed(2) }}</span>
          </div>
          <div class="text-[10px] text-zinc-500">{{ w.waitVerdict }}</div>
        </div>
      </div>
    </div>

    <div v-if="store.showAuth" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="store.showAuth = false">
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <button @click="store.showAuth = false" class="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">Close</button>
        <h3 class="text-lg font-bold text-white">Sign in to GameVerdict</h3>
        <p class="text-xs text-zinc-400 leading-relaxed">One tap from your inbox. Unlocks cross-device sync, community ratings that count, and shareable snapshots.</p>
        <AuthPanel />
      </div>
    </div>

    <div v-if="store.showCoffee" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="store.showCoffee = false">
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
        <button @click="store.showCoffee = false" class="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">Close</button>
        <h3 class="text-lg font-bold text-white">Fuel GameVerdict</h3>
        <p class="text-xs text-zinc-400 leading-relaxed">GameVerdict is 100% free with zero ads or sponsored reviews. If it saved you backlog time, consider supporting.</p>
        <div class="grid grid-cols-3 gap-2 pt-2">
          <button v-for="amt in [3, 5, 15]" :key="amt" @click="toast(`Selected $${amt} coffee tip! Thank you!`)" class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-white transition">${{ amt }}</button>
        </div>
        <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" class="block w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg">Proceed to Buy Me a Coffee</a>
      </div>
    </div>

    <div style="bottom: max(1.5rem, env(safe-area-inset-bottom))" :class="['fixed right-4 sm:right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs transition-all duration-300 max-w-[calc(100vw-2rem)]', store.toastVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2']">
      <span>{{ store.toastMsg }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { store, share, toggleCompare, toast, initFromHash, backlogTotals, wishlistPatience, checkPrices, loadSharedSnapshot, setTab, selectGame, completeOnboarding, ensureSync, subscribeAuth, fetchCommunity, fetchTopCommunity, handleAuthReturn, ratedList, removeRating, search } from './store.js';
import { GameData } from '../js/game-data.js';
import SearchHero from './components/SearchHero.vue';
import VerdictCard from './components/VerdictCard.vue';
import VerdictSkeleton from './components/VerdictSkeleton.vue';
import RoiCalculator from './components/RoiCalculator.vue';
import LibraryPanel from './components/LibraryPanel.vue';
import OnboardingQuiz from './components/OnboardingQuiz.vue';
import TonightStrip from './components/TonightStrip.vue';
import AuthPanel from './components/AuthPanel.vue';

const accountLabel = computed(() => store.userEmail ? store.userEmail.split('@')[0] : 'Sign in');
const accountInitial = computed(() => (store.userEmail || 'G').charAt(0).toUpperCase());

const tabs = computed(() => [
  { id: 'verdict', label: 'Verdict' },
  { id: 'backlog', label: `Backlog${store.wishlist.length ? ` (${store.wishlist.length})` : ''}` },
  { id: 'compare', label: `Compare${store.compareList.length ? ` (${store.compareList.length})` : ''}` }
]);

const backdropStyle = computed(() => ({
  backgroundImage: `url('${store.currentGame.backdropImg}')`
}));
const lastCheckAge = computed(() => GameData.timeAgo(store.lastPriceCheckAt));

function openWishlist() {
  store.showWishlist = true;
  store.priceDropBadge = 0;
}

function dismissOnboarding() {
  completeOnboarding({ hours: 0, device: null, vibe: null });
}

function selectAndVerdict(g) {
  selectGame(g);
  setTab('verdict');
  document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
}

function researchCommunity(title) {
  store.query = title;
  setTab('verdict');
  search();
}

function openRated(title) {
  store.query = title;
  setTab('verdict');
  search();
}

function compareDecision(g) {
  return GameData.decisionFor(g, { weeklyHours: store.weeklyHours, useSale: store.useSalePrice, hoursMode: store.hoursMode, device: store.device }).action;
}

function compareValue(g) {
  const c = GameData.costPerHourOf(g, { useSale: store.useSalePrice, hoursMode: store.hoursMode });
  return c == null ? '—' : `$${c.value.toFixed(2)}/hr`;
}

function onKey(e) {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
    e.preventDefault();
    setTab('verdict');
    document.getElementById('searchInput')?.focus();
  }
  if (e.key === 'Escape') {
    store.showCoffee = false;
    store.showWishlist = false;
    store.showAuth = false;
  }
}

onMounted(async () => {
  // Boot-time cloud connect from VITE_ env. Failures land in the
  // Library → Cloud sync status, never silent.
  await ensureSync();
  unsubAuth = await subscribeAuth();
  handleAuthReturn();
  fetchCommunity(store.currentGame);
  fetchTopCommunity();
  window.addEventListener('keydown', onKey);
  const vid = new URLSearchParams(location.search).get('v');
  if (vid && await loadSharedSnapshot(vid)) {
    if (store.wishlist.length) checkPrices({ auto: true, limit: 10 });
    return;
  }
  initFromHash();
  if (store.wishlist.length) checkPrices({ auto: true, limit: 10 });
});
let unsubAuth = null;
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  if (unsubAuth) unsubAuth();
});
</script>
