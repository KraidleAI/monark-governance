# claude-opus-5-5 - 2026-10-16 - the evaluation of the three wave 2b estimators, tools/kata-quarter/ (docs/G0-lot-cm5-c4a.md, c4b.md),
# Python 3.14 standard library only, no network; a sibling module of quarter_counts.py, no block __main__, reached by `estimate` and the act
# L-O4. ADR 0006 v8.1 D4: har-rv15-sp-v1, garch11-sf-sp-v1 and ewma-vol-sp-v1 evaluated at a decision instant t on their frozen fits, decimal
# strings that are the pinned object, each read once into binary64 (the GARCH window rule exact on them, as rationals); no optimizer. The
# factor of a bar's key, f(start of the bar), and the weekend multiplier of t come from a profile under the US DST table (c4b, at the end). Each
# log is kata_lib's math.log at the call, so the tool's two passes apply (report.setting: fdlibm_log decides, math.log listed); each sum
# an explicit loop from the oldest. estimate prints the values of the three on a series read under its pin, at the instants of a closed
# input read under the role registry; wave3_rows reads the closed wave 2b registry wave3.json; every refusal is named (Refused, exit 2).
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
import quarter_load as Q, quarter_wave2 as W  # the core reader: its shapes and its checks of the veto blocks (lot c4b)
import recalc_p2, report  # recalc_p2: the venue of a cell, read by the wave 2b reader (lot c4b)

MODEL = "claude-opus-5-5"
KATAS = ("har-rv15-sp-v1", "garch11-sf-sp-v1", "ewma-vol-sp-v1")  # in the order of their bullets in D4 (addendum 10)
FITS = {KATAS[0]: ("b0", "b1", "b2", "b3"), KATAS[1]: ("omega", "a", "b", "seed"), KATAS[2]: ()}  # the frozen strings of each
FORMS = ("candle", "rogers-satchell")  # ADR l.130: the candle form iff the dated candle-window version is merged first, a merge date
CAP = {"1h": 720, "4h": 180}  # ADR l.132: the GARCH window, capped at 30 days of bars
DECIMAL = re.compile("(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?")  # a non-negative JSON number, ASCII digits only (fullmatch)
DAY, WEEK = 86_400_000, 7 * 86_400_000  # the HAR's day and week: 24 and 168 bars at 1h, 6 and 42 at 4h; 672 candles
FORMAT = "kata-2b-estimate-input-v2"
INPUT = ("format", "horizon", "range", "form", "fits", "profile", "instants")  # closed, in this order (c4b: the profile, not given factors)
USAGE = "usage: python -E -S -s -B -P quarter_counts.py estimate <series dir> <symbol folder>:<series sha256> <input.json> <its sha256>"


