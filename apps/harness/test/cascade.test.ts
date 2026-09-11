/**
 * Harness Lot H2 — cascade (UKEMI) tests (ADR-M005 D4/D8/D9, PLAN H2).
 * Each test is killed by >= 1 named mutant (proven red, then restored byte-exact via sha256 — see the
 * passe report). Fully typed: no `any`, no unsafe access — the file stays at the lint ratchet ceiling.
 *
 * The wiring fixture is a 2-node interbank contagion, hand-verifiable from the real primitives:
 *   L = [[0,100],[50,0]], e = [40,20]  ->  E&N clearing L* = [90, 50]  (node 0 defaults, node 1 solvent)
 *   cleared balance-sheet value:  node 0 = e0 + L*_1 = 40+50 = 90   (debt pbar_0 = 100)
 *                                 node 1 = e1 + L*_0 = 20+90 = 110  (debt pbar_1 = 50)
 *   shock 0.0 -> node 0 tips (90 < 100) only            -> yhat = 100   (= the E&N default set)
 *   shock 0.6 -> node 0 (90*0.4=36<100) + node 1 (110*0.4=44<50) -> yhat = 150
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertClosedPrediction, assertNoForbiddenKey } from "@monark/contracts";
import { clearing, pbarOf, UKEMI_PREDICTOR_ID } from "@monark/ukemi";
import {
  runCascade,
  cascadeLiquidable,
  CascadeToolError,
  CASCADE_TOOL_DESCRIPTION,
  CASCADE_MAX_NODES,
  type CascadeInput,
} from "../src/tools/cascade.ts";
import { CASCADE_INPUT_SCHEMA, CASCADE_OUTPUT_SCHEMA, cascadeInputStandardSchema, type Json } from "../src/schema-projection.ts";
import { CASCADE_UNCALIBRATED_SENTENCE } from "../src/tools/gate.ts";

const CONTAGION: CascadeInput = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" };

// ---- frozen-schema drift helpers (the schema.test.ts pattern; JSON via an `unknown` sink, no `any`).
const SCHEMAS = fileURLToPath(new URL("../../../schemas/", import.meta.url));
function loadJson(file: string): Json {
  const parsed: unknown = JSON.parse(readFileSync(SCHEMAS + file, "utf8"));
  return parsed as Json;
}
function asObj(node: Json | undefined, where: string): { [k: string]: Json } {
  if (node === null || node === undefined || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`expected object at ${where}`);
  }
  return node;
}
const SUBSCHEMA_MAP_KEYWORDS = new Set(["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]);
function assertNoAnnotations(node: Json, path: string, insideMap: boolean): void {
  if (Array.isArray(node)) {
    node.forEach((n, i) => { assertNoAnnotations(n, `${path}[${String(i)}]`, false); });
    return;
  }
  if (node === null || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (!insideMap) assert.ok(k !== "description" && k !== "title", `annotation '${k}' leaked onto the wire at ${path}`);
    assertNoAnnotations(v, `${path}.${k}`, SUBSCHEMA_MAP_KEYWORDS.has(k));
  }
}

// Test — the tool EMITS the frozen, closed Prediction; a key outside the contract throws; invalid input
// is a tool error. Mutant: `return { ...prediction, p_correct: 0 }` before the guard in runCascade ⇒ the
// closed-check throws inside runCascade ⇒ the first call reddens.
test("cascade_returns_frozen_prediction", () => {
  const p = runCascade({ L: [[0, 100], [50, 0]], e: [40, 20], shock: 0.2, producedAt: "2026-09-04T00:00:00Z" });
  assertClosedPrediction(p);
  assertNoForbiddenKey(p);
  assert.equal(p.schema_version, "1.0.0");
  assert.equal(p.task_class, "cascade-liquidable-24h");
  assert.equal(p.predictor_id, UKEMI_PREDICTOR_ID);
  assert.equal(p.produced_at, "2026-09-04T00:00:00Z");
  assert.equal(typeof p.yhat, "number");
  assert.equal(p.yhat, 100, "at shock 0.2 only node 0 tips (90*0.8=72 < 100)");
  // K-1 — any key outside the frozen closed contract is refused (both the closed-check and the recursive
  // forbidden-key guard). This is what the `p_correct` mutant trips before it can reach the wire.
  const tampered = { ...p, p_correct: 0 };
  assert.throws(() => { assertClosedPrediction(tampered); }, /unknown key/i);
  assert.throws(() => { assertNoForbiddenKey(tampered); }, /forbidden key/i);
  // K-4a — invalid input ⇒ a tool error, never a silent output.
  assert.throws(() => runCascade({ L: [[0, 1], [1, 0]], e: [1], shock: 0, producedAt: "2026-09-04T00:00:00Z" }), CascadeToolError);
  assert.throws(() => runCascade({ L: [[0, 1], [1, 0]], e: [1, 1], shock: 2, producedAt: "2026-09-04T00:00:00Z" }), CascadeToolError);
  assert.throws(() => runCascade({ L: [[0, 1], [1, 0]], e: [1, 1], shock: 0, producedAt: "not-a-date" }), CascadeToolError);
});

// Test — yhat is genuinely the clearing->liquidableAmount composition, not a constant nor a shortcut.
// Mutant: hard-code yhat in runCascade (e.g. `emitPrediction(999, ...)`) ⇒ the 100/150 assertions redden.
// The anchor (liquidable set == E&N default set at shock 0) also kills an "ignore the clearing inflow,
// use e_i alone" mutant (which would liquidate BOTH nodes at shock 0 ⇒ yhat 150, ids {0,1}).
test("cascade_wires_clearing_to_yhat", () => {
  const liq0 = cascadeLiquidable({ ...CONTAGION, shock: 0 });
  assert.deepEqual(liq0.liquidableIds, ["0"], "only node 0 (the E&N defaulter) is liquidable at shock 0");
  assert.equal(liq0.liquidableDebt, 100, "yhat at shock 0 = node 0 nominal obligations");
  // ANCHOR — recompute the E&N default set independently from the real primitives; it must equal the
  // liquidable set at shock 0. This is the load-bearing proof that the clearing feeds yhat.
  const cleared = clearing({ L: CONTAGION.L, e: CONTAGION.e });
  const pbar = pbarOf(CONTAGION.L);
  const defaultSet = pbar
    .map((pb, i) => ((cleared.pPlus[i] ?? 0) < pb - 1e-9 ? String(i) : null))
    .filter((x): x is string => x !== null);
  assert.deepEqual(liq0.liquidableIds, defaultSet, "liquidable-at-shock-0 == E&N default set");
  // shock 0.6: node 1 also tips (110*0.4=44 < 50); yhat = 150 through the frozen Prediction.
  const p6 = runCascade({ ...CONTAGION, shock: 0.6 });
  assert.equal(p6.yhat, 150, "yhat at shock 0.6 = 100 + 50");
  // DISCRIMINATING SHOCK (R-H2-1): proves the E&N SOLVE is load-bearing, not just the inflow term. At
  // shock 0.57, node 1's CLEARED value (110, via L*) tips (110*0.43=47.3 < 50) ⇒ yhat=150; but under
  // NOMINAL obligations (120, via pbar) it would NOT tip (120*0.43=51.6 >= 50) ⇒ 100. Only the real E&N
  // clearing vector L* yields 150 here — kills the `pPlus -> pbar` mutant that shocks 0/0.2/0.6 miss.
  const p57 = runCascade({ ...CONTAGION, shock: 0.57 });
  assert.equal(p57.yhat, 150, "the E&N solve (L*, not nominal pbar) is load-bearing: 150 not 100 at shock 0.57");
  // a disconnected/hard-coded yhat cannot match BOTH 100 (shock 0) and 150 (shock 0.6).
  const p0 = runCascade({ ...CONTAGION, shock: 0 });
  assert.equal(p0.yhat, 100);
});

// Test — the description makes NO probability/score claim (honesty rides here, not in the Prediction),
// and it carries the K-4e under_calib sentence. Mutant: put `confidence` (or a probability word) in
// CASCADE_TOOL_DESCRIPTION ⇒ the banned pattern matches ⇒ red (also caught by the vocab gate).
test("cascade_description_makes_no_probability_claim", () => {
  const banned = /probability|probable|likelihood|confidence|p_correct|accuracy/i;
  assert.ok(!banned.test(CASCADE_TOOL_DESCRIPTION), "cascade description makes no probability/score claim");
  // non-vacuous positive anchors (the test cannot pass on an empty string).
  assert.ok(CASCADE_TOOL_DESCRIPTION.includes("liquidable"), "description names the liquidable amount");
  assert.ok(CASCADE_TOOL_DESCRIPTION.includes("Eisenberg-Noe"), "description names the real clearing primitive");
  // K-4e — the honest under_calib sentence is carried (single source: gate.ts).
  assert.ok(CASCADE_TOOL_DESCRIPTION.includes(CASCADE_UNCALIBRATED_SENTENCE), "carries the under_calib honesty (K-4e)");
});

// Test — the projected output schema IS the frozen Prediction (drift guard, D8), and the input is the
// NON-frozen FinancialSystem declared field by field. Mutant: drop a `required` entry (or alter a
// property definition) in CASCADE_OUTPUT_SCHEMA ⇒ it diverges from the frozen file ⇒ red.
test("cascade_tool_schema_equals_frozen_prediction", () => {
  const frozen = asObj(loadJson("prediction.schema.json"), "prediction");
  // OUTPUT = projected frozen Prediction (modulo the documented $schema/$id/description/title strip).
  assert.deepEqual(CASCADE_OUTPUT_SCHEMA["required"], frozen["required"], "required must match the frozen file");
  assert.equal(CASCADE_OUTPUT_SCHEMA["additionalProperties"], false, "output stays a closed contract");
  assert.deepEqual(
    Object.keys(asObj(CASCADE_OUTPUT_SCHEMA["properties"], "cascade output.properties")),
    Object.keys(asObj(frozen["properties"], "frozen Prediction.properties")),
    "output property set must match the frozen file",
  );
  assert.deepEqual(
    asObj(CASCADE_OUTPUT_SCHEMA["properties"], "cascade output.properties"),
    asObj(frozen["properties"], "frozen Prediction.properties"),
    "output property definitions must match the frozen file in full",
  );
  assertNoAnnotations(CASCADE_OUTPUT_SCHEMA, "CASCADE_OUTPUT_SCHEMA", false);
  // INPUT is NON-frozen (never in schemas/), declared field by field: exactly L, e, shock, producedAt.
  assert.equal(CASCADE_INPUT_SCHEMA["additionalProperties"], false, "input is a closed envelope");
  assert.deepEqual(
    Object.keys(asObj(CASCADE_INPUT_SCHEMA["properties"], "cascade input.properties")).sort(),
    ["L", "e", "producedAt", "shock"],
    "input declares exactly L, e, shock, producedAt",
  );
  assert.deepEqual(CASCADE_INPUT_SCHEMA["required"], ["L", "e", "shock", "producedAt"], "all four fields required");
});

/** A structurally-valid n-node system (zero matrix, unit external assets): the ONLY thing that can make it
 *  illegal is its size, so it isolates the Lot H6 node cap from every other validation rule. */
