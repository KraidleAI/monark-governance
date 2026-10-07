# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only.
# Comparator of mission D-7. Registry mode: two registry JSON files (shape of kata/registry/FORMAT.md), parsed, rows paired by
# (taskClass, key), exactly 280 pairs required; integers, strings, digests, booleans and null by strict equality (a boolean is
# never equal to a number); a number pair where either side is a float by the conformance contract of KATA-SPEC l.68, symmetric:
# abs(a - b) <= max(1e-12 x max(abs(a), abs(b)), 1e-15); a key present on one side only is a difference named "absent".
# Output: one line per differing cell (its first differing field and both values), one count per field, the ignore list.
# Exit 0 only with 280 pairs and no difference; 1 on a difference; 2 on a structural fault (pairs, duplicates, unreadable).
# Census mode (--census MINE THEIRS): MONARK's sealed census against kata/registry/census.json, on the fields both define.
# Usage: python -B compare_p2.py A.json B.json [--ignore f1,f2,...] [--out report.txt]
#        python -B compare_p2.py --census census-monark.json census.json [--out report.txt]
import hashlib
import json
import math
import sys

MODEL = "claude-opus-5-5"
PAIRS = 280


def _is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def leaf_equal(a, b):
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if _is_num(a) and _is_num(b):
        if isinstance(a, int) and isinstance(b, int):
            return a == b
        if a == b:
            return True
        if not (math.isfinite(a) and math.isfinite(b)):
            return False
        return abs(a - b) <= max(1e-12 * max(abs(a), abs(b)), 1e-15)
    if isinstance(a, str) and isinstance(b, str):
        return a == b
    return False


def diff(a, b, path, ignore, out):
    """Append (path, a, b) for every differing leaf, container length or absent key; skip ignored paths and their children."""
    if path in ignore:
        return
    if isinstance(a, dict) and isinstance(b, dict):
        for k in list(a.keys()) + [k for k in b.keys() if k not in a]:
            p = f"{path}.{k}" if path else k
            if p in ignore:
                continue
            if k not in b:
                out.append((p, a[k], "<absent>"))
            elif k not in a:
                out.append((p, "<absent>", b[k]))
            else:
                diff(a[k], b[k], p, ignore, out)
        return
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            out.append((path + ".length", len(a), len(b)))
            return
        for i, (x, y) in enumerate(zip(a, b)):
            diff(x, y, f"{path}[{i}]", ignore, out)
        return
    if isinstance(a, (dict, list)) or isinstance(b, (dict, list)):
        out.append((path, a, b))
        return
    if not leaf_equal(a, b):
        out.append((path, a, b))


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
    raw = open(path, "rb").read()
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def compare_registries(pa, pb, ignore):
    lines = [MODEL, "# compare_p2.py - registry mode (mission D-7)"]
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
    diff({k: v for k, v in a.items() if k != "rows"}, {k: v for k, v in b.items() if k != "rows"}, "", ignore, top)
    for p, x, y in top:
        lines.append(f"DIFF top-level {p}: A={show(x)} B={show(y)}")
        counts[field_of(p)] = counts.get(field_of(p), 0) + 1
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
    for k in pairs:
        out = []
        diff(ma[k], mb[k], "", ignore, out)
        if out:
            differing += 1
            p, x, y = out[0]
            lines.append(f"DIFF {k[0]} {k[1]} {p}: A={show(x)} B={show(y)} ({len(out)} field(s))")
            for p, _, _ in out:
                counts[field_of(p)] = counts.get(field_of(p), 0) + 1
    for f in sorted(counts):
        lines.append(f"COUNT {f} {counts[f]}")
    lines.append(f"pairs {len(pairs)} (required {PAIRS}), rows A {len(a['rows'])}, rows B {len(b['rows'])}, "
                 f"unpaired A {len(only_a)}, unpaired B {len(only_b)}, differing cells {differing}, top-level differences {len(top)}")
    if code == 0 and (len(pairs) != PAIRS or only_a or only_b or len(a["rows"]) != PAIRS or len(b["rows"]) != PAIRS):
        code = 2
    if code == 0 and (differing or top):
        code = 1
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
    lines.append(f"EXIT {code}")
    return code, lines


def main(argv):
    sys.stdout.reconfigure(newline="\n")  # line feeds only, also on a Windows console or redirection
    out = None
    if "--out" in argv:
        i = argv.index("--out")
        out = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    if argv and argv[0] == "--census":
        code, lines = compare_census(argv[1], argv[2])
    else:
        ignore = set()
        if "--ignore" in argv:
            i = argv.index("--ignore")
            ignore = {x.strip() for x in argv[i + 1].split(",") if x.strip()}
            argv = argv[:i] + argv[i + 2:]
        if len(argv) != 2:
            print("usage: compare_p2.py A.json B.json [--ignore f1,f2] [--out file] | --census MINE THEIRS [--out file]")
            return 2
        code, lines = compare_registries(argv[0], argv[1], ignore)
    text = "\n".join(lines) + "\n"
    if out:
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
    sys.stdout.write(text)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
