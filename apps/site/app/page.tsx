import type { ReactNode } from "react";
import { join } from "node:path";
import { cn } from "@/lib/utils";
import { RscBoundaryDemo } from "@/components/rsc-boundary-demo";
import { StatusBadge } from "@/components/status-badge";
import { ShogenPanel } from "@/components/shogen-panel";
import { HikaePanel } from "@/components/hikae-panel";
import { UkemiPanel } from "@/components/ukemi-panel";
import { loadAttestedPriceContract, loadContract } from "@/lib/load-contract";
import { MonarkMark } from "@/components/marks/monark-mark";

// MONARK v2 — the four layers (README l.16-21). `what` and `status` are JSX (ReactNode), not raw
// strings, so the honesty lint (test 44) scans them; counts are spelled as words, never digits.
const LAYERS: { name: string; what: ReactNode; status: ReactNode }[] = [
  {
    name: "Backbone — the gate",
    what: <>Hikae (coverage control) and the MONARK token budget; it turns a sensor reading into commit, defer, or abstain.</>,
    status: <>Built</>,
  },
  {
    name: "Fleet — a company of agents",
    what: <>Sensors that attest, the gate that authorizes, and acts that execute — one token across all of them.</>,
    status: <>Three built, eight on the roadmap</>,
  },
  {
    name: "Harness — reachable by other agents",
    what: <>The same fleet made reachable by other agents over HTTP or MCP.</>,
    status: <>Specified, not shipped</>,
  },
  {
    name: "A company that improves itself",
    what: <>Agents that rate, improve, and sell one another&rsquo;s products.</>,
    status: <>Direction, unscheduled</>,
  },
];

// Entry by market segment (onboarding decision, memstack 0d186517). Each `act` is JSX prose. The
// segments are the investor&rsquo;s entry frame; the openable per-product panels are the three built
// agents below. No roadmap agent is named here (Lot F-2c).
const SEGMENTS: { title: string; act: ReactNode }[] = [
  { title: "Vault LP", act: <>Survive liquidation cascades and redemption runs on pooled collateral.</> },
  { title: "DAO / agent", act: <>Reach the fleet as a tool your DAO or another agent can call.</> },
  { title: "Leverage", act: <>Read liquidation risk on a leveraged position before it clears.</> },
  { title: "Betting desk", act: <>Turn a raw predictor into a coverage-controlled decision.</> },
  { title: "Rate treasury", act: <>Track yield-curve exposure across the rate surface.</> },
];

export default function HomePage() {
  // Frozen contracts, read from schemas/ at build time (server component). apps/site is the cwd under
  // `next build`; the repo root is two levels up (mirrors lib/load-committed.ts). Each built agent shows
  // the contract it emits: Shōgen -> AttestedPrice, Hikae -> CoverageVerdict, Ukemi -> Prediction.
  const root = join(process.cwd(), "..", "..");
  const attestedContract = loadAttestedPriceContract(root);
  const coverageContract = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const predictionContract = loadContract(root, "prediction.schema.json", "Ukemi");
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero — company statement (README l.3-9). */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <MonarkMark className="size-12 text-primary" />
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-primary">MONARK</h1>
        </div>
        <p className="max-w-3xl text-lg text-foreground">
          A company of agent-products for DeFi and inference, built on one backbone: a
          coverage-controlled decision gate that emits commit, defer, or abstain and a depletable
          authorization budget &mdash; never a probability of being right.
        </p>
        <p className="max-w-3xl text-muted-foreground">
          The agents are products, not tokens: sensors that attest, a gate that authorizes, and acts
          that execute. This repository is the MONARK tokenisation layer and the frozen interface
          contracts that let those agents interoperate.
        </p>
        <div>
          <RscBoundaryDemo />
        </div>
      </section>

      {/* The four layers. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          Four layers, labelled by what is built
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          MONARK is not one product and not three sub-agents. The labels are the point: they say what
          exists today and what is only named.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {LAYERS.map((l) => (
            <div key={l.name} className="rounded-xl border bg-card p-5">
              <h3 className="font-heading text-base font-medium text-card-foreground">{l.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{l.what}</p>
              <p className="mt-3 text-xs font-medium text-accent-foreground">{l.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fleet invariant — honest absence claim, and the carrier of the closed site-vocab exemption
          phrase (kept intra-line, lower-case, contiguous; see vocab-banned.json scan.site). */}
      <section className="mt-12">
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-5">
          <p className="max-w-3xl text-sm text-foreground">
            MONARK keeps no confidence field, anywhere: an output is a region, a set, or bytes with a
            hash and named residual hypotheses &mdash; never a score. The contract layer enforces this
            in code.
          </p>
        </div>
      </section>

      {/* Enter by segment (5 profiles). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          Enter by segment
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Pick the profile that fits you. Every profile plugs into an act, the same gate, and a way to
          connect &mdash; the built products are below.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTS.map((s) => (
            <article key={s.title} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <h3 className="font-heading text-base font-medium text-card-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.act}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cleared by the same gate: Hikae and the MONARK budget.
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                Reachable over HTTP or MCP
                <StatusBadge status="upcoming" />
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* The built fleet — three built agents, each opening its own 8-block panel. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          The built fleet
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The first vertical, built end to end and closed under independent review. Each agent below is
          built; open its panel for how it works, how it is built, its honest limits, and its frozen
          contract.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ShogenPanel contract={attestedContract} />
          <HikaePanel contract={coverageContract} />
          <UkemiPanel contract={predictionContract} />
        </div>
      </section>

      {/* Token. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Token</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          MONARK carries a depletable authorization budget: each commit spends it; defer and abstain do
          not. It is the fleet&rsquo;s metered right-to-act &mdash; not a yield, not a stake, not an
          oracle.
        </p>
        <p className={cn("mt-3 text-sm font-medium text-foreground")}>Tokenomics: to be announced.</p>
      </section>
    </main>
  );
}
