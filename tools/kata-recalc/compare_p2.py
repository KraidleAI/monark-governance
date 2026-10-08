# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only. Lot 1d (2026-10-06): M-7, M-8.
# Frozen-tool lot (2026-10-07): N-5 and N-6 of RECHERCHES' review of #214 (the writings of a double; an integer beyond the doubles);
# path 1 of KATA-SPEC section 8 (RECHERCHES 76ffa25): trialRegistryHead.hash, which recalc_p2.py now computes, is a decision.
# Comparator of mission D-7. Registry mode: two registry JSON files (shape of kata/registry/FORMAT.md), parsed, rows paired by
# (taskClass, key), exactly 280 pairs required. Since lot 1d (M-8; G0 section 3.3; RECHERCHES Q-V3; A-2 l.97) a field has one class:
#   DECISION: every field not named below, by strict equality (a boolean never equals a number; a key present on one side only is
#     named "<absent>"; containers of other shapes or lengths);
#   VALUE: calib.qhat, calibSupport.min and .max, hourOfWeekFactors[i], thresholds.t1 and .t2 (JavaScript writings of doubles):
#     listed whenever the two doubles differ in a bit, both in hexadecimal with their distance in ulps, and marked "beyond 1e-12"
#     outside the conformance contract of KATA-SPEC l.71, made symmetric: abs(a - b) <= max(1e-12 x max(abs(a), abs(b)), 1e-15);
#     in a field written as a string (thresholds), one double under two writings is a DECISION difference; a JSON number keeps no
#     writing once json.loads has read it (1.5 and 1.50 are one float), so qhat, calibSupport and the factors compare their doubles;
#   DIGEST: calib.scoresSha256, calib.auxSha256, factorTableSha256, listed when they differ;
#   OUTSIDE: none since the frozen-tool lot (G0 section 3.3 named trialRegistryHead.hash here until KATA-SPEC wrote its chain).
# Output: one line per difference (class, cell, field, both values), one COUNT per class and field, a SUMMARY per class, the inputs
# read. Exit 0 only with 280 pairs and no difference; 1 on a difference; 2 on a structural fault (pairs, duplicates, unreadable, an
# integer beyond every double in a VALUE field, which float() cannot read: N-6).
# The --ignore list is empty unless given (M-3), and printed.
# Census mode (--census MINE THEIRS): MONARK's sealed census against kata/registry/census.json, on the fields both define.
# Usage: python -E -S -s -B -P compare_p2.py A.json B.json [--ignore f1,f2,...] [--out report.txt]
#        python -E -S -s -B -P compare_p2.py --census census-monark.json census.json [--out report.txt]
import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked its folder (IO-GUARD-POSED-FILES-1)
if "io_guard" not in sys.modules:  # io_guard.py run by its path, never found by name: nothing posed or installed stands in for it
    sys.path.append(_d := os.path.dirname(os.path.realpath(__file__)))  # the tool's folder, last in sys.path: -P is in FORM
    _g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
    exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))
import io_guard  # the input guard, before any other module (M-7): both files are read under the role registry
import hashlib
import json
import math
import os
import struct
import sys

MODEL = "claude-opus-5-5"
PAIRS = 280
VALUES = {"calib.qhat", "calibSupport.min", "calibSupport.max", "hourOfWeekFactors", "thresholds.t1", "thresholds.t2"}
DIGESTS = {"calib.scoresSha256", "calib.auxSha256", "factorTableSha256"}
OUTSIDE = {}  # path 1: no field outside the decisions; report.py refuses a report if a name is ever put back here


def _is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def same(a, b):
    """Strict equality of two leaves of a DECISION field."""
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if _is_num(a) and _is_num(b):
        return a == b
    if isinstance(a, str) and isinstance(b, str):
        return a == b
    return False


def ulps(x, y):
    """Distance of two finite doubles in units in the last place: consecutive doubles are 1 apart (+0 and -0 are 0 apart)."""
    def key(v):
        i = struct.unpack("<q", struct.pack("<d", v))[0]
        return i if i >= 0 else -(i & 0x7FFFFFFFFFFFFFFF)
    return abs(key(x) - key(y))


def leaf_diff(path, a, b):
    """None when two leaves agree, else (class, detail)."""
    f = field_of(path)
    if f in VALUES and ((_is_num(a) and _is_num(b)) or (isinstance(a, str) and isinstance(b, str))):
        try:
            x, y = float(a), float(b)
        except ValueError:
            x = y = None
        except OverflowError:  # N-6: an integer beyond every double, which no writing of a double gives: a fault of structure
            return "STRUCTURE", "an integer beyond the range of a double"
        if x is not None and math.isfinite(x) and math.isfinite(y):
            if struct.pack("<d", x) == struct.pack("<d", y):
                return None if (a == b or not isinstance(a, str)) else ("DECISION", f"A={show(a)} B={show(b)}: one double, two writings")
            within = abs(x - y) <= max(1e-12 * max(abs(x), abs(y)), 1e-15)
            return "VALUE", f"A={x.hex()} B={y.hex()} ulps {ulps(x, y)}" + ("" if within else " beyond 1e-12")
    if f in DIGESTS and isinstance(a, str) and isinstance(b, str):
        return None if a == b else ("DIGEST", f"A={a} B={b}")
    return None if same(a, b) else ("DECISION", f"A={show(a)} B={show(b)}")


