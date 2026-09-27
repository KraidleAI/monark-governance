// MONARK Dojo -- PR-2b-1 fixture reducer (ADR-DOJO-PR-2B section 4 l.628-645). Regenerates the reduced fixtures of this directory and
// sources.json from the raw SNAPSHOT-PROBE-3 output, outside the repository; CI never runs it. Usage: node reduce-probe3.mjs <probe dir>.
// Every source is found by its probe call id AND its sha256 in the probe SHA256SUMS, itself pinned by the ADR (section 1.2 l.70); no
// operator is named here: the two members are a and b (a = the first operator of D-3 OPS, b = the second); the operator part of the
// probe file names stays outside the repository. When two probe files of one call share the sha256 (identical bytes), either gives
// the same fixture: the reducer reads and checks both and lists the fixture under shared_sha256 in sources.json.
// Each fixture is ONE line: the JSON string of the hexadecimal of canonical(reduced value); hexadecimal because base58 letter runs trip
// scripts/lang-gate.mjs. A body keeps the fields history-read.ts reads (l.630); the non Token-2022 outer instructions keep only their
// programId (positions kept); the reading key of each RAW body is recorded.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonical } from "../../../../bell/scripts/bell-chain.mjs";
import { readBody, readKey } from "../../../src/history-read.ts";

const [dir] = process.argv.slice(2);
const SUMS_SHA256 = "e8ff845f3d0b3205e73c3a9135d6114fdb3e60ed35d4e4c8b16591eafa55e28f"; // ADR-DOJO-PR-2B section 12 l.816
const MINT = "FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT"; // out/mint.txt (TU-3); derived.json "mint"
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const sumsText = readFileSync(join(dir, "SHA256SUMS"));
if (sha(sumsText) !== SUMS_SHA256) throw new Error("SHA256SUMS differs from the ADR pin");
const sums = String(sumsText).trim().split("\n").map((l) => l.trim().split(/\s+\*?/));
const shared = [];
const raw = (name, call, h) => {
  const fs = sums.filter(([x, f]) => x === h && (f === `${call}.json` || f.startsWith(`${call}-`))).map(([, f]) => f);
  if (fs.length === 0) throw new Error(`no probe file of call ${call} with sha256 ${h}`);
  const ts = fs.map((f) => readFileSync(join(dir, f)));
  if (ts.some((t) => sha(t) !== h)) throw new Error(`sha256 mismatch: ${call} ${h}`);
  if (fs.length > 1) shared.push(name);
  return JSON.parse(String(ts[0]));
};
const t22 = (xs) => (xs ?? []).filter((x) => x.programId === T22);
const body = (b) => ({ blockTime: b.blockTime, slot: b.slot, transactionIndex: b.transactionIndex, version: b.version,
  meta: { err: b.meta.err, preTokenBalances: b.meta.preTokenBalances, postTokenBalances: b.meta.postTokenBalances, ...(b.meta.loadedAddresses ? { loadedAddresses: b.meta.loadedAddresses } : {}),
    innerInstructions: (b.meta.innerInstructions ?? []).map((g) => ({ index: g.index, instructions: t22(g.instructions) })).filter((g) => g.instructions.length > 0) },
  transaction: { signatures: b.transaction.signatures, message: { accountKeys: b.transaction.message.accountKeys.map((k) => ({ pubkey: k.pubkey, source: k.source })),
    instructions: b.transaction.message.instructions.map((x) => (x.programId === T22 ? x : { programId: x.programId })) } } });
