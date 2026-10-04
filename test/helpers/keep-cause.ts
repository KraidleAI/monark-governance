// test/helpers/keep-cause.ts -- lot L2-LINKS-FILE-CRASH-1 (2026-10-04): the cause of a crash of a test file, kept where the runner
// reports it. Why: node --test runs each file in a child and reads two pipes of it; it waits for the end of stdout and for the exit,
// then closes its reader of stderr (Node 24.21.0, lib/internal/test_runner/runner.js, runTestFile), so stderr lines that arrive late
// are dropped: under load a child that throws at load is reported as "test failed", none of its tests, no stderr line (measured: 33 of
// 1 200 such files, G7 of the lot). A file that calls keepCause() at load writes, on its stdout, which the runner reads to its end:
// each uncaught exception (and each unhandled rejection that no listener takes) with the step it came during (load, a test by name,
// between tests), and, at a non-zero exit, the code, the step and the tests begun and ended. A kill or a native crash runs no handler:
// the runner keeps their exit code and signal, which its TAP reporter prints and its spec reporter does not. Builtins only; it binds
// nothing.
import { writeSync } from "node:fs";
import { afterEach, beforeEach } from "node:test";

const LF = String.fromCharCode(10);
/** The first lines of an error's stack (else its text), on one line. */
export function describeCause(e: unknown): string {
  const text = e instanceof Error ? (e.stack ?? `${e.name}: ${e.message}`) : String(e);
  return text.split(LF).slice(0, 6).map((l) => l.trim()).join(" | ");
}

/** One line on stdout: straight to fd 1 when nothing is queued (an exit handler runs no later tick), else queued behind the reports. */
function say(line: string): void {
  const text = `# keep-cause ${line}${LF}`;
  if (process.stdout.writableLength === 0) {
    try { writeSync(1, text); return; } catch { /* a non-blocking pipe full: queue it */ }
  }
  process.stdout.write(text);
}

/** Installs the witnesses of `file` (its path, as the runner names it); called once, at load, before any other work of the file. */
export function keepCause(file: string): void {
  let step = "load", begun = 0, ended = 0;
  beforeEach((t) => { begun += 1; step = `test "${t.name}"`; }); // the first hook builds the harness: its own handlers come first
  afterEach(() => { ended += 1; step = "between tests"; });
  (process.stdout as unknown as { _handle?: { setBlocking?: (on: boolean) => void } })._handle?.setBlocking?.(true); // as red-proof: an exit drops no queued line
  // a monitor changes nothing: the harness reports as before, else the process dies as before (a rejection with no listener left too)
  process.on("uncaughtExceptionMonitor", (e, origin) => { say(`${file}: ${origin} during ${step}: ${describeCause(e)}`); });
  process.on("exit", (code) => {
    if (code !== 0) say(`${file}: exit code ${String(code)} during ${step}, tests begun ${String(begun)}, ended ${String(ended)}`);
  });
}
