/**
 * Root tests for Lot EXPORT-CLEAN (ADR-M004 D7 septies, 2026-09-21). NON-LLM oracles over
 * scripts/export-public.mjs, run by `npm test` at the repo root (NOT exported — this file lives under
 * the non-whitelisted root test/). Three guards:
 *
 *   (a) export_exclude_data_no_exported_consumer — every path in scripts/export-exclude-data.json is a
 *       genuine orphan: NO exported (collectFiles(ROOT).kept) file references its basename. Excluding a
 *       datum an exported file still reads would break the exported CI or leave a dangling reference.
 *       Mutant: add apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json (read by the EXPORTED
 *       ukemi.test.ts / ukemi-u4a.test.ts) to export-exclude-data.json ⇒ this reds.
 *
 *   (b) export_excluded_tests_leave_no_orphan_fixture — the DUAL: a data fixture whose EVERY test-consumer
 *       (across all package.json test globs, the root test/ included) is in export-exclude-tests.json must
 *       NOT stay exported. u3 is NOT flagged (test/u3-realized.test.ts, a live non-excluded consumer, keeps
 *       it). The U-4a book + oracle ARE sole-consumed by the excluded ukemi-u4-scores.test.ts, so they must
 *       be excluded. Mutant: drop U4-book-23545087.json from export-exclude-data.json ⇒ this reds.
 *
 *   (c) windows_abs_path_matcher — the D7 septies (iii) guard flags reader-local drive paths (F:\…, C:/…)
 *       and spares URLs, prose, POSIX paths and a regex source. Wired into export:check AND export
 *       (windowsPathViolations); end-to-end bite is proven by the manual mutant (seed a path ⇒ export exits 1).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import {
  collectFiles,
  loadExcludedTests,
  EXCLUDE_DATA_FILE,
  PATH_SCAN_TEXT_EXTS,
  windowsAbsPathHits,
  WINDOWS_ABS_PATH_RE,
} from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const toPosix = (p: string): string => p.replace(/\\/g, "/");

/** GUARD (a): true iff `content` MENTIONS `base` as a whole token (any non-filename delimiter, incl. `/`,
 *  quotes, whitespace). Broad on purpose — an exported file must not even name an excluded datum (a dangling
 *  reference in the public mirror is itself the defect). */
function referencesToken(content: string, base: string): boolean {
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9_.-])${esc}(?![A-Za-z0-9_.-])`).test(content);
}

/** GUARD (b): true iff `content` READS `base` as a fixture — the name inside a quoted string / quoted path.
 *  A bare PROSE mention in a comment does NOT count, so a meta-test that merely names a fixture (this file's
 *  own mutant comments) is not miscounted as a consumer. Fixtures are always read via a string-literal path. */
function readsFixture(content: string, base: string): boolean {
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(?<=[\"'`/])" + esc + "(?=[\"'`])").test(content);
}

// -- enumerate every test file the runner runs, DERIVED from package.json `test` globs (root test/ INCLUDED),
//    so guard (b) sees test/u3-realized.test.ts and never mis-flags u3. Supports one `*` per path segment.
function globSegToRe(seg: string): RegExp {
  const body = seg.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*");
  return new RegExp(`^${body}$`);
}
function expandGlob(root: string, glob: string, out: Set<string>): void {
  const segs = glob.split("/");
  const walk = (dirRel: string, idx: number): void => {
    const dirAbs = dirRel ? join(root, dirRel) : root;
    if (!existsSync(dirAbs)) return;
    const seg = segs[idx]!;
    if (idx === segs.length - 1) {
      const re = globSegToRe(seg);
      for (const n of readdirSync(dirAbs)) {
        if (re.test(n) && statSync(join(dirAbs, n)).isFile()) out.add(toPosix(dirRel ? `${dirRel}/${n}` : n));
      }
      return;
    }
    if (seg === "*") {
      for (const n of readdirSync(dirAbs)) if (statSync(join(dirAbs, n)).isDirectory()) walk(dirRel ? `${dirRel}/${n}` : n, idx + 1);
    } else {
      walk(dirRel ? `${dirRel}/${seg}` : seg, idx + 1);
    }
  };
  walk("", 0);
}
function enumerateTestFiles(root: string): string[] {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { scripts: { test: string } };
  const globs = [...pkg.scripts.test.matchAll(/"([^"]+\.test\.ts)"/g)].map((m) => m[1]!);
  const out = new Set<string>();
  for (const g of globs) expandGlob(root, g, out);
  return [...out];
}

// -- data fixtures under the same roots series_pinned uses (the domain of guard (b)).
const SERIES_ROOTS = ["fixtures", "apps/sentinel/test/fixtures", "apps/bell/test/fixtures/series"];
const DATA_EXTS = new Set([".json", ".jsonl", ".csv"]);
function enumerateSeriesData(root: string): string[] {
  const out: string[] = [];
  for (const r of SERIES_ROOTS) {
    const rootAbs = join(root, r);
    if (!existsSync(rootAbs)) continue;
    const stack = [rootAbs];
    for (let cur = stack.pop(); cur !== undefined; cur = stack.pop()) {
      for (const n of readdirSync(cur)) {
        const a = join(cur, n);
        if (statSync(a).isDirectory()) stack.push(a);
        else if (DATA_EXTS.has(extname(n).toLowerCase())) out.push(toPosix(a.slice(root.length + 1)));
      }
    }
  }
  return out;
}

