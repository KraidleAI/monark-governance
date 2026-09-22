// MONARK Bell — T-1a-iii-a1 CLI entry (NEW file, never collect.ts runMain — B-4). Wires the pure core
// (universe.ts) to real I/O: paginate api.xstocks.fi /public/assets to EXHAUSTION, confirm each Solana
// mint under quorum-2 (solana-foundation + Chainstack), then — ONLY if the founding-mint calibration
// oracle passes — write the committable universe-candidates artifact OUTSIDE the repo. ZERO Helius.
//
// GARDE-HELIUS-1b-i: the SOLE paid path is `openGuardedClient` (@monark/rpc-guard) — the meter + write-ahead
// per-operator CYCLE ledger + lock. The operator SUBSET comes from the CLI (`--operators`, C-12), never from an
// env probe; retry is AT THE CALLER, ABOVE the client (D-2). The RUN ledger (budget.json + chained journal in
// --out) STAYS as a1-bis PROVENANCE (D-6), fed by client.spent().attempts + the RUN prior. The run NEVER commits
// (R-20) and NEVER touches a public registry: everything stays `upcoming` (Bell = temps 2).
import { join, dirname } from "node:path";
import { assertOutsideRepo } from "./collect.ts";
import { BudgetExceededError, type JsonRpcCall, type TransportFault } from "./quorum.ts";
import {
  ISSUER_HOST, ISSUER_LABEL, SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR, UNIVERSE_OPERATORS,
  assertHostAllowed, guardedRpcCall, universeRunCap,
  readPriorCalls, serializeLedger, confirmMintIdentity, assertProvidersDistinctForQuorum,
  enumerateUniverse, foundingCalibration, buildUniverseArtifact, universeArtifactBytes, universeSha256,
  foldPage, pageAssets, withUniverseRetry, RedirectBlockedError, Fatal403Error, scrubSecret,
  chainedLedgerEntry, countIdentityEmptied, UNIVERSE_LEDGER_JOURNAL,
  type OnchainReadout,
} from "./universe.ts";
// The SOLE paid path (openGuardedClient) + the SERVED unlock/reconcile CLI + the canonical typed transport fault.
import { openGuardedClient, runCli, TransportError, type RunLimits, type OperatorLabel, type BudgetedClient } from "@monark/rpc-guard";
import { createHash } from "node:crypto";

export interface RunDeps {
  readonly sleep: (ms: number) => Promise<void>;
  readonly now: () => number;
  readonly env: Record<string, string | undefined>;          // passed AS-IS to openGuardedClient (universe reads NO key)
  readonly readFile: (p: string) => string;
  readonly writeFile: (p: string, data: string) => void;
  readonly appendFile: (p: string, data: string) => void;    // C-G2-7: append-only journal (never writeFile, which overwrites)
  readonly exists: (p: string) => boolean;
  readonly mkdirp: (p: string) => void;
  readonly log?: (line: string) => void;
}

function argOf(argv: readonly string[], k: string): string | undefined { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; }
/** Parse a `k=v,k=v` method-cap table (per-method ATTEMPT caps for the guarded client, D-8). Fail-closed on a
 *  non-numeric value; an empty/blank pair is skipped (the non-empty check is on the RESULT). */
function parseMethodCaps(raw: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const pair of raw.split(",")) {
    if (pair.trim() === "") continue;
    const eq = pair.indexOf("=");
    const k = eq >= 0 ? pair.slice(0, eq).trim() : "";
    const v = eq >= 0 ? pair.slice(eq + 1).trim() : "";
    if (k === "") throw new Error(`bell/universe: --method-caps '${pair}' is not k=<finite >= 0> (fail-closed)`);
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) throw new Error(`bell/universe: --method-caps '${pair}' is not k=<finite >= 0> (fail-closed)`);
    out[k] = n;
  }
  return out;
}

/** Parse + validate the operator CLI, fail-closed. Pure. --out required (outside repo); --max-calls required
 *  and > 0 (C-11). The guarded-client inputs are REQUIRED with NO default (B-4): --ledger-dir (the pre-existing
 *  CYCLE dir), --cycle, --floor, --max-ru (chainstack RU run cap), --method-caps (k=v,..), --operators (EXACTLY
 *  the universe subset). --min-interval defaults to 286 ms (=> <= 3.5 req/s; fiche 05 ceiling). */
