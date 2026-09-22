// scripts/census/u4-guard.mjs
// ============================================================================================
// GARDE-HELIUS-2b-iii shared wiring for the U-4b course scripts (u4-oracle-path.mjs, u4-redraw.mjs).
// The paid archive leg no longer rides a raw endpoint: every operator (keyless witnesses + the paid
// Chainstack leg) is resolved and metered INSIDE @monark/rpc-guard. This module owns the four moving parts
// of the migration so the two course scripts do not triplicate them:
//   1) budget-arg parsing (--ledger-dir/--cycle/--floor/--max-ru/--method-caps/--max-calls), REQUIRED, fail-closed;
//   2) openGuardedClient wiring (labels only, subset requested = the operators actually used);
//   3) a pool-facing shim = attempt tally (provenance) + caller-side bounded retry;
//   4) the N-operator served unlock (runCli) at course end.
//
// CLASS IDENTITY (post 2b-ii merge, this rebased tree): apps/sentinel/src/ukemi/rpc2.ts now RE-EXPORTS the package
// BudgetExceededError / RpcError (rpc2.RpcError === @monark/rpc-guard RpcError, asserted by the test
// u4_guard_error_classes_are_the_package_classes), so the pool guards (quorum2/getLogsVia/finalized) test `e
// instanceof` the SAME classes openGuardedClient raises. The identity BRIDGE that 2b-iii carried at its pre-rebase
// base (e7f22b8, when rpc2 still declared its OWN classes) is therefore REMOVED here -- its item-formed trigger,
// "the 2b-ii merge", has fired: this module no longer imports the pool error classes; the shim consumes the package
// errors directly. A budget refusal is re-raised FIRST (never benched, never retried); a concordant on-chain revert
// stays ConcordantRevertError (isRpcRevert recognises the package RpcError) so the D_e bytes are preserved (the
// byte-identity replay verifies emode_raw["8"] == ConcordantRevertError on the keyless path).
// No raw network round-trip here, no paid key read here: the guard owns both. Run-guarded scripts only.
// ============================================================================================
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import {
  openGuardedClient, runCli,
  BudgetExceededError as PkgBudgetError, RpcError as PkgRpcError, TransportError as PkgTransportError,
  ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS,
} from "@monark/rpc-guard";

/** sha256 of a text after CRLF->LF normalization (the prereg is compared LF-normalized: A-2 / --prereg-sha).
 *  Inlined here so the course scripts no longer depend on record.ts (2b-ii removes lfSha256 from record.ts). */
export function lfSha256(text) {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

/** Canonical JSON (keys sorted recursively, arrays in order, no whitespace) — a BYTE-IDENTICAL copy of
 *  liquidation-logs.mjs `canon`, inlined here because the course scripts (u4-oracle-path.mjs) carry a CLOSED import
 *  allowlist (test rpc-guard-fetch-only-inside-client `u4_scripts_clean_and_import_sources_closed`) that forbids
 *  importing scripts/census/u4b/*. u4-oracle-path uses it to VERIFY episode-selection.json's selection_sha256; the two
 *  copies are pinned byte-for-byte by the parity test `u4guard_canon_matches_liquidation_logs_canon` on a nested vector. */
export function canon(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canon).join(",") + "]";
  return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + canon(obj[k])).join(",") + "}";
}

/** sha256 (hex) of a UTF-8 string — the digest paired with `canon` for the episode-selection.json sha check. */
export function sha256Hex(s) {
  return createHash("sha256").update(String(s), "utf8").digest("hex");
}

/** The paid operator label of this migration (decision 121: label of the OPERATOR, unique per account; the
 *  network is a journal attribute, never a second label). Appended LAST, as the archive leg was. */
export const CHAINSTACK_LABEL = "chainstack";

/** Build the keyless ETH label pools (pinned identical order to rpc2.ts ETH_CALL_PROVIDERS / GET_LOGS_PROVIDERS,
 *  transport.ts:32), drop any excluded operator by label, and append the paid `chainstack` LAST iff requested.
 *  Labels ARE the operator names now, so an exclude matches a bare label (calque applyExcludeOperators, which
 *  matched providerOf domain OR published label -- both equal the label here). */
