/**
 * Root test `no_secret_in_repo` (ADR-M005 D10, PLAN §H4; MAST "secret leak"). The harness is deployed by
 * the orchestrator with NO secret committed — the systemd units set no inline secret (the sentinel's
 * optional Chainstack endpoint key lives in an out-of-repo EnvironmentFile, /etc/monark/sentinel.env, never
 * committed — ADR-NARABI-OPS-1 C-5), the Caddy block needs no token (HTTP-01), and nothing in the tree
 * carries a credential. This walks the committed tree
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
  // ADR-T1aii C-10 / RESSOURCES-HELIUS §3.3: a Helius api key is a UUID (8-4-4-4-12 hex); flag it ONLY in an
  // api-key CONTEXT (query param / header), so a base58 mint or a plain hex id is not a false positive.
  { re: /api[-_]?key["' ]*[=:]["' ]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, name: "api-key UUID (Helius-shaped)" },
  // ADR-T1aii-D1-bis C-10 (lot -b1): a Chainstack Solana/EVM endpoint carries its key IN THE PATH as a 32-hex
  // token (core.chainstack.com/<hex32>) or on the legacy p2pify host (nd-*.p2pify.com/<hex>). These shapes ARE
  // the credential, so — unlike the Helius UUID — no extra "api-key" context is required; the host+hex path IS
  // the context. A WebSocket url can carry the same key (wss://…/<hex>). Fail-closed by design (a false
  // positive blocks a commit; a false negative leaks a paid RPC key). No committed file carries these today
  // (measured 2026-09-20); artefacts holding raw endpoints live OUTSIDE the tree (F:/tmp, CA-11).
  { re: /(?:core\.)?chainstack\.com\/[0-9a-f]{32}/i, name: "Chainstack RPC url (hex key in path)" },
  { re: /p2pify\.com\/[0-9a-f]+/i, name: "Chainstack p2pify RPC url (hex key in path)" },
  { re: /wss:\/\/[^\s"']*\/[0-9a-f]{16,}/i, name: "WebSocket url with a hex key in the path" },
  // A Bearer token (Massive/Polygon, Helius header form) of >= 16 token chars. `Bearer ${apiKey}` (a template
  // literal, the collector's real form) does NOT match: `$`,`{`,`}` are outside the class, so the run breaks
  // before 16 chars. A committed literal Bearer secret reddens.
  { re: /\bBearer\s+[A-Za-z0-9._-]{16,}/, name: "Bearer token (>= 16 chars)" },
  // An *_API_KEY= assignment with an inline value (a .env / shell leak). `process.env.HELIUS_API_KEY` and the
  // prose mentions in docs (no `=` + value) do NOT match; `HELIUS_API_KEY=<secret>` does.
  { re: /\b[A-Z][A-Z0-9_]*_API_KEY\s*=\s*["']?[^\s"'#]{6,}/, name: "*_API_KEY= inline assignment" },
  // ADR-T1aii-D1-quinquies C-10 (lot -b3b): a Databento API key is `db-` + 29 alphanum (32 chars total). The `db-`
  // prefix + a long alphanum run IS the credential (like the Chainstack hex-in-path), so no extra context is
  // required. `{20,}` after `db-` clears the real key (29 chars) but leaves the doc prose "prefix db-" green (no
  // 20-char alphanum run follows). `DATABENTO_API_KEY=<value>` inline is already covered by the *_API_KEY= shape.
  { re: /\bdb-[A-Za-z0-9]{20,}\b/, name: "Databento API key (db- prefix)" },
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
  // ADR-T1aii C-10: a Helius-shaped UUID in an api-key context reddens (mutant: plant one ⇒ red); a bare
  // base58 mint does NOT (the context is required, so pools.ts stays green).
  assert.ok(SECRET_PATTERNS.some((p) => p.re.test("https://mainnet.helius-rpc.com/?api-key=deadbeef-1234-5678-9abc-def012345678")),
    "detects a Helius-shaped UUID in an api-key context");
  assert.equal(SECRET_PATTERNS.some((p) => p.re.test("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB")), false, "a base58 mint is NOT a secret");
  // ADR-T1aii-D1-bis C-10 (lot -b1): the Chainstack/p2pify/wss/Bearer/API_KEY shapes redden (mutant: plant one
  // ⇒ red), while the collector's real forms and doc prose stay green (no false positive).
  const fires = (s: string): boolean => SECRET_PATTERNS.some((p) => p.re.test(s));
  assert.ok(fires("https://solana-mainnet.core.chainstack.com/0123456789abcdef0123456789abcdef"), "detects a Chainstack hex-key url");
  assert.ok(fires("https://nd-123-456-789.p2pify.com/0123456789abcdef0123456789abcdef"), "detects a p2pify hex-key url");
  assert.ok(fires("wss://solana-mainnet.core.chainstack.com/0123456789abcdef0123456789abcdef"), "detects a wss hex-key url");
  assert.ok(fires("Authorization: Bearer sk_live_0123456789abcdefABCDEF"), "detects a >=16-char Bearer token");
  assert.ok(fires('HELIUS_API_KEY="0123456789abcdef0123456789abcdef1234"'), "detects an *_API_KEY= inline assignment");
  // ADR-T1aii-D1-quinquies C-10 (lot -b3b): a Databento db- key reddens (mutant: commit one => red); the doc prose
  // mentioning the "db-" prefix, and DATABENTO_API_KEY via process.env, stay green (no false positive).
  assert.ok(fires("const k = \"db-0123456789abcdef01234567\";"), "detects a Databento db- key value");
  assert.equal(fires("the DATABENTO_API_KEY is 32 chars with the prefix db-"), false, "prose 'prefix db-' is not a secret");
  assert.equal(fires("const k = process.env.DATABENTO_API_KEY ?? \"\";"), false, "process.env.DATABENTO_API_KEY access is not a secret");
  // Real committed forms stay GREEN: the template-literal Bearer, process.env access, a bare host, and the
  // doc/prose mention of a key NAME with no value.
  assert.equal(fires("headers: { Authorization: `Bearer ${apiKey}` }"), false, "template-literal Bearer is not a secret");
  assert.equal(fires("const k = process.env.HELIUS_API_KEY ?? \"\";"), false, "process.env.*_API_KEY access is not a secret");
  assert.equal(fires("second provider chainstack.com (archive from block 0)"), false, "a bare host mention is not a secret");
  assert.equal(fires("the POLYGON_API_KEY key (32 chars, never printed)"), false, "a prose key-name mention is not a secret");

  const hits: Hit[] = [];
  const scanned = walk(REPO, "", hits);
  assert.ok(scanned > 50, `implausibly few files scanned (${String(scanned)}) — the walk is broken`);
  assert.deepEqual(hits, [], `committed secret(s) found:\n${hits.map((h) => `  ${h.file}:${String(h.line)} [${h.pattern}]`).join("\n")}`);
});
