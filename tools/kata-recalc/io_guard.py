# claude-opus-5-5 - 2026-10-06 - lot 1d of VERIFIERS-LIST-F5A-1 (M-7), Python 3.14 standard library only, no network. Changes
# judged and outputs new since 2026-10-07 (MONARK's decision on lot 1d); every event classed, every path absolute and the busy flag
# per thread since the G2 of RECHERCHES (3719b88: B-1, B-2, N-1, N-2). Lot 1e (2026-10-07, M-11): _wmi.exec_query classed (refused),
# git_tree, which reads the commit and the blobs of the tool's tree for the report (not an input, not noted), and a bytecode cache
# refused at import. Frozen-tool lot (2026-10-07, RECHERCHES' reviews of #214 and #217, MONARK's decision): the import event judged
# against the closed list NATIVE (A-1); os.posix_spawn and time.sleep in the spawn class (A-2); the spawning and reading states per
# thread (N-2); the limits of the events named below (N-4); git_tree held to the tool's tree, its repository and a role (N-5). Its G2:
# git runs with GIT_NO_LAZY_FETCH (IO-GUARD-PARTIAL-CLONE-1), a named stream of an NTFS file is refused, a spawn starts one process,
# once, after its judged Popen, on its thread, with its argv under POSIX (unpinned under Windows: IO-GUARD-CREATE-CMDLINE-1), a virtual
# environment is refused; then MONARK's closed list of two trees (ecace80), the role served-history (26ae460) and the launch form FORM.
# The input guard of the tool (G0 docs/G0-lot-verifiers-list-f5a-1.md section 3.1; RECHERCHES Q-V1, precision 2: the independence is
# written, and proved by the list of the inputs read with their sha256). Every entry script runs it FIRST, by its path: it installs an
# audit hook (sys.addaudithook) before any input is read. EVENTS classes every audit event name, and a name outside it stops the run:
# judged (open, os.listdir, os.scandir, the changes of _CHANGES, subprocess.Popen, the creations of _CREATE, import), admitted with its
# reason, admitted only on the thread where io_guard itself spawns git or a script of the tool, or refused. Every path judged is
# absolute (the entry scripts pass their arguments through os.path.abspath), but for a pseudo-file name in angle brackets that no file
# bears. Admitted without a note: the standard library (stdlib, platstdlib and DLLs under sys.base_prefix, never site-packages), the
# trees of code TREES (read only, a listed file or an absent path), the directories of the import path (listing only), and, under an output,
# the files this run writes; an output is absent or an empty directory when it is declared, so nothing under it holds a byte that this
# run did not write. A change touches outputs only, and what it moves, links or copies from is a file this run wrote or a directory it
# made. An import is judged: a built-in module by its name, an extension module (.pyd, .so: its load raises import with its file, never
# open) by its file, under the standard library only, and by its name; NATIVE closes the native modules that may load
# after the hook. A source or bytecode file is judged by its own open. An input is read only through read() or git_show(), under a role
# of the closed list ROLES that the entry script declares; each one is noted (role, base name, sha256, bytes) and inputs() lists them.
# Any other event stops the run at once: one line on stderr, then os._exit(REFUSED_EXIT), which no except clause catches. Limit (G0
# section 3.1, item IO-GUARD-NATIVE-READS-1, widened by the frozen-tool lot to the writes, spawns and network of native code): native
# code acts without the events of Python. NATIVE closes the native modules that load after the hook; what remains is the native code
# admitted, that of NATIVE and of the modules loaded before the hook (the interpreter's start and io_guard's imports; no site under
# FORM), whose functions outside the table raise no event. Measured or read: the stat family reads the metadata of any path; os.mkfifo
# and os.mknod (POSIX, absent on Windows, never called by the tool) make a file outside the outputs; importlib.import_module loads a
# built-in module with no import event; _winapi, loaded before the hook, reads the registry, and os.getlogin the user's name (its G2).
# Nothing that ran before the hook is judged, but the form and the closed lists (FILES), checked first. Paths are compared after realpath
# and normcase. The tool runs under FORM (below), -P in it: the tool's folder last in sys.path. After the hook, a bytecode write is a
# write outside the outputs, and stops the run like any other. An import of io_guard by name writes its cache without -B (lot 1e), which
# a later import would load: a cache in a tree of TREES, or a cache directory set elsewhere, stops the run at import, as does a module of
# the second tree named as one of the first (the first, earlier in sys.path, would mask it), or a virtual environment.
import os
import sys

