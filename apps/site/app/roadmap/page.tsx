import type { Metadata } from "next";
import type { ReactNode } from "react";
import { join } from "node:path";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { FLEET_AGENTS, builtAgents, upcomingAgents, countWord, capitalized, listNames } from "@/lib/fleet";
import { loadHarnessServed } from "@/lib/harness-served-load";
import { frozenContractsSummary } from "./frozen-contracts";
import { agentPages, PANELS_HREF } from "../fleet/agent-pages";

// The four maturity layers (design "Roadmap", L724-729). Every RENDERED field is a JSX fragment, not a bare string: the
// honesty lint (test 44) scans a fragment where it is DEFINED (its walker reaches the JsxText), so these labels are
// covered in place (C-4). The design's zero-padded "Layer 01".."Layer 04" ordinals are reformulated to words so no digit
// renders (reformulate, never exempt a bare digit). `id` is a non-rendered React key only. The counts and states are
// DERIVED: the frozen-contract count from schemas/ (frozen-contracts.ts, the same source the home page reads), the agent
// counts and names from the fleet register (lib/fleet.ts), the maturity of the gate and of the harness from the gate's
// register status (Hikae), and the harness's served tools and its MCP Registry entry from the committed, hashed served
// facts (apps/site/data/harness-served.json through lib/harness-served-load.ts) — never typed.
interface Layer {
  id: string;
  n: ReactNode;
  name: ReactNode;
  what: ReactNode;
  detail: ReactNode;
  maturity: ReactNode;
  maturityTone: string;
}

function layers(rootDir: string): Layer[] {
  const contracts = frozenContractsSummary(rootDir);
  const built = builtAgents();
  const upcoming = upcomingAgents();
  const harness = loadHarnessServed(rootDir);
  const gate = FLEET_AGENTS.find((a) => a.name === "Hikae");
  if (!gate) throw new Error("roadmap: the fleet register carries no Hikae entry (fail-closed)");
  // The gate's register word, sentence-initial: the maturity of the backbone and of the harness that serves it.
  const gateMaturity = capitalized(gate.status);
  const toolNames = harness.tools.map((t) => t.name);
  return [
    {
      id: "backbone",
      n: <>Layer one</>,
      name: <>Backbone &mdash; the gate</>,
      what: (
        <>
          Hikae (coverage control) and the MONARK token budget; it turns a sensor reading into commit,
          defer, or abstain.
        </>
      ),
      detail: (
        <>
          {countWord(contracts.count)} frozen contracts
          {contracts.unservedTitles.length > 0 ? <> ({listNames(contracts.unservedTitles)} upcoming until served)</> : null}{" "}
          &middot; Hikae + Ukemi engines &middot; CI
        </>
      ),
      maturity: <>{gateMaturity}</>,
      maturityTone: "border-hikae-t text-hikae-t",
    },
    {
      id: "fleet",
      n: <>Layer two</>,
      name: <>Fleet &mdash; a company of agents</>,
      what: (
        <>
          Sensors that attest, the gate that authorizes, and acts that execute &mdash; one token across all
          of them.
        </>
      ),
      detail: (
        <>
          {listNames(built.map((a) => a.name))} built &middot; {countWord(upcoming.length)} named
        </>
      ),
      maturity: (
        <>
          {capitalized(countWord(built.length))} built, {countWord(upcoming.length)} on the roadmap
        </>
      ),
      maturityTone: "border-hikae-t text-hikae-t",
    },
    {
      id: "harness",
      n: <>Layer three</>,
      name: <>Harness &mdash; reachable by other agents</>,
      what: <>The same engine made reachable by other agents over HTTP or MCP.</>,
      // The tool count and names are the served tool list (committed, hashed), never typed (test:
      // registry_count_words_are_derived, TYPED_COUNT covers "tools"); the MCP Registry entry is said while it is
      // served active.
      detail: (
        <>
          contracts frozen &middot; public MCP endpoint and its {countWord(toolNames.length)} tools ({listNames(toolNames)})
          {harness.registry.status === "active" ? <> &middot; listed in the MCP Registry</> : null}
        </>
      ),
      maturity: <>{gateMaturity}</>,
      maturityTone: "border-hikae-t text-hikae-t",
    },
    {
      id: "company",
      n: <>Layer four</>,
      name: <>A company that improves itself</>,
      what: <>Agents that rate, improve, and sell one another&rsquo;s applications.</>,
      detail: <>no date</>,
      maturity: <>Direction, unscheduled</>,
      maturityTone: "border-line text-ink2",
    },
  ];
}

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
function repoRoot(): string {
  return join(process.cwd(), "..", "..");
}

// How many maturity layers the page shows: the length of the list above, computed at build (never typed), so the
// static metadata below spells the same count as the heading.
const LAYER_COUNT = layers(repoRoot()).length;

