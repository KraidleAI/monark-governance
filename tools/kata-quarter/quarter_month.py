# claude-opus-5-5 - 2026-10-16 - the monthly reading of the quarter counts tool, tools/kata-quarter/ (CM-5, docs/G0-lot-cm5-e.md), Python
# 3.14 standard library only, no network; a sibling module of quarter_counts.py, no block __main__, reached by `month`. D6 of ADR 0006
# (addendum 9 point 7): the same rank on one UTC month, a report only, never a retire, never an entry of a retire list, never a cause.
# main takes the rows as count does (quarter_core.registry_rows, and the core registry through quarter_wave2.counted under the child rule
# of the month's quarter), keeps those that the served history, read under the role served-history, serves at an instant of the month,
# and reads each symbol twice, the read before the month (the record of the month before; for 2026-10 the sealed series of wave 1) and
# the month's record, merged under control (quarter_load); then quarter_core.count on the month, the count's own code, and on each row's
# counts the rank of the quarter: u_test (quarter_oracle.u_test) and the binomial rule (quarter_evidence.fires), written here as flags.
# It writes <out>/month-<YYYY-MM>.json, format kata-month-counts-v1, closed (MONTH_KEYS, ROW_KEYS), by report.canonical of the frozen tool
# (quarter_evidence.write): no key of a cause, of entries or of a fire, no top-level quarter. An output folder under a folder named
# retire, in any case, is refused by name before any input. Every refusal is the line REFUSED and exit 2, never a trace.
import json
import os
import re

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first
import quarter_core as C
import quarter_evidence as V
import quarter_identity as I
import quarter_load as Q
import quarter_oracle as O
import quarter_wave2 as W
import recalc_p2

MODEL = "claude-opus-5-5"
FORMAT = "kata-month-counts-v1"
MONTH_KEYS = ("format", "month", "registry_sha256", "served_history_sha256", "series", "halts", "grid", "pose", "log", "rows", "identity")
ROW_KEYS = ("task_class", "key", "calib_attempt", "alpha", "horizon", "n_test", "k_test", "u_test", "flags", "drops_label", "out_input",
            "served_from", "served_to", "served_tables")
USAGE = ("usage: python -E -S -s -B -P quarter_counts.py month <registry> <registry sha256> [<core registry> <core registry sha256>] "
         "<served history> <served history sha256> <series dir before> <month series dir> <YYYY-MM, from 2026-10> <out dir> "
         "<symbol folder>:<sha256 before | pinned, 2026-10 only>:<month sha256> ...")


def bounds(name):
    """The UTC month named YYYY-MM, from the month of S_1: its start, its end (exclusive), the range of the read before it (the month
    before; for the first month, the recording range of the sealed series of wave 1, quarter_load.sealed_range(1)) and its quarter k."""
    if not re.fullmatch("[0-9]{4}-(0[1-9]|1[0-2])", name):
        raise Q.Refused(f"month {name!r}: not a UTC month written YYYY-MM")
    i = int(name[:4]) * 12 + int(name[5:]) - 1 - (Q.FIRST[0] * 12 + Q.FIRST[1] - 1)  # the months after the month of S_1
    if i < 0:
        raise Q.Refused(f"month {name}: before S_1 {Q.iso(Q.quarter(1)[0])}; the monthly reading begins with the first quarter")
    s_m, e_m = Q._first_of(i), Q._first_of(i + 1)
    return s_m, e_m, Q.sealed_range(1) if i == 0 else (Q._first_of(i - 1), s_m), i // 3 + 1


def outside_retire(out):
    """The output folder under no folder named retire, in any case, as given and resolved: a monthly reading is never a retire list."""
    if any(p.casefold() == "retire" for x in (os.path.abspath(out), os.path.realpath(out)) for p in re.split(r"[\\/]", x)):
        raise Q.Refused(f"the output folder {out} lies under a folder named retire: a monthly reading is a report, never a retire list")


def closed(read, name, e_m):
    """The month's read of a closed month: the end of its last slot accounted for (a candle present or a slot declared missing) is the
    month's end; else the month is open (not over, or not recorded to its end), a named refusal before the merge."""
    end = max([*read["candles"], *read["declared"]], default=read["range"][0] - Q.K.STEP_MS) + Q.K.STEP_MS
    if end < e_m:
        raise Q.Refused(f"month open: the series of {read['sym']} for {name} accounts for no slot from {Q.iso(end)}, before its end "
                        f"{Q.iso(e_m)}: a month is read once it is over and recorded to its end")
    return read


