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
  ISSUER_HOST, SOLANA_PUBLIC_URL, SOLANA_PUBLIC_HOST, CANDIDATE_FIELDS, PRICE_LIKE_FIELD,
  hostOf, assertHostAllowed, assertMethodAllowed, guardedRpcCall, scrubSecret,
  retryAfterMs, withUniverseRetry, HttpStatusError, Fatal403Error,
  makeUniverseBudget, readPriorCalls, serializeLedger,
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
import { runUniverse, parseUniverseArgs, liveHttpGet, liveRpcCall, provenanceMd, type RunDeps, type HttpGetResult, type HttpGet } from "../src/universe-cli.ts";
import { makeBudgetedCall } from "../src/collect.ts";
import { BudgetExceededError, type JsonRpcCall } from "../src/quorum.ts";
import { XSTOCKS, TOKEN_2022_PROGRAM } from "../src/pools.ts";
import { createServer, type Server } from "node:http";
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
    ? Promise.reject(new HttpStatusError(429, 1000))
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

// ---- 6. Host allowlist: refuse BEFORE send (mainnet-beta / publicnode / gecko excluded) --------------
test("bell_universe_host_allowlist_refuses_before_send", () => {
  assert.doesNotThrow(() => { assertHostAllowed(`https://${ISSUER_HOST}/api/v2/public/assets`); });
  assert.doesNotThrow(() => { assertHostAllowed(SOLANA_PUBLIC_URL); });
  assert.doesNotThrow(() => { assertHostAllowed(CHAINSTACK); }); // operatorOf === chainstack
  for (const bad of [
    "https://api.mainnet-beta.solana.com", "https://solana-rpc.publicnode.com",
    "https://api.geckoterminal.com/api/v2", "https://api.coingecko.com/onchain",
    "https://evil.example/x", // MUTANT target: an env pointing off-operator is refused
  ]) assert.throws(() => { assertHostAllowed(bad); }, /allowlist/, `host refused: ${hostOf(bad)}`);
  // guardedRpcCall refuses off-host BEFORE the inner call fires.
  let fired = false;
  const inner: JsonRpcCall = () => { fired = true; return Promise.resolve(null); };
  assert.throws(() => guardedRpcCall(inner)("https://evil.example", "getAccountInfo", []), /allowlist/);
  assert.equal(fired, false, "MUTANT: an off-allowlist host reaching the inner call must redden");
  assert.equal(hostOf(SOLANA_PUBLIC_URL), SOLANA_PUBLIC_HOST);
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
test("bell_universe_budget_fail_closed_and_resumes_without_double_count", async () => {
  // priorCalls offsets the cap: with max 5 and prior 3, only 2 more calls before BudgetExceededError.
  const inner: JsonRpcCall = () => Promise.resolve(null);
  const b = makeUniverseBudget(5, 3, makeBudgetedCall, inner);
  await b.call("u", "getAccountInfo", []); await b.call("u", "getAccountInfo", []);
  assert.equal(b.total(), 5, "MUTANT M17: total() must be priorCalls + calls(), not calls() alone");
  await assert.rejects(() => b.call("u", "getAccountInfo", []), BudgetExceededError, "cap reached across resume");
  // priorCalls >= maxCalls => refuse at construction (already spent).
  assert.throws(() => makeUniverseBudget(5, 5, makeBudgetedCall, inner), BudgetExceededError);
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
  const runArgs = (out: string): string[] => ["--out", out, "--max-calls", "1000", "--date", "2026-09-21"];
  // Injection A ("append LOST"): appendFile throws WITHOUT writing on the 3rd append => a real 2-entry chain
  // exists, then the anchor (written FIRST) is AHEAD of the journal head. Resume must NOT throw (over-count,
  // conservative). (This injection does NOT discriminate M-order; injection B below is the M-order killer.)
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-crashA-"));
  try {
    let appends = 0;
    const crash = fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outA, {
      appendFile: (p, d) => { appends += 1; if (appends === 3) throw new Error("SIMULATED crash: appendFile failed AFTER the anchor"); appendFileSync(p, d); },
    });
    await assert.rejects(() => runUniverse(runArgs(outA), crash), /SIMULATED crash/);
    const resumed = await runUniverse(runArgs(outA), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outA));
    assert.equal(resumed.ok, true, "C-6: a crash in the append window resumes WITHOUT throwing (anchor-first => over-count, conservative)");
    assert.equal(verifyChain(readJournal(outA)).ok, true, "the resumed journal (run1 partial + run2) is ONE re-derivable chain");
  } finally { rmSync(outA, { recursive: true, force: true }); }

  // Injection B ("anchor LOST"): writeFile throws WITHOUT writing on the 3rd write to the ANCHOR path. Under
  // correct order (anchor first) the append never lands => anchor == head => resume OK. Under M-order the append
  // DID land => anchor < head => resume THROWS. This is the M-order KILLER: the assertion `resumed.ok === true`
  // reddens when persist()'s order is swapped (append before the anchor).
  const outB = mkdtempSync(join(tmpdir(), "bell-univ-crashB-"));
  try {
    const anchorPath = join(outB, "budget.json");
    let anchorWrites = 0;
    const crash = fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outB, {
      writeFile: (p, d) => { if (p === anchorPath) { anchorWrites += 1; if (anchorWrites === 3) throw new Error("SIMULATED crash: anchor write failed"); } writeFileSync(p, d); },
    });
    await assert.rejects(() => runUniverse(runArgs(outB), crash), /SIMULATED crash/);
    const resumed = await runUniverse(runArgs(outB), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outB));
    assert.equal(resumed.ok, true, "MUTANT M-order: anchor-first leaves anchor == head on an anchor-write crash => resume OK; swapping to append-first leaves anchor < head => resume throws => red");
    assert.equal(verifyChain(readJournal(outB)).ok, true, "the resumed journal is ONE re-derivable chain");
  } finally { rmSync(outB, { recursive: true, force: true }); }
});

