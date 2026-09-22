// scripts/census/u4b/u4b-select-episode.mjs
// ============================================================================================
// U-4b-1b-2 (prereg §DISC:31/:42-46/:49-50; tuyau ADR `u4b_episode_selection_is_deterministic`) — the AVAL episode
// SELECTOR. It applies the PRE-REGISTERED selection rule to the u4b-discover brut and emits `episode-selection.json`
// (+ `A-rawlogs-<episode_id>.jsonl`), reproducible from (prereg_sha, brut) — the discover `clusters` field is a
// CONSULTATIVE witness (computed WITHOUT e2 exclusion) and is NOT trusted here.
//
// OFFLINE by construction (0 network in the default `select` mode): tsOf comes from `brut.block_ts` (discover schema v2,
// C-1). A needed block <= to_block absent from block_ts is a NAMED refusal (never a network read); a block > to_block is +Infinity (D-n) —
// naming exactly what u4b-discover must persist. Steps: (1) exclude every log with block in e2_window (§DISC:31); (2)
// re-run the PURE `clusterWethLiquidations` on the e2-EXCLUDED set (the authoritative clustering); (3) eligibility
// §DISC:42-46 (WETH ∧ B_last <= B_hi ∧ B_last < to_block else `window_truncated` ∧ distinct-liquidated >= N_min; version_ok OFFLINE ⇒
// `version_check: "pending"`); (4) `argmin B_first`, tie-break §DISC:50; (5) canonical serialization + selection_sha256.
//
// `version_ok` (§DISC:46/:56, H-1) is a SEPARATE `--check-version` sub-command: ONE eth_getStorageAt (EIP-1967 slot)
// quorum-2 keyless via @monark/rpc-guard (metered, budgeted), which fills `version_check` WITHOUT touching
// selection_sha256 (C-5/C-6). impl == v3.5.0 (0x97287a4f…) ⇒ version_ok:true; else false ⇒ STOP H-1 (PR-U4-3-bis),
// unless `--version-neutral-ref <doc>` declares the diff [lu]-neutral (§DISC:56). NEVER auto-advances to a next candidate.
// NO commit, NO workflow (R-20). Provenance: worker claude-opus-4-8[1m], effort max; reviewer = orchestrator (R-21).
// ============================================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute, basename } from "node:path";
import { operatorOf, BudgetExceededError, makeUkemiPool } from "../../../apps/sentinel/src/ukemi/rpc2.ts";
import { POOL } from "../../../apps/sentinel/src/ukemi/clusters.ts";
import { decAddress } from "../../../apps/sentinel/src/ukemi/abi.ts";
import { lfSha256, assertLedgerDir, openU4GuardedClient, makeGuardedPoolCall, unlockAll, distinctLabels } from "../u4-guard.mjs";
import { WETH, clusterWethLiquidations, canon, sha256Hex } from "./liquidation-logs.mjs";
import { assertKeylessOperators } from "./u4b-discover.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", ".."); // scripts/census/u4b -> repo root

export const SCHEMA = "ukemi-u4b-episode-selection/1";
/** §DISC E-I-2: N_min = 50 distinct liquidated accounts per eligible cluster. */
export const DEFAULT_N_MIN = 50;
/** §DISC:27 — e2 = the CONCEPTION cluster, EXCLUDED (never served). Bounds = ADR-U3 D2 / EVENTS[e2] cluster [lo,hi]. */
export const DEFAULT_E2_WINDOW = [23545088, 23557060];
/** EIP-1967 implementation slot = keccak256("eip1967.proxy.implementation") - 1 ([lu] in-repo: u3-realized.mjs:46). */
export const EIP1967_IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
/** Aave v3.5.0 Pool implementation @B_first ([lu] in-repo: ADR-U4-book-et-calibration.md:203, EIP-1967, U3 census C-6). */
export const IMPL_V350 = "0x97287a4f35e583d924f78ad88db8afce1379189a";

/** A NAMED, fail-closed selector refusal (§DISC / P5: never a bare throw, never a network fallback). */
export class SelectError extends Error {}

const lc = (a) => String(a).toLowerCase();
const hexBlock = (n) => "0x" + BigInt(n).toString(16);

/** Comparator implementing §DISC:49-50: (i) argmin B_first (FIRST eligible chronologically); tie-break (B_first
 *  equal) larger distinct-liquidated, then address min. Greedy clustering makes B_first STRICTLY increasing, so the
 *  tie-break is UNREACHABLE by construction - implemented (pre-registered) + tested directly on synthetic candidates as
 *  a DEFENSIVE comparator. "address min" (unspecified in the prereg) = min lowercased liquidated `user` in the cluster. */
