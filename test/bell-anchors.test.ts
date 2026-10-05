/**
 * Root tests for the Bell anchors served under /bell/anchors (lot SITE-CHARTE-C; decision 146 ruling Q2 — "status
 * per anchor read from the file"; orchestrator ruling (3) of 2026-09-23: block heights are never a literal in the
 * source, they are read from the served proof files). Non-LLM oracles, run by `npm test`:
 *   (1) bell_anchors_served_register_matches_source — the register served under apps/site/public/bell/anchors/
 *       IS the governance register docs/course-bell/ANCHORS.md (real lines, parsed by the page's own reader),
 *       every served proof is byte-identical to the committed proof, every served manifest hashes to its line's
 *       digest, every proof attests exactly that digest, and nothing else is served there;
 *   (2) bell_ots_reader_matches_reference_client — the structural proof reader equals the reference client on a
 *       known answer (opentimestamps-client 0.7.2 `ots info`, recorded in the lot report) and fails closed on
 *       malformed bytes.
 * Mutants (named, measured in the lot report): change one digest in anchors.json => (1) reds; append a byte to a
 * served proof => (1) and (2) red. ADR-BELL-OTS-ANCHOR-1 PR-A adds the publications register (served publications.json and its
 * files; (1) covers both registers): T-2, the C-7 source assertion and the reader's named errors below; mutants in its G1.
 * ADR-BELL-OTS-PRB PR-B1 (T-B3): every sync test runs on syncRoot() (a copy refusing any link, removed in `finally`); T-2 binds each row
 * to lines[] of the site data; the sync refuses an unbound row or a link before any write (S-1..S-11, CM-13) and, on the intact copy,
 * rewrites the served set byte for byte (C-V-1).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, cpSync, writeFileSync, rmSync, lstatSync, mkdirSync, renameSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { parseAnchorsRegister, readOtsProof, anchorStatus, manifestDigests, parsePublicationAnchors, bindPublicationAnchor, bindPublicationRowToLines, manifestEntries, publicationAnchorState } from "../apps/site/lib/bell-anchors.ts";
import type { AnchorsRegister, PublicationAnchorsRegister } from "../apps/site/lib/bell-anchors.ts";
import { loadBellServed } from "../apps/site/lib/bell-served-load.ts";
import { loadPublicationAnchors } from "../apps/site/lib/bell-publications-load.ts";
import { WHITELIST_DIRS, WHITELIST_FILES } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const SERVED = join(ROOT, "apps", "site", "public", "bell", "anchors");
const SOURCE = join(ROOT, "docs", "course-bell"), PUB = join(ROOT, "docs", "bell-publications");
const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");
const OUT_REL = "apps/site/public/bell/anchors";
const SYNC_SOURCES = ["scripts/sync-bell-anchors.mjs", "apps/site/lib/bell-anchors.ts", "apps/site/lib/bell-served-load.ts", "docs/course-bell", "docs/bell-publications", OUT_REL,
  "apps/site/data/bell-served.json", "apps/site/data/manifest.sha256.json"];

/** A temporary root holding what the sync reads, the course manifests at the bytes their rows name (the served copies: no `git show`
 *  outside a repository). TEST-CPSYNC-SYMLINK-1: a link anywhere in a copied source is refused (lstat, recursive) BEFORE any copy, since
 *  cpSync would copy it as a link. The caller removes `tmp` in `finally`. */
function syncRoot(): { tmp: string; snap: () => string[]; run: () => SpawnSyncReturns<string> } {
  const noLink = (abs: string): void => {
    const st = lstatSync(abs);
    assert.ok(!st.isSymbolicLink(), `${abs} is a link: refused before any copy`);
    if (st.isDirectory()) for (const n of readdirSync(abs)) noLink(join(abs, n));
  };
  for (const rel of SYNC_SOURCES) noLink(join(ROOT, rel));
  const tmp = mkdtempSync(join(tmpdir(), "bell-sync-")), out = join(tmp, OUT_REL);
  for (const rel of SYNC_SOURCES) cpSync(join(ROOT, rel), join(tmp, rel), { recursive: true });
  for (const r of parseAnchorsRegister(readFileSync(join(SOURCE, "ANCHORS.md"), "utf8"))) if (r.manifest_file !== null) cpSync(join(SERVED, r.manifest_file), join(tmp, "docs", "course-bell", r.manifest_file));
  return {
    tmp,
    snap: () => readdirSync(out).sort().map((n) => `${n} ${sha256(readFileSync(join(out, n)))}`),
    run: () => spawnSync(process.execPath, [join(tmp, "scripts", "sync-bell-anchors.mjs")], { cwd: tmp, encoding: "utf8" }),
  };
}