# MONARK (2026-10-07; CM-5 v6.1): the form of the launch, checked here, before anything is judged or read. Each field of sys.flags
# that an option sets holds its value under FORM (by position, debug to isolated, then safe_path; None: set only by -X, or by the
# locale under POSIX); no -W, no -X (so no -X presite), no debug build (the only one where PYTHON_PRESITE acts). Another launch stops
# here, exit 2, its fields named: it is detected, not prevented (the form itself, written in the replay command, prevents it).
FORM = ("-E", "-S", "-s", "-B", "-P")
_OFF = [f"{n} {v}" for n, v, w in zip(sys.flags.__match_args__, sys.flags, (0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, None, None, None, 1))
        if w is not None and v != w] + [f"-W {w}" for w in sys.warnoptions] + [f"-X {x}" for x in sys._xoptions]
if _OFF or hasattr(sys, "gettotalrefcount"):
    try:
        sys.stderr.write(f"io_guard: refused, a launch under another form than python {' '.join(FORM)}: "
                         f"{', '.join(_OFF + ['a debug build'] * hasattr(sys, 'gettotalrefcount'))}\n")
        sys.stderr.flush()
    finally:
        os._exit(2)

# IO-GUARD-POSED-FILES-1 (MONARK, 2026-10-07): the closed list FILES of the tool's folder, the list file of the second tree when it
# exists, and route 3a, checked after the form and before any other import: a name outside a list (a file, a folder, a link, a cache in
# any case), a listed name not a regular file, or a module of FILES offered by an entry of sys.path before the tool's folder stops the
# launch, exit 4. One folder for them and the guard: that of __file__, resolved, its name not (as _entry), which each prologue appends.
FILES = ("binom_check.py", "binom_exact.py", "compare_check.py", "compare_p2.py", "fdlibm_log.py", "guard_check.py", "io_guard.py",
         "kata_lib.py", "recalc_p2.py", "report.py", "report_check.py", "vectors_check.py")
_HERE = os.path.realpath(os.path.dirname(os.path.abspath(__file__)))
_QUARTER, _NAMES = os.path.join(os.path.dirname(_HERE), "kata-quarter"), ()  # TREES[1] (below) and its list: absent, it needs none


def _closed(names, why):  # names refused before any other import, written on stderr, exit 4 (REFUSED_EXIT, below); none: no refusal
    if names:
        try:
            sys.stderr.write(f"io_guard: refused import {names!r}: {why}\n")
            sys.stderr.flush()
        finally:
            os._exit(4)


_closed(os.path.islink(__file__) and ["io_guard.py"], "a link: io_guard.py is a regular file of the tool's folder, never a link")
_POSED = sorted(set(os.listdir(_HERE)) - set(FILES)) + [
    n for n in FILES if os.path.islink(_p := os.path.join(_HERE, n)) or not os.path.isfile(_p)]
_closed(_POSED, "a name of the tool's folder outside its closed list FILES, or a listed name that is not a regular file")
if os.path.lexists(_QUARTER):  # a dead link there is a link (refusal 2), not an absent tree
    _LIST = os.path.join(_QUARTER, "FILES")
    _closed((os.path.islink(_QUARTER) or not os.path.isdir(_QUARTER)) and _QUARTER, "a second tree that is not a folder (a file or a link)")
    _closed(not os.path.lexists(_LIST) and _LIST, "a second tree without its list file")
    _closed((os.path.islink(_LIST) or not os.path.isfile(_LIST)) and _LIST, "a list file of the second tree that is not a regular file")
    with open(_LIST, "rb") as _fh:
        _raw = _fh.read()
    _NAMES = tuple(_raw.decode("ascii").split("\n")[:-1]) if _raw.isascii() and _raw.endswith(b"\n") else None
    _closed((_NAMES is None or list(_NAMES) != sorted(set(_NAMES)) or any(os.path.basename(n) != n for n in _NAMES)) and _LIST,
            "a list file of the second tree out of its form (ASCII, one name per line ended by LF, sorted, each once)")
    _closed(sorted(set(os.listdir(_QUARTER)) - set(_NAMES)), "a name of the second tree outside its list file (that file named in it too)")
    _closed([n for n in _NAMES if os.path.islink(_p := os.path.join(_QUARTER, n)) or not os.path.isfile(_p)],
            "a name of the second tree's list that is not a regular file")
