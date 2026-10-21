// MONARK Bell -- THE integration test of part 4 of the collection timer (G0 BELL-COLLECT-TIMER-1 contract C-5 of checkpoint-1 and section 13
// C3-11, L-3; PLAN-P4 C4-9; tuyaux T-o, T-o2, T-q): the two committed units of Bell's host and the probe of the former host, composed. The REAL
// tick (tickMain, argv READ from the ExecStart of deploy/monark-bell-collect.service) deposits each unit it collects; the REAL publisher
// (runCli, argv READ from the ExecStart of deploy/monark-bell-publish.service) publishes it on the start mark of its --handoff-start form; the
// published tree is served under the two constant origins; then the REAL probe, by its entry point runProbe, with the argv READ from the
// ExecStart of deploy/monark-bell-probe.service, its host paths mapped under one root (C3-11) that holds the tree's keyring with the test
// publisher's key and the probe's password file; and the reader's side, apps/bell/scripts/bell-verify.mjs over a loopback server with the
// committed Caddy headers (C-5: "for the second test, the real probe in addition"). Injected, and nothing else: the clocks and the transport
// (the operators, Databento and Massive offline, as in bell-units-compose.test.ts; the origins; the calendars, which answer a pending
// commitment; the mail). It asserts: a missed step rings the probe, the step caught up silences it, each new line gets one proof and one
// only, and the reader verifies the tree the probe read. The fixture of the tick is the one of bell-units-compose.test.ts (replayed unchanged:
// a second file, C4-9). Killers of C-5: (1) the manifest each publication records is the one the tick bound into state/progress.json, and the
// probe stamps the publisher's own lines; (2) a static check of this file in the closed form of bell-units-compose.test.ts: no write into the
// handoff, the status or the probe's state directory, every one is the three entry points' (module specifiers closed, each entry imported
// once by its name and by no other form, no alias of those directories). Synthetic values only; the key is in memory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync } from "node:crypto";
import { BELL_LAYOUT, BELL_LEGACY_ORIGIN, BELL_PUBLIC_ORIGIN, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { runProbe } from "../../../scripts/probe-bell.mjs";
import { keyringOf, lineHash, sha256Hex } from "../scripts/bell-chain.mjs";
import { runCli } from "../scripts/bell-publish.mjs";
import { urlSource, verifyServed } from "../scripts/bell-verify.mjs";
import { dueInstant, unitOf } from "../src/plan.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { f64BitsHexLE } from "../src/rebase-trajectory.ts";
import { tradingDaysOf, type AdvPeriod } from "../src/volume.ts";
import { tickMain, type TickDeps } from "../src/tick.ts";
import { committedCaddyRules, REPO, serveDir } from "./helpers/bell-served.ts";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url)), SELF = fileURLToPath(import.meta.url), unitFile = (u: string): string => join(REPO, "deploy", `monark-bell-${u}.service`);
const D1 = "2026-10-02", D2 = "2026-10-05", DUE1 = dueInstant(unitOf(D1), UNIT_DUE_MARGIN_MIN);
const HELIUS_HOST = "helius.example.invalid", CS_HOST = "cs-sol.example.invalid";
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, HELIUS_API_KEY: ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-"),
  CHAINSTACK_SOLANA_URL: `https://${CS_HOST}/${"c".repeat(32)}`, DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
  CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000", BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") };
// The fixture of bell-units-compose.test.ts: two fills per mint in each unit's window, the trajectory 1 then 1.0039 from 2026-09-01.
const FILLS: Readonly<Record<string, readonly number[]>> = { [D1]: [Date.UTC(2026, 9, 2, 14), Date.UTC(2026, 9, 3, 15)], [D2]: [Date.UTC(2026, 9, 5, 14), Date.UTC(2026, 9, 5, 22)] };
let fills: readonly number[] = FILLS[D1] ?? [];
const EFF = Math.floor(Date.UTC(2026, 8, 1) / 1000), CLOSE = { scaled: "364000000000", decimal: 364 };
const pool = (m: string): { vaultBase: string; vaultQuote: string } => { const p = POOLS.find((x) => x.baseSymbol === m && x.chain === "solana"); assert.ok(p?.vaultBase !== undefined && p.vaultQuote !== undefined); return { vaultBase: p.vaultBase, vaultQuote: p.vaultQuote }; };
const mintOf = (m: string): string => XSTOCKS.find((t) => t.symbol === m)?.address ?? "";
const TRAJ = JSON.stringify(Object.fromEntries(BELL_UNIVERSE.map((m) => [m, { scanComplete: true, scanMethod: "authority", events: [
  { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: `i-${m}` },
  { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: EFF, blockTimeSec: EFF - 1000, slot: 2, instructionIndex: 0, signature: `u-${m}` }] }])));
