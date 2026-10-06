import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadUkemiCourse } from "@/lib/ukemi-course-load";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { buildCourseView } from "@/lib/ukemi-course-view";
import { loadHarnessServed } from "@/lib/harness-served-load";
import {
  METHOD_STEPS,
  IS_NOT_LIST,
  LIMITS,
  REGION_NOTE,
  LIQ_CONDITIONAL_SENTENCE,
  BAR_UPPER_LABEL,
  BAR_YHAT_LABEL,
  BAR_FLOOR_LABEL,
  UKEMI_ROUTE,
  UKEMI_COURSE_ROUTE,
} from "@/lib/ukemi-copy";
import { docsRepoRoot, resultById } from "@/lib/docs-references-load";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, Cite, RefList, PrevNext, docsReferences } from "@/components/docs/doc-kit";
import { EligibleSchema, UpperBoundSchema, StrataSchema } from "@/components/docs/schemas/ukemi";

// /docs/ukemi (server component). Ukemi's status and served note are read from the fleet register; the method steps, limits
// and the served sentences from lib/ukemi-copy.ts (the served ones byte-identical to the harness, pinned by a root test); the
// course, stratum by stratum, from the committed, hashed course report and the served state of the class (the same loaders
// and view as /ukemi/course); the served clauses of the class from the committed harness facts. No count is typed.
export const metadata: Metadata = {
  title: "Ukemi · Docs · MONARK",
  description:
    "Eligible is not liquidated. Ukemi reads a lending book at a block and the oracle path, takes the most liquidable in one call as its prediction, scores the excess, and calibrates a conformal upper bound per stratum, abstaining below the floor.",
};

