// U-4b-1b-2 — the AVAL episode selector (u4b-select-episode.mjs). OFFLINE selection (§DISC:31/:42-46/:49-50) + the
// guarded --check-version sub-command (H-1). A SYNTHETIC discover brut in the REAL schema-v2 shape (records +
// block_ts) is built here; block_ts is captured by re-running the SAME pure clustering with a linear tsOf (ts=block*12),
// so every block the selector re-clustering needs is present (a missing one => NAMED refusal, tested). Only
// globalThis.fetch is ever stubbed (D-3); the default `select` mode makes 0 fetch (offline, tested).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, linkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { runSelect, runCheckVersion, runFillTs, reduceSelection, buildSelection, buildARawlogs, compareCandidates, SelectError, SCHEMA, IMPL_V350 } from "../../../scripts/census/u4b/u4b-select-episode.mjs";
import { WETH, clusterWethLiquidations, canon, sha256Hex, type LiquidationRecord } from "../../../scripts/census/u4b/liquidation-logs.mjs";
import { canon as guardCanon, sha256Hex as guardSha } from "../../../scripts/census/u4-guard.mjs";
import { parseArgs } from "../../../scripts/census/u3-realized.mjs";
import { firstBlockAtOrAfter } from "../../../apps/sentinel/src/windows.ts";
import { wordAddr } from "../../../apps/sentinel/src/ukemi/abi.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const LIQR = "0x4444444444444444444444444444444444444444";
const SUSDE = "0x9d39a5de30e57443bff2a8307a4256c8797a3497";
const E2_LO = 23545088, E2_HI = 23557060;
const TS = (b: number): number => b * 12; // linear clock => B_last = firstBlockAtOrAfter(ts+86400) - 1 = B_first + 7199
const PREREG_LF = createLfSha(readFileSync(join(ROOT, "docs", "PLAN-u4b-prereg.md"), "utf8"));

function createLfSha(text: string): string { return sha256Hex(text.replace(/\r\n/g, "\n")); }
const userAddr = (i: number): string => "0x" + i.toString(16).padStart(40, "0");
function mkRec(block: number, logIndex: number, user: string, collateral: string = WETH): LiquidationRecord {
  return { block, logIndex, tx: "0x" + (block * 1000 + logIndex).toString(16).padStart(64, "0"), collateral, debt: DEBT, user, debtToCover: "1000", liquidatedCollateralAmount: "2000", liquidator: LIQR, receiveAToken: false };
}
/** A WETH cluster: `nDistinct` distinct users at bFirst..bFirst+nDistinct-1, plus `dup` extra records of user0 (so
 *  n_members = nDistinct + dup > n_distinct = nDistinct — proves distinct-liquidated counts USERS, not logs). */
function mkCluster(bFirst: number, nDistinct: number, dup = 0): LiquidationRecord[] {
  const recs: LiquidationRecord[] = [];
  for (let i = 0; i < nDistinct; i++) recs.push(mkRec(bFirst + i, 0, userAddr(1000 + i)));
  for (let d = 0; d < dup; d++) recs.push(mkRec(bFirst + nDistinct + d, 0, userAddr(1000))); // user0 again
  return recs;
}

const TO_BLOCK = 23_850_000, FROM_BLOCK = 23_540_000;
const B1 = 23_600_000, B2 = 23_700_000, B3 = 23_800_000, B4 = 23_849_000, B5 = 23_810_000;

