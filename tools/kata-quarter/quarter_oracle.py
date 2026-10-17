# claude-opus-5-5 - 2026-10-15 - the oracle acts of the quarter counts tool, tools/kata-quarter/ (CM-5, docs/G0-lot-cm5-c1c.md), Python
# 3.14 standard library only, no network; a sibling module of quarter_counts.py, no block __main__, reached by `check <act>`. Each act
# reads the sealed series of wave 1 (one folder per symbol, each under its pin) and writes one report, <out>/<act>.json: canonical JSON
# (report.canonical), ASCII, no path, no time, named by its sha256 on the line "report"; it compares under the rule of report.py l.9-13:
# every field compared here is a decision (an integer, a decimal string, a boolean, a map of them), held by strict equality, so any
# difference is not explained: listed, the report written, exit 1; exit 0 only when every field is equal. The acts:
#   original_values_byte_equal: two invocations. The first reassigns nothing and reads each series as the frozen tool reads it; the
#     second poses kata_lib's three globals at their original values (quarter_core.posed, the pose of count), and reads the first's
#     report under oracle-output, refused unless its sha256 is the pin given and its identity this one's. Each names the outputs of build_bars,
#     decision_times, window_at (each W) and labels_at on the TEST block by their sha256, by symbol and horizon: equal, or a difference.
#   equals_registry_on_test_block: the count on the TEST block (pose at its bounds) against the registry: nTest, kTest, test.months,
#     drops.test (the label drops only, plan l.421), UTest and vetoed (written as recalc_p2.calibrate_cell writes them), for every band and
#     path row that has a qhat, whatever its status, each named in result.rows.
#   pseudo_quarter_2026_07_09: the count on [2026-07-01, 2026-10-01) against the sum of the months 2026-07 to 2026-09 of test.months.
#   fdlibm_measure: the count on the TEST block; its report holds the census of the two logs on POPULATION and the decisions that differ.
#   equals_wave2_registry_on_its_blocks (L-O3, on_blocks), equals_wave2b_registry_on_its_blocks (L-O4, on_wave2b): rows on their blocks; host runs MONARK's.
import hashlib
import json
import os

import binom_exact as E
import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first
import kata_lib as K
import quarter_core as C
import quarter_identity as I
import quarter_load as Q, quarter_wave2 as W  # the reader of the core registry, for the act L-O3
import recalc_p2
import report

MODEL = "claude-opus-5-5"
ACTS = ("original_values_byte_equal", "equals_registry_on_test_block", "pseudo_quarter_2026_07_09", "fdlibm_measure", "equals_wave2_registry_on_its_blocks", "equals_wave2b_registry_on_its_blocks")
USAGE = ("       python -E -S -s -B -P quarter_counts.py check original_values_byte_equal <sealed series dir> <out dir> <first report.json, "
         "or - for the first invocation> <its sha256, or -> <symbol folder>:<sealed sha256 | pinned> ...\n"
         "       python -E -S -s -B -P quarter_counts.py check <equals_registry_on_test_block | pseudo_quarter_2026_07_09 | fdlibm_measure | equals_wave2b_registry_on_its_blocks> "
         "<registry> <registry sha256> <sealed series dir> <out dir> <symbol folder>:<sealed sha256 | pinned> ..." + W.USAGE)
FORMAT = "kata-quarter-oracle-v1"
RULE = ("report.py l.9-13: each field compared is a decision, held by strict equality; the count of the fdlibm_log pass decides, the "
        "decisions of the math.log pass that differ are listed and stop nothing")
PSEUDO, MONTHS = (K.utc_ms(2026, 7, 1), K.utc_ms(2026, 10, 1)), ("2026-07", "2026-08", "2026-09")
IDENT = ("commit", "kata_recalc_tree_sha256", "kata_quarter_manifest_sha256")
POPULATION = ("the inputs of the port on this tool's own path, the scale kata and the labels of the rows compared on the block counted; "
              "not the census of report.run_passes over the 280 cells (report.py l.14-15), which this one does not replace")


def hex64(a):
    return len(a) == 64 and all(c in "0123456789abcdef" for c in a)


def specs(args):
    """<folder>:<sha256 | pinned> -> {folder: pin}, each folder once; the pin "pinned" is that of recalc_p2.SYMBOLS."""
    pairs = [a.split(":") for a in args]
    if not pairs or any(len(p) != 2 or not (p[0].isascii() and p[0].isalnum()) or not (p[1] == "pinned" or hex64(p[1])) for p in pairs) \
            or len({p[0] for p in pairs}) != len(pairs):
        raise Q.Refused(f"usage:\n{USAGE}")
    return {f: Q.sealed_pin(f) if p == "pinned" else p for f, p in pairs}


