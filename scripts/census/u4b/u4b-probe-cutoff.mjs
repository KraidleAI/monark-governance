// scripts/census/u4b/u4b-probe-cutoff.mjs
// ============================================================================================
// Lot U-4b-1b-4 (R-G) - the go/no-go probe (d) of the prereg (Sonde (d) :186, E-I-7 = OUI) as FIXED by the dated ADDENDUM section 1
// (docs/course-ukemi/ADDENDUM-sonde-d-ancre-pre-b0-2026-09-22.md) and FAITS-dualaggregator-cutoff-2026-09-22.md (cp-1 C-2/C-3/C-6).
// s_cutoffTime is `uint32 internal` with NO getter (FAITS) => NOT an eth_call: the value in force at block B = cutoffTime of the LAST
// CutoffTimeSet(uint32) event (block, logIndex) at a block <= B (the constructor emits one at creation block 22076041). ONE scan
// [22076041, max(B_fresh, 23545087)] (raised to 23545087 when B_fresh is older: c_e2 never on a truncated prefix, declared D-n) gives
// c_fresh at B_fresh = episode.B0 of the sha-verified --episode-file and c_e2 at 23545087 (e2). PRE-REGISTERED fail-closed rule:
// GO iff c_fresh == c_e2; anything else (inequality, failed read, quorum missing, aggregator()@B_fresh != 0x7c7fdfca...) => STOP,
// exit 3, every value read reported. Keyless quorum-2 via @monark/rpc-guard (each <= 9990-block piece metered, --max-calls), EMPTY
// env; output <--out>/cutoff-<B_fresh>.json OUT of the repo, NEVER episode-selection.json (C-6). Code: claude-opus-5-5[1m], R-20/R-21.
// ============================================================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { makeUkemiPool, operatorOf, BudgetExceededError } from "../../../apps/sentinel/src/ukemi/rpc2.ts";
import { keccak256, SEL, decAddress, wordAt } from "../../../apps/sentinel/src/ukemi/abi.ts";
import { assertLedgerDir, openU4GuardedClient, makeGuardedPoolCall, unlockAll, distinctLabels } from "../u4-guard.mjs";
import { parseEpisodeFile } from "../u4-oracle-path.mjs";
import { assertKeylessOperators } from "./u4b-discover.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");

export const SCHEMA = "ukemi-u4b-cutoff-probe/1";
/** prereg section DISC:28 - the WETH/USD SVR feed proxy Aave reads (same default as the prober). */
export const FEED_PROXY = "0x5424384b256154046e9667ddfaaa5e550145215e";
/** The DualAggregator behind it (FAITS 2026-09-22; PR-U4-1 section 3.1) - asserted, never assumed. */
export const EXPECTED_AGGREGATOR = "0x7c7fdfca295a787ded12bb5c1a49a8d2cc20e3f8";
/** Creation block of that aggregator (FAITS: tx 0xa5cc47df..., 2025-03-18T20:07:11Z) = the scan start. */
export const AGGREGATOR_CREATION_BLOCK = 22076041;
/** B0 of e2 = the reference block of c_e2 (ADDENDUM section 1). */
export const E2_B0 = 23545087;
/** Deployment value of cutoffTime_ (PR-U4-1 section 3.3, decoded ConstructorArguments) - REPORTED, never decisive. */
export const DEPLOY_VALUE = 30;
/** topic0 of `event CutoffTimeSet(uint32 cutoffTime)` (FAITS), computed with the self-tested keccak of abi.ts. */
export const CUTOFF_TIME_SET_TOPIC0 = keccak256("CutoffTimeSet(uint32)");
export const RULE = "c_fresh == c_e2";
export const EXIT_STOP = 3;
const PIECE = 9990;

/** A named, fail-closed refusal of the probe (arguments, malformed event). */
export class ProbeError extends Error {}

