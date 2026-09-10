/**
 * Harness — stateless MCP server (ADR-M005 D1/D6/D7).
 *
 * Transport: MCP Streamable HTTP via `createMcpHandler` (SDK v2). The factory returns a FRESH
 * `McpServer` per request — that IS the stateless model (D6): no session, no persisted budget; B_t
 * is caller-carried in and out. `keepAliveMs = 15000` (D7).
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
import { buffer } from "node:stream/consumers";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpHandler, McpServer, validateOriginHeader } from "@modelcontextprotocol/server";
import type { McpHttpHandler } from "@modelcontextprotocol/server";
import { registerTools } from "./tools/registry.ts";

/** Bind host — localhost ONLY (K-8/C-10). Never `0.0.0.0`. */
export const HOST = "127.0.0.1";
export const PORT = 3001;
export const KEEP_ALIVE_MS = 15000;
/** MCP server name — the fleet name `monark`, never a caller/agent brand (R-P1 Q4). */
export const SERVER_NAME = "monark";

/** Origin allowlist apex; `monarkgate.tech` and its sub-domains are accepted (K-9/C-1). */
export const ORIGIN_APEX = "monarkgate.tech";

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
      const server = new McpServer({ name: SERVER_NAME, version: "1.0.0" });
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

async function handleNodeRequest(req: IncomingMessage, res: ServerResponse, handler: McpHttpHandler): Promise<void> {
  try {
    const method = req.method ?? "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await buffer(req));
    const request = toWebRequest(req, body);
    const rejected = originGuard(request); // K-9 Origin check BEFORE dispatch
    const response = rejected ?? (await handler.fetch(request));
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
