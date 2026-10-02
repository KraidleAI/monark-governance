// MONARK Dojo -- PR-2-2: the daily collector (ADR-DOJO-PR-2 D-1 l.110-117, D-2, D-5, D-6, D-7). Exactly one mode: --tick (the
// dispatcher of the 5-minute idempotent step: closes, then the plan of the day, then each due reading), --plan (the beacon beta on two
// relays of distinct operators, all the day or nothing, then the K instants), --reading <i> (one guarded course of two operators
// inside [t_i, t_i + read_tolerance_s]) and --close-day <AAAA-MM-JJ> (after the end of the reading day: missed readings, the day
// bundle of PR-2-1, the layout, the next Eve). Every call goes through openGuardedClient (write-ahead ledger, locks, caps); no URL,
// no key and no fetch live here. The clock is injected (RunDeps.nowMs, a function: read_at is taken after the last call); argv is
// CLOSED (DOJO-TICK-ARGV-1: an unknown, repeated or missing flag is refused as usage before any lock and any call).
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BudgetExceededError, HELIUS_CYCLE_CAP_CREDITS, TransportError, assertMethodCapsCover, openGuardedClient, runCli, type BudgetedClient,
  type OperatorLabel } from "@monark/rpc-guard";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { beaconRound, daySeed, readInstants, seedAnchor } from "../scripts/dojo-core.mjs";
import { DojoBundleError, readingRecord, readRecord, recordBytes, writeDayBundle, type Beacon, type ReadingAnchor, type ReadingRecord } from "./bundle.ts";
import type { Pair } from "./reading.ts";
import { BACKOFF_MS, CHAIN_OPERATORS, DECIMALS, DOJO_METHOD_CAPS, DOJO_SOLANA_METHODS, ENV_CYCLE_FLOOR, ENV_CYCLE_ID, PUBLIC_HOST_GAP_MS,
  READ_RULE, TOKEN_2022, TRIES } from "./dojo-methods.ts";
import { closeLayout, ensureDir, nextEve, readDayLayout, readEve, writeAtomic } from "./layout.ts";

/** Refusals of the collector (outside the verifier's 45 codes; day_not_ended is the bundle's, ADR D-1 l.114). */
export const DOJO_COLLECT_REFUSALS = Object.freeze(["usage", "outside_repo", "credentials_path", "anchor_malformed", "mint_mismatch", "seed_mismatch",
  "cycle_missing", "budget_guard", "state_missing", "anchor_day_not_read", "outside_window", "eve_missing", "lock_held", "relay_missing"] as const);
type Code = (typeof DOJO_COLLECT_REFUSALS)[number];
export class DojoCollectError extends Error {
  readonly code: Code;
  readonly detail: string;
  constructor(code: Code, detail: string) { super(`dojo/collect: ${code}: ${detail}`); this.code = code; this.detail = detail; }
}
const refuse = (code: Code, detail: string): never => { throw new DojoCollectError(code, detail); };

/** A GET of one beacon relay (path /<chain hash>/public/<round>, D-5 dated line C-V-3), two relays of distinct operators, injected until
 *  the guard carries their labels (item DRAND-RELAY-GET-1); absent, --plan is refused (relay_missing) before any call. */
export type RelayGet = (path: string) => Promise<unknown>;
export interface RunDeps { readonly env: Readonly<Record<string, string | undefined>>; readonly nowMs: () => number; readonly sleep?: (ms: number) => Promise<void>;
  readonly relays?: readonly RelayGet[] }
type Mode = { mode: "tick" | "plan" } | { mode: "reading"; i: number } | { mode: "close"; day: number };
export type Args = Mode & { state: string; mintFile: string; maxCalls: number; maxCredits: number; seedFile: string; anchorFile: string };

const DAY = 86_400, O = READ_RULE.read_offset_s, TOL = READ_RULE.read_tolerance_s;
const FLAGS = ["--state", "--mint-file", "--max-calls", "--max-credits", "--seed-file", "--anchor-file"];
const dayStart = (s: string): number | null => { const t = Date.parse(`${s}T00:00:00.000Z`); return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(t) && new Date(t).toISOString().startsWith(s) ? t / 1000 : null; };
const dayName = (T: number): string => new Date(T * 1000).toISOString().slice(0, 10);

