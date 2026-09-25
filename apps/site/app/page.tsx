import { join } from "node:path";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { GateSim } from "@/components/gate-sim";
import { loadGateEnums } from "@/lib/gate-enums";
import { loadAttestedPriceContract, loadContract } from "@/lib/load-contract";
import { AMBIENT, COST, BT_SERVED_RULE } from "@/lib/sim";
import { NARABI_ROUTE } from "@/lib/narabi-live";
import {
  FLEET_AGENTS,
  PRODUCTS,
  builtAgents,
  upcomingAgents,
  builtProducts,
  countWord,
  capitalized,
  listNames,
} from "@/lib/fleet";
import { LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_COMMITTED_STATE_NOTE, UKEMI_ROUTE } from "@/lib/ukemi-copy";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { loadBellServed, bellServedRepoRoot } from "@/lib/bell-served-load";
import { frozenContractsSummary } from "@/app/roadmap/frozen-contracts";
import { NarabiFreshness } from "@/app/fleet/narabi-freshness";
import { narabiFreshnessProps } from "@/app/fleet/narabi-freshness-props";
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

// Home — charter C landing: hero beside the MONARK noyau (components/noyau: Canvas 2D, no library; reduced motion = one
// still frame; the agents it draws and their built/upcoming groups are READ from the register; the cubes scene lives on
// /bell), the sensors → gate → acts pipeline with the first vertical, the three principles (production thesis — its
// lower-case phrase "no confidence field" is the R-E JSX-text carrier of the vocab exemption), the three surfaces, the
// fleet strip (id="fleet", the /roadmap renvoi target), then GateSim KEPT UNDER THE FOLD and the token teaser. Every
// status is READ from the register (lib/fleet.ts), never typed; every register or schema count is a word derived from the
// register (countWord) or from schemas/ (the frozen-contract count, the gate's action words); the contract names on the
// pipeline tags are the frozen schemas' own titles; the section labels "three principles" and "three surfaces" count the
// page's own fixed cards; the ordinals 01-03 are closed-exempt; no typed figure. The surface cards read their copy from
// the register and from served, committed data through fail-closed loaders: MONARK Bell's function, served note and the
// publication instant of its latest signed record (apps/site/data/bell-served.json, `head`); Ukemi's register tagline, the
// served class it is gated on and the served state of that class as the synced record says it (apps/site/data/
// ukemi-served.json): empty, the served gate's own sentence (lib/ukemi-copy.ts, byte-identical to the served
// description); committed, its digit-free restatement (the served clause carries figures); Narabi's freshness line,
// judged against the served schedule (apps/site/data/narabi-served.json) with the committed capture declared until the
// files as served now are read.
// What the budget does is said once, in the served words (BT_SERVED_RULE, lib/sim.ts).

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
  // The contract names on the pipeline tags: each frozen schema's own title (read at build, never typed).
  const attestedPrice = loadAttestedPriceContract(root).title;
  const attestedFlow = loadContract(root, "attested-flow.schema.json", "Narabi").title;
  const coverageVerdict = loadContract(root, "coverage-verdict.schema.json", "Hikae").title;
  const gateDecision = loadContract(root, "gate-decision.schema.json", "Hikae").title;
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi").title;
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("home: MONARK Bell is absent from PRODUCTS (lib/fleet.ts)");
  const narabi = statusOf("Narabi");
  const ukemi = statusOf("Ukemi");
  const ukemiAgent = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (!ukemiAgent) throw new Error("home: 'Ukemi' is absent from FLEET_AGENTS (lib/fleet.ts)");
  // The first built act of the register, named on the acts card (never typed).
  const firstAct = builtAgents().find((a) => a.role === "act");
  if (!firstAct) throw new Error("home: the register holds no built act (lib/fleet.ts)");
  const builtCount = builtAgents().length;
  const roadmapCount = upcomingAgents().length;
  const builtProductNames = builtProducts().map((p) => p.name);
  // Served Bell facts, read from committed, hashed data (fail-closed loader); nothing typed. The latest signed
  // publication (`head`): its instant, and whether any of its sessions carries a gap yet (a gap needs a closing price).
  const bellServed = loadBellServed(bellServedRepoRoot());
  const noGapYet = bellServed.head.runs.every((r) => r.sessions.every((s) => s.gT === null));
  // Ukemi's served class and the registry state the served gate states for it (committed, hashed data).
  const ukemiServed = loadUkemiServed(root);
  // The Narabi freshness line: the served schedule and the committed capture's facts, read at build (server side).
  const narabiFreshness = narabiFreshnessProps(root);
  // The frozen-contract count and the not-yet-served contract, read from schemas/ at build (the same source as /roadmap).
  const contracts = frozenContractsSummary(root);
  const pill = (s: "built" | "upcoming", built: string): string => (s === "built" ? `c-pill ${built}` : "c-pill c-pill--upcoming");

  return (
    <main>
      <div className="c-herowrap">
        <div className="c-noyau">
          <Noyau className="h-full w-full" />
        </div>
        <div className="c-herotext">
          <div className="c-col">
            <span className="c-label">two sides, one engine</span>
            <h1>One engine. AI side, DeFi side.</h1>
            <p className="c-dek">
              MONARK is one engine with two sides. The AI side is the engine itself: a coverage-controlled gate that
              answers commit, defer or abstain, never a probability of being right, with the components that read,
              attest and act around it. The DeFi side is the on-chain applications it powers.
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
                attested redemption flow (Narabi); Bell&rsquo;s signed session record
                {noGapYet ? <>, whose gap needs a closing price that its latest publication does not carry</> : null}. No score
                rides on it.
              </p>
              <div className="c-states"><span className="c-tag">{attestedPrice}</span><span className="c-tag">{attestedFlow}</span></div>
            </div>
            <div className="c-arrow" aria-hidden="true">→</div>
            <div className="c-card c-card--prov">
              <h3 className="c-h3"><HikaeMark /> the gate <span className="c-label">Hikae + MONARK B_t</span></h3>
              <p className="c-muted">
                Each reading is conformed into a coverage region, then decided. The answer is one of{" "}
                {countWord(actions.length)} words, over a region, with its named residuals; the budget comes back as the
                caller sent it.
              </p>
              <div className="c-states">
                <span className="c-state">commit</span>
                <span className="c-state c-state--dashed">defer</span>
                <span className="c-state c-state--dashed">abstain</span>
                <span className="c-tag">{coverageVerdict}</span>
                <span className="c-tag">{gateDecision}</span>
              </div>
            </div>
            <div className="c-arrow" aria-hidden="true">→</div>
            <div className="c-card">
              <h3 className="c-h3"><UkemiMark /> acts <span className="c-label">execute</span></h3>
              <p className="c-muted">
                An act carries a prediction contract through the gate and does only what a commit allows. {firstAct.name} is
                the first built one
                {ukemiServed.registry_state === "empty" ? <>; the gate abstains on its served class until a calibration is committed</> : null}.
              </p>
              <div className="c-states"><span className="c-tag">{prediction}</span></div>
            </div>
          </div>
          <p className="c-muted c-small" style={{ marginTop: 10 }}>
            The first vertical, built and served piece by piece and composed on the gate path.{" "}
            {capitalized(countWord(contracts.count))} frozen contracts
            {contracts.unservedTitles.length > 0 ? <> ({listNames(contracts.unservedTitles)} upcoming until served)</> : null}; the gate
            emits commit, defer or abstain and a budget, never a return and never a probability of being right.
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
                B_t is the authorization budget. {BT_SERVED_RULE}. It is a right to act, not a yield.
              </p>
            </div>
            <div className="c-card">
              <span className="c-label">03 — applications, not tokens</span>
              <p>
                Sensors that attest, a gate that authorizes, acts that execute. The engine powers the on-chain applications;
                there is one token and one ticker.
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
              {narabi === "built" ? (
                <p className="c-muted c-small">
                  <NarabiFreshness schedule={narabiFreshness.schedule} capture={narabiFreshness.capture} />
                </p>
              ) : null}
              <div className="c-foot">
                <span className={pill(narabi, "c-pill--shipped")}>{narabi}</span>
                <span className="c-mono c-small">/narabi →</span>
              </div>
            </Link>
            <Link className="c-card" href={UKEMI_ROUTE} aria-label="MONARK Ukemi">
              <UkemiLockup className="c-logo" />
              <p className="c-muted">{ukemiAgent.line}</p>
              <p className="c-mono c-small">served class · {ukemiServed.served_class}</p>
              {ukemiServed.registry_state === "empty" ? (
                <p className="c-muted c-small">On the served gate today: {LIQ_EMPTY_REGISTRY_SENTENCE}.</p>
              ) : (
                <p className="c-muted c-small">On the served gate today: {LIQ_COMMITTED_STATE_NOTE}.</p>
              )}
              <div className="c-foot">
                <span className={pill(ukemi, "c-pill--ukemi")}>{ukemi}</span>
                <span className="c-mono c-small">/ukemi →</span>
              </div>
            </Link>
            <Link className="c-card" href="/bell" aria-label="MONARK Bell">
              <BellLockup className="c-logo" />
              <p className="c-muted">{bell.fn}</p>
              {bell.status === "built" ? (
                <p className="c-muted c-small">
                  {capitalized(bell.served.note)}; latest signed record published {bellServed.head.published_at} (UTC).
                </p>
              ) : null}
              <div className="c-foot">
                <span className={pill(bell.status, "c-pill--built")}>{bell.status}</span>
                <span className="c-mono c-small">/bell →</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="c-section" id="fleet" aria-labelledby="l-fleet">
          <span className="c-label" id="l-fleet">
            the fleet · {countWord(builtCount)} built, {countWord(roadmapCount)} on the roadmap
            {builtProductNames.length > 0 ? (
              <>
                {" "}
                · {countWord(builtProductNames.length)} built {builtProductNames.length === 1 ? "application" : "applications"} (
                {listNames(builtProductNames)})
              </>
            ) : null}{" "}
            · <Link href="/fleet">register →</Link>
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
            or an application that is not built.
          </p>
        </section>
      </div>

      {/* GateSim under the fold: the illustrative engine board, unchanged, in the charter tokens. */}
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
                Not a yield, not idle staking, not an oracle: the right to act, carried by the caller. Tokenomics: to be
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
