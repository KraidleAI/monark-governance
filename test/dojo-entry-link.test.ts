// Root tests of ENTRY-MAIN-LINK-1 (G0 docs/G0-lot-entry-main-link-1.md): the five programs the Dojo host launches run their main when launched
// through a directory link (a junction on Windows, a symlink elsewhere) and never when imported. Each program is launched with no arguments
// (its refused usage: a non-zero exit and its usage on stderr, no network, no key, nothing written), then imported under -e with argv[1]
// absent and then unreadable (exit 0, nothing printed). The link lives in a temporary root, removed after each launch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdtempSync, rmdirSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const LF = String.fromCharCode(10), DOJO = join(import.meta.dirname, "..", "apps", "dojo");
const node = (args: string[]): SpawnSyncReturns<string> => spawnSync(process.execPath, args, { encoding: "utf8" });
const out = (p: SpawnSyncReturns<string>, usage: string): unknown[] => [p.status, p.stdout, p.stderr.startsWith(usage) && p.stderr.endsWith(LF)];
function viaLink(rel: string): SpawnSyncReturns<string> {
  const dir = mkdtempSync(join(tmpdir(), "dojo-entry-link-")), link = join(dir, "link");
  symlinkSync(join(DOJO, dirname(rel)), link, "junction");
  try { return node([join(link, basename(rel))]); } finally { unlinkSync(link); rmdirSync(dir); }
}
function imported(rel: string): void {
  const url = JSON.stringify(pathToFileURL(join(DOJO, rel)).href);
  for (const argv of [[], [join(tmpdir(), "dojo-entry-link-absent")]]) {
    const p = node(["--input-type=module", "-e", `await import(${url});`, ...argv]);
    assert.deepEqual([p.status, p.stdout, p.stderr], [0, "", ""], `${rel} imported, argv ${argv.join(" ")}: no main, nothing printed`);
  }
}

// killer: apps/dojo/scripts/dojo-publish.mjs:472 CONST "realpathSync(process.argv[1])" -> "process.argv[1]"
test("dojo_publish_through_a_directory_link_runs_its_main", () => {
  assert.deepEqual(out(viaLink("scripts/dojo-publish.mjs"), "dojo/publish: usage: --inbox"), [1, "", true], "exit 1 and the usage, never 0");
});
// killer: apps/dojo/scripts/dojo-publish.mjs:472 CONST "catch { return false; }" -> "catch { return true; }"
test("dojo_publish_imported_runs_no_main", () => imported("scripts/dojo-publish.mjs"));

// killer: apps/dojo/scripts/dojo-eve.mjs:26 CONST "realpathSync(process.argv[1])" -> "process.argv[1]"
test("dojo_eve_through_a_directory_link_runs_its_main", () => {
  assert.deepEqual(out(viaLink("scripts/dojo-eve.mjs"), "dojo/eve: usage: --empty --day <AAAA-MM-JJ>"), [2, "", true], "exit 2 and the usage, never 0");
});
// killer: apps/dojo/scripts/dojo-eve.mjs:26 CONST "catch { return false; }" -> "catch { return true; }"
test("dojo_eve_imported_runs_no_main", () => imported("scripts/dojo-eve.mjs"));

// killer: apps/dojo/scripts/dojo-seed.mjs:51 CONST "realpathSync(process.argv[1])" -> "process.argv[1]"
test("dojo_seed_through_a_directory_link_runs_its_main", () => {
  assert.deepEqual(out(viaLink("scripts/dojo-seed.mjs"), "dojo/seed: usage: --init <new file> --horizon <n>"), [2, "", true], "exit 2, the usage, never 0");
});
// killer: apps/dojo/scripts/dojo-seed.mjs:51 CONST "catch { return false; }" -> "catch { return true; }"
test("dojo_seed_imported_runs_no_main", () => imported("scripts/dojo-seed.mjs"));

// killer: apps/dojo/src/collect.ts:305 CONST "realpathSync(process.argv[1] as string)" -> "process.argv[1] as string"
test("dojo_collect_through_a_directory_link_runs_its_main", () => {
  assert.deepEqual(out(viaLink("src/collect.ts"), "dojo/collect: usage"), [64, "", true], "exit 64 and the usage, never 0");
});
// killer: apps/dojo/src/collect.ts:305 CONST "catch { return false; }" -> "catch { return true; }"
test("dojo_collect_imported_runs_no_main", () => imported("src/collect.ts"));

// killer: apps/dojo/src/history-collect.ts:475 CONST "realpathSync(process.argv[1] as string)" -> "process.argv[1] as string"
test("dojo_history_collect_through_a_directory_link_runs_its_main", () => {
  assert.deepEqual(out(viaLink("src/history-collect.ts"), "dojo/history-collect: usage"), [64, "", true], "exit 64 and the usage, never 0");
});
// killer: apps/dojo/src/history-collect.ts:475 CONST "catch { return false; }" -> "catch { return true; }"
test("dojo_history_collect_imported_runs_no_main", () => imported("src/history-collect.ts"));