/** The closed argv (ADR D-1 dated line C-V-2): exactly one mode, the six required flags, each once, each with a well-formed value. */
export function parseArgv(argv: readonly string[]): Args {
  const got = new Map<string, string | true>();
  for (let j = 0; j < argv.length; j++) {
    const a = argv[j] as string, valued = a === "--reading" || a === "--close-day" || FLAGS.includes(a);
    if (got.has(a) || (!valued && a !== "--tick" && a !== "--plan")) refuse("usage", got.has(a) ? `repeated ${a}` : "unknown argument");
    const v = valued ? argv[++j] : true;
    if (v === undefined || (typeof v === "string" && v.startsWith("--"))) refuse("usage", `value of ${a}`);
    got.set(a, v as string | true);
  }
  const modes = ["--tick", "--plan", "--reading", "--close-day"].filter((m) => got.has(m));
  if (modes.length !== 1) refuse("usage", "exactly one mode");
  for (const f of FLAGS) if (!got.has(f)) refuse("usage", `missing ${f}`);
  const s = (f: string): string => got.get(f) as string;
  const n = (f: string, max: number): number => (/^[1-9][0-9]{0,8}$/.test(s(f)) && Number(s(f)) <= max ? Number(s(f)) : refuse("usage", `value of ${f}`));
  const mode: Mode = got.has("--tick") ? { mode: "tick" } : got.has("--plan") ? { mode: "plan" } : got.has("--reading") ? { mode: "reading", i: n("--reading", 255) }
    : { mode: "close", day: dayStart(s("--close-day")) ?? refuse("usage", "value of --close-day") };
  return { ...mode, state: s("--state"), mintFile: s("--mint-file"), maxCalls: n("--max-calls", 1e9), maxCredits: n("--max-credits", 1e9), seedFile: s("--seed-file"), anchorFile: s("--anchor-file") };
}

interface Anchor extends ReadingAnchor { readonly seed_anchor: string; readonly sol_usd_source: string; readonly k_reads: number; readonly horizon: number; readonly published_at: string }
/** The anchor line (ADR D-1 dated line C-V-2), a declared calque of the checks of anchorForm (dojo-chain.mjs, module-private) that the
 *  collector relies on: program, names, K <= 255 (byte(i)), horizon, published_at, and read_rule equal to the pinned constants. */
function anchorOf(text: string): Anchor {
  let l: Record<string, unknown> | null = null;
  try { l = JSON.parse(text) as Record<string, unknown>; } catch { refuse("anchor_malformed", "json"); }
  const int = (x: unknown, max: number): boolean => Number.isSafeInteger(x) && (x as number) >= 1 && (x as number) <= max;
  const at = typeof l?.published_at === "string" ? Date.parse(l.published_at) : NaN;
  if (l === null || typeof l !== "object" || l.kind !== "anchor" || typeof l.seed_anchor !== "string" || !/^[0-9a-f]{64}$/.test(l.seed_anchor) || l.program !== TOKEN_2022
    || ![l.mint, l.pool, l.pool_quote_vault, l.sol_usd_source].every((x) => typeof x === "string" && x !== "") || !int(l.k_reads, 255) || !int(l.horizon, 1e9)
    || !Number.isFinite(at) || new Date(at).toISOString() !== l.published_at || canonical(l.read_rule) !== canonical(READ_RULE)) return refuse("anchor_malformed", "anchor");
  return l as unknown as Anchor;
}
/** A path strictly outside the repository (calque of apps/bell/src/collect.ts:535 assertOutsideRepo, lowercased win32 compare). */
const outside = (p: string, root: string): boolean => { const rel = relative(resolve(root).toLowerCase(), resolve(p).toLowerCase()); return rel !== "" && (rel.startsWith("..") || isAbsolute(rel)); };
const text = (p: string, code: Code, what: string): string => { try { return readFileSync(p, "utf8"); } catch { return refuse(code, what); } };

interface Ctx { a: Args; deps: RunDeps; anchor: Anchor; secret: string; anchorDay: number; cycle: string; floor: number; bundles: string; ledger: string;
  sleep: (ms: number) => Promise<void>; lastPublic: number }