def diff(a, b, path, ignore, out):
    """Append (class, path, detail) for every difference; ignored and OUTSIDE paths are skipped with their children."""
    if path in ignore or path in OUTSIDE:
        return
    if isinstance(a, dict) and isinstance(b, dict):
        for k in list(a.keys()) + [k for k in b.keys() if k not in a]:
            p = f"{path}.{k}" if path else k
            if p in ignore or p in OUTSIDE:
                continue
            if k not in b:
                out.append(("DECISION", p, f"A={show(a[k])} B=<absent>"))
            elif k not in a:
                out.append(("DECISION", p, f"A=<absent> B={show(b[k])}"))
            else:
                diff(a[k], b[k], p, ignore, out)
        return
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            out.append(("DECISION", path + ".length", f"A={len(a)} B={len(b)}"))
            return
        for i, (x, y) in enumerate(zip(a, b)):
            diff(x, y, f"{path}[{i}]", ignore, out)
        return
    if isinstance(a, (dict, list)) or isinstance(b, (dict, list)):
        out.append(("DECISION", path, f"A={show(a)} B={show(b)}"))
        return
    d = leaf_diff(path, a, b)
    if d is not None:
        out.append((d[0], path, d[1]))


def field_of(path):
    """Count key: the path without list indices and without month keys (test.months.<YYYY-MM>.k -> test.months.*.k)."""
    parts = []
    for seg in path.split("."):
        seg = seg.split("[")[0]
        parts.append("*" if (len(seg) == 7 and seg[4] == "-" and seg[:4].isdigit()) else seg)
    return ".".join(parts)


def show(v):
    if isinstance(v, (dict, list)):
        txt = json.dumps(v, separators=(",", ":"))
        return txt if len(txt) <= 60 else f"{type(v).__name__} sha256 {hashlib.sha256(txt.encode()).hexdigest()[:16]}"
    return json.dumps(v) if not isinstance(v, str) or v != "<absent>" else v


def load(path):
    raw = io_guard.read("registry", path)
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def at(obj, path):
    """The value at a dotted path, or "<absent>"."""
    for seg in path.split("."):
        obj = obj.get(seg, "<absent>") if isinstance(obj, dict) else "<absent>"
    return obj


def compare_registries(pa, pb, ignore):
    lines = [MODEL, "# compare_p2.py - registry mode (mission D-7; classes of lot 1d)"]
    code = 0
    try:
        a, sa = load(pa)
        b, sb = load(pb)
    except Exception as e:
        return 2, lines + [f"STRUCTURE unreadable input: {type(e).__name__}", "EXIT 2"]
    lines.append(f"A {pa} sha256 {sa}")
    lines.append(f"B {pb} sha256 {sb}")
    lines.append(f"ignored fields ({len(ignore)}, closed list): {', '.join(sorted(ignore)) if ignore else '(none)'}")
    counts = {}
    top = []
    if not isinstance(a, dict) or not isinstance(b, dict) or not isinstance(a.get("rows"), list) or not isinstance(b.get("rows"), list):
        return 2, lines + ["STRUCTURE a top-level object with a rows array is required on both sides", "EXIT 2"]
    for p, why in OUTSIDE.items():
        lines.append(f"OUTSIDE {p}: A={show(at(a, p))} B={show(at(b, p))}; {why}")
    diff({k: v for k, v in a.items() if k != "rows"}, {k: v for k, v in b.items() if k != "rows"}, "", ignore, top)
    for cls, p, detail in top:
        lines.append(f"{cls} top-level {p}: {detail}")
        counts[(cls, field_of(p))] = counts.get((cls, field_of(p)), 0) + 1
    maps = []
    for side, rows in (("A", a["rows"]), ("B", b["rows"])):
        m = {}
        for r in rows:
            k = (r.get("taskClass"), r.get("key")) if isinstance(r, dict) else (None, None)
            if k in m:
                lines.append(f"STRUCTURE duplicate cell in {side}: {k[0]} {k[1]}")
                code = 2
            m[k] = r
        maps.append(m)
    ma, mb = maps
    only_a = [k for k in ma if k not in mb]
    only_b = [k for k in mb if k not in ma]
    for k in only_a:
        lines.append(f"STRUCTURE unpaired in A: {k[0]} {k[1]}")
    for k in only_b:
        lines.append(f"STRUCTURE unpaired in B: {k[0]} {k[1]}")
    pairs = [k for k in ma if k in mb]
    differing = 0
    beyond = sum(1 for _, _, detail in top if detail.endswith(" beyond 1e-12"))
    for k in pairs:
        out = []
        diff(ma[k], mb[k], "", ignore, out)
        differing += bool(out)
        for cls, p, detail in out:
            lines.append(f"{cls} {k[0]} {k[1]} {p}: {detail}")
            counts[(cls, field_of(p))] = counts.get((cls, field_of(p)), 0) + 1
            beyond += detail.endswith(" beyond 1e-12")
    for cls, f in sorted(counts):
        lines.append(f"COUNT {cls} {f} {counts[(cls, f)]}")
    per = {c: sum(n for (cc, _), n in counts.items() if cc == c) for c in ("DECISION", "VALUE", "DIGEST")}
    lines.append(f"pairs {len(pairs)} (required {PAIRS}), rows A {len(a['rows'])}, rows B {len(b['rows'])}, "
                 f"unpaired A {len(only_a)}, unpaired B {len(only_b)}, differing cells {differing}, top-level differences {len(top)}")
    lines.append(f"SUMMARY decisions {per['DECISION']}, values {per['VALUE']} (beyond 1e-12: {beyond}), digests {per['DIGEST']}, "
                 f"outside {len(OUTSIDE)} (not compared)")
    if code == 0 and (len(pairs) != PAIRS or only_a or only_b or len(a["rows"]) != PAIRS or len(b["rows"]) != PAIRS
                      or any(c == "STRUCTURE" for c, _ in counts)):  # N-6: a fault of structure inside a pair or the top level
        code = 2
    if code == 0 and (differing or top):
        code = 1
    lines.extend(io_guard.input_lines())
    lines.append(f"EXIT {code}")
    return code, lines


