// MONARK rpc-guard - the SERVED subcommand dispatch (C-6, Branchement rule). `runCli` is offline-testable (the fs
// read is injected) and its verdict/exit-code is the CONSUMED output: the course reads the exit code, the provenance
// journal reads the appended chained line. The integration tests T16/T17/T14 replay this composition end-to-end.
//   reconcile --before <snap> --after <snap> --cycle <id>   (exit != 0 on NO-GO)
//   unlock    --cycle <id> --op <label> --reason <text>
// A thin `bin` wrapper (process.argv + real fs) is a 1b wiring item; nothing installs this workspace package as a
// bin at 1a (upcoming), so the served surface here is `runCli` under test.
import { openCycleLedger } from "./ledger.ts";
import { runReconcile, type Snapshot } from "./reconcile.ts";
import { runUnlock } from "./lock.ts";

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
    const ledger = openCycleLedger(deps.ledgerDir, cycle, deps.floor);
    const r = runReconcile(ledger, deps.readSnapshot(need("--before")), deps.readSnapshot(need("--after")), cycle);
    return { exitCode: r.exitCode, verdict: r.verdict, ...(r.reason !== undefined ? { reason: r.reason } : {}) };
  }
  if (sub === "unlock") {
    const cycle = need("--cycle");
    const ledger = openCycleLedger(deps.ledgerDir, cycle, deps.floor);
    runUnlock(ledger, need("--op"), need("--reason"));
    return { exitCode: 0 };
  }
  throw new Error(`rpc-guard: unknown subcommand '${String(sub)}' (fail-closed)`);
}
