// UKEMI U-4b-2b (ADR-U4b-2b D1/D7; G0 U-4b-2 test 11 and precondition [C-3]) -- the FRESH episode weth-2025-09-22,
// replayed OFFLINE from the four committed series under fixtures/ukemi/u4b/ (declared in PROVENANCE-u4b-weth-2025-09-22.md):
//   - u4b_fresh_scores_recompute_from_committed_inputs: the FROZEN scorer (computeScoresU4b) over the committed reduced
//     book, oracle path and realized labels, serialized exactly as the frozen reducer writes it
//     (scripts/census/u4b/u4b-reduce.mjs, scores section), equals the committed scores series BYTE FOR BYTE. This
//     composes, in the repository, the chain course -> scores -> registry -> served verdict (CA-11 hardened).
//   - u4b_registry_recomputes_from_fresh_scores_jsonl: the FROZEN generator over that series gives the per-stratum n, p,
//     under_calib and C5 digests; the cell-A key is the served UKEMI_LIQ_PREDICTOR_BASE; q-hat of s0 is the stratum
//     maximum READ from the series (p = n, pre-registered H-2bis), never a typed amount.
// Export-excluded (scripts/export-exclude-tests.json): it imports the frozen scorer and generator and reads the
// export-excluded fresh series. NO network. Pins are sha256 digests, counts and keys only (ADR-U4b-2b section 5).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { computeScoresU4b, type U4bBook, type U4bU3Line, type U4bCell } from "../../../scripts/census/u4b/u4b-scores.mjs";
import { buildRegistryEntries } from "../../../scripts/record-u4b-calib.mjs";
import { UKEMI_LIQ_PREDICTOR_BASE } from "@monark/harness/calibration";

const U4B = join(fileURLToPath(new URL(".", import.meta.url)), "fixtures", "ukemi", "u4b");
const BOOK = join(U4B, "U4b-book-23414968.json");
const ORACLE = join(U4B, "U4b-oracle-path-weth-2025-09-22.jsonl");
const SCORES = join(U4B, "U4b-scores-weth-2025-09-22.jsonl");
const LABELS = join(U4B, "U3-realized-weth-2025-09-22.jsonl");

/** LF sha256 of the four committed series (= PROVENANCE-u4b-weth-2025-09-22.md = the course record, Sidecar 6). */
const PINS: ReadonlyArray<readonly [string, string]> = [
  [BOOK, "4b601785681cb8f6cdbbcc3a99f1cb19424e0a568c703cb9625628526e058341"],
  [ORACLE, "cc7f5cd9b7b93a319044514a1d150a805393e69c575314ff21b1cb9c6ddb0971"],
  [SCORES, "fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4"],
  [LABELS, "e2d6c0e48f3503aed4e48d5041d6178ca28b8dc6db36c19ba534ccd4c5611837"],
];
const lfText = (p: string): string => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
function jsonl<T>(p: string): T[] {
  return lfText(p).split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as T);
}

interface OAnchor { kind: "anchor"; price: string }
interface OMeta { kind: "meta"; event_id: string; emode_params: Record<string, { lt: string; bonus: string }>; usdt_prices: Record<string, string> }
interface OUpdate { kind: "update"; block: number; log_index: number; price: string }

