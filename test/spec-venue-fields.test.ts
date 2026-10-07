// test/spec-venue-fields.test.ts -- lot VOCAB-VENUE-FIELDS-1 (decision of RECHERCHES, 76ffa25): the vocabulary gate of the public spec
// repository (contentProblems of scripts/spec-publish.mjs) masks the venue of a table row in the column venue and in the venue segment of
// source.trial_id ONLY when it is the pinned venue of wave 1 (the one venue of the 280 cells of the registry 811fcd57), never by field
// name: another value there, the name in any other field or in free text stays refused, in the byte pass and in the decoded pass. Rows are
// real-shaped: the projection of the seeded synthetic registry (apps/harness/test/helpers/synthetic-registry.ts, the venue of wave 1 in
// every cell) through projectCell and buildPolicyTable; the real registry is not in this repository (replayed out of it, see the G0).
// The new functions are loaded on demand, so the base, which lacks them, reddens by assertion. Each test names on the line above it the
// production mutation that reddens it (scripts/red-proof.mjs convention).
import { test } from "node:test";
import assert from "node:assert/strict";
import { projectCell, readRegistry, type ProjectionInputs } from "../apps/harness/src/policy-projection.ts";
import { buildPolicyTable } from "../apps/harness/src/policy-table-file.ts";
import { syntheticClassEntry, syntheticRegistry } from "../apps/harness/test/helpers/synthetic-registry.ts";
import { canonicalJson, contentProblems } from "../scripts/spec-publish.mjs";
import type { Kind } from "../scripts/spec-publish.mjs";