/** Build the synthetic discover file (schema v2) with block_ts captured over the FULL record set (as discover does). */
async function makeDiscover(): Promise<{ dir: string; path: string; e2Tx: string; cleanup: () => void }> {
  const e2a = mkRec(E2_LO, 0, userAddr(1)), e2b = mkRec(E2_LO + 12, 0, userAddr(2)); // e2 (excluded)
  const nonWeth = mkRec(B1 + 3, 5, userAddr(9999), SUSDE);                            // non-WETH (never clusters)
  const records = [
    ...mkCluster(B1, 50, 1),  // winner: 50 distinct (+1 dup => 51 members), eligible
    ...mkCluster(B2, 60),     // eligible but B2 > B1 => not the argmin
    ...mkCluster(B3, 49),     // N_min FAIL (49 < 50)
    ...mkCluster(B4, 55),     // window_truncated (B_last = B4+7199 = 23856199 > to_block 23850000)
    ...mkCluster(B5, 40, 15), // H-1 (G2-M7): 55 MEMBERS but 40 DISTINCT users => INELIGIBLE on distinct, NOT truncated
    e2a, e2b, nonWeth,
  ].sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
  const blockTs: Record<string, number> = {};
  // D-BORNE-1 clamp mirrored: block_ts records NO block > to_block (the selector's tsOf returns +Infinity past to_block), so the
  // OFFLINE re-clustering probes the SAME <= to_block path the builder captured (else an end-of-range cluster like B4 would
  // refuse "no ts" for a converge-path block the unclamped builder never recorded). B4 stays window_truncated (b_last=to_block).
  await clusterWethLiquidations(records, (b) => { if (b > TO_BLOCK) return Infinity; blockTs[String(b)] = TS(b); return TS(b); });
  const brut = { schema: "ukemi-u4b-discover/2", event_id: "weth-discover-test", pool: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2", liq_topic: "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286", from_block: FROM_BLOCK, to_block: TO_BLOCK, n_logs: records.length, records, block_ts: blockTs };
  const brutSha = sha256Hex(canon(brut));
  const dir = mkdtempSync(join(tmpdir(), "u4bsel-"));
  const path = join(dir, "discover.json");
  writeFileSync(path, JSON.stringify({ provenance: { brut_sha256: brutSha }, brut, clusters: null, cluster_error: null }, null, 2));
  return { dir, path, e2Tx: e2a.tx, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function selArgs(d: { path: string }, outDir: string, extra: string[] = []): string[] {
  return ["--discover", d.path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", outDir, ...extra];
}

// ============================================================================================================
// (1) determinism + episode shape + counters (§DISC:49/:52, C-4 B_last == labeler recompute), 0 fetch offline.
// ============================================================================================================
test("u4b_episode_selection_is_deterministic", async () => {
  const d = await makeDiscover();
  const o1 = mkdtempSync(join(tmpdir(), "u4bsel-o1-")), o2 = mkdtempSync(join(tmpdir(), "u4bsel-o2-"));
  let fetches = 0; const realFetch = globalThis.fetch;
  globalThis.fetch = (): Promise<Response> => { fetches++; return Promise.reject(new Error("no network in the selector")); };
  try {
    const r1 = await runSelect(selArgs(d, o1));
    const r2 = await runSelect(selArgs(d, o2));
    assert.equal(fetches, 0, "the selector makes 0 fetch (OFFLINE; a fetch here would reject)");
    // byte-identical episode-selection.json AND A-rawlogs across two runs (u4b_episode_selection_is_deterministic).
    assert.equal(readFileSync(r1.out, "utf8"), readFileSync(r2.out, "utf8"), "episode-selection.json is byte-identical across two runs");
    assert.equal(readFileSync(r1.rawOut, "utf8"), readFileSync(r2.rawOut, "utf8"), "A-rawlogs is byte-identical across two runs");
    const file = JSON.parse(readFileSync(r1.out, "utf8")) as { schema: string; episode: { id: string; B_first: number; B_last: number; B0: number; n_distinct: number; collateral: string }; n_eligible: number; window_truncated: number; n_excluded_e2: number; residual_outside_window: number; version_check: string; selection_sha256: string; candidates: Array<{ b_first: number; n_members: number; n_distinct: number; eligible: boolean; reasons: string[] }> };
    assert.equal(file.schema, SCHEMA, "schema pinned");
    // §DISC:49 argmin: the winner is B1 (smallest eligible B_first), NOT B2. §DISC:52 B0 = B_first - 1.
    assert.equal(file.episode.B_first, B1, "argmin B_first picks the earliest eligible cluster (B1), not B2");
    assert.equal(file.episode.B0, B1 - 1, "B0 = B_first - 1 (§DISC:52, the recorder --block)");
    assert.equal(file.episode.n_distinct, 50, "n_distinct counts DISTINCT users (50), not the 51 members");
    assert.equal(file.episode.collateral, WETH, "episode.collateral is the WETH ADDRESS (C-2), never the string 'WETH'");
    assert.equal(file.episode.id, "weth-" + new Date(TS(B1) * 1000).toISOString().slice(0, 10), "episode id = weth-<UTC date of ts(B_first)>");
    assert.equal(file.n_eligible, 2, "two eligible clusters (B1, B2); B3 (n_min) and B4 (truncated) excluded");
    assert.equal(file.window_truncated, 1, "one window_truncated cluster (B4)");
    assert.equal(file.n_excluded_e2, 2, "two e2 records excluded (§DISC:31)");
    assert.equal(file.residual_outside_window, 0, "residual_outside_window == 0 by construction (greedy assigns every WETH record)");
    assert.equal(file.version_check, "pending", "version_check is 'pending' (§DISC:46 is OFFLINE; --check-version fills it)");
    // C-4: reducer B_last == the labeler's independent recompute (firstBlockAtOrAfter(ts(B_first)+86400,…)-1) on same ts.
    const labelerBLast = (await firstBlockAtOrAfter(TS(B1) + 86400, B1, B1 + 60000, (b) => TS(b))) - 1;
    assert.equal(file.episode.B_last, labelerBLast, "reducer B_last == labeler firstBlockAtOrAfter(ts+86400)-1 (C-4)");
    // N_min fail cluster present, eligible=false, reason named.
    const b3 = file.candidates.find((c) => c.b_first === B3)!;
    assert.equal(b3.eligible, false, "B3 (49 distinct) is NOT eligible (N_min=50)");
    assert.match(b3.reasons.join(","), /n_distinct_lt_n_min/, "B3 ineligibility names n_min");
    const b4 = file.candidates.find((c) => c.b_first === B4)!;
    assert.deepEqual(b4.reasons, ["window_truncated"], "B4 ineligibility is window_truncated");
    // H-1 (G2-M7): eligibility is on DISTINCT liquidated users, NOT member count. B5 = 55 members but 40 distinct.
    const b5 = file.candidates.find((c) => c.b_first === B5)!;
    assert.equal(b5.n_members, 55, "B5 has 55 members");
    assert.equal(b5.n_distinct, 40, "B5 has 40 distinct users");
    assert.equal(b5.eligible, false, "B5 is INELIGIBLE (40 distinct < 50) despite 55 members >= 50 (mutant 'eligibility on n_members' reds)");
    assert.match(b5.reasons.join(","), /n_distinct_lt_n_min/, "B5 ineligibility names n_distinct");
  } finally { globalThis.fetch = realFetch; d.cleanup(); rmSync(o1, { recursive: true, force: true }); rmSync(o2, { recursive: true, force: true }); }
});

// ============================================================================================================
// (2) e2 EXCLUSION proven: an in-e2-window log appears in NO cluster / NOT in A-rawlogs (§DISC:31).
// ============================================================================================================
test("u4b_select_excludes_the_e2_window", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-e2-"));
  try {
    const r = await runSelect(selArgs(d, o));
    const raw = readFileSync(r.rawOut, "utf8");
    assert.ok(!raw.includes(d.e2Tx), "the e2 record's tx is NOT in A-rawlogs (e2 EXCLUDED, §DISC:31)");
    const file = JSON.parse(readFileSync(r.out, "utf8")) as { candidates: Array<{ b_first: number; b_last: number }> };
    for (const c of file.candidates) assert.ok(!(E2_LO >= c.b_first && E2_LO <= c.b_last), `no candidate window covers the e2 block ${E2_LO}`);
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

// ============================================================================================================
// (3) fail-closed guards: --out under fixtures, brut_sha256 altered, prereg-sha false, missing block_ts (NAMED).
// ============================================================================================================
test("u4b_select_refuses_out_under_fixtures", async () => {
  const d = await makeDiscover();
  const evil = join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4b", "evil");
  try {
    await assert.rejects(runSelect(selArgs(d, evil)), /under apps\/sentinel\/test\/fixtures\/; refused/, "--out under apps/sentinel/test/fixtures/ is refused by the fixtures-specific guard (mutant A-M10 => the generic out-of-repo message => this reds)");
    assert.ok(!existsSync(evil), "the refusal writes NOTHING under fixtures (guard is pre-write)");
  } finally { d.cleanup(); rmSync(evil, { recursive: true, force: true }); } // clean up if a mutant (A-M10) wrote here
});

test("u4b_select_refuses_out_under_repo_root", async () => {
  const d = await makeDiscover();
  const underRepo = join(ROOT, `u4bsel-under-repo-${String(process.pid)}`); // under the repo but NOT under fixtures (C-V-7)
  try {
    await assert.rejects(runSelect(selArgs(d, underRepo)), /under the repo root/, "--out under the repo root (not fixtures) is refused fail-closed (C-V-7, like the prober --raws-dir)");
  } finally { d.cleanup(); rmSync(underRepo, { recursive: true, force: true }); }
});

test("u4b_select_refuses_a_tampered_brut_sha256", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-tam-"));
  try {
    const df = JSON.parse(readFileSync(d.path, "utf8")) as { provenance: { brut_sha256: string }; brut: { records: Array<{ debtToCover: string }> } };
    df.brut.records[0]!.debtToCover = "999999"; // mutate the brut WITHOUT updating the carried sha
    writeFileSync(d.path, JSON.stringify(df));
    await assert.rejects(runSelect(selArgs(d, o)), /brut_sha256 mismatch/, "a brut whose recomputed sha != carried sha is refused (mutant 'brut sha check removed' reds)");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_select_refuses_a_tampered_block_ts_extra_sidecar", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-bte-"));
  try {
    const df = JSON.parse(readFileSync(d.path, "utf8")) as { provenance: { brut_sha256: string } };
    const sidecar = { schema: "ukemi-u4b-block-ts-extra/1", discover_sha: df.provenance.brut_sha256, n_extra: 0, block_ts_extra: {}, block_ts_extra_sha256: "deadbeef".repeat(8) }; // WRONG sha
    const scPath = join(o, "block-ts-extra.json");
    writeFileSync(scPath, JSON.stringify(sidecar));
    await assert.rejects(runSelect([...selArgs(d, join(o, "sel")), "--block-ts-extra", scPath]), /block_ts_extra_sha256 mismatch/, "a tampered block-ts-extra sidecar (C-2) is refused fail-closed");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_select_refuses_a_block_ts_extra_sidecar_from_another_brut", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-bte2-"));
  try {
    // sidecar whose self-sha is VALID but whose discover_sha points at a DIFFERENT brut (C-V-8, V-M12).
    const sidecar = { schema: "ukemi-u4b-block-ts-extra/1", discover_sha: "f".repeat(64), n_extra: 0, block_ts_extra: {}, block_ts_extra_sha256: sha256Hex(canon({})) };
    const scPath = join(o, "block-ts-extra.json");
    writeFileSync(scPath, JSON.stringify(sidecar));
    await assert.rejects(runSelect([...selArgs(d, join(o, "sel")), "--block-ts-extra", scPath]), /sidecar belongs to another brut/, "a sidecar bound to another brut's discover_sha is refused (C-V-8, V-M12 reds)");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_fill_ts_and_select_refuse_a_paid_operator_and_an_interrupted_brut", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-cv9-")), ledger = mkdtempSync(join(tmpdir(), "u4bsel-cv9l-"));
  try {
    // C-V-9(i): --fill-ts is keyless-only by code — a paid 'chainstack' is refused (assertKeylessOperators).
    await assert.rejects(runFillTs(["--fill-ts", "--discover", d.path, "--out", join(o, "fill"), "--operators", "drpc.org,chainstack", "--ledger-dir", ledger, "--cycle", "c", "--max-calls", "10", "--method-caps", '{"eth_getBlockByNumber":10}'], { env: {}, now: () => 1 }), /not a keyless|KEYLESS-ONLY/, "--fill-ts refuses a paid operator (C-V-9(i))");
    // C-V-9(ii): an interrupted (getlogs-only) brut is refused by name by BOTH runSelect and runFillTs.
    const df = JSON.parse(readFileSync(d.path, "utf8")) as { brut: Record<string, unknown> };
    df.brut.phase = "getlogs-only";
    const interrupted = join(o, "interrupted.json");
    writeFileSync(interrupted, JSON.stringify(df));
    const iArgs = ["--discover", interrupted, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(o, "sel")];
    await assert.rejects(runSelect(iArgs), /discover interrupted|not 'complete'/, "runSelect refuses a getlogs-only brut by name (C-V-9(ii))");
    await assert.rejects(runFillTs(["--fill-ts", "--discover", interrupted, "--out", join(o, "fill2"), "--operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledger, "--cycle", "c2", "--max-calls", "10", "--method-caps", '{"eth_getBlockByNumber":10}'], { env: {}, now: () => 1 }), /discover interrupted|not 'complete'/, "runFillTs refuses a getlogs-only brut by name (C-V-9(ii))");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

test("u4b_select_refuses_a_false_prereg_sha", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-pre-"));
  try {
    await assert.rejects(runSelect(["--discover", d.path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", "deadbeef".repeat(8), "--out", o]), /prereg-sha .* != LF sha/, "a wrong --prereg-sha is refused (order proof)");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_select_refuses_by_name_a_brut_missing_a_block_ts", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-ts-"));
  try {
    const df = JSON.parse(readFileSync(d.path, "utf8")) as { provenance: { brut_sha256: string }; brut: Record<string, unknown> };
    const bt = df.brut.block_ts as Record<string, number>;
    delete bt[String(B1)]; // drop the ts of a needed block (B_first of the winner cluster)
    df.provenance.brut_sha256 = sha256Hex(canon(df.brut)); // re-sha so we reach the tsOf refusal, not the sha guard
    writeFileSync(d.path, JSON.stringify(df));
    await assert.rejects(runSelect(selArgs(d, o)), (e: unknown) => e instanceof SelectError && /brut has no ts for block .*--fill-ts.*--block-ts-extra/.test(e.message), "a missing block_ts is a NAMED refusal pointing to --fill-ts / --block-ts-extra (C-2), NEVER a network read");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

// ============================================================================================================
// (4) argmin + §DISC:50 tie-break comparator (defensive; unreachable by construction) — tested directly.
// ============================================================================================================
test("u4b_select_argmin_and_tiebreak_comparator", () => {
  const mk = (b_first: number, n_distinct: number, addr_min: string) => ({ b_first, b_last: 0, b0: 0, n_members: 0, n_distinct, addr_min, eligible: true, reasons: [] });
  // (i) argmin B_first dominates (mutant 'b.b_first - a.b_first' => this reds).
  assert.ok(compareCandidates(mk(100, 1, "0xff"), mk(200, 9, "0x00")) < 0, "lower B_first wins regardless of n_distinct");
  // tie on B_first => larger n_distinct wins (mutant 'a.n_distinct - b.n_distinct' => reds).
  assert.ok(compareCandidates(mk(100, 60, "0xff"), mk(100, 50, "0x00")) < 0, "on equal B_first, larger n_distinct wins");
  // tie on B_first AND n_distinct => min address wins.
  assert.ok(compareCandidates(mk(100, 50, "0x0a"), mk(100, 50, "0x0b")) < 0, "on equal B_first + n_distinct, min address wins");
  assert.deepEqual([mk(200, 1, "z"), mk(100, 1, "z")].sort(compareCandidates).map((c) => c.b_first), [100, 200], "sort puts argmin first");
});

// ============================================================================================================
// (5) C-2/C-4 composition: the labeler parseArgs reads the selector's OWN events-<id>.json file (the ARRAY), and a
// CALQUE of its :548 predicate (reimplemented here, NOT imported) returns the cluster.
// ============================================================================================================
test("u4b_select_events_compose_with_the_labeler_parseArgs_and_predicate", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-cmp-"));
  try {
    const r = await runSelect(selArgs(d, o));
    const file = JSON.parse(readFileSync(r.out, "utf8")) as { events_file: string; events_sha256: string; episode: { B_first: number }; candidates: Array<{ b_first: number; n_members: number }> };
    // C-4: feed the REAL frozen labeler parser (u3-realized.mjs parseArgs) the events-<id>.json the SELECTOR wrote (the
    // ARRAY that parseEventsFile expects) — episode-selection.json (an OBJECT) would be refused by parseEventsFile.
    assert.equal(r.eventsOut.endsWith(file.events_file), true, "events_file names the events-<id>.json the selector wrote");
    assert.equal(createHash("sha256").update(readFileSync(r.eventsOut)).digest("hex"), file.events_sha256, "events_sha256 == RAW sha256 of the events file BYTES the labeler reads (C-V-4: a tampered events file is caught)");
    const parsed = parseArgs(["--events", r.eventsOut]).events as Array<{ id: string; collateral: string; clusterLo: number; clusterHi: number; preV33: boolean }>;
    assert.equal(parsed.length, 1, "the labeler parseEventsFile accepts exactly one fresh event from events-<id>.json");
    assert.equal(parsed[0]!.collateral, WETH, "the parsed collateral is the WETH ADDRESS (mutant collateral:'WETH' string => this reds)");
    assert.equal(parsed[0]!.preV33, false, "C-V-5: preV33 is false (preV33=true would make the labeler SKIP DeficitCreated, amputating Y; mutant V-M7/G2 reds)");
    // a CALQUE of the labeler's :548 predicate (reimplemented, not imported) over the A-rawlogs rows returns EXACTLY the
    // cluster members (n_members).
    const rawRows = readFileSync(r.rawOut, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as { collateral: string; block: number });
    const ev = parsed[0]!;
    const cluster = rawRows.filter((row) => row.collateral.toLowerCase() === ev.collateral.toLowerCase() && row.block >= ev.clusterLo && row.block <= ev.clusterHi);
    const winnerMembers = file.candidates.find((c) => c.b_first === file.episode.B_first)!.n_members;
    assert.ok(cluster.length > 0, "the :548-calque predicate finds a NON-EMPTY cluster in A-rawlogs");
    assert.equal(cluster.length, winnerMembers, "the :548-calque returns EXACTLY the winner's n_members (C-2; mutant 'WETH' string => 0 => reds)");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

// ============================================================================================================
// (6) C-3: A-rawlogs raw sha256 == the file bytes, and the record shape is the labeler's (block/logIndex/…).
// ============================================================================================================
test("u4b_select_writes_A_rawlogs_with_a_matching_raw_sha256", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-raw-"));
  try {
    const r = await runSelect(selArgs(d, o));
    const file = JSON.parse(readFileSync(r.out, "utf8")) as { rawlogs_sha256: string; rawlogs_file: string };
    const rawBytes = readFileSync(r.rawOut);
    assert.equal(createHash("sha256").update(rawBytes).digest("hex"), file.rawlogs_sha256, "rawlogs_sha256 == RAW sha256 of the A-rawlogs bytes (labeler compares update(rawBuf))");
    assert.equal(r.rawOut.endsWith(file.rawlogs_file), true, "rawlogs_file names the A-rawlogs-<id>.jsonl file");
    const rows = rawBytes.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>);
    assert.deepEqual(Object.keys(rows[0]!), ["block", "logIndex", "tx", "collateral", "debt", "user", "debtToCover", "liquidatedCollateralAmount", "liquidator", "receiveAToken"], "A-rawlogs record shape == decodeLiquidationCall (labeler :614)");
    // G2-M8 real guard: buildARawlogs SORTS its input (the sha test alone can't catch a sort removal — it is
    // self-consistent). On UNSORTED input the sort is load-bearing; a mutant 'sort removed' leaves it unsorted => reds.
    const unsorted: LiquidationRecord[] = [mkRec(B1 + 5, 1, userAddr(2)), mkRec(B1, 0, userAddr(1)), mkRec(B1 + 5, 0, userAddr(3))];
    const rows2 = buildARawlogs(unsorted).split("\n").filter(Boolean).map((l) => JSON.parse(l) as { block: number; logIndex: number });
    assert.deepEqual(rows2.map((x) => [x.block, x.logIndex]), [[B1, 0], [B1 + 5, 0], [B1 + 5, 1]], "buildARawlogs sorts by (block, logIndex) even on unsorted input");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); }
});

// ============================================================================================================
// (7) --check-version (H-1 / C-5 / C-6): guarded quorum-2 eth_getStorageAt fills version_check; sha UNCHANGED.
// ============================================================================================================
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
function storageStub(word32: string): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return (_input, init) => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string };
    if (req.method === "eth_getStorageAt") return Promise.resolve(jrpc(word32));
    return Promise.resolve(jrpc(null));
  };
}
async function withFetch(stub: (i: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
const verArgs = (sel: string, ledger: string, cycle: string, extra: string[] = []): string[] =>
  ["--check-version", "--episode-file", sel, "--operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledger, "--cycle", cycle, "--max-calls", "50", "--method-caps", '{"eth_getStorageAt":10}', ...extra];

test("u4b_check_version_true_on_v350_and_leaves_selection_sha_unchanged", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-v1-")), ledger = mkdtempSync(join(tmpdir(), "u4bsel-l1-"));
  try {
    const r = await runSelect(selArgs(d, o));
    const before = JSON.parse(readFileSync(r.out, "utf8")) as { selection_sha256: string };
    let res: { versionOk: boolean; impl: string } | undefined;
    await withFetch(storageStub("0x" + wordAddr(IMPL_V350)), async () => {
      res = await runCheckVersion(verArgs(r.out, ledger, "u4bsel-v1"), { env: {}, now: () => 1_700_000_000_000 });
    });
    assert.equal(res!.versionOk, true, "impl == v3.5.0 => version_ok true");
    assert.equal(res!.impl, IMPL_V350, "the decoded impl address == v3.5.0");
    const after = JSON.parse(readFileSync(r.out, "utf8")) as { selection_sha256: string; version_check: { status: string; version_ok: boolean; impl: string; block: number } };
    assert.equal(after.selection_sha256, before.selection_sha256, "selection_sha256 is UNCHANGED by --check-version (C-5)");
    assert.equal(after.version_check.status, "checked", "version_check filled");
    assert.equal(after.version_check.version_ok, true, "version_check.version_ok true");
    assert.equal(after.version_check.impl, IMPL_V350, "version_check records the impl");
    assert.equal(after.version_check.block, B1, "version_check probed episode.B_first");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

test("u4b_check_version_false_stops_H1_unless_neutral_ref", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-v2-")), ledger = mkdtempSync(join(tmpdir(), "u4bsel-l2-"));
  const otherImpl = "0x1234567890123456789012345678901234567890";
  try {
    const r = await runSelect(selArgs(d, o));
    let res: { versionOk: boolean } | undefined;
    await withFetch(storageStub("0x" + wordAddr(otherImpl)), async () => {
      res = await runCheckVersion(verArgs(r.out, ledger, "u4bsel-v2"), { env: {}, now: () => 1_700_000_000_000 });
    });
    assert.equal(res!.versionOk, false, "impl != v3.5.0 AND no --version-neutral-ref => version_ok FALSE (STOP H-1, mutant 'if(!versionOk)->if(false)' reds)");
    const after = JSON.parse(readFileSync(r.out, "utf8")) as { version_check: { version_ok: boolean; impl: string } };
    assert.equal(after.version_check.version_ok, false, "the false verdict is persisted (traceable, PR-U4-3-bis)");
    // the --version-neutral-ref path (diff [lu] declared NEUTRE) flips it to true, recording the ref.
    let res2: { versionOk: boolean } | undefined;
    await withFetch(storageStub("0x" + wordAddr(otherImpl)), async () => {
      res2 = await runCheckVersion(verArgs(r.out, ledger, "u4bsel-v2b", ["--version-neutral-ref", "PR-U4-3-bis-diff.md"]), { env: {}, now: () => 1_700_000_000_000 });
    });
    assert.equal(res2!.versionOk, true, "--version-neutral-ref declares the diff neutral => version_ok true (§DISC:56)");
    const after2 = JSON.parse(readFileSync(r.out, "utf8")) as { version_check: { neutral_ref: string } };
    assert.equal(after2.version_check.neutral_ref, "PR-U4-3-bis-diff.md", "the neutral ref is recorded in provenance");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

test("u4b_check_version_refuses_a_tampered_selection_sha_with_zero_fetch", async () => {
  const d = await makeDiscover();
  const o = mkdtempSync(join(tmpdir(), "u4bsel-v3-")), ledger = mkdtempSync(join(tmpdir(), "u4bsel-l3-"));
  try {
    const r = await runSelect(selArgs(d, o));
    const f = JSON.parse(readFileSync(r.out, "utf8")) as { episode: { B_first: number } };
    f.episode.B_first = f.episode.B_first + 1; // tamper the sha'd payload without updating selection_sha256
    writeFileSync(r.out, JSON.stringify(f));
    let fetches = 0;
    await withFetch(((): Promise<Response> => { fetches++; return Promise.resolve(jrpc(null)); }), async () => {
      await assert.rejects(runCheckVersion(verArgs(r.out, ledger, "u4bsel-v3"), { env: {}, now: () => 1_700_000_000_000 }), /selection_sha256 mismatch/, "a tampered episode-selection.json is refused BEFORE any read");
    });
    assert.equal(fetches, 0, "the sha refusal does 0 fetch (fail-closed pre-flight)");
  } finally { d.cleanup(); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

// ============================================================================================================
// (8) reduceSelection pure core + buildSelection H-0 (no eligible cluster) fail-closed.
// ============================================================================================================
test("u4b_reduce_selection_reports_counters_and_H0", async () => {
  const d = await makeDiscover();
  try {
    const df = JSON.parse(readFileSync(d.path, "utf8")) as { brut: { block_ts: Record<string, number>; records: Array<{ collateral: string }> } };
    const census = await reduceSelection({ brut: df.brut as never, nMin: 50, e2Window: [E2_LO, E2_HI], bHi: TO_BLOCK });
    assert.equal(census.candidates.length, 5, "five WETH clusters discovered (e2 excluded)");
    assert.equal(census.winner!.b_first, B1, "winner is B1");
    assert.equal(census.residualOutsideWindow, 0, "residual 0 (greedy assigns every WETH record)");
    // H-0: raise N_min above every cluster => no eligible => buildSelection throws no_fresh_episode (named).
    const census2 = await reduceSelection({ brut: df.brut as never, nMin: 100000, e2Window: [E2_LO, E2_HI], bHi: TO_BLOCK });
    assert.throws(() => buildSelection({ census: census2, preregSha: "x", discoverSha: "y", e2Window: [E2_LO, E2_HI], nMin: 100000, bHi: TO_BLOCK }), /H-0 no_fresh_episode/, "no eligible cluster => H-0 named refusal (never an empty episode)");
  } finally { d.cleanup(); }
});

// ============================================================================================================
// (9) canon PARITY: u4-guard's canon/sha256Hex (which the allowlist-bound prober uses to verify selection_sha256)
// is BYTE-IDENTICAL to liquidation-logs' canon/sha256Hex (which the reducer uses to PRODUCE it). Pins the two copies.
// ============================================================================================================
test("u4guard_canon_matches_liquidation_logs_canon", () => {
  const vectors = [
    { z: 1, a: [3, 2, 1], nested: { k2: "v", k1: [{ b: false, a: null }, 7] }, s: "x\"\\y/" },
    { schema: SCHEMA, episode: { collateral: WETH, B0: 23545087, B_last: 23552238 }, arr: [] },
    [], {}, "plain", 42, null, true,
  ];
  for (const v of vectors) {
    assert.equal(guardCanon(v), canon(v), `u4-guard canon must match liquidation-logs canon (prober vs reducer sha parity) for ${JSON.stringify(v)}`);
    assert.equal(guardSha(guardCanon(v)), sha256Hex(canon(v)), "u4-guard sha256Hex(canon) must match liquidation-logs sha256Hex(canon)");
  }
});

// ============================================================================================================
// (10) U-4b-1b-3 — `--fill-ts`/`runSelect` beyond to_block WITHOUT network (D-BORNE-1), INCREMENTAL resumable sidecar,
// quorum-2 tolerates a transient 429. Only globalThis.fetch is ever stubbed. Mutants: F:\tmp\u4b1b3\mutants.mjs.
// ============================================================================================================
const FROM = 22_803_459;
function writeDiscoverFile(dir: string, records: LiquidationRecord[], toBlock: number, blockTs: Record<string, number>): string {
  const sorted = records.slice().sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
  const brut = { schema: "ukemi-u4b-discover/2", phase: "complete", event_id: "weth-u4b1b3-test", pool: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2", liq_topic: "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286", from_block: FROM, to_block: toBlock, n_logs: sorted.length, records: sorted, block_ts: blockTs };
  const brutSha = sha256Hex(canon(brut));
  const path = join(dir, "discover.json");
  writeFileSync(path, JSON.stringify({ provenance: { brut_sha256: brutSha }, brut, clusters: null, cluster_error: null }, null, 2));
  return path;
}
/** block_ts built with the SAME to_block clamp the selector uses (records NO block > to_block), so the offline
 *  re-clustering finds every <= to_block block on its converge path (D-BORNE-1; else an end-of-range cluster refuses "no ts"). */
async function clampedBlockTs(records: LiquidationRecord[], toBlock: number): Promise<Record<string, number>> {
  const bt: Record<string, number> = {};
  await clusterWethLiquidations(records, (b) => { if (b > toBlock) return Infinity; bt[String(b)] = TS(b); return TS(b); });
  return bt;
}
/** eth_getBlockByNumber stub (ts=block*12). `failBeyond`: a block > N returns null (non-existent => asBlock "malformed
 *  block" => quorum fail). `failAfterDistinct`: null once N distinct blocks were served (a kill). `transient429`: the
 *  FIRST call to an operator whose URL includes that string returns HTTP 429, then 200 (a transient the pool retry heals).
 *  `onFresh(n, before)` (pli, D-4 additive): called on the FIRST request of each not-yet-served block, `before` = the
 *  distinct blocks already served - lets a test observe the DISK mid-run (clustering, binary search and quorum-2 are all
 *  sequential awaits, so at before=50 the 50th ts has resolved and its synchronous periodic flush has run). */
function blockStub(opts: { failBeyond?: number; failAfterDistinct?: number; transient429?: string; onFresh?: (n: number, before: number) => void } = {}): { stub: (i: string | URL, init?: RequestInit) => Promise<Response>; distinct: Set<number>; maxQueried: () => number } {
  const distinct = new Set<number>(); let maxQ = -1; let rl = false;
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method !== "eth_getBlockByNumber") return Promise.resolve(jrpc(null));
    const n = parseInt(String(req.params[0]), 16); if (n > maxQ) maxQ = n;
    if (opts.onFresh !== undefined && !distinct.has(n)) opts.onFresh(n, distinct.size);
    if (opts.transient429 !== undefined && String(input).includes(opts.transient429) && !rl) { rl = true; return Promise.resolve(new Response("rate limited", { status: 429 })); }
    if (opts.failBeyond !== undefined && n > opts.failBeyond) return Promise.resolve(jrpc(null));
    if (opts.failAfterDistinct !== undefined && !distinct.has(n) && distinct.size >= opts.failAfterDistinct) return Promise.resolve(jrpc(null));
    distinct.add(n);
    return Promise.resolve(jrpc({ hash: "0x" + n.toString(16).padStart(64, "0"), number: String(req.params[0]), timestamp: "0x" + (n * 12).toString(16) }));
  };
  return { stub, distinct, maxQueried: () => maxQ };
}
const fillArgs = (discover: string, out: string, ledger: string, cycle: string, ops = "drpc.org,mevblocker.io,tenderly.co"): string[] =>
  ["--fill-ts", "--discover", discover, "--out", out, "--operators", ops, "--ledger-dir", ledger, "--cycle", cycle, "--max-calls", "1000000", "--method-caps", '{"eth_getBlockByNumber":1000000}', "--min-interval-ms", "0"];
const OFF = (): Promise<Response> => Promise.reject(new Error("offline: the selector reads NO network"));

test("u4b_select_marks_a_to_block_minus_1000_cluster_window_truncated_offline_0_fetch", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4btr-")), o = mkdtempSync(join(tmpdir(), "u4btr-o-"));
  try {
    const toBlock = 24_000_000;
    const records = [...mkCluster(23_700_000, 50), ...mkCluster(toBlock - 1000, 55)]; // early COMPLETE winner + end-of-range
    const path = writeDiscoverFile(dir, records, toBlock, await clampedBlockTs(records, toBlock));
    let fetches = 0; const real = globalThis.fetch;
    globalThis.fetch = (): Promise<Response> => { fetches++; return Promise.reject(new Error("offline")); };
    try {
      const r = await runSelect(["--discover", path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", o], { env: {}, now: () => 1 });
      const file = JSON.parse(readFileSync(r.out, "utf8")) as { episode: { B_first: number }; window_truncated: number; candidates: Array<{ b_first: number; b_last: number; eligible: boolean; reasons: string[] }> };
      assert.equal(fetches, 0, "0 network: the +Infinity clamp resolves blocks past to_block WITHOUT a fetch (D-BORNE-1; mutant 'clamp removed' => 'no ts' refusal reds)");
      assert.equal(file.episode.B_first, 23_700_000, "winner is the early COMPLETE cluster, not the truncated one");
      const eor = file.candidates.find((c) => c.b_first === toBlock - 1000)!;
      assert.equal(eor.b_last, toBlock, "the end-of-range b_last is CLAMPED to to_block (the resolvable bound)");
      assert.deepEqual(eor.reasons, ["window_truncated"], "the to_block-1000 cluster is window_truncated (24h boundary unconfirmable within [.., to_block]; mutant 'drop b_last>=toBlock' => eligible reds)");
      assert.equal(eor.eligible, false, "a window_truncated cluster is NOT eligible");
      assert.equal(file.window_truncated, 1, "exactly one window_truncated cluster");
    } finally { globalThis.fetch = real; }
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_fill_ts_resolves_a_to_block_minus_1000_cluster_with_0_fetch_past_to_block", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bfb-")), o = mkdtempSync(join(tmpdir(), "u4bfb-o-")), ledger = mkdtempSync(join(tmpdir(), "u4bfb-l-"));
  try {
    const toBlock = 24_000_000;
    const path = writeDiscoverFile(dir, mkCluster(toBlock - 1000, 3), toBlock, {}); // empty block_ts => fill-ts must fetch
    const s = blockStub({ failBeyond: toBlock }); // a block > to_block returns null (non-existent) => malformed if ever probed
    let res: { nExtra: number; phase: string } | undefined;
    await withFetch(s.stub, async () => { res = await runFillTs(fillArgs(path, join(o, "fill"), ledger, "fb"), { env: {}, now: () => 1 }); });
    assert.equal(res!.phase, "complete", "fill-ts COMPLETES with no malformed-block STOP (mutant 'clamp removed' => probes past to_block => null => NoQuorum reds)");
    assert.ok(s.maxQueried() <= toBlock, `0 fetch past to_block: max queried block ${s.maxQueried()} <= to_block ${toBlock}`);
    assert.ok(res!.nExtra > 0, "fill-ts did fetch the <= to_block window blocks");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

test("u4b_fill_ts_is_incremental_and_resumable_after_a_quorum_kill", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bkr-")), o = mkdtempSync(join(tmpdir(), "u4bkr-o-"));
  try {
    const toBlock = 26_000_000;
    const records = [23_000_000, 23_200_000, 23_400_000, 23_600_000, 23_800_000].flatMap((b) => mkCluster(b, 2)); // >60 distinct fetches, all <= to_block
    const path = writeDiscoverFile(dir, records, toBlock, {});
    const out = join(o, "fill"), scPath = join(out, "block-ts-extra.json");
    // (1) KILL after 60 distinct ts (NoQuorum on the 61st): the partial is DURABLE on disk.
    const k = blockStub({ failAfterDistinct: 60 }); const l1 = mkdtempSync(join(tmpdir(), "u4bkr-l1-"));
    let killErr: unknown = null;
    await withFetch(k.stub, async () => { try { await runFillTs(fillArgs(path, out, l1, "kill"), { env: {}, now: () => 1 }); } catch (e) { killErr = e; } });
    rmSync(l1, { recursive: true, force: true });
    assert.ok(killErr instanceof Error, "the 61st-block quorum fail stops the run");
    assert.ok(existsSync(scPath), "a DURABLE partial sidecar persists after the kill (mutant 'flush skips partial' => no file reds)");
    const partial = JSON.parse(readFileSync(scPath, "utf8")) as { phase: string; n_extra: number; block_ts_extra: Record<string, number>; block_ts_extra_sha256: string };
    assert.equal(partial.phase, "partial", "the interrupted sidecar is phase 'partial'");
    assert.equal(partial.n_extra, 60, "the partial holds exactly the 60 ts fetched before the kill");
    assert.equal(sha256Hex(canon(partial.block_ts_extra)), partial.block_ts_extra_sha256, "the partial self-sha is valid");
    // (2) RESUME: completes fetching ONLY the remaining blocks (the 60 partial ts are cached, not re-fetched).
    const rs = blockStub({}); const l2 = mkdtempSync(join(tmpdir(), "u4bkr-l2-"));
    let res: { nExtra: number; phase: string } | undefined;
    await withFetch(rs.stub, async () => { res = await runFillTs(fillArgs(path, out, l2, "resume"), { env: {}, now: () => 1 }); });
    rmSync(l2, { recursive: true, force: true });
    assert.equal(res!.phase, "complete", "the resumed run completes");
    assert.ok(res!.nExtra > 60, "the complete sidecar has more ts than the 60-entry partial");
    assert.equal(rs.distinct.size, res!.nExtra - 60, "resume re-fetched ONLY the remaining blocks (mutant 'resume seeding removed' => refetches all => size==nExtra reds)");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(o, { recursive: true, force: true }); }
});

test("u4b_fill_ts_writes_complete_which_select_accepts_and_select_refuses_a_partial", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bph-")), o = mkdtempSync(join(tmpdir(), "u4bph-o-")), ledger = mkdtempSync(join(tmpdir(), "u4bph-l-"));
  try {
    const toBlock = 24_000_000;
    const path = writeDiscoverFile(dir, mkCluster(23_500_000, 50), toBlock, {}); // eligible winner; empty block_ts => fill-ts fetches
    const s = blockStub({});
    let fres: { out: string; phase: string } | undefined;
    await withFetch(s.stub, async () => { fres = await runFillTs(fillArgs(path, join(o, "fill"), ledger, "ph"), { env: {}, now: () => 1 }); });
    assert.equal(fres!.phase, "complete", "fill-ts writes phase 'complete' at the end (mutant 'final flush partial' => select refuses reds)");
    const sc = JSON.parse(readFileSync(fres!.out, "utf8")) as { phase: string; block_ts_extra: Record<string, number>; block_ts_extra_sha256: string; discover_sha: string; schema: string; n_extra: number };
    assert.equal(sc.phase, "complete", "the sidecar file is phase 'complete'");
    const real = globalThis.fetch; globalThis.fetch = OFF;
    try {
      const sel = await runSelect(["--discover", path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(o, "sel"), "--block-ts-extra", fres!.out], { env: {}, now: () => 1 });
      assert.ok(existsSync(sel.out), "runSelect ACCEPTS a phase:complete sidecar (0 fetch)");
      writeFileSync(fres!.out, JSON.stringify({ ...sc, phase: "partial" }, null, 2) + "\n"); // same data + self-sha, only phase flipped
      await assert.rejects(runSelect(["--discover", path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(o, "sel2"), "--block-ts-extra", fres!.out], { env: {}, now: () => 1 }), /sidecar phase 'partial' is not 'complete'/, "runSelect REFUSES a partial sidecar BY NAME (mutant 'phase check removed' => accepted reds)");
    } finally { globalThis.fetch = real; }
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

test("u4b_fill_ts_quorum2_tolerates_a_transient_429_via_the_bounded_pool_retry", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4b429-")), o = mkdtempSync(join(tmpdir(), "u4b429-o-")), ledger = mkdtempSync(join(tmpdir(), "u4b429-l-"));
  try {
    const path = writeDiscoverFile(dir, mkCluster(23_500_000, 2), 24_000_000, {});
    const s = blockStub({ transient429: "drpc.org" }); // the FIRST eth.drpc.org call 429s, then 200
    let res: { phase: string } | undefined;
    await withFetch(s.stub, async () => { res = await runFillTs(fillArgs(path, join(o, "fill"), ledger, "rt", "drpc.org,mevblocker.io"), { env: {}, now: () => 1 }); });
    assert.equal(res!.phase, "complete", "a transient 429 on one of TWO operators is tolerated by the bounded pool retry; quorum-2 still forms (mutant 'retries:0' => benched => NoQuorum reds)");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(o, { recursive: true, force: true }); rmSync(ledger, { recursive: true, force: true }); }
});

// ============================================================================================================
// (11) U-4b-1b-3 PLI - checkpoint-2 C-V-1 / C-V-2 / C-V-6 and G2 C-G2-1..3 closures, adapted from the reviewers'
// throwaway harnesses (cp2-harness / cp2-lock / cp2-trunc, g2-demo-tests). Only globalThis.fetch is stubbed (D-3); a
// torn or foreign sidecar is written to disk as STATE. Mutants M9..M17 of the lot harness (tap, named killer, A-11).
// ============================================================================================================
const SIDECAR_SCHEMA = "ukemi-u4b-block-ts-extra/1";
const KILL_SET = [23_000_000, 23_200_000, 23_400_000, 23_600_000, 23_800_000]; // the kill test's set: > 60 distinct fetches
const FILL_DEPS = { env: {}, now: (): number => 1 };
type Sidecar = { schema: string; phase?: string; discover_sha: string; n_extra: number; block_ts_extra: Record<string, number>; block_ts_extra_sha256: string };
/** A hand-written sidecar in runFillTs's schema, phase "partial", self-sha of `extra` unless `sha` overrides it. */
const sidecarOf = (discoverSha: string, extra: Record<string, number>, sha: string = sha256Hex(canon(extra))): Sidecar =>
  ({ schema: SIDECAR_SCHEMA, phase: "partial", discover_sha: discoverSha, n_extra: Object.keys(extra).length, block_ts_extra: extra, block_ts_extra_sha256: sha });
/** Every operator lock under a ledger dir: the rpc-guard lock IS the file `<ledger>/<cycle>/<op>.lock` (lock.ts acquireLock). */
const locksUnder = (ledger: string): string[] => readdirSync(ledger, { recursive: true, encoding: "utf8" }).filter((p) => p.endsWith(".lock"));
const brutShaOf = (discoverPath: string): string => (JSON.parse(readFileSync(discoverPath, "utf8")) as { provenance: { brut_sha256: string } }).provenance.brut_sha256;
function scratch(prefix: string): { dir: string; o: string; l: string; done: () => void } {
  const dir = mkdtempSync(join(tmpdir(), `${prefix}-`)), o = mkdtempSync(join(tmpdir(), `${prefix}-o-`)), l = mkdtempSync(join(tmpdir(), `${prefix}-l-`));
  return { dir, o, l, done: () => { for (const x of [dir, o, l]) rmSync(x, { recursive: true, force: true }); } };
}

test("u4b_fill_ts_pre_open_refusals_hold_no_cycle_lock_and_the_same_cycle_relaunches", async () => {
  const w = scratch("u4bpo");
  try {
    const recs = mkCluster(23_500_000, 3);
    const bad = writeDiscoverFile(mkdtempSync(join(w.dir, "bad-")), recs, 24_000_000.5, {}); // non-integer to_block, brut sha re-computed
    const good = writeDiscoverFile(w.dir, recs, 24_000_000, {});
    const out = join(w.o, "fill"), scPath = join(out, "block-ts-extra.json");
    const s = blockStub({});
    await withFetch(s.stub, async () => {
      // (1) cycle c1, to_block guard: refused BEFORE the guard opens (mutant M10 'to_block check after open' => c1 locks held => reds).
      await assert.rejects(runFillTs(fillArgs(bad, out, w.l, "c1"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /brut\.to_block is not an integer/.test(e.message), "a non-integer to_block is refused BY NAME");
      assert.deepEqual(locksUnder(w.l), [], "no operator lock survives the to_block refusal");
      // (2) SAME cycle c1, a FOREIGN resume sidecar: refused BEFORE the guard opens (a lock left by (1) would surface as 'already locked').
      mkdirSync(out, { recursive: true });
      writeFileSync(scPath, JSON.stringify(sidecarOf("f".repeat(64), {})));
      await assert.rejects(runFillTs(fillArgs(good, out, w.l, "c1"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /belongs to another brut/.test(e.message), "the foreign resume sidecar is refused BY NAME, not 'already locked'");
      assert.deepEqual(locksUnder(w.l), [], "no operator lock survives the resume refusal (mutant M9 'resume block after open' => c1 locks held => reds)");
      assert.equal(existsSync(join(w.l, "c1")), false, "the guard never opened: the c1 cycle dir was never created");
      assert.equal(s.distinct.size, 0, "both refusals made 0 fetch");
      // (3) sidecar moved aside: the SAME cycle c1 relaunches and completes (cp-2 probe before the pli: 'already locked for this cycle').
      rmSync(scPath);
      const r = await runFillTs(fillArgs(good, out, w.l, "c1"), FILL_DEPS);
      assert.equal(r.phase, "complete", "the same cycle c1 relaunches after both refusals and completes");
      assert.deepEqual(locksUnder(w.l), [], "the completed run released every operator lock (unlockAll)");
    });
  } finally { w.done(); }
});

test("u4b_fill_ts_refuses_a_torn_sidecar_by_name_with_0_fetch_and_no_lock", async () => {
  const w = scratch("u4btn");
  try {
    const path = writeDiscoverFile(w.dir, mkCluster(23_500_000, 3), 24_000_000, {});
    const out = join(w.o, "fill"), scPath = join(out, "block-ts-extra.json");
    mkdirSync(out, { recursive: true });
    const torn = '{"schema":"ukemi-u4b-block-ts-extra/1","phase":"partial","block_ts_extra":{"235'; // cut mid-write (cp-2 probe of the in-place writer)
    writeFileSync(scPath, torn);
    let fetches = 0;
    await withFetch((): Promise<Response> => { fetches++; return Promise.reject(new Error("offline: no fetch expected")); }, async () => {
      await assert.rejects(runFillTs(fillArgs(path, out, w.l, "c1"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /block-ts-extra sidecar unreadable: /.test(e.message), "a torn sidecar is a NAMED SelectError, never a bare SyntaxError (mutant M11 'bare JSON.parse' => reds)");
    });
    assert.equal(fetches, 0, "refused with 0 fetch");
    assert.deepEqual(locksUnder(w.l), [], "the cycle is not locked: the refusal precedes the guard open");
    assert.equal(readFileSync(scPath, "utf8"), torn, "the torn sidecar is left byte-identical (no flush ran), for the operator to inspect or move aside");
  } finally { w.done(); }
});

test("u4b_fill_ts_flushes_a_durable_partial_every_50_new_ts_observed_mid_run", async () => {
  const w = scratch("u4bpf");
  try {
    const path = writeDiscoverFile(w.dir, KILL_SET.flatMap((b) => mkCluster(b, 2)), 26_000_000, {});
    const out = join(w.o, "fill"), scPath = join(out, "block-ts-extra.json");
    let mid: Sidecar | null | undefined;
    const s = blockStub({ onFresh: (_n, before) => { if (before === 50 && mid === undefined) mid = existsSync(scPath) ? JSON.parse(readFileSync(scPath, "utf8")) as Sidecar : null; } });
    let r: { phase: string; nExtra: number } | undefined;
    await withFetch(s.stub, async () => { r = await runFillTs(fillArgs(path, out, w.l, "pf"), FILL_DEPS); });
    assert.ok(mid, "at the 51st distinct block a sidecar is ALREADY on disk, before any STOP/catch - the hard-kill defence (mutant M12 'FLUSH_EVERY 50 -> 1e9' => none => reds)");
    assert.equal(mid.phase, "partial", "the mid-run sidecar is phase 'partial'");
    assert.equal(mid.n_extra, 50, "it holds exactly the first 50 new ts");
    assert.equal(sha256Hex(canon(mid.block_ts_extra)), mid.block_ts_extra_sha256, "its self-sha is valid: a hard kill at this point resumes from 50");
    assert.equal(r!.phase, "complete", "the run then completes");
    assert.ok(r!.nExtra > 50, "the run fetched past the first periodic flush");
  } finally { w.done(); }
});

test("u4b_fill_ts_replaces_the_sidecar_by_tmp_rename_never_in_place_and_leaves_no_tmp", async () => {
  const w = scratch("u4brn");
  try {
    const path = writeDiscoverFile(w.dir, KILL_SET.flatMap((b) => mkCluster(b, 2)), 26_000_000, {});
    const out = join(w.o, "fill"), scPath = join(out, "block-ts-extra.json"), link = join(w.o, "mid-run-partial.json");
    // Hard-link the periodic partial mid-run: a rename REPLACES the name and leaves the linked file intact; an in-place
    // rewrite would show the final bytes through the link (POSIX link/rename semantics; measured identical on NTFS).
    const s = blockStub({ onFresh: (_n, before) => { if (before === 50 && existsSync(scPath) && !existsSync(link)) linkSync(scPath, link); } });
    let r: { phase: string } | undefined;
    await withFetch(s.stub, async () => { r = await runFillTs(fillArgs(path, out, w.l, "rn"), FILL_DEPS); });
    assert.equal(r!.phase, "complete", "the run completes");
    assert.ok(existsSync(link), "the mid-run partial was hard-linked");
    const linked = JSON.parse(readFileSync(link, "utf8")) as Sidecar;
    assert.equal(linked.phase, "partial", "the linked mid-run file still reads 'partial': later flushes REPLACED the name by rename, never rewrote the file in place (mutant M17 'direct writeFileSync' => 'complete' through the link => reds)");
    assert.equal(linked.n_extra, 50, "the linked file still holds the 50-ts partial");
    assert.equal((JSON.parse(readFileSync(scPath, "utf8")) as Sidecar).phase, "complete", "the name holds the complete sidecar");
    assert.deepEqual(readdirSync(out).filter((f) => f !== "block-ts-extra.json"), [], "no tmp residue in --out after a completed run (every tmp was renamed)");
  } finally { w.done(); }
});

test("u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch", async () => {
  const w = scratch("u4bfx");
  try {
    const path = writeDiscoverFile(w.dir, mkCluster(23_500_000, 3), 24_000_000, {});
    const out = join(w.o, "fill");
    mkdirSync(out, { recursive: true });
    // VALID self-sha and real-shaped data, but bound to ANOTHER brut: the only guard that can refuse it is discover_sha.
    writeFileSync(join(out, "block-ts-extra.json"), JSON.stringify(sidecarOf("f".repeat(64), { "23500000": TS(23_500_000) })));
    const s = blockStub({});
    await withFetch(s.stub, async () => {
      await assert.rejects(runFillTs(fillArgs(path, out, w.l, "fx"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /belongs to another brut/.test(e.message), "a resume on another brut's sidecar is refused BY NAME (C-G2-1 hygiene; mutant M13 'resume discover_sha guard neutralized' => resumes and completes => reds)");
    });
    assert.equal(s.distinct.size, 0, "refused with 0 fetch");
  } finally { w.done(); }
});

test("u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch", async () => {
  const w = scratch("u4bfs");
  try {
    const path = writeDiscoverFile(w.dir, mkCluster(23_500_000, 3), 24_000_000, {});
    const out = join(w.o, "fill");
    mkdirSync(out, { recursive: true });
    // THIS brut's discover_sha, a FALSIFIED ts for a block the clustering needs, the self-sha of the HONEST data (G2: material).
    const honest = { "23500000": TS(23_500_000) }, falsified = { "23500000": TS(23_500_000) + 3600 };
    writeFileSync(join(out, "block-ts-extra.json"), JSON.stringify(sidecarOf(brutShaOf(path), falsified, sha256Hex(canon(honest)))));
    const s = blockStub({});
    await withFetch(s.stub, async () => {
      await assert.rejects(runFillTs(fillArgs(path, out, w.l, "fs"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /self-sha mismatch/.test(e.message), "a falsified resume sidecar is refused BY NAME (C-G2-1 material; mutant M14 'resume self-sha guard neutralized' => the falsified ts seeds the clustering => reds)");
    });
    assert.equal(s.distinct.size, 0, "refused with 0 fetch");
  } finally { w.done(); }
});

test("u4b_fill_ts_rerun_on_a_complete_sidecar_is_idempotent_0_fetch_identical_bytes", async () => {
  const w = scratch("u4bid");
  try {
    const path = writeDiscoverFile(w.dir, mkCluster(23_500_000, 3), 24_000_000, {});
    const out = join(w.o, "fill");
    type Fill = { out: string; nExtra: number; sha: string; phase: string };
    const s1 = blockStub({});
    let r1: Fill | undefined;
    await withFetch(s1.stub, async () => { r1 = await runFillTs(fillArgs(path, out, w.l, "i1"), FILL_DEPS); });
    assert.ok(s1.distinct.size > 0, "the first run fetched");
    const bytes1 = readFileSync(r1!.out, "utf8");
    const s2 = blockStub({});
    let r2: Fill | undefined;
    await withFetch(s2.stub, async () => { r2 = await runFillTs(fillArgs(path, out, w.l, "i2"), FILL_DEPS); });
    assert.equal(s2.distinct.size, 0, "a re-run on a COMPLETE sidecar fetches ZERO blocks (G1 9(b); mutant M15 'a complete sidecar is not reseeded' => refetches => reds)");
    assert.equal(r2!.phase, "complete", "the re-run stays complete");
    assert.equal(r2!.nExtra, r1!.nExtra, "same n_extra");
    assert.equal(r2!.sha, r1!.sha, "same block_ts_extra_sha256");
    assert.equal(readFileSync(r2!.out, "utf8"), bytes1, "the sidecar bytes are identical after the idempotent re-run");
  } finally { w.done(); }
});

test("u4b_select_refuses_a_block_ts_extra_sidecar_without_phase_by_name", async () => {
  const w = scratch("u4bnp");
  try {
    const path = writeDiscoverFile(w.dir, mkCluster(23_500_000, 50), 24_000_000, {}); // an eligible winner
    const s = blockStub({});
    let fres: { out: string } | undefined;
    await withFetch(s.stub, async () => { fres = await runFillTs(fillArgs(path, join(w.o, "fill"), w.l, "np"), FILL_DEPS); });
    const scPath = fres!.out;
    const sc = JSON.parse(readFileSync(scPath, "utf8")) as Sidecar; // a REAL fill-ts sidecar: valid self-sha + THIS brut's discover_sha
    delete sc.phase; // so the only guard left to refuse it is the phase one (it runs after the sha and discover_sha guards)
    writeFileSync(scPath, JSON.stringify(sc, null, 2) + "\n");
    const sel = (d: string): string[] => ["--discover", path, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(w.o, d), "--block-ts-extra", scPath];
    await withFetch(OFF, async () => {
      await assert.rejects(runSelect(sel("sel1"), FILL_DEPS), (e: unknown) => e instanceof SelectError && /sidecar phase absent is not 'complete'/.test(e.message), "a phase-less sidecar is refused BY NAME (C-V-6 / C-G2-3; mutant M16 'absent phase accepted' => reds)");
      writeFileSync(scPath, JSON.stringify({ ...sc, phase: "complete" }, null, 2) + "\n");
      assert.ok(existsSync((await runSelect(sel("sel2"), FILL_DEPS)).out), "the SAME data with phase 'complete' is accepted: the refusal is about phase alone");
    });
  } finally { w.done(); }
});
