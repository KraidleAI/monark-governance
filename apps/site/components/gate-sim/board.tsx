"use client";

// EngineBoard — the Home engine board, reconciled to the DESIGN's card-pipeline (R3a),
// replacing F-site-3's placeholder SVG "board" mode. Structure = MONARK.dc.html L64-136: a hero (statement
// + profile picker) over a sensors -> adapter -> gate -> acts pipeline of register cards, with an aside
// that names the picked profile's product.
//
// TWO independent, honest animations share the board:
//   1. the LIVE sim (useGateSim("board"), auto-cycling AMBIENT — F-site-3, unchanged) drives the GATE
//      card: the active decision chip = actions[state.actionIndex] (the third word from the loaded enum by
//      INDEX, never a literal), and the meter = <GateMeter budget={state.budget} />. No second, fake budget.
//   2. the PROFILE picker highlights the plumbing: the fleet cards whose key is in the picked profile's
//      sourced engineKeys (lib/profiles.ts) light up; the gate + adapter (the backbone) always light.
//
// HONESTY. Columns come from FLEET_AGENTS BY ROLE (the frozen register); each card's teaser is a.line
// verbatim, status is the register status via <StatusBadge>. kanji/accent are presentation-only
// (lib/agents-presentation.ts). The aside's product wiring is read from PRODUCTS (fingers); the three
// VISAGE profiles NAME + LINK their product (register + panel owned by F-site-6). No rendered numeric
// literal: the ordinals in the eyebrows ("04 · sensors" …) are closed-exempt (honesty-lint.exempt.json,
// C-6 guard); the picker ordinal renders through a call (String(n).padStart), which the lint never flags.
// No frozen-contract field name is quoted anywhere. The C-5 caveat renders here (R5).
import { useEffect, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import Link from "next/link";
import { FLEET_AGENTS, PRODUCTS, type FleetStatus } from "@/lib/fleet";
import { AGENTS_PRESENTATION } from "@/lib/agents-presentation";
import { PICKER_PROFILES } from "@/lib/profiles";
import { CAVEAT, decisionColorVar } from "@/lib/sim";
import { StatusBadge } from "@/components/status-badge";
import { ShogenMark } from "@/components/marks/shogen-mark";
import { HikaeMark } from "@/components/marks/hikae-mark";
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { MokugekiMark } from "@/components/marks/mokugeki-mark";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { KaihiMark } from "@/components/marks/kaihi-mark";
import { KessaiMark } from "@/components/marks/kessai-mark";
import { KamaeMark } from "@/components/marks/kamae-mark";
import { KyokusenMark } from "@/components/marks/kyokusen-mark";
import { KoyomiMark } from "@/components/marks/koyomi-mark";
import { GenkanMark } from "@/components/marks/genkan-mark";
import { GateMeter } from "./meter";
import type { UseGateSim } from "./use-gate-sim";

const PROFILE_TICK_MS = 6500; // the picker auto-advances like the design; paused once the visitor picks

const MARKS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  shogen: ShogenMark,
  hikae: HikaeMark,
  ukemi: UkemiMark,
  mokugeki: MokugekiMark,
  narabi: NarabiMark,
  kaihi: KaihiMark,
  kessai: KessaiMark,
  kamae: KamaeMark,
  kyokusen: KyokusenMark,
  koyomi: KoyomiMark,
  genkan: GenkanMark,
};

interface BoardNode {
  readonly key: string;
  readonly name: string;
  readonly role: string;
  readonly line: string;
  readonly status: FleetStatus;
  readonly kanji: string;
  readonly accent: string;
}

// Join the frozen register (source of truth) with presentation-only kanji/accent, by name.
const PRES_BY_NAME = new Map(AGENTS_PRESENTATION.map((p) => [p.name, p]));
const NODES: readonly BoardNode[] = FLEET_AGENTS.map((a) => {
  const pres = PRES_BY_NAME.get(a.name);
  return {
    key: pres?.key ?? "",
    name: a.name,
    role: a.role,
    line: a.line,
    status: a.status,
    kanji: pres?.kanji ?? "",
    accent: pres?.accent ?? "var(--ink2)",
  };
});
const SENSORS = NODES.filter((n) => n.role === "sensor");
const ACTS = NODES.filter((n) => n.role === "act");
const GATE_NODE = NODES.find((n) => n.role === "gate");
const GENKAN_NODE = NODES.find((n) => n.role === "distribution");

