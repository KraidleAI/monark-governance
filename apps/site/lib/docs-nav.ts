// apps/site/lib/docs-nav.ts: the map of the documentation section (/docs), in reading order, and the address of each
// piece page. PURE DATA and pure helpers, with no import: the Next bundler and the root test program resolve relative
// specifiers differently (see lib/fleet.ts), so the list of pieces is never typed here. A caller passes the fleet
// register's names in, and the piece pages, the sidebar and the root test all derive the same addresses from them.
// Every label and blurb is digit-free; a count is spelled by the caller from the register (countWord in lib/fleet.ts).

/** One section of the documentation, with the sentence the overview and the sidebar show under its name. */
export interface DocSection {
  href: string;
  label: string;
  blurb: string;
}

export const DOCS_ROOT = "/docs";
export const DOCS_PIECES_ROOT = "/docs/pieces";

/** The sections, in reading order. The pieces section is labelled by its caller with the register's count. */
export const DOCS_SECTIONS: readonly DocSection[] = [
  { href: "/docs", label: "Overview", blurb: "Two sides, one engine: the knife, the floors, and what you will see if you call it today." },
  { href: "/docs/gate", label: "The gate", blurb: "Commit, defer or abstain: the region, the budget the caller carries, the reason codes." },
  { href: "/docs/pieces", label: "The pieces", blurb: "Every piece of the engine, what it reads, what it produces, and its label in the register." },
  { href: "/docs/bell", label: "MONARK Bell", blurb: "A signed, hash-chained record of tokenized equities off hours, with a real record read from the host." },
  { href: "/docs/ukemi", label: "Ukemi", blurb: "Eligible is not liquidated: the book at a block, the oracle path, a conformal upper bound per stratum." },
  { href: "/docs/narabi", label: "Narabi", blurb: "One window a day: the attested redemption flow, the quantile tracker, the replayable timeline." },
  { href: "/docs/integrators", label: "Integrators", blurb: "MCP and HTTP, the served tools, and calls recorded over the transport, request and answer." },
  { href: "/docs/use-cases", label: "Use cases", blurb: "What the engine is built toward when every piece is served, each case next to its state today." },
  { href: "/docs/research", label: "DeFi research", blurb: "Runs, liquidations, the oracle path, calibration and off-hours gaps: questions, methods, results." },
  { href: "/docs/verify", label: "Verify it yourself", blurb: "Checks with standard tools: the key, the chain, the signatures, the state files, the token address, the timestamps." },
  { href: "/docs/glossary", label: "Glossary", blurb: "The words of the engine, each defined once, as the pages use them." },
];

/** The address slug of a piece: its register name, lower case, without diacritics ("Shōgen" gives "shogen"). */
export function pieceSlug(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The docs page of a piece. */
export function pieceHref(name: string): string {
  return `${DOCS_PIECES_ROOT}/${pieceSlug(name)}`;
}

/** The section before and after a docs address, in reading order (null at either end, or when the address is a piece page). */
export function neighbours(href: string): { prev: DocSection | null; next: DocSection | null } {
  const i = DOCS_SECTIONS.findIndex((s) => s.href === href);
  if (i < 0) return { prev: null, next: null };
  return { prev: DOCS_SECTIONS[i - 1] ?? null, next: DOCS_SECTIONS[i + 1] ?? null };
}
