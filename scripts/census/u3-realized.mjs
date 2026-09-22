// scripts/census/u3-realized.mjs
// POOL-RPC-1a NOTE (ADR-POOL-RPC-1, decision 106; Q2): FROZEN — NOT rerun as-is. It IMPORTS PUBLIC_ENDPOINTS, so it
// inherits the revised (−Blast −Llama +Pocket) sentinel pool automatically; the keyless legs feed 1rpc into a
// HEAVY eth_getLogs campaign by inheritance (falsifies SYNTHESE §1, L-6) ⇒ never replay as-is (sha-pinned outputs).
// ============================================================================================
// U-3 (Ukemi, ADR-M020 D1 (b)) — realized labels Y_{i,e} for the three observed Aave v3 core events
// (e1 2025-02-21 sUSDe, e2 2025-10-10/11 WETH, e3 2026-01-19 sUSDe), decomposed into
// repayment / seized collateral / deficit, with the oracle source per asset at each event's bounds.
//
// Pre-registration: docs/PLAN-u3-prereg.md — its LF sha256 is passed as --prereg-sha and re-checked here
// (C-10). Provenance: model claude-opus-4-8[1m], date 2026-09-20, mission "lot U-3" (MONARK), reviewer =
// orchestrator (R-21). Discipline: read-only RPC (keyless pool of apps/sentinel/src/rpc.ts, REUSED without
// touching it; a PAID archive leg is OPTIONAL via --archive-operator, resolved ONLY inside @monark/rpc-guard,
// fail-closed without --allow-paid); NO commit, NO workflow (R-20); NO env key is read at module scope. NO key or
// URL is ever printed (every error is rewritten to providerOf(url) / scrubUrls; the guard never returns a URL).
//
// Reuse (no modification): apps/sentinel/src/rpc.ts (providerOf, PUBLIC_ENDPOINTS, TRANSFER_TOPIC);
// apps/sentinel/src/windows.ts (firstBlockAtOrAfter); apps/sentinel/src/ukemi/abi.ts (keccak256 self-test,
// SEL selectors, exact-integer decoders). Quorum-2 by method (ADR-U1 D3): a value read needs TWO DISTINCT
// operators (by providerOf) returning byte-identical results, else no_quorum ⇒ the row abstains (residual
// no_quorum, amounts null, out of every Σ and of U3-H3), never a partial row presented complete.
//
// Cost: --max-calls is MANDATORY and fail-closed (aborts + persists the resume log; re-run to resume). Raw
// concordant reads are archived OUT OF REPO at --raws-dir (default F:\PRODUITS\etude-2026-09-20\u3-raws\),
// sha-pinned in PROVENANCE-u3.md; the reduced in-repo replay input is U3-inputs.jsonl (C-3, CGU-compliant:
// decoded public on-chain data recomputed, no raw provider bytes committed).
//
// This module SPLITS a PURE reducer (reduceU3 / canonicalJsonl / helpers, exported, no I/O, no network) from
// the LIVE pull (main(), run-guarded at the bottom). The 4 CI tests import the reducer and replay U3-inputs.
// ============================================================================================

import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { providerOf, PUBLIC_ENDPOINTS, TRANSFER_TOPIC } from "../../apps/sentinel/src/rpc.ts";
import { firstBlockAtOrAfter } from "../../apps/sentinel/src/windows.ts";
import { keccak256, SEL, decUint, decAddress, wordAt, wordAddr, decString, decodeReserveData } from "../../apps/sentinel/src/ukemi/abi.ts";

// ---------------- pinned constants (self-tested topics/selectors; never pasted-only) ----------------
export const POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
export const POOL_ADDRESSES_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
export const ORACLE_PINNED = "0x54586bE62E3c3580375aE3723C145253060Ca0C2"; // AaveOracle; re-resolved on-chain via getPriceOracle()
export const RAWLOGS_SHA = "d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996";
// EIP-1967 implementation slot = keccak256("eip1967.proxy.implementation") - 1.
export const EIP1967_IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const lc = (a) => String(a).toLowerCase();
const toHexBlock = (n) => "0x" + BigInt(n).toString(16);

