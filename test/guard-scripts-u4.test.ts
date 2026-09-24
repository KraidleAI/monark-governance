// GARDE-HELIUS-2b-iii - the u4 course scripts spend ONLY through @monark/rpc-guard (rebased on 2b-ii-b e00f965).
//
// GARDE-HELIUS-1b-iii UNIFICATION: the u4 GREP (fetch/key/closed-import scan of scripts/census/u4-*.mjs) is FOLDED into
// the unified roots list of test/rpc-guard-fetch-only-inside-client.test.ts (companion `u4_scripts_clean_and_import_
// sources_closed` + the de-skipped `fetch_only_inside_client`). It is REMOVED here (moved, not duplicated) - the item
// "unify the two grep tests" (G7 1b-0 §5, trigger: fusion of the sub-lots) is discharged. The REPLAY / spends / budget /
// unlock / composition / class-identity oracles below STAY. Everything runs OFFLINE: a preload freezes the clock and
// stubs globalThis.fetch with canned JSON-RPC (no network, fake .invalid endpoints, keys never read).
//
// It proves, on the ACTUAL migrated scripts (the grep now lives in the unified roots test):
//  2) byte-identity - the migrated oracle-path/redraw reproduce the e7f22b8 output; verified against COMMITTED
//     reference sha (no base blob, no git, no shallow-checkout SKIP) recomputed from base AND migrated (see REF);
//  3) spends only through the guard - every call is a write-ahead ledger line; the paid chainstack leg, forced into
//     the quorum with a FACTICE .invalid key, is metered in its own ledger (fetches-to-paid-host == chainstack lines);
//  4) --max-ru / --floor are WIRED to the guard (a tiny cap refuses run_credits / cycle_cap);
//  5) fail-closed guard args; a budget refusal is the canonical BudgetExceededError, NEVER retried;
//  6) the served N-operator unlock + lock recovery; the ledger-dir guard;
//  7) composition (Branchement rule) - real script -> ledger on disk -> served runCli reconcile (GO / NO-GO hard:total);
//  8) class identity - rpc2 re-exports the package error classes (the identity bridge is REMOVED post 2b-ii).
//  9) PROBER-EXCLUDE-OP-1 - --exclude-operator (repeatable, closed label set) reaches the pool; the label guard refuses an
//     unknown label and the quorum guard (distinct OPERATORS, operatorOf) a starved method, both before any lock or network
//     call; the default course keeps its golden bytes.
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
import { canon, sha256Hex } from "../scripts/census/u4-guard.mjs";
import { SEL, wordAddr } from "../apps/sentinel/src/ukemi/abi.ts";
import { POOL } from "../apps/sentinel/src/ukemi/clusters.ts";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));      // <root>/test/this -> <root>
// Computed (not hard-coded) from the CURRENT preregs so they cannot drift: u4-redraw still compares --prereg-sha to
// lfSha256(docs/PLAN-u4-prereg.md); the PARAMETERISED u4-oracle-path (lot U-4b-1b-2) compares to docs/PLAN-u4b-prereg.md.
const PREREG_SHA = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const PREREG_U4B = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4b-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const WETH_ADDR = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const CENSUS = join(ROOT, "scripts", "census");
const ACCT_HEX = "0x" + ["1000", "2000", "3000", "4000", "5000", "6000"].map((n) => BigInt(n).toString(16).padStart(64, "0")).join("");
const AGG_ADDR = "0x" + "1".repeat(40);
const NODE = process.execPath;
const CAPS = '{"eth_call":100000,"eth_getLogs":100000}';
// A FACTICE paid key on a .invalid host (never a real key): the guard resolves `chainstack` to this URL, so a fetch to
// PAID_HOST is a paid-leg fetch. An off-guard read of CHAINSTACK_ETH_URL (a mutant) fetches THIS host too, off-ledger.
const PAID_URL = "https://paid.example.invalid/FAKEKEY-u4t";
const PAID_HOST = "paid.example.invalid";

