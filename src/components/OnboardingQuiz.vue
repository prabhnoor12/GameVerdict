<template>
  <section v-if="!store.onboarded" class="bg-zinc-900/90 border border-emerald-500/40 rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-white text-sm">Three quick questions — we tune everything to you</h3>
      <button @click="skip" class="text-[11px] text-zinc-500 hover:text-white">Skip</button>
    </div>
    <div class="flex gap-1.5">
      <div v-for="i in 3" :key="i" :class="['h-1 flex-1 rounded-full', i <= step ? 'bg-emerald-500' : 'bg-zinc-800']"></div>
    </div>

    <div v-if="step === 1" class="space-y-2">
      <p class="text-xs text-zinc-300 font-bold">How much do you play in a normal week?</p>
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <button v-for="h in [3, 6, 10, 20]" :key="h" @click="hours = h" :class="['w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition min-h-[44px]', hours === h ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500']">{{ h }} hrs</button>
      </div>
    </div>

    <div v-if="step === 2" class="space-y-2">
      <p class="text-xs text-zinc-300 font-bold">Where do you mostly play?</p>
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <button
          v-for="d in devices"
          :key="d.id"
          @click="device = d.id"
          :class="['w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition min-h-[44px]', device === d.id ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500']"
        >{{ d.label }}</button>
      </div>
    </div>

    <div v-if="step === 3" class="space-y-2">
      <p class="text-xs text-zinc-300 font-bold">What nights are you chasing?</p>
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <button
          v-for="v in vibes"
          :key="v.id"
          @click="vibe = v.id"
          :class="['w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition min-h-[44px]', vibe === v.id ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500']"
        >{{ v.label }}</button>
      </div>
    </div>

    <div class="flex items-center justify-between pt-1">
      <button v-if="step > 1" @click="step--" class="text-[11px] text-zinc-400 hover:text-white">← Back</button>
      <span v-else></span>
      <button v-if="step < 3" @click="step++" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold">Next →</button>
      <button v-else @click="finish" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold">Tune my verdicts ✓</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { store, completeOnboarding } from '../store.js';

const step = ref(1);
const hours = ref(6);
const device = ref('pc');
const vibe = ref('story');

const devices = [
  { id: 'pc', label: '🖥️ PC' },
  { id: 'deck', label: '🎮 Steam Deck' },
  { id: 'laptop', label: '💻 Old laptop' },
  { id: 'ps5', label: '🎯 PS5' },
  { id: 'xbox', label: '🟢 Xbox' },
  { id: 'switch', label: '🔴 Switch' }
];
const vibes = [
  { id: 'epic', label: '🏆 Epic masterpieces' },
  { id: 'quick', label: '⚡ Quick wins' },
  { id: 'social', label: '👥 Play with friends' },
  { id: 'story', label: '📖 Great stories' }
];

function finish() {
  completeOnboarding({ hours: hours.value, device: device.value, vibe: vibe.value });
}
function skip() {
  completeOnboarding({ hours: 0, device: null, vibe: null });
}
</script>
