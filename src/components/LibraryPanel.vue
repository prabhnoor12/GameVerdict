<template>
  <section id="libraryPanel" class="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xl">📚</span>
        <h3 class="text-lg font-bold text-white">Owned Library & Backlog Triage</h3>
      </div>
      <button v-if="store.steamLibrary" @click="clearLibrary" class="text-[11px] text-zinc-500 hover:text-rose-300">Disconnect library</button>
    </div>

    <div v-if="!store.steamLibrary" class="space-y-3">
      <p class="text-xs text-zinc-400 max-w-xl">Paste your Steam profile to import every owned game with real playtime. Triage, queues, and progress all run on your actual library.</p>
      <form @submit.prevent="importLibrary" class="flex gap-2 max-w-xl">
        <input
          v-model="store.steamInput"
          type="text"
          placeholder="Steam profile URL, SteamID64, or vanity name…"
          class="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
          autocomplete="off"
        />
        <button type="submit" :disabled="store.libraryLoading" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold text-xs shrink-0">
          {{ store.libraryLoading ? 'Importing…' : 'Import' }}
        </button>
      </form>
      <p v-if="store.libraryError" class="text-[11px] text-amber-300 max-w-xl">⚠️ {{ store.libraryError }}</p>
      <p class="text-[11px] text-zinc-500 max-w-xl">Needs a free Steam API key on the server (<span class="font-mono">STEAM_API_KEY</span>) and a public game-details profile. No key yet? Add non-Steam games manually below — triage works on those too.</p>
      <form @submit.prevent="addManual" class="flex flex-wrap gap-2 max-w-xl items-center">
        <input v-model="manualName" type="text" placeholder="Game title…" class="flex-1 min-w-40 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500" />
        <input v-model="manualHrs" type="number" min="1" max="999" placeholder="Main hrs…" class="w-24 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500" />
        <button type="submit" class="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:border-emerald-500 text-xs font-bold">+ Add</button>
      </form>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center gap-3 text-xs">
        <img v-if="store.steamLibrary.persona?.avatar" :src="store.steamLibrary.persona.avatar" alt="" class="w-8 h-8 rounded-lg" />
        <div>
          <div class="font-bold text-white">{{ store.steamLibrary.persona?.name || 'Steam library' }}</div>
          <div class="text-zinc-500">{{ libraryStats.total }} owned · {{ libraryStats.unplayed }} unplayed · {{ libraryStats.hoursPlayed }}h sunk · {{ libraryStats.stale90 }} untouched 90d+</div>
        </div>
      </div>
      <p v-if="store.enrichProgress" class="text-[11px] text-emerald-300">{{ store.enrichProgress }}</p>
      <div v-if="(store.steamLibrary.recent || []).length" class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
        <div class="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">🕹️ Last 2 weeks (Steam activity)</div>
        <div v-for="r in store.steamLibrary.recent.slice(0, 5)" :key="r.appid" class="flex items-center justify-between text-xs">
          <span class="text-zinc-200 truncate">{{ r.name }}</span>
          <span class="font-mono text-teal-300 shrink-0 ml-2">{{ Math.round(r.playtime2wksMins / 60 * 10) / 10 }}h</span>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button @click="rollSurprise" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs">🎲 Surprise me</button>
        <span v-if="surpriseText" class="text-xs text-zinc-200">{{ surpriseText }}</span>
        <button v-if="surprisePick" @click="verdictForOwned(surprisePick)" class="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold">Verdict →</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-2">
          <div class="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">🏁 Finish these (started, stalled, winnable)</div>
          <div v-if="!triage.finish.length" class="text-[11px] text-zinc-500">Nothing stalled — or enrichment still running.</div>
          <div v-for="g in triage.finish.slice(0, 5)" :key="g.appid || g.manualId" class="flex items-center justify-between gap-2 text-xs">
            <span class="text-zinc-200 truncate">{{ g.name }} <span class="text-zinc-500">· {{ g.remainingHrs }}h left</span></span>
            <button @click="verdictForOwned(g)" class="text-emerald-400 hover:text-emerald-300 shrink-0 text-[11px] font-bold">Verdict →</button>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-2">
          <div class="font-bold text-rose-400 uppercase tracking-wider text-[10px]">✂️ Cut or start (never played)</div>
          <div v-if="!triage.cut.length" class="text-[11px] text-zinc-500">No unplayed pile with hour data yet.</div>
          <div v-for="g in triage.cut.slice(0, 5)" :key="g.appid || g.manualId" class="flex items-center justify-between gap-2 text-xs">
            <span class="text-zinc-200 truncate">{{ g.name }} <span class="text-zinc-500">· ~{{ g.remainingHrs }}h ask</span></span>
            <button @click="verdictForOwned(g)" class="text-emerald-400 hover:text-emerald-300 shrink-0 text-[11px] font-bold">Verdict →</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
          <div class="font-bold text-teal-300 uppercase tracking-wider text-[10px]">🌙 Weeknight queue (short sessions)</div>
          <div v-if="!weeknightQueue.length" class="text-[11px] text-zinc-500">No short-loop games waiting.</div>
          <div v-for="g in weeknightQueue" :key="g.appid || g.manualId" class="text-xs text-zinc-200 truncate">{{ g.name }} <span class="text-zinc-500">· ~{{ g.estMainHrs }}h</span></div>
        </div>
        <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
          <div class="font-bold text-teal-300 uppercase tracking-wider text-[10px]">🗓️ Weekend epics</div>
          <div v-if="!weekendQueue.length" class="text-[11px] text-zinc-500">No epic commitments waiting.</div>
          <div v-for="g in weekendQueue" :key="g.appid || g.manualId" class="text-xs text-zinc-200 truncate">{{ g.name }} <span class="text-zinc-500">· ~{{ g.estMainHrs }}h</span></div>
        </div>
      </div>

      <div v-if="seriesWatch.length" class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
        <div class="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">🔗 Series catch-up (heuristic)</div>
        <div v-for="s in seriesWatch" :key="s.base" class="text-xs text-zinc-300">
          <span class="font-bold text-white">{{ s.base }}</span>
          <span class="text-zinc-500"> — {{ s.entries.map(e => e.name).join(' → ') }}</span>
          <span v-if="s.missingPredecessor" class="text-amber-300"> · sequel started before the original</span>
        </div>
      </div>

      <div class="space-y-2">
        <input v-model="filter" type="text" placeholder="Filter owned games…" class="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500" />
        <div v-for="g in ownedFiltered" :key="g.appid || g.manualId" class="flex items-center gap-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
          <div class="flex-1 min-w-0">
            <div class="text-zinc-200 font-medium truncate">{{ g.name }}</div>
            <div class="h-1 mt-1 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500" :style="{ width: progressPct(g) + '%' }"></div>
            </div>
            <div class="text-[10px] text-zinc-500 mt-0.5">{{ progressLabel(g) }}</div>
          </div>
          <button
            v-if="g.appid"
            @click="fetchAchievements(g.appid)"
            class="text-amber-300 hover:text-amber-200 shrink-0 text-[11px] font-bold"
            :title="achLabel(g.appid)"
          >{{ achText(g.appid) }}</button>
          <button @click="verdictForOwned(g)" class="text-emerald-400 hover:text-emerald-300 shrink-0 text-[11px] font-bold">Verdict →</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  store, libraryStats, triage, seriesWatch, weeknightQueue, weekendQueue,
  enrichedOwned, importLibrary, clearLibrary, addManualGame, verdictForOwned, surprise,
  fetchAchievements
} from '../store.js';

