// scripts/sentinel-witness.mjs — the local witness tool of the Narabi sentinel. SOURCE-REPO tool (not exported); Node 24,
// built-ins and the sentinel's own witness module (apps/sentinel/src/witness.ts). Two commands:
//   node scripts/sentinel-witness.mjs print --tree <sha> [--overlay <prefix>=<sha>] [--repo <dir>]
//       The expected sentinel_sha of a tree: closureWitness of apps/sentinel/src/run.ts on the tree <sha> read by git
//       (ls-tree, cat-file), every file under <prefix> read at the overlay sha instead (a deploy that ships the sentinel
//       directory, apps/sentinel, from one sha over the rest of the tree from another). Prints one JSON object
//       { witness, files, tree, overlay }. Git runs as `git -C <repo>` with every inherited GIT_* variable removed from its
//       environment (`git -C` yields neither to GIT_DIR nor to GIT_INDEX_FILE); never a write.
//   node scripts/sentinel-witness.mjs compare --expected <64-hex> --after-day <YYYY-MM-DD> [--url <served timeline>]
//       One GET of the served timeline (https only, no redirect followed, 200 only, body bounded); strict JSON lines, days
//       increasing. The first line whose day follows --after-day (the last day served before the deploy) is judged: none
//       -> exit 2 "waiting"; its sentinel_sha equal to --expected -> exit 0 "confirmed"; different -> exit 1 "mismatch".
//       The lines up to --after-day were written before the deploy and carry the witness of before: never compared.
// Any other failure (usage, git, network, a malformed line) exits 3, so it is never read as one of the three outcomes.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { closureWitness, executionClosure } from "../apps/sentinel/src/witness.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ENTRY = "apps/sentinel/src/run.ts";
export const SERVED_TIMELINE = "https://monarkgate.tech/narabi/timeline.jsonl";
const MAX_BYTES = 8 * 1024 * 1024;
const SHA_RE = /^[0-9a-f]{64}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** The flags each command takes: required, then optional. The runbook's steps name these, as written here. */
export const COMMANDS = Object.freeze({
  print: Object.freeze({ required: Object.freeze(["--tree"]), optional: Object.freeze(["--overlay", "--repo"]) }),
  compare: Object.freeze({ required: Object.freeze(["--expected", "--after-day"]), optional: Object.freeze(["--url"]) }),
});

