/**
 * Harness -- the COMMITTED liquidation-eligible-coverage registry of U-4b-2b (ADR-U4b-2b D1; G0 U-4b-2 lines 2b-1..2b-3;
 * checkpoint-1 C-4/C-7). Two named tests:
 *   - u4b_committed_registry_equals_generator_output (2b-3): the served registry (apps/harness/src/calibration.ts) EQUALS
 *     the output of the FROZEN generator scripts/record-u4b-calib.mjs over the committed fresh scores series, stratum by
 *     stratum (scores in order, C5 digest, key); the committed keys are EXACTLY the committable strata (a stratum below
 *     nMin is never committed, C-4); and the committed block is byte for byte what scripts/emit-u4b-calibration.mjs emits
 *     from the committed inputs (no hand edit, no filter). Mutants (f1) score altered + digest re-pinned, (f2) a stratum
 *     below nMin committed, (pool) the pooled cell served as s0, (emitter) zero scores filtered: each reds here.
 *   - u4b_calib_registry_digest_guard_per_stratum (2b-1): the import-time digest guard fires PER committed stratum. A
 *     child process imports calibration.ts through a load hook that drifts ONE stratum in memory (its first score
 *     dropped, or its pinned digest changed) and must die naming that stratum's key; the same child without a drift
 *     imports cleanly. Mutant (e) guard removed: the drifted import succeeds, so this reds.
 * Export-excluded (scripts/export-exclude-tests.json): it reads the export-excluded fresh scores series and imports the
 * non-whitelisted frozen generator and emitter. No network. No amount is typed: every score and q-hat is read from the
 * series or the registry; the pins are digests, counts and keys (ADR-U4b-2b section 5).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scoresSha256 } from "@monark/contracts";
import { calibDigest } from "../../../scripts/lib/calib-digest-provenance.mjs";
import { buildRegistryEntries } from "../../../scripts/record-u4b-calib.mjs";
import { blockFromFiles, spliceBlock } from "../../../scripts/emit-u4b-calibration.mjs";
import {
  lookupCommittedCalibration,
  hasCommittedCalibrationForClass,
  UKEMI_LIQ_COMMITTED,
  UKEMI_LIQ_PREDICTOR_BASE,
  UKEMI_LIQ_SCORES_SHA256_PINNED,
} from "../src/calibration.ts";
import { TASK_LIQ_ELIGIBLE } from "../src/tools/gate.ts";

const at = (rel: string): string => fileURLToPath(new URL(rel, import.meta.url));
const U4B = "../../sentinel/test/fixtures/ukemi/u4b/";
const SCORES = at(`${U4B}U4b-scores-weth-2025-09-22.jsonl`);
const CALIBRATION = at("../src/calibration.ts");
const GENERATOR = at("../../../scripts/record-u4b-calib.mjs");
/** LF sha256 of the frozen generator (ADR-U4b D4 gel; re-gel of 2026-10-05, lot CM-3c-3a: calibDigest imported from the provenance tool). */
const GENERATOR_SHA256_LF = "aa81dbca6b24c1b692895642759a392ebeff58f06d05c965aee0524d34a87c41";

