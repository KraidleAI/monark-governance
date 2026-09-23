// UKEMI-REVERT-1 (incident REVERT-PAID-1, 2026-09-23; ADR-GARDE-HELIUS amendment R-A-bis + ADR-U4b note): under quorum-2 a
// PAID bare revert is HELD (never benched, never cooled down) and admitted ONLY against a KEYLESS bare witness (both keyed
// on the class "revert:bare" - messages are never compared across units); a keyless revert carrying data makes the pair a
// disagreement; anything else is not admitted (NoQuorumError); two paid bare reverts never concord (D6).
//
// Every COMPOSITION oracle drives the REAL runRecorder (the served path of `node apps/sentinel/src/ukemi/record.ts`) over
// the REAL openGuardedClient with ONLY globalThis.fetch stubbed (no fake client/transport, D-3), in the wire forms MEASURED
// by the G1 probe of 2026-09-23 (A-8): description() of the GHO oracle source at block 23414968 answered
// {code: 3, message: "execution reverted"} with NO data key on BOTH drpc.org and chainstack; drpc's free-plan HTTP 408 body
// is the one of the incident diag. The fixture (weth-book.fixture.json @23545087) has no GHO reserve: ONE fixture oracle
// source (USDC's) is made to revert in the measured form; the EXPECTED book is recomputed by an independent path
// (recordBook over the fixture bytes with that description emptied, the pattern of ukemi.test.ts
// ukemi_description_concordant_revert_tolerated_through_pool) AND pinned. Pool-level oracles use the same guard
// composition (openGuardedClient -> call shim -> makeUkemiPool); the two-paid case is SYNTHETIC (no second paid ETH
// operator exists in resolveOperators) and says so. Fake key + .invalid host only; no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRecorder, type RecorderDeps } from "../src/ukemi/record.ts";
import { recordBook } from "../src/ukemi/book.ts";
import { makeUkemiPool, NoQuorumError, ConcordantRevertError, RpcError, type UkemiReader, type LogEntry } from "../src/ukemi/rpc2.ts";
import { QuorumDisagreementError, type RpcCall } from "../src/rpc.ts";
import { SEL } from "../src/ukemi/abi.ts";
import { CLUSTER_WETH } from "../src/ukemi/clusters.ts";
import { openGuardedClient, type RunLimits, type OperatorLabel } from "@monark/rpc-guard";

const HERE = fileURLToPath(new URL(".", import.meta.url));
interface Fixture { block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: unknown[]; calls: Record<string, string>; }
const FX = JSON.parse(readFileSync(join(HERE, "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fixture;

const CS_HOST = "cs-node.example.invalid";
const CS_KEY = "FAKEKEY-UR1-8w8w8w8w";
const ENV = { CHAINSTACK_ETH_URL: `https://${CS_HOST}/${CS_KEY}` };
const METHOD_CAPS = "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000";
const FROM = FX.block - 3000; // ONE getLogs chunk (<= 9990); the expected book is recomputed with the SAME floor
const SOURCE = "0x3f73f03aa83b2a48ed27e964ed0fdb590332095b"; // the fixture's USDC oracle source (its description is a book field)
const DESC_KEY = `${SOURCE}|${SEL.description.toLowerCase()}`;
// Pinned (recomputed 2026-09-23 by recordBook over the fixture bytes, fromBlock = FROM): the book with SOURCE's description
// emptied, the same book with it intact (the revert MUST move the digest), and the holders digest (enumeration unchanged).
const PIN_EXPECTED_BOOK = "f1ebccdafc7e50107f163559ca555a344f5c358f74eddf771de5904da8982b92";
const PIN_INTACT_BOOK = "85a0f351c66eb215fb81d68d8ac56e447354d0f4181dd95e352c63c8698018a0";
const PIN_HOLDERS = "529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110";

// ---- wire forms (A-8: the JSON-RPC envelope as the source produces it) ----
const rpcErrResp = (code: number, message: string, data?: string): Response =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code, message, ...(data !== undefined ? { data } : {}) } }), { status: 200, headers: { "content-type": "application/json" } });
/** MEASURED (G1 probe 2026-09-23, drpc.org AND chainstack): code 3, "execution reverted", NO data key. */
const BARE_MEASURED = (): Response => rpcErrResp(3, "execution reverted");
/** The other hypothesis: the same bare revert with data "0x" (seen once on a keyless provider, GHO V-4, ukemi.test.ts). */
const BARE_0X = (): Response => rpcErrResp(3, "execution reverted", "0x");
/** A custom-error revert: message "execution reverted", data = a 4-byte selector (no reason text). */
const CUSTOM_DATA = "0xcafebabe";
const WITH_DATA = (): Response => rpcErrResp(3, "execution reverted", CUSTOM_DATA);
/** drpc's free-plan timeout, HTTP 408, body verbatim from the incident diag (U4-book-23414968.raw.json.diag.json). */
const DRPC_408_BODY = '{"id":1,"jsonrpc":"2.0","error":{"message":"Request timeout on the free plan, please upgrade to paid plan","code":30}}';
const DRPC_408 = (): Response => new Response(DRPC_408_BODY, { status: 408 });
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