const PLAN = [ // [fixture, probe call, member, sha256 of the source (probe SHA256SUMS, ADR l.632-642), rule]
  ["sig0.a.json", "A5", "a", "f4254e7ee85d67d64e942f48761c0e13281ee7f2ce9f6dd77e892548d37cc710", "body"],
  ["sig0.b.json", "A3", "b", "e062bdceb780f4df8c7e6bb5d52693c4745e9b07d19fe190e31d7910533c60dd", "body"],
  ["sig0.a-page.json", "A1", "a", "b6b0830560ae4585305bd40ad6e387f66f40c983d9f1fe4ff73193c4a9b75bd8", "full page"],
  ["c1.a.json", "C1", "a", "75f864c01043d1d0bc4a2a002c5e7b3f062299b244fa8c6d3d2919a8d829b2a7", "body"],
  ["c1.b.json", "C1", "b", "c97b29b2cb2d3b8df809c7fe8fa05765b73d61ca29172bd9c97d3a01a3594c10", "body"],
  ["c2.a.json", "C2", "a", "ffc3cb0eba3e60ced7b35d294fdab107a68bee3fdf9763f981dd693795ea8585", "body"],
  ["c2.b.json", "C2", "b", "3617b24dd370180909292a33e48a6ec98daae2d9c5bba47369bccbc6d1b8fe29", "body"],
  ["mint-tail.a.json", "A2-p024", "a", "0160165738ecd010d311e8a50dcd50abcd8a36677ff7fbdd172a4da18f87c572", "last 100"],
  ["mint-before-sig0.b.json", "A6", "b", "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", "all"],
  ["mint-tail.b.json", "B1", "b", "03d9fcca15bb732f9c299f514eb184c1155693dc34b8abe07a14a1644898508e", "last 100"],
  ["mint-head.a.json", "A2-p001", "a", "2534a43fda0e4cd2370e1683bb5f8c9385f0ac2e989242e8b0cb25a765e5c0c5", "entries 1 to 100 (after L[0])"],
  ["mint-head.b.json", "B3", "b", "41238e72d43807682b16f1517945b5445249a0e4c66e62bfe8ec4833cbdef201", "first 100 (before = L[0])"],
  ["acct-6tW6.a.json", "D1", "a", "92f3766e9457464b00560af592c7e2b65a73c8631d860ce6b6fb3ebbf019f48d", "first 100"],
  ["acct-6tW6.b.json", "D1", "b", "cb42f2b492512ae7f5fb7c37789ce98fda924b212ee91a078f9a41dcda945194", "first 100"],
  ["acct-MeQM.a.json", "D2", "a", "5cfa315d9eb5c79496efc1077bb95c5d4a3f47205674dc2a28e04f83c32a0889", "first 100"],
  ["acct-MeQM.b.json", "D2", "b", "38ff4875c00b81c593db29062aacf6e46d056f1bdbb16531c4b516a1085653be", "first 100"],
  ["probe3-expect.json", "derived", null, "e9b4a4fbbaf9f04546cdf1c8a6544cb68a29e0a9456cf02f6e510cdd42ca5514", "R2 sig0, slot, blockTime; SMID signature, blockTime"]];
const fixtures = {};
for (const [name, call, member, h, rule] of PLAN) {
  const r = raw(name, call, h);
  const value = rule === "body" ? body(r) : rule === "full page" ? { data: r.data.map(body), paginationToken: r.paginationToken }
    : rule === "all" ? r : rule.startsWith("last") ? r.slice(-100) : rule.startsWith("entries") ? r.slice(1, 101) : rule.startsWith("first") ? r.slice(0, 100)
    : { sig0: r.R2.sig0, slot: r.R2.bodies[0].slot, blockTime: r.R2.bodies[0].blockTime, smid: { signature: r.SMID.signature, blockTime: r.SMID.blockTime } };
  const text = canonical(value);
  const key = rule === "body" ? readKey(readBody(r, MINT), true) : rule === "full page" ? readKey(readBody(r.data[0], MINT), true) : null;
  fixtures[name] = { call, member, source_sha256: h, rule, sha256: sha(text), ...(key ? { key } : {}) };
  writeFileSync(new URL(name, import.meta.url), JSON.stringify(Buffer.from(text).toString("hex")) + "\n");
}
const out = { probe: "SNAPSHOT-PROBE-3", probe_dir: dir.replace(/\\/g, "/"), probe_sha256sums: SUMS_SHA256, mint: MINT,
  members: "a = the first operator of ADR-DOJO-PR-2B D-3 OPS, b = the second; a source is named by its probe call id, its member and its sha256 in the probe SHA256SUMS, never by an operator",
  encoding: "each fixture = one JSON string: hexadecimal of canonical(reduced value); sha256 below = of the decoded text",
  body_rule: "slot, blockTime, transactionIndex, version, meta.err, pre/postTokenBalances (all mints), loadedAddresses if any, inner Token-2022 instructions, outer instructions (non Token-2022: programId only), accountKeys (pubkey, source), signatures; key = readKey(readBody(raw), true)",
  shared_sha256: { fixtures: shared, note: "two probe files of the same call carry this source sha256 (identical bytes, one of them from the third operator that D-3 never uses): the fixture is the same whichever is read" },
  fixtures };
writeFileSync(new URL("sources.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
