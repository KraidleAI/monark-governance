// MONARK vocabulary gate (ADR-M001 D8, ADR-M002 D0/D1, ADR-M003 D12) — "discipline enforced in code".
// Scans package SOURCE (packages/*/src/**/*.ts) and the whole atelier package
// (packages/atelier/** — .ts/.js/.html/.css/.md, rendered demo included) for the
// guarantee/marketing claims banned by the 09 discipline (Grok, adopted).
// NOT the structural FORBIDDEN_KEYS (closed-check.ts + forbidden-keys.ts).
// Patterns live in ONE place: vocab-banned.json (root). Zero dependencies.
//
// GLOBAL patterns (vocab-banned.json "banned") apply to EVERY scanned file.
// SCOPED patterns (vocab-banned.json "scan.<name>.banned") apply ONLY to that
// scope's files. Lot V (ADR-M003 D12) adds the "monark" scope: it walks the WHOLE
// packages/monark package (not just src/) and adds the naked-"Hermes" ban there —
// SCOPED, not global, because packages/contracts/src is FROZEN (contracts_frozen)
// and carries a non-editable "Hermes middleware"; a global ban would redden a
// file no one may touch. See docs/G1-lot-V.md.
// Usage: node scripts/grep-forbidden.mjs [extra file or dir ...]   (CLI targets = GLOBAL patterns only)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONFIG = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
const compile = ({ re, why }) => ({ re: new RegExp(re, "i"), why });
const GLOBAL = CONFIG.banned.map(compile);

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

// Each target carries the pattern set that applies to it.
const targets = [];
const add = (files, patterns) => {
  for (const f of files) targets.push({ f, patterns });
};

const packagesDir = join(ROOT, "packages");
const srcExts = CONFIG.scan.packages_src.extensions;
const atelier = CONFIG.scan.atelier;
const monark = CONFIG.scan.monark; // may be undefined in older trees
const MONARK_EXTRA = (monark?.banned ?? []).map(compile);

for (const pkg of readdirSync(packagesDir)) {
  const pkgDir = join(packagesDir, pkg);
  if (atelier && pkg === atelier.package) {
    try {
      if (statSync(pkgDir).isDirectory()) add(walk(pkgDir, atelier.extensions), GLOBAL);
    } catch {
      /* no atelier package yet */
    }
    continue;
  }
  if (monark && pkg === monark.package) {
    try {
      // WHOLE package (package.json, src, future adapters) — GLOBAL + the monark-scoped ban.
      if (statSync(pkgDir).isDirectory()) add(walk(pkgDir, monark.extensions), [...GLOBAL, ...MONARK_EXTRA]);
    } catch {
      /* no monark package yet */
    }
    continue;
  }
  const srcDir = join(pkgDir, "src");
  try {
    if (statSync(srcDir).isDirectory()) add(walk(srcDir, srcExts), GLOBAL);
  } catch {
    /* no src/ in this package yet */
  }
}

// Extra targets from the command line (tests use this on temp files) — GLOBAL patterns only.
for (const arg of process.argv.slice(2)) {
  const p = resolve(arg);
  const st = statSync(p);
  if (st.isDirectory()) add(walk(p, [...srcExts, ...atelier.extensions]), GLOBAL);
  else add([p], GLOBAL);
}

let hits = 0;
for (const { f, patterns } of targets) {
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const { re, why } of patterns) {
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
console.log(`gate:vocab OK — scanned ${targets.length} file(s), no forbidden claim.`);
