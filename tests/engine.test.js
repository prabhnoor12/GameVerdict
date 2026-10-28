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
