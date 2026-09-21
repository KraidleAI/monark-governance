# RUNBOOK — deploy the MONARK Narabi sentinel (orchestrator-deployed)

The **Narabi sentinel** is a daily `oneshot` job (`apps/sentinel/src/run.ts`) that reads the attested USDe
redemption flow at finality, steps the M009 tracker, and publishes a replayable timeline at
`monarkgate.tech/narabi/`. It is the FIRST outbound-network process on the VPS (public RPC, read-only; optional keyed 9th operator via out-of-repo EnvironmentFile, ADR-NARABI-OPS-1)
and writes ONLY its state dir. This runbook **mirrors `RUNBOOK-harness.md`**; only the deltas are here.

**Who runs this:** the **orchestrator**, over the same SSH channel as the harness/vitrine
(`ssh -i ~/.ssh/monark_vps root@31.97.155.188`). Deploy order (ADR-M012 D5): (a) harness redeploy from HEAD;
(b) sentinel; (c) **J0 = the first published window** (non_evaluable, no predecessor); the first tracker step
is J0+1; T counts live steps.

**Committed files this runbook installs:**
- `deploy/monark-sentinel.service` — the `oneshot` unit (`User=sentinel`, `ReadWritePaths=/var/lib/monark-sentinel`).
- `deploy/monark-sentinel.timer` — four same-day retry slots (00:30/03:30/06:30/09:30 UTC) + jitter, `Persistent=true` (ADR-NARABI-OPS-1 L-2).
- `deploy/Caddyfile.monark-narabi.snippet` — the `handle_path /narabi/*` block to INSERT in the vitrine block.
- `/etc/monark/sentinel.env` — NOT committed: the optional `CHAINSTACK_ETH_URL` (a distinct paid operator, ADR-NARABI-OPS-1 L-3). Posted by the orchestrator in step 4; absent, the run falls back to the 8 public endpoints and stays fail-closed.

---

## 0. Preconditions (verify, do not create)

- `RUNBOOK-harness.md` already applied; the vitrine block (`monarkgate.tech` + `www` → `localhost:3000`) is
  live in `/etc/caddy/Caddyfile`; Node ≥ 24; `/opt/monark-harness` present.

## 1. Ship the sentinel tree (it rides inside the harness archive)

`apps/sentinel/` ships **inside `apps/`**, which `RUNBOOK-harness.md` step 1 already archives. Re-run that
`git archive … apps packages … | ssh … tar xzf -` from HEAD (it now carries `apps/sentinel/`), then on the VPS:

```bash
cd /opt/monark-harness
npm ci                                        # @monark/* workspace symlinks incl. @monark/sentinel
test -f apps/sentinel/src/run.ts || echo "STOP: sentinel not shipped — re-archive apps/ from HEAD"
```

## 2. Create the `sentinel` user and its state dir (readable by caddy)

```bash
useradd --system --no-create-home --shell /usr/sbin/nologin sentinel   # ignore "already exists"
install -d -o sentinel -g sentinel -m 0755 /var/lib/monark-sentinel
install -d -o sentinel -g sentinel -m 0755 /var/lib/monark-sentinel/public
# Caddy serves public/ read-only: the dir chain is 0755 and the files the job writes are 0644 (its umask).
# Verify caddy can traverse to it (no write needed): `sudo -u caddy test -x /var/lib/monark-sentinel/public && echo ok`
```

## 3. Dry-run the pipeline before enabling the timer (writes NOTHING)

```bash
cd /opt/monark-harness
# <J0-1> = the UTC day BEFORE go-live. --dry-run computes the fetch + attest + slice and writes nothing.
# `--day` is used ONLY WITH `--dry-run` here (inspection); a non-dry `--day` on an empty state would make
# that day the de-facto J0 — set J0 by the env drop-in (step 4), NEVER by `--day` (O-b).
sudo -u sentinel MONARK_SENTINEL_DIR=/var/lib/monark-sentinel \
  node apps/sentinel/src/run.ts --dry-run --day <J0-1>
# Expect JSON on stdout (startDay, j0Source, finalized head, processedDays, T) and "--dry-run: nothing written."
# --dry-run carries the SAME exit code as a real run (1 iff a fetch/quorum/c1 stop prevented catch-up, else 0),
# yet writes NOTHING — a safe pre-flight (OBS-2 / C-V-2; test case (e) reds the "exit code dropped in --dry-run" mutant).
# On a fresh state the first day is non_evaluable (no predecessor) so T=0; the first tracker STEP is J0+1
# (ADR-M012 D5: J0 is the first published window; the first step is J0+1; T counts live steps only).
ls /var/lib/monark-sentinel   # must still be EMPTY (public/ only) — a dry-run leaves no state.
```