// ---- 8d. C-3: the ledger FORMAT is byte-identical to the -b3d calque (locked by TEST, not by comment) -----
test("bell_universe_ledger_format_is_byte_identical_to_b3d", () => {
  assert.equal(LEDGER_GENESIS, B3D_LEDGER_GENESIS, "same LEDGER_GENESIS as the -b3d calque");
  // HASHING DISCIPLINE byte-identity: universe's ledgerEntrySha256 applied to a -b3d PAGE core (in the calque's
  // field-write order) reproduces the calque's entry_sha256 EXACTLY. M-format KILLER: hashing via canonical()
  // (sorted keys) or renaming a field breaks this equality.
  const pageEntry = b3dChainedEntry(B3D_LEDGER_GENESIS, 0, [{ sig: "sigA", slot: 7 }, { sig: "sigB", slot: 9 }]);
  if (pageEntry === null) throw new Error("the calque must build a page entry for a non-empty page");
  const pageCore = {
    prev_entry_sha256: pageEntry.prev_entry_sha256, page: pageEntry.page, slot_lo: pageEntry.slot_lo,
    slot_hi: pageEntry.slot_hi, first_sig: pageEntry.first_sig, last_sig: pageEntry.last_sig,
    tx_count: pageEntry.tx_count, tail_sigs_at_slot_hi: [...pageEntry.tail_sigs_at_slot_hi], list_sha256: pageEntry.list_sha256,
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
    const httpGet = (url: string): Promise<HttpGetResult> => {
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
    await runUniverse(["--out", out, "--max-calls", "1000", "--page-size", "2", "--max-pages", "20", "--date", "2026-09-21"],
      fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, out, { httpGet, writeFile, call }));
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
  assert.equal(retryAfterMs("2", nowFixed()), 2000);
  assert.equal(retryAfterMs(null, nowFixed()), null);
  assert.equal(retryAfterMs("120000", nowFixed(), 30_000), 30_000, "capped");
  // 429 once (Retry-After 3s) then success: the injected sleep records 3000 ms (honored).
  const waited: number[] = [];
  const sleep = (ms: number): Promise<void> => { waited.push(ms); return Promise.resolve(); };
  let n = 0;
  const flaky = (): Promise<string> => { n += 1; if (n === 1) return Promise.reject(new HttpStatusError(429, 3000)); return Promise.resolve("ok"); };
  assert.equal(await withUniverseRetry(flaky, { sleep, now: nowFixed }), "ok");
  assert.deepEqual(waited, [3000], "Retry-After honored");
  // 403 => Fatal403Error (a BudgetExceededError subclass) with NO retry.
  const forbidden = (): Promise<never> => Promise.reject(new HttpStatusError(403, null));
  await assert.rejects(() => withUniverseRetry(forbidden, { sleep: noop, now: nowFixed }), (e) => {
    assert.ok(e instanceof Fatal403Error && e instanceof BudgetExceededError, "MUTANT: 403 retried instead of hard stop must redden");
    return true;
  });
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
    const fullPage: HttpGet = (url) => {
      const p = Number(new URL(url).searchParams.get("page") ?? "0");
      return Promise.resolve({ json: [{ id: `p${String(p)}a`, deployments: [] }, { id: `p${String(p)}b`, deployments: [] }] });
    };
    const deps = fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, out, { httpGet: fullPage });
    await assert.rejects(
      () => runUniverse(["--out", out, "--max-calls", "100", "--page-size", "2", "--max-pages", "3"], deps),
      /exhaustion NOT proven/, "MUTANT: accepting 'N pages' without an end anchor must redden");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 12. CA-11 durci: run the WHOLE composition from a FILE fixture through the real CLI entry --------
function fileDeps(env: Record<string, string>, out: string, extra: Partial<RunDeps> = {}): RunDeps {
  const map = rpcMap();
  const assets = issuerAssets();
  const httpGet = (url: string): Promise<HttpGetResult> => {
    const page = Number(new URL(url).searchParams.get("page") ?? "0");
    return Promise.resolve({ json: page === 0 ? assets : [] }); // one full page < pageSize=100 => end anchor
  };
  return {
    httpGet, call: concordantCall(map), sleep: noop, now: nowFixed, env,
    readFile: (p) => readFileSync(p, "utf8"), writeFile: (p, d) => { writeFileSync(p, d); },
    appendFile: (p, d) => { appendFileSync(p, d); },
    exists: (p) => existsSync(p), mkdirp: (p) => { mkdirSync(p, { recursive: true }); },
    ...extra,
  };
}
test("bell_universe_cli_composes_from_file_to_artifact", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-out-"));
  try {
    const argv = ["--out", out, "--max-calls", "1000", "--date", "2026-09-21", "--page-size", "100"];
    const logs: string[] = [];
    const r = await runUniverse(argv, fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, out, { log: (l) => { logs.push(l); } }));
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
  // (a) 404 past-end => run OK, past_end_probe=http_404, raw present, probe called ONCE (0 retry, maxRetries:0).
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-p404-"));
  try {
    let probeCalls = 0;
    const httpGet = (url: string): Promise<HttpGetResult> => {
      if (Number(new URL(url).searchParams.get("page") ?? "0") === 0) return Promise.resolve({ json: issuerAssets() });
      probeCalls += 1; return Promise.reject(new HttpStatusError(404, null));
    };
    const r = await runUniverse(argv(outA, "1000"), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outA, { httpGet }));
    assert.equal(r.ok, true, "MUTANT (probe catch removed): a 404 past-end must NOT stop the run");
    assert.equal(probeCalls, 1, "MUTANT (maxRetries:0 removed): the probe retries => probeCalls > 1 => red");
    assert.ok(existsSync(join(outA, "issuer-assets-2026-09-21.json")), "raw saved BEFORE the probe");
    assert.match(readFileSync(join(outA, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: http_404$/m, "404 recorded, run completed");
  } finally { rmSync(outA, { recursive: true, force: true }); }
  // (b) 403 at the probe => run OK, past_end_probe=http_403 (Fatal403Error, a BudgetExceededError SUBCLASS, is
  // swallowed at the probe), raw present.
  const outB = mkdtempSync(join(tmpdir(), "bell-univ-p403-"));
  try {
    const httpGet = (url: string): Promise<HttpGetResult> =>
      Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? Promise.resolve({ json: issuerAssets() }) : Promise.reject(new HttpStatusError(403, null));
    const r = await runUniverse(argv(outB, "1000"), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outB, { httpGet }));
    assert.equal(r.ok, true, "MUTANT (Fatal403Error not caught before the budget re-throw): a 403 past-end must NOT stop the run");
    assert.ok(existsSync(join(outB, "issuer-assets-2026-09-21.json")), "raw saved");
    assert.match(readFileSync(join(outB, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: http_403$/m, "403 recorded, run completed");
  } finally { rmSync(outB, { recursive: true, force: true }); }
  // (c) PURE budget cap at the probe => STOP. A page with NO Solana mint (0 confirms after the probe), --max-calls=1
  // (only the page GET fits): the probe's budget.tick() throws a PURE BudgetExceededError => the run REJECTS. MUTANT
  // (budget re-throw removed): the probe swallows it, the run reaches calibration and returns ok:false (no reject).
  const outC = mkdtempSync(join(tmpdir(), "bell-univ-pcap-"));
  try {
    const httpGet = (): Promise<HttpGetResult> =>
      Promise.resolve({ json: [{ id: "evm-only", deployments: [{ network: "Ethereum", address: "0x0" }] }] });
    await assert.rejects(() => runUniverse([...argv(outC, "1"), "--page-size", "100"], fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outC, { httpGet })),
      BudgetExceededError, "MUTANT (budget re-throw removed): a real budget cap at the probe must STOP => red");
    // C-R-1: the raw was saved BEFORE the probe, so it is PRESENT even after the budget STOP. MUTANT (raw save moved
    // AFTER the probe): the STOP happens before the raw is written => this reddens.
    assert.ok(existsSync(join(outC, "issuer-assets-2026-09-21.json")), "raw is present after the budget STOP (raw saved before the probe)");
  } finally { rmSync(outC, { recursive: true, force: true }); }
  // (d) C-R-1: a 3xx (RedirectBlockedError, a BudgetExceededError SUBCLASS) at the probe => run OK, redirect_blocked.
  const outD = mkdtempSync(join(tmpdir(), "bell-univ-predir-"));
  try {
    const httpGet = (url: string): Promise<HttpGetResult> =>
      Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? Promise.resolve({ json: issuerAssets() }) : Promise.reject(new RedirectBlockedError("3xx past-end"));
    const r = await runUniverse(argv(outD, "1000"), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outD, { httpGet }));
    assert.equal(r.ok, true, "MUTANT (RedirectBlockedError not caught before the budget re-throw): a 3xx past-end must NOT stop the run");
    assert.match(readFileSync(join(outD, "PROVENANCE-univers-solana.md"), "utf8"), /^- past_end_probe: redirect_blocked$/m, "3xx recorded as redirect_blocked, run completed");
  } finally { rmSync(outD, { recursive: true, force: true }); }
  // (e) C-R-1: a plain transport error at the probe => run OK, transport_error. MUTANT (transport_error turned into a
  // re-throw): the run stops instead of recording transport_error => reddens.
  const outE = mkdtempSync(join(tmpdir(), "bell-univ-ptrans-"));
  try {
    const httpGet = (url: string): Promise<HttpGetResult> =>
      Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? Promise.resolve({ json: issuerAssets() }) : Promise.reject(new Error("ECONNRESET"));
    const r = await runUniverse(argv(outE, "1000"), fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, outE, { httpGet }));
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
    const deps = fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, out, {
      httpGet: (url: string) => Promise.resolve({ json: Number(new URL(url).searchParams.get("page") ?? "0") === 0 ? assetsMinusFounder : [] }),
    });
    const r = await runUniverse(["--out", out, "--max-calls", "1000", "--date", "2026-09-21"], deps);
    assert.equal(r.ok, false);
    assert.deepEqual([...r.calibration.missing], ["NVDAx"]);
    assert.equal(existsSync(join(out, "universe-candidates-2026-09-21.json")), false, "NO artifact on calibration fail");
    assert.ok(existsSync(join(out, "issuer-assets-2026-09-21.json")), "raw saved BEFORE the oracle (the proof)");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 15. Preflight: two DISTINCT operators required BEFORE burning any issuer page -------------------
test("bell_universe_preflight_requires_two_distinct_operators", async () => {
  assert.doesNotThrow(() => { assertProvidersDistinctForQuorum(PROVIDERS); });
  // mainnet-beta is refused at the HOST allowlist stage (excluded, CONF-SRC-4/5) before any operator check.
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_PUBLIC_URL, "https://api.mainnet-beta.solana.com"]); }, /allowlist/);
  // two solana-foundation hosts collapse to ONE operator => no quorum-2.
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_PUBLIC_URL, SOLANA_PUBLIC_URL]); }, /operator/);
  assert.throws(() => { assertProvidersDistinctForQuorum([SOLANA_PUBLIC_URL, ""]); }, /two RPC providers/);
  // runUniverse with NO Chainstack env must STOP before any httpGet (spy not fired).
  const out = mkdtempSync(join(tmpdir(), "bell-univ-pre-"));
  try {
    let getFired = false;
    const deps = fileDeps({}, out, { httpGet: () => { getFired = true; return Promise.resolve({ json: [] }); } });
    await assert.rejects(() => runUniverse(["--out", out, "--max-calls", "100"], deps), /chainstack|operator|two RPC/);
    assert.equal(getFired, false, "no issuer page fetched when the quorum cannot be formed");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- CLI arg validation (fail-closed) ---------------------------------------------------------------
test("bell_universe_parse_args_fail_closed", () => {
  assert.throws(() => parseUniverseArgs(["--max-calls", "10"]), /--out is required/);
  assert.throws(() => parseUniverseArgs(["--out", "F:/x"]), /--max-calls is required/);
  assert.throws(() => parseUniverseArgs(["--out", "F:/x", "--max-calls", "0"]), /must be > 0/);
  const a = parseUniverseArgs(["--out", "F:/x", "--max-calls", "1800"]);
  assert.equal(a.minInterval, 286); assert.equal(a.pageSize, 100); assert.equal(a.maxCalls, 1800);
  // C-G2-5: an unknown/typo flag is fail-closed BEFORE any write or call (MUTANT: silently ignored => red).
  assert.throws(() => parseUniverseArgs(["--out", "F:/x", "--max-calls", "10", "--maxpages", "20"]), /unknown flag/);
  assert.throws(() => parseUniverseArgs(["--out", "F:/x", "--max-calls", "10", "--typo"]), /unknown flag/);
  // C-G2-5: --min-interval below the 286 ms floor (0 would DISABLE pacing) is refused (MUTANT: accepted => red).
  assert.throws(() => parseUniverseArgs(["--out", "F:/x", "--max-calls", "10", "--min-interval", "0"]), /floor/);
  assert.throws(() => parseUniverseArgs(["--out", "F:/x", "--max-calls", "10", "--min-interval", "100"]), /floor/);
  // The pre-registered race command parses cleanly (all flags known; 286 >= floor).
  const pre = parseUniverseArgs(["--out", "F:/x", "--max-calls", "2000", "--min-interval", "286", "--page-size", "100", "--max-pages", "20", "--max-429-streak", "5", "--date", "2026-09-21"]);
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

// ---- 18. C-G2-3: the LIVE fetchers never follow a 3xx redirect (hard stop; body never reaches the target) -
function portOf(srv: Server): number { const info = srv.address(); if (info === null || typeof info === "string") throw new Error("no tcp port"); return info.port; }
function listen(srv: Server): Promise<number> { return new Promise((res) => { srv.listen(0, "127.0.0.1", () => { res(portOf(srv)); }); }); }
test("bell_universe_live_fetch_does_not_follow_redirects", async () => {
  let targetHits = 0;
  // connection:close + drained close so undici keeps no loopback socket alive past --test-force-exit (libuv win crash).
  const target = createServer((_req, res) => { targetHits += 1; res.writeHead(200, { "content-type": "application/json", connection: "close" }); res.end("{}"); });
  await listen(target);
  const redirector = createServer((_req, res) => { res.writeHead(302, { location: `http://127.0.0.1:${String(portOf(target))}/target`, connection: "close" }); res.end("go"); });
  const redirPort = await listen(redirector);
  const redirUrl = `http://127.0.0.1:${String(redirPort)}/`;
  try {
    // MUTANT (a) manual removed => 200, no throw; (b) 3xx-check removed => HttpStatusError, not RedirectBlockedError.
    await assert.rejects(() => liveHttpGet(redirUrl), (e: unknown) => { assert.ok(e instanceof RedirectBlockedError && e instanceof BudgetExceededError, "3xx GET is a re-thrown hard stop"); return true; });
    await assert.rejects(() => liveRpcCall(redirUrl, "getAccountInfo", []), (e: unknown) => { assert.ok(e instanceof RedirectBlockedError && e instanceof BudgetExceededError, "3xx RPC POST is a re-thrown hard stop"); return true; });
    assert.equal(targetHits, 0, "the redirect target was NEVER requested (allowlist bypass via redirect blocked)");
  } finally {
    for (const s of [target, redirector]) { s.closeAllConnections(); await new Promise<void>((r) => { s.close(() => { r(); }); }); }
  }
});

// ---- 19. C-G2-4: assertHostAllowed requires https + parseable + real host + no userinfo (no url in msg) --
test("bell_universe_host_allowlist_requires_https_and_parseable_url", () => {
  // http downgrade (x3: key in clear), bare non-url (was ADMITTED via operatorOf fallback), unparseable, userinfo, non-https.
  for (const bad of [
    "http://api.xstocks.fi/x", "http://api.mainnet.solana.com", "http://solana-mainnet.core.chainstack.com/tk-node-key-placeholder",
    "chainstack", "not a url", "https://user:pw@api.xstocks.fi/x", "ftp://api.xstocks.fi/x",
  ]) assert.throws(() => { assertHostAllowed(bad); }, /refused before send/, `refused: ${bad}`);
  // C-10: no NEW message interpolates the url (it may be the paid Chainstack node url carrying a hex key).
  try { assertHostAllowed("http://solana-mainnet.core.chainstack.com/tk-node-key-placeholder"); assert.fail("must throw"); }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    assert.equal(msg.includes("chainstack.com"), false, "no host in the message (C-10)");
    assert.equal(msg.includes("tk-node-key-placeholder"), false, "no key-path in the message (C-10)");
  }
  // Regression (positives fully covered by test 6): the operator-admitted https Chainstack host still passes.
  assert.doesNotThrow(() => { assertHostAllowed(CHAINSTACK); });
});

// ---- 20. C-G2-5 / N-4: every live call is preceded by >= min-interval of pacing (injected clock) --------
test("bell_universe_paces_every_call_by_min_interval", async () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-pace-"));
  try {
    let clock = 0;
    const callTimes: number[] = [];
    const base = fileDeps({ CHAINSTACK_SOLANA_URL: CHAINSTACK }, out);
    const deps: RunDeps = {
      ...base,
      sleep: (ms: number) => { clock += ms; return Promise.resolve(); },
      now: () => clock,
      httpGet: (u: string) => { callTimes.push(clock); return base.httpGet(u); },
      call: (u: string, m: string, p: readonly unknown[]) => { callTimes.push(clock); return base.call(u, m, p); },
    };
    const r = await runUniverse(["--out", out, "--max-calls", "1000", "--date", "2026-09-21", "--min-interval", "286"], deps);
    assert.equal(r.ok, true);
    assert.ok(callTimes.length >= 1 + 7 * 2, "one page GET + 2 confirmations per Solana mint were made");
    // MUTANT N-4 (pacing removed): each call is preceded by >= 286 ms of virtual time; deltas would collapse to 0.
    assert.ok(callTimes.every((t, i) => (i === 0 ? t >= 286 : t - (callTimes[i - 1] ?? 0) >= 286)), "every live call is paced by >= min-interval (N-4)");
    assert.equal(clock, callTimes.length * 286, "total virtual pacing == calls * min-interval (no retries, no unpaced call)");
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 22. C-G2D-3 (C-8/C-9): the CLI NEVER egresses in CI, even if the https guard regressed ---------------
test("bell_universe_cli_no_network_egress_under_shim", () => {
  const cli = fileURLToPath(new URL("../src/universe-cli.ts", import.meta.url));
  const shim = fileURLToPath(new URL("./helpers/no-network.mjs", import.meta.url));
  // `--import <url>` is a node BINARY arg BEFORE the script (NOT execArgv, a fork() option spawnSync lacks). On
  // Windows the file:// form (pathToFileURL) is required. Node strips `--import <url>` from process.argv, so
  // argv[1] stays the CLI => the import.meta guard still fires (MEASURED [lu] F:\tmp\cp1-a1bis\, Node 24.15.0).
  const run = (chainstackUrl: string, out: string) => spawnSync(process.execPath,
    ["--import", pathToFileURL(shim).href, cli, "--out", out, "--max-calls", "10"],
    { env: { ...process.env, CHAINSTACK_SOLANA_URL: chainstackUrl }, encoding: "utf8" });

  // (a) placeholder `http` (non-https): STOP at PREFLIGHT (before any page/write) + the shim MARKER proves the
  // stub is on the path (non-vacuity). The http Chainstack url is refused at preflight, before egress matters.
  const outA = mkdtempSync(join(tmpdir(), "bell-univ-shimA-"));
  try {
    const r = run("http://solana-mainnet.core.chainstack.com/tk-node-key-placeholder", outA);
    assert.match(r.stderr, /\[no-network shim armed\]/, "MUTANT (--import removed): the shim marker is absent => red (the stub must be wired)");
    assert.match(r.stderr, /not https/, "the http preflight refusal STOPs the run (no network needed)");
    assert.notEqual(r.status, 0, "exit != 0 on the http preflight STOP");
    assert.equal(r.stderr.includes("tk-node-key-placeholder"), false, "stderr carries no key-path (C-10)");
    assert.equal(r.stderr.includes("core.chainstack.com"), false, "stderr carries no operator host (C-10)");
  } finally { rmSync(outA, { recursive: true, force: true }); }

  // (b) placeholder `https`: the CLI PASSES the preflight and reaches the issuer GET => the shim throw is on
  // stderr (`SHIM:`), exit != 0, ZERO connection => EXECUTED proof the egress is closed WITHOUT any real network
  // (the G2-delta deviation :114-115 becomes unnecessary by construction). MUTANT (https sub-case, shim off the
  // path): no `SHIM:` on stderr => red. (This sub-case retries ~4.3 s of REAL backoff — expected, not a hang.)
  const outB = mkdtempSync(join(tmpdir(), "bell-univ-shimB-"));
  try {
    const r = run("https://solana-mainnet.core.chainstack.com/tk-node-key-placeholder", outB);
    assert.match(r.stderr, /\[no-network shim armed\]/, "the shim is armed on the https sub-case too");
    assert.match(r.stderr, /SHIM:/, "MUTANT: the https sub-case reaches the GET and the shim throw (SHIM:) is surfaced => egress closed, proven without real network");
    assert.notEqual(r.status, 0, "exit != 0 (fail-closed) on the https sub-case");
    assert.equal(r.stderr.includes("tk-node-key-placeholder"), false, "stderr carries no key-path (C-10)");
    assert.equal(r.stderr.includes("core.chainstack.com"), false, "stderr carries no operator host (C-10)");
  } finally { rmSync(outB, { recursive: true, force: true }); }
});

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
