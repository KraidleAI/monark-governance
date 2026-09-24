// MONARK Bell -- T-1b PR-2 test helper (S-4..S-6; ADR-T1b-backend v2 Tuyaux T-a..T-g; checkpoint-1 C-3). ONE real runMain run,
// offline (stubbed JSON-RPC + cash readers, precedent collect.test.ts:680-744 and :775-817), written by runMain itself into a
// --out OUTSIDE the repo (assertOutsideRepo runs inside runMain) that IS the run directory of the bundle; then the real
// publisher; then a loopback server applying the headers READ from deploy/Caddyfile.monark-bell. No network beyond
// 127.0.0.1; synthetic literals only (the close of record is never a real one); keys are generated in memory, never committed.
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { collect, runMain } from "../../src/collect.ts";
import { POOLS } from "../../src/pools.ts";
import { f64BitsHexLE } from "../../src/rebase-trajectory.ts";
import type { DatabentoGet, PolygonGet } from "../../src/close.ts";
import type { JsonRpcCall } from "../../src/quorum.ts";
import { canonical, keyringOf, sha256Hex, signLine, type Keyring } from "../../scripts/bell-chain.mjs";
import { publishToDir } from "../../scripts/bell-publish.mjs";

export type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO = join(HERE, "..", "..", "..", "..");
export const T_PUBLISH = 1_800_000_000_000; // 2027-01-15T08:00Z: past every earliest_publish_utc of the fixture
export const tmp = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));
export const readJson = (p: string): Obj => JSON.parse(readFileSync(p, "utf8")) as Obj;

/** Two TSLAx fills: Sat 2026-08-15 (reference close 08-14 absent => ABSTAINED gap no_close_ref; ADV month July unserved =>
 *  ABSTAINED volume no_adv) and Sat 2026-09-19 (close 09-18 => g_t; the multiplier update effective 2026-09-01 makes the
 *  anchored trajectory `trajectory_known` => rebase_residuals; the cross => cash_cross; ADV month August complete => COMPUTED volume). */
const F1 = Date.UTC(2026, 7, 15, 13, 31, 4), F2 = Date.UTC(2026, 8, 19, 13, 31, 4), EFF = Math.floor(Date.UTC(2026, 8, 1) / 1000);
const stateConfigB64 = (mult: number, effTs: number, newMult: number): string => { // collect.test.ts:73 layout (56 bytes)
  const b = new Uint8Array(56), v = new DataView(b.buffer);
  v.setFloat64(32, mult, true); v.setBigInt64(40, BigInt(effTs), true); v.setFloat64(48, newMult, true);
  return Buffer.from(b).toString("base64");
};
/** runMain, offline, writes its four files into `out` (which must lie outside the repo); `work` holds the trajectory input.
 *  `databentoGet` overrides the cash-close seam (C-2 of ADR-BELL-CASH-LEG-1: a rejecting reader); the synthetic keys are SET,
 *  since an empty key emits no cash request at all (C-4). */
export async function runMainInto(out: string, work: string, over: { databentoGet?: DatabentoGet } = {}): Promise<void> {
  const pool = POOLS.find((p) => p.baseSymbol === "TSLAx" && p.chain === "solana")!;
  const bal = (base: string, quote: string): Obj[] => [{ accountIndex: 0, uiTokenAmount: { amount: base } }, { accountIndex: 1, uiTokenAmount: { amount: quote } }];
  const swap = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: pool.vaultBase }, { pubkey: pool.vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", "4635000000") } };
  const call: JsonRpcCall = (_url, method, params) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([F1, F2].map((ms, i) => ({ signature: `sig${String(i)}`, slot: i + 1, blockTime: ms / 1000, err: null })));
    if (method === "getTransaction") return Promise.resolve(swap);
    if (method === "getAccountInfo") return Promise.resolve((params[1] as { encoding?: string } | undefined)?.encoding === "base64"
      ? { context: { slot: 9 }, value: { data: [stateConfigB64(1, EFF, 1.0039), "base64"] } }
      : { context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } });
    throw new Error("unexpected " + method);
  };
  const databentoGet: DatabentoGet = () => Promise.resolve([{ hd: { ts_event: String(BigInt(Date.UTC(2026, 8, 18)) * 1_000_000n) }, close: "364000000000" }]);
  const aug: Array<{ t: number; v: number }> = [];
  for (let d = 1; d <= 31; d++) { const t = Date.UTC(2026, 7, d, 16), w = new Date(t).getUTCDay(); if (w !== 0 && w !== 6) aug.push({ t, v: 1_000_000 }); }
  const polygonGet: PolygonGet = (path) => Promise.resolve(/\/range\/1\/day\/(\d{4}-\d{2}-\d{2})\/\1\?/.test(path) ? { results: [{ c: 364 }] }
    : path.includes("/2026-08-01/2026-08-31?") ? { results: aug } : { results: [] });
  const traj = join(work, "traj.json"); // outside the bundle (a bundle holds runMain's run directories only)
  writeFileSync(traj, JSON.stringify({ TSLAx: { scanComplete: true, scanMethod: "authority", events: [
    { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "i" },
    { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: EFF, blockTimeSec: EFF - 1000, slot: 2, instructionIndex: 0, signature: "u" }] } }));
  await runMain(["--pools", "TSLAx", "--max-calls", "100000", "--body-sample", "0", "--min-interval", "0", "--from-utc", String(F1 - 86_400_000),
    "--to-utc", String(F2 + 86_400_000), "--rebase-trajectory", traj, "--out", out],
  { call, databentoGet: over.databentoGet ?? databentoGet, polygonGet, env: { POLYGON_API_KEY: "p", DATABENTO_API_KEY: "k",
    BELL_HALTS_CSV: join(HERE, "..", "fixtures", "halts-tsla-synth.csv") }, nowMs: F2 + 86_400_000 });
}

