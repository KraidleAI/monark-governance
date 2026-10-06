import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadContract } from "@/lib/load-contract";
import { loadGateEnums } from "@/lib/gate-enums";
import { harnessRepoRoot, loadHarnessServed, loadByoTrace, loadH5Trace } from "@/lib/harness-served-load";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, JsonBlock, PrevNext } from "@/components/docs/doc-kit";
import { ReachSchema, ByoLoopSchema } from "@/components/docs/schemas/integrators";

// /docs/integrators (server component). Every value is READ: the served facts from the committed, hashed harness facts
// (apps/site/data/harness-served.json), the recorded requests and answers from the two traces committed under fixtures/
// (recorded over the MCP transport of an in-process server, bound to the loopback address), the contract keys from schemas/,
// all through the same fail-closed loaders as /integrators. The status pill is the register's word for the gate the harness
// serves. JSON blocks are one JSON.stringify call over a read object.
export const metadata: Metadata = {
  title: "Integrators · Docs · MONARK",
  description:
    "Reach the MONARK engine from any MCP-capable agent or over plain HTTP: the served tools, the one-line setup, a gate call and the bring-your-own loop as recorded over the transport, the frozen contracts, the refusals and the bounds.",
};

const STATE_WORDS: Readonly<Record<string, string>> = {
  synthetic: "synthetic fixture",
  none: "no calibration committed",
  committed: "committed",
};