export function compareCandidates(a, b) {
  if (a.b_first !== b.b_first) return a.b_first - b.b_first;
  if (a.n_distinct !== b.n_distinct) return b.n_distinct - a.n_distinct;
  return a.addr_min < b.addr_min ? -1 : a.addr_min > b.addr_min ? 1 : 0;
}

/** Min lowercased liquidated `user` among a cluster's members (the §DISC:50 secondary tie-break key). */
function addrMinOf(members) {
  let m = null;
  for (const r of members) { const u = lc(r.user); if (m === null || u < m) m = u; }
  return m ?? "";
}

/** The A-rawlogs JSONL body the frozen labeler consumes (--rawlogs; u3-realized.mjs:528 split, :548/:614 fields):
 *  one decoded LiquidationCall record per line, canonically sorted by (block, logIndex), trailing newline iff non-empty.
 *  The labeler verifies its RAW sha256 against --rawlogs-sha, so `rawlogs_sha256` is over these exact bytes. */
export function buildARawlogs(records) {
  const sorted = records.slice().sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
  return sorted.map((r) => JSON.stringify({
    block: r.block, logIndex: r.logIndex, tx: r.tx, collateral: r.collateral, debt: r.debt, user: r.user,
    debtToCover: r.debtToCover, liquidatedCollateralAmount: r.liquidatedCollateralAmount, liquidator: r.liquidator, receiveAToken: r.receiveAToken,
  })).join("\n") + (sorted.length ? "\n" : "");
}

/** PURE selection reducer (0 network): applies §DISC:31/:34-40/:42-46/:49-50 to a discover brut (v2). `tsOf` is read
 *  from `brut.block_ts`; a missing block ⇒ SelectError BY NAME. Returns the full census (candidates, winner, counters)
 *  and the kept (e2-excluded) records. Async because clusterWethLiquidations awaits tsOf. */
export async function reduceSelection({ brut, nMin, e2Window, bHi, blockTsExtra = {} }) {
  if (!brut || typeof brut !== "object" || !Array.isArray(brut.records)) throw new SelectError("--discover brut.records missing or not an array (fail-closed)");
  const blockTs = brut.block_ts;
  if (!blockTs || typeof blockTs !== "object" || Array.isArray(blockTs)) throw new SelectError("--discover brut.block_ts missing — u4b-discover schema v2 required (C-1); the selector reads NO network");
  const toBlock = Number(brut.to_block); // the RESOLVABLE bound (§DISC:44 B_hi default): no block exists past it yet (chain head)
  if (!Number.isInteger(toBlock)) throw new SelectError(`--discover brut.to_block is not an integer (${String(brut.to_block)}); schema v2 required`);
  const [e2Lo, e2Hi] = e2Window;
  if (!(Number.isInteger(e2Lo) && Number.isInteger(e2Hi) && e2Lo <= e2Hi)) throw new SelectError(`--e2-window invalid [${e2Lo},${e2Hi}] (fail-closed)`);
  const inE2 = (blk) => blk >= e2Lo && blk <= e2Hi;
  const nExcludedE2 = brut.records.filter((r) => inE2(r.block)).length;
  const kept = brut.records.filter((r) => !inE2(r.block)); // §DISC:31 — e2 EXCLUDED (all collaterals)
  // tsOf from block_ts, then the OPTIONAL sidecar block_ts_extra (C-2: the e2-excluded re-clustering can probe blocks the
  // witness never read; `--fill-ts` fetches EXACTLY those into the sidecar). Still OFFLINE here: a block absent from BOTH
  // is a NAMED refusal pointing to `--fill-ts` (never a network read in the selector).
  const tsOf = (block) => {
    if (block > toBlock) return Infinity; // D-n: no block past to_block (chain head), so +Infinity closes the 24h window
    const t = blockTs[String(block)] ?? blockTsExtra[String(block)]; //     truncated at to_block WITHOUT a network read
    if (t === undefined || t === null) throw new SelectError(`brut has no ts for block ${block} - run \`u4b-select-episode --fill-ts\` to fetch the missing blocks into block-ts-extra.json (keyless quorum-2), then re-run with --block-ts-extra (C-2); the selector performs NO network read.`);
    return Number(t);
  };
  const clusters = await clusterWethLiquidations(kept, tsOf); // §DISC:34-40 on the e2-EXCLUDED set (authoritative)
  const nWethKept = kept.filter((r) => lc(r.collateral) === WETH).length;
  const sumMembers = clusters.reduce((a, c) => a + c.n_members, 0);
  const residualOutsideWindow = nWethKept - sumMembers; // 0 by construction (greedy assigns every WETH record)
  const candidates = clusters.map((c) => {
    const reasons = [];
    if (!(c.b_last <= bHi) || c.b_last >= toBlock) reasons.push("window_truncated"); // §DISC:44 (B_last <= B_hi) + D-n: the +Infinity clamp caps b_last at to_block, so a window whose 24h boundary can't be CONFIRMED within [.., to_block] (b_last == to_block) is truncated fail-closed
    if (!(c.n_distinct_liquidated >= nMin)) reasons.push(`n_distinct_lt_n_min(${c.n_distinct_liquidated}<${nMin})`); // §DISC:46
    return { b_first: c.b_first, b_last: c.b_last, b0: c.b0, n_members: c.n_members, n_distinct: c.n_distinct_liquidated, addr_min: addrMinOf(c.members), eligible: reasons.length === 0, reasons };
  });
  const windowTruncated = candidates.filter((c) => c.reasons.includes("window_truncated")).length;
  const eligible = candidates.filter((c) => c.eligible);
  const winner = eligible.length ? eligible.slice().sort(compareCandidates)[0] : null; // §DISC:49 argmin B_first (+:50 tie-break)
  return { clusters, candidates, eligible, winner, nExcludedE2, residualOutsideWindow, windowTruncated, kept, tsOf };
}

