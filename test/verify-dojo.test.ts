/**
 * Root tests of the Dojo deployment CA scripts/verify-dojo.mjs (lot PR-3b-2b-1; ADR-DOJO-PR-3 D-2 l.83-84 and l.286; pli G0 of PR-3b-2,
 * PB-2 to PB-6: T-B1 to T-B5, without the "version due" leg of Q-B1 (a), which is PR-3b-2b-2's). The CA runs against a loopback server
 * that applies the headers READ FROM deploy/Caddyfile.monark-dojo (the closed-subset model of test/bell-caddy.ts); the host captures
 * are written in the forms of RUNBOOK-dojo CA-0, from the committed bytes at HEAD, the G7 of these runs. Seams, in process only (PB-4):
 * the TLS observation, the CA's environment and its execArgv. T-B1 runs the REAL verifier CLI over a tree of the REAL writers and
 * publisher (no signed fixture), then the REAL sync over the CA as written; the other tests put in the verifier's place (--dojo-verify)
 * a stub printing the real verifier's report on the same bytes, altered only where a case says. Each test asserts that the new module
 * exists, then imports it: red at the base by an assertion. No network beyond 127.0.0.1; keys made at run time; no backslash here.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { createHash, generateKeyPairSync, type KeyObject } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";
import { daySeed, readInstants, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { publishAnchor, publishDay, publishHistory } from "../apps/dojo/scripts/dojo-publish.mjs";
import { initSeed } from "../apps/dojo/scripts/dojo-seed.mjs";
import { dirSource, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { readingRecord, recordBytes, writeDayBundle } from "../apps/dojo/src/bundle.ts";
import { READ_RULE } from "../apps/dojo/src/dojo-methods.ts";
import { historyBundle } from "../apps/dojo/src/history-build.ts";
import { DOJO_HISTORY_CREATION as SIG0 } from "../apps/dojo/src/history-read.ts";
import { closeLayout, nextEve, readDayLayout, readEve } from "../apps/dojo/src/layout.ts";
import type { Eve } from "../apps/dojo/src/reading.ts";
import { DOJO_HOST } from "../apps/site/lib/dojo-served-load.ts";
import { MINT, betaOf, dateOf, dojoFixture, dojoKeyringOf, removeTrees, render, roundOf, writeTree,
  type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import * as D from "../scripts/dojo-deploy.mjs";
import { CA_CHECKS, CA_KEYS, CA_REL, KEYRING_REL, MANIFEST_CLAUSE, MANIFEST_REL, OUT_REL, runSync } from "../scripts/sync-dojo-served.mjs";
import { headersFor, parseCaddyfile, serveCaddy } from "./bell-caddy.ts";
import { listen } from "./helpers/loopback.ts";

type Rec = Record<string, unknown>;
type CaMod = typeof import("../scripts/verify-dojo.mjs");
type CaResult = Awaited<ReturnType<CaMod["runCa"]>>;
const REPO = join(import.meta.dirname, ".."), SCRIPT = join(REPO, "scripts", "verify-dojo.mjs");
const CLI = join(REPO, "apps", "dojo", "scripts", "dojo-verify-cli.mjs"), LF = String.fromCharCode(10), TAB = String.fromCharCode(9);
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
const W = mkdtempSync(join(tmpdir(), "verify-dojo-"));
after(() => { rmSync(W, { recursive: true, force: true, maxRetries: 3 }); removeTrees(); });
let seq = 0;
const at = (name: string): string => join(W, `${String(++seq)}-${name}`);
const dirAt = (name: string): string => { const d = at(name); mkdirSync(d, { recursive: true }); return d; };
/** The new module, asserted to exist first (PB-6 "Forme"): at the base it is absent and each test is red by this assertion. */
async function caModule(): Promise<CaMod> {
  assert.ok(existsSync(SCRIPT), "scripts/verify-dojo.mjs exists (PR-3b-2b-1)");
  return (await import(pathToFileURL(SCRIPT).href)) as CaMod;
}
const C = (n: number): string => CA_CHECKS[n - 1] ?? "?";
/** The names a win32 child receives whatever block it is given (measured, G1 journal): E, the CA's closed list (PB-3 (1)). */
const PLATFORM = ["HOMEDRIVE", "HOMEPATH", "LOGONSERVER", "PATH", "SYSTEMDRIVE", "SYSTEMROOT", "TEMP", "USERDOMAIN", "USERNAME", "USERPROFILE",
  "WINDIR"];
/** The CA's environment of these runs: the platform names, valued from the real environment (the child then sees E exactly). */
const clean = (): Record<string, string> => Object.fromEntries(PLATFORM.flatMap((k) => {
  const v = process.env[k];
  return v === undefined ? [] : [[k, v]];
}));
let head: string | null = null;
const g7 = (): string => (head ??= execFileSync("git", ["-C", REPO, "rev-parse", "HEAD"], { encoding: "utf8" }).trim());
const blobs = new Map<string, Buffer>();
const blob = (p: string): Buffer => {
  const b = blobs.get(p) ?? execFileSync("git", ["-C", REPO, "cat-file", "blob", `${g7()}:${p}`]);
  blobs.set(p, b);
  return b;
};

