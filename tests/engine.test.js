import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameData } from '../js/game-data.js';

// Verdict-solid contract: Bayesian weighting, coverage gating, split
// detection, median playtime, quote hygiene, honest unknown state.

describe('computeUnified (raw formula, unchanged)', () => {
  it('weights Steam 55 / Meta 35 / backlog-user 10', () => {
    assert.equal(GameData.computeUnified({ steam: 90, meta: 80, user10: 8.5 }), 86);
  });
});

describe('computeUnifiedSolid (Bayesian review-count weighting)', () => {
  it('leans on the prior when review counts are tiny', () => {
    const thin = GameData.computeUnifiedSolid({ steam: 97, meta: 90, user10: 9.0, steamCount: 400 });
    const raw = GameData.computeUnified({ steam: 97, meta: 90, user10: 9.0 });
    assert.ok(thin < raw, `thin ${thin} should pull below raw ${raw}`);
  });
  it('leaves high-count consensus alone', () => {
    const solid = GameData.computeUnifiedSolid({ steam: 97, meta: 90, user10: 9.0, steamCount: 500000 });
    const raw = GameData.computeUnified({ steam: 97, meta: 90, user10: 9.0 });
    assert.ok(Math.abs(solid - raw) <= 1, `solid ${solid} should ≈ raw ${raw}`);
  });
});

describe('assessCoverage (source-count gating)', () => {
  it('marks single-source verdicts thin', () => {
    assert.equal(GameData.assessCoverage({ steam: 90, meta: null, oc: null }), 'thin');
  });
  it('marks two-source verdicts solid', () => {
    assert.equal(GameData.assessCoverage({ steam: 90, meta: 84, oc: null }), 'solid');
  });
  it('marks zero-source verdicts estimated', () => {
    assert.equal(GameData.assessCoverage({ steam: null, meta: null, oc: null }), 'estimated');
  });
});

describe('detectSplit (critics-vs-players guard)', () => {
  it('flags a Starfield-style split', () => {
    const split = GameData.detectSplit({ steam: 57, meta: 83, oc: 85 });
    assert.ok(split, 'expected a split');
    assert.equal(split.gap, 28);
    assert.equal(split.low.label, 'Steam');
  });
  it('passes aligned scores', () => {
    assert.equal(GameData.detectSplit({ steam: 93, meta: 96, oc: 95 }), null);
  });
  it('ignores missing sources', () => {
    assert.equal(GameData.detectSplit({ steam: 57, meta: null, oc: null }), null);
  });
});

describe('medianPlaytime (sampled-hours signal)', () => {
  it('takes the median in hours and ignores junk', () => {
    assert.equal(GameData.medianPlaytime([{ playtimeMins: 60 }, { playtimeMins: 120 }, { playtimeMins: 'x' }, {}]), 1.5);
  });
  it('returns null when nothing usable was sampled', () => {
    assert.equal(GameData.medianPlaytime([]), null);
    assert.equal(GameData.medianPlaytime([{}]), null);
  });
});

describe('cleanQuotes (rank, dedupe, length floor)', () => {
  it('sorts by votes, drops dupes and stubs', () => {
    const out = GameData.cleanQuotes([
      { source: 'Steam', author: 'a', quote: 'ok', votes: 999 },
      { source: 'Steam', author: 'b', quote: 'A genuinely great loop with tons to chew on here for fans.', votes: 5 },
      { source: 'Steam', author: 'c', quote: 'A genuinely great loop with tons to chew on here for fans!', votes: 500 },
      { source: 'OC', author: 'd', quote: 'Short but sharp critical verdict on the whole game indeed.', votes: 1 }
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0].author, 'c');
  });
});

describe('timeAgo (data-age stamp)', () => {
  it('labels fresh stamps just now', () => {
    assert.equal(GameData.timeAgo(Date.now()), 'just now');
  });
  it('labels hours and days', () => {
    assert.equal(GameData.timeAgo(Date.now() - 3 * 3600e3), '3h ago');
    assert.equal(GameData.timeAgo(Date.now() - 2 * 86400e3), '2d ago');
  });
});

