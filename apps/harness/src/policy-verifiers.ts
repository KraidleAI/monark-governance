/**
 * The pinned list of verifiers, format monark-verifiers-v1 (VERIFIERS-LIST-F5A-1 lot 1f; docs/G0-lot-verifiers-list-f5a-1.md section
 * 3.2 as amended by lot 1f; docs/G0-lot-verifiers-list-1f.md). The list lives in apps/harness/data/verifiers.json, canonical, with no
 * final newline; this module holds its sha256 (VERIFIERS_SHA256), its closed reader, the one identity rule of a verifier or generator,
 * the digest rule of a tool tree, the prefix rule of a carried copy and the date rule of a revocation.
 * Two closed entry forms, in the order they were appended (never sorted): a list entry {commit, identity, repository, tree, tree_sha256}
 * and a revocation {commit, identity, revoked: <YYYY-MM-DD>}. A (identity, commit) pair is unique among the list entries; a revocation
 * names a list entry above it, at most once; its date is a record and commands nothing. Only list entries attest a row (A-1, the guard).
 * The reader is closed on the bytes as on the form (a text that is not the canonical writing of its list is refused); it renders frozen.
 * Imports: node:crypto, and node:fs and node:url for pinnedVerifiers() alone, which reads the file lazily, on its first call, never at
 * load (apps/harness/src is exported, apps/harness/data is not). Nothing from scripts/ and nothing from policy-guard.ts: no cycle.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The sha256 of the bytes of apps/harness/data/verifiers.json. */
export const VERIFIERS_SHA256 = "6e033c9d098170777dc3fc39f6c1c86cf58ef440ad1410f911b2c8553a594dc1";
export const VERIFIERS_FORMAT = "monark-verifiers-v1";
/** The repository and the tree that every list entry names: the recomputation tool of this repository. */
export const REPOSITORY = "KraidleAI/monark-governance";
export const TOOL_ROOT = "tools/kata-recalc";

export type ListEntry = { readonly commit: string; readonly identity: string; readonly repository: string; readonly tree: string; readonly tree_sha256: string };
export type Revocation = { readonly commit: string; readonly identity: string; readonly revoked: string };
/** One element of the list, in either form, as readVerifiers renders it. */
export type Verifier = ListEntry | Revocation;

const sha256 = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");
const fail = (what: string): never => {
  throw new Error(`MONARK verifier list: ${what}.`);
};

/** The identity of a verifier or generator: the name before its first "@" (the revision), ASCII lower case (G0 G-2.6). */
export const identityOf = (name: string): string => (name.split("@")[0] ?? "").replace(/[A-Z]/g, (c) => c.toLowerCase());

/** A YYYY-MM-DD string naming a real calendar day: the expression and the calendar check of validDate in scripts/spec-publish.mjs. */
export function validDate(s: unknown): boolean {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y = 0, m = 0, d = 0] = s.split("-").map(Number), t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

const COMMIT = /^[0-9a-f]{40}$/, HEX64 = /^[0-9a-f]{64}$/;
const LIST_KEYS = ["commit", "identity", "repository", "tree", "tree_sha256"], REVOKE_KEYS = ["commit", "identity", "revoked"];
const exactly = (o: object, keys: readonly string[]): boolean => Object.keys(o).length === keys.length && keys.every((k) => Object.hasOwn(o, k));
export const isListEntry = (v: Verifier): v is ListEntry => !Object.hasOwn(v, "revoked");
/** The list entries alone: what A-1 and the guard retain (a revocation never attests). */
export const listEntries = (vs: readonly Verifier[]): readonly ListEntry[] => vs.filter(isListEntry);

/** The closed reader: the elements of the list in file order, each in its closed form (keys sorted) and frozen, in a frozen array; or a
 *  named refusal. Closed on the bytes too: the decoder keeps a BOM, and after the checks of form the text must be the canonical writing
 *  of what it renders (sorted keys, no space, no final newline, each key once, every string well formed: canonicalJson of spec-publish). */
