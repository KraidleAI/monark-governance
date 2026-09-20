// Derives packages/ukemi/test/fixtures/weth-book-23545087.json from the REAL recorded WETH book
// (ADR-U2 L-2 / C-2). It REPLAYS the sentinel-2 recorder over its committed offline fixture (read-only)
// and maps each recorded at-risk account to a static `Position` for the cascade-cluster lattice:
//
//   P0 := 1 (multiplier convention) ;
//   collateralQty  = total_collateral_base   (base currency, 8-dec integer -> Number, exact < 2^53)
//   collateralPrice = 1
//   liqThreshold   = current_liquidation_threshold_bps / 1e4
//   debt           = total_debt_base
//   => pCrit_i = debt / (collateralQty * collateralPrice * liqThreshold) = B_i/(C_i*K_i) ~= 1/hf_onchain.
//
// CAVEAT (declared, honest): total_collateral_base is the account's collateral over ALL reserves
// (getUserAccountData), so a shock here is applied to the WHOLE account's collateral -- the same v0
// simplification as apps/harness/src/tools/cascade.ts:31. The reduced fixture holds N = 2 at-risk WETH
// loopers, BOTH solvent at block 23545087 (eligible = 0); the victim_vector (eligible at B+1) is NOT in
// recordBook's output and is NOT included. Importing apps/sentinel from a package TEST/SCRIPT (never from
// packages/ukemi/src) follows the precedent packages/monark/test/adapter-book.test.ts:30-32.
//
// The output is printed to stdout (LF); the committed fixture is that exact output. The test
// `lattice_weth_fixture_replays_bit_identical` re-runs this script and compares the sha256 of the
// LF-normalized bytes -- a green test is a re-derivation, not a fixture that cooked its own answer.
import { readFileSync } from "node:fs";
import { recordBook } from "../../../apps/sentinel/src/ukemi/book.ts";
import { CLUSTER_WETH } from "../../../apps/sentinel/src/ukemi/clusters.ts";

const FX = JSON.parse(
  readFileSync(new URL("../../../apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json", import.meta.url), "utf8"),
);

// A reader over the recorded eth_call/getLogs bytes (redeclared here; the sentinel test's `fixtureReader`
// is not exported). No network, one block.
function fixtureReader() {
  return {
    ethCall(to, data) {
      const key = `${to.toLowerCase()}|${data.toLowerCase()}`;
      const value = FX.calls[key];
      return value === undefined ? Promise.reject(new Error(`fixture miss ${key}`)) : Promise.resolve(value);
    },
    getLogsRange() {
      return Promise.resolve(FX.enumeration_logs);
    },
    blockAt() {
      return Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts });
    },
    finalized() {
      return Promise.resolve({ block: FX.finalized_block, ts: FX.block_ts });
    },
  };
}

const recorded = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());

const positions = recorded.book.accounts.map((account) => ({
  id: account.address,
  collateralQty: Number(account.total_collateral_base),
  collateralPrice: 1,
  liqThreshold: Number(account.current_liquidation_threshold_bps) / 1e4,
  debt: Number(account.total_debt_base),
}));

// Cross-check: pCrit_i should equal 1/(hf_onchain/1e18) (both are 1/HF at P0); reported for provenance.
const crossCheck = recorded.book.accounts.map((account, i) => {
  const p = positions[i];
  const pCrit = p.debt / (p.collateralQty * p.collateralPrice * p.liqThreshold);
  const oneOverHf = 1 / (Number(account.hf_onchain) / 1e18);
  return { pCrit, one_over_hf: oneOverHf, rel_diff: Math.abs(pCrit - oneOverHf) / pCrit };
});

const fixture = {
  name: "weth-book-lattice-23545087",
  note:
    "REAL WETH book (Aave v3 core, block 23545087) replayed from apps/sentinel/test/fixtures/ukemi/" +
    "weth-book.fixture.json by packages/ukemi/test/derive-weth-lattice-fixture.mjs (ADR-U2 L-2). " +
    "N=2 at-risk accounts, both solvent (eligible_static=0). Mapping P0:=1, collateralQty=total_collateral_base, " +
    "collateralPrice=1, liqThreshold=current_liquidation_threshold_bps/1e4, debt=total_debt_base; " +
    "pCrit=debt/(collateralQty*collateralPrice*liqThreshold)=B/(C*K)~=1/hf_onchain. CAVEAT: collateral is over " +
    "ALL reserves, so the shock hits the whole account (same v0 simplification as harness cascade.ts:31). " +
    "See PROVENANCE-weth-book-lattice.md.",
  source_fixture: "apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json",
  block: recorded.book.block,
  book_digest: recorded.book_digest,
  counts: recorded.counts,
  positions,
  cross_check_1_over_hf: crossCheck,
};

process.stdout.write(JSON.stringify(fixture, null, 2) + "\n");