describe('Tier 3 unknown state (no invented scores)', () => {
  it('returns null scores with an honest badge', async () => {
    const g = await GameData.searchGame('zzzzqqqq-no-such-game-123');
    assert.equal(g.unknownScores, true);
    assert.equal(g.unifiedConsensusPercent, null);
    assert.equal(g.scores, null);
    assert.match(g.verdictBadge, /not enough data/i);
  });
  it('still offers similar curated fallbacks', async () => {
    const g = await GameData.searchGame('zzzzqqqq-no-such-game-123');
    const sim = GameData.getSimilar(g, GameData.CURATED_GAMES, 3);
    assert.equal(sim.length, 3);
  });
});

describe('parseSteamInput (profile URL, id, or vanity)', () => {
  it('reads raw SteamID64', () => {
    assert.deepEqual(GameData.parseSteamInput('76561198012345678'), { kind: 'id', value: '76561198012345678' });
  });
  it('reads profile and vanity URLs', () => {
    assert.deepEqual(
      GameData.parseSteamInput('https://steamcommunity.com/profiles/76561198012345678/'),
      { kind: 'id', value: '76561198012345678' }
    );
    assert.deepEqual(
      GameData.parseSteamInput('https://steamcommunity.com/id/someplayer'),
      { kind: 'vanity', value: 'someplayer' }
    );
  });
  it('reads bare vanity names and rejects junk', () => {
    assert.deepEqual(GameData.parseSteamInput('someplayer'), { kind: 'vanity', value: 'someplayer' });
    assert.equal(GameData.parseSteamInput('http://example.com/nope'), null);
    assert.equal(GameData.parseSteamInput(''), null);
  });
});

describe('computeLibraryStats (owned-library triage inputs)', () => {
  const lib = [
    { appid: 1, name: 'A', playtimeMins: 0, rtimeLastPlayed: 0 },
    { appid: 2, name: 'B', playtimeMins: 600, rtimeLastPlayed: Date.now() / 1000 - 100 * 86400 },
    { appid: 3, name: 'C', playtimeMins: 60, rtimeLastPlayed: Date.now() / 1000 - 3600 }
  ];
  it('totals owned, unplayed, and hours', () => {
    const s = GameData.computeLibraryStats(lib);
    assert.equal(s.total, 3);
    assert.equal(s.unplayed, 1);
    assert.equal(s.hoursPlayed, 11);
  });
});

describe('sessionFit (weeknight vs epic from genres)', () => {
  it('routes roguelikes to short sessions and RPGs to epics', () => {
    assert.equal(GameData.sessionFit(['Roguelike', 'Deckbuilder']), 'short');
    assert.equal(GameData.sessionFit(['Action RPG', 'Open World']), 'epic');
    assert.equal(GameData.sessionFit(['Adventure']), 'either');
  });
});

describe('finishOrCut (started-stale vs never-played)', () => {
  const day = 86400, now = Date.now() / 1000;
  it('flags a started-stale game to finish', () => {
    const out = GameData.finishOrCut([
      { appid: 1, name: 'Epic', playtimeMins: 1800, rtimeLastPlayed: now - 120 * day, estMainHrs: 60 }
    ]);
    assert.equal(out.finish.length, 1);
    assert.equal(out.cut.length, 0);
    assert.ok(out.finish[0].remainingHrs > 0);
  });
  it('flags a never-played game to cut-or-start, not finish', () => {
    const out = GameData.finishOrCut([
      { appid: 2, name: 'Dusty', playtimeMins: 0, rtimeLastPlayed: 0, estMainHrs: 20 }
    ]);
    assert.equal(out.finish.length, 0);
    assert.equal(out.cut.length, 1);
  });
  it('leaves fresh and finished games alone', () => {
    const out = GameData.finishOrCut([
      { appid: 3, name: 'Fresh', playtimeMins: 30, rtimeLastPlayed: now - 3600, estMainHrs: 25 },
      { appid: 4, name: 'Done', playtimeMins: 4000, rtimeLastPlayed: now - 200 * day, estMainHrs: 60 }
    ]);
    assert.equal(out.finish.length + out.cut.length, 0);
  });
});

