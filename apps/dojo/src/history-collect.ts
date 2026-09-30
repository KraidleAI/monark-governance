// MONARK Dojo -- PR-2b-3 and PR-2b-4 (ADR-DOJO-PR-2B D-14, section 4): the history collector, phases A (the mint index of both operators,
// D-3 phase A, D-4) and B (bodies: getTransactionsForAddress pages at the first operator, getTransaction at the second and for the
// complements, D-3 phase B, D-9). Every call goes through openGuardedClient (write-ahead ledger, locks, caps); no URL is built and no
// fetch lives here (the secret values of the environment are only read to scan each response before it is written, C-G2-7). Closed
// argv; the guard x10 is checked before any lock (D-10); a budget, duration, cursor or check stop is fail-closed: no call after it,
// evidence/status.json `partial` with its reason, never a publish/ (D-11, D-12); the served unlock of each operator runs after every
// course, each in its own try, and the sha256 of each `unlocked` line is consigned, else the course stops unlock_unconfirmed (D-11,
// D-13 point 6, C-G2-2). Resume (D-11): every unit is keyed in the chained journal; a replay serves closed units from the verified raw
// evidence and calls only the others. Calls are serial (concurrency 1, declared at this G1; DOJO-HISTORY-THROUGHPUT-1 raises it). The
// checks (i)-transaction, (iv), (vi), (vii) are composed here before any complete bundle (DOJO-HISTORY-CHECKS-COMPOSITION-1). The
// operators are the guard's labels, in the order a, b of D-3 (never in publish/).
// PR-2b-4: phase C reads the pages of every token account of the mint seen in a body read (closed ones included) at both operators until
// the fixpoint, then D to F (history-build.ts, publish/ at status complete, D-12), in one course (act 2, D-10); its resume unit is one
// account, whose pages are read again from the first when it was not closed (D-11). Every phase pins the first day read (--first-read,
// B1R) in the first journal line with D_LAST, and --cut must be S_CUT = max E_e (DOJO-HISTORY-CUT-CHECK-1). The bounds of (vii) that
// only grow stop a course early (DOJO-HISTORY-EARLY-BOUNDS-1): per page in phase B, per admission in phase C; a 403 stops at once.
import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readdirSync, readFileSync, realpathSync, renameSync, statfsSync, writeSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { BudgetExceededError, CHAINSTACK_CYCLE_CAP_RU, HELIUS_CYCLE_CAP_CREDITS, RpcError, TransportError, assertMethodCapsCover, openGuardedClient,
  runCli, type BudgetedClient, type OperatorLabel } from "@monark/rpc-guard";
import { withRetry } from "../../bell/src/quorum.ts";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_HISTORY_CREATION as SIG0, DojoHistoryStop, FAULT, admit, checkBounds, checkCreation, checkInstructions, checkSupply, mergeIndexes, readBody,
  readIndex, type Admission, type Body, type HistoryBounds, type HistoryCounts, type NoQuorum } from "./history-read.ts";
import { DOJO_HISTORY_PARTIAL_REASONS, DojoHistoryBuildStop, buildHistory, firstRead, historyBundle, type BundleInput,
  type HistoryBundle } from "./history-build.ts";
import { readDayLayout } from "./layout.ts";
import { recordBytes } from "./bundle.ts";

/** D-3 l.231: OPS = (a, b) in this order, the guard's labels; b has no getTransactionsForAddress (tariff.ts: unknown_method). */
export const DOJO_HISTORY_OPS = ["helius", "chainstack"] as const;
/** D-2: the closed list of the history course, covered by assertMethodCapsCover before openGuardedClient (E-6). */
export const DOJO_HISTORY_METHODS: readonly string[] = ["getSignaturesForAddress", "getTransaction", "getTransactionsForAddress"];
/** D-8 (vii), dated line Q-2 of the G2 of PR-2b-1: X / |R| <= 3 / 2 000 (5 % convention, declared), and 0 for the three others. */
export const DOJO_HISTORY_BOUNDS: HistoryBounds = { contested: [3, 2000], noQuorum: 0, unordered: 0, failedMoving: 0 };
/** Cycle id and dashboard floor of each operator (calque of PR-2-2's HELIUS_CYCLE_* and of deploy/monark-sentinel.service:28-31). */
export const DOJO_HISTORY_ENV = { helius: ["HELIUS_CYCLE_ID", "HELIUS_CYCLE_FLOOR"], chainstack: ["CHAINSTACK_CYCLE_ID", "CHAINSTACK_CYCLE_FLOOR"] } as const;
export const DOJO_HISTORY_COLLECT_REFUSALS = Object.freeze(["usage", "state_path_malformed", "state_inside_repo", "mint_mismatch", "cycle_missing",
  "budget_guard", "state_missing", "disk_space", "phase_order", "inputs_mismatch", "lock_held"] as const);
/** Reasons of a partial status: those of PR-2b-2 (frozen) plus the stop on duration (C-27, Q-6), a transport fault that ends a page or an
 *  RpcError of parameters (D-2 l.215), and the stops of the corrections of the G2 of PR-2b-3: a cursor that does not advance (C-G2-1), an
 *  unlock the ledger does not confirm (Q-12, C-G2-2), a response carrying a secret form (C-G2-7). To fold into DOJO_HISTORY_PARTIAL_REASONS
 *  at the next pli of history-build.ts (DOJO-HISTORY-REASONS-FOLD-1). */
