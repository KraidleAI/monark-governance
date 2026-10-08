# claude-opus-5-5 - 2026-10-07 - lot 1e of VERIFIERS-LIST-F5A-1 (M-11), Python 3.14 standard library only, no network.
# Self-tests of report.py on synthetic candles and registries, never a series (the run on the series is part 2): the log port against
# Node's measured outputs; the canonical writer; the platform and the C library of log; the tool's identity (the git reading at the
# commit of lot 1d, whose tree digest is that lot's pin, and each refusal of the tree rule); the three passes on four synthetic walks;
# each class and each refusal of the classification, through compare_p2.py run as a child as report.py runs it; the report's bytes;
# report.py run as a child (usage, an output that is not empty, a failed run that writes no report).
# REASON-ORDER-GUARD-VERIFIER-1 (2026-10-07): section 9, the reason of a cell through recalc_p2.calibrate_cell (whose rows the passes
# and the report compare), on hand-built CALIB points of one direction cell: no candle, no series. Frozen-tool lot (2026-10-07): the
# tool's tree read from git under the role tool-tree (io_guard.git_tree, N-5); the trial head of KATA-SPEC section 8 (path 1, sections
# 5, 6 and 10); a pass that differs from B in a decision explains nothing (N-3 of #217, case 10); the digests and the scope of the
# report (section 7); report.run() to its end, children faked but the comparator's (N-4 of #217, section 11). Its G2: the four guards
# that no case reached (sections 7 and 10), and the count line of the vectors oracle of the frozen revision. MONARK's decisions of
# 2026-10-07: the replay command's form and input names (section 8), a closed list of C libraries of log (section 3).
# Usage: python -E -S -s -B -P report_check.py <repository> <work dir> <out.txt>
import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked its folder (IO-GUARD-POSED-FILES-1)
if "io_guard" not in sys.modules:  # io_guard.py run by its path, never found by name: nothing posed or installed stands in for it
    sys.path.append(_d := os.path.dirname(os.path.realpath(__file__)))  # the tool's folder, last in sys.path: -P is in FORM
    _g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
    exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))
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
ORACLE_TEXTS = ("conformance checks on vectors.json: 363 (KATA-SPEC section 6 counts 363), failures 0\nVERDICT: GREEN (0 failure(s) over all sections)",
                "checks 16821, failures 0\nVERDICT: GREEN\ntests 24, assertions replayed 207756, failures 0, not replayed 4\nVERDICT: GREEN")
# KATA-SPEC section 8 point 5, frozen in R1 (KATA-SPEC-proposed.md c8ce9720... at 9c1b486; section 8 the same bytes at 94cd153): the head of
# wave 1, which trial-head-check.mjs of RECHERCHES recomputed from the text; the tool recomputes it from its own trials (76ffa25, decision 2)
TRIAL_HEAD = {"length": 80, "hash": "648709d0ae8e858e80a527b4b69cf6629f4f9fb7e8b4b5d15752bb7e383caa0e"}


