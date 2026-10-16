# claude-opus-5-5 - 2026-10-16 - the evaluation of the three wave 2b estimators, tools/kata-quarter/ (docs/G0-lot-cm5-c4a.md),
# Python 3.14 standard library only, no network; a sibling module of quarter_counts.py, no block __main__, reached by `estimate`. ADR 0006
# v8.1 D4: har-rv15-sp-v1, garch11-sf-sp-v1 and ewma-vol-sp-v1 evaluated at a decision instant t on their frozen fits, decimal strings
# that are the pinned object, each read once into binary64 (the GARCH window rule exact on them, as rationals); no optimizer: nothing is
# fitted here. The factor of a bar's key, f(start of the bar), and the weekend multiplier of t are given (the seasonal profile is not built here). Each
# log is kata_lib's math.log at the call, so the tool's two passes apply (report.setting: fdlibm_log decides, math.log listed); each sum
# an explicit loop from the oldest. estimate prints the values of the three on a series read under its pin, at the instants of a closed
# input read under the role registry; every refusal is named (Refused, exit 2, never a trace).
import fractions
import hashlib
import json
import math
import os
import re

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first
import kata_lib as K
import quarter_core as C
import quarter_identity as I
import quarter_load as Q
import report

MODEL = "claude-opus-5-5"
KATAS = ("har-rv15-sp-v1", "garch11-sf-sp-v1", "ewma-vol-sp-v1")  # in the order of their bullets in D4 (addendum 10)
FITS = {KATAS[0]: ("b0", "b1", "b2", "b3"), KATAS[1]: ("omega", "a", "b", "seed"), KATAS[2]: ()}  # the frozen strings of each
FORMS = ("candle", "rogers-satchell")  # ADR l.130: the candle form iff the dated candle-window version is merged first, a merge date
CAP = {"1h": 720, "4h": 180}  # ADR l.132: the GARCH window, capped at 30 days of bars
DECIMAL = re.compile("(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?")  # a non-negative JSON number, ASCII digits only (fullmatch)
DAY, WEEK = 86_400_000, 7 * 86_400_000  # the HAR's day and week: 24 and 168 bars at 1h, 6 and 42 at 4h; 672 candles
FORMAT = "kata-2b-estimate-input-v1"
INPUT = ("format", "horizon", "range", "form", "fits", "factors", "instants")  # closed, in this order
USAGE = "usage: python -E -S -s -B -P quarter_counts.py estimate <series dir> <symbol folder>:<series sha256> <input.json> <its sha256>"


def window(exact, horizon):
    """The GARCH window rule, exact on the frozen strings (ADR l.132-133): p = a + b as rationals; W the smallest integer from 1 with
    p^W <= 3/100, capped at CAP[horizon]. Returns W, whether the cap binds (the least such W is above it) and p^W rounded once to binary64,
    the residual seed weight. a + b >= 1 has no such W: a named refusal (the fit procedure keeps a + b below 1)."""
    p, target = exact["a"] + exact["b"], fractions.Fraction(3, 100)
    if p >= 1:
        raise Q.Refused(f"{KATAS[1]}: a + b = {float(p)!r} is not below 1: no window with p^W <= 0.03")
    w, pw = 1, p
    while not pw <= target and w < CAP[horizon]:
        w, pw = w + 1, pw * p
    return w, not pw <= target, float(pw)


def frozen(kata, fit, horizon):
    """The frozen fit of kata checked: an object with exactly the keys FITS[kata], each a string of the form DECIMAL with a finite value.
    Returns ({key: its binary64, rounded once}, the GARCH window or None); any other fit is a named refusal, nothing evaluated."""
    if kata not in FITS:
        raise Q.Refused(f"{kata!r}: not a wave 2b estimator, one of {list(KATAS)}")
    if type(fit) is not dict or sorted(fit) != sorted(FITS[kata]):
        raise Q.Refused(f"{kata}: a frozen fit holds exactly the strings {list(FITS[kata])}, not {sorted(fit) if type(fit) is dict else type(fit).__name__}")
    bad = sorted(k for k, v in fit.items() if type(v) is not str or not DECIMAL.fullmatch(v) or not math.isfinite(float(v)))
    if bad:
        raise Q.Refused(f"{kata}: {bad}: not frozen decimal strings, the form of a finite non-negative JSON number in ASCII digits")
    return {k: float(v) for k, v in fit.items()}, window({k: fractions.Fraction(v) for k, v in fit.items()}, horizon) if kata == KATAS[1] else None


