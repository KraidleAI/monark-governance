# claude-opus-5-5 - 2026-10-15 - the core of the quarter counts tool, tools/kata-quarter/ (CM-5), Python 3.14 standard library only, no
# network; a sibling module of quarter_counts.py, no block __main__. For each region row of a wave 1 registry and the quarter Q_k, it
# counts n_test, k_test, drops.label and out_input on the merged reads of quarter_load, with the frozen tool's functions imported, never
# copied: kata_lib's bars, windows, labels and grid (decision_times) under a pose of its three globals REC_START, REC_END and BLOCKS,
# restored in a finally; recalc_p2.sigma_hat and recalc_p2.cells_of. The out/drop/in classification and the score are written again for
# the block Q, since recalc_p2.decisions_for codes its three blocks and point is a closure of calibrate_cell (recalc_p2.py l.158-176,
# l.272-288): out when sigma_hat is not computable (an input window incomplete), drop when the label is not formed or its window
# [t, t + h) meets a halt [E, R) (rule 8 (a)), else in, a miss strictly above qhat. The halts come from the merged read of each folder
# (quarter_load: rules 8 and 8 bis on both reads) and are joined first into venue instances: a halt seen on every symbol of the venue (the symbol
# folders of every row of the registry), with the same missing candles and the same resumption, is one interval, E the earliest and R
# the latest, applied to each symbol. After the count, kata_lib's globals must be those before it (L-T0a), or the run is refused.
import contextlib
import hashlib
import json
import math

import compare_p2
import io_guard
import kata_lib as K
import quarter_load as Q
import recalc_p2
import report

DAY_MS = 86_400_000


def registry_rows(path, pin, every=False):
    """The region rows of a wave 1 registry read under the role registry, refused before parsing unless its sha256 is the pin: each
    with its cell of recalc_p2.cells_of (kind, kata, side) and its symbol folder, the stem of its task class; and the venue's symbol
    folders, those of every row (the instance is formed once the venue's symbols are loaded, plan section 3.4); every: any status."""
    data = io_guard.read("registry", path)
    got = hashlib.sha256(data).hexdigest()
    if got != pin:
        raise Q.Refused(f"registry refused before parsing: sha256 {got} differs from the pinned {pin}")
    out, rows = [], json.loads(data.decode("utf-8"))["rows"]
    for r in rows:
        folder = r["taskClass"].split("-")[0]
        if r["status"] != "region" if not every else r["kataId"] not in K.SCALE_KATAS or r["calib"]["qhat"] is None:
            continue
        cell = next((c for c in recalc_p2.cells_of(r["symbol"], folder, r["horizon"]) if (c["taskClass"], c["key"]) == (r["taskClass"], r["key"])), None)
        if cell is None or cell["kind"] == "dir" or cell["kata"] != r["kataId"] or r["W"] != K.W[r["kataId"]] or r["calibAttempt"] != 1 \
                or K.seq_sha256(r["hourOfWeekFactors"]) != r["factorTableSha256"] or type(r["calib"]["qhat"]) not in (int, float):
            raise Q.Refused(f"row {r['taskClass']} {r['key']}: not a band or path cell of wave 1 at attempt 1 with its W, its factor table "
                            "and a qhat")
        out.append((r, cell, folder))
    if not out:
        raise Q.Refused("no region row in the registry: nothing to count")
    return out, sorted({r["taskClass"].split("-")[0] for r in rows})


def kata_lib_state():
    """kata_lib's globals as L-T0a reads them: a container copied (dict, list, tuple, nested), a number, a string or None as it is, any
    other object (a module, a function) by its id and type; dunder names left out."""
    def cp(v):
        if isinstance(v, dict):
            return {k: cp(x) for k, x in v.items()}
        if isinstance(v, (list, tuple)):
            return type(v).__name__, [cp(x) for x in v]
        return v if isinstance(v, (int, float, str, type(None))) else (id(v), type(v).__name__)
    return {k: cp(v) for k, v in vars(K).items() if not k.startswith("__")}


def lookback(rows):
    """The longest input window of the rows counted, W bars of h, in ms."""
    return max(cell.get("look") or K.W[cell["kata"]] * K.H_MS[r["horizon"]] for r, cell, _ in rows)  # a wave 2b row: its own (lot c4b)


