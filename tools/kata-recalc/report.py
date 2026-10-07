# claude-opus-5-5 - 2026-10-07 - lot 1e of VERIFIERS-LIST-F5A-1 (M-11; G0 docs/G0-lot-verifiers-list-f5a-1.md sections 3.3, 10 and
# 15), Python 3.14 standard library only, no network.
# The writer of the recompute report. It composes the pieces of the tool: the oracles (vectors_check.py, binom_check.py), the
# recomputation (recalc_p2.py), three passes of the same pipeline in this process (the base pass, which must give the recomputation's
# bytes; the pass under the natural logarithm of the generator's runtime, fdlibm_log.py; the pass under that log with the other order
# of the EWMA term that KATA-SPEC l.42 names, w_i * (r_i * r_i), the tool running the order of l.42 since M-1), and the comparator
# (compare_p2.py) of the recomputation and of each pass with the registry B. Only the comparator reads B, after every pass.
# It writes report.json (canonical JSON, ASCII, no final line feed: the bytes that report_sha256 names; no time, no duration, no path,
# no host or user name) and run-log.json (times and durations, never hashed or published), or exits non-zero without report.json unless
# the 280 cells are equal in every decision, every value lies within 1e-12 relative of B (KATA-SPEC l.71) and every value or digest
# that is not B's bits is explained (Q-6 of G0 section 10): "explained, ln" when the pass under the generator's log gives B's bits,
# "explained, association" when only the pass under that log with the other order does; a pass explains only if it equals B in every
# decision. Any other difference is "not explained", and the run fails.
# The class ln rests on the measure of the P2b review (RAPPORT l.62-63, l.107-114: under Node's own log, 114 of 114 differing digests
# equal B; the log differs by one ulp on 444 of 327 983 inputs), cited and never re-run; the port is held to Node's outputs (fdlibm_log.py).
# Exit: 0 report written; 1 refused by the proof rule (a decision, a value beyond 1e-12, a difference not explained); 2 a step failed
# (usage, the platform, the tool's identity, an oracle, the recomputation, the base pass, a structural fault of a comparison); 4 the
# input guard. Usage (G0 section 3.3, options in this order):
#   python -B report.py --repo <clone> --series <dir> --vectors <vectors.json> --registry <wave1.json> --out <absent or empty dir>
import io_guard  # the input guard, before any other module (M-7): here the series and the C library of log; each child its own
import contextlib
import hashlib
import math
import os
import platform
import re
import struct
import subprocess
import sys
import time
import types

import compare_p2 as C
import fdlibm_log as L
import kata_lib as K
import recalc_p2 as R

MODEL = "claude-opus-5-5"
OPTIONS = ("--repo", "--series", "--vectors", "--registry", "--out")
LN, ASSOC, NOT = "explained, ln", "explained, association", "not explained"
# Every fixed text of the report, one JSON object (test/kata-recalc.test.ts reads this block and runs the spec gate on it).
TEXTS = {
    "format": "monark-recompute-report-v1",
    "identity": "monark-kata-recalc",
    "tree": "tools/kata-recalc",
    "generator_identity": "kata/bench/write-p2.ts",
    "decisions": "every other field of the top level and of each row, by strict equality",
    "values": "doubles within 1e-12 relative of the registry (1e-15 absolute near zero); each one that differs in a bit is listed, both doubles in hexadecimal with their distance in ulps",
    "digests": "each digest that differs is listed with both digests and the first term at which the recomputed sequence differs from the pass whose digest is the registry's",
    "outside_reason": "not a decision: the hash chain of the trial registry is written only in the generator's code, not yet in the specification; its length is compared as a decision",
    "explained, ln": "the registry's bits are recovered by the same computation with the natural logarithm of the generator's runtime, a port of its algorithm held to that runtime's outputs; an earlier replay under that runtime itself recovered every value and digest that differed",
    "explained, association": "the registry's bits are recovered by the same computation under the natural logarithm of the generator's runtime with the other order of the EWMA term, w_i * (r_i * r_i), and not with the order the specification writes",
    "engine_log": "the natural logarithm of V8 in Node v24.21.0 (base::ieee754::log, derived from fdlibm), ported to Python",
    "replay": "python -B tools/kata-recalc/report.py --repo <clone at the listed commit> --series <directory of the four series> --vectors <vectors.json> --registry <wave1.json> --out <absent or empty directory>"
}
INPUT = re.compile(r"^input (\S+) (.+) sha256 ([0-9a-f]{64}) bytes (\d+)$")
LINE = re.compile(r"^(DECISION|VALUE|DIGEST) (?:top-level (\S+)|(\S+) (\S+) (\S+)): (.*)$")


