/**
 * Root tests of the RUNBOOK of Bell's scheduled collection (G0 BELL-COLLECT-TIMER-1 DC-3, DC-4 and section 4 "P3", lot 3c; PLAN-P3 C3-9,
 * C3-10). Governance-only: docs/ and deploy/ are not exported. The acts of docs/RUNBOOK-bell.md are read as written and bound to what they
 * run: each systemd-run job to the COMMITTED unit of its user (a closed list of the unit's properties, each value the unit's; the unit's
 * other [Service] keys declared not carried), the key rotation to both units and their timer stopped first, each lock release to the
 * unit's user, the collection's secrets to the prohibition passage only, and the abandon act to the closed --abandon form of
 * apps/bell/src/tick.ts, run here by the real tickMain on a temporary layout, both ways of C3-10. Calques: test/dojo-publish-deploy.test.ts
 * (dojo_runbook_jobs_carry_the_unit_properties, dojo_runbook_removes_the_packet_only_without_a_writer). Each test opens on an assertion
 * (a section or a job absent before the lot is a named red, never a TypeError). Synthetic values only; no `any`.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { ATTEMPT_BUDGET, BELL_COLLECT_ENV_FILE, BELL_COLLECT_ENV_KEYS, BELL_COLLECT_SECRETS_DIR, BELL_COLLECT_TIMER, BELL_COLLECT_TREE_PATHS, BELL_COLLECT_UNIT,
  BELL_FLOORS, BELL_LAYOUT, BELL_LEGACY_ORIGIN, BELL_OPERATORS, BELL_PUBLIC_ORIGIN, BELL_PUBLISH_UNIT } from "../scripts/bell-deploy.mjs";
import { BELL_TREE_PATHS } from "../scripts/verify-bell.mjs";
import { tickMain, type TickDeps } from "../apps/bell/src/tick.ts";
import { nextTradingDay } from "../apps/bell/src/sessions.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const LF = "\n", RUNBOOK = "docs/RUNBOOK-bell.md", L = BELL_LAYOUT, UNLOCK_TOOL = "packages/rpc-guard/bin/rpc-guard.mjs";
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
const COLLECT = posix.basename(BELL_COLLECT_UNIT), PUBLISH = posix.basename(BELL_PUBLISH_UNIT), TIMER = posix.basename(BELL_COLLECT_TIMER);
/** The stop predicate of a unit, the calque's (dojo IDLE): a Type=oneshot unit that runs reads `activating`, never `active`. */
const IDLE = (u: string): string => `systemctl is-active ${u} | grep -qx -e inactive -e failed`;
const BOTH = `${IDLE(COLLECT)} && ${IDLE(PUBLISH)}`;
const NEW_KEY = "bell-signing-key-new:/etc/monark/bell/signing-key-new.pem";

