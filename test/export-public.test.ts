/**
 * Root test `export_public_no_governance_no_french` (test 42, ADR-M004 D7/D11, Lot X + D7 addendum +
 * D7 bis 2026-09-06). Non-LLM oracle over scripts/export-public.mjs + scripts/lang-gate.mjs: the public
 * storefront export must carry NO governance/provenance file and NO non-exempt French (in the scope
 * translated so far), must EXCLUDE the governance-only tests listed in scripts/export-exclude-tests.json,
 * and — assertion (e), D7 addendum — its own `npm ci && npm run ci` must be GREEN (CA-X "CI green
 * remotely", verified locally before any publication).
 *
 * D7 bis R2(a): the real export FAILS CLOSED on any absent required whitelist entry, and LICENSE is
 * absent (investor Q4 pending). So the test exports from a temporary WHOLE-TREE copy of the repo (+ a
 * placeholder LICENSE) and runs the COPIED script so REPO_ROOT resolves to the copy. A whole-tree copy
 * is required because collectFiles reads scripts/export-exclude-tests.json fail-closed and that file is
 * NOT whitelisted. The test asserts, in ONE test():
 *   (a) no structural-blacklist path (docs/adr, docs/G1-*, packages/*\/docs, ...) in the output;
 *   (b) EXPORT-MANIFEST.json is coherent — shape { files:[{path,sha256,bytes}], excluded_tests:[...] };
 *       every listed sha256+bytes recomputes exactly, the manifest does not list itself, every
 *       output file (bar the manifest) is listed, and excluded_tests EQUALS the committed config
 *       (config-relative, so mutant M4 below reds at (e), not here);
 *   (c) the language gate is GREEN on `--scope root,contracts,schemas,site` (E-root + E-contracts done +
 *       the frozen `schemas` scope, ADR-M001 D9-bis; apps/site is English-only, Lot F-public — a French
 *       string visible in a page, or in a frozen schema `description`, reds here);
 *   (d) packages/hikae/docs/ is absent (S2 reports excluded, D7) and the excluded tests are absent;
 *   (d bis) manifest.excluded_data EQUALS scripts/export-exclude-data.json and those orphan `upcoming` data
 *       files (the u4 fixtures) are absent from the output (ADR-M004 D7 septies);
 *   (e) `npm ci` then `npm run ci` INSIDE the export are BOTH exit 0 (the exported CI is green);
 *   (f) the exported .github/workflows/ci.yml is DERIVED (D7 bis R1): no `r25` at all (bare regex, =
 *       the `grep -c r25 = 0` oracle, subsumes the r25-taille-de-lot job), a `push` trigger under
 *       `on:`, >= 2 SHA-pinned actions, and no continue-on-error DIRECTIVE (YAML key; the prose
 *       "No continue-on-error" comment is allowed — mirrors test 38 in ci-gates.test.ts). ADR-PUBLIC-CADENCE-1 adds: no
 *       `secrets.<name>` in it, and no scripts/public-text-deny.* file in the export.
 *   (h) (Lot F-public) build output (.next/.turbo) and installed deps (node_modules) are NEVER exported
 *       into apps/site (WALK_SKIP_DIRS). Seeded in the source copy, asserted absent from the output.
 *       (Lettered (h), not (g): ADR-M004 D7 bis R4 already names 42(g) for the MINE-B assertion.)
 *
 * Named mutants (manual, docs/G1-lot-X.md, restored by file copy, sha256 before/after):
 *   M1  slip `docs/adr/ADR-M001*.md` into the whitelist  => export FAILS HARD => this test reds.
 *   M2  remove a frozen exemption (`octets_recalcules`) from lang-exempt.json => (c) reds.
 *   M3  (D7 addendum) drop the four packages/atelier/{index.html,main.js,style.css,serve.js} from
 *       the whitelist => atelier surface < 8 => atelier_no_network fails in the exported CI => (e) reds.
 *       (Dropping ONLY index.html leaves 8 >= 8 and stays green — see docs/G1-lot-X.md §addendum.)
 *   M4  (D7 addendum) empty `tests` in export-exclude-tests.json => s2.test.ts is exported =>
 *       s2_report_reproducible ENOENTs on the excluded S2 report => (e) reds.
 *   M5  (D7 bis R1) short-circuit derivePublicWorkflow (return the raw governance workflow) => the
 *       exported ci.yml keeps the r25 job and lacks `push` => (f) reds.
 *   M6  (D7 bis R4) slip `docs/JOURNAL-PROVENANCE.md` (a FRENCH governance file) into the whitelist =>
 *       the structural blacklist fires FIRST (before the French-.md rule) => export FAILS HARD => this
 *       test reds. Proves a governance file can never be silently masked by the language rule (MINE-B).
 *   M7  (Lot F-public) neuter the WALK_SKIP_DIRS skip in walkFiles (`if (false) continue;`) => a seeded
 *       (or real, from `next build`) apps/site/.next path is exported => the (h) build-output assertion reds.
 *
 * Run by `npm test` in each worktree (outside per-lot R-25 counting). Assertion (e) runs a real
 * `npm ci` (measured offline ~2 s in this repo) + the exported CI; keep it — do NOT skip even if
 * npm ci is slow (D7 addendum); log the measurement in G1 instead.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync, existsSync, cpSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, dirname } from "node:path";
import { createHash } from "node:crypto";
import { collectFiles, derivePublicWorkflow } from "../scripts/export-public.mjs";
import { innerFailures } from "./helpers/inner-failures.ts";
import { dropPendingSnapshot } from "./helpers/pending-snapshot.ts";

const ROOT = join(import.meta.dirname, "..");

interface ManifestEntry {
  path: string;
  sha256: string;
  bytes: number;
}
interface Manifest {
  files: ManifestEntry[];
  excluded_tests: string[];
  excluded_data: string[];
}
interface ExcludeConfig {
  tests: string[];
}
interface ExcludeDataConfig {
  data: string[];
}

// Mirrors scripts/export-public.mjs STRUCTURAL_BLACKLIST (POSIX rel paths), plus a catch-all over docs/ folders that the
// script does not carry (defense in depth: this mirror is stricter than the script, never looser).
const BLACKLIST: RegExp[] = [
  /^docs\/adr\//,
  /^docs\/G1-/, /^docs\/G2-/, /^docs\/G7-/,
  /^docs\/CHECKPOINT/,
  /^docs\/AUDIT-ENTREE\.md$/,
  /^docs\/JOURNAL-PROVENANCE\.md$/,
  /^docs\/R-P1-/,
  // Any docs/ directory, incl. packages/*\/docs (hikae S2), EXCEPT the two storefront folders of the /docs route: the page
  // tree apps/site/app/docs/ and its components apps/site/components/docs/ are public site content, exported like every
  // other route (the script's own STRUCTURAL_BLACKLIST names no catch-all). Any other docs/ folder, under apps/site too,
  // stays blacklisted. Pinned both ways by export_blacklist_keeps_governance_docs_and_lets_the_docs_route_ship below.
  /^(?!apps\/site\/(?:app|components)\/docs\/)(?:[^/]+\/)*docs\//,
];

test("export_blacklist_keeps_governance_docs_and_lets_the_docs_route_ship", () => {
  const blocked = (rel: string): boolean => BLACKLIST.some((re) => re.test(rel));
  // Governance and report folders stay blacklisted, wherever they sit.
  for (const rel of [
    "docs/adr/ADR-M001.md",
    "docs/G1-lot-site-docs-1.md",
    "docs/RUNBOOK-bell.md",
    "packages/hikae/docs/S2-RAPPORT.md",
    "apps/harness/docs/notes.md",
    "apps/site/docs/notes.md",
    "apps/site/app/docs-extra/docs/notes.md",
    "apps/site/lib/docs/notes.md",
  ]) {
    assert.ok(blocked(rel), `${rel} must stay blacklisted`);
  }
  // The storefront /docs route and its components ship.
  for (const rel of ["apps/site/app/docs/page.tsx", "apps/site/app/docs/pieces/hikae/page.tsx", "apps/site/app/docs/docs.css", "apps/site/components/docs/svg-kit.tsx", "apps/site/components/docs/schemas/gate.tsx"]) {
    assert.ok(!blocked(rel), `${rel} is storefront content and must ship`);
  }
});

function listFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const name of readdirSync(abs)) {
      const childAbs = join(abs, name);
      const childRel = rel ? `${rel}/${name}` : name;
      if (statSync(childAbs).isDirectory()) walk(childAbs, childRel);
      else out.push(childRel);
    }
  };
  walk(dir, "");
  return out;
}

const toPosix = (p: string): string => p.replace(/\\/g, "/");

/** node --test summary counter, tolerant of both the TAP `# k n` and spec `ℹ k n` prefixes. */
function summaryCount(output: string, key: string): number | null {
  const m = new RegExp(`[#\\u2139]\\s+${key}\\s+(\\d+)`).exec(output);
  return m ? Number(m[1]) : null;
}

