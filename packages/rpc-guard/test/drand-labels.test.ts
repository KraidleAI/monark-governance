// DRAND-RELAY-GET-1a (ADR-RPC-GUARD-DRAND-1 D-1, D-3, D-4): the two keyless drand relay labels resolve ONE host each and ONE closed GET
// path (a v1 round of the pinned quicknet chain), are counted at cost 0 through the public path, and the guard holds the per-relay
// per-day attempt cap (4) across courses. Offline: globalThis.fetch is a stub; a socket or a name resolution throws (traps armed at
// import). Hosts and hash are the FAITS / ADR values (docs/dojo/FAITS-drand-relays-terms-2026-09-27.md l.5, l.21, l.26); the round
// body is SYNTHETIC in the v1 shape {round, randomness, signature} (FAITS l.30); the other-chain hashes below are SYNTHETIC, except the default chain's, READ on site (FAITS l.33).
import { test } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, runCli, BudgetExceededError, DRAND_RELAY_LABELS, type CycleLedgerEntry, type OperatorLabel, type RunLimits } from "@monark/rpc-guard";
import { resolveOperators, DRAND_QUICKNET_HASH } from "../src/transport.ts";
import { tmp, FAKE_HELIUS_ENV, ONE_METHOD_LIMITS } from "./harness.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("drand-labels: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("drand-labels: a name was resolved"); }) as never;

const HASH = "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"; // FAITS l.21, l.26 (/info of both relays)
const HOST: Readonly<Record<string, string>> = { "drand-pl": "api.drand.sh", "drand-cf": "drand.cloudflare.com" }; // ADR D-1, FAITS l.5
const ROUND = `/${HASH}/public/1`, BS = String.fromCharCode(92);
const BODY = { round: 1, signature: "ab".repeat(48), randomness: "cd".repeat(32) };
const op = (l: string): OperatorLabel => l as OperatorLabel;
async function offline(onFetch: (url: string, init: RequestInit | undefined) => void, run: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = ((i: string | URL, init?: RequestInit) => { onFetch(String(i), init); return Promise.resolve(new Response(JSON.stringify(BODY), { status: 200, headers: { "content-type": "application/json" } })); }) as typeof globalThis.fetch;
  try { await run(); } finally { globalThis.fetch = real; }
}
const ledger = (dir: string, cycle: string, label: string): CycleLedgerEntry[] => {
  const p = join(dir, cycle, `${label}.jsonl`);
  return existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry) : [];
};
const outcomes = (dir: string, cycle: string, label: string): string[] => ledger(dir, cycle, label).map((e) => (e.outcome === "refused" ? `refused:${String(e.reason)}` : e.outcome));

