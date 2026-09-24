// MONARK Bell -- the committed course tooling apps/bell/ops (ADR-BELL-CASH-LEG-1 D5, C-4..C-9; fresh-G2 folds B1, B2, M1-M8). Offline: the
// cost pre-flight and the RUNBOOK dry-cross cost command run against a fetch stub preloaded in a child node (never the network), the
// controls run on REAL runMain outputs (helpers) and on JSON-mutated copies of them. The launcher itself is never executed here (its
// guards read the operator machine); its text is pinned and its node snippet is the code under test. Synthetic secrets are built at run
// time only (this file carries no credential shape).
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
const LAUNCH = join(OPS, "launch-q6.sh"), CONTROLS = join(OPS, "q6-controls.mjs"), RUNBOOK = join(REPO, "docs", "RUNBOOK-bell.md");
const W3 = { from: 1789545600000, to: 1789631999000 }; // launch-q6.sh mode W3 (Wed 2026-09-16 04:00 ET .. Thu 03:59:59 ET)
/** A fetch stub preloaded (--import) in a child node: records {url, auth} into $STUB_REQ, answers $STUB_BODY with $STUB_STATUS. */
function fetchStub(dir: string): string {
  const p = join(dir, "stub-fetch.mjs");
  writeFileSync(p, "import { writeFileSync } from \"node:fs\";\nglobalThis.fetch = async (url, init) => { writeFileSync(process.env.STUB_REQ, JSON.stringify({ url: String(url), auth: init?.headers?.Authorization ?? null }));\n  return new Response(process.env.STUB_BODY, { status: Number(process.env.STUB_STATUS) }); };\n");
  return pathToFileURL(p).href;
}

