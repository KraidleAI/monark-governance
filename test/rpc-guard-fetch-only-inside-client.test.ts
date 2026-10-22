/**
 * Root/CI guard `fetch_only_inside_client` (GARDE-HELIUS layer (ii), plan sect.6.1, T4). The single budgeted client
 * `@monark/rpc-guard` is the ONLY module in the declared scope allowed to carry a network call or read a paid
 * endpoint key; everywhere else in scope a `fetch(` / `node:http(s)` / `undici` / `child_process`, OR a
 * `env.<paid-key>` read (in ANY form: dot, bracket, `in`, destructuring - C-1(c)), is REFUSED. Layer (ii):
 * "impossible by the repo" - a HELIUS-1-shaped draft that enters the tree is caught here.
 *
 * DECLARED SCOPE:
 *   - packages/*\/src/** (GREEN today; allowlist = packages/rpc-guard/src/transport.ts, the private transport).
 *   - apps/sentinel/src/** (GARDE-HELIUS-2b-ii R-B for ukemi/**, widened to the whole sentinel src by NARABI-OPS-1d).
 *     Allowlist = apps/sentinel/src/keyless-transport.ts, the sole keyless fetch site; the rpc.ts entry was retracted
 *     at the section 11-1 fold of ADR-NARABI-OPS-1, which deleted the dead paid-leg code it covered.
 *   - apps/bell/src/** enters scope at GARDE-HELIUS-1b; the full guarantee (fetch_only_inside_client) is DE-SKIPPED at
 *     1b-iii and now iterates the unified ROOTS list. Allowlist = apps/bell/src/close.ts (the single cash module holding
 *     both the paid GET and the key read, C-6; retraction trigger = "G0 of the Bell cash course", R-1).
 *   - scripts/census/u4-*.mjs (the course scripts) is a root too (grep FOLDED here from guard-scripts-u4.test.ts).
 *   - apps/koyomi/src/** (allowlist EMPTY: the label reader reaches Databento and Massive only through the close.ts seams) and
 *     apps/koyomi/ops/*.mjs (allowlist = apps/koyomi/ops/koyomi-stamp.mjs of lot A1-e, the public keyless GET of commit.jsonl and
 *     of the OTS calendars) enter at KOYOMI-A A1-a (plan A1 r2, test 60); both roots also refuse the bare paid-key name.
 * KEY form is an ACCESS (dot, optional-chain dot, bracket, optional-chain bracket, template-literal bracket, `in`,
 * destructuring, Reflect.get, Object.hasOwn - C-R-b4). In the PACKAGES/BELL scopes the bare name is NOT refused (it
 * appears in comments: rpc.ts:8, universe.ts:322) and elsewhere, and would red by construction; on the SENTINEL + u4 scopes the bare
 * name IS refused too, killing the alias evasion `const e = env; e.KEY` (an allowlisted file is exempt).
 *
 * MEASURED HITS after 1b-iii (apps/bell/src, base 6114ce9, this scanner): 1b-iii migrated 5 of the 14 (ethereum.ts:64
 * fetch INTO the client; collect.ts:582/583 POLYGON/DATABENTO key reads MOVED to close.ts; close.ts fetch+key now
 * ALLOWLISTED). The 9 residual hits are 1b-i's (universe-cli.ts:111/267/268/281/297/312) and 1b-ii's (collect.ts:284
 * fetch, rpc.ts:22 BELL_SOLANA_RPC, rpc.ts:44 fetch) - so fetch_only_inside_client is RED in a DISJOINT 1b-iii worktree
 * (a DECLARED cross-lot dependency) and GREEN only on the merged 1b tree. 0 residual is in 1b-iii's own files.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const ALLOWLIST = new Set<string>(["packages/rpc-guard/src/transport.ts"]);
const NET: ReadonlyArray<RegExp> = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/];
// The 6 paid endpoint keys. A read is REFUSED in EVERY access form (C-1(c), M-16, GARDE-HELIUS-2b-ii-c C-R-b4): a
// `\benv\.KEY\b`-only motif MISSED env["KEY"], "KEY" in env, {KEY}=env AND the six evasions the validator's p7 probe
// found - env?.KEY, env?.["KEY"], env[`KEY`], Reflect.get(env,"KEY"), Object.hasOwn(env,"KEY") (all regex-caught below),
// plus the ALIAS form (`const e = env; e.KEY`) that no access regex can track (a bare-key-name scan on the sentinel scope
// kills it). One mutant per form (injected into record.ts) reds sentinel_src_clean_and_allowlist_load_bearing.
const KEY_NAMES = "CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY";
const BT = String.fromCharCode(96); // a backtick, kept OUT of these template strings
const Q = `["'${BT}]`;              // a quote char class: double, single OR template backtick (catches env[`KEY`])
const KEY: ReadonlyArray<RegExp> = [
  new RegExp(`\\benv\\??\\.(?:${KEY_NAMES})\\b`),                             // env.KEY, env?.KEY
  new RegExp(`\\benv(?:\\?\\.)?\\[\\s*${Q}(?:${KEY_NAMES})${Q}\\s*\\]`),       // env["KEY"], env?.["KEY"], env[`KEY`]
  new RegExp(`${Q}(?:${KEY_NAMES})${Q}\\s+in\\s+[\\w$.]*\\benv\\b`),           // "KEY" in env / in deps.env
  new RegExp(`\\{[^}]*\\b(?:${KEY_NAMES})\\b[^}]*\\}\\s*=\\s*[^;]*\\benv\\b`),  // const {KEY} = env / = deps.env
  new RegExp(`(?:Reflect\\.get|Object\\.hasOwn)\\(\\s*[\\w$.]*\\benv\\b\\s*,\\s*${Q}(?:${KEY_NAMES})${Q}`), // Reflect.get(env,"KEY") / Object.hasOwn(env,"KEY")
];
// The ALIAS evasion (`const e = deps.env; e.CHAINSTACK_ETH_URL`) reads the key through a local alias no access regex can
// track. Defence: on the sentinel scope (0 bare key-name occurrence today, comments included - measured), the BARE name is
// itself refused. Kept OUT of the packages/Bell scopes, whose comments legitimately name the keys (would false-positive).
const KEY_BARE = new RegExp(`\\b(?:${KEY_NAMES})\\b`);

function tsFiles(absDir: string, relDir: string, out: Array<[string, string]>): void {
  if (!existsSync(absDir)) return;
  for (const n of readdirSync(absDir)) {
    if (n === "node_modules" || n === "test") continue;
    const abs = join(absDir, n), rel = relDir ? `${relDir}/${n}` : n;
    if (statSync(abs).isDirectory()) tsFiles(abs, rel, out);
    else if (abs.endsWith(".ts")) out.push([abs, rel]);
  }
}
function scopeFiles(which: "apps" | "packages"): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (which === "apps") tsFiles(join(REPO, "apps/bell/src"), "apps/bell/src", out);
  else for (const p of readdirSync(join(REPO, "packages"))) tsFiles(join(REPO, "packages", p, "src"), `packages/${p}/src`, out);
  return out;
}
/** NARABI-OPS-1d: the sentinel scope is WIDENED from ukemi/**(+rpc.ts) to the WHOLE apps/sentinel/src/** — the
 *  daily job (run.ts + the top-level modules + the new keyless-transport.ts) enters the fetch_only guarantee now
 *  that its paid leg is metered through @monark/rpc-guard. One allowlisted file (SENTINEL_ALLOW): keyless-transport.ts
 *  (the sole keyless fetch site; retraction trigger = the keyless pool itself migrates under the guard, route beta).
 *  The rpc.ts entry was retracted at the section 11-1 fold, which deleted its dead paid-leg code. The entry is
 *  scanned (in scope) AND allowlisted — the double guard: an allowlist entry must be a file actually in scope. */
