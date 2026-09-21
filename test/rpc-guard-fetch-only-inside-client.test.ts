/**
 * Root/CI guard `fetch_only_inside_client` (GARDE-HELIUS layer (ii), plan sect.6.1, T4). The single budgeted client
 * `@monark/rpc-guard` is the ONLY module in the declared scope allowed to carry a network call or read a paid
 * endpoint key; everywhere else in scope a `fetch(` / `node:http(s)` / `undici` / `child_process`, OR a
 * `env.<paid-key>` read (in ANY form: dot, bracket, `in`, destructuring - C-1(c)), is REFUSED. Layer (ii):
 * "impossible by the repo" - a HELIUS-1-shaped draft that enters the tree is caught here.
 *
 * DECLARED SCOPE:
 *   - packages/*\/src/** (GREEN today; allowlist = packages/rpc-guard/src/transport.ts, the private transport).
 *   - apps/sentinel/src/ukemi/** UNION apps/sentinel/src/rpc.ts (GARDE-HELIUS-2b-ii R-B; GREEN after the recorder
 *     migration removed record.ts's fetch(/env read). Allowlist = apps/sentinel/src/rpc.ts, RETRACTION TRIGGER =
 *     NARABI-OPS-1d (the daily Narabi job migrates rpc.ts under the guard). run.ts/timeline.ts enter scope at -1d.
 *   - apps/bell/src/** stays RED (SKIP-until-1b) - its paid fetch(/key reads migrate at GARDE-HELIUS-1b.
 * KEY form is an ACCESS (`env.<KEY>`, `env["<KEY>"]`, `"<KEY>" in ...env`, `{...<KEY>...} = ...env`), never the bare name -
 * the bare names appear in comments (rpc.ts:5-8, universe.ts:43, ...) and would red by construction.
 *
 * MEASURED HITS (apps/bell/src only, base e7f22b8, measured 2026-09-21 by this scanner = 14 total):
 *     [net]  close.ts:176, close.ts:191, collect.ts:284, ethereum.ts:64, rpc.ts:44, universe-cli.ts:267/268/281  (8 fetch(, migrate at 1b)
 *     [key]  collect.ts:582 (POLYGON_API_KEY), collect.ts:583 (DATABENTO_API_KEY), rpc.ts:22 (BELL_SOLANA_RPC),
 *            universe-cli.ts:111/297/312 (CHAINSTACK_SOLANA_URL)  (6 paid-key DOT reads, migrate at 1b)
 *     (the extended bracket/in/destructuring KEY forms add 0 hits in apps/bell/src - all its key reads are dot form: re-measured.)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const ALLOWLIST = new Set<string>(["packages/rpc-guard/src/transport.ts"]);
const NET: ReadonlyArray<RegExp> = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/];
// The 6 paid endpoint keys. A read is REFUSED in EVERY access form (C-1(c), M-16): a `\benv\.KEY\b`-only motif MISSED
// `env["KEY"]`, `"KEY" in env`, and `const {KEY}=env` - the exact forms a "is chainstack requested?" probe would use.
const KEY_NAMES = "CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY";
const KEY: ReadonlyArray<RegExp> = [
  new RegExp(`\\benv\\.(?:${KEY_NAMES})\\b`),                       // env.KEY
  new RegExp(`\\benv\\[\\s*["'](?:${KEY_NAMES})["']\\s*\\]`),       // env["KEY"]
  new RegExp(`["'](?:${KEY_NAMES})["']\\s+in\\s+[\\w$.]*\\benv\\b`), // "KEY" in env / in deps.env
  new RegExp(`\\{[^}]*\\b(?:${KEY_NAMES})\\b[^}]*\\}\\s*=\\s*[^;]*\\benv\\b`), // const {KEY} = env / = deps.env
];

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
/** R-B scope: apps/sentinel/src/ukemi/**.ts UNION apps/sentinel/src/rpc.ts. rpc.ts is scanned (in scope) AND
 *  allowlisted (trigger -1d) - the double guard: the allowlist entry must correspond to a file actually in scope. */
function ukemiScope(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  tsFiles(join(REPO, "apps/sentinel/src/ukemi"), "apps/sentinel/src/ukemi", out);
  const rpcAbs = join(REPO, "apps/sentinel/src/rpc.ts");
  if (existsSync(rpcAbs)) out.push([rpcAbs, "apps/sentinel/src/rpc.ts"]);
  return out;
}
/** Hits = a forbidden pattern (net OR key, any form) on a scope file NOT in `allow`. Reads EVERY line, comments
 *  included (a commented `fetch(`/`env.KEY` in a migrated source would red - so the migrated code carries none). */
