import { Placeholder } from "@/components/placeholder";

// Entry into relation for Bell (decision 78, amended by decision 94; orchestrator rulings (4) and V2 of 2026-09-23):
// a `mailto:` link to a box on the domain with the mail template validated by the investor's lawyer (decision 147:
// onboarding-bell/legal/MAILTO-TEMPLATE-draft.md, "as drafted"). The three closed lists below are copied VERBATIM
// from that template (ruling V2); its sixth field, country, is dropped (decision 94: no country until the company
// exists). Vocabulary "request a symbol / early access", never trial / plan / pricing.
// The ADDRESS is not created yet (an investor act, decision 78): it stays a visible named placeholder, never invented,
// and no dead `mailto:` is emitted. The template's short privacy line points to a privacy notice that is not served
// yet (pli SITE-LEGAL-1), so the link also waits for that notice: the link is emitted only when BOTH the address and
// the notice URL are set.
const CONTACT_ADDRESS: string | null = null;
const PRIVACY_NOTICE_URL: string | null = null;

export const CONTACT_LABEL = "request a symbol / early access";
const MAIL_SUBJECT = "Request a symbol / early access - MONARK Bell";

// Closed lists, verbatim from the validated template (§2 of MAILTO-TEMPLATE-draft.md).
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

/** The template body (CRLF line breaks, RFC 6068 §5, as the template specifies), country field removed. */
function mailBody(privacyNoticeUrl: string): string {
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
    `${privacyNoticeUrl} for details, including how to object.`,
    "No account or payment is required to send this request.",
  ].join("\r\n");
}

export function BellContact() {
  if (CONTACT_ADDRESS !== null && PRIVACY_NOTICE_URL !== null) {
    const href = `mailto:${CONTACT_ADDRESS}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(mailBody(PRIVACY_NOTICE_URL))}`;
    return (
      <a className="c-mono" href={href}>
        {CONTACT_LABEL}
      </a>
    );
  }
  return (
    <span>
      <span className="c-mono">{CONTACT_LABEL}</span> <Placeholder name="contact" state="to be created" />
      <span className="c-small c-muted" style={{ display: "block", marginTop: 4 }}>
        a mail template, no form: profile (one of: {PROFILE_CHOICES.join(" · ")}) · organization and professional e-mail
        address · symbol × platform × regime × horizon requested · intended use ({USE_CHOICES.join(" · ")}) · consumption
        mode ({CONSUMPTION_CHOICES.join(" · ")})
      </span>
    </span>
  );
}
