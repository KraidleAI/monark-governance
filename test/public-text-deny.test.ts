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

// killer: docs/public-notes/v0.8.0.md:1 CONST "v0.8.0 - a retired" -> "v0.8.0 - a Polygon retired"
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
  assert.ok(files.includes("docs/public-notes/TEMPLATE.md"), "the notes template is committed beside the notes (TEMPLATE-MARKERS-SOURCE-1)");
  files.splice(files.indexOf("docs/public-notes/TEMPLATE.md"), 1); // not a public text: checked by template_markers_follow_the_committed_template
  assert.ok(files.filter((f) => kindForPath(f) === "issue").length >= 2, `the issue texts are found (false-green guard): ${files.join(", ")}`);
  for (const f of files) {
    const kind = kindForPath(f);
    assert.ok(kind !== null, `${f}: unknown kind (fail-closed until a dated ADR line gives it one)`);
    const r = checkPublicText(readFileSync(join(ROOT, f), "utf8"), kind);
    assert.ok(r.ok, `${f} (${kind}) does not pass the public-text gate: ${JSON.stringify(r.violations)}`);
  }
});

// killer: scripts/public-text-deny.mjs:121 CONST "|^https:\/\/github\.com\/KraidleAI\/monark-kata-spec(?:[/?#]|$)" -> ""
test("public_text_gate_admits_the_spec_repository — the third public origin, exact name only", () => {
  const spec = "https://github.com/KraidleAI/monark-kata-spec";
  for (const u of [spec, `${spec}/blob/main/KATA-SPEC.md`, `${spec}#x`, `${spec}?y`, "https://github.com/kraidleai/MONARK-KATA-SPEC"]) {
    const r = checkPublicText(`Spec: ${u} now`, "notes");
    assert.ok(r.ok, `${u} must pass: ${JSON.stringify(r.violations)}`);
  }
  for (const u of [`${spec}-x`, `${spec}s`, "https://github.com/KraidleAI/monark-kata", "http://github.com/KraidleAI/monark-kata-spec", "https://github.com/KraidleAI/recherches", "https://github.com/KraidleAI/monark-governance",
    `https://example.org/${spec}`, "https://github.com/evil/monark-kata-spec", `${spec}.evil.com`]) {
    assert.ok(rules(`Spec: ${u} now`, "notes").includes("g"), `${u} must be refused by rule g`);
  }
});

// killer: scripts/public-text-deny.mjs:124 CONST "return URL_ALLOW.test(url) && URL_ALLOW.test(href);" -> "return URL_ALLOW.test(url);"
test("public_text_gate_resolves_dot_segments — an allowed origin cannot lead elsewhere", () => {
  for (const base of ["https://github.com/KraidleAI/Monark", "https://github.com/KraidleAI/monark-kata-spec"]) {
    for (const u of [`${base}/../recherches`, `${base}/%2e%2e/recherches`, `${base}/../../evil/x`]) {
      assert.ok(rules(`See ${u} now`, "notes").includes("g"), `${u} must be refused by rule g`);
    }
    assert.ok(checkPublicText(`See ${base}/releases now`, "notes").ok, `${base}/releases still passes`);
  }
});

// killer: scripts/public-text-deny.mjs:123 CONST "if (url.indexOf(\"://\") !== url.lastIndexOf(\"://\")) return false; " -> ""
test("public_text_gate_refuses_a_url_nested_in_an_allowed_one — one scheme separator per URL", () => {
  for (const u of ["https://github.com/KraidleAI/monark-kata-spec?u=https://example.org/x", "https://monarkgate.tech/#next=http://example.org"]) {
    assert.ok(rules(`See ${u} now`, "notes").includes("g"), `${u} must be refused by rule g`);
  }
});

// T0-TOOLING-1 (review M-d; gate act V-2 of MONARK, widened by its G2): every unfilled template marker of a line is named, an
// upper-case identifier in braces, inner spaces and hyphens included; lower-case braces and brace lists (the kata pattern of
// the skill) pass. Measured: 0 refusal on docs/public-notes/** (public_notes_pass_the_gate above).
// killer: scripts/public-text-deny.mjs:128 CONST "\\{\\s*[A-Z][A-Z0-9_-]*\\s*\\}" -> "\\{[A-Z][A-Z0-9_]*\\}"
test("public_text_gate_refuses_an_unfilled_marker — {T0} and {OPENAPI_SHA256} red, {btc,eth} and {dir} green", () => {
  for (const kind of PUBLIC_TEXT_KINDS) {
    for (const marker of ["{T0}", "{OPENAPI_SHA256}", "{ T0 }", "{OPENAPI-SHA256}"]) {
      const r = checkPublicText(`Served on ${marker}\n`, kind);
      assert.ok(r.violations.some((v) => v.rule === "ph" && v.word === marker && v.line === 1), `${kind}: ${marker} is refused by rule ph: ${JSON.stringify(r.violations)}`);
    }
    const both = checkPublicText("Served on {T0}, document {OPENAPI_SHA256}\n", kind).violations.filter((v) => v.rule === "ph").map((v) => v.word);
    assert.deepEqual(both, ["{T0}", "{OPENAPI_SHA256}"], `${kind}: each marker of a line is named`);
    for (const text of ["The classes {btc,eth}-{dir,range}-{1h,4h} are served\n", "One class per {dir}\n"]) {
      assert.deepEqual(checkPublicText(text, kind).violations.filter((v) => v.rule === "ph"), [], `${kind}: ${text.trim()} passes rule ph`);
    }
  }
});