const mono: CSSProperties = { fontFamily: "var(--font-mono)" };
const eyebrow: CSSProperties = {
  ...mono,
  fontSize: 11,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--ink2)",
  padding: "4px 6px",
};
const kanjiStyle: CSSProperties = { fontFamily: "var(--font-kanji)", color: "var(--ink2)", fontSize: 13 };
const teaser: CSSProperties = { fontSize: 12, color: "var(--ink2)", lineHeight: 1.45 };
const rowCenter: CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", rowGap: 4 };
const markBox: CSSProperties = { width: 26, height: 26, flex: "none", display: "inline-flex" };
const chip = (on: boolean, color: string): CSSProperties => ({
  ...mono,
  fontSize: 10.5,
  padding: "3px 7px",
  borderRadius: 6,
  border: `1px solid ${on ? color : "var(--line)"}`,
  color: on ? "var(--paper)" : "var(--ink2)",
  background: on ? color : "transparent",
});

function cardStyle(accent: string, active: boolean, dimmed: boolean, reduced: boolean, dashed = false): CSSProperties {
  return {
    border: `1px ${dashed ? "dashed" : "solid"} ${active ? accent : "var(--line)"}`,
    borderRadius: 14,
    background: active ? `color-mix(in oklab, ${accent} 12%, var(--card))` : dashed ? "transparent" : "var(--card)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    opacity: dimmed ? 0.6 : 1,
    boxShadow: active ? `0 0 0 3px color-mix(in oklab, ${accent} 22%, transparent)` : "none",
    transition: reduced ? "none" : "all .35s",
  };
}

function AgentMiniCard({
  node,
  active,
  dimmed,
  reduced,
  pipe,
}: {
  node: BoardNode;
  active: boolean;
  dimmed: boolean;
  reduced: boolean;
  /** an optional honest note on the card's REAL served pipe (ADR-EC C-11 vi: a built act feeds the gate
   *  upstream — cascade → gate — it does not execute). Digit-free (no numeric-hole). */
  pipe?: string;
}) {
  const Mark = MARKS[node.key];
  return (
    <div style={cardStyle(node.accent, active, dimmed, reduced)}>
      <div style={rowCenter}>
        {Mark ? (
          <span style={markBox}>
            <Mark className="size-full" />
          </span>
        ) : null}
        <span style={{ fontWeight: 600, fontSize: 14 }}>{node.name}</span>
        <span style={kanjiStyle}>{node.kanji}</span>
        <StatusBadge status={node.status} className="ml-auto" />
      </div>
      <div style={teaser}>{node.line}</div>
      {pipe ? <div style={{ ...mono, fontSize: 10.5, color: "var(--ink2)" }}>{pipe}</div> : null}
    </div>
  );
}

