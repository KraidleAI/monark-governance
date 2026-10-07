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
export const VERIFIERS_SHA256 = "3a6f304f3eb592c51c73fb8d13c6a3f752bf0168563f57fc5b8ab966a6975d0d";
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
