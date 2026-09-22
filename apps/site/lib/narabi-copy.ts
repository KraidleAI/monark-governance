// apps/site/lib/narabi-copy.ts — the explanatory copy of /narabi (T0 content, investor 2026-09-18).
// Plain module constants rendered by property access, so every figure that appears (the calibration size,
// the class name, the citation years) is a read of this file, never a rendered literal in JSX. Same
// mechanism as D8_SENTENCE. Facts here restate the committed calibration (apps/harness/src/calibration.ts)
// and ADR-M012; nothing is a forecast, a price, or a probability of being right.

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
    claim: "Two static files, appended once a day, never rewritten.",
    detail:
      "state.json holds the tracker; timeline.jsonl grows by one line per daily UTC window. Each line carries the hash of the previous one, so a rewrite is detectable by anyone holding an older copy. Detectable, not certified: the only guarantor of the facts is the recompute.",
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
      "Each step prints the Angelopoulos, Barber and Bates Theorem 1 quantity for the decaying step tracker. It tightens as windows accumulate and stays above the target for a long time; the page prints the projected day rather than hiding it.",
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
  "Score the pair against the persistence forecast (tomorrow's v is today's v), step the tracker on it, and append the line with its hash, the sentinel's version and the endpoints used.",
];

export const GATE = {
  cls: "stable-run-velocity-24h",
  key: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
  nCalib: "613",
  body:
    "The gate tool on mcp.monarkgate.tech/mcp serves one committed class for the USDe population, calibrated on 613 calm pairs. Every other population abstains under_calib. The committed region is locked to one key; no family label routes around it, and the tracker printed on this page is not what the gate reads.",
} as const;

export const NOT_LIST: string[] = [
  "Not a per window coverage.",
  "Not a probability of being right.",
  "Not a price, a peg gauge or a run alarm.",
  "Not a trend: seven steps is a week, nothing stronger.",
  "Not a switch: a drift opens an ADR, never an automatic change.",
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: "T", def: "Number of evaluable pairs stepped so far. Read from state.json, never typed on this page." },
  { term: "q₁", def: "The committed static calibration threshold, the one the gate reads." },
  { term: "q_t", def: "The tracker's current threshold after T steps. Published, not consumed by the gate." },
  { term: "bound_thm1", def: "The long-run bound for the current T. A dash means no evaluable pair yet." },
  { term: "regime", def: "calm or stressed: calm when burns stay under one percent of the opening stock." },
  { term: "pair", def: "evaluable, non evaluable or clipped: whether the window contributes a step." },
  { term: "calm-miss", def: "Share of calm pairs whose residual exceeded q₁, over the rolling window. Metadata for the criterion, never a tracker filter." },
  { term: "segment", def: "A run of unchanged sentinel parameters. Any change opens a new one, visibly." },
  { term: "under_calib", def: "Too few calibration points for a population: the gate abstains for it, serving no region while its state is published. A named state, never a number." },
];

export const FLEET_PLACE =
  "Narabi is the sensor of the first vertical. Shōgen attests, Hikae reads coverage, Ukemi carries the prediction contract; Narabi measures the realized redemption flow and feeds the gate's one committed class. It is the first MONARK piece that publishes its own daily state for public replay.";

export const VERIFY_HINT =
  "Pull both files. Recompute any window from its block range with eth_getLogs and totalSupply. Rederive q_t from the s column with the tracker replay printed below. Compare hashes. If anything differs, that is the finding, and it is yours to publish.";