export const DOJO_HISTORY_COLLECT_REASONS: readonly string[] = Object.freeze([...DOJO_HISTORY_PARTIAL_REASONS, "course_timeout", "transport_fault",
  "cursor_stalled", "unlock_unconfirmed", "secret_in_response"]);
/** The checks composed before any complete bundle, in the order run; checks.json carries this list only once all of them passed (C-G2-11). */
export const DOJO_HISTORY_COMPOSED = Object.freeze(["supply", "instructions", "creation", "day_pairing", "bounds"] as const);
/** C-G2-7 (D-12 l.473, Q-11): the declared shapes of a key-bearing text, the api-key query of the first operator's url and a 32-hex key in
 *  a url path (the second operator's form; no_secret_in_repo). With the forms of this course's secret values (secretForms below), a
 *  response carrying one stops the course before it is written. */
export const DOJO_HISTORY_SECRET_SHAPES: readonly RegExp[] = Object.freeze([/api-key=/i, /https?:\/\/[^\s"'/]+\/[0-9a-f]{32}(?![0-9a-f])/i]);
const MINT_TXT_SHA256 = "9b4e275adfbb7054c750647a3393d8c19c247242c806616819c391a29f1bdecb"; // out/mint.txt, TU-3 (ADR D-1: 9b4e275a...decb)
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // the manifest's program (D-12 l.467): Token-2022, ADR-DOJO-PR-2 D-2 l.124
const PEAK = 6467, DAY = 86400, DAY1 = 20706; // D-10 S(J) = 6 467 x J (derived.json R4); D-3 l.229 DAY1 = 1 788 998 400 / 86 400
const BODY_MAX = 36341, GZIP = 5.17; // D-10 disk: largest body of R-h, gzip ratio of R-g
const pages = (x: number, L: number): number => Math.floor(x / L) + 1; // D-10 p(x, L)
const [A, B] = DOJO_HISTORY_OPS;

type Code = (typeof DOJO_HISTORY_COLLECT_REFUSALS)[number];
export class DojoHistoryCollectError extends Error {
  readonly code: Code;
  constructor(code: Code, detail: string) { super(`dojo/history-collect: ${code}: ${detail}`); this.code = code; }
}
/** A stop of the collector that is not a check of history-read.ts: its reason goes to the partial status, its detail (a path or a unit,
 *  never a secret) to run.json (C-G2-8 (b)). */
class Halt extends Error {
  readonly reason: string; readonly detail: string | null;
  constructor(reason: string, detail: string | null = null) { super(`dojo/history-collect: ${reason}`); this.reason = reason; this.detail = detail; }
}
const refuse = (code: Code, detail: string): never => { throw new DojoHistoryCollectError(code, detail); };
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const obj = (x: unknown): Record<string, unknown> | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null);

// ---- closed forms (D-2) -------------------------------------------------------------------------------------------------------------
const TX = { encoding: "jsonParsed", maxSupportedTransactionVersion: 1, commitment: "finalized" } as const;
const sigsForm = (addr: string, before?: string): unknown[] => [addr, { limit: 1000, ...(before === undefined ? {} : { before }), commitment: "finalized" }];
const pageForm = (mint: string, token?: string): unknown[] => [mint, { transactionDetails: "full", sortOrder: "asc", limit: 100, ...TX, ...(token === undefined ? {} : { paginationToken: token }) }];
const txForm = (s: string): unknown[] => [s, { ...TX }];

export interface Args { readonly phase: "A" | "B" | "C"; readonly state: string; readonly mintFile: string; readonly cut: number; readonly maxCalls: number;
  readonly maxCredits: number; readonly maxRu: number; readonly deadline: number; readonly firstRead: string }
const FLAGS = ["--phase", "--state", "--mint-file", "--cut", "--max-calls", "--max-credits", "--max-ru", "--deadline", "--first-read"];
/** The closed argv: the nine flags, each once, each with a well-formed value; --deadline is the UTC instant bounding the course (C-27),
 *  so named (Q-2 of the orchestrator) that it never reads as the reconcile's --course-end <sha256> (D-13); --first-read is the closed day
 *  of PR-2 that is the first day read (B1R of D-3, TU-1h). */
export function parseArgv(argv: readonly string[]): Args {
  const got = new Map<string, string>();
  for (let j = 0; j < argv.length; j += 2) {
    const f = argv[j] ?? "", v = argv[j + 1];
    if (!FLAGS.includes(f) || got.has(f) || v === undefined || v.startsWith("--")) refuse("usage", f);
    got.set(f, v as string);
  }
  for (const f of FLAGS) if (!got.has(f)) refuse("usage", `missing ${f}`);
  const s = (f: string): string => got.get(f) ?? "";
  const n = (f: string): number => (/^[1-9][0-9]{0,11}$/.test(s(f)) ? Number(s(f)) : refuse("usage", f));
  const end = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s("--deadline")) ? Date.parse(s("--deadline")) : NaN;
  if (!Number.isFinite(end) || new Date(end).toISOString() !== s("--deadline").replace("Z", ".000Z")) refuse("usage", "--deadline");
  const phase = s("--phase");
  if (phase !== "A" && phase !== "B" && phase !== "C") return refuse("usage", "--phase");
  return { phase, state: s("--state"), mintFile: s("--mint-file"), cut: n("--cut"), maxCalls: n("--max-calls"), maxCredits: n("--max-credits"),
    maxRu: n("--max-ru"), deadline: end, firstRead: s("--first-read") };
}

export interface RunDeps { readonly env: Readonly<Record<string, string | undefined>>; readonly nowMs: () => number; readonly sleep?: (ms: number) => Promise<void> }
interface Line { readonly seq: number; readonly prev_sha256: string | null; readonly phase: string; readonly op: string; readonly unit: string; readonly method: string;
  readonly params_sha256: string; readonly raw: string | null; readonly raw_sha256: string | null; readonly size: number; readonly outcome: "ok" | "null" | "fault" }
interface Ctx { a: Args; deps: RunDeps; mint: string; ev: string; ledger: string; cycles: Record<string, string>; floors: Record<string, number>;
  methodCaps: Record<string, number>; secrets: readonly string[]; closed: Map<string, Line>; seq: number; prev: string | null; accounts: Set<string>;
  first: { readonly sha256: string; readonly d_last: string; readonly cut: number; readonly records: readonly string[] } }

/** D-12 l.444 "outside any repository" (probe-3.mjs:554; C-G2-4): --state is absolute with no `.` or `..` segment (each segment tested
 *  exactly: `..x` is a name), else state_path_malformed; neither the path nor its real path (a junction) nor an ancestor of either holds
 *  a `.git` (a directory, or the file of a worktree), else state_inside_repo. */
function stateOutside(p: string): void {
  if (!isAbsolute(p) || p.split(/[\\/]/).some((s) => s === "." || s === "..")) refuse("state_path_malformed", "--state");
  for (const q of existsSync(p) ? [resolve(p), realpathSync(p)] : [resolve(p)]) {
    for (let d = q; ; d = dirname(d)) { if (existsSync(join(d, ".git"))) refuse("state_inside_repo", "--state"); if (dirname(d) === d) break; }
  }
}
/** C-G2-7, as probe-3.mjs:159 (D-12 l.473): the forms of this course's secret values, raw, percent-encoded, JSON-escaped, hex and base64
 *  (the forms of the G2's probe P-1), in lower case:
 *  the first operator's key, the second operator's url, and the path segments of 16 characters or more, query values and userinfo of
 *  that url and of each url of BELL_SOLANA_RPC. The base64 form is taken at the three offsets modulo 3 that a value can have inside a
 *  longer blob: the characters its bytes alone decide (DOJO-HISTORY-KEY-ALIGNMENT-1, C-V-5 of the cp-2 of PR-2b-3). */
const b64 = (s: string): string[] => [0, 1, 2].map((k) => Buffer.concat([Buffer.alloc(k), Buffer.from(s)]).toString("base64")
  .slice(Math.ceil((8 * k) / 6), Math.floor((8 * (k + Buffer.byteLength(s))) / 6)));
function secretForms(env: RunDeps["env"]): string[] {
  const out = new Set<string>(), add = (s: string | undefined, min: number): void => {
    if (s === undefined || s.length < min) return;
    for (const x of [s, encodeURIComponent(s), JSON.stringify(s).slice(1, -1), Buffer.from(s).toString("hex"), ...b64(s)]) out.add(x.toLowerCase());
  };
  add(env.HELIUS_API_KEY, 8); add(env.CHAINSTACK_SOLANA_URL, 8);
  for (const v of [env.CHAINSTACK_SOLANA_URL ?? "", ...(env.BELL_SOLANA_RPC ?? "").split(",")]) {
    try { const u = new URL(v.trim()); for (const g of u.pathname.split("/")) add(g, 16); for (const q of u.searchParams.values()) add(q, 8); add(u.username, 8); add(u.password, 8); } catch { /* not a url: no part */ }
  }
  return [...out];
}

/** Every check before any lock and any call: argv, --state outside any repository, the pinned mint file, cycles and floors (strictly
 *  positive, D-10 l.409), method caps from S(J) (D-10 l.400), guard x10 (floor + 10 x --max-credits <= 8 000 000; floor + --max-ru <=
 *  16 000 000), the ledger root, and free space >= 2 x the compressed bound of the evidence (D-10 l.415, Q-5). */
function setup(argv: readonly string[], deps: RunDeps): Ctx {
  const a = parseArgv(argv);
  stateOutside(a.state);
  let text = "";
  try { text = readFileSync(a.mintFile, "utf8"); } catch { refuse("mint_mismatch", "--mint-file"); }
  if (sha(text) !== MINT_TXT_SHA256) refuse("mint_mismatch", "--mint-file");
  let first: Ctx["first"] | null = null; // B1R (D-3 l.227) through PR-2's reader of a closed day (C-29): D_LAST = its day - 1, S_CUT = max E_e
  try {
    const records = readDayLayout(a.firstRead).records.map(recordBytes), fr = firstRead(records), d0 = Date.parse(`${fr.day}T00:00:00.000Z`) / 1000;
    first = { sha256: sha(readFileSync(join(a.firstRead, "publish", "SHA256SUMS"), "utf8")), d_last: new Date((d0 - DAY) * 1000).toISOString().slice(0, 10),
      cut: Math.max(...fr.enumerations.map((e) => e.context_slot)), records };
  } catch { refuse("inputs_mismatch", "--first-read"); } // a day that does not read, or reads without two enumerations (Q-G1-1)
  if (first?.cut !== a.cut) refuse("inputs_mismatch", "--cut"); // DOJO-HISTORY-CUT-CHECK-1: --cut is S_CUT (D-3 l.230)
  if (existsSync(join(a.state, "publish", "SHA256SUMS"))) refuse("phase_order", "complete"); // D-12: never overwritten, by any phase (C-G2-2)
  const cycles: Record<string, string> = {}, floors: Record<string, number> = {};
  for (const op of DOJO_HISTORY_OPS) {
    const [id, fl] = DOJO_HISTORY_ENV[op].map((k) => deps.env[k]);
    if (id === undefined || !/^[A-Za-z0-9._-]{1,64}$/.test(id) || fl === undefined || !/^[1-9][0-9]{0,8}$/.test(fl)) refuse("cycle_missing", op);
    cycles[op] = id as string; floors[op] = Number(fl);
  }
  const J = Math.floor(deps.nowMs() / 1000 / DAY) - DAY1 + 1, S = PEAK * J;
  if (!(J >= 1)) refuse("usage", "clock before day 1");
  const methodCaps = { getSignaturesForAddress: pages(S, 1000), getTransactionsForAddress: pages(S, 100), getTransaction: S };
  assertMethodCapsCover(methodCaps, DOJO_HISTORY_METHODS, "dojo/history");
  if ((floors[A] ?? 0) + 10 * a.maxCredits > HELIUS_CYCLE_CAP_CREDITS || (floors[B] ?? 0) + a.maxRu > CHAINSTACK_CYCLE_CAP_RU) refuse("budget_guard", "floor + 10 x --max-credits, floor + --max-ru");
  const ledger = join(a.state, "ledger");
  if (!existsSync(ledger)) refuse("state_missing", "ledger");
  const fs = statfsSync(a.state);
  if (fs.bavail * fs.bsize < 2 * Math.ceil((2 * S * BODY_MAX) / GZIP)) refuse("disk_space", "--state");
  return { a, deps, mint: text.trim(), ev: join(a.state, "evidence"), ledger, cycles, floors, methodCaps, secrets: secretForms(deps.env), closed: new Map(),
    seq: 0, prev: null, accounts: new Set(), first: first as Ctx["first"] };
}

// ---- evidence: durable writes, chained journal, raw responses (D-11 l.427, D-12) ----------------------------------------------------
function durable(path: string, data: string | Uint8Array, flags: "a" | "wx" | "w"): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, flags);
  try { const b = typeof data === "string" ? Buffer.from(data, "utf8") : data; for (let o = 0; o < b.length;) o += writeSync(fd, b, o, b.length - o); fsyncSync(fd); } finally { closeSync(fd); }
}
const replace = (path: string, data: string): void => { durable(`${path}.tmp`, data, "w"); renameSync(`${path}.tmp`, path); };
function append(c: Ctx, line: Record<string, unknown>): void {
  const text = canonical({ ...line, seq: c.seq, prev_sha256: c.prev });
  durable(join(c.ev, "journal.jsonl"), `${text}\n`, "a");
  c.seq += 1; c.prev = sha(`${text}\n`);
}
const unitKey = (l: { phase: string; op: string; method: string; unit: string }): string => `${l.phase}|${l.op}|${l.method}|${l.unit}`;
const sources = (): string => sha(["history-collect.ts", "history-read.ts", "history-build.ts"].map((f) => sha(readFileSync(new URL(`./${f}`, import.meta.url), "utf8"))).join(""));
const rawText = (c: Ctx, l: { readonly raw: string | null; readonly raw_sha256: string | null }): string | null => {
  try { const t = gunzipSync(readFileSync(join(c.ev, l.raw ?? ""))).toString("utf8"); return sha(t) === l.raw_sha256 ? t : null; } catch { return null; }
};