const lfSha256 = (path: string): string => createHash("sha256").update(readFileSync(path, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");

interface MetaLine { kind: "meta"; cell_a: { predictor_id: string } }
interface ScoreARow { kind: "score_a"; strate: number; score: string; [k: string]: unknown }
function series(path: string): { base: string; rowsA: ScoreARow[] } {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as { kind: string });
  const meta = lines.find((l): l is MetaLine => l.kind === "meta");
  if (meta === undefined) throw new Error("the scores series has no meta line");
  return { base: meta.cell_a.predictor_id, rowsA: lines.filter((l): l is ScoreARow => l.kind === "score_a") };
}

test("u4b_committed_registry_equals_generator_output", () => {
  // (0) The generator whose output the registry must equal is the FROZEN one (its bytes are pinned by the ADR-U4b gel).
  assert.equal(lfSha256(GENERATOR), GENERATOR_SHA256_LF, "the frozen generator scripts/record-u4b-calib.mjs is unchanged (A-6)");
  const { base, rowsA } = series(SCORES);
  assert.ok(rowsA.length >= 200, `non-vacuous class-A series (found ${String(rowsA.length)} rows; measured 205)`);
  const entries = buildRegistryEntries(rowsA, { scale: 1n, predictorBase: base });
  const committable = entries.filter((e) => !e.under_calib);
  const abstaining = entries.filter((e) => e.under_calib);
  assert.ok(committable.length >= 1 && abstaining.length >= 1, "the generator gives both committable and under_calib strata (non-vacuous)");
  // (1) Every committable stratum is committed and EQUALS the generator output (scores in order, digest, key, class).
  for (const e of committable) {
    const c = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, e.predictor_id);
    assert.ok(c !== undefined, `the committable stratum ${e.predictor_id} is committed`);
    assert.equal(c.taskClass, TASK_LIQ_ELIGIBLE, "the committed class is the served class id");
    assert.equal(c.predictorId, e.predictor_id, "the committed key is the generator key (BASE/s<k>)");
    assert.deepEqual([...c.scores], e.scores, `stratum s${String(e.strate)}: the committed scores equal the generator scores, in order`);
    assert.equal(c.digestPinned, e.calib_digest, `stratum s${String(e.strate)}: the pinned digest is the generator's C5 digest`);
    assert.equal(calibDigest(c.scores), c.digestPinned, `stratum s${String(e.strate)}: the pinned digest is the C5 of the committed scores`);
  }
  // (2) Every stratum below nMin stays UNcommitted (checkpoint-1 C-4): the served lookup of its key finds nothing.
  for (const e of abstaining) {
    assert.equal(lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, e.predictor_id), undefined, `the under_calib stratum ${e.predictor_id} is not committed`);
  }
  // (3) The committed liq keys are EXACTLY the committable ones, in generator order; the base is the series' cell-A key.
  assert.deepEqual(UKEMI_LIQ_COMMITTED.map((c) => c.predictorId), committable.map((e) => e.predictor_id), "committed keys == committable strata");
  assert.equal(UKEMI_LIQ_PREDICTOR_BASE, base, "the served base is the fresh series' meta.cell_a.predictor_id");
  assert.equal(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), true, "the registry holds the class");
  // (4) The committed block is byte for byte the emitter's output over the committed inputs (no hand edit, no filter).
  const block = blockFromFiles({
    scores: SCORES,
    book: at(`${U4B}U4b-book-23414968.json`),
    oraclePath: at(`${U4B}U4b-oracle-path-weth-2025-09-22.jsonl`),
    labels: at(`${U4B}U3-realized-weth-2025-09-22.jsonl`),
    report: at("../../site/data/ukemi-course.json"),
    measuredOn: "2026-09-23",
  });
  const text = readFileSync(CALIBRATION, "utf8").replace(/\r\n/g, "\n");
  assert.equal(spliceBlock(text, block), text, "calibration.ts carries exactly the emitted block (re-emit, never hand-edit)");
});

