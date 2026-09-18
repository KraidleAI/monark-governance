/**
 * Harness — stateless MCP server + HTTP/JSON mirror (ADR-M005 D1/D6/D7).
 *
 * Transport: MCP Streamable HTTP via `createMcpHandler` (SDK v2). The factory returns a FRESH
 * `McpServer` per request — that IS the stateless model (D6): no session, no persisted budget; B_t
 * is caller-carried in and out. `keepAliveMs = 15000` (D7).
 *
 * TWO surfaces on the ONE `127.0.0.1:3001` listener, routed by Host (Caddy fronts both sub-domains ->
 * this port, D7/D10): `mcp.monarkgate.tech` -> the MCP handler (below); `api.monarkgate.tech` -> the
 * HTTP/JSON mirror (`./http.ts`), a byte-faithful JSON mirror of the same four tools / frozen schemas.
 * Host validation is OPT-IN in the SDK via `enableDnsRebindingProtection` — it defaults to `false`
 * (`@modelcontextprotocol/server@2.0.0/dist/index.mjs:333`) and `validateRequestHeaders` returns early
 * when it is disabled (`:390`); the harness does not enable it, so the SDK performs NO Host check. Passing
 * the public Host through Caddy is therefore safe; routing keys on the request URL's hostname, not the
 * (fetch-forbidden) Host header. The Origin guard runs on BOTH surfaces, before dispatch.
 *
 * Origin (K-9/C-1): a PRESENT-and-invalid Origin ⇒ `403`; an ABSENT Origin ⇒ ACCEPTED (non-browser
 * MCP clients send none). Built on the SDK's `validateOriginHeader` (parse + deny-on-failure), with a
 * subdomain wrapper for `monarkgate.tech` + sub-domains. Bind: `127.0.0.1:3001` only (K-8/C-10).
 *
 * Importing this module is SIDE-EFFECT-FREE: the listener starts only under the run-guard (direct
 * `node src/server.ts`), never on import — the tests import `HOST`/`originGuard`/`startServer` freely.
 */
import { createServer, type IncomingMessage, type ServerResponse, type Server as HttpServer } from "node:http";
import { Readable } from "node:stream";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpHandler, McpServer, validateOriginHeader } from "@modelcontextprotocol/server";
import type { McpHttpHandler } from "@modelcontextprotocol/server";
import { registerTools } from "./tools/registry.ts";
import { handleJsonMirror } from "./http.ts";
import { HARNESS_VERSION } from "./version.ts";

/** Bind host — localhost ONLY (K-8/C-10). Never `0.0.0.0`. */
export const HOST = "127.0.0.1";
export const PORT = 3001;
export const KEEP_ALIVE_MS = 15000;
/**
 * Hard request-body cap: the harness aborts a body larger than this and answers `413`, streaming
 * — it never buffers past the cap. This is the INNER backstop behind Caddy's 256KB `request_body`
 * (deploy/Caddyfile.monark-harness); the harness cap is looser (512 KiB) so Caddy rejects first in prod,
 * and the harness still fail-closes if a request reaches the loopback listener directly (Caddy bypassed).
 */
export const MAX_REQUEST_BODY_BYTES = 512 * 1024;
/** MCP server name — the fleet name `monark`, never a caller/agent brand (R-P1 Q4). */
export const SERVER_NAME = "monark";

/** Origin allowlist apex; `monarkgate.tech` and its sub-domains are accepted (K-9/C-1). */
export const ORIGIN_APEX = "monarkgate.tech";

/** Host prefix that selects the HTTP/JSON mirror surface (`api.` -> JSON); `mcp.`/anything else -> MCP. */
export const API_HOST_PREFIX = "api.";

/**
 * Route selection (D7/D10): the JSON mirror serves requests whose Host is the `api.` sub-domain; the MCP
 * handler serves `mcp.` and everything else (incl. a direct `127.0.0.1` dev call). Keys on the URL's
 * hostname — `toWebRequest` builds the URL from the Node `Host` header, and `Host` is a forbidden fetch
 * header so `request.headers.get("host")` is unreliable, but the URL always carries it.
 */
export function isJsonMirrorHost(request: Request): boolean {
  return new URL(request.url).hostname.startsWith(API_HOST_PREFIX);
}

/**
 * K-9/C-1 Origin decision. Absent/empty ⇒ accepted; malformed ⇒ rejected; apex or a sub-domain of the
 * apex ⇒ accepted; any other present hostname ⇒ rejected. Parsing/deny-on-failure delegate to the
 * SDK's `validateOriginHeader`; the sub-domain suffix is layered on top.
 */
export function isHarnessOriginAllowed(originHeader: string | null | undefined): boolean {
  if (originHeader === null || originHeader === undefined || originHeader === "") return true;
  const apex = validateOriginHeader(originHeader, [ORIGIN_APEX]);
  if (apex.ok) return true;
  if (apex.errorCode === "invalid_origin_header") return false; // unparseable ⇒ deny
  const hostname = apex.hostname;
  return hostname !== undefined && hostname.endsWith("." + ORIGIN_APEX);
}

