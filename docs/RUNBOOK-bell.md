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
`ssh -i ~/.ssh/monark_vps root@178.16.131.29`. Host facts (measured): `srv1993906.hstgr.cloud`, hostname `bell`, Hostinger
KVM 2 (2 vCPU / 8 GB / 100 GB), Ubuntu 26.04 LTS, hPanel firewall 0 rule (the host firewall is ufw)
(`docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md` section 1; `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`).

**Target (decision 149, CHANTIERS 16:55 UTC):** `bell.monarkgate.tech` online around 23:00Z. Steps 1-8 (hosting: tree, user,
key, unit, Caddy, HTTPS) need gates G-a, G-c, G-d only. Steps 9-13 (first publication) also need **G-b and G-e**; if either is
missing at 23:00Z, the host goes online serving 404s and the publication waits (never a publication without its pieces).

**Committed files this runbook installs** (all read from the G7 commit, never from a working tree):
- `apps/bell/scripts/bell-publish.mjs` + `apps/bell/scripts/bell-chain.mjs` -> `/opt/monark-bell/` (the ONLY two files of the
  tree: what the unit runs, ADR D1; the CA's `BELL_TREE_PATHS`);
- `deploy/monark-bell-publish.service` -> `/etc/systemd/system/monark-bell-publish.service`;
- `deploy/Caddyfile.monark-bell` -> `/etc/caddy/Caddyfile` (replace mode, ruling C-5; import mode below if ever needed);
- `scripts/verify-bell.mjs` runs locally (the CA), never on the host.

**Conventions.** Each step gives the command, the expected output and the rollback. Commands are ONE line each (no `\`
continuation) and carry no shell state between steps: the G7 SHA is read from `/f/tmp/bell-dn/G7.txt` in every command that
needs it. Local scratch = `/f/tmp/bell-dn/` (outside the repo). **The private key is never displayed, copied or hashed:** no
`cat`/`head`/`less`/`xxd`/`base64`/`openssl` on it, no `set -x`, no environment dump (consigne A-7); the only commands that name
its path are `--generate-key`, `stat`, `test` and `shred` (pinned by `bell_runbook_never_prints_private_key`).

**Who can detect a rewrite (ADR D6, CP1 point iii).** A signed, chained timeline makes a later rewrite of a served line
**detectable by whoever kept an earlier copy**: the operator mirror, whose sha256 is written to the JOURNAL after each publication
(step 13), and any third party holding a copy of `timeline.jsonl` or of the immutables. It is not detectable by a reader who
never kept a copy; nothing here claims more.

---

## 0. Gates and their pieces (C-8) — all precede step 9

| Gate | Condition | Piece (cited by the D-n JOURNAL) | State at writing (base `9cbf60e`) | Needed before |
|---|---|---|---|---|
| **G-a** | G7 of PR-1, PR-2, PR-3 | the three G7 documents + the merge SHA written to `/f/tmp/bell-dn/G7.txt` | open (this lot) | step 2 |
| **G-b** | PR-B-DBN n° 8: EQUS.SUMMARY licence + FAQ "after 24 hours" read on site | a dated FAITS file under `docs/course-bell/` (URL, clock time, quote <= 25 words); offset confirmed, or a change lot G7 before G-e | **open** (no FAITS yet; CHANTIERS:72) | step 9 |
| **G-c** | I-G2-2 (provider backups) + ESC-2 ruling | `docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md` + CHANTIERS 16:45 UTC (ruling R-T1b-3, decision 148) | **lifted** | step 4 |
| **G-d** | DNS A `bell.monarkgate.tech -> 178.16.131.29` | CHANTIERS 13:50 UTC (TTL 300, created 13:49Z) + the resolver output of step 7, replayed at the D-n | **lifted** (replay due) | step 7 |
| **G-e** | first bundle (Q6-COURSE-1 and/or -b1-bis-ii) | sha256 of the bundle manifest (step 9) + the course references (course JOURNAL, anchors) | open | step 9 |

Legal: decision 147 (the lawyer's global GO) lifted decision 79 and closed E-2; no legal gate remains (formal act expected in
November, item JURISTE-ACTE-NOV-1, not blocking). The key is generated after G7 PR-1/PR-2 so the rotation tooling exists
before the first key (FAITS I-G2-2 section 3).

**ESC-2 as ruled after I-G2-2 (G-c).** The Bell private key WILL be contained in the host provider's weekly automatic backups
(image of the whole VPS; no path exclusion offered; 0 backup existed at the reading). Accepted and bounded: (1) the key is
generated ON the Bell host by the orchestrator, never on the operator machine, never in the repo, root:root 0600, handed to
the offline unit by `LoadCredential=`; (2) the fact is DECLARED in the ADR and on `/bell/method`: "the private key is contained
in the host provider's weekly backups"; any restore of a provider backup and any manual snapshot is an **exposure event =>
immediate counter-signed rotation**, journaled in the served timeline; (3) **no manual snapshot is ever created**; (4) the
committed keyring is the trust root (C-9); (5) item **BELL-KEY-ROTATION-CAL-1**: planned rotation at the first of an exposure
event or 90 days (owner orchestrator, trigger dated 2026-12-22).

---

## 1. On-host controls, read-only (ADR D11), and the probe BEFORE capture

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'hostname; systemctl --version | head -1; node -v; command -v node; npm -v; caddy version; systemctl is-active caddy; systemctl show -p ExecStart --value caddy; ufw status; timedatectl show -p NTPSynchronized --value; df -h /var/lib | tail -1; id bell; ls -d /var/lib/monark-bell /etc/monark/bell /opt/monark-bell; command -v sudo; systemctl list-units "monark-*" --all --no-pager; sha256sum /etc/caddy/Caddyfile; wc -l < /etc/caddy/Caddyfile'
```

Expected (measured 2026-09-23 17:0x UTC, `FAITS-vps-bell-precheck-2026-09-23.md`): `bell`; `systemd 259 (259.5-0ubuntu3.4)` (>= 247,
`LoadCredential=` exists since v247, systemd.exec(5)); `v24.21.0`; `/usr/bin/node`; `11.19.0`; `v2.11.4 ...`; `active`; an
ExecStart carrying `/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile`; ufw active with 22/tcp, 80/tcp, 443/tcp ALLOW IN
(v4 and v6); `yes`; about 94G available; `id: 'bell': no such user`; three `No such file or directory`; `/usr/bin/sudo`;
`monark-probe.timer` active (and the failed transient `run-p19072-i21642.service`: OUT OF SCOPE, item PROBE-SIM-UNIT-1, never
reset in this lot); the Caddyfile digest (write it to the JOURNAL) and `21`.
**STOP** if: systemd < 247; caddy not active; NTP not `yes`; the user `bell` or any of the three directories already exists
(this is then not a first deployment: read the host before any act). Rollback: none (read-only).

Probe BEFORE capture (CA check 12; digests only, never contents):

```bash
mkdir -p /f/tmp/bell-dn && ssh -i ~/.ssh/monark_vps root@178.16.131.29 '{ sha256sum /etc/monark/probe.env; cd /opt/monark-probe && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum; }' > /f/tmp/bell-dn/probe-before.sha256; echo exit=$?; wc -l < /f/tmp/bell-dn/probe-before.sha256
```

Expected: `exit=0`; 3 lines or more (`/etc/monark/probe.env`, `./DEPLOYED-SHA`, `./probe-narabi.mjs`). Rollback: none.

## 2. The tree at G7 (gate G-a)

Write the G7 merge SHA once (40 hex), then ship EXACTLY the two files the unit runs:

```bash
git -C /f/Monark rev-parse --verify '<G7 merge commit>^{commit}' > /f/tmp/bell-dn/G7.txt && cat /f/tmp/bell-dn/G7.txt
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark archive --format=tar.gz "$G7" apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'install -d -m 0755 -o root -g root /opt/monark-bell && tar xzf - -C /opt/monark-bell --no-same-owner --no-same-permissions && chown -R root:root /opt/monark-bell && find /opt/monark-bell -type d -exec chmod 0755 {} + && find /opt/monark-bell -type f -exec chmod 0644 {} + && cd /opt/monark-bell && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum'
```

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && for p in apps/bell/scripts/bell-chain.mjs apps/bell/scripts/bell-publish.mjs; do echo "$(git -C /f/Monark cat-file blob "$G7:$p" | sha256sum | cut -c1-64)  ./$p"; done
```

Expected: the remote listing has exactly two lines and each digest equals the local `git cat-file blob` digest (`.gitattributes`
pins `eol=lf`, so `git archive` and `cat-file` carry the same bytes). No `npm` on this host: built-ins only (ADR D3).
Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /opt/monark-bell'`.

## 3. User `bell` and directories

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'useradd --system --no-create-home --shell /usr/sbin/nologin bell && install -d -o bell -g bell -m 0755 /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public && install -d -o root -g root -m 0700 /etc/monark/bell && id bell && stat -c "%a %U:%G %n" /var/lib/monark-bell /var/lib/monark-bell/inbox /var/lib/monark-bell/public /etc/monark/bell && sudo -u caddy test -x /var/lib/monark-bell/public && echo caddy-traverse-ok'
```

Expected: `uid=... (bell) gid=... (bell)`; `755 bell:bell` on the three state paths; `700 root:root /etc/monark/bell`;
`caddy-traverse-ok` (Caddy reads `public/` read-only; the unit's `UMask=0022` keeps what it writes 0644/0755; precedent
`RUNBOOK-sentinel.md:44`). `/var/lib/monark-bell` must exist before any start: it is the unit's only `ReadWritePaths`.
Rollback (before step 4 only): `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /var/lib/monark-bell /etc/monark/bell && userdel bell'`.

## 4. Signing key, generated ON the host (gate G-c; after G7 PR-2)

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 077 && node /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --generate-key /etc/monark/bell/signing-key.pem > /root/bell-pubkey.out; echo gen_exit=$?; stat -c "%a %U:%G %s" /etc/monark/bell/signing-key.pem; grep -c PRIVATE /root/bell-pubkey.out; grep -c -E "[{,] *.d. *:" /root/bell-pubkey.out; wc -c < /root/bell-pubkey.out'
```

Expected: `gen_exit=0`; `600 root:root <size>` (PKCS#8 PEM, ADR D9); then `0` and `0` (the saved output holds no private
material: counts only, never contents); a small byte count. Interface = PR-2 S-6 (ADR D9: "only the public JWK and the key_id",
refuses to overwrite, 0600): re-read its G7 before this step. Then display the PUBLIC output only:
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cat /root/bell-pubkey.out'` -> the JWK `{kty:"OKP", crv:"Ed25519", x}` and the
64-hex `key_id`; write both to the JOURNAL. **If either count is not 0**: the output leaked private material -> exposure before any
publication: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'shred -u /etc/monark/bell/signing-key.pem /root/bell-pubkey.out'`,
record it, fix PR-2 before any new key. Rollback before the first publication: the same `shred -u`, then regenerate (no line is
signed yet, no rotation needed). **After the first publication, the key is never deleted: see "Key incidents".**

## 5. Commit the keyring (trust root, C-9) — operator machine

From the public output of step 4 (`<x>`, `<key_id>`), build the committed keyring with the repo's own code; the command refuses a
`key_id` that is not the sha256 of `x`:

```bash
cd /f/Monark && mkdir -p apps/bell/keys && node --input-type=module -e "import { keyringOf, publicKeyOfJwk, canonical } from './apps/bell/scripts/bell-chain.mjs'; const [x, id] = process.argv.slice(1); const kr = keyringOf(publicKeyOfJwk({ x }), 1); if (kr.keys[0].key_id !== id) { console.error('STOP: key_id mismatch'); process.exit(1); } console.log(canonical(kr));" '<x>' '<key_id>' > apps/bell/keys/bell-keyring.json; echo exit=$?; cat apps/bell/keys/bell-keyring.json
```

Expected: `exit=0`; one canonical line `{"keys":[{"jwk":{"crv":"Ed25519","kty":"OKP","x":"<x>"},"key_id":"<key_id>","status":"active","valid_from_seq":1}],"schema":"bell-keyring-v1"}`
(the exact bytes the publisher serves at `/bell/pubkey.json` for that key: pinned by `bell_runbook_ships_the_ca_tree_and_the_unit_key_path`).
Commit it (orchestrator, R-20); **no push before step 12** (the keyring and the CA JSON pass the full oracle together, decision
136). Rollback: drop the local commit.

## 6. The unit, from the G7 bytes, and a dry start that proves the credential path

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/monark-bell-publish.service" | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'umask 022 && cat > /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload && systemctl show -p NeedDaemonReload --value monark-bell-publish.service && systemctl show -p LoadState -p FragmentPath -p DropInPaths monark-bell-publish.service && sha256sum /etc/systemd/system/monark-bell-publish.service'
```

Expected: `no`; `LoadState=loaded`, `FragmentPath=/etc/systemd/system/monark-bell-publish.service`, `DropInPaths=` (empty); the
digest equals `git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/monark-bell-publish.service" | sha256sum`.
Never `systemctl enable` (no `[Install]`, no timer in lot a) and never `systemctl edit` (a drop-in reddens CA check 11).

Dry start on the EMPTY inbox (the refusal proves: user, sandbox and `LoadCredential` work; nothing is written):

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl start monark-bell-publish.service; echo start_exit=$?; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep "bell/publish"; systemctl reset-failed monark-bell-publish.service; find /var/lib/monark-bell -mindepth 1 | sort'
```

Expected: `start_exit=1`; the journal line `bell/publish: inbox_not_exactly_one_bundle: 0 inbox entries` (NOT
`signing_key_missing`: that would mean the credential did not load -> STOP); `find` lists only `/var/lib/monark-bell/inbox` and
`/var/lib/monark-bell/public`. Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm /etc/systemd/system/monark-bell-publish.service && systemctl daemon-reload'`.

## 7. Caddy (ruling C-5) — gate G-d first

DNS replay (G-d), then the Caddyfile in place recorded BEFORE the act (digest + content; it carries no secret):

```bash
nslookup bell.monarkgate.tech 1.1.1.1; ssh -i ~/.ssh/monark_vps root@178.16.131.29 'getent hosts bell.monarkgate.tech; sha256sum /etc/caddy/Caddyfile; cat /etc/caddy/Caddyfile' > /f/tmp/bell-dn/caddyfile-before.txt; echo exit=$?; head -1 /f/tmp/bell-dn/caddyfile-before.txt
```

Expected: `Address: 178.16.131.29` from 1.1.1.1 and `178.16.131.29 bell.monarkgate.tech` on the host (else **STOP**: no ACME
without the A record); the recorded file. **Classification on this piece**: the package default only (one `:80` block with
`root * /usr/share/caddy` and `file_server`, comments otherwise; measured 17:0x UTC: 21 lines, no other site) => **REPLACE mode**
(below). Any other site in the file => IMPORT mode (at the end of this step), never an edit of those sites.

REPLACE mode: back up, validate the candidate BEFORE it becomes live, atomic rename, reload (never restart):

```bash
G7=$(cat /f/tmp/bell-dn/G7.txt) && git -C /f/Monark cat-file blob "$G7:deploy/Caddyfile.monark-bell" | ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cp -p /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-bell && umask 022 && cat > /etc/caddy/Caddyfile.new && caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile && mv /etc/caddy/Caddyfile.new /etc/caddy/Caddyfile && systemctl reload caddy && systemctl is-active caddy && sha256sum /etc/caddy/Caddyfile'
```

Expected: `Valid configuration`; `active`; the digest equals the local `git cat-file blob "$G7:deploy/Caddyfile.monark-bell" | sha256sum`.
Rollback: `ssh -i ~/.ssh/monark_vps root@178.16.131.29 'cp -p /etc/caddy/Caddyfile.bak-bell /etc/caddy/Caddyfile && caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy'`.

IMPORT mode (only if the recorded file serves another site): the dedicated file is installed WHOLE at
`/etc/caddy/monark-bell.caddyfile` (same pipe, `cat > /etc/caddy/monark-bell.caddyfile`), ONE line
`import /etc/caddy/monark-bell.caddyfile` is appended to `/etc/caddy/Caddyfile` after the same backup, then
`caddy validate --config /etc/caddy/Caddyfile` and `systemctl reload caddy`. CA check 11 (b) accepts exactly one `import` line
targeting that file. Rollback: restore the backup, remove the dedicated file, validate, reload.

## 8. HTTPS constated (automatic certificate)

```bash
curl -sS -o /dev/null -w "%{http_code} %{ssl_verify_result}" https://bell.monarkgate.tech/; echo; curl -sS -o /dev/null -w "%{http_code}" https://bell.monarkgate.tech/state.json; echo
```

Expected: `404 0` (no listing, certificate valid; retry after 30 s while ACME completes, at most 5 tries) and `404` (nothing
published yet). **STOP** if the TLS result is not 0 after the retries: read `journalctl -u caddy -n 50 --no-pager` (no secret
there) before anything else. Rollback: the step 7 rollback. **Hosting is now online; steps 9-13 wait for G-b and G-e.**

## 9. The first bundle (gates G-b and G-e)

A bundle is ONE directory whose sub-directories are `runMain --out` directories exactly as written (`state.json`,
`timeline.jsonl`, `provenance.json`, `journal.json`; the last one is tolerated and never served). Manifest and bundle digest
(both sides normalise the Windows `*` marker of sha256sum):

```bash
cd /f/tmp/bell-dn/bundle-1 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | tr -d "*" | tr -s " " > /f/tmp/bell-dn/bundle-1.manifest && sha256sum /f/tmp/bell-dn/bundle-1.manifest
```

Expected: the bundle digest (G-e piece, with the course references). Transfer into the inbox (exactly one entry), owned by `bell`:

```bash
scp -r -i ~/.ssh/monark_vps /f/tmp/bell-dn/bundle-1 root@178.16.131.29:/var/lib/monark-bell/inbox/ && ssh -i ~/.ssh/monark_vps root@178.16.131.29 'chown -R bell:bell /var/lib/monark-bell/inbox/bundle-1 && ls /var/lib/monark-bell/inbox && cd /var/lib/monark-bell/inbox/bundle-1 && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | tr -d "*" | tr -s " " | sha256sum'
```

Expected: `ls` prints only `bundle-1`; the remote digest equals the local one. Rollback (before step 10):
`ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /var/lib/monark-bell/inbox/bundle-1'`.

## 10. Publish (operator act)

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'systemctl start monark-bell-publish.service; echo start_exit=$?; journalctl -u monark-bell-publish.service -n 10 --no-pager -o cat | grep -E "status|bell/publish"; ls /var/lib/monark-bell/inbox | wc -l; ls /var/lib/monark-bell/public'; curl -sI https://bell.monarkgate.tech/state.json | head -1; curl -sI https://bell.monarkgate.tech/bell/pubkey.json | head -1
```

Expected: `start_exit=0`; one JSON line `{"status":"published","seq":1,"published_at":...,"state_sha256":...,"provenance_sha256":...,"line_hash":...}`
(no secret in it); `0` (the bundle moved to `archive/`); `bell provenance provenance.json state.json states timeline.jsonl`; then
`HTTP/2 200` twice (S-12). A refusal prints `bell/publish: <code>: <detail>` and writes nothing: fix the bundle, never the state.
Rollback: **none that deletes** (append-only, signed). A wrong publication is corrected by a NEW publication; serving can be
stopped by the step 7 rollback; a rewrite would be detectable by the mirrors (see "Who can detect a rewrite").

## 11. CA (ADR D11, 12 named checks) — host capture, then `scripts/verify-bell.mjs`

```bash
ssh -i ~/.ssh/monark_vps root@178.16.131.29 'rm -rf /root/bell-capture && install -d -m 0700 /root/bell-capture && cd /root/bell-capture && cp /etc/caddy/Caddyfile caddyfile-main && { if [ -f /etc/caddy/monark-bell.caddyfile ]; then cp /etc/caddy/monark-bell.caddyfile caddyfile-dedicated; fi; } && systemctl cat monark-bell-publish.service > systemctl-cat.txt && systemctl show -p NeedDaemonReload --value monark-bell-publish.service > need-daemon-reload.txt && (cd /opt/monark-bell && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum) > tree.sha256 && sha256sum *' && scp -r -i ~/.ssh/monark_vps root@178.16.131.29:/root/bell-capture /f/tmp/bell-dn/ && ssh -i ~/.ssh/monark_vps root@178.16.131.29 '{ sha256sum /etc/monark/probe.env; cd /opt/monark-probe && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum; }' > /f/tmp/bell-dn/probe-after.sha256; echo exit=$?
```

```bash
cd /f/Monark && node scripts/verify-bell.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json --g7 "$(cat /f/tmp/bell-dn/G7.txt)" --tree-digests /f/tmp/bell-dn/bell-capture/tree.sha256 --loaded-config /f/tmp/bell-dn/bell-capture --probe-digests /f/tmp/bell-dn/probe-before.sha256 /f/tmp/bell-dn/probe-after.sha256 --out docs/deploy-CA-bell.json > /f/tmp/bell-dn/ca.stdout 2> /f/tmp/bell-dn/ca.stderr; echo ca_exit=$?; cat /f/tmp/bell-dn/ca.stderr
```

Expected: `ca_exit=0` and `VERIFY OK - 12/12 checks passed (tls.authorized=true)`; `docs/deploy-CA-bell.json` written (12 checks,
`tls.authorized: true`, the sha256 of every observed body and input). Checks: 1 `state.json` 200 + schema; 2 `timeline.jsonl` 200;
3 `/bell/pubkey.json` == committed keyring; 4 `provenance.json` 200 + schema; 5 `bell-verify.mjs <url> --keyring <committed keyring>`
exit 0 (trust root = the committed keyring, C-9); 6 ACAO `*`; 7 no listing; 8 `immutable` on `states/`, `no-cache` on the current
files; 9 `tls.authorized === true` (a skipped TLS never passes); 10 no private material served; 11 tree, loaded Caddyfile and
loaded unit == `git cat-file blob <G7>:<path>`, one fragment, no drop-in, `NeedDaemonReload=no` (C-5); 12 probe digests unchanged.
Any red check: **STOP**, no announcement; the named check says where; e.g. for check 11 (c),
`diff /f/tmp/bell-dn/bell-capture/systemctl-cat.txt <(echo "# /etc/systemd/system/monark-bell-publish.service"; git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7.txt):deploy/monark-bell-publish.service")`.
The `.jsonl` Content-Type is recorded in `content_types` (CP1 point ii, measured here; item BELL-JSONL-CTYPE-1). Rollback: none (read-only).

## 12. JOURNAL, then commit and push

Commit `docs/deploy-CA-bell.json` with the keyring of step 5, run the FULL oracle on that tree (`npm run ci`, `npm run lint`,
`npm run lint:ratchet`, `npm run lang:gate`, `npm run export:check`, the paid variables removed from the environment, A-7), and
push only if all exit 0 (decision 136). The D-n JOURNAL-PROVENANCE entry cites EVERY piece: G-a (G7 documents + SHA), G-b (FAITS),
G-c (FAITS + CHANTIERS 16:45 UTC), G-d (CHANTIERS 13:50 UTC + the step 7 resolver output), G-e (bundle digest + course
references), the step 1 values, the `key_id`, the keyring commit, the CA JSON digest, the step 13 mirror digest. The public
register is unchanged (Bell stays `upcoming`, ADR D12); "served" is an internal state from here.

## 13. Operator mirror (after EVERY publication)

```bash
mkdir -p /f/tmp/bell-dn/mirror && curl -sS https://bell.monarkgate.tech/timeline.jsonl -o /f/tmp/bell-dn/mirror/timeline-seq1.jsonl && sha256sum /f/tmp/bell-dn/mirror/timeline-seq1.jsonl
```

Expected: the digest, written to the JOURNAL; the orchestrator then keeps the file in its durable mirror (outside the repo, never
under `F:/tmp` alone). This copy is what makes a later rewrite detectable (ADR D6).

---

## Next publications

Steps 9 and 10 for the new bundle (`bundle-<n>`), step 11 (fresh host capture and probe capture) and steps 12-13 (JOURNAL,
mirror `timeline-seq<n>.jsonl`). The same bundle twice publishes nothing (`nothing_to_publish`, exit 0).

## Key incidents (ADR D9, ESC-2)

- **Exposure event** (a provider backup restored, any snapshot, a suspected leak, a host change): counter-signed rotation
  IMMEDIATELY with the PR-2 tooling (`key_rotation` line signed by the old and the new key), the new public key committed to the
  keyring and cited on `/bell/method`, JOURNAL entry. Never a manual snapshot.
- **Compromise**: `key_revocation` line signed by the new key; lines of the revoked key at `seq >= revoked_from_seq` are invalid;
  announced out of band (committed keyring, `/bell/method`, JOURNAL). Residual: the window before detection.
- **Loss**: `key_rotation` with `continuity:"broken"`, accepted by verifiers ONLY because the new key is in the committed keyring
  (C-9); the break is reported, never hidden.
- **Planned**: BELL-KEY-ROTATION-CAL-1 (90 days or an exposure event, trigger 2026-12-22).

## Never

`cat`/`head`/`tail`/`less`/`xxd`/`od`/`base64`/`openssl` on the key file; `sha256sum` of the key; `set -x`; printing the
environment; `systemctl enable` or `systemctl edit` on this unit; editing `/etc/caddy/Caddyfile` in place; a Caddy access log
before decision 78's trigger (C-2, item BELL-ACCESS-LOG-1); cleaning `run-p19072-i21642.service` or touching `/opt/monark-probe`,
`/etc/monark/probe.env`, `/var/lib/monark-probe` (CA check 12; item PROBE-SIM-UNIT-1).
