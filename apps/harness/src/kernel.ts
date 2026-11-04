/**
 * Harness — the runner of Genkan's kernel (step 5 of ROADMAP.md): the one served module that starts a process (kata-path.test.ts
 * holds it to that).
 *
 * `kernelRunner(binary)` runs the kernel binary by its path, with no shell, no argument and an empty environment, writes one
 * request on its stdin, and returns its exit status and its stdout, cut at KERNEL_STDOUT_MAX bytes; stderr is not read. A binary
 * no process can be made of (absent, a directory, a file that is not a program: an error with pid 0) is no run (`null`), which
 * the judge tool answers as a deny `unavailable`. A run that starts and then fails (a timeout or an output past the cap, which
 * leave status null, an exit other than 0, a signal) comes back as it is, and readVerdict reads it as unreadable, never as an
 * allow. The run is synchronous: it holds the server's event loop until the kernel answers (about 30 ms measured on Windows),
 * or at most KERNEL_TIMEOUT_MS. `runKernel` runs the binary that `lake build genkan-kernel` writes in apps/genkan/kernel;
 * startServer hands it to the tools.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { KernelRunner } from "./tools/judge.ts";

/** The binary that `node apps/genkan/scripts/lake.mjs build genkan-kernel` writes. */
export const KERNEL_BINARY: string = fileURLToPath(new URL(`../../genkan/kernel/.lake/build/bin/genkan-kernel${process.platform === "win32" ? ".exe" : ""}`, import.meta.url));
/** The kernel answers one line of at most 32 bytes; past this cap the run is cut, and its answer is unreadable. */
export const KERNEL_STDOUT_MAX = 64;
/** The kernel answers a mode 1 request at once; past this the run is killed, and its answer is unreadable. */
export const KERNEL_TIMEOUT_MS = 10_000;

/** A runner of the kernel binary at `binary`, killed past `timeoutMs`. */
export function kernelRunner(binary: string, timeoutMs: number = KERNEL_TIMEOUT_MS): KernelRunner {
  return (request) => {
    const run = spawnSync(binary, [], { input: request, env: {}, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "ignore"], timeout: timeoutMs, maxBuffer: KERNEL_STDOUT_MAX });
    // No process was made: no kernel ran. A run killed past its timeout or its cap has an error too, but a pid.
    if (run.error !== undefined && run.pid === 0) return null;
    return { status: run.status, stdout: new Uint8Array(run.stdout) };
  };
}

/** The runner of the built kernel: what startServer hands the tools. */
export const runKernel: KernelRunner = kernelRunner(KERNEL_BINARY);
