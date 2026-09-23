// GARDE-FSYNC-1 - `repair-tail` (checkpoint-1 C-1/C-2/C-3/C-5/C-6/C-8/C-9). The ledger under repair is PRODUCED by the
// real openGuardedClient + call (only globalThis.fetch stubbed); the power cut is reproduced by its byte signature (a NUL
// tail after complete lines, INCIDENT 2026-09-22) and a lock left by a DEAD pid. Every refusal must change NO byte.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, readFileSync, readdirSync, rmSync, truncateSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openGuardedClient, runCli, verifyCycleLedger, type Snapshot } from "@monark/rpc-guard";
import { LockHeldError } from "../src/lock.ts";
import { openOperatorLedger, type CycleLedgerEntry } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, ONE_METHOD_LIMITS, childEnv, journal, okFetch, tmp } from "./harness.ts";

const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const noSnap = (): Snapshot => ({ cycle: "", byMethod: {} });
const cli = (dir: string, sub: string, cycle: string, extra: string[] = []): ReturnType<typeof runCli> =>
  runCli([sub, "--cycle", cycle, "--op", "helius", ...extra], { ledgerDir: dir, floor: 0, readSnapshot: noSnap });
const repair = (dir: string, cycle: string): ReturnType<typeof runCli> => cli(dir, "repair-tail", cycle, ["--reason", "power cut 2026-09-22"]);
/** Every file of the cycle dir with its sha: a refusal must leave this EXACTLY as it was. */
const snapshot = (cd: string): string[] => readdirSync(cd).sort().map((f) => `${f}:${sha(readFileSync(join(cd, f)))}`);
const entriesOf = (p: string): CycleLedgerEntry[] => readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
// A pid that WAS a process and is not any more (the INCIDENT lock: pid 77188 killed by the cut).
const DEAD_PID = spawnSync(process.execPath, ["-e", ""], { env: childEnv() }).pid;

/** openGuardedClient + n real calls; `lock`: "dead" = the writer died holding it, "live" = this process holds it. */
async function produce(dir: string, cycle: string, n: number, lock: "dead" | "live" | "none"): Promise<string> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const c = openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: cycle });
    for (let i = 0; i < n; i++) await c.call(HELIUS, "getTransaction", [i]);
  } finally { globalThis.fetch = realFetch; }
  const cd = join(dir, cycle);
  if (lock === "dead") writeFileSync(join(cd, "helius.lock"), JSON.stringify({ pid: DEAD_PID, iso: "2026-09-22T20:03:18.000Z" }));
  if (lock === "none") unlinkSync(join(cd, "helius.lock"));
  return cd;
}

