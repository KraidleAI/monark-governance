// GARDE-HELIUS-2b-iii - the u4 course scripts spend ONLY through @monark/rpc-guard.
//
// This test is SEPARATE from the 2b-ii recorder grep (test/rpc-guard-fetch-only-inside-client.test.ts) to stay
// mergeable without conflict: its scope is scripts/census/u4-*.mjs; the two grep tests are unified at the G7 that
// merges both sub-lots (item formed, trigger: 2b-ii + 2b-iii both merged). Everything runs OFFLINE: a preload freezes
// the clock and stubs globalThis.fetch with canned JSON-RPC (no network, fake .invalid endpoints, keys never read).
//
// It proves, on the ACTUAL migrated scripts:
//  1) grep - no fetch/node:http(s)/undici/child_process/paid-key read in scripts/census/u4-*.mjs except the
//     allowlisted archival probe (non-vacuity PER allowlist entry + scope), fail-closed;
//  2) byte-identity - the migrated oracle-path/redraw reproduce the e7f22b8 output byte-for-byte on a stubbed fixture
//     (the migration is a plumbing swap; the RpcError identity bridge keeps a concordant revert = ConcordantRevertError);
//  3) spends only through the guard - every call is a write-ahead ledger line (attempted lines == calls); the paid
//     chainstack leg, when forced into the quorum, is metered in its own ledger;
//  4) fail-closed guard args - the six required budget args each fail-close when absent;
//  5) a budget refusal is the canonical BudgetExceededError and is NEVER retried (exactly one refused ledger line).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { selectIndices } from "../scripts/census/u4-redraw.mjs";
import { SEL, wordAddr } from "../apps/sentinel/src/ukemi/abi.ts";
import { POOL } from "../apps/sentinel/src/ukemi/clusters.ts";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));      // <root>/test/this -> <root>
const BASE = "e7f22b8";                                            // the pre-migration base of this lot (u4 scripts unmigrated)
// Computed (not hard-coded) from the CURRENT prereg so it cannot drift: both the base blob and the migrated script
// compare --prereg-sha to lfSha256(docs/PLAN-u4-prereg.md), so this value matches by construction.
const PREREG_SHA = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const CENSUS = join(ROOT, "scripts", "census");
const ACCT_HEX = "0x" + ["1000", "2000", "3000", "4000", "5000", "6000"].map((n) => BigInt(n).toString(16).padStart(64, "0")).join("");
const AGG_ADDR = "0x" + "1".repeat(40);
const NODE = process.execPath;

