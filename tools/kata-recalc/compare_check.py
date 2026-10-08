# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only. Lot 1d (2026-10-06): M-6 to M-8.
# Self-tests of compare_p2.py (mission D-7), through its command line, on copies of a registry written under a work directory:
# identity -> 0; a copy with one altered field -> exit 1 and the field named in a line of its class (DECISION, VALUE with its ulps
# and "beyond 1e-12" outside the float contract, DIGEST); trialRegistryHead.hash a decision since the frozen-tool lot (path 1); a named
# --ignore; structural faults (dropped, duplicated, renamed rows; an integer beyond the doubles in a VALUE field, N-6) -> 2.
# IO-GUARD-POSED-FILES-1: case 34, a value x (1 + 2e-12), twice the contract: listed beyond 1e-12, inside a tolerance widened to 1e-9.
# Usage: python -E -S -s -B compare_check.py <registry.json> <work dir> <out.txt>   (M-6)
import io_guard  # the input guard, before any other module (M-7): the registry is read under the role registry
import copy
import json
import math
import os
import sys

import kata_lib as K

MODEL = "claude-opus-5-5"


def run(a_path, b_path, ignore):
    p = io_guard.run_tool("compare_p2.py", [a_path, b_path] + (["--ignore", ignore] if ignore else []))
    return p.returncode, p.stdout.decode("utf-8").replace("\r\n", "\n")  # a Windows text-mode stdout writes CR LF


def dump(path, obj):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(obj, fh, indent=1)
        fh.write("\n")


