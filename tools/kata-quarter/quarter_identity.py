# claude-opus-5-5 - 2026-10-15 - the identity of the quarter counts tool, tools/kata-quarter/ (CM-5, docs/G0-lot-cm5-c1d.md), Python 3.14
# standard library only, no network; a sibling module of quarter_counts.py, no block __main__. In the run, under the role tool-tree that
# each subcommand declares: the commit that io_guard.git_tree names (HEAD of the repository that holds both trees), then the regular
# files of each tree on disk (os.listdir, their bytes read) held to the blobs of that commit: tools/kata-recalc/ to the entries that
# git_tree returns, tools/kata-quarter/ to the list of git show <commit>:tools/kata-quarter and to each <commit>:tools/kata-quarter/<name>
# (io_guard.git_show, which notes each one as an input under tool-tree). A file more, a file less or a byte changed is a named refusal
# (Refused, exit 2); no option skips it. Each tree is named by the sha256 of its lines "<sha256>  <name>" sorted (report.tree_digest).
import hashlib
import os
import subprocess

import io_guard  # already in sys.modules: the entry ran io_guard.py by its path first
import quarter_load as Q

HERE = os.path.dirname(os.path.realpath(__file__))
FROZEN = os.path.dirname(os.path.realpath(io_guard.__file__))
REPO = os.path.dirname(os.path.dirname(FROZEN))  # the repository whose tools/kata-recalc runs: git_tree refuses any other


def running(folder):
    """The regular files of folder, no link and no directory: name -> bytes."""
    files = {}
    for name in sorted(os.listdir(folder)):
        if os.path.isfile(p := os.path.join(folder, name)) and not os.path.islink(p):
            with open(p, "rb") as fh:
                files[name] = fh.read()
    return files


def held(tree, files, committed):
    """The digest of tree when its files on disk are its blobs at the commit, else a named refusal."""
    if files != committed:
        diff = sorted(set(files) ^ set(committed)) + sorted(n for n in files if n in committed and files[n] != committed[n])
        raise Q.Refused(f"{tree} is not the tree of the commit that git_tree names: {diff} (a file more, a file less or a byte "
                        "changed): commit the tool, then run it")
    return hashlib.sha256("".join(f"{hashlib.sha256(b).hexdigest()}  {n}\n" for n, b in sorted(files.items())).encode("ascii")).hexdigest()


def tool_identity():
    """(commit, digest of tools/kata-recalc, manifest of tools/kata-quarter) of the tool that runs, or a named refusal."""
    root = io_guard.TREES[1]
    try:
        commit, entries = io_guard.git_tree(REPO)
        names = io_guard.git_show("tool-tree", REPO, f"{commit}:{root}").decode("utf-8").split("\n")[2:-1]  # after "tree <spec>", ""
        quarter = {n: io_guard.git_show("tool-tree", REPO, f"{commit}:{root}/{n}") for n in names}  # a folder ends with "/"
    except subprocess.CalledProcessError as e:
        raise Q.Refused(f"git could not name the tool's commit or read its blobs in {REPO} (exit {e.returncode})")
    frozen = {p[len(io_guard.TREE) + 1:]: b if m == "100644" else None for m, p, b in entries}  # a link or a folder: never a file's bytes
    return commit, held(io_guard.TREE, running(FROZEN), frozen), held(root, running(HERE), quarter)