// COMMITTED REFERENCE OUTPUT sha. D-4 (lot U-4b-1b-2): the u4-oracle-path REFs are RE-BASELINED because the prober is now
// PARAMETERISED (--episode-file / --prereg-file docs/PLAN-u4b-prereg.md), so its provenance carries new fields
// (episode_id, selection_sha256, prereg_file, feed_proxy_source, usdt_blocks_status) and the prereg_sha is the U-4b one.
//   − 76beb089… / 5f3dcf2c… (base e7f22b8; provenance pre-Q-D, prereg U-4, e2 constants HARD-CODED)
//   + values below      (e2 via EXPLICIT flags; provenance +episode_id/selection_sha256/prereg_file; prereg U-4b)
// The D_e DATA (aggregator, updates, usdt_prices, emode_raw) is byte-IDENTICAL — only provenance moved; the inline data
// vector in the replay test asserts p_min/p_max/emode independently of the whole-file sha. u4-redraw is UNCHANGED.
// Recompute (frozen clock, keyless, the preload below): node --import <preload> scripts/census/u4-oracle-path.mjs \
//   --episode-file <e2 selection> --prereg-file docs/PLAN-u4b-prereg.md --prereg-sha <lf u4b> --raws-dir <D> --max-calls
//   9999 --ledger-dir <OUT> --cycle replay --floor 0 --max-ru 1000000 --method-caps <caps> --usdt-blocks 23550406,23550879
//   --emode-categories 1,2,3,4,8,11,13,15,17,19,21,23,24,27,28 ; sha256sum <D>/U4-oracle-path-e2.raw.json <D>/U4-oracle-inputs.jsonl
// D-n (lot U-4b-1b-4, R-I, cp-1 C-5): RE-BASELINED again - the raw gains pre_b0_anchor + provenance.pre_b0_anchor_window +
// params.pre_b0_max_windows, the inputs cache gains the lookback getLogs lines, and the preload gains one pre-B0 event with
// range-honouring getLogs. The D_e DATA of [B0, B_last] is unchanged (p_min/p_max/n_updates/emode asserted inline below).
//   - 8b0e3d69... / 755a3d91... (lot U-4b-1b-2, no anchor)
//   + values below: measured TWICE independently - (A) this test harness, (B) a CLI child run of the prober under the
//     preload extracted from this file, hashed with the same prereg-sha mask, two runs byte-identical (G1 rendu -1b-4).
const REF = {
  ORACLE_RAW: "8254416390d765dce9a2cec8481b759e2a55f47a48c70cc937de6d4ea4f300ae",       // U4-oracle-path-e2.raw.json (full, frozen clock; e2 via flags)
  ORACLE_INPUTS: "e2c3ff889e6f8889e11759c2e152b6a9bfff1eef1c5095b022545dd7d842f076", // U4-oracle-inputs.jsonl
  REDRAW_REPORT: "ed2eaf595851e2c96b94ce6bd27182a975e4afa9eb77a2270a87e67b36ee3059", // U4-redraw report (--out) — UNCHANGED
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
// U-4b-1b-4 (cp-1 C-5): ONE pre-B0 AnswerUpdated (block 23545000 <= B0 23545087; round 0 = the round before the first
// in-window stub) and eth_getLogs honours fromBlock/toBlock, so the receding anchor lookback sees ONLY that event.
const UPDATES=[{block:23545000,price:200500000000n,round:0n,ts:1700000000n},{block:23545100,price:200000000000n,round:1n,ts:1700000100n},{block:23546000,price:199000000000n,round:2n,ts:1700000200n},{block:23552200,price:201000000000n,round:3n,ts:1700000300n}];
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
  if(method==="eth_getLogs"){ const q=params[0]; const t0=String((q.topics&&q.topics[0])||""); if(t0.toLowerCase()!==ANSWER_UPDATED.toLowerCase()) return ok([]); const lo=parseInt(q.fromBlock,16), hi=parseInt(q.toBlock,16); return ok(answerLogs.filter((l)=>{ const b=parseInt(l.blockNumber,16); return b>=lo&&b<=hi; })); }
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
// The parameterised prober (U-4b-1b-2) writes the LIVE prereg sha into its provenance, so a whole-file golden would
// redden on every docs-only edit of docs/PLAN-u4b-prereg.md (measured 2026-09-22: prereg §5b rewrite). The golden is
// therefore taken over the raw with the prereg sha MASKED (the binding itself is asserted separately below).
const sha256FileMaskingPreregSha = (p: string): string =>
  createHash("sha256").update(readFileSync(p, "utf8").split(PREREG_U4B).join("<prereg_sha>"), "utf8").digest("hex");
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

/** Write an e2 episode-selection.json (schema shape) with a VALID selection_sha256 into `dir`, return its path. The
 *  parameterised u4-oracle-path reads episode.B0 / episode.B_last and verifies selection_sha256 (over the file minus
 *  version_check/selection_sha256) — built with the SAME canon/sha256Hex the reducer uses (imported from u4-guard). */
function writeE2Episode(dir: string): string {
  const payload = { schema: "ukemi-u4b-episode-selection/1", episode: { id: "e2", B_first: 23545088, B_last: 23552238, B0: 23545087, n_distinct: 99, collateral: WETH_ADDR } };
  const file = { ...payload, version_check: "pending", selection_sha256: sha256Hex(canon(payload)) };
  const p = join(dir, "episode-selection.json");
  writeFileSync(p, JSON.stringify(file, null, 2));
  return p;
}

const EMODE_CATS = "1,2,3,4,8,11,13,15,17,19,21,23,24,27,28";
/** Oracle-path arg builder — PARAMETERISED (lot U-4b-1b-2): e2 via --episode-file + explicit --usdt-blocks/--emode. */
function oracleArgs(s: { dir: string; ledgerDir: string }, cycle: string, o: { maxCalls?: number; floor?: number; maxRu?: number; withChainstack?: boolean; ledgerDir?: string } = {}): string[] {
  return ["--episode-file", writeE2Episode(s.dir), "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_U4B,
    "--usdt-blocks", "23550406,23550879", "--emode-categories", EMODE_CATS,
    "--max-calls", String(o.maxCalls ?? 9999), "--raws-dir", join(s.dir, "raws"),
    "--ledger-dir", o.ledgerDir ?? s.ledgerDir, "--cycle", cycle, "--floor", String(o.floor ?? 0), "--max-ru", String(o.maxRu ?? 1000000),
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

// 1) GREP - MOVED to test/rpc-guard-fetch-only-inside-client.test.ts (GARDE-HELIUS-1b-iii unification): the
//    scripts/census/u4-*.mjs fetch/key/closed-import scan now lives in the unified roots list there (companion
//    `u4_scripts_clean_and_import_sources_closed`). Not duplicated here.

// ============================================================================================================
// 2) BYTE-IDENTITY - the migrated scripts reproduce the e7f22b8 output, verified vs COMMITTED reference sha (C-R-1).
// ============================================================================================================
test("u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data", () => {
  const s = scratch();
  try {
    const raws = join(s.dir, "raws"), raws2 = join(s.dir, "raws2");
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "replay"), { preloadUrl: s.preloadUrl });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    // (i) the full raw + resume cache match the RE-BASELINED reference sha (parameterised prober, e2 via flags; D-4).
    assert.equal(sha256FileMaskingPreregSha(join(raws, "U4-oracle-path-e2.raw.json")), REF.ORACLE_RAW, "U4-oracle-path-e2.raw.json must match the (re-baselined) reference sha");
    assert.equal(sha256FileMaskingPreregSha(join(raws, "U4-oracle-inputs.jsonl")), REF.ORACLE_INPUTS, "U4-oracle-inputs.jsonl must match the (re-baselined) reference sha");
    // (ii) DETERMINISM: a second run into a fresh raws-dir is byte-identical (frozen clock; no timing in the output).
    const b = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "replay2").map((x) => (x === join(s.dir, "raws") ? raws2 : x)), { preloadUrl: s.preloadUrl });
    assert.equal(b.status, 0, `second run exit 0; stderr=${b.stderr}`);
    assert.equal(sha256FileMaskingPreregSha(join(raws2, "U4-oracle-path-e2.raw.json")), REF.ORACLE_RAW, "the raw is byte-identical across two runs (deterministic)");
    // (iii) INDEPENDENT D_e data vector (survives a whole-file sha change): p_min/p_max from the 3 stubbed updates, the
    // parameterised bornes (episode B0/B_last), episode_id/selection_sha256 in the provenance, and the keyless concordant
    // revert on e-mode 8 (class identity; a flip to NoQuorumError would change the bytes).
    const raw = JSON.parse(readFileSync(join(raws, "U4-oracle-path-e2.raw.json"), "utf8")) as { p_min: string; p_max: string; n_updates: number; emode_raw: Record<string, { error?: string }>; pre_b0_anchor: unknown; provenance: { episode_id: string; selection_sha256: string; pre_b0_anchor_window: unknown; params: { b0: number; b_last: number; feed_proxy_source: string; usdt_blocks_status: string } } };
    assert.equal(raw.p_min, "199000000000", "p_min == min of the 3 stubbed AnswerUpdated prices");
    assert.equal(raw.p_max, "201000000000", "p_max == max of the 3 stubbed prices");
    assert.equal(raw.n_updates, 3, "3 D_e updates decoded (the pre-B0 stub event stays OUT of [B0, B_last])");
    // U-4b-1b-4 (R-I): the anchor = the stubbed pre-B0 event, found in window 1 [B0-9990, B0] (2 getLogs pieces of <= 9990
    // blocks, quorum-2 => 4 calls) - an independent data vector next to the re-baselined whole-file sha.
    assert.deepEqual(raw.pre_b0_anchor, { price: "200500000000", block: 23545000, log_index: 0, round_id: "0" }, "pre_b0_anchor = the LAST AnswerUpdated <= B0 (cp-1 C-4 form)");
    assert.deepEqual(raw.provenance.pre_b0_anchor_window, { from: 23545087 - 9990, to: 23545087, windows_tried: 1, calls: 4 }, "lookback provenance (ADDENDUM section 2)");
    assert.equal(raw.emode_raw["8"]?.error, "ConcordantRevertError", "the concordant keyless revert is recognised (class identity)");
    assert.equal(raw.provenance.params.b0, 23545087, "b0 came from episode.B0 (parameterised, not a hard-coded e2 default)");
    assert.equal(raw.provenance.params.b_last, 23552238, "b_last came from episode.B_last");
    assert.equal(raw.provenance.params.feed_proxy_source, "default §DISC:28", "feed_proxy kept its §DISC:28 default (documented)");
    assert.equal(raw.provenance.params.usdt_blocks_status, "provided", "usdt_blocks provided via the explicit flag");
    assert.equal(raw.provenance.episode_id, "e2", "provenance carries episode_id");
    assert.ok(/^[0-9a-f]{64}$/.test(raw.provenance.selection_sha256), "provenance carries selection_sha256");
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
    // C-R-4(a): NAME the paid-leg e-mode issue at THIS base. Nominal (keyless) is ConcordantRevertError. FLIPPED by
    // UKEMI-REVERT-1 (R-A-bis, the flip this comment pre-declared): with the paid leg forced, chainstack's bare "0x" revert
    // is no longer benched but HELD and paired with the KEYLESS bare witness (the Pocket gateways, ONE operator, same
    // "0x" revert) => the same ConcordantRevertError as the keyless nominal (was NoQuorumError after R-A alone). It is
    // still NEVER QuorumDisagreementError (the pre-2b-ii false disagreement stays closed: messages are never compared
    // across units, both sides are keyed on the class "revert:bare").
    const emode = (JSON.parse(readFileSync(join(s.dir, "raws", "U4-oracle-path-e2.raw.json"), "utf8")) as { emode_raw: Record<string, { error?: string }> }).emode_raw["8"]?.error;
    assert.equal(emode, "ConcordantRevertError", "paid-leg-forced e-mode 8 is ConcordantRevertError post-R-A-bis (paid bare paired with the keyless bare witness; equals the keyless nominal)");
    assert.notEqual(emode, "QuorumDisagreementError", "the pre-2b-ii false disagreement (C-4/'0x') must be gone (R-A, R-A-bis)");
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
    const full = oracleArgs(s, "req");
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
    const inRepo = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "u4g-inrepo", { ledgerDir: join(ROOT, "node_modules") }), { preloadUrl: s.preloadUrl });
    assert.notEqual(inRepo.status, 0, "a --ledger-dir under the repo root must be refused (CA-11 / E-2)");
    // (b) a --ledger-dir that does NOT pre-exist is refused (C-8: never mkdir a phantom parent).
    const missing = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "miss", { ledgerDir: join(s.dir, "does-not-exist") }), { preloadUrl: s.preloadUrl });
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

