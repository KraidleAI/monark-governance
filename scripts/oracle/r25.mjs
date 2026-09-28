// scripts/oracle/r25.mjs: local replay of the CI job r25-taille-de-lot (item R25-UNIT-1, ADR-METHODE-2 D3, lot M-3).
// Reproduced from .github/workflows/ci.yml, never copied: the counts of l.82 (STAT) and l.86 (CONTENT_STAT), found by
// the SAME R25_DIFF_RE as test/ci-gates.test.ts:95 (pathspecs split on blanks, single quotes removed); the ins+del
// metric of l.90-91; the bounds of l.49-50, read from their env: keys (absent or not numeric: red, as l.52-61); red
// iff a count exceeds its bound (l.94, l.98). `origin/${{ github.base_ref }}` becomes the mandatory --base: the range
// stays `<base>...HEAD`, HEAD being the clone's freeze commit (untracked files included). Insertions and deletions are
// reported apart: R25-UNIT-1 leaves open whether the 547 bound counts insertions or insertions + deletions.
import { execFileSync } from "node:child_process";

export const R25_DIFF_RE = /^\s*([A-Z_]+)=\$\(git diff --shortstat "origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD" -- (.+)\) \|\| \{\s*$/;
const METRIC_RE = /^\s*([A-Z_]+)=\$\(printf '%s\\n' "\$([A-Z_]+)" \| awk /;
const BOUND_RE = /^\s*if \[ "\$([A-Z_]+)" -gt "\$([A-Z_]+)" \]; then\s*$/;

export function r25(clone, ciText, base) {
  const lines = ciText.split(/\r?\n/);
  const hit = (re, i, v) => lines.map((l) => re.exec(l)).find((m) => m !== null && m[i] === v);
  const counts = lines.map((l) => R25_DIFF_RE.exec(l)).filter((m) => m !== null).map(([, name, specs]) => {
    const pathspecs = specs.split(/\s+/).map((t) => t.replace(/^'(.*)'$/, "$1"));
    const stat = execFileSync("git", ["-C", clone, "diff", "--shortstat", `${base}...HEAD`, "--", ...pathspecs], { encoding: "utf8" });
    const [ins, del] = ["insertion", "deletion"].map((w) => Number(new RegExp(`(\\d+) ${w}`).exec(stat)?.[1] ?? 0));
    const bound = hit(BOUND_RE, 1, hit(METRIC_RE, 2, name)?.[1])?.[2] ?? null;
    const limit = lines.map((l) => new RegExp(`^\\s*${bound}:\\s*["']?(\\d+)["']?\\s*(#.*)?$`).exec(l)).find((m) => m !== null)?.[1];
    return { name, insertions: ins, deletions: del, changed: ins + del, bound, limit: limit === undefined ? null : Number(limit) };
  });
  const red = counts.length === 0 || counts.some((c) => c.limit === null || c.changed > c.limit);
  const log = counts.map((c) => `${c.name}: ${c.insertions} insertions(+), ${c.deletions} deletions(-), changed ${c.changed} (bound ${c.bound} = ${c.limit})`);
  return { exit: red ? 1 : 0, counts, log: `${[...log, red ? "RED" : "GREEN"].join("\n")}\n` };
}
