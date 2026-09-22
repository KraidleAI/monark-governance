// scripts/census/u4b/u4b-discover.mjs
// ============================================================================================
// U-4b-1b-0 (decision 128 Q-D) — the §DISC episode-discovery pass: getLogs(Pool, [LIQ_TOPIC], from, to) over the
// KEYLESS quorum-2 pool, decode + WETH-cluster by the U-3 D2 window rule, write a DETERMINISTIC brut (sorted, sha256).
// KEYLESS-ONLY: --operators is an explicit include list; a PAID operator (chainstack/helius) is refused fail-closed
// (assertKeylessOperators) — discover reads NO key (ADR-U4b D5: no second budget counter; the guard owns the meter).
// It goes THROUGH @monark/rpc-guard (budgeted, [C-19]) via the shared u4-guard.mjs wiring, exactly like the migrated
// u4-oracle-path.mjs — NOT a raw fetch (that would be a second/zeroth budget counter D5 forbids, and a fetch site
// outside transport.ts trips the CI grep B-5). The LiquidationCall logic (topic0, decode, cluster) is the SINGLE
// source in liquidation-logs.mjs; the frozen labeler keeps its own copy (equality proven by test). Run-guarded.
// ============================================================================================
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { makeUkemiPool, operatorOf, BudgetExceededError } from "../../../apps/sentinel/src/ukemi/rpc2.ts";
import { ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS } from "@monark/rpc-guard";
import { assertLedgerDir, openU4GuardedClient, makeGuardedPoolCall, unlockAll, distinctLabels } from "../u4-guard.mjs";
import { LIQ_TOPIC, decodeAndSort, clusterWethLiquidations, canon, sha256Hex } from "./liquidation-logs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", ".."); // scripts/census/u4b -> repo root
/** Aave v3 Pool (mainnet), pinned identical to the frozen labeler u3-realized.mjs:40. */
const POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";

/** The keyless witness labels u4b-discover may use = the union of the package's two keyless ETH pools. A PAID
 *  operator (chainstack/helius) reads an endpoint key INSIDE the transport, so it is refused fail-closed here:
 *  u4b-discover is KEYLESS-ONLY (decision 128 Q-D / ADR-U4b D5 — discover reads no key). */
export const KEYLESS_LABELS = [...new Set([...ETH_CALL_KEYLESS_LABELS, ...GET_LOGS_KEYLESS_LABELS])];

/** Fail-closed refusal of any non-keyless operator (a paid 'chainstack'/'helius' or an unknown label). PURE (no
 *  network), so the paid-refusal test kills the "paid operator accepted" mutant WITHOUT a round-trip (B-1). */
export function assertKeylessOperators(operators) {
  if (!Array.isArray(operators) || operators.length === 0) throw new Error("u4b-discover: --operators <label,...> is required (keyless-only include list)");
  for (const op of operators) {
    if (!KEYLESS_LABELS.includes(op)) throw new Error(`u4b-discover: operator '${op}' is not a keyless witness — u4b-discover is KEYLESS-ONLY (a paid operator like 'chainstack'/'helius' reads a key; fail-closed, decision 128 Q-D). Keyless: ${KEYLESS_LABELS.join(", ")}`);
  }
  return operators;
}

/** --method-caps as a JSON object of method->positive-int cap; absent => {} (only the global --max-calls binds). */
function parseMethodCaps(v) {
  if (v === undefined) return {};
  let o;
  try { o = JSON.parse(v); } catch { throw new Error("u4b-discover: --method-caps must be a JSON object of method->cap (fail-closed)"); }
  if (o === null || typeof o !== "object" || Array.isArray(o)) throw new Error("u4b-discover: --method-caps must be a JSON object (fail-closed)");
  for (const val of Object.values(o)) if (!(Number.isInteger(val) && val > 0)) throw new Error("u4b-discover: every --method-caps value must be a positive integer (fail-closed)");
  return o;
}

/** Run the discovery. `deps = { env, now }` — the test stubs globalThis.fetch and passes a keyless env {} + a fixed
 *  clock (D-3: only fetch stubbed, the REAL guarded client). Returns { out, brutSha, nLogs, nClusters }. */