/** D-11 resume, steps 1-3: the chain of the journal and every cited raw response are verified (else evidence_corrupt, with the line or the
 *  path); the fixed inputs must be those of the first line (else inputs_mismatch); a unit is closed when its line carries a response (a
 *  fault is not closed); a page of phase C only when its account is closed: step 4, an account not closed is read again from its first page. */
function openJournal(c: Ctx): void {
  const p = join(c.ev, "journal.jsonl"), inputs = { mint: c.mint, mint_sha256: MINT_TXT_SHA256, cut: c.a.cut, collector_sha256: sources(),
    first_read_sha256: c.first.sha256, d_last: c.first.d_last }; // D-11 l.427 (DOJO-HISTORY-CUT-CHECK-1)
  const lines = existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l !== "") : [];
  lines.forEach((text, i) => {
    let l: (Line & { inputs?: unknown }) | null = null;
    try { l = JSON.parse(text) as Line & { inputs?: unknown }; } catch { /* a torn or NUL tail: stopped below */ }
    if (l === null || l.seq !== i || l.prev_sha256 !== c.prev) throw new Halt("evidence_corrupt", `journal.jsonl:${String(i)}`);
    if (i === 0 && canonical(l.inputs ?? null) !== canonical(inputs)) refuse("inputs_mismatch", "first journal line");
    if (i > 0 && l.raw !== null) { if (rawText(c, l) === null) throw new Halt("evidence_corrupt", l.raw); c.closed.set(unitKey(l), l); }
    if (l.phase === "C" && l.method === "close") c.accounts.add(l.unit); // an account whose pages and new bodies were all read (D-11)
    c.seq = i + 1; c.prev = sha(`${text}\n`);
  });
  for (const [k, l] of c.closed) { // D-11 step 4: the pages of an account not closed are read again from its first page
    if (l.phase === "C" && l.method === "getSignaturesForAddress" && !c.accounts.has(l.unit.split(" ")[0] ?? "")) c.closed.delete(k);
  }
  if (lines.length === 0) append(c, { inputs });
}

