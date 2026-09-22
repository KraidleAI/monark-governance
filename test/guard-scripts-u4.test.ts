// GARDE-HELIUS-2b-iii - the u4 course scripts spend ONLY through @monark/rpc-guard (rebased on 2b-ii-b e00f965).
//
// This test is SEPARATE from the 2b-ii recorder grep (test/rpc-guard-fetch-only-inside-client.test.ts) to stay
// mergeable without conflict: its scope is scripts/census/u4-*.mjs; the two grep tests are unified at the G7 that
// merges both sub-lots (item formed, trigger: G7 of the second fusion). Everything runs OFFLINE: a preload freezes
// the clock and stubs globalThis.fetch with canned JSON-RPC (no network, fake .invalid endpoints, keys never read).
//
// It proves, on the ACTUAL migrated scripts:
//  1) grep - no fetch/node:http(s)/undici/child_process/paid-key read (any form, incl. the literal key NAME) in
//     scripts/census/u4-*.mjs, + a CLOSED import-source list for the three course files (a direct import of a paid
//     key/fetch module - e.g. apps/sentinel/src/rpc.ts, reachable only transitively - is forbidden), fail-closed;
//  2) byte-identity - the migrated oracle-path/redraw reproduce the e7f22b8 output; verified against COMMITTED
//     reference sha (no base blob, no git, no shallow-checkout SKIP) recomputed from base AND migrated (see REF);
//  3) spends only through the guard - every call is a write-ahead ledger line; the paid chainstack leg, forced into
//     the quorum with a FACTICE .invalid key, is metered in its own ledger (fetches-to-paid-host == chainstack lines);
//  4) --max-ru / --floor are WIRED to the guard (a tiny cap refuses run_credits / cycle_cap);
//  5) fail-closed guard args; a budget refusal is the canonical BudgetExceededError, NEVER retried;
//  6) the served N-operator unlock + lock recovery; the ledger-dir guard;
//  7) composition (Branchement rule) - real script -> ledger on disk -> served runCli reconcile (GO / NO-GO hard:total);
//  8) class identity - rpc2 re-exports the package error classes (the identity bridge is REMOVED post 2b-ii).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { runCli } from "@monark/rpc-guard";
import { selectIndices } from "../scripts/census/u4-redraw.mjs";
import { SEL, wordAddr } from "../apps/sentinel/src/ukemi/abi.ts";
import { POOL } from "../apps/sentinel/src/ukemi/clusters.ts";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));      // <root>/test/this -> <root>
// Computed (not hard-coded) from the CURRENT prereg so it cannot drift: the migrated scripts compare --prereg-sha to
// lfSha256(docs/PLAN-u4-prereg.md), so this value matches by construction.
const PREREG_SHA = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const CENSUS = join(ROOT, "scripts", "census");
const ACCT_HEX = "0x" + ["1000", "2000", "3000", "4000", "5000", "6000"].map((n) => BigInt(n).toString(16).padStart(64, "0")).join("");
const AGG_ADDR = "0x" + "1".repeat(40);
const NODE = process.execPath;
const CAPS = '{"eth_call":100000,"eth_getLogs":100000}';
// A FACTICE paid key on a .invalid host (never a real key): the guard resolves `chainstack` to this URL, so a fetch to
// PAID_HOST is a paid-leg fetch. An off-guard read of CHAINSTACK_ETH_URL (a mutant) fetches THIS host too, off-ledger.
const PAID_URL = "https://paid.example.invalid/FAKEKEY-u4t";
const PAID_HOST = "paid.example.invalid";

// COMMITTED REFERENCE OUTPUT sha (C-R-1). The base-blob replay is GONE (it broke at the 2b-ii merge - record.ts lost
// makeBudgetedCall/applyExcludeOperators - and a shallow-checkout SKIP masked a red G7 oracle). These are the sha256 of
// the migrated scripts' KEYLESS output on the stubbed fixture under the frozen clock, PROVEN byte-identical to the
// e7f22b8 base. Recompute (frozen clock, keyless, the same preload as below):
//   node --import <preload> scripts/census/u4-oracle-path.mjs --prereg-sha <lfSha256 of docs/PLAN-u4-prereg.md> \
//     --max-calls 9999 --raws-dir <D> --ledger-dir <OUT-OF-REPO> --cycle replay --floor 0 --max-ru 1000000 \
//     --method-caps '{"eth_call":100000,"eth_getLogs":100000}' ; sha256sum <D>/U4-oracle-path-e2.raw.json <D>/U4-oracle-inputs.jsonl
// Measured independently: worker G1 + validator checkpoint-2 from the BASE blob (76beb089 / 5f3dcf2c), and this pli
// from the MIGRATED script AND a `git archive e7f22b8` base recompute - all four agree (equality proven, not asserted).
const REF = {
  ORACLE_RAW: "76beb0891fd61e8534bec99ef36fbf5552c556242bf864d5e3cb91200209ce8a",    // U4-oracle-path-e2.raw.json (full, frozen clock)
  ORACLE_INPUTS: "5f3dcf2c8c48990ab493ef539642771e50c404d11865a44304a22b6507604dd8", // U4-oracle-inputs.jsonl
  REDRAW_REPORT: "ed2eaf595851e2c96b94ce6bd27182a975e4afa9eb77a2270a87e67b36ee3059", // U4-redraw report (--out)
};

