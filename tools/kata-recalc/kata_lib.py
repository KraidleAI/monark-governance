# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only. Lot 1d (2026-10-06): M-1.
# Kata library rewritten from the written definitions only (mission D-1); RECHERCHES code never read.
# Sources (file, line) in `wt` at 1ea4f64: ADR = decisions/0005-ADR-draft-strategy-library-kata.md (v3.1, sha256 b011e4de...),
# P1 = decisions/0005-G0-part-P1-library.md, P2 = decisions/0005-G0-part-P2-calibration.md, SPEC = kata/spec/KATA-SPEC.md,
# FMT = kata/registry/FORMAT.md. Arithmetic: IEEE-754 binary64 (P1 l.40, SPEC l.19). Every sum is an explicit loop from the
# oldest element (P1 l.38, SPEC l.19): Python's built-in sum() of floats is compensated since 3.12 and is never used here.
import calendar
import hashlib
import math

NE = "non_evaluable"
STEP_MS = 900_000  # one 15-minute candle (P1 l.27)
H_MS = {"1h": 3_600_000, "4h": 14_400_000}  # 4 and 16 candles (ADR l.39, SPEC l.9)


def utc_ms(y, mo, d):
    return calendar.timegm((y, mo, d, 0, 0, 0)) * 1000


REC_START = utc_ms(2024, 10, 1)  # recording range, end exclusive (ADR l.16)
REC_END = utc_ms(2026, 10, 1)
BLOCKS = {  # ADR l.74-79, end exclusive
    "SELECT": (utc_ms(2024, 10, 1), utc_ms(2025, 10, 1)),
    "CALIB": (utc_ms(2025, 10, 1), utc_ms(2026, 4, 1)),
    "TEST": (utc_ms(2026, 4, 1), utc_ms(2026, 10, 1)),
}
DIRECTION_KATAS = ["trend-ema-v1", "tsmom-v1", "meanrev-z-v1", "takerflow-v1", "vote4-v1"]  # ADR l.58-62
SCALE_KATAS = ["ewma-vol-hw-v1", "realized-vol-hw-v1", "parkinson-hw-v1"]  # ADR l.65-67
W = {"trend-ema-v1": 200, "tsmom-v1": 25, "meanrev-z-v1": 20, "takerflow-v1": 24, "vote4-v1": 200,
     "ewma-vol-hw-v1": 101, "realized-vol-hw-v1": 49, "parkinson-hw-v1": 48}
# bar tuple: (start, open, high, low, close, volume, takerBuyBase) as in SPEC l.65
B_START, B_OPEN, B_HIGH, B_LOW, B_CLOSE, B_VOL, B_TBB = range(7)


# ---------------------------------------------------------------- JavaScript number and JSON writing

def js_number(x):
    """ECMAScript Number::toString (the writing of P2 l.111, FMT l.36, SPEC l.15 and l.52): shortest round-trip digits."""
    if isinstance(x, bool):
        raise TypeError("a boolean is not a number")
    if isinstance(x, int):
        if abs(x) > 2 ** 53:
            raise ValueError("integer beyond 2^53: write it as a double first")
        return str(x)
    if x != x:
        return "NaN"
    if x == 0:
        return "0"  # +0 and -0
    if x < 0:
        return "-" + js_number(-x)
    if x == math.inf:
        return "Infinity"
    r = repr(x)  # shortest round-trip decimal of the double (Python float_repr_style 'short')
    mant, _, exp = r.partition("e")
    e = int(exp) if exp else 0
    ip, _, fp = mant.partition(".")
    digits = (ip + fp).lstrip("0")
    last_exp = e - len(fp)  # value = int(ip + fp) x 10^last_exp
    stripped = digits.rstrip("0")
    last_exp += len(digits) - len(stripped)
    s = stripped
    k = len(s)
    n = last_exp + k  # s x 10^(n - k) = x, 10^(k-1) <= s < 10^k
    if k <= n <= 21:
        return s + "0" * (n - k)
    if 0 < n <= 21:
        return s[:n] + "." + s[n:]
    if -6 < n <= 0:
        return "0." + "0" * (-n) + s
    e1 = n - 1
    sign = "+" if e1 >= 0 else "-"
    if k == 1:
        return s + "e" + sign + str(abs(e1))
    return s[0] + "." + s[1:] + "e" + sign + str(abs(e1))


