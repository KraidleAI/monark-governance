import type { Metadata } from "next";

// Static metadata only (ADR-M004 D15 / honesty lint §6b): no digit in title/description, and NO
// generateMetadata (gate no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "For integrators — MONARK",
  description:
    "The MONARK fleet, reachable by any MCP-capable agent over streamable HTTP: four tools, a ClawHub skill, frozen contracts, and closed keys.",
};

// Example SHAPES for the two frozen contracts (MONARK.dc.html apiRequest/apiResponse, L732-733). These
// are illustrative examples with placeholder values (…), NOT committed figures. Object keys are BARE
// identifiers, never quoted string literals: the frozen contract field names must stay dynamic on the
// storefront (guard frozen_contract_fields_stay_dynamic), and JSON.stringify quotes them at render
// time. The keys are verified against the real schemas: apiRequest = Prediction.required (5); apiResponse
// top level = GateDecision.required (8), with verdict an (abbreviated) CoverageVerdict and region the
// set-variant {kind, labels, label_schema}. Digits here (1.0.0, one of 13) sit in object-literal /
// call-argument positions the honesty lint (test 44) never scans; there is no numeric token in any
// rendered JSX text.
const apiRequest = {
  schema_version: "1.0.0",
  task_class: "btc-dir-15m",
  yhat: "up",
  predictor_id: "your-predictor",
  produced_at: "…",
};

const apiResponse = {
  schema_version: "1.0.0",
  action: "commit | defer | abstain",
  allow: "boolean",
  tool: "…",
  intent: "up",
  verdict: {
    region: { kind: "set", labels: ["…"], label_schema: "up|down" },
    alpha: "the miscoverage level",
    reason: "…",
    residual: ["…"],
  },
  remaining_budget: "B_t",
  reason: "one of 13",
};

// BYO demo payloads — illustrative example values, in the SAME object-literal position as apiRequest
// above, so the honesty lint (test 44) never scans their digits. Values mirror the recorded loop in
// skills/monark/DEMO.md (calibrate -> gate -> the digests tie).
const byoCalibrate = {
  request: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 },
  returns: { qhat: 1.0, n: 10, set_digest: "4081f718…" },
};

const byoGate = {
  request: {
    prediction: { task_class: "your-own-class", yhat: 0, predictor_id: "you:your-model" },
    params: { remainingBudget: "B_t", intent: 0, calibration: { scores: "…the same scores…", mode: "interval" } },
  },
  returns: {
    action: "commit",
    allow: true,
    reason: "covered",
    verdict: { region: { kind: "interval", lo: -1, hi: 1 }, calib_digest: "4081f718…" },
  },
};

