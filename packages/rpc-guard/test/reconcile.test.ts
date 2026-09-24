import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { runReconcile, runCli, verifyCycleLedger, type Snapshot } from "@monark/rpc-guard";
import { ensureCycleDir, openOperatorLedger, type CycleLedger } from "../src/ledger.ts";
import { tmp } from "./harness.ts";

const seed = (l: CycleLedger, credits: number): void => { l.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, credits); };
const snap = (cycle: string, gtfa: number): Snapshot => ({ cycle, byMethod: { getTransactionsForAddress: gtfa } });

test("reconcile_asymmetric", () => {
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "c16"), "helius", 0);
    // course 1: 1000 cr attempted; reconcile 0 -> 1000 => GO (windowed run = 1000). Appends a `reconciled` boundary.
    seed(led, 1000);
    assert.equal(runReconcile(led, snap("c16", 0), snap("c16", 1000), "c16").verdict, "GO");
    // course 2 HONEST: +500 cr; window SINCE last reconciled = 500; Delta = 1500-1000 = 500 <= 500 => GO (C-V-7).
    seed(led, 500);
    assert.equal(runReconcile(led, snap("c16", 1000), snap("c16", 1500), "c16").verdict, "GO", "an honest 2nd course windows correctly (whole-cycle window would red)");
    // course 3 BYPASS: +500 cr in ledger but dashboard grew 1000 (500 off-ledger); Delta 1000 > window 500 => NO-GO hard.
    seed(led, 500);
    const r3 = runReconcile(led, snap("c16", 1500), snap("c16", 2500), "c16");
    assert.equal(r3.verdict, "NO-GO"); assert.match(String(r3.reason), /^hard:/);
    verifyCycleLedger(led.entries());
    // SYMMETRIC TRAP: Delta = window + 30 (within tol 50). Asymmetric hard bound catches it; a symmetric |Delta-run|
    // <= tol would pass (masking a 30-cr bypass). Mutant "reconcile symmetric" reds here.
    const led2 = openOperatorLedger(ensureCycleDir(dir, "c16b"), "helius", 0);
    seed(led2, 1000);
    const r4 = runReconcile(led2, snap("c16b", 0), snap("c16b", 1030), "c16b");
    assert.equal(r4.verdict, "NO-GO"); assert.match(String(r4.reason), /^hard:/);
  } finally { cleanup(); }
});

test("reconcile_aggregate_mode_is_declared", () => {
  // Chainstack's Statistics page has NO per-method breakdown (FAITS 2026-09-21 pt 10): only a total RU/day. The
  // DECLARED "aggregate" mode applies the HARD bound to the TOTAL and NAMES the mode in the result.
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "cs1"), "chainstack", 0);
    led.appendChained("attempted", { "chainstack|eth_call": 1 }, 100); // 100 conservative RU in the window
    // course 1 HONEST: dashboard total grew 0 -> 100 (== ledger) => GO, mode NAMED "aggregate" (mutant: mode absent).
    const r1 = runReconcile(led, { cycle: "cs1", total_ru: 0 }, { cycle: "cs1", total_ru: 100 }, "cs1", "aggregate");
    assert.equal(r1.verdict, "GO"); assert.equal(r1.mode, "aggregate");
    // course 2 BYPASS: +100 RU in ledger, dashboard grew 150 (50 off-ledger); Delta 150 > window 100 => NO-GO hard.
    led.appendChained("attempted", { "chainstack|eth_call": 1 }, 100);
    const r2 = runReconcile(led, { cycle: "cs1", total_ru: 100 }, { cycle: "cs1", total_ru: 250 }, "cs1", "aggregate");
    assert.equal(r2.verdict, "NO-GO"); assert.equal(r2.reason, "hard:total"); assert.equal(r2.mode, "aggregate");
    verifyCycleLedger(led.entries());
  } finally { cleanup(); }
});

test("aggregate_mode_refuses_a_per_method_snapshot", () => {
  // A per-method snapshot reaching a DECLARED-aggregate operator is FAIL-CLOSED (never silently coerced to a per-method bound).
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "cs2"), "chainstack", 0);
    led.appendChained("attempted", { "chainstack|eth_call": 1 }, 10);
    const r = runReconcile(led, { cycle: "cs2", byMethod: { eth_call: 5 } }, { cycle: "cs2", byMethod: { eth_call: 5 } }, "cs2", "aggregate");
    assert.equal(r.verdict, "NO-GO"); assert.equal(r.reason, "aggregate_mode_needs_total_ru"); assert.equal(r.mode, "aggregate");
    // EXACTLY ONE field per mode: a snapshot carrying BOTH total_ru and byMethod in aggregate mode is also FAIL-CLOSED
    // (the stray per-method field is never silently ignored), and a total_ru snapshot in per-method mode too.
    const r2 = runReconcile(led, { cycle: "cs2", total_ru: 0, byMethod: { eth_call: 5 } }, { cycle: "cs2", total_ru: 5, byMethod: { eth_call: 5 } }, "cs2", "aggregate");
    assert.equal(r2.verdict, "NO-GO"); assert.equal(r2.reason, "aggregate_mode_rejects_by_method");
    const r3 = runReconcile(led, { cycle: "cs2", byMethod: { eth_call: 0 }, total_ru: 0 }, { cycle: "cs2", byMethod: { eth_call: 5 }, total_ru: 5 }, "cs2", "per-method");
    assert.equal(r3.verdict, "NO-GO"); assert.equal(r3.reason, "per_method_mode_rejects_total_ru");
  } finally { cleanup(); }
});

