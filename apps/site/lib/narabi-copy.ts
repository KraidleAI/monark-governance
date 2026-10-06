// apps/site/lib/narabi-copy.ts — the explanatory copy of /narabi (content of 2026-09-18).
// Plain module constants rendered by property access. DIGIT-FREE (test/narabi-live.test.ts scans every string
// here): the calibration size is read at build from the committed score fixture (lib/narabi-calib-load.ts) and
// spliced into GATE_BODY_BEFORE/AFTER; the class and key are read at build from apps/site/data/narabi-served.json
// (lib/narabi-served-load.ts). Facts here restate the committed calibration and the Narabi design record; nothing is a forecast, a
// price, or a probability of being right.

export type Level = { name: string; claim: string; detail: string };

export const LEVELS: Level[] = [
  {
    name: "Attested",
    claim: "Raw burns, mints and closing supply over a declared block window.",
    detail:
      "AttestedFlow is the fifth frozen typed contract. Its bytes recompute from the chain: Transfer events to and from the zero address, plus totalSupply at the closing block. No score, no price, no probability rides on it.",
  },
  {
    name: "Published",
    claim: "The timeline is appended once a day and never rewritten; the state file is replaced each day.",
    detail:
      "state.json holds the tracker as of the last window and is replaced when a window is published; timeline.jsonl grows by one line per daily UTC window. Each line carries the hash of the previous one, so a rewrite is detectable by anyone holding an older copy, and this page checks that the timeline served now extends, byte for byte, the one served when its committed capture was taken. Detectable, not certified: the only check of the facts is the recompute.",
  },
  {
    name: "Preregistered",
    claim: "The committed gate region does not move on its own.",
    detail:
      "It holds until the drift criterion fires (rolling calm-miss at or above the threshold, evaluable after the calm window fills) and an ADR says so. A drift opens a review; it never switches anything automatically.",
  },
  {
    name: "Bounded",
    claim: "A deterministic long-run bound, printed with T, and called weak on purpose.",
    detail:
      "Each step prints the long-run quantity of the first theorem of Angelopoulos, Barber and Bates for the decaying step tracker. It tightens as windows accumulate and stays above the target for a long time; the page prints the projected day rather than hiding it.",
  },
  {
    name: "Adaptive",
    claim: "The word qualifies the quantile tracker, nothing else.",
    detail:
      "The tracker moves each window from the realized outcome. The gate reads the committed static calibration and does not depend on the tracker state. The tracker adapts; the gate does not yet.",
  },
  {
    name: "Conformal",
    claim: "Split conformal calibration plus a decaying step quantile tracker.",
    detail:
      "The gate answers commit, defer or abstain over a region, never a probability of being right. The calibration is measured nonstationary across half years, so under unit weights the honest sentence is the Barber, Candes, Ramdas and Tibshirani one: no coverage is measured.",
  },
];

export const WINDOW_STEPS: string[] = [
  "Fix the daily UTC window and read its block range from the chain, from_block to to_block.",
  "Sum USDe burns and mints inside the range from the token's Transfer events; read the closing supply.",
  "Form the velocity v: burns divided by the opening supply (reconstructed exactly as close plus burns minus mints), per hour of window. Burns only in the numerator; a true fraction of the stock, never the odds.",
  "Classify the window: calm when burns stay under one percent of the opening stock and the stock is above the committed floor; then evaluable, non evaluable or clipped for the pair.",
  "Score the pair against the persistence forecast (tomorrow's v is today's v), step the tracker on it, and append the line with its hash, the sentinel's version and its RPC endpoint pool (this page shows only its size).",
];

// The gate card's lede, split around the calibration size read at build (never typed here).
export const GATE_BODY_BEFORE = "The gate tool on mcp.monarkgate.tech/mcp serves one committed class for the USDe population, calibrated on";
export const GATE_BODY_AFTER =
  "calm pairs. Every other population abstains under_calib. The committed region is locked to one key; no family label routes around it, and the tracker printed on this page is not what the gate reads.";

export function gateBody(nCalib: string): string {
  return `${GATE_BODY_BEFORE} ${nCalib} ${GATE_BODY_AFTER}`;
}

export const GATE_NOTES = {
  cls: "the task class of the served gate description for Narabi's redemption-flow velocity",
  key: "the one (task class, predictor) key the committed region is locked to",
  nCalib: "consecutive calm pairs behind q₁, counted at build from the committed calibration scores",
  digest: "the digest of those scores in their committed order, recomputed at build: the scores digest the gate's verdict carries, not the tracker digest below",
} as const;

export const NOT_LIST: string[] = [
  "Not a per window coverage.",
  "Not a probability of being right.",
  "Not a price, a peg gauge or a run alarm.",
  "Not a trend: seven steps is a week, nothing stronger.",
  "Not a switch: a drift opens an ADR, never an automatic change.",
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: "T", def: "Number of pairs the tracker stepped on so far, evaluable or clipped. Read from state.json, never typed on this page." },
  { term: "q₁", def: "The committed static calibration threshold, the one the gate reads." },
  { term: "q_t", def: "The tracker's current threshold after T steps. Published, not consumed by the gate." },
  { term: "bound_thm1", def: "The long-run bound for the current T. A dash means no stepped pair yet." },
  { term: "regime", def: "calm, stress or below floor: calm when the opening stock is above the committed floor and burns stay under one percent of it." },
  { term: "pair", def: "evaluable, non evaluable or clipped: whether the window contributes a step." },
  { term: "static miss", def: "A stepped pair whose score exceeded q₁, the committed region. Counted, never a coverage." },
  { term: "tracker miss", def: "A stepped pair whose score exceeded the tracker's own threshold before the step." },
  { term: "calm-miss", def: "Share of calm pairs whose residual exceeded q₁, over the rolling window. Metadata for the criterion, never a tracker filter." },
  { term: "supply identity", def: "What each window must satisfy: opening supply equals closing supply plus burns minus mints, checked on every line." },
  { term: "code version", def: "A run of lines written by an unchanged sentinel build and Node version. A new build does not change the tracker parameters." },
  { term: "parameter segment", def: "A run of unchanged tracker parameters. A change of c or ε would open a new one and move the printed bound to the arbitrary-step theorem." },
  { term: "under_calib", def: "Too few calibration points for a population: the gate abstains for it, serving no region while its state is published. A named state, never a number." },
];

export const FLEET_PLACE =
  "Narabi is the sensor of the first vertical. Shōgen attests, Hikae reads coverage, Ukemi carries the prediction contract; Narabi's measured redemption flow produced the committed calibration of the gate's one class, and the daily timeline is published beside it, not read by the gate. It is the first MONARK piece that publishes its own daily state for public replay.";

export const VERIFY_HINT =
  "Pull both files. Recompute any window from its block range with eth_getLogs and totalSupply. Rederive q_t from the s column with the tracker replay printed below. Recompute each line's hash from its fields, as this page does in your browser. The AttestedFlow documents are not served: rebuild one from its window's facts with the public sentinel code and compare its hash with the published one. If anything differs, that is the finding, and it is yours to publish.";
