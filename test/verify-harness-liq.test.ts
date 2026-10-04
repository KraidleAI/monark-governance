/**
 * Root test (HARNESS-DESC-1 checkpoint-1 C-5; switched at U-4b-2b, ADR-U4b-2b D4): the deployment CA
 * `scripts/verify-harness.mjs` proves the liquidation-eligible-coverage class on the SERVED surface of the COMMITTED
 * registry -- `gate_liq_call` (POST /gate, yhat of the committed stratum s0: 200, verdict.reason covered, the upper bound
 * [0, yhat + qhat], the committed n_calib and C5 digest, the committed class text in `content`),
 * `gate_liq_uncommitted_call` (yhat on the first served cut, stratum s1: 200, abstain, verdict.reason under_calib,
 * n_calib 0) and `mcp_gate_description_liq` (the tools/list description of `gate`: the committed clause entire, the
 * empty-registry sentence absent). Private: neither root test/ nor the script is exported. No network: the CA runs
 * against an IN-PROCESS harness on a 127.0.0.1 ephemeral port (the h5 probe regime), the TLS check is skipped (http
 * target). No `any` (off the ratchet). No amount is typed: q-hat is read from the served verdict or the registry.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer, request as httpRequest } from "node:http";
import type { Server as HttpServer } from "node:http";
import { splitQuantile } from "@monark/hikae";
import { API_HOST_PREFIX, startServer } from "../apps/harness/src/server.ts";
import {
  describeGate, GATE_TOOL_DESCRIPTION, LIQ_COMMITTED_SENTENCE, LIQ_CONDITIONAL_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_H3_SENTENCE,
  LIQ_REQUIREMENTS_SENTENCE, LIQ_UPPER_BOUND_SENTENCE, LIQ_ALPHA, LIQ_NMIN, TASK_LIQ_ELIGIBLE,
} from "../apps/harness/src/tools/gate.ts";
import { lookupCommittedCalibration, UKEMI_LIQ_PREDICTOR_BASE, USDE_STABLE_RUN_CALIB_DIGEST_PINNED } from "../apps/harness/src/calibration.ts";
import { strateOf, STRATA_CUTS_SERVED } from "../apps/harness/src/ukemi-strata.ts";
import { listen, startLoopback } from "./helpers/loopback.ts";

const SCRIPT = fileURLToPath(new URL("../scripts/verify-harness.mjs", import.meta.url));
const LIQ_CHECKS = ["gate_liq_call", "gate_liq_uncommitted_call", "mcp_gate_description_liq"] as const;
const S0 = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s0`);
if (S0 === undefined) throw new Error("the committed stratum s0 is missing from the registry");
const N0 = S0.scores.length;
const COMMITTED_CLAUSE = `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;

// (1) liage (A-10): every literal the CA compares the served surface against is BYTE-IDENTICAL to its served constant
// (the script stays zero-dependency; motif site_ukemi_copy_equals_served_liq_text): the five liq sentences of gate.ts,
// the committed digest and size of s0 in calibration.ts, the first served cut of ukemi-strata.ts; the two compositions
// are the gate module's own. Mutant: one character changed in any literal => red.
test("verify_harness_liq_literals_equal_served_constants", () => {
  const text = readFileSync(SCRIPT, "utf8");
  const literals: ReadonlyArray<readonly [string, string]> = [
    ["LIQ_UPPER_BOUND_SENTENCE", JSON.stringify(LIQ_UPPER_BOUND_SENTENCE)],
    ["LIQ_REQUIREMENTS_SENTENCE", JSON.stringify(LIQ_REQUIREMENTS_SENTENCE)],
    ["LIQ_H3_SENTENCE", JSON.stringify(LIQ_H3_SENTENCE)],
    ["LIQ_CONDITIONAL_SENTENCE", JSON.stringify(LIQ_CONDITIONAL_SENTENCE)],
    ["LIQ_EMPTY_REGISTRY_SENTENCE", JSON.stringify(LIQ_EMPTY_REGISTRY_SENTENCE)],
    ["LIQ_S0_CALIB_DIGEST", JSON.stringify(S0.digestPinned)],
    ["LIQ_S0_N_CALIB", String(N0)],
    ["LIQ_S1_CUT", String(STRATA_CUTS_SERVED[0])],
  ];
  for (const [name, value] of literals) assert.ok(text.includes(`const ${name} = ${value};`), `the CA literal ${name} is byte-identical to its served constant`);
  assert.equal(strateOf(STRATA_CUTS_SERVED[0] ?? 0), 1, "the first served cut lies in stratum s1 (uncommitted)");
  // The compositions: the committed clause of describeGate(true) and the committed class text of `content`.
  assert.ok(text.includes("const LIQ_COMMITTED_CLAUSE = `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;"), "the CA composes the committed clause as the gate module does");
  assert.ok(text.includes("const LIQ_COMMITTED_SENTENCE = `${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;"), "the CA composes the committed class text as the gate module does");
  assert.ok(describeGate(true).includes(COMMITTED_CLAUSE), "that clause is the one describeGate(true) serves");
  assert.equal(LIQ_COMMITTED_SENTENCE, `${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`, "that text is LIQ_COMMITTED_SENTENCE");
  // Anti-close (ADR-U4b-2b section 5): the CA never types the committed q-hat; it reads it from the served verdict.
  const q = splitQuantile(S0.scores, LIQ_ALPHA, LIQ_NMIN);
  assert.ok("qhat" in q && !text.includes(String(q.qhat)), "the committed q-hat is not typed in the CA script");
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
const detailOf = (ca: Ca, name: string): string => String(ca.checks.find((c) => c.name === name)?.detail);
const liqDetails = (ca: Ca): string => LIQ_CHECKS.map((n) => detailOf(ca, n)).join(" | ");
/** The three liq details of the green committed surface (expected strings built from the registry, never typed amounts). */
const GREEN = {
  liq: `status=200 action=defer reason=interval_too_wide verdict_reason=covered upper_bound=true n_calib=${String(N0)} digest_s0=true committed_text=true empty_text=false`,
  uncommitted: "status=200 action=abstain reason=under_calib verdict_reason=under_calib n_calib=0",
  description: "status=200 committed_clause=true empty_registry_sentence=false",
};

