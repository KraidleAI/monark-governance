// SENTINEL - off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// ADR-M012 item (l): the post-J0 instrument replay CLI (apps/sentinel/src/instrument-replay.ts). All offline. The live
// part is the committed capture fixtures/narabi-timeline-2026-09-19.jsonl (the real J0 anchor line and two days); the
// seed series and the gap are SYNTHETIC windows built here so that they end exactly where the real J0 opens (block
// and supply contiguous), folded into sentinel lines by the engine as the daily job writes them. The oracle is
// RECODED here (velocity, score, static miss, tracker recursion, Page CUSUM, mulberry32 permutation, tracker digest,
// document digest): no expected value is computed by the code under test. Temp files: os.tmpdir() (TEMP on F:).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, statSync, rmSync, symlinkSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { initState, step, lineHashOf, committedQ1 } from "../src/timeline.ts";
import type { TimelineLine } from "../src/timeline.ts";
import { attest } from "../src/flow.ts";
import type { WindowFacts } from "../src/flow.ts";
import { runReplayCli, pathKey, INSTRUMENT_NOTE, INSTRUMENT_LABEL } from "../src/instrument-replay.ts";
import type { InstrumentReplayDoc } from "../src/instrument-replay.ts";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";
import type { VocabRule } from "../../../scripts/grep-forbidden.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const CLI = join(HERE, "..", "src", "instrument-replay.ts");
const LIVE_TEXT = readFileSync(join(HERE, "fixtures", "narabi-timeline-2026-09-19.jsonl"), "utf8").replace(/\r\n/g, "\n");
const LIVE = LIVE_TEXT.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as TimelineLine);
const J0 = LIVE[0]!, LAST = LIVE[LIVE.length - 1]!;
const QHAT = J0.q_before; // the published q1 on the J0 line (production bytes)
const PROV = { endpoints: ["stub://a"], node_version: "test", sentinel_sha: "0".repeat(64) };
// The --out guard refuses ANY path segment named `public`: a temp root under one would turn every test red (C-G2-6).
assert.ok(!tmpdir().split(/[/\\]+/).includes("public"), `the temp root must not contain a 'public' segment (got ${tmpdir()})`);
const TMP = mkdtempSync(join(tmpdir(), "narabi-l-"));
after(() => rmSync(TMP, { recursive: true, force: true }));
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const addDays = (d: string, n: number): string => new Date(Date.parse(d + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);
const factsOfLine = (l: TimelineLine): WindowFacts => ({ day: l.day, fromBlock: l.from_block, toBlock: l.to_block, burns: BigInt(l.burns), mints: BigInt(l.mints), supplyClose: BigInt(l.supply_close), supplyOpen: BigInt(l.s_open) });

// Burns in parts per million of the closing supply: the seed (J0-8), then J0-7 .. J0-1. 2% is a stress window.
const BURN_PPM = [1000, 1500, 6000, 2000, 9000, 500, 20000, 3000];
interface Tweak { skipDay?: number; repeatDay?: number; blockGap?: number; blockOverlap?: number; supplyJump?: number; supplyDrop?: number }
/** Windows J0-8 .. J0-1 built BACKWARDS from the real J0 open, each C1-consistent; a tweak breaks one contiguity. */
function synth(t: Tweak = {}): WindowFacts[] {
  const out: WindowFacts[] = [];
  let to = J0.from_block - 1, close = BigInt(J0.s_open);
  for (let k = BURN_PPM.length - 1; k >= 0; k--) {
    const burns = (close * BigInt(BURN_PPM[k]!)) / 1_000_000n, mints = close / 1000n, open = close + burns - mints;
    const day = addDays(J0.day, k - BURN_PPM.length - (t.skipDay !== undefined && k <= t.skipDay ? 1 : 0) + (t.repeatDay !== undefined && k <= t.repeatDay ? 1 : 0));
    out.unshift({ day, fromBlock: to - 7199, toBlock: to, burns, mints, supplyClose: close, supplyOpen: open });
    to -= 7200 + (k === t.blockGap ? 1 : 0) - (k === t.blockOverlap ? 1 : 0);
    close = open + (k === t.supplyJump ? 1n : 0n) - (k === t.supplyDrop ? 1n : 0n);
  }
  return out;
}
/** Sentinel lines for `ws`, folded from GENESIS by the engine, exactly as the daily job writes them. */
function linesOf(ws: readonly WindowFacts[]): string {
  let state = initState();
  return ws.map((w) => {
    const r = attest(w);
    if (r.status === "c1_fail") throw new Error(`synthetic window ${w.day} fails C1`);
    const o = step(state, w, r, PROV);
    state = o.state;
    return JSON.stringify(o.line) + "\n";
  }).join("");
}
const seriesJson = (w: WindowFacts): string => JSON.stringify({ windows: [{ day: w.day, fromBlock: w.fromBlock, toBlock: w.toBlock, burns: String(w.burns), mints: String(w.mints), supplyClose: String(w.supplyClose), supplyOpen: String(w.supplyOpen), v_t_per_hr: null }] });

interface Tree { dir: string; series: string; gap: string; live: string; out: string }
let trees = 0;
function tree(ws: WindowFacts[] = synth(), gap: readonly WindowFacts[] = ws, liveText = LIVE_TEXT): Tree {
  const dir = join(TMP, `t${String(trees++)}`);
  mkdirSync(dir);
  const t = { dir, series: join(dir, "series.json"), gap: join(dir, "gap.jsonl"), live: join(dir, "timeline.jsonl"), out: join(dir, "instrument.json") };
  writeFileSync(t.series, seriesJson(ws[0]!));
  writeFileSync(t.gap, linesOf(gap));
  writeFileSync(t.live, liveText);
  return t;
}
const argsOf = (t: Tree, out: string | null = t.out): string[] => ["--series", t.series, "--gap", t.gap, "--timeline", t.live, "--perms", "200", ...(out === null ? [] : ["--out", out])];
const readDoc = (f: string): InstrumentReplayDoc => JSON.parse(readFileSync(f, "utf8")) as InstrumentReplayDoc;

// -- the recoded oracle --------------------------------------------------------------------------------
const B = 1 / 24, UP = Math.log(0.25 / 0.125), DOWN = Math.log(0.75 / 0.875);
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const cusumMax = (xs: readonly number[]): number => { let r = 0, m = 0; for (const x of xs) { r = Math.max(0, r + (x === 1 ? UP : DOWN)); if (r > m) m = r; } return m; };
function permP(seq: readonly number[], perms: number, seed: number): { statistic: number; exceed: number; p_value: number } {
  const statistic = cusumMax(seq), rnd = mulberry(seed), sh = [...seq];
  let exceed = 0;
  for (let k = 0; k < perms; k++) {
    for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const x = sh[i]!; sh[i] = sh[j]!; sh[j] = x; }
    if (cusumMax(sh) >= statistic) exceed++;
  }
  return { statistic, exceed, p_value: (1 + exceed) / (perms + 1) };
}
interface P { alpha: number; c: number; eps: number; t0: number; B: number }
const tDigest = (q1: number, p: P, s: readonly number[]): string => {
  const v = [p.alpha, p.c, p.eps, p.t0, p.B, q1, ...s], buf = Buffer.alloc(v.length * 8);
  v.forEach((x, i) => buf.writeDoubleBE(x === 0 ? 0 : x, i * 8));
  return sha(buf);
};
function oracle(ws: readonly WindowFacts[]) {
  const vOf = (w: WindowFacts): number | null => (w.supplyOpen > 0n ? Number((w.burns * 1_000_000_000_000n) / w.supplyOpen) / 1e12 / 24 : null);
  const calmOf = (w: WindowFacts): boolean => w.supplyOpen >= 10n ** 25n && w.burns * 100n < w.supplyOpen;
  const params: P[] = [{ alpha: 0.1, c: QHAT, eps: 0.1, t0: 0, B }, { alpha: 0.1, c: 1 / 24, eps: 0.01, t0: 0, B }];
  const tr = params.map((p) => ({ p, q: QHAT, t: 0 }));
  const scores: number[] = [], all: number[] = [], calm: number[] = [];
  let cc = 0, ca = 0;
  const rows = ws.map((w, i) => {
    const v = vOf(w), pv = i > 0 ? vOf(ws[i - 1]!) : null;
    if (v === null || pv === null) return { day: w.day, pair_status: "non_evaluable", calm_pair: false, v, s: null, E_static: null, q_c: null, q_eps: null, cusum_calm: cc, cusum_all: ca };
    const raw = Math.abs(v - pv), s = Math.min(B, raw), e = s > QHAT ? 1 : 0, cp = calmOf(ws[i - 1]!) && calmOf(w);
    for (const k of tr) { const eta = k.p.c * (k.t + 1 + k.p.t0) ** (-1 / 2 - k.p.eps); k.q = k.q - eta * (k.p.alpha - (s > k.q ? 1 : 0)); k.t++; }
    ca = Math.max(0, ca + (e === 1 ? UP : DOWN));
    if (cp) { cc = Math.max(0, cc + (e === 1 ? UP : DOWN)); calm.push(e); }
    scores.push(s); all.push(e);
    return { day: w.day, pair_status: raw > B ? "clipped" : "evaluable", calm_pair: cp, v, s, E_static: e, q_c: tr[0]!.q, q_eps: tr[1]!.q, cusum_calm: cc, cusum_all: ca };
  });
  return { rows, scores, all, calm, params, q: tr.map((k) => k.q), vOf };
}