export function readVerifiers(bytes: Uint8Array | string): readonly Verifier[] {
  let text: string, doc: unknown;
  try { text = typeof bytes === "string" ? bytes : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); doc = JSON.parse(text); } catch { return fail("not UTF-8 JSON"); }
  if (doc === null || typeof doc !== "object" || Array.isArray(doc) || !exactly(doc, ["format", "verifiers"])) return fail("the top level is not exactly {format, verifiers}");
  const { format, verifiers } = doc as { format: unknown; verifiers: unknown };
  if (format !== VERIFIERS_FORMAT) fail(`format is not ${VERIFIERS_FORMAT}`);
  if (!Array.isArray(verifiers) || verifiers.length === 0) return fail("verifiers is not a non-empty array");
  const listed = new Set<string>(), revoked = new Set<string>();
  const closed = (v: Record<string, unknown>): Verifier => Object.freeze(Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) as Verifier);
  const out = verifiers.map((x: unknown, i): Verifier => {
    const at = `entry ${i}`, v = (x !== null && typeof x === "object" && !Array.isArray(x) ? x : fail(`${at} is not an object`)) as Record<string, unknown>;
    const list = exactly(v, LIST_KEYS), revoke = exactly(v, REVOKE_KEYS);
    if (!list && !revoke) fail(`${at} is of neither form (keys ${Object.keys(v).sort().join(", ")})`);
    if (typeof v.identity !== "string" || v.identity === "" || !(v.identity === identityOf(v.identity))) fail(`${at}: identity is not an identity (lower case, no revision)`);
    if (typeof v.commit !== "string" || !COMMIT.test(v.commit)) fail(`${at}: commit is not 40 lower-case hex`);
    const pair = `${String(v.identity)}@${String(v.commit)}`;
    if (revoke) {
      if (!validDate(v.revoked)) fail(`${at}: revoked is not a real YYYY-MM-DD day`);
      if (!listed.has(pair)) fail(`${at}: a revocation of ${pair}, which no list entry above it names`);
      if (revoked.has(pair)) fail(`${at}: a second revocation of ${pair}`);
      revoked.add(pair);
      return closed(v);
    }
    if (v.repository !== REPOSITORY) fail(`${at}: repository is not ${REPOSITORY}`);
    if (v.tree !== TOOL_ROOT) fail(`${at}: tree is not ${TOOL_ROOT}`);
    if (typeof v.tree_sha256 !== "string" || !HEX64.test(v.tree_sha256)) fail(`${at}: tree_sha256 is not 64 lower-case hex`);
    if (listed.has(pair)) fail(`${at}: ${pair} is listed twice`);
    listed.add(pair);
    return closed(v);
  });
  if (JSON.stringify({ format: VERIFIERS_FORMAT, verifiers: out }) !== text || !out.every((v) => Object.values(v).every((s: string) => s.isWellFormed()))) fail("not the canonical writing of the list");
  return Object.freeze(out);
}

/** The list of these bytes, which must have the sha256 `pin`; an altered list is refused, closed. */
export function checkedVerifiers(bytes: Uint8Array, pin: string = VERIFIERS_SHA256): readonly Verifier[] {
  if (sha256(bytes) !== pin) fail(`the bytes have sha256 ${sha256(bytes)}, the pin is ${pin}`);
  return readVerifiers(bytes);
}

let pinned: readonly Verifier[] | undefined;
/** The pinned list (Q-P3-7): read on the first call, then the same array. A missing, unreadable or altered file throws on every call. */
export function pinnedVerifiers(): readonly Verifier[] {
  pinned ??= checkedVerifiers(readFileSync(fileURLToPath(new URL("../data/verifiers.json", import.meta.url))));
  return pinned;
}

/** A copy carried in a dated folder: its elements are, in order, the first elements of the pinned list (Q-4). */
export function isPrefix(copy: readonly Verifier[], list: readonly Verifier[]): boolean {
  const same = (a: Verifier, b: Verifier | undefined): boolean => b !== undefined && exactly(b, Object.keys(a)) && Object.entries(a).every(([k, x]) => (b as Record<string, unknown>)[k] === x);
  return copy.length <= list.length && copy.every((v, i) => same(v, list[i]));
}

/** The tree digest of section 3.2: every blob under TOOL_ROOT a regular file (100644), one "<sha256>  <path under TOOL_ROOT>" line per
 *  file sorted by path, LF ended (manifestText of scripts/spec-publish.mjs), and the sha256 of that text. */
