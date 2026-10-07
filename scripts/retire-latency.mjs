// scripts/retire-latency.mjs -- the latency of a retire, measured (ENGINE-ROW-RETIRE-PATH-1, lot R-b; draft G0 4.5): ADR 0006 D6 serves no
// wave 2 row "before ENGINE-ROW-RETIRE-PATH-1 is delivered and its latency measured". Node 24, no dependency.
//
//   node scripts/retire-latency.mjs <instants.json>
//
// It reads the UTC instants of one cycle, T_a to T_g (INSTANTS, each with its definition), and prints a closed report: the instants, the
// step from each to the next, the span against the ceiling of 14 days (Q-E6 of MONARK's EPOCH reading, Q-R6), and the objective of 3
// business days (Monday to Friday, UTC; no holiday calendar), reported, never blocking. Closed input: {"format": "retire-latency-v1", "cycle":
// "rehearsal" | "real" | "publication", "instants": {"T_a": "<YYYY-MM-DDTHH:MM:SSZ>", ..., "T_g": ...}, "mention": null | "<where the overrun is
// written down>"}. A publication cycle (Q-RL-2) holds T_c to T_g only, no ceiling (no T_a), never a retirement. Refused (exit 1) by code:
// format_invalid, instant_out_of_cycle (T_a or T_b in a publication), instant_missing (absent, or not a real UTC instant), order_not_monotone
// (an instant before the one above it), ceiling_unmentioned (over 14 days, no mention). Exit 2: usage. No clock, no network: input only.
import { readFileSync } from "node:fs";

export const INSTANTS = Object.freeze([
  ["T_a", "trigger: the close of the quarter (00:00 UTC of the first day after it) for live:<k>, or the date of the adr: line"],
  ["T_b", "the retire list committed"],
  ["T_c", "the table generated, its CI guard green"],
  ["T_d", "the dated directory published (push of the spec repository)"],
  ["T_e", "the harness pull request merged"],
  ["T_f", "deployed"],
  ["T_g", "the first served verdict that carries the new policy_table_sha256 (probe on the host)"],
].map((x) => Object.freeze(x)));
export const CEILING_DAYS = 14, OBJECTIVE_BUSINESS_DAYS = 3, NO_CEILING = "not applicable: a publication cycle has no T_a (Q-RL-2), it is not a retirement";
const DAY = 86_400_000, UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, KEYS = ["format", "cycle", "instants", "mention"], CYCLES = ["rehearsal", "real", "publication"];

export class LatencyError extends Error {
  constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; }
}

/** businessMs(a, b) -> the milliseconds of [a, b) that fall from Monday to Friday, UTC. */
export function businessMs(a, b) {
  let ms = 0;
  for (let t = a; t < b;) { const next = Math.min(b, (Math.floor(t / DAY) + 1) * DAY), day = new Date(t).getUTCDay(); if (day !== 0 && day !== 6) ms += next - t; t = next; }
  return ms;
}

/** report(input) -> the closed report of one cycle; throws a LatencyError, by its code, on any refusal. */
export function report(input) {
  const no = (code, detail) => { throw new LatencyError(code, detail); }, obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v), pub = obj(input) && input.cycle === "publication";
  if (!obj(input) || Object.keys(input).length !== KEYS.length || !KEYS.every((k) => Object.hasOwn(input, k)) || input.format !== "retire-latency-v1" || !CYCLES.includes(input.cycle)
    || !obj(input.instants) || Object.keys(input.instants).some((k) => !INSTANTS.some(([n]) => n === k)) || !(input.mention === null || (typeof input.mention === "string" && input.mention.trim() !== ""))) {
    no("format_invalid", "retire-latency-v1 holds format, cycle (rehearsal, real or publication), instants (T_a to T_g only) and mention (null or a text), nothing else");
  } if (pub) for (const k of ["T_a", "T_b"]) if (Object.hasOwn(input.instants, k)) no("instant_out_of_cycle", `${k} has no place in a publication cycle, which holds T_c to T_g only`);
  const at = (pub ? INSTANTS.slice(2) : INSTANTS).map(([name, definition]) => {
    const s = input.instants[name], t = typeof s === "string" && UTC.test(s) ? Date.parse(s) : NaN;
    if (!Number.isFinite(t) || new Date(t).toISOString() !== s.replace("Z", ".000Z")) no("instant_missing", `${name} (${definition}) is absent or not a real UTC instant YYYY-MM-DDTHH:MM:SSZ`);
    return { name, at: s, definition, t };
  });
  for (let i = 1; i < at.length; i++) if (at[i].t < at[i - 1].t) no("order_not_monotone", `${at[i].name} ${at[i].at} is before ${at[i - 1].name} ${at[i - 1].at}`);
  const last = at[at.length - 1].t, total = last - at[0].t, exceeded = !pub && total > CEILING_DAYS * DAY, business = businessMs(at[0].t, last);
  if (exceeded && input.mention === null) no("ceiling_unmentioned", `T_g - T_a is ${String(total)} ms, over ${String(CEILING_DAYS)} days, and no mention says where the overrun is written down`);
  return {
    format: "retire-latency-report-v1", cycle: input.cycle, instants: at.map(({ name, at: s, definition }) => ({ name, at: s, definition })),
    steps_ms: at.slice(1).map((x, i) => ({ from: at[i].name, to: x.name, ms: x.t - at[i].t })), total_ms: total,
    ceiling: pub ? { days: CEILING_DAYS, applies: false, reason: NO_CEILING, mention: input.mention } : { days: CEILING_DAYS, exceeded, mention: input.mention },
    objective: { business_days: OBJECTIVE_BUSINESS_DAYS, business_ms: business, met: business <= OBJECTIVE_BUSINESS_DAYS * DAY },
  };
}

export function main(argv) {
  if (argv.length !== 1 || argv[0].startsWith("-")) { console.error("usage: retire-latency.mjs <instants.json>"); return 2; }
  try {
    let input;
    try { input = JSON.parse(readFileSync(argv[0], "utf8")); } catch (e) { throw new LatencyError("format_invalid", `${argv[0]}: ${e instanceof Error ? e.message : String(e)}`); }
    const r = report(input);
    console.log(JSON.stringify(r, null, 2));
    console.log(`retire-latency OK: ${r.cycle} cycle, T_g - ${r.instants[0].name} ${String(r.total_ms)} ms, ceiling ${"reason" in r.ceiling ? r.ceiling.reason : r.ceiling.exceeded ? "exceeded, mentioned" : "held"}, objective ${r.objective.met ? "met" : "not met (reported only)"}`);
    return 0;
  } catch (e) {
    console.error(`retire-latency REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = main(process.argv.slice(2)); // as scripts/red-proof.mjs: a launch through a link runs main, an import none