// ---- the offline preload (frozen clock + canned fetch). U4T_FAIL_DRPC benches drpc (forces the paid leg into the ----
// ---- quorum); U4T_FETCH_COUNTER counts every fetch; U4T_FETCH_HOSTS logs the HOST of every fetch (paid-leg proof); ----
// ---- U4T_FLAKY_HOST/U4T_FLAKY_N make one host return N transient 503 (retry-policy proof). Same canned bodies => concord. ----
const PRELOAD_SRC = `
import { appendFileSync } from "node:fs";
const FIXED = 1700000000000; const RealDate = Date;
class FrozenDate extends RealDate { constructor(...a){ if(a.length===0) super(FIXED); else super(...a);} static now(){return FIXED;} }
globalThis.Date = FrozenDate;
const SEL_AGG="0x245a7bfc", SEL_ASSET="0xb3596f07", SEL_EMODE="0x6c6f6ae1", SEL_ACCT="0xbf92857c";
const ANSWER_UPDATED="0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f";
const word=(n)=>BigInt(n).toString(16).padStart(64,"0");
const hexAddr="${AGG_ADDR.slice(0,2)}"+"0".repeat(24)+"1".repeat(40);
const emodeHex="0x"+"00".repeat(160);
const acctHex="${ACCT_HEX}";
const UPDATES=[{block:23545100,price:200000000000n,round:1n,ts:1700000100n},{block:23546000,price:199000000000n,round:2n,ts:1700000200n},{block:23552200,price:201000000000n,round:3n,ts:1700000300n}];
const answerLogs=UPDATES.map((u)=>({blockNumber:"0x"+u.block.toString(16),logIndex:"0x0",transactionHash:"0x"+"0".repeat(64),topics:[ANSWER_UPDATED,"0x"+word(u.price),"0x"+word(u.round)],data:"0x"+word(u.ts)}));
const ok=(r)=>new Response(JSON.stringify({jsonrpc:"2.0",id:1,result:r}),{status:200,headers:{"content-type":"application/json"}});
const rpcErr=(c,m,d)=>new Response(JSON.stringify({jsonrpc:"2.0",id:1,error:{code:c,message:m,...(d!==undefined?{data:d}:{})}}),{status:200,headers:{"content-type":"application/json"}});
const COUNTER=process.env.U4T_FETCH_COUNTER, HOSTS=process.env.U4T_FETCH_HOSTS, FAIL_DRPC=process.env.U4T_FAIL_DRPC==="1";
const FLAKY=process.env.U4T_FLAKY_HOST||""; let flakyLeft=Number(process.env.U4T_FLAKY_N||"0");
globalThis.fetch=async(url,init)=>{
  if(COUNTER) appendFileSync(COUNTER,"1\\n");
  if(HOSTS){ let h; try{ h=new URL(String(url)).host; }catch{ h="badurl"; } appendFileSync(HOSTS,h+"\\n"); }
  if(FAIL_DRPC && String(url).includes("drpc")) return new Response("upstream 500",{status:500});
  if(FLAKY && String(url).includes(FLAKY) && flakyLeft>0){ flakyLeft--; return new Response("busy",{status:503}); }
  const body=JSON.parse(init.body); const {method,params}=body;
  if(method==="eth_call"){ const data=String(params[0].data); const sel=data.slice(0,10);
    if(sel===SEL_AGG) return ok(hexAddr);
    if(sel===SEL_ASSET) return ok("0x"+word(100000000));
    if(sel===SEL_EMODE){ const cat=BigInt("0x"+data.slice(-64)); if(cat===8n) return rpcErr(3,"execution reverted","0x"); return ok(emodeHex); }
    if(sel===SEL_ACCT) return ok(acctHex);
    return ok("0x"+word(0)); }
  if(method==="eth_getLogs"){ const t0=String((params[0].topics&&params[0].topics[0])||""); if(t0.toLowerCase()===ANSWER_UPDATED.toLowerCase()) return ok(answerLogs); return ok([]); }
  if(method==="eth_getBlockByNumber") return ok({hash:"0x"+"0".repeat(64),number:"0x1",timestamp:"0x1"});
  return ok(null);
};
`;

