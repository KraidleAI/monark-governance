# RUNBOOK — `@monark/rpc-guard` cycle ledger: repair after a power loss

Scope: the per-operator cycle ledger of `packages/rpc-guard` — `<ledger-dir>/<cycle>/<op>.jsonl` (the chain),
`<op>.head` (the head sidecar), `<op>.lock` (the writer lock). The Bell sink files (`ledger-<MINT>.jsonl`,
`budget.json`, `crosscheck-*.json`) are out of scope (lot BELL-SHORTPAGE-1). Origin: two power cuts on
2026-09-22 (`docs/course-bell/INCIDENT-powercut-2026-09-22.md`), lot GARDE-FSYNC-1 (ADR-GARDE-HELIUS amendment).

Every command below runs with the paid keys REMOVED from the process (CONSIGNE A-7):

```
U="env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY"
```

## 1. Fault model (declared)

| Fault | What survives | State after it (GARDE-FSYNC-1 code) | Recovery |
|---|---|---|---|
| Process crash (exception, kill, SIGKILL) | the OS write cache | head at most ONE entry behind the chain; lock held by a dead pid | next open heals the head; `unlock` (served) |
| Power loss | only what was flushed (fsync) | the line being appended when the power went (its request was NOT sent: the transport runs only after the append returns) may be a NUL run or a torn line; head equal or ONE behind; an orphan `<op>.head.tmp` | open heals / removes the orphan; a NUL tail is repaired by `repair-tail` (§3); a torn line is manual (§4) |
| Lying device (acknowledges a flush it does not perform: volatile write cache without power-loss protection) | undefined | anything | out of reach of software: the chain replay and the head sidecar DETECT (fail-closed); lost data is not recoverable; §4 + reconcile against the dashboard |

Before GARDE-FSYNC-1 (code up to `66f75c2`) nothing was flushed: cut #1 (~20:32 UTC) left 211 008 NUL bytes after
9 460 lines and a head AHEAD of the chain (~420 sent requests lost from the ledger); cut #2 (~21:37 UTC) left
13 776 NUL bytes and a head of 64 NUL bytes (an in-place rewrite whose size reached the disk, not its data).

Residual, declared: the parent DIRECTORY is not flushed after the head rename or after the first creation of
`<op>.jsonl`. A power loss can therefore lose a rename (the head goes back one entry: healed) or, in theory, several
(head more than one entry behind: `tail_truncation`, §4). Formed item in the ADR amendment (measured: a directory
flush is possible on win32 with flag `"r+"`, see §2).

## 2. Measured Windows facts (node v24.15.0, libuv 1.51.0, win32, NTFS volume `F:`, 2026-09-22)

- `fsyncSync` on a file descriptor is `FlushFileBuffers` (libuv `src/win/fs.c` `fs__sync_impl`); append + fsync p50 1.2 ms
  (isolated). One durable `appendChained` (line + head.tmp + rename) on a 10 866-line ledger: p50 8.6-10.1 ms, mean
  14-24 ms, p99 0.12-0.42 s on the shared machine (pre-GARDE-FSYNC-1 path: mean 0.22-0.33 ms). The append is
  synchronous: it holds the event loop that long (cost verdicts per course: ADR amendment GARDE-FSYNC-1, C-10).
- Directory flush: `openSync(dir, "r")` + `fsyncSync` => EPERM; `openSync(dir, "r+")` + `fsyncSync` => OK (p50 0.105 ms).
  Its durability effect on NTFS is NOT verified (no power-fault rig). Not used by this lot.
- Head replace (`<op>.head.tmp` + fsync + rename). `fs.renameSync` is `MoveFileExW(MOVEFILE_REPLACE_EXISTING)` alone
  (libuv 1.51.0 `fs.c:2266-2267`; `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md` §2-§4): no write-through, so
  the PERSISTENCE of the rename is not guaranteed — after a cut the head is the old OR the new complete file, never a
  torn one (the tmp was fsynced first); a head one entry behind is healed at the next open. While ANOTHER process holds
  the head open, the rename fails EPERM (452 of 2000 without retry). The code retries with waits of min(10 x k, 100) ms
  while the cumulated wait stays <= 3 000 ms (35 attempts), then stops FAIL-CLOSED with a named error
  (`rename of '<op>.head.tmp' refused 35 times over 2950 ms ...; no in-place fallback`): the line is durable, the head
  keeps its previous value (one entry behind, healed at the next open), the request is NOT sent. Measured with a retry:
  0 of 2000 failed (at most 5 retries). A reader never saw a torn head (0 of 153 714 reads). **Do not keep the live
  `<op>.head` / `<op>.jsonl` open while a course runs** (read a copy): a reader holding it longer than 3 s stops the course.
- Lock: `openSync(<op>.lock, "wx")` is exclusive (second open => EEXIST); its `{pid, iso}` is fsynced before close.
- `writeFileSync`/`appendFileSync` with `{encoding: "utf8", flush: true}`: the flush is silently dropped (p50 0.064 ms
  vs 1.358 ms without `encoding`) — never rely on `flush: true`; the package uses open / write / fsync / close.
- CI runs `ubuntu-latest` only: none of these win32 facts is exercised by CI.

## 3. Procedure A — served repair (`repair-tail`)

Use it for a ledger written by GARDE-FSYNC-1 code. It changes NO byte when it refuses.