_ELSEWHERE = [n for n in FILES if n != "io_guard.py" and sys.modules["_frozen_importlib_external"].PathFinder.find_spec(
    n[:-3], [p for p in sys.path if os.path.normcase(os.path.realpath(p or os.curdir)) != os.path.normcase(_HERE)])]
_closed(_ELSEWHERE, "offered by an entry of sys.path before the tool's folder")  # route 3a: in an installation, which comes first
import hashlib  # the other imports, after the checks above
import subprocess
import sysconfig
import threading

ROLES = ("series", "recorder", "oracle-output", "spec-vectors", "engine-test-source", "libm", "registry",  # closed, G0 section 3.1
         "tool-tree",  # N-5: git_tree, the tool's own blobs read from git (admitted, never noted)
         "served-history")  # MONARK (26ae460, ecace80): the served history that CM-5 reads, an input noted like any other
REFUSED_EXIT = 4
TREES = ("tools/kata-recalc", "tools/kata-quarter")  # MONARK's closed list (ecace80): the tool's tree, then a second, read only
TREE = TREES[0]  # the tool's tree in its repository (G0 section 3.2)
# A-1: the native modules (built in, or an extension .pyd or .so) that an import may load after the hook, closed. Measured on this host
# (Python 3.14.5, Windows): every import event after the hook in complete runs of every entry script and in the trace of an uncaught
# exception. _ast, _opcode, _suggestions and _tokenize: a trace (ast, dis, tokenize) and inspect; _wmi: platform imports it (its query
# is refused). The others that the tool uses load before the hook. Read in the 3.14 source, not measured: under POSIX, subprocess
# loads _posixsubprocess, select and (through selectors) math before the hook, and the modules imported after it import no other
# native module there (_colorize imports nt on Windows only; platform tries _wmi and goes on without it).
NATIVE = frozenset(("_ast", "_datetime", "_json", "_opcode", "_sre", "_struct", "_suggestions", "_tokenize", "_wmi", "math"))
# File-system changes, as Python 3.14.5 raises them on this host (measured): event -> (paths as (kind, position), dir_fd positions).
# "dst" is a path the event changes; "src" one it moves away, links or copies from. os.replace raises os.rename.
_CHANGES = {
    "os.mkdir": ((("dst", 0),), (2,)), "os.remove": ((("dst", 0),), (1,)), "os.rmdir": ((("dst", 0),), (1,)),
    "os.truncate": ((("dst", 0),), ()), "os.chmod": ((("dst", 0),), (2,)), "os.utime": ((("dst", 0),), (3,)),
    "os.rename": ((("src", 0), ("dst", 1)), (2, 3)), "os.link": ((("src", 0), ("dst", 1)), (2, 3)),
    "os.symlink": ((("src", 0), ("dst", 1)), (2,)), "shutil.rmtree": ((("dst", 0),), (1,)),
    "shutil.copyfile": ((("src", 0), ("dst", 1)), ()), "shutil.copymode": ((("src", 0), ("dst", 1)), ()),
    "shutil.copystat": ((("src", 0), ("dst", 1)), ()), "shutil.copytree": ((("src", 0), ("dst", 1)), ()),
    "shutil.move": ((("src", 0), ("dst", 1)), ()), "_winapi.CopyFile2": ((("src", 0), ("dst", 1)), ()),
}
# Every audit event name, classed (B-1): the 192 names of the Python 3.14 audit events table (docs.python.org, read by MONARK on
# 2026-10-07 at 01:09 UTC) and the 3 that this host raises outside it (_thread.start_joinable_thread, _winapi.CopyFile2, and
# _wmi.exec_query, classed by lot 1e). The admitted and spawn names are those that complete runs of the seven scripts, the smoke tests
# and the probes raised after the hook under Python 3.14.5 (measured, G0 section 14), three that MONARK named, and time.sleep, which
# the spawns of io_guard raise under POSIX (A-2); the creation of a process (_CREATE) is judged. Any other name stops the run,
# whatever its prefix.
_J, _A, _S, _R = "judged", "admitted", "spawn", "refused"
_CREATE = ("_winapi.CreateProcess", "_posixsubprocess.fork_exec", "os.posix_spawn")  # the process that a spawn starts, pinned (its G2)
EVENTS = {
    **dict.fromkeys(("open", "os.listdir", "os.scandir", "subprocess.Popen", "import", *_CHANGES, *_CREATE),
                    (_J, "judged by the rules below")),
    "marshal.loads": (_A, "the bytecode of a standard-library module, read by an import whose file open judged"),
    "compile": (_A, "source compiled by the standard library (namedtuple, the carets of a traceback)"),
    "exec": (_A, "code executed: the modules imported, the classes namedtuple builds"),
    "function.__new__": (_A, "a function built at run time by the standard library"),
    "builtins.id": (_A, "id() of an object (copy.deepcopy): no byte read"),
    "object.__getattr__": (_A, "a restricted attribute read by the standard library (frames and code of a traceback)"),
    "object.__setattr__": (_A, "an attribute set on a class that the standard library builds (enum, typing)"),
    "sys._getframemodulename": (_A, "the module of a caller (namedtuple, enum)"),
    "sys._getframe": (_A, "a caller's frame (warnings); named by MONARK, not seen in the measured runs"),
    "sys.excepthook": (_A, "an uncaught exception printed; the source lines it reads are judged by open"),
    "cpython._PySys_ClearAuditHooks": (_A, "the hooks cleared at exit, after atexit; named by MONARK"),
    **dict.fromkeys(("_winapi.CreatePipe", "msvcrt.open_osfhandle", "msvcrt.get_osfhandle", "_thread.start_joinable_thread"),
                    (_S, "the pipes and reader threads of subprocess.run (measured)")),
    **dict.fromkeys(("_thread.start_new_thread", "_winapi.TerminateProcess", "os.kill"),
                    (_S, "the same on another path, not measured: an older thread call, a timed-out child killed")),
    "time.sleep": (_S, "subprocess under POSIX (A-2, measured by RECHERCHES under Linux, not on this host): the wait for a child "
                       "under a time limit"),
    **dict.fromkeys((
        "socket.__new__", "socket.bind", "socket.connect", "socket.getaddrinfo", "socket.gethostbyaddr", "socket.gethostbyname",
        "socket.gethostname", "socket.getnameinfo", "socket.getservbyname", "socket.getservbyport", "socket.sendmsg", "socket.sendto",
        "socket.sethostname", "http.client.connect", "http.client.send", "ftplib.connect", "ftplib.sendcmd", "imaplib.open",
        "imaplib.send", "poplib.connect", "poplib.putline", "smtplib.connect", "smtplib.send", "urllib.Request", "webbrowser.open",
    ), (_R, "the network: the tool opens no connection")),
    **dict.fromkeys((
        "ctypes.addressof", "ctypes.call_function", "ctypes.cdata", "ctypes.cdata/buffer", "ctypes.create_string_buffer",
        "ctypes.create_unicode_buffer", "ctypes.dlopen", "ctypes.dlsym", "ctypes.dlsym/handle", "ctypes.get_errno",
        "ctypes.get_last_error", "ctypes.memoryview_at", "ctypes.set_errno", "ctypes.set_exception", "ctypes.set_last_error",
        "ctypes.string_at", "ctypes.wstring_at", "ctypes.PyObj_FromPtr", "sqlite3.connect", "sqlite3.connect/handle",
        "sqlite3.enable_load_extension", "sqlite3.load_extension", "os.add_dll_directory",
    ), (_R, "native code that reads without the events of Python (a C library, SQLite)")),
    **dict.fromkeys(("os.exec", "os.spawn", "os.system", "os.startfile", "os.startfile/2", "os.fork", "os.forkpty",
                     "pty.spawn", "os.killpg", "signal.pthread_kill", "_winapi.OpenProcess"),
                    (_R, "another program or process: only io_guard starts one")),
    **dict.fromkeys(("os.chflags", "os.chown", "shutil.chown", "os.getxattr", "os.listxattr", "os.setxattr", "os.removexattr",
                     "os.lockf", "fcntl.fcntl", "fcntl.flock", "fcntl.ioctl", "fcntl.lockf", "msvcrt.locking", "mmap.__new__"),
                    (_R, "file attributes, locks or mappings that the guard does not judge")),
    **dict.fromkeys((
        "_winapi.CreateFile", "_winapi.CreateJunction", "_winapi.CreateNamedPipe", "winreg.ConnectRegistry", "winreg.CreateKey",
        "winreg.DeleteKey", "winreg.DeleteValue", "winreg.DisableReflectionKey", "winreg.EnableReflectionKey", "winreg.EnumKey",
        "winreg.EnumValue", "winreg.ExpandEnvironmentStrings", "winreg.LoadKey", "winreg.OpenKey", "winreg.OpenKey/result",
        "winreg.PyHKEY.Detach", "winreg.QueryInfoKey", "winreg.QueryReflectionKey", "winreg.QueryValue", "winreg.SaveKey",
        "winreg.SetValue",
    ), (_R, "a Windows file, pipe, junction or registry key reached without open")),
    "_wmi.exec_query": (_R, "a WMI query (platform.uname and win32_ver raise it, measured): report.py reads sys.getwindowsversion()"),
    **dict.fromkeys(("os.walk", "os.fwalk", "glob.glob", "glob.glob/2", "pathlib.Path.glob", "pathlib.Path.rglob", "os.listdrives",
                     "os.listmounts", "os.listvolumes", "tempfile.mkdtemp", "tempfile.mkstemp", "shutil.make_archive",
                     "shutil.unpack_archive"), (_R, "a walk, a pattern, a temporary file or an archive: the tool names each path")),
    **dict.fromkeys(("os.chdir", "os.putenv", "os.unsetenv", "resource.prlimit", "resource.setrlimit", "cpython.PyConfig_Set",
                     "setopencodehook", "sys.addaudithook"), (_R, "the directory, environment, limits or hooks of the process")),
    **dict.fromkeys((
        "sys.settrace", "sys.setprofile", "sys.monitoring.register_callback", "sys._current_frames", "sys._current_exceptions",
        "sys.remote_exec", "cpython.remote_debugger_script", "builtins.breakpoint", "pdb.Pdb", "gc.get_objects", "gc.get_referents",
        "gc.get_referrers", "sys.set_asyncgen_hooks_firstiter", "sys.set_asyncgen_hooks_finalizer", "sys.unraisablehook",
    ), (_R, "tracing, debugging or introspection, not used by the tool")),
    **dict.fromkeys(("cpython.run_command", "cpython.run_file", "cpython.run_interactivehook", "cpython.run_module",
                     "cpython.run_startup", "cpython.run_stdin", "cpython.PyInterpreterState_New",
                     "cpython.PyInterpreterState_Clear"), (_R, "the start of an interpreter: before the hook only")),
    **dict.fromkeys(("builtins.input", "builtins.input/result", "pickle.find_class", "marshal.dumps", "marshal.load", "code.__new__",
                     "object.__delattr__", "array.__new__", "ensurepip.bootstrap", "syslog.closelog", "syslog.openlog",
                     "syslog.setlogmask", "syslog.syslog"), (_R, "not raised by the measured runs, and not needed by the tool")),
}
_UNKNOWN = (_R, "a name outside the table of events")
_WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_APPEND | os.O_CREAT | os.O_TRUNC


