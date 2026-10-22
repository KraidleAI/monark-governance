// MONARK Bell -- the --handoff mode of the publisher (G0 BELL-COLLECT-TIMER-1 DC-3; plan of part 3, lot 3a, C3-1 to C3-6): the publisher
// publishes on its own, in order, what the collection tick deposits into the handoff directory, which it never writes; it records each
// publication and each refusal in the status directory, waits on a unit it cannot publish, and holds publish.lock in --state.
// Declared fixture: each bundle holds ONE run made by the real collect() and written as runMain writes it (calque dropRun of
// helpers/bell-served.ts), on a window of its own (bundle k: [S + k days, S + k + 1 days - 1 s], the tick's 1 s gap); its sibling
// manifest is written by manifestOf, the tick's own function; the names and windows are synthetic. The tombstone is made by the real
// tick (--seed, then --abandon). The bundles are not the tick's own deposit: that composition (tick -> --handoff -> bell-verify) is the
// part-3 integration test of lot 3b-ii. The publication key is fixed (built from a hashed label, test only); no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, chmodSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { createHash, createPrivateKey } from "node:crypto";
import * as P from "../scripts/bell-publish.mjs";
import { BOUNDS, manifestOf, validateBundle } from "../scripts/bell-validate.mjs";
import { canonical, keyringOf, sha256Hex } from "../scripts/bell-chain.mjs";
import { dirSource, verifyServed } from "../scripts/bell-verify.mjs";
import { collect } from "../src/collect.ts";
import { tickMain } from "../src/tick.ts";
import { readStatus, recollectOf } from "../src/handoff-status.ts";
import { earliestPublishUtc, refCloseDateOf, type SessionLabel } from "../src/sessions.ts";
import { once } from "node:events";
import { ATTEMPT_BUDGET } from "../../../scripts/bell-deploy.mjs";
import { REPO, T_PUBLISH, tmp } from "./helpers/bell-served.ts";

type Obj = Record<string, unknown>;
const KEY = createPrivateKey({ key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"),
  createHash("sha256").update("monark bell handoff fixture key, test only").digest()]), format: "der", type: "pkcs8" });
const SCRIPT = join(REPO, "apps", "bell", "scripts", "bell-publish.mjs");
const DAYS = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];
const unit = (k: number, rev = 0): string => `unit-${DAYS[k] ?? ""}${rev === 0 ? "" : `-r${String(rev)}`}`;
const S = Date.UTC(2026, 9, 5, 8), DAY_MS = 86_400_000;
const isCode = (code: string) => (e: unknown): boolean => e instanceof P.BellPublishError && e.code === code;
const readJsonl = (p: string): Obj[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) : []);
/** At the base the --handoff exports do not exist: each test opens on this assertion (a named red, never a TypeError). */
function api(): void {
  for (const k of ["publishHandoff", "postStartMark", "chooseHandoff"]) assert.equal(typeof (P as unknown as Obj)[k], "function", `bell-publish.mjs exports ${k}`);
}

