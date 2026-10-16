/**
 * Root test of the local witness tool of the sentinel (scripts/sentinel-witness.mjs) and of the witness a real daily line
 * carries. `print` computes, from git trees, the closure witness the sentinel writes when it runs from them (the sentinel's
 * own witness module, apps/sentinel/src/witness.ts); `compare` reads the served timeline once and judges the first line
 * written after the last day served before a deploy. No network: the GET of `compare` is injected and serves the bytes of
 * the committed fixture apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl, a byte prefix of the served
 * timeline; the real run.ts runs under a fetch stub (model: the bench of test/probe-narabi.test.ts, copied here). The
 * git repositories a test builds run git without the caller's GIT_* variables. Each test loads what it judges inside its
 * body: a missing export reds by assertion, not by import.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { lineHashOf } from "../apps/sentinel/src/timeline.ts";
import type { TimelineLine } from "../apps/sentinel/src/timeline.ts";

const ROOT = join(import.meta.dirname, "..");
const ENTRY = "apps/sentinel/src/run.ts";
const RUN_TS = join(ROOT, ...ENTRY.split("/"));
const FIXTURE = join(ROOT, "apps", "sentinel", "test", "fixtures", "narabi-timeline-2026-09-19.jsonl");
type Tool = Partial<typeof import("../scripts/sentinel-witness.mjs")>;
type Witness = Partial<typeof import("../apps/sentinel/src/witness.ts")>;
const loadTool = async (): Promise<Tool> => await import("../scripts/sentinel-witness.mjs").catch(() => ({}));
const loadWitness = async (): Promise<Witness> => await import("../apps/sentinel/src/witness.ts").catch(() => ({}));
const attempt = <T>(f: () => T): T | string => {
  try { return f(); } catch (e) { return `threw: ${e instanceof Error ? e.message : String(e)}`; }
};
const fixtureText = (): string => readFileSync(FIXTURE, "utf8");
const fixtureLines = (): TimelineLine[] => fixtureText().split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as TimelineLine);
const servedGet = (text: string, asked: string[]) => (url: string): Promise<string> => { asked.push(url); return Promise.resolve(text); };

let scratch: string | null = null;
const scratchDir = (): string => (scratch ??= mkdtempSync(join(tmpdir(), "sentinel-witness-cli-")));
after(() => { if (scratch !== null) rmSync(scratch, { recursive: true, force: true }); });
/** git -C <repo> for the repositories these tests build: no inherited GIT_* variable, no system config, no line-ending rewrite. */
const gitIn = (repo: string) => {
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1" };
  return (...args: string[]): string => {
    const r = spawnSync("git", ["-C", repo, "-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { env, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
};

// killer: scripts/sentinel-witness.mjs:21 CONST "apps/sentinel/src/run.ts" -> "apps/sentinel/src/windows.ts"
test("sentinel_witness_cli_prints_closure_digest", async () => {
  const tool = await loadTool(), w = await loadWitness();
  assert.equal(typeof tool.runPrint, "function", "scripts/sentinel-witness.mjs exports runPrint");
  assert.ok(typeof w.closureWitness === "function" && typeof w.executionClosure === "function" && typeof w.fsReader === "function", "apps/sentinel/src/witness.ts exports closureWitness, executionClosure and fsReader");
  const { runPrint } = tool as typeof import("../scripts/sentinel-witness.mjs"), { closureWitness, executionClosure, fsReader } = w as typeof import("../apps/sentinel/src/witness.ts");
  // The closure of this tree, its bytes as on disk, committed alone in a fresh repository, which print reads through git. A
  // fresh repository rather than this clone's HEAD: the test holds on a checkout with uncommitted edits, and an edit of a
  // closure file is judged by what the witness computes, not by the gap between HEAD and the disk.
  const onDisk = closureWitness(fsReader(ROOT), ENTRY);
  const repo = mkdtempSync(join(scratchDir(), "closure-"));
  for (const p of executionClosure(fsReader(ROOT), ENTRY)) { mkdirSync(dirname(join(repo, p)), { recursive: true }); copyFileSync(join(ROOT, p), join(repo, p)); }
  const git = gitIn(repo);
  git("init", "-q");
  git("add", "--", ".");
  git("commit", "-q", "-m", "the closure");
  const printed = attempt(() => runPrint({ repo, tree: "HEAD" }));
  assert.ok(typeof printed === "object", `print reads the committed closure: ${typeof printed === "string" ? printed : ""}`);
  assert.equal(printed.witness, onDisk, "print on the committed closure gives the witness the sentinel computes on disk");
  assert.equal(printed.tree, git("rev-parse", "HEAD"), "print names the commit it read");
  assert.ok(printed.files.includes(ENTRY) && printed.files.includes("apps/harness/src/calibration.ts"), "print lists the closure it hashed");
  const src = join(ROOT, "apps", "sentinel", "src"), h = createHash("sha256");
  for (const f of readdirSync(src).filter((f) => f.endsWith(".ts")).sort()) h.update(readFileSync(join(src, f)));
  assert.notEqual(printed.witness, h.digest("hex"), "print is not the digest of the top-level sentinel sources alone");
  assert.equal(printed.overlay, null, "no overlay asked, none applied");
});

// killer: scripts/sentinel-witness.mjs:53 CONST "parseOverlay(overlay)" -> "null"
test("sentinel_witness_cli_composes_overlay_tree", async () => {
  const tool = await loadTool(), w = await loadWitness();
  assert.equal(typeof tool.runPrint, "function", "scripts/sentinel-witness.mjs exports runPrint");
  assert.ok(typeof w.closureWitness === "function" && typeof w.fsReader === "function", "apps/sentinel/src/witness.ts exports closureWitness and fsReader");
  const { runPrint } = tool as typeof import("../scripts/sentinel-witness.mjs"), { closureWitness, fsReader } = w as typeof import("../apps/sentinel/src/witness.ts");
  const repo = mkdtempSync(join(scratchDir(), "repo-")), composed = mkdtempSync(join(scratchDir(), "composed-"));
  const git = gitIn(repo);
  const put = (dir: string, files: Record<string, string>): void => {
    for (const [rel, text] of Object.entries(files)) { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), text); }
  };
  const Y = "apps/sentinel/src/y.ts", P = "packages/p/src/index.ts";
  const files0 = {
    [ENTRY]: 'import { y } from "./y.ts";\nimport { p } from "@monark/p";\nexport const r = [y, p];\n',
    [Y]: 'export const y = "v0";\n',
    "packages/p/package.json": '{ "name": "@monark/p", "exports": { ".": "./src/index.ts" } }\n',
    [P]: 'export const p = "v0";\n',
  };
  git("init", "-q");
  put(repo, files0);
  git("add", "--", ".");
  git("commit", "-q", "-m", "zero");
  put(repo, { [Y]: 'export const y = "vA";\n' });
  git("commit", "-q", "-a", "-m", "the sentinel changes");
  const A = git("rev-parse", "HEAD");
  put(repo, { [Y]: files0[Y], [P]: 'export const p = "vB";\n' });
  git("commit", "-q", "-a", "-m", "a package changes, the sentinel goes back");
  const B = git("rev-parse", "HEAD");
  put(composed, { ...files0, [Y]: 'export const y = "vA";\n', [P]: 'export const p = "vB";\n' });
  const expected = closureWitness(fsReader(composed), ENTRY);
  // A decoy GIT_DIR in the caller's environment: the tool's git must not read it (a hook sets GIT_DIR or GIT_INDEX_FILE).
  const decoy = join(scratchDir(), "decoy-git-dir"), prev = process.env.GIT_DIR;
  process.env.GIT_DIR = decoy;
  let printed: ReturnType<typeof runPrint> | string;
  try { printed = attempt(() => runPrint({ repo, tree: B, overlay: `apps/sentinel=${A}` })); } finally {
    if (prev === undefined) delete process.env.GIT_DIR; else process.env.GIT_DIR = prev;
  }
  assert.equal(existsSync(decoy), false, "nothing was written at the caller's GIT_DIR");
  assert.ok(typeof printed === "object", `print reads the two trees with a decoy GIT_DIR set: ${typeof printed === "string" ? printed : ""}`);
  assert.equal(printed.witness, expected, "print of B with apps/sentinel from A is the witness of the tree composed by hand");
  assert.deepEqual([printed.tree, printed.overlay], [B, { prefix: "apps/sentinel", sha: A }], "print names the two commits it read");
  assert.notEqual(expected, runPrint({ repo, tree: A }).witness, "the composition differs from A alone");
  assert.notEqual(expected, runPrint({ repo, tree: B }).witness, "the composition differs from B alone");
});

// killer: scripts/sentinel-witness.mjs:112 CONST "next.sentinel_sha === expected" -> "true"
test("sentinel_witness_cli_compares_served_line", async () => {
  const tool = await loadTool();
  assert.ok(typeof tool.runCompare === "function" && typeof tool.SERVED_TIMELINE === "string", "scripts/sentinel-witness.mjs exports runCompare and the served timeline URL");
  const { runCompare, SERVED_TIMELINE } = tool as typeof import("../scripts/sentinel-witness.mjs");
  const [l17, l18] = fixtureLines();
  assert.ok(l17 !== undefined && l18 !== undefined && l17.sentinel_sha !== l18.sentinel_sha, "the fixture carries two witnesses on its first two days");
  const asked: string[] = [];
  const confirmed = await runCompare({ expected: l18.sentinel_sha, afterDay: l17.day, get: servedGet(fixtureText(), asked) });
  assert.deepEqual([confirmed.status, confirmed.exit, confirmed.day], ["confirmed", 0, l18.day], "the first line after the deploy day carries the expected witness: confirmed, exit 0");
  const mismatch = await runCompare({ expected: l17.sentinel_sha, afterDay: l17.day, get: servedGet(fixtureText(), asked) });
  assert.deepEqual([mismatch.status, mismatch.exit, mismatch.served], ["mismatch", 1, l18.sentinel_sha], "another witness on that line: mismatch, exit 1, the served one named");
  assert.deepEqual(asked, [SERVED_TIMELINE, SERVED_TIMELINE], "one GET of the served timeline per comparison");
});

// killer: scripts/sentinel-witness.mjs:110 CONST "lines.find((l) => l.day > afterDay)" -> "lines.findLast((l) => l.day <= afterDay)"
test("sentinel_witness_cli_ignores_deploy_day_line", async () => {
  const tool = await loadTool();
  assert.equal(typeof tool.runCompare, "function", "scripts/sentinel-witness.mjs exports runCompare");
  const { runCompare } = tool as typeof import("../scripts/sentinel-witness.mjs");
  const lines = fixtureLines(), afterDay = lines[1]?.day ?? "", next = lines[2];
  assert.ok(next !== undefined && next.day > afterDay, "the fixture has a line after its second day");
  // The lines up to the deploy day carry the witness of before (sentinel_sha is outside the hashed fields of a line).
  const before = lines.map((l) => (l.day <= afterDay ? { ...l, sentinel_sha: "f".repeat(64) } : l));
  for (const l of before) assert.equal(lineHashOf(l), l.line_hash, `the line of ${l.day} still hashes to its line_hash`);
  const text = before.map((l) => JSON.stringify(l)).join("\n") + "\n";
  const r = await runCompare({ expected: next.sentinel_sha, afterDay, get: servedGet(text, []) });
  assert.deepEqual([r.status, r.exit, r.day], ["confirmed", 0, next.day], "the lines written up to the deploy day are not compared");
});

// killer: scripts/sentinel-witness.mjs:111 CONST "status: \"waiting\", exit: 2" -> "status: \"confirmed\", exit: 0"
test("sentinel_witness_cli_waits_without_a_post_deploy_line", async () => {
  const tool = await loadTool();
  assert.equal(typeof tool.runCompare, "function", "scripts/sentinel-witness.mjs exports runCompare");
  const { runCompare } = tool as typeof import("../scripts/sentinel-witness.mjs");
  const lines = fixtureLines(), last = lines[lines.length - 1];
  assert.ok(last !== undefined, "the fixture has lines");
  const r = await runCompare({ expected: last.sentinel_sha, afterDay: last.day, get: servedGet(fixtureText(), []) });
  assert.deepEqual([r.status, r.exit, r.day], ["waiting", 2, null], "no line after the deploy day yet: waiting, exit 2, never confirmed");
});

// killer: docs/RUNBOOK-harness.md:259 SDL "Sentinel witness (deployment and next day)" -> ""
test("runbook_harness_update_runs_the_sentinel_witness_step", async () => {
  const tool = await loadTool();
  assert.ok(typeof tool.parseArgs === "function" && tool.COMMANDS !== undefined, "scripts/sentinel-witness.mjs exports its argument parser and its commands");
  const { parseArgs, COMMANDS } = tool as typeof import("../scripts/sentinel-witness.mjs");
  const text = readFileSync(join(ROOT, "docs", "RUNBOOK-harness.md"), "utf8").replace(/\r\n/g, "\n");
  const TITLE = "Sentinel witness (deployment and next day)";
  const update = /\n- Update:[\s\S]*?(?=\n- |\n\n)/.exec(text)?.[0] ?? "";
  assert.ok(update.includes(`*${TITLE}*`), "the Update step of Operations names the sentinel witness section");
  const at = text.indexOf(`\n## ${TITLE}\n`);
  assert.ok(at >= 0, "the harness runbook carries the sentinel witness section");
  const next = text.indexOf("\n## ", at + 1), section = text.slice(at + 1, next < 0 ? undefined : next);
  const commands = [...section.matchAll(/`node scripts\/sentinel-witness\.mjs ([^`]+)`/g)].map((m) => (m[1] ?? "").replace(/[[\]]/g, "").split(/\s+/).filter(Boolean));
  assert.deepEqual(commands.map((c) => c[0]), ["print", "compare"], "the section runs print, then compare");
  for (const argv of commands) {
    const parsed = attempt(() => parseArgs(argv));
    assert.ok(typeof parsed === "object", `the tool accepts the command of the section ${argv.join(" ")}: ${typeof parsed === "string" ? parsed : ""}`);
    assert.deepEqual(COMMANDS[parsed.command].required.filter((k) => !Object.hasOwn(parsed.flags, k)), [], "every required flag is written");
  }
  assert.ok(section.includes("`systemctl is-active monark-sentinel.service` reads `inactive`") && section.includes("outside 00:30-10:05 UTC") && section.includes("after 10:05 UTC"), "the section keeps the window and the next-day hour");
});

// The bench: the REAL run.ts writes the line of 2026-09-19 from a state seeded with the fixture's first two lines, its
// fetch replaced by a stub that answers from the fixture (copied from test/probe-narabi.test.ts, its own zone).
const STUB_SRC = `
import { readFileSync } from "node:fs";
const lines = readFileSync(process.env.STUB_FIXTURE, "utf8").replace(/\\r\\n/g, "\\n").split("\\n").filter((x) => x.trim()).map((l) => JSON.parse(l));
const byDay = new Map(lines.map((l) => [l.day, l]));
const W = ["2026-09-18", "2026-09-19"].map((d) => byDay.get(d)).filter(Boolean);
const midnight = (d) => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
const w18 = byDay.get("2026-09-18"), w19 = byDay.get("2026-09-19");
const anchors = [[w18.from_block, midnight("2026-09-18")], [w19.from_block, midnight("2026-09-19")], [w19.to_block + 1, midnight("2026-09-20")]];
function tsOf(b) {
  if (b <= anchors[0][0]) { const [b0, t0] = anchors[0], [b1, t1] = anchors[1]; return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  for (let i = 0; i < anchors.length - 1; i++) { const [b0, t0] = anchors[i], [b1, t1] = anchors[i + 1]; if (b <= b1) return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  const [b0, t0] = anchors[anchors.length - 2], [b1, t1] = anchors[anchors.length - 1]; return Math.round(t1 + (b - b1) * (t1 - t0) / (b1 - b0));
}
const hex = (n) => "0x" + BigInt(n).toString(16);
const ZERO = "0x" + "0".repeat(64), ONE = "0x" + "1".repeat(64);
const byFrom = new Map(W.map((w) => [w.from_block, w]));
const supply = new Map();
for (const w of W) { supply.set(w.to_block, BigInt(w.supply_close)); supply.set(w.from_block - 1, BigInt(w.s_open)); }
globalThis.fetch = (url, init) => {
  const { method, params } = JSON.parse(init.body);
  const ok = (result) => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }), text: () => Promise.resolve(JSON.stringify({ jsonrpc: "2.0", id: 1, result })) });
  const fail = (status) => Promise.resolve({ ok: false, status, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
  if (method === "eth_getBlockByNumber") {
    const tag = params[0];
    if (tag === "finalized") return ok({ number: hex(Number(process.env.STUB_FIN_BLOCK)), timestamp: hex(Number(process.env.STUB_FIN_TS)) });
    const b = parseInt(tag, 16); return ok({ number: hex(b), timestamp: hex(tsOf(b)) });
  }
  if (method === "eth_getLogs") {
    const from = parseInt(params[0].fromBlock, 16); const w = byFrom.get(from); if (!w) return ok([]);
    return ok([{ topics: [ZERO, ONE, ZERO], data: hex(BigInt(w.burns)) }, { topics: [ZERO, ZERO, ONE], data: hex(BigInt(w.mints)) }]);
  }
  if (method === "eth_call") {
    const block = parseInt(params[1], 16);
    const s = supply.get(block); if (s === undefined) return fail(500); return ok(hex(s));
  }
  return fail(400);
};
`;

// killer: apps/sentinel/src/run.ts:350 CONST "sentinel_sha: sentinelSha(srcDir)" -> "sentinel_sha: \"0\".repeat(64)"
test("sentinel_line_carries_closure_witness", async () => {
  const w = await loadWitness();
  assert.ok(typeof w.closureWitness === "function" && typeof w.fsReader === "function", "apps/sentinel/src/witness.ts exports closureWitness and fsReader");
  const { closureWitness, fsReader } = w as typeof import("../apps/sentinel/src/witness.ts");
  const stub = join(scratchDir(), "stub-fetch.mjs");
  writeFileSync(stub, STUB_SRC);
  const raw = fixtureText().split("\n").filter((x) => x.trim() !== "");
  const state = mkdtempSync(join(scratchDir(), "state-"));
  writeFileSync(join(state, "timeline.jsonl"), raw.slice(0, 2).join("\n") + "\n");
  const third = JSON.parse(raw[2] ?? "{}") as { to_block: number; day: string };
  // Every environment key run.ts reads is removed from the child's environment: a key or a cycle set in the caller's shell
  // never opens the paid leg, and the run reads only the stub.
  const keys = [...new Set([...readFileSync(RUN_TS, "utf8").matchAll(/process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1] ?? ""))];
  assert.ok(keys.length >= 5, "run.ts reads its environment keys by name");
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !keys.includes(k) && !/^(SMTP_|ALERT_)/.test(k)) env[k] = v;
  env.STUB_FIXTURE = FIXTURE;
  env.STUB_FIN_BLOCK = String(third.to_block + 5);
  env.STUB_FIN_TS = String(Math.floor(Date.parse("2026-09-20T00:00:00Z") / 1000) + 3600);
  const r = spawnSync(process.execPath, ["--import", pathToFileURL(stub).href, RUN_TS, "--state", state], { cwd: ROOT, env, encoding: "utf8", timeout: 120_000 });
  assert.equal(r.status, 0, `the real sentinel writes the next day: ${r.stderr}`);
  const written = readFileSync(join(state, "timeline.jsonl"), "utf8").split("\n").filter((x) => x.trim() !== "").map((l) => JSON.parse(l) as TimelineLine);
  assert.equal(written.length, 3, "one line written");
  const line = written[2];
  assert.equal(line?.day, third.day, "the line of the next day");
  assert.equal(line?.sentinel_sha, closureWitness(fsReader(ROOT), ENTRY), "the line the real run.ts writes carries the closure witness of the tree it runs from");
});