export function buildLabelLists({ withChainstack, excluded = [] }) {
  const drop = (labels) => labels.filter((l) => !excluded.includes(l));
  const withPaid = (labels) => (withChainstack && !excluded.includes(CHAINSTACK_LABEL) ? [...labels, CHAINSTACK_LABEL] : labels);
  return {
    ethCallLabels: withPaid(drop([...ETH_CALL_KEYLESS_LABELS])),
    getLogsLabels: withPaid(drop([...GET_LOGS_KEYLESS_LABELS])),
  };
}

/** Distinct labels in first-seen order (calque of the recorder's opLabels; labels are already operator names). */
export function distinctLabels(labels) {
  return [...new Set(labels)];
}

/** Parse + VALIDATE the guard budget arguments common to the course scripts (--ledger-dir/--cycle/--floor/
 *  --max-ru/--method-caps): ALL required, fail-closed, NO default (a course must always state its budget;
 *  --with-chainstack is the EXPLICIT paid-leg switch so the script never probes the env for a key). --max-calls
 *  is SCRIPT-specific (oracle-path requires it; redraw caps it at 60) and stays with each caller. `arg` is the
 *  script's own `(k)->value` getter; `argv` detects the flag. */
export function parseBudgetArgs(arg, argv) {
  const need = (k) => { const v = arg(k); if (v === undefined) throw new Error(`u4-guard: ${k} is required (fail-closed, no default)`); return v; };
  const ledgerDir = need("--ledger-dir");
  const cycle = need("--cycle");
  const floor = Number(need("--floor"));
  const maxRu = Number(need("--max-ru"));
  const methodCapsRaw = need("--method-caps");
  if (!(Number.isFinite(floor) && floor >= 0)) throw new Error("u4-guard: --floor must be a finite number >= 0 (fail-closed)");
  if (!(Number.isInteger(maxRu) && maxRu > 0)) throw new Error("u4-guard: --max-ru must be a positive integer (fail-closed)");
  let methodCaps;
  try { methodCaps = JSON.parse(methodCapsRaw); } catch { throw new Error("u4-guard: --method-caps must be a JSON object of method->cap (fail-closed)"); }
  if (methodCaps === null || typeof methodCaps !== "object" || Array.isArray(methodCaps)) throw new Error("u4-guard: --method-caps must be a JSON object (fail-closed)");
  for (const v of Object.values(methodCaps)) if (!(Number.isInteger(v) && v > 0)) throw new Error("u4-guard: every --method-caps value must be a positive integer (fail-closed)");
  const withChainstack = argv.includes("--with-chainstack");
  return { ledgerDir, cycle, floor, maxRu, methodCaps, withChainstack };
}

/** CA-11: the durable ledger parent must be OUTSIDE the repo tree AND PRE-EXIST (C-8: the guard creates only the
 *  <cycle> subdir; an auto-created parent is a phantom a wrong path silently reinitialises). Never mkdir here. */
