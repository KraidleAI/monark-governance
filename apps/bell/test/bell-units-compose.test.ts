// MONARK Bell -- THE integration test of part 3 of the collection timer (G0 BELL-COLLECT-TIMER-1 section 4 "P3", contract C-5 of
// checkpoint-1, as PLAN-P3 C3-11 adapts it; pipes T-i, T-m, T-0, T-s, T-a, then T-b): the two committed units, composed. The REAL tick, called
// by the command line's own entry (tickMain) with the argv READ from the ExecStart of deploy/monark-bell-collect.service, deposits each unit
// it collects (the real runMain under the real guard, the real checks, the real pre-validation); the REAL publisher, called by its command
// line's own entry (runCli) with the argv READ from the ExecStart of deploy/monark-bell-publish.service, publishes them on the start mark its
// real --handoff-start form posts, and bell-verify reads the served tree as a reader does, over a loopback server with the committed Caddy
// headers. The way of the refused unit (C3-10, n-5) runs whole: the publisher refuses every revision of D1, the tick collects it again
// until its budget is spent and refuses publisher_refused:<code> with state/stalled.json, the real --abandon act frees it, and the publisher
// skips D1 by its tombstone and publishes D2.
// Injected, and nothing else (C3-11): the clocks (the tick's now, the publisher's clock; the publisher's is early while it must refuse D1:
// session_not_yet_publishable is the one refusal of a bundle the real tick can be handed, the tick pre-validating with the same rule at its
// own later instant), the two clock probes (CLOCK-PROBE-FORM-1: the host form is part 5's), the network (globalThis.fetch answers the two
// Solana operators, Databento and Massive on their hosts, offline; calque tick-compose.test.ts), the reference's sha256 (the pinned one
// belongs to a file outside the repository; bell_tick_refuses_trajectory_mismatch_with_reference_prefix proves the default is the pin) and the
// production record state/trajectory/produced.json, written an hour old before each tick, so the trajectory is reused and never produced here
// (its production stage is T-i3's own test). No real process (C3-11: the command lines refuse clock_unsynced until CLOCK-PROBE-FORM-1; the
// process run is part 5's replay). The acts this test plays, as lot 5b will: the four directories, the seed by the tick's --seed form, the
// trajectory and its reference in the collection's private state, the key under the credentials directory. Killers of C-5: (1) the manifest the publisher records is the one the tick bound into
// state/progress.json; (2) a static check of this file: no write into the handoff or the status directory, every one is the two entry points' (its
// module specifiers closed, the publisher by its command line only, no alias of either directory). Synthetic values only; the key is in memory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync } from "node:crypto";
import { ATTEMPT_BUDGET, BELL_LAYOUT, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { keyringOf, sha256Hex } from "../scripts/bell-chain.mjs";
import { runCli } from "../scripts/bell-publish.mjs";
import { urlSource, verifyServed } from "../scripts/bell-verify.mjs";
import { dueInstant, unitOf } from "../src/plan.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { f64BitsHexLE } from "../src/rebase-trajectory.ts";
import { tradingDaysOf, type AdvPeriod } from "../src/volume.ts";
import { tickMain, type TickDeps } from "../src/tick.ts";
import { committedCaddyRules, REPO, serveDir } from "./helpers/bell-served.ts";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url)), SELF = fileURLToPath(import.meta.url);
const COLLECT_UNIT = join(REPO, "deploy", "monark-bell-collect.service"), PUBLISH_UNIT = join(REPO, "deploy", "monark-bell-publish.service");
const D1 = "2026-10-02", D2 = "2026-10-05", U1 = unitOf(D1), DUE1 = dueInstant(U1, UNIT_DUE_MARGIN_MIN), DUE2 = dueInstant(unitOf(D2), UNIT_DUE_MARGIN_MIN);
const HELIUS_HOST = "helius.example.invalid", CS_HOST = "cs-sol.example.invalid";
const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, HELIUS_API_KEY: HKEY, CHAINSTACK_SOLANA_URL: `https://${CS_HOST}/${"c".repeat(32)}`,
  DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
  CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000", BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") };

