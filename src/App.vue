<template>
  <div class="min-h-full flex flex-col font-sans select-none overflow-x-hidden relative bg-zinc-950">
    <div class="fixed inset-0 pointer-events-none z-0 backdrop-blur-cinema opacity-40 transition-all duration-700" :style="backdropStyle"></div>

    <header class="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md font-black text-sm">🎮</div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-base text-white tracking-tight">GameVerdict</span>
          <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">Backlog Reality</span>
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <button @click="store.showWishlist = true" class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition">
          <span>❤️</span><span class="hidden sm:inline">Wishlist ({{ store.wishlist.length }})</span>
        </button>
        <button @click="scrollToCalculator" class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition">
          <span>🧮</span><span class="hidden sm:inline">Backlog ROI</span>
        </button>
        <button @click="share" class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition">
          <span>🔗</span><span class="hidden sm:inline">Share</span>
        </button>
        <button @click="store.showCoffee = true" class="btn-coffee px-3.5 py-1.5 rounded-lg text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span>☕</span><span class="hidden sm:inline">Buy Coffee</span>
        </button>
      </div>
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
      <SearchHero />
      <VerdictCard :game="store.currentGame" />
      <RoiCalculator />
    </main>

    <footer class="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 relative z-10">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>GameVerdict — Zero-fluff gaming consensus & backlog reality engine.</div>
        <div class="flex items-center gap-4">
          <button @click="store.showCoffee = true" class="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"><span>☕</span><span>Support the Project</span></button>
          <span>No ads · Zero tracking · 100% Free</span>
        </div>
      </div>
    </footer>

    <div v-if="store.compareList.length" class="fixed bottom-4 left-4 z-40 bg-zinc-900 border border-emerald-500/40 rounded-2xl p-3 shadow-2xl max-w-xs w-[calc(100vw-2rem)]">
      <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Compare ({{ store.compareList.length }}/3)</div>
      <div class="overflow-x-auto">
        <table class="text-[11px] w-full">
          <tr class="text-zinc-500"><td></td><td v-for="g in store.compareList" :key="g.id" class="px-2 font-bold text-white whitespace-nowrap">{{ g.title }}</td></tr>
          <tr><td class="text-zinc-500 pr-2">Score</td><td v-for="g in store.compareList" :key="g.id" class="px-2 font-mono text-emerald-400">{{ g.unifiedConsensusPercent }}%</td></tr>
          <tr><td class="text-zinc-500 pr-2">Hours</td><td v-for="g in store.compareList" :key="g.id" class="px-2 text-zinc-200">{{ g.realityCheck.mainStoryHours }}h</td></tr>
          <tr><td class="text-zinc-500 pr-2">Price</td><td v-for="g in store.compareList" :key="g.id" class="px-2 text-zinc-200">${{ g.basePriceUsd.toFixed(2) }}</td></tr>
          <tr><td></td><td v-for="g in store.compareList" :key="g.id" class="px-2"><button @click="toggleCompare(g)" class="text-rose-400 hover:text-rose-300">✕</button></td></tr>
        </table>
      </div>
    </div>

    <div v-if="store.showWishlist" class="fixed inset-0 z-50 flex justify-end bg-black/60" @click.self="store.showWishlist = false">
      <div class="w-72 max-w-[85vw] bg-zinc-900 border-l border-zinc-800 p-4 space-y-2 overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-white text-sm">❤️ Wishlist ({{ store.wishlist.length }})</h3>
          <button @click="store.showWishlist = false" class="text-zinc-400 hover:text-white">✕</button>
        </div>
        <div v-if="!store.wishlist.length" class="text-xs text-zinc-500">Nothing saved yet — tap 🤍 on any game.</div>
        <div v-for="w in store.wishlist" :key="w.id" class="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
          <span class="text-zinc-200 font-medium truncate">{{ w.title }}</span>
          <span class="text-emerald-400 font-mono ml-2">${{ w.price.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div v-if="store.showCoffee" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="store.showCoffee = false">
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
        <button @click="store.showCoffee = false" class="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">☕</div>
        <h3 class="text-lg font-bold text-white">Fuel GameVerdict</h3>
        <p class="text-xs text-zinc-400 leading-relaxed">GameVerdict is 100% free with zero annoying ads, affiliate trickery, or sponsored reviews. If it saved you 40 hours of wasted backlog time, consider supporting!</p>
        <div class="grid grid-cols-3 gap-2 pt-2">
          <button v-for="amt in [3, 5, 15]" :key="amt" @click="toast(`Selected $${amt} coffee tip! Thank you!`)" class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-white transition">${{ amt }} ☕</button>
        </div>
        <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" class="block w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg">Proceed to Buy Me a Coffee</a>
      </div>
    </div>

    <div :class="['fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs transition-all duration-300', store.toastVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2']">
      <span>🎮</span><span>{{ store.toastMsg }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { store, share, toggleCompare, toast, initFromHash } from './store.js';
import SearchHero from './components/SearchHero.vue';
import VerdictCard from './components/VerdictCard.vue';
import RoiCalculator from './components/RoiCalculator.vue';

const backdropStyle = computed(() => ({
  backgroundImage: `url('${store.currentGame.backdropImg}')`
}));

function scrollToCalculator() {
  document.getElementById('roiCalculatorCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function onKey(e) {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
  if (e.key === 'Escape') {
    store.showCoffee = false;
    store.showWishlist = false;
  }
}

onMounted(() => {
  initFromHash();
  window.addEventListener('keydown', onKey);
});
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>
