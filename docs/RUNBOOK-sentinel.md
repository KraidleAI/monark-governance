# RUNBOOK — deploy the MONARK Narabi sentinel (orchestrator-deployed)

The **Narabi sentinel** is a daily `oneshot` job (`apps/sentinel/src/run.ts`) that reads the attested USDe
redemption flow at finality, steps the M009 tracker, and publishes a replayable timeline at
`monarkgate.tech/narabi/`. It is the FIRST outbound-network process on the VPS (public RPC, read-only; optional keyed 8th operator via out-of-repo EnvironmentFile, ADR-NARABI-OPS-1)
and writes ONLY its state dir. This runbook **mirrors `RUNBOOK-harness.md`**; only the deltas are here.

**Who runs this:** the **orchestrator**, over the same SSH channel as the harness/vitrine
(`ssh -i ~/.ssh/monark_vps root@31.97.155.188`). Deploy order (ADR-M012 D5): (a) harness redeploy from HEAD;
(b) sentinel; (c) **J0 = the first published window** (non_evaluable, no predecessor); the first tracker step
is J0+1; T counts live steps.

**Committed files this runbook installs:**
- `deploy/monark-sentinel.service` — the `oneshot` unit (`User=sentinel`, `ReadWritePaths=/var/lib/monark-sentinel`).
- `deploy/monark-sentinel.timer` — four same-day retry slots (00:30/03:30/06:30/09:30 UTC) + jitter, `Persistent=true` (ADR-NARABI-OPS-1 L-2).
- `deploy/Caddyfile.monark-narabi.snippet` — the `handle_path /narabi/*` block to INSERT in the vitrine block.
- `/etc/monark/sentinel.env` — NOT committed: the optional `CHAINSTACK_ETH_URL` (a distinct paid operator, ADR-NARABI-OPS-1 L-3). Posted by the orchestrator in step 4; absent, the run falls back to the 7 public endpoints and stays fail-closed. Since NARABI-OPS-1d the same file also carries the non-secret CHAINSTACK_CYCLE_ID / CHAINSTACK_ETH_ORIGIN / CHAINSTACK_CYCLE_FLOOR (§6-bis step 4).

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
#   (NARABI-OPS-1d) Once the -1d code is deployed (§6-bis) this file carries FOUR keys: post them TOGETHER with §6-bis step (4) — a URL-only `cat >` ERASES the cycle keys => chainstack_guard: "unconfigured".
#   (The investor MAY post /etc/monark/sentinel.env themselves instead; this runbook accepts it identically.)
#   Skipping this step is legal (the '-' on EnvironmentFile): the run falls back to the 7 public endpoints,
#   fail-closed, and `chainstack:false` appears in the run's end JSON.
#   (NARABI-OPS-1d) Once the -1d code is deployed (§6-bis) this file carries FOUR keys: post them TOGETHER with §6-bis step (4) — a URL-only `cat >` ERASES the cycle keys => chainstack_guard: "unconfigured".
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
#     (`git archive <named G7 SHA, decision 72 — never a moving HEAD> … apps packages … | ssh … tar xzf -`) — it now carries the updated apps/sentinel/.
npm ci                                        # refresh @monark/* workspace symlinks incl. @monark/sentinel
test -f apps/sentinel/src/run.ts || echo "STOP: sentinel not shipped — re-archive apps/ from the named G7 SHA"
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
#   (NARABI-OPS-1d) Once the -1d code is deployed (§6-bis) this file carries FOUR keys: post them TOGETHER with §6-bis step (4) — a URL-only `cat >` ERASES the cycle keys => chainstack_guard: "unconfigured".
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
JOURNAL-PROVENANCE.md, the `mesure D = 25,481 s` line, merge `9b178f3`). **The formula was pre-registered on a D
measured on a run that processed exactly ONE due day** (T=3, ~4 timeline lines) — this matters for Mode A below.
This is a redeploy on the **VPS SITE** (`31.97.155.188`) — the service of production — so it is done ONLY under
E-5 (decision 92), after G7 + checkpoint-2 of -1b-ii-b, by the named merge SHA (§6 above, never `main HEAD`),
then verified with the `systemctl show` line in step (8).

**A start-timeout kill has TWO distinct failure modes. Both are DETECTABLE (the probe sees `lag` and, with
-1b-ii-a deployed, mails) but they need DIFFERENT repairs. Tell them apart at the journal FIRST:**

| At `journalctl -u monark-sentinel` | Mode | `tail -1 timeline.jsonl` | Repair |
|---|---|---|---|
| systemd `start operation timed out`, unit `failed`, **NO** `wrote N line(s)`, **NO** `sentinel FATAL`; RECURS every slot with **NO new end-JSON** (the run is killed inside `runDue` and never reaches the end-JSON `run.ts:180`, so `processedDays` is never printed at all — an ABSENT observable, not a seen-but-unchanging one) | **A. Catch-up livelock** (kill during the multi-day RPC loop) | PARSES as JSON (no torn line) **and its `day` never advances slot after slot** | raise the timeout for ONE supervised run (A) |
| `sentinel FATAL` + a `SyntaxError`/`JSON.parse` error at **EVERY** subsequent run, exit 1, nothing published | **B. Torn last line** (kill inside the ~ms append) | does **NOT** parse (partial JSON, no trailing newline) | remove the torn line (B) |

#### Mode A — the catch-up livelock (a slow run turned into a PERMANENT outage)

