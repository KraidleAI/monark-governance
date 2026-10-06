/**
 * A-9-OUTILLE (checkpoint-2 U-5a observation, checkpoint-1 C-1..C-8) -- the STATIC half of the harness
 * served-vocabulary gate. `vocab-banned.json` scan.harness carries four rules (naked verified, probability outside
 * a named negation, a numeric percentage, accuracy) whose exemptions are NAMED, CLOSED lookbehinds written in the
 * rule itself (mechanism (i), the scope's existing negation-aware convention; no exemptPhrases on this scope).
 * `scripts/grep-forbidden.mjs` applies them to every apps/harness/src line and names file:line:word. The SERVED
 * half (the real tools/list and tools/call through createHarnessHandler) is apps/harness/test/registry.test.ts.
 * Root test (not exported: test/ is not in the public whitelist). ASCII only; no `any`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { compilePatterns, scanText, collectTargets } from "../scripts/grep-forbidden.mjs";
import type { CompiledRule } from "../scripts/grep-forbidden.mjs";

const ROOT = join(import.meta.dirname, "..");
const GATE_CLI = join(ROOT, "scripts", "grep-forbidden.mjs");

interface Exemption { after: string; lookbehind: string; carrier: string; sample: string; why: string }
interface Rule { re: string; why: string; exemptions?: Exemption[] }
interface Scope { banned: Rule[]; exemptPhrases?: string[] }
interface VocabConfig { banned: Rule[]; scan: Record<string, Scope | undefined> }

const loadConfig = (): VocabConfig => JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as VocabConfig;
function harnessOf(cfg: VocabConfig): Scope {
  const h = cfg.scan["harness"];
  assert.ok(h !== undefined, "scan.harness is present in vocab-banned.json");
  return h;
}

// The founding injection of checkpoint-2 U-5a (V5): it survived the whole suite AND gate:vocab before this lot.
const V5 = "verified 95% probability of liquidation within the interval.";

// The CLOSED list (checkpoint-1 C-4): each A-9 rule, named by the naked probe it must redden, with its exact exempt
// prefixes in declaration order. Adding a rule or an exemption = an ADR line AND this table (else red here).
const O_MACRON = String.fromCharCode(0x14d);
const CLOSED: ReadonlyArray<readonly [string, readonly string[]]> = [
  // IF-1 (ADR-U5a G7 addendum; closed at U-4b-2b): the fourth prefix "committed, previously " is retired (8 -> 7 exemptions).
  ["the price is verified", ["not re-", `committed Sh${O_MACRON}gen-`, `committed, previously Sh${O_MACRON}gen-`]],
  ["a probability of being right", ["never a ", "not a ", "no "]],
  ["95% of the time", []],
  ["the accuracy is high", ["seed, n, "]],
];

// The ALTERNATIVES written inside an A-9 rule (G2 C-G2-1, C-G2-2): each carries its own probe, else dropping it
// survives every test (CONSIGNE D-1: an alternative without its probe is declarative). The spelled percentage
// `per\s?cent` (announced by the rule's why, "99 percent") and the plural suffix of `probabilit\w*`. Row: [probe,
// the CLOSED probe of its owning rule, the word the gate names]. Adding an alternative to a rule = a row here.
const ALTERNATIVES: ReadonlyArray<readonly [string, string, string]> = [
  ["covers 99 percent of cases", "95% of the time", "99 percent"],
  ["90 per cent", "95% of the time", "90 per cent"],
  ["the calibrated probabilities", "a probability of being right", "probabilities"],
];

/** Case-insensitive splice of `after` inside `sample` (every rule compiles with the `i` flag). */
function spliceCI(sample: string, after: string, by: string): string {
  const i = sample.toLowerCase().indexOf(after.toLowerCase());
  assert.ok(i >= 0, `the sample '${sample}' carries its exempt prefix '${after}'`);
  return sample.slice(0, i) + by + sample.slice(i + after.length);
}