type Req = { method: string; params: unknown[] };
const parseReq = (init?: RequestInit): Req => JSON.parse(typeof init?.body === "string" ? init.body : "{}") as Req;
const callKey = (req: Req): string | undefined => {
  const p = (req.params as ReadonlyArray<{ to?: string; data?: string } | undefined>)[0];
  return req.method === "eth_call" && p?.to !== undefined && p.data !== undefined ? `${p.to.toLowerCase()}|${p.data.toLowerCase()}` : undefined;
};
/** Serve the recorded fixture bytes (every provider concords). */
function fxServe(req: Req): Response {
  if (req.method === "eth_getBlockByNumber") return jrpc({ hash: FX.block_hash, number: "0x" + FX.block.toString(16), timestamp: "0x" + FX.block_ts.toString(16) });
  if (req.method === "eth_getLogs") return jrpc(FX.enumeration_logs);
  const v = FX.calls[callKey(req) ?? ""];
  return v === undefined ? rpcErrResp(-32000, "fixture miss") : jrpc(v);
}
type Host = "drpc" | "chainstack" | "mevblocker" | "tenderly" | "other";
const hostOf = (input: string | URL): Host => {
  const s = String(input);
  return s.includes("drpc") ? "drpc" : s.includes(CS_HOST) ? "chainstack" : s.includes("mevblocker") ? "mevblocker" : s.includes("tenderly") ? "tenderly" : "other";
};
/** A stub serving the fixture, except SOURCE's description(), answered per host by `desc` (and counted). */
function descStub(desc: (h: Host) => Response, hits: Record<string, number>): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return (input, init) => {
    const req = parseReq(init);
    if (callKey(req) === DESC_KEY) { const h = hostOf(input); hits[h] = (hits[h] ?? 0) + 1; return Promise.resolve(desc(h)); }
    return Promise.resolve(fxServe(req));
  };
}

async function withFetch(stub: (input: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
function scratch(prefix: string): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), prefix)); // OUTSIDE the repo; it is also the ledger root (must pre-exist)
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
/** Generic recorder use (not the U-4b pre-registered course) => --no-prereg-binding, like ukemi-guard-record.test.ts. */
function argv(dir: string, operators: string, extra: string[] = []): string[] {
  return ["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", "500000", "--method-caps", METHOD_CAPS,
    "--operators", operators, "--min-interval-ms", "0", "--backoff-ms", "0", "--no-prereg-binding",
    "--cluster", "weth", "--block", String(FX.block), "--from-block", String(FROM), ...extra];
}
const DEPS: RecorderDeps = { env: ENV, now: () => 1_700_000_000_000, sleep: () => Promise.resolve() };

interface ErrRec { provider: string; method: string; http?: number; code?: number; message: string; data?: unknown }
interface BookOut {
  provenance: { book_digest: string; holders_digest: string; errors_by_operator: Record<string, number>; rpc_errors: ErrRec[]; calls_by_operator: Record<string, number> };
  book: { reserves: Array<{ oracle_source: string; oracle_description: string }> };
}
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const concordanceOf = (p: string): Array<{ pair: string; concordant: number; discordant: number }> =>
  readFileSync(p, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as { pair: string; concordant: number; discordant: number });
const attempted = (ledgerFile: string): number => (existsSync(ledgerFile) ? readFileSync(ledgerFile, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).length : 0);
const noKeyIn = (text: string): boolean => !text.includes(CS_KEY) && !text.includes(CS_HOST);

/** The EXPECTED book when SOURCE's description() is a concordant revert: recordBook over the fixture bytes with that one
 *  description replaced by the ABI encoding of "" - an independent path (no quorum, no revert, no transport). */