def outputs(candles):
    """The outputs of kata_lib on one series over the TEST block, by horizon, each named by the sha256 of its repr (a double's repr
    gives back its bits)."""
    out, ws = {}, sorted(set(K.W.values()))
    for h in recalc_p2.HORIZONS:
        h_ms = K.H_MS[h]
        bars, grid = K.build_bars(candles, h_ms), K.decision_times("TEST", h_ms)
        windows = [[t, w, None if (x := K.window_at(bars, t, w, h_ms)) is None else [x[0][K.B_START], len(x)]] for t in grid for w in ws]
        done = {"build_bars": bars, "decision_times": grid, "window_at": windows, "labels_at": [[t, *K.labels_at(candles, bars, t, h_ms)] for t in grid]}
        out[h] = {k: hashlib.sha256(repr(v).encode("ascii")).hexdigest() for k, v in done.items()}
    return out


def original(sealed, pins, first, ident):
    """original_values_byte_equal: the first invocation (first None) or the second, which poses and compares."""
    if first is None:
        return {"invocation": "reassigns nothing", "outputs": {f: outputs(recalc_p2.load_series(sealed, f, p)[0]) for f, p in pins.items()}}, []
    data = io_guard.read("oracle-output", first[0])
    if (got := hashlib.sha256(data).hexdigest()) != first[1]:
        raise Q.Refused(f"the first invocation's report refused before parsing: sha256 {got} differs from the pinned {first[1]}")
    theirs, before = json.loads(data.decode("ascii")), C.kata_lib_state()
    with C.posed(K.REC_START, K.REC_END, dict(K.BLOCKS)):
        mine = {f: outputs(Q.read_series(sealed, f, p, K.REC_START, K.REC_END)["candles"]) for f, p in pins.items()}
    if C.kata_lib_state() != before:
        raise Q.Refused("kata_lib's globals are not those before the pose: the pose not restored, or a global changed in place")
    if theirs.get("format") != FORMAT or theirs.get("act") != ACTS[0] or theirs["result"].get("invocation") != "reassigns nothing":
        raise Q.Refused("the first report is not the report of the first invocation of original_values_byte_equal")
    if theirs.get("identity") != dict(zip(IDENT, ident)):
        raise Q.Refused("the first report names another commit or other trees than this invocation's line identity")
    t = theirs["result"]["outputs"]
    diffs = [f"{f} {h} {k}: posed {v}, reassigned nothing {t.get(f, {}).get(h, {}).get(k)}" for f in mine for h in mine[f]
             for k, v in mine[f][h].items() if v != t.get(f, {}).get(h, {}).get(k)] + [f"{f}: not read here" for f in sorted(set(t) - set(mine))]
    return {"invocation": "posed at the original values", "first_report_sha256": first[1], "outputs": mine}, diffs


def counted(registry, pin, sealed, pins, span):
    """The count of every band and path row with a qhat on span, the sealed series alone as the merged read of each folder."""
    rows, venue = C.registry_rows(registry, pin, every=True)
    if sorted(pins) != venue:
        raise Q.Refused(f"the symbol folders named {sorted(pins)} are not the venue's {venue}, those of the registry's rows")
    reads = {f: (r, {"declared": frozenset()}, r) for f, r in ((f, Q.read_series(sealed, f, p, K.REC_START, K.REC_END)) for f, p in pins.items())}
    return rows, C.count(reads, rows, span, venue)


def u_test(n, k):
    """UTest as recalc_p2.calibrate_cell writes it (l.367-372): null with no point, "1" when every point misses, else the bound."""
    return None if n == 0 else "1" if k == n else E.miss_upper_bound(n, k, recalc_p2.DELTA)