/** One bundle `name` of `runs` runs into <state>/inbox: REAL collect() outputs serialized as runMain writes them (collect.ts:855-859,
 *  precedent bell-publish-durable.test.ts drop()); run i gets the quote leg `usdc + i` (a distinct vwap, hence bell_sha). */
export function dropRun(state: string, name: string, usdc: bigint, runs = 1): void {
  const w = Date.UTC(2026, 8, 19, 13, 31, 4);
  for (let i = 0; i < runs; i++) {
    const dir = join(state, "inbox", name, `r${String(i)}`), q = usdc + BigInt(i);
    const r = collect({ symbols: [{ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fillsResidues: [], quorumCoverage: 1, advDailyVolumes: [],
      fills: [{ signature: "a", blockTimeUtcMs: w, baseDelta: 100_000_000n, quoteDelta: -q * 1_000_000n }], closeRefBySession: { "2026-09-18": 364 } }],
    haltRows: [], window: { fromUtcMs: w - 86_400_000, toUtcMs: w }, nowSec: T_PUBLISH / 1000, staleBoundSec: 93600, generatedAt: new Date(w).toISOString(), providers: ["helius"] });
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "state.json"), JSON.stringify(r.state, null, 2));
    writeFileSync(join(dir, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
    writeFileSync(join(dir, "provenance.json"), JSON.stringify(r.provenance, null, 2));
  }
}
/** A state directory with `n` publications by `key` (bundle i = one run, `runs` runs in the last), clock T_PUBLISH + i. */
export function servedState(key: KeyObject, n: number, runs = 1): { state: string; pub: string } {
  const state = tmp("t1b-pub-");
  for (let i = 0; i < n; i++) {
    dropRun(state, `b${String(i)}`, 365n + 10n * BigInt(i), i === n - 1 ? runs : 1);
    publishToDir({ inboxDir: join(state, "inbox"), stateDir: state, privateKey: key, clock: () => T_PUBLISH + i });
  }
  return { state, pub: join(state, "public") };
}

export interface Published { base: string; state: string; pub: string; key: KeyObject; keyring: Keyring; d9: Obj; d9Prov: Obj }
/** The composition T-a -> T-b: runMain --out <base>/inbox/b1/run0 (the bundle IS that directory as written), then publishToDir. */
export async function publishedRun(over: { databentoGet?: DatabentoGet } = {}): Promise<Published> {
  const base = tmp("t1b-e2e-"), run = join(base, "inbox", "b1", "run0"), state = join(base, "state");
  await runMainInto(run, base, over);
  const d9 = readJson(join(run, "state.json")), d9Prov = readJson(join(run, "provenance.json")); // the D9, parsed before the archive move
  const key = generateKeyPairSync("ed25519").privateKey;
  mkdirSync(state);
  publishToDir({ inboxDir: join(base, "inbox"), stateDir: state, privateKey: key, clock: () => T_PUBLISH });
  return { base, state, pub: join(state, "public"), key, keyring: keyringOf(key, 1), d9, d9Prov };
}