function fixtureReader(calls: Record<string, string>): UkemiReader {
  return {
    ethCall(to, data) { const v = calls[`${to.toLowerCase()}|${data.toLowerCase()}`]; return v === undefined ? Promise.reject(new Error("fixture miss")) : Promise.resolve(v); },
    getLogsRange() { return Promise.resolve(FX.enumeration_logs as LogEntry[]); },
    blockAt() { return Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts }); },
    finalized() { return Promise.resolve({ block: FX.finalized_block, ts: FX.block_ts }); },
  };
}
async function expectedBook(): Promise<{ book_digest: string; holders_digest: string; intact: string }> {
  const emptied = await recordBook(CLUSTER_WETH, FX.block, fixtureReader({ ...FX.calls, [DESC_KEY]: "0x" + "0".repeat(128) }), "GENESIS", { fromBlock: FROM });
  const intact = await recordBook(CLUSTER_WETH, FX.block, fixtureReader(FX.calls), "GENESIS", { fromBlock: FROM });
  return { book_digest: emptied.book_digest, holders_digest: emptied.holders_digest, intact: intact.book_digest };
}
/** The book's served content for SOURCE is "" and every other reserve keeps its fixture description (closed list). */
function assertDescriptions(out: BookOut): void {
  assert.deepEqual(out.book.reserves.map((r) => [r.oracle_source, r.oracle_description]).sort(), [
    [SOURCE, ""], ["0x260326c220e469358846b187ee53328303efe19c", "Capped USDT/USD"], ["0x5424384b256154046e9667ddfaaa5e550145215e", "ETH / USD"],
  ].sort(), "SOURCE's description is recorded as \"\" (concordant revert); the two other reserves keep their fixture description");
}

// ============================================================================================================
// (a) COMPOSITION - the incident pool {drpc.org keyless, chainstack paid}, the MEASURED bare revert on both => the paid
// bare revert is held, paired with the keyless bare witness => ConcordantRevertError => book.ts records "" => the run
// COMPLETES; digests = expected; the tally counts +1 error per operator; the concordance records the pair CONCORDANT.
// Kills (mutants.mjs): "message compared across units" (pairing keeps the per-unit keys => disagreement), "R-A removed
// from isRpcRevert" (the paid revert enters on its preamble key => disagreement), "cooldown restored" (chainstack cooled
// after the revert => the next read has one live operator => NoQuorumError).
// ============================================================================================================
test("ukemi_revert_paid_bare_pairs_with_keyless_bare_witness_through_run_recorder", async () => {
  const { dir, cleanup } = scratch("ur1-a-");
  const out = join(dir, "book.json"), conc = join(dir, "conc.jsonl");
  const hits: Record<string, number> = {};
  try {
    const exp = await expectedBook();
    assert.equal(exp.book_digest, PIN_EXPECTED_BOOK, "expected book (independent path) == pin");
    assert.equal(exp.intact, PIN_INTACT_BOOK, "intact book (independent path) == pin");
    assert.notEqual(exp.book_digest, exp.intact, "oracle_description is a digest field: the concordant revert MUST move the digest");
    await withFetch(descStub(() => BARE_MEASURED(), hits), async () => {
      assert.equal(await runRecorder(argv(dir, "drpc.org,chainstack", ["--out", out, "--concordance-out", conc]), DEPS), 0, "the course COMPLETES (was: NoQuorumError, incident REVERT-PAID-1)");
    });
    assert.deepEqual(hits, { drpc: 1, chainstack: 1 }, "SOURCE's description() read ONCE per operator (n=1: getReserve caches per reserve)");
    const o = readJson<BookOut>(out);
    assert.equal(o.provenance.book_digest, exp.book_digest, "book_digest == the independent expected (description \"\")");
    assert.equal(o.provenance.book_digest, PIN_EXPECTED_BOOK, "book_digest == pin");
    assert.equal(o.provenance.holders_digest, PIN_HOLDERS, "holders_digest == pin (enumeration unchanged)");
    assertDescriptions(o);
    assert.deepEqual(o.provenance.errors_by_operator, { "drpc.org": 1, chainstack: 1 }, "tally: +1 error per operator (the two reverts), nothing else");
    assert.deepEqual(o.provenance.rpc_errors, [
      { provider: "drpc.org", method: "eth_call", message: "execution reverted", code: 3, data: "absent" },
      { provider: "chainstack", method: "eth_call", message: "execution reverted, revert", code: 3, data: "absent" },
    ], "journal: closed list - the keyless redacted text, the paid CLOSED hint, and the data FORM (absent) on each");
    const c = concordanceOf(conc);
    assert.deepEqual(c.map((l) => l.pair), ["chainstack|drpc.org"], "one operator pair");
    assert.equal(c[0]!.discordant, 0, "0 discordance (the paired bare revert is CONCORDANT)");
    assert.equal(c[0]!.concordant, (o.provenance.calls_by_operator.chainstack ?? 0) - 1, "every quorum read concorded (chainstack calls - the finalized read)");
    assert.equal(attempted(join(dir, "cyc", "chainstack.jsonl")), o.provenance.calls_by_operator.chainstack, "every paid attempt is a write-ahead ledger line");
    assert.ok(noKeyIn(readFileSync(out, "utf8") + readFileSync(conc, "utf8")), "0 key/host byte in the book or the concordance");
  } finally { cleanup(); }
});

