<template>
  <section id="heroCard" class="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <div class="w-full sm:w-48 h-64 rounded-2xl overflow-hidden shrink-0 cover-shadow bg-zinc-800 relative group">
        <img :src="game.headerImg" alt="Game Cover Art" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute bottom-2 right-2 px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-950/80 text-emerald-400 border border-zinc-700 backdrop-blur-sm">
          ${{ game.basePriceUsd.toFixed(2) }}
        </div>
      </div>

      <div class="flex-1 space-y-4 w-full">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{{ game.verdictBadge }}</span>
            <span v-if="game.isLive" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 shadow-sm" :title="game.liveSource || 'Live reviews'">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ game.liveSource || 'Live reviews' }}</span>
            </span>
            <span v-if="(game.subscriptionServices || []).some(s => s.toLowerCase().includes('game pass'))" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700">🟢 Included with Game Pass</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">{{ game.title }}</h2>
          <div class="flex gap-2 mt-1">
            <button @click="toggleWishlist(game)" class="text-xs px-2 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500">{{ isWishlisted(game) ? '❤️ Saved' : '🤍 Wishlist' }}</button>
            <button @click="toggleCompare(game)" class="text-xs px-2 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:border-emerald-500">⚖️ Compare</button>
          </div>
          <div class="text-xs text-zinc-400 mt-1 font-mono">{{ game.releaseYear }} · Dev. {{ game.developer }} · Pub. {{ game.publisher }} · {{ game.genres.join(', ') }}</div>
        </div>

        <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-zinc-300">Unified Player & Critic Consensus <span class="text-[10px] font-normal text-zinc-500">(Steam + OpenCritic + Backlog)</span></span>
            <span class="font-black text-emerald-400 text-lg font-mono">{{ game.unifiedConsensusPercent }}%</span>
          </div>
          <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" :style="{ width: game.unifiedConsensusPercent + '%' }"></div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 font-bold uppercase">Steam Rating</div>
            <div class="text-base font-black text-white mt-0.5">{{ game.scores.steamPositivePercent }}%</div>
            <div class="text-[9px] text-emerald-400 mt-0.5 truncate">{{ game.scores.steamStatus }}</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 font-bold uppercase">OpenCritic</div>
            <div class="text-base font-black text-emerald-400 mt-0.5">{{ game.scores.openCritic }}</div>
            <div class="text-[9px] text-zinc-400 mt-0.5">Top Critic Avg</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 font-bold uppercase">Metacritic</div>
            <div class="text-base font-black text-white mt-0.5">{{ game.scores.metaCritic }}</div>
            <div class="text-[9px] text-zinc-400 mt-0.5">Metascore / 100</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 font-bold uppercase">Backlog User</div>
            <div class="text-base font-black text-teal-400 mt-0.5">{{ game.scores.userBacklogRating }}</div>
            <div class="text-[9px] text-zinc-400 mt-0.5">⭐ / 10</div>
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
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">⏳ Backlog Hours</div>
          <div class="font-bold text-white text-sm">{{ game.realityCheck.mainStoryHours }} hrs (Main)</div>
          <div class="text-[10px] text-zinc-500">~{{ game.realityCheck.completionistHours }} hrs for 100% completionist run</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">🎮 Steam Deck / Handheld</div>
          <div class="font-bold text-teal-300 text-xs truncate">{{ game.realityCheck.steamDeckRating }}</div>
          <div class="text-[10px] text-zinc-500">Frame stability & battery profile</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">💎 Monetization Model</div>
          <div class="font-bold text-zinc-200 text-xs">{{ game.realityCheck.monetization }}</div>
          <div class="text-[10px] text-zinc-500">Battle passes, MTX, or 100% clean</div>
        </div>
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
      <div v-if="game.isLive && game.liveLinks" class="flex flex-wrap gap-2 pt-1 text-[11px]">
        <span class="text-zinc-500">Verify live:</span>
        <a v-if="game.liveLinks.steamAppID" :href="`https://store.steampowered.com/app/${game.liveLinks.steamAppID}/`" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">Steam store ↗</a>
        <a v-if="game.liveLinks.openCritic" :href="game.liveLinks.openCritic" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">OpenCritic ↗</a>
        <a v-if="game.liveLinks.metacritic" :href="game.liveLinks.metacritic" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">Metacritic ↗</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { store, isWishlisted, toggleWishlist, toggleCompare } from '../store.js';

defineProps({ game: { type: Object, required: true } });
</script>