def _norm(path):
    return os.path.normcase(os.path.realpath(os.fsdecode(path)))


def _entry(path):
    """The path itself, its directory resolved: a change acts on a link, not on what it points to."""
    a = os.path.abspath(os.fsdecode(path))
    return os.path.normcase(os.path.join(os.path.realpath(os.path.dirname(a)), os.path.basename(a)))


def _under(p, root):
    return p == root or p.startswith(root.rstrip(os.sep) + os.sep)


_TOOL_DIR = _HERE  # the one folder (IO-GUARD-POSED-FILES-1, above)
_TOOL = os.path.normcase(_TOOL_DIR)
_TREE_DIRS = (_TOOL_DIR, os.path.join(os.path.dirname(_TOOL_DIR), TREES[1].rsplit("/", 1)[1]))  # the second beside the first, as is
_TREES = tuple(os.path.normcase(d) for d in _TREE_DIRS)  # not resolved: a link there leads to paths that realpath puts elsewhere
_LISTED = frozenset(os.path.normcase(os.path.join(d, n)) for d, ns in zip(_TREE_DIRS, (FILES, _NAMES)) for n in ns)  # each its own list
_PATHS = sysconfig.get_paths()
_STDLIB = tuple({_norm(_PATHS["stdlib"]), _norm(_PATHS["platstdlib"]), _norm(os.path.join(sys.base_prefix, "DLLs"))})
_SITE = tuple({_norm(_PATHS["purelib"]), _norm(_PATHS["platlib"])})
_SEARCH = frozenset(_norm(p or os.curdir) for p in sys.path)  # the import system may list these directories
_state = {"roles": None}
_local = threading.local()  # N-2: the busy flag, the file being read and the spawn under way (armed: its process may start, its G2)
# belong to the thread that set them
_outputs = []
_written = set()
_made = set()
_inputs = set()


