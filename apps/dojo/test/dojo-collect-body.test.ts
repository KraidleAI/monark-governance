// MONARK Dojo -- the collector's body bound (RPC-GUARD-BODY-TIMEOUT-1, orchestrator ruling Q-1; inspection of part 1, collect AC-1):
// both courses open the guard with { boundBody: true } (collect.ts:131), so a body over the cap (DEFAULT_MAX_BODY_BYTES) is refused
// by name after ONE attempt (BodyTooLarge, code 200) and never parsed: a relay's beta gives no plan this pass, a chain piece is null.
// Cases 1 and 4 of the inspection's probe B. The legacy read (no option) would parse the padded JSON: a plan, a piece kept (red).
// fetch is the simulated chain's (helpers/collect-chain.ts: no socket, no name resolution); clock and sleeps injected; SYNTHETIC seed.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { ENV, POOL, PYTH, QUOTE_VAULT, roots, sim, stateOf, type Req } from "./helpers/collect-chain.ts";
import { ANCHOR_DAY, anchorBody, betaOf, dateOf, seedChain } from "./helpers/dojo-fixture.ts";
import { readRecord } from "../src/bundle.ts";
import { runCollect } from "../src/collect.ts";
import { DEFAULT_MAX_BODY_BYTES } from "../../../packages/rpc-guard/src/transport.ts"; // not exported by the guard's index

const H = 40, LABEL = "dojo-collect-body-seed", SECRET = createHash("sha256").update(LABEL).digest("hex"), SEED = seedChain(LABEL, H); // SYNTHETIC
const ANCHOR = { ...anchorBody(SEED(0), H, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH };
const D1 = ANCHOR_DAY + 1, T1 = D1 * 86_400, LF = String.fromCharCode(10);
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
type F = ReturnType<typeof stateOf>;
const run = (f: F, ...mode: string[]): Promise<void> => runCollect(["--state", f.state, "--mint-file", f.mint, "--max-calls", "24", "--max-credits", "40",
  "--seed-file", f.seed, "--anchor-file", f.anchor, ...mode], { env: ENV, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() });
const codeOf = async (p: Promise<unknown>): Promise<string> => {
  try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? (e as Error).constructor.name; }
};
const fresh = (): F => { Object.assign(sim, { reqs: [], beta: null, override: null }); return stateOf(ANCHOR, SECRET); };
const day = (f: F, ...p: string[]): string => join(f.state, "bundles", dateOf(D1), ...p);
/** The calls of the last line of evidence/runs.jsonl of day D1; the outcomes of one relay's ledger on that day. */
const calls = (f: F): unknown[][] =>
  (JSON.parse(readFileSync(day(f, "evidence", "runs.jsonl"), "utf8").trim().split(LF).at(-1) ?? "{}") as { calls: unknown[][] }).calls;
const outcomes = (f: F, op: string): string[] => readFileSync(join(f.state, "ledger", `drand-${dateOf(D1)}`, `${op}.jsonl`), "utf8").trim().split(LF)
  .map((l) => (JSON.parse(l) as { outcome: string }).outcome);
/** A 200 whose JSON is valid once padded with blanks to more than the cap: only the bound refuses it. */
const over = (json: string): Response => new Response(`${json}${" ".repeat(DEFAULT_MAX_BODY_BYTES)}`, { status: 200 });

// killer: apps/dojo/src/collect.ts:131 CONST "{ boundBody: true }" -> "{}"
test("dojo_collect_refuses_a_body_over_the_cap_by_name", async () => {
  // (1) The relay drand-cf answers over the cap (drand-pl the world): ONE GET each, BodyTooLarge code 200, no plan this pass; the
  //     attempt is kept in the guard's ledger and the lock released (attempted, unlocked).
  const f = fresh(), beta = betaOf(D1);
  const relay = (q: Req): Response => over(JSON.stringify({ round: Number(String(q.params[0]).split("/").pop()),
    randomness: createHash("sha256").update(Buffer.from(beta, "hex")).digest("hex"), signature: beta }));
  Object.assign(sim, { beta, nowMs: (T1 + 60) * 1000, override: (q: Req) => (q.op === "drand-cf" ? relay(q) : undefined) });
  assert.equal(await codeOf(run(f, "--plan")), "none", "a relay over the cap is no plan, never a stop");
  assert.deepEqual([existsSync(day(f, "evidence", "plan.json")), sim.reqs.map((q) => q.op), calls(f).slice(1), outcomes(f, "drand-cf")],
    [false, ["drand-pl", "drand-cf"], [["drand-cf", "GET", null, "BodyTooLarge", 200]], ["attempted", "unlocked"]], "a relay over the cap");
  // (2) The gPA piece of helius over the cap at reading 1: ONE request, BodyTooLarge code 200, the piece null (one fault of two).
  const g = fresh();
  Object.assign(sim, { beta, nowMs: (T1 + 60) * 1000 });
  assert.equal(await codeOf(run(g, "--plan")), "none", "the plan of the day, both relays in the world");
  writeFileSync(day(g, "eve.json"), `${canonical({ addresses: [], accounts: [] })}${LF}`);
  const inst = (JSON.parse(readFileSync(day(g, "evidence", "plan.json"), "utf8")) as { instants: number[] }).instants;
  const gpa = (q: Req): boolean => q.op === "helius" && q.method === "getProgramAccounts";
  Object.assign(sim, { reqs: [], nowMs: ((inst[0] ?? 0) + 1) * 1000,
    override: (q: Req) => (gpa(q) ? over('{"jsonrpc":"2.0","id":1,"result":{"context":{"slot":1},"value":[]}}') : undefined) });
  assert.equal(await codeOf(run(g, "--reading", "1")), "none", "a piece over the cap is a null piece, the reading written");
  const rec = readRecord(readFileSync(day(g, "readings", "1.json"), "utf8"));
  assert.deepEqual([calls(g).filter((c) => c[0] === "helius" && c[1] === "getProgramAccounts"), sim.reqs.filter(gpa).length, rec.faults.enumeration],
    [[["helius", "getProgramAccounts", null, "BodyTooLarge", 200]], 1, 1], "a gPA piece over the cap");
});
