/**
 * Root test `site_renders_only_committed_data` (test 44, ADR-M004 D1 honesty rule / D11).
 * It lives at the REPO ROOT (not apps/site) because the `npm test` globs exclude apps/** (PLAN F-1
 * item 6 / correction 10). Two guarantees, both non-LLM oracles:
 *
 *   (a) apps/site/lib/load-committed.ts verifies every file listed in apps/site/data/manifest.sha256.json
 *       against its committed SHA-256 (CRLF->LF normalized). A tampered/drifted data file throws.
 *   (b) HONESTY LINT — no hard-coded numeric literal in a RENDERED-TEXT position under all of
 *       apps/site (Lot F-2a C4; top-level test/ and data/ and *.d.ts excluded): JSX text, JSX child
 *       expression, a visible attribute (alt/title/aria-label/placeholder/label/value/content), an
 *       exported metadata title/description, and MDX prose (incl. a {...} that renders a literal).
 *       className/style/key/SVG attrs, import paths, ISO dates, the identifiers
 *       ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+, and a committed closed exempt list are excluded. Detector +
 *       exact scope: apps/site/test/honesty-lint.ts.
 *
 * Why a literal 1.07 reds even though 1.07 IS a figure value (ADR-M004 D11:127, a hard-coded 1.07 in a
 * page must red): figures render DYNAMICALLY through loadCommitted() and appear in the AST as property
 * accesses, never as literals — that is how "hors figures-sourced.json" is honoured. A literal is a
 * duplicated magic number and is flagged regardless of value; the ONLY escape is the closed exempt list,
 * which this test forbids from carrying a figure value.
 *
 * Named mutant (G2, PLAN F-1 item 6): hard-code `1.07` in apps/site/app/page.tsx => (b) reds. Restored by
 * copy, sha256 before/after (docs G1). Run by `npm test` in each worktree (outside per-lot R-25 counting).
 * The detector lives in apps/site (type-checked rules off) so this file stays free of the 6 ratcheted
 * no-unsafe/no-explicit-any rules (committed ceiling 92 unchanged).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { loadCommitted } from "../apps/site/lib/load-committed.ts";
import { scanAppsSite, scanSource, loadExemptFile, exemptValues } from "../apps/site/test/honesty-lint.ts";

const ROOT = join(import.meta.dirname, "..");

test("site_renders_only_committed_data (a) — manifest verified, 5 sourced figures (test 44)", () => {
  // loadCommitted throws on a missing file, an empty/unsupported manifest, or a sha256 mismatch — so
  // this call IS the tamper check (a stale manifest reds here).
  const figs = loadCommitted(ROOT);
  assert.equal(figs.figures.length, 5, "expected the 5 Qin 2021 figures");
  for (const f of figs.figures) {
    assert.equal(f.level, "lu", `figure ${f.id} must be a primary [lu] reading`);
    assert.ok(f.qualifier.length > 0, `figure ${f.id} must carry its qualifier (D1 item 12)`);
    assert.ok(f.source.length > 0 && f.doi.length > 0, `figure ${f.id} must carry source + DOI`);
  }
});

test("site_renders_only_committed_data (b) — no rendered numeric literal under apps/site (test 44)", () => {
  const ex = loadExemptFile(ROOT); // fail-closed on a missing / malformed list
  assert.ok(Array.isArray(ex.entries), "exempt list must expose entries[]");

  // The exempt list may never launder a figure value: figures come from the loader, not the exempt file.
  const figureValues = new Set(loadCommitted(ROOT).figures.map((f) => String(f.value)));
  for (const e of ex.entries) {
    assert.ok(
      !figureValues.has(e.value),
      `exempt entry '${e.value}' equals a figure value — it must come from loadCommitted(), not be exempted`,
    );
  }

  const { violations, filesScanned } = scanAppsSite(ROOT, exemptValues(ex));
  assert.ok(filesScanned >= 1, "honesty lint scanned no files under apps/site (false green)");
  assert.deepEqual(
    violations,
    [],
    `hard-coded numeric literal(s) in rendered text: ${JSON.stringify(violations)}`,
  );
});

test("site_renders_only_committed_data (b) detector — rendered-position scope and exclusions", () => {
  const none = new Set<string>();
  // Flagged: rendered-text positions.
  assert.deepEqual(scanSource("<p>1.07</p>", "tsx", none), ["1.07"], "JSX text literal");
  assert.deepEqual(scanSource("<p>{1.07}</p>", "tsx", none), ["1.07"], "JSX child numeric expression");
  assert.deepEqual(scanSource('<p>{"1.07"}</p>', "tsx", none), ["1.07"], "JSX child string expression");
  assert.deepEqual(scanSource('<img alt="1.07 B" />', "tsx", none), ["1.07"], "visible attribute alt");
  assert.deepEqual(scanSource("<p>Version 2 ready</p>", "tsx", none), ["2"], "bare number in prose");
  assert.deepEqual(scanSource("We track 5 fleet agents.", "mdx", none), ["5"], "MDX prose");
  // F-1 G2 R2 — a value passed as visible content through ?:, &&/||, string concat or a template is
  // rendered text and must red (PLAN F-1 item 6: a string passed as visible content).
  assert.deepEqual(
    scanSource('<p>{false ? "none" : "999 agents live now"}</p>', "tsx", none),
    ["999"],
    "R2 conditional branch string",
  );
  assert.deepEqual(
    scanSource('<p>{live && "42 decisions attested today"}</p>', "tsx", none),
    ["42"],
    "R2 short-circuit && string",
  );
  assert.deepEqual(scanSource('<p>{"Fleet size " + 7}</p>', "tsx", none), ["7"], "R2 string concat numeric");
  assert.deepEqual(scanSource("<p>{`Total ${63}`}</p>", "tsx", none), ["63"], "R2 template expression part");

  // Not flagged: non-rendered positions and allowed forms.
  assert.deepEqual(scanSource('<div className="grid-cols-3 gap-4 w-8" />', "tsx", none), [], "className");
  assert.deepEqual(scanSource("<div style={{ width: 12 }} />", "tsx", none), [], "style object");
  assert.deepEqual(scanSource("<li key={3}>x</li>", "tsx", none), [], "key attribute");
  assert.deepEqual(scanSource('<svg viewBox="0 0 24 24" />', "tsx", none), [], "SVG viewBox");
  assert.deepEqual(scanSource("<p>See ADR-M004 and R-8.</p>", "tsx", none), [], "identifiers with digits");
  assert.deepEqual(scanSource("<p>State as of 2021-04-30.</p>", "tsx", none), [], "ISO date");
  assert.deepEqual(scanSource("<p>{figure.value}</p>", "tsx", none), [], "dynamic figure = property access");
  assert.deepEqual(scanSource("Run `npm i next@16` now.", "mdx", none), [], "MDX inline code");
  // F-1 G2 R2 — the intended injection path and non-rendered operands stay green.
  assert.deepEqual(scanSource('<div className="grid-cols-3 gap-4 w-24" />', "tsx", none), [], "className R2 false-positive guard");
  assert.deepEqual(scanSource("<li key={4}>x</li>", "tsx", none), [], "key attribute (R2)");
  assert.deepEqual(scanSource("<p>{figures.liquidatable.value}</p>", "tsx", none), [], "dynamic figure chain = property access");
  assert.deepEqual(scanSource('<p>{count > 5 && "live"}</p>', "tsx", none), [], "comparison threshold is not rendered");

  // Exempt token honoured (closed list).
  assert.deepEqual(scanSource("<p>3</p>", "tsx", new Set(["3"])), [], "exempt token");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2a — detector hardening (PLAN F-2 §6 a-d). Each garde carries its named live mutant in
// docs/G1-lot-F2a.md; these are the PERMANENT regressions the mutant proves.

test("detector (a) — whole-apps/site scan covers components/ + hooks/, excludes top-level test/ + data/ (C4)", () => {
  const none = new Set<string>();
  const tmp = mkdtempSync(join(tmpdir(), "honesty-scan-"));
  try {
    const site = join(tmp, "apps", "site");
    for (const d of ["app", "components", "hooks", "test", "data"]) mkdirSync(join(site, d), { recursive: true });
    mkdirSync(join(site, "components", "data"), { recursive: true }); // a NESTED data/ must still scan
    const red = "export const X = () => <p>999</p>;\n";
    writeFileSync(join(site, "app", "page.tsx"), red);
    writeFileSync(join(site, "components", "widget.tsx"), red);
    writeFileSync(join(site, "hooks", "use-thing.tsx"), red);
    writeFileSync(join(site, "components", "data", "nested.tsx"), red);
    writeFileSync(join(site, "test", "helper.tsx"), red); // top-level test/ excluded
    writeFileSync(join(site, "data", "fixture.tsx"), red); // top-level data/ excluded
    writeFileSync(join(site, "COMPONENTS-PROVENANCE.md"), "shadcn 4.21.0 pinned.\n"); // .md not a surface
    const { violations } = scanAppsSite(tmp, none);
    const files = new Set(violations.map((v) => v.file));
    assert.ok(files.has("apps/site/app/page.tsx"), "app/ scanned");
    assert.ok(files.has("apps/site/components/widget.tsx"), "components/*.tsx scanned (C4)");
    assert.ok(files.has("apps/site/hooks/use-thing.tsx"), "hooks/*.tsx scanned (C4)");
    assert.ok(files.has("apps/site/components/data/nested.tsx"), "nested data/ still scanned (any-depth un-scan closed)");
    assert.ok(!files.has("apps/site/test/helper.tsx"), "top-level test/ excluded");
    assert.ok(!files.has("apps/site/data/fixture.tsx"), "top-level data/ excluded");
    assert.ok(!files.has("apps/site/COMPONENTS-PROVENANCE.md"), ".md is not a honesty surface (pageExtensions)");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("detector (b) — exported Next metadata title/description scanned (§6b)", () => {
  const none = new Set<string>();
  assert.deepEqual(
    scanSource('export const metadata = { title: "MONARK", description: "42 decisions today" };', "tsx", none),
    ["42"],
    "metadata.description literal reds",
  );
  assert.deepEqual(
    scanSource('export const metadata = { openGraph: { title: "9 built" } };', "tsx", none),
    ["9"],
    "nested metadata (openGraph) title reds",
  );
  assert.deepEqual(
    scanSource('export const metadata = { description: "Foundation preview." };', "tsx", none),
    [],
    "metadata without digits stays green",
  );
  assert.deepEqual(
    scanSource('const metadata = { description: "5 things" };', "tsx", none),
    [],
    "a non-exported metadata-like object is not the Next export — ignored",
  );
});

test("detector (c) — MDX {...} string / numeric / nested-JSX literal parity with TSX (§6c)", () => {
  const none = new Set<string>();
  assert.deepEqual(scanSource('{"999 agents"}', "mdx", none), ["999"], "MDX string-literal expression reds (parity)");
  assert.deepEqual(scanSource("Total {5} agents", "mdx", none), ["5"], "MDX numeric expression reds");
  assert.deepEqual(scanSource("{<b>5</b>}", "mdx", none), ["5"], "MDX nested JSX element text reds (parity)");
  assert.deepEqual(scanSource("{figures.liquidatable.value}", "mdx", none), [], "MDX dynamic figure read stays green");
  assert.deepEqual(scanSource("{count}", "mdx", none), [], "MDX bare identifier stays green");
  assert.deepEqual(scanSource("Run `npm i next@16` now.", "mdx", none), [], "MDX inline code still stripped");
});

test("detector (d) — value/content visible attributes scanned (§6d)", () => {
  const none = new Set<string>();
  assert.deepEqual(scanSource('<option value="5">Five</option>', "tsx", none), ["5"], "value attribute reds");
  assert.deepEqual(scanSource('<meta content="5 agents" />', "tsx", none), ["5"], "content attribute reds");
  assert.deepEqual(scanSource("<input value={figures.x.value} />", "tsx", none), [], "dynamic value stays green");
  assert.deepEqual(scanSource('<div data-slot="button-7" />', "tsx", none), [], "non-visible attr (data-slot) ignored");
});