// ---- the host captures (RUNBOOK-dojo CA-0 forms), the loopback server, the CA in process --------------------------------------
interface Host { trees: [string, string]; loaded: string; bell: [string, string] }
const UNITS = [D.DOJO_COLLECT_UNIT, D.DOJO_COLLECT_TIMER, D.DOJO_PUBLISH_UNIT, D.DOJO_PUBLISH_TIMER];
const BELL = [`${sha("tree")}  /opt/monark-bell/apps/bell/scripts/bell-chain.mjs`, `${sha("unit")}  /etc/systemd/system/monark-bell-publish.service`,
  `${sha("extract")}  /etc/caddy/monark-bell.caddyfile`, `${sha("env")}  /etc/monark/probe.env`, `${sha("probe")}  /opt/monark-probe/probe-narabi.mjs`, ""];
type Edit = (put: (rel: string, f: (text: string) => string | null) => void) => void;
/** The captures of a host deployed at HEAD; `edit` rewrites (or removes, on null) one capture file, by its path under the host dir. */
function host(edit: Edit = () => undefined): Host {
  const d = dirAt("host");
  const w = (rel: string, t: string | Buffer): void => { mkdirSync(dirname(join(d, rel)), { recursive: true }); writeFileSync(join(d, rel), t); };
  const list = (paths: readonly string[]): string => paths.map((p) => `${sha(blob(p))}  ./${p}${LF}`).join("");
  w("publish.sha", list(D.DOJO_PUBLISH_TREE_PATHS));
  w("collect.sha", list(D.DOJO_COLLECT_TREE_PATHS));
  for (const f of ["bell-before.sha", "bell-after.sha"]) w(f, BELL.join(LF));
  for (const u of UNITS) w(`cap/${basename(u)}.cat`, `# /etc/systemd/system/${basename(u)}${LF}${blob(u).toString("utf8")}`);
  w("cap/need-daemon-reload.txt", ["no", "", "no", "", "no", "", "no", ""].join(LF));
  w("cap/caddyfile-main", ["{", "  admin off", "}", "import /etc/caddy/monark-bell.caddyfile", "import /etc/caddy/monark-dojo.caddyfile", ""].join(LF));
  w("cap/caddyfile-dojo", blob(D.DOJO_CADDYFILE));
  w("cap/manager-env.txt", ["LANG", "PATH", ""].join(LF));
  w("cap/unit-env.txt", "INVOCATION_ID LANG PATH SYSTEMD_EXEC_PID ");
  edit((rel, f) => {
    const t = f(existsSync(join(d, rel)) ? readFileSync(join(d, rel), "utf8") : "");
    if (t === null) rmSync(join(d, rel)); else w(rel, t);
  });
  return { trees: [join(d, "publish.sha"), join(d, "collect.sha")], loaded: join(d, "cap"), bell: [join(d, "bell-before.sha"), join(d, "bell-after.sha")] };
}
const CADDY = readFileSync(join(REPO, ...D.DOJO_CADDYFILE.split("/")), "utf8");
type Hook = (req: IncomingMessage, res: ServerResponse, headers: (p: string) => Record<string, string>) => boolean;
/** `dir` served on 127.0.0.1 (a port above 10080: test/helpers/loopback.ts) by the Caddy model of `caddy` while `f` runs; a `hook` returning true has answered the request itself. */
async function served<T>(dir: string, f: (url: string) => Promise<T>, caddy = CADDY, hook: Hook = () => false): Promise<T> {
  const site = parseCaddyfile(caddy)[0];
  assert.ok(site !== undefined, "one site block");
  const inner = serveCaddy(site, dir);
  const srv = createServer((req, res) => { if (!hook(req, res, (p) => headersFor(site, p))) inner.emit("request", req, res); });
  const port = await listen(srv);
  try { return await f(`http://127.0.0.1:${String(port)}`); } finally {
    srv.closeAllConnections();
    await new Promise<void>((r) => { srv.close(() => { r(); }); });
  }
}
interface Opts { keyring: string; host?: Host; cli?: string; env?: Record<string, string>; execArgv?: string[]; authorized?: boolean; seam?: boolean;
  offline?: boolean }
let base: Host | null = null;
const argvOf = (target: string, o: Opts): string[] => {
  const h = o.host ?? (base ??= host());
  return [...(o.offline === true ? ["--offline", target] : ["--url", target]), "--keyring", o.keyring, "--g7", g7(), "--tree-digests", ...h.trees,
    "--loaded-config", h.loaded, "--bell-digests", ...h.bell, "--repo", REPO, ...(o.cli === undefined ? [] : ["--dojo-verify", o.cli])];
};
const runOn = (m: CaMod, dir: string, o: Opts, caddy = CADDY, hook: Hook = () => false): Promise<CaResult> => served(dir, (url) => m.runCa(argvOf(url, o), {
  ...(o.seam === false ? {} : { tlsProbe: () => Promise.resolve({ authorized: o.authorized ?? true }) }), env: o.env ?? clean(), execArgv: o.execArgv ?? [] }),
caddy, hook);
const red = (r: CaResult): string[] => (r.ca === null ? ["usage"] : r.ca.checks.filter((c) => !c.pass).map((c) => c.name));
const detailOf = (r: CaResult, n: number): string => r.ca?.checks.find((c) => c.name === C(n))?.detail ?? "";
/** A verifier stub honouring the CLI's contract (one line on stdout, an exit code); `names` receives the NAMES of its environment. */
function stub(out: string, code = 0, names?: string): string {
  const f = at("stub.mjs");
  writeFileSync(f, [`import { writeFileSync } from "node:fs";`, names === undefined ? "" : `writeFileSync(${JSON.stringify(names)}, `
    + `JSON.stringify(Object.keys(process.env).sort()));`, `process.stdout.write(${JSON.stringify(out)});`, `process.exitCode = ${String(code)};`, ""]
    .join(LF));
  return f;
}
const line = (r: unknown): string => `${canonical(r)}${LF}`;
/** The CA as written (two-space JSON) with url = DOJO_HOST, the ONE substitution (declared: a loopback CA records its loopback origin),
 *  read by the REAL sync (runSync: buildDojoServed over the served bytes, then bindDojoCa) on a temporary root holding the committed keyring
 *  and the site manifest before the first sync (calque of test/dojo-served.test.ts l.248-261). Resolves the record, or rejects as the sync. */
