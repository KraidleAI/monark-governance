// scripts/census/u4-oracle-path.mjs
// ============================================================================================
// U-4a (Ukemi, ADR-M020 D1 (b) + checkpoint-1 C-4 / C-12) — REALIZED ORACLE PATH course (D_e) for event e2.
//
// D_e = the series of Chainlink AnswerUpdated logs of the WETH/USD SVR feed over [B₀, B_last], used by A-4 to
// recompute ŷ (eligible-static under D_e via HF at p_min). Reads (all quorum-2, budgeted, polite, mevblocker
// excluded, env archive leg LAST and NEVER printed — labels only):
//   1) aggregator() on the EACAggregatorProxy 0x5424384b… at B₀ AND B_last (phase ≠ ⇒ abi_mismatch, C-4).
//   2) getLogs(AnswerUpdated) on the resolved aggregator over [B₀, B_last]  (price = topics[1], indexed int256).
//   3) getAssetPrice(USDT) at 23550406 AND 23550879 (C-12 / D-1) on the pinned AaveOracle.
//   4) getEModeCategoryData(uint8) at B₀ for each distinct nonzero e-mode category in the book (RAW hex stored;
//      decoded in abi.ts after inspecting real bytes — the return shape varies across Aave v3 versions).
// Reuse (no modification) of the hardened pool from apps/sentinel/src/ukemi. OUT OF REPO raws; sha-pinned;
// NO key/URL printed. NO commit, NO workflow (R-20). Fail-closed --max-calls; --prereg-sha mandatory (order).
// ============================================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { makeDefaultCall, makeBudgetedCall, operatorLabel, applyExcludeOperators, lfSha256 } from "../../apps/sentinel/src/ukemi/record.ts";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, BudgetExceededError } from "../../apps/sentinel/src/ukemi/rpc2.ts";
import { providerOf } from "../../apps/sentinel/src/rpc.ts";
import { SEL, ANSWER_UPDATED_TOPIC0, decUint, decInt256, decAddress, wordAt, wordAddr } from "../../apps/sentinel/src/ukemi/abi.ts";
import { POOL, ORACLE } from "../../apps/sentinel/src/ukemi/clusters.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const PROXY = "0x5424384b256154046e9667ddfaaa5e550145215e"; // WETH/USD SVR feed proxy (U3-sources e2, [lu])
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const B0 = 23545087, BLAST = 23552238;                       // prereg §1: B₀ = B_first−1, B_last
const USDT_BLOCKS = [23550406, 23550879];                    // C-12 (realized line) + D-1 (DeficitCreated block)
const EMODE_CATEGORIES = [1, 2, 3, 4, 8, 11, 13, 15, 17, 19, 21, 23, 24, 27, 28]; // distinct nonzero in book (offline census)

const sha256s = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const wordU = (n) => BigInt(n).toString(16).padStart(64, "0");

