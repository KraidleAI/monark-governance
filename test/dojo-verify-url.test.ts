// MONARK Dojo -- PR-1b-4 test 8 (ADR-DOJO-PR-1B-4 D-3, section 4): the contract that the deployment check reads (DOJO-CA-FORMAT-1,
// c03 and c11; ADR-DOJO-PR-3 D-2 l.84) from the REAL verifier CLI, `--url <base> --keyring <file>`, over a loopback server of a tree
// signed at run time (apps/dojo/test/helpers/dojo-fixture.ts). execFile, asynchronous: the server answers while the child runs
// (spawnSync would block it; precedent test/verify-bell.test.ts:196). Expected values are recoded from the SERVED bytes, never read
// from the verifier. No network beyond 127.0.0.1. Its consumer (scripts/verify-dojo.mjs, PR-3b-2) is absent: the piece stays upcoming.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";
import { proofOf, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import * as dv from "../apps/dojo/scripts/dojo-verify.mjs"; // C-V-1: the new exports through the namespace, checked first
import { urlSource } from "../apps/dojo/scripts/dojo-verify-cli.mjs";
import { ADDR, ANCHOR_DAY, dateOf, dojoFixture, dojoKeyringOf, removeTrees, render, writeTree } from "../apps/dojo/test/helpers/dojo-fixture.ts";

type Ok = Extract<dv.DojoVerifyReport, { ok: true }>;
const SCRIPT = join(import.meta.dirname, "..", "apps", "dojo", "scripts", "dojo-verify-cli.mjs"); // PR-1b-5b (ADR-DOJO-PR-1B-5 PLI-1)
after(removeTrees);
const sha = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
/** The verifier CLI under `env`, asynchronous: [exit code, stdout]. */
const cli = (env: NodeJS.ProcessEnv, ...args: string[]): Promise<[number | null, string]> => new Promise((done) => {
  execFile(process.execPath, [SCRIPT, ...args], { encoding: "utf8", env, timeout: 60_000 }, (e, stdout) => {
    done([e === null ? 0 : typeof e.code === "number" ? e.code : null, stdout]);
  });
});
/** A success: exit 0 and exactly one line on stdout (D-3), asserted before its report is parsed. */
async function success(env: NodeJS.ProcessEnv, ...args: string[]): Promise<Ok> {
  const [code, out] = await cli(env, ...args);
  assert.deepEqual([code, out.indexOf("\n"), out.length > 1], [0, out.length - 1, true], out); // C-G2-1 (G2 of PR-1b-5b): an empty stdout is no line
  return JSON.parse(out) as Ok;
}
/** A loopback server (127.0.0.1, port 0) of the tree that `get` names at each request; each path asked, in order. */
// A `hook` that returns true has answered the request (or ended its connection) itself.
async function serve(get: () => ReadonlyMap<string, Buffer>, hook: (req: IncomingMessage, res: ServerResponse) => boolean = () => false):
  Promise<{ url: string; seen: string[]; close: () => Promise<void> }> {
  const seen: string[] = [], server = createServer((req, res) => {
    const p = req.url ?? "/", b = get().get(p.slice(1));
    seen.push(p);
    if (hook(req, res)) return;
    res.writeHead(b === undefined ? 404 : 200).end(b);
  });
  await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => { r(); }); });
  const a = server.address(), port = a !== null && typeof a === "object" ? a.port : 0;
  const close = (): Promise<void> => new Promise<void>((r) => { server.closeAllConnections(); server.close(() => { r(); }); });
  return { url: `http://127.0.0.1:${String(port)}`, seen, close };
}

