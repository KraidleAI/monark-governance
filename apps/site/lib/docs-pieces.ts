// apps/site/lib/docs-pieces.ts: the words of each piece page of the documentation (/docs/pieces/<slug>). PURE DATA, no
// import (see lib/fleet.ts on the two module resolutions), keyed by the piece slug that lib/docs-nav.ts derives from the
// register name. What is NOT here, on purpose: a piece's status and name (read from the fleet register by the page), the
// frozen contract titles and field lists (read from schemas/ by the page, through the file names below), the served facts
// (read from the committed, hashed served data), and any number. Every string is digit-free, dash-free and ASCII; the root
// test test/site-docs.test.ts scans them all and pins the key set to the register's slugs, both ways.
//
// Tense follows the register without branching: a built piece is described as it runs; an upcoming piece in the
// conditional ("would"), with the words named, not delivered.

export interface PieceZone {
  title: string;
  lines: readonly string[];
}

export interface PieceDoc {
  /** A short phrase for the page description: what the piece is, with no status and no number. */
  tagline: string;
  /** One paragraph: what the piece is and does, in the tense of its register status. */
  summary: string;
  /** What it reads, how it works, what it hands on: the three zones of its schema. */
  entry: PieceZone;
  mechanism: PieceZone;
  output: PieceZone;
  /** Frozen schema files (schemas/<file>) the piece reads or writes; the page reads each title from the file. */
  contracts: readonly string[];
  /** The one line every piece carries: what it does not claim. */
  notClaim: string;
  /** Works of the bibliography (apps/site/data/docs-references.json) the page cites. */
  refs: readonly string[];
  /** Deeper pages on this site. */
  more: readonly { href: string; label: string }[];
}