def main(src, work, out_path):
    io_guard.declare("registry")
    io_guard.output(work)
    io_guard.output(out_path)
    os.makedirs(work, exist_ok=True)
    raw = io_guard.read("registry", src)
    base = json.loads(raw.decode("utf-8"))
    rows = base["rows"]
    i_dir = 0
    i_scale = next(i for i, r in enumerate(rows) if "-range-" in r["taskClass"] and isinstance(r["calib"]["qhat"], float))
    r0, rs = rows[i_dir], rows[i_scale]
    c0, cs = f"{r0['taskClass']} {r0['key']}", f"{rs['taskClass']} {rs['key']}"
    first_month = next(iter(r0["test"]["months"]))

    def at(i, fn):
        def mutate(obj):
            fn(obj["rows"][i])
        return mutate

    def bump_qhat(f):
        def g(r):
            r["calib"]["qhat"] = r["calib"]["qhat"] * (1 + f)
        return g

    def up(x):
        return math.nextafter(x, math.inf)

    def zero_added(t):  # the same double, another writing (needs a decimal point and no exponent)
        return t + "0" if "." in t and "e" not in t else t

    def with_head(obj):
        obj["trialRegistryHead"] = {"length": 80, "hash": "0" * 64}

    cases = [
        # name, mutate B (None for a byte copy), mutate A and B first (None: A is the registry itself), --ignore, exit, texts in the output
        ("identity, byte copy", None, None, None, 0, ["differing cells 0", "SUMMARY decisions 0, values 0 (beyond 1e-12: 0), digests 0"]),
        ("integer calib.n + 1", at(i_dir, lambda r: r["calib"].__setitem__("n", r["calib"]["n"] + 1)), None, None, 1,
         [f"DECISION {c0} calib.n:"]),
        ("float calib.qhat x (1 + 1e-9), beyond the contract", at(i_scale, bump_qhat(1e-9)), None, None, 1,
         [f"VALUE {cs} calib.qhat: A=", " beyond 1e-12\n", "(beyond 1e-12: 1)"]),
        ("float calib.qhat x (1 + 1e-13), inside the contract, listed", at(i_scale, bump_qhat(1e-13)), None, None, 1,
         [f"VALUE {cs} calib.qhat: A=", "values 1 (beyond 1e-12: 0)"]),
        ("float calib.qhat one ulp up", at(i_scale, lambda r: r["calib"].__setitem__("qhat", up(r["calib"]["qhat"]))), None, None, 1,
         [f"VALUE {cs} calib.qhat: A=", " ulps 1\n", "values 1 (beyond 1e-12: 0)"]),
        ("string status", at(i_dir, lambda r: r.__setitem__("status", "region" if r["status"] != "region" else "silence")), None, None, 1,
         [f"DECISION {c0} status:"]),
        ("digest calib.scoresSha256", at(i_dir, lambda r: r["calib"].__setitem__("scoresSha256", r["calib"]["scoresSha256"][:-1] + "x")),
         None, None, 1, [f"DIGEST {c0} calib.scoresSha256:", "digests 1"]),
        ("null to value live1", at(i_dir, lambda r: r.__setitem__("live1", {})), None, None, 1, [f"DECISION {c0} live1:"]),
        ("value to null calib.U", at(i_dir, lambda r: r["calib"].__setitem__("U", None)), None, None, 1, [f"DECISION {c0} calib.U:"]),
        ("boolean test.vetoed flipped", at(i_dir, lambda r: r["test"].__setitem__("vetoed", not r["test"]["vetoed"])), None, None, 1,
         [f"DECISION {c0} test.vetoed:"]),
        ("boolean test.vetoed as the number 0", at(i_dir, lambda r: r["test"].__setitem__("vetoed", 0)), None, None, 1,
         [f"DECISION {c0} test.vetoed:"]),
        ("integer calib.n written as a float, equal", at(i_dir, lambda r: r["calib"].__setitem__("n", float(r["calib"]["n"]))), None, None,
         0, ["differing cells 0"]),
        ("absent key epoch", at(i_dir, lambda r: r.pop("epoch")), None, None, 1, [f"DECISION {c0} epoch: A=1 B=<absent>"]),
        ("nested test.months k + 1", at(i_dir, lambda r: r["test"]["months"][first_month].__setitem__("k", r["test"]["months"][first_month]["k"] + 1)),
         None, None, 1, [f"DECISION {c0} test.months.{first_month}.k:"]),
        ("factor slot hourOfWeekFactors[5] x (1 + 1e-6)", at(i_scale, lambda r: r["hourOfWeekFactors"].__setitem__(5, r["hourOfWeekFactors"][5] * (1 + 1e-6))),
         None, None, 1, [f"VALUE {cs} hourOfWeekFactors[5]:", " beyond 1e-12\n"]),
        ("factor slot hourOfWeekFactors[5] one ulp up", at(i_scale, lambda r: r["hourOfWeekFactors"].__setitem__(5, up(r["hourOfWeekFactors"][5]))),
         None, None, 1, [f"VALUE {cs} hourOfWeekFactors[5]:", " ulps 1\n", "values 1 (beyond 1e-12: 0)"]),
        ("threshold thresholds.t1 x (1 + 1e-6)", at(i_dir, lambda r: r["thresholds"].__setitem__("t1", K.js_number(float(r["thresholds"]["t1"]) * (1 + 1e-6)))),
         None, None, 1, [f"VALUE {c0} thresholds.t1:", " beyond 1e-12\n"]),
        ("threshold thresholds.t1 one ulp up, written as JavaScript writes it",
         at(i_dir, lambda r: r["thresholds"].__setitem__("t1", K.js_number(up(float(r["thresholds"]["t1"]))))), None, None, 1,
         [f"VALUE {c0} thresholds.t1:", " ulps 1\n"]),
        ("threshold thresholds.t1, the same double with a trailing zero", at(i_dir, lambda r: r["thresholds"].__setitem__("t1", zero_added(r["thresholds"]["t1"]))),
         None, None, 1, [f"DECISION {c0} thresholds.t1:", "one double, two writings"]),
        ("top-level plan altered", lambda o: o.__setitem__("plan", "x"), None, None, 1, ["DECISION top-level plan:"]),
        ("top-level plan altered, --ignore plan", lambda o: o.__setitem__("plan", "x"), None, "plan", 0,
         ["ignored fields (1, closed list): plan", "differing cells 0, top-level differences 0"]),
        ("top-level engine altered", lambda o: o.__setitem__("engine", "x"), None, None, 1, ["DECISION top-level engine:"]),
        ("trialRegistryHead.length differs", lambda o: o["trialRegistryHead"].__setitem__("length", 81), with_head, None, 1,
         ["DECISION top-level trialRegistryHead.length: A=80 B=81"]),
        ("trialRegistryHead.hash differs, a decision (path 1)", lambda o: o["trialRegistryHead"].__setitem__("hash", "1" * 64), with_head,
         None, 1, ["DECISION top-level trialRegistryHead.hash: A=", "differing cells 0, top-level differences 1", "outside 0"]),
        ("row trialId altered", at(i_dir, lambda r: r.__setitem__("trialId", "x")), None, None, 1, [f"DECISION {c0} trialId:"]),
        ("calib.check1 altered", at(i_dir, lambda r: r["calib"].__setitem__("check1", "x")), None, None, 1, [f"DECISION {c0} calib.check1:"]),
        ("calib.check2 altered", at(i_dir, lambda r: r["calib"].__setitem__("check2", "x")), None, None, 1, [f"DECISION {c0} calib.check2:"]),
        ("calib.reason altered", at(i_dir, lambda r: r["calib"].__setitem__("reason", "x")), None, None, 1, [f"DECISION {c0} calib.reason:"]),
        ("row dropped", lambda o: o["rows"].pop(7), None, None, 2, ["pairs 279"]),
        ("row duplicated", lambda o: o["rows"].append(copy.deepcopy(o["rows"][0])), None, None, 2, ["STRUCTURE duplicate cell in B"]),
        ("row key renamed", at(i_dir, lambda r: r.__setitem__("key", r["key"] + "x")), None, None, 2, ["STRUCTURE unpaired in A"]),
        ("rows reversed, same cells", lambda o: o["rows"].reverse(), None, None, 0, ["differing cells 0"]),
        ("calib.qhat an integer beyond the doubles (N-6)", at(i_scale, lambda r: r["calib"].__setitem__("qhat", 10 ** 400)), None, None, 2,
         [f"STRUCTURE {cs} calib.qhat: an integer beyond the range of a double", "EXIT 2"]),
        ("float calib.qhat x (1 + 2e-12), beyond the contract", at(i_scale, bump_qhat(2e-12)), None, None, 1,
         [f"VALUE {cs} calib.qhat: A=", " beyond 1e-12\n", "(beyond 1e-12: 1)"]),
    ]
    lines = [MODEL, "# compare_check.py - self-tests of compare_p2.py (mission D-7, classes of lot 1d) on copies of a registry"]
    bad = 0
    for k, (name, mutate, both, ign, want_code, want_texts) in enumerate(cases, start=1):
        a_path, b_path, obj = src, f"{work}/case{k:02d}.json", copy.deepcopy(base)
        if both is not None:
            both(obj)
            a_path = f"{work}/case{k:02d}-a.json"
            dump(a_path, obj)
        if mutate is None:
            with open(b_path, "wb") as fh:
                fh.write(raw)
        else:
            mutate(obj)
            dump(b_path, obj)
        code, out = run(a_path, b_path, ign)
        ok = code == want_code and all(t in out for t in want_texts)
        bad += not ok
        named = next((ln for ln in out.split("\n") if ln.startswith(("DECISION", "VALUE", "DIGEST", "STRUCTURE"))), "-")
        lines.append(f"{'OK  ' if ok else 'FAIL'} case {k:02d} {name}: exit {code} (want {want_code}); first line: {named[:110]}")
    lines.append(f"cases {len(cases)}, failures {bad}")
    lines.extend(io_guard.input_lines())
    lines.append(f"VERDICT: {'GREEN' if bad == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(text, end="")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main(*(os.path.abspath(a) for a in sys.argv[1:4])))  # B-2: every path the guard judges is absolute