// Gate act V-2 as widened by MONARK, one test per case (delta G2 of T0-TOOLING-1). Each case sits on one line with a marker
// of the other kind and a shell variable (D-7), so the line names exactly the refused marker, in every kind of public text.
const phWords = (line: string): string[][] => PUBLIC_TEXT_KINDS.map((kind) => checkPublicText(`${line}\n`, kind).violations.filter((v) => v.rule === "ph").map((v) => v.word));
const each = (words: string[]): string[][] => PUBLIC_TEXT_KINDS.map(() => words);

// killer: scripts/public-text-deny.mjs:128 CONST "\\{\\s*[A-Z]" -> "\\{[A-Z]"
test("public_text_gate_ph_refuses_a_spaced_marker — { T0 } is an unfilled marker", () => {
  assert.deepEqual(phWords("Served on { T0 } for the {btc,eth} classes, mirror ${MIRROR}"), each(["{ T0 }"]));
});

// killer: scripts/public-text-deny.mjs:128 CONST "[A-Z0-9_-]*" -> "[A-Z0-9_]*"
test("public_text_gate_ph_refuses_a_hyphenated_marker — {OPENAPI-SHA256} is an unfilled marker", () => {
  assert.deepEqual(phWords("The document {OPENAPI-SHA256} per {dir} class, mirror ${MIRROR}"), each(["{OPENAPI-SHA256}"]));
});

// killer: scripts/public-text-deny.mjs:128 CONST "[A-Z][A-Z0-9_-]*" -> "[A-Za-z][A-Za-z0-9_,-]*"
test("public_text_gate_ph_passes_a_lowercase_list — {btc,eth} is prose, the marker beside it is not", () => {
  assert.deepEqual(phWords("The {btc,eth} classes on { T0 } from ${MIRROR}"), each(["{ T0 }"]));
});

// killer: scripts/public-text-deny.mjs:128 CONST "[A-Z][A-Z0-9_-]*" -> "[a-zA-Z][a-zA-Z0-9_-]*"
test("public_text_gate_ph_passes_a_lowercase_word — {dir} is prose, the marker beside it is not", () => {
  assert.deepEqual(phWords("One class per {dir} since {OPENAPI-SHA256} from ${MIRROR}"), each(["{OPENAPI-SHA256}"]));
});

// killer: scripts/public-text-deny.mjs:128 CONST "(?<!\\$)" -> ""
test("public_text_gate_ph_passes_a_shell_variable — ${HOME} is a command, {HOME} is a marker (delta G2 D-7)", () => {
  assert.deepEqual(phWords("Set ${MONARK_PUBLIC_MIRROR} then fill {HOME}"), each(["{HOME}"]));
});

// E-2 of the delta2 G2 (agreed by MONARK): a shell-variable form of a TEMPLATE marker, ${T0}, is still an unfilled marker; any
// other variable, ${HOME}, stays a command. The template markers are the gate's closed list (TEMPLATE_MARKERS), one case each.
// killer: docs/public-notes/TEMPLATE.md:3 CONST "since {T0}:" -> "since the switch:"
test("public_text_gate_ph_refuses_a_template_variable_t0 — ${T0} is the T0 marker", () => {
  assert.deepEqual(phWords("Served on ${T0} from ${HOME}"), each(["${T0}"]));
});

// killer: docs/public-notes/TEMPLATE.md:5 CONST "`{OPENAPI_SHA256}`" -> "`its digest`"
test("public_text_gate_ph_refuses_a_template_variable_openapi — ${OPENAPI_SHA256} is the document marker", () => {
  assert.deepEqual(phWords("The document ${ OPENAPI_SHA256 } read from ${HOME}"), each(["${ OPENAPI_SHA256 }"]));
});

// killer: scripts/public-text-deny.mjs:128 CONST "(?<!\\$)" -> ""
test("public_text_gate_ph_passes_home — ${HOME} is a command, the marker beside it is not", () => {
  assert.deepEqual(phWords("Set ${HOME}, then fill {T0}"), each(["{T0}"]));
});

