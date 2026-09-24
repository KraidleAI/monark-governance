// UKEMI — cascade-cluster lattice T (annex) oracles (ADR-U2 L-3). Each test is killed by >= 1 named
// mutant of packages/ukemi/src/lattice.ts, proven red then restored byte-exact (see docs/PLI-lot-u2a.md):
//   m1 `<`->`<=` in applyT        => lattice_lambda_zero_equals_static_liquidable RED (knife-edge HF=1)
//   m2 Picard-up starts at sumB   => lattice_three_fixed_points_counterexample RED (Q_* = 200, not 0)
//   m3 drop the (1 - drop) factor => lattice_lambda_zero_equals_static_liquidable RED (scenario-b: 20 != 50)
//   m4 invert the Prop. 4 predicate => lattice_three_fixed_points_counterexample RED
//   m5 flip the sign of lambda    => lattice_monotone_in_lambda RED (Q^* throws / != 90)
//   m8 swap linear<->exponential  => lattice_linear_bounds_exponential_from_above RED (Q^*_lin != 100)
// + the predictor-id removal: ukemi_package_exports_no_predictor_id (constant reintroduced => RED).
// + a FIXTURE mutant (not a src mutant): altering expected.greatest of a scenario fixture => named test
//   lattice_fixture_expected_values_hold RED (branches the loader's validated-but-unread `expected`; the
//   mutant is restored byte-exact — see docs/PLI-lot-u2a.md annex "pli 2", OBS-1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  applyT,
  smallestFixedPoint,
  greatestFixedPoint,
  noDormantActivation,
  totalDebt,
  positionToCritical,
  liquidableAmount,
  LatticeDomainError,
  type LatticePosition,
  type LatticeState,
  type DemandKind,
  type Position,
} from "../src/index.ts";
import * as ukemiNs from "../src/index.ts";
import { loadPositions } from "./fixtures.ts";

interface LatticeScenario {
  readonly positions: LatticePosition[];
  readonly p0: number;
  readonly drop: number;
  readonly lambda: number;
  readonly demand: DemandKind;
  readonly expected: { smallest: number; greatest: number };
}

function loadLatticeScenario(file: string): LatticeScenario {
  const raw: unknown = JSON.parse(readFileSync(new URL(`./fixtures/${file}`, import.meta.url), "utf8"));
  if (typeof raw !== "object" || raw === null) throw new Error(`scenario ${file}: not an object`);
  const o = raw as Record<string, unknown>;
  const p0 = o["p0"];
  const drop = o["drop"];
  const lambda = o["lambda"];
  const demand = o["demand"];
  const posRaw = o["positions"];
  const exp = o["expected"];
  if (typeof p0 !== "number" || typeof drop !== "number" || typeof lambda !== "number") throw new Error(`scenario ${file}: bad params`);
  if (demand !== "linear" && demand !== "exponential") throw new Error(`scenario ${file}: bad demand`);
  if (!Array.isArray(posRaw)) throw new Error(`scenario ${file}: positions missing`);
  if (typeof exp !== "object" || exp === null) throw new Error(`scenario ${file}: expected missing`);
  const e = exp as Record<string, unknown>;
  const smallest = e["smallest"];
  const greatest = e["greatest"];
  if (typeof smallest !== "number" || typeof greatest !== "number") throw new Error(`scenario ${file}: expected mistyped`);
  const positions = posRaw.map((p: unknown, i): LatticePosition => {
    if (typeof p !== "object" || p === null) throw new Error(`scenario ${file}: position ${String(i)}`);
    const q = p as Record<string, unknown>;
    const pCrit = q["pCrit"];
    const debt = q["debt"];
    if (typeof pCrit !== "number" || typeof debt !== "number") throw new Error(`scenario ${file}: position ${String(i)} mistyped`);
    return { pCrit, debt };
  });
  return { positions, p0, drop, lambda, demand, expected: { smallest, greatest } };
}

function stateOf(s: LatticeScenario, over: Partial<LatticeState> = {}): LatticeState {
  return { positions: s.positions, p0: s.p0, drop: s.drop, lambda: s.lambda, demand: s.demand, ...over };
}

