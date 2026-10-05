/**
 * Root test `release_public_flow` (ADR-PUBLIC-CADENCE-1 §2.3 pipe; CA-1.1 flow half, CA-1.2, CA-1.3, CA-1.4, CA-1.7).
 * The REAL scripts/release-public.mjs runs as a process over a disposable bare repository and its clones under the OS temp
 * directory, a fake `gh` first on PATH that logs every call (gh.cmd on win32, P-8), and substitute gates that journal their
 * passage (the production list itself is pinned by release-public.test.ts, C-V-4; the real `npm run ci` never runs here).
 * The source is a copy of this tree committed on a fresh `main`, so the branch guard passes and the copied tool carries the
 * working-tree changes under test. Nothing reaches GitHub: the remote is the bare repository, gh is the fake.
 * Mutants: M1-k (push restored) reds the ls-remote check; M1-l, M1-m, M1-q and each rule of the message gate red their
 * refusal; M1-o (the gate runner goes on after a red gate) reds the red-gate variant.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { LOCAL_GATES } from "../scripts/release-public.mjs";
import { DATA_SOURCE_FORMS } from "../scripts/public-text-deny.mjs";

const ROOT = join(import.meta.dirname, "..");
const git = (cwd: string, ...args: string[]): string => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
interface RunOpts { mirror?: string | null; email?: string; vis?: string; gates?: string[][]; dirty?: boolean }

test("release_public_flow — message gate, refusals before any gate, export:check before export, one local commit, no push, gh reads only", () => {
  const tmp = mkdtempSync(join(tmpdir(), "monark-release-flow-"));
  try {
    // The source: this tree without installed deps (junctions), VCS data, build output, governance docs, root tests and the
    // sentinel test data (23 MB): none is read by the tool, none is a required export entry. Keeps the load test 42 (e) shares low.
    const src = join(tmp, "src");
    cpSync(ROOT, src, { recursive: true, filter: (from: string): boolean => ((r: string): boolean => /^test(\/helpers(\/blocking-stdout\.cjs)?)?$/.test(r) || !/(^|\/)(node_modules|\.git|dist)(\/|$)|^(docs|test|apps\/sentinel\/test)(\/|$)/.test(r))(relative(ROOT, from).replace(/\\/g, "/")) });
    for (const a of [["init", "-q", "-b", "main"], ["config", "core.autocrlf", "false"], ["config", "user.name", "Flow Test"], ["add", "-A"]]) git(src, ...a);
    git(src, "-c", "user.email=flow@users.noreply.github.com", "commit", "-q", "-m", "seed");
    const seed = join(tmp, "seed");
    mkdirSync(seed);
    writeFileSync(join(seed, "README.md"), "seed\n");
    git(seed, "init", "-q", "-b", "main");
    git(seed, "-c", "core.autocrlf=false", "add", "-A");
    git(seed, "-c", "user.name=seed", "-c", "user.email=seed@users.noreply.github.com", "commit", "-q", "-m", "seed");
    const bare = join(tmp, "bare.git").replace(/\\/g, "/");
    git(tmp, "clone", "-q", "--bare", seed, bare);
    const mirrorR = join(tmp, "mirror-r"); // the refusal runs' clone, taken before any run so HEAD has a witness
    git(tmp, "clone", "-q", bare, mirrorR);
    const headR = git(mirrorR, "rev-parse", "HEAD");
    const mirrorX = join(tmp, "mirror-x"); // a clone of ANOTHER bare repository: its origin is not the injected remote (C-G2-1)
    git(tmp, "clone", "-q", "--bare", seed, join(tmp, "other.git")); git(tmp, "clone", "-q", join(tmp, "other.git"), mirrorX);
    const remoteBefore = git(tmp, "ls-remote", bare);

    const bin = join(tmp, "bin");
    mkdirSync(bin);
    if (process.platform === "win32") {
      writeFileSync(join(bin, "gh.cmd"), '@echo off\r\n>>"%FAKE_GH_LOG%" echo %*\r\nif "%1"=="api" (\r\n  if "%FAKE_GH_VIS%"=="fail" exit /b 1\r\n  echo %FAKE_GH_VIS%\r\n)\r\nexit /b 0\r\n');
    } else {
      writeFileSync(join(bin, "gh"), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$FAKE_GH_LOG"\nif [ "$1" = api ]; then\n  [ "$FAKE_GH_VIS" = fail ] && exit 1\n  echo "$FAKE_GH_VIS"\nfi\nexit 0\n');
      chmodSync(join(bin, "gh"), 0o755);
    }
    const ghLog = join(tmp, "gh.log");
    const journal = join(tmp, "gates.log");
    const gateJs = join(tmp, "gate.mjs");
    const driver = join(tmp, "driver.mjs");
    writeFileSync(gateJs, 'import { appendFileSync } from "node:fs";\nappendFileSync(process.env.FLOW_JOURNAL, process.argv[2] + "\\n");\nprocess.exit(Number(process.argv[3]));\n');
    writeFileSync(driver, `import { main } from ${JSON.stringify(pathToFileURL(join(src, "scripts", "release-public.mjs")).href)};\nmain(process.argv.slice(2), JSON.parse(process.env.FLOW_INJECT));\n`);
    const gates = (codes: number[]): string[][] => codes.map((c, i) => [LOCAL_GATES[i]?.[0] ?? `extra ${String(i)}`, `node "${gateJs}" ${String(i)} ${String(c)}`]);
    const all = LOCAL_GATES.map((_, i) => String(i));
    const msg = (name: string, text: string): string => {
      writeFileSync(join(tmp, name), text);
      return join(tmp, name);
    };
    const run = (args: string[], o: RunOpts = {}): { status: number | null; out: string; passed: string[] } => {
      rmSync(journal, { force: true });
      git(src, "config", "user.email", o.email ?? "flow@users.noreply.github.com");
      const env: NodeJS.ProcessEnv = {};
      for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("NODE_TEST_") && k !== "MONARK_PUBLIC_MIRROR") env[k] = v;
      const pathKey = Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH"; // win32 spells it Path
      env[pathKey] = `${bin}${delimiter}${env[pathKey] ?? ""}`;
      if (o.mirror !== null) env.MONARK_PUBLIC_MIRROR = o.mirror ?? mirrorR;
      Object.assign(env, { FAKE_GH_LOG: ghLog, FAKE_GH_VIS: o.vis ?? "private", FLOW_JOURNAL: journal, FLOW_INJECT: JSON.stringify({ gates: o.gates ?? gates(all.map(() => 0)), remote: bare }) });
      if (o.dirty === true) writeFileSync(join(src, "dirty.txt"), "x\n"); // an uncommitted file in the source tree
      const r = spawnSync(process.execPath, [driver, ...args], { cwd: tmp, env, encoding: "utf8", timeout: 300_000 });
      rmSync(join(src, "dirty.txt"), { force: true });
      const passed = existsSync(journal) ? readFileSync(journal, "utf8").split(/\s+/).filter(Boolean) : [];
      return { status: r.status, out: `${r.stdout}\n${r.stderr}`, passed };
    };

    // Refusals: each before any gate (journal empty) and with the mirror clone untouched (CA-1.1, CA-1.4, CA-1.7).
    const ok = msg("ok.txt", "Bell: export the verifier and the public keyring\n");
    const refusals: [string, string[], RunOpts, string][] = [
      ["no --message", [], {}, "--message <file> is required"],
      ["empty message (M1-l)", ["--message", msg("m0.txt", "")], {}, "rule empty,"],
      ["rule a", ["--message", msg("ma.txt", `Mise ${String.fromCharCode(0xe0)} jour du site\n`)], {}, "rule a,"],
      ["rule b", ["--message", msg("mb.txt", "Close PUBLIC-CADENCE-1 in the mirror\n")], {}, "rule b,"],
      ["rule c", ["--message", msg("mc.txt", "Release model per R-25\n")], {}, "rule c,"],
      ["rule d", ["--message", msg("md.txt", "Public sync of the site\n")], {}, "rule d,"],
      ["rule e", ["--message", msg("me.txt", `Copy it from ${"F"}:${"\\"}work\n`)], {}, "rule e,"],
      ["rule f", ["--message", msg("mf.txt", `Read the ${DATA_SOURCE_FORMS[0]?.sample ?? ""} feed\n`)], {}, "rule f,"],
      ["rule g", ["--message", msg("mg.txt", "See https://example.org/x for the data\n")], {}, "rule g,"],
      ["rule q3", ["--message", msg("mq.txt", "Raise the budget of the gate\n")], {}, "rule q3,"],
      ["title bound", ["--message", msg("mt.txt", `${"x".repeat(51)}\n`)], {}, "rule title,"],
      ["no MONARK_PUBLIC_MIRROR (CA-1.4)", ["--message", ok], { mirror: null }, "MONARK_PUBLIC_MIRROR is not set"],
      ["non-noreply identity (CA-1.4, M1-m)", ["--message", ok], { email: "flow@example.org" }, "non-noreply identity"],
      ["visibility public (CA-1.7, M1-q)", ["--message", ok], { vis: "public" }, "visibility reads 'public'"],
      ["visibility unreadable (CA-1.7, M1-q)", ["--message", ok], { vis: "fail" }, "visibility reads ''"],
      ["--tag (PR-A2)", ["--message", ok, "--tag", "v0.7.0"], {}, "the local tag step is not in this tool yet"],
      ["rule d under --dry-run (FM-3.3)", ["--message", join(tmp, "md.txt"), "--dry-run"], {}, "rule d,"],
      ["dirty source tree (branch guard)", ["--message", ok], { dirty: true }, "working tree is not clean"],
      ["unexpected remote (C-G2-1)", ["--message", ok], { mirror: mirrorX }, "points at an unexpected remote"],
    ];
    for (const [label, args, o, why] of refusals) {
      const r = run(args, o);
      assert.notEqual(r.status, 0, `${label}: must refuse`);
      assert.ok(r.out.includes(why), `${label}: refused for another reason than ${JSON.stringify(why)}:\n${r.out.slice(-800)}`);
      assert.deepEqual(r.passed, [], `${label}: no gate may run before the refusal`);
      for (const [m, h] of new Map([[mirrorR, headR], [mirrorX, headR]])) assert.ok(git(m, "rev-parse", "HEAD") === h && git(m, "status", "--porcelain") === "", `${label}: ${m} is untouched`);
      assert.deepEqual(readdirSync(tmp).filter((n) => /-stage-|-message-/.test(n)), [], `${label}: nothing left beside the clones`);
    }

    // Red export:check, followed by one more gate: the tool stops there, before the export (CA-1.3, M1-o).
    assert.equal(LOCAL_GATES.at(-1)?.[1], "npm run export:check", "export:check is the last gate, just before the export");
    const red = run(["--message", ok], { gates: gates([...all.map((_, i) => (i === all.length - 1 ? 1 : 0)), 0]) });
    assert.notEqual(red.status, 0, "a red export:check stops the tool");
    assert.deepEqual(red.passed, all, "the gates up to export:check ran, none after it");
    assert.equal(git(mirrorR, "rev-parse", "HEAD"), headR, "red gate: the mirror clone HEAD is unchanged");
    assert.equal(git(mirrorR, "status", "--porcelain"), "", "red gate: nothing was written into the mirror clone");
    assert.deepEqual(readdirSync(tmp).filter((n) => n.includes("-stage-")), [], "red gate: no export was staged");

    // Accepted: the dry-run clones the absent mirror and commits nothing; the real run commits once, byte for byte, and
    // prints the push instead of running it (CA-1.1, CA-1.2, CA-1.3).
    const mirrorA = join(tmp, "mirror-a");
    const text = "Bell: export the verifier and the public keyring\n\nThe  body keeps its bytes.  \n\n\nEnd.\n";
    const accept = msg("accept.txt", text);
    const dry = run(["--message", accept, "--dry-run"], { mirror: mirrorA });
    assert.equal(dry.status, 0, `dry-run:\n${dry.out.slice(-1500)}`);
    const base = git(mirrorA, "rev-parse", "HEAD");
    assert.equal(base, git(bare, "rev-parse", "main"), "the dry-run committed nothing");
    const real = run(["--message", accept], { mirror: mirrorA });
    assert.equal(real.status, 0, `real run:\n${real.out.slice(-1500)}`);
    assert.deepEqual(real.passed, all, "every gate ran, in the pinned order, before the export");
    assert.equal(git(mirrorA, "rev-parse", "HEAD~1"), base, "exactly one commit on top of the remote main");
    const raw = execFileSync("git", ["cat-file", "commit", "HEAD"], { cwd: mirrorA });
    assert.ok(raw.subarray(raw.indexOf("\n\n") + 2).equals(Buffer.from(text, "utf8")), "the commit message is the file, byte for byte");
    assert.equal(git(mirrorA, "log", "-1", "--format=%ae"), "flow@users.noreply.github.com", "committed under the noreply identity");
    assert.ok(existsSync(join(mirrorA, "apps", "bell", "scripts", "bell-verify.mjs")), "the commit carries the export");
    assert.ok(!existsSync(join(mirrorA, "scripts", "public-text-deny.mjs")), "the vendor lists stay out of the mirror (CA-1.5)");
    assert.equal(git(tmp, "ls-remote", bare), remoteBefore, "nothing was pushed (CA-1.2, M1-k)");
    assert.deepEqual(readdirSync(tmp).filter((n) => /-stage-|-message-/.test(n)), [], "no stage and no message copy is left beside the clone");
    assert.ok(real.out.includes("NOT pushed") && real.out.includes("push origin HEAD:main"), "the push is printed, not run");
    const calls = new Set(readFileSync(ghLog, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
    assert.deepEqual([...calls].sort(), ["--version", "api repos/KraidleAI/monark-governance --jq .visibility", "auth status"], "gh saw reads only (CA-1.2)");
  } finally {
    try { rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }); }
    catch (e) { console.warn(`release-public flow test: cleanup left ${tmp} (${(e as NodeJS.ErrnoException).code ?? String(e)})`); }
  }
});
