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

The 15 checks, by name, in the script's order: `health`, `openapi`, `origin_403_api`, `origin_403_mcp`,
`mcp_tools_list`, `gate_call`, `gate_retired_call`, `gate_future_call`, `gate_liq_call`, `gate_liq_uncommitted_call`,
`mcp_gate_description_liq`, `cascade_call`, `attest_call`, `calibrate_call`, `gate_byo_call`.

Two refusal checks carry their stable `code` (CM-2b, ADR-CM B-5; CM-2a, MONARK C-8):
- **`gate_retired_call`** POSTs the retired class `btc-dir-15m` and asserts `400`, `error === "tool_error"` and
  `code === "task_class_retired"`.
- **`gate_future_call`** POSTs the `gate_call` body with `produced_at` in 2099 and asserts `400`,
  `error === "tool_error"` and `code === "produced_at_future"`.

Against a process that still serves the EMPTY liq registry (any SHA before the U-4b-2b switch window, e.g. `bb41b6d`),
`gate_liq_call` and `mcp_gate_description_liq` are RED by design: that surface is exactly vector alpha-2b of
`test/verify-harness-liq.test.ts` (its response body hashes to the `gate_liq_call` sha256 of the CA recorded at
`bb41b6d`). Against a process older than U-4b-2a, both liq calls are a 400 (unknown task_class). And the TLS
certificate (issuer, expiry) of **every host it contacts**: `tls` for the `api.` host and `tls_mcp` for the `mcp.` host,
each a real handshake on its own port (G2 of T0-TOOLING-1, review m-f: the MCP checks reach `mcp.` by its own name, so
its certificate is checked too). It prints the **conformity attestation** (URL, timestamp, per-check sha256, TLS
blocks) and writes it to the `--out` file **only when every check passed AND both hosts passed an authorized
handshake** (T0-TOOLING-1), through `<out>.tmp` and a rename (an interruption never leaves a torn CA). Otherwise the
`--out` file stays as it was (the last green CA): a red run exits **1** and writes `<out>.failed`; a green run on an
`http` target (TLS not checked, a local pass) exits 0 and writes `<out>.local`. Both side records are ignored by git at
the CA path, refused by the public export anywhere, and removed by the next green run. Every request and handshake is
bounded by `--timeout <ms>` (default 10000); a timeout is a failed check. It sets `process.exitCode` and returns; since
U-4b-2b the exit is discriminating under win32 too, item O-1b-G2-1. An unknown, repeated or empty option, or an option
without its value (`--output`, a bare `--out`, `--out ""`, `--out` twice), is refused by name with exit **2** before
any request. Keep the `--out` file as the CA.

**Deploy reserves — the green gate (Lot H6).** The deploy is GREEN only when BOTH hold:
- the command **exits 0** AND its stderr prints `VERIFY OK — all checks passed` (15 of 15 checks; the CA's `checks` array lists them all, each `ok: true`). Treat ANY non-zero exit as RED and
  read the JSON `checks` array to find the failing check (on Windows an unavailable interpreter can surface as exit
  `127` — still RED, never a pass); and
- on the first real **https** run, the CA's `tls.authorized === true` and `tls_mcp.authorized === true` (genuine
  handshakes to the live certs, not merely "fetch didn't throw"). An http/local target reports `skipped`, never writes
  `--out` and does NOT satisfy the go-live gate.

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

## Retire a kata row (ENGINE-ROW-RETIRE-PATH-1)

A served kata row is retired "at the next table version" (ADR 0006 D6, `recherches:decisions/0006-ADR-draft-wave2.md`
l.189): a new dated directory of the public spec repository carries the whole table of the row's class, the row
`retired`, and the retire list in force; no published file is ever rewritten or withdrawn. This section is the procedure
of record (item RETIRE-RUNBOOK-1, written 2026-10-07). Each command is quoted from the file and line cited next to it; a
step that has no command in the repository says so and names its item. The instants T_a to T_g are those of
`scripts/retire-latency.mjs` (l.15-23): each is a UTC instant to the second, `YYYY-MM-DDTHH:MM:SSZ` (l.25, l.47), read
where its step says, with `date -u` unless the step names another source.

