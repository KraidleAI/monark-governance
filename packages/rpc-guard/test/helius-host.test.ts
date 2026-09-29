// RPC-GUARD-HELIUS-HOST-1 (ADR-RPC-GUARD-RECONCILE-1 D-3, D-4 TU-host, D-5 (12)): the FIRST BELL_SOLANA_RPC element is checked structurally
// before the helius key is attached; any other endpoint is refused BY NAME before any lock, ledger line or fetch, never echoed. Through the
// REAL openGuardedClient; offline: globalThis.fetch is a spy, a socket or a name resolution throws (traps armed at import). PROD is the
// literal of apps/bell/ops/launch-q6.sh:45, an oracle independent of the admitted list (private to transport.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { inspect } from "node:util";
import { openGuardedClient, type BudgetedClient, type OperatorLabel, type RunLimits } from "@monark/rpc-guard";
import { operatorLabels } from "../src/transport.ts";
import { HELIUS, okFetch, tmp } from "./harness.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("helius-host: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("helius-host: a name was resolved"); }) as never;

const KEY = "FAKEKEY-HOST-3k3k3k3k", PROD = "https://mainnet.helius-rpc.com/"; // PROD = launch-q6.sh:45
const NAMED = "rpc-guard: operator 'helius' refused: BELL_SOLANA_RPC host not admitted (fail-closed, RPC-GUARD-HELIUS-HOST-1)";
const LIMITS: RunLimits = { maxCalls: 10, runCaps: { helius: 1000, chainstack: 1000 }, methodCaps: { getTransaction: 5, eth_blockNumber: 5 }, cycleFloor: { helius: 0, chainstack: 0 } };
// The D-5 (12) list in its order (userinfo: a user alone, a password alone), then declared additions: both userinfo parts, the admitted
// host as a user name before another host, the `.invalid` suffix without its dot (M-H2), a subdomain (the domain suffix D-3 rejects).
const REFUSED = [
  "https://mainnet.helius-rpc.co/", "https://mainnet-helius-rpc.com/", "https://mainnet.helius-rpc.com.evil.example/",
  "https://evilhelius-rpc.com/", "https://x.invalid.evil.example/", "https://evil.example/mainnet.helius-rpc.com/",
  "https://u@mainnet.helius-rpc.com/", "https://:p@mainnet.helius-rpc.com/", "http://mainnet.helius-rpc.com/",
  "https://mainnet.helius-rpc.com:8443/", "https://mainnet.helius-rpc.com/?x=1", "https://mainnet.helius-rpc.com/#f", "not-a-url-scheme",
  `https://solana-mainnet.core.chainstack.com/FAKE-CS-PATH,${PROD}`,
  "https://u:p@mainnet.helius-rpc.com/", "https://mainnet.helius-rpc.com@evil.example/", "https://evilinvalid/", "https://x.helius-rpc.com/",
  "https://mainnet.helius-rpc.com./", "https://x.mainnet.helius-rpc.com/", // Q-2: a trailing dot; D-3: a subdomain of the exact host
];

