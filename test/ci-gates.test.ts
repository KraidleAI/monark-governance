/**
 * Root test `ci_gates_blocking_no_continue_on_error` (test 38, ADR-M003 D11, Lot V).
 * Non-LLM oracle over the instantiated workflow `.github/workflows/ci.yml`: it MUST stay
 * blocking end-to-end and pinned. The test reads the file as text (no `act` run
 * required, D1) and fails if:
 *   (1) a `continue-on-error` appears (a job would stop being blocking);
 *   (2) a `uses:` action is not pinned by a 40-hex commit SHA (movable tag);
 *   (3) `VIBEGATES_PR_LIMIT` != "1205" (bound ADR-M003 D9);
 *   (4) the exclusion pathspec for generated S2 artefacts is missing from the R-25 count;
 *   (5) the `on:` trigger does not carry `pull_request` (delivery by PR — ADR-M003 D9 addendum 2026-09-05);
 *   (6) job g4 does not run the ratchet `npm run lint:ratchet` (ADR-M003 D9 ter §3, 2026-09-06).
 *   (4bis) the G1/G2 governance reports are not excluded from the R-25 count (D9 quater);
 *   (7) job g4 does not literally carry `run: npm run lint && npm run lint:ratchet` (D9 quater).
 * Named mutant (G2 review): `continue-on-error: true` inserted => red; byte-exact
 * restoration (sha256 before/after) recorded in docs/G1-lot-V.md.
 * Run by `npm test` in each worktree (outside per-lot counting).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const WF = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
const LINES = WF.split(/\r?\n/);

test("ci_gates_blocking_no_continue_on_error — blocking and pinned workflow (test 38)", () => {
  // (1) template invariant: no continue-on-error DIRECTIVE (a YAML key on a
  //     non-comment line). A prose mention in a comment is allowed (the template itself
  //     writes "No continue-on-error"); it is the `continue-on-error:` key that would unblock a job.
  const coeDirective = LINES.some((l) => /^\s*continue-on-error\s*:/.test(l));
  assert.ok(!coeDirective, "continue-on-error directive present: a job would stop being blocking");

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
