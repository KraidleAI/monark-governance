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
- `apps/bell/scripts/bell-publish.mjs` + `apps/bell/scripts/bell-chain.mjs` -> `/opt/monark-bell/` (the ONLY two files of the
  tree: what the unit runs, ADR D1; the CA's `BELL_TREE_PATHS`);
- `deploy/monark-bell-publish.service` -> `/etc/systemd/system/monark-bell-publish.service`;
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

Write the G7 merge SHA once (40 hex), then ship EXACTLY the two files the unit runs:

```bash
git -C /f/Monark rev-parse --verify '<G7 merge commit>^{commit}' > /f/tmp/bell-dn/G7.txt && cat /f/tmp/bell-dn/G7.txt
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'install -d -m 0755 -o root -g root /opt/monark-bell && tar xzf - -C /opt/monark-bell --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-bell && find /opt/monark-bell -type d -exec chmod 0755 {} + && find /opt/monark-bell -type f -exec chmod 0644 {} + && cd /opt/monark-bell && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum'
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && for p in apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs; do echo "$(git -C /f/Monark cat-file blob "$G7:$p" | sha256sum | cut -c1-64)  ./$p"; done
```

Expected: the remote listing has exactly two lines and each digest equals the local `git cat-file blob` digest (`.gitattributes`
pins `eol=lf`, so `git archive` and `cat-file` carry the same bytes). No `npm` on this host: built-ins only (ADR D3).
Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm -rf /opt/monark-bell'`.

## 3. User `bell` and directories

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'useradd --system --no-create-home --shell /usr/sbin/nologin bell && install -d -o bell -g bell -m 0755 /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public && install -d -o root -g root -m 0700 /etc/monark/bell && id bell && stat -c "%a %U:%G %n" /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public /etc/monark/bell && sudo -u caddy test -x /var/lib/monark-bell/public && echo caddy-traverse-ok'
```

Expected: `uid=... (bell) gid=... (bell)`; `755 bell:bell` on the three state paths; `700 root:root /etc/monark/bell`;
`caddy-traverse-ok` (Caddy reads `public/` read-only; the unit's `UMask=0022` keeps what it writes 0644/0755; precedent
`RUNBOOK-sentinel.md:44`). `/var/lib/monark-bell` must exist before any start: it is the unit's only `ReadWritePaths`.
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

## 6. The unit, from the G7 bytes, and a dry start that proves the credential path

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/monark-bell-publish.service" | ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 022 && cat > /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload && systemctl show -p NeedDaemonReload --value monark-bell-publish.service && systemctl show -p LoadState -p FragmentPath -p DropInPaths monark-bell-publish.service && sha256sum /etc/systemd/system/monark-bell-publish.service'
```

Expected: `no`; `LoadState=loaded`, `FragmentPath=/etc/systemd/system/monark-bell-publish.service`, `DropInPaths=` (empty); the
digest equals `git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/monark-bell-publish.service" | sha256sum`.
Never `systemctl enable` (no `[Install]`, no timer in lot a) and never `systemctl edit` (a drop-in reddens CA check 11).

Dry start on the EMPTY inbox (the refusal proves: user, sandbox and `LoadCredential` work; nothing is written):

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl start monark-bell-publish.service; echo start_exit=$?; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep "bell/publish"; systemctl reset-failed monark-bell-publish.service; find /var/lib/monark-bell -mindepth 1 | sort'
```

Expected: `start_exit=1`; the journal line `bell/publish: inbox_not_exactly_one_bundle: 0 inbox entries` (NOT
`signing_key_missing`: that would mean the credential did not load -> STOP); `find` lists only `/var/lib/monark-bell/inbox` and
`/var/lib/monark-bell/public`. Rollback: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'rm /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload'`.

## 7. Caddy (ruling C-5) — gate G-d first

DNS replay (G-d), then the Caddyfile in place recorded BEFORE the act (digest + content; it carries no secret):

```bash
nslookup bell.monarkgate.tech one.one.one.one; ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'getent hosts bell.monarkgate.tech; sha256sum /etc/caddy/Caddyfile; cat /etc/caddy/Caddyfile' > /f/tmp/bell-dn/caddyfile-before.txt; echo exit=$?; head -1 /f/tmp/bell-dn/caddyfile-before.txt
```

Expected: `Address: <address>` from one.one.one.one and `<address> bell.monarkgate.tech` on the host, `<address>` the Bell host's (else **STOP**: no ACME
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
{ [ -e /f/tmp/bell-dn/G7-1.txt ] || cp /f/tmp/bell-dn/G7.txt /f/tmp/bell-dn/G7-1.txt; } && git -C /f/Monark rev-parse --verify '<G7 merge commit of the lot>^{commit}' > /f/tmp/bell-dn/G7.txt && git -C /f/Monark diff --quiet "$(cat /f/tmp/bell-dn/G7-1.txt)" "$(cat /f/tmp/bell-dn/G7.txt)" -- apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs deploy/monark-bell-publish.service; echo same_tree_and_unit=$?; cat /f/tmp/bell-dn/G7.txt
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

```bash
ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'systemctl start monark-bell-publish.service; echo start_exit=$?; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep -E "status|bell/publish"; ls /var/lib/monark-bell/inbox | wc -l; ls /var/lib/monark-bell/public'; curl -sI https://bell.monarkgate.tech/state.json | head -1; curl -sI https://bell.monarkgate.tech/bell/pubkey.json | head -1
```

Expected: `start_exit=0`; one JSON line `{"status":"published","seq":1,"published_at":...,"state_sha256":...,"provenance_sha256":...,"line_hash":...}`
(no secret in it); `0` (the bundle moved to `archive/`); `bell provenance provenance.json state.json states timeline.jsonl`; then
`HTTP/2 200` twice (S-12). A refusal prints `bell/publish: <code>: <detail>` and writes nothing: the bundle is RE-PRODUCED (a new
course, section 8 bis), never edited by hand (no relabel of a provider label, no field edit: the seq 1 relabel is not repeated,
ADR-BELL-CASH-LEG-1), and the state is never touched.
Rollback: **none that deletes** (append-only, signed). A wrong publication is corrected by a NEW publication; serving can be
stopped by the step 7 rollback; a rewrite would be detectable by the mirrors (see "Who can detect a rewrite").

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
  commit. Never a manual snapshot. Each act only while `monark-bell-publish.service` is not active (item BELL-STATE-LOCK-1 (i)):
  (R1) new key ON the host, counted like step 4 (both counts 0), then `cat /root/bell-pubkey-new.out` (public part only):
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'umask 077 && node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --generate-key /etc/monark/bell/signing-key-new.pem > /root/bell-pubkey-new.out; echo gen_exit=$?; grep -c PRIVATE /root/bell-pubkey-new.out; grep -c -E "[{,] *.d. *:" /root/bell-pubkey-new.out'`;
  (R2) on the operator machine, the new PUBLIC key appended to the committed keyring and committed BEFORE the rotation, so a
  third party's `--keyring` check never reddens on the new key (served keys within the supplied keyring):
  `cd /f/Monark && node --input-type=module -e "import { readFileSync } from 'node:fs'; import { keyringOf, publicKeyOfJwk, canonical } from './apps/bell/scripts/bell-chain.mjs'; const [x, id] = process.argv.slice(1); const e = keyringOf(publicKeyOfJwk({ x }), 1).keys[0]; if (e.key_id !== id) { console.error('STOP: key_id mismatch'); process.exit(1); } const kr = JSON.parse(readFileSync('apps/bell/keys/bell-keyring.json', 'utf8')); kr.keys.push({ key_id: e.key_id, jwk: e.jwk }); console.log(canonical(kr));" -- '<x new>' '<key_id new>' > /f/tmp/bell-dn/keyring-r2.json && mv /f/tmp/bell-dn/keyring-r2.json apps/bell/keys/bell-keyring.json`, then
  commit (R-20), full oracle (step 12), push (decision 136); (R3) starts only once that commit is pushed;
  (R3) the rotation, one transient job with the unit's sandbox and BOTH credentials (the old key signs `sig`, the new key `sig_new`):
  `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'test "$(systemctl is-active monark-bell-publish.service)" != active && systemd-run --wait --pipe --collect --uid=bell --gid=bell -p PrivateNetwork=yes -p NoNewPrivileges=yes -p ProtectSystem=strict -p ProtectHome=yes -p PrivateTmp=yes -p ReadWritePaths=/var/lib/monark-bell -p UMask=0022 -p LoadCredential=bell-signing-key:/etc/monark/bell/signing-key.pem -p LoadCredential=bell-signing-key-new:/etc/monark/bell/signing-key-new.pem /usr/bin/env node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --rotate --state /var/lib/monark-bell'`
  -> one JSON line with `"status":"rotated"`; this transient form is not yet run on the host: a property that `systemd-run`
  refuses must fail before the job starts (read its error, nothing is written);
  (R4) the new key becomes the unit's key: `ssh -i ~/.ssh/monark_vps root@bell.monarkgate.tech 'shred -u /etc/monark/bell/signing-key.pem && mv /etc/monark/bell/signing-key-new.pem /etc/monark/bell/signing-key.pem && stat -c "%a %U:%G" /etc/monark/bell/signing-key.pem'` -> `600 root:root`;
  (R5) verification: commit the served `/bell/pubkey.json` bytes as `apps/bell/keys/bell-keyring.json` (the derived keyring:
  statuses), then step 11 (CA 12/12), `/bell/method` cites the new key, JOURNAL entry, then step 13 (the timeline copy) and
  step 13 bis (the timestamp of the key line, without `--immutables`: it bounds the instant of the rotation or revocation); between
  (R2) and (R5) check 3 (served == committed) is red and check 5 is not (declared window).
  A loss: (R1), (R2), then (R3) with `--rotate --broken` and only the `bell-signing-key-new` credential, then (R4) without
  `shred` (the old file is gone: `mv /etc/monark/bell/signing-key-new.pem` onto the unit's path, then `stat`), then (R5); a
  revocation (`--revoke <key_id> --from-seq <n>`, signed by the active key `bell-signing-key`, one credential) skips (R1), (R2) and (R4).
- **Compromise**: `key_revocation` line signed by the new key; lines of the revoked key at `seq >= revoked_from_seq` are invalid;
  announced out of band (committed keyring, `/bell/method`, JOURNAL). Residual: the window before detection.
- **Loss**: `key_rotation` with `continuity:"broken"`, accepted by verifiers ONLY because the new key is in the committed keyring
  (C-9); the break is reported, never hidden.
- **Planned**: BELL-KEY-ROTATION-CAL-1 (90 days or an exposure event, trigger 2026-12-22).

## Never

`cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64`/`openssl` on the key file; `sha256sum` of the key; `set -x`; printing the
environment; `systemctl enable` or `systemctl edit` on this unit; editing `/etc/caddy/Caddyfile` in place; a Caddy access log
before decision 78's trigger (C-2, item BELL-ACCESS-LOG-1); cleaning `run-p19072-i21642.service` or touching `/opt/monark-probe`,
`/etc/monark/probe.env`, `/var/lib/monark-probe` (CA check 12; item PROBE-SIM-UNIT-1); editing a produced bundle by hand, a relabel
included (a refused bundle is re-produced, section 10); an OpenTimestamps stamp on the Bell host; an `ots upgrade` before the
durable copy of the pending proof, a committed or served `.bak`, or an overwritten proof (step 13 bis).