test("helius_key_is_never_sent_off_host", async () => {
  const { dir, cleanup } = tmp();
  const real = globalThis.fetch, sent: string[] = [];
  globalThis.fetch = ((i: string | URL) => { sent.push(String(i)); return okFetch(); }) as typeof globalThis.fetch;
  let n = 0; // one fresh cycle per course (a course's lock is never released here)
  const open = (env: Record<string, string>, op: string): { cyc: string; client: () => BudgetedClient } => { n += 1; const cyc = `c${String(n)}`; return { cyc, client: () => openGuardedClient(env, LIMITS, dir, { [op]: cyc }) }; };
  const envOf = (base: string, key: string | undefined): Record<string, string> => (key === undefined ? { BELL_SOLANA_RPC: base } : { BELL_SOLANA_RPC: base, HELIUS_API_KEY: key });
  try {
    // (a) ADMITTED: the exact admitted host, ONE `api-key` set by the URL API (& = # encoded, never injected); no key, no parameter.
    const admitted: ReadonlyArray<readonly [string, string | undefined, string]> = [
      [PROD, KEY, `${PROD}?api-key=${KEY}`], // the production string = the former concatenation (D-3)
      ["https://MAINNET.Helius-RPC.COM/", KEY, `${PROD}?api-key=${KEY}`], // upper case admitted: the parsed host is lower case
      ["https://helius.example.invalid/RPC", KEY, `https://helius.example.invalid/RPC?api-key=${KEY}`], // .invalid admitted, free path
      [PROD, "FAKE&x=1#f", `${PROD}?api-key=FAKE%26x%3D1%23f`],
      [PROD, undefined, PROD],
      ["https://mainnet.helius-rpc.com:443/", KEY, `${PROD}?api-key=${KEY}`], // Q-2: :443 is normalized away
      [`${PROD}?`, KEY, `${PROD}?api-key=${KEY}`], // Q-2: a bare ?, the key replaces the empty query
      [`${PROD}#`, KEY, `${PROD}?api-key=${KEY}#`], // Q-2: a bare #, a fragment is never sent
      [PROD, "", PROD], // an empty key: no api-key parameter, as the former concatenation
    ];
    for (const [base, key, want] of admitted) {
      const env = envOf(base, key);
      assert.ok(operatorLabels(env).includes(HELIUS), `${base} resolves helius`);
      await open(env, "helius").client().call(HELIUS, "getTransaction", [1]);
      assert.equal(sent.at(-1), want, `the fetch target for ${base}`);
      assert.equal(new URL(sent.at(-1) ?? "").searchParams.get("api-key"), key || null, "one api-key parameter: the key itself");
    }
    // (b) REFUSED, with and without a key: named, before any lock (no cycle dir: no lock, no line), no fetch, never echoed, no label.
    for (const base of REFUSED) for (const key of [KEY, undefined]) {
      const env = envOf(base, key), { cyc, client } = open(env, "helius"), before = sent.length;
      const first = base.split(",")[0] ?? base, host = URL.canParse(first) ? new URL(first).hostname : first;
      assert.throws(client, (e: unknown) => {
        assert.ok(e instanceof Error);
        assert.equal(e.message, NAMED, `the named refusal for ${base}`);
        const seen = inspect(e, { depth: 5 });
        for (const s of [base, first, host, KEY]) assert.ok(!seen.includes(s), `the refusal of ${base} echoes ${s}`);
        return true;
      });
      assert.equal(existsSync(join(dir, cyc)), false, `${base}: refused before any lock`);
      assert.equal(sent.length, before, `${base}: no fetch`);
      assert.ok(!operatorLabels(env).includes(HELIUS), `${base}: helius is not a resolved label`);
    }
    // (c) a course that does not request helius is untouched by a refused BELL_SOLANA_RPC (the Ukemi recorder, Narabi).
    const cs = { BELL_SOLANA_RPC: "https://evil.example/", HELIUS_API_KEY: KEY, CHAINSTACK_ETH_URL: "https://cs.example.invalid/FAKE-CS" };
    await open(cs, "chainstack").client().call("chainstack" as OperatorLabel, "eth_blockNumber", []);
    assert.equal(sent.at(-1), "https://cs.example.invalid/FAKE-CS", "the chainstack course runs");
    assert.deepEqual(operatorLabels(cs).filter((l) => l === HELIUS || l === "chainstack"), ["chainstack"], "helius refused, chainstack resolved");
    assert.throws(open({ HELIUS_API_KEY: KEY }, "helius").client, /is not resolved from env/, "BELL_SOLANA_RPC absent: not resolved, never the named refusal");
    assert.throws(open(envOf(PROD, KEY), "toString").client, /'toString' is not resolved from env/, "a prototype-named label is never resolved (Q-G2-5)");
    assert.equal(sent.length, admitted.length + 1, "one fetch per admitted course, none for a refusal");
  } finally { globalThis.fetch = real; cleanup(); }
});