// killer: apps/dojo/scripts/dojo-verify.mjs:349 CONST "sha256(tl)" -> "sha256(text.trim())"
test("dojo_verify_url_cli_is_the_ca_contract", async () => {
  assert.ok(Array.isArray(dv.DOJO_VERIFY_REPORT_KEYS), "the closed keys of a report are exported (D-3)");
  assert.deepEqual(dv.DOJO_VERIFY_REPORT_KEYS, ["active_key_id", "beacon_bls_verified", "breaks", "day", "detail", "head", "history", "inclusion",
    "ok", "reason", "scope", "seq", "snapshots", "status", "target", "timeline_sha256", "trust_root", "voided_lines"], "the 18 keys of D-3, canonical order");
  const f = dojoFixture(), tree = render(f.steps), kr = join(writeTree(new Map([["kr.json", Buffer.from(canonical(dojoKeyringOf([[f.key, 1]])))]])), "kr.json");
  const tl = tree.get("timeline.jsonl") ?? Buffer.alloc(0), rows = (rel: string): string[] => (tree.get(rel)?.toString("utf8") ?? "").split("\n").slice(0, -1);
  const signed = rows("timeline.jsonl").map((l) => JSON.parse(l) as Record<string, unknown>), [h, hi, d] = [signed[11] ?? {}, signed[1] ?? {}, signed[4] ?? {}];
  const lf = `lines/${String(h.lines_sha256)}.jsonl`, hf = `history/${String(hi.history_sha256)}.jsonl`, df = `lines/${String(d.lines_sha256)}.jsonl`;
  const clean: NodeJS.ProcessEnv = { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: undefined, NODE_EXTRA_CA_CERTS: undefined, NODE_USE_SYSTEM_CA: undefined,
    NODE_USE_ENV_PROXY: undefined, HTTP_PROXY: undefined, HTTPS_PROXY: undefined, http_proxy: undefined, https_proxy: undefined, no_proxy: undefined };
  let served: ReadonlyMap<string, Buffer> = tree;
  const srv = await serve(() => served);
  try {
    const r = await success(clean, "--url", srv.url, "--keyring", kr); // c03, as verify-bell.mjs:162-165 reads Bell's
    assert.deepEqual([Object.keys(r), r.ok, r.status, r.trust_root, r.detail], [dv.DOJO_VERIFY_REPORT_KEYS, true, "consistent_with_supplied_keyring",
      "supplied_keyring", null], "c03: the closed keys, ok under the supplied keyring");
    assert.deepEqual([r.head, r.day, r.history, r.timeline_sha256], [{ seq: 12, lines_sha256: h.lines_sha256, lines_count: h.lines_count,
      recomputed_root: rootOf(rows(lf)) }, h.day, { history_sha256: hi.history_sha256, history_lines_count: hi.history_lines_count,
      recomputed_root: rootOf(rows(hf)) }, sha(tl)], "c11: the head (its day at the first level, E-2), the history, the timeline's bytes");
    const lib = await dv.verifyDojoServed({ source: dv.dirSource(writeTree(tree)), keyring: dojoKeyringOf([[f.key, 1]]) }); // PR-1b-5b (PLI-4)
    assert.deepEqual(r, lib, "composition: the real CLI (dojo-verify-cli.mjs, --url) reports what the core reports on the same tree, detail null");
    const dr = rows(df), i = dr.findIndex((l) => l.includes(ADDR.A));
    const t = await success(clean, "--url", `${srv.url}/`, "--keyring", kr, "--day", dateOf(ANCHOR_DAY + 3), "--address", ADDR.A);
    assert.deepEqual([t.target, t.inclusion], [{ seq: 5, day: d.day, lines_sha256: d.lines_sha256, lines_count: d.lines_count, recomputed_root: rootOf(dr) },
      { address: ADDR.A, index: i, count: dr.length, line: dr[i], proof: proofOf(dr, i) }], "--day and --address through the CLI (D-2)");
    served = new Map([...tree, [lf, Buffer.from((tree.get(lf)?.toString("utf8") ?? "").replace("1500000", "1500001"))]]);
    assert.deepEqual(await cli(clean, "--url", srv.url, "--keyring", kr), [1, `${canonical({ ok: false, reason: "lines_sha_mismatch", seq: 12, day: h.day,
      detail: lf })}\n`], "an altered body: exit 1 and one refusal line");
    const odd = Buffer.from(tl.toString("utf8").replace('{"', '{ "')); // a timeline line out of canonical form, still accepted
    served = new Map([...tree, ["timeline.jsonl", odd]]);
    const o = await success(clean, "--url", srv.url, "--keyring", kr);
    assert.deepEqual([o.timeline_sha256, odd.equals(tl)], [sha(odd), false], "the verified bytes, never a re-serialization (TY-8)");
    served = render(f.steps.slice(0, 2)); // an anchor and its history, no snapshot yet: head null (c11 then fails, pli C-V-2)
    const z = await success(clean, "--url", srv.url, "--keyring", kr);
    assert.deepEqual([z.head, z.target, z.day, z.snapshots, Object.keys(z)], [null, null, null, 0, dv.DOJO_VERIFY_REPORT_KEYS], "the 18 keys, no head");
    served = tree;
    const n = srv.seen.length, e = await cli({ ...clean, NODE_TLS_REJECT_UNAUTHORIZED: "0" }, "--url", srv.url, "--keyring", kr);
    assert.deepEqual([e, srv.seen.length - n], [[1, `${canonical({ ok: false, reason: "insecure_url", seq: null, day: null,
      detail: "NODE_TLS_REJECT_UNAUTHORIZED" })}\n`], 0], "T-9 amended (FAITS F-1): refused before any GET");
    const env = { ...clean, NODE_EXTRA_CA_CERTS: join(tmpdir(), "dojo-verify-absent.pem"), NODE_USE_SYSTEM_CA: "1", NODE_USE_ENV_PROXY: "1" };
    assert.equal((await success(env, "--url", srv.url, "--keyring", kr)).detail, "TLS environment: NODE_EXTRA_CA_CERTS, NODE_USE_SYSTEM_CA, NODE_USE_ENV_PROXY",
      "FAITS F-2, F-4, F-5: the variables named, never their values");
    served = new Map([...tree].filter(([k]) => k !== "dojo/pubkey.json")); // ADR-DOJO-PR-1B-5 D-3 (b), V-2: a refusal under the TLS variables
    assert.deepEqual(await cli(env, "--url", srv.url, "--keyring", kr), [1, `${canonical({ ok: false, reason: "http_status", seq: null, day: null,
      detail: "dojo/pubkey.json" })}\n`], "V-2: a refusal keeps its own detail (the path), never the TLS note");
  } finally { await srv.close(); }
});

