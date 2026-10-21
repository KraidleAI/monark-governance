# claude-opus-5-5 - 2026-10-15 - the entry script of the quarter counts tool, tools/kata-quarter/ (CM-5), Python 3.14 standard library
# only, no network; the one file of this folder with a block __main__. The prologue runs io_guard.py of the frozen tool tools/kata-recalc/
# by its path first (its folder appended last to sys.path), which checks the form FORM and the lists of both trees and installs its hook
# before any input; this folder is then appended for the quarter_* modules; identity() holds the frozen tool's modules to its files.
# check and count declare the role tool-tree and, before any input, hold both trees on disk to their blobs at the commit that git_tree
# names (quarter_identity, exit 2 otherwise; no option skips it), then print that commit and the two digests on the line "identity".
# check: two reads of one symbol through quarter_load and their merge, VERDICT: GREEN; count: the counts of the region rows of a wave 1
# registry, and of the core registry wave2.json when given (quarter_wave2: attempt 2, the child rule), on Q_k (quarter_core), one JSON
# line under fdlibm_log, then each decision math.log changes, and the evidence (quarter_evidence) into <out dir>/quarter-<k>.json, named
# on the line "evidence", for the rows the served history serves in Q_k; check <act>: an oracle act; vectors: the L-T7 vectors; month: quarter_month; estimate: quarter_2b.
import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked both folders (IO-GUARD-POSED-FILES-1)
if "io_guard" not in sys.modules:  # io_guard.py of the frozen tool, run by its path, never found by name: nothing posed or installed stands in for it
    sys.path.append(_d := os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "kata-recalc"))  # the frozen tool's folder, last in sys.path: -P is in FORM
    _g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
    exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))
import io_guard  # the input guard of the frozen tool, before any other module: its hook is installed, both lists are checked
HERE = os.path.dirname(os.path.realpath(__file__))
sys.path.append(HERE)  # this folder, after the frozen tool's: the quarter_* modules by name, read under the second tree's list
import json
import quarter_core as C
import quarter_evidence as V
import quarter_identity as I
import quarter_load as Q
import quarter_oracle as O, quarter_wave2 as W  # the reader of the core registry wave2.json (lot c3)
import recalc_p2
MODEL = "claude-opus-5-5"
USAGE = ("usage: python -E -S -s -B -P quarter_counts.py check <sealed series dir> <live series dir> <symbol folder> <quarter k> "
         "<sealed sha256 | pinned, quarter 1 only> <live sha256> <lookback hours>\n"
         "       python -E -S -s -B -P quarter_counts.py count <registry> <registry sha256> [<core registry> <core registry sha256>] <served history> <served history sha256> "
         "<sealed series dir> <live series dir> <quarter k> <out dir> <symbol folder>:<sealed sha256 | pinned, quarter 1 only>:<live sha256> ...\n"
         "       python -E -S -s -B -P quarter_counts.py vectors <out dir>\n" + O.USAGE)
import quarter_month as M  # the monthly reading of D6 (lot e): the rank of count on a UTC month, kata-month-counts-v1, a report only
FLAGS = []  # closed: count takes no option, so no call or traffic enters a count (addendum 9 point 2; L-T2)
FROZEN = os.path.dirname(os.path.realpath(io_guard.__file__))


def identity():
    """The io_guard module in sys.modules is the one at <frozen tool>/io_guard.py; every module loaded under a name of the frozen tool's
    closed list FILES, or from under its folder, is that file of the frozen tool; no module loaded from this folder bears one of those
    names. Written as ifs, exit 2 after a flushed line: never an assert."""
    names = {n[:-3] for n in io_guard.FILES}
    wrong = []
    for name, mod in list(sys.modules.items()):
        file = getattr(mod, "__file__", None)
        if not isinstance(file, str):
            continue
        real = os.path.realpath(file)
        if (name in names or os.path.dirname(real) == FROZEN) and real != os.path.join(FROZEN, f"{name}.py"):
            wrong.append(f"{name} from {real}")
        if name in names and os.path.dirname(real) == HERE:
            wrong.append(f"{name} from this folder")
    if wrong or os.path.basename(FROZEN) != "kata-recalc" or os.path.dirname(FROZEN) != os.path.dirname(HERE):
        sys.stderr.write(f"quarter_counts: refused, the identity of the frozen tool's modules does not hold: {wrong or FROZEN}\n")
        sys.stderr.flush()
        os._exit(2)


def identity_line(ident):
    return "identity commit {} kata_recalc_tree_sha256 {} kata_quarter_manifest_sha256 {}".format(*ident)


