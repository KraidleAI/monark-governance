// MONARK Bell — deterministic oracle (ADR-B0 D5). The dominant correction gain is the non-LLM oracle:
// named mutants, each RED by construction on the reduced fixture. No network here (rpc.call injected).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { rowsFromCsv, haltDelta, census, haltsSince, type HaltRow } from "../src/halts.ts";
import { canonReason, tallyReasons } from "../src/reason-canon.ts";
import { etWallClockToUtcMs, classifySession } from "../src/sessions.ts";
import { extractPoolSwap, swapsForPool, type JsonRpcCall, type SigInfo, type SwapFill } from "../src/rpc.ts";
import { vwapDecimal, sessionGap } from "../src/gap.ts";
import { buildDigest, bellSha, assertNoClose, canonical, provenance, type GapEntry } from "../src/digest.ts";
import { POOLS } from "../src/pools.ts";
import { scanText, compilePatterns, collectTargets } from "../../../scripts/grep-forbidden.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REDUCED = readFileSync(join(HERE, "fixtures", "halts-reduced.csv"), "utf8");
const ROOT = join(HERE, "..", "..", "..");
const POOL = POOLS[0]!; // TSLAx/USDC Raydium CLMM (declared vaults)

// A transaction shaped like getTransaction(jsonParsed): only the fields extractPoolSwap reads. Index 0/1
// are the pool vaults; index 2 is a Jupiter-hop account (owner ≠ pool) that MUST be excluded.
function makeSwapTx(baseDelta: bigint, quoteDelta: bigint): unknown {
  const base0 = 1_000_000_000n, quote0 = 5_000_000_000n;
  return {
    transaction: { message: { accountKeys: [{ pubkey: POOL.vaultBase }, { pubkey: POOL.vaultQuote }, { pubkey: "JupHopNoiseAcct1111111111111111111111111111" }] } },
    meta: {
      err: null,
      preTokenBalances: [
        { accountIndex: 0, mint: "TSLAx", uiTokenAmount: { amount: base0.toString(), decimals: 8 } },
        { accountIndex: 1, mint: "USDC", uiTokenAmount: { amount: quote0.toString(), decimals: 6 } },
        { accountIndex: 2, mint: "USDC", uiTokenAmount: { amount: "9999", decimals: 6 } },
      ],
      postTokenBalances: [
        { accountIndex: 0, mint: "TSLAx", uiTokenAmount: { amount: (base0 + baseDelta).toString(), decimals: 8 } },
        { accountIndex: 1, mint: "USDC", uiTokenAmount: { amount: (quote0 + quoteDelta).toString(), decimals: 6 } },
        { accountIndex: 2, mint: "USDC", uiTokenAmount: { amount: "1111", decimals: 6 } },
      ],
    },
  };
}
const rows: HaltRow[] = rowsFromCsv(REDUCED);
const byId = (sym: string): HaltRow => rows.find((r) => r.symbol === sym)!;

// ---- (ii) halt / CSV / reason ---------------------------------------------------------------------
test("bell_csv_parses_quoted_names_and_dst_rows", () => {
  // The Freight name carries a comma AND wrapping literal quotes — a naive split would corrupt it.
  assert.equal(byId("FRGT").name, '"Freight Technologies, Inc. Ordinary Shares"');
  assert.equal(byId("ASND").reason, "News pending");
  assert.equal(byId("INHD").haltTime, "15:52:53");
  assert.equal(rows.length, 5);
});

test("bell_reason_graphie_break", () => {
  // A graphie off the closed carte ("LULD PAUSE" all-caps) → REASON_UNKNOWN, never bucketed in silence.
  assert.equal(canonReason("LULD pause"), "LULD_PAUSE");
  assert.equal(canonReason("LULD PAUSE"), "REASON_UNKNOWN");
  const t = tallyReasons(rows.map((r) => r.reason));
  assert.equal(t.REASON_UNKNOWN, 1); // the ZZZZ row
  assert.equal(t.LULD_PAUSE, 2); // INHD + FRGT
});

