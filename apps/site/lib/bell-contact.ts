// apps/site/lib/bell-contact.ts — the Bell contact (decision 78, amended by decision 94; lot SITE-LEGAL-1).
//
// Entry into relation for Bell is ONE `mailto:` link to a box on the domain, carrying the mail template validated by
// the investor's lawyer (decision 147: onboarding-bell/legal/MAILTO-TEMPLATE-draft.md, "as drafted"). The box exists
// (created by the investor on 2026-09-23). The
// three closed lists and the body lines are copied VERBATIM from that template; its sixth field, country, is dropped
// (decision 94: no country until the company exists). The template's privacy line points to the Privacy Notice
// served by this site (PRIVACY_NOTICE_URL, route /bell/privacy); the template's draft URL was a placeholder host.
// Encoding follows the template's own generation note: RFC 3986 percent-encoding with no safe character (the output
// of Python urllib.parse.quote(text, safe='')), CRLF line breaks in the body (RFC 6068 section 5).
// This is the ONLY place a `mailto:` is built on the site; the root test test/bell-contact.test.ts pins the address,
// the body and the encoding, and reds on any other `mailto:` under apps/site.
// Pure data: no React/Next import, self-contained (shared by components/bell/contact.tsx, the legal pages and the
// root test program).

export const CONTACT_ADDRESS = "bell@monarkgate.tech";
export const PRIVACY_NOTICE_URL = "https://monarkgate.tech/bell/privacy";

/** Visible label of the link (decision 78 vocabulary). */
export const CONTACT_LABEL = "request a symbol / early access";
export const MAIL_SUBJECT = "Request a symbol / early access - MONARK Bell";

// Closed lists, verbatim from the validated template (section 2 of MAILTO-TEMPLATE-draft.md).
export const PROFILE_CHOICES: readonly string[] = [
  "Curator / DAO / Lender",
  "TSV issuer",
  "Market maker / venue",
  "Reconciliation infrastructure",
  "Researcher / press",
  "Regulator",
];
export const USE_CHOICES: readonly string[] = ["internal", "publication-citation", "redistribution"];
export const CONSUMPTION_CHOICES: readonly string[] = ["files", "MCP", "signed export"];

/** The template body, country field removed (decision 94), CRLF line breaks. */
export function mailBody(): string {
  return [
    `Profile (choose one): ${PROFILE_CHOICES.join(" -- ")}`,
    "",
    "Organization + professional e-mail address:",
    "",
    "Symbol x platform x regime x horizon requested:",
    "",
    `Intended use (${USE_CHOICES.join(" / ")}):`,
    "",
    `Consumption mode (${CONSUMPTION_CHOICES.join(" / ")}):`,
    "",
    "----",
    "We process the information above to answer this request and to prioritize symbol",
    "coverage, under legitimate interest. See the Privacy Notice at",
    `${PRIVACY_NOTICE_URL} for details, including how to object.`,
    "No account or payment is required to send this request.",
  ].join("\r\n");
}

/** RFC 3986 percent-encoding with no safe character: encodeURIComponent plus ! ' ( ) * (= Python quote(s, safe='')). */
export function rfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/** The one link of the site to the Bell contact box. */
export function mailtoHref(): string {
  return `mailto:${CONTACT_ADDRESS}?subject=${rfc3986(MAIL_SUBJECT)}&body=${rfc3986(mailBody())}`;
}
