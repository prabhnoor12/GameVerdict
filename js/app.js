import { GameData } from './game-data.js';

(() => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const trendingContainer = document.getElementById('trendingContainer');
  const filterPresetsContainer = document.getElementById('filterPresetsContainer');
  const heroCard = document.getElementById('heroCard');
  const coffeeModal = document.getElementById('coffeeModal');
  const openCoffeeBtn = document.getElementById('openCoffeeBtn');
  const footerCoffeeBtn = document.getElementById('footerCoffeeBtn');
  const closeCoffeeBtn = document.getElementById('closeCoffeeBtn');
  const shareVerdictBtn = document.getElementById('shareVerdictBtn');
  const openCalculatorBtn = document.getElementById('openCalculatorBtn');

  // Game Display Fields
  const gameTitle = document.getElementById('gameTitle');
  const gameMeta = document.getElementById('gameMeta');
  const gameCover = document.getElementById('gameCover');
  const priceBadge = document.getElementById('priceBadge');
  const backdropOverlay = document.getElementById('backdropOverlay');
  const verdictBadge = document.getElementById('verdictBadge');
  const liveDataBadge = document.getElementById('liveDataBadge');
  const gamePassBadge = document.getElementById('gamePassBadge');
  const consensusScore = document.getElementById('consensusScore');
  const consensusBar = document.getElementById('consensusBar');

  // Multi-platform scores
  const steamScore = document.getElementById('steamScore');
  const steamStatus = document.getElementById('steamStatus');
  const openCriticScore = document.getElementById('openCriticScore');
  const metaScore = document.getElementById('metaScore');
  const userBacklogScore = document.getElementById('userBacklogScore');

  // 3-Sentence Decision Box
  const verdictHook = document.getElementById('verdictHook');
  const verdictFriction = document.getElementById('verdictFriction');
  const verdictTarget = document.getElementById('verdictTarget');

  // Gamer Reality Gauge
  const ttfValue = document.getElementById('ttfValue');
  const hoursValue = document.getElementById('hoursValue');
  const hoursSubtext = document.getElementById('hoursSubtext');
  const deckValue = document.getElementById('deckValue');
  const monetizationValue = document.getElementById('monetizationValue');
  const platformsList = document.getElementById('platformsList');
  const subscriptionsNotice = document.getElementById('subscriptionsNotice');
  const quotesList = document.getElementById('quotesList');

  // Backlog ROI Calculator Elements
  const sliderWeeklyHours = document.getElementById('sliderWeeklyHours');
  const labelWeeklyHours = document.getElementById('labelWeeklyHours');
  const calcWeeksToBeat = document.getElementById('calcWeeksToBeat');
  const calcMonthsSubtext = document.getElementById('calcMonthsSubtext');
  const calcCostPerHour = document.getElementById('calcCostPerHour');
  const calcVerdictTip = document.getElementById('calcVerdictTip');

  // Toast Helper
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(msg, icon = '🎮') {
    if (!toast) return;
    toastMsg.textContent = msg;
    const iconSpan = toast.querySelector('.toast-icon');
    if (iconSpan) iconSpan.textContent = icon;

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 2500);
  }

  // Active game state
  let currentGame = GameData.CURATED_GAMES[0];
  let activeFilter = 'all';

  // --- Render Game Verdict ---
  function renderGame(game) {
    currentGame = game;

    // Header & Meta
    gameTitle.textContent = game.title;
    gameMeta.textContent = `${game.releaseYear} · Dev. ${game.developer} · Pub. ${game.publisher} · ${game.genres.join(', ')}`;
    gameCover.src = game.headerImg;
    priceBadge.textContent = `$${game.basePriceUsd.toFixed(2)}`;

    // Ambient Backdrop
    backdropOverlay.style.backgroundImage = `url('${game.backdropImg}')`;

    // Consensus Score & Gauge
    consensusScore.textContent = `${game.unifiedConsensusPercent}%`;
    consensusBar.style.width = `${game.unifiedConsensusPercent}%`;
    verdictBadge.textContent = game.verdictBadge;

    // Badge styling
    if (game.unifiedConsensusPercent >= 92) {
      verdictBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald';
      consensusBar.className = 'h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700';
    } else if (game.unifiedConsensusPercent >= 80) {
      verdictBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 glow-amber';
      consensusBar.className = 'h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700';
    } else {
      verdictBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 glow-rose';
      consensusBar.className = 'h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-700';
    }

    // Live Data Badge — names the real sources behind this verdict
    if (game.isLive && liveDataBadge) {
      liveDataBadge.classList.remove('hidden');
      const label = liveDataBadge.querySelector('span:last-child');
      if (label) label.textContent = game.liveSource || 'Live reviews';
      liveDataBadge.title = game.liveSource || 'Live reviews';
    } else if (liveDataBadge) {
      liveDataBadge.classList.add('hidden');
    }

    // Game Pass Badge
    if (game.subscriptionServices && game.subscriptionServices.some(s => s.toLowerCase().includes('game pass'))) {
      gamePassBadge.classList.remove('hidden');
    } else {
      gamePassBadge.classList.add('hidden');
    }

    // Multi-Platform Scores
    steamScore.textContent = `${game.scores.steamPositivePercent}%`;
    steamStatus.textContent = game.scores.steamStatus || 'Positive';
    openCriticScore.textContent = `${game.scores.openCritic}`;
    metaScore.textContent = `${game.scores.metaCritic}`;
    userBacklogScore.textContent = `${game.scores.userBacklogRating}`;

    // The 3-Sentence Gamer Decision Box
    verdictHook.textContent = game.threeSentenceVerdict.coreHook;
    verdictFriction.textContent = game.threeSentenceVerdict.hiddenFriction || game.threeSentenceVerdict.flaw || 'Balanced difficulty and standard genre progression.';
    verdictTarget.textContent = game.threeSentenceVerdict.targetAudience;

    // Gamer Reality Gauge
    ttfValue.textContent = game.realityCheck.timeToFun;
    
    if (game.realityCheck.mainStoryHours > 0) {
      hoursValue.textContent = `${game.realityCheck.mainStoryHours} hrs (Main)`;
      hoursSubtext.textContent = `~${game.realityCheck.completionistHours} hrs for 100% completionist run`;
    } else {
      hoursValue.textContent = 'Endless / Multiplayer';
      hoursSubtext.textContent = 'Session-based matches (20-40 min each)';
    }

    deckValue.textContent = game.realityCheck.steamDeckRating;
    monetizationValue.textContent = game.realityCheck.monetization;

    // Platforms List
    platformsList.innerHTML = '';
    game.platforms.forEach(platform => {
      const pill = document.createElement('span');
      pill.className = 'px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 font-mono';
      pill.textContent = platform;
      platformsList.appendChild(pill);
    });

    // Subscriptions Notice
    if (game.subscriptionServices && game.subscriptionServices.length > 0) {
      subscriptionsNotice.innerHTML = `
        <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Subscription Freebie:</div>
        <div class="text-xs text-white font-medium">${game.subscriptionServices.join(', ')}</div>
      `;
    } else {
      subscriptionsNotice.innerHTML = `
        <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Subscription Status:</div>
        <div class="text-xs text-zinc-400">Standard Retail Only</div>
      `;
    }

    // Quotes List — live quotes link out to the reputed source
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    quotesList.innerHTML = '';
    game.topQuotes.forEach(q => {
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between text-xs space-y-2';
      const src = q.url
        ? `<a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">${esc(q.source)} ↗</a>`
        : `<span class="text-zinc-500">${esc(q.source)}</span>`;
      card.innerHTML = `
        <p class="text-zinc-300 italic leading-relaxed text-[11px]">"${esc(q.quote)}"</p>
        <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[10px]">
          <span class="font-bold text-white truncate">${esc(q.author)}</span>
          ${src}
        </div>
      `;
      quotesList.appendChild(card);
    });
    // Source links row for live games (Steam / OpenCritic / Metacritic)
    const oldLinks = document.getElementById('liveSourceLinks');
    if (oldLinks) oldLinks.remove();
    if (game.isLive && game.liveLinks) {
      const row = document.createElement('div');
      row.id = 'liveSourceLinks';
      row.className = 'flex flex-wrap gap-2 pt-1 text-[11px]';
      const links = [];
      if (game.liveLinks.steamAppID) links.push(['Steam store', `https://store.steampowered.com/app/${game.liveLinks.steamAppID}/`]);
      if (game.liveLinks.openCritic) links.push(['OpenCritic', game.liveLinks.openCritic]);
      if (game.liveLinks.metacritic) links.push(['Metacritic', game.liveLinks.metacritic]);
      if (links.length) {
        row.innerHTML = '<span class="text-zinc-500">Verify live:</span> ' + links.map(([t, u]) =>
          `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-dotted underline-offset-2">${t} ↗</a>`
        ).join('<span class="text-zinc-700">·</span>');
        quotesList.after(row);
      }
    }

    // Update Backlog ROI Calculator for this game
    updateBacklogCalculator();

    // Update window hash without jump
    history.replaceState(null, '', `#game=${game.id}`);
  }

  // --- Backlog ROI Calculator ---
  function updateBacklogCalculator() {
    const weeklyHours = parseInt(sliderWeeklyHours.value, 10);
    labelWeeklyHours.textContent = `${weeklyHours} hrs`;

    const mainHours = currentGame.realityCheck.mainStoryHours || 30;
    const weeks = (mainHours / weeklyHours).toFixed(1);
    const months = (weeks / 4.3).toFixed(1);

    calcWeeksToBeat.textContent = `${weeks} Weeks`;
    calcMonthsSubtext.textContent = `~${months} months of your gaming time`;

    const costPerHour = (currentGame.basePriceUsd / mainHours).toFixed(2);
    calcCostPerHour.textContent = `$${costPerHour} / hr`;

    if (costPerHour < 1.0) {
      calcVerdictTip.textContent = '💎 S-Tier Value: Cheaper than a cup of coffee per hour of joy.';
      calcVerdictTip.className = 'text-[10px] text-emerald-300';
    } else if (costPerHour < 2.5) {
      calcVerdictTip.textContent = '🟢 High Value: Far more cost-effective than cinema or concerts.';
      calcVerdictTip.className = 'text-[10px] text-teal-300';
    } else {
      calcVerdictTip.textContent = '⚠️ Premium Ticket: Wait for a 30% Steam sale if backlog is full.';
      calcVerdictTip.className = 'text-[10px] text-amber-300';
    }
  }

  sliderWeeklyHours.addEventListener('input', updateBacklogCalculator);

  // --- Render Filter Presets ---
  function renderFilterPresets() {
    filterPresetsContainer.innerHTML = '';
    GameData.FILTER_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      const isActive = activeFilter === preset.id;
      btn.className = `px-3 py-1 rounded-full text-xs font-semibold transition border ${
        isActive
          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md'
          : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
      }`;
      btn.textContent = preset.label;
      btn.addEventListener('click', () => {
        activeFilter = preset.id;
        renderFilterPresets();
        applyFilter(preset.id);
      });
      filterPresetsContainer.appendChild(btn);
    });
  }

  function applyFilter(filterId) {
    let filtered = GameData.CURATED_GAMES;
    if (filterId === 'short') {
      filtered = GameData.CURATED_GAMES.filter(g => g.realityCheck.mainStoryHours > 0 && g.realityCheck.mainStoryHours <= 20);
    } else if (filterId === 'gamepass') {
      filtered = GameData.CURATED_GAMES.filter(g => g.subscriptionServices && g.subscriptionServices.some(s => s.toLowerCase().includes('game pass')));
    } else if (filterId === 'deck') {
      filtered = GameData.CURATED_GAMES.filter(g => g.realityCheck.steamDeckRating.toLowerCase().includes('60 fps') || g.realityCheck.steamDeckRating.toLowerCase().includes('verified'));
    } else if (filterId === 'masterpiece') {
      filtered = GameData.CURATED_GAMES.filter(g => g.unifiedConsensusPercent >= 95);
    }

    renderTrendingChips(filtered);
    if (filtered.length > 0 && !filtered.some(g => g.id === currentGame.id)) {
      renderGame(filtered[0]);
    }
  }

  // --- Render Trending Quick Chips ---
  function renderTrendingChips(gamesList = GameData.CURATED_GAMES) {
    trendingContainer.innerHTML = '';
    gamesList.forEach(game => {
      const chip = document.createElement('button');
      const isActive = game.id === currentGame.id;
      chip.className = `px-3 py-1.5 rounded-xl text-xs font-medium transition border flex items-center gap-1.5 ${
        isActive
          ? 'bg-emerald-950 border-emerald-500/80 text-emerald-300 font-bold'
          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
      }`;
      chip.innerHTML = `
        <span>${game.title}</span>
        <span class="text-[10px] font-mono text-emerald-400">${game.unifiedConsensusPercent}%</span>
      `;
      chip.addEventListener('click', () => {
        renderGame(game);
        renderTrendingChips(gamesList);
      });
      trendingContainer.appendChild(chip);
    });
  }

  // --- Search Handler ---
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    searchInput.blur();
    showToast(`Distilling consensus for "${query}"...`, '⏳');

    const result = await GameData.searchGame(query);
    renderGame(result);
    renderTrendingChips();

    // Scroll smoothly to decision card
    heroCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (result.isLive) {
      showToast(`Live consensus loaded from Steam & Metacritic for "${result.title}"!`, '🟢');
    } else {
      showToast(`Verdict generated for ${result.title}!`, '✅');
    }
  });

  // Keyboard shortcut '/' to search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && !coffeeModal.classList.contains('hidden')) {
      coffeeModal.classList.add('hidden');
    }
  });

  // Share button
  shareVerdictBtn.addEventListener('click', () => {
    const url = `${window.location.origin}${window.location.pathname}#game=${currentGame.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Game verdict link copied to clipboard!', '🔗');
    }).catch(() => {
      showToast('Direct link ready in URL bar!', '🎮');
    });
  });

  // Jump to calculator
  openCalculatorBtn.addEventListener('click', () => {
    const calcCard = document.getElementById('roiCalculatorCard');
    if (calcCard) {
      calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Backlog ROI Calculator focused', '🧮');
    }
  });

  // Coffee Modal Handlers
  openCoffeeBtn.addEventListener('click', () => coffeeModal.classList.remove('hidden'));
  footerCoffeeBtn.addEventListener('click', () => coffeeModal.classList.remove('hidden'));
  closeCoffeeBtn.addEventListener('click', () => coffeeModal.classList.add('hidden'));
  coffeeModal.addEventListener('click', (e) => {
    if (e.target === coffeeModal) coffeeModal.classList.add('hidden');
  });

  // Coffee amount buttons
  document.querySelectorAll('.coffee-tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Selected $${btn.dataset.amount} coffee tip! Thank you!`, '☕');
    });
  });

  // --- Initial Boot ---
  function init() {
    renderFilterPresets();

    // Check hash for pre-selected game
    const hash = window.location.hash;
    if (hash && hash.startsWith('#game=')) {
      const gameId = hash.replace('#game=', '');
      const match = GameData.CURATED_GAMES.find(g => g.id === gameId);
      if (match) {
        renderGame(match);
        renderTrendingChips();
        return;
      }
    }

    // Default to first game
    renderGame(GameData.CURATED_GAMES[0]);
    renderTrendingChips();
  }

  init();
})();
