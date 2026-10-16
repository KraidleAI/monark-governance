# claude-opus-5-5 - 2026-10-16 - the reader of the wave 2 core registry, tools/kata-quarter/ (CM-5, docs/G0-lot-cm5-c3.md), Python 3.14
# standard library only, no network; a sibling module of quarter_counts.py, no block __main__. core_rows reads wave2.json, of the frozen
# format kata/registry/FORMAT-wave2.md of RECHERCHES, under the role registry, refused before parsing unless its sha256 is the pin; then
# its byte form (JSON.stringify(registry, null, 1) and one line feed, UTF-8, no U+2028 or U+2029), every object closed to the keys of
# its table in the format's order (closed), and in each row the fields that the count reads (row): its cell (taskClass, key, kataId, W,
# venue, symbol, horizon, trialId), alpha "0.01", calibAttempt 2, a qhat iff calibrated, status and vetoedBy by the order of the three
# veto blocks, its factor table that of its wave 1 row byte for byte, and the reader checks on the months of its blocks. Any other row
# is refused by name (Refused, exit 2). counted() adds its region rows to the count of Q_k under the child rule (child_counted).
import hashlib
import json
import math
import re

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first
import kata_lib as K
import quarter_load as Q
import recalc_p2

CALIB_END = K.utc_ms(2023, 10, 1)  # CALIB-2, the calibration data of a core row: 2022-10-01 to 2023-10-01, end exclusive (ADR 0006 l.167)
BLOCKS = {"bridge": (K.utc_ms(2025, 10, 1), K.utc_ms(2026, 10, 1)), "test": (K.utc_ms(2023, 10, 1), K.utc_ms(2024, 4, 1)),
          "fwd": (K.utc_ms(2024, 4, 1), K.utc_ms(2024, 10, 1))}  # the three veto blocks in their order (VETO_ORDER), end exclusive
READS = (K.utc_ms(2022, 9, 1), K.utc_ms(2026, 10, 1))  # the range of the months that a core cell reads (FORMAT-wave2, seriesSha256)
SHAPES = {"": ("plan", "engine", "trialRegistryHead", "rows"), "trialRegistryHead": ("length", "hash"),
          "row": ("taskClass", "key", "kataId", "W", "venue", "symbol", "horizon", "side", "bucket", "thresholds", "hourOfWeekFactors",
                  "factorTableSha256", "alpha", "testDelta", "calibAttempt", "tailFrac", "auxSeq", "order", "calibSupport", "seriesSha256",
                  "epoch", "drops", "calib", "bridge", "test", "fwd", "status", "vetoedBy", "trialId"),
          "calibSupport": ("min", "max"), "drops": ("calib", "bridge", "test", "fwd"),
          "calib": ("n", "status", "reason", "qhat", "rank", "kStar", "kObs", "misses", "U", "tail", "check1", "report", "scoresSha256", "auxSha256"),
          "tail": ("r", "m", "a", "tailNum", "tailDen", "verdict"), "check1": ("m", "a", "tailNum", "tailDen", "verdict"),
          "report": ("balanced", "tailOther", "a2", "a3"), "tailOther": ("m", "a", "verdict"),
          **dict.fromkeys(BLOCKS, ("nTest", "kTest", "UTest", "vetoed", "months")), "month": ("n", "k")}
LISTS, NULLABLE = {"rows": "row", "hourOfWeekFactors": "factor"}, ("calibSupport", "tail", "check1", "report", "tailOther")
USAGE = ("\n       python -E -S -s -B -P quarter_counts.py check equals_wave2_registry_on_its_blocks <registry> <registry sha256> "
         "<core registry> <core registry sha256> <sealed series dir> <out dir> <symbol folder>:<sealed sha256> ...")


def safe(v):
    """A safe integer >= 0 as JSON writes one: an int, never a bool."""
    return type(v) is int and 0 <= v <= 2 ** 53 - 1


def closed(v, name, where):
    """Every object holds the keys of its table and no other, in the format's order (months: YYYY-MM keys, ascending); every array is
    the rows or a factor table; any other value is a scalar, or null where the format admits it."""
    if name in LISTS:
        if type(v) is not list:
            raise Q.Refused(f"wave2.json: {where}: a {type(v).__name__}, not an array")
        for i, x in enumerate(v):
            closed(x, LISTS[name], f"{where}[{i}]")
    elif name in SHAPES or name == "months":
        keys = sorted(v) if type(v) is dict and name == "months" else SHAPES.get(name)
        if not (v is None and name in NULLABLE) and (type(v) is not dict or list(v) != list(keys)):
            raise Q.Refused(f"wave2.json: {where or 'the top level'}: {list(v) if type(v) is dict else type(v).__name__}, not the keys of its "
                            f"table in the format's order {keys}")
        for k, x in (v or {}).items():
            closed(x, "month" if name == "months" else "count" if name == "drops" else k, f"{where}.{k}" if where else k)
    elif type(v) in (dict, list):
        raise Q.Refused(f"wave2.json: {where}: an object or an array where the format writes a value")


def document(path, pin):
    """wave2.json read under the role registry, pinned, in its byte form and closed."""
    data = io_guard.read("registry", path)
    if (got := hashlib.sha256(data).hexdigest()) != pin:
        raise Q.Refused(f"core registry refused before parsing: sha256 {got} differs from the pinned {pin}")
    try:
        text = data.decode("utf-8")
        doc = json.loads(text, object_pairs_hook=lambda p: Q.unique(p, "wave2.json"))
        form = "\u2028" not in text and "\u2029" not in text and text == K.js_json_pretty(doc) + "\n"
    except ValueError:  # not UTF-8, not JSON, or an integer that JavaScript does not write
        form = False
    if not form:
        raise Q.Refused("wave2.json: not its byte form, JSON.stringify(registry, null, 1) and one line feed (UTF-8, LF only, no U+2028 or U+2029)")
    closed(doc, "", "")
    return doc