test("bell_anchors_served_register_matches_source — served register == ANCHORS.md real lines; proofs byte-equal; manifests hash to their digest", () => {
  const source = parseAnchorsRegister(readFileSync(join(SOURCE, "ANCHORS.md"), "utf8"));
  const served = JSON.parse(readFileSync(join(SERVED, "anchors.json"), "utf8")) as AnchorsRegister;
  assert.ok(source.length >= 1, "no real line parsed from docs/course-bell/ANCHORS.md (false green)");
  assert.deepEqual(served.rows, source, "anchors.json must equal the parsed register — run node scripts/sync-bell-anchors.mjs");

  const expectedFiles = new Set<string>(["anchors.json"]);
  let proofs = 0;
  for (const r of served.rows) {
    if (r.proof_file === null || r.manifest_file === null) {
      assert.equal(r.proof_file, r.manifest_file, `${r.date_utc}: a line without proof serves no manifest either`);
      continue;
    }
    proofs += 1;
    expectedFiles.add(r.proof_file).add(r.manifest_file);
    const proofBytes = new Uint8Array(readFileSync(join(SERVED, r.proof_file)));
    assert.deepEqual(proofBytes, new Uint8Array(readFileSync(join(SOURCE, r.proof_file))), `${r.proof_file}: served proof must be the committed proof`);
    assert.equal(sha256(new Uint8Array(readFileSync(join(SERVED, r.manifest_file)))), r.manifest_sha256, `${r.manifest_file}: served bytes must hash to the line's manifest digest`);
    const proof = readOtsProof(proofBytes);
    assert.equal(proof.hashOp, "sha256", `${r.proof_file}: proof must timestamp a sha256 digest`);
    assert.equal(proof.digestHex, r.manifest_sha256, `${r.proof_file}: the proof must attest the line's manifest digest`);
    assert.ok(proof.attestations.length >= 1, `${r.proof_file}: a proof carries at least one attestation`);
  }
  assert.ok(proofs >= 1, "no timestamped line served (false green)");
  for (const r of (JSON.parse(readFileSync(join(SERVED, "publications.json"), "utf8")) as PublicationAnchorsRegister).rows) if (r.proof_file !== null && r.manifest_file !== null) expectedFiles.add(r.proof_file).add(r.manifest_file);
  assert.deepEqual(new Set(readdirSync(SERVED)), expectedFiles.add("publications.json"), "the served directory holds exactly anchors.json, publications.json and both registers' manifests and proofs");
});

// T-2 (tuyau P-4): publications.json IS the register (site's reader); served proofs are the committed ones; rows bind to the SERVED files.
test("bell_publication_anchors_served_register_matches_source — publications.json == register rows; served manifests and proofs bind", () => {
  const source = parsePublicationAnchors(readFileSync(join(PUB, "ANCHORS.md"), "utf8"));
  const served = JSON.parse(readFileSync(join(SERVED, "publications.json"), "utf8")) as PublicationAnchorsRegister;
  assert.deepEqual(served, { register: "docs/bell-publications/ANCHORS.md", rows: source }, "publications.json must equal the parsed register — run node scripts/sync-bell-anchors.mjs");
  const bound = source.filter((r) => r.proof_file !== null && r.manifest_file !== null).map((r) => {
    const manifest = readFileSync(join(SERVED, r.manifest_file ?? "")), proof = new Uint8Array(readFileSync(join(SERVED, r.proof_file ?? "")));
    assert.deepEqual(proof, new Uint8Array(readFileSync(join(PUB, r.proof_file ?? ""))), `${String(r.proof_file)}: served proof must be the committed proof`);
    bindPublicationAnchor(r, manifest.toString("utf8"), sha256(manifest), readOtsProof(proof));
    return r.seq;
  });
  assert.ok(bound.length >= 1, "no timestamped publication row served (false green)");
  // Every served row, timestamped or not, binds to the chain the site data walked (lines[] of bell-served.json v4): seq, line_hash, kind, and
  // the manifest's files (SYNC-LINES-CHECK-1 extended; G2-M7 reds here).
  const { lines } = loadBellServed(ROOT);
  for (const r of source) bindPublicationRowToLines(r, r.manifest_file === null ? null : manifestEntries(readFileSync(join(SERVED, r.manifest_file), "utf8")), lines);
});

