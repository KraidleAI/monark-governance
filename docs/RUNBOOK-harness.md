# RUNBOOK — deploy the MONARK harness (orchestrator-deployed)

The MONARK harness is a stateless Node service exposing the three real primitives — `attest` (Shōgen),
`gate` (HIKAE), `cascade` (UKEMI) — over **MCP** (`mcp.monarkgate.tech`) and a **HTTP/JSON mirror**
(`api.monarkgate.tech`), both on ONE loopback listener `127.0.0.1:3001`, fronted by Caddy for TLS.

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

**rsync only the SERVICE paths from the orchestrator's machine** over the existing deploy key — do NOT `git
clone` on the VPS (cloning the private **governance** repo there would need a deploy key on the VPS, a new
credential the vitrine never provisioned), and do NOT push the whole repo (Lot H6: a public-facing host
carries only what it runs — least privilege). Ship exactly what `node apps/harness/src/server.ts` needs at
runtime plus what this runbook installs: `apps/ packages/ schemas/ fixtures/ package.json package-lock.json
deploy/ scripts/verify-harness.mjs`.

Why this set (re-verified against the running process):
- `apps/` and `packages/` ship **whole** — `npm ci` (step 2) validates every workspace in
  `package-lock.json`, so dropping one breaks the install; and `server.ts` imports the `@monark/*`
  workspaces (contracts, hikae, ukemi, monark) transitively via the tool registry.
- `schemas/` and `fixtures/` are the process's ONLY two runtime file reads: `schema-projection.ts` reads
  the frozen `*.schema.json`, `shogen-fixture.ts` reads the `s3-binance.*` witness.
- `deploy/` (unit + Caddy block, cp'd in steps 4–5) and `scripts/verify-harness.mjs` (step 6, and a local
  VPS re-run) are needed by the deploy procedure itself.

This EXCLUDES `docs/`, `enforcement/`, `test/`, `.github/`, `README.md`, `tsconfig.json`,
`eslint.config.mjs`, `vocab-banned.json`, `lint-ratchet.json`, and all of `scripts/` except
`verify-harness.mjs` — none is read at runtime. Restricting the SOURCE list is the guarantee that
governance files never reach the public host; `--delete` is for update hygiene (files that vanished from
the shipped set), not the primary control. `-R` (`--relative`) preserves the nested
`scripts/verify-harness.mjs` path on the destination. Exclude `node_modules` (rebuilt by `npm ci` in step
2) and `.git`. From the orchestrator's machine, in the repo root:

```bash
rsync -azR --delete -e "ssh -i ~/.ssh/monark_vps" \
  --exclude node_modules --exclude .git \
  apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs \
  root@31.97.155.188:/opt/monark-harness/
```

If `rsync` is not on the orchestrator's machine (Git-for-Windows does not ship it), use tar-over-ssh instead
(same SERVICE path set and excludes; `scp`/`ssh`/`tar` are always present). tar stores the listed relative
paths verbatim, so `scripts/verify-harness.mjs` keeps its `scripts/` prefix. Note tar does NOT prune the
destination (unlike `rsync --delete`), so on a re-push it overwrites but never removes stale files:

```bash
tar czf - --exclude node_modules --exclude .git \
  apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"
```

**One-time cleanup if the host ever received a pre-H6 (whole-repo) push:** neither `rsync --delete` (with
`-R` and an explicit source list) nor tar reliably prunes TOP-LEVEL directories absent from the source
list, so an `/opt/monark-harness` populated by an older runbook may still carry `docs/`, `test/`,
`enforcement/`, `.github/`, etc. Remove them explicitly — do NOT rely on `--delete`:

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
systemctl show monark-harness -p CPUQuotaPerSecUSec -p MemoryMax -p TasksMax
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
MCP `tools/list` returns the three tools; a real `gate`, `cascade`, and `attest` call; and the TLS
certificate (issuer, expiry). It writes the **conformity attestation** (URL, timestamp, per-check
sha256, TLS cert) to the `--out` file and exits non-zero on any failure. Keep that file as the CA.

**Deploy reserves — the green gate (Lot H6).** The deploy is GREEN only when BOTH hold:
- the command **exits 0** AND its stderr prints `VERIFY OK`. Treat ANY non-zero exit as RED and read the
  JSON `checks` array to find the failing check (on Windows an unavailable interpreter can surface as exit
  `127` — still RED, never a pass); and
- on the first real **https** run, the CA's `tls.authorized === true` (a genuine handshake to the live
  cert, not merely "fetch didn't throw"). An http/local target reports `tls.skipped` and does NOT satisfy
  the go-live gate.

After a GREEN deploy, record the CA in the provenance journal — compute its sha256 and log that digest with
today's date to `docs/JOURNAL-PROVENANCE.md`, alongside the artifact `docs/deploy-CA-harness.json`:

```bash
sha256sum docs/deploy-CA-harness.json   # log this digest + the date into docs/JOURNAL-PROVENANCE.md
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
- Update: re-run the step-1 rsync from the orchestrator's machine (the `node_modules`/`.git` excludes are
  not removed by `--delete`, so the VPS `npm ci` tree survives the re-push), then on the VPS:
  `cd /opt/monark-harness && npm ci && chown -R monark:monark . && systemctl restart monark-harness`. The
  orchestrator writes a VPS-side `/opt/monark-harness-redeploy.sh` wrapping these steps during the initial
  deploy (same redeploy motif as the vitrine's `/opt/monark-redeploy.sh`); later updates just run it.
