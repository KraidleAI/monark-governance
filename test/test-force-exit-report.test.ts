/**
 * TEST-FORCE-EXIT-REPORT-LOSS-1 (docs/G0-lot-test-force-exit-report-loss-1.md). Under `--test-force-exit` each `node --test` child
 * calls process.exit() when its file ends; on POSIX its stdout is a non-blocking pipe, so the reports still queued at that instant
 * were dropped and the file exited 0 (measured: 8930 of 9600 tests reported, all green). scripts.test carries, right after
 * `--test-force-exit`, an inline `--import` that the runner hands to every child: stdout is made blocking (nothing is left to drop),
 * and an exit guard turns a 0 exit into 70 when stdout still holds queued bytes, so the runner reds that file by name.
 * The `node --test` launcher itself does not run `--import` modules (measured on Node 24.21), and it also calls process.exit()
 * under `--test-force-exit`: through a pipe that Node created and that is read late (test 42's nested `npm run ci`), the bytes still
 * queued at that instant were dropped (measured: 6 of 10 runs lost up to 2,478 report lines and the summary, exit 0). So every force-exit script starts with `node -r ./test/helpers/blocking-stdout.cjs --test`, which makes the
 * launcher's stdout blocking too (EXPORT-TEST42-SUMMARY-1).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { collectFiles } from "../scripts/export-public.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const scripts = (): Record<string, string> => (JSON.parse(readFileSync(ROOT + "package.json", "utf8")) as { scripts: Record<string, string> }).scripts;
const LAUNCHER = "node -r ./test/helpers/blocking-stdout.cjs --test ";
const AFTER_FORCE_EXIT = /^node (?:-r \S+ )?--test --test-timeout=\d+ --test-force-exit "(--import=data:text\/javascript,[^"]+)" /;
const preload = (): string | undefined => AFTER_FORCE_EXIT.exec(scripts().test ?? "")?.[1];
// Placed BEFORE the preload: setBlocking becomes a no-op, so stdout stays non-blocking and only the exit guard is left.
const NO_BLOCKING = "--import=data:text/javascript,process.stdout._handle.setBlocking=function(){return 0}";
const CHUNK = 65536;

/** A child writes `chunks` x 64 KiB to stdout then calls process.exit(code); the parent reads only once it has exited (or after 2 s). */
async function drop(imports: string[], chunks: number, code: number): Promise<{ status: number | null; bytes: number }> {
  const body = `const b=Buffer.alloc(${CHUNK},120);for(let i=0;i<${chunks};i++)process.stdout.write(b);process.exit(${code})`;
  const child = spawn(process.execPath, [...imports, "-e", body], { stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const exited = new Promise<number | null>((resolve) => child.on("exit", (c) => resolve(c)));
  await Promise.race([exited, delay(2000)]); // a blocking child cannot exit before the parent reads: 2 s, then read
  let bytes = 0;
  for await (const d of child.stdout) bytes += (d as Buffer).length;
  return { status: await exited, bytes };
}

// killer: package.json:16 CONST "--import=data:text/javascript," -> "--import=data:text/plain,"
test("test_scripts_carry_the_report_preload - scripts.test imports the preload right after --test-force-exit, and so does every force-exit script", () => {
  const arg = preload();
  assert.ok(arg !== undefined, 'scripts.test must read `node --test --test-timeout=<ms> --test-force-exit "--import=data:text/javascript,<preload>" ...`');
  assert.doesNotMatch(arg, /[?#%$` ]/, "the inline preload must hold no ? or # (a data: URL query/fragment) and nothing sh or cmd.exe would expand");
  for (const [name, s] of Object.entries(scripts()).filter(([, s]) => s.includes("--test-force-exit"))) {
    assert.equal(s.split(`"${arg}"`).length, 2, `scripts["${name}"] carries --test-force-exit, so it must carry the report preload once`);
    assert.ok(s.startsWith(LAUNCHER), `scripts["${name}"] carries --test-force-exit, so its launcher must load the blocking stdout: \`${LAUNCHER}...\``);
  }
});

// killer: package.json:16 CONST "setBlocking(true)" -> "setBlocking(false)"
test("report_preload_delivers_every_byte_before_force_exit - a child that exits right after writing 4 MiB loses nothing", async () => {
  const arg = preload();
  assert.ok(arg !== undefined, "scripts.test carries no report preload");
  const bare = await drop([], 64, 0);
  assert.ok(bare.status === 0 && bare.bytes < 64 * CHUNK, `fixture: without the preload some bytes must be dropped (got ${bare.bytes}, exit ${bare.status})`);
  const guarded = await drop([arg], 64, 0);
  assert.deepEqual(guarded, { status: 0, bytes: 64 * CHUNK }, "with the preload every byte must reach the parent, exit 0");
});

// killer: package.json:16 ROR "writableLength>0" -> "writableLength<0"
test("report_preload_reds_a_child_that_would_drop_bytes - exit 70 on bytes left queued, a failure code kept, no false red", async () => {
  const arg = preload();
  assert.ok(arg !== undefined, "scripts.test carries no report preload");
  const lost = await drop([NO_BLOCKING, arg], 64, 0);
  assert.ok(lost.bytes < 64 * CHUNK, `fixture: with setBlocking neutralised some bytes must be dropped (got ${lost.bytes})`);
  assert.equal(lost.status, 70, "a 0 exit with stdout bytes still queued must become 70 (the runner reds the file by name)");
  assert.equal((await drop([NO_BLOCKING, arg], 64, 3)).status, 3, "a failing child keeps its own code");
  assert.equal((await drop([NO_BLOCKING, arg], 0, 0)).status, 0, "a child with nothing queued stays 0");
});

/** The node arguments of scripts.test before its first glob, as sh passes them ("..." unquoted). */
const launcherArgs = (): string[] => {
  const words = [...(scripts().test ?? "").matchAll(/"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2]!);
  return words.slice(1, words.findIndex((w) => w.includes("*")));
};

// killer: package.json:16 CONST "node -r ./test/helpers/blocking-stdout.cjs --test" -> "node --test"
test("launcher_delivers_every_byte_before_force_exit - the node --test launcher of scripts.test, read only after it exits, loses nothing it wrote at exit", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tfe-launcher-"));
  try {
    // The probe runs in the launcher only (its execArgv holds --test): right before force-exit it writes 1 MiB, the worst case of
    // a report tail still queued. Measured: without a blocking stdout the launcher exits at once and keeps 143 KiB of it.
    const probe = join(dir, "probe.cjs"), file = join(dir, "one.test.mjs");
    writeFileSync(probe, `if (process.execArgv.includes("--test")) { const exit = process.exit; process.exit = function (c) { process.stdout.write(Buffer.alloc(${CHUNK * 16}, 120)); return exit.call(this, c); }; }\n`);
    writeFileSync(file, 'import { test } from "node:test";\ntest("one", () => {});\n');
    const args = launcherArgs(), at = args.indexOf("--test");
    assert.ok(at >= 0, "scripts.test runs node --test");
    const child = spawn(process.execPath, [...args.slice(0, at), "-r", probe, ...args.slice(at), "--test-reporter=spec", file],
      { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    child.stdout.on("readable", () => {}); // never flowing: child_process's resume() at exit cannot discard what is still unread
    const exited = new Promise<number | null>((resolve) => child.on("exit", (c) => resolve(c)));
    await Promise.race([exited, delay(2000)]); // read late, as test 42's spawnSync may under load; a blocking launcher waits
    const bufs: Buffer[] = [];
    for await (const d of child.stdout) bufs.push(d as Buffer);
    const out = Buffer.concat(bufs);
    assert.deepEqual({ status: await exited, probe: out.filter((b) => b === 120).length, summary: /^\u2139 tests 1$/m.test(out.toString("utf8")) },
      { status: 0, probe: CHUNK * 16, summary: true }, "the launcher must hand its summary and every byte written at force-exit to a pipe read after it exits");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: scripts/export-public.mjs:76 SDL "  \"test/helpers/blocking-stdout.cjs\"," -> ""
test("exported_tree_ships_every_preload_its_test_scripts_load - the public mirror runs package.json as is, so each -r file of a script is exported (ADR-M004 D7 undecies)", () => {
  const kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  const loaded = Object.values(scripts()).flatMap((s) => [...s.matchAll(/(?:^| )-r (\S+)/g)].map((m) => m[1]!.replace(/^\.\//, "")));
  assert.ok(loaded.includes("test/helpers/blocking-stdout.cjs"), "scripts.test loads test/helpers/blocking-stdout.cjs with -r");
  assert.deepEqual(loaded.filter((f) => !kept.has(f)), [], "every file a test script loads with -r must be in collectFiles(ROOT).kept, or the exported CI cannot start");
});