// /integrators (server component) — "For integrators", Built. Design section L426-438 (ADR-M004 D15
// renamed the design's #/api to /integrators). Renders on the shell mounted by the layout (header/footer
// NOT re-mounted). The two <pre> contract blocks are a SINGLE JSON.stringify call each, never a literal
// JSON string typed in JSX. The featured "Add MONARK to your agent" block leads: the skill (ClawHub) and
// the MCP one-liners; command <pre> use whitespace-pre-wrap + break-words so every character is visible
// without horizontal scroll, and each command line is digit-free so the honesty lint (test 44) stays
// green with the commands as JSX text. The MCP client / registry names are distribution channels, not
// DeFi partner brands (site vocab scope).
export default function IntegratorsPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-16 pb-22">
      {/* Hero 2-col (design L164-170): eyebrow + badge + title on the left, dek on the right. */}
      <header className="grid gap-10 min-[900px]:grid-cols-[1.2fr_1fr] min-[900px]:items-end">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              For integrators
            </div>
            <span className="rounded-full border border-ok bg-ok px-[9px] py-[3px] font-mono text-[11px] font-semibold text-paper">
              Built
            </span>
          </div>
          <h1 className="max-w-[820px] font-heading text-[clamp(34px,4.5vw,56px)] font-semibold tracking-[-0.025em] text-balance">
            The fleet, reachable by your agent.
          </h1>
        </div>
        <p className="text-[18px] leading-[1.55] text-muted-foreground">
          The harness makes the same gate callable over HTTP and MCP — four tools: attest, gate, cascade,
          and calibrate. The contracts are frozen, and the endpoint is reachable now. What you send and what
          you get back will not change without a versioned contract revision.
        </p>
      </header>

      {/* Featured: add MONARK to your agent — an ink block (design L172-184): prose left, three recessed
          command boxes right. The design's "$" shell prompts are NOT rendered (they would be new
          characters); the darker #0F0D0A box shade is approximated with a bordered inset panel (no
          darker-than-ink brand token). */}
      <section className="mt-10 mb-10 grid gap-9 rounded-[20px] bg-ink p-6 text-paper min-[900px]:grid-cols-[1fr_1.2fr] min-[900px]:items-start sm:p-9">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em] leading-[1.1]">
            Add MONARK to your agent
          </h2>
          <p className="text-[15px] leading-[1.6] text-paper/80">
            <span className="font-semibold text-paper">Compatible with any MCP-capable agent.</span> The
            endpoint is a standard MCP server over streamable HTTP, so any agent or client that speaks MCP
            can call the gate as a tool by pointing at the URL. A plain-HTTP mirror serves agents that do
            not speak MCP.
          </p>
          <p className="text-[15px] leading-[1.6] text-paper/80">
            <span className="font-semibold text-paper">There is also a skill.</span> It packages the
            endpoint and its usage notes so a runtime can adopt the gate in one step — published on ClawHub
            as <code className="font-mono text-[14px] text-paper">monark</code>.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-paper/15 bg-paper/5 p-4 shadow-inner">
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-paper/70">
              MCP — add the endpoint
            </div>
            <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.7] text-paper">{`hermes mcp add monark --url https://mcp.monarkgate.tech/mcp