/** Build the episode-selection.json payload (WITHOUT version_check/selection_sha256) + the A-rawlogs body. The winner's
 *  episode id is `weth-<UTC date of ts(B_first)>` (ts from block_ts, offline). Throws SelectError if no eligible cluster
 *  (H-0 no_fresh_episode). Returns { payload, aRawlogs, rawlogsSha, episodeId }. */
export function buildSelection({ census, preregSha, discoverSha, e2Window, nMin, bHi }) {
  const { winner, candidates, eligible, nExcludedE2, residualOutsideWindow, windowTruncated, kept, tsOf } = census;
  if (!winner) throw new SelectError(`H-0 no_fresh_episode: 0 eligible WETH cluster in [b_hi=${bHi}] minus e2 (candidates=${candidates.length}, window_truncated=${windowTruncated}). Formed item (widen the window / lower N_min = investor decision), NO course.`);
  const bFirst = winner.b_first;
  const tsFirst = tsOf(bFirst); // present (the winner came from a cluster whose ts we already read)
  const episodeId = "weth-" + new Date(tsFirst * 1000).toISOString().slice(0, 10);
  const aRawlogs = buildARawlogs(kept); // e2-EXCLUDED records, the labeler --rawlogs form (C-3)
  const rawlogsSha = createHash("sha256").update(aRawlogs, "utf8").digest("hex"); // RAW sha (labeler compares update(rawBuf))
  const episode = { id: episodeId, B_first: bFirst, B_last: winner.b_last, B0: bFirst - 1, n_distinct: winner.n_distinct, collateral: WETH };
  const events = [{ id: episodeId, collateral: WETH, clusterLo: bFirst, clusterHi: winner.b_last, preV33: false }]; // labeler parseEventsFile shape (C-2: WETH ADDRESS, not the string)
  const eventsBody = JSON.stringify(events, null, 2) + "\n"; // the EXACT bytes written to events-<id>.json (C-4)
  const eventsSha = createHash("sha256").update(eventsBody, "utf8").digest("hex"); // RAW sha of the events FILE the labeler reads (C-V-4: pin the bytes, not just payload.events)
  const payload = {
    schema: SCHEMA, prereg_sha: preregSha, discover_sha: discoverSha,
    e2_window: e2Window, n_min: nMin, b_hi: bHi,
    candidates: candidates.map(({ b_first, b_last, b0, n_members, n_distinct, eligible: el, reasons }) => ({ b_first, b_last, b0, n_members, n_distinct, eligible: el, reasons })),
    n_eligible: eligible.length, residual_outside_window: residualOutsideWindow, n_excluded_e2: nExcludedE2, window_truncated: windowTruncated,
    episode, events, events_file: `events-${episodeId}.json`, events_sha256: eventsSha, rawlogs_file: `A-rawlogs-${episodeId}.jsonl`, rawlogs_sha256: rawlogsSha,
  };
  return { payload, aRawlogs, rawlogsSha, episodeId, events, eventsBody };
}

/** selection_sha256 = sha256Hex(canon(payload)) where payload EXCLUDES version_check + selection_sha256 (C-5), so
 *  `--check-version` can fill version_check later WITHOUT invalidating the sha the prober/recorder verify. */
export function selectionSha(payload) {
  return sha256Hex(canon(payload));
}

