// MONARK Bell -- the handoff layout of the collection and the publisher (BELL_LAYOUT of scripts/bell-deploy.mjs), proved with real users and
// groups. Linux and root only (chown, runuser): the CI job g3-bell-handoff-perms makes the two users, the handoff group and a control user
// outside it, runs this file alone as root (npm run test:handoff-perms) and fails on a skip. Each access is tried by a child of its own under
// its user, with the groups runuser gives it, never by root. It proves what the modes give; the publisher's state directory stays 0755 and
// its mask from the collection is the collection unit's InaccessiblePaths=, proved by the test of the lot that commits that unit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, chownSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import * as deploy from "../scripts/bell-deploy.mjs";

type Dir = { path: string; owner: string; group: string; mode: number };
const d = deploy as Record<string, unknown>;
const OUTSIDER = "bell-outsider"; // the control user outside the handoff group, made by the CI job beside the users of the layout
const SETGID = 0o2000, UNIT = "unit-2026-10-14";
/** A root Linux host without the users the CI job makes (a developer's box, the host oracle) skips too: only the job g3-bell-handoff-perms,
 *  which makes them, turns a skip into a red (RECHERCHES, 2026-10-14 23:40 UTC: the trunk's full suite was red on such a host). */
const missing = (): string[] => {
  const users = [String(d.BELL_COLLECT_USER), String(d.BELL_PUBLISH_USER), OUTSIDER].filter((u) => spawnSync("getent", ["passwd", u], { encoding: "utf8" }).status !== 0);
  const groups = [String(d.BELL_HANDOFF_GROUP)].filter((g) => spawnSync("getent", ["group", g], { encoding: "utf8" }).status !== 0);
  return [...users.map((u) => `user ${u}`), ...groups.map((g) => `group ${g}`)];
};
const SKIP = process.platform !== "linux" ? "Linux only: real users and groups" : process.getuid?.() !== 0 ? "root only: chown and runuser"
  : missing().length > 0 ? `the CI job makes the users and the group; absent here: ${missing().join(", ")}` : false;
const uid = (u: string): number => Number(execFileSync("id", ["-u", u], { encoding: "utf8" }).trim());
const gid = (g: string): number => Number(execFileSync("getent", ["group", g], { encoding: "utf8" }).split(":")[2]);
/** One child under `user` (runuser sets its groups from the group database): sh -c `script`, `args` as $1, $2... */
const as = (user: string, script: string, ...args: string[]): { status: number | null; out: string; err: string } => {
  const r = spawnSync("runuser", ["-u", user, "--", "sh", "-c", script, "sh", ...args], { cwd: "/", encoding: "utf8", env: { ...process.env, LC_ALL: "C" }, timeout: 30_000 });
  return { status: r.status, out: r.stdout, err: r.stderr };
};
const ok = (user: string, script: string, ...args: string[]): void => { const r = as(user, script, ...args); assert.equal(r.status, 0, `${user} may: ${script} ${args.join(" ")} (${r.err})`); };
const denied = (user: string, script: string, ...args: string[]): void => {
  const r = as(user, script, ...args);
  assert.ok(r.status !== 0 && r.err.includes("Permission denied"), `${user} must be refused by the modes: ${script} ${args.join(" ")} (status ${String(r.status)}: ${r.err})`);
};
const READ = 'cat "$1" > /dev/null', WRITE = 'touch "$1"', LIST = 'ls "$1" > /dev/null';
const STAGE = 'umask 0027 && mkdir "$1/$2" && echo x > "$1/$2/run.json" && mv "$1/$2" "$1/$3"'; // the collection's UMask=0027