// keccak self-tests (reproducible topic/selector provenance; abi.ts already self-tests keccak at import).
if (keccak256("") !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470") throw new Error("u3: keccak self-test failed (empty vector)");
export const LIQ_TOPIC = keccak256("LiquidationCall(address,address,address,uint256,uint256,address,bool)");
export const DEFICIT_TOPIC = keccak256("DeficitCreated(address,address,uint256)");
export const UPGRADED_TOPIC = keccak256("Upgraded(address)");
if (keccak256("Transfer(address,address,uint256)") !== TRANSFER_TOPIC) throw new Error("u3: Transfer topic != rpc.ts TRANSFER_TOPIC");
if (DEFICIT_TOPIC !== "0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699") throw new Error("u3: DeficitCreated topic0 != ADR-M020 D6");
if (LIQ_TOPIC !== "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286") throw new Error("u3: LiquidationCall topic0 != census A");
if (UPGRADED_TOPIC !== "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b") throw new Error("u3: Upgraded topic0 mismatch");
export const SEL_BASE_UNIT = keccak256("BASE_CURRENCY_UNIT()").slice(0, 10);
export const SEL_GET_PRICE_ORACLE = SEL.getPriceOracle;

// Assets (lowercased). aTokens / decimals / variableDebtTokens are RESOLVED ON-CHAIN via getReserveData, never coded.
export const ASSET = {
  WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  sUSDe: "0x9d39a5de30e57443bff2a8307a4256c8797a3497",
  USDe: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
};

// Pre-committed event definitions (prereg §3). cluster = LiquidationCall with collateral==collateral AND
// block in [clusterLo, clusterHi]; B_first = clusterLo; the 24h window B_last is resolved on-chain.
export const EVENTS = [
  { id: "e1-2025-02-21-susde", collateral: ASSET.sUSDe, clusterLo: 21895671, clusterHi: 21895693, preV33: true },
  { id: "e2-2025-10-10-weth", collateral: ASSET.WETH, clusterLo: 23545088, clusterHi: 23557060, preV33: false },
  { id: "e3-2026-01-19-susde", collateral: ASSET.sUSDe, clusterLo: 24266439, clusterHi: 24266439, preV33: false },
];
// CAPO deficit positive-control (ADR-M020 PR-UK-3): DeficitCreated near this block if events carry none.
export const CAPO_BLOCK = 24626860;

// ============================================================================================
// PURE REDUCER (exported; no network, no I/O) — consumes decoded U3-inputs records, emits the 3 series.
// ============================================================================================

/** Stable JSON: keys sorted recursively, arrays in given order, no whitespace. Big integers are already
 *  decimal strings in the records, so no float ever appears. */
export function canon(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canon).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canon(obj[k])).join(",") + "}";
}
/** Canonical JSONL of a row array (each row canonicalised; one per line; trailing newline iff non-empty). */
export function canonicalJsonl(rows) {
  return rows.map(canon).join("\n") + (rows.length ? "\n" : "");
}
export function sha256Lf(str) {
  return createHash("sha256").update(String(str).replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

const floorDiv = (a, b) => a / b; // BigInt division floors toward zero for non-negative operands (all are).
/** amount_native (BigInt) × price (base-8dec BigInt) / 10^decimals ⇒ value in base currency (8 dec), floored. */
export function toBase(amountNative, price, decimals) {
  return floorDiv(BigInt(amountNative) * BigInt(price), 10n ** BigInt(decimals));
}

/** Group the U3-inputs records into maps for O(1) lookup by the reducer. */
function indexInputs(records) {
  const meta = records.find((r) => r.kind === "meta");
  if (!meta) throw new Error("u3 reduce: no meta record");
  const calls = records.filter((r) => r.kind === "call");
  const reserves = new Map(records.filter((r) => r.kind === "reserve").map((r) => [lc(r.asset), r]));
  const prices = new Map(records.filter((r) => r.kind === "price").map((r) => [lc(r.asset) + "|" + r.block, r]));
  const sources = new Map(records.filter((r) => r.kind === "source").map((r) => [r.event_id + "|" + lc(r.asset), r]));
  const xfers = records.filter((r) => r.kind === "xfer");
  const deficits = records.filter((r) => r.kind === "deficit");
  const partials = new Map(records.filter((r) => r.kind === "partial").map((r) => [r.event_id + "|" + lc(r.user) + "|" + lc(r.debt_asset), r]));
  const posControl = records.filter((r) => r.kind === "positive_control");
  return { meta, calls, reserves, prices, sources, xfers, deficits, partials, posControl };
}

/** Multiset match: does an xfer (token,from,to,amount) exist among `pool` not yet consumed? Consume it. */
function matchXfer(pool, token, from, to, amount) {
  for (let i = 0; i < pool.length; i++) {
    const x = pool[i];
    if (!x.__used && lc(x.token) === lc(token) && lc(x.from) === lc(from) && lc(x.to) === lc(to) && String(x.amount) === String(amount)) {
      x.__used = true;
      return true;
    }
  }
  return false;
}

/**
 * Pure reduction: decoded inputs -> { realized, sources, deficit } canonical row arrays + native sums.
 * A position is (user, debt_asset, collateral_asset) within one event; aggregated over its in-window calls.
 */
export function reduceU3(records) {
  const { meta, calls, reserves, prices, sources, xfers, deficits, partials, posControl } = indexInputs(records);
  const evById = new Map(meta.events.map((e) => [e.id, e]));
  const decOf = (a) => { const r = reserves.get(lc(a)); if (!r) throw new Error("u3 reduce: no reserve for " + a); return Number(r.decimals); };
  const aTokenOf = (a) => reserves.get(lc(a))?.atoken ?? null;
  const priceAt = (a, b) => prices.get(lc(a) + "|" + b) ?? null;

  // deficits keyed for join; a fresh xfer pool per (tx) so consumption is scoped to the transaction.
  const xfersByTx = new Map();
  for (const x of xfers) { const k = lc(x.tx); if (!xfersByTx.has(k)) xfersByTx.set(k, []); xfersByTx.get(k).push({ ...x }); }
  const deficitByUserDebt = new Map(); // event|user|debt -> [d]  (in_event join to a position)
  for (const d of deficits) { const k = d.event_id + "|" + lc(d.user) + "|" + lc(d.debt_asset); if (!deficitByUserDebt.has(k)) deficitByUserDebt.set(k, []); deficitByUserDebt.get(k).push(d); }
  // positions indexed by (event|user) and (event|user|debt) to classify each deficit (in_event / other_reserve / window_other)
  const posUserDebt = new Set([...calls].filter((c) => c.in_window).map((c) => c.event_id + "|" + lc(c.user) + "|" + lc(c.debt)));
  const posUser = new Set([...calls].filter((c) => c.in_window).map((c) => c.event_id + "|" + lc(c.user)));
  const otherReserveUsers = new Set(); // event|user with a deficit on a reserve other than their liquidated debt
  for (const d of deficits) { const k3 = d.event_id + "|" + lc(d.user) + "|" + lc(d.debt_asset), k2 = d.event_id + "|" + lc(d.user); if (!posUserDebt.has(k3) && posUser.has(k2)) otherReserveUsers.add(k2); }

  // ---- aggregate in-window calls by position ----
  const posMap = new Map(); // event|user|debt|coll -> aggregate
  for (const c of calls) {
    if (!c.in_window) continue;
    const key = c.event_id + "|" + lc(c.user) + "|" + lc(c.debt) + "|" + lc(c.collateral);
    if (!posMap.has(key)) posMap.set(key, { event_id: c.event_id, user: lc(c.user), debt: lc(c.debt), collateral: lc(c.collateral), calls: [] });
    posMap.get(key).calls.push(c);
  }

  const realized = [];
  for (const pos of posMap.values()) {
    const ev = evById.get(pos.event_id);
    const residual = new Set();
    let repayNative = 0n, seizedNative = 0n, repayBase = 0n, seizedBase = 0n;
    let abstain = false;
    const blocks = [];
    const txs = [];
    for (const c of pos.calls) {
      blocks.push(c.block);
      if (!txs.includes(lc(c.tx))) txs.push(lc(c.tx));
      repayNative += BigInt(c.debt_to_cover);
      seizedNative += BigInt(c.liquidated_collateral);
      // base conversion needs price@block for both assets; abstain the row if any read is missing (no_quorum).
      const pd = priceAt(pos.debt, c.block), pc = priceAt(pos.collateral, c.block);
      if (!pd || !pc || pd.price === null || pc.price === null) { abstain = true; residual.add("no_quorum"); continue; }
      repayBase += toBase(c.debt_to_cover, pd.price, decOf(pos.debt));
      seizedBase += toBase(c.liquidated_collateral, pc.price, decOf(pos.collateral));
      if (pd.price_prev !== null && String(pd.price_prev) !== String(pd.price)) residual.add("price_moved_in_block");
      if (pc.price_prev !== null && String(pc.price_prev) !== String(pc.price)) residual.add("price_moved_in_block");
      // cross-check underlying Transfers (C-7); receiveAToken=false in every measured case.
      const pool = xfersByTx.get(lc(c.tx)) ?? [];
      if (c.receive_atoken) { residual.add("receive_atoken"); }
      else {
        const aDebt = aTokenOf(pos.debt), aColl = aTokenOf(pos.collateral);
        const repOk = aDebt && matchXfer(pool, pos.debt, c.liquidator, aDebt, c.debt_to_cover);
        const seizeOk = aColl && matchXfer(pool, pos.collateral, aColl, c.liquidator, c.liquidated_collateral);
        if (!repOk || !seizeOk) residual.add("xfer_mismatch");
      }
    }
    // deficit join (C-8): same (event,user,debtAsset). Pre-v3.3 event ⇒ topic absent by construction.
    let deficitBase = 0n, deficitNative = 0n;
    if (ev?.pre_v33) residual.add("deficit_topic_absent");
    const dk = pos.event_id + "|" + pos.user + "|" + pos.debt;
    for (const d of deficitByUserDebt.get(dk) ?? []) {
      deficitNative += BigInt(d.amount);
      const pd = priceAt(pos.debt, d.block);
      if (pd && pd.price !== null) deficitBase += toBase(d.amount, pd.price, decOf(pos.debt)); else residual.add("deficit_base_no_price");
      residual.add("deficit");
    }
    if (otherReserveUsers.has(pos.event_id + "|" + pos.user)) residual.add("bad_debt_other_reserve");
    // partial liquidation (C-9): remaining variable debt at B_last > 0.
    const part = partials.get(pos.event_id + "|" + pos.user + "|" + pos.debt);
    if (part && part.remaining_debt !== null && BigInt(part.remaining_debt) > 0n) residual.add("partial_liquidation");
    else if (part && part.remaining_debt === null) residual.add("no_quorum");
    // sources per leg (C-7 join to U3-sources).
    const sDebt = sources.get(pos.event_id + "|" + pos.debt);
    const sColl = sources.get(pos.event_id + "|" + pos.collateral);
    if (sDebt && sColl && (sDebt.source_change || sColl.source_change)) residual.add("source_change");

    realized.push({
      event_id: pos.event_id,
      user: pos.user,
      debt_asset: pos.debt,
      collateral_asset: pos.collateral,
      n_calls: pos.calls.length,
      first_block: Math.min(...blocks),
      last_block: Math.max(...blocks),
      repayment_native: repayNative.toString(),
      seized_native: seizedNative.toString(),
      repayment_base: abstain ? null : repayBase.toString(),
      seized_base: abstain ? null : seizedBase.toString(),
      deficit_base: deficitBase.toString(),
      deficit_native: deficitNative.toString(),
      oracle_source_debt: sDebt ? lc(sDebt.at_last.source) : null,
      oracle_source_collateral: sColl ? lc(sColl.at_last.source) : null,
      residual: [...residual].sort(),
      txs: txs.sort(),
    });
  }
  const rkey = (r) => r.event_id + "|" + r.user + "|" + r.debt_asset + "|" + r.collateral_asset;
  realized.sort((a, z) => rkey(a) < rkey(z) ? -1 : rkey(a) > rkey(z) ? 1 : 0);

  // ---- U3-sources rows (one per event×asset×borne) ----
  const srcRows = [];
  for (const s of sources.values()) {
    for (const borne of ["at_first_minus1", "at_last"]) {
      srcRows.push({ event_id: s.event_id, asset: lc(s.asset), borne, source: lc(s[borne].source), description: s[borne].description });
    }
  }
  srcRows.sort((a, z) => (a.event_id + a.asset + a.borne) < (z.event_id + z.asset + z.borne) ? -1 : 1);

  // ---- U3-deficit rows (authoritative window set; classified). in_event join a WETH position; other_reserve =
  // same user, another debt reserve (_burnBadDebt); window_other = a non-cluster liquidation's bad debt in the
  // same window (measured: the crash's bad debt spans other collaterals). positive_control = external anchor. ----
  const defRows = [];
  for (const d of deficits) {
    const k3 = d.event_id + "|" + lc(d.user) + "|" + lc(d.debt_asset), k2 = d.event_id + "|" + lc(d.user);
    const kind = posUserDebt.has(k3) ? "in_event" : posUser.has(k2) ? "bad_debt_other_reserve" : "window_other";
    defRows.push({ event_id: d.event_id, block: d.block, tx: lc(d.tx), user: lc(d.user), debt_asset: lc(d.debt_asset), amount: String(d.amount), kind });
  }
  for (const p of posControl) defRows.push({ event_id: "positive-control", block: p.block, tx: lc(p.tx), user: lc(p.user), debt_asset: lc(p.debt_asset), amount: String(p.amount), kind: "positive_control" });
  defRows.sort((a, z) => (a.event_id + String(a.block).padStart(12, "0") + a.tx + a.debt_asset) < (z.event_id + String(z.block).padStart(12, "0") + z.tx + z.debt_asset) ? -1 : 1);

  return { realized, sources: srcRows, deficit: defRows };
}

/** Σ repayment_native per (event_id, debt_asset) over the realized rows — the U3-H3 pipeline identity. */
export function sumRepaymentNative(realized) {
  const m = new Map();
  for (const r of realized) { const k = r.event_id + "|" + r.debt_asset; m.set(k, (m.get(k) ?? 0n) + BigInt(r.repayment_native)); }
  return m;
}

// ============================================================================================
// LIVE PULL (run-guarded main). Everything below touches the network / disk.
// ============================================================================================

// LOT U-4b-1b-1 (ruling QF-2): the live section is PARAMETRISED (events / rawlogs-sha / prereg-file / episode-tag /
// out) with DEFAULTS = the e2 values, so no argument is byte-identical to the pinned run. NO env key is read at any
// scope: KEYLESS-ONLY by default (CARTO-T1-1); --archive-operator adds a PAID leg resolved ONLY inside
// @monark/rpc-guard (dynamic import in the paid branch), so this script reads no key and no URL. A quorum "leg" is
// { op, key, call }: `op` is the quorum-distinctness identity, `key` the cooldown key, `call(method, params)` the read.
const KEYLESS_WITNESS_LABELS = new Set(["drpc.org", "mevblocker.io", "nodies.app", "pocket.network", "tenderly.co", "solana-foundation", "xstocks-issuer"]);
const isPaidOperator = (label) => !KEYLESS_WITNESS_LABELS.has(label); // fail-closed: an unknown label is PAID (covers chainstack AND helius, incl. case variants)
// POOL-RPC-1a L-6 (header :2-4): 1rpc.io in a HEAVY eth_getLogs campaign falsifies SYNTHESE; EXCLUDED from the default
// keyless pool AND refused if named in --operators (fail-closed). `meta.providers` is a label set, not a sha pin.
const EXCLUDED_OPERATORS = ["1rpc.io"];
const scrubUrls = (s) => String(s ?? "").replace(/https?:\/\/[^\s"'\\]+/gi, "<url>"); // defense in depth on every logged message

// ---- per-run mutable state: RESET by resetRunState() at the top of main() so repeated in-process runs never share it ----
let CALL_LEGS = [];
let callCount = 0;
let MAX_CALLS = 0;
let MIN_INTERVAL_MS = 60; // politeness (<= 300/min per provider in practice); overridable by --min-interval-ms
let cooldownUntil = new Map();
let lastCallAt = 0;
let LATEST_FINALIZED = 0;
let RAWS_FILE = "";
let cache = new Map();
function resetRunState() { CALL_LEGS = []; callCount = 0; MAX_CALLS = 0; MIN_INTERVAL_MS = 60; cooldownUntil = new Map(); lastCallAt = 0; LATEST_FINALIZED = 0; RAWS_FILE = ""; cache = new Map(); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function polite() { const wait = lastCallAt + MIN_INTERVAL_MS - Date.now(); if (wait > 0) await sleep(wait); lastCallAt = Date.now(); }

/** A keyless leg wraps a PUBLIC_ENDPOINTS URL: cooldown keyed by URL (two aliases keep distinct cooldowns), quorum
 *  identity is providerOf(url) (two aliases of one operator count as ONE). The URL never leaves this closure. */
function makeKeylessLeg(url) { return { op: providerOf(url), key: url, call: (method, params) => callOn(url, method, params) }; }

async function callOn(url, method, params) {
  if (callCount >= MAX_CALLS) { const e = new Error(`MAX_CALLS ${MAX_CALLS} reached`); e.budget = true; throw e; }
  callCount++;
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 20000);
  try {
    let res;
    try { res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: callCount, method, params }), signal: ctl.signal }); }
    catch { const e = new Error(`net error @${providerOf(url)}`); e.net = true; throw e; }
    if (!res.ok) { const e = new Error(`HTTP ${res.status} @${providerOf(url)}`); e.http = res.status; throw e; }
    const j = await res.json();
    if (j.error) { const m = JSON.stringify(j.error); const e = new Error(`rpc error @${providerOf(url)}`); e.rpcMsg = m; if (/execution reverted|revert/i.test(m)) e.revert = true; if (/429|rate|limit|capacity|usage/i.test(m)) e.rate = true; throw e; }
    if (j.result === undefined) throw new Error(`no result @${providerOf(url)}`);
    return j.result;
  } finally { clearTimeout(to); }
}