test("repair_tail_composition_power_cut_signature_to_unlock_and_reopen", async () => {
  assert.throws(() => process.kill(DEAD_PID, 0), /ESRCH/, "precondition: the producer pid is dead");
  const { dir, cleanup } = tmp();
  try {
    // (1) The WRITER is a real child process: openGuardedClient + 3 calls, then it dies WITHOUT unlock (a hard kill).
    const index = new URL("../src/index.ts", import.meta.url).href;
    const code = `const { openGuardedClient } = await import(${JSON.stringify(index)});
globalThis.fetch = () => Promise.resolve(new Response('{"result":1}', { status: 200, headers: { "content-type": "application/json" } }));
const c = openGuardedClient(${JSON.stringify(FAKE_HELIUS_ENV)}, ${JSON.stringify(ONE_METHOD_LIMITS)}, ${JSON.stringify(dir)}, { helius: "cut" });
for (let i = 0; i < 3; i++) await c.call("helius", "getTransaction", [i]);`;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", code], { env: childEnv(), encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr);
    const cd = join(dir, "cut"), jsonl = join(cd, "helius.jsonl"), head = join(cd, "helius.head");
    const lock = JSON.parse(readFileSync(join(cd, "helius.lock"), "utf8")) as { pid: number };
    assert.equal(lock.pid, child.pid, "the lock was written by the dead writer (its fsynced {pid, iso})");
    const durable = readFileSync(jsonl), headBytes = readFileSync(head);
    // (2) The cut: the file size reached the disk, the data did not -> NUL bytes after the last complete line.
    appendFileSync(jsonl, Buffer.alloc(4096));
    const damaged = readFileSync(jsonl);
    // (3) C-6/C-8: the served unlock (cli.ts, opens WITHOUT the lock) and the open itself throw "malformed", never
    //     "tail truncation"; the guarded client cannot even reach the ledger, the dead writer's lock is still held.
    assert.throws(() => cli(dir, "unlock", "cut", ["--reason", "x"]), /malformed/);
    assert.throws(() => openOperatorLedger(cd, "helius", 0), /malformed/);
    assert.throws(() => openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "cut" }), LockHeldError);
    // (4) repair-tail: NUL stripped, head untouched (head_action none: no rename onto helius.head), evidence kept.
    const j = journal();
    let r: ReturnType<typeof runCli>;
    try { r = repair(dir, "cut"); } finally { j.restore(); }
    assert.deepEqual(r, { exitCode: 0, verdict: "REPAIRED", reason: "nul_bytes_removed=4096 head_action=none" });
    assert.ok(!j.ops.some((o) => o.includes("helius.head.tmp")), "a consistent head is never rewritten (no tmp, no rename)");
    assert.equal(sha(readFileSync(jsonl)), sha(durable), "only the NUL bytes were removed: the durable prefix is byte-identical");
    assert.equal(sha(readFileSync(head)), sha(headBytes));
    assert.equal(sha(readFileSync(join(cd, "helius.jsonl.bak"))), sha(damaged), ".bak = the damaged bytes, NUL included");
    assert.equal(existsSync(join(cd, "helius.lock")), true, "the dead writer's lock is left for the ledgered unlock");
    // D-2: the record, CLOSED key list, every value recomputed.
    const recs = readFileSync(join(cd, "helius.repair.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>);
    assert.equal(recs.length, 1);
    const rec = recs[0]!;
    assert.deepEqual(Object.keys(rec), ["iso", "pid", "cycle", "op", "reason", "sha_before", "sha_after", "nul_bytes_removed", "lines_after", "head_after", "bak_path", "bak_sha256", "head_action"]);
    const last = entriesOf(jsonl).at(-1)!;
    assert.deepEqual({ ...rec, iso: typeof rec.iso }, {
      iso: "string", pid: process.pid, cycle: "cut", op: "helius", reason: "power cut 2026-09-22",
      sha_before: { jsonl: sha(damaged), head: sha(headBytes) }, sha_after: { jsonl: sha(durable), head: sha(headBytes) },
      nul_bytes_removed: 4096, lines_after: 3, head_after: last.entry_sha256,
      bak_path: { jsonl: "helius.jsonl.bak", head: "helius.head.bak" }, bak_sha256: { jsonl: sha(damaged), head: sha(headBytes) }, head_action: "none",
    });
    // (5) the ledgered unlock now succeeds, then the guarded client reopens and meters on.
    assert.deepEqual(cli(dir, "unlock", "cut", ["--reason", "after repair-tail"]), { exitCode: 0 });
    assert.equal(existsSync(join(cd, "helius.lock")), false);
    const realFetch = globalThis.fetch;
    globalThis.fetch = okFetch;
    try { await openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "cut" }).call(HELIUS, "getTransaction", [9]); } finally { globalThis.fetch = realFetch; }
    const after = entriesOf(jsonl);
    verifyCycleLedger(after);
    assert.deepEqual(after.map((e) => e.outcome), ["attempted", "attempted", "attempted", "unlocked", "attempted"]);
    assert.equal(readFileSync(head, "utf8"), after.at(-1)!.entry_sha256);
  } finally { cleanup(); }
});

test("repair_tail_heals_a_head_one_behind_after_the_strip", async () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "hb", 3, "dead");
    const es = entriesOf(join(cd, "helius.jsonl"));
    writeFileSync(join(cd, "helius.head"), es[1]!.entry_sha256); // the head rename of E3 was lost (penultimate)
    appendFileSync(join(cd, "helius.jsonl"), Buffer.alloc(300));
    const j = journal();
    let r: ReturnType<typeof runCli>;
    try { r = repair(dir, "hb"); } finally { j.restore(); }
    assert.deepEqual(r, { exitCode: 0, verdict: "REPAIRED", reason: "nul_bytes_removed=300 head_action=heal_penultimate" });
    const w = (f: string, flags: string): string[] => [`open:${flags}:${f}`, `write:${f}`, `fsync:${f}`, `close:${f}`];
    assert.deepEqual(j.ops, [...w("helius.jsonl.bak", "wx"), ...w("helius.head.bak", "wx"), // evidence durable FIRST
      "open:r+:helius.jsonl", "ftruncate:helius.jsonl", "fsync:helius.jsonl", "close:helius.jsonl", // then only the NUL bytes go
      ...w("helius.head.tmp", "w"), "rename:helius.head.tmp>helius.head", // the existing heal, durable (C-4)
      ...w("helius.repair.jsonl", "a")], "the record is appended once the repair is done");
    assert.equal(readFileSync(join(cd, "helius.head"), "utf8"), es[2]!.entry_sha256);
  } finally { cleanup(); }
});

