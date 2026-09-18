# RUNBOOK — deploy the MONARK Narabi sentinel (orchestrator-deployed)

The **Narabi sentinel** is a daily `oneshot` job (`apps/sentinel/src/run.ts`) that reads the attested USDe
redemption flow at finality, steps the M009 tracker, and publishes a replayable timeline at
`monarkgate.tech/narabi/`. It is the FIRST outbound-network process on the VPS (public RPC, read-only, no key)
and writes ONLY its state dir. This runbook **mirrors `RUNBOOK-harness.md`**; only the deltas are here.

**Who runs this:** the **orchestrator**, over the same SSH channel as the harness/vitrine
(`ssh -i ~/.ssh/monark_vps root@31.97.155.188`). Deploy order (ADR-M012 D5): (a) harness redeploy from HEAD;
(b) sentinel; (c) **J0 = the first published window** (non_evaluable, no predecessor); the first tracker step
is J0+1; T counts live steps.

**Committed files this runbook installs:**
- `deploy/monark-sentinel.service` — the `oneshot` unit (`User=sentinel`, `ReadWritePaths=/var/lib/monark-sentinel`).
- `deploy/monark-sentinel.timer` — daily 00:30 UTC + jitter, `Persistent=true`.
- `deploy/Caddyfile.monark-narabi.snippet` — the `handle_path /narabi/*` block to INSERT in the vitrine block.

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
# On a fresh state the first day is non_evaluable (no predecessor) so T=0; the first tracker STEP is J0+1
# (ADR-M012 D5: J0 is the first published window; the first step is J0+1; T counts live steps only).
ls /var/lib/monark-sentinel   # must still be EMPTY (public/ only) — a dry-run leaves no state.
```

## 4. Install and enable the timer

**The first production run sets J0 ONLY via the `MONARK_SENTINEL_J0` env drop-in below — NEVER via `--day`
(O-b).** On an empty state a non-dry `--day D` would make D the *de-facto* J0 (checkpoint-2 nuance); the
drop-in is the one honest way to declare J0 so T counts live steps from J0+1.

```bash
cp /opt/monark-harness/deploy/monark-sentinel.service /etc/systemd/system/
cp /opt/monark-harness/deploy/monark-sentinel.timer   /etc/systemd/system/
# Set J0 (the first published day) as a drop-in so T counts live steps from J0+1 (never --day; O-b):
# Explicit drop-in (scriptable over SSH; `systemctl edit` needs a TTY/editor and is NOT used):
mkdir -p /etc/systemd/system/monark-sentinel.service.d
printf '[Service]\nEnvironment=MONARK_SENTINEL_J0=<J0>\n' > /etc/systemd/system/monark-sentinel.service.d/override.conf
systemctl daemon-reload
systemctl show -p Environment monark-sentinel.service   # MUST print MONARK_SENTINEL_J0=<J0> BEFORE enable --now
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

## Operations

- Logs: `journalctl -u monark-sentinel -f`
- Manual catch-up (never skips): `systemctl start monark-sentinel.service` (processes every complete day in order).
- Verify publication: `curl -s https://monarkgate.tech/narabi/state.json | head -c 300`; anyone can replay it
  via the committed `trackerReplay` over the `s` column of `timeline.jsonl`.