interface Directive { key: string; value: string }
/** The [Service] directives of a committed unit, in order (comments and blank lines dropped). */
function serviceOf(rel: string): Directive[] {
  let section = "";
  const out: Directive[] = [];
  for (const line of read(rel).split(LF)) {
    const l = line.trim(), s = /^\[(\w+)\]$/.exec(l), i = l.indexOf("=");
    if (l === "" || l.startsWith("#")) continue;
    if (s !== null) { section = s[1] ?? ""; continue; }
    if (section === "Service" && i > 0) out.push({ key: l.slice(0, i), value: l.slice(i + 1) });
  }
  return out;
}
const one = (svc: readonly Directive[], key: string): string => { const v = svc.filter((d) => d.key === key); assert.equal(v.length, 1, key); return v[0]?.value ?? ""; };
/** The section of the RUNBOOK that opens with `head` (a "## " heading), to the next "## " heading; "" when absent (the caller asserts). */
function section(head: string): string {
  const t = read(RUNBOOK), a = t.indexOf(`${LF}${head}`);
  if (a < 0) return "";
  const b = t.indexOf(`${LF}## `, a + 1);
  return t.slice(a, b < 0 ? undefined : b);
}
/** The remote commands of `t` (newlines read as blanks): the single-quoted argument of each ssh to Bell's host. */
const remotes = (t: string): string[] => t.split(LF).join(" ").split("root@bell.monarkgate.tech '").slice(1).map((x) => x.slice(0, x.indexOf("'")));
/** The RUNBOOK with its two prohibition passages removed (bell_runbook_never_prints_private_key's PROHIBITIONS): the acts. */
const acts = (): string => read(RUNBOOK).replace(/\*\*The private key is never displayed, copied or hashed:\*\*[^.]*\./, "").replace(/\n## Never\n[^#]*/, "");

interface Job { text: string; uid: string; gid: string; flags: string[]; props: [string, string][]; argv: string[] }
/** Blank-separated words; double quotes group and are dropped (`"$C"` is the word `$C`). */
function wordsOf(s: string): string[] {
  const out: string[] = [];
  let cur = "", q = false, any = false;
  for (const c of s) {
    if (c === "\"") { q = !q; any = true; continue; }
    if (c === " " && !q) { if (any) out.push(cur); cur = ""; any = false; continue; }
    cur += c; any = true;
  }
  if (any) out.push(cur);
  return out;
}
/** Every systemd-run job of `t` (newlines read as blanks), from `systemd-run --` to the first ', ;, & or | outside double quotes. */
function jobsOf(t: string): Job[] {
  const flat = t.split(LF).join(" "), out: Job[] = [];
  for (let i = flat.indexOf("systemd-run --"); i >= 0; i = flat.indexOf("systemd-run --", i + 1)) {
    let q = false, j = i;
    for (; j < flat.length; j++) { const c = flat[j]; if (c === "\"") q = !q; else if (!q && (c === "'" || c === ";" || c === "&" || c === "|")) break; }
    const text = flat.slice(i, j).trim(), w = wordsOf(text).slice(1), flags: string[] = [], props: [string, string][] = [];
    let k = 0;
    for (; k < w.length; k++) {
      const x = w[k] ?? "";
      if (x === "-p") { const kv = w[k + 1] ?? ""; k += 1; props.push([kv.slice(0, kv.indexOf("=")), kv.slice(kv.indexOf("=") + 1)]); } else if (x.startsWith("--")) flags.push(x); else break;
    }
    const flag = (f: string): string => flags.find((x) => x.startsWith(`--${f}=`))?.slice(f.length + 3) ?? "";
    out.push({ text, uid: flag("uid"), gid: flag("gid"), flags, props, argv: w.slice(k) });
  }
  return out;
}
/** A job's program in short: the script's file name and its form (`tick.ts --seed`, `rpc-guard.mjs unlock`), or `rm <path>`. */
function kindOf(j: Job): string {
  const [env = "", prog = "", path = "", ...rest] = j.argv;
  if (env !== "/usr/bin/env") return `? ${j.argv.join(" ")}`;
  if (prog === "rm") return `rm ${path}`;
  return `${posix.basename(path)} ${rest.find((x) => ["--seed", "--abandon", "--handoff-start", "--rotate", "unlock"].includes(x)) ?? "?"}`;
}
/** The unit of a job, by its user (User= of each committed unit). */
const unitOfJob = (j: Job): string => [BELL_PUBLISH_UNIT, BELL_COLLECT_UNIT].find((u) => one(serviceOf(u), "User") === j.uid) ?? "?";
/** The unit's properties a job carries (its sandbox and its groups), and the [Service] keys a job never carries: what the unit runs and
 *  when (Type, WorkingDirectory, ExecStart, TimeoutStartSec), its user (carried as --uid and --gid), the publisher's credential (the
 *  rotation job only, below), the collection's secrets (an act never reads them), the publisher's caps (sized with the heap flag of its
 *  ExecStart, ADR "Constantes" C-7). A key of the unit in neither list reddens: a new property of the unit is carried or declared. */
const CARRIED: Readonly<Record<string, readonly string[]>> = {
  [BELL_PUBLISH_UNIT]: ["SupplementaryGroups", "NoNewPrivileges", "ProtectSystem", "ProtectHome", "PrivateTmp", "ReadWritePaths", "InaccessiblePaths", "PrivateNetwork", "UMask"],
  [BELL_COLLECT_UNIT]: ["SupplementaryGroups", "NoNewPrivileges", "ProtectSystem", "ProtectHome", "PrivateTmp", "ReadWritePaths", "InaccessiblePaths", "UMask"] };
const NOT_CARRIED: Readonly<Record<string, readonly string[]>> = {
  [BELL_PUBLISH_UNIT]: ["Type", "WorkingDirectory", "ExecStart", "TimeoutStartSec", "User", "Group", "LoadCredential", "CPUQuota", "MemoryMax", "TasksMax"],
  [BELL_COLLECT_UNIT]: ["Type", "WorkingDirectory", "EnvironmentFile", "ExecStart", "TimeoutStartSec", "User", "Group"] };
/** The jobs of the RUNBOOK, closed, in text order: the seed and its rollback (section 15), the mark (16), the guard's unlock and the removal
 *  of publish.lock (17), the abandon (19), the rotation (R3 of "Key incidents"). */
const JOBS: ReadonlyArray<readonly [string, string]> = [[BELL_COLLECT_UNIT, "tick.ts --seed"], [BELL_COLLECT_UNIT, `rm ${L.collect.path}/state/progress.json`],
  [BELL_PUBLISH_UNIT, "bell-publish.mjs --handoff-start"], [BELL_COLLECT_UNIT, "rpc-guard.mjs unlock"], [BELL_PUBLISH_UNIT, `rm ${L.state.path}/publish.lock`],
  [BELL_COLLECT_UNIT, "tick.ts --abandon"], [BELL_PUBLISH_UNIT, "bell-publish.mjs --rotate"]];

// killer: docs/RUNBOOK-bell.md:896 CONST "systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && " -> ""
test("bell_runbook_stops_both_units_before_rotation", () => {
  // G0 DC-8 (3): the rotation starts by stopping both units and their timer and waits for `inactive`; BELL-STATE-LOCK-1 (i) widened to both.
  const ki = section("## Key incidents"), r0 = ki.indexOf("(R0)"), r1 = ki.indexOf("(R1)"), r5 = ki.indexOf("(R5)");
  assert.ok(ki !== "" && r0 > 0 && r0 < r1 && r1 < r5, "Key incidents: (R0), the stop, before (R1), and (R5) after");
  const stop = remotes(ki.slice(r0, r1));
  assert.deepEqual(stop, [`systemctl is-active ${TIMER}; systemctl stop ${TIMER}; systemctl is-active ${COLLECT} ${PUBLISH}`],
    "(R0): the timer's state read, the timer stopped, then the two units read (a running oneshot is waited, never stopped)");
  const hostActs = remotes(ki.slice(r1, r5));
  assert.equal(hostActs.length, 3, "three host acts between (R1) and (R5): the new key, the rotation job, the key moved");
  for (const r of hostActs) assert.ok(r.startsWith(`${BOTH} && `), `a host act of the rotation opens on both units stopped: ${r.slice(0, 80)}`);
  const restart = ki.indexOf(`systemctl start ${TIMER}`);
  assert.ok(restart > r5 && ki.slice(r5, restart).includes("(R6)"), "the timer starts again at (R6) only, after the verification (R5)");
  assert.ok(ki.includes("only if (R0) read it `active`"), "(R6): only a timer that ran before the rotation starts again");
  // The probe reads the committed keyring (G0 DC-9, M-17): (R2) and (R5) are its update.
  assert.ok(ki.includes("the keyring the probe of part 4 will read (G0 DC-9, M-17)"), "the probe's keyring named at the rotation (the probe is part 4's)");
  // The guard of the former R3 admitted a running oneshot (`activating` is not `active`): no such guard is left anywhere.
  assert.equal(/is-active[^']*"\s*!=\s*active/.test(read(RUNBOOK)), false, "no `!= active` guard");
  for (const bad of [IDLE(COLLECT), IDLE(PUBLISH)]) {
    const r = hostActs[1] ?? "";
    assert.equal(r.replace(`${bad} && `, "").startsWith(`${BOTH} && `), false, `the check reddens without: ${bad}`);
  }
});

// killer: docs/RUNBOOK-bell.md:925 CONST "`/etc/monark/bell-collect/collect.env`" -> "`collect.env`"
test("bell_runbook_never_prints_secrets_nor_private_key", () => {
  // The collection's secrets (its EnvironmentFile, in the directory masked from the publisher) are named only to forbid them (## Never),
  // and each act of the lot hands no secret to its job: no environment, no credential but the rotation's two keys.
  const never = section("## Never"), text = acts();
  assert.ok(never.includes(`\`${BELL_COLLECT_ENV_FILE}\``) && never.includes(`\`${BELL_COLLECT_SECRETS_DIR}\``), "## Never names the collection's secrets file and directory");
  assert.ok(never.includes("`EnvironmentFile=` of the collection handed to a job"), "## Never forbids handing the secrets to a job");
  const jobs = jobsOf(text), masked = (t: string): string => jobs.reduce((s, j) => s.split(j.text).join(""), t);
  assert.ok(jobs.length > 0, "the RUNBOOK's jobs");
  // Every mention of the secrets directory outside the prohibitions is the mask of a publisher job (InaccessiblePaths=), nothing else.
  const uses = (t: string): string[] => [...t.matchAll(/\/etc\/monark\/bell-collect\b[^\s'"`;|&)]*/g)].map((m) => m[0]);
  assert.deepEqual(uses(masked(text)), [], "no use of the secrets directory outside a job");
  for (const j of jobs) {
    const named = [...j.props.filter(([k]) => k !== "InaccessiblePaths").map(([, v]) => v), ...j.argv].flatMap(uses);
    assert.deepEqual(named, [], `${kindOf(j)}: the secrets directory only as a mask`);
    assert.deepEqual(j.props.map(([k]) => k).filter((k) => /Environment|Credential/.test(k)), kindOf(j) === "bell-publish.mjs --rotate" ? ["LoadCredential", "LoadCredential"] : [],
      `${kindOf(j)}: no environment, no credential but the rotation's keys`);
    assert.deepEqual(j.flags.filter((f) => !["--wait", "--pipe", "--collect"].includes(f) && !/^--[ug]id=/.test(f)), [], `${kindOf(j)}: no -E, --setenv or --property`);
  }
  // The sections of the lot (14 to 21) name no key of the EnvironmentFile, no signing credential and no path under Bell's key directory.
  const lot = ["14", "15", "16", "17", "18", "19", "20", "21"].map((n) => section(`## ${n}. `));
  assert.deepEqual(lot.map((s) => s === ""), lot.map(() => false), "sections 14 to 21");
  for (const s of lot) {
    assert.deepEqual([...BELL_COLLECT_ENV_KEYS].filter((k) => s.includes(k)), [], `${s.slice(1, 40)}: no key of the EnvironmentFile`);
    assert.deepEqual([s.includes("bell-signing-key"), /\/etc\/monark\/bell\//.test(s)], [false, false], `${s.slice(1, 40)}: no credential, no key path`);
  }
  for (const bad of [`ssh h 'cat ${BELL_COLLECT_ENV_FILE}'`, `x 'sha256sum ${BELL_COLLECT_SECRETS_DIR}/*'`]) assert.ok(uses(bad).length > 0, `the check reddens on: ${bad}`);
  const envJob = jobsOf(`x '${BOTH} && systemd-run --wait --pipe --collect --uid=bell-collect --gid=bell-collect -p EnvironmentFile=${BELL_COLLECT_ENV_FILE} /usr/bin/env node t'`)[0];
  assert.deepEqual(envJob?.props.map(([k]) => k), ["EnvironmentFile"], "the check reads a job's environment");
});

// killer: docs/RUNBOOK-bell.md:722 CONST "--uid=bell-collect --gid=bell-collect" -> "--uid=root --gid=root"
test("bell_runbook_unlocks_as_the_unit_user_never_root", () => {
  // DC-4 (SIGTERM, lock_held) and the lock of the publisher: a lock left held (SIGKILL, OOM, a power cut) is released by the unit's own
  // user, in a job, the unit stopped: the guard's locks by the served `unlock` (a ledgered line), publish.lock by its removal.
  const s = section("## 17. "), jobs = jobsOf(s), rem = remotes(s);
  assert.ok(s !== "", "section 17: a lock left held");
  const col = serviceOf(BELL_COLLECT_UNIT), pub = serviceOf(BELL_PUBLISH_UNIT), root = one(col, "WorkingDirectory");
  const ledger = one(col, "ExecStart").split(" ").at(-1) ?? "?", floors = [...new Set(BELL_OPERATORS.map((op) => Object.entries(BELL_FLOORS).find(([k]) => k === op)?.[1]))];
  assert.deepEqual([ledger, floors.length, typeof floors[0]], [`${L.collect.path}/ledger`, 1, "number"], "the ledger root: the last value of the tick's argv (--ledger-dir); one floor of BELL_FLOORS for every operator of the loop");
  assert.deepEqual(jobs.map(kindOf), ["rpc-guard.mjs unlock", `rm ${L.state.path}/publish.lock`], "two releases, each a job");
  const [unlock, lock] = jobs;
  assert.deepEqual([unlock?.uid, unlock?.gid, lock?.uid, lock?.gid], [one(col, "User"), one(col, "Group"), one(pub, "User"), one(pub, "Group")], "each as its unit's user, never root");
  assert.deepEqual(unlock?.argv, ["/usr/bin/env", "node", `${root}/${UNLOCK_TOOL}`, "--ledger-dir", ledger, "--floor", String(floors[0]), "unlock", "--cycle", "$C", "--op", "$op",
    "--reason", "runbook-lock-held-unlock"], "the served unlock of the tree, per operator, on the unit's ledger, the floor of BELL_FLOORS");
  assert.ok(BELL_COLLECT_TREE_PATHS.includes(UNLOCK_TOOL), "the served CLI is in the collection's tree (no act runs a file absent from it)");
  // Each release runs inside a remote command that opens on the stop predicate: the guard's, the collection; publish.lock, both units.
  const holder = (j: Job | undefined): string => rem.find((r) => j !== undefined && r.includes(j.text)) ?? "";
  assert.ok(holder(unlock).startsWith(`${IDLE(COLLECT)} && for op in ${BELL_OPERATORS.join(" ")}; do `), "the guard's unlock: the collection stopped, each operator");
  assert.ok(holder(lock).startsWith(`${BOTH} && systemd-run `), "publish.lock: both units stopped");
  // Never root: no unlock and no removal of a lock outside a job of the unit's user, in the whole RUNBOOK (prohibitions apart).
  const outside = (t: string): string[] => {
    const own = jobsOf(t).filter((j) => j.uid !== "" && j.uid !== "root" && j.uid !== "0"), rest = own.reduce((x, j) => x.split(j.text).join(""), t);
    return [...rest.matchAll(/rpc-guard\.mjs [^'`]*\bunlock\b|\brm( +-[a-zA-Z]+)* +([^ ;&|'`]*\.lock\b|"?\$\{?\w+\}?"?)/g)].map((m) => m[0]);
  };
  assert.deepEqual(outside(acts()), [], "every unlock and every removal of a lock is a job of the unit's user");
  for (const bad of [`x '${IDLE(COLLECT)} && sudo -u bell-collect /usr/bin/env node ${root}/${UNLOCK_TOOL} --ledger-dir ${ledger} --floor 0 unlock --cycle c --op helius'`,
    `x '${BOTH} && rm ${L.state.path}/publish.lock'`, `x '${BOTH} && systemd-run --wait --pipe --collect --uid=root --gid=root /usr/bin/env rm ${L.state.path}/publish.lock'`, `x '${BOTH} && P=${L.state.path}/publish.lock && rm -f "$P"'`]) {
    assert.ok(outside(bad).length > 0, `the check reddens on: ${bad.slice(0, 90)}`);
  }
});

// killer: docs/RUNBOOK-bell.md:686 CONST "-p SupplementaryGroups=bell-handoff " -> ""
test("bell_runbook_jobs_carry_the_unit_properties", () => {
  // Calque of dojo_runbook_jobs_carry_the_unit_properties: each systemd-run job of the RUNBOOK carries, closed, the sandbox and the groups
  // of the COMMITTED unit of its user, each value the unit's; the rotation adds the publisher's credential and the new key's, nothing else.
  const jobs = jobsOf(acts());
  assert.deepEqual(jobs.map((j) => [unitOfJob(j), kindOf(j)]), JOBS, "the jobs of the RUNBOOK, closed, each bound to its unit by its user");
  for (const u of [BELL_PUBLISH_UNIT, BELL_COLLECT_UNIT]) {
    const keys = new Set(serviceOf(u).map((d) => d.key));
    assert.deepEqual([...keys].sort(), [...(CARRIED[u] ?? []), ...(NOT_CARRIED[u] ?? [])].sort(), `${u}: each [Service] key carried or declared not carried`);
  }
  for (const j of jobs) {
    const u = unitOfJob(j), svc = serviceOf(u), what = `${kindOf(j)} (${posix.basename(u)})`, own = j.props.filter(([k]) => k !== "LoadCredential");
    assert.deepEqual([j.flags.slice(0, 3), j.uid, j.gid], [["--wait", "--pipe", "--collect"], one(svc, "User"), one(svc, "Group")], `${what}: waited, piped, collected, as the unit's user`);
    assert.deepEqual(own.map(([k]) => k).sort(), [...(CARRIED[u] ?? [])].sort(), `${what}: the unit's properties, closed, each once`);
    for (const [k, v] of own) assert.equal(v, one(svc, k), `${what}: ${k} is the unit's`);
    const creds = j.props.filter(([k]) => k === "LoadCredential").map(([, v]) => v);
    assert.deepEqual(creds, kindOf(j) === "bell-publish.mjs --rotate" ? [one(svc, "LoadCredential"), NEW_KEY] : [], `${what}: the credentials`);
    // The program: a script of the unit's own tree, or rm of a file under one of the unit's writable paths.
    const [, prog = "", path = ""] = j.argv, root = one(svc, "WorkingDirectory"), tree = u === BELL_PUBLISH_UNIT ? BELL_TREE_PATHS : BELL_COLLECT_TREE_PATHS;
    if (prog === "node") assert.ok(path.startsWith(`${root}/`) && tree.includes(path.slice(root.length + 1)), `${what}: ${path} is in the unit's tree`);
    else assert.ok(prog === "rm" && one(svc, "ReadWritePaths").split(" ").some((w) => path.startsWith(`${w}/`)), `${what}: rm under a writable path of the unit`);
  }
  // The checker reddens on a property of another value, a property more, a property missing (the former R3: yes for true, no groups).
  const r3 = jobs.find((j) => kindOf(j) === "bell-publish.mjs --rotate")?.text ?? "";
  for (const [from, to] of [["-p UMask=0022", "-p UMask=0027"], ["-p PrivateTmp=true", "-p PrivateTmp=true -p MemoryMax=1G"], ["-p SupplementaryGroups=bell-handoff ", ""],
    ["-p NoNewPrivileges=true", "-p NoNewPrivileges=yes"]] as const) {
    const bad = jobsOf(`x '${r3.replace(from, to)}'`)[0], props = (bad?.props ?? []).filter(([k]) => k !== "LoadCredential");
    const same = props.length === (CARRIED[BELL_PUBLISH_UNIT] ?? []).length && props.every(([k, v]) => (CARRIED[BELL_PUBLISH_UNIT] ?? []).includes(k) && v === one(serviceOf(BELL_PUBLISH_UNIT), k));
    assert.equal(r3.includes(from) && !same, true, `the check reddens on: ${from} -> ${to}`);
  }
});

// killer: docs/RUNBOOK-bell.md:780 CONST "--reason <code> " -> ""
test("bell_runbook_abandon_act_records_reason_and_advances_once", async () => {
  // C3-9, C3-10: the act takes the unit stalled after its budget (stalled_unit, the next unit) or the unit the publisher refused past its
  // budget (publisher_refused:<code>, recorded in state/stalled.json); it records the reason once and advances progress.json once, for the
  // next unit only. The tick's clock probe is closed by default: until CLOCK-PROBE-FORM-1 the act refuses clock_unsynced, writing nothing.
  const s = section("## 19. "), seedS = section("## 15. ");
  assert.ok(s !== "" && seedS !== "", "sections 15 (the seed) and 19 (the abandon)");
  for (const x of ["`stalled_unit`", "`publisher_refused:<code>`", "`state/stalled.json`", "`state/abandoned.jsonl`", "`unit-<D>.abandoned`", "CLOCK-PROBE-FORM-1",
    "`bell/tick: refused clock_unsynced: the host clock is not synchronized`", "`bell/tick: abandoned unit-<D> reason=<code>`",
    "`bell/tick: refused abandon_refused: unit-<D> is not the stalled unit`"]) assert.ok(s.includes(x), `section 19 names ${x}`);
  const col = serviceOf(BELL_COLLECT_UNIT), tick = `${one(col, "WorkingDirectory")}/apps/bell/src/tick.ts`;
  const [act] = jobsOf(s), [seed] = jobsOf(seedS).filter((j) => kindOf(j) === "tick.ts --seed");
  assert.deepEqual([jobsOf(s).length, act?.argv.slice(0, 3), act?.argv.slice(3).join(" ")], [1, ["/usr/bin/env", "node", tick], `--abandon <D> --reason <code> --state ${L.collect.path} --handoff ${L.handoff.path}`],
    "one act, the closed --abandon form of the tick (DC-4) on the directories of BELL_LAYOUT");
  assert.ok(remotes(s).some((r) => act !== undefined && r.startsWith(`${IDLE(COLLECT)} && systemd-run `) && r.includes(act.text)), "the act runs the collection stopped");
  assert.deepEqual(seed?.argv.slice(2).join(" "), `${tick} --seed <D> --state ${L.collect.path}`, "the seed act of section 15");
  // The acts as written, run by the real tickMain on a temporary layout (<D>, <code> substituted; absolute paths under a root).
  const D = "2026-10-02", D2 = nextTradingDay(D), code = "close_ref_missing", t0 = Date.parse("2026-10-06T12:00:00Z");
  const layout = (): { host: (p: string) => string; state: string; handoff: string } => {
    const R = mkdtempSync(join(tmpdir(), "bell-runbook-abandon-")), host = (p: string): string => (p.startsWith("/") ? join(R, ...p.split("/").filter((x) => x !== "")) : p);
    roots.push(R);
    for (const x of Object.values(L)) mkdirSync(host(x.path), { recursive: true });
    return { host, state: host(L.collect.path), handoff: host(L.handoff.path) };
  };
  const argvOf = (j: Job | undefined, host: (p: string) => string): string[] => (j?.argv.slice(3) ?? []).map((x) => (x === "<D>" ? D : x === "<code>" ? code : host(x)));
  const out: string[] = [], err: string[] = [];
  const deps = (synced: boolean, now = t0): TickDeps => ({ env: {}, now: () => now, ...(synced ? { clockSynced: () => true } : {}), out: (x) => { out.push(x); }, err: (x) => { err.push(x); } });
  const files = (h: { state: string; handoff: string }): string[] => [join(h.state, "state"), h.handoff].flatMap((d) => readdirSync(d).sort().map((f) => `${f}:${readFileSync(join(d, f), "utf8")}`));
  const w = (h: { state: string }, f: string, o: unknown): void => { writeFileSync(join(h.state, "state", f), `${JSON.stringify(o)}\n`); };
  const reason = (h: { state: string }): unknown[] => readFileSync(join(h.state, "state", "abandoned.jsonl"), "utf8").split(LF).filter((x) => x !== "").map((x) => JSON.parse(x) as unknown);
  const refusedLine = `bell/tick: refused abandon_refused: unit-${D} is not the stalled unit`;
  // Way 1: the next unit stalled (its budget spent; the tick's own attempts form).
  const a = layout();
  assert.equal(await tickMain(argvOf(seed, a.host), deps(false)), 0, err.at(-1));
  w(a, "attempts.json", { [D]: ATTEMPT_BUDGET });
  const before = files(a);
  assert.deepEqual([await tickMain(argvOf(act, a.host), deps(false)), err.at(-1), files(a)], [1, "bell/tick: refused clock_unsynced: the host clock is not synchronized", before],
    "the probe closed by default: refused, nothing written");
  assert.deepEqual([await tickMain(argvOf(act, a.host), deps(true)), out.at(-1)], [0, `bell/tick: abandoned unit-${D} reason=${code}`], err.at(-1));
  const progress = readFileSync(join(a.state, "state", "progress.json"), "utf8");
  assert.deepEqual([reason(a), (JSON.parse(progress) as { last_unit: string }).last_unit, existsSync(join(a.handoff, `unit-${D}.abandoned`))],
    [[{ unit: D, reason: code, abandoned_at: new Date(t0).toISOString() }], D, true], "the reason recorded, the tombstone, the progress advanced to D");
  assert.deepEqual([await tickMain(argvOf(act, a.host), deps(true, t0 + 60_000)), err.at(-1), readFileSync(join(a.state, "state", "progress.json"), "utf8"), reason(a).length],
    [1, refusedLine, progress, 1], "advanced once: the act again is refused, nothing moves");
  // Way 2: the unit the publisher refused past its budget, behind the progress (state/stalled.json names it; the tick's own forms).
  const b = layout();
  assert.equal(await tickMain(argvOf(seed, b.host), deps(false)), 0, err.at(-1));
  w(b, "progress.json", { seed: D, last_unit: D2, bundle: `unit-${D2}`, manifest_sha256: "0".repeat(64) });
  w(b, "attempts.json", { [D]: ATTEMPT_BUDGET, [D2]: 1 });
  w(b, "stalled.json", { unit: D, code: "bell_sha_mismatch" });
  const p2 = readFileSync(join(b.state, "state", "progress.json"), "utf8");
  assert.deepEqual([await tickMain(argvOf(act, b.host), deps(true)), out.at(-1)], [0, `bell/tick: abandoned unit-${D} reason=${code}`], err.at(-1));
  assert.deepEqual([reason(b).length, existsSync(join(b.state, "state", "stalled.json")), readFileSync(join(b.state, "state", "progress.json"), "utf8")], [1, false, p2],
    "the reason recorded once, the record consumed, the progress never moved back");
  assert.deepEqual([await tickMain(argvOf(act, b.host), deps(true, t0 + 60_000)), err.at(-1)], [1, refusedLine], "abandoned once");
});

// killer: docs/RUNBOOK-bell.md:686 CONST "--status /var/lib/monark-bell-status'" -> "--status /var/lib/monark-bell'"
test("bell_runbook_mark_rotation_and_rescue_are_the_closed_forms", () => {
  // Review of lot 3c, m-5: the mark (section 16, irreversible) and the rotation (R3) run the closed forms of bell-publish.mjs (handoffForm:
  // --handoff-start <D> --handoff <dir> --status <dir>; --rotate --state <dir>) on the directories of BELL_LAYOUT; the rescue of step 10
  // reads the timer, stops it, and starts the publisher only behind the collection's stop predicate.
  const jobs = jobsOf(acts()), pub = `${one(serviceOf(BELL_PUBLISH_UNIT), "WorkingDirectory")}/apps/bell/scripts/bell-publish.mjs`;
  const text = (k: string): string => jobs.filter((j) => kindOf(j) === k).map((j) => j.text).join(" | ");
  const argvOf = (t: string): string => jobsOf(`x '${t}'`).map((j) => j.argv.join(" ")).join(" | ");
  const mark = text("bell-publish.mjs --handoff-start"), rotate = text("bell-publish.mjs --rotate");
  const WANT = [`/usr/bin/env node ${pub} --handoff-start <mark> --handoff ${L.handoff.path} --status ${L.status.path}`, `/usr/bin/env node ${pub} --rotate --state ${L.state.path}`];
  assert.deepEqual([argvOf(mark), argvOf(rotate)], WANT, "the mark and the rotation: one job each, the closed form on the directories of BELL_LAYOUT");
  const ten = section("## 10. "), rescue = remotes(ten), RESCUE = `systemctl is-active ${TIMER}; systemctl stop ${TIMER}; if ${IDLE(COLLECT)}; then systemctl start ${PUBLISH}; `;
  assert.deepEqual([ten !== "", rescue.length, (rescue[0] ?? "").startsWith(RESCUE)], [true, 1, true], "step 10: one remote command, the publisher started only behind the stop predicate");
  for (const [t, from, to, want] of [[mark, `--status ${L.status.path}`, `--status ${L.state.path}`, WANT[0]], [rotate, `--state ${L.state.path}`, `--state ${L.status.path}`, WANT[1]],
    [mark, " --handoff-start", ` --handoff ${L.handoff.path} --state ${L.state.path} --status ${L.status.path} --handoff-start`, WANT[0]]] as const) {
    assert.equal(t.split(from).length === 2 && argvOf(t.replace(from, to)) !== want, true, `the check reddens on: ${from} -> ${to}`);
  }
  assert.equal((rescue[0] ?? "").replace(`if ${IDLE(COLLECT)};`, "if true;").startsWith(RESCUE), false, "the check reddens on a rescue without the predicate");
});

// killer: docs/RUNBOOK-bell.md:979 CONST "never names it by Bell's public name" -> "never names it `bell.monarkgate.tech`"
test("bell_runbook_probe_section_never_names_bells_public_host", () => {
  // G2 of part 4, nit-2 (PLAN-P4 C4-10): section 22 acts on the former host, read as $FORMER, never by Bell's public names (the host names of
  // the two origins of bell-deploy.mjs, which step 9 of lot 5b moves to the new host), and writes no IPv4 address.
  const s22 = section("## 22. "), names = [...new Set([BELL_PUBLIC_ORIGIN, BELL_LEGACY_ORIGIN].map((o) => new URL(o).hostname))];
  assert.deepEqual([s22.startsWith(`${LF}## 22. The Bell probe on the former host`), s22.includes("FORMER=$(cat /f/tmp/bell-dn/probe-host.txt)"), names.length > 0,
    names.filter((h) => s22.includes(h)), /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(s22)], [true, true, true, [], false], "section 22: the former host by $FORMER, no public name, no address");
});
