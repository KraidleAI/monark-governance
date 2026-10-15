# claude-opus-5-5 - 2026-10-15 - the loader of the quarter counts tool, tools/kata-quarter/ (CM-5), Python 3.14 standard library only, no
# network; a sibling module of quarter_counts.py, no block __main__. It reads through io_guard.read (roles series and recorder) and through
# recalc_p2.load_series of the frozen tool, imported, never copied (D-3: the bytes refused before parsing unless their sha256 is the pin).
# Read 1, the sealed series: for quarter 1 the series of wave 1 under its recording range (kata_lib.REC_START to REC_END, ending at S_1)
# and the pin of recalc_p2.SYMBOLS (sealed_pin); later, the previous quarter's record under its range and posted pin. Read 2, the LIVE
# series under [S_k, E_k) and its posted pin. The ranges meet at S_k by construction, and load_series refuses a candle outside its range
# (recalc_p2.py l.111-112): no instant is in both reads, with no check of its own here. The merge: every grid slot from S_k minus the
# lookback (the caller's) to E_k is present or listed in the missing.json of the read that owns it; an undeclared gap is a named refusal
# (Refused, exit 2), a declared gap stays a gap (the count decides its drop later). missing.json is held to its form: a whole count, whole
# open_time_ms values (never a bool, a float or a string) written again by their open_time_utc, none off the grid, outside the read's
# range or present in the series. Truncated candles: not yet (load_series stops on any irregular close time). The served history
# (kata-served-history-v1, scripts/served-history.mjs): read whole under the role served-history, held by class (served_history).
import datetime
import hashlib
import json, re  # re: the forms of the served history's fields, those of its writer

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first (never found by name here)
import kata_lib as K
import recalc_p2, report as R  # report.canonical: the writer's canonical writing of a line

FIRST = (2026, 10)  # S_1 = 2026-10-01T00:00Z; S_k is 3(k - 1) calendar months after it, E_k is S_k plus 3 calendar months


class Refused(Exception):
    """A named refusal of the loader: the entry prints it and exits 2."""


def whole(v):
    """A whole number as JSON writes one: an int, never a bool (True is an int in Python), a float or a string."""
    return type(v) is int


