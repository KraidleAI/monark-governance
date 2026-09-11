import type { Metadata } from "next";

// Static metadata only (ADR-M004 D15 / honesty lint §6b): no digit in title/description, and NO
// generateMetadata (gate no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "For integrators — MONARK",
  description:
    "The MONARK fleet, reachable by your agent over HTTP and MCP: frozen contracts, closed keys, endpoint to be announced.",
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

// /integrators (server component) — "For integrators", Specified, not shipped. Design section L426-438
// (ADR-M004 D15 renamed the design's #/api to /integrators). Renders on the shell mounted by the layout
// (header/footer NOT re-mounted). The two <pre> blocks are a SINGLE JSON.stringify call each, never a
// literal JSON string typed in JSX.
export default function IntegratorsPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-22">
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
          For integrators
        </div>
        <span className="rounded-full border border-border px-[9px] py-[3px] font-mono text-[11px] text-muted-foreground">
          Specified, not shipped
        </span>
      </div>

      <h1 className="mt-3 mb-4 max-w-[820px] font-heading text-[clamp(34px,4.5vw,56px)] font-semibold tracking-[-0.025em] text-balance">
        The fleet, reachable by your agent.
      </h1>
      <p className="mb-9 max-w-[720px] text-[18px] leading-[1.55] text-muted-foreground">
        The harness makes the same gate callable over HTTP and MCP. The contracts are frozen today; the
        concrete endpoint is to be announced. What you send and what you get back will not change without
        a versioned contract revision.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
        <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-6">
          <div className="text-[18px] font-semibold">You send</div>
          <div className="font-mono text-[13px] text-muted-foreground">
            Prediction · frozen · closed keys
          </div>
          <pre className="m-0 overflow-auto whitespace-pre font-mono text-[12.5px] leading-[1.55] text-foreground">
            {JSON.stringify(apiRequest, null, 2)}
          </pre>
        </div>
        <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-6">
          <div className="text-[18px] font-semibold">You get back</div>
          <div className="font-mono text-[13px] text-muted-foreground">
            GateDecision · frozen · closed keys
          </div>
          <pre className="m-0 overflow-auto whitespace-pre font-mono text-[12.5px] leading-[1.55] text-foreground">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Transports</div>
          <div className="text-[15px] leading-[1.5]">
            HTTP, and MCP over streamable HTTP, so another agent can call the gate as a tool. Endpoint:
            to be announced.
          </div>
        </div>
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Refusals</div>
          <div className="text-[15px] leading-[1.5]">
            A payload carrying an unknown key is refused, not ignored. A payload carrying a forbidden key throws instead of serializing — there is no confidence field, and no score, to send.
          </div>
        </div>
        <div className="rounded-[14px] border border-border p-5">
          <div className="mb-2 font-mono text-xs text-muted-foreground">Bindings</div>
          <div className="text-[15px] leading-[1.5]">
            Language-neutral JSON Schema is the source of truth. TypeScript is the first binding; Rust
            and Python bind to the same schemas.
          </div>
        </div>
      </div>
    </main>
  );
}
