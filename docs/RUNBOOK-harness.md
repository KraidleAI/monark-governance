# RUNBOOK — deploy the MONARK harness (orchestrator-deployed)

The MONARK harness is a stateless Node service exposing the four real primitives — `attest` (Shōgen),
`gate` (HIKAE), `cascade` (UKEMI), `calibrate` (HIKAE BYO split-conformal, Lot C1 / ADR-M007) — over
**MCP** (`mcp.monarkgate.tech`) and a **HTTP/JSON mirror** (`api.monarkgate.tech`), both on ONE loopback
listener `127.0.0.1:3001`, fronted by Caddy for TLS.

**Who runs this:** the **orchestrator**, from its own machine, over SSH — the SAME channel it already uses
for the live vitrine (key `~/.ssh/monark_vps`: `ssh -i ~/.ssh/monark_vps root@31.97.155.188`). Per
**ADR-M005 Addendum D12 (Q2 revised, 2026-09-10)** and **ADR-M004 Addendum D17**, Q2 was revised and the
orchestrator deploys the harness itself (not the investor). The pattern mirrors the live vitrine (a systemd
service + Caddy, **not** docker).

**Committed files this runbook installs:**
- `deploy/monark-harness.service` — the systemd unit (`monark-harness`, `127.0.0.1:3001`, `Restart=always`).
- `deploy/Caddyfile.monark-harness` — the Caddy site block to **append** to `/etc/caddy/Caddyfile`.
- `scripts/verify-harness.mjs` — the post-deploy check that records the deployment CA.

---

## 0. Preconditions (already true — verify, do not create)

- VPS: Hostinger, Ubuntu, `31.97.155.188`, SSH as `root` with the deploy key: `ssh -i ~/.ssh/monark_vps root@31.97.155.188`.
- Caddy v2 already live serving the vitrine (`monarkgate.tech` + `www` → `localhost:3000`) via `/etc/caddy/Caddyfile`.
- Node ≥ 24 installed (the vitrine uses Node v24.21.0).
- **DNS A records `mcp.monarkgate.tech` and `api.monarkgate.tech` are posed → `31.97.155.188`** (Hostinger).
  Verify they resolve before touching Caddy (TLS via HTTP-01 needs them live). On the VPS:

  ```bash
  dig +short mcp.monarkgate.tech    # expect 31.97.155.188  (or: nslookup mcp.monarkgate.tech)
  dig +short api.monarkgate.tech    # expect 31.97.155.188  (or: nslookup api.monarkgate.tech)
  ```

## 1. Put the harness tree on the VPS at `/opt/monark-harness`

**Ship the SERVICE paths with `git archive` from the orchestrator's machine** over the existing deploy key
— do NOT `git clone` on the VPS (cloning the private **governance** repo there would need a deploy key on
the VPS, a new credential the vitrine never provisioned), and do NOT push the whole repo (Lot H6: a
public-facing host carries only what it runs — least privilege). `git archive` ships the **committed bytes
of exactly the listed paths** — the same set `node apps/harness/src/server.ts` needs at runtime plus what
this runbook installs: `apps/ packages/ schemas/ fixtures/ package.json package-lock.json deploy/
scripts/verify-harness.mjs`. It reads from `HEAD`, so it is the method used at the go-live deploy
(2026-09-11) and it excludes `node_modules`, `.git`, and gitignored build output (`apps/site/.next`)
**by construction** — an uncommitted or ignored file cannot enter the tarball, which IS the least-privilege
guarantee (no filter to get wrong).

Why this set (re-verified against the running process):
- `apps/` and `packages/` ship **whole** — `npm ci` (step 2) validates every workspace in
  `package-lock.json`, so dropping one breaks the install; and `server.ts` imports the `@monark/*`
  workspaces (contracts, hikae, ukemi, monark) transitively via the tool registry.
- `schemas/` and `fixtures/` are the process's ONLY two runtime file reads: `schema-projection.ts` reads
  the frozen `*.schema.json`, `shogen-fixture.ts` reads the `s3-binance.*` witness.
