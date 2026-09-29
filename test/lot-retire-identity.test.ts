/**
 * Non-LLM test of the file identity of `scripts/lot/retire.mjs` (ADR-METHODE-2 D7, M-8b, C-G2-27 MM4): fileId is imported here, kept
 * apart from test/lot-retire.test.ts (which spawns the tool, never imports it) so that the base of the lot, which does not export it,
 * still loads that file. The killer comment follows the convention of scripts/red-proof.mjs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileId } from "../scripts/lot/retire.mjs";

// killer: scripts/lot/retire.mjs:10 CONST "statSync(p, { bigint: true })" -> "statSync(p)"
test("lot_retire_file_identity_keeps_every_bit_of_a_64_bit_ino", (t) => {
  const d = join(mkdtempSync(join(tmpdir(), "lot-retire-ino-")), "d");
  try {
    for (let i = 0; i < 256; i++) { // measured on F: (NTFS) each new use of one MFT record raises its sequence, the high 16 bits of the ino
      mkdirSync(d);
      const s = statSync(d, { bigint: true });
      if (String(Number(s.ino)) !== String(s.ino)) { assert.equal(fileId(d), `${s.dev}:${s.ino}`); return; } // a double would lose this ino
      rmdirSync(d);
    }
    t.skip("no ino beyond the precision of a double here: a lossy identity would change nothing");
  } finally {
    rmSync(join(d, ".."), { recursive: true, force: true });
  }
});
