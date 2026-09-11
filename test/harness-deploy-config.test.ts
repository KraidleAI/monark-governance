/**
 * Root test `harness_deploy_config_targets_loopback` (ADR-M005 D7/D10, PLAN §H4). The COMMITTED
 * deployment configs the orchestrator deploys (deploy/monark-harness.service + deploy/Caddyfile.monark-harness)
 * MUST target the loopback harness on 127.0.0.1:3001 — the exact host:port server.ts binds — never a
 * public interface. Governance-only: deploy/ is not whitelisted for export, so this test lives at the
 * repo root and never runs inside the exported CI. No `any` (off the ratchet).
 *
 * Mutant: change the Caddy reverse_proxy target to 127.0.0.1:3002 (or 0.0.0.0:3001), or drop
 * Restart=always from the unit ⇒ red.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HOST, PORT } from "../apps/harness/src/server.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");

test("harness_deploy_config_targets_loopback", () => {
  // The bind the configs must match IS the server's own default (code is the single source of truth).
  assert.equal(HOST, "127.0.0.1", "server binds loopback");
  assert.equal(PORT, 3001, "server binds port 3001");
  const target = `${HOST}:${String(PORT)}`; // "127.0.0.1:3001"

  // --- Caddy site block ---------------------------------------------------------------------------
  const caddy = read("deploy/Caddyfile.monark-harness");
  assert.ok(caddy.includes("mcp.monarkgate.tech"), "Caddy block serves the mcp. sub-domain");
  assert.ok(caddy.includes("api.monarkgate.tech"), "Caddy block serves the api. sub-domain");
  // Escape ALL regex metacharacters (incl. backslash) so the derived pattern is injection-safe (js/incomplete-sanitization).
  const targetRe = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.ok(new RegExp(`reverse_proxy\\s+${targetRe}\\b`).test(caddy), `Caddy reverse_proxy targets ${target}`);
  assert.ok(!caddy.includes("0.0.0.0"), "Caddy never targets 0.0.0.0");
  // no TLS secret in the committed block (HTTP-01 is automatic; K-7 = no Cloudflare token here).
  assert.ok(!/api[_-]?key|token|secret/i.test(caddy), "Caddy block carries no secret");

  // --- systemd unit -------------------------------------------------------------------------------
  const unit = read("deploy/monark-harness.service");
  assert.ok(/^\s*Restart\s*=\s*always\s*$/m.test(unit), "unit sets Restart=always");
  assert.ok(/^\s*ExecStart\s*=.*apps\/harness\/src\/server\.ts\s*$/m.test(unit), "ExecStart runs apps/harness/src/server.ts (which binds 127.0.0.1:3001)");
  assert.ok(/^\s*WorkingDirectory\s*=\s*\/opt\/monark-harness\s*$/m.test(unit), "WorkingDirectory is the deployed repo root");
  assert.ok(/^\s*WantedBy\s*=\s*multi-user\.target\s*$/m.test(unit), "unit is enable-able (WantedBy=multi-user.target)");
  const userMatch = /^\s*User\s*=\s*(\S+)\s*$/m.exec(unit);
  assert.ok(userMatch, "unit sets a User (least privilege)");
  assert.notEqual(userMatch[1], "root", "the harness must NOT run as root");
  assert.ok(!/^\s*Environment\s*=/m.test(unit), "no Environment= (no secret in the unit)");
});