def _refuse(event, detail, why):
    try:
        sys.stderr.write(f"io_guard: refused {event} {detail!r}: {why}\n")
        sys.stderr.flush()
    finally:
        os._exit(REFUSED_EXIT)


def _absolute(event, path):
    """B-2: a path relative to an unknown directory (the working one, or a dir_fd that the open event does not carry) is refused."""
    if not os.path.isabs(path):
        _refuse(event, path, "a relative path: every path judged is absolute")


def _writes(mode, flags):
    return (isinstance(mode, str) and any(c in mode for c in "wax+")) or bool((flags or 0) & _WRITE_FLAGS)


def _judge_open(path, mode, flags):
    if path is None or isinstance(path, int):
        return  # a descriptor or a pipe: its file was judged when it was opened
    w = _writes(mode, flags)
    name = os.fsdecode(path)
    if not w and name.startswith("<") and name.endswith(">") and not os.path.lexists(name):
        return  # a pseudo-file (<unknown>) that no file bears: the parser opens it only to quote a line of a traceback (3.14 carets)
    _absolute("open", name)
    p = _norm(name)
    if os.name == "nt" and any(":" in os.path.splitdrive(x)[1] for x in (os.path.normcase(name), p)):  # its G2 (realpath drops ::$DATA)
        _refuse("open", p, "a named stream of an NTFS file: git keeps none, and the tool reads none")
    if getattr(_local, "reading", None) == p and not w:
        return
    if any(_under(p, o) for o in _outputs):
        if w:
            _written.add(p)
            return
        if p in _written:
            return
        _refuse("open", p, "a file under an output that this run has not written")
    if w:
        _refuse("open", p, "a write outside the outputs")
    if p in _LISTED or (any(_under(p, t) for t in _TREES) and not os.path.lexists(p)) or (  # absent: an import's probe of a cache
            any(_under(p, s) for s in _STDLIB) and not any(_under(p, s) for s in _SITE)):
        return
    _refuse("open", p, "neither the standard library, a listed file of the tool's trees or a path absent there, a file this run wrote, "
                       "nor an input read through io_guard")