// The load hook of the child, as a data: URL (no file written): it rewrites ONLY calibration.ts, dropping the first score
// of the named array (mode scores) or reversing its stratum scores_sha256 pin (mode digest); mode none passes through.
const HOOK = `
import { registerHooks } from "node:module";
const target = process.env.U4B_GUARD_TARGET, name = process.env.U4B_GUARD_ARRAY, mode = process.env.U4B_GUARD_MODE;
registerHooks({
  load(url, context, nextLoad) {
    const r = nextLoad(url, context);
    if (url !== target || mode === "none") return r;
    const src = typeof r.source === "string" ? r.source : Buffer.from(r.source).toString("utf8");
    let out = src;
    if (mode === "scores") {
      const open = src.indexOf(name + ": readonly number[] = [");
      const re = /[0-9]+,\\s*/g;
      re.lastIndex = src.indexOf("[", open) + 1;
      const hit = open < 0 ? null : re.exec(src);
      if (hit !== null) out = src.slice(0, hit.index) + src.slice(hit.index + hit[0].length);
    } else if (mode === "digest") {
      const key = "/s" + name.replace(/[^0-9]/g, "") + String.fromCharCode(96) + ']: "';
      const at = src.indexOf(key), hex = src.slice(at + key.length, at + key.length + 64);
      if (at >= 0) out = src.replace(key + hex, key + [...hex].reverse().join(""));
    }
    if (out === src) throw new Error("u4b guard hook: no drift applied to " + name);
    return { ...r, source: out };
  },
});`;

/** Import calibration.ts in a child process through the hook; never rejects. */
function importInChild(arrayName: string, mode: "none" | "scores" | "digest"): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const target = pathToFileURL(CALIBRATION).href;
  const script = `const c = await import(process.env.U4B_GUARD_TARGET); process.stdout.write("imported " + String(c.UKEMI_LIQ_COMMITTED.length));`;
  const args = ["--import", `data:text/javascript,${encodeURIComponent(HOOK)}`, "--input-type=module", "-e", script];
  const env = { ...process.env, U4B_GUARD_TARGET: target, U4B_GUARD_ARRAY: arrayName, U4B_GUARD_MODE: mode };
  return new Promise((resolve) => {
    execFile(process.execPath, args, { env, encoding: "utf8", timeout: 60000 }, (error, stdout, stderr) => {
      resolve({ code: error === null ? 0 : typeof error.code === "number" ? error.code : null, stdout, stderr });
    });
  });
}

// killer: apps/harness/src/calibration.ts:276 SDL "for (const c of COMMITTED_CALIBRATIONS) assertCommittedScores(c);" -> ""
test("u4b_calib_registry_digest_guard_per_stratum", async () => {
  assert.ok(UKEMI_LIQ_COMMITTED.length >= 1, "at least one committed stratum to guard (non-vacuous)");
  // The fresh s0 digest pinned by value (C5 of the 170 committed scores; ADR-U4b-2b section 1.3, recomputed independently).
  assert.equal(
    lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s0`)?.digestPinned,
    "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334",
    "the committed s0 digest is the independently recomputed C5",
  );
  for (const c of UKEMI_LIQ_COMMITTED) {
    assert.equal(calibDigest(c.scores), c.digestPinned, `${c.predictorId}: the C5 provenance pin holds on the committed bytes`);
    assert.equal(scoresSha256(c.scores), UKEMI_LIQ_SCORES_SHA256_PINNED[c.predictorId], `${c.predictorId}: the guard's invariant holds on the committed bytes`);
    const k = /\/s(\d+)$/.exec(c.predictorId)?.[1];
    assert.ok(k !== undefined, `${c.predictorId} ends with its stratum /s<k>`);
    const arrayName = `UKEMI_LIQ_S${k}_CALIB`;
    const clean = await importInChild(arrayName, "none");
    assert.equal(clean.code, 0, `the undrifted import succeeds (stderr: ${clean.stderr.slice(0, 300)})`);
    assert.equal(clean.stdout, `imported ${String(UKEMI_LIQ_COMMITTED.length)}`, "the child imported the real module");
    for (const mode of ["scores", "digest"] as const) {
      const drifted = await importInChild(arrayName, mode);
      assert.notEqual(drifted.code, 0, `${c.predictorId}: a ${mode} drift makes the import throw (stdout: ${drifted.stdout})`);
      assert.ok(
        drifted.stderr.includes(`scores drift for ${c.predictorId}`),
        `${c.predictorId}: the ${mode} drift is caught by ITS stratum guard: ${drifted.stderr.slice(0, 400)}`,
      );
    }
  }
});
