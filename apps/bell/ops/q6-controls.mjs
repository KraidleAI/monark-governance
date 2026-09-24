#!/usr/bin/env node
// Q6 course -- post-run output controls (read-only, non-LLM, no network) for ONE mint run of apps/bell/ops/launch-q6.sh.
// Committed by ADR-BELL-CASH-LEG-1 D5/C-9 from the volatile seq 1 copy (worker claude-opus-5-5[1m], 2026-09-23); C09/C11 and the
// new C14 close_ref_present (C-6, BLOCKING for the publication) + C15 seq 1 <-> seq 2 coherence (C-8) follow the cash leg (D1).
//
// Usage (orchestrator, AFTER the node process has exited; refuses to read the cycle ledger while a .lock exists):
//   node apps/bell/ops/q6-controls.mjs --mint TSLAx --mode W3 --out <the --out of the course> --exec-tree <EXEC_TREE> \
//        [--variant fast] [--log F:/course-bell/logs/q6-TSLAx.log] [--ledger-cycle-dir F:/monark-ledger/helius-2026-09-19] \
//        [--seq1-state <seq 1 state.json of this mint>] [--now <epoch ms>]
// Prints one line per control: PASS|FAIL|WARN|INFO <id> <text>. Exit 0 iff no FAIL.
// It reads ONLY: the four --out artifacts, the run log, the optional seq 1 state.json and (optional) the two cycle ledgers
// (append-only; never the .head files). It imports digest.ts, sessions.ts and close.ts FROM THE EXEC TREE (the same code
// that produced the run) to recompute bell_sha, the session groups, the reference-close days and their publication gates.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const MINT = arg("--mint");
const MODE = arg("--mode");
const EXEC = arg("--exec-tree");
const OUT = arg("--out"); // REQUIRED (C-9): never a default path, which could read another sequence's bundle
if (!MINT || !MODE || !EXEC || !OUT) { process.stderr.write("usage: --mint <MINT> --mode <smoke|W1|W2|W3|W4> --out <dir> --exec-tree <dir> [--variant fast] [--log f] [--ledger-cycle-dir d] [--seq1-state f] [--now ms]\n"); process.exit(2); }

// Pre-registered windows (identical to the constants of launch-q6.sh; recomputed offline at seq 1, q6-offline.out).
const WINDOWS = {
  smoke: { from: 1789581600000, to: 1789585199000 }, // Wed 2026-09-16 14:00:00-14:59:59 ET (cut regular session, smoke only)
  W1: { from: 1789372800000, to: 1789977599000 },    // Monday 2026-09-14 04:00 ET .. Monday 2026-09-21 03:59:59 ET
  W2: { from: 1789718400000, to: 1789977599000 },    // Fri 2026-09-18 04:00 ET .. Monday 2026-09-21 03:59:59 ET
  W3: { from: 1789545600000, to: 1789631999000 },    // Wed 2026-09-16 04:00 ET .. Thu 2026-09-17 03:59:59 ET
  W4: { from: 1789565400000, to: 1789588799000 },    // Wed 2026-09-16 09:30 ET .. 15:59:59 ET (one complete regular session)
};
// FAST variant (decision 150): `smoke` = 15 min (D-n SMOKE-15), operators helius,chainstack, smoke paths *-fastsmoke.
const VARIANT = arg("--variant", "standard");
if (VARIANT !== "standard" && VARIANT !== "fast") { process.stderr.write(`unknown --variant ${VARIANT}\n`); process.exit(2); }
const SMOKE_FAST = { from: 1789581600000, to: 1789582499000 };      // Wed 2026-09-16 14:00:00-14:14:59 ET
const W = VARIANT === "fast" && MODE === "smoke" ? SMOKE_FAST : WINDOWS[MODE];
if (!W) { process.stderr.write(`unknown --mode ${MODE}\n`); process.exit(2); }
const OPS = arg("--operators", VARIANT === "fast" ? "helius,chainstack" : "helius,solana-foundation").split(",").map((s) => s.trim()).filter(Boolean);
if (OPS.length !== 2 || OPS[0] !== "helius") { process.stderr.write(`--operators must be helius,<second> (got ${OPS.join(",")})\n`); process.exit(2); }
const SMK = VARIANT === "fast" ? "fastsmoke" : "smoke";
const LOG = arg("--log", MODE === "smoke" ? `F:/course-bell/logs/q6-${MINT}-${SMK}.log` : `F:/course-bell/logs/q6-${MINT}.log`);
const LEDGER = arg("--ledger-cycle-dir");
const NOW = arg("--now") !== undefined ? Number(arg("--now")) : Date.now(); // C14 clock (override: offline tests only)
const MAX_PAGES = 20000;                 // --max-pages of the launch script (all modes)
const EXPECTED_ADV = { year: 2026, month: 8 };
const EXPECTED_NTD = 21;                 // NYSE trading days of 2026-08 per the committed calendar (seq 1 q6-offline.out)
const ADV_SOURCE = "massive-aggs-range-1-day-unadjusted";
const CALC_KEYS = ["adv_period", "formula", "multiplier_unit", "n", "n_bars", "n_trading_days", "regime", "session", "session_date_et", "symbol", "vol_ratio", "window"].join(",");
const RULE = { maxCredits: 75000, maxHours: 12, rateFactor: 1.5 }; // pre-registered window rule (PRECONDITIONS.md P-11)