test("bell_dst_wrong_zone_reddens", () => {
  // ASND 2026-02-27 is standard time (UTC−5) → 21:26:29Z; INHD 2026-07-31 is under DST (UTC−4) → 19:52:53Z.
  const asnd = new Date(etWallClockToUtcMs(2026, 2, 27, 16, 26, 29));
  const inhd = new Date(etWallClockToUtcMs(2026, 7, 31, 15, 52, 53));
  assert.equal(asnd.getUTCHours(), 21);
  assert.equal(inhd.getUTCHours(), 19);
  // Mutant: a FIXED −5h offset would place INHD at 20:52:53Z — wrong by the DST hour.
  const fixedMinus5 = Date.UTC(2026, 6, 31, 15, 52, 53) + 5 * 3600_000;
  assert.notEqual(inhd.getTime(), fixedMinus5);
  assert.equal(inhd.getTime(), Date.UTC(2026, 6, 31, 15, 52, 53) + 4 * 3600_000);
});

test("bell_halt_shift_one_second_changes_delta", () => {
  const haltUtc = etWallClockToUtcMs(2026, 7, 31, 15, 52, 53);
  const boundaryFill: SwapFill = { signature: "s", blockTimeUtcMs: haltUtc, baseDelta: 1n, quoteDelta: 1n };
  const row = byId("INHD");
  const d0 = haltDelta(row, [boundaryFill]);
  const d1 = haltDelta({ ...row, haltTime: "15:52:54" }, [boundaryFill]); // +1s
  assert.equal(d0.firstFillAfterHaltUtcMs, haltUtc); // fill is AT the halt second → included
  assert.equal(d1.firstFillAfterHaltUtcMs, null); // halt one second later → the fill is now before it
  assert.notDeepEqual(d0.firstFillAfterHaltUtcMs, d1.firstFillAfterHaltUtcMs);
});

test("bell_halt_residues_named_never_silent", () => {
  assert.ok(haltDelta(byId("UZX"), []).residues.includes("resume_time_missing"));
  assert.ok(haltDelta(byId("ZZZZ"), []).residues.includes("reason_unknown"));
  assert.ok(haltDelta(byId("INHD"), []).residues.includes("no_fill_in_window"));
  // census reproduces the shape used on the full CSV (small here)
  assert.equal(census(rows).emptyResume, 1);
  assert.equal(haltsSince(rows, ["ZZZZ"], "2026-01-01").length, 1);
});

// ---- (i) fills / VWAP / dedup ---------------------------------------------------------------------
test("bell_vwap_matches_recorded_swap", () => {
  // Real measured swap: vault deltas TSLAx +15349152 (8 dec), USDC −55888132 (6 dec) ⇒ ~364.11 USDC/TSLAx.
  const fill = extractPoolSwap("sig1", 1_789_800_000, makeSwapTx(15_349_152n, -55_888_132n), POOL);
  assert.ok(fill);
  assert.equal(fill.baseDelta, 15_349_152n);
  assert.equal(fill.quoteDelta, -55_888_132n); // Jupiter-hop noise (index 2) excluded
  assert.equal(Number(vwapDecimal([fill], 8, 6)).toFixed(2), "364.11");
});

test("bell_volume_dedup_by_signature", async () => {
  const call: JsonRpcCall = () => Promise.resolve(makeSwapTx(15_349_152n, -55_888_132n));
  const bt = 1_789_800_000;
  const sigs: SigInfo[] = [
    { signature: "sigA", blockTime: bt, err: null },
    { signature: "sigA", blockTime: bt, err: null }, // duplicate listing of the SAME signature
    { signature: "sigB", blockTime: bt, err: null },
  ];
  const fills = await swapsForPool(call, "inject://", sigs, POOL);
  assert.equal(fills.length, 2); // deduped: sigA counted once, not twice
  // Without dedup the volume would be 3× — the guard is that the count is the number of UNIQUE signatures.
  assert.equal(vwapDecimal(fills, 8, 6), vwapDecimal([fills[0]!], 8, 6)); // equal-price swaps ⇒ VWAP stable
});

