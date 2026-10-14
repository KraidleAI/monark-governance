/**
 * Root tests of scripts/pin-bell-legal.mjs, the tool that re-pins the one manifest entry of the legal data file (chantier
 * BELL-COLLECT-TIMER-1, part 1, lot 1d-i; decision Q-18 (a)). Non-LLM oracles, run by `npm test`. Each test runs the tool as a
 * child in a fresh temporary root (the pattern of syncRoot in test/bell-anchors.test.ts) that holds the tool, the two loaders it
 * imports (apps/site/lib/bell-legal-load.ts and apps/site/lib/bell-served-load.ts, node: imports only), a copy of the real legal
 * file, and a fixture manifest of three entries (two decoys of 64 hex and the legal entry) written in a non-canonical form
 * (spacing, unsorted keys), so that any JSON rewrite shows. The real site manifest is never read here. Each test carries a
 * positive control; its killer is the line above it, the other named mutants of the plan are in the lot's mutant table.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { loadBellLegal, BELL_LEGAL_REL } from "../apps/site/lib/bell-legal-load.ts";
import { collectFiles } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const SCRIPT_REL = "scripts/pin-bell-legal.mjs";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const LIBS = ["apps/site/lib/bell-legal-load.ts", "apps/site/lib/bell-served-load.ts"];
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const LEGAL_RAW = readFileSync(join(ROOT, BELL_LEGAL_REL), "utf8");
/** The pin of the unmodified copy, by the loader's rule restated only to build the fixture (each test checks it by loadBellLegal). */
const PINNED = sha256(LEGAL_RAW.replace(/\r\n/g, "\n"));
const DECOY_A = sha256("pin-bell-legal decoy one"), DECOY_B = sha256("pin-bell-legal decoy two");
const ENTRY_KEY = `"${BELL_LEGAL_REL}": "`;
const legalLine = (sha: string): string => `\n    ${ENTRY_KEY}${sha}",`;
/** The fixture manifest: decoy A in position of value (`valueA` lets a test break it), the legal entry (`legal`, may be ""), decoy B. */
const fixture = (legal: string, valueA = `"${DECOY_A}"`): string =>
  `{ "files":{"apps/site/data/zz-decoy.json" :   ${valueA},${legal} "apps/site/data/aa-decoy.json":"${DECOY_B}"},\n "algorithm":"sha256" }\n`;
const okLine = (verb: "set to" | "unchanged", sha: string): string => `pin-bell-legal OK: ${BELL_LEGAL_REL} ${verb} ${sha}\n`;
const refusedLine = (code: string): string => `pin-bell-legal REFUSED: ${code}\n`;
const OK_SET = new RegExp(`^pin-bell-legal OK: ${BELL_LEGAL_REL.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&")} set to ([0-9a-f]{64})\\n$`);
const withComment = (raw: string): string => {
  assert.equal(raw.split('"$comment": "').length, 2, "the legal file carries one $comment (positive control of the edit)");
  return raw.replace('"$comment": "', () => '"$comment": "Edited by the test. ');
};
const crlf = (raw: string): string => raw.replace(/\r?\n/g, "\r\n");

interface PinRoot { tmp: string; legal: (raw: string) => void; manifest: () => string; setManifest: (text: string) => void; run: (...args: string[]) => SpawnSyncReturns<string> }
/** A fresh root with what the tool reads (`full`), or the tool alone; the caller removes `tmp` in `finally`. A link is refused. */
function pinRoot(full = true): PinRoot {
  assert.ok(existsSync(join(ROOT, SCRIPT_REL)), `${SCRIPT_REL} is missing`);
  const copied = full ? [SCRIPT_REL, ...LIBS] : [SCRIPT_REL];
  for (const rel of copied) assert.ok(!lstatSync(join(ROOT, rel)).isSymbolicLink(), `${rel} is a link: refused before any copy`);
  const tmp = mkdtempSync(join(tmpdir(), "pin-bell-legal-"));
  for (const rel of copied) cpSync(join(ROOT, rel), join(tmp, rel));
  const root: PinRoot = {
    tmp,
    legal: (raw) => writeFileSync(join(tmp, BELL_LEGAL_REL), raw),
    manifest: () => readFileSync(join(tmp, MANIFEST_REL), "utf8"),
    setManifest: (text) => writeFileSync(join(tmp, MANIFEST_REL), text),
    run: (...args) => spawnSync(process.execPath, [join(tmp, SCRIPT_REL), ...args], { cwd: tmp, encoding: "utf8" }),
  };
  if (full) {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    root.legal(LEGAL_RAW);
    root.setManifest(fixture(legalLine(PINNED)));
    assert.doesNotThrow(() => loadBellLegal(tmp), "the fixture root is valid for the loader before any run (positive control)");
  }
  return root;
}
const done = (r: PinRoot): void => rmSync(r.tmp, { recursive: true, force: true });