const benchMs = (e) => (e.http === 429 || e.http === 503 || e.rate) ? 25000 : 6000;
const REVERT = Symbol("concordant-revert");

/** Quorum-2 by method: two DISTINCT operators (leg.op) returning the SAME key. Concordant revert => REVERT
 *  (caller decides). Disagreement / <2 => throws (no_quorum). Budget error propagates. */
async function quorum2(label, legs, fetchOne, keyOf) {
  const liveList = legs.filter((L) => (cooldownUntil.get(L.key) ?? 0) <= Date.now());
  const list = liveList.length >= 2 ? liveList : legs;
  const got = []; const seen = new Set(); let lastErr;
  for (let i = 0; i < list.length && got.length < 2; i++) {
    const leg = list[i]; const op = leg.op;
    if (seen.has(op)) continue;
    try { await polite(); const v = await fetchOne(leg); got.push({ op, kind: "ok", key: "ok:" + keyOf(v), val: v }); seen.add(op); }
    catch (e) {
      if (e.budget) throw e;
      if (e.revert) { got.push({ op, kind: "revert", key: "revert" }); seen.add(op); }
      else { lastErr = e; cooldownUntil.set(leg.key, Date.now() + benchMs(e)); }
    }
  }
  const [a, b] = got;
  if (!a || !b) { const e = new Error(`${label}: no_quorum${lastErr ? " (" + scrubUrls(lastErr.message) + ")" : ""}`); e.noQuorum = true; throw e; }
  if (a.key !== b.key) { const e = new Error(`${label}: disagreement ${a.op}/${b.op}`); e.disagree = true; throw e; }
  if (a.kind === "revert") return { value: REVERT, provA: a.op, provB: b.op };
  return { value: a.val, provA: a.op, provB: b.op };
}

