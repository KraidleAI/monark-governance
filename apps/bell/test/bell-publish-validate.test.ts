// MONARK Bell -- T-1b S-2 oracle (ADR-T1b-backend v2 D4, D5, D7, "Constantes"; checkpoint-1 C-4, C-7). The publisher refuses BY
// NAME, with the state directory byte-identical, every bundle outside C-in-1..10; its whitelist is DERIVED from the collector's
// types and accepts every real shape. Inputs = REAL outputs of runMain (offline, --out outside the repo, precedent
// collect.test.ts:680-744) or of collect(), each refusal mutating ONE field. No network; the key is generated in memory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, generateKeyPairSync } from "node:crypto";
import { collect, chainTimeline, runMain, type SymbolInput } from "../src/collect.ts";
import type { GapEntryFilled, GapEntryAbstained } from "../src/digest.ts";
import { RESIDUAL_CODES } from "../src/residuals.ts";
import { POOLS } from "../src/pools.ts";
import { rowsFromCsv } from "../src/halts.ts";
import { readMintToken2022 } from "../src/supply.ts";
import { f64BitsHexLE, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import type { DatabentoGet, PolygonGet } from "../src/close.ts";
import type { JsonRpcCall } from "../src/quorum.ts";
import type { AdvDailyBar } from "../src/volume.ts";
import { canonical, rechainRunTimeline, sha256Hex } from "../scripts/bell-chain.mjs";
import { BellPublishError, KEY_SHAPES, NOT_SERVED, WHITELIST, publishToDir, type Bounds, type PublishResult, type RefusalCode } from "../scripts/bell-publish.mjs";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url));
const KEY = generateKeyPairSync("ed25519").privateKey;
const T = 1_800_000_000_000; // 2027-01-15T08:00Z, past every earliest_publish_utc of these fixtures (reference closes of 2026-09)
const tmp = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));
const readJson = (p: string): Obj => JSON.parse(readFileSync(p, "utf8")) as Obj;
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");

/** Every path under root (dirs marked "/") with the sha256 of every file: the state directory's fingerprint. */
function fingerprint(root: string): string {
  const out: string[] = [];
  const walk = (d: string, rel: string): void => {
    for (const n of readdirSync(d).sort()) {
      const a = join(d, n), r = `${rel}/${n}`;
      if (statSync(a).isDirectory()) { out.push(`${r}/`); walk(a, r); } else out.push(`${r} ${sha(readFileSync(a))}`);
    }
  };
  walk(root, "");
  return out.join("\n");
}

