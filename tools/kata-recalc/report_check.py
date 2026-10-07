# claude-opus-5-5 - 2026-10-07 - lot 1e of VERIFIERS-LIST-F5A-1 (M-11), Python 3.14 standard library only, no network.
# Self-tests of report.py on synthetic candles and registries, never a series (the run on the series is part 2): the log port against
# Node's measured outputs; the canonical writer; the platform and the C library of log; the tool's identity (the git reading at the
# commit of lot 1d, whose tree digest is that lot's pin, and each refusal of the tree rule); the three passes on four synthetic walks;
# each class and each refusal of the classification, through compare_p2.py run as a child as report.py runs it; the report's bytes;
# report.py run as a child (usage, an output that is not empty, a failed run that writes no report).
# REASON-ORDER-GUARD-VERIFIER-1 (2026-10-07): section 9, the reason of a cell through recalc_p2.calibrate_cell (whose rows the passes
# and the report compare), on hand-built CALIB points of one direction cell: no candle, no series.
# Usage: python -B report_check.py <repository> <work dir> <out.txt>
import io_guard  # the input guard, before any other module (M-7): only the C library of log is read, under the role libm
import copy
import hashlib
import json
import math
import os
import re
import sys

import fdlibm_log as L
import kata_lib as K
import recalc_p2 as R
import report as P

MODEL = "claude-opus-5-5"
LOT_1D = ("2a46eeb8a7481f2b5d2a65e7baabb7636a673dd1", "ff72522e3abe1b7b311854ef807b25b69f6653fbec3b510be85dfba0fdeda1ac")  # G0 section 14
ORACLE_TEXTS = ("conformance checks on vectors.json: 333 (KATA-SPEC l.5 counts 333), failures 0\nVERDICT: GREEN (0 failure(s) over all sections)",
                "checks 16821, failures 0\nVERDICT: GREEN\ntests 24, assertions replayed 207756, failures 0, not replayed 4\nVERDICT: GREEN")


def walk(seed0):
    """Synthetic 15-minute candles over the whole recording range, an LCG walk as in the smoke test of lot 1d: never a series."""
    seed = [seed0]

    def nxt():
        seed[0] = (seed[0] * 1103515245 + 12345) & 0xFFFFFFFF
        return (seed[0] >> 8) / 16777216
    candles, price = {}, 100.0
    for t in range(K.REC_START, K.REC_END, K.STEP_MS):
        o = price
        price = price * (1 + (nxt() - 0.5) * 0.01)
        vol = 10 + nxt() * 5
        candles[t] = (o, max(o, price) * (1 + nxt() * 0.002), min(o, price) * (1 - nxt() * 0.002), price, vol, vol * nxt())
    return candles


def dump(path, obj):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(K.js_json_pretty(obj) + "\n")