// Two fills per mint in each unit's window: D1 (Friday) at 10:00 ET (regular session) and on Saturday; D2 (Monday) at 10:00 ET (regular)
// and at 18:00 ET (after hours). The trajectory: an initialize at 1, then 1.0039 effective 2026-09-01, the triplet the state account holds.
const FILLS: Readonly<Record<string, readonly number[]>> = { [D1]: [Date.UTC(2026, 9, 2, 14), Date.UTC(2026, 9, 3, 15)], [D2]: [Date.UTC(2026, 9, 5, 14), Date.UTC(2026, 9, 5, 22)] };
let fills: readonly number[] = FILLS[D1] ?? [];
const EFF = Math.floor(Date.UTC(2026, 8, 1) / 1000), CLOSE = { scaled: "3003300300000", decimal: 3003.3003 };
const pool = (m: string): { vaultBase: string; vaultQuote: string } => { const p = POOLS.find((x) => x.baseSymbol === m && x.chain === "solana"); assert.ok(p?.vaultBase !== undefined && p.vaultQuote !== undefined); return { vaultBase: p.vaultBase, vaultQuote: p.vaultQuote }; };
const mintOf = (m: string): string => XSTOCKS.find((t) => t.symbol === m)?.address ?? "";
const TRAJ = JSON.stringify(Object.fromEntries(BELL_UNIVERSE.map((m) => [m, { scanComplete: true, scanMethod: "authority", events: [
  { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: `i-${m}` },
  { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: EFF, blockTimeSec: EFF - 1000, slot: 2, instructionIndex: 0, signature: `u-${m}` }] }])));
