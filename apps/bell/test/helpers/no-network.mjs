// MONARK Bell — TEST-ONLY no-network shim (C-G2D-3 / C-8). Loaded via `node --import <this>` BEFORE the CLI
// script in test 22's spawnSync, so it arms BEFORE any module of the CLI runs. It blocks egress at the `net`
// level (the `fetch` override is a belt for a clear message). MEASURED [lu] F:\tmp\cp1-a1bis\ (Node 24.15.0):
// a fetch-ONLY shim let http/https.request still ATTEMPT a connection (ECONNREFUSED = egress open); the net
// patch closes fetch/undici + https + http. NO url/host/key is ever interpolated into a message (C-10). NEVER
// shipped in src — this file lives under apps/bell/test/helpers only.
import net from "node:net";

// Primary block: no socket may connect (covers fetch/undici, https.request, http.request).
net.Socket.prototype.connect = function connect() {
  throw new Error("SHIM: socket connect blocked (no-network shim)");
};

// Belt: a clear message on the fetch path (fires before the net layer is reached).
globalThis.fetch = function fetch() {
  throw new Error("SHIM: fetch blocked (no-network shim)");
};

// Vacuity marker: test 22 asserts this line, so a stub that failed to load cannot let the test pass vacuously.
process.stderr.write("[no-network shim armed]\n");