// ============================================================================================================
// 9) PROBER-EXCLUDE-OP-1 - --exclude-operator <label> (repeatable) on u4-oracle-path.mjs (course U-4b, step 5, pass 4).
// ============================================================================================================
/** Attempted ledger lines of operator `op` for RPC `method` (ledger key by_op_method "op|method") under <ledgerDir>/<cycle>/. */
function attemptedByMethod(ledgerDir: string, cycle: string, op: string, method: string): number {
  const f = join(ledgerDir, cycle, `${op}.jsonl`);
  if (!existsSync(f)) return 0;
  return readFileSync(f, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as { outcome: string; by_op_method?: Record<string, number> })
    .filter((e) => e.outcome === "attempted" && (e.by_op_method?.[`${op}|${method}`] ?? 0) > 0).length;
}
const isPocketHost = (h: string): boolean => h === "pocket.network" || h.endsWith(".pocket.network");

test("u4_oracle_path_exclude_operator_drops_pocket_and_reaches_chainstack", () => {
  const s = scratch();
  try {
    const env = { U4T_FAIL_DRPC: "1", CHAINSTACK_ETH_URL: PAID_URL };
    // POSITIVE CONTROL (D-2, non-vacuity), same env and flags WITHOUT --exclude-operator: pocket.network IS fetched (it is
    // the second getLogs witness next to tenderly.co), so chainstack never reaches the getLogs quorum.
    const ctlHosts = join(s.dir, "hosts-ctl.log");
    const ctl = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "exclctl", { withChainstack: true }), { preloadUrl: s.preloadUrl, env: { ...env, U4T_FETCH_HOSTS: ctlHosts } });
    assert.equal(ctl.status, 0, `control exit 0; stderr=${ctl.stderr}`);
    assert.ok(hostsOf(ctlHosts).filter(isPocketHost).length > 0, "control: pocket.network is fetched without the flag (the host check below can see it)");
    assert.equal(attemptedByMethod(s.ledgerDir, "exclctl", "chainstack", "eth_getLogs"), 0, "control: without the flag chainstack is never a getLogs witness (tenderly.co + pocket.network answer first)");
    // THE FLAG, pass-4 shape: --exclude-operator pocket.network --with-chainstack, drpc benched (plan refusal stand-in).
    const hostLog = join(s.dir, "hosts.log");
    const raws = join(s.dir, "raws-excl");
    const args = [...oracleArgs(s, "excl", { withChainstack: true }).map((x) => (x === join(s.dir, "raws") ? raws : x)), "--exclude-operator", "pocket.network"];
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), args, { preloadUrl: s.preloadUrl, env: { ...env, U4T_FETCH_HOSTS: hostLog } });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const hosts = hostsOf(hostLog);
    assert.ok(hosts.length > 0, "the course fetched (non-vacuous host log)");
    assert.equal(hosts.filter(isPocketHost).length, 0, `no pocket.network fetch once excluded; hosts=${[...new Set(hosts)].join(",")}`);
    assert.ok(attemptedByMethod(s.ledgerDir, "excl", "chainstack", "eth_getLogs") >= 1, "chainstack reaches the getLogs quorum (>= 1 attempted eth_getLogs ledger line)");
    assert.equal(ledgerSummary(s.ledgerDir, "excl").ops["pocket.network"], undefined, "pocket.network is not even requested (no ledger)");
    const p = prov(join(raws, "U4-oracle-path-e2.raw.json")) as { endpoints: { eth_call: string[]; eth_getLogs: string[] }; params: { excluded_operators: string[] } };
    assert.deepEqual(p.params.excluded_operators, ["mevblocker.io", "pocket.network"], "provenance carries the EFFECTIVE excluded list, default first");
    assert.deepEqual(p.endpoints.eth_getLogs, ["drpc.org", "tenderly.co", "chainstack"], "provenance: getLogs pool without pocket.network, chainstack last");
    assert.deepEqual(p.endpoints.eth_call, ["drpc.org", "nodies.app", "chainstack"], "provenance: eth_call pool without pocket.network (nodies.app kept)");
  } finally { s.cleanup(); }
});