test("u4b_fresh_scores_recompute_from_committed_inputs", () => {
  for (const [p, want] of PINS) assert.equal(sha(lfText(p)), want, `committed series ${p} is the course artifact (LF sha256)`);
  const book = JSON.parse(lfText(BOOK)) as U4bBook;
  const oLines = jsonl<OAnchor | OMeta | OUpdate>(ORACLE);
  const anchor = oLines.find((l): l is OAnchor => l.kind === "anchor");
  const meta = oLines.find((l): l is OMeta => l.kind === "meta");
  if (anchor === undefined || meta === undefined) throw new Error("oracle path: anchor or meta line missing");
  // The oracle input exactly as the frozen reducer builds it (update lines kept whole, anchor price, e-mode params).
  const oracle = { event_id: meta.event_id, anchor_price: anchor.price, updates: oLines.filter((l): l is OUpdate => l.kind === "update"), emode_params: meta.emode_params, usdt_prices: meta.usdt_prices };
  const s = computeScoresU4b(book, oracle, jsonl<U4bU3Line>(LABELS));
  // The reducer's serialization of the scores series (meta, class-A rows, class-B rows; one JSON line each).
  const cellMeta = (c: U4bCell) => ({ predictor_id: c.predictor_id, task_class: c.task_class, alpha: c.alpha, n_min: c.n_min, anchor_price: c.anchor_price, n: c.n, p: c.p, qhat: c.qhat, calib_digest: c.calib_digest, strata: c.strata.map((x) => ({ strate: x.strate, n: x.n, p: x.p, qhat: x.qhat, calib_digest: x.calib_digest, max_score: x.max_score })) });
  const lines: unknown[] = [
    { kind: "meta", cell_a: cellMeta(s.cellA), cell_b: cellMeta(s.cellB), census: s.census },
    ...s.cellA.rows.map((r) => ({ kind: "score_a", ...r })),
    ...s.cellB.rows.map((r) => ({ kind: "score_b", address: r.address, y: r.y, yhat: r.yhat, score: r.score, liquidated: r.liquidated, strate: r.strate })),
  ];
  const recomposed = lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
  assert.ok(s.cellA.rows.length >= 200 && s.cellB.rows.length >= 40, "non-vacuous recomposition (measured 205 class-A and 47 class-B rows)");
  assert.equal(recomposed, lfText(SCORES), "the frozen scorer over the committed inputs recomposes the committed scores series byte for byte");
});

interface MetaLine { kind: "meta"; cell_a: { predictor_id: string; strata: Array<{ strate: number; n: number; p: number | null }> } }
interface ScoreARow { kind: "score_a"; strate: number; score: string; [k: string]: unknown }

test("u4b_registry_recomputes_from_fresh_scores_jsonl", () => {
  const lines = jsonl<{ kind: string }>(SCORES);
  const meta = lines.find((l): l is MetaLine => l.kind === "meta");
  if (meta === undefined) throw new Error("the fresh series has no meta line");
  const rowsA = lines.filter((l): l is ScoreARow => l.kind === "score_a");
  // The served base IS the fresh cell-A key (mutant (l): any other base literal reds here and in the served artifact test).
  assert.equal(meta.cell_a.predictor_id, UKEMI_LIQ_PREDICTOR_BASE, "meta.cell_a.predictor_id === UKEMI_LIQ_PREDICTOR_BASE");
  const e = buildRegistryEntries(rowsA, { scale: 1n, predictorBase: meta.cell_a.predictor_id });
  assert.deepEqual(e.map((x) => [x.strate, x.n, x.p, x.under_calib]), [
    [0, 170, 170, false],
    [1, 21, 22, true],
    [2, 10, 11, true],
    [3, 4, 5, true],
  ], "per-stratum n / p / under_calib (only s0 reaches nMin = 100; p = ceil((n+1)(1-alpha)))");
  assert.deepEqual(e.map((x) => x.calib_digest), [
    "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334",
    "e3cd7a6151d3982f4ca5aef10540bed7caa22e168ed054d35b3b537bc7d533fc",
    "6626856f4a10844c280cb0dc458a96ae2de54d9e6ecbd28e2aff6b9af8a2247d",
    "66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925",
  ], "per-stratum C5 digests (ADR-U4b-2b section 1.3, recomputed independently)");
  assert.deepEqual(e.map((x) => x.predictor_id), [0, 1, 2, 3].map((k) => `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(k)}`), "keys BASE/s<k>");
  // The scorer's own per-stratum (n, p) agree with the generator (two frozen tools, one series).
  assert.deepEqual(meta.cell_a.strata.map((x) => [x.strate, x.n, x.p]), e.map((x) => [x.strate, x.n, x.p]), "scorer meta strata == generator strata");
  // q-hat of s0 = the stratum MAXIMUM read from the series (p = n: pre-registered H-2bis, reported as is); scale 1 exact.
  const s0 = rowsA.filter((r) => r.strate === 0).map((r) => BigInt(r.score));
  const max = s0.reduce((a, b) => (b > a ? b : a), 0n);
  assert.ok(s0.length === 170 && max > 0n, "s0 is non-vacuous with a positive maximum");
  assert.ok(rowsA.every((r) => BigInt(r.score) <= 2n ** 53n), "every fresh score is exact at scale 1 (<= 2^53; G0 item 5 without object here)");
  assert.equal(e[0]?.qhat, Number(max), "q-hat of s0 equals the stratum maximum of the committed series");
  for (const x of e.slice(1)) assert.equal(x.qhat, null, `s${String(x.strate)}: under_calib => q-hat null, never a clamped max`);
});
