// MONARK Bell — T-1a-iii-a1 universe enumeration (identity + ScaledUiAmount, first-hand, ZERO Helius).
// NO network: the http/rpc calls are stubbed; the CLI runs the WHOLE composition from FILE fixtures
// (CA-11 durci, B-8). Named mutants (each replayed RED, restored byte-exact — see G1 report):
//  - owner != Token-2022 trusted as confirmed => red (bell_universe_enumerates_from_issuer_list_and_onchain)
//  - a founding mint dropped / owner wrong => calibration red (bell_universe_founding_mints...)
//  - a price field added to CANDIDATE_FIELDS => allowlist red (bell_universe_artifact_built_by_field_allowlist_no_price)
//  - quorum miss without scaled_ui_unread => red (bell_universe_quorum_miss_is_scaled_ui_unread)
//  - quorum disagreement decided instead of unverified => red (bell_universe_quorum_disagreement_is_unverified)
//  - host off allowlist accepted / method off allowlist accepted => red (host/method allowlist tests)
//  - budget total not offset by priorCalls (M17) / resume re-chains from genesis (M15) => red (budget test)
//  - 403 retried instead of hard stop => red (retry test)
//  - "N pages" accepted without end anchor => red (pagination test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ISSUER_HOST, SOLANA_PUBLIC_URL, CANDIDATE_FIELDS, PRICE_LIKE_FIELD,
  assertHostAllowed, assertMethodAllowed, guardedRpcCall, scrubSecret,
  withUniverseRetry, Fatal403Error, universeRunCap,
  SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR, ISSUER_LABEL,
  readPriorCalls, serializeLedger,
  accountIdentityKey, interpretAccount, confirmMintIdentity, assertProvidersDistinctForQuorum,
  enumerateUniverse, foundingCalibration, buildUniverseArtifact, buildCandidateRecord,
  assertOnlyAllowedFields, universeArtifactBytes, foldPage, solanaDeploymentAddress,
  sanitizeIdentityText, countIdentityEmptied,
  LEDGER_GENESIS, UNIVERSE_LEDGER_JOURNAL, chainedLedgerEntry, ledgerEntrySha256, verifyChain,
  RedirectBlockedError, type SolanaCandidate, type OnchainReadout,
} from "../src/universe.ts";
// C-3: FORMAT-LOCK — import the -b3d calque TEST-SIDE ONLY (an import of test is NOT an `src` coupling). Used
// only to prove universe's hashing DISCIPLINE is byte-identical; universe never imports rebase-crosscheck in src.
import { LEDGER_GENESIS as B3D_LEDGER_GENESIS, chainedLedgerEntry as b3dChainedEntry, ledgerSha as b3dLedgerSha } from "../src/rebase-crosscheck.ts";
// GARDE-HELIUS-1b-i: runUniverse now composes the REAL openGuardedClient; the offline tests stub globalThis.fetch
// (no fake client, no injected transport — D-1/D-3). liveHttpGet/liveRpcCall/HttpStatusError/makeUniverseBudget are gone.
import { runUniverse, parseUniverseArgs, provenanceMd, type RunDeps, type RunResult } from "../src/universe-cli.ts";
import { BudgetExceededError, type JsonRpcCall } from "../src/quorum.ts";
import { TransportError, runCli } from "@monark/rpc-guard";
import { XSTOCKS, TOKEN_2022_PROGRAM } from "../src/pools.ts";
import { spawnSync } from "node:child_process";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FIX = fileURLToPath(new URL("./fixtures/universe/", import.meta.url));
// A test Chainstack URL: host resolves operatorOf==="chainstack"; the path is a NON-hex placeholder so it
// carries no secret-shaped token (the real node key is a 32-hex path, held only in CHAINSTACK_SOLANA_URL).
const CHAINSTACK = "https://solana-mainnet.core.chainstack.com/tk-node-key-placeholder";
const PROVIDERS = [SOLANA_PUBLIC_URL, CHAINSTACK];
const readFix = (n: string): unknown => JSON.parse(readFileSync(join(FIX, n), "utf8"));
const issuerAssets = (): unknown[] => readFix("issuer-assets.json") as unknown[];
const rpcMap = (): Record<string, unknown> => readFix("rpc-getaccountinfo.json") as Record<string, unknown>;

/** A concordant RPC stub: returns rpcMap[mint] for BOTH provider urls (so the quorum key matches). */
function concordantCall(map: Record<string, unknown>): JsonRpcCall {
  return (_url, _method, params) => Promise.resolve(map[String((params as unknown[])[0])] ?? { value: null });
}
const noop = async (): Promise<void> => {};
const nowFixed = (): number => 1_700_000_000_000;

// ---- GARDE-HELIUS-1b-i offline composition harness: REAL openGuardedClient, ONLY globalThis.fetch stubbed ------
// The fetch stub routes the SAME per-page / per-mint response closures the pre-1b tests used onto globalThis.fetch:
// an xstocks host => httpGet(url)'s json (200 body VERBATIM); any RPC host => call(url,method,params)'s result
// (jsonrpc 200). A closure may reject with {httpStatus[, retryAfterMs]} to force a non-2xx, or throw for a network
// fault (the client maps it to a TransportError name). No fake client, no injected transport (D-1/D-3).
const CHAINSTACK_GUARD = "https://cs-node.example.invalid/tk-node-key-placeholder"; // .invalid host (A-4); fetch is stubbed
const GUARD_ENV: Record<string, string | undefined> = { CHAINSTACK_SOLANA_URL: CHAINSTACK_GUARD };
const METHOD_CAPS = "getAccountInfo=20000";
const OPERATORS = "solana-foundation,chainstack,xstocks-issuer";
/** Append the guarded-client flags to a universe argv (--ledger-dir = a PRE-EXISTING temp cycle dir). --floor
 *  defaults to 0; a caller passes the 16 M RU cap to force a cycle_cap refusal (C-1). */
function gArgs(argv: readonly string[], ledgerDir: string, cycle = "cyc", floor = "0"): string[] {
  return [...argv, "--ledger-dir", ledgerDir, "--cycle", cycle, "--floor", floor, "--max-ru", "1000000", "--method-caps", METHOD_CAPS, "--operators", OPERATORS];
}
interface StatusReject { httpStatus: number; retryAfterMs?: number }
type StubHttpGet = (url: string) => Promise<{ json: unknown }>;
/** Reject a stub httpGet with a NON-2xx marker (an Error carrying httpStatus, so eslint prefer-promise-reject-errors
 *  is satisfied); the adapter turns it into a real non-2xx Response the guarded client's transport then types. */
const httpReject = (status: number, retryAfterMs?: number): Promise<never> => Promise.reject(Object.assign(new Error(`upstream ${String(status)}`), { httpStatus: status, ...(retryAfterMs !== undefined ? { retryAfterMs } : {}) }));
function fetchAdapter(httpGet: StubHttpGet, call: JsonRpcCall): typeof globalThis.fetch {
  return (async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const ok = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    try {
      if (url.includes("xstocks")) return ok((await httpGet(url)).json);            // issuer GET: body returned VERBATIM
      const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
      return ok({ jsonrpc: "2.0", id: 1, result: await call(url, req.method, req.params) }); // RPC POST
    } catch (e) {
      const st = (e as Partial<StatusReject>).httpStatus;
      if (typeof st === "number") {
        const ra = (e as StatusReject).retryAfterMs;
        return new Response("upstream", { status: st, headers: ra !== undefined ? { "retry-after": String(Math.ceil(ra / 1000)) } : {} });
      }
      throw e; // a genuine network fault (ECONNRESET) => fetch rejects => the client raises TransportError(name)
    }
  }) as typeof globalThis.fetch;
}
async function withFetch(stub: typeof globalThis.fetch, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub;
  try { await body(); } finally { globalThis.fetch = real; }
}
/** A fresh PRE-EXISTING cycle ledger dir (mkdtemp => the parent exists, as ensureCycleDir requires). */
function tmpLedgerDir(): string { return mkdtempSync(join(tmpdir(), "bell-univ-cyc-")); }
/** The default issuer paginator: page 0 is the full fixture (< pageSize=100 => end anchor), later pages empty. */
const defaultHttpGet: StubHttpGet = (url) => Promise.resolve({ json: Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? issuerAssets() : [] });

