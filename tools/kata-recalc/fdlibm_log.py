# claude-opus-5-5 - 2026-10-07 - lot 1e of VERIFIERS-LIST-F5A-1 (M-11, Q-6 of G0 section 10), Python 3.14 standard library only.
# The natural logarithm of the generator's runtime, ported to Python so that report.py can class a one-ulp difference without
# running Node (Q-6: no V8 pass in the tool). Source read on 2026-10-07 between 02:06 and 02:16 UTC: deps/v8/src/base/ieee754.cc of
# Node v24.21.0 (sha256 1bf999809d4c4c1d31ad5ff3578d32614796f159e08b9e7782560d017721a0c2), double log(double x), l.1638-1717, word
# macros l.54-95. Math.log reaches it in every tier: builtins/math.tq l.302-309 (Float64Log), instruction-selector.cc l.1649-1650 and
# code-generator-x64.cc l.1073-1077, l.1930-1931 (a call of ieee754_log_function), external-reference.cc l.1210-1211
# (base::ieee754::log), maglev-ir.h l.3421 and maglev-ir.cc l.502-510, constant folding in machine-operator-reducer.cc l.803-806.
# Each operation below is the C one, in the same order: binary64, round to nearest even, no fused multiply-add. Held to the
# outputs of Node's own Math.log (VECTORS below), never to a correctly rounded logarithm: the error of this algorithm is below one
# ulp (l.1628-1630), not zero. The notices that the licences of that source ask to keep, verbatim. fdlibm's (ieee754.cc l.3-10):
#   ====================================================
#   Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
#
#   Developed at SunSoft, a Sun Microsystems, Inc. business.
#   Permission to use, copy, modify, and distribute this
#   software is freely granted, provided that this notice
#   is preserved.
#   ====================================================
# V8's (ieee754.cc l.12-14):
#   The original source code covered by the above license above has been
#   modified significantly by Google Inc.
#   Copyright 2016 the V8 project authors. All rights reserved.
# The licence of V8, in full (deps/v8/LICENSE.v8 of Node v24.21.0, 26 lines, sha256
# 4af93c12062c58058378de2397dc1c92bbff9ddfb1d583a01c84127557ce97ca):
#   Copyright 2006-2011, the V8 project authors. All rights reserved.
#   Redistribution and use in source and binary forms, with or without
#   modification, are permitted provided that the following conditions are
#   met:
#
#       * Redistributions of source code must retain the above copyright
#         notice, this list of conditions and the following disclaimer.
#       * Redistributions in binary form must reproduce the above
#         copyright notice, this list of conditions and the following
#         disclaimer in the documentation and/or other materials provided
#         with the distribution.
#       * Neither the name of Google Inc. nor the names of its
#         contributors may be used to endorse or promote products derived
#         from this software without specific prior written permission.
#
#   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
#   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
#   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
#   A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
#   OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
#   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
#   LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
#   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
#   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
#   OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
import hashlib
import struct

LN2_HI = 6.93147180369123816490e-01  # 3fe62e42 fee00000
LN2_LO = 1.90821492927058770002e-10  # 3dea39ef 35793c76
TWO54 = 1.80143985094819840000e+16  # 43500000 00000000
LG1 = 6.666666666666735130e-01  # 3FE55555 55555593
LG2 = 3.999999999940941908e-01  # 3FD99999 9997FA04
LG3 = 2.857142874366239149e-01  # 3FD24924 94229359
LG4 = 2.222219843214978396e-01  # 3FCC71C5 1D8E78AF
LG5 = 1.818357216161805012e-01  # 3FC74664 96CB03DE
LG6 = 1.531383769920937332e-01  # 3FC39A09 D078C69F
LG7 = 1.479819860511658591e-01  # 3FC2F112 DF3E5244
CONSTANTS_HEX = ("3fe62e42fee00000", "3dea39ef35793c76", "4350000000000000", "3fe5555555555593", "3fd999999997fa04",
                 "3fd2492494229359", "3fcc71c51d8e78af", "3fc7466496cb03de", "3fc39a09d078c69f", "3fc2f112df3e5244")
SIGNALING_NAN = 0x7FF0000000000001  # Math.log(-1) of Node v24.21.0 on Windows x64 (measured); the C++ library sets these bits


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def _double(b):
    return struct.unpack("<d", struct.pack("<Q", b))[0]


