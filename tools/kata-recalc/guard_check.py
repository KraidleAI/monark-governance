# claude-opus-5-5 - 2026-10-07 - frozen-tool lot of VERIFIERS-LIST-F5A-1 (RECHERCHES' reviews of #214 and #217: A-1, A-2, N-2, N-4,
# N-5), Python 3.14 standard library only, no network.
# Self-tests of io_guard.py, the input guard. A refusal ends its process (os._exit), so each case runs as a child of this script
# through io_guard.run_tool, and the parent checks the child's exit code and a text that the child writes (for a refusal, the guard's
# reason on stderr). The cases: the import event judged against the closed list NATIVE (A-1); os.posix_spawn and time.sleep admitted
# only within a spawn of io_guard and on the thread that spawns, the file being read admitted to the reading thread only (A-2, N-2);
# git_tree held to the tool's tree, its repository and its role (N-5); and, as measures, the limits that remain (item
# IO-GUARD-NATIVE-READS-1): a built-in module that importlib loads without an event, the stat family, os.mkfifo under POSIX (N-4).
# The G2 of the lot: git offline in a partial clone that the parent makes, a named stream refused, a process created once after
# the Popen of a spawn and with its argv, the second tree of MONARK's closed list (read, never an output), a third tree refused,
# the role served-history, and the homonyms of the two trees (in the parent). MONARK's form of the launch (2026-10-07): each child of
# io_guard.run_tool runs under io_guard.FORM, which io_guard checks at its import (the cases "launch", on a copy of the tool's tree).
# IO-GUARD-POSED-FILES-1 (2026-10-08): the closed lists of the two trees, before any other import and after the hook, route 3a, io_guard.py
# run by its path once per process, the form -P; the cases of posed names run on fresh copies (_pose), red against the guard of 6536057c.
# Each case names the change of the guard that reddens it; the same script, run against the guard of 09f49fc2, is its red proof
# (against the guard before its G2 for the cases of the G2, and that of mission 4 for the launches). No input is read: the files of
# the cases are written by the parent, under its work directory, and so are the partial clone and the copy of the tool's tree.
# Usage: python -E -S -s -B -P guard_check.py <repository> <work dir> <out.txt>
#        python -E -S -s -B -P guard_check.py --case <name> <repository> <work dir>   (one case, as the first form runs it)
import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked its folder (IO-GUARD-POSED-FILES-1)
if "io_guard" not in sys.modules:  # io_guard.py run by its path, never found by name: nothing posed or installed stands in for it
    sys.path.append(_d := os.path.dirname(os.path.realpath(__file__)))  # the tool's folder, last in sys.path: -P is in FORM
    _g = sys.modules["io_guard"] = type(sys)("io_guard"); _g.__file__ = os.path.join(_d, "io_guard.py")
    exec(compile(open(_g.__file__, "rb").read(), _g.__file__, "exec"), vars(_g))
import io_guard  # the input guard, before any other module (M-7): this script reads no input; a case may declare a role
import importlib
import importlib.machinery
import importlib.util
import os
import subprocess
import sys
import threading
import time

