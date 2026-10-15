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
# read accounts for no slot up to E_k is open: refused by name. Lot c2b: the pin of the served history read, each row's service in Q_k
# (served_from, served_to, served_tables), each symbol's completeness in counts (present, expected, complete: 1000 present >= 999 expected) and each
# row's prudent variant (CM5-COMPLETENESS-1: n_test + d, k_test + d, d its drops and instants out, its fire within LIVE_N_MAX); the
# file is written whole or not at all (a .part renamed); vectors() makes the L-T7 vectors of the TS guard's vetoFires and uTest.
import hashlib
import os

import binom_exact as E
import quarter_load as Q
import quarter_oracle as O
import recalc_p2
import report as R

FORMAT = "kata-quarter-counts-v1"
EVIDENCE_KEYS = ("format", "quarter", "registry_sha256", "served_history_sha256", "series", "halts", "grid", "pose", "log", "rows", "identity")
LOG_KEYS = ("decides", "inputs", "inputs_differing", "decisions_differing")
ROW_KEYS = ("task_class", "key", "calib_attempt", "alpha", "horizon", "n_test", "k_test", "u_test", "fires", "drops_label", "out_input",
            "served_from", "served_to", "served_tables", "prudent")
LIVE_N_MAX = {"1h": 2208, "4h": 552}  # apps/harness/src/policy-wave2.ts l.16, the longest quarter


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
    rows = [{**r, "u_test": O.u_test(r["n_test"], r["k_test"]), "fires": fires(r["n_test"], r["k_test"], r["alpha"]), "prudent": prudent(r)} for r in res["rows"]]
    series = {f: {"sealed_sha256": s["sealed"], "quarter_sha256": s["live"], "gaps": s["gaps"], "present": s["present"], "expected": s["expected"],
                  "complete": 1000 * s["present"] >= 999 * s["expected"]} for f, s in res["series"].items()}
    parts = {**res, "format": FORMAT, "series": series, "log": {x: res["log"][x] for x in LOG_KEYS},
             "rows": [{x: r[x] for x in ROW_KEYS} for r in rows], "identity": dict(zip(O.IDENT, ident))}
    return {x: parts[x] for x in EVIDENCE_KEYS}


def prudent(r):
    """CM5-COMPLETENESS-1: the coherent pair (n_test + d, k_test + d), d the drops and the instants out (each taken for a miss), and its
    fire, "out_of_domain" above LIVE_N_MAX of the row's horizon."""
    d = r["drops_label"] + r["out_input"]
    n, k = r["n_test"] + d, r["k_test"] + d
    return {"n_test": n, "k_test": k, "fires": fires(n, k, r["alpha"]) if n <= LIVE_N_MAX[r["horizon"]] else "out_of_domain"}


def vectors():
    """The L-T7 vectors: for each horizon and each n from 1 to LIVE_N_MAX, k* the least k that fires at alpha 0.01, and [n, k, u_test,
    fires] for k = k* - 1, k*, k* + 1 within 0 <= k <= n (u_test of quarter_oracle, fires of this module)."""
    rows = {}
    for h, top in LIVE_N_MAX.items():
        rows[h] = []
        for n in range(1, top + 1):
            star = next(k for k in range(n + 1) if fires(n, k, "0.01"))
            rows[h] += [[n, k, O.u_test(n, k), fires(n, k, "0.01")] for k in (star - 1, star, star + 1) if 0 <= k <= n]
    return {"format": "kata-veto-vectors-v1", "alpha": "0.01", "delta": recalc_p2.DELTA, "vectors": rows}


def place(out, inputs):
    """The output folder judged before any input is read: its parent a folder, itself no link (nor a junction) and under no input folder."""
    real = os.path.realpath(out)
    if not os.path.isdir(os.path.dirname(out)) or os.path.islink(out) or os.path.isjunction(out) or any(real == d or real.startswith(d + os.sep) for d in map(os.path.realpath, inputs)):
        raise Q.Refused(f"the output folder {out}: its parent is not a folder, it is a link, or it lies in an input folder")


def write(out, name, value):
    """value written by report.canonical into <out>/<name> (out declared to io_guard), whole or not at all: <name>.part, then renamed
    (a write cut short leaves no file under the name); its name and its sha256."""
    text, part = R.canonical(value), os.path.join(out, f"{name}.part")
    if not os.path.isdir(out):
        os.mkdir(out)
    with open(part, "w", encoding="ascii", newline="\n") as fh:
        fh.write(text)
    os.rename(part, os.path.join(out, name))
    return name, hashlib.sha256(text.encode("ascii")).hexdigest()