/** The COMPLETE set of known CLI flags. Any other `--token` is a typo/unknown flag => fail-closed BEFORE any
 *  write or call (C-G2-5 G2 fold): before, an unknown flag was silently ignored and its value fell back to the
 *  default. --ledger-dir (CYCLE) is DISTINCT from --ledger (RUN anchor) and --out (artifact dir). */
const KNOWN_FLAGS: ReadonlySet<string> = new Set([
  "--out", "--ledger", "--max-calls", "--min-interval", "--page-size", "--max-pages", "--max-429-streak", "--date",
  "--ledger-dir", "--cycle", "--floor", "--max-ru", "--method-caps", "--operators",
]);
/** C-G2-5 (G2 fold): the pacing FLOOR (PLI §3: --min-interval 286 ms => <= 3.5 req/s logical, ~1.75/s per operator
 *  under quorum-2). The rate ceiling lives in CODE, not only in the typed command: below the floor (incl. 0, which
 *  would DISABLE pacing) is refused fail-closed. */
export const MIN_INTERVAL_FLOOR_MS = 286;
export function parseUniverseArgs(argv: readonly string[]) {
  // C-G2-5: reject any unknown `--flag` BEFORE any parsing/write/call. Values (paths, dates, numbers, k=v caps,
  // label lists) never start with "--", so scanning for unknown "--" tokens does not eat a value.
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
  // GARDE-HELIUS-1b-i (B-4): the guarded-client inputs are REQUIRED, no default (fail-closed before any lock).
  const ledgerDir = argOf(argv, "--ledger-dir");
  if (ledgerDir === undefined) throw new Error("bell/universe: --ledger-dir is required (the pre-existing CYCLE ledger dir; B-4)");
  const cycle = argOf(argv, "--cycle");
  if (cycle === undefined) throw new Error("bell/universe: --cycle is required (the cycle id; B-4)");
  if (argOf(argv, "--floor") === undefined) throw new Error("bell/universe: --floor is required (the chainstack cycle floor read at the dashboard; B-4)");
  const floor = num("--floor", 0);
  if (argOf(argv, "--max-ru") === undefined) throw new Error("bell/universe: --max-ru is required (the chainstack run RU cap; B-4)");
  const maxRu = num("--max-ru", 0);
  if (!(maxRu > 0)) throw new Error("bell/universe: --max-ru must be > 0 (fail-closed)");
  const methodCapsRaw = argOf(argv, "--method-caps");
  if (methodCapsRaw === undefined) throw new Error("bell/universe: --method-caps is required (e.g. getAccountInfo=20000; B-4)");
  const methodCaps = parseMethodCaps(methodCapsRaw);
  if (Object.keys(methodCaps).length === 0) throw new Error("bell/universe: --method-caps parsed empty (fail-closed)");
  const operatorsRaw = argOf(argv, "--operators");
  if (operatorsRaw === undefined) throw new Error("bell/universe: --operators is required (C-12 subset from the CLI; B-4)");
  const operators = operatorsRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const opsSet = new Set(operators);
  if (opsSet.size !== UNIVERSE_OPERATORS.length || !UNIVERSE_OPERATORS.every((l) => opsSet.has(l))) {
    throw new Error(`bell/universe: --operators must be EXACTLY {${UNIVERSE_OPERATORS.join(",")}} (fail-closed, C-12)`);
  }
  const minInterval = num("--min-interval", MIN_INTERVAL_FLOOR_MS);
  if (minInterval < MIN_INTERVAL_FLOOR_MS) throw new Error(`bell/universe: --min-interval ${String(minInterval)} is below the ${String(MIN_INTERVAL_FLOOR_MS)} ms floor (pacing cannot be disabled, C-G2-5)`);
  return {
    out,
    ledger: argOf(argv, "--ledger") ?? join(out, "budget.json"),
    ledgerDir, cycle, floor, maxRu, methodCaps, operators,
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
  // Operator SUBSET from the CLI (C-12): the RPC quorum uses labels {solana-foundation, chainstack}. The universe
  // NEVER probes deps.env for an operator url — openGuardedClient resolves each label to its private endpoint
  // INTERNALLY. Preflight: exactly two DISTINCT operators BEFORE any issuer page or lock.
  const providers = [SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR];
  assertProvidersDistinctForQuorum(providers);

  deps.mkdirp(a.out); // the OUT-OF-REPO artifact dir (RUN ledger + raw + artifact). NEVER mkdirp(a.ledgerDir): the
  // CYCLE dir parent MUST pre-exist (ensureCycleDir throws otherwise, C-8/D-6) — the phantom-fresh guard.
  // C-G2-2: a scrub BELT on EVERY write (defence in depth). universe holds no operator url anymore (C-12), so the
  // secret arg is dropped; scrubSecret's chainstack/p2pify regex still redacts a url that any future field leaked.
  const writeOut = (p: string, data: string): void => { deps.writeFile(p, scrubSecret(data)); };
  // C-G2-7: the chained RUN-ledger journal lives beside the anchor (dirname(--ledger)); NO new CLI flag.
  const ledgerJournal = join(dirname(a.ledger), UNIVERSE_LEDGER_JOURNAL);
  // RUN ledger prior (a1-bis PROVENANCE, D-6 KEPT): resume-without-double-count of the RUN counter. The inter-run
  // MONEY guard is the CYCLE ledger (openGuardedClient), which moving --out cannot reset.
  const prior = readPriorCalls(a.ledger, ledgerJournal, deps.exists, deps.readFile);
  let ledgerHead = prior.head;      // prev_entry_sha256 of the NEXT entry (GENESIS iff fresh)
  let ledgerSeq = prior.seq;        // seq of the NEXT entry
  let persistedCalls = prior.calls; // last calls_cumulative committed to the journal

  // M17: the client's run cap for THIS run = the RUN's REMAINING attempts (throws here if already spent, no lock).
  const runCap = universeRunCap(a.maxCalls, prior.calls);
  const limits: RunLimits = { maxCalls: runCap, runCaps: { [CHAINSTACK_OPERATOR]: a.maxRu }, methodCaps: a.methodCaps, cycleFloor: { [CHAINSTACK_OPERATOR]: a.floor } };
  const cycles = Object.fromEntries(UNIVERSE_OPERATORS.map((l) => [l, a.cycle]));

  let client: BudgetedClient | undefined;
  try {
    // The SOLE paid path (P6): open the guarded client (real transport; deps.env passed AS-IS — universe reads no
    // key). Per-operator locks + durable CYCLE ledgers are acquired here; opts.network="solana-mainnet" resolves
    // CHAINSTACK_SOLANA_URL and stamps the ledger `network` attribute (121). A requested-but-unresolved chainstack
    // (absent CHAINSTACK_SOLANA_URL) throws HERE, BEFORE any lock.
    client = openGuardedClient(deps.env, limits, a.ledgerDir, cycles, { network: "solana-mainnet" });
    const c = client;
    const total = (): number => prior.calls + c.spent().attempts; // M17: RUN prior + this run's metered attempts

    // persist(): ANCHOR-COUNTER FIRST (crash-conservative), then APPEND the chained journal — but only when the
    // count ADVANCED (skip-if-unchanged). A crash between the two leaves anchor.calls >= head => over-count on
    // resume, never under (C-1). The count is the client's attempt tally (the SOLE meter) + the RUN prior.
    const persist = (): void => {
      const t = total();
      writeOut(a.ledger, serializeLedger(t));
      if (t > persistedCalls) {
        const entry = chainedLedgerEntry(ledgerHead, ledgerSeq, t);
        deps.appendFile(ledgerJournal, scrubSecret(JSON.stringify(entry) + "\n"));
        ledgerHead = entry.entry_sha256; ledgerSeq += 1; persistedCalls = t;
      }
    };
    // Paced + retried LABEL call: retry is AT THE CALLER, ABOVE the client (D-2) — each retry RE-ENTERS c.call so
    // each attempt is metered + write-ahead-ledgered (R retries => R+1 ledger lines). A budget refusal / 403 / 3xx
    // is NEVER retried (withUniverseRetry re-throws it). maxRetries defaults to 4; the C-11 probe passes 0.
    const pacedCall = async (label: string, method: string, params: readonly unknown[], maxRetries?: number): Promise<unknown> => {
      await deps.sleep(a.minInterval);
      return withUniverseRetry(() => c.call(label as OperatorLabel, method, params), { sleep: deps.sleep, now: deps.now, ...(maxRetries !== undefined ? { maxRetries } : {}) });
    };
    const call: JsonRpcCall = (label, method, params) => pacedCall(label, method, params);
    const guardedCall = guardedRpcCall(call); // method (getAccountInfo only) + label allowlist belts on the RPC path
    // The issuer GET witness: the guarded client returns the 200 body VERBATIM ({assets:[…]} OR a bare array — 1b-0
    // C-1), consumed by foldPage/pageAssets. The pathAndQuery is params[0]; the host is resolved INSIDE the client.
    const pagedGet = (pathAndQuery: string): Promise<unknown> => { assertHostAllowed(ISSUER_LABEL); return pacedCall(ISSUER_LABEL, "GET", [pathAndQuery]); };

    // --- Paginate /public/assets to EXHAUSTION (end anchor + monotonicity; never "N pages") -------------
    const seenIds = new Set<string>();
    const rawAssets: unknown[] = [];
    let page = 0; let exhausted = false;
    try {
      for (; page < a.maxPages; page++) {
        const body = await pagedGet(`/api/v2/public/assets?pageSize=${String(a.pageSize)}&page=${String(page)}`);
        const folded = foldPage(seenIds, body, a.pageSize);
        if (folded.duplicateIds) throw new Error("bell/universe: duplicate asset ids across pages (server ignores page => exhaustion not provable)");
        rawAssets.push(...folded.assets);
        persist(); // C-V-1: persist PER PAGE so a hard-kill mid-pagination is <= 1 tick behind
        if (folded.endAnchor) { exhausted = true; break; }
      }
    } finally { persist(); }
    if (!exhausted) throw new Error(`bell/universe: reached --max-pages ${String(a.maxPages)} with no end anchor (exhaustion NOT proven; refuse to claim 'N pages')`);

    // --- SAVE the issuer raw sha-pinned OUT OF REPO, BEFORE the oracle AND before the observation probe (C-V-2) ---
    const rawBody = lf(JSON.stringify({ schema: "bell-universe-issuer-raw-v1", host: ISSUER_HOST, endpoint: "/api/v2/public/assets", pageSize: a.pageSize, pages: page + 1, assets: rawAssets }, null, 0)) + "\n";
    const rawSha256 = sha256Hex(rawBody);
    const rawPath = join(a.out, `issuer-assets-${a.date}.json`);
    writeOut(rawPath, rawBody);
    log(scrubSecret(`raw saved: issuer-assets-${a.date}.json sha256=${rawSha256} pages=${String(page + 1)} assets=${String(rawAssets.length)}`));

    // C-11: OBSERVATION-only probe of page+1 AFTER the raw save (the proof is already durable). NEVER STOPs on a
    // SERVER response: 403 / 3xx / 4xx / 5xx / transport are RECORDED as past_end_probe= and swallowed. Only a PURE
    // budget cap (BudgetExceededError) STOPs — and Fatal403Error / RedirectBlockedError, which SUBCLASS
    // BudgetExceededError, are caught EXPLICITLY FIRST so a 403/3xx past-end does NOT kill the run. maxRetries:0.
    let pastEndProbe = "not_run";
    try {
      assertHostAllowed(ISSUER_LABEL);
      const probeBody = await pacedCall(ISSUER_LABEL, "GET", [`/api/v2/public/assets?pageSize=${String(a.pageSize)}&page=${String(page + 1)}`], 0);
      const arr = pageAssets(probeBody);
      pastEndProbe = Array.isArray(probeBody) ? `array_len=${String(arr.length)}` : (arr.length > 0 ? `envelope_len=${String(arr.length)}` : "not_array");
    } catch (e) {
      if (e instanceof Fatal403Error) pastEndProbe = "http_403";                     // subclass of BudgetExceededError — SWALLOW (observation, C-V-2)
      else if (e instanceof RedirectBlockedError) pastEndProbe = "redirect_blocked"; // subclass of BudgetExceededError — SWALLOW
      else if (e instanceof BudgetExceededError) throw e;                            // PURE budget cap => the ONLY probe STOP
      else if (e instanceof TransportError) pastEndProbe = e.code !== undefined ? `http_${String(e.code)}` : "transport_error";
      else pastEndProbe = "transport_error";
    } finally { persist(); } // C-V-1: persist the probe's +1 tick immediately

    // --- Confirm each Solana mint on-chain (quorum-2), with a pre-registered 429-streak STOP -------------
    let streak429 = 0;
    const confirm = async (mint: string): Promise<OnchainReadout> => {
      const faults: TransportFault[] = [];
      try {
        const readout = await confirmMintIdentity(mint, providers, guardedCall, faults);
        // RESIDUAL (declared, 1b-i ADR): statusOf reads a Bell-local "HTTP <n>"; a package TransportError 429 codes
        // as "transport" until 1b-ii ports statusOf to `.code` (C-3), so this streak counter is precise only after
        // 1b-ii. The per-call retry (withUniverseRetry honours Retry-After, bounds the immediate 429) stays.
        if (faults.some((f) => f.status === "HTTP 429")) { streak429 += 1; } else { streak429 = 0; }
        if (streak429 >= a.max429Streak) throw new Error(`bell/universe: ${String(a.max429Streak)} consecutive rate-limited (429) confirmations after honoring Retry-After — STOP fail-closed (ledger persisted)`);
        return readout;
      } finally { persist(); } // persist per-mint even when confirmMintIdentity throws (403/budget). C-V-1: the PAID
      // path — a kill between a quorum-2 send and its persist under-counts <= 2 logical calls => PAID exposure <= 2 RPC.
    };
    const { candidates, totalAssets, solanaAssets } = await enumerateUniverse(rawAssets, confirm);
    persist();

    // --- Calibration ORACLE: the 4 founding mints must appear + be confirmed, else STOP (no artifact) ----
    const calibration = foundingCalibration(candidates);
    const confirmed = candidates.filter((cand) => cand.onchain.state === "confirmed").length;
    if (!calibration.ok) {
      log(scrubSecret(`CALIBRATION FAILED: missing=[${calibration.missing.join(",")}] notConfirmed=[${calibration.notConfirmed.join(",")}] — NO artifact written`));
      return { ok: false, artifactSha256: null, rawSha256, totalAssets, solanaAssets, confirmed, calls: total(), calibration };
    }

    // --- Write the committable artifact (field allowlist) + a SEPARATE provenance envelope ---------------
    const body = buildUniverseArtifact(candidates, { totalAssets, solanaAssets });
    const artifactSha256 = universeSha256(body);
    const artifactPath = join(a.out, `universe-candidates-${a.date}.json`);
    writeOut(artifactPath, universeArtifactBytes(body));
    persist(); // the head line the provenance carries is current (the artifact write ticks nothing; no-op unless a tail confirm advanced)
    const identityEmptied = countIdentityEmptied(candidates);
    writeOut(join(a.out, `PROVENANCE-univers-solana.md`), provenanceMd(a.date, providers, rawSha256, artifactSha256, totalAssets, solanaAssets, confirmed, ledgerHead, identityEmptied, pastEndProbe));
    log(scrubSecret(`artifact: universe-candidates-${a.date}.json sha256=${artifactSha256} confirmed=${String(confirmed)}/${String(solanaAssets)} calls=${String(total())}`));
    return { ok: true, artifactSha256, rawSha256, totalAssets, solanaAssets, confirmed, calls: total(), calibration };
  } finally {
    // Release the N per-operator locks openGuardedClient acquired (keyless included, even on a budget stop / throw)
    // via the SERVED `unlock` (a chained `unlocked` line + lock-file removal). ONLY if the client was built: if
    // openGuardedClient threw, its own rollback already released any partial locks (guard, else we'd mask it). A HARD
    // crash (SIGKILL) leaves the locks held — fail-closed, detectable; the runbook then does N `unlock` before
    // `reconcile` (1b0-E). All universe operators share ONE cycle (a.cycle), so `--cycle a.cycle` is correct.
    if (client !== undefined) {
      for (const op of client.operators()) {
        runCli(["unlock", "--cycle", a.cycle, "--op", String(op), "--reason", "bell/universe: course end (finally, N unlock)"], { ledgerDir: a.ledgerDir, floor: a.floor, readSnapshot: () => { throw new Error("bell/universe: readSnapshot is not used by unlock"); } });
      }
    }
  }
}

/** Provenance envelope (SEPARATE from the timestamp-free artifact body). Operators by DOMAIN only (never a
 *  key-bearing url — C-10); the Chainstack node is named by operator, its url never printed (it never reaches
 *  Bell — it is held inside the guarded client's transport). */
export function provenanceMd(date: string, providers: readonly string[], rawSha: string, artSha: string, total: number, solana: number, confirmed: number, ledgerHead: string, identityEmptied: number, pastEndProbe: string): string {
  const operators = "solana-foundation (api.mainnet.solana.com) + chainstack (node url held in CHAINSTACK_SOLANA_URL, never printed)";
  return [
    `# PROVENANCE — Bell T-1a-iii-a1 universe candidates (${date})`,
    ``,
    `- Issuer API: https://${ISSUER_HOST}/api/v2/public/assets (public, no key), paginated to exhaustion.`,
    `- On-chain quorum-2 operators: ${operators}.`,
    `- Zero Helius credit. Non-production RPC use; 429/Retry-After honored; 403 => hard stop.`,
    `- issuer raw sha256: ${rawSha}`,
    `- universe-candidates sha256 (canonical, timestamp-free body): ${artSha}`,
    // FIXED form (parsable by the composition test C-5): the chained RUN-ledger head (informative audit, NOT a
    // fail-closed control). identity_text_emptied = name/symbol fields the sanitizer emptied (C-7). past_end_probe
    // = the OBSERVATION-only page+1 shape/status (C-11), never content.
    `- ledger head sha256: ${ledgerHead}`,
    `- identity_text_emptied: ${String(identityEmptied)}`,
    `- past_end_probe: ${pastEndProbe}`,
    `- counts: total_assets=${String(total)}, solana_assets=${String(solana)}, confirmed=${String(confirmed)}.`,
    `- Field allowlist: on-chain identity + issuer identity only; NO price/value/volume. Nothing published; all upcoming.`,
    ``,
  ].join("\n");
}

// ---- Live entry (import.meta-guarded): real fs, real clock. The guarded client owns the ONLY network egress via
// its private transport; universe-cli carries no network call and reads NO endpoint key. Never runs under test. -----
/** Live entry: real fs, --out asserted OUTSIDE the repo. Any error is SCRUBBED before printing and the process
 *  exits 1 (fail-closed). The guarded client is built inside runUniverse from process.env. */
export async function main(argv: readonly string[], repoRoot: string): Promise<void> {
  const { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } = await import("node:fs");
  const a = parseUniverseArgs(argv);
  assertOut(a.out, repoRoot);
  const deps: RunDeps = {
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), env: process.env,
    readFile: (p) => readFileSync(p, "utf8"), writeFile: (p, d) => { writeFileSync(p, d); },
    appendFile: (p, d) => { appendFileSync(p, d); },
    exists: (p) => existsSync(p), mkdirp: (p) => { mkdirSync(p, { recursive: true }); },
    log: (line) => { process.stdout.write(scrubSecret(line) + "\n"); },
  };
  const r = await runUniverse(argv, deps);
  if (!r.ok) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/") ?? ""}` || import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/") ?? ""}`) {
  main(process.argv.slice(2), process.cwd()).catch((e: unknown) => {
    process.stderr.write(scrubSecret(e instanceof Error ? e.message : String(e)) + "\n");
    process.exitCode = 1;
  });
}
