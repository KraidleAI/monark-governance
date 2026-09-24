/**
 * Root dependency-hygiene oracle (the ADR-M018 D4 lot, E5; ADR-M018 D1 — declared, not merely hoisted).
 *
 * Invariant (R1 option (a)): for EVERY workspace package/app, the set of `@monark/*` packages IMPORTED
 * under its `src/` is a subset of the `dependencies` DECLARED in its own `package.json`. npm workspace
 * HOISTING resolves an undeclared sibling anyway (it sits in the root `node_modules`), so `typecheck` and
 * `node --test` stay green over an undeclared edge — this non-LLM oracle is the only guard that reddens it.
 *
 * No eslint plugin (R-8: `eslint-plugin-import`/`knip` are ABSENT from node_modules — a procurement, not
 * used here). The specifier scan mirrors `docs/cartographie-p1/import-graph.mjs` (same four extractors) and
 * runs on Node built-ins only. TYPE-ONLY imports are counted too: `import type { X } from "@monark/y"` must
 * still resolve at compile time (it is in the `tsc` graph), so `@monark/y` must be declared. Subpath imports
 * (`@monark/harness/calibration`) are stripped to the package (`@monark/harness`). A package never needs to
 * declare itself. Apps without a `src/` dir contribute the empty set.
 *
 * Named mutant m1 (G2): re-add an `@monark/ukemi` import to `packages/monark/src/index.ts` WITHOUT declaring
 * it (b3 dropped that edge) — `npm run typecheck` stays GREEN (hoisting), this test reds. Restored byte-exact
 * (sha256 before/after) — see docs/G1-lot-e-bon-marche.md.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXT = [".ts", ".tsx", ".mts", ".mjs", ".cts", ".cjs", ".js", ".jsx"];
const EXCLUDE = new Set(["node_modules", "dist", ".next", "out", "coverage", ".git"]);

// import / side-effect import / require / dynamic import (mirror import-graph.mjs SPEC_RE). `from "…"`
// also catches `import type … from` and `export … from` — both need the package resolvable, so both count.
const SPEC_RE = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
];

function walkSrc(dir: string, acc: string[]): string[] {
  if (!existsSync(dir)) return acc; // no src/ dir ⇒ empty set
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkSrc(p, acc);
    else if (EXT.some((x) => e.name.endsWith(x)) && !e.name.endsWith(".d.ts") && !e.name.endsWith(".d.mts")) acc.push(p);
  }
  return acc;
}

// `@monark/<name>[/sub]` ⇒ `@monark/<name>` (a subpath import still needs the package declared).
function monarkPkg(spec: string): string | null {
  const m = /^(@monark\/[^/]+)(?:\/.*)?$/.exec(spec);
  return m?.[1] ?? null;
}

function workspaceDirs(): string[] {
  const out: string[] = [];
  for (const group of ["packages", "apps"]) {
    const base = join(ROOT, group);
    if (!existsSync(base)) continue;
    for (const e of readdirSync(base, { withFileTypes: true })) {
      if (e.isDirectory() && existsSync(join(base, e.name, "package.json"))) out.push(join(base, e.name));
    }
  }
  return out;
}

test("deps_hygiene_monark_imports_are_declared — every @monark/* imported under src/ is a declared dependency (ADR-M018 D1; E5)", () => {
  const dirs = workspaceDirs();
  assert.ok(dirs.length >= 5, "the monorepo workspaces (packages/* + apps/*) are discovered");

  const violations: string[] = [];
  let checkedImports = 0;
  for (const dir of dirs) {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      name?: string;
      dependencies?: Record<string, string>;
    };
    const declared = new Set(Object.keys(pkg.dependencies ?? {}));
    const imported = new Set<string>();
    for (const file of walkSrc(join(dir, "src"), [])) {
      const text = readFileSync(file, "utf8");
      for (const re of SPEC_RE) {
        re.lastIndex = 0;
        let mm: RegExpExecArray | null;
        while ((mm = re.exec(text)) !== null) {
          const spec = mm[1];
          if (spec === undefined) continue;
          const p = monarkPkg(spec);
          if (p !== null && p !== pkg.name) imported.add(p);
        }
      }
    }
    for (const p of imported) {
      checkedImports += 1;
      if (!declared.has(p)) {
        violations.push(`${pkg.name ?? dir}: imports ${p} under src/ but does not declare it in package.json dependencies`);
      }
    }
  }

  assert.ok(checkedImports > 0, "the scan is non-vacuous (≥ 1 @monark/* src import checked)");
  assert.deepEqual(violations, [], `undeclared @monark/* workspace dependencies (hoisting-masked):\n${violations.join("\n")}`);
});