// ---- digest / replay / close guard ----------------------------------------------------------------
function digestFrom(closeRef: number): ReturnType<typeof buildDigest> {
  const fills: SwapFill[] = [
    { signature: "a", blockTimeUtcMs: 1_789_800_000_000, baseDelta: 15_349_152n, quoteDelta: -55_888_132n },
    { signature: "b", blockTimeUtcMs: 1_789_800_100_000, baseDelta: 20_000_000n, quoteDelta: -72_800_000n },
  ];
  const g = sessionGap(fills, closeRef, 8, 6);
  if ("abstain" in g) throw new Error("digestFrom fixtures carry volume; unexpected abstention");
  const entry: GapEntry = { symbol: "TSLAx", session: "weekend", regime: "weekend", vwap: g.vwap, gT: g.gT,
    volumeBase: g.volumeBase, n: g.n, exceed1: 0, exceed2: 0, exceed5: 0 };
  return buildDigest([entry], { total: 5, emptyResume: 1, recense15_since_2025_06_30: 0 });
}
test("bell_session_gap_identical_to_replay", () => {
  const a = digestFrom(364.5), b = digestFrom(364.5); // replay: same inputs
  assert.equal(bellSha(a), bellSha(b)); // bit-identical digest
  assert.equal(canonical(a), canonical(b));
  assert.ok(!canonical(a).includes("close")); // no close field anywhere in the digest
});

test("bell_close_changed_gap_differs", () => {
  assert.notEqual(bellSha(digestFrom(364.5)), bellSha(digestFrom(368.0))); // a different close ⇒ g_t ⇒ sha differ
});

test("bell_close_field_reddens", () => {
  assert.doesNotThrow(() => { assertNoClose(digestFrom(364.5)); }); // clean digest passes
  assert.throws(() => { assertNoClose({ symbol: "TSLAx", close: "123.45" }); }); // numeric-string close ⇒ red
  assert.throws(() => { assertNoClose({ ref_price: 100 }); }); // numeric close-like ⇒ red
  assert.doesNotThrow(() => { assertNoClose({ vwap: "364.11", note: "close of book unrelated string" }); }); // vwap ok, non-numeric ok
});