function sentinelScope(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  tsFiles(join(REPO, "apps/sentinel/src"), "apps/sentinel/src", out);
  return out;
}
/** Hits = a forbidden pattern (net OR key, any form) on a scope file NOT in `allow`. Reads EVERY line, comments
 *  included (a commented `fetch(`/`env.KEY` in a migrated source would red - so the migrated code carries none). */
function scan(files: ReadonlyArray<[string, string]>, allow: ReadonlySet<string>, bareKeys = false): string[] {
  const hits: string[] = [];
  for (const [abs, rel] of files) {
    if (allow.has(rel)) continue;
    readFileSync(abs, "utf8").split(/\r?\n/).forEach((ln, i) => {
      for (const re of NET) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [net]`);
      for (const re of KEY) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [key]`);
      if (bareKeys && KEY_BARE.test(ln)) hits.push(`${rel}:${String(i + 1)} [key-bare]`); // C-R-b4: the ALIAS evasion, sentinel scope only
    });
  }
  return hits;
}

// ---- GARDE-HELIUS-1b-iii: the unified ROOTS LIST. Folds the 2b-ii ukemi grep + the 2b-iii scripts/census/u4 grep + ----
// ---- apps/bell/src + packages into ONE scan mechanism (a Map<path,trigger> allowlist per root). The full guarantee ----
// ---- (fetch_only_inside_client, de-skipped below) iterates it; the per-root load-bearing companions reuse it. --------
const CENSUS = join(REPO, "scripts", "census");
// close.ts is the SINGLE allowlisted Bell cash module (C-6 / ruling R-1): it holds BOTH the paid GET and the key read.
const BELL_ALLOW = new Map<string, string>([["apps/bell/src/close.ts", "G0 of the Bell cash course (R-1): Databento/Polygon quotas+caps posed there"]]);
// NARABI-OPS-1d: the allowlisted sentinel file. keyless-transport.ts is the sole keyless fetch site (route alpha), retracted
// when the keyless pool migrates (route beta). The rpc.ts entry left at the section 11-1 fold, with the dead code it covered.
const SENTINEL_ALLOW = new Map<string, string>([
  ["apps/sentinel/src/keyless-transport.ts", "NARABI-OPS-1d route alpha: the sole keyless fetch site; retraction = the keyless pool migrates under the guard (route beta)"],
]);
// The u4 course scripts are .mjs: the whole-word key NAME is refused (naming the exact keys spares CHAINSTACK_LABEL), and
// a DIRECT import of apps/sentinel/src/rpc.ts (the shared quorum pool, reachable only transitively) is forbidden (C-R-6).
const U4_KEY: ReadonlyArray<RegExp> = [
  new RegExp(`\\benv\\s*\\.\\s*(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\\b`),
  new RegExp(`\\benv\\s*\\[\\s*${Q}(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)${Q}\\s*\\]`),
  new RegExp(`${Q}(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)${Q}\\s+in\\s+[A-Za-z_$][\\w$.]*`),
  new RegExp(`\\{[^}]*\\b(CHAINSTACK_[A-Z0-9_]+|HELIUS_[A-Z0-9_]+)\\b[^}]*\\}\\s*=\\s*[^;]*\\benv\\b`),
];
const U4_KEYNAME_RE = new RegExp(`\\b(CHAINSTACK_(?:ETH|SOLANA|BASE|BSC|ROBINHOOD)_URL|HELIUS_API_KEY|BELL_SOLANA_RPC|POLYGON_API_KEY|DATABENTO_API_KEY)\\b`);
const U4_ALLOW = new Map<string, string>(); // empty (u4-probe.mjs DELETED); the Map<path,trigger> form stays if a probe returns
function u4Files(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const f of readdirSync(CENSUS).filter((n) => /^u4-.*\.mjs$/.test(n)).sort()) out.push([join(CENSUS, f), f]);
  return out;
}
/** Generic scan with explicit pattern sets. The .ts roots reuse NET/KEY/KEY_BARE via `scan`; the u4 root passes U4_KEY. */
function scanWith(files: ReadonlyArray<[string, string]>, allow: ReadonlySet<string>, nets: ReadonlyArray<RegExp>, keys: ReadonlyArray<RegExp>, bareRe?: RegExp): string[] {
  const hits: string[] = [];
  for (const [abs, rel] of files) {
    if (allow.has(rel)) continue;
    readFileSync(abs, "utf8").split(/\r?\n/).forEach((ln, i) => {
      for (const re of nets) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [net]`);
      for (const re of keys) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [key]`);
      if (bareRe && bareRe.test(ln)) hits.push(`${rel}:${String(i + 1)} [key-bare]`);
    });
  }
  return hits;
}
// KOYOMI-A A1-a (plan A1 r2, test 60, C-4 of its control): Koyomi's two roots. Both scan NET + the full KEY list + the bare key
// name (no Koyomi file names a paid key; the calibration inventory hands the whole env to readCashKeys of close.ts). The ops entry
// koyomi-stamp.mjs is written by lot A1-e: until it exists, its per-entry non-vacuity check waits for it (test 60).
const KOYOMI_SRC_ALLOW = new Map<string, string>();
const KOYOMI_OPS_ALLOW = new Map<string, string>([["apps/koyomi/ops/koyomi-stamp.mjs", "lot A1-e: the public keyless GET of commit.jsonl and of the OTS calendars, never a paid key"]]);
function koyomiSrcFiles(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  tsFiles(join(REPO, "apps/koyomi/src"), "apps/koyomi/src", out);
  return out;
}
function koyomiOpsFiles(): Array<[string, string]> {
  const dir = join(REPO, "apps/koyomi/ops");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort().map((n): [string, string] => [join(dir, n), `apps/koyomi/ops/${n}`]);
}
interface Root { name: string; scope: () => Array<[string, string]>; allow: Map<string, string>; hits: () => string[]; }
const ROOTS: readonly Root[] = [
  { name: "packages/*/src", scope: () => scopeFiles("packages"), allow: new Map([["packages/rpc-guard/src/transport.ts", "the private default transport (sole key reader + fetch site)"]]), hits: () => scan(scopeFiles("packages"), new Set(["packages/rpc-guard/src/transport.ts"])) },
  { name: "apps/bell/src", scope: () => scopeFiles("apps"), allow: BELL_ALLOW, hits: () => scan(scopeFiles("apps"), new Set(BELL_ALLOW.keys())) },
  { name: "apps/sentinel/src", scope: sentinelScope, allow: SENTINEL_ALLOW, hits: () => scan(sentinelScope(), new Set(SENTINEL_ALLOW.keys()), true) },
  { name: "scripts/census/u4-*.mjs", scope: u4Files, allow: U4_ALLOW, hits: () => scanWith(u4Files(), new Set(U4_ALLOW.keys()), NET, U4_KEY, U4_KEYNAME_RE) },
  { name: "apps/koyomi/src", scope: koyomiSrcFiles, allow: KOYOMI_SRC_ALLOW, hits: () => scan(koyomiSrcFiles(), new Set(KOYOMI_SRC_ALLOW.keys()), true) },
  { name: "apps/koyomi/ops/*.mjs", scope: koyomiOpsFiles, allow: KOYOMI_OPS_ALLOW, hits: () => scan(koyomiOpsFiles(), new Set(KOYOMI_OPS_ALLOW.keys()), true) },
];

