"use client";

// GateSim (Lot F-site-3) — one client island, three mounts driven by `mode`:
//   board     — the auto-cycling engine board (Home): diagram + meter + caveat;
//   explainer — the interactive push-through-the-gate (How): controls + diagram + meter + region /
//               decision read-outs + the GateDecision JSON view + caveat;
//   token     — the mini B_t depletion sim (Token): budget + meter + decision log + push + caveat.
// Honesty (ADR-M004 D15): no rendered numeric literal — every number is computed state ({...Text}),
// property access, or a call ({gateJson(...)}). The third action word is never a QUOTED literal — never in
// a machine-consumed position sensitive to schema drift (prose such as an aria-label is an accepted,
// gate-green position): output labels and the log read it from the loaded `action` enum (a prop) by index.
// The C-5 caveat renders in ALL
// three modes; the illustrative alpha is qualified beside the JSON view. This island must sit under the
// layout's ThemeProvider (the hook reads reduced-motion from it). NOT yet mounted in a page (Home/How/
// Token are F-site-4/5/7); it compiles and lints on its own.
import type { CSSProperties } from "react";
import { decisionColorVar, gateJson, type AmbientInput } from "@/lib/sim";
import { GateControls } from "./controls";
import { GateDiagram } from "./diagram";
import { GateMeter } from "./meter";
import { useGateSim, type GateSimMode } from "./use-gate-sim";

const CAVEAT = "An illustrative simulation of the gate policy — not market activity";

export interface GateSimProps {
  /** Which mount to render. */
  readonly mode: GateSimMode;
  /** The frozen `action` enum, in order [commit, defer, abstain] (from lib/gate-enums.ts). */
  readonly actions: readonly string[];
  /** The frozen closed reason enum (thirteen codes) — the count is shown in the explainer. */
  readonly reasons: readonly string[];
  /** Illustrative per-commit B_t cost to DISPLAY; pass the sim COST so it matches the simulation. */
  readonly cost: number;
  /** The illustrative auto-demo input sequence (drives board/token); pass the sim AMBIENT. */
  readonly ambient: readonly AmbientInput[];
}

const card: CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 22,
  background: "var(--card)",
};
const mono11Ink2: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--ink2)", lineHeight: 1.5 };
const readoutBox: CSSProperties = { border: "1px solid var(--line)", borderRadius: 12, padding: 14, background: "var(--card)" };
const readoutLabel: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--ink2)", marginBottom: 6 };
const readoutValue: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, minHeight: 22 };

function Caveat() {
  return <div style={mono11Ink2}>{CAVEAT}</div>;
}

export function GateSim({ mode, actions, reasons, cost, ambient }: GateSimProps) {
  const sim = useGateSim(mode, ambient);
  const { state } = sim;
  const decisionText =
    state.actionIndex !== null && state.reason !== null
      ? actions[state.actionIndex] + " · " + state.reason
      : "—";
  const decisionColor = decisionColorVar(state.actionIndex);

  if (mode === "board") {
    return (
      <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <GateDiagram state={state} actions={actions} />
        <GateMeter budget={state.budget} />
        <Caveat />
      </div>
    );
  }

  if (mode === "token") {
    return (
      <div style={{ ...card, borderRadius: 20, padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={mono11Ink2}>B_t over one illustrative epoch</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, minWidth: 112 }}>
            B_t = <span style={{ fontWeight: 500 }}>{sim.budgetText}</span>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <GateMeter budget={state.budget} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {state.log.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                padding: "8px 0",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span style={{ color: decisionColorVar(row.actionIndex), minWidth: 64 }}>{actions[row.actionIndex]}</span>
              <span style={{ color: "var(--ink2)" }}>{row.reason}</span>
              <span>{row.budget}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={sim.pushAmbient}
          style={{
            height: 40,
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            alignSelf: "flex-start",
            padding: "0 14px",
          }}
        >
          Push a reading
        </button>
        <Caveat />
        <div style={mono11Ink2}>
          Each commit spends {cost.toFixed(2)} of B_t — an illustrative cost, not a market figure.
        </div>
      </div>
    );
  }

  // explainer
  return (
    <div
      style={{
        ...card,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
      }}
    >
      <div style={{ padding: 28, borderBottom: "1px solid var(--line)" }}>
        <GateControls
          reading={state.reading}
          spread={state.spread}
          readingText={sim.readingText}
          spreadText={sim.spreadText}
          intent={state.intent}
          timeout={state.timeout}
          onReading={sim.setReading}
          onSpread={sim.setSpread}
          onIntent={sim.setIntent}
          onToggleTimeout={sim.toggleTimeout}
          onPush={sim.push}
          onReset={sim.reset}
        />
      </div>
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14, background: "var(--paper)" }}>
        <GateDiagram state={state} actions={actions} compact />
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, minWidth: 112 }}>
            B_t = <span style={{ fontWeight: 500 }}>{sim.budgetText}</span>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <GateMeter budget={state.budget} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={readoutBox}>
            <div style={readoutLabel}>region</div>
            <div style={readoutValue}>{sim.regionText}</div>
          </div>
          <div style={readoutBox}>
            <div style={readoutLabel}>decision · reason</div>
            <div style={{ ...readoutValue, color: decisionColor }}>{decisionText}</div>
          </div>
        </div>
        <pre
          style={{
            margin: 0,
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 14,
            background: "var(--card)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            lineHeight: 1.55,
            overflow: "auto",
            color: "var(--ink2)",
            whiteSpace: "pre",
          }}
        >
          {gateJson(state, actions)}
        </pre>
        <div style={mono11Ink2}>
          The &alpha; shown is illustrative — it is the target miscoverage level (coverage is one minus
          &alpha;), not a probability that this region is right. The reason is one of {reasons.length} in
          the frozen enum.
        </div>
        <Caveat />
      </div>
    </div>
  );
}