def _judge_list(event, path):
    if isinstance(path, int):
        return
    name = os.curdir if path is None else os.fsdecode(path)
    _absolute(event, name)
    p = _norm(name)
    if p in _SEARCH or any(_under(p, t) for t in _TREES) or any(_under(p, s) for s in _STDLIB) or any(_under(p, o) for o in _outputs):
        return
    _refuse(event, p, "a directory outside the standard library, the tool's trees, the import path and the outputs")


def _judge_change(event, args):
    kinds, fds = _CHANGES[event]
    if any(i < len(args) and args[i] not in (None, -1) for i in fds):
        _refuse(event, args[:2], "a path relative to a directory descriptor")
    seen = {}
    for kind, i in kinds:
        a = args[i]
        if a is None or isinstance(a, int):
            _refuse(event, a, "a descriptor: the path it changes is unknown")
        a = os.fsdecode(a)
        _absolute(event, a)
        p = _entry(a)
        if not any(_under(p, o) for o in _outputs) and not (event == "os.mkdir" and any(_under(o, p) for o in _outputs)):
            _refuse(event, p, "a change outside the outputs (os.mkdir may also make the directories that lead to an output)")
        if kind == "src" and not (p in _written or p in _made):
            _refuse(event, p, "a source that this run neither wrote nor made")
        seen[kind] = p
    if event == "os.mkdir":
        _made.add(seen["dst"])
    elif event == "os.rename":
        for bag in (_written, _made):
            moved = {x for x in bag if _under(x, seen["src"])}
            bag.difference_update(moved)
            bag.update(seen["dst"] + x[len(seen["src"]):] for x in moved)
    elif event in ("os.link", "_winapi.CopyFile2"):
        _written.add(seen["dst"])  # the bytes of a file this run wrote
    elif event == "os.remove":
        _written.discard(seen["dst"])
    elif event == "os.rmdir":
        _made.discard(seen["dst"])


def _judge_spawn(executable, argv):
    want = getattr(_local, "spawning", None)
    if want is not None and executable in (None, want[0]) and (
            argv == subprocess.list2cmdline(want) if isinstance(argv, str) else list(argv) == want):
        _local.armed = True  # its G2: the process of this Popen may now start, once
        return
    _refuse("subprocess.Popen", argv, "only io_guard starts a program: git show for an input role, or a script of the tool")