test("u4_oracle_path_exclude_operator_guard_refuses_single_witness_before_any_fetch", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log");
    // pocket.network AND tenderly.co excluded (TWO occurrences of the flag), no --with-chainstack: eth_getLogs keeps ONE
    // label (drpc.org) => refused. Reading only the first occurrence would leave drpc.org + tenderly.co and run.
    const args = [...oracleArgs(s, "exclguard"), "--exclude-operator", "pocket.network", "--exclude-operator", "tenderly.co"];
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), args, { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
    assert.notEqual(a.status, 0, "a single getLogs witness must be refused (fail-closed)");
    assert.equal(hostsOf(fetchLog).length, 0, "0 fetch: the guard fires before any network call");
    assert.match(a.stderr, /EXCLUDE-OPERATOR QUORUM GUARD/, "the refusal names the guard");
    assert.match(a.stderr, /eth_getLogs \[drpc\.org\]/, "the refusal names the starved method pool (labels only)");
    const sum = ledgerSummary(s.ledgerDir, "exclguard");
    assert.deepEqual(Object.keys(sum.ops), [], "no ledger opened: the guard precedes openU4GuardedClient");
    assert.deepEqual(sum.locks, [], "no lock taken: nothing is left to unlock after a refusal");
    assert.equal(existsSync(join(s.dir, "raws", "U4-oracle-path-e2.raw.json")), false, "no raw written");
  } finally { s.cleanup(); }
});