def window(exact, horizon):
    """The GARCH window rule, exact on the frozen strings (ADR l.132-133): p = a + b as rationals; W bars, the smallest integer from 1 with
    p^W <= 3/100, capped at CAP[horizon]. Returns W, whether the cap binds (the least such W is above it) and p^(W-1), the residual seed
    weight of the W - 1 steps of garch(), rounded once to binary64. a + b >= 1 has no such W: a named refusal (the fit keeps a + b below 1)."""
    p, target = exact["a"] + exact["b"], fractions.Fraction(3, 100)
    if p >= 1:
        raise Q.Refused(f"{KATAS[1]}: a + b = {float(p)!r} is not below 1: no window with p^W <= 0.03")
    w, pw = 1, p
    while not pw <= target and w < CAP[horizon]:
        w, pw = w + 1, pw * p
    return w, not pw <= target, float(pw / p) if w > 1 else 1.0  # p^(W-1), exact; p^0 at W = 1, where p may be 0


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
    """sigma_fit_t of garch11-sf-sp-v1 (ADR l.131, l.125; W counts bars, ADR 0005 D4): on the w - 1 one-bar log returns of the w bars that
    end at t, each deseasonalized by the factor of its own bar u, e_u = r_u / f(u): s2 = seed, then s2 = (omega + a e_u e_u) + b s2 from the
    oldest (w = 1: no return, s2 = seed); the root of the last s2, the variance of [t, t + h). NE when a bar or a factor is absent."""
    h = K.H_MS[horizon]
    win = K.window_at(bars, t, w, h)
    if win is None:
        return K.NE
    omega, a, b, s2 = (fit[k] for k in FITS[KATAS[1]])
    for u in range(1, w):
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
    ts = [Q.second(s) for s in x["instants"]] if h and type(x["instants"]) is list else [None]  # UTC seconds, each once
    if not (h and x["format"] == FORMAT and None not in span and span[0] < span[1] and span[0] % h == span[1] % h == 0
            and type(x["fits"]) is dict and sorted(x["fits"]) == sorted(KATAS)
            and None not in ts and len(set(ts)) == len(ts)):
        raise Q.Refused(f"estimate input: not a {FORMAT} object, its keys {list(INPUT)} in order, a horizon, a range [start, end) on its grid, "
                        "the three fits, a profile, and its instants in UTC seconds, each once")
    (f, wk), instants = profile(x["profile"], x["horizon"], "estimate input"), sorted(ts)  # f and weekend from the profile (c4b)
    if any(t % h for t in instants):
        raise Q.Refused(f"estimate input: an instant off the grid of {x['horizon']}")
    fits, read = {k: frozen(k, x["fits"][k], x["horizon"]) for k in KATAS}, Q.read_series(os.path.abspath(args[0]), sym, pin, *span)
    memo, passes = {}, {}
    with C.posed(span[0], span[1], K.BLOCKS):  # kata_lib's bars and windows over the input's range, restored after
        bars = K.build_bars(read["candles"], h)
        for name in ("ln", "base"):
            with report.setting(name, memo):
                passes[name] = {t: [sigma_hat(k, fits[k], t, x["horizon"], read["candles"], bars, f, wk(t), x["form"]) for k in KATAS] for t in instants}
    out = lambda v: v if v == K.NE else K.js_number(v)  # noqa: E731 (a double as JavaScript writes it, its bits given back)
    differ = [f"{Q.iso(t)} {k}: fdlibm_log {out(a)}, math.log {out(b)}" for t in instants for k, a, b in zip(KATAS, passes["ln"][t], passes["base"][t]) if a != b]
    w, capped, weight = fits[KATAS[1]][1]
    res = {"horizon": x["horizon"], "form": x["form"], "garch_window": {"W": w, "capped": capped, "seed_weight": K.js_number(weight)},
           "values": {Q.iso(t): dict(zip(KATAS, map(out, vs))) for t, vs in passes["ln"].items()}}
    print("\n".join([MODEL, "# quarter_counts.py estimate - the three wave 2b estimators on their frozen fits, at the instants given; seed_weight is p^(W-1)",
                     json.dumps(res, sort_keys=True, separators=(",", ":")), *(f"value differs {d}" for d in differ),
                     f"math.log values that differ from the fdlibm_log pass, which decides: {len(differ)}", identity_line(ident),
                     *io_guard.input_lines(), "VERDICT: GREEN"]), flush=True)
    return 0


# The profile under the US DST table, the closed reader of the wave 2b registry wave3.json (kata/registry/FORMAT-wave2b.md of RECHERCHES,
# frozen at 23a7060, cited l.N) and its rows in the count (lot c4b, docs/G0-lot-cm5-c4b.md).
SWITCHES = (("2022-11-06T06:00:00Z", False), ("2023-03-12T07:00:00Z", True), ("2023-11-05T06:00:00Z", False), ("2024-03-10T07:00:00Z", True),
            ("2024-11-03T06:00:00Z", False), ("2025-03-09T07:00:00Z", True), ("2025-11-02T06:00:00Z", False), ("2026-03-08T07:00:00Z", True),
            ("2026-11-01T06:00:00Z", False))  # usDst, l.34 (ADR l.129), in order: (at, summer), summer time begins at at iff summer
