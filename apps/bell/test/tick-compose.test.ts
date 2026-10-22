// MONARK Bell -- the integration test of part 2 of the collection timer (pipe T-b): the REAL tick, called by the command line's own entry
// (tickMain, --tick --state --handoff --status --ledger-dir) on a state seeded by the real --seed form, with its trajectory reused from
// state/trajectory/, runs the REAL runMain once per mint under the REAL guard (its cycle ledgers in a temporary directory), checks each run
// (checkRun), pre-validates the bundle (validateBundle) and deposits it with its manifest; a copy of that bundle, alone in an inbox, is then
// published by the real publishToDir and verified by bell-verify. Injected: the clock, the clock probe, the network (globalThis.fetch answers
// the two Solana operators, Databento and Massive on their hosts, offline), and the reference's sha256 (the pinned one belongs to a file
// that lives outside the repo; bell_tick_refuses_trajectory_mismatch_with_reference_prefix proves the default is the pin). Synthetic values only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync } from "node:crypto";
import { BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { keyringOf, sha256Hex } from "../scripts/bell-chain.mjs";
import { publishToDir } from "../scripts/bell-publish.mjs";
import { dirSource, verifyServed } from "../scripts/bell-verify.mjs";
import { BOUNDS, readManifest, validateBundle } from "../scripts/bell-validate.mjs";
import { dueInstant, unitOf } from "../src/plan.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { f64BitsHexLE } from "../src/rebase-trajectory.ts";
import { tradingDaysOf, type AdvPeriod } from "../src/volume.ts";
import { tickMain, type TickDeps } from "../src/tick.ts";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url));
const D = "2026-10-02", U = unitOf(D), DUE = dueInstant(U, UNIT_DUE_MARGIN_MIN); // Friday: the unit ends Monday 04:00 ET
const HELIUS_HOST = "helius.example.invalid", CS_HOST = "cs-sol.example.invalid";
const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, HELIUS_API_KEY: HKEY, CHAINSTACK_SOLANA_URL: `https://${CS_HOST}/${"c".repeat(32)}`,
  DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
  CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000", BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") };

// Two fills per mint in the unit's window: Friday 10:00 ET (regular session, reference close Thursday 10-01) and Saturday (reference close
// Friday 10-02); the trajectory: an initialize at 1, then 1.0039 effective 2026-09-01, the triplet the mint's state account holds.
const FILLS = [Date.UTC(2026, 9, 2, 14, 0, 0), Date.UTC(2026, 9, 3, 15, 0, 0)], EFF = Math.floor(Date.UTC(2026, 8, 1) / 1000);
const CLOSE = { scaled: "364000000000", decimal: 364 };
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
    : FILLS.map((ms, i) => ({ signature: `${m}-sig${String(i)}`, slot: 10 + i, blockTime: ms / 1000, err: null })).reverse();
  if (method === "getTransaction") return { slot: 10, transaction: { message: { accountKeys: [{ pubkey: pool(m).vaultBase }, { pubkey: pool(m).vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", "4635000000") } };
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
  if (`${r[1] ?? ""}-${r[2] ?? ""}-${r[3] ?? ""}` === r[4]) return { results: [{ c: CLOSE.decimal, t: Date.parse(`${r[4]}T16:00:00Z`) }] };
  const p: AdvPeriod = { year: Number(r[1]), month: Number(r[2]) };
  return { results: (tradingDaysOf(p) ?? []).map((d) => ({ t: Date.parse(`${d}T16:00:00Z`), v: 1_000_000 })) };
}
async function withNetwork<T>(body: (seen: string[]) => Promise<T>, answer: typeof rpc = rpc): Promise<T> {
  const real = globalThis.fetch, seen: string[] = [];
  globalThis.fetch = (async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input));
    seen.push(url.hostname);
    if (url.hostname === HELIUS_HOST || url.hostname === CS_HOST) {
      const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { id: unknown; method: string; params: unknown[] };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: answer(req.method, req.params) }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.hostname === "hist.databento.com" || url.hostname === "api.polygon.io") return new Response(JSON.stringify(cash(url)), { status: 200 });
    return Promise.reject(new Error(`no network: ${url.hostname}`));
  }) as typeof globalThis.fetch;
  try { return await body(seen); } finally { globalThis.fetch = real; }
}