function zeroSystem(n: number): CascadeInput {
  return {
    L: Array.from({ length: n }, () => new Array<number>(n).fill(0)),
    e: new Array<number>(n).fill(1),
    shock: 0,
    producedAt: "2026-09-04T00:00:00Z",
  };
}

// Test — the Lot H6 resource cap rejects an oversized interbank system (n > CASCADE_MAX_NODES) at BOTH
// layers, and accepts one exactly at the cap. WHY: the harness is a public, unauthenticated endpoint on the
// vitrine's VPS and the fictitious-default clearing is superlinear (<=n rounds, each O(n^3)), so an unbounded L is a DoS vector.
// Mutants (each reddens ≥ 1 assertion below): (m1) remove the `if (n > CASCADE_MAX_NODES)` guard in
// cascade.ts ⇒ (a) stops throwing; (m2) drop `maxItems` from CASCADE_INPUT_SCHEMA in schema-projection.ts
// ⇒ (b) the maxItems assertions and (c) the behavioral boundary rejection go green→red; (m3) widen the cap
// (e.g. 4096) ⇒ the value assertions and the n==cap/n>cap split redden.
test("cascade_rejects_oversized_system_over_the_node_cap", async () => {
  assert.equal(CASCADE_MAX_NODES, 64, "the node cap is 64 (Lot H6)");
  const over = zeroSystem(CASCADE_MAX_NODES + 1); // 65 nodes: structurally valid, only the size is illegal
  const atCap = zeroSystem(CASCADE_MAX_NODES); // 64 nodes: legal

  // (a) GUARD — the pure tool itself refuses n > cap, BEFORE the O(n^3) clearing. Belt-and-suspenders
  // behind the schema: a direct in-process call (HTTP mirror / a test) is capped even past the SDK boundary.
  assert.throws(() => runCascade(over), CascadeToolError, "runCascade refuses n > cap as a tool error");
  assert.throws(() => cascadeLiquidable(over), CascadeToolError, "the cap fires before the clearing runs");
  // boundary / off-by-one — exactly the cap is accepted (kills a `>=`-for-`>` mutant and a wrong cap value).
  assert.doesNotThrow(() => runCascade(atCap), "n == cap is accepted (the cap is an upper bound, not exclusive of 64)");

  // (b) SCHEMA maxItems at the SDK boundary — the outer array (node count), EACH inner row, and e.
  const props = asObj(CASCADE_INPUT_SCHEMA["properties"], "cascade input.properties");
  const L = asObj(props["L"], "cascade input.properties.L");
  assert.equal(L["maxItems"], CASCADE_MAX_NODES, "L outer array is capped at the node count");
  assert.equal(asObj(L["items"], "L.items")["maxItems"], CASCADE_MAX_NODES, "each inner row of L is capped too");
  assert.equal(asObj(props["e"], "cascade input.properties.e")["maxItems"], CASCADE_MAX_NODES, "e is capped in lockstep with L");

  // (c) BEHAVIORAL — the SAME projected standard schema the MCP boundary AND the HTTP mirror validate with
  // rejects n > cap and accepts n == cap. This is the load-bearing killer for a mutant that removes
  // `maxItems` from the projection (the guard test in (a) would still pass then, but this reddens).
  const overValidated = await cascadeInputStandardSchema["~standard"].validate(over);
  assert.notEqual(overValidated.issues, undefined, "the boundary schema rejects n > cap");
  const atCapValidated = await cascadeInputStandardSchema["~standard"].validate(atCap);
  assert.equal(atCapValidated.issues, undefined, "the boundary schema accepts n == cap (positive control)");
});

