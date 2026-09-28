#!/usr/bin/env node
// scripts/lot/retire.mjs -- retire merged worktrees (ADR-METHODE-2 D7, line M-8)
// Usage: node scripts/lot/retire.mjs --repo <repo> --trunk <branch> [--dry-run] [--only <path>]
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { realpathSync } from 'node:fs';
function parseArgs(argv) {
  const out = { repo: null, trunk: null, dryRun: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') out.repo = argv[++i];
    else if (a === '--trunk') out.trunk = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--only' && argv[i + 1]) out.only = argv[++i];
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!out.repo || !out.trunk) throw new Error('--repo and --trunk are required');
  return out;
}

function norm(p) {
  let n = p.replace(/\\/g, '/');
  if (process.platform === 'win32') n = n.toLowerCase();
  return n;
}

function git(cwdRepo, args) {
  const r = spawnSync('git', ['-C', cwdRepo, ...args], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
}

function parsePorcelain(text) {
  const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split(/\r?\n/);
    const entry = { path: null, head: null, branch: null, detached: false, prunable: false };
    for (const line of lines) {
      if (line.startsWith('worktree ')) entry.path = line.slice('worktree '.length);
      else if (line.startsWith('HEAD ')) entry.head = line.slice('HEAD '.length);
      else if (line.startsWith('branch refs/heads/')) entry.branch = line.slice('branch refs/heads/'.length);
      else if (line === 'detached') entry.detached = true;
      else if (line.startsWith('prunable')) entry.prunable = true;
    }
    return entry;
  });
}

function mergedBranches(repo, trunk) {
  const r = git(repo, ['branch', '--merged', trunk]);
  if (r.error || r.status !== 0) throw new Error(`git branch --merged failed: ${r.stderr}`);
  const set = new Set();
  for (const raw of r.stdout.split(/\r?\n/)) {
    const line = raw.replace(/^[*+ ]\s*/, '').trim();
    if (line) set.add(line);
  }
  return set;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const argNorm = norm(realpathSync.native(path.resolve(args.repo))) + '/'; // git runs there (-C): never removed
  const onlyNorm = args.only ? norm(path.resolve(args.only)) : null;
  const cwdNorm = norm(realpathSync.native(process.cwd())) + '/'; // physical path: junction and symlink aliases resolved
  if ([argNorm, cwdNorm].some((p) => p.startsWith('//'))) throw new Error('UNC cwd or --repo: local drive paths only');
  const list = git(args.repo, ['worktree', 'list', '--porcelain']);
  if (list.error || list.status !== 0) {
    console.error(`git worktree list failed: ${list.stderr}`);
    process.exitCode = 2;
    return;
  }
  const entries = parsePorcelain(list.stdout);
  const [main, ...rest] = entries; // first block = the main worktree, never touched

  let merged;
  try {
    merged = mergedBranches(args.repo, args.trunk);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 2;
    return;
  }

  let retired = 0;
  let kept = 0;
  let refused = 0;
  let hadError = false;

  for (const wt of rest) {
    const wtNorm = norm(wt.path);
    if (onlyNorm && wtNorm !== onlyNorm) continue;

    // (d) path under the repo tree: never removed by this tool, orchestrator action only
    if ((wtNorm + '/').startsWith(norm(main.path) + '/')) {
      console.log(`REFUSE-IN-TREE ${wt.path}`);
      refused++;
      continue;
    }
    // the worktree this script is running from: never removed
    if ([cwdNorm, argNorm].some((p) => p.startsWith(wtNorm + '/'))) {
      console.log(`KEEP ${wt.path} current-worktree`);
      kept++;
      continue;
    }
    // directory vanished from disk: never attempted (Q-M8-2)
    if (wt.prunable) {
      console.log(`KEEP ${wt.path} prunable`);
      kept++;
      continue;
    }
    // (a) branch not merged
    if (!wt.detached && !merged.has(wt.branch)) {
      console.log(`KEEP ${wt.path} not-merged`);
      kept++;
      continue;
    }
    // (c) detached HEAD not reachable from the trunk
    if (wt.detached) {
      const anc = git(args.repo, ['merge-base', '--is-ancestor', wt.head, args.trunk]);
      if (anc.error) {
        console.error(`git merge-base failed for ${wt.path}: ${anc.stderr}`);
        hadError = true;
        continue;
      }
      if (anc.status !== 0) {
        console.log(`KEEP ${wt.path} detached-unreachable`);
        kept++;
        continue;
      }
    }
    // (b) dirty worktree (the only remaining per-worktree spawn)
    const st = git(wt.path, ['status', '--porcelain']);
    if (st.error || st.status !== 0) {
      console.error(`git status failed for ${wt.path}: ${st.stderr}`);
      hadError = true;
      continue;
    }
    if (st.stdout.trim() !== '') {
      console.log(`KEEP ${wt.path} dirty`);
      kept++;
      continue;
    }

    // otherwise: RETIRE
    const label = wt.detached ? '(detached)' : wt.branch;
    if (args.dryRun) {
      console.log(`RETIRE ${wt.path} ${label}`);
      retired++;
      continue;
    }
    const rm = git(args.repo, ['worktree', 'remove', wt.path]);
    if (rm.error || rm.status !== 0) {
      console.error(`git worktree remove failed for ${wt.path}: ${rm.stderr}`);
      hadError = true;
      continue;
    }
    if (!wt.detached) {
      const br = git(args.repo, ['branch', '-d', wt.branch]);
      if (br.error || br.status !== 0) {
        console.error(`git branch -d failed for ${wt.branch}: ${br.stderr}`);
        hadError = true;
        continue;
      }
    }
    console.log(`RETIRE ${wt.path} ${label}`);
    retired++;
  }

  console.log(`retired=${retired} kept=${kept} refused-in-tree=${refused}`);
  process.exitCode = hadError ? 2 : 0;
}

try {
  main();
} catch (e) {
  console.error(e.message);
  process.exitCode = 2;
}