export const PIECE_DOCS: Readonly<Record<string, PieceDoc>> = {
  shogen: {
    tagline: "attested perception: bytes, a hash and named residual hypotheses, never a truth claim",
    summary:
      "Attested perception. The piece turns a source's answer into an attested testimony: the exact bytes, their hash, and the transport assumptions the testimony still rests on, named one by one. It carries no price number and no score. A gate-side adapter interprets the bytes, and the testimony's residual rides into the verdict.",
    entry: {
      title: "A source's answer, as bytes",
      lines: ["What the attestor read, not what it means", "the canonical name of the source", "the exact response, when the class keeps it", "the transport's clock, carried as data"],
    },
    mechanism: {
      title: "Recompute, never interpret",
      lines: ["a SHA-256 hash over the exact bytes", "a flag: was the hash recomputed?", "the named transport assumptions, in order", "no truth claim about the content"],
    },
    output: {
      title: "An attested testimony",
      lines: ["a frozen contract with closed keys", "carried to the gate in the optional envelope", "its residual filed into the verdict", "no number, no score"],
    },
    contracts: ["attested-price.schema.json"],
    notClaim: "that the price is true. A testimony attests origin and bytes, never truth.",
    refs: ["chainlink-2017", "fips-sha", "rfc-cbor", "qin-liquidations"],
    more: [
      { href: "/docs/gate#attestation", label: "Attestation in the gate" },
      { href: "/fleet#panels", label: "Its panel on the fleet page" },
    ],
  },
  hikae: {
    tagline: "the gate: split-conformal calibration, an online monitor and a closed policy that answers commit, defer or abstain",
    summary:
      "The gate. It conforms a reading into a region at a target coverage, by split-conformal calibration per task class, keeps an online monitor of the remaining risk, and applies a closed policy that returns commit, defer or abstain against the region and the budget the caller carries. It never reports how likely it is to be right.",
    entry: {
      title: "A prediction, and the caller's terms",
      lines: ["a task class and a predictor id", "the reading y-hat: a label or a point", "optional: an attested testimony", "the budget, its floor, the thresholds, the clock"],
    },
    mechanism: {
      title: "Calibrate, monitor, decide",
      lines: ["a split-conformal margin q-hat per class", "too few calibration points: under_calib", "the region: every answer scored at most q-hat", "a closed policy reads region and budget"],
    },
    output: {
      title: "A verdict, then a decision",
      lines: ["the region: a set of labels or an interval", "one action word from a closed list", "one reason code from a closed list", "the budget, returned as the caller sent it"],
    },
    contracts: ["prediction.schema.json", "coverage-verdict.schema.json", "gate-decision.schema.json"],
    notClaim: "a probability of being right, or a coverage conditional on one input. Coverage is marginal, over exchangeable calibration data.",
    refs: ["angelopoulos-bates-gentle", "vovk-conditional", "vovk-mondrian", "chow-reject", "bates-rcps"],
    more: [
      { href: "/docs/gate", label: "The gate, in full" },
      { href: "/how", label: "How it works, with the simulation" },
      { href: "/docs/integrators", label: "Calling it" },
    ],
  },
  ukemi: {
    tagline: "liquidation coverage: a lending book at a block, the oracle path, and a conformal upper bound per stratum",
    summary:
      "Liquidation coverage, measured and gated. The piece reads a lending book at a declared block and the oracle path the protocol consulted, then measures the difference between what was eligible for liquidation and what was liquidated. Its engine computes the clearing fixed point of a network of obligations. Once a stratum is committed, the gate hands back an upper bound on the amount liquidated; until then it abstains, by construction.",
    entry: {
      title: "A book at a block, a realized oracle path",
      lines: ["every account with the collateral and a debt", "read at one reference block, two operators agreeing", "the oracle updates over the window, from chain events", "what was repaid, and any deficit left"],
    },
    mechanism: {
      title: "Predict one call, score the excess",
      lines: ["y-hat: the most liquidable in one call", "taken at the first crossing on the path", "the score: how far the realized amount exceeds it", "a margin q-hat per stratum, or under_calib"],
    },
    output: {
      title: "An upper bound, through the gate",
      lines: ["from an open floor up to y-hat plus q-hat", "served through the gate, never apart from it", "no committed stratum: an abstention", "the count published with every abstention"],
    },
    contracts: ["prediction.schema.json", "attested-book.schema.json"],
    notClaim: "a forecast of the next price, a probability of liquidation, or a rating of a venue, a market or an account.",
    refs: ["eisenberg-noe", "rogers-veraart", "amini-uniqueness", "gatto-liquidation", "dunn-hierarchical", "vovk-mondrian"],
    more: [
      { href: "/docs/ukemi", label: "Eligible is not liquidated" },
      { href: "/ukemi", label: "The Ukemi page" },
      { href: "/ukemi/course", label: "The calibration course" },
    ],
  },
  narabi: {
    tagline: "redemption-run sensing: a quantile tracker stepped once a day and a timeline anyone can replay",
    summary:
      "Redemption-run sensing. Each day a sentinel reads the burns, mints and supply of one stablecoin population over a finalized window, steps an adaptive quantile tracker on the realized outcome, and publishes a hash-chained line anyone can replay. The gate's region for the class stays the committed static calibration until a pre-registered drift criterion fires.",
    entry: {
      title: "One finalized day of onchain facts",
      lines: ["burns and mints over a declared block window", "supply at the open and at the close block", "each read agreed by two distinct providers", "a window not yet final is lag, never skipped"],
    },
    mechanism: {
      title: "Score, step, chain",
      lines: ["the attested flow becomes a velocity score", "the tracker steps its quantile on the outcome", "the long-run bound is printed with T", "each line carries the hash of the one before"],
    },
    output: {
      title: "The flow and a daily timeline",
      lines: ["state.json and timeline.jsonl, each day", "the flow carried into the served gate class", "every other population abstains", "no per-window coverage, no probability"],
    },
    contracts: ["attested-flow.schema.json"],
    notClaim: "a per-window coverage, a probability of being right, or a price call. The gate's region does not follow the tracker before the drift criterion fires.",
    refs: ["abb-decaying", "gibbs-candes-aci", "barber-beyond", "diamond-dybvig", "goldstein-pauzner"],
    more: [
      { href: "/docs/narabi", label: "Narabi, one day at a time" },
      { href: "/narabi", label: "The published timeline" },
    ],
  },
  mokugeki: {
    tagline: "attested facts from a document or an event, without sentiment or interpretation",
    summary:
      "Named, not delivered. The piece would do for documents and events what the price sensor does for prices: attest the facts it extracts, as bytes, a hash and named residual hypotheses, without adding sentiment or interpretation. Claims and market resolutions are decided by people today; the position is to equip that vote, never to replace it.",
    entry: { title: "A document or an event", lines: ["the text or the event as published", "its source and the instant it was read"] },
    mechanism: { title: "Attest, never judge", lines: ["the exact bytes and their hash", "the named residual hypotheses", "no truth claim, no sentiment"] },
    output: { title: "An attested testimony", lines: ["the fact a settled decision starts from", "handed to the gate, never instead of it"] },
    contracts: [],
    notClaim: "that an event happened as described, or any metric. Named, not delivered.",
    refs: ["fips-sha", "rfc-transparency"],
    more: [{ href: "/docs/pieces", label: "Every piece" }],
  },
  kaihi: {
    tagline: "loss versus rebalancing and order-flow toxicity, a liquidity range moved on commit only",
    summary:
      "Named, not delivered. A liquidity pool loses value to better-informed arbitrage, a loss measured apart from the fees it earns. The piece would read that loss and the toxicity of the order flow, and move a liquidity range only when the gate commits.",
    entry: { title: "A pool and its flow", lines: ["the pool's trades and reserves, from the chain", "the reference price the arbitrage acts on"] },
    mechanism: { title: "Loss versus rebalancing, flow toxicity", lines: ["loss versus rebalancing, fees tracked apart", "informed flow and the spread it forces", "a volume-synchronized toxicity measure"] },
    output: { title: "A range move, gated", lines: ["exit, re-enter or hold a range", "on commit only, never a trading signal"] },
    contracts: [],
    notClaim: "a trading signal or any metric. Named, not delivered.",
    refs: ["milionis-lvr", "glosten-milgrom", "easley-vpin"],
    more: [{ href: "/docs/pieces", label: "Every piece" }],
  },
  kessai: {
    tagline: "a swap executed with a receipt an agent can be audited on",
    summary:
      "Named, not delivered. The piece would execute a swap and issue a receipt an agent can be audited on: what was intended, what was filled, and the shortfall between the two. The receipt measures the execution; it does not pick the route.",
    entry: { title: "An intended swap", lines: ["the order the agent means to place", "the decision price, when it was decided"] },
    mechanism: { title: "Execution, measured", lines: ["expected cost against its variance", "implementation shortfall as the yardstick"] },
    output: { title: "An execution receipt", lines: ["intended, filled, and the shortfall", "with the gate's decision attached"] },
    contracts: [],
    notClaim: "a routing rule, a venue choice or any metric. Named, not delivered.",
    refs: ["almgren-chriss", "perold-shortfall"],
    more: [{ href: "/docs/pieces", label: "Every piece" }],
  },
  kamae: {
    tagline: "inventory market making that quotes only when the region is tight enough",
    summary:
      "Named, not delivered. The piece would quote both sides of a market from inventory, shift and widen its quote as inventory builds, and stay silent when the gate abstains. A desk discipline, gated: quote only when the region is tight enough.",
    entry: { title: "Inventory and a mid price", lines: ["the inventory held", "the mid price and its volatility"] },
    mechanism: { title: "Inventory risk, priced", lines: ["a reservation price shifted by inventory", "a total spread widened by risk aversion"] },
    output: { title: "Quotes, gated", lines: ["a bid and an ask, or no quote at all", "no quote while the region is too wide"] },
    contracts: [],
    notClaim: "a return or any metric. Named, not delivered.",
    refs: ["avellaneda-stoikov"],
    more: [{ href: "/docs/pieces", label: "Every piece" }],
  },
  kyokusen: {
    tagline: "a yield curve across maturities, with rollovers gated against it",
    summary:
      "Named, not delivered. The piece would fit a yield curve across maturities with few parameters and gate rollovers and looped positions against it. Risk readings of this kind are already offered by others; no open ground is claimed.",
    entry: { title: "Rates across maturities", lines: ["the rates of fixed-maturity instruments", "read from the chain at a block"] },
    mechanism: { title: "A parsimonious curve", lines: ["level, slope and curvature", "one decay constant across maturities"] },
    output: { title: "A curve, gated", lines: ["a rollover or a loop on commit only", "an abstention when the fit does not hold"] },
    contracts: [],
    notClaim: "open ground or any metric. Named, not delivered.",
    refs: ["nelson-siegel"],
    more: [{ href: "/docs/pieces", label: "Every piece" }],
  },
  koyomi: {
    tagline: "the weekend and off-hours gap as a sensed quantity, exposure changed on commit only",
    summary:
      "Named, not delivered. Tokenized assets trade while their reference market is closed. The piece would treat the weekend and off-hours gap as a sensed quantity and flatten leveraged exposure ahead of a recurring closure when the gate commits. It shares its evidence base with MONARK Bell.",
    entry: { title: "The calendar and the gap", lines: ["the reference market's sessions and closures", "the gap MONARK Bell publishes, session by session"] },
    mechanism: { title: "The off-hours gap, gated", lines: ["one class per regime", "overnight, weekend and holiday kept apart"] },
    output: { title: "An exposure change, gated", lines: ["flatten, hold or restore", "on commit only"] },
    contracts: [],
    notClaim: "a price call or any metric. Named, not delivered.",
    refs: ["cong-tokenized", "french-weekend"],
    more: [
      { href: "/docs/bell", label: "The record it would read" },
      { href: "/docs/pieces", label: "Every piece" },
    ],
  },
  genkan: {
    tagline: "the door every transfer, swap or signature would pass through first",
    summary:
      "Named, not delivered. The piece would be the door every transfer, swap or signature passes through first: least privilege, separation of privilege, and authority passed as a capability, returning commit, defer or abstain with the remaining budget. Today the harness serves the door to the engine.",
    entry: { title: "A transfer, a swap or a signature", lines: ["the act an agent is about to take", "the authority it holds, as a capability"] },
    mechanism: { title: "Least privilege, dual control", lines: ["least privilege, separation of privilege", "authority passed as a reference, never assumed"] },
    output: { title: "A decision at the door", lines: ["commit, defer or abstain", "with the remaining budget"] },
    contracts: [],
    notClaim: "custody, a wallet, or any metric. Named, not delivered.",
    refs: ["saltzer-schroeder", "miller-robust"],
    more: [
      { href: "/docs/integrators", label: "The door served today" },
      { href: "/docs/pieces", label: "Every piece" },
    ],
  },
};

/** What each role does, in one verb phrase (the register's role values are the keys). */
export const ROLE_WORDS: Readonly<Record<string, string>> = {
  sensor: "attests",
  gate: "decides",
  act: "executes on commit",
  distribution: "opens the door",
};

/** The description of a piece page: its register name and its tagline (no status, no number). */
export function pieceDescription(name: string, slug: string): string {
  return `${name}, ${pieceDoc(slug).tagline}. What it reads, how it works, and what the register says of it.`;
}

/** One piece's words, fail-closed: a slug with no entry throws at build time (never an empty page). */
export function pieceDoc(slug: string): PieceDoc {
  const d = PIECE_DOCS[slug];
  if (d === undefined) throw new Error(`docs-pieces: no entry for '${slug}'`);
  return d;
}