type Fetch = (phase: string, op: string, method: string, params: readonly unknown[], unit: string) => Promise<unknown>;
/** One unit, once the clock is read (C-G2-1: no closed unit is served at or past --deadline either, so no served loop outlives it): served
 *  from the evidence when closed; else (online only) one guarded call under withRetry (each try is a guarded call; quorum.ts:150-163), the
 *  response scanned for the secret forms (C-G2-7), written raw (compressed, exclusive create, named by its sha256; a file already under
 *  that name is cited only once verified, C-G2-8 (b)) then journaled. Only client.call is retried (statusOf would read a Halt thrown inside
 *  the retried call as a transient fault); the clock is read again in onRetry (before the backoff) and in the injected sleep (after it), so
 *  no retry leaves at or past --deadline, and that Halt passes through unfolded (C-G2-3). A transport fault after the tries is FAULT
 *  (journaled, not closed); an RpcError or a 403 stops (D-2 l.215; EARLY-BOUNDS-1); a budget stop is fatal (D-11). */
function fetcher(c: Ctx, client: BudgetedClient | null, sleep?: (ms: number) => Promise<void>): Fetch {
  const late = (): void => { if (c.deps.nowMs() >= c.a.deadline) throw new Halt("course_timeout"); };
  const wait = sleep ?? ((ms: number): Promise<void> => new Promise((res) => { setTimeout(res, ms); }));
  const pause = async (ms: number): Promise<void> => { await wait(ms); late(); };
  return async (phase, op, method, params, unit) => {
    late();
    const done = c.closed.get(unitKey({ phase, op, method, unit }));
    if (done !== undefined) { const t = rawText(c, done); if (t === null) throw new Halt("evidence_corrupt"); return JSON.parse(t) as unknown; }
    if (client === null) return refuse("phase_order", `${phase} ${op} ${unit}`);
    let r: unknown = FAULT;
    try { r = await withRetry(() => client.call(op as OperatorLabel, method, params), { onRetry: late, sleep: pause }); } catch (e) {
      if (e instanceof BudgetExceededError || e instanceof Halt) throw e;
      if (e instanceof RpcError || !(e instanceof TransportError) || e.code === 403) throw new Halt("transport_fault"); // a 403: EARLY-BOUNDS-1
    }
    const line = { phase, op, unit, method, params_sha256: sha(canonical(params)) };
    if (r === FAULT) { append(c, { ...line, raw: null, raw_sha256: null, size: 0, outcome: "fault" }); return FAULT; }
    const text = canonical(r ?? null), h = sha(text), rel = `raw/${phase}/${op}/${h}.json.gz`, low = text.toLowerCase();
    if (c.secrets.some((s) => low.includes(s)) || DOJO_HISTORY_SECRET_SHAPES.some((x) => x.test(text))) throw new Halt("secret_in_response", unitKey(line));
    if (!existsSync(join(c.ev, rel))) durable(join(c.ev, rel), gzipSync(text), "wx");
    else if (rawText(c, { raw: rel, raw_sha256: h }) === null) throw new Halt("evidence_corrupt", rel);
    const l = { ...line, raw: rel, raw_sha256: h, size: Buffer.byteLength(text), outcome: (r ?? null) === null ? "null" : "ok" } as const;
    append(c, l);
    c.closed.set(unitKey(l), { ...l, seq: c.seq - 1, prev_sha256: null });
    return r ?? null;
  };
}

