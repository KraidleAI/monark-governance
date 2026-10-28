// GENKAN - the public export carries the app (package-style), its kernel sources and its scripts, and never the Lean
// build tree: a kernel's `.lake/` holds the built executable and fetched packages, which are build output, not source.
// The exporter runs through its own entry point (`node scripts/export-public.mjs --out <dir>`) from a small source tree
// under os.tmpdir(): its own script and the modules it imports, the three configs it reads, the real CI workflow it
// derives, and a one-line stand-in for every other required whitelist entry (the export fails closed on an absent one).
// The Genkan files are stand-ins too, written in the temporary tree only, with a seeded `.lake/` under the kernel.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WHITELIST_DIRS, WHITELIST_FILES } from "../../../scripts/export-public.mjs";

const REPO = fileURLToPath(new URL("../../../", import.meta.url));
const EXPORTER = "scripts/export-public.mjs";
// The configs the exporter reads from its root, outside its imports (fail closed when absent).
const CONFIGS = ["scripts/export-exclude-tests.json", "scripts/export-exclude-data.json", "scripts/lang-exempt.json"];
const toPosix = (p: string): string => p.replace(/\\/g, "/");

/** The exporter and every module it imports by a static relative specifier, as repo-relative POSIX paths. */
function importClosure(start: string): string[] {
  const seen = new Set<string>();
  const stack = [start];
  for (let f = stack.pop(); f !== undefined; f = stack.pop()) {
    if (seen.has(f)) continue;
    seen.add(f);
    const text = readFileSync(join(REPO, f), "utf8");
    for (const m of text.matchAll(/\b(?:from|import)\s*["']([^"']+)["']/g)) {
      const spec = m[1] ?? "";
      if (spec.startsWith(".")) stack.push(toPosix(join(dirname(f), spec)));
    }
  }
  return [...seen].sort();
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const name of readdirSync(abs)) {
      const childAbs = join(abs, name);
      const childRel = rel ? `${rel}/${name}` : name;
      if (statSync(childAbs).isDirectory()) walk(childAbs, childRel);
      else out.push(childRel);
    }
  };
  walk(dir, "");
  return out;
}

function put(root: string, rel: string, body: string): void {
  const abs = join(root, ...rel.split("/"));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
}

const GENKAN_SOURCES = [
  "apps/genkan/package.json",
  "apps/genkan/kernel/lean-toolchain",
  "apps/genkan/kernel/lakefile.lean",
  "apps/genkan/kernel/Main.lean",
  "apps/genkan/scripts/lake.mjs",
];
const LAKE_SEEDS = ["apps/genkan/kernel/.lake/build/bin/genkan-kernel", "apps/genkan/kernel/.lake/packages/x/y.lean"];

// killer: scripts/export-public.mjs:296 CONST ", \".lake\"]" -> "]"
test("export_omits_lake_build", () => {
  const src = mkdtempSync(join(tmpdir(), "genkan-export-src-"));
  const out = mkdtempSync(join(tmpdir(), "genkan-export-out-"));
  try {
    // The real exporter, its imports, its configs and the workflow it derives, copied byte for byte.
    const copied = [...importClosure(EXPORTER), ...CONFIGS, ".github/workflows/ci.yml"];
    for (const rel of copied) {
      mkdirSync(dirname(join(src, rel)), { recursive: true });
      copyFileSync(join(REPO, rel), join(src, rel));
    }
    // The Genkan stand-ins (one word each: nothing a content guard of the exporter could flag) and the build tree.
    put(src, "apps/genkan/package.json", '{ "name": "@monark/genkan", "private": true, "type": "module" }\n');
    for (const rel of GENKAN_SOURCES.slice(1)) put(src, rel, "stand-in\n");
    put(src, LAKE_SEEDS[0]!, "\u007fELF stand-in binary\n");
    put(src, LAKE_SEEDS[1]!, "def y : Nat := 0\n");
    // Every other required whitelist entry, as an empty dir or a one-line file.
    for (const d of WHITELIST_DIRS) mkdirSync(join(src, ...d.split("/")), { recursive: true });
    for (const f of WHITELIST_FILES) if (!existsSync(join(src, ...f.split("/")))) put(src, f, "stand-in\n");
    // Non-vacuity: the build tree is in the source the exporter walks.
    for (const rel of LAKE_SEEDS) assert.ok(existsSync(join(src, ...rel.split("/"))), `seeded ${rel} in the source tree`);

    const r = spawnSync(process.execPath, [join(src, ...EXPORTER.split("/")), "--out", out], {
      cwd: src,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 60_000,
    });
    assert.equal(r.status, 0, `the export must succeed (status=${String(r.status)}, error=${r.error?.message ?? "none"}):\n${String(r.stderr)}`);

    const files = listFiles(out);
    assert.ok(files.includes("EXPORT-MANIFEST.json"), "the export writes its manifest");
    for (const rel of GENKAN_SOURCES) assert.ok(files.includes(rel), `the export must include ${rel}`);
    const leaked = files.filter((f) => f.split("/").includes(".lake"));
    assert.deepEqual(leaked, [], "the export must carry no path with a .lake segment");
    const manifest = JSON.parse(readFileSync(join(out, "EXPORT-MANIFEST.json"), "utf8")) as { files: { path: string }[] };
    assert.deepEqual(manifest.files.filter((e) => e.path.split("/").includes(".lake")), [], "the manifest must list no .lake path");
  } finally {
    for (const d of [out, src]) rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  }
});
