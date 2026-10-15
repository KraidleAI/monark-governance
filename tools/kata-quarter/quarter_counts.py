# claude-opus-5-5 - 2026-10-15 - the entry script of the quarter counts tool, tools/kata-quarter/ (CM-5), Python 3.14 standard library
# only, no network. The one file of this folder with a block __main__: its sibling modules are quarter_*.py, none an entry. It runs
# io_guard.py of the frozen tool tools/kata-recalc/ by its path FIRST (the prologue below: the form of the frozen tool's own entry
# scripts, the frozen tool's folder appended last to sys.path, io_guard never found by name), which checks the launch form FORM
# (python -E -S -s -B -P), the closed lists of both trees (FILES there, the list file FILES here) and installs its audit hook before any
# input is read. Then this folder is appended after the frozen tool's, so that the quarter_* modules are found by name; identity()
# holds every module loaded under a name of the frozen tool's list, or from its folder, to the frozen tool's file, io_guard to the one at
# <frozen tool>/io_guard.py, and no module of this folder to one of those names (io_guard refuses such a homonym first).
# Subcommands: check, two reads of one symbol through quarter_load (the sealed series and the LIVE series, each under its pin), the
# merged range and the declared gaps, one VERDICT: GREEN; count and month, the quarter and month counts: not in this lot, exit 2.
# An exception that nothing names is caught here: its type and message, no trace, exit 2. Every path argument is made absolute.
# Usage: python -E -S -s -B -P quarter_counts.py check <sealed series dir> <live series dir> <symbol folder> <quarter k>
#                                                      <sealed sha256 | pinned, quarter 1 only> <live sha256> <lookback hours>
#        python -E -S -s -B -P quarter_counts.py count | month ...   (not in this lot)
import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked both folders (IO-GUARD-POSED-FILES-1)
if "io_guard" not in sys.modules:  # io_guard.py of the frozen tool, run by its path, never found by name: nothing posed or installed stands in for it
    sys.path.append(_d := os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), "kata-recalc"))  # the frozen tool's folder, last in sys.path: -P is in FORM
    _g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
    exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))
import io_guard  # the input guard of the frozen tool, before any other module: its hook is installed, both lists are checked
HERE = os.path.dirname(os.path.realpath(__file__))
sys.path.append(HERE)  # this folder, after the frozen tool's: the quarter_* modules by name, read under the second tree's list
import quarter_load as Q
import recalc_p2

MODEL = "claude-opus-5-5"
USAGE = ("usage: python -E -S -s -B -P quarter_counts.py check <sealed series dir> <live series dir> <symbol folder> <quarter k> "
         "<sealed sha256 | pinned, quarter 1 only> <live sha256> <lookback hours>")
NOT_YET = "not in this lot: the loader only (check); the quarter and month counts arrive with the next lots"
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


def check(sealed_dir, live_dir, sym, k, pin1, pin2, lookback_hours):
    io_guard.declare("series", "recorder")
    if pin1 == "pinned" and k != 1:
        raise Q.Refused(f"'pinned' names the sealed series of wave 1, read 1 of quarter 1 only: quarter {k} reads quarter {k - 1} "
                        "under the pin posted at its sealing")
    pin1 = Q.sealed_pin(sym) if pin1 == "pinned" else pin1
    first, second, merged = Q.load_quarter(sealed_dir, live_dir, sym, k, pin1, pin2, lookback_hours * 3_600_000)
    s_k, e_k = Q.quarter(k)
    lines = [MODEL, f"# quarter_counts.py check - the two reads of {sym} and their controlled merge, quarter {k}",
             f"quarter {k} {Q.iso(s_k)} {Q.iso(e_k)}"]
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


if __name__ == "__main__":
    identity()
    sub, args = (sys.argv[1] if len(sys.argv) > 1 else ""), sys.argv[2:]
    if sub in ("count", "month"):
        print(f"{sub}: {NOT_YET}", flush=True)
        sys.exit(2)
    try:  # every argument parsed here: a bad one is the usage, exit 2, never a trace
        number = lambda a: a.isascii() and a.isdigit() and int(a) > 0  # noqa: E731 (ASCII digits only: int() refuses others)
        hex64 = lambda a: len(a) == 64 and all(c in "0123456789abcdef" for c in a)  # noqa: E731 (a one-line form of a sha256)
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
