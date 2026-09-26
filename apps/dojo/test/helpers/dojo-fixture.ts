// MONARK Dojo -- PR-1b-1 signed fixture (ADR-DOJO-SNAPSHOT-1 section 6 PR-1b-1 l.370; D-8 l.227-229; served layout D-9
// l.242). Timeline lines chained and signed with the Bell primitives, imported unchanged, by Ed25519 keys generated at run
// time by node:crypto (motif test/bell-served.test.ts:314-315): no key is written or committed. Consumers: the dojo-chain
// tests (this lot), the verifier's tests (PR-1b-2, l.373) and the history integration test of PR-2b-4, which signs an anchor
// and a history line with this helper (ADR-DOJO-PR-2B l.547). Values fixed by the mere are cited; every other value is a
// SYNTHETIC test input, never a protocol value (O_1 and u_k: DOJO-OBJECTIVES-1; pool, quote vault and SOL/USD source:
// FAITS-SOL-USD-SOURCE-1; the anchor day, the horizon, the daily series and the seed secrets).
import { createHash, generateKeyPairSync, type KeyObject } from "node:crypto";
import { GENESIS, canonical, keyIdOf, keyringOf, lineHash, signLine, trustOf, type Keyring, type Trust } from "../../../bell/scripts/bell-chain.mjs";
import { rootOf, unitPrice, unitThreshold, type Fraction } from "../../scripts/dojo-core.mjs";

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
