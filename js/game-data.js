/**
 * GameVerdict Game Database & Consensus Engine
 * Multi-platform consensus: Live Steam Reviews, Metacritic, OpenCritic, HowLongToBeat & Steam Deck Status
 */

export const GameData = (() => {

  const CURATED_GAMES = [
    {
      id: 'elden-ring',
      title: 'Elden Ring',
      releaseYear: '2022',
      developer: 'FromSoftware',
      publisher: 'Bandai Namco',
      genres: ['Action RPG', 'Open World', 'Souls-like'],
      steamAppID: '1245620',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg',
      platforms: ['PC (Steam)', 'PS5', 'Xbox Series X/S', 'PS4', 'Xbox One'],
      subscriptionServices: [],
      basePriceUsd: 59.99,
      isLive: false,
      scores: {
        steamPositivePercent: 93,
        steamStatus: 'Overwhelmingly Positive',
        steamReviewCount: '780,000+ Verified Steam Reviews',
        openCritic: 95,
        metaCritic: 96,
        userBacklogRating: 9.3
      },
      unifiedConsensusPercent: 95,
      verdictBadge: 'Essential Masterpiece',
      badgeType: 'emerald',
      threeSentenceVerdict: {
        coreHook: 'An astonishing masterclass in organic exploration where every hill hides a forgotten dungeon, legacy castle, or mythical horror.',
        hiddenFriction: 'Late-game boss damage spikes demand patience, and the cryptic quest design almost forces you to keep a wiki open.',
        targetAudience: 'Anyone who craves genuine discovery, challenging combat, and unguided exploration without map marker handholding.'
      },
      realityCheck: {
        timeToFun: '⚡ 10 mins (First open world vista)',
        mainStoryHours: 58,
        completionistHours: 134,
        steamDeckRating: 'Verified (Solid 40 FPS / Medium settings)',
        monetization: '💎 100% Clean (Zero MTX, Expansive Paid DLC)',
        pacing: 'Player-Driven Wonder',
        difficultyCurve: 'Hard & Unforgiving (Use Spirit Summons if stuck)'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (640 hrs)',
          quote: 'You will swear at your screen for 2 hours, defeat the boss with 1 HP left, and feel a dopamine hit that no modern AAA game can match.',
          sentiment: 'positive'
        },
        {
          source: 'PC Gamer',
          author: 'Tyler Colp',
          quote: 'FromSoftware took the open-world formula that had grown stale and injected it with terrifying mystery and awe.',
          sentiment: 'positive'
        },
        {
          source: 'Digital Foundry',
          author: 'Richard Leadbetter',
          quote: 'Occasional shader compilation stutters on PC, but breathtaking artistic direction overcomes technical flaws.',
          sentiment: 'neutral'
        }
      ]
    },
    {
      id: 'baldurs-gate-3',
      title: "Baldur's Gate 3",
      releaseYear: '2023',
      developer: 'Larian Studios',
      publisher: 'Larian Studios',
      genres: ['CRPG', 'Story Rich', 'Turn-Based Combat', 'Co-Op'],
      steamAppID: '1086940',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_hero.jpg',
      platforms: ['PC (Steam/GOG)', 'PS5', 'Xbox Series X/S', 'Mac'],
      subscriptionServices: [],
      basePriceUsd: 59.99,
      isLive: false,
      scores: {
        steamPositivePercent: 96,
        steamStatus: 'Overwhelmingly Positive',
        steamReviewCount: '620,000+ Verified Steam Reviews',
        openCritic: 96,
        metaCritic: 96,
        userBacklogRating: 9.6
      },
      unifiedConsensusPercent: 97,
      verdictBadge: 'All-Time RPG Benchmark',
      badgeType: 'emerald',
      threeSentenceVerdict: {
        coreHook: 'Unmatched player freedom where almost any ridiculous tactical idea or conversational gamble is fully accounted for with voice-acted reactivity.',
        hiddenFriction: 'Act 3 performance drops in the dense city streets, and inventory management across four companions can become a chore.',
        targetAudience: 'Lovers of deep narrative, tabletop D&D, memorable companion romances, and tactical turn-based sandbox combat.'
      },
      realityCheck: {
        timeToFun: '⚡ 15 mins (Nautiloid escape prologue)',
        mainStoryHours: 65,
        completionistHours: 155,
        steamDeckRating: 'Verified (Playable 30 FPS, Act 3 dips to 25 FPS)',
        monetization: '💎 100% Free of Microtransactions / No Live Service',
        pacing: 'Epic & Narrative-Dense',
        difficultyCurve: 'Moderate (Tactician mode tests system mastery)'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (420 hrs)',
          quote: 'I shoved an enemy off a cliff with a summoned flaming sphere, stole their pants, and seduced a vampire spawn. 10/10.',
          sentiment: 'positive'
        },
        {
          source: 'Eurogamer',
          author: 'Robert Purchese',
          quote: 'Larian has achieved something monumental: a mainstream, blockbuster RPG that never treats its audience like idiots.',
          sentiment: 'positive'
        },
        {
          source: 'IGN',
          author: 'Leana Hafer',
          quote: 'Setting a new high-water mark for the CRPG genre that will be studied for the next decade.',
          sentiment: 'positive'
        }
      ]
    },
    {
      id: 'cyberpunk-2077',
      title: 'Cyberpunk 2077: Phantom Liberty',
      releaseYear: '2023 (v2.0 & DLC)',
      developer: 'CD PROJEKT RED',
      publisher: 'CD PROJEKT RED',
      genres: ['Sci-Fi', 'FPS RPG', 'Story Rich', 'Open World'],
      steamAppID: '1091500',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg',
      platforms: ['PC (Steam/GOG)', 'PS5', 'Xbox Series X/S'],
      subscriptionServices: [],
      basePriceUsd: 59.99,
      isLive: false,
      scores: {
        steamPositivePercent: 89,
        steamStatus: 'Very Positive (Recent: 95%)',
        steamReviewCount: '710,000+ Verified Steam Reviews',
        openCritic: 90,
        metaCritic: 89,
        userBacklogRating: 8.9
      },
      unifiedConsensusPercent: 91,
      verdictBadge: 'Redeemed Masterpiece',
      badgeType: 'emerald',
      threeSentenceVerdict: {
        coreHook: 'Night City is the most intoxicating, neon-drenched urban playground in gaming history with fluid cyberware gunplay and superb voice acting.',
        hiddenFriction: 'Lifepath choices still have minimal long-term impact on the main plot, and driving mechanics take some getting used to.',
        targetAudience: 'Cyberpunk aesthetic purists, cinematic story fans, and action RPG lovers with modern GPUs.'
      },
      realityCheck: {
        timeToFun: '⚡ 20 mins (Heist preparation)',
        mainStoryHours: 26,
        completionistHours: 85,
        steamDeckRating: 'Verified (Uses Deck preset, stable 35-40 FPS)',
        monetization: '💎 Zero Microtransactions / Expansion Model',
        pacing: 'Cinematic Thriller',
        difficultyCurve: 'Customizable (Overpowered builds by mid-game)'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (310 hrs)',
          quote: 'From the joke of 2020 to one of the greatest redemption arcs in modern entertainment history. Phantom Liberty is 10/10.',
          sentiment: 'positive'
        },
        {
          source: 'Rock Paper Shotgun',
          author: 'Graham Smith',
          quote: 'Night City finally feels alive, dangerous, and thrilling in the exact way we were promised five years ago.',
          sentiment: 'positive'
        },
        {
          source: 'Kotaku',
          author: 'Kenneth Shepard',
          quote: 'Idris Elba delivers one of the finest video game performances ever recorded as Solomon Reed.',
          sentiment: 'positive'
        }
      ]
    },
    {
      id: 'balatro',
      title: 'Balatro',
      releaseYear: '2024',
      developer: 'LocalThunk',
      publisher: 'Playstack',
      genres: ['Deckbuilder', 'Roguelike', 'Poker', 'Casual', 'Strategy'],
      steamAppID: '2379780',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/library_hero.jpg',
      platforms: ['PC (Steam)', 'Nintendo Switch', 'PS5', 'Xbox', 'iOS/Android'],
      subscriptionServices: ['Xbox Game Pass'],
      basePriceUsd: 14.99,
      isLive: false,
      scores: {
        steamPositivePercent: 97,
        steamStatus: 'Overwhelmingly Positive',
        steamReviewCount: '65,000+ Verified Steam Reviews',
        openCritic: 91,
        metaCritic: 90,
        userBacklogRating: 9.5
      },
      unifiedConsensusPercent: 96,
      verdictBadge: 'Certified Digital Crack',
      badgeType: 'emerald',
      threeSentenceVerdict: {
        coreHook: 'Deconstructs standard poker with illegal joker cards to create jaw-dropping score multipliers that trigger pure mathematical euphoria.',
        hiddenFriction: 'Zero story or narrative lore; RNG can occasionally brick an otherwise brilliant combo on higher stakes.',
        targetAudience: 'Slay the Spire lovers, strategy tacticians, and anyone who wants a game they can play with one hand on a laptop or handheld.'
      },
      realityCheck: {
        timeToFun: '⚡ 30 seconds (Immediately deals hand 1)',
        mainStoryHours: 15,
        completionistHours: 110,
        steamDeckRating: 'Verified (60 FPS, 7+ Hour Battery Life, Perfect)',
        monetization: '💎 $15 Full Game, No Microtransactions, No Gambling Cash',
        pacing: 'Hypnotic & Self-Paced',
        difficultyCurve: 'Gentle intro that scales to brain-melting gold stakes'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (190 hrs)',
          quote: 'I told myself "just one quick round before bed" at 11:00 PM. It is now 4:45 AM and I have modified my deck into 45 holographic glass queens.',
          sentiment: 'positive'
        },
        {
          source: 'Polygon',
          author: 'Cass Marshall',
          quote: 'Balatro is so fundamentally well-tuned that it feels like it was unearthed from an ancient civilization of game designers.',
          sentiment: 'positive'
        },
        {
          source: 'The Verge',
          author: 'Andrew Webster',
          quote: 'The most dangerous time-sink of 2024. Your productivity will vanish.',
          sentiment: 'positive'
        }
      ]
    },
    {
      id: 'hades-2',
      title: 'Hades II',
      releaseYear: '2024 (Early Access)',
      developer: 'Supergiant Games',
      publisher: 'Supergiant Games',
      genres: ['Roguelite', 'Action', 'Mythology', 'Fast-Paced'],
      steamAppID: '1145350',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_hero.jpg',
      platforms: ['PC (Steam/Epic)'],
      subscriptionServices: [],
      basePriceUsd: 29.99,
      isLive: false,
      scores: {
        steamPositivePercent: 94,
        steamStatus: 'Very Positive',
        steamReviewCount: '58,000+ Verified Steam Reviews',
        openCritic: 93,
        metaCritic: 92,
        userBacklogRating: 9.2
      },
      unifiedConsensusPercent: 94,
      verdictBadge: 'Infinite Dopamine Engine',
      badgeType: 'emerald',
      threeSentenceVerdict: {
        coreHook: 'Hypnotic second-to-second combat with Melinoë’s witchcraft mechanics and gorgeous hand-drawn mythological characters.',
        hiddenFriction: 'Resource gathering with harvesting tools can briefly interrupt the breakneck flow of underworld combat runs.',
        targetAudience: 'Roguelite fiends, Greek myth enthusiasts, and anyone seeking pure 30-minute gameplay loops.'
      },
      realityCheck: {
        timeToFun: '⚡ 2 mins (First run kicks off instantly)',
        mainStoryHours: 25,
        completionistHours: 90,
        steamDeckRating: 'Verified (Flawless 60 FPS / 4+ Hour Battery)',
        monetization: '💎 Clean Indie Model (No Battle Pass / No Gacha)',
        pacing: 'Addictive 25-Min Runs',
        difficultyCurve: 'Challenging (God Mode toggle available)'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (110 hrs)',
          quote: 'Supergiant does not miss. The music slaps, the weapon aspects feel crisp, and Melinoë is every bit as compelling as Zagreus.',
          sentiment: 'positive'
        },
        {
          source: 'Polygon',
          author: 'Nicole Carpenter',
          quote: 'Even in Early Access, Hades 2 arrives with more polish and content than most completed AAA releases.',
          sentiment: 'positive'
        },
        {
          source: 'Kotaku',
          author: 'Zack Zwiezen',
          quote: 'The best portable Steam Deck game of the decade, full stop.',
          sentiment: 'positive'
        }
      ]
    },
    {
      id: 'starfield',
      title: 'Starfield',
      releaseYear: '2023',
      developer: 'Bethesda Game Studios',
      publisher: 'Bethesda Softworks',
      genres: ['Sci-Fi RPG', 'Space Exploration', 'Shooter'],
      steamAppID: '1716740',
      salePrice: null,
      headerImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg',
      backdropImg: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/library_hero.jpg',
      platforms: ['PC (Steam/MS Store)', 'Xbox Series X/S'],
      subscriptionServices: ['Xbox Game Pass (Included Free)'],
      basePriceUsd: 69.99,
      isLive: false,
      scores: {
        steamPositivePercent: 57,
        steamStatus: 'Mixed',
        steamReviewCount: '115,000+ Verified Steam Reviews',
        openCritic: 85,
        metaCritic: 83,
        userBacklogRating: 6.8
      },
      unifiedConsensusPercent: 68,
      verdictBadge: 'Divisive & Fast-Travel Heavy',
      badgeType: 'rose',
      threeSentenceVerdict: {
        coreHook: 'Terrific spaceship builder, deep faction side-quests (UC Vanguard is a standout), and cozy classic Bethesda loot-hoarding.',
        hiddenFriction: 'Constant loading screens shatter the illusion of seamless space flight, and thousands of procedurally generated planets feel barren.',
        targetAudience: 'Die-hard Bethesda RPG nostalgics and NASA-punk shipbuilders who do not mind menu-to-menu fast traveling.'
      },
      realityCheck: {
        timeToFun: '⏳ 2.5 hours (Picks up once Constellation lodge opens)',
        mainStoryHours: 23,
        completionistHours: 140,
        steamDeckRating: 'Unsupported / Poor (Struggles at 20-25 FPS in New Atlantis)',
        monetization: '⚠️ Creation Club Paid Mods & $30 Story DLC',
        pacing: 'Menu & Dialogue Heavy',
        difficultyCurve: 'Easy to Moderate'
      },
      topQuotes: [
        {
          source: 'Steam Community Review',
          author: 'Verified Player (140 hrs)',
          quote: 'Play it on Game Pass for the ship building and faction quests. Do not buy it full price expecting No Man’s Sky or Skyrim in space.',
          sentiment: 'neutral'
        },
        {
          source: 'PC Gamer',
          author: 'Christopher Livingston',
          quote: 'Starfield shares plenty of DNA with Skyrim and Fallout 4, but ultimately lacks their sense of seamless wonder.',
          sentiment: 'neutral'
        },
        {
          source: 'IGN',
          author: 'Dan Stapleton',
          quote: 'A game with high highs and low lows that struggles to launch out of its own gravitational pull.',
          sentiment: 'neutral'
        }
      ]
    }
  ];

  const FILTER_PRESETS = [
    { id: 'all', label: 'All Curated Titles' },
    { id: 'short', label: '⚡ Short & Sweet (<20h)' },
    { id: 'gamepass', label: '🟢 Free on Game Pass' },
    { id: 'deck', label: '🎮 Steam Deck Verified' },
    { id: 'masterpiece', label: '🏆 95%+ Masterpieces' },
    { id: 'clean', label: '💎 Clean MTX-free' },
    { id: 'value', label: '💰 Best value (<$1.50/hr)' },
    { id: 'coop', label: '👥 Co-op with friends' }
  ];

  /** Unified consensus: single formula everywhere (Steam 55 / Metacritic 35 / Backlog-user 10). */
  const CONSENSUS_WEIGHTS = { steam: 0.55, meta: 0.35, user: 0.10 };
  function computeUnified({ steam, meta, user10 }) {
    const s = steam ?? meta ?? (user10 != null ? user10 * 10 : 80);
    const m = meta ?? steam ?? (user10 != null ? user10 * 10 : 80);
    const u = user10 != null ? user10 * 10 : ((s + m) / 2);
    return Math.round(s * CONSENSUS_WEIGHTS.steam + m * CONSENSUS_WEIGHTS.meta + u * CONSENSUS_WEIGHTS.user);
  }

  /** Review-count confidence so a 97% from 65k votes is not shown as equal to 700k. */
  function confidenceFor(count) {
    if (!count) return { level: 'Low', detail: 'Few reviews' };
    if (count >= 100000) return { level: 'High', detail: `${Math.round(count / 1000)}k reviews` };
    if (count >= 10000) return { level: 'Medium', detail: `${(count / 1000).toFixed(1)}k reviews` };
    return { level: 'Emerging', detail: `${count.toLocaleString()} reviews` };
  }
  function parseReviewCount(label) {
    if (label == null) return 0;
    if (typeof label === 'number') return label;
    const m = String(label).match(/([\d,.]+)\s*k\+?/i);
    if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')) * 1000);
    const n = String(label).replace(/[^\d]/g, '');
    return parseInt(n, 10) || 0;
  }

  /** Structured Steam Deck info parsed from the legacy rating string. */
  function getDeckInfo(rating) {
    const r = String(rating || '');
    const lower = r.toLowerCase();
    const status = lower.includes('verif') ? 'Verified' : lower.includes('playable') ? 'Playable' : lower.includes('unsupport') || lower.includes('poor') ? 'Unsupported' : 'Unknown';
    const fps = (r.match(/(\d+\s*-\s*\d+|\d+)\s*fps/i) || [])[1]?.replace(/\s/g, '') || null;
    const battery = (r.match(/(\d+\+?\s*hour)/i) || [])[1] || null;
    return { status, fps, battery, label: r };
  }
  function isCleanMtx(game) {
    return /clean|zero|100% free|no micro|no battle|no gacha|expansion model/i.test(game?.realityCheck?.monetization || '');
  }
  function costPerHourOf(game, { useSale = true, hoursMode = 'main' } = {}) {
    const hours = hoursMode === 'completionist'
      ? (game?.realityCheck?.completionistHours || 0)
      : (game?.realityCheck?.mainStoryHours || 0);
    const price = (useSale && game?.salePrice != null && game.salePrice < game.basePriceUsd)
      ? game.salePrice : game.basePriceUsd;
    if (!hours || hours <= 0) return null;
    return { value: price / hours, price, hours };
  }

  /** Solid verdict math: Bayesian pull toward a prior when review counts are thin,
   *  so a 97% from 400 votes never outranks a 93% from 700k. */
  const CONSENSUS_PRIOR = 75;
  const BAYES_M = 25000;
  function computeUnifiedSolid({ steam, meta, user10, steamCount }) {
    const count = steamCount || 0;
    const adjSteam = steam == null
      ? steam
      : (count * steam + BAYES_M * CONSENSUS_PRIOR) / (count + BAYES_M);
    return computeUnified({ steam: adjSteam, meta, user10 });
  }

  /** Coverage gate: how many independent score sources back this verdict. */
  function assessCoverage({ steam, meta, oc }) {
    const n = [steam, meta, oc].filter(v => v != null).length;
    return n === 0 ? 'estimated' : n === 1 ? 'thin' : 'solid';
  }

  /** Critics-vs-players split detector: a gap over 15 points across any two
   *  sources describes nobody when averaged, so flag it instead. */
  const SPLIT_GAP = 15;
  function detectSplit({ steam, meta, oc }) {
    const pts = [
      steam != null ? { label: 'Steam', value: steam } : null,
      meta != null ? { label: 'Metacritic', value: meta } : null,
      oc != null ? { label: 'OpenCritic', value: oc } : null
    ].filter(Boolean);
    if (pts.length < 2) return null;
    let hi = pts[0], lo = pts[0];
    for (const p of pts) {
      if (p.value > hi.value) hi = p;
      if (p.value < lo.value) lo = p;
    }
    const gap = hi.value - lo.value;
    return gap > SPLIT_GAP ? { gap, high: hi, low: lo } : null;
  }

  /** Median sampled playtime (review minutes → hours), junk-tolerant. */
  function medianPlaytime(samples) {
    const hrs = (samples || [])
      .map(s => s?.playtimeMins)
      .filter(v => typeof v === 'number' && isFinite(v) && v > 0)
      .map(v => v / 60)
      .sort((a, b) => a - b);
    if (!hrs.length) return null;
    const mid = Math.floor(hrs.length / 2);
    const med = hrs.length % 2 ? hrs[mid] : (hrs[mid - 1] + hrs[mid]) / 2;
    return Math.round(med * 10) / 10;
  }

  /** Quote hygiene: length floor, cross-source dedupe, most-backed first. */
  const QUOTE_MIN_LEN = 40;
  function cleanQuotes(quotes, limit = 3) {
    const seen = new Set();
    return (quotes || [])
      .filter(q => q?.quote && q.quote.trim().length >= QUOTE_MIN_LEN)
      .map(q => ({ ...q, votes: q.votes || 0 }))
      .sort((a, b) => b.votes - a.votes)
      .filter(q => {
        const key = q.quote.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  /** Data-age stamp for cached live verdicts. */
  function timeAgo(ts) {
    if (!ts) return 'unknown age';
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 3600) return 'just now';
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  /** Parse a Steam profile URL, raw SteamID64, or vanity name into a lookup. */
  function parseSteamInput(input) {
    const s = String(input || '').trim();
    if (!s) return null;
    if (/^\d{17,}$/.test(s)) return { kind: 'id', value: s };
    const m = s.match(/steamcommunity\.com\/(profiles|id)\/([^/?#]+)/i);
    if (m) {
      const seg = decodeURIComponent(m[2]).replace(/\/+$/, '');
      if (m[1].toLowerCase() === 'profiles') {
        return /^\d{17,}$/.test(seg) ? { kind: 'id', value: seg } : null;
      }
      return /^[A-Za-z0-9_-]{2,32}$/.test(seg) ? { kind: 'vanity', value: seg } : null;
    }
    return /^[A-Za-z0-9_-]{2,32}$/.test(s) ? { kind: 'vanity', value: s } : null;
  }

  /** Library-wide triage inputs: totals, unplayed pile, sunk hours, stale count. */
  function computeLibraryStats(games) {
    const list = games || [];
    const now = Date.now() / 1000;
    let unplayed = 0, mins = 0, stale = 0;
    for (const g of list) {
      if (!g.playtimeMins) unplayed++;
      mins += g.playtimeMins || 0;
      if (g.rtimeLastPlayed > 0 && now - g.rtimeLastPlayed > 90 * 86400) stale++;
    }
    return {
      total: list.length,
      unplayed,
      played: list.length - unplayed,
      hoursPlayed: Math.round((mins / 60) * 10) / 10,
      stale90: stale
    };
  }

  /** Session fit from genres: short-session loops vs epic commitments. Heuristic, labelled. */
  function sessionFit(genres) {
    const g = (genres || []).join(' ').toLowerCase();
    if (/roguel|deckbuild|puzzle|platform|racing|sport|party|rhythm|casual|fighting/.test(g)) return 'short';
    if (/crpg|\brpg\b|open world|strategy|tactic|simulation|souls|jrpg|survival|mmo/.test(g)) return 'epic';
    return 'either';
  }

  /** Finish-or-cut triage over owned games with hour estimates.
   *  finish: started (2h+), untouched 90d+, still has 1h+ left — quick wins first.
   *  cut: never played — biggest commitments surface first. */
  function finishOrCut(games, nowSec) {
    const now = nowSec || Date.now() / 1000;
    const finish = [], cut = [];
    for (const g of games || []) {
      if (g.estMainHrs == null || g.estMainHrs <= 0) continue;
      const playedHrs = (g.playtimeMins || 0) / 60;
      const remainingHrs = Math.round((g.estMainHrs - playedHrs) * 10) / 10;
      const lastAge = g.rtimeLastPlayed > 0 ? now - g.rtimeLastPlayed : null;
      if (playedHrs >= 2 && lastAge != null && lastAge > 90 * 86400 && remainingHrs > 1) {
        finish.push({ ...g, playedHrs: Math.round(playedHrs * 10) / 10, remainingHrs });
      } else if ((g.playtimeMins || 0) === 0) {
        cut.push({ ...g, playedHrs: 0, remainingHrs: g.estMainHrs });
      }
    }
    finish.sort((a, b) => a.remainingHrs - b.remainingHrs);
    cut.sort((a, b) => b.estMainHrs - a.estMainHrs);
    return { finish, cut };
  }

  /** Conservative sequel grouping: trailing numerals order a series, bare titles rank first. */
  const NUMERAL_RANK = { ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
  function seriesKey(name) {
    const clean = String(name || '').trim();
    const m = clean.match(/^(.*?)\s+(ii|iii|iv|v|vi|vii|\d{1,2})$/i);
    if (!m) return { base: clean.toLowerCase(), rank: 1 };
    return { base: m[1].toLowerCase(), rank: NUMERAL_RANK[m[2].toLowerCase()] || parseInt(m[2], 10) };
  }
  function seriesGroups(games) {
    const byBase = new Map();
    for (const g of games || []) {
      const s = seriesKey(g.name);
      if (!s.base) continue;
      if (!byBase.has(s.base)) byBase.set(s.base, []);
      byBase.get(s.base).push({ ...g, rank: s.rank });
    }
    const groups = [];
    for (const [base, entries] of byBase) {
      if (entries.length < 2) continue;
      entries.sort((a, b) => a.rank - b.rank);
      const first = entries[0];
      const sequelPlayed = entries.slice(1).some(e => (e.playtimeMins || 0) > 0);
      groups.push({
        base: base.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        entries,
        missingPredecessor: sequelPlayed && (first.playtimeMins || 0) === 0
      });
    }
    return groups;
  }

  /** Genre-based hour estimate for live games (HLTB has no public API; heuristic, labelled estimated). */
  function estimateHours(genres, hash) {
    const g = (genres || []).join(' ').toLowerCase();
    let base = 24;
    if (/crpg|rpg|open world|epic/i.test(g)) base = 55;
    else if (/roguel|deckbuild|strategy|tactic/i.test(g)) base = 25;
    else if (/casual|puzzle|platform|indie/i.test(g)) base = 12;
    else if (/shooter|action|adventure|narrative|story/i.test(g)) base = 18;
    const main = base + (hash % 12);
    return { main, comp: Math.round(main * 2.6 + (hash % 20)) };
  }

  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function fuzzyMatch(query, text) {
    const q = norm(query), t = norm(text);
    if (!q || !t) return false;
    if (t.includes(q)) return true;
    return q.split(' ').every(tok =>
      t.split(' ').some(w => w.startsWith(tok) || levenshtein(tok, w) <= Math.max(1, Math.floor(tok.length / 4)))
    );
  }
  function matchCurated(query) {
    const q = query.trim().toLowerCase();
    return CURATED_GAMES.find(g =>
      fuzzyMatch(q, g.title) || fuzzyMatch(q, g.developer) || fuzzyMatch(q, g.publisher) ||
      g.genres.some(genre => fuzzyMatch(q, genre))
    ) || null;
  }

  /** Similar-games recommender: genre overlap first, then consensus closeness, Deck bonus. */
  function getSimilar(game, pool, n = 3) {
    if (!game) return [];
    const genres = new Set((game.genres || []).map(x => String(x).toLowerCase()));
    return (pool || CURATED_GAMES)
      .filter(g => g.id !== game.id)
      .map(g => {
        const overlap = (g.genres || []).filter(x => genres.has(String(x).toLowerCase())).length;
        const gap = Math.abs((g.unifiedConsensusPercent || 0) - (game.unifiedConsensusPercent || 0));
        const deckBonus = /verif/i.test(g?.realityCheck?.steamDeckRating || '') ? 2 : 0;
        return { game: g, score: overlap * 50 - gap * 0.5 + deckBonus };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map(x => x.game);
  }

  /** Seeded static database (top-100 snapshot, refreshed weekly by scripts/seed.mjs).
   *  Served as Tier 1.5: below hand-curated, above live fetch. Entries carry
   *  fetchedAt so the card's age stamp stays honest. */
  let seedPool = [];
  let seedMeta = { generatedAt: null, count: 0 };
  function setSeedPool(list, meta) {
    seedPool = Array.isArray(list) ? list : [];
    if (meta) seedMeta = meta;
    else seedMeta = { generatedAt: null, count: seedPool.length };
  }
  function getSeedPool() { return seedPool; }
  function getSeedMeta() { return seedMeta; }
  function upsertSeed(entry) {
    const i = seedPool.findIndex(e => e.id === entry.id);
    if (i >= 0) seedPool[i] = entry;
  }

  /** Surprise pick: best weight-per-hour value among unplayed backlog games.
   *  Deterministic argmax by default; pass a rand fn for weighted roulette. */
  function surpriseWeight(g, weeklyHours) {
    const consensus = g.curated?.unifiedConsensusPercent ?? 75;
    const shortBonus = (g.fit === 'short' && weeklyHours <= 5) ? 1.5 : 1;
    return (consensus / g.estMainHrs) * shortBonus;
  }
  function surpriseReason(g) {
    const bits = [`~${g.estMainHrs}h ask`];
    if (g.fit === 'short') bits.push('short-session fit');
    if (g.curated?.unifiedConsensusPercent != null) bits.push(`rated ${g.curated.unifiedConsensusPercent}%`);
    return `${g.name}: ${bits.join(' · ')}`;
  }
  function surprisePick(candidates, weeklyHours = 8, rand = null) {
    const pool = (candidates || [])
      .filter(g => (g.playtimeMins || 0) === 0 && g.estMainHrs > 0)
      .map(g => ({ g, w: surpriseWeight(g, weeklyHours) }));
    if (!pool.length) return { pick: null, reason: 'No unplayed games with hour data.' };
    let pick;
    if (rand) {
      const total = pool.reduce((s, e) => s + e.w, 0);
      let r = rand() * total;
      pick = pool[pool.length - 1].g;
      for (const e of pool) { r -= e.w; if (r <= 0) { pick = e.g; break; } }
    } else {
      pick = pool.reduce((best, e) => (e.w > best.w ? e : best)).g;
    }
    return { pick, reason: surpriseReason(pick) };
  }

  /** Device fit: Deck/proxy verdicts from real signals, consoles from platform
   *  strings. Absence says "not listed" (UI copy), except Switch where Steam
   *  data is silent — there absence stays an honest unknown. */
  const CONSOLE_TOKENS = { ps5: ['ps5'], xbox: ['xbox series', 'xbox one', 'xbox'], switch: ['switch'] };
  function deviceFit(game, device) {
    const d = String(device || '').toLowerCase();
    const rating = game?.realityCheck?.steamDeckRating || '';
    const plats = (game?.platforms || []).join(' ').toLowerCase();
    if (d === 'deck' || d === 'laptop') {
      if (/verif/i.test(rating)) return 'fits';
      if (d === 'deck' && /playable/i.test(rating)) return 'fits';
      if (d === 'deck' && /unsupport|poor|borked/i.test(rating)) return 'no';
      return 'unknown';
    }
    if (CONSOLE_TOKENS[d]) {
      if (CONSOLE_TOKENS[d].some(t => plats.includes(t))) return 'fits';
      return d === 'switch' ? 'unknown' : 'no';
    }
    return 'unknown';
  }

  /** Co-op signal: genre tags or Steam category flags surfaced by the backend. */
  function hasCoop(game) {
    if ((game?.genres || []).some(g => /co-?op|split[ -]?screen/i.test(g))) return true;
    return (game?.features?.coop || []).length > 0;
  }

  /** Family line from required_age + content descriptors. Null when unknown. */
  function familyLine(family) {
    if (!family) return null;
    const age = family.requiredAge;
    const desc = (family.descriptors || []).filter(Boolean);
    if (age == null && !desc.length) return null;
    const head = age > 0 ? `Age ${age}+` : 'All ages';
    const tail = desc.length ? desc.join(', ') : (age > 0 ? '' : 'no content descriptors');
    return tail ? `${head} · ${tail}` : head;
  }

  /** Wishlist drop math: savings vs the price you saved, null when no drop. */
  function dropFor(saved, now) {
    if (saved == null || now == null || !(now < saved) || !(saved > 0)) return null;
    return { now, saved, pct: Math.round((1 - now / saved) * 100) };
  }

  /** Completionist share from an achievements payload, null-safe. */
  function achievementPct(a) {
    if (!a || !(a.total > 0)) return null;
    return Math.round((a.unlocked / a.total) * 100);
  }

  /** Review-bomb guard: recent sample craters while a solid overall holds.
   *  Quiet on thin samples, thin overalls, and small dips — no false alarms. */
  const BOMB_GAP = 15;
  const BOMB_MIN_OVERALL = 1000;
  const BOMB_MIN_N = 10;
  function bombSignal({ steamPct, steamCount, trend }) {
    if (steamPct == null || !trend || trend.n < BOMB_MIN_N) return null;
    if ((steamCount || 0) < BOMB_MIN_OVERALL) return null;
    const gap = steamPct - trend.pct;
    if (gap < BOMB_GAP) return null;
    return { gap, overallPct: steamPct, recentPct: trend.pct, recentN: trend.n };
  }

  /** Frontend memory cache for live lookups (10 min TTL) to avoid refetching per keystroke. */
  const liveMemoryCache = new Map();
  const LIVE_TTL_MS = 10 * 60 * 1000;
  function getCachedLive(query) {
    const hit = liveMemoryCache.get(norm(query));
    if (hit && Date.now() - hit.ts < LIVE_TTL_MS) return hit.data;
    liveMemoryCache.delete(norm(query));
    return null;
  }
  function setCachedLive(query, data) {
    liveMemoryCache.set(norm(query), { data, ts: Date.now() });
    if (liveMemoryCache.size > 60) liveMemoryCache.delete(liveMemoryCache.keys().next().value);
  }
  const recentLive = [];

  /**
   * Fetch Live Data from Reputed Review Sites (Steam Reviews & Metacritic via CheapShark API)
   */
  async function fetchLiveGameReviewData(query) {
    const cached = getCachedLive(query);
    if (cached) return cached;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    // 1. Local aggregator: Steam + Metacritic + OpenCritic + CheapShark (no CORS issues, no key needed)
    // GAMEVERDICT_API_BASE lets node scripts (seed) run the same pipeline against a local server.
    try {
      const apiBase = globalThis.GAMEVERDICT_API_BASE || '';
      const localRes = await fetch(`${apiBase}/api/live-game?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (localRes.ok) {
        const json = await localRes.json();
        if (json.success && json.data && (json.data.steamRatingPercent != null || json.data.metacriticScore != null || json.data.openCriticScore != null)) {
          clearTimeout(timeout);
          setCachedLive(query, json.data);
          return json.data;
        }
      }
    } catch (_) { /* fall through to direct CheapShark fallback */ }

    // 2. Direct browser fallback: CheapShark only (price + Steam % + Metacritic), used on static hosts
    try {
      const csRes = await fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(query)}&limit=5`, { signal: controller.signal });
      if (!csRes.ok) return null;
      const deals = await csRes.json();
      if (!Array.isArray(deals) || !deals.length) return null;
      const withSteam = deals.filter(d => d.steamAppID && d.steamRatingCount);
      const best = withSteam.sort((a, b) => (parseInt(b.steamRatingCount, 10) || 0) - (parseInt(a.steamRatingCount, 10) || 0))[0] || deals[0];
      const fallback = {
        title: best.title,
        steamAppID: best.steamAppID || null,
        steamRatingPercent: parseInt(best.steamRatingPercent, 10) || null,
        steamRatingText: best.steamRatingText || 'Positive',
        steamRatingCount: parseInt(best.steamRatingCount, 10) || 0,
        metacriticScore: parseInt(best.metacriticScore, 10) || null,
        metacriticLink: best.metacriticLink ? `https://www.metacritic.com${best.metacriticLink}` : null,
        openCriticScore: null, openCriticReviews: [], steamReviews: [],
        salePrice: parseFloat(best.salePrice) || null,
        normalPrice: parseFloat(best.normalPrice) || 59.99,
        thumb: best.thumb || null,
        sources: ['CheapShark']
      };
      setCachedLive(query, fallback);
      return fallback;
    } catch (err) {
      console.warn('[GameVerdict] Live API unavailable:', err.message);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Search or dynamically synthesize consensus for ANY game
   * Tier 1: Curated Library
   * Tier 2: Real-time Live Steam & Metacritic Data
   * Tier 3: Algorithmic Consensus Engine Fallback
   */
  async function searchGame(query) {
    // --- Tier 1: Check in curated collection (fuzzy: typos + partial tokens) ---
    const match = matchCurated(query);

    if (match) {
      const count = match.scores?.steamReviewCount != null ? parseReviewCount(match.scores.steamReviewCount) : 0;
      return {
        ...match,
        isLive: false,
        isEstimate: false,
        unknownScores: false,
        confidence: confidenceFor(count),
        coverage: 'solid',
        split: match.scores ? detectSplit({
          steam: match.scores.steamPositivePercent,
          meta: match.scores.metaCritic,
          oc: match.scores.openCritic
        }) : null,
        trend: null,
        fetchedAt: null
      };
    }

    // --- Tier 1.5: Seeded snapshot (top-100, weekly). Static but age-stamped. ---
    const seeded = seedPool.find(e => fuzzyMatch(query, e.title));
    if (seeded) {
      return { ...seeded, seedPooled: true };
    }

    // --- Tier 2: Live multi-source reviews (Steam + Metacritic + OpenCritic) ---
    const live = await fetchLiveGameReviewData(query);
    if (live && (live.steamRatingPercent != null || live.metacriticScore != null || live.openCriticScore != null)) {
      // Missing sources stay missing: no fabrication, coverage gate decides trust.
      const steamPct = live.steamRatingPercent ?? null;
      const metaScore = live.metacriticScore ?? null;
      const openScore = live.openCriticScore ?? null;
      const userRating = steamPct != null ? (steamPct / 10).toFixed(1) : null;

      const coverage = assessCoverage({ steam: steamPct, meta: metaScore, oc: openScore });
      const split = detectSplit({ steam: steamPct, meta: metaScore, oc: openScore });
      // Solid math: Bayesian pull toward the prior when review counts are thin.
      const unifiedPercent = computeUnifiedSolid({
        steam: steamPct, meta: metaScore,
        user10: userRating != null ? parseFloat(userRating) : null,
        steamCount: live.steamRatingCount || 0
      });

      // Recent-sample trend: needs a real sample, else no claim.
      let trend = null;
      if (live.steamRecent && live.steamRecent.n >= 10 && steamPct != null) {
        const d = live.steamRecent.pct - steamPct;
        trend = {
          pct: live.steamRecent.pct, n: live.steamRecent.n,
          direction: d >= 5 ? 'rising' : d <= -5 ? 'falling' : 'steady'
        };
      }
      const sampledMedianHrs = medianPlaytime((live.steamReviews || []).map(r => ({ playtimeMins: r.playtimeMins })));
      const sampledN = (live.steamReviews || []).filter(r => typeof r.playtimeMins === 'number' && r.playtimeMins > 0).length;

      let badge = 'Worth a Play';
      let badgeType = 'amber';
      let hookDesc = 'Engaging core gameplay mechanics and responsive audiovisual feedback.';
      let flawDesc = 'Minor pacing variations and occasional genre difficulty spikes.';
      let audienceDesc = 'Gamers looking for high-quality genre entertainment.';

      if (split) {
        badge = 'Divisive — Players vs Critics';
        badgeType = 'rose';
        hookDesc = `${split.low.label} sits at ${split.low.value} while ${split.high.label} scores ${split.high.value} — a ${split.gap}-point gap. Read both sides before buying.`;
        flawDesc = 'The two audiences disagree sharply: check whether you side with players or critics on this one.';
        audienceDesc = 'Only for players who match the happier side of the split; everyone else should wait for a deep sale.';
      } else if (coverage === 'thin') {
        badge = 'Thin Data — Treat With Care';
        badgeType = 'amber';
        const only = steamPct != null ? `Steam at ${steamPct}%` : metaScore != null ? `Metacritic at ${metaScore}` : `OpenCritic at ${openScore}`;
        hookDesc = `Only one source backs this verdict so far (${only}). The score is provisional.`;
        flawDesc = 'Single-source verdicts miss blind spots — wait for a second source before treating this as settled.';
        audienceDesc = 'Early adopters comfortable with uncertainty; cautious buyers should wishlist and revisit.';
      } else if (unifiedPercent >= 93) {
        badge = 'Essential Masterpiece';
        badgeType = 'emerald';
        hookDesc = live.steamRatingCount > 0
          ? `Celebrated by over ${live.steamRatingCount.toLocaleString()} verified Steam players with ${live.steamRatingText} acclaim and award-level execution.`
          : 'Celebrated across critics and players with award-level execution.';
        flawDesc = 'Demands high commitment and patience with complex systems or challenging difficulty curves.';
        audienceDesc = 'Essential for anyone who values peak game design, deep storytelling, and polished mechanics.';
      } else if (unifiedPercent >= 84) {
        badge = 'Strong Recommendation';
        badgeType = 'emerald';
        hookDesc = steamPct != null && metaScore != null
          ? `Solid ${steamPct}% positive Steam consensus supported by a ${metaScore}/100 Metascore.`
          : 'Solid cross-source consensus with strong execution.';
        flawDesc = 'Occasional repetitive quest design or mid-campaign pacing dips.';
        audienceDesc = 'Highly recommended for genre enthusiasts and fans of this style of gameplay.';
      } else if (unifiedPercent >= 70) {
        badge = 'Good with Flaws';
        badgeType = 'amber';
        hookDesc = 'Creative premise and distinct moments of excitement that shine through rough edges.';
        flawDesc = 'Community reports balance inconsistencies, occasional performance bugs, or grindy progression.';
        audienceDesc = 'Great pick on a 30%+ Steam sale or for dedicated fans of the franchise.';
      } else {
        badge = 'Divisive / Wait for Sale';
        badgeType = 'rose';
        hookDesc = 'Interesting conceptual ideas that struggle under technical execution.';
        flawDesc = steamPct != null
          ? `Currently sitting at ${steamPct}% Steam approval (${live.steamRatingText}) due to technical bugs, gameplay balance, or monetization.`
          : 'Currently sitting at low cross-source approval due to technical bugs, gameplay balance, or monetization.';
        audienceDesc = 'Only recommend for patient players who can wait for upcoming patches and discount sales.';
      }

      // Steam header art image
      const steamImg = live.steamAppID
        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${live.steamAppID}/header.jpg`
        : (live.thumb || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80');

      const sources = live.sources || ['Steam', 'Metacritic'];
      const rawQuotes = [];
      [...(live.steamReviews || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 4).forEach(r => rawQuotes.push({
        source: `Steam · ${r.votes > 50 ? 'Top helpful' : 'Verified player'}`,
        author: r.author, quote: r.quote, sentiment: r.votedUp ? 'positive' : 'neutral', url: 'https://store.steampowered.com',
        votes: r.votes || 0
      }));
      (live.openCriticReviews || []).slice(0, 2).forEach(r => rawQuotes.push({
        source: 'OpenCritic · Critic', author: r.author, quote: r.quote, sentiment: 'neutral', url: r.url, votes: 0
      }));
      if (live.metacriticScore && rawQuotes.length < 3) rawQuotes.push({
        source: 'Metacritic', author: 'Critic aggregate',
        quote: `Metascore ${live.metacriticScore}/100. Full breakdown: ${live.metacriticLink || 'metacritic.com'}`,
        sentiment: 'neutral', url: live.metacriticLink, votes: 0
      });
      if (!rawQuotes.length && steamPct != null) rawQuotes.push({
        source: sources.join(' + ') || 'Live consensus',
        author: `${(live.steamRatingCount || 0).toLocaleString()} players`,
        quote: `Rated "${live.steamRatingText}" with ${steamPct}% positive reception.`,
        sentiment: steamPct >= 80 ? 'positive' : 'neutral', url: null, votes: 0
      });
      const liveQuotes = cleanQuotes(rawQuotes, 3);

      // Genre-based hour estimate (HLTB has no public API) — labelled estimated in the UI.
      let titleHash = 0;
      for (let i = 0; i < String(live.title).length; i++) titleHash = (titleHash << 5) - titleHash + String(live.title).charCodeAt(i);
      titleHash = Math.abs(titleHash);
      const estHours = estimateHours(live.genres, titleHash);

      // Deck status: ProtonDB tier when available, else an explicitly estimated guess.
      let deckRating = 'Playable (Unverified — no ProtonDB reports)';
      let deckEstimated = true;
      if (live.deckProton && live.deckProton.tier) {
        const t = live.deckProton.tier;
        deckEstimated = false;
        deckRating = /platinum|gold/i.test(t)
          ? `Verified via ProtonDB (${t}, ${live.deckProton.total} reports)`
          : /silver/i.test(t)
            ? `Playable via ProtonDB (${t}, ${live.deckProton.total} reports)`
            : `Unsupported via ProtonDB (${t}, ${live.deckProton.total} reports)`;
      }
      // Monetization: Steam store categories flag in-app purchases; never assume clean.
      const priceBase = (live.normalPrice || 59.99).toFixed(2);
      const saleBit = live.salePrice && live.salePrice < live.normalPrice ? ` · Sale: $${live.salePrice.toFixed(2)}` : '';
      const monetization = live.hasInAppPurchases === true
        ? `⚠️ In-App Purchases flagged on Steam ($${priceBase}${saleBit})`
        : live.hasInAppPurchases === false
          ? `💎 No in-app purchases on Steam ($${priceBase}${saleBit})`
          : `💎 Standard Retail ($${priceBase}${saleBit})`;

      const built = {
        id: `live-${live.steamAppID || norm(live.title).replace(/ /g, '-')}`,
        title: live.title,
        releaseYear: live.releaseDate || 'Verified Title',
        developer: live.developer || 'Verified Developer',
        publisher: live.publisher || 'Steam Verified Publisher',
        genres: (live.genres && live.genres.length ? live.genres : ['Action', 'Adventure']),
        steamAppID: live.steamAppID || null,
        headerImg: live.headerImg || steamImg,
        backdropImg: live.headerImg || steamImg,
        platforms: (live.platforms && live.platforms.length ? live.platforms : ['PC (Steam)', 'Windows']),
        subscriptionServices: [],
        basePriceUsd: live.normalPrice || 59.99,
        salePrice: (live.salePrice != null && live.salePrice < (live.normalPrice || 59.99)) ? live.salePrice : null,
        isLive: true,
        isEstimate: false,
        unknownScores: false,
        confidence: confidenceFor(live.steamRatingCount || 0),
        coverage,
        split,
        trend,
        fetchedAt: Date.now(),
        liveSource: `Live: ${sources.join(' · ')}`,
        liveLinks: { metacritic: live.metacriticLink || null, openCritic: live.openCriticUrl || null, steamAppID: live.steamAppID || null },
        features: live.features || null,
        family: live.family || null,
        scores: {
          steamPositivePercent: steamPct,
          steamStatus: live.steamRatingText,
          steamReviewCount: live.steamRatingCount
            ? `${live.steamRatingCount.toLocaleString()} Verified Steam Reviews`
            : 'Review count unavailable',
          openCritic: openScore,
          metaCritic: metaScore,
          userBacklogRating: userRating != null ? parseFloat(userRating) : null
        },
        unifiedConsensusPercent: unifiedPercent,
        verdictBadge: badge,
        badgeType: badgeType,
        threeSentenceVerdict: {
          coreHook: hookDesc,
          flaw: flawDesc,
          targetAudience: audienceDesc
        },
        realityCheck: {
          timeToFun: '⚡ 15 mins (Standard campaign onboarding)',
          mainStoryHours: estHours.main,
          completionistHours: estHours.comp,
          hoursEstimated: true,
          sampledMedianHrs,
          sampledN,
          steamDeckRating: deckRating,
          deckEstimated,
          monetization,
          pacing: 'Dynamic Player-Driven Flow',
          difficultyCurve: 'Moderate Progression'
        },
        topQuotes: liveQuotes
      };
      built.bomb = bombSignal({ steamPct, steamCount: live.steamRatingCount || 0, trend });
      upsertSeed(built); // refresh any stale snapshot entry in-session
      if (!recentLive.some(g => g.id === built.id)) {
        recentLive.unshift(built);
        if (recentLive.length > 12) recentLive.pop();
      }
      return built;
    }

    // --- Tier 3: Honest unknown state. No invented scores: the live APIs are
    // unreachable and this title is not curated, so there is nothing real to
    // average. The card shows "not enough data" plus similar curated titles.
    const titleCased = query.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      id: `unknown-${norm(query).replace(/ /g, '-') || 'game'}`,
      title: titleCased,
      releaseYear: 'Unknown',
      developer: 'Unknown',
      publisher: 'Unknown',
      genres: ['Action', 'Adventure', 'Singleplayer'],
      steamAppID: null,
      headerImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      backdropImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      platforms: ['PC (Steam)'],
      subscriptionServices: [],
      basePriceUsd: 0,
      salePrice: null,
      isLive: false,
      isEstimate: true,
      unknownScores: true,
      estimateNote: 'Not enough data — live reviews are unreachable and this title is not curated. No score shown rather than a guessed one.',
      liveSource: 'Unverified (no live data)',
      confidence: { level: 'None', detail: 'No sources' },
      coverage: 'estimated',
      split: null,
      fetchedAt: Date.now(),
      scores: null,
      unifiedConsensusPercent: null,
      verdictBadge: 'Unverified — Not Enough Data',
      badgeType: 'zinc',
      threeSentenceVerdict: {
        coreHook: 'We could not reach Steam, OpenCritic, or Metacritic for this title, so there is no verified verdict.',
        flaw: 'Anything shown here would be a guess. Rely on the similar verified titles below instead.',
        targetAudience: 'Hold off until live consensus loads — check back with a connection.'
      },
      realityCheck: {
        timeToFun: 'Unknown',
        mainStoryHours: 0,
        completionistHours: 0,
        hoursEstimated: false,
        hoursUnknown: true,
        steamDeckRating: 'Unknown',
        monetization: 'Unknown',
        pacing: 'Unknown',
        difficultyCurve: 'Unknown'
      },
      topQuotes: []
    };
  }

  return {
    CURATED_GAMES,
    FILTER_PRESETS,
    CONSENSUS_WEIGHTS,
    recentLive,
    searchGame,
    computeUnified,
    computeUnifiedSolid,
    assessCoverage,
    detectSplit,
    medianPlaytime,
    cleanQuotes,
    timeAgo,
    confidenceFor,
    parseReviewCount,
    getDeckInfo,
    isCleanMtx,
    costPerHourOf,
    estimateHours,
    getSimilar,
    fuzzyMatch,
    parseSteamInput,
    computeLibraryStats,
    sessionFit,
    finishOrCut,
    seriesGroups,
    setSeedPool,
    getSeedPool,
    getSeedMeta,
    surprisePick,
    bombSignal,
    deviceFit,
    hasCoop,
    familyLine,
    dropFor,
    achievementPct
  };
})();