def _judge_create(event, args):
    """Its G2: a process starts only once after the judged Popen of a spawn of io_guard, on the thread that spawns. Under POSIX,
    subprocess passes its argument list to os.posix_spawn and to _posixsubprocess.fork_exec (subprocess.py, read; not measured here):
    one argument must be the pinned list. _winapi.CreateProcess gives (application name, command line, directory): the first and the
    last must be None, as io_guard passes them; its command line cannot be pinned, 3.14.5 giving one character for it (measured)."""
    want, armed = getattr(_local, "spawning", None), getattr(_local, "armed", False)
    _local.armed = False
    if want is not None and armed and (args[0] is None and args[2] is None if event == "_winapi.CreateProcess" else
                                       any(isinstance(a, (list, tuple)) and all(isinstance(x, (str, bytes)) for x in a)
                                           and [os.fsdecode(x) for x in a] == want for a in args)):
        return
    _refuse(event, args[:2], "admitted only while io_guard spawns, on the thread that spawns, once after its Popen, with its argv")


def _judge_import(name, path):
    """A-1. path is None for the import of a module not yet loaded: a built-in module (no file) is judged by its name here; a source
    or bytecode file by its own open event; a frozen module is part of the interpreter. path is the file of an extension module that
    loads (.pyd, .so), which raises no open: under the standard library (never site-packages), and in NATIVE (FILES: .py files only)."""
    if path is None:
        if name in sys.builtin_module_names and name not in NATIVE:
            _refuse("import", name, "a built-in module outside the closed list NATIVE")
        return
    path = os.fsdecode(path)
    _absolute("import", path)
    p = _norm(path)
    if not (any(_under(p, s) for s in _STDLIB) and not any(_under(p, s) for s in _SITE)):
        _refuse("import", p, "a native module outside the standard library")
    if name not in NATIVE:
        _refuse("import", name, "a native module outside the closed list NATIVE")


def _hook(event, args):
    if getattr(_local, "busy", False):
        return
    cls, why = EVENTS.get(event, _UNKNOWN)
    if cls == _A or (cls == _S and getattr(_local, "spawning", None) is not None):
        return
    _local.busy = True
    try:
        if cls == _S:
            _refuse(event, args[:1], f"admitted only while io_guard spawns, on the thread that spawns ({why})")
        elif cls == _R:
            _refuse(event, args[:1], why)
        elif event == "open":
            _judge_open(*args[:3])
        elif event in _CHANGES:
            _judge_change(event, args)
        elif event == "subprocess.Popen":
            _judge_spawn(args[0], args[1])
        elif event in _CREATE:
            _judge_create(event, args)
        elif event == "import":
            _judge_import(*args[:2])
        else:
            _judge_list(event, args[0] if args else None)
    except Exception as e:  # a path the guard cannot judge (not a string, say): the run stops, the caller never catches it
        _refuse(event, args[:2], f"not judged ({type(e).__name__})")
    finally:
        _local.busy = False


def declare(*roles):
    """The roles that this entry script reads, a subset of ROLES, declared once before any input."""
    if _state["roles"] is not None or not roles or any(r not in ROLES for r in roles):
        _refuse("declare", roles, f"declared once, from {ROLES}")
    _state["roles"] = frozenset(roles)


def output(path):
    """A file or a directory that this run writes, given as an absolute path, absent or an empty directory when declared, never in the
    tool's tree; the run reads back only the files it wrote there."""
    _absolute("output", os.fsdecode(path))
    p = _norm(path)
    if any(_under(p, t) or _under(t, p) for t in _TREES):
        _refuse("output", p, "an output inside one of the tool's trees, or holding one")
    _outputs.append(p)
    if os.path.lexists(p) and not (os.path.isdir(p) and not os.listdir(p)):
        _refuse("output", p, "an output that already exists and is not an empty directory")


def _role(role):
    if _state["roles"] is None or role not in _state["roles"]:
        _refuse("read", role, f"a role that this script has not declared ({sorted(_state['roles'] or ())})")


def read(role, path):
    """The bytes of one input, read under its declared role and noted."""
    _role(role)
    _local.reading = _norm(path)
    try:
        with open(path, "rb") as fh:
            data = fh.read()
    finally:
        _local.reading = None
    _inputs.add((role, os.path.basename(os.fsdecode(path)), hashlib.sha256(data).hexdigest(), len(data)))
    return data


