// apps/site/lib/fleet.ts — the fleet register: the SINGLE SOURCE OF TRUTH for what is BUILT vs
// UPCOMING across the storefront (ADR-M004 D14). The /roadmap route and the
// per-product UpcomingPanel read status FROM HERE; no status is hard-coded on those surfaces.
//
// Locked by the root test `fleet_register_built_set_is_frozen` (test/ci-gates.test.ts): the built
// agents are EXACTLY {Shōgen, Hikae, Ukemi, Narabi}; the seven other agents are upcoming. Among the six
// products, MONARK Bell alone is built (investor decision 155, lot BELL-SERVED-1: its host is served and its
// first signed record is published; it joined PRODUCTS as upcoming by ruling Q3, decision 146) and the five
// others are upcoming. Flipping any of those twelve upcoming entries reds that test (named mutant). It also freezes the
// WIRING (ADR-M018 D2; ADR-EC E2/E6): each built agent's served_by is non-empty, its integration_test names
// one real test per served leg, and only the digit-free `note` is rendered (/fleet); served_by and
// integration_test stay unrendered (digit-bearing) wiring metadata.
//
// PORTABILITY: this module is compiled by TWO programs with different module resolution — the Next
// app (moduleResolution "bundler") and the root test program (moduleResolution "nodenext", which
// wants explicit .ts extensions on relative imports). No single specifier for `@/lib/status` /
// `./status` / `./status.ts` type-checks under both, so this module is SELF-CONTAINED: it declares
// FleetStatus locally rather than importing AgentStatus. FleetStatus IS the honest AgentStatus
// vocabulary — proven identical by the root test (bidirectional assignability) and enforced at every
// <StatusBadge status={...} /> call site by `next build` (a stray "live" reds there too).
//
// SOURCING of the seven upcoming lines: recorded privately.
// Pure data — NO React/Next import — so the root test can import it under node:test.

/** The frozen public status vocabulary (identical to lib/status.ts AgentStatus). No "live" exists. */
export type FleetStatus = "built" | "upcoming";

/** Where an agent sits on the backbone: it senses, it is the gate, it acts, or it distributes. */
export type FleetRole = "sensor" | "gate" | "act" | "distribution";

/**
 * A built agent's WIRING (ADR-M018 D2): the served path that consumes its output, the non-LLM integration
 * test(s) that replay that composition — ONE id per SERVED LEG (ADR-EC E2, checkpoint-1 P2) — and a
 * digit-free honest `note` rendered to the storefront (ADR-EC E6). REQUIRED on a built agent, FORBIDDEN on
 * an upcoming one (encoded in the FleetAgent union below). The root test `fleet_register_built_set_is_frozen`
 * checks that `served_by` is non-empty, `integration_test` is a NON-EMPTY list of real test ids each
 * EXISTING under test/, apps/harness/test/, or apps/sentinel/test/ — matched as `test("<id>"` where the
 * declared title is bare (`"`) or suffixed (` — …`) — and that `note` is digit-free.
 * NOTE: served_by and integration_test carry task-class ids / test names that contain digits (…-24h,
 * btc-dir-15m); they are wiring METADATA, never rendered, so they stay OUT of the numeric-hole scan and NO
 * apps/site surface (≠ this file) may reference the identifiers served_by/integration_test (guard (4)
 * tripwire). Only `note` is rendered (ADR-EC E6 lifts the tripwire for THIS field alone) — it is scanned
 * digit-free by guard (1) here AND by the site-honesty numeric scan.
 */
export interface FleetWiring {
  /** Who consumes this agent's output on a SERVED path (an MCP tool, or a published file read by a surface). */
  served_by: string;
  /** The non-LLM integration test(s) that replay the served composition — ONE id per SERVED LEG, at least
   *  one (ADR-EC E2). Each is a real test id; the guard matches `test("<id>"` whether the title is bare or
   *  suffixed (` — …`). Wiring METADATA (test names carry digits), never rendered. */
  integration_test: string[];
  /** A digit-free (no number, no %) honest one-line note on what is served, RENDERED to the storefront for
   *  built agents (ADR-EC E6). served_by is never rendered (it carries digits); this is its digit-free proxy. */
  note: string;
}

interface FleetAgentCommon {
  /** Public budō name. */
  name: string;
  role: FleetRole;
  /** One-line English descriptor (rendered as a teaser or a renvoi). */
  line: string;
}

/** A BUILT agent MUST declare its wiring (ADR-M018 D1(b)(c)/D2: a served path + a non-LLM test that replays it). */
export interface BuiltFleetAgent extends FleetAgentCommon {
  status: "built";
  wiring: FleetWiring;
}

/** An UPCOMING agent carries NO wiring (nothing is served yet); a `wiring` on it is a type error. */
export interface UpcomingFleetAgent extends FleetAgentCommon {
  status: "upcoming";
  wiring?: never;
}

/** A register entry: built (with wiring) or upcoming (without). Consumers reading name/role/line/status see
 *  the common shape; only a `status === "built"` narrow exposes `wiring`. */
