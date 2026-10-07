// test/recompute-report.test.ts -- lot 2a of VERIFIERS-LIST-F5A-1 (2026-10-07; G0 docs/G0-lot-e2a-2a-report-reader.md): the closed reader of
// the recompute report, readRecomputeReport of apps/harness/src/policy-verifiers.ts, on a synthetic report of the new form (scope, a digest
// per cell of the release's classes, null elsewhere, no digest under differences). The real report is not here: its bindings (registry,
// list entry, every cell equal, the spec gate on its bytes, the remeasure of the non-row digests) are asserted by the commit that adds it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as verifiers from "../apps/harness/src/policy-verifiers.ts";
import { canonicalJson, contentProblems } from "../scripts/spec-publish.mjs";

type J = Record<string, unknown>;
const REPO = fileURLToPath(new URL("../", import.meta.url));
const sha256 = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");
const TEXTS = JSON.parse(/^TEXTS = (\{\n[\s\S]*?\n\})$/m.exec(readFileSync(join(REPO, "tools/kata-recalc/report.py"), "utf8"))?.[1] ?? "{}") as Record<string, string>;
const REGISTRY = readFileSync(join(REPO, "apps/harness/data/kata/registry/wave1.json"));
const ROWS = (JSON.parse(REGISTRY.toString("utf8")) as { rows: { taskClass: string; key: string; calib: { scoresSha256: string } }[] }).rows;
/** Held in release 1 (form (a)): the four dir-4h classes under the floor and the four dir-1h classes by the service order. */
const HELD = /-dir-(1h|4h)$/;
const C1 = "1".repeat(40), hex = (c: string): string => c.repeat(64);

/** A report of the new form, from the 280 cells of the registry, with the fixed texts of report.py: what lot 2a measures on. */
function synthetic(): J {
  const one = ROWS.find((r) => !HELD.test(r.taskClass)) ?? assert.fail("a band row");
  const at = { task_class: one.taskClass, cell_key: one.key };
  return {
    format: "monark-recompute-report-v1", verifier: `monark-kata-recalc@${C1}`, tool: { commit: C1, tree: "tools/kata-recalc", tree_sha256: hex("a") },
    registry: { file: "wave1.json", sha256: sha256(REGISTRY), generator_identity: TEXTS.generator_identity, cells: ROWS.length },
    inputs: { recompute: [{ role: "series", name: "BTCUSDT-1h.csv", sha256: hex("b"), bytes: 1000 }, { role: "vectors", name: "vectors.json", sha256: hex("c"), bytes: 2000 }],
      compare: [{ role: "registry", name: "wave1.json", sha256: sha256(REGISTRY), bytes: REGISTRY.length }] },
    platform: { python: "3.14.8", system: "Linux-6.18-x86_64", machine: "x86_64", libm: { name: "libm.so.6", version: "2.39", sha256: hex("d"), log_vectors_differing: 0 } },
    oracles: { conformance_vectors: { checks: 363, failures: 0 }, second_writing: { checks: 40, failures: 0 }, log_port: { checks: 9, failures: 0, measured_outputs: 9 } },
    fields: { decisions: TEXTS.decisions, values: ["calib.qhat"], digests: ["calib.scoresSha256"], value_rule: TEXTS.values, digest_rule: TEXTS.digests,
      outside_decisions: [{ field: "trialRegistryHead.hash", reason: TEXTS.outside_reason }] },
    scope: [...new Set(ROWS.map((r) => r.taskClass))].filter((c) => !HELD.test(c)).sort(),
    cells: ROWS.map((r) => ({ task_class: r.taskClass, cell_key: r.key, decisions_equal: true, scores_sha256: HELD.test(r.taskClass) ? null : r.calib.scoresSha256 }))
      .sort((a, b) => (a.task_class < b.task_class || (a.task_class === b.task_class && a.cell_key < b.cell_key) ? -1 : 1)),
    differences: [{ ...at, field: "calib.qhat", class: "explained, ln", kind: "value", a: "0x1.0000000000001p-1", b: "0x1.0000000000000p-1", ulps: 1 },
      { ...at, field: "calib.scoresSha256", class: "explained, association", kind: "digest", first_index: 12, terms: 3, max_ulps: 1 }],
    explanation: { classes: { "explained, ln": TEXTS["explained, ln"], "explained, association": TEXTS["explained, association"] }, engine_log: TEXTS.engine_log,
      log: { log_inputs: 327983, differing: 444, max_ulps: 1 } },
    summary: { cells: ROWS.length, decisions_equal: ROWS.length, values: 1, digests: 1, "explained, ln": 1, "explained, association": 1 },
    replay: TEXTS.replay,
  };
}
const BASE = synthetic();
/** BASE with the value at a dotted path set (undefined: the key removed). */
const variant = (path: string, value: unknown, from: J = BASE): J => {
  const r = structuredClone(from), ks = path.split("."), last = ks.pop() ?? "";
  const o = ks.reduce<J>((x, k) => x[k] as J, r);
  if (value === undefined) delete o[last]; else o[last] = value;
  return r;
};
const cellsOf = (r: J): J[] => r.cells as J[];
/** The module of lot 2a: before it, policy-verifiers.ts loads and lacks the reader (an assertion, not a load failure). */
const lot = (): typeof verifiers => {
  assert.equal(typeof verifiers.readRecomputeReport, "function", "policy-verifiers.ts exports readRecomputeReport");
  return verifiers;
};
const refuses = (bytes: Uint8Array | string, why: RegExp, what: string): void =>
  assert.throws(() => lot().readRecomputeReport(bytes), (e: unknown) => e instanceof Error && e.message.startsWith("MONARK recompute report: ") && why.test(e.message), what);