def safe(fn, *a):
    """fn(*a), or the exception it raises: a check of a function that the tool before this lot lacks fails, it never stops the run."""
    try:
        return fn(*a)
    except Exception as e:
        return e


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
    io_guard.declare("libm", "tool-tree")
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
    rec(f"the host's log differs from the port on {differing} measured inputs; its C library is in the measured list, with that number",
        getattr(P, "LIBMS", {}).get(lib["sha256"]) == (lib["version"], differing))
    rec("a C library of log outside the measured list, with another version, or another fingerprint, is refused", all(refused(
        P.fingerprint, dict(lib, **d), differing + n)[0] == 2 for d, n in (({"sha256": "0" * 64}, 0), ({"version": "0.0.0.0"}, 0), ({}, 1))))

    # 4. the tool's identity: git at the commit of lot 1d gives that lot's pin; each departure of the tree rule is refused
    commit, entries = io_guard.git_tree(repo, LOT_1D[0])
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
    heads = [o.get("trialRegistryHead") or {} for o in (a, ln, assoc)]
    rec(f"trial head of each pass (KATA-SPEC section 8, path 1): length {heads[0].get('length')}, hash {str(heads[0].get('hash'))[:16]}",
        heads == [TRIAL_HEAD] * 3)
    paths = {n: os.path.join(work, f"{n}.json") for n in ("a", "ln", "association")}
    for n, text in (("a", base_text), ("ln", variants["ln"][0]), ("association", variants["association"][0])):
        with open(paths[n], "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)

    # 6. classes and refusals, through compare_p2.py as a child
    def stage(k, b, passes=None):
        b_path = os.path.join(work, f"case{k:02d}", "wave1.json")
        os.mkdir(os.path.dirname(b_path))
        dump(b_path, b)
        pp = {n: paths[n] for n in ("ln", "association")}
        for n, obj in (passes or {}).items():  # pass files of this case only (N-3)
            pp[n] = os.path.join(work, f"case{k:02d}", f"{n}.json")
            dump(pp[n], obj)
        log = {"steps": []}
        main_cmp = P.compare(log, "comparison", paths["a"], b_path)
        var = {P.LN: P.compare(log, "ln", pp["ln"], b_path), P.ASSOC: P.compare(log, "association", pp["association"], b_path)}
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

    def bump_n(o):
        o["rows"][0]["calib"]["n"] += 1

    cases = [  # name, B, exit, test on the result[, the pass files of the case]
        ("B the recomputation itself", a, 0, lambda r: r == []),
        ("B written under the generator's log", ln, 0, lambda r: r != [] and {x[3] for x in r} == {P.LN}),
        ("B written under the generator's log with the other order of the EWMA term", assoc, 0, lambda r: {x[3] for x in r} == {P.LN, P.ASSOC}
         and all("ewma-vol-hw-v1@" in x[0][1] for x in r if x[3] == P.ASSOC)),
        ("B under the generator's log, its trial head hash altered: a decision (path 1)",
         edit(ln, lambda o: o["trialRegistryHead"].__setitem__("hash", "1" * 64)), 1, lambda w: "decision(s) differ" in w),
        ("B under the generator's log, one factor one more ulp: not explained", edit(ln, nudge), 1, lambda w: "1 difference(s) not explained" in w),
        ("B with calib.n + 1 in one row: a decision", edit(a, bump_n), 1, lambda w: "decision(s) differ" in w),
        ("B with a top-level engine changed: a decision", edit(a, lambda o: o.__setitem__("engine", "x")), 1, lambda w: "decision(s) differ" in w),
        ("B with a qhat x (1 + 1e-9): beyond the contract",
         edit(a, lambda o: o["rows"][scale]["calib"].__setitem__("qhat", o["rows"][scale]["calib"]["qhat"] * (1 + 1e-9))), 1, lambda w: "beyond 1e-12" in w),
        ("B with a row dropped: structure", edit(a, lambda o: o["rows"].pop(5)), 2, lambda w: "structural fault" in w),
        ("B under the generator's log, both pass files with calib.n + 1 in one row: no pass explains (N-3)", ln, 1,
         lambda w: "not explained" in w, {"ln": edit(ln, bump_n), "association": edit(assoc, bump_n)}),
    ]
    explained = None
    for k, (name, b, want, test, *passes) in enumerate(cases, start=1):
        code, res, b_path = stage(k, b, *passes)
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
    rec("differences: no digest written, no 64 hexadecimal digits (point 1 of cb00b19)", all("a" not in e and "b" not in e for e in digests)
        and re.search(r"[0-9a-fA-F]{64}", json.dumps(entries_)) is None)
    with open(b_path, "rb") as fh:  # this run wrote it
        b_bytes = fh.read()
    oracles = P.oracles_of(*ORACLE_TEXTS, (34, 0))
    rec("oracle outputs parse", oracles["second_writing"] == {"checks": 16821, "failures": 0} and oracles["engine_tests"]["not_replayed"] == 4)
    inputs = {("series", f"{s}-15m.csv", p, 1) for s, _, p, _ in series} | {tuple(d.values()) for d in io_guard.inputs()}
    args = (LOT_1D, plat, oracles, inputs, ("registry", "wave1.json", hashlib.sha256(b_bytes).hexdigest(), len(b_bytes)), base_rows, res, infos, census,
            {"ln": ln["rows"], "association": assoc["rows"]})

    def report_bytes():  # B of case 02 is the ln pass: its scores digests are B's
        text = P.canonical(P.assemble(*args))
        rep = json.loads(text)
        rec("report: canonical (sorted keys, compact), ASCII, no line break, the same bytes twice",
            text == P.canonical(json.loads(text)) and text.isascii() and "\n" not in text and "\r" not in text and text == P.canonical(P.assemble(*args)))
        rec("report: cells sorted and decisions equal, differences sorted", [(c["task_class"], c["cell_key"]) for c in rep["cells"]] == sorted(
            (r["taskClass"], r["key"]) for r in base_rows) and all(c["decisions_equal"] for c in rep["cells"]) and [
            (d["task_class"], d["cell_key"], d["field"]) for d in rep["differences"]] == sorted((d["task_class"], d["cell_key"], d["field"]) for d in rep["differences"]))
        rec("report: no field outside the decisions (path 1), no name of the registry (N-6), no item name", "outside_decisions" not in rep["fields"]
            and "file" not in rep["registry"] and re.search(r"[A-Z]+-[A-Z0-9-]+-\d", text) is None)
        own, of_b = ({(r["taskClass"], r["key"]): r["calib"]["scoresSha256"] for r in o["rows"]} for o in (a, ln))
        cells = {(c["task_class"], c["cell_key"]): c.get("scores_sha256", "absent") for c in rep["cells"]}
        scoped = [k for k in cells if k[0] in rep.get("scope", [])]
        moved_ = [k for k in scoped if own[k] != of_b[k]]
        rec(f"report: scope of {len(rep.get('scope', []))} band classes, {len(scoped)} cells with B's scores digest ({len(moved_)} of them the ln "
            f"pass's, not the base pass's), {len(cells) - len(scoped)} cells held at null", rep.get("scope") == sorted(P.RELEASE_1_CLASSES) and len(scoped) == 40
            and all(re.fullmatch(r"[a-z]+-(range|mae-down|mae-up)-[14]h", c) for c in rep["scope"]) and all(cells[k] == of_b[k] for k in scoped)
            and moved_ != [] and all(cells[k] is None for k in cells if k not in scoped))
        hexed = res + [(("btc-range-1h", "k", "calib.qhat"), "VALUE", f"A={'0' * 64} B=0x1p+0 ulps 1", P.LN)]
        rec("report: 64 hexadecimal digits under differences are refused (premise V-3)", refused(P.assemble, *args[:6], hexed, *args[7:])[0] == 2)
        # reddened by: the check that the pass which explains a cell gives B's scores digest removed (report.py cell_digests)
        forged = {**args[9], "ln": [dict(r, calib=dict(r["calib"], scoresSha256="0" * 64)) if (r["taskClass"], r["key"]) == moved_[0] else r
                                     for r in args[9]["ln"]]}
        rec("report: a pass that does not give B's scores digest on a cell it explains is refused", refused(P.assemble, *args[:9], forged)[0] == 2)
        # reddened by: the refusal of a class of the scope without a cell removed (report.py assemble)
        short = [r for r in base_rows if r["taskClass"] != P.RELEASE_1_CLASSES[0]]
        rec("report: a class of the scope without a cell is refused", refused(P.assemble, *args[:5], short, *args[6:])[0] == 2)
        rec("report: no local path, no drive", re.search(r"[A-Za-z]:[\\/]", text) is None and work not in text and repo not in text)
        with open(os.path.join(work, "report-synthetic.json"), "w", encoding="ascii", newline="\n") as fh:
            fh.write(text)  # read by the spec gate in the measures of G0 sections 15 and 17
    err = safe(report_bytes)
    if err is not None:
        rec("report: assembled from case 02", False, err)

    # 8. report.py as a child
    def run(*argv):
        return io_guard.run_tool("report.py", list(argv)).returncode

    vectors = os.path.join(work, "vectors.json")  # the base name of the replay command, never read here
    rec("report.py: usage", run("--repo", repo) == 2)
    rec("report.py: an output that is not empty is refused by the guard", run("--repo", repo, "--series", work, "--vectors", vectors,
                                                                              "--registry", b_path, "--out", work) == io_guard.REFUSED_EXIT)
    fail_out = os.path.join(work, "failed-run")
    code = run("--repo", repo, "--series", os.path.join(work, "no-series"), "--vectors", os.path.join(work, "no-vectors", "vectors.json"),
               "--registry", b_path, "--out", fail_out)
    rec(f"report.py: a run that cannot finish exits 2 and writes run-log.json only (exit {code})",
        code == 2 and os.path.lexists(os.path.join(fail_out, "run-log.json")) and not os.path.lexists(os.path.join(fail_out, "report.json")))
    # MONARK's decisions on the replay command (2026-10-07). Reddened by: its form other than python -E -S -s -B -P, NAMES of report.py not
    # the two names that it writes, the refusal of report.py main removed or an option left unchecked (the output is then made), a name
    # compared without its case, by its start or by its stem, or the refusal moved after the guard (the last run, whose output is not
    # empty, then exits 4). Before it, the same bytes under another name gave another report_sha256 (inputs lists the name)
    replay = P.TEXTS["replay"]
    rec("report.py: the replay command runs python -E -S -s -B -P and names the two inputs as report.py requires them", replay.startswith(
        "python -E -S -s -B -P tools/kata-recalc/report.py ") and sorted(getattr(P, "NAMES", ())) == [("registry", "wave1.json"), ("vectors", "vectors.json")]
        and all(f"--{k} <{n}>" in replay for k, n in P.NAMES))
    for k, (opt, name, dest) in enumerate((("registry", "B.json", None), ("registry", "WAVE1.JSON", None), ("vectors", "spec-vectors.json", None),
                                           ("registry", "wave1.jsonl", None), ("registry", "wave1.JSON", None), ("vectors", "vectors.jsonl", None),
                                           ("registry", "B.json", work)), start=1):
        given, dest = {"vectors": vectors, "registry": b_path, opt: os.path.join(work, "names", name)}, dest or os.path.join(work, f"named-{k}")
        p = io_guard.run_tool("report.py", ["--repo", repo, "--series", work, "--vectors", given["vectors"], "--registry", given["registry"], "--out", dest])
        said = p.stdout.decode("utf-8", "replace").strip()
        rec(f"report.py: --{opt} named {name}, refused before any computation{', before the guard of an output not empty' if dest == work else ', no output made'}"
            f" (exit {p.returncode})", p.returncode == 2 and f"--{opt} is named {name!a}" in said and (dest == work or not os.path.lexists(dest)), said)

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

    # 10. the trial chain (path 1): the trials of the base pass, in the order of section 8 point 1 whatever the order of the rows; the
    # hash moves when two trials swap, a key is renamed or a value changes; trials whose cells disagree, a row in no trial, a trial
    # without cells and a string outside the canonical form are refused
    def chain_checks():
        trials = R.trials_of(base_rows)
        head = R.trial_chain(trials)
        rec(f"trials: {len(trials)} in the order of section 8 point 1, eight keys each; head {head['length']} {head['hash'][:16]}, the same "
            "from the rows reversed", [(t["taskClass"], t["kataId"]) for t in trials] == R.trial_order() and all(len(t) == 8 for t in trials)
            and head == TRIAL_HEAD and R.trial_chain(R.trials_of(base_rows[::-1])) == TRIAL_HEAD)
        for name, ts in (("two trials swapped", [trials[1], trials[0], *trials[2:]]),
                         ("a key renamed", [{("Block" if k == "block" else k): v for k, v in trials[0].items()}, *trials[1:]]),
                         ("a value changed", [dict(trials[0], W=trials[0]["W"] + 1), *trials[1:]])):
            rec(f"chain: {name}, another hash", R.trial_chain(ts)["hash"] != TRIAL_HEAD["hash"])
        for name, rows in (("a cell of a trial with another venue", [dict(base_rows[0], venue="x"), *base_rows[1:]]),
                           ("a row in no trial", [*base_rows, dict(base_rows[0], kataId="x")]),
                           ("a trial without its cells", [r for r in base_rows if r["kataId"] != "tsmom-v1"])):
            rec(f"trials refuse {name}", isinstance(safe(R.trials_of, rows), R.Stop))
        rec("chain refuses a value with a double quote", isinstance(safe(R.trial_chain, [dict(trials[0], venue='a"b')]), R.Stop))
        one = ("btc-range-1h", "realized-vol-hw-v1")  # a scale trial: one cell
        # reddened by: the check of the form of the trialId removed (recalc_p2.trials_of, point 2)
        rec("trials refuse a trial whose trialId has another form", isinstance(safe(R.trials_of, [dict(r, trialId="x") if (
            r["taskClass"], r["kataId"]) == one else r for r in base_rows]), R.Stop))
        # reddened by: the clause "one venue serves the wave" removed (recalc_p2.trials_of, point 2): every cell of one trial on another
        # venue, its trialId written for that venue, agrees with itself and keeps the form
        rec("trials refuse a wave served by two venues", isinstance(safe(R.trials_of, [dict(r, venue="x", trialId=r["trialId"].replace(
            f"|{R.VENUE}|", "|x|")) if (r["taskClass"], r["kataId"]) == one else r for r in base_rows]), R.Stop))
    err = safe(chain_checks)
    if err is not None:
        rec("trial chain: checked", False, err)

    # 11. report.run() to its end (N-4 of #217): the platform, the identity, the log port, the oracles, the recomputation, the series and
    # the passes stand in (those of sections 1, 3 and 5: no commit, no series); the three comparator children, the classification, the
    # assembly and the writing of report.json run as report.py runs them. A refusal writes no report.json
    def to_end(k, b, outside=None):
        out, b_path = os.path.join(work, f"run{k:02d}"), os.path.join(work, f"run{k:02d}-b", "wave1.json")
        os.makedirs(os.path.join(out, "recalc"))
        os.mkdir(os.path.dirname(b_path))
        dump(b_path, b)
        saved = (P.child, P.platform_fields, P.tool_identity, P.run_passes, R.load_series, L.held_to_vectors, P.C.OUTSIDE)

        def child(log, name, script, argv, want=(0,)):
            if script == "compare_p2.py":
                return saved[0](log, name, script, argv, want)
            if script == "recalc_p2.py":
                with open(os.path.join(argv[2], "wave1-monark.json"), "w", encoding="utf-8", newline="\n") as fh:
                    fh.write(base_text)
                return f"wave1-monark.json {hashlib.sha256(base_text.encode('utf-8')).hexdigest()}\n"
            return ORACLE_TEXTS[script == "binom_check.py"]
        P.child, P.platform_fields, P.tool_identity = child, lambda: copy.deepcopy(plat), lambda r: LOT_1D
        P.run_passes, R.load_series = (lambda s: (base_text, base_rows, variants, census)), (lambda d, s, p: (None, None))
        L.held_to_vectors = lambda host: (checks, 0, [], differing)
        P.C.OUTSIDE = saved[6] if outside is None else outside
        try:
            got = P.run({"repo": repo, "series": work, "vectors": work, "registry": b_path, "out": out}, {"steps": []})
        except P.Failed as e:
            got = e
        finally:
            P.child, P.platform_fields, P.tool_identity, P.run_passes, R.load_series, L.held_to_vectors, P.C.OUTSIDE = saved
        written = os.path.join(out, "report.json")
        return got, (open(written, "rb").read() if os.path.lexists(written) else None)  # this run wrote it

    got, data = to_end(1, ln)
    rep, of_ln = json.loads(data) if data else {}, {(r["taskClass"], r["key"]): r["calib"]["scoresSha256"] for r in ln["rows"]}
    rec("run() to its end, B the ln pass: report.json written, its sha256 the one returned, its scope and cells as in section 7",
        isinstance(got, str) and data is not None and hashlib.sha256(data).hexdigest() == got and rep.get("scope") == sorted(getattr(P, "RELEASE_1_CLASSES", ()))
        and all(c["scores_sha256"] == (of_ln[(c["task_class"], c["cell_key"])] if c["task_class"] in rep["scope"] else None) for c in rep["cells"]), got)
    got, data = to_end(2, edit(ln, bump_n))
    rec("run() to its end refuses B with a decision changed, exit 1, and writes no report.json", isinstance(got, P.Failed) and got.code == 1 and data is None, got)
    got, data = to_end(3, a, {"calib.n": "a field outside the decisions"})
    rec("run() refuses a comparator that names a field outside the decisions, exit 2, and writes no report.json",
        isinstance(got, P.Failed) and got.code == 2 and data is None, got)

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
