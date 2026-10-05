#!/usr/bin/env node
// scripts/gen-gate-decision-fixtures.mjs -- FIXTURES-GATE-DECISION-GEN-1 (contract 1.1.0, block C, lot CM-3c-2): writes the nine
// fixtures/NN-*.gate-decision.json states and fixtures/manifest.json (ADR-M002 D1/D11) from gate() of @monark/hikae on declared verdicts
// (q-hat split conformal on the declared scores, digest by the provenance tool). It reproduces the committed files byte for byte
// (test/gate-decision-fixtures-gen.test.ts); block C regenerates them in 1.1.0 from here, never by hand. No network, no clock.
//   node scripts/gen-gate-decision-fixtures.mjs [--write]      (without --write: exit 1 if a committed file differs)
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { gate, buildSetRegion, splitQuantile } from "@monark/hikae";
import { calibDigest } from "./lib/calib-digest-provenance.mjs";

export const FIXTURE_SCHEMA_VERSION = "1.0.0", AT = "2026-09-04T12:00:00Z";
const GOOD = [...Array(47).fill(0), 1, 1, 1], BAD = Array.from({ length: 50 }, (_, i) => (i % 2 === 0 ? 1 : 0)), TEN = [0, 0, 1, 0, 0, 1, 0, 0, 0, 1];

function verdict(scores, labels, abstain = false, reason = "covered") {
  const q = splitQuantile(scores, 0.1, 50); // q-hat 0 on GOOD, 1 on BAD, none (under_calib) on TEN
  return {
    schema_version: FIXTURE_SCHEMA_VERSION, task_class: "btc-dir-15m", method: "hac-cp", alpha: 0.1, n_calib: scores.length,
    region: buildSetRegion(labels), qhat: "qhat" in q ? q.qhat : null, abstain, reason, residual: ["assume:tls-notary", "assume:delegation"],
    scores: [...scores], calib_digest: calibDigest(scores), produced_at: AT,
  };
}

const decide = (v, intent, remainingBudget, timedOut = false) => gate({ intent, verdict: v, remainingBudget, bFloor: 0, tau: 1, tauInterval: 1,
  nCalib: v.n_calib, nMin: 50, clockOpen: true, timedOut, evaluable: true, tool: "perps_order_preview", schemaVersion: FIXTURE_SCHEMA_VERSION });

/** The nine states, file name -> file text (2-space JSON, LF, final newline), and the manifest text (sha256 of each file). */
export function gateDecisionFixtures() {
  const up = verdict(GOOD, ["up"]), both = verdict(BAD, ["up", "down"], false, "set_too_large");
  const states = {
    "01-commit-up": decide(up, "up", 0.1), "02-commit-down": decide(verdict(GOOD, ["down"]), "down", 0.08),
    "03-commit-up-lowbudget": decide(up, "up", 0.02), "04-defer-set-too-large": decide(both, "up", 0.1),
    "05-defer-set-too-large-down": decide(both, "down", 0.06), "06-abstain-intent-not-in-region": decide(up, "down", 0.1),
    "07-abstain-upstream-timeout": decide(verdict(GOOD, [], true, "upstream_timeout"), null, 0.1, true),
    "08-abstain-budget-exhausted": decide(up, "up", -0.02), "09-under-calib": decide(verdict(TEN, [], true, "under_calib"), "up", 0.1),
  };
  const files = Object.fromEntries(Object.entries(states).map(([id, d]) => [`${id}.gate-decision.json`, `${JSON.stringify(d, null, 2)}\n`]));
  const manifest = Object.fromEntries(Object.entries(files).map(([f, t]) => [f, createHash("sha256").update(t, "utf8").digest("hex")]));
  return { files, manifest: `${JSON.stringify(manifest, null, 2)}\n` };
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { files, manifest } = gateDecisionFixtures(), out = { ...files, "manifest.json": manifest }, write = process.argv.includes("--write");
  const at = (f) => new URL(`../fixtures/${f}`, import.meta.url);
  const drift = Object.keys(out).filter((f) => readFileSync(at(f), "utf8").replace(/\r\n/g, "\n") !== out[f]);
  if (write) for (const f of drift) writeFileSync(at(f), out[f]);
  console.log(`gen-gate-decision-fixtures: ${String(drift.length)} file(s) ${write ? "written" : "differ"}${drift.length ? `: ${drift.join(", ")}` : ""}`);
  if (!write && drift.length > 0) process.exitCode = 1;
}
