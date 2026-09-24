import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadContract } from "@/lib/load-contract";
import { loadGateEnums } from "@/lib/gate-enums";
import { BT_SERVED_RULE } from "@/lib/sim";
import { DOCS_ACTION_COMMIT, DOCS_ACTION_DEFER, DOCS_ACTION_ABSTAIN } from "@/lib/docs-gate";
import { docsRepoRoot } from "@/lib/docs-references-load";
import { DocHeader, Toc, DocSection, Figure, PrevNext } from "@/components/docs/doc-kit";
import { ConceptMapSchema } from "@/components/docs/schemas/glossary";

// /docs/glossary (server component). One definition per word, as the documentation uses it. The contract titles are read from
// schemas/, the answer words and the reason count from the frozen enum, the budget rule is the served one, and the two register
// labels are read from the fleet register. The definitions themselves are JSX text of this page (scanned by the honesty lint).
export const metadata: Metadata = {
  title: "Glossary · Docs · MONARK",
  description:
    "The words of the MONARK engine, each defined once as the documentation uses it: region, coverage, exchangeability, nonconformity score, task class, reason code, the budget, the answers, attestation and the labels of the register.",
};

export default function DocsGlossaryPage() {
  const root = docsRepoRoot();
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi").title;
  const verdict = loadContract(root, "coverage-verdict.schema.json", "Hikae").title;
  const decision = loadContract(root, "gate-decision.schema.json", "Hikae").title;
  const { actions, reasons } = loadGateEnums(root);
  const builtWord = FLEET_AGENTS.find((a) => a.status === "built")?.status ?? "";
  const upcomingWord = FLEET_AGENTS.find((a) => a.status === "upcoming")?.status ?? "";
  const toc = [
    { id: "map", label: "The words on one map" },
    { id: "decision", label: "The decision" },
    { id: "evidence", label: "The evidence" },
    { id: "record", label: "The record" },
    { id: "labels", label: "The labels" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · glossary" title="The words of the engine.">
        <p>
          Each word is defined once, the way these pages use it. Where a word is also a key of a frozen contract, the definition says
          what the contract carries, never more.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="map" title="The words on one map">
        <Figure caption={<>The main words, placed where they act in one decision. The contract titles are read from the frozen schemas.</>}>
          <ConceptMapSchema predictionTitle={prediction} verdictTitle={verdict} decisionTitle={decision} />
        </Figure>
      </DocSection>

      <DocSection id="decision" title="The decision">
        <dl className="d-kv">
          <dt>answer</dt>
          <dd>
            One of {actions.join(", ")}: the closed list of the frozen contract <code>{decision}</code>. Never a score, never a
            probability of being right.
          </dd>
          <dt>{actions[DOCS_ACTION_COMMIT] ?? ""}</dt>
          <dd>The intended act lies in a region small enough to act on, and the budget is not below the caller&rsquo;s floor.</dd>
          <dt>{actions[DOCS_ACTION_DEFER] ?? ""}</dt>
          <dd>The region is too large to act on yet; the gate waits while its decision window is open.</dd>
          <dt>{actions[DOCS_ACTION_ABSTAIN] ?? ""}</dt>
          <dd>The gate states no region it stands behind, says why, and invents no success. A first-class answer.</dd>
          <dt>reason code</dt>
          <dd>One of the {reasons.length} codes of a closed list attached to each decision; one of them is the commit, covered.</dd>
          <dt>budget, B_t</dt>
          <dd>
            A depletable authorization budget, the right to act, metered. {BT_SERVED_RULE}. Not a return, not a deposit, not an oracle.
          </dd>
          <dt>floor</dt>
          <dd>The lowest budget at which the caller lets the gate commit; below it, the gate abstains with the reason budget_exhausted.</dd>
          <dt>decision window</dt>
          <dd>The time during which a deferral is still an answer; once it closes, a region too large to act on becomes an abstention.</dd>
        </dl>
      </DocSection>

      <DocSection id="evidence" title="The evidence">
        <dl className="d-kv">
          <dt>prediction</dt>
          <dd>
            The reading an upstream predictor gives, in the frozen contract <code>{prediction}</code>: a label or a point, a task class
            and the id of the predictor.
          </dd>
          <dt>nonconformity score</dt>
          <dd>How wrong a predictor was on a past case. The caller can supply its own scores to the gate.</dd>
          <dt>calibration</dt>
          <dd>The scores of past cases a region is built from, kept per task class and predictor, with a digest the decision carries.</dd>
          <dt>q-hat, the margin</dt>
          <dd>The score at the rank fixed by the target coverage, among the calibration scores.</dd>
          <dt>region</dt>
          <dd>
            What the gate states around a prediction, in the frozen contract <code>{verdict}</code>: a set of labels or an interval,
            built to contain the realized outcome at the target rate, on average, under exchangeability.
          </dd>
          <dt>coverage</dt>
          <dd>The long-run rate at which the stated region contains the realized outcome. Conformal coverage, nothing else: it is not a check of how much of anything was inspected.</dd>
          <dt>miscoverage level</dt>
          <dd>The rate of misses the target allows; the target coverage is one minus it.</dd>
          <dt>exchangeability</dt>
          <dd>The order of the past cases and the next one carries no information: their joint distribution does not change when they are reordered. The assumption under which the target rate holds.</dd>
          <dt>marginal</dt>
          <dd>Averaged over the calibration and the new case, never conditional on one particular input.</dd>
          <dt>task class</dt>
          <dd>With a predictor id, the key one region is locked to. Every other population abstains.</dd>
          <dt>stratum</dt>
          <dd>A category of cases fixed before the data, such as a range of the predicted amount, that gets its own region.</dd>
          <dt>floor of a stratum</dt>
          <dd>The fewest calibration points a stratum needs before it states a region; below it, it abstains with under_calib.</dd>
          <dt>upper bound</dt>
          <dd>A region that is an open floor up to a margin above the prediction: the shape Ukemi&rsquo;s liquidation class returns once a stratum is committed.</dd>
          <dt>quantile tracker</dt>
          <dd>An online threshold that moves after each window from the realized outcome, with a step size that decays. It is Narabi&rsquo;s; the gate does not read it.</dd>
        </dl>
      </DocSection>

      <DocSection id="record" title="The record">
        <dl className="d-kv">
          <dt>testimony</dt>
          <dd>An attested reading: the exact bytes, their hash and the named residual hypotheses. Origin and bytes, never truth.</dd>
          <dt>residual hypothesis</dt>
          <dd>A named assumption a testimony still rests on. The list is closed and travels into the verdict.</dd>
          <dt>residual, in a record</dt>
          <dd>A named reason a collector could not produce a clean fact, counted in the published state, never hidden.</dd>
          <dt>hash chain</dt>
          <dd>Each published line carries the hash of the line before it, so a rewrite shows at recomputation: detectable, never certified.</dd>
          <dt>signature</dt>
          <dd>A check that a line comes from the holder of a key and is intact. It attests origin, not truth.</dd>
          <dt>anchor</dt>
          <dd>A public timestamp of a manifest: it shows that its bytes existed before a Bitcoin block, and nothing more.</dd>
          <dt>off-hours gap</dt>
          <dd>How far the on-chain price per share of a tokenized equity strays from the reference close, per session.</dd>
          <dt>cash leg</dt>
          <dd>The two readings of the reference close that must agree before a gap is computed.</dd>
        </dl>
      </DocSection>

      <DocSection id="labels" title="The labels">
        <dl className="d-kv">
          <dt>{builtWord}</dt>
          <dd>
            A piece or an application with a study, a served surface that consumes its output, and an integration test that replays the
            composition. The register says which.
          </dd>
          <dt>{upcomingWord}</dt>
          <dd>Named, not delivered: no served path, no metric claimed.</dd>
          <dt>served</dt>
          <dd>Reachable today by a third party, on a public host or over the public endpoint, without an account.</dd>
          <dt>design target</dt>
          <dd>What the engine is built toward, never presented as done: see the <Link href="/docs/use-cases">use cases</Link>.</dd>
        </dl>
      </DocSection>

      <PrevNext href="/docs/glossary" />
    </article>
  );
}
