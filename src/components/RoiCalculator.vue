<template>
  <section id="roiCalculatorCard" class="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl">🧮</span>
        <h3 class="text-lg font-bold text-white">Backlog ROI & Cost-per-Joy-Hour Calculator</h3>
      </div>
      <span class="text-xs text-zinc-500 font-mono">Personalized Reality Check</span>
    </div>
    <p class="text-xs text-zinc-400 max-w-xl">
      Adjust your weekly free gaming time to see how long it will take to beat this title and whether the cost-per-hour justifies starting now or waiting for a Steam sale.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
        <label class="block text-xs font-bold text-zinc-300">Your Free Gaming Time / Week:</label>
        <div class="flex items-center gap-3">
          <input type="range" min="2" max="40" v-model.number="store.weeklyHours" class="flex-1 accent-emerald-500" />
          <span class="font-mono text-emerald-400 font-bold text-sm w-12 text-right">{{ store.weeklyHours }} hrs</span>
        </div>
        <div class="text-[10px] text-zinc-500">e.g. 1 hour/day + weekend session</div>
      </div>
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Time to Complete Campaign</div>
        <div class="text-2xl font-black text-white font-mono">{{ weeksToBeat }} Weeks</div>
        <div class="text-[10px] text-zinc-500">~{{ (weeksToBeat / 4.3).toFixed(1) }} months of your gaming time</div>
      </div>
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cost-per-Joy-Hour</div>
        <div class="text-2xl font-black text-emerald-400 font-mono">${{ costPerHour }} / hr</div>
        <div class="text-[10px] text-emerald-300">{{ verdictTip }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { store, weeksToBeat, costPerHour } from '../store.js';

const verdictTip = computed(() => {
  const c = parseFloat(costPerHour.value);
  if (c < 1.0) return '💎 S-Tier Value: Cheaper than a cup of coffee per hour of joy.';
  if (c < 2.5) return '🟢 High Value: Far more cost-effective than cinema or concerts.';
  return '⚠️ Premium Ticket: Wait for a 30% Steam sale if backlog is full.';
});
</script>