// T-3a (tuyau P-5, ADR-BELL-OTS-PRB T-B8): from the served data (head, lines[]) and the served files, the state is RECOMPUTED here (sha256
// by node:crypto, the manifest lines split anew, key AND digest compared, the prev_line_hash chain walked, heights read by the structural
// reader) and must equal publicationAnchorState over the rows loadPublicationAnchors binds; the same on a copy whose proof is the synthetic
// block fixture, its digest substituted (anchored). M-5: a manifest byte changed throws; M-5 ter: lines[] not covering a row, or a foreign
// line_hash, throws the named error (a loader that skipped the binding would render "none" in silence). No state literal on real data.
test("bell_publication_anchor_composes_served_head_to_rendered_claim — the state recomputed from the served files equals the pages' (T-3a)", () => {
  const served = loadBellServed(ROOT), { head, lines } = served, pub = JSON.parse(readFileSync(join(SERVED, "publications.json"), "utf8")) as PublicationAnchorsRegister;
  const load = (dir: string, ls = lines) => loadPublicationAnchors(dir, { lines: ls }, { readOtsProof, anchorStatus, manifestEntries, bindPublicationAnchor, bindPublicationRowToLines });
  const recompute = (dir: string): Record<string, unknown> => {
    const counted: Array<{ seq: number; date: string; h: number[] }> = [];
    let latest: number | null = null;
    for (const r of pub.rows) {
      if (r.manifest_file === null || r.proof_file === null) continue;
      const bytes = readFileSync(join(dir, r.manifest_file)), proof = readOtsProof(new Uint8Array(readFileSync(join(dir, r.proof_file))));
      assert.ok(sha256(bytes) === r.manifest_sha256 && proof.digestHex === r.manifest_sha256, `${r.manifest_file}: bytes and proof timestamp the row's digest`);
      const carries = bytes.toString("utf8").split("\n").some((l) => l === `timeline.jsonl#L${String(r.seq)} ${lines[r.seq - 1]?.line_hash ?? "?"}`);
      const h = [...new Set(proof.attestations.flatMap((a) => (a.kind === "bitcoin" ? [a.height] : [])))].sort((x, y) => x - y);
      let chained = lines[head.seq - 1]?.line_hash === head.line_hash;
      for (let k = head.seq + 1; k <= r.seq; k++) chained = chained && lines[k - 1]?.prev_line_hash === lines[k - 2]?.line_hash;
      if (carries && h.length > 0) latest = Math.max(latest ?? 0, r.seq);
      if (r.seq >= head.seq && chained && carries) counted.push({ seq: r.seq, date: r.date_utc, h });
    }
    counted.sort((a, b) => a.seq - b.seq || a.date.localeCompare(b.date));
    const blocks = counted.filter((c) => c.h.length > 0).sort((a, b) => (a.h[0] ?? 0) - (b.h[0] ?? 0)), best = blocks[0], first = counted[0], base = { head_seq: head.seq, latestAnchoredSeq: latest };
    if (best !== undefined) return { ...base, state: "anchored", via_seq: best.seq, date_utc: best.date, earliestHeight: best.h[0], blockRecords: best.h.length };
    return first === undefined ? { ...base, state: "none" } : { ...base, state: "pending", via_seq: first.seq, date_utc: first.date };
  };
  assert.deepEqual(publicationAnchorState(head, lines, load(SERVED).bound), recompute(SERVED), "real served files: the pages' state is the recomputed one");
  const row = pub.rows.find((r) => r.proof_file !== null && r.manifest_file !== null);
  assert.ok(row !== undefined && row.proof_file !== null && row.manifest_file !== null, "non-vacuity: a timestamped publication row is served");
  const tmp = mkdtempSync(join(tmpdir(), "bell-t3a-"));
  try {
    cpSync(SERVED, tmp, { recursive: true });
    const fx = readFileSync(join(ROOT, "test", "fixtures", "fixture-bell-seq2-block.ots")), at = fx.indexOf(Buffer.from(readOtsProof(new Uint8Array(fx)).digestHex, "hex"));
    writeFileSync(join(tmp, row.proof_file), Buffer.concat([fx.subarray(0, at), Buffer.from(row.manifest_sha256, "hex"), fx.subarray(at + 32)]));
    const block = publicationAnchorState(head, lines, load(tmp).bound);
    assert.deepEqual(block, recompute(tmp), "block copy: the pages' state is the recomputed one");
    assert.deepEqual([block.state, block.state === "anchored" ? [block.via_seq, block.earliestHeight] : []], ["anchored", [row.seq, 1]], "the fixture's block record is read");
    // C-G2-9 (G2 PR-B): a row without proof is bound to lines[] by the loader too (E-B2-5); one beyond lines[] throws its named error.
    const pubPath = join(tmp, "publications.json"), pubText = readFileSync(pubPath, "utf8");
    writeFileSync(pubPath, JSON.stringify({ ...pub, rows: [...pub.rows, { ...row, seq: lines.length + 1, kind: "key_rotation", manifest_file: null, proof_file: null }] }));
    assert.throws(() => load(tmp), new RegExp(`seq ${String(lines.length + 1)} is beyond the served lines`), "a row without proof beyond lines[] throws in the loader");
    writeFileSync(pubPath, pubText);
    const man = readFileSync(join(tmp, row.manifest_file), "utf8"), pre = `timeline.jsonl#L1-L${String(row.seq)} `;
    writeFileSync(join(tmp, row.manifest_file), man.replace(pre + row.prefix_sha256, pre + (row.prefix_sha256.startsWith("0") ? "1" : "0") + row.prefix_sha256.slice(1)));
    assert.throws(() => load(tmp), /do not hash to manifest_sha256/, "M-5: a manifest byte changed: the loader throws");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  assert.throws(() => load(SERVED, lines.slice(0, row.seq - 1)), new RegExp(`seq ${String(row.seq)} is beyond the served lines`), "M-5 ter: lines[] does not cover the row");
  assert.throws(() => load(SERVED, lines.map((l) => (l.seq === row.seq ? { ...l, line_hash: "0".repeat(64) } : l))), new RegExp(`line_hash is not that of line ${String(row.seq)}`), "M-5 ter: a foreign line_hash");
});

// C-7: synthetic proofs only under test/fixtures/ (fixture-*); the source holds exactly its register and named files; test/ is not exported.
test("bell_publication_anchors_source_holds_no_fixture", () => {
  const named = parsePublicationAnchors(readFileSync(join(PUB, "ANCHORS.md"), "utf8")).flatMap((r) => (r.proof_file !== null && r.manifest_file !== null ? [r.manifest_file, r.proof_file] : []));
  assert.deepEqual(new Set(readdirSync(PUB)), new Set(["ANCHORS.md", ...named]), "docs/bell-publications/ holds exactly ANCHORS.md and the files its rows name");
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [d.name]));
  assert.ok(readdirSync(PUB, { withFileTypes: true }).every((d) => d.isFile()), "docs/bell-publications/ holds regular files only (no link, no directory)");
  for (const dir of [PUB, SERVED, join(ROOT, "fixtures")]) assert.deepEqual(walk(dir).filter((n) => n.startsWith("fixture-")), [], `no fixture-* file under ${dir}`);
  assert.ok(walk(join(ROOT, "test", "fixtures")).some((n) => /^fixture-.+\.ots$/.test(n)), "non-vacuity: the synthetic proofs live under test/fixtures/");
  assert.ok(!WHITELIST_DIRS.includes("test") && !WHITELIST_FILES.some((f) => f.startsWith("test/") && f !== "test/helpers/blocking-stdout.cjs"), "test/ stays out of the public export's whitelist");
});

