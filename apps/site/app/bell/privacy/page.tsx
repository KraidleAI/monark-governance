import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import { LegalSection, SectionRef } from "@/components/bell/legal";
import { PRIVACY_SECTIONS, TERMS_SECTIONS, TERMS_ROUTE } from "@/lib/bell-legal";
import { loadBellLegal, siteRepoRoot } from "@/lib/bell-legal-load";
import { CONTACT_ADDRESS } from "@/lib/bell-contact";

// Static metadata only (no generateMetadata); digit-free (honesty lint §6b).
export const metadata: Metadata = {
  title: "Bell · privacy notice · MONARK",
  description:
    "The privacy notice of the MONARK Bell contact, request a symbol / early access, and of the server access logs: controller, what is collected, purpose, legal basis, recipients, retention, rights.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell/privacy — the Privacy Notice of the Bell mail contact (lot SITE-LEGAL-1; decisions 146, 147, 148). The text is
// the validated draft PRIVACY-NOTICE-draft.md (the lawyer's GO "as drafted", decision 147), VERBATIM except for the
// reasons listed with each deviation in the lot report: (1) notes to counsel, the "PROPOSED" wrappers and the
// cross-references to draft files are removed (the proposed legal basis and retention are the validated text); (5) no
// country (decision 94): the country field of the template is gone (five fields, not six) and the controller's
// identity stays visible placeholders. The contact address is the box created by the investor (lib/bell-contact.ts);
// under decision 94 the contact box is also the point of contact for privacy questions. The two spans that carry
// digits (a regulation article, a retention numeral) are read from the committed, hashed data file through
// lib/bell-legal-load.ts (ADR-M004 D1: numbers only from committed, hashed data). Section numbers and references come
// from lib/bell-legal.ts, never typed. The right to object is set apart in its own block (GDPR art. 21(4): "clearly
// and separately"), with its words unchanged.
export default function BellPrivacyPage() {
  const legal = loadBellLegal(siteRepoRoot());
  const P = PRIVACY_SECTIONS;

  return (
    <main className="c-main">
      <div className="c-hero c-hero--single">
        <div>
          <span className="c-label">privacy notice · /bell/privacy</span>
          <h1 className="c-h1" style={{ marginTop: 10 }}>
            Privacy Notice — "request a symbol / early access" contact
          </h1>
          <p className="c-lede" style={{ marginTop: 12 }}>
            This notice explains what happens to the information you send us when you write to{" "}
            <span className="c-mono">{CONTACT_ADDRESS}</span> using the "request a symbol / early access" template.
          </p>
        </div>
      </div>

      <article className="c-legal">
        <LegalSection order={P} id="controller" title="Who is responsible for this data (the controller)">
          <p>
            <Placeholder name="legal_entity" state="to be decided" />, <Placeholder name="legal_form" state="to be decided" />,{" "}
            <Placeholder name="publisher_address" state="to be decided" />. Contact for privacy questions:{" "}
            <span className="c-mono">{CONTACT_ADDRESS}</span>.
          </p>
        </LegalSection>

        <LegalSection order={P} id="collect" title="What we collect">
          <p>
            The five fields of the request template (profile; organization and professional e-mail address; symbol,
            platform, regime, and horizon requested; intended use; consumption mode), plus the technical metadata your
            e-mail carries anyway (sending address, timestamp, message headers). We do not ask for a phone number, identity
            documents, or any financial information, and we do not use a third-party form (so no separate form provider is
            added as a processor of this data).
          </p>
        </LegalSection>

        <LegalSection order={P} id="purpose" title="Why we collect it (purpose)">
          <p>
            To answer your request, and to prioritize which symbols we consider adding to what we publish. We do not use
            this information to build a private, non-public measurement — see <Link href={TERMS_ROUTE}>Terms of Use</Link>{" "}
            <SectionRef order={TERMS_SECTIONS} id="symbol-requests" page={TERMS_ROUTE} />.
          </p>
        </LegalSection>

        <LegalSection order={P} id="legal-basis" title="Legal basis">
          <p>
            Legitimate interest, {legal.privacy.legal_basis_citation}: responding to unsolicited professional inquiries
            and evaluating coverage requests for a public-interest witness service.
          </p>
        </LegalSection>

        <LegalSection order={P} id="recipients" title="Who receives it (recipients)">
          <p>
            Our own team, and our e-mail service provider, which stores and transmits the message on our behalf as a data
            processor. We do not sell or trade this information, and we do not transfer it to anyone for their own
            marketing purposes.
          </p>
        </LegalSection>

        <LegalSection order={P} id="retention" title="How long we keep it">
          <p>
            {legal.privacy.retention_period} from receipt, or from your last contact with us if later, after which we
            would either ask whether you want us to keep it or delete/archive it. This mirrors the CNIL's published
            guidance on retention for prospect and commercial-relationship data. If you object (see{" "}
            <SectionRef order={P} id="rights" /> below), we keep only the minimum record needed to honor that objection,
            typically for no longer than the same three years, per the same guidance.
          </p>
        </LegalSection>

        <LegalSection order={P} id="rights" title="Your rights">
          <p>You can ask us to access, correct, or erase your information, or to restrict how we use it.</p>
          <p className="c-legal-callout">
            <b>You can also object at any time</b>, without needing to justify why, to our use of your information under{" "}
            <SectionRef order={P} id="legal-basis" /> above; if you do, we stop using it for this purpose unless we have a
            compelling legitimate ground that overrides your objection, or need it to establish, exercise, or defend a
            legal claim. We are bringing this right to your attention here, separately from the rest of this notice,
            because that is how it should be presented.
          </p>
          <p>
            A right to data portability does not apply to this processing, because that right is tied to consent- or
            contract-based processing, not to the legitimate-interest basis proposed in{" "}
            <SectionRef order={P} id="legal-basis" />. You also have the right to lodge a complaint with a data protection
            supervisory authority. To exercise any of these rights, write to <span className="c-mono">{CONTACT_ADDRESS}</span>.
          </p>
        </LegalSection>

        <LegalSection order={P} id="required" title="Is giving us this information required?">
          <p>
            No. If you do not send us this information, we simply will not be able to answer your request or consider the
            symbol you are asking about.
          </p>
        </LegalSection>

        <LegalSection order={P} id="automated" title="Automated decisions">
          <p>
            We do not use automated decision-making or profiling based on this information. A person reads every request.
          </p>
        </LegalSection>

        <LegalSection order={P} id="access-logs" title="Server access logs (all visitors, not only requesters)">
          <p>
            Separately from the mail contact above: reaching this website at all produces a standard web-server access log
            entry (documented in our security policy), including the visiting address, kept for a limited, bounded window
            and used only to operate and secure the Service — not to identify individual visitors for any other purpose.
          </p>
        </LegalSection>

        <LegalSection order={P} id="changes" title="Changes to this notice">
          <p>
            We may update this notice; the version published at the time you write to us governs that request.
          </p>
        </LegalSection>
      </article>
    </main>
  );
}
