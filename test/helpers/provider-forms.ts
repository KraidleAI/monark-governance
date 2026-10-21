// test/helpers/provider-forms.ts -- the one source of the provider FORMS for the three tests named below (lot 1d-ii of
// BELL-COLLECT-TIMER-1, correction C-6); it is not the source of every provider list of the repository. Two closed lists, read by
// test/no-cash-provider-name.test.ts (every exported file, decision 69), test/bell-recompute-phrases.test.ts (the three Bell pages)
// and apps/bell/test/bell-validate.test.ts (the public export of the Bell validation module). Other lists of the trunk overlap
// these and are not replaced by them: DATA_SOURCE_FORMS of scripts/public-text-deny.mjs (the gate of the public free texts),
// PROVIDER_FORMS of test/bell-served.test.ts (the Bell data file and storefront sources) and FORMS of
// test/site-ukemi.test.ts (the Ukemi files); they differ in case and in substring against whole-word matching.
// These LITERALS name providers and products, so they live
// only under the repo-root test/ directory, which is NEVER exported (self-check of test/no-cash-provider-name.test.ts).

/** FORMS of the Bell cash cross-check provider (decision 69), moved unchanged from test/no-cash-provider-name.test.ts. */
export const CASH_CROSS_CHECK_FORMS: { re: RegExp; why: string }[] = [
  { re: /\bmassive\b/i, why: "cash cross-check provider brand (whole word; conservative over-match)" },
  { re: /polygon\.io/i, why: "cash cross-check provider API domain" },
  { re: /POLYGON_API_KEY/, why: "cash cross-check provider env-key name" },
];

/** FORMS of the reference-close source and of its product names (apps/bell/src/close.ts), never named on a Bell page. */
export const CLOSE_SOURCE_FORMS: { re: RegExp; why: string }[] = [
  { re: /\bdatabento\b/i, why: "close source brand" },
  { re: /databento\.com/i, why: "close source API host" },
  { re: /DATABENTO_API_KEY/, why: "close source env-key name" },
  { re: /\bEQUS\b/i, why: "close source dataset name" },
  { re: /\bohlcv\b/i, why: "close source schema name" },
  { re: /\bNLS\b/, why: "close feed product acronym" },
  { re: /\bLast\s+Sale\s+Plus\b/i, why: "close feed product name" },
  { re: /\bNasdaq\s+Last\s+Sale\b/i, why: "close feed product family name" },
];
