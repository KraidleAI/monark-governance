// MONARK Bell — non-LLM founding-measurement report generator (ADR-T1aii-D1-bis C-14). Reads the per-pool D9
// artifact (a directory of `**/state.json` collector outputs, kept OUT of the repo — C-4/CA-11), aggregates the
// Cong Table 4 statistic BY REGIME from the digest's gap entries, and writes a Markdown report. Pure aggregation:
// no LLM, no network, deterministic. The report is a CONSTAT (never green/red — ADR-T1aii C-3); every number
// carries a unit; the comparison to Cong is column-by-column with Cong's own values supplied by --cong-ref (a
// procured reference, never fabricated — the T-3 item). The report cites this script and its sha256 (C-14).
// NOTE: --out defaults to docs/MESURE-FONDATRICE-bell-2026-09.md INSIDE the repo BY DESIGN — the report is a
// governance doc that lands in docs/ (unlike the collector's D9 outputs, which are CA-11 out-of-tree). Not a lapse.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The off-hours regimes replicated against Cong Table 4 (sessions.ts P2). pre/regular/after are intraday
 *  (regime null) — reported separately, never compared to Cong. */
export const REGIMES = ["overnight-weekday", "weekend", "holiday"];

/** Recursively find every `state.json` under a D9 directory (per-pool subdirs). */
export function findStateFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...findStateFiles(abs));
    else if (name === "state.json") out.push(abs);
  }
  return out.sort();
}

// C-G2-4 report-level close guard (ADR-T1aii C-7 report-level guard). Defence in depth: the collector's
// digest is already assertNoClose-garded in digest.ts BEFORE it is hashed, and state.json carries that digest,
// so a close cannot structurally reach here from the LIVE pipeline. This guard additionally refuses to aggregate
// ANY state that still carries a numeric close/ADV field (a hand-built D9, or a future upstream regression). The
// CLOSE_KEY regex is a DELIBERATE, declared DUPLICATE of apps/bell/src/digest.ts (a .mjs run by plain `node`
// cannot import a .ts at runtime — no shared import possible); keep the two in sync. Mutant
// bell_report_input_close_guard reddens on a leaked close/ADV. BELL-ADV-1: `(?<!no_)adv` exempts the residual
// COUNTER `no_adv` (every state.json now carries it), in sync with digest.ts; the byte-equality of the two regex
// literals is pinned by report.test.ts (bell_report_accepts_named_adv_residuals_in_sync).
const CLOSE_KEY = /(?<!no_)close|ref[_]?price|p[_]?ref|reference|\bprev\b|(?<!no_)adv|share_volume|volume_ref/i;
const isNumericLike = (v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)));
export function assertNoCloseLike(v, path = "$") {
  if (Array.isArray(v)) { v.forEach((e, i) => assertNoCloseLike(e, `${path}[${i}]`)); return; }
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (CLOSE_KEY.test(k) && isNumericLike(val)) throw new Error(`bell-report close guard: forbidden close-like field '${k}' at ${path} (C-G2-4, ESC-1 c)`);
      assertNoCloseLike(val, `${path}.${k}`);
    }
  }
}

/** Aggregate the Cong Table 4 statistic by regime across a list of digests (state.json bodies or digests).
 *  For each regime: n sessions, n with a computed g_t, count exceeding 1 % / 5 % (|exp(g_t)-1|, from the pinned
 *  exceed flags), and abstentions. Also sums the residual counters. Deterministic. Every state is close-guarded
 *  first (C-G2-4): a state carrying a numeric close/ADV field is REFUSED, never silently aggregated. */
export function aggregate(states) {
  const byRegime = {};
  for (const r of REGIMES) byRegime[r] = { sessions: 0, withGt: 0, exceed1: 0, exceed5: 0, abstain: 0 };
  const residuals = {};
  for (const st of states) {
    assertNoCloseLike(st); // C-G2-4: fail-closed on a leaked reference close / ADV in the report input
    const d = (st && st.digest) || st || {};
    for (const g of d.gaps || []) {
      const r = g.regime;
      if (!REGIMES.includes(r)) continue;
      const b = byRegime[r];
      b.sessions += 1;
      if (Object.prototype.hasOwnProperty.call(g, "gT")) { b.withGt += 1; b.exceed1 += g.exceed1 || 0; b.exceed5 += g.exceed5 || 0; }
      else b.abstain += 1;
    }
    for (const [k, v] of Object.entries(d.residuals || {})) residuals[k] = (residuals[k] || 0) + (typeof v === "number" ? v : 0);
  }
  return { byRegime, residuals };
}

