// MONARK Dojo -- DOJO-COLLECT-SIGTERM-UNLOCK-1 (G0 DRAND-RELAY-GET-1b section 4.2, test T7). The REAL collect.ts runs as a child under the
// preload helpers/sigterm-hang.mjs (no network, frozen clock, every fetch pending) and receives SIGTERM in the middle of a course: the
// beacon relays (child A, an empty state) or a reading (child B, plan.json and eve.json written beforehand, SYNTHETIC instants). Expected:
// exit 1, the stderr line, no lock left under the cycle of that course, one unlocked line per operator of the course on ITS cycle; then a
// --tick in this process on the same state resumes without lock_held. The variant by a real signal (child.kill) is skipped on win32, where
// it is a hard kill and no handler runs (Q-1 (a); item DOJO-SIGTERM-LINUX-PROOF-1, first Linux CI window).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { ENV, POOL, PYTH, QUOTE_VAULT, roots, sim, stateOf } from "./helpers/collect-chain.ts";
import { ANCHOR_DAY, anchorBody, betaOf, dateOf, seedChain } from "./helpers/dojo-fixture.ts";
import { runCollect } from "../src/collect.ts";

const H = 40, LABEL = "dojo-collect-sigterm-seed", SECRET = createHash("sha256").update(LABEL).digest("hex"), SEED = seedChain(LABEL, H); // SYNTHETIC
const ANCHOR = { ...anchorBody(SEED(0), H, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH };
const D1 = ANCHOR_DAY + 1, T1 = D1 * 86_400, LF = String.fromCharCode(10), U = "unlocked:dojo/collect: SIGTERM";
const COLLECT = fileURLToPath(new URL("../src/collect.ts", import.meta.url)), HANG = new URL("./helpers/sigterm-hang.mjs", import.meta.url).href;
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
type F = ReturnType<typeof stateOf>;
const argv = (f: F): string[] => ["--tick", "--state", f.state, "--mint-file", f.mint, "--max-calls", "24", "--max-credits", "40", "--seed-file", f.seed,
  "--anchor-file", f.anchor];
/** The child's environment, closed: the system paths only (no key, no credentials directory), the simulated chain's keys, the frozen clock. */
const envOf = (s: number, real = false): Record<string, string> => {
  const sys = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP, TMPDIR: process.env.TMPDIR };
  const all = { ...sys, ...ENV, DOJO_HANG_NOW_MS: String(s * 1000), DOJO_HANG_SIGNAL: real ? "real" : undefined };
  return Object.fromEntries(Object.entries(all).flatMap(([k, v]): [string, string][] => (v === undefined ? [] : [[k, v]])));
};
const codeOf = async (p: Promise<unknown>): Promise<string> => {
  try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? "Error"; }
};
/** Per operator of a cycle: its ledger outcomes (an unlocked line with its reason) and whether its lock is still there; [] when absent. */
const left = (f: F, cycle: string, ops: readonly string[]): [string[], boolean][] => ops.map((op) => {
  const p = join(f.state, "ledger", cycle, `${op}.jsonl`), lines = existsSync(p) ? readFileSync(p, "utf8").trim().split(LF) : [];
  const outcomes = lines.map((l) => JSON.parse(l) as { outcome: string; reason?: string });
  return [outcomes.map((e) => (e.outcome === "unlocked" ? `unlocked:${String(e.reason)}` : e.outcome)),
    existsSync(join(f.state, "ledger", cycle, `${op}.lock`))];
});

// killer: apps/dojo/src/collect.ts:297 SDL "process.on(" -> ""
test("dojo_collect_releases_locks_on_sigterm", async (t) => {
  const a = stateOf(ANCHOR, SECRET), b = stateOf(ANCHOR, SECRET), ti = T1 + 3600, plan = join(b.state, "bundles", dateOf(D1), "evidence");
  mkdirSync(plan, { recursive: true }); // child B: reading 1 is due at ti + 1 (a SYNTHETIC plan, motif of dojo_collect_reads_only_inside_the_window)
  const instants = [ti, ti + 3600, ti + 7200, ti + 10_800];
  writeFileSync(join(plan, "plan.json"), `${canonical({ beacon: { round: 1, signature: betaOf(D1) }, day: dateOf(D1), instants, reason: null })}${LF}`);
  writeFileSync(join(b.state, "bundles", dateOf(D1), "eve.json"), `${canonical({ addresses: [], accounts: [] })}${LF}`);
  for (const [name, f, at, cycle, ops, made] of [["A, the relays", a, T1 + 60, `drand-${dateOf(D1)}`, ["drand-pl", "drand-cf"], "evidence/plan.json"],
    ["B, a reading", b, ti + 1, ENV.HELIUS_CYCLE_ID, ["helius", "solana-foundation"], "readings/1.json"]] as const) {
    const r = spawnSync(process.execPath, ["--import", HANG, COLLECT, ...argv(f)], { encoding: "utf8", env: envOf(at), timeout: 60_000 });
    assert.deepEqual([r.status, r.stderr.includes("dojo/collect: sigterm"), left(f, cycle, ops)], [1, true, [[["attempted", U], false], [[U], false]]],
      `child ${name}: exit 1, the stderr line, each operator unlocked on its cycle, no lock left; stderr: ${r.stderr}`);
    Object.assign(sim, { reqs: [], beta: betaOf(D1), override: null, nowMs: at * 1000 });
    assert.equal(await codeOf(runCollect(argv(f), { env: ENV, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() })), "none", `${name}: the next step`);
    assert.ok(existsSync(join(f.state, "bundles", dateOf(D1), made)), `${name}: resumed without lock_held, ${made} written`);
  }
  const win32 = process.platform === "win32" ? "win32: child.kill is a hard kill, no handler runs (Q-1 (a))" : false;
  await t.test("a real SIGTERM (child.kill)", { skip: win32 }, async () => {
    const f = stateOf(ANCHOR, SECRET), cycle = `drand-${dateOf(D1)}`, lock = join(f.state, "ledger", cycle, "drand-pl.lock");
    const c = spawn(process.execPath, ["--import", HANG, COLLECT, ...argv(f)], { env: envOf(T1 + 60, true), stdio: "ignore" });
    const exited = new Promise<number | null>((ok) => { c.on("exit", (code) => { ok(code); }); });
    try {
      for (const t0 = Date.now(); !existsSync(lock) && Date.now() - t0 < 20_000 && c.exitCode === null;) await new Promise((ok) => setTimeout(ok, 50));
      c.kill("SIGTERM");
      assert.deepEqual([await exited, left(f, cycle, ["drand-pl", "drand-cf"])], [1, [[["attempted", U], false], [[U], false]]],
        "the handler ran on a real signal");
    } finally { if (c.exitCode === null) c.kill("SIGKILL"); }
  });
});
