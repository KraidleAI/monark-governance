// apps/site/lib/docs-references-load.ts: the bibliography of the documentation section, read fail-closed from the committed,
// hashed file apps/site/data/docs-references.json. The file is read ONLY after its sha256 (CRLF to LF, UTF-8) equals the value
// apps/site/data/manifest.sha256.json carries for it, then every entry is checked against a CLOSED shape: exactly its keys,
// a reading level from the file's own closed list, an identifier in a known form (a DOI, an arXiv id or an https address),
// no duplicate id, every quoted result pointing at a listed work, and every verbatim quote at most twenty-five words. An
// unlisted file, a hash mismatch, an extra key, a malformed value or a longer quote throws, so `next build` reds rather than
// cite an unchecked work. Pages render the entries by property access: a year or a volume is a datum of the entry, never
// typed on a page.
// Self-contained (node built-ins only, no alias or relative import): shared by the pages and the root test program.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const DOCS_REFERENCES_REL = "apps/site/data/docs-references.json";
export const DOCS_REFERENCES_SCHEMA = "monark-site-docs-references-v2";
/** The longest verbatim quote the pages may print from a work, in words. */
export const DOCS_QUOTE_MAX_WORDS = 25;
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";

/** One cited work. `title` is null when the title carries a word the site does not print; `title_note` then says why. */
export interface DocReference {
  id: string;
  authors: string;
  year: number;
  title: string | null;
  title_note: string | null;
  venue: string;
  identifier: string | null;
  level: string;
  used_for: string;
}

/** One statement a page quotes from a cited work, with where it sits in the work. */
export interface DocResult {
  id: string;
  ref: string;
  locator: string;
  statement: string;
}

/** One passage a page prints verbatim, between quotation marks, with where it sits in the work. */
export interface DocQuote {
  id: string;
  ref: string;
  locator: string;
  text: string;
}

export interface DocsReferences {
  levels: string[];
  references: DocReference[];
  results: DocResult[];
  quotes: DocQuote[];
}

const ID = /^[a-z][a-z0-9-]*[a-z0-9]$/;
const TEXT = /^[\x20-\x7e]{1,600}$/;
const IDENTIFIER = /^(?:doi:10\.[0-9]{4,9}\/[\x21-\x7e]+|arXiv:[0-9]{4}\.[0-9]{4,5}|https:\/\/[a-z0-9.-]+\/[\x21-\x7e]*)$/;

