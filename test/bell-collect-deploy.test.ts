/**
 * Root tests of the Bell collection deployment (G0 BELL-COLLECT-TIMER-1 DC-3, DC-4 and section 4 "P3", lot 3b; PLAN-P3 C3-1 to C3-3,
 * lot 3b-ii). Governance-only: deploy/ is not exported. The COMMITTED collection unit, its timer and the publisher unit it starts are
 * parsed and pinned (closed directive sets), bound to what they run (the closed argv of apps/bell/src/tick.ts, the import closure of the
 * tick and of the guard's served CLI packages/rpc-guard/bin/rpc-guard.mjs (lot 3c), the constants of scripts/bell-deploy.mjs, the due instants of apps/bell/src/plan.ts), and the unit's own argv runs the REAL tick
 * of a tree materialized from BELL_COLLECT_TREE_PATHS up to its first network act (fetch trapped: no network), with an injected clock.
 * The full collection, its deposit and its publication are the composition test (apps/bell/test/bell-units-compose.test.ts). Calques:
 * test/dojo-collect-deploy.test.ts and test/dojo-publish-deploy.test.ts. Each test opens on exists(): before the lot, a named red (the
 * units and the constants are absent), never a load error. Synthetic values only; no `any`.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as deploy from "../scripts/bell-deploy.mjs";
import { BELL_COLLECT_ENV_KEYS, BELL_HANDOFF_GROUP, BELL_LAYOUT, TICK_TIMEOUT_START_SEC, UNIT_DUE_MARGIN_MIN } from "../scripts/bell-deploy.mjs";
import { dueInstant, unitOf } from "../apps/bell/src/plan.ts";
import { CALENDAR_RANGE, isTradingDay, nextTradingDay, SIP_DAY_REGIMES } from "../apps/bell/src/sessions.ts";
import { tickMain, type TickDeps } from "../apps/bell/src/tick.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
const L = BELL_LAYOUT, PUBLISH_USER = "bell", COLLECT_USER = "bell-collect";
/** Bell's key directory: the directory of the source of the publisher's one credential (never a constant of scripts/bell-deploy.mjs, which
 *  is in the collection's tree). */
const keyDir = (): string => posix.dirname(/^LoadCredential=bell-signing-key:(\S+)$/m.exec(read("deploy/monark-bell-publish.service"))?.[1] ?? "?");
/** The constants of the lot, read by namespace: absent before it (undefined, a named red), never a load error. */
const C = (): { unit: string; timer: string; publish: string; root: string; tree: readonly string[]; link: readonly string[]; secrets: string; env: string; key: string } =>
  ({ unit: deploy.BELL_COLLECT_UNIT, timer: deploy.BELL_COLLECT_TIMER, publish: deploy.BELL_PUBLISH_UNIT, root: deploy.BELL_COLLECT_TREE_ROOT,
    tree: deploy.BELL_COLLECT_TREE_PATHS, link: deploy.BELL_COLLECT_TREE_LINK, secrets: deploy.BELL_COLLECT_SECRETS_DIR, env: deploy.BELL_COLLECT_ENV_FILE, key: keyDir() });
function exists(): void {
  for (const [k, v] of Object.entries(C())) assert.ok(v !== undefined, `scripts/bell-deploy.mjs exports the constant of ${k}`);
  assert.equal(C().key, "/etc/monark/bell", "Bell's key directory, read from the publisher's LoadCredential=");
  for (const u of [C().unit, C().timer, C().publish]) assert.ok(existsSync(REPO + u), `${u} is committed`);
}
/** The --tick form of DC-4 on the directories of BELL_LAYOUT (the ledger inside the collection's private side, DC-3 l.203). */
const EXEC = (): string => `/usr/bin/env node ${C().root}/apps/bell/src/tick.ts --tick --state ${L.collect.path} --handoff ${L.handoff.path} --status ${L.status.path} --ledger-dir ${L.collect.path}/ledger`;
const SERVICE = (): Readonly<Record<string, string>> => ({ Type: "oneshot", WorkingDirectory: C().root, EnvironmentFile: C().env, ExecStart: EXEC(),
  TimeoutStartSec: String(TICK_TIMEOUT_START_SEC), User: COLLECT_USER, Group: COLLECT_USER, SupplementaryGroups: BELL_HANDOFF_GROUP, NoNewPrivileges: "true",
  ProtectSystem: "strict", ProtectHome: "true", PrivateTmp: "true", ReadWritePaths: `${L.collect.path} ${L.handoff.path}`, InaccessiblePaths: `${L.state.path} ${C().key}`, UMask: "0027" });
