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
# Each case names the change of the guard that reddens it; the same script, run against the guard of 09f49fc2, is its red proof
# (against the guard before its G2 for the cases of the G2, and that of mission 4 for the launches). No input is read: the files of
# the cases are written by the parent, under its work directory, and so are the partial clone and the copy of the tool's tree.
# Usage: python -E -S -s -B guard_check.py <repository> <work dir> <out.txt>
#        python -E -S -s -B guard_check.py --case <name> <repository> <work dir>   (one case, as the first form runs it)
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
CASES = (  # name, exit and text wanted from the child
    # A-1, reddened by: the import event admitted again (the guard of 09f49fc2), or a built-in module's name not judged
    ("import-builtin-outside-list", 4, "a built-in module outside the closed list NATIVE"),
    # A-1, reddened by: the import event admitted again, or the name of an extension module not judged
    ("import-extension-outside-list", 4, "a native module outside the closed list NATIVE"),
    # A-1, reddened by: the file of an extension module not judged (a listed name loaded from a copy outside the standard library)
    ("import-extension-outside-stdlib", 4, "a native module outside the standard library and the tool's tree"),
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
    # MONARK's form of the replay command (2026-10-07), reddened by: a child of io_guard.run_tool started without -E, -S or -s, as
    # before it (a sitecustomize on PYTHONPATH, the user site, or site and the files it runs, ran in the child before io_guard: measured)
    ("child-flags", 0, "-E 1 -S 1 -s 1, options -E -S -s -B, site absent"),
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
    # MONARK (2026-10-07): the form of the launch, checked by io_guard at its import (_launch). Reddened by: site, or a sitecustomize
    # beside the scripts or on PYTHONPATH, run under the form; the check of the field named, of -W, of -X or of a debug build removed
    ("launch form", 0, "SITE NOT RUN"), ("launch -S -s -B", 2, "ignore_environment 0"), ("launch -E -s -B", 2, "no_site 0"),
    ("launch -E -S -B", 2, "no_user_site 0"), ("launch -E -S -s -B -O", 2, "optimize 1"), ("launch -E -S -s -B -i", 2, "inspect 1"),
    ("launch -E -S -s -B -P", 2, "safe_path True"), ("launch -E -S -s -B -d", 2, "debug 1"), ("launch -E -S -s -B -v", 2, "verbose 1"),
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
    """A launch from main()'s copy of the tool's tree, a sitecustomize.py in it and in a directory on PYTHONPATH: under the form, an
    entry script of the copy; else -c imports io_guard from the copy, first on sys.path (not the working directory, whose io_guard an
    import without -B would cache; under -P no entry script finds it); "debug build": the form, sys.gettotalrefcount set first."""
    copy, form = os.path.join(work, "copy", "kata-recalc"), getattr(io_guard, "FORM", ("-E", "-s", "-B"))  # mission 4's: red proof only
    code = f"import sys; {'sys.gettotalrefcount = int; ' * (opts == 'debug build')}sys.path.insert(0, {copy!r}); import io_guard"
    tail = [os.path.join(copy, "guard_check.py"), "--case", "site-absent", repo, work] if opts == "form" else ["-c", code]
    return io_guard._spawn([sys.executable, *(form if opts in ("form", "debug build") else opts.split()), *tail],
                           env=dict(os.environ, PYTHONPATH=os.path.join(work, "pythonpath")), timeout=60)


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
        print(f"-E {sys.flags.ignore_environment} -S {sys.flags.no_site} -s {sys.flags.no_user_site}, options "
              f"{' '.join(sys.orig_argv[1:len(sys.orig_argv) - len(sys.argv)])}, site {'loaded' if 'site' in sys.modules else 'absent'}")
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
        with open(os.path.join(d, "sitecustomize.py"), "w", encoding="ascii") as fh:
            fh.write("print('SITECUSTOMIZE RAN')\n")
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
              "git-tree-relative-repository": far, "ntfs-stream": os.name != "nt"}
    bad = 0
    for name, want, text in CASES:
        if absent.get(name):
            lines.append(f"SKIP {name}: no subject here (none of the modules that the case names, or the working directory on "
                         "another drive)")
            continue
        p = (_launch(name[7:], repo, work) if name.startswith("launch ") else
             io_guard.run_tool("guard_check.py", ["--case", name, repo, work]))
        out = (p.stdout + p.stderr).decode("utf-8", "replace").replace("\r\n", "\n").strip()
        ok = p.returncode == want and text in out
        bad += not ok
        lines.append(f"{'OK  ' if ok else 'FAIL'} {name}: exit {p.returncode} (want {want}): {out.split(chr(10))[-1][:150]}")
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
        print("usage: python -E -S -s -B guard_check.py <repository> <work dir> <out.txt>")
        sys.exit(2)
    sys.exit(main(*(os.path.abspath(a) for a in sys.argv[1:4])))  # B-2: every path the guard judges is absolute