/** Wraps the outer matrix so we can COUNT numeric-index reads of it — a deterministic, machine-independent
 *  proxy for the number of full passes over L. `clearingFromBelow` re-derives pbar and Pi from L on EVERY
 *  Picard step (packages/ukemi/src/clearing.ts:198-199), so #reads-of-L tracks #iterations 1:1. */
function countingMatrix(base: readonly (readonly number[])[]): { L: readonly (readonly number[])[]; reads: () => number } {
  let reads = 0;
  const L = new Proxy(base, {
    get(target, prop): unknown {
      if (typeof prop === "string" && String(Number(prop)) === prop) reads += 1;
      return Reflect.get(target, prop) as unknown;
    },
  });
  return { L, reads: () => reads };
}

// Test — cascade obtains L* from the BOUNDED `fictitiousDefault` (<= n rounds), NEVER paying for the
// 100000-iteration `clearingFromBelow` least-vector pass. This is the self-DoS fix:
// under the OLD path (`clearing(sys)`), a crafted request valid under every H6 cap makes the harness burn
// ~1e9 ops (~7 s measured) on the single-threaded event loop per ~10 KB request.
//
// The input is the shape the validateur described and is WIRE-FEASIBLE: a pure n=64 cycle (n ==
// CASCADE_MAX_NODES, the H6 cap; ~10 KB JSON, under the 256 KB Caddy body cap), each node owing 100 to the
// next only, tiny e. On this gain-1 cycle `clearingFromBelow` never converges within tol and runs its full
// maxIter=100000 Picard steps; cascade reads ONLY L*, which `fictitiousDefault` returns in <= n rounds
// (here rounds=0 — the full cycle is solvent, L*=pbar), so that pass is pure waste.
//
// ORACLE (deterministic, stronger than a wall-clock timeout): count numeric-index reads of the outer L.
// The new path does a FIXED 5 full passes over L (validate + cascade's pbarOf/piOf + fictitiousDefault's
// pbarOf/piOf) = 5*N = 320 reads (measured). The OLD path adds 2*N per clearingFromBelow iteration =>
// 2*64*100000 = 12,800,000 extra (12,800,320 total, measured). We CANNOT mock the internal call (node:test
// + a non-writable ESM namespace), and BOTH paths return the identical L* — so op-count, not the result
// value, is the discriminator. MUTANT: restore `const cleared = clearing(sys); ... cleared.pPlus` in
// cascade.ts => reads jumps to ~1.28e7 and this assertion reddens (the RED run also takes ~7 s per call —
// expected, not a hang).
test("cascade_uses_bounded_fictitious_default_not_clearing_from_below", () => {
  const N = CASCADE_MAX_NODES; // 64 = the H6 cap: the largest system the tool accepts.
  const L = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (j === (i + 1) % N ? 100 : 0)));
  const e = new Array<number>(N).fill(1e-6);

  const counted = countingMatrix(L);
  const t0 = performance.now();
  const liq0 = cascadeLiquidable({ L: counted.L, e, shock: 0, producedAt: "2026-09-04T00:00:00Z" });
  const elapsedMs = performance.now() - t0;
  const reads = counted.reads();

  // KILLER (deterministic): <= 40*N (=2560) sits far above the fixed new-path 5*N (=320, measured) and far
  // below the OLD path's 1.28e7 — so a mutant restoring the `clearing()` call reddens here on ANY machine.
  assert.ok(reads < 40 * N, `cascade must read L a bounded O(N) times, not O(iterations*N): got ${String(reads)} (mutant restoring clearing() => ~1.28e7)`);

  // CORRECTNESS on the pathological input: the full cycle is solvent (L*=pbar), so at shock 0 nothing tips.
  assert.equal(liq0.liquidableDebt, 0, "shock 0: the full-cycle system is solvent (L*=pbar) => nothing liquidable");
  assert.deepEqual(liq0.liquidableIds, [], "shock 0: the liquidable set is empty");
  // shock 0.5 halves every cleared value (~100 -> ~50 < 100 = debt): all N nodes tip => yhat = N*100.
  const p5 = runCascade({ L, e, shock: 0.5, producedAt: "2026-09-04T00:00:00Z" });
  assert.equal(p5.yhat, N * 100, "shock 0.5: all 64 nodes tip => yhat = 6400");

  // CORROBORATING only (NOT the oracle; generous bound so it cannot flake in CI): the bounded path returns
  // in ~2 ms measured; the OLD path took ~7 s. The deterministic read-count above is the real killer.
  assert.ok(elapsedMs < 2000, `bounded fictitious-default returns promptly: ${elapsedMs.toFixed(0)}ms (OLD path ~7000ms)`);
});