// (a') the OTHER wire form (data "0x" on both) composes identically; the journal says "0x". Kills "\"0x\" indicator
// collapsed to absent".
test("ukemi_revert_paid_bare_0x_form_pairs_and_journals_0x", async () => {
  const { dir, cleanup } = scratch("ur1-a0x-");
  const out = join(dir, "book.json");
  const hits: Record<string, number> = {};
  try {
    await withFetch(descStub(() => BARE_0X(), hits), async () => {
      assert.equal(await runRecorder(argv(dir, "drpc.org,chainstack", ["--out", out]), DEPS), 0, "the \"0x\" form composes too");
    });
    assert.deepEqual(hits, { drpc: 1, chainstack: 1 });
    const o = readJson<BookOut>(out);
    assert.equal(o.provenance.book_digest, PIN_EXPECTED_BOOK, "same expected book as the measured (absent) form");
    assertDescriptions(o);
    assert.deepEqual(o.provenance.rpc_errors.map((e) => [e.provider, e.data]), [["drpc.org", "0x"], ["chainstack", "0x"]], "the data FORM \"0x\" is journaled as \"0x\", never collapsed to \"absent\"");
  } finally { cleanup(); }
});

// ============================================================================================================
// (b) paid bare vs keyless WITH data => DISAGREEMENT, fail-closed: the run throws QuorumDisagreementError, the book is NOT
// written, the concordance records the pair DISCORDANT, and the durable diag journals the data FORM (the hex length, 10)
// and never the bytes. Kills "data check dropped" (the keyless custom-error revert would pass as a bare witness =>
// concordant => the run completes) and "diag indicator leaks the body" (data = the hex => the length assertion and the
// no-bytes assertion red).
// ============================================================================================================
test("ukemi_revert_paid_bare_vs_keyless_with_data_disagrees_fail_closed", async () => {
  const { dir, cleanup } = scratch("ur1-b-");
  const out = join(dir, "book.json"), conc = join(dir, "conc.jsonl"), diag = out + ".diag.json";
  const hits: Record<string, number> = {};
  try {
    await withFetch(descStub((h) => (h === "drpc" ? WITH_DATA() : BARE_MEASURED()), hits), async () => {
      await assert.rejects(() => runRecorder(argv(dir, "drpc.org,chainstack", ["--out", out, "--concordance-out", conc]), DEPS), QuorumDisagreementError,
        "keyless revert WITH data vs paid bare revert => QuorumDisagreementError (fail-closed, the whole book abstains)");
    });
    assert.deepEqual(hits, { drpc: 1, chainstack: 1 });
    assert.equal(existsSync(out), false, "no book is written on a disagreement");
    const d = readJson<{ error: { name: string }; rpc_errors: ErrRec[]; errors_by_operator: Record<string, number> }>(diag);
    assert.equal(d.error.name, "QuorumDisagreementError");
    assert.deepEqual(d.rpc_errors, [
      { provider: "drpc.org", method: "eth_call", message: "execution reverted", code: 3, data: CUSTOM_DATA.length },
      { provider: "chainstack", method: "eth_call", message: "execution reverted, revert", code: 3, data: "absent" },
    ], "diag journal: the data FORM (hex length 10 / absent), closed list of keys");
    assert.ok(!readFileSync(diag, "utf8").toLowerCase().includes(CUSTOM_DATA.slice(2)), "the diag never carries the data BYTES");
    assert.deepEqual(d.errors_by_operator, { "drpc.org": 1, chainstack: 1 });
    const c = concordanceOf(conc).find((l) => l.pair === "chainstack|drpc.org");
    assert.ok(c !== undefined && c.discordant === 1, "the concordance records the pair DISCORDANT (observation kept before the throw)");
  } finally { cleanup(); }
});

