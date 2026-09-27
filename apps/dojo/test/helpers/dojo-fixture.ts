// MONARK Dojo -- PR-1b-1 signed fixture (ADR-DOJO-SNAPSHOT-1 section 6 PR-1b-1 l.370; D-8 l.227-229; served layout D-9
// l.242). Timeline lines chained and signed with the Bell primitives, imported unchanged, by Ed25519 keys generated at run
// time by node:crypto (motif test/bell-served.test.ts:314-315): no key is written or committed. Consumers: the dojo-chain
// tests (this lot), the verifier's tests (PR-1b-2, l.373) and the history integration test of PR-2b-4, which signs an anchor
// and a history line with this helper (ADR-DOJO-PR-2B l.547). Values fixed by the mere are cited; every other value is a
// SYNTHETIC test input, never a protocol value (O_1 and u_k: DOJO-OBJECTIVES-1; pool, quote vault and SOL/USD source:
// FAITS-SOL-USD-SOURCE-1; the anchor day, the horizon, the daily series and the seed secrets).
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, type KeyObject } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { GENESIS, canonical, keyIdOf, keyringOf, lineHash, signLine, trustOf, type Keyring, type Trust } from "../../../bell/scripts/bell-chain.mjs";
import { dayValue, holderCounted, lotsOf, provisionalOf, rootOf, scoreOf, tierOf, unitPrice, unitThreshold, unitsOf, validatedOf,
  type Fraction } from "../../scripts/dojo-core.mjs";

export type Line = Record<string, unknown>;
export const DAY_MS = 86_400_000;
export const DAY1 = 20_706; // 2026-09-10, day 1 (mere D-18 l.296), as a count of days since 1970-01-01 (ADR-DOJO-PR-2B l.229)
export const ANCHOR_DAY = DAY1 + 21; // 2026-10-01, SYNTHETIC
export const FIRST = ANCHOR_DAY + 1; // first read day: the day after the anchor (mere D-4 l.186, anchor before the first read day)
export const MINT = "FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT"; // out/mint.txt (mere l.54)
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // mere l.56, D-5 l.198
const O1 = "5000000"; // SYNTHETIC objective of one unit, micro-dollar-days
const EMPTY = createHash("sha256").digest("hex"); // sha256 of zero bytes: the lines and history files of this tree are empty

export const newKey = (): KeyObject => generateKeyPairSync("ed25519").privateKey;
/** UTC date AAAA-MM-JJ of a day count (ADR-DOJO-PR-2B D-12 l.457); at(d, h) = toISOString of hour h of day d. */
export const dateOf = (day: number): string => new Date(day * DAY_MS).toISOString().slice(0, 10);
export const at = (day: number, hour: number): string => new Date(day * DAY_MS + hour * 3_600_000).toISOString();

/** H^j over the 32 raw bytes of a hex seed (mere D-4 l.186, H = SHA-256), recoded here, independent of the walker. */
export function hashTimes(hex: string, j: number): string {
  let b: Buffer = Buffer.from(hex, "hex");
  for (let k = 0; k < j; k++) b = createHash("sha256").update(b).digest();
  return b.toString("hex");
}
/** Reverse seed chain of length n (D-4 l.186): seed(j) = H^(n - j)(s), seed(0) = the anchor a_0, j = days since the anchor's
 *  day (G1 journal Q-2). The secret s is sha256(label): a SYNTHETIC fixture constant, not a secret. */
export const seedChain = (label: string, n: number) => (j: number): string =>
  hashTimes(createHash("sha256").update(label).digest("hex"), n - j);

/** Keyring of the public parts of `keys` (bell-keyring-v1 until item DOJO-KEYRING-SCHEMA-1, a distinct Dojo keyring schema, G1 of PR-1b-2; G1 journal Q-3). */
export const keyringOfKeys = (keys: readonly KeyObject[]): Keyring => ({ schema: "bell-keyring-v1", keys: keys.flatMap((k) => keyringOf(k, 1).keys) });
/** Trust set through trustOf, the reader's path (bell-chain.mjs:106-117). */
export function trustOfKeys(keys: readonly KeyObject[]): Trust {
  const t = trustOf(keyringOfKeys(keys));
  if (t === null) throw new Error("dojo fixture: malformed keyring");
  return t;
}