// killer: apps/bell/src/tick.ts:158 CONST "\"--rebase-trajectory\", req.trajectory, " -> ""
test("bell_tick_composes_plan_runmain_checks_validate_into_a_publishable_bundle", async () => {
  const root = mkdtempSync(join(tmpdir(), "bell-compose-")), state = join(root, "collect"), handoff = join(root, "handoff"), ledger = join(root, "ledger");
  for (const d of [state, handoff, join(root, "status"), ledger]) mkdirSync(d);
  const out: string[] = [], err: string[] = [];
  const deps: TickDeps = { env: ENV, now: () => DUE, clockSynced: () => true, refTrajSha256: sha256Hex(TRAJ), out: (s) => { out.push(s); }, err: (s) => { err.push(s); } };
  assert.equal(await tickMain(["--seed", D, "--state", state], deps), 0, "the real seed form");
  const traj = join(state, "state", "trajectory");
  mkdirSync(traj);
  for (const f of ["reference.json", "rebase-trajectory.json"]) writeFileSync(join(traj, f), TRAJ);
  writeFileSync(join(traj, "produced.json"), JSON.stringify({ produced_at_ms: DUE - 3_600_000, sha256: sha256Hex(TRAJ) }));
  const argv = ["--tick", "--state", state, "--handoff", handoff, "--status", join(root, "status"), "--ledger-dir", ledger];
  const seen = await withNetwork(async (s) => { assert.equal(await tickMain(argv, deps), 0, err.join("\n")); return [...s]; });
  // The bundle and its manifest, the progress bound to the manifest, nothing left behind.
  const name = `unit-${D}`, bundle = join(handoff, name), manifest = readFileSync(`${bundle}.manifest`, "utf8");
  assert.deepEqual([readdirSync(handoff).sort(), out.at(-1)], [[name, `${name}.manifest`], `bell/tick: deposited ${name} manifest_sha256=${sha256Hex(manifest)}`]);
  assert.deepEqual(JSON.parse(readFileSync(join(state, "state", "progress.json"), "utf8")), { seed: D, last_unit: D, bundle: name, manifest_sha256: sha256Hex(manifest) });
  assert.deepEqual(readManifest(manifest)?.map((e) => e.path), BELL_UNIVERSE.flatMap((m) => ["journal.json", "provenance.json", "state.json", "timeline.jsonl"].map((f) => `${m}/${f}`)).sort());
  assert.ok(["hist.databento.com", "api.polygon.io", HELIUS_HOST, CS_HOST].every((h) => seen.includes(h)) && seen[0] === "hist.databento.com", "the cost query first, then every leg");
  // Each run is the real runMain's, on the unit's window, anchored on the trajectory: gT computed for each session, the cross matched.
  for (const m of BELL_UNIVERSE) {
    const st = JSON.parse(readFileSync(join(bundle, m, "state.json"), "utf8")) as Obj, gaps = (st.digest as Obj).gaps as Obj[];
    assert.deepEqual([st.window, gaps.length, gaps.every((g) => typeof g.gT === "string" && g.cash_cross === "matched")], [{ from_utc_ms: U.startMs, to_utc_ms: U.endMs - 1000 }, 2, true], m);
  }
  // The publisher's own rule accepts it; a copy alone in an inbox is published by the real publisher and verified by bell-verify.
  assert.equal(validateBundle(bundle, BOUNDS, DUE).length, BELL_UNIVERSE.length);
  const box = join(root, "box"), key = generateKeyPairSync("ed25519").privateKey;
  cpSync(bundle, join(box, "inbox", name), { recursive: true });
  publishToDir({ inboxDir: join(box, "inbox"), stateDir: box, privateKey: key, clock: () => DUE });
  const rep = await verifyServed({ source: dirSource(join(box, "public")), keyring: keyringOf(key, 1) });
  assert.deepEqual([rep.status, rep.publications, rep.breaks], ["consistent_with_supplied_keyring", 1, []]);
  // Each stage's credits come from the guard's own ledgers: the collect stage spent what the ledgers hold (no production: reused).
  const own = (op: string, cycle: string): number => readFileSync(join(ledger, cycle, `${op}.jsonl`), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj)
    .reduce((a, l) => a + (l.outcome === "attempted" || l.outcome === "settled" ? Number(l.credits_derived) : 0), 0);
  const cost = readFileSync(join(state, "state", "cost.jsonl"), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj);
  assert.deepEqual(cost.map((c) => [c.stage, c.op, c.credits]), [["collect", "helius", own("helius", "helius-2026-09-19")], ["collect", "chainstack", own("chainstack", "chainstack-2026-09-19")]]);
  assert.ok(cost.every((c) => Number(c.credits) > 0), "both operators spent");
  // A second tick at the same instant: nothing due, no call.
  const again = await withNetwork(async (s) => { assert.equal(await tickMain(argv, deps), 0); return [...s]; });
  assert.deepEqual([again, out.at(-1)?.startsWith("bell/tick: nothing_due unit-2026-10-05 "), existsSync(join(handoff, `.tmp-${name}`))], [[], true, false]);
});