// killer: apps/dojo/scripts/dojo-verify-cli.mjs:103 CONST "tries > 1 ||" -> "tries > 0 ||"
test("dojo_verify_url_replays_a_get_once_on_a_closed_socket", async () => {
  // A kept-alive connection the host closed while the check computed fails the next GET before any answer (measured: "other side closed",
  // UND_ERR_SOCKET; a reset socket: ECONNRESET). The server below ends the connection of the first GETs of the served key set the same way.
  const f = dojoFixture(), tree = render(f.steps), NL = String.fromCharCode(10), KEY = "/dojo/pubkey.json", servers: Array<{ close: () => Promise<void> }> = [];
  const kr = join(writeTree(new Map([["kr.json", Buffer.from(canonical(dojoKeyringOf([[f.key, 1]])))]])), "kr.json");
  const clean: NodeJS.ProcessEnv = { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: undefined, NODE_EXTRA_CA_CERTS: undefined, NODE_USE_SYSTEM_CA: undefined,
    NODE_USE_ENV_PROXY: undefined, HTTP_PROXY: undefined, HTTPS_PROXY: undefined, http_proxy: undefined, https_proxy: undefined, no_proxy: undefined };
  /** A server of the tree whose first `n` GETs of the key set end their connection by `end` before any answer; the sockets those GETs came on. */
  const closing = async (n: number, end: (s: Socket) => void): Promise<{ url: string; tries: () => number; sockets: Socket[] }> => {
    let left = n;
    const sockets: Socket[] = [], srv = await serve(() => tree, (req) => {
      if (req.url !== KEY) return false;
      sockets.push(req.socket);
      if (left === 0) return false;
      left -= 1;
      end(req.socket);
      return true;
    });
    servers.push(srv);
    return { url: srv.url, tries: () => srv.seen.filter((p) => p === KEY).length, sockets };
  };
  const refusal = (reason: string): string => `${canonical({ ok: false, reason, seq: null, day: null, detail: "dojo/pubkey.json" })}${NL}`;
  try {
    const plain = await serve(() => tree);
    servers.push(plain);
    const want = await success(clean, "--url", plain.url, "--keyring", kr);
    // Closed (FIN) or reset (RST) before any answer: the same GET once more, on a new connection, and the report of a clean run.
    for (const [name, end] of [["closed", (s: Socket) => { s.destroy(); }], ["reset", (s: Socket) => { s.resetAndDestroy(); }]] as const) {
      const one = await closing(1, end), got = await success(clean, "--url", one.url, "--keyring", kr);
      assert.deepEqual([got, one.tries(), new Set(one.sockets).size], [want, 2, 2], `${name}: replayed once, on a new connection`);
    }
    // Closed twice: never a third try, the refusal of a host out of reach.
    const twice = await closing(2, (s) => { s.destroy(); });
    assert.deepEqual([await cli(clean, "--url", twice.url, "--keyring", kr), twice.tries()], [[1, refusal("unreachable")], 2], "one replay at most");
    // An answer came, then a status or a body cut short: no replay, one try each (the caller's refusals).
    const status = await serve(() => tree, (req, res) => { if (req.url !== KEY) return false; res.writeHead(503).end(); return true; });
    const cut = await serve(() => tree, (req, res) => {
      if (req.url !== KEY) return false;
      res.writeHead(200, { "content-length": "100" }).write("{");
      setTimeout(() => { req.socket.destroy(); }, 50);
      return true;
    });
    servers.push(status, cut);
    for (const [name, srv, reason] of [["a status", status, "http_status"], ["a body cut short", cut, "unreachable"]] as const) {
      const out = await cli(clean, "--url", srv.url, "--keyring", kr);
      assert.deepEqual([out, srv.seen.filter((p) => p === KEY).length], [[1, refusal(reason)], 1], `${name}: no replay`);
    }
    // The GET's own timer: a host that never answers is out of reach after one try (its signal aborted), never replayed.
    const mute = await closing(1, () => undefined), src = urlSource(mute.url, { ...dv.VERIFY_BOUNDS, TIMEOUT_MS: 300 });
    await assert.rejects(src.get("dojo/pubkey.json"), (e: unknown) => (e as { code?: unknown }).code === "unreachable", "the timer: refused");
    assert.equal(mute.tries(), 1, "the timer: one try");
  } finally { for (const s of servers) await s.close(); }
});
