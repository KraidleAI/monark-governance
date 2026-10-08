# claude-opus-5-5 - 2026-10-07 - VERIFIER-TOOL-CI-1 (docs/G0-lot-verifier-tool-ci-1.md), Python 3.14 standard library only, no network.
# report_check.py of the frozen tool, run off Windows with one stand-in. As written it stops at its section 3 on any other system:
# report.platform_fields refuses it (the C library of log is located on Windows only, ucrtbase.dll). Here that function alone stands
# in: it reads, under the role libm, a library that this run made (a version resource and nothing else) under the name ucrtbase.dll,
# and report.LIBMS gains that library with the count of measured inputs where this host's log differs from the port. Every other
# section of report_check.py runs as written. Section 3 is not held off Windows: MONARK replays it there, on the real ucrtbase.dll.
# Not a file of the tool's tree, never listed; run by scripts/verifier-tool-ci.mjs off Windows, under the FORM of io_guard.py:
#   python <FORM> scripts/verifier-tool-ci-report-check.py <repository> <work dir> <out.txt> <absent dir for the stand-in library>
import os, sys  # os frozen, sys built in: nothing is looked up by name before io_guard runs (the prologue of IO-GUARD-POSED-FILES-1)

if len(sys.argv) != 5:
    print("usage: python <FORM> scripts/verifier-tool-ci-report-check.py <repository> <work dir> <out.txt> <absent dir>")
    sys.exit(2)
if not sys.flags.safe_path:
    del sys.path[0]  # this script's folder, first without -P: the standard library and the tool's modules are looked up elsewhere
sys.path.append(_d := os.path.join(os.path.abspath(sys.argv[1]), "tools", "kata-recalc"))  # the tool's folder, last, as under -P
_g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))  # io_guard by its path: its form checked, its hook set

import hashlib
import math
import struct

import fdlibm_log
import report
import report_check

LIB = os.path.join(os.path.abspath(sys.argv[4]), "ucrtbase.dll")


def platform_fields():
    """report.platform_fields off Windows: the library that this run made, read under the role libm, its version and digest."""
    data = _g.read("libm", LIB)
    return {"python": sys.version, "system": "Windows-standin-0.0.0-SP0", "machine": "standin",
            "libm": {"name": "ucrtbase.dll", "version": report.file_version(data), "sha256": hashlib.sha256(data).hexdigest()}}


_g.output(os.path.dirname(LIB))
os.mkdir(os.path.dirname(LIB))
key = "VS_VERSION_INFO".encode("utf-16-le") + b"\0\0"
made = key + bytes(-len(key) % 4) + struct.pack("<4I", 0xFEEF04BD, 0, 0, 1)  # VS_FIXEDFILEINFO: file version 0.0.0.1
with open(LIB, "wb") as fh:
    fh.write(made)
report.LIBMS = {**report.LIBMS, hashlib.sha256(made).hexdigest(): (report.file_version(made), fdlibm_log.held_to_vectors(math.log)[3])}
report.platform_fields = platform_fields
sys.exit(report_check.main(*(os.path.abspath(a) for a in sys.argv[1:4])))
