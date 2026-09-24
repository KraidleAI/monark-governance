import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS, countWord } from "@/lib/fleet";
import { loadGateEnums } from "@/lib/gate-enums";
import { loadContract } from "@/lib/load-contract";
import { loadHarnessServed, loadH5Trace } from "@/lib/harness-served-load";
import { BT_SERVED_RULE, BT_FLOOR_RULE, decisionColorVar } from "@/lib/sim";
import { MEASURED_CLASS_RESERVE } from "@/lib/how-copy";
import { ACTION_GLOSSES, REASON_DOCS, CHAMBERS } from "@/lib/docs-gate";
import { docsRepoRoot, resultById } from "@/lib/docs-references-load";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, JsonBlock, Cite, RefList, PrevNext, docsReferences } from "@/components/docs/doc-kit";
import { DecisionPathSchema, PolicySchema, QuantileSchema, StrandsSchema } from "@/components/docs/schemas/gate";

// /docs/gate (server component). The action words and the reason codes are read from the frozen enum (lib/gate-enums.ts);
// the contract titles and keys from schemas/; the served clauses from the committed, hashed harness facts; the recorded
// decisions and the one recorded call from the trace committed under fixtures/ (recorded over the MCP transport of an
// in-process server, bound to the loopback address); the quoted results from the committed bibliography. The gate's status
// is the register's word for Hikae.
export const metadata: Metadata = {
  title: "The gate · Docs · MONARK",
  description:
    "The MONARK gate: how a reading becomes a region, how a closed policy turns the region and the budget the caller carries into commit, defer or abstain, and what the gate never says.",
};

