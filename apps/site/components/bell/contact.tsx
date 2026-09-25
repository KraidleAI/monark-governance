import {
  CONTACT_ADDRESS,
  CONTACT_LABEL,
  PROFILE_CHOICES,
  USE_CHOICES,
  CONSUMPTION_CHOICES,
} from "@/lib/bell-contact";

// Entry into relation for Bell: the label links to the request section of the page (address as text, template as
// text, and the one `mailto:` link of the site) so a click always lands somewhere, even in a browser with no mail
// handler. The mail template is the one validated by the lawyer, country field dropped. The address, the lists, the body and the encoding live in lib/bell-contact.ts (single
// source, pinned by the root test test/bell-contact.test.ts). The address is ALSO shown as text, and the template's
// fields stay visible next to the link, as the template asks, for a mail client that does not fill the body.
// Vocabulary "request a symbol / early access", never trial / plan / pricing. A page that does not render the request section (the
// method page) passes the section's address on /bell.
export function BellContact({ href = "#request-a-symbol" }: { href?: string }) {
  return (
    <span>
      <a className="c-mono" href={href}>
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