def against(rows, res, act):
    """The differences of the count with the registry, field by field, by strict equality of their canonical writings."""
    diffs = []
    for (r, _, _), got in zip(rows, res["rows"]):
        n, k, t = got["n_test"], got["k_test"], r["test"]
        if act == ACTS[1]:
            mine = {"nTest": n, "kTest": k, "months": got["months"], "drops.test": got["drops_label"], "UTest": u_test(n, k),
                    "vetoed": bool(r["calib"]["status"] == "region" and n >= 1 and E.binom_upper_tail_leq(n, k, r["alpha"], recalc_p2.DELTA))}
            theirs = {"nTest": t["nTest"], "kTest": t["kTest"], "months": t["months"], "drops.test": r["drops"]["test"], "UTest": t["UTest"], "vetoed": t["vetoed"]}
        else:
            mine = {"n": n, "k": k}
            theirs = {x: sum(t["months"].get(m, {x: 0})[x] for m in MONTHS) for x in ("n", "k")}
        diffs += [f"{r['taskClass']} {r['key']} {x}: tool {report.canonical(mine[x])}, registry {report.canonical(theirs[x])}"
                  for x in mine if report.canonical(mine[x]) != report.canonical(theirs[x])]
    return diffs


def act(name, args, identity_line):
    """One act: its report written and named, its differences listed; exit 0 when equal, 1 on a difference."""
    io_guard.declare("series", "recorder", "registry", "oracle-output", "tool-tree")
    ident = I.tool_identity()
    if len(args) < 5 or not (args[2:4] == ["-", "-"] or hex64(args[3]) if name == ACTS[0] else hex64(args[1]) and (name != ACTS[4] or len(args) >= 7 and hex64(args[3]))):
        raise Q.Refused(f"usage:\n{USAGE}")
    if name == ACTS[0]:
        sealed, out, first, pins = os.path.abspath(args[0]), os.path.abspath(args[1]), None if args[2] == "-" else (os.path.abspath(args[2]), args[3]), specs(args[4:])
        io_guard.output(out)
        result, diffs = original(sealed, pins, first, ident)
    elif name == ACTS[4]:  # <registry> <sha256> <core registry> <sha256> <sealed series dir> <out dir> <symbol folder>:<pin> ...
        registry, core, sealed, out = (os.path.abspath(args[i]) for i in (0, 2, 4, 5))
        io_guard.output(out)
        result, diffs = on_blocks(registry, args[1], (core, args[3]), sealed, specs(args[6:]))
    elif name != ACTS[5]:
        registry, pin, sealed, out, pins = os.path.abspath(args[0]), args[1], os.path.abspath(args[2]), os.path.abspath(args[3]), specs(args[4:])
        io_guard.output(out)
        rows, res = counted(registry, pin, sealed, pins, PSEUDO if name == ACTS[2] else K.BLOCKS["TEST"])
        diffs = [] if name == ACTS[3] else against(rows, res, name)
        result = {"registry_sha256": pin, "rows": [[r["taskClass"], r["key"]] for r, _, _ in rows], "log": res["log"], "population": POPULATION,
                  "pose": res["pose"], "grid": res["grid"], "math_log_decisions": res["differ"]}
    else:  # L-O4: <wave 2b registry> <sha256> <sealed series dir> <out dir> <symbol folder>:<sealed sha256> ...
        registry, sealed, out = (os.path.abspath(args[i]) for i in (0, 2, 3))
        io_guard.output(out)
        result, diffs = on_wave2b(registry, args[1], sealed, specs(args[4:]))
    if not os.path.isdir(out):
        os.mkdir(out)
    rep = {"format": FORMAT, "act": name, "identity": dict(zip(IDENT, ident)),
           "inputs": [[d["role"], d["name"], d["sha256"], d["bytes"]] for d in io_guard.inputs()], "rule": RULE, "result": result,
           "differences": diffs, "equal": not diffs}
    text = report.canonical(rep)
    with open(os.path.join(out, f"{name}.json"), "w", encoding="ascii", newline="\n") as fh:
        fh.write(text)
    lines = [MODEL, f"# quarter_counts.py check {name} - an oracle act, its report pinned by its sha256",
             identity_line(ident), *(f"DIFFERENCE {d}" for d in diffs), f"report {name}.json sha256 {hashlib.sha256(text.encode('ascii')).hexdigest()}",
             *io_guard.input_lines(), "VERDICT: GREEN" if not diffs else f"VERDICT: RED ({len(diffs)} difference(s), not explained)"]
    print("\n".join(lines), flush=True)
    return 0 if not diffs else 1


