/**
 * GARDE-HELIUS-1b-i — per-file `apps/bell/src/**` grep guard (T4a). The FULL-scope root guard
 * `test/rpc-guard-fetch-only-inside-client.test.ts :: fetch_only_inside_client` stays SKIP until 1b-iii; this ACTIVE
 * per-file scan PROVES the 1b-i migration removed every paid `fetch(` / `env.<paid-key>` read (in ANY access form)
 * from the two files it migrated (universe-cli.ts, universe.ts) while the full scope is still RED. The forbidden
 * patterns are the SAME closed set as the root scanner (NET + KEY in 4+ forms + the access-form evasions), DUPLICATED
 * here so a drift in either reds. 1b-i CREATES this file (consigne commune §11); 1b-ii EXTENDS `CLEANED` with
 * collect.ts / rebase-crosscheck.ts / quorum.ts / rpc.ts, 1b-iii with ethereum.ts / close.ts (+ the cash module
 * allowlist) and then UNIFIES all grep tests + de-skips the full scope. Nothing here is skipped.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The apps/bell/src files MIGRATED by 1b-i and now proven CLEAN of a paid fetch(/env.<key>. 1b-ii/1b-iii add theirs.
const CLEANED = ["universe-cli.ts", "universe.ts"] as const;
const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const NET: ReadonlyArray<RegExp> = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/];
// The 6 paid endpoint keys, refused in EVERY access form (C-1(c) / C-R-b4): dot, optional-chain dot, bracket,
// optional-chain bracket, template-literal bracket, `in`, destructuring, Reflect.get, Object.hasOwn.
const KEY_NAMES = "CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY";
const BT = String.fromCharCode(96);           // a backtick, kept OUT of these template strings
const Q = `["'${BT}]`;                          // double, single OR template backtick (catches env[`KEY`])
const KEY: ReadonlyArray<RegExp> = [
  new RegExp(`\\benv\\??\\.(?:${KEY_NAMES})\\b`),                              // env.KEY, env?.KEY
  new RegExp(`\\benv(?:\\?\\.)?\\[\\s*${Q}(?:${KEY_NAMES})${Q}\\s*\\]`),        // env["KEY"], env?.["KEY"], env[`KEY`]
  new RegExp(`${Q}(?:${KEY_NAMES})${Q}\\s+in\\s+[\\w$.]*\\benv\\b`),            // "KEY" in env / in deps.env
  new RegExp(`\\{[^}]*\\b(?:${KEY_NAMES})\\b[^}]*\\}\\s*=\\s*[^;]*\\benv\\b`),   // const {KEY} = env / = deps.env
  new RegExp(`(?:Reflect\\.get|Object\\.hasOwn)\\(\\s*[\\w$.]*\\benv\\b\\s*,\\s*${Q}(?:${KEY_NAMES})${Q}`), // Reflect.get(env,"KEY")
];
/** Every line of one src file, comments included (a commented fetch(/env.KEY in a migrated source would red). */
function scan(file: string): string[] {
  const hits: string[] = [];
  readFileSync(SRC + file, "utf8").split(/\r?\n/).forEach((ln, i) => {
    for (const re of NET) if (re.test(ln)) hits.push(`${file}:${String(i + 1)} [net]`);
    for (const re of KEY) if (re.test(ln)) hits.push(`${file}:${String(i + 1)} [key]`);
  });
  return hits;
}
test("universe_src_clean_of_fetch_and_keys", () => {
  for (const f of CLEANED) {
    assert.ok(existsSync(SRC + f), `1b-i cleaned file present in apps/bell/src: ${f}`);
    assert.deepEqual(scan(f), [], `no paid fetch(/env.<key> remains in apps/bell/src/${f} (grep T4a, MUTANT: a fetch(/env.KEY re-added reds)`);
  }
  // Non-vacuity of the SCANNER (not the files): the SAME regexes DO catch every forbidden form on synthetic lines, so
  // a green scan means the files are clean, not that the scanner is inert.
  const netForms = ["  const r = fetch(x);", "await fetch (url)", 'import "node:http";', "require('undici')", "import cp from 'node:child_process'"];
  for (const s of netForms) assert.ok(NET.some((re) => re.test(s)), `NET regex catches: ${s}`);
  const keyForms = ["deps.env.CHAINSTACK_SOLANA_URL", "deps.env?.HELIUS_API_KEY", 'deps.env["POLYGON_API_KEY"]', 'deps.env?.["DATABENTO_API_KEY"]', `deps.env[${BT}BELL_SOLANA_RPC${BT}]`, '"CHAINSTACK_ETH_URL" in deps.env', "const {HELIUS_API_KEY} = deps.env", 'Reflect.get(deps.env, "POLYGON_API_KEY")', 'Object.hasOwn(deps.env, "DATABENTO_API_KEY")'];
  for (const s of keyForms) assert.ok(KEY.some((re) => re.test(s)), `KEY regex catches the access form: ${s}`);
});
