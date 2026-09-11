/**
 * Root test `harness_deploy_config_targets_loopback` (ADR-M005 D7/D10, PLAN §H4). The COMMITTED
 * deployment configs the orchestrator deploys (deploy/monark-harness.service + deploy/Caddyfile.monark-harness)
 * MUST target the loopback harness on 127.0.0.1:3001 — the exact host:port server.ts binds — never a
 * public interface. Governance-only: deploy/ is not whitelisted for export, so this test lives at the
 * repo root and never runs inside the exported CI. No `any` (off the ratchet).
 *
 * Mutant: change the Caddy reverse_proxy target to 127.0.0.1:3002 (or 0.0.0.0:3001), or drop
 * Restart=always from the unit ⇒ red.
 *
 * Lot H6 adds `harness_deploy_config_has_resource_caps`: the deploy configs must carry the resource caps
 * that let the harness be a public, unauthenticated compute endpoint co-located with the vitrine — the
 * Caddy request-body cap on every harness host, and the systemd CPU/memory/task ceilings.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HOST, PORT } from "../apps/harness/src/server.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");

/** A top-level Caddy site block: its `header` (host list before `{`) and its `body` (between the braces). */
interface CaddyBlock {
  readonly header: string;
  readonly body: string;
}

/**
 * Extract the top-level Caddy site blocks by brace depth. Line comments (`# …`) are stripped first so a
 * brace or host name INSIDE a comment never shifts the parse; the `{host}` placeholder on `header_up` is
 * brace-balanced, so it does not affect the depth-0 boundaries. Property-based on purpose: the body-cap
 * test then holds whether mcp./api. share one block (as today) or are later split into two.
 */
function topLevelBlocks(text: string): CaddyBlock[] {
  const src = text.replace(/#[^\n]*/g, "");
  const out: CaddyBlock[] = [];
  let depth = 0;
  let headerStart = 0;
  let bodyStart = -1;
  let header = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") {
      if (depth === 0) {
        header = src.slice(headerStart, i).trim();
        bodyStart = i + 1;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && bodyStart >= 0) {
        out.push({ header, body: src.slice(bodyStart, i) });
        headerStart = i + 1;
        bodyStart = -1;
      }
    }
  }
  return out;
}

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

test("harness_deploy_config_has_resource_caps", () => {
  // --- Caddy request-body cap on EVERY harness host (Lot H6) -----------------------------------------
  // The endpoint is public + unauthenticated on the vitrine's VPS; an oversized body is a DoS vector, so
  // every site block that serves a harness host must cap the request body. Property, not layout: this
  // passes with today's single combined block AND with a future split into two per-host blocks.
  const caddy = read("deploy/Caddyfile.monark-harness");
  const blocks = topLevelBlocks(caddy);
  assert.ok(blocks.length > 0, "the Caddyfile has at least one site block");
  const HARNESS_HOSTS = ["mcp.monarkgate.tech", "api.monarkgate.tech"];
  for (const host of HARNESS_HOSTS) {
    const hostRe = new RegExp(`(^|[\\s,])${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|,|$)`);
    const serving = blocks.filter((b) => hostRe.test(b.header));
    assert.ok(serving.length > 0, `a Caddy site block serves ${host}`);
    for (const b of serving) {
      assert.ok(/\brequest_body\b/.test(b.body), `the block serving ${host} caps the request body (request_body directive)`);
      assert.ok(/\bmax_size\s+256\s*KB\b/i.test(b.body), `the block serving ${host} sets max_size 256KB`);
    }
  }

  // --- systemd CPU / memory / task ceilings (Lot H6) ------------------------------------------------
  // Bound the harness's share of the shared host so a crafted request cannot starve the vitrine. Pinned
  // to the agreed values; a mutant that drops ANY one of the three (or weakens a value) reddens.
  const unit = read("deploy/monark-harness.service");
  assert.ok(/^\s*CPUQuota\s*=\s*50%\s*$/m.test(unit), "unit caps CPU (CPUQuota=50%)");
  assert.ok(/^\s*MemoryMax\s*=\s*512M\s*$/m.test(unit), "unit caps memory (MemoryMax=512M)");
  assert.ok(/^\s*TasksMax\s*=\s*128\s*$/m.test(unit), "unit caps tasks (TasksMax=128)");
});

// Lot H7 (OBS-2, availability hardening): the unit must (a) bound V8's heap BELOW MemoryMax so V8 GCs
// rather than the cgroup OOM-killing the process mid-request, and (b) NOT let a sustained OOM/crash restart
// loop trip systemd's default start-limit and latch the unit dead. Mutants: (m1) drop --max-old-space-size
// from ExecStart => the heap-flag assertion reds; (m2) raise it to >= MemoryMax (e.g. 1024) => the
// heap<cap invariant reds; (m3) drop StartLimitIntervalSec=0 => the start-limit assertion reds.
test("harness_deploy_config_bounds_v8_heap_and_restart_loop", () => {
  const unit = read("deploy/monark-harness.service");

  // (a) V8 heap cap present ON the ExecStart directive line (scoped there on purpose: a comment that merely
  // mentions the flag must NOT satisfy this — the flag has to actually be on the exec line), in MiB
  // (nodejs.org CLI docs).
  const execMatch = /^\s*ExecStart\s*=.*$/m.exec(unit);
  assert.ok(execMatch, "unit has an ExecStart directive");
  const heapMatch = /--max-old-space-size=(\d+)\b/.exec(execMatch[0]);
  assert.ok(heapMatch, "ExecStart bounds V8's old-space heap (--max-old-space-size=<MiB>)");
  const heapMiB = Number(heapMatch[1]);
  assert.equal(heapMiB, 448, "the agreed V8 heap cap is 448 MiB");
  // The invariant that makes it load-bearing: the heap cap must sit BELOW MemoryMax (both MiB — systemd
  // suffixes are base-1024) so V8 GCs/throws before RSS hits the cgroup ceiling and the OOM-killer fires.
  const memMatch = /^\s*MemoryMax\s*=\s*(\d+)M\s*$/m.exec(unit);
  assert.ok(memMatch, "unit sets MemoryMax=<N>M");
  const memMiB = Number(memMatch[1]);
  assert.ok(heapMiB < memMiB, `V8 heap cap (${String(heapMiB)} MiB) must be below MemoryMax (${String(memMiB)} MiB) so V8 GCs before the cgroup OOM-kills`);

  // (b) start rate limiting disabled: a crash/OOM loop must NOT latch the Restart= unit into a dead state.
  assert.ok(/^\s*StartLimitIntervalSec\s*=\s*0\s*$/m.test(unit), "unit disables start rate limiting (StartLimitIntervalSec=0) so a crash/OOM loop cannot latch the unit dead");
});