def parse(args):
    """The arguments of month, in the two forms of count (the core registry and its pin after the registry's, or not), the quarter k
    replaced by the month YYYY-MM; no option. None: the usage."""
    if bad := [a for a in args if a.startswith("--")]:
        raise Q.Refused(f"{bad[0]}: not an option of month, which takes none: no call or traffic enters its counts")
    spec = lambda a: len(p := a.split(":")) == 3 and p[0].isascii() and p[0].isalnum() and (p[1] == "pinned" or O.hex64(p[1])) and O.hex64(p[2])  # noqa: E731
    for at in (6, 8):  # the place of the month: 6, or 8 after the core registry and its pin (a month is never a symbol spec)
        if len(args) > at + 2 and all(O.hex64(args[i]) for i in {1, at - 5, at - 3}) and all(map(spec, args[at + 2:])):
            p = [os.path.abspath(a) for a in args[:at + 2]]  # the pins and the month taken as they are
            return p[0], args[1], (p[2], args[3]) if at == 8 else None, p[at - 4], args[at - 3], p[at - 2], p[at - 1], args[at], p[at + 1], args[at + 2:]
    return None


def month(args, identity_line):
    """month: the reading of one UTC month, its report written and named, its lines printed; 0, or 2 on its usage."""
    got = parse(args)
    if got is None:
        print(USAGE, flush=True)
        return 2
    reg, pin, core, hist, hpin, before, during, name, out, specs = got
    io_guard.declare("series", "recorder", "registry", "served-history", "tool-tree")
    ident = I.tool_identity()
    s_m, e_m, prior, k = bounds(name)
    outside_retire(out)
    io_guard.output(out)
    V.place(out, (before, during))
    folders = {f: (p1, p2) for f, p1, p2 in (s.split(":") for s in specs)}
    (rows, venue), held = W.counted(*C.registry_rows(reg, pin), core, reg, pin, Q.quarter(k)[0]), Q.served_history(hist, hpin)
    service = {r["taskClass"]: Q.served_in(held.get(r["taskClass"], []), s_m, e_m) for r, _, _ in rows}
    rows = [x for x in rows if service[x[0]["taskClass"]]]
    if not rows:
        raise Q.Refused(f"no region row of the registry is served at an instant of the month {name} by the served history: nothing to read")
    if len(folders) != len(specs) or any(p1 == "pinned" for p1, _ in folders.values()) and prior != Q.sealed_range(1):
        raise Q.Refused("a symbol folder named twice, or 'pinned' for a month after 2026-10 (it names the sealed series of wave 1)")
    if sorted(folders) != venue:
        raise Q.Refused(f"the symbol folders named {sorted(folders)} are not the venue's {venue}, those of the registry's rows")
    look, reads = C.lookback(rows), {}
    for f, (p1, p2) in folders.items():
        first = Q.read_series(before, f, Q.sealed_pin(f) if p1 == "pinned" else p1, *prior)
        second = closed(Q.read_series(during, f, p2, s_m, e_m), name, e_m)
        reads[f] = (first, second, Q.merge(first, second, look))
    res = C.count(reads, rows, (s_m, e_m), venue)  # the count's own code on the month: grid, decisions, halts, both passes of the log
    out_rows = []
    for r in res["rows"]:
        span = service[r["task_class"]]
        x = {**r, "u_test": O.u_test(r["n_test"], r["k_test"]), "flags": V.fires(r["n_test"], r["k_test"], r["alpha"]),
             "served_from": Q.iso(span[0]), "served_to": Q.iso(span[1]), "served_tables": span[2]}
        out_rows.append({key: x[key] for key in ROW_KEYS})
    series = {f: {"before_sha256": r[0]["pin"], "month_sha256": r[1]["pin"], "gaps": sum(map(len, r[2]["gaps"].values())), "present": len(r[1]["candles"]),
                  "expected": (e_m - s_m) // Q.K.STEP_MS} for f, r in reads.items()}
    for s in series.values():
        s["complete"] = 1000 * s["present"] >= 999 * s["expected"]
    value = {"format": FORMAT, "month": {"name": name, "start": Q.iso(s_m), "end": Q.iso(e_m), "quarter": k}, "registry_sha256": pin,
             "core_registry_sha256": core and core[1], "served_history_sha256": hpin, "series": series, "halts": res["halts"], "grid": res["grid"],
             "pose": res["pose"], "log": {x: res["log"][x] for x in V.LOG_KEYS}, "rows": out_rows, "identity": dict(zip(O.IDENT, ident))}
    file, digest = V.write(out, f"month-{name}.json", {x: value[x] for x in MONTH_KEYS + ("core_registry_sha256",) * (core is not None)})
    differ = res.pop("differ")
    print("\n".join([MODEL, f"# quarter_counts.py month - the monthly reading of {name}, the rank of the quarter on a UTC month, a report only",
                     json.dumps(res, sort_keys=True, separators=(",", ":")), *(f"decision differs {d}" for d in differ),
                     f"math.log decisions that differ from the fdlibm_log pass, which decides: {len(differ)}", f"report {file} sha256 {digest}",
                     identity_line(ident), *io_guard.input_lines(), "VERDICT: GREEN"]), flush=True)
    return 0


def main(args, identity_line):
    """The subcommand month, from the entry: every refusal named on the line REFUSED, exit 2, never a trace."""
    try:
        return month(args, identity_line)
    except (Q.Refused, recalc_p2.Stop) as e:
        print(f"REFUSED: {e}", flush=True)
    except Exception as e:  # no trace: no source is read; the type and the message
        print(f"REFUSED: {type(e).__name__}: {e}", flush=True)
    return 2