function achText(appid) {
  const a = store.achievements[appid];
  if (!a) return '🏆 %';
  if (a.loading) return '🏆 …';
  if (a.error) return '🏆 —';
  return `🏆 ${a.pct}%`;
}
function achLabel(appid) {
  const a = store.achievements[appid];
  if (a?.done && !a.error) return `${a.unlocked}/${a.total} achievements unlocked`;
  if (a?.error) return a.error;
  return 'Check achievement completion';
}

const filter = ref('');
const manualName = ref('');
const manualHrs = ref('');
const surprisePick = ref(null);
const surpriseText = ref('');

function rollSurprise() {
  const { pick, reason } = surprise();
  surprisePick.value = pick;
  surpriseText.value = reason;
}

function addManual() {
  addManualGame(manualName.value, manualHrs.value);
  manualName.value = '';
  manualHrs.value = '';
}

const ownedFiltered = computed(() => {
  const q = filter.value.trim().toLowerCase();
  const list = [...enrichedOwned.value].sort((a, b) => (b.playtimeMins || 0) - (a.playtimeMins || 0));
  if (!q) return list.slice(0, 30);
  return list.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 30);
});

function progressPct(g) {
  if (!g.estMainHrs) return 0;
  return Math.min(100, Math.round(((g.playtimeMins || 0) / 60 / g.estMainHrs) * 100));
}
function progressLabel(g) {
  const played = Math.round(((g.playtimeMins || 0) / 60) * 10) / 10;
  if (!g.estMainHrs) return `${played}h played · length unknown`;
  return `${played}h / ~${g.estMainHrs}h main`;
}
</script>