/** One run of the real collect() on window k (one fill inside it), written as runMain writes it, into <dir>/TSLAx. */
function writeRun(dir: string, k: number, usdc: bigint): void {
  const from = S + k * DAY_MS, to = from + DAY_MS - 1000, w = from + DAY_MS / 2;
  const r = collect({ symbols: [{ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fillsResidues: [], quorumCoverage: 1, advDailyVolumes: [],
    fills: [{ signature: `f${String(k)}`, blockTimeUtcMs: w, baseDelta: 100_000_000n, quoteDelta: -usdc * 1_000_000n }], closeRefBySession: {} }],
  haltRows: [], window: { fromUtcMs: from, toUtcMs: to }, nowSec: T_PUBLISH / 1000, staleBoundSec: 93600, generatedAt: new Date(w).toISOString(), providers: ["helius"] });
  const run = join(dir, "TSLAx");
  mkdirSync(run, { recursive: true });
  writeFileSync(join(run, "state.json"), JSON.stringify(r.state, null, 2));
  writeFileSync(join(run, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(join(run, "provenance.json"), JSON.stringify(r.provenance, null, 2));
}
/** A bundle `name` on window k, then its sibling manifest by manifestOf (the tick's order: the manifest, then the bundle name). */
function deposit(handoff: string, name: string, k: number, usdc = 365n + BigInt(k), tamper?: (dir: string) => void): string {
  const dir = join(handoff, name);
  writeRun(dir, k, usdc);
  tamper?.(dir);
  const text = manifestOf(dir);
  writeFileSync(`${dir}.manifest`, text);
  return sha256Hex(text);
}
interface Box { handoff: string; state: string; status: string; clock: () => number }
/** The three directories, and the start mark at DAYS[mark] posted by the real --handoff-start form; the clock advances at each read. */
function box(mark: number | null = 0): Box {
  const root = tmp("bell-handoff-"), b = { handoff: join(root, "handoff"), state: join(root, "state"), status: join(root, "status") };
  for (const d of Object.values(b)) mkdirSync(d);
  let now = T_PUBLISH;
  const clock = (): number => now++;
  if (mark !== null) P.postStartMark({ from: DAYS[mark] ?? "", handoffDir: b.handoff, statusDir: b.status, clock, clockSynced: () => true });
  return { ...b, clock };
}
const call = (b: Box, over: Partial<Parameters<typeof P.publishHandoff>[0]> = {}): P.HandoffResult =>
  P.publishHandoff({ handoffDir: b.handoff, stateDir: b.state, statusDir: b.status, privateKey: KEY, clock: b.clock, clockSynced: () => true, ...over });
const timeline = (b: Box): Obj[] => readJsonl(join(b.state, "timeline.jsonl"));
const bellShaOf = (b: Box, name: string): unknown => (JSON.parse(readFileSync(join(b.handoff, name, "TSLAx", "state.json"), "utf8")) as Obj).bell_sha;
/** Every entry under `dir`: its relative path, then "dir" or its sha256, size and mtime. */
function tree(dir: string, rel = ""): string[] {
  return readdirSync(join(dir, rel), { withFileTypes: true }).flatMap((e) => {
    const r = rel === "" ? e.name : `${rel}/${e.name}`, p = join(dir, r);
    return e.isDirectory() ? [`${r} dir`, ...tree(dir, r)] : [`${r} ${sha256Hex(readFileSync(p))} ${String(statSync(p).size)} ${String(statSync(p).mtimeMs)}`];
  }).sort();
}
/** stdout and stderr of `body`, captured. */
function io(body: () => number): { code: number; out: string; err: string } {
  const w = { out: process.stdout.write.bind(process.stdout), err: process.stderr.write.bind(process.stderr) }, got = { out: "", err: "" };
  process.stdout.write = (s: string): boolean => { got.out += s; return true; };
  process.stderr.write = (s: string): boolean => { got.err += s; return true; };
  try { return { code: body(), ...got }; } finally { process.stdout.write = w.out; process.stderr.write = w.err; }
}
/** The real command line of the unit's --handoff form (runCli), the key under a credentials directory as PID 1 hands it, the box's clock. */
function cli(b: Box): ReturnType<typeof io> {
  const creds = tmp("bell-handoff-creds-"), real = process.env.CREDENTIALS_DIRECTORY;
  writeFileSync(join(creds, "bell-signing-key"), KEY.export({ type: "pkcs8", format: "pem" }));
  try {
    process.env.CREDENTIALS_DIRECTORY = creds;
    return io(() => P.runCli(["--handoff", b.handoff, "--state", b.state, "--status", b.status], { clockSynced: () => true, clock: b.clock }));
  } finally { if (real === undefined) delete process.env.CREDENTIALS_DIRECTORY; else process.env.CREDENTIALS_DIRECTORY = real; rmSync(creds, { recursive: true, force: true }); }
}
/** What the collection tick decides on the handoff as it is (apps/bell/src/tick.ts passageOf feeds the same readers): the unit to collect again. */
function tickRecollects(b: Box): ReturnType<typeof recollectOf> {
  const text = (f: string): string | null => (existsSync(join(b.status, f)) ? readFileSync(join(b.status, f), "utf8") : null), names = readdirSync(b.handoff);
  const r = readStatus({ start: text("start"), published: text("published.jsonl"), refused: text("refused.jsonl"), abandoned: null });
  if (!r.ok) return assert.fail(`the tick's reader refuses status/${r.file}`);
  const deposits = names.filter((e) => /^unit-\d{4}-\d{2}-\d{2}(-r\d+)?\.manifest$/.test(e)).map((e) => e.slice(0, -".manifest".length))
    .map((name) => ({ name, manifest_sha256: sha256Hex(readFileSync(join(b.handoff, `${name}.manifest`), "utf8")), dir: names.includes(name) }));
  return recollectOf({ start: r.start, published: r.published, refused: r.refused, abandoned: r.abandoned, deposits, tombstones: [], quarantined: [] });
}
/** `file` unreadable to this process until the returned release: on win32 an open with share mode none (UV_FS_O_EXLOCK, 0x10000000, which
 *  node:fs does not export; measured 2026-10-16, Node v24.21.0: a read meanwhile fails EBUSY); elsewhere mode 000 (a reader not root: EACCES). */
function unreadable(file: string): () => void {
  if (process.platform === "win32") { const fd = openSync(file, 0x10000000); return () => { closeSync(fd); }; }
  chmodSync(file, 0);
  return () => { chmodSync(file, 0o644); };
}

// killer: apps/bell/scripts/bell-publish.mjs:378 SDL "appendStatus(statusDir, \"published.jsonl\", { bundle, manifest_sha256, seq: l.seq, published_at: l.published_at }, D);" -> ""
test("bell_publish_handoff_publishes_due_bundles_in_order_once", async () => {
  api();
  const b = box(0), sha = [0, 1, 2].map((k) => deposit(b.handoff, unit(k), k));
  const r = call(b), lines = timeline(b), at = new Date(T_PUBLISH + 1).toISOString(); // read 0 posted the mark; read 1 is the call's
  assert.deepEqual(r, { status: "published", published: [0, 1, 2].map((k) => ({ bundle: unit(k), seq: k + 1 })) });
  assert.deepEqual(lines.map((l) => [l.seq, l.published_at, (l.runs as Obj[]).map((x) => x.bell_sha)]), [0, 1, 2].map((k) => [k + 1, at, [bellShaOf(b, unit(k))]]), "one line per bundle, D ascending");
  const status = readJsonl(join(b.status, "published.jsonl"));
  assert.deepEqual(status.map((e) => Object.keys(e)), [0, 1, 2].map(() => ["bundle", "manifest_sha256", "seq", "published_at"]), "the shape of a published.jsonl line");
  assert.deepEqual(status, [0, 1, 2].map((k) => ({ bundle: unit(k), manifest_sha256: sha[k], seq: k + 1, published_at: at })), "published_at is the line's, from the call's one clock read");
  assert.deepEqual([call(b), timeline(b).length, readJsonl(join(b.status, "published.jsonl")).length], [{ status: "nothing_to_publish", published: [] }, 3, 3], "once: a second call publishes nothing");
  const rep = await verifyServed({ source: dirSource(join(b.state, "public")), keyring: keyringOf(KEY, 1) });
  assert.deepEqual([rep.status, rep.publications, rep.breaks], ["consistent_with_supplied_keyring", 3, []]);
  const names = [unit(2), unit(0), unit(1)], manifests = Object.fromEntries(names.map((x) => [x, sha256Hex(x)]));
  assert.deepEqual(P.chooseHandoff({ names, manifests, published: [], refused: [], start: DAYS[0] ?? "", n: 8 }).bundles.map((x) => x.bundle), [unit(0), unit(1), unit(2)], "ascending whatever the listing order");
});

// killer: apps/bell/scripts/bell-publish.mjs:323 CONST "return null;" -> "return \"2026-01-01\";"
test("bell_publish_handoff_refuses_without_start_mark", () => {
  api();
  const b = box(null);
  deposit(b.handoff, unit(0), 0);
  const before = tree(b.handoff);
  assert.throws(() => call(b), isCode("handoff_start_missing"));
  assert.deepEqual([readdirSync(b.state), readdirSync(b.status), tree(b.handoff)], [[], [], before], "nothing written, the lock released");
});

// killer: apps/bell/scripts/bell-publish.mjs:272 ROR ">= start).sort()" -> "> start).sort()"
test("bell_publish_handoff_never_publishes_a_bundle_before_the_start_mark", () => {
  api();
  const b = box(1);
  deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, unit(1), 1);
  deposit(b.handoff, unit(2), 2);
  assert.deepEqual(call(b).published.map((x) => x.bundle), [unit(1), unit(2)], "the unit of the mark and after; never before");
  assert.deepEqual(timeline(b).map((l) => (l.runs as Obj[]).map((x) => x.bell_sha)), [[bellShaOf(b, unit(1))], [bellShaOf(b, unit(2))]]);
});

// killer: apps/bell/scripts/bell-publish.mjs:366 CONST "&& p.window.from_utc_ms <= r.state.window.to_utc_ms" -> "&& false"
test("bell_publish_handoff_refuses_window_overlapping_a_published_window", () => {
  api();
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  assert.equal(call(b).status, "published");
  const sha = deposit(b.handoff, unit(1), 0, 999n); // another run (another bell_sha) on the window of unit 0
  assert.throws(() => call(b), isCode("window_overlaps_published"));
  assert.deepEqual([timeline(b).length, readJsonl(join(b.status, "refused.jsonl"))], [1, [{ bundle: unit(1), manifest_sha256: sha, code: "window_overlaps_published", refused_at: new Date(T_PUBLISH + 2).toISOString() }]]);
});

// killer: apps/bell/scripts/bell-publish.mjs:291 SDL "if (err?.code === \"ENOENT\") continue; " -> ""
test("bell_publish_handoff_ignores_tmp_and_unmanifested_dirs", () => {
  api();
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, `.tmp-${unit(1)}`, 1); // a deposit in course, even with a concordant manifest
  writeRun(join(b.handoff, unit(1, 1)), 1, 402n); // a revision without its manifest (one that no longer matches is refused: manifest_mismatch)
  deposit(b.handoff, unit(2), 2);
  let r: P.HandoffResult | undefined;
  assert.doesNotThrow(() => { r = call(b); }, "an entry without its manifest is skipped: its manifest absent at the read (ENOENT), never a failure");
  assert.deepEqual(r, { status: "awaiting_unit", published: [{ bundle: unit(0), seq: 1 }], awaiting_unit: unit(1) }, "unit 1 has no candidate: the list stops there");
  assert.equal(timeline(b).length, 1);
});

