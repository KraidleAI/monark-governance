// MONARK Dojo -- the Eve tool (ADR-DOJO-PR-3 dated line 15:00Z, C-G2-3 and Q-G2-1; the Eve entry of ADR-DOJO-PR-2 D-7).
//   node dojo-eve.mjs --empty --day <AAAA-MM-JJ>
// prints the EMPTY Eve, canonical({addresses: [], accounts: []}) + LF, the only bytes layout.ts readEve accepts for it: the Eve of the
// first day the collector opens in the rehearsal (act A-11-rep of docs/RUNBOOK-dojo.md), which no closed day before it can carry
// (collect.ts stops on eve_missing). Never published (the publisher refuses the rehearsal seed chain, M-E6). --day names that day and
// must be a real UTC calendar day; the operator writes the bytes to bundles/<day>/eve.json. Exit 0 with the bytes; 2 on usage.
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { canonical } from "../../bell/scripts/bell-chain.mjs";

/** The bytes of the empty Eve (closed keys, empty sorted lists, canonical bytes + LF). */
export const emptyEve = () => `${canonical({ addresses: [], accounts: [] })}\n`;

/** The CLI: exactly --empty and --day <d>, in either order, d a real UTC day (calque of collect.ts dayStart). */
export function runCli(argv) {
  const day = argv.includes("--day") ? argv[argv.indexOf("--day") + 1] ?? "" : "", t = Date.parse(`${day}T00:00:00.000Z`);
  if (argv.length !== 3 || !argv.includes("--empty") || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(t) || !new Date(t).toISOString().startsWith(day)) {
    process.stderr.write("dojo/eve: usage: --empty --day <AAAA-MM-JJ>\n");
    return 2;
  }
  process.stdout.write(emptyEve());
  return 0;
}

// ENTRY-MAIN-LINK-1 (C-G2-1 of PR-1b-5b): REAL paths compared, so a launch through a directory link runs it; argv[1] absent or unreadable: an import.
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) process.exitCode = runCli(process.argv.slice(2));