// killer: scripts/pin-bell-legal.mjs:56 CONST "out.text" -> "JSON.stringify(JSON.parse(out.text), null, 2)"
test("pin_bell_legal_changes_only_its_entry", () => {
  const r = pinRoot();
  try {
    const before = r.manifest();
    r.legal(withComment(LEGAL_RAW));
    assert.throws(() => loadBellLegal(r.tmp), /sha256 mismatch/, "the edit makes the old pin wrong (positive control)");
    const run = r.run();
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stderr, "");
    const sha = OK_SET.exec(run.stdout)?.[1];
    assert.ok(sha !== undefined && sha !== PINNED, `one closed line with a new sha256: ${run.stdout}`);
    const after = r.manifest(), at = before.indexOf(ENTRY_KEY) + ENTRY_KEY.length;
    assert.equal(after.length, before.length, "same length");
    assert.equal(after.slice(0, at), before.slice(0, at), "every byte before the entry kept");
    assert.equal(after.slice(at + 64), before.slice(at + 64), "every byte after the entry kept");
    assert.equal(after.slice(at, at + 64), sha, "the entry holds the printed sha256");
  } finally {
    done(r);
  }
});

// killer: scripts/pin-bell-legal.mjs:43 CONST "update(lf, \"utf8\")" -> "update(Buffer.from(legalRaw, \"utf8\"))"
test("pin_bell_legal_output_is_what_the_loader_accepts", () => {
  const r = pinRoot();
  try {
    // CRLF line ends, as a checkout under core.autocrlf writes them: on LF bytes a pin of the raw bytes equals the loader's.
    const edited = crlf(withComment(LEGAL_RAW));
    assert.notEqual(sha256(edited), sha256(edited.replace(/\r\n/g, "\n")), "the copy carries CR bytes (positive control)");
    r.legal(edited);
    const first = r.run();
    assert.equal(first.status, 0, first.stderr);
    const sha = OK_SET.exec(first.stdout)?.[1];
    assert.ok(sha !== undefined, `set: ${first.stdout}`);
    assert.doesNotThrow(() => loadBellLegal(r.tmp), "the loader accepts what the tool wrote");
    const pinned = r.manifest(), second = r.run();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(second.stdout, okLine("unchanged", sha), "a second run finds the entry right");
    assert.equal(r.manifest(), pinned, "a second run writes nothing");
  } finally {
    done(r);
  }
});

// killer: scripts/pin-bell-legal.mjs:42 CONST "legalRaw.replace(/\\r\\n/g, \"\\n\")" -> "legalRaw"
test("pin_bell_legal_matches_the_loader_rule_on_crlf", () => {
  const r = pinRoot();
  try {
    const lf = withComment(LEGAL_RAW);
    r.legal(lf);
    const sha = OK_SET.exec(r.run().stdout)?.[1];
    assert.ok(sha !== undefined, "the LF form is pinned");
    assert.ok(crlf(lf).includes("\r\n") && crlf(lf) !== lf, "the CRLF copy differs in its bytes (positive control)");
    r.legal(crlf(lf));
    const run = r.run();
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, okLine("unchanged", sha), "the CRLF copy has the sha256 of its LF form");
    assert.doesNotThrow(() => loadBellLegal(r.tmp), "the loader accepts the CRLF copy");
  } finally {
    done(r);
  }
});

// killer: scripts/pin-bell-legal.mjs:45 CONST "throw closed(\"manifest_entry_not_once\");" -> "text = manifestText.replace(/files.\\s*:\\s*\\{/, (m) => m + JSON.stringify(BELL_LEGAL_REL) + ': ' + JSON.stringify(sha) + ', ');"
test("pin_bell_legal_refuses_an_absent_or_doubled_entry", () => {
  const r = pinRoot();
  try {
    r.legal(withComment(LEGAL_RAW));
    for (const text of [fixture(""), fixture(legalLine(PINNED) + legalLine(DECOY_B))]) {
      assert.doesNotThrow(() => JSON.parse(text), "the fixture is JSON: the refusal is the entry rule's (positive control)");
      r.setManifest(text);
      const run = r.run();
      assert.equal(run.status, 1);
      assert.equal(run.stdout, "");
      assert.equal(run.stderr, refusedLine("manifest_entry_not_once"));
      assert.equal(r.manifest(), text, "the manifest unchanged to the byte");
    }
  } finally {
    done(r);
  }
});

