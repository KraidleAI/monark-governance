// MONARK Bell -- the committed course tooling apps/bell/ops (ADR-BELL-CASH-LEG-1 D5, C-4..C-9). Offline: the cost pre-flight runs
// against a fetch stub preloaded in a child node (never the network), the controls run on REAL runMain outputs (helpers). The
// launcher itself is never executed here (its guards read the operator machine); its text is checked and its two node snippets
// are the code under test. Synthetic secrets are built at run time only (this file carries no credential shape).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { KEY_SHAPES } from "../scripts/bell-publish.mjs";
import { DATABENTO_HIST, databentoCostPath } from "../src/close.ts";
import { REPO, readJson, runMainInto, tmp, type Obj } from "./helpers/bell-served.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), OPS = join(HERE, "..", "ops");
const LAUNCH = join(OPS, "launch-q6.sh"), CONTROLS = join(OPS, "q6-controls.mjs");
const W3 = { from: 1789545600000, to: 1789631999000 }; // launch-q6.sh mode W3 (Wed 2026-09-16 04:00 ET .. Thu 03:59:59 ET)

// ---- D5 / C-9: no committed ops file carries a credential: KEY_SHAPES minus "://" (the scripts name public hosts), ${VAR} allowlisted ----
test("bell_ops_scripts_carry_no_secret_shape", () => {
  assert.equal(KEY_SHAPES[0]?.source, ":\\/\\/");
  const shapes = KEY_SHAPES.slice(1), REF = /\$\{[A-Za-z_][A-Za-z0-9_]*(?::-[^}]*)?\}/g; // a ${VAR} reference is never a value
  const scan = (line: string): string[] => shapes.filter((re) => re.test(line.replace(REF, ""))).map((re) => re.source);
  for (const f of [LAUNCH, CONTROLS]) {
    const hits = readFileSync(f, "utf8").split("\n").flatMap((line, i) => scan(line).map((s) => `${f}:${String(i + 1)} ${s}`));
    assert.deepEqual(hits, [], "a credential shape in a committed ops file");
  }
  for (const planted of ["DATABENTO" + "_API_KEY=" + "x".repeat(8), "d" + "b-" + "A1".repeat(12), "Bea" + "rer " + "z".repeat(20)]) assert.ok(scan(planted).length > 0, `planted: ${planted.slice(0, 12)}`);
  const ref = "DATABENTO" + "_API_KEY=\"$" + "{DATABENTO" + "_API_KEY}\""; // the reference form: red without the allowlist, green with it
  assert.ok(shapes.some((re) => re.test(ref)) && scan(ref).length === 0, "the ${VAR} allowlist is load-bearing");
});

// ---- D1 / C-5: the launcher removes ONLY variables the collector really reads and this course does not need; the cash keys stay ----
test("bell_ops_launch_unsets_only_read_unneeded_vars", () => {
  const sh = readFileSync(LAUNCH, "utf8"), unset = [...sh.matchAll(/-u ([A-Z_]+)/g)].map((m) => m[1] ?? "").sort();
  assert.deepEqual(unset, ["BELL_HALTS_CSV", "CHAINSTACK_ETH_URL"], "C-5: the two variables read by the collector and not needed here");
  const src = join(REPO, "apps", "bell", "src"), code = [...readdirSync(src).filter((n) => n.endsWith(".ts")).map((n) => join(src, n)),
    join(REPO, "packages", "rpc-guard", "src", "transport.ts")].map((p) => readFileSync(p, "utf8")).join("\n");
  for (const v of unset) assert.match(code, new RegExp(`env\\.${v}\\b`), `${v} is read by the collector (never a fictitious removal)`);
  for (const v of ["DATABENTO_API_KEY", "POLYGON_API_KEY", "HELIUS_API_KEY", "CHAINSTACK_SOLANA_URL"]) assert.match(code, new RegExp(`env\\.${v}\\b`), `${v} is read`);
  assert.ok(!sh.includes("MASSIVE_API_KEY"), "C-5: no such variable in the code");
  assert.match(sh, /\[ "\$\{#DK\}" -eq 32 \]/, "D1: the Databento key is required (its length only, never its value)");
  assert.match(sh, /\[ -e "\$OUT\/state\.json" \] && stop/, "C-9: an existing <out>/state.json stops the course");
});