// Static metadata only: no number in title/description (honesty lint §6b scans them), and NO generateMetadata — that
// would render into <title>/<meta> yet escape the §6b scan (guard no_generate_metadata_in_apps_site). The layer count is
// spelled from the list itself.
export const metadata: Metadata = {
  title: "Roadmap — MONARK",
  description: `The MONARK roadmap: ${countWord(LAYER_COUNT)} layers at ${countWord(LAYER_COUNT)} maturities, the phases that have closed, and the fleet agents still on the way.`,
};

// The three phase cards (design L349-351). The design's "dates appear only where a phase has closed"
// intro line is cut — no card renders a date, so it under-delivers (cut superfluous defensive copy). "Phase 0/1/2" is
// reformulated to words; the phase-one body says what exists ("engines complete; interface frozen"), the same words
// /fleet uses for the engines, and nothing about how the work was reviewed.
const PHASES: { id: string; label: ReactNode; body: ReactNode; tone: string }[] = [
  {
    id: "freeze",
    label: <>Phase zero &middot; closed</>,
    body: <>Contract freeze &mdash; the first schemas, closed keys, forbidden-key guard, vocabulary gate.</>,
    tone: "text-hikae-t",
  },
  {
    id: "engines",
    label: <>Phase one &middot; closed</>,
    body: <>Hikae and Ukemi engines complete; interface frozen.</>,
    tone: "text-hikae-t",
  },
  {
    id: "integration",
    label: <>Phase two &middot; in progress</>,
    body: <>Integration &mdash; the attested-price envelope on the served gate, its residual carried into the verdict, and the token budget B_t carried by the caller and echoed by the gate.</>,
    tone: "text-defer",
  },
];

// The /roadmap route (server component). Top: the design "Roadmap" section (the maturity layers + three phase cards).
// Below (register-consuming): the built agents, each with its digit-free served note (wiring.note) and a link to its
// panel on /fleet (every built agent has one there, section #panels) plus its own surface when it ships one; then the
// upcoming agents as teasers. The agent lists stay here as well as on /fleet so the upcoming agents keep a rendered home
// on the roadmap. Applications are not listed here: they live on the applications page (/products).
export default function RoadmapPage() {
  const layerList = layers(repoRoot());
  const built = builtAgents();
  const upcoming = upcomingAgents();
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to MONARK
        </Link>
        <div className="font-mono text-xs uppercase tracking-wide text-ink2">Roadmap</div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
          {capitalized(countWord(layerList.length))} layers, at {countWord(layerList.length)} maturities.
        </h1>
        <p className="max-w-2xl text-lg text-ink2">
          MONARK is one engine and the on-chain applications it powers. The labels say what exists today and what is
          only named.
        </p>
      </section>

      {/* The maturity layers. */}
      <section className="mt-12 border-t border-line">
        {layerList.map((l) => (
          <div
            key={l.id}
            className="grid grid-cols-1 gap-4 border-b border-line py-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-start"
          >
            <div>
              <div className="mb-1 font-mono text-xs text-ink2">{l.n}</div>
              <div className="text-xl font-semibold tracking-tight text-foreground">{l.name}</div>
            </div>
            <div className="text-sm leading-relaxed text-ink2">
              {l.what}
              <div className="mt-2 font-mono text-xs text-foreground">{l.detail}</div>
            </div>
            <span
              className={`h-fit whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs ${l.maturityTone}`}
            >
              {l.maturity}
            </span>
          </div>
        ))}
      </section>

      {/* The three phase cards. */}
      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {PHASES.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-5">
            <div className={`mb-2 font-mono text-xs ${p.tone}`}>{p.label}</div>
            <div className="text-sm leading-relaxed text-foreground">{p.body}</div>
          </div>
        ))}
      </section>

      {/* Built agents — each with its digit-free served note (read from the register) and its panel on /fleet. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Built</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {capitalized(countWord(built.length))} agents are built and served piece by piece, composed on the gate path. Each
          says how it is served, and each has its panel on the{" "}
          <Link href={PANELS_HREF} className="underline underline-offset-4 hover:text-foreground">
            fleet page
          </Link>
          .
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {built.map((a) => (
            <li key={a.name} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-medium text-card-foreground">{a.name}</h3>
                <StatusBadge status={a.status} className="ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{a.line}</p>
              <p className="border-t pt-2 text-xs text-muted-foreground">{a.wiring.note}</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                <Link href={PANELS_HREF} className="underline underline-offset-4 hover:text-foreground">
                  Open its panel on the fleet page
                </Link>
                {agentPages(a.name).map((page) => (
                  <Link key={page.href} href={page.href} className="underline underline-offset-4 hover:text-foreground">
                    {page.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Upcoming agents — teasers: name, one sourced line, an Upcoming badge. Non-openable (nothing
          built to open); the wording is the verbatim register line. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">On the roadmap</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Named, not built. Each will attest, gate, or act on the same backbone.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((a) => (
            <li key={a.name} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-medium text-card-foreground">{a.name}</h3>
                <StatusBadge status={a.status} className="ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{a.line}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
