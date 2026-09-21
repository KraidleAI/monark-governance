// scripts/census/u4-probe.mjs
// ============================================================================================
// U-4a (Ukemi, ADR-M020 D1 (b) + checkpoint-1 C-5) — COST PROBE (probe) for the WETH book at B₀.
//
// The book course reads ~2N + N_at-risk·~16 quorum values; the probe bounds the spend BEFORE it by measuring
// the ONLY unknown that drives cost — N, the number of distinct aWETH holders at B₀ — via the enumeration
// getLogs alone (~1412 calls, the "N-known-before-you-spend" leg, checkpoint §2). It writes NO per-account
// read: the projection is reported and the run STOPS for the orchestrator's go/no-go (dashboard read, PLI).
//
// Order (strict, prereg §5): prereg committed → THIS probe → go/no-go → course. `--prereg-sha` is MANDATORY and
// re-checked against docs/PLAN-u4-prereg.md (LF sha), so an order violation fails closed (U4-H1 not post hoc).
//
// Reuse (no modification): the hardened quorum pool from apps/sentinel/src/ukemi (record.ts makeDefaultCall /
// makeBudgetedCall / operatorLabel; rpc2.ts makeUkemiPool + provider sets; abi.ts TRANSFER_TOPIC0 /
// transferRecipients; clusters.ts CLUSTER_WETH; resume.ts holdersDigestOf / reducedRecipientLogs). Quorum-2 by
// method; `--max-calls` fail-closed; per-provider politeness; the env archive leg (CHAINSTACK_ETH_URL) is added
// LAST and NEVER printed (published as `archive-env`); no key/URL is ever written.
//
// Output (OUT OF REPO at --raws-dir, default F:\PRODUITS\etude-2026-09-20\u4-raws\): the resume/inputs cache
// U4-inputs.jsonl (meta + ONE getLogs entry holding the REDUCED recipient set + a holders line) so the course
// resumes without re-paying the enumeration, plus U4-probe.json (N, calls, by-operator, seconds, projections).
// Both are sha-pinned to stdout for PROVENANCE-u4.md. NO commit, NO workflow (R-20).
// ============================================================================================
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { makeDefaultCall, makeBudgetedCall, operatorLabel, lfSha256 } from "../../apps/sentinel/src/ukemi/record.ts";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, BudgetExceededError } from "../../apps/sentinel/src/ukemi/rpc2.ts";
import { TRANSFER_TOPIC0, transferRecipients } from "../../apps/sentinel/src/ukemi/abi.ts";
import { CLUSTER_WETH } from "../../apps/sentinel/src/ukemi/clusters.ts";
import { holdersDigestOf, reducedRecipientLogs } from "../../apps/sentinel/src/ukemi/resume.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", ".."); // scripts/census -> repo root
const B0 = 23545087; // prereg §1: book of reference (WETH cluster, just before the liquidations)
const CHUNK = 9990; // census: <= common getLogs cap; one quorum read per window
const RATIO_AT_RISK = 91 / 157; // U-1a measured at-risk / holders (G1-lot-u1a.md:87 [lu]) — expected projection
const PER_ACCOUNT_CALLS = 9; // ~4-5 LOGICAL book reads/account (balanceOf aWETH, getUserAccountData, getUserEMode, k_debt x balanceOf) x quorum-2 ≈ 8-10 CALLS (checkpoint §2); 9 = midpoint. NOT x2 again (a 2026-09-20 worker error used 18 — double-counted quorum; see PLI §5 error_origin).

const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };

