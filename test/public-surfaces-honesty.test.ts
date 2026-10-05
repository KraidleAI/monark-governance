/**
 * Root oracle `public_surfaces_make_no_probative_claim` (ADR-EC D1 / C-1, negation-aware).
 *
 * MONARK's public surfaces attest ORIGIN and BYTES, never the truth of a fact (ADR-M017/M012 D4). This
 * non-LLM oracle scans the public surfaces and asserts no residual probative surclaim (`verified` /
 * `proven` / `certified` used to claim a testimony or fact is TRUE) survives.
 *
 * SCOPE (whole-file raw-line scan): README.md + apps/site sources (.ts/.tsx/.md/.mdx) + skills/monark/*.md
 * + every README the public export ships (apps/harness, packages/*, apps/sentinel-when-present), DERIVED
 * from collectFiles (scripts/export-public.mjs) so the surface set stays wired to the export (V-4).
 * EXCLUDED, by design: the repo-root test/, docs/, packages-level README.md, apps/site/test/ and
 * apps/site/data/, and the generated .next/.turbo/node_modules/dist build output. The scan is WHOLE-FILE,
 * not rendered-position-only, because narabi's rendered copy lives in const strings in .ts that an AST
 * rendered-scan would miss — a surclaim in a const string must red too.
 *
 * NEGATION-AWARE: a token immediately preceded by not/no/never is an honest disclaimer and stays green
 * (ADR-W1 D3 deliberately did NOT ban \bverified\b, because "what is not verified" is honest; same idiom
 * as vocab-banned.json bell scope `(?<!not )(?<!no )\bverified\b`).
 *
 * CLOSED MASK: beyond negations, the surfaces carry honest NON-probative uses of the three tokens
 * (technical comments, build provenance, the token slashing mechanism "a commit proven FAULTY", and the
 * skill line "the recorded loop is verified end-to-end by a test"). These are a CLOSED, enumerated list of
 * multi-word spans (a bare token is forbidden, so none can hide "a verified testimony"), each with a
 * category and a non-vacuity assertion (a dead entry reds). error_origin note: ADR-EC C-1 named only 3
 * negations; it under-measured the proven/certified + code-comment census. The mask below is built from
 * measurement (census recorded in docs/G1-lot-e-honnetete.md).
 *
 * Named mutant (procedural, docs/G1-lot-e-honnetete.md): restore README:111 to "A **verified** testimony"
 * => this oracle reds; restored bit-exact, sha256 before/after recorded. The synthetic mutants below are
 * the PERMANENT in-test regression of the same property (incl. the MAST synonym-swap proven/certified).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { collectFiles, WHITELIST_FILES } from "../scripts/export-public.mjs";
import { DOJO_HOST, DOJO_PUBKEY_PATH, DOJO_TIMELINE_PATH, dojoHistoryPathOf, dojoLinesPathOf } from "../apps/site/lib/dojo-served-load.ts";
import { DOJO_LIVE_PREFIX } from "../apps/site/lib/dojo-served.ts";
import { DOJO_NAME, DOJO_ROUTE, DOJO_TEXT } from "../apps/site/lib/dojo-copy.ts";
import { urlAllowed } from "../apps/dojo/scripts/dojo-verify-cli.mjs";

const ROOT = join(import.meta.dirname, "..");

// The three probative tokens, negation-aware (/i: copy is mixed-case; /g: match() returns all, stateless).
const PROBATIVE = /(?<!\bnot )(?<!\bno )(?<!\bnever )\b(?:verified|proven|certified)\b/gi;

// CLOSED list of licit NON-probative spans: [category, exact multi-word span]. Blanked before scanning.
const LICIT: ReadonlyArray<readonly [string, string]> = [
  ["code-comment", "verified against the real schemas"], // apps/site/app/integrators/page.tsx
  ["code-comment", "then return the verified"], // apps/site/lib/load-committed.ts
  ["code-comment", "proven present by the"], // apps/site/lib/fleet-presentation.ts
  ["code-comment", "proven identical by the root test"], // apps/site/lib/fleet.ts
  ["code-comment", "composition proven here"], // apps/site/lib/fleet.ts
  ["code-comment", "proven by test/narabi-live.test.ts"], // apps/site/lib/narabi-live.ts
  ["code-comment", "proven by test 3"], // apps/site/lib/narabi-live.ts
  ["code-comment", "proven by the register test"], // apps/site/lib/visage.ts
  ["provenance", "npm registry, verified"], // apps/site/COMPONENTS-PROVENANCE.md
  ["provenance", 'environment" is proven'], // apps/site/COMPONENTS-PROVENANCE.md
  ["provenance", "`latest` verified"], // apps/site/COMPONENTS-PROVENANCE.md
  ["mechanism", "commit proven faulty"], // apps/site/app/token/page.tsx (slashing)
  ["mechanism", "a proven fault pays"], // apps/site/app/token/page.tsx (slashing)
  ["mechanism", "proven by recomputing the frozen decision"], // apps/site/app/token/page.tsx (watcher)
  ["skill-test", "verified end-to-end by"], // skills/monark/DEMO.md (ADR-M017 D3, adjudicated)
  ["provenance", "mutant verified"], // packages/atelier/README.md:22 — grep-forbidden test 26 mutant provenance (V-4)
  // Lot SITE-LEGAL-1: a PROHIBITION of the validated Bell Terms of Use (section "Prohibited uses", lawyer's GO as
  // drafted, decision 147) — the reader must not present a record as if the signature certified the fact; the span
  // denies the probative reading, it does not make it (validated text, quoted in a negation; accepted by orchestrator
  // ruling of 2026-09-23).
  ["legal-text", "as if the signature certified the underlying fact"], // apps/site/app/bell/terms/page.tsx
];

// SKIP applies at ANY depth (a dir named test/ or data/ anywhere is skipped) — same walk as
// grep-forbidden's SITE_SKIP. Measured 2026-09-19: only apps/site/{test,data} exist (no nested ones).
const SKIP = new Set([".next", ".turbo", "node_modules", "dist", "test", "data"]);
const EXTS = new Set([".ts", ".tsx", ".md", ".mdx"]);

function walk(dir: string, exts: Set<string>, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      if (!SKIP.has(name)) walk(abs, exts, out);
    } else if (exts.has(extname(name).toLowerCase()) && !name.endsWith(".d.ts")) {
      out.push(abs); // .d.ts are generated (next-env.d.ts) — skipped for build-state independence, as grep-forbidden does
    }
  }
}

function surfaces(): string[] {
  // C-2 (Lot CRA-B): SECURITY.md is a whitelisted public surface (scripts/export-public.mjs), so the
  // probative scrub covers it too — added EXPLICITLY here (it is not a README, so the collectFiles loop below
  // would not pick it up).
  const files: string[] = [join(ROOT, "README.md"), join(ROOT, "SECURITY.md")];
  walk(join(ROOT, "apps", "site"), EXTS, files);
  const skillsDir = join(ROOT, "skills", "monark");
  for (const name of readdirSync(skillsDir)) if (extname(name) === ".md") files.push(join(skillsDir, name));
  // V-4 (checkpoint-2 O-7/O-10): also scan every README the PUBLIC EXPORT ships. The list is DERIVED from
  // the real export enumerator (collectFiles) — never hard-coded — so the surface set stays wired to
  // scripts/export-public.mjs: apps/harness/README.md, packages/*/README.md, and apps/sentinel/README.md
  // the moment it exists (collectFiles silent-skips an absent subpath exactly as the export does; a French
  // README is in `frenchMd`, not `kept`, so it is not shipped and not scanned here). Root README.md (also
  // returned by collectFiles) is de-duplicated by the Set below.
  for (const { rel } of collectFiles(ROOT).kept) {
    if (rel === "README.md" || rel.endsWith("/README.md")) files.push(join(ROOT, rel));
  }
  return [...new Set(files)];
}

