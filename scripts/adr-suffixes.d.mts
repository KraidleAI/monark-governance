// Types of scripts/adr-suffixes.mjs (lot ADR-M003-SUFFIX-DUP-1, ADR-M003 D9: the suffixes of its addenda).
/** One "**Addendum D9" heading: its 1-based line, its suffix ("" for none, null when the heading does not parse), its date or null. */
export interface D9Heading {
  line: number;
  suffix: string | null;
  date: string | null;
}
export declare const LATIN_ORDINALS: readonly string[];
export declare const HISTORICAL_DUPLICATES: readonly { readonly suffix: string; readonly dates: readonly string[] }[];
export declare function d9Headings(text: string): D9Heading[];
export declare function d9SuffixProblems(headings: readonly D9Heading[]): string[];
