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
import { createServer, request as httpRequest } from "node:http";
import type { Server as HttpServer } from "node:http";
import { API_HOST_PREFIX, startServer } from "../apps/harness/src/server.ts";
import {
  describeGate, GATE_TOOL_DESCRIPTION, LIQ_COMMITTED_SENTENCE, LIQ_CONDITIONAL_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_H3_SENTENCE,
  TASK_BTC_DIR, TASK_CASCADE, TASK_LIQ_ELIGIBLE, TASK_STABLE_RUN,
} from "../apps/harness/src/tools/gate.ts";

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

// (3) C-G2-1 (G2 HARNESS-DESC-1 sect. 6): the NEGATIVE control -- the CA must RED on over-claiming surfaces (D-1/D-2;
// test (2) only proves the absence of a false alarm). System under test = the CA script run as deployed (child process).
// Adversarial vector = a node:http PROXY on 127.0.0.1:0 (motif test/probe-narabi-state.test.ts serve()) in front of the
// REAL in-process harness: every request passes through (real SDK SSE framing, real mirror bodies: A-8) except TWO rewrite
// points, the served `gate` description in tools/list and the api. answer to the liq POST /gate; so the red set is a
// CLOSED list and the non-zero exit is attributable to the liq checks (R-HD-2: any non-zero, not only 1). Vector ->
// predicate it isolates: (alpha) pre-lot description + pre-2a 400 (form http.ts tool_error, message 1447c05 gate.ts:551);
// (beta) EMPTY and H-3 both served + the real answer relabelled `covered` (!hasH3, reason); (gamma) lot description + the
// real under_calib answer carrying the committed sentence INSTEAD of the empty-registry one (said); (delta) neither EMPTY
// nor H-3 served, the defect class of the live pre-2a text (hasEmpty). Flip with the two CA checks at U-4b-2b (C-4 (c)).
type Rewrite = (status: number, body: string) => { status: number; body: string };
interface Vector { tag: string; description: string; liq: Rewrite; red: string[]; details: string }
interface Seen { rewrites: number; liq: number }
function overclaimingProxy(upstream: number, v: Vector, seen: Seen): HttpServer {
  const served = JSON.stringify(GATE_TOOL_DESCRIPTION).slice(1, -1);
  return createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => { chunks.push(c); });
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      const text = raw.toString("utf8");
      const api = (req.headers.host ?? "").startsWith(API_HOST_PREFIX);
      const up = httpRequest({ host: "127.0.0.1", port: upstream, path: req.url, method: req.method, headers: req.headers, agent: false, timeout: 10000 }, (u) => {
        const back: Buffer[] = [];
        u.on("data", (c: Buffer) => { back.push(c); });
        u.on("end", () => {
          let out = { status: u.statusCode ?? 0, body: Buffer.concat(back).toString("utf8") };
          if (api && req.url === "/gate" && text.includes(`"task_class":"${TASK_LIQ_ELIGIBLE}"`)) {
            seen.liq += 1;
            out = v.liq(out.status, out.body);
          } else if (!api && text.includes(`"method":"tools/list"`)) {
            if (out.body.split(served).length !== 2) out = { status: 500, body: "" }; // fail-closed: the SDK encoding moved
            else { seen.rewrites += 1; out.body = out.body.replace(served, () => JSON.stringify(v.description).slice(1, -1)); }
          }
          res.writeHead(out.status, { "content-type": u.headers["content-type"] ?? "application/json" });
          res.end(out.body);
        });
      });
      up.on("error", () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      up.on("timeout", () => { up.destroy(new Error("upstream timeout")); });
      up.end(raw);
    });
  });
}
const portOf = (s: HttpServer): number => {
  const a = s.address();
  assert.ok(a !== null && typeof a === "object", "address() must be an AddressInfo");
  return a.port;
};
const shut = (s: HttpServer): Promise<void> => {
  s.closeAllConnections();
  return new Promise((resolve) => { s.close(() => { resolve(); }); });
};

test("verify_harness_ca_liq_checks_red_on_overclaiming_surfaces", async () => {
  const esc = (s: string): string => JSON.stringify(s).slice(1, -1);
  const message = `unknown task_class '${TASK_LIQ_ELIGIBLE}' (known: ${TASK_BTC_DIR}, ${TASK_CASCADE}, ${TASK_STABLE_RUN}; or supply params.calibration for BYO)`;
  const both = ["gate_liq_call", "mcp_gate_description_liq"];
  const vectors: Vector[] = [
    { tag: "alpha", description: describeGate(true), liq: () => ({ status: 400, body: JSON.stringify({ error: "tool_error", operation: "gate", message }) }),
      red: both, details: "status=400 reason=null empty_registry_text=null | status=200 empty_registry_sentence=false h3_sentence=true" },
    { tag: "beta", description: describeGate(false).replace(LIQ_CONDITIONAL_SENTENCE, `${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`),
      liq: (status, body) => ({ status, body: body.split(`"reason":"under_calib"`).join(`"reason":"covered"`) }),
      red: both, details: "status=200 reason=covered empty_registry_text=true | status=200 empty_registry_sentence=true h3_sentence=true" },
    { tag: "gamma", description: GATE_TOOL_DESCRIPTION, liq: (status, body) => ({ status, body: body.replace(esc(LIQ_EMPTY_REGISTRY_SENTENCE), () => esc(LIQ_COMMITTED_SENTENCE)) }),
      red: ["gate_liq_call"], details: "status=200 reason=under_calib empty_registry_text=false | status=200 empty_registry_sentence=true h3_sentence=false" },
    { tag: "delta", description: describeGate(false).replace(`${LIQ_EMPTY_REGISTRY_SENTENCE}; `, ""), liq: (status, body) => ({ status, body }),
      red: ["mcp_gate_description_liq"], details: "status=200 reason=under_calib empty_registry_text=true | status=200 empty_registry_sentence=false h3_sentence=false" },
  ];
  const upstream: HttpServer = startServer(0);
  try {
    await once(upstream, "listening");
    for (const v of vectors) {
      const seen: Seen = { rewrites: 0, liq: 0 };
      const proxy = overclaimingProxy(portOf(upstream), v, seen).listen(0, "127.0.0.1");
      try {
        await once(proxy, "listening");
        const base = `http://127.0.0.1:${String(portOf(proxy))}`;
        const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"]);
        const ca = JSON.parse(r.stdout) as Ca;
        const detail = (name: string): string => String(ca.checks.find((c) => c.name === name)?.detail);
        assert.deepEqual(ca.checks.filter((c) => !c.ok).map((c) => c.name), v.red, `(${v.tag}) the red CA checks are EXACTLY ${v.red.join(" + ")}`);
        assert.equal(`${detail("gate_liq_call")} | ${detail("mcp_gate_description_liq")}`, v.details, `(${v.tag}) the CA read the intended vector`);
        assert.deepEqual(seen, { rewrites: 2, liq: 1 }, `(${v.tag}) both tools/list rewritten, the one liq call intercepted`);
        assert.notEqual(r.code, 0, `(${v.tag}) the CA exits non-zero (stderr: ${r.stderr.slice(0, 200)})`);
      } finally {
        await shut(proxy);
      }
    }
  } finally {
    await shut(upstream);
  }
});
