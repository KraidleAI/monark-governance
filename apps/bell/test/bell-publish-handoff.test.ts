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
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey } from "node:crypto";
import * as P from "../scripts/bell-publish.mjs";
import { manifestOf } from "../scripts/bell-validate.mjs";
import { keyringOf, sha256Hex } from "../scripts/bell-chain.mjs";
import { dirSource, verifyServed } from "../scripts/bell-verify.mjs";
import { collect } from "../src/collect.ts";
import { tickMain } from "../src/tick.ts";
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

// killer: apps/bell/scripts/bell-publish.mjs:294 CONST "ok = manifestOf(path) === text" -> "ok = true"
test("bell_publish_handoff_ignores_tmp_and_unmanifested_dirs", () => {
  api();
  const b = box(0);
  deposit(b.handoff, unit(0), 0);
  deposit(b.handoff, `.tmp-${unit(1)}`, 1); // a deposit in course, even with a concordant manifest
  deposit(b.handoff, unit(1), 1, 401n, (d) => { writeFileSync(join(d, "TSLAx", "journal.json"), "{}"); });
  appendFileSync(join(b.handoff, unit(1), "TSLAx", "journal.json"), " "); // the bundle no longer matches its manifest
  writeRun(join(b.handoff, unit(1, 1)), 1, 402n); // a revision without its manifest
  deposit(b.handoff, unit(2), 2);
  assert.deepEqual(call(b), { status: "awaiting_unit", published: [{ bundle: unit(0), seq: 1 }], awaiting_unit: unit(1) }, "unit 1 has no candidate: the list stops there");
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

// killer: apps/bell/scripts/bell-publish.mjs:359 CONST "openSync(lock, \"wx\")" -> "openSync(lock, \"w\")"
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
