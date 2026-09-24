// docs/cartographie-p1/import-graph.mjs — MEASURED import graph for the P1 cartography (ADR-M018 D4).
// Read-only, disposable. Deterministic: sorted output + sha256, NO timestamp (re-runs are byte-identical).
// Usage: `node docs/cartographie-p1/import-graph.mjs` from repo root. Writes import-graph.out.json + prints sha256.
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve, dirname, sep, posix } from "node:path";
import { createHash } from "node:crypto";

const ROOT = resolve(process.cwd());
const SCAN_ROOTS = ["packages", "apps", "scripts", "test"];
const EXCLUDE = new Set(["node_modules", "dist", ".next", "out", "coverage", ".git"]);
const EXT = [".ts", ".tsx", ".mts", ".mjs", ".cts", ".cjs", ".js", ".jsx"];

function walk(dir, acc) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (EXCLUDE.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (EXT.some((x) => e.name.endsWith(x)) && !e.name.endsWith(".d.ts") && !e.name.endsWith(".d.mts")) acc.push(p);
  }
  return acc;
}

// Bucket = the "node" a file belongs to.
function bucketOf(absPath) {
  const rel = relative(ROOT, absPath).split(sep).join("/");
  if (rel.startsWith("packages/")) return "pkg:" + rel.split("/")[1];
  if (rel.startsWith("apps/")) return "app:" + rel.split("/")[1];
  if (rel.startsWith("scripts/")) return "scripts";
  if (rel.startsWith("test/")) return "test:root";
  return "other";
}

// Extract import/require/dynamic-import specifiers.
const SPEC_RE = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,          // side-effect import
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,   // dynamic import
];
function specsOf(text) {
  const out = [];
  for (const re of SPEC_RE) { let m; re.lastIndex = 0; while ((m = re.exec(text)) !== null) out.push(m[1]); }
  return out;
}

function resolveRelative(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  const cands = [base, ...EXT.map((x) => base + x), ...EXT.map((x) => join(base, "index" + x))];
  for (const c of cands) { try { if (statSync(c).isFile()) return c; } catch { /* noop */ } }
  return base; // best-effort (may not exist); still bucket by path
}

// @monark/<name>[/sub] → target node (subpath preserved for note).
// harness/sentinel/site live under apps/ ⇒ app: node (bug fix: NOT pkg:harness which does not exist).
const APP_MEMBERS = new Set(["harness", "sentinel", "site"]);
function monarkTarget(spec) {
  const m = /^@monark\/([^/]+)(\/.*)?$/.exec(spec);
  if (!m) return null;
  const name = m[1];
  const node = (APP_MEMBERS.has(name) ? "app:" : "pkg:") + name;
  return { node, sub: m[2] || "" };
}

// A site is a TEST consumer (D1: a test-only consumer keeps a piece "upcoming") when its path is a test file.
function siteKind(rel) {
  return rel.includes("/test/") || rel.startsWith("test/") || rel.endsWith(".test.ts") || rel.endsWith(".test.tsx") ? "test" : "src";
}

const files = SCAN_ROOTS.flatMap((r) => walk(join(ROOT, r), []));
const edges = new Map();       // "src => dst" -> { count, sites:Set, subs:Set }
const externals = new Map();   // external specifier -> count (informational)
function addEdge(src, dst, siteRel, sub) {
  if (src === dst) return;     // intra-node import: skip (we want cross-boundary)
  const k = src + " => " + dst;
  const cur = edges.get(k) || { count: 0, srcCount: 0, testCount: 0, sites: new Set(), subs: new Set() };
  cur.count++;
  if (siteKind(siteRel) === "test") cur.testCount++; else cur.srcCount++;
  cur.sites.add(siteRel); if (sub) cur.subs.add(sub);
  edges.set(k, cur);
}

for (const f of files) {
  const src = bucketOf(f);
  const rel = relative(ROOT, f).split(sep).join("/");
  const text = readFileSync(f, "utf8");
  for (const spec of specsOf(text)) {
    if (spec.startsWith("@monark/")) {
      const t = monarkTarget(spec);
      if (t) addEdge(src, t.node, rel, t.sub);
      continue;
    }
    if (spec.startsWith(".")) {
      const abs = resolveRelative(f, spec);
      const dst = bucketOf(abs);
      if (dst !== "other" && dst !== src) addEdge(src, dst, rel, "");
      continue;
    }
    // bare / node: / external
    externals.set(spec, (externals.get(spec) || 0) + 1);
  }
}