MODEL = "claude-opus-5-5"
TREE = "tools/kata-recalc"
LISTED = ("_ast", "_datetime", "_json", "_opcode", "_sre", "_struct", "_suggestions", "_tokenize", "_wmi", "math")  # NATIVE, measured
OUTSIDE = ("_ctypes", "_socket", "_ssl", "_sqlite3", "_queue", "unicodedata", "select", "_bz2", "_lzma")  # never imported by the tool
BUILT_IN = ("faulthandler", "_tracemalloc", "_lsprof", "_symtable", "xxsubtype")  # never imported by the tool
FOLDER = "a name of the tool's folder outside its closed list FILES"  # IO-GUARD-POSED-FILES-1: a refusal that its cases want
QUARTER = {"kata-quarter/FILES": "FILES\nquarter_counts.py\n", "kata-quarter/quarter_counts.py": "x = 1\n"}  # its list, no homonym
CASES = (  # name, exit and text wanted from the child (a tuple: texts; a list: the launches of posed names, _posed)
    # A-1, reddened by: the import event admitted again (the guard of 09f49fc2), or a built-in module's name not judged
    ("import-builtin-outside-list", 4, "a built-in module outside the closed list NATIVE"),
    # A-1, reddened by: the import event admitted again, or the name of an extension module not judged
    ("import-extension-outside-list", 4, "a native module outside the closed list NATIVE"),
    # A-1, reddened by: the file of an extension module not judged (a listed name loaded from a copy outside the standard library)
    ("import-extension-outside-stdlib", 4, "a native module outside the standard library"),
    # A-1, reddened by: a name of NATIVE dropped (its import is refused), or NATIVE no longer the measured list LISTED
    ("import-listed", 0, "IMPORTED; NATIVE IS THE MEASURED LIST"),
    # A-1, reddened by: _suggestions, _ast, _opcode or _tokenize dropped from NATIVE (the trace of an uncaught exception cut short)
    ("trace-kept", 1, "Did you mean: 'sqrt'?"),
    # A-2, reddened by: time.sleep refused within a spawn (POSIX: Popen._wait under a time limit)
    ("sleep-in-spawn", 0, "SPAWNED 0"),
    # A-2, reddened by: os.posix_spawn refused within a spawn, after its Popen and with its argv (POSIX: subprocess spawns a path so)
    ("posix-spawn-in-spawn", 0, "SPAWNED 0"),
    # G2, reddened by: a process created within a spawn before its Popen (the guard before the G2), or more than once after it, or
    # under another program than the one io_guard names (an application name), or with another argv (POSIX)
    ("create-before-popen-in-spawn", 4, "once after its Popen"),
    ("create-twice-in-spawn", 4, "once after its Popen"),
    ("create-with-a-program-in-spawn", 4, "once after its Popen"),
    ("posix-spawn-other-argv-in-spawn", 4, "once after its Popen"),
    # G2, reddened by: git free to fetch a missing object from the promisor of a partial clone (GIT_NO_LAZY_FETCH not passed)
    ("git-no-lazy-fetch", 0, "NOT FETCHED, STILL MISSING"),
    # G2, reddened by: a named stream of an NTFS file admitted (here ::$DATA of a file of the tool's tree; Windows only)
    ("ntfs-stream", 4, "a named stream of an NTFS file"),
    # MONARK's closed list of trees (ecace80), reddened by: the second tree not admitted for reading and listing, admitted as an output,
    # a third tree admitted, or the role served-history not in ROLES
    ("second-tree-read", 0, "ADMITTED"),
    ("second-tree-output", 4, "an output inside one of the tool's trees"),
    ("third-tree-read", 4, "neither the standard library"),
    ("served-history-declared", 0, "DECLARED"),
    # MONARK's form of the replay command (2026-10-07), reddened by: a child of io_guard.run_tool started without -E, -S, -s or -P, as
    # before it (a sitecustomize on PYTHONPATH, the user site, or site and the files it runs, ran in the child before io_guard: measured),
    # or the tool's folder anywhere but last in sys.path (IO-GUARD-POSED-FILES-1: the standard library first)
    ("child-flags", 0, "-E 1 -S 1 -s 1, options -E -S -s -B -P, site absent, tool folder last"),
    # A-2, reddened by: time.sleep, or os.posix_spawn, admitted outside a spawn of io_guard, or refused under another class
    ("sleep-outside-spawn", 4, "admitted only while io_guard spawns"),
    ("posix-spawn-outside-spawn", 4, "admitted only while io_guard spawns"),
    # N-2, reddened by: the spawn mark shared by every thread again (an event of the spawn class passes on another thread)
    ("spawn-event-of-another-thread", 4, "admitted only while io_guard spawns"),
    # N-2, reddened by: the mark of the file being read shared by every thread again (another thread opens it unnoted)
    ("read-of-another-thread", 4, "neither the standard library"),
    # N-5, reddened by: git_tree without the role tool-tree (a script that declared libm only reads blobs)
    ("git-tree-without-role", 4, "a role that this script has not declared"),
    # N-5, reddened by: git_tree without the check of its repository (here a directory of the repository that is not its root)
    ("git-tree-other-repository", 4, "not the repository that holds the tool's tree"),
    # N-5 and B-2, reddened by: git_tree given its repository as a path relative to the working directory, and taking it
    ("git-tree-relative-repository", 4, "a relative path"),
    # N-5, reddened by: a path that a caller may name again (README.md read), or entries outside the tool's tree
    ("git-tree-only-the-tool-tree", 0, "ONLY THE TOOL'S TREE"),
    # the limits that remain, measured (item IO-GUARD-NATIVE-READS-1); reddened by: the limit closed (the case then moves above)
    ("residual-builtin-through-importlib", 0, "LOADED WITHOUT AN EVENT"),
    ("residual-stat", 0, "STAT WITHOUT AN EVENT"),
    ("residual-mkfifo", 0, "MADE WITHOUT AN EVENT" if hasattr(os, "mkfifo") else "ABSENT ON THIS SYSTEM"),
    # IO-GUARD-POSED-FILES-1 (MONARK, 2026-10-07): launches on fresh copies, each (names posed, launch, texts), wanting exit 4 and no
    # witness. Reddened by: the check that a case names left out (FILES, io_guard.py a link, the lists after the hook or each to its own
    # tree, route 3a, the six refusals of the second tree's list), FILES after an import (posed msvcrt), io_guard found by name again
    ("posed homonym", 4, [({"kata-recalc/threading.py": "witness"}, "report", f"['threading.py']: {FOLDER}")]),
    ("posed package", 4, [({"kata-recalc/io_guard/__init__.py": "stand-in"}, "report", f"['io_guard']: {FOLDER}")]),
    ("posed cache", 4, [({"kata-recalc/__pycache__/io_guard.cpython-314.pyc": "forged"}, "report", f"['__pycache__']: {FOLDER}")]),
    ("posed msvcrt", 4, [({"kata-recalc/msvcrt.py": "witness"}, "report", f"['msvcrt.py']: {FOLDER}")]),
    ("posed _wmi", 4, [({"kata-recalc/_wmi.py": "witness"}, "report", f"['_wmi.py']: {FOLDER}")]),
    ("posed file", 4, [({"kata-recalc/sitecustomize.py": "witness"}, "report", f"['sitecustomize.py']: {FOLDER}")]),
    ("posed folder", 4, [({"kata-recalc/data": "folder"}, "report", f"['data']: {FOLDER}")]),
    ("posed cache folder in another case", 4, [({"kata-recalc/__PYCACHE__": "folder"}, "report", f"['__PYCACHE__']: {FOLDER}")]),
    ("listed name not a file", 4, [({"kata-recalc/kata_lib.py": "folder"}, "report", f"['kata_lib.py']: {FOLDER}")]),
    ("listed name a link", 4, [({"kata-recalc/kata_lib.py": "link"}, "report", f"['kata_lib.py']: {FOLDER}"),
                               ({"kata-recalc/io_guard.py": "link"}, "report", "['io_guard.py']: a link")]),
    ("open under the folder", 4, [({}, "open the folder", "refused open ", "kata-recalc': "),
                                  ({}, "open a fifo in the folder", "refused open ", f"kata-recalc{os.sep}late.py': ")]),
    ("tool module offered before the folder", 4, [({"decoy/kata_lib.py": "witness"}, "decoy",
                                                   "['kata_lib.py']: offered by an entry of sys.path before")]),
    ("second tree without its list", 4, [({"kata-quarter/quarter_counts.py": "x = 1\n"}, "report",
                                          "FILES': a second tree without its list")]),
    ("second tree not a folder", 4, [({"kata-quarter": w}, "report", "kata-quarter': a second tree that is not a folder")
                                     for w in ("a file\n", "link")]),
    ("second tree list not a file", 4, [({**QUARTER, "kata-quarter/FILES": w}, "report",
                                         "FILES': a list file of the second tree that is not a") for w in ("folder", "link")]),
    ("second tree list out of form", 4, [({**QUARTER, "kata-quarter/FILES": w}, "report", "FILES': a list file of the second tree out of")
                                         for w in ("quarter_counts.py\nFILES\n", "FILES\nFILES\nquarter_counts.py\n", "".join(
                                             f"{n}\n" for n in sorted(("FILES", "quarter_counts.py", os.path.realpath(sys.executable)))))]),
    ("second tree outside its list", 4, [({**QUARTER, "kata-quarter/quarter_load.py": "y = 2\n"}, "report",
                                          "['quarter_load.py']: a name of the second tree outside its list")]),
    ("second tree listed name not a file", 4, [({**QUARTER, "kata-quarter/quarter_counts.py": "folder"}, "report",
                                                "['quarter_counts.py']: a name of the second tree's list that is not a")]),
    ("open under the second tree", 4, [(QUARTER, f"read, then open {w}", "LISTED FILE READ", "refused open ", f"kata-quarter{t}': ")
                                       for w, t in (("a fifo in the second tree", f"{os.sep}late.py"), ("the second tree", ""))]),
    ("first tree name under the second tree", 4, [(QUARTER, "open a fifo in the second tree named as a file of the first",
                                                   "refused open ", f"kata-quarter{os.sep}kata_lib.py': ")]),
    # IO-GUARD-POSED-FILES-1, reddened by: an extension module admitted from the tool's folder (FILES holds .py files only)
    ("extension from the folder", 4, ("_json", "a native module outside the standard library")),
    # IO-GUARD-POSED-FILES-1, reddened by: the prologue of an entry script run again when another script imports it (a second hook)
    ("one guard per process", 0, "ONE GUARD"),
    # MONARK (2026-10-07): the form of the launch, checked by io_guard at its import (_launch). Reddened by: site, or a sitecustomize
    # on PYTHONPATH, run under the form; the check of the field named (-P: launch -E -S -s -B), of -W, of -X or of a debug build removed
    ("launch form", 0, "SITE NOT RUN"), ("launch -S -s -B", 2, "ignore_environment 0"), ("launch -E -s -B", 2, "no_site 0"),
    ("launch -E -S -B", 2, "no_user_site 0"), ("launch -E -S -s -B -O", 2, "optimize 1"), ("launch -E -S -s -B -i", 2, "inspect 1"),
    ("launch -E -S -s -B", 2, "safe_path False"), ("launch -E -S -s -B -d", 2, "debug 1"), ("launch -E -S -s -B -v", 2, "verbose 1"),
    ("launch -E -S -s -B -q", 2, "quiet 1"), ("launch -E -S -s -B -W error", 2, "-W error"), ("launch debug build", 2, "a debug build"),
    ("launch -E -S -s -B -X presite=sitecustomize", 2, "-X presite"), ("launch -E -S -s", 2, "_write_bytecode 0"),  # last: writes a cache
)