// (2) the CA end-to-end against the in-process harness: 13 checks, exit 0, every check ok, the three liq checks present,
// ok, and each reading what it should (detail). Mutants: describeGate(false) hard-coded (the served description drops
// the committed clause) => mcp_gate_description_liq red; the liq body sent with alpha 0.1 (a named 400) => red; the
// uncommitted body put in s0 => red.
test("verify_harness_ca_passes_on_the_in_process_harness", async () => {
  const server: HttpServer = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const base = `http://127.0.0.1:${String(addr.port)}`;
    const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"]);
    const ca = JSON.parse(r.stdout) as Ca;
    assert.equal(ca.checks.length, 13, "the CA carries 13 checks (U-4b-2b adds gate_liq_uncommitted_call)");
    for (const name of LIQ_CHECKS) {
      const c = ca.checks.find((x) => x.name === name);
      assert.ok(c !== undefined && c.ok, `CA check ${name} is present and ok: ${JSON.stringify(c)}`);
    }
    assert.deepEqual(ca.checks.filter((c) => !c.ok).map((c) => c.name), [], "every CA check is ok");
    assert.equal(liqDetails(ca), `${GREEN.liq} | ${GREEN.uncommitted} | ${GREEN.description}`, "the liq checks read the committed surface");
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

// (3) The NEGATIVE control (C-G2-1 of G2 HARNESS-DESC-1, re-derived at U-4b-2b per the extension of item 4 (c)): the CA
// must RED on over-claiming surfaces. System under test = the CA script run as deployed (child process). Adversarial
// vector = a node:http PROXY on 127.0.0.1 at a drawn port above 10080 (motif test/probe-narabi-state.test.ts serve()) in front of the REAL in-process
// harness: every request passes through (real SDK SSE framing, real mirror bodies: A-8) except the rewrite points: the
// served `gate` description in tools/list, the api. answers to the two liq POST /gate (told apart by the stratum of the
// request's yhat), and, for (alpha) only, the committed call's request (moved to an uncommitted stratum so the upstream
// serves a REAL under_calib body). Each red set is a CLOSED list; the exit is exactly 1 (O-1b-G2-1: exitCode, no
// process.exit after fetch). ADR vectors: (alpha) the pre-switch surface, what the live server serves before the switch
// window (empty-registry description, under_calib + empty sentence on both calls); (beta) the committed description
// without its upper bound; (gamma) a covered answer with a symmetric region, or with a foreign digest; (delta) an
// uncommitted-stratum answer relabelled covered. Isolating vectors (declared in the lot's G1: each required predicate
// mutant must have a vector where its predicate ALONE fails): (epsilon) empty sentence served next to the committed
// clause + the committed answer relabelled under_calib + the uncommitted answer carrying the committed n_calib; (zeta)
// the committed answer carrying the empty sentence + the uncommitted answer relabelled defer; (eta) the committed answer
// with n_calib 0 + the uncommitted answer served with status 500; (theta) the committed answer with q-hat 0 and upper
// edge yhat (the q-hat = 0 over-claim, delta D-2); (iota) the committed answer with an upper edge beyond yhat + q-hat; (kappa)
// the committed answer relabelled region kind "set", its edges kept (the kind predicate alone). Folded from the G2 of
// U-4b-2b (M-2, 2026-09-24): the committed clause ENTIRE, (lambda) the served description with ONE of REQ, H-3 or COND
// dropped from the clause (three vectors; the G2 report's vector drops COND), each reds the description check alone; and
// "and NOT the empty-registry sentence", (mu) the covered answer whose `content` carries the empty-registry sentence NEXT
// TO the committed one, reds the liq call alone. And the second exitCode site (M-4): a CA that CRASHES exits 1 too.
type Rewrite = (status: number, body: string) => { status: number; body: string };
interface Vector {
  tag: string;
  description: string;
  committed: Rewrite;
  uncommitted: Rewrite;
  committedRequest?: (body: string) => string;
  red: string[];
  details: string;
}
interface Seen { rewrites: number; committed: number; uncommitted: number }
interface GateBody { content: Array<{ type: string; text: string }>; structuredContent: { action: string; reason: string; verdict: { reason: string; n_calib: number; qhat: number | null; calib_digest: string; region: { kind: string; lo?: number; hi?: number } } } }

const same: Rewrite = (status, body) => ({ status, body });
const esc = (s: string): string => JSON.stringify(s).slice(1, -1);
/** Rewrite a served /gate body through its parsed form (field-level, the rest byte-for-byte as re-serialized). */
const edit = (f: (b: GateBody) => void): Rewrite => (status, body) => {
  const b = JSON.parse(body) as GateBody;
  f(b);
  return { status, body: JSON.stringify(b) };
};
const toEmptyText: Rewrite = (status, body) => ({ status, body: body.split(esc(LIQ_COMMITTED_SENTENCE)).join(esc(LIQ_EMPTY_REGISTRY_SENTENCE)) });
const yhatOf = (requestText: string): number => (JSON.parse(requestText) as { prediction: { yhat: number } }).prediction.yhat;

function overclaimingProxy(upstream: number, v: Vector, seen: Seen): HttpServer {
  const served = JSON.stringify(GATE_TOOL_DESCRIPTION).slice(1, -1);
  return createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => { chunks.push(c); });
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      const text = raw.toString("utf8");
      const api = (req.headers.host ?? "").startsWith(API_HOST_PREFIX);
      const liq = api && req.url === "/gate" && text.includes(`"task_class":"${TASK_LIQ_ELIGIBLE}"`);
      const committedCall = liq && strateOf(yhatOf(text)) === 0;
      const forward = committedCall && v.committedRequest !== undefined ? Buffer.from(v.committedRequest(text), "utf8") : raw;
      const headers = { ...req.headers, "content-length": String(forward.length) };
      const up = httpRequest({ host: "127.0.0.1", port: upstream, path: req.url, method: req.method, headers, agent: false, timeout: 10000 }, (u) => {
        const back: Buffer[] = [];
        u.on("data", (c: Buffer) => { back.push(c); });
        u.on("end", () => {
          let out = { status: u.statusCode ?? 0, body: Buffer.concat(back).toString("utf8") };
          if (liq && committedCall) {
            seen.committed += 1;
            out = v.committed(out.status, out.body);
          } else if (liq) {
            seen.uncommitted += 1;
            out = v.uncommitted(out.status, out.body);
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
      up.end(forward);
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

// O-1b-G2-2 (duration of this test, G2 HARNESS-DESC-1-1b): 16 CA runs here (15 vectors and the crash run; about 0.2 s each
// idle, measured up to ~10 s each under a loaded full suite for the former 4); the per-test timeout keeps a margin over
// the suite's 120 s default.
test("verify_harness_ca_liq_checks_red_on_overclaiming_surfaces", { timeout: 300000 }, async () => {
  // M-4 (second exitCode site, main().catch): an unparsable --api throws in `new URL` before any request (the --mcp is a
  // closed local port, never a public host): no CA on stdout, the crash named on stderr, exit exactly 1.
  const crash = await runCa(["--api", "not a url", "--mcp", "http://127.0.0.1:1"]);
  assert.equal(crash.code, 1, `a crashed CA exits 1 (stderr: ${crash.stderr.slice(0, 200)})`);
  assert.ok(crash.stdout === "" && crash.stderr.includes("verify-harness crashed:"), "a crashed CA writes no CA and names the crash on stderr");
  const both = ["gate_liq_call", "mcp_gate_description_liq"];
  const liqPlus = (desc: string, u: string, l = GREEN.liq): string => `${l} | ${u} | ${desc}`;
  const EMPTY_DESC = "status=200 committed_clause=false empty_registry_sentence=true";
  /** (lambda) the served description whose liq clause is `clause` (the committed clause with one sentence dropped). */
  const lambda = (tag: string, clause: string): Vector => ({ tag, description: describeGate(true).replace(COMMITTED_CLAUSE, () => clause), committed: same,
    uncommitted: same, red: ["mcp_gate_description_liq"], details: liqPlus("status=200 committed_clause=false empty_registry_sentence=false", GREEN.uncommitted) });
  const vectors: Vector[] = [
    { tag: "alpha-2b", description: describeGate(false), committedRequest: (b) => b.replace(`"yhat":${String(yhatOf(b))}`, `"yhat":${String(STRATA_CUTS_SERVED[0])}`),
      committed: toEmptyText, uncommitted: toEmptyText, red: both,
      details: liqPlus(EMPTY_DESC, GREEN.uncommitted, "status=200 action=abstain reason=under_calib verdict_reason=under_calib upper_bound=false n_calib=0 digest_s0=false committed_text=false empty_text=true") },
    { tag: "beta-2b", description: describeGate(true).replace(`the served region is ${LIQ_UPPER_BOUND_SENTENCE}; `, ""), committed: same, uncommitted: same,
      red: ["mcp_gate_description_liq"], details: liqPlus("status=200 committed_clause=false empty_registry_sentence=false", GREEN.uncommitted) },
    { tag: "gamma-2b-symmetric", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { const v = b.structuredContent.verdict; v.region.lo = (v.region.hi ?? 0) - 2 * (v.qhat ?? 0); }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("upper_bound=true", "upper_bound=false")) },
    { tag: "gamma-2b-foreign-digest", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { b.structuredContent.verdict.calib_digest = USDE_STABLE_RUN_CALIB_DIGEST_PINNED; }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("digest_s0=true", "digest_s0=false")) },
    { tag: "delta-2b", description: GATE_TOOL_DESCRIPTION, committed: same, red: ["gate_liq_uncommitted_call"],
      uncommitted: edit((b) => { b.structuredContent.verdict.reason = "covered"; }),
      details: liqPlus(GREEN.description, GREEN.uncommitted.replace("verdict_reason=under_calib", "verdict_reason=covered")) },
    { tag: "epsilon-2b", description: describeGate(true).replace(COMMITTED_CLAUSE, `${LIQ_EMPTY_REGISTRY_SENTENCE}; ${COMMITTED_CLAUSE}`),
      committed: edit((b) => { b.structuredContent.verdict.reason = "under_calib"; }),
      uncommitted: edit((b) => { b.structuredContent.verdict.n_calib = N0; }),
      red: ["gate_liq_call", "gate_liq_uncommitted_call", "mcp_gate_description_liq"],
      details: liqPlus("status=200 committed_clause=true empty_registry_sentence=true", GREEN.uncommitted.replace("n_calib=0", `n_calib=${String(N0)}`), GREEN.liq.replace("verdict_reason=covered", "verdict_reason=under_calib")) },
    { tag: "zeta-2b", description: GATE_TOOL_DESCRIPTION, committed: toEmptyText,
      uncommitted: edit((b) => { b.structuredContent.action = "defer"; }), red: ["gate_liq_call", "gate_liq_uncommitted_call"],
      details: liqPlus(GREEN.description, GREEN.uncommitted.replace("action=abstain", "action=defer"), GREEN.liq.replace("committed_text=true empty_text=false", "committed_text=false empty_text=true")) },
    { tag: "eta-2b", description: GATE_TOOL_DESCRIPTION, committed: edit((b) => { b.structuredContent.verdict.n_calib = 0; }),
      uncommitted: (_status, body) => ({ status: 500, body }), red: ["gate_liq_call", "gate_liq_uncommitted_call"],
      details: liqPlus(GREEN.description, GREEN.uncommitted.replace("status=200", "status=500"), GREEN.liq.replace(`n_calib=${String(N0)}`, "n_calib=0")) },
    { tag: "theta-2b", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { const v = b.structuredContent.verdict; v.region.hi = (v.region.hi ?? 0) - (v.qhat ?? 0); v.qhat = 0; }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("upper_bound=true", "upper_bound=false")) },
    { tag: "iota-2b", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { const v = b.structuredContent.verdict; v.region.hi = (v.region.hi ?? 0) + (v.qhat ?? 0); }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("upper_bound=true", "upper_bound=false")) },
    { tag: "kappa-2b", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { b.structuredContent.verdict.region.kind = "set"; }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("upper_bound=true", "upper_bound=false")) },
    lambda("lambda-2b-req", `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`),
    lambda("lambda-2b-h3", `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`),
    lambda("lambda-2b-cond", `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}`),
    { tag: "mu-2b", description: GATE_TOOL_DESCRIPTION, uncommitted: same, red: ["gate_liq_call"],
      committed: edit((b) => { const c0 = b.content[0]; if (c0 !== undefined) c0.text = `${c0.text} ${LIQ_EMPTY_REGISTRY_SENTENCE}`; }),
      details: liqPlus(GREEN.description, GREEN.uncommitted, GREEN.liq.replace("empty_text=false", "empty_text=true")) },
  ];
  const upstream: HttpServer = await startLoopback((port) => startServer(port));
  try {
    for (const v of vectors) {
      const seen: Seen = { rewrites: 0, committed: 0, uncommitted: 0 };
      const proxy = overclaimingProxy(portOf(upstream), v, seen);
      try {
        await listen(proxy);
        const base = `http://127.0.0.1:${String(portOf(proxy))}`;
        const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"]);
        const ca = JSON.parse(r.stdout) as Ca;
        assert.deepEqual(ca.checks.filter((c) => !c.ok).map((c) => c.name), v.red, `(${v.tag}) the red CA checks are EXACTLY ${v.red.join(" + ")}`);
        assert.equal(liqDetails(ca), v.details, `(${v.tag}) the CA read the intended vector`);
        assert.deepEqual(seen, { rewrites: 2, committed: 1, uncommitted: 1 }, `(${v.tag}) both tools/list rewritten, each liq call intercepted once`);
        assert.equal(r.code, 1, `(${v.tag}) the CA exits 1 (stderr: ${r.stderr.slice(0, 200)})`);
      } finally {
        await shut(proxy);
      }
    }
  } finally {
    await shut(upstream);
  }
});