let fails = 0;
const out = (lvl, id, txt) => { if (lvl === "FAIL") fails += 1; process.stdout.write(`${lvl} ${id} ${txt}\n`); };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// ---- Q6-C00 artifacts present + their sha256 (provenance of what was checked) ----
const files = ["state.json", "journal.json", "provenance.json", "timeline.jsonl"];
const missing = files.filter((f) => !existsSync(join(OUT, f)));
if (missing.length) { out("FAIL", "Q6-C00", `missing in ${OUT}: ${missing.join(",")} (no output = run STOPPED before the write; read the log)`); process.stdout.write(`RESULT ${fails} FAIL\n`); process.exit(1); }
for (const f of files) out("INFO", "Q6-C00", `${f} sha256=${sha(readFileSync(join(OUT, f)))}`);
const state = readJson(join(OUT, "state.json"));
const journal = readJson(join(OUT, "journal.json"));
const prov = readJson(join(OUT, "provenance.json"));
const timeline = readFileSync(join(OUT, "timeline.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l));

// ---- Q6-C01 run log: last header of this mode, exit=0 after it, the stdout line after it ----
let stdoutSha = null, calls = null, maxCalls = null, startIso = null, exitIso = null;
if (!existsSync(LOG)) out("FAIL", "Q6-C01", `log ${LOG} absent`);
else {
  const lines = readFileSync(LOG, "utf8").split(/\r?\n/);
  let h = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("q6-launch ") && lines[i].includes(` mint=${MINT} `) && lines[i].includes(` mode=${MODE} `)) h = i;
  if (h < 0) out("FAIL", "Q6-C01", `no 'q6-launch mint=${MINT} mode=${MODE}' header in ${LOG}`);
  else {
    startIso = (/ start=(\S+)/.exec(lines[h]) || [])[1] ?? null;
    const tail = lines.slice(h + 1);
    const ex = tail.map((l) => /^exit=(\d+) (\S+)/.exec(l)).filter(Boolean).pop();
    const so = tail.map((l) => /^bell\/collect bell_sha=([0-9a-f]{64}) symbols=(\d+) calls=(\d+)\/(\d+) /.exec(l)).filter(Boolean).pop();
    if (!ex) out("FAIL", "Q6-C01", "no exit= line after the last header (process still running, or wrapper killed)");
    else if (ex[1] !== "0") out("FAIL", "Q6-C01", `exit=${ex[1]} (read the FATAL line of the log)`);
    else { exitIso = ex[2]; out("PASS", "Q6-C01", `exit=0 at ${ex[2]} (start ${startIso})`); }
    if (!so) out("FAIL", "Q6-C01", "no 'bell/collect bell_sha=...' stdout line after the last header");
    else {
      stdoutSha = so[1]; calls = Number(so[3]); maxCalls = Number(so[4]);
      if (so[2] !== "1") out("FAIL", "Q6-C01", `symbols=${so[2]} (expected 1: --pools ${MINT})`);
      else out("PASS", "Q6-C01", `stdout bell_sha=${so[1].slice(0, 16)}... symbols=1 calls=${so[3]}/${so[4]}`);
    }
  }
}

// ---- Q6-C02 schema, pinned window, bell_sha recomputed with the exec tree's digest.ts ----
const dg = await import(pathToFileURL(resolve(EXEC, "apps/bell/src/digest.ts")).href);
const ss = await import(pathToFileURL(resolve(EXEC, "apps/bell/src/sessions.ts")).href);
const cl = await import(pathToFileURL(resolve(EXEC, "apps/bell/src/close.ts")).href);
if (state.schema !== "bell-state-v1") out("FAIL", "Q6-C02", `schema=${state.schema}`);
if (!state.window || state.window.from_utc_ms !== W.from || state.window.to_utc_ms !== W.to) out("FAIL", "Q6-C02", `state.window=${JSON.stringify(state.window)} != pinned ${JSON.stringify(W)}`);
let recomputed = null;
try { recomputed = dg.bellSha(state.digest); } catch (e) { out("FAIL", "Q6-C02", `bellSha(state.digest) threw: ${e instanceof Error ? e.message : String(e)}`); }
if (recomputed !== null) {
  const okState = recomputed === state.bell_sha, okStdout = stdoutSha === null || recomputed === stdoutSha;
  if (okState && okStdout) out("PASS", "Q6-C02", `bell_sha recomputed=${recomputed} == state == stdout; window pinned`);
  else out("FAIL", "Q6-C02", `bell_sha recomputed=${recomputed} state=${state.bell_sha} stdout=${stdoutSha}`);
}

const R = state.residuals || {};
const r = (k) => (typeof R[k] === "number" ? R[k] : NaN);
// ---- Q6-C03..C05 the three abstentions that void Q6 ----
if (r("no_multiplier") === 0 && r("rebase_unverified") === 0) out("PASS", "Q6-C03", "no_multiplier=0 rebase_unverified=0 (gate established: trajectory anchored C-3)");
else out("FAIL", "Q6-C03", `no_multiplier=${r("no_multiplier")} rebase_unverified=${r("rebase_unverified")} => trajectory not anchored/stale or mint unread: re-produce (P-7) and relaunch`);
if (r("no_adv") === 0) out("PASS", "Q6-C04", "no_adv=0 (ADV month covered exactly)");
else out("FAIL", "Q6-C04", `no_adv=${r("no_adv")} => ADV leg failed (POLYGON key/host, MASSIVE-HOST-1) or month incomplete (n_bars vs n_trading_days)`);
if (r("no_quorum") === 0 && r("no_fill_in_window") === 0) out("PASS", "Q6-C05", "no_quorum=0 no_fill_in_window=0");
else out("FAIL", "Q6-C05", `no_quorum=${r("no_quorum")} no_fill_in_window=${r("no_fill_in_window")}`);

// ---- Q6-C06 volume entries: calculated, closed key set, dated denominator, window inside the pinned bounds ----
const vol = Array.isArray(state.digest?.volume) ? state.digest.volume : [];
const gaps = Array.isArray(state.digest?.gaps) ? state.digest.gaps : [];
const badVol = [];
for (const v of vol) {
  const keys = Object.keys(v).sort().join(",");
  const reasons = [];
  if (v.symbol !== MINT) reasons.push(`symbol=${v.symbol}`);
  if ("abstain" in v) reasons.push(`abstain=${JSON.stringify(v.abstain)}`);
  if (keys !== CALC_KEYS) reasons.push(`keys=${keys}`);
  if (typeof v.vol_ratio !== "string" || !/^\d+\.\d{10}$/.test(v.vol_ratio)) reasons.push(`vol_ratio=${v.vol_ratio}`);
  if (!v.adv_period || v.adv_period.year !== EXPECTED_ADV.year || v.adv_period.month !== EXPECTED_ADV.month) reasons.push(`adv_period=${JSON.stringify(v.adv_period)}`);
  if (v.n_bars !== EXPECTED_NTD || v.n_trading_days !== EXPECTED_NTD) reasons.push(`n_bars=${v.n_bars} n_trading_days=${v.n_trading_days}`);
  if (!v.window || !(v.window.from_utc_ms >= W.from && v.window.to_utc_ms <= W.to && v.window.from_utc_ms <= v.window.to_utc_ms)) reasons.push(`window=${JSON.stringify(v.window)}`);
  if (!(Number.isInteger(v.n) && v.n >= 1)) reasons.push(`n=${v.n}`);
  if (typeof v.formula !== "string" || !v.formula.startsWith("vol_ratio = S / A;")) reasons.push("formula");
  if (reasons.length) badVol.push(`${v.session}|${v.regime}|${v.session_date_et}: ${reasons.join("; ")}`);
}
if (vol.length === 0) out("FAIL", "Q6-C06", "digest.volume is empty (no session with fills)");
else if (badVol.length) out("FAIL", "Q6-C06", `${badVol.length}/${vol.length} volume entries off-spec: ${badVol.slice(0, 5).join(" | ")}`);
else out("PASS", "Q6-C06", `${vol.length} volume entries, all calculated, adv_period 2026-08, n_bars=n_trading_days=21, windows inside the pinned bounds`);

// ---- Q6-C07 one volume entry per gap group; every group key is a session group of the pinned window ----
const key = (e) => `${e.session}|${e.regime ?? "null"}|${e.session_date_et ?? e.anchor ?? "?"}`;
const volKeys = vol.map(key);
const expected = new Set();
for (let ms = W.from; ms <= W.to; ms += 60_000) { const c = ss.classifySession(ms); expected.add(`${c.session}|${c.regime ?? "null"}|${c.sessionDateET}`); }
const dupVol = volKeys.length - new Set(volKeys).size;
const outside = volKeys.filter((k) => !expected.has(k));
if (dupVol === 0 && outside.length === 0 && vol.length === gaps.length) out("PASS", "Q6-C07", `${vol.length} groups covered of ${expected.size} session groups of the window; volume entries == gap entries (${gaps.length})`);
else out("FAIL", "Q6-C07", `dup=${dupVol} outside_window_groups=${outside.join(",") || "-"} volume=${vol.length} gaps=${gaps.length}`);
if (vol.length < expected.size) out("INFO", "Q6-C07", `session groups without any fill (no entry, not an abstention): ${[...expected].filter((k) => !volKeys.includes(k)).join(",")}`);

// ---- Q6-C08 provenance names the ADV source (never a value) ----
if (prov?.sources?.adv_source === ADV_SOURCE) out("PASS", "Q6-C08", `adv_source=${ADV_SOURCE}`);
else out("FAIL", "Q6-C08", `adv_source=${prov?.sources?.adv_source}`);

// ---- Q6-C09 journal faults policy (C-4): NO cash-leg fault (the close, its cross-check and the ADV bars were all read) ----
const faults = Array.isArray(journal.faults) ? journal.faults : [];
const byProv = {};
for (const f of faults) { const k = `${f.provider}:${f.status}`; byProv[k] = (byProv[k] || 0) + 1; }
const CASH = [cl.CASH_CLOSE_LABEL, cl.CASH_CROSS_LABEL, cl.ADV_BARS_LABEL];
if (CASH.some((l) => typeof l !== "string")) out("FAIL", "Q6-C09", "the exec tree predates ADR-BELL-CASH-LEG-1 (no cash-leg labels in close.ts)");
const cash = faults.filter((f) => CASH.includes(f.provider));
const hosts = faults.filter((f) => !/^[a-z0-9][a-z0-9-]*$/.test(String(f.provider))); // a dotted host: refused by the publisher
const other = faults.filter((f) => !cash.includes(f) && !hosts.includes(f));
if (cash.length) out("FAIL", "Q6-C09", `cash-leg faults=${JSON.stringify(cash)} (expected none: key, host or quota; the sessions lose their close or ADV)`);
if (hosts.length) out("FAIL", "Q6-C09", `non-bare fault labels=${JSON.stringify(hosts)} (the publisher refuses them: re-produce, never relabel)`);
if (other.length) out("WARN", "Q6-C09", `other faults ${JSON.stringify(byProv)}: each helius/${OPS[1]} fault on a single-provider body is a SKIPPED fill (S understated) -- declare the count in the course D-n`);
if (!cash.length && !hosts.length && !other.length) out("PASS", "Q6-C09", `faults=${JSON.stringify(byProv)}`);

// ---- Q6-C10 quorum sampling (always 1 when > 1 in-window body) + coverage ----
const tl = timeline.find((t) => t.symbol === MINT);
if (r("quorum_sampled") > 1) out("FAIL", "Q6-C10", `quorum_sampled=${r("quorum_sampled")} (>1 for one symbol)`);
else out("INFO", "Q6-C10", `quorum_sampled=${r("quorum_sampled")} quorum_coverage=${tl?.quorum_coverage} n_fills=${tl?.n_fills} (coverage ~0.2 with --body-sample 5; lower = sampled bodies lost, silent in the code -- see Q6-C13)`);

// ---- gap <-> session date. A gap entry carries no anchor date; its volume entry does (session_date_et). collect() builds ONE gap
// and ONE volume entry per session group, both in the same order (collect.ts sortedGroups: anchor, then session), and
// buildDigest re-sorts the gaps by symbol/session/regime with a STABLE sort (digest.ts): within one (symbol, session, regime)
// bucket the k-th gap IS the k-th volume entry. Each pair must agree on n, else the join is not proven (fail-closed, C14/C15).
function joinAnchors(st) {
  const g = Array.isArray(st.digest?.gaps) ? st.digest.gaps : [], v = Array.isArray(st.digest?.volume) ? st.digest.volume : [];
  const bucket = (e) => `${e.symbol}|${e.session}|${e.regime ?? "null"}`, vb = new Map(), seen = new Map(), pairs = [];
  for (const e of v) vb.set(bucket(e), [...(vb.get(bucket(e)) ?? []), e]);
  for (const e of g) {
    const b = bucket(e), i = seen.get(b) ?? 0, ve = (vb.get(b) ?? [])[i];
    seen.set(b, i + 1);
    if (!ve || ve.n !== e.n || typeof ve.session_date_et !== "string") return { ok: false, why: `gap ${b}#${i} has no volume entry of the same n` };
    pairs.push({ gap: e, anchor: ve.session_date_et });
  }
  if ([...vb].some(([b, l]) => l.length !== (seen.get(b) ?? 0))) return { ok: false, why: "gap and volume buckets differ in size" };
  return { ok: true, pairs };
}
const J = joinAnchors(state);

// ---- Q6-C14 close_ref_present (C-6, BLOCKING for the publication). A no_close_ref is legitimate ONLY for a session whose
// reference close is not yet publishable: earliestPublishUtc(refCloseDateOf(session, anchor)) > now (the exec tree's own
// functions). Every other session carries gT (string) + its earliest_publish_utc, cross-checked (cash_cross matched).
// cash_cross_mismatch => FAIL/STOP (the first live cross disagrees: investigation, never published); unavailable => FAIL.
let pending = NaN;
if (!J.ok) out("FAIL", "Q6-C14", `gap -> session date join not proven (${J.why}): no_close_ref cannot be qualified`);
else {
  pending = 0;
  let filled = 0;
  const bad = [];
  for (const { gap, anchor } of J.pairs) {
    const ref = ss.refCloseDateOf(gap.session, anchor), epu = cl.earliestPublishUtc(ref), at = `${gap.session}|${anchor} (ref ${ref})`;
    if (gap.abstain === "cash_cross_mismatch") bad.push(`STOP cash_cross_mismatch on ${at}: investigate the cross before any publication`);
    else if (gap.abstain === "no_close_ref") { if (epu <= NOW) bad.push(`no_close_ref on ${at}: publishable since ${new Date(epu).toISOString()}`); else pending += 1; }
    else if (!("abstain" in gap)) {
      if (typeof gap.gT !== "string" || gap.earliest_publish_utc !== epu) bad.push(`${at}: gT=${typeof gap.gT} earliest_publish_utc=${gap.earliest_publish_utc} (expected ${epu})`);
      else if (gap.cash_cross !== "matched") bad.push(`${at}: cash_cross=${gap.cash_cross} (expected matched: the cross-check key is present)`);
      else filled += 1;
    }
  }
  if (r("cash_cross_mismatch") !== 0 || r("cash_cross_unavailable") !== 0) bad.push(`residuals cash_cross_mismatch=${r("cash_cross_mismatch")} cash_cross_unavailable=${r("cash_cross_unavailable")} (expected 0)`);
  if (bad.length) out("FAIL", "Q6-C14", `${bad.length} session(s) without a publishable close: ${bad.join(" | ")}`);
  else out("PASS", "Q6-C14", `${filled} session(s) with gT (cash_cross matched), ${pending} no_close_ref not yet publishable (now=${new Date(NOW).toISOString()})`);
}

// ---- Q6-C11 expected constant residuals (WARN only: informative); no_close_ref == the sessions not yet publishable (C14) ----
const expConst = { por_unavailable: 1, no_wrapper: 1, multiplier_unit: MINT === "TSLAx" ? 0 : 1, cash_cross_mismatch: 0, cash_cross_unavailable: 0,
  authority_scan_mono_operator: 0, set_authority_unscanned: 0, resume_time_missing: 0, resume_date_gt_halt_date: 0, reason_unknown: 0, block_ts_vs_submission: 0,
  no_close_ref: pending };
const diffs = Object.entries(expConst).filter(([k, v]) => r(k) !== v).map(([k, v]) => `${k}=${r(k)} (expected ${v})`);
if (diffs.length) out("WARN", "Q6-C11", diffs.join("; "));
else out("PASS", "Q6-C11", `constant residuals as expected (no_close_ref=${pending}: sessions not yet publishable)`);

// ---- Q6-C12 timeline chain (prev_line_hash) recomputed with the exec tree's canonical() ----
let prev = "0".repeat(64), chainOk = true;
for (const line of timeline) {
  if (line.prev_line_hash !== prev) { chainOk = false; break; }
  prev = sha(Buffer.from(dg.canonical(line), "utf8"));
}
out(chainOk ? "PASS" : "FAIL", "Q6-C12", `timeline.jsonl ${timeline.length} line(s), chain ${chainOk ? "verifies" : "BROKEN"}`);

// ---- Q6-C13 cycle-ledger segment of THIS run (after the process exit only) ----
if (LEDGER) {
  const locks = existsSync(LEDGER) ? readdirSync(LEDGER).filter((f) => f.endsWith(".lock")) : ["<dir absent>"];
  if (locks.length) out("FAIL", "Q6-C13", `lock(s) present in ${LEDGER}: ${locks.join(",")} -- a process holds the cycle: do NOT read the ledgers now (RUNBOOK section 2)`);
  else {
    const seg = {};
    for (const op of OPS) {
      const p = join(LEDGER, `${op}.jsonl`);
      const ents = readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l));
      let end = -1, beg = -1;
      for (let i = ents.length - 1; i >= 0; i--) if (ents[i].outcome === "unlocked") { if (end < 0) end = i; else { beg = i; break; } }
      const s = { attempted: {}, refused: 0, credits: 0, lastUnlockReason: end >= 0 ? ents[end].reason : null };
      for (const e of ents.slice(beg + 1, end < 0 ? ents.length : end)) {
        if (e.outcome === "refused") s.refused += 1;
        if (e.outcome !== "attempted") continue;
        for (const k of Object.keys(e.by_op_method || {})) { const m = k.split("|")[1]; s.attempted[m] = (s.attempted[m] || 0) + 1; }
        s.credits += typeof e.credits_derived === "number" ? e.credits_derived : 0;
      }
      seg[op] = s;
      out("INFO", "Q6-C13", `${op}: segment lines ${beg + 1}..${end} attempted=${JSON.stringify(s.attempted)} refused=${s.refused} credits_derived=${s.credits} unlock_reason=${JSON.stringify(s.lastUnlockReason)}`);
    }
    const h = seg.helius, sf = seg[OPS[1]];
    const pages = h.attempted.getSignaturesForAddress || 0;
    if (h.refused || sf.refused) out("FAIL", "Q6-C13", `refused attempts helius=${h.refused} ${OPS[1]}=${sf.refused} (a budget refusal inside the run)`);
    if (pages >= MAX_PAGES) out("FAIL", "Q6-C13", `helius getSignaturesForAddress=${pages} >= --max-pages ${MAX_PAGES}: enumeration may be SILENTLY truncated (rpc.ts signaturesUntil)`);
    else out("PASS", "Q6-C13", `helius gSFA pages=${pages} < ${MAX_PAGES} (enumeration ended on the window bound, not on the cap); helius credits=${h.credits}`);
    const gtxH = h.attempted.getTransaction || 0, gtxSF = sf.attempted.getTransaction || 0;
    if (gtxH > 0 && tl?.quorum_coverage !== undefined) {
      const sampledOk = Math.round(tl.quorum_coverage * gtxH);
      out(sampledOk >= gtxSF ? "INFO" : "WARN", "Q6-C13", `bodies: helius getTransaction=${gtxH} (~in-window bodies incl. retries), ${OPS[1]} getTransaction=${gtxSF} (sampled attempts), sampled OK ~${sampledOk}${sampledOk < gtxSF ? " => some sampled bodies failed quorum and were SKIPPED (silent in the journal)" : ""}`);
      if (OPS[1] === "chainstack") out("INFO", "Q6-C13", `chainstack RU this run=${sf.credits} (expected ~2P+2*ceil(N/5)+2 = ${2 * pages + 2 * gtxSF + 2} from the attempts above)`);
    }
    // ---- projection (smoke only): pre-registered window rule P-11 ----
    if (MODE === "smoke" && startIso && exitIso && calls) {
      const startMs = Date.parse(startIso), wallS = (Date.parse(exitIso) - startMs) / 1000;
      const tCall = wallS / calls;
      const tailDays = (startMs - W.from) / 86_400_000;
      const rDay = (pages * 1000) / tailDays; // upper bound: pages x 1000 sigs over the enumerated tail
      out("INFO", "Q6-PROJ", `smoke: wall=${wallS.toFixed(0)} s calls=${calls} t_call=${tCall.toFixed(3)} s; tail=${tailDays.toFixed(2)} d pages=${pages} => r_day<=${rDay.toFixed(0)} sigs/day (vault, all sessions)`);
      const launchMs = Date.now() + 3_600_000;
      let pick = null;
      for (const w of ["W1", "W2", "W3", "W4"]) {
        const ww = WINDOWS[w];
        const nW = RULE.rateFactor * rDay * ((ww.to - ww.from + 1000) / 86_400_000);
        const pW = Math.ceil((rDay * ((launchMs - ww.from) / 86_400_000)) / 1000);
        const cred = pW + nW + 2, callsW = 2 * pW + 1.2 * nW + 6, hours = (callsW * tCall) / 3600;
        const ok = cred <= RULE.maxCredits && hours <= RULE.maxHours;
        if (ok && pick === null) pick = w;
        out("INFO", "Q6-PROJ", `${w}: N_win~${nW.toFixed(0)} pages~${pW} helius_credits~${cred.toFixed(0)} calls~${callsW.toFixed(0)} duration~${hours.toFixed(1)} h => ${ok ? "within" : "OUTSIDE"} rule (<= ${RULE.maxCredits} cr, <= ${RULE.maxHours} h)`);
      }
      out("INFO", "Q6-PROJ", `rule P-11 pick for ${MINT}: ${pick ?? "NONE (STOP: formed item Q6-PARALLEL-1, no improvised window)"}`);
    }
  }
}