async function syncOn(ca: object, keyring: string, dir: string): Promise<Rec> {
  const root = dirAt("sync"), m = JSON.parse(readFileSync(join(REPO, MANIFEST_REL), "utf8")) as { $comment: string; files: Record<string, string> };
  delete m.files[OUT_REL];
  m.$comment = m.$comment.replace(MANIFEST_CLAUSE, "");
  const files: [string, string][] = [[KEYRING_REL, readFileSync(keyring, "utf8")], [CA_REL, `${JSON.stringify({ ...ca, url: DOJO_HOST }, null, 2)}${LF}`],
    [MANIFEST_REL, `${JSON.stringify(m, null, 2)}${LF}`]];
  for (const [rel, t] of files) { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), t); }
  const r = await runSync({ root, g7: g7(), readAt: "2026-10-02T00:00:00.000Z", get: (rel) => Promise.resolve(readFileSync(join(dir, rel))) });
  assert.ok(existsSync(join(root, OUT_REL)), "the record is written under the temporary root, never in the repository");
  return r.record;
}
/** syncOn that must resolve: a refusal of the sync is an assertion failure, never an exception of the test body. */
async function bound(ca: object, keyring: string, dir: string): Promise<Rec> {
  let rec: Rec = {};
  await assert.doesNotReject(async () => { rec = await syncOn(ca, keyring, dir); }, "the real sync binds the CA as written");
  return rec;
}

// ---- the signed fixture of T-B2 to T-B5 (dojoFixture: anchor, history, 9 snapshots, a price_version), built once, lazily ----------
interface Fx { dir: string; kr: string; key: KeyObject; steps: Step[]; report: Rec }
let fxP: Promise<Fx> | null = null;
const fixture = (): Promise<Fx> => (fxP ??= (async (): Promise<Fx> => {
  const f = dojoFixture(), dir = writeTree(render(f.steps)), kr = at("kr.json"), keyring = dojoKeyringOf([[f.key, 1]]);
  writeFileSync(kr, `${canonical(keyring)}${LF}`);
  const report = await verifyDojoServed({ source: dirSource(dir), keyring });
  assert.equal(report.ok, true, JSON.stringify(report));
  return { dir, kr, key: f.key, steps: f.steps, report };
})());
const tlOf = (dir: string): Buffer => readFileSync(join(dir, "timeline.jsonl"));
const rows = (dir: string, rel: string): string[] => readFileSync(join(dir, rel), "utf8").split(LF).slice(0, -1);
const signed = (dir: string): Rec[] => rows(dir, "timeline.jsonl").map((s) => JSON.parse(s) as Rec);