/** Every check before any lock and any call (ADR D-1 dated line C-V-2; D-6 l.173 guard x10: floor + 10 x --max-credits <= cycle cap). */
function setup(argv: readonly string[], deps: RunDeps): Ctx {
  const a = parseArgv(argv), root = fileURLToPath(new URL("../../../", import.meta.url)), cred = deps.env.CREDENTIALS_DIRECTORY;
  if (!outside(a.state, root)) refuse("outside_repo", "--state");
  if (cred !== undefined ? resolve(a.seedFile) !== resolve(cred, "dojo-seed") : !outside(a.seedFile, root)) refuse(cred !== undefined ? "credentials_path" : "outside_repo", "--seed-file");
  const anchor = anchorOf(text(a.anchorFile, "anchor_malformed", "--anchor-file"));
  if (a.mode === "reading" && a.i > anchor.k_reads) refuse("usage", "--reading beyond k_reads of the anchor");
  if (text(a.mintFile, "mint_mismatch", "--mint-file").trim() !== anchor.mint) refuse("mint_mismatch", "--mint-file");
  const secret = text(a.seedFile, "seed_mismatch", "--seed-file").trim();
  if (!/^[0-9a-f]{64}$/.test(secret) || seedAnchor(secret, anchor.horizon) !== anchor.seed_anchor) refuse("seed_mismatch", "--seed-file");
  const cycle = deps.env[ENV_CYCLE_ID], floor = deps.env[ENV_CYCLE_FLOOR];
  if (cycle === undefined || !/^[A-Za-z0-9._-]{1,64}$/.test(cycle) || floor === undefined || !/^(0|[1-9][0-9]{0,8})$/.test(floor)) return refuse("cycle_missing", "cycle id or floor");
  if (Number(floor) + 10 * a.maxCredits > HELIUS_CYCLE_CAP_CREDITS) refuse("budget_guard", "floor + 10 x --max-credits");
  assertMethodCapsCover(DOJO_METHOD_CAPS, DOJO_SOLANA_METHODS, "dojo/collect");
  if (!existsSync(join(a.state, "ledger"))) refuse("state_missing", "ledger");
  return { a, deps, anchor, secret, anchorDay: Math.floor(Date.parse(anchor.published_at) / 1000 / DAY) * DAY, cycle, floor: Number(floor),
    bundles: join(a.state, "bundles"), ledger: join(a.state, "ledger"), sleep: deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms))), lastPublic: -Infinity };
}

interface Plan { readonly day: string; readonly beacon: Beacon | null; readonly instants: readonly number[]; readonly reason: "beacon_unavailable" | null }
const dayDir = (c: Ctx, T: number): string => join(c.bundles, dayName(T));
const planPath = (c: Ctx, T: number): string => join(dayDir(c, T), "evidence", "plan.json");
const loadPlan = (c: Ctx, T: number): Plan | null => (existsSync(planPath(c, T)) ? JSON.parse(readFileSync(planPath(c, T), "utf8")) as Plan : null);
/** End of the reading day: max_i t_i + read_tolerance_s, or T_{d+1} for a day without beacon (ADR D-1 dated line C-V-4). */
const endOf = (T: number, p: Plan | null): number => (p?.beacon ? Math.max(...p.instants) + TOL : T + DAY);
const now = (c: Ctx): number => c.deps.nowMs() / 1000;
const sha = (b: string): string => createHash("sha256").update(b).digest("hex");

type Call = (op: string, method: string, params: readonly unknown[]) => Promise<unknown>;
/** One course: the chain operators through openGuardedClient (locks released by the served unlock in finally), or the two beacon
 *  relays through the injected RunDeps.relays (item DRAND-RELAY-GET-1: no guard label yet, hence no lock and no ledger line). Each
 *  call is tried at most TRIES times on a transient fault, waiting the server's Retry-After when given (M-Q17); a fault after the
 *  tries is null, never a value; a budget stop is fatal. evidence/parsed/ keeps the parsed result of each call, not the response bytes
 *  (canonical JSON, compressed, named by its sha256; item DOJO-EVIDENCE-RAW-BYTES-1); evidence/runs.jsonl is chained (prev = sha256 of the
 *  previous line with its LF, null for the first). Locks are released before the run line is appended (a failed append leaves none). */