def _spawn(argv, **kw):
    _local.spawning, _local.armed = list(argv), False
    try:  # input=b"": an empty stdin pipe; subprocess.DEVNULL would open os.devnull, a relative path on Windows (nul), B-2
        return subprocess.run(argv, input=b"", capture_output=True, **kw)
    finally:
        _local.spawning, _local.armed = None, False


def _git(repo, *args):
    """git with args in the repository repo, without the caller's GIT_* variables and offline; its standard output."""
    env = {k: v for k, v in os.environ.items() if not k.upper().startswith("GIT_")}
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_NO_LAZY_FETCH"] = "1"  # its G2: a partial clone never fetches a missing object from its promisor (git.html of 2.55.0)
    return _spawn(["git", "--no-replace-objects", "-C", os.fsdecode(repo), *args], env=env, timeout=60, check=True).stdout


def git_show(role, repo, spec):
    """git show <revision>:<path> in the repository repo, without the caller's GIT_* variables; its output is one noted input."""
    _role(role)
    data = _git(repo, "show", spec)
    _inputs.add((role, spec.rsplit("/", 1)[-1].rsplit(":", 1)[-1], hashlib.sha256(data).hexdigest(), len(data)))
    return data


def git_tree(repo, rev="HEAD"):
    """The commit that rev names in repo, the repository that holds the tool (repo/tools/kata-recalc is the directory it runs from),
    and the entries of the tool's tree TREE at that commit, as (commit, [(mode, path, bytes of a blob or None)]): git rev-parse,
    ls-tree and cat-file only, under the role tool-tree that the script declares (N-5). They name the tool that runs, for the report
    (lot 1e; G0 section 3.2); like the tool's files on disk, they are not inputs of the computation, and they are not noted."""
    _role("tool-tree")
    repo = os.fsdecode(repo)
    _absolute("git_tree", repo)
    if _norm(os.path.join(repo, *TREE.split("/"))) != _TOOL:
        _refuse("git_tree", repo, f"not the repository that holds the tool's tree: {TREE} under it is not the directory that runs")
    commit = _git(repo, "rev-parse", "--verify", "--end-of-options", f"{rev}^{{commit}}").decode("ascii").strip()
    entries = []
    for item in _git(repo, "ls-tree", "-r", "-z", "--full-tree", commit, "--", TREE).split(b"\0"):
        if item:
            meta, path = item.split(b"\t", 1)
            mode, kind, obj = meta.decode("ascii").split(" ")
            entries.append((mode, path.decode("utf-8"), _git(repo, "cat-file", "blob", obj) if kind == "blob" else None))
    return commit, entries


def run_tool(script, args):
    """A script of the tool's tree run as a child under FORM, the form of the replay command (MONARK, 2026-10-07): no PYTHON*
    variable, no site and no user site in any child, whatever its parent runs under (measured: under -B alone, a sitecustomize on
    PYTHONPATH ran in the child before io_guard). The child imports io_guard first, which checks its form, and judges its own reads."""
    return _spawn([sys.executable, *FORM, os.path.join(_TOOL_DIR, script)] + list(args), timeout=300)


def inputs():
    """The inputs read so far, one entry per distinct (role, name, sha256, bytes), sorted by role then name."""
    return [{"role": r, "name": n, "sha256": s, "bytes": b} for r, n, s, b in sorted(_inputs)]


def input_lines():
    return [f"input {d['role']} {d['name']} sha256 {d['sha256']} bytes {d['bytes']}" for d in inputs()]


def homonyms(first, second):
    """The names that the directory second offers to an import by bare name and that the directory first holds too (ecace80)."""
    names = [{n.split(".", 1)[0] for n in os.listdir(d)} if os.path.isdir(d) else set() for d in (first, second)]
    return sorted(names[0] & names[1])


_cached = [d for d in _TREE_DIRS if os.path.lexists(os.path.join(d, "__pycache__"))]  # no event below: before the hook
if sys.prefix != sys.base_prefix:  # its G2: under a virtual environment, sysconfig names the environment's own Lib as the stdlib
    _refuse("import", sys.prefix, "a virtual environment: run the base interpreter")
if sys.pycache_prefix is not None or _cached:
    _refuse("import", _cached or sys.pycache_prefix, "a bytecode cache in a tree of the tool, or a cache directory: remove it, run -B")
if homonyms(*_TREE_DIRS):
    _refuse("import", homonyms(*_TREE_DIRS), f"a module of {TREES[1]} named as one of {TREES[0]}, which the first tree would mask")
sys.addaudithook(_hook)