// killer: apps/bell/scripts/bell-publish.mjs:373 CONST "BUNDLE_REFUSALS.has(e.code)" -> "false"
test("bell_publish_handoff_records_refusal_in_status_and_stops", () => {
  api();
  const b = box(0);
  const sha = deposit(b.handoff, unit(0), 0, 365n, (d) => {
    const p = join(d, "TSLAx", "state.json");
    writeFileSync(p, JSON.stringify({ ...(JSON.parse(readFileSync(p, "utf8")) as Obj), extra: 1 }));
  });
  deposit(b.handoff, unit(1), 1);
  assert.throws(() => call(b), isCode("unknown_field"));
  const refused = readJsonl(join(b.status, "refused.jsonl"));
  assert.deepEqual(refused.map((e) => Object.keys(e)), [["bundle", "manifest_sha256", "code", "refused_at"]], "the shape of a refused.jsonl line");
  assert.deepEqual(refused, [{ bundle: unit(0), manifest_sha256: sha, code: "unknown_field", refused_at: new Date(T_PUBLISH + 1).toISOString() }]);
  assert.deepEqual([timeline(b).length, existsSync(join(b.status, "published.jsonl"))], [0, false], "the call stops: unit 1 is not published");
  assert.deepEqual([call(b), readJsonl(join(b.status, "refused.jsonl")).length], [{ status: "awaiting_unit", published: [], awaiting_unit: unit(0) }, 1]);
});

// killer: apps/bell/scripts/bell-publish.mjs:378 CONST "appendStatus(statusDir, \"published.jsonl\"" -> "appendStatus(handoffDir, \"published.jsonl\""
test("bell_publish_handoff_never_writes_the_handoff_dir", () => {
  api();
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, unit(1), 1, 365n, (d) => { writeFileSync(join(d, "TSLAx", "state.json"), "{}"); });
  const before = tree(b.handoff);
  assert.throws(() => call(b), isCode("schema_mismatch"));
  assert.deepEqual([timeline(b).length, readJsonl(join(b.status, "published.jsonl")).length, readJsonl(join(b.status, "refused.jsonl")).length], [1, 1, 1]);
  assert.deepEqual(tree(b.handoff), before, "a publication and a refusal leave the handoff directory as it was, byte for byte");
});

// killer: apps/bell/scripts/bell-publish.mjs:483 CONST "linkSync(tmp, lock)" -> "renameSync(tmp, lock)"
test("bell_publish_lock_refuses_a_second_writer", () => {
  api();
  const b = box(0), lock = join(b.state, "publish.lock");
  deposit(b.handoff, unit(0), 0);
  writeFileSync(lock, "another writer\n");
  assert.throws(() => call(b), isCode("lock_held"));
  assert.deepEqual([readFileSync(lock, "utf8"), timeline(b).length], ["another writer\n", 0], "the refused writer leaves the other's lock and writes nothing");
  rmSync(lock);
  // BELL-PUBLISH-SIGTERM-SYNC-1: the call is synchronous, so a SIGTERM during it is served by the event loop only after it returns; what holds
  // is what this observes: the lock and the SIGTERM listener (which keeps the default exit off meanwhile) during the call, neither after it.
  const listeners = process.listeners("SIGTERM").length;
  let during: [boolean, number] | undefined;
  const fs: P.DurableFs = { ...P.DURABLE_FS, writeSync: (fd, data) => { during ??= [existsSync(lock), process.listeners("SIGTERM").length]; P.DURABLE_FS.writeSync(fd, data); } };
  assert.equal(call(b, { fs }).status, "published");
  assert.deepEqual([during, existsSync(lock), process.listeners("SIGTERM").length], [[true, listeners + 1], false, listeners], "held with its listener during the call; released and removed by its finally");
});