test("repair_tail_refuses_a_head_ahead_or_nul_filled_and_changes_no_byte", async () => {
  // C-1: after GARDE-FSYNC-1 a cut cannot leave a head AHEAD; it is a truncation signature - REFUSED, never rewritten.
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "ahead", 3, "dead");
    const jsonl = join(cd, "helius.jsonl");
    const lines = readFileSync(jsonl, "utf8").split("\n");
    truncateSync(jsonl, Buffer.byteLength(`${lines[0]!}\n${lines[1]!}\n`)); // E3 gone, the head still names it (ahead)
    appendFileSync(jsonl, Buffer.alloc(512));
    let before = snapshot(cd);
    assert.deepEqual(repair(dir, "ahead"), { exitCode: 1, verdict: "REFUSED", reason: "tail_truncation" });
    assert.deepEqual(snapshot(cd), before, "a refusal writes nothing (no .bak, no record, no strip)");
    // The pre-lot SECOND cut (2026-09-22 ~21:37 UTC): an in-place head write left 64 NUL bytes. Also REFUSED (RUNBOOK).
    writeFileSync(join(cd, "helius.head"), Buffer.alloc(64));
    before = snapshot(cd);
    assert.deepEqual(repair(dir, "ahead"), { exitCode: 1, verdict: "REFUSED", reason: "tail_truncation" });
    assert.deepEqual(snapshot(cd), before);
  } finally { cleanup(); }
});

test("repair_tail_refuses_torn_or_clean_or_inner_nul_tails", async () => {
  // C-2: only a NUL run starting right after a complete line is removed; anything else is manual (RUNBOOK).
  const { dir, cleanup } = tmp();
  try {
    const cases: Array<[string, (p: string) => void, string]> = [
      ["torn", (p) => { appendFileSync(p, '{"prev_entry_sha256":"ab'); appendFileSync(p, Buffer.alloc(64)); }, "torn_tail"],
      ["clean", () => undefined, "no_nul_tail"],
      ["inner", (p) => { const t = readFileSync(p); writeFileSync(p, Buffer.concat([t.subarray(0, 10), Buffer.alloc(3), t.subarray(10), Buffer.alloc(64)])); }, "malformed_line"],
    ];
    for (const [cycle, damage, token] of cases) {
      const cd = await produce(dir, cycle, 2, "dead");
      damage(join(cd, "helius.jsonl"));
      const before = snapshot(cd);
      assert.deepEqual(repair(dir, cycle), { exitCode: 1, verdict: "REFUSED", reason: token }, cycle);
      assert.deepEqual(snapshot(cd), before, `${cycle}: a refusal writes nothing`);
    }
  } finally { cleanup(); }
});

test("repair_tail_refuses_a_live_writer_or_an_unreadable_lock", async () => {
  // C-2: repair-tail runs under a HELD lock without acquiring it - a live writer could still append: never race it.
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "live", 2, "live"); // this very process holds the lock: alive
    appendFileSync(join(cd, "helius.jsonl"), Buffer.alloc(64));
    const before = snapshot(cd);
    assert.deepEqual(repair(dir, "live"), { exitCode: 1, verdict: "REFUSED", reason: "writer_alive" });
    // A pid that exists but is not ours answers EPERM (measured win32: pid 4): it EXISTS, so it is alive too.
    writeFileSync(join(cd, "helius.lock"), JSON.stringify({ pid: process.platform === "win32" ? 4 : 1 }));
    assert.deepEqual(repair(dir, "live"), { exitCode: 1, verdict: "REFUSED", reason: "writer_alive" });
    writeFileSync(join(cd, "helius.lock"), Buffer.alloc(40)); // a lock whose {pid} never reached the disk
    assert.deepEqual(repair(dir, "live"), { exitCode: 1, verdict: "REFUSED", reason: "lock_unreadable" });
    assert.deepEqual(snapshot(cd).filter((f) => !f.startsWith("helius.lock:")), before.filter((f) => !f.startsWith("helius.lock:")));
  } finally { cleanup(); }
});