// TEMPLATE-MARKERS-SOURCE-1 (lot T0-FOLLOWUP-1, option A of MONARK): the template markers are those of the committed notes template
// docs/public-notes/TEMPLATE.md, derived, never typed: a marker added to a copy of the template joins the list. The template is not a
// public text (kindForPath gives it no kind; docs/ is never exported): it passes every rule of the notes gate but ph, and ph names
// exactly its markers.
// killer: scripts/public-text-deny.mjs:130 CONST ".map((m) => m[1])" -> ".map((m) => m[0])"
test("template_markers_follow_the_committed_template", async () => {
  const gate = (await import("../scripts/public-text-deny.mjs")) as Record<string, unknown>;
  const derive = gate["templateMarkers"] as ((text: string) => string[]) | undefined;
  assert.equal(typeof derive, "function", "scripts/public-text-deny.mjs exports templateMarkers");
  if (derive === undefined) return;
  const template = readFileSync(join(ROOT, "docs/public-notes/TEMPLATE.md"), "utf8");
  assert.deepEqual([...(gate["TEMPLATE_MARKERS"] as string[])], derive(template), "TEMPLATE_MARKERS is the template's marker list");
  assert.deepEqual(derive(template), ["T0", "SPEC_URL", "OPENAPI_SHA256"], "the template carries {T0}, {SPEC_URL} and {OPENAPI_SHA256}, each once in the list");
  assert.deepEqual(derive(`${template}\nFilled by hand: {NEW_MARK}.\n`), [...derive(template), "NEW_MARK"], "a marker added to a copy joins the list");
  assert.equal(kindForPath("docs/public-notes/TEMPLATE.md"), null, "the template is not a public text");
  const v = checkPublicText(template, "notes").violations;
  assert.deepEqual(v.filter((x) => x.rule !== "ph"), [], "the template passes every other rule of the notes gate");
  assert.deepEqual([...new Set(v.map((x) => x.word))].sort(), ["{OPENAPI_SHA256}", "{SPEC_URL}", "{T0}"], "ph names exactly its markers");
});

// killer: docs/public-notes/TEMPLATE.md:5 CONST "is at {SPEC_URL}." -> "is at the spec repository."
test("public_text_gate_ph_refuses_a_template_variable_spec_url — ${SPEC_URL} is the specification marker (G2 F-6)", async () => {
  const derive = ((await import("../scripts/public-text-deny.mjs")) as Record<string, unknown>)["templateMarkers"] as ((text: string) => string[]) | undefined;
  assert.equal(typeof derive, "function", "scripts/public-text-deny.mjs exports templateMarkers");
  assert.ok(derive?.(readFileSync(join(ROOT, "docs/public-notes/TEMPLATE.md"), "utf8")).includes("SPEC_URL"), "SPEC_URL is a marker of the committed template");
  assert.deepEqual(phWords("The specification is at ${SPEC_URL}, home ${HOME}"), each(["${SPEC_URL}"]));
});

// G2 F-5 of T0-FOLLOWUP-1: the derivation reads markers with the placeholder rule's own shape (inner spaces, hyphens), and a
// template with no marker is refused by name, at import, instead of silently emptying the variable form.
// killer: scripts/public-text-deny.mjs:131 SDL "  if (names.length === 0) throw new Error(`${TEMPLATE_REL} has no marker`);" -> ""
test("template_markers_take_the_placeholder_shape_and_never_come_out_empty", async () => {
  const derive = ((await import("../scripts/public-text-deny.mjs")) as Record<string, unknown>)["templateMarkers"] as ((text: string) => string[]) | undefined;
  assert.equal(typeof derive, "function", "scripts/public-text-deny.mjs exports templateMarkers");
  if (derive === undefined) return;
  assert.deepEqual(derive("Since { T0 }, document {OPENAPI-SHA256}, again {T0}."), ["T0", "OPENAPI-SHA256"], "the placeholder shape derives");
  assert.throws(() => derive("A template with no marker.\n"), /docs\/public-notes\/TEMPLATE\.md has no marker/, "an empty list is refused by name");
});

// G2 T-1 of T0-FOLLOWUP-1: a shell variable written in the template ("${HOME}") is not a marker. Were it one, MARKER_VARIABLE would
// refuse every public text naming ${HOME}, contrary to the header: the lookbehind of the derivation is pinned here.
// killer: scripts/public-text-deny.mjs:130 CONST "(?<!\\$)" -> ""
test("template_markers_skip_a_shell_variable_of_the_template", async () => {
  const derive = ((await import("../scripts/public-text-deny.mjs")) as Record<string, unknown>)["templateMarkers"] as ((text: string) => string[]) | undefined;
  assert.equal(typeof derive, "function", "scripts/public-text-deny.mjs exports templateMarkers");
  if (derive === undefined) return;
  assert.deepEqual(derive("Since {T0}, run it with ${HOME} and ${ PATH }."), ["T0"], "a ${NAME} of the template is a shell variable, not a marker");
});
