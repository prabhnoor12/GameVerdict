# GameVerdict 🎮
> **Zero-Fluff Consensus & Backlog Reality Engine for Games**

GameVerdict eliminates review-bombing noise, 40-minute YouTube sponsor fluff, and marketing hype. Search any game title and get an instant, distilled decision card with a unified consensus score (Steam, OpenCritic, Metacritic), the 3-sentence gamer verdict, Steam Deck verification, and a personalized Backlog ROI calculator.

---

## ⚡ Key Features

- **🎯 The Unified Gamer Consensus Gauge**:
  - Aggregates **Steam Community Positive %**, **OpenCritic Top Critic Average**, **Metacritic**, and **User Backlog Score** side-by-side.
  - Synthesizes a unified percentage and verdict badge (*"Essential Masterpiece"*, *"Redeemed Masterpiece"*, *"Divisive / Wait for Sale"*).
- **⚡ The 3-Sentence Gamer Decision Box**:
  - 🟢 **The Core Hook & Loop**: What makes the second-to-second gameplay dopamine hit so satisfying.
  - 🔴 **The Friction & Grind**: The mid-game pacing dips, difficulty spikes, or inventory chores nobody mentions.
  - 🎯 **Who Should Play / Who Should Skip**: Precise gamer personas to prevent buyer's remorse.
- **🛠️ The Gamer Reality Gauge (4 Crucial Checks)**:
  - ⏱️ **Time-to-Fun (TTF)**: How fast the game kicks off (e.g. *DOOM Eternal: 1 minute* vs *RPG tutorial slog: 2.5 hours*).
  - ⏳ **Backlog Time Commitment**: Main Story vs 100% completionist hours (via HowLongToBeat reference data).
  - 🎮 **Steam Deck & Handheld Rating**: Target FPS, battery profiles, and verified status.
  - 💎 **Monetization Model**: Flagging cosmetic-only, battle pass grinds, or 100% clean singleplayer experiences.
- **🧮 Interactive Backlog ROI & Joy-Hour Calculator**:
  - Move the weekly free time slider to calculate **Weeks to Beat** and **Cost-per-Joy-Hour** compared to traditional entertainment.
- **💬 Unfiltered Community & Critic Truth**:
  - Directly compares Steam Top Helpful Reviews (unvarnished gamer perspective), top games media (PC Gamer, Eurogamer, IGN), and tech performance labs (Digital Foundry).
- **🌐 Live Multi-Source Reviews** (Steam + Metacritic + OpenCritic + CheapShark via `/api/live-game?q=`; real player/critic quotes with verify links; static-host fallback is CheapShark-only):
- **⚡ Smart Search & Dynamic Algorithmic Synthesis**:
  - Includes deep curated benchmarks (*Elden Ring, Baldur's Gate 3, Cyberpunk 2077, Hades II, Balatro, Black Myth: Wukong, Helldivers 2, Starfield, Red Dead Redemption 2, Hollow Knight, Doom Eternal*).
  - Automatically synthesizes realistic consensus data for **any game typed by the user**.
- **☕ 100% Free with Coffee Support**: Zero paywalls, zero ads, zero user tracking.

---

## 📁 Project Structure

```
D:\GameVerdict/
├── index.html            # Vite entry (mounts /src/main.js)
├── src/
│   ├── main.js           # App bootstrap
│   ├── App.vue           # Layout: header, footer, modals, toast, compare tray, wishlist drawer
│   ├── store.js          # Reactive store: search, filters+sort, ROI, wishlist, compare
│   ├── style.css         # Tailwind + custom styles
│   └── components/
│       ├── SearchHero.vue    # Search, filter presets, sort, trending chips
│       ├── VerdictCard.vue   # Consensus gauge, scores, 3-sentence box, reality gauge, quotes
│       └── RoiCalculator.vue # Backlog ROI calculator
├── js/
│   └── game-data.js      # Curated DB + live multi-source consensus engine (imported by src/store.js)
├── css/ js/app.js js/vue-app.js  # Pre-Vite legacy files (not used by the build)
├── server.js             # Live review API (/api/live-game, /api/health) + dist/ static host
├── vite.config.js        # Vue plugin + /api → :3000 proxy for `npm run dev`
└── dist/                 # Production build output (`npm run build`)
```

**New in the proper Vue 3 version:** installed `vue`, `vite`, `@vitejs/plugin-vue`, `tailwindcss` (no more CDN), SFC components, `npm run dev` (HMR at :5173, API proxied to :3000), `npm run build` → `dist/`, wishlist in `localStorage`, compare tray (max 3), sort selector.



---

## 🚀 Running Locally & Deploying for Free

### Local Run:
```bash
cd D:\GameVerdict
python -m http.server 8081
# Open http://localhost:8081
```
*(Or with Node: `npx serve .`)*

### Keyboard Shortcuts:
- Press `/` anywhere to instantly focus the game search bar.
- Press `Esc` to close modals.

### Free Deployment:
Drag and drop the `D:\GameVerdict` folder directly into [Netlify](https://app.netlify.com/drop) or [Cloudflare Pages](https://pages.cloudflare.com/) for instant, 100% free hosting with zero server costs!