// resume log / raws (out of repo): one line per concordant read {k, v, pa, pb}. Doubles as resume cache.
function loadCache() {
  if (RAWS_FILE && existsSync(RAWS_FILE)) for (const line of readFileSync(RAWS_FILE, "utf8").split("\n")) { if (!line.trim()) continue; try { const r = JSON.parse(line); cache.set(r.k, r); } catch { /* skip */ } }
}
function remember(k, value, provA, provB) { const rec = { k, v: value === REVERT ? "__REVERT__" : value, pa: provA, pb: provB }; cache.set(k, rec); if (RAWS_FILE) appendFileSync(RAWS_FILE, JSON.stringify(rec) + "\n"); return rec; }
const cachedVal = (rec) => rec.v === "__REVERT__" ? REVERT : rec.v;

const asHexNonEmpty = (x) => { if (typeof x !== "string" || !/^0x[0-9a-fA-F]*$/.test(x)) throw new Error("eth_call: non-hex result"); if (x === "0x") throw new Error("eth_call: empty (archive miss)"); return x; };

async function ethCallQ(label, to, data, block) {
  const k = `call|${lc(to)}|${data}|${block}`;
  const hit = cache.get(k); if (hit) return cachedVal(hit);
  const r = await quorum2(label, CALL_LEGS, (leg) => leg.call("eth_call", [{ to, data }, toHexBlock(block)]).then(asHexNonEmpty), (v) => v);
  remember(k, r.value, r.provA, r.provB); return r.value;
}
async function storageQ(label, addr, slot, block) {
  const k = `stor|${lc(addr)}|${slot}|${block}`;
  const hit = cache.get(k); if (hit) return cachedVal(hit);
  const r = await quorum2(label, CALL_LEGS, (leg) => leg.call("eth_getStorageAt", [addr, slot, toHexBlock(block)]).then(asHexNonEmpty), (v) => v);
  remember(k, r.value, r.provA, r.provB); return r.value;
}
async function blockTsQ(block) {
  const k = `blockts|${block}`;
  const hit = cache.get(k); if (hit) return Number(cachedVal(hit));
  const r = await quorum2(`blockTs ${block}`, CALL_LEGS, (leg) => leg.call("eth_getBlockByNumber", [toHexBlock(block), false]).then((b) => { if (!b || typeof b.timestamp !== "string") throw new Error("bad block"); return b; }), (b) => b.hash);
  const ts = parseInt(r.value.timestamp, 16); remember(k, String(ts), r.provA, r.provB); return ts;
}
const logKeyOf = (logs) => createHash("sha256").update(JSON.stringify([...logs].map((l) => [parseInt(l.logIndex, 16), lc(l.address), l.topics.map(lc), lc(l.data)]).sort((a, z) => a[0] - z[0]))).digest("hex");
async function receiptQ(tx) {
  const k = `receipt|${lc(tx)}`;
  const hit = cache.get(k); if (hit) return cachedVal(hit);
  const r = await quorum2(`receipt ${tx.slice(0, 10)}`, CALL_LEGS, (leg) => leg.call("eth_getTransactionReceipt", [tx]).then((rc) => { if (!rc || !Array.isArray(rc.logs)) throw new Error("no receipt"); return rc.logs.map((l) => ({ address: lc(l.address), topics: l.topics.map(lc), data: lc(l.data), logIndex: l.logIndex })); }), logKeyOf);
  remember(k, r.value, r.provA, r.provB); return r.value;
}
const LOGS_CHUNK = 2000; // conservative: keeps every keyless operator (drpc/mevblocker/blastapi 400 on wider) in play
async function getLogsQ(label, address, topics, fromB, toB) {
  const k = `logs|${lc(address)}|${topics.map((t) => t ?? "null").join(",")}|${fromB}|${toB}`;
  const hit = cache.get(k); if (hit) return cachedVal(hit);
  const r = await quorum2(label, CALL_LEGS, (leg) => leg.call("eth_getLogs", [{ address, fromBlock: toHexBlock(fromB), toBlock: toHexBlock(toB), topics }]).then((ls) => { if (!Array.isArray(ls)) throw new Error("logs not array"); return ls.map((l) => ({ address: lc(l.address), topics: l.topics.map(lc), data: lc(l.data), blockNumber: l.blockNumber, logIndex: l.logIndex, transactionHash: lc(l.transactionHash) })); }), logKeyOf);
  remember(k, r.value, r.provA, r.provB); return r.value;
}
/** getLogs over [fromB,toB], quorum-2 per <=LOGS_CHUNK sub-range, concatenated + deduped by (block,logIndex,tx). */
async function getLogsChunkedQ(label, address, topics, fromB, toB) {
  const out = [];
  for (let s = fromB; s <= toB; s += LOGS_CHUNK) {
    const e = Math.min(s + LOGS_CHUNK - 1, toB);
    for (const l of await getLogsQ(`${label}[${s},${e}]`, address, topics, s, e)) out.push(l);
  }
  const seen = new Set(); const dedup = [];
  for (const l of out) { const kk = parseInt(l.blockNumber, 16) + "|" + parseInt(l.logIndex, 16) + "|" + lc(l.transactionHash); if (seen.has(kk)) continue; seen.add(kk); dedup.push(l); }
  return dedup;
}

