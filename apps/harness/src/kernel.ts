/**
 * Harness — the runner of Genkan's kernel (step 5 of ROADMAP.md): the one served module that starts a process (kata-path.test.ts
 * holds it to that).
 *
 * `kernelRunner(binary)` runs the kernel binary by its path, with no shell, no argument and an empty environment, writes one
 * request on its stdin, and answers its exit status and its stdout; stderr is not read. The run is asynchronous: the server goes on
 * answering other calls while a kernel runs (about 30 ms measured on Windows). A binary no process can be made of (absent, a
 * directory, a file that is not a program) is no run (`null`), which the judge tool answers as a deny `unavailable`. A run that
 * starts and then fails comes back as it is, and readVerdict reads it as unreadable, never as an allow: a run not done at
 * KERNEL_TIMEOUT_MS, or whose stdout passes KERNEL_STDOUT_MAX bytes, is killed and answers at once with status null (its stdout is
 * what was read until then); an exit other than 0, or a signal, is its own status. A kernel that exits before it reads its stdin
 * is an answer too: the failed write is not an error of the server. These are the answers the synchronous runner (spawnSync,
 * before 2026-11-04) gave, which kernel-runner.test.ts holds, but one: a kernel that exits 0 and leaves its stdout open past the
 * timeout (a descendant holding it) had status 0 under spawnSync, an allow had it written the allow line; it has status null here.
 *
 * `limitedKernel(runner, max)` lets at most `max` runs go at once; a run past the limit waits its turn, first come first served,
 * and adds no error: it is answered later, never refused. The timeout counts from the kernel's start, so a call that waited takes
 * longer than KERNEL_TIMEOUT_MS. The queue has no bound of its own: it holds the calls the server has taken in. `runKernel` runs the
 * binary that `lake build genkan-kernel` writes in apps/genkan/kernel, under the limit of KERNEL_MAX_CONCURRENT; startServer hands
 * it to the tools.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { KernelAnswer, KernelRunner } from "./tools/judge.ts";

/** The binary that `node apps/genkan/scripts/lake.mjs build genkan-kernel` writes. */
export const KERNEL_BINARY: string = fileURLToPath(new URL(`../../genkan/kernel/.lake/build/bin/genkan-kernel${process.platform === "win32" ? ".exe" : ""}`, import.meta.url));
/** The kernel answers one line of at most 32 bytes; past this cap the run is killed, and its answer is unreadable. */
export const KERNEL_STDOUT_MAX = 64;
/** The kernel answers a mode 1 request at once; past this the run is killed, and its answer is unreadable. */
export const KERNEL_TIMEOUT_MS = 10_000;
/** At most this many kernels run at once in the server. Measured on a Ryzen 9 3900X (24 threads, Windows, 240 runs each): the
 *  median run takes about 30 ms alone and four at once, 37 ms eight at once, 47 ms twelve at once. */
export const KERNEL_MAX_CONCURRENT = 4;
/** A kernel killed (SIGTERM) and still there this long after is killed by SIGKILL. */
export const KERNEL_KILL_GRACE_MS = 1_000;

/** A runner of the kernel binary at `binary`, killed past `timeoutMs`. */
export function kernelRunner(binary: string, timeoutMs: number = KERNEL_TIMEOUT_MS): KernelRunner {
  return (request) =>
    new Promise<KernelAnswer>((resolve) => {
      let child: ChildProcess;
      try {
        child = spawn(binary, [], { env: {}, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "ignore"] });
      } catch {
        // No process was made (spawn throws for some failures, a file that is not a program on Windows): no kernel ran.
        resolve(null);
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      let killed = false;
      let settled = false;
      // Past its cap or its timeout (or on an error of its stdout) the run is cut: the process is killed, our ends of its pipes are
      // closed, and the run answers at once, status null (as spawnSync's ENOBUFS and ETIMEDOUT), whatever its exit. It does not
      // wait for the pipe to close, which a descendant holding the kernel's stdout could put off for as long as it lives. A process
      // still there after KERNEL_KILL_GRACE_MS is killed by SIGKILL.
      const kill = (): void => {
        if (killed) return;
        killed = true;
        child.kill();
        const grace = setTimeout(() => {
          if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
        }, KERNEL_KILL_GRACE_MS);
        grace.unref();
        child.stdout?.destroy();
        child.stdin?.destroy();
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        resolve({ status: null, stdout: new Uint8Array(Buffer.concat(chunks)) });
      };
      const timer = setTimeout(kill, timeoutMs);
      child.on("error", () => {
        // No process was made (absent, a directory): no kernel ran. An error of a run that started waits for its close.
        if ((child.pid !== undefined && child.pid !== 0) || settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(null);
      });
      child.on("close", (code: number | null) => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        resolve({ status: killed ? null : code, stdout: new Uint8Array(Buffer.concat(chunks)) });
      });
      child.stdout?.on("data", (chunk: Buffer) => {
        if (killed) return;
        chunks.push(chunk);
        size += chunk.length;
        if (size > KERNEL_STDOUT_MAX) kill();
      });
      child.stdout?.on("error", kill);
      // A kernel that exits before it reads its stdin fails the write (EPIPE): the run's answer says what it did.
      child.stdin?.on("error", () => undefined);
      child.stdin?.end(request);
    });
}

/** `runner` with at most `max` runs at once; a run past the limit waits its turn, first come first served. */
export function limitedKernel(runner: KernelRunner, max: number): KernelRunner {
  if (!Number.isSafeInteger(max) || max < 1) throw new RangeError(`a limit of kernels at once is a positive integer (got ${String(max)})`);
  let running = 0;
  const waiting: (() => void)[] = [];
  // A run that ends hands its place to the first waiting, or frees it.
  const release = (): void => {
    const next = waiting.shift();
    if (next === undefined) running--;
    else next();
  };
  return async (request) => {
    if (running < max) running++;
    else await new Promise<void>((start) => waiting.push(start));
    try {
      return await runner(request);
    } finally {
      release();
    }
  };
}

/** The runner of the built kernel, at most KERNEL_MAX_CONCURRENT at once: what startServer hands the tools. */
export const runKernel: KernelRunner = limitedKernel(kernelRunner(KERNEL_BINARY), KERNEL_MAX_CONCURRENT);