// killer: apps/bell/scripts/bell-publish.mjs:251 CONST "() => false" -> "() => true"
test("bell_publish_refuses_clock_unsynced", () => {
  api();
  const b = box(0), mark = readFileSync(join(b.status, "start"), "utf8");
  deposit(b.handoff, unit(0), 0);
  assert.throws(() => P.postStartMark({ from: DAYS[1] ?? "", handoffDir: b.handoff, statusDir: b.status, clock: b.clock }), isCode("clock_unsynced"), "the default probe is unsynced, read first");
  assert.equal(readFileSync(join(b.status, "start"), "utf8"), mark);
  assert.throws(() => P.publishHandoff({ handoffDir: b.handoff, stateDir: b.state, statusDir: b.status, privateKey: KEY, clock: b.clock }), isCode("clock_unsynced"));
  assert.throws(() => call(b, { clockSynced: () => false }), isCode("clock_unsynced"));
  assert.deepEqual([readdirSync(b.state), timeline(b).length], [[], 0], "no lock, no line");
  // The real command line: the probe stays the default (item CLOCK-PROBE-FORM-1), before any key: exit 1, clock_unsynced.
  const env = { ...process.env };
  delete env.CREDENTIALS_DIRECTORY;
  const cli = spawnSync(process.execPath, [SCRIPT, "--handoff", b.handoff, "--state", b.state, "--status", b.status], { env, encoding: "utf8" });
  assert.deepEqual([cli.status, cli.stdout, cli.stderr], [1, "", "bell/publish: clock_unsynced: the host clock is not synchronized\n"]);
  assert.equal(spawnSync(process.execPath, [SCRIPT, "--handoff", b.handoff, "--status", b.status], { env, encoding: "utf8" }).status, 64, "usage: 64");
});

// killer: apps/bell/scripts/bell-publish.mjs:337 ROR ">= from" -> "> from"
test("bell_publish_handoff_start_refuses_a_second_mark_and_a_mark_before_bundles", () => {
  api();
  const b = box(null), argv = (d: string): string[] => ["--handoff-start", d, "--handoff", b.handoff, "--status", b.status];
  deposit(b.handoff, unit(0), 0);
  writeFileSync(join(b.handoff, `${unit(1)}.abandoned`), "x");
  const first = io(() => P.runCli(argv(DAYS[1] ?? ""), { clockSynced: () => true }));
  assert.deepEqual([first.code, first.out, first.err, readdirSync(b.status)], [1, "", "bell/publish: start_mark_not_after_bundles: 1 bundle(s) of the handoff directory start at or after the mark\n", []],
    "a tombstone on the day of the mark counts");
  const ok = io(() => P.runCli(argv(DAYS[2] ?? ""), { clockSynced: () => true }));
  assert.deepEqual([ok.code, ok.err], [0, ""]);
  const mark = readFileSync(join(b.status, "start"), "utf8"), posted = String((JSON.parse(mark) as Obj).posted_at);
  assert.equal(mark, `{"from_unit":"${DAYS[2] ?? ""}","posted_at":"${posted}"}\n`, "the mark, byte for byte");
  assert.deepEqual([ok.out, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(posted)], [`${JSON.stringify({ status: "start_mark_posted", from_unit: DAYS[2], posted_at: posted })}\n`, true]);
  const again = io(() => P.runCli(argv(DAYS[3] ?? ""), { clockSynced: () => true }));
  assert.deepEqual([again.code, again.err, readFileSync(join(b.status, "start"), "utf8"), readdirSync(b.status)], [1, "bell/publish: start_mark_exists: status/start\n", mark, ["start"]]);
  assert.deepEqual([io(() => P.runCli(argv("2026-02-30"), { clockSynced: () => true })).code, io(() => P.runCli([...argv(DAYS[4] ?? ""), "--state", b.state])).code], [64, 64], "usage: a day that does not exist, a foreign option");
});

// killer: apps/bell/scripts/bell-publish.mjs:271 CONST "r.bundle === x && r.manifest_sha256 === manifests[x]" -> "false"
test("bell_publish_handoff_never_retries_a_recorded_refusal", () => {
  api();
  const b = box(0), sha = deposit(b.handoff, unit(0), 0); // a valid bundle, recorded as refused (name and manifest sha256)
  writeFileSync(join(b.status, "refused.jsonl"), `${JSON.stringify({ bundle: unit(0), manifest_sha256: sha, code: "schema_mismatch", refused_at: "2026-10-06T00:00:00.000Z" })}\n`);
  assert.deepEqual([call(b), timeline(b).length], [{ status: "awaiting_unit", published: [], awaiting_unit: unit(0) }, 0], "never validated again");
  writeFileSync(join(b.status, "refused.jsonl"), `${JSON.stringify({ bundle: unit(0), manifest_sha256: "0".repeat(64), code: "schema_mismatch", refused_at: "2026-10-06T00:00:00.000Z" })}\n`);
  assert.deepEqual(call(b).published, [{ bundle: unit(0), seq: 1 }], "a refusal of another manifest is not this bundle's");
});