describe('seriesGroups (sequel catch-up, conservative)', () => {
  it('groups numbered entries and spots a missing predecessor', () => {
    const groups = GameData.seriesGroups([
      { appid: 1, name: 'Dark Souls III', playtimeMins: 0 },
      { appid: 2, name: 'Dark Souls', playtimeMins: 5000 }
    ]);
    assert.equal(groups.length, 1);
    assert.ok(groups[0].missingPredecessor === false);
  });
  it('ignores one-offs', () => {
    assert.equal(GameData.seriesGroups([{ appid: 1, name: 'Balatro', playtimeMins: 0 }]).length, 0);
  });
});

describe('surprisePick (weighted backlog pick with a reason)', () => {
  it('favors quick wins and explains itself', () => {
    const pick = GameData.surprisePick([
      { appid: 1, name: 'Epic', playtimeMins: 0, estMainHrs: 80, fit: 'epic', curated: null },
      { appid: 2, name: 'Quick', playtimeMins: 0, estMainHrs: 8, fit: 'short', curated: null }
    ], 4);
    assert.equal(pick.pick.name, 'Quick');
    assert.match(pick.reason, /8h/i);
  });
  it('skips started games and returns null on an empty pile', () => {
    assert.equal(GameData.surprisePick([{ appid: 1, name: 'Busy', playtimeMins: 600, estMainHrs: 40, fit: 'epic' }], 8).pick, null);
    assert.equal(GameData.surprisePick([], 8).pick, null);
  });
});

describe('bombSignal (review-bomb guard, careful wording)', () => {
  it('flags recent cratering against a solid overall', () => {
    const b = GameData.bombSignal({ steamPct: 89, steamCount: 120000, trend: { pct: 52, n: 20 } });
    assert.ok(b);
    assert.equal(b.gap, 37);
  });
  it('stays quiet on thin samples and aligned scores', () => {
    assert.equal(GameData.bombSignal({ steamPct: 89, steamCount: 120000, trend: { pct: 52, n: 4 } }), null);
    assert.equal(GameData.bombSignal({ steamPct: 89, steamCount: 500, trend: { pct: 52, n: 20 } }), null);
    assert.equal(GameData.bombSignal({ steamPct: 71, steamCount: 120000, trend: { pct: 66, n: 20 } }), null);
    assert.equal(GameData.bombSignal({ steamPct: 89, steamCount: 120000, trend: null }), null);
  });
});

describe('seed pool (static top-100 database)', () => {
  it('serves pooled verdicts before hitting live', async () => {
    GameData.setSeedPool([{
      id: 'seed-1', title: 'Seeded Game', genres: ['Action'],
      unifiedConsensusPercent: 88, verdictBadge: 'Seeded', badgeType: 'emerald',
      scores: { steamPositivePercent: 90, steamStatus: 'Very Positive', steamReviewCount: '50k', openCritic: 85, metaCritic: 86, userBacklogRating: 8.8 },
      realityCheck: { mainStoryHours: 20, completionistHours: 50 },
      topQuotes: [], isLive: false, isEstimate: false
    }]);
    const g = await GameData.searchGame('seeded game');
    assert.equal(g.title, 'Seeded Game');
    assert.equal(g.seedPooled, true);
    GameData.setSeedPool([]);
  });
});

describe('deviceFit (Deck/proxy/platform, honest unknowns)', () => {
  const decked = { platforms: ['PC (Steam)'], realityCheck: { steamDeckRating: 'Verified via ProtonDB (platinum, 900 reports)' }, features: null };
  it('fits Deck-verified games on Deck', () => {
    assert.equal(GameData.deviceFit(decked, 'deck'), 'fits');
  });
  it('answers unknown when there is no signal', () => {
    assert.equal(GameData.deviceFit({ platforms: [], realityCheck: {} }, 'deck'), 'unknown');
    assert.equal(GameData.deviceFit(decked, 'switch'), 'unknown');
  });
  it('matches console platforms by string', () => {
    assert.equal(GameData.deviceFit({ platforms: ['PC (Steam)', 'PS5'], realityCheck: {} }, 'ps5'), 'fits');
    assert.equal(GameData.deviceFit({ platforms: ['PC (Steam)'], realityCheck: {} }, 'ps5'), 'no');
  });
});

