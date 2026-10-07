// test/helpers/bell-row.ts -- KILLER-TEST-HELPERS-SUPPORT-1 (2026-10-07): bellRowOf of test/public-surfaces-honesty.test.ts, moved here
// so that the killer of its test can fire. A killer mutates production code or a support module the test file imports, never a *.test.ts.
import assert from "node:assert/strict";

// CodeQL alert 45: Bell's row of the served table is the one whose surface cell opens on an https URL of Bell's host, exactly (spelled
// https://<host>/, host equal, no prefix or suffix, no user part; never a substring anywhere in the row), and there is exactly one.
const BELL_HOST = "bell.monarkgate.tech";
export function bellRowOf(rows: string[]): number {
  const at = rows.flatMap((l, i) => {
    const first = /^\s*`([^`]+)`/.exec(l.split(/(?<!\\)\|/)[1] ?? "")?.[1] ?? "", u = URL.canParse(first) ? new URL(first) : null;
    return u !== null && first.startsWith(`https://${BELL_HOST}/`) && u.protocol === "https:" && u.host === BELL_HOST && u.username === "" && u.password === "" ? [i] : [];
  });
  assert.equal(at.length, 1, `one row of the served table is Bell's (${String(at.length)} found)`);
  return at[0] ?? -1;
}
