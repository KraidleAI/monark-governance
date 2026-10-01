/**
 * Root tests of the Dojo collect deployment (ADR-DOJO-PR-3 section 4, PR-3b-1; D-1 table l.64, D-2 TU-C and TU-2, D-3 variant A,
 * D-5, dated lines 14:13Z and 15:00Z). Governance-only: deploy/, docs/ and apps/dojo are not exported. The COMMITTED unit and timer are
 * parsed and pinned (closed directive sets), bound to the code they run (the closed argv of collect.ts, its two credentials, the
 * environment keys the tree reads, the worst course against the start timeout, the import closure of the four programs of the tree),
 * and the unit's own argv runs the REAL --tick from a tree materialized from DOJO_COLLECT_TREE_PATHS over the simulated chain of PR-2-2
 * (fetch replaced, sockets and name lookups trapped: no network), with an injected clock. The seed and the Eve are made at run time by
 * the tree's own dojo-seed.mjs and dojo-eve.mjs: no key and no real seed exist in this file. No `any`.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DRAND_RELAY_LABELS, heliusCredits } from "@monark/rpc-guard";
import { DEFAULT_TIMEOUT_MS, parseRetryAfterMs } from "../packages/rpc-guard/src/transport.ts";
import { ENV as SIM_ENV, MINT, POOL, PYTH, QUOTE_VAULT, ROWS, sim } from "../apps/dojo/test/helpers/collect-chain.ts";
import { ANCHOR_DAY, anchorBody, betaOf, dateOf } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";
import { daySeed, readInstants, seedAnchor } from "../apps/dojo/scripts/dojo-core.mjs";
import { DOJO_SEED_REFUSALS } from "../apps/dojo/scripts/dojo-seed.mjs";
import { parseArgv } from "../apps/dojo/src/collect.ts";
import { BACKOFF_MS, DOJO_METHOD_CAPS, ENV_CYCLE_FLOOR, ENV_CYCLE_ID, PUBLIC_HOST_GAP_MS, READ_RULE, TRIES } from "../apps/dojo/src/dojo-methods.ts";
import { readDayLayout, readEve } from "../apps/dojo/src/layout.ts";
import * as D from "../scripts/dojo-deploy.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
const SEED_TOOL = "apps/dojo/scripts/dojo-seed.mjs", EVE_TOOL = "apps/dojo/scripts/dojo-eve.mjs", UNLOCK_TOOL = "packages/rpc-guard/bin/rpc-guard.mjs";
const FS_TRACE = "apps/dojo/test/helpers/fs-trace.mjs"; // the preload of dojo_seed_writes_only_its_seed (DOJO-SEED-FS-TRACE-1)
const CRED_VAR = "${CREDENTIALS_DIRECTORY}", RUNBOOK = "docs/RUNBOOK-dojo.md";
/** Q-1 of the G1 journal, CONFIRMED by the dated line 14:13Z (ADR-DOJO-PR-3 D-5; ADR-DOJO-PR-2 dated line 08:28Z (6)). */
const PERSISTENT = "true";
const EXEC = `/usr/bin/env node ${D.DOJO_COLLECT_TREE_ROOT}/apps/dojo/src/collect.ts --tick --state ${D.DOJO_COLLECT_STATE} --mint-file `
  + `${D.DOJO_COLLECT_TREE_ROOT}/out/mint.txt --max-calls 24 --max-credits 40 --seed-file ${CRED_VAR}/${D.DOJO_SEED_CREDENTIAL} --anchor-file ${CRED_VAR}/${D.DOJO_ANCHOR_CREDENTIAL}`;
/** The two credentials, in order (dated line 14:13Z, Q-2 (a)): the seed, then the anchor line in force. */
const CREDS = [`${D.DOJO_SEED_CREDENTIAL}:${D.DOJO_SEED_SOURCE}`, `${D.DOJO_ANCHOR_CREDENTIAL}:${D.DOJO_ANCHOR_SOURCE}`];
const SERVICE: Readonly<Record<string, string>> = { Type: "oneshot", WorkingDirectory: D.DOJO_COLLECT_TREE_ROOT, EnvironmentFile: D.DOJO_COLLECT_ENV_FILE,
  ExecStart: EXEC, TimeoutStartSec: "1500", TasksMax: "64", User: "dojo-collect", Group: "dojo-collect", NoNewPrivileges: "true", ProtectSystem: "strict",
  ProtectHome: "true", PrivateTmp: "true", ReadWritePaths: D.DOJO_COLLECT_STATE, InaccessiblePaths: D.DOJO_SIGNING_KEY_DIR, UMask: "0027", CPUQuota: "25%", MemoryMax: "512M" };
const TIMER: Readonly<Record<string, string>> = { OnCalendar: "*-*-* *:00/5:00 UTC", AccuracySec: "1s", RandomizedDelaySec: "0", Persistent: PERSISTENT,
  Unit: basename(D.DOJO_COLLECT_UNIT) };
/** The worst course of one reading, from the code (dated line 15:00Z, C-G2-2): CALLS calls of TRIES attempts of at most DEFAULT_TIMEOUT_MS
 *  to the response head, TRIES - 1 waits of at most the Retry-After cap, and PUBLIC_HOST_GAP_MS before each public attempt (half). */