/** Decode REAL-FORM CutoffTimeSet logs: topic0 self-test; data = ONE 32-byte ABI word holding a uint32 (else refused). */
export function decodeCutoffEvents(logs) {
  return logs.map((l) => {
    if (String(l.topics[0] ?? "").toLowerCase() !== CUTOFF_TIME_SET_TOPIC0) throw new ProbeError("u4b-probe-cutoff: a log has topic0 != CutoffTimeSet(uint32) (self-test failed)");
    if (!/^0x[0-9a-fA-F]{64}$/.test(String(l.data))) throw new ProbeError("u4b-probe-cutoff: CutoffTimeSet data is not ONE 32-byte word (malformed, fail-closed)");
    const v = BigInt(l.data);
    if (v > 0xffffffffn) throw new ProbeError("u4b-probe-cutoff: CutoffTimeSet data exceeds uint32 (malformed, fail-closed)");
    return { block: parseInt(l.blockNumber, 16), log_index: parseInt(l.logIndex, 16), tx_hash: String(l.transactionHash).toLowerCase(), cutoff_time: Number(v) };
  }).sort((a, b) => a.block - b.block || a.log_index - b.log_index);
}

/** The cutoffTime in force at block B = that of the LAST event by (block, logIndex) at a block <= B, or null. PURE. */
export function cutoffAt(events, B) {
  let best = null;
  for (const e of events) if (e.block <= B && (best === null || e.block > best.block || (e.block === best.block && e.log_index > best.log_index))) best = e;
  return best === null ? null : best.cutoff_time;
}

/** The PRE-REGISTERED rule (ADDENDUM section 1): GO iff both values exist and c_fresh == c_e2; STOP otherwise. PURE. */
export function decide(cFresh, cE2) {
  return cFresh !== null && cE2 !== null && cFresh === cE2 ? "GO" : "STOP";
}

