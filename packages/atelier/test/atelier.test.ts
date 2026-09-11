import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import {
  loadRootFixtures,
  buildState,
  distribution,
  renderAll,
  renderState,
  plusMinutes,
  perps_order_preview,
  perps_order_execute,
  PERPS_ORDER_PREVIEW,
  PERPS_ORDER_EXECUTE,
} from "../src/index.ts";
import type { GateDecision } from "@monark/contracts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const FIX = join(ROOT, "fixtures");
const PKG = join(ROOT, "packages", "atelier");

// Test 24 (ADR-M002 D11) — pure state module: oracle over each of the 9 root states.
test("atelier_state_oracle", () => {
  const states = loadRootFixtures(FIX);
  assert.equal(states.length, 9);
  assert.deepEqual(distribution(states), { COMMIT: 3, DEFER: 2, ABSTAIN: 3, under_calib: 1 });
  for (const s of states) {
    const raw = JSON.parse(readFileSync(join(FIX, `${s.id}.gate-decision.json`), "utf8")) as GateDecision;
    assert.equal(s.decision, raw.action.toUpperCase(), `${s.id}: decision = action`);
    assert.equal(s.reason, raw.reason);
    assert.equal(s.allow, raw.allow);
    assert.equal(s.remainingBudget, raw.remaining_budget, "B_t = remaining_budget, never recomputed");
    assert.equal(s.clocks.coverageAt, raw.verdict.produced_at, "clock 1: coverage before decision");
    assert.equal(s.clocks.labelAt, plusMinutes(raw.verdict.produced_at, 15), "clock 2: label at t+15 min");
    assert.ok(Date.parse(s.clocks.labelAt) > Date.parse(s.clocks.coverageAt));
    assert.deepEqual([...s.shogen.residual], raw.verdict.residual, "residual carried, not invented");
    assert.equal(s.ukemi.status, "not-wired-phase1");
    // HIKAE panel: each numeric/textual field is bound to the raw verdict (review corr. 1 —
    // a swap `alpha := n_calib` used to pass tsc + tests; now red).
    assert.equal(s.hikae.method, raw.verdict.method, `${s.id}: method`);
    assert.equal(s.hikae.alpha, raw.verdict.alpha, `${s.id}: alpha`);
    assert.equal(s.hikae.nCalib, raw.verdict.n_calib, `${s.id}: n_calib`);
    assert.equal(s.hikae.qhat, typeof raw.verdict.qhat === "number" ? raw.verdict.qhat : null, `${s.id}: qhat`);
    const reg = raw.verdict.region;
    const expectedRegion =
      reg === undefined || reg === null ? "—" : reg.kind === "set" ? `{${reg.labels.join(", ")}}` : `[${reg.lo}, ${reg.hi}]`;
    assert.equal(s.hikae.region, expectedRegion, `${s.id}: region derived from raw verdict`);
  }
  // Named oracles.
  const byId = new Map(states.map((s) => [s.id, s]));
  assert.equal(byId.get("01-commit-up")?.hikae.region, "{up}");
  assert.equal(byId.get("04-defer-set-too-large")?.hikae.region, "{up, down}");
  assert.equal(byId.get("09-under-calib")?.decision, "ABSTAIN");
  assert.equal(plusMinutes("2026-09-04T12:00:00Z", 15), "2026-09-04T12:15:00Z");
  // A non-closed decision (foreign key) is REFUSED by the contract before any render.
  const raw = JSON.parse(readFileSync(join(FIX, "01-commit-up.gate-decision.json"), "utf8")) as GateDecision;
  assert.throws(() => buildState("x", { ...raw, p_correct: 0.9 } as unknown as GateDecision));
});