test("rpc_guard_package_src_clean_and_allowlist_load_bearing", () => {
  const pkgFiles = scopeFiles("packages");
  assert.ok(pkgFiles.length > 5, `implausibly few package src files scanned (${String(pkgFiles.length)})`);
  // GREEN today: no forbidden pattern anywhere in packages/*\/src OUTSIDE the single allowlisted transport module.
  assert.deepEqual(scan(pkgFiles, ALLOWLIST), [], "a forbidden pattern appeared in packages/*/src outside the client transport");
  // Non-vacuity: the allowlisted module is a REAL hit site - emptying the allowlist reds it (allowlist is load-bearing).
  assert.ok(scan(pkgFiles, new Set()).length >= 1, "transport.ts must actually carry a fetch(/env.<key> so the allowlist is not vacuous");
});

// GARDE-HELIUS-2b-ii (R-B / C-1 / C-2) + NARABI-OPS-1d (scope WIDENED to apps/sentinel/src/**): the sentinel src
// is CLEAN and its allowlist (SENTINEL_ALLOW) is load-bearing PER ENTRY.
// killer: apps/sentinel/src/rpc.ts:17 CONST "const TOTAL_SUPPLY_SELECTOR" -> "void process.env.CHAINSTACK_ETH_URL; const TOTAL_SUPPLY_SELECTOR"
test("sentinel_src_clean_and_allowlist_load_bearing", () => {
  const files = sentinelScope();
  // Non-vacuity of SCOPE: >= 8 ukemi/*.ts AND the top-level daily job are scanned, so a mis-wired scope never
  // passes vacuously (a mutant "scope narrowed back to ukemi-only" reds via run.ts/keyless-transport.ts absence).
  const ukemiCount = files.filter(([, rel]) => rel.startsWith("apps/sentinel/src/ukemi/")).length;
  assert.ok(ukemiCount >= 8, `implausibly few ukemi/*.ts scanned (${String(ukemiCount)}); scope mis-wired`);
  for (const req of ["apps/sentinel/src/run.ts", "apps/sentinel/src/rpc.ts", "apps/sentinel/src/keyless-transport.ts", "apps/sentinel/src/timeline.ts", "apps/sentinel/src/windows.ts"]) {
    assert.ok(files.some(([, rel]) => rel === req), `${req} must be in the widened apps/sentinel/src/** scope (NARABI-OPS-1d)`);
  }
  // GREEN after migration: apps/sentinel/src/**, minus the allowlist, is 0 hit. A commented/coded fetch(/env.KEY in
  // ANY sentinel source (e.g. a "chainstackUrl read back into run.ts" or "keyless fetch inlined into run.ts" mutant)
  // reds this. bareKeys=true (C-R-b4): the BARE key name is also refused on this scope (kills the alias evasion
  // `e = env; e.KEY`; the one allowlisted file, keyless-transport.ts, is exempt for its legitimate fetch text).
  assert.deepEqual(scan(files, new Set(SENTINEL_ALLOW.keys()), true), [], "a forbidden network/paid-key pattern (or a bare paid-key name) exists in apps/sentinel/src/** outside the allowlist");
  // C-2 non-vacuity PER ENTRY: scanning EACH allowlisted file ALONE with an empty allowlist yields >= 1 hit. An
  // entry at 0 hit = its retraction trigger is reached => RED (mutant "allowlist widened/kept without a trigger";
  // the rpc.ts entry reached it at the section 11-1 fold, which deleted the dead fetch/env-read; it was retracted then).
  for (const [path, trigger] of SENTINEL_ALLOW) {
    const only = files.filter(([, rel]) => rel === path);
    assert.ok(only.length === 1, `allowlist entry '${path}' (trigger: ${trigger}) is not in scope (double guard)`);
    assert.ok(scan(only, new Set()).length >= 1, `allowlist entry '${path}' is VACANT (0 hit) - its retraction trigger (${trigger}) is reached; drop it`);
  }
  // Belt (C-1(c) + C-R-b4): the KEY regexes catch every ACCESS form - dot / optional-chain dot / bracket / optional-chain
  // bracket / template-literal bracket / `in` / destructuring / Reflect.get / Object.hasOwn. These are the 5 regex-able
  // evasions the validator probe p7 found; the 6th (the ALIAS form) is caught by the sentinel-scope bare-name scan (KEY_BARE).
  const accessForms = ['deps.env.CHAINSTACK_ETH_URL', 'deps.env?.CHAINSTACK_ETH_URL', 'deps.env["CHAINSTACK_ETH_URL"]', 'deps.env?.["CHAINSTACK_ETH_URL"]', `deps.env[${BT}CHAINSTACK_ETH_URL${BT}]`, '"CHAINSTACK_ETH_URL" in deps.env', 'const {CHAINSTACK_ETH_URL} = deps.env', 'Reflect.get(deps.env, "CHAINSTACK_ETH_URL")', 'Object.hasOwn(deps.env, "CHAINSTACK_ETH_URL")'];
  for (const f of accessForms) assert.ok(KEY.some((re) => re.test(f)), `the KEY regex must catch the access form: ${f}`);
  const alias = 'const e = deps.env; const u = e.CHAINSTACK_ETH_URL;';
  assert.ok(!KEY.some((re) => re.test(alias)), "the alias form evades every access regex (a regex cannot track a local env alias)");
  assert.ok(KEY_BARE.test(alias), "the sentinel-scope bare-name scan (KEY_BARE) refuses the alias form's bare key name - the 6th evasion");
});

