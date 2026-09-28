#!/usr/bin/env node
// scripts/lot/retire.mjs -- retire merged worktrees (ADR-METHODE-2 D7, line M-8)
// Usage: node scripts/lot/retire.mjs --repo <repo> --trunk <branch> [--dry-run] [--only <path>]
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { realpathSync, statSync } from 'node:fs';
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

// file identity (dev, ino) read by stat, never a spelling: native, UNC, subst, junction and \\?\ paths of one directory agree (C-G2-24)
function fileId(p) { try { const s = statSync(p, { bigint: true }); return `${s.dev}:${s.ino}`; } catch { return null; } } // null: stat failed
function sameDir(a, b) { return a !== null && a === b; } // two identities: equal and non-null
// inner is the directory outerId or lies under it: the parents of its spelling, then of its physical path (a junction may lead into a subdirectory)
function within(inner, outerId) { let real = null; try { real = realpathSync.native(inner); } catch { /* missing or EPERM: the spelling alone */ } return climb(inner, outerId) || (real !== null && climb(real, outerId)); }
function climb(p, outerId) { return sameDir(fileId(p), outerId) || (path.dirname(p) !== p && climb(path.dirname(p), outerId)); } // p, then its parents up to the root (fixed point of path.dirname)
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
  const repoArg = path.resolve(args.repo); // git runs there (-C): never removed
  const onlyId = args.only ? fileId(path.resolve(args.only)) : null; // --only by identity: an alias selects the worktree it names
  if (!fileId(repoArg) || !fileId(process.cwd())) throw new Error('--repo or cwd without file identity (stat failed): nothing done');
  if ([repoArg, process.cwd()].some((p) => /^[\\/]{2}/.test(realpathSync.native(p)))) throw new Error('UNC cwd or --repo: local drive paths only');
  const list = git(args.repo, ['worktree', 'list', '--porcelain']);
  if (list.error || list.status !== 0) {
    console.error(`git worktree list failed: ${list.stderr}`);
    process.exitCode = 2;
    return;
  }
  const entries = parsePorcelain(list.stdout);
  const [main, ...rest] = entries; // first block = the main worktree, never touched
  const mainId = fileId(main.path); if (!mainId) throw new Error(`main worktree ${main.path} without file identity (stat failed): nothing done`);
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
    const wtId = fileId(wt.path); // null: the registered path is missing or unreadable (EPERM...)
    if (args.only && onlyId !== wtId) continue; // a target without identity selects the entries without one only: never retired (below)
    // (d) under the repo tree, by identity (an ancestor of the registered path is the main worktree): never removed by this tool, orchestrator action only
    if (within(wt.path, mainId)) {
      console.log(`REFUSE-IN-TREE ${wt.path}`);
      refused++;
      continue;
    }
    // the worktree this script is running from (cwd or --repo is it or lies under it, by identity): never removed
    if (within(process.cwd(), wtId) || within(repoArg, wtId)) {
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
    if (wtId === null) { console.log(`KEEP ${wt.path} unreadable`); kept++; hadError = true; continue; } // no identity, not prunable (locked, EPERM): fail-closed per path, exit 2 at the end
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
