import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { join } from "node:path";
import Link from "next/link";
import { loadContract, loadAttestedPriceContract } from "@/lib/load-contract";
import { loadGateEnums } from "@/lib/gate-enums";
import { GateSim } from "@/components/gate-sim";
import { ACTION_DEFER, ACTION_ABSTAIN, AMBIENT, COST, decisionColorVar } from "@/lib/sim";
import { OUTCOMES, REASON_GLOSS, REGION_KINDS } from "@/lib/how-copy";

// How it works — a SERVER shell around the one interactive island (the gate explainer,
// GateSim mode="explainer"). Honesty by construction: (1) the third action word (a CoverageVerdict field)
// is NEVER a literal here — every place the design shows it, the word is rendered from the loaded
// `action` enum by index (ACTION_ABSTAIN); commit/defer and the reason codes are not contract fields and
// are cited freely.
// (2) The reasons grid renders ONE card per FROZEN reason code (loadGateEnums), glossed from lib/how-copy
// (completeness pinned both ways by the R2 test). (3) The pipeline field lists are loaded from the frozen
// schemas (never hard-coded). (4) No rendered numeric literal (counts are words); inline `style` numbers
// are not honesty-lint surfaces. (5) The strong denial "no p_correct, no confidence field, no score" and
// the JSON-view "abbreviated/illustrative" qualifier live inside the explainer island (components/
// gate-sim/index.tsx), where the design places them (design L192).

export const metadata: Metadata = {
  title: "How it works — MONARK",
  description:
    "A coverage-controlled decision gate: how an upstream reading becomes a region, a budget, and one of three words — never a probability of being right.",
};

const section: CSSProperties = { maxWidth: 1200, margin: "0 auto" };
const mono: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const card: CSSProperties = { border: "1px solid var(--line)", borderRadius: 16, background: "var(--card)" };
const eyebrow: CSSProperties = { ...mono, fontSize: 12, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".06em" };
const bodyText: CSSProperties = { color: "var(--ink2)", lineHeight: 1.55 };

/** A decision chip "action · reason": the action WORD comes from the loaded enum by index (never a
 *  literal); the reason code is a plain literal (not a contract field). */
function chip(actions: readonly string[], tone: number, reason: string) {
  return (
    <span style={{ ...mono, color: decisionColorVar(tone) }}>
      {actions[tone] ?? ""} · {reason}
    </span>
  );
}

