import type { Metadata } from "next";
import { StatusBadge } from "@/components/status-badge";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadContract } from "@/lib/load-contract";
import { loadGateEnums } from "@/lib/gate-enums";
import { harnessRepoRoot, loadHarnessServed, loadByoTrace, loadH5Trace } from "@/lib/harness-served-load";

// Static metadata only (honesty lint §6b): no digit in title/description, and NO generateMetadata (gate
// no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "For integrators — MONARK",
  description:
    "The MONARK gate, reachable by any MCP-capable agent over streamable HTTP or a plain-HTTP mirror: the served tools, the frozen contracts with closed keys, and a recorded bring-your-own loop.",
};

// /integrators (server component). Every value on this page is READ, never typed: the served facts from
// apps/site/data/harness-served.json (written from the served harness bodies by the source repository's sync tool, not
// part of this export), the recorded requests and results from the two traces committed under fixtures/ (recorded over
// the MCP transport of an in-process server, bound to the loopback address the trace names), the contract field lists
// from schemas/, all through loaders that check each file against the hashed site manifest and fail the build closed.
// Recorded payload keys are verified against the real schemas at build time: the loader checks required ⊆ keys ⊆
// properties on every rendered request and result (gate payloads against the served /gate request and the frozen
// Prediction, GateDecision and CoverageVerdict; calibrate payloads against the served /calibrate schemas) and refuses
// any rendered object that carries a forbidden key at any depth. The status pill is the fleet register's word for
// Hikae, the gate this harness serves; the loader refuses a deploy check that is not green on every control. JSON
// blocks are a single JSON.stringify call over a read object. Texts quoted from the served harness are closed clauses
// copied by the sync, never a paraphrase; the MCP client and registry names are distribution channels, not
// endorsements. No skill-hub command or handle is shown until the skill is published there; the MCP Registry entry is
// read from the served facts. The page is a snapshot of the served harness as last read, and says so under the title.
const STATE_LABEL: Record<string, string> = {
  synthetic: "synthetic fixture",
  none: "no calibration committed",
  committed: "committed",
};

const mono13 = "font-mono text-[13px]";
const pre = "m-0 overflow-auto whitespace-pre font-mono text-[12.5px] leading-[1.55] text-foreground";
const card = "flex flex-col gap-3 rounded-[18px] border border-border bg-card p-6";
const eyebrow = "font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground";