// Lambda = 0 => T is constant => Q_* = Q^* = the static eligible amount (Perez Eq. 3, liquidableAmount).
// The lattice reimplements the strict criterion from (pCrit, B) only (never calls isLiquidable): the
// agreement below is a genuine cross-check against the independent `liquidableAmount`, not a tautology.
test("lattice_lambda_zero_equals_static_liquidable", () => {
  const knife = loadPositions("knife-edge-positions.json");
  const [k1, k2, k3] = knife;
  assert.ok(k1 && k2 && k3);
  // Exact-double pins (ADR-U2 C-4): the derivation's C*price*K grouping matches isLiquidable's, so the
  // strict inequality at HF = 1 is deterministic in IEEE 754 (that is what makes m1's redness reproducible).
  assert.equal(positionToCritical(k1).pCrit, 0.875, "P1 pCrit = 70/(1*100*0.8) = 0.875 exactly");
  assert.equal(positionToCritical(k2).pCrit, 0.4, "P2 pCrit = 20/(2*50*0.5) = 0.4");
  assert.equal(positionToCritical(k3).pCrit, 1.125, "P3 pCrit = 90/(1*100*0.8) = 1.125 exactly");

  const check = (positions: readonly Position[], drops: number[]): void => {
    for (const D of drops) {
      const staticAmt = liquidableAmount(positions, D).liquidableDebt;
      const state: LatticeState = { positions: positions.map(positionToCritical), p0: 1, drop: D, lambda: 0, demand: "linear" };
      assert.equal(smallestFixedPoint(state).value, staticAmt, `Q_* = liquidableAmount at D=${String(D)}`);
      assert.equal(greatestFixedPoint(state).value, staticAmt, `Q^* = liquidableAmount at D=${String(D)}`);
    }
  };
  // knife-edge, incl. the exact HF = 1 shocks 0.125 (P1) and 0.6 (P2): strict '<' => NOT eligible (kills m1).
  check(knife, [0, 0.1, 0.125, 0.2, 0.6, 0.7]);
  // WETH derived fixture (N=2, both solvent): D=0/0.02 empty, 0.03 tips one account, 0.06 tips both.
  check(loadPositions("weth-book-23545087.json"), [0, 0.02, 0.03, 0.06]);
  // scenario-b (pCrit,debt) -> Position via NOTE §0 mapping (qty=debt*p0/pCrit, price=1, K=1), D=0.15 => 50 (kills m3).
  const b = loadLatticeScenario("lattice-scenario-b.json");
  const bAsPositions: Position[] = b.positions.map((p, i) => ({
    id: `b${String(i)}`, collateralQty: (p.debt * b.p0) / p.pCrit, collateralPrice: 1, liqThreshold: 1, debt: p.debt,
  }));
  check(bAsPositions, [b.drop]);
});

// Q^* is non-decreasing in lambda (Lemma 1 + Picard induction), with a STRICT jump scenario A shows.
test("lattice_monotone_in_lambda", () => {
  const a = loadLatticeScenario("lattice-scenario-a.json");
  const at0 = greatestFixedPoint(stateOf(a, { lambda: 0 })).value;
  const at4 = greatestFixedPoint(stateOf(a, { lambda: 0.004 })).value;
  assert.equal(at0, 20, "Q^*(lambda=0) = 20 (only position 1 under water at P=100)");
  assert.equal(at4, 90, "Q^*(lambda=0.004) = 90 (self-fulfilling run)");
  assert.ok(at0 < at4, "STRICT: Q^* increases with lambda (kills m5: a sign flip breaks this)");
  let prev = -1;
  for (const lambda of [0, 0.001, 0.002, 0.004]) {
    const q = greatestFixedPoint(stateOf(a, { lambda })).value;
    assert.ok(q >= prev, `Q^* non-decreasing in lambda (lambda=${String(lambda)})`);
    prev = q;
  }
});

// NOTE §3: 2*lambda*sumB < 1 (the AFM (iii) analogue) does NOT imply uniqueness — three fixed points.
test("lattice_three_fixed_points_counterexample", () => {
  const c = loadLatticeScenario("lattice-scenario-c.json");
  const state = stateOf(c);
  assert.equal(2 * c.lambda * totalDebt(c.positions), 0.4, "2*lambda*sumB = 0.4 < 1, yet not unique");
  // applyT is exported (C-6) so the three fixed points {0, 100, 200} are directly falsifiable:
  assert.equal(applyT(state, 0), 0, "T(0) = 0");
  assert.equal(applyT(state, 100), 100, "T(100) = 100 (the middle fixed point)");
  assert.equal(applyT(state, 200), 200, "T(200) = 200");
  assert.equal(smallestFixedPoint(state).value, 0, "Q_* = 0 (kills m2: Picard-up from sumB gives 200)");
  assert.equal(greatestFixedPoint(state).value, 200, "Q^* = 200 (!= Q_*: non-unique)");
  // Proposition 4 predicate: FALSE here (kills m4), TRUE on scenario-b (the proven-unique case).
  assert.equal(noDormantActivation(state), false, "no-dormant-activation FALSE (dormant pCrit=99 > P_min=80)");
  assert.equal(noDormantActivation(stateOf(loadLatticeScenario("lattice-scenario-b.json"))), true, "no-dormant-activation TRUE on scenario-b");
});

