// GARDE-FSYNC-1 - `repair-tail` (checkpoint-1 C-1/C-2/C-3/C-5/C-6/C-8/C-9). The ledger under repair is PRODUCED by the
// real openGuardedClient + call (only globalThis.fetch stubbed); the power cut is reproduced by its byte signature (a NUL
// tail after complete lines, INCIDENT 2026-09-22) and a lock left by a DEAD pid. Every refusal must change NO byte.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, truncateSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openGuardedClient, runCli, verifyCycleLedger, type Snapshot } from "@monark/rpc-guard";
import { LockHeldError } from "../src/lock.ts";
import { openOperatorLedger, type CycleLedgerEntry } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, ONE_METHOD_LIMITS, childEnv, journal, okFetch, realWriter, tmp } from "./harness.ts";

const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const NOGO_REPAIRED = { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" };
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
    const child = realWriter(dir, "cut", 3);
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
    const damaged = readFileSync(join(cd, "helius.jsonl")), headBefore = readFileSync(join(cd, "helius.head"));
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
    // G2 C-G2-2(a): the record of a HEAL, every value recomputed - sha_after.head names the HEALED head (E3), not E2.
    const rec = JSON.parse(readFileSync(join(cd, "helius.repair.jsonl"), "utf8")) as Record<string, unknown>;
    assert.deepEqual({ ...rec, iso: typeof rec.iso }, {
      iso: "string", pid: process.pid, cycle: "hb", op: "helius", reason: "power cut 2026-09-22",
      sha_before: { jsonl: sha(damaged), head: sha(headBefore) },
      sha_after: { jsonl: sha(damaged.subarray(0, damaged.length - 300)), head: sha(Buffer.from(es[2]!.entry_sha256)) },
      nul_bytes_removed: 300, lines_after: 3, head_after: es[2]!.entry_sha256,
      bak_path: { jsonl: "helius.jsonl.bak", head: "helius.head.bak" }, bak_sha256: { jsonl: sha(damaged), head: sha(headBefore) }, head_action: "heal_penultimate",
    });
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
      // G2 C-G2-2(b): a COMPLETE JSON line whose "\n" never reached the disk (head = its penultimate: the cut hit that
      // append), then NUL. Accepting it would glue the next append onto that line (G2 E4b): refused too.
      ["unterminated", (p) => { const t = readFileSync(p, "utf8"); writeFileSync(p.replace(/jsonl$/, "head"), (JSON.parse(t.split("\n")[0]!) as CycleLedgerEntry).entry_sha256); writeFileSync(p, Buffer.concat([Buffer.from(t.slice(0, -1)), Buffer.alloc(64)])); }, "torn_tail"],
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
    // G2 C-G2-2(d): --cycle, --op and --reason are REQUIRED, no default (CONSIGNE B-4): one missing => exit 2, 0 byte.
    const before = snapshot(cd), args = ["repair-tail", "--cycle", "bin", "--op", "helius", "--reason", "served"];
    for (const drop of ["--cycle", "--op", "--reason"]) {
      const r = spawnSync(process.execPath, [bin, "--ledger-dir", dir, ...args.filter((a, i) => a !== drop && args[i - 1] !== drop)], { env: childEnv(), encoding: "utf8" });
      assert.deepEqual([r.status, r.stdout, r.stderr], [2, "", `rpc-guard: ${drop} required (fail-closed)\n`], drop);
      assert.deepEqual(snapshot(cd), before, `${drop} missing: no byte written`);
    }
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
    const rec = (dirName: string, snaps: [Snapshot, Snapshot], extra: string[] = []): ReturnType<typeof runCli> =>
      runCli(["reconcile", "--cycle", dirName, "--op", "helius", "--before", "b", "--after", "a", ...extra], { ledgerDir: dir, floor: 0, readSnapshot: (p) => (p === "b" ? snaps[0] : snaps[1]) });
    const journalPath = join(cd, "helius.repair.jsonl");
    writeFileSync(journalPath, `${JSON.stringify({ lines_after: 2 })}\n`); // repaired when the chain had 2 lines
    assert.deepEqual(rec("rc", [snap(0), snap(2)]), { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" });
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), { exitCode: 0, verdict: "GO" }, "the NO-GO appended `reconciled`: the repair is now before the window");
    appendFileSync(journalPath, "{not json\n");
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" }, "an unreadable record counts (fail-closed)");
    // G2 C-G2-1 at unit level (the public mirror, which has no bin/, runs these too). Each vector REPLACES the journal
    // (the unreadable line above flags every window). (i) lines_after == the window start is IN the window (N1, MV-3);
    // (ii) the flag is decided before the aggregate branch (N2); (iii) a parseable record without a NUMERIC lines_after
    // counts (N17).
    const es = entriesOf(join(cd, "helius.jsonl")), start = es.length; // the chain ends with `reconciled`: window start
    assert.equal(es.at(-1)!.outcome, "reconciled");
    writeFileSync(journalPath, `${JSON.stringify({ lines_after: start })}\n`);
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), NOGO_REPAIRED, "(i) lines_after == window start");
    writeFileSync(journalPath, `${JSON.stringify({ lines_after: start + 1 })}\n`);
    assert.deepEqual(rec("rc", [{ cycle: "rc", total_ru: 0 }, { cycle: "rc", total_ru: 0 }], ["--mode", "aggregate"]), NOGO_REPAIRED, "(ii) aggregate mode");
    writeFileSync(journalPath, `${JSON.stringify({ lines_after: String(start + 2) })}\n`);
    assert.deepEqual(rec("rc", [snap(2), snap(2)]), NOGO_REPAIRED, "(iii) lines_after is not a number");
  } finally { cleanup(); }
});

