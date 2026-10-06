// MONARK rpc-guard - the SERVED subcommand dispatch (C-6, Branchement rule). `runCli` is offline-testable (the fs
// read is injected) and its verdict/exit-code is the CONSUMED output. The reconcile/unlock ledgers are PER-OPERATOR,
// so both subcommands require --op. The integration tests T16/T17/T14 replay this composition end-to-end.
//   reconcile --before <snap> --after <snap> --cycle <id> --op <label> [--mode <m>] [--course-end <sha256> | --course-end=<sha256>]   (closed set, C-G2-2; exit != 0 on NO-GO)
//   unlock    --cycle <id> --op <label> --reason <text>   (renders the sha256 of its `unlocked` line: the course id, D-1)
//   repair-tail --cycle <id> --op <label> --reason <text>   (GARDE-FSYNC-1: exit 0 REPAIRED, exit 1 REFUSED <token>)
import { ensureCycleDir, openOperatorLedger } from "./ledger.ts";
import { runRepairTail } from "./repair.ts";
import { runReconcile, courseEndRefusal, AGGREGATE_ONLY_OPERATORS, type CourseTable, type Snapshot } from "./reconcile.ts";
import { acquireLock, releaseLock, runUnlock } from "./lock.ts";

export interface CliDeps {
  readonly ledgerDir: string;
  readonly floor: number;
  readonly readSnapshot: (path: string) => Snapshot;
}
export interface CliResult { readonly exitCode: number; readonly verdict?: string; readonly reason?: string; readonly unlocked?: string; readonly perMethod?: CourseTable; }

const RECONCILE_FLAGS: ReadonlySet<string> = new Set(["--cycle", "--op", "--mode", "--before", "--after", "--course-end"]); // C-G2-2
export function runCli(argv: readonly string[], deps: CliDeps): CliResult {
  const sub = argv[0];
  const rest = argv.slice(1).flatMap((a) => (sub === "reconcile" && a.startsWith("--course-end=") ? ["--course-end", a.slice(13)] : [a])); // C-G2-2
  const arg = (name: string): string | undefined => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
  const need = (name: string): string => { const v = arg(name); if (v === undefined) throw new Error(`rpc-guard: ${name} required (fail-closed)`); return v; };
  if (sub === "reconcile") {
    // C-G2-2 (post-G2): FIRST, before any directory, lock or line, a token in a flag position outside the closed set, or a repeated
    // flag, is refused - never read as the since-last-reconciled mode. No token is echoed (a pasted key stays unprinted).
    const seen = new Set<string>();
    for (let i = 0; i < rest.length; seen.add(rest[i]!), i += 2) if (!RECONCILE_FLAGS.has(rest[i]!) || seen.has(rest[i]!))
      throw new Error(`rpc-guard: unknown option (reconcile token ${String(i + 1)}: outside the closed set, or repeated; accepted once each, with its value: ${[...RECONCILE_FLAGS].join(" ")}; or --course-end=<sha256>) (fail-closed)`);
    const cycle = need("--cycle");
    const op = need("--op");
    const mode = arg("--mode") ?? "per-method"; // GARDE-HELIUS-2: chainstack courses pass --mode aggregate|aggregate-calibration (FAITS pt 10)
    if (mode !== "per-method" && mode !== "aggregate" && mode !== "aggregate-calibration") throw new Error(`rpc-guard: --mode must be 'per-method' | 'aggregate' | 'aggregate-calibration' (fail-closed)`);
    // C-V-5: an operator with no per-method dashboard (FAITS pt 10) REQUIRES an aggregate mode - fail-closed BEFORE any lock.
    if (AGGREGATE_ONLY_OPERATORS.has(op) && mode !== "aggregate" && mode !== "aggregate-calibration") throw new Error(`rpc-guard: operator '${op}' has no per-method dashboard (FAITS pt 10); pass --mode aggregate or aggregate-calibration (fail-closed)`);
    // RECONCILE-WINDOW-1 (D-1): --course-end = the sha of ONE course's `unlocked` line. A flag without a lowercase 64-hex value is
    // a usage error, an unknown sha or a non-`unlocked` line an ARGUMENT refusal (NO-GO, exit 1): all BEFORE any lock, no line.
    const courseEnd = rest.includes("--course-end") ? need("--course-end") : undefined;
    if (courseEnd !== undefined && !/^[0-9a-f]{64}$/.test(courseEnd)) throw new Error("rpc-guard: --course-end must be a lowercase 64-hex sha256 (fail-closed)");
    const cycleDir = ensureCycleDir(deps.ledgerDir, cycle);
    const refusal = courseEnd === undefined ? undefined : courseEndRefusal(cycleDir, op, courseEnd);
    if (refusal !== undefined) return { exitCode: 1, verdict: "NO-GO", reason: refusal };
    acquireLock(cycleDir, op); // C-G2-4: the reconcile APPEND is a write - guard it against a concurrent course writer
    try {
      const r = runReconcile(openOperatorLedger(cycleDir, op, deps.floor), deps.readSnapshot(need("--before")), deps.readSnapshot(need("--after")), cycle, mode, courseEnd);
      return { exitCode: r.exitCode, verdict: r.verdict, ...(r.reason !== undefined ? { reason: r.reason } : {}), ...(r.perMethod !== undefined ? { perMethod: r.perMethod } : {}) };
    } finally { releaseLock(cycleDir, op); }
  }
  if (sub === "unlock") {
    const cycle = need("--cycle");
    const op = need("--op");
    const ledger = openOperatorLedger(ensureCycleDir(deps.ledgerDir, cycle), op, deps.floor);
    return { exitCode: 0, unlocked: runUnlock(ledger, op, need("--reason")).entry_sha256 }; // D-1: the course id (--course-end)
  }
  if (sub === "repair-tail") return runRepairTail(deps.ledgerDir, need("--cycle"), need("--op"), need("--reason"), deps.floor);
  throw new Error(`rpc-guard: unknown subcommand '${String(sub)}' (fail-closed)`);
}
