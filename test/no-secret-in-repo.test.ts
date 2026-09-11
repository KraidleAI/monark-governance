/**
 * Root test `no_secret_in_repo` (ADR-M005 D10, PLAN §H4; MAST "secret leak"). The harness is deployed by
 * the orchestrator with NO secret committed — the systemd unit sets no Environment=, the Caddy block
 * needs no token (HTTP-01), and nothing in the tree carries a credential. This walks the committed tree
 * for HIGH-SIGNAL secret markers only (private-key blocks, cloud/token prefixes), so the fixtures' hex
 * `key` fields and package-lock's sha512 integrity hashes are NOT false positives. Governance-only (not
 * whitelisted); it walks the WHOLE tree, so it stays at the repo root and skips installed deps/build
 * output/binaries. No `any` (off the ratchet).
 *
 * Mutant: commit a private key / token in any scanned file ⇒ red (proven by the non-vacuity check below
 * and, in the passe report, by planting a key then restoring byte-exact via sha256).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../", import.meta.url));
/** This detector file carries FAKE secret-shaped samples for its own non-vacuity check; it is the one
 *  file exempt from the scan (a detector never scans its own fixtures — the honesty-lint precedent). */
const SELF = fileURLToPath(import.meta.url);

/** Never walked: installed deps, VCS metadata, build output. */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".next", ".turbo"]);
/** Known-binary extensions (skipped); any other file with a NUL byte is treated as binary too. */
const BINARY_EXT = new Set([".cbor", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".pdf", ".zip", ".gz", ".wasm", ".mp4", ".lock"]);
const MAX_BYTES = 4 * 1024 * 1024;

/** HIGH-SIGNAL secret markers only — each is a credential shape, not a generic long string. */
const SECRET_PATTERNS: ReadonlyArray<{ re: RegExp; name: string }> = [
  { re: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/, name: "private key block" },
  { re: /\bAKIA[0-9A-Z]{16}\b/, name: "AWS access key id" },
  { re: /\bghp_[0-9A-Za-z]{36}\b/, name: "GitHub PAT (classic)" },
  { re: /\bgithub_pat_[0-9A-Za-z_]{40,}\b/, name: "GitHub PAT (fine-grained)" },
  { re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/, name: "Slack token" },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/, name: "Google API key" },
];

interface Hit { file: string; pattern: string; line: number }

function scanFile(abs: string, rel: string, hits: Hit[]): number {
  if (abs === SELF) return 0; // the detector's own fake-secret fixtures are exempt from its scan
  if (BINARY_EXT.has(extname(abs).toLowerCase())) return 0;
  const buf = readFileSync(abs);
  if (buf.length > MAX_BYTES || buf.includes(0)) return 0; // oversized or binary (NUL) -> skip
  const text = buf.toString("utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { re, name } of SECRET_PATTERNS) if (re.test(line)) hits.push({ file: rel, pattern: name, line: i + 1 });
  }
  return 1;
}

function walk(absDir: string, relDir: string, hits: Hit[]): number {
  let scanned = 0;
  for (const name of readdirSync(absDir)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(absDir, name);
    const rel = relDir ? `${relDir}/${name}` : name;
    if (statSync(abs).isDirectory()) scanned += walk(abs, rel, hits);
    else scanned += scanFile(abs, rel, hits);
  }
  return scanned;
}

test("no_secret_in_repo", () => {
  // non-vacuity: the scanner actually FIRES on real credential shapes (else a green would be meaningless).
  assert.ok(SECRET_PATTERNS.some((p) => p.re.test("-----BEGIN OPENSSH PRIVATE KEY-----")), "detects a private key block");
  assert.ok(SECRET_PATTERNS.some((p) => p.re.test("AKIA1234567890ABCDEF")), "detects an AWS key id");

  const hits: Hit[] = [];
  const scanned = walk(REPO, "", hits);
  assert.ok(scanned > 50, `implausibly few files scanned (${String(scanned)}) — the walk is broken`);
  assert.deepEqual(hits, [], `committed secret(s) found:\n${hits.map((h) => `  ${h.file}:${String(h.line)} [${h.pattern}]`).join("\n")}`);
});
