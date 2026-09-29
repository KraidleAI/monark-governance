# RUNBOOK — MONARK Dojo on the Bell host: the collect side and the rehearsal (orchestrator-deployed)

**What.** The collector `apps/dojo/src/collect.ts` runs as the systemd unit `monark-dojo-collect.service`, started every 5 minutes by
`monark-dojo-collect.timer`: each start is one idempotent `--tick` (it closes each ended day, plans the day before 00:15 UTC, reads
each due instant) writing only under `/var/lib/monark-dojo-collect`. This file is written at PR-3b-1 and covers the collect side of
acts A-2 to A-5, the rehearsal (A-7) with its `Eve` (A-11-rep), the collect side of A-9, the host rule DOJO-TMP-STRAY-1 (section 8)
and the guard's lock left held (section 9). PR-3b-2 completes it: user `dojo`, publication unit and timer, Caddy, CA, keyring and
anchor (A-1, A-6, A-8, A-10, A-11).

**Normative sources.** `docs/adr/ADR-DOJO-PR-3.md` (D-1 table l.64, D-2, D-3 variant A and acts A-1 to A-11, D-4, D-5, section 7,
dated lines of 13:13Z, 14:13Z and 15:00Z); `docs/adr/ADR-DOJO-PR-2.md` (D-1 dated line C-V-2: the closed argv, DOJO-TICK-ARGV-1; D-7
dated line C-V-1: the day layout, DOJO-HANDOFF-LAYOUT-1; dated line 08:28Z); `docs/dojo/FAITS-systemd-timer-2026-09-27.md` (systemd 259
on this host, `*:0/5`, `AccuracySec` default 1 min; FAITS-SYSTEMD-CRED-1; FAITS-SYSTEMD-TIMEOUT-1); `docs/RUNBOOK-sentinel.md`
(l.417-429, the repair after SIGKILL: the precedent of section 9); constants `scripts/dojo-deploy.mjs`; pins `test/dojo-collect-deploy.test.ts`.

**Who and when.** The orchestrator, from its own machine (Git Bash), over SSH to the Bell host with the deploy key
(`ssh -i ~/.ssh/monark_vps root@178.16.131.29`), and **only under the investor's grouped go on the closed list A-1 to A-11**
(ADR D-3, dated line C-V-4). Before the grouped go: FAITS-JOURNALCTL-1 (the message forms of systemd 259 that section 6 counts, read
on this host; dated line 14:13Z, Q-12). At the first host act: DOJO-UNIT-OFFLINE-ORACLE-1. Before A-4: HELIUS-CREDIT-RECONCILE-1.
Before A-5: DOJO-COLLECT-SIGTERM-UNLOCK-1 (DRAND-RELAY-GET-1b: `collect.ts` releases its locks on SIGTERM); `man systemd.exec`
(Credentials, `InaccessiblePaths=`) and `man systemd.service` (`TimeoutStartSec=`) read on this host, to confirm on systemd 259 the
"latest" pages read by the orchestrator for FAITS-SYSTEMD-CRED-1 (14:12:49Z) and FAITS-SYSTEMD-TIMEOUT-1 (14:13:55Z); the start of
section 5 is the empirical proof. Before A-7: DOJO-DRAND-RELAY-TERMS-1, the lot DRAND-RELAY-GET-1 (until then `main` of `collect.ts`
hands no beacon relay and every step before 00:15 UTC refuses `relay_missing`), HELIUS-CREDIT-RECONCILE-1, QI-5,
RPC-GUARD-FIRST-APPEND-HEAD-1 (section 9). Before A-9: FAITS-BTC-BLOCKTIME-1, DOJO-OPERATOR-INDEPENDENCE-1, P-4 and the rehearsal
criterion of section 6.

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
in it: the transport appends `?api-key=` from `HELIUS_API_KEY`, `packages/rpc-guard/src/transport.ts:93-97`):

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
(a drop-in changes the pinned argv); the timer is enabled at A-7 only. Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm /etc/systemd/system/monark-dojo-collect.service /etc/systemd/system/monark-dojo-collect.timer && systemctl daemon-reload'`.

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
`collect.ts` tick), so it writes nothing and calls nothing, and the first day the timer opens later is not this one (section 6):

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
the peak and the effective limit to the JOURNAL; the same command runs again during the first reading step of A-7 (its instant is in
`bundles/<d>/evidence/plan.json`), the step that opens sockets; a dated line pins the value from these two readings:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl start --no-block monark-dojo-collect.service; for i in $(seq 1 200); do systemctl show -p TasksCurrent --value monark-dojo-collect.service; sleep 0.05; done | grep -E "^[0-9]+$" | sort -n | tail -n 1; systemctl show -p EffectiveTasksMax --value monark-dojo-collect.service'
```

Expected: a peak (a number under 64) and `64`, both to the JOURNAL; the orchestrator pins `TasksMax` by a dated line from this reading
and the one of A-7 (dated line 15:00Z). **STOP** on a start that fails for lack of tasks (the job cannot create a thread or process).

## 6. A-7 — the rehearsal (QI-5, DOJO-REHEARSAL-DAY-1)

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

**Start timeout** (`TimeoutStartSec=1500`, dated line 15:00Z): the worst course of one reading read in the code is 1210 s (the
unit's comment); a step still `activating` after 1500 s is ended by systemd (SIGTERM, the unit `failed`), and a course killed that
way leaves the guard's locks held: every later step refuses `lock_held` until section 9. A step runs one course per due instant: two
instants in the same 5-minute slot make one step of two courses.

## 7. A-9 (collect side) — from the rehearsal to the counted days

After the signed anchor of A-8 (PR-3b-2), in this order. (1) Stop the timer and wait until no step runs: a running oneshot is
`activating` (systemd.service(5): without `RemainAfterExit=` it never enters `active`), and 360 waits of 5 s outlast
`TimeoutStartSec`:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl disable --now monark-dojo-collect.timer; for i in $(seq 1 360); do [ "$(systemctl is-active monark-dojo-collect.service)" = activating ] || break; sleep 5; done; systemctl is-active monark-dojo-collect.service'
```