function mask(line: string): string {
  let out = line;
  for (const [, span] of LICIT) {
    let i = out.indexOf(span);
    while (i !== -1) {
      out = out.slice(0, i) + " ".repeat(span.length) + out.slice(i + span.length);
      i = out.indexOf(span, i + span.length);
    }
  }
  return out;
}

test("public_surfaces_make_no_probative_claim", () => {
  const files = surfaces();
  assert.ok(files.length >= 10, `expected >=10 public-surface files, scanned ${files.length}`);
  // C-G2-2 (Lot CRA-B): SECURITY.md must be a scanned surface; dropping it from surfaces() (MG2) reds here.
  assert.ok(files.includes(join(ROOT, "SECURITY.md")), "SECURITY.md must be a scanned public surface (surfaces(); MG2)");

  const corpus: string[] = [];
  const survivors: string[] = [];
  for (const abs of files) {
    const text = readFileSync(abs, "utf8");
    corpus.push(text);
    const rel = abs.slice(ROOT.length + 1).replace(/\\/g, "/");
    text.split(/\r?\n/).forEach((line, i) => {
      const hits = mask(line).match(PROBATIVE);
      if (hits) for (const h of hits) survivors.push(`${rel}:${i + 1}  ${h}  >> ${line.trim()}`);
    });
  }
  assert.deepEqual(survivors, [], `probative surclaim(s) on a public surface:\n${survivors.join("\n")}`);

  // Non-vacuity: every LICIT span must appear >=1 time in scope (a dead entry silently widens the mask).
  const joined = corpus.join("\n");
  for (const [cat, span] of LICIT) {
    assert.ok(joined.includes(span), `LICIT [${cat}] span not found (dead mask entry): ${JSON.stringify(span)}`);
  }

  // Non-vacuity of the negation rule: honest negations exist and stay green.
  for (const neg of ["what is not verified", "not certified", "never certified"]) {
    assert.ok(joined.includes(neg), `expected honest negation present in scope: ${neg}`);
    assert.equal((mask(neg).match(PROBATIVE) ?? []).length, 0, `honest negation must stay green: ${neg}`);
  }
});