test("sentinel_instrument_replay_matches_fixture - seed + gap + live replayed, every statistic and p equal to the recoded oracle (ADR-M012 (l))", () => {
  const ws = synth(), t = tree(ws);
  const doc = runReplayCli(argsOf(t));
  const d = readDoc(t.out);
  assert.deepEqual(d, doc, "the file on disk is the returned document");
  const block = [...ws, ...LIVE.map(factsOfLine)], o = oracle(block);
  assert.equal(QHAT, committedQ1(), "the published q1 is the committed calibration quantile");
  for (const l of LIVE) assert.equal(o.vOf(factsOfLine(l)), l.v, `recoded velocity = the PUBLISHED v on ${l.day}`);
  assert.deepEqual(d.series, o.rows, "every per-window statistic equals the oracle");
  assert.equal(d.series.find((r) => r.day === J0.day)?.pair_status, "evaluable", "J0 is a pair in the replay (its predecessor is the gap), unlike the live line");
  assert.ok(o.all.includes(1) && o.all.includes(0) && o.calm.length > 0 && o.calm.length < o.all.length, "non-vacuous: misses, hits, calm and stress pairs");
  assert.deepEqual(d.replays.map((r) => [r.label, r.params, r.q, r.T, r.digest]), [
    ["c=q_hat", o.params[0], o.q[0], o.scores.length, tDigest(QHAT, o.params[0]!, o.scores)],
    ["eps=0.01", o.params[1], o.q[1], o.scores.length, tDigest(QHAT, o.params[1]!, o.scores)],
  ], "replays c = q-hat and eps = 0.01: params, final q, T and digest recomputed");
  for (const [k, seq, col] of [["calm", o.calm, "cusum_calm"], ["all_evaluable", o.all, "cusum_all"]] as const) {
    const got = d.permutation[k], want = permP(seq, 200, 20260917);
    assert.deepEqual([got.p0, got.p1, got.n, got.misses, got.statistic], [0.125, 0.25, seq.length, seq.filter((x) => x === 1).length, want.statistic], `${k}: CUSUM`);
    assert.deepEqual(got.permutation, { seed: 20260917, perms: 200, exceed: want.exceed, p_value: want.p_value }, `${k}: permutation p`);
    assert.equal(Math.max(...d.series.map((r) => r[col])), want.statistic, `${k}: the series running maximum is the statistic`);
  }
  assert.equal(d.state_digest, LAST.digest_T, "state_digest = the last published digest_T (the live state.json digest)");
  const { digest, generated_at, ...body } = d;
  assert.equal(digest, sha(JSON.stringify(body)), "digest = sha256 of every key but digest and generated_at");
  assert.match(generated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.notEqual(digest, d.state_digest, "the instrument digest is separate from the state digest");
  for (const r of d.replays) assert.notEqual(r.digest, d.state_digest, `replay ${r.label} digest is not the state digest`);
  assert.deepEqual(Object.keys(d), ["label", "note", "params", "series", "replays", "permutation", "timeline_sha256", "gap_sha256", "state_digest", "digest", "generated_at"], "closed key set");
  assert.deepEqual(d.params, { alpha: 0.1, B, q1: QHAT, eps_instrument: 0.01, cusum_p0: 0.125, cusum_p1: 0.25, perm_seed: 20260917, perms: 200, seed_day: ws[0]!.day, seed_series_sha256: sha(readFileSync(t.series)), j0: J0.day, last_day: LAST.day });
  assert.deepEqual([d.timeline_sha256, d.gap_sha256], [sha(readFileSync(t.live)), sha(readFileSync(t.gap))]);
  assert.equal(runReplayCli(argsOf(t)).digest, digest, "same inputs, same digest (generated_at is outside it)");
  // --seed reaches the permutation (C-G2-2): the published seed and both p equal the oracle at seed 7.
  const d7 = runReplayCli([...argsOf(t, join(t.dir, "instrument-seed7.json")), "--seed", "7"]);
  assert.equal(d7.params.perm_seed, 7, "params.perm_seed is the --seed given");
  for (const [k, seq] of [["calm", o.calm], ["all_evaluable", o.all]] as const) {
    const want = permP(seq, 200, 7);
    assert.deepEqual(d7.permutation[k].permutation, { seed: 7, perms: 200, exceed: want.exceed, p_value: want.p_value }, `${k}: permutation p at --seed 7`);
  }
  // The gap may start the day after the seed, or run past J0 with the SAME facts: the replay is unchanged.
  for (const gap of [ws.slice(1), [...ws, ...LIVE.map(factsOfLine)]]) {
    const t2 = tree(ws, gap);
    assert.deepEqual(runReplayCli(argsOf(t2)).series, d.series, `gap of ${String(gap.length)} windows: same series`);
  }
});

test("sentinel_instrument_cli_is_fail_closed - no --out, public without --publish, malformed or broken inputs: refused, nothing written", () => {
  const refuses = (args: string[], re: RegExp, out: string): void => {
    assert.throws(() => runReplayCli(args), re);
    assert.ok(!existsSync(out), `nothing written at ${out}`);
  };
  const t = tree();
  refuses(argsOf(t, null), /--out <file> is required/, t.out);
  refuses(argsOf(t).filter((x) => x !== "--timeline" && x !== t.live), /--timeline <live timeline.jsonl> is required/, t.out);
  refuses(argsOf(t).filter((x) => x !== "--gap" && x !== t.gap), /--gap <gap timeline.jsonl> is required/, t.out);
  refuses([...argsOf(t), "--dry"], /unknown argument --dry/, t.out);
  refuses([...argsOf(t), "--perms", "0"], /--perms must be a positive integer/, t.out);
  refuses([...argsOf(t), "--seed", "x"], /--seed must be an integer/, t.out);
  refuses([...argsOf(t), "--seed"], /--seed must be an integer/, t.out); // last, no value: never Number(null) = 0
  refuses([...argsOf(t), "--seed", ""], /--seed must be an integer/, t.out);
  refuses([...argsOf(t), "--perms", "1e1"], /--perms must be a positive integer/, t.out);
  for (const pub of [join(t.dir, "public", "instrument.json"), join(t.dir, "apps", "site", "public", "narabi", "instrument.json")]) {
    refuses(argsOf(t, pub), /under a directory named 'public' without --publish/, pub);
  }
  const pub = join(t.dir, "public", "instrument.json");
  mkdirSync(join(t.dir, "public"));
  runReplayCli([...argsOf(t, pub), "--publish"]);
  assert.ok(existsSync(pub), "--publish is the explicit, only lift of the public guard");
  // Malformed or broken inputs, each on a fresh tree. `edit` rewrites one line of a file (the last by default).
  const edit = (file: string, f: (l: TimelineLine) => void, rehash: boolean, at = -1): void => {
    const ls = readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as TimelineLine);
    const l = ls[at < 0 ? ls.length + at : at]!;
    f(l);
    if (rehash) l.line_hash = lineHashOf(l);
    writeFileSync(file, ls.map((x) => JSON.stringify(x)).join("\n") + "\n");
  };
  const ws = synth(), badSeed = { ...ws[0]!, burns: ws[0]!.burns + 1n, supplyOpen: ws[0]!.supplyOpen + 1n };
  const j0Twin = { ...factsOfLine(J0), burns: BigInt(J0.burns) + 1n, supplyOpen: BigInt(J0.s_open) + 1n };
  const cases: Array<[string, () => Tree, RegExp]> = [
    ["torn live line", () => { const x = tree(); writeFileSync(x.live, LIVE_TEXT + "{\"day\":\"2026-09-2"); return x; }, /--timeline line 4 is not JSON/],
    ["empty gap", () => { const x = tree(); writeFileSync(x.gap, "\n"); return x; }, /--gap is empty/],
    ["field edited, hash kept", () => { const x = tree(); edit(x.gap, (l) => { l.s = 0.5; }, false); return x; }, /--gap line 8: its line_hash does not recompute/],
    ["field edited, hash recomputed", () => { const x = tree(); edit(x.gap, (l) => { l.s = 0.5; }, true); return x; }, /--gap line 8: the engine does not reproduce it/],
    ["C1 broken in a line", () => { const x = tree(); edit(x.live, (l) => { l.burns = String(BigInt(l.burns) + 1n); }, true); return x; }, /--timeline line 3: C1 fails/],
    ["live not on the J0 anchor", () => { const x = tree(); writeFileSync(x.live, readFileSync(x.gap)); return x; }, /does not open on the pre-registered J0 anchor/],
    ["missing day", () => tree(synth({ skipDay: 3 })), /day 2026-09-13 does not follow 2026-09-11/],
    ["block gap", () => tree(synth({ blockGap: 4 })), /block gap before 2026-09-13/],
    ["supply break", () => tree(synth({ supplyJump: 4 })), /supply break before 2026-09-13/],
    ["seed re-read differs", () => tree(ws, [badSeed, ...ws.slice(1)]), /the gap and the seed disagree on 2026-09-09/],
    ["overlap differs from live", () => tree(ws, [...ws, j0Twin]), /the gap and the live timeline disagree on 2026-09-17/],
    ["seed fails C1", () => { const x = tree(ws, ws.slice(1)); writeFileSync(x.series, seriesJson({ ...ws[0]!, supplyOpen: ws[0]!.supplyOpen + 1n })); return x; }, /window 2026-09-09 fails C1/],
    ["J0 line edited, C1 kept, rehashed", () => { const x = tree(); edit(x.live, (l) => { l.burns = String(BigInt(l.burns) + 1n); l.s_open = String(BigInt(l.s_open) + 1n); }, true, 0); return x; }, /does not open on the pre-registered J0 anchor/],
    ["gap head not on GENESIS, rehashed", () => { const x = tree(); edit(x.gap, (l) => { l.prev_line_hash = "0".repeat(64); }, true, 0); return x; }, /--gap line 1: the engine does not reproduce it/],
    ["block overlap", () => tree(synth({ blockOverlap: 4 })), /block gap before 2026-09-13/],
    ["supply open above the previous close", () => tree(synth({ supplyDrop: 4 })), /supply break before 2026-09-13/],
    ["repeated day", () => tree(synth({ repeatDay: 4 })), /day 2026-09-14 does not follow 2026-09-14/],
    ["seed window in error", () => { const x = tree(); writeFileSync(x.series, seriesJson(ws[0]!).replace('"v_t_per_hr":null', '"v_t_per_hr":null,"error":"rpc timeout"')); return x; }, /the series has no usable last window/],
  ];
  for (const [name, make, re] of cases) {
    const x = make();
    assert.throws(() => runReplayCli(argsOf(x)), re, name);
    assert.ok(!existsSync(x.out), `${name}: nothing written`);
  }
  // --out = the --timeline input under another name than timeline.jsonl: refused, the input untouched.
  const lv = tree(), liveCopy = join(lv.dir, "live.jsonl");
  writeFileSync(liveCopy, LIVE_TEXT);
  assert.throws(() => runReplayCli(argsOf({ ...lv, live: liveCopy }, liveCopy)), /--out must not be an input file/, "--out = the --timeline input");
  assert.equal(readFileSync(liveCopy, "utf8"), LIVE_TEXT, "the --timeline input is untouched");
  // The real CLI WITH --out on a broken gap: exit code 1, FATAL on stderr, and nothing written at --out.
  const y = tree();
  writeFileSync(y.gap, "{\"day\":");
  const ry = spawnSync(process.execPath, [CLI, ...argsOf(y)], { encoding: "utf8" });
  assert.equal(ry.status, 1, "the CLI exits 1 on a broken input");
  assert.match(ry.stderr, /instrument-replay FATAL[\s\S]*--gap line 1 is not JSON/);
  assert.ok(!existsSync(y.out), "the CLI wrote nothing at --out");
  // The real CLI: exit code 1, FATAL on stderr, nothing written (no --out).
  const r = spawnSync(process.execPath, [CLI, ...argsOf(t, null)], { encoding: "utf8" });
  assert.equal(r.status, 1, "the CLI exits 1 on a refusal");
  assert.match(r.stderr, /instrument-replay FATAL[\s\S]*--out <file> is required/);
});