def log(x):
    """l.1638-1717, line by line; the words of the C int32_t are Python ints in the same range."""
    hx = bits(x) >> 32
    if hx >= 0x80000000:
        hx -= 1 << 32  # EXTRACT_WORDS into an int32_t (l.54-59, l.1657)
    lx = bits(x) & 0xFFFFFFFF
    k = 0
    if hx < 0x00100000:  # x < 2**-1022
        if ((hx & 0x7FFFFFFF) | lx) == 0:
            return float("-inf")  # log(+-0) = -inf
        if hx < 0:
            return _double(SIGNALING_NAN)  # log(-#) = NaN: l.1665, std::numeric_limits<double>::signaling_NaN()
        k -= 54
        x *= TWO54  # subnormal number, scale up x
        hx = bits(x) >> 32
    if hx >= 0x7FF00000:
        return x + x
    k += (hx >> 20) - 1023
    hx &= 0x000FFFFF
    i = (hx + 0x95F64) & 0x100000
    x = _double((bits(x) & 0xFFFFFFFF) | ((hx | (i ^ 0x3FF00000)) << 32))  # SET_HIGH_WORD (l.89-95): normalize x or x/2
    k += i >> 20
    f = x - 1.0
    if (0x000FFFFF & (2 + hx)) < 3:  # -2**-20 <= f < 2**-20
        if f == 0.0:
            if k == 0:
                return 0.0
            dk = float(k)
            return dk * LN2_HI + dk * LN2_LO
        r = f * f * (0.5 - 0.33333333333333333 * f)
        if k == 0:
            return f - r
        dk = float(k)
        return dk * LN2_HI - ((r - dk * LN2_LO) - f)
    s = f / (2.0 + f)
    dk = float(k)
    z = s * s
    i = hx - 0x6147A
    w = z * z
    j = 0x6B851 - hx
    t1 = w * (LG2 + w * (LG4 + w * LG6))
    t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7)))
    i |= j
    r = t2 + t1
    if i > 0:
        hfsq = 0.5 * f * f
        if k == 0:
            return f - (hfsq - s * (hfsq + r))
        return dk * LN2_HI - ((hfsq - (s * (hfsq + r) + dk * LN2_LO)) - f)
    if k == 0:
        return f - s * (f - r)
    return dk * LN2_HI - ((s * (f - r) - dk * LN2_LO) - f)


# ---------------------------------------------------------------- vectors: the outputs of Node's Math.log on fixed inputs

def _splitmix(seed):
    """splitmix64, written here so that the inputs never depend on the random module of a Python version."""
    m = (1 << 64) - 1
    s = [seed & m]

    def nxt():
        s[0] = (s[0] + 0x9E3779B97F4A7C15) & m
        z = s[0]
        z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & m
        z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & m
        return z ^ (z >> 31)
    return nxt