// Test 25 — the 9 states are all rendered, each identifiable and visible in the HTML.
test("atelier_replays_root_fixtures", () => {
  const states = loadRootFixtures(FIX);
  const html = renderAll(states);
  for (const s of states) {
    assert.ok(html.includes(`data-state="${s.id}"`), `${s.id} rendered`);
    assert.ok(html.includes(`<h2>${s.id}</h2>`));
  }
  assert.equal((html.match(/<section class="state"/g) ?? []).length, 9);
  assert.equal((html.match(/class="badge badge-commit"/g) ?? []).length, 3 * 2, "3 COMMIT x (header + decision)");
  assert.equal((html.match(/class="badge badge-defer"/g) ?? []).length, 2 * 2);
  assert.equal((html.match(/class="badge badge-abstain"/g) ?? []).length, 4 * 2, "3 ABSTAIN + 1 under_calib");
  assert.ok(html.includes("coverage before decision") && html.includes("label arrived at t+w"), "two named clocks");
  assert.ok(html.includes("B<sub>t</sub> remaining"), "budget visible");
  assert.ok(html.includes("Shōgen") && html.includes("HIKAE") && html.includes("UKEMI"), "three panels");
  // Escaping: a hostile id does not inject.
  const first = states[0];
  assert.ok(first);
  const hostile = renderState({ ...first, id: `<img src=x onerror=1>` }, 0);
  assert.ok(!hostile.includes("<img"), "id escaped");
});

// Test 26 — the WHOLE atelier package and the render pass the vocab gate; a mutant makes it red.
test("atelier_no_forbidden_vocab", () => {
  const gate = join(ROOT, "scripts", "grep-forbidden.mjs");
  const tmp = mkdtempSync(join(tmpdir(), "atelier-vocab-"));
  const rendered = join(tmp, "rendered.html");
  writeFileSync(rendered, renderAll(loadRootFixtures(FIX)), "utf8");
  execFileSync("node", [gate, PKG, rendered], { stdio: "pipe" }); // exit 0 otherwise throws
  const mutant = join(tmp, "mutant.html");
  // Assembled in pieces: the gate also scans THIS file and must not go red on the test's source.
  writeFileSync(mutant, ["<p>", "95", " % de fills ", "corr", "ects</p>"].join(""), "utf8");
  assert.throws(() => execFileSync("node", [gate, mutant], { stdio: "pipe" }), "the gate must go red on the mutant");
});

// Test 27 — the two names gated by HIKAE exist here as stubs that THROW.
test("perps_stubs_throw", () => {
  assert.equal(PERPS_ORDER_PREVIEW, "perps_order_preview");
  assert.equal(PERPS_ORDER_EXECUTE, "perps_order_execute");
  assert.throws(() => perps_order_preview(), /no order/);
  assert.throws(() => perps_order_execute(), /no order/);
  // The fixtures name exactly these tools — and nothing else.
  for (const s of loadRootFixtures(FIX)) assert.ok([PERPS_ORDER_PREVIEW, PERPS_ORDER_EXECUTE].includes(s.tool));
});

// Test 28 — zero network: grep = 0 outside tests; `fetch` trapped during the replay of the 9 states.
test("atelier_no_network", () => {
  const NET = /fetch|XMLHttpRequest|WebSocket|http\.request|net\.connect/;
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      if (statSync(p).isDirectory()) return n === "test" || n === "node_modules" ? [] : walk(p);
      return [".ts", ".js", ".html", ".css"].includes(extname(p)) ? [p] : [];
    });
  const files = walk(PKG);
  assert.ok(files.length >= 8, "non-empty scanned surface");
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split(/\r?\n/);
    lines.forEach((l, i) => assert.ok(!NET.test(l), `${f}:${i + 1}: network call forbidden`));
  }
  const g = globalThis as { fetch?: unknown };
  const saved = g.fetch;
  let called = 0;
  g.fetch = () => {
    called += 1;
    throw new Error("network forbidden during replay");
  };
  try {
    const html = renderAll(loadRootFixtures(FIX));
    assert.ok(html.length > 0);
  } finally {
    g.fetch = saved;
  }
  assert.equal(called, 0, "fetch never invoked during replay");
});