export default function DocsGatePage() {
  const root = docsRepoRoot();
  const { actions, reasons } = loadGateEnums(root);
  const decision = loadContract(root, "gate-decision.schema.json", "Hikae");
  const verdict = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi");
  const served = loadHarnessServed(root);
  const h5 = loadH5Trace(root);
  const refs = docsReferences();
  const split = resultById(refs, "split-quantile");
  const beyond = resultById(refs, "beyond-exchangeability");
  const reject = resultById(refs, "reject-option");
  const gate = FLEET_AGENTS.find((a) => a.role === "gate");
  if (gate === undefined) throw new Error("docs gate: the register holds no gate");
  const recordedClass = (h5.btcDir.request.prediction as { task_class?: unknown } | undefined)?.task_class;
  const btc = served.classes.find((c) => c.class_id === recordedClass);
  if (btc === undefined) throw new Error("docs gate: the class of the recorded call is not a served class (fail-closed)");
  const toc = [
    { id: "answers", label: "The answers" },
    { id: "path", label: "One decision, end to end" },
    { id: "building-a-region", label: "How a region is built" },
    { id: "policy", label: "The closed policy" },
    { id: "budget", label: "The budget the caller carries" },
    { id: "attestation", label: "Attestation, and the three strands" },
    { id: "recorded", label: "Recorded decisions" },
    { id: "reasons", label: "The reason codes" },
    { id: "limits", label: "What the gate says, and what it never says" },
    { id: "sources", label: "Sources" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · the gate" title="Commit, defer or abstain. Never a probability." pill={<StatusPill status={gate.status} />}>
        <p>
          {gate.name} is the gate. An upstream predictor gives a reading. The gate conforms it into a region at a target coverage,
          then a closed policy reads the region and the budget the caller carries and returns one word. It reports a region you can
          audit and a budget you can watch, never how likely it is to be right.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="answers" title="The answers">
        <p>
          The gate has {countWord(actions.length)} answers, a closed list in the frozen contract <code>{decision.title}</code>. Each one
          is an answer, including the last.
        </p>
        <div className="d-cards">
          {actions.map((a, i) => (
            <div key={a} className="d-card">
              <span className="d-card__title c-mono" style={{ color: decisionColorVar(i) }}>
                {a}
              </span>
              <span className="d-card__body">{ACTION_GLOSSES[i] ?? ""}</span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="path" title="One decision, end to end">
        <p>
          A decision passes through {countWord(CHAMBERS.length)} stages. Each stage can end it, and when it does, it keeps what it
          refused with a reason code from a closed list. The commits run on to the act, and they are kept too: both threads can be
          replayed from the recorded bytes.
        </p>
        <Figure
          caption={
            <>
              One decision, end to end, adapted from the pitch deck&rsquo;s airlock. The action words and the reason codes are read
              from the frozen contract; which stage emits which code is this page&rsquo;s reading of the policy below.
            </>
          }
        >
          <DecisionPathSchema actions={actions} reasons={reasons} />
        </Figure>
        <p>
          Before the policy runs, the adapter that reads the input can already answer: a testimony that is missing when the class
          requires one, refused by its verifier, or not bound to the prediction ends the decision there, with its code.
        </p>
      </DocSection>

      <DocSection id="building-a-region" title="How a region is built">
        <p>
          The region is conformal. Take the predictor&rsquo;s track record on calibration points it did not see, score how wrong it
          was on each, and keep the score at a rank fixed by the target coverage. For a new reading, every answer whose score is at
          most that margin is in the region.
        </p>
        <Figure caption={<>How a region is built. An illustration of the method: no data, no value is drawn.</>}>
          <QuantileSchema />
        </Figure>
        <Callout title={<>The result, after <Cite refId={split.ref} />, {split.locator}</>}>
          <p>{split.statement}</p>
        </Callout>
        <p>
          The region is a set of labels for a classification (a direction, a venue, a yes or a no) or an interval for a regression (a
          liquidable amount, a curve residual). One label kept is small enough to act on; every label kept means nothing is ruled out
          yet. An interval acts when its width is under the caller&rsquo;s threshold and the intended value lies inside it. The
          prediction the gate conforms is the frozen <code>{prediction.title}</code>, and what it states is the frozen{" "}
          <code>{verdict.title}</code>: {verdict.required.join(", ")}.
        </p>
      </DocSection>

      <DocSection id="policy" title="The closed policy">
        <p>
          The policy is a closed predicate with a declared order of priority. The schema draws the order the code declares for a set
          of labels; for an interval the code declares another order: an interval of zero width abstains with under_calib first,
          then the budget, then the width, and the intended value last. Its first No ends the decision. When the region is too
          large, the gate waits while the decision window is open and abstains once it has closed: waiting is an answer only while
          there is time.
        </p>
        <Figure caption={<>The closed policy for a set of labels, in its declared order of priority. The codes are the frozen contract&rsquo;s.</>}>
          <PolicySchema actions={actions} reasons={reasons} />
        </Figure>
        <p>
          Abstention is a first-class answer, and the idea is old: <Cite refId={reject.ref} /> described the tradeoff between errors and
          rejections, where some would-be correct answers are also turned away. The gate makes that tradeoff explicit, per class, with
          a stated coverage instead of a hunch.
        </p>
      </DocSection>

      <DocSection id="budget" title="The budget the caller carries">
        <p>
          {BT_SERVED_RULE}; {BT_FLOOR_RULE}. The budget is a right to act, metered: not a return, not a deposit, not an oracle. Every
          decision carries it back in <code>remaining_budget</code>, and profit and loss never enter the policy.
        </p>
        <p>
          The name of the budget borrows its vocabulary from risk-controlling prediction sets (<Cite refId="bates-rcps" />). That is
          the origin of the word only: what the served gate does with the budget is the rule above, nothing more. See also the{" "}
          <Link href="/token">token page</Link>.
        </p>
      </DocSection>

      <DocSection id="attestation" title="Attestation, and the three strands">
        <p>
          An attested conformal decision joins three strands. An attestation carries bytes, a hash and named residual hypotheses:
          origin, never truth. The conformal region decides. The budget, carried by the caller, meters the right to act. On the served
          gate the attestation is optional: {served.honesty.attested.join("; ")}.
        </p>
        <Figure
          caption={
            <>
              Three strands, one decision, adapted from the pitch deck. The keys of the decision are read from the frozen schema{" "}
              <code>{decision.title}</code>.
            </>
          }
        >
          <StrandsSchema decisionTitle={decision.title} decisionKeys={decision.required} />
        </Figure>
      </DocSection>

      <DocSection id="recorded" title="Recorded decisions">
        <p>
          These decisions were recorded over the MCP transport of an in-process server bound to {h5.bind}, and are replayed by an
          integration test. Each row is read from the committed trace; none is typed.
        </p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">step</th>
                <th className="c-label">tool</th>
                <th className="c-label">task class</th>
                <th className="c-label">answer</th>
                <th className="c-label">reason</th>
              </tr>
            </thead>
            <tbody>
              {h5.decisions.map((d) => (
                <tr key={d.step}>
                  <td className="c-mono">{d.step}</td>
                  <td className="c-mono">{d.tool}</td>
                  <td className="c-mono">{d.task_class}</td>
                  <td className="c-mono" style={{ color: decisionColorVar(actions.indexOf(d.action)) }}>
                    {d.action}
                  </td>
                  <td className="c-mono">{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The class <code>{btc.class_id}</code> behind the recorded commit is served as {btc.clauses.join("; ")}. The answer it
          returned, as recorded:
        </p>
        <JsonBlock value={h5.btcDir.result} caption={<>structuredContent of the recorded gate call, as committed in the trace</>} />
      </DocSection>

      <DocSection id="reasons" title="The reason codes">
        <p>
          The frozen contract lists {reasons.length} codes, one closed list. A new reason needs a versioned revision of the
          contract, not a deploy. The codes below are read from the schema; the glosses are this page&rsquo;s.
        </p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">code</th>
                <th className="c-label">answer</th>
                <th className="c-label">stage</th>
                <th className="c-label">meaning</th>
              </tr>
            </thead>
            <tbody>
              {reasons.map((code) => {
                const doc = REASON_DOCS[code];
                if (doc === undefined) throw new Error(`docs gate: the frozen reason ${code} has no gloss (fail-closed)`);
                const chamber = CHAMBERS.find((c) => c.key === doc.chamber);
                return (
                  <tr key={code}>
                    <td className="c-mono">{code}</td>
                    <td className="c-mono" style={{ color: decisionColorVar(doc.tone) }}>
                      {actions[doc.tone] ?? ""}
                    </td>
                    <td>{chamber?.title ?? ""}</td>
                    <td>{doc.gloss}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="limits" title="What the gate says, and what it never says">
        <p>
          Coverage holds on average over exchangeable calibration data, at one minus the chosen miscoverage level. It is marginal: it
          is not conditional on the individual input, and the error of one committed act is not bounded by the level. Coverage
          conditional on one input cannot be promised in general (<Cite refId="vovk-conditional" />), which is why the gate keeps one
          region per task class and predictor, and why every other population abstains.
        </p>
        <Callout tone="limit" title={<>When the data are not exchangeable, <Cite refId={beyond.ref} />, {beyond.locator}</>}>
          <p>{beyond.statement}</p>
          <p>{MEASURED_CLASS_RESERVE}</p>
        </Callout>
        <p>
          The gate emits a decision; it never calls the tool it names. It holds no key, moves no fund and carries no score field,
          anywhere: a contract carrying a forbidden key throws instead of serialising.
        </p>
      </DocSection>

      <DocSection id="sources" title="Sources">
        <RefList refIds={["angelopoulos-bates-gentle", "vovk-conditional", "vovk-mondrian", "barber-beyond", "chow-reject", "bates-rcps"]} />
      </DocSection>

      <PrevNext href="/docs/gate" />
    </article>
  );
}