// ============================================================================================================
// (c) two PAID bare reverts NEVER concord (D6). SYNTHETIC pool (declared): no second paid ETH operator exists in
// resolveOperators, so the canonical RpcError is built as the transport builds a paid one (preamble message, closed
// detail, a paid unit). With a keyless bare witness present, ONE held paid revert is admitted (the pair is witnessed).
// Kills "two paid concorded" (a paid bare revert admitted into the outcomes like a keyless one).
// ============================================================================================================
test("ukemi_revert_two_paid_bare_reverts_never_concord", async () => {
  const eps = ["https://paid-a.invalid", "https://paid-b.invalid", "https://keyless-c.invalid"];
  const paidBare = (op: string, unit: string): RpcError => new RpcError(op, `rpc-guard: RpcError for operator '${op}' (code 3): execution reverted, revert`, 3, "execution reverted, revert", unit);
  const twoPaid: RpcCall = (url) => Promise.reject(paidBare(url, url === eps[0] ? "ru" : "credits"));
  await assert.rejects(() => makeUkemiPool({ call: twoPaid, ethCallProviders: eps.slice(0, 2), getLogsProviders: eps.slice(0, 2) }).ethCall("0xa", "0xb", 1), NoQuorumError,
    "two distinct PAID bare reverts => never concorded => NoQuorumError");
  const witnessed: RpcCall = (url) => Promise.reject(url === eps[2] ? new RpcError("keyless-c.invalid", "execution reverted", 3, "execution reverted", "keyless") : paidBare(url, "ru"));
  await assert.rejects(() => makeUkemiPool({ call: witnessed, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xa", "0xb", 1), ConcordantRevertError,
    "with a keyless bare witness, one held paid bare revert is admitted => concordant");
  // A PAID revert WITH data is never a witness either (the witness must be KEYLESS): [paid-a with data, paid-b bare] =>
  // the held paid bare revert is not admitted => NoQuorumError (kills "paid revert with data accepted as a witness").
  const paidData: RpcCall = (url) => Promise.reject(url === eps[0]
    ? new RpcError(url, `rpc-guard: RpcError for operator '${url}' (code 3): execution reverted, revert`, 3, "execution reverted, revert", "ru", CUSTOM_DATA)
    : paidBare(url, "credits"));
  await assert.rejects(() => makeUkemiPool({ call: paidData, ethCallProviders: eps.slice(0, 2), getLogsProviders: eps.slice(0, 2) }).ethCall("0xa", "0xb", 1), NoQuorumError,
    "a paid revert WITH data + a held paid bare revert => no keyless witness => NoQuorumError");
});

// ============================================================================================================
// (d) keyless + keyless UNCHANGED: with two keyless operators ahead of chainstack, the keyless pair forms first (keyed on
// the normalized message, as before the lot) and chainstack is NEVER drawn; the book is the same expected book.
// ============================================================================================================
test("ukemi_revert_keyless_pair_unchanged_paid_never_drawn", async () => {
  const { dir, cleanup } = scratch("ur1-d-");
  const out = join(dir, "book.json"), conc = join(dir, "conc.jsonl");
  const hits: Record<string, number> = {};
  try {
    await withFetch(descStub((h) => (h === "mevblocker" ? BARE_0X() : BARE_MEASURED()), hits), async () => {
      assert.equal(await runRecorder(argv(dir, "drpc.org,mevblocker.io,chainstack", ["--out", out, "--concordance-out", conc]), DEPS), 0);
    });
    assert.deepEqual(hits, { drpc: 1, mevblocker: 1 }, "the keyless pair answers; chainstack is never asked");
    const o = readJson<BookOut>(out);
    assert.equal(o.provenance.book_digest, PIN_EXPECTED_BOOK, "same expected book (keyless concordant revert, V-4 mixed absent/\"0x\")");
    assertDescriptions(o);
    assert.equal(attempted(join(dir, "cyc", "chainstack.jsonl")), 0, "chainstack (appended last) is never drawn");
    assert.deepEqual(concordanceOf(conc).map((l) => [l.pair, l.discordant]), [["drpc.org|mevblocker.io", 0]], "only the keyless pair, 0 discordance");
  } finally { cleanup(); }
});

// ============================================================================================================
// (e) a paid revert WITH data (!= "0x") keeps the pre-lot behavior: (e1) same data on both => keyed on the data =>
// ConcordantRevertError => the course completes; (e2) paid WITH data vs keyless bare => keys differ => disagreement.
// ============================================================================================================
test("ukemi_revert_paid_revert_with_data_keeps_pre_lot_behavior", async () => {
  const { dir, cleanup } = scratch("ur1-e-");
  const out = join(dir, "book.json");
  const hits: Record<string, number> = {};
  try {
    await withFetch(descStub(() => WITH_DATA(), hits), async () => {
      assert.equal(await runRecorder(argv(dir, "drpc.org,chainstack", ["--out", out]), DEPS), 0, "(e1) same revert data on both => concordant (isRpcRevert, data key)");
    });
    const o = readJson<BookOut>(out);
    assert.equal(o.provenance.book_digest, PIN_EXPECTED_BOOK);
    assert.deepEqual(o.provenance.rpc_errors.map((e) => [e.provider, e.data]), [["drpc.org", CUSTOM_DATA.length], ["chainstack", CUSTOM_DATA.length]], "data FORM = hex length on both");
  } finally { cleanup(); }
  const { reader, done } = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(hostOf(input) === "drpc" ? BARE_MEASURED() : WITH_DATA()));
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), QuorumDisagreementError, "(e2) paid WITH data vs keyless bare => disagreement (pre-lot behavior)");
  } finally { done(); }
});

