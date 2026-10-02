// MONARK Dojo -- test preload of dojo-collect-sigterm.test.ts (node --import; DOJO-COLLECT-SIGTERM-UNLOCK-1, G0 DRAND-RELAY-GET-1b section
// 4.2): no network (a socket or a name lookup throws), Date.now frozen at DOJO_HANG_NOW_MS (the collector's clock, main passes Date.now),
// every fetch pending forever. At the first fetch the course holds its locks and wrote its first ledger line: SIGTERM is then emitted on
// the next turn by process.emit, which does nothing when no handler listens, so the process lives on and exits 99 after 2 s; with
// DOJO_HANG_SIGNAL=real nothing is emitted (the parent sends the signal) and the exit 99 comes after 30 s.
import dns from "node:dns";
import net from "node:net";

net.Socket.prototype.connect = function trap() { throw new Error("sigterm-hang: a socket was opened"); };
dns.lookup = () => { throw new Error("sigterm-hang: a name was resolved"); };
const frozen = Number(process.env.DOJO_HANG_NOW_MS), real = process.env.DOJO_HANG_SIGNAL === "real";
const outlived = () => { process.exit(99); };
Date.now = () => frozen;
let first = true;
globalThis.fetch = () => {
  if (first && real) setTimeout(outlived, 30_000);
  else if (first) setImmediate(() => { process.emit("SIGTERM"); setTimeout(outlived, 2_000); });
  first = false;
  return new Promise(() => {});
};