test("sentinel_instrument_never_touches_state_json - state.json and the inputs stay byte- and mtime-identical; the live files are never an output", () => {
  const t = tree(), state = join(t.dir, "state.json");
  writeFileSync(state, JSON.stringify({ digest: LAST.digest_T }) + "\n");
  const snap = (): Array<[string, number]> => [state, t.live, t.gap, t.series].map((f) => [sha(readFileSync(f)), statSync(f).mtimeMs]);
  const before = snap();
  const doc = runReplayCli(argsOf(t));
  assert.ok(existsSync(t.out), "instrument.json is written next to state.json");
  assert.deepEqual(snap(), before, "state.json and every input are unchanged by a successful run");
  assert.notEqual(doc.digest, doc.state_digest, "the instrument never re-issues the state digest as its own");
  for (const out of [state, join(t.dir, "public", "state.json"), join(t.dir, "public", "timeline.jsonl")]) {
    assert.throws(() => runReplayCli([...argsOf(t, out), "--publish"]), /--out is never (state\.json|timeline\.jsonl)/, out);
  }
  for (const out of [t.gap, t.series]) assert.throws(() => runReplayCli(argsOf(t, out)), /--out must not be an input file/, out);
  // NTFS is case-insensitive (C-G2-7): on win32, STATE.JSON is state.json and an input in upper case is that input.
  if (process.platform === "win32") {
    assert.throws(() => runReplayCli(argsOf(t, join(t.dir, "STATE.JSON"))), /--out is never state\.json/, "STATE.JSON");
    assert.throws(() => runReplayCli(argsOf(t, t.gap.toUpperCase())), /--out must not be an input file/, "an input in upper case");
  }
  assert.equal(pathKey(join("A", "State.JSON"), "win32"), resolve("A", "State.JSON").toLowerCase(), "win32 keys are case-folded");
  assert.equal(pathKey(join("A", "State.JSON"), "linux"), resolve("A", "State.JSON"), "elsewhere the case is kept");
  assert.deepEqual(snap(), before, "unchanged after the refusals");
  // Nor READ (C-G2-3): with state.json a DIRECTORY, any read of it throws EISDIR, and the run still succeeds.
  const u = tree();
  mkdirSync(join(u.dir, "state.json"));
  runReplayCli(argsOf(u));
  assert.ok(existsSync(u.out), "a run beside an unreadable state.json succeeds: the replay never reads it");
  const src = readFileSync(CLI, "utf8");
  assert.deepEqual(src.match(/writeFileSync\(/g), ["writeFileSync("], "the replay module has ONE write, --out");
  assert.ok(src.includes("writeFileSync(a.out, "), "and it writes --out only");
  const runSrc = readFileSync(join(HERE, "..", "src", "run.ts"), "utf8");
  assert.ok(!runSrc.split("\n").some((ln) => /^\s*(import|export)\b/.test(ln) && /instrument/i.test(ln)), "run.ts never imports the instrument");
});

test("sentinel_instrument_note_has_no_guarantee_words - closed list (ARL, guarantee, optimal, detection delay, proven), <= 60 words, every vocab scope clean", () => {
  const CLOSED = [/\bARL\b/i, /guarantee/i, /optimal/i, /detection\s+delay/i, /proven/i];
  for (const text of [INSTRUMENT_NOTE, INSTRUMENT_LABEL]) {
    for (const re of CLOSED) assert.ok(!re.test(text), `${String(re)} must not match: ${text}`);
  }
  for (const w of ["ARL", "guarantees", "optimality", "detection delay", "proven"]) assert.ok(CLOSED.some((re) => re.test(`${INSTRUMENT_NOTE} ${w}`)), `the list catches ${w}`);
  assert.ok(!CLOSED.some((re) => re.test("early warning, charles")), "ARL is a word, never the inside of 'early'");
  assert.ok(INSTRUMENT_NOTE.split(/\s+/).filter(Boolean).length <= 60, "the note is 60 words or fewer");
  for (const must of ["not the official tracker", "Lorden (1971)", "Vovk (2012)", "permutation", "exchangeability", "third way"]) {
    assert.ok(INSTRUMENT_NOTE.includes(must), `the note says: ${must}`);
  }
  assert.equal(INSTRUMENT_LABEL, "instrument, not the official tracker", "the D6 label");
  const t = tree();
  runReplayCli(argsOf(t));
  const d = readDoc(t.out);
  assert.deepEqual([d.note, d.label], [INSTRUMENT_NOTE, INSTRUMENT_LABEL], "the WRITTEN note and label are the source constants (A-10)");
  // A-9: every string the file actually serves (note, label, section labels, days, hashes) is checked, not the note alone.
  const strings = (x: unknown): string[] => (typeof x === "string" ? [x] : Array.isArray(x) ? x.flatMap(strings) : x !== null && typeof x === "object" ? Object.values(x).flatMap(strings) : []);
  const served = strings(d);
  assert.ok(served.includes(d.permutation.calm.label) && served.includes(d.replays[0]!.label), "the section labels are among the scanned strings");
  for (const text of served) for (const re of CLOSED) assert.ok(!re.test(text), `${String(re)} must not match the served text: ${text}`);
  const cfg = JSON.parse(readFileSync(join(HERE, "..", "..", "..", "vocab-banned.json"), "utf8")) as { banned: VocabRule[]; scan: Record<string, { banned?: VocabRule[]; exemptPhrases?: string[] }> };
  for (const [scope, s] of [["global", {}], ...Object.entries(cfg.scan)] as Array<[string, { banned?: VocabRule[]; exemptPhrases?: string[] }]>) {
    const patterns = compilePatterns([...cfg.banned, ...(s.banned ?? [])]);
    assert.deepEqual(scanText(served.join("\n"), patterns, s.exemptPhrases ?? []), [], `vocab scope ${scope}`);
  }
});

// Q-C-3: a symlink is followed (real path): an --out link to state.json is state.json (writeFileSync would follow it).
// Creating a link needs a right on Windows (developer mode or administrator): EPERM => a DECLARED skip, never silent;
// any other error fails the test.
test("sentinel_instrument_out_symlink_is_state_json - an --out link to state.json is refused (skip declared on EPERM only)", (c) => {
  const t = tree(), state = join(t.dir, "state.json"), link = join(t.dir, "link.json");
  writeFileSync(state, "{}\n");
  try { symlinkSync(state, link); } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EPERM") throw e;
    c.skip("symlink right absent (EPERM): the link case did not run on this host");
    return;
  }
  assert.throws(() => runReplayCli(argsOf(t, link)), /--out is never state\.json/, "--out = a symlink to state.json");
  assert.equal(readFileSync(state, "utf8"), "{}\n", "state.json untouched");
});