// reddened by: a departure of the closed form admitted (a key more or less at any level, the old form without scope or with digests under
// differences, a malformed hex, commit, double, class or verifier, a count that is not a non-negative integer, a decision that is not a
// boolean, cells or scope unsorted or repeated) or a writing other than the canonical one (spaces, key order, a final newline, -0, a
// fraction, a byte beyond ASCII), or the reader's writing parting from the contract's on the synthetic report
// killer: apps/harness/src/policy-verifiers.ts:151 CONST "typeof v === \"boolean\"" -> "true"
test("recompute_report_reader_judges_the_closed_form - readRecomputeReport admits a synthetic report of the new form (scope included) and refuses each departure of the closed form and of the canonical writing", () => {
  const { readRecomputeReport } = lot(), text = canonicalJson(BASE);
  assert.deepEqual(readRecomputeReport(text), BASE, "the synthetic report, written by the contract's canonicalJson");
  assert.deepEqual(readRecomputeReport(Buffer.from(text, "ascii")), BASE, "the same, as bytes");
  assert.equal((BASE.scope as string[]).length, 24, "release 1: the 24 band classes; the 8 direction classes are held, digest null");
  const form = (r: J, why: RegExp, what: string): void => refuses(canonicalJson(r), why, what);
  form(variant("scope", undefined), /^MONARK recompute report: report has the keys \[cells, differences, explanation, fields, format, inputs, oracles, platform, registry, replay, summary, tool, verifier\], not exactly/, "the old form, without scope");
  form(variant("note", ""), /report has the keys .*note.*, not exactly/, "a top-level key more");
  form(variant("format", "monark-recompute-report-v2"), /report\.format is off the form/, "another format");
  for (const v of [`Monark-kata-recalc@${C1}`, "monark-kata-recalc@1234567", "monark-kata-recalc", `@${C1}`, `a@b@${C1}`]) form(variant("verifier", v), /report\.verifier is off the form/, `verifier ${v}`);
  form(variant("tool.commit", C1.replace(/1/g, "A")), /report\.tool\.commit is off the form/, "an upper-case commit");
  form(variant("tool.tree_sha256", hex("a").slice(1)), /report\.tool\.tree_sha256 is off the form/, "a short tree digest");
  form(variant("tool.path", "x"), /report\.tool has the keys/, "a tool key more");
  form(variant("registry.sha256", hex("A")), /report\.registry\.sha256 is off the form/, "an upper-case registry digest");
  for (const n of [-1, 1.5, "280"]) form(variant("registry.cells", n), /report\.registry\.cells is off the form/, `registry cells ${String(n)}`);
  form(variant("inputs.recompute.0.bytes", -2), /report\.inputs\.recompute\[0\]\.bytes is off the form/, "a negative size");
  form(variant("inputs.compare.0.path", "x"), /report\.inputs\.compare\[0\] has the keys/, "an input key more");
  for (const s of [hex("A"), hex("a").slice(1), 0, ""]) form(variant("cells.0.scores_sha256", s), /report\.cells\[0\]\.scores_sha256 is off the form/, `scores_sha256 ${String(s)}`);
  for (const d of ["true", 1, null]) form(variant("cells.0.decisions_equal", d), /report\.cells\[0\]\.decisions_equal is off the form/, `decisions_equal ${String(d)}`);
  form(variant("cells.0.aux_sha256", hex("e")), /report\.cells\[0\] has the keys/, "a second digest per cell (the old form)");
  form(variant("cells.0.task_class", "BTC-range-1h"), /report\.cells\[0\]\.task_class is off the form/, "a class off the form");
  const [c0, c1] = cellsOf(BASE);
  form(variant("cells", [c1, c0, ...cellsOf(BASE).slice(2)]), /cells are not unique and sorted by \(task_class, cell_key\)/, "cells unsorted");
  form(variant("cells", [c0, c0, ...cellsOf(BASE).slice(2)]), /cells are not unique and sorted/, "a cell repeated");
  const scope = BASE.scope as string[];
  for (const [s, what] of [[[...scope].reverse(), "unsorted"], [[scope[0], ...scope], "a class repeated"], [["btc range"], "a class off the form"], ["btc-range-1h", "not a list"]] as const)
    form(variant("scope", s), /report\.scope is off the form/, `scope ${what}`);
  form(variant("differences.1.a", hex("1")), /report\.differences\[1\] has the keys/, "a digest under differences (the old form)");
  for (const a of ["1.5", "0x1.8", "0X1.8p+1"]) form(variant("differences.0.a", a), /report\.differences\[0\]\.a is off the form/, `double ${a}`);
  form(variant("differences.0.class", "not explained"), /report\.differences\[0\]\.class is off the form/, "a difference not explained");
  form(variant("differences.0.kind", "other"), /report\.differences\[0\]\.kind is off the form/, "another kind");
  form(variant("platform", []), /report\.platform is off the form/, "a platform that is not an object");
  form(variant("summary", null), /report\.summary is off the form/, "no summary");
  form(variant("summary.values", 1.5), /1\.5 is not an integer of the canonical writing/, "a fraction");
  refuses(text.replace('"ulps":1', '"ulps":-0'), /not its canonical writing/, "-0");
  refuses(JSON.stringify(BASE), /not its canonical writing/, "keys in insertion order");
  refuses(JSON.stringify(JSON.parse(text), null, 1), /not its canonical writing/, "spaces");
  refuses(`${text}\n`, /not its canonical writing/, "a final newline");
  refuses(canonicalJson(variant("replay", `${String(BASE.replay)} \u2603`)), /not ASCII/, "a byte beyond ASCII");
  refuses("{", /not UTF-8 JSON/, "not JSON");
  refuses(Buffer.from([0x7b, 0xff, 0x7d]), /not UTF-8 JSON/, "not UTF-8");
});