const arg = (argv, k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const reqInt = (argv, k) => { const v = arg(argv, k); const n = Number(v); if (v === undefined || !Number.isInteger(n)) throw new SelectError(`${k} <integer> is required (fail-closed)`); return n; };

/** CA-11 (C-V-7): a resolved path must be OUT of the repo (like the prober's --raws-dir) AND, more specifically, not
 *  under apps/sentinel/test/fixtures/ (the fixtures message is kept for the pinned-series footgun). */
function assertOutDir(outDir) {
  const abs = resolve(outDir);
  const fixtures = join(ROOT, "apps", "sentinel", "test", "fixtures");
  const under = (child, parent) => { const rel = relative(parent, resolve(child)); return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)); };
  if (under(abs, fixtures)) throw new SelectError(`--out ${abs} resolves under apps/sentinel/test/fixtures/; refused fail-closed`);
  if (under(abs, ROOT)) throw new SelectError(`--out ${abs} resolves under the repo root; refused fail-closed (CA-11, must be OUT of the repo)`);
  return abs;
}

/** C-V-9(ii): a brut carrying a `phase` MUST be "complete" ; a "getlogs-only" brut is an INTERRUPTED discover (durable
 *  partial), never a course input — refuse by name. A phase-absent brut (legacy/synthetic) is accepted. */
function assertBrutComplete(brut) {
  if (brut.phase !== undefined && brut.phase !== "complete") throw new SelectError(`--discover brut phase '${brut.phase}' is not 'complete' - discover interrupted: re-run u4b-discover (the getlogs-only brut is a durable partial, never a course input)`);
}

/** Verify a --prereg-file (default docs/PLAN-u4b-prereg.md) exists and its LF sha256 == --prereg-sha (mandatory). */
function verifyPrereg(argv) {
  const preregFile = arg(argv, "--prereg-file") ?? "docs/PLAN-u4b-prereg.md";
  const preregSha = arg(argv, "--prereg-sha");
  if (preregSha === undefined || preregSha === "") throw new SelectError("--prereg-sha <LF sha of --prereg-file> is required (order proof)");
  const p = resolve(ROOT, preregFile);
  if (!existsSync(p)) throw new SelectError(`--prereg-file ${preregFile} does not exist (fail-closed)`);
  const actual = lfSha256(readFileSync(p, "utf8"));
  if (actual !== preregSha) throw new SelectError(`--prereg-sha ${preregSha} != LF sha ${actual} of ${preregFile}`);
  return { preregFile, preregSha };
}

/** `select` mode (OFFLINE): read the discover brut, verify its brut_sha256, apply §DISC, write episode-selection.json +
 *  A-rawlogs-<id>.jsonl. `deps` unused (no network); kept for symmetry with --check-version. */