async function main() {
  const preregSha = arg("--prereg-sha");
  const maxCallsRaw = arg("--max-calls");
  const rawsDir = arg("--raws-dir") ?? "F:/PRODUITS/etude-2026-09-20/u4-raws";
  const minIntervalMs = arg("--min-interval-ms") !== undefined ? Number(arg("--min-interval-ms")) : 50;
  if (preregSha === undefined) throw new Error("u4-oracle-path: --prereg-sha is required (order proof)");
  const actualPrereg = lfSha256(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8"));
  if (actualPrereg !== preregSha) throw new Error(`u4-oracle-path: --prereg-sha ${preregSha} != PLAN-u4-prereg.md LF sha ${actualPrereg}`);
  if (maxCallsRaw === undefined) throw new Error("u4-oracle-path: --max-calls is required (fail-closed budget)");
  const maxCalls = Number(maxCallsRaw);
  if (!(Number.isInteger(maxCalls) && maxCalls > 0)) throw new Error("u4-oracle-path: --max-calls must be a positive integer");
  const rawsAbs = resolve(rawsDir);
  const rel = relative(ROOT, rawsAbs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4-oracle-path: --raws-dir under repo (CA-11): ${rawsAbs}`);
  mkdirSync(rawsAbs, { recursive: true });

  const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  const ethCallProviders = applyExcludeOperators(archiveEnvUrl ? [...ETH_CALL_PROVIDERS, archiveEnvUrl] : [...ETH_CALL_PROVIDERS], ["mevblocker.io"], archiveEnvUrl);
  const getLogsProviders = applyExcludeOperators(archiveEnvUrl ? [...GET_LOGS_PROVIDERS, archiveEnvUrl] : [...GET_LOGS_PROVIDERS], ["mevblocker.io"], archiveEnvUrl);
  const rpcErrors = [];
  const errByOp = {};
  const hardened = makeDefaultCall({ retries: 3, backoffMs: 500, backoffCapMs: 8000, onRpcError: (r) => { rpcErrors.push(r); errByOp[r.provider] = (errByOp[r.provider] ?? 0) + 1; } });
  const budgeted = makeBudgetedCall(maxCalls, hardened, archiveEnvUrl);
  const pool = makeUkemiPool({ call: budgeted.call, ethCallProviders, getLogsProviders, minIntervalMs, chunk: 9990 });
  const opLabels = (urls) => [...new Set(urls.map((u) => operatorLabel(u, archiveEnvUrl)))];

  const cache = []; // JSONL cache lines (resume/replay), same schema family as U4-inputs
  const t0 = Date.now();
  try {
    // 1) aggregator() at both bornes
    const aggB0raw = await pool.ethCall(PROXY, SEL.aggregator, B0);
    const aggLastRaw = await pool.ethCall(PROXY, SEL.aggregator, BLAST);
    cache.push({ kind: "ethCall", to: PROXY, data: SEL.aggregator, block: B0, result: aggB0raw });
    cache.push({ kind: "ethCall", to: PROXY, data: SEL.aggregator, block: BLAST, result: aggLastRaw });
    const aggB0 = decAddress(wordAt(aggB0raw, 0));
    const aggLast = decAddress(wordAt(aggLastRaw, 0));
    const phaseChange = aggB0.toLowerCase() !== aggLast.toLowerCase();

    // 2) getLogs(AnswerUpdated) on the aggregator active in the window (aggB0; if a phase change, union both)
    const aggs = phaseChange ? [aggB0, aggLast] : [aggB0];
    const rawLogs = [];
    for (const agg of aggs) {
      const logs = await pool.getLogsRange(agg, [ANSWER_UPDATED_TOPIC0], B0, BLAST);
      cache.push({ kind: "getLogs", address: agg.toLowerCase(), topics: [ANSWER_UPDATED_TOPIC0], from: B0, to: BLAST, result: logs });
      for (const l of logs) rawLogs.push(l);
    }
    // topic0 self-test + decode (price = topics[1] int256, roundId = topics[2], updatedAt = data)
    const badTopic = rawLogs.find((l) => (l.topics[0] ?? "").toLowerCase() !== ANSWER_UPDATED_TOPIC0.toLowerCase());
    if (badTopic !== undefined) throw new Error(`u4-oracle-path: a log has topic0 != ANSWER_UPDATED_TOPIC0 (self-test failed)`);
    const updates = rawLogs.map((l) => ({
      block: parseInt(l.blockNumber, 16), logIndex: parseInt(l.logIndex, 16),
      price: decInt256(l.topics[1]).toString(), round_id: decUint(l.topics[2]).toString(), updated_at: decUint(l.data).toString(),
    })).sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
    const prices = updates.map((u) => BigInt(u.price));
    const pMin = prices.length ? prices.reduce((m, p) => (p < m ? p : m)).toString() : null;
    const pMax = prices.length ? prices.reduce((m, p) => (p > m ? p : m)).toString() : null;
    const monotoneBlocks = updates.every((u, i) => i === 0 || u.block >= updates[i - 1].block);

    // 3) getAssetPrice(USDT) at both blocks (C-12 / D-1)
    const usdtPrices = {};
    for (const b of USDT_BLOCKS) {
      const r = await pool.ethCall(ORACLE, SEL.getAssetPrice + wordAddr(USDT), b);
      cache.push({ kind: "ethCall", to: ORACLE, data: SEL.getAssetPrice + wordAddr(USDT), block: b, result: r });
      usdtPrices[b] = decUint(r).toString();
    }

    // 4) getEModeCategoryData(uint8) at B₀ — RAW hex per category (decode later on real bytes)
    const emodeRaw = {};
    for (const cat of EMODE_CATEGORIES) {
      const data = SEL.getEModeCategoryData + wordU(cat);
      try {
        const r = await pool.ethCall(POOL, data, B0);
        cache.push({ kind: "ethCall", to: POOL, data, block: B0, result: r });
        emodeRaw[cat] = r;
      } catch (e) {
        emodeRaw[cat] = { error: e instanceof Error ? e.constructor.name : "error" };
      }
    }

    const seconds = (Date.now() - t0) / 1000;
    // Publish errors_by_operator with the env archive leg as its LABEL (never its providerOf domain, which could be
    // chainstack.com / *.p2pify.com and trip the leak-control grep — cf. PLI D-8). calls_by_operator is already labelled.
    const archiveDomain = archiveEnvUrl ? providerOf(archiveEnvUrl) : undefined;
    const errorsByOperatorPub = {};
    for (const [k, v] of Object.entries(errByOp)) errorsByOperatorPub[k === archiveDomain ? "archive-env" : k] = (errorsByOperatorPub[k === archiveDomain ? "archive-env" : k] ?? 0) + v;
    const provenance = {
      model: "claude-opus-4-8[1m]", recorded_at_utc: new Date().toISOString(), phase: "oracle-path-De",
      endpoints: { eth_call: opLabels(ethCallProviders), eth_getLogs: opLabels(getLogsProviders) }, quorum: 2,
      params: { proxy: PROXY, weth: WETH, b0: B0, b_last: BLAST, usdt_blocks: USDT_BLOCKS, emode_categories: EMODE_CATEGORIES, min_interval_ms: minIntervalMs, max_calls: maxCalls, prereg_sha: preregSha, excluded_operators: ["mevblocker.io"] },
      calls: budgeted.total(), calls_by_operator: budgeted.byOperator(), calls_by_method: budgeted.byMethod(),
      errors_by_operator: errorsByOperatorPub, rpc_error_count: rpcErrors.length, seconds, answer_updated_topic0: ANSWER_UPDATED_TOPIC0,
    };
    const raw = {
      provenance,
      aggregator: { at_b0: aggB0.toLowerCase(), at_b_last: aggLast.toLowerCase(), phase_change: phaseChange, abi_mismatch: phaseChange },
      n_updates: updates.length, monotone_blocks: monotoneBlocks, p_min: pMin, p_max: pMax,
      first_update: updates[0] ?? null, last_update: updates[updates.length - 1] ?? null,
      usdt_prices: usdtPrices, emode_raw: emodeRaw, updates,
    };
    const rawPath = join(rawsAbs, "U4-oracle-path-e2.raw.json");
    const inputsPath = join(rawsAbs, "U4-oracle-inputs.jsonl");
    const meta = { kind: "meta", schema: "ukemi-u4-oracle/1", model: "claude-opus-4-8[1m]", recorded_at_utc: provenance.recorded_at_utc, proxy: PROXY, b0: B0, b_last: BLAST, prereg_sha: preregSha, providers: [...opLabels(ethCallProviders), ...opLabels(getLogsProviders)].filter((v, i, a) => a.indexOf(v) === i) };
    const inputsBody = [meta, ...cache].map((l) => JSON.stringify(l)).join("\n") + "\n";
    const rawBody = JSON.stringify(raw, null, 2) + "\n";
    writeFileSync(inputsPath, inputsBody);
    writeFileSync(rawPath, rawBody);
    const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${v}`).join(",");
    process.stdout.write(
      `u4-oracle-path e2 aggregator@B0=${aggB0.toLowerCase()} aggregator@Blast=${aggLast.toLowerCase()} phase_change=${phaseChange}\n` +
      `  n_updates=${updates.length} monotone_blocks=${monotoneBlocks} p_min=${pMin} p_max=${pMax} first_block=${updates[0]?.block} last_block=${updates[updates.length-1]?.block}\n` +
      `  usdt_prices=${JSON.stringify(usdtPrices)} emode_categories_read=${Object.keys(emodeRaw).length}\n` +
      `  calls=${budgeted.total()}/${maxCalls} by_operator={${perOp}} rpc_errors=${rpcErrors.length} errors_by_operator=${JSON.stringify(errByOp)} seconds=${seconds.toFixed(1)}\n` +
      `  raw: ${rawPath} sha256=${sha256s(rawBody)}\n  inputs: ${inputsPath} sha256=${sha256s(inputsBody)}\n`);
  } catch (e) {
    if (e instanceof BudgetExceededError) {
      process.stderr.write(`u4-oracle-path: BUDGET STOP after ${budgeted.total()} calls (--max-calls ${maxCalls}); NO partial path written — raise budget (R-26) and re-run.\n`);
      process.exit(2);
    }
    throw e;
  }
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
