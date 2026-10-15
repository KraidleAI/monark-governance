# claude-opus-5-5 - 2026-10-15 - the loader of the quarter counts tool, tools/kata-quarter/ (CM-5, its first code lot), Python 3.14
# standard library only, no network. A sibling module of quarter_counts.py, the one entry script: no block __main__ here. It reads only
# through io_guard.read, under the roles series and recorder that the entry declares, and through recalc_p2.load_series of the frozen
# tool tools/kata-recalc/, imported, never copied (each read hashes the bytes and refuses them before parsing unless the sha256 is the
# pin it is given, D-3 of the frozen tool).
# Two reads of one symbol, then a controlled merge. Read 1, the sealed series: for quarter 1 the series of wave 1 under its recording
# range (kata_lib.REC_START to REC_END, which ends at S_1) and the pin of recalc_p2.SYMBOLS (sealed_pin); for a later quarter the record
# of the previous quarter under that quarter's range and the pin posted at its sealing. Read 2, the LIVE series of the quarter under
# [S_k, E_k) and the pin posted at its sealing; both pins come to check as arguments and are printed. The merge holds three things: read 1
# ends exactly where read 2 starts (S_k); no instant is in both reads; every grid slot from S_k minus the lookback (the longest input
# window of the rows counted, given by the caller) to E_k is present in the merged candles or listed in the missing.json of the read that
# owns it ("every absent grid slot, never filled"). An undeclared gap is a named refusal (Refused, exit 2 at the entry); a declared gap
# stays a gap: the count decides later whether it is a drop or an instant outside the cell. A slot listed as missing and present in the
# series, or listed off the grid or outside the read's range, is refused too. Truncated candles (the close-time rule of the sealed blocks)
# are not read here yet: recalc_p2.load_series still stops on any irregular close time.
import datetime
import json

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first (never found by name here)
import kata_lib as K
import recalc_p2

FIRST = (2026, 10)  # S_1 = 2026-10-01T00:00Z; S_k is 3(k - 1) calendar months after it, E_k is S_k plus 3 calendar months


class Refused(Exception):
    """A named refusal of the loader: the entry prints it and exits 2."""


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
        listed = sorted(int(x["open_time_ms"]) for x in mj["missing"])
        count = mj["count"]
    except (ValueError, KeyError, TypeError, AttributeError) as e:
        raise Refused(f"{sym}: missing.json out of its form ({type(e).__name__})") from None
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
    """The controlled merge of read 1 (sealed) and read 2 (LIVE): the seam, no instant in both, and every grid slot of
    [S_k - lookback, E_k) present or declared by the read that owns it. Returns the merged candles, the controlled range, the seam and
    the declared gaps of each read, sorted."""
    (s1, e1), (s2, e2) = first["range"], second["range"]
    if e1 != s2:
        raise Refused(f"seam: read 1 ends at {iso(e1)} and read 2 starts at {iso(s2)}, not the same instant")
    both = sorted(set(first["candles"]) & set(second["candles"]))
    if both:
        raise Refused(f"{len(both)} instants in both reads, first {iso(both[0])}")
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