test("repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile", (t) => {
  // G2 C-G2-1 = checkpoint-2 C-V-2/C-V-3 (CA-11 durci): the tuyau repair-tail -> <op>.repair.jsonl -> reconcile composed
  // from the REAL producer, through the SERVED bin (spawnSync, as RUNBOOK section 3 runs it). The hand-written journal
  // of reconcile_reads_the_repair_journal_per_window above stays a unit test.
  const bin = fileURLToPath(new URL("../bin/rpc-guard.mjs", import.meta.url));
  if (!existsSync(bin)) { t.skip("bin/ is not in the public export (PACKAGE_SUBPATHS); the served bin runs in the repo"); return; }
  const { dir, cleanup } = tmp();
  try {
    const led = join(dir, "ledgers"), backup = join(dir, "backup"); // the backup folder lives OUTSIDE the ledger dir
    mkdirSync(led); mkdirSync(backup);
    let n = 0;
    const run = (sub: string, cycle: string, ...rest: string[]): [number | null, string] => {
      const r = spawnSync(process.execPath, [bin, "--ledger-dir", led, sub, "--cycle", cycle, "--op", "helius", ...rest], { env: childEnv(), encoding: "utf8" });
      return [r.status, r.stdout];
    };
    const reconcile = (cycle: string, before: Snapshot, after: Snapshot, ...mode: string[]): [number | null, string] => {
      const [b, a] = [before, after].map((s) => { const p = join(dir, `snap-${String(++n)}.json`); writeFileSync(p, JSON.stringify(s)); return p; });
      return run("reconcile", cycle, "--before", b!, "--after", a!, ...mode);
    };
    const gt = (k: number): Snapshot => ({ cycle: "w", byMethod: { getTransaction: k } });
    const cd = join(led, "w"), jsonl = join(cd, "helius.jsonl"), journalPath = join(cd, "helius.repair.jsonl");
    const lastRecord = (): { lines_after?: unknown } => JSON.parse(readFileSync(journalPath, "utf8").trim().split("\n").at(-1)!) as { lines_after?: unknown };
    const NO_GO = [1, "NO-GO repaired_in_window\n"];
    // (1) 3 real calls, the writer dies holding the lock, the cut leaves a NUL tail; RUNBOOK section 3 steps 2-6.
    assert.equal(realWriter(led, "w", 3).status, 0);
    appendFileSync(jsonl, Buffer.alloc(4096));
    assert.deepEqual(run("repair-tail", "w", "--reason", "cut 1"), [0, "REPAIRED nul_bytes_removed=4096 head_action=none\n"]);
    assert.deepEqual(run("unlock", "w", "--reason", "after repair-tail"), [0, ""]);
    assert.deepEqual(reconcile("w", gt(0), gt(3)), NO_GO, "the record written by repair-tail flags its window");
    assert.deepEqual(reconcile("w", gt(0), gt(3)), [1, "NO-GO hard:getTransaction\n"], "that NO-GO closed the window: the SAME snapshots meet an EMPTY window (G2 E11)");
    assert.deepEqual(reconcile("w", gt(3), gt(3)), [0, "GO\n"], "chained snapshots: the next window is clean, the flag rolled");
    // (2) variant (i), C-V-3: a new writer dies before its FIRST line reached the disk, right after a `reconciled` line.
    const start = entriesOf(jsonl).length;
    assert.equal(realWriter(led, "w", 0).status, 0);
    appendFileSync(jsonl, Buffer.alloc(512));
    assert.deepEqual(run("repair-tail", "w", "--reason", "cut 2"), [1, "REFUSED bak_exists\n"]);
    for (const f of ["helius.jsonl.bak", "helius.head.bak"]) renameSync(join(cd, f), join(backup, f)); // RUNBOOK: bak_exists
    assert.deepEqual(run("repair-tail", "w", "--reason", "cut 2"), [0, "REPAIRED nul_bytes_removed=512 head_action=none\n"]);
    assert.equal(lastRecord().lines_after, start, "the boundary is exercised: lines_after == the window start");
    assert.deepEqual(run("unlock", "w", "--reason", "after repair-tail 2"), [0, ""]);
    assert.deepEqual(reconcile("w", gt(3), gt(3)), NO_GO, "(i) lines_after == window start is IN the window");
    // (3) variant (iii): a parseable record without a NUMERIC lines_after flags EVERY window until it is lifted (RUNBOOK
    //     section 5: the journal is copied to the backup folder, then the line is removed).
    const kept = readFileSync(journalPath);
    appendFileSync(journalPath, `${JSON.stringify({ reason: "manual (RUNBOOK section 4)", lines_after: String(start) })}\n`);
    assert.deepEqual(reconcile("w", gt(3), gt(3)), NO_GO, "(iii) lines_after is not a number");
    assert.deepEqual(reconcile("w", gt(3), gt(3)), NO_GO, "(iii) it never rolls");
    copyFileSync(journalPath, join(backup, "helius.repair.jsonl"));
    writeFileSync(journalPath, kept);
    assert.deepEqual(reconcile("w", gt(3), gt(3)), [0, "GO\n"], "(iii) lifted");
    // (4) variant (ii): aggregate mode (the chainstack mode, ADR item I-5): the flag is decided BEFORE the mode branch.
    const ru = (k: number): Snapshot => ({ cycle: "agg", total_ru: k });
    assert.equal(realWriter(led, "agg", 2).status, 0);
    appendFileSync(join(led, "agg", "helius.jsonl"), Buffer.alloc(64));
    assert.deepEqual(run("repair-tail", "agg", "--reason", "cut"), [0, "REPAIRED nul_bytes_removed=64 head_action=none\n"]);
    assert.deepEqual(run("unlock", "agg", "--reason", "after repair-tail"), [0, ""]);
    assert.deepEqual(reconcile("agg", ru(0), ru(2), "--mode", "aggregate"), NO_GO, "(ii) aggregate mode");
    assert.deepEqual(reconcile("agg", ru(2), ru(2), "--mode", "aggregate"), [0, "GO\n"]);
  } finally { cleanup(); }
});