/** Re-seal the CURRENT state after `mutate` as a key holder would (new bytes, new immutable, head line re-signed). */
export function resealHead(pub: string, key: KeyObject, mutate: (state: Obj) => void): void {
  const tl = readFileSync(join(pub, "timeline.jsonl"), "utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as Obj);
  const state = readJson(join(pub, "state.json"));
  mutate(state);
  const text = canonical(state) + "\n", sha = sha256Hex(text);
  writeFileSync(join(pub, "state.json"), text);
  writeFileSync(join(pub, "states", `${sha}.json`), text);
  const line: Obj = { ...tl[tl.length - 1], state_sha256: sha };
  delete line.sig;
  line.sig = signLine(line, key);
  tl[tl.length - 1] = line;
  writeFileSync(join(pub, "timeline.jsonl"), tl.map((l) => canonical(l) + "\n").join(""));
}

// ---- the headers of deploy/Caddyfile.monark-bell (S-8, PR-3), READ from the file: a subset parser, fail-closed ----
export const CADDYFILE = join(REPO, "deploy", "Caddyfile.monark-bell");
export interface HeaderRule { match: (path: string) => boolean; name: string; value: string }
/** `header [<@named|/path>] <Name> <value>` and `header [...] { <Name> <value> ... }` at site level; named matchers
 *  `@n [not] path <glob>...` (inline or `@n { ... }`). Any other header form (+/-/>/? prefixes, a header nested in another
 *  block) THROWS: an unread header is never a silent green. Rules apply in file order (a later match overrides). */
export function caddyHeaderRules(text: string): HeaderRule[] {
  const toks = (l: string): string[] => [...l.matchAll(/"((?:[^"\\]|\\.)*)"|(\S+)/g)].map((m) => m[1] ?? m[2] ?? "");
  const lines = text.split(/\r?\n/).map((l) => l.replace(/(^|\s)#.*$/, "").trim()).filter((l) => l !== "");
  const glob = (g: string): ((p: string) => boolean) => { const re = new RegExp("^" + g.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"); return (p) => re.test(p); };
  const pathMatcher = (a: string[]): ((p: string) => boolean) => {
    const neg = a[0] === "not", b = neg ? a.slice(1) : a;
    if (b[0] !== "path" || b.length < 2) throw new Error(`caddyfile: unsupported matcher: ${a.join(" ")}`);
    const gs = b.slice(1).map(glob);
    return (p) => neg !== gs.some((g) => g(p));
  };
  const matchers = new Map<string, (p: string) => boolean>(), heads: Array<[number, string[], number]> = [];
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = toks(lines[i]!);
    if (t[0]?.startsWith("@") && depth === 1) {
      if (t[1] === "{") { const inner = toks(lines[++i]!); if (lines[++i] !== "}") throw new Error("caddyfile: one path line per matcher block"); matchers.set(t[0], pathMatcher(inner)); }
      else matchers.set(t[0], pathMatcher(t.slice(1)));
      continue;
    }
    if (t[0] === "header") heads.push([i, t.slice(1), depth]);
    depth += t.filter((x) => x === "{").length - t.filter((x) => x === "}").length;
  }
  const rules: HeaderRule[] = [];
  for (const [i, t0, d] of heads) {
    if (d !== 1) throw new Error(`caddyfile: header nested in a block (line ${String(i + 1)})`);
    let t = t0, match: (p: string) => boolean = () => true;
    if (t[0]?.startsWith("@")) { const m = matchers.get(t[0]); if (m === undefined) throw new Error(`caddyfile: unknown matcher ${t[0]}`); match = m; t = t.slice(1); }
    else if (t[0]?.startsWith("/")) { match = glob(t[0]); t = t.slice(1); }
    const pairs: string[][] = [];
    if (t[0] === "{") { for (let j = i + 1; lines[j] !== "}"; j++) pairs.push(toks(lines[j]!)); } else pairs.push(t);
    for (const [name, value, ...more] of pairs) {
      if (name === undefined || value === undefined || more.length > 0 || /^[+\->?]/.test(name)) throw new Error(`caddyfile: unsupported header form: ${pairs.flat().join(" ")}`);
      rules.push({ match, name, value });
    }
  }
  return rules;
}
/** The rules of the committed Caddyfile, or null when the file is absent from this tree (the PR-3 file: a NAMED skip then). */
export const committedCaddyRules = (): HeaderRule[] | null => (existsSync(CADDYFILE) ? caddyHeaderRules(readFileSync(CADDYFILE, "utf8")) : null);

export interface Server { url: string; seen: string[]; close: () => Promise<void> }
/** A loopback static server over `root` (Caddy's `file_server` stand-in): 200 + file bytes, else 404, never a listing; the
 *  headers of `rules` whose matcher matches the request path. */
export function serveDir(root: string, rules: readonly HeaderRule[] | null): Promise<Server> {
  const seen: string[] = [];
  const server = createServer((req, res) => {
    const p = (req.url ?? "/").split("?")[0] ?? "/", f = join(root, ...p.split("/").filter((s) => s !== ""));
    seen.push(p);
    const h: Record<string, string> = {};
    for (const r of rules ?? []) if (r.match(p)) h[r.name] = r.value;
    const ok = !p.includes("..") && existsSync(f) && statSync(f).isFile();
    res.writeHead(ok ? 200 : 404, h);
    res.end(ok ? readFileSync(f) : undefined);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address(), port = a !== null && typeof a === "object" ? a.port : 0;
      resolve({ url: `http://127.0.0.1:${String(port)}`, seen, close: () => new Promise<void>((c) => { server.closeAllConnections(); server.close(() => { c(); }); }) });
    });
  });
}