test("rpc_guard_drand_labels_are_host_bound", async () => {
  assert.deepEqual([...DRAND_RELAY_LABELS], ["drand-pl", "drand-cf"], "the two exported labels, dot-free (Bell BARE_LABEL)");
  assert.equal(DRAND_QUICKNET_HASH, HASH, "the pinned quicknet hash (FAITS l.21, l.26)");
  const { classes, transport } = resolveOperators({});
  const seen: unknown[][] = [];
  await offline((u, init) => { seen.push([u, init?.method, init?.body, init?.redirect]); }, async () => {
    for (const l of DRAND_RELAY_LABELS) {
      assert.deepEqual(classes[l], { unit: "keyless" }, `${l}: keyless (cost 0, counted)`);
      assert.deepEqual(await transport(op(l), "GET", [ROUND]), BODY, `${l}: the v1 body is returned verbatim, never unwrapped`);
      const h = HOST[l]!;
      // D-1 named refusals, the round bounds, and the RAW-string superset (bare "?" and "#", dot segment, backslash, blank, absolute url).
      for (const p of ["/info", `/${HASH}/info`, "/v2/beacons/quicknet/rounds/1", "/public/latest", `/${HASH}/public/latest`, `/${HASH}/public/0`,
        `/${HASH}/public/01`, `/${HASH}/public/${"9".repeat(17)}`, `/${HASH.toUpperCase()}/public/1`, `/${HASH.slice(0, 63)}8/public/1`, `/${"0".repeat(64)}/public/1`,
        "/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/1", // the default chain, full hash (FAITS l.33; ADR 14:06Z Q-3)
        `${ROUND}?x=1`, `${ROUND}?`, `${ROUND}#f`, `${ROUND}#`, `/${HASH}/public/2/../1`, `/${HASH}${BS}public${BS}1`, ` ${ROUND}`, `${ROUND}/`,
        `//${h}${ROUND}`, `//${h}.evil.invalid${ROUND}`, `//x${h}${ROUND}`, `https://${h}${ROUND}`, ""])
        await assert.rejects(transport(op(l), "GET", [p]), /off the closed drand round path/, `${l}: '${p}' refused before any fetch`);
      await assert.rejects(transport(op(l), "getAccountInfo", [{ encoding: "jsonParsed" }]), /off the closed drand round path/, `${l}: a non-string params[0] (TY-5)`);
    }
  });
  assert.deepEqual(seen, DRAND_RELAY_LABELS.map((l) => [`https://${HOST[l]!}${ROUND}`, "GET", undefined, "manual"]), "one GET per label on its exact host, no body, redirect never followed; 0 fetch on a refusal");
  const { dir, cleanup } = tmp();
  try {
    // Public path, cycle drand-<day>: one attempted line at cost 0 per label, on disk BEFORE its GET (motif P6); maxCalls 2 held.
    const day = "drand-2026-09-27", at: string[] = [];
    const c = openGuardedClient({}, { maxCalls: 2, runCaps: {}, methodCaps: {}, cycleFloor: {} }, dir, { "drand-pl": day, "drand-cf": day });
    await offline((u) => { const l = DRAND_RELAY_LABELS.find((x) => new URL(u).hostname === HOST[x])!; at.push(`${l}:${String(ledger(dir, day, l).length)}`); }, async () => {
      for (const l of DRAND_RELAY_LABELS) await c.call(op(l), "GET", [ROUND]);
      await assert.rejects(c.call(op("drand-pl"), "GET", [ROUND]), BudgetExceededError, "maxCalls 2 held: the third call is refused before any fetch");
    });
    assert.deepEqual(at, ["drand-pl:1", "drand-cf:1"], "each GET is preceded by its write-ahead ledger line (P6)");
    assert.deepEqual(DRAND_RELAY_LABELS.map((l) => ledger(dir, day, l).map((e) => [e.cycle_id, e.by_op_method, e.outcome, e.credits_derived, e.reason ?? null])),
      [[[day, { "drand-pl|GET": 1 }, "attempted", 0, null], [day, { "drand-pl|GET": 1 }, "refused", 0, "run_calls"]], [[day, { "drand-cf|GET": 1 }, "attempted", 0, null]]]);
    // TY-5 (pli cp-1 C-V-4, verdict 11:07Z): a drand label passed as a Bell operator. Bell's JSON-RPC params (an address, or a non-string
    // params[0]) reach the GET transport AFTER meter + commit and are refused by the path rule: one attempted line at cost 0 per call
    // under the CALLING cycle, nothing under drand-<day>, 0 fetch.
    const bell = openGuardedClient({}, { maxCalls: 10, runCaps: {}, methodCaps: {}, cycleFloor: {} }, dir, { "drand-pl": "bell-cycle" });
    let fetched = 0;
    await offline(() => { fetched += 1; }, async () => {
      await assert.rejects(bell.call(op("drand-pl"), "getAccountInfo", ["A".repeat(44), { encoding: "jsonParsed" }]), /off the closed drand round path/);
      await assert.rejects(bell.call(op("drand-pl"), "getTransaction", [{ encoding: "json" }]), /off the closed drand round path/);
    });
    assert.deepEqual([fetched, ledger(dir, day, "drand-pl").length], [0, 2], "TY-5: 0 fetch, nothing under drand-<day>");
    assert.deepEqual(ledger(dir, "bell-cycle", "drand-pl").map((e) => [e.by_op_method, e.outcome, e.credits_derived]),
      [[{ "drand-pl|getAccountInfo": 1 }, "attempted", 0], [{ "drand-pl|getTransaction": 1 }, "attempted", 0]], "TY-5: the attempted lines sit under the calling cycle");
    runCli(["unlock", "--cycle", day, "--op", "drand-pl", "--reason", "C-G2-3"], { ledgerDir: dir, floor: 0, readSnapshot: () => { throw new Error("unused"); } }); // left above: 1 attempted + 1 refused
    const again = openGuardedClient({}, { maxCalls: 4, runCaps: {}, methodCaps: {}, cycleFloor: {}, cycleAttempts: { "drand-pl": 2 } }, dir, { "drand-pl": day });
    await offline(() => undefined, async () => { await assert.doesNotReject(again.call(op("drand-pl"), "GET", [ROUND]), "a refused line is not an attempt: admitted at prior 1"); await assert.rejects(again.call(op("drand-pl"), "GET", [ROUND]), BudgetExceededError, "a refused line is not an attempt: prior 1, cap 2"); });
  } finally { cleanup(); }
});