test("reconcile_aggregate_calibration_enforces_hard_bound_and_consigns_soft", () => {
  // C-V-3: the 1st Chainstack course. `aggregate` BLOCKS on the 0.5% soft band; `aggregate-calibration` keeps the HARD
  // bound but CONSIGNS the soft over-count and exits 0 (a code path, not a human reading a `soft` reason).
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "cal"), "chainstack", 0);
    const seedRu = (n: number): void => { led.appendChained("attempted", { "chainstack|eth_call": 1 }, n); };
    // aggregate: guard counted 200 RU, dashboard billed 100 => soft over-count 100 > band => NO-GO soft.
    seedRu(200);
    const agg = runReconcile(led, { cycle: "cal", total_ru: 0 }, { cycle: "cal", total_ru: 100 }, "cal", "aggregate");
    assert.equal(agg.verdict, "NO-GO"); assert.equal(agg.reason, "soft");
    // aggregate-calibration: SAME over-count, hard bound still holds (100 <= 200), soft CONSIGNED => GO exit 0, softDeviation 100.
    seedRu(200);
    const cal = runReconcile(led, { cycle: "cal", total_ru: 100 }, { cycle: "cal", total_ru: 200 }, "cal", "aggregate-calibration");
    assert.equal(cal.verdict, "GO"); assert.equal(cal.exitCode, 0); assert.equal(cal.mode, "aggregate-calibration"); assert.equal(cal.softDeviation, 100);
    // the HARD bound STILL blocks in calibration (mutant "calibration ignores the hard bound" reds here).
    seedRu(50);
    const bad = runReconcile(led, { cycle: "cal", total_ru: 200 }, { cycle: "cal", total_ru: 300 }, "cal", "aggregate-calibration"); // Delta 100 > window 50
    assert.equal(bad.verdict, "NO-GO"); assert.equal(bad.reason, "hard:total"); assert.equal(bad.exitCode, 1);
    // a reset daily counter DURING the calibration course is a named NO-GO too, never a consigned soft deviation.
    seedRu(10);
    const neg = runReconcile(led, { cycle: "cal", total_ru: 300 }, { cycle: "cal", total_ru: 280 }, "cal", "aggregate-calibration"); // Delta = -20
    assert.equal(neg.verdict, "NO-GO"); assert.equal(neg.reason, "negative_delta");
    verifyCycleLedger(led.entries());
  } finally { cleanup(); }
});

test("aggregate_negative_delta_is_named", () => {
  // C-V-5: a dashboard total that went DOWN (a reset daily counter) is NOT a soft over-count - a named NO-GO.
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "neg"), "chainstack", 0);
    led.appendChained("attempted", { "chainstack|eth_call": 1 }, 100);
    const r = runReconcile(led, { cycle: "neg", total_ru: 500 }, { cycle: "neg", total_ru: 480 }, "neg", "aggregate");
    assert.equal(r.verdict, "NO-GO"); assert.equal(r.reason, "negative_delta");
  } finally { cleanup(); }
});

test("chainstack_reconcile_requires_an_aggregate_mode_flag", () => {
  // C-V-5: chainstack has no per-method dashboard (FAITS pt 10) => reconcile without an aggregate --mode is fail-closed
  // BEFORE any lock; with --mode aggregate it runs.
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "csr");
    openOperatorLedger(cd, "chainstack", 0).appendChained("attempted", { "chainstack|eth_call": 1 }, 10);
    const bf = join(dir, "b.json"), af = join(dir, "a.json");
    writeFileSync(bf, JSON.stringify({ cycle: "csr", total_ru: 0 })); writeFileSync(af, JSON.stringify({ cycle: "csr", total_ru: 10 }));
    const deps = { ledgerDir: dir, floor: 0, readSnapshot: (p: string): Snapshot => JSON.parse(readFileSync(p, "utf8")) as Snapshot };
    assert.throws(() => runCli(["reconcile", "--before", bf, "--after", af, "--cycle", "csr", "--op", "chainstack"], deps), /no per-method dashboard|--mode aggregate/);
    assert.ok(!existsSync(join(cd, "chainstack.lock")), "the fail-closed reconcile left no lock");
    const r = runCli(["reconcile", "--before", bf, "--after", af, "--cycle", "csr", "--op", "chainstack", "--mode", "aggregate"], deps);
    assert.equal(r.exitCode, 0); assert.equal(r.verdict, "GO");
  } finally { cleanup(); }
});

test("reconcile_rollover_no_go", () => {
  const { dir, cleanup } = tmp();
  try {
    const led = openOperatorLedger(ensureCycleDir(dir, "c17"), "helius", 0);
    seed(led, 100);
    const r = runReconcile(led, snap("c16", 0), snap("c17", 50), "c17");
    assert.equal(r.verdict, "NO-GO"); assert.equal(r.reason, "rollover"); assert.equal(r.exitCode, 1);
    // SERVED path via runCli (--op required: the ledger is per-operator).
    const bf = join(dir, "before.json"), af = join(dir, "after.json");
    writeFileSync(bf, JSON.stringify(snap("c16", 0))); writeFileSync(af, JSON.stringify(snap("c17", 50)));
    const cli = runCli(["reconcile", "--before", bf, "--after", af, "--cycle", "c17", "--op", "helius"],
      { ledgerDir: dir, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as Snapshot });
    assert.equal(cli.exitCode, 1); assert.equal(cli.verdict, "NO-GO");
  } finally { cleanup(); }
});