def _extension(names):
    """The first of names that this interpreter holds as an extension module file, not yet loaded: (name, file), or (None, None)."""
    for n in names:
        if n in sys.builtin_module_names or n in sys.modules:
            continue
        spec = importlib.util.find_spec(n)
        if spec is not None and isinstance(spec.origin, str) and spec.origin.endswith(tuple(importlib.machinery.EXTENSION_SUFFIXES)):
            return n, spec.origin
    return None, None


def _built_in():
    """The first of BUILT_IN that this interpreter holds as a built-in module, not yet loaded, or None."""
    return next((n for n in BUILT_IN if n in sys.builtin_module_names and n not in sys.modules and n not in LISTED), None)


def _roles(*want):
    """The roles of this guard among want: tool-tree is the frozen-tool lot's, so the same case runs against the guard before it."""
    io_guard.declare(*[r for r in want if r in io_guard.ROLES])


def _tree(repo, rev):
    """io_guard.git_tree(repo, rev); against the guard before N-5, its form git_tree(repo, rel, rev), for the red proof only."""
    try:
        return io_guard.git_tree(repo, rev=rev)
    except TypeError:
        return io_guard.git_tree(repo, TREE, rev=rev)


def _within_spawn(repo, work, action):
    """io_guard.run_tool, with action() run inside its spawn, on the thread that spawns (subprocess.run wrapped for that call)."""
    real = subprocess.run

    def wrapped(*a, **k):
        action()
        return real(*a, **k)
    subprocess.run = wrapped
    try:
        return io_guard.run_tool("guard_check.py", ["--case", "noop", repo, work]).returncode
    finally:
        subprocess.run = real


