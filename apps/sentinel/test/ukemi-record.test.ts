// UKEMI record.ts - offline oracles for the recorder CLI PARSER, the cross-platform run-guard, and getLogs dedup.
// GARDE-HELIUS-2b-ii: the retry / backoff / structured-journal / non-JSON-200 tests (on the removed makeDefaultCall /
// backoffDelay) are RETIRED - the transport (fetch, per-attempt timeout/abort, the four typed error paths, key
// hygiene) and the budget now live in @monark/rpc-guard (packages/rpc-guard/test/*: transport_error_path_*,
// two_paid_operators_*, caps.test.ts). getLogs range-splitting / free-plan bench / chunk-cut dedup stay covered by
// apps/sentinel/test/pool-rpc-1a.test.ts. The recorder's GUARDED composition (spends only through the guard, budget
// refusal not retried, resume 0-RU, R+1 write-ahead ledger lines, e2e record->unlock->reconcile, N-unlock in the
// finally, caller-only retry, and the rpc_errors journal mapped by e.name - http for a paid HttpError (never code), code
// for an RpcError - GARDE-HELIUS-2b-ii-c) is pinned in apps/sentinel/test/ukemi-guard-record.test.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUkemiArgs, isMainModule } from "../src/ukemi/record.ts";
import { dedupLogs, type LogEntry } from "../src/ukemi/rpc2.ts";
import { fileURLToPath } from "node:url";

// The CLI parser: the guarded-course inputs (--operators explicit include list; --ledger-dir/--cycle/--floor/--max-ru/
// --method-caps; --max-calls), politeness + caller retry budget, and fail-closed on a bad numeric or method-cap entry.
test("ukemi_record_parses_cli_args", () => {
  // +--prereg-file / +--labeler-sha (decision 128 Q-A/Q-B) + --no-prereg-binding (Q-A ruling 2026-09-22): parsed
  // alongside the U-4b binding flags. --prereg-file defaults to docs/PLAN-u4b-prereg.md (the U-4b prereg the course
  // is bound to by CODE), --labeler-sha is undefined unless given, --no-prereg-binding is a boolean flag (default false).
  const a = parseUkemiArgs(["--cluster", "susde-usde", "--block", "23600000", "--from-block", "23598000", "--min-interval-ms", "350", "--retries", "3", "--backoff-ms", "250", "--backoff-cap-ms", "4000", "--out", "/tmp/x.json", "--max-calls", "300000", "--resume", "/tmp/u4a/U4-inputs.jsonl", "--prereg-sha", "9209cdab", "--prereg-file", "docs/custom-prereg.md", "--labeler-sha", "deadbeef", "--no-prereg-binding", "--filter-only", "--slow-operator", "drpc.org", "--slow-operator", "pocket.network", "--slow-interval-ms", "250", "--operators", "drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack", "--ledger-dir", "/tmp/led", "--cycle", "2026-09", "--floor", "1000", "--max-ru", "600000", "--method-caps", "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000", "--concordance-out", "/tmp/conc.jsonl", "--heartbeat-every", "500"]);
  assert.deepEqual(a, { cluster: "susde-usde", block: 23600000, fromBlock: 23598000, minIntervalMs: 350, retries: 3, backoffMs: 250, backoffCapMs: 4000, out: "/tmp/x.json", maxCalls: 300000, resume: "/tmp/u4a/U4-inputs.jsonl", preregSha: "9209cdab", preregFile: "docs/custom-prereg.md", labelerSha: "deadbeef", noPreregBinding: true, filterOnly: true, slowOperators: ["drpc.org", "pocket.network"], slowIntervalMs: 250, operators: ["drpc.org", "mevblocker.io", "nodies.app", "pocket.network", "tenderly.co", "chainstack"], ledgerDir: "/tmp/led", cycle: "2026-09", floor: 1000, maxRu: 600000, methodCaps: { eth_call: 300000, eth_getLogs: 300000, eth_getBlockByNumber: 300000 }, concordanceOut: "/tmp/conc.jsonl", heartbeatEvery: 500 });
  const d = parseUkemiArgs([]);
  assert.deepEqual(d, { cluster: "weth", block: undefined, fromBlock: undefined, minIntervalMs: 200, retries: 2, backoffMs: 500, backoffCapMs: 8000, out: undefined, maxCalls: undefined, resume: undefined, preregSha: undefined, preregFile: "docs/PLAN-u4b-prereg.md", labelerSha: undefined, noPreregBinding: false, filterOnly: false, slowOperators: [], slowIntervalMs: 200, operators: [], ledgerDir: undefined, cycle: undefined, floor: undefined, maxRu: undefined, methodCaps: undefined, concordanceOut: undefined, heartbeatEvery: 2000 });
  // UKEMI-HEARTBEAT-1: --heartbeat-every is an optional integer >= 1 (default 2000 above); 0 is refused fail-closed
  // (optInt alone admits 0), a negative / non-numeric value by the shared non-negative-integer rule.
  assert.throws(() => parseUkemiArgs(["--heartbeat-every", "0"]), /--heartbeat-every must be >= 1/, "--heartbeat-every 0 is refused fail-closed (a period of 0 would mute the heartbeat)");
  assert.throws(() => parseUkemiArgs(["--heartbeat-every", "-3"]), /non-negative integer/, "a negative heartbeat period fails closed");
  assert.equal(parseUkemiArgs(["--heartbeat-every", "1"]).heartbeatEvery, 1, "1 (one line per config read) is the smallest admitted period");
  assert.throws(() => parseUkemiArgs(["--block", "abc"]), /non-negative integer/, "a non-numeric flag fails closed");
  assert.throws(() => parseUkemiArgs(["--retries", "-1"]), /non-negative integer/, "a negative flag fails closed");
  assert.throws(() => parseUkemiArgs(["--max-ru", "-5"]), /non-negative integer/, "the RU run cap fails closed on a negative value");
  assert.throws(() => parseUkemiArgs(["--method-caps", "eth_call=nope"]), /method-caps entry must be/, "a non-numeric method cap fails closed");
  assert.throws(() => parseUkemiArgs(["--method-caps", "=300000"]), /method-caps entry must be/, "a method cap with no method name fails closed");
});