def iso(ms):
    return datetime.datetime.fromtimestamp(ms // 1000, datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _first_of(months):
    """The first day, 00:00Z, of the calendar month `months` after the month of S_1, in ms."""
    y, m = divmod(FIRST[0] * 12 + FIRST[1] - 1 + months, 12)
    return K.utc_ms(y, m + 1, 1)


def quarter(k):
    """Q_k = [S_k, E_k) in ms."""
    if not isinstance(k, int) or isinstance(k, bool) or k < 1:
        raise Refused(f"quarter: k is a whole number from 1, not {k!r}")
    return _first_of(3 * (k - 1)), _first_of(3 * k)


def sealed_range(k):
    """The range of read 1: the recording range of the sealed series of wave 1 for quarter 1, else the previous quarter."""
    return (K.REC_START, K.REC_END) if k == 1 else quarter(k - 1)


def sealed_pin(sym):
    """The pin of the sealed series of wave 1 for the symbol folder sym (btc, eth, bnb, sol), from recalc_p2.SYMBOLS."""
    for _symbol, folder, pin in recalc_p2.SYMBOLS:
        if folder == sym:
            return pin
    raise Refused(f"no pinned sealed series for the symbol folder {sym!r} in recalc_p2.SYMBOLS")


def read_series(series_dir, sym, pin, start, end):
    """One read of <series_dir>/<sym>/<sym>-15m.csv by recalc_p2.load_series under the range [start, end), posed on kata_lib for the
    read and restored after it, then <series_dir>/<sym>/missing.json under the role recorder. Returns the read: its symbol folder, range,
    pin, candles (open time in ms -> candle), stats, and the slots it declares missing (a frozenset)."""
    saved = (K.REC_START, K.REC_END)
    try:
        K.REC_START, K.REC_END = start, end
        candles, stats = recalc_p2.load_series(series_dir, sym, pin)
    finally:
        K.REC_START, K.REC_END = saved
    raw = io_guard.read("recorder", f"{series_dir}/{sym}/missing.json")
    try:
        mj = json.loads(raw.decode("utf-8"))
        entries, count = mj["missing"], mj["count"]
        bad = [x for x in entries if not whole(x["open_time_ms"]) or x["open_time_utc"] != iso(x["open_time_ms"])]
    except (ValueError, KeyError, TypeError, AttributeError) as e:
        raise Refused(f"{sym}: missing.json out of its form ({type(e).__name__})") from None
    if bad or not whole(count):
        raise Refused(f"{sym}: missing.json out of its form: a count or an open_time_ms that is not a whole number, or an open_time_utc "
                      f"that does not write its open_time_ms ({len(bad)} entries, count {count!r})")
    listed = sorted(x["open_time_ms"] for x in entries)
    if count != len(listed) or len(set(listed)) != len(listed):
        raise Refused(f"{sym}: missing.json counts {count!r}, holds {len(listed)} entries, or an entry repeats")
    off = [t for t in listed if t % K.STEP_MS != 0 or not (start <= t < end)]
    if off:
        raise Refused(f"{sym}: {len(off)} entries of missing.json off the grid or outside [{iso(start)}, {iso(end)}), first {off[0]}")
    present = [t for t in listed if t in candles]
    if present:
        raise Refused(f"{sym}: {len(present)} slots listed in missing.json are present in the series, first {iso(present[0])}")
    return {"sym": sym, "range": (start, end), "pin": pin, "candles": candles, "stats": stats, "declared": frozenset(listed)}


def merge(first, second, lookback_ms):
    """The controlled merge of read 1 (sealed) and read 2 (LIVE), which meet at S_k and share no instant (their ranges, held by
    load_series): every grid slot of [S_k - lookback, E_k) present or declared by the read that owns it. Returns the merged candles, the
    controlled range, the seam and the declared gaps of each read, sorted."""
    (s1, _e1), (s2, e2) = first["range"], second["range"]
    if lookback_ms <= 0 or lookback_ms % K.STEP_MS != 0 or s2 - lookback_ms < s1:
        raise Refused(f"lookback {lookback_ms} ms: not a positive number of grid steps within the range of read 1")
    start = s2 - lookback_ms
    candles = {**first["candles"], **second["candles"]}
    gaps, undeclared = ([], []), []
    for t in range(start, e2, K.STEP_MS):
        if t in candles:
            continue
        owner = 0 if t < s2 else 1
        (gaps[owner] if t in (first, second)[owner]["declared"] else undeclared).append(t)
    if undeclared:
        raise Refused(f"undeclared gap: {len(undeclared)} grid slots absent from the series and from the missing.json of their read, "
                      f"first {iso(undeclared[0])}")
    return {"range": (start, e2), "seam": s2, "candles": candles, "gaps": {"sealed": gaps[0], "live": gaps[1]}}


def load_quarter(sealed_dir, live_dir, sym, k, pin1, pin2, lookback_ms):
    """The two reads of the symbol folder sym for quarter k and their merge: (read 1, read 2, merged)."""
    s_k, e_k = quarter(k)
    first = read_series(sealed_dir, sym, pin1, *sealed_range(k))
    second = read_series(live_dir, sym, pin2, s_k, e_k)
    return first, second, merge(first, second, lookback_ms)


HISTORY = ("format", "release_dir", "task_class", "policy_table_sha256", "probe_record_sha256", "merge_commit", "t_e", "t_f", "ca_record_sha256")


def second(s):
    """A real UTC second written YYYY-MM-DDTHH:MM:SSZ, in ms; else None."""
    try:
        ms = int(datetime.datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.UTC).timestamp()) * 1000
    except (TypeError, ValueError):
        return None
    return ms if iso(ms) == s else None