// GARDE-HELIUS-1b-iii — the u4 course-scripts grep, FOLDED here from guard-scripts-u4.test.ts (unification; removed
// there, not duplicated). GREEN today (2b-iii migrated the scripts); killable (a re-introduced fetch/key/direct rpc
// import reds). scripts/census/u4-*.mjs is the only .mjs root; it carries the closed import-source list (C-R-6).
// killer: scripts/census/u4-redraw.mjs:23 CONST "ukemi/rpc2.ts" -> "rpc.ts"
test("u4_scripts_clean_and_import_sources_closed", () => {
  const u4 = ROOTS[3]!;
  const files = u4.scope();
  assert.ok(files.length >= 5, `expected >= 5 scripts/census/u4-*.mjs, got ${String(files.length)}`);
  for (const req of ["u4-oracle-path.mjs", "u4-redraw.mjs", "u4-guard.mjs"]) assert.ok(files.some(([, rel]) => rel === req), `${req} must be in scope`);
  assert.ok(!files.some(([, rel]) => rel === "u4-probe.mjs"), "u4-probe.mjs must be DELETED (dead after the 2b-ii merge)");
  assert.deepEqual(u4.hits(), [], "scripts/census/u4-*.mjs must be clean of fetch(/node:http/undici/child_process/paid-key");
  for (const [f, trigger] of U4_ALLOW) { // empty today; the per-entry non-vacuity form stays if a probe returns
    const only = files.filter(([, rel]) => rel === f);
    assert.ok(only.length === 1, `allowlisted ${f} (${trigger}) must be in scope`);
    assert.ok(scanWith(only, new Set(), NET, U4_KEY, U4_KEYNAME_RE).length >= 1, `allowlist entry ${f} is VACANT (${trigger})`);
  }
  // CLOSED import-source list for the three course files (C-R-6): a DIRECT import of apps/sentinel/src/rpc.ts (the
  // shared quorum pool, reachable only transitively via rpc2.ts/abi.ts) is forbidden.
  const ALLOWED_IMPORTS = new Set(["node:crypto", "node:fs", "node:path", "node:url", "@monark/rpc-guard", "../../apps/sentinel/src/ukemi/rpc2.ts", "../../apps/sentinel/src/ukemi/abi.ts", "../../apps/sentinel/src/ukemi/clusters.ts", "../../apps/sentinel/src/ukemi/resume.ts", "./u4-guard.mjs"]);
  for (const f of ["u4-oracle-path.mjs", "u4-redraw.mjs", "u4-guard.mjs"]) {
    const specs = [...readFileSync(join(CENSUS, f), "utf8").matchAll(/\bfrom\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]!);
    assert.ok(specs.length >= 3, `${f}: import scan is vacuous (${String(specs.length)})`);
    for (const spec of specs) assert.ok(ALLOWED_IMPORTS.has(spec), `${f} imports '${spec}', NOT in the closed allowed set (an import outside the closed list is forbidden)`);
  }
});

