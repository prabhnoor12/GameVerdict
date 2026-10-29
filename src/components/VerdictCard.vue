<template>
  <section id="heroCard" class="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
    <div :class="['p-4 rounded-2xl border text-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4', decisionToneClass]">
      <span class="font-black text-base whitespace-nowrap">{{ decision.action }}</span>
      <span class="text-xs opacity-90">{{ decision.reason }}</span>
      <span v-if="decisionMeta" class="text-[11px] font-mono opacity-80 sm:ml-auto shrink-0">{{ decisionMeta }}</span>
    </div>
    <div v-if="game.sharedSnapshot" class="p-3 rounded-2xl bg-teal-950/40 border border-teal-700/60 text-[11px] text-teal-200">
      🔗 Shared verdict snapshot — numbers frozen at share time{{ sharedAge ? ` (${sharedAge} ago)` : '' }}.
    </div>
    <div v-if="game.isEstimate" class="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-[11px] text-amber-200 flex items-center justify-between gap-3 flex-wrap">
      <span v-if="game.liveDown">Live reviews unreachable right now — this is a no-data card, not a verdict. <button @click="retrySearch" :disabled="store.isLoading" class="underline underline-offset-2 font-bold hover:text-amber-100 disabled:opacity-60">Retry live lookup</button></span>
      <span v-else>{{ game.estimateNote || 'Not enough data — live reviews are unreachable and this title is not curated. No score shown rather than a guessed one.' }}</span>
    </div>
    <div v-if="game.split" class="p-3 rounded-2xl bg-rose-950/40 border border-rose-700/60 text-[11px] text-rose-200">
      ⚖️ Players vs critics split: {{ game.split.low.label }} {{ game.split.low.value }} vs {{ game.split.high.label }} {{ game.split.high.value }} ({{ game.split.gap }}-point gap). The average describes neither side — read both.
    </div>
    <div v-else-if="game.coverage === 'thin'" class="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-[11px] text-amber-200">
      🔍 Thin data: a single source backs this score. Provisional — revisit when a second source lands.
    </div>
    <div v-if="game.bomb" class="p-3 rounded-2xl bg-rose-950/40 border border-rose-700/60 text-[11px] text-rose-200">
      🚨 Possible review-bombing: recent reviews sit at {{ game.bomb.recentPct }}% (n={{ game.bomb.recentN }}) against {{ game.bomb.overallPct }}% overall — a {{ game.bomb.gap }}-point crater. Read recent reviews before trusting the average.
    </div>
    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <div class="w-full sm:w-48 h-48 sm:h-64 rounded-2xl overflow-hidden shrink-0 cover-shadow bg-zinc-800 relative group">
        <img :src="game.headerImg" alt="Game Cover Art" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute bottom-2 right-2 px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-950/80 text-emerald-400 border border-zinc-700 backdrop-blur-sm">
          <span v-if="game.salePrice != null && game.salePrice < game.basePriceUsd"><s class="text-zinc-500 font-normal mr-1">${{ game.basePriceUsd.toFixed(2) }}</s>${{ game.salePrice.toFixed(2) }}</span>
          <span v-else>${{ game.basePriceUsd.toFixed(2) }}</span>
        </div>
      </div>

      <div class="flex-1 space-y-4 w-full">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border', badgeClass]">{{ game.verdictBadge }}</span>
            <span v-if="game.isLive" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 shadow-sm" :title="game.liveSource || 'Live reviews'">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ game.liveSource || 'Live reviews' }}</span>
            </span>
            <span v-if="game.isEstimate" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-700">Estimated</span>
            <span v-if="game.confidence" class="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-zinc-950 text-zinc-300 border border-zinc-700" :title="`Review-count confidence: ${game.confidence.detail}`">
              {{ game.confidence.level }} confidence · {{ game.confidence.detail }}
            </span>
            <span v-if="game.stale" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-700" title="Review sources are unreachable right now — showing the last good data instead of nothing">
              Stale data
            </span>
            <span v-else-if="game.seedPooled && seedAge" class="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-zinc-950 text-zinc-300 border border-zinc-700" :title="`Weekly static snapshot from ${seedAge}`">
              Snapshot · {{ seedAge }}
            </span>
            <span v-if="(game.subscriptionServices || []).some(s => s.toLowerCase().includes('game pass'))" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700">🟢 Included with Game Pass</span>
          </div>
          <h2 class="text-xl sm:text-3xl font-black text-white leading-tight">{{ game.title }}</h2>
          <div class="sticky top-14 z-10 -mx-1 px-1 py-2 bg-zinc-900/95 backdrop-blur flex gap-2 mt-2 flex-wrap">
            <button @click="toggleWishlist(game)" class="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500 min-h-[40px]">{{ isWishlisted(game) ? 'Saved' : 'Save' }}</button>
            <button @click="toggleCompare(game)" class="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500 min-h-[40px]">Compare</button>
            <button @click="shareVerdict(game)" class="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500 min-h-[40px]">Share</button>
            <button @click="downloadImage(game)" class="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500 min-h-[40px]">Image</button>
          </div>
          <div class="flex items-center gap-1.5 mt-2 flex-wrap" role="group" aria-label="Rate this game">
            <span class="text-[11px] text-zinc-500">Your rating:</span>
            <button
              v-for="s in [1,2,3,4,5,6,7,8,9,10]"
              :key="s"
              @click="rateGame(game, s)"
              :aria-pressed="myRating === s"
              :class="['w-8 h-8 rounded-lg text-[11px] font-bold border transition', myRating === s ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white']"
            >{{ s }}</button>
            <span v-if="myRating" class="text-[11px] text-emerald-300 font-bold">{{ myRating }}/10 saved</span>
          </div>
          <div class="text-xs text-zinc-400 mt-1 font-mono">{{ game.releaseYear }} · Dev. {{ game.developer }} · Pub. {{ game.publisher }} · {{ game.genres.join(', ') }}</div>
        </div>

        <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-zinc-300" title="Steam 55% · Metacritic 35% · Backlog-user 10%, Bayesian-weighted by review count">Unified Player & Critic Consensus <span class="text-[10px] font-normal text-zinc-500">(Steam 55 · Meta 35 · User 10)</span></span>
            <span class="font-black text-emerald-400 text-lg font-mono">{{ game.unifiedConsensusPercent == null ? '—' : `${game.unifiedConsensusPercent}%` }}</span>
          </div>
          <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" :style="{ width: (game.unifiedConsensusPercent || 0) + '%' }"></div>
          </div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
            <span title="Raw source inputs — no hidden averaging">Steam {{ srcVal(game.scores?.steamPositivePercent, '%') }} · Meta {{ srcVal(game.scores?.metaCritic) }} · OC {{ srcVal(game.scores?.openCritic) }}</span>
            <span v-if="game.isLive && game.fetchedAt && !game.stale">Updated {{ age }}</span>
            <span v-if="game.trend" :class="trendClass">Recent reviews: {{ game.trend.direction }} ({{ game.trend.pct }}%, n={{ game.trend.n }})</span>
          </div>
          <div v-if="contributions.length" class="pt-1 space-y-1">
            <div class="flex h-1.5 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800" role="img" :aria-label="'Consensus sources: ' + contributions.map(c => `${c.label} ${Math.round(c.share)}%`).join(', ')">
              <div v-for="c in contributions" :key="c.label" :class="['h-full', c.cls]" :style="{ width: c.share + '%' }" :title="`${c.label} — ~${Math.round(c.share)}% weight`"></div>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-zinc-400">
              <span v-for="c in contributions" :key="c.label" class="flex items-center gap-1">
                <span :class="['w-1.5 h-1.5 rounded-full', c.cls]"></span>{{ c.label }} {{ c.value }}
              </span>
              <span v-if="game.isLive && game.liveLinks" class="flex items-center gap-1.5">
                <span class="text-zinc-600">·</span>
                <a v-if="game.liveLinks.steamAppID" :href="`https://store.steampowered.com/app/${game.liveLinks.steamAppID}/`" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">Steam ↗</a>
                <a v-if="game.liveLinks.openCritic" :href="game.liveLinks.openCritic" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">OpenCritic ↗</a>
                <a v-if="game.liveLinks.metacritic" :href="game.liveLinks.metacritic" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">Metacritic ↗</a>
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-zinc-950 border border-zinc-800">
          <button @click="expanded = !expanded" :aria-expanded="expanded" class="w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-[44px] text-xs">
            <span class="font-bold text-zinc-300">Score breakdown</span>
            <span class="text-zinc-400 font-mono truncate">{{ scoreSummary }} <span class="text-zinc-500">{{ expanded ? '▾' : '▸' }}</span></span>
          </button>
          <div v-if="expanded" class="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 pb-3 text-center text-xs">
            <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div class="text-[10px] text-zinc-500 font-bold uppercase">Steam Rating</div>
              <div class="text-base font-black text-white mt-0.5">{{ game.scores?.steamPositivePercent == null ? '—' : `${game.scores.steamPositivePercent}%` }}</div>
              <div class="text-[9px] text-emerald-400 mt-0.5 truncate">{{ game.scores?.steamStatus || 'No data' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div class="text-[10px] text-zinc-500 font-bold uppercase">OpenCritic</div>
              <div class="text-base font-black text-emerald-400 mt-0.5">{{ game.scores?.openCritic ?? '—' }}</div>
              <div class="text-[9px] text-zinc-400 mt-0.5">Top Critic Avg</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div class="text-[10px] text-zinc-500 font-bold uppercase">Metacritic</div>
              <div class="text-base font-black text-white mt-0.5">{{ game.scores?.metaCritic ?? '—' }}</div>
              <div class="text-[9px] text-zinc-400 mt-0.5">Metascore / 100</div>
            </div>
            <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div class="text-[10px] text-zinc-500 font-bold uppercase">Backlog User</div>
              <div class="text-base font-black text-teal-400 mt-0.5">{{ game.scores?.userBacklogRating ?? '—' }}</div>
              <div class="text-[9px] text-zinc-400 mt-0.5">Curator score / 10</div>
            </div>
          </div>
          <div v-if="expanded" class="px-3 pb-3 text-[11px] text-zinc-400 flex items-center gap-x-2 gap-y-1 flex-wrap">
            <span v-if="store.communityLoading">Loading community ratings…</span>
            <span v-else-if="store.communityVotes > 0">Community backlog avg: <span class="text-teal-300 font-bold font-mono">{{ store.communityAvg }}/10</span> <span class="text-zinc-500">({{ store.communityVotes }} votes)</span></span>
            <span v-else>No community votes yet — yours could be first.</span>
            <span v-if="myRating" class="text-emerald-300 font-bold">You rated {{ myRating }}/10</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-3 pt-4 border-t border-zinc-800">
      <h3 class="font-bold text-sm text-zinc-200 flex items-center justify-between">
        <div class="flex items-center gap-2"><span>⚡</span><span>The 3-Sentence Gamer Decision Box:</span></div>
        <span class="text-[10px] text-zinc-500 font-normal">Zero Spoilers · Distilled Truth</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-1">
          <div class="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">🟢 The Core Loop & Hook</div>
          <p class="text-zinc-200 leading-relaxed">{{ game.threeSentenceVerdict.coreHook }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-1">
          <div class="font-bold text-rose-400 uppercase tracking-wider text-[10px]">🔴 The Friction, Grind & Flaw</div>
          <p class="text-zinc-200 leading-relaxed">{{ game.threeSentenceVerdict.hiddenFriction || game.threeSentenceVerdict.flaw }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-teal-950/20 border border-teal-900/60 space-y-1">
          <div class="font-bold text-teal-400 uppercase tracking-wider text-[10px]">🎯 Who Should Play / Skip</div>
          <p class="text-zinc-200 leading-relaxed">{{ game.threeSentenceVerdict.targetAudience }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-3 pt-4 border-t border-zinc-800">
      <h3 class="font-bold text-sm text-zinc-200">🛠️ Gamer Reality Gauge:</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">⏱️ Time-to-Fun (TTF)</div>
          <div class="font-bold text-emerald-400 text-sm">{{ game.realityCheck.timeToFun }}</div>
          <div class="text-[10px] text-zinc-500">How long until the actual fun starts</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">⏳ Backlog Hours <span v-if="game.realityCheck.hoursEstimated" class="text-amber-300 normal-case font-medium">(est.)</span></div>
          <div class="font-bold text-white text-sm">{{ game.realityCheck.hoursUnknown ? 'Unknown' : `${game.realityCheck.mainStoryHours} hrs (Main)` }}</div>
          <div v-if="!game.realityCheck.hoursUnknown" class="text-[10px] text-zinc-500">~{{ game.realityCheck.completionistHours }} hrs for 100% completionist run</div>
          <div v-if="game.realityCheck.sampledMedianHrs != null" class="text-[10px] text-teal-300">Sampled Steam players: median {{ game.realityCheck.sampledMedianHrs }}h (n={{ game.realityCheck.sampledN }})</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">🎮 Steam Deck / Handheld <span v-if="game.realityCheck.deckEstimated" class="text-amber-300 normal-case font-medium">(est.)</span></div>
          <div class="font-bold text-xs" :class="deckClass">{{ deckLabel }}</div>
          <div class="text-[10px] text-zinc-500">{{ deckSub }}</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">💎 Monetization Model</div>
          <div class="font-bold text-zinc-200 text-xs">{{ game.realityCheck.monetization }}</div>
          <div class="text-[10px] text-zinc-500">Battle passes, MTX, or 100% clean</div>
        </div>
      </div>
    </div>

    <div v-if="deviceLine || familyText || featureChips.length" class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5">
      <div v-if="deviceLine" class="flex items-center gap-1.5">
        <span :class="deviceLine.class">{{ deviceLine.text }}</span>
      </div>
      <div v-if="familyText" class="text-zinc-300">👨‍👩‍👧 {{ familyText }} <span class="text-zinc-500">(per Steam store data)</span></div>
      <div v-if="featureChips.length" class="flex flex-wrap gap-1.5">
        <span v-for="c in featureChips" :key="c" class="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300">{{ c }}</span>
      </div>
    </div>

    <div class="space-y-3 pt-4 border-t border-zinc-800">
      <h3 class="font-bold text-sm text-zinc-200">💡 If you like this, try:</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="g in similar"
          :key="g.id"
          @click="selectGame(g)"
          class="px-3 py-1.5 rounded-xl text-xs border bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-emerald-500 hover:text-white transition flex items-center gap-1.5"
        >
          <span class="font-medium">{{ g.title }}</span>
          <span class="font-mono text-emerald-400 text-[10px]">{{ g.unifiedConsensusPercent }}%</span>
          <span class="text-zinc-500 text-[10px]">{{ (g.genres || []).slice(0, 2).join(' · ') }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Available Platforms & Stores:</div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="p in game.platforms" :key="p" class="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 font-mono">{{ p }}</span>
        </div>
      </div>
      <div class="text-right sm:border-l sm:border-zinc-800 sm:pl-4">
        <template v-if="(game.subscriptionServices || []).length">
          <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Subscription Freebie:</div>
          <div class="text-xs text-white font-medium">{{ game.subscriptionServices.join(', ') }}</div>
        </template>
        <template v-else>
          <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Subscription Status:</div>
          <div class="text-xs text-zinc-400">Standard Retail Only</div>
        </template>
      </div>
    </div>

    <div class="space-y-3 pt-4 border-t border-zinc-800">
      <h3 class="font-bold text-sm text-zinc-200 flex items-center justify-between">
        <span>Unfiltered Community & Critic Truth:</span>
        <span class="text-xs text-zinc-500 font-normal">Steam Top Helpful · Press · Tech Labs</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="(q, i) in game.topQuotes" :key="i" class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between text-xs space-y-2">
          <p class="text-zinc-300 italic leading-relaxed text-[11px]">"{{ q.quote }}"</p>
          <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[10px]">
            <span class="font-bold text-white truncate">{{ q.author }}</span>
            <a v-if="q.url" :href="q.url" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2 shrink-0">{{ q.source }} ↗</a>
            <span v-else class="text-zinc-500 shrink-0">{{ q.source }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { store, similarGames, isWishlisted, toggleWishlist, toggleCompare, selectGame, seedMeta, shareVerdict, decision, weeksToBeat, costPerHour, rateGame, retrySearch } from '../store.js';
import { downloadVerdictImage } from '../../js/share-image.js';
import { GameData } from '../../js/game-data.js';

function downloadImage(game) {
  downloadVerdictImage(game);
}
const sharedAge = computed(() => props.game.sharedAt ? GameData.timeAgo(props.game.sharedAt) : '');

const props = defineProps({ game: { type: Object, required: true } });
const similar = similarGames;
const expanded = ref(true);

const decisionToneClass = computed(() => ({
  emerald: 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200',
  amber: 'bg-amber-950/50 border-amber-700/60 text-amber-200',
  rose: 'bg-rose-950/50 border-rose-700/60 text-rose-200',
  zinc: 'bg-zinc-950/60 border-zinc-700/60 text-zinc-300'
}[decision.value.tone] || 'bg-zinc-950/60 border-zinc-700/60 text-zinc-300'));

const decisionMeta = computed(() => {
  const bits = [];
  if (decision.value.weeks != null) bits.push(`${decision.value.weeks} wks at ${store.weeklyHours}h/wk`);
  if (decision.value.cph != null) bits.push(`$${decision.value.cph.toFixed(2)}/hr`);
  if (weeksToBeat.value == null && costPerHour.value == null) return bits.join(' · ');
  return bits.join(' · ');
});

const myRating = computed(() => {
  const r = store.myRatings?.[props.game.id];
  return typeof r === 'number' ? r : (r?.score ?? null);
});
const seedAge = computed(() => seedMeta.value?.generatedAt ? GameData.timeAgo(seedMeta.value.generatedAt) : '');

/** Nominal consensus weights (Steam 55 · Metacritic 35 · Backlog-user 10),
 *  renormalized over whichever sources are present. Approximate by design. */
const contributions = computed(() => {
  const s = props.game.scores || {};
  const parts = [];
  if (s.steamPositivePercent != null) parts.push({ label: 'Steam', value: `${s.steamPositivePercent}%`, w: 55, cls: 'bg-emerald-400' });
  if (s.metaCritic != null) parts.push({ label: 'Meta', value: s.metaCritic, w: 35, cls: 'bg-teal-300' });
  if (s.userBacklogRating != null) parts.push({ label: 'You', value: s.userBacklogRating, w: 10, cls: 'bg-zinc-400' });
  const total = parts.reduce((a, p) => a + p.w, 0) || 1;
  return parts.map((p) => ({ ...p, share: (p.w / total) * 100 }));
});

const scoreSummary = computed(() => {
  const s = props.game.scores || {};
  const bits = [];
  if (s.steamPositivePercent != null) bits.push(`Steam ${s.steamPositivePercent}%`);
  if (s.openCritic != null) bits.push(`OC ${s.openCritic}`);
  if (s.metaCritic != null) bits.push(`Meta ${s.metaCritic}`);
  if (s.userBacklogRating != null) bits.push(`You ${s.userBacklogRating}`);
  return bits.length ? bits.join(' · ') : 'No scores yet';
});

const badgeClass = computed(() => ({
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  zinc: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40'
}[props.game.badgeType] || 'bg-amber-500/20 text-amber-300 border-amber-500/40'));
const age = computed(() => GameData.timeAgo(props.game.fetchedAt));
const trendClass = computed(() => ({
  rising: 'text-emerald-300',
  falling: 'text-rose-300',
  steady: 'text-zinc-400'
}[props.game.trend?.direction] || 'text-zinc-400'));
function srcVal(v, suffix = '') {
  return v == null ? '—' : `${v}${suffix}`;
}

const DEVICE_NAMES = { pc: 'PC', deck: 'Steam Deck', laptop: 'old laptop', ps5: 'PS5', xbox: 'Xbox', switch: 'Switch' };
const deviceLine = computed(() => {
  if (!store.device || store.device === 'pc') return null;
  const fit = GameData.deviceFit(props.game, store.device);
  const name = DEVICE_NAMES[store.device] || store.device;
  if (fit === 'fits') return { text: `✅ Plays on your ${name}`, class: 'text-emerald-300 font-bold' };
  if (fit === 'no') return { text: `Not listed for ${name}`, class: 'text-zinc-400' };
  return null;
});
const familyText = computed(() => GameData.familyLine(props.game.family));
const featureChips = computed(() => {
  const chips = [];
  const f = props.game.features;
  if (f?.controller === 'full') chips.push('🎮 Full controller support');
  else if (f?.controller === 'partial') chips.push('🎮 Partial controller support');
  for (const c of f?.coop || []) chips.push(`👥 ${c}`);
  return chips;
});

const deck = computed(() => GameData.getDeckInfo(store.currentGame.realityCheck.steamDeckRating));
const deckLabel = computed(() => {
  const d = deck.value;
  return d.status + (d.fps ? ` · ${d.fps} FPS` : '') + (d.battery ? ` · ${d.battery}` : '');
});
const deckSub = computed(() => {
  const raw = store.currentGame.realityCheck.steamDeckRating || '';
  const short = raw.replace(/^[^(]*\(/, '').replace(/\)$/, '');
  return short || 'Frame stability & battery profile';
});
const deckClass = computed(() => ({
  Verified: 'text-teal-300',
  Playable: 'text-amber-300',
  Unsupported: 'text-rose-400'
}[deck.value.status] || 'text-zinc-200'));
</script>
