// scripts/l2/canon.mjs -- the two canonical digests of each stream of one day, their keys, the trade id jumps and the crosschecks of
// @bookTicker with the diffs (lot P1-c3 of part P1, 2026-10-05): ADR-L2-CAPTURE-1 D-20 and its dated amendment (Q-P1-9), items
// L2-TRADE-ID-CONSEC-1, L2-BOOKTICKER-U-1, L2-LIQ-DEDUP-1, L2-BOOKTICKER-GAP-1; plan docs/G0-partie-l2-p1.md section 9; lot plan
// docs/G0-lot-l2-p1-c3.md. Node 24, zero dependencies. canonDay() is a derive hook of sealDay (Q-C2-2), composed with deriveDay by c5:
// it writes no file, only the manifest keys canon and crosscheck. The frames of the day are those of the day's index, which sealDay
// passes (index), but the late or early frames of another day (counted, foreign); their segments are already in SHA256SUMS (used). Per
// stream, the canonical sequence keeps each payload once by its exact bytes, ordered by (key, bytes): (U,u) for the diffs, u for
// bookTicker, t for trades, none for forceOrder (its bytes alone); a frame without a readable safe integer key sorts first (keyless).
// Two digests: raw_sha256 over the sequence, an LF after each frame; fields_sha256 over the distinct re-serialized forms (JSON with
// sorted keys, strings intact; not JSON: the text), ordered by (key, form): the fallback if M-5 refutes the byte identity. Two payloads
// of one key with different bytes stay two entries, named (same_key); two of one form with different bytes are named too
// (same_fields): naming, never merging. A run of equal keys is held to be ordered by bytes: at most `bound` bytes, else canon_bound,
// nothing written. Trade ids: a jump is never a hole (nothing in missing.json); jumps and the largest are counted, an observation.
// Crosschecks, counted: (i) each u of @bookTicker lies in a received [U;u] of the day's diffs; (ii) each diff of the day that changes
// the best level net (price or quantity of either side, FAITS-L2-ACCESS-2 (j)) has a @bookTicker u in its [U;u], from bestTap(), the
// tap of the replay of P1-c2 (the first event on a book just set is not judged). The agent never commits (R-20).
import { createHash } from "node:crypto";
import { closeSync, openSync, readSync } from "node:fs";
import { join } from "node:path";
import { DayStop } from "./day.mjs";
import { atScale } from "./derive.mjs";
import { readSegment } from "./segments.mjs";

export const CANON_KEYS = Object.freeze({ "depth@100ms": ["U", "u"], bookTicker: ["u"], trade: ["t"], forceOrder: [] }); // KEYS, day.mjs
export const RUN_BOUND = 67_108_864; // bytes of one run of equal keys held to order it by bytes (64 MiB), else canon_bound
export const NAMED_BOUND = 16; // groups (or unmatched diffs) listed at the manifest at most; each is counted
const LF = Buffer.from([10]);
const json = (text) => { try { return JSON.parse(text); } catch { return null; } };
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const sorted = (x) => (Array.isArray(x) ? x.map(sorted)
  : x !== null && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sorted(x[k])])) : x);
const formOf = (text) => { const d = json(text); return d === null ? text : JSON.stringify(sorted(d)); };
/** The last index of the sorted `a` (its first n) whose value is at most x, else -1. */
const floorAt = (a, n, x) => { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] <= x) lo = mid + 1; else hi = mid; } return lo - 1; };

/** The tap of deriveDay (P1-c2): each applied diff of place time in [start, end) after which the best level of a side differs (price
 *  or quantity), as [U, u]; the side is read whole again only when its best level left, or on a book just set (not judged). */