def wave1(path, pin):
    """The rows of the wave 1 registry, any status, by (taskClass, key), read again under its pin (the count read it first)."""
    data = io_guard.read("registry", path)
    if (got := hashlib.sha256(data).hexdigest()) != pin:
        raise Q.Refused(f"registry refused before parsing: sha256 {got} differs from the pinned {pin}")
    return {(r["taskClass"], r["key"]): r for r in json.loads(data.decode("utf-8"))["rows"]}


def months_ok(b, name, qhat):
    """A veto block: nTest whole; kTest null iff the row has no qhat, months {} then; the reader checks on its months: keys YYYY-MM of a
    month of the block (closed() holds their order), and with a kTest, n and k whole and summed to nTest and kTest."""
    m, (s, e) = b["months"], BLOCKS[name]
    within = all(re.fullmatch("[0-9]{4}-[0-9]{2}", k) and (t := Q.second(f"{k}-01T00:00:00Z")) is not None and s <= t < e for k in m)
    return safe(b["nTest"]) and (b["kTest"] is None) == (qhat is None) and within and (m == {} if b["kTest"] is None else safe(b["kTest"])
        and all(safe(x["n"]) and safe(x["k"]) for x in m.values()) and sum(x["n"] for x in m.values()) == b["nTest"] and sum(x["k"] for x in m.values()) == b["kTest"])


def row(r, parent):
    """One core row and its wave 1 row (None if it has none): (row, its cell of recalc_p2.cells_of, its symbol folder), or a named refusal."""
    c, h, f = r["calib"], r["horizon"], str(r["taskClass"]).split("-")[0]
    cell = next((x for x in recalc_p2.cells_of(r["symbol"], f, h) if (x["taskClass"], x["key"]) == (r["taskClass"], r["key"])), None)
    fired = [b for b in BLOCKS if r[b]["vetoed"] is True]  # vetoedBy: the first block that fires, in the order bridge, TEST-2, FWD-2
    wrong = [what for what, ok in (
        ("a band or path cell of the core with its kata, W, venue and trial id", cell is not None and cell["kind"] != "dir" and h in recalc_p2.HORIZONS
         and cell["kata"] == r["kataId"] and safe(r["W"]) and r["W"] == K.W[cell["kata"]] and r["venue"] == recalc_p2.VENUE
         and f == str(r["symbol"]).removesuffix("USDT").lower() and r["trialId"] == f"{r['taskClass']}|{r['kataId']}|{r['venue']}|{r['symbol']}|{h}|W2-CALIB"),
        ("calibAttempt 2", type(r["calibAttempt"]) is int and r["calibAttempt"] == 2),
        ("alpha 0.01", r["alpha"] == "0.01"),
        ("a qhat, a finite number, iff calibrated", c["status"] in ("under_calib", "silence", "region") and (c["qhat"] is None) == (c["status"] == "under_calib")
         and (c["qhat"] is None or type(c["qhat"]) in (int, float) and math.isfinite(c["qhat"]))),
        ("its status and vetoedBy by the order of its blocks", all(type(r[b]["vetoed"]) is bool for b in BLOCKS) and (not fired or c["status"] == "region")
         and r["status"] == ("vetoed" if fired else c["status"]) and r["vetoedBy"] == (fired[0] if fired else None)),
        ("the factor table of its wave 1 row, byte for byte", parent is not None
         and r["factorTableSha256"] == parent["factorTableSha256"] == K.seq_sha256(r["hourOfWeekFactors"])),
        ("blocks whose months are of the block and sum to nTest and kTest", all(months_ok(r[b], b, c["qhat"]) for b in BLOCKS))) if not ok]
    if wrong:
        raise Q.Refused(f"core row {r['taskClass']} {r['key']}: not {'; not '.join(wrong)}")
    return r, cell, f


def core_rows(path, pin, parents):
    """The rows of wave2.json in its order, each checked against its wave 1 row in parents; a cell written twice refused."""
    out = [row(r, parents.get((str(r["taskClass"]), str(r["key"])))) for r in document(path, pin)["rows"]]
    if len({(r["taskClass"], r["key"]) for r, _, _ in out}) != len(out):
        raise Q.Refused("wave2.json: a cell (taskClass, key) written twice")
    return out


def child_counted(s_k):
    """Addendum 9 point 2: a child row is first counted on the first quarter whose start S_k is at or after the end of its calibration
    data, CALIB_END (exclusive: its last instant is CALIB_END - 1 ms); every instant of such a Q_k is at or after CALIB_END."""
    return s_k >= CALIB_END


def counted(rows, venue, core, registry, pin, s_k):
    """The rows of the count of Q_k: those of the wave 1 registry (quarter_core.registry_rows), then, with the core registry (core: its
    path and pin; None: the rows as they are), its region rows, each at attempt 2, when the child rule admits them on Q_k."""
    if core is None:
        return rows, venue
    mine = [x for x in core_rows(*core, wave1(registry, pin)) if x[0]["status"] == "region" and child_counted(s_k)]
    return rows + mine, sorted({*venue, *(f for _, _, f in mine)})
