/**
 * Test helper (not a test file): a CLOSED-SUBSET model of Caddy v2 for deploy/Caddyfile.monark-bell (ADR-T1b-backend v2 D10,
 * backlog S-8/S-9). It parses the committed Caddyfile and serves a real publisher public/ directory on 127.0.0.1 with the
 * headers READ FROM THAT FILE, so the loopback tests exercise the committed configuration, not a copy. Subset: one site
 * block; `root [*] <dir>`; named matchers `@n path <p>...` and `@n not path <p>...`; `header [@n|/path] <Field> <value>`;
 * `file_server [browse]`. Anything else is kept in `directives` (so a test can refuse it) and makes `serveCaddy` throw
 * (fail-closed: no server runs on a configuration this model does not understand). The live Caddy is checked by the CA at
 * the D-n (scripts/verify-bell.mjs checks 6-8); this model is declared as such, never as Caddy.
 */
import { createServer } from "node:http";
import type { Server } from "node:http";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { runMain } from "../apps/bell/src/collect.ts";
import { POOLS } from "../apps/bell/src/pools.ts";
import { f64BitsHexLE } from "../apps/bell/src/rebase-trajectory.ts";
import type { DatabentoGet, PolygonGet } from "../apps/bell/src/close.ts";
import type { JsonRpcCall } from "../apps/bell/src/quorum.ts";
import { canonical, keyringOf } from "../apps/bell/scripts/bell-chain.mjs";
import { publishToDir } from "../apps/bell/scripts/bell-publish.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));
/** ONE real runMain output, offline, --out outside the repo (assertOutsideRepo); calque of apps/bell/test/bell-publish-validate.test.ts
 *  runMainOut (@ 64dbbd6): synthetic swap and cash close, never a real value; `usdc` sets the vwap, hence the bell_sha. */
async function runMainOut(usdc: bigint): Promise<string> {
  const pool = POOLS.find((p) => p.baseSymbol === "TSLAx" && p.chain === "solana");
  if (pool === undefined) throw new Error("TSLAx pool missing");
  const btMs = Date.UTC(2026, 8, 19, 13, 31, 4);
  const bal = (base: string, quote: string): unknown[] => [{ accountIndex: 0, uiTokenAmount: { amount: base } }, { accountIndex: 1, uiTokenAmount: { amount: quote } }];
  const swap = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: pool.vaultBase }, { pubkey: pool.vaultQuote }] } },
    meta: { err: null, preTokenBalances: bal("1000000000", "5000000000"), postTokenBalances: bal("1100000000", String(5_000_000_000n - usdc * 1_000_000n)) } };
  const b64 = (m: number): string => { const b = new Uint8Array(56), v = new DataView(b.buffer); v.setFloat64(32, m, true); v.setFloat64(48, m, true); return Buffer.from(b).toString("base64"); };
  const call: JsonRpcCall = (_url, method, params) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "sig1", slot: 1, blockTime: Math.floor(btMs / 1000), err: null }]);
    if (method === "getTransaction") return Promise.resolve(swap);
    if (method === "getAccountInfo") return Promise.resolve((params[1] as { encoding?: string } | undefined)?.encoding === "base64"
      ? { context: { slot: 9 }, value: { data: [b64(1), "base64"] } } : { context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } });
    throw new Error("unexpected " + method);
  };
  const databentoGet: DatabentoGet = () => Promise.resolve([{ hd: { ts_event: String(BigInt(Date.UTC(2026, 8, 18)) * 1_000_000n) }, close: "364000000000" }]);
  const polygonGet: PolygonGet = () => Promise.reject(new Error("not reached offline"));
  const base = tmp("t1b3-run-"), out = join(base, "run"), traj = join(base, "traj.json");
  writeFileSync(traj, JSON.stringify({ TSLAx: { events: [{ kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "s1" }], scanComplete: true, scanMethod: "authority" } }));
  await runMain(["--pools", "TSLAx", "--max-calls", "100000", "--body-sample", "0", "--min-interval", "0", "--from-utc", String(btMs - 2 * 86_400_000),
    "--to-utc", String(btMs + 86_400_000), "--rebase-trajectory", traj, "--out", out],
  { call, databentoGet, polygonGet, env: { BELL_HALTS_CSV: join(REPO, "apps", "bell", "test", "fixtures", "halts-tsla-synth.csv") }, nowMs: btMs + 86_400_000 });
  return out;
}
export interface RealPublication { stateDir: string; publicDir: string; privateKey: KeyObject; keyringText: string }
/** Two REAL publications (seq 1 and 2) of two real runMain runs by publishToDir, with a test key generated here (never committed).
 *  keyringText = the canonical committed-keyring form of that key (what the RUNBOOK commits, C-9). */
