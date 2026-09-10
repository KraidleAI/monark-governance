// apps/site/lib/gate-enums.ts — server-only, build-time read of the FROZEN gate-decision.schema.json
// (ADR-M001 D5; ADR-M004 D15). It exposes the `action` and the reason enums so a client sim island can
// receive them as PROPS without ever citing that third action word as a literal anywhere in apps/site:
// that word is ALSO a required field of CoverageVerdict, so a quoted literal would red
// test/ci-gates.test.ts `frozen_contract_fields_stay_dynamic`. commit / defer and the thirteen reason
// codes are NOT contract fields and may be cited freely; only the third action must flow from here, and
// the client resolves it by INDEX (see components/gate-sim, ACTION_ABSTAIN in lib/sim.ts).
//
// Mirrors lib/load-contract.ts: it takes `rootDir` (a server component passes
// join(process.cwd(), "..", ".."); apps/site is the cwd under `next build`/`next dev`) rather than
// reading at module scope, because the module's own location is unreliable once bundled. The C-9 root
// test pins the loaded order [commit, defer, abstain].
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface GateEnums {
  /** The frozen `action` enum, in schema order [commit, defer, abstain] (pinned by the C-9 root test). */
  readonly actions: readonly string[];
  /** The frozen closed reason enum (thirteen codes), in schema order. */
  readonly reasons: readonly string[];
}

interface EnumProperty {
  readonly enum?: readonly string[];
}
interface GateDecisionSchema {
  readonly properties?: {
    readonly action?: EnumProperty;
    readonly reason?: EnumProperty;
  };
}

/**
 * Read the `action` and the reason enums from schemas/gate-decision.schema.json. `rootDir` is the repo
 * root (schemas/ lives there, frozen by contracts-frozen.test.ts; this module only reads it). The arrays
 * keep the schema's declared order; the client resolves the third action by INDEX (never a literal).
 */
export function loadGateEnums(rootDir: string): GateEnums {
  const abs = join(rootDir, "schemas", "gate-decision.schema.json");
  const schema = JSON.parse(readFileSync(abs, "utf8")) as GateDecisionSchema;
  return {
    actions: schema.properties?.action?.enum ?? [],
    reasons: schema.properties?.reason?.enum ?? [],
  };
}

// Action type DERIVED from the loaded array — never the literal union (that would spell out the third
// action word and red the frozen-contract-field gate). It resolves to `string`; the loaded ORDER is what
// the C-9 root test pins, and the client indexes by position (ACTION_ABSTAIN). What breaks on a reorder
// is `actions[ACTION_ABSTAIN]`, which the C-9 test catches — not this type.
export type GateAction = GateEnums["actions"][number];