async function course<T>(c: Ctx, relays: boolean, dir: string, run: string, body: (call: Call) => Promise<T>): Promise<T> {
  let client: BudgetedClient | null = null;
  ensureDir(join(dir, "evidence", "parsed"), 0o700);
  try {
    if (!relays) client = openGuardedClient(c.deps.env, { maxCalls: c.a.maxCalls, runCaps: { helius: c.a.maxCredits }, methodCaps: { ...DOJO_METHOD_CAPS }, cycleFloor: { helius: c.floor } },
      c.ledger, Object.fromEntries(CHAIN_OPERATORS.map((o) => [o, c.cycle])));
  } catch (e) { if (e instanceof Error && e.constructor.name === "LockHeldError") refuse("lock_held", "operator lock"); throw e; }
  const g = client, log: unknown[] = [];
  const send: Call = (op, method, params) => (g === null ? (c.deps.relays?.[Number(op.slice(6)) - 1] as RelayGet)(String(params[0])) : g.call(op as OperatorLabel, method, params));
  const call: Call = async (op, method, params) => {
    for (let k = 1; ; k++) {
      if (op === CHAIN_OPERATORS[1]) { const wait = c.lastPublic + PUBLIC_HOST_GAP_MS - c.deps.nowMs(); if (wait > 0) await c.sleep(wait); c.lastPublic = c.deps.nowMs(); }
      try {
        const r = await send(op, method, params), body = canonical(r ?? null), h = sha(body);
        writeFileSync(join(dir, "evidence", "parsed", `${h}.json.gz`), gzipSync(body));
        log.push([op, method, h]);
        return r;
      } catch (e) {
        if (e instanceof BudgetExceededError) throw e;
        const t = e instanceof TransportError ? e : null, n = t?.name ?? "";
        log.push([op, method, null, n, t?.code ?? null]);
        if (!(n === "AbortError" || n === "TypeError" || n === "NetworkError" || (n === "HttpError" && (t?.code === 429 || (t?.code ?? 0) >= 500))) || k >= TRIES) return null;
        await c.sleep(t?.retryAfterMs ?? BACKOFF_MS);
      }
    }
  };
  try { return await body(call); } finally {
    for (const op of g?.operators() ?? []) runCli(["unlock", "--cycle", c.cycle, "--op", String(op), "--reason", "dojo/collect: course end (finally)"],
      { ledgerDir: c.ledger, floor: op === "helius" ? c.floor : 0, readSnapshot: () => { throw new Error("dojo/collect: no snapshot for unlock"); } });
    const runs = join(dir, "evidence", "runs.jsonl"), last = existsSync(runs) ? readFileSync(runs, "utf8").split("\n").at(-2) : undefined;
    appendFileSync(runs, `${canonical({ run, at: new Date(c.deps.nowMs()).toISOString(), calls: log, prev: last === undefined ? null : sha(`${last}\n`) })}\n`);
  }
}

/** A relay answer kept only when its round is r_d, its signature a compressed finite 48-byte point and its randomness SHA-256(beta). */
function betaOf(x: unknown, round: number): string | null {
  const o = x as { round?: unknown; signature?: unknown; randomness?: unknown } | null, s = o?.signature;
  if (o === null || typeof o !== "object" || o.round !== round || typeof s !== "string" || !/^[0-9a-f]{96}$/.test(s) || (parseInt(s.slice(0, 2), 16) & 0xc0) !== 0x80) return null;
  return o.randomness === createHash("sha256").update(Buffer.from(s, "hex")).digest("hex") ? s : null;
}

/** --plan (ADR D-5, dated line C-V-3): beta of r_d on BOTH relays, identical, or no plan this pass; from T_d + O without beta the day is
 *  abstained (beacon null, beacon_unavailable) with no call at all, never instants without beta (M-B3, M-B5). */
async function plan(c: Ctx, T: number): Promise<void> {
  if (T <= c.anchorDay) refuse("anchor_day_not_read", "plan");
  if (existsSync(planPath(c, T))) return;
  let beacon: Beacon | null = null;
  ensureDir(dayDir(c, T), 0o750);
  ensureDir(join(dayDir(c, T), "evidence"), 0o700);
  if (now(c) < T + O) {
    if (c.deps.relays?.length !== 2) refuse("relay_missing", "RunDeps.relays");
    const round = beaconRound(T, READ_RULE.beacon_genesis_time, READ_RULE.beacon_period), path = `/${READ_RULE.beacon_chain_hash}/public/${String(round)}`;
    const got = await course(c, true, dayDir(c, T), "plan", async (call) => [betaOf(await call("relay-1", "GET", [path]), round), betaOf(await call("relay-2", "GET", [path]), round)]);
    if (got.length !== 2 || got.some((s) => s === null || s !== got[0])) return;
    beacon = { round, signature: got[0] as string };
  }
  const instants = beacon === null ? [] : readInstants(daySeed(c.secret, c.anchor.horizon, (T - c.anchorDay) / DAY), beacon.signature, c.anchor.k_reads, T, O);
  writeAtomic(planPath(c, T), `${canonical({ day: dayName(T), beacon, instants, reason: beacon === null ? "beacon_unavailable" : null })}\n`);
}