export default function DocsUkemiPage() {
  const root = docsRepoRoot();
  const ukemi = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (ukemi === undefined || ukemi.status !== "built") throw new Error("docs ukemi: Ukemi is not a built agent of the register (fail-closed)");
  const course = loadUkemiCourse(root);
  const servedState = loadUkemiServed(root);
  const view = buildCourseView(course, servedState);
  const harness = loadHarnessServed(root);
  const liqClass = harness.classes.find((c) => c.class_id === servedState.served_class);
  if (liqClass === undefined) throw new Error("docs ukemi: the served class of the course is not a class of the served harness (fail-closed)");
  const refs = docsReferences();
  const eligible = resultById(refs, "eligible-not-loss");
  const typeWise = resultById(refs, "type-wise");
  const strata = course.strata.map((s, i) => {
    const outcome = view.rows[i]?.outcome ?? "";
    return {
      label: `stratum ${String(s.stratum)}`,
      range: view.rows[i]?.range ?? "",
      n: s.n,
      floor: s.n_min,
      meetsFloor: s.meets_floor,
      outcome: s.meets_floor ? `exchangeability test with the design episode: ${outcome}` : outcome,
    };
  });
  const toc = [
    { id: "question", label: "The question" },
    { id: "reads", label: "What Ukemi reads" },
    { id: "score", label: "The prediction, the score, the bound" },
    { id: "calibration", label: "Calibration, stratum by stratum" },
    { id: "course", label: "The course" },
    { id: "served", label: "What is served today" },
    { id: "engine", label: "The engine underneath" },
    { id: "limits", label: "Limits, and what Ukemi is not" },
    { id: "sources", label: "Sources" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · the pieces · Ukemi" title="Eligible is not liquidated." pill={<StatusPill status={ukemi.status} />}>
        <p>
          Ukemi measures liquidation exposure on one lending venue: the lending book read at one declared block, the oracle price path
          the protocol actually consulted, and the difference between what a stress test flags and what gets liquidated. Once a
          stratum is committed, the gate hands back an upper bound on the amount liquidated, per stratum. Until then it abstains, and
          says so on the wire.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="question" title="The question">
        <p>
          A stress test on a lending book usually reports the debt that becomes eligible for liquidation when a price falls. That is
          not the amount that gets liquidated, and neither is a loss. Positions are liquidated in parts and re-buffer after each call;
          a deficit is left only when something breaks the price path.
        </p>
        <Figure caption={<>Three quantities a stress test tends to merge. An illustration: the widths carry no value.</>}>
          <EligibleSchema />
        </Figure>
        <Callout title={<>The result, after <Cite refId={eligible.ref} />, {eligible.locator}</>}>
          <p>{eligible.statement}</p>
        </Callout>
      </DocSection>

      <DocSection id="reads" title="What Ukemi reads">
        <ol className="d-steps">
          {METHOD_STEPS.map((s) => (
            <li key={s.name}>
              <strong>{s.title}.</strong> {s.detail}
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="score" title="The prediction, the score, the bound">
        <p>
          For each account, the prediction y-hat is the most the protocol&rsquo;s own rule lets be liquidated in one call, taken at
          the first point where the recorded oracle path pushes the account past its threshold. The score is one-sided: how far the
          realized amount went above the prediction, and zero when it did not. So the margin measures the misses that cost, not the
          size of the prediction.
        </p>
        <Figure caption={<>The prediction, the score and the upper bound. The labels are those of the Ukemi page.</>}>
          <UpperBoundSchema upperLabel={BAR_UPPER_LABEL} yhatLabel={BAR_YHAT_LABEL} floorLabel={BAR_FLOOR_LABEL} />
        </Figure>
        <p>{REGION_NOTE}</p>
      </DocSection>

      <DocSection id="calibration" title="Calibration, stratum by stratum">
        <p>
          The accounts are cut into strata by the size of their prediction, with cuts fixed before the data. Each stratum gets its
          own split-conformal margin, and a stratum with too few calibration points abstains. One region per category of a taxonomy
          fixed in advance is a known construction:
        </p>
        <Callout title={<>The result, after <Cite refId={typeWise.ref} />, {typeWise.locator}</>}>
          <p>{typeWise.statement}</p>
        </Callout>
        <p>
          The floor under which a population abstains follows the analysis of prediction sets for grouped data (
          <Cite refId="dunn-hierarchical" />). The served gate states the terms of this class itself: {liqClass.clauses.join("; ")}.
          The score code was frozen, and the plan of the run written down, before any fresh data was read; what the run found is what
          the course page prints.
        </p>
      </DocSection>

      <DocSection id="course" title="The course">
        <p>
          The course ran the frozen method on one recorded episode, <code>{course.event_id}</code>, replayed offline from recorded
          reads. Each bar below is a stratum&rsquo;s count of fresh calibration points; the tick is its floor. The counts and the
          outcomes are read from the committed course report.
        </p>
        <Figure caption={<>The calibration course, stratum by stratum, from the committed, hashed course report.</>}>
          <StrataSchema strata={strata} unitNote={view.unit_note} />
        </Figure>
        {view.reading.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          Every hypothesis of the course, the oracle path, the reconciliation of the positions and the digests are on the{" "}
          <Link href={UKEMI_COURSE_ROUTE}>course page</Link>.
        </p>
      </DocSection>

      <DocSection id="served" title="What is served today">
        <p>{view.served_lead}</p>
        <p className="c-mono">{view.served_clause}</p>
        <p>{view.served_note}</p>
        <Callout tone="limit" title="The bound is conditional, and the condition is stated">
          <p>{LIQ_CONDITIONAL_SENTENCE}.</p>
        </Callout>
        <p>
          The register&rsquo;s served note for {ukemi.name}: <em>{ukemi.wiring.note}</em>.
        </p>
      </DocSection>

      <DocSection id="engine" title="The engine underneath">
        <p>
          Under the calibration, Ukemi&rsquo;s engine computes the clearing fixed point of a network of obligations: each node pays
          what it can, in rounds, until the payments settle (<Cite refId="eisenberg-noe" />). With default costs the fixed point need
          not be unique (<Cite refId="rogers-veraart" />), and conditions under which liquidation costs still leave a single
          equilibrium are known (<Cite refId="amini-uniqueness" />). When forced sales do not feed back into the price the book is
          marked at, the fixed point is simply the amount liquidable at the block; whether such a feedback exists on a given market is
          an empirical question (<Cite refId="cifuentes-ferrucci-shin" /> show how it arises when a market absorbs sales
          inelastically). Ukemi&rsquo;s calibration measures the realized side of it: eligible against liquidated, account by
          account.
        </p>
      </DocSection>

      <DocSection id="limits" title="Limits, and what Ukemi is not">
        <div className="d-cards">
          {LIMITS.map((l) => (
            <div key={l.title} className="d-card">
              <span className="d-card__title">{l.title}</span>
              <span className="d-card__body">{l.detail}</span>
            </div>
          ))}
        </div>
        <ul className="d-bullets">
          {IS_NOT_LIST.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p>
          The <Link href={UKEMI_ROUTE}>Ukemi page</Link> states the method and the served state in full.
        </p>
      </DocSection>

      <DocSection id="sources" title="Sources">
        <RefList refIds={["gatto-liquidation", "eisenberg-noe", "rogers-veraart", "amini-uniqueness", "vovk-mondrian", "dunn-hierarchical", "angelopoulos-bates-gentle", "qin-liquidations"]} />
      </DocSection>

      <PrevNext href="/docs/ukemi" />
    </article>
  );
}
