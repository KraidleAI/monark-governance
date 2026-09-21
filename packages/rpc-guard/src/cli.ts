// MONARK rpc-guard - the SERVED subcommand dispatch (C-6, Branchement rule). `runCli` is offline-testable (the fs
// read is injected) and its verdict/exit-code is the CONSUMED output. The reconcile/unlock ledgers are PER-OPERATOR,
// so both subcommands require --op. The integration tests T16/T17/T14 replay this composition end-to-end.
//   reconcile --before <snap> --after <snap> --cycle <id> --op <label>   (exit != 0 on NO-GO)
//   unlock    --cycle <id> --op <label> --reason <text>
import { ensureCycleDir, openOperatorLedger } from "./ledger.ts";
import { runReconcile, type Snapshot } from "./reconcile.ts";
import { acquireLock, releaseLock, runUnlock } from "./lock.ts";

export interface CliDeps {
  readonly ledgerDir: string;
  readonly floor: number;
  readonly readSnapshot: (path: string) => Snapshot;
}
export interface CliResult { readonly exitCode: number; readonly verdict?: string; readonly reason?: string; }

export function runCli(argv: readonly string[], deps: CliDeps): CliResult {
  const sub = argv[0];
  const rest = argv.slice(1);
  const arg = (name: string): string | undefined => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
  const need = (name: string): string => { const v = arg(name); if (v === undefined) throw new Error(`rpc-guard: ${name} required (fail-closed)`); return v; };
  if (sub === "reconcile") {
    const cycle = need("--cycle");
    const op = need("--op");
    const mode = arg("--mode") ?? "per-method"; // GARDE-HELIUS-2: chainstack courses pass --mode aggregate (FAITS pt 10)
    if (mode !== "per-method" && mode !== "aggregate") throw new Error(`rpc-guard: --mode must be 'per-method' or 'aggregate' (fail-closed)`);
    const cycleDir = ensureCycleDir(deps.ledgerDir, cycle);
    acquireLock(cycleDir, op); // C-G2-4: the reconcile APPEND is a write - guard it against a concurrent course writer
    try {
      const r = runReconcile(openOperatorLedger(cycleDir, op, deps.floor), deps.readSnapshot(need("--before")), deps.readSnapshot(need("--after")), cycle, mode);
      return { exitCode: r.exitCode, verdict: r.verdict, ...(r.reason !== undefined ? { reason: r.reason } : {}) };
    } finally { releaseLock(cycleDir, op); }
  }
  if (sub === "unlock") {
    const cycle = need("--cycle");
    const op = need("--op");
    const ledger = openOperatorLedger(ensureCycleDir(deps.ledgerDir, cycle), op, deps.floor);
    runUnlock(ledger, op, need("--reason"));
    return { exitCode: 0 };
  }
  throw new Error(`rpc-guard: unknown subcommand '${String(sub)}' (fail-closed)`);
}