// CM-13 (G2 of PR-A) and S-1..S-4, S-11 (ADR-BELL-OTS-PRB T-B2): on syncRoot(), the sync refuses BEFORE any write a publication row that
// its files or the chain the site data walked (lines[]) do not bind; the served directory stays byte for byte.
test("bell_publication_anchors_sync_refuses_an_unbound_row_before_writing", () => {
  const [row] = parsePublicationAnchors(readFileSync(join(PUB, "ANCHORS.md"), "utf8")), { lines } = loadBellServed(ROOT);
  assert.ok(row !== undefined && row.manifest_file !== null, "non-vacuity: a timestamped row");
  const f = (i: number, k: "line_hash" | "provenance_sha256" | "state_sha256"): string => lines[i]?.[k] ?? "";
  const [l1, p1, s1, p2, s2] = [f(0, "line_hash"), f(0, "provenance_sha256"), f(0, "state_sha256"), f(1, "provenance_sha256"), f(1, "state_sha256")] as const;
  const { line_hash: lh, prefix_sha256: pre, manifest_sha256: msha, commit } = row, REG = "docs/bell-publications/ANCHORS.md", MAN = `docs/bell-publications/${row.manifest_file}`;
  const edit = (tmp: string, rel: string, f: (s: string) => string): void => { writeFileSync(join(tmp, rel), f(readFileSync(join(tmp, rel), "utf8"))); };
  const unstamped = (seq: number, kind: string, hash: string, ref = "not timestamped at 2026-09-24T13:40:00Z") => (tmp: string): void => {
    edit(tmp, REG, (s) => `${s}| 2026-09-24T13:40:00Z | ${String(seq)} | ${kind} | \`${hash}\` | \`${pre}\` | \`${msha}\` | \`${commit}\` | ${ref} | test |\n`);
  };
  // S-3 = G2-M7: the manifest lists the files of line 1, its proof rebuilt on the new digest, the row re-hashed: bound to its files, not to line 2.
  const m7 = (tmp: string): void => {
    const text = readFileSync(join(tmp, MAN), "utf8").replace(`provenance/${p2}.json ${p2}`, `provenance/${p1}.json ${p1}`).replace(`states/${s2}.json ${s2}`, `states/${s1}.json ${s1}`);
    const digest = sha256(Buffer.from(text)), proof = readFileSync(join(tmp, `${MAN}.ots`)), at = proof.indexOf(Buffer.from(msha, "hex"));
    writeFileSync(join(tmp, MAN), text);
    writeFileSync(join(tmp, `${MAN}.ots`), Buffer.concat([proof.subarray(0, at), Buffer.from(digest, "hex"), proof.subarray(at + 32)]));
    edit(tmp, REG, (s) => s.replace(msha, digest));
  };
  assert.ok([l1, p1, s1, p2, s2].every((x) => x.length === 64) && p1 !== p2, "non-vacuity: two publication lines with their files");
  for (const [name, mutate, re] of [
    ["CM-13 a row whose line_hash its manifest does not carry", (tmp: string) => { edit(tmp, REG, (s) => s.replace(`\`${lh}\``, `\`${"0".repeat(64)}\``)); }, /timeline\.jsonl#L2 differs from line_hash/],
    ["S-1 a row whose line_hash is not that of its line", unstamped(1, "publication", "0".repeat(64)), /seq 1: line_hash is not that of line 1/],
    ["S-2 a row beyond lines[]", unstamped(3, "key_rotation", "0".repeat(64)), /seq 3 is beyond the served lines \(run the served-data sync first\)/],
    ["S-3 a manifest listing the files of another line (G2-M7)", m7, /the manifest's files are not those line 2 names/],
    ["S-4 a row whose kind is not that of its line", unstamped(1, "key_rotation", l1), /kind is not that of line 1/],
    ["S-11 a misspelt ots_ref", unstamped(1, "publication", l1, "not timestmped at 2026-09-24T13:40:00Z"), /neither a proof name nor 'not timestamped at <ISO Z>'/],
  ] as const) {
    const s = syncRoot();
    try {
      const before = s.snap();
      mutate(s.tmp);
      const r = s.run();
      assert.deepEqual([r.status, re.test(r.stderr), s.snap()], [1, true, before], `${name}: refused before any write: ${r.stderr}`);
    } finally {
      rmSync(s.tmp, { recursive: true, force: true });
    }
  }
});

// C-V-1 (tuyau P-4 in npm test): on the intact copy the sync exits 0 and rewrites the served set as the repository serves it, name by name
// and sha256 by sha256; a sync that drops publications.json, or any file, reds here.
test("bell_anchors_sync_rewrites_the_served_set_byte_for_byte", () => {
  const s = syncRoot(), repo = readdirSync(SERVED).sort().map((n) => `${n} ${sha256(readFileSync(join(SERVED, n)))}`);
  try {
    const r = s.run();
    assert.deepEqual([r.status, /^sync-bell-anchors OK/.test(r.stdout), s.snap()], [0, true, repo], r.stderr);
    assert.ok(repo.some((l) => l.startsWith("publications.json ")) && repo.some((l) => l.startsWith("anchors.json ")), "non-vacuity: both registers are served");
  } finally {
    rmSync(s.tmp, { recursive: true, force: true });
  }
});

// SYNC-LSTAT-PATH-1 and SYNC-SERVED-JUNCTION-1 (S-5..S-10 = B1..B6): a register, a source directory, the site data or the served directory
// replaced by a link or a junction to a target outside the tree: the sync exits 1 before any write, the served files and the target stay
// byte for byte. A platform that refuses to create the link (EPERM: a file link needs a privilege on win32) skips that case BY NAME.
test("bell_anchors_sync_follows_no_link", async (t) => {
  for (const [name, rel, type] of [
    ["B1 the publications register as a file link", "docs/bell-publications/ANCHORS.md", "file"],
    ["B2 the course register as a file link", "docs/course-bell/ANCHORS.md", "file"],
    ["B3 docs/bell-publications as a junction", "docs/bell-publications", "junction"],
    ["B4 the served directory as a junction", OUT_REL, "junction"],
    ["B5 docs/course-bell as a junction", "docs/course-bell", "junction"],
    ["B6 bell-served.json as a file link", "apps/site/data/bell-served.json", "file"],
  ] as const) {
    await t.test(name, (st) => {
      const s = syncRoot(), at = join(s.tmp, rel), outside = join(s.tmp, "outside", rel);
      try {
        mkdirSync(dirname(outside), { recursive: true });
        renameSync(at, outside);
        try {
          symlinkSync(outside, at, type);
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== "EPERM") throw e;
          st.skip(`${name}: this platform refuses a ${type} link (EPERM)`);
          return;
        }
        const tree = (dir: string, pre = ""): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? tree(join(dir, d.name), `${pre}${d.name}/`) : [`${pre}${d.name} ${sha256(readFileSync(join(dir, d.name)))}`]));
        const target = (): string[] => (type === "file" ? [sha256(readFileSync(outside))] : tree(outside).sort());
        const before = [s.snap(), target()], r = s.run();
        assert.deepEqual([r.status, /no link or junction is followed/.test(r.stderr), s.snap(), target()], [1, true, ...before], `${name}: ${r.stderr}`);
      } finally {
        rmSync(s.tmp, { recursive: true, force: true });
      }
    });
  }
});