test("export_public_no_governance_no_french — clean public export (test 42)", () => {
  // D7 bis R2(a): the real export FAILS CLOSED on an absent required whitelist entry, and LICENSE is
  // absent (investor Q4 pending). Export from a temporary WHOLE-TREE copy (+ placeholder LICENSE); run
  // the COPIED script so its REPO_ROOT resolves to the copy via import.meta.url. Whole-tree (not
  // surgical) because collectFiles reads scripts/export-exclude-tests.json fail-closed and it is NOT
  // whitelisted. Mutants M1/M5/M6 still bite: cpSync copies the (mutated) real script at test time.
  const src = mkdtempSync(join(tmpdir(), "monark-src-"));
  const out = mkdtempSync(join(tmpdir(), "monark-export-"));
  try {
    const skipSeg = new Set(["node_modules", ".git", "dist"]);
    cpSync(ROOT, src, {
      recursive: true,
      filter: (from: string): boolean => {
        const rel = toPosix(relative(ROOT, from));
        return rel === "" || !rel.split("/").some((seg) => skipSeg.has(seg));
      },
    });
    writeFileSync(
      join(src, "LICENSE"),
      "MONARK public export test fixture (not a real license). Real license = investor pending Q4, ADR-M004 D7 bis R2.\n",
    );
    // SITE-SEND-GUARD-MECH-1 (lot CM-3c-4a): --out refuses while a pending snapshot is in the tree; export it as promoted.
    dropPendingSnapshot(src);

    // Lot F-public: seed build-output / installed-deps dirs the export MUST NOT walk into apps/site
    // (WALK_SKIP_DIRS in export-public.mjs). cpSync's own filter skips node_modules, so inject these AFTER
    // the copy — this exercises the EXPORT's exclusion, not the copy's. Mutant (remove the WALK_SKIP_DIRS
    // skip in walkFiles) => a .next path is exported => the .next/.turbo/node_modules assertion below reds.
    // F-1 G2 O2 also seeds the generated (gitignored) next-env.d.ts, which the .gitignore-aware apps/site
    // filter must drop (deterministic regardless of whether `next build` ran in the developer tree).
    for (const [rel, body] of [
      ["apps/site/.next/BUILD_ID", "test"],
      ["apps/site/.turbo/cache.txt", "test"],
      ["apps/site/node_modules/junk/index.js", "export const x = true;\n"],
      ["apps/site/next-env.d.ts", '/// <reference types="next" />\n'],
    ] as const) {
      const abs = join(src, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, body);
    }

    // Run the export CLI from the copy (throws if it exits non-zero — that is how mutants M1/M6 red).
    execFileSync(process.execPath, [join(src, "scripts", "export-public.mjs"), "--out", out], {
      cwd: src,
      stdio: "pipe",
    });

    const files = listFiles(out);
    assert.ok(files.length >= 80, `implausibly small export: ${files.length} file(s)`);

    // (i) (Lot H4, Q-A / ADR-M005 D10/D16) apps/harness is exported PACKAGE-STYLE (src+test+package.json+
    // README.md), so KraidleAI/monark is reproducible e2e; the H4 HTTP/JSON mirror + OpenAPI ship, and no
    // whole-dir cruft (tsconfig) leaks. Its English is gated by adding `harness` to the lang scope at (c).
    // Mutant: drop "apps/harness" from APP_PACKAGE_DIRS in export-public.mjs ⇒ these files vanish ⇒ red.
    for (const rel of ["apps/harness/src/http.ts", "apps/harness/src/openapi.ts", "apps/harness/test/http.test.ts", "apps/harness/package.json"]) {
      assert.ok(files.includes(rel), `apps/harness export must include ${rel}`);
    }
    assert.ok(!files.includes("apps/harness/tsconfig.json"), "apps/harness/tsconfig.json must not be exported (package-style)");

    // (j) (ADR-M004 D7 octies, decision 156, EXPORT-BELL-1) MONARK Bell ships its signed publication chain FILE BY FILE:
    // the deployed tree, the third-party verifier and its committed public trust root. Mutant: drop the Bell block from
    // WHITELIST_FILES => these vanish => red. The collector does NOT ship (decision-69 names, reader-local paths): no
    // apps/bell/src or apps/bell/test path in the output. Mutant: whitelist "apps/bell" package-style => red here.
    for (const rel of ["apps/bell/scripts/bell-chain.mjs", "apps/bell/scripts/bell-publish.mjs", "apps/bell/scripts/bell-verify.mjs", "apps/bell/keys/bell-keyring.json", "apps/bell/package.json", "scripts/verify-bell.mjs"]) {
      assert.ok(files.includes(rel), `the Bell publication chain export must include ${rel}`);
    }
    const bellCollector = files.filter((f) => f.startsWith("apps/bell/src/") || f.startsWith("apps/bell/test/") || f === "apps/bell/scripts/bell-report.mjs");
    assert.deepEqual(bellCollector, [], "the Bell collector must not be exported until EXPORT-BELL-1-PURGE (ADR-M004 D7 octies)");
    // The public export omits deploy/ (ADR-NARABI-OPS-1c C3): the exported sentinel_budget_below_unit_timeout skips IFF deploy/
    // is absent and reds on a present deploy/ without its unit (measured on this lot: one Bell deploy/ file shipped => exported
    // CI 1 fail). Mutant: whitelist "deploy/Caddyfile.monark-bell" => red here, before (e).
    assert.deepEqual(files.filter((f) => f.startsWith("deploy/")), [], "no deploy/ file may be exported (ADR-NARABI-OPS-1c C3)");

    // (F-public) build output / installed deps are never exported (WALK_SKIP_DIRS). A leaked .next would
    // ship build artefacts into the public storefront; a leaked node_modules would bloat it. Mutant:
    // remove the WALK_SKIP_DIRS skip in export-public.mjs walkFiles => the seeded .next/.turbo leak here.
    for (const seg of [".next", ".turbo", "node_modules"]) {
      const leaked = files.find((f) => f.split("/").includes(seg));
      assert.ok(leaked === undefined, `export leaked a ${seg}/ path: ${leaked ?? ""}`);
    }

    // (O1, F-1 G2) apps/site/test/** is the honesty-lint DETECTOR — DORMANT in the public repo (nothing
    // exported imports it: its runner test/site-honesty.test.ts is at the repo root, not whitelisted). It
    // must not ship. The whole-tree copy above carries it, so this assertion has teeth.
    const dormantAppTest = files.find((f) => f.startsWith("apps/site/test/"));
    assert.ok(dormantAppTest === undefined, `export shipped a dormant apps/site test file: ${dormantAppTest ?? ""}`);
    assert.ok(!existsSync(join(out, "apps", "site", "test", "honesty-lint.ts")), "apps/site/test/honesty-lint.ts must be excluded (O1)");

    // (O2, F-1 G2) next-env.d.ts is generated (gitignored); the .gitignore-aware apps/site filter must
    // drop it (seeded above). A leaked generated declaration file would ship into the public storefront.
    const nextEnv = files.find((f) => f === "apps/site/next-env.d.ts");
    assert.ok(nextEnv === undefined, "generated apps/site/next-env.d.ts must be excluded from export (O2)");

    // (a) no structural-blacklist path in the output.
    for (const f of files) {
      for (const re of BLACKLIST) assert.ok(!re.test(f), `blacklisted path exported: ${f} (matched ${re})`);
    }

    // (d) packages/hikae/docs absent (S2 reports excluded, D7).
    assert.ok(!existsSync(join(out, "packages", "hikae", "docs")), "packages/hikae/docs must be absent");
    assert.ok(!files.some((f) => f.startsWith("packages/hikae/docs/")), "no packages/hikae/docs/* in output");

    // (b) manifest coherence — object shape { files, excluded_tests } (D7 addendum).
    const manifest = JSON.parse(readFileSync(join(out, "EXPORT-MANIFEST.json"), "utf8")) as Manifest;
    assert.ok(Array.isArray(manifest.files) && manifest.files.length >= 80, "manifest.files missing or too small");
    assert.ok(Array.isArray(manifest.excluded_tests), "manifest.excluded_tests missing");
    assert.ok(!manifest.files.some((e) => e.path === "EXPORT-MANIFEST.json"), "manifest must not list itself");
    for (const e of manifest.files) {
      const abs = join(out, e.path);
      assert.ok(existsSync(abs), `manifest lists a missing file: ${e.path}`);
      const buf = readFileSync(abs);
      assert.equal(createHash("sha256").update(buf).digest("hex"), e.sha256, `sha256 mismatch: ${e.path}`);
      assert.equal(buf.length, e.bytes, `bytes mismatch: ${e.path}`);
    }
    const listed = new Set(manifest.files.map((e) => e.path));
    for (const f of files) {
      if (f !== "EXPORT-MANIFEST.json") assert.ok(listed.has(f), `output file absent from manifest: ${f}`);
    }

    // (d cont.) governance-only test exclusion is CONFIG-RELATIVE (D7 addendum): compare against the
    // committed scripts/export-exclude-tests.json instead of hard-coding s2.test.ts, so mutant M4
    // (empty `tests`) reds at (e) via ENOENT, NOT here.
    const cfg = JSON.parse(readFileSync(join(ROOT, "scripts", "export-exclude-tests.json"), "utf8")) as ExcludeConfig;
    const expectedExcluded = [...cfg.tests].map(toPosix).sort();
    assert.deepEqual([...manifest.excluded_tests].sort(), expectedExcluded, "excluded_tests must equal the committed config");
    for (const t of expectedExcluded) {
      assert.ok(!existsSync(join(out, t)), `excluded test still present in output: ${t}`);
      assert.ok(!listed.has(t), `excluded test listed in manifest.files: ${t}`);
    }

    // (d bis) orphan-data exclusion is CONFIG-RELATIVE too (D7 septies): manifest.excluded_data == the committed
    // scripts/export-exclude-data.json, and none of those files reach the output. The deeper safety conditions
    // (no excluded datum keeps an exported consumer; no excluded test leaves an orphan) live in export-hygiene.test.ts.
    const dataCfg = JSON.parse(readFileSync(join(ROOT, "scripts", "export-exclude-data.json"), "utf8")) as ExcludeDataConfig;
    const expectedExcludedData = [...dataCfg.data].map(toPosix).sort();
    assert.ok(Array.isArray(manifest.excluded_data), "manifest.excluded_data missing");
    assert.deepEqual([...manifest.excluded_data].sort(), expectedExcludedData, "excluded_data must equal the committed config");
    for (const d of expectedExcludedData) {
      assert.ok(!existsSync(join(out, d)), `excluded datum still present in output: ${d}`);
      assert.ok(!listed.has(d), `excluded datum listed in manifest.files: ${d}`);
    }

    // (f) the exported workflow is DERIVED, not copied verbatim (D7 bis R1 / mutant M5): no r25 at all
    //     (bare, = the `grep -c r25 = 0` oracle, subsumes the r25-taille-de-lot job), a `push` trigger
    //     under `on:`, >= 2 SHA-pinned actions, and no continue-on-error DIRECTIVE (a YAML key; the prose
    //     "No continue-on-error" comment is allowed — mirrors test 38 in ci-gates.test.ts).
    const ciYml = readFileSync(join(out, ".github", "workflows", "ci.yml"), "utf8");
    assert.ok(!/r25/.test(ciYml), "exported workflow must contain no r25 reference (D7 bis R1; grep -c r25 = 0)");
    assert.ok(
      ciYml.replace(/\r\n/g, "\n").includes("on:\n  push:\n  pull_request:"),
      "exported workflow must trigger on push under on: (D7 bis R1)",
    );
    const ciLines = ciYml.split(/\r?\n/);
    assert.ok(
      !ciLines.some((l) => /^\s*continue-on-error\s*:/.test(l)),
      "exported workflow must carry no continue-on-error directive (blocking gates)",
    );
    const pinnedShas = new Set<string>();
    for (const l of ciLines) {
      if (/^\s*#/.test(l)) continue;
      const m = /uses:\s*\S+@([0-9a-f]{40})\b/.exec(l);
      const sha = m?.[1];
      if (sha) pinnedShas.add(sha);
    }
    assert.ok(pinnedShas.size >= 2, `exported workflow must keep >= 2 SHA-pinned actions (found ${pinnedShas.size})`);
    // (f, ADR-PUBLIC-CADENCE-1 PR-A1) the derived workflow references no secret (PUBLIC-WORKFLOW-NO-SECRETS-1, CA-4.2, mutant
    //     M4-a), and the vendor lists of the public-text gate never ship (CA-1.5, mutant M1-n).
    assert.ok(!/\bsecrets\.[A-Za-z_]/.test(ciYml), "exported workflow must reference no secrets.<name>");
    assert.deepEqual(files.filter((f) => f.startsWith("scripts/public-text-deny.")), [], "scripts/public-text-deny.* must not be exported");

    // (c) language gate GREEN on root,contracts,schemas,site (throws if it exits 1 — how mutant M2 reds).
    //     The `schemas` scope (ADR-M001 D9-bis) gives the frozen schemas/ English-only teeth: French prose
    //     in a schema `description` reds the export here (annotation-erratum door-hole closure). The `site`
    //     scope (Lot F-public) does the same for a French string visible in an exported apps/site page.
    //     E-hikae/ukemi/atelier/monark stay ungated (still RED globally by design — docs/G1-lot-X.md).
    //     The `harness` scope (Lot H4, ADR-M005 Q-A) gives the now-exported apps/harness English-only teeth:
    //     a French word in an exported apps/harness .ts reds the export here.
    //     The `skills` scope (Lot M006-B, ADR-M006 D5) does the same for the now-exported skills/ artefacts:
    //     a French string in an exported SKILL.md/INTEGRATION.md reds the export here.
    //     The `sentinel` scope (C-11 i, ADR-EC) gives the now-exported apps/sentinel (APP_PACKAGE_DIRS)
    //     English-only teeth on the export. The `bell` scope (ADR-M004 D7 octies) does the same for the exported
    //     Bell publication chain (apps/bell/scripts + keys + package.json).
    execFileSync(
      process.execPath,
      [join(ROOT, "scripts", "lang-gate.mjs"), "--dir", out, "--scope", "root,contracts,schemas,site,harness,skills,sentinel,bell"],
      { cwd: ROOT, stdio: "pipe" },
    );

    // (c-bis) C-11 i (ADR-EC): only the Bell publication chain is exported (ADR-M004 D7 octies); the collector
    //     (apps/bell/src, apps/bell/test) is NOT, so gating it on the EXPORT `out` alone would be a false-green for
    //     it. Its gate is the repo SOURCE tree: run lang-gate on ROOT with --scope sentinel,bell and assert
    //     green, so a French token in apps/bell/src (or apps/sentinel/src) reds CI here.
    execFileSync(
      process.execPath,
      [join(ROOT, "scripts", "lang-gate.mjs"), "--scope", "sentinel,bell"],
      { cwd: ROOT, stdio: "pipe" },
    );

    // (e) the exported repo's OWN CI must be green (CA-X, D7 addendum): `npm ci` then `npm run ci`
    // inside the export. shell:true resolves npm.cmd on Windows; generous timeout; do NOT skip.
    // Strip NODE_TEST_* from the child env: node --test propagates NODE_TEST_CONTEXT to subprocesses,
    // and a nested `node --test` that inherits it SKIPS running files ("called recursively"), which
    // would make the exported CI a false green. Removing it lets the nested CI run for real.
    const childEnv: NodeJS.ProcessEnv = { ...process.env };
    for (const k of Object.keys(childEnv)) if (k.startsWith("NODE_TEST_")) delete childEnv[k];
    // Fixed literal commands passed as a single string (no args array) so shell:true does not trip
    // DEP0190; nothing here is interpolated from untrusted input.
    // Per-command bound (EXPORT-CI-TIMEOUT-BOUND-1, decision (a) of 2026-10-01): `npm ci` keeps 600 s; `npm run ci` gets 1800 s,
    // 1.8x the worst estimated demand. Measurement report sha256 a1330724d64c619139628b7bc83ef31b5117a7844ff63681bd0755457cb6069a
    // (F:/tmp/dojo/insp1/t42/RAPPORT.md on 2026-10-01): exported CI 175-200 s at rest, ETIMEDOUT at 600 s once under oracle load,
    // worst demand estimated at 750-1000 s (fsync-bound apps/sentinel/test/ukemi-conc.test.ts under host I/O contention); npm ci 18-23 s.
    const runNpm = (cmd: string, timeoutMs: number): SpawnSyncReturns<string> =>
      spawnSync(cmd, {
        cwd: out,
        env: childEnv,
        shell: true,
        stdio: "pipe",
        encoding: "utf8",
        timeout: timeoutMs,
        maxBuffer: 64 * 1024 * 1024,
      });

    const ci = runNpm("npm ci", 600_000);
    assert.ok(
      !ci.error && ci.status === 0,
      `npm ci failed in export (status=${ci.status}, error=${ci.error?.message ?? "none"}):\n${String(ci.stderr ?? "").slice(-2000)}`,
    );

    const run = runNpm("npm run ci", 1_800_000);
    const output = `${String(run.stdout ?? "")}\n${String(run.stderr ?? "")}`;
    const nTests = summaryCount(output, "tests");
    const nPass = summaryCount(output, "pass");
    const nFail = summaryCount(output, "fail");
    const summary =
      nTests === null ? output.split(/\r?\n/).slice(-30).join("\n") : `tests ${nTests} / pass ${nPass} / fail ${nFail}`;
    // EXPORT-TEST42-INNER-NAMES-1, EXPORT-HARNESS-413-LOAD-1: name the failing inner tests, each with the text of its failing
    // assertion (test/helpers/inner-failures.ts), so an intermittent failure is attributable from this report alone.
    const failing = innerFailures(output);
    assert.ok(
      !run.error && run.status === 0,
      `exported CI (npm run ci) failed (status=${run.status}, error=${run.error?.message ?? "none"}): ${summary}`
        + (failing.length > 0 ? `\nfailing:\n${failing.join("\n")}` : ""),
    );
    // Guard against a false-empty green (e.g. a broken whitelist that exports no tests).
    assert.ok(nTests !== null && nTests >= 70, `exported CI ran an implausibly small suite: ${summary}`);
  } finally {
    // win32 under load (antivirus scan of the fresh export): rmSync can EPERM transiently -> bounded retries
    // (EXPORT-TEST42-EPERM-1, 3 occurrences 2026-09-23); the assertions above are unchanged.
    // Cleanup is best-effort: the assertions above are the gate; a transient win32 lock (EPERM/EBUSY, antivirus scan
    // of the fresh export under load, measured > 60 s on 2026-09-23) must not redden it. EXPORT-TEST42-EPERM-1.
    for (const d of [out, src]) {
      try { rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }); }
      catch (e) { console.warn(`export-public test: cleanup left ${d} (${(e as NodeJS.ErrnoException).code ?? String(e)})`); }
    }
  }
});