/** git -C <repo> <args>, stdout as bytes; every inherited GIT_* variable removed from the child's environment. */
function git(repo, args) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const r = spawnSync("git", ["-C", repo, ...args], { env, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${String(r.stderr ?? "").trim() || String(r.error)}`);
  return r.stdout;
}

/** "<prefix>=<sha>" -> { prefix, rev }, or null when absent. */
function parseOverlay(overlay) {
  if (overlay === undefined || overlay === null) return null;
  const m = /^([\w.@-]+(?:\/[\w.@-]+)*)=([^=\s]+)$/.exec(String(overlay));
  if (m === null || m[1].split("/").includes("..")) throw new Error(`--overlay takes <prefix>=<sha> (got ${JSON.stringify(overlay)})`);
  return { prefix: m[1], rev: m[2] };
}

/** A reader of the tree `tree` of `repo`, the files under the overlay's prefix read at its sha. */
export function gitTreeReader(repo, tree, overlay) {
  const commit = (rev) => git(repo, ["rev-parse", "--verify", "--end-of-options", `${rev}^{commit}`]).toString("utf8").trim();
  const filesOf = (sha) => git(repo, ["ls-tree", "-r", "-z", "--name-only", sha]).toString("utf8").split("\0").filter(Boolean);
  const base = commit(tree);
  const ov = parseOverlay(overlay);
  const at = new Map();
  let laid = null;
  if (ov === null) for (const f of filesOf(base)) at.set(f, base);
  else {
    const top = commit(ov.rev), under = (f) => f.startsWith(`${ov.prefix}/`);
    for (const f of filesOf(base)) if (!under(f)) at.set(f, base);
    for (const f of filesOf(top)) if (under(f)) at.set(f, top);
    laid = { prefix: ov.prefix, sha: top };
  }
  const reader = {
    read: (rel) => (at.has(rel) ? git(repo, ["cat-file", "blob", `${at.get(rel)}:${rel}`]) : undefined),
    list: (rel) => [...new Set([...at.keys()].filter((f) => f.startsWith(`${rel}/`)).map((f) => f.slice(rel.length + 1).split("/")[0]))].sort(),
  };
  return { reader, tree: base, overlay: laid };
}

/** The print command: the witness the sentinel writes when it runs from this composition of trees. */
export function runPrint({ repo = ROOT, tree, overlay }) {
  if (typeof tree !== "string" || tree === "") throw new Error("print takes --tree <sha>");
  const { reader, tree: sha, overlay: ov } = gitTreeReader(repo, tree, overlay);
  return { witness: closureWitness(reader, ENTRY), files: executionClosure(reader, ENTRY), tree: sha, overlay: ov };
}

/** The served lines, strictly: one JSON object per LF-ended line, a day and a 64-hex sentinel_sha each, days increasing. */
export function servedLines(text) {
  const raw = String(text).split("\n");
  if (raw.pop() !== "") throw new Error("the served timeline does not end with a line feed");
  const lines = raw.map((l, i) => {
    let v;
    try { v = JSON.parse(l); } catch { throw new Error(`line ${String(i + 1)} is not JSON`); }
    if (v === null || typeof v !== "object" || !DAY_RE.test(String(v.day)) || !SHA_RE.test(String(v.sentinel_sha))) throw new Error(`line ${String(i + 1)} has no day or no sentinel_sha`);
    return { day: v.day, sentinel_sha: v.sentinel_sha };
  });
  for (let i = 1; i < lines.length; i++) if (!(lines[i].day > lines[i - 1].day)) throw new Error(`line ${String(i + 1)}: the days do not increase`);
  return lines;
}

/** GET of the served timeline: https only, a redirect refused, 200 only, the body cut at the bound; `fetchImpl` is the seam. */
export async function httpsGet(url, fetchImpl = fetch) {
  if (new URL(url).protocol !== "https:") throw new Error(`${url}: https only`);
  const res = await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) throw new Error(`GET ${url} answered ${String(res.status)} (200 only, no redirect followed)`);
  const chunks = [];
  let n = 0;
  for await (const c of res.body ?? []) {
    if ((n += c.byteLength) > MAX_BYTES) throw new Error(`GET ${url}: the body exceeds ${String(MAX_BYTES)} bytes`);
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The compare command: the first served line after the last day served before the deploy, against the expected witness. */
export async function runCompare({ expected, afterDay, get = httpsGet, url = SERVED_TIMELINE }) {
  if (!SHA_RE.test(String(expected))) throw new Error("compare takes --expected <64 lowercase hex>");
  if (!DAY_RE.test(String(afterDay))) throw new Error("compare takes --after-day <YYYY-MM-DD>");
  const lines = servedLines(await get(url));
  const next = lines.find((l) => l.day > afterDay);
  if (next === undefined) return { status: "waiting", exit: 2, day: null, served: null, expected };
  const same = next.sentinel_sha === expected;
  return { status: same ? "confirmed" : "mismatch", exit: same ? 0 : 1, day: next.day, served: next.sentinel_sha, expected };
}

/** argv -> { command, flags }: a known command, each of its flags once with a value, the required ones present. */
export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const spec = Object.hasOwn(COMMANDS, command ?? "") ? COMMANDS[command] : undefined;
  if (spec === undefined) throw new Error(`usage: sentinel-witness.mjs ${Object.keys(COMMANDS).join(" | ")} (got ${JSON.stringify(command)})`);
  const flags = {};
  for (let i = 0; i < rest.length; i += 2) {
    const k = rest[i], v = rest[i + 1];
    if (![...spec.required, ...spec.optional].includes(k) || Object.hasOwn(flags, k) || v === undefined || v.startsWith("--")) throw new Error(`${command}: unexpected ${JSON.stringify(k)}; takes ${[...spec.required, ...spec.optional].join(" ")}`);
    flags[k] = v;
  }
  for (const k of spec.required) if (!Object.hasOwn(flags, k)) throw new Error(`${command}: ${k} is required`);
  return { command, flags };
}

async function main(argv) {
  const { command, flags } = parseArgs(argv);
  if (command === "print") {
    console.log(JSON.stringify(runPrint({ repo: flags["--repo"] ?? ROOT, tree: flags["--tree"], overlay: flags["--overlay"] }), null, 2));
    return 0;
  }
  const r = await runCompare({ expected: flags["--expected"], afterDay: flags["--after-day"], url: flags["--url"] ?? SERVED_TIMELINE });
  console.log(JSON.stringify(r));
  return r.exit;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = await main(process.argv.slice(2)); } catch (e) {
    console.error(`sentinel-witness: FAIL-CLOSED: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 3;
  }
}
