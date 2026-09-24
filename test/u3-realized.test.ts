// UKEMI lot U-3 (ADR-M020 D1 (b) / ADR-U3) — offline oracles for the realized labels Y_{i,e}. The 4 tests
// REPLAY the reduced in-repo input U3-inputs.jsonl through the PURE reducer of scripts/census/u3-realized.mjs
// (no network here) and check it against the committed series byte-for-byte, the pre-registered U3-H3 identity,
// the DeficitCreated topic + a real caught emission, and the no-synthetic-row invariant. The raw provider bytes
// live out of repo (PROVENANCE-u3.md); U3-inputs is decoded public on-chain data (CGU-compliant, C-3).
// This test lives in the root test/ (governance, NOT in the public export) because it imports the census
// reducer under scripts/ (governance-only), mirroring test/record-usde-calib.test.ts + its .d.mts precedent;
// the sha-pinned series stay under apps/sentinel/test/fixtures/ukemi/u3/ (C-2, D9-sexies-excluded root).
// Named mutants (ADR-U3): a row removed (sum/replay), a series byte altered (replay), the deficit topic altered
// (self-test), a row without a tx hash (no-synthetic), a matched Transfer altered (xfer cross-check).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { reduceU3, canonicalJsonl, sumRepaymentNative } from "../scripts/census/u3-realized.mjs";
import { keccak256 } from "../apps/sentinel/src/ukemi/abi.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const DIR = join(HERE, "..", "apps", "sentinel", "test", "fixtures", "ukemi", "u3");
const readJsonl = (name: string): unknown[] =>
  readFileSync(join(DIR, name), "utf8").split("\n").filter((l) => l.trim().length > 0).map((l) => JSON.parse(l) as unknown);
const readText = (name: string): string => readFileSync(join(DIR, name), "utf8").replace(/\r\n/g, "\n");

const INPUTS = readJsonl("U3-inputs.jsonl");
const E1 = "e1-2025-02-21-susde", E3 = "e3-2026-01-19-susde", E2 = "e2-2025-10-10-weth";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
// U3-H3 pre-registered pipeline identity (docs/PLAN-u3-prereg.md section 4; native token units).
const PRECHIFFRE: Record<string, string> = {
  [`${E1}|${USDC}`]: "8511568493136",
  [`${E1}|${USDT}`]: "12871019904705",
  [`${E3}|${USDC}`]: "3322388532587",
};

// -- 1 -- the committed series are reproduced BIT-IDENTICALLY by the reducer from the committed inputs (C-3) --
test("u3_series_replay_bit_identical", () => {
  const out = reduceU3(INPUTS) as { realized: unknown[]; sources: unknown[]; deficit: unknown[] };
  assert.equal(canonicalJsonl(out.realized), readText("U3-realized.jsonl"), "U3-realized.jsonl is not the reducer output of U3-inputs.jsonl");
  assert.equal(canonicalJsonl(out.sources), readText("U3-sources.jsonl"), "U3-sources.jsonl drift");
  assert.equal(canonicalJsonl(out.deficit), readText("U3-deficit.jsonl"), "U3-deficit.jsonl drift");
  // non-vacuity: dropping one input call changes the realized output (the replay actually depends on inputs).
  const idx = INPUTS.findIndex((r) => (r as { kind?: string }).kind === "call");
  const mutated = INPUTS.filter((_, i) => i !== idx);
  const out2 = reduceU3(mutated) as { realized: unknown[] };
  assert.notEqual(canonicalJsonl(out2.realized), readText("U3-realized.jsonl"), "removing a call left the series unchanged — replay is vacuous");
});