class Failed(Exception):
    def __init__(self, code, why):
        super().__init__(why)
        self.code, self.why = code, why


def canonical(v):
    """The canonical writing of the contract 1.1.0 (spec-publish.mjs canonicalJson): sorted keys, no space; here integers, strings,
    booleans and null only (a double is written as its hexadecimal string), every string ASCII."""
    if v is None or isinstance(v, bool):
        return "null" if v is None else "true" if v else "false"
    if isinstance(v, int):
        if abs(v) > 2 ** 53 - 1:
            raise Failed(2, "an integer beyond 2^53 - 1")
        return str(v)
    if isinstance(v, str):
        if not v.isascii():
            raise Failed(2, f"a string that is not ASCII: {v[:40]!r}")
        return K.js_string(v)
    if isinstance(v, list):
        return "[" + ",".join(canonical(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{" + ",".join(canonical(k) + ":" + canonical(v[k]) for k in sorted(v)) + "}"
    raise Failed(2, f"not a value of the report: {type(v).__name__}")


# ---------------------------------------------------------------- platform and the tool's identity

def file_version(data):
    """The file version of a Windows module from its bytes: VS_FIXEDFILEINFO (signature 0xFEEF04BD) after the key VS_VERSION_INFO."""
    key = "VS_VERSION_INFO".encode("utf-16-le") + b"\0\0"
    at = data.find(key)
    if at < 0 or data.find(key, at + 1) >= 0:
        raise Failed(2, "the C library of log has no single version resource")
    sig, _, ms, ls = struct.unpack_from("<4I", data, (at + len(key) + 3) & ~3)
    if sig != 0xFEEF04BD:
        raise Failed(2, "the C library of log has no fixed file information")
    return f"{ms >> 16}.{ms & 0xFFFF}.{ls >> 16}.{ls & 0xFFFF}"


def platform_fields():
    """platform.platform() and platform.machine() raise socket.gethostname and _wmi.exec_query (measured): the same strings are composed
    from sys.getwindowsversion(), the release table of the platform module and the processor variable, which raise no event."""
    if sys.platform != "win32":
        raise Failed(2, "the C library of log is located on Windows only (ucrtbase.dll); another system is not yet named")
    w = sys.getwindowsversion()
    table = platform._WIN32_CLIENT_RELEASES if w.product_type == 1 else platform._WIN32_SERVER_RELEASES
    release = next((r for v, r in table if v <= tuple(w[:3])), "")
    system = "-".join(x for x in ("Windows", release, ".".join(str(n) for n in w[:3]), f"SP{w.service_pack_major}") if x)
    machine = os.environ.get("PROCESSOR_ARCHITEW6432", "") or os.environ.get("PROCESSOR_ARCHITECTURE", "")
    if any(os.path.lexists(os.path.join(d, "ucrtbase.dll")) for d in (sys.base_prefix, os.path.dirname(sys.executable))):
        raise Failed(2, "a copy of ucrtbase.dll beside the interpreter: the C library of log is not the system's")
    if not os.path.isabs(os.environ.get("SystemRoot", "")):
        raise Failed(2, "no SystemRoot: the system's C library is not located")
    data = io_guard.read("libm", os.path.join(os.environ["SystemRoot"], "System32", "ucrtbase.dll"))
    return {"python": sys.version, "system": system, "machine": machine,
            "libm": {"name": "ucrtbase.dll", "version": file_version(data), "sha256": hashlib.sha256(data).hexdigest()}}


def fingerprint(libm, differing):
    """The number of measured inputs on which the log that runs differs from the port. With the C library of the measure it must be
    the measured number (fdlibm_log.VECTORS): the run uses the library it names, which the measure tied by ctypes, outside the tool."""
    if libm["sha256"] == L.VECTORS["host_libm_sha256"] and differing != L.VECTORS["differ_from_host_libm"]:
        raise Failed(2, "the log that runs is not the log of the C library named: its fingerprint is not the measured one")
    return differing


def tree_digest(entries, running):
    """G0 section 3.2: every entry a 100644 blob under tools/kata-recalc/, sha256 of the manifest "<sha256>  <path>" sorted by path
    (manifestText of spec-publish.mjs); the files that run are the same names with the same bytes, nothing more."""
    root = TEXTS["tree"] + "/"
    bad = [f"{m} {p}" for m, p, b in entries if m != "100644" or b is None or not p.startswith(root)]
    if bad or not entries:
        raise Failed(2, f"the tool's tree at its commit holds an entry other than a regular file, or none: {bad[:3]}")
    files = {p[len(root):]: b for m, p, b in entries}
    if files != running:
        diff = sorted(set(files) ^ set(running)) + sorted(p for p in files if p in running and files[p] != running[p])
        raise Failed(2, f"the files that run are not the tool's tree at its commit: {diff[:5]}")
    text = "".join(f"{hashlib.sha256(files[p]).hexdigest()}  {p}\n" for p in sorted(files))
    return hashlib.sha256(text.encode("ascii")).hexdigest()


def tool_identity(repo):
    """(commit, tree_sha256) of the tool that runs: it must run from <repo>/tools/kata-recalc, at the commit that HEAD names."""
    here = os.path.dirname(os.path.realpath(__file__))
    if os.path.normcase(here) != os.path.normcase(os.path.realpath(os.path.join(repo, *TEXTS["tree"].split("/")))):
        raise Failed(2, "the tool does not run from the repository given by --repo")
    running = {}
    for name in sorted(os.listdir(here)):
        p = os.path.join(here, name)
        if os.path.islink(p) or not os.path.isfile(p):
            raise Failed(2, f"the tool's directory holds {name}, which is not a regular file (a cache, a link or a directory)")
        with open(p, "rb") as fh:
            running[name] = fh.read()
    try:
        commit, entries = io_guard.git_tree(repo, TEXTS["tree"])
    except subprocess.CalledProcessError as e:
        raise Failed(2, f"git could not name the tool's commit (exit {e.returncode})")
    return commit, tree_digest(entries, running)


# ---------------------------------------------------------------- the children

def child(log, name, script, args, want=(0,)):
    t0 = time.time()
    try:
        p = io_guard.run_tool(script, args)
    except subprocess.TimeoutExpired:
        raise Failed(2, f"{name}: {script} ran past its time limit")
    text, err = (s.decode("utf-8", "replace").replace("\r\n", "\n") for s in (p.stdout, p.stderr))  # a Windows pipe writes CR LF
    log["steps"].append({"step": name, "exit": p.returncode, "seconds": round(time.time() - t0, 3)})
    if p.returncode not in want:
        log["steps"][-1]["last_lines"] = (text.strip().split("\n") + err.strip().split("\n"))[-6:]
        raise Failed(2, f"{name}: {script} exited {p.returncode}")
    return text


def inputs_of(text):
    return {(m[1], m[2], m[3], int(m[4])) for m in map(INPUT.match, text.split("\n")) if m}


def oracles_of(vec, binom, port):
    m1 = re.search(r"^conformance checks on vectors\.json: (\d+) \(KATA-SPEC l\.5 counts \d+\), failures (\d+)$", vec, re.M)
    m2 = re.search(r"^checks (\d+), failures (\d+)$", binom, re.M)
    m3 = re.search(r"^tests (\d+), assertions replayed (\d+), failures (\d+), not replayed (\d+)$", binom, re.M)
    if not (m1 and m2 and m3):
        raise Failed(2, "an oracle output that does not parse")
    return {"conformance_vectors": {"checks": int(m1[1]), "failures": int(m1[2])},
            "second_writing": {"checks": int(m2[1]), "failures": int(m2[2])},
            "engine_tests": {"tests": int(m3[1]), "assertions": int(m3[2]), "failures": int(m3[3]), "not_replayed": int(m3[4])},
            "log_port": {"checks": port[0], "failures": port[1], "measured_outputs": L.VECTORS["count"]}}


def compare(log, name, a_path, b_path):
    """compare_p2.py A B, run as a child, parsed: its differences by (task class, cell key, field), top-level ones under ("", "",
    field), its structural faults, its exit code and its input lines."""
    text = child(log, name, "compare_p2.py", [a_path, b_path], want=(0, 1, 2))
    out = {"exit": None, "diffs": {}, "structure": [], "inputs": inputs_of(text)}
    for ln in text.split("\n"):
        m = LINE.match(ln)
        if m:
            out["diffs"][("", "", m[2]) if m[2] else (m[3], m[4], m[5])] = (m[1], m[6])
        elif ln.startswith("STRUCTURE"):
            out["structure"].append(ln)
        elif ln.startswith("EXIT "):
            out["exit"] = int(ln[5:])
    if out["exit"] is None:
        out["structure"].append("no EXIT line")
    return out


# ---------------------------------------------------------------- the passes

def kata_ewma_other(bars):
    """kata_lib.kata_ewma with the other order of the term that KATA-SPEC l.42 names, w_i * (r_i * r_i)."""
    c = [b[K.B_CLOSE] for b in bars]
    acc = 0.0
    nret = len(c) - 1
    for j in range(1, len(c)):
        r = K.math.log(c[j] / c[j - 1])
        acc = acc + K._EWMA_W[nret - j] * (r * r)
    return K.scale(K.math.sqrt(acc))


@contextlib.contextmanager
def setting(name, memo):
    """kata_lib as it runs ("base"); under the log of the generator's runtime, the port memoized in memo ("ln"); under that log with
    the other order of the EWMA term ("association": the generator runs its own log, so the order alone is never its cause)."""
    saved = K.math, K.KATA_FUNCS["ewma-vol-hw-v1"]
    try:
        if name in ("ln", "association"):
            def log(x):
                y = memo.get(x)
                if y is None:
                    y = memo[x] = L.log(x)
                return y
            names = {k: v for k, v in vars(math).items() if not k.startswith("_")}
            names["log"] = log
            K.math = types.SimpleNamespace(**names)  # kata_lib reads math.log at each call: its module global, replaced here
        if name == "association":
            K.KATA_FUNCS["ewma-vol-hw-v1"] = kata_ewma_other
        yield
    finally:
        K.math, K.KATA_FUNCS["ewma-vol-hw-v1"] = saved


def one_pass(series, name, memo):
    """The 280 rows of recalc_p2.py recomputed in this process under one setting, with the CALIB sequences and factor table of each
    cell. series: [(symbol, low, pinned sha256, candles)]."""
    rows, seqs, tables_of = [], {}, {}
    with setting(name, memo):
        for sym, low, pinned, candles in series:
            for h in R.HORIZONS:
                h_ms = K.H_MS[h]
                bars = K.build_bars(candles, h_ms)
                recs = R.decisions_for(candles, bars, h_ms)
                thr, tables = R.freezes(recs, h_ms)
                for cell in R.cells_of(sym, low, h):
                    rows.append(R.calibrate_cell(cell, recs, thr, tables, h_ms, pinned, seqs)[0])
                    if cell["kind"] != "dir":
                        tables_of[(cell["taskClass"], cell["key"])] = tables["ewma-vol-hw-v1" if cell["kind"] == "path" else cell["kata"]]
                R.invariants(rows[-35:], recs, thr, tables, h_ms)
    return rows, seqs, tables_of


def same_bits(x, y):
    return type(x) is type(y) and (struct.pack("<d", x) == struct.pack("<d", y) if isinstance(x, float) else x == y)


def seq_diff(a, b):
    """First index, number of terms and largest distance in ulps at which two sequences differ; None when they are equal."""
    at = [i for i, (x, y) in enumerate(zip(a, b)) if not same_bits(x, y)] + list(range(min(len(a), len(b)), max(len(a), len(b))))
    if not at:
        return None
    u = [C.ulps(float(x), float(y)) for x, y in zip(a, b) if x is not None and y is not None and not same_bits(x, y)]
    return {"first_index": at[0], "terms": len(at), "max_ulps": max(u, default=0)}


def run_passes(series):
    """The base pass, then each variant: its registry text and, for every digest field of every cell, where its sequence differs
    from the base pass. Returns (base registry text, base rows, {variant: (registry text, infos)}, census of the log)."""
    memo = {}
    base_rows, base_seqs, base_tables = one_pass(series, "base", memo)
    trials = len({r["trialId"] for r in base_rows})
    out = {}
    for name in ("ln", "association"):
        rows, seqs, tables = one_pass(series, name, memo)
        infos = {}
        for key, (scores, aux_seq) in seqs.items():
            for field, a, b in (("calib.scoresSha256", base_seqs[key][0], scores), ("calib.auxSha256", base_seqs[key][1], aux_seq),
                                ("factorTableSha256", base_tables.get(key), tables.get(key))):
                d = None if a is None and b is None else seq_diff(a or [], b or [])
                if d is not None:
                    infos[(*key, field)] = d
        out[name] = (R.registry_text(rows, len({r["trialId"] for r in rows})), infos)
    host = {x: math.log(x) for x in memo if x > 0 and math.isfinite(x)}  # the ratios of positive prices; anything else is not counted
    differ = [x for x in host if not same_bits(host[x], memo[x])]
    census = {"log_inputs": len(memo), "differing": len(differ), "max_ulps": max((C.ulps(host[x], memo[x]) for x in differ), default=0)}
    return R.registry_text(base_rows, trials), base_rows, out, census


# ---------------------------------------------------------------- classes and the report

def classify(main, variants):
    """main: the comparison of the recomputation with B; variants: {class: comparison of its pass with B}. A difference is explained
    by the first admissible pass (equal to B in every decision, no structural fault) whose comparison with B no longer lists it."""
    if main["structure"] or main["exit"] == 2:
        raise Failed(2, f"the comparison with the registry has a structural fault: {main['structure'][:2]}")
    decisions = [k for k, (cls, _) in main["diffs"].items() if cls == "DECISION" or k[0] == ""]
    if decisions:
        raise Failed(1, f"{len(decisions)} decision(s) differ from the registry, first {decisions[0]}")
    beyond = [k for k, (cls, d) in main["diffs"].items() if d.endswith(" beyond 1e-12")]
    if beyond:
        raise Failed(1, f"{len(beyond)} value(s) beyond 1e-12 relative of the registry, first {beyond[0]}")
    ok = {c: v for c, v in variants.items() if v["exit"] in (0, 1) and not v["structure"]
          and not any(cls == "DECISION" or k[0] == "" for k, (cls, _) in v["diffs"].items())}
    out = [(k, cls, d, next((c for c in (LN, ASSOC) if c in ok and k not in ok[c]["diffs"]), NOT)) for k, (cls, d) in sorted(main["diffs"].items())]
    nots = [x[0] for x in out if x[3] == NOT]
    if nots:
        raise Failed(1, f"{len(nots)} difference(s) not explained, first {nots[0]}")
    return out


def entries_of(classified, infos):
    """The differences of the report: a value with both doubles in hexadecimal and its ulps, a digest with both digests and where the
    recomputed sequence first differs from the pass that explains it."""
    out = []
    for (tc, key, field), cls, detail, klass in classified:
        e = {"task_class": tc, "cell_key": key, "field": field, "class": klass}
        if cls == "VALUE":
            m = re.match(r"^A=(\S+) B=(\S+) ulps (\d+)$", detail)
            e.update(kind="value", a=m[1], b=m[2], ulps=int(m[3]))
        else:
            m = re.match(r"^A=([0-9a-f]{64}) B=([0-9a-f]{64})$", detail)
            info = infos[{LN: "ln", ASSOC: "association"}[klass]].get((tc, key, field))
            if m is None or info is None:
                raise Failed(2, f"a digest difference without its two digests or its terms: {tc} {key} {field}")
            e.update(kind="digest", a=m[1], b=m[2], **info)
        out.append(e)
    return out


def assemble(ident, platform_, oracles, inputs, b_input, base_rows, classified, infos, census):
    commit, tree_sha = ident
    if list(C.OUTSIDE) != ["trialRegistryHead.hash"]:
        raise Failed(2, "the comparator's fields outside the decisions are not the one this report names")
    diffs = entries_of(classified, infos)
    count = {k: sum(1 for d in diffs if d["kind"] == k) for k in ("value", "digest")}
    return {
        "format": TEXTS["format"], "verifier": f"{TEXTS['identity']}@{commit}",
        "tool": {"commit": commit, "tree": TEXTS["tree"], "tree_sha256": tree_sha},
        "registry": {"file": b_input[1], "sha256": b_input[2], "generator_identity": TEXTS["generator_identity"], "cells": len(base_rows)},
        "inputs": {"recompute": [dict(zip(("role", "name", "sha256", "bytes"), x)) for x in sorted(inputs)],
                   "compare": [dict(zip(("role", "name", "sha256", "bytes"), b_input))]},
        "platform": platform_, "oracles": oracles,
        "fields": {"decisions": TEXTS["decisions"], "values": sorted(C.VALUES), "digests": sorted(C.DIGESTS),
                   "outside_decisions": [{"field": "trialRegistryHead.hash", "reason": TEXTS["outside_reason"]}],
                   "value_rule": TEXTS["values"], "digest_rule": TEXTS["digests"]},
        "cells": [{"task_class": r["taskClass"], "cell_key": r["key"], "decisions_equal": True}
                  for r in sorted(base_rows, key=lambda r: (r["taskClass"], r["key"]))],
        "differences": diffs,
        "explanation": {"classes": {LN: TEXTS[LN], ASSOC: TEXTS[ASSOC]}, "engine_log": TEXTS["engine_log"], "log": census},
        "summary": {"cells": len(base_rows), "decisions_equal": len(base_rows), "values": count["value"], "digests": count["digest"],
                    LN: sum(1 for d in diffs if d["class"] == LN), ASSOC: sum(1 for d in diffs if d["class"] == ASSOC)},
        "replay": TEXTS["replay"],
    }


def write(path, text):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def run(a, log):
    """Every step of the report, in order; B is read by the comparator children only, after the passes."""
    out = a["out"]
    for d in ("oracles", "passes"):
        os.mkdir(os.path.join(out, d))
    plat = platform_fields()  # reads the C library of log under the role libm
    ident = tool_identity(a["repo"])
    t0 = time.time()
    port = L.held_to_vectors(math.log)
    log["steps"].append({"step": "log port vectors", "seconds": round(time.time() - t0, 3)})
    if port[1] or L.log(2.0) != math.log(2.0):  # 4 ln 2 of kata_lib is computed once, with Python's log: the same double
        raise Failed(2, f"the log port fails its vectors: {port[2][:3]}")
    plat["libm"]["log_vectors_differing"] = fingerprint(plat["libm"], port[3])
    o = os.path.join(out, "oracles")
    vec = child(log, "vectors oracle", "vectors_check.py", [a["vectors"], os.path.join(o, "vectors-check.txt")])
    binom = child(log, "binomial oracles", "binom_check.py", [a["repo"], os.path.join(o, "binom-check.txt"), os.path.join(o, "hikae-replay.txt")])
    rec = child(log, "recomputation", "recalc_p2.py", [a["series"], o, os.path.join(out, "recalc")])
    m = re.search(r"^wave1-monark\.json ([0-9a-f]{64})$", rec, re.M)
    if m is None:
        raise Failed(2, "the recomputation printed no digest of its registry")
    t0 = time.time()
    series = [(sym, low, pinned, R.load_series(a["series"], sym, pinned)[0]) for sym, low, pinned in R.SYMBOLS]
    base_text, base_rows, variants, census = run_passes(series)
    log["steps"].append({"step": "passes", "seconds": round(time.time() - t0, 3), "log": census})
    if hashlib.sha256(base_text.encode("utf-8")).hexdigest() != m[1]:
        raise Failed(2, "the base pass does not give the recomputation's bytes: the passes are not the same pipeline")
    own = {("registry", "wave1-monark.json", m[1])}
    paths = {}
    for name, (text, _) in variants.items():
        paths[name] = os.path.join(out, "passes", f"wave1-monark-{name}.json")
        write(paths[name], text)
        own.add(("registry", f"wave1-monark-{name}.json", hashlib.sha256(text.encode("utf-8")).hexdigest()))
    main_cmp = compare(log, "comparison", os.path.join(out, "recalc", "wave1-monark.json"), a["registry"])
    var_cmp = {LN: compare(log, "comparison, ln pass", paths["ln"], a["registry"]),
               ASSOC: compare(log, "comparison, association pass", paths["association"], a["registry"])}
    seen = set().union(*(c["inputs"] for c in [main_cmp, *var_cmp.values()]))
    log["compare_inputs"] = [list(x) for x in sorted(seen)]
    b_inputs = {x for x in seen if x[:3] not in own}
    if len(b_inputs) != 1 or next(iter(b_inputs))[0] != "registry":
        raise Failed(2, f"the comparisons read other inputs than one registry: {sorted(b_inputs)[:3]}")
    log["recovery"] = {c: {"admissible": v["exit"] in (0, 1) and not v["structure"] and not any(
        cls == "DECISION" or k[0] == "" for k, (cls, _) in v["diffs"].items()),
        "recovers": sum(1 for k in main_cmp["diffs"] if k not in v["diffs"]), "of": len(main_cmp["diffs"])} for c, v in var_cmp.items()}
    classified = classify(main_cmp, var_cmp)
    inputs = inputs_of(vec) | inputs_of(binom) | inputs_of(rec) | {tuple(d.values()) for d in io_guard.inputs()}
    report = assemble(ident, plat, oracles_of(vec, binom, port), inputs, next(iter(b_inputs)), base_rows, classified,
                      {n: v[1] for n, v in variants.items()}, census)
    text = canonical(report)
    leak = [p for p in a.values() if p in text or p.replace("\\", "/") in text] + re.findall(r"[A-Za-z]:[\\/]", text)
    if leak or "\r" in text or "\n" in text:
        raise Failed(2, "the report would carry a local path or a line break")
    write(os.path.join(out, "report.json"), text)
    return hashlib.sha256(text.encode("ascii")).hexdigest()


def main(argv):
    if len(argv) != 10 or tuple(argv[0::2]) != OPTIONS:
        print("usage: python -B report.py " + " ".join(f"{o} <{o[2:]}>" for o in OPTIONS))
        return 2
    a = {o[2:]: os.path.abspath(v) for o, v in zip(argv[0::2], argv[1::2])}  # B-2: every path the guard judges is absolute
    io_guard.declare("series", "libm")
    io_guard.output(a["out"])
    os.makedirs(a["out"], exist_ok=True)
    t0 = time.time()
    log = {"model": MODEL, "started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(t0)), "steps": []}
    code, why, sha = 0, None, None
    try:
        sha = run(a, log)
    except Failed as e:
        code, why = e.code, e.why
    except Exception as e:  # a series refused by recalc_p2.load_series (D-3), a broken invariant, a fault of this script: no report
        code, why = 2, f"{type(e).__name__}: {e}"
    log.update(ended=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), seconds=round(time.time() - t0, 3), exit=code, refused=why,
               report_sha256=sha)
    write(os.path.join(a["out"], "run-log.json"), K.js_json_pretty(log) + "\n")
    print(f"report.json {sha}" if code == 0 else f"REFUSED (exit {code}): {why}")
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