const POOL = POOLS.find((p) => p.baseSymbol === "TSLAx" && p.chain === "solana")!;
/** A 56-byte ScaledUiAmountConfig (multiplier m, effTs 0, new multiplier m), the base64 read of the C-3 anchor (collect.test.ts:73). */
const stateB64 = (m: number): string => { const b = new Uint8Array(56), v = new DataView(b.buffer); v.setFloat64(32, m, true); v.setFloat64(48, m, true); return Buffer.from(b).toString("base64"); };
/** ONE real runMain output, offline, --out outside the repo; `usdc` is the swap's quote leg (a distinct vwap, hence bell_sha); `week` shifts session and close by 7 days. */
async function runMainOut(usdc: bigint, week = 0): Promise<string> {
  const btMs = Date.UTC(2026, 8, 19 + 7 * week, 13, 31, 4); // Sat 2026-09-19 (+ week): weekend session, reference close 2026-09-18 (+ week)
  const bal = (base: string, quote: string): Obj[] => [{ accountIndex: 0, uiTokenAmount: { amount: base } }, { accountIndex: 1, uiTokenAmount: { amount: quote } }];
  const swap = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: POOL.vaultBase }, { pubkey: POOL.vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", String(5_000_000_000n - usdc * 1_000_000n)) } };
  const call: JsonRpcCall = (_url, method, params) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "sig1", slot: 1, blockTime: Math.floor(btMs / 1000), err: null }]);
    if (method === "getTransaction") return Promise.resolve(swap);
    if (method === "getAccountInfo") return Promise.resolve((params[1] as { encoding?: string } | undefined)?.encoding === "base64"
      ? { context: { slot: 9 }, value: { data: [stateB64(1), "base64"] } } : { context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } });
    throw new Error("unexpected " + method);
  };
  // synthetic cash close (never a real one), read under a synthetic key (an empty key emits no request, C-4 of
  // ADR-BELL-CASH-LEG-1); no cross-check key in env => the cross is "unavailable" (named, counted)
  const databentoGet: DatabentoGet = () => Promise.resolve([{ hd: { ts_event: String(BigInt(Date.UTC(2026, 8, 18 + 7 * week)) * 1_000_000n) }, close: "364000000000" }]);
  const polygonGet: PolygonGet = () => Promise.reject(new Error("not reached offline"));
  const base = tmp("t1b-run-"), out = join(base, "run"), traj = join(base, "traj.json");
  writeFileSync(traj, JSON.stringify({ TSLAx: { events: [{ kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "s1" }], scanComplete: true, scanMethod: "authority" } }));
  await runMain(["--pools", "TSLAx", "--max-calls", "100000", "--body-sample", "0", "--min-interval", "0", "--from-utc", String(btMs - 2 * 86_400_000),
    "--to-utc", String(btMs + 86_400_000), "--rebase-trajectory", traj, "--out", out],
  { call, databentoGet, polygonGet, env: { DATABENTO_API_KEY: "k", BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") }, nowMs: btMs + 86_400_000 });
  return out;
}
const RUN_A = await runMainOut(365n), RUN_B = await runMainOut(366n), RUN_LATE = await runMainOut(367n, 1); // RUN_LATE: a week later

interface Staged { state: string; inbox: string; run: (i: number) => string }
/** A fresh state directory whose inbox holds ONE bundle: copies of the run directories as runMain wrote them. */
function stage(runs: readonly string[]): Staged {
  const state = tmp("t1b-state-"), inbox = join(state, "inbox");
  runs.forEach((r, i) => { cpSync(r, join(inbox, "b1", `run${String(i)}`), { recursive: true }); });
  return { state, inbox, run: (i) => join(inbox, "b1", `run${String(i)}`) };
}
/** Mutate ONE field of a run file, re-written in runMain's own form (JSON.stringify(x, null, 2), collect.ts:855,859). */
function mutate(file: string, f: (o: Obj) => void): void { const o = readJson(file); f(o); writeFileSync(file, JSON.stringify(o, null, 2)); }
const gaps = (o: Obj): Obj[] => (o.digest as Obj).gaps as Obj[];
const publish = (s: Staged, clock = T): PublishResult => publishToDir({ inboxDir: s.inbox, stateDir: s.state, privateKey: KEY, clock: () => clock });
/** Asserts the named refusal AND a byte-identical state directory; returns the detail (a path, never a value). */
function refuses(s: Staged, code: RefusalCode, opts: { clock?: number; bounds?: Partial<Bounds> } = {}): string {
  const before = fingerprint(s.state);
  let detail = "";
  assert.throws(() => publishToDir({ inboxDir: s.inbox, stateDir: s.state, privateKey: KEY, clock: () => opts.clock ?? T, ...(opts.bounds ? { bounds: opts.bounds } : {}) }),
    (e: unknown) => { assert.ok(e instanceof BellPublishError, String(e)); assert.equal(e.code, code, e.message); detail = e.detail; return true; });
  assert.equal(fingerprint(s.state), before, `${code}: the state directory is byte-identical`);
  return detail;
}

// ---- C-in-3 (digest re-hashed to bell_sha) and C-in-7 (the provenance bound to that bell_sha) ----
test("bell_publish_refuses_bell_sha_mismatch", () => {
  const a = stage([RUN_A]);
  mutate(join(a.run(0), "state.json"), (o) => { gaps(o)[0]!.vwap = "366.0000000000"; });
  assert.match(refuses(a, "bell_sha_mismatch"), /^\$\.runs\[0\]\.state\.bell_sha$/);
  const b = stage([RUN_A]);
  mutate(join(b.run(0), "provenance.json"), (o) => { o.bellSha = "0".repeat(64); });
  refuses(b, "provenance_binding_mismatch");
});

// ---- C-in-2: keys at every level (state, provenance read, run timeline records) within the whitelist (own keys; close_source/adv_source never in the state); schema pinned ----
test("bell_publish_refuses_unknown_state_field", () => {
  const cases: Array<[string, (o: Obj) => void, RegExp]> = [["state.json", (o) => { o.extra = "x"; }, /\.state\.extra$/],
    ["state.json", (o) => { ((o.digest as Obj).supply as Obj[])[0]!.foo = "x"; }, /\.state\.digest\.supply\[0\]\.foo$/],
    ["provenance.json", (o) => { (o.sources as Obj).foo = "x"; }, /\.provenance\.sources\.foo$/]];
  for (const [file, f, where] of cases) { const s = stage([RUN_A]); mutate(join(s.run(0), file), f); assert.match(refuses(s, "unknown_field"), where); }
  for (const [k, v] of [["close_source", "a-named-source"], ["adv_source", "a-named-source"], ["constructor", {}], ["__proto__", {}]] as const) { // R-T1b-2: never in the state; OWN keys only
    const s = stage([RUN_A]), p = join(s.run(0), "state.json"); writeFileSync(p, readFileSync(p, "utf8").replace(/^\{/, `{"${k}": ${JSON.stringify(v)},`)); assert.equal(refuses(s, "unknown_field"), `$.runs[0].state.${k}`); } // as TEXT: JSON.parse keeps "__proto__" an own key
  const r = stage([RUN_A]); // a record field, re-chained by the collector's own chainTimeline so only the whitelist can object
  const recs = readFileSync(join(RUN_A, "timeline.jsonl"), "utf8").trim().split("\n").map((l) => { const o = JSON.parse(l) as Obj; delete o.prev_line_hash; o.foo = "x"; return o; });
  writeFileSync(join(r.run(0), "timeline.jsonl"), chainTimeline(recs as Parameters<typeof chainTimeline>[0]).map((l) => JSON.stringify(l)).join("\n") + "\n");
  assert.match(refuses(r, "unknown_field"), /\.timeline\[0\]\.foo$/);
  const v = stage([RUN_A]);
  mutate(join(v.run(0), "state.json"), (o) => { o.schema = "bell-state-v2"; });
  refuses(v, "schema_mismatch");
});

// ---- C-in-4: a close-like numeric field is refused BY NAME (checked before the whitelist) ----
test("bell_publish_refuses_close_like_field", () => {
  const s = stage([RUN_A]);
  mutate(join(s.run(0), "state.json"), (o) => { gaps(o)[0]!.closeRef = 364.5; });
  assert.match(refuses(s, "close_like_field"), /\.state\.digest\.gaps\[0\]\.closeRef$/);
  const p = stage([RUN_A]);
  mutate(join(p.run(0), "provenance.json"), (o) => { (o.sources as Obj).adv = 1_000_000; });
  refuses(p, "close_like_field");
});

// ---- C-in-5 (R-T1b-1): one session before its earliest_publish_utc refuses the WHOLE bundle; equality publishes ----
test("bell_publish_refuses_unpublishable_session", () => {
  const epu = Math.max(...gaps(readJson(join(RUN_A, "state.json"))).map((g) => (typeof g.earliest_publish_utc === "number" ? g.earliest_publish_utc : 0)));
  assert.ok(epu > 0, "the runMain fixture carries a g_t gated by earliest_publish_utc (non-vacuity)");
  assert.match(refuses(stage([RUN_A]), "session_not_yet_publishable", { clock: epu - 1 }), /gaps\[\d+\]\.earliest_publish_utc$/);
  assert.equal(publish(stage([RUN_A]), epu).status, "published", "published_at == earliest_publish_utc publishes (strict >)");
  assert.match(refuses(stage([RUN_A, RUN_LATE, RUN_B]), "session_not_yet_publishable", { clock: epu }), /^\$\.runs\[1\]\.state\.digest\.gaps\[\d+\]\.earliest_publish_utc$/, "RUN_A publishable at epu, RUN_LATE not: the WHOLE bundle is refused");
});

// ---- C-in-8: no served string (provenance, state.json, run records) carries "://" or a credential shape; provider labels are bare (CP1 (i), decision 69) ----
test("bell_publish_refuses_url_or_key_shaped_string", () => {
  const url = ["https", "//x.invalid/r"].join(":"), uuid = ["deadbeef", "1234", "5678", "9abc", "def012345678"].join("-");
  const cases: Array<(o: Obj) => void> = [(o) => { ((o.providers as Obj).providers as unknown[])[0] = url; },
    (o) => { (o.sources as Obj).cash_cross_unavailable_days = ["api" + "-key=" + uuid]; },
    (o) => { (o.sources as Obj).generated_at = "db" + "-" + "A1".repeat(12); },
    (o) => { ((o.providers as Obj).faults as unknown[]).push({ provider: "cash-data.example", status: "503" }); }];
  for (const f of cases) { const s = stage([RUN_A]); mutate(join(s.run(0), "provenance.json"), f); refuses(s, "url_or_key_shaped_string"); }
  const st = stage([RUN_A]), d = readJson(join(RUN_A, "state.json")), rc = stage([RUN_A]); // every SERVED string: state.json (digest re-hashed), the run records (re-chained)
  gaps(d)[0]!.vwap = url; d.bell_sha = sha256Hex(canonical(d.digest)); writeFileSync(join(st.run(0), "state.json"), JSON.stringify(d, null, 2)); mutate(join(st.run(0), "provenance.json"), (o) => { o.bellSha = d.bell_sha; });
  const recs = readFileSync(join(RUN_A, "timeline.jsonl"), "utf8").trim().split("\n").map((l) => { const o = JSON.parse(l) as Obj; delete o.prev_line_hash; o.chain = url; return o; });
  writeFileSync(join(rc.run(0), "timeline.jsonl"), chainTimeline(recs as Parameters<typeof chainTimeline>[0]).map((l) => JSON.stringify(l)).join("\n") + "\n");
  assert.deepEqual([refuses(st, "url_or_key_shaped_string"), refuses(rc, "url_or_key_shaped_string")], ["$.runs[0].state.digest.gaps[0].vwap", "$.runs[0].timeline[0].chain"]);
  const guard = readFileSync(join(HERE, "..", "..", "..", "test", "no-secret-in-repo.test.ts"), "utf8");
  assert.equal(KEY_SHAPES[0]?.source, ":\\/\\/");
  for (const re of KEY_SHAPES.slice(1)) assert.ok(guard.includes(`re: /${re.source}/`), `${re.source}: a verbatim copy of test/no-secret-in-repo.test.ts`);
});

// ---- C-in-6: the run timeline re-chains from GENESIS (collect.ts:86-96) and its symbols are the state's ----
test("bell_publish_refuses_broken_run_timeline", () => {
  const three = chainTimeline([{ symbol: "A" }, { symbol: "B" }, { symbol: "C" }]);
  assert.equal(rechainRunTimeline(three).ok, true, "the collector's own chain re-derives");
  assert.deepEqual(rechainRunTimeline([three[0], { ...(three[1] as Obj), symbol: "X" }, three[2]]), { ok: false, index: 2, reason: "prev_line_hash_mismatch" });
  const a = stage([RUN_A]);
  writeFileSync(join(a.run(0), "timeline.jsonl"), readFileSync(join(RUN_A, "timeline.jsonl"), "utf8").replace(/"prev_line_hash":"0{64}"/, `"prev_line_hash":"${"f".repeat(64)}"`));
  assert.match(refuses(a, "run_timeline_broken"), /timeline\[0\]: prev_line_hash_mismatch$/);
  const b = stage([RUN_A]); // re-chained by the collector, but naming a symbol the state does not carry
  const recs = readFileSync(join(RUN_A, "timeline.jsonl"), "utf8").trim().split("\n").map((l) => { const o = JSON.parse(l) as Obj; delete o.prev_line_hash; o.symbol = "ZZZx"; return o; });
  writeFileSync(join(b.run(0), "timeline.jsonl"), chainTimeline(recs as Parameters<typeof chainTimeline>[0]).map((l) => JSON.stringify(l)).join("\n") + "\n");
  assert.match(refuses(b, "run_timeline_broken"), /symbol: not in the state$/);
  const c = stage([RUN_A]);
  writeFileSync(join(c.run(0), "timeline.jsonl"), readFileSync(join(RUN_A, "timeline.jsonl"), "utf8").trimEnd());
  refuses(c, "run_timeline_broken");
});

// ---- C-in-1: exactly one pending bundle holding at least one run ----
test("bell_publish_requires_exactly_one_pending_bundle", () => {
  refuses(stage([]), "inbox_not_exactly_one_bundle");
  const two = stage([RUN_A]);
  cpSync(join(two.inbox, "b1"), join(two.inbox, "b2"), { recursive: true });
  refuses(two, "inbox_not_exactly_one_bundle");
  const empty = stage([]);
  mkdirSync(join(empty.inbox, "b1"), { recursive: true });
  refuses(empty, "inbox_not_exactly_one_bundle");
});

// ---- C-in-10: never the same run twice in a bundle ----
test("bell_publish_refuses_duplicate_run_in_bundle", () => {
  assert.match(refuses(stage([RUN_A, RUN_A]), "duplicate_run"), /^\$\.runs\[1\]/);
  assert.equal(publish(stage([RUN_A, RUN_B])).status, "published", "two distinct runs publish");
});

// ---- D5 / R-T1b-2: the served provenance is the DECLARED projection: the run's provenance minus close_source and adv_source ----
test("bell_publish_provenance_projection_is_declared", () => {
  const s = stage([RUN_A]), input = readJson(join(RUN_A, "provenance.json")), src = input.sources as Obj;
  assert.ok(typeof src.close_source === "string" && typeof src.adv_source === "string", "the run names both sources (non-vacuity)");
  const r = publish(s);
  const served = readJson(join(s.state, "public", "provenance.json"));
  const kept = Object.fromEntries(Object.entries(src).filter(([k]) => k !== "close_source" && k !== "adv_source"));
  assert.deepEqual((served.runs as Obj[])[0], { ...input, sources: kept }, "served = the run's provenance minus the two names, nothing computed");
  assert.deepEqual([served.schema, served.seq, served.published_at], ["bell-public-provenance-v1", r.seq, r.published_at]);
  assert.deepEqual(Object.keys(NOT_SERVED.sources ?? {}).sort(), ["adv_source", "close_source"]);
  for (const f of ["state.json", "provenance.json", "timeline.jsonl"]) {
    const txt = readFileSync(join(s.state, "public", f), "utf8");
    for (const w of ["close_source", "adv_source", String(src.close_source), String(src.adv_source)]) assert.ok(!txt.includes(w), `public/${f} does not carry ${w}`);
  }
});

// ---- C-4: the gap whitelist IS keyof GapEntryFilled | keyof GapEntryAbstained (tsc: a missing or extra key is a type error) ----
type GapKey = keyof GapEntryFilled | keyof GapEntryAbstained;
const K: Record<GapKey, true> = { symbol: true, session: true, regime: true, vwap: true, volumeBase: true, n: true, cash_cross: true, gT: true,
  exceed1: true, exceed2: true, exceed5: true, multiplierUsed: true, rebase_residuals: true, earliest_publish_utc: true, abstain: true };
test("bell_publish_whitelist_equals_collector_types", () => {
  const keys = (o: object | undefined): string[] => Object.keys(o ?? {}).sort();
  assert.deepEqual(keys(WHITELIST.gap), Object.keys(K).sort(), "gap = keyof GapEntryFilled | keyof GapEntryAbstained (digest.ts:66-97)");
  assert.deepEqual(keys(WHITELIST.residuals), [...RESIDUAL_CODES].sort(), "residuals = RESIDUAL_CODES (residuals.ts:55)");
  const SITES: Record<string, string[]> = { // keys read at their construction sites @ adc3260
    volume: ["symbol", "session", "regime", "session_date_et", "window", "adv_period", "n", "n_bars", "n_trading_days", "formula", "abstain", "vol_ratio", "multiplier_unit"], // collect.ts:224-233
    supply: ["symbol", "supply", "decimals", "multiplier", "paused", "permanent_delegate"], // collect.ts:241-242
    por: ["symbol", "kind", "method", "note", "age_sec", "statement"], // collect.ts:245-247
    wrapper: ["symbol", "contracts", "residue"], // collect.ts:250
    halt_deltas: ["symbol", "chain", "reason_family", "halt_utc_ms", "resume_utc_ms", "first_fill_after_halt_utc_ms", "last_fill_before_resume_utc_ms", "n_fills_in_window"], // collect.ts:272-273
    halt_census: ["total", "empty_resume"], window: ["from_utc_ms", "to_utc_ms"], adv_period: ["year", "month"], // collect.ts:277, :225, :304
    digest: ["schema", "gaps", "halt_census", "residuals", "volume", "supply", "por", "wrapper"], // digest.ts:103 + collect.ts:279-281
    state: ["schema", "bell_sha", "window", "residuals", "digest", "halt_deltas"], // collect.ts:303-305
    record: ["symbol", "chain", "n_fills", "sessions", "quorum_coverage", "prev_line_hash"], // collect.ts:90, :254-255
    provenance: ["bellSha", "generatedAt", "sources", "providers"], sources: ["generated_at", "cash_request_digest", "cash_cross_mismatch_days", "cash_cross_unavailable_days"], // digest.ts:108, collect.ts:294-299
    providers: ["providers", "quorum_required", "providers_distinct", "faults"], fault: ["provider", "status"], // collect.ts:300-301, quorum.ts:80
  };
  for (const [k, v] of Object.entries(SITES)) assert.deepEqual(keys(WHITELIST[k]), [...v].sort(), `WHITELIST.${k}`);
  assert.deepEqual(keys(WHITELIST), [...Object.keys(SITES), "gap", "residuals"].sort(), "no undeclared object kind");
});

// ---- C-4 coverage: REAL collect() outputs carrying every reachable shape pass the whole validation and publish ----
test("bell_publish_whitelist_covers_all_collector_gap_shapes", () => {
  const w = Date.UTC(2026, 8, 19, 13, 31, 4), ref = "2026-09-18", nowSec = Math.floor(T / 1000); // weekend session, ADV month 2026-08
  const fill = (sig: string, usdc: bigint): SymbolInput["fills"][number] => ({ signature: sig, blockTimeUtcMs: w, baseDelta: 100_000_000n, quoteDelta: -usdc * 1_000_000n });
  const aug: AdvDailyBar[] = [];
  for (let d = 1; d <= 31; d++) { const iso = `2026-08-${String(d).padStart(2, "0")}`, dow = new Date(`${iso}T12:00:00Z`).getUTCDay(); if (dow !== 0 && dow !== 6) aug.push({ dateET: iso, v: 1_000_000 }); }
  const mint = readMintToken2022({ context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } }, "TSLAx");
  const events: MultiplierEvent[] = [{ kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 1000, slot: 1, instructionIndex: 0, signature: "i" },
    { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: w / 1000 - 50_000, blockTimeSec: w / 1000 - 50_000, slot: 2, instructionIndex: 0, signature: "u" }];
  const base = { chain: "solana" as const, baseDec: 8, quoteDec: 6, fillsResidues: [], quorumCoverage: 1 };
  const symbols: SymbolInput[] = [
    { ...base, symbol: "TSLAx", fills: [fill("a", 365n)], closeRefBySession: { [ref]: 364 }, crossBySession: { [ref]: "matched" }, advDailyVolumes: aug, mint,
      porRelayed: { value: "1", updatedAtSec: nowSec - 10 }, rebase: { status: "trajectory_known", events, overwrittenPending: 0, residuals: ["authority_scan_mono_operator", "set_authority_unscanned"] } },
    { ...base, symbol: "SPYx", fills: [fill("b", 600n)], closeRefBySession: {}, advDailyVolumes: [], porRelayed: { value: "1", updatedAtSec: nowSec - 200_000 } },
    { ...base, symbol: "NVDAx", fills: [fill("c", 170n)], closeRefBySession: { [ref]: 171 }, crossBySession: { [ref]: "mismatch" }, advDailyVolumes: [] },
    { ...base, symbol: "AAPLx", fills: [fill("d", 230n)], closeRefBySession: { [ref]: 231 }, crossBySession: { [ref]: "unavailable" }, advDailyVolumes: [] },
    { ...base, symbol: "TSLAon", chain: "ethereum", baseDec: 18, fills: [], closeRefBySession: {}, advDailyVolumes: [], rebase: { status: "unverified", residue: "rebase_unverified" } }];
  const r = collect({ symbols, haltRows: rowsFromCsv(readFileSync(join(HERE, "fixtures", "halts-tsla-synth.csv"), "utf8")), window: { fromUtcMs: w - 86_400_000, toUtcMs: w + 86_400_000 },
    nowSec, staleBoundSec: 93600, generatedAt: new Date(w).toISOString(), faults: [{ provider: "helius", status: "503" }], providers: ["helius", "solana-foundation"],
    closeSource: "a-named-close-source", advSource: "a-named-adv-source", cashRequestDigest: "c".repeat(64), cashCrossMismatchDays: ["NVDA:2026-09-18"], cashCrossUnavailableDays: ["AAPL:2026-09-18"] });
  const d = r.digest as Obj, g = d.gaps as Obj[], vol = d.volume as Obj[];
  for (const [label, ok] of [["abstained gap", g.some((x) => "abstain" in x)], ["rebase_residuals", g.some((x) => "rebase_residuals" in x)], ["cash_cross", g.some((x) => "cash_cross" in x)],
    ["earliest_publish_utc", g.some((x) => "earliest_publish_utc" in x)], ["multiplierUsed", g.some((x) => "multiplierUsed" in x)], ["computed volume", vol.some((x) => "vol_ratio" in x)],
    ["abstained volume", vol.some((x) => "abstain" in x)], ["por unavailable/stale/ok", ["unavailable", "stale", "ok"].every((k) => (d.por as Obj[]).some((x) => x.kind === k))],
    ["halt_deltas", Array.isArray((r.state as Obj).halt_deltas)], ["quorum_coverage", r.timeline.some((x) => x !== null && typeof x === "object" && "quorum_coverage" in x)]] as const) assert.ok(ok, `collect() produced a ${label} (non-vacuity)`);
  const s = stage([]), run = join(s.inbox, "b1", "run0");
  mkdirSync(run, { recursive: true }); // the collect.ts:855-859 serialization (journal.json omitted: tolerated, never read)
  writeFileSync(join(run, "state.json"), JSON.stringify(r.state, null, 2));
  writeFileSync(join(run, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(join(run, "provenance.json"), JSON.stringify(r.provenance, null, 2));
  assert.equal(publish(s).status, "published", "every reachable collector shape passes C-in-1..10");
});

// ---- C-7: each bound lowered, then an input at twice the bound => refused by name (the replay path bounded too) ----
test("bell_publish_bounds_refuse_at_twice_the_bound", (t) => {
  const half = (n: number): number => Math.floor(n / 2), size = (p: string): number => statSync(p).size;
  refuses(stage([RUN_A, RUN_B]), "too_many_runs", { bounds: { MAX_RUNS: 1 } });
  refuses(stage([RUN_A]), "input_too_large", { bounds: { MAX_INPUT_FILE_BYTES: half(size(join(RUN_A, "state.json"))) } });
  const ok = stage([RUN_A]);
  publish(ok);
  const stateBytes = size(join(ok.state, "public", "state.json")), lineBytes = size(join(ok.state, "timeline.jsonl"));
  refuses(stage([RUN_A]), "public_state_too_large", { bounds: { MAX_PUBLIC_STATE_BYTES: half(stateBytes) } });
  refuses(stage([RUN_A]), "line_too_large", { bounds: { MAX_LINE_BYTES: half(lineBytes) } });
  refuses(ok, "existing_timeline_corrupt", { bounds: { MAX_LINE_BYTES: half(lineBytes) } });
  t.diagnostic(`TAILLES runMain run: state.json=${String(size(join(RUN_A, "state.json")))} provenance.json=${String(size(join(RUN_A, "provenance.json")))} timeline.jsonl=${String(size(join(RUN_A, "timeline.jsonl")))} bytes`);
  t.diagnostic(`TAILLES published (1 run): public/state.json=${String(stateBytes)} public/provenance.json=${String(size(join(ok.state, "public", "provenance.json")))} line=${String(lineBytes)} bytes`);
});