/** The probe. Returns { status (0 GO, 3 STOP), verdict, outPath }; throws (exit 1, no file) on an argument refusal. */
export async function runProbe(argv, deps) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  for (const k of ["--block", "--finalized", "--target"]) if (argv.includes(k)) throw new ProbeError(`u4b-probe-cutoff: ${k} is refused - B_fresh is episode.B0 of the sha-verified --episode-file and the target is aggregator()@B_fresh (ADDENDUM section 1, cp-1 C-2/C-3)`);
  const episodePath = arg("--episode-file");
  if (!episodePath) throw new ProbeError("u4b-probe-cutoff: --episode-file <episode-selection.json> is required (fail-closed)");
  const { B0: bFresh, episodeId, selectionSha } = parseEpisodeFile(episodePath); // selection_sha256 verified, 0 fetch on mismatch
  const outArg = arg("--out");
  if (!outArg) throw new ProbeError("u4b-probe-cutoff: --out <dir, out of repo> is required (fail-closed, no default)");
  const outAbs = resolve(outArg);
  const rel = relative(ROOT, outAbs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new ProbeError(`u4b-probe-cutoff: --out is under the repo (CA-11, fixtures included): ${outAbs}`);
  const operators = (arg("--operators") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  assertKeylessOperators(operators); // a paid operator reads a key: refused fail-closed
  if (new Set(operators.map(operatorOf)).size < 2) throw new ProbeError("u4b-probe-cutoff: --operators needs >= 2 DISTINCT keyless operators (quorum-2, fail-closed)");
  const ledgerArg = arg("--ledger-dir");
  if (!ledgerArg) throw new ProbeError("u4b-probe-cutoff: --ledger-dir <dir, out of repo, pre-existing> is required (fail-closed, no default)");
  const ledgerDir = assertLedgerDir(ledgerArg, ROOT);
  const cycle = arg("--cycle");
  if (!cycle) throw new ProbeError("u4b-probe-cutoff: --cycle <id> is required (fail-closed)");
  const maxCalls = Number(arg("--max-calls"));
  if (!(Number.isInteger(maxCalls) && maxCalls > 0)) throw new ProbeError("u4b-probe-cutoff: --max-calls must be a positive integer (fail-closed budget)");
  let methodCaps;
  try { methodCaps = JSON.parse(arg("--method-caps") ?? "null"); } catch { throw new ProbeError("u4b-probe-cutoff: --method-caps must be a JSON object of method->cap (fail-closed)"); }
  if (methodCaps === null || typeof methodCaps !== "object" || Array.isArray(methodCaps)) throw new ProbeError("u4b-probe-cutoff: --method-caps must be a JSON object (fail-closed)");
  const minIntervalMs = arg("--min-interval-ms") !== undefined ? Number(arg("--min-interval-ms")) : 50;

  const { client } = openU4GuardedClient({ env: deps.env, ledgerDir, cycle, floor: 0, maxRu: 0, methodCaps, maxCalls, ethCallLabels: operators, getLogsLabels: operators });
  const guarded = makeGuardedPoolCall(client, { retries: 2, backoffMs: 200, backoffCapMs: 4000 });
  const pool = makeUkemiPool({ call: guarded.call, ethCallProviders: operators, getLogsProviders: operators, minIntervalMs, chunk: PIECE });
  const range = [AGGREGATOR_CREATION_BLOCK, Math.max(bFresh, E2_B0)];
  const report = {
    schema: SCHEMA, code_author: "claude-opus-5-5[1m]", episode_id: episodeId, selection_sha256: selectionSha, b_fresh: bFresh, e2_block: E2_B0,
    feed_proxy: FEED_PROXY, aggregator: null, aggregator_expected: EXPECTED_AGGREGATOR, range, topic0: CUTOFF_TIME_SET_TOPIC0, events: [],
    c_fresh: null, c_e2: null, deploy_value: DEPLOY_VALUE, rule: RULE, verdict: "STOP", reason: null,
    calls: 0, operators: distinctLabels(operators), ledger: { dir: ledgerDir, cycle }, checked_at_utc: new Date(deps.now()).toISOString(),
  };
  try {
    try {
      const agg = decAddress(wordAt(await pool.ethCall(FEED_PROXY, SEL.aggregator, bFresh), 0)).toLowerCase();
      report.aggregator = agg;
      if (agg !== EXPECTED_AGGREGATOR) report.reason = "aggregator_mismatch";
      else {
        report.events = decodeCutoffEvents(await pool.getLogsRange(agg, [CUTOFF_TIME_SET_TOPIC0], range[0], range[1]));
        report.c_fresh = cutoffAt(report.events, bFresh);
        report.c_e2 = cutoffAt(report.events, E2_B0);
        report.verdict = decide(report.c_fresh, report.c_e2);
        report.reason = report.verdict === "GO" ? null : report.c_fresh === null || report.c_e2 === null ? "no_event_at_or_below_block" : "cutoff_changed";
      }
    } catch (e) {
      // a read that fails (quorum missing, disagreement, budget, malformed event) = an INCOMPLETE scan => STOP, named by class.
      report.reason = e instanceof BudgetExceededError ? "budget_stop" : `read_failed:${e instanceof Error ? e.constructor.name : "unknown"}`;
      process.stderr.write(`u4b-probe-cutoff: read failed (${report.reason}): ${e instanceof Error ? e.message : String(e)}\n`);
    }
    report.calls = guarded.total();
    mkdirSync(outAbs, { recursive: true });
    const outPath = join(outAbs, `cutoff-${bFresh}.json`);
    writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
    process.stdout.write(`u4b-probe-cutoff B_fresh=${bFresh} aggregator=${report.aggregator} events=${report.events.length} c_fresh=${report.c_fresh} c_e2=${report.c_e2} deploy_value=${DEPLOY_VALUE} rule="${RULE}" verdict=${report.verdict}${report.reason ? ` reason=${report.reason}` : ""} calls=${report.calls}/${maxCalls}\n  out=${outPath}\n`);
    return { status: report.verdict === "GO" ? 0 : EXIT_STOP, verdict: report.verdict, outPath };
  } finally {
    unlockAll(client, { ledgerDir, cycle, floor: 0, reason: "u4b-probe-cutoff end" });
  }
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runProbe(process.argv.slice(2), { env: {}, now: () => Date.now() })
    .then((r) => { process.exitCode = r.status; })
    .catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
