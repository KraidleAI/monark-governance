# claude-opus-5-5 - 2026-10-06 - lot 1d of VERIFIERS-LIST-F5A-1 (M-7), Python 3.14 standard library only, no network. Changes
# judged and outputs new since 2026-10-07 (MONARK's decision on lot 1d); every event classed, every path absolute and the busy flag
# per thread since the G2 of RECHERCHES (3719b88: B-1, B-2, N-1, N-2). Lot 1e (2026-10-07, M-11): _wmi.exec_query classed (refused),
# git_tree, which reads the commit and the blobs of the tool's tree for the report (not an input, not noted), and a bytecode cache
# refused at import.
# The input guard of the tool (G0 docs/G0-lot-verifiers-list-f5a-1.md section 3.1; RECHERCHES Q-V1, precision 2: the independence is
# written, and proved by the list of the inputs read with their sha256). Every entry script imports it FIRST: the import installs an
# audit hook (sys.addaudithook) before any input is read. EVENTS classes every audit event name, and a name outside it stops the run:
# judged (open, os.listdir, os.scandir, the changes of _CHANGES, subprocess.Popen), admitted with its reason, admitted only while
# io_guard itself spawns git or a script of the tool, or refused. Every path judged is absolute (the entry scripts pass their
# arguments through os.path.abspath), but for a pseudo-file name in angle brackets that no file bears. Admitted without a note: the
# standard library (stdlib, platstdlib and DLLs under sys.base_prefix, never site-packages), the tool's own tree (read only), the
# directories of the import path (listing only), and, under an output, the files this run writes; an output is absent or an empty
# directory when it is declared, so nothing under it holds a byte that this run did not write. A change touches outputs only, and
# what it moves, links or copies from is a file this run wrote or a directory it made. An input is read only through read() or
# git_show(), under a role of the closed list ROLES that the entry script declares; each one is noted (role, base name, sha256, bytes)
# and inputs() lists them. Anything else stops the run at once: one line on stderr, then os._exit(REFUSED_EXIT), which no except clause
# catches. Limit (G0 section 3.1, item IO-GUARD-NATIVE-READS-1): a C extension module that reads files without Python raises no event;
# the tool imports the standard library only. Paths are compared after realpath and normcase. The tool runs under python -B: after the
# hook, a bytecode write is a write outside the outputs, and stops the run like any other. Before it, the import of io_guard itself
# writes __pycache__/io_guard.cpython-314.pyc when -B is missing (measured, lot 1e), and a later run would load a cached file whose
# recorded source time and size match: a cache in the tool's tree, or a cache directory set elsewhere, stops the run at import.
import hashlib
import os
import subprocess
import sys
import sysconfig
import threading