// ---- 1. Enumeration: identity from issuer list + ON-CHAIN confirm (never the issuer's word alone) -----
test("bell_universe_enumerates_from_issuer_list_and_onchain", async () => {
  const map = rpcMap();
  const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(issuerAssets(),
    (mint) => confirmMintIdentity(mint, PROVIDERS, concordantCall(map)));
  assert.equal(totalAssets, 8);
  assert.equal(solanaAssets, 7, "EVM-only asset filtered client-side on deployments[].network (NB-2)");
  // Client filter is the load-bearing one: an EVM-only asset yields no Solana deployment address.
  assert.equal(solanaDeploymentAddress(issuerAssets()[0]), null);
  assert.equal(interpretAccount({ value: null }).state, "identity_unconfirmed"); // absent account, read (not unread)
  // C1 needs a MINT, not any Token-2022-owned account: a token ACCOUNT at the address is identity_unconfirmed.
  assert.equal(interpretAccount({ value: { owner: TOKEN_2022_PROGRAM, data: { parsed: { type: "account", info: {} } } } }).state, "identity_unconfirmed");
  assert.equal(interpretAccount({ value: { owner: TOKEN_2022_PROGRAM, data: { parsed: { type: "mint", info: { decimals: 8 } } } } }).state, "confirmed");
  const by = new Map(candidates.map((c) => [c.symbol, c] as const));
  // The 4 founders + GOOGLx are on-chain-confirmed Token-2022.
  for (const s of ["TSLAx", "SPYx", "NVDAx", "AAPLx", "GOOGLx"]) {
    assert.equal(by.get(s)?.onchain.state, "confirmed", `${s} confirmed`);
    assert.equal(by.get(s)?.onchain.owner, TOKEN_2022_PROGRAM);
    assert.equal(by.get(s)?.onchain.decimals, 8, "decimals read ON-CHAIN, not from the issuer (which is USDC)");
    assert.equal(by.get(s)?.onchain.scaled_ui, true);
  }
  // MUTANT: trusting the issuer address alone would mark these confirmed; the on-chain owner check must NOT.
  assert.equal(by.get("FAKEx")?.onchain.state, "identity_unconfirmed", "owner != Token-2022 => identity_unconfirmed");
  assert.equal(by.get("GONEx")?.onchain.state, "identity_unconfirmed", "value:null (absent account) => identity_unconfirmed");
  assert.equal(by.get("GONEx")?.onchain.scaled_ui_unread, false, "absent account was READ (not a quorum miss)");
  // scaled-UI authority recorded; the shared authority differs from GOOGLx's distinct one (informs add cost).
  assert.equal(by.get("TSLAx")?.onchain.scaled_ui_authority, "S7vYFFsharedAUTHxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  assert.notEqual(by.get("GOOGLx")?.onchain.scaled_ui_authority, by.get("TSLAx")?.onchain.scaled_ui_authority);
});

// ---- 2. Calibration ORACLE: the 4 founders appear + are confirmed, or STOP -------------------------
test("bell_universe_founding_mints_appear_and_satisfy_c1_c6", async () => {
  const map = rpcMap();
  const { candidates } = await enumerateUniverse(issuerAssets(), (m) => confirmMintIdentity(m, PROVIDERS, concordantCall(map)));
  const cal = foundingCalibration(candidates);
  assert.equal(cal.ok, true, "all 4 founding mints appear at the same address and are Token-2022");
  assert.deepEqual([...cal.missing], []);
  assert.deepEqual([...cal.notConfirmed], []);
  // MUTANT (founder missing): dropping SPYx from the candidate set => calibration fails.
  const minusSpy = candidates.filter((c) => c.symbol !== "SPYx");
  assert.equal(foundingCalibration(minusSpy).ok, false);
  assert.deepEqual([...foundingCalibration(minusSpy).missing], ["SPYx"]);
  // MUTANT (founder not Token-2022): flip TSLAx owner => notConfirmed.
  const flipped = candidates.map((c) => c.symbol === "TSLAx"
    ? { ...c, onchain: { ...c.onchain, state: "identity_unconfirmed" as const, owner: "x" } } : c);
  assert.equal(foundingCalibration(flipped).ok, false);
  assert.deepEqual([...foundingCalibration(flipped).notConfirmed], ["TSLAx"]);
  // The 4 founding addresses match pools.ts char-for-char (the Map key is the address).
  const addrs = new Set(candidates.map((c) => c.mint));
  for (const f of XSTOCKS) assert.ok(addrs.has(f.address), `${f.symbol} address present`);
});

// ---- 3. Artifact by FIELD ALLOWLIST, never strip; no price / no price-derivable pair ----------------
test("bell_universe_artifact_built_by_field_allowlist_no_price", async () => {
  const map = rpcMap();
  const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(issuerAssets(), (m) => confirmMintIdentity(m, PROVIDERS, concordantCall(map)));
  const body = buildUniverseArtifact(candidates, { totalAssets, solanaAssets }) as { candidates: Record<string, unknown>[] };
  // Every record carries ONLY allowlisted keys; supply/multiplier (present in the RPC input) never enter.
  for (const rec of body.candidates) {
    for (const k of Object.keys(rec)) assert.ok((CANDIDATE_FIELDS as readonly string[]).includes(k), `record key '${k}' on allowlist`);
    assert.equal("supply" in rec, false); assert.equal("multiplier" in rec, false);
  }
  // MUTANT ("price field added to allowlist"): the allowlist itself must contain NO price-like key.
  for (const f of CANDIDATE_FIELDS) assert.equal(PRICE_LIKE_FIELD.test(f), false, `allowlist field '${f}' is not price-like`);
  // MUTANT (price-derivable pair): neither leg of a base+quote balance pair can enter (not on the list).
  assert.throws(() => { assertOnlyAllowedFields({ symbol: "X", base_balance: 1, quote_balance: 2 }); }, /not on the committable allowlist/);
  assert.throws(() => { assertOnlyAllowedFields({ price_usd: 1 }); }, /allowlist/);
  // Belt: assertNoClose (via buildCandidateRecord) would redden on a close-like numeric — proven in bell.test.ts.
  for (const c of candidates) assert.doesNotThrow(() => buildCandidateRecord(c));
});

// ---- 4/5. Quorum miss => scaled_ui_unread (fail-closed); disagreement => unverified (never decided) --
test("bell_universe_quorum_miss_is_scaled_ui_unread", async () => {
  // chainstack provider throws transport (429) => only 1 outcome => NoQuorumError => no_quorum, fail-closed.
  const map = rpcMap();
  const oneDown: JsonRpcCall = (url, _m, params) => url.includes("chainstack")
    ? Promise.reject(new TransportError("chainstack", "rpc-guard: HttpError for operator 'chainstack' (code 429)", "HttpError", 429, "", "ru", undefined, 1000))
    : Promise.resolve(map[String((params as unknown[])[0])] ?? { value: null });
  const r = await confirmMintIdentity("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", PROVIDERS,
    async (u, m, p) => withUniverseRetry(() => oneDown(u, m, p), { sleep: noop, now: nowFixed, maxRetries: 1 }));
  assert.equal(r.state, "no_quorum");
  assert.equal(r.scaled_ui_unread, true, "MUTANT: a miss without scaled_ui_unread must redden");
  assert.equal(r.scaled_ui, null);
});
test("bell_universe_quorum_disagreement_is_unverified", async () => {
  const good = rpcMap()["XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB"];
  const impostor = { context: { slot: 1 }, value: { ...(good as { value: Record<string, unknown> }).value, owner: "DifferentOwnerxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" } };
  const disagree: JsonRpcCall = (url) => Promise.resolve(url.includes("chainstack") ? impostor : good);
  const r = await confirmMintIdentity("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", PROVIDERS, disagree);
  assert.equal(r.state, "unverified", "MUTANT: a disagreement decided (picking one) must redden");
  assert.equal(r.scaled_ui_unread, true);
  // The identity key differs on owner => the two do not concord.
  assert.notEqual(accountIdentityKey(good), accountIdentityKey(impostor));
});

// ---- 6. Label allowlist (C-7): assertHostAllowed is REDUCED to an operator-LABEL membership test ------
test("bell_universe_label_allowlist_refuses_before_send", () => {
  // The three universe operators are admitted; the host resolution + structural host check now live in the
  // guarded client's transport (a URL never reaches Bell). A URL, a bare non-operator, mainnet-beta, an
  // aggregator, an env pointing off-operator — none is a universe LABEL => refused.
  for (const ok of [SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR, ISSUER_LABEL]) assert.doesNotThrow(() => { assertHostAllowed(ok); });
  for (const bad of [
    `https://${ISSUER_HOST}/api/v2/public/assets`, SOLANA_PUBLIC_URL, CHAINSTACK, "helius", "publicnode",
    "api.mainnet-beta.solana.com", "https://evil.example/x", // an env pointing off-operator is NOT a label
  ]) assert.throws(() => { assertHostAllowed(bad); }, /allowlist/, `label refused: ${bad}`);
  // guardedRpcCall refuses an off-allowlist LABEL BEFORE the inner call fires.
  let fired = false;
  const inner: JsonRpcCall = () => { fired = true; return Promise.resolve(null); };
  assert.throws(() => guardedRpcCall(inner)("helius", "getAccountInfo", []), /allowlist/);
  assert.equal(fired, false, "MUTANT: an off-allowlist label reaching the inner call must redden");
});

// ---- 7. Method allowlist: only getAccountInfo; else BudgetExceededError before send ------------------
test("bell_universe_method_allowlist_fail_closed", () => {
  assert.doesNotThrow(() => { assertMethodAllowed("getAccountInfo"); });
  for (const m of ["getSignaturesForAddress", "getTransaction", "getProgramAccounts", "getTokenSupply"]) {
    assert.throws(() => { assertMethodAllowed(m); }, BudgetExceededError, `method off allowlist: ${m}`);
  }
  let fired = false;
  const inner: JsonRpcCall = () => { fired = true; return Promise.resolve(null); };
  assert.throws(() => guardedRpcCall(inner)(SOLANA_PUBLIC_URL, "getProgramAccounts", []), BudgetExceededError);
  assert.equal(fired, false, "MUTANT: an off-allowlist method reaching the inner call must redden");
});

// ---- 8. Budget: fail-closed + resume WITHOUT double-count (C-G2-1, M17/M15) --------------------------
test("bell_universe_budget_fail_closed_and_resumes_without_double_count", () => {
  // M17: the guarded client's run cap = maxCalls - priorCalls (this run's REMAINING attempts); total() elsewhere =
  // priorCalls + client.spent().attempts, so a resume never double-counts. universeRunCap is the PURE offset.
  assert.equal(universeRunCap(5, 3), 2, "MUTANT M17: run cap = maxCalls - priorCalls (remaining), not maxCalls alone");
  assert.equal(universeRunCap(5, 0), 5);
  // priorCalls >= maxCalls => refuse at construction (already spent) — never a 0-remaining course that re-spends.
  assert.throws(() => universeRunCap(5, 5), BudgetExceededError, "already-spent (prior == max) refuses at construction");
  assert.throws(() => universeRunCap(5, 6), BudgetExceededError, "already-spent (prior > max) refuses at construction");
  // Anchor reader (NO journal): absent => fresh; a valid anchor is READ (M15); malformed/invalid => throw.
  const dir = mkdtempSync(join(tmpdir(), "bell-univ-ledger-"));
  try {
    const anchor = join(dir, "budget.json");
    const journal = join(dir, UNIVERSE_LEDGER_JOURNAL);
    const rd = (): unknown => readPriorCalls(anchor, journal, existsSync, (x) => readFileSync(x, "utf8"));
    assert.deepEqual(rd(), { calls: 0, head: LEDGER_GENESIS, seq: 0 }, "absent anchor+journal => fresh");
    writeFileSync(anchor, serializeLedger(42));
    assert.deepEqual(rd(), { calls: 42, head: LEDGER_GENESIS, seq: 0 }, "MUTANT M15: an anchor with no journal is READ, never re-chained from 0 (legit pre-first-append crash window)");
    writeFileSync(anchor, "{ not json");
    assert.throws(rd, /malformed/);
    writeFileSync(anchor, JSON.stringify({ calls: -1 }));
    assert.throws(rd, /invalid/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- 8b. C-G2-7: the chained RUN-ledger re-derives, refuses a downward edit, continues on resume ----------
test("bell_universe_ledger_chain_rederives_and_refuses_downward_edit", () => {
  // A well-formed chain from GENESIS re-derives; head == last entry_sha256; calls_cumulative monotone.
  const e0 = chainedLedgerEntry(LEDGER_GENESIS, 0, 1);
  const e1 = chainedLedgerEntry(e0.entry_sha256, 1, 4);
  const e2 = chainedLedgerEntry(e1.entry_sha256, 2, 16);
  const chain = [e0, e1, e2];
  const v = verifyChain(chain);
  assert.equal(v.ok, true, "a well-formed chain re-derives");
  assert.equal(v.head, e2.entry_sha256, "head == last entry_sha256");
  // MUTANT M-chain: a field mutated WITHOUT re-hashing must be caught by RE-DERIVATION (not the linkage). A
  // verifier that RE-READS entry_sha256 instead of RECOMPUTING sha(core) lets this survive (leaked lesson -b3d).
  assert.equal(verifyChain([e0, e1, { ...e2, calls_cumulative: 17 }]).ok, false, "MUTANT M-chain: 17 > 16 keeps monotonicity; only sha(core) fails => recompute, never re-read");
  // C-4: calls_cumulative monotone non-decreasing — a properly-chained but DECREASING series is rejected.
  const d0 = chainedLedgerEntry(LEDGER_GENESIS, 0, 10);
  assert.equal(verifyChain([d0, chainedLedgerEntry(d0.entry_sha256, 1, 5)]).ok, false, "C-4: calls_cumulative must be monotone non-decreasing");
  // MUTANT M-regenesis: a resume that re-chains from GENESIS a SECOND time breaks the link.
  assert.equal(verifyChain([e0, chainedLedgerEntry(LEDGER_GENESIS, 1, 4)]).ok, false, "MUTANT M-regenesis: chaining from GENESIS a 2nd time must redden");
  // C-V-3: seq MUST equal the position — a non-monotone / negative / duplicate seq is refused (each properly hashed).
  assert.equal(verifyChain([chainedLedgerEntry(LEDGER_GENESIS, 5, 1)]).ok, false, "seq != index (5 at position 0) => ok:false");
  assert.equal(verifyChain([chainedLedgerEntry(LEDGER_GENESIS, -7, 1)]).ok, false, "seq negative => ok:false");
  // MUTANT (writer freezes seq at 0): two well-hashed entries both seq=0 => the 2nd has seq 0 != index 1.
  const s0 = chainedLedgerEntry(LEDGER_GENESIS, 0, 1);
  assert.equal(verifyChain([s0, chainedLedgerEntry(s0.entry_sha256, 0, 2)]).ok, false, "MUTANT seq-frozen-at-0 (writer side): seq must track the position");

  const dir = mkdtempSync(join(tmpdir(), "bell-univ-chain-"));
  try {
    const anchor = join(dir, "budget.json");
    const journal = join(dir, UNIVERSE_LEDGER_JOURNAL);
    const rd = (): { calls: number; head: string; seq: number } => readPriorCalls(anchor, journal, existsSync, (x) => readFileSync(x, "utf8"));
    writeFileSync(journal, chain.map((e) => JSON.stringify(e) + "\n").join(""));
    // MUTANT M-absent: journal present but the counter anchor absent => throw (incoherent resume).
    assert.throws(rd, /counter anchor is absent/, "MUTANT M-absent: a journal without its anchor must throw");
    // Both present, anchor >= head: resume CONTINUES the chain (head + next seq returned).
    writeFileSync(anchor, serializeLedger(16));
    assert.deepEqual(rd(), { calls: 16, head: e2.entry_sha256, seq: 3 }, "resume returns anchor calls + head + next seq");
    // MUTANT M-down: anchor calls LOWERED below the head (>=, never ==) => downward edit detected.
    writeFileSync(anchor, serializeLedger(5));
    assert.throws(rd, /downward edit/, "MUTANT M-down: anchor below the ledger head must throw");
    // >= holds: an anchor AHEAD of the head (crash window) resumes, never demands ==.
    writeFileSync(anchor, serializeLedger(99));
    assert.equal(rd().calls, 99, ">= holds: an anchor AHEAD of the head (crash window) resumes");
    // C-V-3: a FRACTIONAL anchor is refused (parity with verifyChain's integer calls_cumulative).
    writeFileSync(anchor, JSON.stringify({ calls: 16.5 }));
    assert.throws(rd, /invalid/, "a non-integer anchor must throw");
    // An unreadable journal line => throw (fail-closed, NO silent skip).
    writeFileSync(anchor, serializeLedger(16));
    appendFileSync(journal, "{ not json\n");
    assert.throws(rd, /unreadable/, "a torn/illegible journal line throws (no silent skip)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- 8c. C-6: crash simulation proves conservativity (anchor first) and KILLS M-order --------------------
const readJournal = (out: string): unknown[] =>
  readFileSync(join(out, UNIVERSE_LEDGER_JOURNAL), "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as unknown);
test("bell_universe_ledger_crash_between_writes_resumes_conservatively", async () => {
  const runArgs = (out: string, ld: string): string[] => gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld);
  const stub = fetchAdapter(defaultHttpGet, concordantCall(rpcMap()));
  // Injection A ("append LOST"): appendFile (the RUN journal, deps.appendFile — NOT the CYCLE ledger, which the
  // client appends directly) throws WITHOUT writing on the 3rd append => a real 2-entry chain exists, then the
  // anchor (written FIRST) is AHEAD of the journal head. Resume must NOT throw (over-count, conservative). Both runs
  // share one CYCLE --ledger-dir (the crash's finally releases the N locks so the resume can re-acquire).
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-crashA-")); const ldA = tmpLedgerDir();
  try {
    let appends = 0;
    await withFetch(stub, async () => {
      await assert.rejects(() => runUniverse(runArgs(outA, ldA), fileDeps({
        appendFile: (p, d) => { appends += 1; if (appends === 3) throw new Error("SIMULATED crash: appendFile failed AFTER the anchor"); appendFileSync(p, d); },
      })), /SIMULATED crash/);
      const resumed = await runUniverse(runArgs(outA, ldA), fileDeps());
      assert.equal(resumed.ok, true, "C-6: a crash in the append window resumes WITHOUT throwing (anchor-first => over-count, conservative)");
      assert.equal(verifyChain(readJournal(outA)).ok, true, "the resumed journal (run1 partial + run2) is ONE re-derivable chain");
    });
  } finally { rmSync(outA, { recursive: true, force: true }); rmSync(ldA, { recursive: true, force: true }); }

  // Injection B ("anchor LOST"): writeFile throws WITHOUT writing on the 3rd write to the ANCHOR path. Under correct
  // order (anchor first) the append never lands => anchor == head => resume OK. Under M-order the append DID land =>
  // anchor < head => resume THROWS. This is the M-order KILLER: `resumed.ok === true` reddens when persist()'s order
  // is swapped (append before the anchor).
  const outB = mkdtempSync(join(tmpdir(), "bell-univ-crashB-")); const ldB = tmpLedgerDir();
  try {
    const anchorPath = join(outB, "budget.json");
    let anchorWrites = 0;
    await withFetch(stub, async () => {
      await assert.rejects(() => runUniverse(runArgs(outB, ldB), fileDeps({
        writeFile: (p, d) => { if (p === anchorPath) { anchorWrites += 1; if (anchorWrites === 3) throw new Error("SIMULATED crash: anchor write failed"); } writeFileSync(p, d); },
      })), /SIMULATED crash/);
      const resumed = await runUniverse(runArgs(outB, ldB), fileDeps());
      assert.equal(resumed.ok, true, "MUTANT M-order: anchor-first leaves anchor == head on an anchor-write crash => resume OK; swapping to append-first leaves anchor < head => resume throws => red");
      assert.equal(verifyChain(readJournal(outB)).ok, true, "the resumed journal is ONE re-derivable chain");
    });
  } finally { rmSync(outB, { recursive: true, force: true }); rmSync(ldB, { recursive: true, force: true }); }
});

// ---- 8d. C-3: the ledger FORMAT is byte-identical to the -b3d calque (locked by TEST, not by comment) -----
test("bell_universe_ledger_format_is_byte_identical_to_b3d", () => {
  assert.equal(LEDGER_GENESIS, B3D_LEDGER_GENESIS, "same LEDGER_GENESIS as the -b3d calque");
  // HASHING DISCIPLINE byte-identity: universe's ledgerEntrySha256 applied to a -b3d PAGE core (in the calque's
  // field-write order) reproduces the calque's entry_sha256 EXACTLY. M-format KILLER: hashing via canonical()
  // (sorted keys) or renaming a field breaks this equality.
  const pageEntry = b3dChainedEntry(B3D_LEDGER_GENESIS, 0, [{ sig: "sigA", slot: 7 }, { sig: "sigB", slot: 9 }], [], []); // lot -f: arity 5, empty page payload
  if (pageEntry === null) throw new Error("the calque must build a page entry for a non-empty page");
  const pageCore = {
    prev_entry_sha256: pageEntry.prev_entry_sha256, page: pageEntry.page, slot_lo: pageEntry.slot_lo,
    slot_hi: pageEntry.slot_hi, first_sig: pageEntry.first_sig, last_sig: pageEntry.last_sig,
    tx_count: pageEntry.tx_count, tail_sigs_at_slot_hi: [...pageEntry.tail_sigs_at_slot_hi], list_sha256: pageEntry.list_sha256,
    payload_sha256: pageEntry.payload_sha256, // lot -f (condition (f)): the calque core has TEN fields, payload_sha256 last
  };
  assert.equal(ledgerEntrySha256(pageCore), pageEntry.entry_sha256, "MUTANT M-format: universe's hasher on a -b3d page core == the calque's entry_sha256 (sha(JSON.stringify(core)) in write order, NOT canonical)");
  assert.equal(b3dLedgerSha([]), B3D_LEDGER_GENESIS, "calque ledgerSha([]) == genesis");
  assert.equal(b3dLedgerSha([pageEntry]), pageEntry.entry_sha256, "calque ledgerSha([e]) == e.entry_sha256");
  // Universe's OWN entry mirrors the discipline (field-write order + head == last entry_sha256).
  const u = chainedLedgerEntry(LEDGER_GENESIS, 0, 3);
  assert.deepEqual(Object.keys(u), ["prev_entry_sha256", "seq", "calls_cumulative", "entry_sha256"], "universe entry field order");
  assert.equal(u.entry_sha256, ledgerEntrySha256({ prev_entry_sha256: LEDGER_GENESIS, seq: 0, calls_cumulative: 3 }), "universe entry_sha256 == sha(JSON.stringify(core)) in write order");
  assert.equal(verifyChain([u]).head, u.entry_sha256, "universe head == last entry_sha256");
  // FREE C-13: the journal filename is OUTSIDE both -b3d globs (never falsely read as -b3d resume state).
  assert.equal(/^ledger-.*\.jsonl$/.test(UNIVERSE_LEDGER_JOURNAL), false, "outside the ledgerPagesOnDisk glob");
  assert.equal(/^(ledger|events|handoffs)-.*\.jsonl$/.test(UNIVERSE_LEDGER_JOURNAL), false, "outside the hasResumeState glob");
});

// ---- 8e. C-V-1 / C-R-1: the anchor is <= 1 logical tick behind at any SEND — persist PER PAGE (loop body) AND
// in the probe's `finally`. Observed at each send on a nominal run (disk state read at every send); the true
// KILL is the crash-sim 8c.
test("bell_universe_pagination_persists_per_page_kill_window", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-kw-"));
  try {
    const K = 4; // pages 0..K full (pageSize=2), page K short => end anchor at page K
    const anchorPath = join(out, "budget.json");
    let lastAnchor = 0;
    const anchorAtGet: number[] = []; // the anchor's calls value observed BEFORE each issuer GET
    let anchorAtFirstRpc = -1;        // the anchor's calls value observed at the FIRST confirm RPC
    const httpGet: StubHttpGet = (url) => {
      anchorAtGet.push(lastAnchor);
      const p = Number(new URL(url).searchParams.get("page") ?? "0");
      // page 0 carries ONE Solana mint so a confirm RPC fires AFTER the probe (to observe the anchor there).
      const solana = p === 0 ? [{ network: "Solana", address: "Mint0a11111111111111111111111111111111" }] : [];
      const rows = p < K
        ? [{ id: `p${String(p)}a`, symbol: `S${String(p)}`, name: `S${String(p)}`, deployments: solana }, { id: `p${String(p)}b`, deployments: [] }]
        : [{ id: `p${String(p)}z`, deployments: [] }];
      return Promise.resolve({ json: rows });
    };
    const writeFile = (pth: string, data: string): void => {
      if (pth === anchorPath) lastAnchor = (JSON.parse(data) as { calls: number }).calls;
      writeFileSync(pth, data);
    };
    const call: JsonRpcCall = () => { if (anchorAtFirstRpc < 0) anchorAtFirstRpc = lastAnchor; return Promise.resolve({ value: null }); };
    await withFetch(fetchAdapter(httpGet, call), async () => { await runUniverse(
      gArgs(["--out", out, "--max-calls", "1000", "--page-size", "2", "--max-pages", "20", "--date", "2026-09-21"], tmpLedgerDir()),
      fileDeps({ writeFile })); });
    // (i) pagination persists PER PAGE: before page p's GET (tick p+1) the anchor persisted by page p-1 equals p.
    // MUTANT (persist removed from the loop body): the anchor stays 0 until the loop `finally` => anchorAtGet=[0,0,..].
    for (let p = 1; p <= K; p++) assert.ok(anchorAtGet[p]! >= p, `at page ${String(p)}'s GET the anchor is >= ${String(p)}; saw ${String(anchorAtGet[p])}`);
    // (ii) at the PROBE GET (index K+1) the anchor already reflects every page (K+1).
    assert.ok(anchorAtGet[K + 1]! >= K + 1, `at the probe GET the anchor >= ${String(K + 1)}; saw ${String(anchorAtGet[K + 1])}`);
    // (iii) C-R-1: at the FIRST confirm RPC the anchor already includes the probe's +1 tick (>= K+2). MUTANT
    // (persist removed from the probe's `finally`): the probe tick is deferred to the first confirm persist =>
    // anchor is K+1 at the first RPC => this reddens.
    assert.ok(anchorAtFirstRpc >= K + 2, `at the first RPC the anchor includes the probe tick; saw ${String(anchorAtFirstRpc)} (want >= ${String(K + 2)})`);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 9. Retry: honor Retry-After on 429, HARD STOP on 403, re-throw budget errors -------------------
test("bell_universe_retry_honors_retry_after_and_hard_stops_on_403", async () => {
  // GARDE-HELIUS-1b-i (C-3/D-9): withUniverseRetry keys on the PACKAGE's TransportError (name + code + retryAfterMs).
  const T = (name: string, code: number | undefined, ra?: number): TransportError => new TransportError("op", `rpc-guard: ${name}`, name, code, "", "ru", undefined, ra);
  // 429 once (Retry-After 3s carried by the TransportError) then success: the injected sleep records 3000 ms.
  const waited: number[] = [];
  const sleep = (ms: number): Promise<void> => { waited.push(ms); return Promise.resolve(); };
  let n = 0;
  const flaky = (): Promise<string> => { n += 1; if (n === 1) return Promise.reject(T("HttpError", 429, 3000)); return Promise.resolve("ok"); };
  assert.equal(await withUniverseRetry(flaky, { sleep, now: nowFixed }), "ok");
  assert.deepEqual(waited, [3000], "Retry-After (TransportError.retryAfterMs) honored");
  // 403 => Fatal403Error (a BudgetExceededError subclass) with NO retry.
  await assert.rejects(() => withUniverseRetry(() => Promise.reject(T("HttpError", 403)), { sleep: noop, now: nowFixed }), (e) => {
    assert.ok(e instanceof Fatal403Error && e instanceof BudgetExceededError, "MUTANT: 403 retried instead of hard stop must redden");
    return true;
  });
  // 3xx => RedirectBlockedError (a BudgetExceededError subclass) with NO retry (never followed).
  await assert.rejects(() => withUniverseRetry(() => Promise.reject(T("RedirectBlocked", 302)), { sleep: noop, now: nowFixed }), (e) => {
    assert.ok(e instanceof RedirectBlockedError && e instanceof BudgetExceededError, "MUTANT: a 3xx followed/retried instead of hard stop must redden");
    return true;
  });
  // A NON-transient TransportError (RpcError / a 4xx != 429) is re-thrown at ONCE (not retried).
  let rpcCalls = 0;
  await assert.rejects(() => withUniverseRetry(() => { rpcCalls += 1; return Promise.reject(T("RpcError", 3)); }, { sleep: noop, now: nowFixed }), TransportError);
  assert.equal(rpcCalls, 1, "MUTANT: a non-transient fault retried must redden");
  // A budget error is re-thrown immediately, never retried.
  let calls = 0;
  const overBudget = (): Promise<never> => { calls += 1; return Promise.reject(new BudgetExceededError("x")); };
  await assert.rejects(() => withUniverseRetry(overBudget, { sleep: noop, now: nowFixed }), BudgetExceededError);
  assert.equal(calls, 1, "budget error not retried");
});

// ---- 10. Secrets: no secret-shaped context in source; URL scrub by pattern + control by length -------
test("bell_universe_no_secret_in_repo_and_url_scrub", () => {
  const SECRET = /(authorization\s*:\s*bearer\s+[\w.-]{16,})|(api[-_]?key\s*[=:]\s*["']?[\w.-]{16,})|([A-Z][A-Z_]*_API_KEY\s*[=:]\s*["'][\w.-]{6,})/i;
  for (const f of ["universe.ts", "universe-cli.ts"]) {
    assert.equal(SECRET.test(readFileSync(join(HERE, "..", "src", f), "utf8")), false, `no secret-shaped context in ${f}`);
  }
  // URL scrub: the Chainstack node URL (hex key in path) is removed by PATTERN and the output is no LONGER
  // than the input (control by length) — the key substring cannot survive.
  const line = `error hitting ${CHAINSTACK} for getAccountInfo`;
  const scrubbed = scrubSecret(line, CHAINSTACK);
  assert.equal(scrubbed.includes("tk-node-key-placeholder"), false, "url path gone (by pattern)");
  assert.equal(scrubbed.includes("chainstack"), false);
  assert.ok(scrubbed.length <= line.length, "control by length: scrub never lengthens");
  // Even without knowing the exact url, the defensive host pattern still redacts a chainstack url.
  assert.equal(scrubSecret(`x https://solana-mainnet.core.chainstack.com/abc y`).includes("chainstack"), false);
});

// ---- 11. Pagination: exhaustion PROVEN by end anchor + monotonicity, never "N pages" -----------------
test("bell_universe_pagination_exhaustion_proven", () => {
  const seen = new Set<string>();
  // A short final page (< pageSize) is the end anchor.
  const f1 = foldPage(seen, [{ id: "a" }, { id: "b" }], 3);
  assert.equal(f1.endAnchor, true); assert.equal(f1.duplicateIds, false);
  // A full page is NOT an end anchor (keep going).
  seen.clear();
  assert.equal(foldPage(seen, [{ id: "a" }, { id: "b" }, { id: "c" }], 3).endAnchor, false);
  // A server that repeats ids (ignores page) is flagged => exhaustion not provable.
  assert.equal(foldPage(seen, [{ id: "a" }], 3).duplicateIds, true);
});

// ---- 11b. The CLI REFUSES to claim exhaustion when no end anchor is reached (never "N pages") --------
test("bell_universe_cli_refuses_unproven_exhaustion", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-exh-"));
  try {
    // A server that ALWAYS returns a full page (distinct ids) => no end anchor within --max-pages => STOP.
    const fullPage: StubHttpGet = (url) => {
      const p = Number(new URL(url).searchParams.get("page") ?? "0");
      return Promise.resolve({ json: [{ id: `p${String(p)}a`, deployments: [] }, { id: `p${String(p)}b`, deployments: [] }] });
    };
    await assert.rejects(
      () => runGuarded(["--out", out, "--max-calls", "100", "--page-size", "2", "--max-pages", "3"], { httpGet: fullPage }),
      /exhaustion NOT proven/, "MUTANT: accepting 'N pages' without an end anchor must redden");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 12. CA-11 durci: run the WHOLE composition from a FILE fixture through the REAL openGuardedClient --------
/** Base offline deps (fs + fixed clock + GUARD_ENV). httpGet/call are supplied to the fetch adapter (runGuarded). */
function fileDeps(extra: Partial<RunDeps> = {}): RunDeps {
  return {
    sleep: noop, now: nowFixed, env: GUARD_ENV,
    readFile: (p) => readFileSync(p, "utf8"), writeFile: (p, d) => { writeFileSync(p, d); },
    appendFile: (p, d) => { appendFileSync(p, d); },
    exists: (p) => existsSync(p), mkdirp: (p) => { mkdirSync(p, { recursive: true }); },
    ...extra,
  };
}
/** Run the WHOLE composition through the REAL openGuardedClient with ONLY globalThis.fetch stubbed (D-1/D-3): the
 *  issuer GET + the quorum RPC hit the client's transport, which fetches; the adapter routes those to httpGet/call.
 *  --ledger-dir is a fresh PRE-EXISTING temp cycle dir unless given. */
async function runGuarded(argv: readonly string[], opts: { httpGet?: StubHttpGet; call?: JsonRpcCall; ledgerDir?: string } & Partial<RunDeps> = {}): Promise<RunResult> {
  const { httpGet = defaultHttpGet, call = concordantCall(rpcMap()), ledgerDir = tmpLedgerDir(), ...depsExtra } = opts;
  let r!: RunResult;
  await withFetch(fetchAdapter(httpGet, call), async () => { r = await runUniverse(gArgs(argv, ledgerDir), fileDeps(depsExtra)); });
  return r;
}
test("bell_universe_cli_composes_from_file_to_artifact", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-out-"));
  try {
    const argv = ["--out", out, "--max-calls", "1000", "--date", "2026-09-21", "--page-size", "100"];
    const logs: string[] = [];
    const r = await runGuarded(argv, { log: (l) => { logs.push(l); } });
    assert.equal(r.ok, true);
    assert.equal(r.calibration.ok, true);
    assert.equal(r.solanaAssets, 7); assert.equal(r.confirmed, 5); assert.equal(r.totalAssets, 8);
    // artifact + provenance + raw + ledger written OUT of repo; the written canonical body hashes to the
    // returned sha (byte-level; universeSha256 hashes the canonical form, i.e. the file minus trailing NL).
    const artifact = readFileSync(join(out, "universe-candidates-2026-09-21.json"), "utf8");
    assert.equal(createHash("sha256").update(artifact.replace(/\n+$/, "")).digest("hex"), r.artifactSha256);
    assert.ok(existsSync(join(out, "issuer-assets-2026-09-21.json")), "raw saved");
    assert.ok(existsSync(join(out, "PROVENANCE-univers-solana.md")));
    // C-5: RELIT the journal WRITTEN BY THE RUN (never a hand-built one), re-derives it (verifyChain.ok), and
    // makes its HEAD coincide with the fixed `ledger head sha256:` line of the produced PROVENANCE. readPriorCalls
    // now returns {calls, head, seq}.
    const journal = join(out, UNIVERSE_LEDGER_JOURNAL);
    const prior = readPriorCalls(join(out, "budget.json"), journal, existsSync, (p) => readFileSync(p, "utf8"));
    assert.equal(prior.calls, r.calls, "the anchor calls == the run's total");
    const chain = readFileSync(journal, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as unknown);
    const chk = verifyChain(chain);
    assert.equal(chk.ok, true, "C-5: the journal written by the run re-derives (verifyChain.ok)");
    assert.equal(prior.head, chk.head, "the resume head == the re-derived head");
    const provText = readFileSync(join(out, "PROVENANCE-univers-solana.md"), "utf8");
    const headLine = /^- ledger head sha256: ([0-9a-f]{64})$/m.exec(provText);
    assert.ok(headLine, "the provenance carries a fixed `- ledger head sha256: <hex>` line");
    assert.equal(headLine[1], chk.head, "C-5: the provenance head-sha line equals the re-derived journal head");
    assert.ok(r.calls >= 1 + 7 * 2, "one GET page + 2 confirmations per Solana mint + the C-11 +1 probe counted in the budget");
    // C-G2-2: NO produced file (artifact, provenance, anchor, JOURNAL, raw) and NO stdout line may carry the
    // operator's paid-host pattern NOR the REAL test placeholder — not a vacuous "deadbeef" that appears nowhere.
    const produced = [
      artifact,
      provText,
      readFileSync(join(out, "issuer-assets-2026-09-21.json"), "utf8"),
      readFileSync(join(out, "budget.json"), "utf8"),
      readFileSync(journal, "utf8"),
      ...logs,
    ];
    assert.ok(logs.length > 0, "the run logged at least one line (the scrub is exercised, not vacuous)");
    for (const s of produced) {
      assert.equal(s.includes("tk-node-key-placeholder"), false, "no Chainstack key-path placeholder in any output/stdout");
      assert.equal(s.includes("core.chainstack.com"), false, "no Chainstack operator host in any output/stdout");
    }
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 12b. C-V-2 / C-G2b-6: the C-11 probe OBSERVES, never STOPs on a server response; only a PURE budget cap
// STOPs. Placed AFTER the raw save. maxRetries:0 (0 retry). Fatal403Error/RedirectBlockedError are swallowed.
test("bell_universe_c11_probe_observes_never_stops_except_budget", async () => {
  const argv = (out: string, maxCalls: string): string[] => ["--out", out, "--max-calls", maxCalls, "--date", "2026-09-21"];
  // Each closure feeds the fetch adapter (runGuarded); a page>0 rejects {httpStatus} => the client's transport
  // returns that non-2xx => a typed TransportError; a plain Error => a network fault.
  const past = (status: number): StubHttpGet => (url) =>
    Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? Promise.resolve({ json: issuerAssets() }) : httpReject(status);
  // (a) 404 past-end => run OK, past_end_probe=http_404, raw present, probe called ONCE (0 retry, maxRetries:0).
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-p404-"));
  try {
    let probeCalls = 0;
    const httpGet: StubHttpGet = (url) => {
      if (Number(new URL(url).searchParams.get("page") ?? "0") === 0) return Promise.resolve({ json: issuerAssets() });
      probeCalls += 1; return httpReject(404);
    };
    const r = await runGuarded(argv(outA, "1000"), { httpGet });
    assert.equal(r.ok, true, "MUTANT (probe catch removed): a 404 past-end must NOT stop the run");
    assert.equal(probeCalls, 1, "MUTANT (maxRetries:0 removed): the probe retries => probeCalls > 1 => red");
    assert.ok(existsSync(join(outA, "issuer-assets-2026-09-21.json")), "raw saved BEFORE the probe");
    assert.match(readFileSync(join(outA, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: http_404$/m, "404 recorded, run completed");
  } finally { rmSync(outA, { recursive: true, force: true }); }
  // (b) 403 at the probe => run OK, past_end_probe=http_403 (Fatal403Error, a BudgetExceededError SUBCLASS, swallowed).
  const outB = mkdtempSync(join(tmpdir(), "bell-univ-p403-"));
  try {
    const r = await runGuarded(argv(outB, "1000"), { httpGet: past(403) });
    assert.equal(r.ok, true, "MUTANT (Fatal403Error not caught before the budget re-throw): a 403 past-end must NOT stop the run");
    assert.ok(existsSync(join(outB, "issuer-assets-2026-09-21.json")), "raw saved");
    assert.match(readFileSync(join(outB, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: http_403$/m, "403 recorded, run completed");
  } finally { rmSync(outB, { recursive: true, force: true }); }
  // (c) PURE budget cap at the probe => STOP. A page with NO Solana mint (0 confirms after the probe), --max-calls=1
  // (only the page GET fits): the probe's client.call refuses run_calls => a PURE BudgetExceededError => the run
  // REJECTS. MUTANT (budget re-throw removed): the probe swallows it, the run reaches calibration (no reject).
  const outC = mkdtempSync(join(tmpdir(), "bell-univ-pcap-"));
  try {
    const evmOnly: StubHttpGet = () => Promise.resolve({ json: [{ id: "evm-only", deployments: [{ network: "Ethereum", address: "0x0" }] }] });
    await assert.rejects(() => runGuarded([...argv(outC, "1"), "--page-size", "100"], { httpGet: evmOnly }),
      BudgetExceededError, "MUTANT (budget re-throw removed): a real budget cap at the probe must STOP => red");
    // C-R-1: the raw was saved BEFORE the probe, so it is PRESENT even after the budget STOP. MUTANT (raw save moved
    // AFTER the probe): the STOP happens before the raw is written => this reddens.
    assert.ok(existsSync(join(outC, "issuer-assets-2026-09-21.json")), "raw is present after the budget STOP (raw saved before the probe)");
  } finally { rmSync(outC, { recursive: true, force: true }); }
  // (d) C-R-1: a 3xx (RedirectBlockedError, a BudgetExceededError SUBCLASS) at the probe => run OK, redirect_blocked.
  const outD = mkdtempSync(join(tmpdir(), "bell-univ-predir-"));
  try {
    const r = await runGuarded(argv(outD, "1000"), { httpGet: past(302) });
    assert.equal(r.ok, true, "MUTANT (RedirectBlockedError not caught before the budget re-throw): a 3xx past-end must NOT stop the run");
    assert.match(readFileSync(join(outD, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: redirect_blocked$/m, "3xx recorded as redirect_blocked, run completed");
  } finally { rmSync(outD, { recursive: true, force: true }); }
  // (e) C-R-1: a plain transport error at the probe => run OK, transport_error. MUTANT (transport_error turned into a
  // re-throw): the run stops instead of recording transport_error => reddens.
  const outE = mkdtempSync(join(tmpdir(), "bell-univ-ptrans-"));
  try {
    const httpGet: StubHttpGet = (url) =>
      Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? Promise.resolve({ json: issuerAssets() }) : Promise.reject(new Error("ECONNRESET"));
    const r = await runGuarded(argv(outE, "1000"), { httpGet });
    assert.equal(r.ok, true, "a transport error past-end must NOT stop the run");
    assert.match(readFileSync(join(outE, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: transport_error$/m, "transport error recorded as transport_error, run completed");
  } finally { rmSync(outE, { recursive: true, force: true }); }
});

// ---- 13. Byte-exact replay: committed raw + rpc => the frozen artifact, byte for byte -----------------
test("bell_universe_artifact_byte_exact_replay", async () => {
  const map = rpcMap();
  const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(issuerAssets(), (m) => confirmMintIdentity(m, PROVIDERS, concordantCall(map)));
  const bytes = universeArtifactBytes(buildUniverseArtifact(candidates, { totalAssets, solanaAssets }));
  const expected = readFileSync(join(FIX, "expected-universe-candidates.json"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(bytes, expected, "artifact is byte-identical to the frozen expected fixture (timestamp-free body)");
});

// ---- 13b. D2 (C-G2-6): sanitizeIdentityText empties a price-bearing name/symbol; fixture is IDENTITY -------
test("bell_universe_identity_text_sanitized_no_false_reject", () => {
  // The 8 name + 8 symbol of the fixture are plain identity => sanitize is the IDENTITY on each one (so the
  // byte-exact-replay fixture, test 13, is untouched). Proven EXPLICITLY here, not merely inferred from test 13.
  for (const a of issuerAssets() as Record<string, unknown>[]) {
    assert.equal(sanitizeIdentityText(String(a.name)), String(a.name), `name identity: ${String(a.name)}`);
    assert.equal(sanitizeIdentityText(String(a.symbol)), String(a.symbol), `symbol identity: ${String(a.symbol)}`);
  }
  // Legitimate identity variety passes unchanged (no false reject) — incl. the DECLARED residual "TSLA 420", and
  // symbol-like currency prefixes "USDx"/"USDCx"/"EURCx" (a LETTER follows the code => not a glued amount, C-V-4).
  for (const ok of ["3M", "S&P 500", "Moody's", "AT&T", "SP500 xStock", "TSLA 420", "USDx", "USDCx", "EURCx"]) assert.equal(sanitizeIdentityText(ok), ok, `no false reject: ${ok}`);
  // C-V-4 MUTANT (`\b` boundary restored): a GLUED currency+amount slips past `\b` but MUST be emptied by the
  // letter-boundary lookaround. Also the COMMA decimal separator. Each of these must be EMPTIED.
  for (const bad of ["Tesla 420.69", "$500", "USD 12", "1.5x", "eur 3", "Fund 2.5", "USD12", "12USD", "AAPL USD150", "EUR3", "Fund 2,5"]) assert.equal(sanitizeIdentityText(bad), "", `emptied: ${bad}`);
  assert.equal(sanitizeIdentityText("A".repeat(65)), "", "> 64 chars is emptied");
  // MUTANT (sanitizer no-op): a price injected into a candidate `name` must be EMPTIED in the built record.
  const withPrice: SolanaCandidate = { symbol: "TSLAx", name: "Tesla $500", mint: "XsDoV", network: "Solana", mic: null, onchain: confirmedReadout() };
  assert.equal(buildCandidateRecord(withPrice).name, "", "MUTANT: a no-op sanitizer leaves the price in name => red");
  assert.equal(buildCandidateRecord(withPrice).symbol, "TSLAx", "a clean symbol is unchanged");
  assert.equal(countIdentityEmptied([withPrice]), 1, "exactly one field (name) counted as emptied");
});

// ---- 14. Calibration STOP: a missing founder => no artifact, but raw IS saved (raw before oracle) -----
test("bell_universe_calibration_stop_writes_no_artifact", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-stop-"));
  try {
    const assetsMinusFounder = (issuerAssets() as Record<string, unknown>[]).filter((a) => a.symbol !== "NVDAx");
    const httpGet: StubHttpGet = (url) => Promise.resolve({ json: Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? assetsMinusFounder : [] });
    const r = await runGuarded(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], { httpGet });
    assert.equal(r.ok, false);
    assert.deepEqual([...r.calibration.missing], ["NVDAx"]);
    assert.equal(existsSync(join(out, "universe-candidates-2026-09-21.json")), false, "NO artifact on calibration fail");
    assert.ok(existsSync(join(out, "issuer-assets-2026-09-21.json")), "raw saved BEFORE the oracle (the proof)");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 15. Preflight: two DISTINCT operators required BEFORE burning any issuer page -------------------
test("bell_universe_preflight_requires_two_distinct_operators", async () => {
  const LABELS = [SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR];
  assert.doesNotThrow(() => { assertProvidersDistinctForQuorum(LABELS); });
  // a non-universe label (mainnet-beta) is refused at the LABEL allowlist stage (C-7), before the operator check.
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_FOUNDATION_LABEL, "api.mainnet-beta.solana.com"]); }, /allowlist/);
  // two solana-foundation labels collapse to ONE operator => no quorum-2.
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_FOUNDATION_LABEL, SOLANA_FOUNDATION_LABEL]); }, /operator/);
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_FOUNDATION_LABEL, ""]); }, /two RPC providers/);
  // runUniverse with NO Chainstack env => openGuardedClient throws (chainstack not resolved) BEFORE any issuer fetch.
  const out = mkdtempSync(join(tmpdir(), "bell-univ-pre-"));
  try {
    let getFired = false;
    const stub = fetchAdapter(() => { getFired = true; return Promise.resolve({ json: [] }); }, concordantCall(rpcMap()));
    await withFetch(stub, () => assert.rejects(
      () => runUniverse(gArgs(["--out", out, "--max-calls", "100"], tmpLedgerDir()), fileDeps({ env: {} })),
      /chainstack|operator|resolved from env/));
    assert.equal(getFired, false, "no issuer page fetched when the chainstack operator is not resolved from env");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- CLI arg validation (fail-closed) ---------------------------------------------------------------
test("bell_universe_parse_args_fail_closed", () => {
  // GARDE-HELIUS-1b-i: the guarded-client inputs are REQUIRED, no default (B-4). A valid argv carries all of them.
  const G = ["--ledger-dir", "F:/ld", "--cycle", "c", "--floor", "0", "--max-ru", "1000000", "--method-caps", "getAccountInfo=20000", "--operators", OPERATORS];
  const full = ["--out", "F:/x", "--max-calls", "1800", ...G];
  const drop = (flag: string): string[] => { const i = full.indexOf(flag); return [...full.slice(0, i), ...full.slice(i + 2)]; };
  const swap = (flag: string, value: string): string[] => { const i = full.indexOf(flag); const c = [...full]; c[i + 1] = value; return c; };
  assert.throws(() => parseUniverseArgs(["--max-calls", "10"]), /--out is required/);
  assert.throws(() => parseUniverseArgs(["--out", "F:/x"]), /--max-calls is required/);
  assert.throws(() => parseUniverseArgs(swap("--max-calls", "0")), /--max-calls must be > 0/);
  const a = parseUniverseArgs(full);
  assert.equal(a.minInterval, 286); assert.equal(a.pageSize, 100); assert.equal(a.maxCalls, 1800);
  assert.equal(a.ledgerDir, "F:/ld"); assert.equal(a.cycle, "c"); assert.equal(a.maxRu, 1000000);
  assert.deepEqual(a.methodCaps, { getAccountInfo: 20000 });
  assert.deepEqual(a.operators, ["solana-foundation", "chainstack", "xstocks-issuer"]);
  // Each guarded-client input is REQUIRED (B-4): dropping it fails closed.
  for (const [flag, re] of [["--ledger-dir", /--ledger-dir is required/], ["--cycle", /--cycle is required/], ["--floor", /--floor is required/], ["--max-ru", /--max-ru is required/], ["--method-caps", /--method-caps is required/], ["--operators", /--operators is required/]] as const) {
    assert.throws(() => parseUniverseArgs(drop(flag)), re, `missing ${flag} fails closed`);
  }
  assert.throws(() => parseUniverseArgs(swap("--max-ru", "0")), /--max-ru must be > 0/);
  // --operators must equal EXACTLY the universe subset (C-12): a partial or wrong set fails closed.
  assert.throws(() => parseUniverseArgs(swap("--operators", "solana-foundation,chainstack")), /must be EXACTLY/);
  assert.throws(() => parseUniverseArgs(swap("--operators", "solana-foundation,chainstack,helius")), /must be EXACTLY/);
  // C-G2-5: an unknown/typo flag is fail-closed BEFORE any write or call (MUTANT: silently ignored => red).
  assert.throws(() => parseUniverseArgs([...full, "--maxpages", "20"]), /unknown flag/);
  assert.throws(() => parseUniverseArgs([...full, "--typo"]), /unknown flag/);
  // C-G2-5: --min-interval below the 286 ms floor (0 would DISABLE pacing) is refused (MUTANT: accepted => red).
  assert.throws(() => parseUniverseArgs([...full, "--min-interval", "0"]), /floor/);
  assert.throws(() => parseUniverseArgs([...full, "--min-interval", "100"]), /floor/);
  // The pre-registered race command parses cleanly (all flags known; 286 >= floor).
  const pre = parseUniverseArgs([...full, "--min-interval", "286", "--page-size", "100", "--max-pages", "20", "--max-429-streak", "5", "--date", "2026-09-21"]);
  assert.equal(pre.minInterval, 286); assert.equal(pre.maxPages, 20); assert.equal(pre.max429Streak, 5);
});

const confirmedReadout = (): OnchainReadout => ({
  state: "confirmed", owner: TOKEN_2022_PROGRAM, decimals: 8, scaled_ui: false, scaled_ui_authority: null,
  scaled_ui_unread: false, extension_names: [], permanent_delegate: null,
});

// ---- 16. C-G2-1: artifact order is UTF-16 CODE UNIT (locale-independent), never localeCompare ----------
test("bell_universe_artifact_order_is_code_unit_not_locale", () => {
  const mk = (symbol: string, mint: string): SolanaCandidate => ({ symbol, name: symbol, mint, network: "Solana", mic: null, onchain: confirmedReadout() });
  // A mixed-case mint set: code-unit order (uppercase < lowercase) diverges from any locale collation.
  const mints = ["Xso1", "Xsb1", "XsD1", "Xsc1", "aa1", "Ma1", "Za1"];
  const body = buildUniverseArtifact(mints.map((m, i) => mk(`S${String(i)}`, m)), { totalAssets: mints.length, solanaAssets: mints.length }) as { candidates: { mint: string }[] };
  const got = body.candidates.map((c) => c.mint);
  // MUTANT N-1 (localeCompare): order MUST equal Array#sort's default (UTF-16 code unit, locale-independent).
  assert.deepEqual(got, [...mints].sort(), "artifact candidate order is code-unit, not locale-dependent");
});

// ---- 17. C-G2-2: the provenance names operators by DOMAIN only — never the Chainstack node url (N-2) ----
test("bell_universe_provenance_never_prints_operator_url", () => {
  // The write path passes `providers` (providers[1] is the paid Chainstack url) to provenanceMd. New params:
  // ledger head (D1), identity_text_emptied (D2), past_end_probe (C-11).
  const prov = provenanceMd("2026-09-21", [SOLANA_PUBLIC_URL, CHAINSTACK], "rawsha", "artsha", 8, 7, 5, LEDGER_GENESIS, 2, "array_len=0");
  // MUTANT N-2 (provenanceMd interpolates providers[1]): the host + key-path placeholder would appear here.
  assert.equal(prov.includes("tk-node-key-placeholder"), false, "no Chainstack key-path in provenance");
  assert.equal(prov.includes("core.chainstack.com"), false, "no Chainstack operator host in provenance");
  assert.ok(prov.includes("chainstack (node url held"), "operator named by domain/word only, url held in the env");
  // The new lines are present, in fixed parsable form.
  assert.match(prov, /^- ledger head sha256: [0-9a-f]{64}$/m, "fixed `- ledger head sha256: <hex>` line (C-5 parsable)");
  assert.match(prov, /^- identity_text_emptied: 2$/m, "identity_text_emptied count line (D2)");
  assert.match(prov, /^- past_end_probe: array_len=0$/m, "past_end_probe observation line (C-11)");
});

// ---- 18/19 REMOVED (GARDE-HELIUS-1b-i, D-4 annotated) ------------------------------------------------------
// liveHttpGet / liveRpcCall are DELETED: the guarded client's PRIVATE transport owns the only fetch, so the
// "live 3xx never followed" guarantee is carried PACKAGE-side by transport-hardening.test.ts (D-9a
// redirect:"manual" for GET and POST), and the URL-parse / host guard by resolveGetUrl (structural host, 1b-0
// C-7). assertHostAllowed is now a LABEL test (test 6). No Bell surface parses a URL anymore, so the C-G2-3
// (live redirect) and C-G2-4 (https/userinfo/parseable URL) tests have no Bell surface to exercise.

// ---- 20. C-G2-5 / N-4: every live call is preceded by >= min-interval of pacing (injected clock) --------
test("bell_universe_paces_every_call_by_min_interval", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-pace-"));
  try {
    let clock = 0;
    const callTimes: number[] = [];
    const rpc = concordantCall(rpcMap());
    const httpGet: StubHttpGet = (u) => { callTimes.push(clock); return defaultHttpGet(u); };
    const call: JsonRpcCall = (u, m, p) => { callTimes.push(clock); return rpc(u, m, p); };
    const r = await runGuarded(["--out", out, "--max-calls", "1000", "--date", "2026-09-21", "--min-interval", "286"],
      { httpGet, call, sleep: (ms: number) => { clock += ms; return Promise.resolve(); }, now: () => clock });
    assert.equal(r.ok, true);
    assert.ok(callTimes.length >= 1 + 7 * 2, "one page GET + 2 confirmations per Solana mint were made");
    // MUTANT N-4 (pacing removed): each call is preceded by >= 286 ms of virtual time; deltas would collapse to 0.
    assert.ok(callTimes.every((t, i) => (i === 0 ? t >= 286 : t - (callTimes[i - 1] ?? 0) >= 286)), "every live call is paced by >= min-interval (N-4)");
    assert.equal(clock, callTimes.length * 286, "total virtual pacing == calls * min-interval (no retries, no unpaced call)");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 22 REMOVED (GARDE-HELIUS-1b-i, D-4 annotated) ---------------------------------------------------------
// The subprocess "CLI never egresses under a no-network shim" test spawned the CLI with a placeholder
// CHAINSTACK_SOLANA_URL. Post-migration the CLI needs 6 more required flags (--ledger-dir/--cycle/--floor/--max-ru/
// --method-caps/--operators) and a PRE-EXISTING cycle dir, and its old sub-case (a) (an http:// url refused at a
// URL-parsing preflight) no longer exists (the preflight is LABEL-based; the http-vs-https POST-url check is a
// FORMED ITEM against the PACKAGE transport). The no-egress guarantee is kept by test 23 (the shim blocks at the
// `net` level, not just fetch) and by the D-1 guard test `bell_course_reaches_fetch_only_via_openGuardedClient`
// (every course fetch goes to a client-resolved operator host; Bell src carries no fetch — grep test T4a).

// ---- 23. C-V-5 (C-8): the shim blocks at the `net` level — http.request/https.request/net.connect/fetch ALL
// blocked to a CLOSED loopback port (not just fetch). This is the test that test 22 could NOT provide (the CLI
// only uses fetch, so the fetch belt alone reddened test 22). Witness without the shim = ECONNREFUSED.
test("bell_universe_no_network_shim_blocks_at_net_level", () => {
  const shim = fileURLToPath(new URL("./helpers/no-network.mjs", import.meta.url));
  const probe = fileURLToPath(new URL("./helpers/net-probe.mjs", import.meta.url));
  // WITH the shim: all four clients are blocked at the `net` patch (SHIM:), zero real connection.
  const r = spawnSync(process.execPath, ["--import", pathToFileURL(shim).href, probe], { encoding: "utf8", timeout: 20000 });
  assert.equal(r.status, 0, "the net-probe runs to completion under the shim");
  const out = JSON.parse((r.stdout.trim().split("\n").pop() ?? "{}")) as Record<string, string>;
  // MUTANT (net.Socket.prototype.connect patch removed): net/http/https revert to ECONNREFUSED (fetch stays SHIM:
  // via the belt) => these assertions redden. The net patch — not the fetch belt — is what this test locks (C-8).
  for (const k of ["net", "http", "https"]) assert.match(out[k] ?? "", /SHIM:/, `${k} is blocked at the net patch (not a real connect): ${String(out[k])}`);
  assert.match(out["fetch"] ?? "", /SHIM:/, "fetch is blocked by the belt");
  // WITNESS without the shim: the net-level clients reach the CLOSED loopback port => ECONNREFUSED (a real LOCAL
  // refusal, no egress). Proves SHIM: comes from the shim, not from the closed port, and the net patch is load-bearing.
  const w = spawnSync(process.execPath, [probe], { encoding: "utf8", timeout: 20000 });
  const wout = JSON.parse((w.stdout.trim().split("\n").pop() ?? "{}")) as Record<string, string>;
  assert.match(wout["net"] ?? "", /ECONNREFUSED/, `witness (no shim): net.connect reaches the closed loopback port (ECONNREFUSED): ${String(wout["net"])}`);
});

// ==== GARDE-HELIUS-1b-i named guard tests: the composition through the REAL openGuardedClient (G0 §7) ============
const cycLedger = (ld: string, op: string, cycle = "cyc"): string => join(ld, cycle, `${op}.jsonl`);
const attemptedLines = (p: string): number => (existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).length : 0);
const hasOutcome = (p: string, o: string): boolean => existsSync(p) && readFileSync(p, "utf8").includes(`"outcome":"${o}"`);
const jbody = (v: unknown): Response => new Response(JSON.stringify(v), { status: 200, headers: { "content-type": "application/json" } });
const rpcOk = (init?: RequestInit): Response => { const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] }; return jbody({ jsonrpc: "2.0", id: 1, result: rpcMap()[String(req.params[0])] ?? { value: null } }); };

// IT-1 (+ D-1): the whole course spends ONLY through the guard. Every PAID (chainstack) fetch is preceded by its
// write-ahead ledger line ON DISK (P6); every fetch goes to a CLIENT-resolved operator host (Bell src has no fetch,
// grep test T4a). BOTH issuer body forms — {assets:[…]} AND a BARE ARRAY — flow VERBATIM to foldPage (G7 1b-0 §5).
test("universe_spends_only_through_guard", async () => {
  for (const wrap of [true, false]) { // true => {assets:[…]} envelope; false => a BARE ARRAY body
    const out = mkdtempSync(join(tmpdir(), "bell-univ-it1-")); const ld = tmpLedgerDir();
    const csL = cycLedger(ld, "chainstack");
    let csFetches = 0; let writeAheadOk = true; const hosts = new Set<string>();
    const assets = issuerAssets();
    const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input); hosts.add(new URL(url).hostname);
      if (url.includes("xstocks")) {
        const page = Number(new URL(url).searchParams.get("page") ?? "0");
        return Promise.resolve(jbody(page === 0 ? (wrap ? { assets } : assets) : (wrap ? { assets: [] } : [])));
      }
      if (url.includes("invalid")) { csFetches += 1; if (attemptedLines(csL) < csFetches) writeAheadOk = false; } // chainstack host
      return Promise.resolve(rpcOk(init));
    }) as typeof globalThis.fetch;
    try {
      let r!: RunResult;
      await withFetch(spy, async () => { r = await runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21", "--page-size", "100"], ld), fileDeps()); });
      assert.equal(r.ok, true, `both body forms compose to an artifact (wrap=${String(wrap)})`);
      assert.equal(r.solanaAssets, 7, "the envelope AND the BARE ARRAY are read VERBATIM by pageAssets/foldPage (G7 1b-0 §5)");
      assert.ok(csFetches >= 1, "chainstack was actually drawn (paid leg exercised)");
      assert.ok(writeAheadOk, "MUTANT (append AFTER transport): every paid fetch is preceded by its write-ahead ledger line ON DISK");
      assert.ok(attemptedLines(csL) >= csFetches, "the chainstack ledger carries >= 1 attempted line per paid fetch");
      for (const h of hosts) assert.ok(h === "api.xstocks.fi" || h === "api.mainnet.solana.com" || h.includes("invalid"), `D-1: every fetch is to a client operator host (${h})`);
    } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
  }
});

// C-1: a budget refusal is LEDGERED (a chained `refused` line) and NEVER retried; the run STOPS (rejects). --floor at
// the 16 M RU cap => the FIRST chainstack getAccountInfo (1 RU) refuses cycle_cap BEFORE the transport (0 paid fetch).
test("universe_budget_refusal_is_not_retried", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-c1-")); const ld = tmpLedgerDir();
  const csL = cycLedger(ld, "chainstack");
  let csFetches = 0;
  const spy = (async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("xstocks")) return jbody((await defaultHttpGet(url)).json);
    if (url.includes("invalid")) csFetches += 1;
    return rpcOk(init);
  }) as typeof globalThis.fetch;
  try {
    await withFetch(spy, () => assert.rejects(
      () => runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld, "cyc", "16000000"), fileDeps()),
      BudgetExceededError, "a cycle_cap refusal STOPs the run (never a truncated universe as complete)"));
    const refused = existsSync(csL) ? readFileSync(csL, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"refused"')).length : 0;
    assert.equal(refused, 1, "MUTANT (local BudgetExceededError class restored): the refusal is retried => > 1 refused line");
    assert.equal(csFetches, 0, "the refused call never reached the transport (0 paid fetch) and was NOT retried");
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
});

// C-12: the operator SUBSET comes from the CLI (--operators), not an env probe. The env carries BELL_SOLANA_RPC +
// HELIUS_API_KEY (helius IS resolvable) but --operators OMITS helius => openGuardedClient never opens/locks helius.
test("universe_operator_subset_comes_from_cli_not_env", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-c12-")); const ld = tmpLedgerDir();
  const env = { CHAINSTACK_SOLANA_URL: CHAINSTACK_GUARD, BELL_SOLANA_RPC: "https://helius.example.invalid", HELIUS_API_KEY: "FAKE-NOT-A-REAL-KEY" };
  try {
    let r!: RunResult;
    await withFetch(fetchAdapter(defaultHttpGet, concordantCall(rpcMap())), async () => { r = await runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps({ env })); });
    assert.equal(r.ok, true);
    assert.equal(existsSync(join(ld, "cyc", "helius.jsonl")), false, "MUTANT (env probe restored): helius is resolvable from env but NOT requested => no helius ledger");
    assert.equal(existsSync(join(ld, "cyc", "helius.lock")), false, "helius is never locked (not in --operators)");
    for (const op of ["chainstack", "solana-foundation", "xstocks-issuer"]) assert.ok(existsSync(cycLedger(ld, op)), `${op} ledger opened (subset from --operators)`);
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
});

// D-2: retry is ABOVE the client — R retries RE-ENTER client.call => R+1 write-ahead ledger lines (not one line for
// a below-the-client retry). A single Solana mint, chainstack always 503 (transient) => maxRetries+1 = 5 attempts.
test("universe_retry_counts_each_attempt", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-d2-")); const ld = tmpLedgerDir();
  const csL = cycLedger(ld, "chainstack");
  let csFetches = 0;
  const oneMint = [{ id: "m", symbol: "Mx", name: "Mx", deployments: [{ network: "Solana", address: "MintXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }] }];
  const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("xstocks")) return Promise.resolve(jbody(Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? oneMint : []));
    if (url.includes("invalid")) { csFetches += 1; return Promise.resolve(new Response("busy", { status: 503 })); } // chainstack always 503 (transient)
    return Promise.resolve(rpcOk(init));
  }) as typeof globalThis.fetch;
  try {
    let r!: RunResult;
    await withFetch(spy, async () => { r = await runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps()); });
    assert.equal(r.ok, false, "the single mint is not a founder => calibration fails, but the retry counting is the point");
    assert.equal(csFetches, 5, "a 503 retried 4x (maxRetries default) => 5 client.call => 5 chainstack fetches");
    assert.equal(attemptedLines(csL), 5, "MUTANT (retry NOT re-entering the client): R+1=5 write-ahead ledger lines (each retry is a new attempted line)");
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
});

// D-6: moving --out does NOT reset the CYCLE prior (the money guard lives in --ledger-dir). (a) a nonexistent
// --ledger-dir throws BEFORE any lock (C-8). (b) run1 (outA) then run2 (outB, FRESH RUN ledger) on the SAME cycle =>
// chainstack.jsonl ACCUMULATES; run2's RUN anchor starts fresh (declared phantom-fresh residual, bounded by --max-calls).
test("universe_out_moved_on_resume_keeps_cycle_prior", async () => {
  const stub = fetchAdapter(defaultHttpGet, concordantCall(rpcMap()));
  // (a) the CYCLE dir MUST pre-exist (MUTANT "mkdirp(a.ledgerDir)": auto-creation => phantom-fresh => no throw => red).
  const out0 = mkdtempSync(join(tmpdir(), "bell-univ-d6a-"));
  const nonexistent = join(tmpdir(), `bell-univ-noexist-${String(process.pid)}-${String(Date.now())}`);
  try {
    await withFetch(stub, () => assert.rejects(() => runUniverse(gArgs(["--out", out0, "--max-calls", "1000"], nonexistent), fileDeps()), /does not pre-exist/));
    assert.equal(existsSync(nonexistent), false, "the nonexistent --ledger-dir was NOT auto-created");
  } finally { rmSync(out0, { recursive: true, force: true }); }
  // (b) same ledger-dir/cycle across two moved --out dirs => the CYCLE ledger accumulates.
  const ld = tmpLedgerDir(); const csL = cycLedger(ld, "chainstack");
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-d6A-")); const outB = mkdtempSync(join(tmpdir(), "bell-univ-d6B-"));
  try {
    await withFetch(stub, async () => {
      const r1 = await runUniverse(gArgs(["--out", outA, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps());
      const n1 = attemptedLines(csL);
      const r2 = await runUniverse(gArgs(["--out", outB, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps());
      const n2 = attemptedLines(csL);
      assert.ok(r1.ok && r2.ok, "both runs succeed");
      assert.ok(n1 >= 1 && n2 > n1, "the CYCLE ledger ACCUMULATES across moved --out (n2 > n1); moving --out never resets it");
      const anchorB = JSON.parse(readFileSync(join(outB, "budget.json"), "utf8")) as { calls: number };
      assert.ok(anchorB.calls >= 1, "run2's RUN anchor reflects its OWN count in the fresh --out (declared phantom-fresh residual, bounded by --max-calls; the CYCLE ledger is the inter-run guard)");
    });
  } finally { for (const d of [outA, outB, ld]) rmSync(d, { recursive: true, force: true }); }
});

// D-9b: a 403 on a guarded confirm is a FATAL hard stop — Fatal403Error (a BudgetExceededError subclass) re-thrown by
// quorum2 => the run STOPS (rejects), NEVER retried. MUTANT (403 retried / not hard-stopped): the run continues.
test("transport_403_is_fatal_hard_stop", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-d9b-")); const ld = tmpLedgerDir();
  const spy = (async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("xstocks")) return jbody((await defaultHttpGet(url)).json);
    if (url.includes("invalid")) return new Response("forbidden", { status: 403 }); // chainstack 403
    return rpcOk(init);
  }) as typeof globalThis.fetch;
  try {
    await withFetch(spy, () => assert.rejects(
      () => runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps()),
      (e: unknown) => { assert.ok(e instanceof Fatal403Error && e instanceof BudgetExceededError, "a 403 on a guarded call is a fatal hard stop (never retried)"); return true; }));
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
});

// Reconcile e2e (+ finally-unlock): the run auto-unlocks all N operators (no .lock; an `unlocked` line each), then the
// SERVED reconcile consumes the chainstack ledger. 121: aggregate on the ACCOUNT total_ru (Σ networks); the FIRST
// Solana course is aggregate-calibration => GO (delta <= ledger_run). This is the "through to reconcile GO/NO-GO" tuyau.
test("universe_finally_unlocks_then_reconcile_goes", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-rec-")); const ld = tmpLedgerDir();
  try {
    let r!: RunResult;
    await withFetch(fetchAdapter(defaultHttpGet, concordantCall(rpcMap())), async () => { r = await runUniverse(gArgs(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], ld), fileDeps()); });
    assert.equal(r.ok, true);
    for (const op of ["solana-foundation", "chainstack", "xstocks-issuer"]) {
      assert.ok(!existsSync(join(ld, "cyc", `${op}.lock`)), `MUTANT (finally without N unlock): ${op}.lock is released in the finally`);
      assert.ok(hasOutcome(cycLedger(ld, op), "unlocked"), `${op}.jsonl carries the chained unlocked line`);
    }
    const ru = attemptedLines(cycLedger(ld, "chainstack")); // 1 RU per chainstack getAccountInfo
    const before = join(out, "snap-b.json"); const after = join(out, "snap-a.json");
    writeFileSync(before, JSON.stringify({ cycle: "cyc", total_ru: 0 })); writeFileSync(after, JSON.stringify({ cycle: "cyc", total_ru: ru }));
    const rec = runCli(["reconcile", "--cycle", "cyc", "--op", "chainstack", "--mode", "aggregate-calibration", "--before", before, "--after", after], { ledgerDir: ld, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as { cycle: string } });
    assert.equal(rec.exitCode, 0, "reconcile (aggregate-calibration) GOes: account total_ru delta <= ledger_run, exit 0");
    assert.equal(rec.verdict, "GO");
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(ld, { recursive: true, force: true }); }
});
