// scripts/census/u4-reduce.mjs
// ============================================================================================
// U-4a (Ukemi) — REDUCER DRIVER (A-3): reduce the OUT-OF-REPO raw book + raw oracle path to the three committed,
// sha-pinned fixtures under apps/sentinel/test/fixtures/ukemi/u4/. Offline, deterministic, no network. The reduced
// book keeps ONLY the fields the A-4 reducer reads (7 per account, balances filtered to the WETH aToken + variable-
// debt tokens) + all reserves; the oracle fixture is the decoded AnswerUpdated series + meta (e-mode LT decoded via
// abi.ts); the scores fixture is `computeScores` output (meta + per-account rows). Reproduces the pinned LF shas
// (U4-book 743e9499…, U4-oracle-path-e2 970357…, U4-scores-e2 e80386c6…). NO commit, NO workflow (R-20).
//   node scripts/census/u4-reduce.mjs [--raws-dir <out-of-repo>] [--out <fixtures dir>]
// ============================================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { decodeEModeCategoryData } from "../../apps/sentinel/src/ukemi/abi.ts";
import { computeScores } from "./u4-scores.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const lc = (s) => String(s).toLowerCase();
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };

function main() {
  const rawsDir = arg("--raws-dir") ?? "F:/PRODUITS/etude-2026-09-20/u4-raws";
  const outDir = arg("--out") ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4");
  const rawsAbs = resolve(rawsDir);
  const rel = relative(ROOT, rawsAbs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4-reduce: --raws-dir must be OUT of repo (CA-11): ${rawsAbs}`);
  mkdirSync(outDir, { recursive: true });

  // 1) reduced book: schema/block/cluster + all reserves + accounts with only the reducer-read fields.
  const bookRaw = JSON.parse(readFileSync(join(rawsAbs, "U4-book-23545087.raw.json"), "utf8"));
  const book = bookRaw.book;
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  const aWeth = lc(wr.atoken), vWeth = lc(wr.variable_debt_token);
  const redBook = {
    schema: book.schema, chain_id: book.chain_id, cluster: book.cluster, block: book.block,
    book_digest: bookRaw.provenance.book_digest,
    reserves: book.reserves.map((r) => ({ asset: r.asset, atoken: r.atoken, variable_debt_token: r.variable_debt_token, decimals: r.decimals, liquidation_threshold_bps: r.liquidation_threshold_bps, price_base_8dec: r.price_base_8dec })),
    accounts: book.accounts.map((a) => ({
      address: a.address, user_config: a.user_config, emode: a.emode,
      balances: a.balances.filter((b) => lc(b.token) === aWeth || lc(b.token) === vWeth),
      total_collateral_base: a.total_collateral_base, total_debt_base: a.total_debt_base,
      current_liquidation_threshold_bps: a.current_liquidation_threshold_bps, hf_onchain: a.hf_onchain, eligible_static: a.eligible_static,
    })),
  };
  writeFileSync(join(outDir, "U4-book-23545087.json"), JSON.stringify(redBook) + "\n");

  // 2) oracle path fixture (jsonl): meta {p_min, emode_lt (decoded), aggregator, phase_change, n_updates, monotone, usdt} + update lines.
  const oRaw = JSON.parse(readFileSync(join(rawsAbs, "U4-oracle-path-e2.raw.json"), "utf8"));
  const emodeLT = {};
  for (const [cat, hex] of Object.entries(oRaw.emode_raw)) { if (typeof hex === "string") emodeLT[cat] = decodeEModeCategoryData(hex).liquidationThresholdBps.toString(); }
  const meta = { kind: "meta", schema: "ukemi-u4-oracle/1", event_id: "e2-2025-10-10-weth", aggregator_at_b0: oRaw.aggregator.at_b0, aggregator_at_b_last: oRaw.aggregator.at_b_last, phase_change: oRaw.aggregator.phase_change, p_min: oRaw.p_min, p_max: oRaw.p_max, n_updates: oRaw.n_updates, monotone_blocks: oRaw.monotone_blocks, usdt_prices: oRaw.usdt_prices, emode_lt: emodeLT };
  const oracleLines = [meta, ...oRaw.updates.map((u) => ({ kind: "update", block: u.block, log_index: u.logIndex, price: u.price, round_id: u.round_id, updated_at: u.updated_at }))];
  writeFileSync(join(outDir, "U4-oracle-path-e2.jsonl"), oracleLines.map((l) => JSON.stringify(l)).join("\n") + "\n");

  // 3) scores fixture (jsonl): the reduced per-account rows + a meta with n/qhat/calib_digest.
  const u3 = readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u3", "U3-realized.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const scores = computeScores(book, { p_min: oRaw.p_min, emode_lt: emodeLT, usdt_prices: oRaw.usdt_prices }, u3);
  const { rows, ...summary } = scores;
  const scoreLines = [{ kind: "meta", ...summary }, ...rows.map((r) => ({ kind: "score", ...r }))];
  writeFileSync(join(outDir, "U4-scores-e2.jsonl"), scoreLines.map((l) => JSON.stringify(l)).join("\n") + "\n");

  process.stdout.write(`u4-reduce: wrote 3 fixtures to ${outDir} (book accounts ${redBook.accounts.length}, oracle updates ${oRaw.updates.length}, scores n=${summary.n} digest=${summary.calib_digest})\n`);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