## 4. Install and enable the timer (FIRST INSTALL — for a redeploy on a live timer, see §6)

**The first production run sets J0 ONLY via the `MONARK_SENTINEL_J0` env drop-in below — NEVER via `--day`
(O-b).** On an empty state a non-dry `--day D` would make D the *de-facto* J0 (checkpoint-2 nuance); the
drop-in is the one honest way to declare J0 so T counts live steps from J0+1.

```bash
cp /opt/monark-harness/deploy/monark-sentinel.service /etc/systemd/system/
cp /opt/monark-harness/deploy/monark-sentinel.timer   /etc/systemd/system/
# (ADR-NARABI-OPS-1 L-2 / C-2) Validate ALL FOUR OnCalendar retry slots BEFORE enabling — a malformed
# expression would silently never fire:
grep '^OnCalendar=' /etc/systemd/system/monark-sentinel.timer | cut -d= -f2- | \
  while read -r e; do systemd-analyze calendar "$e" || echo "STOP: invalid OnCalendar '$e'"; done
#   expect four "Next elapse:" blocks, no STOP.
# Set J0 (the first published day) as a drop-in so T counts live steps from J0+1 (never --day; O-b):
# Explicit drop-in (scriptable over SSH; `systemctl edit` needs a TTY/editor and is NOT used):
mkdir -p /etc/systemd/system/monark-sentinel.service.d
printf '[Service]\nEnvironment=MONARK_SENTINEL_J0=<J0>\n' > /etc/systemd/system/monark-sentinel.service.d/override.conf
# (ADR-NARABI-OPS-1 L-3 / C-5 / C-9) Post the OPTIONAL Chainstack key OUT OF BAND, from the orchestrator's LOCAL
# shell (where $CHAINSTACK_ETH_URL already lives — decision 43): via ssh STDIN so the key never appears in a
# command-line arg, the transcript, or any git-tracked file. NEVER `cat` the remote file back; NEVER `set -x`.
#   printf 'CHAINSTACK_ETH_URL=%s\n' "$CHAINSTACK_ETH_URL" \
#     | ssh -i ~/.ssh/monark_vps root@31.97.155.188 \
#         'umask 077; install -d -m 0750 -o root -g sentinel /etc/monark; cat > /etc/monark/sentinel.env; chown root:sentinel /etc/monark/sentinel.env; chmod 0640 /etc/monark/sentinel.env'
#   Verify by DIGEST on BOTH sides (never print the file contents) — the two hashes MUST be identical:
#   printf 'CHAINSTACK_ETH_URL=%s\n' "$CHAINSTACK_ETH_URL" | sha256sum                 # local
#   ssh -i ~/.ssh/monark_vps root@31.97.155.188 'sha256sum /etc/monark/sentinel.env'  # remote
#   (The investor MAY post /etc/monark/sentinel.env themselves instead; this runbook accepts it identically.)
#   Skipping this step is legal (the '-' on EnvironmentFile): the run falls back to the 8 public endpoints,
#   fail-closed, and `chainstack:false` appears in the run's end JSON.
systemctl daemon-reload
systemctl show -p Environment monark-sentinel.service   # MUST print MONARK_SENTINEL_J0=<J0> BEFORE enable --now
systemctl show -p EnvironmentFiles monark-sentinel.service  # expect -/etc/monark/sentinel.env (the leading - = optional)
systemctl enable --now monark-sentinel.timer
systemctl list-timers monark-sentinel.timer --no-pager    # next elapse ~00:30 UTC
# First manual step (optional, on/after J0): `systemctl start monark-sentinel.service` then
# `journalctl -u monark-sentinel -n 20 --no-pager` — expect "wrote N line(s); T=…".
# O-d: the unit does not pin UMask, so CHECK (do not assume) the published files are world-readable 0644 and
# owned by sentinel: `stat -c '%a %U' /var/lib/monark-sentinel/public/state.json` must print `644 sentinel`
# (if not, `chmod 0644` the two published files; Caddy serves public/ read-only).
```