**State at `07b7fc20`, unchanged at `c318aa54` (read it before acting).** No step can retire a served row yet; until the
loader of E-2a is merged, this section is the procedure of the rehearsal (RETIRE-LATENCY-REHEARSAL-1, in a sandbox) and of
the first cycle of E-2a.
- The 32 kata tables are served with no row (`apps/harness/src/kata-path.ts` l.115-120), behind a tripwire that fails the
  load on the first kata row (l.122-129, called at `apps/harness/src/tools/gate.ts` l.1042); the HTTP and MCP entry points
  never pass other tables (`tools/gate.ts` l.873-875).
- No served path reads a retire list: `guardKataTable` (`apps/harness/src/policy-guard.ts`) reads the chain of lists in
  tests only (item RETIRE-LISTS-E2A-PIPE-1).
- `recompute_held` refuses every row that carries a recompute until the list of verifiers is published
  (`scripts/spec-publish.mjs` l.288-297; VERIFIERS-LIST-F5A-1): no calibrated kata row is publishable yet.
- While no served table changes, the writer of step 3 refuses: "every served table is the file of its directory: no dated
  version to write" (`scripts/spec-policy-tables.mjs` l.173, exit 1).

**Order.** Each step starts once the previous one succeeded. The dated directory is published (step 4, T_d) before the
harness pull request is merged (step 5, T_e): the served `policy_table_sha256` of a class is the sha256 of its published
file (`scripts/spec-policy-tables.mjs` l.10-11), so no table is served before it is published.

### 1. Trigger (T_a)

- **`live:<k>`**: the binomial rule fired on the closed quarter Q_k (ADR 0006 addendum 9, points 1 to 6). T_a is the close
  of the quarter, 00:00 UTC of the first day after it (`scripts/retire-latency.mjs` l.16): `2027-01-01T00:00:00Z` for
  `live:1`. No list names `live:<k>` before that day (`apps/harness/src/policy-retire.ts` l.80), and none is publishable
  before RETIRE-CAUSE-VOCAB-1: the vocabulary gate of the spec repository refuses the word in the row's
  `retired: live:<k>` (`docs/G0-lot-retire-path-rb.md` l.31-35).
- **`adr:decisions/<file>.md`**: a dated line of a decision file of `recherches` retires the row; the file is checked by
  form only (RETIRE-ADR-CAUSE-FILE-1). T_a is the date of that line (l.16), taken as an instant: the committer date of the
  commit that adds the line, `git log -1 --format=%cI <commit>`, in UTC, never the author date (Q-RL-3 of the G0).

### 2. The retire list (T_b)

- **Where**: `apps/harness/data/kata/retire/retire-<YYYY-MM-DD>.json`, the list's date in its bare name
  (`scripts/spec-policy-tables.mjs` l.25; `apps/harness/src/policy-retire.ts` l.4, l.62-64).
- **Format `kata-retire-v1`**: one canonical JSON line, sorted keys, no space, UTF-8, no final newline (`policy-retire.ts`
  l.40-49; `canonicalJson` of `scripts/spec-publish.mjs` l.80-90 writes it); top keys `entries` and `format` (l.65); entries
  sorted by (`task_class`, `cell_key`), no cell twice (l.67-70); each entry holds exactly `calib_attempt`, `cause`,
  `cell_key`, `evidence_sha256`, `k_test`, `n_test`, `task_class` and `u_test` (l.27-30).
- **Rules** (l.71-81): the entry names a cell of the registry, at its current attempt, with status `region`; a `live:<k>`
  entry carries `n_test` >= 1, `k_test` <= `n_test`, `u_test`, `n_test` within `LIVE_N_MAX` (2 208 at 1h, 552 at 4h:
  `apps/harness/src/policy-wave2.ts` l.16) and a quarter that ends at or before the list's date; an `adr:` entry carries no
  count. `evidence_sha256` is checked by form only (RETIRE-EVIDENCE-BIND-1).
- **Cumulative**: a list is dated after the previous one and carries each of its entries unchanged (l.82-83). Once a list
  is merged its entries are permanent: a retired row stays current until a child row (`calib_attempt` + 1) supersedes it
  (CONTRACT 1.1.0 l.441, l.446-447). Before the merge, a wrong list on the lot branch is fixed by a new commit there.