// ============================================================================================================
// (f) the INCIDENT replayed: the temps-2 composition of the course script record-t2.sh (operators drpc.org,tenderly.co,
// chainstack; --concurrency 8; --retries 6 --backoff-ms 1000 --backoff-cap-ms 30000; --heartbeat-every 500; --resume;
// --concordance-out) with drpc's MEASURED free-plan 408 (8 of them, each absorbed by one caller retry, as in the diag)
// and SOURCE's description() in the MEASURED bare form on BOTH operators => the course SURVIVES (exit 0; it died with
// NoQuorumError at 10:43:31Z). Declared differences: fixture block/floor (FROM) instead of 23414968/16496792, a fresh
// resume file, sleep injected (0 real wait, the waits are recorded). The revert is read TWICE (prefetch + recordBook's
// re-read: a revert is never cached), so the journal carries 2 reverts per operator, and no cache line for it.
// ============================================================================================================
test("ukemi_revert_incident_replay_course_survives", async () => {
  const { dir, cleanup } = scratch("ur1-f-");
  const out = join(dir, "book.json"), conc = join(dir, "conc.jsonl"), resume = join(dir, "U4-inputs.jsonl");
  const hits: Record<string, number> = {};
  const failedOnce = new Set<string>();
  const waits: number[] = [];
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    const req = parseReq(init);
    const k = callKey(req);
    if (k === DESC_KEY) { const h = hostOf(input); hits[h] = (hits[h] ?? 0) + 1; return Promise.resolve(BARE_MEASURED()); }
    // drpc's 408: the FIRST attempt of the first 8 distinct eth_call keys (the retry of the same key is served).
    if (k !== undefined && hostOf(input) === "drpc" && !failedOnce.has(k) && failedOnce.size < 8) { failedOnce.add(k); return Promise.resolve(DRPC_408()); }
    return Promise.resolve(fxServe(req));
  };
  const args = ["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", "500000", "--method-caps", METHOD_CAPS,
    "--operators", "drpc.org,tenderly.co,chainstack", "--min-interval-ms", "0", "--no-prereg-binding",
    "--retries", "6", "--backoff-ms", "1000", "--backoff-cap-ms", "30000", "--heartbeat-every", "500", "--concurrency", "8",
    "--cluster", "weth", "--block", String(FX.block), "--from-block", String(FROM),
    "--concordance-out", conc, "--resume", resume, "--out", out];
  try {
    await withFetch(stub, async () => {
      assert.equal(await runRecorder(args, { ...DEPS, sleep: (ms) => { waits.push(ms); return Promise.resolve(); } }), 0, "the temps-2 composition SURVIVES the paid bare revert");
    });
    assert.equal(failedOnce.size, 8, "8 drpc 408s were served (as in the incident diag)");
    assert.deepEqual(waits, [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], "each 408 absorbed by ONE in-place retry (retryWaitMs(0, 1000, 30000) = 1000)");
    assert.deepEqual(hits, { drpc: 2, chainstack: 2 }, "SOURCE's description() read twice per operator (prefetch + recordBook re-read; a revert is not cached)");
    const o = readJson<BookOut>(out);
    assert.equal(o.provenance.book_digest, PIN_EXPECTED_BOOK, "book_digest == the expected book (n=8 byte-identical to n=1 by construction)");
    assert.equal(o.provenance.holders_digest, PIN_HOLDERS);
    assertDescriptions(o);
    assert.deepEqual(o.provenance.errors_by_operator, { "drpc.org": 10, chainstack: 2 }, "tally: drpc 8 x 408 + 2 reverts; chainstack 2 reverts");
    const kinds = o.provenance.rpc_errors.map((e) => JSON.stringify(e)).sort();
    const expectKinds = [
      ...Array.from({ length: 8 }, () => JSON.stringify({ provider: "drpc.org", method: "eth_call", message: DRPC_408_BODY, http: 408 })),
      ...Array.from({ length: 2 }, () => JSON.stringify({ provider: "drpc.org", method: "eth_call", message: "execution reverted", code: 3, data: "absent" })),
      ...Array.from({ length: 2 }, () => JSON.stringify({ provider: "chainstack", method: "eth_call", message: "execution reverted, revert", code: 3, data: "absent" })),
    ].sort();
    assert.deepEqual(kinds, expectKinds, "journal = 8 x drpc 408 (redacted keyless body) + 2 x drpc bare revert + 2 x chainstack bare revert, data FORM only");
    for (const l of concordanceOf(conc)) assert.equal(l.discordant, 0, `pair ${l.pair}: 0 discordance`);
    assert.ok(concordanceOf(conc).some((l) => l.pair === "chainstack|drpc.org" && l.concordant > 0), "the eth_call pair chainstack|drpc.org concorded");
    const cacheText = readFileSync(resume, "utf8");
    const cachedDescTargets = cacheText.split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as { kind: string; to?: string; data?: string })
      .filter((l) => l.kind === "ethCall" && (l.data ?? "").toLowerCase() === SEL.description.toLowerCase()).map((l) => (l.to ?? "").toLowerCase()).sort();
    assert.deepEqual(cachedDescTargets, ["0x260326c220e469358846b187ee53328303efe19c", "0x5424384b256154046e9667ddfaaa5e550145215e"],
      "the cache holds the two SUCCESSFUL description() reads and none for SOURCE (a revert is never cached, as in the real U4-inputs cache)");
    assert.equal(attempted(join(dir, "cyc", "chainstack.jsonl")), o.provenance.calls_by_operator.chainstack, "every paid attempt is a write-ahead ledger line");
    for (const f of readdirSync(join(dir, "cyc"))) assert.ok(!f.endsWith(".lock"), `lock released by the finally: ${f}`);
    assert.ok(noKeyIn(readFileSync(out, "utf8") + readFileSync(conc, "utf8") + cacheText), "0 key/host byte in the book, the concordance or the cache");
  } finally { cleanup(); }
});

