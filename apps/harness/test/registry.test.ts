/**
 * Harness Lot H1 — registry safety (K-8) and vocab honesty (ADR-M005 D9/D11).
 * No `any` (off the ratchet). The static scan targets DOUBLE/SINGLE-quoted module specifiers, so the
 * prose in the tool sources (which names these modules in backticks) is not a false positive.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";
import { ALLOWED_TOOL_NAMES, REGISTERED_TOOL_NAMES, HARNESS_TOOLS } from "../src/tools/registry.ts";

interface VocabRule { re: string; why: string; }
interface VocabConfig { banned: VocabRule[]; scan: { harness: { banned: VocabRule[] } }; }

const TOOLS_DIR = fileURLToPath(new URL("../src/tools/", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../../../vocab-banned.json", import.meta.url));

function collectTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...collectTs(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

/** Forbidden side-effect surfaces in a tool implementation (K-8). */
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /["']node:fs["']/, why: "node fs import" },
  { re: /["']node:net["']/, why: "node net import" },
  { re: /["']node:child_process["']/, why: "node child_process import" },
  { re: /\bfetch\s*\(/, why: "fetch call" },
  { re: /\bprocess\.env(?:\.[A-Za-z_]\w*|\[[^\]]+\])\s*=(?!=)/, why: "process.env write" },
];

// Test — the registry is (a) within the closed allowlist and (b) EXACTLY this lot's set (`["gate"]` in
// H1; fills to {attest,gate,cascade} by H3), and no tool implementation has a side effect. Mutants: a
// tool outside the allowlist, a stray/premature registration, or `import "node:fs"` in a tools file ⇒ red.
test("mcp_tools_have_no_side_effects", () => {
  // (1) closed allowlist (K-8): registered ⊆ {attest, gate, cascade}, and `gate` is present in H1.
  assert.ok(REGISTERED_TOOL_NAMES.length >= 1, "at least one tool registered");
  for (const name of REGISTERED_TOOL_NAMES) {
    assert.ok((ALLOWED_TOOL_NAMES as readonly string[]).includes(name), `tool '${name}' outside the closed allowlist`);
  }
  assert.ok(REGISTERED_TOOL_NAMES.includes("gate"), "the `gate` tool stays registered");
  assert.ok(REGISTERED_TOOL_NAMES.includes("cascade"), "the `cascade` tool is registered in H2");
  // (1b) EXACT per-lot registry (G2 R1): H2 registers EXACTLY `cascade` + `gate`. This tightens per lot
  // as each tool ships (H1 `gate`, H2 `cascade`, H3 `attest`); a premature or stray registration reddens
  // here, where the subset allowlist above would tolerate it. The terminal set {attest,gate,cascade}
  // (ADR-M005 D9) is reached lot by lot — this asserts the current lot's exact set, not the end state.
  assert.deepEqual([...REGISTERED_TOOL_NAMES].sort(), ["cascade", "gate"], "H2 registers exactly cascade + gate");

  // (2) static side-effect scan of src/tools/**.
  const files = collectTs(TOOLS_DIR);
  assert.ok(files.length >= 2, `expected the tool sources, saw ${String(files.length)}`);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const { re, why } of FORBIDDEN) {
      assert.ok(!re.test(text), `side effect in ${file}: ${why}`);
    }
  }
});

// Test — tool descriptions carry no banned vocabulary (GLOBAL + scan.harness). Mutant: put
// `confidence` in a description ⇒ red (the in-process scan and the grep-forbidden CLI both catch it).
test("harness_tool_descriptions_pass_vocab", () => {
  const config = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(config.banned), ...compilePatterns(config.scan.harness.banned)];
  // The harness scope must actually ban `confidence`, else this test would be vacuous.
  assert.ok(config.scan.harness.banned.some((r) => /confidence/.test(r.re)), "scan.harness must ban `confidence`");
  for (const tool of HARNESS_TOOLS) {
    const hits = scanText(tool.description, patterns);
    assert.equal(hits.length, 0, `tool '${tool.name}' description has banned vocab: ${JSON.stringify(hits)}`);
  }
});