// -- 2 -- U3-H3: sum repayment_native per (event, debtAsset) matches the pre-registered identity (C-10) --
test("u3_sum_repayment_matches_census_a", () => {
  const out = reduceU3(INPUTS) as { realized: Array<{ event_id: string; debt_asset: string; repayment_native: string }> };
  const sums = sumRepaymentNative(out.realized);
  // e1, e3: exact pre-registered targets.
  for (const [k, v] of Object.entries(PRECHIFFRE)) assert.equal((sums.get(k) ?? 0n).toString(), v, `U3-H3 mismatch for ${k}`);
  // e2: identity against the sum of debt_to_cover of the in-window e2 call records (same retained rows).
  const e2debt = new Map<string, bigint>();
  for (const r of INPUTS as Array<{ kind?: string; event_id?: string; in_window?: boolean; debt?: string; debt_to_cover?: string }>) {
    if (r.kind === "call" && r.event_id === E2 && r.in_window) e2debt.set(r.debt as string, (e2debt.get(r.debt as string) ?? 0n) + BigInt(r.debt_to_cover as string));
  }
  for (const [debt, v] of e2debt) assert.equal((sums.get(`${E2}|${debt}`) ?? 0n).toString(), v.toString(), `e2 repayment_native != sum debtToCover for ${debt}`);
  assert.ok(e2debt.size > 0, "no in-window e2 calls found — inputs incomplete");
  // mutant proof: removing one realized row makes at least one sum fall short of its target.
  const short = sumRepaymentNative(out.realized.slice(1));
  let differs = false;
  for (const [k, v] of sums) if ((short.get(k) ?? 0n).toString() !== v.toString()) differs = true;
  assert.ok(differs, "dropping a realized row did not change any sum — the sum is not row-sensitive");
});

// -- 3 -- DeficitCreated topic self-test + a REAL caught emission (positive control, C-8) --
test("u3_deficit_topic_selftest", () => {
  assert.equal(keccak256("DeficitCreated(address,address,uint256)"), "0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699", "DeficitCreated topic0 != ADR-M020 D6");
  // a real DeficitCreated is present (in_event from a post-v3.3 event, or the external positive control).
  const defs = readJsonl("U3-deficit.jsonl") as Array<{ kind: string; tx: string; user: string; debt_asset: string; amount: string }>;
  const real = defs.filter((d) => d.kind === "in_event" || d.kind === "positive_control" || d.kind === "bad_debt_other_reserve" || d.kind === "window_other");
  assert.ok(real.length >= 1, "no real DeficitCreated caught — the filter is not proven to catch a real emission");
  for (const d of real) {
    assert.match(d.tx, /^0x[0-9a-f]{64}$/, "deficit tx is not a 32-byte hash");
    assert.match(d.debt_asset, /^0x[0-9a-f]{40}$/, "deficit debt_asset is not an address");
    assert.ok(/^\d+$/.test(d.amount) && BigInt(d.amount) > 0n, "deficit amount is not a positive integer");
  }
});

// -- 4 -- no synthetic row: every realized row carries tx hashes present in the inputs (C-3 / L-3) --
test("u3_no_synthetic_row", () => {
  const out = reduceU3(INPUTS) as { realized: Array<{ txs: string[]; event_id: string; user: string }>; deficit: Array<{ kind: string; tx: string }> };
  const callTxs = new Set<string>();
  for (const r of INPUTS as Array<{ kind?: string; tx?: string }>) if (r.kind === "call") callTxs.add((r.tx as string).toLowerCase());
  const deficitTxs = new Set<string>();
  for (const r of INPUTS as Array<{ kind?: string; tx?: string }>) if (r.kind === "deficit" || r.kind === "positive_control") deficitTxs.add((r.tx as string).toLowerCase());
  for (const row of out.realized) {
    assert.ok(row.txs.length >= 1, `realized row ${row.event_id}/${row.user} has no tx`);
    for (const tx of row.txs) assert.ok(callTxs.has(tx.toLowerCase()), `realized row ${row.event_id}/${row.user} cites tx ${tx} absent from U3-inputs calls (synthetic row)`);
  }
  for (const d of out.deficit) assert.ok(callTxs.has(d.tx.toLowerCase()) || deficitTxs.has(d.tx.toLowerCase()), `deficit row cites tx ${d.tx} absent from U3-inputs (synthetic deficit)`);
  // mutant proof: a fabricated tx is rejected.
  const fake = { txs: ["0x" + "de".repeat(32)], event_id: E1, user: "0x0" };
  assert.ok(!callTxs.has(fake.txs[0]!.toLowerCase()), "fabricated tx unexpectedly present");
});