export function toolTreeSha256(blobs: readonly { readonly mode: string; readonly path: string; readonly bytes: Uint8Array }[]): string {
  const lines = blobs.map(({ mode, path: p, bytes }) => {
    if (mode !== "100644") fail(`${p} has mode ${mode}, not a regular file (100644)`);
    if (!p.startsWith(`${TOOL_ROOT}/`)) fail(`${p} is not under ${TOOL_ROOT}/`);
    return { path: p.slice(TOOL_ROOT.length + 1), digest: sha256(bytes) };
  });
  return sha256(lines.sort((a, b) => (a.path < b.path ? -1 : 1)).map((l) => `${l.digest}  ${l.path}\n`).join(""));
}

// ---- The recompute report, format monark-recompute-report-v1 (lot 2a; docs/G0-lot-e2a-2a-report-reader.md): written by report.py of the
// listed tool, one report per release (form (a)). readRecomputeReport judges the closed form and the canonical writing, and nothing else: it
// binds the report neither to the list, nor to the registry, nor to a row, nor its scope to its cells. Those bindings are the gate's and
// the guard's, so a report of another registry, tree or verifier reads here and is a mismatch there, never an invalid report.
export const REPORT_FORMAT = "monark-recompute-report-v1";
/** The paths of a report whose 64-hex digests are not a row's (the closed list of the gate's digest rule); cells[].scores_sha256 aside. */
export const REPORT_NON_ROW_DIGESTS = ["inputs.compare[].sha256", "inputs.recompute[].sha256", "platform.libm.sha256", "registry.sha256", "tool.tree_sha256"];
export type ReportInput = { readonly role: string; readonly name: string; readonly sha256: string; readonly bytes: number };
export type ReportCell = { readonly task_class: string; readonly cell_key: string; readonly decisions_equal: boolean; readonly scores_sha256: string | null };
type Explained = { readonly task_class: string; readonly cell_key: string; readonly field: string; readonly class: "explained, ln" | "explained, association" };
/** A value that differs in a bit (both doubles in hexadecimal, their distance in ulps), or a digest that differs (where, never the digests). */
export type ReportDifference = Explained & ({ readonly kind: "value"; readonly a: string; readonly b: string; readonly ulps: number } | { readonly kind: "digest"; readonly first_index: number; readonly terms: number; readonly max_ulps: number });
type Free = Readonly<Record<string, unknown>>;
export type RecomputeReport = {
  readonly format: typeof REPORT_FORMAT; readonly verifier: string; readonly tool: { readonly commit: string; readonly tree: string; readonly tree_sha256: string };
  readonly registry: { readonly sha256: string; readonly generator_identity: string; readonly cells: number };
  readonly inputs: { readonly recompute: readonly ReportInput[]; readonly compare: readonly ReportInput[] }; readonly scope: readonly string[];
  readonly cells: readonly ReportCell[]; readonly differences: readonly ReportDifference[]; readonly replay: string;
  readonly platform: Free; readonly oracles: Free; readonly fields: Free; readonly explanation: Free; readonly summary: Free;
};

