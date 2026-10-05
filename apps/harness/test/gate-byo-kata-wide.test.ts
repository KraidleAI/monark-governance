/**
 * Harness - wide reserved kata pattern (block D, lot D-1; ADR-CM section 5 B-14; delegated decision CM-4b C-2; plan
 * docs/G0-bloc-d.md section 4.1). B-1 reserves every name of the wide pattern
 * ^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$ against BYO (400 `byo_reserved_kata`), and B-10 compares a
 * reduced BYO name to the exact image of that pattern by `confusableReduce` (400 `byo_lookalike_confusable`). Each test
 * names its killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prediction } from "@monark/contracts";
import { confusableReduce, runGate, HarnessToolError, SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import * as gate from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true,
  calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], mode: "interval" },
};

function pred(taskClass: string, predictorId: string): Prediction {
  return { schema_version: SCHEMA_VERSION, task_class: taskClass, yhat: 0, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}

/** The code of the refusal, or "decided". */
function outcome(taskClass: string, predictorId = "caller:model"): unknown {
  try {
    runGate(pred(taskClass, predictorId), PARAMS);
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `${taskClass} / ${predictorId}: a HarnessToolError, got ${String(e)}`);
    return (e as { code?: unknown }).code;
  }
  return "decided";
}

const FAMILIES = ["dir", "range", "mae-down", "mae-up"] as const;
const HORIZONS = ["15m", "1h", "4h", "24h"] as const;

