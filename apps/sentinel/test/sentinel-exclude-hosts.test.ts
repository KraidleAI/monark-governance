// SENTINEL - off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// NARABI-L-1 pli 2 (NARABI-L-GAP-1): MONARK_SENTINEL_EXCLUDE_HOSTS, the archive-draw-only exclusion. UNIT: the pure
// `excludeHosts` (parallel pool/published lists, the paid leg's label/origin pair). SUBPROCESS: the REAL run.ts with a
// fetch stub derived from the committed capture (motif sentinel-retry.test.ts), so the wiring in `main` is proved end
// to end: the excluded host is never dialled AND is absent from the written line's provenance. Offline, no network.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { PUBLIC_ENDPOINTS } from "../src/rpc.ts";
import { excludeHosts, CHAINSTACK_LABEL } from "../src/run.ts";
import type { TimelineLine } from "../src/timeline.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const RUN_TS = join(HERE, "..", "src", "run.ts");
const FIXTURE = join(HERE, "fixtures", "narabi-timeline-2026-09-19.jsonl");
const ORIGIN = "https://ethereum-mainnet.core.chainstack.com";
const MEV = "https://rpc.mevblocker.io", DRPC = "https://eth.drpc.org", POCKET = "https://eth.api.pocket.network";

// Honest answers off the 2026-09-18/19 capture; a host in STUB_FAIL_HOSTS answers 503; every dialled hostname is
// appended to STUB_LOG (the pool's actual use, observed from outside run.ts).
const STUB_SRC = `
import { readFileSync, appendFileSync } from "node:fs";
const L = readFileSync(process.env.STUB_FIXTURE, "utf8").replace(/\\r\\n/g, "\\n").split("\\n").filter((x) => x.trim()).map((l) => JSON.parse(l));
const w18 = L[1], w19 = L[2], mid = (d) => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
const A = [[w18.from_block, mid("2026-09-18")], [w19.from_block, mid("2026-09-19")], [w19.to_block + 1, mid("2026-09-20")]];
const seg = (b) => (b <= A[1][0] ? 0 : 1);
const tsOf = (b) => { const i = seg(b), [b0, t0] = A[i], [b1, t1] = A[i + 1]; return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); };
const hex = (n) => "0x" + BigInt(n).toString(16), Z = "0x" + "0".repeat(64), O = "0x" + "1".repeat(64);
const byFrom = new Map([w18, w19].map((w) => [w.from_block, w]));
const sup = new Map([[w18.to_block, w18.supply_close], [w18.from_block - 1, w18.s_open], [w19.to_block, w19.supply_close], [w19.from_block - 1, w19.s_open]]);
const FAIL = (process.env.STUB_FAIL_HOSTS ?? "").split(",");
globalThis.fetch = (url, init) => {
  const host = new URL(url).hostname; appendFileSync(process.env.STUB_LOG, host + "\\n");
  const { method, params } = JSON.parse(init.body);
  const ok = (result) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }) });
  const fail = (status) => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
  if (FAIL.includes(host)) return fail(503);
  if (method === "eth_getBlockByNumber") {
    if (params[0] === "finalized") return ok({ number: hex(w19.to_block + 5), timestamp: hex(mid("2026-09-20") + 3600) });
    const b = parseInt(params[0], 16); return ok({ number: hex(b), timestamp: hex(tsOf(b)) });
  }
  if (method === "eth_getLogs") { const w = byFrom.get(parseInt(params[0].fromBlock, 16)); return ok(w ? [{ topics: [Z, O, Z], data: hex(BigInt(w.burns)) }, { topics: [Z, Z, O], data: hex(BigInt(w.mints)) }] : []); }
  if (method === "eth_call") { const s = sup.get(parseInt(params[1], 16)); return s === undefined ? fail(500) : ok(hex(BigInt(s))); }
  return fail(400);
};
`;

let scratch: string | null = null;
const root = (): string => (scratch ??= mkdtempSync(join(tmpdir(), "narabi-exclude-")));
after(() => {
  assert.notEqual(scratch, null, "the suite allocated a scratch dir (non-vacuous cleanup)");
  if (scratch !== null) { rmSync(scratch, { recursive: true, force: true }); assert.equal(existsSync(scratch), false, "no mkdtemp leak"); }
});
const fixtureRaw = (): string[] => readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());

interface Run { status: number; stderr: string; timeline: string; dialled: string[]; last: TimelineLine; }
/** Exact membership of a host or a URL in a list (an element test, never a substring test). */
const has = (list: readonly string[], item: string): boolean => list.some((x) => x === item);
/** The REAL run.ts on a state resumed at 2026-09-18 (2026-09-19 due). Hygiene: every CHAINSTACK_* and MONARK_SENTINEL_*
 *  key of the parent shell is dropped (keyless pool, no leg), then the case's exclusion value (or none) is set. */
