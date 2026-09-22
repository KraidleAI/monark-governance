/**
 * Sentinel — the EQUALITY ORACLE for the pure producer `fromRealizedBook` (@monark/monark) against the FROZEN
 * scorer scripts/census/u4b/u4b-scores.mjs (U-5a; decision 123/132; checkpoint-1 C-4; G0 §2.2).
 *
 * It must live in the SENTINEL and is EXPORT-EXCLUDED (scripts/export-exclude-tests.json) because it (a) imports
 * the frozen scorer, which reads node:fs + apps/sentinel, and (b) reads the export-excluded U-4b fixtures
 * (U4b-book-23545087.json 7.5 MB / U4b-oracle-path-e2.jsonl / U4b-scores-e2.jsonl, decision 111).
 *
 * Oracle A: `fromRealizedBook` == the 565 committed `score_a` rows, bigint exact on {yhat, m_bps, pstar}, and
 *           strateOf(yhat) == the row `strate` (the served strateOf, apps/harness/src/ukemi-strata.ts — no
 *           third copy; C-1).
 * Oracle B: `computeScoresU4b` run LIVE over all 16 096 accounts; for every cell-A row `fromRealizedBook`
 *           matches yhat/m_bps/pstar, and for every OTHER account it does NOT produce a positive yhat (no
 *           false positive) — the two-sided "yhat or named refusal" of the mission.
 * Anti-drift: the reduced PUBLIC slice's embedded expectations == the committed `score_a` for those addresses.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { fromRealizedBook, isRealizedError } from "@monark/monark";
import type { RealizedBookSlice, RealizedOracleParams } from "@monark/monark";
import { strateOf } from "../../harness/src/ukemi-strata.ts";
import { computeScoresU4b } from "../../../scripts/census/u4b/u4b-scores.mjs";
import type { U4bBook, U4bOracle, U4bU3Line, U4bAccount } from "../../../scripts/census/u4b/u4b-scores.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const U4B = join(HERE, "fixtures", "ukemi", "u4b");
const U3 = join(HERE, "fixtures", "ukemi", "u3", "U3-realized.jsonl");
const U5A = join(HERE, "fixtures", "ukemi", "u5a", "U5a-book-slice.json");

interface ScoreA { kind: string; address: string; yhat: string; m_bps: string | null; pstar: string | null; strate: number }
type OracleFileLine =
  | { kind: "anchor"; price: string }
  | { kind: "meta"; event_id: string; emode_params: Record<string, { lt: string; bonus: string }>; usdt_prices: Record<string, string> }
  | { kind: "update"; block: number; log_index: number; price: string; round_id?: string; updated_at?: string };

function jsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as T);
}

const book = JSON.parse(readFileSync(join(U4B, "U4b-book-23545087.json"), "utf8")) as U4bBook;
const oLines = jsonl<OracleFileLine>(join(U4B, "U4b-oracle-path-e2.jsonl"));
const scoreA = jsonl<ScoreA>(join(U4B, "U4b-scores-e2.jsonl")).filter((s) => s.kind === "score_a");
const anchor = oLines.find((l): l is Extract<OracleFileLine, { kind: "anchor" }> => l.kind === "anchor");
const meta = oLines.find((l): l is Extract<OracleFileLine, { kind: "meta" }> => l.kind === "meta");
const updates = oLines.filter((l): l is Extract<OracleFileLine, { kind: "update" }> => l.kind === "update");
if (anchor === undefined || meta === undefined) throw new Error("oracle path is missing its anchor or meta line");

const params: RealizedOracleParams = { anchor_price: anchor.price, updates, emode_params: meta.emode_params };
const byAddr = new Map<string, U4bAccount>();
for (const a of book.accounts) byAddr.set(a.address.toLowerCase(), a);
const sliceOf = (account: U4bAccount): RealizedBookSlice => ({ reserves: book.reserves, account });

test("u5_producer_yhat_equals_frozen_on_all_score_a", () => {
  assert.equal(scoreA.length, 565, "565 committed score_a rows");
  let checked = 0;
  for (const row of scoreA) {
    const account = byAddr.get(row.address.toLowerCase());
    assert.ok(account !== undefined, `account for ${row.address}`);
    if (account === undefined) continue;
    const r = fromRealizedBook(sliceOf(account), params);
    assert.ok(!isRealizedError(r), `${row.address}: evaluable`);
    if (isRealizedError(r)) continue;
    assert.equal(r.yhat, BigInt(row.yhat), `${row.address}: yhat (bigint exact)`);
    assert.equal(r.m_bps, row.m_bps, `${row.address}: m_bps`);
    assert.equal(r.pstar, row.pstar, `${row.address}: pstar`);
    // strate is derived DOWNSTREAM (harness ukemi-strata); assert it here at the served function (C-1).
    assert.equal(strateOf(Number(r.yhat)), row.strate, `${row.address}: strateOf(yhat) == row.strate`);
    checked++;
  }
  assert.equal(checked, 565, "all 565 rows checked");
});

test("u5_producer_equals_frozen_module_all_accounts", () => {
  // Oracle B: run the FROZEN module LIVE, then compare the producer on ALL 16 096 accounts (two-sided).
  const u3 = jsonl<U4bU3Line>(U3);
  const oracle: U4bOracle = { event_id: meta.event_id, anchor_price: anchor.price, updates, emode_params: meta.emode_params, usdt_prices: meta.usdt_prices };
  const out = computeScoresU4b(book, oracle, u3);
  const cellA = new Map<string, { yhat: string; m_bps: string | null; pstar: string | null }>();
  for (const row of out.cellA.rows) cellA.set(row.address.toLowerCase(), { yhat: row.yhat, m_bps: row.m_bps, pstar: row.pstar });
  // The live frozen cell A must be EXACTLY the committed score_a set (frozen-module-LIVE <-> committed fixture link).
  assert.equal(cellA.size, scoreA.length, `live frozen cell A (${cellA.size}) == committed score_a (${scoreA.length})`);

  let inCell = 0;
  let others = 0;
  for (const account of book.accounts) {
    const r = fromRealizedBook(sliceOf(account), params);
    const row = cellA.get(account.address.toLowerCase());
    if (row !== undefined) {
      assert.ok(!isRealizedError(r), `${account.address}: in cell A ⇒ evaluable`);
      if (isRealizedError(r)) continue;
      assert.equal(r.yhat, BigInt(row.yhat), `${account.address}: yhat == frozen`);
      assert.equal(r.m_bps, row.m_bps, `${account.address}: m_bps == frozen`);
      assert.equal(r.pstar, row.pstar, `${account.address}: pstar == frozen`);
      inCell++;
    } else {
      // Not in cell A ⇒ the producer must NOT invent a positive yhat (a refusal or a legitimate yhat 0).
      assert.ok(isRealizedError(r) || r.yhat === 0n, `${account.address}: not in cell A ⇒ no positive yhat (no false positive)`);
      others++;
    }
  }
  assert.equal(inCell, cellA.size, "every cell-A row matched by the producer");
  assert.equal(inCell + others, book.accounts.length, "all 16 096 accounts visited");
});

test("u5_reduced_slice_expectations_match_committed_score_a", () => {
  // Anti-drift (checkpoint-1 C-4): the reduced PUBLIC slice's embedded expectations equal the committed score_a
  // for those addresses (so the public tool test cannot drift from the frozen truth).
  interface Case { label: string; account: { address: string }; expect: { yhat?: string; m_bps?: string | null; pstar?: string | null; strate?: number; refusal?: string } }
  const fx = JSON.parse(readFileSync(U5A, "utf8")) as { cases: Case[] };
  const saByAddr = new Map<string, ScoreA>();
  for (const s of scoreA) saByAddr.set(s.address.toLowerCase(), s);
  let evalChecked = 0;
  for (const c of fx.cases) {
    if (c.expect.refusal !== undefined) {
      assert.ok(!saByAddr.has(c.account.address.toLowerCase()), `${c.label}: refusal account is not an evaluable score_a row`);
      continue;
    }
    const row = saByAddr.get(c.account.address.toLowerCase());
    assert.ok(row !== undefined, `${c.label}: has a committed score_a row`);
    if (row === undefined) continue;
    assert.equal(c.expect.yhat, row.yhat, `${c.label}: fixture yhat == committed`);
    assert.equal(c.expect.m_bps ?? null, row.m_bps, `${c.label}: fixture m_bps == committed`);
    assert.equal(c.expect.pstar ?? null, row.pstar, `${c.label}: fixture pstar == committed`);
    assert.equal(c.expect.strate, row.strate, `${c.label}: fixture strate == committed`);
    evalChecked++;
  }
  assert.ok(evalChecked >= 4, "at least four evaluable cases cross-checked against the committed fixture");
});