- `deploy/` (unit + Caddy block, cp'd in steps 4–5) and `scripts/verify-harness.mjs` (step 6, and a local
  VPS re-run) are needed by the deploy procedure itself.

This EXCLUDES `docs/`, `enforcement/`, the ROOT `test/`, `.github/`, `README.md`, `tsconfig.json`,
`eslint.config.mjs`, `vocab-banned.json`, `lint-ratchet.json`, and all of `scripts/` except
`verify-harness.mjs` — none is read at runtime and none is in the archive's path list. (Workspace tests
under `apps/*/test/` and `packages/*/test/` DO ship with `apps/`/`packages/` — that is source code, not the
governance surface, and is never executed on the host.) `git archive` does NOT prune the destination (it
overwrites but never removes stale files), so a stale tree needs the one-time cleanup below. From the
orchestrator's machine, in the repo root:

```bash
git archive --format=tar.gz HEAD \
  apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"
```

`--format=tar.gz` is REQUIRED: `git archive HEAD …` defaults to an UNcompressed tar on stdout, and the
remote `tar xzf -` forces gunzip (`-z`), which fails on a plain tar (`gzip: stdin: not in gzip format`);
`--format=tar.gz` emits the gzip stream the remote expects. `git archive` stores the listed relative paths
verbatim, so `scripts/verify-harness.mjs` keeps its `scripts/` prefix on the destination.

**One-time cleanup if the host ever received a pre-H6 (whole-repo) push:** `git archive` writes only the
listed paths and does NOT prune TOP-LEVEL directories absent from that list, so an `/opt/monark-harness`
populated by an older runbook (rsync/tar/whole-repo) may still carry `docs/`, `test/`, `enforcement/`,
`.github/`, etc. Remove them explicitly:

```bash
ssh -i ~/.ssh/monark_vps root@31.97.155.188 \
  'cd /opt/monark-harness && rm -rf docs test enforcement .github README.md tsconfig.json eslint.config.mjs vocab-banned.json lint-ratchet.json'
```

