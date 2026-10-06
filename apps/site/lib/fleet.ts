// apps/site/lib/fleet.ts — the fleet register: the SINGLE SOURCE OF TRUTH for what is BUILT vs
// UPCOMING across the storefront. The /roadmap route and the per-application UpcomingPanel read status FROM HERE;
// no status is hard-coded on those surfaces.
//
// Locked by the root test `fleet_register_built_set_is_frozen` (test/ci-gates.test.ts): the built
// agents are EXACTLY {Shōgen, Hikae, Ukemi, Narabi}; the seven other agents are upcoming. Among the six
// applications (the PRODUCTS array), MONARK Bell alone is built (its host is served and its signed records are
// published) and the five others are upcoming. Flipping any of those twelve upcoming entries reds that test (named
// mutant). It also freezes the WIRING: each built agent's served_by is non-empty, its integration_test names one real
// test per served leg, and only the digit-free `note` is rendered (/fleet); served_by and integration_test stay
// unrendered (digit-bearing) wiring metadata.
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
 * A built agent's WIRING: the served path that consumes its output, the integration test(s) that replay that
 * composition — ONE id per SERVED LEG — and a digit-free honest `note` rendered to the storefront. REQUIRED on a built
 * agent, FORBIDDEN on an upcoming one (encoded in the FleetAgent union below). The root test
 * `fleet_register_built_set_is_frozen` checks that `served_by` is non-empty, `integration_test` is a NON-EMPTY list of
 * real test ids each EXISTING under test/, apps/harness/test/, or apps/sentinel/test/ — matched as `test("<id>"` where
 * the declared title is bare (`"`) or suffixed (` — …`) — and that `note` is digit-free.
 * NOTE: served_by and integration_test carry task-class ids / test names that contain digits (…-24h,
 * btc-dir-15m); they are wiring METADATA, never rendered, so they stay OUT of the numeric-hole scan and NO
 * apps/site surface (≠ this file) may reference the identifiers served_by/integration_test (guard (4)
 * tripwire). Only `note` is rendered (the tripwire is lifted for THIS field alone) — it is scanned
 * digit-free by guard (1) here AND by the site-honesty numeric scan.
 */
export interface FleetWiring {
  /** Who consumes this agent's output on a SERVED path (an MCP tool, or a published file read by a surface). */
  served_by: string;
  /** The integration test(s) that replay the served composition — ONE id per SERVED LEG, at least one. Each is a
   *  real test id; the guard matches `test("<id>"` whether the title is bare or suffixed (` — …`). Wiring METADATA
   *  (test names carry digits), never rendered. */
  integration_test: string[];
  /** A digit-free (no number, no %) honest one-line note on what is served, RENDERED to the storefront for
   *  built agents. served_by is never rendered (it carries digits); this is its digit-free proxy. The notes never
   *  repeat "non-LLM": a page that lists them says it once (test registry_notes_say_non_llm_once_per_page). */
  note: string;
}

interface FleetAgentCommon {
  /** Public budō name. */
  name: string;
  role: FleetRole;
  /** One-line English descriptor (rendered as a teaser or a renvoi). */
  line: string;
}

/** A BUILT agent MUST declare its wiring (a served path + an integration test that replays it). */
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

/** An application's wiring, shown as a sober sensor -> gate -> act schema in the placeholder. Distinct from FleetWiring
 *  (the served path + integration tests), which a BUILT application carries as `served`. */
export interface ProductWiring {
  sensor: string;
  gate: string;
  act: string;
}

interface FleetProductCommon {
  /**
   * Stable application id / segment key. Usually not a frozen-contract field name; the one
   * coincidence is the verdict key (MONARK Verdict), which equals a GateDecision
   * required field. It is an application id here, NOT a rendered contract field, and is named
   * in the closed exemption of the `frozen_contract_fields_stay_dynamic` gate (that field
   * stays gated in every other file). See test/ci-gates.test.ts.
   */
  key: string;
  /** The entry frame it sits behind on the home page. */
  segment: string;
  /** Application name ("MONARK …"). */
  name: string;
  /** One-sentence function — generic, no third-party platform. */
  fn: string;
  wiring: ProductWiring;
  /** What it connects to (reachability lives here, not on the segment card). */
  connects: string;
}