/** One line to seal: its body, the signing key; a key_rotation names the new key (broken: signed by it alone); `pre` edits the
 *  line before its signatures, `post` after them (tampering). */
export interface Step {
  body: Line;
  key: KeyObject;
  rotateTo?: KeyObject | undefined;
  broken?: boolean | undefined;
  pre?: ((l: Line) => void) | undefined;
  post?: ((l: Line) => void) | undefined;
}
/** Chain and sign (D-8 l.227; bell-publish.mjs:262-333): seq, prev_line_hash (GENESIS first), key_id of the signing key; a
 *  rotation carries new_key, new_key_id and sig_new by the new key; sig covers the line without sig and sig_new. */
export function seal(schema: string, steps: readonly Step[]): Line[] {
  const out: Line[] = [];
  for (const s of steps) {
    const prior = out[out.length - 1];
    const l: Line = { schema, seq: out.length + 1, prev_line_hash: prior === undefined ? GENESIS : lineHash(prior), key_id: keyIdOf(s.key), ...s.body };
    const nk = s.rotateTo === undefined ? undefined : keyringOf(s.rotateTo, 1).keys[0];
    if (nk !== undefined) Object.assign(l, { new_key: nk.jwk, new_key_id: nk.key_id }, s.broken === true ? { continuity: "broken" } : {});
    s.pre?.(l);
    if (s.rotateTo !== undefined) l.sig_new = signLine(l, s.rotateTo);
    l.sig = signLine(l, s.key);
    s.post?.(l);
    out.push(l);
  }
  return out;
}

// ---- Dojo bodies (D-8 l.227): the fields of each kind ----
export function anchorBody(seedAnchor: string, horizon: number, day: number): Line {
  return { kind: "anchor", published_at: at(day, 12), seed_anchor: seedAnchor, mint: MINT, program: TOKEN_2022, k_reads: 4, horizon, // K = 4: P-4 l.538
    validation_days: 30, tier_windows: [30, 30, 30, 30, 180], price_window_days: 7, dust_threshold_microusd: "1000000", // D-8 l.227
    objective_unit_microusd_days: O1, tier_units: ["1", "2", "4", "8", "16"], pool: "fixture-pool", pool_quote_vault: "fixture-quote-vault",
    sol_usd_source: "fixture-sol-usd-source" };
}
/** Published once its last day is over, on the first read day (reads may start before it: P-36 l.589). */
export function historyBody(lastDay: number): Line {
  return { kind: "history", published_at: at(lastDay + 1, 0.5), history_first_day: dateOf(DAY1), history_last_day: dateOf(lastDay),
    history_sha256: EMPTY, history_lines_count: 0, history_root: rootOf([]) };
}
/** reads: [] -- the entries of a reading are not fixed by the mere (G1 journal Q-5); decimals 6: mere l.56-57. */
export function snapshotBody(day: number, seed: string, version: number | null): Line {
  return { kind: "snapshot", published_at: at(day + 1, 1), day: dateOf(day), seed, reads: [], mint: MINT, decimals: 6, price_version: version,
    lines_sha256: EMPTY, lines_count: 0, root: rootOf([]), score_total: "0", validated_total: "0", holders_count: version === null ? null : 0, status: "counted" };
}
/** Window of seven read days from windowFirst, effect the next day (D-17 l.287-288); p, T_1 and dust_threshold computed by
 *  dojo-core (D-3 l.174, D-17 l.290); SYNTHETIC daily series. */