const CALLS = (2 * Object.values(DOJO_METHOD_CAPS).reduce((s, n) => s + n, 0)) / TRIES;
const WORST_S = (CALLS * TRIES * DEFAULT_TIMEOUT_MS + CALLS * (TRIES - 1) * Math.max(parseRetryAfterMs("86400", 0) ?? NaN, BACKOFF_MS)
  + (CALLS / 2) * TRIES * PUBLIC_HOST_GAP_MS) / 1000;

interface Directive { section: string; key: string; value: string }
/** systemd unit -> directives in order (comments and blank lines dropped; no line continuation, asserted). */
function unitOf(rel: string): { text: string; sections: string[]; list: Directive[] } {
  const text = read(rel), sections: string[] = [], list: Directive[] = [];
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (l === "" || l.startsWith("#") || l.startsWith(";")) continue;
    assert.ok(!l.endsWith("\\"), `no line continuation: ${l}`);
    const s = /^\[(\w+)\]$/.exec(l);
    if (s !== null) { sections.push(s[1] ?? ""); continue; }
    const kv = /^([A-Za-z]+)=(.*)$/.exec(l);
    assert.ok(kv !== null, `a Key=Value directive: ${l}`);
    list.push({ section: sections.at(-1) ?? "", key: kv[1] ?? "", value: kv[2] ?? "" });
  }
  return { text, sections, list };
}
const inSection = (list: readonly Directive[], s: string): Directive[] => list.filter((d) => d.section === s);
function closedSet(got: readonly Directive[], want: Readonly<Record<string, string>>, what: string): void {
  assert.deepEqual(got.map((d) => d.key).sort(), Object.keys(want).sort(), `${what}: the directive set is CLOSED (each once)`);
  for (const d of got) assert.equal(d.value, want[d.key], `${what}: ${d.key}=${d.value} is the pinned value`);
}
const service = (): Directive[] => inSection(unitOf(D.DOJO_COLLECT_UNIT).list, "Service");
const one = (list: readonly Directive[], key: string): string => { const v = list.filter((d) => d.key === key); assert.equal(v.length, 1, key); return v[0]?.value ?? ""; };
const loads = (): string[] => service().filter((d) => d.key === "LoadCredential").map((d) => d.value);
/** Path p is `dir` or under it (segment-aware: /var/lib/monark-dojo-collect is NOT under /var/lib/monark-dojo). */
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir}/`);
const treeCode = (): string[] => D.DOJO_COLLECT_TREE_PATHS.filter((p) => /\.(ts|mjs)$/.test(p));

// M-H4 (red here): the unit declares the publication's credential, reads its key directory, or no longer masks it (Q-G2-3).
test("dojo_collect_unit_never_loads_the_signing_key", () => {
  for (const rel of [D.DOJO_COLLECT_UNIT, D.DOJO_COLLECT_TIMER]) {
    const { text } = unitOf(rel), tokens = text.split(/[\s=:,"'`]+/).map((t) => t.replace(/^[-+~!@]+/, ""));
    assert.equal(text.includes(D.DOJO_SIGNING_CREDENTIAL), false, `${rel} never names the signing credential, not even in a comment`);
    assert.deepEqual(tokens.filter((t) => under(t, D.DOJO_SIGNING_KEY_DIR)), rel === D.DOJO_COLLECT_UNIT ? [D.DOJO_SIGNING_KEY_DIR] : [], `${rel}: the key directory, only to mask it`);
    assert.deepEqual(tokens.filter((t) => under(t, D.DOJO_PUBLISH_STATE)), [], `${rel} names nothing under ${D.DOJO_PUBLISH_STATE}`);
  }
  assert.equal(one(service(), "InaccessiblePaths"), D.DOJO_SIGNING_KEY_DIR, "the key directory is inaccessible to the unit (no '-': it must exist)");
  const creds = service().filter((d) => /Credential/.test(d.key)).map((d) => `${d.key}=${d.value}`);
  assert.deepEqual(creds, CREDS.map((c) => `LoadCredential=${c}`), "two credentials: the seed, then the anchor");
  for (const src of [D.DOJO_SEED_SOURCE, D.DOJO_ANCHOR_SOURCE]) assert.ok(!under(src, D.DOJO_SIGNING_KEY_DIR), `${src} lies outside the key directory`);
  // In the code the unit runs, the only credential read by name is the seed (collect.ts: resolve(cred, "dojo-seed")); the anchor comes by argv.
  const readers = treeCode().filter((p) => read(p).includes("CREDENTIALS_DIRECTORY"));
  assert.deepEqual(readers, ["apps/dojo/src/collect.ts"], "one module of the tree reads the credentials directory");
  assert.ok(read("apps/dojo/src/collect.ts").includes(`resolve(cred, "${D.DOJO_SEED_CREDENTIAL}")`), "...and only the seed's name");
  assert.deepEqual(treeCode().filter((p) => read(p).includes(D.DOJO_SIGNING_CREDENTIAL)), [], "no module of the tree names the signing credential");
});

