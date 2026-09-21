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
the usual SSH channel (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`), archiving from the **named G7 merge SHA** of the integration branch (`git archive <sha>` — the SHA is the one
recorded in `docs/JOURNAL-PROVENANCE.md` for the lot; amended 2026-09-21, investor decision 72 « par SHA ») —
never from a moving `HEAD`, never from a lot worktree branch. After the deploy, `sha256sum` of the shipped units is
compared with the archive's.

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
# (8) Start backstop verification (sub-lot NARABI-OPS-1b-ii-b, E-5 / investor decision 92): the shipped unit now
#     carries TimeoutStartSec=300. Confirm it took effect (systemd prints microseconds, normalized):
systemctl show -p TimeoutStartUSec monark-sentinel.service   # expect TimeoutStartUSec=5min (= 300 s)
```

### Start backstop `TimeoutStartSec` (sub-lot NARABI-OPS-1b-ii-b — VPS SITE, E-5 / investor decision 92)

`monark-sentinel.service` gains `TimeoutStartSec = max(300, ceil(3*D/60)*60) = 300 s`, where D = 25.481 s is the
MEASURED publishing run (start 00:47:55 UTC, exit 00:48:20 UTC, 2026-09-21; `RUN_DURATION_D_SEC=26` rounded up;
JOURNAL-PROVENANCE.md:310, merge `9b178f3`). This is a redeploy on the **VPS SITE** (`31.97.155.188`) — the
service of production — so it is done ONLY under E-5 (decision 92), after G7 + checkpoint-2 of -1b-ii-b, by the
named merge SHA (§6 above, never `main HEAD`), then verified with the `systemctl show` line in step (8).

**Declared risk — a systemd kill mid-append on an append-only chained file.** If the start backstop ever fires
while `run.ts` is writing (`:188` `appendFileSync` of the timeline, `:189` `state.json`, `:190`/`:191` the
public copies), the private `timeline.jsonl` last line could be TORN. What bounds it, MEASURED on the code (not
assumed):

- **D (25 s) is far below T_s (300 s)**, and the four byte-writes at `:188`-`:191` take milliseconds, so a kill
  can only land far past a normal run and the probability of landing inside the ~ms append window is negligible.
- **A torn last line fails CLOSED, and is never served.** `loadState` (`run.ts:104-119`) does NOT read
  `state.json` back — it RECOMPUTES the tracker state by folding EVERY timeline line through `step` (a
  `JSON.parse` per line). A torn last line makes that `JSON.parse` throw, which bubbles to the run guard
  (`run.ts:201`, `sentinel FATAL`, exit 1): the next run appends NOTHING after a torn line and publishes
  nothing. The public copies happen only AFTER the append + state write (`:190`/`:191`), so a mid-append kill
  leaves the SERVED surface at the last good state — never a torn line on the wire. The probe then observes
  `lag` (a due day missing) and (with -1b-ii-a deployed) alerts. `state.json` is a DERIVED artifact, so a stale
  or missing one self-heals on the next successful run (recomputed from the timeline).
- **Recovery**: on a `sentinel FATAL` after a suspected kill, inspect the tail of
  `/var/lib/monark-sentinel/timeline.jsonl`; a torn last line is removed by hand (it was never finalized), then
  `systemctl start monark-sentinel.service` re-runs and catches up. This is an operational, fail-closed,
  DETECTABLE condition, not a silent corruption.

**First-run acceptance (G0 criterion 3 — a POSITIVE observable):** on the first healthy run read `journalctl -u
monark-sentinel -n 40 --no-pager` and CHECK the end JSON shows **`chainstack: true`** (the env → pool → line leg
is wired — the point of this lot) AND **`exit_code: 0`**; a `chainstack: false` or a non-zero exit on the first
healthy run is a STOP-and-investigate. Then record the FIRST run of **each** of the four slots
(00:30 / 03:30 / 06:30 / 09:30 UTC) in `docs/JOURNAL-PROVENANCE.md` — its end JSON (`processedDays`,
`chainstack`, `exit_code`) — four entries, the wiring proof for ADR-NARABI-OPS-1's `env → rpc.ts pool` and
`timer → run → timeline` pipes (decision 46).

## Operations

- Logs: `journalctl -u monark-sentinel -f`
- Manual catch-up (never skips): `systemctl start monark-sentinel.service` (processes every complete day in order).
- Verify publication: `curl -s https://monarkgate.tech/narabi/state.json | head -c 300`; anyone can replay it
  via the committed `trackerReplay` over the `s` column of `timeline.jsonl`.
- Exit code (ADR-NARABI-OPS-1 L-1): a run exits **1** iff it was STOPPED before catching up (`stopped != null`
  in the end JSON — a fetch/quorum/c1/unfinalized failure); **0** when up to date or waiting for finality. A
  later retry slot the same day re-runs it; `journalctl -u monark-sentinel` shows the non-zero exit plus the
  `stopped` / `exit_code` / `chainstack` fields. The manual relaunch of 2026-09-20 is now automatic within the day.

## Sonde externe — NARABI-OPS-1b

The external probe (`scripts/probe-narabi.mjs`, units `deploy/monark-probe.{service,timer}`) reads the published
`/narabi/timeline.jsonl` from the **Bell VPS** (a distinct host), recomputes the whole hash chain, checks that the
last line is not older than J-1 at the 10:30 UTC deadline, and writes `narabi.json` (exit 1 iff unhealthy).
**State (sub-lot -1b-i, merged): code + non-LLM tests; NOT deployed.** Alerting (mail) and the daily reminder are
sub-lot **-1b-ii**; the probe is deployed on Bell only after -1b-ii-a AND -1b-ii-b have passed their gates
(investor decision 72), by SHA. Deadline basis: measured publishing run of 2026-09-21 (start 00:47:55 UTC, exit
00:48:20 UTC, 25.481 s wall clock, `chainstack: true`, 1 line written, T=3) => D <= 600 s, so 10:30 UTC is kept.
**Residual, declared: a dead probe is silent** (no dead-man switch yet — formed item, trigger: G0 T-1b). Until the
probe is deployed, monitor by hand: `curl -s https://monarkgate.tech/narabi/timeline.jsonl | tail -1` — the last
`day` should be yesterday (UTC) after 10:00.