function scan(files: ReadonlyArray<[string, string]>, allow: ReadonlySet<string>): string[] {
  const hits: string[] = [];
  for (const [abs, rel] of files) {
    if (allow.has(rel)) continue;
    readFileSync(abs, "utf8").split(/\r?\n/).forEach((ln, i) => {
      for (const re of NET) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [net]`);
      for (const re of KEY) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [key]`);
    });
  }
  return hits;
}

test("rpc_guard_package_src_clean_and_allowlist_load_bearing", () => {
  const pkgFiles = scopeFiles("packages");
  assert.ok(pkgFiles.length > 5, `implausibly few package src files scanned (${String(pkgFiles.length)})`);
  // GREEN today: no forbidden pattern anywhere in packages/*\/src OUTSIDE the single allowlisted transport module.
  assert.deepEqual(scan(pkgFiles, ALLOWLIST), [], "a forbidden pattern appeared in packages/*/src outside the client transport");
  // Non-vacuity: the allowlisted module is a REAL hit site - emptying the allowlist reds it (allowlist is load-bearing).
  assert.ok(scan(pkgFiles, new Set()).length >= 1, "transport.ts must actually carry a fetch(/env.<key> so the allowlist is not vacuous");
});

// GARDE-HELIUS-2b-ii (R-B / C-1 / C-2): the recorder scope is CLEAN and its allowlist is load-bearing PER ENTRY.
test("ukemi_src_clean_and_allowlist_load_bearing", () => {
  const files = ukemiScope();
  // Non-vacuity of SCOPE (M-13): >= 8 ukemi/*.ts scanned, so a mis-wired scope never passes vacuously.
  const ukemiCount = files.filter(([, rel]) => rel.startsWith("apps/sentinel/src/ukemi/")).length;
  assert.ok(ukemiCount >= 8, `implausibly few ukemi/*.ts scanned (${String(ukemiCount)}); scope mis-wired`);
  // The allowlist is a Map<path, retraction-trigger> (a bare Set hid the trigger). ONE entry today: rpc.ts (-1d).
  const ALLOW = new Map<string, string>([["apps/sentinel/src/rpc.ts", "NARABI-OPS-1d: the daily Narabi job's rpc.ts migrates under the guard"]]);
  // GREEN after migration: ukemi/** UNION rpc.ts, minus the allowlist, is 0 hit. A commented/coded fetch(/env.KEY in a
  // ukemi source (e.g. the "makeDefaultCall restored" / "key read by brackets" mutants) reds this.
  assert.deepEqual(scan(files, new Set(ALLOW.keys())), [], "a forbidden network/paid-key pattern exists in ukemi/** outside the allowlist");
  // C-2 non-vacuity PER ENTRY: scanning EACH allowlisted file ALONE with an empty allowlist yields >= 1 hit. An entry
  // at 0 hit = its retraction trigger is reached => RED (mutant "allowlist widened without a trigger").
  for (const [path, trigger] of ALLOW) {
    const only = files.filter(([, rel]) => rel === path);
    assert.ok(only.length === 1, `allowlist entry '${path}' (trigger: ${trigger}) is not in scope (mutant "rpc.ts removed from scope" => this reds - double guard)`);
    assert.ok(scan(only, new Set()).length >= 1, `allowlist entry '${path}' is VACANT (0 hit) - its retraction trigger (${trigger}) is reached; drop it`);
  }
  // Belt (C-1(c)): the KEY regex covers EVERY access form - a bracket / `in` / destructuring key read cannot survive.
  const forms = ['deps.env.CHAINSTACK_ETH_URL', 'deps.env["CHAINSTACK_ETH_URL"]', '"CHAINSTACK_ETH_URL" in deps.env', 'const {CHAINSTACK_ETH_URL} = deps.env'];
  for (const f of forms) assert.ok(KEY.some((re) => re.test(f)), `the KEY regex must catch the access form: ${f}`);
});

// SKIP-until-1b: the FULL apps/bell/src guarantee. RED today (measured hits in the header). NOT made green by widening
// the allowlist; un-skip when 1b migrates every paid fetch(/key read into the client.
test("fetch_only_inside_client", { skip: "until 1b: apps/bell/src paid fetch(/env.<key> migrate into @monark/rpc-guard (see header)" }, () => {
  const files = [...scopeFiles("apps"), ...scopeFiles("packages")];
  assert.deepEqual(scan(files, ALLOWLIST), [], "a forbidden network/paid-key pattern exists outside the client");
});