// killer: apps/bell/scripts/bell-publish.mjs:277 CONST "revOf(b) - revOf(a)" -> "revOf(a) - revOf(b)"
test("bell_publish_handoff_takes_the_highest_unrefused_revision", () => {
  api();
  const b = box(0);
  deposit(b.handoff, unit(0), 0, 365n);
  deposit(b.handoff, unit(0, 1), 0, 366n);
  const r2 = deposit(b.handoff, unit(0, 2), 0, 367n);
  writeFileSync(join(b.status, "refused.jsonl"), `${JSON.stringify({ bundle: unit(0, 2), manifest_sha256: r2, code: "unknown_field", refused_at: "2026-10-06T00:00:00.000Z" })}\n`);
  assert.deepEqual(call(b).published, [{ bundle: unit(0, 1), seq: 1 }]);
  assert.deepEqual(timeline(b).map((l) => (l.runs as Obj[]).map((x) => x.bell_sha)), [[bellShaOf(b, unit(0, 1))]]);
  const names = [unit(0), unit(0, 9), unit(0, 10)], manifests = Object.fromEntries(names.map((x) => [x, sha256Hex(x)]));
  assert.deepEqual(P.chooseHandoff({ names, manifests, published: [], refused: [], start: DAYS[0] ?? "", n: 8 }).bundles.map((x) => x.bundle), [unit(0, 10)], "r10 is above r9");
});

// killer: apps/bell/scripts/bell-publish.mjs:270 CONST "new Set(stones.filter(has).map(dayOf))" -> "new Set()"
test("bell_publish_handoff_skips_an_abandoned_unit_by_tombstone", async () => {
  api();
  const b = box(0), collectState = join(b.state, "..", "collect"), quiet = { env: {}, now: () => T_PUBLISH, clockSynced: () => true, out: (): void => undefined, err: (): void => undefined };
  deposit(b.handoff, unit(0), 0);
  assert.equal(await tickMain(["--seed", DAYS[1] ?? "", "--state", collectState], quiet), 0);
  writeFileSync(join(collectState, "state", "attempts.json"), `${JSON.stringify({ [DAYS[1] ?? ""]: ATTEMPT_BUDGET })}\n`);
  assert.equal(await tickMain(["--abandon", DAYS[1] ?? "", "--reason", "source_down", "--state", collectState, "--handoff", b.handoff], quiet), 0, "the real abandon act");
  assert.ok(existsSync(join(b.handoff, `${unit(1)}.abandoned`)) && existsSync(join(b.handoff, `${unit(1)}.abandoned.manifest`)));
  deposit(b.handoff, unit(2), 2);
  assert.deepEqual(call(b), { status: "published", published: [{ bundle: unit(0), seq: 1 }, { bundle: unit(2), seq: 2 }] }, "the abandoned unit is skipped");
  deposit(b.handoff, unit(4), 4);
  writeFileSync(join(b.handoff, `${unit(3)}.abandoned`), "x");
  writeFileSync(join(b.handoff, `${unit(3)}.abandoned.manifest`), `${"0".repeat(64)}  ${unit(3)}.abandoned\n`);
  assert.deepEqual(call(b), { status: "awaiting_unit", published: [], awaiting_unit: unit(3) }, "a tombstone that does not match its manifest skips nothing");
});

// killer: apps/bell/scripts/bell-publish.mjs:278 CONST "return { bundles: chosen, awaiting: d };" -> "continue;"
test("bell_publish_handoff_waits_on_a_unit_without_candidate", () => {
  api();
  const b = box(0), sha = deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, unit(1), 1);
  writeFileSync(join(b.status, "refused.jsonl"), `${JSON.stringify({ bundle: unit(0), manifest_sha256: sha, code: "unknown_field", refused_at: "2026-10-06T00:00:00.000Z" })}\n`);
  const creds = tmp("bell-handoff-creds-"), real = process.env.CREDENTIALS_DIRECTORY;
  writeFileSync(join(creds, "bell-signing-key"), KEY.export({ type: "pkcs8", format: "pem" }));
  let got: ReturnType<typeof io>;
  try {
    process.env.CREDENTIALS_DIRECTORY = creds;
    got = io(() => P.runCli(["--handoff", b.handoff, "--state", b.state, "--status", b.status], { clockSynced: () => true }));
  } finally { if (real === undefined) delete process.env.CREDENTIALS_DIRECTORY; else process.env.CREDENTIALS_DIRECTORY = real; rmSync(creds, { recursive: true, force: true }); }
  assert.deepEqual([got.code, got.out, got.err], [0, `${JSON.stringify({ status: "awaiting_unit", published: [], awaiting_unit: unit(0) })}\n`, ""], "exit 0, one stdout line that says it");
  assert.deepEqual([timeline(b).length, existsSync(join(b.status, "published.jsonl"))], [0, false], "unit 1 waits behind unit 0");
});

// killer: apps/bell/scripts/bell-publish.mjs:378 CONST "published_at: l.published_at" -> "published_at: new Date(t).toISOString()"
test("bell_publish_handoff_status_heals_after_a_crash_between_commit_and_status", () => {
  api();
  const b = box(0), sha = [deposit(b.handoff, unit(0), 0), deposit(b.handoff, unit(1), 1)];
  assert.equal(call(b, { n: 1 }).status, "published");
  const crash: P.DurableFs = { ...P.DURABLE_FS, renameSync: (from, to) => { if (to.endsWith("published.jsonl")) throw new Error("stopped"); P.DURABLE_FS.renameSync(from, to); } };
  assert.throws(() => call(b, { fs: crash }), /stopped/);
  assert.deepEqual([timeline(b).length, readJsonl(join(b.status, "published.jsonl")).length, existsSync(join(b.state, "publish.lock"))], [2, 1, false], "line 2 committed, its status line lost");
  const line2 = timeline(b)[1] ?? {};
  assert.deepEqual(call(b), { status: "published", published: [{ bundle: unit(1), seq: 2, healed: true }] });
  assert.deepEqual([timeline(b).length, readJsonl(join(b.status, "published.jsonl"))[1]], [2, { bundle: unit(1), manifest_sha256: sha[1], seq: 2, published_at: line2.published_at }],
    "no new line; the status line names the line that holds the runs, at its published_at");
});