// ---- pool-level oracles THROUGH the guard (openGuardedClient -> call shim -> makeUkemiPool; only fetch stubbed) ----
const LIMITS: RunLimits = { maxCalls: 1000, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_call: 1000, eth_getLogs: 1000, eth_getBlockByNumber: 1000 }, cycleFloor: { chainstack: 0 } };
function poolThroughGuard(labels: string[], fetchStub: (input: string | URL, init?: RequestInit) => Promise<Response>): { reader: UkemiReader; done: () => void } {
  const { dir, cleanup } = scratch("ur1-pool-");
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchStub as typeof globalThis.fetch;
  const client = openGuardedClient(ENV, LIMITS, dir, Object.fromEntries(labels.map((l) => [l, "cyc"])));
  const call: RpcCall = (label, method, params) => client.call(label as OperatorLabel, method, params);
  const reader = makeUkemiPool({ call, ethCallProviders: labels, getLogsProviders: labels, minIntervalMs: 0 });
  return { reader, done: () => { globalThis.fetch = realFetch; cleanup(); } };
}
const value = (): Response => jrpc("0x" + "00".repeat(31) + "64");

// A keyless VALUE is never a witness: paid bare vs value => not admitted => NoQuorumError whose "last" names the held
// paid revert by its CLOSED hint (D6); the held operator is not cooled down (the next read concords on a value). Kills
// "pairing without a keyless revert witness" (the held paid revert admitted against the value => disagreement).
test("ukemi_revert_paid_bare_vs_keyless_value_is_no_quorum", async () => {
  let phase: "revert" | "value" = "revert";
  const { reader, done } = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(phase === "value" || hostOf(input) === "drpc" ? value() : BARE_MEASURED()));
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), (e: unknown) => e instanceof NoQuorumError
      && e.message === "eth_call: quorum needs 2 providers (last: rpc-guard: RpcError for operator 'chainstack' (code 3): execution reverted, revert)",
    "value vs paid bare => NoQuorumError naming the held paid revert (closed hint), never a disagreement");
    phase = "value";
    assert.equal(await reader.ethCall("0xabc", "0xdef", 100), "0x" + "00".repeat(31) + "64", "chainstack was not cooled down: the next read concords");
  } finally { done(); }
});

