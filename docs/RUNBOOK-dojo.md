# RUNBOOK — MONARK Dojo on the Bell host: the collect side, the rehearsal and the publication side (orchestrator-deployed)

**What.** The collector `apps/dojo/src/collect.ts` runs as the systemd unit `monark-dojo-collect.service`, started every 5 minutes by
`monark-dojo-collect.timer`: each start is one idempotent `--tick` (it closes each ended day, plans the day before 00:15 UTC, reads
each due instant) writing only under `/var/lib/monark-dojo-collect`. This file is written at PR-3b-1 and covers the collect side of
acts A-2 to A-5, the rehearsal (A-7, off the real path since 2026-10-01) with its `Eve` (A-11-rep), the collect side of A-9, the host
rule DOJO-TMP-STRAY-1 (section 8)
and the guard's lock left held (section 9). PR-3b-2 completes it: user `dojo`, publication unit and timer, Caddy, CA, keyring and
anchor (A-1, A-6, A-8, A-10, A-11). PR-3b-2a writes the publication side in sections 10 to 20 (A-2p to A-5p, CA-0, A-8, A-10,
A-11, the publisher's refusals, a key rotation and the page); PR-3b-2b adds CA-1 and TU-7.

**Normative sources.** `docs/adr/ADR-DOJO-PR-3.md` (D-1 table l.64, D-2, D-3 variant A and acts A-1 to A-11, D-4, D-5, section 7,
dated lines of 13:13Z, 14:13Z and 15:00Z); `docs/adr/ADR-DOJO-PR-2.md` (D-1 dated line C-V-2: the closed argv, DOJO-TICK-ARGV-1; D-7
dated line C-V-1: the day layout, DOJO-HANDOFF-LAYOUT-1; dated line 08:28Z); `docs/dojo/FAITS-systemd-timer-2026-09-27.md` (systemd 259
on this host, `*:0/5`, `AccuracySec` default 1 min; FAITS-SYSTEMD-CRED-1; FAITS-SYSTEMD-TIMEOUT-1); `docs/RUNBOOK-sentinel.md`
(l.417-429, the repair after SIGKILL: the precedent of section 9); constants `scripts/dojo-deploy.mjs`; pins `test/dojo-collect-deploy.test.ts`.

**Who and when.** The orchestrator, from its own machine (Git Bash), over SSH to the Bell host with the deploy key
(`ssh -i ~/.ssh/monark_vps root@178.16.131.29`), and **only under the investor's grouped go on the closed list A-1 to A-11**
(ADR D-3, dated line C-V-4). Before the grouped go: FAITS-JOURNALCTL-1 (the message forms of systemd 259 that section 6 counts, read
on this host; dated line 14:13Z, Q-12). At the first host act: DOJO-UNIT-OFFLINE-ORACLE-1. Before A-4: HELIUS-CREDIT-RECONCILE-1.
Before A-5: DOJO-COLLECT-SIGTERM-UNLOCK-1 (carried by DRAND-RELAY-GET-1b: on SIGTERM `collect.ts` releases the locks of the course in
flight, then exits 1; test `dojo_collect_releases_locks_on_sigterm`); `man systemd.exec`
(Credentials, `InaccessiblePaths=`) and `man systemd.service` (`TimeoutStartSec=`) read on this host, to confirm on systemd 259 the
"latest" pages read by the orchestrator for FAITS-SYSTEMD-CRED-1 (14:12:49Z) and FAITS-SYSTEMD-TIMEOUT-1 (14:13:55Z); the start of
section 5 is the empirical proof. Before the collect timer (A-9 (7) on the real path; A-7, off it, before its own timer):
DOJO-DRAND-RELAY-TERMS-1, the lot DRAND-RELAY-GET-1 (1b: the beacon relays through
the guard, labels `drand-pl` and `drand-cf`, cycle `drand-<AAAA-MM-JJ>` of the day, 4 attempts per relay and per day), HELIUS-CREDIT-RECONCILE-1,
QI-5, RPC-GUARD-FIRST-APPEND-HEAD-1 (carried by RPC-GUARD-FIRST-APPEND-1: the genesis head is written before the first line and a head one
entry behind is healed at the open; test `rpc_guard_first_append_crash_is_healed_never_refused`; section 9). Before A-9:
DOJO-OPERATOR-INDEPENDENCE-1 and P-4; no rehearsal criterion and no Bitcoin block (decision of 2026-10-01: FAITS-BTC-BLOCKTIME-1
moves to A-8 (9), after the first publication).

**Conventions.** Each step gives the command, the expected output and the rollback. Commands are ONE line each and carry no shell
state: the G7 SHA is read from `/f/tmp/dojo-dn/G7.txt` (local scratch, outside the repo). **The seeds and the Helius key are never
displayed, and never hashed on screen:** no `cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64` on `/etc/monark/dojo-collect/seed*` or
`/etc/monark/dojo-collect.env`, no `set -x`, no environment dump; a copy is checked by an equality that prints `COPY-EQUAL` or
`COPY-DIFFERENT`, never a digest. The only public values are those `dojo-seed.mjs` prints (`seed_anchor`, `horizon`), the anchor
line and the `Eve`.

---

## 1. Read-only controls (before A-2)

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'hostname; systemctl --version | head -1; node -v; id dojo-collect; getent group dojo-handoff; ls -d /opt/monark-dojo-collect /var/lib/monark-dojo-collect /etc/monark/dojo-collect /etc/monark/dojo /etc/monark/dojo-collect.env; systemctl list-units "monark-*" --all --no-pager'
```

Expected: `bell`; `systemd 259 (259.5-0ubuntu3.4)` (FAITS 08:14Z); `v24.21.0` (RUNBOOK-bell step 1, 2026-09-23: re-measured here,
write it to the JOURNAL); `id: 'dojo-collect': no such user`; no group line; five `No such file or directory`; the Bell and probe
units only (no Dojo unit, FAITS 08:14Z). **STOP** if any Dojo user, group, path or unit exists. Rollback: none (read-only).

## 2. A-2 (collect side) — user, handoff group, directories

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'useradd --system --no-create-home --shell /usr/sbin/nologin dojo-collect && groupadd --system dojo-handoff && install -d -o dojo-collect -g dojo-handoff -m 0750 /var/lib/monark-dojo-collect && install -d -o dojo-collect -g dojo-handoff -m 2750 /var/lib/monark-dojo-collect/bundles && install -d -o dojo-collect -g dojo-collect -m 0700 /var/lib/monark-dojo-collect/ledger && install -d -o root -g root -m 0700 /etc/monark/dojo-collect /etc/monark/dojo && id dojo-collect && stat -c "%a %U:%G %n" /var/lib/monark-dojo-collect /var/lib/monark-dojo-collect/bundles /var/lib/monark-dojo-collect/ledger /etc/monark/dojo-collect /etc/monark/dojo'
```

Expected: `uid=... (dojo-collect) gid=... (dojo-collect)`; `750 dojo-collect:dojo-handoff` (the publication, a member of
`dojo-handoff` added by PR-3b-2, lists the state root and enters `bundles/` only: `ledger/` is 0700); `2750 dojo-collect:dojo-handoff .../bundles`
(setgid: every day directory and file the collector creates there belongs to `dojo-handoff`; under `UMask=0027` the collector opens a
day's `evidence/` and `readings/` 0700 and passes `readings/` to 0750 at the close: no instant of an open day is readable by the
publication, TB-12); `700 dojo-collect:dojo-collect .../ledger` (the guard's ledger and locks; `collect.ts` refuses `state_missing`
without it and never creates it); `700 root:root /etc/monark/dojo-collect` (the sources of the two credentials, seed and anchor,
outside every path the unit can write); `700 root:root /etc/monark/dojo` (the publication's key directory of ADR A-2, empty until
PR-3b-2 fills it at A-4: created here because the collect unit makes it inaccessible, `InaccessiblePaths=` without `-`, and
systemd.exec(5) ignores a missing path only with `-`). No top-level `evidence/`: the evidence lives per day under
`bundles/<d>/evidence/` (ADR-DOJO-PR-2 dated line 08:28Z (2), which supersedes that part of A-2). Rollback (before A-4 only):
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /var/lib/monark-dojo-collect /etc/monark/dojo-collect && rmdir /etc/monark/dojo && userdel dojo-collect && groupdel dojo-handoff'`
(`rmdir`: the key directory is removed only while empty).

## 3. A-3 — the collect tree at G7 and its resolution link

```bash
git -C /f/Monark rev-parse --verify '<G7 merge commit>^{commit}' > /f/tmp/dojo-dn/G7.txt && cat /f/tmp/dojo-dn/G7.txt
```

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" apps/bell/scripts/bell-chain.mjs apps/dojo/package.json apps/dojo/scripts/dojo-core.mjs apps/dojo/scripts/dojo-eve.mjs apps/dojo/scripts/dojo-seed.mjs apps/dojo/src/bundle.ts apps/dojo/src/collect.ts apps/dojo/src/dojo-methods.ts apps/dojo/src/layout.ts apps/dojo/src/reading.ts out/mint.txt packages/rpc-guard/bin/rpc-guard.mjs packages/rpc-guard/package.json packages/rpc-guard/src/bell-methods.ts packages/rpc-guard/src/classify.ts packages/rpc-guard/src/cli.ts packages/rpc-guard/src/client.ts packages/rpc-guard/src/errors.ts packages/rpc-guard/src/guarded.ts packages/rpc-guard/src/index.ts packages/rpc-guard/src/ledger.ts packages/rpc-guard/src/lock.ts packages/rpc-guard/src/reconcile.ts packages/rpc-guard/src/repair.ts packages/rpc-guard/src/tariff.ts packages/rpc-guard/src/transport.ts | tee /f/tmp/dojo-dn/collect-tree.tar.gz | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'install -d -m 0755 -o root -g root /opt/monark-dojo-collect && tar xzf - -C /opt/monark-dojo-collect --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-dojo-collect && find /opt/monark-dojo-collect -type d -exec chmod 0755 {} + && find /opt/monark-dojo-collect -type f -exec chmod 0644 {} + && cd /opt/monark-dojo-collect && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum'
```

```bash
rm -rf /f/tmp/dojo-dn/collect-tree && mkdir -p /f/tmp/dojo-dn/collect-tree && tar xzf /f/tmp/dojo-dn/collect-tree.tar.gz -C /f/tmp/dojo-dn/collect-tree && cd /f/tmp/dojo-dn/collect-tree && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum
```

Expected: 26 remote lines, equal line for line to the 26 local lines of the same archive (the list is `DOJO_COLLECT_TREE_PATHS`: the
import closure of the four programs of `DOJO_COLLECT_TREE_PROGRAMS` (`collect.ts` for the unit, `dojo-seed.mjs` at A-4, `dojo-eve.mjs`
at A-11-rep, the guard's served CLI `packages/rpc-guard/bin/rpc-guard.mjs` at section 9), their package scopes and `out/mint.txt`,
pinned by `dojo_collect_tree_is_the_import_closure`; `.gitattributes` pins `eol=lf`, so the archive carries the G7 blobs). No `npm`
on this host: `@monark/rpc-guard` resolves through one relative link (D-3):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'install -d -m 0755 -o root -g root /opt/monark-dojo-collect/node_modules/@monark && ln -s ../../packages/rpc-guard /opt/monark-dojo-collect/node_modules/@monark/rpc-guard && readlink /opt/monark-dojo-collect/node_modules/@monark/rpc-guard && cd /opt/monark-dojo-collect && node --input-type=module -e "import(\"@monark/rpc-guard\").then((m) => console.log(typeof m.openGuardedClient))"'
```

Expected: `../../packages/rpc-guard`, then `function`. Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /opt/monark-dojo-collect'`.

## 4. A-4 (collect side) — seeds and EnvironmentFile

**Seeds, generated ON the host** (the calque of Bell's key: the secret is born where it is used), root:root 0600, horizon 365 (ADR D-4,
confirmed at the checkpoint-1): `seed` is the credential source the unit loads (the rehearsal seed until A-9), `seed.next` the real
seed waiting for A-9. `dojo-seed.mjs` refuses an existing file and a path inside a code tree, and prints only the public part:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 077 && node /opt/monark-dojo-collect/apps/dojo/scripts/dojo-seed.mjs --init /etc/monark/dojo-collect/seed --horizon 365; echo rehearsal_exit=$?; node /opt/monark-dojo-collect/apps/dojo/scripts/dojo-seed.mjs --init /etc/monark/dojo-collect/seed.next --horizon 365; echo real_exit=$?; stat -c "%a %U:%G %s %n" /etc/monark/dojo-collect/seed /etc/monark/dojo-collect/seed.next'
```

Expected: one line `{"seed_anchor":"<64 hex>","horizon":365}` before each `..._exit=0`; write both to the JOURNAL with their role
(the real one is the `seed_anchor` of the anchor request of A-8; the rehearsal one is never anchored nor published, QI-5);
`600 root:root 65` for both (64 hex characters and LF). **STOP** on any other output (`seed_file_exists`: a seed was already there;
`seed_inside_tree`: the path lies in a code tree).

**Durable copy of the REAL seed off the host** (DOJO-SEED-ON-HOST-1, FM-1.4; operator mirror, never under `F:/tmp` alone):

```bash
mkdir -p /f/PRODUITS/dojo-mirror/seed && scp -i ~/.ssh/monark_vps root@178.16.131.29:/etc/monark/dojo-collect/seed.next '/f/PRODUITS/dojo-mirror/seed/<real seed_anchor>.seed' && [ "$(ssh -i ~/.ssh/monark_vps root@178.16.131.29 'sha256sum < /etc/monark/dojo-collect/seed.next')" = "$(sha256sum < '/f/PRODUITS/dojo-mirror/seed/<real seed_anchor>.seed')" ] && echo COPY-EQUAL || echo COPY-DIFFERENT
```

Expected: `COPY-EQUAL`. The copy stays in the mirror, next to the provider's backups risk already declared (TB-3).

**EnvironmentFile**, one write from the orchestrator's local shell (calque RUNBOOK-sentinel section 6-bis (4)); its closed key set is
`DOJO_COLLECT_ENV_KEYS`: the Helius endpoint base (the FIRST entry of the operator's `BELL_SOLANA_RPC`: the guard's transport reads
it as `helius`), the cycle id and floor of DOJO-GUARD-LEDGER-SPLIT-1 (floor = the dashboard total read at this act plus the reserve
declared for the operator machine), and the key, last. `HELIUS_BASE` is set first in the local shell to that endpoint base (no key
in it: the transport appends `?api-key=` from `HELIUS_API_KEY`, `packages/rpc-guard/src/transport.ts:171-172`):

```bash
printf 'BELL_SOLANA_RPC=%s\nHELIUS_CYCLE_ID=%s\nHELIUS_CYCLE_FLOOR=%s\nHELIUS_API_KEY=%s\n' "$HELIUS_BASE" '<CYCLE>' '<FLOOR>' "$HELIUS_API_KEY" | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 077 && cat > /etc/monark/dojo-collect.env && chown root:dojo-collect /etc/monark/dojo-collect.env && chmod 0640 /etc/monark/dojo-collect.env && stat -c "%a %U:%G %n" /etc/monark/dojo-collect.env && cut -d= -f1 /etc/monark/dojo-collect.env'
```

```bash
[ "$(printf 'BELL_SOLANA_RPC=%s\nHELIUS_CYCLE_ID=%s\nHELIUS_CYCLE_FLOOR=%s\nHELIUS_API_KEY=%s\n' "$HELIUS_BASE" '<CYCLE>' '<FLOOR>' "$HELIUS_API_KEY" | sha256sum)" = "$(ssh -i ~/.ssh/monark_vps root@178.16.131.29 'sha256sum < /etc/monark/dojo-collect.env')" ] && echo COPY-EQUAL || echo COPY-DIFFERENT
```

Expected: `640 root:dojo-collect /etc/monark/dojo-collect.env`, then the four NAMES only, then `COPY-EQUAL`. The file is mandatory (no
leading `-` in the unit): absent, the start fails. Rollback (before A-5): `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'shred -u /etc/monark/dojo-collect.env /etc/monark/dojo-collect/seed /etc/monark/dojo-collect/seed.next'` (no seed is anchored yet).

## 5. A-5 (collect side) — the units from the G7 bytes, the rehearsal anchor, one start that proves the credentials

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && for u in monark-dojo-collect.service monark-dojo-collect.timer; do git -C /f/Monark cat-file blob "$G7:deploy/$u" | ssh -i ~/.ssh/monark_vps root@178.16.131.29 "umask 022 && cat > /etc/systemd/system/$u" || echo "FAILED $u"; done; ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl daemon-reload && systemctl show -p LoadState -p FragmentPath -p DropInPaths -p NeedDaemonReload monark-dojo-collect.service monark-dojo-collect.timer && sha256sum /etc/systemd/system/monark-dojo-collect.service /etc/systemd/system/monark-dojo-collect.timer && systemd-analyze calendar "*-*-* *:00/5:00 UTC"'
```

Expected: no `FAILED`; `LoadState=loaded`, the two `FragmentPath` under `/etc/systemd/system`, `DropInPaths=` empty,
`NeedDaemonReload=no`; each digest equal to `git -C /f/Monark cat-file blob "$G7:deploy/<unit>" | sha256sum`; the calendar
expression accepted, its normalized form and its next elapse at a minute that is a multiple of 5, in UTC (write the output to the
JOURNAL: the timer's zone suffix and repetition value are read here on systemd 259). **STOP** on an error. Never `systemctl edit`
(a drop-in changes the pinned argv); the timer is enabled at A-9 (7) only (A-7 is off the real path).
Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm /etc/systemd/system/monark-dojo-collect.service /etc/systemd/system/monark-dojo-collect.timer && systemctl daemon-reload'`.

**The rehearsal anchor** (the credential `dojo-anchor`, `DOJO_ANCHOR_SOURCE`; dated line 14:13Z, Q-2 (a)): the body of the anchor
request of A-8 (its closed keys, PR-3a-1) with the REHEARSAL `seed_anchor` and a `published_at` on the day of THIS act (UTC); never
signed, never served (the publisher refuses its seed chain: M-E6). The collector checks `kind`, `seed_anchor`, `program`, `mint`,
`pool`, `pool_quote_vault`, `sol_usd_source`, `k_reads`, `horizon`, `published_at` and `read_rule` (equal to the pinned `READ_RULE` of
`dojo-methods.ts`). Written by root, root:root 0600 beside the seed: PID 1 hands it to the job, read-only, under
`$CREDENTIALS_DIRECTORY`; the unit cannot replace it:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 077 && cat > /etc/monark/dojo-collect/anchor.json && chown root:root /etc/monark/dojo-collect/anchor.json && chmod 0600 /etc/monark/dojo-collect/anchor.json && stat -c "%a %U:%G %s %n" /etc/monark/dojo-collect/anchor.json' < '<local rehearsal anchor file>'
```

Expected: `600 root:root <size> /etc/monark/dojo-collect/anchor.json`. Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm /etc/monark/dojo-collect/anchor.json'`.

One start, made on the SAME day (the anchor day): the step has no day to open (it opens only days after the anchor day,
`collect.ts` tick), so it writes nothing and calls nothing, and the first day the timer opens later is not this one (section 7):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'date -u +%F; systemctl start monark-dojo-collect.service; echo start_exit=$?; journalctl -u monark-dojo-collect.service -n 5 --no-pager -o cat | grep "dojo/collect"; systemctl reset-failed monark-dojo-collect.service; find /var/lib/monark-dojo-collect -maxdepth 3 | sort'
```

Expected: the date of the anchor's `published_at`; `start_exit=0`; no `dojo/collect:` line; exactly three paths (the state root,
`bundles`, `ledger`): no day directory, no ledger file. It proves the sandbox (`InaccessiblePaths=` included: the path exists), the
EnvironmentFile, both credentials (their paths under `$CREDENTIALS_DIRECTORY`, the seed against the anchor), the tree and the argv.
**STOP** on any other output: a start on another day (rewrite the anchor, never start on a later day here), `start_exit` other than
0, any `dojo/collect:` line (`credentials_path` (the expansion of `ExecStart=` is not what FAITS-SYSTEMD-CRED-1 read),
`seed_mismatch`, `anchor_malformed` (the anchor credential missing or malformed), `mint_mismatch`, `cycle_missing`, `budget_guard`,
`state_missing`, `usage`, `fatal`, `eve_missing`, `lock_held`), a Node `ERR_MODULE_NOT_FOUND` (tree incomplete), or a start that
fails before the job (namespace, credential: read `systemctl status monark-dojo-collect.service`). Rollback: as above.

**Tasks** (`TasksMax=64`, PROVISIONAL, dated line 15:00Z): sample the job's tasks during one more start of the same day, then write
the peak and the effective limit to the JOURNAL; the same command runs again during the first reading step of d (A-9; its instant is in
`bundles/<d>/evidence/plan.json`), the step that opens sockets; a dated line pins the value from these two readings:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl start --no-block monark-dojo-collect.service; for i in $(seq 1 200); do systemctl show -p TasksCurrent --value monark-dojo-collect.service; sleep 0.05; done | grep -E "^[0-9]+$" | sort -n | tail -n 1; systemctl show -p EffectiveTasksMax --value monark-dojo-collect.service'
```

Expected: a peak (a number under 64) and `64`, both to the JOURNAL; the orchestrator pins `TasksMax` by a dated line from this reading
and the one of d (dated line 15:00Z). **STOP** on a start that fails for lack of tasks (the job cannot create a thread or process).

## 6. A-7 — the rehearsal, off the real path (QI-5, DOJO-REHEARSAL-DAY-1)

**Off the real path** (decision of the investor of 2026-10-01: no rehearsal day; lot FAST-START): the real path goes A-5 (its one start
proves the credentials) → A-8 → A-9 (section 7) → A-11 (i) (section 18), and the first day the timer opens receives the `Eve` of the
provisional course, never the empty one. This section is kept for a rehearsal on demand (a new host, a recovery of the collect side,
before any signed anchor is in force): its acts, expectations and STOPs are unchanged, and none of them runs before A-9 on the real path.

**A-11-rep: the `Eve` of the first day the timer opens, BEFORE the timer** (dated line 15:00Z, C-G2-3). `collect.ts` stops the walk
of the days on `eve_missing` at a day without `eve.json` and without a closed day before it: the first day it opens has no day before
it, so its `Eve` is deposited by hand; every later day receives its `Eve` from the close of the day before. That day d is the day
after the anchor day if the timer is enabled on the anchor day, else the day (UTC) the timer is enabled. The rehearsal's `Eve` is
the EMPTY one (`{"accounts":[],"addresses":[]}`), made by the tree's `dojo-eve.mjs`, written as the unit's user (so it is
`dojo-collect:dojo-handoff` 0640 under the setgid `bundles/`, as the collector writes its own `eve.json`), through a temporary name:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /opt/monark-dojo-collect && sudo -u dojo-collect sh -c "umask 0027 && mkdir -p /var/lib/monark-dojo-collect/bundles/<d> && node /opt/monark-dojo-collect/apps/dojo/scripts/dojo-eve.mjs --empty --day <d> > /var/lib/monark-dojo-collect/bundles/<d>/eve.json.tmp && mv /var/lib/monark-dojo-collect/bundles/<d>/eve.json.tmp /var/lib/monark-dojo-collect/bundles/<d>/eve.json" && stat -c "%a %U:%G %s %n" /var/lib/monark-dojo-collect/bundles/<d> /var/lib/monark-dojo-collect/bundles/<d>/eve.json && cat /var/lib/monark-dojo-collect/bundles/<d>/eve.json'
```

Expected: `2750 dojo-collect:dojo-handoff <size> .../bundles/<d>`, `640 dojo-collect:dojo-handoff 31 .../bundles/<d>/eve.json`, then
`{"accounts":[],"addresses":[]}` (the bytes `layout.ts` `readEve` accepts, pinned by `dojo_eve_prints_the_canonical_empty_eve`; the
same tool makes the `Eve` of `dojo_collect_unit_runs_the_real_tick`). **STOP** on `dojo/eve: usage` (d is not a real UTC day).
Rollback (before the timer): `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -r /var/lib/monark-dojo-collect/bundles/<d>'`. Then:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl enable --now monark-dojo-collect.timer && systemctl list-timers monark-dojo-collect.timer --no-pager'
```

Expected: the next elapse at the next multiple of 5 minutes (UTC); under `Persistent=true` a step may start at once (the step is
idempotent). **Criterion** (before A-9): at least one whole UTC day d with no missed step and no refused close: (i) the unit started
at each of the 288 steps of d and none failed (count the starts and the failures of d in
`journalctl -u monark-dojo-collect.service --since "<d> 00:00:00 UTC" --until "<d+1> 00:00:00 UTC"`, by the message forms of
systemd 259 read for FAITS-JOURNALCTL-1); (ii) after the end of its reading day, d is closed and the publisher's reader accepts it,
with every reading made:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /opt/monark-dojo-collect && node --input-type=module -e "import(\"/opt/monark-dojo-collect/apps/dojo/src/layout.ts\").then((m) => { const l = m.readDayLayout(\"/var/lib/monark-dojo-collect/bundles/<d>\"); console.log(l.bundle.status, l.bundle.reason, l.records.length, l.records.filter((r) => r.read.read_at === null).length); })"'
```

Expected: `counted null 4 0`. A day `abstained beacon_unavailable 0 0` is not a rehearsal day. **STOP** on any `dojo/collect:` line
of the journal: `eve_missing` (the `Eve` is not on the first day the chain opens: deposit it there, as above, never on another day),
`lock_held` (section 9 before anything else), and every line listed in section 5. Stop (rollback):
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl disable --now monark-dojo-collect.timer'`.

**Start timeout** (`TimeoutStartSec=1500`, dated line 15:00Z): the worst course of one reading read in the code is 1210 s (the unit's comment);
a step still `activating` after 1500 s is ended by systemd with `KillSignal=` (default SIGTERM, to confirm at L-2; the unit `failed`): on SIGTERM
the course in flight releases its locks (journal `dojo/collect: sigterm`); an OOM kill, a SIGKILL or a power cut leaves them held, and every later
step refuses `lock_held` until section 9. A step runs one course per due instant: two instants in the same 5-minute slot make one step of two courses.

## 7. A-9 (collect side) — from the signed anchor to the counted days

After the signed anchor of A-8 (section 16: its line signed and checked offline, (1) to (4); its timestamp follows the first publication,
DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1), on its `published_at` day J (UTC), in this order. (1) Make sure that the timer is off and that no
step runs (on the real path the timer was never enabled: A-7 is off it, section 6): a running oneshot is `activating`
(systemd.service(5): without `RemainAfterExit=` it never enters `active`), and 360 waits of 5 s outlast `TimeoutStartSec`:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl disable --now monark-dojo-collect.timer; for i in $(seq 1 360); do [ "$(systemctl is-active monark-dojo-collect.service)" = activating ] || break; sleep 5; done; systemctl is-active monark-dojo-collect.service'
```

Expected: `inactive`. **STOP** on `failed` (read the journal; `lock_held` or a killed course: section 9 first) or on anything else.
(2) Set aside what the start of A-5 left under `bundles/` (expected: nothing, that start opens no day; the archive keeps the name
`rehearsal-<date>`) and open a new `bundles/` (keep `ledger/`: the cycle's credits are real), (3) put the real seed in force, (4) put
the signed anchor line in force as the credential source (the first line of the publisher's private timeline, layout of PR-3a-1, to be
confirmed at its G7), each only while the unit is `inactive`:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 '[ "$(systemctl is-active monark-dojo-collect.service)" = inactive ] && mv /var/lib/monark-dojo-collect/bundles "/var/lib/monark-dojo-collect/rehearsal-$(date -u +%F)" && install -d -o dojo-collect -g dojo-handoff -m 2750 /var/lib/monark-dojo-collect/bundles && shred -u /etc/monark/dojo-collect/seed && mv /etc/monark/dojo-collect/seed.next /etc/monark/dojo-collect/seed && umask 077 && head -n 1 /var/lib/monark-dojo/timeline.jsonl > /etc/monark/dojo-collect/anchor.json && chown root:root /etc/monark/dojo-collect/anchor.json && chmod 0600 /etc/monark/dojo-collect/anchor.json && stat -c "%a %U:%G %s %n" /etc/monark/dojo-collect/seed /etc/monark/dojo-collect/anchor.json'
```

Expected: `600 root:root 65 /etc/monark/dojo-collect/seed`, `600 root:root <size> /etc/monark/dojo-collect/anchor.json`; nothing
at all if the unit was not `inactive` (redo (1)). (5) A-11 (i) (section 18), on the same day J: the PROVISIONAL course of the history
collector on the operator machine (`--provisional-day` J: a day read nowhere, D_LAST = J − 1, `--cut` a finalized slot of J; it never
writes `publish/`, so it has no line), then its `provisional/eve.json` deposited at `bundles/<o>/eve.json`, o = J + 1, the first day the
restarted collector opens (the start (6) is made on J, the anchor day, which opens nothing); as in section 6 (`dojo-collect:dojo-handoff`
0640), BEFORE the start; its content is that course's `Eve` (addresses only, ADR D-2 TU-1p), never the empty one. (6) Then the start of
section 5, on J: expected as there, except that its listing holds six paths (the state root, `bundles`, `bundles/<o>`,
`bundles/<o>/eve.json`, `ledger`, the empty `rehearsal-<date>` of (2): no day opened). A start made AFTER J (a provisional course ended
after midnight; C-1 of the G2 of FAST-START; o is then the day of that start, below) is expected otherwise: the date printed is o,
`start_exit=0`, no `dojo/collect:` line, `bundles/<o>/evidence/plan.json` present (read below), its `beacon` null if the start follows
00:15 UTC (then d = o + 1); its listing (the six paths above, `bundles/<o>/evidence`, and the guard's ledger of the beacon for a start
before 00:15 UTC) to the JOURNAL. For that start only, the STOP of section 5 on a start on another day does not hold (the anchor in force
is the signed line of A-8, never rewritten); every other STOP of section 5 holds. (7) Only then, on the day of (6), the timer: the second command of
section 6 (`systemctl enable --now monark-dojo-collect.timer`). **The first day read, d** (B-1 and D2-4 of the G2 inspection of part
1): `collect.ts` plans a day with its beacon only at a step before T + 900 s (00:15 UTC; `plan`); at a later step it writes the day
abstained, without any call (`beacon_unavailable`); every step plans the current day if it follows the anchor day; an abstained day
carries its `Eve` to the next day at its close (`nextEve`), at 00:00 UTC, the step that plans that next day with its beacon. So d is READ
on the plan of o = J + 1, never assumed: the timer plans o at the step of 00:00 UTC of J + 1 with its beacon, d = J + 1 (the expected
case; G1 journal of B1-CORR, 1.1); o abstained (`beacon` null: no step before 00:15 UTC) ⇒ d = o + 1, its `Eve` carried from o. A start
made after J (a provisional course ended after midnight) opens its own day: o is that day, and the `Eve` goes there (section 18 (i)).
The plan of o, read after the step of 00:00 UTC of o, its `beacon` alone (a plan with a beacon holds instants, never printed):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'grep -c "beacon.:null" /var/lib/monark-dojo-collect/bundles/<o>/evidence/plan.json'
```

Expected: `0` (o read: d = o = J + 1, the expected case) or `1` (o abstained: d = o + 1); d to the JOURNAL, and section 18 follows that
d. **STOP** on `eve_missing` (the `Eve` is not on the day the chain stops at: o, never d) and on every line of section 5. No rehearsal day
and no Bitcoin block precede d (decision of 2026-10-01): DOJO-ANCHOR-OTS-DATE-RULE-1 no longer gates the first counted day, and the
anchor's timestamp follows the first publication (A-8 (5) to (9), item DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1). Rollback: none that erases
(a wrong seed or anchor in force is refused by the collector, `seed_mismatch`; the set-aside `bundles/` is kept).

## 8. Host rule DOJO-TMP-STRAY-1 — a stray `readings/*.tmp`

**When**: the collect journal shows `dojo/collect: layout_stray_file`, or the publisher refuses a day with `layout_stray_file` naming
`readings/<name>.tmp`. **Why**: every file of a day is written as `<path>.tmp` then renamed (`writeAtomic`, `apps/dojo/src/layout.ts`);
a stop between the two leaves the `.tmp`; the next write of the same path reuses and renames it, so a stray outlives its day only when
no such write comes (for example a manual start of the same reading beside the timer, stopped after the other one renamed). The
layout reader refuses any file of `readings/` outside its closed list. Measured at the G1 of DRAND-RELAY-GET-1b (test
`dojo_close_absorbs_an_orphan_tmp`): within ONE process, a stop between a `.tmp` and its rename (a reading, a missed reading at the
close, `readings/SHA256SUMS`) is absorbed by the next write of the same path. The stray of this section is the case of TWO processes:
kept refused (`layout_stray_file`, test `dojo_collect_to_verify_end_to_end`) and removed by this procedure, no purge in code (G0 Q-2 (a)).

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl stop monark-dojo-collect.timer && systemctl is-active monark-dojo-collect.service; find /var/lib/monark-dojo-collect/bundles/<d>/readings -maxdepth 1 -type f -name "*.tmp" -printf "%f %s\n"'
```

Expected: `inactive` (wait and re-run while `activating`: a step is running; `failed`: read the journal first), then the stray names
and sizes (JOURNAL: day, names, sizes, time; the contents are never displayed: a `.tmp` may hold a partial reading). Remove exactly
those, nothing else (never a `.json`, never a `SHA256SUMS`, nothing under `publish/` or `evidence/`), then restart:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'find /var/lib/monark-dojo-collect/bundles/<d>/readings -maxdepth 1 -type f -name "*.tmp" -delete && find /var/lib/monark-dojo-collect/bundles/<d>/readings -maxdepth 1 -name "*.tmp" | wc -l && systemctl start monark-dojo-collect.timer'
```

Expected: `0`; if the day is closed, the reader command of section 6 now answers without refusal. Rollback: none (only strays go).

## 9. The guard's lock left held — `lock_held` (dated line 15:00Z, C-G2-4; calque of RUNBOOK-sentinel l.417-429)

**When**: the collect journal shows `dojo/collect: lock_held`: every step refuses before any call, so the whole collection is stopped
until this section is done. **Why**: a step killed in the middle of a course leaves the locks of that course under `ledger/`:
`<cycle>/helius.lock` and `<cycle>/solana-foundation.lock` for a reading (the cycle `HELIUS_CYCLE_ID`), `drand-<AAAA-MM-JJ>/drand-pl.lock`
and `drand-<AAAA-MM-JJ>/drand-cf.lock` for the course of the beacon relays (the plan of day d, before 00:15 UTC); only the first one if the
kill falls between the two acquisitions. A stale lock STAYS held and only the served, ledgered `unlock` releases it
(`packages/rpc-guard/src/lock.ts:4-6`). Since DRAND-RELAY-GET-1b, a SIGTERM (`TimeoutStartSec` acts by `KillSignal=`, default to confirm at
L-2) releases the locks of the course in flight (journal `dojo/collect: sigterm`, ledger line `unlocked` of reason `dojo/collect: SIGTERM`);
the OOM killer of `MemoryMax`, a SIGKILL or a power cut still leave them; a stop or a reboot of the host acts by `KillSignal=`
(`systemd.kill(5)`, not read: request L-2 of the G0 of DRAND-RELAY-GET-1b). A stale drand lock in [T_d, T_d + 900 s) stops each step
before its readings: unlocked in time, the next step plans day d; otherwise d is abstained (`beacon_unavailable` from T_d + 900 s) and
the readings of d−1 due meanwhile are written missed. First, the state (read-only; the lock files hold `{pid, iso}`, no secret):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl stop monark-dojo-collect.timer; systemctl is-active monark-dojo-collect.service; ls /var/lib/monark-dojo-collect/ledger/*/*.lock; for f in /var/lib/monark-dojo-collect/ledger/*/*.lock; do echo "$f $(cat "$f")"; done'
```

Expected: `inactive` or `failed`, NEVER `activating` (a live step: wait and re-run; never unlock a live step); the locks of ONE
course under ONE cycle: one or both of `<cycle>/helius.lock` and `<cycle>/solana-foundation.lock` (a reading), or one or both of
`drand-<AAAA-MM-JJ>/drand-pl.lock` and `drand-<AAAA-MM-JJ>/drand-cf.lock` (the relays), else **STOP** (another lock name, or two
cycles); for each, a pid that no longer exists (check
`ps -p <pid>` prints no process line), else **STOP**. Then the served `unlock` of each operator, as `dojo-collect` and NEVER as root
(a root-owned ledger file would make the unit's next appends fail), with `--floor 0` (the `unlocked` line carries no credit):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /opt/monark-dojo-collect && for op in helius solana-foundation drand-pl drand-cf; do L=$(ls /var/lib/monark-dojo-collect/ledger/*/$op.lock 2>/dev/null) || { echo "$op: no lock"; continue; }; C=$(basename "$(dirname "$L")"); sudo -u dojo-collect /usr/bin/env node /opt/monark-dojo-collect/packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir /var/lib/monark-dojo-collect/ledger --floor 0 unlock --cycle "$C" --op "$op" --reason runbook-lock-held-unlock; echo "$op exit=$?"; test ! -e "$L" && echo "$op lock released"; tail -n 1 "/var/lib/monark-dojo-collect/ledger/$C/$op.jsonl"; done'
```

Expected, for each operator with a lock (`<op>: no lock` for the others): `exit=0`, `lock released`, and a last ledger line with
`"outcome":"unlocked"` and
`"reason":"runbook-lock-held-unlock"` (JOURNAL: time, cycle, pids, the two lines). Then `systemctl start monark-dojo-collect.timer`;
the next steps read again (a reading whose window passed meanwhile is written missed at the close). **STOP, no repair by hand,
escalation to the orchestrator** if `unlock` fails on "head sidecar" or "cycle ledger" (fail-closed C-V-8, `packages/rpc-guard/src/ledger.ts`:
for example a head sidecar deleted, l.171, `head_absent` of RUNBOOK-rpc-guard section 3, or a NUL tail after a power cut, l.135, same section; a
kill between the first line of a new cycle's ledger and its head is healed at the open, never refused: l.211, l.188-189, RPC-GUARD-FIRST-APPEND-HEAD-1).
Never `rm` of a `.lock`, never root.

## 10. The publication side (PR-3b-2a): what, order, go, conventions

**What.** The publisher `apps/dojo/scripts/dojo-publish.mjs` runs as the systemd unit `monark-dojo-publish.service`, started four
times a day by `monark-dojo-publish.timer` (00:30, 01:30, 03:30, 06:30 UTC): each start publishes the next closed day of the
collect handoff (`--inbox /var/lib/monark-dojo-collect/bundles`, read-only, through the group `dojo-handoff`), verified with the
whole served tree by the real verifier BEFORE its first append, and writes only under `/var/lib/monark-dojo` (the private
timeline, `keyring.json`, `staging/`, and `public/`, the only root of Caddy). It has no network; it holds the signing key, the ONLY
credential it loads. Sources: ADR-DOJO-PR-3, pli G0 of PR-3b-2 (PB-2 files, PB-3 environment, PB-5 acts, PB-6 tests) and the dated
lines of the pli G7 of PR-3a-1c; `docs/dojo/FAITS-systemd-publish-2026-09-30.md`; constants `scripts/dojo-deploy.mjs`; pins
`test/dojo-publish-deploy.test.ts`. PR-3b-2b adds CA-1 and TU-7 and pins the script of CA-0.

**Order** (PB-5; FAST-START, decisions of 2026-10-01): A-2p → A-3p → A-4p → A-5p → A-8 (1) to (4) (the anchor signed on day J,
checked offline; no `ots` act) → A-9 (1) to (4) → A-11 (i) (the PROVISIONAL course, `--provisional-day` J, and its `Eve` deposited at
`bundles/<J+1>/eve.json`) → A-9 (6) and (7) (the start and the timer, on J; d read on the plan of J + 1, expected d = J + 1) → A-10 → close
of d → A-11 (ii) to (iv) (the FINAL packet, `--first-read` = d; the `history` line, checked against d BEFORE it is committed)
→ the first `snapshot` (d) published → A-8 (5) to (9) (the timestamp, item DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1) → CA-0 (section 15,
after the first publication: decision of 2026-10-01, item DOJO-CA0-SCRIPT-1 of `docs/ETAT.md`; until then each act on the host is
checked by its digests) → the announcement day (QI-4 (c)): A-1 → A-6 → CA-1 → TU-7. A-9 is the collect act of section 7; A-7 (the
rehearsal, section 6) is off the real path: no
rehearsal day. Two courses of the history collector (B-1 of the G2 inspection of part 1; decision of the orchestrator, `docs/ETAT.md`,
2026-10-01): the provisional one (a day read nowhere, never `publish/`) gives the `Eve` of the first day the restarted collector opens,
never a line; the final one gives the `history` line, whose last day is d − 1, since the first `snapshot` is the day after the history's
last day (`dojo-publish.mjs`, `publishDay`). Price: one more course of the history collector; residue: section 18 (iv). ONE G7 (the
SHA of `G7.txt`) for both trees, the four units and the
extract (DOJO-SYNC-G7-REF-1). **Go**: the closed list of PB-5, delegated to the orchestrator (decision 292); QI-4 and QI-5 stay the
investor's.

**Conventions.** Those of sections 1 to 9 (one fenced block is ONE command, with no shell state; `G7.txt`). The signing key is
never displayed, copied or hashed: its file is only generated, `stat`ed, handed to systemd as a credential source or shredded
(`dojo_runbook_never_prints_private_key` pins these uses); `--generate-key` prints the PUBLIC part only, counted before it is
read. A command longer than 160 characters is broken after `&&`, `;` or `|`, or inside a quoted string where the newline
separates words or JavaScript statements. A digest compared across the two machines is compared on its 64 hex characters
(`cut -c1-64`), and a listing is made with `sha256sum -t` on BOTH sides: the `sha256sum` of Git Bash prints a binary marker (` *`)
by default (measured on the operator machine, 2026-09-30).

## 11. A-2p — user `dojo` and its state

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'useradd --system --no-create-home --shell /usr/sbin/nologin --groups dojo-handoff dojo &&
install -d -o dojo -g dojo -m 0755 /var/lib/monark-dojo /var/lib/monark-dojo/public && id dojo &&
stat -c "%a %U:%G %n" /var/lib/monark-dojo /var/lib/monark-dojo/public /etc/monark/dojo &&
sudo -u caddy test -x /var/lib/monark-dojo/public && echo caddy-traverse-ok'
```

Expected: `uid=... (dojo) gid=... (dojo) groups=...(dojo),...(dojo-handoff)` (the membership, which the unit's
`SupplementaryGroups=dojo-handoff` extends: FAITS-SYSTEMD-PUBLISH-1 F-1); `755 dojo:dojo` on both state paths (Caddy traverses the
state to `public/`; no secret lies under the state); `700 root:root /etc/monark/dojo` (made at A-2, collect side); then
`caddy-traverse-ok`. **STOP** on `useradd: user 'dojo' already exists`, a missing group `dojo-handoff` (A-2 first) or any other
output. Blockers: the G7 of PR-3b-2a; A-2 (collect side); FAITS-JOURNALCTL-1; DOJO-UNIT-OFFLINE-ORACLE-1 (the first host act);
FAITS-SYSTEMD-PUBLISH-1. Rollback (before A-4p only):
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -r /var/lib/monark-dojo && userdel dojo'`.

## 12. A-3p — the publication tree at G7, and the collect tree compared at the SAME G7

The two lists are those of `scripts/dojo-deploy.mjs` AT THE G7, read from its blob, never retyped:
`DOJO_PUBLISH_TREE_PATHS` (the publisher's import closure, pinned by `dojo_publish_tree_is_the_import_closure`) and
`DOJO_COLLECT_TREE_PATHS` (section 3):

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && git -C /f/Monark show "$G7:scripts/dojo-deploy.mjs" > /f/tmp/dojo-dn/dojo-deploy-g7.mjs &&
cd /f/tmp/dojo-dn && node --input-type=module -e "const m = await import('./dojo-deploy-g7.mjs');
console.log(m.DOJO_PUBLISH_TREE_PATHS.join(' ')); console.error(m.DOJO_COLLECT_TREE_PATHS.join(' '));" > publish-tree.txt 2> collect-tree.txt &&
wc -w publish-tree.txt collect-tree.txt
```

Expected: `10 publish-tree.txt` and `26 collect-tree.txt`. Then the publication tree, shipped and read back (motif of section 3):

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" $(cat /f/tmp/dojo-dn/publish-tree.txt) |
tee /f/tmp/dojo-dn/publish-tree.tar.gz | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'install -d -m 0755 -o root -g root /opt/monark-dojo &&
tar xzf - -C /opt/monark-dojo --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-dojo &&
find /opt/monark-dojo -type d -exec chmod 0755 {} + && find /opt/monark-dojo -type f -exec chmod 0644 {} + &&
cd /opt/monark-dojo && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t' > /f/tmp/dojo-dn/publish-tree.host.sha
```

```bash
rm -rf /f/tmp/dojo-dn/publish-tree && mkdir -p /f/tmp/dojo-dn/publish-tree &&
tar xzf /f/tmp/dojo-dn/publish-tree.tar.gz -C /f/tmp/dojo-dn/publish-tree && cd /f/tmp/dojo-dn/publish-tree &&
find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t > /f/tmp/dojo-dn/publish-tree.local.sha && wc -l < /f/tmp/dojo-dn/publish-tree.local.sha &&
cmp -s /f/tmp/dojo-dn/publish-tree.local.sha /f/tmp/dojo-dn/publish-tree.host.sha && echo TREE-EQUAL || echo TREE-DIFFERENT
```

Expected: `10`, then `TREE-EQUAL` (the host's digests equal the local ones line for line). No `node_modules` link: the closure of the
publisher holds no bare specifier. Then the collect tree at the SAME G7, compared, nothing written on the host (DOJO-SYNC-G7-REF-1):

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && rm -rf /f/tmp/dojo-dn/collect-g7 && mkdir -p /f/tmp/dojo-dn/collect-g7 &&
git -C /f/Monark archive --format=tar "$G7" $(cat /f/tmp/dojo-dn/collect-tree.txt) | tar xf - -C /f/tmp/dojo-dn/collect-g7 &&
cd /f/tmp/dojo-dn/collect-g7 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t > /f/tmp/dojo-dn/collect-g7.local.sha &&
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /opt/monark-dojo-collect &&
find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t' > /f/tmp/dojo-dn/collect-g7.host.sha &&
cmp -s /f/tmp/dojo-dn/collect-g7.local.sha /f/tmp/dojo-dn/collect-g7.host.sha && echo TREE-EQUAL || echo TREE-DIFFERENT
```

Expected: `TREE-EQUAL` (the 26 files; the link `node_modules/@monark/rpc-guard` is not a file). **STOP** on `TREE-DIFFERENT` (PB-5):
the collect tree differs at the new G7: A-3 and A-5 (collect side) are redone at this G7 (and a rehearsal on demand, section 6, off
the real path, restarts its criterion at the next whole day). Blockers: the G7 of PR-1b-5a, PR-1b-5b, PR-3a-1c and PR-3b-2a; DOJO-PUBLISH-TREE-PATHS-1 closed.
Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /opt/monark-dojo'`.

## 13. A-4p — the signing key, generated ON the host, and the committed keyring (DOJO-KEY-1)

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 077 &&
node /opt/monark-dojo/apps/dojo/scripts/dojo-publish.mjs --generate-key /etc/monark/dojo/signing-key.pem > /root/dojo-pubkey.out;
echo gen_exit=$?; stat -c "%a %U:%G %s" /etc/monark/dojo/signing-key.pem;
grep -c PRIVATE /root/dojo-pubkey.out; grep -c -E "[{,] *.d. *:" /root/dojo-pubkey.out; wc -c < /root/dojo-pubkey.out'
```

Expected: `gen_exit=0`; `600 root:root <size>` (a PKCS#8 PEM file); `0` and `0` (the saved output holds no private material:
counts only, never contents); a small byte count. Then the PUBLIC output, and nothing else:
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cat /root/dojo-pubkey.out'` prints one line
`{"key_id":"<64 hex>","public_key":{"kty":"OKP","crv":"Ed25519","x":"<x>"}}`; both values to the JOURNAL. **STOP** if a count is
not 0 (an exposure before any line):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'shred -u /etc/monark/dojo/signing-key.pem /root/dojo-pubkey.out'
```

then record it, and no new key before a fix. **STOP** on `key_file_exists` (never remove a key to make room). The committed
keyring (the trust root), made on the operator machine from that public output by the repo's own code, which refuses a `key_id`
that is not the sha256 of `x`; its bytes are the ones the publisher serves at `/dojo/pubkey.json` for its genesis key (pinned by
`dojo_units_compose_collect_to_publish_to_verify`):

```bash
cd /f/Monark && mkdir -p apps/dojo/keys &&
node --input-type=module -e "import { keyringOf, publicKeyOfJwk, canonical } from './apps/bell/scripts/bell-chain.mjs';
const [x, id] = process.argv.slice(1); const e = keyringOf(publicKeyOfJwk({ x }), 1).keys[0];
if (e.key_id !== id) { console.error('STOP: key_id mismatch'); process.exit(1); }
console.log(canonical({ schema: 'dojo-keyring-v1',
keys: [{ key_id: e.key_id, public_key: e.jwk, valid_from_seq: 1 }] }));" -- '<x>' '<key_id>' > apps/dojo/keys/dojo-keyring.json;
echo exit=$?; cat apps/dojo/keys/dojo-keyring.json
```

Expected: `exit=0`, then one canonical line
`{"keys":[{"key_id":"<key_id>","public_key":{"crv":"Ed25519","kty":"OKP","x":"<x>"},"valid_from_seq":1}],"schema":"dojo-keyring-v1"}`.
Then the label guard (DOJO-SYNC-LABEL-FALSE-REFUSAL-1 and DOJO-SYNC-LABEL-SUBSTRING-1: the key and the keyring pass it before the
commit, ADR-DOJO-PR-4 l.252-253), the commit (orchestrator, R-20), the full oracle and the push: committed and pushed BEFORE any line
is signed (DOJO-KEY-1); this commit un-skips `dojo_keyring_shares_no_key_with_bell` (TU-K). Blockers: the G7 of PR-3a-1c;
DOJO-KEYMODE-RETRY-1; DOJO-ROTATION-FORK-WINDOW-1; the two label items. Rollback: while no line is signed, the `shred -u` above and
the local commit dropped; after a signed line, a rotation (section 20), never a deletion.

## 14. A-5p — the two units from the G7 bytes, their calendar, one dry start

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && for u in monark-dojo-publish.service monark-dojo-publish.timer; do
git -C /f/Monark cat-file blob "$G7:deploy/$u" |
ssh -i ~/.ssh/monark_vps root@178.16.131.29 "umask 022 && cat > /etc/systemd/system/$u" || echo "FAILED $u"; done;
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl daemon-reload &&
systemctl show -p LoadState -p FragmentPath -p DropInPaths -p NeedDaemonReload monark-dojo-publish.service monark-dojo-publish.timer &&
sha256sum /etc/systemd/system/monark-dojo-publish.service /etc/systemd/system/monark-dojo-publish.timer &&
for h in 00 01 03 06; do systemd-analyze calendar "*-*-* $h:30:00 UTC" | grep -E "Normalized|Next"; done &&
stat -c "%a %U:%G %n" /etc/monark/dojo-collect /etc/monark/dojo-collect.env /var/lib/monark-dojo-collect/ledger &&
stat -c "%a %U:%G %n" /var/lib/monark-dojo-collect/bundles && systemctl show-environment | cut -d= -f1'
```

Expected: no `FAILED`; `LoadState=loaded` twice, both `FragmentPath` under `/etc/systemd/system`, `DropInPaths=` empty,
`NeedDaemonReload=no`; each digest equal to `git -C /f/Monark cat-file blob "$G7:deploy/<unit>" | sha256sum`; the four
expressions accepted, each next elapse at hh:30 UTC (JOURNAL: the normalized forms read on systemd 259); the four paths of the
collect side exist (the unit's `InaccessiblePaths=` and `ReadOnlyPaths=` carry no `-`: a missing path fails the start, so A-2 and
A-4 of the collect side come first); the NAMES of the manager's environment block (FAITS-SYSTEMD-PUBLISH-1 F-3), none of the
families `NODE_`, `SSL_`, `OPENSSL_` or ending in `PROXY` (TB-25; else **STOP**: never print a value). Never `systemctl edit` (a
drop-in changes the pinned unit), never `systemctl enable` here (the timer is enabled at A-10 only). Then one dry start (the
unit's user, sandbox, credential, tree, argv and environment), with nothing to publish yet:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl start monark-dojo-publish.service; echo start_exit=$?;
journalctl -u monark-dojo-publish.service -n 10 --no-pager -o cat | grep "dojo/publish";
systemctl reset-failed monark-dojo-publish.service; find /var/lib/monark-dojo -mindepth 1 | sort'
```

Expected: `start_exit=1`; the journal line `dojo/publish: history_missing: the first snapshot waits for the history line (decision
231)`, NEVER `signing_key_missing` (the key is loaded before any state is read: `runCli` evaluates `load(KEY)` before
`publishDay`); `find` lists `/var/lib/monark-dojo/public` only (nothing written). **STOP** on any other output:
`signing_key_missing`, a start that fails before the job (a namespace, a missing path, the credential: read
`systemctl status monark-dojo-publish.service`), a Node `ERR_MODULE_NOT_FOUND` (the tree is incomplete), any written path.
Blockers: A-3p; A-4p pushed; the dated line of DOJO-VERIFY-SCALE-1 (the unit's `MemoryMax`, heap and `TimeoutStartSec`). Rollback:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm /etc/systemd/system/monark-dojo-publish.service /etc/systemd/system/monark-dojo-publish.timer &&
systemctl daemon-reload'
```

## 15. CA-0 — the offline conformity check (its place; the script and the host captures are PR-3b-2b's)

When: after the first publication (section 10; decision of 2026-10-01, item DOJO-CA0-SCRIPT-1 of `docs/ETAT.md`; N-7 of the G2 of
FAST-START): its script is PR-3b-2b's and not written yet, so until then each act on the host is checked by its digests; never committed.
Form (pli G0 of PR-3b-2, PB-2, written in full and pinned by
PR-3b-2b): `node scripts/verify-dojo.mjs --offline <mirror> --keyring apps/dojo/keys/dojo-keyring.json`, with `--g7`,
`--tree-digests <publication> <collect>`, `--loaded-config <captures>` and `--bell-digests <before> <after>`. Expected (the closed
table of PB-2): `c09`, `c10` and `c12` green; `c01`, `c02`, `c03` and `c08` evaluated on the mirror; `c11` red without a `snapshot`;
`c04` to `c07` never passed, so never `VERIFY OK` (M-H28). Rollback: none (read-only). Blockers: the G7 of PR-3b-2b; the first publication.

## 16. A-8 — the anchor: signed by a transient job, checked OFFLINE, timestamped after the first publication (ADR D-4)

Blockers: DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1 and D-C2 (G7 of PR-3a-1c); A-4p pushed; A-5p; this section (T-A11); FAITS-SYSTEMD-RUN-UNSETENV-1
(due: `--property=UnsetEnvironment=` with a list of names, read on this host in systemd-run(1) and systemd.exec(5) of systemd 259, as
FAITS-SYSTEMD-CRED-1 was; a property `systemd-run` refuses fails before the job, nothing written). The unit is
`inactive` (its timer is enabled at A-10 only): the job below is the only writer (motif R3, RUNBOOK-bell l.483-485).

(1) The request, prepared by the orchestrator on its machine: the fifteen keys of `ANCHOR_KEYS` of
`apps/dojo/scripts/dojo-publish.mjs`, `read_rule` = `READ_RULE` of `apps/dojo/src/dojo-methods.ts`, `seed_anchor` and `horizon`
(365) = the public line of the REAL seed (A-4, collect side: `seed.next`, JOURNAL), the other values those the ADRs fix; its
sha256 to the JOURNAL. It holds no secret. Written by root into the state, readable by the job's user, removed after the act:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 027 && cat > /var/lib/monark-dojo/anchor-request.json &&
chown dojo:dojo /var/lib/monark-dojo/anchor-request.json && stat -c "%a %U:%G %s %n" /var/lib/monark-dojo/anchor-request.json &&
sha256sum < /var/lib/monark-dojo/anchor-request.json' < '<local anchor request file>'
```

Expected: `640 dojo:dojo <size> /var/lib/monark-dojo/anchor-request.json` and the local digest. (2) The anchor line, by ONE
transient job with the unit's user, sandbox and credential (each property the unit's own, pinned by
`dojo_unit_is_offline_and_loads_its_own_credential` and `dojo_runbook_jobs_carry_the_unit_properties`; the job loads the key, so it carries
the unit's `UnsetEnvironment=` (F-2), as ONE argument, `"$U"`: `$S` is split on blanks, a list of names in it would split):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed &&
S="-p PrivateNetwork=yes -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true
-p ReadWritePaths=/var/lib/monark-dojo -p UMask=0022" && K="-p LoadCredential=dojo-signing-key:/etc/monark/dojo/signing-key.pem" &&
U="--property=UnsetEnvironment=NODE_OPTIONS NODE_TLS_REJECT_UNAUTHORIZED NODE_EXTRA_CA_CERTS SSL_CERT_FILE SSL_CERT_DIR" &&
U="$U HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY http_proxy https_proxy all_proxy no_proxy" &&
C="/usr/bin/env node /opt/monark-dojo/apps/dojo/scripts/dojo-publish.mjs
--anchor /var/lib/monark-dojo/anchor-request.json --state /var/lib/monark-dojo" &&
systemd-run --wait --pipe --collect --uid=dojo --gid=dojo $S "$U" $K $C'
```

Expected: one JSON line `{"status":"anchored","seq":1,"published_at":"<ISO>","key_id":"<A-4p key_id>","line_hash":"<64 hex>"}`
(JOURNAL). **STOP** on any other output: `anchor_malformed` (the request; nothing written), `signing_key_missing`,
`existing_timeline_corrupt`, `anchor_on_published_day`, `line_refused` (section 19); a property that `systemd-run` refuses fails
before the job (read its error; nothing written). Then the request goes, its digest equal to (1):
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'sha256sum < /var/lib/monark-dojo/anchor-request.json && rm /var/lib/monark-dojo/anchor-request.json'`.

(3) The mirror copy of `public/` (durable, never under `F:/tmp` alone), digests on both sides:

```bash
mkdir -p /f/PRODUITS/dojo-mirror/public-seq1 &&
scp -r -i ~/.ssh/monark_vps 'root@178.16.131.29:/var/lib/monark-dojo/public/*' /f/PRODUITS/dojo-mirror/public-seq1/ &&
cd /f/PRODUITS/dojo-mirror/public-seq1 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t > /f/tmp/dojo-dn/public-seq1.local.sha &&
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /var/lib/monark-dojo/public &&
find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t' > /f/tmp/dojo-dn/public-seq1.host.sha &&
cmp -s /f/tmp/dojo-dn/public-seq1.local.sha /f/tmp/dojo-dn/public-seq1.host.sha && echo MIRROR-EQUAL || echo MIRROR-DIFFERENT
```

Expected: `MIRROR-EQUAL` (two files: `timeline.jsonl` and `dojo/pubkey.json`). (4) **STOP, offline, BEFORE any `ots stamp`** (pli
of PR-3a-1c, Q-V-1): the real verifier's public command on the mirror, from the served files alone:

```bash
cd /f/Monark && node apps/dojo/scripts/dojo-verify-cli.mjs /f/PRODUITS/dojo-mirror/public-seq1 --self-consistent-only; echo verify_exit=$?
```

Expected: `verify_exit=0` and one line with `"ok":true`, `"seq":1`, `"snapshots":0`, `"head":null` and
`"status":"self_consistent_only"`. Then the declared extension (stronger, offline too, never a substitute), under the committed
keyring:

```bash
cd /f/Monark && node apps/dojo/scripts/dojo-verify-cli.mjs /f/PRODUITS/dojo-mirror/public-seq1 --keyring apps/dojo/keys/dojo-keyring.json;
echo verify_exit=$?
```

Expected: `verify_exit=0` and `"status":"consistent_with_supplied_keyring"`. **STOP on any other output: no `ots stamp`, nothing
served**; no rollback erases: the state is set aside and a NEW timeline starts (a new anchor does not repair a refused line: dated
lines of PR-3a-1b C-V-2 and of PR-3a-1c). **Then A-9, the same day J** (decision of the investor of 2026-10-01: the Bitcoin proof is
deferred): with (4) green, A-9 (section 7) follows at once, without any `ots` act; (5) to (9) below run only AFTER the first `snapshot`
is published (section 17), item DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1: the proof dates the anchor line later and never gates a counted
day. (5) The manifest (ADR-BELL-OTS-ANCHOR-1 D1: `#L1` hashes line 1 without its LF, its
`line_hash`; `#L1-L1` hashes it with its LF), in the register `docs/dojo-publications/` (calque of Bell D3; its service is
DOJO-ANCHOR-SERVE-1):

```bash
cd /f/Monark && mkdir -p docs/dojo-publications && T=/f/PRODUITS/dojo-mirror/public-seq1/timeline.jsonl &&
M=docs/dojo-publications/timeline-seq1-manifest.txt && test ! -e "$M" && L=$(head -n 1 "$T" | head -c -1 | sha256sum | cut -c1-64) &&
P=$(head -n 1 "$T" | sha256sum | cut -c1-64) && echo "timeline.jsonl#L1 $L" > "$M" && echo "timeline.jsonl#L1-L1 $P" >> "$M" &&
cat "$M" && sha256sum "$M"
```

Expected: two lines, sorted by relpath, the `#L1` digest equal to the `line_hash` of (2) (else **STOP**); the manifest's digest to
the JOURNAL. (6) The timestamp, in the frozen form of ruling GO1-F (its two paths held in variables to keep lines short), then the
date:

```bash
cd /f/Monark && O="/f/MONARK SUITE/ots/venv/Scripts/ots" && D="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin" &&
PATH="$D:$PATH" "$O" --cache /f/tmp/ots-cache stamp docs/dojo-publications/timeline-seq1-manifest.txt; echo stamp_exit=$?;
date -u +%Y-%m-%dT%H:%M:%SZ
```

Expected: `stamp_exit=0` and `timeline-seq1-manifest.txt.ots` beside the manifest, a PENDING proof. Fewer than two calendars
answer: one more try in the same window, else a later window (a pending proof is never remade over a lost one). (7) The durable
copy, IMMEDIATELY (the pending proof carries a random nonce: lost, it cannot be rebuilt):

```bash
cd /f/Monark/docs/dojo-publications && T=$(date -u +%Y%m%dT%H%MZ) && mkdir -p /f/PRODUITS/dojo-mirror/ots &&
cp -n timeline-seq1-manifest.txt "/f/PRODUITS/dojo-mirror/ots/timeline-seq1-manifest-$T.txt" &&
cp -n timeline-seq1-manifest.txt.ots "/f/PRODUITS/dojo-mirror/ots/timeline-seq1-manifest-$T.txt.ots" &&
sha256sum "/f/PRODUITS/dojo-mirror/ots/timeline-seq1-manifest-$T.txt" "/f/PRODUITS/dojo-mirror/ots/timeline-seq1-manifest-$T.txt.ots"
```

Expected: the manifest's digest of (5) and the proof's digest (JOURNAL). (8) The commit of the pair (orchestrator, R-20; `.txt`
text eol=lf, `.ots` binary): the staged digest, the `File sha256 hash:` of `ots info` and the digest of (5) are one value (calque of
RUNBOOK-bell 13 bis, point 4); the register row and its service follow DOJO-ANCHOR-SERVE-1 (piste C). (9) Later, the upgrade,
ONLY once the durable copy of (7) exists:

```bash
cd /f/Monark && O="/f/MONARK SUITE/ots/venv/Scripts/ots" && D="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin" &&
PATH="$D:$PATH" "$O" --cache /f/tmp/ots-cache upgrade docs/dojo-publications/timeline-seq1-manifest.txt.ots; echo upgrade_exit=$?;
ls docs/dojo-publications
```

Expected: `upgrade_exit=0` ("Timestamp complete": the proof records a Bitcoin block, whose time is read per FAITS-BTC-BLOCKTIME-1)
or `upgrade_exit=1` "Timestamp not complete" (retry at a later window). A `.bak` the client leaves moves to
`/f/PRODUITS/dojo-mirror/ots/` (never committed, never served); the new proof is copied there too (digest to the JOURNAL), then
committed. **The upgraded proof opens nothing on the real path** (decision of 2026-10-01): DOJO-ANCHOR-OTS-DATE-RULE-1 (the first
counted day after the block, constated, never predicted) no longer gates A-9; until the upgrade, the anchor's date rests on its signed
line and the mirror of (3) alone, a declared limit carried by the item DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1.

## 17. A-10 — the publication timer and its cadence

Blockers: A-9 (section 7: the real seed and the signed anchor in force, the collect timer on); DOJO-PUBLISH-SINGLE-WRITER-1 (its own
lot: TB-23); DOJO-PUBLISH-PV-ATOMIC-1
and DOJO-VERIFY-PV-SCHEDULE-1 (G7 of PR-3a-1c and PR-1b-5a); the dated line of DOJO-VERIFY-SCALE-1; section 19 read.

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl enable --now monark-dojo-publish.timer &&
systemctl list-timers monark-dojo-publish.timer --no-pager'
```

Expected: the next elapse at 00:30, 01:30, 03:30 or 06:30 UTC. **Cadence** (PB-2; Q-G2-4 of PR-3a-1c): four slots a day; each start
publishes ONE day at most (`"status":"published"` and its day), or completes a `price_version` due, alone in its start
(`dojo/publish: completed_price_version` on stderr, D-C3), or publishes nothing (`nothing_to_publish`: the day is open, or published
already); a day closed after 06:30 waits for the next 00:30; after an outage, at most four days are caught up per UTC day. Each
start, read in the journal:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'journalctl -u monark-dojo-publish.service --since "<UTC date> 00:00:00 UTC" --no-pager -o cat |
grep -E "status|dojo/publish"'
```

Expected: `history_missing` at every start until the `history` line (decision 231; nothing written); the first start after it
publishes d (`"day":"<d>"`: the day after the history's last day, closed before the line by construction, 18 (iv)); then `published`
or `nothing_to_publish` (the next day open, or published already). **STOP** on every other refusal (section 19), `day_missing` first
(the day expected is not closed while a later day is: never waited out, B-1). Never a manual `--inbox` beside the timer (a second writer,
TB-23). Rollback (a stop): `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl disable --now monark-dojo-publish.timer'`.

Until the `history` line, each start exits 1 (`history_missing`, above), so the unit (`Type=oneshot`) stays `failed` between two
slots: `systemctl is-active` prints `failed` for it (read on the host on 2026-10-02 at 04:34 UTC), its normal state then and never a
stop; each guard of sections 16, 18 and 19 on the unit admits `inactive` or `failed` (the unit not running) and refuses `active`,
`activating`, `deactivating` or any other output (Q-1 of the G1 journal of RUNBOOK-PRE-IV).

Each day also, read-only, the lock files of the state (DOJO-PUBLISH-SINGLE-WRITER-1; Q-10 and D3-1 below):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'ls -l /var/lib/monark-dojo/publish.lock*; test ! -e /var/lib/monark-dojo/publish.lock ||
{ cat /var/lib/monark-dojo/publish.lock; echo; ps -o pid=,comm= -p "$(cut -d, -f1 /var/lib/monark-dojo/publish.lock | cut -d: -f2)" ||
echo OWNER-NOT-RUNNING; }'
```

Expected: `ls: cannot access '/var/lib/monark-dojo/publish.lock*': No such file or directory` (no lock and no residue: the usual case
outside a start). A `publish.lock` prints its record (`{"pid":<n>,"mode":"<mode>","taken_at":<ms>}`, not a secret), then its owner as
`<pid> <command>`: `<pid> node` (a launch writes: read again after its end, never a second launch beside it) or `OWNER-NOT-RUNNING` (a
launch stopped mid-way: the act `--unlock` of section 19, then the next start repairs the state); any other output (another command at
that pid, a record off its form): escalation, never removed by hand. A `publish.lock.<pid>` (a launch killed between the create and
the link of its lock, or the D3-1 case) never blocks a launch: JOURNAL only, nothing removed by hand. Q-10 and D3-1 (the publisher's
own code: `--unlock` also removing a `publish.lock.<pid>` whose process is dead; a failed removal of the temporary name after a
successful link ignored) wait for the first redeployment of the publication tree, the first key rotation, or 2026-10-09 at the latest
(dated decision of the orchestrator, 2026-10-02, `docs/ETAT.md`): both cases stop the publication or leave a file, never write a false
line; until then this listing is their parade.

## 18. A-11 — the first counted day and the history (TU-1p, TU-1h; B-1 of the G2 inspection of part 1)

J is the anchor day (A-8); o the first day the restarted collector opens (J + 1: the start (6) and the timer (7) are made on J,
section 7); d the first day it READS, the first counted day, read on the plan of o (section 7 (5) to (7); expected d = J + 1). Two
courses of the history collector of PR-2b (its acts), on the operator machine, each on a NEW `--state` (`history-collect.ts` pins its
fixed inputs in the first line of its journal, `inputs_mismatch` otherwise, and refuses a complete state, `phase_order`): the
PROVISIONAL course (`--provisional-day` J, lot FAST-START: a day read nowhere, never ahead of the clock, D_LAST = J − 1, `--cut` a
finalized slot of J), before the start (6), of which only `provisional/eve.json` is used: it writes no `publish/`, so it has no packet
and no line, and `--history` cannot read it; the FINAL packet (`--first-read` = d, so its last day is d − 1), after the close of d. The
`--first-read` of the final course is a CLOSED day, read with its check (`readDayLayout`): its `eve.json`, `publish/` and `readings/`
(ii), never `readings/` alone. Copies by `scp`, digests on both sides to the JOURNAL; none erases, but the act of (iii), on its copy only.

(i) The `Eve` of o. A-9 (1) to (4) done, on J: the provisional course, in the operator's shell holding the guard's variables and the
four cycle variables of `DOJO_HISTORY_ENV` (never displayed), on a new state outside any repository with its `ledger/`, `--cut` a slot
of J at the `finalized` commitment read through the guard by a scratch phase A first (below; Q-1 of the G1 journal of FAST-START), the
caps of act 1 (ADR-DOJO-PR-2B D-10), from `/f/Monark` at the SHA of `G7.txt` (`git -C /f/Monark rev-parse HEAD` to the JOURNAL). The
cut: a phase A on its own scratch state (phase A reads the whole index of the mint at both operators and only pins `--cut`, so any value
serves there; that state is kept aside, never resumed); the newest entry of each index is finalized and no transaction of J − 1 follows
it; `--cut` = the smaller of the two:

```bash
cd /f/Monark && T=/f/PRODUITS/dojo-history/cut-<J> && test ! -e "$T" && mkdir -p "$T/ledger" && X="--mint-file out/mint.txt --cut 1
--max-calls <n> --max-credits <n> --max-ru <n> --deadline <UTC instant> --provisional-day <J>" &&
node apps/dojo/src/history-collect.ts --phase A --state "$T" $X; echo "phase_A=$?"; T="$T" node --input-type=module -e '
import { readFileSync } from "node:fs"; import { gunzipSync } from "node:zlib"; const d = process.env.T + "/evidence/";
const s = readFileSync(d + "journal.jsonl", "utf8").split(String.fromCharCode(10)).filter((l) => l !== "").map((l) => JSON.parse(l))
.filter((l) => l.phase === "A" && l.unit === "" && typeof l.raw === "string")
.map((l) => JSON.parse(gunzipSync(readFileSync(d + l.raw)).toString("utf8"))[0].slot); console.log(s.join(" "), Math.min(...s));'
```

Expected: `dojo/history-collect: phase done`, `phase_A=0`, then the two slots and their minimum: `--cut` (JOURNAL; checked on the
simulated chain by the G1 of FAST-START: the minimum is the slot of the newest transaction). **STOP** on any other output. Then the
provisional course:

```bash
cd /f/Monark && S=/f/PRODUITS/dojo-history/provisional-<J> && test ! -e "$S" && mkdir -p "$S/ledger" &&
X="--mint-file out/mint.txt --cut <slot> --max-calls <n> --max-credits <n> --max-ru <n>
--deadline <UTC instant> --provisional-day <J>" && for p in A B C; do node apps/dojo/src/history-collect.ts --phase "$p" --state "$S" $X;
e=$?; echo "phase_$p=$e"; [ "$e" = 0 ] || break; done; cat "$S/evidence/status.json"; sha256sum "$S/provisional/eve.json"
```

Expected: `dojo/history-collect: phase done` then `phase_A=0`, the same for B, then `dojo/history-collect: provisional`, `phase_C=0`,
`{"status":"provisional","stop_reason":null}` and the digest of the `Eve` (JOURNAL). **STOP** on any other output, nothing deposited:
`provisional_day_future` (J is after today at the operator's clock), `usage`, `state_inside_repo`, `inputs_mismatch` or `phase_order` (a
state reused: a new one), `eve_empty` (an owner holds lots at the end of J − 1, yet no address has a line on it: escalation), `lock_held`,
or a partial reason (`evidence/status.json` and the course's `run.json`), but `method_cap` in phase C, resumed below.

**Phase C resumed on `method_cap`**: the guard caps `getSignaturesForAddress` per operator and per course at pages(S(J), 1000), 143 at
J = 22 (ADR-DOJO-PR-2B D-10; `packages/rpc-guard/src/client.ts`, counted per operator and method), and phase C reads the index of each
token account once at each operator, so a mint with more accounts stops C there, fail-closed; the same flags (a new `--deadline`), phase C
alone, again until `provisional` (D-11: a course serves what is closed and calls the rest, the closed accounts grow at each course):

```bash
cd /f/Monark && S=/f/PRODUITS/dojo-history/provisional-<J> && X="--mint-file out/mint.txt --cut <slot> --max-calls <n> --max-credits <n>
--max-ru <n> --deadline <UTC instant> --provisional-day <J>" && node apps/dojo/src/history-collect.ts --phase C --state "$S" $X;
echo "phase_C=$?"; cat "$S/evidence/status.json"; grep -c '"method":"close"' "$S/evidence/journal.jsonl"
```

Expected: `dojo/history-collect: provisional`, `phase_C=0` and the status of the first command, or `method_cap` again with a larger count
of closed accounts (once more); any other output: **STOP**. Then its `provisional/eve.json` → `bundles/<o>/eve.json` of the first day o
the restarted collector opens (section 7 (5)), `dojo-collect:dojo-handoff` 0640, BEFORE the start (6) and the timer (7) (else
`eve_missing` and a stop; `<local provisional state>` is the `$S` above):

```bash
scp -i ~/.ssh/monark_vps '<local provisional state>/provisional/eve.json' root@178.16.131.29:/root/dojo-eve-first.json &&
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cat /root/dojo-eve-first.json | sudo -u dojo-collect sh -c "umask 0027 &&
mkdir -p /var/lib/monark-dojo-collect/bundles/<o> && cat > /var/lib/monark-dojo-collect/bundles/<o>/eve.json.tmp &&
mv /var/lib/monark-dojo-collect/bundles/<o>/eve.json.tmp /var/lib/monark-dojo-collect/bundles/<o>/eve.json" &&
stat -c "%a %U:%G %s %n" /var/lib/monark-dojo-collect/bundles/<o>/eve.json && rm /root/dojo-eve-first.json'
```

```bash
A=$(sha256sum < '<local provisional state>/provisional/eve.json' | cut -c1-64) &&
B=$(ssh -i ~/.ssh/monark_vps root@178.16.131.29 'sha256sum < /var/lib/monark-dojo-collect/bundles/<o>/eve.json | cut -c1-64') &&
[ "$A" = "$B" ] && echo COPY-EQUAL || echo COPY-DIFFERENT
```

Expected: `640 dojo-collect:dojo-handoff <size> .../bundles/<o>/eve.json`, then `COPY-EQUAL`. (ii) A closed day → the operator machine:
`D` its directory on the host, `x` its day: d AFTER its close (its `publish/SHA256SUMS` exists), for (iii):

```bash
D=/var/lib/monark-dojo-collect/bundles/<x> && L=/f/PRODUITS/dojo-mirror/days/<x> && H=root@178.16.131.29 && mkdir -p "$L" &&
scp -r -i ~/.ssh/monark_vps "$H:$D/eve.json" "$H:$D/publish" "$H:$D/readings" "$L/" &&
cd "$L" && A=$(find eve.json publish readings -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t) &&
B=$(ssh -i ~/.ssh/monark_vps "$H" "cd $D && find eve.json publish readings -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t") &&
[ "$A" = "$B" ] && echo COPY-EQUAL || echo COPY-DIFFERENT
```

Expected: `COPY-EQUAL`; `/f/PRODUITS/dojo-mirror/days/<x>` is then the `--first-read` of the course (never `evidence/`: it stays on the host).

The FINAL course (N-2 of the G2 of FAST-START), on the operator machine as (i), after (ii) for x = d. Its `--cut` is S_CUT of d, the
largest `context_slot` of the enumerations of the first reading of d that carries two (ADR-DOJO-PR-2B D-3 l.230, DOJO-HISTORY-CUT-CHECK-1),
read by the course's own reader, never by the scratch phase A of (i):

```bash
cd /f/Monark && D=/f/PRODUITS/dojo-mirror/days/<d> && node --input-type=module -e '
const { readDayLayout } = await import("./apps/dojo/src/layout.ts"); const { recordBytes } = await import("./apps/dojo/src/bundle.ts");
const { firstRead } = await import("./apps/dojo/src/history-build.ts"); const f = firstRead(readDayLayout(process.argv[1]).records.map(recordBytes));
console.log(f.day, Math.max(...f.enumerations.map((e) => e.context_slot)));' "$D"
```

Expected: d and its S_CUT (JOURNAL; measured by FAST-CORR on a day of the simulated chain: the value printed passes the course's check,
one less is refused `inputs_mismatch`). **STOP** on any other output. Then the course, on a NEW state, with the flags of (i) (a new
`--deadline`), `--first-read` in place of `--provisional-day`:

```bash
cd /f/Monark && S=/f/PRODUITS/dojo-history/final-<d> && test ! -e "$S" && mkdir -p "$S/ledger" &&
X="--mint-file out/mint.txt --cut <S_CUT> --max-calls <n> --max-credits <n> --max-ru <n> --deadline <UTC instant>
--first-read /f/PRODUITS/dojo-mirror/days/<d>" && for p in A B C; do node apps/dojo/src/history-collect.ts --phase "$p" --state "$S" $X;
e=$?; echo "phase_$p=$e"; [ "$e" = 0 ] || break; done; cat "$S/evidence/status.json"; sha256sum "$S/publish/SHA256SUMS"
```

Expected: `dojo/history-collect: phase done` then `phase_A=0`, the same for B, then `dojo/history-collect: complete`, `phase_C=0`,
`{"status":"complete","stop_reason":null}` and the digest of `publish/SHA256SUMS` (JOURNAL); `$S` is then the `<local packet>` of (iii).
Phase C is resumed on `method_cap` as in (i), with these flags (Q-9 of the G1 journal of FAST-START: the same property), until `complete`.
**STOP** on any other output, nothing copied: `usage`, `state_inside_repo`, `inputs_mismatch` (a `--cut` other than S_CUT, or a state
reused: a new one) or `phase_order`, `lock_held`, or a partial reason (`evidence/status.json` and the course's `run.json`).

(iii) The FINAL packet (the directory holding its `publish/`: `SHA256SUMS`, `eve.json`, `history/<sha256>.jsonl`, `manifest.json`; its
manifest's `first_read_day` is d) → `/var/lib/monark-dojo/history-packet/publish/` (`dojo:dojo`, 0750 and 0640; never under `public/`,
which is served), after the close of d and before (iv):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'if [ -e /var/lib/monark-dojo/history-packet ]; then echo PACKET-EXISTS; exit 1; fi &&
install -d -o dojo -g dojo -m 0750 /var/lib/monark-dojo/history-packet' &&
scp -r -i ~/.ssh/monark_vps '<local packet>/publish' root@178.16.131.29:/var/lib/monark-dojo/history-packet/ &&
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /var/lib/monark-dojo/history-packet && chown -R dojo:dojo publish &&
find publish -type d -exec chmod 0750 {} + && find publish -type f -exec chmod 0640 {} + && cd publish && sha256sum -c --strict SHA256SUMS' &&
cd '<local packet>/publish' && A=$(find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t) &&
B=$(ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /var/lib/monark-dojo/history-packet/publish &&
find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t') && [ "$A" = "$B" ] && echo COPY-EQUAL || echo COPY-DIFFERENT
```

Expected: three `OK` lines, then `COPY-EQUAL`. A replay, or a copy cut short, prints `PACKET-EXISTS` (then `COPY-DIFFERENT`) and copies
nothing: **STOP**. Read the served timeline first: if its `history` line carries this packet's `history_sha256`, the act was done (go to
the end of (iv)); else the act below removes the copy (never while (iv) runs), then (iii) again. It is the one edit of the publisher's
state by hand, this packet only (Never):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'if test ! -e /var/lib/monark-dojo/publish.lock &&
systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed; then rm -r /var/lib/monark-dojo/history-packet && echo PACKET-REMOVED;
else echo PACKET-KEPT; exit 1; fi'
```

Expected: `PACKET-REMOVED`. `PACKET-KEPT` (Q-14 of the G2 inspection of part 2): a launch holds `publish.lock`, or the unit runs
(neither `inactive` nor `failed`): nothing removed, **STOP**: read the lock files (section 17) and the unit's journal; never a removal beside a writer.
Blockers: the acts of PR-2b and theirs (RG-SNAPSHOT-NONNEG-INT-1, DOJO-HISTORY-CROSS-INDEX-1, items Q-G2-4 of PR-2b-4).

**The size of (iv)** (Q-12 of the G2 inspection of part 2), before each (iv), read-only, on the local copy of the packet that (iii)
copied (`<local packet>`): its history lines, its addresses and its days (`history_first_day` to `history_last_day`, both counted),
against the grid that DOJO-VERIFY-SCALE-1 measured (the publish unit's comment; G1 journal of PR-3b-2a): N ≤ 10 000 addresses at
30 days at most, N ≤ 1 144 at 365 days at most:

```bash
node --input-type=module -e '
import { readFileSync, statSync } from "node:fs"; const p = process.argv[1], m = JSON.parse(readFileSync(p + "/manifest.json", "utf8"));
const f = p + "/history/" + m.history_sha256 + ".jsonl", o = readFileSync(f, "utf8").split(String.fromCharCode(10)).filter((l) => l !== "");
const n = new Set(o.map((l) => JSON.parse(l).address)).size, d = (Date.parse(m.history_last_day) - Date.parse(m.history_first_day)) / 864e5 + 1;
const ok = (n <= 10000 && d <= 30) || (n <= 1144 && d <= 365); process.exitCode = ok ? 0 : 1;
console.log("lines=" + o.length, "addresses=" + n, "days=" + d, "bytes=" + statSync(f).size, ok ? "IN-GRID" : "BEYOND-GRID");' '<local packet>/publish'
```

Expected: one line `lines=<n> addresses=<n> days=<n> bytes=<n> IN-GRID` (JOURNAL; `bytes`, the history file's size, for the item
DOJO-PUBLISH-SCALE-1: the verifier refuses a file over 64 MiB; `days=22` when d − 1 is 2026-10-01: the history's first day is fixed,
2026-09-10, so a last day after 2026-10-09 leaves only N ≤ 1 144 in the grid). **STOP** on `BEYOND-GRID` (exit 1): no (iv) before a
load measurement of the act at these values (the protocol of DOJO-VERIFY-SCALE-1; item DOJO-PUBLISH-SCALE-1), escalation to the
orchestrator; any other output (a packet off its format): **STOP**.

(iv) The `history` line (PR-3a-2), after (iii), before the first `snapshot`: ONE transient job with the unit's user, sandbox, credential,
`UnsetEnvironment=` (as A-8 (2)), read-only inbox (the unit's `SupplementaryGroups=` and `ReadOnlyPaths=`: `--history` reads d in `bundles/`)
and `InaccessiblePaths=` (the collect side's credentials, EnvironmentFile and ledger, as ONE argument `"$I"`, a list as `"$U"`), each property
the unit's own (`dojo_runbook_jobs_carry_the_unit_properties`), the unit not running at that instant (`inactive`, or `failed` until
the `history` line: section 17) and away from its four slots (one writer at a time: a timer start beside the job refuses `lock_held`, or
the job does; nothing written either way):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed &&
S="-p PrivateNetwork=yes -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true
-p ReadWritePaths=/var/lib/monark-dojo -p UMask=0022 -p SupplementaryGroups=dojo-handoff -p ReadOnlyPaths=/var/lib/monark-dojo-collect/bundles" &&
K="-p LoadCredential=dojo-signing-key:/etc/monark/dojo/signing-key.pem" &&
U="--property=UnsetEnvironment=NODE_OPTIONS NODE_TLS_REJECT_UNAUTHORIZED NODE_EXTRA_CA_CERTS SSL_CERT_FILE SSL_CERT_DIR" &&
U="$U HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY http_proxy https_proxy all_proxy no_proxy" &&
I="--property=InaccessiblePaths=/etc/monark/dojo-collect /etc/monark/dojo-collect.env /var/lib/monark-dojo-collect/ledger" &&
C="/usr/bin/env node /opt/monark-dojo/apps/dojo/scripts/dojo-publish.mjs --history /var/lib/monark-dojo/history-packet
--inbox /var/lib/monark-dojo-collect/bundles --state /var/lib/monark-dojo" &&
systemd-run --wait --pipe --collect --uid=dojo --gid=dojo $S "$U" "$I" $K $C'
```

Expected: one JSON line `{"status":"published","seq":<n>,"published_at":"<ISO>","key_id":"<key_id>","line_hash":"<64 hex>",
"history_last_day":"<d − 1>","history_sha256":"<64 hex>","history_lines_count":<n>}` (JOURNAL; `history_sha256` equal to that of the
packet's `manifest.json`). BEFORE its line, `--history` reads d (its `history_last_day` + 1) in the inbox, then builds the first `snapshot`
of d at blank, by `publishDay` itself, and the reader's verifier checks it WITH the line (B1-PRECHECK-FULL-1): every refusal the first
publication of d would meet comes here, before the irreversible line, and writes nothing (section 19):

- `first_read_day_open`: d is not closed yet, or not over: wait for its close, then (iv) again;
- `eve_mismatch`: d lacks an address holding lots on the history's last day. The residue of B-1, declared: an address absent from the
  provisional `Eve` (no line on J − 1 and no balance at its `--cut`: that `Eve` holds both, Q-2 of the G2 of FAST-START) that held lots on
  d − 1, then closed its account before the first instant read of d (so absent from its enumerations); none when that cut is on J and
  d = J + 1 (such an address holds at every instant of J, so at the cut). The next closed day replaces d (one more day, never a false
  line): the act of (iii) removes this packet, then (ii), a final course with `--first-read` = d + 1 (one more course) and (iii) again,
  then (iv);
- `history_bundle_malformed` with `publish/manifest.json: first_read_day`: the packet's first day read is not the day after its last day
  (a packet not made by the writer of PR-2b); the act of (iii), then the right packet;
- `day_not_after_anchor`, `bundle_day_mismatch`, `bundle_anchor_mismatch`, `seed_outside_anchor_chain` (the bundle of d against the anchor
  and the seed in force: section 7 (3) and (4); a day past the anchor's horizon too), `line_refused` (the verifier refuses the `snapshot`
  of d, its seq named): **STOP**, d is not publishable as it is; escalation (a new collection under the right anchor and seed);
- any other refusal: **STOP** (section 19).

A replay gives `history_exists`: read the served timeline first (its `history` line carries this `history_sha256`: the act was done;
else escalation). Then the packet goes, under the guard of the act of (iii) (Q-14):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'if test ! -e /var/lib/monark-dojo/publish.lock &&
systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed; then rm -r /var/lib/monark-dojo/history-packet && echo PACKET-REMOVED;
else echo PACKET-KEPT; exit 1; fi'
```

Expected: `PACKET-REMOVED`; `PACKET-KEPT`: a launch holds `publish.lock`, or the unit runs (neither `inactive` nor `failed`): nothing removed, **STOP**:
read the lock files (section 17) and the unit's journal; never a removal beside a writer. Then the offline check of A-8 (3) and (4)
runs on a new mirror `public-seq<n>`: `verify_exit=0`. The next slot of the timer publishes d (section 17). Between the `history`
line and that first `snapshot`, no act on the publisher (its state, its units) nor on `bundles/<d>`, the removal of the packet above
excepted (Q-13: the `snapshot` checked by (iv) is built at the act's clock; a rotation, an anchor or an edit of `bundles/<d>` in
between could make its publication refuse, by a named stop).

## 19. The publisher's refusals — every one a STOP (consignes of PR-3a-1c; pinned by T-A11)

A refusal is one line `dojo/publish: <code>: <detail>` on stderr, exit 1, and NOTHING written (the commit point is the private
timeline's durable append, after the checks). The detail names a file, a key or a seq, never a value. The closed list:

| Code | From | The orchestrator |
|---|---|---|
| `existing_timeline_corrupt` | every mode: the state does not re-read as committed | **STOP**; read the detail; never edit the state by hand; escalation |
| `signing_key_missing` | every mode but `--generate-key`: the credential | **STOP** (A-5p: the sandbox or the key file) |
| `signing_key_not_in_keyring` | the loaded key is not the active key | **STOP** (a rotation half made: section 20) |
| `price_version_pending` | `--anchor` while a `price_version` is due | **STOP**: run `--inbox` first (the next start completes it, D-C3) |
| `anchor_malformed` | `--anchor`: the fifteen keys, the accounts, `read_rule` | **STOP**; fix the request (A-8 (1)) |
| `line_refused` | the walker or the verification before the append | **STOP**, escalation (below) |
| `no_timeline` | `--rotate`, `--revoke`, `--history` on an empty state | **STOP** |
| `key_already_in_keyring` | `--rotate` with a key already in the keyring | **STOP** |
| `revocation_invalid` | `--revoke`: the key or the seq | **STOP** |
| `key_file_exists` | `--generate-key` over a file | **STOP**; never remove a key to make room |
| `anchor_on_published_day` | `--anchor` on or before the last published day | **STOP**; a new anchor comes on a later day |
| `history_missing` | `--inbox` before the `history` line | expected until that line (decision 231); **STOP** after it |
| `history_exists` | `--history`: the timeline holds its `history` line already | **STOP**; a replay: read the served timeline first (section 18 (iv)) |
| `history_after_snapshot` | `--history` after a `snapshot` line | **STOP**; the `history` line precedes the first snapshot: escalation |
| `history_bundle_malformed` | `--history`: `publish/SHA256SUMS`, a file missing or unlisted, `manifest.json` | **STOP**; read the detail; never edit it |
| `first_read_day_open` | `--history`: the first day read (d) not closed in the inbox, or not over | **STOP**; wait for the close of d, then 18 (iv) again |
| `history_bundle_mismatch` | `--history`: a file off its digest, or `eve.json` off the last history day | **STOP**; read the detail; the copy (18 (iii)) |
| `lock_held` | every mode that writes `--state`, and `--unlock`: `publish.lock` (one writer) | **STOP**; never remove the lock by hand (below) |
| `day_not_after_anchor` | a day at or before the anchor's day (M-E8) | **STOP** |
| `bundle_day_mismatch` | the day's directory and its `day.json` | **STOP** |
| `bundle_anchor_mismatch` | mint, program or `k_reads` of the day; `--history`: the packet's mint or program | **STOP** (the anchor in force: section 7 (4)) |
| `seed_outside_anchor_chain` | the day's seed off the anchor's chain (M-E6) | **STOP** (the seed in force: section 7 (3)) |
| `eve_mismatch` | an address holding lots missing from the day (`--history`: the first day read) | **STOP** (the `Eve` of the first day: A-11 (i); 18 (iv)) |
| `day_missing` | `--inbox`: the day expected not closed while a later day is (a gap, B-1) | **STOP** (section 17); escalation, never waited out |
| `layout_malformed` | the layout reader of PR-2-2 | **STOP** |
| `layout_sha_mismatch` | the layout reader: a digest of `SHA256SUMS` | **STOP** |
| `layout_stray_file` | the layout reader: a file off its closed list | **STOP**; a `readings/<name>.tmp`: section 8 |
| `eve_malformed` | the layout reader: the `Eve` | **STOP** |
| `day_not_ended` | the bundle reader of PR-2-1 | **STOP** |
| `bundle_input_malformed` | the bundle reader | **STOP** |
| `record_malformed` | the bundle reader: a reading | **STOP** |
| `bundle_malformed` | the bundle reader: `day.json` | **STOP** |
| `bundle_records_mismatch` | the bundle reader: the readings and `day.json` | **STOP** |

**`line_refused`** (C-G2-1 of PR-3a-1c, dated line 21:4x): the detail names the seq, the reason and the sub-check; nothing is
written. Known motive: an anchor line appended OUTSIDE `--anchor` above a `price_version` due (a signer handled by hand): nothing is
due any more (the segment guard), but the verification refuses every later day (`version_not_in_force` at the seq of that anchor),
at every start: a DURABLE stop, fail-closed, without writing; a new anchor does not repair it; the only remedy is a new timeline.
Escalation to the orchestrator before anything else; never an edit of the timeline.

**`lock_held`** (DOJO-PUBLISH-SINGLE-WRITER-1): every launch that writes `--state` takes `<state>/publish.lock` first; nothing is
written by a refused launch. Its detail names the owner: `running` (another launch writes: wait for its end, read the journal, never
a second launch beside it); `not running: --unlock releases it` (a launch stopped mid-way: the act below, then the next start repairs
the state from the committed timeline); `owner unreadable` (escalation; never removed by hand). The act, ONE transient job with the
unit's user and sandbox, without the credential (`--unlock` reads no key), the unit not running (`inactive` or `failed`):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed &&
S="-p PrivateNetwork=yes -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true
-p ReadWritePaths=/var/lib/monark-dojo -p UMask=0022" && C="/usr/bin/env node /opt/monark-dojo/apps/dojo/scripts/dojo-publish.mjs
--unlock /var/lib/monark-dojo" && systemd-run --wait --pipe --collect --uid=dojo --gid=dojo $S $C'
```

Expected: `{"status":"unlocked","pid":<n>,"mode":"<mode>","taken_at":<ms>}` (JOURNAL) or `{"status":"not_locked"}`. **STOP** on
`lock_held` (the owner runs, or cannot be judged): escalation.

## 20. A key rotation and the page (consigne of QF-3 (d), ADR-DOJO-PR-4 dated line 01:3x)

A rotation of the signing key (the publisher's `--rotate`: the new key generated ON the host as in A-4p, its PUBLIC part committed
and pushed BEFORE the `key_rotation` line, in the order of item KEYRING-COMMIT-AFTER-KEY-LINE-1 of Bell) is a one-off act under go,
the unit `inactive`. Until the next synchro (TU-7, PR-3b-2b), the page's live reread (PR-4c-1) falls back to the committed figures
and their day (TXT-14c, TXT-14d): the day shown is the committed one, never hidden. Then a new CA and a new synchro, as after any
redeployment (DOJO-SYNC-G7-REF-1).

## 21. A-6 — Caddy serves `dojo.monarkgate.tech`: the extract installed WHOLE, then a main file of the two `import` lines alone

**When, and after what** (ADR-DOJO-PR-3 PB-5, act A-6; section 10, order): on the announcement day, after A-1 (the A record of
`dojo.monarkgate.tech`, read back: ACME needs it) and after the first `snapshot` is published; AFTER the REPLACE → IMPORT procedure of
`docs/RUNBOOK-bell.md` step 7 (lot BELL-CA-DOJO-1: Bell's site in `/etc/caddy/monark-bell.caddyfile`, the main file its one `import`
line, Bell's CA 12/12 right after it). Bell's CA runs here from a checkout `/f/Monark` that carries the lot BELL-CA-DOJO-1: its check
11 (b) accepts the two `import` lines (any other checkout turns Bell's CA red at this act). The extract is the blob of the Dojo G7
(`/f/tmp/dojo-dn/G7.txt`), installed WHOLE at `/etc/caddy/monark-dojo.caddyfile`, never edited on the host; its first line that is
neither blank nor a comment is the site address `dojo.monarkgate.tech {` (no global options block; measured on the blob at `224a6bd1`,
line 13; re-read by (1)). Conventions of section 10 and of the procedure of RUNBOOK-bell step 7: `'root@<bell>'` is the SSH target of
section 1, `<bell>` replaced by the host address written there before a command runs (left as is, `ssh` resolves no host, nothing runs).

(1) Read-only, the state before the act (Bell's one-line main file, no name of this act yet), recorded locally:

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-dojo" |
grep -v -E '^[[:space:]]*(#|$)' | head -1; A=/f/tmp/dojo-dn/a6-before.txt;
ssh -i ~/.ssh/monark_vps 'root@<bell>' 'cd /etc/caddy && sha256sum Caddyfile monark-bell.caddyfile && ls -1 /etc/caddy' > "$A"; echo exit=$?; cat "$A"
```

Expected: `dojo.monarkgate.tech {`; `exit=0`; `d51755c50a15dac943dafdf7ff1bffe4ceb110923660d46723cdcba774faf51f  Caddyfile` (Bell's one
`import` line, RUNBOOK-bell step 7 (2)), the digest of Bell's blob at Bell's G7 for `monark-bell.caddyfile`, and a listing with NONE of
`monark-dojo.caddyfile`, `Caddyfile.new`, `Caddyfile.bak-dojo`. **STOP** otherwise: another first line, Bell not migrated (RUNBOOK-bell
step 7 first), or this act already started (rollback (a) or (b) below, or read the host). Rollback: none (read-only).

(2) The act: the backup first, the extract (inert: the main file in place does not import it), the candidate main file of the two
`import` lines alone, `caddy validate` on the candidate BEFORE it is live, the atomic rename, `systemctl reload caddy` (never `restart`):

```bash
G7=$(cat /f/tmp/dojo-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-dojo" |
ssh -i ~/.ssh/monark_vps 'root@<bell>' 'cd /etc/caddy && test ! -e Caddyfile.bak-dojo && cp -p Caddyfile Caddyfile.bak-dojo && umask 022 &&
cat > monark-dojo.caddyfile && echo "import /etc/caddy/monark-bell.caddyfile" > Caddyfile.new &&
echo "import /etc/caddy/monark-dojo.caddyfile" >> Caddyfile.new && caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile &&
mv Caddyfile.new Caddyfile && systemctl reload caddy && systemctl is-active caddy && sha256sum Caddyfile monark-dojo.caddyfile'
```

Expected: `Valid configuration`; `active`; `aa06619ff02fcd588f805b70f9cb7624577f097642feba9f6c7256205674321d  Caddyfile` (the two lines,
Bell's then the Dojo's, each with its LF) and, for `monark-dojo.caddyfile`, the local digest
`git -C /f/Monark cat-file blob "$(cat /f/tmp/dojo-dn/G7.txt):deploy/Caddyfile.monark-dojo" | sha256sum`. Until `caddy validate` passes,
`/etc/caddy/Caddyfile` is untouched; the candidate goes live by `mv` only. **STOP** on any other output: without `Valid configuration`,
rollback (a); with it, rollback (b).

(3) The expected controls, then Bell's CA:

```bash
curl -sS -o /dev/null -w "%{http_code} %{ssl_verify_result}" https://dojo.monarkgate.tech/; echo;
curl -sS -o /dev/null -w "%{http_code}" https://dojo.monarkgate.tech/timeline.jsonl; echo;
curl -sS -o /dev/null -w "%{http_code} %{ssl_verify_result} %{redirect_url}" https://bell.monarkgate.tech/; echo
```

Expected: `404 0` (the host root answers 404 until DOJO-HOST-ROOT-1; the certificate, issued by automatic HTTPS, is valid: retry after
30 s while ACME completes, at most 5 tries, as RUNBOOK-bell step 8); `200` (the first `snapshot` is published); `302 0
https://monarkgate.tech/bell` (Bell still served). Then RUNBOOK-bell step 11, a fresh capture and Bell's CA: `VERIFY OK - 12/12` with the
two `import` lines (check 11 (b)); then CA-1. **A certificate refused** (a TLS result other than `0` after the retries), or a check that
the policy of the orchestrator's tool refuses: never bypassed (no `-k`, no `--insecure`, no `NODE_TLS_REJECT_UNAUTHORIZED`, no other
client): **STOP**; `journalctl -u caddy -n 50 --no-pager` read first (no secret there); the check becomes an act of the investor, from
the investor's own machine, written to the JOURNAL as such; no CA-1 before it. Bell red, or any other result: **STOP**, rollback (b).

Rollback (a), before the `mv` (the output of (2) has no `Valid configuration`: the live file never changed):

```bash
ssh -i ~/.ssh/monark_vps 'root@<bell>' 'cd /etc/caddy && cmp Caddyfile Caddyfile.bak-dojo &&
rm -f Caddyfile.new monark-dojo.caddyfile Caddyfile.bak-dojo; ls -1 /etc/caddy'
```

Expected: no `cmp` output and none of the three names in the listing; then (1) again before any retry. No `Caddyfile.bak-dojo` at all:
(2) stopped before its backup, nothing to remove. A `cmp` difference: **STOP**, rollback (b).

Rollback (b), after the `mv`, complete (BEFORE any rollback of RUNBOOK-bell step 7): Bell's one-line main file back, then the extract
removed:

```bash
ssh -i ~/.ssh/monark_vps 'root@<bell>' 'cd /etc/caddy && cp -p Caddyfile.bak-dojo Caddyfile.new &&
caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv Caddyfile.new Caddyfile && systemctl reload caddy &&
systemctl is-active caddy && rm monark-dojo.caddyfile Caddyfile.bak-dojo && sha256sum Caddyfile'
```

Expected: `Valid configuration`; `active`; `d51755c50a15dac943dafdf7ff1bffe4ceb110923660d46723cdcba774faf51f  Caddyfile`; then
RUNBOOK-bell step 8 and step 11 (Bell 12/12, one `import` line); `dojo.monarkgate.tech` no longer served (the A record: A-1's rollback).

## Never

`cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64` on a seed file or on `/etc/monark/dojo-collect.env`, or a digest of them displayed;
`set -x`; printing the environment; a seed generated off the host or inside a code tree; `--init` over an existing path (never remove
a seed to make room, except the rehearsal seed at A-9); `systemctl edit` on the collect units; a `RandomizedDelaySec`, a longer step,
a default `AccuracySec` or a calendar without `UTC`; a path of the publication side (its key directory, its state) readable or
writable by the collect unit; a credential source (seed, anchor) under the state directory; editing a bundle, a reading, an `Eve` or
the anchor by hand outside sections 5, 6, 7 and 18 (i) (only the `readings/*.tmp` of section 8 are removed); a `.lock` removed by hand or an
`unlock` run as root (section 9); moving `bundles/` while a step runs (section 7).

Publication side: `cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64`/`openssl` on the signing key, or its digest displayed; a key
generated off the host; `systemctl edit` or a drop-in on the publication units; `systemctl enable` of the publish unit (its timer
only, at A-10); `--inbox` run by hand beside the timer (a second writer); `ots stamp` before the offline check of A-8 (4); `ots
upgrade` before the durable copy of A-8 (7); a counted day held back for the Bitcoin block (A-8 (5) to (9) follow the first `snapshot`,
DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1); a rehearsal day on the real path (section 6); editing the publisher's
state or `public/` by hand (the history packet excepted: its copy is removed by the act of 18 (iii), and by the end of (iv)); a listing, a
proxy or a redirect of `/` in the Caddy extract; the anchor request left in the state; a `history` line before the close of the first day
read, or from the provisional course (18: it writes no packet).