export function versionBody(v: number, windowFirst: number, publishedAt: string): Line {
  const pi: Fraction[] = [0, 1, 2, 3, 4, 5, 6].map((k): Fraction => [String(10 + k), "7"]);
  const sigma: Fraction[] = [0, 1, 2, 3, 4, 5, 6].map((): Fraction => ["150", "1"]);
  const p = unitPrice(pi, sigma);
  return { kind: "price_version", published_at: publishedAt, price_version: v, effective_day: dateOf(windowFirst + 7), window_first_day: dateOf(windowFirst),
    pool_price_daily: pi, usd_per_sol_daily: sigma, unit_price_microusd: p, threshold_unit: unitThreshold(O1, p), dust_threshold: unitThreshold("1000000", p) };
}

export interface Fixture { key: KeyObject; trust: Trust; seed: (j: number) => string; steps: Step[] }
/** The valid timeline, 12 lines: anchor; history, day 1 to the eve of the first read day; snapshots of read days 1 to 7;
 *  price_version 1 (window = those seven days, effect on read day 8); snapshots of read days 8 and 9, which name it. */
export function dojoFixture(horizon = 40, chain = horizon): Fixture {
  const key = newKey(), seed = seedChain("dojo-fixture-seed", chain);
  const snap = (j: number): Step => ({ key, body: snapshotBody(ANCHOR_DAY + j, seed(j), j >= 8 ? 1 : null) });
  const steps: Step[] = [{ key, body: anchorBody(seed(0), horizon, ANCHOR_DAY) }, { key, body: historyBody(ANCHOR_DAY) },
    ...[1, 2, 3, 4, 5, 6, 7].map(snap), { key, body: versionBody(1, FIRST, at(FIRST + 7, 2)) }, snap(8), snap(9)];
  return { key, trust: trustOfKeys([key]), seed, steps };
}
/** The minimal served tree (D-9 l.242): timeline.jsonl, dojo/pubkey.json, and the (empty) lines and history files it names. */
export function servedTree(lines: readonly Line[], keys: readonly KeyObject[]): Map<string, Buffer> {
  return new Map([["timeline.jsonl", Buffer.from(lines.map((l) => canonical(l) + "\n").join(""))],
    ["dojo/pubkey.json", Buffer.from(canonical(keyringOfKeys(keys)) + "\n")], [`lines/${EMPTY}.jsonl`, Buffer.alloc(0)], [`history/${EMPTY}.jsonl`, Buffer.alloc(0)]]);
}

// ---- the renamed corpus (D-8 l.229): one event script rendered as a bell-timeline-v1 and as a dojo-timeline-v1 ----
/** "content" = a Bell publication, or the next Dojo content line (anchor, history, then snapshots of consecutive read days);
 *  key lines are the same in both dialects ("lose": a broken rotation to `to`, signed by `by`, the new key when well formed);
 *  the same keys sign both; `pre` and `post` apply to both renderings. */
export interface Ev {
  t: "content" | "rotate" | "lose" | "revoke";
  by: KeyObject;
  to?: KeyObject | undefined;
  revoke?: readonly [string, number] | undefined;
  pre?: ((l: Line) => void) | undefined;
  post?: ((l: Line) => void) | undefined;
}
export function renamedPair(events: readonly Ev[]): { bell: Line[]; dojo: Line[] } {
  const seed = seedChain("dojo-renamed-seed", 40), bell: Step[] = [], dojo: Step[] = [];
  let c = 0, t = at(ANCHOR_DAY, 12); // a key line takes the instant of the line before it
  for (const e of events) {
    const hooks = { pre: e.pre, post: e.post };
    if (e.t === "content") {
      const d = c === 0 ? anchorBody(seed(0), 40, ANCHOR_DAY) : c === 1 ? historyBody(ANCHOR_DAY) : snapshotBody(ANCHOR_DAY + c - 1, seed(c - 1), null);
      t = typeof d.published_at === "string" ? d.published_at : t;
      bell.push({ key: e.by, ...hooks, body: { kind: "publication", published_at: t, state_sha256: EMPTY, provenance_sha256: EMPTY, runs: [] } });
      dojo.push({ key: e.by, ...hooks, body: d });
      c += 1;
      continue;
    }
    const [id, from] = e.revoke ?? ["", 0];
    const body: Line = e.t === "revoke" ? { kind: "key_revocation", published_at: t, revoked_key_id: id, revoked_from_seq: from }
      : { kind: "key_rotation", published_at: t };
    const step: Step = e.t === "revoke" ? { key: e.by, ...hooks, body } : { key: e.by, rotateTo: e.to, broken: e.t === "lose", ...hooks, body };
    bell.push(step);
    dojo.push({ ...step, body: { ...body } });
  }
  return { bell: seal("bell-timeline-v1", bell), dojo: seal("dojo-timeline-v1", dojo) };
}

