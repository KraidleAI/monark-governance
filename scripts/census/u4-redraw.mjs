// scripts/census/u4-redraw.mjs
// ============================================================================================
// U-4a (Ukemi) — C-V-3 INDEPENDENT LIVE RE-DRAW for the SEPARATE G2-delta instance (pre-registered control,
// docs/PLAN-u4-prereg.md §4 / G0 l.68 / C-13): re-fetch >= k book accounts and >= k AnswerUpdated LIVE and confirm
// they reproduce the recorded cache / D_e series byte-for-byte (raw hex, no decoding for accounts). The accounts and
// the updates are chosen by a seed DERIVED from book_digest (never hand-picked) — `selectIndices` is pure and unit-
// tested offline. Bounded: --max-calls <= 60 enforced IN this script (fail-closed via BudgetExceededError under the
// SAME budget guard as record.ts), quorum-2 by method, operators EXCLUDABLE (--exclude-operator, repeatable — e.g.
// publicnode.com under CGU review CONF-SRC-1, or mevblocker.io as the course excluded). Raw report OUT OF REPO,
// labels only (never a URL/key). NOT run in the checkpoint-2 pli (no network there, R-20 / mission); RUN by G2-delta.
// The live wiring reuses record.ts / rpc2.ts / abi.ts primitives verbatim (already tested by ukemi-u4a).
//
//   node scripts/census/u4-redraw.mjs --cache <OUT-OF-REPO U4-inputs.jsonl> --block 23545087 --k 3 \
//     --max-calls 60 --prereg-sha 9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb \
//     [--book <U4-book-23545087.json>] [--de <U4-oracle-path-e2.jsonl>] \
//     [--exclude-operator publicnode.com] [--exclude-operator mevblocker.io] \
//     --out F:/PRODUITS/etude-2026-09-20/u4-raws/U4-redraw.json
// ============================================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, BudgetExceededError } from "../../apps/sentinel/src/ukemi/rpc2.ts";
import { makeDefaultCall, makeBudgetedCall, applyExcludeOperators, operatorLabel, lfSha256 } from "../../apps/sentinel/src/ukemi/record.ts";
import { SEL, wordAddr, ANSWER_UPDATED_TOPIC0, decInt256 } from "../../apps/sentinel/src/ukemi/abi.ts";
import { POOL } from "../../apps/sentinel/src/ukemi/clusters.ts";
import { parseResumeLines } from "../../apps/sentinel/src/ukemi/resume.ts";

const MAX_CALLS_CAP = 60; // C-V-3: a bounded control, never a re-course
const lc = (s) => String(s).toLowerCase();

/** Deterministic k DISTINCT indices in [0,n) drawn from a sha256 stream keyed by `seed` (a book_digest). Reproducible
 *  and NOT hand-picked (prereg §4 independence). Pure — the only unit-tested part of this live tool. */
export function selectIndices(seed, n, k) {
  const picked = [];
  const seen = new Set();
  for (let ctr = 0; picked.length < Math.min(k, n); ctr++) {
    const h = createHash("sha256").update(`${seed}:${ctr}`).digest("hex");
    const v = Number(BigInt("0x" + h.slice(0, 16)) % BigInt(n));
    if (!seen.has(v)) { seen.add(v); picked.push(v); }
  }
  return picked;
}

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const argAll = (k) => { const out = []; for (let i = 0; i < process.argv.length - 1; i++) if (process.argv[i] === k) out.push(process.argv[i + 1]); return out; };

