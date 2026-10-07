# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only, no network. Lot 1d (2026-10-06): M-3 to M-7, M-9.
# Independent recomputation of the 280 wave 1 rows from the four sealed series (plan P2 l.84), written from the definitions
# only (mission D-1), blind to every registry and report of RECHERCHES (D-5). Mission decisions applied: D-2 (refuses to read any
# series unless the three oracle outputs end GREEN), D-3 (each file hashed in memory before parsing, refused unless its sha256
# is the pinned one; own census written before census.json is ever opened), D-4 (280 cells, SELECT freezes, scores, engine call,
# dependence checks, status, TEST and veto, digests), D-5 (registry in the shape of FMT, written as JSON.stringify(x, null, 1)
# plus a line feed, then SEAL.sha256 as the first act), D-6 (fields without a sufficient written definition are null; since lot 1d,
# FMT l.41-49 writes them, and only trialRegistryHead.hash, built in the generator's code alone, stays null), D-9 (time).
# Sources: ADR, P1, P2, SPEC, FMT in `wt` at 1ea4f64 (see kata_lib.py), engine in binom_exact.py, CSV layout REC l.34-35.
# Usage: python -B recalc_p2.py <series dir> <oracle dir> <out dir>   (M-6: every path is an argument)
import io_guard  # the input guard, before any other module (M-7): series, recorder files and oracle outputs, never a registry
import datetime
import hashlib
import json
import math
import os
import re
import sys
import time

import binom_exact as E
import kata_lib as K

MODEL = "claude-opus-5-5"
# FMT l.43 written forms (M-3): the plan file at its pinned sha256, v3 (plan l.5), section 9 whose last dated entry is of 2026-10-02
# (plan l.112); the engine commit whose hikae binom_exact.py ports (journal l.26-28), in the repository of G0 section 3.2
PLAN_SHA256 = "87b57c017a69bbb4e13c10deedff028d77f47d798dcd2032bd62b12d6fa016c7"
PLAN = f"0005-G0-part-P2-calibration.md v3, section 9 of 2026-10-02 ({PLAN_SHA256[:8]})"
ENGINE_COMMIT = "207f021ff36469a519c049eb6a6dc34403e707f3"
ENGINE = f"monark-governance main {ENGINE_COMMIT[:8]}"
TRIALS = 80  # FMT l.9: the wave 1 trials, one per trialId (FMT l.45)
SYMBOLS = [  # plan P2 l.11-14, ADR l.48
    ("BTCUSDT", "btc", "271c4e07d8f9f62423410b8e5422bd3e39d71b7d8c53bbb7f84269c26239c2f4"),
    ("ETHUSDT", "eth", "cf521c5320d5c17fd95558156e2897b16a8d34061b2696cbae70fb373394ad71"),
    ("BNBUSDT", "bnb", "c5225573532b1ad3d7538b8455115aa1fc5705504039691024c6bf608d231933"),
    ("SOLUSDT", "sol", "e318b752bf3f8f6f5cd85e0791ede3b2698ec717d4df2bb69b6f97f579311bea"),
]
VENUE = "binance"  # Q-10: ADR l.28
HORIZONS = ["1h", "4h"]
CSV_HEADER = ("open_time_utc,open_time_ms,open,high,low,close,volume,close_time_ms,quote_volume,trades,"
              "taker_buy_base_volume,taker_buy_quote_volume")  # REC l.34-35
RE_INT = re.compile(r"^[0-9]+$")
RE_DEC = re.compile(r"^[0-9]+(\.[0-9]+)?$")
ALPHA = {"dir": "0.45", "scale": "0.01"}  # ADR l.96-97, P2 l.50
DELTA = "0.05"
CELL_LIMIT_S = 600  # D-9


class Stop(Exception):
    pass