def factor(f, start):
    """The given factor of the bar that starts at start: a finite binary64 above 0, else NE (as recalc_p2.sigma_hat for no factor)."""
    g = f(start)
    return g if type(g) is float and math.isfinite(g) and g > 0 else K.NE


def mean(xs):
    return K.fsum_loop(xs) / len(xs)


def har(fit, form, t, horizon, candles, bars, f):
    """sigma_fit_t of har-rv15-sp-v1 (ADR l.130, l.126): the root of ((b0 + b1 x_bar) + b2 x_day) + b3 x_week over the week of bars
    before t, each bar j deseasonalized x_j = RV_j / (f(j) f(j)); x_bar the last, x_day and x_week the means of the day's bars and the
    week's. RV_j: in the candle form, the sum of the squared log returns of its candles, each from the close of the candle before (673
    candles read); in the per-bar Rogers-Satchell form, ln(H/C) ln(H/O) + ln(L/C) ln(L/O) of the bar. NE when an input is absent."""
    if form not in FORMS:
        raise Q.Refused(f"{KATAS[0]}: the form {form!r} is not one of {list(FORMS)}: it is named with the fit, never chosen here")
    h, log = K.H_MS[horizon], K.math.log
    n, per = WEEK // h, h // K.STEP_MS
    if form == "candle":
        cs = [candles.get(t - (n * per - j) * K.STEP_MS) for j in range(-1, n * per)]  # oldest first; cs[0] the candle before the week
        if None in cs:
            return K.NE
        rvs = []
        for i in range(n):
            rv = 0.0
            for j in range(i * per + 1, (i + 1) * per + 1):
                r = log(cs[j][3] / cs[j - 1][3])
                rv = rv + r * r
            rvs.append(rv)
    else:
        win = K.window_at(bars, t, n, h)
        if win is None:
            return K.NE
        rvs = [log(b[K.B_HIGH] / b[K.B_CLOSE]) * log(b[K.B_HIGH] / b[K.B_OPEN]) + log(b[K.B_LOW] / b[K.B_CLOSE]) * log(b[K.B_LOW] / b[K.B_OPEN]) for b in win]
    gs = [factor(f, t - (n - i) * h) for i in range(n)]
    if K.NE in gs:
        return K.NE
    xs = [rv / (g * g) for rv, g in zip(rvs, gs)]
    b0, b1, b2, b3 = (fit[k] for k in FITS[KATAS[0]])
    s2 = ((b0 + b1 * xs[-1]) + b2 * mean(xs[-(DAY // h):])) + b3 * mean(xs)
    return K.scale(math.sqrt(s2)) if s2 > 0 else K.NE


def garch(fit, w, t, horizon, bars, f):
    """sigma_fit_t of garch11-sf-sp-v1 (ADR l.131, l.125): on the w one-bar log returns of the w + 1 bars that end at t, each
    deseasonalized by the factor of its own bar u, e_u = r_u / f(u): s2 = seed, then s2 = (omega + a e_u e_u) + b s2 from the oldest; the
    root of the last s2, the variance of [t, t + h). NE when a bar or a factor is absent."""
    h = K.H_MS[horizon]
    win = K.window_at(bars, t, w + 1, h)
    if win is None:
        return K.NE
    omega, a, b, s2 = (fit[k] for k in FITS[KATAS[1]])
    for u in range(1, w + 1):
        g = factor(f, win[u][K.B_START])
        if g == K.NE:
            return K.NE
        e = K.math.log(win[u][K.B_CLOSE] / win[u - 1][K.B_CLOSE]) / g
        s2 = (omega + a * (e * e)) + b * s2
    return K.scale(math.sqrt(s2)) if s2 > 0 else K.NE


def ewma(t, horizon, bars):
    """sigma_pre_t, the [K] D4 EWMA (ADR l.122, l.134): kata_lib's ewma-vol-hw-v1 on its 101 bars, looked up at the call, no factor."""
    win = K.window_at(bars, t, K.W["ewma-vol-hw-v1"], K.H_MS[horizon])
    return K.NE if win is None else K.KATA_FUNCS["ewma-vol-hw-v1"](win)


def sigma_hat(kata, fz, t, horizon, candles, bars, f, weekend, form=None):
    """Step 4 of the freeze order (ADR l.128): (sigma x f(t)) x weekend, sigma that of kata on its frozen fit fz (frozen()), f(t) the
    factor of the key of t; NE unless every factor is a finite binary64 above 0 and the result is finite and above 0."""
    fit, w = fz
    sigma = har(fit, form, t, horizon, candles, bars, f) if kata == KATAS[0] else garch(fit, w[0], t, horizon, bars, f) if kata == KATAS[1] else ewma(t, horizon, bars)
    g = factor(f, t)
    if K.NE in (sigma, g) or factor(lambda _: weekend, t) == K.NE:
        return K.NE
    return K.scale((sigma * g) * weekend)


def estimate(args, identity_line):
    """estimate: the three estimators at each instant of the input, under both passes of the log, printed; 0, or 2 on its usage."""
    if len(args) != 4 or not re.fullmatch("[a-z0-9]+:[0-9a-f]{64}", args[1]) or not re.fullmatch("[0-9a-f]{64}", args[3]):
        print(USAGE, flush=True)
        return 2
    io_guard.declare("series", "recorder", "registry", "tool-tree")
    ident = I.tool_identity()
    (sym, pin), data = args[1].split(":"), io_guard.read("registry", os.path.abspath(args[2]))
    if (got := hashlib.sha256(data).hexdigest()) != args[3]:
        raise Q.Refused(f"estimate input refused before parsing: sha256 {got} differs from the pinned {args[3]}")
    try:
        x = json.loads(data.decode("utf-8"), object_pairs_hook=lambda p: Q.unique(p, "estimate input"))
    except ValueError:
        raise Q.Refused("estimate input: not a JSON text") from None
    h = K.H_MS.get(x["horizon"]) if type(x) is dict and list(x) == list(INPUT) and type(x["horizon"]) is str else None  # keys first
    span = [Q.second(s) for s in x["range"]] if h and type(x["range"]) is list and len(x["range"]) == 2 else [None]
    given = ("factors", "instants")
    if not (h and x["format"] == FORMAT and None not in span and span[0] < span[1] and span[0] % h == span[1] % h == 0
            and type(x["fits"]) is dict and sorted(x["fits"]) == sorted(KATAS) and all(type(x[g]) is dict for g in given)
            and all(Q.second(s) is not None and type(v) is str and DECIMAL.fullmatch(v) for g in given for s, v in x[g].items())):
        raise Q.Refused(f"estimate input: not a {FORMAT} object, its keys {list(INPUT)} in order, a horizon, a range [start, end) on its grid, "
                        "the three fits, and factors and instants keyed by UTC seconds with decimal strings")
    factors, instants = ({Q.second(s): float(v) for s, v in sorted(x[g].items())} for g in given)
    if any(t % h for t in instants):
        raise Q.Refused(f"estimate input: an instant off the grid of {x['horizon']}")
    fits, read = {k: frozen(k, x["fits"][k], x["horizon"]) for k in KATAS}, Q.read_series(os.path.abspath(args[0]), sym, pin, *span)
    memo, passes = {}, {}
    with C.posed(span[0], span[1], K.BLOCKS):  # kata_lib's bars and windows over the input's range, restored after
        bars = K.build_bars(read["candles"], h)
        for name in ("ln", "base"):
            with report.setting(name, memo):
                passes[name] = {t: [sigma_hat(k, fits[k], t, x["horizon"], read["candles"], bars, factors.get, wk, x["form"]) for k in KATAS] for t, wk in instants.items()}
    out = lambda v: v if v == K.NE else K.js_number(v)  # noqa: E731 (a double as JavaScript writes it, its bits given back)
    differ = [f"{Q.iso(t)} {k}: fdlibm_log {out(a)}, math.log {out(b)}" for t in instants for k, a, b in zip(KATAS, passes["ln"][t], passes["base"][t]) if a != b]
    w, capped, weight = fits[KATAS[1]][1]
    res = {"horizon": x["horizon"], "form": x["form"], "garch_window": {"W": w, "capped": capped, "seed_weight": K.js_number(weight)},
           "values": {Q.iso(t): dict(zip(KATAS, map(out, vs))) for t, vs in passes["ln"].items()}}
    print("\n".join([MODEL, "# quarter_counts.py estimate - the three wave 2b estimators on their frozen fits, at the instants given",
                     json.dumps(res, sort_keys=True, separators=(",", ":")), *(f"value differs {d}" for d in differ),
                     f"math.log values that differ from the fdlibm_log pass, which decides: {len(differ)}", identity_line(ident),
                     *io_guard.input_lines(), "VERDICT: GREEN"]), flush=True)
    return 0
