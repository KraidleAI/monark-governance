/**
 * Root test (HARNESS-DESC-1 checkpoint-1 C-5; switched at U-4b-2b, ADR-U4b-2b D4): the deployment CA
 * `scripts/verify-harness.mjs` proves the liquidation-eligible-coverage class on the SERVED surface of the COMMITTED
 * registry -- `gate_liq_call` (POST /gate, yhat of the committed stratum s0: 200, verdict.reason covered, the upper bound
 * [0, yhat + qhat], the committed n_calib and scores_sha256, the committed class text in `content`),
 * `gate_liq_uncommitted_call` (yhat on the first served cut, stratum s1: 200, abstain, verdict.reason under_calib,
 * n_calib 0) and `mcp_gate_description_liq` (the tools/list description of `gate`: the committed clause entire, the
 * empty-registry sentence absent). Private: neither root test/ nor the script is exported. No network: the CA runs
 * against an IN-PROCESS harness on a 127.0.0.1 ephemeral port (the h5 probe regime), the TLS check is skipped (http
 * target). No `any` (off the ratchet). No amount is typed: q-hat is read from the served verdict or the registry.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, request as httpRequest } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { createServer as createTcpServer, type Socket } from "node:net";
import type { Server as HttpServer } from "node:http";
import { splitQuantile } from "@monark/hikae";
import { API_HOST_PREFIX, startServer } from "../apps/harness/src/server.ts";
import {
  describeGate, GATE_TOOL_DESCRIPTION, LIQ_COMMITTED_SENTENCE, LIQ_CONDITIONAL_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_H3_SENTENCE,
  LIQ_REQUIREMENTS_SENTENCE, LIQ_UPPER_BOUND_SENTENCE, LIQ_ALPHA, LIQ_NMIN, SCHEMA_VERSION, TASK_LIQ_ELIGIBLE,
  SERVED_POLICY_TABLES,
} from "../apps/harness/src/tools/gate.ts";
import { lookupCommittedCalibration, UKEMI_LIQ_PREDICTOR_BASE, UKEMI_LIQ_SCORES_SHA256_PINNED, USDE_STABLE_RUN_SCORES_SHA256_PINNED } from "../apps/harness/src/calibration.ts";
import { strateOf, STRATA_CUTS_SERVED } from "../apps/harness/src/ukemi-strata.ts";
import { listen, startLoopback } from "./helpers/loopback.ts";
import { selfSigned } from "./helpers/self-signed.ts";
import { CA_TEST_CLOCK_MS, caEnv, caServerClock } from "./helpers/ca-clock.ts";

const SCRIPT = fileURLToPath(new URL("../scripts/verify-harness.mjs", import.meta.url));
const LIQ_CHECKS = ["gate_liq_call", "gate_liq_uncommitted_call", "mcp_gate_description_liq"] as const;
const KATA_TRIO = ["gate_version_1_0_0_call", "gate_kata_call", "gate_kata_policy_table"] as const;
const S0 = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s0`);
if (S0 === undefined) throw new Error("the committed stratum s0 is missing from the registry");
const N0 = S0.scores.length;
const COMMITTED_CLAUSE = `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`;

// (1) liage (A-10): every literal the CA compares the served surface against is BYTE-IDENTICAL to its served constant
// (the script stays zero-dependency; motif site_ukemi_copy_equals_served_liq_text): the five liq sentences of gate.ts,
// the scores_sha256 pin and size of s0 in calibration.ts, the first served cut of ukemi-strata.ts; the two compositions
// are the gate module's own. Mutant: one character changed in any literal => red.
// killer: scripts/verify-harness.mjs:98 CONST "a927722276941a4f" -> "e7e673664c03e3c5"
test("verify_harness_liq_literals_equal_served_constants", () => {
  const text = readFileSync(SCRIPT, "utf8");
  const literals: ReadonlyArray<readonly [string, string]> = [
    ["LIQ_UPPER_BOUND_SENTENCE", JSON.stringify(LIQ_UPPER_BOUND_SENTENCE)],
    ["LIQ_REQUIREMENTS_SENTENCE", JSON.stringify(LIQ_REQUIREMENTS_SENTENCE)],
    ["LIQ_H3_SENTENCE", JSON.stringify(LIQ_H3_SENTENCE)],
    ["LIQ_CONDITIONAL_SENTENCE", JSON.stringify(LIQ_CONDITIONAL_SENTENCE)],
    ["LIQ_EMPTY_REGISTRY_SENTENCE", JSON.stringify(LIQ_EMPTY_REGISTRY_SENTENCE)],
    ["LIQ_S0_SCORES_SHA256", JSON.stringify(UKEMI_LIQ_SCORES_SHA256_PINNED[`${UKEMI_LIQ_PREDICTOR_BASE}/s0`])],
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

// (1b) UKEMI-PENDING-1 (MONARK e9cd32b, Q-UP-2): the CA bodies speak the version of this tree's harness. One constant,
// CA_SCHEMA_VERSION, equal to SCHEMA_VERSION of gate.ts (the script stays zero-dependency, so this parity is the pin);
// the two exported bodies carry it. Block C moved both in one line each (lot CM-3c-3c); one moved alone => red.
// killer: scripts/verify-harness.mjs:45 CONST "1.1.0" -> "1.0.0"
test("verify_harness_ca_schema_version_equals_the_harness_schema_version", async () => {
  const ca = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as unknown as { CA_SCHEMA_VERSION?: unknown; GATE_BODY: { prediction: { schema_version: unknown } }; GATE_LIQ_BODY: { prediction: { schema_version: unknown } } };
  assert.equal(ca.CA_SCHEMA_VERSION, SCHEMA_VERSION, "CA_SCHEMA_VERSION of the CA is the SCHEMA_VERSION the harness accepts");
  assert.equal(ca.GATE_BODY.prediction.schema_version, SCHEMA_VERSION, "GATE_BODY carries it");
  assert.equal(ca.GATE_LIQ_BODY.prediction.schema_version, SCHEMA_VERSION, "GATE_LIQ_BODY carries it");
});

// (1c) the four literal CA bodies (GATE_BODY, GATE_RETIRED_BODY, GATE_BYO_BODY, GATE_LIQ_BODY; the future and uncommitted
// bodies derive) read the constant, no body types a version, and scripts/sync-harness-served.mjs imports the deploy check's
// bodies, never a copy (T0-TOOLING-1, review m-e). A literal left in either script, or a copied body => red.
// killer: scripts/sync-harness-served.mjs:50 CONST "GATE_LIQ_BODY, CALIBRATE_BODY, CASCADE_BODY" -> "GATE_LIQ_BODY"
test("verify_harness_ca_bodies_read_the_ca_schema_version", () => {
  const text = readFileSync(SCRIPT, "utf8");
  for (const body of ["GATE_BODY", "GATE_RETIRED_BODY", "GATE_BYO_BODY", "GATE_LIQ_BODY"]) {
    assert.ok(text.includes(`const ${body} = {\n  prediction: { schema_version: CA_SCHEMA_VERSION, `), `${body} reads CA_SCHEMA_VERSION`);
  }
  assert.equal(text.split("schema_version: ").length - 1, 5, "the CA writes schema_version in its four literal bodies and in the one named exception only");
  assert.equal(text.split("schema_version: CA_REFUSED_SCHEMA_VERSION").length - 1, 1, "the one exception: the refused version of gate_version_1_0_0_call, once");
  assert.ok(text.includes('export const CA_REFUSED_SCHEMA_VERSION = "1.0.0";'), "the refused version is one constant");
  assert.ok(text.includes("export const GATE_KATA_BODY = {\n  prediction: { ...GATE_BODY.prediction, "), "GATE_KATA_BODY derives from GATE_BODY.prediction: it writes no version");
  const sync = readFileSync(fileURLToPath(new URL("../scripts/sync-harness-served.mjs", import.meta.url)), "utf8");
  assert.ok(sync.includes('import { GATE_BODY, GATE_LIQ_BODY, CALIBRATE_BODY, CASCADE_BODY } from "./verify-harness.mjs";'), "the harness sync imports the four bodies it posts");
  for (const body of ["GATE_LIQ_BODY", "CALIBRATE_BODY", "CASCADE_BODY"]) assert.ok(!sync.includes(`const ${body} =`), `the harness sync keeps no copy of ${body}`);
  assert.equal(sync.split("schema_version: ").length - 1, 0, "the harness sync writes no schema_version");
});

interface CaCheck { name: string; ok: boolean; status: number; detail?: string }
interface Ca { checks: CaCheck[]; tls: { skipped?: boolean } }

/** Run the CA CLI ASYNCHRONOUSLY (the in-process server must keep answering); never rejects. */
function runCa(args: string[], env: NodeJS.ProcessEnv = process.env): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT, ...args], { encoding: "utf8", timeout: 60000, env }, (error, stdout, stderr) => {
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

// (2) the CA end-to-end against the in-process harness: 15 checks, exit 0, every check ok, the three liq checks present,
// ok, and each reading what it should (detail). Mutants: describeGate(false) hard-coded (the served description drops
// the committed clause) => mcp_gate_description_liq red; the liq body sent with alpha 0.1 (a named 400) => red; the
// uncommitted body put in s0 => red.
// CM-2b surfaces: 15 checks; the gate body is the committed USDe key, and two 400 checks carry their code (btc-dir-15m
// retired: task_class_retired; produced_at in 2099: produced_at_future, MONARK C-8).
// killer: scripts/verify-harness.mjs:319 CONST "got === code" -> "got !== code"
test("verify_harness_ca_passes_on_the_in_process_harness", async () => {
  const server: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock()));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const base = `http://127.0.0.1:${String(addr.port)}`;
    const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"], caEnv());
    const ca = JSON.parse(r.stdout) as Ca;
    assert.equal(ca.checks.length, 18, "the CA carries 18 checks (U-4b-2b adds gate_liq_uncommitted_call; CM-2b adds gate_retired_call and gate_future_call; E-2a adds the kata path and version checks)");
    for (const [name, detail] of [["gate_retired_call", "status=400 code=task_class_retired"], ["gate_future_call", "status=400 code=produced_at_future"], ["gate_call", "action=commit"]]) {
      const c = ca.checks.find((x) => x.name === name);
      assert.ok(c !== undefined && c.ok && c.detail === detail, `CA check ${name} reads ${detail}: ${JSON.stringify(c)}`);
    }
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
  byo?: Rewrite;
  red: string[];
  details: string;
}
interface Seen { rewrites: number; committed: number; uncommitted: number }
interface GateBody { content: Array<{ type: string; text: string }>; structuredContent: { action: string; reason: string; verdict: { reason: string; n_calib: number; qhat: number | null; scores_sha256: string; region: { kind: string; lo?: number; hi?: number } } } }

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
          } else if (api && v.byo !== undefined && text.includes('"task_class":"byo-demo"')) {
            out = v.byo(out.status, out.body);
          } else if (!api && text.includes(`"method":"tools/list"`)) {
            if (out.body.split(served).length !== 2) out = { status: 500, body: "" }; // fail-closed: the SDK encoding moved
            else { seen.rewrites += 1; out.body = out.body.replace(served, () => JSON.stringify(v.description).slice(1, -1)); }
          }
          res.writeHead(out.status, { "content-type": u.headers["content-type"] ?? "application/json", ...(u.headers.date === undefined ? {} : { date: u.headers.date }) });
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

