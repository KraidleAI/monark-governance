# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only.
# Exact port of the calibration engine of @monark/hikae at 207f021f, read as written definitions (mission D-1):
#   binomial.ts  parseUnitDecimal l.37-44, parseAlpha l.47-51, parseTestDelta l.54-58, binomCdfLeq l.69-87,
#                riskControlMaxExceedances l.90-98, zeroErrorFloor l.101-113, missUpperBound l.125-138,
#                ceilDecimal4 l.141-145, spendDelta l.148-158;
#   l1-split.ts  indicatorScore l.20-22, splitQuantile l.32-45, riskControlQuantile l.61-80, conformalSet l.87-96,
#                indicatorScores l.102-109;
#   runs.ts      runsCount l.38-43, binomRow l.46-54, runsLowerTailLeq l.63-78, balancedExceedance l.91-107;
#   contracts    calib-digest.ts l.14-30 at 207f021f (calibDigest; used only to identify the test arrays).
# Python int (unbounded) wherever the definition is exact; binary64 only for scores and qhat (a score value).
# Pure: no clock, no file, no network. Every refusal raises RangeError, as the TypeScript does.
import hashlib
import math
import struct
from functools import lru_cache

GRID = 10_000_000  # 1e-7 grid of the published bound (binomial.ts l.17)
MAX_ATTEMPT = 4  # binomial.ts l.18
MAX_SAFE = 2 ** 53 - 1


class RangeError(Exception):
    pass


def is_safe_integer(v):
    """Number.isSafeInteger: an integer-valued finite number of magnitude at most 2^53 - 1 (a bool is not a number)."""
    if isinstance(v, bool):
        return False
    if isinstance(v, int):
        return -MAX_SAFE <= v <= MAX_SAFE
    if isinstance(v, float):
        return math.isfinite(v) and v == math.floor(v) and abs(v) <= MAX_SAFE
    return False