test("u4_oracle_path_exclude_operator_guard_counts_operators_not_labels", () => {
  const s = scratch();
  try {
    const fetchLog = join(s.dir, "fetches.log");
    // cp-1 C-5: drpc.org excluded, no --with-chainstack => eth_call keeps TWO labels (nodies.app, pocket.network) but ONE
    // operator "pocket" (rpc2.ts operatorOf, the pool's own distinctness key) => quorum-2 impossible => refused up front.
    const args = [...oracleArgs(s, "exclops"), "--exclude-operator", "drpc.org"];
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), args, { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
    assert.notEqual(a.status, 0, "two labels of ONE operator must be refused (fail-closed)");
    assert.equal(hostsOf(fetchLog).length, 0, "0 fetch: refused before any network call");
    assert.match(a.stderr, /EXCLUDE-OPERATOR QUORUM GUARD/, "the refusal names the quorum guard");
    assert.match(a.stderr, /eth_call \[nodies\.app,pocket\.network\]/, "the refusal names the starved eth_call pool (labels only)");
    const sum = ledgerSummary(s.ledgerDir, "exclops");
    assert.deepEqual(Object.keys(sum.ops), [], "no ledger opened");
    assert.deepEqual(sum.locks, [], "no lock taken");
  } finally { s.cleanup(); }
});

