// MONARK Bell -- the probe off Bell's host, scripts/probe-bell.mjs (G0 BELL-COLLECT-TIMER-1 DC-9, DC-15 and section 13 L-1 to L-3; PLAN-P4
// section 4 "4a", its thirteen tests). Offline: the entry point runProbe runs in process with an injected clock and transport, the fake fetch
// answering only from an in-memory tree keyed by the URLs of the two constant origins; signed lines come from keys generated here and, for the
// differential, from the real publisher. The probe is imported by its URL (it has no type sidecar: ProbeBell below is its surface).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { chmodSync, existsSync, linkSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GENESIS, canonical, keyringOf, lineHash, signLine, trustOf as readerTrustOf, walkTimeline } from "../apps/bell/scripts/bell-chain.mjs";
import { publishToDir, revokeKey, rotateKey } from "../apps/bell/scripts/bell-publish.mjs";
import { dropRun, servedState, T_PUBLISH } from "../apps/bell/test/helpers/bell-served.ts";
import { dueInstant, unitOf } from "../apps/bell/src/plan.ts";
import { CALENDAR_RANGE, isTradingDay, nextTradingDay } from "../apps/bell/src/sessions.ts";
import { DEFAULT_MAX_BYTES } from "../scripts/probe-narabi.mjs";
import * as D from "../scripts/bell-deploy.mjs";

type Obj = Record<string, unknown>;
interface Report { status: string; alerts: string[]; served_lines: number | null; kept_lines: number | null; new_lines: number | null; head_seq: number | null;
  head_line_hash: string | null; due_unit: string | null; legacy_origin: string | null; site_status: string | null; site_status_since: string | null;
  alerted: boolean; alert_error: string | null; last_alert_day: string | null }