test("public_surfaces_make_no_probative_claim — scrub is load-bearing (synthetic mutants)", () => {
  assert.ok("A verified testimony".match(PROBATIVE), "verified surclaim must red");
  assert.ok("A proven testimony".match(PROBATIVE), "synonym 'proven' surclaim must red (MAST synonym-swap)");
  assert.ok("a certified testimony".match(PROBATIVE), "synonym 'certified' surclaim must red");
  // A licit span cannot launder a bare surclaim placed OUTSIDE it: mask blanks "proven by test 3", the
  // trailing "verified" survives.
  assert.ok(mask("proven by test 3 and the price is verified").match(PROBATIVE), "bare surclaim beside a licit span still reds");
  // Negation stays green through the same regex.
  assert.equal(mask("exactly what is not verified").match(PROBATIVE), null, "negation stays green");
});

// CodeQL alert 45: Bell's row of the served table is the one whose surface cell opens on an https URL of Bell's host, exactly (host equal,
// no suffix, no user part; never a substring anywhere in the row), and there is exactly one.
const BELL_HOST = "bell.monarkgate.tech";
function bellRowOf(rows: string[]): number {
  const at = rows.flatMap((l, i) => {
    const first = /`([^`]+)`/.exec(l.split(/(?<!\\)\|/)[1] ?? "")?.[1] ?? "", u = URL.canParse(first) ? new URL(first) : null;
    return u !== null && u.protocol === "https:" && u.host === BELL_HOST && u.username === "" && u.password === "" ? [i] : [];
  });
  assert.equal(at.length, 1, `one row of the served table is Bell's (${String(at.length)} found)`);
  return at[0] ?? -1;
}
// killer: test/public-surfaces-honesty.test.ts:169 CONST "u.host === BELL_HOST" -> "l.includes(BELL_HOST)"
test("readme_bell_row_is_read_by_exact_host_never_by_substring — a row that names Bell's URL elsewhere, or a look-alike host, is never Bell's row (CodeQL alert 45)", () => {
  const bell = "| `https://bell.monarkgate.tech/state.json` · `timeline.jsonl` | Bell's publications | anyone |";
  const decoys = ["| `https://x.example/` | a relay of https://bell.monarkgate.tech/ | the site |", "| `https://x.example/?https://bell.monarkgate.tech/` | x | y |",
    "| `https://bell.monarkgate.tech.x.example/` | x | y |", "| `http://bell.monarkgate.tech/` | x | y |", "| `https://u@bell.monarkgate.tech/` | x | y |", "| x | `https://bell.monarkgate.tech/` | y |"];
  assert.equal(bellRowOf([...decoys, bell]), decoys.length, "Bell's row, after every decoy");
  for (const d of decoys) assert.throws(() => bellRowOf([d]), /one row of the served table is Bell's \(0 found\)/, d);
  assert.throws(() => bellRowOf([bell, bell]), /\(2 found\)/, "two rows of Bell's");
});

// DOJO-README-1: the README says that a surface not in its table is not served. The Dojo host's row follows Bell's, naming the host
// and the four file forms of the verifier's closed list SERVED (apps/dojo/scripts/dojo-verify-cli.mjs l.17), in the words of the
// page's lead; its bullet follows Bell's in "Verify it yourself" and runs the exported verifier (WHITELIST_FILES) against the host
// itself, never the site's relay (DOJO_LIVE_PREFIX), which does not serve history/ (deploy/Caddyfile.monark-dojo-site.snippet). The
// Dojo is said built nowhere: its register piece stays upcoming (apps/site/lib/dojo-register.ts). Host, forms, route, relay prefix
// and lead are read from the site's constants and the verifier's own source, never typed here.
// killer: README.md:223 CONST "--url https://dojo.monarkgate.tech" -> "--url https://monarkgate.tech/dojo-served"
test("readme_names_the_dojo_surface_and_its_verifier — the Dojo host and its four file forms follow Bell in the served table, and the Dojo bullet runs the exported verifier against that host, never the site's relay (DOJO-README-1)", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8").split(/\r?\n/);
  const section = (title: string): string[] => {
    const start = readme.indexOf(`## ${title}`);
    assert.ok(start >= 0, `README section "## ${title}" not found`);
    const end = readme.findIndex((l, i) => i > start && l.startsWith("## "));
    return readme.slice(start + 1, end < 0 ? readme.length : end);
  };
  const spans = (text: string): string[] => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? "");
  const cli = readFileSync(join(ROOT, "apps", "dojo", "scripts", "dojo-verify-cli.mjs"), "utf8");
  const servedSource = /^const SERVED = \/(.+?)\/;/m.exec(cli)?.[1], usagePath = /usage: node (\S+) /.exec(cli)?.[1];
  assert.ok(servedSource !== undefined && usagePath !== undefined, "the verifier's closed list SERVED and its usage line are read (non-vacuity)");
  // (1) The served table: the row right after Bell's is the Dojo host and the four forms of SERVED, in the words of the page.
  const rows = section("What is served today").filter((l) => l.startsWith("| `"));
  const bell = bellRowOf(rows);
  assert.ok(bell >= 0, "Bell's row of the served surfaces (non-vacuity)");
  const row = rows[bell + 1] ?? "", [, surface = "", serves = "", readers = ""] = row.split(/(?<!\\)\|/).map((c) => c.trim());
  const forms = [DOJO_TIMELINE_PATH, DOJO_PUBKEY_PATH, dojoLinesPathOf("<sha256>"), dojoHistoryPathOf("<sha256>")];
  assert.deepEqual(spans(surface), [`${DOJO_HOST}/`, ...forms], "the row after Bell's names the Dojo host and its four file forms");
  for (const f of forms) assert.match(f.replace("<sha256>", "0".repeat(64)), new RegExp(servedSource), `${f} is a form of SERVED`);
  const lead = DOJO_TEXT.lead.slice(0, DOJO_TEXT.lead.indexOf(". ")).toLowerCase();
  assert.ok(serves.toLowerCase().includes(lead), "the row says what it serves in the words of the page's lead (apps/site/lib/dojo-copy.ts)");
  assert.ok(readers.includes(`\`${DOJO_ROUTE}\``), "the row names the site's /dojo page among its readers");
  // (2) The bullet right after Bell's in "Verify it yourself" (a bullet and its indented continuation lines).
  const bullets: string[][] = [];
  for (const l of section("Verify it yourself")) {
    if (l.startsWith("- ")) bullets.push([l]);
    else if (l.startsWith("  ")) bullets.at(-1)?.push(l.trim());
  }
  const bellBullet = bullets.findIndex((b) => (b[0] ?? "").startsWith("- **Bell.**"));
  assert.ok(bellBullet >= 0, "Bell's bullet in Verify it yourself (non-vacuity)");
  const bullet = (bullets[bellBullet + 1] ?? []).join(" ");
  assert.ok(bullet.startsWith(`- **${DOJO_NAME}.**`), "a Dojo bullet right after Bell's in Verify it yourself");
  // (3) Its command: the verifier its usage names, --url the Dojo host itself (never the relay), every path an exported file.
  const relay = `monarkgate.tech${DOJO_LIVE_PREFIX.slice(0, -1)}`;
  assert.deepEqual(readme.filter((l) => l.includes(relay)), [], `the README names the site's relay ${relay}, which does not serve history/`);
  const argv = (spans(bullet).find((s) => s.startsWith("node ")) ?? "").split(" ");
  assert.deepEqual(argv.slice(0, 2), ["node", usagePath], "the bullet's command runs the verifier's CLI, as its usage names it");
  const url = argv[argv.indexOf("--url") + 1];
  assert.equal(url, DOJO_HOST, "--url is the Dojo host itself");
  assert.ok(urlAllowed(url), "the verifier's transport policy admits that URL");
  assert.ok(argv.includes("--keyring") && !argv.includes("--self-consistent-only"), "the trust root is the public keyring, supplied explicitly");
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel)), paths = argv.filter((a) => /^[\w.-]+(?:\/[\w.-]+)+$/.test(a));
  assert.ok(paths.length >= 2, "the command names the verifier and its keyring (non-vacuity)");
  for (const p of paths) assert.ok(WHITELIST_FILES.includes(p) && kept.has(p), `${p}, named by the command, is not an exported file (WHITELIST_FILES)`);
  // (4) Built nowhere: no README text that names the Dojo says built.
  for (const text of [row, bullet, ...readme.filter((l) => l.includes(DOJO_NAME) || l.includes(DOJO_HOST))]) {
    assert.doesNotMatch(text, /\bbuilt\b/i, `the README says the Dojo is built: ${text.slice(0, 80)}`);
  }
});
