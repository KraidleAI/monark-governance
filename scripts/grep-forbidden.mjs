// MONARK vocabulary gate (ADR-M001 D8, ADR-M002 D0/D1) — "discipline enforced in code".
// Scans package SOURCE (packages/*/src/**/*.ts) and the whole atelier package
// (packages/atelier/** — .ts/.js/.html/.css/.md, rendered demo included) for the
// guarantee/marketing claims banned by the 09 discipline (Grok, adopted).
// NOT the structural FORBIDDEN_KEYS (closed-check.ts + forbidden-keys.ts).
// Patterns live in ONE place: vocab-banned.json (root). Zero dependencies.
// Usage: node scripts/grep-forbidden.mjs [extra file or dir ...]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONFIG = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
const BANNED = CONFIG.banned.map(({ re, why }) => ({ re: new RegExp(re, "i"), why }));

function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name !== "node_modules" && name !== "dist") out.push(...walk(p, exts));
    } else if (exts.includes(extname(p))) {
      out.push(p);
    }
  }
  return out;
}

const files = [];
const packagesDir = join(ROOT, "packages");
const srcExts = CONFIG.scan.packages_src.extensions;
const atelier = CONFIG.scan.atelier;
for (const pkg of readdirSync(packagesDir)) {
  const pkgDir = join(packagesDir, pkg);
  if (pkg === atelier.package) {
    try {
      if (statSync(pkgDir).isDirectory()) files.push(...walk(pkgDir, atelier.extensions));
    } catch {
      /* no atelier package yet */
    }
    continue;
  }
  const srcDir = join(pkgDir, "src");
  try {
    if (statSync(srcDir).isDirectory()) files.push(...walk(srcDir, srcExts));
  } catch {
    /* no src/ in this package yet */
  }
}
// Extra targets from the command line (tests use this on temp files).
for (const arg of process.argv.slice(2)) {
  const p = resolve(arg);
  const st = statSync(p);
  if (st.isDirectory()) files.push(...walk(p, [...srcExts, ...atelier.extensions]));
  else files.push(p);
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
console.log(`gate:vocab OK — scanned ${files.length} file(s), no forbidden claim.`);
