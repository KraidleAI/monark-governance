/**
 * Harness release version — the SINGLE SOURCE of the version this MCP server advertises.
 *
 * `HARNESS_VERSION` is what the MCP `initialize` handshake reports as `serverInfo.version` (server.ts)
 * and what the OpenAPI document reports as `info.version` (openapi.ts). It is aligned on the PUBLIC
 * release: the mirror's annotated tag `v0.4.0` and the MCP registry entry `tech.monarkgate/monark`
 * at `0.4.0` (both 2026-09-18). Bumping this constant belongs to the SAME commit as the tag it names.
 *
 * MAJOR stays 0 by doctrine: `1.0.0` is a human decision, never an agent's — the interface contracts
 * do not thaw (ADR-M010 section 2.3 / CONTRIBUTING Releases). A stray `1.0.0` here is the same class
 * of defect the public registry carried and retired ("misaligned version number, never a release",
 * JOURNAL-PROVENANCE 2026-09-17); the guard test forbids a leading `1.`.
 *
 * This carrying version is NOT `package.json.version`: the harness package stays `0.0.0` / `private`
 * on purpose (never npm-published; the version source of truth is the git tag — ADR-M010 section 2.4).
 * The two are deliberately decoupled, and the guard test asserts that decoupling.
 *
 * NOT to be confused with `@monark/hikae`'s `HARNESS_VERSION = "fixtures-synth"` (imported by
 * calibration.ts): that identifier is calibration PROVENANCE (the synthetic-fixtures draw tag), a
 * different domain that shares the name but never meets this module.
 */
export const HARNESS_VERSION = "0.4.0";