export async function runSelect(argv, _deps) {
  const { preregSha } = verifyPrereg(argv);
  const discoverPath = arg(argv, "--discover");
  if (!discoverPath) throw new SelectError("--discover <brut json> is required (fail-closed)");
  const outDir = arg(argv, "--out");
  if (!outDir) throw new SelectError("--out <dir, out of repo> is required (fail-closed, no default)");
  const outAbs = assertOutDir(outDir);
  const nMin = arg(argv, "--n-min") !== undefined ? reqInt(argv, "--n-min") : DEFAULT_N_MIN;
  const e2Window = arg(argv, "--e2-window") !== undefined ? String(arg(argv, "--e2-window")).split(",").map((s) => Number(s.trim())) : DEFAULT_E2_WINDOW.slice();

  const discoverFile = JSON.parse(readFileSync(discoverPath, "utf8"));
  const brut = discoverFile.brut;
  if (!brut) throw new SelectError("--discover file has no `brut` (not a u4b-discover output?)");
  assertBrutComplete(brut); // C-V-9(ii): reject an interrupted (getlogs-only) brut by name
  const carriedSha = discoverFile.provenance && discoverFile.provenance.brut_sha256;
  const recomputed = sha256Hex(canon(brut));
  if (recomputed !== carriedSha) throw new SelectError(`--discover brut_sha256 mismatch: recomputed ${recomputed} != carried ${String(carriedSha)} (fail-closed)`);
  const bHi = arg(argv, "--b-hi") !== undefined ? reqInt(argv, "--b-hi") : Number(brut.to_block);
  if (!Number.isInteger(bHi)) throw new SelectError(`--b-hi could not default to brut.to_block (${String(brut.to_block)})`);

  // OPTIONAL sidecar (C-2): --block-ts-extra <block-ts-extra.json> from `--fill-ts`. Self-sha verified + bound to THIS
  // brut (discover_sha). Still 0 network here. Its sha is recorded in episode-selection.json (sha-linked chain).
  const extraPath = arg(argv, "--block-ts-extra");
  let blockTsExtra = {}; let blockTsExtraSha = null;
  if (extraPath !== undefined) {
    const sc = JSON.parse(readFileSync(extraPath, "utf8"));
    blockTsExtra = (sc && typeof sc.block_ts_extra === "object" && !Array.isArray(sc.block_ts_extra)) ? sc.block_ts_extra : (() => { throw new SelectError("--block-ts-extra: block_ts_extra missing/not an object (fail-closed)"); })();
    if (sha256Hex(canon(blockTsExtra)) !== sc.block_ts_extra_sha256) throw new SelectError(`--block-ts-extra: block_ts_extra_sha256 mismatch (tampered sidecar, fail-closed)`);
    if (sc.discover_sha !== recomputed) throw new SelectError(`--block-ts-extra: discover_sha ${String(sc.discover_sha)} != this brut ${recomputed} (sidecar belongs to another brut, fail-closed)`);
    if (sc.phase !== undefined && sc.phase !== "complete") throw new SelectError(`--block-ts-extra: sidecar phase '${sc.phase}' is not 'complete' — --fill-ts was interrupted (a partial sidecar is a durable RESUME point, never a selection input); re-run --fill-ts to complete it`);
    blockTsExtraSha = sc.block_ts_extra_sha256;
  }

  const census = await reduceSelection({ brut, nMin, e2Window, bHi, blockTsExtra });
  const { payload, aRawlogs, episodeId, eventsBody } = buildSelection({ census, preregSha, discoverSha: recomputed, e2Window, nMin, bHi });
  if (blockTsExtraSha) { payload.block_ts_extra_file = basename(extraPath); payload.block_ts_extra_sha256 = blockTsExtraSha; }
  const selection_sha256 = selectionSha(payload);
  const file = { ...payload, version_check: "pending", selection_sha256 };

  mkdirSync(outAbs, { recursive: true });
  const selPath = join(outAbs, "episode-selection.json");
  const rawPath = join(outAbs, `A-rawlogs-${episodeId}.jsonl`);
  const eventsPath = join(outAbs, `events-${episodeId}.json`); // C-4: the ARRAY, directly consumable by the labeler --events
  writeFileSync(rawPath, aRawlogs);
  writeFileSync(eventsPath, eventsBody); // EXACT bytes pinned by events_sha256 (C-V-4)
  writeFileSync(selPath, JSON.stringify(file, null, 2) + "\n");
  process.stdout.write(
    `u4b-select episode=${episodeId} B_first=${payload.episode.B_first} B_last=${payload.episode.B_last} B0=${payload.episode.B0} n_distinct=${payload.episode.n_distinct}\n` +
    `  candidates=${payload.candidates.length} eligible=${payload.n_eligible} window_truncated=${payload.window_truncated} n_excluded_e2=${payload.n_excluded_e2} residual_outside_window=${payload.residual_outside_window}\n` +
    `  version_check=pending selection_sha256=${selection_sha256} rawlogs_sha256=${payload.rawlogs_sha256}${blockTsExtraSha ? ` block_ts_extra_sha256=${blockTsExtraSha}` : ""}\n  out=${selPath} events=${eventsPath}\n`);
  return { out: selPath, rawOut: rawPath, eventsOut: eventsPath, episodeId, selectionSha: selection_sha256, file };
}

/** ONE eth_getStorageAt(POOL, EIP1967_IMPL_SLOT, block) at quorum-2 keyless, via the guarded client (metered; method
 *  in --method-caps). Manual quorum-2 over distinct operatorOf (rpc2 has no getStorageAt); budget re-raised FIRST; a
 *  transport fault benches the operator and tries the next; disagreement fails closed. */
