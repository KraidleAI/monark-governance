// MONARK Dojo -- test preload of dojo_seed_writes_only_its_seed (node --import; DOJO-SEED-FS-TRACE-1, G0 DRAND-RELAY-GET-1b section 4.4).
// Every path-taking writer of node:fs and node:fs/promises in the CLOSED list below is wrapped (both the callback and the Sync form of
// node:fs, the promise form of node:fs/promises, plus createWriteStream), the ESM named imports are re-bound by syncBuiltinESMExports,
// and each writing call appends one line "<function> <path>" to the file named by DOJO_FS_TRACE through the ORIGINAL appendFileSync,
// re-entrance guarded: node 24.15.0 appendFileSync calls the exported writeFileSync (node:fs:2496), so the trace never traces itself.
// open, openSync: only with a writing flag (w, a, x or +; a number with a write, create, truncate or append bit).
import { createRequire, syncBuiltinESMExports } from "node:module";

const require = createRequire(import.meta.url), fs = require("node:fs"), out = process.env.DOJO_FS_TRACE, LF = String.fromCharCode(10);
const append = fs.appendFileSync, K = fs.constants, WRITE = K.O_WRONLY | K.O_RDWR | K.O_CREAT | K.O_TRUNC | K.O_APPEND;
/** The closed list: a writer and the indices of its path arguments (the destination of a copy, both ends of a rename). */
const PATHS = { open: [0], writeFile: [0], appendFile: [0], copyFile: [1], cp: [1], rename: [0, 1], mkdir: [0], mkdtemp: [0], symlink: [1],
  link: [1], truncate: [0], rm: [0], unlink: [0], rmdir: [0], chmod: [0], chown: [0], utimes: [0], lchown: [0], lutimes: [0] };
const writes = (name, a) => !name.startsWith("open") || (typeof a[1] === "number" ? (a[1] & WRITE) !== 0 : /[wax+]/.test(String(a[1] ?? "r")));
let tracing = false;
const record = (line) => { tracing = true; try { append(out, line); } finally { tracing = false; } };
const wrap = (mod, name, base) => {
  const orig = mod[name];
  if (typeof orig !== "function") return;
  mod[name] = function traced(...a) {
    if (!tracing && writes(name, a)) for (const i of PATHS[base]) record(`${name} ${String(a[i])}${LF}`);
    return orig.apply(this, a);
  };
};
for (const base of Object.keys(PATHS)) { wrap(fs, base, base); wrap(fs, `${base}Sync`, base); wrap(fs.promises, base, base); }
wrap(fs, "createWriteStream", "writeFile");
syncBuiltinESMExports();