Then, on the VPS (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`), confirm the tree carries this lot AND no
governance (it must contain apps/, packages/, schemas/, fixtures/; scripts/ holds only verify-harness.mjs):

```bash
cd /opt/monark-harness
test -f apps/harness/src/http.ts || echo "STOP: this tree predates Lot H4 (no HTTP mirror) — re-push a newer one"
if [ -d docs ] || [ -d test ] || [ -d enforcement ]; then echo "STOP: governance dirs present — restricted push did not take; run the cleanup above"; fi
ls scripts   # expect ONLY: verify-harness.mjs
```

## 2. Install dependencies and verify the launch command (as root)

`npm ci` runs as `root` (which has a writable HOME); the service user is created and given the tree in step 3.

```bash
cd /opt/monark-harness
npm ci                                # sets up the @monark/* workspace symlinks (no build step)
node -v                               # must print v24.x or newer
which node                            # expect /usr/bin/node; if different, edit ExecStart in step 4
```

## 3. Create the service user, hand over the tree, and dry-run

```bash
useradd --system --no-create-home --shell /usr/sbin/nologin monark   # ignore "already exists"
chown -R monark:monark /opt/monark-harness
# Dry-run the exact ExecStart as the service user (node needs no writable HOME), then stop it:
cd /opt/monark-harness
sudo -u monark node apps/harness/src/server.ts &
sleep 1
curl -s -H 'Host: api.monarkgate.tech' http://127.0.0.1:3001/health   # {"status":"ok",...}
kill $!
```

## 4. Install, enable, and start the systemd unit

If `which node` above was **not** `/usr/bin/node`, edit `ExecStart` in
`/opt/monark-harness/deploy/monark-harness.service` to your absolute node path first.

```bash
cp /opt/monark-harness/deploy/monark-harness.service /etc/systemd/system/monark-harness.service
systemctl daemon-reload
systemctl enable --now monark-harness
systemctl status monark-harness --no-pager        # Active: active (running)
curl -s -H 'Host: api.monarkgate.tech' http://127.0.0.1:3001/health   # local check before Caddy
# Lot H6 — the resource caps are ENFORCED at runtime, not just written in the unit file. Verify the cgroup
# actually applied them (expect CPUQuotaPerSecUSec=500ms, MemoryMax=536870912 [512 MiB], TasksMax=128):
nproc   # log this — CPUQuota=50% is 50% of ONE core; this MUST read > 1 for the cap to leave the vitrine CPU headroom (OBS-1)
systemctl show monark-harness -p CPUQuotaPerSecUSec -p MemoryMax -p TasksMax -p StartLimitIntervalUSec -p StartLimitBurst
# Expect CPUQuotaPerSecUSec=500ms, MemoryMax=536870912 [512 MiB], TasksMax=128, StartLimitIntervalUSec=0
# (H7: start rate-limiting disabled so an overload restart-loop cannot leave the unit dead). Confirm the V8
# heap cap reached the LIVE process (H7):
cat /proc/"$(systemctl show -p MainPID --value monark-harness)"/cmdline | tr '\0' ' '; echo   # expect --max-old-space-size=448
# A MemoryMax=infinity (or CPUQuotaPerSecUSec=infinity) reading means the cgroup cap did NOT apply on this
# host (e.g. cgroup v1, or a delegation gap) — STOP and fix before exposing the endpoint; the unit file
# alone is not the control.
```

## 5. Add the Caddy site block (TLS is automatic once DNS resolves)

**Append** the committed block — do NOT replace the file (the vitrine block lives in it):

```bash
printf '\n' >> /etc/caddy/Caddyfile                  # ensure the append starts on a fresh line
cat /opt/monark-harness/deploy/Caddyfile.monark-harness >> /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile        # must say "Valid configuration"
systemctl reload caddy                               # reload, never restart (keeps the vitrine up)
```

Caddy obtains certificates for `mcp.`/`api.` via HTTP-01 automatically (allow a few seconds). No
Cloudflare proxy is in front, so HTTP-01 completes directly (K-7).

## 6. Verify and record the deployment CA

From the orchestrator's machine (not the VPS), against the live endpoint:

```bash
node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json
```

It checks: `/health` and `/openapi.json` live; a present-and-invalid `Origin` → `403` on both hosts; the
MCP `tools/list` returns the four tools (SET EQUALITY, not subset — B-2); a real `gate`, `cascade`,
`attest`, and `calibrate` call; a **`gate_byo_call`** (Lot C2, ADR-M007 D7) that reuses the `calibrate`
call's scores as `params.calibration` and asserts the live decision's `verdict.scores_sha256` equals the
live `calibrate` `scores_sha256` AND `action === "commit"` — proving the BYO loop end-to-end; three checks of the
`liquidation-eligible-coverage` class on the **COMMITTED** liq registry (U-4b-2b, ADR-U4b-2b D4; they replaced the
two empty-registry checks of HARNESS-DESC-1):
- **`gate_liq_call`** POSTs a decision whose `yhat` lies in the committed stratum s0 (alpha 0.01, nMin 100, the body
  unchanged since HARNESS-DESC-1) and asserts `200`, `verdict.reason === "covered"`, the upper bound
  `verdict.region = { kind: "interval", lo: 0, hi: yhat + verdict.qhat }` with `verdict.qhat > 0` (read from the
  verdict, never typed), `verdict.n_calib` = the committed stratum size and `verdict.scores_sha256` = its pinned digest
  (both fixed by value in the script, equal to `apps/harness/src/calibration.ts` by test), and the committed class text
  in `content`, never the empty-registry sentence. The TOP-LEVEL `action` / `reason` are recorded in the detail next to
  `verdict.reason` (under this body's `tauInterval 1` and open clock, L3 answers `defer` / `interval_too_wide`); they
  are never required to read `covered`.
- **`gate_liq_uncommitted_call`** puts `yhat` on the first served cut (stratum s1, not committed) and asserts `200`,
  `action === "abstain"`, `verdict.reason === "under_calib"` and `verdict.n_calib === 0`.
- **`mcp_gate_description_liq`** asserts that the served `tools/list` description of `gate` carries the committed
  clause ENTIRE ("the served region is" + the upper-bound, requirements, H-3 and conditional sentences) and NOT the
  empty-registry sentence.

Against a process that still serves the EMPTY liq registry (any SHA before the U-4b-2b switch window, e.g. `bb41b6d`),
`gate_liq_call` and `mcp_gate_description_liq` are RED by design: that surface is exactly vector alpha-2b of
`test/verify-harness-liq.test.ts` (its response body hashes to the `gate_liq_call` sha256 of the CA recorded at
`bb41b6d`). Against a process older than U-4b-2a, both liq calls are a 400 (unknown task_class). And the TLS
certificate (issuer, expiry). It writes the **conformity attestation** (URL, timestamp, per-check sha256, TLS cert)
to the `--out` file and exits **1** on any failure (it sets `process.exitCode` and returns; since U-4b-2b the exit is
discriminating under win32 too, item O-1b-G2-1). Keep that file as the CA.

**Deploy reserves — the green gate (Lot H6).** The deploy is GREEN only when BOTH hold:
- the command **exits 0** AND its stderr prints `VERIFY OK — all checks passed` (15 of 15 checks; the CA's `checks` array lists them all, each `ok: true`). Treat ANY non-zero exit as RED and
  read the JSON `checks` array to find the failing check (on Windows an unavailable interpreter can surface as exit
  `127` — still RED, never a pass); and
- on the first real **https** run, the CA's `tls.authorized === true` (a genuine handshake to the live
  cert, not merely "fetch didn't throw"). An http/local target reports `tls.skipped` and does NOT satisfy
  the go-live gate.

After a GREEN deploy, record the CA in the provenance journal — compute its sha256 and log that digest with
today's date to `docs/JOURNAL-PROVENANCE.md`, alongside the artifact `docs/deploy-CA-harness.json`:

```bash
sha256sum docs/deploy-CA-harness.json   # log this digest + the date into docs/JOURNAL-PROVENANCE.md
```

**Live cap probes (Lot H6/H7).** The config/unit tests prove the caps in CI; these two prove they BITE on the
live endpoint. Record both outcomes in the journal next to the CA sha:

```bash
# (a) Caddy body cap in prod — a >256KB body must be REJECTED (413/non-200) on BOTH hosts:
head -c 300000 /dev/zero | tr '\0' a > /tmp/big.txt
curl -s -o /dev/null -w '%{http_code}\n' -X POST --data-binary @/tmp/big.txt https://mcp.monarkgate.tech/            # expect non-200
curl -s -o /dev/null -w '%{http_code}\n' -X POST --data-binary @/tmp/big.txt https://api.monarkgate.tech/cascade    # expect non-200
# (b) cascade node cap live — an L/e with n=65 (> CASCADE_MAX_NODES=64) must be REFUSED (4xx, never a 200 result):
node -e 'const n=65,L=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>j===(i+1)%n?100:0)),e=Array(n).fill(1);process.stdout.write(JSON.stringify({L,e,shock:0,producedAt:"2026-01-01T00:00:00Z"}))' > /tmp/n65.json
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' --data-binary @/tmp/n65.json https://api.monarkgate.tech/cascade   # expect 4xx, NOT 200
rm -f /tmp/big.txt /tmp/n65.json
```

## Rollback

```bash
systemctl disable --now monark-harness
# remove the appended block from /etc/caddy/Caddyfile, then:
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

## Operations

- Logs: `journalctl -u monark-harness -f`
- Restart: `systemctl restart monark-harness`
- Update: re-run the step-1 `git archive` from the orchestrator's machine (it overwrites the shipped paths
  but does not touch `node_modules`/`.git`, so the VPS `npm ci` tree survives the re-push), then on the VPS:
  `cd /opt/monark-harness && npm ci && chown -R monark:monark . && systemctl restart monark-harness`. The
  orchestrator writes a VPS-side `/opt/monark-harness-redeploy.sh` wrapping these steps during the initial
  deploy (same redeploy motif as the vitrine's `/opt/monark-redeploy.sh`); later updates just run it.