// Theorem 2: staircase Picard reaches the fixed point in <= N+1 iterations (no restart, finite range).
test("lattice_picard_bounded_n_plus_1", () => {
  for (const f of ["lattice-scenario-a.json", "lattice-scenario-b.json", "lattice-scenario-c.json"]) {
    const s = loadLatticeScenario(f);
    const bound = s.positions.length + 1;
    assert.ok(smallestFixedPoint(stateOf(s)).iterations <= bound, `${f}: Q_* within N+1=${String(bound)}`);
    assert.ok(greatestFixedPoint(stateOf(s)).iterations <= bound, `${f}: Q^* within N+1=${String(bound)}`);
  }
  const weth = loadPositions("weth-book-23545087.json").map(positionToCritical);
  const wstate: LatticeState = { positions: weth, p0: 1, drop: 0.06, lambda: 0, demand: "linear" };
  assert.ok(smallestFixedPoint(wstate).iterations <= weth.length + 1, "WETH Q_* within N+1");
  assert.ok(greatestFixedPoint(wstate).iterations <= weth.length + 1, "WETH Q^* within N+1");
});

// ADR-U2 C-8: with matched impact alpha = lambda, 1 - x <= e^-x => P_lin <= P_exp => T_lin >= T_exp
// pointwise => Q_*lin >= Q_*exp and Q^*lin >= Q^*exp (Picard induction). Strict instance kills m8.
test("lattice_linear_bounds_exponential_from_above", () => {
  // positions (pCrit,debt)=(200,50),(55,50), P0=100, lambda=0.005, lambda*sumB=0.5<1. At Q=100:
  // P_lin=50 < 55 <= P_exp=60.65, so the second position tips under LINEAR but not EXPONENTIAL.
  const positions: LatticePosition[] = [{ pCrit: 200, debt: 50 }, { pCrit: 55, debt: 50 }];
  const lin: LatticeState = { positions, p0: 100, drop: 0, lambda: 0.005, demand: "linear" };
  const exp: LatticeState = { positions, p0: 100, drop: 0, lambda: 0.005, demand: "exponential" };
  assert.ok(smallestFixedPoint(lin).value >= smallestFixedPoint(exp).value, "Q_* linear >= exponential");
  assert.ok(greatestFixedPoint(lin).value >= greatestFixedPoint(exp).value, "Q^* linear >= exponential");
  assert.equal(greatestFixedPoint(lin).value, 100, "Q^*_lin = 100 (run under the more aggressive linear drop)");
  assert.equal(greatestFixedPoint(exp).value, 50, "Q^*_exp = 50 (gentler exponential: no run)");
  assert.ok(greatestFixedPoint(lin).value > greatestFixedPoint(exp).value, "STRICT: linear bounds exponential (kills m8)");
});

// Domain guard (NOTE §3 Fact 1): out of domain fails closed with a named error, never a silent number.
test("lattice_domain_fail_closed", () => {
  const over: LatticeState = { positions: [{ pCrit: 50, debt: 600 }, { pCrit: 40, debt: 600 }], p0: 100, drop: 0, lambda: 0.001, demand: "linear" };
  assert.throws(() => smallestFixedPoint(over), LatticeDomainError, "linear lambda*sumB = 1.2 >= 1 fails closed");
  assert.throws(() => applyT(over, 0), LatticeDomainError, "applyT guards the domain too");
  const neg: LatticeState = { positions: [{ pCrit: 90, debt: 10 }], p0: 100, drop: 0, lambda: -0.001, demand: "exponential" };
  assert.throws(() => smallestFixedPoint(neg), LatticeDomainError, "lambda < 0 breaks Lemma 1, fails closed");
  try {
    applyT(over, 0);
    assert.fail("expected a LatticeDomainError");
  } catch (e) {
    assert.equal((e as { name?: string }).name, "lattice_domain", "error name is the documented sentinel");
  }
});