export type FleetAgent = BuiltFleetAgent | UpcomingFleetAgent;

/** A product's wiring, shown as a sober sensor -> gate -> act schema in the placeholder. Distinct from FleetWiring
 *  (the served path + integration tests), which a BUILT product carries as `served` (ADR-B0 D4: W-1 != ProductWiring). */
export interface ProductWiring {
  sensor: string;
  gate: string;
  act: string;
}

interface FleetProductCommon {
  /**
   * Stable product id / segment key. Usually not a frozen-contract field name; the one
   * coincidence is the verdict key (the MONARK Verdict product), which equals a GateDecision
   * required field. It is a product id here, NOT a rendered contract field, and is named
   * in the closed exemption of the `frozen_contract_fields_stay_dynamic` gate (that field
   * stays gated in every other file). See test/ci-gates.test.ts.
   */
  key: string;
  /** The entry frame it sits behind on the home page. */
  segment: string;
  /** Product name ("MONARK …"). */
  name: string;
  /** One-sentence product function — generic, no third-party platform. */
  fn: string;
  wiring: ProductWiring;
  /** Generic "what it will connect" line (reachability lives here, not on the segment card). */
  connects: string;
}

/** A BUILT product MUST declare its served wiring (same contract and guard as a built agent's `wiring`). */
export interface BuiltFleetProduct extends FleetProductCommon {
  status: "built";
  served: FleetWiring;
}

/** An UPCOMING product carries NO served wiring; a `served` on it is a type error. */
export interface UpcomingFleetProduct extends FleetProductCommon {
  status: "upcoming";
  served?: never;
}

export type FleetProduct = BuiltFleetProduct | UpcomingFleetProduct;