// ---- phase A: the mint index of one operator (D-3 l.234-243); phase C: the pages of one account (D-3 l.257-259) --------------------
async function indexOf(f: Fetch, op: string, addr: string, phase = "A"): Promise<unknown[]> {
  const all: unknown[] = [], used = new Set<string>(); // C-G2-1: a `before` already used (ignored by the operator, or a cycle) stops
  for (let before: string | undefined; ;) {
    const page = await f(phase, op, "getSignaturesForAddress", sigsForm(addr, before), phase === "A" ? before ?? "" : `${addr} ${before ?? ""}`);
    if (page === FAULT) throw new Halt("transport_fault");
    const entries = readIndex(page);
    all.push(...(page as unknown[]));
    if (entries.length < 1000) {
      if (phase !== "A") return all; // an account's pages end at its short page (D-3 phase C); SIG0 ends the index of the mint only
      const e = readIndex(all).at(-1); // the oldest entry of the whole index must be SIG0 (an empty page included)
      if (e?.signature !== SIG0.signature || e.slot !== SIG0.slot || e.blockTime !== SIG0.blockTime) throw new DojoHistoryStop("creation_mismatch", `oldest entry at ${op}`);
      return all;
    }
    before = entries.at(-1)?.signature ?? "";
    if (used.has(before)) throw new Halt("cursor_stalled", `${phase} ${op}`);
    used.add(before);
  }
}

// ---- phase B: bodies and admission (D-3 l.245-254, D-9) ------------------------------------------------------------------------------
export interface Collected { readonly ia: readonly unknown[]; readonly ib: readonly unknown[]; readonly txs: readonly Body[]; readonly noQuorum: readonly NoQuorum[];
  readonly counts: HistoryCounts; readonly failedExcluded: number; readonly gtfa: { readonly missing: number; readonly extra: number; readonly failedBodies: number } }
const moves = (b: Body): boolean => { const m = new Map<string, string[]>(); for (const e of b.mint) m.set(e.account, [...(m.get(e.account) ?? []), `${e.side}:${e.amount}`]);
  return [...m.values()].some((v) => { const x = v.find((s) => s.startsWith("pre:"))?.slice(4) ?? "0", y = v.find((s) => s.startsWith("post:"))?.slice(5) ?? "0"; return BigInt(x) !== BigInt(y); }); };