0. Stop the course. Note the time: `date -u +%Y-%m-%dT%H:%M:%SZ`.
1. Off-ledger backup + sha (INCIDENT §2.1): copy `<op>.jsonl`, `<op>.head`, `<op>.lock` into a dated folder outside
   the ledger dir; `sha256sum * > SHA256SUMS.txt`.
2. Run the served subcommand:
   ```
   $U node packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir <ledger-dir> --floor 0 repair-tail --cycle <cycle> --op <label> --reason "<why, date -u>"
   ```
   - `REPAIRED nul_bytes_removed=<n> head_action=none|heal_penultimate`, exit 0.
   - `REFUSED <token>`, exit 1, nothing written (table below).
   - any other error: exit 2, message on stderr.
3. On `REPAIRED`, the tool has: written `<op>.jsonl.bak` and `<op>.head.bak` (the damaged bytes, created exclusive,
   fsynced, never overwritten); truncated ONLY the NUL tail (ftruncate + fsync); healed a head one entry behind
   (tmp + fsync + rename) if `heal_penultimate`; re-opened the pair through `openOperatorLedger`; appended one record to
   `<op>.repair.jsonl` (`iso, pid, cycle, op, reason, sha_before{jsonl,head}, sha_after{jsonl,head},
   nul_bytes_removed, lines_after, head_after, bak_path{jsonl,head}, bak_sha256{jsonl,head}, head_action`).
   Check: `sha256sum <op>.jsonl` == `sha_after.jsonl`.
4. Lock: if the dead writer's lock is present, the tool left it; release it with the served, ledgered unlock:
   ```
   $U node packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir <ledger-dir> --floor 0 unlock --cycle <cycle> --op <label> --reason "after repair-tail, <date -u>"
   ```
   (exit 0, one chained `unlocked` line). With no lock present, `repair-tail` took and released it itself.
5. Anchor (course anchors, if any) and journal: the record line + the backup folder's `SHA256SUMS.txt`.
6. Reconcile: the next `reconcile` of this operator answers `NO-GO repaired_in_window` (the repair journal is its
   input): the orchestrator reads the dashboard and decides; that reconcile appends `reconciled`, which closes the window.

| Token | Meaning | Next step |
|---|---|---|
| `ledger_absent` | no `<op>.jsonl` in `<ledger-dir>/<cycle>` | check the path |
| `head_absent` | `<op>.head` missing (also after a cut on the very FIRST append) | §4 — kept refused by design (a deleted head + a truncation would pass) |
| `lock_unreadable` | the lock's `{pid}` never reached the disk | make sure no process runs, then §4 |
| `writer_alive` | a process with the lock's pid exists (EPERM counts as existing) | stop the writer; if the pid was reused after the reboot, §4 |
| `no_nul_tail` | nothing to strip | the damage is elsewhere: §4 |
| `torn_tail` | a partial line before the NUL bytes | §4 |
| `malformed_line` / `chain_broken` | damage INSIDE the durable part | §4 + investigate (not a power-cut signature) |
| `tail_truncation` | after the strip the head is neither the recomputed head nor its penultimate: a head AHEAD (a truncation signature — never produced by a cut since GARDE-FSYNC-1), a NUL-filled head (pre-lot in-place write), or a head more than one entry behind | §4 + investigation; the served tool NEVER rewrites such a head |
| `bak_exists` | an earlier repair's `.bak` is present | move both `.bak` files (with their sha) to the backup folder, rerun |

Interrupted repair (a `.bak` present, no record): compare `sha256sum <op>.jsonl` with the `.bak`. Equal: nothing was
truncated — move the `.bak` files away and rerun. Different: the truncation happened — verify by §4 step 2 and journal.

## 4. Procedure B — manual repair (pre-GARDE-FSYNC-1 ledgers and every refusal above)

This is the INCIDENT §2 procedure, an orchestrator act, journaled.

1. Backups + `SHA256SUMS.txt` (as §3.1), for the ledger AND the head AND the lock.
2. Assess on a COPY: count the trailing NUL bytes; check that the byte before them is `\n`; parse every line and
   replay the chain (each `prev_entry_sha256` = previous `entry_sha256`, each `entry_sha256` recomputed —
   `verifyCycleLedger` of the package does both).
3. Truncate to the last complete, verified line (never rewrite a durable line).
4. Rewrite `<op>.head` = `entry_sha256` of the last durable entry. This is the step the served tool never does for a
   head ahead or a NUL head: here lines were lost AFTER their request was sent, so the ledger UNDER-counts — write the
   estimate (bytes lost / bytes per line) in the journal for the reconcile.
5. Served `unlock` for every operator whose lock is held (exit 0 each).
6. Anchor + journal (INCIDENT): sha before/after, bytes removed, lines, last entry, old/new head, accounting consequence.
7. Relaunch.

## 5. Accounting after a repair

The ledger counts REQUESTS written ahead of the transport. A repair by §3 removes at most the line that was being
appended when the power went: its request had not been sent, so the ledger stays an upper bound. A repair by §4 of a
pre-GARDE-FSYNC-1 ledger may remove lines whose request WAS sent: the ledger under-counts and the reconcile hard bound
`Delta_dashboard <= ledger_run` can go NO-GO (expected; the dashboard is the source of truth). In both cases the first
reconcile after a `repair-tail` is `NO-GO repaired_in_window` until the orchestrator has read the dashboard.
