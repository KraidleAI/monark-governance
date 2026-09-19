// UKEMI (ADR-U1 D4/D6) — LIVE recorder CLI (off-tool, NOT run in CI; a run-guarded main). Builds the quorum-2
// pool over the measured keyless providers, gates B ≤ finalized (D7: the finalized tag only, never the mutable head),
// records the full book, and writes the live G1 artifact (book + digest + provenance) OUTSIDE the repo. The
// committed fixture is the reduced subset; the full book at B is this live artifact (ADR-U1 D9). Provenance
// (endpoints, timing, calls, ukemi_sha) is OUTSIDE the digest. Usage:
//   node apps/sentinel/src/ukemi/record.ts --cluster weth --block 23545087 --out <path.json>
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import type { RpcCall } from "../rpc.ts";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, RpcError } from "./rpc2.ts";
import { recordBook } from "./book.ts";
import { clusterById } from "./clusters.ts";

/** A default JSON-RPC round-trip (fetch); the pool injects it. Additive to the sentinel (record.ts is new). */
export const defaultCall: RpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${url}`); // transport fault (benched by the quorum)
    const json = (await res.json()) as { result?: unknown; error?: { code?: number; message?: string; data?: unknown } };
    // A JSON-RPC error is a typed RpcError (code + optional revert data): the quorum classifies an EVM revert
    // (concordant ⇒ on-chain fact) apart from a transport/rate fault (benched) — ADR-U1 D3 amendment, V-1.
    if (json.error) throw new RpcError(json.error.message ?? "rpc error", json.error.code ?? 0, typeof json.error.data === "string" ? json.error.data : undefined);
    return json.result;
  } finally { clearTimeout(to); }
};

/** sha256 over the recorder sources ukemi/**.ts (the build witness, ADR-U1 D2/C-6). OUTSIDE the digest. */
export function ukemiSha(dir: string): string {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
  const h = createHash("sha256");
  for (const f of files) h.update(f + "\0").update(readFileSync(join(dir, f)));
  return h.digest("hex");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const arg = (k: string): string | undefined => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const cluster = clusterById(arg("--cluster") ?? "weth");
  const here = dirname(fileURLToPath(import.meta.url));

  let calls = 0;
  const counting: RpcCall = (u, m, p) => { calls++; return defaultCall(u, m, p); };
  const pool = makeUkemiPool({ call: counting, ethCallProviders: ETH_CALL_PROVIDERS, getLogsProviders: GET_LOGS_PROVIDERS, minIntervalMs: 200 });

  const fin = await pool.finalized();
  const blockArg = arg("--block");
  const block = blockArg !== undefined ? Number(blockArg) : fin.block;
  if (block > fin.block) throw new Error(`ukemi/record: B=${String(block)} > finalized ${String(fin.block)} (look-ahead forbidden, ADR-U1 D7)`);

  const t0 = Date.now();
  const res = await recordBook(cluster, block, pool);
  const seconds = (Date.now() - t0) / 1000;

  const provenance = {
    model: "claude-opus-4-8[1m]", recorded_at_utc: new Date().toISOString(),
    endpoints: { eth_call: ETH_CALL_PROVIDERS, eth_getLogs: GET_LOGS_PROVIDERS }, quorum: 2,
    calls, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
    counts: res.counts, holders_digest: res.holders_digest, book_digest: res.book_digest,
    hf_findings: res.hf_findings, timeline: res.timeline,
  };
  const out = arg("--out") ?? join(here, "..", "..", "..", "..", "ukemi-book-live.json");
  writeFileSync(out, JSON.stringify({ provenance, book: res.book }, null, 2));
  process.stdout.write(`ukemi/record cluster=${cluster.id} B=${String(block)} book_digest=${res.book_digest}\n` +
    `  holders=${String(res.counts.holders)} at_risk=${String(res.counts.at_risk)} eligible=${String(res.counts.eligible)} ` +
    `excluded={coll_off:${String(res.counts.excluded_collateral_off)},no_debt:${String(res.counts.excluded_no_debt)},zero_bal:${String(res.counts.excluded_zero_balance)}}\n` +
    `  calls=${String(calls)} seconds=${seconds.toFixed(1)} ukemi_sha=${provenance.ukemi_sha}\n  out=${out}\n`);
}

if (process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch((e: unknown) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