const UNIT_SECTION = (): Readonly<Record<string, string>> => ({ After: "network-online.target", Wants: "network-online.target", OnSuccess: basename(C().publish), OnFailure: basename(C().publish) });
const SLOTS = ["*-*-* 20:15:00 UTC", "*-*-* 21:15:00 UTC", "*-*-* 08:45:00 UTC", "*-*-* 09:45:00 UTC"];

interface Directive { section: string; key: string; value: string }
/** systemd unit -> directives in order (comments and blank lines dropped; no line continuation, asserted). */
function unitOfFile(rel: string): { text: string; sections: string[]; list: Directive[] } {
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
const service = (rel: string): Directive[] => inSection(unitOfFile(rel).list, "Service");
const one = (list: readonly Directive[], key: string): string => { const v = list.filter((d) => d.key === key); assert.equal(v.length, 1, key); return v[0]?.value ?? ""; };
const words = (list: readonly Directive[], key: string): string[] => list.filter((d) => d.key === key).flatMap((d) => d.value.split(/\s+/)).filter((w) => w !== "");
/** Path p is `dir` or under it (segment-aware: /var/lib/monark-bell-collect is NOT under /var/lib/monark-bell). */
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir}/`);
const treeCode = (): string[] => C().tree.filter((p) => /\.(ts|mjs)$/.test(p));
const tokens = (text: string): string[] => text.split(/[\s=:,"'`]+/).map((t) => t.replace(/^[-+~!@]+/, ""));

// killer: deploy/monark-bell-collect.service:47 CONST "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -> "InaccessiblePaths=/var/lib/monark-bell"
test("bell_collect_unit_never_loads_the_signing_key", () => {
  exists();
  for (const rel of [C().unit, C().timer]) {
    const { text } = unitOfFile(rel), t = tokens(text);
    assert.equal(text.includes("bell-signing-key"), false, `${rel} never names the signing credential, not even in a comment`);
    assert.deepEqual(t.filter((x) => under(x, C().key)), rel === C().unit ? [C().key] : [], `${rel}: the key directory, only to mask it`);
    assert.deepEqual(t.filter((x) => under(x, L.state.path)), rel === C().unit ? [L.state.path] : [], `${rel}: the publisher's state, only to mask it`);
  }
  assert.deepEqual(service(C().unit).filter((d) => /Credential|^Environment$|^PassEnvironment$/.test(d.key)), [], "no credential of any kind, no inline environment");
  assert.deepEqual(words(service(C().unit), "InaccessiblePaths"), [L.state.path, C().key], "the publisher's state, then the key directory, inaccessible (no '-': both exist)");
  // The code the unit runs: no module reads the credentials directory, names the signing credential or the key directory; no publisher.
  assert.ok(!C().tree.includes("apps/bell/scripts/bell-publish.mjs"), "the publisher (which reads the key) is not in the collection's tree");
  for (const p of treeCode()) {
    const src = read(p);
    assert.deepEqual([src.includes("CREDENTIALS_DIRECTORY"), src.includes("bell-signing-key"), tokens(src).some((x) => under(x.replace(/\.+$/, ""), C().key))], [false, false, false], `${p} never reaches the key`); // a mention that ends a sentence too
  }
});

