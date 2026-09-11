/**
 * Harness — the committed Shōgen witness FIXTURE loader (ADR-M005 D3).
 *
 * Reads the three committed, sha256-pinned `s3-binance.*` fixtures — the ONLY real Shōgen witness in the
 * repo (Binance BTCUSDT, self-notarized) — and freezes them as module-level constants at load. It sits at
 * `src/` (NOT `src/tools/`), exactly like `schema-projection.ts`: the K-8 side-effect scan of the tool
 * implementations (`mcp_tools_have_no_side_effects`) stays meaningful because the one filesystem read
 * lives HERE, and `tools/attest.ts` imports the already-loaded triple — a tool itself does no I/O.
 *
 * The bytes are read once, at import, and never re-read; the adapter the tool calls (`fromShogen`) is a
 * pure projection of this triple. The fixtures are byte-frozen on disk (a verbatim third-party artifact,
 * path-exempt from lang-gate, K-2); this loader only reads them, never writes.
 *
 * Paths are repo-relative from `apps/harness/src/` (`../../../fixtures/`), the same anchoring
 * `schema-projection.ts` uses for `../../../schemas/`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FIXTURES_DIR = fileURLToPath(new URL("../../../fixtures/", import.meta.url));

/** The canonical CBOR witness batch (`Temoignage`), raw bytes for the zero-dep decoder inside `fromShogen`. */
export const SHOGEN_LOT_BYTES: Uint8Array = new Uint8Array(readFileSync(FIXTURES_DIR + "s3-binance.lot.cbor"));

/** The Shōgen verifier stdout (French prose; the adapter keys on diacritic-free ASCII anchors). UTF-8 text. */
export const SHOGEN_VERDICT_TEXT: string = readFileSync(FIXTURES_DIR + "s3-binance.verdict.txt", "utf8");

/** The companion Constat JSON (carries the emitted-meaning digest). Opaque to the tool; `fromShogen` narrows it. */
export const SHOGEN_CONSTAT: Record<string, unknown> = JSON.parse(
  readFileSync(FIXTURES_DIR + "s3-binance.constat.json", "utf8"),
) as Record<string, unknown>;
