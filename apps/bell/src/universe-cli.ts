// MONARK Bell — T-1a-iii-a1 CLI entry (NEW file, never collect.ts runMain — B-4). Wires the pure core
// (universe.ts) to real I/O: paginate api.xstocks.fi /public/assets to EXHAUSTION, confirm each Solana
// mint under quorum-2 (api.mainnet.solana.com + Chainstack), then — ONLY if the founding-mint calibration
// oracle passes — write the committable universe-candidates artifact OUTSIDE the repo. ZERO Helius.
//
// All I/O is INJECTED (deps) so CA-11 tests run the WHOLE composition offline from a file fixture. The
// live main() at the bottom is import.meta-guarded. The run NEVER commits (R-20) and NEVER touches a
// public registry: everything stays `upcoming`.
import { join } from "node:path";
import { makeBudgetedCall, assertOutsideRepo } from "./collect.ts";
import { type JsonRpcCall, type TransportFault } from "./quorum.ts";
import {
  SOLANA_PUBLIC_URL, ISSUER_HOST, assertHostAllowed, guardedRpcCall, makeUniverseBudget,
  readPriorCalls, serializeLedger, confirmMintIdentity, assertProvidersDistinctForQuorum,
  enumerateUniverse, foundingCalibration, buildUniverseArtifact, universeArtifactBytes, universeSha256,
  foldPage, withUniverseRetry, HttpStatusError, RedirectBlockedError, retryAfterMs, scrubSecret,
  type OnchainReadout,
} from "./universe.ts";
import { createHash } from "node:crypto";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});

/** One HTTP GET result: parsed json + the Retry-After (ms) the server asked for (null when none/2xx). */
export interface HttpGetResult { readonly json: unknown }
export type HttpGet = (url: string) => Promise<HttpGetResult>;

export interface RunDeps {
  readonly httpGet: HttpGet;                 // issuer /public/assets GET (injected; live = fetch)
  readonly call: JsonRpcCall;                // low-level Solana JSON-RPC (injected; live = fetch POST)
  readonly sleep: (ms: number) => Promise<void>;
  readonly now: () => number;
  readonly env: NodeJS.ProcessEnv;
  readonly readFile: (p: string) => string;
  readonly writeFile: (p: string, data: string) => void;
  readonly exists: (p: string) => boolean;
  readonly mkdirp: (p: string) => void;
  readonly log?: (line: string) => void;
}

function argOf(argv: readonly string[], k: string): string | undefined { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; }

/** Parse + validate the operator CLI, fail-closed. Pure. --out required (outside repo); --max-calls
 *  required and > 0 (C-11). --min-interval defaults to 286 ms (=> <= 3.5 req/s on api.mainnet.solana.com,
 *  fiche 05: 4 req/s is AT the ceiling). */
/** The COMPLETE set of known CLI flags. Any other `--token` is a typo/unknown flag => fail-closed BEFORE any
 *  write or call (C-G2-5 G2 fold): before, an unknown flag was silently ignored and its value fell back to the
 *  default (e.g. a mistyped --max-pages ran at the 200 default, not the pre-registered 20). */
const KNOWN_FLAGS: ReadonlySet<string> = new Set([
  "--out", "--ledger", "--max-calls", "--min-interval", "--page-size", "--max-pages", "--max-429-streak", "--date",
]);
/** C-G2-5 (G2 fold): the pacing FLOOR (PLI §3: --min-interval 286 ms => <= 3.5 req/s logical, ~1.75/s per operator
 *  under quorum-2). The rate ceiling now lives in CODE, not only in the typed command: --min-interval below the
 *  floor (including 0, which would DISABLE pacing) is refused fail-closed. */