export function assertLedgerDir(ledgerDir, root) {
  const abs = resolve(ledgerDir);
  const rel = relative(root, abs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4-guard: --ledger-dir is under the repo root (CA-11, must be OUTSIDE): ${abs}`);
  if (!existsSync(abs)) throw new Error(`u4-guard: --ledger-dir '${abs}' does not pre-exist (fail-closed, C-8)`);
  return abs;
}

/** Open the single budgeted client for the requested operator SUBSET (the union of the two label pools). Only
 *  the paid `chainstack` carries a run cap + a cycle floor (keyless carries neither); all requested operators
 *  share ONE cycle (keyless get the paid leg's cycle, ruling h). Fail-closes if `chainstack` is requested but
 *  not resolvable from env. `onTransportError(op,name,code)` is the per-operator error hook (never a URL). */
export function openU4GuardedClient({ env, ledgerDir, cycle, floor, maxRu, methodCaps, maxCalls, ethCallLabels, getLogsLabels, onTransportError }) {
  const requested = distinctLabels([...ethCallLabels, ...getLogsLabels]);
  const withChainstack = requested.includes(CHAINSTACK_LABEL);
  const cycles = Object.fromEntries(requested.map((l) => [l, cycle]));
  const limits = {
    maxCalls,
    runCaps: withChainstack ? { [CHAINSTACK_LABEL]: maxRu } : {},
    methodCaps,
    cycleFloor: withChainstack ? { [CHAINSTACK_LABEL]: floor } : {},
  };
  const client = openGuardedClient(env, limits, ledgerDir, cycles, onTransportError ? { onTransportError } : {});
  return { client, requested };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const backoffDelay = (attempt, baseMs, capMs) => Math.min(baseMs * 2 ** attempt, capMs);

/** Is a RAW error from the guarded client a TRANSIENT transport fault worth a caller retry? Retryable: a network/
 *  timeout/abort (code undefined) or an HTTP 429 / >= 500. NEVER: a JSON-RPC error/revert (deterministic), a
 *  NonJsonBody (a mis-route returns the same body), any other 4xx, or a budget refusal (fatal). Calque of L-1. */
function isTransient(raw) {
  if (raw instanceof PkgRpcError) return false;
  if (raw instanceof PkgBudgetError) return false;
  if (raw instanceof PkgTransportError) {
    if (raw.name === "NonJsonBody") return false;
    if (raw.name === "HttpError") return raw.code === 429 || (typeof raw.code === "number" && raw.code >= 500);
    return true; // AbortError / network / timeout (code undefined)
  }
  return false; // unknown shape: conservative, do not retry
}

/** Build the RpcCall the UkemiPool consumes. It routes every read through the guarded client (one attempt +
 *  one write-ahead ledger line per call, C-4), keeps an ATTEMPT-level tally for provenance (= the ledger; a
 *  caller retry counts each attempt, ADR-U4b D5), and retries ONLY transient faults up to `retries` (0 = none).
 *  A budget refusal (BudgetExceededError) is re-raised FIRST and NEVER retried; a refused call is NOT tallied
 *  (calque makeBudgetedCall: it rejected before the counter incremented). Post 2b-ii the guarded client raises the
 *  package error classes the pool already recognises (rpc2 re-exports them), so NO identity bridge is needed. */
export function makeGuardedPoolCall(client, { retries = 0, backoffMs = 500, backoffCapMs = 8000 } = {}) {
  let n = 0;
  const per = {};
  const perMethod = {};
  const count = (label, method) => { n += 1; per[label] = (per[label] ?? 0) + 1; perMethod[method] = (perMethod[method] ?? 0) + 1; };
  const call = async (label, method, params) => {
    for (let attempt = 0; ; attempt++) {
      let ok = false; let result; let raw;
      try { result = await client.call(label, method, params); ok = true; }
      catch (e) { raw = e; }
      if (!ok && raw instanceof PkgBudgetError) throw raw; // refused: NOT tallied, NEVER retried (fatal, re-raised FIRST)
      count(label, method); // committed attempt (success OR non-budget fault): tally at the attempt level
      if (ok) return result;
      if (raw instanceof PkgRpcError) throw raw; // deterministic revert / rpc error: never retried
      if (attempt < retries && isTransient(raw)) { await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }
      throw raw;
    }
  };
  return { call, total: () => n, byOperator: () => ({ ...per }), byMethod: () => ({ ...perMethod }) };
}

/** Served release of EVERY operator this run locked (keyless included): one runCli `unlock` per operator (a
 *  chained `unlocked` line, 0 credit, does not move the reconcile window). Best-effort in a finally: a hard
 *  kill (SIGTERM) leaves the locks held (fail-closed, by design) and the resume runs the SAME N unlocks -- the
 *  lock is never a permanent block (NARABI-OPS-1d note), the escape is this explicit served command. */
export function unlockAll(client, { ledgerDir, cycle, floor, reason }) {
  const deps = { ledgerDir, floor, readSnapshot: () => { throw new Error("u4-guard: readSnapshot is not used by unlock"); } };
  const released = [];
  for (const op of client.operators()) {
    const perFloor = op === CHAINSTACK_LABEL ? floor : 0;
    try { runCli(["unlock", "--cycle", cycle, "--op", op, "--reason", reason], { ...deps, floor: perFloor }); released.push(op); }
    catch (e) { process.stderr.write(`u4-guard: unlock of operator '${op}' failed (${e instanceof Error ? e.name : "error"}); lock LEFT for the resume unlock (fail-closed, consigned)\n`); }
  }
  return released;
}