// The WETH fixture is a bit-identical replay of the read-only derivation script (never a cooked answer).
test("lattice_weth_fixture_replays_bit_identical", () => {
  const script = fileURLToPath(new URL("./derive-weth-lattice-fixture.mjs", import.meta.url));
  const committed = readFileSync(new URL("./fixtures/weth-book-23545087.json", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const out = execFileSync(process.execPath, [script], { encoding: "utf8" }).replace(/\r\n/g, "\n");
  const sha = (s: string): string => createHash("sha256").update(s).digest("hex");
  assert.equal(sha(out), sha(committed), "committed WETH fixture = sha256(LF) of the script's stdout");
});

// U-2a / C-7: the package ships no v0 predictor id and no served class — export absent AND source clean.
test("ukemi_package_exports_no_predictor_id", () => {
  assert.ok(!("UKEMI_PREDICTOR_ID" in ukemiNs), "the package no longer exports UKEMI_PREDICTOR_ID");
  const srcDir = fileURLToPath(new URL("../src", import.meta.url));
  const forbidden = ["internal:ukemi-cascade-v0", "cascade-liquidable-24h"];
  for (const file of readdirSync(srcDir)) {
    if (!file.endsWith(".ts")) continue;
    const text = readFileSync(join(srcDir, file), "utf8");
    for (const tok of forbidden) assert.ok(!text.includes(tok), `${file} must not contain "${tok}" (reintroduced constant would redden)`);
  }
});

// OBS-1 (docs/G2-lot-u2a.md): loadLatticeScenario VALIDATES `expected: {smallest, greatest}` (throws if
// absent/mistyped) yet nothing asserted it — a's 20/90 and c's 0/200 are pinned above as hard-coded literals
// (lattice_monotone_in_lambda, lattice_three_fixed_points_counterexample), while b's 50/50 is cross-checked
// against the independent liquidableAmount (lattice_lambda_zero_equals_static_liquidable) — so THIS test is
// the first to assert b's 50/50 literally. Those guards STAY (double guard). This parameterized test
// BRANCHES `expected`: for every fixture that carries it, Q_* and Q^* under the fixture's OWN declared lambda
// and demand must equal expected.smallest / expected.greatest. A future scenario with a wrong (well-typed)
// `expected` now reddens here — the "validated but never read" gap OBS-1 named. Fixtures a/b/c already carry
// lambda+demand; the WETH book fixture carries no `expected`, so it is skipped (and must stay so: it is pinned
// bit-identical to the derivation script by lattice_weth_fixture_replays_bit_identical).
test("lattice_fixture_expected_values_hold", () => {
  const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url));
  const checked: string[] = [];
  for (const file of readdirSync(fixturesDir)) {
    if (!file.endsWith(".json")) continue;
    const raw: unknown = JSON.parse(readFileSync(join(fixturesDir, file), "utf8"));
    if (typeof raw !== "object" || raw === null) continue;
    const o = raw as Record<string, unknown>;
    if (!("expected" in o)) continue;
    // Fail-closed: a fixture that carries `expected` IS a lattice scenario; loadLatticeScenario throws if it
    // is malformed (never a silent skip — a silent skip is the very gap OBS-1 flagged).
    const s = loadLatticeScenario(file);
    const state = stateOf(s);
    assert.equal(smallestFixedPoint(state).value, s.expected.smallest,
      `${file}: Q_* == expected.smallest (${String(s.expected.smallest)}) under declared lambda=${String(s.lambda)} ${s.demand}`);
    assert.equal(greatestFixedPoint(state).value, s.expected.greatest,
      `${file}: Q^* == expected.greatest (${String(s.expected.greatest)}) under declared lambda=${String(s.lambda)} ${s.demand}`);
    checked.push(file);
  }
  // Non-vacuity: the three scenario fixtures MUST each be discovered and asserted, so the parameterized test
  // can never silently degrade to checking nothing (which would re-create the unbranched state OBS-1 named).
  for (const f of ["lattice-scenario-a.json", "lattice-scenario-b.json", "lattice-scenario-c.json"]) {
    assert.ok(checked.includes(f), `${f} must be discovered and asserted (it carries expected)`);
  }
});
