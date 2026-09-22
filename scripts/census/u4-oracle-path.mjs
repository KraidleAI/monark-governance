// scripts/census/u4-oracle-path.mjs
// ============================================================================================
// U-4b (Ukemi, ADR-U4b D_e; prereg §DISC Q-D) — REALIZED ORACLE PATH course (D_e) for the FRESH episode.
//
// PARAMETERISED by the AVAL selector (lot U-4b-1b-2): --episode-file <episode-selection.json> supplies B0 (= B_first-1)
// and B_last and is bound by its `selection_sha256` (verified here, 0 fetch on mismatch). The e2 CONCEPTION constants
// (B0/B_last/USDT_BLOCKS/EMODE_CATEGORIES) are GONE — a fresh course must NEVER silently fall onto e2. The historical e2
// run is reproduced only via the EXPLICIT flags (--episode-file <e2 selection>, --usdt-blocks, --emode-categories).
// --feed-proxy KEEPS its §DISC:28 default (WETH/USD SVR proxy 0x5424384b…; D_e semantics == e2 — documented,
// feed_proxy_source in the provenance).
//
// GARDE-HELIUS-2b-iii: every read (keyless witnesses + the paid archive leg) is metered INSIDE @monark/rpc-guard. This
// script reads NO paid endpoint key and performs NO paid round-trip directly; the guard owns both. `deps.env` is the ONLY
// env source (C-8: no process.env in the body); the paid `chainstack` leg is the EXPLICIT --with-chainstack switch.
// D_e reads (all quorum-2, budgeted, polite, mevblocker excluded):
//   1) aggregator() on the EACAggregatorProxy (--feed-proxy) at B0 AND B_last (phase ≠ ⇒ abi_mismatch, C-4).
//   2) getLogs(AnswerUpdated) on the resolved aggregator over [B0, B_last]  (price = topics[1], indexed int256).
//   3) getAssetPrice(USDT) at each --usdt-blocks block (OPTIONAL; absent ⇒ usdt_prices {} + usdt_blocks_status "omitted").
//   4) getEModeCategoryData(uint8) at B0 for each --emode-categories (or distinct nonzero e-mode in --book).
//   1b) lot U-4b-1b-4 (R-I): the pre-B0 ANCHOR = the LAST AnswerUpdated <= B0 on aggregator()@B0 (receding lookback,
//       ADDENDUM 2026-09-22 section 2), UNCONDITIONAL: none within the cap => exit 3, NO raw written (cp-1 C-4).
// usdtBlocksFromLabelerDeficit (R-H) now reads the labeler's U3-realized.jsonl with the frozen scorer's own predicate.
// OUT OF REPO raws (--raws-dir REQUIRED, C-8) + ledger; sha-pinned; NO key/URL printed. NO commit, NO workflow (R-20).
// ============================================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { makeUkemiPool, BudgetExceededError } from "../../apps/sentinel/src/ukemi/rpc2.ts";
import { SEL, ANSWER_UPDATED_TOPIC0, decUint, decInt256, decAddress, wordAt, wordAddr } from "../../apps/sentinel/src/ukemi/abi.ts";
import { POOL, ORACLE } from "../../apps/sentinel/src/ukemi/clusters.ts";
import { lfSha256, canon, sha256Hex, buildLabelLists, distinctLabels, parseBudgetArgs, assertLedgerDir, openU4GuardedClient, makeGuardedPoolCall, unlockAll } from "./u4-guard.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
/** §DISC:28 — WETH/USD SVR feed proxy (U3-sources e2, [lu]); D_e semantics == e2. The default; --feed-proxy overrides. */
const DEFAULT_FEED_PROXY = "0x5424384b256154046e9667ddfaaa5e550145215e";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const sha256s = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const wordU = (n) => BigInt(n).toString(16).padStart(64, "0");