/** A seeded generator (mulberry32), so the property draws are the same on every platform and every run. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Test T-1 (F2P): the wide pattern is reserved against BYO (B-1 code), in any ASCII case; a one-letter symbol and names
// that only contain a kata fragment keep deciding.
// killer: apps/harness/src/tools/gate.ts:775 CONST "(15m|1h|4h|24h)" -> "(1h|4h)"
test("byo_wide_kata_names_reserved", () => {
  for (const c of ["my-range-1h", "ab-dir-4h", "doge-dir-1h", "so1-dir-1h", "btc-range-24h", "eth-mae-up-15m", "rn-dir-1h", "MY-RANGE-1H", "abcdefghij-mae-down-4h"]) {
    assert.equal(outcome(c), "byo_reserved_kata", `${c}: a wide kata name is reserved`);
  }
  for (const c of ["a-dir-1h", "my-btc-dir-1h-clone", "btc-dir-1h-v2", "eth-dir-1d", "btc-dir-2h", "sol-dir-1hr", "abcdefghijk-dir-1h"]) {
    assert.equal(outcome(c), "decided", `${c}: not a wide kata name`);
  }
});

// Test T-2 (F2P): the reduced pattern is the exact image of the wide pattern by confusableReduce (C-2 condition 1).
// Safety: every wide name, reduced, matches it. Exactness: every reduced string that matches it has a wide antecedent.
// killer: apps/harness/src/tools/gate.ts:799 CONST "(?:m|" -> "(?:"
test("byo_reduced_kata_pattern_is_the_exact_image", () => {
  const exported: Record<string, unknown> = { ...gate };
  assert.ok(exported["KATA_CLASS_RE"] instanceof RegExp && exported["KATA_CLASS_REDUCED_RE"] instanceof RegExp, "gate.ts exports the wide and the reduced patterns");
  const { KATA_CLASS_RE, KATA_CLASS_REDUCED_RE } = gate;
  const next = rng(37);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)] as T;
  // Symbols rich in the folded characters (r, n, i, l, 1, 0, o, m), plus the edge symbols.
  const SYM = "abcdefghijklmnopqrstuvwxyz0123456789rnrnrnil10om";
  const edges = ["rn", "rnrn", "rnrnrnrnrn", "rrn", "rnn", "irn", "ir", "i1", "10", "0o", "mm", "aaaaaaaaaa", "rnaaaaaaaa"];
  const syms = [...edges];
  for (let k = 0; k < 4000; k++) {
    const len = 2 + Math.floor(next() * 9);
    let s = "";
    for (let j = 0; j < len; j++) s += pick([...SYM]);
    syms.push(s);
  }
  for (const s of syms) {
    for (const f of FAMILIES) {
      for (const h of HORIZONS) {
        const name = `${s}-${f}-${h}`;
        assert.ok(KATA_CLASS_RE.test(name), `${name}: a wide name`);
        assert.ok(KATA_CLASS_REDUCED_RE.test(confusableReduce(name)), `${name} -> ${confusableReduce(name)}: its reduction is in the reduced pattern`);
      }
    }
  }
  // Exactness, on reductions of near-kata strings (confusable families and horizons, symbols of 1 to 12 characters).
  const famVariants = ["dir", "dlr", "d1r", "dIr", "range", "rang3", "mae-down", "mae_down", "mae.up", "mae-up", "rnae-up"];
  const hVariants = ["15m", "l5m", "I5m", "1h", "lh", "Ih", "4h", "24h", "2h", "1d"];
  const ANTE: Readonly<Record<string, string>> = { l5m: "15m", lh: "1h", "4h": "4h", "24h": "24h" };
  let matched = 0;
  for (let k = 0; k < 20000; k++) {
    const len = 1 + Math.floor(next() * 12);
    let s = "";
    for (let j = 0; j < len; j++) s += pick([...SYM, "_", ".", "I"]);
    const r = confusableReduce(`${s}${pick(["-", "_", "."])}${pick(famVariants)}${pick(["-", "_"])}${pick(hVariants)}`);
    const m = KATA_CLASS_REDUCED_RE.exec(r);
    if (m === null) continue;
    matched++;
    const [fam, h] = [m[1] as string, m[2] as string];
    const sym = r.slice(0, r.length - fam.length - h.length - 2);
    const ante = `${sym === "m" ? "rn" : sym}-${fam === "dlr" ? "dir" : fam}-${ANTE[h] ?? ""}`;
    assert.ok(KATA_CLASS_RE.test(ante), `${r}: antecedent ${ante} is a wide name`);
    assert.equal(confusableReduce(ante), r, `${r}: its antecedent ${ante} reduces to it`);
  }
  assert.ok(matched > 1000, `the exactness draw reaches the pattern (${String(matched)} matches)`);
  for (const r of ["a-dlr-lh", "x-range-4h", "abcdefghijk-dlr-lh", "ab-dlr-ih", "ab-dir-lh"]) {
    assert.ok(!KATA_CLASS_REDUCED_RE.test(r), `${r}: no wide antecedent, not in the reduced pattern`);
  }
});

// Test T-3 (F2P): BYO names whose reduction falls in the reduced wide pattern are refused with the B-10 code; the i/l
// false refusal of precision (4) of B-10 now covers every <symbol>-dlr-<h> (declared, BYO-LOOKALIKE-RESIDUAL-1 (a)).
// killer: apps/harness/src/tools/gate.ts:811 CONST "KATA_CLASS_REDUCED_RE.test(cls)" -> "false"
test("byo_confusable_wide_kata_names_refused", () => {
  for (const c of ["my_range_1h", "ab.dir.4h", "doge_dir_1h", "xyz-mae-up-l5m", "abc-dlr-1h", "usd-dlr-24h"]) {
    assert.equal(outcome(c), "byo_lookalike_confusable", `${c}: reduces into the reserved wide pattern`);
  }
  for (const c of ["a_dir_1h", "my_range_2h", "abcdefghijk_dir_1h"]) assert.equal(outcome(c), "decided", `${c}: decides`);
});

// Test T-4 (F2P): the HTTP 400 body of `byo_reserved_kata` names the wide pattern, byte for byte.
// killer: apps/harness/src/tools/gate.ts:775 CONST "[a-z0-9]{2,10}" -> "(btc|eth|bnb|sol)"
test("byo_reserved_kata_body_names_the_wide_pattern", async () => {
  const message =
    "task_class 'my-range-1h' / predictor_id 'caller:model' takes a name reserved for MONARK kata classes (pattern " +
    "^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$, key prefix 'kata:'): use a caller-owned name for BYO (ADR-CM B-1)";
  const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction: pred("my-range-1h", "caller:model"), params: PARAMS }) }));
  assert.equal(res.status, 400, "HTTP 400");
  assert.equal(await res.text(), JSON.stringify({ error: "tool_error", operation: "gate", message, code: "byo_reserved_kata" }), "exact body");
});

// G2 N-2 of D-1: a one-letter symbol is refused by B-10 when it is "m", the reduction of "rn" (m-dir-1h imitates rn-dir-1h, a
// wide name), while any other one-letter symbol decides. Green at the base of D-3 (declared; killer fired by hand).
// killer: apps/harness/src/tools/gate.ts:799 CONST "(?:m|" -> "(?:"
test("byo_one_letter_m_is_a_lookalike_of_rn", () => {
  for (const c of ["m-dir-1h", "m_dir_1h", "M-DIR-1H", "m-range-4h"]) assert.equal(outcome(c), "byo_lookalike_confusable", `${c}: imitates rn-<family>-<h>`);
  for (const c of ["a-dir-1h", "n-dir-1h", "r-range-4h"]) assert.equal(outcome(c), "decided", `${c}: decides`);
});