def served_history(path, pin):
    """The served history, a JSON array of kata-served-history-v1 lines read whole (json.loads of the file, never line by line) under
    the role served-history, refused before parsing unless its sha256 is the pin. A deployment is a release_dir, in the order of the
    file: its lines share merge_commit, t_e, t_f and ca_record_sha256, each names one class once, and the deployments go up in t_e and
    t_f. A class is served from the t_f of each deployment that holds it to the t_f of the next one (open after the last); the
    deployments that hold a class follow each other, else a gap is refused by name (absent before its first one is no gap). Returns
    {task_class: [(from_ms, to_ms or None, its line's policy_table_sha256)]}. The bytes: the writer's canonical text of the lines (render)."""
    data = io_guard.read("served-history", path)
    got = hashlib.sha256(data).hexdigest()
    if got != pin:
        raise Refused(f"served history refused before parsing: sha256 {got} differs from the pinned {pin}")
    try:
        lines = json.loads(data.decode("utf-8"), object_pairs_hook=unique)
    except ValueError:
        raise Refused("served history: not a JSON text") from None
    deps = {}
    for x in lines if type(lines) is list and lines else [None]:
        if type(x) is not dict or sorted(x) != sorted(HISTORY):
            raise Refused(f"served history: a line whose fields are not the closed {list(HISTORY)}: {sorted(x) if type(x) is dict else x!r}")
        if type(x["task_class"]) is not str:
            raise Refused(f"served history: a line that carries a list of classes, or no class: {x['task_class']!r}")
        if x["format"] != "kata-served-history-v1" or any(type(x[f]) is not str for f in HISTORY) or not all(re.fullmatch(p, x[f]) for f, p in FORMS.items()) \
                or not day(x["release_dir"]) or None in (second(x["t_e"]), second(x["t_f"])) or second(x["t_e"]) > second(x["t_f"]):
            raise Refused(f"served history: {x['release_dir']!r} {x['task_class']}: not a kata-served-history-v1 line (format, fields of their form, t_e <= t_f)")
        d = deps.setdefault(x["release_dir"], {"common": tuple(x[f] for f in HISTORY[5:]), "classes": {}})
        if x["task_class"] in d["classes"] or d["common"] != tuple(x[f] for f in HISTORY[5:]):
            raise Refused(f"served history: {x['release_dir']} {x['task_class']}: a pair written twice, or a deployment whose lines differ on "
                          "merge_commit, t_e, t_f or ca_record_sha256")
        d["classes"][x["task_class"]] = x["policy_table_sha256"]
    if data != ("[\n" + ",\n".join(R.canonical(x) for x in sorted(lines, key=lambda x: (x["t_e"], x["task_class"]))) + "\n]\n").encode("ascii"):
        raise Refused("served history: not the writer's canonical text of its lines (a JSON array, one canonical element per line, sorted by t_e and task_class)")
    names, te, tf = list(deps), [second(d["common"][1]) for d in deps.values()], [second(d["common"][2]) for d in deps.values()]
    if any(a >= b for a, b in [*zip(te, te[1:]), *zip(tf, tf[1:])]):
        raise Refused(f"served history: deployments not in the order of their t_e and t_f: {names}")
    service = {}
    for i, d in enumerate(deps.values()):
        for c in d["classes"]:
            service.setdefault(c, []).append((tf[i], tf[i + 1] if i + 1 < len(tf) else None, d["classes"][c]))
    for c in service:
        held = [i for i, d in enumerate(deps.values()) if c in d["classes"]]
        gap = next((names[i] for i in range(held[0], held[-1]) if i not in held), None)
        if gap:
            raise Refused(f"served history: gap, {c} is served before and after {gap}, which has no line for it")
    return service


def served_in(spans, s_k, e_k):
    """The service of a class in Q_k = [s_k, e_k) from its spans: (from_ms, to_ms, the tables of the spans that meet Q_k); None if none."""
    met = [(max(s_k, a), e_k if b is None else min(e_k, b), t) for a, b, t in spans if a < e_k and (b is None or b > s_k)]
    return (min(m[0] for m in met), max(m[1] for m in met), [m[2] for m in met]) if met else None


FORMS = {"release_dir": r"contract-1\.1\.0-tables-[0-9]{4}-[0-9]{2}-[0-9]{2}", "task_class": "[a-z0-9]+(-[a-z0-9]+)*", "merge_commit": "[0-9a-f]{40}",
         **dict.fromkeys(HISTORY[3:5] + HISTORY[8:], "[0-9a-f]{64}")}  # checkLine of scripts/served-history.mjs, ASCII digits only


def day(s):
    """validDate of scripts/spec-publish.mjs on the YYYY-MM-DD that ends s: a real day of a year from 100 (Date.UTC reads 0 to 99 as 19xx)."""
    try:
        return datetime.date(int(s[-10:-6]), int(s[-5:-3]), int(s[-2:])).year >= 100
    except ValueError:
        return False


def unique(pairs):
    """The object_pairs_hook of the reader: a key written twice in one object is refused by name (json.loads would keep the last)."""
    if len({k for k, _ in pairs}) != len(pairs):
        raise Refused(f"served history: a key written twice in one object: {sorted(k for k, _ in pairs)}")
    return dict(pairs)
