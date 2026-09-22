import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { ensureCycleDir, openOperatorLedger, verifyCycleLedger } from "../src/ledger.ts";
import { tmp } from "./harness.ts";

// GARDE-HELIUS-1b-0 (item i / E-1, CP2 2b-ii C-G-5): a crash between appendChained's append and its head-sidecar
// rewrite leaves the head EXACTLY ONE entry behind the durable ledger. openOperatorLedger now RECOVERS that state
// (heals the head, continues) - DISTINCT from a tail truncation (head AHEAD), which stays fail-closed. This is the
// package-level proof; the end-to-end `runCli unlock` recovery is the INVERTED apps/sentinel characterisation test
// (ukemi_record_crash_between_append_and_head_is_recovered_by_unlock). Two mutants: "recovery removed" (throw on
// head-behind) reds part (1); "recovery too permissive" (heal ANY mismatch) reds part (2) here AND ledger.test.ts
// C-V-8(c) tail-truncation.
test("ledger_recovers_crash_in_append_window_but_refuses_tail_truncation", () => {
  const { dir, cleanup } = tmp();
  try {
    // (1) CRASH-IN-WINDOW: append E1, E2, then rewind the head sidecar to E1 (crash after E2's append, before its head
    //     rewrite). Reopen => RECOVER: no throw, head healed to sha(E2), the chain re-derives, prior counts BOTH lines.
    const cd = ensureCycleDir(dir, "crash");
    const led = openOperatorLedger(cd, "helius", 0);
    led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);              // E1
    const headAfterE1 = readFileSync(led.headPath, "utf8");
    const e2 = led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);   // E2 (head := sha(E2))
    writeFileSync(led.headPath, headAfterE1);                                        // crash: head one entry behind
    const recovered = openOperatorLedger(cd, "helius", 0);
    assert.doesNotThrow(() => openOperatorLedger(cd, "helius", 0), "a crash-in-window (head one behind) is RECOVERED, not fail-closed (mutant 'recovery removed' reds)");
    assert.equal(readFileSync(led.headPath, "utf8").trim(), e2.entry_sha256, "the head sidecar is HEALED to the true head sha(E2)");
    assert.equal(recovered.priorAtOpen(), 2, "no entry lost: the prior counts E1 + E2 (2 credits)");
    assert.doesNotThrow(() => verifyCycleLedger(recovered.entries()), "the recovered chain re-derives end to end");
    // (2) TAIL TRUNCATION stays fail-closed: append E1, E2, then chop the ledger back to E1 while the head still points
    //     at E2 (head AHEAD). Reopen => throw (the stale head is not the penultimate of the truncated chain).
    const cd2 = ensureCycleDir(dir, "trunc");
    const t = openOperatorLedger(cd2, "helius", 0);
    t.appendChained("attempted", { "helius|getTransaction": 1 }, 1);                 // E1
    const firstLine = readFileSync(t.path, "utf8").split(/\r?\n/).filter(Boolean)[0]!;
    t.appendChained("attempted", { "helius|getTransaction": 1 }, 1);                 // E2 (head := sha(E2))
    writeFileSync(t.path, firstLine + "\n");                                          // chop to E1, head stale AHEAD at E2
    assert.throws(() => openOperatorLedger(cd2, "helius", 0), /tail truncation/, "a tail truncation (head AHEAD) still fail-closes (mutant 'recovery too permissive' reds this)");
  } finally { cleanup(); }
});