def check(sealed_dir, live_dir, sym, k, pin1, pin2, lookback_hours):
    io_guard.declare("series", "recorder", "registry", "oracle-output", "tool-tree")
    ident = I.tool_identity()
    if pin1 == "pinned" and k != 1:
        raise Q.Refused(f"'pinned' names the sealed series of wave 1, read 1 of quarter 1 only: quarter {k} reads quarter {k - 1} "
                        "under the pin posted at its sealing")
    pin1 = Q.sealed_pin(sym) if pin1 == "pinned" else pin1
    first, second, merged = Q.load_quarter(sealed_dir, live_dir, sym, k, pin1, pin2, lookback_hours * 3_600_000)
    s_k, e_k = Q.quarter(k)
    lines = [MODEL, f"# quarter_counts.py check - the two reads of {sym} and their controlled merge, quarter {k}",
             f"quarter {k} {Q.iso(s_k)} {Q.iso(e_k)}", identity_line(ident)]
    for which, r in (("sealed", first), ("live", second)):
        lines.append(f"read {which} {r['sym']} {Q.iso(r['range'][0])} {Q.iso(r['range'][1])} sha256 {r['pin']} rows {r['stats']['rows']}")
    (a, b), gaps = merged["range"], sum(len(g) for g in merged["gaps"].values())
    slots = (b - a) // Q.K.STEP_MS
    lines.append(f"merged {Q.iso(a)} {Q.iso(b)} seam {Q.iso(merged['seam'])} slots {slots} present {slots - gaps} gaps {gaps}")
    lines.extend(f"gap {which} {Q.iso(t)}" for which in ("sealed", "live") for t in merged["gaps"][which])
    lines.extend(io_guard.input_lines())
    lines.append("VERDICT: GREEN")
    print("\n".join(lines), flush=True)
    return 0


