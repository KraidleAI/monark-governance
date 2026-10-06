#!/usr/bin/env node
// scripts/lot/ages.mjs -- worktree ages at the check-in point (ADR-METHODE-2 D7, lines M-8, M-8b); the one worktree reader of retire.mjs (C-G2-15)
// Usage: node scripts/lot/ages.mjs --repo <repo> --trunk <branch> [--json]
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// flags: the caller's own ({ '--json': 'json' }); --repo, --trunk and the caller's values take the next argument, never one starting with -- (C-G2-21)
export function parseArgs(argv, flags, values = []) {
  const out = { repo: null, trunk: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (Object.hasOwn(flags, a)) out[flags[a]] = true;
    else if (['--repo', '--trunk', ...values].includes(a) && argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!out.repo || !out.trunk) throw new Error('--repo and --trunk are required');
  return out;
}

export function git(cwdRepo, args) {
  const r = spawnSync('git', ['-C', cwdRepo, ...args], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
}

export function parsePorcelain(text) {
  const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split(/\r?\n/);
    const entry = { path: null, head: null, branch: null, detached: false, prunable: false, locked: false };
    for (const line of lines) {
      if (line.startsWith('worktree ')) entry.path = line.slice('worktree '.length);
      else if (line.startsWith('HEAD ')) entry.head = line.slice('HEAD '.length);
      else if (line.startsWith('branch refs/heads/')) entry.branch = line.slice('branch refs/heads/'.length);
      else if (line === 'detached') entry.detached = true;
      else if (line.startsWith('prunable')) entry.prunable = true;
      else if (line.startsWith('locked')) entry.locked = true; // `git worktree lock [--reason]`: in service (Q-G2-2, C-G2-10)
    }
    return entry;
  });
}

export function mergedBranches(repo, trunk) {
  const r = git(repo, ['branch', '--merged', trunk]);
  if (r.error || r.status !== 0) throw new Error(`git branch --merged failed: ${r.stderr}`);
  const set = new Set();
  for (const raw of r.stdout.split(/\r?\n/)) {
    const line = raw.replace(/^[*+ ]\s*/, '').trim();
    if (line) set.add(line);
  }
  return set;
}

// days from the committer date of head to now (seconds), null when git cannot read it (C-G2-5)
export function ageDaysOf(repo, head, now) {
  const log = git(repo, ['log', '-1', '--format=%ct', head]);
  const ts = log.error || log.status !== 0 ? null : parseInt(log.stdout.trim(), 10);
  return ts !== null && Number.isFinite(ts) ? (now - ts) / 86400 : null;
}

function main() {
  const args = parseArgs(process.argv.slice(2), { '--json': 'json' });
  const list = git(args.repo, ['worktree', 'list', '--porcelain']);
  if (list.error || list.status !== 0) {
    console.error(`git worktree list failed: ${list.stderr}`);
    process.exitCode = 2;
    return;
  }
  const entries = parsePorcelain(list.stdout).slice(1); // skip the main worktree
  const merged = mergedBranches(args.repo, args.trunk);
  const now = Math.floor(Date.now() / 1000);

  const rows = entries.map((wt) => {
    const st = git(wt.path, ['status', '--porcelain']);
    const dirty = st.error || st.status !== 0 ? null : st.stdout.trim() !== '';
    const ageDays = ageDaysOf(args.repo, wt.head, now);
    return {
      path: wt.path,
      branch: wt.detached ? null : wt.branch,
      merged: wt.detached ? null : merged.has(wt.branch),
      dirty,
      ageDays,
    };
  });

  rows.sort((a, b) => (b.ageDays ?? -1) - (a.ageDays ?? -1));

  if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    for (const r of rows) {
      const age = r.ageDays !== null ? r.ageDays.toFixed(1) : 'n/a';
      const mergedLabel = r.merged === null ? 'detached' : r.merged ? 'merged' : 'unmerged';
      const dirtyLabel = r.dirty === null ? 'n/a' : r.dirty ? 'dirty' : 'clean';
      console.log(`${age.padStart(7)}d  ${mergedLabel}  ${dirtyLabel}  ${r.path}  ${r.branch ?? ''}`);
    }
  }
}

try {
  if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(); // imported by retire.mjs: no side effect
} catch (e) {
  console.error(e.message);
  process.exitCode = 2; // C-G2-16: a failed git read or a bad argument exits 2 with its message, never a stack
}