// ---- T-B1: a real publication; a declared calque of fx, pythAt, world, packet and writeDay of test/dojo-publish-e2e.test.ts l.43-109 --
type Resp = { context: { slot: number }; value: unknown };
const fx = <T>(f: string): T => JSON.parse(readFileSync(join(REPO, "apps", "dojo", "test", "fixtures", "collect", f), "utf8")) as T;
const EN = fx<{ a: Resp; b: Resp }>("enumeration.json"), ACC = fx<Record<"mint" | "pool" | "wsol" | "pyth", { a: Resp; b: Resp }>>("accounts.json");
const POOL = (ACC.wsol.a.value as { data: { parsed: { info: { owner: string } } } }).data.parsed.info.owner;
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW";
const PYTH = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE", DAY = 86_400_000, K = 4, T0 = Date.UTC(2026, 8, 11, 12), A = Math.floor(T0 / DAY);
const slot = (d: number): number => (d + 1) * DAY + 1_800_000; // 00:30 UTC of d + 1, the first slot of the publish timer
function pythAt(sec: number): Resp {
  const r = structuredClone(ACC.pyth.a) as { context: { slot: number }; value: { data: [string, string] } }, b = Buffer.from(r.value.data[0], "base64");
  new DataView(b.buffer, b.byteOffset, b.byteLength).setBigInt64(93, BigInt(sec), true); // SYNTHETIC publish_time, little-endian
  r.value.data = [b.toString("base64"), "base64"];
  return r;
}
interface World { s: string; inbox: string; key: KeyObject; secret: string; eve: Eve }
/** Anchored on day A, an EMPTY history of days 1 to A by the REAL writer of PR-2b through the REAL publishHistory, A + 1 closed in the inbox. */
async function world(): Promise<World> {
  const s = dirAt("state"), inbox = dirAt("inbox"), key = generateKeyPairSync("ed25519").privateKey, file = join(dirAt("seed"), "seed");
  publishAnchor({ stateDir: s, key, clock: () => T0, request: { ...initSeed(file, 365), mint: MINT, program: TOKEN_2022, k_reads: K, validation_days: 60,
    tier_units: ["1", "2", "3", "4", "5"], objective_unit_microusd_days: "60000000000", tier_windows: [60, 60, 60, 60, 180], price_window_days: 7, pool: POOL,
    pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH, dust_threshold_microusd: "1000000", read_rule: { ...READ_RULE } } });
  const pkt = dirAt("hist"), out = historyBundle({ status: "complete", stop_reason: null, mint: MINT, program: TOKEN_2022, decimals: 6,
    sig0: SIG0.signature, sig0_slot: SIG0.slot, transactions_failed_excluded: 0, collector_sha256: sha("SYNTHETIC collector"),
    evidence_sha256sums_sha256: sha("SYNTHETIC run"), build: { history_first_day: "2026-09-10", history_last_day: dateOf(A), first_read_day: dateOf(A + 1),
      window_slot_max: 1, enumeration_slots: [1], lines: [], bytes: "", sha256: sha(""), root: rootOf([]), eve: { addresses: [], accounts: [] },
      transactions_admitted: 0, transactions_without_quorum: 0, token_accounts: 0, addresses: 0, missing_address_days: 0 } });
  for (const [p, t] of Object.entries(out.publish ?? {})) {
    mkdirSync(dirname(join(pkt, "publish", p)), { recursive: true });
    writeFileSync(join(pkt, "publish", p), t);
  }
  const w: World = { s, inbox, key, secret: readFileSync(file, "utf8").trim(), eve: { addresses: [], accounts: [] } };
  w.eve = writeDay(w, A + 1, readEve(readFileSync(join(pkt, "publish", "eve.json"), "utf8")));
  await publishHistory({ historyDir: pkt, inboxDir: inbox, stateDir: s, key, clock: () => (A + 2) * DAY + 1_200_000 }); // A + 1 is over
  return w;
}
/** bundles/<d>/ by the real writers, in the order of --close-day; returns the Eve of d + 1. */
function writeDay(w: World, d: number, eve: Eve): Eve {
  const day = dateOf(d), seed = daySeed(w.secret, 365, d - A), beta = betaOf(d), T = d * 86_400, dir = join(w.inbox, day);
  const anchor = { mint: MINT, pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_max_age_s: 165 };
  const recs = readInstants(seed, beta, K, T, 900).map((t, j) => readingRecord({ day, i: j + 1, instant: t, anchor, eve, enumeration: EN,
    read_at: new Date((t + 10) * 1000).toISOString(), mint: j === 0 ? ACC.mint : null, pool: ACC.pool, wsol: ACC.wsol,
    pyth: { a: pythAt(t - 10), b: pythAt(t - 10) } }));
  const { bytes } = writeDayBundle({ day, seed, beacon: { round: roundOf(d), signature: beta }, read_rule: READ_RULE, k_reads: K, mint: MINT,
    program: TOKEN_2022, decimals: 6, records: recs, eve }, T + 2 * 86_400);
  mkdirSync(join(dir, "readings"), { recursive: true });
  recs.forEach((r, j) => { writeFileSync(join(dir, "readings", `${String(j + 1)}.json`), recordBytes(r)); });
  writeFileSync(join(dir, "eve.json"), `${canonical(eve)}${LF}`);
  closeLayout(dir, [], recs.length, bytes);
  const L = readDayLayout(dir);
  return nextEve(L.bundle, L.records, L.eve);
}

// killer: scripts/verify-dojo.mjs:237 CONST "{ schema: CA_SCHEMA," -> "{ checked_at: at, schema: CA_SCHEMA,"
test("verify_dojo_ca_runs_real_dojo_verify", async () => {
  const m = await caModule(), w = await world(), pub = join(w.s, "public"), kr = at("kr.json"), h = host();
  writeFileSync(kr, `${canonical(dojoKeyringOf([[w.key, 1]]))}${LF}`);
  const o: Opts = { keyring: kr, host: h }; // no --dojo-verify: the public command apps/dojo/scripts/dojo-verify-cli.mjs (PB-3, PLI-1)
  const r0 = await runOn(m, pub, o);
  assert.deepEqual([red(r0), detailOf(r0, 11), r0.code], [[C(11)], "no snapshot served", 1], "(i) anchor and history only: c11 red alone (M-H20)");
  const p1 = await publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: () => slot(A + 1) });
  assert.equal(p1.status, "published", JSON.stringify(p1));
  const r1 = await runOn(m, pub, o), ca = r1.ca, tl = tlOf(pub), ls = signed(pub);
  const hd = ls[ls.length - 1] ?? {}, hi = ls.find((l) => l.kind === "history") ?? {};
  assert.deepEqual([red(r1), r1.code], [[], 0], `(ii) 12/12 with the real verifier: ${JSON.stringify(ca?.checks.filter((c) => !c.pass))}`);
  assert.ok(ca !== null, "a CA");
  assert.deepEqual([ca.head, ca.history], [{ seq: hd.seq, day: hd.day, lines_sha256: hd.lines_sha256, lines_count: hd.lines_count,
    recomputed_root: rootOf(rows(pub, `lines/${String(hd.lines_sha256)}.jsonl`)) }, { history_sha256: hi.history_sha256,
    history_lines_count: hi.history_lines_count, history_root: rootOf(rows(pub, `history/${String(hi.history_sha256)}.jsonl`)) }], "roots recomputed here");
  assert.deepEqual([ca.bodies_sha256["/timeline.jsonl"], ca.inputs_sha256.dojo_verify, ca.url?.startsWith("http://127.0.0.1:")],
    [sha(tl), sha(readFileSync(CLI)), true], "timeline_sha256 = the served body's (DOJO-CA-TIMELINE-SHA-1); the public command ran; url = --url");
  const record = await bound(ca, kr, pub), rh = (record.head ?? {}) as Rec;
  assert.deepEqual([rh.seq, rh.root], [hd.seq, hd.root], "TU-6 to TU-7: the CA as written binds to the record the real sync builds from the same bytes");
  // (iii) TB-19: day A + 2 published between the CA's read of the timeline and the verifier's.
  w.eve = writeDay(w, A + 2, w.eve);
  const p2 = await publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: () => slot(A + 2) });
  assert.equal(p2.status, "published", JSON.stringify(p2));
  let n = 0;
  const r2 = await runOn(m, pub, o, CADDY, (req, res, hs) => {
    if (req.url !== "/timeline.jsonl" || n++ > 0) return false;
    res.writeHead(200, { ...hs("/timeline.jsonl"), "content-length": String(tl.length) }).end(tl);
    return true;
  });
  assert.deepEqual([red(r2), n], [[C(11)], 2], "the verifier read another timeline than the CA: c11 red alone");
});

