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
 *   (e) `npm ci` then `npm run ci` INSIDE the export are BOTH exit 0 (the exported CI is green);
 *   (f) the exported .github/workflows/ci.yml is DERIVED (D7 bis R1): no `r25` at all (bare regex, =
 *       the `grep -c r25 = 0` oracle, subsumes the r25-taille-de-lot job), a `push` trigger under
 *       `on:`, >= 2 SHA-pinned actions, and no continue-on-error DIRECTIVE (YAML key; the prose
 *       "No continue-on-error" comment is allowed — mirrors test 38 in ci-gates.test.ts).
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

const ROOT = join(import.meta.dirname, "..");

interface ManifestEntry {
  path: string;
  sha256: string;
  bytes: number;
}
interface Manifest {
  files: ManifestEntry[];
  excluded_tests: string[];
}
interface ExcludeConfig {
  tests: string[];
}

// Mirrors scripts/export-public.mjs STRUCTURAL_BLACKLIST (POSIX rel paths).
const BLACKLIST: RegExp[] = [
  /^docs\/adr\//,
  /^docs\/G1-/, /^docs\/G2-/, /^docs\/G7-/,
  /^docs\/CHECKPOINT/,
  /^docs\/AUDIT-ENTREE\.md$/,
  /^docs\/JOURNAL-PROVENANCE\.md$/,
  /^docs\/R-P1-/,
  /(^|\/)docs\//, // any docs/ directory, incl. packages/*\/docs (hikae S2)
];

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

    // (c) language gate GREEN on root,contracts,schemas,site (throws if it exits 1 — how mutant M2 reds).
    //     The `schemas` scope (ADR-M001 D9-bis) gives the frozen schemas/ English-only teeth: French prose
    //     in a schema `description` reds the export here (annotation-erratum door-hole closure). The `site`
    //     scope (Lot F-public) does the same for a French string visible in an exported apps/site page.
    //     E-hikae/ukemi/atelier/monark stay ungated (still RED globally by design — docs/G1-lot-X.md).
    //     The `harness` scope (Lot H4, ADR-M005 Q-A) gives the now-exported apps/harness English-only teeth:
    //     a French word in an exported apps/harness .ts reds the export here.
    //     The `skills` scope (Lot M006-B, ADR-M006 D5) does the same for the now-exported skills/ artefacts:
    //     a French string in an exported SKILL.md/INTEGRATION.md reds the export here.
    execFileSync(
      process.execPath,
      [join(ROOT, "scripts", "lang-gate.mjs"), "--dir", out, "--scope", "root,contracts,schemas,site,harness,skills"],
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
    const runNpm = (cmd: string): SpawnSyncReturns<string> =>
      spawnSync(cmd, {
        cwd: out,
        env: childEnv,
        shell: true,
        stdio: "pipe",
        encoding: "utf8",
        timeout: 600_000,
        maxBuffer: 64 * 1024 * 1024,
      });

    const ci = runNpm("npm ci");
    assert.ok(
      !ci.error && ci.status === 0,
      `npm ci failed in export (status=${ci.status}, error=${ci.error?.message ?? "none"}):\n${String(ci.stderr ?? "").slice(-2000)}`,
    );

    const run = runNpm("npm run ci");
    const output = `${String(run.stdout ?? "")}\n${String(run.stderr ?? "")}`;
    const nTests = summaryCount(output, "tests");
    const nPass = summaryCount(output, "pass");
    const nFail = summaryCount(output, "fail");
    const summary =
      nTests === null ? output.split(/\r?\n/).slice(-30).join("\n") : `tests ${nTests} / pass ${nPass} / fail ${nFail}`;
    assert.ok(
      !run.error && run.status === 0,
      `exported CI (npm run ci) failed (status=${run.status}, error=${run.error?.message ?? "none"}): ${summary}`,
    );
    // Guard against a false-empty green (e.g. a broken whitelist that exports no tests).
    assert.ok(nTests !== null && nTests >= 70, `exported CI ran an implausibly small suite: ${summary}`);
  } finally {
    rmSync(out, { recursive: true, force: true });
    rmSync(src, { recursive: true, force: true });
  }
});