/** A fresh out-of-repo scratch dir (os tmp) + the preload written into it. Returns {dir, preloadUrl, ledgerDir}. */
function scratch(): { dir: string; preloadUrl: string; ledgerDir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "u4g-"));
  const preload = join(dir, "preload.mjs");
  writeFileSync(preload, PRELOAD_SRC);
  const ledgerDir = join(dir, "ledger");
  mkdirSync(ledgerDir);
  return { dir, preloadUrl: pathToFileURL(preload).href, ledgerDir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** Run a script (absolute path) under the preload; returns {status, stdout, stderr}. Never throws on non-zero exit. */
function runScript(scriptPath: string, args: string[], opts: { preloadUrl: string; env?: Record<string, string> }): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync(NODE, ["--import", opts.preloadUrl, scriptPath, ...args], { cwd: ROOT, env: { ...process.env, ...opts.env }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { status: 0, stdout, stderr: "" };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { status: typeof err.status === "number" ? err.status : 1, stdout: String(err.stdout ?? ""), stderr: String(err.stderr ?? "") };
  }
}

const sha256File = (p: string): string => createHash("sha256").update(readFileSync(p)).digest("hex");
const hostsOf = (log: string): string[] => (existsSync(log) ? readFileSync(log, "utf8").split("\n").filter((l) => l.trim() !== "") : []);

interface LedgerOp { attempted: number; ru: number; refused: Array<{ reason?: string }>; unlocked: number; }
/** Summarise every <op>.jsonl under <ledgerDir>/<cycle>/ + the leftover .lock files. */
function ledgerSummary(ledgerDir: string, cycle: string): { ops: Record<string, LedgerOp>; locks: string[] } {
  const cd = join(ledgerDir, cycle);
  const ops: Record<string, LedgerOp> = {};
  if (!existsSync(cd)) return { ops, locks: [] };
  for (const f of readdirSync(cd)) {
    if (!f.endsWith(".jsonl")) continue;
    const es = readFileSync(join(cd, f), "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as { outcome: string; credits_derived: number; reason?: string });
    const att = es.filter((e) => e.outcome === "attempted");
    ops[f.replace(".jsonl", "")] = { attempted: att.length, ru: att.reduce((a, e) => a + e.credits_derived, 0), refused: es.filter((e) => e.outcome === "refused"), unlocked: es.filter((e) => e.outcome === "unlocked").length };
  }
  return { ops, locks: readdirSync(cd).filter((f) => f.endsWith(".lock")) };
}

/** Count ledger lines (across every <op>.jsonl under <ledgerDir>/<cycle>/) with a given outcome. */
function ledgerOutcomeCount(ledgerDir: string, cycle: string, outcome: string): number {
  const s = ledgerSummary(ledgerDir, cycle).ops;
  let n = 0;
  for (const op of Object.values(s)) n += outcome === "attempted" ? op.attempted : outcome === "refused" ? op.refused.length : outcome === "unlocked" ? op.unlocked : 0;
  return n;
}

const prov = (rawPath: string): Record<string, unknown> => (JSON.parse(readFileSync(rawPath, "utf8")) as { provenance: Record<string, unknown> }).provenance;

/** Oracle-path arg builder (guard budget args + optional overrides). */
function oracleArgs(s: { dir: string; ledgerDir: string }, cycle: string, o: { maxCalls?: number; floor?: number; maxRu?: number; withChainstack?: boolean } = {}): string[] {
  return ["--prereg-sha", PREREG_SHA, "--max-calls", String(o.maxCalls ?? 9999), "--raws-dir", join(s.dir, "raws"),
    "--ledger-dir", s.ledgerDir, "--cycle", cycle, "--floor", String(o.floor ?? 0), "--max-ru", String(o.maxRu ?? 1000000),
    "--method-caps", CAPS, ...(o.withChainstack ? ["--with-chainstack"] : [])];
}

/** Build the redraw cache + synthetic D_e (mirrors byte-identity), returns {cache, de}. */
function redrawFixture(s: { dir: string }): { cache: string; de: string } {
  const book = JSON.parse(readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4", "U4-book-23545087.json"), "utf8")) as { book_digest: string; accounts: Array<{ address: string }> };
  const addresses = book.accounts.map((x) => x.address.toLowerCase());
  const acctIdx = selectIndices(book.book_digest, addresses.length, 3);
  const cache = join(s.dir, "cache.jsonl");
  writeFileSync(cache, acctIdx.map((i) => JSON.stringify({ kind: "ethCall", to: POOL, data: SEL.getUserAccountData + wordAddr(addresses[i]!), block: 23545087, result: ACCT_HEX })).join("\n") + "\n");
  const de = join(s.dir, "de.jsonl");
  writeFileSync(de, [
    JSON.stringify({ kind: "meta", aggregator_at_b0: AGG_ADDR }),
    JSON.stringify({ kind: "update", block: 23545100, price: "200000000000" }),
    JSON.stringify({ kind: "update", block: 23546000, price: "199000000000" }),
    JSON.stringify({ kind: "update", block: 23552200, price: "201000000000" }),
  ].join("\n") + "\n");
  return { cache, de };
}

/** Redraw arg builder. */
function redrawArgs(s: { dir: string; ledgerDir: string }, cycle: string, o: { out?: string; exclude?: string[]; withChainstack?: boolean } = {}): string[] {
  const { cache, de } = redrawFixture(s);
  return ["--cache", cache, "--de", de, "--block", "23545087", "--k", "3", "--max-calls", "60", "--prereg-sha", PREREG_SHA,
    "--ledger-dir", s.ledgerDir, "--cycle", cycle, "--floor", "0", "--max-ru", "1000000", "--method-caps", CAPS,
    ...(o.out ? ["--out", o.out] : []), ...(o.exclude ?? []).flatMap((x) => ["--exclude-operator", x]),
    ...(o.withChainstack ? ["--with-chainstack"] : [])];
}

// ============================================================================================================
// 1) GREP - scripts/census/u4-*.mjs spend only through the guard (fail-closed, closed import-source list).
// ============================================================================================================
test("guard_scripts_u4_grep_fetch_and_key_only_through_guard", () => {
  // Forbidden: a direct network round-trip, a raw http(s) client, a subprocess, or a paid-key read in ANY form -
  // including the literal key NAME anywhere (an alias `e_ = process.env; e_.CHAINSTACK_ETH_URL` escapes the env.* forms).
  const KEYNAME = "(CHAINSTACK_(?:ETH|SOLANA|BASE|BSC|ROBINHOOD)_URL|HELIUS_API_KEY|BELL_SOLANA_RPC|POLYGON_API_KEY|DATABENTO_API_KEY)";
  const PATTERNS: Array<[string, RegExp]> = [
    ["fetch(", /\bfetch\s*\(/],
    ["node:http(s)", /node:https?\b/],
    ["undici", /\bundici\b/],
    ["child_process", /child_process/],
    ["env.KEY (dot)", /\benv\s*\.\s*(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\b/],
    ["env[\"KEY\"] (bracket)", /\benv\s*\[\s*["'`](CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)["'`]\s*\]/],
    ["\"KEY\" in env", /["'`](CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)["'`]\s+in\s+[A-Za-z_$][\w$.]*/],
    ["{ KEY } = env (destructure)", /\{[^}]*\b(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\b[^}]*\}\s*=\s*[^;]*\benv\b/],
    ["literal key NAME (whole word, spares CHAINSTACK_LABEL)", new RegExp(`\\b${KEYNAME}\\b`)],
  ];
  // No allowlist: u4-probe.mjs is DELETED (its record.ts transport imports died at the 2b-ii merge and it is off the
  // course path - ruling C-9 alpha; cited only by U-4a provenance docs). A Map<path,trigger> stays the form if one returns.
  const ALLOWLIST = new Map<string, string>();

  const files = readdirSync(CENSUS).filter((f) => /^u4-.*\.mjs$/.test(f)).sort();
  // scope non-vacuity: the glob must have matched the migrated scripts + the reducers (a broken glob passes vacuously).
  assert.ok(files.length >= 5, `expected >= 5 scripts/census/u4-*.mjs, got ${files.length}: ${files.join(",")}`);
  for (const req of ["u4-oracle-path.mjs", "u4-redraw.mjs", "u4-guard.mjs"]) assert.ok(files.includes(req), `${req} must be in grep scope`);
  assert.ok(!files.includes("u4-probe.mjs"), "u4-probe.mjs must be DELETED (dead after the 2b-ii merge; C-R-4 c-bis)");

  const scan = (text: string): string[] => PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name);
  for (const f of files) {
    const hits = scan(readFileSync(join(CENSUS, f), "utf8"));
    if (ALLOWLIST.has(f)) continue; // allowlisted files are checked for NON-VACUITY below, not for cleanliness
    assert.deepEqual(hits, [], `${f} must be clean of paid-leak patterns, found: ${hits.join(", ")}`);
  }
  for (const [f] of ALLOWLIST) {
    assert.ok(existsSync(join(CENSUS, f)), `allowlisted ${f} must exist (else retract the entry)`);
    assert.ok(scan(readFileSync(join(CENSUS, f), "utf8")).length >= 1, `allowlist entry ${f} is VACANT: retract it`);
  }

  // CLOSED import-source list for the THREE course files (C-R-6): every `from "X"` must be in the allowed set. A DIRECT
  // import of a paid-key/fetch module (apps/sentinel/src/rpc.ts - reachable only TRANSITIVELY via rpc2.ts/abi.ts, the
  // residual-118 second paid leg) is forbidden. The `from "..."` capture is multi-line-safe (u4-guard's import spans lines).
  const ALLOWED_IMPORTS = new Set([
    "node:crypto", "node:fs", "node:path", "node:url", "@monark/rpc-guard",
    "../../apps/sentinel/src/ukemi/rpc2.ts", "../../apps/sentinel/src/ukemi/abi.ts",
    "../../apps/sentinel/src/ukemi/clusters.ts", "../../apps/sentinel/src/ukemi/resume.ts", "./u4-guard.mjs",
  ]);
  for (const f of ["u4-oracle-path.mjs", "u4-redraw.mjs", "u4-guard.mjs"]) {
    const specs = [...readFileSync(join(CENSUS, f), "utf8").matchAll(/\bfrom\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]!);
    assert.ok(specs.length >= 3, `${f}: import scan is vacuous (${specs.length}) - a broken regex`);
    for (const spec of specs) assert.ok(ALLOWED_IMPORTS.has(spec), `${f} imports '${spec}', NOT in the closed allowed set (a direct paid-key/fetch module import is forbidden; rpc.ts is reachable only transitively)`);
  }
});

// ============================================================================================================
// 2) BYTE-IDENTITY - the migrated scripts reproduce the e7f22b8 output, verified vs COMMITTED reference sha (C-R-1).
// ============================================================================================================
test("u4_oracle_path_replay_is_byte_identical_to_base", () => {
  const s = scratch();
  try {
    const raws = join(s.dir, "raws");
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "replay"), { preloadUrl: s.preloadUrl });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    // The D_e (full raw, frozen clock) and the resume cache are byte-identical to the base blob's output.
    assert.equal(sha256File(join(raws, "U4-oracle-path-e2.raw.json")), REF.ORACLE_RAW, "U4-oracle-path-e2.raw.json must match the committed base reference sha");
    assert.equal(sha256File(join(raws, "U4-oracle-inputs.jsonl")), REF.ORACLE_INPUTS, "U4-oracle-inputs.jsonl must match the committed base reference sha");
    // The concordant revert on e-mode category 8 stays ConcordantRevertError (keyless-derived): without class identity
    // it would flip to NoQuorumError - a change in the D_e bytes (already caught by the raw sha; named here for clarity).
    const raw = JSON.parse(readFileSync(join(raws, "U4-oracle-path-e2.raw.json"), "utf8")) as { emode_raw: Record<string, { error?: string }> };
    assert.equal(raw.emode_raw["8"]?.error, "ConcordantRevertError", "the concordant keyless revert must be recognised (class identity, no bridge needed post-2b-ii)");
  } finally { s.cleanup(); }
});

test("u4_redraw_replay_is_byte_identical_to_base", () => {
  const s = scratch();
  try {
    const out = join(s.dir, "redraw.json");
    const a = runScript(join(CENSUS, "u4-redraw.mjs"), redrawArgs(s, "redraw", { out }), { preloadUrl: s.preloadUrl });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    assert.equal(sha256File(out), REF.REDRAW_REPORT, "the redraw report must match the committed base reference sha");
    const rep = JSON.parse(readFileSync(out, "utf8")) as { all_match: boolean };
    assert.equal(rep.all_match, true, "the built cache + synthetic D_e must make the re-draw match");
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 3) SPENDS ONLY THROUGH THE GUARD - every call is a write-ahead ledger line; the paid leg is metered (host-proven).
// ============================================================================================================
test("u4_oracle_path_spends_only_through_guard", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log"), hostLog = join(s.dir, "hosts.log");
    // A FACTICE key is set but --with-chainstack is NOT passed: the guard never uses chainstack, so no paid-host fetch is
    // legitimate here. This makes the test independent of the ambient env (C-R-2b): an off-guard read of the key (V2)
    // fetches PAID_HOST and breaks BOTH invariants below, in a clean CI env.
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "spend"), { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog, U4T_FETCH_HOSTS: hostLog, CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const calls = (prov(join(s.dir, "raws", "U4-oracle-path-e2.raw.json")) as { calls: number }).calls;
    const attempted = ledgerOutcomeCount(s.ledgerDir, "spend", "attempted");
    const fetches = readFileSync(fetchLog, "utf8").split("\n").filter((l) => l.trim() !== "").length;
    assert.equal(attempted, calls, `attempted ledger lines (${attempted}) must equal calls (${calls})`);
    assert.equal(fetches, calls, `fetches (${fetches}) must equal calls (${calls}) - every round-trip is ledgered first`);
    assert.equal(hostsOf(hostLog).filter((h) => h === PAID_HOST).length, 0, "no paid-host fetch without --with-chainstack (an off-guard key read is caught here)");
    // --with-chainstack is the ONLY switch for the paid leg (never an env probe): no chainstack ledger appears here.
    assert.equal(ledgerSummary(s.ledgerDir, "spend").ops.chainstack, undefined, "no chainstack operator is requested without --with-chainstack (an env probe would create one)");
  } finally { s.cleanup(); }
});

test("u4_oracle_path_paid_leg_is_metered_in_its_own_ledger", () => {
  const s = scratch();
  try {
    const hostLog = join(s.dir, "hosts.log");
    // Force the paid leg into the quorum (bench drpc; oracle-path excludes mevblocker), with a FACTICE key on PAID_HOST.
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "paid", { withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", U4T_FETCH_HOSTS: hostLog, CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const sum = ledgerSummary(s.ledgerDir, "paid").ops;
    const hosts = hostsOf(hostLog);
    const paidFetches = hosts.filter((h) => h === PAID_HOST).length;
    const totalAttempted = Object.values(sum).reduce((a2, v) => a2 + v.attempted, 0);
    assert.ok((sum.chainstack?.attempted ?? 0) >= 1, "the paid leg must have >= 1 write-ahead attempted ledger line");
    // every fetch is ledgered, and every paid-host fetch is a chainstack ledger line (an off-guard paid fetch - V2/V3 -
    // would appear on PAID_HOST without a matching chainstack line): this is what makes "spends only through the guard" true.
    assert.equal(hosts.length, totalAttempted, `total fetches (${hosts.length}) must equal total attempted ledger lines (${totalAttempted})`);
    assert.equal(paidFetches, sum.chainstack?.attempted ?? -1, `paid-host fetches (${paidFetches}) must equal chainstack attempted lines (${sum.chainstack?.attempted}) - nothing paid off-ledger`);
    assert.ok(paidFetches > 0, "the paid leg must actually be exercised");
    // C-R-4(a): NAME the paid-leg e-mode issue at THIS base. Nominal (keyless) is ConcordantRevertError; with the paid
    // leg forced + R-A benching its "0x" revert, the two Pocket gateways collapse to ONE operator => NoQuorumError. It is
    // NEVER QuorumDisagreementError (the pre-2b-ii false-disagreement the merge's R-A closes). Flip if R-A's issue changes.
    const emode = (JSON.parse(readFileSync(join(s.dir, "raws", "U4-oracle-path-e2.raw.json"), "utf8")) as { emode_raw: Record<string, { error?: string }> }).emode_raw["8"]?.error;
    assert.equal(emode, "NoQuorumError", "paid-leg-forced e-mode 8 is NoQuorumError post-R-A (keyless-derived nominal stays ConcordantRevertError)");
    assert.notEqual(emode, "QuorumDisagreementError", "the pre-2b-ii false disagreement (C-4/'0x') must be gone (R-A)");
  } finally { s.cleanup(); }
});

test("u4_redraw_spends_only_through_guard", () => {
  const s = scratch();
  try {
    const hostLog = join(s.dir, "hosts.log");
    // Force the paid leg: bench drpc AND exclude mevblocker (redraw excludes nothing by default) so the keyless eth_call
    // quorum needs the paid chainstack leg. A FACTICE key on PAID_HOST; an off-guard read of it (V3) is caught below.
    const out = join(s.dir, "redraw.json");
    const a = runScript(join(CENSUS, "u4-redraw.mjs"), redrawArgs(s, "rspend", { out, exclude: ["mevblocker.io"], withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", U4T_FETCH_HOSTS: hostLog, CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const sum = ledgerSummary(s.ledgerDir, "rspend").ops;
    const hosts = hostsOf(hostLog);
    const paidFetches = hosts.filter((h) => h === PAID_HOST).length;
    const totalAttempted = Object.values(sum).reduce((a2, v) => a2 + v.attempted, 0);
    assert.equal(hosts.length, totalAttempted, `redraw: total fetches (${hosts.length}) must equal total attempted (${totalAttempted})`);
    assert.equal(paidFetches, sum.chainstack?.attempted ?? -1, `redraw: paid-host fetches (${paidFetches}) must equal chainstack attempted (${sum.chainstack?.attempted})`);
    assert.ok(paidFetches > 0, "redraw: the paid leg must actually be exercised (drpc benched + mevblocker excluded)");
    assert.equal((JSON.parse(readFileSync(out, "utf8")) as { all_match: boolean }).all_match, true, "the re-draw must still match under the forced paid leg");
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 4) --max-ru / --floor are WIRED to the guard (C-R-3): a tiny cap refuses run_credits / cycle_cap.
// ============================================================================================================
test("u4_oracle_path_max_ru_is_the_paid_run_cap", () => {
  const s = scratch();
  try {
    // --max-ru 3: the paid leg spends <= 3 RU then the guard refuses (run_credits), exit 2 (BUDGET STOP). A --max-ru
    // pinned to a constant (V13) would never refuse for run_credits.
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "maxru", { maxRu: 3, withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 2, `--max-ru 3 must BUDGET STOP (exit 2); stderr=${a.stderr}`);
    const cs = ledgerSummary(s.ledgerDir, "maxru").ops.chainstack;
    assert.ok(cs !== undefined && cs.ru <= 3, `chainstack RU (${cs?.ru}) must be <= --max-ru 3 (the run cap is wired)`);
    assert.ok(cs.refused.some((r) => r.reason === "run_credits"), `a refused ledger line of reason run_credits; got ${JSON.stringify(cs.refused)}`);
  } finally { s.cleanup(); }
});

test("u4_oracle_path_floor_reaches_the_cycle_cap", () => {
  const s = scratch();
  try {
    // --floor 15,999,999 seeds the cycle's frozen prior just under the 16,000,000 cycle cap (decision 119); the first
    // paid RU trips cycle_cap => refused, exit 2, 0 paid fetch. A --floor pinned to 0 (V12) would never reach the cap.
    const hostLog = join(s.dir, "hosts.log");
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "floor", { floor: 15999999, withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", U4T_FETCH_HOSTS: hostLog, CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 2, `--floor near the cap must BUDGET STOP (exit 2); stderr=${a.stderr}`);
    const cs = ledgerSummary(s.ledgerDir, "floor").ops.chainstack;
    assert.ok(cs !== undefined && cs.refused.some((r) => r.reason === "cycle_cap"), `a refused ledger line of reason cycle_cap; got ${JSON.stringify(cs?.refused)}`);
    assert.equal(hostsOf(hostLog).filter((h) => h === PAID_HOST).length, 0, "the paid leg is refused BEFORE any paid fetch (write-ahead fail-closed)");
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 5) FAIL-CLOSED GUARD ARGS + BUDGET REFUSAL canonical, never retried.
// ============================================================================================================
test("u4_oracle_path_requires_all_guard_budget_args", () => {
  const s = scratch();
  try {
    const full = ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", s.ledgerDir, "--cycle", "req", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":10}'];
    assert.equal(runScript(join(CENSUS, "u4-oracle-path.mjs"), full, { preloadUrl: s.preloadUrl }).status, 0, "full arg set must run");
    for (const drop of ["--ledger-dir", "--cycle", "--floor", "--max-ru", "--method-caps", "--max-calls"]) {
      const i = full.indexOf(drop);
      const partial = [...full.slice(0, i), ...full.slice(i + 2)];
      assert.notEqual(runScript(join(CENSUS, "u4-oracle-path.mjs"), partial, { preloadUrl: s.preloadUrl }).status, 0, `missing ${drop} must fail closed (got exit 0)`);
    }
  } finally { s.cleanup(); }
});

test("u4_budget_refusal_is_canonical_and_not_retried", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log");
    // --max-calls 5: calls 1..5 succeed, the 6th is REFUSED write-ahead (no fetch, not retried).
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "stop", { maxCalls: 5 }), { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
    assert.equal(a.status, 2, "a budget stop exits 2 (BUDGET STOP), never a masked no-quorum");
    assert.match(a.stderr, /BUDGET STOP/, "the canonical budget stop message");
    assert.match(a.stderr, /run_calls/, "the BUDGET STOP message names the ledger reason (run_calls) - not just --max-calls");
    const refused = ledgerOutcomeCount(s.ledgerDir, "stop", "refused");
    assert.equal(refused, 1, `exactly ONE refused ledger line (a retried refusal would append several); got ${refused}`);
    const fetches = readFileSync(fetchLog, "utf8").split("\n").filter((l) => l.trim() !== "").length;
    assert.equal(fetches, 5, `the refused call does 0 fetch (write-ahead fail-closed); got ${fetches}`);
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 6) SERVED N-operator unlock + lock recovery + ledger-dir guard (CONSIGNE E-1/E-2, C-G-1 / C-R-5).
// ============================================================================================================
test("u4_oracle_path_unlocks_all_requested_operators", () => {
  const s = scratch();
  try {
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "unlock", { withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const sum = ledgerSummary(s.ledgerDir, "unlock");
    assert.equal(sum.locks.length, 0, `every lock released at course end; left: ${sum.locks.join(",")}`);
    const ops = Object.keys(sum.ops);
    assert.ok(ops.length >= 2, `expected >= 2 operators ledgered; got ${ops.join(",")}`);
    for (const op of ops) assert.equal(sum.ops[op]!.unlocked, 1, `operator ${op} must have exactly ONE served unlocked line (N unlock, keyless included)`);
  } finally { s.cleanup(); }
});

test("u4_lock_left_after_hard_kill_is_recoverable_by_served_unlock", () => {
  const s = scratch();
  try {
    const cd = join(s.ledgerDir, "kill");
    mkdirSync(cd, { recursive: true });
    // a lock LEFT by a hard kill (the finally never ran): a plain file, DETECTABLE (CONSIGNE E-1, NARABI-OPS-1d).
    writeFileSync(join(cd, "chainstack.lock"), JSON.stringify({ pid: 999999, iso: "left-by-kill" }));
    // (1) a new course is fail-closed on the held lock: it does NOT steal it, and starts no work.
    const blocked = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "kill", { withChainstack: true }), { preloadUrl: s.preloadUrl, env: { CHAINSTACK_ETH_URL: PAID_URL } });
    assert.notEqual(blocked.status, 0, "a held chainstack.lock blocks a new course (fail-closed, C-9)");
    assert.ok(existsSync(join(cd, "chainstack.lock")), "the held lock is left INTACT (never stolen)");
    // (2) recovery is the EXPLICIT served unlock (never a permanent block): it removes the lock + chains an unlocked line.
    const rc = runCli(["unlock", "--cycle", "kill", "--op", "chainstack", "--reason", "resume after hard kill"], { ledgerDir: s.ledgerDir, floor: 0, readSnapshot: () => { throw new Error("unused"); } });
    assert.equal(rc.exitCode, 0, "served unlock exits 0");
    assert.equal(existsSync(join(cd, "chainstack.lock")), false, "the lock is recovered (removed) by the served unlock");
  } finally { s.cleanup(); }
});

test("u4_ledger_dir_must_be_outside_repo_and_preexist", () => {
  const s = scratch();
  const strayInRepo = join(ROOT, "node_modules", "u4g-ledger-inrepo");
  try {
    // (a) a --ledger-dir UNDER the repo root (an EXISTING dir, so only the under-repo guard can reject it) is refused.
    const inRepo = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", join(ROOT, "node_modules"), "--cycle", "u4g-inrepo", "--floor", "0", "--max-ru", "1000000", "--method-caps", CAPS], { preloadUrl: s.preloadUrl });
    assert.notEqual(inRepo.status, 0, "a --ledger-dir under the repo root must be refused (CA-11 / E-2)");
    // (b) a --ledger-dir that does NOT pre-exist is refused (C-8: never mkdir a phantom parent).
    const missing = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", join(s.dir, "does-not-exist"), "--cycle", "miss", "--floor", "0", "--max-ru", "1000000", "--method-caps", CAPS], { preloadUrl: s.preloadUrl });
    assert.notEqual(missing.status, 0, "a --ledger-dir that does not pre-exist must be refused (C-8)");
    // and the refusal is the C-8 pre-exist GUARD (assertLedgerDir), not a downstream ENOENT: dropping that guard would
    // still fail (ensureCycleDir's non-recursive mkdir), so assert the SPECIFIC reason so the guard has a killer mutant.
    assert.match(missing.stderr, /does not pre-exist/, "the missing-parent refusal is the C-8 pre-exist guard (not a downstream mkdir ENOENT)");
  } finally {
    rmSync(join(ROOT, "node_modules", "u4g-inrepo"), { recursive: true, force: true }); // a mutant that allows in-repo would create this
    rmSync(strayInRepo, { recursive: true, force: true });
    s.cleanup();
  }
});

test("u4_redraw_does_not_retry_a_transient_fault", () => {
  const s = scratch();
  try {
    // redraw runs retries:0 (a bounded control): a transient 503 benches the operator after ONE attempt; the quorum is
    // met by the others. With retries>0 (V11) the SAME host is re-fetched, so drpc would exceed 1 fetch on the first read.
    const hostLog = join(s.dir, "hosts.log");
    const a = runScript(join(CENSUS, "u4-redraw.mjs"), redrawArgs(s, "retry", {}), { preloadUrl: s.preloadUrl, env: { U4T_FETCH_HOSTS: hostLog, U4T_FLAKY_HOST: "drpc", U4T_FLAKY_N: "3" } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const drpc = hostsOf(hostLog).filter((h) => h.includes("drpc")).length;
    assert.ok(drpc <= 1, `redraw (retries:0) must NOT retry a transient fault: drpc fetched ${drpc} times (a retrying redraw re-hits it)`);
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 7) COMPOSITION (Branchement rule, CA-11 durci) - real script -> ledger on disk -> served runCli reconcile.
// ============================================================================================================
test("u4_oracle_path_ledger_reconciles_through_served_runcli", () => {
  const s = scratch();
  try {
    // the REAL script writes a chainstack ledger; the SERVED consumer runCli reconcile reads it: delta == ledger RU => GO,
    // delta == ledger RU + 1 => NO-GO hard:total (the C-9 mechanic). This is the non-LLM e2e that makes "branche" true.
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "compose", { withChainstack: true }), { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", CHAINSTACK_ETH_URL: PAID_URL } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const ru = ledgerSummary(s.ledgerDir, "compose").ops.chainstack?.ru ?? 0;
    assert.ok(ru > 0, "the paid leg must have metered RU to reconcile");
    const snap = (name: string, total: number): string => { const p = join(s.dir, name); writeFileSync(p, JSON.stringify({ cycle: "compose", total_ru: total })); return p; };
    const deps = { ledgerDir: s.ledgerDir, floor: 0, readSnapshot: (p: string) => JSON.parse(readFileSync(p, "utf8")) as { cycle: string; total_ru: number } };
    const go = runCli(["reconcile", "--cycle", "compose", "--op", "chainstack", "--mode", "aggregate-calibration", "--before", snap("b.json", 1000), "--after", snap("a.json", 1000 + ru)], deps);
    assert.equal(go.verdict, "GO", `delta == ledger RU => GO; got ${JSON.stringify(go)}`);
    assert.equal(go.exitCode, 0, "GO exits 0 (consumed as the course exit code)");
    // NO-GO on a FRESH ledger copy: runReconcile appends a `reconciled` line that resets the window, so re-run on a copy.
    const L2 = join(s.dir, "ledger-nogo");
    mkdirSync(join(L2, "compose"), { recursive: true });
    for (const f of readdirSync(join(s.ledgerDir, "compose"))) if (!f.endsWith(".lock")) writeFileSync(join(L2, "compose", f), readFileSync(join(s.ledgerDir, "compose", f)));
    const nogo = runCli(["reconcile", "--cycle", "compose", "--op", "chainstack", "--mode", "aggregate-calibration", "--before", snap("b2.json", 1000), "--after", snap("a2.json", 1000 + ru + 1)], { ...deps, ledgerDir: L2 });
    assert.equal(nogo.verdict, "NO-GO", "delta == ledger RU + 1 => NO-GO (spend above the guard)");
    assert.equal(nogo.reason, "hard:total", `NO-GO reason hard:total; got ${nogo.reason}`);
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 8) CLASS IDENTITY - rpc2 re-exports the package error classes; the identity bridge is REMOVED (item 5 / C-G-3).
// ============================================================================================================
test("u4_guard_error_classes_are_the_package_classes", async () => {
  const pkg = await import("@monark/rpc-guard");
  const rpc2 = await import(pathToFileURL(join(ROOT, "apps", "sentinel", "src", "ukemi", "rpc2.ts")).href) as { RpcError: unknown; BudgetExceededError: unknown };
  // STRICT identity (a re-export, not a subclass): the pool guards test `instanceof` the SAME class the guarded client
  // raises. A subclass/wrapper would leave `!(e instanceof PoolClass)` true and silently corrupt the D_e (measured 2b-iii).
  assert.equal(rpc2.RpcError, pkg.RpcError, "rpc2.RpcError must BE @monark/rpc-guard RpcError (strict identity)");
  assert.equal(rpc2.BudgetExceededError, pkg.BudgetExceededError, "rpc2.BudgetExceededError must BE the package BudgetExceededError");
  // and u4-guard.mjs no longer imports the pool error classes (the bridge is gone: item-formed trigger "2b-ii merge" fired).
  assert.equal(readFileSync(join(CENSUS, "u4-guard.mjs"), "utf8").includes('} from "../../apps/sentinel/src/ukemi/rpc2.ts"'), false, "u4-guard.mjs must NOT import rpc2.ts error classes (identity bridge removed)");
});
