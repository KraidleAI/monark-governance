import { join } from "node:path";
import Link from "next/link";
import { GateSim } from "@/components/gate-sim";
import { ShogenPanel } from "@/components/shogen-panel";
import { HikaePanel } from "@/components/hikae-panel";
import { UkemiPanel } from "@/components/ukemi-panel";
import { loadAttestedPriceContract, loadContract } from "@/lib/load-contract";
import { loadGateEnums } from "@/lib/gate-enums";
import { AMBIENT, COST } from "@/lib/sim";

// Home — a server shell over ONE client island (the engine board = GateSim mode="board":
// hero statement + profile picker + sensors→adapter→gate→acts pipeline + aside). The frozen `action`/reason
// enums are read server-side (gate-enums.ts) and passed as props, so the client island never imports a
// node: module (K-2 bundling proof). Below the board: the thesis, the built fleet (the /#fleet renvoi
// target from /roadmap, kept until F-site-6 ships /fleet), and the token teaser.
//
// Honesty: every rendered count is a word; the thesis / engine-board ordinals (01–04) are closed-exempt
// (honesty-lint.exempt.json, C-6 inertia guard); the lower-case "no confidence field" R-E carrier lives in
// the thesis as JSX TEXT (C-6; the vocab-exemption carrier check reads renderedTexts()); the sim is
// illustrative and carries its C-5 caveat inside the board.

const soft: React.CSSProperties = { background: "var(--soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" };
const mono: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

export default function HomePage() {
  // Frozen contracts + gate enums, read from schemas/ at build time (server component). apps/site is the
  // cwd under `next build`; the repo root is two levels up (mirrors lib/load-committed.ts).
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);
  const attestedContract = loadAttestedPriceContract(root);
  const coverageContract = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const predictionContract = loadContract(root, "prediction.schema.json", "Ukemi");

  return (
    <main>
      {/* Hero + engine board (client island; the live sim drives the gate card, the picker the plumbing). */}
      <GateSim mode="board" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />

      {/* Thesis — three principles (design L139-145). Col 01 carries the lower-case "no confidence field". */}
      <section data-screen-label="Home thesis" style={soft}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-14 md:grid-cols-3">
          <div>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>01 — a region, not a score</div>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, textWrap: "pretty" }}>
              The gate outputs a coverage region — a set or an interval — and a decision.
              There is no confidence field, anywhere. The contract layer enforces this in code.
            </p>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>02 — a budget, not a yield</div>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, textWrap: "pretty" }}>
              MONARK carries B_t, a depletable authorization budget. Each commit spends it; defer and
              abstain do not. It is the fleet&rsquo;s metered right-to-act.
            </p>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>03 — products, not tokens</div>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, textWrap: "pretty" }}>
              Sensors that attest, a gate that authorizes, acts that execute. Every agent is a product;
              there is one token and one ticker.
            </p>
          </div>
        </div>
      </section>

      {/* The built fleet — the /#fleet renvoi target (from /roadmap). Reuses the three built panels as-is
          (PLAN §2). A bridge until F-site-6 ships /fleet + F-site-7 repoints the roadmap link. */}
      <section id="fleet" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 py-14">
        <h2 className="font-heading text-2xl font-semibold tracking-tight" style={{ letterSpacing: "-.02em" }}>
          The built fleet
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--ink2)" }}>
          The first vertical, built end to end and closed under independent review: Shōgen → Hikae →
          Ukemi. Open a panel for how it works, how it is built, its honest limits, and its frozen
          contract. More agents are named on the{" "}
          <Link href="/roadmap" className="underline underline-offset-4">
            fleet roadmap
          </Link>
          .
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ShogenPanel contract={attestedContract} />
          <HikaePanel contract={coverageContract} />
          <UkemiPanel contract={predictionContract} />
        </div>
      </section>

      {/* Token teaser — renvoi to /token, no figure. "not idle staking" applies Mod #2's ratified
          reconciliation (staking is useful, not idle) for site-wide consistency with the token page. */}
      <section data-screen-label="Home token" className="mx-auto max-w-[1200px] px-6 pb-20">
        <div
          className="grid grid-cols-1 items-center gap-7 md:grid-cols-2"
          style={{ border: "1px solid var(--line)", borderRadius: 20, padding: 36, background: "var(--card)" }}
        >
          <div>
            <div style={{ ...mono, fontSize: 12, color: "var(--monark-t)", marginBottom: 10 }}>MONARK — one token, one ticker</div>
            <h3 style={{ fontSize: 28, letterSpacing: "-.02em", margin: "0 0 10px", fontWeight: 600 }}>
              A depletable authorization budget.
            </h3>
            <p style={{ margin: 0, color: "var(--ink2)", lineHeight: 1.55 }}>
              Not a yield, not idle staking, not an oracle. B_t is the fleet&rsquo;s right-to-act, metered.
              Tokenomics: to be announced.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-3 md:justify-end">
            <Link
              href="/token"
              className="inline-flex items-center"
              style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 14 }}
            >
              What B_t is and is not
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