// killer: scripts/verify-dojo.mjs:154 CONST "!off && served.every" -> "off || served.every"
// killer: scripts/verify-dojo.mjs:149 CONST "rooted && rep.detail === null" -> "rooted"
// killer: scripts/verify-dojo.mjs:149 CONST "rooted && rep.detail" -> "rep.detail"
test("verify_dojo_ca_checks_named_and_fail_closed", async () => {
  const m = await caModule(), x = await fixture(), green = stub(line(x.report)), o: Opts = { keyring: x.kr, cli: green };
  const ok = await runOn(m, x.dir, o);
  assert.ok(ok.ca !== null, "a CA");
  assert.deepEqual([ok.ca.checks.map((c) => c.name), Object.keys(ok.ca).sort(), red(ok), ok.code], [[...CA_CHECKS], [...CA_KEYS].sort(), [], 0],
    `twelve named checks in order, the nine keys of DOJO-CA-FORMAT-1, all green: ${JSON.stringify(ok.ca.checks.filter((c) => !c.pass))}`);
  assert.ok(ok.ca.checks.every((c) => Object.keys(c).sort().join() === "detail,name,pass") && Object.keys(ok.ca.tls).join() === "authorized"
    && detailOf(ok, 1).startsWith("checked_at=2"), "closed forms {name, pass, detail} and {authorized}; checked_at heads the detail of c01");
  const record = await bound(ok.ca, x.kr, x.dir);
  assert.equal(((record.head ?? {}) as Rec).seq, x.steps.length, "the CA written binds to the record of its tree (bindDojoCa, through the sync)");
  const copy = (f: (d: string) => void): string => { const d = at("tree"); cpSync(x.dir, d, { recursive: true }); f(d); return d; };
  const tl = signed(x.dir), reschema = [canonical({ ...tl[0], schema: "dojo-timeline-v0" }), ...tl.slice(1).map((l) => canonical(l)), ""].join(LF);
  const rep = (patch: Rec): string => line({ ...x.report, ...patch }), other = at("other.json"), first = String(tl[2]?.lines_sha256);
  writeFileSync(other, `${canonical(dojoKeyringOf([[generateKeyPairSync("ed25519").privateKey, 1]]))}${LF}`);
  const krD = at("kr-d.json"), withD = JSON.parse(readFileSync(x.kr, "utf8")) as { keys: { public_key: Rec }[] };
  for (const e of withD.keys) e.public_key = { ...e.public_key, d: "A".repeat(43) };
  writeFileSync(krD, `${canonical(withD)}${LF}`);
  const cap = (rel: string, f: (t: string) => string | null): Host => host((put) => { put(rel, f); });
  const cat = "cap/monark-dojo-publish.service.cat", pem = `-----BEGIN ${"PRIVATE"} KEY-----${LF}`, h0 = x.report.head as Rec;
  const cases: [number, string, () => Promise<CaResult>, number[]?][] = [
    [1, "a timeline line of another schema", () => runOn(m, copy((d) => { writeFileSync(join(d, "timeline.jsonl"), reschema); }),
      { ...o, cli: stub(rep({ timeline_sha256: sha(reschema) })) })],
    [2, "the committed keyring of another key", () => runOn(m, x.dir, { ...o, keyring: other })],
    [3, "exit 1", () => runOn(m, x.dir, { ...o, cli: stub(line(x.report), 1) })],
    [3, "self_consistent_only (M-H24)", () => runOn(m, x.dir, { ...o, cli: stub(rep({ status: "self_consistent_only", trust_root: "served_keyring" })) })],
    [3, "a detail naming a TLS variable (M-H24)", () => runOn(m, x.dir, { ...o, cli: stub(rep({ detail: "TLS environment: NODE_EXTRA_CA_CERTS" })) })],
    [3, "a key outside DOJO_VERIFY_REPORT_KEYS", () => runOn(m, x.dir, { ...o, cli: stub(rep({ extra_key: null })) })],
    [3, "two lines", () => runOn(m, x.dir, { ...o, cli: stub(`${line(x.report)}${line(x.report)}`) }), [3, 11]],
    [4, "no Access-Control-Allow-Origin", () => runOn(m, x.dir, o, CADDY.replace(/^ *header Access-Control-Allow-Origin.*$/m, ""))],
    [5, "a listing (browse)", () => runOn(m, x.dir, o, CADDY.replace(/^ *file_server$/m, "    file_server browse"))],
    [6, "immutables not immutable", () => runOn(m, x.dir, o, CADDY.replace("public, max-age=31536000, immutable", "no-cache"))],
    [6, "the timeline immutable", () => runOn(m, x.dir, o, CADDY.replace('Cache-Control "no-cache"', 'Cache-Control "no-cache, immutable"'))],
    [7, "a handshake not authorized", () => runOn(m, x.dir, { ...o, authorized: false })],
    [7, "an http target without the test seam: TLS skipped, never passed", () => runOn(m, x.dir, { ...o, seam: false })],
    [8, "a private key file served", () => runOn(m, copy((d) => { writeFileSync(join(d, "signing-key.pem"), pem); }), o)],
    [8, "a private JWK member in the served AND committed key (c02 green)", () => runOn(m, copy((d) => {
      writeFileSync(join(d, "dojo", "pubkey.json"), readFileSync(krD)); }), { ...o, keyring: krD })],
    [9, "publication tree digest", () => runOn(m, x.dir, { ...o, host: cap("publish.sha", (t) => t.replace(/^[0-9a-f]/, (c) => (c === "0" ? "1" : "0"))) })],
    [9, "a collect tree file more", () => runOn(m, x.dir, { ...o, host: cap("collect.sha", (t) => `${t}${sha("x")}  ./apps/dojo/src/extra.ts${LF}`) })],
    [9, "a unit copied then modified", () => runOn(m, x.dir, { ...o, host: cap(cat, (t) => t.replace("PrivateNetwork=yes", "PrivateNetwork=no")) })],
    [9, "a drop-in", () => runOn(m, x.dir, { ...o, host: cap(cat, (t) => `${t}# /etc/systemd/system/monark-dojo-publish.service.d/x.conf${LF}`) })],
    [9, "NeedDaemonReload=yes", () => runOn(m, x.dir, { ...o, host: cap("cap/need-daemon-reload.txt", () => ["no", "yes", "no", "no", ""].join(LF)) })],
    [9, "a third import", () => runOn(m, x.dir, { ...o, host: cap("cap/caddyfile-main", (t) => `${t}import /etc/caddy/other.caddyfile${LF}`) })],
    [9, "a third import after a tab", () => runOn(m, x.dir, { ...o, host: cap("cap/caddyfile-main", (t) => `${t}import${TAB}/etc/caddy/x${LF}`) })],
    [9, "the Dojo extract not the blob", () => runOn(m, x.dir, { ...o, host: cap("cap/caddyfile-dojo", (t) => t.replace("no-cache", "no-store")) })],
    [9, "NODE_OPTIONS in the manager's block", () => runOn(m, x.dir, { ...o, host: cap("cap/manager-env.txt", (t) => `${t}NODE_OPTIONS${LF}`) })],
    [9, "a proxy in the unit's environment", () => runOn(m, x.dir, { ...o, host: cap("cap/unit-env.txt", (t) => `${t}https_proxy `) })],
    [9, "a value in the unit's environment capture", () => runOn(m, x.dir, { ...o, host: cap("cap/unit-env.txt", () => "PATH=/usr/bin LANG ") })],
    [9, "the unit's environment capture absent", () => runOn(m, x.dir, { ...o, host: cap("cap/unit-env.txt", () => null) })],
    [10, "Bell changed between the captures", () => runOn(m, x.dir, { ...o, host: cap("bell-after.sha", (t) => t.replace(sha("unit"), sha("unit 2"))) })],
    [11, "the head root of the report", () => runOn(m, x.dir, { ...o, cli: stub(rep({ head: { ...h0, recomputed_root: "1".repeat(64) } })) })],
    [12, "an earlier lines file altered under its name", () => runOn(m, copy((d) => { writeFileSync(join(d, "lines", `${first}.jsonl`), `{}${LF}`); }), o)],
  ];
  assert.equal(new Set(cases.map(([n]) => n)).size, 12, "every check has at least one isolated fault");
  for (const [n, why, run, want] of cases) {
    const r = await run();
    assert.deepEqual([red(r), r.code], [(want ?? [n]).map(C), 1], `${C(n)} (${why}): the red set is exactly that check, exit 1`);
  }
  const fam = await runOn(m, x.dir, { ...o, env: { ...clean(), SSL_CERT_FILE: "VALUE-NEVER-NAMED" } });
  assert.ok(detailOf(fam, 7).includes("env_families=SSL_CERT_FILE") && !detailOf(fam, 7).includes("VALUE-NEVER-NAMED"), "a name, never a value");
  // Offline (CA-0, M-H28): c04 to c07 never passed, so never VERIFY OK; the CLI writes the red CA to --out and names the failed checks.
  const off = await m.runCa(argvOf(x.dir, { ...o, offline: true }), { env: clean(), execArgv: [] });
  assert.deepEqual([red(off), off.code, off.ca?.url, off.ca?.tls], [[4, 5, 6, 7].map(C), 1, null, { authorized: false }], "offline: never green");
  const cliOf = (args: string[]): Promise<[number | null, string, string]> => new Promise((done) => {
    execFile(process.execPath, [SCRIPT, ...args], { encoding: "utf8", timeout: 100_000 }, (e, so, se) => {
      done([e === null ? 0 : typeof e.code === "number" ? e.code : null, so, se]);
    });
  });
  const outFile = at("CA-0.json"), [code, so, se] = await cliOf([...argvOf(x.dir, { ...o, offline: true }), "--out", outFile]);
  assert.deepEqual([code, se.includes(`VERIFY FAILED: ${[4, 5, 6, 7].map(C).join(", ")}${LF}`), se.includes("VERIFY OK"),
    existsSync(outFile) && readFileSync(outFile, "utf8") === so], [1, true, false, true], se);
  // Usage: exit 2 before any GET, nothing written; the production origin passes the --url rule (the next refusal is the keyring's).
  const full = argvOf("http://127.0.0.1:9", o);
  const drop = (k: string, n = 1): string[] => { const i = full.indexOf(k); return [...full.slice(0, i), ...full.slice(i + 1 + n)]; };
  for (const argv of [[...full, "--url", "x"], [...full, "--extra"], [...full, "--offline", x.dir], drop("--url"), drop("--keyring"), drop("--bell-digests", 2),
    ["--url", `${DOJO_HOST}/`, ...drop("--url")], ["--url", "https://example.org", ...drop("--url")], ["--url", "http://localhost:1", ...drop("--url")],
    ["--g7", "abc", ...drop("--g7")], ["--offline", x.kr, ...drop("--url")]]) {
    const r = await m.runCa(argv, { env: clean(), execArgv: [] });
    assert.deepEqual([r.code, r.ca], [2, null], argv.join(" "));
  }
  const prod = await m.runCa(["--url", DOJO_HOST], {});
  assert.ok(prod.ca === null && prod.usage.startsWith("--keyring"), `the production origin is accepted as such: ${prod.ca === null ? prod.usage : ""}`);
  const usageOut = at("usage.json"), u = await cliOf(["--url", `${DOJO_HOST}/`, ...drop("--url"), "--out", usageOut]);
  assert.deepEqual([u[0], u[1], existsSync(usageOut)], [2, "", false], "usage: exit 2, nothing on stdout, nothing written");
  await assert.rejects(syncOn({ ...ok.ca, checks: ok.ca.checks.map((c) => (c.name === C(12) ? { ...c, pass: false } : c)) }, x.kr, x.dir), /not green/,
    "a CA with a red check is never bound by the sync");
});