ROLES = ("series", "recorder", "oracle-output", "spec-vectors", "engine-test-source", "libm", "registry")  # closed, G0 section 3.1
REFUSED_EXIT = 4
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
# and the probes raised after the hook under Python 3.14.5 (measured, G0 section 14), and three that MONARK named. Any other name
# stops the run, whatever its prefix.
_J, _A, _S, _R = "judged", "admitted", "spawn", "refused"
EVENTS = {
    **dict.fromkeys(("open", "os.listdir", "os.scandir", "subprocess.Popen", *_CHANGES), (_J, "judged by the rules below")),
    "import": (_A, "an import: the module's file is judged by its own open event"),
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
    **dict.fromkeys(("_winapi.CreatePipe", "_winapi.CreateProcess", "msvcrt.open_osfhandle", "msvcrt.get_osfhandle",
                     "_thread.start_joinable_thread"), (_S, "the pipes, process and reader threads of subprocess.run (measured)")),
    **dict.fromkeys(("_thread.start_new_thread", "_winapi.TerminateProcess", "os.kill", "_posixsubprocess.fork_exec"),
                    (_S, "the same on another path, not measured: an older thread call, a timed-out child killed, a POSIX spawn")),
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
    **dict.fromkeys(("os.exec", "os.spawn", "os.system", "os.startfile", "os.startfile/2", "os.posix_spawn", "os.fork", "os.forkpty",
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
                     "object.__delattr__", "array.__new__", "ensurepip.bootstrap", "time.sleep", "syslog.closelog", "syslog.openlog",
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


_TOOL_DIR = os.path.dirname(os.path.realpath(__file__))
_TOOL = os.path.normcase(_TOOL_DIR)
_PATHS = sysconfig.get_paths()
_STDLIB = tuple({_norm(_PATHS["stdlib"]), _norm(_PATHS["platstdlib"]), _norm(os.path.join(sys.base_prefix, "DLLs"))})
_SITE = tuple({_norm(_PATHS["purelib"]), _norm(_PATHS["platlib"])})
_SEARCH = frozenset(_norm(p or os.curdir) for p in sys.path)  # the import system may list these directories
_state = {"roles": None, "reading": None, "spawning": None}
_local = threading.local()  # N-2: the busy flag marks the judging thread only
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
    if _state["reading"] == p and not w:
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
    if _under(p, _TOOL) or (any(_under(p, s) for s in _STDLIB) and not any(_under(p, s) for s in _SITE)):
        return
    _refuse("open", p, "neither the standard library, the tool's tree, a file this run wrote, nor an input read through io_guard")


def _judge_list(event, path):
    if isinstance(path, int):
        return
    name = os.curdir if path is None else os.fsdecode(path)
    _absolute(event, name)
    p = _norm(name)
    if p in _SEARCH or _under(p, _TOOL) or any(_under(p, s) for s in _STDLIB) or any(_under(p, o) for o in _outputs):
        return
    _refuse(event, p, "a directory outside the standard library, the tool's tree, the import path and the outputs")


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
    want = _state["spawning"]
    if want is not None and executable in (None, want[0]) and (
            argv == subprocess.list2cmdline(want) if isinstance(argv, str) else list(argv) == want):
        return
    _refuse("subprocess.Popen", argv, "only io_guard starts a program: git show for an input role, or a script of the tool")


def _hook(event, args):
    if getattr(_local, "busy", False):
        return
    cls, why = EVENTS.get(event, _UNKNOWN)
    if cls == _A or (cls == _S and _state["spawning"] is not None):
        return
    _local.busy = True
    try:
        if cls == _S:
            _refuse(event, args[:1], f"admitted only while io_guard spawns ({why})")
        elif cls == _R:
            _refuse(event, args[:1], why)
        elif event == "open":
            _judge_open(*args[:3])
        elif event in _CHANGES:
            _judge_change(event, args)
        elif event == "subprocess.Popen":
            _judge_spawn(args[0], args[1])
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
    if _under(p, _TOOL) or _under(_TOOL, p):
        _refuse("output", p, "an output inside the tool's tree, or holding it")
    _outputs.append(p)
    if os.path.lexists(p) and not (os.path.isdir(p) and not os.listdir(p)):
        _refuse("output", p, "an output that already exists and is not an empty directory")


def _role(role):
    if _state["roles"] is None or role not in _state["roles"]:
        _refuse("read", role, f"a role that this script has not declared ({sorted(_state['roles'] or ())})")


def read(role, path):
    """The bytes of one input, read under its declared role and noted."""
    _role(role)
    _state["reading"] = _norm(path)
    try:
        with open(path, "rb") as fh:
            data = fh.read()
    finally:
        _state["reading"] = None
    _inputs.add((role, os.path.basename(os.fsdecode(path)), hashlib.sha256(data).hexdigest(), len(data)))
    return data


def _spawn(argv, **kw):
    _state["spawning"] = list(argv)
    try:  # input=b"": an empty stdin pipe; subprocess.DEVNULL would open os.devnull, a relative path on Windows (nul), B-2
        return subprocess.run(argv, input=b"", capture_output=True, **kw)
    finally:
        _state["spawning"] = None


def _git(repo, *args):
    """git with args in the repository repo, without the caller's GIT_* variables; its standard output."""
    env = {k: v for k, v in os.environ.items() if not k.upper().startswith("GIT_")}
    env["GIT_TERMINAL_PROMPT"] = "0"
    return _spawn(["git", "--no-replace-objects", "-C", os.fsdecode(repo), *args], env=env, timeout=60, check=True).stdout


def git_show(role, repo, spec):
    """git show <revision>:<path> in the repository repo, without the caller's GIT_* variables; its output is one noted input."""
    _role(role)
    data = _git(repo, "show", spec)
    _inputs.add((role, spec.rsplit("/", 1)[-1].rsplit(":", 1)[-1], hashlib.sha256(data).hexdigest(), len(data)))
    return data


def git_tree(repo, rel, rev="HEAD"):
    """The commit that rev names in the repository repo, and the entries under rel at that commit, as (commit, [(mode, path, bytes of
    a blob or None)]): git rev-parse, ls-tree and cat-file only. They name the tool that runs, for the report (lot 1e; G0 section
    3.2); they are not inputs of the computation, and they are not noted."""
    commit = _git(repo, "rev-parse", "--verify", "--end-of-options", f"{rev}^{{commit}}").decode("ascii").strip()
    entries = []
    for item in _git(repo, "ls-tree", "-r", "-z", "--full-tree", commit, "--", rel).split(b"\0"):
        if item:
            meta, path = item.split(b"\t", 1)
            mode, kind, obj = meta.decode("ascii").split(" ")
            entries.append((mode, path.decode("utf-8"), _git(repo, "cat-file", "blob", obj) if kind == "blob" else None))
    return commit, entries


def run_tool(script, args):
    """A script of the tool's tree run as a child under python -B; the child imports io_guard first and judges its own reads."""
    return _spawn([sys.executable, "-B", os.path.join(_TOOL_DIR, script)] + list(args), timeout=300)


def inputs():
    """The inputs read so far, one entry per distinct (role, name, sha256, bytes), sorted by role then name."""
    return [{"role": r, "name": n, "sha256": s, "bytes": b} for r, n, s, b in sorted(_inputs)]


def input_lines():
    return [f"input {d['role']} {d['name']} sha256 {d['sha256']} bytes {d['bytes']}" for d in inputs()]


if sys.pycache_prefix is not None or os.path.lexists(os.path.join(_TOOL_DIR, "__pycache__")):  # no event: before the hook
    _refuse("import", _TOOL_DIR, "a bytecode cache in the tool's tree, or a cache directory: remove it, and run under python -B")
sys.addaudithook(_hook)
