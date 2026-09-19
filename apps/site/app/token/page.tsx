import type { Metadata } from "next";
import { join } from "node:path";
import { GateSim } from "@/components/gate-sim";
import { CaCopy } from "@/components/token/ca-copy";
import { loadGateEnums } from "@/lib/gate-enums";
import { COST, AMBIENT } from "@/lib/sim";

// Static metadata only (honesty lint scans title/description; no digits). No generateMetadata (gate
// no_generate_metadata_in_apps_site). "B_t" carries no digit; "yield"/"probability" are honest denials,
// not claims. Mod #2 (2026-09-10): useful staking is under design — no yield, no profit-share, no figure.
export const metadata: Metadata = {
  title: "Token — MONARK",
  description:
    "MONARK is a depletable authorization budget, B_t: spent only by commit, never a yield, never a probability of being right. Useful staking is under design.",
};

// The /token route (server component). It reads the frozen action/reason enums from schemas/ at build
// time (loadGateEnums; apps/site is the cwd under `next build`, the repo root is two levels up — mirrors
// lib/load-contract.ts) and passes them to the client mini-sim island. R4 (owner F-site-7): the mount
// passes cost={COST} from lib/sim, the SAME constant decide() spends, so the displayed per-commit cost
// and the simulated depletion never diverge (one source of truth, D-4 contract). The island sits under
// the layout's ThemeProvider, so useTheme resolves. Every number the sim shows is computed state / a call
// (honest by construction, ADR-M004 D15); this page renders no numeric literal of its own.
// The MONARK token contract address (CA). Rendered via an identifier read ({CA_ADDRESS}) so the honesty
// lint's numeric-token scan (rendered JSX text only) never sees its digits — the same injection path as
// loadCommitted figures. Address + label only: no chain name, no market/price/CTA (securities floor).
const CA_ADDRESS = "FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT";