def venue_halts(reads, venue):
    """reads: {folder: (read 1, read 2, merged)}; venue: the venue's symbol folders. The halts of the reads, joined into venue
    instances (S22 l.95-97): a halt seen on every symbol of the venue with the same missing candles (the declared slots in [E, R)) and
    the same resumption (the first grid slot at or after R) is one interval, E the earliest and R the latest; any other halt stays its
    symbol's. Returns {folder: [(E, R)]} and the intervals printed, each with the folders it applies to."""
    groups = {}
    for sym, rs in reads.items():
        for r in rs[2:]:  # the merged read: the halts of both reads, taken across the seam
            for e, end in r["halts"]:
                key = (tuple(sorted(t for t in r["declared"] if e <= t < end)), -(-end // K.STEP_MS) * K.STEP_MS)
                groups.setdefault(key, []).append((sym, e, end))
    on, shown = {sym: [] for sym in reads}, []
    for g in groups.values():
        syms, es, rs = [s for s, _, _ in g], [e for _, e, _ in g], [x for _, _, x in g]
        for e, x, ss in [(min(es), max(rs), sorted(syms))] if sorted(syms) == sorted(venue) else [(e, x, [s]) for s, e, x in g]:
            shown.append({"start_ms": e, "end_ms": x, "symbols": ss})
            for s in ss:
                on[s].append((e, x))
    return on, sorted(shown, key=lambda i: (i["start_ms"], i["symbols"]))


def count_row(row, cell, candles, bars, grid, halts):
    """The decision of one row at each instant of its grid: out (sigma_hat not computable), drop (label not formed, or its window meets
    a halt), else covered, or miss when the score is strictly above qhat."""
    h, kid, table, qhat = K.H_MS[row["horizon"]], cell["kata"], row.get("hourOfWeekFactors"), row["calib"]["qhat"]  # a wave 2b row has none
    out = []
    for t in grid:
        win = None if "sigma" in cell else K.window_at(bars, t, K.W[kid], h)  # a wave 2b row: its sigma_hat (quarter_2b.row)
        sh = cell["sigma"](t, candles, bars) if "sigma" in cell else recalc_p2.sigma_hat({"t": t, "v": {kid: K.NE if win is None else K.KATA_FUNCS[kid](win)}}, kid, table, h)
        if sh == K.NE:
            out.append("out")
            continue
        _y, r, d, u = K.labels_at(candles, bars, t, h)
        lab = r if cell["kind"] == "range" else (d if cell["side"] == "down" else u)
        if lab is None or any(t < x and e < t + h for e, x in halts):
            out.append("drop")
            continue
        out.append("miss" if (abs(lab) if cell["kind"] == "range" else lab) / sh > qhat else "covered")  # one binary64 division, as calibrate_cell
    return out


def tally(grid, decisions):
    """n_test, k_test, drops.label and out_input of one row from its decisions, and n and k by calendar month (test.months)."""
    c, months = {"n_test": 0, "k_test": 0, "drops_label": 0, "out_input": 0}, {}
    for t, d in zip(grid, decisions):
        c[{"out": "out_input", "drop": "drops_label"}.get(d, "n_test")] += 1
        if d in ("covered", "miss"):
            m = months.setdefault(recalc_p2.month_of(t), {"n": 0, "k": 0})
            m["n"], m["k"], c["k_test"] = m["n"] + 1, m["k"] + (d == "miss"), c["k_test"] + (d == "miss")
    return {**c, "months": months}


@contextlib.contextmanager
def posed(rec_start, rec_end, blocks):
    """kata_lib's three globals posed for one block, restored after it whatever happens."""
    saved = (K.REC_START, K.REC_END, K.BLOCKS)
    try:
        K.REC_START, K.REC_END, K.BLOCKS = rec_start, rec_end, blocks
        yield
    finally:
        K.REC_START, K.REC_END, K.BLOCKS = saved


def count(reads, rows, span, venue):
    """The counts of every row on the block span = (S_k, E_k), from the merged reads of each folder, under the pose of kata_lib's globals
    for it, by two passes of report.setting of the frozen tool (docs/G0-lot-cm5-c1c.md): "ln", the port fdlibm_log, the log of V8 under
    which the registry was made and the band is served, decides; "base", math.log, gives the decisions that differ ("differ"), which stop
    nothing. After each pass kata_lib's globals are those before it, math included. "log": the census of the log as report.run_passes
    counts it, the inputs of the port, those on which math.log differs, the largest distance in ulps."""
    s_k, e_k = span
    look, (halts, shown), before = lookback(rows), venue_halts(reads, venue), kata_lib_state()
    memo, bars, passes = {}, {}, {}
    with posed((s_k - look) // DAY_MS * DAY_MS, e_k, {"Q": (s_k, e_k)}):  # REC_START: S_k minus the longest window, at the 00:00Z before it
        pose = {"rec_start": Q.iso(K.REC_START), "rec_end": Q.iso(K.REC_END), "lookback_hours": look // 3_600_000}
        grids = {h: K.decision_times("Q", K.H_MS[h]) for h in sorted({r["horizon"] for r, _, _ in rows})}
        for r, cell, f in rows:
            if (f, r["horizon"]) not in bars:
                bars[(f, r["horizon"])] = K.build_bars(reads[f][2]["candles"], K.H_MS[r["horizon"]])
        held = kata_lib_state()
        for name in ("ln", "base"):
            with report.setting(name, memo):
                passes[name] = [count_row(r, cell, reads[f][2]["candles"], bars[(f, r["horizon"])], grids[r["horizon"]], halts[f]) for r, cell, f in rows]
            if kata_lib_state() != held:
                raise Q.Refused(f"kata_lib's globals are not those before the pass {name}: math not restored, or a global changed in place")
    if kata_lib_state() != before:
        raise Q.Refused("kata_lib's globals are not those before the count: the pose not restored, or a global changed in place")
    out, differ = [], []
    for (r, _, _), mine, other in zip(rows, passes["ln"], passes["base"]):
        g = grids[r["horizon"]]
        out.append({"task_class": r["taskClass"], "key": r["key"], "calib_attempt": r["calibAttempt"], "alpha": r["alpha"], "horizon": r["horizon"], **tally(g, mine)})
        differ += [f"{r['taskClass']} {r['key']} {Q.iso(t)}: fdlibm_log {a}, math.log {b}" for t, a, b in zip(g, mine, other) if a != b]
    host = {x: math.log(x) for x in memo if x > 0 and math.isfinite(x)}  # the ratios of positive prices, as report.run_passes counts them
    apart = [x for x in host if not report.same_bits(host[x], memo[x])]
    log = {"decides": "fdlibm_log", "inputs": len(memo), "inputs_differing": len(apart), "decisions_differing": len(differ),
           "max_ulps": max((compare_p2.ulps(host[x], memo[x]) for x in apart), default=0)}
    grid = {h: {"instants": len(g), "first": Q.iso(g[0]), "last": Q.iso(g[-1])} for h, g in grids.items()}
    return {"pose": pose, "grid": grid, "halts": shown, "rows": out, "log": log, "differ": differ}