SWITCH_MS, DOMAIN = tuple((Q.second(a), s) for a, s in SWITCHES), (Q.second("2022-03-13T07:00:00Z"), Q.second("2027-03-14T07:00:00Z"))  # l.36
USDST = {"switches": [{"at": a, "summer": s} for a, s in SWITCHES]}
READS = {"bridge": K.utc_ms(2025, 9, 1), "test": K.utc_ms(2023, 9, 1), "fwd": K.utc_ms(2024, 3, 1)}  # READS[block].start, kata/w2c/blocks.ts:25-30
DELTA = {"1h": "0.025", "4h": "0.05"}  # testDelta, the base of its horizon (l.69)
ROW = ("taskClass", "key", "kataId", "W", "venue", "symbol", "horizon", "side", "bucket", "thresholds", "wavePart", "profile", "profileSha256", "fit",
       "fitSha256", "alpha", "testDelta", "calibAttempt", "tailFrac", "auxSeq", "order", "calibSupport", "seriesSha256", "epoch", "drops",
       "nonEvaluable", "calib", "bridge", "test", "fwd", "status", "vetoedBy", "trialId")  # l.55-81, in this order
SHAPES = {**W.SHAPES, "": ("plan", "engine", "trialRegistryHead", "usDst", "rows"), "row": ROW, "usDst": ("switches",), "switch": ("at", "summer"),
          "profile": ("values", "weekend"), "fit": ("form", "strings"), "nonEvaluable": W.SHAPES["drops"]}  # calib and the blocks: FORMAT-wave2's
LISTS = {"rows": "row", "switches": "switch", "values": "value", "weekend": "value"}


def summer(t):
    """US summer time at t by the table (l.36): that of the last switch at or before t, in force before the first; None off its domain."""
    return next((s for a, s in reversed(SWITCH_MS) if a <= t), True) if DOMAIN[0] <= t < DOMAIN[1] else None


def key(t, horizon):
    """The index of the profile key of the instant t (l.95-97): at 1h the US Eastern hour of day, at 4h 6 s + j, j the UTC 4-hour slot and
    s 1 under summer time; None off the table's domain (l.170: no key, so not evaluable)."""
    s, hour = summer(t), t // 3_600_000 % 24
    return None if s is None else (hour - (4 if s else 5)) % 24 if horizon == "1h" else 6 * s + hour // 4


def fdec(v):
    """A frozen decimal string (l.51): of the form DECIMAL, finite, and written as JavaScript writes its binary64."""
    return type(v) is str and DECIMAL.fullmatch(v) is not None and math.isfinite(x := float(v)) and K.js_number(x) == v