async function storageAtQuorum2(guarded, labels, addr, slot, block) {
  const got = new Map(); // operator -> value
  let lastErr;
  for (const label of labels) {
    if (got.has(operatorOf(label))) continue;
    try {
      const v = await guarded.call(label, "eth_getStorageAt", [addr, slot, hexBlock(block)]);
      got.set(operatorOf(label), String(v));
    } catch (e) {
      if (e instanceof BudgetExceededError) throw e; // fatal FIRST
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    if (got.size >= 2) break;
  }
  const vals = [...got.values()];
  if (vals.length < 2) throw new SelectError(`check-version: eth_getStorageAt quorum-2 needs 2 distinct operators${lastErr ? ` (last: ${lastErr.message})` : ""}`);
  if (new Set(vals.map((v) => v.toLowerCase())).size !== 1) throw new SelectError("check-version: quorum disagreement on the EIP-1967 impl slot (fail-closed)");
  return vals[0];
}

/** `--check-version` sub-command (H-1 / §DISC:46,:56): read episode.B_first, resolve impl(Pool @ B_first) at quorum-2
 *  keyless, write `version_check` into episode-selection.json (selection_sha256 UNCHANGED, C-5). version_ok = (impl ==
 *  v3.5.0) OR --version-neutral-ref given. false without a neutral ref ⇒ STOP H-1 (PR-U4-3-bis), never auto-advance. */
export async function runCheckVersion(argv, deps) {
  const episodeFile = arg(argv, "--episode-file");
  if (!episodeFile) throw new SelectError("--episode-file <episode-selection.json> is required (fail-closed)");
  const file = JSON.parse(readFileSync(episodeFile, "utf8"));
  const { version_check: _vc, selection_sha256: carried, ...payload } = file;
  const recomputed = selectionSha(payload);
  if (recomputed !== carried) throw new SelectError(`--episode-file selection_sha256 mismatch: recomputed ${recomputed} != carried ${String(carried)} (fail-closed, 0 fetch)`);
  const block = file.episode && file.episode.B_first;
  if (!Number.isInteger(block)) throw new SelectError(`--episode-file episode.B_first is not an integer (${String(block)})`);
  const neutralRef = arg(argv, "--version-neutral-ref");

  const operators = (arg(argv, "--operators") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  assertKeylessOperators(operators); // C-V-9(i): keyless-only by code (a paid 'chainstack'/'helius' reads a key, refused)
  if (new Set(operators.map(operatorOf)).size < 2) throw new SelectError("--operators needs >= 2 DISTINCT keyless archive operators (fail-closed; pocket.network prunes old headers, use e.g. drpc.org,mevblocker.io,tenderly.co)");
  const ledgerDir = assertLedgerDir(arg(argv, "--ledger-dir") ?? "", ROOT);
  const cycle = arg(argv, "--cycle");
  if (!cycle) throw new SelectError("--cycle <id> is required (fail-closed)");
  const maxCalls = reqInt(argv, "--max-calls");
  if (!(maxCalls > 0)) throw new SelectError("--max-calls must be > 0 (fail-closed budget)");
  let methodCaps;
  try { methodCaps = JSON.parse(arg(argv, "--method-caps") ?? "null"); } catch { throw new SelectError("--method-caps must be a JSON object of method->cap (fail-closed)"); }
  if (methodCaps === null || typeof methodCaps !== "object" || Array.isArray(methodCaps)) throw new SelectError("--method-caps must be a JSON object (fail-closed)");

  const { client } = openU4GuardedClient({ env: deps.env, ledgerDir, cycle, floor: 0, maxRu: 0, methodCaps, maxCalls, ethCallLabels: operators, getLogsLabels: operators });
  const guarded = makeGuardedPoolCall(client, { retries: 2, backoffMs: 200, backoffCapMs: 4000 });
  try {
    const raw = await storageAtQuorum2(guarded, operators, POOL, EIP1967_IMPL_SLOT, block);
    const impl = lc(decAddress(raw));
    const versionOk = impl === IMPL_V350 || (neutralRef !== undefined && neutralRef !== "");
    const versionCheck = {
      status: "checked", block, impl, expected_v350: IMPL_V350, version_ok: versionOk,
      neutral_ref: neutralRef !== undefined && impl !== IMPL_V350 ? neutralRef : null,
      checked_at_utc: new Date(deps.now()).toISOString(), operators: distinctLabels(operators), calls: guarded.total(),
    };
    // Rewrite the file with version_check filled; selection_sha256 is UNCHANGED (C-5).
    writeFileSync(episodeFile, JSON.stringify({ ...payload, version_check: versionCheck, selection_sha256: carried }, null, 2) + "\n");
    if (!versionOk) {
      process.stderr.write(`u4b-check-version: version_ok=FALSE (impl ${impl} != v3.5.0 ${IMPL_V350}, no --version-neutral-ref) - STOP H-1, item PR-U4-3-bis (read the impl [lu], declare the diff NEUTRAL BEFORE any yhat). NO silent advance.\n`);
      return { versionOk: false, impl, block };
    }
    process.stdout.write(`u4b-check-version B_first=${block} impl=${impl} version_ok=true${impl !== IMPL_V350 ? ` (neutral_ref=${neutralRef})` : " (== v3.5.0)"} calls=${guarded.total()}/${maxCalls}\n`);
    return { versionOk: true, impl, block };
  } catch (e) {
    if (e instanceof BudgetExceededError) process.stderr.write(`u4b-check-version: BUDGET STOP after ${guarded.total()} calls (${e.message}); raise budget (R-26) and re-run.\n`);
    throw e;
  } finally {
    unlockAll(client, { ledgerDir, cycle, floor: 0, reason: "u4b-check-version end" });
  }
}

/** `--fill-ts` sub-command (C-2, GUARDED keyless quorum-2): the offline selector refuses when the e2-EXCLUDED
 *  re-clustering needs a block the discover witness never read. This re-runs the SAME clustering with a LAZY,
 *  network-backed tsOf (block_ts first, else fetch blockAt over --operators, pocket-free) and writes a sha-linked
 *  sidecar block-ts-extra.json the offline pass then consumes via --block-ts-extra. Only globalThis.fetch touches the
 *  network (via the guarded client); the offline selector itself stays 0-fetch.
 *  D-n (2026-09-22, borne to_block): `b_hi` (default `brut.to_block`) IS the bound — a block > to_block does NOT exist yet
 *  (chain head), so tsOf returns +Infinity WITHOUT a network read (a probe past it returns `null` => "malformed block" =>
 *  quorum-fail STOP, measured on the real course, ~12k lost keyless calls x3). The 24h window then closes truncated at
 *  to_block. The sidecar is INCREMENTAL + RESUMABLE: rewritten every 50 new ts and on a graceful STOP (phase "partial"),
 *  once at the end (phase "complete"); a re-run with the same --out RESUMES from a partial (0 re-fetch); runSelect refuses
 *  a "partial" sidecar by name (§DISC:44 / ADR-U4b amendment D-n). */
export async function runFillTs(argv, deps) {
  const discoverPath = arg(argv, "--discover");
  if (!discoverPath) throw new SelectError("--discover <brut json> is required (fail-closed)");
  const outDir = arg(argv, "--out");
  if (!outDir) throw new SelectError("--out <dir, out of repo> is required (fail-closed, no default)");
  const outAbs = assertOutDir(outDir);
  const e2Window = arg(argv, "--e2-window") !== undefined ? String(arg(argv, "--e2-window")).split(",").map((s) => Number(s.trim())) : DEFAULT_E2_WINDOW.slice();
  const [e2Lo, e2Hi] = e2Window;
  const operators = (arg(argv, "--operators") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  assertKeylessOperators(operators); // C-V-9(i): keyless-only by code (a paid 'chainstack'/'helius' is refused fail-closed)
  if (new Set(operators.map(operatorOf)).size < 2) throw new SelectError("--operators needs >= 2 DISTINCT keyless archive operators (fail-closed; pocket.network prunes old headers, use e.g. drpc.org,mevblocker.io,tenderly.co)");
  const ledgerDir = assertLedgerDir(arg(argv, "--ledger-dir") ?? "", ROOT);
  const cycle = arg(argv, "--cycle");
  if (!cycle) throw new SelectError("--cycle <id> is required (fail-closed)");
  const maxCalls = reqInt(argv, "--max-calls");
  if (!(maxCalls > 0)) throw new SelectError("--max-calls must be > 0 (fail-closed budget)");
  let methodCaps;
  try { methodCaps = JSON.parse(arg(argv, "--method-caps") ?? "null"); } catch { throw new SelectError("--method-caps must be a JSON object (fail-closed)"); }
  if (methodCaps === null || typeof methodCaps !== "object" || Array.isArray(methodCaps)) throw new SelectError("--method-caps must be a JSON object (fail-closed)");

  const discoverFile = JSON.parse(readFileSync(discoverPath, "utf8"));
  const brut = discoverFile.brut;
  if (!brut || !Array.isArray(brut.records) || !brut.block_ts) throw new SelectError("--discover brut/records/block_ts missing (schema v2 required)");
  assertBrutComplete(brut); // C-V-9(ii): an interrupted (getlogs-only) brut is not a course input
  const recomputed = sha256Hex(canon(brut));
  if (recomputed !== (discoverFile.provenance && discoverFile.provenance.brut_sha256)) throw new SelectError("--discover brut_sha256 mismatch (fail-closed)");

  const { client } = openU4GuardedClient({ env: deps.env, ledgerDir, cycle, floor: 0, maxRu: 0, methodCaps, maxCalls, ethCallLabels: operators, getLogsLabels: operators });
  const guarded = makeGuardedPoolCall(client, { retries: 2, backoffMs: 200, backoffCapMs: 4000 });
  const toBlock = Number(brut.to_block);
  if (!Number.isInteger(toBlock)) throw new SelectError(`--discover brut.to_block is not an integer (${String(brut.to_block)}); schema v2 required`);
  const minIntervalMs = arg(argv, "--min-interval-ms") !== undefined ? Number(arg(argv, "--min-interval-ms")) : 50;
  const pool = makeUkemiPool({ call: guarded.call, ethCallProviders: operators, getLogsProviders: operators, minIntervalMs, chunk: 9990 });
  const blockTs = brut.block_ts;
  const extra = {};
  mkdirSync(outAbs, { recursive: true });
  const scPath = join(outAbs, "block-ts-extra.json");
  // RESUME (deliverable 2): a durable sidecar from a prior interrupted run (SAME discover_sha, valid self-sha) SEEDS
  // `extra`, so the re-clustering re-fetches ONLY the blocks it still lacks. A tampered/foreign sidecar is refused BY NAME.
  if (existsSync(scPath)) {
    const prev = JSON.parse(readFileSync(scPath, "utf8"));
    const prevExtra = (prev && typeof prev.block_ts_extra === "object" && !Array.isArray(prev.block_ts_extra)) ? prev.block_ts_extra : null;
    if (prevExtra === null) throw new SelectError("--out already holds a block-ts-extra.json with no block_ts_extra object (fail-closed; move it aside)");
    if (sha256Hex(canon(prevExtra)) !== prev.block_ts_extra_sha256) throw new SelectError("--out block-ts-extra.json self-sha mismatch (corrupt/tampered; fail-closed)");
    if (prev.discover_sha !== recomputed) throw new SelectError(`--out block-ts-extra.json discover_sha ${String(prev.discover_sha)} != this brut ${recomputed} (belongs to another brut; use a fresh --out)`);
    Object.assign(extra, prevExtra); // resume: prior ts reused, 0 re-fetch
  }
  const kept = brut.records.filter((r) => !(r.block >= e2Lo && r.block <= e2Hi)); // SAME e2-excluded set as the selector
  // INCREMENTAL durable sidecar: rewritten every N=50 NEW ts (phase "partial"), on a graceful STOP (partial), and at the
  // end (phase "complete", the only phase runSelect accepts). A "partial" is a resume point. block_ts_extra_sha256 is over
  // `extra` (C-2 chain), NOT over `phase` (a hand-flip partial->complete is caught by the named refusal, not this sha).
  const FLUSH_EVERY = 50;
  let sinceFlush = 0;
  const flush = (phase) => {
    const sidecar = { schema: "ukemi-u4b-block-ts-extra/1", phase, discover_sha: recomputed, n_extra: Object.keys(extra).length, block_ts_extra: extra, block_ts_extra_sha256: sha256Hex(canon(extra)) };
    writeFileSync(scPath, JSON.stringify(sidecar, null, 2) + "\n");
    return sidecar;
  };
  // lazy tsOf: block > to_block => +Infinity (D-n, no fetch: the malformed-block STOP fix); else block_ts -> extra -> fetch.
  // One clustering pass resolves EXACTLY the missing <= to_block blocks in order (each REAL ts fixes the binary search).
  const tsOf = async (block) => {
    if (block > toBlock) return Infinity; // D-n: never probe past to_block (the block does not exist yet => malformed block)
    const k = String(block);
    if (blockTs[k] !== undefined && blockTs[k] !== null) return Number(blockTs[k]);
    if (extra[k] !== undefined) return Number(extra[k]);
    const t = (await pool.blockAt(block)).ts;
    extra[k] = t;
    if (++sinceFlush >= FLUSH_EVERY) { flush("partial"); sinceFlush = 0; } // durable checkpoint every 50 new ts
    return t;
  };
  try {
    await clusterWethLiquidations(kept, tsOf); // side effect: `extra` gets every <= to_block block the re-clustering lacked
    const sidecar = flush("complete");
    process.stdout.write(`u4b-fill-ts phase=complete n_extra=${sidecar.n_extra} block_ts_extra_sha256=${sidecar.block_ts_extra_sha256} calls=${guarded.total()}/${maxCalls}\n  out=${scPath}\n`);
    return { out: scPath, nExtra: sidecar.n_extra, sha: sidecar.block_ts_extra_sha256, phase: sidecar.phase };
  } catch (e) {
    const p = flush("partial"); // the interrupted run is DURABLE: a resume re-fetches ONLY the remaining blocks
    if (e instanceof BudgetExceededError) process.stderr.write(`u4b-fill-ts: BUDGET STOP after ${guarded.total()} calls (${e.message}); partial (n_extra=${p.n_extra}) persisted, raise budget (R-26) and re-run to RESUME.\n`);
    else process.stderr.write(`u4b-fill-ts: STOP after ${guarded.total()} calls (${e instanceof Error ? e.message : String(e)}); partial (n_extra=${p.n_extra}) persisted, re-run to RESUME.\n`);
    throw e;
  } finally {
    unlockAll(client, { ledgerDir, cycle, floor: 0, reason: "u4b-fill-ts end" });
  }
}

/** Dispatch: default = `select` (offline); `--check-version` and `--fill-ts` = the guarded sub-commands. */
export async function run(argv, deps) {
  if (argv.includes("--check-version")) return runCheckVersion(argv, deps);
  if (argv.includes("--fill-ts")) return runFillTs(argv, deps);
  return runSelect(argv, deps);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run(process.argv.slice(2), { env: process.env, now: () => Date.now() }).catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
