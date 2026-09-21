// scripts/census/u4b/u4b-reduce.mjs
// ============================================================================================
// U-4b-1a (Ukemi) — REDUCER DRIVER (NEW, under u4b/, C-17): reduce the OUT-OF-REPO raw book + raw oracle path to
// the sha-pinned u4b fixtures under apps/sentinel/test/fixtures/ukemi/u4b/. Offline, deterministic, no network.
// DUMB projection (zero eligibility logic — that lives in u4b-scores computeScoresU4b): keeps EVERY account, its
// aWETH balance + ALL variable-debt balances > 0 (multi-reserve close factor, C-7) + the aggregates, and every
// reserve with liquidation_bonus_bps + reserve_emode_category (C-14). The oracle fixture carries a pre-B₀ ANCHOR
// line (C-8 entry 7; here = the book WETH price @B₀, since the raw path has no pre-B₀ event — in -1b the anchor
// is the real AnswerUpdated ≤ B₀) + the e-mode category params {lt,bonus} decoded from emode_raw.
//   node scripts/census/u4b/u4b-reduce.mjs --book-raw <raw> --oracle-raw <raw> --labels <U3-realized>
//     --event-id <id> --episode-tag <tag> [--out <fixtures dir>]
// EVERY episode value is a MANDATORY argument (no e2 default — the code is episode-agnostic, C-12). The raws are
// OUT of repo (CA-11). NEVER re-generates the e2 u4/ fixtures (u4-reduce.mjs + U4-*-e2 stay byte-identical). NO
// commit, NO workflow (R-20).
// ============================================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { decodeEModeCategoryData } from "../../../apps/sentinel/src/ukemi/abi.ts";
import { computeScoresU4b } from "./u4b-scores.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const lc = (s) => String(s).toLowerCase();
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };

function main() {
  // Episode-agnostic (C-12): every episode-specific value is a MANDATORY argument (no e2 default). The FROZEN
  // bytes run unchanged on the fresh -1b episode.
  const bookRawPath = arg("--book-raw"), oracleRawPath = arg("--oracle-raw"), labelsPath = arg("--labels");
  const eventId = arg("--event-id"), episodeTag = arg("--episode-tag");
  for (const [k, v] of [["--book-raw", bookRawPath], ["--oracle-raw", oracleRawPath], ["--labels", labelsPath], ["--event-id", eventId], ["--episode-tag", episodeTag]]) {
    if (v === undefined) throw new Error(`u4b-reduce: ${k} is MANDATORY (no episode default — the code is episode-agnostic, C-12)`);
  }
  const outDir = arg("--out") ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4b");
  const outOfRepo = (p) => { const abs = resolve(p); const rel = relative(ROOT, abs); if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error(`u4b-reduce: raw ${abs} must be OUT of repo (CA-11)`); return abs; };
  mkdirSync(outDir, { recursive: true });

  // 1) reduced book: all reserves (+ bonus + emode category) + every account with aWETH + all vDebt > 0.
  const bookRaw = JSON.parse(readFileSync(outOfRepo(bookRawPath), "utf8"));
  const book = bookRaw.book;
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  const aWeth = lc(wr.atoken);
  const vTokens = new Set(book.reserves.map((r) => lc(r.variable_debt_token)));
  const redBook = {
    schema: book.schema, chain_id: book.chain_id, cluster: book.cluster, block: book.block,
    book_digest: bookRaw.provenance.book_digest,
    reserves: book.reserves.map((r) => ({ asset: r.asset, atoken: r.atoken, variable_debt_token: r.variable_debt_token, decimals: r.decimals, liquidation_threshold_bps: r.liquidation_threshold_bps, liquidation_bonus_bps: r.liquidation_bonus_bps, reserve_emode_category: r.reserve_emode_category, price_base_8dec: r.price_base_8dec })),
    accounts: book.accounts.map((a) => ({
      address: a.address, user_config: a.user_config, emode: a.emode,
      balances: a.balances.filter((b) => lc(b.token) === aWeth || (vTokens.has(lc(b.token)) && BigInt(b.amount) > 0n)),
      total_collateral_base: a.total_collateral_base, total_debt_base: a.total_debt_base,
      current_liquidation_threshold_bps: a.current_liquidation_threshold_bps, hf_onchain: a.hf_onchain, eligible_static: a.eligible_static,
    })),
  };
  writeFileSync(join(outDir, `U4b-book-${book.block}.json`), JSON.stringify(redBook) + "\n");

  // 2) oracle path fixture (jsonl): a pre-B₀ ANCHOR line + meta {emode_params:{cat:{lt,bonus}}, usdt_prices, …} +
  //    the AnswerUpdated series. The anchor is the raw's pre-B₀ AnswerUpdated if present (the -1b course fetches
  //    it), else synthesized from the book WETH price @B₀ (the -1a e2 raw has no pre-B₀ event).
  const oRaw = JSON.parse(readFileSync(outOfRepo(oracleRawPath), "utf8"));
  const emodeParams = {};
  for (const [cat, hex] of Object.entries(oRaw.emode_raw)) { if (typeof hex === "string") { const d = decodeEModeCategoryData(hex); emodeParams[cat] = { lt: d.liquidationThresholdBps.toString(), bonus: d.liquidationBonusBps.toString() }; } }
  const p0 = wr.price_base_8dec;
  const preB0 = oRaw.pre_b0_anchor; // { price, block } when the -1b course captured the real AnswerUpdated <= B₀
  const anchor = preB0 !== undefined
    ? { kind: "anchor", block: Number(preB0.block), price: preB0.price, source: "answer_updated_pre_b0" }
    : { kind: "anchor", block: Number(book.block), price: p0, source: "book_weth_price_base_8dec", note: "design anchor = book WETH price @B₀ (this raw path has no pre-B₀ AnswerUpdated); a course that captures the real AnswerUpdated <= B₀ supplies pre_b0_anchor" };
  const meta = { kind: "meta", schema: "ukemi-u4b-oracle/1", event_id: eventId, aggregator_at_b0: oRaw.aggregator.at_b0, aggregator_at_b_last: oRaw.aggregator.at_b_last, phase_change: oRaw.aggregator.phase_change, p_min: oRaw.p_min, p_max: oRaw.p_max, n_updates: oRaw.n_updates, monotone_blocks: oRaw.monotone_blocks, usdt_prices: oRaw.usdt_prices, emode_params: emodeParams };
  const oracleLines = [anchor, meta, ...oRaw.updates.map((u) => ({ kind: "update", block: u.block, log_index: u.logIndex, price: u.price, round_id: u.round_id, updated_at: u.updated_at }))];
  writeFileSync(join(outDir, `U4b-oracle-path-${episodeTag}.jsonl`), oracleLines.map((l) => JSON.stringify(l)).join("\n") + "\n");

  // 3) scores fixture (jsonl): computeScoresU4b output — meta (both cells + strata summaries + census), then the
  //    class-A rows then the class-B rows (canonical). The generator record-u4b-calib.mjs reads the class-A rows.
  const u3 = readFileSync(resolve(labelsPath), "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const oracle = { event_id: eventId, anchor_price: anchor.price, updates: oracleLines.filter((l) => l.kind === "update"), emode_params: emodeParams, usdt_prices: oRaw.usdt_prices };
  const s = computeScoresU4b(redBook, oracle, u3);
  const cellMeta = (c) => ({ predictor_id: c.predictor_id, task_class: c.task_class, alpha: c.alpha, n_min: c.n_min, anchor_price: c.anchor_price, n: c.n, p: c.p, qhat: c.qhat, calib_digest: c.calib_digest, strata: c.strata.map((x) => ({ strate: x.strate, n: x.n, p: x.p, qhat: x.qhat, calib_digest: x.calib_digest, max_score: x.max_score })) });
  const scoreLines = [
    { kind: "meta", cell_a: cellMeta(s.cellA), cell_b: cellMeta(s.cellB), census: s.census },
    ...s.cellA.rows.map((r) => ({ kind: "score_a", ...r })),
    ...s.cellB.rows.map((r) => ({ kind: "score_b", address: r.address, y: r.y, yhat: r.yhat, score: r.score, liquidated: r.liquidated, strate: r.strate })),
  ];
  writeFileSync(join(outDir, `U4b-scores-${episodeTag}.jsonl`), scoreLines.map((l) => JSON.stringify(l)).join("\n") + "\n");

  process.stdout.write(`u4b-reduce: wrote 3 fixtures to ${outDir} for episode ${eventId} (block ${book.block}, tag ${episodeTag}; accounts ${redBook.accounts.length}, cellA n=${s.cellA.n} digest=${s.cellA.calib_digest}, cellB n=${s.cellB.n} digest=${s.cellB.calib_digest})\n`);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