/** The pages of the first operator from the start, until a page is empty, carries no token, or ends past S_CUT; each page's signatures of
 *  R (and those of the page absent from both indexes: contested, X + 1) are then read at the second operator in (slot, signature) order;
 *  a signature of F is never requested (D-4); the signatures of R absent from the pages are completed by getTransaction at the first
 *  operator (D-9, C-25). A token already used stops cursor_stalled before any body of its page is read (C-G2-1). The optional index day
 *  of a NoQuorum without blockTime is not applied while its bound is 0 (dated line). With `later` (phase C, act 2), once the evidence of
 *  phase B is served, the course opens and reads, the smallest first in byte order, the pages of every account of the mint seen in a body
 *  read (closed ones included) at both operators to the short page, merges them (D-4) and reads their new signatures at both operators;
 *  one account is one unit, closed by a `close` line of the journal, until no account is left (D-3 l.255-262, D-11). The bounds of (vii)
 *  that only grow stop early: after each page of phase B and before each admission of phase C (DOJO-HISTORY-EARLY-BOUNDS-1). */
async function collectBodies(c: Ctx, f: Fetch, ia: unknown[], ib: unknown[], later?: () => Fetch): Promise<Collected> {
  const m = mergeIndexes(ia, ib, c.a.cut), idx = new Map([...readIndex(ib), ...readIndex(ia)].map((e) => [e.signature, e] as const));
  const R = new Set(m.read), F = new Set(m.failed), seen = new Set<string>(), slot = new Map([...idx].map(([s, e]) => [s, e.slot] as const));
  const adm = new Map<string, Admission>(), failedMoving = new Set<string>(), used = new Set<string>();
  let extra = 0, failedBodies = 0, nq = 0; const X = new Set(m.contested); // X: the distinct signatures contested or in disagreement (C-G2-1)
  const uo = new Set<number>(), acc = new Set<string>(), B7 = DOJO_HISTORY_BOUNDS; // the unordered slots so far; every account seen in a body read
  const early = (): boolean => nq > B7.noQuorum || uo.size > B7.unordered || failedMoving.size > B7.failedMoving;
  const order = (x: string, y: string): number => (slot.get(x) ?? 0) - (slot.get(y) ?? 0) || (x < y ? -1 : x > y ? 1 : 0);
  const see = (x: unknown): void => { try { for (const e of readBody(x, c.mint).mint) acc.add(e.account); } catch { /* FAULT, null, undecodable */ } };
  const pair = async (s: string, a: unknown, g = f, ph = "B"): Promise<void> => {
    const b = await g(ph, B, "getTransaction", txForm(s), s), x = admit(s, a, b, c.mint);
    see(a); see(b); adm.set(s, x);
    if (x.kind === "no_quorum") nq += 1;
    else if (x.kind === "admitted" && x.tx.rank === null) uo.add(x.tx.slot); else if (x.kind === "failed" && x.moves) failedMoving.add(s);
  };
  for (let token: string | undefined; ;) {
    const pg = await f("B", A, "getTransactionsForAddress", pageForm(c.mint, token), token ?? ""), data = obj(pg)?.data;
    if (pg === FAULT || !Array.isArray(data)) throw new Halt(pg === FAULT ? "transport_fault" : "read_malformed");
    const batch = new Map<string, unknown>();
    let last = -1;
    for (const x of data as unknown[]) {
      const b = readBody(x, c.mint);
      last = b.slot;
      if (b.slot > c.a.cut || seen.has(b.signature)) continue;
      seen.add(b.signature); slot.set(b.signature, b.slot); for (const e of b.mint) acc.add(e.account);
      if (b.err !== null) { failedBodies += 1; if (moves(b)) failedMoving.add(b.signature); }
      if (F.has(b.signature)) continue;
      if (!R.has(b.signature)) { R.add(b.signature); X.add(b.signature); extra += 1; }
      batch.set(b.signature, x);
    }
    const t = obj(pg)?.paginationToken, next = typeof t === "string" && t !== "" && data.length > 0 && last <= c.a.cut ? t : null;
    if (next !== null && used.has(next)) throw new Halt("cursor_stalled", "B getTransactionsForAddress");
    for (const s of [...batch.keys()].sort(order)) await pair(s, batch.get(s));
    if (next === null || early()) break;
    used.add(next); token = next;
  }
  const missing = [...R].filter((s) => !seen.has(s)).sort(order);
  for (const s of missing) if (!early()) await pair(s, await f("B", A, "getTransaction", txForm(s), s));
  const g = later === undefined || early() ? undefined : later(), done = new Set<string>(); // phase C: the course opens here (act 2)
  const next = (): string | undefined => { let a: string | undefined; for (const x of acc) if (!done.has(x) && (a === undefined || x < a)) a = x; return a; };
  for (let a = g === undefined ? undefined : next(); a !== undefined && g !== undefined && !early(); a = next()) {
    const [pa, pb] = [await indexOf(g, A, a, "C"), await indexOf(g, B, a, "C")], ma = mergeIndexes(pa, pb, c.a.cut);
    for (const e of [...readIndex(pb), ...readIndex(pa)]) slot.set(e.signature, e.slot);
    for (const s of ma.read) if (F.has(s)) X.add(s); // C-G2-3 (a): a failure of F that both operators' indexes of this account list as a success
    for (const s of ma.read) if (!R.has(s) && !F.has(s) && !early()) { R.add(s); await pair(s, await g("C", A, "getTransaction", txForm(s), s), g, "C"); }
    for (const s of ma.failed) if (!R.has(s)) F.add(s); else X.add(s); // C-G2-3 (b): a signature of R that they list as a failure
    for (const s of ma.contested) X.add(s); done.add(a); // D-4 l.304: one signature, one X, however many merges contest it (C-G2-1)
    if (!early() && !c.accounts.has(a)) {
      append(c, { phase: "C", op: "", unit: a, method: "close", params_sha256: sha(canonical([a])), raw: null, raw_sha256: null, size: 0, outcome: "ok" });
    }
  }
  const txs: Body[] = [], noQuorum: NoQuorum[] = [];
  let failed = 0;
  for (const s of [...R].sort(order)) {
    const x = adm.get(s);
    if (x?.kind === "admitted") txs.push(x.tx);
    else if (x?.kind === "failed") { failed += 1; if (x.moves) failedMoving.add(s); }
    else if (x?.kind === "no_quorum") noQuorum.push(x);
  }
  const counts = { read: R.size, contested: X.size, noQuorum: noQuorum.length,
    unordered: new Set(txs.filter((t) => t.rank === null).map((t) => t.slot)).size,
    failedMoving: failedMoving.size };
  return { ia, ib, txs, noQuorum, counts, failedExcluded: F.size + failed, gtfa: { missing: missing.length, extra, failedBodies } };
}

