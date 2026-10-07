# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only.
# Self-tests of compare_p2.py (mission D-7), through its command line, on copies of out/wave1-monark.json written under
# tmp/compare-check/: identity -> 0; a copy with one altered field -> non-zero exit and the field named in the DIFF line;
# tolerance of the float contract; the closed ignore list of D-6; structural faults (dropped, duplicated, renamed rows).
# Usage: python -B compare_check.py <out.txt>
import copy
import json
import os
import shutil
import subprocess
import sys

MODEL = "claude-opus-5-5"
TOOL = "F:/tmp/kata-p2b/tool/compare_p2.py"
SRC = "F:/tmp/kata-p2b/out/wave1-monark.json"
WORK = "F:/tmp/kata-p2b/tmp/compare-check"
IGNORE = "plan,engine,trialRegistryHead,trialId,calib.reason,calib.check1,calib.check2"


def run(copy_path, ignore):
    cmd = [sys.executable, "-B", TOOL, SRC, copy_path] + (["--ignore", IGNORE] if ignore else [])
    p = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, timeout=300)
    return p.returncode, p.stdout.decode("utf-8").replace("\r\n", "\n")  # a Windows text-mode stdout writes CR LF


def main(out_path):
    os.makedirs(WORK, exist_ok=True)
    base = json.load(open(SRC, encoding="utf-8"))
    rows = base["rows"]
    i_dir = 0
    i_scale = next(i for i, r in enumerate(rows) if "-range-" in r["taskClass"] and isinstance(r["calib"]["qhat"], float))
    r0, rs = rows[i_dir], rows[i_scale]
    first_month = next(iter(r0["test"]["months"]))

    def at(i, fn):
        def mutate(obj):
            fn(obj["rows"][i])
        return mutate

    def bump_qhat(f):
        def g(r):
            r["calib"]["qhat"] = r["calib"]["qhat"] * (1 + f)
        return g

    cases = [
        # name, mutate(obj) or None for a byte copy, ignore?, expected exit, expected text in the output
        ("identity, byte copy", None, False, 0, "differing cells 0"),
        ("identity with the D-6 ignore list", None, True, 0, "differing cells 0"),
        ("integer calib.n + 1", at(i_dir, lambda r: r["calib"].__setitem__("n", r["calib"]["n"] + 1)), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} calib.n:"),
        ("float calib.qhat x (1 + 1e-9)", at(i_scale, bump_qhat(1e-9)), True, 1, f"DIFF {rs['taskClass']} {rs['key']} calib.qhat:"),
        ("float calib.qhat x (1 + 1e-13), inside the contract", at(i_scale, bump_qhat(1e-13)), True, 0, "differing cells 0"),
        ("string status", at(i_dir, lambda r: r.__setitem__("status", "region" if r["status"] != "region" else "silence")), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} status:"),
        ("digest calib.scoresSha256", at(i_dir, lambda r: r["calib"].__setitem__("scoresSha256", r["calib"]["scoresSha256"][:-1] + "x")),
         True, 1, f"DIFF {r0['taskClass']} {r0['key']} calib.scoresSha256:"),
        ("null to value live1", at(i_dir, lambda r: r.__setitem__("live1", {})), True, 1, f"DIFF {r0['taskClass']} {r0['key']} live1:"),
        ("value to null calib.U", at(i_dir, lambda r: r["calib"].__setitem__("U", None)), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} calib.U:"),
        ("boolean test.vetoed flipped", at(i_dir, lambda r: r["test"].__setitem__("vetoed", not r["test"]["vetoed"])), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} test.vetoed:"),
        ("boolean test.vetoed as the number 0", at(i_dir, lambda r: r["test"].__setitem__("vetoed", 0)), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} test.vetoed:"),
        ("integer calib.n written as a float, equal", at(i_dir, lambda r: r["calib"].__setitem__("n", float(r["calib"]["n"]))), True, 0,
         "differing cells 0"),
        ("absent key epoch", at(i_dir, lambda r: r.pop("epoch")), True, 1, f"DIFF {r0['taskClass']} {r0['key']} epoch: A=1 B=<absent>"),
        ("nested test.months k + 1", at(i_dir, lambda r: r["test"]["months"][first_month].__setitem__("k", r["test"]["months"][first_month]["k"] + 1)),
         True, 1, f"DIFF {r0['taskClass']} {r0['key']} test.months.{first_month}.k:"),
        ("factor slot hourOfWeekFactors[5] x (1 + 1e-6)", at(i_scale, lambda r: r["hourOfWeekFactors"].__setitem__(5, r["hourOfWeekFactors"][5] * (1 + 1e-6))),
         True, 1, f"DIFF {rs['taskClass']} {rs['key']} hourOfWeekFactors[5]:"),
        ("threshold string thresholds.t1", at(i_dir, lambda r: r["thresholds"].__setitem__("t1", r["thresholds"]["t1"] + "1")), True, 1,
         f"DIFF {r0['taskClass']} {r0['key']} thresholds.t1:"),
        ("top-level plan, not ignored", lambda o: o.__setitem__("plan", "x"), False, 1, "DIFF top-level plan:"),
        ("top-level plan, ignored", lambda o: o.__setitem__("plan", "x"), True, 0, "differing cells 0"),
        ("row trialId, ignored", at(i_dir, lambda r: r.__setitem__("trialId", "x")), True, 0, "differing cells 0"),
        ("row trialId, not ignored", at(i_dir, lambda r: r.__setitem__("trialId", "x")), False, 1, f"DIFF {r0['taskClass']} {r0['key']} trialId:"),
        ("ignored calib.check1 altered", at(i_dir, lambda r: r["calib"].__setitem__("check1", {"x": 1})), True, 0, "differing cells 0"),
        ("row dropped", lambda o: o["rows"].pop(7), True, 2, "pairs 279"),
        ("row duplicated", lambda o: o["rows"].append(copy.deepcopy(o["rows"][0])), True, 2, "STRUCTURE duplicate cell in B"),
        ("row key renamed", at(i_dir, lambda r: r.__setitem__("key", r["key"] + "x")), True, 2, "STRUCTURE unpaired in A"),
        ("rows reversed, same cells", lambda o: o["rows"].reverse(), True, 0, "differing cells 0"),
    ]
    lines = [MODEL, "# compare_check.py - self-tests of compare_p2.py (mission D-7) on copies of out/wave1-monark.json",
             f"ignore list used where marked: {IGNORE}"]
    bad = 0
    for k, (name, mutate, ign, want_code, want_text) in enumerate(cases, start=1):
        path = f"{WORK}/case{k:02d}.json"
        if mutate is None:
            shutil.copyfile(SRC, path)
        else:
            obj = copy.deepcopy(base)
            mutate(obj)
            with open(path, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(obj, fh, indent=1)
                fh.write("\n")
        code, out = run(path, ign)
        ok = code == want_code and want_text in out
        bad += not ok
        named = next((ln for ln in out.split("\n") if ln.startswith("DIFF") or ln.startswith("STRUCTURE")), "-")
        lines.append(f"{'OK  ' if ok else 'FAIL'} case {k:02d} {name}: exit {code} (want {want_code}); first line: {named[:110]}")
    lines.append(f"cases {len(cases)}, failures {bad}")
    lines.append(f"VERDICT: {'GREEN' if bad == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(text, end="")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