// killer: scripts/verify-dojo.mjs:204 CONST "bb.equals(ba) && holds" -> "holds"
test("verify_dojo_ca_leaves_bell_untouched", async () => {
  const m = await caModule(), x = await fixture(), o: Opts = { keyring: x.kr, cli: stub(line(x.report)) };
  const bell = (f: (before: string[], after: string[]) => void): Host => host((put) => {
    const b = [...BELL], a = [...BELL];
    f(b, a);
    put("bell-before.sha", () => b.join(LF));
    put("bell-after.sha", () => a.join(LF));
  });
  const ok = await runOn(m, x.dir, { ...o, host: bell(() => undefined) });
  assert.deepEqual(red(ok), [], `equal and complete captures: ${detailOf(ok, 10)}`);
  const swap = (i: number) => (_: string[], a: string[]): void => { a[i] = `${sha("changed")}${String(a[i]).slice(64)}`; };
  const drop = (i: number) => (b: string[], a: string[]): void => { b.splice(i, 1); a.splice(i, 1); };
  const junk = (b: string[], a: string[]): void => { b.push("not a digest"); a.push("not a digest"); };
  for (const [why, f] of [["a Bell tree file changed", swap(0)], ["the Bell unit changed", swap(1)], ["the Bell extract changed", swap(2)],
    ["probe.env changed", swap(3)], ["a probe file changed", swap(4)], ["no Bell tree file in either capture", drop(0)], ["no Bell unit", drop(1)],
    ["no Bell extract", drop(2)], ["no probe.env", drop(3)], ["no probe file", drop(4)], ["captures not sha256sum lines", junk]] as const) {
    const r = await runOn(m, x.dir, { ...o, host: bell(f) });
    assert.deepEqual(red(r), [C(10)], `${why}: c10 red alone (M-H12)`);
  }
  const gone = await runOn(m, x.dir, { ...o, host: host((put) => { put("bell-after.sha", () => null); }) });
  assert.deepEqual(red(gone), [C(10)], "the after capture absent");
});

