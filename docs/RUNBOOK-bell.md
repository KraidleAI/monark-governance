# RUNBOOK — deploy and publish MONARK Bell on bell.monarkgate.tech (orchestrator-deployed)

**What.** Bell's first served path: the publisher `apps/bell/scripts/bell-publish.mjs` turns ONE pending bundle of real `runMain`
runs into a signed, chained publication under `/var/lib/monark-bell/public`, which Caddy serves read-only at
`https://bell.monarkgate.tech/` (`state.json`, `provenance.json`, `timeline.jsonl`, `bell/pubkey.json`, `states/`, `provenance/`).
Lot a = **option C** (R-T1b-5): publication is an **operator act** (`systemctl start`), no timer, no collection on the host
(lot b, item BELL-COLLECT-TIMER-1; deviation from decision 54 journaled, C-1). The signature attests **origin**, never truth.

**Normative sources.** `docs/adr/ADR-T1b-backend.md` (v2: D1 host and tree, D8 write order, D9 key and trust root, D10 unit and
Caddy, D11 CA and D-n gates, D13 amendments, "Constantes" C-7); `docs/RULINGS-lot-t1b-backend.md` (R-T1b-1..7, C-5, C-9, C-10);
`docs/SPRINT-BACKLOG-lot-t1b-backend.md` (S-7..S-12); `docs/CHECKPOINT1-lot-t1b-backend.md` (C-1..C-10).

**Who runs this: the orchestrator**, from its own machine (Git Bash), over SSH to the Bell host with the deploy key:
`ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech` (its host key under the name once, RUNBOOK-dojo §15 (0)). Host facts (measured): `srv1993906.hstgr.cloud`, hostname `bell`, Hostinger
KVM 2 (2 vCPU / 8 GB / 100 GB), Ubuntu 26.04 LTS, hPanel firewall 0 rule (the host firewall is ufw)
(`docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md` section 1; `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`).

**Target (decision 149, CHANTIERS 16:55 UTC):** `bell.monarkgate.tech` online around 23:00Z. Steps 1-8 (hosting: tree, user,
key, unit, Caddy, HTTPS) need gates G-a, G-c, G-d only. Steps 9-13 (first publication) also need **G-b and G-e**; if either is
missing at 23:00Z, the host goes online serving 404s and the publication waits (never a publication without its pieces).