export async function realPublication(): Promise<RealPublication> {
  const privateKey = generateKeyPairSync("ed25519").privateKey, stateDir = tmp("t1b3-state-");
  for (const [i, usdc] of [365n, 366n].entries()) {
    cpSync(await runMainOut(usdc), join(stateDir, "inbox", `b${String(i)}`, "run0"), { recursive: true });
    publishToDir({ inboxDir: join(stateDir, "inbox"), stateDir, privateKey, clock: () => 1_800_000_000_000 + i });
  }
  return { stateDir, publicDir: join(stateDir, "public"), privateKey, keyringText: canonical(keyringOf(privateKey, 1)) + "\n" };
}

export interface Matcher { readonly negate: boolean; readonly paths: readonly string[] }
export interface HeaderRule { readonly matcher: string | null; readonly field: string; readonly value: string }
export interface CaddySite {
  readonly address: string;
  readonly root: string | null;
  readonly matchers: ReadonlyMap<string, Matcher>;
  readonly headers: readonly HeaderRule[];
  readonly fileServer: boolean;
  readonly browse: boolean;
  /** Every directive name in the block, in file order (named matcher definitions excluded). */
  readonly directives: readonly string[];
}

/** Split one line into tokens: bare words and double-quoted strings; `#` starts a comment at a token boundary. */
function tokens(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const c = line.charAt(i);
    if (c === " " || c === "\t") { i++; continue; }
    if (c === "#") break;
    if (c === '"') {
      const end = line.indexOf('"', i + 1);
      if (end < 0) throw new Error(`caddy model: unterminated quote in: ${line}`);
      out.push(line.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    let j = i;
    while (j < line.length && line.charAt(j) !== " " && line.charAt(j) !== "\t") j++;
    out.push(line.slice(i, j));
    i = j;
  }
  return out;
}

/** Parse the site blocks of a Caddyfile in the closed subset above (a nested block inside a site throws). */
export function parseCaddyfile(text: string): CaddySite[] {
  const sites: CaddySite[] = [];
  let cur: { address: string; root: string | null; matchers: Map<string, Matcher>; headers: HeaderRule[]; fileServer: boolean; browse: boolean; directives: string[] } | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const t = tokens(raw);
    if (t.length === 0) continue;
    if (cur === null) {
      if (t.length !== 2 || t[1] !== "{") throw new Error(`caddy model: expected '<address> {', got: ${raw}`);
      cur = { address: t[0] ?? "", root: null, matchers: new Map(), headers: [], fileServer: false, browse: false, directives: [] };
      continue;
    }
    if (t.length === 1 && t[0] === "}") { sites.push(cur); cur = null; continue; }
    if (t.includes("{") || t.includes("}")) throw new Error(`caddy model: nested block not in the subset: ${raw}`);
    const [head = "", ...rest] = t;
    if (head.startsWith("@")) {
      const negate = rest[0] === "not";
      const body = negate ? rest.slice(1) : rest;
      if (body[0] !== "path" || body.length < 2) throw new Error(`caddy model: matcher outside the subset: ${raw}`);
      cur.matchers.set(head, { negate, paths: body.slice(1) });
      continue;
    }
    cur.directives.push(head);
    // Fail-closed (G2 PR-3 C-3): Caddy does not read a repeated root/file_server as "the last wins" (matched instances), so the
    // subset admits ONE `root * <dir>` and ONE `file_server [browse]`; any duplicate or other token is refused, never modelled.
    if (head === "root") {
      if (cur.root !== null || rest.length !== 2 || rest[0] !== "*") throw new Error(`caddy model: root outside the subset (one "root * <dir>"): ${raw}`);
      cur.root = rest[1] ?? null;
    } else if (head === "file_server") {
      if (cur.fileServer || rest.length > 1 || (rest.length === 1 && rest[0] !== "browse")) throw new Error(`caddy model: file_server outside the subset (one, [browse]): ${raw}`);
      cur.fileServer = true;
      cur.browse = rest.length === 1;
    }
    else if (head === "header") {
      const m = rest[0] !== undefined && (rest[0].startsWith("@") || rest[0].startsWith("/")) ? rest[0] : null;
      const kv = m === null ? rest : rest.slice(1);
      if (kv.length !== 2) throw new Error(`caddy model: header form outside the subset: ${raw}`);
      cur.headers.push({ matcher: m, field: kv[0] ?? "", value: kv[1] ?? "" });
    }
  }
  if (cur !== null) throw new Error("caddy model: unclosed site block");
  return sites;
}