export function bestTap({ scale, start, end }) {
  let book = null, best = [], events = new Float64Array(4096), n = 0, unjudged = 0;
  const top = (m, hi) => { let p = null; for (const k of m.keys()) if (p === null || (hi ? k > p : k < p)) p = k; return p; };
  const next = (m, prev, levels, hi) => {
    if (prev !== null && !m.has(prev)) return top(m, hi);
    let p = prev;
    for (const [x] of levels) { const k = atScale(x, scale); if (m.has(k) && (p === null || (hi ? k > p : k < p))) p = k; }
    return p;
  };
  const tap = (ev, b) => {
    const fresh = b !== book, day = ev.E >= start && ev.E < end;
    const bp = fresh ? top(b.bids, true) : next(b.bids, best[0], ev.b, true), ap = fresh ? top(b.asks, false) : next(b.asks, best[2], ev.a, false);
    const now = [bp, b.bids.get(bp)?.[1] ?? null, ap, b.asks.get(ap)?.[1] ?? null];
    if (fresh) unjudged += day ? 1 : 0;
    else if (day && now.some((x, i) => x !== best[i])) {
      if (2 * n === events.length) { const x = new Float64Array(2 * events.length); x.set(events); events = x; }
      [events[2 * n], events[2 * n + 1], n] = [ev.U, ev.u, n + 1];
    }
    [book, best] = [b, now];
  };
  return { tap, result: () => ({ events, n, unjudged }) };
}