// ---- C-7: the cost pre-flight (the JS_COST snippet of the launcher) prints ONLY the cost, stops over the cap, never leaks the key ----
test("bell_ops_cost_preflight_prints_only_the_cost", () => {
  const sh = readFileSync(LAUNCH, "utf8"), js = /^JS_COST='([^']*)'$/m.exec(sh)?.[1] ?? "";
  assert.ok(js.includes("databentoCostPath"), "the snippet is found and uses the collector's own query builder");
  const table = [...sh.matchAll(/(\w+)\) UNDERLYING=(\w+) ;;/g)].map((m) => [m[1], m[2]]), collect = readFileSync(join(REPO, "apps", "bell", "src", "collect.ts"), "utf8");
  assert.equal(table.length, 4);
  for (const [mint, u] of table) assert.ok(collect.includes(`${String(mint)}: "${String(u)}"`), `${String(mint)} -> ${String(u)} as collect.ts UNDERLYING`);
  const dir = tmp("bell-ops-cost-"), stub = join(dir, "stub-fetch.mjs"), req = join(dir, "req.json"), key = "d" + "b-" + "Q7".repeat(14) + "q";
  writeFileSync(stub, "import { writeFileSync } from \"node:fs\";\nglobalThis.fetch = async (url, init) => { writeFileSync(process.env.STUB_REQ, JSON.stringify({ url: String(url), auth: init?.headers?.Authorization ?? null }));\n  return new Response(process.env.STUB_BODY, { status: Number(process.env.STUB_STATUS) }); };\n");
  const run = (body: string, status: number, withKey: boolean): { code: number | null; out: string; err: string; req: Obj | null } => {
    const env: NodeJS.ProcessEnv = { ...process.env, STUB_REQ: req, STUB_BODY: body, STUB_STATUS: String(status) };
    delete env.DATABENTO_API_KEY;
    if (withKey) env.DATABENTO_API_KEY = key;
    writeFileSync(req, "null");
    const r = spawnSync(process.execPath, ["--import", pathToFileURL(stub).href, "--input-type=module", "-e", js, "--", REPO, "TSLA", String(W3.from), String(W3.to), "1"], { env, encoding: "utf8" });
    assert.ok(!(r.stdout + r.stderr).includes(key), "the key is never printed");
    return { code: r.status, out: r.stdout, err: r.stderr, req: JSON.parse(readFileSync(req, "utf8")) as Obj | null };
  };
  const ok = run("0.0123", 200, true);
  assert.deepEqual([ok.code, ok.out], [0, "cost_usd=0.0123\n"], ok.err);
  assert.deepEqual(ok.req, { url: DATABENTO_HIST + databentoCostPath(["TSLA"], "2026-09-15", "2026-09-17"), auth: "Basic " + Buffer.from(key + ":").toString("base64") },
    "W3 reaches the reference days 09-15 (pre/regular) and 09-16 (after/overnight), end exclusive; the key rides as the Basic username");
  const over = run("1.5", 200, true);
  assert.deepEqual([over.code, over.out], [4, "cost_usd=1.5\n"], "over the 1 USD cap => exit 4 (the launcher stops)");
  const denied = run("{}", 401, true);
  assert.deepEqual([denied.code, denied.out, /HTTP 401/.test(denied.err)], [3, "", true], "an HTTP error stops, nothing printed on stdout");
  const none = run("0", 200, false);
  assert.deepEqual([none.code, none.req], [3, null], "no key => no request at all");
});