/** Returns a `403` response when the request's Origin is present-and-invalid, else `undefined`. */
export function originGuard(request: Request): Response | undefined {
  const origin = request.headers.get("origin");
  if (isHarnessOriginAllowed(origin)) return undefined;
  return new Response(JSON.stringify({ error: "invalid_origin", origin }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });
}

/** The stateless MCP handler: a fresh `McpServer` with the tools registered, per request (D6). */
export function createHarnessHandler(): McpHttpHandler {
  return createMcpHandler(
    () => {
      const server = new McpServer({ name: SERVER_NAME, version: HARNESS_VERSION });
      registerTools(server);
      return server;
    },
    { keepAliveMs: KEEP_ALIVE_MS },
  );
}

function toWebRequest(req: IncomingMessage, body: Uint8Array | undefined): Request {
  const hostHeader = req.headers.host ?? `${HOST}:${String(PORT)}`;
  const url = `http://${hostHeader}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else if (typeof value === "string") headers.set(key, value);
  }
  const method = req.method ?? "GET";
  const init: RequestInit = { method, headers };
  if (body !== undefined && method !== "GET" && method !== "HEAD") init.body = body;
  return new Request(url, init);
}

/** Sentinel returned by `readBodyBounded` when the body crosses the cap (kept module-private). */
const BODY_TOO_LARGE = Symbol("body_too_large");

/**
 * Streaming bounded body reader. Accumulates the request body and STOPS as soon as it exceeds
 * `limit`, so a crafted oversized body never buffers past the cap — memory stays ~O(limit + one chunk).
 * Returns the body bytes for a legitimate request, or `BODY_TOO_LARGE` when the cap is crossed.
 *
 * `destroyOnReturn:false` is load-bearing: breaking the `for await` calls the iterator's `return()`, and
 * Node's default (`destroyOnReturn:true`) would DESTROY `req` — which shares the socket with `res` and
 * would drop the `413` we still owe the caller. So we stop reading but leave the socket alive; the caller
 * sets `Connection: close` on the `413` so the undrained remainder cannot poison a keep-alive socket.
 */
async function readBodyBounded(req: IncomingMessage, limit: number): Promise<Uint8Array | typeof BODY_TOO_LARGE> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false }) as AsyncIterable<Buffer>) {
    total += chunk.length;
    if (total > limit) return BODY_TOO_LARGE;
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks));
}

async function handleNodeRequest(req: IncomingMessage, res: ServerResponse, handler: McpHttpHandler): Promise<void> {
  try {
    const method = req.method ?? "GET";
    // K-9 Origin guard runs FIRST (both surfaces), on a HEADER-ONLY request: a present-and-invalid Origin
    // is refused with 403 BEFORE the body is read, so a bad-origin oversized body is never buffered.
    const rejected = originGuard(toWebRequest(req, undefined));
    if (rejected !== undefined) {
      res.writeHead(rejected.status, { ...Object.fromEntries(rejected.headers), connection: "close" });
      res.end(await rejected.text());
      return;
    }
    // Accepted origin: read the body under the hard streaming cap. Oversized => 413, fail-closed,
    // BEFORE dispatch. GET/HEAD carry no body. For any legitimate (< cap) request the bytes handed to the
    // downstream handlers are byte-identical to the previous unbounded read, so the MCP `tools/call` (SSE)
    // and the HTTP-mirror paths are unchanged.
    let body: Uint8Array | undefined;
    if (method !== "GET" && method !== "HEAD") {
      const read = await readBodyBounded(req, MAX_REQUEST_BODY_BYTES);
      if (read === BODY_TOO_LARGE) {
        res.writeHead(413, { "content-type": "application/json", connection: "close" });
        res.end(JSON.stringify({ error: "payload_too_large", max_bytes: MAX_REQUEST_BODY_BYTES }));
        return;
      }
      body = read;
    }
    const request = toWebRequest(req, body);
    const response = isJsonMirrorHost(request) ? await handleJsonMirror(request) : await handler.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body !== null) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end(await response.text());
    }
  } catch {
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "internal_error" }));
  }
}

/**
 * Start the HTTP listener on `host:port` (defaults: `127.0.0.1:3001`). Returns the `http.Server` so a
 * caller (or a test) can read `server.address()` and close it. The default host is the security
 * property under test (`harness_binds_localhost_only`): a caller that overrides it does not defeat it.
 */
export function startServer(port: number = PORT, host: string = HOST): HttpServer {
  const handler = createHarnessHandler();
  const server = createServer((req, res) => {
    void handleNodeRequest(req, res, handler);
  });
  server.listen(port, host);
  return server;
}

// Run-guard: listen ONLY when invoked directly (`node src/server.ts`), never on import.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  startServer();
}