// R-I (prereg :66 "Ancre pre-B0 = AnswerUpdated <= B0 reel", ADR-U4b D2; cp-1 C-4; ADDENDUM 2026-09-22 section 2): the
// lookback is fixed A PRIORI. Depth D_k = 9990 * 2^(k-1) blocks (k = 1..6: 9990 ... 319680); window k fetches ONLY its new
// part [B0 - D_k, B0 - D_(k-1) - 1] (window 1 = [B0 - 9990, B0]), never re-fetched, clamped at block 0, every getLogs chunk
// (<= 9990 blocks) metered by the guard. Measured on the committed e2 fixture: largest gap between two consecutive
// AnswerUpdated = 301 blocks (3636 s), so window 1 alone spans ~33 such gaps; the doubling only bounds the spend.
export const PRE_B0_FIRST_DEPTH = 9990;
export const DEFAULT_PRE_B0_MAX_WINDOWS = 6;
/** Exit status of the named STOP "no AnswerUpdated <= B0 within the cap" (0 ok, 2 budget stop, 1 fatal). */
export const EXIT_PRE_B0_ANCHOR_STOP = 3;

/** The receding lookback windows [from, to] (inclusive, disjoint, newest first) for B0 and a window cap. PURE. */
export function preB0Windows(B0, maxWindows, firstDepth = PRE_B0_FIRST_DEPTH) {
  const out = [];
  for (let k = 1; k <= maxWindows; k++) {
    const to = k === 1 ? B0 : B0 - firstDepth * 2 ** (k - 2) - 1;
    if (to < 0) break;
    const from = Math.max(0, B0 - firstDepth * 2 ** (k - 1));
    out.push([from, to]);
    if (from === 0) break;
  }
  return out;
}

/** The LAST AnswerUpdated by (block, logIndex) with lo <= block <= hi, in the cp-1 C-4 field form (price = topics[1]
 *  int256 decoded like updates[].price, round_id = topics[2]), or null. A log outside [lo, hi] is IGNORED: a node that
 *  ignores the requested range can never hand an event of [B0, B_last] over as the anchor. PURE. */
export function pickPreB0Anchor(logs, lo, hi) {
  let best = null;
  for (const l of logs) {
    const block = parseInt(l.blockNumber, 16), logIndex = parseInt(l.logIndex, 16);
    if (!(block >= lo && block <= hi)) continue;
    if (best === null || block > best.block || (block === best.block && logIndex > best.logIndex)) best = { block, logIndex, l };
  }
  return best === null ? null : { price: decInt256(best.l.topics[1]).toString(), block: best.block, log_index: best.logIndex, round_id: decUint(best.l.topics[2]).toString() };
}

/** Verify a --prereg-file (default docs/PLAN-u4b-prereg.md) exists and its LF sha == --prereg-sha (order proof). */
function verifyPrereg(arg) {
  const preregFile = arg("--prereg-file") ?? "docs/PLAN-u4b-prereg.md";
  const preregSha = arg("--prereg-sha");
  if (preregSha === undefined) throw new Error("u4-oracle-path: --prereg-sha is required (order proof)");
  const actual = lfSha256(readFileSync(join(ROOT, preregFile), "utf8"));
  if (actual !== preregSha) throw new Error(`u4-oracle-path: --prereg-sha ${preregSha} != ${preregFile} LF sha ${actual}`);
  return { preregFile, preregSha };
}

/** Read episode-selection.json, VERIFY selection_sha256 (over the file minus version_check/selection_sha256, C-5), and
 *  return { B0, bLast, episodeId, selectionSha }. A mismatch is a fail-closed refusal (0 fetch). */
export function parseEpisodeFile(path) {
  const file = JSON.parse(readFileSync(path, "utf8"));
  const { version_check: _vc, selection_sha256: carried, ...payload } = file;
  const recomputed = sha256Hex(canon(payload));
  if (recomputed !== carried) throw new Error(`u4-oracle-path: --episode-file selection_sha256 mismatch: recomputed ${recomputed} != carried ${String(carried)} (fail-closed, 0 fetch)`);
  const ep = file.episode;
  if (!ep || !Number.isInteger(ep.B0) || !Number.isInteger(ep.B_last)) throw new Error("u4-oracle-path: --episode-file episode.B0 / episode.B_last are not integers (fail-closed)");
  return { B0: ep.B0, bLast: ep.B_last, episodeId: String(ep.id), selectionSha: carried };
}

/** Distinct nonzero e-mode categories from a recorder book (accounts[].emode, decimal string), sorted ascending. */
export function emodeCategoriesFromBook(book) {
  if (!book || !Array.isArray(book.accounts)) throw new Error("u4-oracle-path: --book has no accounts[] (fail-closed)");
  const cats = new Set();
  for (const a of book.accounts) { const c = Number(a.emode); if (Number.isInteger(c) && c > 0) cats.add(c); }
  return [...cats].sort((x, y) => x - y);
}

