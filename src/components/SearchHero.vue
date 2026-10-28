<template>
  <section class="space-y-3 text-center">
    <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
      Is this game actually worth your 40 hours?
    </h1>
    <p class="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
      Zero marketing fluff. Unified consensus from
      <span class="text-emerald-400 font-semibold">Steam Community</span>,
      <span class="text-zinc-200 font-semibold">OpenCritic</span>,
      <span class="text-teal-400 font-semibold">HowLongToBeat</span>, and
      <span class="text-cyan-400 font-semibold">Steam Deck specs</span>
      in one 3-sentence card.
    </p>

    <form @submit.prevent="onSearch" class="max-w-xl mx-auto flex gap-2 pt-2 relative">
      <div class="relative flex-1">
        <input
          id="searchInput"
          v-model="store.query"
          @input="onInput"
          @keydown.down.prevent="moveHl(1)"
          @keydown.up.prevent="moveHl(-1)"
          @keydown.enter="chooseHl"
          type="text"
          placeholder="Search any game (e.g. Elden Ring, Hades 2, Balatro, Starfield)..."
          class="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500 shadow-xl"
          autocomplete="off"
          role="combobox"
          aria-expanded="false"
          aria-label="Search games"
        />
        <div class="absolute right-3 top-3.5 pointer-events-none text-[10px] text-zinc-500 font-mono kbd-badge px-1.5 py-0.5 rounded hidden sm:block">/</div>
        <ul v-if="store.suggestions.length" class="absolute z-30 mt-1 w-full text-left bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl">
          <li v-for="(g, i) in store.suggestions" :key="g.id">
            <button
              type="button"
              @click="pick(g)"
              :class="['w-full flex items-center justify-between px-3 py-2.5 text-xs min-h-[44px]', i === hl ? 'bg-emerald-950 text-emerald-200' : 'text-zinc-200 hover:bg-zinc-800']"
            >
              <span class="truncate">{{ g.title }} <span class="text-zinc-500">· {{ (g.genres || []).slice(0, 2).join(', ') }}</span></span>
              <span class="font-mono text-emerald-400 ml-2 shrink-0">{{ g.unifiedConsensusPercent }}%</span>
            </button>
          </li>
        </ul>
      </div>
      <button type="submit" :disabled="store.isLoading" class="btn-action px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold text-xs shadow-xl flex items-center gap-1.5 shrink-0">
        <span v-if="store.isLoading" class="animate-spin">⏳</span><span v-else>🔍</span><span>{{ store.isLoading ? 'Loading' : 'Verdict' }}</span>
      </button>
    </form>
    <p v-if="store.searchError" class="text-[11px] text-amber-300 max-w-xl mx-auto">⚠️ {{ store.searchError }}</p>

    <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
      <div class="flex flex-wrap gap-1.5 justify-center">
        <button
          v-for="p in store.presets"
          :key="p.id"
          @click="store.activeFilter = p.id"
          :class="['px-3 py-1.5 rounded-full text-xs font-semibold transition border min-h-[36px]', store.activeFilter === p.id ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md' : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700']"
        >{{ p.label }}</button>
      </div>
      <select v-model="store.sortBy" class="bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 px-3 py-1.5 min-h-[36px]" aria-label="Sort games">
        <option value="consensus">Sort: Consensus</option>
        <option value="price">Sort: Price</option>
        <option value="hours">Sort: Hours</option>
        <option value="value">Sort: Value ($/hr)</option>
      </select>
      <select :value="store.device" @change="setDevice($event.target.value)" class="bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 px-3 py-1.5 min-h-[36px]" aria-label="Your device">
        <option value="pc">Device: PC</option>
        <option value="deck">Device: Deck</option>
        <option value="laptop">Device: Old laptop</option>
        <option value="ps5">Device: PS5</option>
        <option value="xbox">Device: Xbox</option>
        <option value="switch">Device: Switch</option>
      </select>
    </div>

    <div v-if="!store.query && !store.suggestions.length && recents.length" class="pt-1">
      <div class="flex items-center justify-center gap-2 flex-wrap">
        <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recent:</span>
        <button
          v-for="r in recents"
          :key="r"
          @click="research(r)"
          class="px-3 py-1.5 rounded-xl text-xs border bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-emerald-500 hover:text-white transition min-h-[36px]"
        >{{ r }}</button>
        <button @click="clearRecents" aria-label="Clear recent searches" class="text-[11px] text-zinc-500 hover:text-rose-300 px-2 py-1.5 min-h-[36px]">✕</button>
      </div>
    </div>

    <div class="pt-2">
      <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Trending Games:</div>
      <div class="flex items-center gap-2 overflow-x-auto pb-1 snap-x sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          v-for="g in filteredGames"
          :key="g.id"
          @click="selectGame(g)"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition border flex items-center gap-1.5 shrink-0 snap-start min-h-[36px]', store.currentGame.id === g.id ? 'bg-emerald-950 border-emerald-500/80 text-emerald-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700']"
        >
          <span>{{ g.title }}</span>
          <span class="text-[10px] font-mono text-emerald-400">{{ g.unifiedConsensusPercent == null ? '—' : `${g.unifiedConsensusPercent}%` }}</span>
          <span v-if="g.isLive" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live data"></span>
          <span v-if="g.isEstimate" class="text-[9px] text-amber-300" title="Offline estimate">est</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { store, filteredGames, selectGame, search, refreshSuggestions, setDevice } from '../store.js';

const RECENTS_KEY = 'gv:recent-searches:v1';
function loadRecents() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}
const recents = ref(loadRecents());
function recordRecent(title) {
  const t = String(title || '').trim();
  if (!t) return;
  recents.value = [t, ...recents.value.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.value));
  } catch { /* private mode */ }
}
function clearRecents() {
  recents.value = [];
  try {
    localStorage.removeItem(RECENTS_KEY);
  } catch { /* noop */ }
}
function research(title) {
  store.query = title;
  search();
}

const hl = ref(-1);
let debounce = null;

function onInput() {
  hl.value = -1;
  clearTimeout(debounce);
  debounce = setTimeout(() => refreshSuggestions(), 250);
}
function moveHl(dir) {
  if (!store.suggestions.length) return;
  hl.value = (hl.value + dir + store.suggestions.length) % store.suggestions.length;
}
function chooseHl() {
  if (hl.value >= 0 && store.suggestions[hl.value]) pick(store.suggestions[hl.value]);
}
function onSearch() {
  recordRecent(store.query);
  search();
}
function pick(g) {
  store.query = g.title;
  recordRecent(g.title);
  selectGame(g);
  document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth' });
}
</script>
