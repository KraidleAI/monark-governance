# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only.
# Oracle D-2 (i): every value of kata/spec/vectors.json recomputed by kata_lib.py and compared under the conformance contract of
# KATA-SPEC l.68 (relative 1e-12, absolute 1e-15 near zero, strings equal); plus the js_number cases of mission D-4 and the
# JSON.stringify(x, null, 1) reference writing. Usage: python -B vectors_check.py <vectors.json> <out.txt>
import json
import math
import sys

import kata_lib as K

MODEL = "claude-opus-5-5"


def within(got, want):
    """KATA-SPEC l.68: abs(got - want) <= max(1e-12 x abs(want), 1e-15)."""
    if got == want:
        return True
    return abs(got - want) <= max(1e-12 * abs(want), 1e-15)


def main(vec_path, out_path):
    v = json.load(open(vec_path, encoding="utf-8"))
    lines = [MODEL, "# vectors_check.py - oracle D-2 (i) - conformance contract KATA-SPEC l.68"]
    sections = {}

    def rec(section, name, ok, detail="", conformance=True):
        s = sections.setdefault(section, {"ok": 0, "fail": 0, "conformance": conformance})
        s["ok" if ok else "fail"] += 1
        if not ok:
            lines.append(f"FAIL [{section}] {name} {detail}")

    # A. js_number (mission D-4) and the pretty writer
    js_cases = [(0, "0"), (1, "1"), (1e-7, "1e-7"), (0.1, "0.1"), (1.5e-7, "1.5e-7"), (123456789012, "123456789012"),
                (1e21, "1e+21"), (-0.0, "0"), (0.0, "0"), (1.0, "1"), (123456789012.0, "123456789012"), (0.00001, "0.00001"),
                (0.000001, "0.000001"), (1e16, "10000000000000000"), (1e20, "100000000000000000000"), (-2.5, "-2.5"),
                (5e-324, "5e-324"), (1.7976931348623157e308, "1.7976931348623157e+308"), (100.0, "100"), (123.456, "123.456")]
    for x, want in js_cases:
        got = K.js_number(x)
        rec("js_number", repr(x), got == want, f"got {got} want {want}", conformance=False)
    for i in range(1, 2001):
        x = (i * 0.6180339887498949) % 3 * 10.0 ** ((i % 41) - 20)
        rec("js_number", f"round-trip #{i}", float(K.js_number(x)) == x, conformance=False)
    pretty = K.js_json_pretty({"a": [1, {}], "b": []})
    want = "\n".join(["{", ' "a": [', "  1,", "  {}", " ],", ' "b": []', "}"])
    rec("js_json", "JSON.stringify({a:[1,{}],b:[]},null,1)", pretty == want, repr(pretty), conformance=False)
    rec("js_json", "compact", K.js_json_compact([0, 1e-7, 0.1, -0.0, None, "x"]) == '[0,1e-7,0.1,0,null,"x"]', conformance=False)

    # B. the written EWMA normalizer (P1 l.107, N-4: 16.632418753824588 in both orders) - information, not a vector
    lines.append(f"info EWMA normalizer {K.js_number(K.EWMA_Z)} (P1 l.107 writes 16.632418753824588): "
                 f"{'equal' if K.EWMA_Z == 16.632418753824588 else 'DIFFERENT'}")

    # C. kata values
    bit = {"same": 0, "differ": 0}
    worst = 0.0
    for case in v["kata_cases"]:
        bars = [tuple(b) for b in case["bars"]]
        for d in case["decisions"]:
            end = d["end"]
            for kid, want in d["values"].items():
                got = K.kata_value(kid, bars[end - K.W[kid]:end])
                name = f"{case['name']} end {end} {kid}"
                if want == K.NE or got == K.NE:
                    rec("kata", name, got == want, f"got {got!r} want {want!r}")
                    continue
                ok = within(got, want)
                rec("kata", name, ok, f"got {got!r} want {want!r}")
                if got == want:
                    bit["same"] += 1
                else:
                    bit["differ"] += 1
                    worst = max(worst, abs(got - want) / max(abs(want), 1e-300))
    lines.append(f"info kata values bit-identical {bit['same']}, not bit-identical {bit['differ']}, worst relative gap {worst:.3e}")

    # D. features_digest (SPEC l.15)
    by_name = {c["name"]: [tuple(b) for b in c["bars"]] for c in v["kata_cases"]}
    one_bar = [(1759276800000, 100, 101.5, 99, 100.25, 12, 0.5)]
    rec("digest-example", "SPEC l.15 example", K.features_digest(one_bar) == "2564e5c6b056f611767a3a864e3794ca0f80e7dde8c275842ddc9a9f73166426",
        conformance=False)
    for dg in v["digests"]:
        bars = by_name[dg["case"]]
        got = K.features_digest(bars[dg["end"] - dg["W"]:dg["end"]])
        rec("digest", f"{dg['case']} end {dg['end']} W {dg['W']}", got == dg["sha256"], f"got {got}")

    # E. buckets (terciles by side on the given leans, then the bucket rule on the published thresholds)
    for bi, b in enumerate(v["buckets"]):
        frozen = K.terciles_by_side(b["leans"])
        for side in ("up", "down"):
            want = b["frozen"][side]
            got = frozen[side]
            if want is None or got is None:
                rec("bucket-frozen", f"case {bi} {side}", got == want, f"got {got} want {want}")
            else:
                for t in ("t1", "t2"):
                    rec("bucket-frozen", f"case {bi} {side} {t}", got[t] == want[t], f"got {got[t]} want {want[t]}")
        for p in b["probes"]:
            got = K.bucket_of(p["m"], b["frozen"])
            rec("bucket-probe", f"case {bi} m {p['m']!r}", got == p["bucket"], f"got {got} want {p['bucket']}")

    # F. factors
    for key in ("factors", "factors_4h"):
        f = v[key]
        samples = [(s["t"], s["r"], s["sigmaRaw"]) for s in f["samples"]]
        got = K.factor_table(samples, f["horizon_ms"])
        want = f["factors"]
        rec(key + "-slot-count", "slot count", len(got) == len(want), f"got {len(got)} want {len(want)}", conformance=False)
        same = 0
        for k, (g, w) in enumerate(zip(got, want)):
            if w is None or g is None:
                rec(key, f"slot {k}", g is None and w is None, f"got {g!r} want {w!r}")
            else:
                rec(key, f"slot {k}", within(g, w), f"got {g!r} want {w!r}")
                same += g == w
        nulls = sum(1 for w in want if w is None)
        lines.append(f"info {key}: {len(want)} slots, {nulls} without factor, {same} non-null slots bit-identical")

    # G. synthetic look-ahead, drop and slot checks of kata_lib windows and labels (no series; P1 l.28-29, ADR l.26, l.50, SPEC l.45)
    import datetime
    seed = [12345]

    def nxt():
        seed[0] = (seed[0] * 1103515245 + 12345) & 0xFFFFFFFF
        return (seed[0] >> 8) / 16777216

    base = {}
    price = 100.0
    for i in range(40 * 96):
        o = price
        price = price * (1 + (nxt() - 0.5) * 0.01)
        hi = max(o, price) * (1 + nxt() * 0.002)
        lo = min(o, price) * (1 - nxt() * 0.002)
        vol = 10 + nxt() * 5
        base[K.REC_START + i * K.STEP_MS] = (o, hi, lo, price, vol, vol * nxt())
    for h in ("1h", "4h"):
        hm = K.H_MS[h]
        t = K.REC_START + 36 * 86_400_000
        kids = [k for k in K.W if K.W[k] * hm <= t - K.REC_START]

        def values(candles):
            bars = K.build_bars(candles, hm)
            out = {}
            for kid in kids:
                win = K.window_at(bars, t, K.W[kid], hm)
                out[kid] = K.NE if win is None else K.KATA_FUNCS[kid](win)
            return out, K.labels_at(candles, bars, t, hm)

        v0, l0 = values(base)
        rec("lookahead", f"{h} all evaluable at t", all(x != K.NE for x in v0.values()) and None not in l0, conformance=False)
        future = {ot: ((c[0] * 1.37, c[1] * 1.37, c[2] * 1.37, c[3] * 1.37, c[4] * 3, c[5]) if ot >= t else c) for ot, c in base.items()}
        v1, l1 = values(future)
        rec("lookahead", f"{h} values unchanged when every candle at or after t moves", v1 == v0, conformance=False)
        rec("lookahead", f"{h} r, D and U change with the future", l1[1] != l0[1] and l1[2:] != l0[2:], conformance=False)
        last = dict(base)
        c = last[t - K.STEP_MS]
        last[t - K.STEP_MS] = (c[0], c[1] * 1.01, c[2], c[3] * 1.005, c[4], c[5])
        v2, l2 = values(last)
        moved = [k for k in kids if k != "takerflow-v1" and (k in K.SCALE_KATAS or abs(v0[k]) < 1)]
        rec("lookahead", f"{h} the candle at t - 15 min is read ({len(moved)} katas not clipped)",
            len(moved) >= 3 and all(v2[k] != v0[k] for k in moved) and l2[1] != l0[1], conformance=False)
        hole = dict(base)
        del hole[t - K.STEP_MS]
        v3, l3 = values(hole)
        rec("lookahead", f"{h} a missing candle in the last bar: non_evaluable, labels dropped",
            all(x == K.NE for x in v3.values()) and l3 == (None, None, None, None), conformance=False)
        end_hole = dict(base)
        del end_hole[t + hm - K.STEP_MS]
        v4, l4 = values(end_hole)
        rec("lookahead", f"{h} close(t + h) missing: direction, range and path dropped", v4 == v0 and l4 == (None, None, None, None),
            conformance=False)
        mid_hole = dict(base)
        del mid_hole[t + K.STEP_MS]
        v5, l5 = values(mid_hole)
        rec("lookahead", f"{h} a candle inside (t, t + h) missing: path dropped only",
            v5 == v0 and l5[0] == l0[0] and l5[1] == l0[1] and l5[2] is None and l5[3] is None, conformance=False)
    for ms in (0, K.REC_START, K.REC_START + 5 * 3_600_000 + 86_400_000 * 3, 1759276800000, 1767225600000 + 7 * 3_600_000):
        d = datetime.datetime.fromtimestamp(ms // 1000, datetime.UTC)
        want1 = 24 * d.weekday() + d.hour
        rec("slot", f"slot of {ms}", K.slot_of(ms, K.H_MS["1h"]) == want1 and K.slot_of(ms, K.H_MS["4h"]) == want1 // 4, conformance=False)
    rec("slot", "t = 0 is Thursday 00:00, slot 72", K.slot_of(0, K.H_MS["1h"]) == 72, conformance=False)
    rec("grid", "decision counts ADR l.81", [len(K.decision_times(b, K.H_MS[h])) for b in ("CALIB", "TEST") for h in ("1h", "4h")]
        == [4368, 1092, 4392, 1098], conformance=False)

    total_conf = sum(s["ok"] + s["fail"] for s in sections.values() if s["conformance"])
    fail_conf = sum(s["fail"] for s in sections.values() if s["conformance"])
    fail_all = sum(s["fail"] for s in sections.values())
    for name, s in sections.items():
        tag = "vector" if s["conformance"] else "extra"
        lines.append(f"section {name} ({tag}): {s['ok']} ok, {s['fail']} fail")
    lines.append(f"conformance checks on vectors.json: {total_conf} (the specification announces 317), failures {fail_conf}")
    lines.append(f"VERDICT: {'GREEN' if fail_all == 0 else 'RED'} ({fail_all} failure(s) over all sections)")
    text = "\n".join(lines) + "\n"
    open(out_path, "w", encoding="utf-8", newline="\n").write(text)
    print(text, end="")
    return 0 if fail_all == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
