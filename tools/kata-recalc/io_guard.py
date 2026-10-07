# claude-opus-5-5 - 2026-10-06 - lot 1d of VERIFIERS-LIST-F5A-1 (M-7), Python 3.14 standard library only, no network. Changes
# judged and outputs new since 2026-10-07 (MONARK's decision on lot 1d).
# The input guard of the tool (G0 docs/G0-lot-verifiers-list-f5a-1.md section 3.1; RECHERCHES Q-V1, precision 2: the independence is
# written, and proved by the list of the inputs read with their sha256). Every entry script imports it FIRST: the import installs an
# audit hook (sys.addaudithook) before any input is read. The hook judges each open, os.listdir, os.scandir and subprocess.Popen event,
# and each file-system change of _CHANGES. Admitted without a note: the standard library (stdlib, platstdlib and DLLs under
# sys.base_prefix, never site-packages), the tool's own tree (read only), the directories of the import path (listing only), and,
# under an output, the files this run writes; an output is absent or an empty directory when it is declared, so nothing under it holds
# a byte that this run did not write. A change touches outputs only; what it moves, links or copies from is a file this run wrote, a
# directory it made, or an input it read. An input is read only through read() or git_show(), under a role of the closed list ROLES
# that the entry script declares; each one is noted (role, base name, sha256, bytes) and inputs() lists them. Anything else stops the
# run at once: one line on stderr, then os._exit(REFUSED_EXIT), which no except clause catches. The other ways to start a program, to
# load a C library through ctypes or to open a connection stop it too: the tool uses none of them. Limit (G0 section 3.1, item
# IO-GUARD-NATIVE-READS-1): a C extension module that reads files without Python raises no event; the tool imports the standard
# library only. Paths are compared after realpath and normcase. The tool runs under python -B: after the hook, a bytecode write is a
# write outside the outputs, and stops the run like any other.
import hashlib
import os
import subprocess
import sys
import sysconfig

ROLES = ("series", "recorder", "oracle-output", "spec-vectors", "engine-test-source", "libm", "registry")  # closed, G0 section 3.1
REFUSED_EXIT = 4
_REFUSED = frozenset({"os.system", "os.exec", "os.spawn", "os.posix_spawn", "os.startfile", "ctypes.dlopen", "socket.connect",
                      "urllib.Request"})
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
_JUDGED = frozenset({"open", "os.listdir", "os.scandir", "subprocess.Popen"}) | _REFUSED | frozenset(_CHANGES)
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
_DEVNULL = _norm(os.devnull)  # subprocess.DEVNULL opens it read and write: it holds no byte
_state = {"roles": None, "reading": None, "spawning": None, "busy": False}
_outputs = []
_written = set()
_made = set()
_reads = set()
_inputs = set()


def _refuse(event, detail, why):
    try:
        sys.stderr.write(f"io_guard: refused {event} {detail!r}: {why}\n")
        sys.stderr.flush()
    finally:
        os._exit(REFUSED_EXIT)


def _writes(mode, flags):
    return (isinstance(mode, str) and any(c in mode for c in "wax+")) or bool((flags or 0) & _WRITE_FLAGS)


def _judge_open(path, mode, flags):
    if path is None or isinstance(path, int):
        return  # a descriptor or a pipe: its file was judged when it was opened
    w = _writes(mode, flags)
    name = os.fsdecode(path)
    if not w and name.startswith("<") and name.endswith(">") and not os.path.lexists(name):
        return  # a pseudo-file (<unknown>) that no file bears: the parser opens it only to quote a line of a traceback (3.14 carets)
    p = _norm(path)
    if (_state["reading"] == p and not w) or p == _DEVNULL:
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
    p = _norm(os.curdir if path is None else path)
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
        if event == "os.symlink" and kind == "src" and not os.path.isabs(a):
            a = os.path.join(os.path.dirname(os.path.abspath(os.fsdecode(args[1]))), a)  # a link target is relative to the link
        p = _entry(a)
        if not any(_under(p, o) for o in _outputs) and not (event == "os.mkdir" and any(_under(o, p) for o in _outputs)):
            _refuse(event, p, "a change outside the outputs (os.mkdir may also make the directories that lead to an output)")
        if kind == "src" and not (p in _written or p in _made or p in _reads):
            _refuse(event, p, "a source that this run neither wrote, made, nor read through io_guard")
        seen[kind] = p
    if event == "os.mkdir":
        _made.add(seen["dst"])
    elif event == "os.rename":
        for bag in (_written, _made):
            moved = {x for x in bag if _under(x, seen["src"])}
            bag.difference_update(moved)
            bag.update(seen["dst"] + x[len(seen["src"]):] for x in moved)
    elif event in ("os.link", "_winapi.CopyFile2"):
        _written.add(seen["dst"])  # the bytes of a file this run wrote, or of an input it noted
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
    if _state["busy"] or event not in _JUDGED:
        return
    _state["busy"] = True
    try:
        if event in _REFUSED:
            _refuse(event, args[:1], "the tool starts no program this way, loads no C library and opens no connection")
        elif event == "open":
            _judge_open(*args[:3])
        elif event in _CHANGES:
            _judge_change(event, args)
        elif event == "subprocess.Popen":
            _judge_spawn(args[0], args[1])
        else:
            _judge_list(event, args[0] if args else None)
    except Exception as e:  # a path the guard cannot judge (a NUL byte, say): the run stops, the caller never catches it
        _refuse(event, args[:2], f"not judged ({type(e).__name__})")
    finally:
        _state["busy"] = False


def declare(*roles):
    """The roles that this entry script reads, a subset of ROLES, declared once before any input."""
    if _state["roles"] is not None or not roles or any(r not in ROLES for r in roles):
        _refuse("declare", roles, f"declared once, from {ROLES}")
    _state["roles"] = frozenset(roles)


def output(path):
    """A file or a directory that this run writes, absent or an empty directory when declared, never in the tool's tree; the run reads
    back only the files it wrote there."""
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
    _reads.add(_norm(path))
    _inputs.add((role, os.path.basename(os.fsdecode(path)), hashlib.sha256(data).hexdigest(), len(data)))
    return data


def _spawn(argv, **kw):
    _state["spawning"] = list(argv)
    try:
        return subprocess.run(argv, stdin=subprocess.DEVNULL, capture_output=True, **kw)
    finally:
        _state["spawning"] = None


def git_show(role, repo, spec):
    """git show <revision>:<path> in the repository repo, without the caller's GIT_* variables; its output is one noted input."""
    _role(role)
    env = {k: v for k, v in os.environ.items() if not k.upper().startswith("GIT_")}
    env["GIT_TERMINAL_PROMPT"] = "0"
    data = _spawn(["git", "--no-replace-objects", "-C", os.fsdecode(repo), "show", spec], env=env, timeout=60, check=True).stdout
    _inputs.add((role, spec.rsplit("/", 1)[-1].rsplit(":", 1)[-1], hashlib.sha256(data).hexdigest(), len(data)))
    return data


def run_tool(script, args):
    """A script of the tool's tree run as a child under python -B; the child imports io_guard first and judges its own reads."""
    return _spawn([sys.executable, "-B", os.path.join(_TOOL_DIR, script)] + list(args), timeout=300)


def inputs():
    """The inputs read so far, one entry per distinct (role, name, sha256, bytes), sorted by role then name."""
    return [{"role": r, "name": n, "sha256": s, "bytes": b} for r, n, s, b in sorted(_inputs)]


def input_lines():
    return [f"input {d['role']} {d['name']} sha256 {d['sha256']} bytes {d['bytes']}" for d in inputs()]


sys.addaudithook(_hook)