export const MIN_INTERVAL_FLOOR_MS = 286;
export function parseUniverseArgs(argv: readonly string[]) {
  // C-G2-5: reject any unknown `--flag` BEFORE any parsing/write/call. Values (paths, dates, numbers) never
  // start with "--", so scanning for unknown "--" tokens does not eat a value.
  for (const tok of argv) {
    if (tok.startsWith("--") && !KNOWN_FLAGS.has(tok)) throw new Error(`bell/universe: unknown flag '${tok}' (fail-closed; a typo must refuse BEFORE any write or call, C-G2-5)`);
  }
  const num = (k: string, def: number): number => {
    const raw = argOf(argv, k);
    if (raw === undefined) return def;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) throw new Error(`bell/universe: invalid numeric ${k}='${raw}' (need a finite value >= 0)`);
    return n;
  };
  const out = argOf(argv, "--out");
  if (out === undefined) throw new Error("bell/universe: --out is required (an OUT-OF-REPO directory)");
  if (argOf(argv, "--max-calls") === undefined) throw new Error("bell/universe: --max-calls is required (fail-closed APPELS budget, C-11)");
  const maxCalls = num("--max-calls", 0);
  if (!(maxCalls > 0)) throw new Error("bell/universe: --max-calls must be > 0 (C-11 fail-closed budget)");
  const minInterval = num("--min-interval", MIN_INTERVAL_FLOOR_MS);
  if (minInterval < MIN_INTERVAL_FLOOR_MS) throw new Error(`bell/universe: --min-interval ${String(minInterval)} is below the ${String(MIN_INTERVAL_FLOOR_MS)} ms floor (pacing cannot be disabled, C-G2-5)`);
  return {
    out,
    ledger: argOf(argv, "--ledger") ?? join(out, "budget.json"),
    maxCalls,
    minInterval,
    pageSize: num("--page-size", 100),
    maxPages: num("--max-pages", 200),
    max429Streak: num("--max-429-streak", 5),
    date: argOf(argv, "--date") ?? new Date().toISOString().slice(0, 10),
  };
}

export interface RunResult {
  readonly ok: boolean;
  readonly artifactSha256: string | null;
  readonly rawSha256: string;
  readonly totalAssets: number; readonly solanaAssets: number; readonly confirmed: number;
  readonly calls: number;
  readonly calibration: { readonly ok: boolean; readonly missing: readonly string[]; readonly notConfirmed: readonly string[] };
}

/** Repo-independent guard: a path must be OUTSIDE the given root (calque assertOutsideRepo; used with the
 *  repo root by main()). Kept here so the CLI is testable with a synthetic root. */
export function assertOut(out: string, root: string): void { assertOutsideRepo(out, root); }

const sha256Hex = (s: string): string => createHash("sha256").update(s).digest("hex");
const lf = (s: string): string => s.replace(/\r\n/g, "\n");

/** Run the whole -iii-a1 composition. Order (B-8 / advisor): preflight quorum -> paginate to exhaustion
 *  -> SAVE raw sha-pinned -> confirm on-chain -> calibration ORACLE -> (only if ok) write artifact. */
