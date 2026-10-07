# claude-opus-5-5 - 2026-10-02 - lot P2-RECALC-TOOL-1 (MONARK G1), Python 3.14 standard library only. Lot 1d (2026-10-06): M-4, M-6, M-7.
# Oracle D-2 (ii): the exact engine of binom_exact.py (Horner, galloping, bisection) against a second, independent writing:
#   direct sums of the binomial terms C(n, i) p^i q^(n - i) over den^n as exact rationals (fractions.Fraction), linear scans.
#   Checked: the comparator P(Bin(n, a) <= k) <= delta, k*, n0, U (by its defining property on the 1e-7 grid), the TEST veto
#   tail P(Bin(n, alpha) >= k) <= 0.05, and the printed values of ADR l.98.
# Oracle D-2 (iii): every case of the four hikae test files extracted at 207f021f, expected values read in the tests and
#   replayed on the Python functions (no node). The arrays USDE and LIQ_S0 come from
#   `git show 207f021f:packages/hikae/test/served-scores.ts` in <repository> at run time (read only, memory only, Q-1).
# Registry mode (ADR l.155): every k*, rank and U of a registry against the second writing, plus n0, UTest and the veto.
# Usage: python -B binom_check.py <repository> <out-binom.txt> <out-hikae.txt>   (M-6: the governance repository is an argument)
#        python -B binom_check.py --registry <wave1.json> <out.txt>
import io_guard  # the input guard, before any other module (M-7)
import math
import os
import re
import sys
from fractions import Fraction

import binom_exact as E

MODEL = "claude-opus-5-5"
GRID = 10_000_000


# ======================================================================== D-2 (ii): second writing, Fraction

def frac_dec(s):
    """Independent decimal reader: "0.d..d" -> Fraction (reduced by Fraction itself)."""
    head, _, frac = s.partition(".")
    assert head == "0" and frac.isdigit()
    return Fraction(int(frac), 10 ** len(frac))


def cdf_frac(n, k, a):
    """P(Bin(n, a) <= k) as an exact rational: direct sum of the terms over den^n."""
    if k < 0:
        return Fraction(0)
    p, den = a.numerator, a.denominator
    q = den - p
    num = 0
    for i in range(0, min(k, n) + 1):
        num += math.comb(n, i) * p ** i * q ** (n - i)
    return Fraction(num, den ** n)


def kstar_frac(n, a, d):
    """Largest k in -1..n with P(Bin(n, a) <= k) <= d: linear scan of the cumulative direct sum."""
    p, den = a.numerator, a.denominator
    q = den - p
    total = den ** n
    cum = 0
    k = -1
    for i in range(0, n + 1):
        cum += math.comb(n, i) * p ** i * q ** (n - i)
        if Fraction(cum, total) <= d:
            k = i
        else:
            break
    return k


def n0_frac(a, d):
    """Smallest n with (1 - a)^n <= d: linear scan."""
    n = 0
    while (1 - a) ** n > d:
        n += 1
    return n


def upper_tail_frac(n, k, a):
    """P(Bin(n, a) >= k), direct sum."""
    p, den = a.numerator, a.denominator
    q = den - p
    num = 0
    for i in range(max(k, 0), n + 1):
        num += math.comb(n, i) * p ** i * q ** (n - i)
    return Fraction(num, den ** n)


def oracle_ii(lines):
    ok = fail = 0

    def rec(name, cond, detail=""):
        nonlocal ok, fail
        if cond:
            ok += 1
        else:
            fail += 1
            lines.append(f"FAIL {name} {detail}")

    alphas = ["0.45", "0.01", "0.1", "0.05", "0.5", "0.2"]
    deltas = ["0.05", "0.1", "0.025"]
    small = list(range(1, 81))
    big = [100, 150, 182, 200, 299, 300, 473, 500, 613, 628, 728, 1000, 1092, 1098]
    u_big = {("0.45", "0.05"), ("0.01", "0.05"), ("0.1", "0.05")}
    counts = {"comparator": 0, "kstar": 0, "n0": 0, "U": 0, "veto": 0, "adr": 0}
    for al in alphas:
        for de in deltas:
            a, d = frac_dec(al), frac_dec(de)
            n0a = E.zero_error_floor(al, de)
            n0b = n0_frac(a, d)
            rec(f"n0 alpha {al} delta {de}", n0a == n0b and (1 - a) ** (n0b - 1) > d, f"A {n0a} B {n0b}")
            counts["n0"] += 1
            for n in small + big:
                ka = E.risk_control_max_exceedances(n, al, de)
                kb = kstar_frac(n, a, d)
                rec(f"k* n {n} alpha {al} delta {de}", ka == kb, f"A {ka} B {kb}")
                counts["kstar"] += 1
                ks = sorted({-1, 0, 1, kb - 1, kb, kb + 1} | ({n - 1, n, n + 1} if n <= 300 else set()))
                for k in ks:
                    if k < -1:
                        continue
                    got = E.binom_cdf_leq(n, k, E.parse_alpha(al), E.parse_test_delta(de))
                    want = (Fraction(1) if k >= n and n > 300 else cdf_frac(n, k, a)) <= d
                    rec(f"comparator n {n} k {k} alpha {al} delta {de}", got == want, f"A {got} B {want}")
                    counts["comparator"] += 1
                if kb >= 0 and kb < n and (n <= 80 or (al, de) in u_big):
                    u = E.miss_upper_bound(n, kb, de)
                    g = int(u[0]) * GRID + int(u[2:])
                    at = cdf_frac(n, kb, Fraction(g, GRID)) <= d
                    below = cdf_frac(n, kb, Fraction(g - 1, GRID)) <= d
                    rec(f"U n {n} k* {kb} delta {de}", len(u) == 9 and at and not below, f"U {u} at {at} below {below}")
                    counts["U"] += 1
    for n, al in ((4368, "0.01"), (4392, "0.01"), (1092, "0.01"), (1098, "0.01")):
        a, d = frac_dec(al), frac_dec("0.05")
        ka = E.risk_control_max_exceedances(n, al, "0.05")
        kb = kstar_frac(n, a, d)
        rec(f"k* n {n} alpha {al}", ka == kb, f"A {ka} B {kb}")
        counts["kstar"] += 1
        u = E.miss_upper_bound(n, kb, "0.05")
        g = int(u[0]) * GRID + int(u[2:])
        ok_u = cdf_frac(n, kb, Fraction(g, GRID)) <= d and not (cdf_frac(n, kb, Fraction(g - 1, GRID)) <= d)
        rec(f"U n {n} k* {kb} alpha {al}", ok_u, f"U {u}")
        counts["U"] += 1
    # TEST veto tail P(Bin(n, alpha) >= k) <= 0.05
    for al in ("0.45", "0.01"):
        a = frac_dec(al)
        for n in list(range(1, 41)) + [182, 728, 1098, 4392]:
            if n <= 40:
                ks = range(0, n + 2)
            else:  # around the 5 % boundary n a + 1.645 sd, both sides, plus the mean and the extremes
                mid = int(n * float(a))
                edge = int(n * float(a) + 1.645 * math.sqrt(n * float(a) * (1 - float(a))))
                ks = sorted({0, 1, mid, n, n + 1} | set(range(max(0, edge - 6), edge + 7)))
            for k in ks:
                got = E.binom_upper_tail_leq(n, k, al, "0.05")
                want = (Fraction(0) if k > n else upper_tail_frac(n, k, a)) <= Fraction(1, 20)
                rec(f"veto n {n} k {k} alpha {al}", got == want, f"A {got} B {want}")
                counts["veto"] += 1
    # printed values of ADR l.98 (written by RECHERCHES; recomputed here)
    adr = [("n0 at 0.45", E.zero_error_floor("0.45", "0.05"), 6), ("n0 at 0.01", E.zero_error_floor("0.01", "0.05"), 299),
           ("k* n 728 at 0.45", E.risk_control_max_exceedances(728, "0.45", "0.05"), 305),
           ("k* n 182 at 0.45", E.risk_control_max_exceedances(182, "0.45", "0.05"), 70),
           ("k* n 4368 at 0.01", E.risk_control_max_exceedances(4368, "0.01", "0.05"), 32),
           ("k* n 1092 at 0.01", E.risk_control_max_exceedances(1092, "0.01", "0.05"), 5)]
    for name, got, want in adr:
        rec(f"ADR l.98 {name}", got == want, f"got {got} want {want}")
        counts["adr"] += 1
    for n, k, four, five in ((728, 305, "0.4500", 0.44993), (182, 70, "0.4478", 0.44778)):
        u = E.miss_upper_bound(n, k, "0.05")
        c4 = E.ceil_decimal4((int(u[2:]), GRID))
        rec(f"ADR l.98 U n {n} k* {k}", c4 == four and abs(float(u) - five) < 1e-5, f"U {u} ceil4 {c4}")
        counts["adr"] += 1
        lines.append(f"info U({n}, {k}, 0.05) = {u}, four decimals rounded up {c4} (ADR l.98 prints {four}, {five})")
    for k, c in counts.items():
        lines.append(f"section {k}: {c} checks")
    return ok, fail