- No command writes or checks a list: its reader runs inside the guard, in tests (RETIRE-LISTS-E2A-PIPE-1; a writer is
  item RETIRE-LIST-WRITER-1 of the G0).
- Commit the list alone, on the lot branch. **T_b** = the committer date of that commit (`git log -1 --format=%cI`), in UTC.

### 3. The dated table version and its release entry (T_c)

```bash
node scripts/spec-policy-tables.mjs --write --date <YYYY-MM-DD>   # scripts/spec-policy-tables.mjs l.4, l.101, l.127-131
node scripts/spec-policy-tables.mjs --check                       # l.4, l.14: exit 1 on any difference of the whole tree
```

- The date is the UTC day of the release; it names `spec/contract-1.1.0-tables-<date>/` (`datedDir`, l.152-156).
- The writer writes, whole and canonical, `policy/<task_class>.json` for each served table that differs from the file of
  its directory (l.165-171), and `retire/retire-<date>.json`, a canonical copy of the list in force (the last
  `retire-<day>.json` with a day at or before the date, l.158-163), when a written table holds a retired row (l.172-175).
  The copy takes the directory's date even when the list in force is older (l.175; RETIRE-HEADER-WORDING-1).
- It prints the `governance` entries of the release, one line each, pinned by sha256 (l.188-193), then checks the whole
  tree: exit 0 iff no difference (l.107-110).
- Refused, exit 1, nothing written: a date that is no real day (l.153-154); a later dated directory (l.168-169); no
  served table changed (l.173); a retired row with no list in force (l.174); a dated directory that exists already
  (l.183-184). `--check --date` is a usage error, exit 2 (l.100-102); `--write` without a date never writes into a dated
  directory (l.210-217).
- **Release entry**, in `scripts/spec-publish-inputs.json` (format `spec-inputs-v1`, `scripts/spec-publish.mjs`
  l.52-71): a release named as its directory, `contract-1.1.0-tables-<date>` (a release writes under its own directory
  only, l.150-152, l.201), holding `previous_commit`, the full head of the spec repository as published (40 hex, l.59); the
  `governance` lines printed above, verbatim; and one `"root": "previous"` line per file of the previous release, its path
  equal to its output, with its kind and sha256 (a file left out is `withdrawn`, l.203). `VERSION` and `MANIFEST.sha256`
  are produced, never declared (l.35, l.62). No command writes the carried lines yet (SPEC-DATED-RELEASE-ENTRY-1).
- Commit the dated directory and the release entry together. **T_c** = the UTC instant the CI of the lot is green on
  that commit. Until their items land, two tests redden by construction on the first dated directory and its release:
  `published_tables_are_the_served_tables_byte_for_byte` reads `contract-1.1.0/` only (SPEC-TABLES-TEST-PER-DIR-1), and
  `srf_runbook_vitrine_t0_order` takes the last release of `scripts/spec-publish-inputs.json` for the release of T0
  (`test/surfaces-1-1-0.test.ts` l.231, l.234; item T0-ORDER-TEST-RELEASE-NAME-1 of the G0).

### 4. Publication of the dated directory (T_d)

```bash
node scripts/spec-publish.mjs --release contract-1.1.0-tables-<YYYY-MM-DD> --date <YYYY-MM-DD> --out <dir> --root previous=<spec@previous_commit>
```

- `scripts/spec-publish.mjs` l.4, in the shape of act 8 of T0 (`docs/RUNBOOK-vitrine.md` l.49); the `governance` root is
  this repository (l.269). `<dir>` is absent or empty, outside any git tree (l.6, l.236-238). `<spec@previous_commit>` is
  a clean clone of the spec repository at `previous_commit` (l.196-197).
- Line ends: two trees are read as files, so a checkout under `core.autocrlf=true` changes their bytes. The governance tree
  (this repository) is read by `readFileSync` (l.185): at T0 such a checkout was refused, `input_digest`
  (`docs/JOURNAL-PROVENANCE.md` l.446). The `--verify` clone is compared byte for byte by `compareTrees` (l.222-226): it
  reads `DIFFERENT`, exit 1. Make both with `git -c core.autocrlf=false`. The `previous` clone is read from git objects
  (l.178), never from its files: line-end conversion does not reach it.