// Q-C-2, win32 only. Under Node a trailing dot or space is NOT an alias (paths are opened in the \?\ namespace):
// "state.json." is a distinct file, written beside an untouched state.json (measured 2026-09-27; a Node that aliased
// it would turn this red). An 8.3 short name IS an alias: realpathSync.native resolves it to the long name.
const WIN_ONLY = process.platform === "win32" ? false : "win32 only (NTFS name aliases)";
test("sentinel_instrument_out_win32_trailing_dot - state.json. is a distinct file under Node, state.json stays untouched", { skip: WIN_ONLY }, () => {
  const t = tree(), state = join(t.dir, "state.json"), dotted = join(t.dir, "state.json.");
  writeFileSync(state, "{}\n");
  runReplayCli(argsOf(t, dotted));
  assert.equal(readFileSync(state, "utf8"), "{}\n", "state.json untouched");
  assert.ok(readdirSync(t.dir).includes("state.json."), "the output is its own file, named state.json.");
});
test("sentinel_instrument_out_win32_short_name - the 8.3 name of state.json is state.json (skip declared without 8.3 names)", { skip: WIN_ONLY }, (c) => {
  const t = tree(), state = join(t.dir, "state.json"), short = join(t.dir, "STATE~1.JSO");
  writeFileSync(state, "{}\n");
  if (!existsSync(short)) { c.skip("no 8.3 short name on this volume (8dot3name creation off): the case did not run"); return; }
  assert.throws(() => runReplayCli(argsOf(t, short)), /--out is never state\.json/, "STATE~1.JSO");
  assert.equal(readFileSync(state, "utf8"), "{}\n", "state.json untouched");
});
