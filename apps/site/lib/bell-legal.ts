// apps/site/lib/bell-legal.ts — routes and section order of the two Bell legal pages (lot SITE-LEGAL-1; decisions
// 146, 147, 148). The TEXT of the pages is the validated legal text (the lawyer's GO "as drafted", decision 147),
// written in app/bell/terms/page.tsx and app/bell/privacy/page.tsx; this module only carries STRUCTURE.
//
// Section numbers are never typed: a section's number is its position in the ordered list below, so the heading
// "8. Symbol requests" and a cross-reference "§8" come from the same place and cannot drift apart, and a
// reference to a section that does not exist fails to compile (the ids are a closed union type).
// Pure data: no React/Next import, self-contained (shared by the pages and the root test program).

export const TERMS_ROUTE = "/bell/terms";
export const PRIVACY_ROUTE = "/bell/privacy";

/** Terms of Use sections, in the order of the validated text. */
export const TERMS_SECTIONS = [
  "about",
  "publish",
  "licence",
  "prohibited-uses",
  "no-warranty",
  "liability",
  "availability",
  "symbol-requests",
  "no-account",
  "changes",
  "governing-law",
  "contact",
] as const;
export type TermsSectionId = (typeof TERMS_SECTIONS)[number];

/** Privacy Notice sections, in the order of the validated text. */
export const PRIVACY_SECTIONS = [
  "controller",
  "collect",
  "purpose",
  "legal-basis",
  "recipients",
  "retention",
  "rights",
  "required",
  "automated",
  "access-logs",
  "changes",
] as const;
export type PrivacySectionId = (typeof PRIVACY_SECTIONS)[number];

/** The number of a section = its one-based position in its page's ordered list (fail-closed on an unknown id). */
export function sectionNumber<T extends string>(order: readonly T[], id: T): string {
  const i = order.indexOf(id);
  if (i < 0) throw new Error(`bell legal: section '${id}' is not in the page's section order`);
  return String(i + 1);
}