// ---- D5 / C-9 (+ G2 M4): no committed ops file carries a credential. KEY_SHAPES minus "://" (the scripts name public hosts) + two ops-only
// shapes (a key in a query string, a Basic credential), over EVERY file of apps/bell/ops; a ${VAR:-default} reference is replaced by its
// DEFAULT (a default is a value), a bare ${VAR} / ${#VAR} by nothing. ----
test("bell_ops_scripts_carry_no_secret_shape", () => {
  assert.equal(KEY_SHAPES[0]?.source, ":\\/\\/");
  const shapes = [...KEY_SHAPES.slice(1), /[?&](?:api[-_]?key|apikey|key|token)=[^&\s"'$]{12,}/i, /\bBasic\s+[A-Za-z0-9+/]{16,}={0,2}/];
  const REF = /\$\{#?[A-Za-z_][A-Za-z0-9_]*(?::-([^}]*))?\}/g;
  const scan = (line: string): string[] => { const l = line.replace(REF, (_m, d: string | undefined) => d ?? ""); return shapes.filter((re) => re.test(l)).map((re) => re.source); };
  const files = readdirSync(OPS).sort();
  assert.ok(files.includes("launch-q6.sh") && files.includes("q6-controls.mjs"), `every ops file is scanned (${files.join(",")})`);
  for (const f of files) {
    const hits = readFileSync(join(OPS, f), "utf8").split("\n").flatMap((line, i) => scan(line).map((s) => `${f}:${String(i + 1)} ${s}`));
    assert.deepEqual(hits, [], "a credential shape in a committed ops file");
  }
  const db = "d" + "b-" + "A1".repeat(15), uuid = ["0f1e2d3c", "4b5a", "6978", "8a9b", "0c1d2e3f4a5b"].join("-");
  for (const planted of ["DATABENTO" + "_API_KEY=" + "x".repeat(8), db, "Bea" + "rer " + "z".repeat(20), "https://h.invalid/r?adjusted=false&api" + "Key=" + "Zx81".repeat(8),
    "AUTH='Bas" + "ic " + Buffer.from(db + ":").toString("base64") + "'", "DK=\"$" + "{DK_OVERRIDE:-" + db + "}\"", "RPC=\"$" + "{BELL_SOLANA_RPC:-https://h.invalid/?api" + "-key=" + uuid + "}\""]) {
    assert.ok(scan(planted).length > 0, `planted: ${planted.slice(0, 14)}`);
  }
  const ref = "DATABENTO" + "_API_KEY=\"$" + "{DATABENTO" + "_API_KEY}\""; // the reference form: red without the substitution, green with it
  assert.ok(shapes.some((re) => re.test(ref)) && scan(ref).length === 0, "a ${VAR} reference is not a value");
});

// ---- D1 / C-5 / G2 M7 / CP2 C-V-1: the env prefix of the collector call (and nothing else in the launcher) removes, in three closed
// categories: what the collector reads but this course does not need; the paid endpoints of the A-7 list (RUNBOOK step 12) that it never
// reads (least privilege); the node runtime diagnostics (NODE_DEBUG=fetch|undici prints every request URL into $LOG, and the Helius key
// and the Chainstack credential ride in URLs: measured; NODE_DEBUG_NATIVE, its C++ counterpart; NODE_OPTIONS preloads code). The four
// credentials of the course stay. CP2 decisions (a) and (b): the line right after the xtrace-off line unsets, for EVERY node call of the
// launcher, those runtime diagnostics and the TLS switches (NODE_TLS_REJECT_UNAUTHORIZED disables certificate validation,
// NODE_EXTRA_CA_CERTS adds trusted CAs: node --help), and nothing else; the -u of the collector call stay (double barrier). ----
test("bell_ops_launch_unsets_only_read_unneeded_vars", () => {
  const sh = readFileSync(LAUNCH, "utf8"), call = /^env((?: -u [A-Z_]+)+) \\\n {2}node apps\/bell\/src\/collect\.ts /m.exec(sh);
  assert.ok(call, "the env prefix of the collector call is found");
  const unset = [...(call[1] ?? "").matchAll(/-u ([A-Z_]+)/g)].map((m) => m[1] ?? "").sort();
  assert.deepEqual([...sh.matchAll(/-u ([A-Z_]+)/g)].map((m) => m[1] ?? "").sort(), unset, "every removal sits on the collector call");
  const paid = [...(/env((?: -u [A-Z_]+)+) sh -c/.exec(readFileSync(RUNBOOK, "utf8"))?.[1]?.matchAll(/-u ([A-Z_]+)/g) ?? [])].map((m) => m[1] ?? "");
  assert.equal(paid.length, 8, "the A-7 paid-variable list of RUNBOOK step 12");
  const src = join(REPO, "apps", "bell", "src"), code = [...readdirSync(src).filter((n) => n.endsWith(".ts")).map((n) => join(src, n)),
    join(REPO, "packages", "rpc-guard", "src", "transport.ts")].map((p) => readFileSync(p, "utf8")).join("\n");
  const reads = (v: string): boolean => new RegExp(`env\\.${v}\\b`).test(code), NEEDED = ["CHAINSTACK_SOLANA_URL", "DATABENTO_API_KEY", "HELIUS_API_KEY", "POLYGON_API_KEY"];
  const RUNTIME = ["NODE_DEBUG", "NODE_DEBUG_NATIVE", "NODE_OPTIONS"]; // closed category: the node runtime diagnostics (CP2 C-V-1)
  const TLS = ["NODE_EXTRA_CA_CERTS", "NODE_TLS_REJECT_UNAUTHORIZED"]; // closed category: the node TLS switches (CP2 decision b)
  for (const v of NEEDED) assert.ok(reads(v) && paid.includes(v), `${v}: read by the collector and needed by the course`);
  for (const v of RUNTIME) assert.ok(unset.includes(v) && !reads(v) && !paid.includes(v), `CP2 C-V-1: ${v} is removed from the collector's environment`);
  assert.deepEqual(unset, [...paid.filter((v) => !NEEDED.includes(v)), "BELL_HALTS_CSV", ...RUNTIME].sort(), "removed = paid and unneeded + read and unneeded + runtime diagnostics");
  assert.deepEqual(unset.filter(reads), ["BELL_HALTS_CSV", "CHAINSTACK_ETH_URL"], "C-5: the two variables read by the collector and not needed here");
  for (const v of unset) assert.ok(reads(v) || paid.includes(v) || RUNTIME.includes(v), `${v}: read by the collector, a paid endpoint or a runtime diagnostic (never a fictitious removal)`);
  const pro = /^\{ set \+x; \} 2>\/dev\/null\nunset ([A-Z_]+(?: [A-Z_]+)*)$/m.exec(sh), cleared = (pro?.[1] ?? "").trim().split(" ").filter(Boolean);
  assert.ok(pro, "the line right after the xtrace-off line is the unset, before any node call");
  assert.equal(sh.match(/^unset /gm)?.length, 1, "one unset line in the launcher");
  for (const v of RUNTIME) assert.ok(cleared.includes(v), `CP2 decision (a): ${v} is unset for every node call of the launcher`);
  for (const v of TLS) assert.ok(cleared.includes(v) && !reads(v) && !paid.includes(v) && !unset.includes(v), `CP2 decision (b): ${v} (TLS switch) is unset for every node call of the launcher`);
  assert.deepEqual([...cleared].sort(), [...RUNTIME, ...TLS].sort(), "the unset line = runtime diagnostics + TLS switches, nothing else (never a credential)");
  assert.ok(!sh.includes("MASSIVE_API_KEY"), "C-5: no such variable in the code");
  assert.match(sh, /\[ -n "\$\{DATABENTO_API_KEY\+x\}" \] && \[ "\$\{#DATABENTO_API_KEY\}" -eq 32 \]/, "D1: the Databento key is required (its length only)");
  assert.match(sh, /\[ -e "\$OUT\/state\.json" \] && stop/, "C-9: an existing <out>/state.json stops the course");
});

// ---- G2 B2: under `bash -x` (or an inherited xtrace) the launcher never traces a secret: xtrace is forced off right after `set -u`, and no
// secret is copied into a variable (each is tested set, then measured in place). Mutants: `set -x` after `set -u`; a copy HK="${...}". ----
test("bell_ops_launcher_never_traces_nor_copies_a_secret", () => {
  const sh = readFileSync(LAUNCH, "utf8");
  assert.match(sh, /^set -u\n\{ set \+x; \} 2>\/dev\/null\n/m, "xtrace forced off right after set -u");
  assert.doesNotMatch(sh, /\bset\s+-[A-Za-z]*x|\bset\s+-o\s+xtrace\b/, "xtrace never switched on");
  assert.doesNotMatch(sh, /=["']?\$\{?#?[A-Za-z_]*(?:_API_KEY|_URL)\b/, "no secret copied into a variable");
  for (const [v, n] of [["HELIUS_API_KEY", 36], ["POLYGON_API_KEY", 32], ["CHAINSTACK_SOLANA_URL", 75], ["DATABENTO_API_KEY", 32]] as const) {
    assert.ok(sh.includes(`[ -n "\${${v}+x}" ] && [ "\${#${v}}" -eq ${String(n)} ]`), `${v}: tested set, then its length in place`);
  }
});

// ---- C-7 (+ G2 M3, M5): the cost pre-flight (the JS_COST snippet of the launcher) prints ONLY the cost, stops over the cap, on an HTTP
// error or on a non-JSON body without printing a byte of it, and never prints the key in any form (raw, base64, hex, with or without ":"). ----
test("bell_ops_cost_preflight_prints_only_the_cost", () => {
  const sh = readFileSync(LAUNCH, "utf8"), js = /^JS_COST='([^']*)'$/m.exec(sh)?.[1] ?? "";
  assert.ok(js.includes("databentoCostPath"), "the snippet is found and uses the collector's own query builder");
  const table = [...sh.matchAll(/(\w+)\) UNDERLYING=(\w+) ;;/g)].map((m) => [m[1], m[2]]), collect = readFileSync(join(REPO, "apps", "bell", "src", "collect.ts"), "utf8");
  assert.equal(table.length, 4);
  for (const [mint, u] of table) assert.ok(collect.includes(`${String(mint)}: "${String(u)}"`), `${String(mint)} -> ${String(u)} as collect.ts UNDERLYING`);
  const dir = tmp("bell-ops-cost-"), stub = fetchStub(dir), req = join(dir, "req.json"), key = "d" + "b-" + "Q7".repeat(14) + "q";
  const forms = [key, ...[key + ":", key].flatMap((s) => [Buffer.from(s).toString("base64"), Buffer.from(s).toString("hex")])];
  const run = (body: string, status: number, withKey: boolean): { code: number | null; out: string; err: string; req: Obj | null } => {
    const env: NodeJS.ProcessEnv = { ...process.env, STUB_REQ: req, STUB_BODY: body, STUB_STATUS: String(status) };
    delete env.DATABENTO_API_KEY;
    if (withKey) env.DATABENTO_API_KEY = key;
    writeFileSync(req, "null");
    const r = spawnSync(process.execPath, ["--import", stub, "--input-type=module", "-e", js, "--", REPO, "TSLA", String(W3.from), String(W3.to), "1"], { env, encoding: "utf8" });
    for (const f of forms) assert.ok(!(r.stdout + r.stderr).includes(f), "no form of the key is printed");
    return { code: r.status, out: r.stdout, err: r.stderr, req: JSON.parse(readFileSync(req, "utf8")) as Obj | null };
  };
  const ok = run("0.0123", 200, true);
  assert.deepEqual([ok.code, ok.out, ok.err], [0, "cost_usd=0.0123\n", ""], "the cost alone, nothing on stderr");
  assert.deepEqual(ok.req, { url: DATABENTO_HIST + databentoCostPath(["TSLA"], "2026-09-15", "2026-09-17"), auth: "Basic " + Buffer.from(key + ":").toString("base64") },
    "W3 reaches the reference days 09-15 (pre/regular) and 09-16 (after/overnight), end exclusive; the key rides as the Basic username");
  const over = run("1.5", 200, true);
  assert.deepEqual([over.code, over.out], [4, "cost_usd=1.5\n"], "over the 1 USD cap => exit 4 (the launcher stops)");
  const denied = run("{}", 401, true);
  assert.deepEqual([denied.code, denied.out, denied.err], [3, "", "cost pre-flight: HTTP 401\n"], "an HTTP error stops with its status only");
  const garbled = run("<html>upstream " + "q".repeat(40), 200, true);
  assert.deepEqual([garbled.code, garbled.out, garbled.err], [3, "", "cost pre-flight: not JSON\n"], "a non-JSON body stops, no byte of it printed");
  const none = run("0", 200, false);
  assert.deepEqual([none.code, none.req], [3, null], "no key => no request at all");
});

// ---- G2 M2 (+ CP2 observation): the RUNBOOK dry-cross cost command (section 8 bis, command 1), run as written against the fetch stub,
// refuses to call without a key (an empty key would send `Basic Og==`, the seq 1 profile), stops on an HTTP error or a non-JSON body
// without printing a byte of it (the guard of G2 M5); the billed second command is ordered after it; never --now on a course. ----
test("bell_runbook_dry_cross_cost_command_guards_the_key", () => {
  const rb = readFileSync(RUNBOOK, "utf8"), sec = rb.slice(rb.indexOf("## 8 bis."), rb.indexOf("## 9. "));
  const js = /node --input-type=module -e '([^']*databentoCostPath[^']*)' -- 2026-09-15/.exec(sec)?.[1] ?? "";
  assert.ok(js.includes("fetch("), "command 1 found in section 8 bis");
  assert.match(sec, /Run the second command only after the first\s+printed `cost_usd=<n>` with n <= 1\./, "the billed command only after the cost is known");
  assert.match(sec, /Never `--now` here/, "the test-only clock override is excluded from a course");
  const dir = tmp("bell-rb-cost-"), stub = fetchStub(dir), req = join(dir, "req.json"), key = "d" + "b-" + "R8".repeat(14) + "r";
  const run = (withKey: boolean, body = "0.0042", status = 200): { code: number | null; out: string; err: string; req: Obj | null } => {
    const env: NodeJS.ProcessEnv = { ...process.env, STUB_REQ: req, STUB_BODY: body, STUB_STATUS: String(status) };
    delete env.DATABENTO_API_KEY;
    if (withKey) env.DATABENTO_API_KEY = key;
    writeFileSync(req, "null");
    const r = spawnSync(process.execPath, ["--import", stub, "--input-type=module", "-e", js, "--", "2026-09-15"], { cwd: REPO, env, encoding: "utf8" });
    return { code: r.status, out: r.stdout, err: r.stderr, req: JSON.parse(readFileSync(req, "utf8")) as Obj | null };
  };
  const sent = { url: DATABENTO_HIST + databentoCostPath(["TSLA"], "2026-09-15", "2026-09-16"), auth: "Basic " + Buffer.from(key + ":").toString("base64") };
  assert.deepEqual(run(false), { code: 3, out: "no key\n", err: "", req: null }, "no key => no request");
  assert.deepEqual(run(true), { code: 0, out: "cost_usd=0.0042\n", err: "", req: sent }, "with the key: the one-day cost, the key as the Basic username");
  assert.deepEqual(run(true, "{}", 401), { code: 3, out: "HTTP 401\n", err: "", req: sent }, "an HTTP error stops with its status only");
  assert.deepEqual(run(true, "<html>upstream " + "q".repeat(40), 200), { code: 3, out: "not JSON\n", err: "", req: sent }, "a non-JSON body stops, no byte of it printed");
});

// ---- C-6 / C-4 / C-8 (+ G2 B1, M1, M6, M8): the controls on REAL runMain outputs (helpers/bell-served.ts: a weekend session whose reference
// day 2026-08-14 has no close in the stub => no_close_ref, and one on 2026-09-18 => gT matched) and on JSON-mutated copies of them. ----
test("bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs", async () => {
  const base = tmp("bell-ops-ctl-"), good = join(base, "good"), bad = join(base, "bad");
  mkdirSync(join(base, "w1")); mkdirSync(join(base, "w2"));
  await runMainInto(good, join(base, "w1"));
  await runMainInto(bad, join(base, "w2"), { databentoGet: () => Promise.reject(new Error("HTTP 400")) });
  const ctl = (out: string, extra: string[] = []): { code: number | null; lines: string[]; err: string } => {
    const r = spawnSync(process.execPath, [CONTROLS, "--mint", "TSLAx", "--mode", "W3", "--variant", "fast", "--out", out, "--exec-tree", REPO, "--log", join(base, "absent.log"), ...extra], { encoding: "utf8" });
    return { code: r.status, lines: r.stdout.split("\n"), err: r.stderr };
  };
  const line = (lines: string[], id: string): string => lines.filter((l) => l.includes(` ${id} `)).join(" || ");
  const epu0814 = Date.UTC(2026, 7, 15, 20, 0, 0), NOW = ["--now", String(epu0814 - 1)]; // earliestPublishUtc("2026-08-14") = 16:00 ET + 24 h
  const early = ctl(good, NOW);
  // G2 M8 + M1: the first line names the execution tree checked (information only); the test-only clock override is flagged as a FAIL
  assert.match(early.lines[0] ?? "", /^INFO Q6-C00 exec-tree=.+ head=(?:[0-9a-f]{40}|unknown) worktree=(?:clean|dirty \(\d+ entries\)|unknown)$/);
  assert.equal(early.lines[1], "FAIL Q6-C00 clock override --now=2026-08-15T19:59:59.999Z: offline tests only, never a course control");
  assert.match(line(early.lines, "Q6-C14"), /^PASS Q6-C14 1 session\(s\) with gT \(cash_cross matched\), 1 no_close_ref not yet publishable/);
  assert.ok(!/no_close_ref=\d+ \(expected/.test(line(early.lines, "Q6-C11")), "C11 expects no_close_ref == the sessions not yet publishable");
  assert.match(line(early.lines, "Q6-C09"), /^PASS Q6-C09 faults=\{\}/);
  const late = ctl(good, ["--now", String(epu0814)]);
  assert.match(line(late.lines, "Q6-C14"), /^FAIL Q6-C14 1 session\(s\) without a publishable close: no_close_ref on weekend\|2026-08-14 \(ref 2026-08-14\): publishable since 2026-08-15T20:00:00\.000Z/);
  assert.match(line(late.lines, "Q6-C11"), /no_close_ref=1 \(expected 0\)/);
  const faulted = ctl(bad); // the real clock: both reference days are long publishable
  assert.match(line(faulted.lines, "Q6-C09"), /^FAIL Q6-C09 cash-leg faults=\[\{"provider":"cash-close","status":"HTTP 400"\}\]/);
  assert.match(line(faulted.lines, "Q6-C14"), /^FAIL Q6-C14 2 session\(s\) without a publishable close/);
  assert.ok(!faulted.lines.some((l) => l.includes("clock override")), "no override, no clock line");
  const nan = ctl(good, ["--now", "abc"]);
  assert.deepEqual([nan.code, nan.err], [2, "--now needs a finite epoch-ms value (offline tests only)\n"], "a non-finite --now is a usage error");
  // C15: the same run as its own seq 1 => equal; one vwap altered in the seq 1 copy => WARN with both figures
  const same = ctl(good, [...NOW, "--seq1-state", join(good, "state.json")]);
  assert.match(line(same.lines, "Q6-C15"), /^PASS Q6-C15 2 session\(s\): vwap, volumeBase, n equal to seq 1/);
  const s1 = readJson(join(good, "state.json")), g0 = ((s1.digest as Obj).gaps as Obj[])[0];
  if (g0 !== undefined) g0.vwap = "1.0000000000";
  const s1f = join(base, "seq1-state.json");
  writeFileSync(s1f, JSON.stringify(s1));
  assert.match(line(ctl(good, [...NOW, "--seq1-state", s1f]).lines, "Q6-C15"), /^WARN Q6-C15 1 difference\(s\), write the D-n line: TSLAx\|weekend\|weekend\|2026-08-14 vwap seq1=1\.0000000000 seq2=\d+\.\d{10} delta=/);
  // JSON-mutated copies of the real run (bell_sha not re-sealed: C02 reds on each, and only the named line is asserted)
  const variant = (name: string, mutate: (o: Obj) => void, file = "state.json"): string => {
    const d = join(base, name);
    cpSync(good, d, { recursive: true });
    const o = readJson(join(d, file));
    mutate(o);
    writeFileSync(join(d, file), JSON.stringify(o, null, 2));
    return d;
  };
  // the gap -> date join is fail-closed: a volume entry whose n differs from its gap => C14 cannot qualify anything => FAIL
  const broken = variant("broken", (s) => { const v0 = ((s.digest as Obj).volume as Obj[])[0]; if (v0 !== undefined) v0.n = 99; });
  assert.match(line(ctl(broken, NOW).lines, "Q6-C14"), /^FAIL Q6-C14 gap -> session date join not proven \(gap TSLAx\|weekend\|weekend#0 has no volume entry of the same n\)/);
  // G2 B1: every C14 branch. The filled session (weekend, reference day 2026-09-18) is turned into each defect a collector could emit
  const filled = (s: Obj): Obj => { const g = ((s.digest as Obj).gaps as Obj[]).find((x) => "gT" in x); assert.ok(g, "the real run has a filled session"); return g; };
  const residual = (s: Obj, k: string, v: number): void => { (s.residuals as Obj)[k] = v; ((s.digest as Obj).residuals as Obj)[k] = v; };
  const c14 = (d: string): string => line(ctl(d, NOW).lines, "Q6-C14");
  const mm = c14(variant("mm", (s) => {
    const g = filled(s);
    for (const k of ["gT", "exceed1", "exceed2", "exceed5", "earliest_publish_utc", "multiplierUsed", "rebase_residuals"]) Reflect.deleteProperty(g, k);
    g.cash_cross = "mismatch"; g.abstain = "cash_cross_mismatch"; residual(s, "cash_cross_mismatch", 1);
  }));
  assert.match(mm, /^FAIL Q6-C14 .*STOP cash_cross_mismatch on weekend\|2026-09-18 \(ref 2026-09-18\): investigate/);
  assert.match(mm, /residuals cash_cross_mismatch=1 cash_cross_unavailable=0 \(expected 0\)/);
  const unav = c14(variant("unav", (s) => { filled(s).cash_cross = "unavailable"; residual(s, "cash_cross_unavailable", 1); }));
  assert.match(unav, /^FAIL Q6-C14 .*cash_cross=unavailable \(expected matched/);
  assert.match(unav, /residuals cash_cross_mismatch=0 cash_cross_unavailable=1 \(expected 0\)/);
  assert.match(c14(variant("epu", (s) => { const g = filled(s); g.earliest_publish_utc = Number(g.earliest_publish_utc) + 1; })), /^FAIL Q6-C14 .*earliest_publish_utc=\d+ \(expected \d+\)/);
  assert.match(c14(variant("gtnum", (s) => { const g = filled(s); g.gT = Number(g.gT); })), /^FAIL Q6-C14 .*gT=number/);
  // G2 M6: a non-bare fault label (the publisher refuses it) is a C09 FAIL, never a WARN
  const host = variant("host", (j) => { j.faults = [{ provider: "x.example", status: "HTTP 400" }]; }, "journal.json");
  assert.match(line(ctl(host, NOW).lines, "Q6-C09"), /^FAIL Q6-C09 non-bare fault labels=\[\{"provider":"x\.example","status":"HTTP 400"\}\]/);
  assert.ok(existsSync(join(good, "journal.json")), "the controls read the run as written (four artifacts)");
});