// killer: apps/bell/scripts/bell-publish.mjs:269 CONST "UNIT_NAME.test(x)), stones" -> "x.startsWith(\"unit-\")), stones"
test("bell_publish_handoff_rejects_names_outside_the_grammar", () => {
  api();
  const bad = ["unit-2026-10-05-r0", "unit-2026-10-05-r100", "unit-2026-10-05-r01", "unit-26-10-05", "unit-2026-10-05x", "unit-2026-10-05.manifest"];
  const manifests = Object.fromEntries(bad.map((x) => [x, sha256Hex(x)]));
  assert.deepEqual(P.chooseHandoff({ names: bad, manifests, published: [], refused: [], start: "2026-01-01", n: 8 }), { bundles: [], awaiting: null }, "no bundle, no unit");
  const b = box(0);
  for (const [i, x] of bad.slice(0, 3).entries()) deposit(b.handoff, x, i);
  assert.deepEqual([call(b), timeline(b).length], [{ status: "nothing_to_publish", published: [] }, 0]);
});

// killer: apps/bell/scripts/bell-publish.mjs:275 CONST "chosen.length >= n" -> "false"
test("bell_publish_handoff_takes_at_most_n_bundles_per_call", () => {
  api();
  assert.equal(P.HANDOFF_N, 8);
  const b = box(0);
  for (let k = 0; k < 9; k++) deposit(b.handoff, unit(k), k);
  assert.deepEqual(call(b).published.map((x) => x.bundle), DAYS.slice(0, 8).map((_, k) => unit(k)), "N = 8 by default");
  assert.deepEqual([call(b).published, timeline(b).length], [[{ bundle: unit(8), seq: 9 }], 9], "the next call takes the rest");
});

// G2 of part 3, m-1 (G0 DC-3 amended 2026-10-16): a bundle whose files no longer match its manifest is refused by name, recorded, and the tick
// collects its unit again; before, the publisher skipped it unrecorded and awaited it with no exit (the reviewer's proof, proof-mismatch.mts).
// killer: apps/bell/scripts/bell-publish.mjs:372 CONST "if (mismatched.has(bundle)) refuse(" -> "if (false) refuse("
test("bell_publish_handoff_refuses_a_bundle_that_no_longer_matches_its_manifest", () => {
  api();
  assert.ok((P.REFUSAL_CODES as readonly string[]).includes("manifest_mismatch"), "manifest_mismatch is in the closed list REFUSAL_CODES");
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, unit(1), 1, 401n, (d) => { writeFileSync(join(d, "TSLAx", "journal.json"), "{}"); });
  appendFileSync(join(b.handoff, unit(1), "TSLAx", "journal.json"), " "); // a file the validation tolerates: only the manifest tells the change
  deposit(b.handoff, unit(2), 2);
  const sha = sha256Hex(readFileSync(join(b.handoff, `${unit(1)}.manifest`), "utf8"));
  // killer: apps/bell/scripts/bell-publish.mjs:293 CONST "manifestOf(path) === text" -> "true"
  const got = cli(b);
  assert.deepEqual([got.code, got.out, got.err], [1, "", `bell/publish: manifest_mismatch: ${unit(1)}: its files no longer match ${unit(1)}.manifest\n`], "exit 1, the refusal named");
  assert.deepEqual(readJsonl(join(b.status, "refused.jsonl")), [{ bundle: unit(1), manifest_sha256: sha, code: "manifest_mismatch", refused_at: new Date(T_PUBLISH + 1).toISOString() }],
    "recorded as every refusal of a bundle: the bundle, the sha256 of its manifest, the code");
  assert.deepEqual([timeline(b).length, readJsonl(join(b.status, "published.jsonl")).map((e) => e.bundle)], [1, [unit(0)]], "unit 0 published before it; the call stops there");
  assert.deepEqual([call(b), readJsonl(join(b.status, "refused.jsonl")).length], [{ status: "awaiting_unit", published: [], awaiting_unit: unit(1) }, 1], "recorded once, never refused again");
  assert.deepEqual(tickRecollects(b), { d: DAYS[1], next: `${unit(1)}-r1`, code: "manifest_mismatch" }, "the tick's own recollectOf reads the line and collects unit 1 again, r1");
});

// G2 of part 3, m-1: a bundle or a manifest the publisher cannot read is not a refusal (the bundle may be good): the call fails by name (the errno of
// the read, exit 1), records nothing, and the tick has nothing to collect again, so the budget of the unit is untouched (RUNBOOK section 21: STOP).
// killer: apps/bell/scripts/bell-publish.mjs:294 CONST "if (!(err instanceof BellPublishError)) throw err; " -> ""
test("bell_publish_handoff_fails_by_name_on_an_unreadable_bundle", (t) => {
  api();
  if (process.platform !== "win32" && process.getuid?.() === 0) { t.skip("root reads a file of mode 000: run as a user that is not root"); return; }
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  const release = unreadable(join(b.handoff, unit(0), "TSLAx", "state.json"));
  let got: ReturnType<typeof io>;
  try { got = cli(b); } finally { release(); }
  assert.deepEqual([got.code, got.out, /^bell\/publish: fatal: E[A-Z]+\n$/.test(got.err)], [1, "", true], `a named failure of the call, never a refusal: ${got.err}`);
  assert.deepEqual([existsSync(join(b.status, "refused.jsonl")), timeline(b).length, existsSync(join(b.state, "publish.lock"))], [false, 0, false], "nothing recorded, nothing published, the lock released");
  assert.equal(tickRecollects(b), null, "no refusal: the tick does not collect unit 0 again, its budget is untouched");
  assert.deepEqual(call(b).published, [{ bundle: unit(0), seq: 1 }], "readable again, the same bundle is published");
  writeRun(join(b.handoff, unit(1)), 1, 402n);
  mkdirSync(join(b.handoff, `${unit(1)}.manifest`)); // a manifest the publisher cannot read (a directory: EISDIR, on every system)
  const again = cli(b);
  assert.deepEqual([again.code, again.err, existsSync(join(b.status, "refused.jsonl"))], [1, "bell/publish: fatal: EISDIR\n", false], "an unreadable manifest: the same named failure");
});