function fail(why: string): never {
  throw new Error(`docs references: ${why}`);
}
type Obj = Record<string, unknown>;
function obj(v: unknown, keys: readonly string[], where: string): Obj {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return fail(`${where} must be an object`);
  const got = Object.keys(v).sort().join(",");
  if (got !== [...keys].sort().join(",")) return fail(`${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return v as Obj;
}
function text(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) return fail(`${where} is malformed`);
  return v;
}
function textOrNull(v: unknown, re: RegExp, where: string): string | null {
  return v === null ? null : text(v, re, where);
}

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function docsRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

function readListed(root: string): string {
  const manifest = JSON.parse(readFileSync(join(root, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[DOCS_REFERENCES_REL];
  if (typeof expected !== "string") fail(`${DOCS_REFERENCES_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(root, DOCS_REFERENCES_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${DOCS_REFERENCES_REL} (manifest ${String(expected)}, actual ${actual})`);
  return raw;
}

/** Read and check the bibliography; throws on any departure from the closed shape. */
export function loadDocsReferences(root: string): DocsReferences {
  const d = obj(JSON.parse(readListed(root)), ["$comment", "schema", "levels", "references", "results", "quotes"], "file");
  if (d.schema !== DOCS_REFERENCES_SCHEMA) fail(`schema is not ${DOCS_REFERENCES_SCHEMA}`);
  if (!Array.isArray(d.levels) || !Array.isArray(d.references) || !Array.isArray(d.results) || !Array.isArray(d.quotes)) {
    fail("levels, references, results and quotes must be arrays");
  }
  const levels = (d.levels as unknown[]).map((x, i) => text(x, /^[a-z ]{3,40}$/, `levels[${String(i)}]`));
  const references = (d.references as unknown[]).map((x, i): DocReference => {
    const w = `references[${String(i)}]`;
    const r = obj(x, ["id", "authors", "year", "title", "title_note", "venue", "identifier", "level", "used_for"], w);
    const year = r.year;
    if (typeof year !== "number" || !Number.isInteger(year) || year < 1900 || year > 2100) fail(`${w}.year must be a plausible integer year`);
    const title = textOrNull(r.title, TEXT, `${w}.title`);
    const note = textOrNull(r.title_note, TEXT, `${w}.title_note`);
    if ((title === null) === (note === null)) fail(`${w}: exactly one of title and title_note is carried`);
    const level = text(r.level, TEXT, `${w}.level`);
    if (!levels.includes(level)) fail(`${w}.level is not one of the file's levels`);
    return {
      id: text(r.id, ID, `${w}.id`),
      authors: text(r.authors, TEXT, `${w}.authors`),
      year: year as number,
      title,
      title_note: note,
      venue: text(r.venue, TEXT, `${w}.venue`),
      identifier: textOrNull(r.identifier, IDENTIFIER, `${w}.identifier`),
      level,
      used_for: text(r.used_for, TEXT, `${w}.used_for`),
    };
  });
  const ids = references.map((r) => r.id);
  if (new Set(ids).size !== ids.length) fail("reference ids must be unique");
  const results = (d.results as unknown[]).map((x, i): DocResult => {
    const w = `results[${String(i)}]`;
    const r = obj(x, ["id", "ref", "locator", "statement"], w);
    const ref = text(r.ref, ID, `${w}.ref`);
    if (!ids.includes(ref)) fail(`${w}.ref names no listed work`);
    return { id: text(r.id, ID, `${w}.id`), ref, locator: text(r.locator, TEXT, `${w}.locator`), statement: text(r.statement, TEXT, `${w}.statement`) };
  });
  if (new Set(results.map((r) => r.id)).size !== results.length) fail("result ids must be unique");
  const quotes = (d.quotes as unknown[]).map((x, i): DocQuote => {
    const w = `quotes[${String(i)}]`;
    const q = obj(x, ["id", "ref", "locator", "text"], w);
    const ref = text(q.ref, ID, `${w}.ref`);
    if (!ids.includes(ref)) fail(`${w}.ref names no listed work`);
    const words = text(q.text, TEXT, `${w}.text`);
    if (words.trim().split(/\s+/).length > DOCS_QUOTE_MAX_WORDS) fail(`${w}.text is longer than ${String(DOCS_QUOTE_MAX_WORDS)} words`);
    return { id: text(q.id, ID, `${w}.id`), ref, locator: text(q.locator, TEXT, `${w}.locator`), text: words };
  });
  if (new Set(quotes.map((q) => q.id)).size !== quotes.length) fail("quote ids must be unique");
  return { levels, references, results, quotes };
}

/** One work by id, fail-closed: a page that cites an unknown id fails the build. */
export function referenceById(refs: DocsReferences, id: string): DocReference {
  const r = refs.references.find((x) => x.id === id);
  if (r === undefined) fail(`no reference with id ${id}`);
  return r as DocReference;
}

/** One quoted result by id, fail-closed. */
export function resultById(refs: DocsReferences, id: string): DocResult {
  const r = refs.results.find((x) => x.id === id);
  if (r === undefined) fail(`no result with id ${id}`);
  return r as DocResult;
}

/** One verbatim quote by id, fail-closed. */
export function quoteById(refs: DocsReferences, id: string): DocQuote {
  const q = refs.quotes.find((x) => x.id === id);
  if (q === undefined) fail(`no quote with id ${id}`);
  return q as DocQuote;
}
