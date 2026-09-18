// apps/site/components/sas/sas-model.ts — the PURE, CLIENT-SAFE model of "the sas": four chambers, the
// eleven pieces DERIVED from the fleet register, the eight client profiles derived from the picker, the
// single spine, and the reason -> chamber map resolved BY INDEX against the frozen enum.
//
// RESOLVER-NEUTRAL + CLIENT-SAFE by construction (measured 2026-09-18): it imports only TYPES from lib
// (an `import type` with a .ts specifier is elided, so it type-checks under BOTH the root nodenext test
// program AND the apps/site bundler program — a VALUE import with .ts reds TS5097 under the bundler). It
// reads no node:fs: the registers and the loaded gate enums flow IN as parameters (mirror of hikae-panel,
// which receives its frozen contract as a prop), so this module never reaches node: on the client bundle.
//
// NOTHING here quotes a frozen-contract field name (that would red frozen_contract_fields_stay_dynamic on
// components/sas/**). The reason codes are NOT contract fields (lib/sim.ts / lib/how-copy.ts cite them as
// plain literals), so the reason -> chamber table may key on them; the third action word and every field
// name stay out. No rendered numeric literal lives here (this is not a rendered surface).
import type { FleetAgent, FleetRole, FleetStatus } from "../../lib/fleet.ts";
import type { PickerProfile, ProfileTier } from "../../lib/profiles.ts";

export type ChamberId = "attest" | "calibrate" | "gate" | "agir";

export interface Chamber {
  readonly id: ChamberId;
  /** Display label (the four public tools of the engine). */
  readonly label: string;
}

/** The four chambers, in pipeline order (the diagonal high-left -> low-right of the illustration). */
export const CHAMBERS: readonly Chamber[] = [
  { id: "attest", label: "Attest" },
  { id: "calibrate", label: "Calibrate" },
  { id: "gate", label: "Gate" },
  { id: "agir", label: "Agir" },
];

/** The chamber ids in pipeline order — the ONE source the spine is built from. */
export const CHAMBER_ORDER: readonly ChamberId[] = CHAMBERS.map((c) => c.id);

// SPINE — the SINGLE, closed definition (checkpoint-1 C-7): the diagonal of the four chambers, with NO
// piece. The three VISAGE profiles light it alone. Defined exactly once, derived from CHAMBER_ORDER.
export const SPINE: readonly ChamberId[] = CHAMBER_ORDER;

/** MONARK is the whole sas — the container, never one of the pieces. */
export const CONTAINER = "MONARK";

// Piece -> chamber assignment BY NAME (investor assignment, MODELE-ILLUSTRATION §7). Hikae is the
// double filter (Calibrate AND Gate); every other piece sits in exactly one chamber. Keyed by the
// register name so a rename in lib/fleet.ts surfaces as a piece with no chamber (caught by the root test),
// never a silent copy of the register's role/status/line (those flow from the injected agent).
const PIECE_CHAMBERS: Readonly<Record<string, readonly ChamberId[]>> = {
  "Shōgen": ["attest"],
  "Narabi": ["attest"],
  "Mokugeki": ["attest"],
  "Hikae": ["calibrate", "gate"],
  "Kyokusen": ["calibrate"],
  "Genkan": ["gate"],
  "Ukemi": ["agir"],
  "Kaihi": ["agir"],
  "Kessai": ["agir"],
  "Kamae": ["agir"],
  "Koyomi": ["agir"],
};

export interface SasPiece {
  readonly name: string;
  /** Ascii key (matches the picker's engineKeys) — derived from the register name, not a second source. */
  readonly key: string;
  readonly role: FleetRole;
  readonly status: FleetStatus;
  readonly chambers: readonly ChamberId[];
}

/** Ascii key for a piece, derived from its register name (Shōgen -> shogen). */
export function pieceKey(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * The eleven pieces DERIVED from the fleet register (never recopied): name/role/status come FROM each
 * injected agent; only the chamber assignment and the ascii key are added here. MONARK is not an agent,
 * so it never appears — it is the container.
 */
export function derivePieces(agents: readonly FleetAgent[]): readonly SasPiece[] {
  return agents.map((a) => ({
    name: a.name,
    key: pieceKey(a.name),
    role: a.role,
    status: a.status,
    chambers: PIECE_CHAMBERS[a.name] ?? [],
  }));
}

export interface SasProfile {
  readonly label: string;
  readonly productName: string;
  readonly tier: ProfileTier;
  /** The illuminated path = the picker's engineKeys, verbatim (empty for the VISAGE tier -> spine only). */
  readonly path: readonly string[];
}

/** The eight profiles DERIVED from the picker; the path is the engineKeys as-is (E-1 mapping). */
export function deriveProfiles(profiles: readonly PickerProfile[]): readonly SasProfile[] {
  return profiles.map((p) => ({
    label: p.label,
    productName: p.productName,
    tier: p.tier,
    path: [...p.engineKeys],
  }));
}

// Reason -> chamber. Keyed by the reason code (NOT a contract field). The commit code owns no chamber.
// Consumers resolve BY INDEX against the loaded frozen enum via chamberForReasonIndex, so the table can
// not drift from the frozen thirteen (the root test pins coverage + uniqueness of the twelve non-commit codes;
// a surplus key outside the enum is unreachable by index and is not asserted — G2 C-4).
const REASON_CHAMBER: Readonly<Record<string, ChamberId>> = {
  non_evaluable: "attest",
  attestation_absent: "attest",
  attestation_refused: "attest",
  binding_broken: "attest",
  under_calib: "calibrate",
  no_label_schema: "calibrate",
  intent_not_in_region: "gate",
  budget_exhausted: "gate",
  set_too_large: "gate",
  interval_too_wide: "gate",
  clock_expired: "agir",
  upstream_timeout: "agir",
};

/** The commit code — the one reason that is a commit, not a deposit; it owns no chamber. */
export const COVERED = "covered";

/** Reason codes the machine references by name to resolve their INDEX against the loaded enum. Both are
 *  Gate codes: DEFER is the suspended-brume (defer) reason, EXHAUSTED the budget-floor deposit. */
export const REASON = { DEFER: "set_too_large", EXHAUSTED: "budget_exhausted" } as const;

/** The chamber that owns the reason at `index` of the loaded enum, or null for the commit code / unknown. */
export function chamberForReasonIndex(reasons: readonly string[], index: number): ChamberId | null {
  const code = reasons[index];
  if (code === undefined) return null;
  return REASON_CHAMBER[code] ?? null;
}

/** Position of a reason code in the loaded enum (-1 if absent) — the caller anchors deposits by index. */
export function reasonIndexOf(reasons: readonly string[], code: string): number {
  return reasons.indexOf(code);
}
