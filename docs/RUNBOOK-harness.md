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

**rsync the working tree from the orchestrator's machine** over the existing deploy key — do NOT `git clone`
on the VPS: cloning the private **governance** repo there would need a deploy key on the VPS, a new
credential the vitrine never provisioned. Exclude `node_modules` (rebuilt by `npm ci` in step 2) and `.git`.
From the orchestrator's machine, in the repo root:

```bash
rsync -az --delete -e "ssh -i ~/.ssh/monark_vps" \
  --exclude node_modules --exclude .git \
  ./ root@31.97.155.188:/opt/monark-harness/
```

If `rsync` is not on the orchestrator's machine (Git-for-Windows does not ship it), use tar-over-ssh instead
(same excludes, `scp`/`ssh`/`tar` are always present):

```bash
tar czf - --exclude node_modules --exclude .git . \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"
```

Then, on the VPS (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`), confirm the tree carries this lot (it
must contain apps/, packages/, schemas/, fixtures/):

```bash
cd /opt/monark-harness
test -f apps/harness/src/http.ts || echo "STOP: this tree predates Lot H4 (no HTTP mirror) — re-rsync a newer one"
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