/** --reading i: the day whose plan holds t_i with t_i <= now <= t_i + tolerance (today, or yesterday across midnight); a written reading
 *  is never read again (M-T2); no Eve at the instant => refused, the close writes it missed; read_at is taken after the last call and
 *  must still lie in the window (M-Q19). Both responses of every piece go to readingRecord (a = helius, b = solana-foundation). */
async function reading(c: Ctx, i: number, only?: number): Promise<void> {
  const t0 = now(c), today = Math.floor(t0 / DAY) * DAY;
  const hit = (only === undefined ? [today, today - DAY] : [only]).map((T) => [T, loadPlan(c, T)] as const)
    .find(([, p]) => p?.beacon && p.instants[i - 1] !== undefined && t0 >= (p.instants[i - 1] as number) && t0 <= (p.instants[i - 1] as number) + TOL);
  if (hit === undefined) return refuse("outside_window", "reading");
  const [T, p] = hit, t = (p as Plan).instants[i - 1] as number, dir = dayDir(c, T), out = join(dir, "readings", `${String(i)}.json`);
  if (T <= c.anchorDay) refuse("anchor_day_not_read", "reading");
  if (existsSync(out)) return;
  if (!existsSync(join(dir, "eve.json"))) refuse("eve_missing", "eve.json");
  const eve = readEve(readFileSync(join(dir, "eve.json"), "utf8")), A = c.anchor;
  const mintDone = Array.from({ length: A.k_reads }, (_, j) => join(dir, "readings", `${String(j + 1)}.json`)).some((f) => existsSync(f) && readRecord(readFileSync(f, "utf8")).mint !== null);
  const pieces = await course(c, false, dir, `reading ${String(i)}`, async (call) => {
    const pair = async (params: readonly unknown[], method = "getAccountInfo"): Promise<Pair> => ({ a: await call(CHAIN_OPERATORS[0], method, params), b: await call(CHAIN_OPERATORS[1], method, params) });
    const info = (addr: string, encoding: string): Promise<Pair> => pair([addr, { commitment: "finalized", encoding }]);
    return { enumeration: await pair([TOKEN_2022, { commitment: "finalized", encoding: "jsonParsed", withContext: true, filters: [{ memcmp: { offset: 0, bytes: A.mint } }] }], "getProgramAccounts"),
      mint: mintDone ? null : await info(A.mint, "jsonParsed"), pool: await info(A.pool, "base64"), wsol: await info(A.pool_quote_vault, "jsonParsed"), pyth: await info(A.sol_usd_source, "base64") };
  });
  const readAt = c.deps.nowMs();
  if (readAt > (t + TOL) * 1000) refuse("outside_window", "read_at");
  ensureDir(join(dir, "readings"), 0o700);
  writeAtomic(out, recordBytes(readingRecord({ day: dayName(T), i, instant: t, read_at: new Date(readAt).toISOString(), ...pieces, eve, anchor: A })));
}

/** --close-day d (ADR D-7 dated line C-V-1): refused before the end of the reading day (day_not_ended, M-Q21); a closed day is left as
 *  is; then missed readings, the bundle of PR-2-1, the layout in its order, and bundles/<d+1>/eve.json. */
function close(c: Ctx, T: number): void {
  if (T <= c.anchorDay) refuse("anchor_day_not_read", "close");
  const dir = dayDir(c, T), p = loadPlan(c, T), beacon = p?.beacon ?? null, k = c.anchor.k_reads, t = Math.floor(now(c));
  if (existsSync(join(dir, "publish", "SHA256SUMS"))) return;
  if (t < endOf(T, p)) throw new DojoBundleError("day_not_ended", "now");
  if (!existsSync(join(dir, "eve.json"))) refuse("eve_missing", "eve.json");
  const eve = readEve(readFileSync(join(dir, "eve.json"), "utf8")), none = { a: null, b: null }, missed: [number, string][] = [], records: ReadingRecord[] = [];
  for (let i = 1; beacon !== null && i <= k; i++) {
    const f = join(dir, "readings", `${String(i)}.json`);
    if (existsSync(f)) { records.push(readRecord(readFileSync(f, "utf8"))); continue; }
    const r = readingRecord({ day: dayName(T), i, instant: p?.instants[i - 1] as number, read_at: null, enumeration: none, mint: null, pool: none, wsol: none, pyth: none, eve, anchor: c.anchor });
    missed.push([i, recordBytes(r)]);
    records.push(r);
  }
  const { bundle, bytes } = writeDayBundle({ day: dayName(T), seed: daySeed(c.secret, c.anchor.horizon, (T - c.anchorDay) / DAY), beacon, read_rule: READ_RULE,
    k_reads: k, mint: c.anchor.mint, program: TOKEN_2022, decimals: DECIMALS, records, eve }, t);
  closeLayout(dir, missed, beacon === null ? 0 : k, bytes);
  const next = join(dayDir(c, T + DAY), "eve.json");
  ensureDir(dirname(next), 0o750);
  if (!existsSync(next)) writeAtomic(next, `${canonical(nextEve(bundle, records, eve))}\n`);
}