def _after_popen(event, args_of, times=1):
    """Within a spawn, on the thread that spawns: its Popen raised by hand as subprocess raises it, then a process creation (G2)."""
    w = list(io_guard._local.spawning)
    sys.audit("subprocess.Popen", None, w, None, None)
    for _ in range(times):
        sys.audit(event, *args_of(w))


def _other_thread(repo, work, body):
    """A thread besides this one: after the guard, a thread starts only within a spawn, on the thread that spawns."""
    _within_spawn(repo, work, lambda: threading.Thread(target=body, daemon=True).start())


def _launch(opts, repo, work):
    """A launch from main()'s copy of the tool's tree, a sitecustomize.py in a directory on PYTHONPATH: under the form, an
    entry script of the copy; else -c imports io_guard from the copy, first on sys.path (not the working directory, whose io_guard an
    import without -B would cache), no prologue run; "debug build": the form, sys.gettotalrefcount set first."""
    copy, form = os.path.join(work, "copy", "kata-recalc"), getattr(io_guard, "FORM", ("-E", "-s", "-B"))  # mission 4's: red proof only
    code = f"import sys; {'sys.gettotalrefcount = int; ' * (opts == 'debug build')}sys.path.insert(0, {copy!r}); import io_guard"
    tail = [os.path.join(copy, "guard_check.py"), "--case", "site-absent", repo, work] if opts == "form" else ["-c", code]
    return io_guard._spawn([sys.executable, *(form if opts in ("form", "debug build") else opts.split()), *tail],
                           env=dict(os.environ, PYTHONPATH=os.path.join(work, "pythonpath")), timeout=60)


# IO-GUARD-POSED-FILES-1: what the cases of posed names pose (_pose), and the cases that a child of a copy runs (OPENS)
HAND_BACK = ("import os, sys; os.write(2, b'WITNESS %s RAN\\n')\n_d = os.path.normcase(os.path.dirname(os.path.abspath(__file__)))\n"
             "_s = sys.modules['_frozen_importlib_external'].PathFinder.find_spec(__name__, [p for p in sys.path\n"
             "    if os.path.normcase(os.path.abspath(p or '.')) != _d])\nif _s is None:\n    raise ModuleNotFoundError(__name__)\n"
             "sys.modules[__name__] = _m = sys.modules['_frozen_importlib'].module_from_spec(_s)\n_s.loader.exec_module(_m)\n")
STAND_IN = ("import os; os.write(2, b'WITNESS io_guard RAN\\n')\n__file__ = os.path.join(%r, 'io_guard.py')\n"
            "exec(compile(open(__file__, 'rb').read(), __file__, 'exec'), globals())\n")
FORGE = ("import importlib._bootstrap_external as B, importlib.util as U, os, sys\ns, st = sys.argv[1], os.stat(sys.argv[1])\n"
         "open(U.cache_from_source(s), 'wb').write(B._code_to_timestamp_pyc(compile(sys.argv[2], s, 'exec'), st.st_mtime, st.st_size))\n")
DECOY = ("import os, sys; sys.path.insert(0, {0!r}); sys.path.append({1!r}); g = sys.modules['io_guard'] = type(sys)('io_guard'); "
         "g.__file__ = os.path.join({1!r}, 'io_guard.py'); exec(compile(open(g.__file__, 'rb').read(), g.__file__, 'exec'), vars(g)); "
         "import kata_lib")  # route 3a: a folder that holds kata_lib.py first in sys.path, as an installation's, then the guard
