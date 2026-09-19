/**
 * Root oracles for Lot CRA-B — the CRA "no-regret" items of Regulation (EU) 2024/2847 (docs/G0-lot-cra-b.md;
 * ADR-CRA-B). Non-LLM guards, negation/condition-aware where a public surface must stay conditional. Each
 * test carries a named mutant (proved on a working-tree copy + node_modules junction; sha256 before/after of
 * the real files unchanged — docs/PLI-lot-cra-b.md). These six tests are the base+6 of this lot.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collectFiles, WHITELIST_FILES, WHITELIST_DIRS, APP_PACKAGE_DIRS } from "../scripts/export-public.mjs";
import { scanFile, loadExempt } from "../scripts/lang-gate.mjs";
import { SBOM_COMMAND } from "../scripts/sbom.mjs";
import {
  TOOL_INPUT_SCHEMA, TOOL_OUTPUT_SCHEMA, PARAMS_SCHEMA,
  CASCADE_INPUT_SCHEMA, CASCADE_OUTPUT_SCHEMA,
  ATTEST_INPUT_SCHEMA, ATTEST_OUTPUT_SCHEMA,
  CALIBRATE_INPUT_SCHEMA, CALIBRATE_OUTPUT_SCHEMA,
} from "../apps/harness/src/schema-projection.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

// The exact L-5 sentence, identical on README.md and SECURITY.md (C-7 / advisor).
const L5_SENTENCE = "No personal data is required to use the service (no account, e-mail, or wallet).";

// -- C-5 / L-3 : the CI publishes a CycloneDX SBOM per run --------------------------------------------
test("ci_publishes_sbom — g6 generates a CycloneDX SBOM and uploads it per run (C-5/L-3)", () => {
  const LINES = read(".github/workflows/ci.yml").split(/\r?\n/);
  const g6Idx = LINES.findIndex((l) => /^  g6-compliance\s*:/.test(l));
  assert.notEqual(g6Idx, -1, "job 'g6-compliance' missing from the workflow");
  const g6: string[] = [];
  for (let i = g6Idx + 1; i < LINES.length; i++) {
    const l = LINES[i]!;
    if (/^  \S/.test(l) || /^\S/.test(l)) break; // next 2-space job key or a column-0 key
    g6.push(l.replace(/#.*$/, "")); // strip end-of-line comments (the `# v7.0.1` pin comment)
  }
  // (a) the SBOM run line: the command SOURCE is scripts/sbom.mjs (SBOM_COMMAND) — drift in either reds — plus
  //     the C-5 literals and the sbom.cdx.json redirect. Mutant `run: echo` removes this line => red.
  const runLine = g6.find((l) => /^\s*run:/.test(l) && l.includes(SBOM_COMMAND));
  assert.ok(runLine, `g6 must run the SBOM command \`${SBOM_COMMAND}\` (C-5); mutant 'run: echo' reds here`);
  for (const lit of ["npm sbom", "cyclonedx", "--package-lock-only"]) assert.ok(runLine.includes(lit), `SBOM run line must contain '${lit}' (C-5)`);
  assert.ok(runLine.includes("> sbom.cdx.json"), "SBOM run line must redirect to sbom.cdx.json (C-5)");
  // (b) the artifact is uploaded by a SHA-pinned actions/upload-artifact with path sbom.cdx.json.
  assert.ok(g6.some((l) => /uses:\s*actions\/upload-artifact@[0-9a-f]{40}\b/.test(l)), "g6 must upload the SBOM with a SHA-pinned actions/upload-artifact (C-5/C-3)");
  assert.ok(g6.some((l) => /^\s*path:\s*.*sbom\.cdx\.json/.test(l)), "the upload step must set path: sbom.cdx.json (C-5)");
});

// -- L-4 / C-2 : the product boundary matches the export list; SECURITY.md is a kept export file ------
test("product_boundary_matches_export_list — every export whitelist entry has a boundary row; SECURITY.md kept (L-4/C-2)", () => {
  const pkgDirs = readdirSync(join(ROOT, "packages")).filter((n) => statSync(join(ROOT, "packages", n)).isDirectory()).map((n) => `packages/${n}`);
  const exported = [...WHITELIST_FILES, ...WHITELIST_DIRS, ...APP_PACKAGE_DIRS, ...pkgDirs];
  const rows = read("docs/PRODUCT-BOUNDARY.md").split(/\r?\n/).filter((l) => l.trimStart().startsWith("|"));
  assert.ok(rows.length >= 10, `PRODUCT-BOUNDARY.md has too few table rows (${rows.length}) — false green?`);
  const rowsText = rows.join("\n");
  const missing = exported.filter((e) => !rowsText.includes("`" + e + "`"));
  assert.deepEqual(missing, [], `export whitelist entries with no PRODUCT-BOUNDARY row (mutant: drop a table row): ${missing.join(", ")}`);
  // C-2 export tuyau: SECURITY.md is a real kept export file. Mutant: drop it from WHITELIST_FILES => not kept => red.
  assert.ok(collectFiles(ROOT).kept.some((f) => f.rel === "SECURITY.md"), "SECURITY.md must be in collectFiles(ROOT).kept (C-2; mutant 'export line removed' reds here)");
  assert.ok(rowsText.includes("`SECURITY.md`"), "SECURITY.md must have a PRODUCT-BOUNDARY row");
});

// -- L-5 / C-7 : no personal-data field key in the served schemas -------------------------------------
test("no_personal_data_fields_in_served_schemas — no personal-data field key in schemas/ or the projected MCP schemas (L-5/C-7)", () => {
  const PERSONAL = new Set(["email", "phone", "address", "ip", "user_id"]);
  const SUBSCHEMA_MAPS = new Set(["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]);
  // Collect FIELD NAMES = keys under a subschema map (position-aware, the schema-projection stripMeta rule):
  // a key literally named `description` is a JSON-Schema annotation, never a wire field, so whole-key equality
  // means 'ip' never matches inside 'descr-ip-tion' (C-7). Recursive.
  const fieldNames = (node: unknown, out: Set<string>): void => {
    if (Array.isArray(node)) { for (const n of node) fieldNames(n, out); return; }
    if (node !== null && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (SUBSCHEMA_MAPS.has(k) && v !== null && typeof v === "object" && !Array.isArray(v)) {
          for (const [name, sub] of Object.entries(v as Record<string, unknown>)) { out.add(name); fieldNames(sub, out); }
        } else fieldNames(v, out);
      }
    }
  };
  const all = new Set<string>();
  const schemaDir = join(ROOT, "schemas");
  const files = readdirSync(schemaDir).filter((n) => n.endsWith(".json"));
  assert.ok(files.length >= 5, `too few schema files scanned (${files.length}) — false green?`);
  for (const f of files) fieldNames(JSON.parse(readFileSync(join(schemaDir, f), "utf8")) as unknown, all);
  const PROJECTED: unknown[] = [TOOL_INPUT_SCHEMA, TOOL_OUTPUT_SCHEMA, PARAMS_SCHEMA, CASCADE_INPUT_SCHEMA, CASCADE_OUTPUT_SCHEMA, ATTEST_INPUT_SCHEMA, ATTEST_OUTPUT_SCHEMA, CALIBRATE_INPUT_SCHEMA, CALIBRATE_OUTPUT_SCHEMA];
  for (const s of PROJECTED) fieldNames(s, all);
  assert.ok(all.size >= 30, `implausibly few field names collected (${all.size}) — false green?`);
  for (const k of ["residual", "verdict", "remaining_budget", "region"]) assert.ok(all.has(k), `positive control: field '${k}' should be collected (walk reached the schemas)`);
  const hits = [...all].filter((k) => PERSONAL.has(k.toLowerCase()));
  assert.deepEqual(hits, [], `personal-data field key(s) in a served schema: ${hits.join(", ")}`);
  // whole-key proof (C-7): a synthetic `ip` key IS caught; a `description` key is NOT.
  const probe = new Set<string>();
  fieldNames({ properties: { ip: { type: "string" }, description: { type: "string" } } }, probe);
  assert.deepEqual([...probe].filter((k) => PERSONAL.has(k.toLowerCase())), ["ip"], "matcher must catch a whole 'ip' key and NOT 'description' (C-7); mutant 'ip in a copied schema' reds the real scan");
  // L-5 sentence identity (advisor): README.md and SECURITY.md carry the SAME exact sentence.
  assert.ok(read("README.md").includes(L5_SENTENCE), "README.md must carry the L-5 sentence");
  assert.ok(read("SECURITY.md").includes(L5_SENTENCE), "SECURITY.md must carry the same L-5 sentence");
});

// -- C-6 : the public CRA surfaces stay conditional (no applicability/conformity claim) ---------------
test("cra_surfaces_stay_conditional — public CRA surfaces make no applicability or conformity claim (C-6)", () => {
  // Negation-aware closed list (the existing PROBATIVE scrub covers only verified|proven|certified).
  const CRA = /(?<!\bnot )(?<!\bno )(?<!\bnever )\b(?:compliant|in scope|secure|CE mark(?:ing|ed)?)\b/gi;
  // CLOSED licit mask: exact conditional spans that legitimately contain a listed term (the point of route B).
  const LICIT: ReadonlyArray<readonly [string, string]> = [["conditional", "if MONARK is in scope as a manufacturer"]];
  const mask = (line: string): string => {
    let out = line;
    for (const [, span] of LICIT) { let i = out.indexOf(span); while (i !== -1) { out = out.slice(0, i) + " ".repeat(span.length) + out.slice(i + span.length); i = out.indexOf(span, i + span.length); } }
    return out;
  };
  const scanned = ["SECURITY.md", "docs/PROCEDURE-notification-CRA.md", "docs/PRODUCT-BOUNDARY.md", "README.md"];
  const corpus: string[] = [];
  const survivors: string[] = [];
  for (const rel of scanned) {
    const text = read(rel);
    corpus.push(text);
    text.split(/\r?\n/).forEach((line, i) => { const h = mask(line).match(CRA); if (h) for (const x of h) survivors.push(`${rel}:${i + 1}  ${x}  >> ${line.trim()}`); });
  }
  assert.deepEqual(survivors, [], `CRA applicability/conformity claim on a public surface:\n${survivors.join("\n")}`);
  const joined = corpus.join("\n");
  for (const [cat, span] of LICIT) assert.ok(joined.includes(span), `LICIT [${cat}] span not found (dead mask entry): ${JSON.stringify(span)}`);
  // load-bearing (synthetic): a bare assertion reds; the conditional span and negations stay green.
  assert.ok("MONARK is in scope".match(CRA), "bare 'in scope' assertion must red (mutant 'MONARK is in scope')");
  assert.ok("the product is compliant".match(CRA), "'compliant' must red");
  assert.ok("kept secure at rest".match(CRA), "'secure' must red");
  assert.ok("it bears a CE marking".match(CRA), "'CE marking' must red");
  assert.equal(mask("if MONARK is in scope as a manufacturer").match(CRA), null, "the exact conditional span stays green");
  assert.equal("MONARK is not in scope".match(CRA), null, "negated 'in scope' stays green (negation-aware)");
});

// -- C-4 / L-2 : the notification procedure declares the Article 14 clocks and is English -------------
test("notification_procedure_declares_clocks — Article 14 clocks present and the procedure is English (C-4/L-2)", () => {
  const rel = "docs/PROCEDURE-notification-CRA.md";
  const text = read(rel);
  for (const clock of [/24 h\b/, /72 h\b/, /14 days\b/, /\bone month\b/]) assert.match(text, clock, `Article 14 clock missing (${clock}); mutant '72 h -> 7 days' reds`);
  // (2) REAL language oracle (C-4): lang-gate CLI skips docs/, so scan the file with the gate's own scanner.
  const { maskers } = loadExempt(ROOT);
  const langHits = scanFile(join(ROOT, ...rel.split("/")), maskers);
  assert.deepEqual(langHits, [], `procedure carries French token(s) (mutant 'French word'): ${langHits.map((h) => `${h.line}:${h.col} ${h.word}`).join(", ")}`);
  assert.match(text, /if MONARK is in scope as a manufacturer/, "the procedure must stay conditional (if MONARK is in scope as a manufacturer)");
  assert.match(text, /CSIRT: undetermined for a US manufacturer without an EU representative, see counsel Q1/, "the procedure must carry the CSIRT indeterminacy (audit Q1)");
});

// -- L-1 : the security policy is present and closed (Reporting/Scope/Supported versions/Timelines/Data)
test("security_policy_present_and_closed — SECURITY.md carries the five named sections and the GitHub channel (L-1)", () => {
  const text = read("SECURITY.md");
  for (const section of ["Reporting", "Scope", "Supported versions", "Timelines", "Data"]) assert.match(text, new RegExp(`^##\\s+${section}`, "im"), `SECURITY.md must carry a '## ${section}' section (mutant 'Reporting section removed' reds)`);
  assert.match(text, /github\.com\/KraidleAI\/Monark\/security\/advisories\/new/, "SECURITY.md must name the GitHub Security Advisories reporting link (investor decision 42)");
  assert.match(text, /72 hours/, "SECURITY.md must state the 72-hour acknowledgement window (investor decision 43)");
  assert.match(text, /90 days/, "SECURITY.md must state the 90-day coordinated-disclosure window (investor decision 43)");
});