def iso(ms):
    return datetime.datetime.fromtimestamp(ms // 1000, datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def month_of(ms):
    return datetime.datetime.fromtimestamp(ms // 1000, datetime.UTC).strftime("%Y-%m")


def block_of(ms):
    for name, (a, b) in K.BLOCKS.items():
        if a <= ms < b:
            return name
    return None


def gate_oracles(oracle_dir):
    for name in ("vectors-check.txt", "binom-check.txt", "hikae-replay.txt"):
        path = f"{oracle_dir}/{name}"
        if not os.path.exists(path):
            raise Stop(f"D-2: {name} missing, no series read")
        last = io_guard.read("oracle-output", path).decode("utf-8").rstrip("\n").split("\n")[-1]
        if not last.startswith("VERDICT: GREEN"):
            raise Stop(f"D-2: {name} not green, no series read")


def load_series(series_dir, sym, pinned):
    """D-3: read the bytes once, hash them, refuse before parsing unless the sha256 is the pinned one; then parse line by line."""
    path = f"{series_dir}/{sym}/{sym}-15m.csv"
    data = io_guard.read("series", path)
    got = hashlib.sha256(data).hexdigest()
    if got != pinned:
        raise Stop(f"D-3: {sym} refused before parsing: sha256 {got} differs from the pinned {pinned}")
    text = data.decode("ascii")
    if "\r" in text or not text.endswith("\n"):
        raise Stop(f"{sym}: line endings")
    lines = text.split("\n")[:-1]
    if lines[0] != CSV_HEADER:
        raise Stop(f"{sym}: header differs from REC l.34-35")
    candles = {}
    prev = None
    stats = {"rows": 0, "zeroVolumeCandles": 0, "highBelowLow": 0}
    for no, ln in enumerate(lines[1:], start=2):
        f = ln.split(",")
        if len(f) != 12:
            raise Stop(f"{sym}: line {no}: {len(f)} fields")
        if not (RE_INT.match(f[1]) and RE_INT.match(f[7]) and RE_INT.match(f[9])):
            raise Stop(f"{sym}: line {no}: integer field")
        if not all(RE_DEC.match(f[i]) for i in (2, 3, 4, 5, 6, 8, 10, 11)):
            raise Stop(f"{sym}: line {no}: decimal field")
        ot = int(f[1])
        if f[0] != iso(ot) or int(f[7]) != ot + K.STEP_MS - 1:
            raise Stop(f"{sym}: line {no}: open or close time")
        if ot % K.STEP_MS != 0 or not (K.REC_START <= ot < K.REC_END) or (prev is not None and ot <= prev):
            raise Stop(f"{sym}: line {no}: off grid, out of range or not ascending")
        o, h, lo, c, v, tbb = float(f[2]), float(f[3]), float(f[4]), float(f[5]), float(f[6]), float(f[10])
        candles[ot] = (o, h, lo, c, v, tbb)
        stats["rows"] += 1
        stats["zeroVolumeCandles"] += v == 0
        stats["highBelowLow"] += h < lo
        prev = ot
    return candles, stats


def recorder_crosscheck(series_dir, sym, candles, stats):
    """MONARK's own recorder outputs (not census.json): manifest rows and missing.json against this parse."""
    missing = [t for t in range(K.REC_START, K.REC_END, K.STEP_MS) if t not in candles]
    out = {"manifestRows": None, "manifestMissing": None, "missingJsonCount": None, "missingSetEqual": None}
    try:
        man = json.loads(io_guard.read("recorder", f"{series_dir}/{sym}/manifest.json").decode("utf-8"))
        out["manifestRows"] = man.get("rows")
        out["manifestMissing"] = man.get("missing")
    except Exception:
        pass
    try:
        mj = json.loads(io_guard.read("recorder", f"{series_dir}/{sym}/missing.json").decode("utf-8"))
        out["missingJsonCount"] = mj.get("count")
        out["missingSetEqual"] = sorted(int(x["open_time_ms"]) for x in mj.get("missing", [])) == missing
    except Exception:
        pass
    return missing, out


def label_census(candles, bars, h_ms, times):
    c = {"decisions": len(times), "dirRangeDropped": 0, "pathDropped": 0, "up": 0, "down": 0, "flat": 0}
    for t in times:
        y, r, d, u = K.labels_at(candles, bars, t, h_ms)
        if y is None:
            c["dirRangeDropped"] += 1
        else:
            c[y] += 1
        if d is None:
            c["pathDropped"] += 1
    kept = c["up"] + c["down"] + c["flat"]
    c["kept"] = kept
    c["flatShare"] = c["flat"] / kept if kept else None
    c["upRate"] = c["up"] / kept if kept else None
    return c


def decisions_for(candles, bars, h_ms):
    """Every SELECT, CALIB and TEST decision: the eight kata values (vote4 from the four parts on the same trailing bars,
    SPEC l.34) and the labels."""
    recs = {}
    for block in ("SELECT", "CALIB", "TEST"):
        out = []
        for t in K.decision_times(block, h_ms):
            v = {}
            for kid in ("trend-ema-v1", "tsmom-v1", "meanrev-z-v1", "takerflow-v1") + tuple(K.SCALE_KATAS):
                win = K.window_at(bars, t, K.W[kid], h_ms)
                v[kid] = K.NE if win is None else K.KATA_FUNCS[kid](win)
            if K.window_at(bars, t, K.W["vote4-v1"], h_ms) is None:
                v["vote4-v1"] = K.NE
            else:
                v["vote4-v1"] = K.vote4_of([v["trend-ema-v1"], v["tsmom-v1"], v["meanrev-z-v1"], v["takerflow-v1"]])
            y, r, d, u = K.labels_at(candles, bars, t, h_ms)
            out.append({"t": t, "v": v, "y": y, "r": r, "D": d, "U": u})
        recs[block] = out
    return recs


def sigma_hat(rec, kid, table, h_ms):
    sr = rec["v"][kid]
    if sr == K.NE:
        return K.NE
    f = table[K.slot_of(rec["t"], h_ms)]
    if f is None:
        return K.NE
    sh = sr * f  # ADR l.68: sigma_hat = sigma_raw x f(slot of t)
    return sh if (math.isfinite(sh) and sh > 0) else K.NE


def run_checks(kind, scores, aux_seq, qhat):
    """P2 l.51 (runs_level 0.05): check 1 on 1{score > qhat}, empty is not a refusal (kObs 0); check 2 on the auxiliary sequence
    (direction: the label bits; scale: balancedExceedance of the scores), empty fails closed."""
    b1 = [1 if s > qhat else 0 for s in scores]
    r1 = E.runs_lower_tail_leq(b1, DELTA)
    c1 = {"empty": r1["empty"], "runs": r1["runs"], "ones": r1["ones"], "zeros": r1["zeros"], "reject": r1.get("reject"),
          "refusal": (not r1["empty"]) and r1["reject"],
          "tail": None if r1["empty"] else r1["tailNum"] / r1["tailDen"]}
    if kind == "dir":
        r2 = E.runs_lower_tail_leq(aux_seq, DELTA)
        bal_empty = None
    else:
        be = E.balanced_exceedance(aux_seq)
        bal_empty = be["empty"]
        r2 = {"empty": True, "runs": None, "ones": None, "zeros": None} if be["empty"] else E.runs_lower_tail_leq(be["bits"], DELTA)
    c2 = {"empty": r2["empty"], "runs": r2["runs"], "ones": r2["ones"], "zeros": r2["zeros"], "reject": r2.get("reject"),
          "refusal": bool(r2["empty"] or r2.get("reject")), "balancedEmpty": bal_empty,
          "tail": None if r2["empty"] else r2["tailNum"] / r2["tailDen"]}
    return c1, c2


def calibrate_cell(cell, recs, thr, tables, h_ms, series_sha):
    kind, kid, side, bucket = cell["kind"], cell["kata"], cell["side"], cell["bucket"]
    alpha = ALPHA["dir"] if kind == "dir" else ALPHA["scale"]
    table = tables.get("ewma-vol-hw-v1" if kind == "path" else kid)

    def point(rec):
        """(state, score, aux_seq term, sigma): state 'out' (not a point of the cell), 'drop' (evaluable, label dropped) or 'in'."""
        if kind == "dir":
            m = rec["v"][kid]
            if m == K.NE or K.bucket_of(m, thr[kid]) != bucket:
                return "out", None, None, None
            if rec["y"] is None:
                return "drop", None, None, None
            return "in", (0 if ("up" if m > 0 else "down") == rec["y"] else 1), (1 if rec["y"] == "up" else 0), None
        sh = sigma_hat(rec, "ewma-vol-hw-v1" if kind == "path" else kid, table, h_ms)
        if sh == K.NE:
            return "out", None, None, None
        lab = rec["r"] if kind == "range" else (rec["D"] if side == "down" else rec["U"])
        if lab is None:
            return "drop", None, None, None
        sc = (abs(lab) if kind == "range" else lab) / sh  # one binary64 division (P2 l.108)
        return "in", sc, sc, sh

    scores, aux_seq, sig = [], [], []
    drops_c = 0
    for rec in recs["CALIB"]:
        st, sc, ax, sh = point(rec)
        if st == "drop":
            drops_c += 1
        elif st == "in":
            scores.append(sc)
            aux_seq.append(ax)
            if sh is not None:
                sig.append(sh)
    n = len(scores)
    n0 = E.zero_error_floor(alpha, DELTA)
    res = E.risk_control_quantile(scores, alpha, DELTA, n0)
    reasons = []
    c1 = c2 = None
    if "reason" in res:
        status = "under_calib"
        reasons.append("n < n0" if n > 0 else "empty bucket or no point")
        qhat = rank = kstar = kobs = u = None
    else:
        qhat, rank, kstar, kobs, u = res["qhat"], res["rank"], res["kStar"], res["kObs"], res["missBound"]
        c1, c2 = run_checks(kind, scores, aux_seq, qhat)
        if c1["refusal"]:
            reasons.append("check1")
        if c2["refusal"]:
            reasons.append("check2")
        if kind == "dir" and qhat == 1:
            reasons.append("qhat 1")
        status = "silence" if reasons else "region"
    if kind == "dir":
        misses = sum(1 for s in scores if s == 1)  # FMT l.35
    else:
        misses = kobs  # P2 l.108 (None without qhat)
    # M-3, FMT l.46-48: the written forms of check1, check2 and reason, from the verdicts above. Order of FMT l.48: under_calib, then
    # the checks, a rejection named before an empty check 2 (the order of its list, which l.48 does not fix when both hold), then the
    # misses of a direction cell
    if status == "under_calib":
        check1 = check2 = "n/a"
        if kind == "dir" and thr[kid][side] is None:
            reason = "empty bucket (no thresholds on this side)"
        else:
            reason = "empty bucket" if n == 0 else f"n {n} below n0 {n0}"
    else:
        check1, check2 = ("empty" if c["empty"] else "reject" if c["reject"] else "pass" for c in (c1, c2))
        if "reject" in (check1, check2):
            reason = "dependence check rejects"
        elif check2 == "empty":
            reason = "auxiliary sequence constant (fails closed)"
        elif kind == "dir" and qhat == 1:
            reason = f"misses {misses} above k* {kstar}"
        else:
            reason = ""
    # TEST (P2 l.60-63)
    n_test = 0
    k_test = 0 if (kind == "dir" or qhat is not None) else None
    drops_t = 0
    months = {}
    for rec in recs["TEST"]:
        st, sc, ax, sh = point(rec)
        if st == "drop":
            drops_t += 1
            continue
        if st != "in":
            continue
        n_test += 1
        mo = months.setdefault(month_of(rec["t"]), {"n": 0, "k": 0 if k_test is not None else None})
        mo["n"] += 1
        if k_test is not None:
            miss = (sc == 1) if kind == "dir" else (sc > qhat)
            if miss:
                k_test += 1
                mo["k"] += 1
    if k_test is None:
        months = {}  # M-5, FMT l.49 (N-5): {} when no kTest is computed (a band cell under_calib)
    if n_test == 0 or k_test is None:
        u_test = None
    elif k_test < n_test:
        u_test = E.miss_upper_bound(n_test, k_test, DELTA)
    else:
        u_test = "1"  # M-4, FMT l.49 (N-4): "1" when kTest = nTest >= 1
    vetoed = bool(status == "region" and n_test >= 1 and E.binom_upper_tail_leq(n_test, k_test, alpha, DELTA))
    final = "vetoed" if vetoed else status
    row = {
        "taskClass": cell["taskClass"], "key": cell["key"], "kataId": kid, "W": K.W[kid], "venue": VENUE,
        "symbol": cell["symbol"], "horizon": cell["horizon"],
        "side": side if kind == "dir" else None, "bucket": bucket,
        "thresholds": thr[kid][side] if kind == "dir" else None,
        "hourOfWeekFactors": table if kind != "dir" else None,
        "factorTableSha256": K.seq_sha256(table) if kind != "dir" else None,
        "alpha": alpha, "testDelta": DELTA, "calibAttempt": 1,
        "auxSeq": "label" if kind == "dir" else "score", "order": "time",
        "calibSupport": ({"min": min(sig), "max": max(sig)} if sig else None) if kind != "dir" else None,
        "seriesSha256": series_sha, "epoch": 1,
        "drops": {"calib": drops_c, "test": drops_t},
        "calib": {"n": n, "status": status, "reason": reason, "qhat": qhat, "rank": rank, "kStar": kstar, "kObs": kobs,
                  "misses": misses, "U": u, "check1": check1, "check2": check2,
                  "scoresSha256": K.seq_sha256(scores), "auxSha256": K.seq_sha256(aux_seq)},
        "test": {"nTest": n_test, "kTest": k_test, "UTest": u_test, "vetoed": vetoed, "months": months},
        "live1": None, "status": final, "trialId": f"{cell['taskClass']}|{kid}|{VENUE}|{cell['symbol']}|{cell['horizon']}|CALIB",
    }  # trialId: FMT l.45
    checks = {"taskClass": cell["taskClass"], "key": cell["key"], "n": n, "status": status, "finalStatus": final,
              "statusReasons": reasons, "check1": c1, "check2": c2}
    return row, checks


def cells_of(sym, low, h):
    """ADR l.89, l.41-48, l.28; SPEC l.59-60: 30 direction, 3 range, 2 path cells per (symbol, horizon)."""
    out = []
    for kid in K.DIRECTION_KATAS:
        for side in ("up", "down"):
            for b in ("b1", "b2", "b3"):
                bucket = f"{side}-{b}"
                out.append({"kind": "dir", "kata": kid, "side": side, "bucket": bucket, "symbol": sym, "horizon": h,
                            "taskClass": f"{low}-dir-{h}", "key": f"kata:{kid}@{VENUE}/{sym}/{h}/{bucket}"})
    for kid in K.SCALE_KATAS:
        out.append({"kind": "range", "kata": kid, "side": None, "bucket": "b0", "symbol": sym, "horizon": h,
                    "taskClass": f"{low}-range-{h}", "key": f"kata:{kid}@{VENUE}/{sym}/{h}/b0"})
    for side in ("down", "up"):
        out.append({"kind": "path", "kata": "ewma-vol-hw-v1", "side": side, "bucket": "b0", "symbol": sym, "horizon": h,
                    "taskClass": f"{low}-mae-{side}-{h}", "key": f"kata:ewma-vol-hw-v1@{VENUE}/{sym}/{h}/b0"})
    return out


def invariants(rows_sh, recs, thr, tables, h_ms):
    """In-run consistency (no new definition): partitions of the evaluable decisions into cells plus drops, month sums, rank."""
    for kid in K.DIRECTION_KATAS:
        cells = [r for r in rows_sh if r["kataId"] == kid and "-dir-" in r["taskClass"]]
        for blk, a, b, d in (("CALIB", "calib", "n", "calib"), ("TEST", "test", "nTest", "test")):
            want = sum(1 for rec in recs[blk] if rec["v"][kid] != K.NE and K.bucket_of(rec["v"][kid], thr[kid]) not in (K.NE, "under_calib"))
            got = sum(r[a][b] + r["drops"][d] for r in cells)
            if got != want or len(cells) != 6:
                raise Stop(f"invariant: {kid} {blk} partition {got} != {want}")
    for r in rows_sh:
        if "-dir-" in r["taskClass"]:
            continue
        kid = r["kataId"]
        for blk, a, b, d in (("CALIB", "calib", "n", "calib"), ("TEST", "test", "nTest", "test")):
            want = sum(1 for rec in recs[blk] if sigma_hat(rec, kid, tables[kid], h_ms) != K.NE)
            if r[a][b] + r["drops"][d] != want:
                raise Stop(f"invariant: {r['taskClass']} {kid} {blk} points + drops != evaluable")
    for r in rows_sh:
        t, c = r["test"], r["calib"]
        if t["kTest"] is None and t["months"] != {}:  # M-5
            raise Stop(f"invariant: months without kTest {r['taskClass']} {r['key']}")
        if t["kTest"] is not None and sum(m["n"] for m in t["months"].values()) != t["nTest"]:
            raise Stop(f"invariant: months n {r['taskClass']} {r['key']}")
        if c["status"] != "under_calib" and (c["status"] == "region") != (c["reason"] == ""):  # M-3, FMT l.48
            raise Stop(f"invariant: reason and status {r['taskClass']} {r['key']}")
        if t["kTest"] is not None and sum(m["k"] for m in t["months"].values()) != t["kTest"]:
            raise Stop(f"invariant: months k {r['taskClass']} {r['key']}")
        if c["qhat"] is not None:
            if c["rank"] != c["n"] - c["kStar"] or c["kObs"] > c["kStar"] or c["status"] == "under_calib":
                raise Stop(f"invariant: rank or kObs {r['taskClass']} {r['key']}")
            if "-dir-" in r["taskClass"] and c["qhat"] == 0 and c["misses"] != c["kObs"]:
                raise Stop(f"invariant: misses {r['taskClass']} {r['key']}")
        elif c["status"] != "under_calib":
            raise Stop(f"invariant: status without qhat {r['taskClass']} {r['key']}")


def write_text(path, text):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def main(series_dir, oracle_dir, out_dir):
    io_guard.declare("series", "recorder", "oracle-output")
    io_guard.output(out_dir)
    t_run = time.time()
    gate_oracles(oracle_dir)
    os.makedirs(out_dir, exist_ok=True)
    census = {"model": MODEL, "series": []}
    rows, checks, summary, timing = [], [], [], []
    max_cell = (0.0, None)
    for sym, low, pinned in SYMBOLS:
        t0 = time.time()
        candles, stats = load_series(series_dir, sym, pinned)
        missing, recorder = recorder_crosscheck(series_dir, sym, candles, stats)
        t_load = time.time() - t0
        sc = {"symbol": sym, "seriesSha256": pinned, "rows": stats["rows"],
              "expectedCandles": (K.REC_END - K.REC_START) // K.STEP_MS, "missingCandles": len(missing),
              "missingByBlock": {b: sum(1 for t in missing if block_of(t) == b) for b in K.BLOCKS},
              "zeroVolumeCandles": stats["zeroVolumeCandles"], "highBelowLow": stats["highBelowLow"],
              "recorder": recorder, "horizons": {}}
        for h in HORIZONS:
            h_ms = K.H_MS[h]
            t1 = time.time()
            bars = K.build_bars(candles, h_ms)
            starts = [K.REC_START + i * h_ms for i in range(len(bars))]
            hc = {"bars": len(bars), "absentBars": sum(1 for b in bars if b is None),
                  "absentBarsByBlock": {b: sum(1 for s, x in zip(starts, bars) if x is None and block_of(s) == b) for b in K.BLOCKS},
                  "zeroVolumeBars": sum(1 for b in bars if b is not None and b[K.B_VOL] == 0), "blocks": {}}
            all_times = list(range(K.REC_START, K.REC_END - h_ms + 1, h_ms))
            hc["blocks"]["ALL"] = label_census(candles, bars, h_ms, all_times)
            for b in K.BLOCKS:
                hc["blocks"][b] = label_census(candles, bars, h_ms, K.decision_times(b, h_ms))
            sc["horizons"][h] = hc
            recs = decisions_for(candles, bars, h_ms)
            t_dec = time.time() - t1
            for blk, want in (("CALIB", {"1h": 4368, "4h": 1092}), ("TEST", {"1h": 4392, "4h": 1098}), ("SELECT", {"1h": 8760, "4h": 2190})):
                if len(recs[blk]) != want[h]:
                    raise Stop(f"{sym} {h} {blk}: {len(recs[blk])} decisions, ADR l.81 gives {want[h]}")
            # SELECT freezes (P2 l.35-36): buckets on evaluable leans, factors on (t, r, sigma_raw) in time order
            thr = {kid: K.terciles_by_side([r["v"][kid] for r in recs["SELECT"]]) for kid in K.DIRECTION_KATAS}
            tables = {kid: K.factor_table([(r["t"], r["r"], r["v"][kid]) for r in recs["SELECT"]
                                           if r["r"] is not None and r["v"][kid] != K.NE], h_ms) for kid in K.SCALE_KATAS}
            ties = sum(1 for kid in K.DIRECTION_KATAS for s in ("up", "down") if thr[kid][s] is not None and thr[kid][s]["t1"] == thr[kid][s]["t2"])
            no_side = sum(1 for kid in K.DIRECTION_KATAS for s in ("up", "down") if thr[kid][s] is None)
            empty_slots = {kid: sum(1 for f in tables[kid] if f is None) for kid in K.SCALE_KATAS}
            evaluable = {blk: {kid: sum(1 for r in recs[blk] if r["v"][kid] != K.NE) for kid in K.W} for blk in recs}
            t2 = time.time()
            st_count = {}
            for cell in cells_of(sym, low, h):
                tc0 = time.time()
                row, chk = calibrate_cell(cell, recs, thr, tables, h_ms, pinned)
                dt = time.time() - tc0
                if dt > CELL_LIMIT_S:
                    raise Stop(f"D-9: cell {cell['taskClass']} {cell['key']} took {dt:.1f} s")
                if dt > max_cell[0]:
                    max_cell = (dt, f"{cell['taskClass']} {cell['key']}")
                rows.append(row)
                checks.append(chk)
                st_count[row["status"]] = st_count.get(row["status"], 0) + 1
            t_cells = time.time() - t2
            invariants(rows[-35:], recs, thr, tables, h_ms)
            summary.append({"symbol": sym, "horizon": h, "evaluable": evaluable, "tiedThresholdSides": ties,
                            "sidesWithoutThresholds": no_side, "factorSlotsWithoutFactor": empty_slots, "statuses": st_count})
            timing.append({"symbol": sym, "horizon": h, "loadSeconds": round(t_load, 3), "barsDecisionsSeconds": round(t_dec, 3),
                           "cellsSeconds": round(t_cells, 3)})
        census["series"].append(sc)
    if len(rows) != 280 or len({(r["taskClass"], r["key"]) for r in rows}) != 280:
        raise Stop("280 distinct (taskClass, key) rows required")
    trials = len({r["trialId"] for r in rows})
    if trials != TRIALS:
        raise Stop(f"{trials} distinct trialId, FMT l.9 gives {TRIALS} wave 1 trials")
    census_sha = write_text(f"{out_dir}/census-monark.json", K.js_json_pretty(census) + "\n")
    checks_sha = write_text(f"{out_dir}/wave1-monark-checks.json", K.js_json_pretty({"model": MODEL, "rows": checks}) + "\n")
    # M-3, FMT l.43-44: hash ends the trial chain, built in the generator's code only (item TRIAL-HEAD-WRITTEN-1)
    registry = {"plan": PLAN, "engine": ENGINE, "trialRegistryHead": {"length": trials, "hash": None}, "rows": rows}
    wave_sha = write_text(f"{out_dir}/wave1-monark.json", K.js_json_pretty(registry) + "\n")
    # D-5: the seal, first act after the run
    write_text(f"{out_dir}/SEAL.sha256", f"# {MODEL}\n{wave_sha}  wave1-monark.json\n{checks_sha}  wave1-monark-checks.json\n")
    run = {"model": MODEL, "censusSha256": census_sha, "wave1Sha256": wave_sha, "checksSha256": checks_sha,
           "runSeconds": round(time.time() - t_run, 3), "slowestCellSeconds": round(max_cell[0], 3), "slowestCell": max_cell[1],
           "timing": timing, "summary": summary,
           "statusCounts": {s: sum(1 for r in rows if r["status"] == s) for s in ("under_calib", "silence", "region", "vetoed")},
           "calibStatusCounts": {s: sum(1 for r in rows if r["calib"]["status"] == s) for s in ("under_calib", "silence", "region")},
           "inputs": io_guard.inputs()}  # M-7: role, base name, sha256 and bytes of every input read
    write_text(f"{out_dir}/recalc-run.json", K.js_json_pretty(run) + "\n")
    print(f"wave1-monark.json {wave_sha}")
    print(f"wave1-monark-checks.json {checks_sha}")
    print(f"census-monark.json {census_sha}")
    print(json.dumps(run["statusCounts"]), json.dumps(run["calibStatusCounts"]), f"run {run['runSeconds']} s")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("usage: python -B recalc_p2.py <series dir> <oracle dir> <out dir>")
        sys.exit(2)
    try:
        sys.exit(main(*sys.argv[1:]))
    except Stop as e:
        print(f"STOP: {e}")
        sys.exit(2)