// killer: scripts/verify-dojo.mjs:168 CONST "fam.length === 0 && opts.length === 0" -> "true"
// killer: scripts/verify-dojo.mjs:78 CONST "{ env, timeout" -> "{ timeout"
test("verify_dojo_ca_closes_the_tls_environment", async () => {
  const m = await caModule(), x = await fixture(), names = at("names.json"), o: Opts = { keyring: x.kr, cli: stub(line(x.report), 0, names) };
  assert.deepEqual([...m.DOJO_CA_CHILD_ENV], PLATFORM, "E: the closed list, the platform names measured on win32");
  process.env.DOJO_CA_PARENT_MARKER = "1";
  let r: CaResult;
  try { r = await runOn(m, x.dir, { ...o, env: { ...clean(), NODE_OPTIONS: "--use-openssl-ca", HTTPS_PROXY: "http://127.0.0.1:9", DOJO_CA_UNKNOWN: "1" } }); }
  finally { delete process.env.DOJO_CA_PARENT_MARKER; }
  assert.deepEqual(JSON.parse(readFileSync(names, "utf8")) as string[], Object.keys(clean()).sort(),
    "the child's environment is E, by name: no family, no unknown name, nothing of the real parent (M-H22)");
  assert.deepEqual([red(r), detailOf(r, 7).includes("env_families=HTTPS_PROXY,NODE_OPTIONS ")], [[C(7)], true], detailOf(r, 7));
  for (const k of ["NODE_TLS_REJECT_UNAUTHORIZED", "NODE_USE_SYSTEM_CA", "SSL_CERT_DIR", "OPENSSL_CONF", "https_proxy", "NO_PROXY"]) {
    const v = await runOn(m, x.dir, { ...o, env: { ...clean(), [k]: "VALUE-NEVER-NAMED" } });
    assert.deepEqual([red(v), detailOf(v, 7).includes(`env_families=${k} `), detailOf(v, 7).includes("VALUE")], [[C(7)], true, false], `${k} (M-H23)`);
  }
  for (const [argv, shown] of [[["--use-openssl-ca"], "--use-openssl-ca"], [["--require", "x.cjs"], "--require"], [["--import=x.mjs"], "--import"],
    [["--use-env-proxy"], "--use-env-proxy"]] as const) {
    const v = await runOn(m, x.dir, { ...o, execArgv: [...argv] });
    assert.deepEqual([red(v), detailOf(v, 7).includes(`exec_argv=${shown} `), detailOf(v, 7).includes("x.")], [[C(7)], true, false], argv.join(" "));
  }
  assert.match(detailOf(r, 7), / (ca_default=[0-9]+ ca_bundled=[0-9]+ ca_default_is_bundled=(true|false) ca_default_sha256=[0-9a-f]{64}|ca_store=unknown)$/,
    "the default store of the binary is named (PB-3 (c))");
});