test("export_exclude_data_no_exported_consumer — guard (a): no excluded datum keeps an EXPORTED consumer (D7 septies)", () => {
  const { kept, excludedData } = collectFiles(ROOT);
  assert.ok(excludedData.length >= 1, `${EXCLUDE_DATA_FILE} must exclude >= 1 file (the U-4a orphans); saw ${excludedData.length}`);
  const keptText = kept.filter((f: { rel: string }) => PATH_SCAN_TEXT_EXTS.has(extname(f.rel).toLowerCase()));
  for (const rel of excludedData) {
    const base = basename(rel);
    for (const f of keptText as Array<{ rel: string; abs: string }>) {
      assert.ok(
        !referencesToken(readFileSync(f.abs, "utf8"), base),
        `excluded datum ${rel} still has an EXPORTED consumer: ${f.rel} references ${base} — excluding it would break the exported CI or leave a dangling reference (guard a)`,
      );
    }
  }
});

test("export_excluded_tests_leave_no_orphan_fixture — guard (b): an excluded test never leaves a sole-consumed fixture exported (D7 septies)", () => {
  const { kept, excludedData } = collectFiles(ROOT);
  const excludedTests = new Set(loadExcludedTests(ROOT));
  assert.ok(excludedTests.size >= 1, "export-exclude-tests.json must list >= 1 test (else guard b is vacuous)");
  const keptSet = new Set((kept as Array<{ rel: string }>).map((f) => f.rel));
  const excludedDataSet = new Set(excludedData);
  const testFiles = enumerateTestFiles(ROOT);
  assert.ok(
    testFiles.includes("test/u3-realized.test.ts"),
    "root test/ must be enumerated from the package.json test globs (else u3 would be wrongly flagged) — glob drift",
  );
  const testText = new Map(testFiles.map((rel) => [rel, readFileSync(join(ROOT, rel), "utf8")]));
  let orphanByExclusion = 0;
  for (const rel of enumerateSeriesData(ROOT)) {
    const base = basename(rel);
    const consumers = testFiles.filter((t) => readsFixture(testText.get(t)!, base));
    if (consumers.length === 0) continue; // no test consumer — not orphaned BY a test exclusion (guard a covers no-consumer data)
    if (!consumers.every((t) => excludedTests.has(t))) continue; // a live test consumer keeps it exported (this is why u3 stays)
    orphanByExclusion++;
    assert.ok(
      !keptSet.has(rel) && excludedDataSet.has(rel),
      `excluded test(s) {${consumers.join(", ")}} leave orphan fixture EXPORTED: ${rel} — add it to ${EXCLUDE_DATA_FILE} (guard b)`,
    );
  }
  // Non-vacuity: the U-4a book + oracle path ARE sole-consumed by the excluded ukemi-u4-scores.test.ts, so the
  // loop MUST have reached the "every consumer excluded" branch for them (passing only because they are excluded).
  assert.ok(orphanByExclusion >= 2, `guard (b) reached ${orphanByExclusion} orphan-by-exclusion fixtures; expected >= 2 (the u4 book + oracle) — walk went vacuous`);
});

test("windows_abs_path_matcher — flags reader-local drive paths, spares URLs / prose / POSIX / regex source (D7 septies (iii))", () => {
  const hit = (s: string): boolean => windowsAbsPathHits(s).length > 0;
  // POSITIVES assembled at runtime so THIS file carries no literal drive path (calque ukemi.test.ts motif assembly).
  const BS = String.fromCharCode(92); // '\'
  const drive = (letter: string, sep: string, tail: string): string => `${letter}:${sep}${tail}`;
  const positives = [
    drive("F", BS, ["PRODUITS", "etude-2026-09-20", "u3-raws-clean", "u3-reads.jsonl"].join(BS)), // F:\PRODUITS\...\u3-reads.jsonl
    drive("C", BS, ["work", "book.json"].join(BS)), // C:\work\book.json
    drive("F", "/", "tmp/u1a-hard/book.json"), // F:/tmp/u1a-hard/book.json (forward slash)
    drive("d", "/", "data/x"), // lowercase drive
    "prefix prose then " + drive("F", BS, "Monark"), // mid-line, preceded by a space
  ];
  for (const p of positives) assert.ok(hit(p), `must flag a reader-local Windows absolute path: ${JSON.stringify(p)}`);

  const negatives = [
    "http://example.com/a/b", // URL scheme — the drive-letter run is preceded by a letter
    "https://monarkgate.tech/narabi/timeline.jsonl",
    "file:///etc/passwd",
    "data:image/png;base64,iVBORw0KGgo",
    "the drive C: holds the OS", // bare drive letter + colon, NO separator (prose)
    "aspect ratio 16:9 and a:b", // colon not followed by a separator
    "/tmp/u1a-hard/book.json", // POSIX absolute path
    "./relative and ../up", // relative
    "at 12:30:00 UTC", // time
    WINDOWS_ABS_PATH_RE.source, // the matcher's OWN regex source (':' there follows ']', not a letter)
  ];
  for (const n of negatives) assert.equal(windowsAbsPathHits(n).length, 0, `must NOT flag: ${JSON.stringify(n)}`);

  // The guard's own definition file (scripts/export-public.mjs) is EXPORTED and now carries the regex + comments:
  // assert it is itself clean, so the guard never self-reds (a would-be literal drive path in a comment reds here).
  assert.equal(windowsAbsPathHits(readFileSync(join(ROOT, "scripts", "export-public.mjs"), "utf8")).length, 0, "export-public.mjs must carry no literal drive path (self-clean)");
});
