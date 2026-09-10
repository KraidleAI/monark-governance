import type { Metadata } from "next";
import { join } from "node:path";
import { GateSim } from "@/components/gate-sim";
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
export default function TokenPage() {
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero (the token) + the mini B_t depletion sim (design L358-378). */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="font-mono text-xs uppercase tracking-wide text-monark-t">MONARK &middot; the token</div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-primary">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-2 font-mono text-xs text-hikae-t">It is</div>
              <ul className="list-disc pl-5 text-sm leading-7 text-foreground">
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
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-2 font-mono text-xs text-abst">It is not</div>
              <ul className="list-disc pl-5 text-sm leading-7 text-foreground">
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

      {/* Tokenomics — Mod #2 (2026-09-10): the staking mechanism is revealed as UNDER DESIGN and USEFUL
          (tied to the fleet's work), with no profit-share and no yield promise; supply/distribution stay
          to be announced. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Tokenomics</h2>
        <div className="mt-6 rounded-2xl border bg-soft p-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-heading text-xl font-semibold text-foreground">The token</h3>
            <span className="font-mono text-xs text-ink2">mechanics under design &mdash; details to be announced</span>
          </div>
          <ul className="mt-5 flex flex-col gap-4 text-sm leading-7 text-foreground">
            <li>
              <span className="font-medium">Stakers get discounts</span> on the products they use.
            </li>
            <li>
              <span className="font-medium">Skin in the game to act</span> &mdash; an operator posts MONARK
              as a bond to be authorized; a commit proven faulty is <span className="font-medium">slashed</span>{" "}
              (to the party it harmed, a burn, and the watcher who proved it &mdash; never to the company).
            </li>
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
            revealed today). */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <p className="text-sm text-ink2">Supply, distribution, and the mechanics of replenishing B_t.</p>
          <span className="rounded-xl border bg-soft px-4 py-2 font-mono text-sm text-foreground">
            to be announced
          </span>
        </div>
      </section>
    </main>
  );
}
