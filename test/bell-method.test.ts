/**
 * Root test for the /bell/method page (lot SITE-CHARTE-C; decision 146): the collector DEFINITIONS the page restates
 * (apps/site/lib/bell-method.ts) equal the collector source (apps/bell/src) — the session bounds are replayed through
 * the collector's own classifySession() at the minute they claim, the calendar sets and the decimals are compared for
 * equality, and the residual list covers the collector's closed list exactly: a code listed as served is in it, and a
 * code still marked upcoming is NOT in it (a code that reached the collector must move to a served list — the check the
 * v1 of this test lacked, which let no_adv / no_multiplier stay "upcoming" after their merge). Non-LLM oracle, run by
 * `npm test`. Mutants (named, measured in the lot report): write "04:30" as the pre-open bound => reds; drop a residual
 * code from the page list => reds; list a served code as upcoming => reds.
 * Also pinned here: the reserves status is worded as Bell's own abstention, keyed on the collector's status kinds and on
 * the registry fact it states (no public on-chain reserve feed); the volume-ratio restatement keeps every clause of the
 * served formula string and says "shares per unit"; the key card carries the backups declaration of the runbook.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BELL_SESSION_BOUNDS_ET,
  BELL_CALENDAR,
  BELL_DECIMALS,
  BELL_RESIDUALS_SESSIONS,
  BELL_RESIDUALS_VOLUME,
  BELL_RESIDUALS_HALTS_RESERVES,
  BELL_RESIDUALS_UPCOMING,
  BELL_RESIDUAL_CODES_LISTED,
  BELL_PUBLIC_REPO_URL,
  BELL_POR_KIND_GLOSS,
  BELL_VOL_RATIO_FORMULA_DISPLAY,
  porGloss,
} from "../apps/site/lib/bell-method.ts";
import { loadBellServed } from "../apps/site/lib/bell-served-load.ts";
import { classifySession, etWallClockToUtcMs, FULL_CLOSURES, HALF_DAYS, CALENDAR_RANGE } from "../apps/bell/src/sessions.ts";
import { GAP_PRECISION } from "../apps/bell/src/gap.ts";
import { RESIDUAL_CODES } from "../apps/bell/src/residuals.ts";
import { porStatus, POR_SOURCES } from "../apps/bell/src/supply.ts";
import { closeLikePath } from "../apps/bell/scripts/bell-chain.mjs";

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");

test("bell_method_facts_match_collector — /bell/method definitions equal apps/bell/src (bounds, calendar, decimals, residuals)", () => {
  // Bounds: replay each claimed minute through the collector's classifier, on a normal day and on a half-day.
  const at = (dateISO: string, hhmm: string): string => {
    const [y, mo, d] = dateISO.split("-").map(Number);
    const [h, mi] = hhmm.split(":").map(Number);
    return classifySession(etWallClockToUtcMs(y ?? 0, mo ?? 0, d ?? 0, h ?? 0, mi ?? 0, 0)).session;
  };
  const minus = (hhmm: string): string => {
    const [h, mi] = hhmm.split(":").map(Number);
    const t = (h ?? 0) * 60 + (mi ?? 0) - 1;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };
  const b = BELL_SESSION_BOUNDS_ET;
  const normal = "2026-09-22"; // a Tuesday, full trading day in the committed calendar
  const half = "2026-11-27"; // a half-day in the committed calendar
  assert.ok(!FULL_CLOSURES.has(normal) && !HALF_DAYS.has(normal) && HALF_DAYS.has(half), "fixture days must be a normal day and a half-day");
  const flips: Array<[string, string, string, string]> = [
    [normal, b.preOpen, "overnight-weekday", "pre"],
    [normal, b.regularOpen, "pre", "regular"],
    [normal, b.regularClose, "regular", "after"],
    [normal, b.afterClose, "after", "overnight-weekday"],
    [half, b.regularCloseHalfDay, "regular", "after"],
    [half, b.afterCloseHalfDay, "after", "overnight-weekday"],
  ];
  for (const [day, bound, before, after] of flips) {
    assert.equal(at(day, minus(bound)), before, `${day} one minute before ${bound} ET must be ${before}`);
    assert.equal(at(day, bound), after, `${day} at ${bound} ET must be ${after}`);
  }
  // Calendar: identical range and sets.
  assert.equal(BELL_CALENDAR.from, CALENDAR_RANGE.fromISO);
  assert.equal(BELL_CALENDAR.to, CALENDAR_RANGE.toISO);
  assert.deepEqual([...BELL_CALENDAR.fullClosures].sort(), [...FULL_CLOSURES].sort(), "full closures must equal sessions.ts FULL_CLOSURES");
  assert.deepEqual([...BELL_CALENDAR.halfDays].sort(), [...HALF_DAYS].sort(), "half-days must equal sessions.ts HALF_DAYS");
  // Decimals.
  assert.equal(BELL_DECIMALS, GAP_PRECISION, "decimals must equal gap.ts GAP_PRECISION");
  // Residuals: every served code listed on the page is in the collector's closed list, and every code of the
  // closed list is on the page (as served or, for a lot not merged at this base, as upcoming).
  const listed = [...BELL_RESIDUALS_SESSIONS, ...BELL_RESIDUALS_VOLUME, ...BELL_RESIDUALS_HALTS_RESERVES].map((r) => r.code);
  const upcoming = BELL_RESIDUALS_UPCOMING.map((r) => r.code);
  const closed = new Set<string>(RESIDUAL_CODES);
  for (const c of listed) assert.ok(closed.has(c), `page lists '${c}' as a residual but the collector's closed list does not carry it`);
  assert.equal(new Set(listed).size, listed.length, "no residual code listed twice");
  for (const c of upcoming) assert.ok(!closed.has(c), `page marks '${c}' upcoming but the collector's closed list already carries it: list it as served`);
  for (const c of closed) assert.ok(listed.includes(c), `collector residual '${c}' is missing from the served lists of /bell/method`);
  assert.deepEqual([...BELL_RESIDUAL_CODES_LISTED].sort(), [...closed].sort(), "the list the loader checks each run against = the collector's closed list");
});

test("bell_method_public_repo_link_is_the_footer_link — one repository URL on the storefront", () => {
  const footer = readFileSync(join(import.meta.dirname, "..", "apps", "site", "components", "site-footer.tsx"), "utf8");
  const hrefs = [...footer.matchAll(/href="(https:\/\/github\.com\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, [BELL_PUBLIC_REPO_URL], "the Bell pages link the same public repository as the footer");
});

test("bell_method_por_gloss_matches_the_collector_status — a served reserves status is worded as Bell's own abstention", () => {
  // The glossed kinds are exactly the collector's PoRStatus kinds (no relayed value; a stale one; a fresh one).
  const now = 1_800_000_000, bound = 3600;
  const kinds = [
    porStatus("TSLAx", now, bound).kind,
    porStatus("TSLAx", now, bound, { value: "1", updatedAtSec: now - bound - 1 }).kind,
    porStatus("TSLAx", now, bound, { value: "1", updatedAtSec: now }).kind,
  ];
  assert.deepEqual([...new Set(kinds)].sort(), Object.keys(BELL_POR_KIND_GLOSS).sort(), "the glossed kinds = the collector's status kinds");
  // The fact the "unavailable" gloss states: no instrument of the collector's registry names a public on-chain reserve feed.
  const registry = Object.entries(POR_SOURCES);
  assert.ok(registry.length >= 4, "non-vacuity: the collector's reserves registry is read");
  for (const [symbol, src] of registry) assert.equal(src.onchainFeed, null, `${symbol} now names an on-chain reserve feed: re-read the unavailable gloss`);
  assert.match(BELL_POR_KIND_GLOSS.unavailable ?? "", /^not recomputed by Bell: no public on-chain reserve feed to recompute against/);
  const residual = BELL_RESIDUALS_HALTS_RESERVES.find((r) => r.code === "por_unavailable")?.gloss ?? "";
  assert.match(residual, /no public on-chain reserve feed/, "the residual gloss states the same fact as the status gloss");
  assert.match(residual, /not a statement about the issuer's reserves/);
  // Every served status renders through its gloss; an unknown status throws, never a bare label.
  const served = loadBellServed(ROOT).head.runs.flatMap((r) => r.por);
  assert.ok(served.length > 0, "non-vacuity: the served record carries a reserves status");
  for (const p of served) assert.equal(porGloss(p.kind), BELL_POR_KIND_GLOSS[p.kind]);
  assert.throws(() => porGloss("a-status-the-collector-never-emits"), /no gloss/);
  const bell = read("apps/site/app/bell/page.tsx");
  assert.match(bell, /\{porGloss\(p\.kind\)\}/, "/bell renders the reserves status through its gloss");
  assert.ok(!/\{p\.kind\}/.test(bell), "/bell never renders the bare reserves kind");
});

test("bell_method_volume_formula_restates_the_served_string — clause by clause, in shares per unit", () => {
  const served = [...new Set(loadBellServed(ROOT).head.runs.flatMap((r) => r.volume.map((v) => v.formula)))];
  assert.ok(served.length > 0, "non-vacuity: a served formula string is read");
  // [clause, in the served string, in the restatement]
  const clauses: Array<[string, RegExp, RegExp]> = [
    ["ratio", /vol_ratio = S \/ A/, /^vol_ratio\s+= S \/ A$/m],
    ["numerator", /S = sum over this session's pool fills/, /^S\s+= Σ \|b_i\| · m\(t_i\) over the session's own pool$/m],
    ["fill window", /first and last fill in window/, /from its first fill to its last/],
    ["multiplier", /m = [a-z-]+ multiplier in effect at the fill/, /^m\(t\)\s+= shares per unit in effect at the fill$/m],
    ["denominator", /A = sum\(v\) \/ n_bars over the unadjusted daily bars of the underlying dated in adv_period/,
      /^A\s+= Σ v \/ n_bars over the unadjusted daily\s+consolidated share volumes v of the\s+underlying dated in adv_period$/m],
    ["period", /adv_period = the calendar month before session_date_et/, /^adv_period = the calendar month before the session date;$/m],
    ["completeness", /n_bars = n_trading_days, else no_adv/, /n_bars = n_trading_days, else no_adv/],
    ["unit", /unit = fraction of one average trading day of adv_period/, /^unit\s+= a fraction of one average trading day\s+of adv_period$/m],
  ];
  for (const f of served) for (const [name, inServed] of clauses) assert.match(f, inServed, `the served string no longer carries the ${name} clause: re-read the restatement`);
  for (const [name, , inDisplay] of clauses) assert.match(BELL_VOL_RATIO_FORMULA_DISPLAY, inDisplay, `the restatement lacks the ${name} clause`);
  assert.ok(!/token/i.test(BELL_VOL_RATIO_FORMULA_DISPLAY), "the restatement says units and shares per unit");
  assert.ok(!/\d/.test(BELL_VOL_RATIO_FORMULA_DISPLAY), "no digit in the typed restatement");
  const method = read("apps/site/app/bell/method/page.tsx");
  assert.match(method, /\{BELL_VOL_RATIO_FORMULA_DISPLAY\}/, "/bell/method renders the restatement");
  assert.ok(!/\.formula\b/.test(method), "/bell/method does not render the served string verbatim (its multiplier wording predates the storefront's)");
});

test("bell_method_states_the_key_backup_principle_only — an offline backup exists and a restore is an exposure event; no count of copies, no location (decision of the owner, 2026-09-24)", () => {
  const norm = (s: string): string => s.replace(/&rsquo;/g, "'").replace(/\s+/g, " ");
  // The principle rests on the runbook's own fact: the private key IS backed up (by the host provider's automatic
  // backups). If the runbook stops saying so, the site's "a backup exists" loses its ground => red.
  assert.ok(norm(read("docs/RUNBOOK-bell.md")).includes("private key WILL be contained in the host provider's weekly automatic backups"), "the runbook grounds the backup principle");
  const method = norm(read("apps/site/app/bell/method/page.tsx"));
  assert.ok(method.includes("a backup of the private key exists offline"), "/bell/method states the backup principle");
  assert.ok(method.includes("restoring it is an exposure event, followed by an immediate counter-signed rotation of the key"), "a restore is an exposure event");
  assert.match(method, /<Placeholder name="key_rotation_policy" state="to be published" \/>/, "the rotation policy stays to be published");
  // No location and no count of copies. Mutant: restore "the host provider's weekly backups" => red.
  for (const detail of [/host provider/i, /\bweekly\b/i, /\bsnapshot\b/i, /\b(?:one|two|three|four|\d+)\s+(?:copies|backups|exemplars)\b/i]) {
    assert.doesNotMatch(method, detail, `/bell/method gives a backup detail: ${String(detail)}`);
  }
  assert.ok(!/never leaves/.test(method), "no claim that the signing key never leaves the host");
});

test("bell_method_digest_guard_sentence_matches_the_guard — what it refuses, and what it carries", () => {
  // The publisher's guard (bell-chain.mjs, the mirror of digest.ts) on one numeric value per key: refused vs carried.
  const refused = ["close", "refPrice", "p_ref", "reference", "adv", "share_volume", "volume_ref"];
  const carried = ["vwap", "volumeBase", "gT", "vol_ratio", "no_close_ref", "no_adv"];
  for (const k of refused) assert.notEqual(closeLikePath({ [k]: "1.5" }), null, `the guard refuses a numeric ${k}`);
  for (const k of carried) assert.equal(closeLikePath({ [k]: "1.5" }), null, `the guard lets a numeric ${k} through`);
  const method = read("apps/site/app/bell/method/page.tsx").replace(/\s+/g, " ");
  assert.ok(method.includes("Close values, reference prices and consolidated volumes (a numeric value under any key naming a close, a reference price, an average daily volume or a share volume) are refused by the digest guard; the on-chain VWAP and base volume are carried."));
  assert.ok(!/any price-like key/.test(method), "the guard does not refuse every price-like key (the VWAP is a price, and it is carried)");
});
