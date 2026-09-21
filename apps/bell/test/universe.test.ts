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
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ISSUER_HOST, SOLANA_PUBLIC_URL, SOLANA_PUBLIC_HOST, CANDIDATE_FIELDS, PRICE_LIKE_FIELD,
  hostOf, assertHostAllowed, assertMethodAllowed, guardedRpcCall, scrubSecret,
  retryAfterMs, withUniverseRetry, HttpStatusError, Fatal403Error,
  makeUniverseBudget, readPriorCalls, serializeLedger,
  accountIdentityKey, interpretAccount, confirmMintIdentity, assertProvidersDistinctForQuorum,
  enumerateUniverse, foundingCalibration, buildUniverseArtifact, buildCandidateRecord,
  assertOnlyAllowedFields, universeArtifactBytes, foldPage, solanaDeploymentAddress,
  RedirectBlockedError, type SolanaCandidate, type OnchainReadout,
} from "../src/universe.ts";
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
  // Ledger: absent => 0; malformed => throw; invalid => throw; round-trips through serializeLedger.
  const dir = mkdtempSync(join(tmpdir(), "bell-univ-ledger-"));
  try {
    const p = join(dir, "budget.json");
    assert.equal(readPriorCalls(p, existsSync, (x) => readFileSync(x, "utf8")), 0, "absent ledger => 0");
    writeFileSync(p, serializeLedger(42));
    assert.equal(readPriorCalls(p, existsSync, (x) => readFileSync(x, "utf8")), 42, "MUTANT M15: a valid ledger must be read, never re-chained from 0");
    writeFileSync(p, "{ not json");
    assert.throws(() => readPriorCalls(p, existsSync, (x) => readFileSync(x, "utf8")), /malformed/);
    writeFileSync(p, JSON.stringify({ calls: -1 }));
    assert.throws(() => readPriorCalls(p, existsSync, (x) => readFileSync(x, "utf8")), /invalid/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
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
    assert.equal(readPriorCalls(join(out, "budget.json"), existsSync, (p) => readFileSync(p, "utf8")), r.calls);
    assert.ok(r.calls >= 1 + 7 * 2, "one GET page + 2 confirmations per Solana mint counted in the budget");
    // C-G2-2: NO produced file (artifact, provenance, ledger, raw) and NO stdout line may carry the operator's
    // paid-host pattern NOR the REAL test placeholder — not a vacuous "deadbeef" that appears nowhere.
    const produced = [
      artifact,
      readFileSync(join(out, "PROVENANCE-univers-solana.md"), "utf8"),
      readFileSync(join(out, "issuer-assets-2026-09-21.json"), "utf8"),
      readFileSync(join(out, "budget.json"), "utf8"),
      ...logs,
    ];
    assert.ok(logs.length > 0, "the run logged at least one line (the scrub is exercised, not vacuous)");
    for (const s of produced) {
      assert.equal(s.includes("tk-node-key-placeholder"), false, "no Chainstack key-path placeholder in any output/stdout");
      assert.equal(s.includes("core.chainstack.com"), false, "no Chainstack operator host in any output/stdout");
    }
  } finally { rmSync(out, { recursive: true, force: true }); }
});

// ---- 13. Byte-exact replay: committed raw + rpc => the frozen artifact, byte for byte -----------------
test("bell_universe_artifact_byte_exact_replay", async () => {
  const map = rpcMap();
  const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(issuerAssets(), (m) => confirmMintIdentity(m, PROVIDERS, concordantCall(map)));
  const bytes = universeArtifactBytes(buildUniverseArtifact(candidates, { totalAssets, solanaAssets }));
  const expected = readFileSync(join(FIX, "expected-universe-candidates.json"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(bytes, expected, "artifact is byte-identical to the frozen expected fixture (timestamp-free body)");
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
  // The write path passes `providers` (providers[1] is the paid Chainstack url) to provenanceMd.
  const prov = provenanceMd("2026-09-21", [SOLANA_PUBLIC_URL, CHAINSTACK], "rawsha", "artsha", 8, 7, 5);
  // MUTANT N-2 (provenanceMd interpolates providers[1]): the host + key-path placeholder would appear here.
  assert.equal(prov.includes("tk-node-key-placeholder"), false, "no Chainstack key-path in provenance");
  assert.equal(prov.includes("core.chainstack.com"), false, "no Chainstack operator host in provenance");
  assert.ok(prov.includes("chainstack (node url held"), "operator named by domain/word only, url held in the env");
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

// ---- 22. C-G2-2 + C-G2-4: a non-https CHAINSTACK_SOLANA_URL STOPs at preflight; stderr carries NO secret ---
test("bell_universe_cli_stops_on_non_https_chainstack_and_scrubs_stderr", () => {
  const out = mkdtempSync(join(tmpdir(), "bell-univ-stderr-"));
  try {
    const cli = fileURLToPath(new URL("../src/universe-cli.ts", import.meta.url));
    // Override CHAINSTACK_SOLANA_URL with an http (non-https) operator url; the real secret env is thus never used.
    const r = spawnSync(process.execPath, [cli, "--out", out, "--max-calls", "10"],
      { env: { ...process.env, CHAINSTACK_SOLANA_URL: "http://solana-mainnet.core.chainstack.com/tk-node-key-placeholder" }, encoding: "utf8" });
    // C-G2-4 emergent STOP: http Chainstack refused at PREFLIGHT, before any page/write, zero network. Exit != 0.
    assert.notEqual(r.status, 0, "a non-https CHAINSTACK_SOLANA_URL STOPs the run");
    assert.match(r.stderr, /not https/, "the preflight refusal reason is surfaced on stderr");
    // C-G2-2: stderr (the 6th produced surface) carries NO secret — the top-level .catch scrub belt holds.
    assert.equal(r.stderr.includes("tk-node-key-placeholder"), false, "stderr carries no key-path (C-10)");
    assert.equal(r.stderr.includes("core.chainstack.com"), false, "stderr carries no operator host (C-10)");
  } finally { rmSync(out, { recursive: true, force: true }); }
});
