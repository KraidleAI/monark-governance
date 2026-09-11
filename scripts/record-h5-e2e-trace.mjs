#!/usr/bin/env node
// scripts/record-h5-e2e-trace.mjs — reproducible recorder for the Lot H5 end-to-end demonstration
// (ADR-M005 H5 / C-6, docs/PLAN-harnais-lot.md H5). Drives the harness IN-PROCESS over the real MCP
// tools/call wire (streamable-HTTP) + the HTTP/JSON mirror, and writes the captured chain to
// fixtures/h5-e2e-trace.json (deterministic — the tools read no clock, the ephemeral port is not
// recorded). Prints the LF sha256, which is pinned in test/h5-e2e-probe.test.ts and stated in
// fixtures/PROVENANCE-h5-e2e-trace.md. The probe re-drives the SAME chain live and deep-equals it.
//
//   node scripts/record-h5-e2e-trace.mjs
//
// The agent does NOT commit (R-20); the orchestrator commits the produced fixture + provenance.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildTrace, sha256Lf } from "../test/h5-trace-builder.ts";

const OUT = fileURLToPath(new URL("../fixtures/h5-e2e-trace.json", import.meta.url));

const trace = await buildTrace();
const text = JSON.stringify(trace, null, 2) + "\n";
writeFileSync(OUT, text);
console.log(`wrote ${OUT}`);
console.log(`bytes: ${Buffer.byteLength(text)}`);
console.log(`sha256(LF): ${sha256Lf(text)}`);