/** DOJO-HISTORY-CHECKS-COMPOSITION-1: on every admitted transaction (i) by transaction and a mint after SIG0 (checkSupply) and (vi)
 *  (checkInstructions); (iv) (checkCreation); QC-2 (a read without quorum at two slots with fewer blockTimes than slots stops
 *  day_not_monotone); (vii) (checkBounds, DOJO_HISTORY_BOUNDS). Any failure throws: the caller writes partial, never publish/. Returns
 *  the list of the checks passed, the proof checks.json carries before any bundle (C-G2-11; cp-2 of PR-2b-2, point v). */
export function composeChecks(x: Pick<Collected, "ia" | "ib" | "txs" | "noQuorum" | "counts">, mint: string): readonly string[] {
  for (const t of x.txs) { checkSupply(t); checkInstructions(t); }
  checkCreation(x.ia, x.ib, x.txs.find((t) => t.signature === SIG0.signature) ?? null, mint);
  for (const n of x.noQuorum) if (new Set(n.slots).size > 1 && n.blockTimes.length !== n.slots.length) throw new DojoHistoryStop("day_not_monotone", `${n.signature}: pairing`);
  checkBounds(x.counts, DOJO_HISTORY_BOUNDS);
  return DOJO_HISTORY_COMPOSED;
}
/** The complete bundle, only after the composed checks (tuyau of PR-2b-4's close: phase C, then D to F). */
export function closeHistory(x: Pick<Collected, "ia" | "ib" | "txs" | "noQuorum" | "counts"> & { readonly records: readonly string[] },
  b: Omit<BundleInput, "status" | "stop_reason" | "build">): HistoryBundle {
  composeChecks(x, b.mint);
  return historyBundle({ ...b, status: "complete", stop_reason: null, build: buildHistory({ txs: x.txs, noQuorum: x.noQuorum, records: x.records }) });
}

// ---- the course ---------------------------------------------------------------------------------------------------------------------
const GUARD_REASONS = ["run_calls", "run_credits", "method_cap_unlisted", "method_cap", "cycle_cap"];
function reasonOf(e: unknown): string | null {
  if (e instanceof DojoHistoryStop || e instanceof DojoHistoryBuildStop) return e.code;
  if (e instanceof Halt) return e.reason;
  const g = e instanceof BudgetExceededError ? /rpc-guard: (\w+) \(fail-closed\)/.exec(e.message)?.[1] : undefined;
  return g !== undefined && GUARD_REASONS.includes(g) ? g : null;
}
export interface Status { readonly status: "partial" | "complete"; readonly stop_reason: string | null; readonly unlocked: Readonly<Record<string, string>> }

/** The served unlock of one operator (D-11, D-13 point 6): the sha256 of its `unlocked` line when that line is the last of the ledger and
 *  equals the head `<op>.head`; `unconfirmed` otherwise, a throw included, so that the next operator is still unlocked (C-G2-2). */
function release(c: Ctx, op: string): string {
  try {
    const cyc = c.cycles[op] ?? "", dir = join(c.ledger, cyc);
    runCli(["unlock", "--cycle", cyc, "--op", op, "--reason", "dojo/history-collect: course end (finally)"],
      { ledgerDir: c.ledger, floor: c.floors[op] ?? 0, readSnapshot: () => { throw new Error("dojo/history-collect: no snapshot for unlock"); } });
    const last = obj(JSON.parse(readFileSync(join(dir, `${op}.jsonl`), "utf8").trimEnd().split("\n").at(-1) ?? "null"));
    return last?.outcome === "unlocked" && last.entry_sha256 === readFileSync(join(dir, `${op}.head`), "utf8").trim() ? String(last.entry_sha256) : "unconfirmed";
  } catch { return "unconfirmed"; }
}