- Every refusal is named by its code and nothing is written (l.14-21): among them `retire_list_missing` and
  `retire_list_invalid` (a retired row is published from a dated directory, with its own list or a carried one,
  l.303-321), `rewritten`, `withdrawn`, `added_to_published`, `foreign_version_dir` (l.198-207), `vocabulary`,
  `recompute_held` and `short_digest`.
- The script never publishes (l.11). MONARK copies `<dir>` into a clean clone of the spec repository, commits and pushes,
  as at act 8 of T0 (`docs/JOURNAL-PROVENANCE.md` l.446). **T_d** = the UTC instant the push returns. Then the same
  command, with a new empty `--out` and `--verify <fresh clone>`, exits 0 iff the published tree holds the same paths with
  the same bytes (l.22, l.272-276).

### 5. The harness pull request, merged (T_e)

- The lot's pull request carries the list (step 2), the dated directory and its release entry (step 3). The orchestrator
  merges it after T_d, never before, under the gates of its part (`docs/methode/REGLES-MISSION.md` l.20). **T_e** = the
  committer date of the merge commit (`git log -1 --format=%cI`), in UTC.
- Deploy only a merged commit whose CI is green and on which `node scripts/spec-policy-tables.mjs --check` exits 0 (l.14):
  every served table is then the file of its published directory.
- If the merge fails after T_d (a conflict, a red CI), the published directory stays as it is: never rewrite nor withdraw
  it (step 9). Fix the lot branch on the trunk with the dated directory byte for byte as published (the `--verify` of
  step 4 again, exit 0), then merge; T_e is that merge. A table that must change is a new dated directory at a later date.

### 6. Deployment (T_f)

- Ship the merged commit of step 5 (green, `--check` exit 0) and restart, as §1 and *Update* (Operations) say, then run §6:
  `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json` (this file, l.162), green only under the gate of
  l.213-219. **T_f** = the `checked_at` of that green record (`scripts/verify-harness.mjs` l.421), cut to the second: it
  carries milliseconds, and `scripts/retire-latency.mjs` takes none (l.25).
- The site data is bound to the committed record (`test/harness-served.test.ts` l.212-215): committing the new record
  brings acts 3 to 7 of the order of T0 (`docs/RUNBOOK-vitrine.md` l.44-48), after T_g.

### 7. Probe of the first served verdict (T_g)

- The probe shows a `gate` call on the class answered with a verdict whose `policy_table_sha256` is the sha256 of
  `spec/contract-1.1.0-tables-<date>/policy/<task_class>.json`: every kata verdict carries the digest of its class's table
  (`apps/harness/src/kata-path.ts` l.78, l.111), and the file's sha256 is that digest (`scripts/spec-policy-tables.mjs`
  l.10-11). On the retired cell the reason is `calib_retired` (`kata-path.ts` l.38, l.84-94).
- A kata call is accepted only with a `produced_at` on the grid of the class's horizon (`kata-path.ts` l.46) and within
  300 s of the server clock: a `produced_at` more than 300 s in the past is `produced_at_stale` (`kata-path.ts` l.47), one
  more than 300 s in the future is `produced_at_future` (the test at `apps/harness/src/tools/gate.ts` l.885; 300 s,
  l.212). The probe has a window of ten minutes around each grid instant, and may wait up to an hour on a 1h class, four
  hours on a 4h class.
- On a scale class the probe's `yhat` lies in the row's `calib_support`: `out_of_support` (`kata-path.ts` l.93) is tested
  before `calib_retired` (l.94) and would hide it.

```bash
node scripts/retire-probe.mjs --api <url> --table spec/contract-1.1.0-tables-<YYYY-MM-DD>/policy/<task_class>.json --cell <cell_key> --api-host <api. name>
```

- `scripts/retire-probe.mjs` (item RETIRE-PROBE-1) builds the call from the table file, waits until its clock is within
  240 s of a grid instant (`--max-wait`, 4 h by default), makes one call and prints the record `retire-probe-v1`. Exit 0
  iff the verdict is a 200 of that cell, with the file's sha256 and, on a retired row, `calib_retired`. Exit 1 names the
  refusal: `table_invalid`, `cell_invalid`, `wait_exceeds_max`, `window_missed`, `transport_failed`, `not_served`,
  `cell_mismatch`, `digest_mismatch` or `reason_mismatch`. Exit 2: usage. **T_g** = its `received_at`, the UTC second the
  verdict arrived.

