/**
 * Root/CI guard `fetch_only_inside_client` (GARDE-HELIUS layer (ii), plan sect.6.1, T4). The single budgeted client
 * `@monark/rpc-guard` is the ONLY module in the declared scope allowed to carry a network call or read a paid
 * endpoint key; everywhere else in scope a `fetch(` / `node:http(s)` / `undici` / `child_process`, OR a
 * `env.<paid-key>` read, is REFUSED. This is layer (ii): "impossible by the repo" - a HELIUS-1-shaped draft that
 * enters the tree is caught here.
 *
 * DECLARED SCOPE (plan sect.6.1): apps/bell/src/** + packages/*\/src/**, EXCLUDING test/ (a legit spawn-with-env lives
 * in apps/bell/test/universe.test.ts:479). ALLOWLIST = EXACTLY ONE module: packages/rpc-guard/src/transport.ts (the
 * private transport). RETRACTION TRIGGER of that entry = the module's migration leaves 0 paid-key/fetch usage.
 * KEY form is `env.<KEY>` (an ACCESS), never the bare name - the bare names appear in comments outside the client
 * (rpc.ts:5-8, universe.ts:43, ...) and would red by construction.
 *
 * STATUS AT 1a (this sub-lot, package only): the apps are NOT migrated yet, so the FULL-scope guarantee is RED.
 * Per the delivery rule it is delivered SKIP-until-1b with the MEASURED hit list below (measured on base 514ee1a,
 * 2026-09-21, by this same scanner) - NEVER made green by widening the allowlist to cover the apps.
 *
 *   MEASURED HITS (14) - apps/bell/src only; packages/*\/src is already clean (0 outside the allowlist):
 *     [net fetch] close.ts:176, close.ts:191, collect.ts:284, ethereum.ts:64, rpc.ts:44,
 *                 universe-cli.ts:207, universe-cli.ts:221          (the 7 paid fetch( - migrate into the client at 1b)
 *     [key]       collect.ts:583 (POLYGON_API_KEY), collect.ts:584 (DATABENTO_API_KEY), rpc.ts:22 (BELL_SOLANA_RPC),
 *                 universe-cli.ts:109/237/251 (CHAINSTACK_SOLANA_URL)                    (6 paid-key reads - migrate at 1b)
 *     [finding]   universe-cli.ts:208 - a bare `undici` motif matches a COMMENT ("...undici returns the redirect...").
 *                 The 1b gate must ignore comments (or reword the line); reported as a formed item, not a code defect.
 *
 * The ACTIVE test below enforces the half that is GREEN today (packages/*\/src) and proves the allowlist is
 * load-bearing (transport.ts is a REAL hit site - emptying the allowlist reds it).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const ALLOWLIST = new Set<string>(["packages/rpc-guard/src/transport.ts"]);
const NET: ReadonlyArray<RegExp> = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/];
const KEY = /\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b/;

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
/** Hits = forbidden pattern on a scope file NOT in `allow`. Same scanner for both the active and the skipped test. */
function scan(files: ReadonlyArray<[string, string]>, allow: ReadonlySet<string>): string[] {
  const hits: string[] = [];
  for (const [abs, rel] of files) {
    if (allow.has(rel)) continue;
    readFileSync(abs, "utf8").split(/\r?\n/).forEach((ln, i) => {
      for (const re of NET) if (re.test(ln)) hits.push(`${rel}:${String(i + 1)} [net]`);
      if (KEY.test(ln)) hits.push(`${rel}:${String(i + 1)} [key]`);
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

// SKIP-until-1b: the FULL-scope guarantee. RED today (14 measured hits in apps/bell/src, listed in the header). It
// is NOT made green by widening the allowlist; un-skip when 1b migrates every paid fetch(/key read into the client.
test("fetch_only_inside_client", { skip: "until 1b: apps/bell/src paid fetch(/env.<key> migrate into @monark/rpc-guard (14 measured hits, see header)" }, () => {
  const files = [...scopeFiles("apps"), ...scopeFiles("packages")];
  assert.deepEqual(scan(files, ALLOWLIST), [], "a forbidden network/paid-key pattern exists outside the client");
});
