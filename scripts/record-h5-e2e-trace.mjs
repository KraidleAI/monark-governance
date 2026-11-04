#!/usr/bin/env node
// scripts/record-h5-e2e-trace.mjs — the recorder of fixtures/h5-e2e-trace.json (fixtures/PROVENANCE-h5-e2e-trace.md). It drives
// the harness in process over the real MCP tools/call wire (streamable HTTP) and the HTTP/JSON mirror, and writes the captured
// chain (deterministic: the tools read no clock, the ephemeral port is not recorded). It prints the LF sha256, pinned in
// test/h5-e2e-probe.test.ts and in the PROVENANCE file; the probe drives the same chain live and deep-equals it.
//
//   node scripts/record-h5-e2e-trace.mjs
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
