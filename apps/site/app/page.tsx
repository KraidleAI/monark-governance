import { join } from "node:path";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { GateSim } from "@/components/gate-sim";
import { loadGateEnums } from "@/lib/gate-enums";
import { AMBIENT, COST } from "@/lib/sim";
import { NARABI_ROUTE } from "@/lib/narabi-live";
import { FLEET_AGENTS, PRODUCTS } from "@/lib/fleet";
import { NarabiLockup, UkemiLockup, BellLockup, BellMark } from "@/components/lockups";
import { Noyau } from "@/components/noyau/noyau";
import { ShogenMark } from "@/components/marks/shogen-mark";
import { HikaeMark } from "@/components/marks/hikae-mark";
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { MokugekiMark } from "@/components/marks/mokugeki-mark";
import { KaihiMark } from "@/components/marks/kaihi-mark";
import { KessaiMark } from "@/components/marks/kessai-mark";
import { KamaeMark } from "@/components/marks/kamae-mark";
import { KyokusenMark } from "@/components/marks/kyokusen-mark";
import { KoyomiMark } from "@/components/marks/koyomi-mark";
import { GenkanMark } from "@/components/marks/genkan-mark";

// Home — charter C landing (decision 145; mock index.html; rulings Q4/Q5): hero beside the MONARK noyau
// (components/noyau, investor delivery of 2026-09-23: Canvas 2D, no library; reduced motion = one still frame; the
// agents it draws and their built/upcoming groups are READ from the register; the cubes scene moved to /bell), the
// sensors → gate → acts pipeline with the first vertical, the three principles (production thesis, verbatim — its lower-case phrase
// "no confidence field" is the R-E JSX-text carrier of the vocab exemption), the three product surfaces, the fleet
// strip (id="fleet", the /roadmap renvoi target), then GateSim KEPT UNDER THE FOLD (ruling Q4) and the token
// teaser. Every status is READ from the register (lib/fleet.ts), never typed; every count is a word derived from
// the register; the ordinals 01-03 are closed-exempt; no figure.
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

const MARKS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Shōgen: ShogenMark,
  Hikae: HikaeMark,
  Ukemi: UkemiMark,
  Narabi: NarabiMark,
  Mokugeki: MokugekiMark,
  Kaihi: KaihiMark,
  Kessai: KessaiMark,
  Kamae: KamaeMark,
  Kyokusen: KyokusenMark,
  Koyomi: KoyomiMark,
  Genkan: GenkanMark,
};

function statusOf(name: string): "built" | "upcoming" {
  const a = FLEET_AGENTS.find((x) => x.name === name);
  if (!a) throw new Error(`home: agent '${name}' is absent from the fleet register (lib/fleet.ts)`);
  return a.status;
}