async function main() {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const bookPath = arg("--book") ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4", "U4-book-23545087.json");
  const dePath = arg("--de") ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4", "U4-oracle-path-e2.jsonl");
  const cachePath = arg("--cache"); // OUT-OF-REPO U4-inputs.jsonl (recorded account bytes)
  const block = Number(arg("--block") ?? "23545087");
  const k = Number(arg("--k") ?? "3");
  const maxCalls = Number(arg("--max-calls") ?? "60");
  const preregSha = arg("--prereg-sha");
  const excludeOperators = argAll("--exclude-operator");
  const outPath = arg("--out");
  if (!(k >= 3)) throw new Error("u4-redraw: --k must be >= 3 (prereg §4: >= 3 accounts + >= 3 AnswerUpdated)");
  if (!(maxCalls > 0) || maxCalls > MAX_CALLS_CAP) throw new Error(`u4-redraw: --max-calls must be in (0, ${MAX_CALLS_CAP}] (bounded control, fail-closed)`);
  if (cachePath === undefined) throw new Error("u4-redraw: --cache <OUT-OF-REPO U4-inputs.jsonl> is required (compare live reads to the recorded cache)");
  if (preregSha === undefined) throw new Error("u4-redraw: --prereg-sha is required (A-2 order proof)");
  const preregActual = lfSha256(readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8"));
  if (preregActual !== preregSha) throw new Error(`u4-redraw: --prereg-sha ${preregSha} != docs/PLAN-u4-prereg.md LF sha ${preregActual} (A-2)`);

  const book = JSON.parse(readFileSync(bookPath, "utf8"));
  const addresses = book.accounts.map((a) => lc(a.address));
  const bookDigest = book.book_digest;
  const de = readFileSync(dePath, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const meta = de.find((l) => l.kind === "meta");
  const updates = de.filter((l) => l.kind === "update");
  const aggregator = meta.aggregator_at_b0;

  // recorded account bytes from the OUT-OF-REPO cache (raw ethCall hex, keyed to|data|block).
  const ethCallMap = new Map();
  for (const l of parseResumeLines(readFileSync(cachePath, "utf8"))) if (l.kind === "ethCall") ethCallMap.set(`${lc(l.to)}|${lc(l.data)}|${l.block}`, l.result);

  // seed-derived selections (book_digest); a distinct suffix draws the updates independently.
  const acctIdx = selectIndices(bookDigest, addresses.length, k);
  const updIdx = selectIndices(`${bookDigest}:updates`, updates.length, k);

  // live pool: SAME wiring as record.ts (keyless + env archive last, --exclude-operator, quorum-2, budget guard).
  const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  const ethCallProviders = applyExcludeOperators(archiveEnvUrl ? [...ETH_CALL_PROVIDERS, archiveEnvUrl] : [...ETH_CALL_PROVIDERS], excludeOperators, archiveEnvUrl);
  const getLogsProviders = applyExcludeOperators(archiveEnvUrl ? [...GET_LOGS_PROVIDERS, archiveEnvUrl] : [...GET_LOGS_PROVIDERS], excludeOperators, archiveEnvUrl);
  const distinct = (urls) => new Set(urls.map((u) => operatorLabel(u, archiveEnvUrl))).size;
  if (distinct(ethCallProviders) < 2 || distinct(getLogsProviders) < 2) throw new Error("u4-redraw: quorum-2 needs >= 2 distinct operators per method after --exclude-operator (fail-closed)");
  const budgeted = makeBudgetedCall(maxCalls, makeDefaultCall(), archiveEnvUrl);
  const pool = makeUkemiPool({ call: budgeted.call, ethCallProviders, getLogsProviders, minIntervalMs: 50 });

  const accountChecks = [];
  for (const i of acctIdx) {
    const addr = addresses[i];
    const data = SEL.getUserAccountData + wordAddr(addr);
    const cached = ethCallMap.get(`${lc(POOL)}|${lc(data)}|${block}`);
    if (cached === undefined) throw new Error(`u4-redraw: no cached getUserAccountData for ${addr}@${String(block)} in the cache (cache/book mismatch)`);
    const live = await pool.ethCall(POOL, data, block); // raw hex, quorum-2, budgeted
    accountChecks.push({ index: i, address: addr, match: lc(live) === lc(cached) });
  }

  const updateChecks = [];
  for (const i of updIdx) {
    const u = updates[i];
    const logs = await pool.getLogsRange(aggregator, [ANSWER_UPDATED_TOPIC0], u.block, u.block);
    const prices = logs.map((g) => decInt256(g.topics[1]).toString());
    updateChecks.push({ index: i, block: u.block, recorded_price: u.price, match: prices.includes(u.price) });
  }

  const allMatch = accountChecks.every((c) => c.match) && updateChecks.every((c) => c.match);
  const report = {
    schema: "ukemi-u4-redraw/1", model: "claude-opus-4-8[1m]", recorded_at_utc: new Date().toISOString(),
    book_digest: bookDigest, block, k, seed: "book_digest", aggregator, excluded_operators: excludeOperators,
    operators: [...new Set([...ethCallProviders, ...getLogsProviders].map((u) => operatorLabel(u, archiveEnvUrl)))],
    calls: budgeted.total(), calls_by_operator: budgeted.byOperator(),
    account_checks: accountChecks, update_checks: updateChecks, all_match: allMatch,
  };
  if (outPath) writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify({ all_match: allMatch, calls: budgeted.total(), accounts: accountChecks.length, updates: updateChecks.length }) + "\n");
  if (!allMatch) throw new Error("u4-redraw: MISMATCH — a live re-draw disagrees with the recorded cache / D_e (fail-closed)");
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => { console.error(e instanceof BudgetExceededError ? `u4-redraw: budget stop (fail-closed): ${e.message}` : String(e)); process.exit(1); });
}