// killer: scripts/bell-deploy.mjs:55 CONST "0o2750" -> "0o750"
test("bell_handoff_permissions_on_linux", { skip: SKIP }, () => {
  const L = d.BELL_LAYOUT as Record<"collect" | "handoff" | "status" | "state", Dir>;
  const [collector, publisher, group, prefix] = [d.BELL_COLLECT_USER, d.BELL_PUBLISH_USER, d.BELL_HANDOFF_GROUP, d.BELL_STAGING_PREFIX] as [string, string, string, string];
  const root = mkdtempSync(join(tmpdir(), "bell-handoff-"));
  try {
    const at = (x: Dir): string => join(root, x.path);
    const make = (p: string, x: Dir, mode = x.mode): void => { mkdirSync(p, { recursive: true }); chownSync(p, uid(x.owner), gid(x.group)); chmodSync(p, mode); };
    for (const x of Object.values(L)) { make(at(x), x); for (let q = dirname(at(x)); q.startsWith(root); q = dirname(q)) chmodSync(q, 0o755); }
    const handoffGid = gid(group), published = join(at(L.status), "published.jsonl");
    assert.deepEqual([collector, publisher, OUTSIDER].map((u) => as(u, "id -G").out.trim().split(/\s+/).map(Number).includes(handoffGid)), [true, true, false],
      "the collection and the publisher are in the handoff group, the control user is not");
    ok(collector, 'umask 0027 && mkdir "$1/ledger" && echo x > "$1/ledger/l.json"', at(L.collect));
    ok(publisher, 'umask 0022 && echo x > "$1"', published);
    ok(publisher, 'umask 0022 && echo x > "$1/timeline.jsonl"', at(L.state));
    // a packet staged INSIDE the handoff directory under the prefix, then renamed: the setgid gives it the handoff group
    ok(collector, STAGE, at(L.handoff), `${prefix}${UNIT}`, UNIT);
    const packet = join(at(L.handoff), UNIT), file = join(packet, "run.json");
    assert.equal(existsSync(join(at(L.handoff), `${prefix}${UNIT}`)), false, "the staged name is gone after the rename");
    assert.deepEqual([statSync(packet).gid, statSync(file).gid, (statSync(packet).mode & SETGID) !== 0, statSync(published).gid], [handoffGid, handoffGid, true, handoffGid],
      "the packet and its file take the handoff group, the packet keeps setgid; the publisher's status file takes it too");
    // cross reading by the handoff group only
    ok(publisher, READ, file);
    ok(collector, READ, published);
    denied(OUTSIDER, READ, file);
    denied(OUTSIDER, READ, published);
    // no cross writing; the publisher never reads the collection's private side
    for (const p of [join(at(L.handoff), "x"), join(packet, "x"), join(at(L.collect), "x")]) denied(publisher, WRITE, p);
    for (const p of [join(at(L.status), "x"), join(at(L.state), "x")]) denied(collector, WRITE, p);
    denied(publisher, LIST, at(L.collect));
    denied(publisher, READ, join(at(L.collect), "ledger", "l.json"));
    // negative control: the same steps in a copy of the handoff directory without setgid: the packet keeps the collection's own group
    const copy = `${at(L.handoff)}-control`;
    make(copy, L.handoff, L.handoff.mode & ~SETGID);
    ok(collector, STAGE, copy, `${prefix}${UNIT}`, UNIT);
    assert.deepEqual([statSync(join(copy, UNIT)).gid, statSync(join(copy, UNIT)).gid === handoffGid], [Number(as(collector, "id -g").out.trim()), false],
      "without setgid the packet keeps the collection's own group");
    denied(publisher, READ, join(copy, UNIT, "run.json"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// The job's own guard, on every host: the step of g3-bell-handoff-perms that runs the test as root, replayed by bash on TAP fixtures in place
// of the run (the oracle's bash on Windows, as in scripts/oracle/run.mjs), is green only when the named test passes, nothing skips and npm exits 0.
const RUN_AS_ROOT = 'sudo env "PATH=$PATH" npm run test:handoff-perms';
const BASH = process.platform === "win32" ? join(execFileSync("git", ["--exec-path"], { encoding: "utf8" }).trim(), "..", "..", "..", "bin", "bash.exe") : "bash";
// killer: .github/workflows/ci.yml:409 CONST "\"$SKIP\" == \"0\"" -> "\"$SKIP\" == \"$SKIP\""
// killer: .github/workflows/ci.yml:409 CONST "\"${STATUS:-0}\" == \"0\" && " -> ""
// killer: .github/workflows/ci.yml:409 CONST "^[1-9][0-9]*$" -> "^[0-9]+$"
// killer: .github/workflows/ci.yml:409 CONST " && grep -qx \"ok 1 - bell_handoff_permissions_on_linux\" handoff-perms.tap" -> ""
// killer: .github/workflows/ci.yml:404 CONST "sudo env \"PATH=$PATH\" " -> ""
test("bell_handoff_job_is_green_only_on_a_pass_by_name_with_no_skip", () => {
  const ci = readFileSync(join(import.meta.dirname, "..", ".github", "workflows", "ci.yml"), "utf8").split(/\r?\n/), at = ci.findIndex((l) => l.trim().startsWith(RUN_AS_ROOT));
  assert.ok(at > 0 && /^\s+run: \|$/.test(ci[at - 1] ?? ""), "a run: block of the workflow opens with the run of the test as root");
  assert.equal(ci.slice(0, at).findLast((l) => /^ {2}\S/.test(l)), "  g3-bell-handoff-perms:", "in the job g3-bell-handoff-perms");
  const ind = ci[at]!.search(/\S/), end = ci.findIndex((l, i) => i > at && l.trim() !== "" && l.search(/\S/) < ind);
  const script = ci.slice(at, end < 0 ? ci.length : end).map((l) => l.slice(ind)).join("\n");
  const tmp = mkdtempSync(join(tmpdir(), "bell-handoff-job-")), NAME = "bell_handoff_permissions_on_linux";
  try {
    const run = (tap: string, code: number): number | null => {
      writeFileSync(join(tmp, "fixture.tap"), tap);
      return spawnSync(BASH, ["-e", "-c", script.replace(RUN_AS_ROOT, `( cat fixture.tap; exit ${String(code)} )`)], { cwd: tmp, encoding: "utf8" }).status;
    };
    const tap = (lines: string, pass: number, fail: number, skip: number): string => `TAP version 13\n${lines}\n# tests ${String(pass + fail + skip)}\n# pass ${String(pass)}\n# fail ${String(fail)}\n# skipped ${String(skip)}\n`;
    assert.deepEqual([run(tap(`ok 1 - ${NAME}`, 1, 0, 0), 0), run(tap(`ok 1 - ${NAME} # SKIP root only`, 0, 0, 1), 0), run(tap(`ok 1 - ${NAME}\nok 2 - other # SKIP`, 1, 0, 1), 0),
      run(tap(`not ok 1 - ${NAME}`, 0, 1, 0), 1), run(tap(`ok 1 - ${NAME}`, 1, 0, 0), 1), run(tap(`ok 1 - ${NAME}`, 0, 0, 0), 0), run(tap("ok 1 - another_test", 1, 0, 0), 0), run("", 0)],
    [0, 1, 1, 1, 1, 1, 1, 1], "green on one pass by name; red on a skip (alone or beside a pass), a failure, a non-zero exit, no pass, another test or no report");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