FIFO, WHY = hasattr(os, "mkfifo"), {"a link": "this host refuses os.symlink", "a FIFO": "no os.mkfifo on this system"}
OPENS = {  # a child of a copy, after its hook: (a listed file of the second tree read first, the tree, a FIFO posed there, or None)
    "open the folder": (False, "first", None), "open a fifo in the folder": (False, "first", "late.py"),
    "read, then open the second tree": (True, "second", None), "read, then open a fifo in the second tree": (True, "second", "late.py"),
    "open a fifo in the second tree named as a file of the first": (False, "second", "kata_lib.py")}


def _pose(at, names):
    """A fresh copy of the tool's folder at <at>/kata-recalc, made by this run, then the names posed under <at>: a text; "witness", a
    module that writes WITNESS on fd 2 (no event), then hands back; "stand-in", io_guard stood in for; "forged", the cache of io_guard.py,
    its header that source's (by a child without io_guard: under it, marshal.dumps is refused); "folder"; "link", to a file of the bytes
    the name holds (in the copy or QUARTER), else to a folder, under <at>/targets. Returns the copy."""
    here, tool = os.path.dirname(os.path.realpath(__file__)), os.path.join(at, "kata-recalc")
    os.makedirs(tool)
    for n in os.listdir(here):
        with open(os.path.join(here, n), "rb") as fh, open(os.path.join(tool, n), "wb") as to:
            to.write(fh.read())
    for n, what in names.items():
        p, data = os.path.join(at, *n.split("/")), QUARTER.get(n, "").encode("ascii") or None
        if what in ("folder", "link") and os.path.lexists(p):  # a file of the copy, replaced
            with open(p, "rb") as fh:
                data = fh.read()
            os.remove(p)
        os.makedirs(p if what == "folder" else os.path.dirname(p), exist_ok=True)
        if what == "link":
            target = os.path.join(at, "targets", os.path.basename(p))
            os.makedirs(os.path.dirname(target) if data else target, exist_ok=True)
            if data:
                with open(target, "wb") as fh:
                    fh.write(data)
            os.symlink(target, p, target_is_directory=not data)  # winlint-ok: run only where main's probe made a link (links)
        elif what == "forged":
            io_guard._spawn([sys.executable, *io_guard.FORM, "-c", FORGE, os.path.join(tool, "io_guard.py"), STAND_IN % tool], timeout=60)
        elif what != "folder":
            with open(p, "w", encoding="utf-8", newline="\n") as fh:
                fh.write({"witness": HAND_BACK % os.path.basename(p)[:-3], "stand-in": STAND_IN % tool}.get(what, what))
    return tool


def _posed(name, parts, repo, work, links):
    """The launches of a case of posed names, each on a fresh copy (_pose) with the texts it wants, and the note of its parts that this
    host cannot run (a link, a FIFO), named in the case's line. A launch: report.py on its usage path, route 3a (decoy), or OPENS."""
    runs, lacks = [], []
    for k, (names, launch, *texts) in enumerate(parts):
        lack = "a link" if "link" in names.values() and not links else "a FIFO" if OPENS.get(launch, (0, 0, None))[2] and not FIFO else None
        if lack is not None:
            lacks += [lack] * (lack not in lacks)
            continue
        at = os.path.join(work, "posed", name, str(k))
        tool = _pose(at, names)
        argv = ([os.path.join(tool, "report.py")] if launch == "report" else ["-c", DECOY.format(os.path.join(at, "decoy"), tool)]
                if launch == "decoy" else [os.path.join(tool, "guard_check.py"), "--case", launch, repo, work])
        runs.append((io_guard._spawn([sys.executable, *io_guard.FORM, *argv], timeout=60), texts))
    return runs, "".join(f" (its part with {w} skipped: {WHY[w]})" for w in lacks)