export async function runUniverse(argv: readonly string[], deps: RunDeps): Promise<RunResult> {
  const a = parseUniverseArgs(argv);
  const log = deps.log ?? (() => {});
  // Providers: EXPLICIT list (never solanaEndpoints()/PUBLIC_SOLANA=mainnet-beta, never BELL_SOLANA_RPC).
  const chainstack = (deps.env.CHAINSTACK_SOLANA_URL ?? "").trim();
  const providers = [SOLANA_PUBLIC_URL, chainstack];
  assertProvidersDistinctForQuorum(providers); // exit != 0 here if Chainstack absent — BEFORE any issuer page

  deps.mkdirp(a.out);
  // C-G2-2 (G2 fold): a scrub BELT on EVERY write (ledger, raw, artifact, provenance). The provenance builder
  // uses a fixed operator string today, but the belt still scrubs the Chainstack node url (hex key in path)
  // from any produced file even if a future field interpolated it. scrubSecret is idempotent on clean data.
  const writeOut = (p: string, data: string): void => { deps.writeFile(p, scrubSecret(data, chainstack)); };
  const priorCalls = readPriorCalls(a.ledger, deps.exists, deps.readFile);

  // Paced, retried low-level call; both GET and RPC fold into ONE APPELS budget (tick), one min-interval.
  const pacedInner: JsonRpcCall = async (u, m, p) => { await deps.sleep(a.minInterval); return withUniverseRetry(() => deps.call(u, m, p), { sleep: deps.sleep, now: deps.now }); };
  const budget = makeUniverseBudget(a.maxCalls, priorCalls, makeBudgetedCall, pacedInner);
  const persist = (): void => { writeOut(a.ledger, serializeLedger(budget.total())); };
  const guardedCall = guardedRpcCall(budget.call);
  const pagedGet: HttpGet = async (url) => { assertHostAllowed(url); budget.tick(); await deps.sleep(a.minInterval); return withUniverseRetry(() => deps.httpGet(url), { sleep: deps.sleep, now: deps.now }); };

  // --- Paginate /public/assets to EXHAUSTION (end anchor + monotonicity; never "N pages") -------------
  const seenIds = new Set<string>();
  const rawAssets: unknown[] = [];
  let page = 0; let exhausted = false;
  try {
    for (; page < a.maxPages; page++) {
      const url = `https://${ISSUER_HOST}/api/v2/public/assets?pageSize=${String(a.pageSize)}&page=${String(page)}`;
      const res = await pagedGet(url);
      const folded = foldPage(seenIds, res.json, a.pageSize);
      if (folded.duplicateIds) throw new Error("bell/universe: duplicate asset ids across pages (server ignores page => exhaustion not provable)");
      rawAssets.push(...folded.assets);
      if (folded.endAnchor) { exhausted = true; break; }
    }
  } finally { persist(); }
  if (!exhausted) throw new Error(`bell/universe: reached --max-pages ${String(a.maxPages)} with no end anchor (exhaustion NOT proven; refuse to claim 'N pages')`);

  // --- SAVE the issuer raw sha-pinned OUT OF REPO, BEFORE the oracle (the proof if the enumerator breaks) -
  const rawBody = lf(JSON.stringify({ schema: "bell-universe-issuer-raw-v1", host: ISSUER_HOST, endpoint: "/api/v2/public/assets", pageSize: a.pageSize, pages: page + 1, assets: rawAssets }, null, 0)) + "\n";
  const rawSha256 = sha256Hex(rawBody);
  const rawPath = join(a.out, `issuer-assets-${a.date}.json`);
  writeOut(rawPath, rawBody);
  log(scrubSecret(`raw saved: issuer-assets-${a.date}.json sha256=${rawSha256} pages=${String(page + 1)} assets=${String(rawAssets.length)}`, chainstack));

  // --- Confirm each Solana mint on-chain (quorum-2), with a pre-registered 429-streak STOP -------------
  let streak429 = 0;
  const confirm = async (mint: string): Promise<OnchainReadout> => {
    const faults: TransportFault[] = [];
    try {
      const readout = await confirmMintIdentity(mint, providers, guardedCall, faults);
      if (faults.some((f) => f.status === "HTTP 429")) { streak429 += 1; } else { streak429 = 0; }
      if (streak429 >= a.max429Streak) throw new Error(`bell/universe: ${String(a.max429Streak)} consecutive rate-limited (429) confirmations after honoring Retry-After — STOP fail-closed (ledger persisted)`);
      return readout;
    } finally { persist(); } // persist ticks even when confirmMintIdentity throws (403/budget) — never under-count
  };
  const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(rawAssets, confirm);
  persist();

  // --- Calibration ORACLE: the 4 founding mints must appear + be confirmed, else STOP (no artifact) ----
  const calibration = foundingCalibration(candidates);
  const confirmed = candidates.filter((c) => c.onchain.state === "confirmed").length;
  if (!calibration.ok) {
    log(scrubSecret(`CALIBRATION FAILED: missing=[${calibration.missing.join(",")}] notConfirmed=[${calibration.notConfirmed.join(",")}] — NO artifact written`, chainstack));
    return { ok: false, artifactSha256: null, rawSha256, totalAssets, solanaAssets, confirmed, calls: budget.total(), calibration };
  }

  // --- Write the committable artifact (field allowlist) + a SEPARATE provenance envelope ---------------
  const body = buildUniverseArtifact(candidates, { totalAssets, solanaAssets });
  const artifactSha256 = universeSha256(body);
  const artifactPath = join(a.out, `universe-candidates-${a.date}.json`);
  writeOut(artifactPath, universeArtifactBytes(body));
  writeOut(join(a.out, `PROVENANCE-univers-solana.md`), provenanceMd(a.date, providers, rawSha256, artifactSha256, totalAssets, solanaAssets, confirmed));
  persist();
  log(scrubSecret(`artifact: universe-candidates-${a.date}.json sha256=${artifactSha256} confirmed=${String(confirmed)}/${String(solanaAssets)} calls=${String(budget.total())}`, chainstack));
  return { ok: true, artifactSha256, rawSha256, totalAssets, solanaAssets, confirmed, calls: budget.total(), calibration };
}

/** Provenance envelope (SEPARATE from the timestamp-free artifact body). Operators by DOMAIN only (never a
 *  key-bearing url — C-10); the Chainstack node is named by operator, its url never printed. */