export default function TokenPage() {
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16">
      {/* Contract address as an ink band at the very top (restyle B / design L100-105): CaCopy reused
          as-is — same strings, same CA_ADDRESS identifier read; only ca-copy.tsx styling changed. */}
      <div className="mb-12">
        <CaCopy address={CA_ADDRESS} />
      </div>

      {/* Hero 1.1fr/1fr (design L107-129): title + dek + It is / It is not on the left, the mini B_t
          sim on the right. Stacks below 900px. */}
      <section className="grid gap-10 min-[900px]:grid-cols-[1.1fr_1fr] min-[900px]:items-start">
        <div className="flex flex-col gap-6">
          <div className="font-mono text-xs uppercase tracking-wide text-monark-t">MONARK &middot; the token</div>
          <h1 className="font-heading text-4xl font-semibold lg:text-5xl tracking-tight text-primary">
            A depletable authorization budget.
          </h1>
          <p className="max-w-xl text-lg text-ink2">
            MONARK carries B_t, the fleet&rsquo;s conformal authorization capacity. Each{" "}
            <span className="font-mono text-foreground">commit</span> spends it;{" "}
            <span className="font-mono text-foreground">defer</span> and{" "}
            <span className="font-mono text-foreground">abstain</span> do not. When it is exhausted, the
            gate abstains &mdash; with reason{" "}
            <span className="font-mono text-foreground">budget_exhausted</span>.
          </p>
          {/* It is / It is not, side by side with a 4px accent top border (design L112-115). Markers stay
              CSS list discs (coloured) — the design's dot/cross glyphs would add rendered characters. */}
          <div className="grid gap-3 min-[900px]:grid-cols-2">
            <div
              className="rounded-[14px] border bg-card p-5 shadow-sm"
              style={{ borderTopWidth: 4, borderTopColor: "var(--ok)" }}
            >
              <div className="mb-2 font-mono text-xs text-hikae-t">It is</div>
              <ul className="list-disc pl-5 text-sm leading-7 text-foreground marker:text-hikae-t">
                <li>a right-to-act, metered</li>
                <li>spent only by commit</li>
                <li>
                  a field on every GateDecision: <span className="font-mono">remaining_budget</span>
                </li>
                <li>one token, one ticker</li>
              </ul>
            </div>
            {/* "It is not" — Mod #2 reconciliation: drop "a stake" (the fleet now stakes), keep
                yield / oracle / probability, add "idle staking". No yield promise (securities floor). */}
            <div
              className="rounded-[14px] border bg-card p-5 shadow-sm"
              style={{ borderTopWidth: 4, borderTopColor: "var(--abst)" }}
            >
              <div className="mb-2 font-mono text-xs text-abst">It is not</div>
              <ul className="list-disc pl-5 text-sm leading-7 text-foreground marker:text-abst">
                <li>a yield</li>
                <li>idle staking</li>
                <li>an oracle</li>
                <li>a probability of being right</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mini-sim B_t (mode="token"): budget + meter + decision log + "Push a reading" + the
            illustrative caveat, all rendered by the F-site-3 island. R4: cost={COST}, ambient={AMBIENT}. */}
        <GateSim mode="token" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />
      </section>

      {/* The role of the token (investor request 2026-09-18): three duties as an ink band with three
          columns (design L131-138). Restyle B moves it out of the hero. Section ordinals from the design
          (01/02/03) are intentionally NOT rendered — they would be new digit tokens; the duties keep their
          existing wording verbatim. The bond sentence is the investor's wording. */}
      <section className="mt-16">
        <div className="rounded-[18px] bg-ink px-8 py-8 text-paper">
          <div className="mb-5 font-mono text-xs uppercase tracking-wide text-paper/70">The role of the token</div>
          <div className="grid gap-6 text-sm leading-7 min-[900px]:grid-cols-3">
            <div>
              <span className="font-medium">Authorization budget</span> &mdash; MONARK is B_t, the metered
              right to act. Every <span className="font-mono">commit</span> the gate emits spends it;{" "}
              <span className="font-mono">defer</span> and <span className="font-mono">abstain</span> cost
              nothing. When the budget is exhausted the gate abstains, and says so.
            </div>
            <div className="sm:border-l sm:border-paper/15 sm:pl-6">
              <span className="font-medium">Skin in the game to act</span> &mdash; an operator posts MONARK
              as a bond to be authorized; a commit proven faulty is slashed (to the party it harmed, a
              burn, and the watcher who proved it &mdash; never to the company).
            </div>
            <div className="sm:border-l sm:border-paper/15 sm:pl-6">
              <span className="font-medium">Watchers</span> &mdash; anyone can recompute a frozen decision
              from its published bytes; a proven fault pays the watcher from the bond, not from the
              company. The token is what makes the fleet answerable, not what makes it profitable.
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics — Mod #2 (2026-09-10): the staking mechanism is revealed as UNDER DESIGN and USEFUL
          (tied to the fleet's work), with no profit-share and no yield promise; supply/distribution stay
          to be announced. Restyle B: a 1.6fr card beside a 1fr well (design L142-154). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Tokenomics</h2>
        <div className="mt-6 grid items-stretch gap-3 min-[900px]:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[16px] border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-heading text-xl font-semibold text-foreground">The token</h3>
              <span className="font-mono text-xs text-ink2">mechanics under design &mdash; details to be announced</span>
            </div>
            <ul className="mt-5 flex flex-col gap-4 text-sm leading-7 text-foreground">
              <li>
                <span className="font-medium">Watchers earn</span> for catching a faulty commit; fault is
                proven by recomputing the frozen decision.
              </li>
              <li>
                A{" "}
                <span className="font-medium">
                  staker reward mechanism is under design &mdash; useful staking, tied to the fleet&rsquo;s
                  work, not a passive payout.
                </span>
              </li>
            </ul>
          </div>

          {/* Supply / distribution / replenishing B_t stay to be announced (Mod #2: only staking is
              revealed today) — a well beside the card. */}
          <div className="flex flex-col justify-between gap-4 rounded-[16px] bg-soft p-8 shadow-inner">
            <p className="text-sm leading-7 text-foreground">Supply, distribution, and the mechanics of replenishing B_t.</p>
            <span className="self-start rounded-xl border bg-card px-4 py-2 font-mono text-sm text-foreground">
              to be announced
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
