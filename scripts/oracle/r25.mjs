// scripts/oracle/r25.mjs: local replay of the CI job r25-taille-de-lot (item R25-UNIT-1, ADR-METHODE-2 D3, lot M-3).
// Reproduced from .github/workflows/ci.yml, never copied: the counts of l.82 (STAT) and l.86 (CONTENT_STAT), found by
// the SAME R25_DIFF_RE as test/ci-gates.test.ts:95 (pathspecs split on blanks, single quotes removed); the ins+del
// metric of l.90-91; the bounds of l.49-50, read from their env: keys (absent or not numeric: red, as l.52-61); red
// iff a count exceeds its bound (l.94, l.98). `origin/${{ github.base_ref }}` becomes the mandatory --base: the range
// stays `<base>...HEAD`, HEAD being the clone's freeze commit (untracked files included). Insertions and deletions are
// reported apart; the lot bound counts both, like the CI (decision Q-M3-5 on R25-UNIT-1), and equality is green (-gt).
// R-25 integration rule (ADR-M003 D9 nonies, lot R25-INTEGRATION-RULE-1): with a declared proof (run.mjs --r25-proof), the ORACLE's
// own scripts/lot-size-integration.mjs runs its `count` command on the clone as the CI job does, only if the clone holds the same bytes
// (else W, mode gate-files, G2 B-3); only its mode `integration` lowers a count, never above W. W is read under the module's PIN and env (delta3 m-g), the larger of two reads: attributes of the empty tree (delta2 O-1), the CI's read since `pin` (O-1), and the measured tree's (never below the CI, delta3 m-h); a non-empty $GIT_DIR/info/attributes throws (delta3 m-f).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GIT_ENV, infoAttributes, PIN } from "../lot-size-integration.mjs";

export const R25_DIFF_RE = /^\s*([A-Z_]+)=\$\(git diff --shortstat "origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD" -- (.+)\) \|\| \{\s*$/;
const METRIC_RE = /^\s*([A-Z_]+)=\$\(printf '%s\\n' "\$([A-Z_]+)" \| awk /;
const BOUND_RE = /^\s*if \[ "\$([A-Z_]+)" -gt "\$([A-Z_]+)" \]; then\s*$/;
const JUDGE = join(import.meta.dirname, "..", "lot-size-integration.mjs"), EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

export function r25(clone, ciText, base, proofFile = null) {
  const lines = ciText.split(/\r?\n/); if (infoAttributes(clone)) throw new Error(`${clone}: $GIT_DIR/info/attributes is not empty, W not read (delta3 m-f)`);
  const hit = (re, i, v) => lines.map((l) => re.exec(l)).find((m) => m !== null && m[i] === v);
  const counts = lines.map((l) => R25_DIFF_RE.exec(l)).filter((m) => m !== null).map(([, name, specs]) => {
    const pathspecs = specs.split(/\s+/).map((t) => t.replace(/^'(.*)'$/, "$1"));
    const stat = [[`--attr-source=${EMPTY_TREE}`], []].map((src) => execFileSync("git", ["-C", clone, ...PIN, ...src, "diff", "--shortstat", `${base}...HEAD`, "--", ...pathspecs], { encoding: "utf8", env: GIT_ENV() }));
    const [ins, del] = stat.map((s) => ["insertion", "deletion"].map((w) => Number(new RegExp(`(\\d+) ${w}`).exec(s)?.[1] ?? 0))).reduce((a, b) => (b[0] + b[1] > a[0] + a[1] ? b : a));
    const bound = hit(BOUND_RE, 1, hit(METRIC_RE, 2, name)?.[1])?.[2] ?? null;
    const limit = lines.map((l) => new RegExp(`^\\s*${bound}:\\s*["']?(\\d+)["']?\\s*(#.*)?$`).exec(l)).find((m) => m !== null)?.[1];
    return { name, insertions: ins, deletions: del, changed: ins + del, bound, limit: limit === undefined ? null : Number(limit) };
  });
  const eff = integration(clone, base, proofFile, counts.map((c) => c.changed));
  eff.counts.forEach((n, i) => { counts[i].changed = n; });
  const red = counts.length === 0 || counts.some((c) => c.limit === null || c.changed > c.limit);
  const log = counts.map((c) => `${c.name}: ${c.insertions} insertions(+), ${c.deletions} deletions(-), changed ${c.changed} (bound ${c.bound} = ${c.limit})`);
  return { exit: red ? 1 : 0, counts, mode: eff.mode, proof: eff.proof, log: `${[`mode ${eff.mode}${eff.proof ? ` proof ${eff.proof.sha256}` : ""}`, ...log, red ? "RED" : "GREEN"].join("\n")}\n` };
}

function integration(clone, base, proofFile, written) {
  const proof = proofFile === null ? null : { file: proofFile, sha256: createHash("sha256").update(readFileSync(proofFile)).digest("hex") };
  if (proof === null || written.length !== 2) return { mode: "unproven", counts: written, proof };
  try {
    if (!readFileSync(JUDGE).equals(readFileSync(join(clone, "scripts", "lot-size-integration.mjs")))) return { mode: "gate-files", counts: written, proof };
    const out = execFileSync(process.execPath, [JUDGE, "count", "--ci", join(clone, ".github", "workflows", "ci.yml"), "--base", base, "--proof", proofFile, "--written", ...written.map(String)], { cwd: clone, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const [mode, ...n] = out.split("\n")[0].split(" ");
    if (mode !== "integration" || n.length !== 2 || !n.every((x) => /^\d+$/.test(x))) return { mode, counts: written, proof };
    return { mode, counts: n.map((x, i) => Math.min(Number(x), written[i])), proof };
  } catch { return { mode: "error", counts: written, proof }; } // no module on either side, or a module error: W
}