def count(registry, pin, history, hpin, sealed_dir, live_dir, k, out, specs, core=None):
    io_guard.declare("series", "recorder", "registry", "served-history", "tool-tree")
    ident = I.tool_identity()
    io_guard.output(out)
    V.place(out, (sealed_dir, live_dir))
    folders = {f: (p1, p2) for f, p1, p2 in (s.split(":") for s in specs)}
    (rows, venue), (s_k, e_k), held = W.counted(*C.registry_rows(registry, pin), core, registry, pin, Q.quarter(k)[0]), Q.quarter(k), Q.served_history(history, hpin)
    service = {r["taskClass"]: Q.served_in(held.get(r["taskClass"], []), s_k, e_k) for r, _, _ in rows}
    rows = [x for x in rows if service[x[0]["taskClass"]]]
    if not rows:
        raise Q.Refused(f"no region row of the registry is served at an instant of quarter {k} by the served history: nothing to count")
    if len(folders) != len(specs) or any(p1 == "pinned" for p1, _ in folders.values()) and k != 1:
        raise Q.Refused("a symbol folder named twice, or 'pinned' for a quarter after quarter 1 (it names the sealed series of wave 1)")
    if sorted(folders) != venue:
        raise Q.Refused(f"the symbol folders named {sorted(folders)} are not the venue's {venue}, those of the registry's rows: the venue "
                        "instance is formed over all of them")
    look, reads = C.lookback(rows), {}
    for f, (p1, p2) in folders.items():  # quarter_load.load_quarter, the LIVE read held closed before the merge
        first = Q.read_series(sealed_dir, f, Q.sealed_pin(f) if p1 == "pinned" else p1, *Q.sealed_range(k))
        second = V.closed(Q.read_series(live_dir, f, p2, s_k, e_k), e_k)
        reads[f] = (first, second, Q.merge(first, second, look))
    res = {"quarter": {"k": k, "start": Q.iso(s_k), "end": Q.iso(e_k)}, "registry_sha256": pin, **({"core_registry_sha256": core[1]} if core else {}), "served_history_sha256": hpin, **C.count(reads, rows, (s_k, e_k), venue),
           "series": {f: {"sealed": r[0]["pin"], "live": r[1]["pin"], "gaps": sum(map(len, r[2]["gaps"].values())), "present": len(r[1]["candles"]),
                          "expected": (e_k - s_k) // Q.K.STEP_MS} for f, r in reads.items()}}
    for row in res["rows"]:
        row["served_from"], row["served_to"], row["served_tables"] = *map(Q.iso, service[row["task_class"]][:2]), service[row["task_class"]][2]
    differ, (name, digest) = res.pop("differ"), V.write(out, f"quarter-{k}.json", V.evidence(res, ident))
    lines = [MODEL, f"# quarter_counts.py count - the counts of the region rows of the registry on quarter {k}",
             json.dumps(res, sort_keys=True, separators=(",", ":")), *(f"decision differs {d}" for d in differ),
             f"math.log decisions that differ from the fdlibm_log pass, which decides: {len(differ)}",
             f"evidence {name} sha256 {digest}", identity_line(ident),
             *io_guard.input_lines(), "VERDICT: GREEN"]
    print("\n".join(lines), flush=True)
    return 0


def vectors(out):
    io_guard.declare("tool-tree")
    ident = I.tool_identity()
    io_guard.output(out)
    v = V.vectors()
    name, digest = V.write(out, "veto-vectors.json", v)
    pairs = sum(map(len, v["vectors"].values()))
    print("\n".join([MODEL, "# quarter_counts.py vectors - the vectors of vetoFires and uTest at alpha 0.01 (L-T7)", f"vectors {name} sha256 {digest} pairs {pairs}",
                     identity_line(ident), *io_guard.input_lines(), "VERDICT: GREEN"]), flush=True)
    return 0


if __name__ == "__main__":
    identity()
    sub, args = (sys.argv[1] if len(sys.argv) > 1 else ""), sys.argv[2:]
    if sub == "month":  # its arguments, its usage and its refusals (REFUSED, exit 2, never a trace) are quarter_month's own
        sys.exit(M.main(args, identity_line))
    # count, check and vectors: the arguments parsed below, as before the monthly reading
    try:  # every argument parsed here: a bad one is the usage, exit 2, never a trace
        number = lambda a: a.isascii() and a.isdigit() and int(a) > 0  # noqa: E731 (ASCII digits only: int() refuses others)
        hex64 = lambda a: len(a) == 64 and all(c in "0123456789abcdef" for c in a)  # noqa: E731 (a one-line form of a sha256)
        spec = lambda a: len(p := a.split(":")) == 3 and p[0].isascii() and p[0].isalnum() and (p[1] == "pinned" or hex64(p[1])) and hex64(p[2])  # noqa: E731
        if sub == "count" and (bad := [a for a in args if a.startswith("--") and a not in FLAGS]):
            raise Q.Refused(f"{bad[0]}: not an option of count, whose list FLAGS is closed: no call or traffic enters a count")
        args = [a for a in args if not a.startswith("--")] if sub == "count" else args
        if sub == "check" and args[:1] and args[0] in O.ACTS:
            sys.exit(O.act(args[0], args[1:], identity_line))
        if sub == "count" and len(args) >= 9 and hex64(args[1]) and hex64(args[3]) and number(args[6]) and all(map(spec, args[8:])):
            a = [os.path.abspath(x) for x in args[:8]]  # args 1, 3 and 6, the pins and k, taken as they are
            sys.exit(count(a[0], args[1], a[2], args[3], a[4], a[5], int(args[6]), a[7], args[8:]))
        if sub == "count" and len(args) >= 11 and all(map(hex64, args[1:6:2])) and number(args[8]) and all(map(spec, args[10:])):
            a = [os.path.abspath(x) for x in args[:10]]  # the core registry and its pin after the registry's: args 3, 5 and 8 as they are
            sys.exit(count(a[0], args[1], a[4], args[5], a[6], a[7], int(args[8]), a[9], args[10:], (a[2], args[3])))
        if sub == "estimate":  # the three wave 2b estimators on their frozen fits: its usage and its refusals are quarter_2b's
            import quarter_2b as B  # here, so that no line of the module's head moves
            sys.exit(B.estimate(args, identity_line))
        if sub == "vectors" and len(args) == 1:
            sys.exit(vectors(os.path.abspath(args[0])))
        if sub != "check" or len(args) != 7 or not (number(args[3]) and number(args[6])) \
                or not all(a == "pinned" and i == 0 or hex64(a) for i, a in enumerate(args[4:6])):
            print(USAGE, flush=True)
            sys.exit(2)
        sys.exit(check(os.path.abspath(args[0]), os.path.abspath(args[1]), args[2], int(args[3]), args[4], args[5], int(args[6])))
    except (Q.Refused, recalc_p2.Stop) as e:
        print(f"REFUSED: {e}", flush=True)
        sys.exit(2)
    except Exception as e:  # no trace: no source is read; the type and the message
        print(f"REFUSED: {type(e).__name__}: {e}", flush=True)
        sys.exit(2)