// ---- PR-1b-2: the served tree read by the verifier (D-9 l.246, D-10 l.251). Its files come from a SYNTHETIC scenario computed with
// the pure core, as the publisher of PR-3a will; the verifier's tests pin values by hand. dojoFixture and servedTree are unchanged ----
const DOJO = "dojo-timeline-v1"; // D-8 l.231
const ANCHOR = anchorBody("", 1, ANCHOR_DAY); // this fixture's anchor values (D-8 l.231; eighth pli: 30 kept as test values)
const W = ANCHOR.validation_days as number, TIER_U = ANCHOR.tier_units as string[], TIER_W = ANCHOR.tier_windows as number[];
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // Bitcoin alphabet (FAITS PR-1a L-14)
function b58(bytes: Uint8Array): string {
  let x = BigInt(`0x${Buffer.from(bytes).toString("hex")}`), s = "";
  for (; x > 0n; x /= 58n) s = B58.charAt(Number(x % 58n)) + s;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) s = `1${s}`;
  return s;
}
/** A holder: the public key of the SYNTHETIC Ed25519 seed sha256(label), on the curve by construction (motif
 *  test/bell-anchor-timeline.test.ts:21); P: the 32 bytes of y = 2, off the curve (FAITS PR-1a section 2, test of PR-1a). */
const holder = (label: string): string => b58(Buffer.from(createPublicKey(createPrivateKey({ format: "der", type: "pkcs8",
  key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), createHash("sha256").update(label).digest()]) }))
  .export({ format: "jwk" }).x ?? "", "base64url"));
export const ADDR = { A: holder("dojo-fixture-A"), B: holder("dojo-fixture-B"), D: holder("dojo-fixture-D"),
  P: b58(Uint8Array.from({ length: 32 }, (_, i) => (i === 0 ? 2 : 0))) };
const X4 = (v: string | null): (string | null)[] => [v, v, v, v]; // K = 4 readings (k_reads of the anchor)
/** SYNTHETIC readings of day number d (day 1 = 2026-09-10, the anchor's day is 22, read days 23 to 31): A holds 5 000 000 from day 2;
 *  B 2 000 000 from day 10 (day 15 missing), two readings without quorum on day 24, a sale to 500 000 on day 25, day 26 missing, a
 *  rebuy to 1 500 000 on day 27; D holds 1 000 000 from day 5 and reads a concordant 0 on day 24 (C-1: sold out); P, a program
 *  address, reads 7 000 000 from day 2. */
const SCENARIO: ReadonlyArray<readonly [string, (d: number) => (string | null)[]]> = [
  [ADDR.A, (d) => X4(d >= 2 ? "5000000" : "0")],
  [ADDR.B, (d) => (d === 15 || d === 26 ? X4(null) : d === 24 ? [null, "2000000", "2000000", null]
    : d === 25 ? ["600000", "500000", "2000000", "2000000"] : X4(d < 10 ? "0" : d < 25 ? "2000000" : "1500000"))],
  [ADDR.D, (d) => X4(d >= 5 && d <= 23 ? "1000000" : "0")],
  [ADDR.P, (d) => X4(d >= 2 ? "7000000" : "0")],
];
export interface DayLine { address: string; class: string; reads: (string | null)[]; day_value: string | null; lots: [string, number][]; score: string;
  validated: string; provisional: string; units: string | null; tier: number | null; holder_counted: boolean | null }