// GARDE-HELIUS-1b-iii — the Bell cash allowlist (close.ts) is load-bearing PER ENTRY + double guard. GREEN today.
test("bell_cash_allowlist_load_bearing", () => {
  const files = scopeFiles("apps");
  assert.ok(files.length >= 8, `implausibly few apps/bell/src/*.ts scanned (${String(files.length)})`);
  // C-6/C-2: each allowlisted cash file is IN scope AND alone yields >= 1 hit (it carries BOTH the paid GET and the key
  // read). A mutant "allowlist widened to a CLEAN bell file (e.g. gap.ts)" reds here (the clean entry is vacant); a
  // close.ts that stopped reading the key/fetch (migration away) would also red (its retraction trigger reached).
  for (const [path, trigger] of BELL_ALLOW) {
    const only = files.filter(([, rel]) => rel === path);
    assert.ok(only.length === 1, `bell allowlist entry '${path}' (${trigger}) is not in scope (double guard)`);
    assert.ok(scan(only, new Set()).length >= 1, `bell allowlist entry '${path}' is VACANT (0 hit); its retraction trigger (${trigger}) is reached`);
  }
});

// GARDE-HELIUS-1b-iii per-file (my files ACTIVE + green NOW, while the full-scope roots test stays red until 1b-i/1b-ii):
test("ethereum_ts_clean_of_fetch_and_keys", () => {
  const eth = scopeFiles("apps").filter(([, rel]) => rel === "apps/bell/src/ethereum.ts");
  assert.equal(eth.length, 1, "ethereum.ts must be in the bell scope");
  assert.deepEqual(scan(eth, new Set()), [], "ethereum.ts carries no fetch(/net/paid-key — the ETH leg is budgeted through @monark/rpc-guard (a 'bellEthCall restored' mutant reds)");
});
test("collect_ts_clean_of_paid_key_reads", () => {
  const col = scopeFiles("apps").filter(([, rel]) => rel === "apps/bell/src/collect.ts");
  assert.equal(col.length, 1, "collect.ts must be in the bell scope");
  // only the paid-KEY reads are 1b-iii's (moved to close.ts, C-6); collect.ts:284 [net] Solana fetch is 1b-ii's, not asserted here.
  assert.deepEqual(scan(col, new Set()).filter((h) => h.endsWith("[key]")), [], "collect.ts carries no env.<paid-key> read (moved to close.ts; a 'cash keys read back in collect.ts' mutant reds)");
});