// killer: deploy/monark-bell-collect.service:27 CONST "EnvironmentFile=/etc/monark/bell-collect/collect.env" -> "EnvironmentFile=-/etc/monark/bell-collect/collect.env"
test("bell_collect_unit_least_privilege_guarded_network", () => {
  exists();
  const { sections, list } = unitOfFile(C().unit);
  assert.deepEqual(sections, ["Unit", "Service"], "no [Install]: the timer starts the unit");
  assert.deepEqual(inSection(list, "Unit").map((d) => d.key).sort(), ["After", "Description", "Documentation", "OnFailure", "OnSuccess", "Wants"], "[Unit] keys");
  closedSet(inSection(list, "Unit").filter((d) => !["Description", "Documentation"].includes(d.key)), UNIT_SECTION(), "[Unit]");
  closedSet(service(C().unit), SERVICE(), "[Service]");
  assert.deepEqual(words(service(C().unit), "ReadWritePaths"), [L.collect.path, L.handoff.path], "the ONLY writable paths: the private side and the handoff");
  const env = one(service(C().unit), "EnvironmentFile");
  assert.ok(!env.startsWith("-") && under(env, C().secrets) && env !== C().secrets, "the EnvironmentFile is mandatory (no leading -), inside the secrets directory");
  // Each key the tree's code names (env.NAME) is a key of the EnvironmentFile, or a declared key of an operator the tick never requests.
  const UNREQUESTED = ["CHAINSTACK_ETH_URL"], named = treeCode().flatMap((p) => [...read(p).matchAll(/\benv\.(\w+)/g)].map((m) => m[1] ?? ""));
  assert.deepEqual([...new Set(named)].filter((k) => !BELL_COLLECT_ENV_KEYS.includes(k) && !UNREQUESTED.includes(k)), [], "env keys named in the tree: the file's, or declared");
  assert.ok(named.length > 0 && BELL_COLLECT_ENV_KEYS.every((k) => k.endsWith("_CYCLE_ANCHOR_UTC") || k.endsWith("_CYCLE_SHARE") || named.includes(k)), "non-vacuity: each key of the file is read");
  // Guarded network (calque of test/rpc-guard-fetch-only-inside-client.test.ts): the guard's transport (the RPC legs) and close.ts (the
  // cash leg, the one module allowed a paid read) are the only network modules of the tree, and each reads only its own keys.
  const NET = [/\bfetch\s*\(/, /node:https?/, /node:net\b/, /node:dns\b/, /\bundici\b/, /\bchild_process\b/];
  assert.deepEqual(treeCode().filter((p) => NET.some((re) => re.test(read(p)))), ["apps/bell/src/close.ts", "packages/rpc-guard/src/transport.ts"], "network only there");
  assert.deepEqual(treeCode().filter((p) => /\benv\.(BELL_SOLANA_RPC|HELIUS_API_KEY|CHAINSTACK_SOLANA_URL)\b/.test(read(p))), ["packages/rpc-guard/src/transport.ts"], "the RPC keys: the guard only");
  assert.deepEqual(treeCode().filter((p) => /\benv\.(DATABENTO_API_KEY|POLYGON_API_KEY)\b/.test(read(p))), ["apps/bell/src/close.ts"], "the cash keys: close.ts only");
});

// killer: deploy/monark-bell-collect.service:30 CONST "--status /var/lib/monark-bell-status " -> ""
test("bell_collect_unit_argv_is_the_tick_contract", async () => {
  exists();
  const exec = one(service(C().unit), "ExecStart");
  assert.ok(!/["'\\$]/.test(exec), "no quoting, escaping or variable: one space-separated argv");
  assert.equal(exec, EXEC(), "the --tick form of DC-4 on the directories of BELL_LAYOUT");
  const argv = exec.split(" ").slice(3), entry = exec.split(" ")[2] ?? "";
  assert.ok(entry.startsWith(`${C().root}/`) && C().tree.includes(entry.slice(C().root.length + 1)), "node runs tick.ts of the dedicated tree");
  // The REAL entry point of the command line takes this argv: on an empty host it refuses state_missing (1), never usage (64).
  const R = mkdtempSync(join(tmpdir(), "bell-collect-argv-")), host = (p: string): string => (p.startsWith("/") ? join(R, ...p.split("/").filter((x) => x !== "")) : p);
  roots.push(R);
  const err: string[] = [], deps: TickDeps = { env: {}, now: () => 0, out: () => undefined, err: (s) => { err.push(s); } };
  assert.deepEqual([await tickMain(argv.map(host), deps), err.at(-1)], [1, "bell/tick: refused state_missing: state/progress.json is missing: seed it by act"]);
  for (const bad of [argv.slice(1), [...argv, "--verbose"], [...argv, "--state", host(L.collect.path)], argv.slice(0, -2), ["--seed", ...argv.slice(1)]]) {
    assert.equal(await tickMain(bad.map(host), deps), 64, `closed argv: ${bad.join(" ")}`);
  }
});

// killer: scripts/bell-deploy.mjs:86 CONST "\"packages/rpc-guard/bin/rpc-guard.mjs\", " -> ""
test("bell_collect_tree_is_the_import_closure", () => {
  exists();
  const [link = "", target = ""] = C().link, pkgDir = posix.join(posix.dirname(link), target);
  const pkg = JSON.parse(read(`${pkgDir}/package.json`)) as { name: string; exports: Record<string, string> };
  assert.ok(link.endsWith(pkg.name) && pkg.exports["."] !== undefined, "the link names the package it resolves");
  const IMPORT = /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\bfrom\s*)?["']([^"']+)["']/gm; // `import type` is erased at load
  const entry = one(service(C().unit), "ExecStart").split(" ")[2]?.slice(C().root.length + 1) ?? "?";
  assert.equal(entry, "apps/bell/src/tick.ts", "the unit's program: the tick");
  // Lot 3c (PLAN-P3, dated line of 11:2x UTC): the tree holds a second program, the guard's served CLI, which the RUNBOOK's unlock act runs
  // from the tree (section 17), so that no act runs a file absent from it (calque of dojo_collect_tree_is_the_import_closure).
  const UNLOCK_TOOL = "packages/rpc-guard/bin/rpc-guard.mjs", out = new Set<string>(), pending = [entry, UNLOCK_TOOL];
  for (let f = pending.pop(); f !== undefined; f = pending.pop()) {
    if (out.has(f)) continue;
    out.add(f);
    const src = read(f);
    assert.deepEqual(src.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && /(?<![\w.$])(import\s*\(|require\s*\()/.test(l)), [], `${f}: no dynamic import`);
    for (const m of src.matchAll(IMPORT)) {
      const s = m[1] ?? "";
      if (s.startsWith("node:")) continue;
      if (s.startsWith(".")) pending.push(posix.join(posix.dirname(f), s));
      else { assert.equal(s, pkg.name, `${f}: the only bare specifier is ${pkg.name} (no npm on the host)`); pending.push(posix.join(pkgDir, pkg.exports["."] ?? "?")); out.add(`${pkgDir}/package.json`); }
    }
    for (let d = posix.dirname(f); f.endsWith(".ts") && d !== "."; d = posix.dirname(d)) if (existsSync(`${REPO}${d}/package.json`)) { out.add(`${d}/package.json`); break; }
  }
  assert.deepEqual([...out].sort(), [...C().tree], "the tree == the closure of the tick and of the guard's served CLI, with their package scopes, in byte order");
  assert.deepEqual(C().tree.filter((p) => /bell-publish|bell-verify|bell-report/.test(p)), [], "no publisher, verifier or report in the collection's tree (G0 N-4)");
  assert.ok(Object.isFrozen(C().tree) && Object.isFrozen(C().link), "frozen: no caller widens them");
  // The RUNBOOK (section 14) ships exactly this tree, with this link, and runs the CLI from it (section 17).
  const runbook = read("docs/RUNBOOK-bell.md"), archive = /git -C \S+ archive --format=tar\.gz "\$G7" ([^|]+)\| tee \/f\/tmp\/bell-dn\/collect-tree\.tar\.gz /.exec(runbook);
  assert.deepEqual(archive?.[1]?.trim().split(/\s+/), [...C().tree], "the RUNBOOK ships exactly this tree");
  // G2 of part 3, nit-2: the count of section 14's comparison is the tree's length (one sha256sum line per file), never a number copied here.
  const counts = /Expected: (\d+) remote lines, equal line for line to the (\d+) local lines/.exec(runbook);
  assert.deepEqual([Number(counts?.[1]), Number(counts?.[2])], [C().tree.length, C().tree.length], "the RUNBOOK's remote and local line counts are the tree's length");
  assert.ok(runbook.includes(`ln -s ${target} ${C().root}/${link}`), "...with this resolution link");
  assert.ok(runbook.includes(`/usr/bin/env node ${C().root}/${UNLOCK_TOOL} --ledger-dir `), "the RUNBOOK runs the guard's CLI from the tree");
});

// killer: scripts/bell-deploy.mjs:82 CONST "\"apps/bell/src/handoff-status.ts\", " -> ""
test("bell_collect_unit_runs_the_real_tick", async () => {
  exists();
  const R = mkdtempSync(join(tmpdir(), "bell-collect-unit-")), host = (p: string): string => (p.startsWith("/") ? join(R, ...p.split("/").filter((x) => x !== "")) : p);
  roots.push(R);
  const tree = host(C().root), [link = "", target = ""] = C().link;
  for (const p of C().tree) { mkdirSync(dirname(join(tree, p)), { recursive: true }); cpSync(REPO + p, join(tree, p)); }
  mkdirSync(dirname(join(tree, link)), { recursive: true });
  if (process.platform === "win32") symlinkSync(join(dirname(join(tree, link)), target), join(tree, link), "junction"); // absolute on win32
  else symlinkSync(target, join(tree, link), "dir");
  const digest = (): string => sha(C().tree.map((p) => sha(readFileSync(join(tree, p)))).join("")), before = digest();
  // The acts of lot 5b (model): the four directories of the layout and the ledger; the seed by the tree's own --seed form.
  for (const x of Object.values(L)) mkdirSync(host(x.path), { recursive: true });
  const exec = one(service(C().unit), "ExecStart").split(" "), argv = exec.slice(3).map(host);
  mkdirSync(argv[argv.indexOf("--ledger-dir") + 1] ?? "?", { recursive: true });
  const tick = (await import(pathToFileURL(host(exec[2] ?? "?")).href).catch((e: unknown) => assert.fail(`the tree's tick loads: ${String(e)}`))) as typeof import("../apps/bell/src/tick.ts");
  const D = "2026-10-02", due = dueInstant(unitOf(D), UNIT_DUE_MARGIN_MIN), err: string[] = [], out: string[] = [];
  const env: Record<string, string> = { BELL_SOLANA_RPC: "https://rpc.example.invalid", HELIUS_API_KEY: "h".repeat(36), CHAINSTACK_SOLANA_URL: `https://cs.example.invalid/${"c".repeat(32)}`,
    DATABENTO_API_KEY: `db-${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z", CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
    HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000", BELL_HALTS_CSV: join(R, "halts.csv") }; // synthetic, outside the tree's root
  assert.deepEqual(Object.keys(env).sort(), [...BELL_COLLECT_ENV_KEYS].sort(), "the EnvironmentFile's keys, synthetic values");
  const deps = (now: number): TickDeps => ({ env, now: () => now, clockSynced: () => true, out: (s) => { out.push(s); }, err: (s) => { err.push(s); } });
  assert.equal(await tick.tickMain(["--seed", D, "--state", argv[argv.indexOf("--state") + 1] ?? "?"], deps(due)), 0, "the seed act, by the tree's own form");
  const real = globalThis.fetch, seen: string[] = [];
  globalThis.fetch = ((input: string | URL) => { seen.push(new URL(String(input)).hostname); return Promise.reject(new Error("no network")); }) as typeof globalThis.fetch;
  try {
    assert.deepEqual([await tick.tickMain(argv, deps(due - 1)), out.at(-1)], [0, `bell/tick: nothing_due unit-${D} due_at=${new Date(due).toISOString()}`], "a slot before the due instant: exit 0, nothing");
    assert.deepEqual([await tick.tickMain(argv, deps(due)), err.at(-1), seen], [1, "bell/tick: refused cash_cost_cap: the cost query failed: Error", ["hist.databento.com"]],
      "at the due instant the tick reaches its first network act, the cash leg's free cost query, through close.ts");
  } finally { globalThis.fetch = real; }
  const state = argv[argv.indexOf("--state") + 1] ?? "?", handoff = argv[argv.indexOf("--handoff") + 1] ?? "?";
  assert.deepEqual(JSON.parse(readFileSync(join(state, "state", "attempts.json"), "utf8")), { [D]: 1 }, "one attempt counted on D, in the private side");
  assert.equal(existsSync(join(handoff, `.tmp-unit-${D}`)), false, "no staging left in the handoff directory");
  assert.equal(digest(), before, "the tree is left byte-identical (read-only to the unit)");
});

// killer: deploy/monark-bell-collect.timer:16 CONST "OnCalendar=*-*-* 09:45:00 UTC" -> "OnCalendar=*-*-* 10:45:00 UTC"
test("bell_collect_slots_follow_every_unit_due_instant_within_one_hour", () => {
  exists();
  const { sections, list } = unitOfFile(C().timer), t = inSection(list, "Timer");
  assert.deepEqual(sections, ["Unit", "Timer", "Install"]);
  closedSet(t.filter((d) => d.key !== "OnCalendar"), { AccuracySec: "1s", RandomizedDelaySec: "0", Persistent: "true", Unit: basename(C().unit) }, "[Timer]");
  closedSet(inSection(list, "Install"), { WantedBy: "timers.target" }, "[Install]");
  const cal = t.filter((d) => d.key === "OnCalendar").map((d) => d.value);
  assert.deepEqual(cal, SLOTS, "four UTC slots, one expression per line (DC-4 cadence, PLAN-P3 C3-2)");
  const slotMin = cal.map((c) => { const m = /^\*-\*-\* (\d{2}):(\d{2}):00 UTC$/.exec(c); assert.ok(m !== null, c); return Number(m[1]) * 60 + Number(m[2]); });
  const acc = Number(/^(\d+)s$/.exec(one(t, "AccuracySec"))?.[1] ?? NaN) * 1000, rnd = Number(one(t, "RandomizedDelaySec")) * 1000;
  // DC-4: for every unit of the committed calendar (2025-2026, both clock regimes, both SIP regimes around SIP_DAY_REGIMES[1].fromET), a slot
  // starts the tick less than one hour after the unit's due instant, the timer's accuracy and randomized delay included.
  const sipFrom = SIP_DAY_REGIMES[1]?.fromET ?? "?", forms = new Set<string>();
  let d: string = CALENDAR_RANGE.fromISO, n = 0, sipAfter = 0, worst = 0;
  while (!isTradingDay(d)) d = new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  for (; nextTradingDay(d) <= CALENDAR_RANGE.toISO; d = nextTradingDay(d)) {
    const due = dueInstant(unitOf(d), UNIT_DUE_MARGIN_MIN), day0 = Math.floor(due / 86_400_000) * 86_400_000;
    const next = Math.min(...[0, 1].flatMap((j) => slotMin.map((m) => day0 + j * 86_400_000 + m * 60_000)).filter((s) => s >= due));
    const late = next - due + acc + rnd;
    assert.ok(late >= 0 && late < 3_600_000, `unit-${d}: due ${new Date(due).toISOString()}, the next slot ${String(late / 1000)} s later`);
    worst = Math.max(worst, late); forms.add(new Date(due).toISOString().slice(11, 16)); n += 1; if (d >= sipFrom) sipAfter += 1;
  }
  assert.deepEqual([...forms].sort(), ["08:30", "09:30", "20:00", "21:00"], "the four forms of a due instant: 16:00 ET and 04:30 ET, summer and winter time");
  assert.ok(n === 500 && sipAfter > 0 && sipAfter < n, `${String(n)} units, ${String(sipAfter)} from the SIP switch of ${sipFrom} on`);
  assert.equal(worst, 15 * 60_000 + 1000, "the worst start: 15 min after its due instant, plus the 1 s accuracy");
});

// killer: deploy/monark-bell-collect.service:34 CONST "TimeoutStartSec=7200" -> "TimeoutStartSec=3600"
test("bell_collect_timeout_covers_the_worst_tick", () => {
  exists();
  // C3-3, dated line of 2026-10-15 10:1x UTC: the unit's bound IS the constant the tick reads to refuse a cycle straddle (a tick that may
  // outlive its operator's cycle); 1.25 times the worst tick measured in rehearsal replaces it by a dated line (BELL-TICK-TIMEOUT-MEASURE-1).
  assert.equal(Number(one(service(C().unit), "TimeoutStartSec")), TICK_TIMEOUT_START_SEC, "TimeoutStartSec == TICK_TIMEOUT_START_SEC");
  assert.ok(read("apps/bell/src/tick.ts").includes("if (nowMs + TICK_TIMEOUT_START_SEC * 1000 >= next) refuse(\"cycle_boundary_straddle\""), "the tick bounds its run by the same constant");
  assert.ok(TICK_TIMEOUT_START_SEC >= 1.25 * 303, "at least 1.25 times the longest trajectory production measured (G0 M-22: 5 min 03 s; DC-4, C3-3), until BELL-TICK-TIMEOUT-MEASURE-1");
});

// killer: deploy/monark-bell-collect.service:18 SDL "OnFailure=monark-bell-publish.service" -> ""
test("bell_publish_trigger_follows_the_collect", () => {
  exists();
  // C3-1 (faits LSP-8): OnSuccess= on the "inactive" state, OnFailure= on "failed": the publisher follows every end of the tick, a refusal
  // that exits 1 (handoff_backlog, stalled_unit) included, so the backlog drains. Both name the same unit, the committed publisher.
  const u = inSection(unitOfFile(C().unit).list, "Unit");
  assert.deepEqual([u.filter((d) => d.key === "OnSuccess").map((d) => d.value), u.filter((d) => d.key === "OnFailure").map((d) => d.value)],
    [[basename(C().publish)], [basename(C().publish)]], "OnSuccess= and OnFailure= name the publisher, once each");
  assert.equal(one(inSection(unitOfFile(C().timer).list, "Timer"), "Unit"), basename(C().unit), "the timer starts the collection, never the publisher");
  // The publisher has no trigger of its own: no timer, no [Install]; it runs the idempotent --handoff form (exit 0 on nothing to publish).
  assert.deepEqual([existsSync(REPO + C().publish.replace(/\.service$/, ".timer")), unitOfFile(C().publish).sections], [false, ["Unit", "Service"]], "no timer, no [Install]");
  const exec = one(service(C().publish), "ExecStart");
  assert.equal(exec.slice(exec.indexOf("/apps/")), `/apps/bell/scripts/bell-publish.mjs --handoff ${L.handoff.path} --status ${L.status.path} --state ${L.state.path}`, "the --handoff form on the layout");
});

// killer: deploy/monark-bell-publish.service:44 CONST "ReadWritePaths=/var/lib/monark-bell /var/lib/monark-bell-status" -> "ReadWritePaths=/var/lib/monark-bell /var/lib/monark-bell-status /var/lib/monark-bell-handoff"
test("bell_two_units_share_no_writable_path", () => {
  exists();
  const pub = service(C().publish), col = service(C().unit);
  assert.deepEqual([one(pub, "User"), one(col, "User")], [PUBLISH_USER, COLLECT_USER], "two users");
  const [wp, wc] = [words(pub, "ReadWritePaths"), words(col, "ReadWritePaths")];
  assert.deepEqual([wp, wc], [[L.state.path, L.status.path], [L.collect.path, L.handoff.path]], "each writes its own side: state and status; private side and handoff");
  for (const a of wp) for (const b of wc) assert.ok(!under(a, b) && !under(b, a), `no writable path shared: ${a} and ${b}`);
  assert.deepEqual([L.handoff.owner, L.status.owner], [COLLECT_USER, PUBLISH_USER], "the handoff is the collection's, the status the publisher's (BELL_LAYOUT)");
  for (const u of [pub, col]) assert.deepEqual(u.filter((d) => /^(BindPaths|BindReadOnlyPaths|ReadOnlyPaths|StateDirectory|RuntimeDirectory)$/.test(d.key)), [], "no other path directive");
});

// killer: deploy/monark-bell-publish.service:47 CONST "InaccessiblePaths=/var/lib/monark-bell-collect /etc/monark/bell-collect" -> "InaccessiblePaths=/var/lib/monark-bell-collect/state /etc/monark/bell-collect"
test("bell_units_mask_each_other_private_dir_by_one_name", () => {
  exists();
  // C-7 of the G0: one mask per private directory, each a top-level name with everything below it, no "-" (each exists, lot 5b step 1), and
  // no path of the unit nested under a mask (systemd.exec refuses a ReadOnlyPaths= under an InaccessiblePaths= parent).
  const pub = service(C().publish), col = service(C().unit);
  assert.deepEqual([words(col, "InaccessiblePaths"), words(pub, "InaccessiblePaths")], [[L.state.path, C().key], [L.collect.path, C().secrets]], "one name per private directory");
  assert.ok(under(C().env, C().secrets) && C().secrets !== C().key && !under(C().secrets, C().key) && !under(C().key, C().secrets), "the collection's secrets, apart from the key");
  for (const [u, rel] of [[col, C().unit], [pub, C().publish]] as const) {
    const masks = words(u, "InaccessiblePaths"), paths = u.filter((d) => d.key !== "InaccessiblePaths").flatMap((d) => tokens(d.value)).filter((x) => x.startsWith("/"));
    assert.ok(masks.length === 2 && masks.every((m) => /^\/[a-z]/.test(m)), `${rel}: two masks, no "-" or "+"`);
    assert.deepEqual(paths.filter((p) => masks.some((m) => under(p, m))), [], `${rel}: no other path of the unit under a mask`);
    assert.deepEqual(masks.filter((m) => masks.some((n) => n !== m && under(m, n))), [], `${rel}: no mask nested in another`);
  }
});

// killer: deploy/monark-bell-collect.service:38 SDL "SupplementaryGroups=bell-handoff" -> ""
test("bell_collect_unit_reads_status_through_the_handoff_group", () => {
  exists();
  // DC-3: the collection reads the publisher's status (refused.jsonl, published.jsonl, start) through the handoff group, read-only (it is not
  // a writable path, and ProtectSystem=strict makes the rest of the system read-only); the publisher reads the handoff the same way.
  const col = service(C().unit), pub = service(C().publish), exec = one(col, "ExecStart").split(" ");
  assert.deepEqual([one(col, "SupplementaryGroups"), one(pub, "SupplementaryGroups")], [BELL_HANDOFF_GROUP, BELL_HANDOFF_GROUP], "both units join the handoff group");
  assert.deepEqual([L.status.group, L.status.mode, L.handoff.group, L.handoff.mode], [BELL_HANDOFF_GROUP, 0o2750, BELL_HANDOFF_GROUP, 0o2750], "group r-x, others nothing, setgid");
  assert.equal(exec[exec.indexOf("--status") + 1], L.status.path, "the tick's --status is the status directory");
  assert.deepEqual([words(col, "ReadWritePaths").some((p) => under(L.status.path, p)), one(col, "ProtectSystem")], [false, "strict"], "read-only to the collection");
  assert.equal(L.status.owner === COLLECT_USER || L.status.group === COLLECT_USER, false, "the collection reads it as a member of the group, not as its owner");
});