/** Caddy path-pattern subset: a trailing `*` is a prefix match, otherwise an exact match. */
const pathMatches = (p: string, pattern: string): boolean => (pattern.endsWith("*") ? p.startsWith(pattern.slice(0, -1)) : p === pattern);
/** The response headers the site sets on request path `p` (every header rule whose matcher matches). */
export function headersFor(site: CaddySite, p: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of site.headers) {
    let ok = true;
    if (h.matcher !== null && h.matcher.startsWith("/")) ok = pathMatches(p, h.matcher);
    else if (h.matcher !== null) {
      const m = site.matchers.get(h.matcher);
      if (m === undefined) throw new Error(`caddy model: undefined matcher ${h.matcher}`);
      const any = m.paths.some((x) => pathMatches(p, x));
      ok = m.negate ? !any : any;
    }
    if (ok) out[h.field.toLowerCase()] = h.value;
  }
  return out;
}

const SUBSET = new Set(["root", "header", "file_server"]);
/**
 * Serve `site` on 127.0.0.1:0 with its root REPLACED by `rootDir` (the committed root is a host path). GET/HEAD only; a
 * `..` segment is a 400; a directory is a listing only under `browse`, else a 404 (Caddy file_server without browse).
 */
export function serveCaddy(site: CaddySite, rootDir: string): Server {
  const extra = site.directives.filter((d) => !SUBSET.has(d));
  if (extra.length > 0 || !site.fileServer || site.root === null) throw new Error(`caddy model: refuses to serve (${extra.join(",") || "no file_server/root"})`);
  return createServer((req, res) => {
    let p: string;
    try { p = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/"); } catch { res.writeHead(400); res.end(); return; }
    const hs = headersFor(site, p);
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, hs); res.end(); return; }
    if (p.split("/").includes("..") || p.includes("\\") || p.includes("\0")) { res.writeHead(400, hs); res.end(); return; }
    const f = join(rootDir, ...p.split("/").filter((s) => s !== ""));
    if (!(f === rootDir || f.startsWith(rootDir + sep)) || !existsSync(f)) { res.writeHead(404, hs); res.end(); return; }
    if (statSync(f).isDirectory()) {
      if (!site.browse) { res.writeHead(404, hs); res.end(); return; }
      res.writeHead(200, { ...hs, "content-type": "text/html; charset=utf-8" });
      res.end(readdirSync(f).map((n) => `<a href="${n}">${n}</a>`).join("\n"));
      return;
    }
    const body = readFileSync(f);
    res.writeHead(200, { ...hs, ...(extname(f) === ".json" ? { "content-type": "application/json" } : {}), "content-length": String(body.length) });
    res.end(req.method === "HEAD" ? undefined : body);
  });
}