function runWith(exclude: string | undefined): Run {
  const dir = mkdtempSync(join(root(), "state-")), log = join(dir, "dialled.log"), stub = join(root(), "stub.mjs");
  writeFileSync(join(dir, "timeline.jsonl"), fixtureRaw().slice(0, 2).join("\n") + "\n");
  writeFileSync(stub, STUB_SRC);
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith("CHAINSTACK_") || k.startsWith("MONARK_SENTINEL_")) delete env[k];
  // Only mevblocker, 1rpc and Pocket answer: the quorum takes the first two of them in list order.
  Object.assign(env, { STUB_FIXTURE: FIXTURE, STUB_LOG: log, STUB_FAIL_HOSTS: "ethereum-rpc.publicnode.com,eth.drpc.org,ethereum.publicnode.com,eth.rpc.blxrbdn.com" });
  if (exclude !== undefined) env.MONARK_SENTINEL_EXCLUDE_HOSTS = exclude;
  const r = spawnSync(process.execPath, ["--import", pathToFileURL(stub).href, RUN_TS, "--state", dir], { cwd: REPO, env, encoding: "utf8", timeout: 60_000 });
  const timeline = readFileSync(join(dir, "timeline.jsonl"), "utf8");
  const lines = timeline.split("\n").filter((x) => x.trim());
  return { status: r.status ?? -1, stderr: r.stderr ?? "", timeline, dialled: existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean) : [], last: JSON.parse(lines[lines.length - 1]!) as TimelineLine };
}

test("sentinel_exclude_hosts_removes_pool_and_published - the excluded host leaves the pool AND the provenance; absent or empty = identical; an unknown host throws at start-up (NARABI-L-GAP-1)", (t) => {
  // (unit) the pure filter, on the draw's real shape: the paid leg is a LABEL in the pool and its ORIGIN in provenance.
  const pool = [...PUBLIC_ENDPOINTS, CHAINSTACK_LABEL], pub = [...PUBLIC_ENDPOINTS, ORIGIN];
  const drawn = excludeHosts("eth.api.pocket.network", pool, pub);
  assert.deepEqual(drawn.endpoints, pool.filter((u) => u !== POCKET), "Pocket leaves the pool; the Chainstack label stays");
  assert.deepEqual(drawn.published, pub.filter((u) => u !== POCKET), "and leaves the provenance; the Chainstack origin stays");
  const noLeg = excludeHosts("ETHEREUM-MAINNET.core.chainstack.com", pool, pub);
  assert.ok(!has(noLeg.endpoints, CHAINSTACK_LABEL) && !has(noLeg.published, ORIGIN), "the label/origin pair leaves together (case-insensitive)");
  for (const v of [undefined, ""]) assert.deepEqual(excludeHosts(v, pool, pub), { endpoints: pool, published: pub }, `${String(v)} => unchanged`);
  for (const bad of ["eth.api.pocket.netwrok", "eth.api.pocket.network,", "pocket.network", " "]) {
    assert.throws(() => excludeHosts(bad, pool, pub), /MONARK_SENTINEL_EXCLUDE_HOSTS: .* is not a host of the pool/, `${JSON.stringify(bad)} is refused`);
  }

  // (subprocess) absent: the quorum reads mevblocker + 1rpc (non-vacuity: the host excluded below IS used here).
  const base = runWith(undefined);
  assert.equal(base.status, 0, `absent: the day is written (${base.stderr})`);
  assert.ok(has(base.dialled, "rpc.mevblocker.io"), "absent: mevblocker is dialled");
  assert.deepEqual(base.last.endpoints, [...PUBLIC_ENDPOINTS], "absent: the 7 public endpoints are published");
  // Empty value = absent, byte for byte (the written timeline, provenance included).
  const empty = runWith("");
  assert.equal(empty.status, 0);
  assert.equal(empty.timeline, base.timeline, "\"\" writes the same bytes as an absent key");
  // Excluded (upper case, two items, spaces): never dialled, absent from the provenance, the facts unchanged.
  const ex = runWith(" RPC.MEVBLOCKER.IO , eth.drpc.org");
  assert.equal(ex.status, 0, `excluded: the day is written on 1rpc + Pocket (${ex.stderr})`);
  assert.ok(ex.dialled.length > 0 && !has(ex.dialled, "rpc.mevblocker.io") && !has(ex.dialled, "eth.drpc.org"), "the excluded hosts are never dialled (pool)");
  assert.deepEqual(ex.last.endpoints, PUBLIC_ENDPOINTS.filter((u) => u !== MEV && u !== DRPC), "the provenance lists the 5 endpoints actually usable");
  assert.equal(ex.last.line_hash, base.last.line_hash, "the hashed facts are unchanged (endpoints are provenance only)");
  // Unknown host: FATAL at start-up, exit 1, no RPC at all, nothing written.
  const bad = runWith("rpc.mevblocker.oi");
  assert.equal(bad.status, 1, "a typo stops the run");
  assert.match(bad.stderr, /sentinel FATAL[\s\S]*MONARK_SENTINEL_EXCLUDE_HOSTS: "rpc\.mevblocker\.oi" is not a host of the pool/);
  assert.deepEqual(bad.dialled, [], "the refusal precedes any RPC");
  assert.equal(bad.timeline, fixtureRaw().slice(0, 2).join("\n") + "\n", "nothing written");
  // The served unit never sets it (RUNBOOK section 7 (1)). The public export omits deploy/ (ADR-NARABI-OPS-1c C3): this
  // ONE assertion is then not run, DECLARED; the test itself always runs (convention of sentinel-catchup-budget.test.ts).
  // A present deploy/ with the .service missing reds (ENOENT), never skips.
  if (existsSync(join(REPO, "deploy"))) {
    assert.ok(!readFileSync(join(REPO, "deploy", "monark-sentinel.service"), "utf8").includes("EXCLUDE_HOSTS"), "the unit does not set the key");
  } else {
    t.diagnostic("deploy/ absent (public export, C3): unit check not run");
  }
});