const stateConfigB64 = (): string => { const b = new Uint8Array(56), v = new DataView(b.buffer); v.setFloat64(32, 1, true); v.setBigInt64(40, BigInt(EFF), true); v.setFloat64(48, 1.0039, true); return Buffer.from(b).toString("base64"); };
const bal = (base: string, quote: string): Obj[] => [{ accountIndex: 0, uiTokenAmount: { amount: base } }, { accountIndex: 1, uiTokenAmount: { amount: quote } }];
function rpc(method: string, params: unknown[]): unknown {
  const m = BELL_UNIVERSE.find((x) => params[0] === pool(x).vaultBase || params[0] === mintOf(x) || String(params[0]).startsWith(`${x}-sig`));
  if (m === undefined) throw new Error(`no fixture for ${method}`);
  if (method === "getSignaturesForAddress") return (params[1] as { before?: string }).before !== undefined ? []
    : fills.map((ms, i) => ({ signature: `${m}-sig${String(i)}`, slot: 10 + i, blockTime: ms / 1000, err: null })).reverse();
  if (method === "getTransaction") return { slot: 10, transaction: { message: { accountKeys: [{ pubkey: pool(m).vaultBase }, { pubkey: pool(m).vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", "4635000000") } };
  if (method === "getAccountInfo") return (params[1] as { encoding?: string }).encoding === "base64" ? { context: { slot: 9 }, value: { data: [stateConfigB64(), "base64"] } }
    : { context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } };
  throw new Error(`unexpected ${method}`);
}
function cash(url: URL): unknown {
  if (url.pathname === "/v0/metadata.get_cost") return 0.25;
  if (url.pathname === "/v0/timeseries.get_range") {
    const out: Obj[] = [];
    for (let t = Date.parse(`${url.searchParams.get("start") ?? ""}T00:00:00Z`); t < Date.parse(`${url.searchParams.get("end") ?? ""}T00:00:00Z`); t += 86_400_000) out.push({ hd: { ts_event: String(BigInt(t) * 1_000_000n) }, close: CLOSE.scaled });
    return out;
  }
  const r = /\/range\/1\/day\/(\d{4})-(\d{2})-(\d{2})\/(\d{4}-\d{2}-\d{2})\?/.exec(url.pathname + url.search);
  if (r === null) throw new Error(`unexpected ${url.pathname}`);
  if (`${r[1] ?? ""}-${r[2] ?? ""}-${r[3] ?? ""}` === r[4]) return { results: [{ c: CLOSE.decimal }] };
  const p: AdvPeriod = { year: Number(r[1]), month: Number(r[2]) };
  return { results: (tradingDaysOf(p) ?? []).map((d) => ({ t: Date.parse(`${d}T16:00:00Z`), v: 1_000_000 })) };
}
async function withNetwork<T>(body: () => Promise<T>): Promise<T> {
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input));
    if (url.hostname === HELIUS_HOST || url.hostname === CS_HOST) {
      const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { id: unknown; method: string; params: unknown[] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: rpc(req.method, req.params) }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.hostname === "hist.databento.com" || url.hostname === "api.polygon.io") return new Response(JSON.stringify(cash(url)), { status: 200 });
    return Promise.reject(new Error(`no network: ${url.hostname}`));
  }) as typeof globalThis.fetch;
  try { return await body(); } finally { globalThis.fetch = real; }
}
/** The ExecStart of a committed unit: its arguments after the program (the .ts or .mjs it runs), host paths mapped under `root`. */
function execArgv(unit: string, root: string): string[] {
  const lines = readFileSync(unit, "utf8").split("\n").filter((l) => l.startsWith("ExecStart="));
  assert.equal(lines.length, 1, `${unit}: one ExecStart`);
  const words = (lines[0] ?? "").slice("ExecStart=".length).split(" "), at = words.findIndex((w) => /\.(ts|mjs)$/.test(w));
  assert.ok(at > 0, `${unit}: a program`);
  return words.slice(at + 1).map((w) => (w.startsWith("/") ? join(root, ...w.split("/").filter((x) => x !== "")) : w));
}
const valueOf = (argv: readonly string[], flag: string): string => { const i = argv.indexOf(flag); assert.ok(i >= 0, flag); return argv[i + 1] ?? ""; };
const jsonl = (p: string): Obj[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) : []);
/** A calendar's answer to a POST of a digest: sha256, then a commitment pending at a whitelisted URI (notary.py). */
const CAL = "https://alice.btc.calendar.opentimestamps.org", PENDING = Buffer.concat([Buffer.from([0x08, 0x00]), Buffer.from("83dfe30d2ef90c8e", "hex"), Buffer.from([CAL.length + 1, CAL.length]), Buffer.from(CAL)]);

