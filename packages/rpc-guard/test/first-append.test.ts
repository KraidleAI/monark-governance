// RPC-GUARD-FIRST-APPEND-HEAD-1 (C-FA of docs/G0-lot-rpcguard-first.md, D-2): the FIRST append of a new ledger writes the genesis
// head (64 zeros) durably BEFORE its line, so a crash in that window is healed at the next open (the head is one entry behind),
// never refused; a genesis head without a ledger opens as a new ledger; every other tamper stays refused. Driven by the real
// openOperatorLedger, runCli and the served bin; the DURABLE_FS seam journals the writes or fails ONE of them. A tree without the
// construction reds each test by an assertion: an absent file reads as null and a refused open is returned, never thrown.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runCli, type CliDeps, type Snapshot } from "@monark/rpc-guard";
import { DURABLE_FS, LEDGER_GENESIS, ensureCycleDir, openOperatorLedger, type CycleLedger, type CycleLedgerEntry } from "../src/ledger.ts";
import { acquireLock } from "../src/lock.ts";
import { FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, childEnv, journal, tmp } from "./harness.ts";

const NL = String.fromCharCode(10);
/** The genesis head write (tmp, fsync, rename); APPEND = the nine operations of one append (durable.test.ts). */
const GENESIS = ["open:w:helius.head.tmp", "write:helius.head.tmp", "fsync:helius.head.tmp", "close:helius.head.tmp", "rename:helius.head.tmp>helius.head"];
const APPEND = ["open:a:helius.jsonl", "write:helius.jsonl", "fsync:helius.jsonl", "close:helius.jsonl", ...GENESIS];
const GT = { "helius|getTransaction": 1 };
const linesOf = (p: string): CycleLedgerEntry[] =>
  (existsSync(p) ? readFileSync(p, "utf8").split(NL).filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry) : []);
const headOf = (p: string): string | null => (existsSync(p) ? readFileSync(p, "utf8") : null);
/** Every file of a cycle dir with its content: a refusal must leave it EXACTLY as it was. */
const files = (cd: string): string[] => readdirSync(cd).sort().map((f) => `${f}:${readFileSync(join(cd, f), "utf8")}`);
/** Open the helius ledger of `cd`, or return the error it threw. */
const tryOpen = (cd: string, floor = 0): CycleLedger | Error => {
  try { return openOperatorLedger(cd, "helius", floor); } catch (e) { return e instanceof Error ? e : new Error(String(e)); }
};
const why = (x: CycleLedger | Error): string => (x instanceof Error ? x.message : "opened");
const eio = (): Error => Object.assign(new Error("EIO: injected"), { code: "EIO" });
const deps = (dir: string): CliDeps => ({ ledgerDir: dir, floor: 0, readSnapshot: (): Snapshot => ({ cycle: "", byMethod: {} }) });

