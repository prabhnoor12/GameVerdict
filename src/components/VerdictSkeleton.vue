<template>
  <section aria-label="Loading verdict" class="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-pulse">
    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <div class="w-full sm:w-48 h-48 sm:h-64 rounded-2xl bg-zinc-800 shrink-0"></div>
      <div class="flex-1 space-y-4 w-full">
        <div class="h-6 w-40 rounded-full bg-zinc-800"></div>
        <div class="h-8 w-3/4 rounded-lg bg-zinc-800"></div>
        <div class="h-4 w-1/2 rounded bg-zinc-800"></div>
        <div class="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-4 space-y-2">
          <div class="h-3 w-1/3 rounded bg-zinc-800"></div>
          <div class="h-2.5 w-full rounded-full bg-zinc-800"></div>
        </div>
        <div class="h-11 w-full rounded-xl bg-zinc-950 border border-zinc-800"></div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="h-24 rounded-2xl bg-zinc-950/70 border border-zinc-800"></div>
      <div class="h-24 rounded-2xl bg-zinc-950/70 border border-zinc-800"></div>
      <div class="h-24 rounded-2xl bg-zinc-950/70 border border-zinc-800"></div>
    </div>
  </section>
</template>