// O-1b-G2-2 (duration of this test, G2 HARNESS-DESC-1-1b): 17 CA runs here (16 vectors and the crash run; about 0.2 s each
// idle, measured up to ~10 s each under a loaded full suite for the former 4); the per-test timeout keeps a margin over
// the suite's 120 s default.
// killer: scripts/verify-harness.mjs:410 CONST " && digest === calibrateScoresSha256;" -> ";"
test("verify_harness_ca_liq_checks_red_on_overclaiming_surfaces", { timeout: 300000 }, async () => {
  // M-4 (second exitCode site, main().catch): an unparsable --api throws in `new URL` before any request (the --mcp is a
  // closed local port, never a public host): no CA on stdout, the crash named on stderr, exit exactly 1.
  // Since the delta G2 of T0-TOOLING-1 (D-6) a malformed URL is a named refusal (exit 2); the crash vector is a record that
  // cannot be written (its directory is absent): exit 1, the crash named with the side record's own path.
  const absent = join(mkdtempSync(join(tmpdir(), "verify-harness-crash-")), "absent", "ca.json");
  const crash = await runCa(["--api", "http://127.0.0.1:1", "--mcp", "http://127.0.0.1:1", "--out", absent]);
  assert.equal(crash.code, 1, `a crashed CA exits 1 (stderr: ${crash.stderr.slice(0, 200)})`);
  assert.ok(crash.stderr.includes("verify-harness crashed:") && crash.stderr.includes(`${absent}.failed`), "a crashed CA names the crash and the record it could not write on stderr");
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
      committed: edit((b) => { b.structuredContent.verdict.scores_sha256 = USDE_STABLE_RUN_SCORES_SHA256_PINNED; }),
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
    // m-3 (G2 of 3c-3c, lot CM-3c-4a): a covered BYO answer whose verdict digest is not the calibrate call's reds the loop alone.
    { tag: "nu-byo-foreign-digest", description: GATE_TOOL_DESCRIPTION, committed: same, uncommitted: same, red: ["gate_byo_call"],
      byo: edit((b) => { b.structuredContent.verdict.scores_sha256 = USDE_STABLE_RUN_SCORES_SHA256_PINNED; }), details: liqPlus(GREEN.description, GREEN.uncommitted) },
  ];
  const upstream: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock()));
  try {
    for (const v of vectors) {
      const seen: Seen = { rewrites: 0, committed: 0, uncommitted: 0 };
      const proxy = overclaimingProxy(portOf(upstream), v, seen);
      try {
        await listen(proxy);
        const base = `http://127.0.0.1:${String(portOf(proxy))}`;
        const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"], caEnv());
        const ca = JSON.parse(r.stdout) as Ca;
        assert.deepEqual(ca.checks.slice(-3).map((c) => [c.name, c.ok]), KATA_TRIO.map((n) => [n, true]), `(${v.tag}) the kata path and version checks run last, green`);
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

/** A TLS front on 127.0.0.1 (certificate for localhost) passing every request, Host header kept, to the http harness on `port`. */
function tlsFront(port: number, pem: { key: string; cert: string }): HttpServer {
  return createHttpsServer(pem, (req, res) => {
    const up = httpRequest({ host: "127.0.0.1", port, path: req.url, method: req.method, headers: req.headers, agent: false }, (u) => {
      res.writeHead(u.statusCode ?? 502, u.headers);
      u.pipe(res);
    });
    up.on("error", () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.pipe(up);
  });
}

// (4) T0-TOOLING-1 (review M-a, G2 N-3, M-1, m-f): --out holds the last GREEN deploy record only, written by a temp file and
// a rename. Every target is local: the in-process harness behind TLS fronts with self-signed certificates for localhost.
// Starting from a previous record: a green http run writes <out>.local and a red run <out>.failed, --out untouched; a green
// run whose api and mcp hosts both pass an authorized handshake (the api certificate trusted by the child only, through
// NODE_EXTRA_CA_CERTS) writes --out and removes both side records, no temp file left; and a run whose mcp host serves an
// untrusted certificate (the fetches let through by NODE_TLS_REJECT_UNAUTHORIZED=0, the handshake judged on its own) reds
// on tls_mcp alone and keeps --out.
// killer: scripts/verify-harness.mjs:153 CONST "tlsBlocks.every((t) => t.authorized === true)" -> "tlsBlocks.every((t) => t.authorized !== false)"
test("verify_harness_out_is_written_only_when_every_check_passes", { timeout: 300000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-harness-out-")), out = join(dir, "ca.json"), trusted = selfSigned("api.test"), foreign = selfSigned("mcp.test");
  writeFileSync(join(dir, "trusted.pem"), trusted.cert);
  writeFileSync(out, "the previous green record\n");
  const server: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock()));
  const front = tlsFront(portOf(server), trusted), foreignFront = tlsFront(portOf(server), foreign);
  try {
    await listen(front);
    await listen(foreignFront);
    const host = ["--api-host", "api.monarkgate.tech", "--out", out], plain = `http://127.0.0.1:${String(portOf(server))}`;
    const local = await runCa(["--api", plain, "--mcp", plain, ...host], caEnv());
    assert.equal(local.code, 0, `a green http run exits 0 (stderr: ${local.stderr.slice(0, 200)})`);
    assert.ok(existsSync(`${out}.local`), "a green run with a host not TLS-checked writes <out>.local");
    assert.equal(readFileSync(`${out}.local`, "utf8"), `${local.stdout.trimEnd()}\n`, "that run's record goes to <out>.local");
    const red = await runCa(["--api", "http://127.0.0.1:1", "--mcp", "http://127.0.0.1:1", "--out", out]);
    assert.equal(red.code, 1, "a red run exits 1");
    assert.equal(readFileSync(`${out}.failed`, "utf8"), `${red.stdout.trimEnd()}\n`, "the failing record goes to <out>.failed");
    assert.equal(readFileSync(out, "utf8"), "the previous green record\n", "neither run touches --out");
    assert.ok(red.stderr.includes(`CA NOT written to ${out}`), "the refusal is named on stderr");
    const env = caEnv(CA_TEST_CLOCK_MS, { ...process.env, NODE_EXTRA_CA_CERTS: join(dir, "trusted.pem") }), tls = `https://localhost:${String(portOf(front))}`;
    const green = await runCa(["--api", tls, "--mcp", tls, ...host], env);
    assert.equal(green.code, 0, `a green run with both hosts TLS-checked exits 0 (stderr: ${green.stderr.slice(0, 300)})`);
    assert.equal((JSON.parse(green.stdout) as Ca).checks.length, 18, "the green record carries the 18 checks, the kata trio included");
    assert.equal(readFileSync(out, "utf8"), `${green.stdout.trimEnd()}\n`, "it writes --out");
    assert.deepEqual(readdirSync(dir).sort(), ["ca.json", "trusted.pem"], "the side records go, no temp file is left");
    const mcpRed = await runCa(["--api", tls, "--mcp", `https://localhost:${String(portOf(foreignFront))}`, ...host], { ...env, NODE_TLS_REJECT_UNAUTHORIZED: "0" });
    assert.equal(mcpRed.code, 1, "an mcp host with an untrusted certificate reds");
    assert.ok(mcpRed.stderr.includes("VERIFY FAILED: tls_mcp\n"), `the mcp handshake alone reds: ${mcpRed.stderr.slice(-200)}`);
    assert.equal(readFileSync(out, "utf8"), `${green.stdout.trimEnd()}\n`, "--out keeps the green record");
  } finally {
    for (const s of [front, foreignFront, server]) await shut(s);
    rmSync(dir, { recursive: true, force: true });
  }
});

// (5) T0-TOOLING-1 (review m-b, G2 N-1, N-2): an unknown, repeated or empty option, an option without its value, or a timeout
// that is not a positive integer, is refused by name with exit 2 before any request. Every target is a closed local port.
// killer: scripts/verify-harness.mjs:137 SDL "    if (seen.has(flag)) throw new Error(`option ${flag} given twice`);" -> ""
test("verify_harness_refuses_an_unknown_option", async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-harness-args-"));
  try {
    const closed = ["--api", "http://127.0.0.1:1", "--mcp", "http://127.0.0.1:1"], ca = join(dir, "ca.json");
    for (const [args, named] of [
      [[...closed, "--output", ca], 'unknown option "--output"'], [[...closed, "--out"], "option --out needs a value"],
      [[...closed, "--out", ""], "option --out needs a value"], [[...closed, "--out", " "], "option --out needs a value"],
      [[...closed, "--out", ca, "--out", join(dir, "b.json")], "option --out given twice"], [[...closed, "--api", "http://127.0.0.1:2"], "option --api given twice"],
      [[...closed, "--timeout", "0"], "option --timeout needs a positive integer"],
      [[...closed, "--timeout", "3000000000"], "at most 2147483647"], [["--api", "notaurl", "--mcp", "http://127.0.0.1:1"], "option --api needs an http(s) URL"],
      [["--api", "http://127.0.0.1:1", "--mcp", "ftp://127.0.0.1:1"], "option --mcp needs an http(s) URL"],
      [[...closed, "--kata-wait-max", "x"], "option --kata-wait-max needs an integer of seconds from 0 to 3600"],
      [[...closed, "--kata-wait-max", "3601"], "option --kata-wait-max needs an integer of seconds from 0 to 3600"],
      [[...closed, "--kata-wait-max", "1.5"], "option --kata-wait-max needs an integer of seconds from 0 to 3600"],
    ] as const) {
      const r = await runCa([...args]);
      assert.equal(r.code, 2, `${args.join(" ")}: exit 2 (stderr: ${r.stderr.slice(0, 200)})`);
      assert.ok(r.stderr.includes(named) && r.stdout === "", `${args.join(" ")}: refused by name (${named}), no record printed`);
    }
    // The test clock never reaches a deploy target: off a loopback host (the defaults are the public hosts) it is refused by name.
    for (const [args, env] of [[["--api", "https://api.example.invalid", "--mcp", "https://mcp.example.invalid"], caEnv()], [["--api", "http://127.0.0.1:1", "--mcp", "http://mcp.example.invalid"], caEnv()], [closed, { ...process.env, VERIFY_HARNESS_TEST_CLOCK_MS: "soon" }]] as const) {
      const r = await runCa([...args], env);
      assert.ok(r.code === 2 && r.stdout === "" && r.stderr.includes("VERIFY_HARNESS_TEST_CLOCK_MS"), `${args.join(" ")}: the test clock is refused by name (stderr: ${r.stderr.slice(0, 200)})`);
    }
    assert.deepEqual(readdirSync(dir), [], "nothing written");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// (6) G2 M-3 of T0-TOOLING-1: every request is bounded by --timeout. Against an mcp host that accepts and never answers (the
// api a closed port), the run ends within its bound, red, with the timed-out checks named and no --out written.
// killer: scripts/verify-harness.mjs:172 CONST "{ ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }" -> "init"
test("verify_harness_bounds_every_request", { timeout: 300000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-harness-timeout-")), out = join(dir, "ca.json"), held: Socket[] = [];
  const silent = createTcpServer((socket) => { held.push(socket); });
  try {
    await listen(silent);
    const started = Date.now();
    const r = await runCa(["--api", "http://127.0.0.1:1", "--mcp", `http://127.0.0.1:${String((silent.address() as { port: number }).port)}`, "--timeout", "500", "--out", out]);
    assert.equal(r.code, 1, `a run against a silent host exits 1 (stderr: ${r.stderr.slice(-200)})`);
    assert.ok(Date.now() - started < 30000, "the run ends within its bound");
    const ca = JSON.parse(r.stdout) as Ca;
    assert.deepEqual(["origin_403_mcp", "mcp_tools_list", "mcp_gate_description_liq"].map((n) => /timeout|aborted/i.test(detailOf(ca, n))), [true, true, true], "the mcp checks time out");
    assert.ok(existsSync(`${out}.failed`) && !existsSync(out), "no --out, the failing record only");
  } finally {
    for (const s of held) s.destroy();
    await new Promise<void>((resolve) => { silent.close(() => { resolve(); }); });
    rmSync(dir, { recursive: true, force: true });
  }
});

// (7) G2 M-2 of T0-TOOLING-1: the side records of the deploy check are ignored by git at the CA path only, and the public
// export refuses one wherever --out put it (docs/ is never exported; a record under fixtures/ or schemas/ would be).
// killer: scripts/export-public.mjs:146 CONST "failed|local|tmp" -> "local|tmp"
test("verify_harness_side_records_never_ship", async () => {
  const { STRUCTURAL_BLACKLIST } = (await import("../scripts/export-public.mjs")) as unknown as { STRUCTURAL_BLACKLIST: RegExp[] };
  const ignore = readFileSync(fileURLToPath(new URL("../.gitignore", import.meta.url)), "utf8").split("\n");
  for (const side of ["failed", "local", "tmp", "failed.tmp", "local.tmp"]) {
    assert.ok(ignore.includes(`docs/deploy-CA-harness.json.${side}`), `.gitignore lists the CA's .${side} record`);
    for (const rel of [`fixtures/ca.json.${side}`, `schemas/x.json.${side}`]) assert.ok(STRUCTURAL_BLACKLIST.some((re) => re.test(rel)), `the export refuses ${rel}`);
  }
  assert.ok(!ignore.includes("*.failed"), "no global pattern: a .failed file elsewhere stays visible");
  assert.ok(!STRUCTURAL_BLACKLIST.some((re) => re.test("fixtures/manifest.json")), "an ordinary JSON file still ships");
});

// (8) Delta G2 of T0-TOOLING-1 (D-5): an atomic write whose temp write fails leaves no temp file. The temp path is made a
// dangling link into an absent directory, so the write fails after the name exists; the link is removed with the failure.
// killer: scripts/verify-harness.mjs:157 CONST "rmSync(`${path}.tmp`, { force: true }); throw error;" -> "throw error;"
test("verify_harness_atomic_write_leaves_no_temp", async (t) => {
  const { writeAtomic } = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { writeAtomic?: (path: string, text: string) => void };
  assert.equal(typeof writeAtomic, "function", "scripts/verify-harness.mjs exports writeAtomic");
  const dir = mkdtempSync(join(tmpdir(), "verify-harness-atomic-")), out = join(dir, "ca.json");
  try {
    try { symlinkSync(join(dir, "absent", "x"), `${out}.tmp`); } catch { t.skip("no symlink right on this host"); return; }
    assert.throws(() => writeAtomic?.(out, "x\n"), /ENOENT/, "the temp write fails");
    assert.deepEqual(readdirSync(dir), [], "no temp file and no record left");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// (9) Lot E-2a, the CA trio (R4 section (iii), the partner's choices): after every other check, gate_version_1_0_0_call (the
// gate_call body with the refused version: 400, tool_error, schema_version_unsupported; no clock), then gate_kata_call (one
// well-formed call on btc-range-1h under the reserved probe key: 200, abstain, under_calib, n_calib 0, no region, the b0 cell key,
// no row digest) and gate_kata_policy_table (the verdict of that call carries the pinned digest). The run clock and the harness
// clock are the test clock, 30 s after a grid instant.
interface KataBodies { GATE_BODY: { prediction: Record<string, unknown>; params: Record<string, unknown> }; GATE_KATA_BODY?: { prediction: Record<string, unknown>; params: Record<string, unknown> }; GATE_V100_BODY?: { prediction: Record<string, unknown>; params: unknown }; KATA_POLICY_TABLE_SHA256?: string }
const KATA_CELL = "kata:ca-probe@ca-probe/BTCUSDT/1h/b0";
const kataGreen = (producedAt: string, waited: number): string => `status=200 action=abstain verdict_reason=under_calib n_calib=0 region=null cell_key=${KATA_CELL} policy_row_sha256=null produced_at=${producedAt} waited_s=${String(waited)}`;
const servedBtcRange1h = (): string => SERVED_POLICY_TABLES.find((t) => t.task_class === "btc-range-1h")?.policy_table_sha256 ?? assert.fail("btc-range-1h is served");
// killer: scripts/verify-harness.mjs:542 CONST "got === \"schema_version_unsupported\"" -> "got === \"schema_version_invalid\""
test("verify_harness_ca_plays_kata_path_and_refuses_1_0_0", { timeout: 120000 }, async () => {
  const ca = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as unknown as KataBodies;
  assert.ok(ca.GATE_KATA_BODY !== undefined && ca.GATE_V100_BODY !== undefined, "the CA exports GATE_KATA_BODY and GATE_V100_BODY");
  const probe = { task_class: "btc-range-1h", yhat: 0.01, predictor_id: "kata:ca-probe@ca-probe/BTCUSDT/1h", features_digest: createHash("sha256").update("[]").digest("hex") };
  assert.deepEqual({ ...ca.GATE_KATA_BODY.prediction, produced_at: null }, { ...ca.GATE_BODY.prediction, ...probe, produced_at: null }, "GATE_KATA_BODY: the gate_call prediction on the probe key of btc-range-1h, features_digest the sha256 of [] (produced_at set at run time)");
  assert.deepEqual(ca.GATE_KATA_BODY.params, { ...ca.GATE_BODY.params, alpha: 0.01, nMin: 299, intent: 0 }, "GATE_KATA_BODY: the imposed alpha 0.01 and nMin 299 of the class");
  assert.deepEqual(ca.GATE_V100_BODY, { prediction: { ...ca.GATE_BODY.prediction, schema_version: "1.0.0" }, params: ca.GATE_BODY.params }, "GATE_V100_BODY: the gate_call body with the version 1.0.0");
  // The frozen specification (R4 (iii), 1 968 bytes) stands verbatim in the runbook, one paragraph per line, "reserved for this check".
  const runbook = readFileSync(fileURLToPath(new URL("../docs/RUNBOOK-harness.md", import.meta.url)), "utf8").split("\n");
  const at = runbook.findIndex((l) => l.startsWith("Kata path and version checks. The deployment check"));
  const spec = [0, 2, 4, 6, 8].map((k) => runbook[at + k] ?? "").join("\n");
  assert.equal(createHash("sha256").update(spec, "utf8").digest("hex"), "7e05ee5d8d7b7cd8a056acd2dab20e2efc8c98e72724ca96559e1ca5868a2bae", "the runbook carries the frozen text");
  assert.ok(spec.includes("a key whose kata and venue are reserved for this check"), "the probe key is reserved for this check");
  const server: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock()));
  try {
    const base = `http://127.0.0.1:${String(portOf(server))}`;
    const r = await runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech"], caEnv());
    const rec = JSON.parse(r.stdout) as Ca;
    assert.deepEqual(rec.checks.slice(-3).map((c) => c.name), [...KATA_TRIO], "the three checks run last, the version check first");
    assert.deepEqual(KATA_TRIO.map((n) => detailOf(rec, n)), ["status=400 code=schema_version_unsupported", kataGreen("2026-10-07T12:00:00Z", 0),
      `policy_table_sha256=${servedBtcRange1h()} expected=${servedBtcRange1h()}`], "each check reads what it should");
    assert.deepEqual(rec.checks.filter((c) => !c.ok).map((c) => c.name), [], "every check is ok");
    assert.equal(r.code, 0, `the CA exits 0 (stderr: ${r.stderr.slice(0, 200)})`);
  } finally {
    await shut(server);
  }
});

// (10) The expected digest of gate_kata_policy_table is WRITTEN in the check, anchored in the published entry, never read from the
// served build it checks: the constant = the sha256 entry of btc-range-1h in the latest release of scripts/spec-publish-inputs.json
// that publishes it = its line in that release's MANIFEST.sha256 (the producer's own manifestText) = the sha256 of the file = the
// directory servedTableDirs names = the digest the harness serves. A release that changes the table reds here until the
// constant follows.
// killer: scripts/verify-harness.mjs:491 CONST "1296c3336a96e230" -> "e7e673664c03e3c5"
test("verify_harness_ca_pins_policy_table_sha256", async () => {
  const ca = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as unknown as KataBodies;
  const pin = ca.KATA_POLICY_TABLE_SHA256;
  assert.equal(typeof pin, "string", "the CA exports KATA_POLICY_TABLE_SHA256");
  const inputs = JSON.parse(readFileSync(fileURLToPath(new URL("../scripts/spec-publish-inputs.json", import.meta.url)), "utf8")) as { releases: Record<string, { entries: Array<{ out: string; root: string; path: string; sha256: string }> }> };
  const latest = Object.entries(inputs.releases).flatMap(([release, r]) => r.entries.filter((e) => e.out.endsWith("/policy/btc-range-1h.json")).map((e) => ({ release, ...e }))).at(-1);
  assert.ok(latest !== undefined && latest.root === "governance", "a release publishes btc-range-1h from this repository");
  assert.equal(pin, latest.sha256, `the written value is the entry of release ${latest.release}`);
  const bytes = readFileSync(fileURLToPath(new URL(`../${latest.path}`, import.meta.url)));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), pin, "the file's sha256");
  const { manifestText } = (await import(new URL("../scripts/spec-publish.mjs", import.meta.url).href)) as { manifestText: (f: Array<{ path: string; bytes: Buffer }>) => string };
  assert.equal(manifestText([{ path: latest.out, bytes }]), `${String(pin)}  ${latest.out}\n`, "its MANIFEST.sha256 line");
  const { servedTableDirs, REPO_ROOT } = (await import(new URL("../scripts/spec-policy-tables.mjs", import.meta.url).href)) as { servedTableDirs: (root: string, t: Array<{ task_class: string }>) => Record<string, string>; REPO_ROOT: string };
  assert.equal(`${servedTableDirs(REPO_ROOT, [{ task_class: "btc-range-1h" }])["btc-range-1h"] ?? ""}/policy/btc-range-1h.json`, latest.out, "the latest directory that holds the file is the published one");
  assert.equal(servedBtcRange1h(), pin, "the digest the harness serves");
  assert.ok(readFileSync(SCRIPT, "utf8").includes(`export const KATA_POLICY_TABLE_SHA256 = "${String(pin)}";`), "written by value in the zero-dependency script");
});

/** A front that passes every request to `port` and lets `rewrite` change the answer to the btc-range-1h call. */
function kataFront(port: number, rewrite: (body: string) => string): HttpServer {
  return createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => { chunks.push(c); });
    req.on("end", () => {
      const raw = Buffer.concat(chunks), kata = raw.toString("utf8").includes('"task_class":"btc-range-1h"');
      const up = httpRequest({ host: "127.0.0.1", port, path: req.url, method: req.method, headers: req.headers, agent: false }, (u) => {
        const back: Buffer[] = [];
        u.on("data", (c: Buffer) => { back.push(c); });
        u.on("end", () => {
          const body = Buffer.concat(back).toString("utf8"), out = kata ? rewrite(body) : body;
          res.writeHead(u.statusCode ?? 502, { "content-type": u.headers["content-type"] ?? "application/json", ...(u.headers.date === undefined ? {} : { date: u.headers.date }) });
          res.end(out);
        });
      });
      up.on("error", () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      up.end(raw);
    });
  });
}

// (11) The window and the clock (R4 (iii), the reviewer's form): outside +-240 s of a grid instant, (1) and (2) fail closed
// with kata_window_not_reached, the rest of the CA unchanged; --kata-wait-max S waits to the next grid instant when that is at
// most S seconds away, says so on stderr and in the detail, then passes; a Date header more than 60 s from the run clock fails
// (1) and (2) with kata_clock_skew; a host that serves another table digest reds (2) alone.
// killer: scripts/verify-harness.mjs:483 CONST "KATA_SKEW_MAX_MS = 60000;" -> "KATA_SKEW_MAX_MS = 600000;"
test("verify_harness_ca_kata_window_fails_closed_and_waits", { timeout: 300000 }, async () => {
  const grid = CA_TEST_CLOCK_MS - 30_000, hour = 3_600_000;
  const now: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock()));
  const later: HttpServer = await startLoopback((port) => startServer(port, undefined, caServerClock(grid + hour)));
  const other = "0".repeat(64), front = kataFront(portOf(now), (b) => b.split(servedBtcRange1h()).join(other));
  try {
    await listen(front);
    const run = (s: HttpServer, startMs: number, extra: string[] = []): Promise<{ code: number | null; stdout: string; stderr: string }> => {
      const base = `http://127.0.0.1:${String(portOf(s))}`;
      return runCa(["--api", base, "--mcp", base, "--api-host", "api.monarkgate.tech", ...extra], caEnv(startMs));
    };
    const red = (rec: Ca): string[] => rec.checks.filter((c) => !c.ok).map((c) => c.name);
    const outside = await run(now, grid + 600_000);
    const o = JSON.parse(outside.stdout) as Ca;
    assert.deepEqual([red(o), outside.code], [["gate_kata_call", "gate_kata_policy_table"], 1], "outside the window: (1) and (2) red, (3) and the rest green, exit 1");
    assert.ok(["gate_kata_call", "gate_kata_policy_table"].every((n) => detailOf(o, n).startsWith("kata_window_not_reached")), `the named detail: ${detailOf(o, "gate_kata_call")}`);
    const short = JSON.parse((await run(now, grid + 600_000, ["--kata-wait-max", "60"])).stdout) as Ca;
    assert.ok(detailOf(short, "gate_kata_call").startsWith("kata_window_not_reached"), "a wait above --kata-wait-max is no wait");
    const waited = await run(later, grid + 600_000, ["--kata-wait-max", "3600"]);
    const w = JSON.parse(waited.stdout) as Ca;
    assert.deepEqual([red(w), waited.code], [[], 0], `with --kata-wait-max the run waits to the next grid instant and passes (stderr: ${waited.stderr.slice(0, 300)})`);
    assert.equal(detailOf(w, "gate_kata_call"), kataGreen("2026-10-07T13:00:00Z", 3000), "the call is made on that grid instant, the wait in the detail");
    assert.ok(waited.stderr.includes("verify-harness: waiting 3000 s for the grid instant 2026-10-07T13:00:00Z (--kata-wait-max 3600)"), "the wait is printed");
    const skew = JSON.parse((await run(now, CA_TEST_CLOCK_MS + 120_000)).stdout) as Ca;
    assert.deepEqual(red(skew), ["gate_kata_call", "gate_kata_policy_table"], "a host clock 120 s off: (1) and (2) red");
    assert.ok(["gate_kata_call", "gate_kata_policy_table"].every((n) => detailOf(skew, n).startsWith("kata_clock_skew")), `the named detail: ${detailOf(skew, "gate_kata_call")}`);
    const foreign = JSON.parse((await run(front, CA_TEST_CLOCK_MS)).stdout) as Ca;
    assert.deepEqual(red(foreign), ["gate_kata_policy_table"], "another table digest served: (2) alone red");
    assert.equal(detailOf(foreign, "gate_kata_policy_table"), `policy_table_sha256=${other} expected=${servedBtcRange1h()}`, "it names both digests");
  } finally {
    for (const s of [front, now, later]) await shut(s);
  }
});