Expected: `inactive`. **STOP** on `failed` (read the journal; `lock_held` or a killed course: section 9 first) or on anything else.
(2) Archive the rehearsal outside `bundles/` and open a new `bundles/` (keep `ledger/`: the cycle's credits are real), (3) put the
real seed in force, (4) put the signed anchor line in force as the credential source (the first line of the publisher's private
timeline, layout of PR-3a-1, to be confirmed at its G7), each only while the unit is `inactive`:

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 '[ "$(systemctl is-active monark-dojo-collect.service)" = inactive ] && mv /var/lib/monark-dojo-collect/bundles "/var/lib/monark-dojo-collect/rehearsal-$(date -u +%F)" && install -d -o dojo-collect -g dojo-handoff -m 2750 /var/lib/monark-dojo-collect/bundles && shred -u /etc/monark/dojo-collect/seed && mv /etc/monark/dojo-collect/seed.next /etc/monark/dojo-collect/seed && umask 077 && head -n 1 /var/lib/monark-dojo/timeline.jsonl > /etc/monark/dojo-collect/anchor.json && chown root:root /etc/monark/dojo-collect/anchor.json && chmod 0600 /etc/monark/dojo-collect/anchor.json && stat -c "%a %U:%G %s %n" /etc/monark/dojo-collect/seed /etc/monark/dojo-collect/anchor.json'
```

Expected: `600 root:root 65 /etc/monark/dojo-collect/seed`, `600 root:root <size> /etc/monark/dojo-collect/anchor.json`; nothing
at all if the unit was not `inactive` (redo (1)). (5) A-11 (PR-3b-2) deposits the `Eve` of the first day d the restarted collector
opens (d = the day after the signed anchor's `published_at` day if the start is made on that day, else the day of the start, UTC)
at `bundles/<d>/eve.json`, as in section 6 (`dojo-collect:dojo-handoff` 0640), BEFORE the start; its content is the `Eve` of the
`publish/` of PR-2b-4 (addresses only, ADR D-2 TU-1p), never the empty one. (6) Then the start of section 5 (made on the anchor day:
expected as there; after it: `start_exit=0`, no `dojo/collect:` line, `bundles/<d>/evidence/plan.json` present), and (7) only then
`systemctl enable --now monark-dojo-collect.timer`. **STOP** on `eve_missing` (the `Eve` is not on the day the chain stops at) and on
every line of section 5. The first counted day follows DOJO-ANCHOR-OTS-DATE-RULE-1 (ADR D-4: the first day after the anchor day whose
T_d follows the Bitcoin block constated by `ots upgrade`). Rollback: none that erases (a wrong seed or anchor in force is refused by
the collector, `seed_mismatch`; the archive of the rehearsal is kept).

## 8. Host rule DOJO-TMP-STRAY-1 — a stray `readings/*.tmp`

**When**: the collect journal shows `dojo/collect: layout_stray_file`, or the publisher refuses a day with `layout_stray_file` naming
`readings/<name>.tmp`. **Why**: every file of a day is written as `<path>.tmp` then renamed (`writeAtomic`, `apps/dojo/src/layout.ts`);
a stop between the two leaves the `.tmp`; the next write of the same path reuses and renames it, so a stray outlives its day only when
no such write comes (for example a manual start of the same reading beside the timer, stopped after the other one renamed). The
layout reader refuses any file of `readings/` outside its closed list. Code fix: G1 of DRAND-1b, before A-5 (rerouted 2026-09-30, ADR-DOJO-PR-1B-4 Q-1).

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
until this section is done. **Why**: a step killed in the middle of a course (`TimeoutStartSec`, the OOM killer of `MemoryMax`, a
stop or reboot of the host) leaves `<cycle>/helius.lock` and `<cycle>/solana-foundation.lock` under `ledger/` (only the first one
if the kill falls between the two acquisitions); a stale lock STAYS held
and only the served, ledgered `unlock` releases it (`packages/rpc-guard/src/lock.ts:4-6`); until DOJO-COLLECT-SIGTERM-UNLOCK-1,
`collect.ts` has no SIGTERM handler. First, the state (read-only; the lock files hold `{pid, iso}`, no secret):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl stop monark-dojo-collect.timer; systemctl is-active monark-dojo-collect.service; ls /var/lib/monark-dojo-collect/ledger/*/*.lock; for f in /var/lib/monark-dojo-collect/ledger/*/*.lock; do echo "$f $(cat "$f")"; done'
```

Expected: `inactive` or `failed`, NEVER `activating` (a live step: wait and re-run; never unlock a live step); one or both of the
paths `<cycle>/helius.lock` and `<cycle>/solana-foundation.lock`, of ONE cycle, else **STOP** (another lock name, or two cycles); for each, a pid that no longer exists (check
`ps -p <pid>` prints no process line), else **STOP**. Then the served `unlock` of each operator, as `dojo-collect` and NEVER as root
(a root-owned ledger file would make the unit's next appends fail), with `--floor 0` (the `unlocked` line carries no credit):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cd /opt/monark-dojo-collect && for op in helius solana-foundation; do L=$(ls /var/lib/monark-dojo-collect/ledger/*/$op.lock 2>/dev/null) || { echo "$op: no lock"; continue; }; C=$(basename "$(dirname "$L")"); sudo -u dojo-collect /usr/bin/env node /opt/monark-dojo-collect/packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir /var/lib/monark-dojo-collect/ledger --floor 0 unlock --cycle "$C" --op "$op" --reason runbook-lock-held-unlock; echo "$op exit=$?"; test ! -e "$L" && echo "$op lock released"; tail -n 1 "/var/lib/monark-dojo-collect/ledger/$C/$op.jsonl"; done'
```

Expected, for each operator with a lock (`<op>: no lock` for the other): `exit=0`, `lock released`, and a last ledger line with `"outcome":"unlocked"` and
`"reason":"runbook-lock-held-unlock"` (JOURNAL: time, cycle, pids, the two lines). Then `systemctl start monark-dojo-collect.timer`;
the next steps read again (a reading whose window passed meanwhile is written missed at the close). **STOP, no repair by hand,
escalation to the orchestrator** if `unlock` fails on "head sidecar" or "cycle ledger" (fail-closed C-V-8: for example a kill between
the first line of a new cycle's ledger and its head, item RPC-GUARD-FIRST-APPEND-HEAD-1). Never `rm` of a `.lock`, never root.

## Never

`cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64` on a seed file or on `/etc/monark/dojo-collect.env`, or a digest of them displayed;
`set -x`; printing the environment; a seed generated off the host or inside a code tree; `--init` over an existing path (never remove
a seed to make room, except the rehearsal seed at A-9); `systemctl edit` on the collect units; a `RandomizedDelaySec`, a longer step,
a default `AccuracySec` or a calendar without `UTC`; a path of the publication side (its key directory, its state) readable or
writable by the collect unit; a credential source (seed, anchor) under the state directory; editing a bundle, a reading, an `Eve` or
the anchor by hand outside sections 5, 6 and 7 (only the `readings/*.tmp` of section 8 are removed); a `.lock` removed by hand or an
`unlock` run as root (section 9); moving `bundles/` while a step runs (section 7).