/** Parse the --events JSON file: a non-empty array of episode definitions in the shape of EVENTS
 *  ({ id, collateral, clusterLo, clusterHi, preV33? }). Fail-closed on a missing field. */
function parseEventsFile(path) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("--events file must be a non-empty JSON array of episode definitions");
  return raw.map((e, i) => {
    for (const f of ["id", "collateral", "clusterLo", "clusterHi"]) if (e[f] === undefined || e[f] === null) throw new Error(`--events[${i}] missing '${f}' (fail-closed)`);
    return { id: String(e.id), collateral: lc(e.collateral), clusterLo: Number(e.clusterLo), clusterHi: Number(e.clusterHi), preV33: !!e.preV33 };
  });
}

/** CLI parse. DEFAULTS = the e2 values (events = EVENTS, rawlogs-sha = RAWLOGS_SHA, prereg-file = docs/PLAN-u3-prereg.md),
 *  so no argument reproduces the pinned run byte-for-byte. `events` / `rawlogsSha` are exposed so a non-LLM test can
 *  assert the defaults equal the pinned e2 values without a network call. */
export function parseArgs(argv) {
  const a = {
    rawlogs: "", rawlogsSha: RAWLOGS_SHA, events: EVENTS, episodeTag: null, out: null, operators: null,
    archiveOperator: null, allowPaid: false, minIntervalMs: 60, preregFile: "docs/PLAN-u3-prereg.md", preregSha: "",
    maxCalls: 0, rawsDir: null, only: null,
    ledgerDir: null, cycle: null, floor: null, maxRu: null, methodCaps: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--rawlogs") a.rawlogs = argv[++i];
    else if (t === "--rawlogs-sha") a.rawlogsSha = String(argv[++i]);
    else if (t === "--events") a.events = parseEventsFile(argv[++i]);
    else if (t === "--episode-tag") a.episodeTag = String(argv[++i]);
    else if (t === "--out") a.out = argv[++i];
    else if (t === "--operators") a.operators = String(argv[++i]).split(",").map((s) => s.trim()).filter(Boolean);
    else if (t === "--archive-operator") a.archiveOperator = String(argv[++i]);
    else if (t === "--allow-paid") a.allowPaid = true;
    else if (t === "--min-interval-ms") a.minIntervalMs = Number(argv[++i]);
    else if (t === "--prereg-file") a.preregFile = argv[++i];
    else if (t === "--prereg-sha") a.preregSha = argv[++i];
    else if (t === "--max-calls") a.maxCalls = Number(argv[++i]);
    else if (t === "--raws-dir") a.rawsDir = argv[++i];
    else if (t === "--only") a.only = String(argv[++i]).split(",");
    else if (t === "--ledger-dir") a.ledgerDir = argv[++i];
    else if (t === "--cycle") a.cycle = argv[++i];
    else if (t === "--floor") a.floor = argv[++i];
    else if (t === "--max-ru") a.maxRu = argv[++i];
    else if (t === "--method-caps") a.methodCaps = argv[++i];
  }
  return a;
}

/** Resolve the OPTIONAL paid archive leg via @monark/rpc-guard (dynamic import: the keyless default and the fail-closed
 *  refusal never load rpc-guard). The script passes only LABELS + budget; the key/URL are read ONLY inside the guard.
 *  Reuses scripts/census/u4-guard.mjs (the established GARDE-HELIUS-2b-iii wiring). Fail-closed on every missing input. */
async function openArchiveLeg({ env, args, REPO }) {
  const { openU4GuardedClient, makeGuardedPoolCall, assertLedgerDir, unlockAll, CHAINSTACK_LABEL } = await import("./u4-guard.mjs");
  const label = args.archiveOperator;
  if (label !== CHAINSTACK_LABEL) throw new Error(`--archive-operator '${label}' is not a supported guarded paid leg (only '${CHAINSTACK_LABEL}' is the ETH archive; fail-closed)`);
  for (const [flag, v] of [["--ledger-dir", args.ledgerDir], ["--cycle", args.cycle], ["--floor", args.floor], ["--max-ru", args.maxRu], ["--method-caps", args.methodCaps]]) {
    if (v === null || v === undefined) throw new Error(`${flag} is required for a paid --archive-operator (fail-closed, no default)`);
  }
  const ledgerDir = assertLedgerDir(args.ledgerDir, REPO);
  const floor = Number(args.floor), maxRu = Number(args.maxRu);
  if (!(Number.isFinite(floor) && floor >= 0)) throw new Error("--floor must be a finite number >= 0 (fail-closed)");
  if (!(Number.isInteger(maxRu) && maxRu > 0)) throw new Error("--max-ru must be a positive integer (fail-closed)");
  let methodCaps;
  try { methodCaps = JSON.parse(args.methodCaps); } catch { throw new Error("--method-caps must be a JSON object of method->cap (fail-closed)"); }
  if (methodCaps === null || typeof methodCaps !== "object" || Array.isArray(methodCaps)) throw new Error("--method-caps must be a JSON object (fail-closed)");
  const { client } = openU4GuardedClient({ env, ledgerDir, cycle: String(args.cycle), floor, maxRu, methodCaps, maxCalls: MAX_CALLS, ethCallLabels: [label], getLogsLabels: [label] });
  const pool = makeGuardedPoolCall(client, { retries: 0 });
  const leg = { op: label, key: label, call: (method, params) => pool.call(label, method, params) };
  const unlock = () => unlockAll(client, { ledgerDir, cycle: String(args.cycle), floor, reason: "u3-labeler-archive-done" });
  return { leg, client, unlock };
}

