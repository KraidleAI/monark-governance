import { CONTACT_ADDRESS, CONTACT_LABEL, MAIL_SUBJECT, mailBody, mailtoHref } from "@/lib/bell-contact";
import { CopyTemplate } from "@/components/bell/copy-template";

// The destination of the "request a symbol / early access" link: a section that ALWAYS lands somewhere — the
// address as text, the full template as text (copyable), and the one `mailto:` link of the site for readers
// whose browser has a mail handler. The template and the address come from lib/bell-contact.ts (single source,
// pinned by test/bell-contact.test.ts); nothing here is typed twice. Vocabulary: request a symbol / early access —
// never trial, plan or pricing.
export function BellRequestSection() {
  const lines = mailBody().split("\r\n");
  return (
    <section className="c-section" id="request-a-symbol" aria-labelledby="l-request">
      <h2 id="l-request" className="c-h2">{CONTACT_LABEL}</h2>
      <p className="c-muted">
        Write to <span className="c-mono">{CONTACT_ADDRESS}</span> with the subject{" "}
        <span className="c-mono">{MAIL_SUBJECT}</span> and the template below. No account, no form, no payment.
      </p>
      <pre className="c-mono c-small" style={{ whiteSpace: "pre-wrap", margin: "12px 0" }}>
        {lines.join("\n")}
      </pre>
      <p>
        <CopyTemplate text={mailBody()} />
        {" · "}
        <a className="c-mono" href={mailtoHref()}>
          open it in your mail client
        </a>
      </p>
    </section>
  );
}