export default function HowItWorksPage() {
  // Frozen contracts + enums, read from schemas/ at build time (server component). apps/site is the cwd
  // under `next build`; the repo root is two levels up (mirrors app/page.tsx / lib/load-committed.ts).
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);

  // The four frozen shapes of the pipeline = the four committed schemas. Field lists load dynamically
  // (required[]), never hard-coded — the storefront cannot drift from the frozen contract. AttestedDoc is
  // not a frozen contract; AttestedFlow IS frozen (the fifth schema) but is a PARALLEL sensor, not a
  // pipeline stage — so the pipeline card renders only the one built attestation shape (AttestedPrice).
  // `layer`/`what`/`absent` are ReactNode fragments (not raw strings), so the honesty lint (test 44)
  // scans their JSX text even though they sit in an array initializer — a numeric literal in this copy
  // reds (C-4 convention: rendered prose is JSX text). `contract.title` + `required[]` load dynamically.
  const pipeline = [
    {
      layer: <>sensors</>,
      contract: loadAttestedPriceContract(root),
      what: <>Testimony: what was said, its bytes and hash, who signed, and the named residual hypotheses — what is not verified.</>,
      absent: <>absent by design: no price number, no confidence field, no validated flag.</>,
    },
    {
      layer: <>adapter</>,
      contract: loadContract(root, "prediction.schema.json", "Ukemi"),
      what: <>Any predictor — a model, a curve, a clearing fixed point — emits the reading the gate will conform, tagged with who produced it.</>,
      absent: <>absent by design: no score beside the reading.</>,
    },
    {
      layer: <>gate · calibrate &amp; monitor</>,
      contract: loadContract(root, "coverage-verdict.schema.json", "Hikae"),
      what: <>The conformal region at target coverage one minus α, the calibration digest it came from, and the residuals carried through.</>,
      absent: <>absent by design: no p_correct.</>,
    },
    {
      layer: <>gate · authorize</>,
      contract: loadContract(root, "gate-decision.schema.json", "MONARK"),
      what: <>The word an act is allowed to obey, the tool it applies to, the verdict behind it, and what is left of the fleet&rsquo;s budget.</>,
      absent: <>absent by design: no probability, no win-rate, no yield.</>,
    },
  ];

  const setKind = REGION_KINDS[0];
  const intervalKind = REGION_KINDS[1];

  return (
    <main>
      {/* Intro */}
      <section style={{ ...section, padding: "64px 24px 32px" }}>
        <div style={eyebrow}>How it works</div>
        <h1 style={{ fontSize: "clamp(34px,4.5vw,56px)", letterSpacing: "-.025em", fontWeight: 600, margin: "12px 0 16px", maxWidth: 820 }}>
          A coverage-controlled gate. It never says how likely it is to be right.
        </h1>
        <p style={{ fontSize: 18, ...bodyText, maxWidth: 720, margin: 0 }}>
          An upstream predictor gives a reading. Hikae conforms it into a coverage region at a target of
          one minus α. A closed gate policy reads that region and the remaining budget, and emits one of
          three words.
        </p>
      </section>

      {/* The three outcomes — titles rendered from the loaded action enum, in frozen order. */}
      <section
        style={{
          ...section,
          padding: "0 24px 48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 14,
        }}
      >
        {OUTCOMES.map((o) => (
          <div key={o.tone} style={{ ...card, borderRadius: 16, padding: 22 }}>
            <div style={{ ...mono, fontSize: 14, color: decisionColorVar(o.tone), fontWeight: 500, marginBottom: 8 }}>
              {actions[o.tone] ?? ""}
            </div>
            <p style={{ margin: 0, fontSize: 15, ...bodyText }}>{o.gloss}</p>
          </div>
        ))}
      </section>

      {/* Gate explainer — the one interactive island (controls + diagram + meter + read-outs + JSON view
          + the strong denial and the abbreviated-view qualifier, all inside the island). */}
      <section style={{ ...section, padding: "0 24px 72px" }}>
        <GateSim mode="explainer" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />
      </section>

      {/* The pipeline, contract by contract — field lists loaded from the frozen schemas. */}
      <section style={{ ...section, padding: "8px 24px 64px" }}>
        <h2 style={{ fontSize: "clamp(26px,3vw,36px)", letterSpacing: "-.02em", fontWeight: 600, margin: "0 0 8px" }}>
          The pipeline, contract by contract
        </h2>
        <p style={{ margin: "0 0 24px", ...bodyText, fontSize: 16, maxWidth: 640 }}>
          Four frozen shapes. Each layer only sees the one before it — sensors never speak to the gate,
          clients never speak to sensors.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 12 }}>
          {pipeline.map((c) => (
            <div
              key={c.contract.title}
              style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 10, borderTop: "3px solid var(--hikae-t)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={eyebrow}>{c.layer}</span>
                <span style={{ ...mono, fontSize: 10, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--hikae-t)", color: "var(--hikae-t)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Built
                </span>
              </div>
              <div style={{ ...mono, fontSize: 17, fontWeight: 500, color: "var(--hikae-t)" }}>{c.contract.title}</div>
              <div style={{ fontSize: 14, ...bodyText }}>{c.what}</div>
              <div style={{ ...mono, fontSize: 11.5, color: "var(--ink)", lineHeight: 1.6, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                {c.contract.required.join(" · ")}
              </div>
              <div style={{ ...mono, fontSize: 11, color: "var(--abst)" }}>{c.absent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Region — the two conformable shapes + the budget panel. */}
      <section
        style={{ ...section, padding: "0 24px 64px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14 }}
      >
        {setKind ? (
          <div style={{ ...card, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)" }}>{setKind.eyebrow}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{setKind.title}</div>
            <div style={{ fontSize: 14.5, ...bodyText }}>
              A direction call, a yes/no market, a venue choice. The region is the set of labels the
              calibration cannot rule out. One label is actionable. Every label → {chip(actions, ACTION_DEFER, "set_too_large")}.
            </div>
            <pre style={{ margin: 0, ...mono, fontSize: 12, lineHeight: 1.55, color: "var(--ink2)", whiteSpace: "pre", overflow: "auto" }}>
              {setKind.example.join("\n")}
            </pre>
          </div>
        ) : null}
        {intervalKind ? (
          <div style={{ ...card, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)" }}>{intervalKind.eyebrow}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{intervalKind.title}</div>
            <div style={{ fontSize: 14.5, ...bodyText }}>
              A liquidable share, a health factor, a curve residual. Ukemi&rsquo;s clearing outcome is
              conformed into a low–high interval. Too wide → {chip(actions, ACTION_DEFER, "interval_too_wide")}. Intent
              outside → {chip(actions, ACTION_ABSTAIN, "intent_not_in_region")}.
            </div>
            <pre style={{ margin: 0, ...mono, fontSize: 12, lineHeight: 1.55, color: "var(--ink2)", whiteSpace: "pre", overflow: "auto" }}>
              {intervalKind.example.join("\n")}
            </pre>
          </div>
        ) : null}
        <div style={{ ...card, borderRadius: 18, padding: 24, background: "var(--soft)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...mono, fontSize: 12, color: "var(--ink2)" }}>remaining_budget · B_t</div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>The budget, not a score</div>
          <div style={{ fontSize: 14.5, ...bodyText }}>
            Every GateDecision carries what is left of the fleet&rsquo;s right to act. Commit spends it.
            When it is gone the gate does not lower its bar — it emits {chip(actions, ACTION_ABSTAIN, "budget_exhausted")} until a
            new epoch. Profit and loss never enter the policy.
          </div>
          <Link href="/token" style={{ fontSize: 14, color: "var(--monark-t)" }}>
            What B_t is and is not →
          </Link>
        </div>
      </section>

      {/* Thirteen reasons, one enum — codes rendered FROM the frozen enum, glossed from lib/how-copy. */}
      <section style={{ ...section, padding: "0 24px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "clamp(26px,3vw,36px)", letterSpacing: "-.02em", fontWeight: 600, margin: "0 0 8px" }}>
              Thirteen reasons, one enum
            </h2>
            <p style={{ margin: 0, ...bodyText, fontSize: 16, maxWidth: 620 }}>
              Every decision names why. The reason is a closed enum in the frozen contract — a new reason
              needs a deliberate, versioned revision, not a deploy.
            </p>
          </div>
          <span style={{ ...mono, fontSize: 11, padding: "3px 9px", borderRadius: 999, border: "1px solid var(--hikae-t)", color: "var(--hikae-t)" }}>
            Built · frozen schema
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10 }}>
          {reasons.map((code) => {
            const meta = REASON_GLOSS[code];
            if (!meta) return null; // unreachable: completeness pinned by the R2 root test
            return (
              <div key={code} style={{ ...card, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: 12.5, fontWeight: 500 }}>{code}</span>
                  <span style={{ ...mono, fontSize: 10, color: decisionColorVar(meta.tone), textTransform: "uppercase", letterSpacing: ".05em" }}>
                    {actions[meta.tone] ?? ""}
                  </span>
                </div>
                <div style={{ fontSize: 13, ...bodyText, lineHeight: 1.45 }}>{meta.gloss}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* One plug per client. */}
      <section style={{ ...section, padding: "0 24px 72px" }}>
        <div
          style={{ ...card, borderRadius: 22, padding: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28, alignItems: "center" }}
        >
          <div>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>the rule</div>
            <h3 style={{ fontSize: 28, letterSpacing: "-.02em", margin: "0 0 10px", fontWeight: 600 }}>
              One visible piece per client. Never eleven.
            </h3>
            <p style={{ margin: 0, ...bodyText }}>
              A liquidity vault installs Kaihi. A looping desk installs Ukemi. An agent runtime installs
              Genkan — the gate as a tool. Behind that one piece the sensors witness and Hikae authorizes;
              the client never has to know their names, and MONARK appears only as the counter of commits
              remaining.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/products" style={{ height: 44, padding: "0 18px", borderRadius: 12, background: "var(--ink)", color: "var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500 }}>
              Find your profile and its plug
            </Link>
            <Link href="/" style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              Watch the plumbing light up
            </Link>
          </div>
        </div>
      </section>

      {/* Limits — guaranteed vs not vs where to read more. */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--soft)" }}>
        <div
          style={{ ...section, padding: "56px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28 }}
        >
          <div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 10px", fontWeight: 600 }}>What is guaranteed</h2>
            <p style={{ margin: 0, ...bodyText, fontSize: 15 }}>
              Coverage holds on average over exchangeable calibration data at one minus a chosen
              miscoverage level α. The gate reads the region and the budget through a closed policy; profit
              and loss never enter it.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 10px", fontWeight: 600 }}>What is not</h2>
            <p style={{ margin: 0, ...bodyText, fontSize: 15 }}>
              Coverage is not conditional on the individual input. The error on one committed act is not
              bounded by α. Hikae is a monitor — a second-level check, not a promise about any single case.
              It gates order tools; it never calls them.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 10px", fontWeight: 600 }}>Where to read more</h2>
            <p style={{ margin: 0, ...bodyText, fontSize: 15 }}>
              <Link href="/integrators" style={{ color: "var(--monark-t)" }}>
                For integrators
              </Link>{" "}
              for the frozen contracts you send and receive.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