# ======================================================================== D-2 (iii): replay of the hikae tests

M32 = 0xFFFFFFFF


def mulberry32(seed):
    """risk-control-quantile.test.ts l.97-105 and oracle-l1-split.test.ts l.14-22 (same sequence), in uint32 arithmetic."""
    s = seed & M32

    def nxt():
        nonlocal s
        s = (s + 0x6D2B79F5) & M32
        t = ((s ^ (s >> 15)) * (s | 1)) & M32
        t = t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & M32)) & M32)
        return (t ^ (t >> 14)) / 4294967296

    return nxt


def lcg(seed0):
    """runs.test.ts l.130-136."""
    s = seed0 & M32

    def nxt():
        nonlocal s
        s = (s * 1103515245 + 12345) & M32
        return s >> 16

    return nxt


def shuffled(xs, nxt):
    out = list(xs)
    for i in range(len(out) - 1, 0, -1):
        j = nxt() % (i + 1)
        out[i], out[j] = out[j], out[i]
    return out


class Replay:
    def __init__(self, lines):
        self.lines = lines
        self.tests = {}
        self.cur = None

    def start(self, name):
        self.cur = name
        self.tests[name] = [0, 0, 0, ""]

    def ok(self, cond, label=""):
        t = self.tests[self.cur]
        if cond:
            t[0] += 1
        else:
            t[1] += 1
            if t[1] <= 5:
                self.lines.append(f"FAIL {self.cur}: {label}")

    def eq(self, got, want, label=""):
        self.ok(_deq(got, want), f"{label} got {_short(got)} want {_short(want)}")

    def throws(self, fn, label=""):
        try:
            fn()
        except E.RangeError:
            self.ok(True)
            return
        except Exception as e:  # a non-RangeError is not what the test asserts
            self.ok(False, f"{label}: {type(e).__name__}")
            return
        self.ok(False, f"{label}: no throw")

    def skip(self, n, reason):
        t = self.tests[self.cur]
        t[2] += n
        t[3] = reason


def _deq(a, b):
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deq(a[k], b[k]) for k in a)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_deq(x, y) for x, y in zip(a, b))
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    return a == b


def _short(x):
    r = repr(x)
    return r if len(r) <= 80 else r[:77] + "..."


def dec(s):
    """Test-side decimal reader, unreduced (binomial.test.ts l.24-27)."""
    frac = s.split(".")[1] if "." in s else ""
    return (int(frac), 10 ** len(frac))


def below(r):
    return (2 * r[0] - 1, 2 * r[1])


def zero_miss_meets(n, a, d):
    return d[1] * (a[1] - a[0]) ** n <= d[0] * a[1] ** n


def grid_units(rp, u):
    rp.eq(len(u), 9, f"seven decimals: {u}")
    return int(u[0]) * GRID + int(u[2:])