/** R-H (runbook C-7; cp-1 C-1(ii)): the --usdt-blocks the FROZEN scorer needs, from the labeler's U3-realized.jsonl (NOT
 *  U3-deficit.jsonl: its kinds are in_event/bad_debt_other_reserve/window_other/positive_control, never "deficit" -
 *  measured on e2, the old helper returned []). `required` = distinct first_block of the lines matching the scorer's OWN
 *  predicate (u4b-scores.mjs:109-116: deficit_base == 0, residual has "deficit_base_no_price", deficit_native > 0); such a
 *  line on a NON-USDT debt makes the scorer throw, so it throws here (STOP at step 4, abstention rule prereg :87-89).
 *  `optional` (only with inputsJsonl = U3-inputs.jsonl) = the USDT DeficitCreated blocks (kind "deficit") of the SAME
 *  users: a COSTED read the scorer never uses (it reproduces the e2 usdt_prices keys). All events of the file are taken
 *  (a superset of the scorer's event_id filter; the fresh labeler file holds one event). Sorted distinct; PURE. */
export function usdtBlocksFromLabelerDeficit(realizedJsonl, inputsJsonl) {
  const rows = (text, what) => String(text).split(/\r?\n/).filter((l) => l.trim() !== "").map((l, i) => {
    try { return JSON.parse(l); } catch { throw new Error(`u4-oracle-path: ${what} line ${i + 1} is not JSON (fail-closed)`); }
  });
  const required = new Set(), users = new Set(), nonUsdt = [];
  for (const o of rows(realizedJsonl, "U3-realized")) {
    if (!(BigInt(o.deficit_base ?? "0") === 0n && Array.isArray(o.residual) && o.residual.includes("deficit_base_no_price") && BigInt(o.deficit_native ?? "0") > 0n)) continue;
    if (String(o.debt_asset).toLowerCase() !== USDT) { nonUsdt.push(String(o.debt_asset)); continue; }
    if (!Number.isInteger(o.first_block)) throw new Error(`u4-oracle-path: deficit_base_no_price line has no integer first_block (${String(o.first_block)}) (fail-closed)`);
    required.add(o.first_block);
    users.add(String(o.user).toLowerCase());
  }
  if (nonUsdt.length > 0) throw new Error(`u4-oracle-path: ${nonUsdt.length} deficit_base_no_price line(s) on a NON-USDT debt asset (first: ${nonUsdt[0]}); the frozen scorer throws on them (u4b-scores.mjs:113) - STOP at step 4 (abstention rule), never a --usdt-blocks value`);
  const optional = new Set();
  if (inputsJsonl !== undefined) {
    for (const o of rows(inputsJsonl, "U3-inputs")) if (o.kind === "deficit" && String(o.debt_asset).toLowerCase() === USDT && users.has(String(o.user).toLowerCase()) && Number.isInteger(o.block)) optional.add(o.block);
  }
  const sorted = (s) => [...s].sort((x, y) => x - y);
  return { required: sorted(required), optional: sorted(optional), blocks: sorted(new Set([...required, ...optional])) };
}

/** The realized oracle path course. `deps = { env, now }` — deps.env is the ONLY env source (C-8); tests stub
 *  globalThis.fetch. Returns { status, rawPath, inputsPath } (status 2 = a controlled BUDGET STOP). */
