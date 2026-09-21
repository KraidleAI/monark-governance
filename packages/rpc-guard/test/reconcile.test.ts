import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openCycleLedger, runReconcile, runCli, verifyCycleLedger, type Snapshot, type CycleLedger } from "../src/index.ts";

function seedLedger(cycle: string, gtfaCredits: number): { dir: string; ledger: CycleLedger; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  const ledger = openCycleLedger(dir, cycle, 0);
  ledger.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, gtfaCredits); // ledger_run(gTfA)
  return { dir, ledger, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
const snap = (cycle: string, gtfa: number): Snapshot => ({ cycle, byMethod: { getTransactionsForAddress: gtfa } });

test("reconcile_asymmetric", () => {
  // ledger_run(gTfA) = 1000 credits; soft band = max(50, 0.5% * 1000 = 5) = 50.
  // (a) GO: deltadashboard = 980 <= 1000 (hard ok) AND 1000 - 980 = 20 <= 50 (soft ok).
  {
    const { ledger, cleanup } = seedLedger("cycle-16a", 1000);
    try {
      const r = runReconcile(ledger, snap("cycle-16a", 0), snap("cycle-16a", 980), "cycle-16a");
      assert.equal(r.verdict, "GO"); assert.equal(r.exitCode, 0);
      assert.equal(ledger.entries().at(-1)!.outcome, "reconciled");
      verifyCycleLedger(ledger.entries());
    } finally { cleanup(); }
  }
  // (b) HARD NO-GO: deltadashboard = 1030 is 30 ABOVE the ledger's 1000. A SYMMETRIC |1030-1000| = 30 <= tol(50) would
  //     pass (masking a 30-credit bypass); the ASYMMETRIC hard bound catches it. Mutant "reconcile symmetric" reds.
  {
    const { ledger, cleanup } = seedLedger("cycle-16b", 1000);
    try {
      const r = runReconcile(ledger, snap("cycle-16b", 0), snap("cycle-16b", 1030), "cycle-16b");
      assert.equal(r.verdict, "NO-GO"); assert.equal(r.exitCode, 1);
      assert.match(String(r.reason), /^hard:/);
    } finally { cleanup(); }
  }
});

test("reconcile_rollover_no_go", () => {
  const { dir, ledger, cleanup } = seedLedger("cycle-17", 100);
  try {
    // before/after read under DIFFERENT cycles than --cycle => two cycles' absolutes don't subtract => NO-GO.
    const r = runReconcile(ledger, snap("cycle-16", 0), snap("cycle-17", 50), "cycle-17");
    assert.equal(r.verdict, "NO-GO"); assert.equal(r.reason, "rollover"); assert.equal(r.exitCode, 1);
    // SERVED path (branchement): the same verdict via CLI dispatch (argv -> ledger line -> exit code).
    const beforeF = join(dir, "before.json"), afterF = join(dir, "after.json");
    writeFileSync(beforeF, JSON.stringify(snap("cycle-16", 0)));
    writeFileSync(afterF, JSON.stringify(snap("cycle-17", 50)));
    const cli = runCli(["reconcile", "--before", beforeF, "--after", afterF, "--cycle", "cycle-17"],
      { ledgerDir: dir, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as Snapshot });
    assert.equal(cli.exitCode, 1); assert.equal(cli.verdict, "NO-GO");
    verifyCycleLedger(openCycleLedger(dir, "cycle-17", 0).entries());
  } finally { cleanup(); }
});