### 8. The latency report

- Write the input, in the closed format `retire-latency-v1` (`scripts/retire-latency.mjs` l.9-10, l.41-44):

```json
{"format": "retire-latency-v1", "cycle": "rehearsal", "instants": {"T_a": "YYYY-MM-DDTHH:MM:SSZ", "T_b": "YYYY-MM-DDTHH:MM:SSZ", "T_c": "YYYY-MM-DDTHH:MM:SSZ", "T_d": "YYYY-MM-DDTHH:MM:SSZ", "T_e": "YYYY-MM-DDTHH:MM:SSZ", "T_f": "YYYY-MM-DDTHH:MM:SSZ", "T_g": "YYYY-MM-DDTHH:MM:SSZ"}, "mention": null}
```

  `cycle` is `rehearsal` or `real`; `mention` is `null`, or where an overrun of the 14-day ceiling is written down
  (l.51-52). AFTER #218 (RETIRE-REAL-CYCLE-SCOPE-1, not merged at the base of this text): `cycle` may be `publication`,
  T_c to T_g only, no ceiling; T_a or T_b in it is refused, `instant_out_of_cycle`.
- Or assemble it from the evidence: `node scripts/retire-instants.mjs <evidence.json> > <instants.json>` (item
  RETIRE-INSTANTS-1). Each instant names its source: a full commit sha and its repository (T_a, T_b, T_e: the committer
  date), a clock reading (T_c, T_d; T_a of `live:<k>`), the green record of step 6 (T_f) or the probe's record (T_g).
  Exit 1 names the refusal: `evidence_invalid`, `source_unreadable`, `source_not_green`, or one of the report's below.
- Run it:

```bash
node scripts/retire-latency.mjs <instants.json>   # scripts/retire-latency.mjs l.4
```

  Exit 0 prints the closed report, then a line `retire-latency OK: …` (l.66-68). Exit 1 names the refusal:
  `format_invalid`, `instant_missing`, `order_not_monotone` or `ceiling_unmentioned` (l.10-12, l.70-72). Exit 2: usage
  (l.62). The objective of 3 business days (Monday to Friday, UTC, no holiday calendar) is reported, never blocking
  (l.7-8, l.57).
- Log a dated line in `docs/JOURNAL-PROVENANCE.md`: the cycle, the seven instants with the source of each, the input file
  and its sha256, the report's `total_ms`, ceiling and objective. ADR 0006 D6 stays open until a rehearsal and a real
  cycle are both in the journal (`docs/G0-lot-retire-path-rb.md` l.71; `docs/G7-lot-retire-path-rb.md` l.46).

### 9. Redo a dated directory before its publication

The writer never rewrites a dated directory, whatever the option, its own date included: "to redo it before its
publication, remove it with git, then write it again" (`scripts/spec-policy-tables.mjs` l.184; without a date,
l.210-217). Before T_d only:
- written, not committed (untracked): `git clean -n -d -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/` lists what goes,
  then `git clean -f -d -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/` removes it;
- written and staged (`git add`), not committed: `git clean` lists nothing and `git rm -r` refuses ("changes staged in
  the index"). Unstage it, `git restore --staged -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/`, then treat it as
  untracked (`git clean -n`, then `-f`), which lists what goes before it goes; `git rm -r -f` would delete it unlisted;
- committed on the lot branch, not merged: `git rm -r -- spec/contract-1.1.0-tables-<YYYY-MM-DD>` and the release entry
  of that directory out of `scripts/spec-publish-inputs.json`, in one commit;

then step 3 again, which gives a new T_c. These git commands are the one act of this section that no script prints
(default of Q-RL-4 of the G0; item RETIRE-REDO-MESSAGE-1). After T_d, never: a published file is never rewritten nor
withdrawn (`rewritten`, `withdrawn`: `scripts/spec-publish.mjs` l.203, l.207); a correction is a new dated directory at
a later date (`scripts/spec-policy-tables.mjs` l.168-169).