// ---- the offline preload (frozen clock + canned fetch). U4T_FAIL_DRPC forces the paid leg into the quorum; ----
// ---- U4T_FETCH_COUNTER counts every fetch (write-ahead proof). Same canned bodies for every provider => concord. ----
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
const COUNTER=process.env.U4T_FETCH_COUNTER, FAIL_DRPC=process.env.U4T_FAIL_DRPC==="1";
globalThis.fetch=async(url,init)=>{
  if(COUNTER) appendFileSync(COUNTER,"1\\n");
  if(FAIL_DRPC && String(url).includes("drpc")) return new Response("upstream 500",{status:500});
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
function runScript(scriptPath: string, args: string[], opts: { preloadUrl: string; env?: Record<string, string> } ): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync(NODE, ["--import", opts.preloadUrl, scriptPath, ...args], { cwd: ROOT, env: { ...process.env, ...opts.env }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { status: 0, stdout, stderr: "" };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { status: typeof err.status === "number" ? err.status : 1, stdout: String(err.stdout ?? ""), stderr: String(err.stderr ?? "") };
  }
}

/** Materialise the e7f22b8 version of a census script as a TRANSIENT file UNDER node_modules/ (a SKIP_DIRS for
 *  lang-gate AND the export walk - a repo-tree tool must never race this transient's create/delete, TOCTOU ENOENT).
 *  Placed at DEPTH 2 (node_modules/.u4-before/<tag>.mjs) so `import.meta.url`-derived ROOT and its `../../apps/...`
 *  imports resolve IDENTICALLY to scripts/census/ (both are two dirs deep from the repo root). node_modules is
 *  gitignored (out of R-25/invariant) and outside the grep scope. Returns the path, or NULL if the base blob is
 *  unreachable (a SHALLOW checkout - the CI test job is depth-1; the caller then SKIPS, byte-identity being verified
 *  in full-history contexts: locally and the orchestrator's oracle). */
function extractBefore(scriptRel: string, tag: string): string | null {
  let blob: string;
  try { blob = execFileSync("git", ["-C", ROOT, "show", `${BASE}:${scriptRel}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
  catch { return null; }
  const dir = join(ROOT, "node_modules", ".u4-before");
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${tag}.mjs`);
  writeFileSync(p, blob);
  return p;
}

/** Count ledger lines (across every <op>.jsonl under <ledgerDir>/<cycle>/) with a given outcome. */
function ledgerOutcomeCount(ledgerDir: string, cycle: string, outcome: string): number {
  const cd = join(ledgerDir, cycle);
  if (!existsSync(cd)) return 0;
  let n = 0;
  for (const f of readdirSync(cd)) {
    if (!f.endsWith(".jsonl")) continue;
    for (const line of readFileSync(join(cd, f), "utf8").split(/\r?\n/)) {
      if (line.trim() === "") continue;
      if ((JSON.parse(line) as { outcome?: string }).outcome === outcome) n += 1;
    }
  }
  return n;
}

const stripProv = (rawPath: string): string => { const j = JSON.parse(readFileSync(rawPath, "utf8")) as { provenance?: unknown }; delete j.provenance; return JSON.stringify(j); };
const prov = (rawPath: string): Record<string, unknown> => (JSON.parse(readFileSync(rawPath, "utf8")) as { provenance: Record<string, unknown> }).provenance;

// ============================================================================================================
// 1) GREP - scripts/census/u4-*.mjs spend only through the guard (fail-closed, allowlist Map<path,trigger>).
// ============================================================================================================
test("guard_scripts_u4_grep_fetch_and_key_only_through_guard", () => {
  // Forbidden: a direct network round-trip, a raw http(s) client, a subprocess, or a paid-key read in ANY form.
  const PATTERNS: Array<[string, RegExp]> = [
    ["fetch(", /\bfetch\s*\(/],
    ["node:http(s)", /node:https?\b/],
    ["undici", /\bundici\b/],
    ["child_process", /child_process/],
    ["env.KEY (dot)", /\benv\s*\.\s*(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\b/],
    ["env[\"KEY\"] (bracket)", /\benv\s*\[\s*["'`](CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)["'`]\s*\]/],
    ["\"KEY\" in env", /["'`](CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)["'`]\s+in\s+[A-Za-z_$][\w$.]*/],
    ["{ KEY } = env (destructure)", /\{[^}]*\b(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\b[^}]*\}\s*=\s*[^;]*\benv\b/],
  ];
  // The allowlist: a Map<path, trigger>. u4-probe.mjs is the archival COST PROBE (ruling C-9 alpha: archived, NOT on
  // the course path - hardwired to e2, `--block != B0` throws): its imports die at the 2b-ii merge, so the trigger is
  // "migrate-or-delete before any re-execution". A migrated-away / cleaned probe MUST retract this entry (non-vacuity).
  const ALLOWLIST = new Map<string, string>([
    ["u4-probe.mjs", "U-4b-0 archival cost probe (ruling C-9 alpha); not on the course path; migrate-or-delete before any re-execution (imports die at 2b-ii merge)"],
  ]);

  const files = readdirSync(CENSUS).filter((f) => /^u4-.*\.mjs$/.test(f)).sort();
  // scope non-vacuity: the glob must have matched the migrated scripts + the reducers/probe (a broken glob passes vacuously).
  assert.ok(files.length >= 5, `expected >= 5 scripts/census/u4-*.mjs, got ${files.length}: ${files.join(",")}`);
  for (const req of ["u4-oracle-path.mjs", "u4-redraw.mjs", "u4-guard.mjs"]) assert.ok(files.includes(req), `${req} must be in grep scope`);

  const scan = (text: string): string[] => PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name);
  for (const f of files) {
    const hits = scan(readFileSync(join(CENSUS, f), "utf8"));
    if (ALLOWLIST.has(f)) continue; // allowlisted files are checked for NON-VACUITY below, not for cleanliness
    assert.deepEqual(hits, [], `${f} must be clean of paid-leak patterns, found: ${hits.join(", ")}`);
  }
  // Non-vacuity PER allowlist entry: scanning THAT file alone must still yield >= 1 hit; a 0-hit entry = the retraction
  // trigger reached (the probe was migrated/removed) => RED, forcing the allowlist to shrink.
  for (const [f] of ALLOWLIST) {
    assert.ok(existsSync(join(CENSUS, f)), `allowlisted ${f} must exist (else retract the entry)`);
    assert.ok(scan(readFileSync(join(CENSUS, f), "utf8")).length >= 1, `allowlist entry ${f} is VACANT (no hit): retract it (the probe no longer leaks)`);
  }
});

// ============================================================================================================
// 2) BYTE-IDENTITY - the migrated oracle-path reproduces the e7f22b8 output on a stubbed keyless fixture.
// ============================================================================================================
test("u4_oracle_path_replay_is_byte_identical_to_base", (t) => {
  const s = scratch();
  const before = extractBefore("scripts/census/u4-oracle-path.mjs", "oracle");
  if (before === null) { s.cleanup(); t.skip(`base blob ${BASE} unreachable (shallow checkout); byte-identity verified in full-history contexts`); return; }
  try {
    const beforeRaws = join(s.dir, "before"), afterRaws = join(s.dir, "after");
    const b = runScript(before, ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", beforeRaws], { preloadUrl: s.preloadUrl, env: { CHAINSTACK_ETH_URL: "" } });
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", afterRaws, "--ledger-dir", s.ledgerDir, "--cycle", "replay", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}'], { preloadUrl: s.preloadUrl });
    assert.equal(b.status, 0, `before exit 0; stderr=${b.stderr}`);
    assert.equal(a.status, 0, `after exit 0; stderr=${a.stderr}`);
    // The D_e DATA (raw JSON minus provenance) and the resume cache are byte-identical.
    assert.equal(stripProv(join(afterRaws, "U4-oracle-path-e2.raw.json")), stripProv(join(beforeRaws, "U4-oracle-path-e2.raw.json")), "raw JSON (minus provenance) must be byte-identical");
    assert.equal(readFileSync(join(afterRaws, "U4-oracle-inputs.jsonl"), "utf8"), readFileSync(join(beforeRaws, "U4-oracle-inputs.jsonl"), "utf8"), "inputs.jsonl must be byte-identical");
    // The tally-bearing provenance fields match (this is what proves the label tally reproduces the old byOperator).
    const pa = prov(join(afterRaws, "U4-oracle-path-e2.raw.json")), pb = prov(join(beforeRaws, "U4-oracle-path-e2.raw.json"));
    for (const k of ["calls", "calls_by_operator", "calls_by_method", "endpoints"]) assert.deepEqual(pa[k], pb[k], `provenance.${k} must match base`);
    // The RpcError bridge is load-bearing: the concordant revert on e-mode category 8 stays ConcordantRevertError
    // (without the bridge it would flip to NoQuorumError - a change in the D_e bytes invisible on a success-only stub).
    const raw = JSON.parse(readFileSync(join(afterRaws, "U4-oracle-path-e2.raw.json"), "utf8")) as { emode_raw: Record<string, { error?: string }> };
    assert.equal(raw.emode_raw["8"]?.error, "ConcordantRevertError", "the concordant paid/keyless revert must be recognised (RpcError bridge)");
  } finally { rmSync(before, { force: true }); s.cleanup(); }
});

// ============================================================================================================
// 2b) BYTE-IDENTITY - the migrated redraw reproduces the e7f22b8 report on a built cache + synthetic D_e.
// ============================================================================================================
test("u4_redraw_replay_is_byte_identical_to_base", (t) => {
  const s = scratch();
  const before = extractBefore("scripts/census/u4-redraw.mjs", "redraw");
  if (before === null) { s.cleanup(); t.skip(`base blob ${BASE} unreachable (shallow checkout); byte-identity verified in full-history contexts`); return; }
  try {
    // Build a cache with the 3 seed-selected accounts (else the script fails closed on cache/book mismatch) and a
    // synthetic D_e whose 3 update prices match the stub, so account + update checks all match (all_match=true).
    const book = JSON.parse(readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4", "U4-book-23545087.json"), "utf8")) as { book_digest: string; accounts: Array<{ address: string }> };
    const addresses = book.accounts.map((x) => x.address.toLowerCase());
    const acctIdx = selectIndices(book.book_digest, addresses.length, 3);
    const cacheLines = acctIdx.map((i) => JSON.stringify({ kind: "ethCall", to: POOL, data: SEL.getUserAccountData + wordAddr(addresses[i]!), block: 23545087, result: ACCT_HEX }));
    const cachePath = join(s.dir, "cache.jsonl");
    writeFileSync(cachePath, cacheLines.join("\n") + "\n");
    const dePath = join(s.dir, "de.jsonl");
    writeFileSync(dePath, [
      JSON.stringify({ kind: "meta", aggregator_at_b0: AGG_ADDR }),
      JSON.stringify({ kind: "update", block: 23545100, price: "200000000000" }),
      JSON.stringify({ kind: "update", block: 23546000, price: "199000000000" }),
      JSON.stringify({ kind: "update", block: 23552200, price: "201000000000" }),
    ].join("\n") + "\n");
    const beforeOut = join(s.dir, "before-redraw.json"), afterOut = join(s.dir, "after-redraw.json");
    const common = ["--cache", cachePath, "--de", dePath, "--block", "23545087", "--k", "3", "--max-calls", "60", "--prereg-sha", PREREG_SHA];
    const b = runScript(before, [...common, "--out", beforeOut], { preloadUrl: s.preloadUrl, env: { CHAINSTACK_ETH_URL: "" } });
    const a = runScript(join(CENSUS, "u4-redraw.mjs"), [...common, "--out", afterOut, "--ledger-dir", s.ledgerDir, "--cycle", "redraw", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}'], { preloadUrl: s.preloadUrl });
    assert.equal(b.status, 0, `before redraw exit 0; stderr=${b.stderr}`);
    assert.equal(a.status, 0, `after redraw exit 0; stderr=${a.stderr}`);
    assert.equal(readFileSync(afterOut, "utf8"), readFileSync(beforeOut, "utf8"), "redraw report must be byte-identical to base");
    const rep = JSON.parse(readFileSync(afterOut, "utf8")) as { all_match: boolean };
    assert.equal(rep.all_match, true, "the built cache + synthetic D_e must make the re-draw match");
  } finally { rmSync(before, { force: true }); s.cleanup(); }
});

// ============================================================================================================
// 3) SPENDS ONLY THROUGH THE GUARD - every call is a write-ahead ledger line; the paid leg is metered.
// ============================================================================================================
test("u4_oracle_path_spends_only_through_guard", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log");
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", s.ledgerDir, "--cycle", "spend", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}'], { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const calls = (prov(join(s.dir, "raws", "U4-oracle-path-e2.raw.json")) as { calls: number }).calls;
    const attempted = ledgerOutcomeCount(s.ledgerDir, "spend", "attempted");
    const fetches = readFileSync(fetchLog, "utf8").split("\n").filter((l) => l.trim() !== "").length;
    // write-ahead: one ledger `attempted` line per call, and one fetch per attempted call (nothing spent off-ledger).
    assert.equal(attempted, calls, `attempted ledger lines (${attempted}) must equal calls (${calls})`);
    assert.equal(fetches, calls, `fetches (${fetches}) must equal calls (${calls}) - every network round-trip is ledgered first`);
  } finally { s.cleanup(); }
});

test("u4_oracle_path_paid_leg_is_metered_in_its_own_ledger", () => {
  const s = scratch();
  try {
    // Force the paid leg into the quorum by benching drpc; the chainstack witness is then called and MUST be ledgered.
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", s.ledgerDir, "--cycle", "paid", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}', "--with-chainstack"], { preloadUrl: s.preloadUrl, env: { U4T_FAIL_DRPC: "1", CHAINSTACK_ETH_URL: "https://example.invalid/PAID-LEG-KEY" } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const chainstackLedger = join(s.ledgerDir, "paid", "chainstack.jsonl");
    assert.ok(existsSync(chainstackLedger), "the paid chainstack ledger must exist");
    const attempted = readFileSync(chainstackLedger, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as { outcome: string; by_op_method: Record<string, number> }).filter((e) => e.outcome === "attempted");
    assert.ok(attempted.length >= 1, "the paid leg must have >= 1 write-ahead attempted ledger line (metered through the guard)");
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 4) FAIL-CLOSED GUARD ARGS - each of the six required budget args fail-closes when absent.
// ============================================================================================================
test("u4_oracle_path_requires_all_guard_budget_args", () => {
  const s = scratch();
  try {
    const full = ["--prereg-sha", PREREG_SHA, "--max-calls", "9999", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", s.ledgerDir, "--cycle", "req", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":10}'];
    // sanity: the full set runs.
    assert.equal(runScript(join(CENSUS, "u4-oracle-path.mjs"), full, { preloadUrl: s.preloadUrl }).status, 0, "full arg set must run");
    // drop each required arg (name + value) -> the script must fail closed (exit != 0).
    for (const drop of ["--ledger-dir", "--cycle", "--floor", "--max-ru", "--method-caps", "--max-calls"]) {
      const i = full.indexOf(drop);
      const partial = [...full.slice(0, i), ...full.slice(i + 2)];
      const r = runScript(join(CENSUS, "u4-oracle-path.mjs"), partial, { preloadUrl: s.preloadUrl });
      assert.notEqual(r.status, 0, `missing ${drop} must fail closed (got exit 0)`);
    }
  } finally { s.cleanup(); }
});

// ============================================================================================================
// 5) BUDGET REFUSAL is the canonical BudgetExceededError and is NEVER retried (exactly one refused line).
// ============================================================================================================
test("u4_budget_refusal_is_canonical_and_not_retried", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log");
    // --max-calls 5: calls 1..5 succeed, the 6th is REFUSED write-ahead (no fetch, not retried).
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), ["--prereg-sha", PREREG_SHA, "--max-calls", "5", "--raws-dir", join(s.dir, "raws"), "--ledger-dir", s.ledgerDir, "--cycle", "stop", "--floor", "0", "--max-ru", "1000000", "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}'], { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
    assert.equal(a.status, 2, "a budget stop exits 2 (BUDGET STOP), never a masked no-quorum");
    assert.match(a.stderr, /BUDGET STOP/, "the canonical budget stop message");
    const refused = ledgerOutcomeCount(s.ledgerDir, "stop", "refused");
    assert.equal(refused, 1, `exactly ONE refused ledger line (a retried refusal would append several); got ${refused}`);
    const fetches = readFileSync(fetchLog, "utf8").split("\n").filter((l) => l.trim() !== "").length;
    assert.equal(fetches, 5, `the refused call does 0 fetch (write-ahead fail-closed); got ${fetches}`);
  } finally { s.cleanup(); }
});
