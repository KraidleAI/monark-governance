/**
 * Root test of the capture part of the release preflight (SYNC-CHECK-MODE-1): scripts/release-public.mjs runs the --check of the
 * five site capture tools before any gh read (capturePreflight, through a runner; captureGate aborts on a problem), and
 * scripts/export-public.mjs, which stays without network and without child process, judges the results (captureCheckProblems).
 * The runners here are injected, except the default runner, called on the one tool that reads no network
 * (sync-ukemi-course.mjs) and on a temporary root whose tool dies before its exit; the four network checks never run in a
 * test. captureGate exits the process by RELEASE ABORTED, so it
 * runs in a PILOT process whose status and stderr are read (model: test/release-public-flow.test.ts). The storefront runbook's
 * step before the export names the same five commands (a procedure guard, the export itself does not refuse without them).
 * Each test loads what it judges inside its body: a missing export reds by assertion, not by import.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = join(import.meta.dirname, "..");
const FIVE = ["sync-harness-served.mjs", "sync-ukemi-served.mjs", "sync-ukemi-course.mjs", "sync-narabi-capture.mjs", "sync-narabi-served.mjs"];
type Release = Partial<typeof import("../scripts/release-public.mjs")>;
type Exporter = Partial<typeof import("../scripts/export-public.mjs")>;
type Run = { tool: string; exit: number | null; stderr: string };
const zeros = (): Run[] => FIVE.map((tool) => ({ tool, exit: 0, stderr: "" }));

// killer: scripts/release-public.mjs:93 CONST "return captureCheckProblems(results);" -> "return [];"
test("export_preflight_refuses_on_stale_capture", async () => {
  const rel: Release = await import("../scripts/release-public.mjs"), exp: Exporter = await import("../scripts/export-public.mjs");
  assert.ok(typeof rel.capturePreflight === "function" && typeof exp.captureCheckProblems === "function" && Array.isArray(rel.CAPTURE_CHECKS), "release-public.mjs exports capturePreflight, export-public.mjs captureCheckProblems");
  const { capturePreflight, CAPTURE_CHECKS } = rel as typeof import("../scripts/release-public.mjs"), { captureCheckProblems } = exp as typeof import("../scripts/export-public.mjs");
  const stale = "sync-narabi-capture --check FAILED — the capture (T=1) is 1 step(s) behind what is served now (T=2), more than the bound of 0: re-capture before any send.";
  const results = zeros().map((r) => (r.tool === "sync-narabi-capture.mjs" ? { ...r, exit: 1, stderr: `\n${stale}\n` } : r));
  const asked: { root: string; tool: string }[] = [];
  const problems = capturePreflight({ root: ROOT, runCheck: (o) => { asked.push(o); return results.find((r) => r.tool === o.tool) as Run; } });
  assert.deepEqual(asked, CAPTURE_CHECKS.map((tool) => ({ root: ROOT, tool })), "each tool of the closed list is run once, under the root given");
  assert.deepEqual(problems, [`scripts/sync-narabi-capture.mjs --check exited 1: ${stale}`], "a stale capture is a problem that names its tool and the line the --check printed");
  assert.deepEqual(captureCheckProblems(results), problems, "the judgment is export-public's own (no network, no process there)");
  assert.deepEqual(capturePreflight({ root: ROOT, runCheck: (o) => zeros().find((r) => r.tool === o.tool) as Run }), [], "five checks at 0: no problem");
  // Reached: capturePreflight returns its problems, it never aborts the process.
});

// killer: scripts/release-public.mjs:90 CONST "exit: null" -> "exit: 0"
test("export_preflight_fails_closed_when_host_unreachable", async () => {
  const rel: Release = await import("../scripts/release-public.mjs"), exp: Exporter = await import("../scripts/export-public.mjs");
  assert.ok(typeof rel.capturePreflight === "function" && typeof exp.captureCheckProblems === "function", "the preflight and its judgment are exported");
  const { capturePreflight } = rel as typeof import("../scripts/release-public.mjs"), { captureCheckProblems } = exp as typeof import("../scripts/export-public.mjs");
  const unreachable = capturePreflight({ root: ROOT, runCheck: ({ tool }) => { if (tool === "sync-harness-served.mjs") throw new Error("spawn ENOENT"); return zeros().find((r) => r.tool === tool) as Run; } });
  assert.deepEqual(unreachable, ["scripts/sync-harness-served.mjs --check did not run to an exit: spawn ENOENT"], "a runner that cannot start the child is a problem, never a pass");
  const two = zeros().map((r) => (r.tool === "sync-ukemi-served.mjs" ? { ...r, exit: 2 } : r));
  assert.deepEqual(capturePreflight({ root: ROOT, runCheck: ({ tool }) => two.find((r) => r.tool === tool) as Run }), ["scripts/sync-ukemi-served.mjs --check exited 2"], "an exit 2 is a problem");
  const killed = zeros().map((r) => (r.tool === "sync-narabi-served.mjs" ? { ...r, exit: null, stderr: "killed" } : r));
  assert.deepEqual(captureCheckProblems(killed), ["scripts/sync-narabi-served.mjs --check did not run to an exit: killed"], "no exit reached (a killed child) is a problem");
  assert.deepEqual(captureCheckProblems(zeros().slice(1)), ["scripts/sync-harness-served.mjs --check has no result"], "a missing tool is a problem");
  assert.deepEqual(captureCheckProblems([...zeros(), { tool: "sync-other.mjs", exit: 0, stderr: "" }, { tool: "sync-ukemi-course.mjs", exit: 0, stderr: "" }, { tool: 3 }]), ["sync-other.mjs is not a capture tool", "sync-ukemi-course.mjs has more than one result", 'a malformed capture check result: {"tool":3}'], "an unknown, a doubled and a malformed result are problems");
  assert.deepEqual(captureCheckProblems("none"), ["the capture check results are not a list"], "not a list: a problem");
  // The default runner on a child that never reaches an exit: a tool that kills itself by a signal (POSIX); win32 maps that
  // self-kill to exit 1 (test/dojo-publish-e2e.test.ts), so there the tool outgrows spawnSync's output bound and spawnSync kills it.
  // killer: scripts/release-public.mjs:80 CONST "? r.status : null" -> "? r.status : 0"
  const { defaultRunCheck } = rel as typeof import("../scripts/release-public.mjs");
  const tmp = mkdtempSync(join(tmpdir(), "capture-killed-"));
  try {
    mkdirSync(join(tmp, "scripts"));
    writeFileSync(join(tmp, "scripts", "sync-ukemi-course.mjs"), 'if (process.platform === "win32") process.stdout.write("x".repeat(2 * 1024 * 1024));\nelse process.kill(process.pid, "SIGKILL");\n');
    const r = defaultRunCheck({ root: tmp, tool: "sync-ukemi-course.mjs" });
    assert.equal(r.exit, null, `a check killed before its exit reaches no exit status:\n${r.stderr}`);
    const problems = captureCheckProblems(zeros().map((z) => (z.tool === r.tool ? r : z)));
    assert.ok(problems.length === 1 && /^scripts\/sync-ukemi-course\.mjs --check did not run to an exit/.test(problems[0] ?? ""), `the default runner's killed child is a problem, never a pass: ${JSON.stringify(problems)}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// killer: scripts/release-public.mjs:78 CONST ", \"--check\"]" -> "]"
test("release_preflight_runs_the_five_real_checks", async () => {
  const rel: Release = await import("../scripts/release-public.mjs");
  assert.ok(typeof rel.defaultRunCheck === "function" && Array.isArray(rel.CAPTURE_CHECKS), "release-public.mjs exports its default runner and the closed list");
  const { defaultRunCheck, CAPTURE_CHECKS } = rel as typeof import("../scripts/release-public.mjs");
  assert.deepEqual([...CAPTURE_CHECKS], FIVE, "the closed list of the five capture tools");
  for (const tool of CAPTURE_CHECKS) assert.ok(existsSync(join(ROOT, "scripts", tool)), `scripts/${tool} exists`);
  // The one check without network (the manifest entry of the course file), run for real by the default runner.
  const r = defaultRunCheck({ root: ROOT, tool: "sync-ukemi-course.mjs" });
  assert.deepEqual(r.args, ["scripts/sync-ukemi-course.mjs", "--check"], "the child is the tool in --check mode (never its writing mode)");
  assert.equal(r.exit, 0, `the course capture of this tree passes its --check:\n${r.stderr}`);
  assert.equal(r.tool, "sync-ukemi-course.mjs");
});

// killer: scripts/release-public.mjs:99 CONST ".replace(/\\.$/, \"\")" -> ""
// killer: scripts/release-public.mjs:99 CONST "if (problems.length > 0) " -> "if (false) "
test("release_preflight_refuses_by_exit_status", async () => {
  const rel: Release = await import("../scripts/release-public.mjs");
  assert.equal(typeof rel.captureGate, "function", "release-public.mjs exports captureGate");
  const tmp = mkdtempSync(join(tmpdir(), "capture-gate-"));
  try {
    const pilot = join(tmp, "pilot.mjs");
    writeFileSync(pilot, `import { captureGate, CAPTURE_CHECKS } from ${JSON.stringify(pathToFileURL(join(ROOT, "scripts", "release-public.mjs")).href)};
const fail = process.env.GATE_FAIL;
captureGate({ root: process.cwd(), runCheck: ({ tool }) => ({ tool, exit: tool === fail ? 1 : 0, stderr: tool === fail ? "the capture is stale." : "" }) });
console.log("pilot: passed " + CAPTURE_CHECKS.length);
`);
    const run = (fail: string): { status: number | null; out: string; err: string } => {
      const env: NodeJS.ProcessEnv = {};
      for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("NODE_TEST_")) env[k] = v;
      env.GATE_FAIL = fail;
      const p = spawnSync(process.execPath, [pilot], { cwd: tmp, env, encoding: "utf8", timeout: 60_000 });
      return { status: p.status, out: p.stdout, err: p.stderr };
    };
    const red = run("sync-ukemi-served.mjs");
    assert.equal(red.status, 1, `one check at 1: the gate exits 1:\n${red.err}`);
    assert.match(red.err, /RELEASE ABORTED: a site capture does not say what its source serves now: scripts\/sync-ukemi-served\.mjs --check exited 1: the capture is stale\. Re-run the sync/, "the RELEASE ABORTED line names the tool and its line");
    assert.ok(!red.err.includes(".. Re-run"), `a problem that ends with a period is not followed by a second one:\n${red.err}`);
    assert.ok(!red.out.includes("pilot: passed"), "nothing runs after the refusal");
    const green = run("");
    assert.equal(green.status, 0, `five checks at 0: the gate lets the release go on:\n${green.err}`);
    assert.ok(green.out.includes("pilot: passed 5") && !green.err.includes("RELEASE ABORTED"), "passed, no abort");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// killer: docs/RUNBOOK-vitrine.md:10 CONST "`node scripts/sync-narabi-capture.mjs --check`, " -> ""
test("runbook_vitrine_export_step_runs_the_five_checks", async () => {
  const rel: Release = await import("../scripts/release-public.mjs");
  assert.ok(Array.isArray(rel.CAPTURE_CHECKS), "release-public.mjs exports CAPTURE_CHECKS");
  const text = readFileSync(join(ROOT, "docs", "RUNBOOK-vitrine.md"), "utf8").replace(/\r\n/g, "\n");
  const from = text.indexOf("\n## Proc\u00e9dure"), to = text.indexOf("\n## ", from + 1);
  const procedure = text.slice(from, to), exported = procedure.indexOf("`node scripts/export-public.mjs --out ");
  assert.ok(from >= 0 && exported > 0, "the procedure carries the export step");
  const step = procedure.slice(procedure.lastIndexOf("\n1. ", exported), exported);
  assert.ok(step.startsWith("\n1. "), "the export is in step 1");
  for (const tool of rel.CAPTURE_CHECKS ?? []) assert.ok(step.includes(`\`node scripts/${tool} --check\``), `the step before the export runs scripts/${tool} --check`);
  assert.equal(step.match(/`node scripts\/sync-[a-z-]+\.mjs --check`/g)?.length, 5, "five commands, no other");
});