// ---- C-6 / C-4 / C-8: the controls on REAL runMain outputs (helpers/bell-served.ts: a weekend session whose reference day 2026-08-14 has
// no close in the stub => no_close_ref, and one on 2026-09-18 => gT matched). C14 qualifies the no_close_ref by its OWN reference day. ----
test("bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs", async () => {
  const base = tmp("bell-ops-ctl-"), good = join(base, "good"), bad = join(base, "bad");
  mkdirSync(join(base, "w1")); mkdirSync(join(base, "w2"));
  await runMainInto(good, join(base, "w1"));
  await runMainInto(bad, join(base, "w2"), { databentoGet: () => Promise.reject(new Error("HTTP 400")) });
  const ctl = (out: string, extra: string[] = []): { code: number | null; lines: string[] } => {
    const r = spawnSync(process.execPath, [CONTROLS, "--mint", "TSLAx", "--mode", "W3", "--variant", "fast", "--out", out, "--exec-tree", REPO, "--log", join(base, "absent.log"), ...extra], { encoding: "utf8" });
    return { code: r.status, lines: r.stdout.split("\n") };
  };
  const line = (lines: string[], id: string): string => lines.filter((l) => l.includes(` ${id} `)).join(" || ");
  const epu0814 = Date.UTC(2026, 7, 15, 20, 0, 0); // earliestPublishUtc("2026-08-14") = 16:00 ET + 24 h (EDT)
  const early = ctl(good, ["--now", String(epu0814 - 1)]);
  assert.match(line(early.lines, "Q6-C14"), /^PASS Q6-C14 1 session\(s\) with gT \(cash_cross matched\), 1 no_close_ref not yet publishable/);
  assert.ok(!/no_close_ref=\d+ \(expected/.test(line(early.lines, "Q6-C11")), "C11 expects no_close_ref == the sessions not yet publishable");
  assert.match(line(early.lines, "Q6-C09"), /^PASS Q6-C09 faults=\{\}/);
  const late = ctl(good, ["--now", String(epu0814)]);
  assert.match(line(late.lines, "Q6-C14"), /^FAIL Q6-C14 1 session\(s\) without a publishable close: no_close_ref on weekend\|2026-08-14 \(ref 2026-08-14\): publishable since 2026-08-15T20:00:00\.000Z/);
  assert.match(line(late.lines, "Q6-C11"), /no_close_ref=1 \(expected 0\)/);
  const faulted = ctl(bad); // the real clock: both reference days are long publishable
  assert.match(line(faulted.lines, "Q6-C09"), /^FAIL Q6-C09 cash-leg faults=\[\{"provider":"cash-close","status":"HTTP 400"\}\]/);
  assert.match(line(faulted.lines, "Q6-C14"), /^FAIL Q6-C14 2 session\(s\) without a publishable close/);
  // C15: the same run as its own seq 1 => equal; one vwap altered in the seq 1 copy => WARN with both figures
  const same = ctl(good, ["--now", String(epu0814 - 1), "--seq1-state", join(good, "state.json")]);
  assert.match(line(same.lines, "Q6-C15"), /^PASS Q6-C15 2 session\(s\): vwap, volumeBase, n equal to seq 1/);
  const s1 = readJson(join(good, "state.json")), g0 = ((s1.digest as Obj).gaps as Obj[])[0];
  if (g0 !== undefined) g0.vwap = "1.0000000000";
  const s1f = join(base, "seq1-state.json");
  writeFileSync(s1f, JSON.stringify(s1));
  assert.match(line(ctl(good, ["--now", String(epu0814 - 1), "--seq1-state", s1f]).lines, "Q6-C15"), /^WARN Q6-C15 1 difference\(s\), write the D-n line: TSLAx\|weekend\|weekend\|2026-08-14 vwap seq1=1\.0000000000 seq2=\d+\.\d{10} delta=/);
  // the gap -> date join is fail-closed: a volume entry whose n differs from its gap => C14 cannot qualify anything => FAIL
  const broken = join(base, "broken");
  cpSync(good, broken, { recursive: true });
  const st = readJson(join(broken, "state.json")), v0 = ((st.digest as Obj).volume as Obj[])[0];
  if (v0 !== undefined) v0.n = 99;
  writeFileSync(join(broken, "state.json"), JSON.stringify(st));
  assert.match(line(ctl(broken, ["--now", String(epu0814 - 1)]).lines, "Q6-C14"), /^FAIL Q6-C14 gap -> session date join not proven \(gap TSLAx\|weekend\|weekend#0 has no volume entry of the same n\)/);
  assert.ok(existsSync(join(good, "journal.json")), "the controls read the run as written (four artifacts)");
});
