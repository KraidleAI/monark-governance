// apps/site/lib/fleet.ts — the fleet register: the SINGLE SOURCE OF TRUTH for what is BUILT vs
// UPCOMING across the storefront (ADR-M004 D14 / PLAN F-2c C-2). The /roadmap route and the
// per-product UpcomingPanel read status FROM HERE; no status is hard-coded on those surfaces.
//
// Locked by the root test `fleet_register_built_set_is_frozen` (test/ci-gates.test.ts): the built
// set is EXACTLY {Shōgen, Hikae, Ukemi}; the eight other agents and all five products are upcoming.
// Flipping any of those thirteen to "built" reds that test (named mutant, docs/G1-lot-F2c.md).
//
// PORTABILITY: this module is compiled by TWO programs with different module resolution — the Next
// app (moduleResolution "bundler") and the root test program (moduleResolution "nodenext", which
// wants explicit .ts extensions on relative imports). No single specifier for `@/lib/status` /
// `./status` / `./status.ts` type-checks under both, so this module is SELF-CONTAINED: it declares
// FleetStatus locally rather than importing AgentStatus. FleetStatus IS the honest AgentStatus
// vocabulary — proven identical by the root test (bidirectional assignability) and enforced at every
// <StatusBadge status={...} /> call site by `next build` (a stray "live" reds there too).
//
// SOURCING of the eight upcoming lines (deck + memstack, verbatim PLAN F-2c §2): docs/G1-lot-F2c.md.
// Pure data — NO React/Next import — so the root test can import it under node:test.

/** The frozen public status vocabulary (identical to lib/status.ts AgentStatus). No "live" exists. */
export type FleetStatus = "built" | "upcoming";

/** Where an agent sits on the backbone: it senses, it is the gate, it acts, or it distributes. */
export type FleetRole = "sensor" | "gate" | "act" | "distribution";

export interface FleetAgent {
  /** Public budō name. */
  name: string;
  role: FleetRole;
  /** One-line English descriptor (rendered as a teaser or a renvoi). */
  line: string;
  status: FleetStatus;
}

/** A product's wiring, shown as a sober sensor -> gate -> act schema in the placeholder. */
export interface ProductWiring {
  sensor: string;
  gate: string;
  act: string;
}

export interface FleetProduct {
  /**
   * Stable product id / segment key. Usually not a frozen-contract field name; the one
   * coincidence is the verdict key (the MONARK Verdict product), which equals a GateDecision
   * required field. It is a product id here, NOT a rendered contract field, and is named
   * in the closed exemption of the `frozen_contract_fields_stay_dynamic` gate (that field
   * stays gated in every other file). See test/ci-gates.test.ts.
   */
  key: string;
  /** The investor entry frame it sits behind on the home page. */
  segment: string;
  /** Product name ("MONARK …"). */
  name: string;
  /** One-sentence product function — generic, no third-party platform. */
  fn: string;
  wiring: ProductWiring;
  /** Generic "what it will connect" line (reachability lives here, not on the segment card). */
  connects: string;
  status: FleetStatus;
}