export async function main(deps) {
  resetRunState();
  const env = deps && deps.env ? deps.env : {};
  const argv = deps && deps.argv ? deps.argv : [];
  const args = parseArgs(argv);
  const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  MIN_INTERVAL_MS = Number.isFinite(args.minIntervalMs) && args.minIntervalMs >= 0 ? args.minIntervalMs : 60;

  // ---- fail-closed guards (C-1, C-10) ----
  if (!args.rawlogs) throw new Error("--rawlogs <abs path to A-rawlogs.jsonl> is required (C-1)");
  if (!Number.isInteger(args.maxCalls) || args.maxCalls <= 0) throw new Error("--max-calls <n> is required and must be a positive integer (fail-closed budget)");
  const rawBuf = readFileSync(args.rawlogs);
  const rawSha = createHash("sha256").update(rawBuf).digest("hex");
  if (rawSha !== args.rawlogsSha) throw new Error(`--rawlogs sha256 ${rawSha} != expected ${args.rawlogsSha} (C-1) — abort`);
  const preregPath = resolve(REPO, args.preregFile);
  const preregSha = sha256Lf(readFileSync(preregPath, "utf8"));
  if (!args.preregSha) throw new Error("--prereg-sha <lf sha of the prereg file> is required (C-10)");
  if (args.preregSha !== preregSha) throw new Error(`--prereg-sha ${args.preregSha} != computed LF sha ${preregSha} of ${args.preregFile} (C-10) — abort`);

  // ---- C-6 (checkpoint-2): --out and --raws-dir are REQUIRED (no default); a path under the committed fixtures is
  //      refused fail-closed — the old default clobbered the pinned e2 series (P14), and the old --raws-dir default
  //      appended to the e2 raws. ----
  if (!args.out) throw new Error("--out <dir OUT of apps/sentinel/test/fixtures/> is required (fail-closed, no default)");
  if (!args.rawsDir) throw new Error("--raws-dir <dir, out of repo> is required (fail-closed, no default)");
  const FIXTURES_DIR = join(REPO, "apps", "sentinel", "test", "fixtures");
  const isUnder = (child, parent) => { const rel = relative(parent, resolve(child)); return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)); };
  if (isUnder(args.out, FIXTURES_DIR)) throw new Error(`--out ${resolve(args.out)} resolves under apps/sentinel/test/fixtures/; refused fail-closed (would clobber the pinned series)`);
  if (isUnder(args.rawsDir, FIXTURES_DIR)) throw new Error(`--raws-dir ${resolve(args.rawsDir)} resolves under apps/sentinel/test/fixtures/; refused fail-closed`);

  // ---- resolve the quorum legs. KEYLESS-ONLY by default (CARTO-T1-1); a PAID archive leg is fail-closed. ----
  MAX_CALLS = args.maxCalls;
  // C-7 (checkpoint-2): EXCLUDED_OPERATORS is removed from the default keyless pool AND refused if named in --operators.
  if (args.operators) {
    const bad = args.operators.filter((o) => EXCLUDED_OPERATORS.includes(o));
    if (bad.length) throw new Error(`--operators names EXCLUDED operator(s) [${bad.join(", ")}] (POOL-RPC-1a L-6); refused fail-closed`);
  }
  let keylessUrls = PUBLIC_ENDPOINTS.filter((u) => !EXCLUDED_OPERATORS.includes(providerOf(u)));
  if (args.operators) keylessUrls = keylessUrls.filter((u) => args.operators.includes(providerOf(u)));
  const keylessLegs = keylessUrls.map(makeKeylessLeg);
  let archiveLeg = null; let archiveUnlock = null;
  if (args.archiveOperator) {
    if (isPaidOperator(args.archiveOperator) && !args.allowPaid) {
      throw new Error(`--archive-operator '${args.archiveOperator}' is a PAID operator; refused fail-closed without --allow-paid (0 fetch; KEYLESS-ONLY is the served default, CARTO-T1-1)`);
    }
    const g = await openArchiveLeg({ env, args, REPO });
    archiveLeg = g.leg; archiveUnlock = g.unlock;
  }
  CALL_LEGS = [...(archiveLeg ? [archiveLeg] : []), ...keylessLegs];
  if (CALL_LEGS.length < 2) throw new Error(`fewer than 2 quorum legs resolved (${CALL_LEGS.length}); quorum-2 impossible (fail-closed)`);

  try {
    mkdirSync(args.rawsDir, { recursive: true });
    RAWS_FILE = join(args.rawsDir, "u3-reads.jsonl");
    loadCache();
    const t0 = Date.now();
    console.log(`[u3] start ${new Date().toISOString()} prereg_sha=${preregSha} rawlogs_sha ok`);
    console.log(`[u3] archive leg: ${archiveLeg ? args.archiveOperator + " (allow_paid)" : "none (keyless-only, CARTO-T1-1)"} | operators: ${[...new Set(CALL_LEGS.map((L) => L.op))].join(", ")}`);
    console.log(`[u3] resume cache: ${cache.size} reads loaded from raws | max-calls=${MAX_CALLS}`);

    const rawRows = rawBuf.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const events = args.only ? args.events.filter((e) => args.only.includes(e.id) || args.only.some((o) => e.id.startsWith(o))) : args.events;

    // ---- resolve oracle + base unit on-chain (C-9) ----
    const oracleRaw = await ethCallQ("getPriceOracle", POOL_ADDRESSES_PROVIDER, SEL_GET_PRICE_ORACLE, await blockTsQThenFinalizedBlock());
    const ORACLE = decAddress(wordAt(oracleRaw, 0));
    if (lc(ORACLE) !== lc(ORACLE_PINNED)) throw new Error(`oracle resolved ${ORACLE} != pinned ${ORACLE_PINNED}`);
    const baseUnitRaw = await ethCallQ("BASE_CURRENCY_UNIT", ORACLE, SEL_BASE_UNIT, LATEST_FINALIZED);
    const baseUnit = decUint(baseUnitRaw).toString();
    console.log(`[u3] oracle=${ORACLE} base_currency_unit=${baseUnit}`);

    const inputs = [];
    const distinctAssets = new Set();
    const eventMetas = [];
    const seenReserve = new Set();
    const seenPrice = new Set();
    let anyDeficit = false;

    for (const ev of events) {
      // cluster rows from A-rawlogs (no network)
      const cluster = rawRows.filter((r) => lc(r.collateral) === lc(ev.collateral) && r.block >= ev.clusterLo && r.block <= ev.clusterHi)
        .sort((a, z) => a.block - z.block || a.logIndex - z.logIndex);
      const bFirst = ev.clusterLo;
      const tsFirst = await blockTsQ(bFirst);
      // B_last = firstBlockAtOrAfter(ts(B_first)+86400) - 1, block ts read in quorum-2 (windows.ts algorithm).
      // hi bound bFirst+60000 (~100 days of blocks) safely brackets a 24h (~7200-block) window.
      const boundary = await firstBlockAtOrAfter(tsFirst + 86400, bFirst, bFirst + 60000, (b) => blockTsQ(b));
      const bLast = boundary - 1;
      const inWin = cluster.filter((r) => r.block >= bFirst && r.block <= bLast);
      const outWin = cluster.filter((r) => r.block > bLast);
      console.log(`[u3] ${ev.id} cluster=${cluster.length} B_first=${bFirst} B_last=${bLast} in_window=${inWin.length} outside=${outWin.length}`);

      // implementation at B_first (EIP-1967 slot) — C-6
      const implRaw = await storageQ(`impl ${ev.id}`, POOL, EIP1967_IMPL_SLOT, bFirst);
      const impl = decAddress(implRaw);

      // collateral + debt assets of this event
      const assets = new Set([lc(ev.collateral)]);
      for (const r of inWin) assets.add(lc(r.debt));
      for (const a of assets) distinctAssets.add(a);

      // reserve data (decimals, aToken, variableDebtToken) @ B_last per asset (stable; resolve once)
      for (const a of assets) {
        if (!seenReserve.has(a)) {
          seenReserve.add(a);
          try {
            const rd = decodeReserveData(await ethCallQ(`getReserveData ${a.slice(0, 8)}`, POOL, SEL.getReserveData + wordAddr(a), bLast));
            inputs.push({ kind: "reserve", asset: a, decimals: Number(rd.decimals), atoken: lc(rd.aToken), variable_debt_token: lc(rd.variableDebtToken) });
          } catch (e) { if (e.budget) throw e; inputs.push({ kind: "reserve", asset: a, decimals: null, atoken: null, variable_debt_token: null, note: "abi_mismatch_or_no_quorum" }); }
        }
      }

      // sources at both bounds (C-10 bissection = two-bound check)
      for (const a of assets) {
        const sr = { kind: "source", event_id: ev.id, asset: a };
        for (const [borne, blk] of [["at_first_minus1", bFirst - 1], ["at_last", bLast]]) {
          let source = "", description = "";
          try { source = lc(decAddress(wordAt(await ethCallQ(`getSourceOfAsset ${a.slice(0, 8)}@${blk}`, ORACLE, SEL.getSourceOfAsset + wordAddr(a), blk), 0))); }
          catch (e) { if (e.budget) throw e; source = "__no_quorum__"; }
          if (source !== "__no_quorum__" && source !== "0x0000000000000000000000000000000000000000") {
            try { const d = await ethCallQ(`description ${source.slice(0, 8)}@${blk}`, source, SEL.description, blk); description = d === REVERT ? "" : decString(d); }
            catch (e) { if (e.budget) throw e; description = e.revert ? "" : "__no_quorum__"; }
          }
          sr[borne] = { source, description };
        }
        sr.source_change = sr.at_first_minus1.source !== sr.at_last.source;
        inputs.push(sr);
      }

      // authoritative DeficitCreated in the 24h window (C-8, L-2 literal leg), post-v3.3 only; e1 pre-v3.3 ⇒
      // deficit_topic_absent by construction (no query). Complete for the window (superset of receipt-derived).
      if (!ev.preV33) {
        try {
          const defLogs = await getLogsChunkedQ(`DeficitCreated ${ev.id}`, POOL, [DEFICIT_TOPIC], bFirst, bLast);
          for (const l of defLogs) {
            if (l.topics.length < 3) continue;
            anyDeficit = true;
            inputs.push({ kind: "deficit", event_id: ev.id, block: parseInt(l.blockNumber, 16), tx: lc(l.transactionHash), user: lc(decAddress(l.topics[1])), debt_asset: lc(decAddress(l.topics[2])), amount: decUint(l.data).toString() });
          }
          console.log(`[u3] ${ev.id} DeficitCreated in window: ${defLogs.length}`);
        } catch (e) { if (e.budget) throw e; console.log(`[u3] ${ev.id} DeficitCreated getLogs no_quorum: ${scrubUrls(e.message)}`); }
      }

      // per in-window call: prices, receipt (Transfer cross-check), and record the call
      const positionsUserDebt = new Set();
      for (const c of inWin) {
        inputs.push({ kind: "call", event_id: ev.id, block: c.block, log_index: c.logIndex, tx: lc(c.tx), collateral: lc(c.collateral), debt: lc(c.debt), user: lc(c.user), liquidator: lc(c.liquidator), debt_to_cover: String(c.debtToCover), liquidated_collateral: String(c.liquidatedCollateralAmount), receive_atoken: !!c.receiveAToken, in_window: true });
        positionsUserDebt.add(lc(c.user) + "|" + lc(c.debt));
        // prices @ block and @ block-1 for both assets (C-9), cached per (asset, block)
        for (const a of [lc(c.debt), lc(c.collateral)]) {
          const pkey = a + "|" + c.block;
          if (!seenPrice.has(pkey)) {
            seenPrice.add(pkey);
            let price = null, pricePrev = null;
            try { price = decUint(await ethCallQ(`price ${a.slice(0, 8)}@${c.block}`, ORACLE, SEL.getAssetPrice + wordAddr(a), c.block)).toString(); } catch (e) { if (e.budget) throw e; }
            try { pricePrev = decUint(await ethCallQ(`price ${a.slice(0, 8)}@${c.block - 1}`, ORACLE, SEL.getAssetPrice + wordAddr(a), c.block - 1)).toString(); } catch (e) { if (e.budget) throw e; }
            inputs.push({ kind: "price", asset: a, block: c.block, price, price_prev: pricePrev });
          }
        }
        // receipt cross-check on the underlying ERC-20 Transfers (C-7). DeficitCreated is sourced from the
        // authoritative window getLogs leg (below), not from receipts — the crash's bad debt spans other
        // collaterals whose liquidations are not WETH-cluster txs (measured: only 4/28 deficits are WETH-user).
        try {
          const logs = await receiptQ(c.tx);
          for (const l of logs) {
            if (l.topics[0] === TRANSFER_TOPIC && l.topics.length >= 3) {
              inputs.push({ kind: "xfer", tx: lc(c.tx), token: lc(l.address), from: lc(decAddress(l.topics[1])), to: lc(decAddress(l.topics[2])), amount: decUint(l.data).toString() });
            }
          }
        } catch (e) { if (e.budget) throw e; /* receipt no_quorum: xfer_mismatch surfaces via missing xfers */ }
      }

      // partial liquidation: balanceOf(variableDebtToken(debt), user)@B_last (C-9)
      for (const key of positionsUserDebt) {
        const [user, debt] = key.split("|");
        const vdt = inputs.find((x) => x.kind === "reserve" && lc(x.asset) === lc(debt))?.variable_debt_token;
        let remaining = null;
        if (vdt) { try { remaining = decUint(await ethCallQ(`balanceOf vdt ${debt.slice(0, 8)}`, vdt, SEL.balanceOf + wordAddr(user), bLast)).toString(); } catch (e) { if (e.budget) throw e; } }
        inputs.push({ kind: "partial", event_id: ev.id, user: lc(user), debt_asset: lc(debt), remaining_debt: remaining });
      }

      eventMetas.push({ id: ev.id, collateral: lc(ev.collateral), cluster_lo: ev.clusterLo, cluster_hi: ev.clusterHi, b_first: bFirst, b_last: bLast, impl: lc(impl), pre_v33: ev.preV33, n_calls_cluster: cluster.length, n_calls_window: inWin.length, n_positions_window: new Set(inWin.map((r) => lc(r.user) + "|" + lc(r.debt) + "|" + lc(r.collateral))).size, n_outside_window: outWin.length, ts_first: tsFirst });
    }

    // ---- positive control for deficit (C-8) if none found in events ----
    if (!anyDeficit) {
      console.log(`[u3] no DeficitCreated in events — running external positive control near CAPO block ${CAPO_BLOCK}`);
      for (const R of [2000, 6000, 20000]) {
        let found = false;
        try {
          const logs = await getLogsChunkedQ(`deficit-positive-control ±${R}`, POOL, [DEFICIT_TOPIC], CAPO_BLOCK - R, CAPO_BLOCK + R);
          for (const l of logs) { if (l.topics.length >= 3) { inputs.push({ kind: "positive_control", block: parseInt(l.blockNumber, 16), tx: lc(l.transactionHash), user: lc(decAddress(l.topics[1])), debt_asset: lc(decAddress(l.topics[2])), amount: decUint(l.data).toString() }); found = true; } }
        } catch (e) { if (e.budget) throw e; }
        if (found) break;
      }
    }

    // ---- assemble meta + reduce + write. New provenance fields are CONDITIONAL: a default run keeps the pinned
    //      meta key set byte-for-byte (episode_tag / archive_operator / allow_paid appear only when requested). ----
    const meta = { kind: "meta", model: "claude-opus-4-8[1m]", generated: "u3-realized.mjs", prereg_sha: preregSha, chain_id: "1", pool: lc(POOL), oracle: lc(ORACLE), base_currency_unit: baseUnit, events: eventMetas, providers: [...new Set(CALL_LEGS.map((L) => L.op))], rawlogs_sha: args.rawlogsSha };
    if (args.episodeTag) meta.episode_tag = args.episodeTag;
    if (archiveLeg) { meta.archive_operator = args.archiveOperator; meta.allow_paid = true; }
    const records = [meta, ...inputs];
    const out = reduceU3(records);

    const OUT = resolve(args.out);
    mkdirSync(OUT, { recursive: true });
    const inputsJsonl = canonicalJsonl(records);
    const realizedJsonl = canonicalJsonl(out.realized);
    const sourcesJsonl = canonicalJsonl(out.sources);
    const deficitJsonl = canonicalJsonl(out.deficit);
    writeFileSync(join(OUT, "U3-inputs.jsonl"), inputsJsonl);
    writeFileSync(join(OUT, "U3-realized.jsonl"), realizedJsonl);
    writeFileSync(join(OUT, "U3-sources.jsonl"), sourcesJsonl);
    writeFileSync(join(OUT, "U3-deficit.jsonl"), deficitJsonl);

    const rawsSha = existsSync(RAWS_FILE) ? createHash("sha256").update(readFileSync(RAWS_FILE)).digest("hex") : null;
    const shas = {
      "U3-inputs.jsonl": sha256Lf(inputsJsonl), "U3-realized.jsonl": sha256Lf(realizedJsonl),
      "U3-sources.jsonl": sha256Lf(sourcesJsonl), "U3-deficit.jsonl": sha256Lf(deficitJsonl),
    };
    const sums = {};
    for (const [k, v] of sumRepaymentNative(out.realized)) sums[k] = v.toString();
    const summary = { finishedAt: new Date().toISOString(), elapsed_s: Math.round((Date.now() - t0) / 1000), calls: callCount, cache_reads: cache.size, events: eventMetas, series_sha: shas, raws_file: RAWS_FILE.replace(/.*[\\/]/, ""), raws_sha: rawsSha, repayment_native_sums: sums, deficit_rows: out.deficit.length, realized_rows: out.realized.length };
    console.log("\n===U3_SUMMARY_BEGIN===\n" + JSON.stringify(summary, null, 2) + "\n===U3_SUMMARY_END===");
    return summary;
  } finally {
    if (archiveUnlock) { try { archiveUnlock(); } catch (e) { console.error("[u3] archive unlock failed:", e && e.name ? e.name : "error"); } }
  }
}

