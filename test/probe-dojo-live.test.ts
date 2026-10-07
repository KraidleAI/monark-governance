// test/probe-dojo-live.test.ts -- DOJO-LIVE-HEALTH-1 (ADR-DOJO-PR-4 PL-3; mutants M-H1 to M-H8 of PL-5; lot PR-4c-1c): the probe of the
// served Dojo page, run in process and as the real CLI against two loopback servers, the Dojo host and the site's proxy, that serve a
// tree the fixture of apps/dojo signs at run time; the verifier is the real CLI, or a stub where its report or its timing is the
// subject. No real network and no real mail: a loopback fake, and every child's environment without SMTP_* and ALERT_*. The committed
// units, the tree and the RUNBOOK section are pinned against the code they run. The lines above each test name the mutation that
// reddens it (scripts/red-proof.mjs convention); every server listens through test/helpers/loopback.ts.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type OutgoingHttpHeaders, type ServerResponse } from "node:http";
import net from "node:net";
import { tmpdir } from "node:os";
import { join, posix, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { dojoFixture, dojoKeyringOf, dojoSpreadFixture, newKey, render } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { DOJO_VERIFY_REPORT_KEYS, VERIFY_BOUNDS } from "../apps/dojo/scripts/dojo-verify.mjs";
import { DOJO_HOST } from "../apps/site/lib/dojo-served-load.ts";
import { DOJO_LIVE_PREFIX } from "../apps/site/lib/dojo-served.ts";
import { DOJO_CA_CHILD_ENV } from "../scripts/verify-dojo.mjs";
import { DEFAULT_URL as NARABI_URL, MAX_SMTP_DEADLINE_MS, START_MARGIN_MS } from "../scripts/probe-narabi.mjs";
import * as P from "../scripts/probe-dojo-live.mjs";
import type { DojoLiveState, DojoProbeOpts } from "../scripts/probe-dojo-live.mjs";
import { closedPort, listen } from "./helpers/loopback.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url)), PROBE = join(REPO, "scripts", "probe-dojo-live.mjs");
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
/** A repository file, asserted present first: a mutation reddens by an assertion, never by ENOENT. */
function read(rel: string): string {
  assert.ok(existsSync(REPO + rel), `${rel} exists`);
  return readFileSync(REPO + rel, "utf8");
}
const dirs: string[] = [];
after(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
function scratch(): string {
  const d = mkdtempSync(join(tmpdir(), "dojo-probe-"));
  dirs.push(d);
  return d;
}
function file(name: string, text: string): string {
  const f = join(scratch(), name);
  writeFileSync(f, text);
  return f;
}
/** The SMTP password file, its bytes as given, its mode set (0600 by default: owner only). */
function passFile(text: string | Buffer, mode = 0o600): string {
  const f = join(scratch(), "smtp-pass");
  writeFileSync(f, text);
  chmodSync(f, mode);
  return f;
}
const POSIX = process.platform !== "win32";

// ---- the served trees: NEW (head 2026-10-10, seq 12), OLD (NEW without its last snapshot: a prefix of it, the same files) ----------
const FX = dojoFixture(), NEW = render(FX.steps), OLD = render(FX.steps.slice(0, -1)), TL = "timeline.jsonl";
const KEYRING = file("keyring.json", JSON.stringify(dojoKeyringOf([[FX.key, 1]])));
const NOW = "2026-10-11T08:00:00.000Z", LAG = "2026-10-12T08:00:00.000Z";
const tl = (t: ReadonlyMap<string, Buffer>): Buffer => t.get(TL) ?? Buffer.alloc(0);
const HEAD = ((): { seq: number; day: string; lines_sha256: string } => {
  const lines = tl(NEW).toString("utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as { kind: string; seq: number; day: string; lines_sha256: string });
  const h = lines.filter((l) => l.kind === "snapshot").at(-1);
  assert.ok(h !== undefined, "the fixture has a head");
  return { seq: h.seq, day: h.day, lines_sha256: h.lines_sha256 };
})();
const LINES = `lines/${HEAD.lines_sha256}.jsonl`;
/** `b` with its last byte before the final newline changed: the same length, another sha256. */
function flip(b: Buffer | undefined): Buffer | undefined {
  if (b === undefined) return undefined;
  const c = Buffer.from(b), i = c.length - 2;
  c.writeUInt8(c.readUInt8(i) ^ 1, i);
  return c;
}

// ---- the two servers and one run --------------------------------------------------------------------------------------------------
interface Side { tree: (rel: string, n: number) => Buffer | undefined; headers: (rel: string) => OutgoingHttpHeaders; hits: string[];
  answer?: (rel: string, res: ServerResponse) => boolean }
/** `side` on 127.0.0.1 under `prefix`: GET <prefix><rel> answers side.tree(rel, n), n = the earlier GETs of rel, else 404; `answer`
 *  takes a request first when it returns true (a hang, a redirect). */
async function serve(prefix: string, side: Side): Promise<{ base: string; close: () => Promise<void> }> {
  const srv = createServer((req, res) => {
    const url = req.url ?? "", rel = url.startsWith(prefix) ? url.slice(prefix.length) : url, n = side.hits.filter((h) => h === rel).length;
    side.hits.push(rel);
    if (side.answer?.(rel, res) === true) return;
    const body = req.method === "GET" ? side.tree(rel, n) : undefined;
    if (body === undefined) res.writeHead(404).end();
    else res.writeHead(200, side.headers(rel)).end(body);
  });
  const port = await listen(srv);
  return { base: `http://127.0.0.1:${String(port)}${prefix.slice(0, -1)}`,
    close: () => { srv.closeAllConnections(); return new Promise<void>((r) => { srv.close(() => { r(); }); }); } };
}
interface World { host?: Partial<Side>; proxy?: Partial<Side>; opts?: DojoProbeOpts }
interface Outcome { state: DojoLiveState; exitCode: number; host: string[]; proxy: string[]; waits: number[] }
const STORE: OutgoingHttpHeaders = { "cache-control": "no-store" };
/** One run in process against the host and the proxy (NEW on both, the proxy adding no-store), its record in a fresh directory. */
async function probeOn(w: World = {}): Promise<Outcome> {
  const host: Side = { tree: (rel) => NEW.get(rel), headers: () => ({}), hits: [], ...w.host };
  const proxy: Side = { tree: (rel) => NEW.get(rel), headers: () => STORE, hits: [], ...w.proxy };
  const h = await serve("/", host), p = await serve(DOJO_LIVE_PREFIX, proxy), waits: number[] = [];
  try {
    const r = await P.probe({ host: h.base, proxy: p.base, keyring: KEYRING, out: join(scratch(), "dojo-live.json"), now: NOW, env: {},
      sleep: (ms) => { waits.push(ms); return Promise.resolve(); }, ...w.opts });
    return { ...r, host: host.hits, proxy: proxy.hits, waits };
  } finally {
    await h.close();
    await p.close();
  }
}

// reddened by: a proxy body that differs from the host's accepted (M-H1: the digests not compared, or the lengths alone), the head
// taken elsewhere than the last snapshot line of the host's timeline, a file of the pair not read on both sides, or a record off its
// closed keys
// killer: scripts/probe-dojo-live.mjs:168 CONST "host.sha256 === proxy.sha256 && " -> ""
test("dojo_live_probe_compares_proxy_and_host", async () => {
  const ok = await probeOn();
  assert.deepEqual(Object.keys(ok.state), [...P.DOJO_LIVE_KEYS], "the closed keys, in their order");
  assert.deepEqual([ok.state.status, ok.state.reason, ok.exitCode, ok.state.reread, ok.waits, ok.state.verifier_exit], ["healthy", null, 0, false, [], 0]);
  assert.deepEqual([ok.state.head_seq, ok.state.head_day, ok.state.lines_sha256, ok.state.timeline_sha256], [HEAD.seq, HEAD.day, HEAD.lines_sha256, sha(tl(NEW))]);
  assert.deepEqual([ok.proxy, ok.host.slice(0, 2)], [[TL, LINES], [TL, LINES]], "each file read from the host, then through the proxy");
  const timeline = await probeOn({ proxy: { tree: (rel) => (rel === TL ? flip(NEW.get(rel)) : NEW.get(rel)) } });
  assert.deepEqual([timeline.state.reason, timeline.state.side, timeline.state.reread, timeline.exitCode], ["proxy_timeline_differs", null, true, 1]);
  assert.deepEqual([timeline.proxy, timeline.waits], [[TL, TL], [P.REREAD_DELAY_MS]], "one wait, both read once more, the second read judged");
  const lines = await probeOn({ proxy: { tree: (rel) => (rel === LINES ? flip(NEW.get(rel)) : NEW.get(rel)) } });
  assert.deepEqual([lines.state.reason, lines.state.side, lines.state.verifier_exit, lines.proxy], ["proxy_lines_differs", null, null, [TL, LINES, LINES]]);
});

// reddened by: no reread on a difference (M-H2: a publication between the host's GET and the proxy's taken as a fault), a reread
// without its wait, or the head taken from the first read
// killer: scripts/probe-dojo-live.mjs:169 CONST "attempt > 0" -> "attempt >= 0"
test("dojo_live_probe_rereads_a_publication_race", async () => {
  const late = (rel: string, n: number): Buffer | undefined => (rel === TL && n === 0 ? OLD.get(rel) : NEW.get(rel));
  const race = await probeOn({ host: { tree: late } });
  assert.deepEqual([race.state.status, race.state.reread, race.waits, race.state.head_day, race.state.timeline_sha256],
    ["healthy", true, [P.REREAD_DELAY_MS], HEAD.day, sha(tl(NEW))], "the host served OLD first: one reread, both now equal");
  // A race on both files: eight GETs of the core at most (two files, two sides, two reads), the first term of the unit's worst case.
  const both = await probeOn({ host: { tree: late }, proxy: { tree: (rel, n) => (rel === LINES && n === 0 ? flip(NEW.get(rel)) : NEW.get(rel)) } });
  assert.deepEqual([both.state.status, both.waits.length, both.proxy, both.host.slice(0, 4)], ["healthy", 2, [TL, TL, LINES, LINES], [TL, TL, LINES, LINES]]);
});

// reddened by: a proxy answer without no-store accepted (M-H4), cf-cache-status HIT accepted (M-H3), or MISS, a value off the token
// form recorded as is, the answer of one of the two files not read, or the verifier run once the headers failed
// killer: scripts/probe-dojo-live.mjs:74 CONST "[\"DYNAMIC\", \"BYPASS\"]" -> "[\"DYNAMIC\", \"BYPASS\", \"HIT\"]"
test("dojo_live_probe_reads_the_proxy_headers", async () => {
  const run = (headers: (rel: string) => OutgoingHttpHeaders): Promise<Outcome> => probeOn({ proxy: { headers } });
  const none = await run(() => ({}));
  assert.deepEqual([none.state.reason, none.state.no_store, none.state.verifier_exit, none.exitCode], ["proxy_not_no_store", false, null, 1]);
  assert.equal((await run((rel) => (rel === TL ? STORE : { "cache-control": "no-cache" }))).state.reason, "proxy_not_no_store", "the lines file's answer too");
  const hit = await run((rel) => ({ ...STORE, ...(rel === LINES ? { "cf-cache-status": "HIT" } : {}) }));
  assert.deepEqual([hit.state.reason, hit.state.cf_cache_status_timeline, hit.state.cf_cache_status_lines], ["edge_cache_status", null, "HIT"]);
  assert.equal((await run(() => ({ ...STORE, "cf-cache-status": "MISS" }))).state.reason, "edge_cache_status", "DYNAMIC or BYPASS only (PL-2 l.305)");
  const odd = await run(() => ({ ...STORE, "cf-cache-status": "dynamic; edge=x" }));
  assert.deepEqual([odd.state.reason, odd.state.cf_cache_status_timeline], ["edge_cache_status", "MALFORMED"]);
  const fine = await run((rel) => ({ "cache-control": "no-cache, No-Store", "cf-cache-status": rel === TL ? "dynamic" : "BYPASS" }));
  assert.deepEqual([fine.state.status, fine.state.no_store, fine.state.cf_cache_status_timeline, fine.state.cf_cache_status_lines], ["healthy", true, "DYNAMIC", "BYPASS"]);
});

// reddened by: the verifier's timeline_sha256 not compared with the host's of the core (M-H6: a publication between the core and the
// verifier taken as healthy), a keyring without the signer's key or without the rotated key accepted, the verifier's reason lost
// killer: scripts/probe-dojo-live.mjs:198 CONST "r.timeline_sha256 === timelineSha" -> "true"
test("dojo_live_probe_runs_the_real_verifier", async () => {
  const other = await probeOn({ opts: { keyring: file("other.json", JSON.stringify(dojoKeyringOf([[newKey(), 1]]))) } });
  assert.deepEqual([other.state.reason, other.state.verifier_exit, other.state.verifier_reason, other.exitCode], ["verifier_refused", 1, "served_key_not_in_keyring", 1]);
  // A key rotation (seq 13 of the spread fixture): the keyring deployed before it is refused until its redeployment at the synchro.
  const SP = dojoSpreadFixture(), spread = render(SP.steps), side = { tree: (rel: string): Buffer | undefined => spread.get(rel) };
  const at = (keys: Parameters<typeof dojoKeyringOf>[0]): Promise<Outcome> => probeOn({ host: side, proxy: side,
    opts: { now: "2026-10-18T08:00:00.000Z", keyring: file("rot.json", JSON.stringify(dojoKeyringOf(keys))) } });
  const before = await at([[SP.key, 1]]), redeployed = await at([[SP.key, 1, 13], [SP.next, 13]]);
  assert.deepEqual([before.state.reason, before.state.verifier_reason], ["verifier_refused", "rotation_key_not_in_keyring"]);
  assert.deepEqual([redeployed.state.status, redeployed.state.verifier_exit, redeployed.state.head_day], ["healthy", 0, "2026-10-17"]);
  // A publication between the core and the verifier: the core reads OLD on both sides, the verifier the new timeline, valid (M-H6).
  const late = await probeOn({ host: { tree: (rel, n) => (rel === TL && n === 0 ? OLD.get(rel) : NEW.get(rel)) }, proxy: { tree: (rel) => (rel === TL ? OLD.get(rel) : NEW.get(rel)) } });
  assert.deepEqual([late.state.reason, late.state.verifier_exit, late.state.timeline_sha256, late.waits], ["verifier_timeline_differs", 0, sha(tl(OLD)), []]);
});

// reddened by: the verifier's exit read without its report (M-H5: an exit 0 printing a refusal, or a report under the served keyring,
// taken as healthy), the unit's environment (SMTP_PASS) handed to the child, a child left running past its delay
// killer: scripts/probe-dojo-live.mjs:197 CONST "v.code === 0 && reportOk(r)" -> "v.code === 0"
test("dojo_live_probe_reads_the_verifier_report", async () => {
  const names = join(scratch(), "names.json");
  const stub = (out: string): string => file("stub.mjs", `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(names)}, `
    + `JSON.stringify(Object.keys(process.env)));\nprocess.stdout.write(${JSON.stringify(out)});\n`);
  const report = (status: string, trust: string): string => `${JSON.stringify({ ...Object.fromEntries(DOJO_VERIFY_REPORT_KEYS.map((k) => [k, null])),
    ok: true, status, trust_root: trust, timeline_sha256: sha(tl(NEW)) })}\n`;
  const saved = process.env.SMTP_PASS;
  process.env.SMTP_PASS = "never-handed";
  try {
    const ok = await probeOn({ opts: { verifier: stub(report("consistent_with_supplied_keyring", "supplied_keyring")) } });
    assert.deepEqual([ok.state.status, ok.state.verifier_exit], ["healthy", 0], "a success report under the supplied keyring");
    const got = JSON.parse(readFileSync(names, "utf8")) as string[];
    assert.ok(got.length > 0 && got.every((k) => P.VERIFIER_ENV.includes(k.toUpperCase())), `the child's names, a closed list: ${got.join(",")}`);
  } finally {
    if (saved === undefined) delete process.env.SMTP_PASS;
    else process.env.SMTP_PASS = saved;
  }
  assert.deepEqual(P.VERIFIER_ENV, DOJO_CA_CHILD_ENV, "the closed list of the CA's verifier child (ADR-DOJO-PR-3 PB-3 (1))");
  const refusal = `${JSON.stringify({ ok: false, reason: "chain_broken", seq: 2, day: null, detail: TL })}\n`;
  for (const [out, named] of [[refusal, "chain_broken"], [report("self_consistent_only", "served_keyring"), null]] as const) {
    const r = await probeOn({ opts: { verifier: stub(out) } });
    assert.deepEqual([r.state.reason, r.state.verifier_exit, r.state.verifier_reason, r.exitCode], ["verifier_refused", 0, named, 1]);
  }
  // A child silent for 15 s, killed at 400 ms; left alone it would end by itself, printing nothing (verifier_refused, never a hang).
  const t0 = Date.now(), slow = await probeOn({ opts: { verifier: file("slow.mjs", "setTimeout(() => undefined, 15000);\n"), verifierTimeoutMs: 400 } });
  assert.deepEqual([slow.state.reason, slow.exitCode, Date.now() - t0 < 10_000], ["verifier_timeout", 1, true], "killed at its delay, not waited out");
});

/** A verifier stub that prints a success report under the supplied keyring for NEW, `fields` written over it: one guard at a time. */
function reportStub(fields: Record<string, unknown>): string {
  const r = { ...Object.fromEntries(DOJO_VERIFY_REPORT_KEYS.map((k) => [k, null])), ok: true, status: "consistent_with_supplied_keyring",
    trust_root: "supplied_keyring", timeline_sha256: sha(tl(NEW)), ...fields };
  return file("report.mjs", `process.stdout.write(${JSON.stringify(`${JSON.stringify(r)}\n`)});\n`);
}
const refusedBy = async (fields: Record<string, unknown>): Promise<unknown[]> => {
  const r = await probeOn({ opts: { verifier: reportStub(fields) } });
  return [r.state.reason, r.state.verifier_exit, r.state.verifier_reason, r.exitCode];
};

// reddened by: a success report taken as healthy whatever its status, when its trust root is the supplied keyring (each guard of the
// report is held alone, not only with the trust root's)
// killer: scripts/probe-dojo-live.mjs:191 CONST "r.status === \"consistent_with_supplied_keyring\" && " -> ""
test("dojo_live_probe_refuses_a_report_off_the_supplied_status", async () => {
  assert.deepEqual((await probeOn({ opts: { verifier: reportStub({}) } })).state.status, "healthy", "the stub's report, untouched");
  assert.deepEqual(await refusedBy({ status: "self_consistent_only" }), ["verifier_refused", 0, null, 1]);
});

// reddened by: a success report taken as healthy whatever its trust root, when its status is the supplied keyring's
// killer: scripts/probe-dojo-live.mjs:191 CONST "r.trust_root === \"supplied_keyring\" && " -> ""
test("dojo_live_probe_refuses_a_report_off_the_supplied_trust_root", async () => {
  assert.deepEqual(await refusedBy({ trust_root: "served_keyring" }), ["verifier_refused", 0, null, 1]);
});

// reddened by: a success report that carries a detail taken as healthy
// killer: scripts/probe-dojo-live.mjs:191 CONST " && r.detail === null" -> ""
test("dojo_live_probe_refuses_a_report_with_a_detail", async () => {
  assert.deepEqual(await refusedBy({ detail: "timeline.jsonl" }), ["verifier_refused", 0, null, 1]);
});

// reddened by: a success report taken as healthy whatever its ok field, when its status, trust root and detail hold
// killer: scripts/probe-dojo-live.mjs:191 CONST "r.ok === true && " -> ""
test("dojo_live_probe_refuses_a_report_not_ok", async () => {
  assert.deepEqual(await refusedBy({ ok: false }), ["verifier_refused", 0, null, 1]);
});

// reddened by: a success report taken as healthy off the closed keys of the verifier's report (a key added)
// killer: scripts/probe-dojo-live.mjs:190 CONST "Object.keys(r).sort().join() === [...DOJO_VERIFY_REPORT_KEYS].sort().join()" -> "true"
test("dojo_live_probe_refuses_a_report_off_its_closed_keys", async () => {
  assert.deepEqual(await refusedBy({ extra: null }), ["verifier_refused", 0, null, 1]);
});

// reddened by: a verifier stdout past MAX_LINE_BYTES read whole (the child's maxBuffer widened)
// killer: scripts/probe-dojo-live.mjs:184 CONST "maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES" -> "maxBuffer: 4 * VERIFY_BOUNDS.MAX_LINE_BYTES"
test("dojo_live_probe_bounds_the_verifier_stdout", async () => {
  const r = { ...Object.fromEntries(DOJO_VERIFY_REPORT_KEYS.map((k) => [k, null])), ok: true, status: "consistent_with_supplied_keyring",
    trust_root: "supplied_keyring", timeline_sha256: sha(tl(NEW)) };
  const line = `${JSON.stringify(r)}${" ".repeat(VERIFY_BOUNDS.MAX_LINE_BYTES)}\n`;
  const out = await probeOn({ opts: { verifier: file("big.mjs", `process.stdout.write(${JSON.stringify(line)});\n`) } });
  assert.deepEqual([out.state.reason, out.state.verifier_exit, out.exitCode], ["verifier_refused", null, 1]);
});

// ---- the committed units ----------------------------------------------------------------------------------------------------------
interface Directive { section: string; key: string; value: string }
/** A systemd unit's directives in order, comments and blank lines dropped. */
function unit(rel: string): Directive[] {
  const list: Directive[] = [];
  let section = "";
  for (const raw of read(rel).split("\n")) {
    const l = raw.trim(), i = l.indexOf("=");
    if (l === "" || l.startsWith("#")) continue;
    if (l.startsWith("[")) section = l.slice(1, -1);
    else list.push({ section, key: l.slice(0, i), value: l.slice(i + 1) });
  }
  return list;
}
const values = (u: readonly Directive[], s: string, k: string): string[] => u.filter((d) => d.section === s && d.key === k).map((d) => d.value);
function one(u: readonly Directive[], s: string, k: string): string {
  const v = values(u, s, k);
  assert.equal(v.length, 1, `${s}.${k} once`);
  return v[0] ?? "";
}
/** The second of the UTC day of each OnCalendar shot, one explicit UTC time per expression. */
const shotsOf = (u: readonly Directive[]): number[] => values(u, "Timer", "OnCalendar").map((v) => {
  const m = /^[*]-[*]-[*] ([0-9]{2}):([0-9]{2}):00 UTC$/.exec(v);
  assert.ok(m !== null, `one UTC time per expression: ${v}`);
  return 3600 * Number(m[1]) + 60 * Number(m[2]);
});
const DOJO_SVC = "deploy/monark-dojo-probe.service", DOJO_TIMER = "deploy/monark-dojo-probe.timer";

// reddened by: the freshness ignored (M-H7: a head older than the day due accepted), the grid read a day off, a deadline before the
// end of the last publication start, a shot before the deadline, a probe start that can overlap a publication start or a start of
// monark-probe
// killer: scripts/probe-dojo-live.mjs:228 CONST "s.lag_days > 0 ? \"lag\" : null" -> "null"
test("dojo_probe_timer_follows_the_publish_deadline", async () => {
  const [pt, ps, dt, ds, nt, ns] = ["deploy/monark-dojo-publish.timer", "deploy/monark-dojo-publish.service", DOJO_TIMER, DOJO_SVC,
    "deploy/monark-probe.timer", "deploy/monark-probe.service"].map(unit) as [Directive[], Directive[], Directive[], Directive[], Directive[], Directive[]];
  const start = (u: readonly Directive[]): number => Number(one(u, "Service", "TimeoutStartSec"));
  const accuracy = (u: readonly Directive[]): number => { const v = values(u, "Timer", "AccuracySec"); return v.length === 0 ? 60 : Number(/^([0-9]+)s$/.exec(v[0] ?? "")?.[1]); };
  const windows = (t: readonly Directive[], s: readonly Directive[]): [number, number][] => shotsOf(t).map((x) => [x, x + start(s) + accuracy(t)]);
  const deadline = 60 * P.DEADLINE_UTC_MINUTES, publish = windows(pt, ps), probe = windows(dt, ds);
  assert.ok(publish.length === 4 && publish.every(([, end]) => end <= deadline), `every publication start ends by ${P.DEADLINE_UTC} UTC: ${JSON.stringify(publish)}`);
  assert.deepEqual(dt.filter((d) => d.section === "Timer" && d.key !== "OnCalendar").map((d) => `${d.key}=${d.value}`),
    ["AccuracySec=1s", "RandomizedDelaySec=0", "Persistent=true", `Unit=${posix.basename(DOJO_SVC)}`], "the [Timer] of the probe, every value written");
  assert.deepEqual(probe.map(([s]) => s), [deadline, deadline + 7200, deadline + 21600], "the deadline, then +2 h and +6 h (monark-probe.timer's form)");
  const meets = (a: [number, number], b: [number, number]): boolean => [-86_400, 0, 86_400].some((k) => a[0] < b[1] + k && b[0] + k < a[1]);
  for (const w of probe) for (const o of [...publish, ...windows(nt, ns)]) assert.ok(!meets(w, o), `probe start ${JSON.stringify(w)} vs ${JSON.stringify(o)}`);
  const early = await probeOn({ opts: { now: "2026-10-12T07:29:59.000Z" } }), due = await probeOn({ opts: { now: "2026-10-12T07:30:00.000Z" } });
  assert.deepEqual([early.state.status, early.state.expected_day, early.state.lag_days], ["healthy", "2026-10-10", 0], "before the deadline: the day before yesterday");
  assert.deepEqual([due.state.reason, due.state.expected_day, due.state.lag_days, due.exitCode], ["lag", "2026-10-11", 1, 1], "from it: yesterday (M-H7)");
});

// reddened by: a GET left to hang past its timer or named unreachable, a body or a line past the verifier's bounds read, a status
// other than 200 or a redirect taken as served, a closed port, the side not named, an insecure or a bad-port base dialled, a timeline
// without a snapshot or without its final newline read as a head
// killer: scripts/probe-dojo-live.mjs:153 CONST "ctl.signal.aborted ? \"timeout\" : " -> ""
test("dojo_live_probe_names_each_transport_refusal", async () => {
  const quick = { ...VERIFY_BOUNDS, TIMEOUT_MS: 300 }, hang = (on: string) => (rel: string): boolean => rel === on;
  const names = (o: Outcome): [string | null, string | null] => [o.state.reason, o.state.side];
  const hostHang = await probeOn({ host: { answer: hang(TL) }, opts: { bounds: quick } });
  assert.deepEqual([...names(hostHang), hostHang.proxy], ["timeout", "host", []]);
  assert.deepEqual(names(await probeOn({ proxy: { answer: hang(LINES) }, opts: { bounds: quick } })), ["timeout", "proxy"]);
  assert.deepEqual(names(await probeOn({ opts: { bounds: { ...VERIFY_BOUNDS, MAX_BODY_BYTES: tl(NEW).length - 1 } } })), ["too_large", "host"]);
  assert.deepEqual(names(await probeOn({ opts: { bounds: { ...VERIFY_BOUNDS, MAX_LINE_BYTES: 64 } } })), ["too_large", "host"]);
  assert.deepEqual(names(await probeOn({ opts: { proxy: `http://127.0.0.1:${String(await closedPort())}/dojo-served` } })), ["unreachable", "proxy"]);
  assert.deepEqual(names(await probeOn({ proxy: { tree: (rel) => (rel === LINES ? undefined : NEW.get(rel)) } })), ["unreachable", "proxy"]);
  const moved = await probeOn({ host: { answer: (_rel, res) => { res.writeHead(302, { location: "/elsewhere" }).end(); return true; } } });
  assert.deepEqual([...names(moved), moved.host, moved.proxy], ["unreachable", "host", [TL], []], "a redirect is never followed");
  const insecure = await probeOn({ opts: { proxy: "http://dojo.monark.invalid/dojo-served" } });
  assert.deepEqual([...names(insecure), insecure.host], ["insecure_url", "proxy", []], "refused before any GET");
  const port = await probeOn({ opts: { host: "http://127.0.0.1:6000" } });
  assert.deepEqual([...names(port), port.proxy], ["bad_port", "host", []]);
  const bare = render(FX.steps.slice(0, 2)), cut = tl(NEW).subarray(0, tl(NEW).length - 1);
  for (const t of [(rel: string) => bare.get(rel), (rel: string) => (rel === TL ? cut : NEW.get(rel))]) {
    assert.deepEqual(names(await probeOn({ host: { tree: t }, proxy: { tree: t } })), ["timeline_malformed", "host"], "no head: no snapshot, or no final newline");
  }
});

// reddened by: a timer that claims one CPU-bound job at a time on the host or does not name the collector, a collector off its
// 5-minute grid, or the quotas of the probe and of the collector, which always run together, above one of the host's 2 vCPU
// killer: deploy/monark-dojo-collect.service:54 CONST "CPUQuota=25%" -> "CPUQuota=80%"
test("dojo_probe_timer_shares_the_host_with_the_collector", () => {
  const ct = unit("deploy/monark-dojo-collect.timer"), cs = unit("deploy/monark-dojo-collect.service"), ds = unit(DOJO_SVC);
  assert.deepEqual(values(ct, "Timer", "OnCalendar"), ["*-*-* *:00/5:00 UTC"], "a collector start every 5 minutes: each probe start runs beside one");
  const quota = (u: readonly Directive[]): number => Number(/^([0-9]+)%$/.exec(one(u, "Service", "CPUQuota"))?.[1]);
  assert.ok(quota(ds) + quota(cs) <= 100, `the probe and the collector within one vCPU: ${String(quota(ds))} % + ${String(quota(cs))} %`);
  const head = read(DOJO_TIMER).split("\n").filter((l) => l.startsWith("#")).map((l) => l.replace(/^#\s?/, "")).join(" ");
  assert.ok(!head.includes("one CPU-bound job at a time") && head.includes("monark-dojo-collect"), "the timer's header names the collector beside the probe");
});

// ---- the mail ---------------------------------------------------------------------------------------------------------------------
/** A loopback SMTP fake (plaintext, AUTH PLAIN announced on the final EHLO line): each delivered DATA body, as the probe wrote it, and
 *  each AUTH PLAIN credential decoded (user and password, NUL-separated). */
async function fakeSmtp(): Promise<{ port: number; mails: string[]; auths: string[]; close: () => Promise<void> }> {
  const mails: string[] = [], auths: string[] = [];
  const srv = net.createServer((sock) => {
    sock.on("error", () => undefined);
    let buf = "", data: string | null = null;
    sock.write("220 fake\r\n");
    sock.on("data", (c: Buffer) => {
      buf += c.toString("utf8");
      for (let i = buf.indexOf("\r\n"); i >= 0; i = buf.indexOf("\r\n")) {
        const line = buf.slice(0, i), up = line.toUpperCase();
        buf = buf.slice(i + 2);
        if (data !== null) {
          if (line !== ".") data += `${line}\n`;
          else { mails.push(data); data = null; sock.write("250 queued\r\n"); }
        } else if (up.startsWith("EHLO")) sock.write("250-fake\r\n250 AUTH PLAIN\r\n");
        else if (up.startsWith("AUTH")) { auths.push(Buffer.from(line.split(" ")[2] ?? "", "base64").toString("utf8")); sock.write("235 ok\r\n"); }
        else if (up === "DATA") { data = ""; sock.write("354 go\r\n"); }
        else sock.write(up === "QUIT" ? "221 bye\r\n" : "250 ok\r\n");
      }
    });
  });
  const port = await listen(srv);
  return { port, mails, auths, close: () => new Promise<void>((r) => { srv.close(() => { r(); }); }) };
}

// reddened by: no mail on the transition to unhealthy (M-H8), a second mail the same UTC day, no recovery mail, the alert bit moved
// without a delivered mail, a mail that carries a URL, an address, the password or a banned word, a password taken from anywhere but
// its file (the environment holds none)
// killer: scripts/probe-dojo-live.mjs:285 CONST "readSmtpPass(opts.smtpPassFile ?? DEFAULT_SMTP_PASS_FILE)" -> "env.SMTP_PASS"
test("dojo_live_probe_mails_on_the_transition", async () => {
  const smtp = await fakeSmtp(), out = join(scratch(), "dojo-live.json"), smtpPassFile = passFile("secret-x\n");
  const env = { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.port), SMTP_TLS: "none", SMTP_USER: "probe",
    ALERT_FROM: "probe@monark.test", ALERT_TO: "ops@monark.test" };
  try {
    const unconfigured = await probeOn({ opts: { now: LAG, out, smtpPassFile } });
    assert.deepEqual([unconfigured.state.reason, unconfigured.state.alert_error, unconfigured.state.alerted, unconfigured.exitCode], ["lag", "smtp_unconfigured", false, 1]);
    const first = await probeOn({ opts: { now: LAG, out, env, smtpPassFile } });
    assert.deepEqual([first.state.alerted, first.state.last_alert_day, first.state.alert_error, smtp.mails.length], [true, "2026-10-12", null, 1]);
    assert.deepEqual(smtp.auths, ["\0probe\0secret-x"], "the password of the file, its final newline dropped");
    const again = await probeOn({ opts: { now: "2026-10-12T13:30:00.000Z", out, env, smtpPassFile } });
    assert.deepEqual([again.state.reason, again.state.alerted, smtp.mails.length], ["lag", true, 1], "no second mail the same UTC day");
    const healed = await probeOn({ opts: { now: "2026-10-12T07:00:00.000Z", out, env, smtpPassFile } });
    assert.deepEqual([healed.state.status, healed.state.alerted, healed.state.last_alert_day, healed.exitCode, smtp.mails.length], ["healthy", false, null, 0, 2]);
  } finally { await smtp.close(); }
  const [alert = "", recovery = ""] = smtp.mails;
  assert.match(alert, /\nSubject: \[MONARK\] Dojo probe notice\n[\s\S]*\ncondition: alert\nstatus: unhealthy\nreason: lag\nside: none\nhead_day: 2026-10-10\nexpected_day: 2026-10-11\nlag_days: 1\n/);
  assert.match(recovery, /\ncondition: recovered\nstatus: healthy\nreason: none\n/);
  const vocab = JSON.parse(read("vocab-banned.json")) as { banned: { re: string }[]; scan: { sentinel: { banned: { re: string }[] } } };
  const banned = [...vocab.banned, ...vocab.scan.sentinel.banned].map((b) => new RegExp(b.re, "i"));
  for (const m of smtp.mails) {
    assert.doesNotMatch(m, /:\/\/|[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}|secret-x|partner|autonomous|guarantee|verified|score/i, "no URL, address, password, mail-banned word");
    for (const re of banned) assert.ok(!re.test(m), `banned pattern ${re.source}`);
  }
});

// reddened by: the password read before the verifier's child has ended, a file past SMTP_PASS_MAX_BYTES, empty, of two lines, with a
// BOM or invalid UTF-8 accepted, a CRLF line or a file of exactly SMTP_PASS_MAX_BYTES refused, or (POSIX) a file that its group or others
// may read or reached through a symbolic link accepted, or (Linux) a procfs file whose fstat size is not its byte count accepted; a section
// 25 of the RUNBOOK that does not create the file through systemd's own parser for the probe alone, prints its size, or does not prove the
// mail path before the timer (under the unit's user, forced unhealthy, on a fresh scratch record); a change of SMTP_PASS not followed by
// (1b) then (4b), in RUNBOOK-sentinel or in section 25
// killer: scripts/probe-dojo-live.mjs:248 CONST "st.size > SMTP_PASS_MAX_BYTES" -> "false"
test("dojo_live_probe_reads_the_smtp_password_from_its_file_after_the_verifier", async (t) => {
  const smtp = await fakeSmtp(), late = join(scratch(), "smtp-pass");
  const env = { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.port), SMTP_TLS: "none", SMTP_USER: "probe", ALERT_FROM: "probe@monark.test", ALERT_TO: "ops@monark.test" };
  const report = `${JSON.stringify({ ...Object.fromEntries(DOJO_VERIFY_REPORT_KEYS.map((k) => [k, null])), ok: true,
    status: "consistent_with_supplied_keyring", trust_root: "supplied_keyring", timeline_sha256: sha(tl(NEW)) })}\n`;
  // The verifier's child writes the file as it ends: a password read before the child's end (at start, with the configuration) finds none.
  const writer = file("writer.mjs", `import { chmodSync, writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(late)}, "late-pass\\n");\n`
    + `chmodSync(${JSON.stringify(late)}, 0o600);\nprocess.stdout.write(${JSON.stringify(report)});\n`);
  const run = (smtpPassFile: string): Promise<Outcome> => probeOn({ opts: { now: LAG, out: join(scratch(), "dojo-live.json"), env, smtpPassFile, verifier: writer } });
  const long = "x".repeat(P.SMTP_PASS_MAX_BYTES - 1);
  try {
    const after = await run(late);
    assert.deepEqual([after.state.reason, after.state.verifier_exit, after.state.alert_error, smtp.auths], ["lag", 0, null, ["\0probe\0late-pass"]]);
    for (const [text, pass] of [["pw\r\n", "pw"], [`${long}\n`, long]] as const) {
      assert.deepEqual([(await run(passFile(text))).state.alert_error, smtp.auths.at(-1)], [null, `\0probe\0${pass}`], `accepted: ${JSON.stringify(text.slice(0, 8))}`);
    }
    const refused: (string | Buffer)[] = ["", "\n", "two\nlines\n", `${"x".repeat(P.SMTP_PASS_MAX_BYTES)}\n`, "\uFEFFbom-pass\n", Buffer.from("bad-pass\xff\n", "latin1")];
    for (const text of refused) assert.equal((await run(passFile(text))).state.alert_error, "smtp_unconfigured", JSON.stringify(String(text).slice(0, 16)));
    await t.test("refused on POSIX: a file its group may read, a symbolic link", { skip: POSIX ? false : "win32: no POSIX mode bits, no O_NOFOLLOW" }, async () => {
      assert.equal((await run(passFile("open-pass\n", 0o640))).state.alert_error, "smtp_unconfigured", "group-readable");
      const link = join(scratch(), "smtp-pass-link");
      symlinkSync(passFile("linked-pass\n"), link);
      assert.equal((await run(link)).state.alert_error, "smtp_unconfigured", "never through a symbolic link");
    });
    await t.test("refused on Linux: a regular file whose fstat size is not its byte count (procfs)", { skip: process.platform === "linux" ? false : "procfs is Linux only" }, () => { assert.equal(P.readSmtpPass("/proc/self/personality"), null); });
  } finally { await smtp.close(); }
  assert.ok(!smtp.auths.some((a) => /open-pass|linked-pass|bom-pass|bad-pass/.test(a)), "no refused password ever sent");
  const text = read("docs/RUNBOOK-dojo.md"), s = text.slice(text.indexOf("\n## 25. "), text.indexOf("\n## ", text.indexOf("\n## 25. ") + 1));
  for (const x of [P.DEFAULT_SMTP_PASS_FILE, "install -m 0600 -o probe -g probe", "probe 600", "size-ok",
    "systemd-run --wait --collect --quiet -p EnvironmentFile=/etc/monark/probe.env", `printf "%s\\n" "$$SMTP_PASS" > ${P.DEFAULT_SMTP_PASS_FILE}`,
    "-p EnvironmentFile=/etc/monark/probe.env -p UnsetEnvironment=SMTP_PASS", '"alert_error": null']) assert.ok(s.includes(x), `section 25: ${x}`);
  assert.ok(!s.includes('stat -c "%U %a %s"') && !s.includes(`sed -n "s/^SMTP_PASS=//p"`), "(1b): the file's size never printed, never a copy of the raw line");
  const b1 = s.indexOf("\n(1b) "), four = s.indexOf("\n(4) "), b4 = s.indexOf("\n(4b) "), five = s.indexOf("\n(5) "), timer = s.indexOf("systemctl enable --now monark-dojo-probe.timer");
  assert.ok(b1 > 0 && four > b1 && b4 > four && five > b4 && timer > five, "(1b), then (4), then (4b), then the timer at (5)");
  const mailAct = s.slice(s.indexOf("\n(4b) "), s.indexOf("\n(5) "));
  for (const x of ["systemd-run --wait --pipe --collect --uid=probe --gid=probe $S -p EnvironmentFile=/etc/monark/probe.env -p UnsetEnvironment=SMTP_PASS $C",
    "--now $N", "--out /var/lib/monark-probe/dojo-live-mail.json"]) assert.ok(mailAct.includes(x), `(4b), under the unit's user and forced unhealthy: ${x}`);
  assert.ok(mailAct.includes("root@bell.monarkgate.tech 'rm -f /var/lib/monark-probe/dojo-live-mail.json && S="), "(4b) opens on the removal of a scratch record left by a cut run");
  // A change of SMTP_PASS in the mail file (section 1 of the probe's deployment in RUNBOOK-sentinel) replays (1b), then (4b): both texts say so.
  const sn = read("docs/RUNBOOK-sentinel.md"), p1 = sn.indexOf("\n**1. The SMTP secret is posted by the INVESTOR"), p2 = sn.indexOf("\n**2. Simulate ONE shot", p1 + 1);
  assert.ok(p1 > 0 && p2 > p1 && sn.slice(p1, p2).includes("**After posting or changing `SMTP_PASS`:** `docs/RUNBOOK-dojo.md` section 25, (1b) then (4b)"), "RUNBOOK-sentinel: (1b) then (4b)");
  assert.ok(s.includes("\n(9) After posting or changing `SMTP_PASS` (section 1 of the probe's deployment in `docs/RUNBOOK-sentinel.md`): (1b) then (4b)"), "section 25: (1b) then (4b)");
  const never = text.slice(text.indexOf("\nProbe (section 25): "));
  assert.ok(never.slice(0, 600).includes(P.DEFAULT_SMTP_PASS_FILE), "the probe's Never list names the password file");
});

// reddened by: a probe whose environment holds SMTP_PASS (any value) that runs a GET or its verifier child, which runs under the same
// user and could read the parent's environment, or that names another reason or writes the value
// killer: scripts/probe-dojo-live.mjs:210 CONST "(opts.env ?? process.env).SMTP_PASS !== undefined" -> "false"
test("dojo_live_probe_refuses_a_password_in_its_environment", async () => {
  const ran = join(scratch(), "ran.txt"), stub = file("ran.mjs", `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(ran)}, "ran");\n`);
  for (const value of ["secret-x", ""]) {
    const r = await probeOn({ opts: { env: { SMTP_PASS: value }, verifier: stub } });
    assert.deepEqual([r.state.status, r.state.reason, r.state.side, r.exitCode, r.host, r.proxy, existsSync(ran)],
      ["unhealthy", "secret_in_environment", null, 1, [], [], false], `SMTP_PASS=${JSON.stringify(value)}: refused before any GET`);
    assert.ok(!JSON.stringify(r.state).includes("secret-x"), "the value is never written");
  }
});

// reddened by: a host timeline without a head judged only after the proxy's GET, its reason then the proxy's transport fault
// killer: scripts/probe-dojo-live.mjs:164 CONST "timeline && host.head === null" -> "false"
test("dojo_live_probe_judges_the_host_timeline_before_the_proxy", async () => {
  const bare = render(FX.steps.slice(0, 2)), t = (rel: string): Buffer | undefined => bare.get(rel);
  const closed = await probeOn({ host: { tree: t }, opts: { proxy: `http://127.0.0.1:${String(await closedPort())}/dojo-served` } });
  assert.deepEqual([closed.state.reason, closed.state.side, closed.host, closed.exitCode], ["timeline_malformed", "host", [TL], 1]);
  const served = await probeOn({ host: { tree: t } });
  assert.deepEqual([served.state.reason, served.state.side, served.proxy], ["timeline_malformed", "host", []], "no GET through the proxy");
});

// reddened by: a usage error that writes a record or exits other than 2, a run whose exit or printed record differs from its file, or
// NODE_TLS_REJECT_UNAUTHORIZED=0 not refused before any GET
// killer: scripts/probe-dojo-live.mjs:333 CONST "process.exitCode = 2" -> "process.exitCode = 0"
test("dojo_live_probe_cli_contract", async () => {
  const cli = (args: readonly string[], extra: Record<string, string> = {}): Promise<{ code: number | null; stdout: string; stderr: string }> => {
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(SMTP_|ALERT_)/.test(k)) env[k] = v;
    return new Promise((done) => {
      const c = spawn(process.execPath, [PROBE, ...args], { env: { ...env, ...extra }, windowsHide: true });
      let stdout = "", stderr = "";
      c.stdout.on("data", (b: Buffer) => { stdout += b.toString("utf8"); });
      c.stderr.on("data", (b: Buffer) => { stderr += b.toString("utf8"); });
      c.on("close", (code) => { done({ code, stdout, stderr }); });
    });
  };
  const out = join(scratch(), "dojo-live.json");
  for (const bad of [["--out", out, "--state", "x"], ["--out", out, "--out", out], ["--out", out, "--now"]]) {
    const r = await cli(bad);
    assert.deepEqual([r.code, existsSync(out), r.stdout], [2, false, ""], `usage error: ${bad.join(" ")}`);
    assert.match(r.stderr, /usage/);
  }
  const host: Side = { tree: (rel) => NEW.get(rel), headers: () => ({}), hits: [] }, proxy: Side = { tree: (rel) => NEW.get(rel), headers: () => STORE, hits: [] };
  const h = await serve("/", host), p = await serve(DOJO_LIVE_PREFIX, proxy);
  try {
    const args = ["--host", h.base, "--proxy", p.base, "--keyring", KEYRING, "--out", out, "--now", NOW];
    const ok = await cli(args);
    assert.deepEqual([ok.code, (JSON.parse(ok.stdout) as DojoLiveState).status], [0, "healthy"]);
    assert.equal(ok.stdout, readFileSync(out, "utf8"), "the record printed is the record written");
    const gets = host.hits.length, tls = await cli(args, { NODE_TLS_REJECT_UNAUTHORIZED: "0" });
    assert.deepEqual([tls.code, (JSON.parse(tls.stdout) as DojoLiveState).reason, host.hits.length], [1, "insecure_url", gets], "refused before any GET");
    const bad = await cli([...args.slice(0, -1), "not-a-day"]), written = JSON.parse(readFileSync(out, "utf8")) as DojoLiveState;
    assert.deepEqual([bad.code, written.reason, host.hits.length, Number.isNaN(Date.parse(written.checked_at))], [1, "probe_error", gets, false], "an invalid --now: written");
  } finally {
    await h.close();
    await p.close();
  }
});

// reddened by: the probe unit off its closed directive set or a pinned value (the user, group and writable path of monark-probe, the
// required env file, the publish unit's UnsetEnvironment guard then SMTP_PASS), a TimeoutStartSec not strictly above the worst case
// of one start, a verifier delay under DOJO-VERIFY-SCALE-1 under the unit's CPU quota, a memory cap under the two envelopes it composes
// killer: deploy/monark-dojo-probe.service:29 CONST " SMTP_PASS" -> ""
test("dojo_probe_units_are_hardened", () => {
  const ds = unit(DOJO_SVC), ns = unit("deploy/monark-probe.service"), ps = unit("deploy/monark-dojo-publish.service");
  const want: Record<string, string> = { Type: "oneshot", WorkingDirectory: P.DOJO_PROBE_TREE_ROOT, EnvironmentFile: one(ns, "Service", "EnvironmentFile"),
    ExecStart: `/usr/bin/env node ${P.DOJO_PROBE_TREE_ROOT}/scripts/probe-dojo-live.mjs`, TimeoutStartSec: "3300",
    UnsetEnvironment: `${one(ps, "Service", "UnsetEnvironment")} SMTP_PASS`, User: one(ns, "Service", "User"), Group: one(ns, "Service", "Group"),
    NoNewPrivileges: "true", ProtectSystem: "strict", ProtectHome: "true", PrivateTmp: "true", ReadWritePaths: one(ns, "Service", "ReadWritePaths"),
    CPUQuota: "25%", MemoryMax: "640M", TasksMax: "64" };
  const svc = ds.filter((d) => d.section === "Service");
  assert.deepEqual(svc.map((d) => d.key).sort(), Object.keys(want).sort(), "the [Service] directives, each once");
  for (const d of svc) assert.equal(d.value, want[d.key], `${d.key}=${d.value}`);
  assert.deepEqual([want.User, want.ReadWritePaths, want.EnvironmentFile], ["probe", posix.dirname(P.DEFAULT_OUT), "/etc/monark/probe.env"]);
  assert.deepEqual(ds.filter((d) => d.section === "Unit" && /^(After|Wants)$/.test(d.key)).map((d) => d.value), ["network-online.target", "network-online.target"]);
  // Worst case of one start (ms): 8 GETs x the verifier's GET bound, two rereads, the verifier child, the mail's single deadline, a margin.
  const worst = 8 * VERIFY_BOUNDS.TIMEOUT_MS + 2 * P.REREAD_DELAY_MS + P.VERIFIER_TIMEOUT_MS + MAX_SMTP_DEADLINE_MS + START_MARGIN_MS;
  assert.ok(worst < 1000 * Number(want.TimeoutStartSec), `the worst case ${String(worst)} ms stays under TimeoutStartSec`);
  const quota = 100 / Number(/^([0-9]+)%$/.exec(one(ds, "Service", "CPUQuota"))?.[1]);
  assert.ok(P.VERIFIER_TIMEOUT_MS >= 586_900 * quota * 1.25, "DOJO-VERIFY-SCALE-1: the worst CLI, 586.9 s of CPU, under the quota, x 1.25");
  const mib = (u: readonly Directive[]): number => Number(/^([0-9]+)M$/.exec(one(u, "Service", "MemoryMax"))?.[1]);
  assert.ok(mib(ds) >= mib(ps) + mib(ns), "the probe's envelope (monark-probe) plus its verifier child's (the publish unit)");
  assert.equal(`--max-old-space-size=${String(P.VERIFIER_HEAP_MIB)}`, one(ps, "Service", "ExecStart").split(" ")[2], "the child's heap is the publish unit's");
});

// reddened by: a tree that misses a module the probe or the verifier's CLI loads, holds one more file or not the keyring, a default
// path (verifier, keyring) outside it, a default base off the site's proxy prefix or off the Dojo host, or a RUNBOOK that ships, runs
// or enables anything but these files and units, writes the simulated record over the production one, or names a host by address
// killer: scripts/probe-dojo-live.mjs:54 CONST "\"scripts/probe-narabi.mjs\"" -> "\"scripts/probe-narabi.d.mts\""
test("dojo_probe_tree_is_the_import_closure", () => {
  const IMPORT = /^[ ]*(?:import|export)[ ]+(?!type[ ])(?:[^'";]*?[ ]from[ ]*)?["']([^"']+)["']/gm, rel = (p: string): string => relative(REPO, p).split(sep).join("/");
  const out = new Set<string>([rel(P.DEFAULT_KEYRING)]), todo = [rel(PROBE), rel(P.DEFAULT_VERIFIER)];
  for (let f = todo.pop(); f !== undefined; f = todo.pop()) {
    if (out.has(f)) continue;
    out.add(f);
    for (const m of read(f).matchAll(IMPORT)) if (!(m[1] ?? "").startsWith("node:")) todo.push(posix.join(posix.dirname(f), m[1] ?? ""));
  }
  assert.deepEqual([...out].sort(), [...P.DOJO_PROBE_TREE_PATHS], "the tree == the closure of the probe and the verifier's CLI, plus the keyring");
  assert.deepEqual([P.DEFAULT_HOST, P.DEFAULT_PROXY], [DOJO_HOST, `${new URL(NARABI_URL).origin}${DOJO_LIVE_PREFIX.slice(0, -1)}`]);
  assert.ok(read("deploy/Caddyfile.monark-dojo-site.snippet").includes(`handle_path ${DOJO_LIVE_PREFIX}* {`), "the proxy's prefix");
  // RUNBOOK-dojo section 25 (Branchement): the tree read from the constant at the G7, the units from their blobs, a simulated start.
  const text = read("docs/RUNBOOK-dojo.md"), a = text.indexOf("\n## 25. "), b = text.indexOf("\n## ", a + 1), s = text.slice(a, b);
  assert.ok(a > 0 && b > a, "section 25 of the RUNBOOK");
  for (const x of ["m.DOJO_PROBE_TREE_PATHS.join(' ')", `tar xzf - -C ${P.DOJO_PROBE_TREE_ROOT} `, `"$G7:deploy/$u"`, "systemctl enable --now monark-dojo-probe.timer",
    `${posix.dirname(P.DEFAULT_OUT)}/dojo-live-sim.json`, "--uid=probe --gid=probe", "apps/dojo/keys/dojo-keyring.json", "root@bell.monarkgate.tech"]) {
    assert.ok(s.includes(x), `section 25: ${x}`);
  }
  for (const [k, v] of [["ProtectSystem", "strict"], ["ReadWritePaths", posix.dirname(P.DEFAULT_OUT)], ["MemoryMax", "640M"], ["CPUQuota", "25%"]]) {
    assert.ok(s.includes(`-p ${k ?? ""}=${v ?? ""}`) && one(unit(DOJO_SVC), "Service", k ?? "") === v, `the simulated start carries the unit's ${k ?? ""}`);
  }
  assert.ok(!s.includes(`--out ${P.DEFAULT_OUT}`) && !/[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}/.test(s), "never the production record, never an address");
  assert.ok(s.indexOf("systemd-run") < s.indexOf("systemctl enable --now monark-dojo-probe.timer"), "the simulated start before the timer");
});