// G2 of part 3, r2-1: the two units do not exclude each other by configuration (RUNBOOK section 21, dated lines), so the purge of a tick
// (apps/bell/src/tick.ts:332, the bundle directory, then its manifest) may remove, between the publisher's listing and its read, a bundle
// published, settled or before the mark. The entry is skipped as if it were not listed, as at the base: no fatal, no refusal, the next unit
// published. The purge runs inside the listing: readdirSync of node:fs replaced, then syncBuiltinESMExports, restored in a finally (the
// reviewer's probe, probe-race.snippet.ts).
// killer: apps/bell/scripts/bell-publish.mjs:294 SDL "if (err?.code === \"ENOENT\") continue; " -> ""
test("bell_publish_handoff_skips_an_entry_purged_after_the_listing", () => {
  api();
  const fsc = createRequire(import.meta.url)("node:fs") as { readdirSync: unknown }, real = fsc.readdirSync as (...a: unknown[]) => unknown;
  /** Unit 0 published, unit 1 deposited, then one call during which `purge` runs right after the listing of the handoff directory. */
  const raced = (purge: (b: Box) => void): { b: Box; r: P.HandoffResult | undefined } => {
    const b = box(0);
    deposit(b.handoff, unit(0), 0);
    assert.deepEqual(call(b).published, [{ bundle: unit(0), seq: 1 }], "unit 0 published first");
    deposit(b.handoff, unit(1), 1);
    let armed = true, r: P.HandoffResult | undefined;
    fsc.readdirSync = (p: unknown, o?: { withFileTypes?: boolean }): unknown => {
      const listed = real(p, o);
      if (armed && p === b.handoff && o?.withFileTypes === true) { armed = false; purge(b); }
      return listed;
    };
    syncBuiltinESMExports();
    try { assert.doesNotThrow(() => { r = call(b); }, "an entry purged after the listing is skipped: never a failure of the call"); } finally { fsc.readdirSync = real; syncBuiltinESMExports(); }
    assert.equal(armed, false, "non-vacuity: the purge ran inside the call");
    return { b, r };
  };
  const unit1 = { status: "published", published: [{ bundle: unit(1), seq: 2 }] };
  // killer: apps/bell/scripts/bell-publish.mjs:294 SDL "if (err?.code === \"ENOENT\") continue; " -> ""
  const dir = raced((b) => { rmSync(join(b.handoff, unit(0)), { recursive: true, force: true }); }); // the directory of unit 0 gone, its manifest left
  assert.deepEqual([dir.r, existsSync(join(dir.b.status, "refused.jsonl")), timeline(dir.b).length], [unit1, false, 2], "unit 1 published, no refusal recorded");
  // killer: apps/bell/scripts/bell-publish.mjs:291 CONST "err?.code === \"ENOENT\"" -> "false"
  const man = raced((b) => { rmSync(join(b.handoff, `${unit(0)}.manifest`)); }); // the only manifest of unit 0 gone, its directory left
  assert.deepEqual([man.r, existsSync(join(man.b.status, "refused.jsonl")), timeline(man.b).length], [unit1, false, 2], "the same fate");
});

// PXB-1 BELL-ABSTAIN-GATE-1, prevention (i) (PLAN-P4 l.387-393; PLAN-P5 C5-5, lot 5a): the publisher refuses an abstention no_close_ref served
// before its gate, the earliest publication instant of its reference close (earliestPublishUtc(refCloseDateOf(session, the session date of
// its volume entry)), the collector's calendar sessions.ts), as C-in-5 refuses a g_t before its gate. The validation that refuses it is the
// shared one (validateRun: the tick's and the publisher's): the bundle is recorded refused and nothing is published; at its gate the same
// bundle is published. A no_close_ref that no proven join of gaps and volume entries can date is refused at any instant (fail-closed). The
// fixture's runs abstain no_close_ref (collect() is given no close); the base published them at any instant (the publisher dated no abstention).
// killer: apps/bell/scripts/bell-validate.mjs:202 CONST "if (!(gate <= t)) refuse(" -> "if (false) refuse("
test("bell_publish_refuses_an_abstention_served_before_its_gate", () => {
  api();
  const b = box(0), refused = join(b.status, "refused.jsonl");
  deposit(b.handoff, unit(0), 0);
  const st = JSON.parse(readFileSync(join(b.handoff, unit(0), "TSLAx", "state.json"), "utf8")) as { digest: { gaps: Obj[]; volume: Obj[] } };
  const key = (e: Obj): string => `${String(e.symbol)}|${String(e.session)}|${typeof e.regime === "string" ? e.regime : "null"}`, seen = new Map<string, number>();
  const gates = st.digest.gaps.map((g) => { // the k-th gap of a bucket and the k-th volume entry of the same bucket: its session date
    const k = seen.get(key(g)) ?? 0, v = st.digest.volume.filter((x) => key(x) === key(g))[k];
    seen.set(key(g), k + 1);
    return g.abstain === "no_close_ref" && v !== undefined ? earliestPublishUtc(refCloseDateOf(g.session as SessionLabel, String(v.session_date_et))) : -Infinity;
  });
  const gate = Math.max(...gates), first = gates.indexOf(gate);
  assert.ok(Number.isFinite(gate) && gate < T_PUBLISH, "non-vacuity: the fixture's run abstains no_close_ref on a dated session");
  const before = tree(b.handoff);
  assert.throws(() => call(b, { clock: () => gate - 1 }), (e: unknown) => isCode("session_not_yet_publishable")(e)
    && (e as P.BellPublishError).detail === `$.runs[0].state.digest.gaps[${String(first)}].abstain: no_close_ref served before its gate`, "one millisecond before its gate: refused");
  assert.deepEqual([timeline(b).length, readJsonl(refused).map((r) => [r.bundle, r.code])], [0, [[unit(0), "session_not_yet_publishable"]]], "recorded refused, nothing published");
  assert.deepEqual(tree(b.handoff), before, "the handoff directory as it was");
  assert.throws(() => validateBundle(join(b.handoff, unit(0)), BOUNDS, gate - 1), isCode("session_not_yet_publishable"), "the tick's validation refuses it too: the same function");
  const at = box(0);
  deposit(at.handoff, unit(0), 0);
  assert.deepEqual(call(at, { clock: () => gate }).published, [{ bundle: unit(0), seq: 1 }], "at its gate, the same bundle is published");
  // Fail-closed: the volume entries removed and bell_sha sealed again, no join dates the abstention: refused a day after its gate.
  const reseal = (d: string): void => {
    const sp = join(d, "TSLAx", "state.json"), pp = join(d, "TSLAx", "provenance.json"), s = JSON.parse(readFileSync(sp, "utf8")) as Obj, p = JSON.parse(readFileSync(pp, "utf8")) as Obj;
    const dg = s.digest as Obj;
    dg.volume = [];
    s.bell_sha = sha256Hex(canonical(dg));
    p.bellSha = s.bell_sha;
    writeFileSync(sp, JSON.stringify(s, null, 2));
    writeFileSync(pp, JSON.stringify(p, null, 2));
  };
  const noJoin = box(0);
  deposit(noJoin.handoff, unit(0), 0, 365n, reseal);
  assert.throws(() => call(noJoin, { clock: () => gate + DAY_MS }), (e: unknown) => isCode("session_not_yet_publishable")(e)
    && (e as P.BellPublishError).detail === "$.runs[0].state.digest: an abstention no_close_ref and no proven join of gaps and volume entries to date it", "no join, no date: refused");
});

