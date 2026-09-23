import {
  CONTACT_ADDRESS,
  CONTACT_LABEL,
  PROFILE_CHOICES,
  USE_CHOICES,
  CONSUMPTION_CHOICES,
  mailtoHref,
} from "@/lib/bell-contact";

// Entry into relation for Bell (decision 78, amended by decision 94; lot SITE-LEGAL-1): ONE `mailto:` link to the
// box on the domain, carrying the mail template validated by the investor's lawyer (decision 147), country field
// dropped (decision 94). The address, the lists, the body and the encoding live in lib/bell-contact.ts (single
// source, pinned by the root test test/bell-contact.test.ts). The address is ALSO shown as text, and the template's
// fields stay visible next to the link, as the template asks, for a mail client that does not fill the body.
// Vocabulary "request a symbol / early access", never trial / plan / pricing.
export function BellContact() {
  return (
    <span>
      <a className="c-mono" href={mailtoHref()}>
        {CONTACT_LABEL}
      </a>{" "}
      · <span className="c-mono">{CONTACT_ADDRESS}</span>
      <span className="c-small c-muted" style={{ display: "block", marginTop: 4 }}>
        a mail template, no form: profile (one of: {PROFILE_CHOICES.join(" · ")}) · organization and professional e-mail
        address · symbol × platform × regime × horizon requested · intended use ({USE_CHOICES.join(" · ")}) · consumption
        mode ({CONSUMPTION_CHOICES.join(" · ")})
      </span>
    </span>
  );
}