// GARDE-HELIUS-1b-iii — the DE-SKIPPED full guarantee, UNIFIED over the roots list (packages + apps/bell/src + apps/sentinel/src +
// scripts/census/u4). RED in a DISJOINT 1b-iii worktree at 6114ce9: the universe-cli.ts hits (1b-i) and the
// collect.ts:284/rpc.ts hits (1b-ii) remain until those sub-lots merge — a DECLARED cross-lot dependency (0 residual is
// in 1b-iii's OWN files: ethereum.ts migrated, close.ts allowlisted, collect.ts key reads moved). GREEN only on the
// merged 1b tree; un-skipped (was: skip "until 1b") so the fusion is gated. "0 fail" and "de-skip" cannot BOTH hold for
// 1b-iii in isolation (plan inconsistency, error_origin: plan) — surfaced, never hidden by keeping the skip.
test("fetch_only_inside_client", () => {
  const hits = ROOTS.flatMap((r) => r.hits().map((h) => `${r.name} :: ${h}`));
  assert.deepEqual(hits, [], `a forbidden network/paid-key pattern exists outside the guard/allowlist (unified roots list):\n${hits.join("\n")}`);
});

// KOYOMI-A A1-a, test 60 (plan A1 r2 section 4, C-4 of its control): Koyomi's src and ops are roots of this scanner. The two roots are
// named in ROOTS and scan the files of the lot; the src allowlist is empty, the ops allowlist names koyomi-stamp.mjs alone (its
// non-vacuity is checked once lot A1-e writes it); both roots are clean. Killers named by the plan: a root removed from ROOTS (a
// test-file edit, red on the first assertion, checked by hand in the A1-a report), or a fetch( / a paid-key read added to
// label-read.ts or to calib-inventory.mjs (the killer line below, and its twin on calib-inventory.mjs checked by hand).
// killer: apps/koyomi/src/label-read.ts:49 CONST "await deps.databentoGet(" -> "await fetch("
test("koyomi_src_is_a_root_of_the_paid_fetch_scanner", () => {
  const src = ROOTS.find((r) => r.name === "apps/koyomi/src"), ops = ROOTS.find((r) => r.name === "apps/koyomi/ops/*.mjs");
  assert.ok(src !== undefined && ops !== undefined, "Koyomi's two roots are in ROOTS");
  assert.ok(src.scope().some(([, rel]) => rel === "apps/koyomi/src/label-read.ts"), "the label reader is scanned (apps/koyomi/src)");
  assert.ok(ops.scope().some(([, rel]) => rel === "apps/koyomi/ops/calib-inventory.mjs"), "the calibration inventory is scanned (apps/koyomi/ops/*.mjs)");
  assert.deepEqual([[...src.allow.keys()], [...ops.allow.keys()]], [[], ["apps/koyomi/ops/koyomi-stamp.mjs"]], "src allowlist empty; ops allowlist = koyomi-stamp.mjs alone");
  assert.deepEqual([...src.hits(), ...ops.hits()], [], "a fetch(, a network module or a paid-key read (any form, the bare name included) in Koyomi's src or ops");
  for (const [path, trigger] of ops.allow) {
    if (!existsSync(join(REPO, path))) continue; // lot A1-e writes it; from then on the entry must be in scope and non-vacant
    const only: Array<[string, string]> = ops.scope().filter(([, rel]) => rel === path);
    assert.equal(only.length, 1, `ops allowlist entry '${path}' (${trigger}) is not in scope (double guard)`);
    assert.ok(scan(only, new Set(), true).length >= 1, `ops allowlist entry '${path}' is VACANT (0 hit): drop it (${trigger})`);
  }
});

