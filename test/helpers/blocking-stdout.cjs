// TEST-FORCE-EXIT-REPORT-LOSS-1 (docs/G0-lot-test-force-exit-report-loss-1.md), EXPORT-TEST42-SUMMARY-1. Loaded with `-r` before
// `--test` by every force-exit script of package.json. The `node --test` launcher does not run `--import` modules, yet it calls
// process.exit() under `--test-force-exit`; on POSIX its stdout pipe is non-blocking, so a reader that drains late (test 42's
// nested `npm run ci` under spawnSync) lost the launcher's last lines and summary. A blocking stdout leaves nothing queued at
// exit. Nothing else: no exit guard here (the per-file `--import` preload carries it), no output, no other stream.
"use strict";
const handle = process.stdout._handle;
if (handle && typeof handle.setBlocking === "function") {
  handle.setBlocking(true);
}