/** The hook of sealDay (header): manifest keys canon and crosscheck, the module hashed; `best` from bestTap().result(), or null. */
export function canonDay({ out, symbol, segs, marks, index, best = null, bound = RUN_BOUND }) {
  const lower = symbol.toLowerCase(), fds = new Map(), canon = {}, named = [], los = [], his = [];
  const streams = Object.entries(CANON_KEYS).map(([name, keys]) => {
    const { a, n } = index.get(`${lower}@${name}`)?.col ?? { a: new Int32Array(0), n: 0 }, m = n / 3;
    return { name, keys, a, n, at: 0, m: 0, foreign: 0, keyless: 0, k1: new Float64Array(m), k2: new Float64Array(m),
      off: new Float64Array(m), len: new Int32Array(m), pos: new Int32Array(m) };
  });
  for (let s = 0; s < segs.length; s += 1) { // the day's frames of each stream, in the index's order: (segment, rank)
    for (const f of readSegment(out, segs[s][0], segs[s][1], marks.get(`${segs[s][0]}/${segs[s][1]}`) ?? null)) {
      const st = streams.find((x) => x.at < x.n && x.a[x.at] === s && x.a[x.at + 1] === f.rank);
      if (st === undefined) continue;
      const p = st.at / 3;
      st.at += 3;
      if ((st.a[3 * p + 2] & 3) >= 2) { st.foreign += 1; continue; } // late or early: a frame of another day
      const data = json(f.bytes.toString("utf8"))?.data, k = st.keys.map((x) => data?.[x]), keyed = k.every(Number.isSafeInteger), i = st.m++;
      [st.k1[i], st.k2[i], st.off[i], st.len[i], st.pos[i]] = [keyed ? k[0] ?? 0 : -Infinity, keyed ? k[1] ?? 0 : -Infinity, f.offset, f.length, p];
      st.keyless += keyed ? 0 : 1;
    }
  }
  const bytesOf = (st, x) => { // a frame read again at its offset, its segment opened once
    const [cid, seg] = segs[st.a[3 * st.pos[x]]], path = join(out, "conn", cid, `${seg}.frames`), b = Buffer.alloc(st.len[x]);
    if (!fds.has(path)) fds.set(path, openSync(path, "r"));
    readSync(fds.get(path), b, 0, b.length, st.off[x]);
    return b;
  };
  const tickers = new Float64Array(streams[1].m);
  let nu = 0, outside = 0;
  try {
    for (const st of streams) {
      const raw = createHash("sha256"), fields = createHash("sha256"), perm = Uint32Array.from({ length: st.m }, (_, i) => i);
      perm.sort((x, y) => cmp(st.k1[x], st.k1[y]) || cmp(st.k2[x], st.k2[y]));
      const r = { frames: st.m + st.foreign, entries: 0, forms: 0, keyless: st.keyless, foreign: st.foreign, same_key: 0, same_fields: 0 };
      let prev = null, jumps = 0, max = null;
      for (let i = 0, j = 0, held = 0; i < st.m; i = j, held = 0) {
        for (j = i; j < st.m && st.k1[perm[j]] === st.k1[perm[i]] && st.k2[perm[j]] === st.k2[perm[i]]; j += 1) held += st.len[perm[j]];
        if (held > bound) throw new DayStop("canon_bound", { symbol, stream: st.name, bound });
        const run = [...perm.subarray(i, j)].map((x) => ({ x, b: bytesOf(st, x) })).sort((p, q) => Buffer.compare(p.b, q.b));
        const d = run.filter((e, n) => n === 0 || !e.b.equals(run[n - 1].b)); // each payload once by its exact bytes (Q-P1-9)
        const [k1, k2] = [st.k1[perm[i]], st.k2[perm[i]]], key = k1 === -Infinity || st.keys.length === 0 ? null : [k1, k2].slice(0, st.keys.length);
        const name = (why, g) => {
          r[why] += 1;
          if (named.length < NAMED_BOUND) named.push({ stream: st.name, why, key, at: g.map((e) => { const p = 3 * st.pos[e.x]; return [...segs[st.a[p]], st.a[p + 1]]; }) });
        };
        for (const e of d) { raw.update(e.b); raw.update(LF); }
        if (key !== null && d.length > 1) name("same_key", d); // two entries, never merged
        const forms = d.map((e) => ({ ...e, f: formOf(e.b.toString("utf8")) })).sort((p, q) => cmp(p.f, q.f));
        for (let a = 0, b = 0; a < forms.length; a = b) {
          for (b = a; b < forms.length && forms[b].f === forms[a].f; b += 1);
          fields.update(forms[a].f).update(LF);
          r.forms += 1;
          if (b - a > 1) name("same_fields", forms.slice(a, b));
        }
        r.entries += d.length;
        if (key === null) continue;
        if (st.name === "trade" && prev !== null && k1 - prev > 1) [jumps, max] = [jumps + 1, Math.max(max ?? 0, k1 - prev)]; // never a hole
        const last = his.length - 1; // the diffs' [U;u], merged, in U order
        if (st.name === "depth@100ms" && last >= 0 && k1 <= his[last] + 1) his[last] = Math.max(his[last], k2);
        else if (st.name === "depth@100ms") { los.push(k1); his.push(k2); }
        if (st.name === "bookTicker") { const at = floorAt(los, los.length, k1); outside += at >= 0 && k1 <= his[at] ? 0 : 1; tickers[nu++] = k1; } // (i)
        prev = k1;
      }
      canon[st.name] = { ...r, ...(st.name === "trade" ? { jumps: { count: jumps, max } } : {}), raw_sha256: raw.digest("hex"), fields_sha256: fields.digest("hex") };
    }
  } finally {
    for (const fd of fds.values()) closeSync(fd);
  }
  let ii = { absent: "no_replay" }; // (ii): a diff of the day whose best level changed, and no bookTicker u in its [U;u]
  if (best !== null) {
    const first = [];
    let unmatched = 0;
    for (let e = 0; e < 2 * best.n; e += 2) {
      const [U, u] = [best.events[e], best.events[e + 1]], at = floorAt(tickers, nu, U - 1) + 1;
      if (at < nu && tickers[at] <= u) continue;
      unmatched += 1;
      if (first.length < NAMED_BOUND) first.push([U, u]);
    }
    ii = { changes: best.n, unmatched, unjudged: best.unjudged, first };
  }
  const i = los.length === 0 ? { absent: "no_diffs", tickers: nu } : { tickers: nu, outside };
  return { manifest: { canon: { ...canon, named }, crosscheck: { i, ii } }, modules: ["canon"] };
}