type Row = Record<string, unknown> & { source: Record<string, unknown> };
type Table = { row_format: string; class: { task_class: string }; rows: Row[] };
const INP: ProjectionInputs = { registryFile: "wave1.json", registrySha256: "", generator: "kata/bench/write-p2.ts@207f021f",
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}` };
const REG = syntheticRegistry();
/** The 32 class tables of the synthetic registry, canonical, as the writer of the table files writes them. */
const TABLES: Table[] = (() => {
  const by = new Map<string, NonNullable<ReturnType<typeof projectCell>>[]>(), inp = { ...INP, registrySha256: REG.sha256 };
  for (const c of readRegistry(REG.bytes)) { const r = projectCell(c, inp); if (r !== null) by.set(c.taskClass, [...(by.get(c.taskClass) ?? []), r]); }
  return [...by].sort(([a], [b]) => (a < b ? -1 : 1)).map(([cls, rows]) => JSON.parse(canonicalJson(buildPolicyTable(syntheticClassEntry(cls), rows))) as Table);
})();
const VENUE = String(REG.registry.rows[0]?.venue);
const named = (cls: string): Table => structuredClone(TABLES.find((t) => t.class.task_class === cls) ?? assert.fail(cls));
/** The vocabulary details of a table file at its release path, written canonically or as given. */
const vocab = (t: Table | string, kind: Kind = "policy-table", out = `contract-1.1.0/policy/${typeof t === "string" ? "btc-range-1h" : t.class.task_class}.json`): string[] =>
  contentProblems(out, kind, Buffer.from(typeof t === "string" ? t : canonicalJson(t)), "contract-1.1.0").filter((p) => p.code === "vocabulary").map((p) => p.detail);
const at = (t: Table, i: number, edit: (r: Row) => void): Table => { edit(t.rows[i] ?? assert.fail(`row ${String(i)}`)); return t; };

// killer: scripts/spec-publish.mjs:346 CONST "row.venue === pin" -> "row.venue === \"KEY\""
test("the_pinned_venue_in_the_venue_column_and_the_trial_id_passes_the_vocabulary_gate", async () => {
  const m: { waveVenue?: () => { venue: string; registry_sha256: string; cells: number } } = await import("../scripts/spec-publish.mjs");
  assert.ok(typeof m.waveVenue === "function", "scripts/spec-publish.mjs exports the pin waveVenue");
  const pin = m.waveVenue();
  assert.deepEqual([pin.venue, pin.registry_sha256.slice(0, 8), pin.cells, new Set(REG.registry.rows.map((r) => r.venue)).size], [VENUE, "811fcd57", 280, 1]);
  const t = named("btc-range-1h"), row = t.rows[0] ?? assert.fail("a row");
  assert.deepEqual([row.venue, String(row.source.trial_id).split("|")[2], String(row.cell_key).includes(`@${VENUE}/`)], [VENUE, VENUE, true], "a real-shaped row carries the venue three times");
  assert.deepEqual(vocab(t), []);
  assert.deepEqual(vocab(JSON.stringify(t, null, 2), "json", "contract-1.1.0/vectors-1.1.0.json"), [], "a table held by the vectors file, written with spaces");
});

// killer: scripts/spec-publish.mjs:348 CONST "t[2] === pin" -> "t[2] !== \"\""
test("another_value_in_the_venue_fields_is_refused_by_both_passes", () => {
  assert.deepEqual(vocab(named("btc-range-1h")), []);
  const other = "Hyperliquid";
  for (const [why, edit] of [["venue", (r: Row) => { r.venue = other; }], ["venue, case", (r: Row) => { r.venue = VENUE.toUpperCase(); }],
    ["trial_id", (r: Row) => { r.source.trial_id = String(r.source.trial_id).replace(`|${VENUE}|`, `|${other}|`); }],
    ["trial_id, other segment", (r: Row) => { r.source.trial_id = String(r.source.trial_id).replace("|CALIB", `|${VENUE}`); }],
    ["trial_id, seven segments", (r: Row) => { r.source.trial_id = `${String(r.source.trial_id)}|x`; }]] as const) {
    const d = vocab(at(named("btc-range-1h"), 0, edit)), word = why.startsWith("venue") ? (why === "venue" ? other : VENUE.toUpperCase()) : why === "trial_id" ? other : VENUE;
    assert.ok([":1 [a] ", ": a decoded string [a] "].every((pass) => d.some((x) => x.endsWith(`${pass}${word}`))), `${why}: ${d.join(" | ")}`);
  }
});

// killer: scripts/spec-publish.mjs:344 SDL "if (kind !== \"policy-table\" && !(kind === \"json\" && VECTORS.test(out))) return r;" -> ""
test("the_venue_name_outside_the_two_fields_of_a_table_row_is_refused", () => {
  assert.deepEqual(vocab(named("btc-range-1h")), []);
  const t = named("btc-range-1h"), cases: [string, Table | string, Kind?, string?][] = [
    ["text column", at(named("btc-range-1h"), 0, (r) => { r.text = `served from ${VENUE}`; })],
    ["status_reason", at(named("btc-range-1h"), 0, (r) => { r.status_reason = VENUE; })],
    ["registry_file", at(named("btc-range-1h"), 0, (r) => { r.source.registry_file = VENUE; })],
    ["class text", (() => { const x = named("btc-range-1h"); x.class = { ...x.class, text: VENUE } as Table["class"]; return x; })()],
    ["a venue member outside the rows", canonicalJson({ ...t, class: { ...t.class, venue: VENUE } }).replace('"rows":', `"note":{"venue":"${VENUE}"},"rows":`)],
    ["the table in a plain json file", canonicalJson(t), "json", "contract-1.1.0/tables.json"],
    ["a repeated member", canonicalJson(t).replace(`"venue":"${VENUE}"`, `"venue":"${VENUE}","venue":"${VENUE}"`)],
    ["an escaped member", canonicalJson(t).replace(`"venue":"${VENUE}"`, `"venue":"\\u00${VENUE.charCodeAt(0).toString(16)}${VENUE.slice(1)}"`)],
  ];
  for (const [why, body, kind, out] of cases) assert.ok(vocab(body, kind, out).length > 0, why);
});

// killer: scripts/spec-publish.mjs:137 CONST "vocabularyHits(venueMaskedText(text, out, kind))" -> "vocabularyHits(text)"
test("replay_every_class_table_of_a_real_shaped_registry_has_no_vocabulary_problem", () => {
  assert.deepEqual([TABLES.length, TABLES.reduce((n, t) => n + t.rows.length, 0) > 0], [32, true]);
  for (const t of TABLES) assert.deepEqual(vocab(t), [], t.class.task_class);
});

// killer: scripts/spec-publish.mjs:147 CONST "strings(venueMasked(v, out, kind).value)" -> "strings(v)"
test("the_decoded_pass_masks_the_same_fields_bound_to_the_pinned_value", () => {
  const t = named("btc-dir-1h");
  assert.deepEqual(vocab(t), []);
  assert.deepEqual(vocab(JSON.stringify({ synthetic_kata: { tables: [{ table: t }] } }), "json", "contract-1.1.0/vectors-1.1.0.json"), []);
});
