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
    <div class="flex flex-wrap gap-2 text-[11px]">
      <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 cursor-pointer">
        <input type="checkbox" v-model="store.useSalePrice" class="accent-emerald-500" /> Use sale price when available
      </label>
      <div class="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300">
        <button @click="store.hoursMode = 'main'" :class="['px-2 py-0.5 rounded-full', store.hoursMode === 'main' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400']">Main story</button>
        <button @click="store.hoursMode = 'completionist'" :class="['px-2 py-0.5 rounded-full', store.hoursMode === 'completionist' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400']">100%</button>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
        <label class="block text-xs font-bold text-zinc-300">Your Free Gaming Time / Week:</label>
        <div class="flex items-center gap-3">
          <input type="range" min="2" max="40" v-model.number="store.weeklyHours" class="flex-1 accent-emerald-500" aria-label="Weekly free gaming hours" />
          <span class="font-mono text-emerald-400 font-bold text-sm w-12 text-right">{{ store.weeklyHours }} hrs</span>
        </div>
        <div class="text-[10px] text-zinc-500">e.g. 1 hour/day + weekend session</div>
      </div>
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Time to Complete {{ store.hoursMode === 'completionist' ? '100%' : 'Campaign' }}</div>
        <div class="text-2xl font-black text-white font-mono">{{ weeksToBeat == null ? '—' : `${weeksToBeat} Weeks` }}</div>
        <div class="text-[10px] text-zinc-500">{{ weeksToBeat == null ? 'Hours unknown — check Steam / HLTB' : `~${(weeksToBeat / 4.3).toFixed(1)} months of your gaming time · ${priceNote}` }}</div>
      </div>
      <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cost-per-Joy-Hour</div>
        <div class="text-2xl font-black text-emerald-400 font-mono">{{ costPerHour == null ? '—' : `$${costPerHour} / hr` }}</div>
        <div class="text-[10px] text-emerald-300">{{ verdictTip }}</div>
      </div>
    </div>
    <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
      <div class="font-bold text-zinc-300">📚 Wishlist backlog queue ({{ store.wishlist.length }}):</div>
      <div class="text-zinc-400">Total <span class="text-white font-mono font-bold">{{ backlogTotals.hours }}h</span> · <span class="text-white font-mono font-bold">{{ backlogTotals.weeks.toFixed(1) }} weeks</span> at your pace</div>
      <div class="text-zinc-400">Cost <span class="text-emerald-400 font-mono font-bold">${{ backlogTotals.cost.toFixed(2) }}</span> · avg <span class="font-mono font-bold text-white">${{ backlogTotals.avgPerHour.toFixed(2) }}/hr</span></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { store, weeksToBeat, costPerHour, backlogTotals, effectivePrice } from '../store.js';

const verdictTip = computed(() => {
  if (costPerHour.value == null) return '❓ Hours unknown — no value call until playtime is known.';
  const c = parseFloat(costPerHour.value);
  if (c < 1.0) return '💎 S-Tier Value: Cheaper than a cup of coffee per hour of joy.';
  if (c < 2.5) return '🟢 High Value: Far more cost-effective than cinema or concerts.';
  return '⚠️ Premium Ticket: Wait for a 30% Steam sale if backlog is full.';
});
const priceNote = computed(() => {
  const g = store.currentGame;
  const sale = store.useSalePrice && g.salePrice != null && g.salePrice < g.basePriceUsd;
  return sale ? `sale $${g.salePrice.toFixed(2)} (was $${g.basePriceUsd.toFixed(2)})` : `$${effectivePrice(g).toFixed(2)}`;
});
</script>
