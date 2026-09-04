// MONARK vocabulary gate (ADR-M001 D8) — "discipline enforced in code".
// Scans package SOURCE (packages/*/src/**/*.ts) for the guarantee/marketing
// claims banned by the 09 discipline (Grok) — NOT the structural FORBIDDEN_KEYS,
// which are enforced by closed-check.ts + forbidden-keys.ts. Zero dependencies.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const BANNED = [
  { re: /\b95\s*%\s*(correct|accur|winning|gagnan)/i, why: '"95% correct/accurate/winning" claim' },
  { re: /\b100\s*%\s*(correct|accur)/i, why: '"100% correct/accurate" claim' },
  { re: /anti[-\s]?hallucination/i, why: '"anti-hallucination" claim' },
  { re: /hallucination[-\s]?(free|proof)/i, why: '"hallucination-free/proof" claim' },
  { re: /\beverlasting\b/i, why: '"everlasting" claim' },
  { re: /guaranteed\s+(correct|accura|coverage|no\s+hallucination)/i, why: '"guaranteed correct/coverage" claim' },
  { re: /garantie[^\n]{0,24}hallucination/i, why: 'French "garantie ... hallucination" claim' },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name !== "node_modules") out.push(...walk(p));
    } else if (extname(p) === ".ts") {
      out.push(p);
    }
  }
  return out;
}

const files = [];
const packagesDir = join(ROOT, "packages");
for (const pkg of readdirSync(packagesDir)) {
  const srcDir = join(packagesDir, pkg, "src");
  try {
    if (statSync(srcDir).isDirectory()) files.push(...walk(srcDir));
  } catch {
    /* no src/ in this package yet */
  }
}

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const { re, why } of BANNED) {
      if (re.test(line)) {
        hits++;
        console.error(`FORBIDDEN VOCAB: ${f}:${i + 1}  ${why}`);
        console.error(`  > ${line.trim()}`);
      }
    }
  });
}

if (hits > 0) {
  console.error(`\ngate:vocab FAILED — ${hits} forbidden claim(s) (ADR-M001 D8, 09 discipline).`);
  process.exit(1);
}
console.log(`gate:vocab OK — scanned ${files.length} source file(s), no forbidden claim.`);