test("rpc_guard_keyless_cycle_attempts_hold_across_courses", async () => {
  // D-1 (b), pli cp-1 C-V-1: 4 attempts per relay and per day (cycle drand-<day>), held by the guard. Prior = the attempted lines of the
  // ledger at open, never the course alone (refused and served-unlock lines are not attempts); the fifth is refused (cycle_attempts)
  // before any fetch; another day is not affected. maxCalls 4 = one passage (2 relays x TRIES 2).
  const { dir, cleanup } = tmp();
  const limits = (cap: number): RunLimits => ({ maxCalls: 4, runCaps: {}, methodCaps: {}, cycleFloor: {}, cycleAttempts: { "drand-pl": cap, "drand-cf": cap } });
  const course = async (cycle: string, calls: string[]): Promise<string[]> => {
    const c = openGuardedClient({}, limits(4), dir, { "drand-pl": cycle, "drand-cf": cycle }), out: string[] = [];
    try { for (const l of calls) out.push(await c.call(op(l), "GET", [ROUND]).then(() => "ok", (e: unknown) => (e instanceof BudgetExceededError ? "refused" : String(e)))); }
    finally { for (const l of DRAND_RELAY_LABELS) runCli(["unlock", "--cycle", cycle, "--op", l, "--reason", "course end"], { ledgerDir: dir, floor: 0, readSnapshot: () => { throw new Error("unused"); } }); }
    return out;
  };
  const day = "drand-2026-09-27", hosts: string[] = [];
  try {
    await offline((u) => { hosts.push(new URL(u).hostname); }, async () => {
      assert.deepEqual(await course(day, ["drand-pl", "drand-cf", "drand-pl", "drand-cf"]), ["ok", "ok", "ok", "ok"], "course 1: one passage");
      assert.deepEqual(await course(day, ["drand-pl", "drand-pl", "drand-pl", "drand-cf"]), ["ok", "ok", "refused", "ok"], "course 2: prior 2 read at open, the fifth drand-pl attempt refused");
      assert.deepEqual(await course(day, ["drand-cf", "drand-cf", "drand-pl"]), ["ok", "refused", "refused"], "course 3: prior 3 (drand-cf) and 4 (drand-pl)");
      assert.deepEqual(await course("drand-2026-09-28", ["drand-pl", "drand-cf"]), ["ok", "ok"], "another day (cycle) is not affected");
    });
    const [pl, cf, R] = ["api.drand.sh", "drand.cloudflare.com", "refused:cycle_attempts"];
    assert.deepEqual(hosts, [pl, cf, pl, cf, pl, pl, cf, cf, pl, cf], "4 GET per relay on the day, 0 on a refusal, then 1 each on the next day");
    assert.deepEqual(outcomes(dir, day, "drand-pl"), ["attempted", "attempted", "unlocked", "attempted", "attempted", R, "unlocked", R, "unlocked"]);
    assert.deepEqual(outcomes(dir, day, "drand-cf"), ["attempted", "attempted", "unlocked", "attempted", "unlocked", "attempted", R, "unlocked"]);
    await offline(() => undefined, async () => { assert.deepEqual(await course("drand-2026-09-29", ["drand-pl", "drand-pl", "drand-pl", "drand-pl", "drand-pl"]), ["ok", "ok", "ok", "ok", "refused"]); });
    assert.deepEqual(outcomes(dir, "drand-2026-09-29", "drand-pl"), ["attempted", "attempted", "attempted", "attempted", "refused:run_calls", "unlocked"], "Q-7: maxCalls 4 and cap 4 bite on the fifth call, run_calls is checked first");
    // The cap is validated BEFORE any lock (fail-closed): an integer > 0, on a keyless operator only.
    for (const bad of [0, -1, 2.5, Number.NaN]) assert.throws(() => openGuardedClient({}, limits(bad), dir, { "drand-pl": "drand-bad" }), BudgetExceededError, `cap ${String(bad)}`);
    assert.throws(() => openGuardedClient(FAKE_HELIUS_ENV, { ...ONE_METHOD_LIMITS, cycleAttempts: { helius: 4 } }, dir, { helius: "drand-bad" }), BudgetExceededError, "a cap on a paid operator");
    assert.ok(!existsSync(join(dir, "drand-bad")), "no cycle dir and no lock before a refused config");
    assert.doesNotThrow(() => openGuardedClient({}, { ...limits(4), cycleAttempts: { "drand-cf": 4 } }, dir, { "drand-pl": "drand-q6" }), "a valid cap naming an unrequested operator is ignored (Q-6)");
    assert.throws(() => openGuardedClient({}, { ...limits(4), cycleAttempts: { "drand-pl": 4, "drand-cf": 0 } }, dir, { "drand-pl": "drand-q6b" }), BudgetExceededError, "an invalid cap naming an unrequested operator is validated, then refused (Q-C1, K-2)");
  } finally { cleanup(); }
});