export async function runDiscover(argv, deps) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const reqInt = (k) => { const v = arg(k); const n = Number(v); if (v === undefined || !Number.isInteger(n) || n < 0) throw new Error(`u4b-discover: ${k} <non-negative integer> is required (fail-closed)`); return n; };
  const req = (k) => { const v = arg(k); if (v === undefined || v === "") throw new Error(`u4b-discover: ${k} is required (fail-closed)`); return v; };

  const fromBlock = reqInt("--from-block");
  const toBlock = reqInt("--to-block");
  if (!(toBlock >= fromBlock)) throw new Error(`u4b-discover: --to-block ${toBlock} < --from-block ${fromBlock} (fail-closed)`);
  const eventId = req("--event-id");
  const out = req("--out");
  const operators = (arg("--operators") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  assertKeylessOperators(operators);

  const ledgerDir = assertLedgerDir(req("--ledger-dir"), ROOT); // CA-11: OUTSIDE the repo, must pre-exist
  const cycle = req("--cycle");
  const maxCalls = reqInt("--max-calls");
  if (!(maxCalls > 0)) throw new Error("u4b-discover: --max-calls must be > 0 (C-5 fail-closed budget)");
  const methodCaps = parseMethodCaps(arg("--method-caps"));
  const minIntervalMs = arg("--min-interval-ms") !== undefined ? Number(arg("--min-interval-ms")) : 50;

  // Keyless label pools = --operators intersected with the two package keyless pools (the paid leg is impossible:
  // assertKeylessOperators already refused it). Distinct-by-operatorOf >= 2 per method (nodies+pocket = ONE operator).
  const ethCallLabels = ETH_CALL_KEYLESS_LABELS.filter((l) => operators.includes(l));
  const getLogsLabels = GET_LOGS_KEYLESS_LABELS.filter((l) => operators.includes(l));
  const distinct = (labels) => new Set(labels.map((u) => operatorOf(u))).size;
  if (distinct(getLogsLabels) < 2) throw new Error(`u4b-discover: eth_getLogs quorum-2 needs >= 2 distinct keyless operators in --operators (${distinct(getLogsLabels)} left)`);
  if (distinct(ethCallLabels) < 2) throw new Error(`u4b-discover: eth_getBlockByNumber quorum-2 needs >= 2 distinct keyless operators in --operators (${distinct(ethCallLabels)} left)`);

  let rpcErrorCount = 0;
  const errByOp = {};
  const onTransportError = (op) => { rpcErrorCount += 1; errByOp[op] = (errByOp[op] ?? 0) + 1; };
  // Keyless-only: floor/maxRu are chainstack-only and UNUSED here (openU4GuardedClient builds runCaps/cycleFloor = {}).
  const { client } = openU4GuardedClient({ env: deps.env, ledgerDir, cycle, floor: 0, maxRu: 0, methodCaps, maxCalls, ethCallLabels, getLogsLabels, onTransportError });
  const guarded = makeGuardedPoolCall(client, { retries: 2, backoffMs: 200, backoffCapMs: 4000 });
  const pool = makeUkemiPool({ call: guarded.call, ethCallProviders: ethCallLabels, getLogsProviders: getLogsLabels, minIntervalMs, chunk: 9990 });
  try {
    const rawLogs = await pool.getLogsRange(POOL, [LIQ_TOPIC], fromBlock, toBlock);
    const records = decodeAndSort(rawLogs);
    const tsOf = async (block) => (await pool.blockAt(block)).ts;
    const clusters = await clusterWethLiquidations(records, tsOf);
    // The DETERMINISTIC brut (tri canonique + sha256): reproducible from (from, to, decoded logs), no timing inside.
    const brut = { schema: "ukemi-u4b-discover/1", event_id: eventId, pool: POOL.toLowerCase(), liq_topic: LIQ_TOPIC, from_block: fromBlock, to_block: toBlock, n_logs: records.length, records };
    const brutSha = sha256Hex(canon(brut));
    const provenance = {
      model: "claude-opus-4-8[1m]", recorded_at_utc: new Date(deps.now()).toISOString(), phase: "u4b-discover", event_id: eventId,
      endpoints: { eth_getLogs: distinctLabels(getLogsLabels), eth_call: distinctLabels(ethCallLabels) }, quorum: 2,
      params: { from_block: fromBlock, to_block: toBlock, min_interval_ms: minIntervalMs, max_calls: maxCalls },
      calls: guarded.total(), calls_by_operator: guarded.byOperator(), calls_by_method: guarded.byMethod(),
      errors_by_operator: errByOp, rpc_error_count: rpcErrorCount, liq_topic: LIQ_TOPIC, brut_sha256: brutSha, n_clusters: clusters.length,
    };
    const output = { provenance, brut, clusters: clusters.map((c) => ({ b_first: c.b_first, b_last: c.b_last, b0: c.b0, n_members: c.n_members, n_distinct_liquidated: c.n_distinct_liquidated })) };
    writeFileSync(out, JSON.stringify(output, null, 2));
    process.stdout.write(`u4b-discover event=${eventId} [${fromBlock},${toBlock}] n_logs=${records.length} n_clusters=${clusters.length} brut_sha256=${brutSha}\n  calls=${guarded.total()}/${maxCalls} by_operator=${JSON.stringify(guarded.byOperator())} out=${out}\n`);
    return { out, brutSha, nLogs: records.length, nClusters: clusters.length };
  } catch (e) {
    if (e instanceof BudgetExceededError) process.stderr.write(`u4b-discover: BUDGET STOP after ${guarded.total()} calls (${e.message}; --max-calls ${maxCalls}); NO partial brut written; raise budget (R-26) and re-run.\n`);
    throw e;
  } finally {
    // Served release of every keyless operator this run locked (a hard kill leaves them for the resume unlock).
    unlockAll(client, { ledgerDir, cycle, floor: 0, reason: "u4b-discover course end" });
  }
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runDiscover(process.argv.slice(2), { env: process.env, now: () => Date.now() }).catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