// reddened by: the reader binding what the gate and the guard bind (the registry, the list entry, the decisions, the scope against the
// cells): a report of another registry, tree or verifier must read here and be a mismatch at the gate, never an invalid report (Q-P3-2)
// killer: apps/harness/src/policy-verifiers.ts:151 CONST "typeof v === \"boolean\"" -> "v === true"
test("recompute_report_reader_binds_nothing_the_gate_binds - a report of another registry, tree or verifier, a cell not equal, a digest outside the scope or a scope class without a cell reads", () => {
  const { readRecomputeReport } = lot(), held = cellsOf(BASE).findIndex((c) => HELD.test(String(c.task_class)));
  const cases: [string, unknown][] = [["registry.sha256", hex("e")], ["registry.file", "wave2.json"], ["registry.cells", 0], ["verifier", `someone-else@${"2".repeat(40)}`],
    ["tool.tree", "tools/other"], ["tool.tree_sha256", hex("f")], ["cells.0.decisions_equal", false], [`cells.${held}.scores_sha256`, hex("9")],
    ["scope", [...(BASE.scope as string[]), "zzz-range-1h"]], ["scope", []], ["differences", []], ["inputs.compare", []]];
  for (const [path, value] of cases) assert.deepEqual(readRecomputeReport(canonicalJson(variant(path, value))), variant(path, value), `${path} = ${JSON.stringify(value)} reads`);
});

// reddened by: a 64-hex digest at a path of the synthetic report outside the closed list and the cells' digests (one under differences
// above all), or the closed list exported for the gate's digest rule parting from the paths the new form carries
// killer: apps/harness/src/policy-verifiers.ts:119 CONST "\"platform.libm.sha256\", " -> ""
test("recompute_report_non_row_digests_are_a_closed_list - on the synthetic report of the new form, every 64-hex digest is at a path of REPORT_NON_ROW_DIGESTS or is a cell's scores_sha256, and none is under differences", () => {
  const { REPORT_NON_ROW_DIGESTS } = lot();
  const paths = (v: unknown, at: string, out: Set<string>): Set<string> => {
    if (typeof v === "string") { if (/[0-9a-fA-F]{64}/.test(v)) out.add(at); }
    else if (Array.isArray(v)) v.forEach((x) => paths(x, `${at}[]`, out));
    else if (v !== null && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (/[0-9a-fA-F]{64}/.test(k)) out.add(`${at}{key}`); paths(x, at === "" ? k : `${at}.${k}`, out); }
    return out;
  };
  const found = [...paths(BASE, "", new Set())].sort();
  assert.deepEqual(found, [...REPORT_NON_ROW_DIGESTS, "cells[].scores_sha256"].sort(), "the measure on the new form");
  assert.deepEqual(found.filter((p) => p.startsWith("differences")), [], "no digest under differences");
  assert.ok(cellsOf(BASE).every((c) => (c.scores_sha256 === null) === HELD.test(String(c.task_class))), "a digest for each cell of the scope, null for each held class");
});

// reddened by: a byte of the synthetic report that the gate of the spec repository refuses at the path of a dated folder's report (the
// venue in a cell key taken for a free word, a banned word in a fixed text of report.py)
// killer: scripts/spec-publish.mjs:113 CONST "k.replace(VENUE, \"@$1KEY/\")" -> "k"
test("recompute_report_synthetic_passes_the_spec_gate - the synthetic report's bytes, admitted by the reader, pass contentProblems in kind json at a dated folder's report path", () => {
  const dir = "contract-1.1.0-tables-2026-10-20", bytes = Buffer.from(canonicalJson(BASE), "ascii");
  assert.deepEqual(lot().readRecomputeReport(bytes), BASE, "the reader admits the bytes");
  assert.deepEqual(contentProblems(`${dir}/recompute/wave1-monark-kata-recalc.json`, "json", bytes, dir), []);
});