def replay_binomial(rp):
    rp.start("binomial_cdf_exact_against_closed_forms")
    for n in (1, 10, 170, 613):
        for s in ("0.01", "0.1", "0.5"):
            a = dec(s)
            q = a[1] - a[0]
            p0 = (q ** n, a[1] ** n)
            p1 = (q ** n + n * a[0] * q ** (n - 1), a[1] ** n)
            rp.eq(E.binom_cdf_leq(n, 0, a, p0), True, f"n={n} a={s} k=0 at")
            rp.eq(E.binom_cdf_leq(n, 0, a, below(p0)), False, f"n={n} a={s} k=0 below")
            rp.eq(E.binom_cdf_leq(n, 1, a, p1), True, f"n={n} a={s} k=1 at")
            rp.eq(E.binom_cdf_leq(n, 1, a, below(p1)), False, f"n={n} a={s} k=1 below")
    rp.eq(E.binom_cdf_leq(613, 60, dec("0.10"), dec("0.464195")), True)
    rp.eq(E.binom_cdf_leq(613, 60, dec("0.10"), dec("0.464185")), False)
    rp.eq(E.binom_cdf_leq(170, 0, dec("0.01"), dec("0.1812")), True)
    rp.eq(E.binom_cdf_leq(170, 0, dec("0.01"), dec("0.1811")), False)
    rp.eq(E.binom_cdf_leq(5, -1, dec("0.1"), (0, 1)), True)
    rp.eq(E.binom_cdf_leq(5, 5, dec("0.1"), dec("0.99")), False)
    rp.eq(E.binom_cdf_leq(5, 7, dec("0.1"), dec("0.99")), False)
    rp.eq(E.binom_cdf_leq(5, 7, dec("0.1"), (1, 1)), True)

    rp.start("binomial_zero_error_floor_table")
    table = [("0.10", "0.10", 22), ("0.10", "0.05", 29), ("0.05", "0.10", 45), ("0.05", "0.05", 59),
             ("0.02", "0.10", 114), ("0.02", "0.05", 149), ("0.01", "0.10", 230), ("0.01", "0.05", 299),
             ("0.10", "0.025", 36), ("0.10", "0.0125", 42), ("0.10", "0.00625", 49),
             ("0.01", "0.025", 368), ("0.01", "0.0125", 437), ("0.01", "0.00625", 505), ("0.5", "0.125", 3)]
    for al, de, n0 in table:
        rp.eq(E.zero_error_floor(al, de), n0, f"{al},{de} n0")
        rp.eq(zero_miss_meets(n0, dec(al), dec(de)), True)
        rp.eq(zero_miss_meets(n0 - 1, dec(al), dec(de)), False)
        rp.ok(E.risk_control_max_exceedances(n0, al, de) >= 0)
        rp.eq(E.risk_control_max_exceedances(n0 - 1, al, de), -1)

    rp.start("binomial_kstar_matches_synthesis_table")
    for n, al, de, ks, p_at, p_next, split in ((100, "0.10", "0.10", 5, "0.05758", "0.11716", 9),
                                                (200, "0.10", "0.05", 12, "0.03205", "0.05656", 19),
                                                (500, "0.10", "0.05", 38, "0.03934", "0.05502", 49)):
        rp.eq(E.risk_control_max_exceedances(n, al, de), ks, f"n={n} k*")
        rp.ok(ks < split)
        for k, p in ((ks, p_at), (ks + 1, p_next)):
            r = dec(p)
            rp.eq(E.binom_cdf_leq(n, k, dec(al), (2 * r[0] + 1, 2 * r[1])), True, f"n={n} k={k} below p + half")
            rp.eq(E.binom_cdf_leq(n, k, dec(al), (2 * r[0] - 1, 2 * r[1])), False, f"n={n} k={k} above p - half")
    rp.eq(E.risk_control_max_exceedances(613, "0.10", "0.05"), 48)
    rp.eq(E.risk_control_max_exceedances(613, "0.10", "0.10"), 51)
    rp.eq(E.risk_control_max_exceedances(170, "0.01", "0.05"), -1)
    rp.eq(E.risk_control_max_exceedances(170, "0.01", "0.10"), -1)
    for de, n1, n2 in (("0.05", 473, 628), ("0.10", 388, 531)):
        rp.eq(E.risk_control_max_exceedances(n1 - 1, "0.01", de), 0)
        rp.eq(E.risk_control_max_exceedances(n1, "0.01", de), 1)
        rp.eq(E.risk_control_max_exceedances(n2 - 1, "0.01", de), 1)
        rp.eq(E.risk_control_max_exceedances(n2, "0.01", de), 2)

    rp.start("binomial_upper_bound_at_kstar_rounded_up")
    table = [(170, 0, "0.10", "0.0134534"), (170, 0, "0.05", "0.0174676"), (230, 0, "0.10", "0.0099613"),
             (299, 0, "0.05", "0.0099692"), (10, 0, "0.05", "0.2588656"), (30, 0, "0.10", "0.0738813"),
             (20, 1, "0.05", "0.2161062"), (100, 5, "0.05", "0.1022534"), (150, 6, "0.05", "0.0774180"),
             (613, 51, "0.10", "0.0993457"), (613, 60, "0.10", "0.1150684"), (613, 60, "0.05", "0.1199058")]
    for n, k, de, u in table:
        rp.eq(E.miss_upper_bound(n, k, de), u, f"U({n},{k},{de})")
        if k != 0:
            continue
        m = grid_units(rp, u)
        d = dec(de)
        rp.eq(zero_miss_meets(n, (m, GRID), d), True)
        rp.eq(zero_miss_meets(n, (m - 1, GRID), d), False)
        closed = 1 - float(de) ** (1 / n)
        rp.ok(float(u) >= closed - 1e-12 and float(u) - closed < 1e-7 + 1e-12, f"U({n},0,{de}) vs closed form")
    for n, al, de, u, u4 in ((100, "0.10", "0.05", "0.0891963", "0.0892"), (150, "0.10", "0.05", "0.0941715", "0.0942"),
                             (299, "0.10", "0.05", "0.0995659", "0.0996"), (500, "0.10", "0.05", "0.0984283", "0.0985"),
                             (613, "0.10", "0.05", "0.0985253", "0.0986"), (1000, "0.10", "0.05", "0.0998573", "0.0999"),
                             (299, "0.01", "0.05", "0.0099692", "0.0100"), (473, "0.01", "0.05", "0.0099898", "0.0100")):
        ks = E.risk_control_max_exceedances(n, al, de)
        rp.eq(E.miss_upper_bound(n, ks, de), u, f"U({n}, k* {ks})")
        four = E.ceil_decimal4((grid_units(rp, u), GRID))
        rp.eq(four, u4)
        rp.ok(float(four) >= float(u) and float(four) <= float(al))

    rp.start("binomial_upper_bound_monotone")
    prev = E.miss_upper_bound(1, 0, "0.05")
    for n in range(2, 201):
        u = E.miss_upper_bound(n, 0, "0.05")
        rp.ok(grid_units(rp, u) < grid_units(rp, prev), f"decreasing at n={n}")
        prev = u
    prev = E.miss_upper_bound(200, 0, "0.05")
    for k in range(1, 31):
        u = E.miss_upper_bound(200, k, "0.05")
        rp.ok(grid_units(rp, u) > grid_units(rp, prev), f"increasing at k={k}")
        prev = u
    for n, k in ((50, 0), (50, 3), (200, 0), (200, 3)):
        us = [grid_units(rp, E.miss_upper_bound(n, k, d)) for d in ("0.01", "0.05", "0.1", "0.2")]
        for i in range(1, len(us)):
            rp.ok(us[i] < us[i - 1])
    for n in (5, 50, 200):
        for k in (0, 1, n // 10):
            seen = False
            for j in range(1, 100):
                now = E.binom_cdf_leq(n, k, (j, 100), dec("0.05"))
                rp.ok(now or not seen)
                seen = seen or now
            rp.ok(seen)

    rp.start("binomial_refuses_out_of_range_inputs")
    for bad in ("0", "1", "-0.1", "NaN", "1e-1", "0.1.0", "", "1.5", "0.", ".5", "0.0", " 0.1", "0.1 ", "+0.1", "0x1", "0.1:", "0./1"):
        rp.throws(lambda: E.parse_alpha(bad), f"alpha {bad!r}")
        rp.throws(lambda: E.parse_test_delta(bad), f"delta {bad!r}")
    rp.throws(lambda: E.parse_alpha("0.00001"))
    rp.throws(lambda: E.parse_alpha("0.12345"))
    rp.eq(E.parse_alpha("0.0001"), (1, 10000))
    rp.eq(E.parse_alpha("0.10"), E.parse_alpha("0.1"))
    rp.eq(E.parse_alpha("0.1000000"), E.parse_alpha("0.1"))
    for bad in ("0.25", "0.250", "0.3", "0.99"):
        rp.throws(lambda: E.parse_test_delta(bad), f"delta {bad!r}")
    rp.eq(E.parse_test_delta("0.2499"), (2499, 10000))
    rp.eq(E.parse_test_delta("0.00625"), (1, 160))
    rp.throws(lambda: E.risk_control_max_exceedances(100, "0.1", "0.25"))
    rp.throws(lambda: E.zero_error_floor("0.00001", "0.05"))
    rp.throws(lambda: E.miss_upper_bound(100, 4, "1e-1"))
    rp.throws(lambda: E.miss_upper_bound(10, 10, "0.05"))
    rp.throws(lambda: E.risk_control_max_exceedances(1.5, "0.1", "0.05"))
    rp.throws(lambda: E.binom_cdf_leq(-1, 0, dec("0.1"), dec("0.05")))
    rp.throws(lambda: E.binom_cdf_leq(10, 0.5, dec("0.1"), dec("0.05")))
    rp.throws(lambda: E.binom_cdf_leq(10, 0, (3, 2), dec("0.05")))

    rp.start("binomial_ceil4_and_spend")
    for num, den, out in ((61, 614, "0.0994"), (1, 171, "0.0059"), (49, 614, "0.0799"), (22, 300, "0.0734"),
                          (85, 1001, "0.0850"), (99 ** 170, 100 ** 170, "0.1812"), (994, 10000, "0.0994"),
                          (0, 1, "0.0000"), (1, 1, "1.0000")):
        rp.eq(E.ceil_decimal4((num, den)), out)
    rp.throws(lambda: E.ceil_decimal4((2, 1)))
    rp.eq([E.spend_delta("0.05", j) for j in (1, 2, 3, 4)], ["0.05", "0.025", "0.0125", "0.00625"])
    rp.eq([E.spend_delta("0.050", j) for j in (1, 2, 3, 4)], ["0.05", "0.025", "0.0125", "0.00625"])
    rp.eq([E.spend_delta("0.1", j) for j in (1, 4)], ["0.1", "0.0125"])
    for j in (0, 5, 1.5, -1):
        rp.throws(lambda: E.spend_delta("0.05", j), f"attempt {j}")
    rp.throws(lambda: E.spend_delta("0.25", 1))
    for j in range(1, 5):
        rp.eq(E.zero_error_floor("0.10", E.spend_delta("0.05", j)), [29, 36, 42, 49][j - 1])


UNDER = {"reason": "under_calib"}


def kstar_oracle(n, a, d):
    """risk-control-quantile.test.ts l.57-70 (term ratio recurrence)."""
    q = a[1] - a[0]
    total = a[1] ** n
    term = q ** n
    cum = 0
    k = -1
    for i in range(0, n + 1):
        cum += term
        if cum * d[1] > d[0] * total:
            break
        k = i
        if i < n:
            term = (term * (n - i) * a[0]) // ((i + 1) * q)
    return k


def tail_oracle(n, k, a):
    q = a[1] - a[0]
    term = q ** n
    cum = 0
    for i in range(0, min(k, n) + 1):
        cum += term
        if i < n:
            term = (term * (n - i) * a[0]) // ((i + 1) * q)
    return (cum, a[1] ** n)


def leq(x, y):
    return x[0] * y[1] <= y[0] * x[1]


def split_rank(n, a):
    return ((n + 1) * (a[1] - a[0]) + a[1] - 1) // a[1]


def order_stat(xs, rank):
    return sorted(xs)[rank - 1]


def replay_risk_control(rp, arrays):
    def rcq(scores, al, de, n_min=1):
        try:
            return E.risk_control_quantile(scores, al, de, n_min)
        except Exception as e:
            rp.ok(False, f"riskControlQuantile threw: {e}")
            return {"reason": "threw"}

    def served(r, cell):
        rp.ok("reason" not in r, f"{cell}: under_calib")
        return r

    rp.start("risk_control_rank_usde_and_liq_values")
    if arrays is None:
        rp.skip(24, "served-scores.ts not read")
    else:
        usde, liq = arrays["USDE"], arrays["LIQ_S0"]
        rp.eq(E.calib_digest(usde), "c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c")
        rp.eq(len(usde), 613)
        alpha = dec("0.10")
        rp.eq(kstar_oracle(613, alpha, dec("0.05")), 48)
        rp.eq(kstar_oracle(613, alpha, dec("0.10")), 51)
        rp.eq(split_rank(613, alpha), 553)
        at05 = served(rcq(usde, "0.10", "0.05"), "usde 0.05")
        rp.eq(at05, {"qhat": 1.5501056004166666e-4, "rank": 565, "kStar": 48, "kObs": 48, "missBound": "0.0985253"})
        rp.eq(at05.get("qhat"), order_stat(usde, 613 - 48))
        at10 = served(rcq(usde, "0.10", "0.10"), "usde 0.10")
        rp.eq(at10, {"qhat": 1.515488218333333e-4, "rank": 562, "kStar": 51, "kObs": 51, "missBound": "0.0993457"})
        rp.eq(at10.get("qhat"), order_stat(usde, 613 - 51))
        rp.eq(E.split_quantile(usde, 0.1, 1), {"qhat": 1.3119228083333334e-4})
        rp.eq(order_stat(usde, 553), 1.3119228083333334e-4)
        rp.eq(sum(1 for s in usde if s > 1.3119228083333334e-4), 60)
        rp.eq(served(rcq(usde, "0.10", "0.05", 613), "nMin 613").get("rank"), 565)
        rp.eq(rcq(usde, "0.10", "0.05", 614), UNDER)
        rp.eq(E.calib_digest(liq), "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334")
        rp.eq(len(liq), 170)
        for d in ("0.05", "0.10"):
            rp.eq(kstar_oracle(170, dec("0.01"), dec(d)), -1)
            rp.eq(rcq(liq, "0.01", d), UNDER)
        rp.skip(1, "re-export check of the package entry (module structure, l.139)")

    rp.start("risk_control_rank_never_below_split_rank_grid")
    cells = served_cells = 0
    for al in ("0.01", "0.02", "0.05", "0.10", "0.20"):
        for de in ("0.05", "0.10"):
            a, d = dec(al), dec(de)
            for n in range(1, 401):
                cells += 1
                k = kstar_oracle(n, a, d)
                r = rcq([n - i for i in range(n)], al, de)
                if k < 0:
                    rp.eq(r, UNDER, f"n={n} {al} {de}")
                    continue
                served_cells += 1
                s = served(r, f"n={n}")
                rp.eq([s.get("rank"), s.get("kStar"), s.get("qhat"), s.get("kObs")], [n - k, k, n - k, k], f"n={n} {al} {de}")
                rp.ok(s.get("rank", 0) >= split_rank(n, a))
    rp.eq(cells, 4000)
    rp.ok(served_cells > 3000, f"served {served_cells}")

    rp.start("risk_control_rank_indicator_singleton_iff_errors_at_most_kstar")
    rand = mulberry32(20260930)
    for n, pinned in ((150, 8), (299, 21), (613, 48)):
        k = kstar_oracle(n, dec("0.10"), dec("0.05"))
        rp.eq(k, pinned)
        for errors in (0, k - 1, k, k + 1, k + 2):
            scores = [0] * n
            placed = 0
            while placed < errors:
                i = math.floor(rand() * n)
                if scores[i] == 0:
                    scores[i] = 1
                    placed += 1
            s = served(rcq(scores, "0.10", "0.05"), f"n {n} errors {errors}")
            single = errors <= k
            rp.eq(s, {"qhat": 0 if single else 1, "rank": n - k, "kStar": k, "kObs": errors if single else 0,
                      "missBound": s.get("missBound")}, f"n {n} errors {errors}")

    rp.start("risk_control_rank_beta_law_exact_and_seeded")
    for al, de in (("0.05", "0.05"), ("0.10", "0.05"), ("0.10", "0.10"), ("0.20", "0.20")):
        a, d = dec(al), dec(de)
        for n in range(1, 161):
            r = rcq([i / n for i in range(n)], al, de)
            if "reason" in r:
                rp.eq(leq(tail_oracle(n, 0, a), d), False)
                continue
            rp.eq(leq(tail_oracle(n, n - r["rank"], a), d), True)
            rp.eq(leq(tail_oracle(n, n - r["rank"] + 1, a), d), False)
    rand = mulberry32(20260930)
    rp.eq(rand(), 0.7129707557614893, "first draw pinned")
    draws = 20000
    band = math.sqrt(math.log(2e6) / (2 * draws))
    for n, al, exact in ((59, "0.05", 0.0485), (299, "0.01", 0.0495)):
        t = tail_oracle(n, 0, dec(al))
        p = ((t[0] * 1000000) // t[1]) / 1e6
        rp.ok(abs(p - exact) < 0.00006)
        misses = 0
        for _ in range(draws):
            s = served(rcq([rand() for _ in range(n)], al, "0.05"), "draw")
            rp.eq(s.get("rank"), n)
            if 1 - s["qhat"] > float(al):
                misses += 1
        rp.ok(abs(misses / draws - p) <= band, f"n {n} frequency {misses / draws}")

    rp.start("risk_control_rank_fail_closed")

    def sc(n):
        return [i + 1 for i in range(n)]

    def check(r, cell):
        rp.eq(r, UNDER, cell)
        rp.eq("qhat" in r, False, cell)

    for al, de, n0 in (("0.10", "0.05", 29), ("0.10", "0.10", 22), ("0.05", "0.05", 59), ("0.01", "0.05", 299), ("0.01", "0.10", 230)):
        a, d = dec(al), dec(de)
        rp.eq(kstar_oracle(n0, a, d), 0)
        rp.eq(kstar_oracle(n0 - 1, a, d), -1)
        check(rcq(sc(n0 - 1), al, de), "n0 - 1")
        check(rcq(sc(1), al, de), "n 1")
        rp.eq(served(rcq(sc(n0), al, de), "n0").get("rank"), n0)
    check(rcq([], "0.10", "0.05", 0), "empty")
    check(rcq(sc(100), "0.10", "0.05", 101), "n < nMin")
    check(rcq(sc(100), "0.10", "0.05", math.nan), "nMin NaN")
    check(rcq(sc(100), "0.10", "0.05", 1.5), "nMin 1.5")
    check(rcq(sc(99) + [math.nan], "0.10", "0.05"), "NaN score")
    for bad in ("0", "1", "0.0", "-0.1", "1e-1", "0.1.0", "", ".1", "0.00001", "NaN"):
        check(rcq(sc(100), bad, "0.05"), f"alpha {bad!r}")
    for bad in ("0", "0.25", "0.3", "0.250", "1", "5e-2", ""):
        check(rcq(sc(100), "0.10", bad), f"delta {bad!r}")
    rp.eq(served(rcq(sc(100), "0.10", "0.2499"), "0.2499").get("kStar"), kstar_oracle(100, dec("0.10"), dec("0.2499")))

    rp.start("risk_control_rank_bound_ignores_ties")
    rp.eq(kstar_oracle(100, dec("0.10"), dec("0.05")), 4)
    atom = list(range(95)) + [1000, 1000, 1000, 1000, 2000]
    s = served(rcq(atom, "0.10", "0.05"), "atom")
    rp.eq(s, {"qhat": 1000, "rank": 96, "kStar": 4, "kObs": 1, "missBound": "0.0891963"})
    rp.eq(s.get("qhat"), order_stat(atom, 96))
    rp.eq(served(rcq(list(range(100)), "0.10", "0.05"), "distinct"),
          {"qhat": 95, "rank": 96, "kStar": 4, "kObs": 4, "missBound": "0.0891963"})
    rp.eq(rcq(list(reversed(atom)), "0.10", "0.05"), s)
    top = list(range(95)) + [1000] * 5
    rp.eq(served(rcq(top, "0.10", "0.05"), "top"), {"qhat": 1000, "rank": 96, "kStar": 4, "kObs": 0, "missBound": "0.0891963"})


def bits_of(x, ln):
    return [(x >> i) & 1 for i in range(ln)]


def with_runs(rp, ones, zeros, r):
    """runs.test.ts l.31-47."""
    first = 0 if zeros >= ones else 1
    c_first, c_second = (zeros, ones) if first == 0 else (ones, zeros)
    b_first, b_second = -(-r // 2), r // 2
    rp.ok(b_first <= c_first and b_second <= c_second and b_second >= 1, "helper: runs out of reach")
    out = []
    for i in range(r):
        is_first = i % 2 == 0
        sym = first if is_first else (1 if first == 0 else 0)
        idx = i // 2
        nb = b_first if is_first else b_second
        total = c_first if is_first else c_second
        size = total - (nb - 1) if idx == nb - 1 else 1
        out.extend([sym] * size)
    return out


def tail_of(rp, r):
    rp.eq(r["empty"], False)
    return (r.get("tailNum"), r.get("tailDen"))


def passes(r):
    return r["empty"] is False and r["reject"] is False


def balanced_oracle(xs):
    distinct = [v for i, v in enumerate(xs) if xs.index(v) == i]

    def above(t):
        return sum(1 for v in xs if v > t)

    counts = [c for c in (above(t) for t in distinct) if c > 0]
    if not counts:
        return None
    closest = min(abs(2 * c - len(xs)) for c in counts)
    ones = max(c for c in counts if abs(2 * c - len(xs)) == closest)
    threshold = next(t for t in distinct if above(t) == ones)
    return {"threshold": threshold, "ones": ones}


def assert_balanced(rp, xs, label):
    want = balanced_oracle(xs)
    got = E.balanced_exceedance(xs)
    if want is None:
        rp.eq(got, {"empty": True}, label)
        return None
    rp.eq(got["empty"], False, label)
    rp.eq(got.get("threshold"), want["threshold"], label)
    rp.eq(got.get("bits"), [1 if v > want["threshold"] else 0 for v in xs], label)
    rp.eq(sum(1 for b in got.get("bits", []) if b == 1), want["ones"], label)
    return want


def counting_median(xs):
    half = -(-len(xs) // 2)
    for v in xs:
        if sum(1 for s in xs if s <= v) >= half and sum(1 for s in xs if s < v) < half:
            return v
    return None


def replay_runs(rp, arrays):
    rltl = E.runs_lower_tail_leq
    rp.start("runs_lower_tail_exact_against_enumeration")
    for ln in range(1, 17):
        hist = [[0] * (ln + 2) for _ in range(ln + 1)]
        rep = [[-1] * (ln + 2) for _ in range(ln + 1)]
        inner = (1 << (ln - 1)) - 1
        for x in range(1 << ln):
            ones = bin(x).count("1")
            runs = 1 + bin((x ^ (x >> 1)) & inner).count("1")
            hist[ones][runs] += 1
            if rep[ones][runs] == -1:
                rep[ones][runs] = x
        for ones in range(1, ln):
            row = hist[ones]
            total = 0
            for c in row:
                total += c
            cum = 0
            for r in range(1, ln + 1):
                cum += row[r]
                x = rep[ones][r]
                if x == -1:
                    continue
                bits = bits_of(x, ln)
                rp.eq(E.runs_count(bits), r)
                res = rltl(bits, "0.05")
                rp.eq(tail_of(rp, res), (cum, total), f"len {ln} ones {ones} r {r}")
                rp.eq(res["empty"] is False and res["reject"], 100 * cum <= 5 * total)
    m20 = [(299, 21, 35), (613, 48, 82), (1000, 84, 146), (299, 149, 135), (613, 306, 286)]
    se = [(5, 5, 2), (10, 10, 6), (12, 12, 7), (15, 15, 10), (20, 20, 14), (2, 20, 2), (5, 10, 3), (8, 12, 6)]
    cases = [(o, n - o, t, "0.05") for n, o, t in m20] + [(o, z, t, "0.025") for o, z, t in se]
    for o, z, t, level in cases:
        rp.eq(passes(rltl(with_runs(rp, o, z, t), level)), False, f"{o}/{z} at {t}")
        rp.eq(passes(rltl(with_runs(rp, o, z, t + 1), level)), True, f"{o}/{z} at {t + 1}")
    prev = (0, 1)
    for r in range(2, 614):
        cur = tail_of(rp, rltl(with_runs(rp, 306, 307, r), "0.05"))
        rp.ok(cur[0] * prev[1] >= prev[0] * cur[1], f"monotone at {r}")
        prev = cur
    rp.eq(prev[0], prev[1])

    rp.start("runs_empty_and_fail_closed")
    for bits in ([], [0], [1], [0, 0, 0, 0], [1, 1, 1], [0] * 170):
        res = rltl(bits, "0.05")
        rp.eq(res["empty"], True)
        rp.eq("reject" in res, False)
        rp.eq(res["empty"] is False and res.get("reject") is False, False)
        rp.eq(res["runs"], 0 if len(bits) == 0 else 1)
    for values in ([], [2], [7, 7, 7, 7], [-0.0, 0, 0], [0] * 299, [1] * 170):
        rp.eq(E.balanced_exceedance(values), {"empty": True}, f"{len(values)} values")
    rp.eq(passes(rltl([0, 1, 0, 1, 0, 1], "0.99")), True)

    rp.start("runs_balanced_threshold_multiset")
    bal = E.balanced_exceedance
    rp.eq(bal([3, 1, 2, 4]), {"empty": False, "threshold": 2, "bits": [1, 0, 0, 1]})
    rp.eq(bal([5, 1, 3]), {"empty": False, "threshold": 1, "bits": [1, 0, 1]})
    rp.eq(bal([2, 2, 2, 1, 3]), {"empty": False, "threshold": 1, "bits": [1, 1, 1, 0, 1]})
    rp.eq(bal([0, 5, 5, 5]), {"empty": False, "threshold": 0, "bits": [0, 1, 1, 1]})
    rp.eq(bal([math.inf, 0, -math.inf]), {"empty": False, "threshold": -math.inf, "bits": [1, 1, 0]})
    nxt = lcg(20260930)
    multisets = 0
    for k in range(1, 10):
        for a in range(0, k + 1):
            for b in range(0, k - a + 1):
                c = k - a - b
                xs = shuffled([-1.5] * a + [0] * b + [7] * c, nxt)
                atoms = sum(1 for m in (a, b, c) if m > 0)
                rp.eq(bal(xs)["empty"], atoms == 1, f"{a}/{b}/{c}")
                assert_balanced(rp, xs, f"{a}/{b}/{c}")
                multisets += 1
    rp.eq(multisets, 219)
    for ln in range(1, 41):
        for rep in range(25):
            xs = [(nxt() % 5) if rep % 2 == 0 else (nxt() % 997) / 64 for _ in range(ln)]
            want = assert_balanced(rp, xs, f"grid {ln} {rep}")
            for _ in range(3):
                perm = shuffled(xs, nxt)
                rp.eq(assert_balanced(rp, perm, "perm"), want)
    for ln in range(2, 13):
        for x in range(1 << ln):
            bits = bits_of(x, ln)
            constant = x == 0 or x == (1 << ln) - 1
            rp.eq(bal(bits), {"empty": True} if constant else {"empty": False, "threshold": 0, "bits": bits}, f"{ln} {x}")
    for bad in ([math.nan], [0, math.nan, 1], [1, 2, math.nan]):
        rp.throws(lambda: bal(bad))

    rp.start("runs_balanced_threshold_g2_cases")
    n = 299
    nxt = lcg(299)
    rp.eq(bal([0] * n), {"empty": True})
    rp.eq(bal([1] * n), {"empty": True})
    seq = shuffled([1] * 21 + [0] * (n - 21), nxt)
    rp.eq(bal(seq), {"empty": False, "threshold": 0, "bits": seq})
    tail2 = rltl([1 if v == 1 else 0 for v in seq], "0.05")
    rp.eq(tail2["empty"], False)
    rp.eq(tail2["ones"], 21)
    capped = shuffled([(i + 1) / 8 for i in range(149)] + [1000] * 150, nxt)
    rp.eq(counting_median(capped), 1000)
    r3 = bal(capped)
    rp.eq(r3["empty"], False)
    rp.eq(r3.get("threshold"), 149 / 8)
    rp.eq(r3.get("bits"), [1 if v == 1000 else 0 for v in capped])
    rp.eq(rltl(r3["bits"], "0.05")["empty"], False)
    rp.eq(assert_balanced(rp, capped, "case 3"), {"threshold": 149 / 8, "ones": 150})
    if arrays is None:
        rp.skip(10, "served-scores.ts not read")
    else:
        liq, usde = arrays["LIQ_S0"], arrays["USDE"]
        rp.eq(E.calib_digest(liq), "e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334")
        rp.eq(len(liq), 170)
        rp.eq(assert_balanced(rp, liq, "liq s0"), {"threshold": 0, "ones": 23})
        rp.eq(counting_median(liq), 0)
        rp.eq(E.calib_digest(usde), "c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c")
        rp.eq(len(usde), 613)
        rp.eq(assert_balanced(rp, usde, "usde"), {"threshold": 0.000001242960625, "ones": 307})
        rp.eq(counting_median(usde), 0.0000012461032083333333)
        rp.eq(sum(1 for v in usde if v > 0.0000012461032083333333), 306)
        u = bal(usde)
        rp.eq(u["empty"] is False and len(u["bits"]), 613)

    rp.start("runs_refuses_bad_inputs")
    for bad in ("0", "0.0", "0.000", "1", "1.0", "", "0.", ".05", "5e-2", "0.05 ", "-0.05", "0.1.0", "NaN"):
        rp.throws(lambda: rltl([0, 1], bad), repr(bad))
    bits = with_runs(rp, 10, 10, 7)
    rp.eq(rltl(bits, "0.05"), rltl(bits, "0.050"))
    rp.eq(passes(rltl(bits, "0.0512")), True)
    rp.eq(passes(rltl(bits, "0.0513")), False)
    rp.eq(rltl([1, 0, 0, 0], "0.5"), {"empty": False, "runs": 2, "ones": 1, "zeros": 3, "tailNum": 2, "tailDen": 4, "reject": True})
    rp.eq(passes(rltl([1, 0, 0, 0], "0.4999")), True)
    rp.skip(3, "re-export and medianExceedance absence of the package entry (module structure, l.299-301)")
    rp.throws(lambda: E.runs_count([0, 2]))
    rp.throws(lambda: rltl([1, 0.5], "0.05"))
    rp.throws(lambda: bal([1, math.nan]))


def exact_rank(n, k):
    return math.floor(((n + 1) * (100 - k) + 99) / 100)


def replay_l1(rp):
    sq = E.split_quantile
    rp.start("oracle_split_rank_matches_exact_rational_rank")
    for n in range(1, 201):
        scores = list(range(1, n + 1))
        for k in range(1, 100):
            exact = exact_rank(n, k)
            r = sq(scores, k / 100, 1)
            if exact > n:
                rp.eq(r, UNDER, f"n={n} k={k}")
                continue
            rp.ok("qhat" in r, f"n={n} k={k}")
            strict = k in (1, 2, 5, 10, 20, 25, 50)
            if not strict and ((n + 1) * (100 - k)) % 100 == 0:
                rp.ok(r.get("qhat") in (exact, exact + 1), f"n={n} k={k} divisible")
            else:
                rp.eq(r.get("qhat"), exact, f"n={n} k={k}")

    rp.start("oracle_split_under_calib_iff_alpha_below_one_over_n_plus_1")
    for n in (9, 19, 49, 99, 150, 613):
        scores = list(range(1, n + 1))
        rp.eq(sq(scores, 0.999 / (n + 1), 1), UNDER)
        rp.eq(sq(scores, 1.001 / (n + 1), 1), {"qhat": n})
    rp.eq(sq([], 0.5, 0), UNDER)

    rp.start("oracle_split_fail_closed_on_alpha_outside_open_unit_interval")
    for alpha in (0, -0.1, 1, 1.5, math.nan):
        r = sq(list(range(1, 21)), alpha, 1)
        rp.eq(r, UNDER, f"alpha={alpha}")
        rp.eq("qhat" in r, False)

    rp.start("oracle_split_ties_and_input_order")
    cases = [([0, 1, 1, 1, 2, 2, 5, 5, 7], 0.25, 5), ([4, 4, 0, 0, 9, 9, 9, 1, 1, 4], 0.3, 9), ([3] * 9, 0.25, 3)]
    draw = mulberry32(20260930)
    for scores, alpha, qhat in cases:
        rp.eq(sq(scores, alpha, 1), {"qhat": qhat})
        for _ in range(20):
            perm = list(scores)
            for i in range(len(perm) - 1, 0, -1):
                j = math.floor(draw() * (i + 1))
                perm[i], perm[j] = perm[j], perm[i]
            rp.eq(sq(perm, alpha, 1), {"qhat": qhat})

    rp.start("oracle_indicator_commit_threshold_matches_binomial_table")

    def binomial_cdf(n, eps, t):
        log_mass = n * math.log(1 - eps)
        total = math.exp(log_mass)
        for j in range(t):
            log_mass += math.log(n - j) - math.log(j + 1) + math.log(eps) - math.log(1 - eps)
            total += math.exp(log_mass)
        return total

    rows = [(50, 4, [(0.1, 0.431), (0.12, 0.268), (0.15, 0.112)]), (100, 9, []),
            (200, 19, [(0.1, 0.466), (0.12, 0.164), (0.15, 0.015)]), (300, 29, []), (500, 49, [])]
    labels = E.indicator_scores("up", ["up", "down"])
    for n, threshold, table in rows:
        rp.eq(n - exact_rank(n, 10), threshold)
        largest = -1
        for errors in range(0, n + 1):
            scores = [0 if i < n - errors else 1 for i in range(n)]
            r = sq(scores, 0.1, 1)
            rp.ok("qhat" in r and r["qhat"] in (0, 1), f"n={n} errors={errors}")
            rp.eq(len(E.conformal_set(labels, r["qhat"])), r["qhat"] + 1)
            if r["qhat"] == 0:
                largest = errors
        rp.eq(largest, threshold)
        for eps, prob in table:
            rp.ok(abs(binomial_cdf(n, eps, largest) - prob) <= 1e-3, f"n={n} eps={eps}")

    rp.start("oracle_split_marginal_coverage_seeded_exchangeable")
    rp.eq(mulberry32(20260930)(), 0.7129707557614893)
    big_r = 20000
    t = math.sqrt(math.log(2e6) / (2 * big_r))
    draw = mulberry32(20260930)
    for n, alpha, p in ((19, 0.1, 18), (24, 0.1, 23)):
        exact = p / (n + 1)
        rp.ok(exact >= 1 - alpha and exact <= 1 - alpha + 1 / (n + 1))
        covered = 0
        for _ in range(big_r):
            calib = [draw() for _ in range(n)]
            r = sq(calib, alpha, 1)
            rp.ok("qhat" in r)
            if draw() <= r["qhat"]:
                covered += 1
        rp.ok(abs(covered / big_r - exact) <= t, f"n={n} coverage {covered / big_r}")


def read_served_scores(lines, repo):
    try:  # M-6, M-7: the repository is an argument; io_guard runs git show without the caller's GIT_* variables and notes the input
        out = io_guard.git_show("engine-test-source", repo, "207f021f:packages/hikae/test/served-scores.ts").decode("utf-8")
    except Exception as e:
        lines.append(f"info served-scores.ts not read: {type(e).__name__}")
        return None
    arrays = {}
    for name in ("LIQ_S0", "USDE"):
        m = re.search(r"export const " + name + r": readonly number\[\] = \[(.*?)\];", out, re.S)
        if m is None:
            lines.append(f"info served-scores.ts: array {name} not found")
            return None
        arrays[name] = [float(tok) for tok in (x.strip() for x in m.group(1).split(",")) if tok]
    lines.append("info served-scores.ts read by git show 207f021f (memory only): "
                 f"LIQ_S0 {len(arrays['LIQ_S0'])} values, USDE {len(arrays['USDE'])} values, identified below by calibDigest")
    return arrays


def oracle_registry(path, out_path):
    """ADR l.155 (P2 verification): every k*, rank and U of a registry equal to the exact binomial oracle (second writing),
    plus n0, UTest by its defining property, and the TEST veto with the row status."""
    import json
    io_guard.declare("registry")
    io_guard.output(out_path)
    raw = io_guard.read("registry", path)
    import hashlib
    reg = json.loads(raw.decode("utf-8"))
    lines = [MODEL, f"# binom_check.py --registry {path} sha256 {hashlib.sha256(raw).hexdigest()}"]
    ok = fail = 0
    d = Fraction(1, 20)
    n0s = {}

    def rec(name, cond):
        nonlocal ok, fail
        if cond:
            ok += 1
        else:
            fail += 1
            lines.append(f"FAIL {name}")

    def u_property(n, k, u):
        g = int(u[0]) * GRID + int(u[2:])
        return len(u) == 9 and cdf_frac(n, k, Fraction(g, GRID)) <= d and not (cdf_frac(n, k, Fraction(g - 1, GRID)) <= d)

    for r in reg["rows"]:
        a = frac_dec(r["alpha"])
        c, t = r["calib"], r["test"]
        n = c["n"]
        name = f"{r['taskClass']} {r['key']}"
        if r["alpha"] not in n0s:
            n0s[r["alpha"]] = n0_frac(a, d)
        n0 = n0s[r["alpha"]]
        if c["kStar"] is None:
            rec(f"{name} under_calib iff n < n0", c["status"] == "under_calib" and n < n0 and c["rank"] is None and c["U"] is None)
        else:
            kb = kstar_frac(n, a, d)
            rec(f"{name} n >= n0", n >= n0)
            rec(f"{name} k*", c["kStar"] == kb)
            rec(f"{name} rank = n - k*", c["rank"] == n - kb)
            rec(f"{name} U property", u_property(n, kb, c["U"]))
        if t["UTest"] is None:
            rec(f"{name} UTest absent only without points or misses", t["nTest"] == 0 or t["kTest"] is None)
        elif t["UTest"] == "1":  # M-4, FMT l.49 (N-4)
            rec(f"{name} UTest 1", t["kTest"] == t["nTest"] >= 1)
        else:
            rec(f"{name} UTest property", t["kTest"] < t["nTest"] and u_property(t["nTest"], t["kTest"], t["UTest"]))
        want = c["status"] == "region" and t["nTest"] >= 1 and upper_tail_frac(t["nTest"], t["kTest"], a) <= d
        rec(f"{name} veto", t["vetoed"] == want and (r["status"] == "vetoed") == want
            and (r["status"] == c["status"] or r["status"] == "vetoed"))
    lines.append(f"rows {len(reg['rows'])}, checks {ok + fail}, failures {fail}")
    lines.extend(io_guard.input_lines())
    lines.append(f"VERDICT: {'GREEN' if fail == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    open(out_path, "w", encoding="utf-8", newline="\n").write(text)
    print(text, end="")
    return 0 if fail == 0 else 1


def main(repo, out_ii, out_iii):
    io_guard.declare("engine-test-source")
    io_guard.output(out_ii)
    io_guard.output(out_iii)
    lines = [MODEL, "# binom_check.py - oracle D-2 (ii): exact engine against a second writing (Fraction, direct sums)"]
    ok, fail = oracle_ii(lines)
    lines.append(f"checks {ok + fail}, failures {fail}")
    lines.append(f"VERDICT: {'GREEN' if fail == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    open(out_ii, "w", encoding="utf-8", newline="\n").write(text)
    print(text, end="")
    lines2 = [MODEL, "# binom_check.py - oracle D-2 (iii): replay of the four hikae test files extracted at 207f021f"]
    arrays = read_served_scores(lines2, repo)
    rp = Replay(lines2)
    replay_binomial(rp)
    replay_risk_control(rp, arrays)
    replay_runs(rp, arrays)
    replay_l1(rp)
    tot_ok = tot_fail = tot_skip = 0
    for name, (o, f, s, why) in rp.tests.items():
        lines2.append(f"test {name}: {o} ok, {f} fail" + (f", {s} not replayed ({why})" if s else ""))
        tot_ok, tot_fail, tot_skip = tot_ok + o, tot_fail + f, tot_skip + s
    lines2.append(f"tests {len(rp.tests)}, assertions replayed {tot_ok + tot_fail}, failures {tot_fail}, not replayed {tot_skip}")
    lines2.extend(io_guard.input_lines())
    lines2.append(f"VERDICT: {'GREEN' if tot_fail == 0 else 'RED'}")
    text2 = "\n".join(lines2) + "\n"
    open(out_iii, "w", encoding="utf-8", newline="\n").write(text2)
    print(text2, end="")
    return 0 if fail == 0 and tot_fail == 0 else 1


if __name__ == "__main__":
    if sys.argv[1] == "--registry":
        sys.exit(oracle_registry(os.path.abspath(sys.argv[2]), os.path.abspath(sys.argv[3])))  # B-2: every path the guard judges is absolute
    sys.exit(main(*(os.path.abspath(a) for a in sys.argv[1:4])))