// Nodes and in-degree (who consumes each package/app node). Split src-consumers vs test-only.
const allNodes = new Set(files.map(bucketOf));
const consumers = new Map();      // node -> Set of nodes importing it (any site)
const srcConsumers = new Map();   // node -> Set of nodes importing it from a */src/ site
for (const [k, v] of edges.entries()) {
  const [s, d] = k.split(" => ");
  if (!consumers.has(d)) consumers.set(d, new Set());
  consumers.get(d).add(s);
  if (v.srcCount > 0) {
    if (!srcConsumers.has(d)) srcConsumers.set(d, new Set());
    srcConsumers.get(d).add(s);
  }
}
const orphanNodes = [...allNodes].filter((n) => (consumers.get(n) || new Set()).size === 0).sort();
// Nodes consumed ONLY by test sites (D1: a test-only consumer keeps the piece "upcoming").
const testOnlyConsumedNodes = [...allNodes]
  .filter((n) => (consumers.get(n) || new Set()).size > 0 && (srcConsumers.get(n) || new Set()).size === 0)
  .sort();

// Targeted symbol census (dead-export probes named by the mission).
const SYMBOLS = ["MONARK_PHASE", "crossAgentGate", "calibrate", "runCalibrate", "fromAttestedFlow", "conformInterval", "trackerInit", "trackerStep", "clipScore"];
const symbolCounts = {};
for (const s of SYMBOLS) {
  let n = 0;
  for (const f of files) { const t = readFileSync(f, "utf8"); n += (t.match(new RegExp("\\b" + s + "\\b", "g")) || []).length; }
  symbolCounts[s] = n;
}

// Deterministic serialization.
const edgeRows = [...edges.entries()]
  .map(([k, v]) => ({ edge: k, count: v.count, srcCount: v.srcCount, testCount: v.testCount, sites: [...v.sites].sort(), subs: [...v.subs].sort() }))
  .sort((a, b) => a.edge.localeCompare(b.edge));
const monarkOnly = edgeRows.filter((e) => e.edge.includes("=> pkg:")).map((e) => ({ edge: e.edge, count: e.count }));
const externalRows = [...externals.entries()].map(([spec, count]) => ({ spec, count }))
  .sort((a, b) => a.spec.localeCompare(b.spec));

const report = {
  scanRoots: SCAN_ROOTS,
  fileCount: files.length,
  nodes: [...allNodes].sort(),
  orphanNodes,
  testOnlyConsumedNodes,
  edgeCount: edgeRows.length,
  edges: edgeRows,
  interPackageEdges: monarkOnly,
  consumersByNode: Object.fromEntries([...allNodes].sort().map((n) => [n, [...(consumers.get(n) || new Set())].sort()])),
  srcConsumersByNode: Object.fromEntries([...allNodes].sort().map((n) => [n, [...(srcConsumers.get(n) || new Set())].sort()])),
  symbolCensus: symbolCounts,
  externalSpecifiers: externalRows,
};

const json = JSON.stringify(report, null, 2);
const sha = createHash("sha256").update(json, "utf8").digest("hex");
const outPath = join(ROOT, "docs", "cartographie-p1", "import-graph.out.json");
writeFileSync(outPath, json + "\n");
console.log("files_scanned=" + files.length);
console.log("edge_count=" + edgeRows.length);
console.log("orphan_nodes=" + JSON.stringify(orphanNodes));
console.log("test_only_consumed_nodes=" + JSON.stringify(testOnlyConsumedNodes));
console.log("cross_boundary_edges (src+test):");
for (const e of edgeRows) console.log("  " + e.edge + "  x" + e.count + " (src=" + e.srcCount + ", test=" + e.testCount + ")" + (e.subs.length ? " sub=" + JSON.stringify(e.subs) : ""));
console.log("symbol_census=" + JSON.stringify(symbolCounts));
console.log("out=" + relative(ROOT, outPath).split(sep).join("/"));
console.log("sha256=" + sha);
