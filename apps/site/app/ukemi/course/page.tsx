import type { Metadata } from "next";
import Link from "next/link";
import { join } from "node:path";
import { loadUkemiCourse } from "@/lib/ukemi-course-load";

// Static server component. DIGIT-FREE head (honesty lint). The course facts below are read at build from the committed,
// hashed copy of the course report (apps/site/data/ukemi-course.json) through a fail-closed loader; nothing is typed by hand.
export const metadata: Metadata = {
  title: "Ukemi — calibration course · MONARK",
  description:
    "The Ukemi calibration course on one recorded lending episode: pre-registered hypotheses, their verdicts as reported, the " +
    "calibration points per stratum and the report digests. Never a probability of being right.",
};

export default function UkemiCourse() {
  const course = loadUkemiCourse(join(process.cwd(), "..", ".."));
  const yn = (v: string): string => (v === "OUI" ? "yes" : v === "NON" ? "no" : "under_calib");
  return (
    <main className="c-main">
      <section className="c-section">
        <div className="c-label">
          <Link href="/ukemi">Ukemi</Link> · calibration course · {course.event_id} · closed through its offline steps
        </div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
          One recorded lending episode, replayed offline from recorded reads: the book at a block, the realized oracle path, the
          scores, then the pre-registered hypotheses. Verdicts are test outcomes at a stated level, as reported by the course tool
          (sha256 <span className="c-mono">{course.tool_sha256.slice(0, 16)}…</span>, report digest{" "}
          <span className="c-mono">{course.body_digest.slice(0, 16)}…</span>). One stratum can be committed to the served class; the
          commit is the next step. Never a probability of being right.
        </p>
        <div className="c-board" style={{ marginTop: 12 }}>
          <div className="c-board-scroll">
            <table className="c-table">
              <thead>
                <tr>
                  <th className="c-label">stratum</th>
                  <th className="c-label c-num">calibration points</th>
                  <th className="c-label c-num">covered / trials (exchangeability)</th>
                  <th className="c-label">verdict</th>
                </tr>
              </thead>
              <tbody>
                {course.strata.map((x) => (
                  <tr key={x.stratum}>
                    <td>stratum {x.stratum}{x.served ? " · served" : ""}</td>
                    <td className="c-num">{x.n}</td>
                    <td className="c-num">{x.covered !== null && x.trials !== null ? `${String(x.covered)} / ${String(x.trials)}` : "—"}</td>
                    <td>{yn(x.verdict)}{x.level !== null ? ` (level ${x.level})` : ""}</td>
                  </tr>
                ))}
                <tr>
                  <td>pooled class A</td>
                  <td className="c-num">{course.pooled.n}</td>
                  <td className="c-num">{course.pooled.covered} / {course.pooled.trials}</td>
                  <td>{yn(course.pooled.verdict)} (level {course.pooled.level}, reported outside the condition)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 10 }}>
          Multi-call liquidations, positions liquidated by more than one call (threshold {course.h4.threshold}): {course.h4.class_a.multi_call} of{" "}
          {course.h4.class_a.n} in class A → {yn(course.h4.class_a.verdict)}; {course.h4.all.multi_call} of {course.h4.all.n} across all
          liquidated → {yn(course.h4.all.verdict)}, as pre-registered. Served oracle value in the on-chain series:{" "}
          {yn(course.h6.verdict)}, lag at most {course.h6.max_lag_bound} over {course.h6.n_updates} updates. Population:{" "}
          {course.h5.population} mono-collateral positions ({course.h5.meets ? "meets" : "below"} the {course.h5.k} floor). Clause of the
          investor decision: no stratum served in no, {course.clause_359.unresolved} unresolved labels, condition{" "}
          {course.clause_359.condition_satisfied ? "satisfied" : "not satisfied"}.
        </p>
      </section>
    </main>
  );
}