// BELL-PUBLISH-LOCK-RELEASE-1 (PLAN-P5 C5-6, lot 5a; calque of the Dojo's D-SW2 and D-SW3): publish.lock names its holder {pid, boot_id,
// taken_at}, whole as soon as the lock exists; a second writer is refused with the holder's state; --unlock (no key) frees a dead holder and
// returns its record, refuses a live or an unreadable one with nothing written, and says not_locked when there is no lock. A holder of another
// boot is dead even while a process of its pid runs (holderVerdict; the kernel's boot_id, null where it cannot be read: the pid alone).
// killer: apps/bell/scripts/bell-publish.mjs:475 CONST "|| !isRunning(o.pid) ?" -> "|| false ?"
test("bell_publish_lock_names_its_holder_and_unlock_frees_only_a_dead_one", async () => {
  api();
  const b = box(0), lock = join(b.state, "publish.lock"), unlock = (): ReturnType<typeof io> => io(() => P.runCli(["--unlock", "--state", b.state]));
  const json = (s: unknown): Obj | null => { try { return JSON.parse(String(s)) as Obj; } catch { return null; } };
  deposit(b.handoff, unit(0), 0);
  let during: unknown = null;
  const fs: P.DurableFs = { ...P.DURABLE_FS, writeSync: (fd, data) => { during ??= existsSync(lock) ? readFileSync(lock, "utf8") : "absent"; P.DURABLE_FS.writeSync(fd, data); } };
  assert.equal(call(b, { fs }).status, "published");
  const rec = json(during);
  assert.ok(rec !== null, `during the call the lock holds a record: ${String(during)}`);
  assert.deepEqual([Object.keys(rec).sort(), rec.pid, rec.boot_id === null || typeof rec.boot_id === "string", new Date(String(rec.taken_at)).toISOString() === rec.taken_at],
    [["boot_id", "pid", "taken_at"], process.pid, true, true], "{pid, boot_id, taken_at}: this process, its boot, an ISO instant");
  assert.equal(existsSync(lock), false, "released by the finally of the call");
  deposit(b.handoff, unit(1), 1);
  const child = spawn(process.execPath, ["-e", "setTimeout(() => {}, 120000)"], { stdio: "ignore" }), exited = once(child, "exit");
  const held = JSON.stringify({ pid: child.pid, boot_id: rec.boot_id, taken_at: new Date().toISOString() }) + "\n";
  try {
    writeFileSync(lock, held); // a live holder of this boot
    assert.throws(() => call(b), (e: unknown) => isCode("lock_held")(e) && (e as P.BellPublishError).detail === "publish.lock: another writer holds the state (running)");
    const u = unlock();
    assert.deepEqual([u.code, u.out, u.err, readFileSync(lock, "utf8")], [1, "", "bell/publish: lock_held: publish.lock: running\n", held], "a live holder is never freed");
  } finally { child.kill(); }
  await exited;
  assert.throws(() => call(b), (e: unknown) => isCode("lock_held")(e) && (e as P.BellPublishError).detail === "publish.lock: another writer holds the state (not running: --unlock releases it)");
  const freed = unlock();
  assert.deepEqual([freed.code, json(freed.out), freed.err, existsSync(lock)], [0, { status: "unlocked", ...json(held) }, "", false], "a dead holder is freed, its record returned");
  assert.deepEqual(call(b).published, [{ bundle: unit(1), seq: 2 }], "the next call takes the lock again and publishes");
  writeFileSync(lock, "another writer\n");
  const unread = unlock();
  assert.deepEqual([unread.code, unread.out, unread.err, readFileSync(lock, "utf8")], [1, "", "bell/publish: lock_held: publish.lock: owner unreadable\n", "another writer\n"]);
  rmSync(lock);
  const none = unlock();
  assert.deepEqual([none.code, none.out, none.err], [0, "{\"status\":\"not_locked\"}\n", ""]);
  const verdict = (P as unknown as Obj).holderVerdict as (o: Obj | null, boot: string | null, isRunning: (pid: number) => boolean) => string;
  assert.equal(typeof verdict, "function", "bell-publish.mjs exports holderVerdict");
  const B1 = "11111111-1111-4111-8111-111111111111", B2 = "22222222-2222-4222-8222-222222222222", me = { pid: process.pid, boot_id: B1, taken_at: new Date().toISOString() };
  assert.deepEqual([verdict(me, B2, () => true), verdict(me, B1, () => true), verdict(me, B1, () => false), verdict(me, null, () => true), verdict({ ...me, boot_id: null }, B2, () => true), verdict(null, B1, () => false)],
    ["not running: --unlock releases it", "running", "not running: --unlock releases it", "running", "running", "owner unreadable"],
    "another boot: dead even while its pid runs; the same boot, or a boot unread on either side: the pid; no record: unreadable");
});