test("u4_oracle_path_exclude_operator_unknown_label_is_refused_before_any_fetch", () => {
  const s = scratch();
  try {
    // cp-1 C-11: a typo (pocket.netwrok) must NEVER be a silent no-op that keeps pocket.network in the pools; nor may a
    // trailing --exclude-operator without a value. Both are refused by the closed-set label guard, 0 fetch, 0 lock.
    const cases: Array<{ cycle: string; tail: string[] }> = [
      { cycle: "excltypo", tail: ["--exclude-operator", "pocket.netwrok"] },
      { cycle: "excltrail", tail: ["--exclude-operator"] },
    ];
    for (const c of cases) {
      const fetchLog = join(s.dir, `fetches-${c.cycle}.log`);
      const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), [...oracleArgs(s, c.cycle), ...c.tail], { preloadUrl: s.preloadUrl, env: { U4T_FETCH_COUNTER: fetchLog } });
      assert.notEqual(a.status, 0, `${c.cycle}: an inadmissible --exclude-operator must be refused (fail-closed)`);
      assert.equal(hostsOf(fetchLog).length, 0, `${c.cycle}: 0 fetch`);
      assert.match(a.stderr, /EXCLUDE-OPERATOR LABEL GUARD/, `${c.cycle}: the refusal names the label guard`);
      assert.equal(a.stderr.includes("pocket.netwrok"), false, `${c.cycle}: the refusal never echoes the argv value`);
      const sum = ledgerSummary(s.ledgerDir, c.cycle);
      assert.deepEqual([Object.keys(sum.ops), sum.locks], [[], []], `${c.cycle}: no ledger, no lock`);
    }
  } finally { s.cleanup(); }
});

test("u4_oracle_path_default_excluded_operators_golden_unchanged", () => {
  const s = scratch();
  try {
    // WITHOUT --exclude-operator the effective list is the course default ["mevblocker.io"] (this exact order), so the raw
    // and the resume cache are byte-identical to the committed goldens (prereg sha masked, as in section 2).
    const a = runScript(join(CENSUS, "u4-oracle-path.mjs"), oracleArgs(s, "dflt"), { preloadUrl: s.preloadUrl });
    assert.equal(a.status, 0, `exit 0; stderr=${a.stderr}`);
    const raw = join(s.dir, "raws", "U4-oracle-path-e2.raw.json");
    assert.equal(sha256FileMaskingPreregSha(raw), REF.ORACLE_RAW, "default course: the raw golden is unchanged");
    assert.equal(sha256FileMaskingPreregSha(join(s.dir, "raws", "U4-oracle-inputs.jsonl")), REF.ORACLE_INPUTS, "default course: the inputs golden is unchanged");
    const p = prov(raw) as { params: { excluded_operators: unknown } };
    assert.deepEqual(p.params.excluded_operators, ["mevblocker.io"], "default excluded_operators == [mevblocker.io]");
  } finally { s.cleanup(); }
});
