// test/helpers/git-tracked.ts -- lot CI-WORKFLOWS-SET-1, G2 fold (N-2, N-3): the paths git tracks under one pathspec of a
// repository root, read from the index and from the HEAD tree. git runs with none of the caller's GIT_* variables: a hook sets
// GIT_DIR or GIT_INDEX_FILE, and `git -C` overrides neither (the strip of test/dojo-render.test.ts and test/byte-guard.test.ts).
// Each list is deduplicated (an unmerged index lists a conflicted path once per stage) and sorted. A git failure throws.
import { spawnSync } from "node:child_process";

const bare = (): NodeJS.ProcessEnv => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));

/** The stdout of `git -C <root> <args>`, run without the caller's GIT_* variables; throws when git does not exit 0. */
export function gitOut(root: string, args: string[]): string {
  const r = spawnSync("git", ["-C", root, ...args], { env: bare(), encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed (fail-closed): ${String(r.error ?? r.stderr)}`);
  return r.stdout;
}

const uniq = (xs: string[]): string[] => [...new Set(xs)];
const paths = (out: string): string[] => uniq(out.split("\0").filter((p) => p !== "")).sort();

/** The paths under `pathspec` in the index and in the HEAD tree of `root`, each deduplicated and sorted. */
export function tracked(root: string, pathspec: string): { index: string[]; tree: string[] } {
  return {
    index: paths(gitOut(root, ["ls-files", "-z", "--", pathspec])),
    tree: paths(gitOut(root, ["ls-tree", "-r", "-z", "--name-only", "HEAD", "--", pathspec])),
  };
}
