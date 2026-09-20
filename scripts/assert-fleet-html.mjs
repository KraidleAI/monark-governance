// scripts/assert-fleet-html.mjs — O-2 for lot CI-site (ADR-M003 D9 octies): after `next build`, assert the
// RENDERED /fleet HTML body carries the "How each built agent is served" header and each built agent's
// wiring.note. It asserts on the BODY (script payloads stripped, HTML entities decoded), never the raw file:
// the inline RSC payload carries the apostrophe LITERALLY, so a naive includes() on the raw bytes would pass
// on a broken body whose note survives only in the payload (measured, G0 finding 8 — a false GREEN). Fail-closed
// if fleet.html is absent (exit 1, never a skip). Node 24, built-ins only.
//
// The pure function assertFleetBody() is import-free (built-ins only) — what test/site-build-fleet.test.ts
// drives on a synthetic fixture. main() DYNAMICALLY imports apps/site/lib/fleet.ts (the SINGLE SOURCE of the
// built set — the expected notes are NEVER duplicated here) to derive the expected notes, then reads the
// freshly built artefact. The .d.mts twin gives the root nodenext tsc the type surface (governance-only,
// NOT whitelisted for the public export: no exported .ts imports this module).
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(SCRIPT_DIR, "..");

/** The exact command CI job g3-site runs to build the storefront; the single source of truth for the build
 *  step (idiom ci_publishes_sbom / scripts/sbom.mjs SBOM_COMMAND). test/site-build-fleet.test.ts asserts the
 *  g3-site build `run:` line EQUALS this; G2 and checkpoint-2 EXTRACT that line from ci.yml and replay it
 *  (with a TSX type error injected into apps/site => next build reds — the branching proof, G0 finding 12). */
export const SITE_BUILD_RUN = "npm run build -w @monark/site";

/** The digit-free header rendered above the served-notes list on /fleet (apps/site/app/fleet/page.tsx). */
export const FLEET_HEADER = "How each built agent is served";

/** The built artefact O-2 reads, relative to the repo root — the FRESH output of `next build`, never a stale
 *  .next left on disk (a disk .next drifts from source; G0 finding 6). */
export const FLEET_HTML_REL = "apps/site/.next/server/app/fleet.html";

/** Decode the HTML entities React emits in the rendered body. `&amp;` is decoded LAST so `&amp;#x27;` does not
 *  double-decode into an apostrophe. Numeric decimal/hex forms are generic; the named set covers React output. */
export function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Isolate the RENDERED text body: drop React's `<!-- -->` comment markers (inserted around interpolated
 *  text, so the body is NOT plain text) and every `<script>...</script>` payload (the inline RSC payload holds
 *  notes with LITERAL apostrophes — the false-green source), then decode entities. */
export function renderedBody(html) {
  // Strip <script> payloads FIRST, then <!-- --> markers: a `<!--` inside a payload cannot then pair with a
  // `-->` in the body and eat rendered text. (Next escapes `<` as < in inline scripts, so there is no bug
  // today either — measured on the real artefact — but scripts-first is the robust order.)
  const noScript = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const noComments = noScript.replace(/<!--[\s\S]*?-->/g, "");
  return decodeEntities(noComments);
}

/** Assert the rendered /fleet HTML body carries `expectedHeader` and each of `expectedNotes` at least once.
 *  Pure, built-ins only; THROWS on any failure (fail-closed). Vacuity-guarded: an empty expected list, an
 *  empty/blank note, or an empty rendered body all throw — a hollow build must never pass by absence of an
 *  assertion (a regex-on-source guard would stay green there; that is why O-2 reads the artefact). */
export function assertFleetBody({ html, expectedHeader, expectedNotes }) {
  if (typeof html !== "string") throw new Error("assert-fleet-html: html must be a string");
  if (typeof expectedHeader !== "string" || expectedHeader.trim().length === 0)
    throw new Error("assert-fleet-html: expectedHeader is empty (vacuity guard)");
  if (!Array.isArray(expectedNotes) || expectedNotes.length === 0)
    throw new Error("assert-fleet-html: expectedNotes is empty — no built agent note to check (vacuity guard)");
  for (const n of expectedNotes)
    if (typeof n !== "string" || n.trim().length === 0)
      throw new Error("assert-fleet-html: a built agent's note is empty/blank (vacuity guard)");

  const body = renderedBody(html);
  if (body.trim().length === 0) throw new Error("assert-fleet-html: rendered body empty after stripping scripts/comments (fail-closed)");

  if (!body.includes(decodeEntities(expectedHeader)))
    throw new Error(`assert-fleet-html: header absent from the rendered /fleet body: ${JSON.stringify(expectedHeader)}`);

  const missing = expectedNotes.filter((n) => !body.includes(decodeEntities(n)));
  if (missing.length)
    throw new Error(
      `assert-fleet-html: ${missing.length} served note(s) absent from the rendered /fleet body:\n` +
        missing.map((m) => `  - ${m}`).join("\n"),
    );
  return { header: decodeEntities(expectedHeader), notes: expectedNotes.length, bodyChars: body.length };
}

async function main() {
  const abs = join(REPO_ROOT, ...FLEET_HTML_REL.split("/"));
  if (!existsSync(abs)) {
    console.error(`assert-fleet-html: FAIL-CLOSED — ${FLEET_HTML_REL} not found. Run \`${SITE_BUILD_RUN}\` first (O-2 asserts on the fresh artefact, never a skip).`);
    process.exit(1);
  }
  const fleetUrl = pathToFileURL(join(REPO_ROOT, "apps", "site", "lib", "fleet.ts")).href;
  const { FLEET_AGENTS } = await import(fleetUrl);
  const expectedNotes = FLEET_AGENTS.filter((a) => a.status === "built").map((a) => a.wiring.note);
  try {
    const r = assertFleetBody({ html: readFileSync(abs, "utf8"), expectedHeader: FLEET_HEADER, expectedNotes });
    console.log(`assert-fleet-html OK — header + ${r.notes} served note(s) present in the rendered /fleet body (${r.bodyChars} body chars).`);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}

// Run-guard (mirrors scripts/grep-forbidden.mjs, scripts/export-public.mjs): the CLI runs only when invoked
// directly (node scripts/assert-fleet-html.mjs), NEVER on import — so the test imports the pure function
// without touching fleet.ts or the filesystem.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