// ---- Q6-C15 seq 1 <-> seq 2 coherence (C-8): same window => per session vwap, volumeBase, n equal to seq 1; a difference is a
// WARN + a D-n line with both figures (the body quorum is sampled at 0.2: a single miss can drop one fill) ----
const S1 = arg("--seq1-state");
if (!S1) out("WARN", "Q6-C15", "not run: pass --seq1-state <the seq 1 state.json of this mint> (C-8)");
else {
  const s1 = readJson(S1), J1 = joinAnchors(s1);
  if (JSON.stringify(s1.window) !== JSON.stringify(state.window)) out("WARN", "Q6-C15", `seq 1 window ${JSON.stringify(s1.window)} != ${JSON.stringify(state.window)}: not comparable`);
  else if (!J.ok || !J1.ok) out("WARN", "Q6-C15", `join not proven (this run: ${J.why ?? "ok"}; seq 1: ${J1.why ?? "ok"})`);
  else {
    const k15 = (p) => `${p.gap.symbol}|${p.gap.session}|${p.gap.regime ?? "null"}|${p.anchor}`;
    const one = new Map(J1.pairs.map((p) => [k15(p), p.gap])), d15 = [];
    for (const p of J.pairs) {
      const a = one.get(k15(p));
      one.delete(k15(p));
      if (!a) { d15.push(`${k15(p)} absent from seq 1`); continue; }
      for (const f of ["vwap", "volumeBase", "n"]) if (a[f] !== p.gap[f]) d15.push(`${k15(p)} ${f} seq1=${a[f]} seq2=${p.gap[f]} delta=${(Number(p.gap[f]) - Number(a[f])).toPrecision(6)}`);
    }
    for (const k of one.keys()) d15.push(`${k} absent from seq 2`);
    if (d15.length) out("WARN", "Q6-C15", `${d15.length} difference(s), write the D-n line: ${d15.join(" | ")}`);
    else out("PASS", "Q6-C15", `${J.pairs.length} session(s): vwap, volumeBase, n equal to seq 1`);
  }
}
process.stdout.write(`RESULT ${fails} FAIL\n`);
process.exit(fails ? 1 : 0);