def main(repo, work, out_path):
    io_guard.declare("libm")
    io_guard.output(work)
    io_guard.output(out_path)
    os.makedirs(work, exist_ok=True)
    lines = [MODEL, "# report_check.py - self-tests of report.py (lot 1e) on synthetic candles and registries, no series"]
    bad = [0]

    def rec(name, ok, detail=""):
        bad[0] += not ok
        lines.append(f"{'OK  ' if ok else 'FAIL'} {name}" + ("" if ok or not detail else f": {str(detail)[:160]}"))

    def refused(fn, *a):
        try:
            fn(*a)
        except P.Failed as e:
            return e.code, e.why
        return 0, None

    # 1. the log port, against the outputs of Node's Math.log (fdlibm_log.VECTORS)
    checks, fails, names, differing = L.held_to_vectors(math.log)
    rec(f"log port: {checks} checks, {L.VECTORS['count']} measured outputs of Node v24.21.0 reproduced bit for bit", fails == 0, names)

    # 2. the canonical writer
    rec("canonical: sorted keys, no space, JSON escapes", P.canonical({"b": [1, None, True], "a": 'x"y'}) == '{"a":"x\\"y","b":[1,null,true]}')
    for name, v in (("a non-ASCII string", chr(233)), ("a double", 0.5), ("an integer beyond 2^53 - 1", 2 ** 53)):
        rec(f"canonical refuses {name}", refused(P.canonical, v)[0] == 2)

    # 3. the platform, without platform.platform() (socket.gethostname, _wmi.exec_query)
    plat = P.platform_fields()
    rec(f"platform: {plat['system']}, {plat['machine']}", re.fullmatch(r"Windows-\w+-\d+\.\d+\.\d+-SP\d+", plat["system"]) is not None
        and plat["machine"] != "")
    lib = plat["libm"]
    rec(f"libm: {lib['name']} {lib['version']} {lib['sha256'][:16]}", re.fullmatch(r"\d+\.\d+\.\d+\.\d+", lib["version"]) is not None
        and any(d["role"] == "libm" and d["name"] == "ucrtbase.dll" and d["sha256"] == lib["sha256"] for d in io_guard.inputs()))
    rec("the version resource is required", refused(P.file_version, b"\0" * 64)[0] == 2)
    rec(f"the host's log differs from the port on {differing} measured inputs; with the C library of the measure, on "
        f"{L.VECTORS['differ_from_host_libm']}", lib["sha256"] != L.VECTORS["host_libm_sha256"] or differing == L.VECTORS["differ_from_host_libm"])
    rec("a fingerprint other than the measured one, with the C library of the measure, is refused",
        refused(P.fingerprint, {"sha256": L.VECTORS["host_libm_sha256"]}, differing + 1)[0] == 2 and P.fingerprint({"sha256": "0" * 64}, 1) == 1)

    # 4. the tool's identity: git at the commit of lot 1d gives that lot's pin; each departure of the tree rule is refused
    commit, entries = io_guard.git_tree(repo, "tools/kata-recalc", LOT_1D[0])
    running = {p[len("tools/kata-recalc/"):]: b for m, p, b in entries}
    rec("tree digest at the commit of lot 1d is its pin", commit == LOT_1D[0] and P.tree_digest(entries, running) == LOT_1D[1])
    one = entries[0]
    departures = (("an executable", [("100755", *one[1:])] + entries[1:], running),
                  ("a link", [("120000", *one[1:])] + entries[1:], running),
                  ("a file that runs and is not in the tree", entries, {**running, "extra.py": b"x"}),
                  ("a file of the tree that does not run", entries, {k: v for k, v in running.items() if k != one[1].rsplit("/", 1)[1]}),
                  ("a byte changed", entries, {**running, one[1].rsplit("/", 1)[1]: one[2] + b" "}),
                  ("an empty tree", [], {}))
    for name, ents, run in departures:
        rec(f"tree refuses {name}", refused(P.tree_digest, ents, run)[0] == 2)

    # 5. the passes on four synthetic walks
    series = [(sym, low, hashlib.sha256(sym.encode()).hexdigest(), walk(seed)) for (sym, low, _), seed in zip(R.SYMBOLS, (11, 22, 33, 44))]
    base_text, base_rows, variants, census = P.run_passes(series)
    a = json.loads(base_text)
    ln, assoc = (json.loads(variants[n][0]) for n in ("ln", "association"))
    rec(f"passes: 280 rows each, base rows are the registry rows", len(base_rows) == 280 and a["rows"] == base_rows and len(ln["rows"]) == 280)
    rec(f"ln pass: {census['differing']} of {census['log_inputs']} log inputs differ, by one ulp", census["differing"] > 0 and census["max_ulps"] == 1)
    moved = [x["kataId"] for x, y in zip(ln["rows"], assoc["rows"]) if x != y]
    rec(f"association pass: {len(moved)} rows apart from the ln pass, all of the EWMA kata", moved != [] and set(moved) == {"ewma-vol-hw-v1"})
    rec("ln pass: rows moved", any(x != y for x, y in zip(a["rows"], ln["rows"])))
    paths = {n: os.path.join(work, f"{n}.json") for n in ("a", "ln", "association")}
    for n, text in (("a", base_text), ("ln", variants["ln"][0]), ("association", variants["association"][0])):
        with open(paths[n], "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)

    # 6. classes and refusals, through compare_p2.py as a child
    def stage(k, b):
        b_path = os.path.join(work, f"case{k:02d}", "wave1.json")
        os.mkdir(os.path.dirname(b_path))
        dump(b_path, b)
        log = {"steps": []}
        main_cmp = P.compare(log, "comparison", paths["a"], b_path)
        var = {P.LN: P.compare(log, "ln", paths["ln"], b_path), P.ASSOC: P.compare(log, "association", paths["association"], b_path)}
        try:
            return 0, P.classify(main_cmp, var), b_path
        except P.Failed as e:
            return e.code, e.why, b_path

    infos = {n: v[1] for n, v in variants.items()}
    scale = next(i for i, r in enumerate(a["rows"]) if r["kataId"] == "realized-vol-hw-v1" and isinstance(r["calib"]["qhat"], float))
    slot = next((i, j) for i, (x, y) in enumerate(zip(a["rows"], ln["rows"])) if x["hourOfWeekFactors"]
                for j, (u, v) in enumerate(zip(x["hourOfWeekFactors"], y["hourOfWeekFactors"])) if u is not None and u == v)

    def edit(obj, fn):
        o = copy.deepcopy(obj)
        fn(o)
        return o

    def nudge(o):
        o["rows"][slot[0]]["hourOfWeekFactors"][slot[1]] = math.nextafter(o["rows"][slot[0]]["hourOfWeekFactors"][slot[1]], math.inf)

    cases = [  # name, B, exit, test on the result
        ("B the recomputation itself", a, 0, lambda r: r == []),
        ("B written under the generator's log", ln, 0, lambda r: r != [] and {x[3] for x in r} == {P.LN}),
        ("B written under the generator's log with the other order of the EWMA term", assoc, 0, lambda r: {x[3] for x in r} == {P.LN, P.ASSOC}
         and all("ewma-vol-hw-v1@" in x[0][1] for x in r if x[3] == P.ASSOC)),
        ("B under the generator's log, its trial head hash set (outside the decisions)",
         edit(ln, lambda o: o["trialRegistryHead"].__setitem__("hash", "1" * 64)), 0, lambda r: r != [] and {x[3] for x in r} == {P.LN}),
        ("B under the generator's log, one factor one more ulp: not explained", edit(ln, nudge), 1, lambda w: "1 difference(s) not explained" in w),
        ("B with calib.n + 1 in one row: a decision", edit(a, lambda o: o["rows"][0]["calib"].__setitem__("n", o["rows"][0]["calib"]["n"] + 1)),
         1, lambda w: "decision(s) differ" in w),
        ("B with a top-level engine changed: a decision", edit(a, lambda o: o.__setitem__("engine", "x")), 1, lambda w: "decision(s) differ" in w),
        ("B with a qhat x (1 + 1e-9): beyond the contract",
         edit(a, lambda o: o["rows"][scale]["calib"].__setitem__("qhat", o["rows"][scale]["calib"]["qhat"] * (1 + 1e-9))), 1, lambda w: "beyond 1e-12" in w),
        ("B with a row dropped: structure", edit(a, lambda o: o["rows"].pop(5)), 2, lambda w: "structural fault" in w),
    ]
    explained = None
    for k, (name, b, want, test) in enumerate(cases, start=1):
        code, res, b_path = stage(k, b)
        ok = code == want and test(res)
        rec(f"case {k:02d} {name}: exit {code} (want {want})", ok, res if code else "")
        if k == 2:
            explained = (res, b_path)

    # 7. the report's bytes, from case 02
    res, b_path = explained
    entries_ = P.entries_of(res, infos)
    digests = [e for e in entries_ if e["kind"] == "digest"]
    rec(f"differences: {len(entries_)} listed, {len(digests)} digests with their first term", digests != [] and all(
        e["terms"] >= 1 and 0 <= e["first_index"] for e in digests) and all(e["kind"] == "value" and e["ulps"] >= 1 for e in entries_ if e not in digests))
    with open(b_path, "rb") as fh:  # this run wrote it
        b_bytes = fh.read()
    oracles = P.oracles_of(*ORACLE_TEXTS, (34, 0))
    rec("oracle outputs parse", oracles["second_writing"] == {"checks": 16821, "failures": 0} and oracles["engine_tests"]["not_replayed"] == 4)
    inputs = {("series", f"{s}-15m.csv", p, 1) for s, _, p, _ in series} | {tuple(d.values()) for d in io_guard.inputs()}
    args = (LOT_1D, plat, oracles, inputs, ("registry", "wave1.json", hashlib.sha256(b_bytes).hexdigest(), len(b_bytes)), base_rows, res, infos, census)
    text = P.canonical(P.assemble(*args))
    rep = json.loads(text)
    rec("report: canonical (sorted keys, compact), ASCII, no line break, the same bytes twice",
        text == P.canonical(json.loads(text)) and text.isascii() and "\n" not in text and "\r" not in text and text == P.canonical(P.assemble(*args)))
    rec("report: cells sorted and decisions equal, differences sorted", [(c["task_class"], c["cell_key"]) for c in rep["cells"]] == sorted(
        (r["taskClass"], r["key"]) for r in base_rows) and all(c["decisions_equal"] for c in rep["cells"]) and [
        (d["task_class"], d["cell_key"], d["field"]) for d in rep["differences"]] == sorted((d["task_class"], d["cell_key"], d["field"]) for d in rep["differences"]))
    rec("report: one field outside the decisions, its reason in words", rep["fields"]["outside_decisions"] == [
        {"field": "trialRegistryHead.hash", "reason": P.TEXTS["outside_reason"]}] and re.search(r"[A-Z]+-[A-Z0-9-]+-\d", text) is None)
    rec("report: no local path, no drive", re.search(r"[A-Za-z]:[\\/]", text) is None and work not in text and repo not in text)
    with open(os.path.join(work, "report-synthetic.json"), "w", encoding="ascii", newline="\n") as fh:
        fh.write(text)  # read by the spec gate in the measures of G0 section 15

    # 8. report.py as a child
    def run(*argv):
        return io_guard.run_tool("report.py", list(argv)).returncode

    rec("report.py: usage", run("--repo", repo) == 2)
    rec("report.py: an output that is not empty is refused by the guard", run("--repo", repo, "--series", work, "--vectors", work,
                                                                              "--registry", b_path, "--out", work) == io_guard.REFUSED_EXIT)
    fail_out = os.path.join(work, "failed-run")
    code = run("--repo", repo, "--series", os.path.join(work, "no-series"), "--vectors", os.path.join(work, "no-vectors.json"),
               "--registry", b_path, "--out", fail_out)
    rec(f"report.py: a run that cannot finish exits 2 and writes run-log.json only (exit {code})",
        code == 2 and os.path.lexists(os.path.join(fail_out, "run-log.json")) and not os.path.lexists(os.path.join(fail_out, "report.json")))

    # 9. the reason of a cell (REASON-ORDER-GUARD-VERIFIER-1), in the order of RECHERCHES' written decision f51322c (piece
    # short-digest-spec-text section B): under_calib; then a constant auxiliary sequence, whatever check 1 says; then a rejection by
    # either check; then the misses of a direction cell. Down side of a direction cell: a flat label is a miss and the label sequence
    # counts the up labels only, so check 1 can reject while check 2 is empty. 40 points (k* 12 at alpha 0.45, n0 6) unless stated
    kid, h1 = "trend-ema-v1", K.H_MS["1h"]
    cell = {"kind": "dir", "kata": kid, "side": "down", "bucket": "down-b1", "symbol": "BTCUSDT", "horizon": "1h", "taskClass": "btc-dir-1h",
            "key": f"kata:{kid}@{R.VENUE}/BTCUSDT/1h/down-b1"}
    thr = {kid: {"up": {"t1": "0.1", "t2": "0.2"}, "down": {"t1": "0.1", "t2": "0.2"}}}

    def calib_of(labels):
        pts = [{"t": K.BLOCKS["CALIB"][0] + i * h1, "v": {kid: -0.05}, "y": y, "r": None, "D": None, "U": None} for i, y in enumerate(labels)]
        c = R.calibrate_cell(cell, {"CALIB": pts, "TEST": []}, thr, {}, h1, "0" * 64)[0]["calib"]
        return c["check1"], c["check2"], c["qhat"], c["status"], c["reason"]

    constant, rejects = "auxiliary sequence constant (fails closed)", "dependence check rejects"
    for name, labels, want in (  # name, labels in time order, (check1, check2, qhat, status, reason)
            ("check 1 rejects, no up label", ["flat"] * 6 + ["down"] * 34, ("reject", "empty", 0, "silence", constant)),
            ("check 1 rejects, one up label inside", ["flat"] * 6 + ["down"] * 17 + ["up"] + ["down"] * 16, ("reject", "pass", 0, "silence", rejects)),
            ("check 1 passes, no up label", ["flat" if i % 5 == 0 else "down" for i in range(40)], ("pass", "empty", 0, "silence", constant)),
            ("check 1 empty, no up label", ["down"] * 40, ("empty", "empty", 0, "silence", constant)),
            ("qhat 1, check 2 rejects", ["up"] * 20 + ["down"] * 20, ("empty", "reject", 1, "silence", rejects)),
            ("qhat 1, check 2 passes", ["up" if i % 2 == 0 else "down" for i in range(40)], ("empty", "pass", 1, "silence", "misses 20 above k* 12")),
            ("qhat 0, both checks pass", ["up" if i % 5 == 0 else "down" for i in range(40)], ("pass", "pass", 0, "region", "")),
            ("5 points, below n0", ["down"] * 5, ("n/a", "n/a", None, "under_calib", "n 5 below n0 6"))):
        got = calib_of(labels)
        rec(f"reason of a down-side direction cell, {name}: {want[4]!r}", got == want, got)

    lines.append(f"failures {bad[0]}")
    lines.extend(io_guard.input_lines())
    lines.append(f"VERDICT: {'GREEN' if bad[0] == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(text, end="")
    return 0 if bad[0] == 0 else 1


if __name__ == "__main__":
    sys.exit(main(*(os.path.abspath(a) for a in sys.argv[1:4])))  # B-2: every path the guard judges is absolute