export interface HistoryLine { address: string; class: string; day: string; day_value: string | null }
const byAddress = <T extends { address: string }>(ls: T[]): T[] => ls.sort((x, y) => Buffer.compare(Buffer.from(x.address), Buffer.from(y.address)));
/** Day values of days 1 to d; a day not `known` is missing (a day without a snapshot line: D-2 l.162, D-16 l.275). */
const seriesOf = (r: (d: number) => (string | null)[], d: number, known: (n: number) => boolean): (string | null)[] =>
  Array.from({ length: d }, (_, i) => (known(i + 1) ? dayValue(r(i + 1).map((x) => [x])) : null));
const dayNo = (s: unknown): number => Date.parse(`${String(s)}T00:00:00.000Z`) / DAY_MS - DAY1 + 1;

/** History lines of days 1 to `last` (D-18 l.306), by day then address: a line when the day is missing, positive, or follows a
 *  positive last defined value (existence rule of ADR-DOJO-PR-2B l.463). */
export function historyLines(last: number): HistoryLine[] {
  const out: HistoryLine[] = [];
  for (let d = 1; d <= last; d++) {
    const today: HistoryLine[] = [];
    for (const [address, r] of SCENARIO) {
      const s = seriesOf(r, d, () => true), v = s[d - 1] ?? null, before = s.slice(0, -1).filter((x) => x !== null).pop() ?? "0";
      if (v === null || v !== "0" || before !== "0") today.push({ address, class: address === ADDR.P ? "program" : "holder", day: dateOf(DAY1 + d - 1), day_value: v });
    }
    out.push(...byAddress(today));
  }
  return out;
}
/** Lines of day number d (D-7 l.221-222) under the thresholds of `ver`, the price_version in force (null before the first: D-17
 *  l.293): a line when a reading is positive or the eve's pile is not empty; lots, points, units, tier, holder_counted by the core. */
export function dayLines(d: number, ver: Line | null, known: (n: number) => boolean = () => true): DayLine[] {
  const out: DayLine[] = [], T = ver === null ? null : (ver.threshold_unit as string), dust = ver === null ? null : (ver.dust_threshold as string);
  for (const [address, r] of SCENARIO) {
    const s = seriesOf(r, d, known), reads = r(d), program = address === ADDR.P, v = s[d - 1] ?? null;
    if (!reads.some((x) => x !== null && x !== "0") && (program || lotsOf(s.slice(0, -1)).length === 0)) continue;
    out.push(program ? { address, class: "program", reads, day_value: v, lots: [], score: "0", validated: "0", provisional: "0",
      units: T === null ? null : "0", tier: T === null ? null : 0, holder_counted: T === null ? null : false }
      : { address, class: "holder", reads, day_value: v, lots: lotsOf(s), score: scoreOf(s), validated: validatedOf(s, W), provisional: provisionalOf(s, W),
        units: unitsOf(s, W, T), tier: tierOf(s, T, TIER_U, TIER_W), holder_counted: holderCounted("holder", s, dust) });
  }
  return byAddress(out);
}
/** The lines render() serves for the snapshot at steps[i]: from the scenario, under the version it names; a day that is neither a
 *  history day nor a snapshot day of `steps` is missing. */
export function linesOf(steps: readonly Step[], i: number): DayLine[] {
  const b = steps[i]?.body ?? {}, h = steps.find((x) => x.body.kind === "history")?.body.history_last_day;
  const days = new Set(steps.filter((x) => x.body.kind === "snapshot").map((x) => dayNo(x.body.day)));
  const ver = steps.find((x) => x.body.kind === "price_version" && x.body.price_version === b.price_version)?.body ?? null;
  return dayLines(dayNo(b.day), ver, (n) => (h !== undefined && n <= dayNo(h)) || days.has(n));
}
/** dojo-keyring-v1 (item DOJO-KEYRING-SCHEMA-1, schema of the G1 journal of PR-1b-2): [key, valid_from_seq, valid_to_seq?] per key,
 *  its key_id (bell-chain.mjs keyIdOf) and the public members of its JWK. */