async function main() {
  const preregSha = arg("--prereg-sha");
  const maxCallsRaw = arg("--max-calls");
  const rawsDir = arg("--raws-dir") ?? "F:/PRODUITS/etude-2026-09-20/u4-raws";
  const block = arg("--block") !== undefined ? Number(arg("--block")) : B0;
  const minIntervalMs = arg("--min-interval-ms") !== undefined ? Number(arg("--min-interval-ms")) : 200;

  // Fail-closed guards (calque Bell / u3-realized).
  if (preregSha === undefined) throw new Error("u4-probe: --prereg-sha is required (order proof; e.g. --prereg-sha <sha256 LF of docs/PLAN-u4-prereg.md>)");
  const actualPrereg = lfSha256(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8"));
  if (actualPrereg !== preregSha) throw new Error(`u4-probe: --prereg-sha ${preregSha} != docs/PLAN-u4-prereg.md LF sha ${actualPrereg} (commit the prereg FIRST, prereg §5)`);
  if (maxCallsRaw === undefined) throw new Error("u4-probe: --max-calls is required (fail-closed budget; e.g. --max-calls 30000)");
  const maxCalls = Number(maxCallsRaw);
  if (!(Number.isInteger(maxCalls) && maxCalls > 0)) throw new Error("u4-probe: --max-calls must be a positive integer");
  if (block !== B0) throw new Error(`u4-probe: --block ${String(block)} != prereg B₀ ${String(B0)} (the prereg fixes the reference block)`);

  // CA-11: the raws dir MUST be OUTSIDE the repo tree.
  const rawsAbs = resolve(rawsDir);
  const rel = relative(ROOT, rawsAbs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4-probe: --raws-dir is under the repo root (CA-11: raws must be OUTSIDE the tree): ${rawsAbs}`);
  mkdirSync(rawsAbs, { recursive: true });

  // Hardened, budgeted, polite quorum pool with the env archive leg appended LAST (never printed).
  const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  const getLogsProviders = archiveEnvUrl ? [...GET_LOGS_PROVIDERS, archiveEnvUrl] : [...GET_LOGS_PROVIDERS];
  const ethCallProviders = archiveEnvUrl ? [...ETH_CALL_PROVIDERS, archiveEnvUrl] : [...ETH_CALL_PROVIDERS];
  const rpcErrors = [];
  const hardened = makeDefaultCall({ retries: 3, backoffMs: 500, backoffCapMs: 8000, onRpcError: (r) => rpcErrors.push(r) });
  const budgeted = makeBudgetedCall(maxCalls, hardened, archiveEnvUrl);
  const pool = makeUkemiPool({ call: budgeted.call, ethCallProviders, getLogsProviders, minIntervalMs, chunk: CHUNK });

  const leg = CLUSTER_WETH.collaterals[0];
  const aToken = leg.aToken;
  const from = leg.reserveInitBlock;

  // Enumerate PER WINDOW (bounded memory: one window's logs + the recipient set), reducing to recipients as we
  // go — never holding the whole Transfer stream. Same primitive as book.ts:110 ⇒ the SAME holder set.
  const recipients = new Set();
  let totalRawLogs = 0;
  let windows = 0;
  const t0 = Date.now();
  try {
    for (let f = from; f <= block; f += CHUNK) {
      const t = Math.min(f + CHUNK - 1, block);
      const logs = await pool.getLogsRange(aToken, [TRANSFER_TOPIC0], f, t);
      totalRawLogs += logs.length;
      for (const r of transferRecipients(logs)) recipients.add(r);
      windows += 1;
      if (windows % 50 === 0) process.stderr.write(`  ..probe window ${String(windows)} @block ${String(t)} recipients=${String(recipients.size)} calls=${String(budgeted.total())} rawlogs=${String(totalRawLogs)} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
    }
  } catch (e) {
    if (e instanceof BudgetExceededError) {
      process.stderr.write(`u4-probe: BUDGET STOP after ${String(budgeted.total())} calls (--max-calls ${String(maxCalls)}); enumeration incomplete — RAISE the probe budget and re-run, do NOT report a partial N.\n`);
      process.exit(2);
    }
    throw e;
  }
  const seconds = (Date.now() - t0) / 1000;

  const { holders, holders_digest } = holdersDigestOf(recipients);
  const N = holders.length;

  // Projections (calls, ALL methods, quorum included) for the go/no-go:
  //  filter    = 2N        (getUserConfiguration x quorum-2 over every holder)
  //  perAcct   = ~18/acct  (getUserAccountData, getUserEMode, aToken balanceOf, per-debt balanceOf, reserve reads) x quorum-2
  const filterCalls = 2 * N;
  const nAtRiskExpected = Math.round(N * RATIO_AT_RISK);
  const projectionUpper = filterCalls + N * PER_ACCOUNT_CALLS; // every holder at-risk (worst case)
  const projectionExpected = filterCalls + nAtRiskExpected * PER_ACCOUNT_CALLS; // U-1a ratio
  const withEnumeration = budgeted.total(); // enumeration already paid

  const byOperator = budgeted.byOperator();
  const providersLabels = [...new Set([...getLogsProviders, ...ethCallProviders].map((u) => operatorLabel(u, archiveEnvUrl)))];

  // Resume/inputs cache (OUT OF REPO): meta + ONE getLogs entry with the REDUCED recipient set + holders line, so
  // the course reuses the enumeration (getLogs HIT ⇒ no budget) and any tamper trips the holders_digest guard.
  const inputsPath = join(rawsAbs, "U4-inputs.jsonl");
  const meta = { kind: "meta", schema: "ukemi-u4-inputs/1", model: "claude-opus-4-8[1m]", recorded_at_utc: new Date().toISOString(),
    cluster: CLUSTER_WETH.id, block, from_block: from, chain_id: "1", providers: providersLabels, prereg_sha: preregSha, phase: "probe" };
  const getLogsLine = { kind: "getLogs", address: aToken.toLowerCase(), topics: [TRANSFER_TOPIC0], from, to: block, result: reducedRecipientLogs(holders) };
  const holdersLine = { kind: "holders", n: N, holders_digest };
  const inputsBody = [meta, getLogsLine, holdersLine].map((l) => JSON.stringify(l)).join("\n") + "\n";
  writeFileSync(inputsPath, inputsBody);

  const probe = { model: "claude-opus-4-8[1m]", recorded_at_utc: meta.recorded_at_utc, prereg_sha: preregSha, cluster: CLUSTER_WETH.id,
    atoken: aToken.toLowerCase(), from_block: from, to_block: block, chunk: CHUNK, windows,
    holders_distinct: N, holders_digest, total_raw_transfer_logs: totalRawLogs,
    enumeration_calls: withEnumeration, calls_by_operator: byOperator, seconds, rpc_error_count: rpcErrors.length,
    ratio_at_risk_u1a: RATIO_AT_RISK, per_account_calls_upper: PER_ACCOUNT_CALLS,
    projection_filter_calls: filterCalls, n_at_risk_expected: nAtRiskExpected,
    projection_expected_total: projectionExpected, projection_upper_total: projectionUpper,
    providers: providersLabels };
  const probePath = join(rawsAbs, "U4-probe.json");
  writeFileSync(probePath, JSON.stringify(probe, null, 2) + "\n");

  const inputsSha = sha256(inputsBody);
  const probeSha = sha256(JSON.stringify(probe, null, 2) + "\n");
  const perOp = Object.entries(byOperator).map(([k, v]) => `${k}:${String(v)}`).join(",");
  process.stdout.write(
    `u4-probe cluster=${CLUSTER_WETH.id} B=${String(block)} holders=${String(N)} holders_digest=${holders_digest}\n` +
    `  enumeration: windows=${String(windows)} raw_logs=${String(totalRawLogs)} calls=${String(withEnumeration)}/${String(maxCalls)} by_operator={${perOp}} seconds=${seconds.toFixed(1)} rpc_errors=${String(rpcErrors.length)}\n` +
    `  projection (calls, all methods, quorum incl.): filter=2N=${String(filterCalls)} ; expected(atRisk~${String(nAtRiskExpected)} @U1a 91/157)=${String(projectionExpected)} ; upper(all ${String(N)} at-risk)=${String(projectionUpper)}\n` +
    `  raws: ${inputsPath} sha256=${inputsSha}\n        ${probePath} sha256=${probeSha}\n`);
}

// Run-guard: live network; never on import.
if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