def vector_inputs():
    """The inputs of the measure, positive and finite, in a fixed order: ratios in [0.95, 1.05]; ratios of consecutive prices
    written with 2, 1 or 8 decimals, as the series write them; doubles of every exponent; powers of two and the neighbours of 1;
    the edges of the branches of log (high words near 0x6147A, 0x6B851, 0x95F64, 0x6A09E and the ends of the mantissa)."""
    nxt = _splitmix(20261007)
    out = [0.95 + 0.1 * ((nxt() >> 11) * 2.0 ** -53) for _ in range(1_000_000)]
    for start, scale, n in ((6_000_000, 100, 200_000), (300_000, 100, 200_000), (5_000, 10, 200_000), (10_000, 100, 200_000),
                            (500_000, 100_000_000, 100_000)):
        p = start
        for _ in range(n):
            q = max(1, p + (p * ((nxt() >> 40) - (1 << 23))) // (100 << 23))
            out.append((q / scale) / (p / scale))
            p = q
    for _ in range(200_000):
        x = _double(nxt() >> 1)
        if 0 < x < float("inf"):
            out.append(x)
    out += [_double(e << 52) for e in range(1, 2047)] + [_double(1), _double(0xFFFFFFFFFFFFF)]
    x = y = 1.0
    for _ in range(3000):
        x = _double(bits(x) + 1)
        y = _double(bits(y) - 1)
        out += [x, y]
    for e in range(1, 2047, 7):
        for hx in (0, 1, 2, 0x6147A, 0x6A09E, 0x6A09F, 0x6B851, 0x95F64, 0xFFFFE, 0xFFFFF):
            for d in (-2, -1, 0, 1, 2):
                out.append(_double((e << 52) | (((hx + d) & 0xFFFFF) << 32) | (nxt() >> 32)))
    return out


# Measured on 2026-10-07 at 02:35 UTC (lot 1e, Windows 10 x64): the float64 little-endian bytes of vector_inputs(), their sha256, and
# the sha256 of the bytes of Math.log of Node v24.21.0 on each of them; on 5 780 inputs that Math.log and the log of the C library of
# Python 3.14.5 on that host (ucrtbase.dll 10.0.19041.3636) differ by one ulp. PINNED: the first twelve of them (input, Node's output).
# SPECIALS: the edge cases of l.1660-1671, Node's outputs (bits).
VECTORS = {"count": 2122614, "inputs_sha256": "41a801ce8cbcf2f88c008d8a91699b98c33515f46cc7a22621473f3c334803c8",
           "outputs_sha256": "aee206b3260bd9aba66f0faa01bc1002f321f3e1b64d28aa02967515910b116c", "differ_from_host_libm": 5780,
           "host_libm_sha256": "3c60056371f82e4744185b6f2fa0c69042b1e78804685944132974dd13f3b6d9"}  # that ucrtbase.dll, 1 046 080 bytes
PINNED = (("3ff07aecd264cbf4", "3f9e4776cca0b3fb"), ("3ff0c1cdc49a9ef9", "3fa7ab78ee7a68c6"), ("3ff0719f4512f062", "3f9c04c90f083dc3"),
          ("3feec167e6e230e1", "bfa44f46d9e29466"), ("3ff094fc0768b133", "3fa24ad883e22cf3"), ("3fef87f18edb54aa", "bf8e3c7837ce37ef"),
          ("3fef564dcb004406", "bf956f4efe49e8a8"), ("3ff065e25fcf76f3", "3f9928d11d86ec5f"), ("3ff0b80ce51b38a3", "3fa6811fd60dc10e"),
          ("3ff01b517c451f29", "3f7b3a445de54dd5"), ("3fef87c0204602b8", "bf8e4902f4c031b5"), ("3fee8ebbb23713b7", "bfa79d92b5f00801"))
SPECIALS = (("0000000000000000", "fff0000000000000"), ("8000000000000000", "fff0000000000000"), ("7ff0000000000000", "7ff0000000000000"),
            ("fff0000000000000", "7ff0000000000001"), ("bff0000000000000", "7ff0000000000001"), ("7ff8000000000000", "7ff8000000000000"),
            ("3ff0000000000000", "0000000000000000"), ("4000000000000000", "3fe62e42fefa39ef"), ("0000000000000001", "c0874385446d71c3"),
            ("7fefffffffffffff", "40862e42fefa39ef"))


def held_to_vectors(host_log=None):
    """(checks, failures, names of the failures, differing): the constants against their hex, PINNED and SPECIALS bit for bit, and the
    outputs of every input of vector_inputs() against the measured digests (about 6 s); differing, when host_log is given, counts the
    inputs on which host_log and the port differ: a fingerprint of the log that runs, 5 780 for the C library of the measure."""
    fails = [f"constant {h}" for v, h in zip((LN2_HI, LN2_LO, TWO54, LG1, LG2, LG3, LG4, LG5, LG6, LG7), CONSTANTS_HEX) if f"{bits(v):016x}" != h]
    fails += [f"vector {i}" for i, o in PINNED + SPECIALS if f"{bits(log(_double(int(i, 16)))):016x}" != o]
    xs = vector_inputs()
    if len(xs) != VECTORS["count"] or hashlib.sha256(b"".join(struct.pack("<d", x) for x in xs)).hexdigest() != VECTORS["inputs_sha256"]:
        fails.append("inputs of the measure")
    outs = [log(x) for x in xs]
    if hashlib.sha256(b"".join(struct.pack("<d", y) for y in outs)).hexdigest() != VECTORS["outputs_sha256"]:
        fails.append("outputs of the measure")
    differing = None if host_log is None else sum(1 for x, y in zip(xs, outs) if bits(host_log(x)) != bits(y))
    return len(CONSTANTS_HEX) + len(PINNED) + len(SPECIALS) + 2, len(fails), fails, differing