describe('familyLine (required_age + descriptors, one line)', () => {
  it('states clean all-ages plainly', () => {
    assert.equal(GameData.familyLine({ requiredAge: 0, descriptors: [] }), 'All ages · no content descriptors');
  });
  it('names age gate and descriptors', () => {
    assert.equal(
      GameData.familyLine({ requiredAge: 17, descriptors: ['Violence', 'Strong Language'] }),
      'Age 17+ · Violence, Strong Language'
    );
  });
  it('returns null with no data instead of guessing', () => {
    assert.equal(GameData.familyLine(null), null);
    assert.equal(GameData.familyLine({ requiredAge: null, descriptors: [] }), null);
  });
});

describe('dropFor (wishlist price-drop math)', () => {
  it('flags a real drop with percent', () => {
    assert.deepEqual(GameData.dropFor(59.99, 29.99), { now: 29.99, saved: 59.99, pct: 50 });
  });
  it('stays quiet on no-change, rise, and missing prices', () => {
    assert.equal(GameData.dropFor(59.99, 59.99), null);
    assert.equal(GameData.dropFor(29.99, 59.99), null);
    assert.equal(GameData.dropFor(59.99, null), null);
  });
});

describe('achievementPct (completionist signal)', () => {
  it('computes unlocked share, null-safe', () => {
    assert.equal(GameData.achievementPct({ total: 50, unlocked: 25 }), 50);
    assert.equal(GameData.achievementPct({ total: 0, unlocked: 0 }), null);
    assert.equal(GameData.achievementPct(null), null);
  });
});

describe('mergeRows (last-write-wins sync merge)', () => {
  it('keeps newer local rows and adds unseen remote rows', async () => {
    const { mergeRows } = await import('../js/sync.js');
    const out = mergeRows(
      [{ id: 'a', title: 'Local newer', addedAt: 200 }, { id: 'b', title: 'Local only', addedAt: 50 }],
      [{ id: 'a', title: 'Remote older', addedAt: 100 }, { id: 'c', title: 'Remote only', addedAt: 10 }],
      'id', 'addedAt'
    );
    const byId = Object.fromEntries(out.map((r) => [r.id, r]));
    assert.equal(byId.a.title, 'Local newer');
    assert.equal(byId.b.title, 'Local only');
    assert.equal(byId.c.title, 'Remote only');
  });
});

describe('sync guards (disconnected by default)', () => {
  it('skips every network op with no credentials', async () => {
    const sync = await import('../js/sync.js');
    assert.deepEqual(await sync.pushLocal({ wishlist: [{ id: 'x' }] }), { skipped: true, reason: 'supabase not connected' });
    assert.deepEqual((await sync.pullRemote({})).reason, 'supabase not connected');
    assert.deepEqual((await sync.submitRating('g', 8)).reason, 'supabase not connected');
    assert.deepEqual((await sync.communityAverage('g')).reason, 'supabase not connected');
  });
  it('rejects out-of-range scores without a network round-trip', async () => {
    const sync = await import('../js/sync.js');
    assert.deepEqual(await sync.submitRating('g', 99), { ok: false, error: 'Score must be 1–10.' });
  });
});

describe('existing engine behavior (no regressions)', () => {
  it('fuzzy-matches typos', () => {
    assert.ok(GameData.fuzzyMatch('elden rng', 'Elden Ring'));
  });
  it('parses Deck strings into structure', () => {
    assert.deepEqual(
      GameData.getDeckInfo('Verified (Solid 40 FPS / Medium settings)'),
      { status: 'Verified', fps: '40', battery: null, label: 'Verified (Solid 40 FPS / Medium settings)' }
    );
  });
  it('prices sale-aware hours correctly', () => {
    const g = { ...GameData.CURATED_GAMES[3], salePrice: 9.99 };
    assert.deepEqual(GameData.costPerHourOf(g, { useSale: true, hoursMode: 'main' }), { value: 9.99 / 15, price: 9.99, hours: 15 });
  });
});