export async function run(argv, deps) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const { preregFile, preregSha } = verifyPrereg(arg);

  const episodePath = arg("--episode-file");
  if (episodePath === undefined) throw new Error("u4-oracle-path: --episode-file <episode-selection.json> is required (fresh episode; e2 defaults are GONE)");
  const { B0, bLast, episodeId, selectionSha } = parseEpisodeFile(episodePath);

  const rawsDir = arg("--raws-dir");
  if (rawsDir === undefined) throw new Error("u4-oracle-path: --raws-dir <dir, out of repo> is required (fail-closed, no default — the e2 default is GONE, C-8)");
  const minIntervalMs = arg("--min-interval-ms") !== undefined ? Number(arg("--min-interval-ms")) : 50;
  const maxCallsRaw = arg("--max-calls");
  if (maxCallsRaw === undefined) throw new Error("u4-oracle-path: --max-calls is required (fail-closed budget)");
  const maxCalls = Number(maxCallsRaw);
  if (!(Number.isInteger(maxCalls) && maxCalls > 0)) throw new Error("u4-oracle-path: --max-calls must be a positive integer");
  // R-I: the lookback cap, OPTIONAL with the named default (ADDENDUM section 2: 6 windows); refused before any fetch.
  const maxWindowsArg = arg("--pre-b0-max-windows");
  const preB0MaxWindows = maxWindowsArg === undefined ? DEFAULT_PRE_B0_MAX_WINDOWS : Number(maxWindowsArg);
  if (!(Number.isInteger(preB0MaxWindows) && preB0MaxWindows > 0)) throw new Error("u4-oracle-path: --pre-b0-max-windows must be a positive integer (fail-closed)");

  const feedProxyArg = arg("--feed-proxy");
  const feedProxy = (feedProxyArg ?? DEFAULT_FEED_PROXY).toLowerCase();
  const feedProxySource = feedProxyArg === undefined ? "default §DISC:28" : "flag";

  // --usdt-blocks OPTIONAL (C-7): absent => usdt_prices {} + usdt_blocks_status "omitted" (never a silent e2 default).
  const usdtBlocks = arg("--usdt-blocks") !== undefined ? String(arg("--usdt-blocks")).split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n)) : [];
  const usdtBlocksStatus = arg("--usdt-blocks") === undefined ? "omitted" : "provided";

  // --emode-categories <list> OR --book <recorder book> (distinct nonzero); fail-closed if BOTH absent.
  let emodeCategories;
  if (arg("--emode-categories") !== undefined) emodeCategories = String(arg("--emode-categories")).split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
  else if (arg("--book") !== undefined) emodeCategories = emodeCategoriesFromBook(JSON.parse(readFileSync(arg("--book"), "utf8")));
  else throw new Error("u4-oracle-path: one of --emode-categories <list> or --book <recorder book> is required (fail-closed; the e2 EMODE_CATEGORIES default is GONE)");

  // GARDE-HELIUS-2b-iii: the guard budget arguments (all REQUIRED, fail-closed) + the durable ledger dir.
  const budget = parseBudgetArgs(arg, argv);
  const ledgerDir = assertLedgerDir(budget.ledgerDir, ROOT);
  const rawsAbs = resolve(rawsDir);
  const rel = relative(ROOT, rawsAbs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4-oracle-path: --raws-dir under repo (CA-11): ${rawsAbs}`);
  mkdirSync(rawsAbs, { recursive: true });

  const { ethCallLabels, getLogsLabels } = buildLabelLists({ withChainstack: budget.withChainstack, excluded: ["mevblocker.io"] });
  let rpcErrorCount = 0;
  const errByOp = {};
  const onTransportError = (op) => { rpcErrorCount += 1; errByOp[op] = (errByOp[op] ?? 0) + 1; };
  const { client } = openU4GuardedClient({ env: deps.env, ledgerDir, cycle: budget.cycle, floor: budget.floor, maxRu: budget.maxRu, methodCaps: budget.methodCaps, maxCalls, ethCallLabels, getLogsLabels, onTransportError });
  const guarded = makeGuardedPoolCall(client, { retries: 3, backoffMs: 500, backoffCapMs: 8000 });
  const pool = makeUkemiPool({ call: guarded.call, ethCallProviders: ethCallLabels, getLogsProviders: getLogsLabels, minIntervalMs, chunk: 9990 });
  const opLabels = (labels) => distinctLabels(labels);

  const cache = []; // JSONL cache lines (resume/replay), same schema family as U4-inputs
  const t0 = deps.now();
  try {
    // 1) aggregator() at both bornes
    const aggB0raw = await pool.ethCall(feedProxy, SEL.aggregator, B0);
    const aggLastRaw = await pool.ethCall(feedProxy, SEL.aggregator, bLast);
    cache.push({ kind: "ethCall", to: feedProxy, data: SEL.aggregator, block: B0, result: aggB0raw });
    cache.push({ kind: "ethCall", to: feedProxy, data: SEL.aggregator, block: bLast, result: aggLastRaw });
    const aggB0 = decAddress(wordAt(aggB0raw, 0));
    const aggLast = decAddress(wordAt(aggLastRaw, 0));
    const phaseChange = aggB0.toLowerCase() !== aggLast.toLowerCase();

    // 1b) R-I: pre-B0 anchor on aggB0 (receding lookback, every getLogs metered; UNCONDITIONAL, cp-1 C-4).
    const callsBeforeAnchor = guarded.total();
    let preB0Anchor = null;
    let windowsTried = 0, searchedFrom = B0;
    for (const [from, to] of preB0Windows(B0, preB0MaxWindows)) {
      const logs = await pool.getLogsRange(aggB0, [ANSWER_UPDATED_TOPIC0], from, to);
      cache.push({ kind: "getLogs", address: aggB0.toLowerCase(), topics: [ANSWER_UPDATED_TOPIC0], from, to, result: logs });
      windowsTried += 1;
      searchedFrom = from;
      if (logs.some((l) => (l.topics[0] ?? "").toLowerCase() !== ANSWER_UPDATED_TOPIC0.toLowerCase())) throw new Error("u4-oracle-path: a pre-B0 log has topic0 != ANSWER_UPDATED_TOPIC0 (self-test failed)");
      preB0Anchor = pickPreB0Anchor(logs, from, to);
      if (preB0Anchor !== null) break;
    }
    const preB0Window = { from: searchedFrom, to: B0, windows_tried: windowsTried, calls: guarded.total() - callsBeforeAnchor };
    if (preB0Anchor === null) {
      process.stderr.write(`u4-oracle-path: PRE-B0 ANCHOR STOP - no AnswerUpdated <= B0 ${B0} on ${aggB0.toLowerCase()} over [${searchedFrom}, ${B0}] (${windowsTried} window(s), --pre-b0-max-windows ${preB0MaxWindows}, ${preB0Window.calls} calls); NO raw written - the book fallback is inadmissible for the -1b course (ADDENDUM 2026-09-22 section 2, cp-1 C-4).\n`);
      return { status: EXIT_PRE_B0_ANCHOR_STOP };
    }

    // 2) getLogs(AnswerUpdated) on the aggregator active in the window (aggB0; if a phase change, union both)
    const aggs = phaseChange ? [aggB0, aggLast] : [aggB0];
    const rawLogs = [];
    for (const agg of aggs) {
      const logs = await pool.getLogsRange(agg, [ANSWER_UPDATED_TOPIC0], B0, bLast);
      cache.push({ kind: "getLogs", address: agg.toLowerCase(), topics: [ANSWER_UPDATED_TOPIC0], from: B0, to: bLast, result: logs });
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

    // 3) getAssetPrice(USDT) at each --usdt-blocks block (OPTIONAL; omitted => {})
    const usdtPrices = {};
    for (const b of usdtBlocks) {
      const r = await pool.ethCall(ORACLE, SEL.getAssetPrice + wordAddr(USDT), b);
      cache.push({ kind: "ethCall", to: ORACLE, data: SEL.getAssetPrice + wordAddr(USDT), block: b, result: r });
      usdtPrices[b] = decUint(r).toString();
    }

    // 4) getEModeCategoryData(uint8) at B0 — RAW hex per category (decode later on real bytes)
    const emodeRaw = {};
    for (const cat of emodeCategories) {
      const data = SEL.getEModeCategoryData + wordU(cat);
      try {
        const r = await pool.ethCall(POOL, data, B0);
        cache.push({ kind: "ethCall", to: POOL, data, block: B0, result: r });
        emodeRaw[cat] = r;
      } catch (e) {
        emodeRaw[cat] = { error: e instanceof Error ? e.constructor.name : "error" };
      }
    }

    const seconds = (deps.now() - t0) / 1000;
    const provenance = {
      model: "claude-opus-4-8[1m]", recorded_at_utc: new Date(deps.now()).toISOString(), phase: "oracle-path-De",
      episode_id: episodeId, selection_sha256: selectionSha, prereg_sha: preregSha, prereg_file: preregFile,
      endpoints: { eth_call: opLabels(ethCallLabels), eth_getLogs: opLabels(getLogsLabels) }, quorum: 2, pre_b0_anchor_window: preB0Window,
      params: { proxy: feedProxy, feed_proxy_source: feedProxySource, weth: WETH, b0: B0, b_last: bLast, usdt_blocks: usdtBlocks, usdt_blocks_status: usdtBlocksStatus, emode_categories: emodeCategories, pre_b0_max_windows: preB0MaxWindows, min_interval_ms: minIntervalMs, max_calls: maxCalls, prereg_sha: preregSha, prereg_file: preregFile, episode_id: episodeId, selection_sha256: selectionSha, excluded_operators: ["mevblocker.io"] },
      calls: guarded.total(), calls_by_operator: guarded.byOperator(), calls_by_method: guarded.byMethod(),
      errors_by_operator: errByOp, rpc_error_count: rpcErrorCount, seconds, answer_updated_topic0: ANSWER_UPDATED_TOPIC0,
    };
    const raw = {
      provenance,
      aggregator: { at_b0: aggB0.toLowerCase(), at_b_last: aggLast.toLowerCase(), phase_change: phaseChange, abi_mismatch: phaseChange },
      pre_b0_anchor: preB0Anchor,
      n_updates: updates.length, monotone_blocks: monotoneBlocks, p_min: pMin, p_max: pMax,
      first_update: updates[0] ?? null, last_update: updates[updates.length - 1] ?? null,
      usdt_prices: usdtPrices, emode_raw: emodeRaw, updates,
    };
    const rawPath = join(rawsAbs, `U4-oracle-path-${episodeId}.raw.json`);
    const inputsPath = join(rawsAbs, "U4-oracle-inputs.jsonl");
    const meta = { kind: "meta", schema: "ukemi-u4-oracle/1", model: "claude-opus-4-8[1m]", recorded_at_utc: provenance.recorded_at_utc, proxy: feedProxy, b0: B0, b_last: bLast, episode_id: episodeId, selection_sha256: selectionSha, prereg_sha: preregSha, providers: [...opLabels(ethCallLabels), ...opLabels(getLogsLabels)].filter((v, i, a) => a.indexOf(v) === i) };
    const inputsBody = [meta, ...cache].map((l) => JSON.stringify(l)).join("\n") + "\n";
    const rawBody = JSON.stringify(raw, null, 2) + "\n";
    writeFileSync(inputsPath, inputsBody);
    writeFileSync(rawPath, rawBody);
    const perOp = Object.entries(guarded.byOperator()).map(([k, v]) => `${k}:${v}`).join(",");
    process.stdout.write(
      `u4-oracle-path episode=${episodeId} aggregator@B0=${aggB0.toLowerCase()} aggregator@Blast=${aggLast.toLowerCase()} phase_change=${phaseChange}\n` +
      `  pre_b0_anchor block=${preB0Anchor.block} log_index=${preB0Anchor.log_index} price=${preB0Anchor.price} round_id=${preB0Anchor.round_id} windows_tried=${windowsTried}/${preB0MaxWindows} from=${searchedFrom} calls=${preB0Window.calls}\n` +
      `  n_updates=${updates.length} monotone_blocks=${monotoneBlocks} p_min=${pMin} p_max=${pMax} first_block=${updates[0]?.block} last_block=${updates[updates.length-1]?.block}\n` +
      `  usdt_blocks_status=${usdtBlocksStatus} usdt_prices=${JSON.stringify(usdtPrices)} emode_categories_read=${Object.keys(emodeRaw).length} feed_proxy_source=${feedProxySource}\n` +
      `  calls=${guarded.total()}/${maxCalls} by_operator={${perOp}} rpc_errors=${rpcErrorCount} errors_by_operator=${JSON.stringify(errByOp)} seconds=${seconds.toFixed(1)}\n` +
      `  raw: ${rawPath} sha256=${sha256s(rawBody)}\n  inputs: ${inputsPath} sha256=${sha256s(inputsBody)}\n`);
    return { status: 0, rawPath, inputsPath };
  } catch (e) {
    if (e instanceof BudgetExceededError) {
      process.stderr.write(`u4-oracle-path: BUDGET STOP after ${guarded.total()} calls (${e.message}; --max-calls ${maxCalls}); NO partial path written - raise budget (R-26) and re-run.\n`);
      return { status: 2 };
    }
    throw e;
  } finally {
    // Served release of every operator this run locked (keyless included); a hard kill leaves them for resume unlock.
    unlockAll(client, { ledgerDir, cycle: budget.cycle, floor: budget.floor, reason: "u4-oracle-path course end" });
  }
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run(process.argv.slice(2), { env: process.env, now: () => Date.now() })
    .then((r) => { if (r && r.status) process.exitCode = r.status; })
    .catch((e) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