export default function DocsIntegratorsPage() {
  const root = harnessRepoRoot();
  const served = loadHarnessServed(root);
  const byo = loadByoTrace(root);
  const h5 = loadH5Trace(root);
  const { reasons } = loadGateEnums(root);
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi");
  const decision = loadContract(root, "gate-decision.schema.json", "Hikae");
  const verdict = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const gate = FLEET_AGENTS.find((a) => a.role === "gate");
  if (gate === undefined) throw new Error("docs integrators: the register holds no gate");
  const { api, mcp, refusal, bounds } = served;
  const commands = `hermes mcp add ${mcp.server_name} --url ${mcp.url}\nopenclaw mcp add ${mcp.server_name} --url ${mcp.url} --transport ${mcp.remote_type}`;
  const recordedClass = (h5.btcDir.request.prediction as { task_class?: unknown } | undefined)?.task_class;
  const btc = served.classes.find((c) => c.class_id === recordedClass);
  if (btc === undefined) throw new Error("docs integrators: the class of the recorded call is not a served class (fail-closed)");
  const toc = [
    { id: "reach", label: "Reach the engine" },
    { id: "setup", label: "Add it in one line" },
    { id: "call", label: "A gate call, as recorded" },
    { id: "byo", label: "Bring your own calibration" },
    { id: "contracts", label: "What you send, what you get back" },
    { id: "classes", label: "The classes it serves" },
    { id: "refusals", label: "Refusals and bounds" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · integrators" title="The engine, reachable by your agent." pill={<StatusPill status={gate.status} />}>
        <p>
          The harness makes the gate callable over MCP and over a plain HTTP mirror. The endpoint is public and unauthenticated, with
          no availability commitment. What you send and what you get back are frozen contracts with closed keys, and they will not
          change without a versioned revision. Snapshot of the served harness as read at {served.read_at}, version {served.version}.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="reach" title="Reach the engine">
        <Figure caption={<>How an agent reaches the engine. The endpoints, the tools and their notes are read from the served harness; the answer is the frozen <code>{decision.title}</code>.</>}>
          <ReachSchema mcpUrl={mcp.url} apiUrl={api.url} tools={served.tools} decisionTitle={decision.title} />
        </Figure>
        <p>
          The server is listed in the MCP registry as <code>{served.registry.name}</code>, version {served.registry.version}, status{" "}
          {served.registry.status}. The HTTP mirror is described by <a href={`${api.url}${api.openapi_path}`}>{api.openapi_path}</a>{" "}
          (OpenAPI {api.openapi_version}). In the served words: {served.honesty.never_calls}
        </p>
      </DocSection>

      <DocSection id="setup" title="Add it in one line">
        <pre className="c-code">{commands}</pre>
        <p>
          Any other MCP client: point it at <code>{mcp.url}</code> ({mcp.remote_type}). The Accept header, as recorded against an
          in-process server on {byo.bind}: {byo.accept}
        </p>
      </DocSection>

      <DocSection id="call" title="A gate call, as recorded">
        <p>
          One request and its answer, recorded over the MCP transport of an in-process server on {h5.bind}. The class it names,{" "}
          <code>{btc.class_id}</code>, is served as {btc.clauses.join("; ")}.
        </p>
        <JsonBlock value={h5.btcDir.request} caption={<>you send (the arguments of the tool call)</>} />
        <JsonBlock value={h5.btcDir.result} caption={<>you get back (structuredContent)</>} />
      </DocSection>

      <DocSection id="byo" title="Bring your own calibration">
        <p>
          Two stateless calls. You calibrate on your own nonconformity scores, then gate your own prediction under them. The audit
          closes when the decision&rsquo;s <code>scores_sha256</code> equals the calibration&rsquo;s, with the same miscoverage level and quantile.
        </p>
        <Figure caption={<>The bring-your-own loop, with the digests and the answer read from the loop recorded over the transport.</>}>
          <ByoLoopSchema calibrateSha={byo.scores_sha256.calibrate} verdictSha={byo.scores_sha256.verdict} action={byo.decision.action} reason={byo.decision.reason} />
        </Figure>
        <JsonBlock value={byo.calibrate.request} caption={<>first call, calibrate: you send</>} />
        <JsonBlock value={byo.calibrate.result} caption={<>first call, calibrate: you get back (its label field is quoted below)</>} />
        <JsonBlock value={byo.gate.request} caption={<>second call, gate: you send</>} />
        <JsonBlock value={byo.gate.result} caption={<>second call, gate: you get back</>} />
        <Callout title="What the calibration means, as served">
          <p>{served.honesty.calibrate_label}</p>
        </Callout>
      </DocSection>

      <DocSection id="contracts" title="What you send, what you get back">
        <dl className="d-kv">
          <dt>POST /gate</dt>
          <dd>
            {served.gate_request.required.join(" + ")}, optional {served.gate_request.optional.join(", ")}
            {served.gate_request.closed ? ", closed keys" : ""}
          </dd>
          <dt>{prediction.title}</dt>
          <dd className="c-mono">{prediction.required.join(" · ")}</dd>
          <dt>{decision.title}</dt>
          <dd className="c-mono">{decision.required.join(" · ")}</dd>
          <dt>{verdict.title}</dt>
          <dd className="c-mono">{verdict.required.join(" · ")}</dd>
          <dt>reasons</dt>
          <dd>one of {reasons.length} codes of a closed list (see the <Link href="/docs/gate#reasons">gate page</Link>)</dd>
          <dt>budget</dt>
          <dd>{served.honesty.bt_clause}: the value you send comes back unchanged</dd>
        </dl>
        <ul className="d-bullets">
          {served.gate_request.params.map((p) => (
            <li key={p.name}>
              <code>params.{p.name}</code>, {p.type}, {p.required ? "required" : "optional"}: {p.text}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="classes" title="The classes it serves">
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">task class</th>
                <th className="c-label">calibration</th>
                <th className="c-label">served clauses</th>
              </tr>
            </thead>
            <tbody>
              {served.classes.map((c) => (
                <tr key={c.class_id}>
                  <td className="c-mono">{c.class_id}</td>
                  <td>{STATE_WORDS[c.state] ?? c.state}</td>
                  <td>{c.clauses.join("; ")}.</td>
                </tr>
              ))}
              <tr>
                <td className="c-mono">your own class</td>
                <td>your calibration</td>
                <td>{served.byo_clause}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="refusals" title="Refusals and bounds">
        <ul className="d-bullets">
          <li>
            A payload carrying an unknown key is refused, not ignored: {refusal.invalid_status}, {refusal.invalid_text}
          </li>
          <li>A payload carrying a forbidden key throws instead of serialising: there is no score field to send.</li>
          <li>
            A foreign browser origin is refused: {refusal.origin_status}, {refusal.origin_text}
          </li>
          <li>
            Served bounds: at most {bounds.calibrate_scores} scores per calibration, {bounds.gate_scores} per gate calibration,{" "}
            {bounds.gate_candidates} candidates in set mode, {bounds.cascade_nodes} nodes per cascade.
          </li>
          <li>
            Last deploy check {served.deploy_check.checked_at}: {served.deploy_check.ok_count} of {served.deploy_check.count} controls
            passed.
          </li>
        </ul>
        <p>
          The <Link href="/integrators">integrators page</Link> carries the same facts in full.
        </p>
      </DocSection>

      <PrevNext href="/docs/integrators" />
    </article>
  );
}
