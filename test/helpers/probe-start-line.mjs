// test/helpers/probe-start-line.mjs -- lot PROBE-SMTP-TLS-DEADLINE-LOAD-1 (docs/G0-lot-probe-smtp-deadline-load-1.md). runProbeAt of
// test/probe-narabi.test.ts preloads this module in the probe child (--import): once the child runs, before the probe's own module loads,
// it writes one line on fd 3 and closes it. fd 3 is a pipe the test opens for this line alone; the probe never reads nor writes it. The
// test arms its kill and counts its bounds from this line, so the start of the process, which the load of the full suite stalls for
// seconds, is in none of them.
import { closeSync, writeSync } from "node:fs";

writeSync(3, "started\n");
closeSync(3);