// The publications reader fails closed with a named error, on mutated copies of the committed register, manifest and proof.
test("bell_publication_anchors_reader_fails_closed_with_named_errors", () => {
  const md = readFileSync(join(PUB, "ANCHORS.md"), "utf8"), [row] = parsePublicationAnchors(md);
  assert.ok(row !== undefined && row.manifest_file !== null && row.proof_file !== null, "non-vacuity: a timestamped row");
  const edit = (a: string, b: string): string => { assert.ok(md.includes(a), `the register carries ${a}`); return md.replace(a, b); };
  for (const [mutated, re] of [[edit("| seq | kind |", "| kind | seq |"), /not the header/], [edit("| publication |", "| publish |"), /unknown kind 'publish'/],
    [edit("| 2 | publication |", "| 02 | publication |"), /malformed seq/], [edit("`timeline-seq2-manifest.txt.ots`", "`timeline-seq3-manifest.txt.ots`"), /not the proof name of line 2/],
    [edit("| `694e98b` |", "| `694e98b` | extra |"), /10 cells, not 9/]] as const) assert.throws(() => parsePublicationAnchors(mutated), re);
  const bytes = readFileSync(join(PUB, row.manifest_file)), text = bytes.toString("utf8"), digest = sha256(bytes);
  const proof = readOtsProof(new Uint8Array(readFileSync(join(PUB, row.proof_file)))), other = readOtsProof(new Uint8Array(readFileSync(join(SOURCE, "probe_end-manifest.txt.ots"))));
  bindPublicationAnchor(row, text, digest, proof);
  for (const [f, re] of [[() => bindPublicationAnchor({ ...row, line_hash: "0".repeat(64) }, text, digest, proof), /timeline\.jsonl#L2 differs from line_hash/],
    [() => bindPublicationAnchor({ ...row, prefix_sha256: "0".repeat(64) }, text, digest, proof), /differs from prefix_sha256/],
    [() => bindPublicationAnchor(row, text, sha256(Buffer.concat([bytes, Buffer.from("\n")])), proof), /do not hash to manifest_sha256/],
    [() => bindPublicationAnchor(row, text.replace("timeline.jsonl#L2 ", "timeline.jsonl#L3 "), digest, proof), /does not have exactly the entries of publication line 2/],
    [() => bindPublicationAnchor(row, text, digest, other), /does not timestamp manifest_sha256/], [() => manifestEntries(text.slice(0, -1)), /not LF-terminated/],
    [() => manifestEntries(text.split("\n").reverse().join("\n").slice(1) + "\n"), /strictly increasing byte order/]] as const) assert.throws(f, re);
  // bindPublicationRowToLines (S-1, S-2, S-4, S-3) on lines built here, the files of line 2 taken from the row's manifest; D-B15 (S-11).
  const entries = manifestEntries(text), fileOf = (dir: string): string => entries.find((e) => e.relpath.startsWith(dir))?.digest ?? "";
  const lines = [{ seq: 1, kind: "publication", line_hash: "1".repeat(64), prev_line_hash: "0".repeat(64), state_sha256: "3".repeat(64), provenance_sha256: "4".repeat(64) },
    { seq: 2, kind: "publication", line_hash: row.line_hash, prev_line_hash: "1".repeat(64), state_sha256: fileOf("states/"), provenance_sha256: fileOf("provenance/") }];
  bindPublicationRowToLines(row, entries, lines);
  bindPublicationRowToLines({ seq: 1, kind: "publication", line_hash: "1".repeat(64) }, null, lines); // a row without proof: seq, line_hash, kind only
  const unstamped = (ref: string): string => `${md.trimEnd()}\n| 2026-09-24T13:40:00Z | 1 | publication | \`${"1".repeat(64)}\` | \`${row.prefix_sha256}\` | \`${row.manifest_sha256}\` | \`${row.commit}\` | ${ref} | x |\n`;
  assert.equal(parsePublicationAnchors(unstamped("not timestamped at 2026-09-24T13:40:00Z"))[0]?.proof_file, null, "control: the register's own form of a row without proof parses");
  for (const [f, re] of [[() => bindPublicationRowToLines({ ...row, line_hash: "0".repeat(64) }, entries, lines), /seq 2: line_hash is not that of line 2/],
    [() => bindPublicationRowToLines({ ...row, seq: 3 }, null, lines), /seq 3 is beyond the served lines \(run the served-data sync first\)/],
    [() => bindPublicationRowToLines({ ...row, kind: "key_rotation" }, entries, lines), /kind is not that of line 2/],
    [() => bindPublicationRowToLines(row, entries, lines.map((l) => (l.seq === 2 ? { ...l, state_sha256: "3".repeat(64) } : l))), /the manifest's files are not those line 2 names/],
    [() => bindPublicationRowToLines(row, entries, lines.map((l) => (l.seq === 2 ? { ...l, kind: "key_rotation" } : l))), /kind is not that of line 2/],
    [() => parsePublicationAnchors(unstamped("not timestmped at 2026-09-24T13:40:00Z")), /neither a proof name nor 'not timestamped at <ISO Z>'/]] as const) assert.throws(f, re);
});

test("bell_ots_reader_matches_reference_client — known answer from `ots info` (probe_end) + fail-closed on malformed bytes", () => {
  const bytes = new Uint8Array(readFileSync(join(SERVED, "probe_end-manifest.txt.ots")));
  const proof = readOtsProof(bytes);
  // Reference: opentimestamps-client 0.7.2, `ots info probe_end-manifest.txt.ots` (offline), 2026-09-23 (lot report).
  assert.equal(proof.digestHex, "ea83d5460a41abca8ab2385c306602cb38a09edaf6b8c507cff48f1423e05803");
  const st = anchorStatus(proof);
  for (const h of [968149, 968150, 968184, 968193]) assert.ok(st.bitcoinHeights.includes(h), `Bitcoin attestation at block ${String(h)} expected`);
  for (const c of ["alice.btc.calendar.opentimestamps.org", "bob.btc.calendar.opentimestamps.org", "finney.calendar.eternitywall.com", "btc.calendar.catallaxy.com"]) {
    assert.ok(st.pendingCalendars.includes(`https://${c}`), `pending attestation from ${c} expected`);
  }
  // Fail-closed mutants: truncation, bad magic, trailing garbage.
  assert.throws(() => readOtsProof(bytes.subarray(0, bytes.length - 3)), /truncated|ots:/);
  const badMagic = bytes.slice();
  badMagic[1] = 0x6f;
  assert.throws(() => readOtsProof(badMagic), /bad magic/);
  const trailing = new Uint8Array(bytes.length + 1);
  trailing.set(bytes);
  assert.throws(() => readOtsProof(trailing), /trailing bytes|ots:/);
});

// B38/B39 (vitrine audit 2026-09-24): the open-line wording states what the register holds (an instrument whose end line
// is not in the register), never an activity the register cannot show; the course manifests keep their fail-closed shape check.
// ADR-BELL-OTS-PRB (D-B7, D-B8, option (a)): every page that states the latest record's timestamp derives it by publicationAnchorState
// from the bound publication rows; the `.some` over listed digests and its `anchored === false` pin are gone (T-3a recomputes the state).
test("bell_anchors_wording_and_the_latest_record_anchoring_are_derived", () => {
  const table = readFileSync(join(ROOT, "apps", "site", "components", "bell", "anchors-table.tsx"), "utf8");
  assert.ok(!/run in progress/.test(table), "the table no longer claims a run in progress");
  assert.match(table, /no end line in the register yet/);
  const served = JSON.parse(readFileSync(join(SERVED, "anchors.json"), "utf8")) as AnchorsRegister;
  const listed = new Set<string>();
  let manifests = 0;
  for (const r of served.rows) {
    if (r.manifest_file === null) continue;
    manifests += 1;
    const text = readFileSync(join(SERVED, r.manifest_file), "utf8");
    const digests = manifestDigests(text);
    assert.equal(digests.length, text.split("\n").filter((l) => l !== "").length, `${r.manifest_file}: one digest per line`);
    for (const d of digests) listed.add(d);
  }
  assert.ok(manifests >= 1 && listed.size >= manifests, "non-vacuity: the served manifests list digests");
  assert.throws(() => manifestDigests("budget.json not-a-digest\n"), /not '<relpath> <sha256hex>'/, "a malformed manifest line fails closed");
  for (const rel of ["bell/page.tsx", "bell/method/page.tsx", "bell/anchors/page.tsx", "docs/bell/page.tsx", "docs/use-cases/page.tsx", "docs/verify/page.tsx"]) {
    const text = readFileSync(join(ROOT, "apps", "site", "app", ...rel.split("/")), "utf8");
    assert.match(text, /publicationAnchorState\((\w+)\.head, \1\.lines, /,`${rel} derives the latest record's timestamp state from the bound publication rows`);
    assert.ok(!text.includes("listedDigests"), `${rel} no longer derives it from listed digests`);
  }
});

// The anchored run is named as its register names it (docs/course-bell/ANCHORS.md title): the counter-verification run of the
// multiplier history, not the founding measurement run of the gap (a different run, not anchored here).
test("bell_anchors_run_is_named_as_its_register_names_it", () => {
  const title = readFileSync(join(ROOT, "docs", "course-bell", "ANCHORS.md"), "utf8").split("\n")[0] ?? "";
  assert.match(title, /counter-verification/, "the register names its run a counter-verification");
  for (const rel of ["apps/site/app/bell/page.tsx", "apps/site/app/bell/method/page.tsx", "apps/site/app/bell/anchors/page.tsx", "apps/site/components/bell/anchors-table.tsx"]) {
    const text = readFileSync(join(ROOT, rel), "utf8").replace(/\s+/g, " ").replace(/ \/\/ /g, " ");
    assert.ok(!/founding enumeration/i.test(text), `${rel} still calls the anchored run a founding enumeration`);
    assert.ok(text.includes("counter-verification run of the multiplier history"), `${rel} names the run as the register does`);
  }
});