**Committed files this runbook installs** (all read from the G7 commit, never from a working tree):
- `apps/bell/scripts/bell-publish.mjs` + `apps/bell/scripts/bell-chain.mjs` + `apps/bell/scripts/bell-validate.mjs` + `apps/bell/src/sessions.ts` -> `/opt/monark-bell/`
  (the ONLY four files of the tree: what the unit runs, ADR D1; the CA's `BELL_TREE_PATHS`);
- `deploy/monark-bell-publish.service` -> `/etc/systemd/system/monark-bell-publish.service`;
- in part 5 only (section 14): the collection's tree, `BELL_COLLECT_TREE_PATHS` of `scripts/bell-deploy.mjs` -> `/opt/monark-bell-collect/`,
  and `deploy/monark-bell-collect.service`, `deploy/monark-bell-collect.timer` -> `/etc/systemd/system/`;
- `deploy/Caddyfile.monark-bell` -> `/etc/caddy/Caddyfile` (replace mode, ruling C-5), then `/etc/caddy/monark-bell.caddyfile`, imported
  (the REPLACE → IMPORT procedure at the end of step 7, played once before act A-6 of `docs/RUNBOOK-dojo.md`);
- `scripts/verify-bell.mjs` runs locally (the CA), never on the host.

**Conventions.** Each step gives the command, the expected output and the rollback. Commands are ONE line each (no `\`
continuation) and carry no shell state between steps: the G7 SHA is read from `/f/tmp/bell-dn/G7.txt` in every command that
needs it. Local scratch = `/f/tmp/bell-dn/` (outside the repo). **The private key is never displayed, copied or hashed:** no
`cat`/`head`/`less`/`xxd`/`base64`/`openssl` on it, no `set -x`, no environment dump (consigne A-7); the only commands that name
its path, or the rotation's new key, are six: `--generate-key`, `stat`, `test`, `shred`, `systemd-run … -p LoadCredential=`
(a credential source, read by PID 1) and the `mv` of the new key onto the unit's path (pinned by `bell_runbook_never_prints_private_key`).

**Who can detect a rewrite (ADR D6, CP1 point iii).** A signed, chained timeline makes a later rewrite of a served line
**detectable by whoever kept an earlier copy**: the operator mirror, whose sha256 is written to the JOURNAL after each publication
(step 13), and any third party holding a copy of `timeline.jsonl` or of the immutables. It is not detectable by a reader who
never kept a copy; nothing here claims more.

---

## 0. Gates and their pieces (C-8) — all precede step 9

| Gate | Condition | Piece (cited by the D-n JOURNAL) | State at writing (base `9a5bddb`) | Needed before |
|---|---|---|---|---|
| **G-a** | G7 of PR-1, PR-2, PR-3 | the three G7 documents + the merge SHA written to `/f/tmp/bell-dn/G7.txt` | open (this lot) | step 2 |
| **G-b** | PR-B-DBN n° 8: EQUS.SUMMARY licence + FAQ "after 24 hours" read on site | `docs/course-bell/FAITS-databento-licence-24h-2026-09-23.md` (commit `9a5bddb`: historical T+1 without licence, offset 16:00 ET + 24 h confirmed) | **closed** (`9a5bddb`, 2026-09-23 18:1x UTC) | step 9 |
| **G-c** | I-G2-2 (provider backups) + ESC-2 ruling | `docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md` + CHANTIERS 16:45 UTC (ruling R-T1b-3, decision 148) | **lifted** | step 4 |
| **G-d** | DNS A `bell.monarkgate.tech` -> the Bell host's address | CHANTIERS 13:50 UTC (TTL 300, created 13:49Z) + the resolver output of step 7, replayed at the D-n | **lifted** (replay due) | step 7 |
| **G-e** | first bundle (Q6-COURSE-1 and/or -b1-bis-ii) | sha256 of the bundle manifest (step 9) + the course references (course JOURNAL, anchors) | open | step 9 |

Legal: decision 147 (the lawyer's global GO) lifted decision 79 and closed E-2; no legal gate remains (formal act expected in
November, item JURISTE-ACTE-NOV-1, not blocking). The key is generated after G7 PR-1/PR-2 so the rotation tooling exists
before the first key (FAITS I-G2-2 section 3).

**ESC-2 as ruled after I-G2-2 (G-c).** The Bell private key WILL be contained in the host provider's weekly automatic backups
(image of the whole VPS; no path exclusion offered; 0 backup existed at the reading). Accepted and bounded: (1) the key is
generated ON the Bell host by the orchestrator, never on the operator machine, never in the repo, root:root 0600, at
`/etc/monark/bell/signing-key.pem` (ruling D-1 (A) of the orchestrator: the path of the unit's `LoadCredential=` and of ADR D9;
the `/etc/credstore/bell-ed25519.key` of the I-G2-2 FAITS section 3 (1) is superseded), handed to the offline unit by `LoadCredential=`; (2) the fact is DECLARED in the ADR and on `/bell/method`: "the private key is contained
in the host provider's weekly backups"; any restore of a provider backup and any manual snapshot is an **exposure event =>
immediate counter-signed rotation**, journaled in the served timeline; (3) **no manual snapshot is ever created**; (4) the
committed keyring is the trust root (C-9); (5) item **BELL-KEY-ROTATION-CAL-1**: planned rotation at the first of an exposure
event or 90 days (owner orchestrator, trigger dated 2026-12-22).

---

## 1. On-host controls, read-only (ADR D11), and the probe BEFORE capture

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'hostname; systemctl --version | head -1; node -v; command -v node; npm -v; caddy version; systemctl is-active caddy; systemctl show -p ExecStart --value caddy; ufw status; timedatectl show -p NTPSynchronized --value; df -h /var/lib | tail -1; id bell; ls -d /var/lib/monark-bell /etc/monark/bell /opt/monark-bell; command -v sudo; systemctl list-units "monark-*" --all --no-pager; sha256sum /etc/caddy/Caddyfile; wc -l < /etc/caddy/Caddyfile'
```

Expected, with the source of each value: measured 2026-09-23 17:0x UTC (`FAITS-vps-bell-precheck-2026-09-23.md`): `bell`;
`systemd 259 (259.5-0ubuntu3.4)` (>= 247, `LoadCredential=` exists since v247, systemd.exec(5)); `v24.21.0`; `11.19.0`;
`v2.11.4 ...`; `active`; an ExecStart carrying `/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile`; ufw active with
22/tcp, 80/tcp, 443/tcp ALLOW IN (v4 and v6); about 94G available; `id: 'bell': no such user`; three `No such file or directory`.
NTP `yes`: `CHANTIERS.md:123` (2026-09-20, "NTP synchronisé"), not re-measured since. `command -v node` (expected `/usr/bin/node`)
and `command -v sudo` (expected `/usr/bin/sudo`): NOT measured before, measured HERE first (write both to the JOURNAL);
`monark-probe.timer` active (and the failed transient `run-p19072-i21642.service`: OUT OF SCOPE, item PROBE-SIM-UNIT-1, never
reset in this lot); the Caddyfile digest (write it to the JOURNAL) and `21`.
**STOP** if: systemd < 247; caddy not active; NTP not `yes`; the user `bell` or any of the three directories already exists
(this is then not a first deployment: read the host before any act). Rollback: none (read-only).

Probe BEFORE capture (CA check 12; digests only, never contents):

```bash
mkdir -p /f/tmp/bell-dn && ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech '{ sha256sum /etc/monark/probe.env; cd /opt/monark-probe && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum; }' > /f/tmp/bell-dn/probe-before.sha256; echo exit=$?; wc -l < /f/tmp/bell-dn/probe-before.sha256
```

Expected: `exit=0`; 3 lines or more (`/etc/monark/probe.env`, `./DEPLOYED-SHA`, `./probe-narabi.mjs`). Rollback: none.

## 2. The tree at G7 (gate G-a)

Write the G7 merge SHA once (40 hex), then ship EXACTLY the four files the unit runs:

```bash
git -C /f/Monark rev-parse --verify '<G7 merge commit>^{commit}' > /f/tmp/bell-dn/G7.txt && cat /f/tmp/bell-dn/G7.txt
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs apps/bell/scripts/bell-validate.mjs apps/bell/src/sessions.ts | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'install -d -m 0755 -o root -g root /opt/monark-bell && tar xzf - -C /opt/monark-bell --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-bell && find /opt/monark-bell -type d -exec chmod 0755 {} + && find /opt/monark-bell -type f -exec chmod 0644 {} + && cd /opt/monark-bell && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum'
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && for p in apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs apps/bell/scripts/bell-validate.mjs apps/bell/src/sessions.ts; do echo "$(git -C /f/Monark cat-file blob "$G7:$p" | sha256sum | cut -c1-64)  ./$p"; done
```

Expected: the remote listing has exactly four lines and each digest equals the local `git cat-file blob` digest (`.gitattributes`
pins `eol=lf`, so `git archive` and `cat-file` carry the same bytes). No `npm` on this host: built-ins only (ADR D3).
Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /opt/monark-bell'`.

**Dated line, 2026-10-14: the tree has three files.** From this change on, the deployed tree also holds
`apps/bell/scripts/bell-validate.mjs`, the run and bundle validation that `bell-publish.mjs` imports and re-exports (ADR-M004 D7
octies, amendment of 2026-10-14); `BELL_TREE_PATHS` of `scripts/verify-bell.mjs` and the three path lists of this runbook (the
archive and digest commands above, the REPLACE replay of step 7) name it. The host already deployed keeps its two-file tree at
its deployed SHA: its CA runs with `scripts/verify-bell.mjs` read at that SHA. A CA run with the script of the head expects
three files and reds `c11_loaded_config_equals_g7`, fail-closed, never silently. The prose of this step and of the list of
installed files at the top ("two files", "exactly two lines") is amended with the next deployment of the tree.

**Dated line, 2026-10-15 18:1x UTC (lot 3c of BELL-COLLECT-TIMER-1):** the amendment announced above is made: the prose of this step
and the list at the top say three files and three lines. The host already deployed keeps its two-file tree at its deployed SHA.

## 3. User `bell` and directories

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'useradd --system --no-create-home --shell /usr/sbin/nologin bell && install -d -o bell -g bell -m 0755 /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public && install -d -o root -g root -m 0700 /etc/monark/bell && id bell && stat -c "%a %U:%G %n" /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public /etc/monark/bell && sudo -u caddy test -x /var/lib/monark-bell/public && echo caddy-traverse-ok'
```

Expected: `uid=... (bell) gid=... (bell)`; `755 bell:bell` on the three state paths; `700 root:root /etc/monark/bell`;
`caddy-traverse-ok` (Caddy reads `public/` read-only; the unit's `UMask=0022` keeps what it writes 0644/0755; precedent
`RUNBOOK-sentinel.md:44`). `/var/lib/monark-bell` must exist before any start: it is a `ReadWritePaths` of the unit. **Dated line, 2026-10-15 19:2x UTC (review of lot 3c, n-4):** this sentence said "the unit's only `ReadWritePaths`", true of the `--inbox` unit of lot a, which the host already deployed keeps at its deployed SHA; the unit of the trunk (lot 3b-ii) has two, `/var/lib/monark-bell /var/lib/monark-bell-status` (`deploy/monark-bell-publish.service:44`), the second made by lot 5b, step 1 (step 6).
Rollback (before step 4 only): `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /var/lib/monark-bell /etc/monark/bell && userdel bell'`.

## 4. Signing key, generated ON the host (gate G-c; after G7 PR-2)

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 077 && node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --generate-key /etc/monark/bell/signing-key.pem > /root/bell-pubkey.out; echo gen_exit=$?; stat -c "%a %U:%G %s" /etc/monark/bell/signing-key.pem; grep -c PRIVATE /root/bell-pubkey.out; grep -c -E "[{,] *.d. *:" /root/bell-pubkey.out; wc -c < /root/bell-pubkey.out'
```

Expected: `gen_exit=0`; `600 root:root <size>` (PKCS#8 PEM, ADR D9); then `0` and `0` (the saved output holds no private
material: counts only, never contents); a small byte count. Interface = PR-2 S-6 (ADR D9: "only the public JWK and the key_id",
refuses to overwrite, 0600): re-read its G7 before this step. Then display the PUBLIC output only:
`ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cat /root/bell-pubkey.out'` -> the JWK `{kty:"OKP", crv:"Ed25519", x}` and the
64-hex `key_id`; write both to the JOURNAL. **If either count is not 0**: the output leaked private material -> exposure before any
publication: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'shred -u /etc/monark/bell/signing-key.pem /root/bell-pubkey.out'`,
record it, fix PR-2 before any new key. Rollback before the first publication: the same `shred -u`, then regenerate (no line is
signed yet, no rotation needed). **After the first publication, the key is never deleted: see "Key incidents".**

## 5. Commit the keyring (trust root, C-9) — operator machine

From the public output of step 4 (`<x>`, `<key_id>`), build the committed keyring with the repo's own code; the command refuses a
`key_id` that is not the sha256 of `x`:

```bash
cd /f/Monark && mkdir -p apps/bell/keys && node --input-type=module -e "import { keyringOf, publicKeyOfJwk, canonical } from './apps/bell/scripts/bell-chain.mjs'; const [x, id] = process.argv.slice(1); const kr = keyringOf(publicKeyOfJwk({ x }), 1); if (kr.keys[0].key_id !== id) { console.error('STOP: key_id mismatch'); process.exit(1); } console.log(canonical(kr));" -- '<x>' '<key_id>' > apps/bell/keys/bell-keyring.json; echo exit=$?; cat apps/bell/keys/bell-keyring.json
```

Expected: `exit=0`; one canonical line `{"keys":[{"jwk":{"crv":"Ed25519","kty":"OKP","x":"<x>"},"key_id":"<key_id>","status":"active","valid_from_seq":1}],"schema":"bell-keyring-v1"}`
(the exact bytes the publisher serves at `/bell/pubkey.json` for that key: pinned by `bell_runbook_ships_the_ca_tree_and_the_unit_key_path`).
Commit it (orchestrator, R-20); **no push before step 12** (the keyring and the CA JSON pass the full oracle together, decision
136). Rollback: drop the local commit.

## 6. The unit, from the G7 bytes, and a dry start that proves the credential's source

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/monark-bell-publish.service" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 022 && cat > /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload && systemctl show -p NeedDaemonReload --value monark-bell-publish.service && systemctl show -p LoadState -p FragmentPath -p DropInPaths monark-bell-publish.service && sha256sum /etc/systemd/system/monark-bell-publish.service'
```

Expected: `no`; `LoadState=loaded`, `FragmentPath=/etc/systemd/system/monark-bell-publish.service`, `DropInPaths=` (empty); the
digest equals `git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/monark-bell-publish.service" | sha256sum`.
Never `systemctl enable` (no `[Install]`: the collection starts the unit at each end of a tick, by `OnSuccess=` and `OnFailure=`,
section 14) and never `systemctl edit` (a drop-in reddens CA check 11).

Dry start (the refusal proves the unit's user, group and sandbox, and that PID 1 loaded the credential's source; nothing is written).
The unit runs `--handoff` (lot 3b-ii): it starts only after the acts of lot 5b, step 1, which make the group `bell-handoff` and the
directories its `ReadWritePaths=` and `InaccessiblePaths=` name, none with a `-` (a missing one fails the start before the job runs):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl start monark-bell-publish.service; echo start_exit=$?; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep "bell/publish"; systemctl reset-failed monark-bell-publish.service; find /var/lib/monark-bell /var/lib/monark-bell-status -mindepth 1 | sort'
```

Expected: `start_exit=1`; the journal line `bell/publish: clock_unsynced: the host clock is not synchronized`: the `--handoff` mode
reads its clock probe first (`apps/bell/scripts/bell-publish.mjs:352`), closed by default until item CLOCK-PROBE-FORM-1 delivers its
host form (part 5); `find` lists no `publish.lock` and nothing under `/var/lib/monark-bell-status`. This start does not read the key
(l.353 comes after the probe): it proves that PID 1 loaded the credential's source (a missing absolute source fails the start,
`deploy/monark-bell-publish.service:13-14`). With the probe of CLOCK-PROBE-FORM-1, the same start will read the key, take
`publish.lock` and refuse `bell/publish: handoff_start_missing: status/start: no start mark (the act --handoff-start poses it)` on a
status without its mark (l.353-360, section 16); `signing_key_missing` would then mean the key does not load: **STOP**.
Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload'`.

**Dated line, 2026-10-15 18:1x UTC (lot 3c; m-3 of the review of lot 3b-ii):** this step describes the `--handoff` unit of the trunk,
its dry start read in the code; it replaced the `--inbox` unit of lot a and its dry start on the empty inbox, whose expected line was
`inbox_not_exactly_one_bundle`. The host already deployed keeps its `--inbox` unit at its deployed SHA: its acts are this RUNBOOK read
at that SHA, and its CA compares with the G7 it is given. **Dated line, 2026-10-15 19:2x UTC (review of lot 3c, m-4):** the dry start above is played again in part 5, once CLOCK-PROBE-FORM-1 is in service on the host, the unit's credential source in place and before the start mark (section 16; lot 5b, step 5), the timer stopped and both units `inactive` or `failed`: it is the act that proves the unit reads its key before any publication. Expected: `start_exit=1` and `bell/publish: handoff_start_missing: status/start: no start mark (the act --handoff-start poses it)` (the key read, `publish.lock` taken and released, nothing written); `signing_key_missing` (the key does not load) or `clock_unsynced` (the probe not in service): **STOP**. The plan of part 5 places this act in the order of lot 5b.

## 7. Caddy (ruling C-5) — gate G-d first

DNS replay (G-d), then the Caddyfile in place recorded BEFORE the act (digest + content; it carries no secret):

```bash
nslookup bell.monarkgate.tech one.one.one.one; ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'getent hosts bell.monarkgate.tech; sha256sum /etc/caddy/Caddyfile; cat /etc/caddy/Caddyfile' > /f/tmp/bell-dn/caddyfile-before.txt; echo exit=$?; head -1 /f/tmp/bell-dn/caddyfile-before.txt
```

Expected: `Address: <address>` from one.one.one.one and `<address> bell.monarkgate.tech` on the host, `<address>` the Bell host's address, from the operator's own records or the provider panel, never from this tree (else **STOP**: no ACME
without the A record); the recorded file. **Classification on this piece**: the package default only (one `:80` block with
`root * /usr/share/caddy` and `file_server`, comments otherwise; measured 17:0x UTC: 21 lines, no other site) => **REPLACE mode**
(below). Any other site in the file => IMPORT mode (at the end of this step), never an edit of those sites.

REPLACE mode: back up, validate the candidate BEFORE it becomes live, atomic rename, reload (never restart):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cp -p /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-bell && umask 022 && cat > /etc/caddy/Caddyfile.new && caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv /etc/caddy/Caddyfile.new /etc/caddy/Caddyfile && systemctl reload caddy && systemctl is-active caddy && sha256sum /etc/caddy/Caddyfile'
```

Expected: `Valid configuration`; `active`; the digest equals the local `git cat-file blob "$G7:deploy/Caddyfile.monark-bell" | sha256sum`.
Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cp -p /etc/caddy/Caddyfile.bak-bell /etc/caddy/Caddyfile && caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy'`.

IMPORT mode (only if the recorded file serves another site): the dedicated file is installed WHOLE at
`/etc/caddy/monark-bell.caddyfile` (same pipe, `cat > /etc/caddy/monark-bell.caddyfile`; inert: nothing imports it yet), after the
same backup; the CANDIDATE `/etc/caddy/Caddyfile.new` is a copy of the file in place plus ONE line `import /etc/caddy/monark-bell.caddyfile`
(the live file is never edited, "Never"); then `caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile`, `mv` onto
`/etc/caddy/Caddyfile` and `systemctl reload caddy`, as in REPLACE mode. CA check 11 (b), lot BELL-CA-DOJO-1: in import mode the `import`
lines of the main file are `import /etc/caddy/monark-bell.caddyfile`, alone or with `import /etc/caddy/monark-dojo.caddyfile` (act A-6
of `docs/RUNBOOK-dojo.md`), each at most once, no other `import` line; the dedicated file equals the G7 blob; the Dojo file is judged by
the Dojo CA, never by this one. Rollback: the backup copied to a candidate, validated, moved back, reloaded; then the dedicated file
removed.

**REPLACE replay after a Caddyfile change** (decision 155, lot BELL-HOST-ROOT-1: `/` answers 302 to `https://monarkgate.tech/bell`).
REPLACE again, only if the file in place is the previous G7 blob (MEASURED below before the act, never assumed). First move
`G7.txt` to the new G7 (every command and CA check 11 read it), keeping the previous one in `G7-1.txt`, written ONLY if absent
(a rerun never overwrites this rollback pointer); the tree and the unit are NOT re-shipped, so they must be
byte-identical at both G7s (measured for this lot: `git diff --stat 496a5a8 d7c60a2` on the two tree files, the unit and the
Caddyfile is empty; of these four installed files, the lot changes only the Caddyfile):

```bash
{ [ -e /f/tmp/bell-dn/G7-1.txt ] || cp /f/tmp/bell-dn/G7.txt /f/tmp/bell-dn/G7-1.txt; } && git -C /f/Monark rev-parse --verify '<G7 merge commit of the lot>^{commit}' > /f/tmp/bell-dn/G7.txt && git -C /f/Monark diff --quiet "$(cat /f/tmp/bell-dn/G7-1.txt)" "$(cat /f/tmp/bell-dn/G7.txt)" -- apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs apps/bell/scripts/bell-validate.mjs apps/bell/src/sessions.ts deploy/monark-bell-publish.service; echo same_tree_and_unit=$?; cat /f/tmp/bell-dn/G7.txt
```

Expected: `same_tree_and_unit=0` and the new SHA (else **STOP**: steps 2 and 6 are replayed at the new G7 first, or CA check 11
is red; a failed `rev-parse` leaves `G7.txt` empty: rerun this command with the right SHA, `G7-1.txt` is kept). Then the file
in place, measured on the host against the Caddyfile blobs of both G7s, BEFORE any act:

```bash
H=$(ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'sha256sum /etc/caddy/Caddyfile' | cut -c1-64); S=unexpected; for f in G7 G7-1; do R=$(git -C /f/Monark rev-parse --verify "$(cat /f/tmp/bell-dn/$f.txt)^{commit}") || { S=unexpected; break; }; [ "$(git -C /f/Monark cat-file blob "$R:deploy/Caddyfile.monark-bell" | sha256sum | cut -c1-64)" = "$H" ] && S=$f; done; echo caddy_in_place=$S host=$H
```

Expected: `caddy_in_place=G7-1` (the previous G7 blob is in place) => the REPLACE below. `caddy_in_place=G7` => this replay
already replaced the file: no REPLACE, go to step 8. `caddy_in_place=unexpected` (neither blob, or a pointer that is not a
commit) => **STOP**: read the host (the recording command above); another site in the file => IMPORT mode, never a REPLACE. The REPLACE is the SAME command as above, with a
second backup (taken only while the previous blob is in place, so a rerun after a failed `caddy validate` loses nothing):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cp -p /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-bell-2 && umask 022 && cat > /etc/caddy/Caddyfile.new && caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv /etc/caddy/Caddyfile.new /etc/caddy/Caddyfile && systemctl reload caddy && systemctl is-active caddy && sha256sum /etc/caddy/Caddyfile'
```

Expected: `Valid configuration`; `active`; the digest equals the local `git cat-file blob` digest at the NEW G7; then step 8,
then step 11 (fresh capture; CA 12/12 at the new G7). Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cp -p /etc/caddy/Caddyfile.bak-bell-2 /etc/caddy/Caddyfile && caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy'`, then `cp /f/tmp/bell-dn/G7-1.txt /f/tmp/bell-dn/G7.txt`.
A later replay (another lot) first removes `G7-1.txt`, once step 11 is 12/12 at the G7 in place, so that the pointer it keeps
is that G7.

**REPLACE → IMPORT, played ONCE (lot BELL-CA-DOJO-1; ADR-DOJO-PR-3 É-2 and PB-5), before act A-6 of `docs/RUNBOOK-dojo.md`.** Serving
`dojo.monarkgate.tech` on this host takes a second site in Caddy. Bell's site moves, byte for byte, from `/etc/caddy/Caddyfile` to
`/etc/caddy/monark-bell.caddyfile`, and the main file becomes `import` lines ONLY: Bell's line alone here, Bell's then the Dojo's at
A-6 (`docs/RUNBOOK-dojo.md` section 21). Bell's served behaviour does not change: the same blob, the same site block, only its file
moves. The main file can hold nothing but `import` lines because Bell's blob carries no global options block: in the blob at `224a6bd1`,
its first line that is neither blank nor a comment (line 11) is the site address `bell.monarkgate.tech {`, the only top-level line that
opens a block (the same holds for the Dojo blob, line 13); command (1) re-reads it at the G7. `G7.txt` is NOT moved: the tree, the unit
and the blob are not re-shipped, the blob only changes path. Conventions of this procedure: the commands name the host
`bell.monarkgate.tech`, only after the host key step of `docs/RUNBOOK-dojo.md` section 15 (0) (C-2 of the G2 of part 3); a
command longer than 160 characters is broken after `&&`, `||` or `|` (as in `docs/RUNBOOK-dojo.md` section 10), one fenced block
staying ONE command.

(1) Read-only: Bell's blob at G7 is the file in place, no name of this procedure exists yet, and the blob opens with its site:

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && L=$(git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" | sha256sum | cut -c1-64) &&
R=$(ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'sha256sum /etc/caddy/Caddyfile' | cut -c1-64) && [ "$L" = "$R" ] && echo "replace-at-g7 $L" ||
echo STOP; ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'ls -1 /etc/caddy'; git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" |
grep -v -E '^[[:space:]]*(#|$)' | head -1
```

Expected: `replace-at-g7 <L>` (`<L>`, the digest of Bell's blob at G7: write it to the JOURNAL); a listing of `/etc/caddy` (to the JOURNAL)
with NONE of `monark-bell.caddyfile`, `monark-dojo.caddyfile`, `Caddyfile.new`, `Caddyfile.bak-import`; then `bell.monarkgate.tech {`.
**STOP** on `STOP` (the file in place is not Bell's blob at G7: read the host, never a migration on a guess), on any of the four names (a
migration already started: rollback (a) or (b) below, or read the host), or on another first line (a block before the site would have to
stay in the main file: this procedure does not apply). Rollback: none (read-only).

(2) The migration: the backup first, the dedicated file (inert: the main file in place imports nothing), the candidate main file,
`caddy validate` on the candidate BEFORE it is live, the atomic rename, `systemctl reload caddy` (never `restart`):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" |
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cd /etc/caddy && test ! -e Caddyfile.bak-import && cp -p Caddyfile Caddyfile.bak-import && umask 022 &&
cat > monark-bell.caddyfile && cmp Caddyfile monark-bell.caddyfile && echo "import /etc/caddy/monark-bell.caddyfile" > Caddyfile.new &&
caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv Caddyfile.new Caddyfile && systemctl reload caddy &&
systemctl is-active caddy && sha256sum Caddyfile monark-bell.caddyfile'
```

Expected: `Valid configuration`; `active`; `d51755c50a15dac943dafdf7ff1bffe4ceb110923660d46723cdcba774faf51f  Caddyfile` (the one line
`import /etc/caddy/monark-bell.caddyfile` and its LF: `echo "import /etc/caddy/monark-bell.caddyfile" | sha256sum`) and
`<L>  monark-bell.caddyfile`. `cmp` prints nothing: the dedicated file is, byte for byte, the file Caddy served. Until `caddy validate`
passes, `/etc/caddy/Caddyfile` is untouched; the candidate goes live by `mv` only. **STOP** on any other output: without
`Valid configuration`, rollback (a); with it, rollback (b).

(3) Bell served just after: the command of step 8 (`302 0 https://monarkgate.tech/bell`, then `404`); then step 11, a fresh capture (it
now copies `caddyfile-dedicated`) and the CA, `VERIFY OK - 12/12` (check 11 in import mode, Bell's line alone), committed by step 12;
the outputs of (1) to (3) to the JOURNAL. Any other result: **STOP**, rollback (b).

Rollback (a), before the `mv` (the output of (2) has no `Valid configuration`: the live file never changed):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cd /etc/caddy && cmp Caddyfile Caddyfile.bak-import &&
rm -f Caddyfile.new monark-bell.caddyfile Caddyfile.bak-import; ls -1 /etc/caddy'
```

Expected: no `cmp` output (the file in place equals its backup) and none of the three names in the listing; then (1) again before any
retry. No `Caddyfile.bak-import` at all: (2) stopped before its backup, nothing to remove. A `cmp` difference: **STOP**, rollback (b).

Rollback (b), after the `mv`, complete: REPLACE again (after the rollback of A-6, if A-6 ran; the first test enforces that order):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'cd /etc/caddy && test ! -e monark-dojo.caddyfile && cp -p Caddyfile.bak-import Caddyfile.new &&
caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv Caddyfile.new Caddyfile && systemctl reload caddy &&
systemctl is-active caddy && rm monark-bell.caddyfile Caddyfile.bak-import && sha256sum Caddyfile'
```

Expected: `Valid configuration`; `active`; `<L>  Caddyfile` (Bell's blob in place again); then step 8, and step 11 (the capture has no
`caddyfile-dedicated` any more: replace mode). After this procedure the REPLACE replay above no longer applies (its measure reads
`caddy_in_place=unexpected`): a later change of `deploy/Caddyfile.monark-bell` replaces the DEDICATED file under the same discipline
(candidate, `caddy validate`, `mv`, `reload`), a procedure still to write, item BELL-CADDY-IMPORT-REPLAY-1 (proposed, Q-4 of
`docs/G1-lot-bell-ca-dojo.md`; trigger: the G1 of the next lot that changes that file).

## 8. HTTPS constated (automatic certificate)

```bash
curl -sS -o /dev/null -w "%{http_code} %{ssl_verify_result} %{redirect_url}" https://bell.monarkgate.tech/; echo; curl -sS -o /dev/null -w "%{http_code}" https://bell.monarkgate.tech/no-such-file.json; echo
```

Expected: `302 0 https://monarkgate.tech/bell` (the host root sends a reader to the site's Bell page, decision 155, never a
listing; certificate valid; retry after 30 s while ACME completes, at most 5 tries) and `404` (a path that does not exist).
**STOP** if the TLS result is not 0 after the retries: read `journalctl -u caddy -n 50 --no-pager` (no secret
there) before anything else. Rollback: the step 7 rollback. **Hosting is now online; steps 9-13 wait for G-b and G-e.**

## 8 bis. From seq 2: ONE day crossed dry, then the course (ADR-BELL-CASH-LEG-1, C-12) — before step 9

Seq 1 abstained `no_close_ref` on every session (its launch scripts removed the Databento key). From seq 2 the cash leg is ON and
its first LIVE cross-check has never been observed, so ONE reference day already publishable (16:00 ET + 24 h passed, e.g.
`2026-09-15`, a reference day of mode W3) is crossed dry with the committed code of the course's execution tree `<EXEC_TREE>`
(clean, at the G7 of the course, `node_modules` installed), the keys in the operator environment. Nothing but a cost and statuses
is printed (never a key, never a close):

```bash
cd <EXEC_TREE> && node --input-type=module -e 'import { DATABENTO_HIST, databentoCostPath } from "./apps/bell/src/close.ts"; if (!process.env.DATABENTO_API_KEY) { console.log("no key"); process.exit(3); } const d = process.argv[1], e = new Date(Date.parse(d + "T00:00:00Z") + 86400000).toISOString().slice(0, 10); const r = await fetch(DATABENTO_HIST + databentoCostPath(["TSLA"], d, e), { headers: { Authorization: "Basic " + Buffer.from((process.env.DATABENTO_API_KEY ?? "") + ":").toString("base64") } }); if (!r.ok) { console.log("HTTP " + r.status); process.exit(3); } let v; try { v = JSON.parse(await r.text()); } catch { console.log("not JSON"); process.exit(3); } console.log("cost_usd=" + Number(v));' -- 2026-09-15
```

```bash
cd <EXEC_TREE> && node --input-type=module -e 'import { readReferenceCloses, readCashKeys, databentoGet, polygonGet } from "./apps/bell/src/close.ts"; const k = readCashKeys(process.env), faults = []; const r = await readReferenceCloses({ TSLA: [process.argv[1]] }, { databentoGet, polygonGet, databentoKey: k.databentoKey, polygonKey: k.polygonKey, faults }); console.log(JSON.stringify({ cross: r.crossByUnderlying, faults }));' -- 2026-09-15
```

Expected: `cost_usd=<n>` with n <= 1 (the metadata call is free, PR-B-DBN Q7; the one-day range request of the second command is
the only billed Databento call of this step; `no key` = STOP, nothing was requested; `HTTP <status>` or `not JSON` = STOP, no byte of
the body printed, exit 3). Run the second command only after the first
printed `cost_usd=<n>` with n <= 1. It prints exactly `{"cross":{"TSLA":{"2026-09-15":"matched"}},"faults":[]}`. **STOP** on anything else:
`mismatch` (the two sources disagree on the scaled integer), `unavailable` (the cross-check key or host), a fault, or
`{"cross":{},"faults":[]}` (no Databento key: nothing was requested). No course then; the investigation is named in the JOURNAL.
Rollback: none (read-only).

Then, for EVERY instrument of the sequence (decision 164: seq 2 = TSLAx + AAPLx + SPYx, one bundle, never mono-instrument), the
course from the same tree: first the dry run (guards + the `metadata.get_cost` pre-flight, cap 1 USD, nothing written), then the
same line without `Q6_DRYRUN=1`, detached (RUNBOOK-SUP-3), then its controls once the process has exited:

```bash
Q6_DRYRUN=1 Q6_SHA_G7=<G7 of the course> Q6_EXEC_TREE=<EXEC_TREE> Q6_TRAJ_FILE=<produced trajectory> Q6_TRAJ_SHA256=<its sha256> Q6_FLOOR_CHAINSTACK_RU=<floor> bash <EXEC_TREE>/apps/bell/ops/launch-q6.sh <MINT> <mode> --out <OUT>
```

```bash
node <EXEC_TREE>/apps/bell/ops/q6-controls.mjs --variant fast --mint <MINT> --mode <mode> --out <OUT> --exec-tree <EXEC_TREE> --ledger-cycle-dir /f/monark-ledger/helius-2026-09-19 --seq1-state /f/course-bell/q6/<MINT>/state.json
```

Expected: `RESULT 0 FAIL`; **`PASS Q6-C14` (close_ref_present) is blocking** (C-6): a `no_close_ref` is admitted only on a session
whose reference close is not yet publishable. Never `--now` here: it is an offline-test clock override, reported as `FAIL Q6-C00`.
A `WARN Q6-C15` (seq 1 differs) is written as a D-n line with its figures, masked: the line prints the seq 1 and seq 2 VWAPs
(`seq1=`, `seq2=`) on the console, and it is never pasted as printed into a document of the repository (the JOURNAL included): each
VWAP takes the token `[masqué]` (checkpoint-2 observation). Only then is the bundle assembled (step 9). Rollback: `<OUT>` is moved
aside, never overwritten (the launcher refuses an existing state).

## 9. The first bundle (gates G-b and G-e)

A bundle is ONE directory whose sub-directories are `runMain --out` directories exactly as written (`state.json`,
`timeline.jsonl`, `provenance.json`, `journal.json`; the last one is tolerated and never served). Manifest and bundle digest
(both sides normalise the Windows `*` marker of sha256sum):

```bash
cd /f/tmp/bell-dn/bundle-1 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | tr -d "*" | tr -s " " > /f/tmp/bell-dn/bundle-1.manifest && sha256sum /f/tmp/bell-dn/bundle-1.manifest
```

Expected: the bundle digest (G-e piece, with the course references). Transfer into the inbox (exactly one entry), owned by `bell`:

```bash
scp -r -i ~/.ssh/monark_vps /f/tmp/bell-dn/bundle-1 root@bell.monarkgate.tech:/var/lib/monark-bell/inbox/ && ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'chown -R bell:bell /var/lib/monark-bell/inbox/bundle-1 && ls /var/lib/monark-bell/inbox && cd /var/lib/monark-bell/inbox/bundle-1 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | tr -d "*" | tr -s " " | sha256sum'
```

Expected: `ls` prints only `bundle-1`; the remote digest equals the local one. Rollback (before step 10):
`ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /var/lib/monark-bell/inbox/bundle-1'`.

## 10. Publish (operator act)

The unit runs `--handoff`: it publishes, in order, at most 8 bundles (`HANDOFF_N`) that the collection deposited in
`/var/lib/monark-bell-handoff` from the start mark on (section 16), and the collection starts it at each end of a tick (section 14).
Started by hand, the timer stopped and no tick running, it is the act of rescue (G0 BELL-COLLECT-TIMER-1 DC-3, DC-12):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl stop monark-bell-collect.timer; if systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed; then systemctl start monark-bell-publish.service; echo start_exit=$?; else echo TICK-RUNNING; fi; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep -E "status|bell/publish"; tail -n 8 /var/lib/monark-bell-status/published.jsonl; ls /var/lib/monark-bell/public'; curl -sI https://bell.monarkgate.tech/state.json | head -1; curl -sI https://bell.monarkgate.tech/bell/pubkey.json | head -1
```

Expected: the timer's state (JOURNAL); `TICK-RUNNING`: nothing started, wait and rerun. Until item CLOCK-PROBE-FORM-1 (part 5):
`start_exit=1` and `bell/publish: clock_unsynced: the host clock is not synchronized`, nothing written. With the probe:
`start_exit=0` and one JSON line (no secret in it), one of `{"status":"published","published":[{"bundle":"unit-<D>","seq":<n>}]}`
(one entry per bundle published, in order; an entry with `"healed":true` is a bundle whose line was committed before its status line,
recorded without a new line), `{"status":"nothing_to_publish","published":[]}`, or `{"status":"awaiting_unit","published":[],"awaiting_unit":"unit-<D>"}`
(section 21); the last lines of `published.jsonl`; `bell provenance provenance.json state.json states timeline.jsonl`; then
`HTTP/2 200` twice (S-12). What steps 13 and 13 bis take from "the step 10 line" is read in line `<n>` of the step 13 copy: its
`state_sha256` and `provenance_sha256` fields, and its `line_hash`, the sha256 of the line's bytes (`scripts/anchor-bell-timeline.mjs:41`).
A refusal of a bundle prints `bell/publish: <code>: <detail>`, is recorded in `refused.jsonl` and never retried: the tick collects `<D>`
again (`unit-<D>-r<n>`); a bundle is never edited by hand (no relabel of a provider label, no field edit: the seq 1 relabel is not
repeated, ADR-BELL-CASH-LEG-1), and the state is never touched. Then `systemctl start monark-bell-collect.timer` only if the first
line read `active`.
Rollback: **none that deletes** (append-only, signed). A wrong publication is corrected by a NEW publication; serving can be
stopped by the step 7 rollback; a rewrite would be detectable by the mirrors (see "Who can detect a rewrite").

**Dated line, 2026-10-15 18:1x UTC (lot 3c; m-3 of the review of lot 3b-ii):** this step describes the `--handoff` unit of the trunk,
its outputs read in `apps/bell/scripts/bell-publish.mjs:346-383`; it replaced the `--inbox` unit of lot a, its one bundle of the inbox
(step 9) and its one-line output. The host already deployed keeps its `--inbox` unit at its deployed SHA: for it, steps 9 and 10 and
the next publications are this RUNBOOK read at that SHA.

## 11. CA (ADR D11, 12 named checks) — host capture, then `scripts/verify-bell.mjs`

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /root/bell-capture && install -d -m 0700 /root/bell-capture && cd /root/bell-capture && cp /etc/caddy/Caddyfile caddyfile-main && { if [ -f /etc/caddy/monark-bell.caddyfile ]; then cp /etc/caddy/monark-bell.caddyfile caddyfile-dedicated; fi; } && systemctl cat monark-bell-publish.service > systemctl-cat.txt && systemctl show -p NeedDaemonReload --value monark-bell-publish.service > need-daemon-reload.txt && (cd /opt/monark-bell && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum) > tree.sha256 && sha256sum *' && scp -r -i ~/.ssh/monark_vps root@bell.monarkgate.tech:/root/bell-capture /f/tmp/bell-dn/ && ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech '{ sha256sum /etc/monark/probe.env; cd /opt/monark-probe && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum; }' > /f/tmp/bell-dn/probe-after.sha256; echo exit=$?
```

```bash
cd /f/Monark && node scripts/verify-bell.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json --g7 "$(cat /f/tmp/bell-dn/G7.txt)" --tree-digests /f/tmp/bell-dn/bell-capture/tree.sha256 --loaded-config /f/tmp/bell-dn/bell-capture --probe-digests /f/tmp/bell-dn/probe-before.sha256 /f/tmp/bell-dn/probe-after.sha256 --out docs/deploy-CA-bell.json > /f/tmp/bell-dn/ca.stdout 2> /f/tmp/bell-dn/ca.stderr; echo ca_exit=$?; cat /f/tmp/bell-dn/ca.stderr
```

Expected: `ca_exit=0` and `VERIFY OK - 12/12 checks passed (tls.authorized=true)`; `docs/deploy-CA-bell.json` written (12 checks,
`tls.authorized: true`, the sha256 of every observed body and input). Checks: 1 `state.json` 200 + schema; 2 `timeline.jsonl` 200;
3 `/bell/pubkey.json` == committed keyring; 4 `provenance.json` 200 + schema; 5 `bell-verify.mjs --url <url> --keyring <committed keyring>`
exit 0 with status `consistent_with_supplied_keyring` (trust root = the committed keyring, C-9); 6 ACAO `*`; 7 no listing, and `/` answers 302 with `Location: https://monarkgate.tech/bell` (decision 155); 8 `immutable` on `states/`, `no-cache` on the current
files; 9 `tls.authorized === true` (a skipped TLS never passes); 10 no private material served; 11 tree, loaded Caddyfile and
loaded unit == `git cat-file blob <G7>:<path>`, one fragment, no drop-in, `NeedDaemonReload=no` (C-5); 12 probe digests unchanged.
Any red check: **STOP**, no announcement; the named check says where; e.g. for check 11 (c),
`diff /f/tmp/bell-dn/bell-capture/systemctl-cat.txt <(echo "# /etc/systemd/system/monark-bell-publish.service"; git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/monark-bell-publish.service")`.
The `.jsonl` Content-Type is recorded in `content_types` (CP1 point ii, measured here; item BELL-JSONL-CTYPE-1). Rollback: none (read-only).

## 12. JOURNAL, then commit and push

Commit `docs/deploy-CA-bell.json` with the keyring of step 5 (orchestrator, R-20), then the FULL oracle on that tree, the paid
variables removed from the environment of EVERY gate (A-7: the `env -u` wraps one `sh -c`, not only the first command), each exit
code captured directly (A-3):

```bash
cd /f/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY sh -c 'npm run ci > /f/tmp/bell-dn/o-ci.log 2>&1; echo ci=$?; npm run lint > /f/tmp/bell-dn/o-lint.log 2>&1; echo lint=$?; npm run lint:ratchet > /f/tmp/bell-dn/o-ratchet.log 2>&1; echo ratchet=$?; npm run lang:gate > /f/tmp/bell-dn/o-lang.log 2>&1; echo lang=$?; npm run export:check > /f/tmp/bell-dn/o-export.log 2>&1; echo export=$?'
```

`apps/bell/test/bell-ops.test.ts` reads the removal list of the command above as the single source of the A-7 paid variables (the Q6
launcher's removals are checked against it): reformatting that command line turns the test red (checkpoint-2, C-V-4).

Expected: `ci=0`, `lint=0`, `ratchet=0`, `lang=0`, `export=0`; the test summary at the end of `/f/tmp/bell-dn/o-ci.log` shows
`fail 0` (tests / pass / skipped counts written to the JOURNAL). Then `git push` only if all five are 0 (decision 136).
Rollback: before the push, the local commit is dropped (orchestrator); after the push, nothing that deletes: a corrective commit. The D-n JOURNAL-PROVENANCE entry cites EVERY piece: G-a (G7 documents + SHA), G-b (FAITS),
G-c (FAITS + CHANTIERS 16:45 UTC), G-d (CHANTIERS 13:50 UTC + the step 7 resolver output), G-e (bundle digest + course
references), the step 1 values, the `key_id`, the keyring commit, the CA JSON digest, the step 13 mirror digest. The public
register is unchanged (Bell stays `upcoming`, ADR D12); "served" is an internal state from here.

## 13. Operator mirror (after EVERY publication, and after every key line)

```bash
mkdir -p /f/tmp/bell-dn/mirror && curl -sS --fail https://bell.monarkgate.tech/timeline.jsonl -o /f/tmp/bell-dn/mirror/timeline-seq<n>.jsonl && sha256sum /f/tmp/bell-dn/mirror/timeline-seq<n>.jsonl
```

For a publication line, also the two immutable files it names, at their served paths (`<state_sha256>` and `<provenance_sha256>`
are those of the step 10 JSON line): they are the local input of step 13 bis (ADR-BELL-OTS-ANCHOR-1 C-5). A key line names none.

```bash
cd /f/tmp/bell-dn/mirror && mkdir -p states provenance && curl -sS --fail https://bell.monarkgate.tech/states/<state_sha256>.json -o states/<state_sha256>.json && curl -sS --fail https://bell.monarkgate.tech/provenance/<provenance_sha256>.json -o provenance/<provenance_sha256>.json && sha256sum states/<state_sha256>.json provenance/<provenance_sha256>.json
```

Expected: the timeline digest, written to the JOURNAL; each immutable's digest equals its name. The orchestrator then keeps the
files in its durable mirror (outside the repo, never under `F:/tmp` alone). This copy is what makes a later rewrite detectable
(ADR D6). Rollback: none (read-only; the mirror files are kept).

**Dated line, 2026-10-15 18:1x UTC (lot 3c; G0 BELL-COLLECT-TIMER-1 DC-12, M-18):** from the first automatic publication (part 5) on,
this step will run once per working day instead of after every publication: the copy of `timeline.jsonl` and its sha256 to the JOURNAL,
and the two immutables of each line published since the previous copy; the publication no longer waits for the operator. Until that
first automatic publication, the step stays as written above.

## 13 bis. OpenTimestamps timestamp of the new line (ADR-BELL-OTS-ANCHOR-1 D2; operator machine, orchestrator act)

After step 13, for EVERY new line of the timeline (a publication, a `key_rotation`, a `key_revocation`), in the same operator
window; never on the Bell host (no outbound call there, no Python). What it adds: a proof file which, once it records a Bitcoin
block, shows that line n, and every line before it by its hash chain, existed before that block; it shows neither the instant of
publication nor the truth of the facts (ADR D4, D8). The
tool (`scripts/anchor-bell-timeline.mjs`) writes one manifest (ADR D1) and prints the stamp command; it never runs `git` nor `ots`.
The steps below are in the order of ADR C-6: no upgrade before the durable copy.

1. Manifest, from the local copies of step 13 (`--compare-url` also compares them with the served bytes; drop `--immutables`
   for a key line; `<line_hash>` is the one the step 10 line, or the step R3 line, printed):

```bash
cd /f/Monark && node scripts/anchor-bell-timeline.mjs --seq <n> --timeline /f/tmp/bell-dn/mirror/timeline-seq<n>.jsonl --immutables /f/tmp/bell-dn/mirror --mirror-sha <step 13 digest> --line-hash <line_hash> --compare-url https://bell.monarkgate.tech
```

Expected: `anchor-bell-timeline OK`, then `manifest docs/bell-publications/timeline-seq<n>-manifest.txt sha256 <digest>` (a name
already taken, by a manifest or its proof, moves to `timeline-seq<n>-<k>-manifest.txt`, k >= 2: never an overwrite), the stamp
command of point 2 and the register row to fill. `FAIL-CLOSED`: STOP, nothing is written, nothing is stamped.

2. Timestamp, in the frozen form of ruling GO1-F (CHANTIERS), then the date that becomes the row's `date_u`:

```bash
cd /f/Monark && PATH="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin:$PATH" "/f/MONARK SUITE/ots/venv/Scripts/ots" --cache /f/tmp/ots-cache stamp docs/bell-publications/timeline-seq<n>-manifest.txt; echo stamp_exit=$?; date -u +%Y-%m-%dT%H:%M:%SZ
```

Expected: `stamp_exit=0` and `timeline-seq<n>-manifest.txt.ots` next to the manifest: a PENDING proof (calendar records, no
Bitcoin block yet). Fewer than 2 calendars answer: no proof; one more try in the same window, else remove the manifest (never
committed without its proof; the tool rebuilds the same bytes from the step 13 copies) and write the row with `ots_ref` =
`not timestamped at <date_u>` and `commit` = the current HEAD (no pair to commit); the next line's timestamp covers this one
through the hash chain.

3. Durable copy, IMMEDIATELY (the pending proof carries a random nonce: lost, it cannot be rebuilt); both digests to the JOURNAL:

```bash
cd /f/Monark/docs/bell-publications && T=$(date -u +%Y%m%dT%H%MZ) && cp -n timeline-seq<n>-manifest.txt /f/PRODUITS/bell-mirror/ots/timeline-seq<n>-manifest-$T.txt && cp -n timeline-seq<n>-manifest.txt.ots /f/PRODUITS/bell-mirror/ots/timeline-seq<n>-manifest-$T.txt.ots && sha256sum /f/PRODUITS/bell-mirror/ots/timeline-seq<n>-manifest-$T.txt /f/PRODUITS/bell-mirror/ots/timeline-seq<n>-manifest-$T.txt.ots
```

Expected: the manifest digest of point 1, and the proof's digest.

4. Committed bytes = timestamped bytes (`.txt` is `text=auto eol=lf`, `.ots` is `binary`, `.gitattributes`):

```bash
cd /f/Monark && git add docs/bell-publications/timeline-seq<n>-manifest.txt docs/bell-publications/timeline-seq<n>-manifest.txt.ots && git cat-file blob :docs/bell-publications/timeline-seq<n>-manifest.txt | sha256sum && PATH="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin:$PATH" "/f/MONARK SUITE/ots/venv/Scripts/ots" --no-cache info docs/bell-publications/timeline-seq<n>-manifest.txt.ots | head -1
```

Expected: the staged digest, the `File sha256 hash:` of `ots info` and the digest of point 1 are one value. Then the commit of
the pair (orchestrator, R-20); its short SHA is the row's `commit`. Declared window: until the row commit of point 5, `npm test`
reds `bell_publication_anchors_source_holds_no_fixture` (the directory holds a pair that no row names yet); the full oracle runs
after point 5. The same assertion reds on a `.bak` left in `docs/bell-publications/` (point 6).

5. Register row, appended at the END of the table of `docs/bell-publications/ANCHORS.md` (the row point 1 printed, with the
   `date_u` of point 2 and the `commit` of point 4), then the check, then the commit of the row:

```bash
cd /f/Monark && node scripts/anchor-bell-timeline.mjs --check --timeline /f/tmp/bell-dn/mirror/timeline-seq<n>.jsonl
```

Expected: `anchor-bell-timeline check OK`, each row bound to its manifest and proof ("pending" for the new one; read from the
file, not checked against a node). Commit the row (orchestrator); push under the rule of step 12 (decision 136).

6. Later, the upgrade, ONLY once the durable copy of point 3 exists (ADR C-6 (ii)):

```bash
cd /f/Monark && PATH="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin:$PATH" "/f/MONARK SUITE/ots/venv/Scripts/ots" --cache /f/tmp/ots-cache upgrade docs/bell-publications/timeline-seq<n>-manifest.txt.ots; echo upgrade_exit=$?; ls docs/bell-publications
```

Expected: `upgrade_exit=0` ("Timestamp complete": the file now records a Bitcoin block; complete is not a check against a node),
or `upgrade_exit=1` with "Timestamp not complete": still pending, retry at a later window. When the client brought new data it
renamed the old proof to `timeline-seq<n>-manifest.txt.ots.bak` before writing the new one: move that `.bak` to
`/f/PRODUITS/bell-mirror/ots/` (a `.bak` left in place makes the next upgrade fail; never committed, never served), copy the new
proof there too (digest to the JOURNAL), run the check of point 5, commit the upgraded proof (its git history is the record,
ruling GO1-D), then `node scripts/sync-bell-anchors.mjs`, the storefront build and upload. An upgrade keeps the same head: it
does not re-run `scripts/sync-bell-served.mjs` (the anchors sync binds the upgraded row to the committed `lines[]`). Rollback of
13 bis: none that deletes a proof (a pending proof may still complete; a new stamp of the same line takes the `-<k>` name).

**Dated line, 2026-10-15 18:1x UTC (lot 3c; G0 BELL-COLLECT-TIMER-1 DC-12, Q-12 decided "Automatic", M-18; same line at the end of
`docs/adr/ADR-BELL-OTS-ANCHOR-1.md`):** from lot 4b (part 4) on, the timestamp of each new line will be made automatically on the probe's
host, never on Bell's host. Until lot 4b is in service, this step 13 bis stays the act in force, line by line. No automatic
publication precedes lot 4b (G0 DC-10).

## 14. The scheduled collection: its tree, its two units, a dry start (lot 3c, played in part 5)

**What.** The committed units: the collection tick (`apps/bell/src/tick.ts --tick`, G0 BELL-COLLECT-TIMER-1 DC-4) is the program of
`monark-bell-collect.service`, which `monark-bell-collect.timer` starts at four UTC slots; each end of a tick starts the publisher
(`OnSuccess=`, `OnFailure=`, PLAN-P3 C3-1), which publishes the bundles the tick deposited in `/var/lib/monark-bell-handoff` from the mark.
**When.** Sections 14 to 21 are written in part 3 (lot 3c) and played in part 5 (lot 5b): after its step 1 (the user `bell-collect`,
the group `bell-handoff`, the four directories of `BELL_LAYOUT` and the collection's secrets directory) and its step 2 (the secrets
file, posed without display). Nothing of them is played on a host before part 5 (G0 DC-11: nothing is deployed nor served in part 3),
and the timer is enabled by the act of lot 5b that starts the rehearsal (its step 4), never here. Until item CLOCK-PROBE-FORM-1 delivers the host form of the
clock probe (part 5; this RUNBOOK does not write that form), the tick, the publisher's `--handoff` and `--handoff-start` forms and the
abandon act each refuse `clock_unsynced` and write nothing: each expected output says the line due now and the line due with the
probe. The commands name Bell's host as the Conventions do; lot 5b will name the host of part 5 (G0 DC-8). The tree, at G7 (the
list is `BELL_COLLECT_TREE_PATHS`: the import closure of the tick and of the guard's served CLI that section 17 runs, pinned by
`bell_collect_tree_is_the_import_closure`):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" apps/bell/package.json apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-validate.mjs apps/bell/src/checks.ts apps/bell/src/close.ts apps/bell/src/collect.ts apps/bell/src/corporate-actions.ts apps/bell/src/digest.ts apps/bell/src/discover.ts apps/bell/src/ethereum.ts apps/bell/src/gap.ts apps/bell/src/halts.ts apps/bell/src/handoff-status.ts apps/bell/src/operators.ts apps/bell/src/plan.ts apps/bell/src/pools.ts apps/bell/src/quorum.ts apps/bell/src/reason-canon.ts apps/bell/src/rebase-crosscheck.ts apps/bell/src/rebase-produce.ts apps/bell/src/rebase-scan.ts apps/bell/src/rebase-trajectory.ts apps/bell/src/residuals.ts apps/bell/src/rpc.ts apps/bell/src/sessions.ts apps/bell/src/supply.ts apps/bell/src/tick.ts apps/bell/src/trajectory-check.ts apps/bell/src/volume.ts apps/sentinel/package.json apps/sentinel/src/rpc.ts apps/sentinel/src/ukemi/rpc2.ts packages/rpc-guard/bin/rpc-guard.mjs packages/rpc-guard/package.json packages/rpc-guard/src/bell-methods.ts packages/rpc-guard/src/classify.ts packages/rpc-guard/src/cli.ts packages/rpc-guard/src/client.ts packages/rpc-guard/src/cycle.ts packages/rpc-guard/src/errors.ts packages/rpc-guard/src/guarded.ts packages/rpc-guard/src/index.ts packages/rpc-guard/src/ledger.ts packages/rpc-guard/src/lock.ts packages/rpc-guard/src/reconcile.ts packages/rpc-guard/src/repair.ts packages/rpc-guard/src/tariff.ts packages/rpc-guard/src/transport.ts scripts/bell-deploy.mjs | tee /f/tmp/bell-dn/collect-tree.tar.gz | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'install -d -m 0755 -o root -g root /opt/monark-bell-collect && tar xzf - -C /opt/monark-bell-collect --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-bell-collect && find /opt/monark-bell-collect -type d -exec chmod 0755 {} + && find /opt/monark-bell-collect -type f -exec chmod 0644 {} + && cd /opt/monark-bell-collect && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum'
```

```bash
rm -rf /f/tmp/bell-dn/collect-tree && mkdir -p /f/tmp/bell-dn/collect-tree && tar xzf /f/tmp/bell-dn/collect-tree.tar.gz -C /f/tmp/bell-dn/collect-tree && cd /f/tmp/bell-dn/collect-tree && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum
```

Expected: 49 remote lines, equal line for line to the 49 local lines of the same archive (`.gitattributes` pins `eol=lf`). No `npm` on
the host: `@monark/rpc-guard` resolves through one relative link, `BELL_COLLECT_TREE_LINK` (the Dojo's form, `docs/RUNBOOK-dojo.md`
section 3):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'install -d -m 0755 -o root -g root /opt/monark-bell-collect/node_modules/@monark && ln -s ../../packages/rpc-guard /opt/monark-bell-collect/node_modules/@monark/rpc-guard && readlink /opt/monark-bell-collect/node_modules/@monark/rpc-guard && cd /opt/monark-bell-collect && node --input-type=module -e "import(\"@monark/rpc-guard\").then((m) => console.log(typeof m.cycleOf))"'
```

Expected: `../../packages/rpc-guard`, then `function` (the tick imports `cycleOf` from it). Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /opt/monark-bell-collect'`.

The two units, from the G7 bytes (the calque of step 6; the publisher's unit is step 6's):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/monark-bell-collect.service" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 022 && cat > /etc/systemd/system/monark-bell-collect.service && systemctl daemon-reload && systemctl show -p NeedDaemonReload --value monark-bell-collect.service && systemctl show -p LoadState -p FragmentPath -p DropInPaths monark-bell-collect.service && sha256sum /etc/systemd/system/monark-bell-collect.service'
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/monark-bell-collect.timer" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 022 && cat > /etc/systemd/system/monark-bell-collect.timer && systemctl daemon-reload && systemctl show -p NeedDaemonReload --value monark-bell-collect.timer && systemctl show -p LoadState -p FragmentPath -p DropInPaths monark-bell-collect.timer && systemctl is-enabled monark-bell-collect.timer; sha256sum /etc/systemd/system/monark-bell-collect.timer'
```

Expected, for each: `no`; `LoadState=loaded`, `FragmentPath=/etc/systemd/system/<unit>`, `DropInPaths=` (empty); the digest equals
`git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/<unit>" | sha256sum`; for the timer, `disabled` before its digest.
Never `systemctl enable` nor `start` of the timer here, never `systemctl edit`. Rollback:
`ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm /etc/systemd/system/monark-bell-collect.service /etc/systemd/system/monark-bell-collect.timer && systemctl daemon-reload'`.

Dry start, before the seed (the refusal proves the unit's user, group and sandbox, its secrets file present, and its tree loaded;
nothing is written):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl start monark-bell-collect.service; echo start_exit=$?; systemctl start monark-bell-publish.service; echo publish_exit=$?; journalctl -u monark-bell-collect.service -n 10 --no-pager -o cat | grep "bell/tick"; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep "bell/publish"; systemctl reset-failed monark-bell-collect.service monark-bell-publish.service; find /var/lib/monark-bell-collect /var/lib/monark-bell-handoff /var/lib/monark-bell-status -mindepth 1 | sort'
```

Expected: `start_exit=1` and `bell/tick: refused state_missing: state/progress.json is missing: seed it by act` (the tick reads its
progress first, `apps/bell/src/tick.ts:325`; an `EnvironmentFile=` without `-` that is missing fails the start before,
`deploy/monark-bell-collect.service:25-27`); `publish_exit=1` and one or two lines `bell/publish: clock_unsynced: the host clock is not
synchronized` (the end of the tick started the publisher too, by `OnFailure=`); `find` lists only what lot 5b, step 1 made (no
`state/`, no `unit-*`, no status file). Rollback: none (nothing written).

## 15. The seed, once, at the first day of the rehearsal (lot 5b, step 3)

`--seed <D>` writes `state/progress.json` with `<D>` as its seed: the first unit the tick plans is `unit-<D>` (G0 DC-4, M-9). `<D>`
is the first trading day of the rehearsal, a trading day of the committed calendar, `YYYY-MM-DD`. The form reads no clock probe and no
secret; it runs as the collection's user, in its unit's sandbox (section 21 lists what each line means):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell-collect --gid=bell-collect -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell-collect /var/lib/monark-bell-handoff" -p "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -p UMask=0027 /usr/bin/env node /opt/monark-bell-collect/apps/bell/src/tick.ts --seed <D> --state /var/lib/monark-bell-collect && stat -c "%a %U:%G %n" /var/lib/monark-bell-collect/state/progress.json'
```

Expected: `inactive` (the timer is enabled after the seed, by lot 5b, step 4); `bell/tick: seeded <D>` (JOURNAL);
`640 bell-collect:bell-collect /var/lib/monark-bell-collect/state/progress.json` (`writeAtomic`, `apps/bell/src/tick.ts:94-95`).
Refusals: `bell/tick: refused seed_exists: state/progress.json exists` (exit 1: seeded already; **STOP**, read it); exit 64 with
`bell/tick: refused usage: D is a trading day of the committed calendar, YYYY-MM-DD` (fix `<D>`). Then the dry start of section 14
again: until CLOCK-PROBE-FORM-1, `bell/tick: refused clock_unsynced: the host clock is not synchronized` (the tick passed its
progress, the handoff directory and the presence and shape of each key of its secrets file: `env_missing` or `env_malformed` names a
key, never a value, `tick.ts:325-328`). Rollback, before the timer is enabled only (after, a deposit follows the seed):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell-collect --gid=bell-collect -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell-collect /var/lib/monark-bell-handoff" -p "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -p UMask=0027 /usr/bin/env rm /var/lib/monark-bell-collect/state/progress.json && echo seed-removed'
```

## 16. The start mark, once, right after the rehearsal (lot 5b, step 5)

The publisher's `--handoff` publishes nothing without the mark `start` of the status directory (`handoff_start_missing`), and never a
bundle whose `<D>` is before it (G0 DC-3). **Prescribed value**: the trading day that follows the last `<D>` deposited at the instant of
the act (a bundle or a tombstone of the handoff directory), so that every bundle of the rehearsal stays before the mark and is never
published (G0 DC-3, DC-4; the precedent of `docs/adr/ADR-DOJO-PR-3.md`); posed before the migration and the rotation (it does not
depend on the key), by the form `bell-publish.mjs --handoff-start <D> --handoff <dir> --status <dir>`, as the user `bell`, in the
publisher's sandbox (its group reads the handoff directory). (1) The timer stopped, the tick waited, the value computed by the
tree's own calendar:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl stop monark-bell-collect.timer; systemctl is-active monark-bell-collect.service; L=$(ls -1 /var/lib/monark-bell-handoff | grep -oE "^unit-[0-9]{4}-[0-9]{2}-[0-9]{2}" | sort | tail -n 1 | cut -c6-); echo "last=$L"; cd /opt/monark-bell-collect && node --input-type=module -e "import { nextTradingDay } from \"./apps/bell/src/sessions.ts\"; console.log(\"mark=\" + nextTradingDay(process.argv[1]));" -- "$L"'
```

Expected: the timer's state (JOURNAL); `inactive` or `failed` (`activating` is a tick running: wait and rerun); `last=<D>`, the last
day deposited; `mark=<mark>`, the trading day after it (`nextTradingDay` of `apps/bell/src/sessions.ts`). `last=` empty: nothing was
deposited, **STOP** (no mark without a rehearsal). (2) The mark, both units stopped:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell --gid=bell -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell /var/lib/monark-bell-status" -p "InaccessiblePaths=/var/lib/monark-bell-collect /etc/monark/bell-collect" -p PrivateNetwork=yes -p UMask=0022 /usr/bin/env node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --handoff-start <mark> --handoff /var/lib/monark-bell-handoff --status /var/lib/monark-bell-status'
```

Expected now: `bell/publish: clock_unsynced: the host clock is not synchronized`, exit 1, nothing written (the form reads the probe
first, `apps/bell/scripts/bell-publish.mjs:334`). With the probe of CLOCK-PROBE-FORM-1: one JSON line
`{"status":"start_mark_posted","from_unit":"<mark>","posted_at":"<ISO>"}` (JOURNAL). Its two named refusals, each writing nothing:
`bell/publish: start_mark_exists: status/start` (a mark exists: it is never replaced nor removed; **STOP**, read
`/var/lib/monark-bell-status/start`) and `bell/publish: start_mark_not_after_bundles: <n> bundle(s) of the handoff directory start at or
after the mark` (a deposit at or after `<mark>`: (1) again, never a value chosen by hand). Exit 64: `<mark>` is not a date. Then
`systemctl start monark-bell-collect.timer` only if (1) read it `active`. Rollback: none: the mark is created exclusively and never
replaced (l.330-344); a wrong mark is a **STOP** and an escalation to the orchestrator.

## 17. A lock left held: the guard's locks and `publish.lock`

**When**: every tick refuses `bell/tick: refused lock_held: …` before any call, or every start of the publisher refuses
`bell/publish: lock_held: publish.lock: another writer holds the state`. **Why**: a tick takes the guard's lock of each operator for its
run (`<cycle>/<op>.lock` under the ledger, `{pid, iso}`); its SIGTERM handler releases them (`bell/tick: refused sigterm: stopped, the
run's locks released`, or `…the release of the run's locks threw: unlock them by act`), but a SIGKILL, the OOM killer or a power cut
leaves them, and a lock left STAYS held: only the served, ledgered `unlock` releases it (`packages/rpc-guard/src/lock.ts:4-6`). The
publisher takes `publish.lock` in `/var/lib/monark-bell` at each `--handoff` call (and, since the fold of lot 5a, at each `--inbox`, `--rotate`, `--revoke` and `--rotate-commit`) and releases it in its `finally`
(for `--handoff`, taken at `apps/bell/scripts/bell-publish.mjs:359`, released by `release`, `:355`, in the `finally` of `:383`; for the four other modes, by `locked()`, `:493-496`); a SIGKILL, the OOM killer or a power cut leaves it. It is an empty file (no owner
record), and the publisher has no served release of it: item **BELL-PUBLISH-LOCK-RELEASE-1** (formed 2026-10-15 19:2x UTC, review of lot 3c, m-3). Limit: the act below judges the lock by the stop predicate of the two units alone, so a live writer outside them would not be seen. Construction: the calque of the Dōjō's single-writer lot (`docs/G0-lot-single-writer.md`: D-SW2, the owner record `{pid, mode, taken_at}` written and fsynced; D-SW3, a served `--unlock <state>` that frees the lock only if its pid no longer runs and refuses a live or unreadable owner; tests T-SW1, T-SW2; the operator's use, `docs/RUNBOOK-dojo.md` section 19) carried to `apps/bell/scripts/bell-publish.mjs`, then (3) below rewritten for that form and `bell_runbook_unlocks_as_the_unit_user_never_root` amended.
Price, a declared estimate: about 210 lines of one lot under the CI's R-25 measure, the Dōjō's landing measured (`git diff --shortstat d8495082^1 d8495082` with the CI's pathspecs: 163 insertions, 37 deletions, its own lot `3b91aa37` 138 and 14) plus about 10 for the test of this section; the RUNBOOK's lines are out of that measure. Owner: MONARK. Trigger: before the publication is activated (lot 5b, step 11), at the latest in the plan of part 5. Until then its removal by the unit's user, both units stopped, is the
act. (1) The state, the timer stopped first (read-only; a lock file holds `{pid, iso}`, no secret):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl stop monark-bell-collect.timer; systemctl is-active monark-bell-collect.service monark-bell-publish.service; ls -l /var/lib/monark-bell/publish.lock; for f in /var/lib/monark-bell-collect/ledger/*/*.lock; do [ -e "$f" ] || continue; P=$(grep -oE "\"pid\":[0-9]+" "$f" | cut -d: -f2); echo "$f $(cat "$f")"; if [ -z "$P" ]; then echo "$f: no pid"; elif ps -p "$P" -o pid=,comm=; then echo "pid $P: LIVE"; else echo "pid $P: no process"; fi; done'
```

Expected: the timer's state (JOURNAL); two lines, each `inactive` or `failed` (`activating`: a run in course, wait and rerun; never a
release beside a live run); `publish.lock` or `No such file or directory`; at most one lock per operator of `BELL_OPERATORS`
(`helius`, `chainstack`), its line `<file> {"pid":<pid>,"iso":…}` (`JSON.stringify` of `{ pid, iso }`, `packages/rpc-guard/src/lock.ts:26`), then `pid <pid>: no process` (`ps -p` found no process with that pid; its exit status is to be read on its page before part 5, research of the review of lot 3c, n-6), else **STOP** (`pid <pid>: LIVE` after the process `ps` printed, or `<file>: no pid`). (2) The guard's
locks: the served `unlock` of each operator, as `bell-collect` and NEVER as root (a root-owned ledger file would make the unit's next
appends fail), the zero floor of `BELL_FLOORS`:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && for op in helius chainstack; do L=$(ls /var/lib/monark-bell-collect/ledger/*/$op.lock 2>/dev/null) || { echo "$op: no lock"; continue; }; C=$(basename "$(dirname "$L")"); systemd-run --wait --pipe --collect --uid=bell-collect --gid=bell-collect -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell-collect /var/lib/monark-bell-handoff" -p "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -p UMask=0027 /usr/bin/env node /opt/monark-bell-collect/packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir /var/lib/monark-bell-collect/ledger --floor 0 unlock --cycle "$C" --op "$op" --reason runbook-lock-held-unlock; echo "$op exit=$?"; test ! -e "$L" && echo "$op lock released"; tail -n 1 "/var/lib/monark-bell-collect/ledger/$C/$op.jsonl"; done'
```

Expected, for each operator with a lock (`<op>: no lock` for the others): `unlocked <64 hex>` (the sha256 of its `unlocked` line,
`packages/rpc-guard/bin/rpc-guard.mjs:29`), `exit=0`, `lock released`, and a last ledger line with `"outcome":"unlocked"` and
`"reason":"runbook-lock-held-unlock"` (JOURNAL). **STOP, no repair by hand, escalation to the orchestrator** if `unlock` fails on
"head sidecar" or "cycle ledger" (the cases of `docs/RUNBOOK-dojo.md` section 9). (3) `publish.lock`, both units stopped, as `bell`:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell --gid=bell -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell /var/lib/monark-bell-status" -p "InaccessiblePaths=/var/lib/monark-bell-collect /etc/monark/bell-collect" -p PrivateNetwork=yes -p UMask=0022 /usr/bin/env rm /var/lib/monark-bell/publish.lock && test ! -e /var/lib/monark-bell/publish.lock && echo publish-lock-released'
```

Expected: `publish-lock-released` (JOURNAL). The next start repairs what the stop left (`bell/publish: repaired_torn_tail`,
`rederived_keyring` or `rederived_public` on its error stream, `bell-publish.mjs:124-128`), and a bundle committed before its status
line is recorded without a new line (`"healed":true`, l.377-379). Then `systemctl start monark-bell-collect.timer` only if (1) read it
`active`. Rollback: none (the next writer takes the lock again).

## 18. Quarantine: what the operator reads, what he never does

A run that a check refuses (`check_failed:<Cnn>`, `close_ref_missing`, `stop_cash_cross_mismatch`, `adv_regime_unruled`) or that the
pre-validation refuses (`prevalidation_refused:<code>`) never reaches the handoff directory: the tick moves the attempt's staged bundle
to `quarantine/<D>/a<n>/`, appends `a<n> <refusal>` to `quarantine/<D>/reason` (`apps/bell/src/tick.ts:272-278`) and exits 1; the next
slot tries `<D>` again, within its budget (section 19 past it). Read-only:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'ls -1 /var/lib/monark-bell-collect/quarantine; for d in /var/lib/monark-bell-collect/quarantine/*/; do echo "$d"; cat "$d/reason"; done'
```

Expected: the days in quarantine and, for each, its lines `a<n> <refusal>`: the attempt and its refusal by its name of the closed list
(for example `a3 check_failed:C04`), codes only (JOURNAL). The operator acts on no file: the next tick tries again, and a refusal that
repeats is investigated from the code and the journal. He never edits, renames, moves or copies a quarantined run or a deposited
bundle, and never writes into `/var/lib/monark-bell-handoff`: a bundle is only ever the tick's, its manifest binds its bytes, and the
publisher never revalidates a recorded refusal. The tick removes `quarantine/<D>/` seven days after the fact that allows the removal
of its `<D>` (G0 DC-4, `PRUNE_AFTER_MS`). Rollback: none (read-only).

## 19. Abandoning a stalled unit: the act `--abandon`, two ways

**When** (PLAN-P3 C3-9, C3-10): (a) every tick refuses `stalled_unit`: the next unit `<D>` spent its budget (`ATTEMPT_BUDGET`, 8
attempts, any slot, any cause); (b) every tick refuses `publisher_refused:<code>`: the publisher refused the last revision of `<D>`
(`refused.jsonl`), the tick collected it again under `unit-<D>-r<n>` until the same budget was spent and recorded the unit in
`state/stalled.json` (`{"unit":"<D>","code":"<code>"}`, `apps/bell/src/tick.ts:347`). **The act** (`tick.ts --abandon <D> --reason
<code>`, G0 DC-4) records the reason in `state/abandoned.jsonl` (one line per unit, with its `abandoned_at`), deposits the tombstone
`unit-<D>.abandoned` and its manifest in the handoff directory (the publisher skips `<D>` and publishes the next units), then: way
(a), it advances `state/progress.json` to `<D>`, once; way (b), `<D>` is behind the progress, which never moves back: it removes
`state/stalled.json` instead. `<code>` is a lowercase code (`^[a-z][a-z0-9_]{0,63}$`, `tick.ts:91`), the reason recorded, for example
`close_ref_missing`; any other is refused `usage` (exit 64). The gap of `<D>` is visible in the served windows; its automatic catch-up
is item PXB-15. (1) The state, the timer stopped first:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl stop monark-bell-collect.timer; systemctl is-active monark-bell-collect.service; journalctl -u monark-bell-collect.service -n 20 --no-pager -o cat | grep "bell/tick" | tail -n 3; cat /var/lib/monark-bell-collect/state/progress.json /var/lib/monark-bell-collect/state/attempts.json /var/lib/monark-bell-collect/state/stalled.json'
```

Expected: the timer's state (JOURNAL); `inactive` or `failed`; way (a): `bell/tick: refused stalled_unit: unit-<D> after 8 attempts;
abandon it by act`, `"<D>":8` in the attempts, `stalled.json` absent; way (b): `bell/tick: refused publisher_refused:<code>:
unit-<D>-r<n> would collect unit-<D> again, its budget of 8 attempts spent` and `stalled.json` naming `<D>`. Then the reasons of
section 18 for `<D>`. (2) The act, the collection stopped, as `bell-collect`:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell-collect --gid=bell-collect -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell-collect /var/lib/monark-bell-handoff" -p "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -p UMask=0027 /usr/bin/env node /opt/monark-bell-collect/apps/bell/src/tick.ts --abandon <D> --reason <code> --state /var/lib/monark-bell-collect --handoff /var/lib/monark-bell-handoff'
```

Expected now: `bell/tick: refused clock_unsynced: the host clock is not synchronized`, exit 1, nothing written: the act reads the
tick's clock probe, closed by default until CLOCK-PROBE-FORM-1 delivers its form (`tick.ts:410`). With the probe:
`bell/tick: abandoned unit-<D> reason=<code>` (JOURNAL); the next tick goes on with the next unit. Its refusal:
`bell/tick: refused abandon_refused: unit-<D> is not the stalled unit` (`<D>` is neither the next unit with its budget spent nor the
unit of `state/stalled.json`: read (1) again; it is also the answer to a second act: the act is done once). A stop in the middle of
the act: the act runs again, to the same bytes (one reason line per unit). Then `systemctl start monark-bell-collect.timer` only if
(1) read it `active`. Rollback: none that deletes: the publisher reads the tombstone and skips `<D>`.

## 20. Rollback of the scheduled collection

(1) The timer disabled, then both units waited until each is `inactive` or `failed` (never `systemctl stop` of a running tick or
publication):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl disable --now monark-bell-collect.timer; systemctl is-enabled monark-bell-collect.timer; systemctl is-active monark-bell-collect.timer monark-bell-collect.service monark-bell-publish.service'
```

Expected: `disabled`; then `inactive` for the timer and `inactive` or `failed` for each unit (else wait and rerun). Stopping undoes
nothing else: the deposits stay in the handoff directory, the publications stay signed and served (step 10: no rollback deletes a line).

(2) The publisher's state `--state` (`/var/lib/monark-bell`) and its status `--status` (`/var/lib/monark-bell-status`) are copied
together and restored together, NEVER one without the other (review of lot 3a): a `published.jsonl` ahead of the timeline makes the
publisher skip a `<D>` never served (it skips each `<D>` the file lists, `bell-publish.mjs:276`) and the tick remove that bundle seven
days later (DC-4); a `refused.jsonl` lost makes a refused revision validated again. The pair, both units stopped, in one archive,
before any act that writes the publisher's state outside its unit (the rotation's (R3), the migration of lot 5b):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && T=$(date -u +%Y%m%dT%H%MZ) && tar -C /var/lib -czf /root/bell-pair-$T.tar.gz monark-bell monark-bell-status && echo "T=$T" && sha256sum /root/bell-pair-$T.tar.gz'
```

Expected: `T=<T>` and the archive's digest (JOURNAL). It holds no secret: the private timeline, the state keyring (public keys), the
served tree and the status files; the key is under `/etc/monark/bell`, never in it. (3) A restoration, only if nothing was written in
the pair since it was taken: no line published (the timeline is append-only and signed: a restoration that drops a served line is a rewrite, which every mirror detects), no refusal recorded (a lost line of `refused.jsonl` makes a refused revision validated again) and no mark posed (a lost `start` is a mark removed, "Never");
the guard compares the timeline and the three status files of the archive with the host's (dated 2026-10-15 19:2x UTC, review of lot 3c, m-2: it compared the timeline alone):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && install -d -m 0700 /root/bell-pair-check-<T> && tar -C /root/bell-pair-check-<T> -xzf /root/bell-pair-<T>.tar.gz && for f in monark-bell/timeline.jsonl monark-bell-status/published.jsonl monark-bell-status/refused.jsonl monark-bell-status/start; do if [ ! -e "/root/bell-pair-check-<T>/$f" ] && [ ! -e "/var/lib/$f" ]; then echo "$f absent"; elif cmp -s "/root/bell-pair-check-<T>/$f" "/var/lib/$f"; then echo "$f same"; else echo "$f DIFFERS"; fi; done; rm -rf /root/bell-pair-check-<T>'
```

Expected: four lines, each `<file> same`, or `<file> absent` for a status file that neither side holds yet (`published.jsonl` before the first publication, `refused.jsonl` before a refusal, `start` before the mark); a line `<file> DIFFERS` (a write since the pair, or a file on one side only, which `cmp -s` does not report equal: its exit statuses are to be read on its page before part 5, research of the review of lot 3c, n-6), a line `timeline.jsonl absent` (the timeline exists on both sides once the host is installed), any other line, or fewer than four lines, is a **STOP**: no restoration, escalation to the orchestrator. Then both together:

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && mv /var/lib/monark-bell /var/lib/monark-bell.aside-<T> && mv /var/lib/monark-bell-status /var/lib/monark-bell-status.aside-<T> && tar -C /var/lib -xzpf /root/bell-pair-<T>.tar.gz && stat -c "%a %U:%G %n" /var/lib/monark-bell /var/lib/monark-bell-status'
```

Expected: `755 bell:bell /var/lib/monark-bell` and `2750 bell:bell-handoff /var/lib/monark-bell-status` (`BELL_LAYOUT`); else
**STOP**. The two directories set aside are kept (JOURNAL), never removed in the same window. The timer is enabled again only by the
act that enabled it (lot 5b).

## 21. Normal states, and the refusals that ask for an act

Normal (exit 0, no act): the tick's `bell/tick: nothing_due unit-<D> due_at=<ISO>` (a slot before the unit's due instant),
`bell/tick: deposited unit-<D> manifest_sha256=<hex>` (or `unit-<D>-r<n>`, a revision after a refusal of the publisher) and
`bell/tick: already_deposited unit-<D>` (a slot replayed); the publisher's `{"status":"published",…}`,
`{"status":"nothing_to_publish","published":[]}` (nothing after the mark left to publish: each end of a tick starts it) and
`{"status":"awaiting_unit",…,"awaiting_unit":"unit-<D>"}` (every revision of `<D>` deposited is refused by a line of `refused.jsonl`, `manifest_mismatch` for one whose files no longer match its manifest:
the tick collects `<D>` again, and the publisher waits; not so for a `<D>` whose tombstone does not match its manifest: section 21, dated lines, 2026-10-16 02:5x UTC, r2-3). Normal, exit 1, no act: `bell/tick: refused handoff_backlog: <n> units from
unit-<D> on await publication, above 8` (`BACKLOG_MAX`: the tick collects nothing new and the publisher, started at each end of a tick,
drains the backlog by calls of 8); the backlog is disarmed until the first publication (`published.jsonl` empty): before it the units
after the mark accumulate, then are published in order (G0 DC-4). Until CLOCK-PROBE-FORM-1, `clock_unsynced` on every run is expected.

| Line (journal of the unit) | Act |
|---|---|
| `bell/tick: refused stalled_unit: …` | section 19, way (a) |
| `bell/tick: refused publisher_refused:<code>: …` | section 19, way (b) |
| `bell/tick: refused lock_held: …`, `bell/publish: lock_held: …`, or `bell/tick: refused sigterm: …unlock them by act` | section 17 |
| `bell/tick: refused state_missing: state/progress.json is missing: seed it by act` | section 15 |
| `bell/publish: handoff_start_missing: …` | section 16 (expected through the rehearsal: no mark, no publication) |
| `bell/tick: refused check_failed:<Cnn>: …`, `prevalidation_refused:<code>`, `close_ref_missing`, `stop_cash_cross_mismatch`, `adv_regime_unruled` | section 18; past the budget, section 19 (a) |
| a refusal of a bundle by the publisher (`bell/publish: <code>: …`, recorded in `refused.jsonl`) | none: the tick collects `<D>` again; past the budget, section 19 (b) |
| `bell/tick: refused env_missing: …` or `env_malformed: …` | the secrets file (lot 5b, step 2), never printed |
| `bell/tick: refused calendar_exhausted: …` | **STOP**: a calendar year to commit (G0 DC-4, M-12) |
| `bell/publish: existing_timeline_corrupt: …`, `bell/publish: schema_mismatch: status/…` | **STOP**, escalation; never an edit of the state or of the status |
| `clock_unsynced`, once CLOCK-PROBE-FORM-1 is in service | **STOP**: the host's clock synchronization |

Any other refusal: **STOP**, the journal read before any act (the closed lists: `TICK_REFUSALS` of `apps/bell/src/tick.ts`,
`REFUSAL_CODES` of `apps/bell/scripts/bell-validate.mjs`).

---

## Next publications

Section 8 bis (from seq 2: one day crossed dry, the course of every instrument, `PASS Q6-C14`), then steps 9 and 10 for the new
bundle (`bundle-<n>`), step 11 (fresh host capture and probe capture) and steps 12-13 (JOURNAL,
mirror `timeline-seq<n>.jsonl` and the two immutable files of line n), then step 13 bis (the timestamp of line n, in the same
window; its upgrade at a later window, after the durable copy). The same bundle twice publishes nothing (`nothing_to_publish`, exit 0).
Then the storefront, in this order (ADR-BELL-OTS-PRB D-B3, D-B12): the deploy check of the new bodies committed as
`docs/deploy-CA-bell.json` (item BELL-SITE-SEQ2-1 landed at upload 16); `node scripts/sync-bell-served.mjs` (v4: it walks the
whole timeline, writes `lines[]` and sets its own entry of `apps/site/data/manifest.sha256.json`; re-pin `PINNED_FILE_SHA256` in
`test/bell-served.test.ts` with the sha256 it prints); step 13 bis; `node scripts/sync-bell-anchors.mjs` (it refuses, before any
write, a register row beyond `lines[]` or not bound to its line); the storefront build and upload.

## Key incidents (ADR D9, ESC-2)

- **Exposure event** (a provider backup restored, any snapshot, a suspected leak, a host change): counter-signed rotation
  IMMEDIATELY with the PR-2 tooling, in the order of item **KEYRING-COMMIT-AFTER-KEY-LINE-1** (PR-2 D-8; strict C-9 reading,
  ruling cp-2 PR-2 C-V-7): FIRST the new PUBLIC key is committed AND pushed in `apps/bell/keys/bell-keyring.json`, THEN the
  `key_rotation` line is signed by the old and the new key, THEN everything is verified (CA, `/bell/method`, JOURNAL). The reverse
  order leaves `rotation_key_not_in_keyring` for every verifier holding the committed keyring, and CA checks red, until the
  commit. Never a manual snapshot. Each act only while BOTH units are stopped, their timer first (item BELL-STATE-LOCK-1 (i), widened
  by G0 BELL-COLLECT-TIMER-1 DC-8 (3): the collection starts the publisher at each end of a tick; lot 3c):
  (R0) the timer stopped, then the two units read until each is `inactive` or `failed` (`activating` is a tick or a publication
  running: wait and rerun, never `systemctl stop` it), the timer's state and the pair copy of section 20 (2) to the JOURNAL:
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.timer; systemctl stop monark-bell-collect.timer; systemctl is-active monark-bell-collect.service monark-bell-publish.service'`;
  each host act below opens on the stop predicate of both units;
  (R1) new key ON the host, counted like step 4 (both counts 0), then `cat /root/bell-pubkey-new.out` (public part only):
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && umask 077 && node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --generate-key /etc/monark/bell/signing-key-new.pem > /root/bell-pubkey-new.out; echo gen_exit=$?; grep -c PRIVATE /root/bell-pubkey-new.out; grep -c -E "[{,] *.d. *:" /root/bell-pubkey-new.out'`;
  (R2) on the operator machine, the new PUBLIC key appended to the committed keyring and committed BEFORE the rotation, so a
  third party's `--keyring` check never reddens on the new key (served keys within the supplied keyring):
  `cd /f/Monark && node --input-type=module -e "import { readFileSync } from 'node:fs'; import { keyringOf, publicKeyOfJwk, canonical } from './apps/bell/scripts/bell-chain.mjs'; const [x, id] = process.argv.slice(1); const e = keyringOf(publicKeyOfJwk({ x }), 1).keys[0]; if (e.key_id !== id) { console.error('STOP: key_id mismatch'); process.exit(1); } const kr = JSON.parse(readFileSync('apps/bell/keys/bell-keyring.json', 'utf8')); kr.keys.push({ key_id: e.key_id, jwk: e.jwk }); console.log(canonical(kr));" -- '<x new>' '<key_id new>' > /f/tmp/bell-dn/keyring-r2.json && mv /f/tmp/bell-dn/keyring-r2.json apps/bell/keys/bell-keyring.json`, then
  commit (R-20), full oracle (step 12), push (decision 136); (R3) starts only once that commit is pushed;
  (R3) the rotation, one transient job with the unit's sandbox and groups (each property the committed unit's, lot 3b-ii) and BOTH
  credentials (the old key signs `sig`, the new key `sig_new`):
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && systemd-run --wait --pipe --collect --uid=bell --gid=bell -p SupplementaryGroups=bell-handoff -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true -p "ReadWritePaths=/var/lib/monark-bell /var/lib/monark-bell-status" -p "InaccessiblePaths=/var/lib/monark-bell-collect /etc/monark/bell-collect" -p PrivateNetwork=yes -p UMask=0022 -p LoadCredential=bell-signing-key:/etc/monark/bell/signing-key.pem -p LoadCredential=bell-signing-key-new:/etc/monark/bell/signing-key-new.pem /usr/bin/env node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --rotate --state /var/lib/monark-bell'`
  -> one JSON line with `"status":"rotated"`; this transient form is not yet run on the host: a property that `systemd-run`
  refuses must fail before the job starts (read its error, nothing is written); a refusal `bell/publish: lock_held: publish.lock: another writer holds the state (…)`, nothing written, is lifted by `--unlock --state /var/lib/monark-bell` in the same job form without its two `LoadCredential=` (no key; it frees only a holder that no longer runs or took the lock in another boot; `(running)`: STOP, escalation), then (R3) again;
  (R4) the new key becomes the unit's key: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl is-active monark-bell-collect.service | grep -qx -e inactive -e failed && systemctl is-active monark-bell-publish.service | grep -qx -e inactive -e failed && shred -u /etc/monark/bell/signing-key.pem && mv /etc/monark/bell/signing-key-new.pem /etc/monark/bell/signing-key.pem && stat -c "%a %U:%G" /etc/monark/bell/signing-key.pem'` -> `600 root:root`;
  (R5) verification: commit the served `/bell/pubkey.json` bytes as `apps/bell/keys/bell-keyring.json` (the derived keyring:
  statuses), then step 11 (CA 12/12), `/bell/method` cites the new key, JOURNAL entry, then step 13 (the timeline copy) and
  step 13 bis (the timestamp of the key line, without `--immutables`: it bounds the instant of the rotation or revocation); between
  (R2) and (R5) check 3 (served == committed) is red and check 5 is not (declared window). (R2) and (R5) commit
  `apps/bell/keys/bell-keyring.json`, the keyring the probe of part 4 will read (G0 DC-9, M-17): they will be its update; the act that
  carries it to the probe's host will be written with the probe (lot 4a);
  (R6) the timer starts again only if (R0) read it `active`:
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl start monark-bell-collect.timer && systemctl is-active monark-bell-collect.timer'` -> `active`.
  A loss: (R1), (R2), then (R3) with `--rotate --broken` and only the `bell-signing-key-new` credential, then (R4) without
  `shred` (the old file is gone: `mv /etc/monark/bell/signing-key-new.pem` onto the unit's path, then `stat`), then (R5); a
  revocation (`--revoke <key_id> --from-seq <n>`, signed by the active key `bell-signing-key`, one credential) skips (R1), (R2) and (R4). A refusal `lock_held` of `--rotate --broken` or of `--revoke` is lifted by `--unlock` as in (R3), which frees only a holder that no longer runs.
- **Compromise**: `key_revocation` line signed by the new key; lines of the revoked key at `seq >= revoked_from_seq` are invalid;
  announced out of band (committed keyring, `/bell/method`, JOURNAL). Residual: the window before detection.
- **Loss**: `key_rotation` with `continuity:"broken"`, accepted by verifiers ONLY because the new key is in the committed keyring
  (C-9); the break is reported, never hidden.
- **Planned**: BELL-KEY-ROTATION-CAL-1 (90 days or an exposure event, trigger 2026-12-22). **Dated line, 2026-10-15 19:2x UTC (review of lot 3c, m-1):** (R0) to (R6) as written here are the acts of the units of the trunk: they need lot 5b, step 1 (the group `bell-handoff` and the directories that the publisher unit's `ReadWritePaths=` and `InaccessiblePaths=` name, none with a `-`): on a host without them (R3) cannot run, a missing one failing the start before the job runs (step 6). The host already deployed (the `--inbox` unit of lot a, no collection) plays an exposure event, a loss, a compromise or the planned rotation from this section read at its deployed SHA, as steps 6 and 10 say; so does BELL-KEY-ROTATION-CAL-1 if its trigger comes before part 5.

## Never

`cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64`/`openssl` on the key file; `sha256sum` of the key; `set -x`; printing the
environment; `systemctl enable` or `systemctl edit` on this unit; editing `/etc/caddy/Caddyfile` in place; a Caddy access log
before decision 78's trigger (C-2, item BELL-ACCESS-LOG-1); cleaning `run-p19072-i21642.service` or touching `/opt/monark-probe`,
`/etc/monark/probe.env`, `/var/lib/monark-probe` (CA check 12; item PROBE-SIM-UNIT-1); editing a produced bundle by hand, a relabel
included (a refused bundle is re-produced, section 10); an OpenTimestamps stamp on the Bell host; an `ots upgrade` before the
durable copy of the pending proof, a committed or served `.bak`, or an overwritten proof (step 13 bis). From lot 3c (sections 14 to
21): printing, copying or hashing the collection's secrets file `/etc/monark/bell-collect/collect.env` or any file of
`/etc/monark/bell-collect` (`cat`, `sha256sum`, `cp`, `scp`), the `EnvironmentFile=` of the collection handed to a job, or the
environment of a running tick read; `systemctl enable` or `start` of `monark-bell-collect.timer` before the act of lot 5b that starts the rehearsal;
`systemctl stop` of a running tick or publication (wait for `inactive` or `failed`); a lock released as root, or a guard's lock
removed by `rm` (only the served `unlock`); editing, moving or copying by hand a quarantined run, a deposited bundle,
`state/progress.json` or a status file; removing or replacing the start mark; restoring `/var/lib/monark-bell` without
`/var/lib/monark-bell-status` from the same copy, or the reverse.

## Section 21, dated lines (after the G2 of part 3)

**Dated line, 2026-10-16 01:2x UTC (fold of the G2 of part 3, m-1; G0 BELL-COLLECT-TIMER-1 DC-3, amended the same day):** an
`{"status":"awaiting_unit",…}` that persists on a `<D>` while `refused.jsonl` holds no line for its last revision no longer comes from a deposit
whose files no longer match its manifest: the publisher refuses such a bundle (`bell/publish: manifest_mismatch: …`, exit 1), records it in
`refused.jsonl` as every refusal of a bundle, and the tick collects `<D>` again (`unit-<D>-r<n+1>` within its budget; past it, section 19, way (b)).
A bundle or a manifest the publisher cannot read is not a refusal (the bundle may be good): the call fails `bell/publish: fatal: <errno>` (exit 1;
`EACCES` on the host), records nothing, and the tick collects nothing again. Its row of the table of section 21:

| Line (journal of the unit) | Act |
|---|---|
| `bell/publish: fatal: <errno>` (a bundle or a manifest of `/var/lib/monark-bell-handoff` the publisher cannot read) | **STOP**, escalation: the read rights of the group `bell-handoff` on the handoff directory to check (`BELL_LAYOUT`); never a write by hand |

**Dated line, 2026-10-16 02:5x UTC (fold of the second round of the G2 of part 3, r2-1):** the two units do not exclude each other by
configuration: no ordering directive binds them (`monark-bell-collect.service` names `After=network-online.target` only and starts the publisher
by `OnSuccess=` and `OnFailure=`; `monark-bell-publish.service` names none), a tick may run `TimeoutStartSec=7200` s while two slots of
`monark-bell-collect.timer` are 60 min apart, and the publisher has `TimeoutStartSec=120` s. So the purge of a tick (`apps/bell/src/tick.ts:332`,
the bundle, then its manifest) may remove, between the publisher's listing and its read, an entry published, settled or before the mark. The
publisher skips an entry, a file of it or a manifest absent at its read (`ENOENT`, `apps/bell/scripts/bell-publish.mjs:291` and `:294`), as it
did before the fold of m-1: such a removal is never a `bell/publish: fatal:` line, and it touches neither `refused.jsonl` nor the budget of
`<D>`. A bundle so skipped is as if it were not listed; a tombstone so skipped keeps its name in the listing, so that one call answers
`{"status":"awaiting_unit",…,"awaiting_unit":"unit-<D>"}` for its `<D>` (no act: the next call lists again and goes past it; the same at the base). The row `bell/publish: fatal: <errno>` → **STOP** above stays true for every other errno (`EACCES`, `EBUSY`, `EISDIR`, …).

**Dated line, 2026-10-16 02:5x UTC (same fold, r2-3; review of lot 3b-i, n-2):** the publisher and the tick do not read a tombstone the same
way: the publisher holds `<D>` abandoned only when `unit-<D>.abandoned` matches its manifest (`apps/bell/scripts/bell-publish.mjs:270`, `:293`),
the tick by its name alone (`apps/bell/src/tick.ts:319`, `apps/bell/src/handoff-status.ts:80`). So an `{"status":"awaiting_unit",…,"awaiting_unit":"unit-<D>"}`
that persists on a `<D>` whose tombstone does not match its manifest (or one of the two stands alone) is not the normal state of section 21 (where the tick collects `<D>` again): `recollectOf`
returns null, the tick collects nothing again and the publisher waits. Act: the act of abandon of `<D>` (section 19, (1) then (2)) run again with the
same `--reason`: if it stopped on the way, it writes the same bytes and answers `bell/tick: abandoned unit-<D> reason=<code>`; if it answers
`abandon_refused` (the act was done), **STOP**, escalation; never a write by hand of the tombstone, of its manifest or of a status file.

## 22. The Bell probe on the former host (lot 4b, played in part 5)

**What.** `scripts/probe-bell.mjs` runs as `monark-bell-probe.service`, started by `monark-bell-probe.timer` at 22:30, 23:30, 11:00 and
12:00 UTC (G0 BELL-COLLECT-TIMER-1 DC-9; PLAN-P4 C4-5 to C4-11; pins `test/probe-bell.test.ts`, `test/probe-bell-ots.test.ts`,
`apps/bell/test/bell-units-compose-probe.test.ts`). Each start reads `timeline.jsonl` whole at `BELL_PUBLIC_ORIGIN`, checks its new lines by
the probe's own code under the keyring of its tree, mirrors them with their two immutables under `/var/lib/monark-probe/bell/`, checks the
freshness, the two origins and the site status, timestamps each new line once (four aggregators, two answers at least) and upgrades each
pending proof under `/var/lib/monark-probe/bell/ots/` (`timeline-seq<n>-manifest.txt`, its `.ots`, `registry.jsonl` in append only), writes
`/var/lib/monark-probe/bell.json` (closed keys, no secret), and mails a transition with the mail file of the Narabi probe
(`/etc/monark/probe.env`) but its `SMTP_PASS`, which the unit unsets: the probe reads the password from its own file
`/etc/monark/bell-probe-smtp-pass` (owner `probe`, mode 0600). The user `probe`, its state directory and the mail file exist since the
Narabi probe's deployment (`docs/RUNBOOK-sentinel.md`); the acts below write the tree `/opt/monark-bell-probe`, the password file and the
two units, never `/opt/monark-probe` nor `/etc/monark/probe.env`, and only read `/var/lib/monark-probe`, which the unit alone writes.

**When.** Part 5 only, by the orchestrator, after the G7 of part 4, read from `/f/tmp/bell-dn/probe-G7.txt`; its key: section 1. The host is
the former host, and this section never names it by Bell's public name: step 9 of lot 5b (G0 BELL-COLLECT-TIMER-1, the DNS switch, in both
of its branches) moves that name to the new host, the one the probe watches, while the former host keeps its provider's name
(`srv1993906.hstgr.cloud`, the host facts under "Who runs this" above). Each command reads that name as `$FORMER` from `/f/tmp/bell-dn/probe-host.txt`, a file the
orchestrator writes from the dated FAITS of part 5 that names the former host, and its SSH host key is put under that name once, by
`docs/RUNBOOK-dojo.md` section 15 (0) with `N` set to it, before (0). Rollback of the whole section: the rollbacks of (1) to (3), in reverse.

(0) The precondition, read only, each command with its **STOP**: Bell publishes from its new host, so the former host runs no publisher and
serves no origin the probe reads (a probe on the host it watches would read itself). First, the publisher's units are gone from it (lot
5b, step 8):

```bash
FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'systemctl list-unit-files "monark-bell-publish*" --no-legend | wc -l'
```

Expected: `0`. **STOP** on any other count. Then each origin the probe reads (`BELL_PUBLIC_ORIGIN`, `BELL_LEGACY_ORIGIN`), resolved on the
operator machine by its system resolver, one request per name, against the addresses of `$FORMER`: counts and a verdict only, no address
printed:

```bash
FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && cd /f/Monark && node --input-type=module -e "
import { lookup } from 'node:dns/promises'; import * as D from './scripts/bell-deploy.mjs';
const own = new Set((await lookup(process.argv[1], { all: true })).map((a) => a.address));
for (const h of new Set([D.BELL_PUBLIC_ORIGIN, D.BELL_LEGACY_ORIGIN].map((o) => new URL(o).hostname))) {
  const a = await lookup(h, { all: true }); console.log(h, a.length, own.size, a.some((x) => own.has(x.address)) ? 'SHARED' : 'DISJOINT'); }" "$FORMER"
```

Expected: one line per origin name (one line while the two constants are equal), its two counts above 0 and `DISJOINT`. **STOP** on
`SHARED`, on a count of 0 or on a lookup error: no act below, and no address written anywhere.

(1) The tree at the G7: its list read from the module AT the G7 (never retyped; the working tree equal to the G7 on these paths), shipped,
then compared on both sides (motif of `docs/RUNBOOK-dojo.md` section 25 (2)):

```bash
G7=$(cat /f/tmp/bell-dn/probe-G7.txt) && cd /f/Monark && git diff --quiet "$G7" -- scripts apps/bell/src apps/bell/keys &&
node --input-type=module -e "const m = await import('./scripts/probe-bell.mjs');
console.log(m.BELL_PROBE_TREE_PATHS.join(' '));" > /f/tmp/bell-dn/probe-tree.txt && wc -w < /f/tmp/bell-dn/probe-tree.txt
```

```bash
G7=$(cat /f/tmp/bell-dn/probe-G7.txt) && FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && git -C /f/Monark archive --format=tar.gz "$G7" $(cat /f/tmp/bell-dn/probe-tree.txt) |
tee /f/tmp/bell-dn/probe-tree.tar.gz | ssh -i ~/.ssh/monark_vps "root@$FORMER" 'install -d -m 0755 -o root -g root /opt/monark-bell-probe &&
tar xzf - -C /opt/monark-bell-probe --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-bell-probe &&
find /opt/monark-bell-probe -type d -exec chmod 0755 {} + && find /opt/monark-bell-probe -type f -exec chmod 0644 {} + &&
cd /opt/monark-bell-probe && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t' > /f/tmp/bell-dn/probe-tree.host.sha
```

```bash
rm -rf /f/tmp/bell-dn/probe-tree && mkdir -p /f/tmp/bell-dn/probe-tree && tar xzf /f/tmp/bell-dn/probe-tree.tar.gz -C /f/tmp/bell-dn/probe-tree &&
cd /f/tmp/bell-dn/probe-tree && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum -t > /f/tmp/bell-dn/probe-tree.local.sha &&
wc -l < /f/tmp/bell-dn/probe-tree.local.sha && cmp -s /f/tmp/bell-dn/probe-tree.local.sha /f/tmp/bell-dn/probe-tree.host.sha && echo TREE-EQUAL || echo TREE-DIFFERENT
```

Expected: `6` (the words of the list: the probe, its OpenTimestamps client, probe-narabi, bell-deploy, `sessions.ts`, the committed
keyring), then `6` and `TREE-EQUAL`. **STOP** on no output at the first command and on `TREE-DIFFERENT`. Rollback:
`FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'rm -rf /opt/monark-bell-probe'`.

(2) The password file, a copy of the Dojo probe's (the same mail file, the same user; `docs/RUNBOOK-dojo.md` section 25 (1b) wrote it from
the mail file through systemd's own parser), never printed:

```bash
FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'test -s /etc/monark/dojo-probe-smtp-pass &&
install -m 0600 -o probe -g probe /etc/monark/dojo-probe-smtp-pass /etc/monark/bell-probe-smtp-pass && stat -c "%U %a" /etc/monark/bell-probe-smtp-pass &&
cmp -s /etc/monark/dojo-probe-smtp-pass /etc/monark/bell-probe-smtp-pass && echo copy-equal'
```

Expected: `probe 600`, then `copy-equal`. **STOP** on no output (the Dojo probe's file absent or empty: section 25 (1b) of
`docs/RUNBOOK-dojo.md` first). A bit for the group or others makes every mail fail as `smtp_unconfigured`. After a change of `SMTP_PASS`,
(2) is replayed after the Dojo's (9). Rollback: `FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'rm -f /etc/monark/bell-probe-smtp-pass'`.

(3) The two units from the G7 blobs, their calendar, then the timer enabled:

```bash
G7=$(cat /f/tmp/bell-dn/probe-G7.txt) && FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && for u in monark-bell-probe.service monark-bell-probe.timer; do
git -C /f/Monark cat-file blob "$G7:deploy/$u" |
ssh -i ~/.ssh/monark_vps "root@$FORMER" "umask 022 && cat > /etc/systemd/system/$u" || echo "FAILED $u"; done;
ssh -i ~/.ssh/monark_vps "root@$FORMER" 'systemctl daemon-reload &&
systemctl show -p LoadState -p FragmentPath -p DropInPaths -p NeedDaemonReload monark-bell-probe.service monark-bell-probe.timer &&
sha256sum /etc/systemd/system/monark-bell-probe.service /etc/systemd/system/monark-bell-probe.timer &&
for t in 22:30 23:30 11:00 12:00; do systemd-analyze calendar "*-*-* $t:00 UTC" | grep -E "Normalized|Next"; done &&
systemctl enable --now monark-bell-probe.timer && systemctl list-timers monark-bell-probe.timer --no-pager'
```

Expected: no `FAILED`; `LoadState=loaded` twice, both `FragmentPath` under `/etc/systemd/system`, `DropInPaths=` empty,
`NeedDaemonReload=no`; each digest equal to `git -C /f/Monark cat-file blob "$G7:deploy/<unit>" | sha256sum`; the four expressions
accepted; the timer listed with its next shot. Never `systemctl edit`. Rollback: `FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER"
'systemctl disable --now monark-bell-probe.timer; rm /etc/systemd/system/monark-bell-probe.* && systemctl daemon-reload'`.

(4) The first start, read (the timer's or one by hand, `systemctl start monark-bell-probe.service`, which waits for its end):

```bash
FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'systemctl show -p Result -p ExecMainStatus monark-bell-probe.service &&
cat /var/lib/monark-probe/bell.json && ls -l /var/lib/monark-probe/bell /var/lib/monark-probe/bell/ots'
```

Expected: `Result=success`, `ExecMainStatus=0`; `bell.json` with `"status": "healthy"` and `"alerts": []`. A start keeps at most
`BELL_PROBE_MAX_NEW_PUBLICATIONS` (4) new publications and stamps at most `OTS_MAX_STAMPS` (4) lines; the rest is caught up at the next
starts, with no alert (a line past a start's bound is neither tried nor named). Once caught up: `kept_lines` equal to the lines of the
served timeline, `ots.lines_stamped` equal to it and `ots.lines_unstamped` 0, one manifest and one `.ots` per line under `bell/ots/`.
Then BELL-OTS-NODE-CROSSCHECK-1: the first proof, copied by (5), read on the operator machine by the reference client (the form of section
13 bis point 4, `ots --no-cache info`), its `File sha256 hash` equal to the manifest's digest, in a dated FAITS. **STOP** on any alert:
read its name in `bell.json` (closed list `BELL_PROBE_ALERTS`), never a write under `/var/lib/monark-probe`. Rollback: none (read-only).

(5) Weekly, the proofs to the operator's durable mirror, then into the repository: the copy first, nothing removed on the host:

```bash
T=$(date -u +%Y%m%dT%H%MZ) && FORMER=$(cat /f/tmp/bell-dn/probe-host.txt) && ssh -i ~/.ssh/monark_vps "root@$FORMER" 'cd /var/lib/monark-probe/bell/ots && tar czf - .' > /f/PRODUITS/bell-mirror/ots/probe-ots-$T.tar.gz &&
sha256sum /f/PRODUITS/bell-mirror/ots/probe-ots-$T.tar.gz && tar tzf /f/PRODUITS/bell-mirror/ots/probe-ots-$T.tar.gz | wc -l
```

Expected: the archive's digest (to the JOURNAL) and its count of entries. Then, for each row of `registry.jsonl` of that archive not yet in
`docs/bell-publications/ANCHORS.md`: a `stamped` row, its manifest and proof copied into `docs/bell-publications/` under the name of section
13 bis point 1 (`timeline-seq<n>-<k>-manifest.txt` and its `.ots` when the name is taken, as lines 1 and 2, stamped by hand, are: the
manifest's bytes, not its name, are timestamped), then points 4 and 5 of section 13 bis (`date_u` = the row's `at` to the second); an
`upgraded` row, the upgraded proof copied over its committed copy, the check of point 5, the commit (its git history is the record, ruling
GO1-D), then the sync and the build of point 6; a `tried` row (the first start that asked the calendars for a line and got no proof, the
start of its 24 hours before `ots_unstamped`), nothing to copy. Rollback: none that deletes a proof.

(6) At each key rotation (DC-8, point 4), the probe's keyring: the committed keyring that names the new key is redeployed with the tree,
(1) replayed at the G7 of that commit, BEFORE the `key_rotation` line that names the new key is published; until then the probe alerts
`rotation_key_not_in_keyring` on that line, the first that fails its walk (`scripts/probe-bell.mjs` checks a rotation's new key before its
signer), and keeps no line from it on (fail-closed: the probe never trusts a served key). Rollback: (1) replayed at the previous G7.

**Dated line, 2026-10-16 17:4x UTC (lot 4b; PLAN-P4 C4-10; G0 BELL-COLLECT-TIMER-1 section 13 L-5):** once (1) to (4) of this section are
played (part 5), points 1 to 3 of section 13 bis (the manifest, the stamp, the durable copy) pass to the probe for every new line, on the
former host; the operator keeps (5) of this section and points 4 to 6 of section 13 bis. Until then, section 13 bis stays the act in force,
line by line, and no automatic publication precedes it (G0 DC-10).

**Dated line, 2026-10-22 02:5x UTC (lot 5a of part 5, G0 BELL-COLLECT-TIMER-1; PLAN-P5 C5-4, C5-5, C5-6, C-7):** (1) the publisher's tree has four files: `apps/bell/src/sessions.ts`, the calendar that `apps/bell/scripts/bell-validate.mjs` now imports to refuse an abstention `no_close_ref` served before its gate (PXB-1, prevention (i): `session_not_yet_publishable`, the gap named), joins `BELL_TREE_PATHS`; the list at the top, step 2 (archive, digests, four lines) and the REPLACE replay of step 7 name it, each edited in place. The host already deployed keeps its tree at its deployed SHA and its CA runs with `scripts/verify-bell.mjs` read at that SHA. (2) The rotation in two steps exists in the publisher: `--rotate-draft --state <dir>` (the new key, credential `bell-signing-key-new`: prints the line, signed `sig_new`, writes nothing), `--rotate-cosign --line <file> --state <dir>` (the old key, credential `bell-signing-key`: checks the line against its own head and `sig_new`, prints it signed `sig`, writes nothing), `--rotate-commit --line <file> --state <dir>` (no key: checks both signatures and the head, commits); any line that does not follow the head is refused `rotation_line_mismatch`, its field named, nothing written. It is played at the launch (LA-5); its section in the new host's form is lot 5b's; (R0) to (R6) above stay the acts of an incident. (3) `publish.lock` holds the record of its holder, `{pid, boot_id, taken_at}`, and the publisher serves `--unlock --state <dir>` (no key), which frees only a holder that no longer runs or took the lock in another boot, and refuses a live or unreadable one; a refused writer's detail ends with the holder's state in parentheses. Section 17 (3) stays the act in force until lot 5b rewrites it for `--unlock` (item BELL-PUBLISH-LOCK-RELEASE-1, its test `bell_runbook_unlocks_as_the_unit_user_never_root`). (4) Between (R2) and (R5) the two served-data tests of the site accept the committed keyring as the served one plus ONE last entry `{key_id, jwk}`, the form (R2) appends, and nothing else (`servedKeyringOf` of `scripts/verify-bell.mjs`); check 3 stays red in that window, as declared above. **Dated line, 2026-10-22 04:2x UTC (fold of the review of lot 5a, m-1; D-SW1 of the Dōjō):** every mode that writes the state takes `publish.lock` like `--handoff`: `--inbox`, `--rotate` with or without `--broken`, `--revoke` and `--rotate-commit` (`--generate-key`, `--rotate-draft`, `--rotate-cosign` and `--unlock` write no state); a refusal `lock_held` of any of them, the rotation in two steps included, names the holder's state, writes nothing, and is lifted by `--unlock --state <dir>`, which frees only a holder that no longer runs.