def profile(p, horizon, what):
    """The profile {values, weekend} of a symbol and horizon (l.95-98): 24 values at 1h or 12 at 4h and two weekend multipliers, each an
    fdec above 0. Returns f, the factor of the key of an instant (the bar [s, s + h) has that of s), None off the table's domain, and
    weekend(t): the first multiplier when t's UTC day is a Saturday or a Sunday, else the second. Any other profile is a named refusal."""
    n = 24 if horizon == "1h" else 12
    if not (type(p) is dict and list(p) == ["values", "weekend"] and all(type(x) is list for x in p.values()) and len(p["values"]) == n
            and len(p["weekend"]) == 2 and all(fdec(v) and float(v) > 0 for v in p["values"] + p["weekend"])):
        raise Q.Refused(f"{what}: not {{values, weekend}} with {n} values at {horizon} and 2 weekend multipliers, each a frozen decimal string "
                        "of a value above 0 written as JavaScript writes it")
    vs, (weekend, other), memo = [float(v) for v in p["values"]], [float(v) for v in p["weekend"]], {}

    def f(s):
        if s not in memo:
            memo[s] = None if (k := key(s, horizon)) is None else vs[k]
        return memo[s]
    return f, lambda t: weekend if (t // 86_400_000 + 3) % 7 >= 5 else other  # epoch day 0 is a Thursday: 5 and 6 are Saturday and Sunday


def closed(v, name, where):
    """wave3.json closed, as quarter_wave2.closed: every object the keys of its table in the format's order (months YYYY-MM ascending,
    fit.strings the keys that frozen() holds, in the order row() holds); every array the rows, the switches or a profile's strings; else a
    scalar, or null where the format admits it."""
    if name in LISTS:
        if type(v) is not list:
            raise Q.Refused(f"wave3.json: {where}: a {type(v).__name__}, not an array")
        for i, x in enumerate(v):
            closed(x, LISTS[name], f"{where}[{i}]")
    elif name in SHAPES or name in ("months", "strings"):
        keys = (sorted(v) if name == "months" else list(v)) if type(v) is dict and name in ("months", "strings") else SHAPES.get(name)
        if not (v is None and name in W.NULLABLE) and (type(v) is not dict or list(v) != list(keys)):
            raise Q.Refused(f"wave3.json: {where or 'the top level'}: {list(v) if type(v) is dict else type(v).__name__}, not the keys of its "
                            f"table in the format's order {list(keys or [])}")
        for k, x in (v or {}).items():
            closed(x, "month" if name == "months" else "count" if name in ("drops", "nonEvaluable") else "value" if name == "strings" else k,
                   f"{where}.{k}" if where else k)
    elif type(v) in (dict, list):
        raise Q.Refused(f"wave3.json: {where}: an object or an array where the format writes a value")


def wave3(path, pin):
    """wave3.json read under the role registry, refused before parsing unless its sha256 is the pin; then its byte form (l.16; FORMAT-wave2
    l.12-15), closed, and its usDst the table of the format byte for byte (l.177)."""
    data = io_guard.read("registry", path)
    if (got := hashlib.sha256(data).hexdigest()) != pin:
        raise Q.Refused(f"wave 2b registry refused before parsing: sha256 {got} differs from the pinned {pin}")
    try:
        text = data.decode("utf-8")
        doc = json.loads(text, object_pairs_hook=lambda p: Q.unique(p, "wave3.json"))
        form = "\u2028" not in text and "\u2029" not in text and text == K.js_json_pretty(doc) + "\n"
    except ValueError:  # not UTF-8, not JSON, or an integer that JavaScript does not write
        form = False
    if not form:
        raise Q.Refused("wave3.json: not its byte form, JSON.stringify(registry, null, 1) and one line feed (UTF-8, LF only, no U+2028 or U+2029)")
    closed(doc, "", "")
    if K.js_json_compact(doc["usDst"]) != K.js_json_compact(USDST):
        raise Q.Refused("wave3.json: usDst is not the table of the format, byte for byte (FORMAT-wave2b l.32-36)")
    return doc


def row(r):
    """One wave 2b row held to the reader checks that the count reads (l.172-185): (row, its cell for quarter_core.count, with its sigma_hat
    and its lookback, its symbol folder), or a named refusal."""
    h, kid, tc, c, fit = r["horizon"], r["kataId"], str(r["taskClass"]), r["calib"], r["fit"]
    where, s = f"wave 2b row {r['taskClass']} {r['key']}", str(r["symbol"]).removesuffix("USDT").lower()
    if h not in CAP or kid not in KATAS:
        raise Q.Refused(f"{where}: not a horizon of {list(CAP)} and an estimator of {list(KATAS)}")
    try:
        fz, (f, wk) = frozen(kid, fit["strings"], h), profile(r["profile"], h, "its profile")
    except Q.Refused as e:
        raise Q.Refused(f"{where}: {e}") from None
    fam, w, fired = tc.removeprefix(f"{s}-").removesuffix(f"-{h}"), {KATAS[0]: WEEK // K.H_MS[h], KATAS[2]: K.W["ewma-vol-hw-v1"]}.get(kid) or fz[1][0], \
        [b for b in W.BLOCKS if r[b]["vetoed"] is True]
    wrong = [what for what, ok in (
        ("a cell of its estimator, its key and trial id recomposed", fam in ("range", "mae-down", "mae-up") and tc == f"{s}-{fam}-{h}" and str(r["symbol"]).endswith("USDT")
         and r["venue"] == recalc_p2.VENUE and (r["side"], r["bucket"], r["thresholds"]) == (None, "b0", None) and r["key"] == f"kata:{kid}@{r['venue']}/{r['symbol']}/{h}/b0"
         and r["trialId"] == f"{tc}|{kid}|{r['venue']}|{r['symbol']}|{h}|W2-CALIB"),
        ("wavePart 2b, calibAttempt 1, alpha 0.01 and the testDelta of its horizon", r["wavePart"] == "2b" and type(r["calibAttempt"]) is int
         and r["calibAttempt"] == 1 and r["alpha"] == "0.01" and r["testDelta"] == DELTA[h]),
        ("W the window of its estimator", W.safe(r["W"]) and r["W"] == w),
        ("fit.form a HAR form on har-rv15-sp-v1, null on the others", fit["form"] in FORMS if kid == KATAS[0] else fit["form"] is None),
        ("frozen strings in the format's order, written as JavaScript writes them, a seed above 0", all(fdec(v) for v in fit["strings"].values()) and fz[0].get("seed", 1) > 0 and list(fit["strings"]) == list(FITS[kid])),
        ("fitSha256 and profileSha256 the digests of fit and profile", r["fitSha256"] == hashlib.sha256(report.canonical(fit).encode("ascii")).hexdigest()
         and r["profileSha256"] == K.seq_sha256([float(v) for v in r["profile"]["values"] + r["profile"]["weekend"]])),
        ("a qhat, a finite number, iff calibrated", c["status"] in ("under_calib", "silence", "region") and (c["qhat"] is None) == (c["status"] == "under_calib")
         and (c["qhat"] is None or type(c["qhat"]) in (int, float) and math.isfinite(c["qhat"]))),
        ("its status and vetoedBy by the order of its blocks", all(type(r[b]["vetoed"]) is bool for b in W.BLOCKS) and (not fired or c["status"] == "region")
         and r["status"] == ("vetoed" if fired else c["status"]) and r["vetoedBy"] == (fired[0] if fired else None)),
        ("blocks whose months are of the block and sum to nTest and kTest", all(W.months_ok(r[b], b, c["qhat"]) for b in W.BLOCKS))) if not ok]
    if wrong:
        raise Q.Refused(f"{where}: not {'; not '.join(wrong)}")
    look = 673 * K.STEP_MS if kid == KATAS[0] and fit["form"] == "candle" else w * K.H_MS[h]  # its longest window: 673 candles, or W bars
    sigma = lambda t, candles, bars: sigma_hat(kid, fz, t, h, candles, bars, f, wk(t), fit["form"])  # noqa: E731 (its sigma_hat at t)
    return r, {"kind": "range" if fam == "range" else "path", "side": None if fam == "range" else fam[4:], "kata": kid, "look": look, "sigma": sigma}, s


def wave3_rows(path, pin):
    """The rows of wave3.json in its order, each held by row(), then across rows (l.180, l.182): each cell once, one W, fit and fitSha256 on
    the rows of a key, one profile and profileSha256 on those of a symbol and horizon, one form on every har-rv15-sp-v1 row."""
    out = [row(r) for r in wave3(path, pin)["rows"]]

    def one(by, what):  # each group of rows by by carries one value of what
        seen = {}
        for r, _, _ in out:
            seen.setdefault(by(r), set()).add(K.js_json_compact(what(r)))
        return all(len(v) == 1 for v in seen.values())
    wrong = [what for what, ok in (
        ("each cell (taskClass, key) once", len({(r["taskClass"], r["key"]) for r, _, _ in out}) == len(out)),
        ("one W, fit and fitSha256 on the rows of a key", one(lambda r: r["key"], lambda r: [r["W"], r["fit"], r["fitSha256"]])),
        ("one profile and profileSha256 on the rows of a symbol and horizon", one(lambda r: (r["symbol"], r["horizon"]), lambda r: [r["profile"], r["profileSha256"]])),
        ("one form on the rows of har-rv15-sp-v1", one(lambda r: r["kataId"] == KATAS[0], lambda r: r["fit"]["form"]))) if not ok]
    if wrong:
        raise Q.Refused(f"wave3.json: not {'; not '.join(wrong)}")
    return out