test("repair_tail_never_overwrites_evidence_and_refuses_head_absent", async () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "ev", 2, "dead");
    appendFileSync(join(cd, "helius.jsonl"), Buffer.alloc(64));
    writeFileSync(join(cd, "helius.head.bak"), "an earlier repair's evidence");
    const before = snapshot(cd);
    assert.deepEqual(repair(dir, "ev"), { exitCode: 1, verdict: "REFUSED", reason: "bak_exists" }, "C-3: never overwrite a .bak");
    assert.deepEqual(snapshot(cd), before);
    rmSync(join(cd, "helius.head.bak"));
    rmSync(join(cd, "helius.head"));
    assert.deepEqual(repair(dir, "ev"), { exitCode: 1, verdict: "REFUSED", reason: "head_absent" }, "C-5: head absent stays refused");
  } finally { cleanup(); }
});

test("repair_tail_without_lock_takes_and_releases_it", async () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "nolock", 2, "none");
    appendFileSync(join(cd, "helius.jsonl"), Buffer.alloc(64));
    const j = journal();
    let r: ReturnType<typeof runCli>;
    try { r = repair(dir, "nolock"); } finally { j.restore(); }
    assert.equal(r.verdict, "REPAIRED");
    assert.deepEqual(j.ops.slice(0, 4), ["open:wx:helius.lock", "write:helius.lock", "fsync:helius.lock", "close:helius.lock"], "no lock: taken (durably) BEFORE any write");
    assert.equal(existsSync(join(cd, "helius.lock")), false, "and released after");
  } finally { cleanup(); }
});

test("repair_tail_is_served_by_the_bin", async (t) => {
  const bin = fileURLToPath(new URL("../bin/rpc-guard.mjs", import.meta.url));
  if (!existsSync(bin)) { t.skip("bin/ is not in the public export (PACKAGE_SUBPATHS); the served bin runs in the repo"); return; }
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "bin", 2, "dead");
    const run = (): ReturnType<typeof spawnSync> => spawnSync(process.execPath, [bin, "--ledger-dir", dir, "repair-tail", "--cycle", "bin", "--op", "helius", "--reason", "served"], { env: childEnv(), encoding: "utf8" });
    const refused = run();
    assert.deepEqual([refused.status, refused.stdout], [1, "REFUSED no_nul_tail\n"]);
    appendFileSync(join(cd, "helius.jsonl"), Buffer.alloc(64));
    const ok = run();
    assert.deepEqual([ok.status, ok.stdout], [0, "REPAIRED nul_bytes_removed=64 head_action=none\n"]);
  } finally { cleanup(); }
});

test("reconcile_reads_the_repair_journal_per_window", async () => {
  // C-9: a repair inside the current window is a NO-GO before any bound; the appended `reconciled` line rolls it.
  const { dir, cleanup } = tmp();
  try {
    const cd = await produce(dir, "rc", 2, "none");
    const snap = (n: number): Snapshot => ({ cycle: "rc", byMethod: { getTransaction: n } });
    const rec = (dirName: string, snaps: [Snapshot, Snapshot]): ReturnType<typeof runCli> =>
      runCli(["reconcile", "--cycle", dirName, "--op", "helius", "--before", "b", "--after", "a"], { ledgerDir: dir, floor: 0, readSnapshot: (p) => (p === "b" ? snaps[0] : snaps[1]) });
    const journalPath = join(cd, "helius.repair.jsonl");
    writeFileSync(journalPath, `${JSON.stringify({ lines_after: 2 })}\n`); // repaired when the chain had 2 lines
    assert.deepEqual(rec("rc", [snap(0), snap(2)]), { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" });
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), { exitCode: 0, verdict: "GO" }, "the NO-GO appended `reconciled`: the repair is now before the window");
    appendFileSync(journalPath, "{not json\n");
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" }, "an unreadable record counts (fail-closed)");
  } finally { cleanup(); }
});