// The same composition with one run its checks must refuse: the state account of the universe's second mint holds a scheduled multiplier
// the trajectory does not replay (1.004, not 1.0039), so that run cannot anchor the trajectory (rebase_unverified) and C03 refuses it. The
// first mint's run passes; the bundle still goes whole to quarantine/<D>/, under its attempt, and nothing reaches the handoff directory.
// killer: apps/bell/src/checks.ts:75 CONST "r(\"no_multiplier\") !== 0 || r(\"rebase_unverified\") !== 0" -> "false"
test("bell_tick_quarantines_a_run_its_checks_refuse", async () => {
  const root = mkdtempSync(join(tmpdir(), "bell-compose-q-")), state = join(root, "collect"), handoff = join(root, "handoff"), ledger = join(root, "ledger");
  for (const d of [state, handoff, join(root, "status"), ledger]) mkdirSync(d);
  const out: string[] = [], err: string[] = [];
  const deps: TickDeps = { env: ENV, now: () => DUE, clockSynced: () => true, refTrajSha256: sha256Hex(TRAJ), out: (s) => { out.push(s); }, err: (s) => { err.push(s); } };
  assert.equal(await tickMain(["--seed", D, "--state", state], deps), 0, "the real seed form");
  const traj = join(state, "state", "trajectory");
  mkdirSync(traj);
  for (const f of ["reference.json", "rebase-trajectory.json"]) writeFileSync(join(traj, f), TRAJ);
  writeFileSync(join(traj, "produced.json"), JSON.stringify({ produced_at_ms: DUE - 3_600_000, sha256: sha256Hex(TRAJ) }));
  const [held = "", refused = ""] = BELL_UNIVERSE;
  const drifted = (method: string, params: unknown[]): unknown => method === "getAccountInfo" && params[0] === mintOf(refused) && (params[1] as { encoding?: string }).encoding === "base64"
    ? { context: { slot: 9 }, value: { data: [stateConfigB64(1, EFF, 1.004), "base64"] } } : rpc(method, params);
  const argv = ["--tick", "--state", state, "--handoff", handoff, "--status", join(root, "status"), "--ledger-dir", ledger];
  assert.equal(await withNetwork(() => tickMain(argv, deps), drifted), 1, out.join("\n"));
  assert.equal(err.at(-1), `bell/tick: refused check_failed:C03: ${refused} trajectory_not_anchored`, "the status line names the control");
  const q = join(state, "quarantine", D), residuals = (m: string): Obj => (JSON.parse(readFileSync(join(q, "a1", m, "state.json"), "utf8")) as Obj).residuals as Obj;
  assert.deepEqual([readdirSync(q).sort(), readFileSync(join(q, "reason"), "utf8"), readdirSync(join(q, "a1")).sort()], [["a1", "reason"], "a1 check_failed:C03\n", [...BELL_UNIVERSE].sort()],
    "the attempt's bundle and its reason, in quarantine/<D>/");
  assert.deepEqual([residuals(held).rebase_unverified, Number(residuals(refused).rebase_unverified) > 0], [0, true], "the first run anchored, the second not");
  assert.deepEqual([readdirSync(handoff), JSON.parse(readFileSync(join(state, "state", "progress.json"), "utf8")), JSON.parse(readFileSync(join(state, "state", "attempts.json"), "utf8"))],
    [[], { seed: D, last_unit: null, bundle: null, manifest_sha256: null }, { [D]: 1 }], "nothing reaches the handoff, the progress stays, one attempt counted");
});