_ESC = {'"': '\\"', "\\": "\\\\", "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "\t": "\\t"}


def js_string(s):
    """JSON.stringify of a string: quote, backslash, the five short escapes, other controls and lone surrogates as lower-case u-escapes."""
    out = ['"']
    for ch in s:
        o = ord(ch)
        if ch in _ESC:
            out.append(_ESC[ch])
        elif o < 0x20 or 0xD800 <= o <= 0xDFFF:
            out.append("\\u%04x" % o)
        else:
            out.append(ch)
    out.append('"')
    return "".join(out)


def _scalar(v):
    if v is None:
        return "null"
    if v is True:
        return "true"
    if v is False:
        return "false"
    if isinstance(v, int):
        return js_number(v)
    if isinstance(v, float):
        return js_number(v) if math.isfinite(v) else "null"  # JSON.stringify writes a non-finite number as null
    if isinstance(v, str):
        return js_string(v)
    raise TypeError(f"not a JSON value: {type(v).__name__}")


def js_json_compact(v):
    """JSON.stringify(v): no spaces."""
    if isinstance(v, list):
        return "[" + ",".join(js_json_compact(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{" + ",".join(js_string(k) + ":" + js_json_compact(x) for k, x in v.items()) + "}"
    return _scalar(v)


def js_json_pretty(v, level=0, ind=" "):
    """JSON.stringify(v, null, 1): one value per line, one space of indentation per level, empty containers inline."""
    if isinstance(v, list):
        if not v:
            return "[]"
        inner = ind * (level + 1)
        return "[\n" + ",\n".join(inner + js_json_pretty(x, level + 1, ind) for x in v) + "\n" + ind * level + "]"
    if isinstance(v, dict):
        if not v:
            return "{}"
        inner = ind * (level + 1)
        return "{\n" + ",\n".join(inner + js_string(k) + ": " + js_json_pretty(x, level + 1, ind) for k, x in v.items()) \
            + "\n" + ind * level + "}"
    return _scalar(v)


def sha256_text(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def seq_sha256(seq):
    """Digest convention of P2 l.111, FMT l.36: sha256 of the JSON of the sequence as JavaScript writes it."""
    return sha256_text(js_json_compact(list(seq)))


# ---------------------------------------------------------------- arithmetic helpers (explicit loops, oldest first)

def fsum_loop(xs):
    acc = 0.0
    for x in xs:
        acc = acc + x
    return acc


def sd1(xs):
    """Sample standard deviation, ddof 1 (ADR l.55, SPEC l.21), two passes, sums oldest first."""
    n = len(xs)
    m = fsum_loop(xs) / n
    acc = 0.0
    for x in xs:
        d = x - m
        acc = acc + d * d
    return math.sqrt(acc / (n - 1))


def lean(x):
    """clip to [-1, 1]; non-finite or exactly 0 is non_evaluable (ADR l.51, l.55; P1 l.35, l.39; SPEC l.22-23)."""
    if not math.isfinite(x):
        return NE
    if x > 1:
        x = 1.0
    elif x < -1:
        x = -1.0
    if x == 0:
        return NE
    return x


def scale(x):
    """A scale value not strictly positive (or not finite) is non_evaluable (SPEC l.24)."""
    return x if (math.isfinite(x) and x > 0) else NE


# ---------------------------------------------------------------- katas (ADR l.58-67, P1 l.32-34, SPEC l.30-42)

def kata_trend_ema(bars):
    c = [b[B_CLOSE] for b in bars]

    def ema(s):
        k = 2 / (s + 1)
        e = fsum_loop(c[:s]) / s
        for x in c[s:]:
            e = k * x + (1 - k) * e  # P1 l.32: written exactly this way
        return e

    e20 = ema(20)
    e100 = ema(100)
    acc = 0.0
    for i in range(len(bars) - 14, len(bars)):  # the last 14 true ranges (P1 l.33)
        h = bars[i][B_HIGH]
        lo = bars[i][B_LOW]
        pc = c[i - 1]
        acc = acc + max(h - lo, abs(h - pc), abs(lo - pc))
    atr = acc / 14
    den = 5 * atr
    if den == 0 or not math.isfinite(den):
        return NE
    return lean((e20 - e100) / den)


def kata_tsmom(bars):
    c = [b[B_CLOSE] for b in bars]
    r24 = math.log(c[-1] / c[0])
    rets = [math.log(c[i] / c[i - 1]) for i in range(1, len(c))]
    den = 2 * sd1(rets) * math.sqrt(24)
    if den == 0 or not math.isfinite(den):
        return NE
    return lean(r24 / den)


def kata_meanrev(bars):
    c = [b[B_CLOSE] for b in bars]
    m = fsum_loop(c) / len(c)
    sd = sd1(c)
    if sd == 0 or not math.isfinite(sd):
        return NE
    z = (c[-1] - m) / sd
    return lean(-z / 2)


def kata_takerflow(bars):
    tb = fsum_loop(b[B_TBB] for b in bars)
    v = fsum_loop(b[B_VOL] for b in bars)
    if v == 0 or not math.isfinite(v):
        return NE
    s = tb / v
    return lean((s - 0.5) / 0.05)


def vote4_of(parts):
    """Mean of trend-ema, tsmom, meanrev-z, takerflow summed in that order (P1 l.38, SPEC l.34)."""
    if any(p == NE for p in parts):
        return NE
    acc = 0.0
    for p in parts:
        acc = acc + p
    return lean(acc / 4)


def kata_vote4(bars):
    return vote4_of([kata_trend_ema(bars[-200:]), kata_tsmom(bars[-25:]), kata_meanrev(bars[-20:]), kata_takerflow(bars[-24:])])


LAMBDA = 0.94
_EWMA_POW = [LAMBDA ** i for i in range(100)]  # the power computed as lambda ** i (P1 l.34)
EWMA_Z = fsum_loop(_EWMA_POW[i] for i in range(99, -1, -1))  # normalizer summed oldest first (P1 l.81 N1, SPEC l.19)
_EWMA_W = [_EWMA_POW[i] / EWMA_Z for i in range(100)]  # each weight normalized before use


def kata_ewma(bars):
    c = [b[B_CLOSE] for b in bars]
    acc = 0.0
    nret = len(c) - 1  # 100 returns, i = 0 the most recent
    for j in range(1, len(c)):
        r = math.log(c[j] / c[j - 1])
        acc = acc + (_EWMA_W[nret - j] * r) * r  # KATA-SPEC l.42 (2026-10-02): (w_i * r_i) * r_i; C-1, IT-G2-1 of the P2b review
    return scale(math.sqrt(acc))


def kata_realized(bars):
    c = [b[B_CLOSE] for b in bars]
    acc = 0.0
    for j in range(1, len(c)):
        r = math.log(c[j] / c[j - 1])
        acc = acc + r * r
    return scale(math.sqrt(acc / (len(c) - 1)))


FOUR_LN2 = 4 * math.log(2)


def kata_parkinson(bars):
    acc = 0.0
    for b in bars:
        x = math.log(b[B_HIGH] / b[B_LOW])
        acc = acc + x * x
    return scale(math.sqrt((acc / len(bars)) / FOUR_LN2))


KATA_FUNCS = {"trend-ema-v1": kata_trend_ema, "tsmom-v1": kata_tsmom, "meanrev-z-v1": kata_meanrev,
              "takerflow-v1": kata_takerflow, "vote4-v1": kata_vote4, "ewma-vol-hw-v1": kata_ewma,
              "realized-vol-hw-v1": kata_realized, "parkinson-hw-v1": kata_parkinson}


def kata_value(kid, window):
    """The kata on exactly its W bars (the caller passes bars[end - W : end], SPEC l.66)."""
    if len(window) != W[kid]:
        raise ValueError(f"{kid} needs {W[kid]} bars, got {len(window)}")
    return KATA_FUNCS[kid](window)


def features_digest(window):
    """SPEC l.15: sha256 of the JSON array of [start, open, high, low, close, volume, takerBuyBase] per bar, oldest first."""
    return sha256_text(js_json_compact([list(b[:7]) for b in window]))


# ---------------------------------------------------------------- bars, windows, labels, grid

def build_bars(candles, h_ms):
    """Horizon bars over the recording range (SPEC l.10-11, P1 l.27, l.116): list indexed by (start - REC_START) // h_ms,
    None for an absent bar. candles: dict openTime -> (open, high, low, close, volume, takerBuyBase)."""
    per = h_ms // STEP_MS
    out = []
    for T in range(REC_START, REC_END, h_ms):
        cs = [candles.get(T + j * STEP_MS) for j in range(per)]
        if any(c is None for c in cs):
            out.append(None)
            continue
        hi = cs[0][1]
        lo = cs[0][2]
        vol = 0.0
        tbb = 0.0
        for c in cs:
            if c[1] > hi:
                hi = c[1]
            if c[2] < lo:
                lo = c[2]
            vol = vol + c[4]
            tbb = tbb + c[5]
        out.append((T, cs[0][0], hi, lo, cs[-1][3], vol, tbb))
    return out


def window_at(bars, t, w, h_ms):
    """The w bars whose ranges end at or before t, the last covering [t - h, t) (P1 l.28); None if one is absent or
    lies before the recording (SPEC l.12-13)."""
    end = (t - REC_START) // h_ms  # index of the bar starting at t (exclusive)
    start = end - w
    if start < 0 or end > len(bars):
        return None
    win = bars[start:end]
    if any(b is None for b in win):
        return None
    return win


def decision_times(block, h_ms):
    """t on the horizon grid, t >= start, t + h <= end (P1 l.16)."""
    start, end = BLOCKS[block]
    t0 = -(-start // h_ms) * h_ms
    return list(range(t0, end - h_ms + 1, h_ms))


def labels_at(candles, bars, t, h_ms):
    """P1 l.29, ADR l.39, l.43-46, l.50. close(t): candle opening at t - 15 min; close(t + h): at t + h - 15 min.
    dir and r are dropped (None) when either close is missing; D and U use the bar [t, t + h) and are dropped when it is absent."""
    c0 = candles.get(t - STEP_MS)
    c1 = candles.get(t + h_ms - STEP_MS)
    close0 = None if c0 is None else c0[3]
    close1 = None if c1 is None else c1[3]
    if close0 is None or close1 is None:
        y = None
        r = None
    else:
        y = "up" if close1 > close0 else ("down" if close1 < close0 else "flat")
        r = math.log(close1 / close0)
    idx = (t - REC_START) // h_ms
    bar = bars[idx] if 0 <= idx < len(bars) else None
    if bar is None or close0 is None:
        d = None
        u = None
    else:
        d = max(0.0, -math.log(bar[B_LOW] / close0))
        u = max(0.0, math.log(bar[B_HIGH] / close0))
    return y, r, d, u


def slot_of(t, h_ms):
    """P1 l.31, SPEC l.45: Monday 00:00 UTC is slot 0; epoch day 0 is a Thursday (slot 72 at t = 0)."""
    s1 = ((t // 3_600_000) + 72) % 168
    return s1 if h_ms == H_MS["1h"] else s1 // 4


def nslots(h_ms):
    return 168 if h_ms == H_MS["1h"] else 42


# ---------------------------------------------------------------- buckets (ADR l.87, P1 l.30, l.35, SPEC l.51-57)

def _evaluable_lean(m):
    return isinstance(m, (int, float)) and not isinstance(m, bool) and math.isfinite(m) and m != 0 and -1 <= m <= 1


def terciles_by_side(leans):
    """Thresholds frozen per side: abs(m) of the evaluable leans, sorted ascending, ranks ceil(n/3) and ceil(2n/3), 1-based,
    written as JavaScript writes the double; fewer than 3 values: None."""
    sides = {"up": [], "down": []}
    for m in leans:
        if _evaluable_lean(m):
            sides["up" if m > 0 else "down"].append(abs(m))
    out = {}
    for side in ("up", "down"):
        v = sorted(sides[side])
        n = len(v)
        out[side] = None if n < 3 else {"t1": js_number(v[(n + 2) // 3 - 1]), "t2": js_number(v[(2 * n + 2) // 3 - 1])}
    return out


def bucket_of(m, frozen):
    """b1: abs(m) <= t1; b2: t1 < abs(m) <= t2; b3: abs(m) > t2; side without thresholds: under_calib; bad lean: NE."""
    if not _evaluable_lean(m):
        return NE
    side = "up" if m > 0 else "down"
    th = frozen.get(side)
    if th is None:
        return "under_calib"
    a = abs(m)
    if a <= float(th["t1"]):
        return side + "-b1"
    if a <= float(th["t2"]):
        return side + "-b2"
    return side + "-b3"


# ---------------------------------------------------------------- hour-of-week factors (ADR l.68, P1 l.31, l.37, SPEC l.44-47, l.58)

def factor_table(samples, h_ms):
    """samples: (t, r, sigma_raw) in the given order; skipped when sigma_raw is not > 0 or not finite, or r not finite;
    f(slot) = sqrt(sum((r / sigma_raw)^2) / count), None for a slot without a sample."""
    ns = nslots(h_ms)
    acc = [0.0] * ns
    cnt = [0] * ns
    for t, r, s in samples:
        if not (isinstance(s, (int, float)) and math.isfinite(s) and s > 0) or not math.isfinite(r):
            continue
        k = slot_of(t, h_ms)
        q = r / s
        acc[k] = acc[k] + q * q
        cnt[k] += 1
    return [math.sqrt(acc[k] / cnt[k]) if cnt[k] > 0 else None for k in range(ns)]
