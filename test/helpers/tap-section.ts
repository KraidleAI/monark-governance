// test/helpers/tap-section.ts -- KILLER-TEST-HELPERS-SUPPORT-1 (2026-10-07): section of test/red-proof.test.ts, moved here so that
// the killer of its test can fire. A killer mutates production code or a support module the test file imports, never a *.test.ts.

/** The lines of one test file in a TAP stream that scripts/red-proof.mjs writes (base.tap, gel.tap): those after its
 *  "# red-proof file: <file>" line, up to the next such line; "" when the file has none. */
export const section = (tap: string, file: string): string => new RegExp(`# red-proof file: ${file.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}\\n((?:(?!# red-proof file:)[^])*)`).exec(tap)?.[1] ?? "";
