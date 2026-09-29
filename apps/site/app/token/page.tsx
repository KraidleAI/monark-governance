import type { Metadata } from "next";
import Link from "next/link";
import { join } from "node:path";
import { GateSim } from "@/components/gate-sim";
import { CaCopy } from "@/components/token/ca-copy";
import { loadGateEnums } from "@/lib/gate-enums";
import { COST, AMBIENT, BT_SERVED_RULE, BT_FLOOR_RULE } from "@/lib/sim";
import { loadDojoServed } from "@/lib/dojo-served-load";
import { DOJO_ROUTE, DOJO_TITLE } from "@/lib/dojo-copy";

// Static metadata only (honesty lint scans title/description; no digits). No generateMetadata (gate
// no_generate_metadata_in_apps_site). "B_t" carries no digit; "yield"/"probability" are honest denials,
// not claims. Useful staking is under design — no yield, no profit-share, no figure. What the budget does is the
// served rule (lib/sim.ts BT_SERVED_RULE): caller-carried, returned unchanged by the gate.
export const metadata: Metadata = {
  title: "Token — MONARK",
  description:
    "MONARK is an authorization budget, B_t: carried by the caller and returned unchanged by the gate, never a yield, never a probability of being right. Useful staking is under design.",
};

// The /token route (server component). It reads the frozen action/reason enums from schemas/ at build
// time (loadGateEnums; apps/site is the cwd under `next build`, the repo root is two levels up — mirrors
// lib/load-contract.ts) and passes them to the client mini-sim island. The mount passes cost={COST} from
// lib/sim, the SAME constant decide() spends in the simulation, so the displayed per-commit cost and the simulated
// depletion never diverge (one source of truth). The island sits under the layout's ThemeProvider, so useTheme
// resolves. Every number the sim shows is computed state / a call (honest by construction); this page renders no
// numeric literal of its own.
// The MONARK token contract address (CA). Rendered via an identifier read ({CA_ADDRESS}) so the honesty
// lint's numeric-token scan (rendered JSX text only) never sees its digits — the same injection path as
// loadCommitted figures. Address + label only: no chain name, no market/price/CTA (securities floor).
const CA_ADDRESS = "FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT";

export default function TokenPage() {
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);
  // The hold snapshot page exists only once a snapshot is served (a committed record): no link to it before.
  const dojo = loadDojoServed(root);
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Contract address first: copyable field + copy button, before the hero. The address is an identifier
          read (CA_ADDRESS), never a rendered numeric literal. */}
      <div className="mb-10">
        <CaCopy address={CA_ADDRESS} />
      </div>

      {/* Hero (the token) + the mini B_t depletion sim (design L358-378). */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="font-mono text-xs uppercase tracking-wide text-monark-t">MONARK &middot; the token</div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-primary">
            A depletable authorization budget.
          </h1>
          <p className="max-w-xl text-lg text-ink2">
            B_t is the authorization budget, the right to act. {BT_SERVED_RULE}; {BT_FLOOR_RULE}.
          </p>
          {/* The role of the token: three duties, stated without a yield, a price or a probability. The bond
              sentence is the owner's wording, verbatim. */}
          <div className="rounded-2xl border bg-soft p-6">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-monark-t">The role of the token</div>
            <ul className="flex flex-col gap-3 text-sm leading-7 text-foreground">
              <li>
                <span className="font-medium">Authorization budget</span> &mdash; MONARK is B_t, the right to
                act, carried by the caller: the gate returns it unchanged with every decision, and abstains, saying
                so, when it is below the caller&rsquo;s floor.
              </li>
              <li>
                <span className="font-medium">Skin in the game to act</span> &mdash; an operator posts MONARK
                as a bond to be authorized; a commit proven faulty is slashed (to the party it harmed, a
                burn, and the watcher who proved it &mdash; never to the company).
              </li>
              <li>
                <span className="font-medium">Watchers</span> &mdash; anyone can recompute a frozen decision
                from its published bytes; a proven fault pays the watcher from the bond, not from the
                company. The token is what makes the fleet answerable, not what makes it profitable.
              </li>
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-2 font-mono text-xs text-hikae-t">It is</div>
              <ul className="list-disc pl-5 text-sm leading-7 text-foreground">
                <li>a right-to-act, metered</li>
                <li>carried by the caller, returned unchanged by the gate</li>
                <li>
                  a field on every GateDecision: <span className="font-mono">remaining_budget</span>
                </li>
                <li>one token, one ticker</li>
              </ul>
            </div>
            {/* "It is not" — yield / oracle / probability, and "idle staking" (the fleet stakes usefully). No
                yield promise (securities floor). */}
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
            illustrative caveat and the served-budget note, all rendered by the sim island; cost={COST}, ambient={AMBIENT}. */}
        <GateSim mode="token" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />
      </section>

      {/* Tokenomics — the staking mechanism is said to be UNDER DESIGN and USEFUL (tied to the fleet's work),
          with no profit-share and no yield promise; supply/distribution stay to be announced. */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Tokenomics</h2>
        <div className="mt-6 rounded-2xl border bg-soft p-8">
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

        {/* Supply / distribution / replenishing B_t stay to be announced (only staking is described today). */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <p className="text-sm text-ink2">Supply, distribution, and the mechanics of replenishing B_t.</p>
          <span className="rounded-xl border bg-soft px-4 py-2 font-mono text-sm text-foreground">
            to be announced
          </span>
        </div>
        {dojo === null ? null : (
          <p className="mt-4 text-sm">
            <Link href={DOJO_ROUTE}>{DOJO_TITLE}</Link>
          </p>
        )}
      </section>
    </main>
  );
}