// killer: scripts/pin-bell-legal.mjs:41 SDL "try { JSON.parse(manifestText); } catch { throw closed(\"manifest_unreadable\"); }" -> ""
test("pin_bell_legal_prints_no_other_manifest_value", () => {
  const r = pinRoot();
  try {
    const broken = fixture(legalLine(PINNED), `x"${DECOY_A}"`), fragment = DECOY_A.slice(0, 6);
    assert.equal(broken.split(ENTRY_KEY).length, 2, "the legal entry is listed once in the broken fixture");
    assert.throws(() => JSON.parse(broken), (e: unknown) => e instanceof SyntaxError && e.message.includes(fragment), "JSON.parse quotes the decoy (positive control)");
    r.setManifest(broken);
    const runs = [r.run()];
    assert.equal(runs[0]?.status, 1);
    assert.equal(runs[0]?.stderr, refusedLine("manifest_unreadable"));
    assert.equal(r.manifest(), broken, "the manifest unchanged to the byte");
    rmSync(join(r.tmp, MANIFEST_REL));
    runs.push(r.run());
    assert.equal(runs[1]?.status, 1);
    assert.equal(runs[1]?.stderr, refusedLine("manifest_unreadable"), "an absent manifest: the same line");
    for (const run of runs) {
      assert.equal(run.stdout, "");
      for (const s of [DECOY_A, DECOY_B, fragment]) assert.ok(!`${run.stdout}${run.stderr}`.includes(s), `no manifest value printed (${s})`);
    }
  } finally {
    done(r);
  }
});

// killer: scripts/pin-bell-legal.mjs:59 SDL "try { loadBellLegal(ROOT); } catch { accepted = false; }" -> ""
test("pin_bell_legal_restores_on_a_failed_postcondition", () => {
  const r = pinRoot();
  try {
    const empty = `${JSON.stringify({ ...(JSON.parse(LEGAL_RAW) as object), terms_words_table: [] }, null, 2)}\n`;
    r.legal(empty);
    r.setManifest(fixture(legalLine(sha256(empty))));
    assert.throws(() => loadBellLegal(r.tmp), /non-empty array/, "pinned right, the empty table is refused by the loader's shape check (positive control)");
    const before = fixture(legalLine(PINNED));
    r.setManifest(before);
    const run = r.run();
    assert.equal(run.status, 1);
    assert.equal(run.stdout, "");
    assert.equal(run.stderr, refusedLine("postcondition_failed"));
    assert.equal(r.manifest(), before, "the original manifest written back, to the byte");
  } finally {
    done(r);
  }
});

// killer: scripts/export-public.mjs:58 CONST "\"LICENSE\"," -> "\"LICENSE\", \"scripts/pin-bell-legal.mjs\","
test("pin_bell_legal_is_not_exported", () => {
  assert.ok(existsSync(join(ROOT, SCRIPT_REL)), `${SCRIPT_REL} exists, so its absence from the export is a finding (positive control)`);
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  assert.ok(kept.has("README.md"), "the export walk ran (positive control)");
  assert.ok(!kept.has(SCRIPT_REL), `${SCRIPT_REL} is a source-repository tool, never exported`);
});

// killer: scripts/pin-bell-legal.mjs:29 CONST "process.argv.length !== 2" -> "false"
test("pin_bell_legal_refuses_any_argument", () => {
  const alone = pinRoot(false);
  try {
    const run = alone.run("--help");
    assert.equal(run.status, 64, "the tool alone, no loader nor data: usage comes before any read");
    assert.equal(run.stdout, "");
    assert.equal(run.stderr, refusedLine("usage"));
  } finally {
    done(alone);
  }
  const r = pinRoot();
  try {
    r.legal(withComment(LEGAL_RAW));
    const before = r.manifest(), run = r.run("x");
    assert.equal(run.status, 64);
    assert.equal(run.stderr, refusedLine("usage"));
    assert.equal(r.manifest(), before, "nothing written");
  } finally {
    done(r);
  }
});