/** A BUILT application MUST declare its served wiring (same contract and guard as a built agent's `wiring`). */
export interface BuiltFleetProduct extends FleetProductCommon {
  status: "built";
  served: FleetWiring;
}

/** An UPCOMING application carries NO served wiring; a `served` on it is a type error. */
export interface UpcomingFleetProduct extends FleetProductCommon {
  status: "upcoming";
  served?: never;
}

export type FleetProduct = BuiltFleetProduct | UpcomingFleetProduct;

// The eleven fleet agents. Three engines (Shōgen, Hikae, Ukemi) are rendered by their bespoke panels on /fleet;
// the Ukemi panel reads its AgentCard status from THIS register (single source of truth; pinned by
// fleet_register_built_set_is_frozen). Narabi is built as the redemption sensor (its AttestedFlow contract, the
// velocity adapter and a committed calibration ship and are served, and an off-tool sentinel steps the tracker daily).
// Listed here so the register is complete and testable, and so /roadmap and /fleet can render them. The seven
// upcoming lines are recorded internally.
export const FLEET_AGENTS: FleetAgent[] = [
  {
    name: "Shōgen",
    role: "sensor",
    line: "Attested perception — an attested price testimony.",
    status: "built",
    // Status kept `built` by the founder's decision of 2026-10-03. The served leg is the MCP attest tool; its join into
    // the gate is dormant since btc-dir-15m, the only class with a committed attestation subject, was retired.
    wiring: {
      served_by: "MCP attest (the attested envelope key of the gate stays declared; its join is dormant since the subject class was retired)",
      // Served leg, first (K-6, MONARK's decision): probe_harness_records_real_decision (test/h5-e2e-probe.test.ts) drives attest over the real
      // MCP wire and pins the served witness values. Then POST /attest on the HTTP mirror, content equal to the MCP text — http_mirror_matches_mcp_surface
      // (apps/harness/test/http.test.ts); a real listener under the deploy CA — verify_harness_ca_passes_on_the_in_process_harness. Limit, for those two
      // only: neither pins the served witness values (ATTEST-KATA-SUBJECT-1). The join, unit level: gate_attested_is_frozen_attested_price, gate_attested_discordant_is_tool_error.
      integration_test: ["probe_harness_records_real_decision", "http_mirror_matches_mcp_surface", "verify_harness_ca_passes_on_the_in_process_harness", "gate_attested_is_frozen_attested_price", "gate_attested_discordant_is_tool_error"],
      note: "served through the MCP attest tool, replayed on the real wire by an integration test; its join into the gate is dormant since the class it attested was retired",
    },
  },
  {
    name: "Hikae",
    role: "gate",
    line: "Coverage-controlled inference — the gate itself.",
    status: "built",
    // The served gate itself. probe_harness_records_real_decision drives it on the real MCP wire
    // (the committed USDe key → commit/covered; cascade → abstain); the bring-your-own and stable-run legs follow.
    wiring: {
      served_by: "MCP gate (stable-run-velocity-24h committed decision; BYO calibration)",
      // Three served legs: the real MCP wire (committed USDe key/cascade) — probe_harness_records_real_decision
      // (test/h5-e2e-probe.test.ts); the BYO calibration loop — probe_byo_demo_loop_closes (test/byo-demo-probe.test.ts);
      // and the stable-run task class over the served gate tool — gate_stable_run_honesty_text_is_keyed_A2_A7f
      // (apps/harness/test/gate.test.ts, via gateTool.run()).
      integration_test: [
        "probe_harness_records_real_decision",
        "probe_byo_demo_loop_closes",
        "gate_stable_run_honesty_text_is_keyed_A2_A7f",
      ],
      // The synthetic demonstration class is retired: the served gate description no longer carries its clause,
      // so neither does the note (both directions pinned by registry_notes_track_served_descriptions).
      note: "the served gate itself: each reading is conformed into a coverage region then decided, replayed on the real wire, on the bring-your-own loop, and on the stable-run class by integration tests",
    },
  },
  {
    name: "Ukemi",
    role: "act",
    // The home card's tagline, read from here; the served class it is gated on (liquidation-eligible-coverage) is read
    // from committed, hashed served data (apps/site/data/ukemi-served.json), never typed next to it.
    line: "Liquidation coverage, gated.",
    status: "built",
    // Two served legs, declared only once the switched deploy CA is green and committed (fleet_ukemi_liq_leg_matches_
    // deploy_ca binds them). (1) cascade → gate on the served wire (h5 trace step 4): by construction the gate abstains
    // under_calib there (no cascade calibration committed), a constant abstention. (2) gate / POST /gate on the
    // liquidation-eligible-coverage class: an upper bound [0, yhat + qhat] on the committed stratum of one recorded
    // episode, the other strata under_calib; the producer of yhat is not served here.
    wiring: {
      served_by: "MCP cascade → gate (cascade-liquidable-24h; abstains under_calib by construction) + MCP gate / POST /gate (liquidation-eligible-coverage: upper bound [0, yhat + qhat_k] on the committed stratum; the other strata under_calib)",
      // One test per served leg: probe_harness_records_real_decision (test/h5-e2e-probe.test.ts) replays leg (1) on the
      // real MCP wire; u4b_gate_serves_region_from_real_artifact (apps/harness/test/gate-liq-artifact.test.ts) replays
      // leg (2) over every class-A row of the committed fresh series. fleet_ukemi_liq_leg_matches_deploy_ca
      // (test/fleet-ukemi-liq-leg.test.ts) binds leg (2) to the committed deploy CA (CA-11 by test).
      integration_test: ["probe_harness_records_real_decision", "u4b_gate_serves_region_from_real_artifact"],
      // "a transitional tool, to be replaced" restates, digit-free and nothing more, the SERVED cascade description ("This
      // cascade tool is v0, replaced at …", CASCADE_TOOL_DESCRIPTION): no successor is named here while none is served. The
      // exact clause is pinned both ways by registry_notes_track_served_descriptions (test/site-build-fleet.test.ts): the
      // note carries it exactly, its closing semicolon included, while the served text declares the tool replaced.
      // "calibrated on one recorded episode" restates the served H-3 clause of the class (LIQ_H3_SENTENCE); the note claims
      // no coverage and names no number.
      note: "feeds the served gate through the cascade tool, a transitional tool, to be replaced; it abstains by construction, and the gate serves an upper bound on the liquidable amount for the committed stratum of its liquidation class, calibrated on one recorded episode, while the other strata abstain; both legs replayed by integration tests",
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
    // Narabi is built — AttestedFlow ships, the velocity adapter and a committed calibration are served, and an off-tool
    // sentinel steps the tracker daily. Line kept digit-free (numeric-hole scan) and generic (population and numbers live
    // in the README / skill, not the teaser).
    line: "Narabi senses redemption-run velocity from the attested onchain flow; its adaptive quantile tracker publishes a replayable daily timeline.",
    status: "built",
    // Two served legs. The SERVED composition proven here: the sentinel publishes a sha-pinned timeline and /narabi
    // parses the committed capture of those published files (the state file as served; each timeline line as served
    // with its endpoint list reduced to a count) — narabi_live_parses_real_state_shape replays it (test/narabi-live.test.ts,
    // a projection, not a byte copy). Supporting: sentinel_windows_identical_to_pull recomputes the windowing against the
    // committed sha-pinned series via a stubbed RPC (the recorded pull, offline).
    wiring: {
      served_by: "daily published sentinel at /narabi/ + fromAttestedFlow → gate (stable-run-velocity-24h)",
      // Two served legs: the published timeline parsed by the site — narabi_live_parses_real_state_shape
      // (test/narabi-live.test.ts); and fromAttestedFlow → gate — gate_stable_run_usde_committed_region_A7b
      // (apps/harness/test/gate.test.ts, adaptToPrediction/fromAttestedFlow → runGate, USDe region covered).
      integration_test: [
        "narabi_live_parses_real_state_shape",
        "gate_stable_run_usde_committed_region_A7b",
      ],
      note: "a daily published timeline parsed by the site from the published files (its committed capture keeps each line's endpoint count only), and its attested flow carried into the served gate, both replayed by integration tests",
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

/** Register agent names, fail-closed: each name must be an agent of FLEET_AGENTS (so a value that names agents is
 *  derived from the register, never a free string), returned as English list prose. */
export function registerNames(names: readonly string[]): string {
  const known = names.map((n) => {
    const a = FLEET_AGENTS.find((x) => x.name === n);
    if (!a) throw new Error(`fleet: '${n}' is not an agent of the fleet register`);
    return a.name;
  });
  return listNames(known);
}

// The shared gate node, named on every upcoming application's wiring (the backbone, distinct from an application's
// engine agent). MONARK Verdict names NO engine agent — its sensor and act stay generic.
const GATE = "Hikae and the MONARK budget";
/** The shared backbone gate, exported so a surface says "the same gate" only of it (MONARK Bell's gate is its own). */
export const SHARED_GATE = GATE;

// The six applications (fingers), each distinct from the engine agent it may use; each upcoming one is cleared by the
// shared gate. MONARK Bell is built on its own gate. Ordered as the home segment cards. /applications renders the built
// ones in their own section (app/applications/built-application-card.tsx, a server component: the served wiring never reaches
// a client component's props nor the page payload; this module itself still ships in a client chunk, because client
// components such as the home noyau import the register) and each upcoming one as its UpcomingPanel; applications are
// NOT listed on /roadmap nor /fleet (the agent counts there are about AGENTS; /fleet only points to /applications with
// counts derived from this array). MONARK Bell's segment and its connections are register values (the agents it
// connects to are named through registerNames, so a renamed or removed agent fails the build); its wiring names the
// real pieces (collector reads, publisher checks, signed publication + reader-side verifier).
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
    // The wiring is generic — no engine agent is named (event resolution is undecided).
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
    segment: "tokenized equities, off-hours",
    name: "MONARK Bell",
    // "in particular while U.S. markets are closed": the served record covers the whole New York trading day, session by
    // session (the regular session included, as served in bell-served.json); the off-hours trading is the object, not the
    // only reading. The last clause says what the publication is on /bell too: signed and chained, not timestamp-anchored.
    fn: "Keep a public, signed record of how tokenized U.S. equities trade on a public ledger, in particular while U.S. markets are closed: a gap per session when its closing price can be read, a named abstention when it cannot, a signed, hash-chained record.",
    wiring: {
      // What the collector does (apps/bell/src/collect.ts liveSolanaFills + quorum.ts quorum2): the fill list of a window
      // must agree on two distinct operators; a deterministic sample of fills is cross-read on both, the rest on one.
      sensor: "the collector's session reads of on-chain fills: the list of fills agreed on two operators, a deterministic sample of them cross-read on both, the rest read on one",
      gate: "the publisher's closed checks: read quorum, earliest publication time, no closing price carried",
      act: "a signed, hash-chained publication on its own host, checked by the reader-side verifier",
    },
    connects: registerNames(["Hikae", "Shōgen"]),
    status: "built",
    // The served host, its deploy check (docs/deploy-CA-bell.json, produced by scripts/verify-bell.mjs, which runs the
    // real reader-side verifier) and the site data read from it.
    served: {
      served_by: "https://bell.monarkgate.tech (timeline.jsonl, state.json, provenance.json, bell/pubkey.json, states/<sha256>.json, provenance/<sha256>.json); deploy check docs/deploy-CA-bell.json by scripts/verify-bell.mjs; site data apps/site/data/bell-served.json",
      integration_test: ["verify_bell_ca_check5_runs_real_bell_verify", "bell_served_data_matches_deploy_ca", "bell_publication_anchor_composes_served_head_to_rendered_claim"],
      note: "a signed, hash-chained timeline served on its own host, checked end to end by a non-LLM reader-side verifier against the committed keyring",
    },
  },
];

// ── Counts and names, DERIVED from the arrays above for prose (never typed on a surface) ─────────────────────────
// A count renders as an English WORD, never a digit (static metadata and body copy are digit-free, per the numeric-hole
// scans). The index of a word IS its count, so COUNT_WORDS[n] is the word for n. Pure helpers, so the root test
// program (nodenext) and the Next bundler both compile them, like the register itself.

/** "zero" … "twelve": the word for a register count, indexed by the count itself. */
export const COUNT_WORDS: readonly string[] = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/** The word for a count. Fail-closed: a count with no word throws at build time, so a page never falls back to a
 *  digit and never renders an empty count (extend COUNT_WORDS in a reviewed change instead). */
export function countWord(n: number): string {
  const word = Number.isInteger(n) ? COUNT_WORDS[n] : undefined;
  if (word === undefined) throw new Error(`fleet: no count word for ${String(n)} (extend COUNT_WORDS)`);
  return word;
}

/** Sentence-initial form of a word ("four" -> "Four"). */
export function capitalized(word: string): string {
  return word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
}

/** Register names as English prose: "A", "A and B", "A, B and C". Fail-closed on an empty list (a sentence that
 *  names nobody is a hollow claim; the caller branches on the count first). */
export function listNames(names: readonly string[]): string {
  if (names.length === 0) throw new Error("fleet: listNames needs at least one name");
  if (names.length === 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1] ?? ""}`;
}

/** The built agents of the register, in register order (a `status === "built"` narrow exposes their wiring). */
export function builtAgents(): BuiltFleetAgent[] {
  return FLEET_AGENTS.filter((a): a is BuiltFleetAgent => a.status === "built");
}

/** The upcoming agents of the register, in register order. */
export function upcomingAgents(): UpcomingFleetAgent[] {
  return FLEET_AGENTS.filter((a): a is UpcomingFleetAgent => a.status === "upcoming");
}

/** The built applications of the register (each carries its served wiring), in register order. */
export function builtProducts(): BuiltFleetProduct[] {
  return PRODUCTS.filter((p): p is BuiltFleetProduct => p.status === "built");
}

/** The upcoming applications of the register, in register order (no served wiring: safe to hand to a client panel). */
export function upcomingProducts(): UpcomingFleetProduct[] {
  return PRODUCTS.filter((p): p is UpcomingFleetProduct => p.status === "upcoming");
}

/** The status sentence of the applications, derived from PRODUCTS: which are built, then that every other one is
 *  upcoming — and, only while every upcoming one is cleared by the shared gate, that each is. It says no more than
 *  its predicate: the register backs "cleared by the shared gate" for every upcoming application, not that each wires a
 *  fleet agent besides the gate. Rendered by /applications (lede + static metadata) and the home board's aside; pinned by
 *  test/site-build-fleet.test.ts. */
export function productStatusSentence(): string {
  const built = builtProducts();
  const onSharedGate = upcomingProducts().every((p) => p.wiring.gate === SHARED_GATE);
  const tail = onSharedGate ? ", each cleared by the shared gate" : "";
  if (built.length === 0) return `Every application is upcoming${tail}.`;
  const verb = built.length === 1 ? "is" : "are";
  return `${listNames(built.map((p) => p.name))} ${verb} built; every other application is upcoming${tail}.`;
}
