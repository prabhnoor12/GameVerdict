<template>
  <div class="space-y-2">
    <div v-if="store.userEmail" class="flex items-center justify-between gap-2 flex-wrap">
      <span class="text-xs text-zinc-300">Signed in as <span class="font-bold text-white">{{ store.userEmail }}</span></span>
      <button @click="signOut" :disabled="store.authLoading" class="px-3 py-1.5 rounded-xl border border-zinc-700 text-zinc-300 hover:border-rose-400 hover:text-rose-300 disabled:opacity-60 text-xs font-bold min-h-[36px]">Sign out</button>
    </div>
    <form v-else @submit.prevent="sendLink" class="flex gap-2 flex-wrap">
      <input
        v-model="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email for magic-link sign in"
        class="flex-1 min-w-40 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
        autocomplete="email"
      />
      <button type="submit" :disabled="store.authLoading" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 text-xs font-bold min-h-[40px]">
        {{ store.authLoading ? 'Sending…' : 'Email me a sign-in link' }}
      </button>
    </form>
    <p v-if="store.authError" class="text-[11px] text-amber-300">{{ store.authError }}</p>
    <p v-else-if="!store.userEmail" class="text-[10px] text-zinc-500">Passwordless login — one tap from your inbox, no password to leak.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store, sendMagicLink, signOutUser } from '../store.js';

const email = ref('');

async function sendLink() {
  const res = await sendMagicLink(email.value);
  if (res.ok) email.value = '';
}

async function signOut() {
  await signOutUser();
}
</script>