// M-H6, M-H9 (red here): a writable path covering the publication's state, public/ or a credential source; an optional EnvironmentFile.
test("dojo_collect_unit_least_privilege_guarded_network", () => {
  const { sections, list } = unitOf(D.DOJO_COLLECT_UNIT);
  assert.deepEqual(sections, ["Unit", "Service"], "no [Install]: the timer starts the unit");
  closedSet(inSection(list, "Unit").filter((d) => d.key === "After" || d.key === "Wants"), { After: "network-online.target", Wants: "network-online.target" }, "[Unit]");
  assert.deepEqual(inSection(list, "Unit").map((d) => d.key).sort(), ["After", "Description", "Documentation", "Wants"], "[Unit] keys");
  closedSet(service().filter((d) => d.key !== "LoadCredential"), SERVICE, "[Service]");
  assert.deepEqual(loads(), CREDS, "[Service]: LoadCredential, the seed then the anchor");
  const rw = one(service(), "ReadWritePaths").split(/\s+/);
  assert.deepEqual(rw, [D.DOJO_COLLECT_STATE], "the ONLY writable path is the collect state");
  for (const p of [D.DOJO_PUBLISH_STATE, `${D.DOJO_PUBLISH_STATE}/public`]) assert.ok(rw.every((w) => !under(p, w) && !under(w, p)), `no writable path shared with ${p}`);
  for (const src of [D.DOJO_SEED_SOURCE, D.DOJO_ANCHOR_SOURCE]) assert.ok(rw.every((w) => !under(src, w)), `the unit cannot replace ${src} (Q-2 (a))`);
  const env = one(service(), "EnvironmentFile");
  assert.ok(!env.startsWith("-") && env === D.DOJO_COLLECT_ENV_FILE, "the EnvironmentFile is mandatory (no leading -)");
  // C-G2-12: each NAMED key the tree's code reads (env.NAME, env[CONST]) is a key of the EnvironmentFile, the credentials directory, or a
  // declared key of an operator the collector never requests (Chainstack; CHAIN_OPERATORS are helius and solana-foundation).
  const CONSTS: Readonly<Record<string, string>> = { ENV_CYCLE_ID, ENV_CYCLE_FLOOR }, UNREQUESTED = ["CHAINSTACK_ETH_URL", "CHAINSTACK_SOLANA_URL"];
  const names = treeCode().flatMap((p) => [...read(p).matchAll(/\benv(?:\.(\w+)|\[(\w+)\])/g)].map((m) => m[1] ?? CONSTS[m[2] ?? ""] ?? `unresolved ${m[2] ?? ""}`));
  assert.deepEqual([...new Set(names)].sort(), [...D.DOJO_COLLECT_ENV_KEYS, "CREDENTIALS_DIRECTORY", ...UNREQUESTED].sort(), "env keys read == file + credentials + declared");
  assert.ok(Object.keys(SIM_ENV).every((k) => D.DOJO_COLLECT_ENV_KEYS.includes(k)), "the PR-2-2 oracle's environment uses these names");
  const runbook = read(RUNBOOK), writes = [...runbook.matchAll(/printf '((?:[A-Z_]+=%s\\n)+)'/g)].map((m) => (m[1] ?? "").split("\\n").filter((x) => x !== "").map((x) => x.slice(0, -3)).sort());
  assert.deepEqual(writes, [0, 1].map(() => [...D.DOJO_COLLECT_ENV_KEYS].sort()), "the RUNBOOK writes (and checks) exactly these keys");
  // C-G2-8: bundles/ is setgid dojo-handoff at A-2 and at A-9, so the publication reads a closed day through that group (TU-4).
  assert.equal(runbook.split(`install -d -o dojo-collect -g dojo-handoff -m 2750 ${D.DOJO_COLLECT_STATE}/bundles`).length, 3, "bundles/ 2750, A-2 and A-9");
  // Guarded network (calque of test/rpc-guard-fetch-only-inside-client.test.ts): in the tree, only the guard's transport touches it.
  const NET = [/\bfetch\s*\(/, /node:https?/, /node:net\b/, /node:dns\b/, /\bundici\b/, /\bchild_process\b/];
  const hits = treeCode().filter((p) => NET.some((re) => re.test(read(p))));
  assert.deepEqual(hits, ["packages/rpc-guard/src/transport.ts"], "network only inside the guard's private transport");
  assert.deepEqual(treeCode().filter((p) => /\benv\.(BELL_SOLANA_RPC|HELIUS_API_KEY)\b/.test(read(p))), hits, "the paid key is read only there");
});

// M-H5 (red here): a step over 5 minutes, a zone other than UTC, a randomized delay, AccuracySec absent (closed set) or any value changed;
// C-G2-2: a start timeout that no longer covers the worst course read in the code.
test("dojo_collect_timer_steps_inside_the_read_window", () => {
  const { sections, list } = unitOf(D.DOJO_COLLECT_TIMER);
  assert.deepEqual(sections, ["Unit", "Timer", "Install"]);
  closedSet(inSection(list, "Timer"), TIMER, "[Timer]");
  closedSet(inSection(list, "Install"), { WantedBy: "timers.target" }, "[Install]");
  const cal = /^\*-\*-\* \*:(\d{2})\/(\d{1,2}):00 UTC$/.exec(one(list, "OnCalendar"));
  assert.ok(cal !== null, "OnCalendar has the closed form *-*-* *:<minute>/<repetition>:00 UTC (systemd.time(7); FAITS l.6 and l.15)");
  const marks: number[] = [];
  for (let m = Number(cal[1]); m < 60 && Number(cal[2]) > 0; m += Number(cal[2])) marks.push(m);
  const step = 60 * Math.max(...marks.map((m, j) => (marks[j + 1] ?? (marks[0] ?? 0) + 60) - m));
  const acc = Number(/^(\d+)s$/.exec(one(list, "AccuracySec"))?.[1] ?? NaN), rnd = Number(one(list, "RandomizedDelaySec"));
  const late = step + acc + rnd; // the worst delay between an instant and the start of its step (ADR D-5 arithmetic)
  assert.equal(step, 300, "a step every 5 minutes");
  assert.ok(late <= READ_RULE.read_tolerance_s, `an instant is read inside its window: ${String(late)} s <= ${String(READ_RULE.read_tolerance_s)} s`);
  assert.equal(READ_RULE.read_tolerance_s - late, 299, "299 s left to the course (ADR D-5)");
  assert.equal(marks.filter((m) => m * 60 < READ_RULE.read_offset_s).length, 3, "three steps (00:00, 00:05, 00:10) before T_d + 900 s");
  assert.equal(one(list, "Unit"), basename(D.DOJO_COLLECT_UNIT), "the timer starts the collect unit");
  const timeout = Number(one(service(), "TimeoutStartSec"));
  assert.equal(WORST_S, 1210, "the worst course of one reading: 20 x 30 + 10 x 60 + 10 x 1 s (the unit's comment)");
  assert.ok(timeout > WORST_S && timeout === Math.round((1.25 * WORST_S) / 100) * 100, `TimeoutStartSec ${String(timeout)} = 1.25 x ${String(WORST_S)} s, to the hundred`);
});

// The unit's ExecStart is the closed argv of DOJO-TICK-ARGV-1, parsed by the REAL collect.ts.
test("dojo_collect_unit_argv_is_the_tick_contract", () => {
  const exec = one(service(), "ExecStart").split(" ");
  assert.ok(!/["'\\]/.test(one(service(), "ExecStart")), "no quoting or escaping: one space-separated argv");
  assert.deepEqual(exec.slice(0, 3), ["/usr/bin/env", "node", `${D.DOJO_COLLECT_TREE_ROOT}/apps/dojo/src/collect.ts`], "node runs collect.ts of the tree");
  assert.ok(D.DOJO_COLLECT_TREE_PATHS.includes("apps/dojo/src/collect.ts") && D.DOJO_COLLECT_TREE_PATHS.includes("out/mint.txt"));
  const credDir = "/run/credentials/monark-dojo-collect.service"; // ${CREDENTIALS_DIRECTORY} of a system service (FAITS-SYSTEMD-CRED-1)
  const argv = exec.slice(3).map((x) => x.replace(CRED_VAR, credDir)), a = parseArgv(argv);
  assert.equal(a.mode, "tick", "exactly one mode: --tick");
  assert.deepEqual([a.state, a.mintFile, a.seedFile, a.anchorFile], [D.DOJO_COLLECT_STATE, `${D.DOJO_COLLECT_TREE_ROOT}/out/mint.txt`,
    `${credDir}/${D.DOJO_SEED_CREDENTIAL}`, `${credDir}/${D.DOJO_ANCHOR_CREDENTIAL}`], "seed AND anchor from the credentials directory (Q-2 (a))");
  assert.deepEqual(loads().map((c) => c.split(":")[0]), [D.DOJO_SEED_CREDENTIAL, D.DOJO_ANCHOR_CREDENTIAL], "the credentials the argv names are the ones loaded");
  assert.ok(read("apps/dojo/src/collect.ts").includes(`resolve(cred, "${D.DOJO_SEED_CREDENTIAL}")`), "the one seed path collect.ts accepts under a unit");
  // Run caps (ADR-DOJO-PR-2 D-6): 24 calls, 40 credits, above the per-course caps of the method table (tariff of the guard).
  assert.deepEqual([a.maxCalls, a.maxCredits], [24, 40]);
  const credits = Object.entries(DOJO_METHOD_CAPS).reduce((s, [m, n]) => s + n * heliusCredits(m), 0);
  const calls = 2 * Object.values(DOJO_METHOD_CAPS).reduce((s, n) => s + n, 0); // the same attempts on each of the two operators
  assert.ok(credits <= a.maxCredits && calls <= a.maxCalls, `${String(credits)} credits <= 40, ${String(calls)} calls <= 24`);
  for (const bad of [[...argv, "--verbose"], [...argv, "--plan"], argv.filter((x) => x !== "--tick")]) assert.throws(() => parseArgv(bad), /usage/, "closed argv");
});

// M-H7 (red here): the tool prints the secret, writes over an existing file, recopies seedAnchor (C-G2-7) or writes in a tree (C-G2-9).
test("dojo_seed_init_prints_only_the_anchor", () => {
  const dir = mkdtempSync(join(tmpdir(), "dojo-seed-")), f = join(dir, "seed"), inside = join(REPO, "apps", "dojo", "seed-inside-the-tree");
  roots.push(dir, inside);
  const run = (...a: string[]): { status: number | null; stdout: string; stderr: string } => spawnSync(process.execPath, [REPO + SEED_TOOL, ...a], { encoding: "utf8" });
  const r = run("--init", f, "--horizon", "365"), text = readFileSync(f, "utf8"), s = text.slice(0, 64);
  assert.deepEqual([r.status, r.stderr], [0, ""]);
  assert.match(text, /^[0-9a-f]{64}\n$/, "32 random bytes: 64 lowercase hex characters and LF");
  assert.equal(r.stdout, `${JSON.stringify({ seed_anchor: seedAnchor(s, 365), horizon: 365 })}\n`, "one line: the public part, nothing else");
  assert.ok(!r.stdout.includes(s) && !r.stdout.includes(s.slice(0, 16)), "the secret is never printed");
  const tool = read(SEED_TOOL);
  assert.ok(tool.includes(`import { seedAnchor } from "./dojo-core.mjs";`) && !/\b(function|const|let|var)\s+seedAnchor\b/.test(tool), "seedAnchor imported, never recopied");
  if (process.platform !== "win32") assert.equal(statSync(f).mode & 0o777, 0o600, "mode 0600 (POSIX; not observable on win32)");
  const again = run("--init", f, "--horizon", "365");
  assert.deepEqual([again.status, again.stdout, sha(readFileSync(f))], [1, "", sha(text)], "an existing file is never overwritten");
  assert.match(again.stderr, new RegExp(`^dojo/seed: ${DOJO_SEED_REFUSALS[0] ?? "?"}: `));
  const inTree = run("--init", inside, "--horizon", "365");
  assert.deepEqual([inTree.status, inTree.stdout, existsSync(inside)], [1, "", false], "a path inside the code tree is refused, nothing written");
  assert.match(inTree.stderr, new RegExp(`^dojo/seed: ${DOJO_SEED_REFUSALS[1] ?? "?"}: `));
  assert.equal(run("--horizon", "365", "--init", join(dir, "b")).status, 0);
  assert.notEqual(readFileSync(join(dir, "b"), "utf8"), text, "a fresh secret per file");
  for (const bad of [[], ["--init", join(dir, "u")], ["--init", join(dir, "u"), "--horizon", "0"], ["--init", join(dir, "u"), "--horizon", "1.5"],
    ["--horizon", "365", "--horizon", "365"], ["--init", "--horizon", "365", join(dir, "u")], ["--init", join(dir, "u"), "--horizon", "365", "--x"]]) {
    const u = run(...bad);
    assert.deepEqual([u.status, u.stdout], [2, ""], `usage: ${bad.join(" ")}`);
  }
  assert.deepEqual(readdirSync(dir).sort(), ["b", "seed"], "a refused call creates no file");
});

// C-G2-3 (red here): the Eve tool prints other bytes than the canonical empty Eve, or accepts a day that is not a real UTC day.
test("dojo_eve_prints_the_canonical_empty_eve", () => {
  const run = (...a: string[]): { status: number | null; stdout: string; stderr: string } => spawnSync(process.execPath, [REPO + EVE_TOOL, ...a], { encoding: "utf8" });
  const want = `${canonical({ addresses: [], accounts: [] })}\n`;
  for (const ok of [["--empty", "--day", "2026-10-02"], ["--day", "2028-02-29", "--empty"]]) {
    const r = run(...ok);
    assert.deepEqual([r.status, r.stdout, r.stderr], [0, want, ""], `the bytes of the empty Eve: ${ok.join(" ")}`);
  }
  assert.deepEqual(readEve(want), { addresses: [], accounts: [] }, "...which the reader of the collector and of the publisher accepts");
  for (const bad of [[], ["--empty"], ["--day", "2026-10-02"], ["--empty", "--day", "2026-02-30"], ["--empty", "--day", "2026-10-2"],
    ["--empty", "--day", "2026-10-02", "--x"], ["--empty", "--empty", "--day"], ["--day", "2026-10-02", "--day"]]) {
    const u = run(...bad);
    assert.deepEqual([u.status, u.stdout], [2, ""], `usage: ${bad.join(" ")}`);
  }
});

// M-H8 (red here): a tree list that differs from the closure of the four programs (a file missing, or one added), or a tool the RUNBOOK
// does not run from the tree.
test("dojo_collect_tree_is_the_import_closure", () => {
  const [link, target] = D.DOJO_COLLECT_TREE_LINK, pkgDir = posix.join(posix.dirname(link), target);
  const pkg = JSON.parse(read(`${pkgDir}/package.json`)) as { name: string; exports: Record<string, string> };
  assert.ok(link.endsWith(pkg.name) && pkg.exports["."] !== undefined, "the link names the package it resolves");
  const IMPORT = /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\bfrom\s*)?["']([^"']+)["']/gm; // `import type` is erased at load
  const entry = one(service(), "ExecStart").split(" ")[2]?.slice(D.DOJO_COLLECT_TREE_ROOT.length + 1) ?? "?";
  assert.deepEqual(D.DOJO_COLLECT_TREE_PROGRAMS, [entry, SEED_TOOL, EVE_TOOL, UNLOCK_TOOL], "the declared union: the unit's script and three tools");
  const out = new Set<string>(["out/mint.txt"]), todo = [...D.DOJO_COLLECT_TREE_PROGRAMS];
  for (let f = todo.pop(); f !== undefined; f = todo.pop()) {
    if (out.has(f)) continue;
    out.add(f);
    const src = read(f);
    assert.deepEqual(src.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && /(?<![\w.$])(import\s*\(|require\s*\()/.test(l)), [], `${f}: no dynamic import`);
    for (const m of src.matchAll(IMPORT)) {
      const s = m[1] ?? "";
      if (s.startsWith("node:")) continue;
      if (s.startsWith(".")) todo.push(posix.join(posix.dirname(f), s));
      else { assert.equal(s, pkg.name, `${f}: the only bare specifier is ${pkg.name} (no npm on the host)`); todo.push(posix.join(pkgDir, pkg.exports["."] ?? "?")); out.add(`${pkgDir}/package.json`); }
    }
    for (let d = posix.dirname(f); f.endsWith(".ts") && d !== "."; d = posix.dirname(d)) if (existsSync(`${REPO}${d}/package.json`)) { out.add(`${d}/package.json`); break; }
  }
  assert.deepEqual([...out].sort(), [...D.DOJO_COLLECT_TREE_PATHS], "the tree == the closure of the four programs, with their package scopes and the mint");
  const exec = one(service(), "ExecStart").split(" ");
  assert.equal(exec[exec.indexOf("--mint-file") + 1], `${D.DOJO_COLLECT_TREE_ROOT}/out/mint.txt`, "--mint-file is the tree's out/mint.txt");
  const runbook = read(RUNBOOK), archive = /git -C \S+ archive --format=tar\.gz "\$G7" ([^|]+)\|/.exec(runbook);
  assert.deepEqual(archive?.[1]?.trim().split(/\s+/), [...D.DOJO_COLLECT_TREE_PATHS], "the RUNBOOK ships exactly this tree");
  assert.ok(runbook.includes(`ln -s ${target} ${D.DOJO_COLLECT_TREE_ROOT}/${link}`), "...with this resolution link");
  // Each tool is run by the RUNBOOK from the tree (Branchement), under its user: the seed at A-4 (root, 0600), the Eve at A-11-rep and
  // the served unlock at section 9 as dojo-collect, never root (dated line 15:00Z: the unit's own files, dojo-collect:dojo-handoff).
  const [T, S] = [D.DOJO_COLLECT_TREE_ROOT, D.DOJO_COLLECT_STATE], RUNS: Readonly<Record<string, string>> = { [SEED_TOOL]: `umask 077 && node ${T}/${SEED_TOOL} --init ${D.DOJO_SEED_SOURCE} --horizon`,
    [EVE_TOOL]: `sudo -u dojo-collect sh -c "umask 0027 && mkdir -p ${S}/bundles/<d> && node ${T}/${EVE_TOOL} --empty --day <d> > ${S}/bundles/<d>/eve.json.tmp`,
    [UNLOCK_TOOL]: `sudo -u dojo-collect /usr/bin/env node ${T}/${UNLOCK_TOOL} --ledger-dir ${S}/ledger --floor 0 unlock` };
  for (const p of D.DOJO_COLLECT_TREE_PROGRAMS.slice(1)) assert.ok(runbook.includes(RUNS[p] ?? "?"), `the RUNBOOK runs ${p} from the tree, as its user`);
});

// TU-C (ADR section 3): timer -> the unit's argv -> the REAL --tick of the tree -> bundles/<day>/, closed and readable by the publisher.
// killer: packages/rpc-guard/src/lock.ts:42 SDL "if (existsSync(lockPath)) unlinkSync(lockPath);" -> ""
test("dojo_collect_unit_runs_the_real_tick", async () => {
  const R = mkdtempSync(join(tmpdir(), "dojo-collect-unit-")), host = (p: string): string => join(R, ...p.split("/").filter((x) => x !== ""));
  roots.push(R);
  const tree = host(D.DOJO_COLLECT_TREE_ROOT), [link, target] = D.DOJO_COLLECT_TREE_LINK, svc = service();
  for (const p of D.DOJO_COLLECT_TREE_PATHS) { mkdirSync(dirname(join(tree, p)), { recursive: true }); cpSync(REPO + p, join(tree, p)); }
  mkdirSync(dirname(join(tree, link)), { recursive: true });
  if (process.platform === "win32") symlinkSync(join(dirname(join(tree, link)), target), join(tree, link), "junction"); // absolute on win32
  else symlinkSync(target, join(tree, link), "dir");
  const digest = (): string => sha(D.DOJO_COLLECT_TREE_PATHS.map((p) => sha(readFileSync(join(tree, p)))).join(""));
  const before = digest();
  // Acts A-2, A-4, A-5 (model): ledger/; the seed by the tree's own dojo-seed.mjs; the rehearsal anchor carrying its seed_anchor and
  // horizon (an unsigned body); each credential source handed over as LoadCredential would, under the id the unit declares.
  const state = host(D.DOJO_COLLECT_STATE), creds = join(R, "run", "credentials", "monark-dojo-collect.service");
  mkdirSync(join(state, "ledger"), { recursive: true });
  mkdirSync(dirname(host(D.DOJO_SEED_SOURCE)), { recursive: true });
  const gen = spawnSync(process.execPath, [join(tree, SEED_TOOL), "--init", host(D.DOJO_SEED_SOURCE), "--horizon", "365"], { encoding: "utf8" });
  assert.equal(gen.status, 0, gen.stderr);
  const pub = JSON.parse(gen.stdout) as { seed_anchor: string; horizon: number };
  writeFileSync(host(D.DOJO_ANCHOR_SOURCE), JSON.stringify({ ...anchorBody(pub.seed_anchor, pub.horizon, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH }));
  mkdirSync(creds, { recursive: true });
  for (const [id = "?", src = "?"] of loads().map((c) => c.split(":"))) cpSync(host(src), join(creds, id));
  const secret = readFileSync(join(creds, D.DOJO_SEED_CREDENTIAL), "utf8").trim(); // this run's own test seed, generated above
  assert.equal(readFileSync(join(tree, "out", "mint.txt"), "utf8").trim(), MINT, "the tree's out/mint.txt is the simulated chain's mint");
  // The unit's ExecStart: host paths mapped into R, ${CREDENTIALS_DIRECTORY} substituted (FAITS-SYSTEMD-CRED-1; proven on the host at A-5).
  const exec = one(svc, "ExecStart").split(" "), argv = exec.slice(3).map((x) => (x.includes(CRED_VAR) ? x.replace(CRED_VAR, creds) : x.startsWith("/") ? host(x) : x));
  const collect = (await import(pathToFileURL(host(exec[2] ?? "?")).href)) as typeof import("../apps/dojo/src/collect.ts");
  const values: Readonly<Record<string, string>> = { ...SIM_ENV, HELIUS_API_KEY: "not-a-key" };
  const env = { ...Object.fromEntries(D.DOJO_COLLECT_ENV_KEYS.map((k) => [k, values[k]])), CREDENTIALS_DIRECTORY: creds };
  Object.assign(sim, { reqs: [], rows: ROWS, mint: MINT, beta: betaOf(ANCHOR_DAY + 1), override: null });
  const T = (d: number): number => d * 86_400, D1 = ANCHOR_DAY + 1, day = join(state, "bundles", dateOf(D1));
  const tick = (s: number, e: Record<string, string | undefined> = env): Promise<void> => {
    sim.nowMs = s * 1000; return collect.runCollect(argv, { env: e, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() }); }; // no relay injected
  const codeOf = async (p: Promise<unknown>): Promise<string> => { try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? String((e as Error).message); } };
  // T6 (G0 DRAND-RELAY-GET-1b section 2, constat 7): the step before 00:15 UTC runs the course of the relays, from the constants (each relay:
  // TRIES tries of at most DEFAULT_TIMEOUT_MS, TRIES - 1 waits of at most the guard's Retry-After cap), and at most one reading (WORST_S).
  const WAIT_MS = Math.max(parseRetryAfterMs("86400", 0) ?? NaN, BACKOFF_MS);
  const WORST_PLAN_S = (DRAND_RELAY_LABELS.length * (TRIES * DEFAULT_TIMEOUT_MS + (TRIES - 1) * WAIT_MS)) / 1000;
  assert.deepEqual([WORST_PLAN_S, WORST_PLAN_S + WORST_S <= Number(one(svc, "TimeoutStartSec"))], [240, true], "240 + 1210 s <= TimeoutStartSec 1500 s");
  assert.equal(await codeOf(tick(T(D1) + 60, { ...env, [ENV_CYCLE_ID]: undefined })), "cycle_missing", "the cycle id key is required");
  assert.equal(await codeOf(tick(T(D1) + 60, { ...env, CREDENTIALS_DIRECTORY: join(R, "elsewhere") })), "credentials_path", "the seed only from the credential");
  await tick(T(ANCHOR_DAY) + 1000); // RUNBOOK section 5: the one start of A-5, made on the anchor day, has no day to open
  assert.deepEqual([existsSync(join(state, "bundles")), sim.reqs.length], [false, 0], "refusals before any call; the A-5 start writes and calls nothing");
  // Act A-11-rep (RUNBOOK section 6), before the timer: the empty Eve of the first day it opens, by the tree's own dojo-eve.mjs.
  const eve = spawnSync(process.execPath, [join(tree, EVE_TOOL), "--empty", "--day", dateOf(D1)], { encoding: "utf8" });
  assert.equal(eve.status, 0, eve.stderr);
  mkdirSync(day, { recursive: true });
  writeFileSync(join(day, "eve.json"), eve.stdout);
  assert.equal(await codeOf(tick(T(D1) + 60)), "none", "the step of 00:01 plans the day: one GET per relay through the guard");
  const inst = (JSON.parse(readFileSync(join(day, "evidence", "plan.json"), "utf8")) as { instants: number[] }).instants;
  assert.deepEqual(inst, readInstants(daySeed(secret, 365, 1), betaOf(D1), 4, T(D1), READ_RULE.read_offset_s), "instants of the seed made by dojo-seed");
  const step = (t: number): number => Math.ceil(t / 300) * 300; // the timer: the first 5-minute step at or after t
  assert.match(await codeOf(tick(step(inst[0] ?? 0), { ...env, BELL_SOLANA_RPC: undefined })), /operator 'helius' is not resolved from env/, "no endpoint: the guard refuses");
  assert.equal(existsSync(join(day, "readings", "1.json")), false, "...and writes nothing");
  // DOJO-UNLOCK-CHAIN-TEST-1 on the tree: a helius.lock left by a killed step (SIGKILL: no handler runs) refuses the step (lock_held);
  // the tree's served unlock, run as RUNBOOK section 9 runs it, releases it (exit 0, last line unlocked); the next step of that instant reads.
  const cyc = join(state, "ledger", SIM_ENV.HELIUS_CYCLE_ID), lock = join(cyc, "helius.lock");
  mkdirSync(cyc, { recursive: true });
  writeFileSync(lock, "{}");
  assert.equal(await codeOf(tick(step(inst[0] ?? 0))), "lock_held", "a lock left held stops the step before any call");
  const served = spawnSync(process.execPath, [join(tree, UNLOCK_TOOL), "--ledger-dir", join(state, "ledger"), "--floor", "0", "unlock", "--cycle",
    SIM_ENV.HELIUS_CYCLE_ID, "--op", "helius", "--reason", "runbook-lock-held-unlock"], { encoding: "utf8" });
  const last = JSON.parse(readFileSync(join(cyc, "helius.jsonl"), "utf8").trim().split("\n").at(-1) ?? "{}") as { outcome?: string; reason?: string };
  assert.deepEqual([served.status, existsSync(lock), last.outcome, last.reason], [0, false, "unlocked", "runbook-lock-held-unlock"], served.stderr);
  for (const t of inst) assert.equal(await codeOf(tick(step(t))), "none", "each step reads its instant");
  await tick(T(D1 + 1) + 900); // the first step after the end of the reading day closes it (and plans the next day without a call)
  const got = readDayLayout(day), ops = sim.reqs.map((r) => r.op);
  assert.deepEqual([got.bundle.status, got.bundle.day, got.bundle.seed, got.bundle.k_reads], ["counted", dateOf(D1), daySeed(secret, 365, 1), 4], "a counted day");
  assert.ok(got.records.every((r) => r.read.read_at !== null), "the four readings were made at their steps");
  assert.deepEqual([...DRAND_RELAY_LABELS, "helius", "solana-foundation"].map((op) => ops.filter((o) => o === op).length), [1, 1, 17, 17],
    "one beacon GET per relay through the guard; 5 + 3 x 4 pieces per operator (the mint read once)");
  assert.ok(readdirSync(join(state, "ledger")).length > 0, "the guard's ledger lives in the unit's only writable path");
  assert.equal(digest(), before, "the tree is left byte-identical (read-only to the unit)");
});

// DOJO-SEED-FS-TRACE-1 (ADR-DOJO-PR-3 l.224; G0 DRAND-RELAY-GET-1b section 4.4): the seed tool, under a preload that traces every path-taking
// writer of node:fs and node:fs/promises, writes its seed file and touches its directory, nothing else (A-4 runs it as root on the real seed).
// killer: apps/dojo/scripts/dojo-seed.mjs:30 CONST "fsyncSync(fd); }" -> "fsyncSync(fd); writeSync(openSync(`${dirname(path)}-copy`, `w`), secret); }"
test("dojo_seed_writes_only_its_seed", () => {
  const dir = mkdtempSync(join(tmpdir(), "dojo-seed-trace-")), seed = join(dir, "seed", "seed"), trace = join(dir, "trace.txt"), probe = join(dir, "probe.mjs");
  roots.push(dir);
  mkdirSync(dirname(seed));
  const traced = (...a: string[]): { status: number | null; stderr: string; paths: string[]; lines: string[] } => {
    rmSync(trace, { force: true });
    const env = { ...process.env, DOJO_FS_TRACE: trace };
    const r = spawnSync(process.execPath, ["--import", pathToFileURL(REPO + FS_TRACE).href, ...a], { encoding: "utf8", env });
    const lines = existsSync(trace) ? readFileSync(trace, "utf8").trim().split("\n") : [];
    return { status: r.status, stderr: r.stderr, paths: [...new Set(lines.map((l) => l.slice(l.indexOf(" ") + 1)))], lines };
  };
  // Positive control (M-F1): a write through node:fs/promises is traced; the re-binding is proven in the repository for node:fs only.
  writeFileSync(probe, `import { writeFile } from "node:fs/promises";\nawait writeFile(${JSON.stringify(join(dir, "probe-out"))}, "x");\n`);
  const p = traced(probe);
  assert.deepEqual([p.status, p.lines.includes(`writeFile ${join(dir, "probe-out")}`), p.paths], [0, true, [join(dir, "probe-out")]], p.stderr);
  const r = traced(REPO + SEED_TOOL, "--init", seed, "--horizon", "365");
  assert.deepEqual([r.status, r.stderr, r.paths.includes(seed), r.paths.every((x) => x === seed || x === dirname(seed))], [0, "", true, true],
    `the seed file and its directory, nothing else: ${r.lines.join(" | ")}`);
});
