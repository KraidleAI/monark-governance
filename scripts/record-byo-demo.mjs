#!/usr/bin/env node
// scripts/record-byo-demo.mjs — reproducible recorder for the Lot M006 D10 bring-your-own (BYO) demo
// (ADR-M006 D10). Drives the harness IN-PROCESS over the real MCP tools/call wire (streamable-HTTP) and
// writes the captured calibrate -> gate -> audit chain to fixtures/byo-demo-trace.json (deterministic —
// the tools read no clock, the ephemeral port is not recorded). Prints the LF sha256, which is pinned in
// test/byo-demo-probe.test.ts and stated in fixtures/PROVENANCE-byo-demo.md. The probe re-drives the SAME
// chain in-process and deep-equals it.
//
//   node scripts/record-byo-demo.mjs
//
// The agent does NOT commit (R-20); the orchestrator commits the produced fixture + provenance.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildByoTrace, sha256Lf } from "../test/byo-demo-builder.ts";

const OUT = fileURLToPath(new URL("../fixtures/byo-demo-trace.json", import.meta.url));

const trace = await buildByoTrace();
const text = JSON.stringify(trace, null, 2) + "\n";
writeFileSync(OUT, text);
console.log(`wrote ${OUT}`);
console.log(`bytes: ${Buffer.byteLength(text)}`);
console.log(`sha256(LF): ${sha256Lf(text)}`);