// The eleven fleet agents. The three built ones are the same agents rendered by their Home panels
// (that stays their source of truth); listed here so the register is complete and testable, and so
// /roadmap can point back to them. The eight upcoming lines are the verbatim PLAN F-2c §2 wording.
export const FLEET_AGENTS: FleetAgent[] = [
  { name: "Shōgen", role: "sensor", line: "Attested perception — a verified price testimony.", status: "built" },
  { name: "Hikae", role: "gate", line: "Coverage-controlled inference — the gate itself.", status: "built" },
  { name: "Ukemi", role: "act", line: "Liquidation-cascade survival.", status: "built" },
  {
    name: "Mokugeki",
    role: "sensor",
    line: "Mokugeki attests the facts it extracts from a document or an event, without adding sentiment or interpretation.",
    status: "upcoming",
  },
  {
    name: "Narabi",
    role: "sensor",
    line: "Narabi watches for the signals that a redemption run has begun, such as a burn spike, a lengthening redeem queue, or a witness going silent.",
    status: "upcoming",
  },
  {
    name: "Kaihi",
    role: "act",
    line: "Kaihi exits a liquidity range — minting or burning it — ahead of toxic order flow.",
    status: "upcoming",
  },
  {
    name: "Kessai",
    role: "act",
    line: "Kessai routes a swap to a venue and issues a settlement receipt for the execution.",
    status: "upcoming",
  },
  {
    name: "Kamae",
    role: "act",
    line: "Kamae quotes both sides of a market from inventory, and stays silent when told to abstain.",
    status: "upcoming",
  },
  {
    name: "Kyokusen",
    role: "act",
    line: "Kyokusen fits a yield curve across maturities and gates rollovers and looped positions against it.",
    status: "upcoming",
  },
  {
    name: "Koyomi",
    role: "act",
    line: "Koyomi flattens leveraged exposure ahead of a recurring weekend trading-window closure.",
    status: "upcoming",
  },
  {
    name: "Genkan",
    role: "distribution",
    line: "Genkan is the point every transfer, swap, or signature passes through first, returning a commit, defer, or abstain decision along with the remaining budget.",
    status: "upcoming",
  },
];

// The shared gate node, named on every product wiring (the backbone, distinct from a product's engine
// agent). C-1: MONARK Verdict names NO engine agent — its sensor and act stay generic.
const GATE = "Hikae and the MONARK budget";

// The five products (fingers): each is a wiring of fleet agents, distinct from the engine agent, and
// NONE is built today (ADR-M004 D14 invariant). Ordered as the home segment cards. A product opens its
// placeholder from its segment card; products do NOT appear on /roadmap (the "three built, eight on the
// roadmap" count stays true).
export const PRODUCTS: FleetProduct[] = [
  {
    key: "firebreak",
    segment: "Vault LP",
    name: "MONARK Firebreak",
    fn: "Ride out an auto-deleveraging cascade on a perp venue rather than be caught in it.",
    wiring: { sensor: "Ukemi reads the deleveraging queue", gate: GATE, act: "de-risk before it hits" },
    connects: "It will connect to a perp venue and the position it protects over HTTP or MCP.",
    status: "upcoming",
  },
  {
    key: "warden",
    segment: "DAO / agent",
    name: "MONARK Warden",
    fn: "Put a least-privilege gate on a treasury a DAO or another agent controls.",
    wiring: { sensor: "a spend or a signature", gate: GATE, act: "commit, defer, or abstain" },
    connects: "It will connect to a multisig treasury and its tools over HTTP or MCP.",
    status: "upcoming",
  },
  {
    key: "softlanding",
    segment: "Leverage",
    name: "MONARK Softlanding",
    fn: "Read the liquidation risk on a leveraged position and ease the exposure down before it clears.",
    wiring: { sensor: "Ukemi reads the position", gate: GATE, act: "ease the exposure down" },
    connects: "It will connect to a lending venue over HTTP or MCP.",
    status: "upcoming",
  },
  {
    key: "verdict",
    segment: "Betting desk",
    name: "MONARK Verdict",
    // C-1: the β wiring is generic — no engine agent is named (event resolution is undecided).
    fn: "Turn a raw event call into a coverage-controlled, settled decision.",
    wiring: { sensor: "an attested event", gate: GATE, act: "settle the call" },
    connects: "It will connect to an event source and the desk that acts on it over HTTP or MCP.",
    status: "upcoming",
  },
  {
    key: "ballast",
    segment: "Rate treasury",
    name: "MONARK Ballast",
    fn: "Hold a rate treasury steady as the yield curve moves.",
    wiring: { sensor: "the rate surface", gate: GATE, act: "hedge or rebalance" },
    connects: "It will connect to a rate venue and the treasury it steadies over HTTP or MCP.",
    status: "upcoming",
  },
];