const stateConfigB64 = (mult: number, effTs: number, newMult: number): string => { // the 56 bytes of ScaledUiAmountConfig (collect.test.ts layout)
  const b = new Uint8Array(56), v = new DataView(b.buffer);
  v.setFloat64(32, mult, true); v.setBigInt64(40, BigInt(effTs), true); v.setFloat64(48, newMult, true);
  return Buffer.from(b).toString("base64");
};
const bal = (base: string, quote: string): Obj[] => [{ accountIndex: 0, uiTokenAmount: { amount: base } }, { accountIndex: 1, uiTokenAmount: { amount: quote } }];
/** The JSON-RPC answer of both operators: the same signatures, swaps, mint and state account, so every quorum concords. */
function rpc(method: string, params: unknown[]): unknown {
  const m = BELL_UNIVERSE.find((x) => params[0] === pool(x).vaultBase || params[0] === mintOf(x) || String(params[0]).startsWith(`${x}-sig`));
  if (m === undefined) throw new Error(`no fixture for ${method}`);
  if (method === "getSignaturesForAddress") return (params[1] as { before?: string }).before !== undefined ? []
    : fills.map((ms, i) => ({ signature: `${m}-sig${String(i)}`, slot: 10 + i, blockTime: ms / 1000, err: null })).reverse();
  if (method === "getTransaction") return { slot: 10, transaction: { message: { accountKeys: [{ pubkey: pool(m).vaultBase }, { pubkey: pool(m).vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", "1988448875") } };
  if (method === "getAccountInfo") return (params[1] as { encoding?: string }).encoding === "base64" ? { context: { slot: 9 }, value: { data: [stateConfigB64(1, EFF, 1.0039), "base64"] } }
    : { context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } };
  throw new Error(`unexpected ${method}`);
}
/** Databento (the free cost query, then the reference closes) and Massive (the cross on each day, the ADV month's daily bars). */
function cash(url: URL): unknown {
  if (url.pathname === "/v0/metadata.get_cost") return 0.25;
  if (url.pathname === "/v0/timeseries.get_range") {
    const out: Obj[] = [];
    for (let t = Date.parse(`${url.searchParams.get("start") ?? ""}T00:00:00Z`); t < Date.parse(`${url.searchParams.get("end") ?? ""}T00:00:00Z`); t += 86_400_000) {
      out.push({ hd: { ts_event: String(BigInt(t) * 1_000_000n) }, close: CLOSE.scaled });
    }
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
/** stdout and stderr of `body`, captured. */
function io(body: () => number): { code: number; out: string; err: string } {
  const w = { out: process.stdout.write.bind(process.stdout), err: process.stderr.write.bind(process.stderr) }, got = { out: "", err: "" };
  process.stdout.write = (s: string): boolean => { got.out += s; return true; };
  process.stderr.write = (s: string): boolean => { got.err += s; return true; };
  try { return { code: body(), ...got }; } finally { process.stdout.write = w.out; process.stderr.write = w.err; }
}
const jsonl = (p: string): Obj[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) : []);

// killer: apps/bell/src/tick.ts:259 CONST "manifest_sha256: sha256Hex(manifest)" -> "manifest_sha256: sha256Hex(bundle)"
test("bell_units_compose_tick_to_publish_to_verify", async () => {
  assert.ok(existsSync(COLLECT_UNIT), "deploy/monark-bell-collect.service is committed");
  assert.ok(/^ExecStart=.* --handoff /m.test(readFileSync(PUBLISH_UNIT, "utf8")), "deploy/monark-bell-publish.service runs the --handoff form");
  // Killer (2): every write into the handoff or the status directory is the two entry points'. The writers of node:fs on a line of this file
  // never name either directory (the four directories of the layout are made empty by one act line that names neither).
  const writer = new RegExp(`\\b(${["writeFileSync", "appendFileSync", "cpSync", "copyFileSync", "renameSync", "rmSync", "unlinkSync", "mkdirSync", "symlinkSync", "linkSync", "openSync", "writeSync"].join("|")})\\(`);
  const src = readFileSync(SELF, "utf8"), lines = src.split("\n"), writes = lines.filter((l) => writer.test(l) && !l.includes("new RegExp("));
  assert.ok(writes.length >= 4, "non-vacuity: this file writes the acts");
  assert.deepEqual(writes.filter((l) => /handoff|status/i.test(l)), [], "no line of this file writes the handoff or the status directory");
  // ...and through no other module nor alias (G2 of part 3, F-2 BELL-COMPOSE-STATIC-KILLER-1): the module specifiers of this file, in every form
  // (static, dynamic, require; double quotes, single quotes or a template literal without substitution, G2 of part 3, r2-2), are a closed list,
  // with no promise or bare form of node:fs; the publisher is imported once, its command line only.
  const CLOSED = ["node:test", "node:assert/strict", "node:fs", "node:os", "node:path", "node:url", "node:crypto", "../../../scripts/bell-deploy.mjs", "../scripts/bell-chain.mjs",
    "../scripts/bell-publish.mjs", "../scripts/bell-verify.mjs", "../src/plan.ts", "../src/pools.ts", "../src/rebase-trajectory.ts", "../src/volume.ts", "../src/tick.ts", "./helpers/bell-served.ts"];
  const specsOf = (s: string): string[] => [...s.matchAll(/\bfrom\s*(["'`])([^"'`]+)\1|\bimport\s*\(\s*(["'`])([^"'`]+)\3\s*\)|\brequire\s*\(\s*(["'`])([^"'`]+)\5\s*\)/g)]
    .map((m) => m[2] ?? m[4] ?? m[6] ?? ""), specs = specsOf(src);
  // The synthetic forms are built at run time (the quote put in place of @): written as such, this file's own scan would find them.
  assert.deepEqual(["\"", "'", "`"].flatMap((q) => specsOf("from @node:fs/promises@; import(@node:fs/promises@); import( @node:fs/promises@ ); require(@node:fs/promises@)".replaceAll("@", q))),
    Array<string>(12).fill("node:fs/promises"), "the scan sees each form in each of the three quotes");
  assert.deepEqual([[...new Set(specs)].sort(), specs.filter((s) => ["node:fs/promises", "fs", "fs/promises"].includes(s))], [[...CLOSED].sort(), []], "the module specifiers, closed");
  assert.deepEqual([specs.filter((s) => s.endsWith("/bell-publish.mjs")).length, [...src.matchAll(/^import\s+(.+?)\s+from\s*"\.\.\/scripts\/bell-publish\.mjs";$/gm)].map((m) => m[1])],
    [1, ["{ runCli }"]], "the publisher, imported once (named, namespace, default or dynamic), by its command line only");
  // No alias of either directory: no binding but their declaration below takes a path made of one (the name itself, a join or resolve from it, a
  // template literal of it; the join or resolve of a module, path.join or path.posix.resolve, included: r2-2); a binding of a value read under them
  // (the mark's output, a manifest, a status file) is not an alias. It reddens on each form. Out of the check, by choice: an array or an object that
  // carries a directory (`[statusDir][0]`, `{ d: statusDir }`) does not write it, and a writer of node:fs on a line that names either is refused above.
  const aliases = (ls: readonly string[]): string[] => ls.filter((l) => /\b(?:const|let|var)\s/.test(l)
    && /=\s*(?:(?:handoffDir|statusDir)\b(?!\s*[.([])|(?:[\w$]+\.)*(?:join|resolve)\(\s*(?:handoffDir|statusDir)\b|`[^`]*\$\{\s*(?:handoffDir|statusDir)\s*\})/.test(l));
  assert.equal(aliases(["const a = X;", "let b = join(X, \"x\");", "var c = resolve(X);", "const d = 1, e = `${X}/x`;", "const f = path.join(X, \"x\");", "const g = path.posix.resolve(X);"]
    .map((l) => l.replace("X", "statusDir"))).length, 6, "the check reddens on each form");
  assert.deepEqual(aliases(lines), [], "no alias of the handoff or the status directory");

  const root = mkdtempSync(join(tmpdir(), "bell-units-")), creds = join(root, "credentials");
  for (const x of Object.values(BELL_LAYOUT)) mkdirSync(join(root, ...x.path.split("/").filter((s) => s !== "")), { recursive: true }); // act: the four directories, empty
  const collectArgv = execArgv(COLLECT_UNIT, root), publishArgv = execArgv(PUBLISH_UNIT, root);
  const state = valueOf(collectArgv, "--state"), handoffDir = valueOf(collectArgv, "--handoff"), statusDir = valueOf(collectArgv, "--status");
  assert.deepEqual([valueOf(publishArgv, "--handoff"), valueOf(publishArgv, "--status")], [handoffDir, statusDir], "the two units meet on the same two directories");
  mkdirSync(valueOf(collectArgv, "--ledger-dir"), { recursive: true }); // act: the guard's ledger root, in the private side
  const key = generateKeyPairSync("ed25519").privateKey, cred = /^LoadCredential=([\w-]+):/m.exec(readFileSync(PUBLISH_UNIT, "utf8"))?.[1] ?? "?";
  mkdirSync(creds);
  writeFileSync(join(creds, cred), key.export({ type: "pkcs8", format: "pem" })); // act: the key, as PID 1 hands it to the unit
  const out: string[] = [], err: string[] = [];
  const tickDeps = (now: number): TickDeps => ({ env: ENV, now: () => now, clockSynced: () => true, refTrajSha256: sha256Hex(TRAJ), out: (s) => { out.push(s); }, err: (s) => { err.push(s); } });
  const tick = (now: number): Promise<number> => withNetwork(() => tickMain(collectArgv, tickDeps(now)));
  const publish = (clock: number, argv: readonly string[] = publishArgv): ReturnType<typeof io> => {
    const prior = process.env.CREDENTIALS_DIRECTORY;
    process.env.CREDENTIALS_DIRECTORY = creds;
    try { return io(() => runCli([...argv], { clockSynced: () => true, clock: () => clock })); } finally { if (prior === undefined) delete process.env.CREDENTIALS_DIRECTORY; else process.env.CREDENTIALS_DIRECTORY = prior; }
  };
  try {
    // Acts: the seed (the tick's --seed form), the trajectory and its reference (state/trajectory/), the start mark (the publisher's form).
    assert.equal(await tickMain(["--seed", D1, "--state", state], tickDeps(DUE1)), 0, "the real seed form");
    const traj = join(state, "state", "trajectory");
    mkdirSync(traj, { recursive: true });
    for (const f of ["reference.json", "rebase-trajectory.json"]) writeFileSync(join(traj, f), TRAJ);
    // The production record: the trajectory is reused, an hour old at each tick (its production stage is T-i3's own test,
    // bell_tick_produces_trajectory_when_stale_and_reuses_when_fresh; a stale one would run --rebase-produce, which this fixture does not answer).
    const fresh = (now: number): void => { writeFileSync(join(traj, "produced.json"), JSON.stringify({ produced_at_ms: now - 3_600_000, sha256: sha256Hex(TRAJ) })); };
    fresh(DUE1);
    const EARLY = U1.startMs; // before the gate of D1's Saturday session: the publisher refuses the bundle
    const mark = publish(EARLY, ["--handoff-start", D1, "--handoff", handoffDir, "--status", statusDir]);
    assert.deepEqual([mark.code, mark.err, JSON.parse(readFileSync(join(statusDir, "start"), "utf8"))], [0, "", { from_unit: D1, posted_at: new Date(EARLY).toISOString() }], "the mark");

    // The refused unit: each revision of D1 the tick deposits, the publisher refuses and records; the tick collects D1 again, in its budget.
    const names = [`unit-${D1}`, ...Array.from({ length: ATTEMPT_BUDGET - 1 }, (_, k) => `unit-${D1}-r${String(k + 1)}`)];
    for (const [k, name] of names.entries()) {
      assert.equal(await tick(DUE1), 0, err.join("\n"));
      const manifest = readFileSync(join(handoffDir, `${name}.manifest`), "utf8");
      assert.equal(out.at(-1), `bell/tick: deposited ${name} manifest_sha256=${sha256Hex(manifest)}`, `attempt ${String(k + 1)}`);
      const p = publish(EARLY);
      assert.deepEqual([p.code, p.out, /^bell\/publish: session_not_yet_publishable: /.test(p.err)], [1, "", true], `${name} refused by the publisher: ${p.err}`);
      assert.deepEqual(jsonl(join(statusDir, "refused.jsonl")).at(-1), { bundle: name, manifest_sha256: sha256Hex(manifest), code: "session_not_yet_publishable", refused_at: new Date(EARLY).toISOString() });
    }
    assert.equal(await tick(DUE1), 1);
    assert.equal(err.at(-1), `bell/tick: refused publisher_refused:session_not_yet_publishable: unit-${D1}-r${String(ATTEMPT_BUDGET)} would collect unit-${D1} again, its budget of ${String(ATTEMPT_BUDGET)} attempts spent`);
    assert.deepEqual(JSON.parse(readFileSync(join(state, "state", "stalled.json"), "utf8")), { unit: D1, code: "session_not_yet_publishable" }, "the tick's own record of the refused unit");
    // The act frees it (the refused unit's way, C3-10), then the next unit is due, deposited, and published past D1 by its tombstone.
    assert.equal(await tickMain(["--abandon", D1, "--reason", "publisher_refused", "--state", state, "--handoff", handoffDir], tickDeps(DUE1 + 60_000)), 0, err.join("\n"));
    assert.deepEqual([existsSync(join(state, "state", "stalled.json")), existsSync(join(handoffDir, `unit-${D1}.abandoned`))], [false, true], "the record removed, the tombstone deposited");
    fills = FILLS[D2] ?? [];
    fresh(DUE2);
    assert.equal(await tick(DUE2), 0, err.join("\n"));
    const progress = JSON.parse(readFileSync(join(state, "state", "progress.json"), "utf8")) as Obj;
    assert.deepEqual([progress.last_unit, progress.bundle, out.at(-1)], [D2, `unit-${D2}`, `bell/tick: deposited unit-${D2} manifest_sha256=${String(progress.manifest_sha256)}`]);
    const p = publish(DUE2);
    assert.deepEqual([p.code, p.err, JSON.parse(p.out)], [0, "", { status: "published", published: [{ bundle: `unit-${D2}`, seq: 1 }] }], "D1 skipped, D2 published");
    // Killer (1): the publisher recorded the manifest the tick bound into its progress, and served the runs of that very deposit.
    const published = jsonl(join(statusDir, "published.jsonl"));
    assert.deepEqual(published, [{ bundle: `unit-${D2}`, manifest_sha256: progress.manifest_sha256, seq: 1, published_at: new Date(DUE2).toISOString() }]);
    assert.equal(sha256Hex(readFileSync(join(handoffDir, `unit-${D2}.manifest`), "utf8")), progress.manifest_sha256, "the manifest in place is the bound one");
    const shas = BELL_UNIVERSE.map((m) => (JSON.parse(readFileSync(join(handoffDir, `unit-${D2}`, m, "state.json"), "utf8")) as Obj).bell_sha);
    const stateDir = valueOf(publishArgv, "--state"), line = jsonl(join(stateDir, "timeline.jsonl"))[0] ?? {};
    assert.deepEqual(((line.runs ?? []) as Obj[]).map((r) => r.bell_sha), shas, "the timeline line carries the runs of the tick's deposit");
    // The reader: bell-verify over a loopback server serving public/ with the committed Caddy headers.
    const srv = await serveDir(join(stateDir, "public"), committedCaddyRules());
    try {
      const rep = await verifyServed({ source: urlSource(srv.url), keyring: keyringOf(key, 1) });
      assert.deepEqual([rep.status, rep.head_seq, rep.publications, rep.breaks], ["consistent_with_supplied_keyring", 1, 1, []]);
    } finally { await srv.close(); }
    const again = publish(DUE2 + 60_000);
    assert.deepEqual([again.code, JSON.parse(again.out)], [0, { status: "nothing_to_publish", published: [] }], "a second start publishes nothing");
    assert.deepEqual(readdirSync(handoffDir).filter((x) => x.startsWith(".tmp-")), [], "nothing staged left behind");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