def on_blocks(registry, pin, core, sealed, pins):
    """equals_wave2_registry_on_its_blocks (L-O3): each core row with a qhat, whatever its status, counted on the three veto blocks of
    quarter_wave2.BLOCKS from its sealed series read alone under W.READS (rule 8 on its truncated candles; no merge: an absent slot is out
    or a drop), held to wave2.json: nTest, kTest, UTest, vetoed and months of each block, and its label drops (drops.<block>)."""
    rows = [x for x in W.core_rows(*core, W.wave1(registry, pin)) if x[0]["calib"]["qhat"] is not None]
    venue = sorted({f for _, _, f in rows})
    if sorted(pins) != venue:
        raise Q.Refused(f"the symbol folders named {sorted(pins)} are not the venue's {venue}, those of the core rows with a qhat")
    reads = {f: (r, {"declared": frozenset()}, r) for f, r in ((f, Q.read_series(sealed, f, p, *W.READS)) for f, p in pins.items())}
    result, diffs = {"registry_sha256": pin, "core_registry_sha256": core[1], "rows": [[r["taskClass"], r["key"]] for r, _, _ in rows], "blocks": {}}, []
    for b, span in W.BLOCKS.items():
        res = C.count(reads, rows, span, venue)
        result["blocks"][b] = {"pose": res["pose"], "grid": res["grid"], "halts": res["halts"], "log": res["log"], "math_log_decisions": res["differ"]}
        for (r, _, _), got in zip(rows, res["rows"]):
            n, k = got["n_test"], got["k_test"]
            mine = {"nTest": n, "kTest": k, "UTest": u_test(n, k), "months": got["months"], "drops": got["drops_label"],
                    "vetoed": bool(r["calib"]["status"] == "region" and n >= 1 and E.binom_upper_tail_leq(n, k, r["alpha"], recalc_p2.DELTA))}
            theirs = {**r[b], "drops": r["drops"][b]}
            diffs += [f"{r['taskClass']} {r['key']} {b}.{x}: tool {report.canonical(mine[x])}, registry {report.canonical(theirs[x])}"
                      for x in mine if report.canonical(mine[x]) != report.canonical(theirs[x])]
    return result, diffs


def on_wave2b(registry, pin, sealed, pins):
    """equals_wave2b_registry_on_its_blocks (L-O4, docs/G0-lot-cm5-c4b.md): each wave 2b row with a qhat, whatever its status, counted on the
    three veto blocks, its sigma_hat that of its estimator on its frozen fit under its profile and usDst (quarter_2b.wave3_rows), from its
    sealed series read alone, each block's candles from READS[block].start (kata/w2c/blocks.ts:25-30) to its end; held to wave3.json as
    on_blocks holds wave2.json, and the decisions not evaluable of each block (nonEvaluable.<block>, the instants out)."""
    import quarter_2b as B  # here, as estimate imports it: no other act loads it
    rows = [x for x in B.wave3_rows(registry, pin) if x[0]["calib"]["qhat"] is not None]
    venue = sorted({f for _, _, f in rows})
    if sorted(pins) != venue:
        raise Q.Refused(f"the symbol folders named {sorted(pins)} are not the venue's {venue}, those of the wave 2b rows with a qhat")
    result, diffs = {"registry_sha256": pin, "rows": [[r["taskClass"], r["key"]] for r, _, _ in rows], "blocks": {}}, []
    whole = {f: Q.read_series(sealed, f, p, *W.READS) for f, p in pins.items()}  # one read of each series, as on_blocks
    for b, (s, e) in W.BLOCKS.items():  # the block's candles from READS[block].start, the range of the writer's block guard
        cut = ({**r, "candles": {t: c for t, c in r["candles"].items() if B.READS[b] <= t < e}} for r in whole.values())
        reads = {r["sym"]: (r, {"declared": frozenset()}, r) for r in cut}
        res = C.count(reads, rows, (s, e), venue)
        result["blocks"][b] = {"read_from": Q.iso(B.READS[b]), "pose": res["pose"], "grid": res["grid"], "halts": res["halts"], "log": res["log"],
                               "math_log_decisions": res["differ"]}
        for (r, _, _), got in zip(rows, res["rows"]):
            n, k = got["n_test"], got["k_test"]
            mine = {"nTest": n, "kTest": k, "UTest": u_test(n, k), "months": got["months"], "drops": got["drops_label"], "nonEvaluable": got["out_input"],
                    "vetoed": bool(r["calib"]["status"] == "region" and n >= 1 and E.binom_upper_tail_leq(n, k, r["alpha"], recalc_p2.DELTA))}
            theirs = {**r[b], "drops": r["drops"][b], "nonEvaluable": r["nonEvaluable"][b]}
            diffs += [f"{r['taskClass']} {r['key']} {b}.{x}: tool {report.canonical(mine[x])}, registry {report.canonical(theirs[x])}"
                      for x in mine if report.canonical(mine[x]) != report.canonical(theirs[x])]
    return result, diffs