> **Status since sub-lot NARABI-OPS-1c (dated 2026-09-21): Mode A is REDUCED, not lifted.** `runDue` now checks a
> per-run TIME budget BETWEEN due days (default 180 s; first due day always attempted) and stops cleanly with
> `stopped:"catchup_budget"`, exit 1, and the lines already produced WRITTEN, so a multi-day backlog on a healthy
> pool PROGRESSES at every slot instead of being killed at the same point. **New normal symptom during a
> catch-up:** `stopped:"catchup_budget"` + exit 1 + `wrote N line(s)` at each slot = progress, NOT an outage; the
> external probe still reports `lag` and mails once, then one reminder per UTC day, until caught up (intended).
> **Repair A.1 below is KEPT** for the three residual cases: (A-prime) a SINGLE day longer than `T_s` (slow pool
> without a fault, or a late `fetch_error`: `one()` may rotate 8 endpoints x 20 s); (ii) a slow day exceeding the
> 120 s margin AFTER the budget stop (that run's lines are lost, same list next slot); (iii) the PREAMBLE —
> `loadState` + the `finalized()` quorum run BEFORE the budget clock starts (`t0` is taken inside `runDue`), so
> they are counted neither in the budget nor in `elapsed_ms`, and `180 + 120 = 300` leaves them no slack.
> **Tuning:** `MONARK_SENTINEL_BUDGET_S` = integer 30..180 (anything else throws at start-up), set in a drop-in
> with a DISTINCT filename (never `override.conf`, which holds `MONARK_SENTINEL_J0`). The production unit does
> NOT set it (default 180). **Pre-registered criteria of NO (ADR-NARABI-OPS-1, -1c amendment):** a production run
> with `max_day_ms > 60000`, OR systemd wall-clock duration minus `elapsed_ms` > 30000 ms, triggers a dated
> amendment re-deriving the default budget (an amendment, not a rollback).

`run.ts` processes EVERY due day (`dueDays` `:167`) inside ONE RPC-heavy loop (`runDue` `:75`-`:92`) and appends
the whole batch ONLY after the loop, in one write (`:182`-`:191`) — there is **no per-day checkpoint**. So a
`TimeoutStartSec` kill DURING the loop writes NOTHING (not even a torn line): `timeline.jsonl` is untouched, the
resume point is unchanged, and the NEXT run recomputes the SAME due list (`:167`) and is killed at the same
point. **While the catch-up itself takes longer than `T_s`, every slot re-attempts the same doomed run and the
sentinel never publishes** — the four daily slots + `Persistent=true` all retry it; there is deliberately no
`Restart=`. This mode is more probable than Mode B (it needs only a run > `T_s`, not a kill in the ~ms append).

*Threshold (measured on the code + the D anchor; a LOWER bound).* The cost per run is dominated by the RPC
(`fetchWindow` per day); the fixed overhead is negligible (node startup + module load measured at ~0.15 s
offline; `loadState`'s fold is milliseconds). With D = 25.481 s for a ONE-day run, a linear model gives
`N_days x D > T_s = 300 s` at `N >= ceil(300 / 25.481) = 12` days. This is a **lower bound**: `run.ts:72` resets
the window search lower bound to `DEPLOY_BLOCK` on EVERY run and only tightens it WITHIN a run, so D already
carries the widest block search and later days in a catch-up search a narrower range — the true per-day cost
falls, so the real threshold is **>= ~12 days of backlog**. Not "never", not "always": it takes about a dozen
days of sentinel downtime (VPS or RPC pool down) with a pending backlog.

*Repair A.1 — raise the start timeout for ONE supervised catch-up (preferred).* Use a drop-in with a DISTINCT
filename — **never `override.conf`**, which holds `MONARK_SENTINEL_J0` (§4); overwriting it would trip the D5
fail-closed on a future fresh start:

```bash
mkdir -p /etc/systemd/system/monark-sentinel.service.d
# `infinity` disables the start-timeout for this ONE supervised run (systemd.service(5), TimeoutStartSec=:
# "Pass infinity to disable the timeout logic" — [2nd], man page; confirmed at deploy by the show line below).
printf '[Service]\nTimeoutStartSec=infinity\n' > /etc/systemd/system/monark-sentinel.service.d/catchup.conf
systemctl daemon-reload
systemctl show -p TimeoutStartUSec monark-sentinel.service   # confirm it took: expect TimeoutStartUSec=infinity
systemctl start --no-block monark-sentinel.service # --no-block: a Type=oneshot start (no RemainAfterExit, unit :15)
                                                   # otherwise BLOCKS the shell until the run EXITS, so a following
                                                   # -f would only attach to an ALREADY-finished run. --no-block
                                                   # returns at once, so the -f below follows the run LIVE.
journalctl -u monark-sentinel -f                   # follow it LIVE; wait for "wrote N line(s); T=...", then Ctrl-C
# THEN restore the backstop — a FORGOTTEN drop-in silently DEFEATS T_s, and the committed inter-unit test
# (probe_sentinel_timeoutstartsec_inter_unit_coherence) canNOT see a deployed drop-in:
rm /etc/systemd/system/monark-sentinel.service.d/catchup.conf
systemctl daemon-reload
systemctl show -p TimeoutStartUSec monark-sentinel.service   # MUST print 5min (= 300 s) again
```

*Repair A.2 — catch up ONE day at a time (if raising the timeout is not an option).* A non-dry `--day` must be
EXACTLY the next day after the last published one (`run.ts:165`: `--day === nextDay(prevDay)`, else it throws;
`prevDay` = the `day` of the last line of `timeline.jsonl`). Each run pays ~D and re-starts its block search
from `DEPLOY_BLOCK` (`:72`), so budget ~D per day and repeat, advancing the date each time:

```bash
# PRECONDITION: the last timeline line must PARSE. If the journal shows Mode B (a torn last line), do Mode B
# FIRST — A.2 reads the last line's `day` as the resume point; a torn last line makes LAST empty and `--day`
# garbage (run.ts:165 then rejects it, fail-closed, but check first).
LAST=$(tail -1 /var/lib/monark-sentinel/timeline.jsonl | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).day))')
NEXT=$(node -e 'const d=new Date(process.argv[1]+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+1);process.stdout.write(d.toISOString().slice(0,10))' "$LAST")
# Load the EnvironmentFile to KEEP the optional Chainstack key (the RUNBOOK-harness `sudo -u sentinel ... node`
# form does NOT load it -> chainstack:false, the 7 public endpoints, still fail-closed and correct):
systemd-run --uid=sentinel --pipe --wait \
  -p EnvironmentFile=/etc/monark/sentinel.env \
  -p Environment=MONARK_SENTINEL_DIR=/var/lib/monark-sentinel \
  /usr/bin/env node /opt/monark-harness/apps/sentinel/src/run.ts --day "$NEXT"
# Repeat until `tail -1` shows yesterday (UTC). NOTE: a manual run at an arbitrary hour can overlap a probe
# shot (10:30/12:30/16:30 UTC) and produce ONE transient state_mismatch mail that self-heals next shot (C-NB-4).
```

#### Mode B — a torn last line (kill inside the ~ms append)

If the kill lands inside `run.ts:188` `appendFileSync` (the timeline write), the private `timeline.jsonl` last
line can be TORN (partial JSON, no trailing newline). What bounds it, MEASURED on the code:

- **D (25 s) << T_s (300 s)** and the four byte-writes `:188`-`:191` take milliseconds, so a kill lands inside
  the append window with negligible probability — far rarer than Mode A, which needs only a run > `T_s`.
- **A torn line is NEVER served — proven by the write ORDER.** The public copies are `copyFileSync` at `:190`
  (timeline) and `:191` (`state.json`), AFTER the private append `:188` and the private `state.json` write
  `:189`. A kill DURING `:188` means `:189`/`:190`/`:191` never ran, so the private `state.json` and BOTH public
  copies are all still at the last good state (three-way consistent) — the torn line lives ONLY in the private
  `timeline.jsonl`, never on the wire.
- **It fails CLOSED and self-announces.** `loadState` (`:104`-`:120`) recomputes the tracker by folding EVERY
  line through `step`, `JSON.parse` per line (`:111`) with NO try/catch. The torn line throws, bubbling to the
  run guard (`:201`, `sentinel FATAL`, exit 1). **Precision (C-G2-2): EVERY subsequent run FATALs in `loadState`
  (`:111`) on the torn line UNTIL it is removed** — not merely "the next run". The probe sees `lag` and alerts.
- **`state.json` is DERIVED** (recomputed from the timeline), so a stale/missing one **self-heals on the next
  run THAT WRITES A LINE** (C-G2-2): a `nothing due` exit-0 run does NOT refresh the public copies (`:182`
  guards them on `report.lines.length > 0`), so a run must actually process a due day to republish.

*Repair B.* Back up first, then remove ONLY the torn trailing line and verify the chain re-folds BEFORE
relaunching:

```bash
cp /var/lib/monark-sentinel/timeline.jsonl /var/lib/monark-sentinel/timeline.jsonl.bak.$(date +%s)
# (1) Confirm the last line is TORN (does not parse). If it PARSES, this is Mode A, not B — do not remove it.
tail -1 /var/lib/monark-sentinel/timeline.jsonl | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{JSON.parse(s.replace(/\n$/,""));console.log("PARSES — not torn (see Mode A)")}catch{console.log("TORN — remove it (step 2)")}})'
# (2) Remove the torn trailing line = truncate to the last newline (a torn line has no trailing newline, so this
#     drops exactly it and keeps every complete line):
node -e 'const fs=require("node:fs"),p="/var/lib/monark-sentinel/timeline.jsonl",s=fs.readFileSync(p,"utf8"),i=s.lastIndexOf("\n");fs.writeFileSync(p,i>=0?s.slice(0,i+1):"")'
# (3) Verify: --dry-run runs loadState FIRST (run.ts:162, network-free, BEFORE any RPC :166 and the dry-run
#     branch :181) and writes NOTHING. Read the outcome — TWO exit-1 cases, do NOT conflate them:
#       * `sentinel FATAL` with a SyntaxError/JSON.parse error = loadState still hits a bad line (:111/:201):
#         repeat step 2, or restore the .bak;
#       * a clean end-JSON, OR exit 1 with `stopped: fetch_error:...`/`quorum_...` (or a network/RPC error) =
#         loadState PASSED, the CHAIN IS FINE; that exit-1 is the RPC/network being down (the outage itself —
#         see test (e) of apps/sentinel/test/sentinel-retry.test.ts), NOT a torn line: do not repeat step 2.
sudo -u sentinel MONARK_SENTINEL_DIR=/var/lib/monark-sentinel node /opt/monark-harness/apps/sentinel/src/run.ts --dry-run
# (4) Relaunch and catch up:
systemctl start monark-sentinel.service
journalctl -u monark-sentinel -n 20 --no-pager     # expect "wrote N line(s); T=..."
```

A kill that lands BETWEEN `:188` and `:191` (a COMPLETE append, but a stale private/public `state.json`) needs
NO action: the last timeline line parses, `loadState` succeeds, and the next run THAT WRITES A LINE refreshes the
copies — the precise C-G2-2 "self-heals on the next run that writes a line".

Both modes are operational, fail-closed, DETECTABLE conditions — never a silent corruption or a served lie.

**First-run acceptance (G0 criterion 3 — a POSITIVE observable):** on the first healthy run read `journalctl -u
monark-sentinel -n 40 --no-pager` and CHECK the end JSON shows **`chainstack: true`** (the env → pool → line leg
is wired — the point of this lot) AND **`exit_code: 0`**; a `chainstack: false` or a non-zero exit on the first
healthy run is a STOP-and-investigate. Then record the FIRST run of **each** of the four slots
(00:30 / 03:30 / 06:30 / 09:30 UTC) in `docs/JOURNAL-PROVENANCE.md` — its end JSON (`processedDays`,
`chainstack`, `exit_code`) — four entries, the wiring proof for ADR-NARABI-OPS-1's `env → rpc.ts pool` and
`timer → run → timeline` pipes (decision 46).

## 6-bis. Second redéploiement (lot NARABI-OPS-1d, décision 118) — jambe Chainstack gardée, sur le timer VIVANT

Pré-enregistré au G7 de NARABI-OPS-1d (2026-09-22) ; implémente le G1 §13 et la correction C-5 du checkpoint-1 de -1d ; calque de l'E-5 (`docs/JOURNAL-PROVENANCE.md:353-357`) et du §6. **Ne pas exécuter avant P-1..P-4.** Tout se fait depuis le poste de l'orchestrateur, canal SSH habituel (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`).

### Préconditions (toutes vraies, sinon STOP)
- **P-1** — Le pli §11-1 est fusionné (ADR-NARABI-OPS-1, amendement -1d, A.8-1) avec G2-delta PASS, re-checkpoint-2 ACCEPTE et G7 ; son **SHA de fusion NOMMÉ** est consigné dans `docs/JOURNAL-PROVENANCE.md` AVANT l'archive (décision 72). Jamais le SHA de fusion de -1d seul : UN seul second redéploiement (décision 118 ; option (b), C-V-0). Go permanent : décision 137 (`docs/CHANTIERS.md:858`, « 2e redeploiement VPS sentinelle (apres pli §11-1) ») — aucun go supplémentaire à demander.
- **P-2** — Clôture du temps 1 et de la course U-4b-1b (G1 -1d §4 ; décision 118).
- **P-3** — Valeurs lues, jamais devinées : `<CYCLE>` = le `cycle_id` Chainstack du compte pour la période de facturation courante, le MÊME que le `--cycle` des courses Ukemi (ruling 2026-09-22 04:3x UTC, option 1) ; `<FLOOR>` = total RU du COMPTE (somme des réseaux) lu SUR PLACE à la console Chainstack le jour même, entier sans séparateur (`run.ts:256` refuse tout autre format ⇒ `config_error`) et ≤ 16 000 000.
- **P-4** — Hors créneau : `systemctl is-active monark-sentinel.service` affiche `inactive`, et l'heure n'est dans aucune fenêtre [créneau ; créneau + 35 min] (00:30 / 03:30 / 06:30 / 09:30 UTC, `RandomizedDelaySec=1800`, `TimeoutStartSec=300`).

### Étapes
```bash
# (1) Hachés attendus — poste de l'orchestrateur, AVANT l'archive (calque E-5 : calculés depuis l'archive elle-même).
SHA=<SHA de fusion NOMMÉ du pli 11-1>
T=$(mktemp -d)
git archive --format=tar "$SHA" apps packages deploy | tar -x -C "$T"
( cd "$T" && sha256sum apps/sentinel/src/*.ts packages/rpc-guard/src/*.ts packages/rpc-guard/bin/rpc-guard.mjs \
    deploy/monark-sentinel.service deploy/monark-sentinel.timer ) > expected-nops1d.sha256
#     consigner le SHA et expected-nops1d.sha256 dans docs/JOURNAL-PROVENANCE.md.

# (2) Sauvegarde de rollback — VPS, AVANT toute écriture (calque E-5 /root/rollback-e5-20260921/).
B=/root/rollback-nops1d-$(date -u +%Y%m%d); install -d -m 0700 "$B"
tar czf "$B/monark-harness-tree.tgz" --exclude=monark-harness/node_modules -C /opt monark-harness
cp /etc/systemd/system/monark-sentinel.service /etc/systemd/system/monark-sentinel.timer "$B/"
cp -a /etc/systemd/system/monark-sentinel.service.d "$B/"
cp /var/lib/monark-sentinel/timeline.jsonl /var/lib/monark-sentinel/state.json "$B/"
cp -a /opt/monark-harness/node_modules "$B/node_modules.pre-nops1d"
sha256sum "$B/monark-harness-tree.tgz" "$B/timeline.jsonl" "$B/state.json"      # à consigner
#     /etc/monark/sentinel.env N'ENTRE PAS dans la sauvegarde (secret).
#     Relever le 8e endpoint publié par l'ancien code (une origine, non secrète) :
tail -1 /var/lib/monark-sentinel/timeline.jsonl | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const e=JSON.parse(s).endpoints;console.log(e.length, e[7] ?? "(pas de 8e endpoint)")})'

# (3) Parent du ledger — AVANT tout run ou dry-run gardé (C-8 : jamais auto-créé).
install -d -o sentinel -g sentinel -m 0750 /var/lib/monark-sentinel/ledger
stat -c '%a %U:%G' /var/lib/monark-sentinel/ledger        # attendu : 750 sentinel:sentinel
#     sous ReadWritePaths=/var/lib/monark-sentinel (unité inchangée) ; hors public/ (Caddy ne sert que .../public).
```
- **(4) EnvironmentFile : le secret et les trois clés NON secrètes en UNE écriture.** Les `cat >` des §4 et §6 (5) RÉÉCRIVENT le fichier : poster l'URL seule EFFACERAIT les clés de cycle (⇒ `chainstack_guard: "unconfigured"`, jambe noire, publication keyless). Depuis le shell LOCAL de l'orchestrateur (où vit `$CHAINSTACK_ETH_URL`, décision 43), par ssh STDIN ; jamais `cat` du fichier distant, jamais `set -x` :
```bash
ORIGIN=$(node -e 'process.stdout.write(new URL(process.env.CHAINSTACK_ETH_URL).origin)')   # schéma + hôte (= rpc.ts:redactEndpoint), jamais le chemin porteur de clé
printf '%s\n' "$ORIGIN"      # SEULE valeur affichée (non secrète) ; doit égaler le 8e endpoint relevé en (2)
printf 'CHAINSTACK_ETH_URL=%s\nCHAINSTACK_CYCLE_ID=%s\nCHAINSTACK_ETH_ORIGIN=%s\nCHAINSTACK_CYCLE_FLOOR=%s\n' \
  "$CHAINSTACK_ETH_URL" "<CYCLE>" "$ORIGIN" "<FLOOR>" \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 \
      'umask 077; install -d -m 0750 -o root -g sentinel /etc/monark; cat > /etc/monark/sentinel.env; chown root:sentinel /etc/monark/sentinel.env; chmod 0640 /etc/monark/sentinel.env'
# Empreintes des DEUX côtés (même printf localement) — les deux hachés DOIVENT être identiques :
printf 'CHAINSTACK_ETH_URL=%s\nCHAINSTACK_CYCLE_ID=%s\nCHAINSTACK_ETH_ORIGIN=%s\nCHAINSTACK_CYCLE_FLOOR=%s\n' "$CHAINSTACK_ETH_URL" "<CYCLE>" "$ORIGIN" "<FLOOR>" | sha256sum
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'sha256sum /etc/monark/sentinel.env'
```
- **(5) Expédition, `npm ci`, contrôle des hachés, unités** (calque §6 (1)-(3), (6), (8)) :
```bash
git archive --format=tar.gz "$SHA" apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'cat > /root/expected-nops1d.sha256' < expected-nops1d.sha256
# sur le VPS :
cd /opt/monark-harness && npm ci && chown -R monark:monark .
sha256sum -c /root/expected-nops1d.sha256            # TOUT « OK », sinon STOP (ré-expédier)
cp deploy/monark-sentinel.service deploy/monark-sentinel.timer /etc/systemd/system/
grep '^OnCalendar=' /etc/systemd/system/monark-sentinel.timer | cut -d= -f2- | \
  while read -r e; do systemd-analyze calendar "$e" || echo "STOP: invalid OnCalendar '$e'"; done
systemctl daemon-reload
systemctl show -p TimeoutStartUSec monark-sentinel.service    # attendu TimeoutStartUSec=5min
systemctl show -p EnvironmentFiles monark-sentinel.service    # attendu -/etc/monark/sentinel.env
sudo -u sentinel node -e 'import("@monark/rpc-guard").then(m => console.log(typeof m.openGuardedClient, typeof m.runCli))'   # depuis /opt/monark-harness ; attendu : function function
#     NE PAS redéposer le drop-in J0 (état non vide, j0Source: state). monark-harness NON redémarré (calque E-5) — consigner.
```
- **(6) Dry-run GARDÉ** (en `sentinel`, EnvironmentFile chargé par systemd ; le secret ne touche aucun shell) :
```bash
systemd-run --uid=sentinel --pipe --wait \
  -p EnvironmentFile=/etc/monark/sentinel.env \
  -p Environment=MONARK_SENTINEL_DIR=/var/lib/monark-sentinel \
  /usr/bin/env node /opt/monark-harness/apps/sentinel/src/run.ts --dry-run
ls /var/lib/monark-sentinel/ledger/<CYCLE>/                       # chainstack.jsonl + chainstack.head, AUCUN chainstack.lock
tail -1 /var/lib/monark-sentinel/ledger/<CYCLE>/chainstack.jsonl   # "outcome":"unlocked" … "reason":"sentinel-daily-end"
```
  Depuis -1d le dry-run OUVRE la jambe (`run.ts:319`, avant tout test de `--dry-run`) : il prend et relâche le verrou et écrit de VRAIES lignes de ledger (une ligne `unlocked` ; des lignes `attempted`, facturées, s'il y a un jour dû), sans rien écrire dans `timeline.jsonl`/`state.json`. La forme `sudo -u sentinel … --dry-run` du §3 ne charge PAS l'EnvironmentFile : elle rend `unconfigured` et ne teste que le pool keyless. **Attendu** (JSON de fin) : `chainstack: true`, `chainstack_guard: "ok"`, `exit_code: 0`, `dryRun: true`, « --dry-run: nothing written. ». **STOP** (corriger puis rejouer ; sinon rollback) selon `chainstack_guard` : `unconfigured` ⇒ `CHAINSTACK_CYCLE_ID` ou `CHAINSTACK_ETH_ORIGIN` absent ou vide (étape 4) ; `config_error` ⇒ `<FLOOR>` non entier ou > 16 000 000 ; `ledger_error` ⇒ parent absent ou droits (étape 3) ; `lock_held` ⇒ verrou orphelin (réparation SIGKILL ci-dessous).
- **(7) Armement** : `systemctl restart monark-sentinel.timer` puis `systemctl list-timers monark-sentinel.timer --no-pager`. Sous `Persistent=true` un run peut partir aussitôt (§6 (7)) : le consigner comme premier run.

### Acceptation (critères pré-enregistrés ; `journalctl -u monark-sentinel -n 40 --no-pager`)
- **(a) Tout run post-déploiement**, y compris « nothing due » : `exit_code 0`, `stopped null`, `chainstack true`, **`chainstack_guard "ok"`**, `elapsed_ms`/`max_day_ms` présents (`max_day_ms > 60000` ⇒ amendement -1c) ; unité `Deactivated successfully` ; **aucun `chainstack.lock`** après la désactivation ; dernière ligne du ledger `unlocked` / `sentinel-daily-end`. Un run « nothing due » ne tire en général pas la jambe : 0 ligne `attempted` y est normal (le `finalized()` d'un pool sain prend les deux premiers fournisseurs publics ; `rpc.ts:175-201`, ordre `run.ts:324`).
- **(b) Premier run PUBLIANT** (en général le créneau 00:30 UTC suivant) : la nouvelle ligne de `timeline.jsonl` porte `endpoints` = les 7 URLs publiques dans l'ordre de `rpc.ts:19-24`, puis en 8ᵉ la valeur `ORIGIN` postée à l'étape (4) (égale au 8ᵉ endpoint relevé à l'étape (2)) ; le ledger gagne **≥ 1 ligne `attempted` portant `"network":"ethereum-mainnet"`** (la rotation de `one()`, `rpc.ts:155-170`, atteint l'entrée `chainstack` au plus tard au 6ᵉ `blockTs` d'un pool sain ; un jour publié en fait des dizaines, `windows.ts:50-58`) ; le tir suivant de la sonde Bell rend `healthy`, `chain_ok`, `state_checked: true`, **`chainstack_present: true`**.
- **Consigner** dans `docs/JOURNAL-PROVENANCE.md` l'entrée (a), puis l'entrée (b) : cette dernière fait passer la jambe gardée `upcoming → built` (ADR-NARABI-OPS-1, amendement -1d, A.4), retire le chemin « env → `rpc.ts` pool », et la cartographie cesse de déclarer le résiduel 118.
- **STOP + rollback** : `sentinel FATAL` ; `chainstack_guard` ≠ `ok` non corrigeable ; `.lock` résiduel après `Deactivated` sans SIGKILL ; 8ᵉ endpoint ≠ `ORIGIN`. **STOP et enquête, sans rollback automatique** : run PUBLIANT à 0 ligne `attempted`.

### Rollback (calque E-5)
Ré-expédier le SHA déployé AVANT (dernière entrée de déploiement de `docs/JOURNAL-PROVENANCE.md` ; à la rédaction : `c4981d0`, E-5, l. 353-355) ou restaurer `"$B/monark-harness-tree.tgz"` ; `npm ci` ; recopier les unités sauvegardées ; `systemctl daemon-reload && systemctl restart monark-sentinel.timer` ; contrôler les hachés consignés pour ce SHA (E-5 : `run.ts` `54619a40…`, `.service` `d70f88cc…`, `.timer` `d84a08b5…`). L'EnvironmentFile à 4 clés reste compatible avec l'ancien code (il ne lit que `CHAINSTACK_ETH_URL` ; les clés de cycle sont ignorées) ; `/var/lib/monark-sentinel/ledger/` reste en place (ni lu ni servi par l'ancien code). Un rollback RÉ-OUVRE le résiduel 118 (chemin payant hors garde) : le consigner.

### Réparation après SIGKILL (D-lock iii)
Symptôme : `chainstack_guard: "lock_held"` au JSON de fin (le run publie en keyless, jamais FATAL).
```bash
systemctl is-active monark-sentinel.service           # DOIT être inactive ou failed — jamais activating : ne JAMAIS déverrouiller un run vivant
ls /var/lib/monark-sentinel/ledger/*/chainstack.lock  # exactement UN chemin, sinon STOP
LOCK=$(ls /var/lib/monark-sentinel/ledger/*/chainstack.lock); CYCLE=$(basename "$(dirname "$LOCK")")
cat "$LOCK"                                           # {pid, iso} (packages/rpc-guard/src/lock.ts:25), non secret : vérifier que ce pid n'existe plus (ps -p <pid>)
cd /opt/monark-harness && sudo -u sentinel /usr/bin/env node packages/rpc-guard/bin/rpc-guard.mjs unlock \
  --ledger-dir /var/lib/monark-sentinel/ledger --cycle "$CYCLE" --op chainstack --reason runbook-sigkill-unlock
echo "exit=$?"; test ! -e "$LOCK" && echo "lock released"
tail -1 "/var/lib/monark-sentinel/ledger/$CYCLE/chainstack.jsonl"   # "outcome":"unlocked" … "reason":"runbook-sigkill-unlock"
```
En `sentinel`, jamais root (un fichier de ledger appartenant à root ferait échouer les ajouts suivants ⇒ `ledger_error`). Si `unlock` échoue sur « head sidecar » ou « cycle ledger » (troncature, fail-closed C-V-8) : STOP, aucune réparation à la main, escalade orchestrateur.

### Lecture du ledger pour le rapprochement A-4 (SSH, LECTURE SEULE ; ADR-GARDE-HELIUS, amendement -1d, -1d-C)
Aux MÊMES instants que les lectures before/after du tableau de bord :
```bash
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'd=/var/lib/monark-sentinel/ledger/<CYCLE>; if [ -e $d/chainstack.lock ]; then echo "RUN EN COURS: relire plus tard"; else wc -l < $d/chainstack.jsonl; cat $d/chainstack.head; echo; fi'
#   épingle = (N lignes, tête). Contrôle de chaîne : la ligne N porte "entry_sha256" == la tête relevée.
#   Compte entre deux épingles N1 < N2 (lignes attempted + network ethereum-mainnet) :
ssh -i ~/.ssh/monark_vps root@31.97.155.188 "sed -n '$((N1+1)),${N2}p' /var/lib/monark-sentinel/ledger/<CYCLE>/chainstack.jsonl" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const L=s.split("\n").filter(Boolean).map(l=>JSON.parse(l));console.log(L.filter(e=>e.outcome==="attempted"&&e.network==="ethereum-mainnet").length)})'
```
Résiduel A-4 (iv) = ce compte × 1 RU, **sous l'hypothèse H-FACT** (non établie : tant qu'elle ne l'est pas, 0 RU, et la contrainte « aucune fenêtre chevauchant un créneau » reste la règle) ; jamais `credits_derived`.

### Changement de période de facturation Chainstack
Période courante 19/09 → 19/10 (`docs/course-ukemi/FAITS-floor-chainstack-2026-09-22.md:25`) ; la suivante se lit sur place. À chaque bascule : réécrire `/etc/monark/sentinel.env` par l'étape (4) avec le nouveau `<CYCLE>` et le `<FLOOR>` lu sur place (`run.ts:250-252`) — aucun redémarrage (l'EnvironmentFile est relu à chaque run oneshot). À défaut, la jambe continue de ledgérer sous l'ancien cycle : publication intacte, attribution A-4 fausse.

### Installation neuve (§2-§4) après NARABI-OPS-1d
Si l'EnvironmentFile porte les clés de cycle, créer aussi le parent du ledger (étape (3)) avant le premier run ; le contrôle du §3 « must still be EMPTY (public/ only) » devient « public/ et ledger/ seulement ».

### Correspondance des lignes `run.ts` citées par les Modes A/B (§6)
Les références `run.ts:NNN` des l. 187-313 visent une version antérieure à -1c : elles ne correspondent ni au code déployé (`c4981d0`) ni à celui de -1d. Correspondance mesurée (`git show <c>:apps/sentinel/src/run.ts | grep -n`) :

| RUNBOOK (l.) | Cité | Énoncé visé | `c4981d0` (déployé) | `7daf8e5` (2ᵉ redéploiement) |
|---|---|---|---|---|
| 187 | `run.ts:180` | JSON de fin | :233 | :350 |
| 209, 212 | `:167` | `dueDays` | :220 | :335 |
| 209 | `:75`-`:92` | boucle de `runDue` | :119-143 | :126-150 |
| 210 | `:182`-`:191` | bloc d'écriture | :235-244 | :352-361 |
| 220, 252 | `run.ts:72`, `:72` | `let lo = DEPLOY_BLOCK` | :113 | :120 |
| 250, 257 | `run.ts:165` | contrôle `--day` = jour suivant | :218 | :333 |
| 272, 275, 278, 279, 313 | `:188` | `appendFileSync` (timeline privée) | :241 | :358 |
| 278, 279 | `:189` | écriture du `state.json` privé | :242 | :359 |
| 277, 279, 313 | `:190`, `:191` | copies publiques | :243, :244 | :360, :361 |
| 282 | `:104`-`:120` | `loadState` | :156-172 | :163-179 |
| 283, 285, 302 | `:111` | `JSON.parse` par ligne | :163 | :170 |
| 284, 302 | `:201` | garde de run (`sentinel FATAL`) | :254 | :375 |
| 287 | `:182` | garde `report.lines.length > 0` | :235 | :352 |
| 300-301 | `run.ts:162`, `:166`, `:181` | appel de `loadState`, 1ᵉʳ RPC `finalized()`, branche `--dry-run` | :215, :219, :234 | :330, :334, :351 |

Avec -1d, `openChainstackLeg` (`:319`) s'exécute AVANT `loadState` ; il n'appelle aucun RPC (lecture de l'env, fichiers, verrou) et, dans la forme de vérification du Mode B (`sudo -u sentinel … --dry-run`, sans EnvironmentFile), rend `unconfigured` sans toucher au ledger : le « network-free » de la l. 300 reste vrai. Re-pointage en place des l. 187-313 : item formé (propriétaire orchestrateur ; déclencheur : prochaine édition du RUNBOOK, au plus tard le 2ᵉ redéploiement).

## 7. After T >= 7 — publish the labelled instrument at `/narabi/instrument.json` (ADR-M012 item (l))

ONE new static file beside `state.json` and `timeline.jsonl`, labelled `instrument, not the official tracker` (D6).
**Nothing else changes:** no code deploy on the VPS (the `sentinel_sha` of the daily lines stays the same), no unit, no
Caddy edit (the existing `handle_path /narabi/*` already serves every file of `/var/lib/monark-sentinel/public`),
`state.json` and `timeline.jsonl` untouched (the CLI refuses them as `--out`). Run by the orchestrator, under the
investor's go, from the NAMED G7 SHA of the lot that carries `apps/sentinel/src/instrument-replay.ts` (decision 72).

**Preconditions (all true, else STOP):** `tracker.t >= 7` in the served `state.json`; ADR-M014-a `9d67302` and
M014-b `3846be5` on origin BEFORE any gap draw (`git branch -r --contains 9d67302` non-empty — the pre-registration
precedes the draw, ADR-M014); a go for (1) the gap draw (network) and for (5) the upload (outbound action).
**Before (1), NARABI-L-GAP-1 (all true, else STOP):** (a) the terms of use of every endpoint of the keyless pool
(`rpc.ts` `PUBLIC_ENDPOINTS`) read on the provider's own page and filed as dated FAITS BEFORE the draw; (b) a bounded
archive probe, measuring whether two DISTINCT providers (`providerOf`) serve the old state (`eth_getLogs` over old
blocks and `eth_call totalSupply` at an old block); measured on 2026-09-27 at block 23 586 600 and on the days
2025-10-15 and 2025-10-20 (FAITS sections 2-3 and the filed files below); (c) the draw runs on the
orchestrator's machine, never on the VPS; (d) **archive quorum: two distinct providers serve the old state, else STOP
and a decision** (never widen the pool nor add a paid leg without one). Measured by the orchestrator on 2026-09-27
(00:4x-00:50 UTC) (`F:\tmp\narabi-gap-logs\`): the keyless pool alone does NOT give this quorum on 2025-10-15.
Filed there: the single-block probe `probe-archive-20260927T0050Z.json` (00:50:41Z, block 23586600: 2 of the 6
providers, mevblocker and Pocket, served a 100-block `eth_getLogs` and the old `eth_call`) and the full-day read
`diag-day2-1020-20260927T0134Z.txt` (01:34Z, day 2025-10-20; Q-C-1). **Decision 247 (2026-09-27): the draw runs WITH
the guarded Chainstack Ethereum leg (archive) AND with Pocket excluded** (`MONARK_SENTINEL_EXCLUDE_HOSTS`, below).
Motive, measured: Pocket sometimes answers an archive `eth_getLogs` with a well-formed EMPTY result and no error
(00:54Z: 2 434 / 0 / 2 434 logs on one request, FAITS section 3), and `quorumTwo` takes the first two successes in list
order, so mevblocker + a lying Pocket stop the day before the Chainstack leg (last) is ever consulted, identically on
every pass. Dated record of the stops: `F:\tmp\narabi-gap-logs\run-N.log` of draw 1 (Chainstack leg, Pocket NOT
excluded), `"stopped": "quorum_disagreement:<day>"` on 10 passes, all ended before the 01:56:18Z stop line of
`draw.log`: runs 1, 2, 4, 6, 7, 8, 10, 20, 21, 22 (01:00Z-01:54Z; days 2025-10-20 twice, 2025-10-25, 2025-10-31,
2025-11-08, 2025-11-15, 2025-11-28, 2026-01-07, 2026-01-14 twice). These logs record the DISAGREEMENT, not which side
answered empty; the empty answer itself is the 00:54Z measure (the 01:2x UTC read of 2025-10-20 at 0 logs was console
only, not filed). It is intermittent, not constant: in the filed 01:34Z read Pocket agreed with mevblocker
(4 276 + 3 499 = 7 775 logs), and `probe-sub-0log-20260927T0154Z.txt` shows Pocket answering 2 434 logs six times in a
row on the 00:54Z range. FAITS: `docs/narabi/FAITS-gap-archive-probe-2026-09-27.md`
(commit `2381525`). Item NARABI-QUORUM-TIEBREAK-1 (consult a third provider on disagreement) is the engine-side fix.

```bash
cd <a clean tree of the named G7 SHA, npm ci done>   # every command below runs from this tree's root, on the orchestrator's machine
# (1) GAP DRAW — the eleven months 2025-10-15 .. J0-1 are in NO committed file (the series ends 2025-10-15, the live
#     timeline opens at J0 = 2026-09-17). Read them with the sentinel's OWN engine into a SCRATCH state dir on the
#     orchestrator's machine, never under a public/ dir (pool: see below, decision 247).
#     J0 of the scratch run = 2025-10-15, so its first line RE-READS the committed seed (the CLI checks they agree).
#     Each run stops at the 180 s catch-up budget (run.ts BUDGET_MAX_S, the default when MONARK_SENTINEL_BUDGET_S is
#     unset, hence the -u below) and the next one resumes; the only measured timing is one published day in 25.481 s
#     (section "Sonde externe"), so the draw takes hours (extrapolation).
#     Days eleven months back need ARCHIVE state (totalSupply at old blocks, old logs): the keyless pool alone is NOT
#     enough (precondition (d)), hence decision 247: pool = the 7 keyless endpoints + the guarded Chainstack Ethereum
#     leg (ledgered and capped by @monark/rpc-guard; the key-bearing CHAINSTACK_ETH_URL stays in the orchestrator's
#     environment, read by the guard's transport, never on a command line; its ledger dir must pre-exist), MINUS
#     Pocket: MONARK_SENTINEL_EXCLUDE_HOSTS=eth.api.pocket.network (motive: (d) above, a well-formed empty answer holds
#     the quorum). The exclusion holds for this ARCHIVE draw only: production keeps the full pool; the served unit
#     never sets the key, and it is never written into /etc/monark/sentinel.env. An excluded host leaves the pool AND
#     each line's `endpoints` (provenance: only the endpoints actually used); a host not in the pool (a typo) is FATAL
#     at start-up, before any read or write. A run that still stops fails closed (exit 1) and the loop retries; if the
#     SAME day keeps stopping, STOP and escalate (never widen the pool or add a paid leg without a decision).
G=F:/tmp/narabi-gap; mkdir -p "$G/ledger"; lastday() { tail -1 "$G/timeline.jsonl" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).day))'; }
for i in $(seq 1 150); do
  [ -f "$G/timeline.jsonl" ] && [ "$(lastday)" \> "2026-09-15" ] && break
  env -u CHAINSTACK_ROBINHOOD_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u MONARK_SENTINEL_BUDGET_S \
    CHAINSTACK_CYCLE_ID=<current cycle id> CHAINSTACK_ETH_ORIGIN=https://ethereum-mainnet.core.chainstack.com \
    CHAINSTACK_CYCLE_FLOOR=<dashboard total at the rollover, RU> MONARK_SENTINEL_EXCLUDE_HOSTS=eth.api.pocket.network \
    MONARK_SENTINEL_J0=2025-10-15 node apps/sentinel/src/run.ts --state "$G" || sleep 60
done; lastday   # must be >= 2026-09-16 (a later day is fine: the overlap with the live days must agree)
#     Each end JSON must show "chainstack": true, "chainstack_guard": "ok"; the lines' `endpoints` must not list Pocket.
#     Record also the RU actually spent, read from $G/ledger (never an estimate).
#     run.ts also creates $G/public/ (its local copies; harmless). --gap reads $G/timeline.jsonl, NEVER $G/public/...
#     Record in docs/JOURNAL-PROVENANCE.md the UTC start/end of the draw and sha256 of $G/timeline.jsonl.
# (2) LIVE FILES, read in the same minute AFTER the day's publishing run:
L=F:/tmp/narabi-l; mkdir -p "$L"
curl -sf https://monarkgate.tech/narabi/timeline.jsonl -o "$L/timeline.jsonl"   # -f: an HTTP error page is never saved
curl -sf https://monarkgate.tech/narabi/state.json    -o "$L/state.json"
# (3) REPLAY (offline, writes ONE file). Defaults are the pre-registered ones: --perms 1000, --seed 20260917, --series =
#     the committed fixture (seed 2025-10-15, recorded in params.seed_series_sha256). No --publish: $L is not public.
node apps/sentinel/src/instrument-replay.ts --gap "$G/timeline.jsonl" --timeline "$L/timeline.jsonl" --out "$L/instrument.json"
#     Expect "instrument written: N windows 2025-10-15..<last day>, digest <d>, state_digest <s>."; any FATAL = STOP.
# (4) DIGEST CONTROL: the digest recomputes, state_digest == the served state.json digest, and differs from it.
node -e 'const f=require("fs"),c=require("crypto");const d=JSON.parse(f.readFileSync(process.argv[1],"utf8")),s=JSON.parse(f.readFileSync(process.argv[2],"utf8"));const {digest,generated_at,...b}=d;const ok=c.createHash("sha256").update(JSON.stringify(b)).digest("hex")===digest&&d.state_digest===s.digest&&digest!==s.digest;console.log(ok?"digest OK":"STOP: digest");process.exitCode=ok?0:1' "$L/instrument.json" "$L/state.json"
sha256sum "$L/instrument.json"   # the LOCAL sha, compared in (6)
# (5) UPLOAD, atomic: the temp file sits OUTSIDE public/ on the SAME filesystem, so the mv is a rename (no half file served).
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'umask 022; T=/var/lib/monark-sentinel/.instrument.json.new; cat > $T && chown sentinel:sentinel $T && chmod 0644 $T && mv -f $T /var/lib/monark-sentinel/public/instrument.json && sha256sum /var/lib/monark-sentinel/public/instrument.json' < "$L/instrument.json"
# (6) SERVED CHECK
curl -sfI https://monarkgate.tech/narabi/instrument.json | head -1     # HTTP/2 200
curl -sf  https://monarkgate.tech/narabi/instrument.json | sha256sum   # == the LOCAL sha of (4) and the remote sha of (5)
curl -sf  https://monarkgate.tech/narabi/state.json | head -c 200      # unchanged by this step
```

Record in `docs/JOURNAL-PROVENANCE.md`: the G7 SHA, `gap_sha256`, `timeline_sha256`, `digest`, `state_digest`, the served
sha256 and the UTC time. **Rollback:** `ssh … 'rm -f /var/lib/monark-sentinel/public/instrument.json'` — nothing else
to undo. **Refresh: none — ONE snapshot, taken once at T >= 7** (the days up to `params.last_day`); the daily job never
touches it. Any refresh is an ADR decision (a dated line under ADR-M012 (l)) and publishes NO new permutation p:
ADR-M014 D4 (the CUSUM and its permutation test read a CLOSED block once; no repeated look, no sequential reading).
The CLI as delivered always computes that section, so the decision also says how a refreshed file is issued (SAME gap
file, its sha recorded, no new draw). **Not recommended:** running (3) on the VPS with
`--out /var/lib/monark-sentinel/public/instrument.json --publish` needs the tree re-archived there, which changes the
`sentinel_sha` of every later timeline line (ADR-M014, Consequences) — "nothing else changes" would no longer hold.

**Amendement 2026-09-27 (G7 de NARABI-L-1)** (dated lines, additive; ADR-M012 item (l) and ADR-M014 D4 are amended the same day):
- **Amendement 2026-09-27 (G7 de NARABI-L-1) — `sentinel_sha` consequence (ADR-M014, Consequences).** This section deploys no code,
  so the daily lines keep their `sentinel_sha`. Any LATER redeploy of the sentinel tree from a SHA that carries
  `apps/sentinel/src/instrument-replay.ts` (the G7 SHA of NARABI-L-1 or any later one) changes `sentinel_sha` on every daily line
  written after it: `sentinelSha` hashes every `src/*.ts` (`run.ts:156-161`), and `run.ts` itself also changed in this lot
  (`MONARK_SENTINEL_EXCLUDE_HOSTS`, gel 2 `33ece9f`). Declare it in that redeploy's entry of `docs/JOURNAL-PROVENANCE.md` (old and
  new value, first day carrying the new one): expected, not a fault.
- **Amendement 2026-09-27 (G7 de NARABI-L-1) — rule TASKSTOP-BASH-LOOP-1.** A harness TaskStop on a Git Bash loop running in the
  background does NOT kill the loop nor its children (measured on draw 1, below). Every PAID loop run in the background (the (1) draw
  loop above, Chainstack leg) carries a STOP file read at each iteration, as the first statement of the loop body:
  `[ -f "$G/STOP" ] && { echo "STOP file $(date -u +%FT%TZ)"; break; }`; to stop, `touch "$G/STOP"`. A stop is recorded only after it
  is verified by a process count (`Get-CimInstance Win32_Process`) covering BOTH the loop (its command line) AND its child
  `node apps/sentinel/src/run.ts` (filter on `run.ts` too): 0 left for each. A STOP file acts between iterations only: a pass already
  running (up to the 180 s budget) still finishes and still spends RU; a kill of the loop alone does not stop that child (measured on
  draw 1, below). The bash block above is kept byte-identical (as accepted at the re-checkpoint-2 of NARABI-L-1); the operator adds the
  STOP line when launching.
- **Amendement 2026-09-27 (G7 de NARABI-L-1) — draw 1 note (shared reads only, `date -u` 03:41Z).** The line
  `STOP-1 2026-09-27T01:56:18Z tirage 1 arrete par TaskStop` of `F:\tmp\narabi-gap-logs\draw.log` is FALSE: draw 1 (Pocket NOT excluded,
  Chainstack leg, state `F:\tmp\narabi-gap`) went on, passes 24 to 62 from 01:58:05Z, in parallel with draw 2 on the paid leg. The last
  line of `draw.log` (127 lines, mtime 03:10:29Z) is `pass 62 2026-09-27T03:10:29Z`, with NO `exit=` line after it: the bash loop was
  killed during pass 62, at about 03:10-03:11Z (the orchestrator's process check read `date -u` 03:10). Its `node run.ts` child
  OUTLIVED that kill: `run-62.log` reports `elapsed_ms` 184 651 (03:10:29Z + 184.7 s = 03:13:34Z) and, with
  `F:\tmp\narabi-gap\timeline.jsonl`, was last written at 03:13:35Z (mtime read with `TZ=UTC`): `catchup_budget`, 15 lines written after
  the kill on the paid leg (last day 2026-05-15; the file went from 198 lines at the end of pass 61, the count of the CHANTIERS incident entry, to 213). The process count of that
  kill covered the `draw.sh` processes only (inference from these measures; it would not see the child). The "04:1x UTC" of the CHANTIERS incident entry of 2026-09-27 and of the re-checkpoint-2 report is
  local time (GMT+1) labelled UTC, corrected by the CHANTIERS entry "03:2x UTC — CORRECTION D'HORODATAGE". Draw 1 stays a witness,
  never an input of (3). The RU actually spent by BOTH draws are read at the end of draw 2 from
  `F:\tmp\narabi-gap\ledger\chainstack-2026-09-19` and `F:\tmp\narabi-gap2\ledger\chainstack-2026-09-19` and recorded in
  `docs/JOURNAL-PROVENANCE.md` — never estimated; draw 1's reading includes pass 62, run after the kill of its loop.
- **Amendement 2026-09-27 (G7 de NARABI-L-1) — draw 2 provenance (declared).** Draw 2 (state `F:\tmp\narabi-gap2`, Pocket excluded,
  Chainstack leg) runs from a clone of gel 2 `33ece9f` (`F:\tmp\narabi-gap-tree2`), not from the G7 SHA named at the top of this
  section. Between gel 2 and gel 3 `b45db28`, the only change under `apps/sentinel/src/` is a two-line docstring of
  `instrument-replay.ts` (C-V-1): the engine that writes the gap lines is the same code (`run.ts` `a02a9542…` at both), and those lines
  carry the gel-2 `sentinel_sha`. Step (3) runs from the G7 SHA.

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
# Verify by DIGEST on both sides (never print the contents); the two hashes MUST match.
# Read the password with `read -rs SMTP_PASS` BEFORE the printf above, so it never enters the shell history.
#   printf 'SMTP_HOST=%s\nSMTP_PORT=465\nSMTP_TLS=implicit\nSMTP_USER=%s\nSMTP_PASS="%s"\nALERT_FROM=%s\nALERT_TO=%s\n' "$SMTP_HOST" "$SMTP_USER" "$PW_ESC" "$ALERT_FROM" "$ALERT_TO" | sha256sum   # local (same printf as above)
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
     /usr/bin/env node /opt/monark-probe/probe-narabi.mjs --now "$(date -u -d "+2 days" +%Y-%m-%dT12:00:00Z)" --out /tmp/probe-sim.json; \
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

## Sonde externe — NARABI-OPS-1b

The external probe (`scripts/probe-narabi.mjs`, units `deploy/monark-probe.{service,timer}`) reads the published
`/narabi/timeline.jsonl` from the **Bell VPS** (a distinct host), recomputes the whole hash chain, checks that the
last line is not older than J-1 at the 10:30 UTC deadline, and writes `narabi.json` (exit 1 iff unhealthy).
**DEPLOYED on Bell 2026-09-21 by G7 SHA `c0027cb` (investor decision 72): `/opt/monark-probe/probe-narabi.mjs` (sha `4e4338c0…`, `DEPLOYED-SHA` file), units installed, `monark-probe.timer` enabled (10:30/12:30/16:30 UTC), `/etc/monark/probe.env` posted by the investor (0600 root, digest verified), TLS 1.3 to `smtp.hostinger.com:465` verified, simulation shot as `probe` delivered the FIRST real mail (`alerted: true`, `alert_error: null`) — pipe `built` (decision 58, JOURNAL).** Deadline basis: measured publishing run of 2026-09-21 (start 00:47:55 UTC, exit
00:48:20 UTC, 25.481 s wall clock, `chainstack: true`, 1 line written, T=3) => D <= 600 s, so 10:30 UTC is kept.
**Residual, declared: a dead probe is silent** (no dead-man switch yet — formed item, trigger: G0 T-1b). Before the deploy the manual check was: `curl -s https://monarkgate.tech/narabi/timeline.jsonl | tail -1` — the last
`day` should be yesterday (UTC) after 10:00.
