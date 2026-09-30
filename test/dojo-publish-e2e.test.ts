// MONARK Dojo -- TU-1c (ADR-DOJO-PR-3 D-2 and section 3; mere T-9), the end-to-end test of the publisher, under the wiring root test/
// (decision 275, Q-G1-5; precedent ADR-DOJO-PR-4 D-3): eight days written by the REAL writers of PR-2-1 and PR-2-2 (readingRecord,
// writeDayBundle; closeLayout, nextEve) in the handoff layout DOJO-HANDOFF-LAYOUT-1, from the verbatim responses of
// apps/dojo/test/fixtures/collect/, published by the REAL publisher (seven days by publishDay, the eighth by its CLI --inbox), the served
// tree read back green by the REAL verifier under a SUPPLIED dojo-keyring-v1. Key and seed are made at run time under the OS temp dir;
// betas and instants SYNTHETIC; the history line and its file stand in for PR-3a-2, their writer. The helpers are minimal copies of those
// of apps/dojo/test/dojo-publish.test.ts (declared duplicate, G1 journal of PR-3a-1b).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, type KeyObject } from "node:crypto";
import { appendFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, keyIdOf, lineHash, signLine } from "../apps/bell/scripts/bell-chain.mjs";
import { daySeed, ownerClass, readInstants, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import * as publisher from "../apps/dojo/scripts/dojo-publish.mjs"; // publishDay bound late: the base of the lot, which lacks it, loads this file
import { initSeed } from "../apps/dojo/scripts/dojo-seed.mjs";
import { dirSource, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { readingRecord, recordBytes, writeDayBundle } from "../apps/dojo/src/bundle.ts";
import { READ_RULE } from "../apps/dojo/src/dojo-methods.ts";
import { closeLayout, nextEve, readDayLayout } from "../apps/dojo/src/layout.ts";
import type { Eve } from "../apps/dojo/src/reading.ts";
import { ADDR, MINT, betaOf, dateOf, dojoKeyringOf, roundOf } from "../apps/dojo/test/helpers/dojo-fixture.ts";

type Obj = Record<string, unknown>;
type Resp = { context: { slot: number }; value: unknown };
const { publishAnchor, publishDay } = publisher, SCRIPT = fileURLToPath(new URL("../apps/dojo/scripts/dojo-publish.mjs", import.meta.url));
const dirs: string[] = [];
after(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
const tmp = (prefix: string): string => { const d = mkdtempSync(join(tmpdir(), prefix)); dirs.push(d); return d; };
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
/** JSON of a text; an unparsable text reads {unparsable: <text>}: a corrupt output fails an assertion, never the test body. */
const json = (t: string): Obj => { try { return JSON.parse(t) as Obj; } catch { return { unparsable: t }; } };
const linesOf = (p: string): Obj[] => readFileSync(p, "utf8").trimEnd().split("\n").map(json);
/** Runs f, which must not throw: an unexpected refusal fails an assertion, never the test body. */
function ok<T>(f: () => T): T { let r: T | undefined; assert.doesNotThrow(() => { r = f(); }); return r as T; }
const fx = (f: string): Obj => json(readFileSync(new URL(`../apps/dojo/test/fixtures/collect/${f}`, import.meta.url), "utf8"));
const E = fx("enumeration.json") as { a: Resp; b: Resp }, ACC = fx("accounts.json") as Record<"mint" | "pool" | "wsol" | "pyth", { a: Resp; b: Resp }>;
const POOL = (ACC.wsol.a.value as { data: { parsed: { info: { owner: string } } } }).data.parsed.info.owner; // the Pool, owner of its wSOL account
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW"; // ADR-DOJO-PR-2 D-4
const PYTH = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE", X = "Dw76Ydu2svQ9rMWRevhumwjnRdF1dpzSyD1bY7wF3WbW"; // SOL/USD (D-3); X: owner of 3tdL
const DAY = 86_400_000, K = 4, T0 = Date.UTC(2026, 8, 11, 12), A = Math.floor(T0 / DAY); // SYNTHETIC anchor instant; day A = 2026-09-11
const slot = (d: number): number => (d + 1) * DAY + 1_800_000; // 00:30 UTC of d + 1, the first slot of the publish timer (ADR-DOJO-PR-3 D-5)
/** The fixture's Pyth account at a SYNTHETIC publish_time (little-endian i64 at byte 93, reading.ts decodePyth). */
function pythAt(sec: number): Resp {
  const r = structuredClone(ACC.pyth.a) as { context: { slot: number }; value: { data: [string, string] } }, b = Buffer.from(r.value.data[0], "base64");
  new DataView(b.buffer, b.byteOffset, b.byteLength).setBigInt64(93, BigInt(sec), true); // little-endian
  r.value.data = [b.toString("base64"), "base64"];
  return r;
}
interface World { s: string; inbox: string; key: KeyObject; secret: string; eve: Eve }
/** An anchored state (day A; K = 4, W = 60, u = 1..5, O_1, one dollar of dust: decisions 234, 236, 225 (7), 248), its seed chain from
 *  dojo-seed.mjs (horizon 365), then the history line of days 1 to A, signed after the committed timeline, its file in public/history/,
 *  served as its writer would (mere D-18): X holds 40 000 000 000 000 (sold down to its enumerated amount on A + 1), ADDR.A 5 000 000
 *  (no account on the read days: a concordant 0, C-1); the Eve of A + 1 = those two addresses. SYNTHETIC values. */
function world(): World {
  const s = tmp("dojo-e2e-state-"), inbox = tmp("dojo-e2e-inbox-"), key = generateKeyPairSync("ed25519").privateKey, file = join(tmp("dojo-e2e-seed-"), "seed");
  const request = { ...initSeed(file, 365), mint: MINT, program: TOKEN_2022, k_reads: K, validation_days: 60, tier_units: ["1", "2", "3", "4", "5"],
    objective_unit_microusd_days: "60000000000", tier_windows: [60, 60, 60, 60, 180], price_window_days: 7, pool: POOL, pool_quote_vault: QUOTE_VAULT,
    sol_usd_source: PYTH, dust_threshold_microusd: "1000000", read_rule: { ...READ_RULE } };
  ok(() => publishAnchor({ stateDir: s, key, request, clock: () => T0 }));
  const hl = [{ address: X, day_value: "40000000000000" }, { address: ADDR.A, day_value: "5000000" }]
    .map((x) => ({ ...x, class: ownerClass(x.address), day: dateOf(A) })).sort((x, y) => Buffer.compare(Buffer.from(x.address), Buffer.from(y.address)));
  const priv = join(s, "timeline.jsonl"), prior = linesOf(priv), text = hl.map((l) => `${canonical(l)}\n`).join(""), h = sha(text);
  mkdirSync(join(s, "public", "history"), { recursive: true });
  writeFileSync(join(s, "public", "history", `${h}.jsonl`), text);
  const line: Obj = { schema: "dojo-timeline-v1", seq: prior.length + 1, kind: "history", prev_line_hash: lineHash(prior.at(-1)), key_id: keyIdOf(key),
    published_at: new Date((A + 1) * DAY + 600_000).toISOString(), history_first_day: "2026-09-10", history_last_day: dateOf(A),
    history_sha256: h, history_lines_count: hl.length, history_root: rootOf(hl.map((l) => canonical(l))) };
  appendFileSync(priv, `${canonical({ ...line, sig: signLine(line, key) })}\n`);
  writeFileSync(join(s, "public", "timeline.jsonl"), readFileSync(priv));
  return { s, inbox, key, secret: readFileSync(file, "utf8").trim(), eve: { addresses: hl.map((x) => x.address), accounts: [] } };
}
/** Writes bundles/<d>/ with the real writers, in the order of --close-day, and returns the Eve of d + 1 (nextEve of the layout's day). */
function writeDay(w: World, d: number, eve: Eve): Eve {
  const day = dateOf(d), seed = daySeed(w.secret, 365, d - A), beta = betaOf(d), T = d * 86_400, dir = join(w.inbox, day);
  const anchor = { mint: MINT, pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_max_age_s: 165 };
  const recs = readInstants(seed, beta, K, T, 900).map((t, j) => readingRecord({ day, i: j + 1, instant: t, anchor, eve, enumeration: E,
    read_at: new Date((t + 10) * 1000).toISOString(), mint: j === 0 ? ACC.mint : null, pool: ACC.pool, wsol: ACC.wsol,
    pyth: { a: pythAt(t - 10), b: pythAt(t - 10) } }));
  const { bytes } = writeDayBundle({ day, seed, beacon: { round: roundOf(d), signature: beta }, read_rule: READ_RULE, k_reads: K, mint: MINT,
    program: TOKEN_2022, decimals: 6, records: recs, eve }, T + 2 * 86_400);
  mkdirSync(join(dir, "readings"), { recursive: true });
  recs.forEach((r, j) => { writeFileSync(join(dir, "readings", `${j + 1}.json`), recordBytes(r)); });
  writeFileSync(join(dir, "eve.json"), `${canonical(eve)}\n`);
  closeLayout(dir, [], recs.length, bytes);
  const L = readDayLayout(dir);
  return nextEve(L.bundle, L.records, L.eve);
}
/** The CLI under an injected clock: a preloaded module sets Date.now, the CLI's only clock (Q-G1-7); the key comes from its credential. */
function cliAt(t: number, args: string[], key: KeyObject): { status: number | null; stdout: string; stderr: string } {
  const creds = tmp("dojo-e2e-cred-");
  writeFileSync(join(creds, "dojo-signing-key"), key.export({ type: "pkcs8", format: "pem" }));
  return spawnSync(process.execPath, ["--import", `data:text/javascript,Date.now=()=>${t}`, SCRIPT, ...args],
    { env: { ...process.env, CREDENTIALS_DIRECTORY: creds }, encoding: "utf8" });
}

// killer: apps/dojo/scripts/dojo-publish.mjs:220 CONST "lots: lotsOf(s)" -> "lots: lotsOf(s.slice(0, -1))"
test("dojo_publish_to_verify_end_to_end", async () => {
  const w = world(), got: (number | null)[] = [], pub = join(w.s, "public");
  let eve = w.eve;
  for (let d = A + 1; d <= A + 7; d++) {
    eve = writeDay(w, d, eve);
    const r = ok(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: () => slot(d) }));
    got.push(r.status === "published" ? r.price_version : -1);
  }
  writeDay(w, A + 8, eve);
  const c8 = cliAt(slot(A + 8), ["--inbox", w.inbox, "--state", w.s], w.key), r8 = json(c8.stdout);
  assert.deepEqual([c8.status, r8.status, r8.day, r8.price_version], [0, "published", dateOf(A + 8), null], c8.stderr);
  assert.deepEqual(got, [null, null, null, null, null, null, 1], "one price_version at the seventh valid day (TU-11), none at the eighth (one per window)");
  const tl = linesOf(join(pub, "timeline.jsonl")), s8 = tl.at(-1);
  const linesAt = (l: Obj | undefined): Obj[] => linesOf(join(pub, "lines", `${String(l?.lines_sha256)}.jsonl`));
  assert.deepEqual(tl.map((l) => l.kind), ["anchor", "history", ...Array<string>(7).fill("snapshot"), "price_version", "snapshot"]);
  const v = await verifyDojoServed({ source: dirSource(pub), keyring: dojoKeyringOf([[w.key, 1]]) });
  assert.deepEqual([v.ok, v.ok && v.status, v.ok && v.snapshots, v.ok && v.head?.recomputed_root], [true, "consistent_with_supplied_keyring", 8, s8?.root],
    JSON.stringify(v));
  assert.deepEqual([s8?.price_version, typeof s8?.holders_count, linesAt(s8).every((l) => l.units !== null && l.tier !== null), s8?.published_at],
    [1, "number", true, new Date(slot(A + 8)).toISOString()], "units in force; the CLI signed at the injected clock (Q-G1-7)");
  const [l1, l2] = [linesAt(tl[2]), linesAt(tl[3])], byA = (ls: Obj[], a: string) => ls.find((l) => l.address === a);
  assert.deepEqual([byA(l1, X)?.lots, byA(l1, ADDR.A)?.lots, byA(l1, ADDR.A)?.day_value, byA(l2, ADDR.A)], [[["33038581191731", 2]], [], "0", undefined],
    "the history's lots sold down (LIFO, D-16); an address without account reads 0, keeps its line the day it leaves, none the next (D-7, C-1)");
  const served = readdirSync(pub, { recursive: true, encoding: "utf8" }).map((p) => p.split(sep).join("/"));
  for (const rel of served.filter((p) => !["dojo", "lines", "history"].includes(p))) {
    assert.match(rel, /^(timeline\.jsonl|dojo\/pubkey\.json|(lines|history)\/[0-9a-f]{64}\.jsonl)$/, "only the served files (M-E9)");
    assert.doesNotMatch(readFileSync(join(pub, ...rel.split("/")), "utf8"), /helius|solana-foundation|drand|cloudflare/i, `${rel}: no operator label (M-E3)`);
  }
});
