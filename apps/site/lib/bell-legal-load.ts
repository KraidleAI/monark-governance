// apps/site/lib/bell-legal-load.ts — build-time loader of the committed legal spans (lot SITE-LEGAL-1; server side).
// Reads apps/site/data/bell-legal.json ONLY after its sha256 (CRLF->LF, UTF-8) equals the value the site manifest
// apps/site/data/manifest.sha256.json carries for it — the same tamper check as lib/load-committed.ts, which root
// test 44 (a) also runs over every manifest entry. Then checks the shape. FAIL-CLOSED: an unlisted file, a hash
// mismatch or a malformed field throws, so `next build` reds rather than render an unchecked legal text.
// What the file carries, and why those spans are not written in the page source, is stated in its $comment; the
// closed set of gate words and digits it carries is pinned by the root test test/bell-legal.test.ts.
// Self-contained (node built-ins only, no alias import): shared by the two pages and the root test program.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const BELL_LEGAL_REL = "apps/site/data/bell-legal.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";

export interface BellWordsRow {
  avoid: string;
  why: string;
  instead: string;
}

export interface BellLegalData {
  privacy: { legal_basis_citation: string; retention_period: string };
  /** The table's second introductory sentence (reason 6, orchestrator ruling TERMS-WORDS-SENTENCE-1). */
  terms_words_scope_sentence: string;
  terms_words_table: BellWordsRow[];
}

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function siteRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

function text(v: unknown, where: string): string {
  if (typeof v !== "string" || v.trim().length === 0) throw new Error(`bell legal: ${where} must be a non-empty string`);
  return v;
}

export function loadBellLegal(rootDir: string): BellLegalData {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as {
    algorithm?: unknown;
    files?: Record<string, unknown>;
  };
  if (manifest.algorithm !== "sha256") throw new Error("bell legal: site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[BELL_LEGAL_REL];
  if (typeof expected !== "string") throw new Error(`bell legal: ${BELL_LEGAL_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, BELL_LEGAL_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) throw new Error(`bell legal: sha256 mismatch for ${BELL_LEGAL_REL} (manifest ${expected}, actual ${actual})`);

  const data = JSON.parse(raw) as { privacy?: Record<string, unknown>; terms_words_scope_sentence?: unknown; terms_words_table?: unknown };
  const privacy = data.privacy ?? {};
  const rows = data.terms_words_table;
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("bell legal: terms_words_table must be a non-empty array");
  return {
    privacy: {
      legal_basis_citation: text(privacy.legal_basis_citation, "privacy.legal_basis_citation"),
      retention_period: text(privacy.retention_period, "privacy.retention_period"),
    },
    terms_words_scope_sentence: text(data.terms_words_scope_sentence, "terms_words_scope_sentence"),
    terms_words_table: rows.map((r: unknown, i) => {
      const row = (r ?? {}) as Record<string, unknown>;
      return {
        avoid: text(row.avoid, `terms_words_table[${i}].avoid`),
        why: text(row.why, `terms_words_table[${i}].why`),
        instead: text(row.instead, `terms_words_table[${i}].instead`),
      };
    }),
  };
}