export default function HomePage() {
  // Frozen gate enums, read from schemas/ at build time (server component); passed to the client island.
  const root = join(process.cwd(), "..", "..");
  const { actions, reasons } = loadGateEnums(root);
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("home: MONARK Bell is absent from PRODUCTS (lib/fleet.ts)");
  const narabi = statusOf("Narabi");
  const ukemi = statusOf("Ukemi");
  const builtCount = FLEET_AGENTS.filter((a) => a.status === "built").length;
  const roadmapCount = FLEET_AGENTS.filter((a) => a.status === "upcoming").length;
  const pill = (s: "built" | "upcoming", built: string): string => (s === "built" ? `c-pill ${built}` : "c-pill c-pill--upcoming");

  return (
    <main>
      <div className="c-herowrap">
        <div className="c-noyau">
          <Noyau className="h-full w-full" />
        </div>
        <div className="c-herotext">
          <div className="c-col">
            <span className="c-label">a company of agent-products on one coverage-controlled gate</span>
            <h1>One engine. AI layers, DeFi layers.</h1>
            <p className="c-dek">
              MONARK is an engine: a coverage-controlled gate at the core, AI layers that read and attest, DeFi layers
              that act on-chain. Built agents run on the orbits and meet the gate where they cross; upcoming ones wait
              on the dashed ring. Each status comes from the fleet register.
            </p>
            <div className="c-ctas">
              <a className="c-btn c-btn--fill" href="#gate">
                How the gate answers
              </a>
              <Link className="c-btn c-btn--line" href="/fleet">
                Open the fleet
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="c-main">
        <section className="c-section" id="gate" aria-labelledby="l-gate">
          <span className="c-label" id="l-gate">sensors attest · the gate decides · acts execute</span>
          <div className="c-pipe">
            <div className="c-card">
              <h3 className="c-h3"><ShogenMark /> sensors <span className="c-label">attest</span></h3>
              <p className="c-muted">
                A sensor writes down what it saw, as bytes anyone can recompute: an attested price testimony (Shōgen), an
                attested redemption flow (Narabi); Bell&rsquo;s signed off-hours record, whose gap needs a closing price that its
                first record does not carry. No score rides on it.
              </p>
              <div className="c-states"><span className="c-tag">AttestedPrice</span><span className="c-tag">AttestedFlow</span></div>
            </div>
            <div className="c-arrow" aria-hidden="true">→</div>
            <div className="c-card c-card--prov">
              <h3 className="c-h3"><HikaeMark /> the gate <span className="c-label">Hikae + MONARK B_t</span></h3>
              <p className="c-muted">
                Each reading is conformed into a coverage region, then decided. The answer is one of three words, over a
                region, with its named residuals. A commit spends the budget; defer and abstain do not.
              </p>
              <div className="c-states">
                <span className="c-state">commit</span>
                <span className="c-state c-state--dashed">defer</span>
                <span className="c-state c-state--dashed">abstain</span>
                <span className="c-tag">CoverageVerdict</span>
                <span className="c-tag">GateDecision</span>
              </div>
            </div>
            <div className="c-arrow" aria-hidden="true">→</div>
            <div className="c-card">
              <h3 className="c-h3"><UkemiMark /> acts <span className="c-label">execute</span></h3>
              <p className="c-muted">
                An act carries a prediction contract through the gate and does only what a commit allows. Ukemi is the first:
                liquidation-cascade survival; until a cascade calibration is committed it abstains by construction.
              </p>
              <div className="c-states"><span className="c-tag">Prediction</span></div>
            </div>
          </div>
          <p className="c-muted c-small" style={{ marginTop: 10 }}>
            First vertical, built and served piece by piece: Shōgen → Hikae → Ukemi. Five frozen contracts; the gate emits
            commit, defer or abstain and a budget, never a return and never a probability of being right.
          </p>
        </section>

        <section className="c-section" aria-labelledby="l-thesis">
          <span className="c-label" id="l-thesis">three principles</span>
          <div className="c-thesis">
            <div className="c-card">
              <span className="c-label">01 — a region, not a score</span>
              <p>
                The gate outputs a coverage region — a set or an interval — and a decision.
                There is no confidence field, anywhere. The contract layer enforces this in code.
              </p>
            </div>
            <div className="c-card">
              <span className="c-label">02 — a budget, not a yield</span>
              <p>
                MONARK carries B_t, a depletable authorization budget. Each commit spends it; defer and abstain do not. It is
                the fleet&rsquo;s metered right-to-act.
              </p>
            </div>
            <div className="c-card">
              <span className="c-label">03 — products, not tokens</span>
              <p>
                Sensors that attest, a gate that authorizes, acts that execute. Every agent is a product; there is one token
                and one ticker.
              </p>
            </div>
          </div>
        </section>

        <section className="c-section" id="products" aria-labelledby="l-products">
          <span className="c-label" id="l-products">three surfaces · one status word each, from the register</span>
          <div className="c-products">
            <Link className="c-card" href={NARABI_ROUTE} aria-label="MONARK Narabi">
              <NarabiLockup className="c-logo" />
              <p className="c-muted">
                Redemption-flow sensor: one attested daily UTC window per line, a published replayable timeline, a
                pre-registered drift criterion, a long-run bound printed with T. The tracker adapts; the gate does not yet.
              </p>
              <div className="c-foot">
                <span className={pill(narabi, "c-pill--shipped")}>{narabi === "built" ? `${narabi} · ships and runs daily` : narabi}</span>
                <span className="c-mono c-small">/narabi →</span>
              </div>
            </Link>
            <Link className="c-card" href="/ukemi" aria-label="MONARK Ukemi">
              <UkemiLockup className="c-logo" />
              <p className="c-muted">
                Attested measure of liquidation exposure on a lending venue: a book at a block, the realized oracle path, a
                conformal region with its named residuals, per stratum.
              </p>
              <div className="c-foot">
                <span className={pill(ukemi, "c-pill--ukemi")}>{ukemi}</span>
                <span className="c-mono c-small">/ukemi →</span>
              </div>
            </Link>
            <Link className="c-card" href="/bell" aria-label="MONARK Bell">
              <BellLockup className="c-logo" />
              <p className="c-muted">
                A public, signed record of how tokenized U.S. equities trade on a public ledger while U.S. markets are
                closed: a gap per session when its closing price can be read, a named abstention when it cannot, an anchored digest.
              </p>
              <div className="c-foot">
                <span className={pill(bell.status, "c-pill--built")}>{bell.status}</span>
                <span className="c-mono c-small">/bell →</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="c-section" id="fleet" aria-labelledby="l-fleet">
          <span className="c-label" id="l-fleet">
            the fleet · {WORDS[builtCount]} built, {WORDS[roadmapCount]} on the roadmap · <Link href="/fleet">register →</Link>
          </span>
          <div className="c-marks">
            {FLEET_AGENTS.map((a) => {
              const Mark = MARKS[a.name];
              return (
                <span key={a.name} className={a.status === "built" ? "c-markcell" : "c-markcell c-markcell--up"}>
                  {Mark ? <Mark /> : null}
                  {a.name}
                </span>
              );
            })}
            <span className={bell.status === "built" ? "c-markcell c-markcell--bell" : "c-markcell c-markcell--up c-markcell--bell"}>
              <BellMark />
              Bell
            </span>
          </div>
          <p className="c-muted c-small" style={{ marginTop: 10 }}>
            Solid outline: built and served on a tested path. Dashed: named, not delivered; nothing is claimed for an agent
            or a product that is not built.
          </p>
        </section>
      </div>

      {/* GateSim under the fold (ruling Q4): the illustrative engine board, unchanged, in the charter tokens. */}
      <section className="c-section" aria-labelledby="l-sim">
        <div className="c-main" style={{ paddingBottom: 0 }}>
          <span className="c-label" id="l-sim">the gate, simulated · illustrative, not market activity</span>
        </div>
        <GateSim mode="board" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />
      </section>

      <div className="c-main">
        <section className="c-section" id="token" aria-labelledby="l-token">
          <span className="c-label" id="l-token">MONARK — one token, one ticker</span>
          <div className="c-card c-token">
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-.02em", margin: 0 }}>A depletable authorization budget.</h2>
              <p className="c-muted" style={{ marginTop: 8 }}>
                Not a yield, not idle staking, not an oracle. B_t is the fleet&rsquo;s right-to-act, metered. Tokenomics: to be
                announced.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <Link className="c-btn c-btn--line" href="/token">
                What B_t is and is not
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
