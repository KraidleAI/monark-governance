// test/workspace-bin-mode.test.ts -- WORKSPACE-BIN-MODE-1 (2026-10-08): `npm ci` links each `bin` of a workspace package.json into
// node_modules/.bin and makes its target executable in the working tree. A target held as 100644 in the git index then shows as a mode
// change in every working copy after an install, and a commit of named paths has to step around it. Every bin target of the npm
// workspaces is held as a merged executable regular file (100755) in the index. The mode is read from the index by `git ls-files -s`,
// never from the working tree: core.filemode is false on some hosts, and a merge keeps the mode of the index. Reads only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { gitOut } from "./helpers/git-tracked.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));

/** The package.json files of the npm workspaces: the "workspaces" globs of the root package.json, each of the form "<dir>/*". */
function workspacePackages(): string[] {
  const globs = (JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as { workspaces?: string[] }).workspaces ?? [];
  assert.ok(globs.length > 0, "the root package.json declares its workspaces");
  return globs.flatMap((g) => {
    assert.match(g, /^[\w.-]+\/\*$/, `a workspace glob of the form <dir>/*: ${g}`);
    const dir = g.slice(0, -2);
    return readdirSync(join(REPO, dir), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `${dir}/${d.name}/package.json`)
      .filter((p) => existsSync(join(REPO, p)));
  });
}

/** The bin targets a package.json declares, as repository paths. */
function binTargets(pkg: string): string[] {
  const bin = (JSON.parse(readFileSync(join(REPO, pkg), "utf8")) as { bin?: string | Record<string, string> }).bin;
  const targets = bin === undefined ? [] : typeof bin === "string" ? [bin] : Object.values(bin);
  return targets.map((t) => posix.normalize(posix.join(posix.dirname(pkg), t)));
}

// reddened by: a bin target held as 100644 (or as a link, or unmerged) in the index, a bin target the index does not hold, or no bin
// target at all in the workspaces
// killer: packages/rpc-guard/package.json:7 CONST "./bin/rpc-guard.mjs" -> "./bin/rpc-guard-cli.mjs"
test("workspace_bin_targets_are_executable_in_the_index - every bin target of a workspace package.json is a merged executable regular file (100755) in the git index", () => {
  const targets = workspacePackages().flatMap(binTargets);
  assert.ok(targets.length > 0, "the workspaces declare at least one bin target");
  for (const t of targets) {
    const entry = gitOut(REPO, ["ls-files", "-s", "--", t]).trimEnd();
    assert.match(entry, /^100755 [0-9a-f]{40,64} 0\t[^\n]+$/, `${t}: a merged executable regular file (100755) in the index, not ${entry === "" ? "absent" : JSON.stringify(entry)}`);
  }
});
