// UKEMI-CONC-1 (ADR-U4b amendment 2026-09-23) - the BOUNDED WINDOW the recorder uses for its per-account reads when
// `--concurrency <n>` > 1 (record.ts -> prefetch.ts). Pure: no network / fs / env / clock. Contract:
//   - at most n tasks in flight (n workers pulling from ONE shared cursor; never a Promise.all over every item);
//   - results are stored BY INPUT INDEX (out[i]), never in arrival order;
//   - the FIRST error (in time) stops the window: no item is dispatched after it, and `signal.stopped` lets a
//     multi-read task stop at its next read boundary (PoolStoppedError, never surfaced);
//   - every in-flight task is DRAINED before that first error is rethrown. Load-bearing: an in-flight quorum read can
//     still issue a client.call (= one write-ahead ledger line); rethrowing early would let the caller's `finally`
//     unlock the operators first, and the late line would chain on a stale in-memory head (CHAIN-1 family);
//   - later errors are collected in `report.suppressed` (the diag lists them), PoolStoppedError excluded.
// At n = 1 this is the sequential loop: one task at a time in input order, the first error ends the run.

/** Thrown by a task that observes the stop at a read boundary (no read is launched after a stop). */
export class PoolStoppedError extends Error {}

export interface PoolSignal { readonly stopped: boolean; }
export interface PoolReport { suppressed: Array<{ name: string; message: string }>; }

const nameOf = (e: unknown): string => (e instanceof Error ? (e.name !== "" && e.name !== "Error" ? e.name : e.constructor.name) : "unknown");

/** Run `worker(item, index, signal)` over `items` with at most `n` in flight (see the file header). */
export async function runBounded<T, R>(items: readonly T[], n: number, worker: (item: T, index: number, signal: PoolSignal) => Promise<R>, report?: PoolReport): Promise<R[]> {
  if (!Number.isSafeInteger(n) || n < 1) throw new Error(`ukemi/pool: the window must be an integer >= 1, got ${String(n)}`);
  const out = new Array<R>(items.length);
  const signal = { stopped: false };
  let first: { error: unknown } | undefined;
  let next = 0;
  const lane = async (): Promise<void> => {
    while (!signal.stopped && next < items.length) {
      const i = next++;
      try { out[i] = await worker(items[i] as T, i, signal); }
      catch (e) {
        if (first === undefined) { first = { error: e }; signal.stopped = true; }
        else if (!(e instanceof PoolStoppedError)) report?.suppressed.push({ name: nameOf(e), message: e instanceof Error ? e.message : String(e) });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => lane())); // lanes never reject: this IS the drain
  if (first !== undefined) throw first.error instanceof Error ? first.error : new Error(String(first.error));
  return out;
}

/** `--concurrency <n>` (C-1(b): an OPTIONAL CLI argument, never an env read). Absent => 1 = the sequential recorder,
 *  byte-identical. Present => a decimal integer >= 1, else a PRE-FLIGHT refusal (thrown before any client / ledger). */
export function parseConcurrency(argv: readonly string[]): number {
  const i = argv.indexOf("--concurrency");
  if (i < 0) return 1;
  const v = argv[i + 1] ?? "";
  const n = Number(v);
  if (!/^[0-9]+$/.test(v) || !Number.isSafeInteger(n) || n < 1) throw new Error(`ukemi/record: --concurrency must be an integer >= 1, got '${v}' (UKEMI-CONC-1, fail-closed)`);
  return n;
}