function Lane({ label, active, reduced }: { label: string; active: boolean; reduced: boolean }) {
  return (
    <div className="hidden items-center justify-center lg:flex" style={{ minWidth: 30, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 2,
          right: 2,
          top: "50%",
          height: 2,
          background: active
            ? "repeating-linear-gradient(90deg,var(--hikae) 0 6px,transparent 6px 12px)"
            : "var(--line)",
          transition: reduced ? "none" : "background .4s",
        }}
      />
      <span
        style={{
          ...mono,
          fontSize: 9,
          color: "var(--ink2)",
          background: "var(--card)",
          padding: "0 4px",
          transform: "rotate(-90deg)",
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function EngineBoard({ sim, actions }: { sim: UseGateSim; actions: readonly string[] }) {
  const { reducedMotion, state } = sim;
  const [sel, setSel] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned || reducedMotion) return;
    const id = setInterval(() => setSel((s) => (s + 1) % PICKER_PROFILES.length), PROFILE_TICK_MS);
    return () => clearInterval(id);
  }, [pinned, reducedMotion]);

  const pick = (i: number) => {
    setSel(i);
    setPinned(true);
  };

  const profile = PICKER_PROFILES[sel];
  const lit = new Set(profile?.engineKeys ?? []);
  const isLit = (key: string) => lit.has(key);
  const finger =
    profile && profile.tier === "finger" && profile.productKey
      ? PRODUCTS.find((p) => p.key === profile.productKey)
      : undefined;

  return (
    <section
      data-screen-label="Home hero"
      className="border-b"
      style={{ borderColor: "var(--line)" }}
    >
      {/* hero — statement + profile picker */}
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-end gap-8 px-6 pb-7 pt-16 lg:grid-cols-2">
        <div>
          <div style={{ ...mono, fontSize: 12, color: "var(--ink2)", letterSpacing: ".04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--hikae)" }} />
            commit · defer · abstain
          </div>
          {/* h2: the board now sits under the charter C landing hero (ruling Q4), which carries the page's h1. */}
          <h2 style={{ fontSize: "clamp(38px,4.8vw,62px)", lineHeight: 1.02, letterSpacing: "-.025em", fontWeight: 600, margin: "16px 0 18px", textWrap: "balance" }}>
            It abstains,
            <br />
            so it can act.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink2)", maxWidth: 520, margin: 0, textWrap: "pretty" }}>
            One engine, eleven agents, one plug per client. Sensors witness, an adapter shapes the
            testimony into a frozen <span style={{ ...mono, color: "var(--ink)" }}>Prediction</span>, the
            gate authorizes, an act executes — and B_t is spent only on{" "}
            <span style={{ ...mono, color: "var(--ink)" }}>commit</span>. Never a probability of being right.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...mono, fontSize: 12, color: "var(--ink2)" }}>
            Who are you? Pick a profile — the plumbing lights up.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PICKER_PROFILES.map((p, i) => {
              const on = sel === i;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  style={{
                    minHeight: 44,
                    padding: "0 14px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                    background: on ? "var(--ink)" : "transparent",
                    color: on ? "var(--paper)" : "var(--ink)",
                    cursor: "pointer",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    transition: reducedMotion ? "none" : "all .25s",
                  }}
                >
                  <span style={{ ...mono, fontSize: 11, opacity: 0.7 }}>{String(p.n).padStart(2, "0")}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* engine board — pipeline + aside */}
      <div
        data-screen-label="Engine board"
        className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-6 pb-14 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 22,
            background: "color-mix(in oklab, var(--card) 82%, transparent)",
            padding: 18,
          }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {/* sensors */}
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div style={eyebrow}>04 · sensors · witness</div>
              {SENSORS.map((n) => (
                <AgentMiniCard key={n.key} node={n} active={isLit(n.key)} dimmed={!isLit(n.key)} reduced={reducedMotion} />
              ))}
            </div>

            <Lane label="bytes + hash" active={Boolean(profile)} reduced={reducedMotion} />

            {/* backbone: adapter + calibrate (BYO), always built */}
            <div className="flex min-w-0 flex-col justify-center gap-2.5 lg:flex-[0.8]">
              <div style={eyebrow}>backbone</div>
              <div style={cardStyle("var(--ukemi-t)", Boolean(profile), false, reducedMotion)}>
                <div style={rowCenter}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Adapter</span>
                  <StatusBadge status="built" className="ml-auto" />
                </div>
                <div style={teaser}>
                  Typed attestations become one frozen shape. Sensors never speak to the gate directly;
                  clients never speak to sensors.
                </div>
              </div>
              {/* calibrate (BYO) — the second way in: a caller's own scores feed the gate directly */}
              <div style={cardStyle("var(--hikae-t)", Boolean(profile), false, reducedMotion)}>
                <div style={rowCenter}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>calibrate · BYO</span>
                  <StatusBadge status="built" className="ml-auto" />
                </div>
                <div style={teaser}>
                  Or bring your own nonconformity scores — the gate conforms against them. Any asset,
                  any task.
                </div>
              </div>
            </div>

            <Lane label="Prediction" active={Boolean(profile)} reduced={reducedMotion} />

            {/* gate (Hikae, live sim) + Genkan storefront */}
            <div className="flex min-w-0 flex-col justify-center gap-2.5 lg:flex-[1.1]">
              <div style={eyebrow}>03 · gate · authorize</div>
              <div style={cardStyle("var(--hikae-t)", Boolean(profile), false, reducedMotion)}>
                <div style={rowCenter}>
                  <span style={markBox}>
                    <HikaeMark className="size-full" />
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>Hikae</span>
                  <span style={kanjiStyle}>控え</span>
                  <StatusBadge status={GATE_NODE?.status ?? "built"} className="ml-auto" />
                </div>
                <div style={teaser}>Conforms the reading into a coverage region, then decides.</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {actions.map((word, i) => (
                    <span key={word} style={chip(state.actionIndex === i, decisionColorVar(i))}>
                      {word}
                    </span>
                  ))}
                </div>
                <div style={{ ...rowCenter, ...mono, fontSize: 11, color: "var(--ink2)" }}>
                  <span>MONARK · B_t</span>
                  <span style={{ flex: 1 }}>
                    <GateMeter budget={state.budget} segments={12} />
                  </span>
                  <span style={{ color: "var(--ink)" }}>{sim.budgetText}</span>
                </div>
              </div>
              {GENKAN_NODE ? (
                <div style={cardStyle("#B06A4A", isLit("genkan"), false, reducedMotion, true)}>
                  <div style={rowCenter}>
                    <span style={{ width: 24, height: 24, flex: "none", display: "inline-flex" }}>
                      <GenkanMark className="size-full" />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Genkan</span>
                    <span style={{ ...kanjiStyle, fontSize: 12 }}>玄関</span>
                    <StatusBadge status={GENKAN_NODE.status} className="ml-auto" />
                  </div>
                  <div style={teaser}>
                    The storefront: the gate sold as a tool. Before every transfer, swap or sign —{" "}
                    <span style={mono}>before_tool → GateDecision</span>, over MCP.
                  </div>
                </div>
              ) : null}
            </div>

            <Lane label="commit · B_t" active={Boolean(profile)} reduced={reducedMotion} />

            {/* acts — the execute layer is UPCOMING (ADR-EC C-11 vi): no act is served, the gate never
                executes (D0 no-trade). The one BUILT act (Ukemi) is built because it FEEDS the gate upstream
                (cascade → gate), not because it executes — its card says so; its register role stays "act". */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div style={eyebrow}>02 · acts · execute (upcoming)</div>
              {ACTS.map((n) => (
                <AgentMiniCard
                  key={n.key}
                  node={n}
                  active={isLit(n.key)}
                  dimmed={!isLit(n.key)}
                  reduced={reducedMotion}
                  pipe={n.status === "built" ? "feeds the gate (cascade → gate), not execute" : undefined}
                />
              ))}
            </div>
          </div>

          <div style={{ ...mono, fontSize: 11, color: "var(--ink2)", marginTop: 14, lineHeight: 1.5 }}>{CAVEAT}</div>
        </div>

        {/* aside — the picked profile's product */}
        <aside
          className="lg:sticky lg:top-20"
          style={{ border: "1px solid var(--line)", borderRadius: 22, background: "var(--card)", padding: 22, display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={eyebrow}>profile · plumbing</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.15 }}>
            {profile?.label ?? "Pick a profile"}
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={rowCenter}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{profile?.productName}</span>
              <StatusBadge status="upcoming" className="ml-auto" />
            </div>
            {finger ? (
              <>
                <div style={teaser}>{finger.fn}</div>
                <dl style={{ ...mono, fontSize: 12, display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", margin: 0 }}>
                  <dt style={{ color: "var(--ink2)" }}>sensor</dt>
                  <dd style={{ margin: 0 }}>{finger.wiring.sensor}</dd>
                  <dt style={{ color: "var(--ink2)" }}>gate</dt>
                  <dd style={{ margin: 0 }}>{finger.wiring.gate}</dd>
                  <dt style={{ color: "var(--ink2)" }}>act</dt>
                  <dd style={{ margin: 0 }}>{finger.wiring.act}</dd>
                </dl>
                <div style={teaser}>{finger.connects}</div>
              </>
            ) : (
              <div style={teaser}>
                A VISAGE product. Its panel is on the Products page.
              </div>
            )}
          </div>
          <Link href="/products" style={{ fontSize: 14, color: "var(--monark-t)" }}>
            See it on Products →
          </Link>
          <div style={{ ...mono, fontSize: 11, color: "var(--ink2)", lineHeight: 1.5 }}>
            Every product is upcoming; each is a wiring of fleet agents on the same built gate.
          </div>
        </aside>
      </div>
    </section>
  );
}
