/**
 * Root tests of the public free-text gate scripts/public-text-deny.mjs (ADR-PUBLIC-CADENCE-1 D1.3, CA-1.1 unit half, CA-1.6).
 * Governance-only (root test/ is never exported). Every vendor vector is built from the module's own lists (`sample`), so
 * this file names no vendor; the French and credential vectors are built at run time, so the language gate and
 * no_secret_in_repo stay green on this file. Mutants M1-a..M1-i: removing rule (x) lets its vector pass => red here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { KEY_SHAPES } from "../apps/bell/scripts/bell-publish.mjs";
import {
  checkPublicText, kindForPath, PUBLIC_TEXT_KINDS, SECRET_SHAPES, DATA_SOURCE_FORMS, OPERATOR_FORMS, HOSTING_FORMS, KITCHEN_FORMS,
} from "../scripts/public-text-deny.mjs";

const ROOT = join(import.meta.dirname, "..");
const rules = (text: string, kind = "message"): string[] => checkPublicText(text, kind).violations.map((v) => v.rule);

test("public_text_gate_refuses_one_vector_per_rule — (a) to (h), Q-3, the title bound, the kind and the empty text", () => {
  const vectors: [string, string, string][] = [
    ["a", "message", `Mise ${String.fromCharCode(0xe0)} jour du site`], // French (language gate)
    ["a", "message", "The record is verified"], // the bell scope added to checkReleaseText
    ["b", "message", "Close PUBLIC-CADENCE-1 in the mirror"],
    ["b", "message", "Track RISK-2026-7 in the mirror"], // the CVE exception is CVE only (a year-shaped id is refused)
    ["k", "message", "Release model per ADR-M010"],
    ["k", "message", "Lot closed at G7"],
    ["c", "message", "Serve the U-4b-2a class"],
    ["k", "message", "Done per decision 237"],
    ...["R-25", "CA-1", "checkpoint-2", "PR-2", "monark-governance", "PR-A1", "Q-3", "M1-a", "D1.3", "A-7", "CP1"].map((w): [string, string, string] => ["c", "message", `Per ${w} as written`]),
    ["p", "message", "Write to flow@example.org"], ["p", "message", "Served from 10.0.0.1 now"], ["title", "message", "\n\nBody only"], ["title", "message", `${"x".repeat(49)}o${String.fromCharCode(0x304)}`],
    ...["\u200b", "\u202e", "\ufeff"].map((c): [string, string, string] => ["cf", "message", `Fix${c} the gate`]),
    ["d", "message", "Public sync of the site"],
    ["e", "message", `Copy it from ${"F"}:${"\\"}work`],
    ["g", "message", `Rotate ghp_${"a".repeat(36)}`],
    ["g", "message", "See https://example.org/x for the data"],
    ["g", "message", "See https://github.com/KraidleAI/other"], // the allowlist is the mirror, not the organisation
    ["h", "issue", "The piece ships in Q3."],
    ["h", "issue", "The piece ships soon."],
    ...["Ships in 2027.", "Ships in March.", "Ships next quarter."].map((t): [string, string, string] => ["h", "issue", t]),
    ["q3", "message", "Raise the budget of the gate"],
    ["title", "message", "x".repeat(51)],
    ["title", "message", "Title\nbody without an empty line"],
    ["kind", "commit", "A clean line"],
    ["empty", "message", " \n "],
  ];
  for (const [rule, kind, text] of vectors) {
    assert.ok(rules(text, kind).includes(rule), `${JSON.stringify(text)} (${kind}) must be refused by rule ${rule}: ${JSON.stringify(checkPublicText(text, kind))}`);
  }
  // (f): every form of the closed vendor lists, through its own sample.
  const forms = [...DATA_SOURCE_FORMS, ...OPERATOR_FORMS, ...HOSTING_FORMS];
  assert.ok(forms.length >= 20, "the vendor lists are loaded (false-green guard)");
  for (const f of forms) {
    const wide = String.fromCharCode(f.sample.charCodeAt(0) + 0xfee0) + f.sample.slice(1); // full-width first letter: NFKC folds it back
    for (const s of [f.sample, f.sample.toUpperCase(), f.sample.toLowerCase(), wide]) assert.ok(rules(`Read the ${s} feed`).includes("f"), `vendor form ${String(f.re)} must refuse ${s}`);
  }
  assert.ok(KITCHEN_FORMS.length >= 10, "the kitchen forms are loaded (false-green guard)");
  for (const f of KITCHEN_FORMS) assert.ok(rules(`Per the ${f.sample} note`).includes("k"), `kitchen form ${String(f.re)} must refuse its sample`);
  const key = `ghp_${"a".repeat(36)}`, g = checkPublicText(`Rotate ${key}`, "message").violations.find((x) => x.rule === "g");
  assert.ok(g !== undefined && !g.word.includes(key.slice(4)), `a credential shape is never reported in clear: ${JSON.stringify(g)}`);
  assert.ok(forms.every((f) => rules(`Read the ${f.sample.slice(0, 2)}\u200b${f.sample.slice(2)} feed`).includes("cf")), "a zero-width space inside a name is refused");
  // (g): the credential shapes of bell-publish, minus its bare "://" rule (free text may carry an allowlisted URL).
  assert.equal(SECRET_SHAPES.length, KEY_SHAPES.length - 1, "exactly one KEY_SHAPES rule (the bare ://) is dropped");
  assert.ok(!SECRET_SHAPES.some((re) => re.test("a://b")), "the dropped rule is the bare ://");
});

test("public_text_gate_accepts — a plain message, a CVE id, 50 code points, allowlisted URLs, (h) and the title bound by kind only", () => {
  const accepted: [string, string][] = [
    ["message", "Bell: export the verifier and the public keyring"],
    ["message", "Fix CVE-2026-12345 in the harness HTTP mirror"], // M1-i: the CVE exception of rule (b)
    ["message", "Harness: fix a deferred verdict\n\nThe structured content is unchanged.\n"],
    ["message", "x".repeat(50)],
    ["message", "x".repeat(49) + String.fromCodePoint(0x14d)], // 50 code points, 51 UTF-8 bytes (Q-P-4)
    ["message", "x".repeat(49) + String.fromCodePoint(0x1f600)], // 50 code points, 51 UTF-16 units (Q-P-4)
    ["message", "Refresh the lockfile"], // Q-3 bans the word lock and its inflections, not a longer word
    ["message", "Fix the gate\n\nCo-Authored-By: A B <noreply@example.com>\nBy: flow@users.noreply.github.com\n"], // (p): noreply addresses pass
    ["notes", "See https://monarkgate.tech/bell. Code: https://github.com/KraidleAI/Monark/releases"],
    ["notes", "The piece ships in Q3."], // (h) binds issues only
    ["issue", `${"x".repeat(60)}\nA title over 50 code points is fine outside a commit message.`],
  ];
  for (const [kind, text] of accepted) {
    const r = checkPublicText(text, kind);
    assert.ok(r.ok, `${JSON.stringify(text)} (${kind}) must pass: ${JSON.stringify(r.violations)}`);
  }
  assert.deepEqual([...PUBLIC_TEXT_KINDS], ["message", "notes", "issue"], "the closed list of kinds (C-V-9)");
});

test("public_text_kind_for_path — docs/public-notes/** maps to a kind by path, any other path to null (C-V-9)", () => {
  const cases: [string, string | null][] = [
    ["docs/public-notes/v0.7.0.commit.md", "message"],
    ["docs/public-notes/v0.7.0.md", "notes"],
    ["docs/public-notes/issues/dojo.md", "issue"],
    ["docs/public-notes/v1.0.0.md", null], // not a v0.x tag (isSemverTag)
    ["docs/public-notes/v0.7.0.commit.txt", null],
    ["docs/public-notes/README.md", null],
    ["docs/public-notes/issues/sub/x.md", null],
    ["docs/other/v0.7.0.md", null],
  ];
  for (const [rel, kind] of cases) assert.equal(kindForPath(rel), kind, rel);
});

test("public_notes_pass_the_gate — every file under docs/public-notes/** has a kind and passes the gate (CA-1.6, CA-5.1)", () => {
  const files: string[] = [];
  const walk = (rel: string): void => {
    for (const name of readdirSync(join(ROOT, rel))) {
      const r = `${rel}/${name}`;
      if (statSync(join(ROOT, r)).isDirectory()) walk(r);
      else files.push(r);
    }
  };
  walk("docs/public-notes");
  assert.ok(files.filter((f) => kindForPath(f) === "issue").length >= 2, `the issue texts are found (false-green guard): ${files.join(", ")}`);
  for (const f of files) {
    const kind = kindForPath(f);
    assert.ok(kind !== null, `${f}: unknown kind (fail-closed until a dated ADR line gives it one)`);
    const r = checkPublicText(readFileSync(join(ROOT, f), "utf8"), kind);
    assert.ok(r.ok, `${f} (${kind}) does not pass the public-text gate: ${JSON.stringify(r.violations)}`);
  }
});

// killer: scripts/public-text-deny.mjs:117 CONST "|^https:\/\/github\.com\/KraidleAI\/monark-kata-spec(?:[/?#]|$)" -> ""
test("public_text_gate_admits_the_spec_repository — the third public origin, exact name only", () => {
  const spec = "https://github.com/KraidleAI/monark-kata-spec";
  for (const u of [spec, `${spec}/blob/main/KATA-SPEC.md`, `${spec}#x`, `${spec}?y`, "https://github.com/kraidleai/MONARK-KATA-SPEC"]) {
    const r = checkPublicText(`Spec: ${u} now`, "notes");
    assert.ok(r.ok, `${u} must pass: ${JSON.stringify(r.violations)}`);
  }
  for (const u of [`${spec}-x`, `${spec}s`, "https://github.com/KraidleAI/monark-kata", "http://github.com/KraidleAI/monark-kata-spec", "https://github.com/KraidleAI/recherches", "https://github.com/KraidleAI/monark-governance"]) {
    assert.ok(rules(`Spec: ${u} now`, "notes").includes("g"), `${u} must be refused by rule g`);
  }
});