// killer: packages/rpc-guard/src/ledger.ts:211 SDL "replaceDurable(headPath, LEDGER_GENESIS)" -> ""
test("rpc_guard_new_ledger_head_precedes_its_first_line", () => {
  const { dir, cleanup } = tmp();
  try {
    // (1) an open writes nothing; the first append writes the genesis head (tmp, fsync, rename) BEFORE its line and its head.
    const cd = ensureCycleDir(dir, "c-new"), led = openOperatorLedger(cd, "helius", 0);
    assert.deepEqual(readdirSync(cd), [], "an open without an append creates no file");
    const j = journal();
    let e1: CycleLedgerEntry;
    try { e1 = led.appendChained("attempted", GT, 1); } finally { j.restore(); }
    assert.deepEqual(j.ops, [...GENESIS, ...APPEND], "the genesis head first, then the line, then its head");
    assert.deepEqual([headOf(led.headPath), linesOf(led.path).length], [e1.entry_sha256, 1]);
    // (2) a genesis head without a ledger opens as a NEW ledger at its floor; its first append writes no second genesis.
    const cd2 = ensureCycleDir(dir, "c-genesis");
    writeFileSync(join(cd2, "helius.head"), LEDGER_GENESIS);
    const fresh = tryOpen(cd2, 7);
    assert.ok(!(fresh instanceof Error), `a genesis head alone is a new ledger: ${why(fresh)}`);
    assert.deepEqual([fresh.entries(), fresh.priorAtOpen()], [[], 7]);
    const j2 = journal();
    try { fresh.appendChained("attempted", GT, 1); } finally { j2.restore(); }
    assert.deepEqual(j2.ops, APPEND, "no second genesis: the head on disk already is the genesis");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/ledger.ts:194 ROR "!== LEDGER_GENESIS" -> "=== LEDGER_GENESIS"
test("rpc_guard_first_append_crash_is_healed_never_refused", () => {
  const { dir, cleanup } = tmp();
  const realWrite = DURABLE_FS.writeSync, realRename = DURABLE_FS.renameSync, realOpen = DURABLE_FS.openSync;
  try {
    // (1) the rename that follows the FIRST line fails (EIO: never retried). The line is durable and the head is the genesis, one
    //     entry behind: the next open heals it, and the served unlock chains from E1 and removes the lock.
    const cd = ensureCycleDir(dir, "c-crash");
    acquireLock(cd, "helius");
    const led = openOperatorLedger(cd, "helius", 0);
    let afterLine = false;
    const j = journal({ writeSync: (fd, d) => { realWrite(fd, d); if (typeof d === "string" && d.startsWith("{")) afterLine = true; },
      renameSync: (a, b) => { if (afterLine) throw eio(); realRename(a, b); } });
    try { assert.throws(() => led.appendChained("attempted", GT, 1), /EIO/); } finally { j.restore(); }
    const [e1] = linesOf(led.path);
    assert.deepEqual([headOf(led.headPath), e1?.outcome], [LEDGER_GENESIS, "attempted"], "the line is durable, the head is the genesis");
    const re = tryOpen(cd);
    assert.ok(!(re instanceof Error), `a first-append crash is healed, never refused: ${why(re)}`);
    assert.deepEqual([headOf(led.headPath), re.priorAtOpen()], [e1?.entry_sha256, 1], "the head healed to E1, which is counted");
    const r = runCli(["unlock", "--cycle", "c-crash", "--op", "helius", "--reason", "after a first-append crash"], deps(dir));
    const es = linesOf(led.path);
    assert.deepEqual([r.exitCode, r.unlocked, es.length, es[1]?.outcome, es[1]?.prev_entry_sha256], [0, es[1]?.entry_sha256, 2, "unlocked", e1?.entry_sha256]);
    assert.equal(existsSync(join(cd, "helius.lock")), false, "the served unlock removed the lock");
    // (2) the open of the ledger file fails right after the genesis head: the genesis head alone reopens as a new ledger.
    const cd2 = ensureCycleDir(dir, "c-open"), led2 = openOperatorLedger(cd2, "helius", 0);
    const j2 = journal({ openSync: (p, f) => { if (basename(p) === "helius.jsonl") throw eio(); return realOpen(p, f); } });
    try { assert.throws(() => led2.appendChained("attempted", GT, 1), /EIO/); } finally { j2.restore(); }
    assert.deepEqual([headOf(led2.headPath), existsSync(led2.path)], [LEDGER_GENESIS, false], "the genesis head alone");
    const re2 = tryOpen(cd2, 5);
    assert.ok(!(re2 instanceof Error), `a genesis head alone reopens: ${why(re2)}`);
    assert.deepEqual([re2.entries(), re2.priorAtOpen()], [[], 5]);
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/ledger.ts:188 CONST "entries.length >= 1" -> "entries.length >= 2"
test("rpc_guard_first_append_kill_is_unlocked_by_the_served_bin", (t) => {
  // P-12b replayed end to end (non-LLM): a REAL writer process opens openGuardedClient, makes its first call and is KILLED by its
  // own DURABLE_FS seam at the rename that follows its first line; the served bin `unlock` (the RUNBOOK-dojo section 9 form)
  // then heals the head, appends its `unlocked` line and removes the dead writer's lock.
  const bin = fileURLToPath(new URL("../bin/rpc-guard.mjs", import.meta.url));
  if (!existsSync(bin)) { t.skip("bin/ is not in the public export (PACKAGE_SUBPATHS); the served bin runs in the repo"); return; }
  const { dir, cleanup } = tmp();
  try {
    const index = new URL("../src/index.ts", import.meta.url).href, ledger = new URL("../src/ledger.ts", import.meta.url).href;
    const code = [
      `const { openGuardedClient } = await import(${JSON.stringify(index)});`,
      `const { DURABLE_FS } = await import(${JSON.stringify(ledger)});`,
      `globalThis.fetch = () => Promise.resolve(new Response('{"result":1}', { status: 200 }));`,
      `const open = DURABLE_FS.openSync, rename = DURABLE_FS.renameSync; let line = false;`,
      `DURABLE_FS.openSync = (p, f) => { if (p.endsWith("helius.jsonl")) line = true; return open(p, f); };`,
      `DURABLE_FS.renameSync = (a, b) => { if (line) process.kill(process.pid, "SIGKILL"); rename(a, b); };`,
      `const c = openGuardedClient(${JSON.stringify(FAKE_HELIUS_ENV)}, ${JSON.stringify(ONE_METHOD_LIMITS)}, ${JSON.stringify(dir)}, { helius: "c-kill" });`,
      `await c.call("helius", "getTransaction", [0]);`,
      `process.stdout.write("survived");`,
    ].join(NL);
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", code], { env: childEnv(), encoding: "utf8" });
    const cd = join(dir, "c-kill"), jsonl = join(cd, "helius.jsonl");
    const state = [child.status === 0, child.stdout, linesOf(jsonl).length, existsSync(join(cd, "helius.lock"))];
    assert.deepEqual(state, [false, "", 1, true], `the writer died after its first line, holding its lock: ${child.stderr}`);
    const args = ["--ledger-dir", dir, "--floor", "0", "unlock", "--cycle", "c-kill", "--op", "helius", "--reason", "after a kill"];
    const r = spawnSync(process.execPath, [bin, ...args], { env: childEnv(), encoding: "utf8" });
    const es = linesOf(jsonl), last = es.at(-1)?.entry_sha256 ?? "";
    assert.deepEqual([r.status, r.stdout, es.map((e) => e.outcome)], [0, `unlocked ${last}${NL}`, ["attempted", "unlocked"]], r.stderr);
    assert.deepEqual([headOf(join(cd, "helius.head")), existsSync(join(cd, "helius.lock"))], [last, false], "healed, unlocked");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/ledger.ts:194 CONST "hasHead && readFileSync" -> "false && readFileSync"
test("rpc_guard_head_tamper_stays_refused_after_the_genesis_head", () => {
  const { dir, cleanup } = tmp();
  try {
    const seeded = (cycle: string, n: number): CycleLedger => {
      const l = openOperatorLedger(ensureCycleDir(dir, cycle), "helius", 0);
      for (let i = 0; i < n; i++) l.appendChained("attempted", GT, 1);
      return l;
    };
    // control: the ONE head accepted without a ledger is the genesis (a new ledger).
    const g = ensureCycleDir(dir, "t-genesis");
    writeFileSync(join(g, "helius.head"), LEDGER_GENESIS);
    assert.ok(!(tryOpen(g) instanceof Error), "a genesis head alone opens as a new ledger");
    // (1) a ledger whose head was deleted; (2) a head that is not the genesis, its ledger deleted; (3) a genesis head beside a
    //     ledger of TWO lines (two entries apart: a truncation signature, never healed). No refusal writes a byte.
    const a = seeded("t-absent", 1), b = seeded("t-deleted", 1), c = seeded("t-trunc", 2);
    rmSync(a.headPath); rmSync(b.path); writeFileSync(c.headPath, LEDGER_GENESIS);
    for (const [l, refusal] of [[a, /head sidecar absent/], [b, /head sidecar present but ledger/], [c, /tail truncation/]] as const) {
      const before = files(l.cycleDir), r = tryOpen(l.cycleDir);
      assert.ok(r instanceof Error && refusal.test(r.message), `${basename(l.cycleDir)}: ${why(r)}`);
      assert.deepEqual(files(l.cycleDir), before, `${basename(l.cycleDir)}: a refusal writes no byte`);
    }
  } finally { cleanup(); }
});