// The eleven fleet agents. Three engines (Shōgen, Hikae, Ukemi) are rendered by their bespoke Home panels;
// the Ukemi panel reads its AgentCard status from THIS register (ADR-M018 single source of truth; pinned by
// fleet_register_built_set_is_frozen). Narabi is built as the redemption sensor (ADR-M012 M012-e:
// its AttestedFlow contract, the velocity adapter and a committed calibration ship and are served, and an
// off-tool sentinel steps the tracker daily) — rendered from the register, not a bespoke panel. Listed
// here so the register is complete and testable, and so /roadmap and /fleet can render them. The seven
// upcoming lines are recorded internally.
export const FLEET_AGENTS: FleetAgent[] = [
  {
    name: "Shōgen",
    role: "sensor",
    line: "Attested perception — an attested price testimony.",
    status: "built",
    // attest → gate on the served wire: the `attested` envelope key files attested.residual into
    // verdict.residual (ADR-M017 D2(iii)/D4(3)). gate_attested_concordant_files_residual replays that seam.
    wiring: {
      served_by: "MCP attest → gate (the attested envelope key; attested.residual filed into verdict.residual on the served gate)",
      // One served leg: attest → gate. gate_attested_concordant_files_residual (apps/harness/test/gate.test.ts:761)
      // drives it through registry.run() with the real runAttest() price and asserts the seam files attested.residual.
      integration_test: ["gate_attested_concordant_files_residual"],
      note: "served through the MCP gate: its attested testimony's residual is carried into the verdict, replayed by a non-LLM integration test",
    },
  },
  {
    name: "Hikae",
    role: "gate",
    line: "Coverage-controlled inference — the gate itself.",
    status: "built",
    // The served gate itself. probe_harness_records_real_decision drives it on the real MCP wire
    // (btc-dir-15m → commit/covered; cascade → abstain). The BYO and stable-run legs: ADR-W1 § Tuyaux.
    wiring: {
      served_by: "MCP gate (btc-dir-15m committed decision; stable-run-velocity-24h; BYO calibration)",
      // Three served legs (cartography 2026-09-19 §3): the real MCP wire (btc-dir/cascade) —
      // probe_harness_records_real_decision (test/h5-e2e-probe.test.ts:83); the BYO calibration loop —
      // probe_byo_demo_loop_closes (test/byo-demo-probe.test.ts:78); and the stable-run task class over the
      // served gate tool — gate_stable_run_honesty_text_is_keyed_A2_A7f (apps/harness/test/gate.test.ts:528,
      // via gateTool.run()).
      integration_test: [
        "probe_harness_records_real_decision",
        "probe_byo_demo_loop_closes",
        "gate_stable_run_honesty_text_is_keyed_A2_A7f",
      ],
      note: "the served gate itself: each reading is conformed into a coverage region then decided, replayed on the real wire, on the bring-your-own loop, and on the stable-run class by non-LLM integration tests",
    },
  },
  {
    name: "Ukemi",
    role: "act",
    line: "Liquidation-cascade survival.",
    status: "built",
    // cascade → gate on the served wire (h5 trace step 4). By construction the gate abstains under_calib
    // (no cascade calibration committed) and the prediction content does not change the served decision
    // (measured vacuity, ADR-M019 D2/D4). The seam is real; its served effect is a constant abstention.
    wiring: {
      served_by: "MCP cascade → gate (cascade-liquidable-24h; abstains under_calib by construction, ADR-M019 D2/D4)",
      // One served leg: cascade → gate on the real MCP wire (h5 step 4), replayed by
      // probe_harness_records_real_decision (test/h5-e2e-probe.test.ts:83). Its served effect is a constant
      // abstention (measured vacuity, ADR-M019 D2/D4) — the note says so without a number.
      integration_test: ["probe_harness_records_real_decision"],
      note: "feeds the served gate through the cascade seam; until a cascade calibration is committed it abstains by construction, replayed by a non-LLM integration test",
    },
  },
  {
    name: "Mokugeki",
    role: "sensor",
    line: "Mokugeki attests the facts it extracts from a document or an event, without adding sentiment or interpretation.",
    status: "upcoming",
  },
  {
    name: "Narabi",
    role: "sensor",
    // ADR-M012 M012-e: Narabi is built — AttestedFlow ships, the velocity adapter and a committed
    // calibration are served, and an off-tool sentinel steps the tracker daily. Line kept digit-free
    // (numeric-hole scan) and generic (population and numbers live in the README / skill, not the teaser).
    line: "Narabi senses redemption-run velocity from the attested onchain flow; its adaptive quantile tracker publishes a replayable daily timeline.",
    status: "built",
    // Two served legs. The SERVED composition proven here: the sentinel publishes a sha-pinned timeline and
    // /narabi parses those committed published bytes — narabi_live_parses_real_state_shape replays it
    // (published snapshot bytes → the site's parser, byte-exact). Supporting: sentinel_windows_identical_to_pull
    // recomputes the windowing against the committed sha-pinned series via a stubbed RPC (the recorded pull,
    // offline); the fromAttestedFlow → gate (stable-run-velocity-24h) leg: ADR-W1 § Tuyaux.
    wiring: {
      served_by: "daily published sentinel at /narabi/ + fromAttestedFlow → gate (stable-run-velocity-24h)",
      // Two served legs (cartography 2026-09-19 §3): the published timeline parsed by the site —
      // narabi_live_parses_real_state_shape (test/narabi-live.test.ts:45, published bytes → the site parser,
      // byte-exact); and fromAttestedFlow → gate — gate_stable_run_usde_committed_region_A7b
      // (apps/harness/test/gate.test.ts:482, adaptToPrediction/fromAttestedFlow → runGate, USDe region covered).
      integration_test: [
        "narabi_live_parses_real_state_shape",
        "gate_stable_run_usde_committed_region_A7b",
      ],
      note: "a daily published timeline parsed byte-exact by the site, and its attested flow carried into the served gate, both replayed by non-LLM integration tests",
    },
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
/** The shared backbone gate, exported so a surface says "the same gate" only of it (decision 155: MONARK Bell's gate is its own). */
export const SHARED_GATE = GATE;

// The six products (fingers): each is a wiring of fleet agents, distinct from the engine agent. Five are
// upcoming; MONARK Bell is built (investor decision 155; the ADR-M004 D14 invariant "no product is built" is
// amended by ADR, orchestrator's act). Ordered as the home segment cards. A product opens its placeholder
// from its segment card; products do NOT appear on /roadmap nor /fleet (the "four built, seven on the
// roadmap" count is about AGENTS and stays true). MONARK Bell's segment and reach stay NAMED PLACEHOLDERS
// `<<name>>` (orchestrator-owned), rendered as such by components/placeholder.tsx RegisterText; its wiring
// names the real pieces (collector reads, publisher checks, signed publication + reader-side verifier).
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
  {
    key: "bell",
    segment: "<<bell_segment>>",
    name: "MONARK Bell",
    fn: "Keep a public, signed record of how tokenized U.S. equities trade on a public ledger while U.S. markets are closed: a gap per session when its closing price can be read, a named abstention when it cannot, an anchored digest.",
    wiring: {
      sensor: "the collector's session reads of on-chain fills, each read on two operators",
      gate: "the publisher's closed checks: read quorum, earliest publication time, no closing price carried",
      act: "a signed, hash-chained publication on its own host, checked by the reader-side verifier",
    },
    connects: "<<bell_connects>>",
    status: "built",
    // Decision 155 (W-1): the served host, its deploy check (docs/deploy-CA-bell.json, produced by
    // scripts/verify-bell.mjs, which runs the real reader-side verifier) and the site data read from it.
    served: {
      served_by: "https://bell.monarkgate.tech (timeline.jsonl, state.json, bell/pubkey.json); deploy check docs/deploy-CA-bell.json by scripts/verify-bell.mjs; site data apps/site/data/bell-served.json",
      integration_test: ["verify_bell_ca_check5_runs_real_bell_verify", "bell_served_data_matches_deploy_ca"],
      note: "a signed, hash-chained timeline served on its own host, checked end to end by a non-LLM reader-side verifier against the committed keyring",
    },
  },
];
