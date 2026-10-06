#!/usr/bin/env node
// scripts/lot/retire.mjs -- retire merged worktrees (ADR-METHODE-2 D7, line M-8)
// Usage: node scripts/lot/retire.mjs --repo <repo> --trunk <branch> [--dry-run] [--only <path>]
import path from 'node:path';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ageDaysOf, git, mergedBranches, parseArgs, parsePorcelain } from './ages.mjs'; // one worktree reader for both tools (C-G2-15)

// file identity (dev, ino) read by stat, never a spelling: native, UNC, subst, junction and \\?\ paths of one directory agree (C-G2-24)
export function fileId(p) { try { const s = statSync(p, { bigint: true }); return `${s.dev}:${s.ino}`; } catch { return null; } } // null: stat failed
function sameDir(a, b) { return a !== null && a === b; } // two identities: equal and non-null
// inner is the directory outerId or lies under it: the parents of its spelling, then of its physical path (a junction may lead into a subdirectory)
function within(inner, outerId) { let real = null; try { real = realpathSync.native(inner); } catch { /* missing or EPERM: the spelling alone */ } return climb(inner, outerId) || (real !== null && climb(real, outerId)); }
function climb(p, outerId) { return sameDir(fileId(p), outerId) || (path.dirname(p) !== p && climb(path.dirname(p), outerId)); } // p, then its parents up to the root (fixed point of path.dirname)

function main() {
  const args = parseArgs(process.argv.slice(2), { '--dry-run': 'dryRun' }, ['--only']);
  const repoArg = path.resolve(args.repo); // git runs there (-C): never removed
  const onlyId = args.only ? fileId(path.resolve(args.only)) : null; // --only by identity: an alias selects the worktree it names
  const repoId = fileId(repoArg); if (!repoId || !fileId(process.cwd())) throw new Error('--repo or cwd without file identity (stat failed): nothing done');
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
  const origin = git(args.repo, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']); // the default branch: origin/HEAD, else main
  const guarded = new Map([[origin.status === 0 ? origin.stdout.trim().replace(/^origin\//, '') : 'main', 'default-branch'], [args.trunk, 'trunk']]);
  const now = Math.floor(Date.now() / 1000);

  let retired = 0;
  let kept = 0;
  let refused = 0;
  let hadError = false;
  let refusedBranch = 0, partial = 0, offvolume = 0;

  for (const wt of rest) {
    const wtId = fileId(wt.path); // null: the registered path is missing or unreadable (EPERM...)
    if (args.only && onlyId !== wtId) continue; // a target without identity selects the entries without one only: never retired (below)
    if (wtId !== null && wtId.split(':')[0] !== repoId.split(':')[0]) offvolume++; // stat dev of another volume than --repo (C-V-5, METHODE-M8-ALIAS-VOLUMES-1)
    const age = args.dryRun ? ` age=${ageDaysOf(args.repo, wt.head, now)?.toFixed(1).concat('d') ?? 'n/a'}` : ''; // dry-run: each line carries the age ages.mjs reads (METHODE-M8-AGES-WIRE-1)
    // C-G2-9: never the default branch nor the trunk, whatever its state (dry-run or not, --only or the whole list): REFUSE, exit 2 at the end
    if (guarded.has(wt.branch)) { console.log(`REFUSE${age} ${wt.path} ${guarded.get(wt.branch)}`); refusedBranch++; hadError = true; continue; }
    // (d) under the repo tree, by identity (an ancestor of the registered path is the main worktree): never removed by this tool, orchestrator action only
    if (within(wt.path, mainId)) {
      console.log(`REFUSE-IN-TREE${age} ${wt.path}`);
      refused++;
      continue;
    }
    // the worktree this script runs from (cwd or --repo is it or lies under it, by identity) or holds this script (X6): never removed
    if (within(process.cwd(), wtId) || within(repoArg, wtId) || within(fileURLToPath(import.meta.url), wtId)) {
      console.log(`KEEP${age} ${wt.path} current-worktree`);
      kept++;
      continue;
    }
    // directory vanished from disk: never attempted (Q-M8-2)
    if (wt.prunable) {
      console.log(`KEEP${age} ${wt.path} prunable`);
      kept++;
      continue;
    }
    if (wtId === null) { console.log(`KEEP${age} ${wt.path} unreadable`); kept++; hadError = true; continue; } // no identity, not prunable (locked, EPERM): fail-closed per path, exit 2 at the end
    if (wt.locked) { console.log(`KEEP${age} ${wt.path} locked`); kept++; continue; } // in service (C-G2-10, C-G2-25): the dry-run agrees with git, which never removes a locked one (X2)
    // (a) branch not merged
    if (!wt.detached && !merged.has(wt.branch)) {
      console.log(`KEEP${age} ${wt.path} not-merged`);
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
        console.log(`KEEP${age} ${wt.path} detached-unreachable`);
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
      console.log(`KEEP${age} ${wt.path} dirty`);
      kept++;
      continue;
    }

    // otherwise: RETIRE
    const label = wt.detached ? '(detached)' : wt.branch;
    if (args.dryRun) {
      console.log(`RETIRE${age} ${wt.path} ${label}`); retired++; // M11: each worktree counted once
      continue;
    }
    const rm = git(args.repo, ['worktree', 'remove', wt.path]);
    if (rm.error || rm.status !== 0) {
      console.error(`git worktree remove failed for ${wt.path}: ${rm.stderr}`);
      hadError = true;
      continue;
    }
    if (existsSync(wt.path)) console.log(`RETIRE-RESIDUE ${wt.path}`); // C-G2-11: git left the directory (ignored node_modules junctions, X1); never deleted here
    if (!wt.detached) {
      const br = git(args.repo, ['branch', '-d', wt.branch]);
      if (br.error || br.status !== 0) {
        console.error(`git branch -d failed for ${wt.branch}: ${br.stderr}`);
        console.log(`RETIRE-PARTIAL ${wt.path} ${wt.branch} branch-kept`); // C-G2-12: the worktree is gone, its branch stays
        partial++;
        hadError = true;
        continue;
      }
    }
    console.log(`RETIRE ${wt.path} ${label}`);
    retired++;
  }

  console.log(`retired=${retired} kept=${kept} refused-in-tree=${refused}`);
  console.log(`refused-branch=${refusedBranch} partial=${partial} offvolume=${offvolume}`);
  process.exitCode = hadError ? 2 : 0;
}

try {
  if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(); // imported (the test reads fileId): no side effect
} catch (e) {
  console.error(e.message);
  process.exitCode = 2;
}
