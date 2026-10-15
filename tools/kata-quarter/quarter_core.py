# claude-opus-5-5 - 2026-10-15 - the core of the quarter counts tool, tools/kata-quarter/ (CM-5), Python 3.14 standard library only, no
# network; a sibling module of quarter_counts.py, no block __main__. For each region row of a wave 1 registry and the quarter Q_k, it
# counts n_test, k_test, drops.label and out_input on the merged reads of quarter_load, with the frozen tool's functions imported, never
# copied: kata_lib's bars, windows, labels and grid (decision_times) under a pose of its three globals REC_START, REC_END and BLOCKS,
# restored in a finally; recalc_p2.sigma_hat and recalc_p2.cells_of. The out/drop/in classification and the score are written again for
# the block Q, since recalc_p2.decisions_for codes its three blocks and point is a closure of calibrate_cell (recalc_p2.py l.158-176,
# l.272-288): out when sigma_hat is not computable (an input window incomplete), drop when the label is not formed or its window
# [t, t + h) meets a halt [E, R) (rule 8 (a)), else in, a miss strictly above qhat. The halts come from the reads (the loader of rule 8
# gives them; that of c1a gives none) and are joined first into venue instances: a halt seen on every symbol read, with the same
# missing candles and the same resumption, is one interval, E the earliest and R the latest, applied to each symbol.
import hashlib
import json

import io_guard
import kata_lib as K
import quarter_load as Q
import recalc_p2

DAY_MS = 86_400_000


def registry_rows(path, pin):
    """The region rows of a wave 1 registry read under the role registry, refused before parsing unless its sha256 is the pin: each
    with its cell of recalc_p2.cells_of (kind, kata, side) and its symbol folder, the stem of its task class."""
    data = io_guard.read("registry", path)
    got = hashlib.sha256(data).hexdigest()
    if got != pin:
        raise Q.Refused(f"registry refused before parsing: sha256 {got} differs from the pinned {pin}")
    out = []
    for r in json.loads(data.decode("utf-8"))["rows"]:
        if r["status"] != "region":
            continue
        folder = r["taskClass"].split("-")[0]
        cell = next((c for c in recalc_p2.cells_of(r["symbol"], folder, r["horizon"]) if (c["taskClass"], c["key"]) == (r["taskClass"], r["key"])), None)
        if cell is None or cell["kind"] == "dir" or cell["kata"] != r["kataId"] or r["W"] != K.W[r["kataId"]] or r["calibAttempt"] != 1 \
                or K.seq_sha256(r["hourOfWeekFactors"]) != r["factorTableSha256"] or type(r["calib"]["qhat"]) not in (int, float):
            raise Q.Refused(f"row {r['taskClass']} {r['key']}: not a band or path cell of wave 1 at attempt 1 with its W, its factor table "
                            "and a qhat")
        out.append((r, cell, folder))
    if not out:
        raise Q.Refused("no region row in the registry: nothing to count")
    return out


def lookback(rows):
    """The longest input window of the rows counted, W bars of h, in ms."""
    return max(K.W[cell["kata"]] * K.H_MS[r["horizon"]] for r, cell, _ in rows)


def venue_halts(reads):
    """reads: {folder: (read 1, read 2, merged)}. The halts of the reads, joined into venue instances (S22 l.95-97): a halt seen on
    every symbol read with the same missing candles (the declared slots in [E, R)) and the same resumption (the first grid slot at or
    after R) is one interval, E the earliest and R the latest; any other halt stays its symbol's. Returns {folder: [(E, R)]} and the
    intervals printed, each with the folders it applies to."""
    groups = {}
    for sym, rs in reads.items():
        for r in rs[:2]:
            for e, end in r.get("halts", ()):
                key = (tuple(sorted(t for t in r["declared"] if e <= t < end)), -(-end // K.STEP_MS) * K.STEP_MS)
                groups.setdefault(key, []).append((sym, e, end))
    on, shown = {sym: [] for sym in reads}, []
    for g in groups.values():
        syms, es, rs = [s for s, _, _ in g], [e for _, e, _ in g], [x for _, _, x in g]
        for e, x, ss in [(min(es), max(rs), sorted(syms))] if sorted(syms) == sorted(reads) else [(e, x, [s]) for s, e, x in g]:
            shown.append({"start_ms": e, "end_ms": x, "symbols": ss})
            for s in ss:
                on[s].append((e, x))
    return on, sorted(shown, key=lambda i: (i["start_ms"], i["symbols"]))


def count_row(row, cell, candles, bars, grid, halts):
    """The counts of one row on its grid: out (sigma_hat not computable), drop (label not formed, or its window meets a halt), in."""
    h, kid, table, qhat = K.H_MS[row["horizon"]], cell["kata"], row["hourOfWeekFactors"], row["calib"]["qhat"]
    c = {"n_test": 0, "k_test": 0, "drops_label": 0, "out_input": 0}
    for t in grid:
        win = K.window_at(bars, t, K.W[kid], h)
        sh = recalc_p2.sigma_hat({"t": t, "v": {kid: K.NE if win is None else K.KATA_FUNCS[kid](win)}}, kid, table, h)
        if sh == K.NE:
            c["out_input"] += 1
            continue
        _y, r, d, u = K.labels_at(candles, bars, t, h)
        lab = r if cell["kind"] == "range" else (d if cell["side"] == "down" else u)
        if lab is None or any(t < x and e < t + h for e, x in halts):
            c["drops_label"] += 1
            continue
        c["n_test"] += 1
        c["k_test"] += (abs(lab) if cell["kind"] == "range" else lab) / sh > qhat  # one binary64 division, as calibrate_cell scores
    return c


def count(reads, rows, k):
    """The counts of every row on Q_k, from the merged reads of each folder, under the pose of kata_lib's globals for the quarter."""
    s_k, e_k = Q.quarter(k)
    look, (halts, shown) = lookback(rows), venue_halts(reads)
    saved, out, bars = (K.REC_START, K.REC_END, K.BLOCKS), [], {}
    try:  # REC_START: S_k minus the longest window, at the 00:00Z before it; the bars built and read under this one pose
        K.REC_START, K.REC_END, K.BLOCKS = (s_k - look) // DAY_MS * DAY_MS, e_k, {"Q": (s_k, e_k)}
        pose = {"rec_start": Q.iso(K.REC_START), "rec_end": Q.iso(K.REC_END), "lookback_hours": look // 3_600_000}
        grids = {h: K.decision_times("Q", K.H_MS[h]) for h in sorted({r["horizon"] for r, _, _ in rows})}
        for r, cell, f in rows:
            if (f, r["horizon"]) not in bars:
                bars[(f, r["horizon"])] = K.build_bars(reads[f][2]["candles"], K.H_MS[r["horizon"]])
            c = count_row(r, cell, reads[f][2]["candles"], bars[(f, r["horizon"])], grids[r["horizon"]], halts[f])
            out.append({"task_class": r["taskClass"], "key": r["key"], "calib_attempt": r["calibAttempt"], "alpha": r["alpha"],
                        "horizon": r["horizon"], **c})
    finally:
        K.REC_START, K.REC_END, K.BLOCKS = saved
    grid = {h: {"instants": len(g), "first": Q.iso(g[0]), "last": Q.iso(g[-1])} for h, g in grids.items()}
    return {"pose": pose, "grid": grid, "halts": shown, "rows": out}