type Cols = Readonly<Record<string, (v: unknown, at: string) => boolean>>;
const rfail = (what: string): never => {
  throw new Error(`MONARK recompute report: ${what}.`);
};
const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
function closed(v: unknown, cols: Cols, at: string): Record<string, unknown> {
  const o = isObj(v) ? v : rfail(`${at} is not an object`), keys = Object.keys(o).sort(), want = Object.keys(cols).sort();
  if (JSON.stringify(keys) !== JSON.stringify(want)) rfail(`${at} has the keys [${keys.join(", ")}], not exactly [${want.join(", ")}]`);
  for (const k of want) if (!cols[k]?.(o[k], `${at}.${k}`)) rfail(`${at}.${k} is off the form`);
  return o;
}
const CLASS = /^[a-z0-9]+(-[a-z0-9]+)*$/, DOUBLE = /^-?0x(?:1\.[0-9a-f]{13}p(?:\+(?:0|[1-9][0-9]{0,2}|10[01][0-9]|102[0-3])|-(?:[1-9][0-9]{0,2}|10[01][0-9]|102[0-2]))|0\.(?!0{13})[0-9a-f]{13}p-1022|0\.0p\+0)$/; // float.hex() of a finite double: a normal (exponent in [-1022, 1023]), a subnormal or zero
const text = (v: unknown): boolean => typeof v === "string", free = (v: unknown): boolean => isObj(v), count = (v: unknown): boolean => Number.isSafeInteger(v) && (v as number) >= 0;
const fits = (re: RegExp) => (v: unknown): boolean => typeof v === "string" && re.test(v);
const nest = (cols: Cols) => (v: unknown, at: string): boolean => closed(v, cols, at) !== undefined;
const each = (one: (v: unknown, at: string) => boolean) => (v: unknown, at: string): boolean => Array.isArray(v) && v.every((x, i) => one(x, `${at}[${i}]`)); // each element names its own refusal
const INPUT: Cols = { bytes: count, name: text, role: text, sha256: fits(HEX64) };
const CELL: Cols = { cell_key: text, decisions_equal: (v) => typeof v === "boolean", scores_sha256: (v) => v === null || fits(HEX64)(v), task_class: fits(CLASS) };
const EXPLAINED: Cols = { cell_key: text, class: (v) => v === "explained, ln" || v === "explained, association", field: text, task_class: fits(CLASS) };
const VALUE: Cols = { ...EXPLAINED, a: fits(DOUBLE), b: fits(DOUBLE), kind: (v) => v === "value", ulps: count };
const DIGEST: Cols = { ...EXPLAINED, first_index: count, kind: (v) => v === "digest", max_ulps: count, terms: count };
const before = (a: ReportCell, b: ReportCell): boolean => a.task_class < b.task_class || (a.task_class === b.task_class && a.cell_key < b.cell_key);
const REPORT: Cols = {
  cells: (v, at) => each(nest(CELL))(v, at) && ((v as ReportCell[]).every((c, i, cs) => i === 0 || before(cs[i - 1] as ReportCell, c)) || rfail("cells are not unique and sorted by (task_class, cell_key)")),
  differences: each((v, at) => closed(v, isObj(v) && v.kind === "digest" ? DIGEST : VALUE, at) !== undefined), explanation: free, fields: free,
  format: (v) => v === REPORT_FORMAT, inputs: nest({ compare: each(nest(INPUT)), recompute: each(nest(INPUT)) }), oracles: free, platform: (v) => isObj(v) && isObj(v.libm) && fits(HEX64)(v.libm.sha256),
  registry: nest({ cells: count, generator_identity: text, sha256: fits(HEX64) }), replay: text, // no file (N-6): the input name is inputs.compare[].name
  scope: (v) => Array.isArray(v) && v.every((c, i) => fits(CLASS)(c) && (i === 0 || (v[i - 1] as string) < (c as string))), summary: free,
  tool: nest({ commit: fits(COMMIT), tree: text, tree_sha256: fits(HEX64) }),
  verifier: (v) => typeof v === "string" && /^[^@]+@[0-9a-f]{40}$/.test(v) && v.split("@")[0] === identityOf(v),
};
/** The deepest a report nests, in levels of lists and objects, the report itself the first: the form has 4 (inputs.compare[0]), report.py's
 *  canonical() stops near 500 (its recursion limit). A fixed bound, the stricter (fail-closed), so that no refusal hangs on the call stack. */
const NESTING = 64;
/** The canonical writing of report.py (sorted keys, no space, integers only, every string and every key ASCII, no final newline), at most NESTING levels deep. */
const canon = (v: unknown, level = 1): string => (Array.isArray(v) || isObj(v)) && level > NESTING ? rfail("not its canonical writing (nested too deep)")
  : Array.isArray(v) ? `[${v.map((x) => canon(x, level + 1)).join(",")}]`
  : isObj(v) ? `{${Object.keys(v).sort().map((k) => `${canon(k)}:${canon(v[k], level + 1)}`).join(",")}}`
  : typeof v === "string" && !/^[\x00-\x7f]*$/.test(v) ? rfail("a string that is not ASCII")
  : typeof v === "number" && !Number.isSafeInteger(v) ? rfail(`${v} is not an integer of the canonical writing`) : JSON.stringify(v);

/** The report of these bytes: its closed form and its canonical writing, or a named refusal. */
export function readRecomputeReport(bytes: Uint8Array | string): RecomputeReport {
  let t: string, doc: unknown;
  try { t = typeof bytes === "string" ? bytes : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); doc = JSON.parse(t); } catch { return rfail("not UTF-8 JSON"); }
  if (/[^\x00-\x7f]/.test(t)) rfail("not ASCII");
  closed(doc, REPORT, "report");
  if (canon(doc) !== t) rfail("not its canonical writing (sorted keys, no space, no final newline)");
  return doc as RecomputeReport;
}