// ---- secrets / vocab wiring -----------------------------------------------------------------------
test("bell_no_secret_in_repo", () => {
  const SECRET = /(authorization\s*:\s*bearer\s+[\w.-]{16,})|(api[-_]?key\s*[=:]\s*["']?[\w.-]{16,})|([A-Z][A-Z_]*_API_KEY\s*=\s*["'][\w.-]{6,})/i;
  for (const f of ["pools.ts", "rpc.ts", "gap.ts", "halts.ts", "sessions.ts", "digest.ts", "reason-canon.ts"]) {
    assert.equal(SECRET.test(readFileSync(join(HERE, "..", "src", f), "utf8")), false, `secret-shaped context in ${f}`);
  }
  assert.ok(SECRET.test('const k = "api-key=abcdef0123456789";')); // mutant: a real key context reddens
  assert.equal(SECRET.test("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB"), false); // a base58 mint is NOT a secret
});

test("bell_vocab_scope_reddens", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as { scan: { bell: { banned: { re: string; why: string }[] } } };
  const pats = compilePatterns(cfg.scan.bell.banned);
  for (const bad of ["a verified witness", "we guarantee coverage", "our partner venue", "a price band", "±5% at 90%", "3 % at 90 %"]) {
    assert.ok(scanText(bad, pats).length > 0, `should redden: ${bad}`);
  }
  for (const ok of ["signed is not verified", "confirmed on-chain", "the mid is 364", "no verified claim"]) {
    assert.equal(scanText(ok, pats).length, 0, `should stay green: ${ok}`);
  }
  // Wiring proof (branchement): collectTargets actually walks apps/bell/src under the bell scope.
  const targets = collectTargets(ROOT, cfg, []) as { f: string }[];
  const bellFiles = targets.filter((t) => t.f.replace(/\\/g, "/").includes("apps/bell/src"));
  assert.ok(bellFiles.length >= 7, `bell src scanned (${bellFiles.length})`);
});

// ---- session classification (calendar + DST) ------------------------------------------------------
test("bell_session_classification", () => {
  assert.equal(classifySession(Date.UTC(2026, 8, 16, 18, 0, 0)).session, "regular"); // Wed 14:00 ET
  assert.equal(classifySession(Date.UTC(2026, 8, 19, 12, 0, 0)).session, "weekend"); // Sat
  assert.equal(classifySession(Date.UTC(2025, 6, 4, 16, 0, 0)).session, "holiday"); // Independence Day
  assert.equal(classifySession(Date.UTC(2025, 0, 9, 16, 0, 0)).session, "holiday"); // Carter day of mourning
  assert.equal(classifySession(Date.UTC(2026, 8, 17, 3, 0, 0)).regime, "overnight-weekday"); // Wed 23:00 ET
  assert.equal(classifySession(Date.UTC(2025, 6, 3, 18, 0, 0)).session, "after"); // half-day: 14:00 ET is post-13:00 close
});

// ---- G2 fold (2026-09-19) -- new killers for C-1..C-7 (error_origin: generator) -------------------
test("bell_anchor_skips_holidays_and_weekends", () => {
  // An off-market instant anchors on the LAST TRADING DAY (walks back over weekends AND full closures),
  // and regime = that gap's regime (C-1). Mutant: a walk skipping only weekends anchors Sat 07-04 on the
  // Fri 07-03 holiday instead of Thu 07-02 => this test reddens (sessionDateET assertion fires first).
  const sat = classifySession(etWallClockToUtcMs(2026, 7, 4, 12, 0, 0)); // Sat; Fri 2026-07-03 = closure
  assert.equal(sat.session, "weekend");
  assert.equal(sat.sessionDateET, "2026-07-02"); // Thu -- Fri 07-03 (Independence Day observed) skipped
  assert.equal(sat.regime, "holiday"); // the gap spans the 07-03 closure
  const mlk = classifySession(etWallClockToUtcMs(2026, 1, 19, 12, 0, 0)); // MLK 2026-01-19 = full closure
  assert.equal(mlk.session, "holiday");
  assert.equal(mlk.sessionDateET, "2026-01-16"); // Fri
  assert.equal(mlk.regime, "holiday");
  const sun = classifySession(etWallClockToUtcMs(2026, 8, 16, 12, 0, 0)); // ordinary Sunday
  assert.equal(sun.session, "weekend");
  assert.equal(sun.sessionDateET, "2026-08-14"); // Fri
  assert.equal(sun.regime, "weekend");
});

test("bell_canonical_key_order_invariant", () => {
  // Deeply permuted object keys => identical canonical form and bell_sha (canonical sorts keys). Mutant:
  // remove `.sort()` in digest.ts:20 => the two orderings serialize differently => this test reddens.
  const a = { b: 1, a: { y: [{ q: 1, p: 2 }, { q: 3, p: 4 }], x: "s" }, c: [3, 2, 1] };
  const b = { c: [3, 2, 1], a: { x: "s", y: [{ p: 2, q: 1 }, { p: 4, q: 3 }] }, b: 1 };
  assert.equal(canonical(a), canonical(b));
  assert.equal(bellSha(a), bellSha(b));
  // arrays stay ORDER-significant (not sorted): a reordered array must change the sha
  assert.notEqual(bellSha({ c: [1, 2, 3] }), bellSha({ c: [3, 2, 1] }));
});

test("bell_close_guard_catches_camelcase", () => {
  // Widened CLOSE_KEY (C-3) catches camelCase close-like keys and the Polygon `prev` leg. Mutant: narrow
  // the regex back to /close|ref_price|p_ref/i => `refPrice`/`pRef` no longer match => this test reddens.
  assert.throws(() => { assertNoClose({ refPrice: 1 }); });
  assert.throws(() => { assertNoClose({ pRef: 1 }); });
  assert.throws(() => { assertNoClose({ reference: "364.27" }); });
  assert.throws(() => { assertNoClose({ prev: 364.27 }); }); // Polygon prev close
  // `\bprev\b` (not bare prev) so the timeline chain key prev_line_hash is NOT falsely reddened, even
  // when its value is all-digits (numeric-like):
  assert.doesNotThrow(() => { assertNoClose({ prev_line_hash: "1234567890" }); });
  // and the real digest fields never match the widened guard:
  assert.doesNotThrow(() => { assertNoClose({ symbol: "TSLAx", vwap: "364.11", gT: "0.001", volumeBase: "52", n: 52, regime: "weekend" }); });
  // The provenance envelope is published as well: a close smuggled through `sources`/`providers` reddens
  // (checkpoint-2 V-3). Mutant: drop assertNoClose from provenance() => this assertion fails.
  assert.throws(() => { provenance({ a: 1 }, { polygon: { prevClose: 364.27 } }, {}, "2026-09-19T00:00:00Z"); });
  assert.doesNotThrow(() => { provenance({ a: 1 }, { polygon: { endpoint: "v2/aggs" } }, { rpc: ["mainnet-beta"] }, "2026-09-19T00:00:00Z"); });
});

test("bell_zero_volume_abstains_never_zero_gap", () => {
  // Zero volume => explicit abstention with NO numeric g_t (C-4). Mutant: reintroduce gT="0.0000000000"
  // in the zero-volume branch => `"gT" in g` becomes true => this test reddens.
  const g = sessionGap([], 364.5, 8, 6);
  assert.ok(!("gT" in g), "no numeric g_t when volume is zero");
  if (!("abstain" in g)) throw new Error("zero volume must abstain");
  assert.equal(g.abstain, "no_fill_in_window");
  assert.equal(g.volumeBase, (0).toFixed(10));
  assert.equal(g.n, 0);
  // a REAL zero gap (vwap == close) DOES carry g_t = "0.0000000000" -- present, thus distinguishable
  const real = sessionGap([{ signature: "z", blockTimeUtcMs: 1, baseDelta: 100_000_000n, quoteDelta: -364_270_000n }], 364.27, 8, 6);
  assert.ok("gT" in real, "a real gap carries g_t even when it is zero");
  if ("abstain" in real) throw new Error("volume present must not abstain");
  assert.equal(real.gT, (0).toFixed(10));
  // closeRef <= 0 with volume THROWS (never a fabricated 0 / -Infinity) -- the adjacent silent-zero hole
  assert.throws(() => sessionGap([{ signature: "x", blockTimeUtcMs: 1, baseDelta: 100_000_000n, quoteDelta: -1n }], 0, 8, 6));
  // the digest ACCEPTS an abstention entry (abstain is not a close-like key) and hashes it
  const entry: GapEntry = { symbol: "TSLAx", session: "weekend", regime: "weekend", vwap: g.vwap, volumeBase: g.volumeBase, n: g.n, abstain: "no_fill_in_window" };
  assert.doesNotThrow(() => { bellSha(buildDigest([entry], { total: 0, emptyResume: 0 })); });
});

test("bell_halt_last_before_resume_excludes_pre_halt", () => {
  // `lastFillBeforeResume` is bounded BELOW by the halt (C-7): a fill earlier than the halt is not "last
  // before Resume". Mutant: drop the `>= haltUtcMs` bound => before=[preHaltFill] => not null => reddens.
  const row = byId("INHD"); // resume 2026-07-31 16:00:00 present => resumeUtcMs != null
  const haltUtc = etWallClockToUtcMs(2026, 7, 31, 15, 52, 53);
  const preHaltFill: SwapFill = { signature: "pre", blockTimeUtcMs: haltUtc - 1000, baseDelta: 1n, quoteDelta: 1n };
  const d = haltDelta(row, [preHaltFill]);
  assert.equal(d.lastFillBeforeResumeUtcMs, null); // pre-halt fill excluded
  assert.equal(d.firstFillAfterHaltUtcMs, null);
  assert.equal(d.nFillsInWindow, 0);
  assert.ok(d.residues.includes("no_fill_in_window")); // empty window => named residue
});