// The header comment of this file (its "appears in comments" sentence, l.21-22) cites the lines of the Bell sources that hold
// a bare paid-key name: the reason the bare name is NOT refused on the PACKAGES/BELL scopes. A citation goes stale when the
// sources move (at d65f31d1 the sentence cited rpc.ts:5-8 and universe.ts:43 while the names sat on rpc.ts:8 and
// universe.ts:322). Each cited line is reread here and must hold a name of KEY_NAMES (KEY_BARE is built from it). Shape held:
// ONE parenthesis of `<path>:<line>` items separated by commas, no range, no ellipsis; a path with no slash is read under
// apps/bell/src, one with a slash as written. The two killers take the bare name OFF a cited line: the citation is then stale.
// killer: apps/bell/src/rpc.ts:8 CONST "BELL_SOLANA_RPC" -> "the Solana RPC list"
// killer: apps/bell/src/universe.ts:322 CONST "BELL_SOLANA_RPC" -> "the Solana RPC list"
test("rpc_guard_scanner_comment_cites_lines_that_hold_a_bare_key_name", () => {
  const self = readFileSync(fileURLToPath(import.meta.url), "utf8");
  const needle = "appears in " + "comments: "; // split in two, so that this line is not itself a match of the sentence
  const cites = [...self.matchAll(new RegExp(`${needle}([^)]*)\\)`, "g"))].map((m) => m[1]!);
  assert.equal(cites.length, 1, `the header comment holds exactly one citing sentence (${String(cites.length)} found)`);
  const items = cites[0]!.split(",").map((s) => s.trim());
  assert.ok(items.length >= 2, `the citing sentence names at least two lines (${String(items.length)} item(s))`);
  const problems: string[] = [];
  for (const item of items) {
    const m = /^([\w./-]+):(\d+)$/.exec(item);
    if (m === null) { problems.push(`${item}: not a <path>:<line> citation`); continue; }
    const rel = m[1]!.includes("/") ? m[1]! : `apps/bell/src/${m[1]!}`, n = Number(m[2]), abs = join(REPO, rel);
    // Scope rule (after the first review): the sentence is about the PACKAGES/BELL scopes, so a cited path must sit under
    // apps/bell/src/ or packages/<name>/src/, with no `..` segment (a path that leaves the scopes, this file, a docs/ line: refused).
    if (rel.split("/").includes("..") || !/^(?:apps\/bell\/src|packages\/[\w.@-]+\/src)\/./.test(rel)) { problems.push(`${item}: ${rel} is outside the packages and Bell scopes the sentence is about`); continue; }
    if (!existsSync(abs)) { problems.push(`${item}: ${rel} is not a file`); continue; }
    const line = readFileSync(abs, "utf8").split(/\r?\n/)[n - 1];
    if (line === undefined) problems.push(`${item}: ${rel} has no line ${String(n)}`);
    else if (!KEY_BARE.test(line)) problems.push(`${item}: ${rel}:${String(n)} holds no bare name of KEY_NAMES`);
  }
  assert.deepEqual(problems, [], `stale citation(s) in the header comment of this file:\n${problems.join("\n")}`);
});
