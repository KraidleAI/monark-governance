"use client";

// The explainer controls: the reading and calibration-spread sliders, the intent choice,
// the sensor-timeout toggle, and Push / New epoch. The slider min/max/step are non-visible attributes
// (not honesty-lint surfaces); the only scanned strings are the JSX labels, none carrying a digit. The
// live reading/spread read-outs are computed strings passed in as props (property access, never literals).
import type { CSSProperties } from "react";
import type { Intent } from "@/lib/sim";

interface GateControlsProps {
  reading: number;
  spread: number;
  readingText: string;
  spreadText: string;
  intent: Intent;
  timeout: boolean;
  onReading: (v: number) => void;
  onSpread: (v: number) => void;
  onIntent: (i: Intent) => void;
  onToggleTimeout: () => void;
  onPush: () => void;
  onReset: () => void;
}

const labelStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, fontSize: 13 };
const rowStyle: CSSProperties = { display: "flex", justifyContent: "space-between" };
const monoInk2: CSSProperties = { fontFamily: "var(--font-mono)", color: "var(--ink2)" };
const rangeStyle: CSSProperties = { accentColor: "var(--hikae)", width: "100%", height: 32 };

function pill(active: boolean): CSSProperties {
  return {
    height: 40,
    padding: "0 16px",
    borderRadius: 10,
    border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
    background: active ? "var(--ink)" : "transparent",
    color: active ? "var(--paper)" : "var(--ink)",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
  };
}

export function GateControls({
  reading,
  spread,
  readingText,
  spreadText,
  intent,
  timeout,
  onReading,
  onSpread,
  onIntent,
  onToggleTimeout,
  onPush,
  onReset,
}: GateControlsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Push an input through the gate</div>
        <div style={{ fontSize: 13, color: "var(--ink2)" }}>
          {/* K-4(a): restore the design's task framing (design L171). */}
          Classification task, label schema{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>up|down</span>. Move the reading,
          widen the calibration spread, pick an intent — then push.
        </div>
      </div>

      <label style={labelStyle}>
        <span style={rowStyle}>
          <span>Predictor reading ŷ</span>
          <span style={monoInk2}>{readingText}</span>
        </span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={reading}
          onChange={(e) => onReading(Number.parseFloat(e.target.value))}
          style={rangeStyle}
          aria-label="Predictor reading"
        />
      </label>

      <label style={labelStyle}>
        <span style={rowStyle}>
          <span>Calibration spread q̂ (how wide the region must be)</span>
          <span style={monoInk2}>{spreadText}</span>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.95"
          step="0.05"
          value={spread}
          onChange={(e) => onSpread(Number.parseFloat(e.target.value))}
          style={rangeStyle}
          aria-label="Calibration spread"
        />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
        <span>Intent to authorize</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onIntent("up")} style={pill(intent === "up")}>
            up
          </button>
          <button type="button" onClick={() => onIntent("down")} style={pill(intent === "down")}>
            down
          </button>
          <button
            type="button"
            onClick={onToggleTimeout}
            aria-pressed={timeout}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              border: `1px dashed ${timeout ? "var(--abst)" : "var(--line)"}`,
              background: "transparent",
              color: timeout ? "var(--abst)" : "var(--ink2)",
              cursor: "pointer",
              fontSize: 13,
              marginLeft: "auto",
            }}
          >
            {timeout ? "sensor timeout: on" : "simulate sensor timeout"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
        <button
          type="button"
          onClick={onPush}
          style={{
            height: 46,
            padding: "0 20px",
            borderRadius: 12,
            background: "var(--ink)",
            color: "var(--paper)",
            border: 0,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Push through the gate
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            height: 46,
            padding: "0 16px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          New epoch (reset B_t)
        </button>
      </div>
    </div>
  );
}