// finalized-block helper: min number across two DISTINCT operators (nodes drift a few blocks); never the
// mutable `latest` for state reads. Used only to pick a recent, stable block for the address-stable reads
// getPriceOracle()/BASE_CURRENCY_UNIT() — both of which are themselves byte-quorum'd via ethCallQ and the
// resolved oracle is cross-checked against ORACLE_PINNED.
async function blockTsQThenFinalizedBlock() {
  if (LATEST_FINALIZED) return LATEST_FINALIZED;
  const list = CALL_LEGS.filter((L) => (cooldownUntil.get(L.key) ?? 0) <= Date.now());
  const nums = []; const seen = new Set(); let lastErr;
  for (let i = 0; i < list.length && nums.length < 2; i++) {
    const leg = list[i]; const op = leg.op;
    if (seen.has(op)) continue;
    try { await polite(); const b = await leg.call("eth_getBlockByNumber", ["finalized", false]); if (!b || typeof b.number !== "string") throw new Error("bad finalized"); nums.push(parseInt(b.number, 16)); seen.add(op); }
    catch (e) { if (e.budget) throw e; lastErr = e; cooldownUntil.set(leg.key, Date.now() + benchMs(e)); }
  }
  if (nums.length < 2) { const e = new Error(`finalized: no_quorum${lastErr ? " (" + scrubUrls(lastErr.message) + ")" : ""}`); e.noQuorum = true; throw e; }
  LATEST_FINALIZED = Math.min(...nums);
  return LATEST_FINALIZED;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) main({ env: process.env, argv: process.argv.slice(2) }).catch((e) => { console.error("FATAL", scrubUrls(e && e.message ? e.message : String(e))); process.exit(1); });
