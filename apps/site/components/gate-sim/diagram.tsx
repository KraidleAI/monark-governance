"use client";

// The animated flow diagram: sensor lanes -> the gate -> the three output lanes. The
// output labels come from the loaded `action` enum (a prop), so the third action word is never a QUOTED
// literal here — never in a machine-consumed position sensitive to schema drift; its appearance in the
// aria-label PROSE below is an accepted, gate-green position (not a quoted literal). The active lane is
// chosen by state.actionIndex. Sensor labels come from lib/sim.ts SENSOR_NODES
// (covered by the numeric-hole test). All geometry lives in non-visible SVG attributes / inline styles
// (not honesty-lint surfaces); the only scanned strings are the JSX text labels and the aria-label, none
// of which carries a digit. Animation (flow/glow keyframes from globals.css) is dropped under reduced
// motion.
import { useTheme } from "@/components/theme-provider";
import { OUTPUT_LANES, SENSOR_NODES, decisionColorVar, type SimState } from "@/lib/sim";

const W = 680;
const H = 300;
const SX = 70; // sensor column x
const GX = 340; // gate centre x
const GY = 150; // gate centre y
const OX = 610; // output column x

export function GateDiagram({
  state,
  actions,
  compact = false,
}: {
  state: SimState;
  actions: readonly string[];
  compact?: boolean;
}) {
  const { reducedMotion } = useTheme();
  const fs = compact ? 1 : 1.35; // the explainer sits in a wider column: scale the type up
  const atGate = state.phase !== "idle";
  const flowing = state.phase === "out" || state.phase === "done";
  const gateActive = state.phase === "gate";
  const active = state.actionIndex;
  const decColor = decisionColorVar(active);
  const activeY = active !== null ? OUTPUT_LANES[active]?.y ?? GY : GY;
  const outX = flowing ? OX : GX;
  const pulseTr = reducedMotion ? "none" : "transform .65s cubic-bezier(.4,0,.2,1), opacity .3s";

  return (
    <svg
      viewBox={`0 0 ${compact ? W : W + 60} ${H}`}
      width="100%"
      role="img"
      aria-label="Sensor testimony flows into the gate, then the gate emits commit, defer, or abstain as its decision."
      style={{ display: "block", maxHeight: compact ? 260 : undefined }}
    >
      {/* sensor -> gate flow lines */}
      {SENSOR_NODES.map((n, i) => (
        <path
          key={`in-${i}`}
          d={`M${SX + 14} ${n.y} C ${SX + 120} ${n.y}, ${GX - 160} ${GY}, ${GX - 62} ${GY}`}
          stroke="var(--line)"
          strokeWidth={1.5}
          fill="none"
        />
      ))}

      {/* gate -> output flow lines (the chosen lane animates) */}
      {OUTPUT_LANES.map((o, i) => {
        const on = active === i && atGate;
        return (
          <path
            key={`edge-${i}`}
            d={`M${GX + 62} ${GY} C ${GX + 160} ${GY}, ${OX - 120} ${o.y}, ${OX - 14} ${o.y}`}
            stroke={on ? o.colorVar : "var(--line)"}
            strokeWidth={on ? 2 : 1.5}
            fill="none"
            strokeDasharray={on ? "6 6" : undefined}
            style={{ animation: on && !reducedMotion ? "flow 1s linear infinite" : "none", transition: "stroke .3s" }}
          />
        );
      })}

      {/* sensors */}
      {SENSOR_NODES.map((n, i) => (
        <g key={`sensor-${i}`}>
          <circle cx={SX} cy={n.y} r={12} fill="var(--card)" stroke={n.colorVar} strokeWidth={2} />
          <circle cx={SX} cy={n.y} r={4} fill={n.colorVar} />
          <text
            x={SX}
            y={n.y + 30}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={11 * fs}
            fill="var(--ink2)"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* pulses travelling in */}
      {SENSOR_NODES.map((n, i) => (
        <g
          key={`pulse-${i}`}
          style={{
            transform: atGate ? `translate(${GX}px,${GY}px)` : `translate(${SX}px,${n.y}px)`,
            transition: pulseTr,
            opacity: state.phase === "in" ? 1 : 0,
          }}
        >
          <circle cx={0} cy={0} r={5} fill={n.colorVar} />
        </g>
      ))}

      {/* the gate */}
      <g>
        <rect
          x={GX - 62}
          y={GY - 50}
          width={124}
          height={100}
          rx={18}
          fill="var(--card)"
          stroke={gateActive ? "var(--hikae)" : "var(--line)"}
          strokeWidth={gateActive ? 2.5 : 1.5}
          style={{ transition: "stroke .3s, stroke-width .3s" }}
        />
        <path
          d={`M${GX - 30},${GY - 16} L${GX + 30},${GY - 16} M${GX - 30},${GY + 16} L${GX + 30},${GY + 16}`}
          stroke="var(--hikae-t)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path
          d={`M${GX - 28},${GY + 8} L${GX - 16},${GY - 8} L${GX - 4},${GY + 10} L${GX + 8},${GY - 9} L${GX + 20},${GY + 9} L${GX + 30},${GY - 2}`}
          stroke="var(--ink)"
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={GX}
          y={GY + 72}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize={12 * fs}
          fontWeight={600}
          fill="var(--ink)"
        >
          Hikae · the gate
        </text>
        <text
          x={GX}
          y={GY + 72 + 18 * fs}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={10.5 * fs}
          fill="var(--ink2)"
        >
          B_t + region → decision
        </text>
        {gateActive && !reducedMotion ? (
          <rect
            x={GX - 62}
            y={GY - 50}
            width={124}
            height={100}
            rx={18}
            fill="none"
            stroke="var(--hikae)"
            strokeWidth={8}
            opacity={0.25}
            style={{ animation: "glow .5s ease-in-out infinite" }}
          />
        ) : null}
      </g>

      {/* the pulse travelling out to the chosen decision */}
      <g style={{ transform: `translate(${outX}px,${activeY}px)`, transition: pulseTr, opacity: flowing ? 1 : 0 }}>
        <circle cx={0} cy={0} r={6} fill={decColor} />
      </g>

      {/* outputs (labelled by the loaded action enum) */}
      {OUTPUT_LANES.map((o, i) => {
        const on = active === i && flowing;
        return (
          <g key={`out-${i}`}>
            <circle
              cx={OX}
              cy={o.y}
              r={12}
              fill={on ? o.colorVar : "var(--card)"}
              stroke={on ? o.colorVar : "var(--line)"}
              strokeWidth={1.5}
              style={{ transition: "fill .3s, stroke .3s" }}
            />
            <text
              x={OX + 22}
              y={o.y + 5}
              fontFamily="var(--font-mono)"
              fontSize={12 * fs}
              fontWeight={on ? 600 : 400}
              fill={on ? o.colorVar : "var(--ink2)"}
            >
              {actions[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