// killer: scripts/verify-dojo.mjs:216 CONST "recomputed_root: hr?.root ?? null" -> "recomputed_root: r?.head?.recomputed_root ?? null"
// killer: scripts/verify-dojo.mjs:219 CONST "r.head.recomputed_root === head.recomputed_root" -> "true"
// killer: scripts/verify-dojo.mjs:221 CONST "r.history.recomputed_root === history.history_root" -> "true"
// killer: scripts/verify-dojo.mjs:225 CONST " && tlOk" -> ""
// killer: scripts/verify-dojo.mjs:225 CONST "headOk && histOk" -> "(hl === null || headOk) && histOk"
test("verify_dojo_ca_needs_a_head_and_the_same_timeline", async () => {
  const m = await caModule(), x = await fixture(), o: Opts = { keyring: x.kr };
  const early = writeTree(render(x.steps.slice(0, 2)));
  const none = (await verifyDojoServed({ source: dirSource(early), keyring: dojoKeyringOf([[x.key, 1]]) })) as Rec;
  const r0 = await runOn(m, early, { ...o, cli: stub(line(none)) });
  assert.deepEqual([red(r0), detailOf(r0, 11), none.ok, none.head], [[C(11)], "no snapshot served", true, null], "no snapshot served: c11 red (M-H20)");
  const rep = (patch: Rec): string => line({ ...x.report, ...patch }), h = x.report.head as Rec, hi = x.report.history as Rec;
  for (const [why, out] of [["the report read another timeline (M-H21)", rep({ timeline_sha256: sha("another timeline") })],
    ["the report's head root is not the one recomputed (M-H15)", rep({ head: { ...h, recomputed_root: "11".repeat(32) } })],
    ["the report's history root is not the one recomputed (M-H15)", rep({ history: { ...hi, recomputed_root: "22".repeat(32) } })],
    ["the report's head is another snapshot", rep({ head: { ...h, seq: Number(h.seq) - 1 } })]] as const) {
    const r = await runOn(m, x.dir, { ...o, cli: stub(out) });
    assert.deepEqual([red(r), detailOf(r, 11).startsWith("head=")], [[C(11)], true], why);
  }
  // FM-3.3 (M-H27): a head line signed with a root that is not its file's, and a verifier that echoes that signed root: only roots the CA
  // recomputes itself catch the shared defect.
  const wrong = "33".repeat(32);
  const bent = writeTree(render(x.steps, new Map(), (s) => { const b = s[s.length - 1]?.body; if (b !== undefined) b.root = wrong; }));
  const r = await runOn(m, bent, { ...o, cli: stub(rep({ timeline_sha256: sha(tlOf(bent)), head: { ...h, recomputed_root: wrong } })) });
  assert.deepEqual([red(r), r.ca?.head?.recomputed_root], [[C(11)], rootOf(rows(bent, `lines/${String(h.lines_sha256)}.jsonl`))], "the CA's root is its own");
});