export function dojoKeyringOf(keys: ReadonlyArray<readonly [KeyObject, number, number?]>): Line {
  return { schema: "dojo-keyring-v1", keys: keys.map(([k, from, to]) => ({ key_id: keyIdOf(k), public_key: keyringOf(k, from).keys[0]?.jwk,
    valid_from_seq: from, ...(to === undefined ? {} : { valid_to_seq: to }) })) };
}
/** Version v whose seven SOL/USD values are `rate` (SYNTHETIC); p and the thresholds recomputed by the core (D-17 l.291-294). */
export function versionAt(v: number, windowFirst: number, publishedAt: string, rate: string): Line {
  const b = versionBody(v, windowFirst, publishedAt), sigma = Array.from({ length: 7 }, (): Fraction => [rate, "1"]);
  const p = unitPrice(b.pool_price_daily as Fraction[], sigma);
  return { ...b, usd_per_sol_daily: sigma, unit_price_microusd: p, threshold_unit: unitThreshold(O1, p), dust_threshold: unitThreshold("1000000", p) };
}
/** The served tree (D-9 l.246) of `steps`: the history file and each snapshot's lines (from `files`, else from the scenario), each
 *  named by its sha256; each signed line carries its file's sha256, count and root, a snapshot its totals (D-8 l.231); `edit` then
 *  changes the bodies before the signatures (the key holder's own tampering); dojo/pubkey.json = the first signer's dojo-keyring-v1. */
export function render(steps: readonly Step[], files: ReadonlyMap<number, readonly object[]> = new Map(), edit?: (s: Step[]) => void): Map<string, Buffer> {
  const tree = new Map<string, Buffer>(), s = steps.map((x) => ({ ...x, body: { ...x.body } }));
  const text = (ls: readonly object[]): string => ls.map((l) => `${canonical(l)}\n`).join("");
  const put = (dir: string, ls: readonly object[]): [string, number, string] => {
    const t = text(ls), sha = createHash("sha256").update(t).digest("hex");
    tree.set(`${dir}/${sha}.jsonl`, Buffer.from(t));
    return [sha, ls.length, rootOf(ls.map((l) => canonical(l)))];
  };
  s.forEach(({ body: b }, i) => {
    if (b.kind === "history") {
      const [sha, n, root] = put("history", files.get(i) ?? historyLines(dayNo(b.history_last_day)));
      Object.assign(b, { history_sha256: sha, history_lines_count: n, history_root: root });
    } else if (b.kind === "snapshot") {
      const ls = (files.get(i) ?? linesOf(steps, i)) as DayLine[], [sha, n, root] = put("lines", ls);
      const sum = (k: "score" | "validated"): string => String(ls.reduce((t, l) => t + BigInt(l[k]), 0n));
      Object.assign(b, { lines_sha256: sha, lines_count: n, root, score_total: sum("score"), validated_total: sum("validated"),
        holders_count: b.price_version === null ? null : ls.filter((l) => l.holder_counted === true).length });
    }
  });
  edit?.(s);
  tree.set("timeline.jsonl", Buffer.from(text(seal(DOJO, s))));
  const first = s[0];
  if (first !== undefined) tree.set("dojo/pubkey.json", Buffer.from(`${canonical(dojoKeyringOf([[first.key, 1]]))}\n`));
  return tree;
}
const made: string[] = []; // the directories writeTree created, removed by removeTrees (C-G2-4 of PR-1b-2)
/** Writes a served tree under a new directory of os.tmpdir() (TEMP on F: for every run of this lot). */
export function writeTree(tree: ReadonlyMap<string, Buffer>): string {
  const dir = mkdtempSync(join(tmpdir(), "dojo-v-"));
  made.push(dir);
  for (const [rel, b] of tree) {
    const p = join(dir, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, b);
  }
  return dir;
}
/** Removes every directory writeTree created (called from the after() of the tests that write trees); tolerant: a directory
 *  already gone, or one that cannot be removed, does not fail the run. */
export function removeTrees(): void {
  for (const dir of made.splice(0)) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* tolerant */ }
  }
}
