import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { FLEET_AGENTS } from "@/lib/fleet";

// Static metadata only (ADR-M004 D14 / PLAN F-2c §2): no number in title/description (honesty lint
// §6b scans them), and NO generateMetadata — that would render into <title>/<meta> yet escape the §6b
// scan (F-2b guard no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "Roadmap — MONARK",
  description:
    "The MONARK roadmap: four layers at four maturities, the phases that have closed, and the fleet agents still on the way.",
};

// The four maturity layers (design "Roadmap", L724-729). Every RENDERED field is a JSX fragment, not a
// bare string: the honesty lint (test 44) scans a fragment where it is DEFINED (its walker reaches the
// JsxText), so these labels are covered in place — no separate numeric-hole test is needed (C-4). The
// design's zero-padded "Layer 01".."Layer 04" ordinals are reformulated to words so no digit renders
// (F-site-7: reformulate, never exempt a bare digit). `id` is a non-rendered React key only.
const LAYERS: {
  id: string;
  n: ReactNode;
  name: ReactNode;
  what: ReactNode;
  detail: ReactNode;
  maturity: ReactNode;
  maturityTone: string;
}[] = [
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
    detail: <>four frozen contracts &middot; Hikae + Ukemi engines &middot; CI</>,
    maturity: <>Built</>,
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
    detail: <>Shōgen, Hikae, Ukemi built &middot; eight named</>,
    maturity: <>Three built, eight on the roadmap</>,
    maturityTone: "border-hikae-t text-hikae-t",
  },
  {
    id: "harness",
    n: <>Layer three</>,
    name: <>Harness &mdash; reachable by other agents</>,
    what: <>The same fleet made reachable by other agents over HTTP or MCP.</>,
    detail: <>contracts frozen &middot; public MCP endpoint &middot; four tools &middot; skill on ClawHub</>,
    maturity: <>Built</>,
    maturityTone: "border-hikae-t text-hikae-t",
  },
  {
    id: "company",
    n: <>Layer four</>,
    name: <>A company that improves itself</>,
    what: <>Agents that rate, improve, and sell one another&rsquo;s products.</>,
    detail: <>no date</>,
    maturity: <>Direction, unscheduled</>,
    maturityTone: "border-line text-ink2",
  },
];

// The three phase cards (design L349-351). The design's "dates appear only where a phase has closed"
// intro line is cut — no card renders a date, so it under-delivers (F-site-7: cut superfluous defensive
// copy). "Phase 0/1/2" is reformulated to words; the phase-one body uses "closed under independent
// review and a closing verdict" rather than internal gate labels (whose digits would red test 44 —
// no G\d in ALLOWED_ID; the phrasing already used in the Built section below).
const PHASES: { id: string; label: ReactNode; body: ReactNode; tone: string }[] = [
  {
    id: "freeze",
    label: <>Phase zero &middot; closed</>,
    body: <>Contract freeze &mdash; four schemas, closed keys, forbidden-key guard, vocabulary gate.</>,
    tone: "text-hikae-t",
  },
  {
    id: "engines",
    label: <>Phase one &middot; closed</>,
    body: <>Hikae and Ukemi engines, closed under independent review and a closing verdict.</>,
    tone: "text-hikae-t",
  },
  {
    id: "integration",
    label: <>Phase two &middot; in progress</>,
    body: <>Integration &mdash; the cross-agent gate and the token budget B_t wired through the fleet.</>,
    tone: "text-defer",
  },
];

// The /roadmap route (server component). Top: the design "Roadmap" section (four layers + three phase
// cards). Below (kept from F-2c, register-consuming): the three built agents (renvoi to their home
// panels) and the eight upcoming agents as teasers. F-site-6 relocates the built/upcoming agent lists to
// /fleet; they are kept here until then so the eight upcoming agents keep a rendered home (their only
// surface today — the home page renders the three built panels and the five products, not these eight).
export default function RoadmapPage() {
  const built = FLEET_AGENTS.filter((a) => a.status === "built");
  const upcoming = FLEET_AGENTS.filter((a) => a.status === "upcoming");
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
          Four layers, at four maturities.
        </h1>
        <p className="max-w-2xl text-lg text-ink2">
          MONARK is not one product and not three sub-agents. The labels say what exists today and what is
          only named.
        </p>
      </section>

      {/* The four maturity layers. */}
      <section className="mt-12 border-t border-line">
        {LAYERS.map((l) => (
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

      {/* Built agents — a renvoi to their home-page panels; not duplicated here (item 1). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Built</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Built end to end and closed under independent review. Each one keeps its full panel on the{" "}
          <Link href="/#fleet" className="underline underline-offset-4 hover:text-foreground">
            home page
          </Link>
          .
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {built.map((a) => (
            <li key={a.name} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-medium text-card-foreground">{a.name}</h3>
                <StatusBadge status={a.status} className="ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{a.line}</p>
              <Link
                href="/#fleet"
                className="mt-auto pt-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Open its panel on the home page
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Upcoming agents — teasers: name, one sourced line, an Upcoming badge. Non-openable (nothing
          built to open); the wording is the verbatim register line (deck + memstack; docs/G1-lot-F2c.md). */}
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
