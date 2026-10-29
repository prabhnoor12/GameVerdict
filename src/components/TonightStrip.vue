<template>
  <section aria-label="Play tonight picks" class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h2 class="font-bold text-sm text-white">Play tonight — best value, ready to start</h2>
      <span class="text-[11px] text-zinc-500">High consensus per hour · updates with your pace</span>
    </div>
    <div v-if="!tonightPicks.length" class="text-xs text-zinc-500">No quick picks yet — search a game to get started.</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <button
        v-for="g in tonightPicks"
        :key="g.id"
        @click="selectGame(g)"
        :class="['text-left p-3 rounded-xl border transition min-h-[64px]', store.currentGame.id === g.id ? 'bg-emerald-950/60 border-emerald-500/60' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600']"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-xs text-white truncate">{{ g.title }}</span>
          <span class="font-mono text-emerald-400 text-xs shrink-0">{{ g.unifiedConsensusPercent }}%</span>
        </div>
        <div class="text-[11px] text-zinc-400 mt-1">{{ g.realityCheck.mainStoryHours }}h main · {{ (g.genres || []).slice(0, 2).join(' · ') }}</div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { store, tonightPicks, selectGame } from '../store.js';
</script>
