import type { Metadata } from "next";
import Link from "next/link";
import { join } from "node:path";
import { loadUkemiCourse } from "@/lib/ukemi-course-load";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { buildCourseView } from "@/lib/ukemi-course-view";
import { LIQ_H3_SENTENCE, UKEMI_ROUTE } from "@/lib/ukemi-copy";

// Static server component. DIGIT-FREE head (honesty lint). Every fact below is read at build from two committed, hashed
// files through fail-closed loaders — the course report (apps/site/data/ukemi-course.json) and the served state of the
// class (apps/site/data/ukemi-served.json) — and composed into words by lib/ukemi-course-view.ts; nothing is typed by
// hand. The report's own flag reads "meets the floor" (committable), never "served": what is served comes only from the
// served gate description. The verdict, the calibration points and the bound margin (qhat) of each row are shown in
// clear; the exchangeability test's p-values sit in a folded "verification" block, each with the gloss "conformal
// p-value, not a probability of being right"; the public account the zero-prediction rule counts is shown with its page
// on the chain's block explorer.
export const metadata: Metadata = {
  title: "Ukemi — calibration course · MONARK",
  description:
    "The Ukemi calibration course on one recorded lending episode: pre-registered hypotheses, their outcomes as reported, the " +
    "calibration points per stratum, the served state of the class and the report digests. Never a probability of being right.",
};

export default function UkemiCourse() {
  const root = join(process.cwd(), "..", "..");
  const v = buildCourseView(loadUkemiCourse(root), loadUkemiServed(root));
  return (
    <main className="c-main">
      <section className="c-section">
        <div className="c-label">
          <Link href={UKEMI_ROUTE}>Ukemi</Link> · {v.eyebrow}
        </div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          One recorded lending episode, replayed offline from recorded reads: the book at a block, the realized oracle path, the
          scores, then the pre-registered hypotheses. Outcomes are test results at a stated level, as reported by the course tool.
          Never a probability of being right.
        </p>
      </section>

      <section className="c-section">
        <div className="c-label">what is served</div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.served_lead}</p>
        <p className="mt-2 font-mono text-sm text-foreground">{v.served_clause}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.served_note}</p>
      </section>

      <section className="c-section">
        <div className="c-label">calibration per stratum, and exchangeability with the design episode</div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.unit_note}</p>
        <div className="c-board" style={{ marginTop: 12 }}>
          <div className="c-board-scroll">
            <table className="c-table">
              <thead>
                <tr>
                  <th className="c-label">stratum</th>
                  <th className="c-label">predicted amount</th>
                  <th className="c-label c-num">calibration points</th>
                  <th className="c-label c-num">bound margin (qhat)</th>
                  <th className="c-label c-num">covered / trials on the design episode</th>
                  <th className="c-label">outcome</th>
                  <th className="c-label c-num">liquidated · multi-call</th>
                </tr>
              </thead>
              <tbody>
                {v.rows.map((r) => (
                  <tr key={r.key}>
                    <td>{r.label}</td>
                    <td className="c-mono">{r.range}</td>
                    <td className="c-num">{r.points}</td>
                    <td className="c-num c-mono">{r.bound}</td>
                    <td className="c-num">{r.comparison}</td>
                    <td>{r.outcome}</td>
                    <td className="c-num">{r.liquidated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {v.reading.map((line) => (
          <p key={line} className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
            {line}
          </p>
        ))}
        <details className="text-sm text-muted-foreground" style={{ marginTop: 12 }}>
          <summary className="c-label" style={{ cursor: "pointer" }}>
            {v.verification_summary}
          </summary>
          <p style={{ marginTop: 8 }}>{v.verification_lead}</p>
          <ul style={{ marginTop: 6 }}>
            {v.verification.map((p) => (
              <li key={p.label}>
                {p.label} · <span className="c-mono">{p.value}</span> · {v.verification_gloss}
              </li>
            ))}
          </ul>
        </details>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          The gate carries this sentence with the class once a stratum is committed:
        </p>
        <p className="mt-2 font-mono text-sm text-foreground">{LIQ_H3_SENTENCE}</p>
      </section>

      <section className="c-section">
        <div className="c-label">the other pre-registered hypotheses</div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.multi_call}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.reconciliation}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.liquidated_amounts}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.oracle}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.oracle_anchor}</p>
        {v.oracle_bias === null ? null : (
          <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
            {v.oracle_bias}
          </p>
        )}
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.population}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.zero_rule}</p>
        {v.zero_rule_accounts.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>{v.zero_rule_accounts_lead}</p>
            <ul className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
              {v.zero_rule_accounts.map((a) => (
                <li key={a.address}>
                  <a href={a.href} className="c-mono break-all underline underline-offset-4" target="_blank" rel="noreferrer">
                    {a.address}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.labels}</p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.clause}</p>
      </section>

      <section className="c-section">
        <div className="c-label">digests</div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          report digest <span className="c-mono break-all">{v.report_digest}</span>
        </p>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>{v.report_digest_note}</p>
        <ul className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          {v.digests.map((d) => (
            <li key={d.label}>
              {d.label} <span className="c-mono break-all">{d.value}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>{v.digests_note}</p>
      </section>
    </main>
  );
}