// A keyless revert whose ONLY difference is a reason TEXT admits nothing: the paid closed hint cannot show a reason (D6),
// so neither a concordance nor a discordance may be claimed (that would compare messages across units) => NoQuorumError.
// Kills "keyless reason accepted as bare" (=> concordant) and "reason treated like data" (=> disagreement).
test("ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum", async () => {
  const { reader, done } = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(hostOf(input) === "drpc" ? rpcErrResp(3, "execution reverted: Ownable: caller is not the owner") : BARE_MEASURED()));
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), NoQuorumError, "keyless reason text vs paid bare => NoQuorumError (no claim)");
  } finally { done(); }
});

// C-4 code guard: a paid {code -32602, "execution reverted"} is NOT a bare revert: it is a param fault, BENCHED (and
// cooled down) exactly as before the lot => no pairing with the keyless bare witness => NoQuorumError; the next read
// finds chainstack cooled => one live operator => NoQuorumError. Kills "code guard dropped" (=> held and paired =>
// ConcordantRevertError).
test("ukemi_revert_paid_non_revert_code_is_benched_not_held", async () => {
  let phase: "revert" | "value" = "revert";
  const { reader, done } = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(phase === "value" ? value() : hostOf(input) === "drpc" ? BARE_MEASURED() : rpcErrResp(-32602, "execution reverted")));
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), NoQuorumError, "a non-revert code is benched, never paired");
    phase = "value";
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), NoQuorumError, "the benched paid leg is cooled down (pre-lot behavior for a fault)");
  } finally { done(); }
});

// R-1 CHARACTERIZATION (declared residual, item REVERT-DATA-REJECTED-1 - NOT a verified property): a PAID revert whose `.data`
// was REJECTED by the transport's validateRevertData (here the hex of the fake key, c-bis) reaches the quorum with
// `.data === undefined`, indistinguishable from an ABSENT data, so it is classed bare and pairs with a keyless bare witness
// => ConcordantRevertError TODAY. Bounded: the witness must itself be bare, and a concordant revert is tolerated on
// description() only. The item's fix (mark the rejection at the source) is EXPECTED to flip the first assertion
// (pre-declared, like the e-mode 8 flip of guard-scripts-u4). Contrast: a VALID non-empty paid data makes the pair disagree.
test("ukemi_revert_r1_characterization_rejected_paid_data_pairs_as_bare", async () => {
  const keyHexData = "0x" + Buffer.from(CS_KEY, "utf8").toString("hex");
  const rejected = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(hostOf(input) === "drpc" ? BARE_MEASURED() : rpcErrResp(3, "execution reverted", keyHexData)));
  try {
    await assert.rejects(() => rejected.reader.ethCall("0xabc", "0xdef", 100), ConcordantRevertError, "R-1 today: a rejected paid data == absent => paired with the keyless bare witness");
  } finally { rejected.done(); }
  const valid = poolThroughGuard(["drpc.org", "chainstack"], (input) => Promise.resolve(hostOf(input) === "drpc" ? BARE_MEASURED() : rpcErrResp(3, "execution reverted", CUSTOM_DATA)));
  try {
    await assert.rejects(() => valid.reader.ethCall("0xabc", "0xdef", 100), QuorumDisagreementError, "contrast: a VALID paid data is kept => keyed on it => disagreement");
  } finally { valid.done(); }
});

// The HELD paid bare revert is never cooled down (advisor design, 3 operators so the keyless side has a cooled member):
// read 1 = drpc bare + mevblocker transport fault (cooled) + chainstack bare (held, paired) => ConcordantRevertError;
// read 2 = values => drpc + chainstack concord (mevblocker cooled). Kills "cooldown restored" (chainstack cooled too =>
// read 2 has drpc alone => NoQuorumError).
test("ukemi_revert_paid_bare_is_never_cooled_down", async () => {
  let phase: "revert" | "value" = "revert";
  const { reader, done } = poolThroughGuard(["drpc.org", "mevblocker.io", "chainstack"], (input) => {
    const h = hostOf(input);
    if (h === "mevblocker") return Promise.reject(new TypeError("network down"));
    return Promise.resolve(phase === "value" ? value() : BARE_MEASURED());
  });
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), ConcordantRevertError, "read 1: drpc bare + held chainstack bare => concordant (mevblocker benched)");
    phase = "value";
    assert.equal(await reader.ethCall("0xabc", "0xdef", 100), "0x" + "00".repeat(31) + "64", "read 2: chainstack is live (never cooled by its bare revert)");
  } finally { done(); }
});