/** One phase, one course. Refusals throw before any lock; a stop ends the course (no call after it) with a partial status and its reason;
 *  a phase that ends normally leaves partial with stop_reason null (the history is complete only after phase F, PR-2b-4). Every opened
 *  operator is then unlocked; one unlock not confirmed stops the course unlock_unconfirmed (Q-12): status.json and run.json are written,
 *  and run.json keeps the first reason and its detail (C-G2-2). Phase C (PR-2b-4) also runs D and E (buildHistory) inside the course,
 *  then, ended without stop, writes the evidence of its course, publish/ through closeHistory (its manifest links that evidence; its
 *  SHA256SUMS last), and only then the status complete (D-12). */
export async function runHistoryCollect(argv: readonly string[], deps: RunDeps): Promise<Status> {
  const c = setup(argv, deps), started = new Date(deps.nowMs()).toISOString(), unlocked: Record<string, string> = {};
  let client = null as BudgetedClient | null, reason: string | null = null, detail: string | null = null, got: Collected | null = null, built = false;
  let composed: readonly string[] | null = null, fatal: { readonly e: unknown } | null = null;
  try {
    openJournal(c);
    const served = fetcher(c, null), idx = c.a.phase === "A" ? null : [await indexOf(served, A, c.mint), await indexOf(served, B, c.mint)];
    const open = (): Fetch => { // the lock is taken once the evidence of the earlier phases is served (phase_order before any lock)
    try {
      client = openGuardedClient(deps.env, { maxCalls: c.a.maxCalls, runCaps: { [A]: c.a.maxCredits, [B]: c.a.maxRu }, methodCaps: c.methodCaps, cycleFloor: c.floors },
        c.ledger, c.cycles, { network: "solana-mainnet" });
    } catch (e) { if (e instanceof Error && e.constructor.name === "LockHeldError") refuse("lock_held", "operator lock"); throw e; }
    return fetcher(c, client, deps.sleep); };
    if (idx === null) { const f = open(); for (const op of DOJO_HISTORY_OPS) await indexOf(f, op, c.mint); }
    else { got = await collectBodies(c, c.a.phase === "B" ? open() : served, idx[0] ?? [], idx[1] ?? [], c.a.phase === "C" ? open : undefined); }
    if (got !== null) composed = composeChecks(got, c.mint);
    if (got !== null && c.a.phase === "C") { buildHistory({ txs: got.txs, noQuorum: got.noQuorum, records: c.first.records }); built = true; }
  } catch (e) { reason = reasonOf(e); detail = e instanceof Halt ? e.detail : null; if (reason === null) fatal = { e }; }
  for (const op of client?.operators() ?? []) unlocked[op] = release(c, op);
  const stop = Object.values(unlocked).includes("unconfirmed") ? "unlock_unconfirmed" : reason;
  if (fatal !== null && stop === null) throw fatal.e;
  let status: Omit<Status, "unlocked"> = { status: "partial", stop_reason: stop };
  if (client !== null || reason !== null) {
    const runs = join(c.ev, "runs"), run = join(runs, `${String(existsSync(runs) ? readdirSync(runs).length : 0).padStart(4, "0")}-${started.replace(/[:.]/g, "-")}`), files: Record<string, string> = {
      "run.json": `${canonical({ phase: c.a.phase, started, ended: new Date(deps.nowMs()).toISOString(), stop_reason: reason, stop_detail: detail, unlock_stop: stop === reason ? null : stop,
        spent: client?.spent() ?? null, unlocked, caps: { max_calls: c.a.maxCalls, max_credits: c.a.maxCredits, max_ru: c.a.maxRu, method_caps: c.methodCaps, floors: c.floors, deadline: c.a.deadline } })}\n`,
      "checks.json": `${canonical(got === null ? null : { counts: got.counts, failed_excluded: got.failedExcluded, gtfa: got.gtfa, bounds: DOJO_HISTORY_BOUNDS, composed })}\n` };
    for (const [n, t] of Object.entries(files)) durable(join(run, n), t, "wx");
    const sums = Object.keys(files).sort().map((n) => `${sha(files[n] ?? "")}  ${n}\n`).join("");
    durable(join(run, "SHA256SUMS"), sums, "wx");
    if (built && got !== null && stop === null) { // F (D-12): publish/ once the evidence it links is written, its SHA256SUMS last, then the status
      const pub = closeHistory({ ...got, records: c.first.records }, { mint: c.mint, program: T22, decimals: SIG0.decimals, sig0: SIG0.signature,
        sig0_slot: SIG0.slot, transactions_failed_excluded: got.failedExcluded, collector_sha256: sources(), evidence_sha256sums_sha256: sha(sums) }).publish;
      for (const [p, t] of Object.entries(pub ?? {})) replace(join(c.a.state, "publish", ...p.split("/")), t);
      status = { status: "complete", stop_reason: null };
    }
    replace(join(c.ev, "status.json"), `${canonical(status)}\n`);
  }
  if (fatal !== null) throw fatal.e;
  return { ...status, unlocked };
}

export async function main(argv: readonly string[], deps: RunDeps): Promise<number> {
  try {
    const s = await runHistoryCollect(argv, deps), said = s.stop_reason ?? (s.status === "complete" ? "complete" : "phase done");
    process.stderr.write(`dojo/history-collect: ${said}\n`); return s.stop_reason === null ? 0 : 1;
  } catch (e) {
    const code = (e as { code?: unknown }).code;
    process.stderr.write(`dojo/history-collect: ${typeof code === "string" ? code : "fatal"}\n`);
    return code === "usage" ? 64 : 1;
  }
}
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main(process.argv.slice(2), { env: process.env, nowMs: () => Date.now() });