// (V-1(a)) The run-guard, extracted and testable. A sibling path with a SPACE: the canonical file URL percent-encodes
// it (%20) and pathToFileURL round-trips a real space back to that URL on ALL platforms, so isMainModule is true; the
// pre-e8bcfe4 string form ("file://" + path, backslashes -> slashes) never percent-encodes the space -> not equal.
test("ukemi_record_is_main_module_cross_platform", () => {
  const u = new URL("./a b/record.ts", import.meta.url); // .href carries %20 for the space
  const p = fileURLToPath(u);                            // a real space in the resolved path
  assert.equal(isMainModule(p, u.href), true, "pathToFileURL round-trips a spaced path to the %20 URL on every platform");
  const oldForm = "file://" + p.split(String.fromCharCode(92)).join("/");
  assert.notEqual(oldForm, u.href, "the old string-concat guard never percent-encodes the space — cross-platform wrong");
  assert.equal(isMainModule(undefined, u.href), false, "undefined argv1 (no script arg) is never the main module");
});

// (C-1, hardens V-1(f)) dedupLogs keys on the FULL (blockNumber, logIndex, txHash) tuple, never blockNumber alone. A
// single block routinely carries >= 2 Transfer logs at DISTINCT logIndex (often one txHash), so both must survive; a
// blockNumber-only key (mutant G2-1) would silently drop the second. A byte-identical triple is a real duplicate.
test("ukemi_record_deduplogs_keys_on_full_log_tuple", () => {
  const mk = (block: number, logIndex: number, tx: string): LogEntry =>
    ({ blockNumber: "0x" + block.toString(16), logIndex: "0x" + logIndex.toString(16), transactionHash: tx, topics: ["0xt"], data: "0x" });
  const twoInOneBlock = dedupLogs([mk(100, 0, "0xaa"), mk(100, 1, "0xaa")]); // same block+txHash, distinct logIndex
  assert.equal(twoInOneBlock.length, 2, "same block, distinct logIndex (shared txHash) ⇒ both logs survive (a blockNumber-only key would drop one)");
  assert.deepEqual(twoInOneBlock.map((l) => parseInt(l.logIndex, 16)), [0, 1], "both logIndex kept, first-seen order preserved");
  const repeated = dedupLogs([mk(100, 0, "0xaa"), mk(100, 0, "0xaa")]); // byte-identical triple ⇒ a real duplicate
  assert.equal(repeated.length, 1, "same (block, logIndex, txHash) repeated ⇒ collapses to exactly one");
});