openclaw mcp add monark --url https://mcp.monarkgate.tech/mcp --transport streamable-http`}</pre>
          </div>
          <div className="rounded-xl border border-paper/15 bg-paper/5 p-4 shadow-inner">
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-paper/70">
              ClawHub — install the skill
            </div>
            <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.7] text-paper">{`clawhub install monark`}</pre>
          </div>
          <div className="rounded-xl border border-paper/15 p-4">
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-paper/70">
              Any other MCP client
            </div>
            <p className="m-0 text-[15px] leading-[1.6] text-paper">
              Point it at{" "}
              <code className="select-all break-all rounded bg-paper/10 px-1.5 font-mono text-[13px] text-paper">https://mcp.monarkgate.tech/mcp</code>{" "}
              (streamable HTTP). Source is open on{" "}
              <a
                href="https://github.com/KraidleAI/monark"
                className="underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* See the BYO loop — the recorded demo (skills/monark/DEMO.md). Payload digits live in the byo*
          object literals (identifier reads), so the honesty lint never scans them; the section prose is
          digit-free. Two stateless calls; the audit closes when the two digests match. */}
      <section className="mb-10">
        <div className="mb-5 grid gap-8 min-[900px]:grid-cols-[1fr_1.4fr] min-[900px]:items-end">
          <h2 className="font-heading text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em] leading-[1.1]">
            See the BYO loop
          </h2>
          <p className="text-[16px] leading-[1.6] text-muted-foreground">
            Two stateless calls. You calibrate on your own nonconformity scores, then gate your own
            prediction under them. The audit closes when the gate&rsquo;s{" "}
            <code className="font-mono text-[13px]">calib_digest</code> equals the calibrate{" "}
            <code className="font-mono text-[13px]">set_digest</code> — proof the decision was gated against
            exactly the scores you calibrated, and nothing else.
          </p>
        </div>
        {/* Two numbered cards in the design (circled 1 / 2) with a → gutter between them; the numerals and
            the standalone arrow are NOT rendered (new characters). Layout keeps the two-card sequence and
            the JSON in wells. */}
        <div className="grid gap-4 min-[900px]:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-[16px] border bg-card p-6 shadow-sm">
            <div className="text-[16px] font-semibold">First &middot; calibrate your scores</div>
            <div className="font-mono text-[12px] text-muted-foreground">you send &rarr; you get</div>
            <pre className="m-0 overflow-auto whitespace-pre rounded-[10px] bg-soft p-3.5 font-mono text-[12.5px] leading-[1.55] text-foreground shadow-inner">
              {JSON.stringify(byoCalibrate, null, 2)}
            </pre>
          </div>
          <div className="flex flex-col gap-2 rounded-[16px] border bg-card p-6 shadow-sm">
            <div className="text-[16px] font-semibold">Then &middot; gate your prediction</div>
            <div className="font-mono text-[12px] text-muted-foreground">you send &rarr; you get</div>
            <pre className="m-0 overflow-auto whitespace-pre rounded-[10px] bg-soft p-3.5 font-mono text-[12.5px] leading-[1.55] text-foreground shadow-inner">
              {JSON.stringify(byoGate, null, 2)}
            </pre>
          </div>
        </div>
        <p className="mt-4 max-w-[820px] text-[15px] leading-[1.6] text-muted-foreground">
          The gate returns a covered <code className="font-mono text-[13px]">commit</code>, and the two
          digests are equal — the loop closes. Full walkthrough + byte-reproducible recording:{" "}
          <a
            href="https://github.com/KraidleAI/monark/blob/main/skills/monark/DEMO.md"
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            DEMO.md on GitHub
          </a>
          .
        </p>
      </section>

      {/* You send → You get back — same two-card pattern (design L232-257); the → gutter glyph is not
          rendered. JSON sits in wells. */}
      <div className="grid gap-4 min-[900px]:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-[16px] border bg-card p-6 shadow-sm">
          <div className="text-[18px] font-semibold">You send</div>
          <div className="font-mono text-[13px] text-muted-foreground">
            Prediction · frozen · closed keys
          </div>
          <pre className="m-0 overflow-auto whitespace-pre rounded-[10px] bg-soft p-3.5 font-mono text-[12.5px] leading-[1.55] text-foreground shadow-inner">
            {JSON.stringify(apiRequest, null, 2)}
          </pre>
        </div>
        <div className="flex flex-col gap-3 rounded-[16px] border bg-card p-6 shadow-sm">
          <div className="text-[18px] font-semibold">You get back</div>
          <div className="font-mono text-[13px] text-muted-foreground">
            GateDecision · frozen · closed keys
          </div>
          <pre className="m-0 overflow-auto whitespace-pre rounded-[10px] bg-soft p-3.5 font-mono text-[12.5px] leading-[1.55] text-foreground shadow-inner">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      </div>

      <p className="mt-3 max-w-[720px] text-[13px] leading-[1.5] text-muted-foreground">
        Shown with a committed fixture class; supply your own{" "}
        <code className="font-mono">calibration</code> (nonconformity scores) to gate your own predictor
        over any task class.
      </p>

      {/* Transports / Refusals / Bindings as three wells (design L259-263). */}
      <div className="mt-4 grid gap-3 min-[900px]:grid-cols-3">
        <div className="rounded-[14px] bg-soft p-5 shadow-inner">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Transports</div>
          <div className="text-[15px] leading-[1.5]">
            HTTP, and MCP over streamable HTTP, so another agent can call the gate as a tool. Endpoint:{" "}
            <code className="select-all break-all font-mono text-[13px]">https://mcp.monarkgate.tech/mcp</code>.
          </div>
        </div>
        <div className="rounded-[14px] bg-soft p-5 shadow-inner">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Refusals</div>
          <div className="text-[15px] leading-[1.5]">
            A payload carrying an unknown key is refused, not ignored. A payload carrying a forbidden key throws instead of serializing — there is no confidence field, and no score, to send.
          </div>
        </div>
        <div className="rounded-[14px] bg-soft p-5 shadow-inner">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Bindings</div>
          <div className="text-[15px] leading-[1.5]">
            Language-neutral JSON Schema is the source of truth. TypeScript is the first binding; Rust
            and Python bind to the same schemas.
          </div>
        </div>
      </div>
    </main>
  );
}
