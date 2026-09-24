import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import { LegalSection } from "@/components/bell/legal";
import { TERMS_SECTIONS } from "@/lib/bell-legal";
import { loadBellLegal, siteRepoRoot } from "@/lib/bell-legal-load";
import { CONTACT_ADDRESS } from "@/lib/bell-contact";

// Static metadata only (no generateMetadata); digit-free (honesty lint §6b).
export const metadata: Metadata = {
  title: "Bell · terms of use · MONARK",
  description:
    "The terms of use of MONARK Bell: the service, what it will publish and what it does not, the licence of the published files (to be decided), prohibited uses, no warranty, limitation of liability, availability, symbol requests.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell/terms — the Terms of Use of MONARK Bell (lot SITE-LEGAL-1; decisions 146, 147, 148). The text is the validated
// draft TERMS-OF-USE-draft.md (the lawyer's GO "as drafted", decision 147), VERBATIM except for the reasons below, every
// deviation listed with its reason in the lot report: (1) notes to the lawyer and cross-references to draft files are
// removed (a draft file name becomes the served route that carries the same text); (2) the licence of the published
// files is not chosen here: the visible placeholder `licence_option` stands for options A and B; (3) in sections one,
// two, five and seven and in three cells of the table, sentences in the present tense about a path that is not served
// yet are put in the future, obligations unchanged (orchestrator ruling of 2026-09-23 for sections one, five and the
// cells); (4) the table "Words we do not use, and why" is read from the committed, hashed data file through
// lib/bell-legal-load.ts, because it names the words the site gates refuse; (5) no country (decision 94): the publisher
// identity fields and the governing law stay visible placeholders; (6) factual exactness: the table's second
// introductory sentence is replaced by the version measured true on the Service's pages, read from the same data
// file (orchestrator ruling TERMS-WORDS-SENTENCE-1 of 2026-09-23; to be validated by the lawyer). The contact address is the box created by the investor (lib/bell-contact.ts),
// shown as text. Section numbers and references come from lib/bell-legal.ts, never typed. Two validated phrases carry a
// word a site gate refuses in any other context, quoted in a negation; each is masked by a closed, load-bearing
// exemption naming the exact phrase (vocab-banned.json site.exemptPhrases; the LICIT list of
// test/public-surfaces-honesty.test.ts), accepted by orchestrator ruling of 2026-09-23, and must stay on one physical
// line below.
export default function BellTermsPage() {
  const legal = loadBellLegal(siteRepoRoot());
  const T = TERMS_SECTIONS;

  return (
    <main className="c-main">
      <div className="c-hero c-hero--single">
        <div>
          <span className="c-label">terms of use · /bell/terms</span>
          <h1 className="c-h1" style={{ marginTop: 10 }}>
            Terms of Use — MONARK Bell
          </h1>
          <p className="c-lede" style={{ marginTop: 12 }}>
            Last updated: <Placeholder name="terms_published_date" state="to be published" />.
          </p>
        </div>
      </div>

      <article className="c-legal">
        <LegalSection order={T} id="about" title="About this Service">
          <p>
            MONARK Bell ("<b>Bell</b>", "<b>the Service</b>") is published by{" "}
            <Placeholder name="legal_entity" state="to be decided" />, a <Placeholder name="legal_form" state="to be decided" />{" "}
            ("<b>we</b>", "<b>us</b>"). Bell will publish public, signed, recomputable facts about the relationship between
            tokenized securities and their underlying reference prices, together with the method used to compute them. It
            is a witness: it will record and re-publish what can be independently recomputed from public inputs. It does not
            manage money, does not place orders, and does not rate, rank, or recommend any instrument, issuer, trading
            venue, or course of action.
          </p>
          <p>
            By accessing or using this website or the files it publishes (the "<b>published files</b>"), you agree to these
            Terms of Use. If you do not agree, do not use the Service.
          </p>
        </LegalSection>

        <LegalSection order={T} id="publish" title="What we publish, and what we do not">
          <ul>
            <li>
              We will publish computed facts (session gaps, halt deltas, volume-versus-cap ratios, supply reconciliation,
              and related residuals), each traceable to a stated definition and, where applicable, an underlying public
              input.
            </li>
            <li>
              Every published record will be part of an append-only, hash-chained, and digitally signed timeline. The
              signature attests that the record was published by us at that time; it does not attest that the underlying
              fact is correct. Anyone will be able to recompute a record from the same public inputs and compare it to
              what we published.
            </li>
            <li>
              We will publish abstentions and residuals as such, wherever the method cannot produce a reliable number,
              rather than substituting an estimate.
            </li>
            <li>
              We do not republish the underlying reference closing price itself; only the computed gap will be published
              (see <Link href="/bell#conditions">/bell</Link>, "Replay requires your own reference-close licence"). A third
              party who wants to replay a computation end-to-end needs its own licence for that reference data.
            </li>
          </ul>
        </LegalSection>

        <LegalSection order={T} id="licence" title="Licence to use the published files">
          <p>
            <Placeholder name="licence_option" state="to be decided" />
          </p>
        </LegalSection>

        <LegalSection order={T} id="prohibited-uses" title="Prohibited uses">
          <p>You must not:</p>
          <ul>
            <li>
              present any fact we publish as advice, a recommendation, a rating, a certification, or an assurance of
              quality, safety, or investment merit;
            </li>
            <li>
              state or imply that we are affiliated with, endorsed by, or acting on behalf of any issuer, trading venue,
              curator, or data provider, or that any issuer, trading venue, curator, or data provider is affiliated with,
              endorsed by, or acting on behalf of us;
            </li>
            <li>
              present a signed record as if the signature certified the underlying fact rather than only its origin;
            </li>
            <li>
              use the Service, or the published files, to build a private or non-public measurement that is described to
              others as coming from us;
            </li>
            <li>interfere with, overload, or attempt to circumvent rate limits or access controls on the Service.</li>
          </ul>
        </LegalSection>

        <LegalSection order={T} id="no-warranty" title="No warranty">
          <p>
            The Service and the published files are provided "as is" and "as available," without warranty of any kind,
            express or implied, including without limitation any warranty of accuracy, completeness, merchantability,
            fitness for a particular purpose, or non-infringement. We do not represent that the Service will be
            uninterrupted or error-free, or that every fact we publish is free of mistakes, gaps, or delay. Where our
            method cannot produce a reliable fact, we will say so (an abstention or a residual) instead of guessing.
          </p>
        </LegalSection>

        <LegalSection order={T} id="liability" title="Limitation of liability">
          <p>
            To the maximum extent permitted by applicable law, we are not liable for any indirect, incidental, special,
            consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or in
            connection with your access to or use of, or inability to access or use, the Service or the published files,
            even if we have been advised of the possibility of such damages.
          </p>
        </LegalSection>

        <LegalSection order={T} id="availability" title="Availability">
          <p>
            We will publish our own record of when the Service was reachable ("published uptime"). This is a factual
            record, not a promise about future availability. We do not commit to any particular response time, recovery
            time, or level of service.
          </p>
        </LegalSection>

        <LegalSection order={T} id="symbol-requests" title="Symbol requests">
          <p>
            You may ask us to add a symbol to what we publish, including a request tied to your own interest in that
            symbol. If we add it:
          </p>
          <ul>
            <li>
              it is measured and published in exactly the same way, and to exactly the same public audience, as every
              other symbol we publish;
            </li>
            <li>no measurement made for the Service is kept private;</li>
            <li>
              the fact that a symbol was added on request is itself disclosed, because a requester-driven addition is a
              potential source of selection bias that a reader should be able to see;
            </li>
            <li>
              the requester has no influence over what is measured or published once a symbol is added, beyond having
              asked for it.
            </li>
          </ul>
        </LegalSection>

        <LegalSection order={T} id="no-account" title="No account, no payment today">
          <p>
            Using the Service today does not require an account, a password, or a payment. Programmatic access with its
            own key and usage limits is planned for a later stage and is <b>not available yet</b>; a separate notice will
            apply once it exists, including whatever acceptance step our lawyer determines is appropriate at that time.
          </p>
        </LegalSection>

        <LegalSection order={T} id="changes" title="Changes to these Terms">
          <p>
            We may update these Terms. The version published on the Service at the time of your access governs that
            access. Material changes will be dated at the top of this page.
          </p>
        </LegalSection>

        <LegalSection order={T} id="governing-law" title="Governing law and jurisdiction">
          <p>
            <Placeholder name="governing_law" state="to be decided" />
          </p>
        </LegalSection>

        <LegalSection order={T} id="contact" title="Contact">
          <p>
            Questions about these Terms: <span className="c-mono">{CONTACT_ADDRESS}</span>.
          </p>
        </LegalSection>

        <hr style={{ marginTop: 32, borderColor: "var(--rule)" }} />

        <section className="c-legal-section" id="words" aria-labelledby="h-words">
          <h2 className="c-h2" id="h-words">
            Words we do not use, and why
          </h2>
          <p>
            On every public surface of this Service (including these Terms), we avoid the following words because they
            would overstate what we do. {legal.terms_words_scope_sentence}
          </p>
          <div className="c-board" style={{ marginTop: 12 }}>
            <div className="c-board-scroll">
              <table className="c-table">
                <thead>
                  <tr>
                    <th className="c-label">Word we avoid</th>
                    <th className="c-label">Why</th>
                    <th className="c-label">What we say instead</th>
                  </tr>
                </thead>
                <tbody>
                  {legal.terms_words_table.map((r) => (
                    <tr key={r.avoid}>
                      <td>{r.avoid}</td>
                      <td>{r.why}</td>
                      <td>{r.instead}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