export function provenanceMd(date: string, providers: readonly string[], rawSha: string, artSha: string, total: number, solana: number, confirmed: number): string {
  const operators = "solana-foundation (api.mainnet.solana.com) + chainstack (node url held in CHAINSTACK_SOLANA_URL, never printed)";
  return [
    `# PROVENANCE — Bell T-1a-iii-a1 universe candidates (${date})`,
    ``,
    `- Issuer API: https://${ISSUER_HOST}/api/v2/public/assets (public, no key), paginated to exhaustion.`,
    `- On-chain quorum-2 operators: ${operators}.`,
    `- Zero Helius credit. Non-production RPC use; 429/Retry-After honored; 403 => hard stop.`,
    `- issuer raw sha256: ${rawSha}`,
    `- universe-candidates sha256 (canonical, timestamp-free body): ${artSha}`,
    `- counts: total_assets=${String(total)}, solana_assets=${String(solana)}, confirmed=${String(confirmed)}.`,
    `- Field allowlist: on-chain identity + issuer identity only; NO price/value/volume. Nothing published; all upcoming.`,
    ``,
  ].join("\n");
}

// ---- Live wrapper (import.meta-guarded): real fetch, real fs. Never runs in CI. --------------------
/** Live HTTP GET: throws HttpStatusError (with Retry-After ms) on non-2xx; url never in the message (C-10). */
export const liveHttpGet: HttpGet = async (url) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "GET", headers: { accept: "application/json" }, redirect: "manual", signal: ctl.signal });
    // C-G2-3 (G2 fold): a 3xx is a HARD STOP, never followed (undici returns the real 3xx under redirect:"manual").
    // This is BEFORE the generic !res.ok branch so a 302 becomes a re-thrown RedirectBlockedError, not a retried
    // HttpStatusError(302). No url in the message (C-10).
    if (res.status >= 300 && res.status < 400) throw new RedirectBlockedError("bell/universe: 3xx redirect on issuer GET — hard stop (never followed; the allowlist guards only the initial url, C-G2-3)");
    if (!res.ok) throw new HttpStatusError(res.status, retryAfterMs(res.headers.get("retry-after"), Date.now()));
    return { json: await res.json() };
  } finally { clearTimeout(to); }
};
/** Live Solana JSON-RPC POST: opaque url (may carry a Chainstack key) — never logged here. */
export const liveRpcCall: JsonRpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), redirect: "manual", signal: ctl.signal });
    // C-G2-3 (G2 fold): a 3xx is a HARD STOP — the request body must NEVER reach a redirected (off-allowlist) host.
    if (res.status >= 300 && res.status < 400) throw new RedirectBlockedError("bell/universe: 3xx redirect on Solana RPC POST — hard stop (never followed; body must not reach a redirected host, C-G2-3)");
    if (!res.ok) throw new HttpStatusError(res.status, retryAfterMs(res.headers.get("retry-after"), Date.now()));
    const json = asObj(await res.json());
    if (json.error) throw new Error(asObj(json.error).message ? String(asObj(json.error).message) : "rpc error"); // scrubbed by statusOf
    return json.result;
  } finally { clearTimeout(to); }
};

/** Live entry: real fetch + fs, --out asserted OUTSIDE the repo. Any error is SCRUBBED before printing and
 *  the process exits 1 (fail-closed). Never runs under `node --test` (import.meta guard). */
export async function main(argv: readonly string[], repoRoot: string): Promise<void> {
  const { readFileSync, writeFileSync, existsSync, mkdirSync } = await import("node:fs");
  const a = parseUniverseArgs(argv);
  assertOut(a.out, repoRoot);
  const chainstack = (process.env.CHAINSTACK_SOLANA_URL ?? "").trim();
  const deps: RunDeps = {
    httpGet: liveHttpGet, call: liveRpcCall,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), env: process.env,
    readFile: (p) => readFileSync(p, "utf8"), writeFile: (p, d) => { writeFileSync(p, d); },
    exists: (p) => existsSync(p), mkdirp: (p) => { mkdirSync(p, { recursive: true }); },
    log: (line) => { process.stdout.write(scrubSecret(line, chainstack) + "\n"); },
  };
  const r = await runUniverse(argv, deps);
  if (!r.ok) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/") ?? ""}` || import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/") ?? ""}`) {
  main(process.argv.slice(2), process.cwd()).catch((e: unknown) => {
    const chainstack = (process.env.CHAINSTACK_SOLANA_URL ?? "").trim();
    process.stderr.write(scrubSecret(e instanceof Error ? e.message : String(e), chainstack) + "\n");
    process.exitCode = 1;
  });
}