def case(name, repo, work):
    """One case, in this child: it prints what it did; a refusal of the guard ends it in REFUSED_EXIT first."""
    f_txt = os.path.join(work, "f.txt")
    if name == "import-builtin-outside-list":
        mod = _built_in()
        __import__(mod)
        print("LOADED", mod)
    elif name == "import-extension-outside-list":
        mod = _extension(OUTSIDE)[0]
        __import__(mod)
        print("LOADED", mod)
    elif name == "import-extension-outside-stdlib":
        mod, src = _extension(LISTED)
        spec = importlib.util.spec_from_file_location(mod, os.path.join(work, "native", os.path.basename(src)))
        importlib.util.module_from_spec(spec)
        print("LOADED", mod, "from a copy outside the standard library")
    elif name == "import-listed":
        import ast, datetime, dis, json, math, platform, re, struct, tokenize  # noqa: F401 (their native modules are NATIVE)
        same = getattr(io_guard, "NATIVE", None) == frozenset(LISTED)
        print("IMPORTED;", "NATIVE IS THE MEASURED LIST" if same else "NATIVE IS NOT THE MEASURED LIST")
        return 0 if same else 3
    elif name == "trace-kept":
        import math
        math.sqroot(2)  # an AttributeError, uncaught: its trace quotes this line, with carets and a suggestion
    elif name in ("sleep-in-spawn", "posix-spawn-in-spawn"):
        act = (lambda: time.sleep(0.001)) if name == "sleep-in-spawn" else (
            lambda: _after_popen("os.posix_spawn", lambda w: (w[0], w, None)))  # raised by hand: absent from os on Windows
        print("SPAWNED", _within_spawn(repo, work, act))
    elif name.endswith("-in-spawn"):  # the four creations that the G2 refuses, raised by hand on the thread that spawns
        act = {"create-before-popen-in-spawn": lambda: sys.audit("_winapi.CreateProcess", None, "x", None),
               "create-twice-in-spawn": lambda: _after_popen("_winapi.CreateProcess", lambda w: (None, "x", None), 2),
               "create-with-a-program-in-spawn": lambda: _after_popen("_winapi.CreateProcess", lambda w: ("x.exe", "x", None)),
               "posix-spawn-other-argv-in-spawn": lambda: _after_popen("os.posix_spawn", lambda w: (w[0], w[:1], None))}[name]
        print("SPAWNED", _within_spawn(repo, work, act))
    elif name == "sleep-outside-spawn":
        time.sleep(0.001)
        print("SLEPT")
    elif name == "posix-spawn-outside-spawn":
        sys.audit("os.posix_spawn", sys.executable, [sys.executable], None)
        print("PASSED")
    elif name == "spawn-event-of-another-thread":
        go, done, box = threading.Event(), threading.Event(), []

        def other():  # an event of the spawn class, raised by hand on a thread that does not spawn, while the main thread spawns
            go.wait(30)
            sys.audit("_posixsubprocess.fork_exec", "raised by hand")
            box.append("passed")
            done.set()
        _other_thread(repo, work, other)
        _within_spawn(repo, work, lambda: (go.set(), done.wait(30)))
        print("ANOTHER THREAD PASSED" if box else "NOT PASSED")
    elif name == "read-of-another-thread":
        _roles("registry")
        inside, done, box, calls, real = threading.Event(), threading.Event(), [], [], os.path.realpath

        def other():  # opens the file that the main thread reads through io_guard.read, at that moment
            inside.wait(30)
            try:
                with open(f_txt, "rb") as fh:
                    box.append(fh.read())
            finally:
                done.set()

        def held(p, *a, **k):  # the main thread held inside the guard's judgment of its own open, the mark of the read set
            r = real(p, *a, **k)
            if threading.current_thread() is threading.main_thread() and os.path.basename(r) == "f.txt":
                calls.append(r)
                if len(calls) == 2:
                    inside.set()
                    done.wait(30)
            return r
        _other_thread(repo, work, other)
        os.path.realpath = held
        try:
            io_guard.read("registry", f_txt)
        finally:
            os.path.realpath = real
        print("ANOTHER THREAD READ" if box else "NOT READ")
    elif name in ("git-tree-without-role", "git-tree-other-repository", "git-tree-relative-repository"):
        _roles("libm") if name == "git-tree-without-role" else _roles("libm", "tool-tree")
        where = (repo if name == "git-tree-without-role" else os.path.join(repo, "tools") if name == "git-tree-other-repository"
                 else os.path.relpath(repo))  # relative to the working directory, which this child shares with the parent
        entries = _tree(where, "HEAD")[1]
        print("READ", "blobs" if entries else "nothing")
    elif name == "git-tree-only-the-tool-tree":
        _roles("libm", "tool-tree")
        try:  # README.md is a path for the guard before N-5, a revision for this one
            named = [p for _, p, _ in io_guard.git_tree(repo, "README.md")[1] if not p.startswith(TREE + "/")]
        except subprocess.CalledProcessError:
            named = []
        own = _tree(repo, "HEAD")[1]
        ok = own != [] and all(p.startswith(TREE + "/") for _, p, _ in own) and named == []
        print("ONLY THE TOOL'S TREE" if ok else f"READ OUTSIDE THE TOOL'S TREE: {named[:3]}")
        return 0 if ok else 3
    elif name == "git-no-lazy-fetch":  # the partial clone that the parent made: every blob is missing there
        _roles("engine-test-source")
        partial, spec = os.path.join(work, "partial"), f"HEAD:{TREE}/io_guard.py"
        try:
            io_guard.git_show("engine-test-source", partial, spec)
            print("FETCHED from the promisor")
        except subprocess.CalledProcessError:
            try:
                io_guard._git(partial, "cat-file", "-e", spec)
                print("NOT FETCHED, YET PRESENT")
            except subprocess.CalledProcessError:
                print("NOT FETCHED, STILL MISSING")
    elif name == "ntfs-stream":
        with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "io_guard.py") + "::$DATA", "rb") as fh:
            print("READ", len(fh.read()), "bytes through a stream name")
    elif name in ("second-tree-read", "second-tree-output", "third-tree-read"):
        tools = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
        if name == "second-tree-read":
            for act in (lambda: os.listdir(os.path.join(tools, "kata-quarter")), lambda: open(os.path.join(tools, "kata-quarter", "x.py"))):
                try:
                    act()
                except FileNotFoundError:
                    pass
            print("ADMITTED: a listing and a read under the second tree, absent or not")
        elif name == "second-tree-output":
            io_guard.output(os.path.join(tools, "kata-quarter", "out"))
            print("OUTPUT ACCEPTED")
        else:
            open(os.path.join(tools, "kata-third", "x.py"))
            print("READ UNDER A THIRD TREE")
    elif name == "served-history-declared":
        io_guard.declare("served-history")
        print("DECLARED")
    elif name == "child-flags":  # this child, as every case, started by io_guard.run_tool: its flags in effect, its interpreter options
        at = [i for i, p in enumerate(sys.path) if os.path.realpath(p or os.curdir) == os.path.dirname(os.path.realpath(__file__))]
        print(f"-E {sys.flags.ignore_environment} -S {sys.flags.no_site} -s {sys.flags.no_user_site}, options "
              f"{' '.join(sys.orig_argv[1:len(sys.orig_argv) - len(sys.argv)])}, site {'loaded' if 'site' in sys.modules else 'absent'}, "
              f"tool folder {'last' if at == [len(sys.path) - 1] else f'at {at} of {len(sys.path)}'}")
    elif name == "site-absent":  # run by _launch from the copy under the form: neither site nor a sitecustomize ran before io_guard
        print("SITE NOT RUN" if not {"site", "sitecustomize"} & set(sys.modules) else f"RAN: {sorted({'site', 'sitecustomize'} & set(sys.modules))}")
    elif name == "residual-builtin-through-importlib":
        mod = _built_in()
        importlib.import_module(mod)
        print("LOADED WITHOUT AN EVENT:", mod)
    elif name == "residual-stat":
        print("STAT WITHOUT AN EVENT:", os.stat(f_txt).st_size, "bytes of a file outside the inputs and outputs of this child")
    elif name == "residual-mkfifo":
        if not hasattr(os, "mkfifo"):
            print("ABSENT ON THIS SYSTEM")
        else:
            os.mkfifo(os.path.join(work, "fifo"))
            print("MADE WITHOUT AN EVENT, outside the outputs of this child")
    elif name in OPENS:  # IO-GUARD-POSED-FILES-1, a child of a copy (_posed): after the hook, an open under one of its trees
        read, tree, fifo = OPENS[name]
        d = os.path.dirname(os.path.realpath(__file__))
        d = os.path.join(os.path.dirname(d), "kata-quarter") if tree == "second" else d
        if read:  # a listed file of the second tree, admitted; its line, on fd 2 (unbuffered), survives the refusal that follows
            with open(os.path.join(d, "quarter_counts.py"), "rb") as fh:
                os.write(2, b"LISTED FILE READ: %d bytes\n" % len(fh.read()))
        if fifo is None:
            open(d)  # the folder itself; admitted, the open raises (IsADirectoryError; PermissionError under Windows)
        else:  # a name posed after the check of the lists, with no event (residual-mkfifo); a FIFO opens at once with no writer
            os.mkfifo(os.path.join(d, fifo))
            os.close(os.open(os.path.join(d, fifo), os.O_RDONLY | os.O_NONBLOCK))
        print("OPENED")
    elif name == "extension from the folder":  # the import event of an extension module from the tool's folder, raised by hand
        ext = os.path.join(os.path.dirname(os.path.realpath(__file__)), "_json" + importlib.machinery.EXTENSION_SUFFIXES[0])
        sys.audit("import", "_json", ext, sys.path, sys.meta_path, sys.path_hooks)
        print("IMPORTED FROM THE TOOL'S FOLDER")
    elif name == "one guard per process":  # another entry script imported: its prologue finds io_guard loaded, so the guard runs once
        guard = sys.modules["io_guard"]
        import report  # noqa: F401
        print("ONE GUARD" if sys.modules["io_guard"] is guard else "A SECOND GUARD")
    elif name != "noop":
        print("unknown case", name)
        return 2
    return 0