const pct = (num, den) => (den > 0 ? ((100 * num) / den).toFixed(2) + " %" : "n/a (0 sessions)");

/** Render the Markdown report from the aggregate. `cong` is an optional {regime: {frac1, frac5}} reference
 *  (procured — T-3); when absent the Cong column is a declared procurement item, NEVER a fabricated number. */
export function renderMarkdown(agg, meta) {
  const cong = meta.cong || null;
  const L = [];
  L.push("# MONARK Bell — founding off-session gap measurement (Solana), " + (meta.month || "2026-09"));
  L.push("");
  L.push("Generated by `apps/bell/scripts/bell-report.mjs` (sha256 `" + meta.scriptSha + "`) from the out-of-repo");
  L.push("D9 artifact `" + (meta.d9 || "<dir>") + "` (per-pool `state.json`, sha in the run log). Non-LLM, deterministic.");
  L.push("");
  L.push("**This is a CONSTAT, not a verdict (ADR-T1aii C-3).** Bell reports its own by-regime distribution; the");
  L.push("comparison to Cong et al. Table 4 is descriptive (their hours != our sessions; their top-100 != our pools;");
  L.push("the TSV population != the xStocks population — D2). No pass/fail is emitted.");
  L.push("");
  L.push("## Table 4 replication — Bell, by off-hours regime (unit: share of sessions)");
  L.push("");
  L.push("| regime | n sessions | n with g_t | share \\|g_t\\| > 1 % | share \\|g_t\\| > 5 % | Cong Table 4 > 1 % | Cong > 5 % |");
  L.push("|---|---|---|---|---|---|---|");
  for (const r of REGIMES) {
    const b = agg.byRegime[r];
    const c1 = cong && cong[r] ? cong[r].frac1 : "[T-3 procurement — not fabricated]";
    const c5 = cong && cong[r] ? cong[r].frac5 : "[T-3 procurement — not fabricated]";
    L.push(`| ${r} | ${b.sessions} | ${b.withGt} | ${pct(b.exceed1, b.withGt)} | ${pct(b.exceed5, b.withGt)} | ${c1} | ${c5} |`);
  }
  L.push("");
  L.push("g_t = ln(VWAP_token / close_ref) (log-return, dimensionless); exceedance = |exp(g_t) − 1| (relative, %).");
  L.push("Abstentions are counted, never bucketed silent (D8):");
  L.push("");
  L.push("| residual | count |");
  L.push("|---|---|");
  for (const k of Object.keys(agg.residuals).sort()) L.push(`| ${k} | ${agg.residuals[k]} |`);
  L.push("");
  const totalAbstain = REGIMES.reduce((a, r) => a + agg.byRegime[r].abstain, 0);
  L.push(`Off-hours sessions abstaining (no g_t): ${totalAbstain} — e.g. rebase_unverified (C-6) or no_close_ref (V-7).`);
  L.push("");
  L.push("Close of record: Massive Starter (internal, `close_source: massive-starter-internal`); the close value is");
  L.push("never republished (ESC-1 c). Provider reads are quorum'd (Helius + Chainstack, distinct operators, C-9).");
  return L.join("\n") + "\n";
}

function argOf(argv, k) { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; }

function main() {
  const argv = process.argv.slice(2);
  const d9 = argOf(argv, "--d9");
  if (!d9) { process.stderr.write("bell-report: --d9 <dir> is required (out-of-repo per-pool D9 artifact)\n"); process.exit(1); }
  const out = argOf(argv, "--out") || "docs/MESURE-FONDATRICE-bell-2026-09.md";
  const congRef = argOf(argv, "--cong-ref");
  const scriptSha = createHash("sha256").update(readFileSync(fileURLToPath(import.meta.url))).digest("hex").slice(0, 16);
  const files = findStateFiles(d9);
  const states = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
  const agg = aggregate(states);
  const cong = congRef ? JSON.parse(readFileSync(congRef, "utf8")) : null;
  const md = renderMarkdown(agg, { scriptSha, d9, month: argOf(argv, "--month") || "2026-09", cong });
  writeFileSync(out, md);
  process.stdout.write(`bell-report: ${files.length} state.json aggregated -> ${out} (script sha ${scriptSha})\n`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) main();
