/**
 * The three served marginal tables of contract 1.1.0 (block C, lot CM-3c-3b; delegated decision Q-C3): the stable-run,
 * liquidation and cascade table files, built once at load from calibration.ts, fail-closed (guardMarginalTable, then
 * assertLiqBandExact for the liq strata). It imports no kata module (kata-path.ts, policy-classes.ts, policy-guard.ts)
 * and carries no error code, so no kata code enters the served graph before block D; servedPolicyTables of kata-path.ts
 * calls it, so the two agree by construction. The texts and sources are one parameter (Z-3 line of MONARK).
 */
import type { ClassEntry, PolicyTable } from "@monark/contracts";
import { lookupCommittedCalibration, UKEMI_LIQ_COMMITTED, USDE_STABLE_RUN_PREDICTOR_ID, USDE_STABLE_RUN_TASK_CLASS } from "./calibration.ts";
import { LIQ_POLICY, USDE_POLICY } from "./class-policy.ts";
import { guardMarginalTable, marginalClassEntries, marginalRow, type MarginalInputs } from "./policy-marginal.ts";
import { buildPolicyTable, policyTableSha256 } from "./policy-table-file.ts";

/** The texts and sources of the served tables: the class text, and the source and row text of each class's rows. */
export type ServedTableTexts = { readonly classText: (taskClass: string) => string; readonly marginal: (taskClass: string) => MarginalInputs };
export type ServedTable = { readonly task_class: string; readonly table: PolicyTable; readonly policy_table_sha256: string };

/** The stable-run, liquidation and cascade table files, each guarded against the rows rebuilt from calibration.ts. */
export function servedMarginalTables(texts: ServedTableTexts): readonly ServedTable[] {
  const [usde, liq, cascade] = marginalClassEntries(texts.classText) as [ClassEntry, ClassEntry, ClassEntry];
  const usdeCal = lookupCommittedCalibration(USDE_STABLE_RUN_TASK_CLASS, USDE_STABLE_RUN_PREDICTOR_ID);
  const committed = [...(usdeCal === undefined ? [] : [usdeCal]), ...UKEMI_LIQ_COMMITTED];
  const specs = [[usde, USDE_POLICY, "time"], [liq, LIQ_POLICY, "ascending"], [cascade, USDE_POLICY, "time"]] as const;
  return specs.map(([cls, policy, order]) => {
    const inp = texts.marginal(cls.task_class);
    const table = buildPolicyTable(cls, committed.filter((c) => c.taskClass === cls.task_class).map((c) => marginalRow(c, cls, policy, order, inp)));
    guardMarginalTable(table, cls, committed, policy, order, inp);
    return { task_class: cls.task_class, table, policy_table_sha256: policyTableSha256(table) };
  });
}
