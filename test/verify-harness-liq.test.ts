/**
 * Root test (HARNESS-DESC-1, checkpoint-1 C-5): the deployment CA `scripts/verify-harness.mjs` proves the
 * liquidation-eligible-coverage class on the SERVED surface -- `gate_liq_call` (POST /gate: 200, under_calib, the
 * empty-registry sentence in `content`) and `mcp_gate_description_liq` (the tools/list description of `gate`: the
 * empty-registry sentence present, the H-3 sentence absent). Private: neither root test/ nor the script is exported.
 * No network: the CA runs against an IN-PROCESS harness on a 127.0.0.1 ephemeral port (the h5 probe regime), the TLS
 * check is skipped (http target). No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Server as HttpServer } from "node:http";
import { startServer } from "../apps/harness/src/server.ts";
import { LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_H3_SENTENCE } from "../apps/harness/src/tools/gate.ts";

const SCRIPT = fileURLToPath(new URL("../scripts/verify-harness.mjs", import.meta.url));

// (1) liage (A-10): the two literals the CA compares the served text against are BYTE-IDENTICAL to the served
// constants of gate.ts (the script stays zero-dependency; motif site_ukemi_copy_equals_served_liq_text). Mutant: one
// character changed in either literal => red.
test("verify_harness_liq_literals_equal_served_constants", () => {
  const text = readFileSync(SCRIPT, "utf8");
  assert.ok(
    text.includes(`const LIQ_EMPTY_REGISTRY_SENTENCE = ${JSON.stringify(LIQ_EMPTY_REGISTRY_SENTENCE)};`),
    "the CA literal LIQ_EMPTY_REGISTRY_SENTENCE is byte-identical to gate.ts",
  );
  assert.ok(text.includes(`const LIQ_H3_SENTENCE = ${JSON.stringify(LIQ_H3_SENTENCE)};`), "the CA literal LIQ_H3_SENTENCE is byte-identical to gate.ts");
});

interface CaCheck { name: string; ok: boolean; status: number; detail?: string }
interface Ca { checks: CaCheck[]; tls: { skipped?: boolean } }

/** Run the CA CLI ASYNCHRONOUSLY (the in-process server must keep answering); never rejects. */
function runCa(args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT, ...args], { encoding: "utf8", timeout: 60000 }, (error, stdout, stderr) => {
      resolve({ code: error === null ? 0 : typeof error.code === "number" ? error.code : null, stdout, stderr });
    });
  });
}

// (2) the CA end-to-end against the in-process harness: exit 0, every check ok, the two liq checks present and ok.
// Mutants: 'true' hard-coded in describeGate (the served gate description carries H-3) => mcp_gate_description_liq
// red; the description check inverted in the script => red; the liq body sent with alpha 0.1 (a named 400) => red.
test("verify_harness_ca_passes_on_the_in_process_harness", async () => {
  const server: HttpServer = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const base = `http://127.0.0.1:${String(addr.port)}`;
    const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"]);
    const ca = JSON.parse(r.stdout) as Ca;
    for (const name of ["gate_liq_call", "mcp_gate_description_liq"]) {
      const c = ca.checks.find((x) => x.name === name);
      assert.ok(c !== undefined && c.ok, `CA check ${name} is present and ok: ${JSON.stringify(c)}`);
    }
    assert.deepEqual(ca.checks.filter((c) => !c.ok).map((c) => c.name), [], "every CA check is ok");
    assert.equal(ca.tls.skipped, true, "http target: the TLS check is skipped (no network)");
    assert.equal(r.code, 0, `the CA exits 0 (stderr: ${r.stderr.slice(0, 200)})`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
});