## 5. First edit of the vitrine Caddy block (NAMED step — C-1)

This is the **first change to the live vitrine block since go-live**. Insert the `/narabi/` snippet INSIDE it
(never a separate site block — that is an "ambiguous site definition" and takes the site down).

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%Y%m%d)   # backup FIRST
# Edit /etc/caddy/Caddyfile: paste the body of deploy/Caddyfile.monark-narabi.snippet INSIDE the
# `monarkgate.tech, www.monarkgate.tech { … }` block, on the line BEFORE `reverse_proxy localhost:3000`.
caddy validate --config /etc/caddy/Caddyfile          # must say "Valid configuration"
systemctl reload caddy                                 # reload, never restart (keeps the vitrine up)
curl -sI https://monarkgate.tech/            | head -1 # expect HTTP/2 200 — the vitrine still serves
curl -sI https://monarkgate.tech/narabi/state.json | head -1  # 200 once step 4 has produced state.json
```

**Rollback:** delete the `handle_path /narabi/*` lines (or `cp` the `.bak` back), `caddy validate`, `systemctl
reload caddy`. Disable the job with `systemctl disable --now monark-sentinel.timer`.

## 6. Redeploy (lot NARABI-OPS-1) on a LIVE timer

Sections 0–5 are the FIRST install (`useradd`, the J0 drop-in, `enable --now`). Lot NARABI-OPS-1 ships onto a
timer that is ALREADY active with a NON-EMPTY state, so the procedure differs: do NOT re-lay the J0 drop-in
(the run RESUMES, `j0Source: state`), and use `restart`, not `enable --now`. Run it from the orchestrator over
the usual SSH channel (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`), archiving from `main` HEAD AFTER the G7
merge — never from a lot worktree branch.

```bash
cd /opt/monark-harness
# (1) Ship the new tree: re-run RUNBOOK-harness.md step 1
#     (`git archive <main HEAD> … apps packages … | ssh … tar xzf -`) — it now carries the updated apps/sentinel/.
npm ci                                        # refresh @monark/* workspace symlinks incl. @monark/sentinel
test -f apps/sentinel/src/run.ts || echo "STOP: sentinel not shipped — re-archive apps/ from main HEAD"
# (2) Copy BOTH units (the .timer changed: four OnCalendar slots + Persistent=true, ADR-NARABI-OPS-1 L-2).
cp /opt/monark-harness/deploy/monark-sentinel.service /etc/systemd/system/
cp /opt/monark-harness/deploy/monark-sentinel.timer   /etc/systemd/system/
# (3) Validate ALL FOUR OnCalendar slots BEFORE reloading — a malformed expression silently never fires (C-2):
grep '^OnCalendar=' /etc/systemd/system/monark-sentinel.timer | cut -d= -f2- | \
  while read -r e; do systemd-analyze calendar "$e" || echo "STOP: invalid OnCalendar '$e'"; done
#     expect FOUR "Next elapse:" blocks, no STOP.
# (4) Do NOT re-lay the J0 drop-in: the state is non-empty, so dueDays RESUMES from prevDay+1 and j0Source is
#     "state". Leave /etc/systemd/system/monark-sentinel.service.d/override.conf as it is.
# (5) The OPTIONAL Chainstack key (ADR-NARABI-OPS-1 L-3 / C-5 / C-9): post it ONLY if not already present.
#     Check first by DIGEST (never `cat` the file, never `set -x`):
#   ssh -i ~/.ssh/monark_vps root@31.97.155.188 'test -f /etc/monark/sentinel.env && sha256sum /etc/monark/sentinel.env || echo absent'
#     If absent (or to rotate), post via ssh STDIN so the key never reaches an arg, the transcript, or a git file:
#   printf 'CHAINSTACK_ETH_URL=%s\n' "$CHAINSTACK_ETH_URL" \
#     | ssh -i ~/.ssh/monark_vps root@31.97.155.188 \
#         'umask 077; install -d -m 0750 -o root -g sentinel /etc/monark; cat > /etc/monark/sentinel.env; chown root:sentinel /etc/monark/sentinel.env; chmod 0640 /etc/monark/sentinel.env'
#     Then verify by DIGEST on BOTH sides — the two hashes MUST be identical (never print the contents):
#   printf 'CHAINSTACK_ETH_URL=%s\n' "$CHAINSTACK_ETH_URL" | sha256sum                 # local
#   ssh -i ~/.ssh/monark_vps root@31.97.155.188 'sha256sum /etc/monark/sentinel.env'  # remote
systemctl daemon-reload
# (6) On an ALREADY-ACTIVE timer, `restart` is the safe default. (Whether `daemon-reload` alone recomputes the
#     next elapse of an active timer is NOT verified here — no source consulted; the `restart` makes it moot.)
systemctl restart monark-sentinel.timer
systemctl list-timers monark-sentinel.timer --no-pager   # next elapse MUST be consistent with the four slots
# (7) A restart during the day MAY fire a run at once: under Persistent=true ([abs], CHECKPOINT1 §2(2)) a
#     newly-passed elapse since the last stored trigger can run immediately. HARMLESS by the L-4 replay (a no-op
#     "nothing due", or a legitimate catch-up) — LOG it as the first run, do not be surprised by it.
```

**First-run acceptance (G0 criterion 3 — a POSITIVE observable):** on the first healthy run read `journalctl -u
monark-sentinel -n 40 --no-pager` and CHECK the end JSON shows **`chainstack: true`** (the env → pool → line leg
is wired — the point of this lot) AND **`exit_code: 0`**; a `chainstack: false` or a non-zero exit on the first
healthy run is a STOP-and-investigate. Then record the FIRST run of **each** of the four slots
(00:30 / 03:30 / 06:30 / 09:30 UTC) in `docs/JOURNAL-PROVENANCE.md` — its end JSON (`processedDays`,
`chainstack`, `exit_code`) — four entries, the wiring proof for ADR-NARABI-OPS-1's `env → rpc.ts pool` and
`timer → run → timeline` pipes (decision 46).

## Déploiement de la sonde (Bell) — sub-lot NARABI-OPS-1b-ii

The external probe + mail alert ship as a single built-ins-only `scripts/probe-narabi.mjs` under
`/opt/monark-probe`, driven by `deploy/monark-probe.{service,timer}`, on the **Bell VPS** (a host distinct from the
sentinel, decision 57). Deploy ONLY after BOTH -1b-ii-a and -1b-ii-b have passed their gates, by the named G7 merge
SHA (decision 72) — never a moving HEAD, never a lot worktree branch.

**1. The SMTP secret is posted by the INVESTOR, out of band, via ssh STDIN** (never a command-line arg, never a
git-tracked file, never `set -x`). `/etc/monark/probe.env` is `0600 root:root`, read by PID 1; the unit's
`EnvironmentFile=/etc/monark/probe.env` has NO leading `-`, so a missing file fails the start LOUDLY (the alert
probe MUST have its config). It carries `SMTP_HOST`, `SMTP_PORT=465`, `SMTP_TLS=implicit`, `SMTP_USER`,
`SMTP_PASS`, `ALERT_FROM`, `ALERT_TO` (plus any `PROBE_URL` override).

```bash
# BY THE INVESTOR, from a shell where the secret already lives. QUOTE SMTP_PASS: systemd's EnvironmentFile parser
# mangles an UNQUOTED value containing " \ # or spaces. This template backslash-escapes any " or \ inside the
# password FIRST, then wraps it in double quotes. On a 535 (auth failed) at the first real mail, verify the QUOTING
# first (a mangled password is the likeliest cause).
PW_ESC=$(printf '%s' "$SMTP_PASS" | sed 's/[\\"]/\\&/g')   # escape backslash and double-quote before wrapping
printf 'SMTP_HOST=%s\nSMTP_PORT=465\nSMTP_TLS=implicit\nSMTP_USER=%s\nSMTP_PASS="%s"\nALERT_FROM=%s\nALERT_TO=%s\n' \
  "$SMTP_HOST" "$SMTP_USER" "$PW_ESC" "$ALERT_FROM" "$ALERT_TO" \
  | ssh -i ~/.ssh/monark_vps root@<bell> \
      'umask 077; install -d -m 0755 /etc/monark; cat > /etc/monark/probe.env; chown root:root /etc/monark/probe.env; chmod 0600 /etc/monark/probe.env'
# Verify by DIGEST on both sides (never print the contents); the two hashes MUST match:
#   printf 'SMTP_HOST=%s
SMTP_PORT=465
SMTP_TLS=implicit
SMTP_USER=%s
SMTP_PASS="%s"
ALERT_FROM=%s
ALERT_TO=%s
' \n#     "$SMTP_HOST" "$SMTP_USER" "$PW_ESC" "$ALERT_FROM" "$ALERT_TO" | sha256sum   # local (same printf as above; read the password with `read -rs SMTP_PASS` so it never enters the shell history)
#   ssh ... 'sha256sum /etc/monark/probe.env'                           # remote
```

**2. Simulate ONE shot as the `probe` user WITHOUT touching production.** Never `source` the env file in an agent
shell (that leaks the secret into the shell's env); never point `--out` at the production `narabi.json`. Use
`systemd-run` so the SAME `EnvironmentFile` is applied by systemd (not the shell), writing a THROWAWAY state file:

```bash
# A transient, isolated run as `probe`, reading the REAL env file via systemd, writing a scratch narabi.json. A
# future --now forces the unhealthy path so the alert actually fires (this send IS the first real mail; see below).
ssh -i ~/.ssh/monark_vps root@<bell> \
  'systemd-run --uid=probe --pipe --wait -p EnvironmentFile=/etc/monark/probe.env \
     /usr/bin/env node /opt/monark-probe/probe-narabi.mjs --now "$(date -u -d '+2 days' +%Y-%m-%dT12:00:00Z)" --out /tmp/probe-sim.json; \
   echo "exit=$?"; cat /tmp/probe-sim.json; rm -f /tmp/probe-sim.json'
# Expect alert_error: null on a delivered mail, OR a CLOSED-set code (smtp_unconfigured | smtp_unreachable |
# smtp_timeout | smtp_tls_failed | smtp_auth_failed | smtp_rejected) — NEVER a raw server line, NEVER SMTP_PASS.
# NEVER `source /etc/monark/probe.env`; NEVER `--out /var/lib/monark-probe/narabi.json` (that is production).
```

**3. Verify the real transport once** — the handshake is real TLS 1.2+ on 465, and a wrong hostname is refused
(cert verification is pinned `rejectUnauthorized:true`, not overridable by env, so a name mismatch is
`smtp_tls_failed`, never a plaintext fallback):

```bash
ssh -i ~/.ssh/monark_vps root@<bell> \
  'openssl s_client -connect "$SMTP_HOST":465 -servername "$SMTP_HOST" -brief </dev/null'   # expect a TLS 220 banner
# A wrong SMTP_HOST in probe.env must fail the send as smtp_tls_failed (cert name mismatch), never speak plaintext.
```

**First real mail = the `upcoming → built` trigger (decision 58).** Record it in `docs/JOURNAL-PROVENANCE.md`
(date, ALERT_TO domain, `alert_error: null`); that entry flips the `probe → alerte` pipe from `upcoming` to
`built`. Until then the pipe stays `upcoming` in every public register.

## Operations

- Logs: `journalctl -u monark-sentinel -f`
- Manual catch-up (never skips): `systemctl start monark-sentinel.service` (processes every complete day in order).
- Verify publication: `curl -s https://monarkgate.tech/narabi/state.json | head -c 300`; anyone can replay it
  via the committed `trackerReplay` over the `s` column of `timeline.jsonl`.
- Exit code (ADR-NARABI-OPS-1 L-1): a run exits **1** iff it was STOPPED before catching up (`stopped != null`
  in the end JSON — a fetch/quorum/c1/unfinalized failure); **0** when up to date or waiting for finality. A
  later retry slot the same day re-runs it; `journalctl -u monark-sentinel` shows the non-zero exit plus the
  `stopped` / `exit_code` / `chainstack` fields. The manual relaunch of 2026-09-20 is now automatic within the day.

## Sonde externe — pli NARABI-OPS-1b

The external probe (reads the published `/narabi/timeline.jsonl` from the **Bell VPS**, a distinct host, and
exits 1 if the last line is older than J-1) is **deferred to pli NARABI-OPS-1b** (R-25 budget, C-11). Its full
spec is in `docs/adr/ADR-NARABI-OPS-1.md` (§Deferral of L-5). Until then, monitor by hand: `curl -s
https://monarkgate.tech/narabi/timeline.jsonl | tail -1` — the last `day` should be yesterday (UTC) after 10:00.