interface Got { ok: boolean; reason?: string; status: number | null; body?: Buffer }
type Get = (url: string, maxBytes?: number) => Promise<Got>;
type Fetch = (url: string, init?: { redirect?: string; headers?: unknown }) => Promise<Response>;
type Smtp = (a: Obj) => Promise<{ ok: boolean; error?: string }>;
type Trust = NonNullable<ReturnType<typeof readerTrustOf>>;
interface ProbeBell {
  DEFAULT_KEYRING: string; BELL_PROBE_TREE_PATHS: readonly string[]; BELL_PROBE_ALERTS: readonly string[]; BELL_PROBE_KEYS: readonly string[];
  CALENDAR_FREE_BOUND_H: number; SITE_STATUS_LAG_MIN: number; MAX_LINE_BYTES: number; SMTP_PASS_MAX_BYTES: number;
  trustOf: (k: unknown) => Trust | null; walkLines: (lines: readonly unknown[], trust: Trust, from?: number) => unknown;
  unitEndOf: (d: string) => number; dueInstantOf: (d: string) => number; deadlineOf: (d: string) => number;
  freshnessOf: (nowMs: number, lastEnd: number | null) => { due_unit: string | null; stale: boolean; bound: boolean };
  httpTransport: (f: Fetch) => Get; compareOrigins: (p: string, l: string, t: Get) => Promise<{ verdict: string; alert: string | null }>;
  runProbe: (argv: string[], deps: { clock: () => number; fetch: Fetch; smtp: Smtp }) => Promise<{ exitCode: number; report: Report | null }>;
}
const REPO = fileURLToPath(new URL("../", import.meta.url)), PROBE = join(REPO, "scripts", "probe-bell.mjs");
const P = (await import(pathToFileURL(PROBE).href)) as ProbeBell;
/** A repository file, asserted present first: a mutation reddens by an assertion, never by ENOENT. */
function read(rel: string): string {
  assert.ok(existsSync(REPO + rel), `${rel} exists`);
  return readFileSync(REPO + rel, "utf8");
}
const dirs: string[] = [];
after(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
function scratch(): string { const d = mkdtempSync(join(tmpdir(), "bell-probe-")); dirs.push(d); return d; }
function file(name: string, text: string | Buffer, mode = 0o600): string { const f = join(scratch(), name); writeFileSync(f, text); chmodSync(f, mode); return f; }

// ---- keys, lines, the served tree, one run ----------------------------------------------------------------------------------------
const gen = (): KeyObject => generateKeyPairSync("ed25519").privateKey;
const K1 = gen(), K2 = gen(), K3 = gen(), idOf = (k: KeyObject): string => keyringOf(k, 1).keys[0]?.key_id ?? "";
const KR1 = file("keyring.json", JSON.stringify(keyringOf(K1, 1))), PASS = file("smtp-pass", "secret-x\n");
const KR12 = file("keyring-12.json", JSON.stringify({ schema: "bell-keyring-v1", keys: [K1, K2].map((k) => keyringOf(k, 1).keys[0]) }));
const ORIGIN = D.BELL_PUBLIC_ORIGIN, TL = `${ORIGIN}/timeline.jsonl`, STATUS = `${ORIGIN}/api/v1/status.json`;
const iso = (t: number): string => new Date(t).toISOString();
/** `l` signed again: sig by its key_id's key (else `key`), sig_new by its new_key_id's key on a rotation. */
const BY_ID = new Map([K1, K2, K3].map((k) => [idOf(k), k]));
function resign(l: Obj, key = K1): Obj {
  const c = { ...l };
  delete c.sig;
  delete c.sig_new;
  const nk = BY_ID.get(String(c.new_key_id));
  if (c.kind === "key_rotation" && nk !== undefined) c.sig_new = signLine(c, nk);
  c.sig = signLine(c, BY_ID.get(String(c.key_id)) ?? key);
  return c;
}
/** Publication n after `prev`, its one run's window ending at `end` (a unit's end minus 1 s, apps/bell/src/tick.ts:350). */
const pub = (seq: number, prev: Obj | null, end: number, key = K1): Obj => resign({ schema: "bell-timeline-v1", seq, kind: "publication",
  published_at: iso(end + 43_200_000), prev_line_hash: prev === null ? GENESIS : lineHash(prev), key_id: idOf(key), state_sha256: "a".repeat(64),
  provenance_sha256: "b".repeat(64), runs: [{ bell_sha: "c".repeat(64), window: { from_utc_ms: end - 86_399_000, to_utc_ms: end }, records: 1 }] }, key);
/** One publication per unit of `days`, chained. */
function chain(days: readonly string[], key = K1): Obj[] {
  const out: Obj[] = [];
  for (const d of days) out.push(pub(out.length + 1, out.at(-1) ?? null, P.unitEndOf(d) - 1000, key));
  return out;
}
const bytes = (lines: readonly Obj[]): Buffer => Buffer.from(lines.map((l) => `${canonical(l)}\n`).join(""));
const OCT = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"], NOON = "2026-10-19T12:00:00.000Z"; // U(Fri 10-16) due by Monday 10:57Z
interface Reply { status: number; body?: Buffer; location?: string }
type Answer = Buffer | Reply | ((n: number) => Buffer | Reply);
/** A fetch over `tree`: 200 with the bytes, an answer as given, else 404; every URL and init recorded. */
function fakeFetch(tree: ReadonlyMap<string, Answer>, seen: string[], inits: unknown[] = []): Fetch {
  return (url, init) => {
    const n = seen.filter((u) => u === url).length;
    seen.push(url);
    inits.push(init);
    const t = tree.get(url), a = typeof t === "function" ? t(n) : t;
    if (a === undefined) return Promise.resolve(new Response(null, { status: 404 }));
    if (Buffer.isBuffer(a)) return Promise.resolve(new Response(new Uint8Array(a), { status: 200 }));
    const b = a.body === undefined ? null : new Uint8Array(a.body);
    return Promise.resolve(new Response(b, { status: a.status, headers: a.location === undefined ? {} : { location: a.location } }));
  };
}
interface Run { exitCode: number; report: Report; seen: string[]; inits: unknown[]; mails: Obj[] }
async function run(o: { state: string; tree: ReadonlyMap<string, Answer>; now: string; keyring?: string | null; smtp?: Smtp; argv?: string[] }): Promise<Run> {
  const seen: string[] = [], inits: unknown[] = [], mails: Obj[] = [];
  const smtp = o.smtp ?? ((a: Obj): Promise<{ ok: boolean }> => { mails.push(a); return Promise.resolve({ ok: true }); });
  const argv = o.argv ?? ["--state", o.state, ...(o.keyring === null ? [] : ["--keyring", o.keyring ?? KR1]), "--smtp-pass-file", PASS];
  const r = await P.runProbe(argv, { clock: () => Date.parse(o.now), fetch: fakeFetch(o.tree, seen, inits), smtp });
  return { exitCode: r.exitCode, report: r.report as Report, seen, inits, mails };
}
const kept = (state: string): string => { const p = join(state, "bell", "timeline.jsonl"); return existsSync(p) ? readFileSync(p, "utf8") : ""; };

// reddened by: a fermeture that gains a file of apps/bell/scripts/, of apps/bell/src/ but sessions.ts, any other module, or a node: module off
// its closed list (node:child_process first);
// a tree list that is not the computed closure plus the committed keyring; a default keyring off the committed one
// killer: scripts/probe-bell.mjs:38 CONST "\"apps/bell/src/sessions.ts\", " -> ""
test("bell_probe_closure_holds_no_bell_verification_code", () => {
  const IMPORT = /^[ ]*(?:import|export)[ ]+(?!type[ ])(?:[^'";]*?[ ]from[ ]*)?["']([^"']+)["']/gm, closure = new Set<string>(), builtins = new Set<string>();
  for (let todo = ["scripts/probe-bell.mjs"], f = todo.pop(); f !== undefined; f = todo.pop()) {
    if (closure.has(f)) continue;
    closure.add(f);
    const text = read(f);
    const code = text.split("\n").filter((l) => !/^\s*(\/\/|\/?\*)/.test(l)).join("\n"); // comment lines out
    assert.doesNotMatch(code, /\bimport\s*\(|\brequire\s*\(/, `${f}: no dynamic import, no require: the static graph is the whole closure`);
    for (const m of text.matchAll(IMPORT)) { const s = m[1] ?? ""; if (s.startsWith("node:")) builtins.add(s); else todo.push(posix.join(posix.dirname(f), s)); }
  }
  // G0 section 13 L-1: the probe, its OpenTimestamps client (lot 4b), probe-narabi (transport and SMTP), bell-deploy (constants), sessions.ts.
  const ADMITTED = ["scripts/probe-bell.mjs", "scripts/probe-bell-ots.mjs", "scripts/probe-narabi.mjs", "scripts/bell-deploy.mjs", "apps/bell/src/sessions.ts"];
  assert.deepEqual([...closure].filter((f) => !ADMITTED.includes(f)), [], "nothing of apps/bell/scripts/, nothing of apps/bell/src/ but sessions.ts");
  assert.ok(["scripts/probe-bell.mjs", "scripts/probe-narabi.mjs", "scripts/bell-deploy.mjs", "apps/bell/src/sessions.ts"].every((f) => closure.has(f)), "the four files of lot 4a");
  assert.deepEqual([...builtins].sort(), ["node:crypto", "node:fs", "node:net", "node:path", "node:tls", "node:url"], "a closed list of node: modules, no child: the probe checks with its own code");
  assert.deepEqual([...P.BELL_PROBE_TREE_PATHS], [...closure, "apps/bell/keys/bell-keyring.json"].sort(), "the tree == the computed closure plus the committed keyring");
  assert.equal(relative(REPO, P.DEFAULT_KEYRING).split(sep).join("/"), "apps/bell/keys/bell-keyring.json", "the trust root is the committed keyring");
});

// reddened by: collection slots or a publisher bound off the committed units; a deadline off the first slot at or after the due instant plus
// the tick's and the publisher's TimeoutStartSec plus 10 minutes; a false alarm on a Sunday, a holiday or a Monday morning; a missed unit unseen
// killer: scripts/bell-deploy.mjs:100 CONST "\"09:45\"" -> "\"10:45\""
test("bell_probe_freshness_follows_the_trading_calendar", () => {
  const slots = [...read("deploy/monark-bell-collect.timer").matchAll(/^OnCalendar=\*-\*-\* (\d{2}:\d{2}):00 UTC$/gm)].map((m) => m[1]);
  const tss = (f: string): number[] => [...read(f).matchAll(/^TimeoutStartSec=(\d+)$/gm)].map((m) => Number(m[1]));
  assert.deepEqual([[...D.BELL_COLLECT_SLOTS_UTC], tss("deploy/monark-bell-publish.service"), tss("deploy/monark-bell-collect.service")],
    [slots, [D.BELL_PUBLISH_TIMEOUT_START_SEC], [D.TICK_TIMEOUT_START_SEC]], "the slots of the timer, in order; the two units' TimeoutStartSec");
  assert.equal(slots.length, 4, "four slots");
  // U(Thu 10-15) due Fri 20:00Z (its gate), slot 20:15Z; U(Fri 10-16) due Monday 08:30Z (its end plus 30 min), slot 08:45Z; then + 7200 + 120 + 600 s.
  assert.deepEqual([iso(P.deadlineOf("2026-10-15")), iso(P.deadlineOf("2026-10-16"))], ["2026-10-16T22:27:00.000Z", "2026-10-19T10:57:00.000Z"]);
  const f = (now: string, d: string): [string | null, boolean, boolean] => { const x = P.freshnessOf(Date.parse(now), P.unitEndOf(d) - 1000); return [x.due_unit, x.stale, x.bound]; };
  assert.deepEqual(f("2026-10-18T12:00:00Z", "2026-10-15"), ["2026-10-15", false, false], "Sunday: U(Thu) covered is enough");
  assert.deepEqual(f("2026-10-19T10:56:00Z", "2026-10-15"), ["2026-10-15", false, false], "Monday morning before the deadline of U(Fri): no alert");
  assert.deepEqual(f("2026-10-19T10:58:00Z", "2026-10-15"), ["2026-10-16", true, false], "Monday after it: the missed unit alerts");
  assert.deepEqual(f("2026-10-19T10:58:00Z", "2026-10-16"), ["2026-10-16", false, false], "and its publication silences it");
  assert.deepEqual(f("2026-11-26T23:00:00Z", "2026-11-24"), ["2026-11-24", false, false], "Thanksgiving (2026-11-26, closed): no alert");
  assert.deepEqual(f("2026-11-27T11:00:00Z", "2026-11-24"), ["2026-11-24", false, false], "the half day after it, before 11:57Z: none either");
  assert.deepEqual(f("2026-11-27T12:00:00Z", "2026-11-24"), ["2026-11-25", true, false], "past the deadline of U(Wed 11-25): it alerts");
  assert.deepEqual(P.freshnessOf(Date.parse(NOON), null), { due_unit: "2026-10-16", due_by_utc: "2026-10-19T10:57:00.000Z", stale: true, bound: true }, "no publication: stale");
});

// reddened by: a stale timeline, a broken chain, a bad signature, a rewritten line or a head a revocation voids passed as healthy, or a run
// off its closed keys
// killer: scripts/probe-bell.mjs:170 CONST "unitEndOf(due) - 1000" -> "unitEndOf(due)"
test("bell_probe_alerts_on_stale_broken_or_rewritten", async () => {
  const lines = chain(OCT), state = scratch(), ok = await run({ state, tree: new Map([[TL, bytes(lines)]]), now: NOON });
  assert.deepEqual([ok.exitCode, ok.report.status, ok.report.alerts, ok.report.due_unit, ok.report.head_seq, ok.report.new_lines], [0, "healthy", [], "2026-10-16", 4, 4]);
  assert.deepEqual(Object.keys(ok.report), [...P.BELL_PROBE_KEYS], "bell.json: its closed keys, in order");
  assert.deepEqual(JSON.parse(readFileSync(join(state, "bell.json"), "utf8")), ok.report, "the report written is the report returned");
  const late = await run({ state: scratch(), tree: new Map([[TL, bytes(chain(OCT.slice(0, 3)))]]), now: NOON });
  assert.deepEqual([late.exitCode, late.report.alerts, late.report.due_unit], [1, ["stale"], "2026-10-16"], "U(Fri) missed by Monday noon");
  const at = (i: number, l: Obj): Obj[] => lines.map((x, j) => (j === i ? l : x));
  const cut = String(lines[3]?.sig), sig = `${cut.slice(0, 4)}${cut[4] === "A" ? "B" : "A"}${cut.slice(5)}`;
  for (const [what, tl, reason, keptN] of [["a prev_line_hash off the chain, signed", at(2, resign({ ...lines[2], prev_line_hash: "f".repeat(64) })), "chain_broken", 2],
    ["a signature altered", at(3, { ...lines[3], sig }), "signature_invalid", 3], ["a line rewritten, signed", at(1, resign({ ...lines[1], records: 2 })), "chain_broken", 2]] as const) {
    const r = await run({ state: scratch(), tree: new Map([[TL, bytes(tl)]]), now: NOON });
    assert.deepEqual([r.exitCode, r.report.alerts.includes(reason), r.report.kept_lines], [1, true, keptN], what);
  }
  const rewritten = await run({ state, tree: new Map([[TL, bytes(at(1, resign({ ...lines[1], records: 2 })))]]), now: NOON });
  assert.deepEqual([rewritten.exitCode, rewritten.report.alerts], [1, ["prefix_rewritten"]], "against the kept copy, a rewrite is named as such");
  for (const r of [ok, late, rewritten]) assert.ok(r.report.alerts.every((a) => P.BELL_PROBE_ALERTS.includes(a)), "closed alert names");
  // A head voided as bell-verify.mjs refuses it: by a later revocation of its key (the publisher's rotateKey, then revokeKey), or by the keyring.
  // killer: scripts/probe-bell.mjs:249 CONST "w.voided.includes(w.head.seq)" -> "false"
  const { state: pubState, pub: pubDir } = servedState(K1, 3), served = (): Buffer => readFileSync(join(pubDir, "timeline.jsonl"));
  rotateKey({ stateDir: pubState, oldKey: K1, newKey: K2, clock: () => T_PUBLISH + 10 });
  const rotated = served();
  revokeKey({ stateDir: pubState, key: K2, revokedKeyId: idOf(K1), revokedFromSeq: 3, clock: () => T_PUBLISH + 12 });
  const voids = async (body: Buffer): Promise<[number, boolean, number | null]> => {
    const x = await run({ state: scratch(), tree: new Map([[TL, body]]), now: iso(T_PUBLISH + 60_000), keyring: KR12 });
    return [x.exitCode, x.report.alerts.includes("head_signed_by_revoked_key"), x.report.head_seq];
  };
  assert.deepEqual([await voids(rotated), await voids(served())], [[1, false, 3], [1, true, 3]], "the head (seq 3) voided by the revocation of K1 from seq 3");
  const marked = file("kr-revoked.json", JSON.stringify({ schema: "bell-keyring-v1", keys: [{ ...keyringOf(K1, 1).keys[0], revoked_from_seq: 3 }] }));
  const byRing = await run({ state: scratch(), tree: new Map([[TL, bytes(lines)]]), now: NOON, keyring: marked });
  assert.deepEqual([byRing.exitCode, byRing.report.alerts, byRing.report.head_seq], [1, ["head_signed_by_revoked_key"], 4], "a revoked_from_seq of the keyring voids the head too");
});

// reddened by: a line checked against a key the timeline or the site serves, a default trust root other than the committed keyring, or a
// malformed keyring that does not stop the check
// killer: scripts/probe-bell.mjs:32 CONST "../apps/bell/keys/bell-keyring.json" -> "../apps/dojo/keys/dojo-keyring.json"
test("bell_probe_verifies_against_the_committed_keyring_not_the_served_key", async () => {
  const committed = JSON.parse(read("apps/bell/keys/bell-keyring.json")) as unknown;
  assert.equal(P.trustOf(committed)?.size, readerTrustOf(committed)?.size, "the committed keyring parses, as the reader parses it");
  const served = new Map<string, Answer>([[TL, bytes(chain(OCT, K2))], [`${ORIGIN}/bell/pubkey.json`, Buffer.from(JSON.stringify(keyringOf(K2, 1)))]]);
  const supplied = await run({ state: scratch(), tree: served, now: NOON });
  assert.deepEqual([supplied.exitCode, supplied.report.alerts.includes("key_not_in_keyring"), supplied.report.new_lines], [1, true, 0], "K2 is served, never trusted");
  const byDefault = await run({ state: scratch(), tree: served, now: NOON, keyring: null });
  assert.deepEqual([byDefault.report.alerts.includes("key_not_in_keyring"), byDefault.report.alerts.includes("keyring_invalid")], [true, false], "no --keyring: the committed one, which does not hold K2");
  assert.ok([...supplied.seen, ...byDefault.seen].every((u) => !u.includes("pubkey")), "bell/pubkey.json is never read");
  const own = await run({ state: scratch(), tree: new Map([[TL, bytes(chain(OCT))]]), now: NOON, keyring: file("kr.json", JSON.stringify({ ...keyringOf(K1, 1), schema: "x" })) });
  assert.deepEqual([own.exitCode, own.report.alerts, own.seen], [1, ["keyring_invalid"], []], "a malformed trust root: nothing read, nothing trusted");
});

// reddened by: a GET by range or a body read past DEFAULT_MAX_BYTES, the kept prefix checked again line by line instead of byte for byte, a
// new line after it taken unchecked (a bad signature, a broken chain), a line past MAX_LINE_BYTES named otherwise than too_large, a torn
// tail kept, or a refused read that touches the kept copy
// killer: scripts/probe-bell.mjs:245 CONST "trust, k.parsed.length)" -> "trust, 0)"
test("bell_probe_reads_the_timeline_incrementally_and_checks_the_kept_prefix", async () => {
  const lines = chain(OCT.slice(1)), state = scratch();
  const first = await run({ state, tree: new Map([[TL, bytes(lines.slice(0, 2))]]), now: NOON });
  assert.deepEqual([first.report.new_lines, first.report.kept_lines, kept(state)], [2, 2, bytes(lines.slice(0, 2)).toString()]);
  assert.ok(first.inits.every((i) => (i as { headers?: unknown }).headers === undefined && (i as { redirect?: string }).redirect === "manual"), "no Range: the whole file, no redirect followed");
  // The kept line 2 carries a signature no key makes (as a line checked under an earlier keyring would): only the line after it is checked.
  const odd = { ...lines[1], sig: "A".repeat(86) }, three = resign({ ...lines[2], prev_line_hash: lineHash(odd) });
  writeFileSync(join(state, "bell", "timeline.jsonl"), bytes([lines[0] ?? {}, odd]));
  const next = await run({ state, tree: new Map([[TL, bytes([lines[0] ?? {}, odd, three])]]), now: NOON });
  assert.deepEqual([next.exitCode, next.report.alerts, next.report.served_lines, next.report.new_lines, next.report.kept_lines], [0, [], 3, 1, 3], "the kept prefix is not checked again");
  const before = kept(state);
  // The steady state: a new line after the kept prefix (from = its length) is checked, a signature altered, then a prev_line_hash off the chain.
  // killer: scripts/probe-bell.mjs:117 CONST "check = i >= from," -> "check = i >= from && (from === 0 || i > from),"
  const four = pub(4, three, P.unitEndOf("2026-10-19") - 1000), s4 = String(four.sig), forged = { ...four, sig: `${s4.slice(0, 4)}${s4[4] === "A" ? "B" : "A"}${s4.slice(5)}` };
  for (const [what, line, alert] of [["a signature altered", forged, "signature_invalid"], ["a prev_line_hash off the chain, signed", resign({ ...four, prev_line_hash: "f".repeat(64) }), "chain_broken"]] as const) {
    const r = await run({ state, tree: new Map([[TL, bytes([lines[0] ?? {}, odd, three, line])]]), now: NOON });
    assert.deepEqual([r.exitCode, r.report.alerts, r.report.new_lines, kept(state)], [1, [alert], 0, before], `a new line, ${what}: named, never kept`);
  }
  // A new line past MAX_LINE_BYTES (its LF included) is too_large, as bell-verify.mjs:90 names it; a line of MAX_LINE_BYTES is parsed, then judged.
  // killer: scripts/probe-bell.mjs:248 CONST "? \"too_large\" :" -> "? w.reason :"
  const big = (n: number): Buffer => Buffer.from(`${before}{"pad":"${"x".repeat(n - 11)}"}\n`);
  for (const [n, alert] of [[P.MAX_LINE_BYTES + 1, "too_large"], [P.MAX_LINE_BYTES, "timeline_malformed"]] as const) {
    const r = await run({ state, tree: new Map([[TL, big(n)]]), now: NOON });
    assert.deepEqual([r.exitCode, r.report.alerts, r.report.new_lines, kept(state)], [1, [alert], 0, before], `a new line of ${String(n)} bytes`);
  }
  for (const [what, body, alert] of [["one byte past DEFAULT_MAX_BYTES", Buffer.alloc(DEFAULT_MAX_BYTES + 1, 0x20), "too_large"],
    ["shorter than the kept copy", bytes(lines.slice(0, 2)), "prefix_rewritten"], ["a torn last line", Buffer.from(`${before}{"seq":4`), "timeline_malformed"]] as const) {
    const r = await run({ state, tree: new Map([[TL, body]]), now: NOON });
    assert.deepEqual([r.exitCode, r.report.alerts.includes(alert), kept(state)], [1, true, before], `${what}: named, the kept copy untouched`);
  }
});

// reddened by: a kept prefix compared otherwise than byte for byte (a rewritten line re-signed and re-chained, a truncation, one byte of a
// signature), or a kept copy overwritten by a rewritten timeline
// killer: scripts/probe-bell.mjs:243 CONST "!got.body.subarray(0, kept.length).equals(kept)" -> "false"
test("bell_probe_detects_rewrite_against_kept_copy", async () => {
  const lines = chain(OCT), state = scratch(), tree = (l: readonly Obj[]): Map<string, Answer> => new Map([[TL, bytes(l)]]);
  assert.equal((await run({ state, tree: tree(lines), now: NOON })).exitCode, 0);
  const before = kept(state), two = resign({ ...lines[1], published_at: "2026-10-16T00:00:00.000Z" }), three = resign({ ...lines[2], prev_line_hash: lineHash(two) });
  const four = resign({ ...lines[3], prev_line_hash: lineHash(three) }), forged = [lines[0] ?? {}, two, three, four];
  assert.equal(walkTimeline(forged, readerTrustOf(keyringOf(K1, 1)) as Trust).ok, true, "the forged timeline chains and verifies on its own");
  const last = String(lines[3]?.sig), flip = [...lines.slice(0, 3), { ...lines[3], sig: `${last.slice(0, -1)}${last.endsWith("A") ? "Q" : "A"}` }];
  for (const [what, l] of [["a line rewritten, the rest re-chained and re-signed", forged], ["a truncation", lines.slice(0, 3)], ["one signature character", flip]] as const) {
    const r = await run({ state, tree: tree(l), now: NOON });
    assert.deepEqual([r.exitCode, r.report.alerts, r.report.kept_lines, r.report.head_seq, kept(state)], [1, ["prefix_rewritten"], 4, 4, before], what);
  }
  assert.deepEqual((await run({ state, tree: tree(lines), now: NOON })).report.alerts, [], "the original served again: healthy");
});

// reddened by: an exit other than 0 healthy / 1 unhealthy or a failed mail or a refused write / 2 usage; a mail off the machine (one on entry,
// one a UTC day, one on recovery, at most one a run); a password taken from the environment or a password file off its rules; a usage error
// that writes; a report written in place, a temporary file left, or a report the disk refuses that exits 0. The mode-bit and symbolic-link
// cases run on POSIX only, the procfs case on Linux only (the CI): on win32 they do not run, and nothing in the report says so.
// killer: scripts/probe-bell.mjs:375 CONST " || r.alert_error !== null" -> ""
test("bell_probe_exits_1_when_unhealthy_or_mail_fails", async () => {
  const MAIL = { SMTP_HOST: "127.0.0.1", SMTP_PORT: "2525", SMTP_TLS: "none", SMTP_USER: "probe", ALERT_FROM: "probe@monark.test", ALERT_TO: "ops@monark.test" };
  const saved = { ...process.env };
  try {
    Object.assign(process.env, MAIL);
    // U(Monday 10-19) is due by Tue 22:27Z: the timeline that stops at U(Fri) is healthy Monday, stale Tuesday night, healed by U(Monday).
    const tree = (days: readonly string[]): Map<string, Answer> => new Map<string, Answer>([[TL, bytes(chain(days))]]), state = scratch();
    const good = tree(OCT), healed = tree([...OCT, "2026-10-19"]), stale = tree(OCT.slice(0, 3));
    const r0 = await run({ state, tree: good, now: NOON });
    const r1 = await run({ state, tree: good, now: "2026-10-20T23:00:00.000Z" });
    const r2 = await run({ state, tree: good, now: "2026-10-20T23:30:00.000Z" });
    const r3 = await run({ state, tree: good, now: "2026-10-21T11:00:00.000Z" });
    const failed = await run({ state, tree: healed, now: "2026-10-21T12:00:00.000Z", smtp: () => Promise.resolve({ ok: false, error: "smtp_rejected" }) });
    const r4 = await run({ state, tree: healed, now: "2026-10-21T12:00:00.000Z" });
    assert.deepEqual([r0, r1, r2, r3, failed, r4].map((r) => [r.exitCode, r.report.status, r.mails.length, r.report.alerted, r.report.alert_error]),
      [[0, "healthy", 0, false, null], [1, "unhealthy", 1, true, null], [1, "unhealthy", 0, true, null], [1, "unhealthy", 1, true, null],
        [1, "healthy", 0, true, "smtp_rejected"], [0, "healthy", 1, false, null]], "alert, same day nothing, a reminder the next UTC day, a failed recovery retried");
    const [alert, reminder, recovery] = [r1, r3, r4].map((r) => String(r.mails[0]?.message));
    assert.match(String(alert), /\nSubject: \[MONARK\] Bell probe notice\n[\s\S]*\ncondition: alert\nstatus: unhealthy\nalerts: stale\nhead_seq: 4\ndue_unit: 2026-10-19\n/);
    assert.match(String(reminder), /\ncondition: reminder\n/);
    assert.match(String(recovery), /\ncondition: recovered\nstatus: healthy\nalerts: none\n/);
    for (const m of [alert, reminder, recovery]) assert.doesNotMatch(String(m), /:\/\/|secret-x|verified|guarantee|score|partner|autonomous/i, "no URL, no password, no banned word");
    process.env.SMTP_PASS = "env-pass";
    const leak = await run({ state: scratch(), tree: stale, now: NOON });
    assert.deepEqual([leak.report.alerts, leak.mails[0]?.pass], [["secret_in_environment", "stale"], "secret-x"], "SMTP_PASS in the environment alerts; the file's password is sent");
    delete process.env.SMTP_PASS;
    const none = await run({ state: scratch(), tree: stale, now: NOON, argv: ["--state", scratch(), "--keyring", KR1, "--smtp-pass-file", join(scratch(), "absent")] });
    assert.deepEqual([none.exitCode, none.report.alert_error, none.mails.length], [1, "smtp_unconfigured", 0], "no password file: no mail, named");
    // The password file's rules (readSmtpPass, as probe-dojo-live.mjs reads its own): two forms accepted, six refused, a refusal sends nothing.
    // killer: scripts/probe-bell.mjs:291 CONST "? text : null" -> "? text : text"
    // killer: scripts/probe-bell.mjs:287 CONST "st.size > SMTP_PASS_MAX_BYTES || " -> ""
    const pw = async (f: string): Promise<[string | null, unknown[]]> => {
      const x = await run({ state: "", tree: stale, now: NOON, argv: ["--state", scratch(), "--keyring", KR1, "--smtp-pass-file", f] });
      return [x.report.alert_error, x.mails.map((m) => m.pass)];
    };
    const long = "x".repeat(P.SMTP_PASS_MAX_BYTES - 1);
    for (const [text, pass] of [["pw\r\n", "pw"], [`${long}\n`, long]] as const) assert.deepEqual(await pw(file("pw", text)), [null, [pass]], `accepted: ${JSON.stringify(text.slice(0, 8))}`);
    for (const text of ["", "\n", "two\nlines\n", `${"x".repeat(P.SMTP_PASS_MAX_BYTES)}\n`, "\uFEFFbom-pass\n", Buffer.from("bad-pass\xff\n", "latin1")]) {
      assert.deepEqual(await pw(file("pw", text)), ["smtp_unconfigured", []], `refused: ${JSON.stringify(String(text).slice(0, 16))}`);
    }
    // On POSIX only (win32 has no mode bits, no O_NOFOLLOW): a file its group may read, a symbolic link; on Linux only, a procfs file.
    // killer: scripts/probe-bell.mjs:287 CONST " || (process.platform !== \"win32\" && (st.mode & 0o077) !== 0)" -> ""
    // killer: scripts/probe-bell.mjs:289 SDL "if (n !== st.size) return null;" -> ""
    if (process.platform !== "win32") {
      const link = join(scratch(), "pw-link");
      symlinkSync(file("pw", "linked-pass\n"), link);
      assert.deepEqual([await pw(file("pw", "open-pass\n", 0o640)), await pw(link)], [["smtp_unconfigured", []], ["smtp_unconfigured", []]], "group-readable; a symbolic link");
    }
    if (process.platform === "linux") assert.deepEqual(await pw("/proc/self/personality"), ["smtp_unconfigured", []], "a regular file whose fstat size is not its byte count");
  } finally { for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k]; Object.assign(process.env, saved); }
  for (const argv of [["--state"], ["--keyring", KR1], ["--state", "a", "--state", "b"], ["--origin", ORIGIN, "--state", "a"]]) {
    const empty = scratch(), r = await P.runProbe(argv.map((x) => (x === "a" || x === "b" ? join(empty, x) : x)), { clock: () => 0, fetch: () => Promise.reject(new Error("no")), smtp: () => Promise.reject(new Error("no")) });
    assert.deepEqual([r.exitCode, r.report, existsSync(join(empty, "a")), existsSync(join(empty, "b"))], [2, null, false, false], `usage ${argv.join(" ")}: exit 2, nothing written`);
  }
  const blocked = file("not-a-dir", "x"), refused = await run({ state: blocked, tree: new Map([[TL, bytes(chain(OCT))]]), now: NOON });
  assert.deepEqual([refused.exitCode, refused.report.alerts], [1, ["write_refused"]], "a write the disk refuses: exit 1");
  // bell.json is renamed over, never written in place: a hard link to the prior report keeps its bytes; no temporary file is left.
  // killer: scripts/probe-bell.mjs:339 CONST "const fd = openSync(tmp, \"wx\", 0o644);" -> "writeFileSync(path, data); return;"
  const s7 = scratch(), tree7 = new Map<string, Answer>([[TL, bytes(chain(OCT))]]), out7 = join(s7, "bell.json"), prior7 = join(s7, "prior.json");
  const tmps = (): string[] => [s7, join(s7, "bell")].flatMap((d) => readdirSync(d).filter((e) => e.startsWith(".tmp-")));
  assert.deepEqual([(await run({ state: s7, tree: tree7, now: NOON })).exitCode, tmps()], [0, []], "a healthy run, no temporary file left");
  linkSync(out7, prior7);
  const old7 = readFileSync(prior7, "utf8");
  assert.equal((await run({ state: s7, tree: tree7, now: iso(Date.parse(NOON) + 60_000) })).exitCode, 0);
  assert.deepEqual([readFileSync(prior7, "utf8"), readFileSync(out7, "utf8") === old7, tmps()], [old7, false, []], "a new report, the prior file intact");
  // A report the disk refuses after a healthy check (its rename refused: bell.json taken by a directory): exit 1, the directory as found.
  // killer: scripts/probe-bell.mjs:375 CONST " || !wrote" -> ""
  rmSync(out7);
  mkdirSync(join(out7, "x"), { recursive: true });
  writeFileSync(join(out7, "x", "f"), "prior");
  const noReport = await run({ state: s7, tree: tree7, now: NOON });
  assert.deepEqual([noReport.exitCode, noReport.report.status, noReport.report.alerts, noReport.report.new_lines, readFileSync(join(out7, "x", "f"), "utf8"), tmps()],
    [1, "healthy", [], 0, "prior", []], "bell.json unwritten: exit 1 on a healthy report, the target and its content left, no temporary file");
});

// reddened by: an origin read from anything but the two constants (an option, a variable, a literal), or a constant moved before DC-15's dated line
// killer: scripts/probe-bell.mjs:259 CONST "compareOrigins(BELL_PUBLIC_ORIGIN, BELL_LEGACY_ORIGIN, get)" -> "compareOrigins(BELL_PUBLIC_ORIGIN, \"https://bell.example.com\", get)"
test("bell_probe_reads_the_origin_constant_only", async () => {
  assert.deepEqual([D.BELL_PUBLIC_ORIGIN, D.BELL_LEGACY_ORIGIN], ["https://bell.monarkgate.tech", "https://bell.monarkgate.tech"], "DC-15: the former value until its three findings");
  const lines = chain(OCT), tree = new Map<string, Answer>([[TL, bytes(lines)], [STATUS, Buffer.from(JSON.stringify({ source: { line_hash: lineHash(lines[3]) } }))]]);
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { BELL_PUBLIC_ORIGIN: "https://elsewhere.test", BELL_LEGACY_ORIGIN: "https://elsewhere.test", PROBE_URL: "https://elsewhere.test/timeline.jsonl" });
    const r = await run({ state: scratch(), tree, now: NOON });
    assert.deepEqual([r.exitCode, r.report.site_status, r.seen], [0, "in_step", [TL, STATUS]], "the transport sees the constant's two URLs, nothing else");
  } finally { for (const k of ["BELL_PUBLIC_ORIGIN", "BELL_LEGACY_ORIGIN", "PROBE_URL"]) if (!(k in saved)) delete process.env[k]; }
  assert.doesNotMatch(read("scripts/probe-bell.mjs"), /https?:\/\/|monarkgate|offhoursbell/, "no origin literal in the probe");
  for (const flag of ["--origin", "--url", "--now", "--host"]) assert.equal((await run({ state: scratch(), tree, now: NOON, argv: ["--state", scratch(), flag, "x"] })).exitCode, 2, flag);
});

// reddened by: two origins compared otherwise than byte for byte, a redirect or a refusal of the legacy origin accepted, a publication race not
// read again, or equal constants read twice instead of said
// killer: scripts/probe-bell.mjs:206 CONST "p.body.equals(l.body)" -> "true"
test("bell_probe_old_origin_serves_the_same_bytes", async () => {
  const body = bytes(chain(OCT)), r = await run({ state: scratch(), tree: new Map([[TL, body]]), now: NOON });
  assert.deepEqual([r.report.legacy_origin, r.seen.filter((u) => u === TL).length], ["same as the public origin", 1], "equal constants: nothing compared, said");
  const NEW = "https://offhoursbell.com", LEG = `${D.BELL_LEGACY_ORIGIN}/timeline.jsonl`, other = Buffer.from(body), last = other.length - 3;
  other.writeUInt8(other.readUInt8(last) ^ 1, last);
  const cmp = async (legacy: Answer): Promise<[string, string | null, number]> => {
    const seen: string[] = [], c = await P.compareOrigins(NEW, D.BELL_LEGACY_ORIGIN, P.httpTransport(fakeFetch(new Map([[`${NEW}/timeline.jsonl`, body], [LEG, legacy]]), seen)));
    return [c.verdict, c.alert, seen.length];
  };
  assert.deepEqual(await cmp(body), ["same bytes", null, 2]);
  assert.deepEqual(await cmp(other), ["differs", "legacy_origin_differs", 4], "one byte apart, twice");
  assert.deepEqual(await cmp((n) => (n === 0 ? other : body)), ["same bytes", null, 4], "a publication between the two first GETs: read again");
  assert.deepEqual(await cmp({ status: 302, location: `${NEW}/timeline.jsonl` }), ["redirect", "legacy_origin_redirect", 2], "a redirect is never followed");
  assert.deepEqual(await cmp({ status: 404 }), ["http_status", "legacy_origin_unreachable", 2]);
  let calls = 0;
  assert.deepEqual(await P.compareOrigins(NEW, NEW, () => { calls++; return Promise.resolve({ ok: false, status: null }); }), { verdict: "same as the public origin", alert: null });
  assert.equal(calls, 0, "equal origins: no GET");
});

// reddened by: a bound read in sessions.ts or tied to the calendar (it alerts after the committed calendar ends, where the calendar asks
// nothing), or a bound other than 120 hours
// killer: scripts/probe-bell.mjs:171 CONST "nowMs - lastEnd > CALENDAR_FREE_BOUND_H * HOUR_MS" -> "nowMs - lastEnd > CALENDAR_FREE_BOUND_H * HOUR_MS && isTradingDay(new Date(nowMs).toISOString().slice(0, 10))"
test("bell_probe_calendar_free_bound_alerts_whatever_the_calendar", async () => {
  assert.equal(P.CALENDAR_FREE_BOUND_H, 120, "PXB-20: 120 hours, proposed");
  assert.doesNotMatch(read("apps/bell/src/sessions.ts"), /CALENDAR_FREE|\b120\b/, "the bound is not in sessions.ts");
  const end = P.unitEndOf("2026-12-30") - 1000, h = 3_600_000, x = (now: number): [string | null, boolean, boolean] => { const f = P.freshnessOf(now, end); return [f.due_unit, f.stale, f.bound]; };
  assert.deepEqual([x(end + 120 * h - 60_000), x(end + 120 * h + 60_000)], [["2026-12-30", false, false], ["2026-12-30", false, true]], "past the calendar's last unit, the bound alone alerts");
  assert.deepEqual(x(Date.parse("2027-01-10T12:00:00Z")), ["2026-12-30", false, true], "a Sunday after the calendar ends: still");
  const r = await run({ state: scratch(), tree: new Map([[TL, bytes(chain(["2026-12-28", "2026-12-29", "2026-12-30"]))]]), now: "2027-01-10T12:00:00.000Z" });
  assert.deepEqual([r.exitCode, r.report.alerts, r.report.due_unit], [1, ["calendar_free_bound"], "2026-12-30"], "the run names the bound");
});

// reddened by: a 404 that alerts, a served status not compared with the head (the last publication, not a key line after it), a difference
// that alerts at 15 minutes or before, or not past them, a bound other than 15 minutes, or an unreadable answer accepted
// killer: scripts/probe-bell.mjs:220 CONST "SITE_STATUS_LAG_MIN * 60_000" -> "SITE_STATUS_LAG_MIN * 120_000"
test("bell_probe_site_status_is_optional_and_compared_when_served", async () => {
  assert.equal(P.SITE_STATUS_LAG_MIN, 15, "the site's ARCHI: 15 minutes, proposed");
  const lines = chain(OCT), state = scratch(), at = (min: number): string => iso(Date.parse(NOON) + min * 60_000);
  const st = (s: Answer): Map<string, Answer> => new Map<string, Answer>([[TL, bytes(lines)], [STATUS, s]]);
  const env = (lh: string): Buffer => Buffer.from(JSON.stringify({ schema: "offhoursbell-api-v1-status", source: { seq: 4, line_hash: lh } }));
  const r = async (s: Answer | null, min: number): Promise<[string | null, string | null, boolean]> => {
    const x = await run({ state, tree: s === null ? new Map([[TL, bytes(lines)]]) : st(s), now: at(min) });
    return [x.report.site_status, x.report.site_status_since, x.report.alerts.includes("site_status_behind")];
  };
  assert.deepEqual(await r(null, 0), ["not_served", null, false], "404: the site is not served, no alert");
  assert.deepEqual(await r(env(lineHash(lines[3])), 1), ["in_step", null, false]);
  const behind = env(lineHash(lines[2]));
  // killer: scripts/probe-bell.mjs:46 CONST "SITE_STATUS_LAG_MIN = 15" -> "SITE_STATUS_LAG_MIN = 10"
  // killer: scripts/probe-bell.mjs:220 ROR "> SITE_STATUS_LAG_MIN" -> ">= SITE_STATUS_LAG_MIN"
  assert.deepEqual([await r(behind, 2), await r(behind, 17), await r(behind, 18)], [["differs", at(2), false], ["differs", at(2), false], ["differs", at(2), true]],
    "none at 15 minutes from the first run that saw it, an alert past them");
  assert.deepEqual(await r(env(lineHash(lines[3])), 19), ["in_step", null, false], "in step again");
  for (const [what, s] of [["500", { status: 500 }], ["a redirect", { status: 302, location: "/" }], ["not JSON", Buffer.from("<html>")], ["no line_hash", Buffer.from("{}")]] as const) {
    const x = await run({ state: scratch(), tree: st(s), now: NOON });
    assert.deepEqual([x.report.site_status, x.report.alerts], ["error", ["site_status_error"]], what);
  }
  // The head is the last publication, as the reader's: a key line after it, the site's source at that publication, in step at +0 and +16 min.
  // killer: scripts/probe-bell.mjs:254 CONST "lines.filter((l) => l.kind === \"publication\").at(-1)" -> "lines[lines.length - 1]"
  const rot = resign({ schema: "bell-timeline-v1", seq: 5, kind: "key_rotation", published_at: at(0), prev_line_hash: lineHash(lines[3]), key_id: idOf(K1),
    new_key: keyringOf(K2, 1).keys[0]?.jwk, new_key_id: idOf(K2) });
  const keyed = st(env(lineHash(lines[3]))), s12 = scratch();
  keyed.set(TL, bytes([...lines, rot]));
  for (const min of [0, 16]) {
    const x = await run({ state: s12, tree: keyed, now: at(min), keyring: KR12 });
    assert.deepEqual([x.exitCode, x.report.alerts, x.report.kept_lines, x.report.head_seq, x.report.head_line_hash, x.report.site_status, x.report.site_status_since],
      [0, [], 5, 4, lineHash(lines[3]), "in_step", null], `a key line after the last publication, +${String(min)} min: the head is that publication`);
  }
});

// reddened by: a due instant or a unit end of the probe off the planner's on any unit of the committed calendar
// killer: scripts/probe-bell.mjs:152 CONST "UNIT_DUE_MARGIN_MIN * 60_000" -> "UNIT_DUE_MARGIN_MIN * 6_000"
test("bell_probe_due_instant_is_the_planners_on_the_whole_calendar", () => {
  let units = 0, byEnd = 0;
  for (let t = Date.parse(`${CALENDAR_RANGE.fromISO}T12:00:00Z`); iso(t).slice(0, 10) <= CALENDAR_RANGE.toISO; t += 86_400_000) {
    const d = iso(t).slice(0, 10);
    if (!isTradingDay(d) || nextTradingDay(d) > CALENDAR_RANGE.toISO) continue;
    const u = unitOf(d), due = dueInstant(u, D.UNIT_DUE_MARGIN_MIN);
    assert.deepEqual([P.unitEndOf(d), P.dueInstantOf(d)], [u.endMs, due], d);
    units++;
    if (due === u.endMs + D.UNIT_DUE_MARGIN_MIN * 60_000) byEnd++;
  }
  assert.deepEqual([units, byEnd > 0, byEnd < units], [500, true, true], "every unit of 2025-2026; both forms of the due instant met");
});

// reddened by: a verdict of the probe's own chain code off walkTimeline's (ok, the failing seq and its reason; active, head, voided and breaks)
// on the publisher's real output, cross-signed and lost-key rotations and a revocation included, on altered lines and keyrings, or in the
// probe's incremental form (each case walked from every index up to its first altered line, the lines before it carried unchecked; each
// keyring case up to its first line in error, so a keyring's revoked_from_seq is judged on a kept copy too)
// killer: scripts/probe-bell.mjs:119 CONST "check && l.prev_line_hash !== prev" -> "false"
test("bell_probe_chain_verdict_equals_the_readers_on_a_corpus", () => {
  const { state, pub: dir } = servedState(K1, 3);
  rotateKey({ stateDir: state, oldKey: K1, newKey: K2, clock: () => T_PUBLISH + 10 });
  dropRun(state, "b3", 500n);
  publishToDir({ inboxDir: join(state, "inbox"), stateDir: state, privateKey: K2, clock: () => T_PUBLISH + 11 });
  revokeKey({ stateDir: state, key: K2, revokedKeyId: idOf(K1), revokedFromSeq: 3, clock: () => T_PUBLISH + 12 });
  rotateKey({ stateDir: state, oldKey: null, newKey: K3, clock: () => T_PUBLISH + 13 });
  const real = readFileSync(join(dir, "timeline.jsonl"), "utf8").trimEnd().split("\n").map((s) => JSON.parse(s) as Obj);
  assert.deepEqual(real.map((l) => l.kind), ["publication", "publication", "publication", "key_rotation", "publication", "key_revocation", "key_rotation"]);
  const entry = (k: KeyObject): unknown => keyringOf(k, 1).keys[0], ring = { schema: "bell-keyring-v1", keys: [K1, K2, K3].map(entry) };
  const MUT: Array<[string, (l: Obj) => void]> = [["seq", (l) => { l.seq = Number(l.seq) + 1; }], ["schema", (l) => { l.schema = "bell-timeline-v0"; }],
    ["kind", (l) => { l.kind = "note"; }], ["prev", (l) => { l.prev_line_hash = "f".repeat(64); }], ["key K2", (l) => { l.key_id = idOf(K2); }],
    ["key K1", (l) => { l.key_id = idOf(K1); }], ["key unknown", (l) => { l.key_id = "e".repeat(64); }], ["sig cut", (l) => { l.sig = String(l.sig).slice(0, -2); }],
    ["sig gone", (l) => { delete l.sig; }], ["field", (l) => { l.extra = 1; }], ["new key K1", (l) => { l.new_key_id = idOf(K1); }],
    ["continuity", (l) => { l.continuity = "maybe"; }], ["new_key x", (l) => { l.new_key = { kty: "OKP", crv: "Ed25519", x: "AAAA" }; }],
    ["sig_new gone", (l) => { delete l.sig_new; }], ["revoked 99", (l) => { l.revoked_from_seq = 99; }], ["revoked active", (l) => { l.revoked_key_id = l.key_id; }]];
  // Each case: its name, its lines, its keyring, and the index of its first altered line (the incremental form is walked from 0 up to it).
  const cases: Array<[string, readonly unknown[], unknown, number]> = [["real", real, ring, real.length]];
  for (let n = 0; n < real.length; n++) cases.push([`prefix ${String(n)}`, real.slice(0, n), ring, n]);
  real.forEach((l, i) => {
    for (const [name, m] of MUT) {
      const c = { ...l };
      m(c);
      cases.push([`line ${String(i + 1)} ${name}`, real.map((x, j) => (j === i ? c : x)), ring, i], [`line ${String(i + 1)} ${name}, signed`, real.map((x, j) => (j === i ? resign(c) : x)), ring, i]);
    }
  });
  const swap = [...real];
  [swap[1], swap[2]] = [swap[2] ?? {}, swap[1] ?? {}];
  cases.push(["swap", swap, ring, 1], ["drop", [real[0], ...real.slice(2)], ring, 1], ["dup", [real[0], ...real], ring, 1], ["null", [null, ...real], ring, 0], ["array", [[], ...real], ring, 0]);
  for (const [name, r] of [["no K2", { ...ring, keys: [K1, K3].map(entry) }], ["no K3", { ...ring, keys: [K1, K2].map(entry) }],
    ["K1 revoked from 2", { ...ring, keys: [{ ...(entry(K1) as Obj), revoked_from_seq: 2 }, entry(K2), entry(K3)] }],
    ["revoked without seq", { ...ring, keys: [{ ...(entry(K1) as Obj), status: "revoked" }, entry(K2)] }], ["bad seq marker", { ...ring, keys: [{ ...(entry(K1) as Obj), revoked_from_seq: 0 }] }],
    ["key_id off", { ...ring, keys: [{ ...(entry(K1) as Obj), key_id: idOf(K2) }] }], ["duplicate", { ...ring, keys: [entry(K1), entry(K1)] }],
    ["empty", { ...ring, keys: [] }], ["schema", { ...ring, schema: "bell-keyring-v0" }], ["null", null]] as const) cases.push([`keyring ${name}`, real, r, real.length]);
  const reasons = new Set<string>();
  for (const [name, lines, r, upTo] of cases) {
    const reader = readerTrustOf(r), own = P.trustOf(r);
    assert.equal(own === null, reader === null, `${name}: the same keyring verdict`);
    if (reader === null || own === null) continue;
    const want = walkTimeline(lines, reader);
    assert.deepEqual(P.walkLines(lines, own), want, name);
    // killer: scripts/probe-bell.mjs:117 CONST "check = i >= from," -> "check = i >= from && (from === 0 || i > from),"
    // killer: scripts/probe-bell.mjs:114 CONST "k.revoked_from_seq !== undefined)" -> "k.revoked_from_seq !== undefined && from === 0)"
    for (let from = 1; from <= (want.ok ? upTo : Math.min(upTo, want.seq - 1)); from++) assert.deepEqual(P.walkLines(lines, own, from), want, `${name}, incremental from ${String(from)}`);
    reasons.add(want.ok ? (want.voided.length > 0 && want.breaks.length > 0 ? "ok, voided and broken" : "ok") : want.reason);
  }
  assert.deepEqual([...reasons].sort(), ["chain_broken", "key_not_active", "key_not_in_keyring", "ok", "ok, voided and broken", "revocation_malformed", "rotation_key_not_in_keyring",
    "rotation_malformed", "signature_invalid", "timeline_malformed"], "non-vacuity: every reason of the walk, and both forms of success, met");
});