def _reduce(num, den):
    g = math.gcd(num, den)
    return (num, den) if g == 0 else (num // g, den // g)


def parse_unit_decimal(dec):
    """binomial.ts l.37-44: a plain decimal "0.d...d" strictly inside (0, 1), reduced ratio (num, den)."""
    if not isinstance(dec, str) or not dec.startswith("0."):
        raise RangeError(f"not a plain decimal in (0, 1): {dec!r}")
    digits = dec[2:]
    if len(digits) == 0 or any(c < "0" or c > "9" for c in digits):
        raise RangeError(f"not a plain decimal in (0, 1): {dec!r}")
    num = int(digits)
    if num == 0:
        raise RangeError(f"not in (0, 1): {dec!r}")
    return _reduce(num, 10 ** len(digits))


def parse_alpha(dec):
    """binomial.ts l.47-51: at most four decimals once trailing zeros are dropped."""
    num, den = parse_unit_decimal(dec)
    if 10000 % den != 0:
        raise RangeError(f"alpha has more than four decimals: {dec!r}")
    return (num, den)


def parse_test_delta(dec):
    """binomial.ts l.54-58: strictly below 0.25."""
    num, den = parse_unit_decimal(dec)
    if 4 * num >= den:
        raise RangeError(f"test_delta must be below 0.25: {dec!r}")
    return (num, den)


def _assert_count(name, v):
    if not is_safe_integer(v) or v < 0:
        raise RangeError(f"{name} must be a non-negative integer, got {v!r}")


def binom_cdf_leq(n, k, a, delta):
    """binomial.ts l.69-87: True iff P(Bin(n, a) <= k) <= delta, a = (num, den) in [0, 1], delta >= 0; Horner in q, exact."""
    _assert_count("n", n)
    if not is_safe_integer(k):
        raise RangeError(f"k must be an integer, got {k!r}")
    an, ad = a
    dn, dd = delta
    if ad <= 0 or an < 0 or an > ad:
        raise RangeError("a must be a ratio in [0, 1]")
    if dd <= 0 or dn < 0:
        raise RangeError("delta must be a non-negative ratio")
    n = int(n)
    k = int(k)
    top = min(k, n)
    q = ad - an
    s = 0  # sum_{i <= top} C(n, i) an^i q^(top - i)
    coef = 1  # C(n, i)
    pw = 1  # an^i
    for i in range(0, top + 1):
        s = s * q + coef * pw
        coef = (coef * (n - i)) // (i + 1)
        pw *= an
    total = 0 if top < 0 else s * q ** (n - top)
    return dd * total <= dn * ad ** n


@lru_cache(maxsize=None)
def risk_control_max_exceedances(n, alpha_dec, delta_dec):
    """binomial.ts l.90-98: k* = the largest k >= 0 with P(Bin(n, alpha) <= k) <= test_delta, or -1."""
    _assert_count("n", n)
    a = parse_alpha(alpha_dec)
    d = parse_test_delta(delta_dec)
    if not binom_cdf_leq(n, 0, a, d):
        return -1
    k = 0
    while binom_cdf_leq(n, k + 1, a, d):
        k += 1
    return k


@lru_cache(maxsize=None)
def zero_error_floor(alpha_dec, delta_dec):
    """binomial.ts l.101-113: n0 = the smallest n with (1 - alpha)^n <= test_delta (galloping, then bisection)."""
    a = parse_alpha(alpha_dec)
    d = parse_test_delta(delta_dec)
    lo, hi = 0, 1
    while not binom_cdf_leq(hi, 0, a, d):
        lo, hi = hi, hi * 2
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if binom_cdf_leq(mid, 0, a, d):
            hi = mid
        else:
            lo = mid
    return hi


def _fixed(m, scale, places):
    """binomial.ts l.115-118."""
    return f"{m // scale}.{str(m % scale).rjust(places, '0')}"


@lru_cache(maxsize=None)
def miss_upper_bound(n, k_star, delta_dec):
    """binomial.ts l.125-138: U(n, k*, delta), the smallest 1e-7 grid point where the tail is at most delta, 7 decimals."""
    _assert_count("n", n)
    _assert_count("kStar", k_star)
    if k_star >= n:
        raise RangeError(f"kStar must be below n, got {k_star} for n = {n}")
    d = parse_test_delta(delta_dec)
    lo, hi = 0, GRID
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if binom_cdf_leq(n, k_star, (mid, GRID), d):
            hi = mid
        else:
            lo = mid
    return _fixed(hi, GRID, 7)


def ceil_decimal4(r):
    """binomial.ts l.141-145."""
    num, den = r
    if den <= 0 or num < 0 or num > den:
        raise RangeError("ratio must be in [0, 1]")
    return _fixed((num * 10000 + den - 1) // den, 10000, 4)


def spend_delta(base_dec, attempt):
    """binomial.ts l.148-158: base / 2^(attempt - 1), exact decimal string without trailing zeros."""
    if not is_safe_integer(attempt) or attempt < 1 or attempt > MAX_ATTEMPT:
        raise RangeError(f"calib_attempt must be 1 to {MAX_ATTEMPT}, got {attempt!r}")
    parse_test_delta(base_dec)
    digits = base_dec[2:]
    j = int(attempt) - 1
    num = int(digits) * 5 ** j
    text = str(num).rjust(len(digits) + j, "0")
    end = len(text)
    while end > 1 and text[end - 1] == "0":
        end -= 1
    return "0." + text[:end]


def binom_upper_tail_leq(n, k, alpha_dec, level_dec):
    """TEST veto of plan P2 l.63 (ADR l.83): True iff P(Bin(n, alpha) >= k) <= level, exact, written as
    P(Bin(n, alpha) <= k - 1) >= 1 - level (complement, integers over den^n)."""
    _assert_count("n", n)
    _assert_count("k", k)
    an, ad = parse_alpha(alpha_dec)
    ln_, ld = parse_unit_decimal(level_dec)
    if k == 0:
        return ld <= ln_  # the tail is 1
    if k > n:
        return True  # the tail is 0
    q = ad - an
    s = 0
    coef = 1
    for i in range(0, k):
        s += coef * an ** i * q ** (n - i)
        coef = (coef * (n - i)) // (i + 1)
    # P(X <= k - 1) = s / ad^n ; tail = 1 - that ; tail <= ln_/ld  <=>  ld * (ad^n - s) <= ln_ * ad^n
    total = ad ** n
    return ld * (total - s) <= ln_ * total


# ---- l1-split.ts ----

UNDER = {"reason": "under_calib"}


def indicator_score(yhat, y):
    return 0 if y == yhat else 1


def indicator_scores(yhat, labels):
    return {y: indicator_score(yhat, y) for y in labels}


def conformal_set(scores_by_label, qhat):
    return [label for label, s in scores_by_label.items() if s <= qhat]


def _is_nan(x):
    return isinstance(x, float) and x != x


def split_quantile(scores, alpha, n_min):
    """l1-split.ts l.32-45 (float alpha, JavaScript semantics of Math.ceil, NaN and out-of-range index)."""
    n = len(scores)
    if n < n_min:  # a NaN nMin compares False, as in JavaScript
        return dict(UNDER)
    x = (n + 1) * (1 - alpha)
    if x != x or x == math.inf:
        return dict(UNDER)  # NaN index or p > n
    if x == -math.inf:
        return dict(UNDER)  # sorted[-Infinity] is undefined
    p = math.ceil(x)
    if p > n:
        return dict(UNDER)
    srt = sorted(scores)
    if p - 1 < 0 or p - 1 >= n:
        return dict(UNDER)  # sorted[p - 1] undefined
    return {"qhat": srt[p - 1]}


def risk_control_quantile(scores, alpha_dec, delta_dec, n_min):
    """l1-split.ts l.61-80: served value at rank n - k*, or under_calib (fail closed)."""
    n = len(scores)
    if not is_safe_integer(n_min) or n < n_min:
        return dict(UNDER)
    if any(_is_nan(s) for s in scores):
        return dict(UNDER)
    try:
        parse_alpha(alpha_dec)
        parse_test_delta(delta_dec)
    except Exception:
        return dict(UNDER)
    if n < zero_error_floor(alpha_dec, delta_dec):
        return dict(UNDER)
    k_star = risk_control_max_exceedances(n, alpha_dec, delta_dec)
    rank = n - k_star
    srt = sorted(scores)
    if rank - 1 < 0 or rank - 1 >= n:
        raise RangeError(f"served rank {rank} outside 1..{n}")
    qhat = srt[rank - 1]
    k_obs = 0
    for s in scores:
        if s > qhat:
            k_obs += 1
    return {"qhat": qhat, "rank": rank, "kStar": k_star, "kObs": k_obs, "missBound": miss_upper_bound(n, k_star, delta_dec)}


# ---- runs.ts ----

def _check_bits(bits):
    for b in bits:
        if isinstance(b, bool) or not isinstance(b, (int, float)) or (b != 0 and b != 1):
            raise RangeError("runs: every element must be 0 or 1")


def runs_count(bits):
    """runs.ts l.38-43."""
    _check_bits(bits)
    runs = 0 if len(bits) == 0 else 1
    for i in range(1, len(bits)):
        if bits[i] != bits[i - 1]:
            runs += 1
    return runs


def binom_row(m):
    """runs.ts l.46-54: C(m, 0) .. C(m, m)."""
    row = [1]
    c = 1
    for j in range(m):
        c = (c * (m - j)) // (j + 1)
        row.append(c)
    return row


def _at(row, j):
    return row[j] if 0 <= j < len(row) else 0


def runs_lower_tail_leq(bits, level_dec):
    """runs.ts l.63-78: exact P(R <= r_obs | counts) and the decision tail <= level."""
    ln_, ld = parse_unit_decimal(level_dec)
    runs = runs_count(bits)
    ones = sum(1 for b in bits if b == 1)
    zeros = len(bits) - ones
    if ones == 0 or zeros == 0:
        return {"empty": True, "runs": runs, "ones": ones, "zeros": zeros}
    a = binom_row(ones - 1)
    b = binom_row(zeros - 1)
    tail_num = 0
    for r in range(2, runs + 1):
        k = r // 2
        if r % 2 == 0:
            tail_num += 2 * _at(a, k - 1) * _at(b, k - 1)
        else:
            tail_num += _at(a, k) * _at(b, k - 1) + _at(a, k - 1) * _at(b, k)
    tail_den = _at(binom_row(ones + zeros), ones)
    return {"empty": False, "runs": runs, "ones": ones, "zeros": zeros, "tailNum": tail_num, "tailDen": tail_den,
            "reject": tail_num * ld <= ln_ * tail_den}


def balanced_exceedance(values):
    """runs.ts l.91-107: 1{v > t} with t minimizing abs(2 ones(t) - n), ties toward more ones; empty iff constant."""
    if any(_is_nan(v) for v in values):
        raise RangeError("runs: a value is NaN")
    n = len(values)
    srt = sorted(values)
    best = None
    for i in range(n):
        t = srt[i]
        if i + 1 < n and srt[i + 1] == t:
            continue
        ones = n - i - 1
        if ones == 0:
            continue
        gap = abs(2 * ones - n)
        if best is None or gap < best[2] or (gap == best[2] and ones > best[1]):
            best = (t, ones, gap)
    if best is None:
        return {"empty": True}
    t = best[0]
    return {"empty": False, "threshold": t, "bits": [1 if v > t else 0 for v in values]}


# ---- contracts calib-digest.ts ----

def calib_digest(scores):
    """calib-digest.ts l.14-30: sha256 of the ascending float64 big-endian bytes, -0 written as 0."""
    for s in scores:
        if not math.isfinite(s):
            raise ValueError(f"calibDigest: non-finite score {s!r}")
    buf = b"".join(struct.pack(">d", 0.0 if s == 0 else float(s)) for s in sorted(scores))
    return hashlib.sha256(buf).hexdigest()