def main(repo, work, out_path):
    io_guard.output(work)
    io_guard.output(out_path)
    os.makedirs(os.path.join(work, "native"))
    with open(os.path.join(work, "f.txt"), "w", encoding="ascii", newline="\n") as fh:
        fh.write("a file that this run wrote\n")
    ext, src = _extension(LISTED)
    if ext is not None:  # a listed extension module, copied outside the standard library
        with open(src, "rb") as fh:
            data = fh.read()
        with open(os.path.join(work, "native", os.path.basename(src)), "wb") as fh:
            fh.write(data)
    # the partial clone of the case git-no-lazy-fetch, every blob left at its promisor (the filter allowed to the serving upload-pack,
    # which a local clone does not hand the client's -c); made by io_guard's own spawn of git, no other program may start (G2)
    io_guard._git(work, "clone", "-q", "--no-local", "--filter=blob:none", "--no-checkout", "--upload-pack",
                  "git -c uploadpack.allowFilter=true upload-pack", repo, os.path.join(work, "partial"))
    copy, here = os.path.join(work, "copy", "kata-recalc"), os.path.dirname(os.path.realpath(__file__))
    for d in (copy, os.path.join(work, "pythonpath")):  # for _launch: a copy of the tool's tree, and a directory on PYTHONPATH
        os.makedirs(d)
    with open(os.path.join(work, "pythonpath", "sitecustomize.py"), "w", encoding="ascii") as fh:  # none in the copy: posed file
        fh.write("print('SITECUSTOMIZE RAN')\n")
    open(os.path.join(work, "link-probe"), "w").close()
    try:  # whether this host lets this run make a symbolic link (Windows: a privilege), which the cases of links need
        links = os.symlink(os.path.join(work, "link-probe"),  # winlint-ok: refused under Windows without the privilege, caught
                           os.path.join(work, "link-probe-link")) is None
    except OSError:
        links = False
    for n in os.listdir(here):
        with open(os.path.join(here, n), "rb") as fh, open(os.path.join(copy, n), "wb") as to:
            to.write(fh.read())
    lines = [MODEL, "# guard_check.py - self-tests of io_guard.py (frozen-tool lot): each case a child, its exit code and its text"]
    try:
        far = not os.path.relpath(repo)
    except ValueError:  # Windows: a working directory on another drive than the repository
        far = True
    absent = {"import-extension-outside-stdlib": ext is None, "import-extension-outside-list": _extension(OUTSIDE)[0] is None,
              "import-builtin-outside-list": _built_in() is None, "residual-builtin-through-importlib": _built_in() is None,
              "git-tree-relative-repository": far, "ntfs-stream": os.name != "nt",
              "first tree name under the second tree": not FIFO, "listed name a link": not links}
    why = {"first tree name under the second tree": WHY["a FIFO"], "listed name a link": WHY["a link"]}  # the new cases' own reasons
    bad = 0
    for name, want, text in CASES:
        if absent.get(name):
            lines.append(f"SKIP {name}: no subject here "
                         f"({why.get(name, 'none of the modules that the case names, or the working directory on another drive')})")
            continue
        runs, note = _posed(name, text, repo, work, links) if isinstance(text, list) else ([(
            _launch(name[7:], repo, work) if name.startswith("launch ") else
            io_guard.run_tool("guard_check.py", ["--case", name, repo, work]), [text] if isinstance(text, str) else text)], "")
        outs = [((p.stdout + p.stderr).decode("utf-8", "replace").replace("\r\n", "\n").strip(), p.returncode, t) for p, t in runs]
        ok = all(c == want and all(x in o for x in t) and "WITNESS" not in o for o, c, t in outs)  # each launch, and no witness ran
        bad += not ok
        lines.append(f"{'OK  ' if ok else 'FAIL'} {name}: exit {','.join(str(c) for _, c, _ in outs)} (want {want}){note}: "
                     f"{' | '.join(o.split(chr(10))[-1][:150] for o, _, _ in outs)}")
    # MONARK's closed list (ecace80): the import refuses a module of the second tree named as one of the first; here the function that it
    # runs, on two directories of this run. Reddened by: the homonyms not computed (the guard before the G2), or a name missed
    a, b = (os.path.join(work, "trees", n) for n in ("first", "second"))
    for d, names in ((a, ("kata_lib.py", "io_guard.py")), (b, ("kata_lib.py", "quarter_counts.py"))):
        os.makedirs(d)
        for n in names:
            open(os.path.join(d, n), "w").close()
    got = getattr(io_guard, "homonyms", lambda *_: None)(a, b)
    bad += got != ["kata_lib"]
    lines.append(f"{'OK  ' if got == ['kata_lib'] else 'FAIL'} homonyms of two trees: {got} (want ['kata_lib'])")
    lines.append(f"cases {len(CASES)} and the homonyms, skipped {sum(map(bool, absent.values()))}, failures {bad}")
    lines.append(f"VERDICT: {'GREEN' if bad == 0 else 'RED'}")
    text = "\n".join(lines) + "\n"
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(text, end="")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    if sys.argv[1:2] == ["--case"] and len(sys.argv) == 5:
        sys.exit(case(sys.argv[2], *(os.path.abspath(a) for a in sys.argv[3:5])))
    if len(sys.argv) != 4:
        print("usage: python -E -S -s -B -P guard_check.py <repository> <work dir> <out.txt>")
        sys.exit(2)
    sys.exit(main(*(os.path.abspath(a) for a in sys.argv[1:4])))  # B-2: every path the guard judges is absolute