/** --tick (ADR D-1 dated line C-V-2): walks the days one by one from the first open day (or the day after the last closed one) to
 *  today, creating and closing (beacon_unavailable) the days it missed, the Eve carried from the day before once that day is closed
 *  (C-G2-3, Q-7); then the plan of the day if missing, then each due reading not written, one per instant, duplicates included. A day
 *  without eve.json and without a closed day before it (the first day read: act A-11) stops the walk on eve_missing: the plan and the
 *  readings still run, then the step ends on that named stop (Q-G2-5); no code of its own. */
async function tick(c: Ctx): Promise<void> {
  const t = now(c), today = Math.floor(t / DAY) * DAY;
  const days = existsSync(c.bundles) ? readdirSync(c.bundles).map(dayStart).filter((T): T is number => T !== null && T > c.anchorDay) : [];
  const closed = (T: number): boolean => existsSync(join(dayDir(c, T), "publish", "SHA256SUMS")), shut = days.filter(closed);
  let stop: DojoCollectError | null = null;
  for (let T = Math.min(...days.filter((x) => !closed(x)), ...(shut.length > 0 ? [Math.max(...shut) + DAY] : [])); T <= today; T += DAY) {
    const l = !existsSync(join(dayDir(c, T), "eve.json")) && closed(T - DAY) ? readDayLayout(dayDir(c, T - DAY)) : null;
    if (l !== null) { ensureDir(dayDir(c, T), 0o750); writeAtomic(join(dayDir(c, T), "eve.json"), `${canonical(nextEve(l.bundle, l.records, l.eve))}\n`); }
    if (!closed(T) && t >= endOf(T, loadPlan(c, T))) try { close(c, T); } catch (e) { if (!(e instanceof DojoCollectError) || e.code !== "eve_missing") throw e; stop = e; break; }
  }
  if (today > c.anchorDay && loadPlan(c, today) === null) await plan(c, today);
  for (const T of [today - DAY, today].filter((x) => x > c.anchorDay)) {
    const p = loadPlan(c, T);
    for (let i = 1; p?.beacon && i <= p.instants.length; i++) {
      const ti = p.instants[i - 1] as number;
      if (now(c) >= ti && now(c) <= ti + TOL && !existsSync(join(dayDir(c, T), "readings", `${String(i)}.json`))) await reading(c, i, T);
    }
  }
  if (stop !== null) throw stop;
}

/** The CLI body: throws a named refusal (DojoCollectError, DojoBundleError, DojoLayoutError) or a budget stop. */
export async function runCollect(argv: readonly string[], deps: RunDeps): Promise<void> {
  const c = setup(argv, deps), a = c.a, today = Math.floor(now(c) / DAY) * DAY;
  if (a.mode === "reading") await reading(c, a.i);
  else if (a.mode === "close") close(c, a.day);
  else if (a.mode === "plan") await plan(c, today);
  else await tick(c);
}

export async function main(argv: readonly string[], deps: RunDeps): Promise<number> {
  try { await runCollect(argv, deps); return 0; } catch (e) {
    const code = (e as { code?: unknown }).code;
    process.stderr.write(`dojo/collect: ${typeof code === "string" ? code : e instanceof BudgetExceededError ? "budget_stop" : "fatal"}\n`);
    return code === "usage" ? 64 : 1;
  }
}
// ENTRY-MAIN-LINK-1 (C-G2-1 of PR-1b-5b): REAL paths compared, so a launch through a directory link runs it; argv[1] absent or unreadable: an import.
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1] as string); } catch { return false; } };
if (isEntry()) process.exitCode = await main(process.argv.slice(2), { env: process.env, nowMs: () => Date.now() });