// Extract every job body (the 2-space job key line through the line before the next job key) with the STRICT
// key regex — the same one ci_jobs_have_timeout uses. Deliberately NOT /^ {2}\S/: an ORPHANED r25 body left by
// a bad derivation is absorbed into a neighbour's body (never a spurious key), which is exactly what (f') must
// catch.
function jobBodies(text: string): Map<string, string[]> {
  const lines = text.split(/\r?\n/);
  const jobsIdx = lines.findIndex((l) => /^jobs\s*:/.test(l));
  const out = new Map<string, string[]>();
  if (jobsIdx === -1) return out;
  const keys: { name: string; start: number }[] = [];
  for (let i = jobsIdx + 1; i < lines.length; i++) {
    const l = lines[i]!;
    if (/^\S/.test(l) && !/^\s*#/.test(l)) break; // a column-0 non-comment key ends the jobs block
    const m = /^  ([A-Za-z0-9_-]+)\s*:\s*$/.exec(l);
    if (m && m[1]) keys.push({ name: m[1], start: i });
  }
  for (let j = 0; j < keys.length; j++) {
    const end = j + 1 < keys.length ? keys[j + 1]!.start : lines.length;
    out.set(keys[j]!.name, lines.slice(keys[j]!.start, end));
  }
  return out;
}

// -- L-4 / C-3 : the derived public workflow keeps every RETAINED job body byte-identical (test 42(f'); D7 ter). The dropped jobs
// are a CLOSED list (CI-G3-DURATION-1 adds g3-export, which runs the never-exported root test/): each must exist in the source.
// killer: scripts/export-public.mjs:427 CONST ", \"g3-export\"]" -> "]"
test("export_public_derived_jobs_are_byte_identical — every retained job body survives derivation unchanged (test 42(f'), ADR-M004 D7 ter amended)", () => {
  const governance = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const eol = governance.includes("\r\n") ? "\r\n" : "\n";
  const derived = derivePublicWorkflow(governance);
  const R25 = "r25-taille-de-lot";
  const INTERNAL = new Set([R25, "g3-export"]); // the closed list derivePublicWorkflow drops (CI-G3-DURATION-1)
  for (const name of INTERNAL) {
    assert.ok(jobBodies(governance).has(name), `internal job '${name}' missing from the source workflow (non-vacuity of the dropped list)`);
    assert.ok(!jobBodies(derived).has(name), `internal job '${name}' must be dropped from the derived public workflow`);
  }

  // Mismatches between the retained governance job bodies and the derived job bodies (job set + line-by-line).
  const mismatches = (govText: string, derText: string): string[] => {
    const gov = jobBodies(govText);
    const der = jobBodies(derText);
    const retained = [...gov.keys()].filter((k) => !INTERNAL.has(k)).sort();
    const out: string[] = [];
    if (JSON.stringify([...der.keys()].sort()) !== JSON.stringify(retained))
      out.push(`job set: derived {${[...der.keys()].sort().join(",")}} != retained {${retained.join(",")}}`);
    for (const name of retained) if (JSON.stringify(gov.get(name)) !== JSON.stringify(der.get(name))) out.push(`job '${name}' body differs after derivation`);
    return out;
  };

  // Non-vacuity: >= 5 retained jobs (g1, g3-verification, g4, g6, g3-site) — the "job set == {…}" invariant of
  // 42 is too weak; D7 ter (amended: ALL retained bodies, not just g1/g3/g4/g6) demands byte-identity.
  const retainedCount = [...jobBodies(governance).keys()].filter((k) => !INTERNAL.has(k)).length;
  assert.ok(retainedCount >= 5, `expected >= 5 retained jobs, saw ${retainedCount}`);

  // (f') the real derivation preserves every retained job body byte-for-byte (modulo EOL, which derive keeps).
  assert.deepEqual(mismatches(governance, derived), [], "a retained job body changed under derivePublicWorkflow (42(f'))");

  // Mutant M-42f' (D7 ter, finding 13): a col-2 INDENTED comment inside the r25 body stops the splice (/^ {2}\S/
  // matches it) => only the r25 KEY is removed => the r25 body orphan is ABSORBED into the derived g1 body =>
  // (f') reds. Bare `/r25/` (test 42(f)) stays GREEN (the orphan carries only "R-25", case-sensitive), so 42(f)
  // alone MISSES this — which is why (f') exists.
  const mutant = governance.replace(`  ${R25}:${eol}`, `  ${R25}:${eol}  # injected indented comment${eol}`);
  assert.notEqual(mutant, governance, "mutant injection must change the source");
  const mutantDerived = derivePublicWorkflow(mutant);
  assert.ok(mismatches(mutant, mutantDerived).length > 0, "M-42f': an indented comment in r25 must red 42(f') (orphan absorbed into a retained body)");
  assert.ok(!/r25/.test(mutantDerived), "M-42f' control: bare /r25/ (test 42(f)) stays green on the mutant — it MISSES the corruption");

  // Mutant (single-byte corruption of a RETAINED body) => (f') reds — the class D7 ter closes ("a corrupted
  // job body", not only "a lost job"). Simulated on the derived text (a derivation that mangles a kept job).
  const corrupted = derived.replace("npm run lint && npm run lint:ratchet", "npm run lint &&  npm run lint:ratchet");
  assert.notEqual(corrupted, derived, "byte-corruption must change the derived text");
  assert.ok(mismatches(governance, corrupted).length > 0, "M-42f' (byte): a single-byte change in a retained job body must red 42(f')");
});

// -- ADR-M004 D7 nonies (item DOJO-EXPORT-VERIFIER-1): the Dojo ships its reader's verifier FILE BY FILE and nothing else of apps/dojo.
// The closure is WALKED here from the public command, never typed: static imports (every relative `from`/`import` specifier, plus the
// .d.mts type surface of each .mjs); any dynamic import or require is refused, fail closed (G2P-1: an `import(`, a `require(` or a
// `createRequire` in a closure file reds). A new static import of the verifier reds until the whitelist names it, and any other
// apps/dojo file in the export reds.
// killer: scripts/export-public.mjs:118 CONST "apps/dojo/keys/dojo-keyring.json" -> "apps/dojo/scripts/dojo-seed.mjs"
test("export_dojo_ships_the_verifier_closure_only — the export carries the import closure of apps/dojo/scripts/dojo-verify-cli.mjs, its public keyring and its manifest, nothing else of apps/dojo (ADR-M004 D7 nonies)", () => {
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  const closure = new Set<string>();
  const loaders: string[] = []; // run-time loads found in closure files: refused, fail closed (G2P-1)
  const LOADER = /\bimport\s*\(|\brequire\s*\(|\bcreateRequire\b/g;
  const stack = ["apps/dojo/scripts/dojo-verify-cli.mjs"];
  for (let f = stack.pop(); f !== undefined; f = stack.pop()) {
    if (closure.has(f)) continue;
    closure.add(f);
    const text = readFileSync(join(ROOT, f), "utf8");
    for (const m of text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)) {
      const spec = m[1] ?? "";
      if (spec.startsWith(".")) stack.push(toPosix(join(dirname(f), spec)));
    }
    for (const m of text.matchAll(LOADER)) loaders.push(`${f}: ${m[0]}`);
    const side = f.replace(/\.mjs$/, ".d.mts");
    if (side !== f && existsSync(join(ROOT, side))) stack.push(side);
  }
  // Non-vacuity: the walk reaches the verifier's core, the walker, a type surface and Bell's chain (measured closure: 10 files).
  for (const f of ["apps/dojo/scripts/dojo-verify.mjs", "apps/dojo/scripts/dojo-chain.mjs", "apps/dojo/scripts/dojo-core.d.mts", "apps/bell/scripts/bell-chain.mjs"]) {
    assert.ok(closure.has(f), `the walk must reach ${f}`);
  }
  // (1) every file of the closure ships, Bell's bell-chain included: the exported command loads.
  assert.deepEqual([...closure].filter((f) => !kept.has(f)).sort(), [], "a file of the verifier's import closure is missing from the export");
  // (2) apps/dojo ships exactly the closure, the public keyring (--keyring) and the manifest: no collector, publisher, seed tool or test.
  const expected = [...[...closure].filter((f) => f.startsWith("apps/dojo/")), "apps/dojo/keys/dojo-keyring.json", "apps/dojo/package.json"].sort();
  assert.deepEqual([...kept].filter((f) => f.startsWith("apps/dojo/")).sort(), expected, "apps/dojo exports exactly the verifier's closure, its keyring and its manifest");
  // (3) the deployment conformity check and the other governance Dojo scripts stay out (their imports reach unexported files).
  assert.deepEqual([...kept].filter((f) => /^scripts\/[^/]*dojo/.test(f)), [], "no scripts/*dojo* file is exported");
  // (4) the walk sees static imports only, so a run-time load in a closure file reds, fail closed (G2P-1; probes ME5 and ME6 of the
  // part's G2). Non-vacuity: the pattern catches each of the three forms.
  for (const form of ["import(\"./x.mjs\")", "require(\"./x.cjs\")", "createRequire(import.meta.url)"]) assert.equal([...form.matchAll(LOADER)].length, 1, `the loader pattern must catch ${form}`);
  assert.deepEqual(loaders, [], "a file of the verifier's closure loads a module at run time (import(), require() or createRequire): refused");
});
