/**
 * Root test `ci_gates_blocking_no_continue_on_error` (test 38, ADR-M003 D11, Lot V).
 * Non-LLM oracle over the instantiated workflow `.github/workflows/ci.yml`: it MUST stay
 * blocking end-to-end and pinned. The test reads the file as text (no `act` run
 * required, D1) and fails if:
 *   (1) a `continue-on-error` DIRECTIVE appears (a job would stop being blocking);
 *   (1bis) an `if:` DIRECTIVE appears on any job or step (SIBLING of (1)): a SKIPPED required check
 *      (e.g. `if: false`) counts as PASSING on GitHub, so a stray `if:` silently unblocks a gate. Both (1)
 *      and (1bis) detect the key behind a list dash (`- if:`), quotes (`"if":`), or a flow mapping
 *      (`{ if: … }`) — not only at line-start (checkpoint-2 C2-1/C2-6); a prose mention in a `#` comment stays
 *      allowed. Block-scoped sibling for g3-site in g3_site_builds_then_asserts_fleet_html.
 *   (2) a `uses:` action is not pinned by a 40-hex commit SHA (movable tag);
 *   (3) `VIBEGATES_PR_LIMIT` != "1205" (bound ADR-M003 D9);
 *   (3bis) `VIBEGATES_CONTENT_LIMIT` != "8000", or the ADR-M013 line that holds the CONTENT list (investor decision
 *      207) is not unique or does not state that bound;
 *   (4) the exclusion pathspec for generated S2 artefacts is missing from the R-25 count;
 *   (4quater) the r25 job does not run exactly two one-line counts: CODE = the D9 pathspec PLUS the five ADR-M013
 *      CONTENT excludes (bound VIBEGATES_PR_LIMIT), CONTENT = those five paths only (bound VIBEGATES_CONTENT_LIMIT),
 *      each with a numeric guard before any diff, the same ins+del metric, printed before either bound is evaluated,
 *      and `::error::` + exit 1 on overflow (ADR-M013 amendment 2026-09-24, investor decision 207);
 *   (5) the `on:` trigger does not carry `pull_request` (delivery by PR — ADR-M003 D9 addendum 2026-09-05);
 *   (6) job g4 does not run the ratchet `npm run lint:ratchet` (ADR-M003 D9 ter §3, 2026-09-06).
 *   (4bis) the G1/G2 governance reports are not excluded from the R-25 count (D9 quater);
 *   (7) job g4 does not literally carry `run: npm run lint && npm run lint:ratchet` (D9 quater).
 * Named mutant (G2 review): `continue-on-error: true` inserted => red; byte-exact
 * restoration (sha256 before/after) recorded in docs/G1-lot-V.md. Checkpoint-2 (C2-1/C2-6): the widened
 * detectors also red on `- if:`/`"if":`/`{ if: … }` and `'continue-on-error':`/`- continue-on-error:`.
 * Run by `npm test` in each worktree (outside per-lot counting).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { gitOut, tracked } from "./helpers/git-tracked.ts";
import { join, extname, dirname, basename } from "node:path";
import ts from "typescript";
import { compilePatterns, scanText, collectTargets } from "../scripts/grep-forbidden.mjs";
import { collectFiles, derivePublicWorkflow, CI_WORKFLOW_PATH } from "../scripts/export-public.mjs";
import { renderedTexts, scanText as scanNumericText, loadExemptFile, scanAppsSite } from "../apps/site/test/honesty-lint.ts";
import { FLEET_AGENTS, PRODUCTS } from "../apps/site/lib/fleet.ts";
import type { FleetStatus, FleetWiring } from "../apps/site/lib/fleet.ts";
import type { AgentStatus } from "../apps/site/lib/status.ts";
import { DOJO_REGISTER, holdSnapshotStatus, type DojoRegister, type DojoServedPath } from "../apps/site/lib/dojo-register.ts";
import { loadDojoServed } from "../apps/site/lib/dojo-served-load.ts";
import { loadGateEnums } from "../apps/site/lib/gate-enums.ts";
import { REGISTRY_DECL, REGISTRY_ROOT, registryRootProblems } from "../scripts/registry-root.mjs";
import { ACTION_COMMIT, ACTION_DEFER, ACTION_ABSTAIN, SENSOR_NODES, AMBIENT, decide, fresh, CAVEAT, gateJson, push } from "../apps/site/lib/sim.ts";
import { AGENTS_PRESENTATION } from "../apps/site/lib/agents-presentation.ts";
import { PICKER_PROFILES } from "../apps/site/lib/profiles.ts";
import { OUTCOMES, REGION_KINDS, REASON_GLOSS } from "../apps/site/lib/how-copy.ts";

const ROOT = join(import.meta.dirname, "..");
const WF = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
const LINES = WF.split(/\r?\n/);

// `if:` / `continue-on-error:` KEY detectors (checkpoint-2 C2-1/C2-6). No YAML parser is a repo dependency
// (verified 2026-09-20: absent from every package.json and from node_modules), and none may be added; so these
// are the robust TEXT detectors, hardened past a naive `/^\s*if\s*:/` that ancres the key at line-start only. A
// key escapes that naive form behind a list dash (`- if:`), quotes (`"if":`/`'if':`), or inside a flow mapping
// (`{ if: false }`, `{ …, if: false }`). Here a key-position OPENER is line-start+indent OR one of `- { ,`; the
// token must be EXACTLY `if`/`continue-on-error` (optionally quoted) immediately followed by `:`, so the r25
// shell `if [ … ]` and the g6 `if-no-files-found:` are NOT directives (measured green in the controls below).
// The proposed checkpoint-2 form `^\s*(?:-\s+)?["']?if["']?\s*:` was EXTENDED to the `{ ,` openers because it
// does NOT match a flow-mapping `{ if: … }` — a required-red mutant (measured: proposed matched=false on it).
// Asserted forms (exact list, ADR-M003 D9 octies): block key (any indent); first key of a list item (`- key:`);
// quoted key (`"key":`/`'key':`, with or without dash); flow mapping (`{ key: … }` / `{ …, key: … }`). Declared
// residuals (no parser, NOT claimed): an explicit-key `? if` / `: false` split across two lines is not caught by
// a single-line scan; a `, if:` substring inside a quoted string on a NON-comment code line would false-RED
// (fail-closed-safe — resolvable by the formed item for a legitimate `if:`).
const IF_DIRECTIVE_RE = /(?:^\s*|[-{,]\s*)["']?if["']?\s*:/;
const COE_DIRECTIVE_RE = /(?:^\s*|[-{,]\s*)["']?continue-on-error["']?\s*:/;
// A prose mention in a COMMENT is allowed (test 38 (1) promise; the template writes "No continue-on-error"). Skip
// full-comment lines (`^\s*#`, the idiom of the `uses:` loop) before applying a detector, so a comment that
// quotes `- if: false` to name a mutant never reds. (The g3-site block test strips inline comments separately.)
const hasDirective = (lines: string[], re: RegExp): boolean =>
  lines.some((l) => !/^\s*#/.test(l) && re.test(l));

// ADR-M013 amendment 2026-09-24 (investor decision 207, lot R25-CONTENT-1): the R-25 bound of 1205 stays the CODE
// bound; the storefront CONTENT lots are counted apart under VIBEGATES_CONTENT_LIMIT. The CONTENT paths are a CLOSED
// list held by the ADR itself: read here from its UNIQUE line naming `VIBEGATES_CONTENT_LIMIT` (never a parallel
// hand-kept list), so the ADR, the five CODE excludes and the five CONTENT pathspecs of the r25 job are coupled (test
// 38 (4quater)); the same derived list whitelists the CODE excludes from the series set-equality
// (series_pinned_are_declared_and_hashed). A second ADR line naming the variable (a later revision) makes the source
// ambiguous: test 38 (3bis) reds until this anchor is updated. Root test/ is never exported (export-public.mjs
// WHITELIST), so reading docs/adr/ here cannot reach the public mirror.
const CONTENT_ADR_LINES = readFileSync(join(ROOT, "docs", "adr", "ADR-M013-vitrine-regimes.md"), "utf8")
  .split(/\r?\n/)
  .filter((l) => l.includes("`VIBEGATES_CONTENT_LIMIT`"));
const CONTENT_ADR_LINE = CONTENT_ADR_LINES.length === 1 ? (CONTENT_ADR_LINES[0] ?? "") : "";
const CONTENT_PATHS = [...CONTENT_ADR_LINE.matchAll(/`(apps\/site\/[^`\s]+)`/g)]
  .map((m) => m[1])
  .filter((s): s is string => s !== undefined);
const CONTENT_CODE_EXCLUDES = CONTENT_PATHS.map((p) => `:(exclude,glob)${p}`);
const CONTENT_PATHSPECS = CONTENT_PATHS.map((p) => `:(glob)${p}`);

// One r25 count line `NAME=$(git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- <pathspecs>) || {` ->
// { name, pathspecs } (single quotes removed); null for any other shape. Test 38 (4quater) also counts every
// `git diff` code line, so an unparsed shape reds instead of escaping.
const R25_DIFF_RE = /^\s*([A-Z_]+)=\$\(git diff --shortstat "origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD" -- (.+)\) \|\| \{\s*$/;
function parseR25Diff(line: string): { name: string; pathspecs: string[] } | null {
  const m = R25_DIFF_RE.exec(line);
  if (m === null || m[1] === undefined || m[2] === undefined) return null;
  return { name: m[1], pathspecs: m[2].split(/\s+/).map((t) => t.replace(/^'(.*)'$/, "$1")) };
}
// One r25 metric line `NAME=$(printf '%s\n' "$SRC" | awk '<program>')` -> { name, src, program }; null otherwise.
// `\x5c` is a literal backslash: the workflow carries the two characters backslash + n inside '%s\n'.
const R25_METRIC_RE = /^\s*([A-Z_]+)=\$\(printf '%s\x5cn' "\$([A-Z_]+)" \| awk '(.+)'\)\s*$/;
function parseR25Metric(line: string): { name: string; src: string; program: string } | null {
  const m = R25_METRIC_RE.exec(line);
  if (m === null || m[1] === undefined || m[2] === undefined || m[3] === undefined) return null;
  return { name: m[1], src: m[2], program: m[3] };
}

test("ci_gates_blocking_no_continue_on_error — blocking and pinned workflow (test 38)", () => {
  // (1) template invariant: no continue-on-error DIRECTIVE (a YAML key on a non-comment line). A prose mention
  //     in a comment is allowed (the template itself writes "No continue-on-error"); it is the
  //     `continue-on-error:` key that would unblock a job. Widened at checkpoint-2 (C2-6) to catch the key
  //     behind a list dash or quotes (`- continue-on-error:`, `'continue-on-error':`) via COE_DIRECTIVE_RE.
  const coeDirective = hasDirective(LINES, COE_DIRECTIVE_RE);
  assert.ok(!coeDirective, "continue-on-error directive present: a job would stop being blocking");

  // (1bis) SIBLING of (1): no `if:` DIRECTIVE on any job or step (block-scoped absence is also asserted for
  //   g3-site in g3_site_builds_then_asserts_fleet_html). The header invariant is "EVERY job is BLOCKING"; a
  //   conditional job/step is not. This is WORSE than continue-on-error: a required check that is SKIPPED
  //   (e.g. `if: false`) counts as PASSING on GitHub, so a stray `if:` silently unblocks a gate. Checkpoint-2
  //   (C2-1): the pli-G2 form `/^\s*if\s*:/` ancred the key at line-start and let THREE idiomatic forms through
  //   (`- if:` behind a list dash, `"if":` quoted, `{ if: … }` in a flow mapping — found by the validator).
  //   IF_DIRECTIVE_RE catches all three; hasDirective skips `#` comment lines so prose stays allowed. No job
  //   carries `if:` today; a future conditional job needs an ADR that updates this line (formed item, PLI §8).
  const ifDirective = hasDirective(LINES, IF_DIRECTIVE_RE);
  assert.ok(!ifDirective, "an `if:` directive is present: a conditional/SKIPPED required check counts as PASSING on GitHub (silent unblock); EVERY job must be unconditionally BLOCKING");
  // Discriminating controls. GREEN (not directives): the r25 shell `if [ … ]`, the g6 `if-no-files-found:`, the
  // word `if` inside a step name, and a PROSE mention in a `#` comment (tested through the COMPOSED detector
  // `hasDirective` — the very function (1)/(1bis) call — which locks the "comment allowed" promise).
  assert.ok(!IF_DIRECTIVE_RE.test('          if [ "$CHANGED" -gt "$VIBEGATES_PR_LIMIT" ]; then'), "control: a shell `if [ ... ]` is not an `if:` directive");
  assert.ok(!IF_DIRECTIVE_RE.test("          if-no-files-found: error"), "control: `if-no-files-found:` is not an `if:` directive");
  assert.ok(!IF_DIRECTIVE_RE.test("      - name: build if ready"), "control: the word `if` inside a step name is not an `if:` directive");
  assert.ok(!hasDirective(["      # mutant note: `- if: false` on a step would red"], IF_DIRECTIVE_RE), "control: an `if:` quoted in a # comment stays allowed (test 38 (1) promise)");
  assert.ok(!hasDirective(["      # prose: `- continue-on-error: true` is banned"], COE_DIRECTIVE_RE), "control: a continue-on-error quoted in a # comment stays allowed");
  // RED (directives that MUST be caught): line-start, expr, list dash, quoted key, flow mapping, dash+quote
  // (checkpoint-2 C2-1 + a worker mutant `- "if":` and a not-first flow key `{ …, if: … }`).
  for (const red of ["        if: false", "    if: ${{ false }}", "      - if: false", '      "if": false', "      - { if: false, run: echo skip }", "      - { run: echo skip, if: false }", '      - "if": false']) {
    assert.ok(IF_DIRECTIVE_RE.test(red), `control: \`${red.trim()}\` IS an if: directive (must be caught)`);
  }
  for (const red of ["        continue-on-error: true", "        'continue-on-error': true", "      - continue-on-error: true"]) {
    assert.ok(COE_DIRECTIVE_RE.test(red), `control: \`${red.trim()}\` IS a continue-on-error directive (must be caught)`);
  }
  // Measured control (NOT a spec claim about YAML): a tab-indented key is caught regardless of YAML's stance on
  // tabs. Case is case-SENSITIVE by design — `IF:` / `CONTINUE-ON-ERROR:` are different YAML keys and are NOT claimed.
  assert.ok(IF_DIRECTIVE_RE.test("\tif: false"), "control (measured): a tab-indented `if:` is caught regardless of YAML's stance on tabs");

  // (2) every `uses:` action pinned by a 40-hex commit SHA (comment lines ignored).
  const usesRefs: string[] = [];
  for (const l of LINES) {
    if (/^\s*#/.test(l)) continue;
    const m = /^\s*-?\s*uses:\s*(\S+)/.exec(l);
    if (m && m[1]) usesRefs.push(m[1]);
  }
  assert.ok(usesRefs.length >= 2, `expected at least 2 uses: actions, saw ${usesRefs.length}`);
  for (const u of usesRefs) {
    const at = u.lastIndexOf("@");
    assert.notEqual(at, -1, `uses: not pinned (no @): ${u}`);
    const ref = u.slice(at + 1);
    assert.match(ref, /^[0-9a-f]{40}$/, `uses: not pinned by a 40-hex commit SHA: ${u}`);
  }

  // (3) VIBEGATES_PR_LIMIT set to "1205" (ADR-M003 D9) — and to nothing else.
  const limits: string[] = [];
  for (const m of WF.matchAll(/VIBEGATES_PR_LIMIT\s*:\s*["']?([^"'\s#]+)["']?/g)) {
    if (m[1]) limits.push(m[1]);
  }
  assert.ok(limits.length >= 1, "VIBEGATES_PR_LIMIT missing from the workflow (fail-closed not configured)");
  for (const v of limits) assert.equal(v, "1205", `VIBEGATES_PR_LIMIT = ${v} != 1205 (ADR-M003 D9)`);

  // (3bis) VIBEGATES_CONTENT_LIMIT set to "8000" (ADR-M013 amendment 2026-09-24, investor decision 207) — and to
  //        nothing else (the (3) idiom). The ADR holds exactly ONE line naming the variable (the coupling source of
  //        (4quater)) and that line states the same bound (digit groups joined, "8 000" -> 8000), so a bound edited on
  //        one side only reds (R-23: a revision goes through the ADR). Mutant `"8k"` in the env => this reds.
  const contentLimits = [...WF.matchAll(/VIBEGATES_CONTENT_LIMIT\s*:\s*["']?([^"'\s#]+)["']?/g)]
    .map((m) => m[1])
    .filter((s): s is string => s !== undefined);
  assert.ok(contentLimits.length >= 1, "VIBEGATES_CONTENT_LIMIT missing from the workflow (content bound not configured, ADR-M013 decision 207)");
  for (const v of contentLimits) assert.equal(v, "8000", `VIBEGATES_CONTENT_LIMIT = ${v} != 8000 (ADR-M013, investor decision 207)`);
  assert.equal(
    CONTENT_ADR_LINES.length,
    1,
    "ADR-M013 must hold exactly ONE line naming `VIBEGATES_CONTENT_LIMIT` (the decision 207 amendment, source of the CONTENT list)",
  );
  const adrNumbers: readonly string[] = CONTENT_ADR_LINE.replace(/(\d)[ \u00a0\u202f](?=\d{3}(?!\d))/g, "$1").match(/\d+/g) ?? [];
  assert.ok(adrNumbers.includes("8000"), "the ADR-M013 decision 207 line must state the 8000 bound the workflow carries (R-23)");

  // (4) exclusion pathspec for generated S2 artefacts present in the R-25 count (ADR-M003 D9).
  assert.ok(
    WF.includes(":(exclude)packages/*/docs/S2-*"),
    "S2 exclusion pathspec missing from the R-25 count (lot H would overflow because of the TSV journal)",
  );
  // (4bis) G1/G2 governance reports excluded from the R-25 count (ADR-M003 D9 quater, 2026-09-06:
  //        measured 1311 > 1205 with the reports, 621 code only).
  for (const ps of [":(exclude)docs/G1-lot-*.md", ":(exclude)docs/G2-lot-*.md"]) {
    assert.ok(WF.includes(ps), `pathspec ${ps} missing from the R-25 count (ADR-M003 D9 quater)`);
  }
  // (4ter) governance docs under docs/ excluded from the R-25 count (ADR-M003 D9 septies, 2026-09-19,
  //        investisseur 25: the integration PR is mostly docs — R-25 protects CODE review; docs are reviewed
  //        by the checkpoints). The .md-only :(glob) pathspec keeps code/tests/schemas/scripts AND docs/**/*.mjs
  //        counted. Matched WITH its single quotes (D9 sexies G2 C1: a bare includes is substring-fragile).
  //        It subsumes (4bis) but (4bis) is kept for the D9 quater invariant. Mutant: drop it ⇒ this reds.
  assert.ok(
    WF.includes("':(exclude,glob)docs/**/*.md'"),
    "docs/**/*.md exclusion pathspec missing from the R-25 count (ADR-M003 D9 septies)",
  );

  // (4quater) ADR-M013 amendment 2026-09-24 (investor decision 207, lot R25-CONTENT-1): the r25 job runs exactly TWO
  //   `git diff --shortstat` counts over the same range, each on ONE line. (a) CODE `STAT=` = the pathspec of (4)/
  //   (4bis)/(4ter) + the lockfile + the series excludes PLUS the five CONTENT excludes, bound VIBEGATES_PR_LIMIT;
  //   (b) CONTENT `CONTENT_STAT=` = the five CONTENT paths only, bound VIBEGATES_CONTENT_LIMIT. The token lists are
  //   EXACT (a dropped, extra or duplicated pathspec reds) and both derive from the ADR list, which must be five
  //   distinct paths (the decision). Each count: a numeric guard BEFORE any diff, the SAME ins+del awk program, printed
  //   BEFORE either bound is evaluated (a CODE overflow never hides the CONTENT count), and `::error::` + `exit 1` on
  //   overflow. Mutants: a CONTENT path dropped from (b), from (a) or from the ADR line => red; `exit 1` removed from
  //   an overflow branch => red.
  const r25At = LINES.findIndex((l) => /^  r25-taille-de-lot\s*:/.test(l));
  assert.notEqual(r25At, -1, "job 'r25-taille-de-lot' missing from the workflow");
  const r25Code: string[] = []; // non-comment, non-blank lines of the r25 job, trimmed
  for (let i = r25At + 1; i < LINES.length; i++) {
    const l = LINES[i] ?? "";
    if (/^  \S/.test(l) || /^\S/.test(l)) break; // next 2-space job key or a column-0 key
    if (!/^\s*#/.test(l) && l.trim() !== "") r25Code.push(l.trim());
  }
  assert.equal(
    r25Code.filter((l) => l.includes("git diff")).length,
    2,
    "the r25 job must run exactly two `git diff` counts: CODE and CONTENT (ADR-M013 decision 207)",
  );
  const diffs = r25Code.map(parseR25Diff).filter((d): d is { name: string; pathspecs: string[] } => d !== null);
  assert.deepEqual(
    diffs.map((d) => d.name),
    ["STAT", "CONTENT_STAT"],
    "the r25 counts must be, in order, CODE `STAT=` and CONTENT `CONTENT_STAT=`, each on ONE line over origin/<base>...HEAD",
  );
  assert.equal(CONTENT_PATHS.length, 5, `ADR-M013 decision 207 names five CONTENT paths; read ${CONTENT_PATHS.length}: ${CONTENT_PATHS.join(", ")}`);
  assert.equal(new Set(CONTENT_PATHS).size, CONTENT_PATHS.length, "the ADR-M013 CONTENT paths must be distinct");
  const sorted = (xs: readonly string[]): string[] => [...xs].sort();
  const codeExpected = [
    ".",
    ":(exclude)packages/*/docs/S2-*",
    ":(exclude)docs/G1-lot-*.md",
    ":(exclude)docs/G2-lot-*.md",
    ":(exclude,glob)docs/**/*.md",
    ":(exclude)package-lock.json",
    ...SERIES_EXCLUDE_PATHSPECS,
    ...CONTENT_CODE_EXCLUDES,
  ];
  assert.deepEqual(
    sorted(diffs[0]?.pathspecs ?? []),
    sorted(codeExpected),
    "(a) the CODE pathspec must be the D9 pathspec PLUS the five ADR-M013 CONTENT excludes (dropped, extra or duplicated token)",
  );
  assert.deepEqual(
    sorted(diffs[1]?.pathspecs ?? []),
    sorted(CONTENT_PATHSPECS),
    "(b) the CONTENT pathspec must be exactly the five ADR-M013 CONTENT paths with :(glob) magic (dropped, extra or duplicated token)",
  );
  const metrics = r25Code
    .map(parseR25Metric)
    .filter((m): m is { name: string; src: string; program: string } => m !== null);
  assert.deepEqual(
    metrics.map((m) => `${m.name}<-${m.src}`),
    ["CHANGED<-STAT", "CONTENT_CHANGED<-CONTENT_STAT"],
    "each count must feed its own metric line: CHANGED from STAT, CONTENT_CHANGED from CONTENT_STAT",
  );
  assert.ok(metrics[0]?.program.includes("print ins+del+0"), "the CODE metric must stay ins+del (ADR-M003 D9)");
  assert.equal(metrics[1]?.program, metrics[0]?.program, "both counts must use the SAME ins+del awk program");
  const statAt = r25Code.findIndex((l) => l.startsWith("STAT=$(git diff"));
  const firstIfAt = r25Code.findIndex((l) => l.startsWith("if [ "));
  const between = (open: string, close: string): { at: number; body: string[] } => {
    const at = r25Code.indexOf(open);
    const end = at === -1 ? -1 : r25Code.indexOf(close, at + 1);
    return { at, body: end === -1 ? [] : r25Code.slice(at + 1, end) };
  };
  for (const [count, bound] of [
    ["CHANGED", "VIBEGATES_PR_LIMIT"],
    ["CONTENT_CHANGED", "VIBEGATES_CONTENT_LIMIT"],
  ] as const) {
    const guard = between(`case "$${bound}" in`, "esac");
    assert.ok(guard.at !== -1 && guard.at < statAt, `${bound}: numeric guard missing or placed after the first diff (fail-closed before any count)`);
    assert.equal(guard.body[0], "''|*[!0-9]*)", `${bound}: the guard must reject an empty or non-numeric bound`);
    assert.ok(
      guard.body.some((l) => l.startsWith("echo '::error::")) && guard.body.includes("exit 1 ;;"),
      `${bound}: an empty or non-numeric bound must emit ::error:: and exit 1`,
    );
    const printAt = r25Code.findIndex((l) => l.startsWith("echo ") && l.includes(`$${count} (ADR bound: $${bound})`));
    assert.ok(printAt !== -1 && printAt < firstIfAt, `${count}: the count must be printed BEFORE either bound is evaluated`);
    const overflow = between(`if [ "$${count}" -gt "$${bound}" ]; then`, "fi");
    assert.notEqual(overflow.at, -1, `${count}: the overflow comparison against ${bound} is missing`);
    assert.ok(
      overflow.body.some((l) => l.startsWith('echo "::error::')) && overflow.body.includes("exit 1"),
      `${count} > ${bound} must emit ::error:: and exit 1 (fail-closed)`,
    );
  }

  // (5) delivery by PR (ADR-M003 D9 addendum 2026-09-05, option c): the workflow MUST trigger
  //     on pull_request. Block-scoped on the top-level key `on:` (lines indented up to the
  //     next column-0 key), end-of-line comments stripped: the header comment that
  //     cites "pull_request" must NOT mask a mutant that removes the real trigger.
  const onIdx = LINES.findIndex((l) => /^on\s*:/.test(l));
  assert.notEqual(onIdx, -1, "top-level key 'on:' missing from the workflow");
  const onBlock = [LINES[onIdx]!.replace(/#.*$/, "")];
  for (let i = onIdx + 1; i < LINES.length; i++) {
    if (/^\S/.test(LINES[i]!) && !/^\s*#/.test(LINES[i]!)) break; // next top-level key
    onBlock.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    onBlock.join("\n"),
    /\bpull_request\b/,
    "the workflow must trigger on pull_request (delivery by PR; ADR-M003 D9 addendum)",
  );

  // (6) the test-debt ratchet (lint:ratchet) is wired INSIDE job g4 (ADR-M003 D9 ter §3).
  //     Block-scoped on the job key `g4-architecture:` (2-space indent), end-of-line
  //     comments stripped: moving `lint:ratchet` out of g4 (another job) or into a comment reddens it.
  const g4Idx = LINES.findIndex((l) => /^  g4-architecture\s*:/.test(l));
  assert.notEqual(g4Idx, -1, "job 'g4-architecture' missing from the workflow");
  const g4Block: string[] = [];
  for (let i = g4Idx + 1; i < LINES.length; i++) {
    if (/^  \S/.test(LINES[i]!) || /^\S/.test(LINES[i]!)) break; // next job key (2 spaces) or root key (0)
    g4Block.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    g4Block.join("\n"),
    /npm run lint:ratchet/,
    "job g4 must run the ratchet `npm run lint:ratchet` (ADR-M003 D9 ter §3)",
  );
  // (7) lint AND ratchet, both blocking, chained by `&&` (ADR-M003 D9 quater, G2 reservation 3:
  //     a `||` or removing `npm run lint` left (6) green).
  assert.ok(
    g4Block.some((l) => /^\s*run:\s*npm run lint && npm run lint:ratchet\s*$/.test(l)),
    "job g4 must literally contain `run: npm run lint && npm run lint:ratchet` (ADR-M003 D9 quater)",
  );
});

// Lot R25-INTEGRATION-RULE-1 (ADR-M003 D9 nonies): the r25 job hands its two written counts to scripts/lot-size-integration.mjs,
// the single implementation the oracle's r25 gate runs too. Pinned: the proof then the count, after both metrics and
// before any print; the `|| R25I="written ..."` fallback; the two case guards (only mode `integration` with numeric counts
// replaces a count); the API token in this one step; no head branch name interpolated anywhere. Named mutants (G7):
// fallback removed, a guard removed, the count moved after the prints, `--base "origin/${{ github.head_ref }}"`. G2 m-4: the
// target is read from $GITHUB_BASE_REF, never interpolated; m-5: ten digits or more keep the written counts (bash overflow).
// killer: .github/workflows/ci.yml:116 CONST " || R25I=\"written $CHANGED $CONTENT_CHANGED\"" -> ""
// killer: .github/workflows/ci.yml:116 CONST "origin/$GITHUB_BASE_REF" -> "origin/${{ github.base_ref }}"
// killer: .github/workflows/ci.yml:123 CONST "|??????????*" -> ""
test("ci_r25_integration_rule_is_wired_fail_closed - proof then count after both metrics and before any print, written counts on a module error or a non-numeric answer, the token in the r25 step only, no head branch name interpolated (ADR-M003 D9 nonies)", () => {
  const at = LINES.findIndex((l) => /^  r25-taille-de-lot\s*:/.test(l)), code: string[] = [];
  for (let i = at + 1; i < LINES.length && !/^ {0,2}\S/.test(LINES[i] ?? ""); i++) if (!/^\s*#/.test(LINES[i] ?? "") && (LINES[i] ?? "").trim() !== "") code.push((LINES[i] ?? "").trim());
  const ix = [
    code.findIndex((l) => l.startsWith("CONTENT_CHANGED=$(printf")),
    code.indexOf(`node scripts/lot-size-integration.mjs proof --event "$GITHUB_EVENT_PATH" --out "$RUNNER_TEMP/lot-size-proof.json" || echo '::warning::R-25 integration proof not obtained: every line counts (fail-closed).'`),
    code.indexOf('R25I=$(node scripts/lot-size-integration.mjs count --ci .github/workflows/ci.yml --base "origin/$GITHUB_BASE_REF" --proof "$RUNNER_TEMP/lot-size-proof.json" --written "$CHANGED" "$CONTENT_CHANGED") || R25I="written $CHANGED $CONTENT_CHANGED"'),
    code.indexOf('read -r R25_MODE NEW_CHANGED NEW_CONTENT <<< "$R25I"'),
    code.indexOf('case "$R25_MODE/$NEW_CHANGED/$NEW_CONTENT" in'),
    code.indexOf("integration/[0-9]*/[0-9]*) ;;"),
    code.indexOf("*) R25_MODE=written; NEW_CHANGED=$CHANGED; NEW_CONTENT=$CONTENT_CHANGED ;;"),
    code.indexOf('case "$NEW_CHANGED$NEW_CONTENT" in'),
    code.indexOf("''|*[!0-9]*|??????????*) R25_MODE=written; NEW_CHANGED=$CHANGED; NEW_CONTENT=$CONTENT_CHANGED ;;"),
    code.indexOf("CHANGED=$NEW_CHANGED"),
    code.indexOf("CONTENT_CHANGED=$NEW_CONTENT"),
    code.findIndex((l) => l.startsWith('echo "Changed lines: ')),
    code.findIndex((l) => l.startsWith("if [ ")),
  ];
  assert.ok(ix.every((v, i) => v !== -1 && (i === 0 || v > (ix[i - 1] ?? -1))), `the integration lines are missing or out of order: ${ix.join(" ")}`);
  assert.deepEqual(LINES.filter((l) => l.includes("R25_READ_TOKEN:")).map((l) => l.trim()), [code.find((l) => l.startsWith("R25_READ_TOKEN: ${{ github.token }} #"))], "the read token is set once, in the r25 step");
  assert.deepEqual(LINES.filter((l) => /\$\{\{\s*github\.(head_ref|event\.pull_request\.head\.ref)\b/.test(l)), [], "no head branch name is interpolated (injection by branch name)");
  assert.deepEqual(LINES.filter((l) => l.includes("lot-size-integration.mjs") && l.includes("${{")), [], "no ${{ }} on a line that runs the module (G2 m-4: $GITHUB_BASE_REF)");
});

// Lot R25-ATTR-SOURCE-1 (G7 O-1, ADR-M003 D9 undecies): the two counts W of the r25 job read under the module's pinned read. Pinned: the
// `pin` command right before the first count, its fail-closed branch (no count is read without it), its output evaluated once and
// nowhere else, no git call of the job before it, and the two count lines unchanged (the shape R25_DIFF_RE and test 38 read).
// killer: .github/workflows/ci.yml:99 CONST "eval \"$R25_PIN\"" -> "true"
test("ci_r25_counts_read_under_the_module_pin - the r25 job evaluates `node scripts/lot-size-integration.mjs pin --ci <workflow> --base origin/$GITHUB_BASE_REF` (the changed paths refused first, D9 terdecies) right before its two `git diff --shortstat` counts, fail-closed, once (ADR-M003 D9 undecies)", () => {
  const at = LINES.findIndex((l) => /^  r25-taille-de-lot\s*:/.test(l)), code: string[] = [];
  for (let i = at + 1; i < LINES.length && !/^ {0,2}\S/.test(LINES[i] ?? ""); i++) if (!/^\s*#/.test(LINES[i] ?? "") && (LINES[i] ?? "").trim() !== "") code.push((LINES[i] ?? "").trim());
  const pin = code.indexOf("R25_PIN=$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base \"origin/$GITHUB_BASE_REF\") || {"), stat = code.findIndex((l) => l.startsWith("STAT=$(git diff --shortstat "));
  assert.deepEqual(
    code.slice(pin, pin + 6),
    ["R25_PIN=$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base \"origin/$GITHUB_BASE_REF\") || {", "echo '::error::Gate R-25: pinned git read not obtained, or a changed path refused (see the lines above). Fail-closed.'", "exit 1", "}", 'eval "$R25_PIN"', code[stat]],
    "the pinned read must be evaluated right before the STAT count, and a failed `pin` must red the job",
  );
  assert.ok(pin !== -1 && stat === pin + 5, `the pin lines are missing or not right before the STAT count: ${pin} ${stat}`);
  assert.deepEqual(code.slice(0, pin).map((l) => l.replace(/\s#\s.*$/, "")).filter((l) => /\bgit\b/.test(l) && !l.startsWith("- uses:")), [], "no git call of the r25 job before the pinned read");
  assert.deepEqual(LINES.filter((l) => /\beval\b/.test(l) && !/^\s*#/.test(l)).map((l) => l.trim()), ['eval "$R25_PIN"'], "one eval in the workflow, of the pinned read only");
  assert.deepEqual(code.filter((l) => /\bR25_PIN=/.test(l)), ["R25_PIN=$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base \"origin/$GITHUB_BASE_REF\") || {"], "R25_PIN is set once, by the module");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot CI-EXPORT-CHECK (item "export:check absent from CI"; docs/G7-lot-export-clean.md / CHANTIERS:221;
// ADR-M004 D7 septies "Branchement / dettes") — the public-mirror export hygiene gate `export:check` runs in
// CI, fail-closed. It is wired into the internal-only r25-taille-de-lot job ON PURPOSE: scripts/export-public.mjs
// derivePublicWorkflow STRIPS that whole job from the derived public workflow, and export:check is a SOURCE-repo
// gate that reds on the exported mirror (its config scripts/export-exclude-tests.json is not whitelisted =>
// exit 1, measured). A step in a retained job (g3/g6) would be copied byte-identical (test 42(f')) into the
// public mirror where it reds. This test reads ci.yml as text (no YAML parser is a repo dependency — test 38's
// note) and pins: the step is present, is not continue-on-error, and — through the package.json script chain —
// invokes export-public.mjs --check. Named mutants (proofs + sha256 restore in this lot's RENDU-G1, to be folded
// into docs/G1-lot-ci-export-check.md by the orchestrator): the step removed => the run-line assert reds; a
// `continue-on-error: true` on the step => the COE assert reds.
test("ci_runs_export_check — export:check wired fail-closed in the internal-only r25 job (Lot CI-EXPORT-CHECK)", () => {
  // Block-scope on the r25 job key (2-space indent) up to the next 2-space job key or a column-0 key — the same
  // idiom as the g4 ratchet block (test 38) and g3-site. Comments are NOT stripped here: hasDirective (below)
  // skips full-comment lines itself, and the export:check run line carries no inline comment.
  const r25Idx = LINES.findIndex((l) => /^  r25-taille-de-lot\s*:/.test(l));
  assert.notEqual(r25Idx, -1, "job 'r25-taille-de-lot' missing from the workflow");
  const r25Block: string[] = [];
  for (let i = r25Idx + 1; i < LINES.length; i++) {
    if (/^  \S/.test(LINES[i]!) || /^\S/.test(LINES[i]!)) break; // next 2-space job key or a column-0 key
    r25Block.push(LINES[i]!);
  }
  assert.ok(r25Block.length > 0, "r25 job body is empty (false green)");

  // (1) the export:check step is present. `npm run export:check` is the command measured green on this base
  //     (exit 0, all scopes; ADR-M010). Mutant "step removed" => this reds.
  assert.ok(
    r25Block.some((l) => /^\s*run:\s*npm run export:check\s*$/.test(l)),
    "the r25 job must run `npm run export:check` (public-mirror export hygiene); mutant: step removed => red",
  );

  // (2) fail-closed: no continue-on-error DIRECTIVE in the r25 block (a YAML key on a non-comment line; a prose
  //     "continue-on-error" in a # comment stays allowed — hasDirective skips comment lines). Reuses test 38's
  //     file-wide detector, block-scoped to r25. Mutant `continue-on-error: true` on the step => this reds.
  assert.ok(
    !hasDirective(r25Block, COE_DIRECTIVE_RE),
    "the export:check step must carry no continue-on-error (fail-closed); mutant: a continue-on-error: true on the step => red",
  );

  // (2bis / G2 C-1) fail-closed on SKIP too: no `if:` directive in the r25 block. A SKIPPED required check
  //     counts as PASSING on GitHub -- test 38 (1bis) calls this WORSE than continue-on-error -- so it is the
  //     more severe dimension, and until now it was pinned only file-wide by test 38 (mutant `if: false` on r25
  //     left THIS test green). Block-scoped sibling of the COE assert above (and of g3-site's if-guard). The
  //     shell `if [ ... ]` and awk `{ if($i ~ ...` in this block carry no `:` after `if`, so IF_DIRECTIVE_RE
  //     does not false-red them (G2-measured). Mutant `if: false` on the r25 job => this reds.
  assert.ok(
    !hasDirective(r25Block, IF_DIRECTIVE_RE),
    "the r25 job/export:check step must carry no `if:` (a skipped required check counts as PASSING on GitHub); mutant: if: false on r25 => red",
  );

  // (3) the run line invokes export-public.mjs --check THROUGH the package.json script chain (npm run
  //     export:check -> scripts["export:check"]). Pinning both ends keeps neither the CI run line nor the
  //     underlying command able to drift silently ("appelle bien export-public.mjs --check").
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["export:check"],
    "node scripts/export-public.mjs --check",
    "package.json scripts['export:check'] must invoke export-public.mjs --check (the r25 run line calls it by name)",
  );
});

// Root test `ci_runs_lang_gate` (Lot LANG-GATE-CI; ADR-M004 "Addendum LANG-GATE-CI"). Mirror of ci_runs_export_check
// in its post-C-1 shape: the source-repo English-only gate `npm run lang:gate` is wired fail-closed in the
// internal-only r25 job (the one derivePublicWorkflow STRIPS). Reads ci.yml as text (no YAML parser is a repo
// dependency -- test 38's note) and pins, block-scoped to r25: the step is present, carries no continue-on-error and
// no `if:`, and -- through the package.json script chain -- invokes scripts/lang-gate.mjs.
// DECLARED REDUNDANCY (G0 section 3): asserts (2) continue-on-error and (3) `if:` scan the SAME r25 block as
// ci_runs_export_check (2)/(2bis) and overlap test 38 file-wide; they are KEPT for symmetry with the model test and
// so this test stays a self-sufficient contract if ci_runs_export_check is ever refactored. The non-redundant teeth
// here are (1) lang:gate presence and (4) the package.json chain. Because this test copies the post-C-1 shape, the
// `if:` guard is block-scoped from the start: the model's "M5a hole" (an `if: false` at JOB level that left
// ci_runs_export_check green before C-1) never exists here -- no G2-delta is needed to add it. Named mutants (proofs
// + sha256 restore in this lot's RENDU-G1, to be folded into docs/G1-lot-lang-gate-ci.md by the orchestrator): step
// removed/commented/command->echo => presence reds (#fail=1); continue-on-error: true on the step => COE reds
// (#fail=3); if: false on the r25 job or the step (and `if: ${{ false }}` / a condition) => the `if:` guard reds (#fail=3).
test("ci_runs_lang_gate — lang:gate wired fail-closed in the internal-only r25 job (Lot LANG-GATE-CI)", () => {
  // Block-scope on the r25 job key (2-space indent) up to the next 2-space job key or a column-0 key -- the same
  // idiom as ci_runs_export_check and the g4 ratchet block (test 38). Comments are NOT stripped here: hasDirective
  // (below) skips full-comment lines itself, and the lang:gate run line carries no inline comment.
  const r25Idx = LINES.findIndex((l) => /^  r25-taille-de-lot\s*:/.test(l));
  assert.notEqual(r25Idx, -1, "job 'r25-taille-de-lot' missing from the workflow");
  const r25Block: string[] = [];
  for (let i = r25Idx + 1; i < LINES.length; i++) {
    if (/^  \S/.test(LINES[i]!) || /^\S/.test(LINES[i]!)) break; // next 2-space job key or a column-0 key
    r25Block.push(LINES[i]!);
  }
  assert.ok(r25Block.length > 0, "r25 job body is empty (false green)");

  // (1) the lang:gate step is present. `npm run lang:gate` is measured green on this base (exit 0, 12 scopes GATED,
  //     0 non-exempt French; ADR-M004 D7). Mutant "step removed / commented / command -> echo" => this reds.
  assert.ok(
    r25Block.some((l) => /^\s*run:\s*npm run lang:gate\s*$/.test(l)),
    "the r25 job must run `npm run lang:gate` (source-repo English-only gate); mutant: step removed => red",
  );

  // (2) fail-closed: no continue-on-error DIRECTIVE in the r25 block (a YAML key on a non-comment line; a prose
  //     "continue-on-error" in a # comment stays allowed -- hasDirective skips comment lines). Reuses test 38's
  //     file-wide detector, block-scoped to r25. DECLARED redundant with ci_runs_export_check (2) and test 38; kept
  //     for symmetry / self-sufficiency. Mutant `continue-on-error: true` on the step => this reds.
  assert.ok(
    !hasDirective(r25Block, COE_DIRECTIVE_RE),
    "the lang:gate step must carry no continue-on-error (fail-closed); mutant: a continue-on-error: true on the step => red",
  );

  // (3) fail-closed on SKIP too: no `if:` directive in the r25 block. A SKIPPED required check counts as PASSING on
  //     GitHub -- test 38 (1bis) calls this WORSE than continue-on-error. Block-scoped sibling of the COE assert
  //     above. The shell `if [ ... ]` and awk `{ if($i ~ ...` in this block carry no `:` after `if`, so
  //     IF_DIRECTIVE_RE does not false-red them. DECLARED redundant with ci_runs_export_check (2bis) and test 38;
  //     kept for symmetry / self-sufficiency; born post-C-1, so the guard exists from the start (no M5a hole).
  //     Mutant `if: false` on the r25 job (or `if: ${{ false }}` / a condition on the step) => this reds.
  assert.ok(
    !hasDirective(r25Block, IF_DIRECTIVE_RE),
    "the r25 job/lang:gate step must carry no `if:` (a skipped required check counts as PASSING on GitHub); mutant: if: false on r25 => red",
  );

  // (4) the run line invokes scripts/lang-gate.mjs THROUGH the package.json script chain (npm run lang:gate ->
  //     scripts["lang:gate"]). Pinning both ends keeps neither the CI run line nor the underlying command able to
  //     drift silently.
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["lang:gate"],
    "node scripts/lang-gate.mjs",
    "package.json scripts['lang:gate'] must invoke scripts/lang-gate.mjs (the r25 run line calls it by name)",
  );
});

// Lot V support (ADR-M003 D12) — the naked Hermes pattern of the monark scope is present and discriminating.
// Unnumbered (D11 is a closed list): a regression lock so that the clawpump-hermes reformulation
// does not drift silently. The end-to-end execution proof (grep of the gate
// on mutant/counter-mutant) is in docs/G1-lot-V.md.
test("vocab_monark_scope_bans_naked_hermes — naked Hermes reddens, pyth-/clawpump- exempted (ADR-M003 D12)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
  const monark = cfg.scan.monark;
  assert.ok(monark, "scope 'monark' missing from vocab-banned.json");
  assert.equal(monark.package, "monark");
  const entry = monark.banned.find((b: { re: string }) => /Hermes/.test(b.re));
  assert.ok(entry, "Hermes pattern missing from the monark scope");
  const re = new RegExp(entry.re, "i");
  assert.ok(re.test("the tokenised agent + Hermes harness wiring"), "naked Hermes must redden");
  assert.ok(re.test("UsePod/Hermes"), "naked Hermes (after slash) must redden");
  assert.ok(!re.test("the tokenised agent + clawpump-hermes harness wiring"), "clawpump-hermes must stay green");
  assert.ok(!re.test("pyth-hermes prices"), "pyth-hermes must stay green");
});

// ADR-M008 D5 (« mutant surclaim ⇒ ROUGE ») — the Narabi peg-score / p_depeg patterns are present in BOTH
// the monark and harness scopes AND discriminating: a naked surclaim reddens, the honest negation stays
// green. Without this, deleting the patterns would redden no test (the G2 R2 gap). Uses the REAL gate
// functions (compilePatterns/scanText) without executing the CLI.
test("vocab_narabi_scopes_ban_peg_score_and_p_depeg — naked surclaim reddens, negation green (ADR-M008 D5)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[] } | undefined>;
  };
  for (const scopeName of ["monark", "harness"] as const) {
    const scope = cfg.scan[scopeName];
    assert.ok(scope, `scope '${scopeName}' missing from vocab-banned.json`);
    const patterns = compilePatterns(scope.banned);
    // (a) MUTANT — a naked peg-score / p_depeg surclaim reddens.
    assert.ok(scanText("the sensor emits a peg score of 0.9", patterns).length >= 1, `(a) naked "peg score" must redden the ${scopeName} scope`);
    assert.ok(scanText("field p_depeg carries the estimate", patterns).length >= 1, `(a) "p_depeg" must redden the ${scopeName} scope`);
    // (b) the honest negation stays green (NARABI_LABEL's "not a peg score", and "no peg score").
    assert.deepEqual(scanText("velocity forecast under coverage, not a peg score, not advice", patterns), [], `(b) "not a peg score" must stay green in the ${scopeName} scope`);
    assert.deepEqual(scanText("no peg score is emitted", patterns), [], `(b) "no peg score" must stay green in the ${scopeName} scope`);
  }
});

// ADR-M012 D8 (C-3) — the adaptive-surclaim patterns are present in the site, harness, skills AND narabi_docs scopes (narabi_docs enforces AC-5 on README, C-4) and
// discriminating: "adaptive coverage" / "the gate adapts" / "adaptively covers" redden, while the EXACT
// ADR-M012 D8 public sentence stays green with NO exemption. WORKER DEVIATION (ADR-M012 D8 asked for an
// exemptPhrases entry = the D8 sentence): it is NOT added, because (i) the sentence dodges both patterns by
// construction (measured: 0 match), so the entry would be inert, and (ii) an inert entry in site.exemptPhrases
// would FAIL the vocab_site_confidence_exemption non-inert guard (it has no rendered apps/site carrier), and
// the harness scope does not even consume exemptPhrases (grep-forbidden.mjs add() passes none). The stronger
// property is asserted directly: the D8 sentence is green with an EMPTY exemption list, in all three scopes.
// Uses the REAL gate functions (compilePatterns/scanText) without executing the CLI (run-guarded).
test("vocab_adaptive_coverage_reddens — adaptive surclaim reddens site/harness/skills/narabi_docs/sentinel; the exact D8 sentence green, no exemption (ADR-M012 D8)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[] } | undefined>;
  };
  // The EXACT ADR-M012 D8 public sentence (verbatim English; straight apostrophes, en-dash author names).
  const D8_SENTENCE =
    "Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested " +
    "daily USDe redemption flow: its state moves each 24h window from the realized outcome, and the full " +
    "timeline is published so anyone can replay it. What it carries is a deterministic long-run bound that " +
    "tightens as windows accumulate, printed daily with T, not a per-window coverage, not a probability; the " +
    "gate's committed calibration does not depend on the tracker state. Until the pre-registered drift " +
    "criterion fires and an ADR says otherwise, the gate's region is still the committed static calibration: " +
    "the tracker adapts, the gate does not yet.";
  const MUTANTS = ["adaptive coverage", "the gate adapts", "adaptively covers"];
  for (const scopeName of ["site", "harness", "skills", "narabi_docs", "sentinel"] as const) {
    const scope = cfg.scan[scopeName];
    assert.ok(scope && scope.banned, `scope '${scopeName}' missing from vocab-banned.json`);
    // Both ADR-M012 D8 patterns are present (a deletion also reds the load-bearing check below).
    const adaptive = scope.banned.filter((b) => /adapt/i.test(b.re));
    assert.equal(adaptive.length, 2, `scope '${scopeName}' must carry BOTH ADR-M012 D8 adaptive patterns`);
    const patterns = compilePatterns([...cfg.banned, ...scope.banned]);
    // (a) MUTANT — the three surclaims redden the scope.
    for (const m of MUTANTS) {
      assert.ok(scanText(m, patterns, []).length >= 1, `(a) '${m}' must redden the ${scopeName} scope (ADR-M012 D8)`);
    }
    // (b) the EXACT D8 public sentence stays green with an EMPTY exemption list (no exemptPhrases entry).
    assert.deepEqual(scanText(D8_SENTENCE, patterns, []), [], `(b) the exact D8 sentence must stay green in ${scopeName} with NO exemption`);
    // (c) LOAD-BEARING — remove the two adaptive patterns and every mutant goes green, proving THOSE patterns
    // (not a pre-existing rule) are what redden the surclaims.
    const without = compilePatterns([...cfg.banned, ...scope.banned.filter((b) => !/adapt/i.test(b.re))]);
    for (const m of MUTANTS) {
      assert.deepEqual(scanText(m, without, []), [], `(c) removing the adaptive patterns must green '${m}' in ${scopeName} (load-bearing)`);
    }
  }
});

// ADR-M012 item (j) / G2-lot-m012b C2 — the gate:vocab ratchet is EXTENDED to cover the off-tool sentinel:
// apps/sentinel/src, apps/sentinel/test AND the deploy/ units, via a new `sentinel` scope. The
// vocab_adaptive_coverage_reddens test above proves the CONFIG patterns discriminate; this one proves the
// scope is WIRED INTO THE WALK (the G2 R2 gap: a config-only test stays green if collectTargets ignores the
// scope). It drives the REAL collectTargets() over the REAL tree: with the live config the two adaptive
// patterns are attached to instrument.ts, the sentinel test AND a deploy unit; deleting scan.sentinel drops
// all three from the walk (load-bearing). Live CLI mutant (a sentinel comment "adaptive coverage" ⇒ exit 1
// ⇒ revert, sha256 before/after) is recorded in the M012-c report.
test("vocab_sentinel_scope_scans_src_test_deploy — sentinel src/test/deploy are in the walk with the adaptive patterns (ADR-M012 C2)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[]; dirs?: string[]; files?: string[] } | undefined>;
  };
  const sentinel = cfg.scan.sentinel;
  assert.ok(sentinel && sentinel.banned, "scope 'sentinel' missing from vocab-banned.json (C2)");
  assert.equal(
    sentinel.banned.filter((b) => /adapt/i.test(b.re)).length,
    2,
    "the sentinel scope must carry BOTH ADR-M012 D8 adaptive patterns",
  );

  const REQUIRED = [
    join(ROOT, "apps", "sentinel", "src", "instrument.ts"),
    join(ROOT, "apps", "sentinel", "test", "sentinel.test.ts"),
    join(ROOT, "deploy", "monark-sentinel.service"),
  ];
  // (a) with the REAL config, collectTargets attaches the adaptive patterns to every required file.
  const targets = collectTargets(ROOT, cfg, []);
  const byFile = new Map(targets.map((t) => [t.f, t.patterns]));
  for (const f of REQUIRED) {
    const patterns = byFile.get(f);
    assert.ok(patterns, `the sentinel scope must scan ${f}`);
    assert.ok(scanText("adaptive coverage", patterns, []).length >= 1, `the adaptive patterns must be attached to ${f}`);
  }
  // (b) LOAD-BEARING — delete scan.sentinel and the three files leave the walk entirely.
  const stripped = JSON.parse(JSON.stringify(cfg)) as typeof cfg;
  delete stripped.scan.sentinel;
  const strippedFiles = new Set(collectTargets(ROOT, stripped, []).map((t) => t.f));
  for (const f of REQUIRED) {
    assert.ok(!strippedFiles.has(f), `removing scan.sentinel must drop ${f} from the walk (load-bearing)`);
  }
});

// ADR-NARABI-OPS-1 L-2 / C-2: the sentinel timer carries FOUR same-day retry slots (00:30/03:30/06:30/09:30
// UTC), each a SEPARATE valid `OnCalendar=` line — never the invalid single-line comma list. Mutant: a single
// slot (or the `00:30,03:30,…` form) => this reds. Persistent=true is kept (one boot catch-up, never one/slot).
test("sentinel_timer_has_retry_slots — four valid OnCalendar= retry slots, Persistent kept (ADR-NARABI-OPS-1 L-2 / C-2)", () => {
  const timer = readFileSync(join(ROOT, "deploy", "monark-sentinel.timer"), "utf8");
  const slots = timer.split(/\r?\n/).filter((l) => /^OnCalendar=/.test(l));
  assert.equal(slots.length, 4, "exactly four OnCalendar= slots (mutant: one slot => red)");
  const times = slots.map((l) => {
    const m = /^OnCalendar=\*-\*-\* (\d\d):30:00 UTC$/.exec(l);
    assert.ok(m, `each slot is a valid '*-*-* HH:30:00 UTC' expression, got ${JSON.stringify(l)}`);
    return m[1];
  });
  assert.deepEqual([...times].sort(), ["00", "03", "06", "09"], "the four slots are 00:30, 03:30, 06:30, 09:30 UTC");
  assert.ok(/^Persistent=true$/m.test(timer), "Persistent=true kept (one boot catch-up, never one per missed slot)");
  // C-2: the invalid single-line comma-list form must never be a directive (only allowed inside a # comment).
  assert.ok(!timer.split(/\r?\n/).some((l) => /^OnCalendar=.*,/.test(l)), "no invalid comma-list OnCalendar directive");
});

// ADR-NARABI-OPS-1 L-2 / C-5: the service reads its optional Chainstack key from an OUT-OF-REPO EnvironmentFile
// (leading `-` => absence is non-fatal; the base pool stays fail-closed). No key is inline. Mutant: drop the
// EnvironmentFile line => red; an inline Environment= carrying a URL/key => red.
test("sentinel_service_reads_env_file — optional out-of-repo EnvironmentFile, no inline key (ADR-NARABI-OPS-1 L-2 / C-5)", () => {
  const svc = readFileSync(join(ROOT, "deploy", "monark-sentinel.service"), "utf8");
  assert.ok(/^EnvironmentFile=-\/etc\/monark\/sentinel\.env$/m.test(svc), "EnvironmentFile=-/etc/monark/sentinel.env present (the '-' makes it optional)");
  // The only inline Environment= directive is the state dir — never an endpoint/key.
  const inlineEnv = svc.split(/\r?\n/).filter((l) => /^Environment=/.test(l));
  assert.deepEqual(inlineEnv, ["Environment=MONARK_SENTINEL_DIR=/var/lib/monark-sentinel"], "the only inline Environment= is the state dir (no key)");
});

// Lot F-2a (PLAN F-2 §6e, C6) — the public storefront vocabulary gate (scope 'site') bans the README
// v2 marketing vocab in apps/site. Live end-to-end mutant (grep of the gate on a banned word in an
// apps/site file) is in docs/G1-lot-F2a.md; this locks the config so the scope cannot drift silently.
test("vocab_site_scope_bans_marketing_words — 7 proscribed words redden in apps/site (C6)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    scan: { site?: { package: string; extensions: string[]; banned: { re: string; why: string }[] } };
  };
  const site = cfg.scan.site;
  assert.ok(site, "scope 'site' missing from vocab-banned.json (C6)");
  assert.equal(site.package, "site");
  assert.deepEqual([...site.extensions].sort(), [".mdx", ".ts", ".tsx"], "site scope scans rendered surfaces only");
  const res = site.banned.map((b) => new RegExp(b.re, "i"));
  for (const w of ["autonomous", "self-evolving", "predicts", "confidence", "accuracy", "hedge fund", "Kraidle"]) {
    assert.ok(res.some((re) => re.test(`the ${w} claim`)), `no site-scope pattern reddens '${w}'`);
  }
  // Discriminating: adjacent honest words stay green (only 'predicts' is banned, not prediction/predictor).
  assert.ok(
    !res.some((re) => re.test("the predictor emits a Prediction and a coverage region")),
    "'prediction'/'predictor' must stay green (only 'predicts' banned)",
  );
});

// Lot F-2a (PLAN F-2 §6f, C11) — package-name collision guard: Base UI is `@base-ui/react`; the
// differently-named `@base-ui-components/react` must NEVER appear. Mutant (adding it to the site
// package.json) reddens; proof in docs/G1-lot-F2a.md.
test("no_base_ui_components_collision — @base-ui-components/react absent from site pkg + lockfile (C11)", () => {
  const pkg = readFileSync(join(ROOT, "apps", "site", "package.json"), "utf8");
  const lock = readFileSync(join(ROOT, "package-lock.json"), "utf8");
  assert.ok(
    !pkg.includes("@base-ui-components/react"),
    "@base-ui-components/react must be absent from apps/site/package.json (use @base-ui/react)",
  );
  assert.ok(
    !lock.includes("@base-ui-components/react"),
    "@base-ui-components/react must be absent from package-lock.json (collision with @base-ui/react)",
  );
  assert.ok(pkg.includes("@base-ui/react"), "positive control: @base-ui/react IS the pinned package");
});

// Lot F-2a (checkpoint-2 C-1) — the D1 decision (drop .md from the honesty walk) is only safe while
// .md is never a route. That safety rests ENTIRELY on next.config.mjs pageExtensions excluding "md":
// guard (a) locks the non-scan of .md, NOT the route closure. This locks pageExtensions so a future
// lot re-adding "md" (reopening F-1 G2 R1's routable-but-unscanned hole) reddens HERE. Named mutant:
// add "md" to pageExtensions ⇒ this test fails.
test("pageExtensions_excludes_md — .md is never a route, so the honesty walk may skip it (C-1)", () => {
  const cfg = readFileSync(join(ROOT, "apps", "site", "next.config.mjs"), "utf8");
  const inner = cfg.match(/pageExtensions\s*:\s*\[([^\]]*)\]/)?.[1] ?? "";
  assert.ok(inner, "pageExtensions array not found in apps/site/next.config.mjs");
  const exts = [...inner.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]).filter((s): s is string => !!s);
  assert.deepEqual([...exts].sort(), ["mdx", "ts", "tsx"], "pageExtensions must be exactly ts/tsx/mdx");
  assert.ok(!exts.includes("md"), "adding 'md' reopens F-1 G2 R1's routable-but-unscanned hole (C-1)");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (PLAN F-2 §12 errata) — the site-scope vocab gate bans `\bconfidence\b`, yet MONARK's
// honest fleet-invariant copy ("no confidence field", README l.67-71) must render. A CLOSED
// exemptPhrases list in vocab-banned.json masks that exact phrase, scope-locally, BEFORE matching.
// This test imports the REAL gate functions (scanText/compilePatterns) from grep-forbidden.mjs
// WITHOUT executing the CLI (run-guarded), and proves the mechanism is closed, load-bearing AND
// non-inert. The live end-to-end proof (real CLI, exit codes, sha256 restore) is in docs/G1-lot-F2b.md.

interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { site: { banned: { re: string; why: string }[]; exemptPhrases: string[] } };
}

/** apps/site rendered surfaces (.ts/.tsx/.mdx), mirroring grep-forbidden.mjs SITE_SKIP (any depth). */
function siteSurfaces(base: string): { rel: string; text: string }[] {
  const SKIP = new Set(["node_modules", "dist", ".next", ".turbo", "test", "data"]);
  const EXTS = new Set([".ts", ".tsx", ".mdx"]);
  const out: { rel: string; text: string }[] = [];
  const walk = (absDir: string, rel: string): void => {
    for (const name of readdirSync(absDir)) {
      if (SKIP.has(name)) continue;
      const abs = join(absDir, name);
      if (statSync(abs).isDirectory()) {
        walk(abs, `${rel}/${name}`);
      } else if (EXTS.has(extname(name).toLowerCase())) {
        out.push({ rel: `${rel}/${name}`, text: readFileSync(abs, "utf8") });
      }
    }
  };
  walk(base, "apps/site");
  return out;
}

test("vocab_site_confidence_exemption — closed, load-bearing, non-inert (F-2b §12 errata)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as VocabConfig;
  const site = cfg.scan.site;
  assert.ok(
    Array.isArray(site.exemptPhrases) && site.exemptPhrases.length >= 1,
    "site scope must carry a closed exemptPhrases list (PLAN F-2 §12 errata)",
  );
  // The banned `confidence` rule must still be present — the exemption narrows it, never removes it.
  assert.ok(
    site.banned.some((b) => /confidence/.test(b.re)),
    "the site scope must still ban 'confidence' (only the closed honest phrase is exempt)",
  );
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(site.banned)];
  const phrases = site.exemptPhrases;

  // (a) MUTANT — a NON-exempt marketing use of a banned word reddens.
  assert.ok(
    scanText("We deliver high confidence signals.", patterns, phrases).length >= 1,
    "(a) 'high confidence' (non-exempt) must redden the site vocab gate",
  );

  // (b) MUTANT — the honest exempt phrase stays green.
  assert.deepEqual(
    scanText("MONARK keeps no confidence field, anywhere.", patterns, phrases),
    [],
    "(b) the exempt honest phrase must stay green",
  );

  // NON-INERT + (c) MUTANT — every exempt phrase must sit in a genuinely RENDERED position of a scanned
  // apps/site surface, and removing it from the exempt set must redden that very rendered copy.
  const surfaces = siteSurfaces(join(ROOT, "apps", "site"));
  assert.ok(surfaces.length >= 1, "no apps/site surfaces scanned (false green)");
  // R-E (trou M3): the carrier must be a RENDERED position, PROVEN by the honesty-lint AST walker
  // renderedTexts() — a JSX text node, a JSX child expression, or a visible attribute. The former
  // `startsWith("//")` line heuristic accepted a dead `const X = "no confidence field"` as a carrier,
  // so the rendered honest claim could be deleted while this test stayed green. Parsing closes that hole
  // (a variable initialiser is not a rendered position). .mdx is not parsed here (the carriers are .tsx);
  // a phrase living only in .mdx prose would fail this stricter check until put in a TSX/TS rendered
  // position — none such exists in-tree.
  const renderedTextsOf = (rel: string, text: string): string[] => {
    if (!rel.endsWith(".ts") && !rel.endsWith(".tsx")) return [];
    const kind = rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
    return renderedTexts(sf).map((rt) => rt.text);
  };
  for (const phrase of phrases) {
    const carrier = surfaces.find((s) => renderedTextsOf(s.rel, s.text).some((t) => t.includes(phrase)));
    assert.ok(carrier, `exempt phrase '${phrase}' sits in no RENDERED position under apps/site — inert exemption (R-E)`);
    const withoutThis = phrases.filter((p) => p !== phrase);
    assert.ok(
      scanText(carrier.text, patterns, withoutThis).length >= 1,
      `(c) removing exempt '${phrase}' must redden the rendered copy that carries it (load-bearing)`,
    );
  }

  // Steady state — with the full closed exemption set, EVERY apps/site surface is vocab-clean (this is
  // the in-process mirror of `npm run gate:vocab`; a stray banned word in a page reds here too).
  for (const s of surfaces) {
    assert.deepEqual(
      scanText(s.text, patterns, phrases),
      [],
      `apps/site surface must be vocab-clean with the closed exemptions: ${s.rel}`,
    );
  }
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (PLAN F-2 §12 errata §6b-bis) — generateMetadata() non-usage, documented by test.
// The honesty lint (test 44 §6b) scans the exported `metadata` VARIABLE; an
// `export [async] function generateMetadata()` returning literal title/description renders into
// <title>/<meta> yet would ESCAPE that scan. Chosen resolution (R-C): forbid it. No apps/site .ts/.tsx
// may export generateMetadata — a future lot that needs it reddens HERE and must extend the §6b scan
// first. AST (not regex): a comment or a string that merely names it is never a false red. Named mutant
// (a temp apps/site file exporting generateMetadata reds; removed; git clean) is in docs/G1-lot-F2b.md.
test("no_generate_metadata_in_apps_site — generateMetadata unused, §6b metadata scan not bypassable (F-2b §6b-bis)", () => {
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site TS/TSX surfaces scanned (false green)");
  const isExported = (mods: readonly ts.ModifierLike[] | undefined): boolean =>
    mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  const offenders: string[] = [];
  for (const s of surfaces) {
    const kind = s.rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(s.rel, s.text, ts.ScriptTarget.Latest, true, kind);
    const visit = (node: ts.Node): void => {
      if (ts.isFunctionDeclaration(node) && node.name?.text === "generateMetadata" && isExported(node.modifiers)) {
        offenders.push(s.rel);
      } else if (ts.isVariableStatement(node) && isExported(node.modifiers)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && decl.name.text === "generateMetadata") offenders.push(s.rel);
        }
      } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          if (el.name.text === "generateMetadata") offenders.push(s.rel);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  assert.deepEqual(
    offenders,
    [],
    `apps/site exports generateMetadata (bypasses the §6b metadata scan): ${offenders.join(", ")}`,
  );
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (R-D / trou M6, widened by G2-delta R-γ) — the frozen-contract FIELD NAMES stay dynamic.
// The panels render `contract.required.map(...)`, read from schemas/ at build time; if a lot hard-coded
// that list the storefront would silently drift from the frozen contract. FOUR contracts are loaded
// (Shōgen→AttestedPrice 9, Hikae→CoverageVerdict 12, Ukemi→Prediction 5, and — Lot F-site-8 G2 R1 —
// GateDecision 8, first rendered by /integrators); this guard covers all four. Mirror of test 44's guard,
// for the field names: none of the required fields of
// those contracts may appear as a QUOTED STRING LITERAL ("f"/'f'/`f`) in an apps/site .ts/.tsx. QUOTED
// (not bare word) ON PURPOSE — `residual`/`attestor`/`region`/`reason` occur legitimately in rendered
// PROSE ("named residual hypotheses", "an output is a region"); a JSX-text occurrence is an ACCEPTED,
// declared non-target (the M6 regression hard-codes an array of quoted strings, which this catches).
// /integrators renders GateDecision with BARE object keys (JSON.stringify quotes them only at render),
// which this quoted-literal guard does not target — the declared scope (an observation for the orchestrator).
// GateDecision adds 6 net-new field names (action, allow, tool, intent, verdict, remaining_budget).
// CARVE-OUT (F-site-8, on rebase onto the merged sim): `action` is dropped from the gated set — it is
// GateDecision's own enum name AND a common English word, referenced as `` `action` `` throughout the sim's
// JSDoc (lib/gate-enums, lib/sim, gate-sim/diagram, gate-sim/index) — prose naming the frozen enum, never a
// hard-coded field list; a lone "action" is not list-drift. Same spirit as `region`/`reason`, which are
// unquoted in prose and so never hit. The 5 remaining net-new fields (allow/tool/intent/verdict/
// remaining_budget — rare words) still catch a hard-coded field list. One EXEMPTION survives — lib/fleet.ts
// `key: "verdict"` (a product id, not the GateDecision field; documented in fleet.ts' doc comment) — in the
// CLOSED, NON-INERT allowlist below; `verdict` stays gated in every OTHER file. The carve-out is THIS lot's
// choice, and the justification is stated truthfully: a `list-context-only` refinement WOULD defeat the
// required mutant (a lone quoted "remaining_budget", not inside an array, reads as not-a-list) — so it is
// rejected. But an AST scan of string/template LITERALS (ts.createSourceFile is already used by the
// generateMetadata gate above) would NOT defeat it: a "remaining_budget" injected into CODE stays a
// StringLiteral → red, while `` `action` `` in a comment is not a literal → the sim's JSDoc drops out,
// restoring `action` to the gated set at zero false positives. That AST refinement is the cleaner end state;
// it is DEFERRED here for scope, tracked as K-5 (owner F-site-5), not claimed impossible.
// Scope = .ts AND .tsx (a strict superset of the task's .tsx): lib/load-contract.ts, the .ts that reads
// required[], is the likeliest hard-code site. Generated .d.ts excluded (mirrors test 44). Reuses
// siteSurfaces() raw text, like test 44. Named mutant proof: docs/G1-lot-F2b.md + docs/G1-lot-fsite-8.md.
test("frozen_contract_fields_stay_dynamic — loaded contracts' required[] never hard-coded in apps/site (F-2b R-D)", () => {
  const contracts: { file: string; count: number }[] = [
    { file: "attested-price.schema.json", count: 9 },
    { file: "coverage-verdict.schema.json", count: 17 },
    { file: "prediction.schema.json", count: 5 },
    { file: "gate-decision.schema.json", count: 9 },
  ];
  const fields = new Set<string>();
  for (const c of contracts) {
    const schema = JSON.parse(readFileSync(join(ROOT, "schemas", c.file), "utf8")) as { required?: string[] };
    const req = schema.required ?? [];
    assert.equal(req.length, c.count, `expected ${c.count} required fields in ${c.file} (schema drift?)`);
    for (const f of req) fields.add(f);
  }
  // Carve-out on the FINAL union (after the count:8 shape assertion above, so it is not broken): `action`
  // is GateDecision's own enum name and a common word, referenced as `` `action` `` throughout the sim's
  // JSDoc — prose, never list-drift (see header). The 5 rare net-new fields still catch a hard-coded list.
  fields.delete("action");

  // CLOSED allowlist (Lot F-site-8): `${rel} :: ${field}` occurrences that are a legitimate same-name
  // token, NOT a hard-coded frozen-contract field list. See the header for why a detection refinement was
  // rejected. The value documents each — and is READ by the non-inert guard's message (never dead data).
  const EXEMPT = new Map<string, string>([
    [
      "apps/site/lib/fleet.ts :: verdict",
      "MONARK Verdict PRODUCT key (fleet register id), not the GateDecision `verdict` field; documented in fleet.ts' `key` doc comment",
    ],
    [
      "apps/site/lib/bell-served-load.ts :: abstain",
      "the Bell session row's own `abstain` field of the served bell-public-state-v1 (a residual name such as no_close_ref), read fail-closed from apps/site/data/bell-served.json — not the GateDecision `abstain` action",
    ],
    [
      "apps/site/lib/profiles.ts :: verdict",
      "the E-1 profile picker's productKey for the MONARK Verdict product (same registry id as fleet.ts), not the GateDecision `verdict` field — a product id, not a rendered contract field",
    ],
  ]);

  const quotes = ['"', "'", "`"];
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site .ts/.tsx surfaces scanned (false green)");
  const rawHits: string[] = [];
  for (const s of surfaces) {
    for (const field of fields) {
      if (quotes.some((q) => s.text.includes(q + field + q))) rawHits.push(`${s.rel} :: ${field}`);
    }
  }
  // NON-INERT: an exemption whose occurrence has vanished must be deleted (fail-closed, never silently
  // dead) — a future refactor of fleet.ts re-tightens the gate here rather than rotting.
  for (const [key, why] of EXEMPT) {
    assert.ok(rawHits.includes(key), `stale frozen-field exemption '${key}' (${why}): the occurrence is gone — delete it`);
  }
  const hits = rawHits.filter((h) => !EXEMPT.has(h));
  assert.deepEqual(hits, [], `frozen contract field name hard-coded as a literal in apps/site: ${hits.join(", ")}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (checkpoint-2 C-1 / narrow guard C-3c) — α is the MISCOVERAGE level; coverage is one minus α.
// The Hikae "Honest limits" block once rendered "coverage level α" (reads α AS the coverage: α=0.10 would
// mean 10 % coverage, when it means 90 %). The validateur caught this honesty inversion after two mot-pour-
// mot G2 rounds and a full oracle. This is a NARROW regression guard — it pins THIS phrase, it does NOT
// catch every semantic inversion (only G2 review does): no apps/site rendered surface may place the word
// "coverage" directly before "level α" (entity or glyph). `\bcoverage` on purpose, so "MIScoverage level α"
// — which is CORRECT (α is the miscoverage level) — is not a false positive. Named mutant proof in
// docs/G1-lot-F2b.md.
test("no_coverage_level_alpha — α is never rendered as the coverage level in apps/site (F-2b C-1)", () => {
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site .ts/.tsx surfaces scanned (false green)");
  const inversion = /\bcoverage\s+level\s*(?:&alpha;|α)/i;
  const hits = surfaces.filter((s) => inversion.test(s.text)).map((s) => s.rel);
  assert.deepEqual(hits, [], `α rendered as a "coverage level" (it is the miscoverage level; coverage = one minus α): ${hits.join(", ")}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// ADR-EC E3 (checkpoint-1 C-5) — the test roots under which a built agent's wiring integration_test must
// live, DERIVED from a documented rationale map, plus the documented EXCLUSION of packages/*/test/. A
// served-pipe integration test lives at the repo root or under an app's test/ (it drives the served MCP wire
// or a published surface); a package's OWN test/ is a UNIT test of that package (ADR-M018 D1), never a proof
// of a served pipe — so packages/*/test/ is deliberately NOT a wiring root even though `npm test` runs it.
// wiring_test_roots_exclusion_is_declared pins the ⇔ (roots ↔ rationale) + the exclusion; guard (3) of
// fleet_register_built_set_is_frozen walks these roots.
const WIRING_TEST_ROOTS = ["test", "apps/harness/test", "apps/sentinel/test"];
const WIRING_TEST_ROOTS_RATIONALE: Record<string, string> = {
  "test": "root integration/probe tests that drive the served MCP wire or a published surface (h5 probe, narabi-live, byo-demo)",
  "apps/harness/test": "harness integration tests over the served gate tool / registry.run and the real MCP wire",
  "apps/sentinel/test": "sentinel integration tests over the published timeline / recorded pull",
};
const WIRING_TEST_ROOTS_EXCLUDED: Record<string, string> = {
  "packages/*/test": "package tests are UNIT tests of a package (ADR-M018 D1), never a served-pipe integration test — excluded from the wiring roots even though `npm test` runs them",
};

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2c (ADR-M004 D14 / PLAN F-2c C-2) — the FLEET REGISTER is the single source of truth for what
// is BUILT vs UPCOMING. This root test locks the invariant: the built set is EXACTLY {Shōgen, Hikae,
// Ukemi, Narabi} (Narabi flipped upcoming→built at go 4, ADR-M012 M012-e); the seven other agents and all
// five products are upcoming. Named mutant (G2): flip any of the twelve to "built" ⇒ this test reds (live
// proof + sha256 restore in docs/G1-lot-F2c.md). Two extra
// guards make the register honest and non-inert: (1) a numeric-hole closure — register strings render
// via {property access}, which the honesty lint (test 44) never flags, so a digit there would render
// un-caught; we scan every rendered register string with the SAME detector here. (2) a consumption
// check — the two new surfaces read status FROM the register, never hard-code a status attribute.
test("fleet_register_built_set_is_frozen — built == {Shōgen,Hikae,Ukemi,Narabi} + product MONARK Bell; 12 others upcoming (F-2c C-2; ADR-M012 M012-e; Q3 decision 146; decision 155)", () => {
  // Compile-time: FleetStatus IS the honest AgentStatus vocabulary (both "built"|"upcoming"). The two
  // typed identity coercions only type-check if neither type adds or drops a member (a stray "live"
  // reds ONE of them under `npm run typecheck`). Called below so they are not unused.
  const asAgentStatus = (s: FleetStatus): AgentStatus => s;
  const asFleetStatus = (s: AgentStatus): FleetStatus => s;
  assert.equal(asAgentStatus("built"), "built");
  assert.equal(asFleetStatus("upcoming"), "upcoming");

  // The invariant — built agents are exactly the four named, no more, no fewer.
  const BUILT = ["Shōgen", "Hikae", "Ukemi", "Narabi"];
  const builtAgents = FLEET_AGENTS.filter((a) => a.status === "built").map((a) => a.name);
  assert.deepEqual([...builtAgents].sort(), [...BUILT].sort(), "built agents must be exactly {Shōgen, Hikae, Ukemi, Narabi}");

  // Every other agent is upcoming (both directions, per agent — a flip reds here).
  for (const a of FLEET_AGENTS) {
    const expected = BUILT.includes(a.name) ? "built" : "upcoming";
    assert.equal(a.status, expected, `agent ${a.name} must be ${expected}`);
  }

  // All six products are upcoming — a product is a wiring of fleet agents, never the engine, so it is
  // never "built" (ADR-M004 D14 invariant), even when its engine agent (e.g. Ukemi) is built.
  // AMENDED 2026-09-23 (lot SITE-CHARTE-C; ruling Q3 of decision 146, CHANTIERS "amendement du test + statut
  // upcoming obligatoires"): MONARK Bell joins PRODUCTS as UPCOMING — five -> six products, twelve -> thirteen
  // upcoming. The built set above ({Shōgen, Hikae, Ukemi, Narabi}) is NOT touched.
  // AMENDED 2026-09-23 (lot BELL-SERVED-1; investor decision 155 "passe built"): MONARK Bell is the ONE built product
  // (host served, first signed record published, deploy check docs/deploy-CA-bell.json 12/12); the ADR-M004 D14
  // invariant above is amended by ADR (orchestrator's act). The five other products stay upcoming.
  const BUILT_PRODUCTS = ["bell"];
  assert.equal(PRODUCTS.length, 6, "exactly six products");
  for (const p of PRODUCTS) {
    const expected = BUILT_PRODUCTS.includes(p.key) ? "built" : "upcoming";
    assert.equal(p.status, expected, `product ${p.name} must be ${expected} (decision 155: MONARK Bell alone is built)`);
  }

  // The register-wide count: exactly 4 built agents, exactly 12 upcoming (7 agents + 5 products). ADR-M012 M012-e:
  // Narabi flips upcoming→built at go 4 (off-tool sentinel running daily), so built is 4; MONARK Bell (ruling Q3,
  // decision 146) added one upcoming product (13), then flipped to built (decision 155), so upcoming is 12.
  const builtCount = FLEET_AGENTS.filter((a) => a.status === "built").length;
  const upcomingCount =
    FLEET_AGENTS.filter((a) => a.status === "upcoming").length + PRODUCTS.filter((p) => p.status === "upcoming").length;
  assert.equal(builtCount, 4, "exactly four agents are built");
  assert.equal(upcomingCount, 12, "exactly twelve upcoming (seven agents + five products)");

  // (0) package.json `description` is exported to the public mirror (scripts/export-public.mjs WHITELIST_FILES)
  // and carries the fleet count in free text — a surface the register does not drive (G2 M012-e C2: it still
  // said "3 agents built, 8 on the roadmap" after Narabi flipped). Lock its counts to the register so a flip
  // that forgets the description reds here instead of shipping a contradiction to the mirror.
  const upcomingAgentCount = FLEET_AGENTS.filter((a) => a.status === "upcoming").length;
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { description: string };
  assert.ok(
    pkg.description.includes(`fleet: ${builtCount} agents built, ${upcomingAgentCount} on the roadmap`),
    `package.json description must state "fleet: ${builtCount} agents built, ${upcomingAgentCount} on the roadmap"`,
  );

  // (1) NUMERIC-HOLE closure — every RENDERED register string carries zero numeric literal. `{a.line}`
  // is a property access the honesty lint never flags, so this scan (same detector) is where a digit in
  // a register string (e.g. a "53h" window) would be caught.
  const noExempt = new Set<string>();
  const registryStrings: string[] = [];
  for (const a of FLEET_AGENTS) {
    registryStrings.push(a.name, a.line);
    // ADR-EC E6: wiring.note is RENDERED (guard (4) tripwire lifted for this field), so it is scanned here
    // (guard (4) contract: "add the wiring strings to the numeric scan above") AND by site-honesty.
    if (a.status === "built") registryStrings.push(a.wiring.note);
  }
  for (const p of PRODUCTS) {
    registryStrings.push(p.segment, p.name, p.fn, p.connects, p.wiring.sensor, p.wiring.gate, p.wiring.act);
    if (p.status === "built") registryStrings.push(p.served.note);
  }
  const numericHits = registryStrings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a register string carries a rendered numeric literal: ${JSON.stringify(numericHits)}`);

  // (2) CONSUMPTION — the two new surfaces render the badge FROM the register (status={...}), never a
  // hard-coded status="built"/status="upcoming" attribute. The Shōgen/Hikae F-2b panels keep their own
  // declared status on the home page; the Ukemi panel now reads the register too (pinned by (5) below).
  const NEW_SURFACES = ["apps/site/app/roadmap/page.tsx", "apps/site/components/upcoming-panel.tsx"];
  const surfaces = siteSurfaces(join(ROOT, "apps", "site"));
  // Also catches the JSX-wrapped literal status={"built"} (G2-F2c reserve a), not just status="built".
  const hardCoded = /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/;
  for (const rel of NEW_SURFACES) {
    const surface = surfaces.find((s) => s.rel === rel);
    assert.ok(surface, `expected new surface ${rel} to be scanned (false green)`);
    assert.ok(
      !hardCoded.test(surface.text),
      `${rel} must not hard-code a status attribute — read it from lib/fleet.ts (inert register otherwise)`,
    );
  }

  // (3) WIRING (ADR-M018 D1(b)(c)/D2; ADR-EC E2) — every built agent declares a SERVED path and a NON-EMPTY
  // LIST of non-LLM integration tests, ONE id per served leg (Hikae 3, Narabi 2, Shōgen/Ukemi 1), each of
  // which EXISTS. The FleetAgent union already makes a built-without-wiring / upcoming-with-wiring a COMPILE
  // error (npm run typecheck, via this file's import of fleet.ts); this block additionally reds if served_by
  // is empty, the list is empty, or any id names no real test. The declared test title may be bare (`"`) or
  // suffixed (` — …`), so we match `test("<id>` followed by a quote OR ` — `. Roots come from WIRING_TEST_ROOTS
  // (documented list, ADR-EC E3). Named mutants: integration_test:[] ⇒ reds (min 1); [""] ⇒ reds (bare-id
  // regex); "no_such_test" ⇒ reds (declRe); a DUPLICATED id inside one agent's list ⇒ reds (intra-list
  // uniqueness, G2 O-1 — inter-agent sharing stays licit); a title-suffixed id (m6,
  // narabi_live_parses_real_state_shape) ⇒ green; drop `wiring` ⇒ typecheck reds.
  const TEST_ROOTS = WIRING_TEST_ROOTS.map((r) => join(ROOT, ...r.split("/")));
  const testCorpus = TEST_ROOTS.flatMap((dir) =>
    existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".test.ts")).map((n) => readFileSync(join(dir, n), "utf8")) : [],
  ).join("\n");
  assert.ok(testCorpus.length > 0, "no *.test.ts collected under the three test roots (false green)");
  // Decision 155: a BUILT product carries the same served wiring (`served`), under the same guard.
  const builtWirings: Array<{ name: string; wiring: FleetWiring }> = [
    ...FLEET_AGENTS.flatMap((a) => (a.status === "built" ? [{ name: a.name, wiring: a.wiring }] : [])),
    ...PRODUCTS.flatMap((p) => (p.status === "built" ? [{ name: p.name, wiring: p.served }] : [])),
  ];
  assert.ok(builtWirings.some((w) => w.name === "MONARK Bell"), "the built product MONARK Bell must be walked by the wiring guard");
  for (const a of builtWirings) {
    assert.ok(a.wiring.served_by.trim().length > 0, `built agent ${a.name}: wiring.served_by must be non-empty (ADR-M018 D1(b))`);
    assert.ok(Array.isArray(a.wiring.integration_test), `built agent ${a.name}: integration_test must be a list (ADR-EC E2)`);
    assert.ok(a.wiring.integration_test.length >= 1, `built agent ${a.name}: integration_test must name at least one served leg (ADR-EC E2)`);
    // O-1 (G2): each served leg is a DISTINCT test — a duplicated id inside one agent's list is a padded
    // list, not a real second leg (inter-agent sharing, e.g. probe_harness_records_real_decision, stays licit).
    assert.equal(
      new Set(a.wiring.integration_test.map((s) => s.trim())).size,
      a.wiring.integration_test.length,
      `built agent ${a.name}: integration_test ids must be unique within the agent (one per served leg, ADR-EC E2 / G2 O-1)`,
    );
    for (const raw of a.wiring.integration_test) {
      const t = raw.trim();
      assert.match(t, /^[A-Za-z0-9_]+$/, `built agent ${a.name}: each integration_test must be a bare test identifier, got ${JSON.stringify(raw)}`);
      // `t` is a bare identifier (validated above) ⇒ safe to interpolate. Accept a bare (`"`) or title-suffixed
      // (` — …`) declaration: test("<id>" …) or test("<id> — …").
      const declRe = new RegExp(`test\\(\\s*["']${t}(?:["']| — )`);
      assert.ok(
        declRe.test(testCorpus),
        `built agent ${a.name}: integration_test '${t}' names no test("${t}" …) under ${WIRING_TEST_ROOTS.join(", ")} (ADR-M018 D1(c))`,
      );
    }
  }

  // (4) NUMERIC-HOLE tripwire for wiring (DECLARED LIMIT) — served_by carries task-class ids with digits
  // (…-24h, btc-dir-15m). Like ACI.body, a wiring VALUE escapes BOTH the honesty lint (member access OR
  // destructuring) and the register numeric scan above (name/line only). TRIPWIRE: no apps/site surface
  // OTHER THAN lib/fleet.ts (where they are the FleetWiring field NAMES) may reference the identifiers
  // `served_by`/`integration_test` — the bare-identifier scan catches member access {a.wiring.served_by}
  // (m5) AND destructuring `const {served_by}=a.wiring` (A2, which the old `wiring\.served_by` regex missed).
  // DECLARED LIMIT: a text regex canNOT close reflective leaks (Object.values(a.wiring) /
  // JSON.stringify(a.wiring)). ADR-EC E6 lifts this tripwire for the DISTINCT digit-free `note` field ONLY
  // (rendered on /fleet, scanned digit-free by guard (1) above + site-honesty); served_by/integration_test
  // stay tripwired here (they carry digits, are never rendered).
  const wiringIdent = /\b(?:served_by|integration_test)\b/;
  const wiringLeakHits = surfaces
    .filter((s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && s.rel !== "apps/site/lib/fleet.ts" && wiringIdent.test(s.text))
    .map((s) => s.rel);
  assert.deepEqual(wiringLeakHits, [], `an apps/site surface (≠ lib/fleet.ts) references wiring identifiers served_by/integration_test (digit-hole tripwire) — ADR-W1 item (b) must land first: ${wiringLeakHits.join(", ")}`);

  // (5) The bespoke Ukemi Home panel reads its AgentCard STATUS from the register (ADR-M018 single source of
  // truth), not a hard-coded literal. NOT in NEW_SURFACES because its PanelBlock maturity attrs
  // (status="built"/"upcoming" at l.56/61/67/80) are legitimately literal; we anchor to the FIRST `status`
  // after `<AgentCard` (the AgentCard's own — mark/name carry no "status"), so those PanelBlock literals stay
  // out of view. Named mutants: status="built" (m3) AND status={"built"} (A1, JSX-wrapped literal the old
  // `stMatch[1]==="{"` check let pass) ⇒ both red; status={IDENTIFIER} ⇒ green.
  const ukemiPanel = surfaces.find((s) => s.rel === "apps/site/components/ukemi-panel.tsx");
  assert.ok(ukemiPanel, "ukemi-panel.tsx must be scanned (false green)");
  assert.match(ukemiPanel.text, /from ["']@\/lib\/fleet["']/, "ukemi-panel must import the fleet register (single source of truth)");
  const acIdx = ukemiPanel.text.indexOf("<AgentCard");
  assert.ok(acIdx >= 0, "ukemi-panel must render an AgentCard (false green)");
  const stIdx = ukemiPanel.text.indexOf("status", acIdx);
  assert.ok(stIdx > acIdx, "the AgentCard must carry a status prop (false green)");
  const acStatus = ukemiPanel.text.slice(stIdx); // anchored at the AgentCard's own status prop
  // (a) not a hard-coded literal — attribute OR JSX-wrapped {"built"} (the guard (2) shape, anchored with ^).
  assert.ok(
    !/^status\s*=\s*\{?\s*["'](?:built|upcoming)["']/.test(acStatus),
    'ukemi-panel AgentCard status must not be a hard-coded literal (status="built" or status={"built"}) — read it from the register',
  );
  // (b) it IS a register read: status={IDENTIFIER} (e.g. status={UKEMI_STATUS}).
  assert.match(acStatus, /^status\s*=\s*\{\s*[A-Za-z_$][\w$.]*\s*\}/, "ukemi-panel AgentCard status must be status={IDENTIFIER} read from lib/fleet.ts");

  // (6) CONSUMPTION of wiring.note (ADR-EC E6; branchement rule) — the /fleet page MUST render the digit-free
  // note for the built agents. Without this render the note is inert metadata (MAST faux-vert / CA-11 unwired).
  // Mutant: delete the note render on /fleet ⇒ this reds. (served_by/integration_test stay non-rendered, guard (4).)
  const fleetPage = surfaces.find((s) => s.rel === "apps/site/app/fleet/page.tsx");
  assert.ok(fleetPage, "apps/site/app/fleet/page.tsx must be scanned (false green)");
  // Match the JSX EXPRESSION close `{…wiring.note}` (a prose mention of "wiring.note" in a comment has no
  // trailing `}`), so deleting the RENDER — not just the comment — reds this (measured false-green otherwise).
  assert.match(fleetPage.text, /wiring\.note\s*\}/, "the /fleet page must RENDER wiring.note as {…wiring.note} (ADR-EC E6 — else note is unwired metadata, CA-11)");
  // Decision 155: the built product's `served.note` is rendered on /bell (same E6 rule; mutant: delete the render ⇒ red).
  const bellPage = surfaces.find((s) => s.rel === "apps/site/app/bell/page.tsx");
  assert.ok(bellPage, "apps/site/app/bell/page.tsx must be scanned (false green)");
  assert.match(bellPage.text, /served\.note\s*\}/, "the /bell page must RENDER the built product's served.note as {…served.note} (ADR-EC E6, decision 155)");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// ADR-EC E3 (checkpoint-1 C-5) — the wiring TEST_ROOTS walked by guard (3) above ARE a documented list, and
// the exclusion of packages/*/test/ is documented WITH a reason. Guard (3) derives its walk from
// WIRING_TEST_ROOTS; this test pins that WIRING_TEST_ROOTS ⇔ the rationale map (neither drifts), that no
// wiring root is a package test root, and that the packages/*/test/ exclusion carries a non-empty reason.
// Mutant: add "packages/hikae/test" to WIRING_TEST_ROOTS without a rationale entry ⇒ (a) reds (⇔ broken);
// add it WITH a rationale ⇒ (b) reds (a wiring root must not be a package test root). Proof + sha256 restore
// in docs/G1-lot-e-registre.md. Run by `npm test`, OUTSIDE the per-lot R-25 count.
test("wiring_test_roots_exclusion_is_declared — TEST_ROOTS ⇔ a documented list; packages/*/test excluded (ADR-EC E3, C-5)", () => {
  // (a) ⇔ : the roots guard (3) walks are EXACTLY the documented (rationale) roots — a root added to the walk
  //     without a rationale entry (or a rationale entry with no walked root) reds here.
  assert.deepEqual(
    [...WIRING_TEST_ROOTS].sort(),
    Object.keys(WIRING_TEST_ROOTS_RATIONALE).sort(),
    "WIRING_TEST_ROOTS must equal the keys of WIRING_TEST_ROOTS_RATIONALE (⇔ — no undocumented root, no orphan rationale)",
  );
  // (b) every included root carries a non-empty reason AND is NOT a package test root (packages/*/test/ is
  //     the documented EXCLUSION, not an inclusion).
  for (const [root, why] of Object.entries(WIRING_TEST_ROOTS_RATIONALE)) {
    assert.ok(why.trim().length > 0, `wiring test root ${root} must carry a non-empty rationale`);
    assert.doesNotMatch(root, /^packages\//, `packages/*/test is NOT a wiring root (it is documented as EXCLUDED): ${root}`);
  }
  // (c) the exclusion of packages/*/test/ is DECLARED, names a packages path, and carries a reason (why a
  //     package unit test is not a served-pipe integration test — ADR-M018 D1).
  assert.ok(Object.keys(WIRING_TEST_ROOTS_EXCLUDED).length >= 1, "the packages/*/test exclusion must be declared (ADR-EC E3)");
  for (const [root, why] of Object.entries(WIRING_TEST_ROOTS_EXCLUDED)) {
    assert.match(root, /^packages\//, `the documented exclusion must name a packages/*/test path: ${root}`);
    assert.ok(why.trim().length > 0, `excluded root ${root} must carry a non-empty reason`);
  }
});

// Dōjō register (ADR-DOJO-PR-4 D-3; C-V-4 of its checkpoint-1): apart from the fleet register (lib/fleet.ts unchanged), its one
// piece, the hold snapshot, stays upcoming until the piece's G7. The guard states what "built" needs, on the SAME
// WIRING_TEST_ROOTS: a served path, its integration tests declared under those roots (the two of the piece's condition among
// them), a note without digits, a committed record listed in the site manifest (so the committed leg of
// dojo_served_data_matches_deploy_ca ran on it) and a unit version in force in that record. Named mutants: M-P4, M-P18, M-P21.
// killer: apps/site/lib/dojo-register.ts:19 CONST "piece.status" -> "'built'"
test("dojo_register_is_frozen — the hold snapshot is upcoming; built only with a served path, its integration tests under the wiring roots, a committed record in the site manifest and a unit version in force", () => {
  const corpus = WIRING_TEST_ROOTS.map((r) => join(ROOT, ...r.split("/"))).flatMap((dir) =>
    existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".test.ts")).map((n) => readFileSync(join(dir, n), "utf8")) : []).join("\n");
  assert.ok(corpus.length > 0, "no *.test.ts under the wiring roots (false green)");
  const legs = ["dojo_snapshot_composes_served_lines_to_page_figures", "dojo_served_data_matches_deploy_ca"];
  /** Why the register may not say built: [] when its piece is upcoming or every condition holds. */
  const refusals = (register: DojoRegister, record: { head: { price_version: number | null } } | null): string[] =>
    register.pieces.flatMap((p) => {
      if (p.status !== "built") return [];
      const ids = p.served.tests.map((t) => t.trim()), out: string[] = [];
      if (p.served.path.trim() === "") out.push("no served path");
      if (ids.length === 0 || new Set(ids).size !== ids.length) out.push("no distinct integration tests");
      for (const id of ids) if (!/^[A-Za-z0-9_]+$/.test(id) || !new RegExp(`test\\(\\s*["']${id}(?:["']| — )`).test(corpus)) out.push(`no test ${id} under the wiring roots`);
      for (const id of legs) if (!ids.includes(id)) out.push(`the integration tests omit ${id}`);
      if (p.served.note.trim() === "" || /\d/.test(p.served.note)) out.push("a blank note or a note with a digit");
      if (record === null) out.push("no committed record in the site manifest: the committed leg has not run");
      else if (record.head.price_version === null) out.push("the committed record carries no unit version");
      return out;
    });
  // (1) the register as committed, beside the record the page's loader reads (null before any served snapshot).
  assert.deepEqual(refusals(DOJO_REGISTER, loadDojoServed(ROOT)), [], "the register says built without its conditions");
  assert.equal(DOJO_REGISTER.program, "MONARK Dōjō");
  assert.deepEqual(DOJO_REGISTER.pieces.map((p) => [p.key, p.status]), [["hold-snapshot", "upcoming"]], "the hold snapshot stays upcoming until the piece's G7");
  assert.equal(holdSnapshotStatus(), "upcoming", "the function the page calls reads the register's status, never another");
  assert.throws(() => holdSnapshotStatus({ program: "MONARK Dōjō", pieces: [] }), /hold snapshot is missing/, "a register without the piece: no silent fallback");
  // (2) the guard is live: each condition missing is refused (M-P4, M-P18, M-P21). Since PR-4a-2 the committed leg's test is written,
  // with the sync that writes the record it reads: every condition met admits built, and a test not written is refused.
  const built = (served: DojoServedPath): DojoRegister => ({ program: "MONARK Dōjō", pieces: [{ key: "hold-snapshot", name: "hold snapshot", status: "built", served }] });
  const served: DojoServedPath = { path: "the page /dojo, built from the committed record", tests: legs, note: "the figures of the committed record" };
  const withVersion = { head: { price_version: 1 } }, noVersion = { head: { price_version: null } };
  assert.ok(refusals(built({ ...served, path: " " }), withVersion).includes("no served path"), "M-P4: built without a served path");
  assert.ok(refusals(built(served), null).includes("no committed record in the site manifest: the committed leg has not run"), "M-P18");
  assert.ok(refusals(built(served), noVersion).includes("the committed record carries no unit version"), "M-P21: built on a record without a unit version");
  assert.ok(refusals(built({ ...served, note: "read on day 60" }), withVersion).includes("a blank note or a note with a digit"), "a note with a digit");
  for (const note of ["validated from 2026-11-09", "see ADR-M018", "rule R-25"]) assert.ok(refusals(built({ ...served, note }), withVersion).includes("a blank note or a note with a digit"), note);
  assert.deepEqual(refusals(built(served), withVersion), [], "every condition met: the register may say built");
  const unwritten = refusals(built({ ...served, tests: [...legs, "dojo_leg_not_written"] }), withVersion);
  assert.deepEqual(unwritten, ["no test dojo_leg_not_written under the wiring roots"], "a test not written is refused");
  assert.ok(existsSync(join(ROOT, "scripts", "sync-dojo-served.mjs")), "the committed leg comes with the sync that writes the record it reads");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2c (ADR-M004 D14 / PLAN F-2c C-4) — the site-scope vocab gate bans unambiguous third-party
// platform names so product wiring stays generic on the public storefront. Live end-to-end mutant
// (real CLI, exit code, sha256 restore) is in docs/G1-lot-F2c.md; this locks the closed list and its
// discriminating boundaries so the scope cannot drift silently.
test("vocab_site_scope_bans_third_party_platforms — nine platform brands redden in apps/site (F-2c C-4)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    scan: { site?: { banned: { re: string; why: string }[] } };
  };
  const site = cfg.scan.site;
  assert.ok(site, "scope 'site' missing from vocab-banned.json (C-4)");
  const res = site.banned.map((b) => new RegExp(b.re, "i"));

  // Each unambiguous brand reddens inside a rendered sentence.
  for (const w of ["Aave", "Polymarket", "Kalshi", "Pendle", "Hyperliquid", "HIP-3", "Arrakis", "UMA", "Gamma"]) {
    assert.ok(res.some((re) => re.test(`settle on ${w} today`)), `no site-scope pattern reddens '${w}'`);
  }

  // Discriminating: the strict \b...\b boundary keeps substrings green (no false positive on the tree).
  for (const green of ["a human review", "in summary", "Pendleton Street", "a gammaglobulin dose"]) {
    assert.ok(!res.some((re) => re.test(green)), `'${green}' must stay green (word-boundary false-positive guard)`);
  }

  // KNOWN LIMIT (declared for checkpoint-2, docs/G1-lot-F2c.md): the gate is case-insensitive, so the
  // standalone options-greek word 'gamma' also reddens. Acceptable today (no such prose in-tree); a
  // future need would take a dated addendum (like D13). Asserted, not hidden.
  assert.ok(res.some((re) => re.test("the gamma of the option")), "standalone 'gamma' reddens (declared limit, checkpoint-2)");

  // 'Safe' is DELIBERATELY not listed (ambiguous English word AND a multisig brand) — manual review,
  // declared for checkpoint-2. Guard the decision so a silent add of a naked \bSafe\b becomes visible.
  assert.ok(!res.some((re) => re.test("keep your funds safe")), "'safe' must stay green (ambiguous; manual control declared)");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-site-3 (ADR-M004 D15 / checkpoint-1 C-9) — the gate sim's action vocabulary is DERIVED from the
// frozen gate-decision.schema.json, never hard-coded. lib/gate-enums.ts loads the `action` enum; the
// client sim resolves the third action (also a CoverageVerdict field name, which may not be a literal in
// apps/site) by INDEX. This root test PINS the loaded order [commit, defer, abstain] and ties lib/sim.ts's
// ACTION_* indices to it, so the derived type + the index resolution stay honest. This test file lives at
// the repo ROOT (outside apps/site), so spelling out the third action word here is fine — the
// frozen_contract_fields gate only scans apps/site surfaces. Named mutant (G2): reorder the `action`
// enum in the schema => this test reds (run `node --test test/ci-gates.test.ts` alone;
// contracts-frozen.test.ts also reds — expected, that is the byte-freeze). Proof + sha256 restore in
// docs/G1-lot-fsite-3.md.
test("gate_action_enum_order_is_frozen — action=[commit,defer,abstain]; sim indices track it (C-9)", () => {
  const { actions, reasons } = loadGateEnums(ROOT);
  // The order the client indexes by. A reorder in the schema reds HERE.
  assert.deepEqual(actions, ["commit", "defer", "abstain"], "action enum order changed (schema drift)");
  assert.equal(reasons.length, 18, "gate-decision reason enum must carry the eighteen closed reasons (contract 1.1.0)");
  // lib/sim.ts resolves each action from the loaded enum by index — the load-bearing link. If the enum is
  // reordered, actions[ACTION_ABSTAIN] stops being the third action and this reds. (The derived type
  // GateAction is `string`; it is THIS test, not the type, that catches a reorder.)
  assert.equal(actions[ACTION_COMMIT], "commit", "ACTION_COMMIT must index the commit action");
  assert.equal(actions[ACTION_DEFER], "defer", "ACTION_DEFER must index the defer action");
  assert.equal(actions[ACTION_ABSTAIN], "abstain", "ACTION_ABSTAIN must index the third action");
});

// Lot F-site-3 (checkpoint-1 / G2 review R1) — HONESTY GATE: every reason code the sim can EMIT in a
// rendered position (region/decision read-outs, the decision log, gateJson's reason) MUST be a member of
// the FROZEN gate-decision `reason` enum (thirteen closed codes). Reason codes are NOT contract fields, so
// the sim writes them as plain literals; nothing else guaranteed they stay inside the frozen enum. The
// emissible SET is built by DRIVING the exported pure policy decide() (lib/sim.ts) over one input per
// branch — never a hard-coded list — so a reason literal edited in lib/sim.ts flows through to `emitted`
// here and reddens THIS test (sole-red mutant proof: `reason: "covered"` -> "covered_XX" in lib/sim.ts
// reddens this test alone under `node --test test/ci-gates.test.ts`). decide() is the SOLE emitter:
// SimState.reason, LogRow.reason and gateJson()'s reason are all set from its Decision.reason.
// use-gate-sim.ts emits nothing (its REASON_BUDGET_EXHAUSTED is a COMPARISON constant only — a drift
// there breaks epoch auto-recovery, a behavioural bug, not a rendered-honesty one) AND is un-importable
// here anyway ("use client" + React hooks + the @/ alias do not resolve under `node --test`); lib/sim.ts
// is a plain module (no JSX/DOM/node: imports), so importing decide/fresh from it is both correct and the
// only viable path. The five branches are traced to their decide() source lines:
//   L130 upstream_timeout      — input.timeout
//   L135 set_too_large         — |reading| <= spread  (labels collapse to {up,down})
//   L138 intent_not_in_region  — single label != intent
//   L141 budget_exhausted      — budget < COST
//   L143 covered               — otherwise
test("sim_emitted_reason_codes_subset_of_frozen_enum — every reason the sim renders is in the frozen enum (R1)", () => {
  const { reasons } = loadGateEnums(ROOT);
  assert.equal(reasons.length, 18, "frozen gate-decision reason enum must carry the eighteen closed codes (contract 1.1.0)");
  const frozen = new Set(reasons);

  const base = fresh();
  const emitted = new Set(
    [
      decide(base, { reading: 0.8, spread: 0.25, intent: "up", timeout: true }), // upstream_timeout (L130)
      decide(base, { reading: 0.1, spread: 0.35, intent: "up", timeout: false }), // set_too_large (L135)
      decide(base, { reading: 0.8, spread: 0.25, intent: "down", timeout: false }), // intent_not_in_region (L138)
      decide({ ...base, budget: 0 }, { reading: 0.8, spread: 0.25, intent: "up", timeout: false }), // budget_exhausted (L141)
      decide(base, { reading: 0.8, spread: 0.25, intent: "up", timeout: false }), // covered (L143)
    ].map((d) => d.reason),
  );

  // Completeness (non-vacuity): the five branch-covering inputs reach five DISTINCT codes, so the
  // membership check below is never vacuously true and drift in any exercised branch is observed. A future
  // lot that adds a decide() branch must extend both this input list and this count (declared limit).
  assert.equal(emitted.size, 5, `expected 5 distinct emissible reason codes, saw {${[...emitted].join(", ")}}`);

  // The honesty invariant: every code the sim can render MUST be a member of the frozen reason enum.
  const offenders = [...emitted].filter((r) => !frozen.has(r));
  assert.deepEqual(
    offenders,
    [],
    `sim emits reason code(s) NOT in the frozen gate-decision reason enum: ${offenders.join(", ")}`,
  );
});

// Lot F-site-3 (checkpoint-1 C-4 / ADR-M004 D15) — the sim's RENDERED-LABEL data (the diagram sensor
// labels and the ambient intents) render via {property access}, which the honesty lint (test 44) never
// scans, so a digit there would render un-caught. Mirror of the fleet register numeric-hole closure: scan
// every rendered sim string with the SAME detector. The JSON view's numeric OUTPUT (alpha,
// remaining_budget, schema_version, task-class) is INTENTIONALLY not scanned here — it is the sim's
// illustrative output rendered via a CALL ({gateJson(...)}), honest by construction per honesty-lint a8
// + ADR-M004 D15 + the C-5 caveat (declared, not a hole).
test("gate_sim_rendered_labels_have_no_numeric_hole — sim label data carries zero rendered digit (C-4)", () => {
  const noExempt = new Set<string>();
  const simStrings: string[] = [];
  for (const n of SENSOR_NODES) simStrings.push(n.label);
  for (const a of AMBIENT) simStrings.push(a.intent);
  assert.ok(simStrings.length >= 1, "no sim label strings scanned (false green)");
  const numericHits = simStrings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a rendered sim label carries a numeric literal: ${JSON.stringify(numericHits)}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-site-4 (checkpoint-1 C-4 / ADR-M004 D15) — the NEW home data modules (agents-presentation,
// profiles) render via {property access}, which the honesty lint (test 44) never scans, so a digit there
// would render un-caught. Mirror of the fleet-register + sim-label numeric-hole closures: scan every
// RENDERED string (name/kanji for agents; label/product name for profiles) with the same detector. The
// `accent` (a style value, e.g. a hex) and `engineKeys`/`n` (never rendered as text) are intentionally
// out of scope. Named mutant: put a digit in a kanji/label/product name ⇒ this reds.
test("home_data_modules_have_no_numeric_hole — presentation + profiles carry zero rendered digit (F-site-4 C-4)", () => {
  const noExempt = new Set<string>();
  const strings: string[] = [];
  for (const a of AGENTS_PRESENTATION) strings.push(a.name, a.kanji);
  for (const p of PICKER_PROFILES) strings.push(p.label, p.productName);
  assert.ok(strings.length >= 1, "no home data strings scanned (false green)");
  const numericHits = strings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a home data string carries a rendered numeric literal: ${JSON.stringify(numericHits)}`);
});

// Lot F-site-4 (checkpoint-2 K-2 / C-6) — the honesty-lint EXEMPTION INERTIA GUARD. The closed list
// (apps/site/test/honesty-lint.exempt.json) may only carry a token that is ACTUALLY rendered somewhere
// under apps/site; an entry with no rendered carrier is inert (a hole waiting to launder a future digit)
// and reds here. This guard enters with the first exemptions (the 01-04 section ordinals). Two named
// mutants: (a) add {value:"99"} with no carrier ⇒ (a) reds; (b) add {value:"5"} (a bare single digit that
// would gut the detector, inventory §4a a3) ⇒ (b) reds. (c) proves the exemptions are load-bearing: with an
// EMPTY exempt set the SAME whole-tree walker (scanAppsSite) reds each entry at its carrier — so test 44
// proper (which uses the real list) is green precisely BECAUSE these carriers are exempted, not absent.
test("honesty_exempt_entries_have_rendered_carrier — no inert exemption, no gutting bare digit (F-site-4 C-6/K-2)", () => {
  const ex = loadExemptFile(ROOT);
  assert.ok(ex.entries.length >= 1, "expected at least the 01-04 section ordinals (false green)");
  const noExempt = new Set<string>();

  // Every EXACT numeric token that appears in a RENDERED-TEXT position (renderedTexts) across apps/site.
  const renderedTokens = new Set<string>();
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site surfaces scanned (false green)");
  for (const s of surfaces) {
    const kind = s.rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(s.rel, s.text, ts.ScriptTarget.Latest, true, kind);
    for (const rt of renderedTexts(sf)) {
      for (const tok of scanNumericText(rt.text, noExempt)) renderedTokens.add(tok);
    }
  }

  // (a) NON-INERT — every exempt value is an EXACT rendered token somewhere.
  for (const e of ex.entries) {
    assert.ok(
      renderedTokens.has(e.value),
      `exempt '${e.value}' matches no rendered numeric token under apps/site — inert exemption (C-6/K-2)`,
    );
  }
  // (b) no bare single digit — it would gut the numeric detector.
  for (const e of ex.entries) {
    assert.ok(!/^\d$/.test(e.value), `exempt '${e.value}' is a bare single digit — it would gut the detector (C-6)`);
  }
  // (c) LOAD-BEARING — with an EMPTY exempt set the whole-tree walker reds each entry at its carrier.
  const unexemptedTokens = new Set(scanAppsSite(ROOT, noExempt).violations.map((v) => v.token));
  for (const e of ex.entries) {
    assert.ok(
      unexemptedTokens.has(e.value),
      `removing the exemptions must red '${e.value}' at its carrier (load-bearing, C-6)`,
    );
  }
});

// Lot F-site-4 (checkpoint-1 C-5 / G2 reserve R5) — the ILLUSTRATIVE caveat is present at EVERY sim mount.
// The caveat wording lives in lib/sim.ts (CAVEAT), imported by all mounts; this guard pins the wording and
// that the board mount (board.tsx) AND the explainer + token mounts (index.tsx) each render it, plus the
// explainer's illustrative-α clause. Named mutants: delete {CAVEAT} from board.tsx ⇒ (b) reds; delete a
// <Caveat/> from index.tsx ⇒ (b) reds; weaken the CAVEAT wording ⇒ (a) reds.
test("gate_sim_caveat_present_in_all_mounts — illustrative C-5 caveat at every mount (F-site-4 R5)", () => {
  // (a) the wording carries the illustrative disclaimer.
  assert.match(CAVEAT, /illustrative/i, "the caveat must call the sim illustrative");
  assert.match(CAVEAT, /not market activity/i, "the caveat must deny market activity");
  // (b) every mount renders it: the board mount (board.tsx) + the explainer & token mounts (index.tsx).
  const board = readFileSync(join(ROOT, "apps", "site", "components", "gate-sim", "board.tsx"), "utf8");
  const index = readFileSync(join(ROOT, "apps", "site", "components", "gate-sim", "index.tsx"), "utf8");
  assert.match(board, /\{CAVEAT\}/, "the board mount (board.tsx) must render {CAVEAT} (R5/C-5)");
  const caveatMounts = (index.match(/<Caveat\s*\/>/g) ?? []).length;
  assert.ok(caveatMounts >= 2, `index.tsx must render <Caveat/> in the explainer AND token mounts (saw ${caveatMounts})`);
  // (c) the explainer qualifies α as illustrative (R5).
  assert.match(index, /illustrative/i, "the explainer must qualify the α it shows as illustrative (R5)");
});

// Lot F-site-5 (K-4(b) / checkpoint-2, owner F-site-5) — the sim's illustrative GateDecision JSON view
// (lib/sim.ts gateJson, mounted on the How explainer) is an ABBREVIATED read-out; every key it renders
// MUST be a real property of the frozen contract it stands for: top-level keys ⊆ GateDecision.properties,
// and the nested verdict's keys ⊆ CoverageVerdict.properties. A foreign/invented key (a "p_correct"
// slipped into the view) would render an honesty violation the schemas forbid (additionalProperties:
// false). Pattern R1 (like sim_emitted_reason_codes...): DRIVE the real gateJson() over a region-present
// state — never a hard-coded key list — so a key edited in lib/sim.ts flows through to `parsed` here.
// This is DISTINCT from frozen_contract_fields_stay_dynamic (which forbids hard-coding field NAMES as
// quoted literals in apps/site): that guards the SPELLING, this guards the SHAPE the sim emits — no
// duplication: F-site-8's R1 (now merged on main) extends the field-NAME gate (spelling of frozen fields
// as quoted literals); THIS gate guards the SHAPE gateJson() emits (keys ⊆ contract properties) — orthogonal.
// Named mutant (G2): add `p_correct: 0` to gateJson's `view` (or its `verdict`) ⇒ this reds alone under
// `node --test test/ci-gates.test.ts`. Live proof + sha256 restore in docs/G1-lot-fsite-5.md.
test("gate_sim_json_keys_subset_of_frozen_contracts — sim JSON view keys are all frozen-contract properties (K-4b)", () => {
  const propsOf = (file: string): Set<string> => {
    const schema = JSON.parse(readFileSync(join(ROOT, "schemas", file), "utf8")) as {
      properties?: Record<string, unknown>;
    };
    return new Set(Object.keys(schema.properties ?? {}));
  };
  const gateProps = propsOf("gate-decision.schema.json");
  const verdictProps = propsOf("coverage-verdict.schema.json");
  assert.ok(gateProps.size >= 1 && verdictProps.size >= 1, "frozen contract properties not loaded (false green)");

  const { actions } = loadGateEnums(ROOT);
  // Drive the region-present ("covered") branch so `verdict` is an OBJECT, not the ELLIPSIS placeholder —
  // otherwise the verdict-key check below would pass VACUOUSLY (non-vacuity, mirrors the R1 emitted.size).
  const state = push(fresh(), { reading: 0.8, spread: 0.25, intent: "up", timeout: false });
  const parsed = JSON.parse(gateJson(state, actions)) as { verdict?: unknown } & Record<string, unknown>;

  const topForeign = Object.keys(parsed).filter((k) => !gateProps.has(k));
  assert.deepEqual(topForeign, [], `gateJson() emits top-level key(s) not in GateDecision: ${topForeign.join(", ")}`);

  assert.equal(typeof parsed.verdict, "object", "expected a region-present verdict OBJECT (non-vacuity)");
  assert.ok(parsed.verdict !== null, "verdict must not be null in the covered branch");
  const verdictForeign = Object.keys(parsed.verdict as Record<string, unknown>).filter((k) => !verdictProps.has(k));
  assert.deepEqual(verdictForeign, [], `gateJson() verdict emits key(s) not in CoverageVerdict: ${verdictForeign.join(", ")}`);
});

// Lot F-site-5 (R2, PLAN §8 owner F-site-5 / C-4) — the How page renders the region vocabulary and the
// reason/outcome glosses (lib/how-copy.ts) via {property access}, which the honesty lint (test 44) never
// scans, so a stray digit there (a "top-3 labels") would render un-caught. Mirror of the sim/register
// numeric-hole closures: scan every rendered How-copy string with the SAME detector. ALSO pins the
// 13-reasons grid to the frozen enum: the grid renders codes FROM loadGateEnums() and glosses them by
// code, so this proves the gloss table is complete AND has no phantom code (BIDIRECTIONAL) — the grid can
// neither drift from nor outrun the frozen reason enum. Imports the pure data module (no JSX / no @-alias)
// like lib/sim.ts. Live proof in docs/G1-lot-fsite-5.md.
test("how_page_rendered_vocab_has_no_numeric_hole — region + reason copy carries zero rendered digit; glosses match the enum (R2)", () => {
  const noExempt = new Set<string>();
  const strings: string[] = [];
  for (const o of OUTCOMES) strings.push(o.gloss);
  for (const rk of REGION_KINDS) strings.push(rk.eyebrow, rk.title, ...rk.example);
  for (const [, meta] of Object.entries(REASON_GLOSS)) strings.push(meta.gloss);
  assert.ok(strings.length >= 1, "no How-copy strings scanned (false green)");
  const numericHits = strings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a rendered How-copy string carries a numeric literal: ${JSON.stringify(numericHits)}`);

  // The reason grid renders one card per FROZEN enum code (loadGateEnums), reading its gloss from
  // REASON_GLOSS. Completeness must be BIDIRECTIONAL: every enum code has a gloss (no blank card) AND
  // every gloss key is a real enum code (no phantom card). A new reason in the schema without a gloss —
  // or a stale gloss for a removed reason — reds here (a new reason needs an ADR, not a silent deploy).
  const { actions, reasons } = loadGateEnums(ROOT);
  const enumSet = new Set(reasons);
  const missing = reasons.filter((r) => !(r in REASON_GLOSS));
  const phantom = Object.keys(REASON_GLOSS).filter((k) => !enumSet.has(k));
  assert.deepEqual(missing, [], `frozen reason code(s) with no How gloss: ${missing.join(", ")}`);
  assert.deepEqual(phantom, [], `How gloss(es) for a non-existent reason code: ${phantom.join(", ")}`);

  // Every tone (region cards, reasons, outcomes) must index a real action lane [commit, defer, abstain] —
  // the page resolves the action WORD + colour by this index; an out-of-range tone would mis-label.
  const tones = [...OUTCOMES.map((o) => o.tone), ...Object.values(REASON_GLOSS).map((m) => m.tone)];
  for (const t of tones) assert.ok(t >= 0 && t < actions.length, `a How tone ${t} is outside the frozen action enum`);
});

// ---------------------------------------------------------------------------
// Root test `series_pinned_are_declared_and_hashed` — ADR-M003 D9 sexies (Lot R-25-series).
// The r25 job excludes sha-pinned DATA SERIES (fixtures/**/*.{json,jsonl,csv} and
// apps/sentinel/test/fixtures/**, with :(glob) magic — the bare form matches NOTHING in git's default
// pathspec mode, measured 2026-09-19) from the R-25 lot-size count. This root test is the safety
// condition D9 sexies (a): EVERY excluded data file MUST be declared AND hashed in a same-dir declaration
// — a PROVENANCE-*.md, or fixtures/manifest.json (a closed hashed set already enforced by
// fixtures_root_valid, so the nine gate states are NOT duplicated). Reds on: an orphan file (added with no
// declaration); an altered byte (recomputed sha != declaration); a CODE file (.ts/.mjs/.js) under an
// excluded root (condition c — no code disguised as data). It also asserts SET EQUALITY between the
// :(glob) exclusion pathspecs wired in ci.yml and the derived source of truth (SERIES_EXCLUDED_ROOTS x
// exts) — neither a dropped nor an extra pathspec (checkpoint-2 C-1) — EXCEPT the D9 septies docs pathspec
// ':(exclude,glob)docs/**/*.md' (governance docs, NOT a data series: whitelisted via NON_SERIES_GLOB, asserted
// instead by test 38 (4ter)); M11 stays red for any OTHER unexpected :(glob) pathspec. Named mutants
// (docs/G1-lot-r25-series.md): M3 fixtures/zz.json with no declaration => red; M2 two shas permuted in a
// table => red; M4 fixtures/zz.ts => red; M5 book.json/full-book.json siblings each on its own line =>
// GREEN (token match, C-2a); M6b a sha moved under `## History` => red (rule (ii) removed, C-2b); M8 one
// byte added to a fixture => red; M1/M10 a pathspec losing ,glob => red; M11 a 7th pathspec in ci.yml =>
// red. Run by `npm test`, OUTSIDE the per-lot R-25 count.
// Single source of truth for the R-25 series exclusion (ADR-M003 D9 sexies). POSIX strings, so the
// derived pathspecs are byte-identical on win32 and Linux CI (checkpoint-2 C-1); join(ROOT, rel) still
// normalizes them for the FS walk, and the walk flips `\\`->`/` before comparing.
const SERIES_EXCLUDED_ROOTS = ["fixtures", "apps/sentinel/test/fixtures", "apps/bell/test/fixtures/series"];
const SERIES_DATA_EXTS = new Set([".json", ".jsonl", ".csv"]);
const SERIES_CODE_EXTS = new Set([".ts", ".mts", ".cts", ".mjs", ".cjs", ".js"]);
// The pathspecs the r25 job MUST carry — DERIVED from the roots x exts above (never a parallel hand-kept
// list), so ci.yml and this test can be checked for SET EQUALITY (checkpoint-2 C-1, mutant M11: a 7th
// :(glob) pathspec in ci.yml with no marched root here used to stay green). :(glob) is mandatory (the
// bare form matches nothing — measured 2026-09-19).
// ADR-M003 D9 septdecies (lot R25-REGISTRY-ROOT-1): one more root, the wave registries the harness reads byte for byte
// (REGISTRY_ROOT, scripts/registry-root.mjs), with the .json extension ONLY; its own root test is kata_registry_root_is_wave_registries_only.
const SERIES_EXCLUDE_PATHSPECS = [
  ...SERIES_EXCLUDED_ROOTS.flatMap((root) => [...SERIES_DATA_EXTS].map((ext) => `:(exclude,glob)${root}/**/*${ext}`)),
  `:(exclude,glob)${REGISTRY_ROOT}/**/*.json`,
];

function seriesWalk(absDir: string): string[] {
  const out: string[] = [];
  const stack: string[] = [absDir];
  for (let cur = stack.pop(); cur !== undefined; cur = stack.pop()) {
    for (const name of readdirSync(cur)) {
      const abs = join(cur, name);
      if (statSync(abs).isDirectory()) stack.push(abs);
      else out.push(abs);
    }
  }
  return out;
}

function seriesLfSha256(abs: string): string {
  return createHash("sha256").update(readFileSync(abs, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

test("series_pinned_are_declared_and_hashed — every R-25-excluded data file is declared + hashed same-dir (ADR-M003 D9 sexies)", () => {
  // SET EQUALITY between the r25 job's :(glob) exclusion pathspecs and the derived source of truth —
  // neither missing nor extra. `missing`: a required pathspec absent from ci.yml — matched on the FULL
  // single-quoted token because ".json" is a substring of ".jsonl", so a bare includes stays green when
  // the .json pathspec loses its ,glob (G2 C1, mutant M1/M10). `extra`: a :(glob) pathspec present in
  // ci.yml whose root is NOT in SERIES_EXCLUDED_ROOTS — it would drop files from the R-25 count with no
  // declaration guard here (checkpoint-2 C-1, mutant M11).
  const wfGlobPathspecs = [...WF.matchAll(/'(:\(exclude,glob\)[^']+)'/g)]
    .map((m) => m[1])
    .filter((s): s is string => s !== undefined);
  // ADR-M003 D9 septies: docs/**/*.md is a :(glob) exclusion that is NOT a data series — it excludes
  // governance docs from the R-25 count (asserted by test 38 (4ter)), not a fixtures data series. Whitelist it
  // from this series SET EQUALITY so it does not read as an "extra" data pathspec; mutant M11 stays intact for
  // any OTHER unexpected :(glob) pathspec. ADR-M013 amendment 2026-09-24 (investor decision 207): the five storefront
  // CONTENT excludes of the CODE count are not data series either; they are whitelisted from the SAME ADR-derived list
  // that test 38 (4quater) couples to the workflow (never a hand-kept copy), so M11 stays red for any other one.
  const NON_SERIES_GLOB = new Set([":(exclude,glob)docs/**/*.md", ...CONTENT_CODE_EXCLUDES]);
  const missing = SERIES_EXCLUDE_PATHSPECS.filter((ps) => !WF.includes("'" + ps + "'"));
  const extra = [...new Set(wfGlobPathspecs)].filter(
    (ps) => !SERIES_EXCLUDE_PATHSPECS.includes(ps) && !NON_SERIES_GLOB.has(ps),
  );
  assert.deepEqual(missing, [], `r25 job is missing exclusion pathspec(s): ${missing.join(", ")} (ADR-M003 D9 sexies)`);
  assert.deepEqual(
    extra,
    [],
    `r25 job carries :(glob) exclusion pathspec(s) with no marched root in SERIES_EXCLUDED_ROOTS: ${extra.join(", ")} ` +
      `(add the root to the source of truth — ADR-M003 D9 sexies; G2 checkpoint-2 C-1 / mutant M11)`,
  );

  const checked = new Set<string>();
  for (const rootRel of SERIES_EXCLUDED_ROOTS) {
    const root = join(ROOT, rootRel);
    if (!existsSync(root)) continue;
    for (const abs of seriesWalk(root)) {
      const rel = abs.slice(ROOT.length + 1).replace(/\\/g, "/");
      const ext = extname(abs);

      // Condition (c): no code disguised as a data series under an excluded root.
      assert.ok(
        !SERIES_CODE_EXTS.has(ext),
        `code file under an R-25-excluded root: ${rel} — only .json/.jsonl/.csv data may live there (D9 sexies c)`,
      );
      if (!SERIES_DATA_EXTS.has(ext)) continue;

      // Condition (a): declared + hashed in a same-dir declaration (its filename AND its LF sha256 present).
      const dir = dirname(abs);
      const self = basename(abs);
      const sha = seriesLfSha256(abs);
      const declFiles = readdirSync(dir)
        .filter((n) => n !== self && (/^PROVENANCE-.*\.md$/.test(n) || n === "manifest.json"))
        .map((n) => join(dir, n));
      // Binding name<->sha (G2 R-25-series C2 + checkpoint-2 C-2): the sha must sit on the row/bullet that
      // names THIS file, SAME LINE ONLY. A permuted table (each sha present SOMEWHERE in the document) is
      // red (mutant perm). The former rule (ii) — "a heading above the sha names the file" — is REMOVED
      // (checkpoint-2 C-2b): it bound ANY nameless sha line of the document, e.g. a historical sha under a
      // `## History` heading (mutant M6b). Name matching is by TOKEN, delimited by line start/end, backtick,
      // `|`, space, `/` or a parenthesis (checkpoint-2 C-2a): a PATH prefix (`fixtures/x/book.json`) still
      // binds `book.json`, but a NAME prefix (`full-book.json`) does NOT bind the sibling `book.json`
      // (mutant M5), nor does `book.json` bind inside `book.jsonl`. manifest.json is parsed by key.
      const siblingData = readdirSync(dir).filter((n) => SERIES_DATA_EXTS.has(extname(n)));
      const DELIM = "`| /()"; // token boundaries around a filename
      const namesFile = (line: string, n: string): boolean => {
        const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[${DELIM}])${esc}($|[${DELIM}])`).test(line);
      };
      const bindsSelf = (line: string): boolean => {
        const named = siblingData.filter((n) => namesFile(line, n));
        return named.length === 1 && named[0] === self;
      };
      const declaredIn = declFiles.find((d) => {
        const text = readFileSync(d, "utf8");
        if (basename(d) === "manifest.json") {
          try {
            const m = JSON.parse(text) as Record<string, unknown>;
            return m[self] === sha;
          } catch {
            return false;
          }
        }
        // Same-line only: one line carries BOTH this file's exact sha AND its (token-delimited) name.
        return text.split(/\r?\n/).some((line) => line.includes(sha) && bindsSelf(line));
      });
      assert.ok(
        declaredIn !== undefined,
        `series file not declared+hashed same-dir: ${rel} (sha256 LF ${sha}). Add a PROVENANCE-*.md line in ` +
          `${dir.slice(ROOT.length + 1).replace(/\\/g, "/")} carrying its filename and this exact sha (D9 sexies a).`,
      );
      checked.add(rel);
    }
  }

  // Anchor both excluded roots concretely: a walk that silently reached nothing would be a false green.
  assert.ok(checked.has("fixtures/usde-calib-series.json"), "walk did not reach the usde series (broken fixtures root?)");
  assert.ok(
    checked.has("apps/sentinel/test/fixtures/usde-boundary-blocks.json"),
    "walk did not reach the sentinel boundary fixture (broken apps/sentinel/test/fixtures root?)",
  );
});

// Root test `kata_registry_root_is_wave_registries_only` — ADR-M003 D9 septdecies (lot R25-REGISTRY-ROOT-1). The r25 job excludes
// the wave registries of the harness by ONE pathspec, derived from REGISTRY_ROOT, .json only; the root holds nothing but declared,
// hashed, readable wave registries (the refusals (a) to (f) of scripts/registry-root.mjs, one by one in the next test).
// reddened by: the registry pathspec of the r25 job off the derived one, a registry root with a refusal, or (g) an absent root or a
// walk that misses wave1.json (PR 2 of the lot: the anchor is unconditional)
// killer: scripts/registry-root.mjs:16 CONST "data/kata/registry" -> "data/kata"
// killer: scripts/registry-root.mjs:39 CONST "registries.push(n);" -> ""
test("kata_registry_root_is_wave_registries_only — the R-25-excluded registry root holds only declared, hashed, readable wave registries (ADR-M003 D9 septdecies)", () => {
  assert.ok(WF.includes(`':(exclude,glob)${REGISTRY_ROOT}/**/*.json'`), "the r25 job excludes the registry root, .json only (ADR-M003 D9 septdecies)");
  const root = join(ROOT, REGISTRY_ROOT);
  // (g) PR 2 of the lot: the root holds the byte copy of wave1.json (recherches a43ad70), so the content check is unconditional; an
  // absent root reds here by an assertion, never by a skip.
  assert.ok(existsSync(root), `(g) the registry root ${REGISTRY_ROOT} exists, with wave1.json (ADR-M003 D9 septdecies)`);
  const { problems, registries } = registryRootProblems(root);
  assert.deepEqual(problems, [], "the registry root holds only declared, hashed, readable wave registries (ADR-M003 D9 septdecies)");
  assert.ok(registries.includes("wave1.json"), "(g) the walk reaches wave1.json");
});

// reddened by: a refusal (a) to (f) of registryRootProblems removed or loosened (each root built below names its own refusal); the
// not-UTF-8 branch of (c) by raw bytes that no UTF-8 decoder accepts (G2 B-2 of #206: a decoder made lenient, or its refusal dropped)
// killer: scripts/registry-root.mjs:45 CONST "r.includes(sha) && declaredWaves(r).join() === n" -> "r.includes(sha)"
test("kata_registry_root_problems_name_each_refusal (ADR-M003 D9 septdecies)", () => {
  const reg = (plan: string): string => JSON.stringify({ plan, engine: "e", trialRegistryHead: { length: 0, hash: "0".repeat(64) }, rows: [] });
  const empty = reg("p");
  const sha = (text: string | Uint8Array): string => createHash("sha256").update(text).digest("hex");
  const row = (n: string, text: string | Uint8Array): string => `| \`${n}\` | \`${sha(text)}\` | recherches |`;
  const codes = (files: Record<string, string | Uint8Array>, decl: string): string[] => {
    const dir = mkdtempSync(join(tmpdir(), "registry-root-"));
    try {
      for (const [n, text] of Object.entries(files)) {
        if (n.endsWith("/")) mkdirSync(join(dir, n)); else writeFileSync(join(dir, n), text);
      }
      writeFileSync(join(dir, REGISTRY_DECL), decl);
      return registryRootProblems(dir).problems.map((p) => p.slice(0, 3));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  };
  const good = { "wave1.json": empty }, decl1 = row("wave1.json", empty);
  assert.deepEqual(codes(good, decl1), [], "a declared, hashed, readable wave1.json passes");
  assert.deepEqual(codes({ ...good, "sub/": "" }, decl1), ["(a)"], "a subdirectory");
  for (const n of ["evil.ts", "notes.json", "wave01.json", "wave1.jsonl", "wave1.csv", "README.md"]) {
    assert.deepEqual(codes({ ...good, [n]: empty }, decl1), ["(b)"], `a file outside the closed list: ${n}`);
  }
  for (const [k, text] of [["CR", empty + "\r\n"], ["U+2028", reg("p\u2028")], ["U+2029", reg("p\u2029")]] as const) {
    assert.deepEqual(codes({ "wave1.json": text }, row("wave1.json", text)), ["(c)"], `a ${k}`);
  }
  assert.deepEqual(codes(good, row("wave1.json", empty + " ")), ["(d)"], "a sha256 that is not the file's");
  assert.deepEqual(codes(good, `${decl1} wave3.json`), ["(d)", "(e)"], "a row naming two registries binds neither");
  assert.deepEqual(codes(good, [decl1, row("wave2.json", empty)].join("\n")), ["(e)"], "a declared registry that is absent");
  assert.deepEqual(codes({ "wave1.json": "{}" }, row("wave1.json", "{}")), ["(f)"], "a registry readRegistry refuses");
  const notUtf8 = Uint8Array.from([0x7b, 0xff, 0x7d]);
  assert.deepEqual(codes({ "wave1.json": notUtf8 }, row("wave1.json", notUtf8)), ["(c)"], "a registry that is not UTF-8 (G2 B-2)");
  assert.deepEqual(codes({ ...good, "wave2.json": empty }, [decl1, row("wave2.json", empty)].join("\n")), ["(f)"], "no reader for wave2.json yet");
});

/** A registry root under `base` holding a declared, hashed, readable wave1.json (the refusal tests on links). */
const builtRegistryRoot = (base: string, name: string): string => {
  const root = join(base, name), wave = JSON.stringify({ plan: "p", engine: "e", trialRegistryHead: { length: 0, hash: "0".repeat(64) }, rows: [] });
  mkdirSync(root);
  writeFileSync(join(root, "wave1.json"), wave);
  writeFileSync(join(root, REGISTRY_DECL), `| \`wave1.json\` | \`${createHash("sha256").update(wave).digest("hex")}\` | recherches |`);
  return root;
};

// reddened by: a root reached through a symbolic link read as a closed root, or a linked subdirectory admitted (G2 B-1 of #206: git
// counts a link, not its target). Junctions on win32: no right needed (measured on this host).
// killer: scripts/registry-root.mjs:30 CONST "lstatSync(absRoot).isSymbolicLink()" -> "false"
test("kata_registry_root_refuses_a_linked_root_or_directory (ADR-M003 D9 septdecies)", () => {
  const base = mkdtempSync(join(tmpdir(), "registry-link-"));
  try {
    const plain = builtRegistryRoot(base, "plain");
    assert.deepEqual(registryRootProblems(plain).problems, [], "a plain root passes");
    const withDir = builtRegistryRoot(base, "with-dir");
    symlinkSync(join(base, "plain"), join(withDir, "sub"), "junction");
    assert.deepEqual(registryRootProblems(withDir).problems.map((p) => p.slice(0, 3)), ["(a)"], "a linked directory in the root");
    symlinkSync(plain, join(base, "linked-root"), "junction");
    assert.deepEqual(registryRootProblems(join(base, "linked-root")).problems, ["(a) the root is a symbolic link"], "a root reached through a link");
  } finally { rmSync(base, { recursive: true, force: true }); }
});

// reddened by: a registry read through its symbolic link, whose target lies outside the closed root and outside the R-25 count (G2
// B-1 of #206). A file link needs a right that some win32 hosts lack: then skipped, never green by accident.
// killer: scripts/registry-root.mjs:35 CONST "st.isSymbolicLink()" -> "false"
test("kata_registry_root_refuses_a_linked_registry (ADR-M003 D9 septdecies)", (t) => {
  const base = mkdtempSync(join(tmpdir(), "registry-link-"));
  try {
    const outside = builtRegistryRoot(base, "outside"), root = join(base, "root");
    mkdirSync(root);
    writeFileSync(join(root, REGISTRY_DECL), readFileSync(join(outside, REGISTRY_DECL)));
    try { symlinkSync(join(outside, "wave1.json"), join(root, "wave1.json"), "file"); } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EPERM") { t.skip("no right to create a file symbolic link on this host"); return; }
      throw e;
    }
    assert.deepEqual(registryRootProblems(root).problems.map((p) => p.slice(0, 3)), ["(a)"], "a wave1.json that is a link to a valid registry outside the root");
  } finally { rmSync(base, { recursive: true, force: true }); }
});

// (checkpoint-2 V-1(b)/V-3, 2026-09-19) The CI hang backstops are LOCKED, not merely present by inspection: (a) EVERY
// job under `jobs:` carries a job-level `timeout-minutes` <= 20 (a hung run — e.g. an unbounded recorder retry — cannot
// pend a job toward GitHub's 6h ceiling); (b) package.json `scripts.test` carries both `--test-timeout=` (per-test
// guard) and `--test-force-exit` (exit even if a handle leaks after the tests settle). Mutants (measured in the pli):
// drop a job's timeout-minutes => red; set one to 30 => red; drop --test-force-exit => red. Job keys are the 2-space
// entries of the top-level `jobs:` block (not a global regex); the timeout line is anchored at the 4-space (job) column
// so a step-level (8-space) timeout-minutes cannot masquerade as the job backstop. CI-G3-DURATION-1 (c): the workflow runs
// its tests through package.json scripts only (no bare `node --test`), exactly test:main and test:export, each carrying the
// same two guards; a new test job adds its script here, so its guards are locked too.
// killer: package.json:18 CONST "--test-timeout=300000 --test-force-exit " -> "--test-timeout=300000 "
test("ci_jobs_have_timeout_and_test_flags_locked — per-job timeout-minutes <= 20 + test guards (checkpoint-2 V-1(b)/V-3)", () => {
  const jobsIdx = LINES.findIndex((l) => /^jobs\s*:/.test(l));
  assert.notEqual(jobsIdx, -1, "top-level key 'jobs:' missing from the workflow");
  const jobs: { name: string; start: number }[] = [];
  for (let i = jobsIdx + 1; i < LINES.length; i++) {
    const l = LINES[i]!;
    if (/^\S/.test(l) && !/^\s*#/.test(l)) break; // a column-0 non-comment key ends the jobs block
    const m = /^  ([A-Za-z0-9_-]+)\s*:\s*$/.exec(l); // a job key: exactly 2-space indent, bare `name:`
    if (m && m[1]) jobs.push({ name: m[1], start: i });
  }
  assert.ok(jobs.length >= 5, `expected >= 5 jobs under jobs:, saw ${jobs.length} (${jobs.map((j) => j.name).join(",")})`);
  for (let j = 0; j < jobs.length; j++) {
    const end = j + 1 < jobs.length ? jobs[j + 1]!.start : LINES.length;
    const block: string[] = [];
    for (let i = jobs[j]!.start + 1; i < end; i++) block.push(LINES[i]!.replace(/#.*$/, ""));
    const tmLine = block.find((l) => /^    timeout-minutes\s*:\s*\d+\s*$/.test(l)); // 4-space = job level (not an 8-space step)
    assert.ok(tmLine, `job '${jobs[j]!.name}' has no job-level timeout-minutes (a hung run could pend it to GitHub's 6h ceiling; checkpoint-2 V-1(b))`);
    const minutes = Number(tmLine.replace(/\D/g, ""));
    assert.ok(minutes <= 20, `job '${jobs[j]!.name}' timeout-minutes=${minutes} exceeds the 20-minute backstop (checkpoint-2 V-1(b))`);
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  const testScript = pkg.scripts.test ?? "";
  assert.match(testScript, /--test-timeout=\d+/, "scripts.test must carry --test-timeout=<ms> (the per-test hang guard, checkpoint-2 V-1(b))");
  assert.ok(testScript.includes("--test-force-exit"), "scripts.test must carry --test-force-exit (exit even if a handle leaks after the tests settle)");
  const code = LINES.filter((l) => !/^\s*#/.test(l));
  assert.deepEqual(code.filter((l) => /\bnode\s+--test\b/.test(l)), [], "no bare `node --test` in the workflow: a CI test run goes through a locked package.json script");
  const invoked = [...new Set(code.flatMap((l) => [...l.matchAll(/\bnpm (?:test\b|run (test(?::[\w-]+)?)(?![\w:-]))/g)].map((m) => m[1] ?? "test")))].sort();
  assert.deepEqual(invoked, ["test:export", "test:main"], "the workflow runs the suite as test:main (g3-verification) + test:export (g3-export), CI-G3-DURATION-1");
  for (const name of invoked) {
    const s = pkg.scripts[name] ?? "";
    assert.match(s, /--test-timeout=\d+/, `scripts["${name}"] must carry --test-timeout=<ms> (run by the workflow)`);
    assert.ok(s.includes("--test-force-exit"), `scripts["${name}"] must carry --test-force-exit (run by the workflow)`);
  }
});

// CI-G3-DURATION-1 (docs/G0-lot-ci-g3-duration-1.md): test 42 (export_public_no_governance_no_french: a nested `npm ci && npm run
// ci` of the public export; 151 s on the runner of PR 126, about ten times the next test) leaves g3-verification for a job of its
// own, g3-export. No coverage is lost, and `npm test` still runs everything: (a) test:main is EXACTLY scripts.test plus one skip
// flag (same globs, same guards); (b) test:export runs the SAME pattern as a name filter over test/export-public.test.ts, with the
// same guards; (c) in the npm test globs that pattern names exactly one test declaration, test 42 itself, so main + export = the
// suite; (d) g3-verification runs test:main, g3-export runs `npm ci` then test:export, with no `if:`; (e) the g3-export bound
// exceeds --test-timeout, so a slow test 42 reds by name before the job is cancelled; (f) the public workflow drops g3-export (the
// root test/ is never exported: the job would red on the mirror).
const TEST42_PATTERN = "\\(test 42\\)";
function jobBlock(name: string): string[] {
  const idx = LINES.findIndex((l) => new RegExp(`^  ${name}\\s*:\\s*$`).test(l));
  if (idx === -1) return [];
  const block: string[] = [];
  for (let i = idx + 1; i < LINES.length && !/^ {0,2}\S/.test(LINES[i]!); i++) block.push(LINES[i]!.replace(/#.*$/, ""));
  return block;
}
function expandTestGlob(glob: string): string[] {
  let dirs = [""];
  const segs = glob.split("/");
  for (const seg of segs.slice(0, -1)) {
    dirs = dirs.flatMap((d) => {
      const abs = join(ROOT, d);
      if (seg !== "*") return existsSync(join(abs, seg)) ? [d ? `${d}/${seg}` : seg] : [];
      return readdirSync(abs).filter((n) => statSync(join(abs, n)).isDirectory()).map((n) => (d ? `${d}/${n}` : n));
    });
  }
  const last = new RegExp(`^${segs[segs.length - 1]!.replace(/[\\^$.|?+()[\]{}]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
  return dirs.flatMap((d) => readdirSync(join(ROOT, d)).filter((n) => last.test(n)).map((n) => `${d}/${n}`));
}
// killer: .github/workflows/ci.yml:205 CONST "npm run test:export" -> "npm run test:main"
test("ci_g3_export_runs_test_42_alone_and_g3_main_skips_only_it - the suite is split in two CI jobs with no test lost (CI-G3-DURATION-1)", () => {
  const scripts = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> }).scripts;
  const full = scripts.test ?? "";
  // TEST-FORCE-EXIT-REPORT-LOSS-1: the launcher's blocking stdout (-r) and the per-file report preload are guards too.
  const [, head, guards] = /^(node -r \.\/test\/helpers\/blocking-stdout\.cjs --test) (--test-timeout=\d+ --test-force-exit "--import=[^"]+") /.exec(full) ?? [];
  assert.ok(head !== undefined && guards !== undefined, "scripts.test starts with `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=<ms> --test-force-exit \"--import=<report preload>\" ` (the locked guards)");
  // (a) test:main = scripts.test + the skip flag, nothing else.
  assert.equal(scripts["test:main"], full.replace(guards, `${guards} --test-skip-pattern="${TEST42_PATTERN}"`), "(a) test:main must be scripts.test plus --test-skip-pattern only (same globs, same guards)");
  // (b) test:export = the same guards, the same pattern as a name filter, the one file.
  assert.equal(scripts["test:export"], `${head} ${guards} --test-name-pattern="${TEST42_PATTERN}" "test/export-public.test.ts"`, "(b) test:export must run test 42 alone with the same guards");
  // (c) the pattern names exactly one test declaration (a line opening with test/it/describe/suite) of the npm test globs: test 42.
  const files = [...full.matchAll(/"([^"]+\.test\.ts)"/g)].flatMap((m) => expandTestGlob(m[1]!));
  assert.ok(files.includes("test/export-public.test.ts") && files.length >= 100, `the npm test globs reach the suite (saw ${files.length} files)`);
  const re = new RegExp(TEST42_PATTERN);
  const named = files.flatMap((f) =>
    [...readFileSync(join(ROOT, f), "utf8").matchAll(/^[ \t]*(?:test|it|describe|suite)(?:\.\w+)?\(\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/gm)]
      .map((m) => m[2]!)
      .filter((n) => re.test(n))
      .map((n) => `${f}: ${n}`),
  );
  assert.deepEqual(named, ["test/export-public.test.ts: export_public_no_governance_no_french — clean public export (test 42)"], "(c) the test 42 pattern must name test 42 and nothing else");
  // (d) the two jobs run the two halves; g3-export installs first; no `if:` anywhere in either job.
  const g3 = jobBlock("g3-verification");
  const ex = jobBlock("g3-export");
  assert.ok(g3.some((l) => /^\s*run:\s*npm run gate:vocab && npm run typecheck && npm run test:main\s*$/.test(l)), "(d) g3-verification must run gate:vocab, typecheck, then test:main");
  assert.ok(ex.length > 0, "(d) job 'g3-export' missing from the workflow");
  const ciAt = ex.findIndex((l) => /^\s*run:\s*npm ci\s*$/.test(l));
  const runAt = ex.findIndex((l) => /^\s*run:\s*npm run test:export\s*$/.test(l));
  assert.ok(ciAt !== -1 && runAt > ciAt, "(d) g3-export must run `npm ci` then `npm run test:export`");
  assert.ok(![...g3, ...ex].some((l) => IF_DIRECTIVE_RE.test(l) || COE_DIRECTIVE_RE.test(l)), "(d) no `if:` or continue-on-error on g3-verification or g3-export");
  // (e) job bound above the per-test bound.
  const minutes = Number(ex.find((l) => /^    timeout-minutes\s*:/.test(l))?.replace(/\D/g, "") ?? "0");
  const perTestMs = Number(/--test-timeout=(\d+)/.exec(guards)?.[1] ?? "0");
  assert.ok(minutes * 60_000 > perTestMs, `(e) g3-export timeout-minutes (${minutes}) must exceed --test-timeout (${perTestMs} ms)`);
  // (f) the public workflow drops the internal job.
  const derived = derivePublicWorkflow(WF);
  assert.ok(!/^ {2}g3-export\s*:/m.test(derived) && !derived.includes("test:export"), "(f) the derived public workflow must not carry g3-export");
  assert.ok(derived.includes("npm run test:main"), "(f) the derived public workflow keeps g3-verification and its test:main run");
});

// Lot CI-site (ADR-M003 D9 octies) — the g3-site job's step order is load-bearing: `next build` must produce
// apps/site/.next BEFORE the O-2 step reads it (else O-2 fails-closed on an absent artefact). The g3-site
// per-job timeout-minutes (<= 20) is already covered by ci_jobs_have_timeout_and_test_flags_locked above
// (6 jobs now). The build run-line pin (== SITE_BUILD_RUN) and O-2 soundness live in test/site-build-fleet.test.ts.
test("g3_site_builds_then_asserts_fleet_html — job g3-site runs the build THEN O-2, in the same job, in order (C-5)", () => {
  const idx = LINES.findIndex((l) => /^  g3-site\s*:/.test(l));
  assert.notEqual(idx, -1, "job 'g3-site' missing from the workflow (mutant: g3-site removed => red)");
  const block: string[] = [];
  for (let i = idx + 1; i < LINES.length; i++) {
    const l = LINES[i]!;
    if (/^  \S/.test(l) || /^\S/.test(l)) break; // next 2-space job key or a column-0 key
    block.push(l.replace(/#.*$/, "")); // strip end-of-line comments
  }
  // C-G2-2 (step-level, error_origin = C-5 spec) + checkpoint-2 C2-1: the g3-site block carries no `if:` on the
  // job OR any step, in ANY form (block key, list-dash `- if:`, quoted `"if":`, flow mapping `{ if: … }`). An
  // `if: false` on the O-2 step would run the job GREEN with zero assertion - dropping the very O-2 that C-5
  // exists to protect. Block-scoped sibling of test 38's file-wide IF_DIRECTIVE_RE ban. The job-KEY line itself
  // (LINES[idx], e.g. a flow `g3-site: { …, if: false }`) is scanned too, since the block loop starts at idx+1;
  // block lines already had inline comments stripped above, so strip the key line the same way.
  const ifScan = [LINES[idx]!.replace(/#.*$/, ""), ...block];
  assert.ok(!ifScan.some((l) => IF_DIRECTIVE_RE.test(l)), "g3-site must carry no `if:` on the job or any step, in any form (dash/quoted/flow) - a conditional/SKIPPED required check counts as PASSING on GitHub (silent unblock)");
  const buildIdx = block.findIndex((l) => /^\s*run:\s*npm run build -w @monark\/site\s*$/.test(l));
  const o2Idx = block.findIndex((l) => /^\s*run:\s*node scripts\/assert-fleet-html\.mjs\s*$/.test(l));
  assert.notEqual(buildIdx, -1, "g3-site must carry the `npm run build -w @monark/site` step (mutant: build step removed => red)");
  assert.notEqual(o2Idx, -1, "g3-site must carry the O-2 step `node scripts/assert-fleet-html.mjs` (mutant: O-2 step removed => red)");
  assert.ok(buildIdx < o2Idx, "the build step must come BEFORE the O-2 step within g3-site (mutant: order inverted => red)");
});

// Lot CI-site (C-10) — the sentinel README is a REAL kept export file (model SECURITY.md, cra-b.test.ts). It is
// scanned by public_surfaces_make_no_probative_claim and gate:vocab (scan.sentinel). export:check now runs in CI
// (Lot CI-EXPORT-CHECK, r25 job) but its French-.md rule is NON-fatal: a FRENCH README would land in
// collectFiles().frenchMd and be dropped from the export in SILENCE (export-public.mjs:263), not a red. lang:gate
// now ALSO runs in CI (Lot LANG-GATE-CI, same r25 job) and gates the sentinel scope, so a French token in this
// README reds there too; but a language gate does not assert file MEMBERSHIP, so this assertion stays the teeth for
// the README being removed or renamed (the mutant below), doubling the lang:gate cover for the French case.
test("sentinel_readme_is_a_kept_export — apps/sentinel/README.md is an English kept export file (C-10)", () => {
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  assert.ok(
    kept.has("apps/sentinel/README.md"),
    "apps/sentinel/README.md must be in collectFiles(ROOT).kept (mutant 'README removed / turned French' => not kept => red)",
  );
});

// Lot CODEQL-ALERTS-1 (ADR-CODEQL-ALERTS-1 D1; CodeQL alerts 7-12, actions/missing-workflow-permissions): the workflow
// limits the GITHUB_TOKEN to read-only scopes. The ROOT block, top-level, after the `on:` block and before `jobs:` (never
// between `on:` and its keys: derivePublicWorkflow's on/pull_request needle would break), is exactly `contents: read`.
// Lot R25-INTEGRATION-RULE-1 (G0 Q-2, MONARK 2026-10-05; dated line under ADR-CODEQL-ALERTS-1 D1): ONE job-level block,
// on the job r25-taille-de-lot only, exactly `contents: read`, `pull-requests: read`, `checks: read` (the integration
// proof's API reads). problems() judges any workflow text; the real one has none, and each named mutant has one: root
// block removed, widened, written, made inline; the job block removed, an extra scope, a missing scope, a write scope,
// `write-all`, moved to another job, a second block on another job, an escaped double-quoted key, an explicit `? ` key.
// The judge is LEXICAL (no YAML parser is a repo dependency): it covers block keys, single- or double-quoted keys and
// inline mappings, and refuses the two forms it cannot read (a double-quoted key holding a `\`, an explicit `? ` key)
// anywhere in the file (G2 of the Q-2 fold, R-2). No `write` token on any non-comment line, and the DERIVED public
// workflow (the r25 job stripped) keeps the root block alone.
// killer: .github/workflows/ci.yml:48 CONST "checks: read" -> "statuses: read"
test("ci_workflow_declares_least_privilege_permissions - root contents: read after on:, one job block on r25-taille-de-lot (contents, pull-requests, checks: read), no write (ADR-CODEQL-ALERTS-1 D1)", () => {
  const isCode = (l: string): boolean => l.trim() !== "" && !/^\s*#/.test(l);
  const KEY_RE = /(?:^|[\s{,])["']?permissions["']?\s*:/;
  const ROOT = ["  contents: read"];
  const R25 = ["      contents: read", "      pull-requests: read", "      checks: read"];
  const problems = (lines: string[]): string[] => {
    const out: string[] = [];
    const keys = lines.flatMap((l, i) => (isCode(l) && KEY_RE.test(l) ? [i] : []));
    const onIdx = lines.findIndex((l) => /^on\s*:/.test(l));
    const jobsIdx = lines.findIndex((l) => /^jobs\s*:/.test(l));
    const body = (at: number, indent: number): string[] => {
      const b: string[] = [];
      for (let i = at + 1; i < lines.length; i++) {
        const l = lines[i]!;
        if (!isCode(l)) continue;
        if ((/^ */.exec(l)?.[0].length ?? 0) <= indent) break; // the next key at the block's own column ends it
        b.push(l.replace(/\s+#.*$/, ""));
      }
      return b;
    };
    const jobOf = (at: number): string => {
      for (let i = at; i > jobsIdx; i--) { const m = /^ {2}([\w-]+)\s*:/.exec(lines[i]!); if (m) return m[1]!; }
      return "(no job)";
    };
    const root = keys.filter((i) => /^permissions:\s*$/.test(lines[i]!));
    if (root.length !== 1) out.push(`expected ONE top-level permissions: block, saw ${String(root.length)}`);
    else {
      const r = root[0]!;
      if (!(onIdx !== -1 && onIdx < r && r < jobsIdx)) out.push(`the root block must sit after on: and before jobs: (on=${String(onIdx)}, permissions=${String(r)}, jobs=${String(jobsIdx)})`);
      if (JSON.stringify(body(r, 0)) !== JSON.stringify(ROOT)) out.push(`the root block is exactly contents: read, saw ${JSON.stringify(body(r, 0))}`);
    }
    const job = keys.filter((i) => !root.includes(i));
    if (job.length !== 1) out.push(`expected ONE job-level permissions block (r25-taille-de-lot), saw ${String(job.length)}`);
    else {
      const j = job[0]!;
      if (!/^ {4}permissions:\s*$/.test(lines[j]!)) out.push(`the job block is a job-level key (4 spaces) opening a block, saw ${JSON.stringify(lines[j])}`);
      if (jobsIdx === -1 || j < jobsIdx || jobOf(j) !== "r25-taille-de-lot") out.push(`the job block belongs to r25-taille-de-lot, saw ${jobOf(j)}`);
      if (JSON.stringify(body(j, 4)) !== JSON.stringify(R25)) out.push(`the r25 job block is exactly contents, pull-requests, checks: read, saw ${JSON.stringify(body(j, 4))}`);
    }
    const opaque = lines.filter((l) => isCode(l) && (/^\s*(?:-\s+)?\?(?:\s|$)/.test(l) || /"[^"]*\\[^"]*"\s*:/.test(l)));
    if (opaque.length > 0) out.push(`no explicit ? key and no escaped double-quoted key (the lexical judge cannot read them), saw ${JSON.stringify(opaque)}`);
    const writes = lines.filter((l) => isCode(l) && /\bwrite(?:-all)?\b/.test(l));
    if (writes.length > 0) out.push(`no write scope on any non-comment line, saw ${JSON.stringify(writes)}`);
    return out;
  };
  assert.deepEqual(problems(LINES), [], "the workflow keeps the root contents: read block and the one r25 job block (G0 Q-2), nothing wider");
  const at = (re: RegExp): number => LINES.findIndex((l) => re.test(l));
  const r25At = at(/^ {2}r25-taille-de-lot\s*:/), rootAt = at(/^permissions:\s*$/), jobAt = at(/^ {4}permissions:\s*$/), g1At = at(/^ {2}g1-controle-generation\s*:/), g3At = at(/^ {2}g3-verification\s*:/);
  assert.ok(rootAt !== -1 && jobAt !== -1 && g1At !== -1 && g1At < jobAt && jobAt < g3At, "the mutants' anchors are present (root block, r25 job block, g1 before it, g3 after it)");
  const edit = (i: number, del: number, ...add: string[]): string[] => { const c = [...LINES]; c.splice(i, del, ...add); return c; };
  const blk = LINES.slice(jobAt, jobAt + 4);
  const mutants: Record<string, string[]> = {
    "root block removed": edit(rootAt, 2),
    "root block widened": edit(rootAt + 2, 0, "  pull-requests: read"),
    "root contents: write": edit(rootAt + 1, 1, "  contents: write"),
    "root inline read-all": edit(rootAt, 2, "permissions: read-all"),
    "job block removed": edit(jobAt, 4),
    "job block extra scope": edit(jobAt + 4, 0, "      statuses: read"),
    "job block missing scope": edit(jobAt + 3, 1),
    "job block write scope": edit(jobAt + 3, 1, "      checks: write"),
    "job block write-all": edit(jobAt, 4, "    permissions: write-all"),
    "job block moved to g1": (() => { const c = edit(jobAt, 4); c.splice(g1At + 1, 0, ...blk); return c; })(),
    "second job block on g3": edit(g3At + 1, 0, ...blk),
    "escaped double-quoted key on g3": edit(g3At + 1, 0, '    "perm\\x69ssions": {contents: "wr\\x69te"}'),
    "explicit ? key on g3": edit(g3At + 1, 0, "    ? permissions", "    : read-all"),
  };
  for (const [name, m] of Object.entries(mutants)) assert.ok(problems(m).length > 0, `mutant "${name}" must be refused`);
  // G2 of the Q-2 fold, m-2: the job token carries pull-requests and checks read, so the r25 checkout does not persist
  // it in .git/config; every later git call of the job is local (diff, rev-list, rev-parse, show) and the proof reads
  // the API with R25_READ_TOKEN.
  const r25Body: string[] = [];
  for (let i = r25At + 1; i < LINES.length && !/^ {0,2}\S/.test(LINES[i]!); i++) if (isCode(LINES[i]!)) r25Body.push(LINES[i]!.replace(/\s+#.*$/, "").trim());
  const co = r25Body.findIndex((l) => l.startsWith("- uses: actions/checkout@"));
  assert.deepEqual(r25Body.slice(co + 1, co + 4), ["with:", "fetch-depth: 0", "persist-credentials: false"], "the r25 checkout keeps full history and does not persist the job token (m-2)");
  const derived = derivePublicWorkflow(WF).split(/\r?\n/);
  assert.deepEqual(derived.filter((l) => isCode(l) && KEY_RE.test(l)), ["permissions:"], "the DERIVED public workflow (r25 job stripped) keeps the root block alone");
  const dIdx = derived.indexOf("permissions:");
  assert.ok(derived[dIdx + 1] === "  contents: read", "the DERIVED public workflow keeps the least-privilege block (the mirror's CI is read-only too)");
});

// Lot CI-WORKFLOWS-SET-1 (m-1 of the G2 of the Q-2 fold of R25-INTEGRATION-RULE-1b): every gate test above reads ONE file,
// .github/workflows/ci.yml (WF), and the export derives only CI_WORKFLOW_PATH. A second workflow file would run on GitHub and
// escape them all (permissions judge problems(), if:/continue-on-error, SHA pins, timeouts). So the set of workflows is pinned
// by an equality, read from GIT, not from the disk: the index (what will be committed; a staged file reds before its commit)
// and the HEAD tree (what the runner checks out and GitHub runs). An untracked file never reaches GitHub and does not count.
// Recursive on purpose: a subdirectory has no use and is refused too. -z keeps paths unquoted whatever core.quotepath says.
// CodeQL runs as a GitHub default setup (workflow path dynamic/github-code-scanning/codeql, no file in the repo). The reads
// (test/helpers/git-tracked.ts) run without the caller's GIT_* variables and deduplicate an unmerged index (G2 fold, N-2, N-3).
// killer: scripts/export-public.mjs:447 CONST "ci.yml" -> "gates.yml"
test("ci_workflows_set_is_exactly_ci_yml - the git index and the HEAD tree track one workflow, .github/workflows/ci.yml, the one file every gate test and the export read (CI-WORKFLOWS-SET-1)", () => {
  assert.equal(gitOut(ROOT, ["rev-parse", "--show-prefix"]).trim(), "", "the test root is the repository root, not a subdirectory of a parent repository");
  const { index, tree } = tracked(ROOT, ".github/workflows");
  assert.deepEqual(index, [".github/workflows/ci.yml"], "the git index tracks exactly one workflow, ci.yml");
  assert.deepEqual(tree, [".github/workflows/ci.yml"], "the HEAD tree tracks exactly one workflow, ci.yml");
  assert.deepEqual(index, [CI_WORKFLOW_PATH], "the one tracked workflow is the one the public export derives");
  assert.deepEqual(new Set(index.map((p) => p.slice(p.lastIndexOf("/") + 1))), new Set(["ci.yml"]), "the set of workflows is {ci.yml}");
});

// A throwaway repository for the two tests below: git with no GIT_* variable of the caller, no system or global config, a fixed
// identity. `files` are written then committed; the returned `git` runs more git in it.
const fixtureRepo = (prefix: string, files: Record<string, string>): { dir: string; git: (...args: string[]) => string } => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(dir, "absent.gitconfig") };
  const git = (...args: string[]): string => {
    const r = spawnSync("git", ["-C", dir, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", ...args], { encoding: "utf8", env });
    if (r.status !== 0 && args[0] !== "merge") throw new Error(`fixture git ${args.join(" ")} failed: ${String(r.error ?? r.stderr)}`);
    return r.stdout;
  };
  git("init", "-q", "-b", "main");
  for (const [rel, text] of Object.entries(files)) { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), text); }
  git("add", "--", ...Object.keys(files));
  git("commit", "-q", "-m", "fixture");
  return { dir, git };
};

// G2 fold, N-2: `git -C` overrides neither GIT_DIR nor GIT_INDEX_FILE, so a caller that exports them (a hook) would make the reads
// judge another repository or another index: a decoy that tracks only a decoy workflow. The reads must still see this checkout.
// killer: test/helpers/git-tracked.ts:11 CONST "env: bare(), " -> ""
test("ci_workflows_set_reads_ignore_the_callers_git_env - a decoy GIT_DIR or GIT_INDEX_FILE does not change the tracked workflows (CI-WORKFLOWS-SET-1, G2 N-2)", () => {
  const decoy = fixtureRepo("ci-workflows-decoy-", { ".github/workflows/decoy.yml": "on: push\n" });
  const prev = { dir: process.env.GIT_DIR, index: process.env.GIT_INDEX_FILE };
  const restore = (): void => {
    if (prev.dir === undefined) delete process.env.GIT_DIR; else process.env.GIT_DIR = prev.dir;
    if (prev.index === undefined) delete process.env.GIT_INDEX_FILE; else process.env.GIT_INDEX_FILE = prev.index;
  };
  const seen: Record<string, { index: string[]; tree: string[] }> = {};
  try {
    process.env.GIT_DIR = join(decoy.dir, ".git");
    seen["GIT_DIR"] = tracked(ROOT, ".github/workflows");
    restore();
    process.env.GIT_INDEX_FILE = join(decoy.dir, ".git", "index");
    seen["GIT_INDEX_FILE"] = tracked(ROOT, ".github/workflows");
  } finally {
    restore();
    rmSync(decoy.dir, { recursive: true, force: true, maxRetries: 3 });
  }
  const real = { index: [".github/workflows/ci.yml"], tree: [".github/workflows/ci.yml"] };
  assert.deepEqual(seen, { GIT_DIR: real, GIT_INDEX_FILE: real }, "the decoy's workflow never replaces this checkout's ci.yml");
});

// G2 fold, N-3: during a merge conflicted on ci.yml, the index lists it once per stage (1, 2, 3); the reads list it once, so a
// red names the real cause, not three copies of ci.yml. The equality stays strict.
// killer: test/helpers/git-tracked.ts:16 CONST "[...new Set(xs)]" -> "xs"
test("ci_workflows_set_reads_an_unmerged_index_once - a path conflicted in three stages is listed once (CI-WORKFLOWS-SET-1, G2 N-3)", () => {
  const repo = fixtureRepo("ci-workflows-unmerged-", { ".github/workflows/ci.yml": "on: pull_request\n" });
  try {
    repo.git("checkout", "-q", "-b", "side");
    writeFileSync(join(repo.dir, ".github", "workflows", "ci.yml"), "on: push\n");
    repo.git("commit", "-q", "-am", "side");
    repo.git("checkout", "-q", "main");
    writeFileSync(join(repo.dir, ".github", "workflows", "ci.yml"), "on: workflow_dispatch\n");
    repo.git("commit", "-q", "-am", "main");
    repo.git("merge", "-q", "side");
    const stages = repo.git("ls-files", "-z", "--stage", "--", ".github/workflows").split("\0").filter((l) => l !== "").length;
    assert.equal(stages, 3, "control: the merge left ci.yml unmerged, in three stages");
    assert.deepEqual(tracked(repo.dir, ".github/workflows").index, [".github/workflows/ci.yml"], "an unmerged path is read once");
  } finally {
    rmSync(repo.dir, { recursive: true, force: true, maxRetries: 3 });
  }
});

// G2 fold, N-5: an action or a reusable workflow of THIS repository, called by its full name at a pinned SHA, passes test 38 (it
// is pinned) and escapes the set above: its steps (a composite action.yml, or a workflow file that exists only at that SHA, on
// another branch) are judged by no test. So no `uses:` of ci.yml names KraidleAI/monark-governance (a path under it, or its root
// action.yml by `@`), whatever the case, the quotes or the form (step, job-level reusable workflow, flow mapping).
const USES_SELF_RE = /(?:^\s*|[-{,]\s*)["']?uses["']?\s*:\s*["']?kraidleai\/monark-governance[/@]/i;
// killer: .github/workflows/ci.yml:37 CONST "actions/checkout@" -> "KraidleAI/monark-governance/.github/actions/checkout@"
test("ci_uses_nothing_of_this_repository - no uses: of ci.yml names an action or a reusable workflow of KraidleAI/monark-governance (CI-WORKFLOWS-SET-1, G2 N-5)", () => {
  const own = (lines: string[]): string[] => lines.filter((l) => !/^\s*#/.test(l) && USES_SELF_RE.test(l));
  assert.deepEqual(own(LINES), [], "ci.yml calls no action and no reusable workflow of this repository");
  const sha = "3d3c42e5aac5ba805825da76410c181273ba90b1";
  for (const red of [
    `      - uses: KraidleAI/monark-governance/.github/actions/x@${sha}`,
    `    uses: KraidleAI/monark-governance/.github/workflows/y.yml@${sha}`,
    `      - uses: KraidleAI/monark-governance@${sha}`,
    `      - uses: "kraidleai/MONARK-GOVERNANCE/.github/actions/x@${sha}"`,
    `      - { name: x, uses: 'KraidleAI/monark-governance/.github/actions/x@${sha}' }`,
  ]) assert.deepEqual(own([red]), [red], `mutant must be refused: ${red.trim()}`);
  for (const green of [`      - uses: actions/checkout@${sha} # v7.0.1`, `      # uses: KraidleAI/monark-governance/.github/actions/x@${sha}`, `      - uses: KraidleAI/monark-governance-other/x@${sha}`]) {
    assert.deepEqual(own([green]), [], `control must pass: ${green.trim()}`);
  }
});
