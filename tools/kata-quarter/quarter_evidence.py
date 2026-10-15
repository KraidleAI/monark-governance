# claude-opus-5-5 - 2026-10-15 - the evidence of the quarter counts tool, tools/kata-quarter/ (CM-5, docs/G0-lot-cm5-c2.md), Python 3.14
# standard library only, no network; a sibling module of quarter_counts.py, no block __main__. From the counts of quarter_core on Q_k it
# builds the evidence of the quarter, format kata-quarter-counts-v1, closed (EVIDENCE_KEYS, ROW_KEYS, LOG_KEYS, the series' keys and the
# identity block): for each counted row its key, alpha, horizon, n_test, k_test, drops_label and out_input, its u_test (quarter_oracle.
# u_test, the one that the oracle act holds to the registry: binom_exact.miss_upper_bound under recalc_p2.DELTA, "1" when every point
# misses, null with no point) and fires (binom_exact.binom_upper_tail_leq at the row's alpha under DELTA, the veto of
# recalc_p2.calibrate_cell); the pins of the registry and of the two reads of each symbol (the sealed series and the record of the
# quarter), the halts applied, the grid, the pose and the census of the log in counts (its largest distance in ulps, unbounded, stays on
# the line of count); apart, the identity block (the commit and the digests of both trees). No price, no instant of a miss, no month of
# the misses: integers, ASCII strings, booleans and null. Written by report.canonical of the frozen tool (sorted keys, no space, no line
# feed; a double or a string that is not ASCII stops the run) into <out>/quarter-<k>.json, an output of the run. A quarter whose LIVE
# read accounts for no slot up to E_k is open: refused by name.
import hashlib
import os

import binom_exact as E
import quarter_load as Q
import quarter_oracle as O
import recalc_p2
import report as R

FORMAT = "kata-quarter-counts-v1"
EVIDENCE_KEYS = ("format", "quarter", "registry_sha256", "series", "halts", "grid", "pose", "log", "rows", "identity")
LOG_KEYS = ("decides", "inputs", "inputs_differing", "decisions_differing")
ROW_KEYS = ("task_class", "key", "calib_attempt", "alpha", "horizon", "n_test", "k_test", "u_test", "fires", "drops_label", "out_input")


def closed(read, e_k):
    """The LIVE read of a closed quarter: the end of its last slot accounted for (a candle present or a slot declared missing) is E_k;
    else the quarter is open (not over, or not recorded to its end), a named refusal before the merge."""
    series_end = max([*read["candles"], *read["declared"]], default=read["range"][0] - Q.K.STEP_MS) + Q.K.STEP_MS
    if not series_end >= e_k:
        raise Q.Refused(f"quarter open: the LIVE series of {read['sym']} accounts for no slot from {Q.iso(series_end)}, before E_k "
                        f"{Q.iso(e_k)}: a quarter is counted once it is over and recorded to its end")
    return read


def fires(n, k, alpha):
    """A row fires on Q_k when P(Bin(n, alpha) >= k) <= DELTA, exact: the veto of the TEST block at the row's alpha."""
    return E.binom_upper_tail_leq(n, k, alpha, recalc_p2.DELTA)


def evidence(res, ident):
    """The evidence of the quarter from the result of quarter_core.count completed by the entry (quarter, registry_sha256, series), and
    the identity block from the line identity (commit, kata_recalc_tree_sha256, kata_quarter_manifest_sha256)."""
    rows = [{**r, "u_test": O.u_test(r["n_test"], r["k_test"]), "fires": fires(r["n_test"], r["k_test"], r["alpha"])} for r in res["rows"]]
    series = {f: {"sealed_sha256": s["sealed"], "quarter_sha256": s["live"], "gaps": s["gaps"]} for f, s in res["series"].items()}
    parts = {**res, "format": FORMAT, "series": series, "log": {x: res["log"][x] for x in LOG_KEYS},
             "rows": [{x: r[x] for x in ROW_KEYS} for r in rows], "identity": dict(zip(O.IDENT, ident))}
    return {x: parts[x] for x in EVIDENCE_KEYS}


def write(out, k, ev):
    """The evidence written by report.canonical into <out>/quarter-<k>.json (out declared to io_guard): its name and its sha256."""
    text, name = R.canonical(ev), f"quarter-{k}.json"
    if not os.path.isdir(out):
        os.mkdir(out)
    with open(os.path.join(out, name), "w", encoding="ascii", newline="\n") as fh:
        fh.write(text)
    return name, hashlib.sha256(text.encode("ascii")).hexdigest()
