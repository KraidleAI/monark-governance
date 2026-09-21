import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
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