// killer: apps/bell/src/tick.ts:259 CONST "manifest_sha256: sha256Hex(manifest)" -> "manifest_sha256: sha256Hex(bundle)"
// killer: apps/bell/scripts/bell-publish.mjs:111 CONST "() => canonical(keyring) + \"\\n\"" -> "() => \"{}\\n\""
test("bell_units_compose_tick_to_publish_to_probe", async () => {
  assert.ok(existsSync(unitFile("probe")) && /^ExecStart=.* --handoff /m.test(readFileSync(unitFile("publish"), "utf8")), "the probe's unit is committed; the publisher runs --handoff");
  // Killer (2), the closed form of bell-units-compose.test.ts: no writer of node:fs on a line of this file names the handoff, the status or the
  // probe's state directory (by its name, its flag or its argv); the module specifiers, in every form, are a closed list; each entry point
  // imported once, by its name, by its static form only; no alias.
  const writer = new RegExp(`\\b(${["writeFileSync", "appendFileSync", "cpSync", "copyFileSync", "renameSync", "rmSync", "unlinkSync", "mkdirSync", "symlinkSync", "linkSync", "openSync", "writeSync"].join("|")})\\(`);
  const src = readFileSync(SELF, "utf8"), lines = src.split("\n"), writes = lines.filter((l) => writer.test(l) && !l.includes("new RegExp("));
  assert.ok(writes.length >= 4, "non-vacuity: this file writes the acts");
  assert.deepEqual(writes.filter((l) => /handoff|status|probeState|probeArgv|monark-probe|--state/i.test(l)), [], "no line of this file writes the handoff, the status or the probe's state");
  const CLOSED = ["node:test", "node:assert/strict", "node:fs", "node:os", "node:path", "node:url", "node:crypto", "../../../scripts/bell-deploy.mjs", "../../../scripts/probe-bell.mjs",
    "../scripts/bell-chain.mjs", "../scripts/bell-publish.mjs", "../scripts/bell-verify.mjs", "../src/plan.ts", "../src/pools.ts", "../src/rebase-trajectory.ts", "../src/volume.ts", "../src/tick.ts",
    "./helpers/bell-served.ts"];
  const specsOf = (s: string): string[] => [...s.matchAll(/\bfrom\s*(["'`])([^"'`]+)\1|\bimport\s*\(\s*(["'`])([^"'`]+)\3\s*\)|\brequire\s*\(\s*(["'`])([^"'`]+)\5\s*\)/g)].map((m) => m[2] ?? m[4] ?? m[6] ?? ""), specs = specsOf(src);
  // The synthetic forms are built at run time (the quote put in place of @): written as such, this file's own scan would find them.
  assert.deepEqual(["\"", "'", "`"].flatMap((q) => specsOf("from @node:fs/promises@; import(@node:fs/promises@); import( @node:fs/promises@ ); require(@node:fs/promises@)".replaceAll("@", q))),
    Array<string>(12).fill("node:fs/promises"), "the scan sees each form in each of the three quotes");
  assert.deepEqual([[...new Set(specs)].sort(), specs.filter((s) => ["node:fs/promises", "fs", "fs/promises"].includes(s))], [[...CLOSED].sort(), []], "the module specifiers, closed");
  // Each entry point: one specifier in any form (named, namespace, default or dynamic), AND the static named import of its entry only.
  const entry = (file: string): [number, string[]] => [specs.filter((s) => s.endsWith(`/${file}`)).length,
    [...src.matchAll(new RegExp(`^import\\s+(.+?)\\s+from\\s*"[./]+(?:scripts|src)/${file.replaceAll(".", "\\.")}";$`, "gm"))].map((m) => m[1] ?? "")];
  assert.deepEqual([entry("bell-publish.mjs"), entry("probe-bell.mjs"), entry("tick.ts")], [[1, ["{ runCli }"]], [1, ["{ runProbe }"]], [1, ["{ tickMain, type TickDeps }"]]],
    "each entry point, imported once, by its name");
  const aliases = (ls: readonly string[]): string[] => ls.filter((l) => /\b(?:const|let|var)\s/.test(l)
    && /=\s*(?:(?:handoffDir|statusDir|probeState)\b(?!\s*[.([])|(?:[\w$]+\.)*(?:join|resolve)\(\s*(?:handoffDir|statusDir|probeState)\b|`[^`]*\$\{\s*(?:handoffDir|statusDir|probeState)\s*\})/.test(l));
  assert.deepEqual(["handoffDir", "statusDir", "probeState"].map((d) => aliases(["const a = X;", "let b = join(X, \"x\");", "var c = resolve(X);", "const d = 1, e = `${X}/x`;",
    "const f = path.join(X, \"x\");", "const g = path.posix.resolve(X);"].map((l) => l.replace("X", d))).length), [6, 6, 6], "the check reddens on each form, for each directory");
  assert.deepEqual(aliases(lines), [], "no alias of the handoff, the status or the probe's state directory");

  const root = mkdtempSync(join(tmpdir(), "bell-units-probe-")), creds = join(root, "credentials");
  for (const x of Object.values(BELL_LAYOUT)) mkdirSync(join(root, ...x.path.split("/").filter((s) => s !== "")), { recursive: true }); // act: the four directories, empty
  const collectArgv = execArgv(unitFile("collect"), root), publishArgv = execArgv(unitFile("publish"), root), probeArgv = execArgv(unitFile("probe"), root);
  const state = valueOf(collectArgv, "--state"), handoffDir = valueOf(collectArgv, "--handoff"), statusDir = valueOf(collectArgv, "--status"), probeState = valueOf(probeArgv, "--state");
  mkdirSync(valueOf(collectArgv, "--ledger-dir"), { recursive: true }); // act: the guard's ledger root
  const key = generateKeyPairSync("ed25519").privateKey, cred = /^LoadCredential=([\w-]+):/m.exec(readFileSync(unitFile("publish"), "utf8"))?.[1] ?? "?";
  mkdirSync(creds);
  writeFileSync(join(creds, cred), key.export({ type: "pkcs8", format: "pem" })); // act: the key, as PID 1 hands it to the publisher
  const treeFiles = [[valueOf(probeArgv, "--keyring"), JSON.stringify(keyringOf(key, 1))], [valueOf(probeArgv, "--smtp-pass-file"), "secret-x\n"]] as const;
  for (const [file, text] of treeFiles) { // acts: the probe tree's keyring, its password file (under the tree's root and /etc/monark, never its state)
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text, { mode: 0o600 });
  }
  const tickDeps = (now: number): TickDeps => ({ env: ENV, now: () => now, clockSynced: () => true, refTrajSha256: sha256Hex(TRAJ), out: () => undefined, err: () => undefined });
  const tick = (now: number): Promise<number> => withNetwork(() => tickMain(collectArgv, tickDeps(now)));
  const publish = (clock: number, argv: readonly string[] = publishArgv): number => {
    const prior = process.env.CREDENTIALS_DIRECTORY, w = process.stdout.write.bind(process.stdout);
    process.env.CREDENTIALS_DIRECTORY = creds;
    process.stdout.write = (): boolean => true;
    try { return runCli([...argv], { clockSynced: () => true, clock: () => clock }); } finally { process.stdout.write = w; if (prior === undefined) delete process.env.CREDENTIALS_DIRECTORY; else process.env.CREDENTIALS_DIRECTORY = prior; }
  };
  // The probe: the published tree under the two constant origins, the calendars (POST: pending; an upgrade: 404), the mail.
  const pub = join(valueOf(publishArgv, "--state"), "public"), mails: string[] = [], seen: string[] = [];
  const fetch = (url: string, init?: { method?: string }): Promise<Response> => {
    seen.push(url);
    const o = [BELL_PUBLIC_ORIGIN, BELL_LEGACY_ORIGIN].find((x) => url.startsWith(`${x}/`)), f = o === undefined ? "" : join(pub, ...url.slice(o.length + 1).split("/"));
    const body = o !== undefined && existsSync(f) ? readFileSync(f) : init?.method === "POST" && url.endsWith("/digest") ? PENDING : null;
    return Promise.resolve(new Response(body === null ? null : new Uint8Array(body), { status: body === null ? 404 : 200 }));
  };
  const probe = async (at: string): Promise<{ exitCode: number; alerts: string[] }> => {
    const r = await runProbe(probeArgv, { clock: () => Date.parse(at), fetch, smtp: (a) => { mails.push(String(a.message)); return Promise.resolve({ ok: true }); } });
    return { exitCode: r.exitCode, alerts: r.report?.alerts ?? ["?"] };
  };
  const saved = { ...process.env };
  Object.assign(process.env, { SMTP_HOST: "127.0.0.1", SMTP_PORT: "2525", SMTP_TLS: "none", SMTP_USER: "probe", ALERT_FROM: "probe@monark.test", ALERT_TO: "ops@monark.test" }); // act: the mail file
  try {
    assert.equal(await tickMain(["--seed", D1, "--state", state], tickDeps(DUE1)), 0, "the real seed form");
    const traj = join(state, "state", "trajectory"), fresh = (now: number): void => { writeFileSync(join(traj, "produced.json"), JSON.stringify({ produced_at_ms: now - 3_600_000, sha256: sha256Hex(TRAJ) })); };
    mkdirSync(traj, { recursive: true });
    for (const f of ["reference.json", "rebase-trajectory.json"]) writeFileSync(join(traj, f), TRAJ);
    fresh(DUE1);
    assert.equal(publish(DUE1, ["--handoff-start", D1, "--handoff", handoffDir, "--status", statusDir]), 0, "the mark");
    // D1 collected and published: the probe, before the deadline of D2 (Tue 2026-10-06 22:27Z, its gate 20:00Z plus the slot of 20:15Z, 7 320 s and 10 min), is healthy and stamps line 1.
    const step = async (now: number, unit: string, seq: number): Promise<void> => {
      assert.equal(await tick(now), 0, `the tick deposits unit-${unit}`);
      const progress = JSON.parse(readFileSync(join(state, "state", "progress.json"), "utf8")) as Obj;
      assert.equal(publish(now), 0, `unit-${unit} published`);
      // Killer (1): the publisher recorded the manifest the tick bound into its progress.
      assert.deepEqual(jsonl(join(statusDir, "published.jsonl")).at(-1), { bundle: `unit-${unit}`, manifest_sha256: progress.manifest_sha256, seq, published_at: new Date(now).toISOString() });
    };
    await step(DUE1, D1, 1);
    const p1 = await probe("2026-10-06T10:00:00.000Z");
    assert.deepEqual([p1.exitCode, p1.alerts, mails.length], [0, [], 0], "D1 published: healthy");
    // The step of D2 missed: past its deadline the probe rings (one mail); the step caught up silences it (the recovery mail).
    const p2 = await probe("2026-10-06T22:30:00.000Z");
    assert.deepEqual([p2.exitCode, p2.alerts, mails.length, /\ncondition: alert\n/.test(mails[0] ?? "")], [1, ["stale"], 1, true], "the missed step rings the probe");
    fills = FILLS[D2] ?? [];
    fresh(Date.parse("2026-10-06T22:35:00.000Z"));
    await step(Date.parse("2026-10-06T22:35:00.000Z"), D2, 2);
    const p3 = await probe("2026-10-06T23:00:00.000Z");
    assert.deepEqual([p3.exitCode, p3.alerts, mails.length, /\ncondition: recovered\n/.test(mails[1] ?? "")], [0, [], 2, true], "the caught-up step silences it");
    // Each new line, one proof and one only; the probe stamped the publisher's own lines (its kept copy is the served timeline, byte for byte).
    const served = readFileSync(join(pub, "timeline.jsonl")), regRows = jsonl(join(probeState, "bell", "ots", "registry.jsonl"));
    assert.deepEqual([readFileSync(join(probeState, "bell", "timeline.jsonl")).equals(served), regRows.map((r) => [r.seq, r.event]), seen.filter((u) => u.endsWith("/digest")).length],
      [true, [[1, "stamped"], [2, "stamped"]], 8], "one stamp a line, four calendars each");
    assert.deepEqual(regRows.map((r) => r.line_hash), served.toString("utf8").trimEnd().split("\n").map((l) => lineHash(JSON.parse(l) as Obj)), "the stamped lines are the publisher's");
    assert.ok([1, 2].every((n) => existsSync(join(probeState, "bell", "ots", `timeline-seq${String(n)}-manifest.txt.ots`))), "each proof on disk");
    // The reader (C-5): bell-verify over a loopback server serving the published tree the probe read, with the committed Caddy headers.
    const srv = await serveDir(pub, committedCaddyRules());
    try {
      const rep = await verifyServed({ source: urlSource(srv.url), keyring: keyringOf(key, 1) });
      assert.deepEqual([rep.status, rep.head_seq, rep.publications, rep.breaks], ["consistent_with_supplied_keyring", 2, 2, []], "bell-verify, the reader's side, on the tree the probe read");
    } finally { await srv.close(); }
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
    rmSync(root, { recursive: true, force: true });
  }
});