CENSUS_BLOCK = [("decisions", "decisions"), ("directionKept", "kept"), ("flat", "flat"), ("up", "up"),
                ("droppedDirection", "dirRangeDropped"), ("droppedPath", "pathDropped")]


def compare_census(pm, pt):
    """MONARK's census (recalc_p2.py) against census.json: rows, missing candles, bars, absent and zero-volume bars, and per block
    decisions, kept, flat, up, drops; the flat share as the exact ratio flat / directionKept. The parity part is out of scope (D-8)."""
    lines = [MODEL, "# compare_p2.py - census mode (mission D-3): MONARK sealed census against census.json"]
    mine, sm = load(pm)
    theirs, st = load(pt)
    lines.append(f"MONARK {pm} sha256 {sm}")
    lines.append(f"census.json {pt} sha256 {st}")
    bad = 0
    n = 0

    def cmp(name, x, y):
        nonlocal bad, n
        n += 1
        ok = x == y and type(x) is type(y)
        bad += not ok
        lines.append(("SAME " if ok else "DIFF ") + f"{name}: MONARK {x} census.json {y}")

    by_sym = {s["symbol"]: s for s in mine["series"]}
    cmp("symbols", sorted(by_sym), sorted(theirs["symbols"]))
    for sym in sorted(set(by_sym) & set(theirs["symbols"])):
        m, t = by_sym[sym], theirs["symbols"][sym]["census"]
        cmp(f"{sym} rows", m["rows"], t["rows"])
        cmp(f"{sym} missingCandles", m["missingCandles"], t["missingCandles"])
        cmp(f"{sym} firstMissing length", min(m["missingCandles"], 10), len(t["firstMissing"]))
        for h in ("1h", "4h"):
            mh, th = m["horizons"][h], t["horizons"][h]
            for f in ("bars", "absentBars", "zeroVolumeBars"):
                cmp(f"{sym} {h} {f}", mh[f], th[f])
            for blk in ("SELECT", "CALIB", "TEST"):
                mb, tb = mh["blocks"][blk], th["blocks"][blk]
                for tf, mf in CENSUS_BLOCK:
                    cmp(f"{sym} {h} {blk} {tf}", mb[mf], tb[tf])
                fm = f"{mb['flat']}/{mb['kept']}"
                ft = f"{tb['flat']}/{tb['directionKept']}"
                cmp(f"{sym} {h} {blk} flat share (exact ratio)", fm, ft)
    lines.append(f"census fields compared {n}, differing {bad}; parity (census.json symbols.*.parity) not compared: out of scope (D-8)")
    code = 0 if bad == 0 else 1
    lines.extend(io_guard.input_lines())
    lines.append(f"EXIT {code}")
    return code, lines


def main(argv):
    sys.stdout.reconfigure(newline="\n")  # line feeds only, also on a Windows console or redirection
    out = None
    if "--out" in argv:
        i = argv.index("--out")
        out = os.path.abspath(argv[i + 1])  # B-2: every path the guard judges is absolute
        argv = argv[:i] + argv[i + 2:]
    io_guard.declare("registry")
    if out:
        io_guard.output(out)
    if argv and argv[0] == "--census":
        code, lines = compare_census(os.path.abspath(argv[1]), os.path.abspath(argv[2]))
    else:
        ignore = set()
        if "--ignore" in argv:
            i = argv.index("--ignore")
            ignore = {x.strip() for x in argv[i + 1].split(",") if x.strip()}
            argv = argv[:i] + argv[i + 2:]
        if len(argv) != 2:
            print("usage: compare_p2.py A.json B.json [--ignore f1,f2] [--out file] | --census MINE THEIRS [--out file]")
            return 2
        code, lines = compare_registries(os.path.abspath(argv[0]), os.path.abspath(argv[1]), ignore)
    text = "\n".join(lines) + "\n"
    if out:
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
    sys.stdout.write(text)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
