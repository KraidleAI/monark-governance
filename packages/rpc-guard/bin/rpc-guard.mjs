#!/usr/bin/env node
// MONARK @monark/rpc-guard - the SERVED CLI executable (GARDE-HELIUS-1b-0, ruling R-6). Wires process.argv to runCli
// (cli.ts, the offline-tested subcommand surface): reconcile | unlock | repair-tail (GARDE-FSYNC-1, RUNBOOK-rpc-guard).
// --ledger-dir and --floor are EXPLICIT CLI args
// (never an env probe; B-4), snapshots are read from disk with JSON.parse, and the process EXIT CODE / printed verdict
// IS the consumed output (a downstream course reads it). No secret is read here: runCli opens per-operator ledgers +
// locks, never a paid endpoint. Node 24 strips the imported .ts at load. UPCOMING until a served course consumes this
// exit code (Branchement rule): 1b-0 ships the executable + its bin entry; the consumer lands at 1b-i+.
import { readFileSync } from "node:fs";
import { runCli } from "../src/cli.ts";

const argv = process.argv.slice(2);
const valueOf = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const stripPair = (a, name) => { const i = a.indexOf(name); return i >= 0 ? [...a.slice(0, i), ...a.slice(i + 2)] : a; };

const ledgerDir = valueOf("--ledger-dir");
if (ledgerDir === undefined) { process.stderr.write("rpc-guard: --ledger-dir required (fail-closed)\n"); process.exitCode = 2; }
else {
  const floorRaw = valueOf("--floor");
  const floor = floorRaw === undefined ? 0 : Number(floorRaw);
  if (!Number.isFinite(floor) || floor < 0) { process.stderr.write("rpc-guard: --floor must be a finite number >= 0 (fail-closed)\n"); process.exitCode = 2; }
  else {
    try {
      // runCli reads the subcommand at argv[0] and the rest of the flags; --ledger-dir/--floor live in deps.
      const rest = stripPair(stripPair(argv, "--ledger-dir"), "--floor");
      const r = runCli(rest, { ledgerDir, floor, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) });
      if (r.verdict !== undefined) process.stdout.write(r.verdict + (r.reason !== undefined ? ` ${r.reason}` : "") + "\n");
      process.exitCode = r.exitCode;
    } catch (e) {
      process.stderr.write((e instanceof Error ? e.message : String(e)) + "\n");
      process.exitCode = 2;
    }
  }
}