export default function IntegratorsPage() {
  const root = harnessRepoRoot();
  const served = loadHarnessServed(root);
  const byo = loadByoTrace(root);
  const h5 = loadH5Trace(root);
  const { btcDir } = h5;
  const { reasons } = loadGateEnums(root);
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi");
  const decision = loadContract(root, "gate-decision.schema.json", "MONARK");
  const verdict = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const gate = FLEET_AGENTS.find((a) => a.name === "Hikae");
  if (gate === undefined) throw new Error("integrators: the fleet register carries no Hikae entry (fail-closed)");
  const recordedClass = (btcDir.request.prediction as { task_class?: unknown } | undefined)?.task_class;
  const btc = served.classes.find((c) => c.class_id === recordedClass);
  if (btc === undefined) throw new Error("integrators: the class of the recorded gate call is not a served class (fail-closed)");
  const repo = served.registry.repository_url;
  const { api, mcp, deploy_check: check, refusal, bounds } = served;
  const commands = `hermes mcp add ${mcp.server_name} --url ${mcp.url}\nopenclaw mcp add ${mcp.server_name} --url ${mcp.url} --transport ${mcp.remote_type}`;
  const att = served.attest;
  const byoParam = served.gate_request.byo_calibration.param;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-22">
      <div className="flex flex-wrap items-center gap-3">
        <div className={eyebrow}>For integrators</div>
        <StatusBadge status={gate.status} />
        <span className="font-mono text-[11px] text-muted-foreground">served version {served.version}</span>
      </div>
      <p className="mt-2 mb-0 max-w-[860px] font-mono text-[12px] leading-[1.6] text-muted-foreground">
        Snapshot, not live: the served harness as read {served.read_at}, when this page&rsquo;s data was last written.
        The registry entry below is as of that read; the deploy check carries its own date.
      </p>

      <h1 className="mt-3 mb-4 max-w-[820px] font-heading text-[clamp(34px,4.5vw,56px)] font-semibold tracking-[-0.025em] text-balance">
        The engine, reachable by your agent.
      </h1>
      <p className="mb-4 max-w-[760px] text-[18px] leading-[1.55] text-muted-foreground">
        The harness makes the same gate callable over HTTP and MCP; the tools below are the ones it serves. The
        contracts are frozen. The endpoint is public and unauthenticated, with no availability commitment. What you
        send and what you get back will not change without a versioned contract revision.
      </p>
      <ul className="mb-8 flex max-w-[860px] flex-col gap-1.5 text-[15px] leading-[1.5]">
        {served.tools.map((t) => (
          <li key={t.name}>
            <code className={`${mono13} text-foreground`}>{t.name}</code>
            <span className="text-muted-foreground"> — {t.note}</span>
            {t.note === att.label ? (
              <span className="text-muted-foreground">
                {" "}· one committed witness over {att.channel}, observed {new Date(att.observed_instant * 1000).toISOString()},
                verifier revision {att.verifier_rev.slice(0, 12)}; named residual hypotheses: {att.hypotheses.join(", ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Featured: add MONARK to your agent — the MCP endpoint (read from the snapshot), full width, wrapping. */}
      <section className="mb-10 rounded-[18px] border border-border bg-card p-6 sm:p-8">
        <h2 className="font-heading text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em]">Add MONARK to your agent</h2>
        <p className="mt-3 max-w-[820px] text-[16px] leading-[1.6] text-muted-foreground">
          <span className="font-medium text-foreground">Compatible with any MCP-capable agent.</span> The endpoint is a
          standard MCP server over streamable HTTP, so any agent or client that speaks MCP can call the gate as a tool
          by pointing at the URL. A plain-HTTP mirror serves agents that do not speak MCP.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-[14px] border border-border bg-soft p-5">
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">MCP — add the endpoint</div>
            <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.7] text-foreground">{commands}</pre>
          </div>
          <div className="rounded-[14px] border border-border bg-soft p-5">
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Any other MCP client</div>
            <p className="m-0 text-[15px] leading-[1.6] text-foreground">
              Point it at <code className="select-all break-all font-mono text-[13px]">{mcp.url}</code> ({mcp.remote_type}).
              The Accept header, as recorded against an in-process server on {byo.bind}: {byo.accept} It is listed in the
              MCP registry as <code className={mono13}>{served.registry.name}</code>, version {served.registry.version},
              status {served.registry.status}, published {served.registry.published_at.slice(0, 10)}. Source is open on{" "}
              <a href={repo} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* The BYO loop — both calls as recorded over the MCP transport of an in-process server (fixtures/byo-demo-trace.json),
          rendered from the read objects; the digest tie is computed from the same read values. */}
      <section className="mb-10">
        <h2 className="font-heading text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em]">See the BYO loop</h2>
        <p className="mt-2 mb-5 max-w-[820px] text-[16px] leading-[1.6] text-muted-foreground">
          Two stateless calls, recorded over the MCP transport of an in-process server on {byo.bind}. You calibrate on
          your own nonconformity scores, then gate your own prediction under them. The audit closes when the
          gate&rsquo;s <code className={mono13}>calib_digest</code> equals the calibrate{" "}
          <code className={mono13}>set_digest</code> — the decision was gated against exactly the scores you calibrated.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          <div className={card}>
            <div className="text-[16px] font-semibold">First &middot; calibrate your scores</div>
            <div className="font-mono text-[12px] text-muted-foreground">you send</div>
            <pre className={pre}>{JSON.stringify(byo.calibrate.request, null, 2)}</pre>
            <div className="font-mono text-[12px] text-muted-foreground">you get (structuredContent; its label field is quoted below)</div>
            <pre className={pre}>{JSON.stringify(byo.calibrate.result, null, 2)}</pre>
          </div>
          <div className={card}>
            <div className="text-[16px] font-semibold">Then &middot; gate your prediction</div>
            <div className="font-mono text-[12px] text-muted-foreground">you send</div>
            <pre className={pre}>{JSON.stringify(byo.gate.request, null, 2)}</pre>
            <div className="font-mono text-[12px] text-muted-foreground">you get (structuredContent)</div>
            <pre className={pre}>{JSON.stringify(byo.gate.result, null, 2)}</pre>
          </div>
        </div>
        <p className="mt-4 max-w-[820px] text-[15px] leading-[1.6] text-muted-foreground">
          The gate returns <code className={mono13}>{byo.decision.action}</code> &middot;{" "}
          <code className={mono13}>{byo.decision.reason}</code>, and <code className={mono13}>calib_digest</code>{" "}
          {byo.calib_digest.slice(0, 12)}… equals <code className={mono13}>set_digest</code> {byo.set_digest.slice(0, 12)}… —
          the loop closes. What the calibration means, as served: {served.honesty.calibrate_label} Full walkthrough:{" "}
          <a href={`${repo}/blob/main/skills/monark/DEMO.md`} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            DEMO.md on GitHub
          </a>
          .
        </p>
      </section>

      {/* The /gate contract: the served request envelope, the frozen field lists, and one recorded call. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
        <div className={card}>
          <div className="text-[18px] font-semibold">You send</div>
          <div className="font-mono text-[13px] text-muted-foreground">
            POST /gate · {served.gate_request.required.join(" + ")} · optional {served.gate_request.optional.join(", ")}
            {served.gate_request.closed ? " · closed keys" : ""}
          </div>
          <p className="m-0 text-[14px] leading-[1.5] text-muted-foreground">
            <code className={mono13}>prediction</code> is a frozen {prediction.title}: {prediction.required.join(" · ")}.{" "}
            <code className={mono13}>attested</code>: {served.honesty.attested.join("; ")}.
          </p>
          <ul className="m-0 flex flex-col gap-1 text-[13px] leading-[1.45]">
            {served.gate_request.params.map((p) => (
              <li key={p.name}>
                <code className="font-mono text-foreground">params.{p.name}</code>{" "}
                <span className="font-mono text-muted-foreground">
                  {p.type} · {p.required ? "required" : "optional"}
                </span>{" "}
                — <span className="text-muted-foreground">{p.text}</span>
              </li>
            ))}
          </ul>
          <div className="font-mono text-[12px] text-muted-foreground">
            a request recorded over the MCP transport of an in-process server on {h5.bind}
          </div>
          <pre className={pre}>{JSON.stringify(btcDir.request, null, 2)}</pre>
        </div>
        <div className={card}>
          <div className="text-[18px] font-semibold">You get back</div>
          <div className="font-mono text-[13px] text-muted-foreground">{served.response_required.join(" + ")}</div>
          <p className="m-0 text-[14px] leading-[1.5] text-muted-foreground">
            <code className={mono13}>structuredContent</code> is the frozen {decision.title} ({decision.required.join(" · ")}),
            its verdict a {verdict.title} ({verdict.required.join(" · ")}); <code className={mono13}>content</code> carries the
            served honesty text. The reason is one of {reasons.length} in the frozen enum.{" "}
            <code className={mono13}>remaining_budget</code>: {served.honesty.bt_clause} — the value you send comes back
            unchanged.
          </p>
          <div className="font-mono text-[12px] text-muted-foreground">
            its result, recorded on the same in-process server (structuredContent)
          </div>
          <pre className={pre}>{JSON.stringify(btcDir.result, null, 2)}</pre>
        </div>
      </div>
      <p className="mt-3 max-w-[820px] text-[13px] leading-[1.5] text-muted-foreground">
        Recorded with the committed class <code className="font-mono">{btc.class_id}</code>:{" "}
        {btc.clauses.join("; ")}. Supply your own <code className="font-mono">{byoParam}</code> (nonconformity scores) to
        gate your own predictor under your own task class.
      </p>

      {/* The task classes the gate serves, with the served clause for each (never a paraphrase). */}
      <section className="mt-10">
        <h2 className="font-heading text-[clamp(22px,2.6vw,30px)] font-semibold tracking-[-0.02em]">The task classes it serves</h2>
        <div className="mt-4 flex flex-col divide-y divide-border rounded-[14px] border border-border">
          {served.classes.map((c) => (
            <div key={c.class_id} className="grid gap-2 p-4 sm:grid-cols-[260px_200px_1fr]">
              <code className="font-mono text-[13px]">{c.class_id}</code>
              <span className="font-mono text-[12px] text-muted-foreground">{STATE_LABEL[c.state] ?? c.state}</span>
              <span className="text-[14px] leading-[1.5] text-muted-foreground">{c.clauses.join("; ")}.</span>
            </div>
          ))}
          <div className="grid gap-2 p-4 sm:grid-cols-[260px_200px_1fr]">
            <span className="font-mono text-[13px]">your own class</span>
            <span className="font-mono text-[12px] text-muted-foreground">your calibration</span>
            <span className="text-[14px] leading-[1.5] text-muted-foreground">{served.byo_clause}.</span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Transports</div>
          <div className="text-[15px] leading-[1.5]">
            MCP over {mcp.remote_type}: <code className="select-all break-all font-mono text-[13px]">{mcp.url}</code>. The
            plain-HTTP mirror: <code className="select-all break-all font-mono text-[13px]">{api.url}</code>, described by{" "}
            <a href={`${api.url}${api.openapi_path}`} className="underline underline-offset-4">{api.openapi_path}</a> ({api.title},
            OpenAPI {api.openapi_version}) and probed at <a href={`${api.url}${api.health_path}`} className="underline underline-offset-4">{api.health_path}</a>{" "}
            ({api.surface}). Last deploy check {check.checked_at}: {check.ok_count}/{check.count} controls passed; TLS
            certificate of {check.tls_host} valid to {check.tls_valid_to}.
          </div>
        </div>
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Refusals</div>
          <ul className="m-0 flex flex-col gap-1.5 text-[15px] leading-[1.5]">
            <li>A payload carrying an unknown key is refused, not ignored — {refusal.invalid_status}: {refusal.invalid_text}</li>
            <li>A payload carrying a forbidden key throws instead of serializing — there is no confidence field to send, and no score beside the reading.</li>
            <li>A foreign browser origin is refused — {refusal.origin_status}: {refusal.origin_text}</li>
            <li>
              Served bounds: at most {bounds.calibrate_scores} scores per calibration, {bounds.gate_scores} per gate
              calibration, {bounds.gate_candidates} candidates in set mode, {bounds.cascade_nodes} nodes per cascade.
            </li>
          </ul>
        </div>
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Bindings</div>
          <div className="text-[15px] leading-[1.5]">
            Language-neutral JSON Schema is the source of truth. TypeScript is the first binding, in the repository; no
            other language binding is committed yet — any language can validate against the same schema files.
          </div>
        </div>
      </div>
    </main>
  );
}
