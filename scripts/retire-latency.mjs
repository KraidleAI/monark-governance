// scripts/retire-latency.mjs -- the latency of a retire, measured (ENGINE-ROW-RETIRE-PATH-1, lot R-b; draft G0 4.5): ADR 0006 D6 serves no
// wave 2 row "before ENGINE-ROW-RETIRE-PATH-1 is delivered and its latency measured". Node 24, no dependency.
//
//   node scripts/retire-latency.mjs <instants.json>
//
// It reads the seven UTC instants of one retire cycle, T_a to T_g (INSTANTS, each with its definition), and prints a closed report: the
// instants, the step from each to the next, T_g - T_a against the ceiling of 14 days (Q-E6 of MONARK's EPOCH reading, Q-R6), and the
// objective of 3 business days (the time from Monday to Friday, UTC; no holiday calendar), reported, never blocking. The input is closed:
// {"format": "retire-latency-v1", "cycle": "rehearsal" | "real", "instants": {"T_a": "<YYYY-MM-DDTHH:MM:SSZ>", ..., "T_g": ...},
// "mention": null | "<where the overrun is written down>"}; D6 is held once both cycles are in the JOURNAL (Q-R1). Refused (exit 1), each by
// its code: format_invalid, instant_missing (absent, or not a real UTC instant), order_not_monotone (an instant before the one above it),
// ceiling_unmentioned (over 14 days, no mention). Exit 2: usage. No clock and no network: the report is a function of its input.
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
export const CEILING_DAYS = 14, OBJECTIVE_BUSINESS_DAYS = 3;
const DAY = 86_400_000, UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, KEYS = ["format", "cycle", "instants", "mention"];

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
  const no = (code, detail) => { throw new LatencyError(code, detail); }, obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (!obj(input) || Object.keys(input).length !== KEYS.length || !KEYS.every((k) => Object.hasOwn(input, k)) || input.format !== "retire-latency-v1" || !["rehearsal", "real"].includes(input.cycle)
    || !obj(input.instants) || Object.keys(input.instants).some((k) => !INSTANTS.some(([n]) => n === k)) || !(input.mention === null || (typeof input.mention === "string" && input.mention.trim() !== ""))) {
    no("format_invalid", "retire-latency-v1 holds format, cycle (rehearsal or real), instants (T_a to T_g only) and mention (null or a text), nothing else");
  }
  const at = INSTANTS.map(([name, definition]) => {
    const s = input.instants[name], t = typeof s === "string" && UTC.test(s) ? Date.parse(s) : NaN;
    if (!Number.isFinite(t) || new Date(t).toISOString() !== s.replace("Z", ".000Z")) no("instant_missing", `${name} (${definition}) is absent or not a real UTC instant YYYY-MM-DDTHH:MM:SSZ`);
    return { name, at: s, definition, t };
  });
  for (let i = 1; i < at.length; i++) if (at[i].t < at[i - 1].t) no("order_not_monotone", `${at[i].name} ${at[i].at} is before ${at[i - 1].name} ${at[i - 1].at}`);
  const total = at[6].t - at[0].t, exceeded = total > CEILING_DAYS * DAY, business = businessMs(at[0].t, at[6].t);
  if (exceeded && input.mention === null) no("ceiling_unmentioned", `T_g - T_a is ${String(total)} ms, over ${String(CEILING_DAYS)} days, and no mention says where the overrun is written down`);
  return {
    format: "retire-latency-report-v1", cycle: input.cycle, instants: at.map(({ name, at: s, definition }) => ({ name, at: s, definition })),
    steps_ms: at.slice(1).map((x, i) => ({ from: at[i].name, to: x.name, ms: x.t - at[i].t })), total_ms: total,
    ceiling: { days: CEILING_DAYS, exceeded, mention: input.mention },
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
    console.log(`retire-latency OK: ${r.cycle} cycle, T_g - T_a ${String(r.total_ms)} ms, ceiling ${r.ceiling.exceeded ? "exceeded, mentioned" : "held"}, objective ${r.objective.met ? "met" : "not met (reported only)"}`);
    return 0;
  } catch (e) {
    console.error(`retire-latency REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = main(process.argv.slice(2)); // as scripts/red-proof.mjs: a launch through a link runs main, an import none
