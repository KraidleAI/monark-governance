// test/loopback-guard.test.ts -- lot LOOPBACK-PORTS-1 (2026-10-04; Q-1 of its G1, F-5 of its G2): the static guard of the loopback
// port. No test file outside the RECHERCHES zone binds port 0: a test server listens on a port drawn above 10080 by
// test/helpers/loopback.ts (why: its header). Forms: those of the census of the G1 (29 sites in 15 files at 8700329f) and their
// neighbours, each matched over the whole text (a form may span lines). A lexical guard: a port 0 held in a variable passes it; for a
// server started through the helper, the postcondition of startLoopback refuses any port but the drawn one. This file holds a sample
// of each form, so it is the one test file not scanned. Builtins only: it also runs on a tree without the helper (the base of the lot).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)), SELF = "test/loopback-guard.test.ts";
/** Not walked: installed or generated trees and documents (the skip list of the census), and the RECHERCHES zone, inventoried for it. */
const SKIP = new Set(["node_modules", ".git", "docs", "out", "dist", ".next", ".turbo", ".claude"]);
const ZONE = new Set(["apps/harness", "apps/sentinel", "packages/hikae", "packages/contracts"]);
/** A bind of port 0: listen given a port 0, none, undefined or null, or a callback alone; listen given options with port 0 or with no
 *  port (a spread aside); the harness started at 0; a draw that answers 0 (M16 of the G2); a datagram socket bound at 0. */
const PORT_0 = [
  /listen\(\s*(?:0\s*[,)]|\)|undefined\b|null\b|\(\s*\)\s*=>|function\b)/g,
  /listen\(\s*\{(?:[^}]*\bport\s*:\s*0\b|(?![^}]*(?:\bport\b|\.\.\.))[^}]*\})/g,
  /startServer\(\s*0\s*[,)]/g,
  /\b(?:listen|startLoopback)\([^;\n]*=>\s*0\s*\)/g,
  /\.bind\(\s*0\s*[,)]/g,
];
/** The test code files under `dir`, as the census selects them: a path segment "test", or a name ending .test.ts. */
const testFiles = (dir: string): string[] => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
  const rel = dir === "" ? e.name : `${dir}/${e.name}`;
  if (e.isDirectory()) return SKIP.has(e.name) || ZONE.has(rel) ? [] : testFiles(rel);
  return /\.(?:[cm]?[jt]s|tsx)$/.test(e.name) && (/(?:^|\/)test\//.test(rel) || rel.endsWith(".test.ts")) ? [rel] : [];
});
/** `file:line` of each bind of port 0 in `text`. */
const binds = (file: string, text: string): string[] =>
  PORT_0.flatMap((re) => [...text.matchAll(re)].map((m) => `${file}:${String(text.slice(0, m.index).split("\n").length)}`));

// reddened by: a test file outside the zone that binds port 0 (at 8700329f: 29 sites in 15 files; M16 and M17 of the G2), or a walk
// that misses the test files
test("loopback_guard_no_test_file_outside_the_zone_binds_port_0", () => {
  const files = testFiles("");
  assert.ok(files.includes(SELF) && files.length >= 100, `the walk reads the test files: ${String(files.length)}`);
  const hits = files.filter((f) => f !== SELF).flatMap((f) => binds(f, readFileSync(join(ROOT, f), "utf8")));
  assert.deepEqual(hits, [], "a test server listens on a port drawn by test/helpers/loopback.ts, never on port 0");
});

// reddened by: a form that no longer bites its sample, or one that bites a bind of a drawn port
test("loopback_guard_forms_bite_port_0_and_spare_a_drawn_port", () => {
  const zero = ["s.listen(0, h)", "s.listen(\n  0,\n  h)", "s.listen()", "s.listen(undefined, h)", "s.listen(null)", "s.listen(() => {})",
    "s.listen(function () {})", "s.listen({ host: h, port: 0 })", "s.listen({ host: h })", "startServer(0)", "listen(s, () => 0)",
    "startLoopback(f, () => 0)", "u.bind(0, h)"];
  const drawn = ["s.listen(p, h)", "s.listen({ host: h, port })", "s.listen({ ...o })", "listen(s)", "listen(s, d.draw)",
    "startLoopback((port) => startServer(port))", "u.bind(p, h)"];
  assert.deepEqual([zero.filter((x) => binds("", x).length === 0), drawn.filter((x) => binds("", x).length > 0)], [[], []], "bitten: every sample of port 0, none of a drawn port");
});