/** The strictly shorter word-suffixes of a prefix ("not re-" -> ["re-"]): none of them may exempt (no widening). */
function wordSuffixes(after: string): string[] {
  const out: string[] = [];
  for (let i = 1; i < after.length; i++) if (after[i - 1] === " " && after.slice(i).trim() !== "") out.push(after.slice(i));
  return out;
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkTs(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

// (b) of the mission: every named exemption is closed, exact and load-bearing. Per exemption: its lookbehind is in the
// rule; its sample sits verbatim in the committed carrier; the sample PASSES; the same span without the prefix
// REDDENS; no shorter word-suffix of the prefix exempts (no widening); the carrier is clean under the rule and
// REDDENS once that lookbehind is removed. Per rule: no undeclared lookbehind remains, and each written ALTERNATIVE
// reddens its own probe under that rule alone (G2 C-G2-1/C-G2-2). Mutants: `not-re-widened` (lookbehind widened to
// `re-`), `undeclared-lookbehind`, `percent-rule-disabled`, `percent-spelled-dropped`, `probability-suffix-narrowed`
// => red here.
test("a9_harness_exemptions_are_named_closed_and_load_bearing", () => {
  const cfg = loadConfig();
  const h = harnessOf(cfg);
  assert.equal(h.exemptPhrases, undefined, "mechanism (i) only: the harness scope carries no exemptPhrases (checkpoint-1 C-4)");
  const rules = h.banned.filter((r) => Array.isArray(r.exemptions));
  assert.equal(rules.length, CLOSED.length, "exactly the four A-9 rules carry an exemptions list");
  for (const [probe, afters] of CLOSED) {
    const owners = rules.filter((r) => new RegExp(r.re, "i").test(probe));
    assert.equal(owners.length, 1, `exactly one A-9 rule reddens the naked probe '${probe}'`);
    const rule = owners[0];
    assert.ok(rule !== undefined);
    const exemptions = rule.exemptions ?? [];
    assert.deepEqual(exemptions.map((e) => e.after), [...afters], `closed exemption list of the '${probe}' rule`);
    const full = new RegExp(rule.re, "i");
    let residual = rule.re;
    for (const e of exemptions) {
      assert.ok(rule.re.includes(e.lookbehind), `the lookbehind of '${e.after}' is written in the rule`);
      residual = residual.replace(e.lookbehind, "");
      assert.ok(e.why.trim().length > 0, `the '${e.after}' exemption carries its justification`);
      const carrierText = readFileSync(join(ROOT, ...e.carrier.split("/")), "utf8");
      assert.ok(carrierText.includes(e.sample), `the sample '${e.sample}' sits verbatim in ${e.carrier}`);
      assert.equal(full.test(e.sample), false, `the exempted span passes: '${e.sample}'`);
      assert.equal(full.test(spliceCI(e.sample, e.after, "")), true, `the same span without '${e.after}' reddens`);
      for (const shorter of wordSuffixes(e.after)) {
        assert.equal(full.test(spliceCI(e.sample, e.after, shorter)), true, `the shorter prefix '${shorter}' does not exempt (no widening)`);
      }
      const withRule: CompiledRule[] = [{ re: full, why: rule.why }];
      const withoutThis: CompiledRule[] = [{ re: new RegExp(rule.re.replace(e.lookbehind, ""), "i"), why: rule.why }];
      assert.deepEqual(scanText(carrierText, withRule), [], `${e.carrier} is clean under the rule`);
      assert.ok(scanText(carrierText, withoutThis).length >= 1, `removing the '${e.after}' exemption reddens ${e.carrier} (load-bearing)`);
    }
    assert.ok(!residual.includes("(?<!"), `no undeclared lookbehind in the '${probe}' rule`);
  }
  for (const [probe, closedProbe, word] of ALTERNATIVES) {
    const owners = rules.filter((r) => new RegExp(r.re, "i").test(probe));
    assert.equal(owners.length, 1, `exactly one A-9 rule reddens the alternative probe '${probe}'`);
    const rule = owners[0];
    assert.ok(rule !== undefined);
    assert.ok(new RegExp(rule.re, "i").test(closedProbe), `'${probe}' is reddened by the rule of '${closedProbe}'`);
    assert.deepEqual(scanText(probe, compilePatterns([rule])).map((x) => x.word), [word], `the gate names the whole alternative '${word}'`);
  }
  const all = [...compilePatterns(cfg.banned), ...compilePatterns(h.banned)];
  // checkpoint-1 C-1: 'interval' is the wire vocabulary (mode, region.kind, schema descriptions) -- NOT banned here.
  assert.deepEqual(scanText("`interval` mode => region [yhat - q, yhat + q]; alpha in the open interval (0,1)", all), [], "'interval' stays green on the harness scope (C-1)");
  // checkpoint-1 C-5: 'confidence' was already banned and is not re-added.
  assert.equal(h.banned.filter((r) => /confidence/.test(r.re)).length, 1, "'confidence' is banned exactly once (C-5)");
});

// The static scope is WIRED to every apps/harness/src file and CLEAN there (the in-process mirror of
// `npm run gate:vocab` for this scope); removing scan.harness drops the files from the walk; and it is the A-9 rules,
// not a pre-existing rule, that catch the founding V5 phrase. Mutants: `v5-ukemi-label` (the checkpoint-2 U-5a V5
// injection into UKEMI_PREDICT_LABEL), `scope-harness-removed-config`, `scope-harness-removed-code` => red here.
test("a9_harness_static_scope_wired_and_clean", () => {
  const cfg = loadConfig();
  const h = harnessOf(cfg);
  const harnessFiles = walkTs(join(ROOT, "apps", "harness", "src"));
  assert.ok(harnessFiles.length >= 10, `the harness sources are walked (non-vacuous), saw ${String(harnessFiles.length)}`);
  const byFile = new Map(collectTargets(ROOT, cfg, []).map((t) => [t.f, t] as const));
  for (const f of harnessFiles) {
    const t = byFile.get(f);
    assert.ok(t !== undefined, `gate:vocab scans ${f}`);
    assert.ok(scanText(V5, t.patterns, t.exemptPhrases).length >= 3, `the A-9 rules are attached to ${f}`);
    const hits = scanText(readFileSync(f, "utf8"), t.patterns, t.exemptPhrases).map((x) => `${String(x.line)}:${x.word}`);
    assert.deepEqual(hits, [], `${f} is vocab-clean (line:word)`);
  }
  const stripped = JSON.parse(JSON.stringify(cfg)) as VocabConfig;
  delete stripped.scan["harness"];
  const strippedFiles = new Set(collectTargets(ROOT, stripped, []).map((t) => t.f));
  for (const f of harnessFiles) assert.ok(!strippedFiles.has(f), `removing scan.harness drops ${f} from the walk (load-bearing)`);
  const legacy = [...compilePatterns(cfg.banned), ...compilePatterns(h.banned.filter((r) => !Array.isArray(r.exemptions)))];
  assert.deepEqual(scanText(V5, legacy), [], "without the A-9 rules the founding V5 phrase survives (what this lot closes)");
  assert.deepEqual(
    scanText(V5, compilePatterns(h.banned)).map((x) => x.word.toLowerCase()).sort(),
    ["95%", "probability", "verified"],
    "the A-9 rules name verified, 95% and probability in V5",
  );
});

// The CLI itself (the CI command): green on the tree with the scanned-file count; on a forbidden claim it exits 1 and
// names file:line:word (deliverable 2). Mutant `cli-word-dropped` => red here.
test("a9_gate_vocab_cli_names_file_line_word", () => {
  const ok = spawnSync(process.execPath, [GATE_CLI], { cwd: ROOT, encoding: "utf8" });
  assert.equal(ok.status, 0, `gate:vocab is green on the tree:\n${ok.stderr}`);
  assert.match(ok.stdout, /gate:vocab OK .* scanned \d+ file\(s\), no forbidden claim\./, "prints the scanned-file count");
  const dir = mkdtempSync(join(tmpdir(), "a9-vocab-"));
  try {
    const probe = join(dir, "probe.md");
    writeFileSync(probe, "a clean first line\nthis gate is 95% accurate\n");
    const red = spawnSync(process.execPath, [GATE_CLI, probe], { cwd: ROOT, encoding: "utf8" });
    assert.equal(red.status, 1, "a forbidden claim exits 1 (fail-closed)");
    assert.ok(red.stderr.includes(`FORBIDDEN VOCAB: ${probe}:2:95% accur`), `the hit is named file:line:word:\n${red.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
