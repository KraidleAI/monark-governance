# PLI — Lot CRA-B (worker fold)

Worker: **`claude-opus-4-8`** (1M context, effort max) — R-1 resolution control: exact id
`claude-opus-4-8[1m]`, prefix `claude-opus-4-8` (the pinned, non-banned worker model; Opus 5 banned).
Date: 2026-09-19/20. Base: `lot/cra-b`, HEAD `627113c`, worktree `F:\Monark-wt-crab`. No commit, no workflow
(R-20). Scratch: `F:\tmp\cra-b\`. Cahier: `docs/G0-lot-cra-b.md` + checkpoint-1 amendment C-1..C-10 +
investor decisions 42-43 (mid-mission course correction, folded).

## Scope delivered (full lot — investor reply folded)

Investor decisions 42-43 (2026-09-19) unblocked L-1/L-2: (a) channel = GitHub Security Advisories only, no
e-mail; (b) 72 h acknowledgement, 90-day coordinated disclosure; (c) route B ratified. All "pending investor"
markers removed. Delivered: L-1 (full SECURITY.md), L-2 (procedure incl. channel), L-3 (SBOM in CI + script),
L-4 (product boundary), L-5 (no-personal-data statement + test), L-7 (ADR), C-2..C-9. Out of scope (unchanged):
L-6 template G6 (orchestrator, C-10), counsel opinion, route A, the `/security` site page.

## Files (sha256, LF-normalized)

New:
- `SECURITY.md` — `b94fe854bc0212b020852e6353bb51303621afaf9531f73828d5cde530fb2c78`
- `scripts/sbom.mjs` — `c6cb7f6fd24b0037a00b0326660d5c29448eec2e07fa684c742fae83bc78b610`
- `scripts/sbom.d.mts` — `8738b41207bd3cab37a497e9b86a7153faf0308469bf42edcaec3bbfab0c1f46`
- `test/cra-b.test.ts` — `c594b0207aafd5604994b5dbbd088b4250c9106ba10eefcc40bc57e9f08ddcef`
- `docs/PROCEDURE-notification-CRA.md` — `adf32530f994f3b17363d6fc204aced1a1d81e0d9f761e8955b71f7ac24d7813`
- `docs/PRODUCT-BOUNDARY.md` — `2cca3ff3abf8d2c412975ca3dfc68ff1e8d38f06ace073b6a158ad158c56c134`
- `docs/adr/ADR-CRA-B.md` — `94bc96b1cbdf7b05f2d224c9c49bba63740b2f0a02aa720d5c6a40a5af6473eb`

Edited:
- `scripts/export-public.mjs` — `a9e0c95ae2fba22e9b1bace6b42703153b7ad912f20cfd873cc403f79c34c9ba` (SECURITY.md -> WHITELIST_FILES)
- `scripts/export-public.d.mts` — `757b391f456a0336131e687ad55fe4702349f2c063a00d032d26287f3f855e5f` (WHITELIST_FILES decl)
- `scripts/lang-gate.d.mts` — `83c1a3bf8326f5d3c9db11c9ac3217e8836bdf82a5a2ef2fa48ec36daf279286` (scanFile/loadExempt decls)
- `.github/workflows/ci.yml` — `7c12580426ea8d03690dcc55ad5f7179b41e1c178141a16670ce4f08992c0604` (g6 SBOM steps + provenance)
- `test/public-surfaces-honesty.test.ts` — `de54c0f4c76364bfafa592f841ede8bc17d04607c88086a62c7b03aeb07a076a` (surfaces() += SECURITY.md, C-2)
- `README.md` — `7f9f84a4d853dae09636bd9c9373f92d3e5ce2f1c3d5b72378c6abb3b8b8da50` (L-5 sentence)
- `.gitignore` — `10934d0974c7ebeca68246e7135674befe7995998bbe7b81dda0a7dc371d9ac0` (sbom.cdx.json)
- `docs/adr/ADR-M004-infrastructure-plateforme.md` — `b6ed7d5847a0452d8a11f10d830ac5f97654245e2d411a5334e880b21114fe9b` (D7 quinquies)

## Measurements (reproducible)

- **PVR**: `gh api repos/KraidleAI/Monark/private-vulnerability-reporting` -> `{"enabled":true}` (2026-09-19,
  gh authenticated as `Kraidle`, scopes repo/workflow). GitHub Security Advisories is available as the channel.
- **upload-artifact SHA**: `gh api repos/actions/upload-artifact/git/ref/tags/v7.0.1` -> `object.type=commit`,
  `object.sha=043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` (2026-09-19). Matches checkpoint-1 C-3. Pinned in
  `ci.yml` with a provenance comment. All 9 `uses:` in the workflow are 40-hex (test 38 stays green).
- **npm sbom**: `npm sbom --sbom-format cyclonedx --omit dev --package-lock-only` (local npm **11.12.1**) ->
  exit 0, no stderr, `bomFormat=CycloneDX`, `specVersion=1.5`, **183 components** (matches C-3; without
  `--package-lock-only` = 153, environment drift). `scripts/sbom.mjs --out …` reproduces it (183 components).
  Determinism honesty: the COMPONENT SET is reproducible; the BYTES are not — `serialNumber` is a fresh
  `urn:uuid` and `metadata.timestamp` is wall-clock per run; `metadata.component.name` is the checkout dir
  (`Monark-wt-crab` local, `Monark` in CI). **CI-bundled npm (setup-node@24) version not measured** — stated
  as such (C-3). `sbom.cdx.json` is `.gitignore`d — never in the tree (local writes to `F:\tmp\cra-b\`).
- **Article 14 clocks [lu]**: read in the primary EUR-Lex text `cra-2024-2847-EN.txt` (procurement 2 of the
  audit, sha-pinned in `SOURCES-sha256-reglementaire.txt`): 24 h / 72 h / 14 days (Art. 14(2), lines
  2361-2372) and 24 h / 72 h / one month (Art. 14(4), lines 2393-2405). Upgrades the procedure's clocks from
  [2nd]/[audit] to my own [lu].

## Tests (base + 6) and mutants

Final `npm run ci`: gate:vocab clean, typecheck clean, **383 tests / 383 pass / 0 fail** => **base = 377**.
Corroboration (two direct measurements, not one subtraction): `test/cra-b.test.ts` run alone = 6 tests
(6 plain `test()`, no subtests); the full suite = 383; the only other touched test file
(`public-surfaces-honesty.test.ts`, surfaces() edit) keeps its 2 tests unchanged; no `test()` added anywhere
else. So base = 383 − 6 = 377. (`git grep` cannot corroborate by delta here: `cra-b.test.ts` is untracked, so
`git grep` on the working tree does not see it — noted, not hidden.) The heavy
`export_public_no_governance_no_french` (test 42, nested `npm ci && npm run ci` in the export, ~31.7 s) and
`serverInfo_version` (server test, no port collision) both ran green; SECURITY.md in the whitelist did not
perturb the export.

Six new root tests in `test/cra-b.test.ts`, each with a named mutant proved on a **working-tree copy**
(robocopy, `node_modules` junction — `git archive` would be pre-lot since nothing is committed, so a
working-tree copy was used) + restoration proof (real files sha256 unchanged, `sha256sum -c` OK; the copy was
mutated, never the real tree). Each mutant reds exactly its intended test (pass 5 / fail 1), then the copy
restores to 6/6:

| Test (deliverable) | Mutant (on the copy) | Result |
|---|---|---|
| `ci_publishes_sbom` (C-5/L-3) | SBOM run line -> `run: echo` | reds ci_publishes_sbom |
| `product_boundary_matches_export_list` (L-4/C-2) | drop `"SECURITY.md"` from WHITELIST_FILES | reds product_boundary (collectFiles.kept) |
| `no_personal_data_fields_in_served_schemas` (L-5/C-7) | inject an `ip` property key into a copied `schemas/*.json` | reds no_personal_data |
| `cra_surfaces_stay_conditional` (C-6) | add `MONARK is in scope.` to SECURITY.md | reds cra_surfaces |
| `notification_procedure_declares_clocks` (C-4) — lang leg | add a French sentence to the procedure | reds notification (real lang oracle) |
| `notification_procedure_declares_clocks` (C-4) — clock leg | `s/72 h/7 days/g` in the procedure | reds notification (clock assertion) |
| `security_policy_present_and_closed` (L-1) | delete the `## Reporting` section from SECURITY.md | reds security_policy |

The clock test has TWO run mutants (both executed): the French-word mutant (lang leg) and the C-4-named
`72 h → 7 days` mutant. `72 h` appears twice (both Article 14 tracks), so the clock mutant is a GLOBAL replace
(a single-occurrence change would leave the other and not red — stated, not hidden). The C-6 scrub mirrors
`public_surfaces_make_no_probative_claim`: negation-aware + a CLOSED licit mask for the one conditional span
`if MONARK is in scope as a manufacturer`; a bare `MONARK is in scope` reds.

## Oracle results (all green)

- `npm run ci` = 383/383 pass, gate:vocab + typecheck clean (single full run). SECURITY.md §Data was refined
  AFTER that run (see below); the only tests reading SECURITY.md — `cra_surfaces_stay_conditional`,
  `no_personal_data_fields_in_served_schemas`, `security_policy_present_and_closed`,
  `public_surfaces_make_no_probative_claim` — were re-run alone afterwards, all green (no other test reads it,
  so no second full run was needed).
- `npm run lint` = exit 0.
- `npm run lint:ratchet` = **69/69** (my TS added zero deferred-typing violations; JSON.parse cast to `unknown`).
- `npm run lang:gate` = 0 non-exempt French hits in all 12 scopes (global now green).
- `npm run export:check` = 0 forbidden path, 0 French hit (SECURITY.md whitelisted, English, kept).

## R-25

Under the exact `ci.yml` `STAT=` pathspec (working tree vs HEAD, `git add -N` then `git reset`, nothing
committed): **293 changed lines** (11 files, 292 insertions, 1 deletion; bound 400). `docs/**/*.md` excluded
(SECURITY.md at root, tests, scripts, ci.yml, .gitignore count). Breakdown: cra-b.test.ts 151, SECURITY.md 48,
sbom.mjs 40, ci.yml 14, lang-gate.d.mts 12, sbom.d.mts 9, export-public.mjs 6, public-surfaces 4/-1,
.gitignore 3, export-public.d.mts 3, README.md 2.

## L-5 census (grep `email|name|ip|user|address|phone` over apps/harness/src, apps/site, skills)

Every hit qualified NON-personal — no personal-data field is collected:

| Hit | Where | Qualification |
|---|---|---|
| `address` | apps/site token/CA-copy, narabi-* | blockchain **contract address** / zero address / USDe address (onchain identifier) |
| `name` | harness http.ts, server.ts, tools/registry.ts, gate.ts, SKILL.md | operation / server / tool / **variable** name — never a person |
| `security` | server.ts comment | the word "security", not a field |
| (no `email`, `phone`, `user_id`, personal `address`, personal `name`, `ip` field anywhere) | | |

Schemas: `schemas/*.json` + the 8 projected `*_SCHEMA` (schema-projection.ts) carry no
`email|phone|address|ip|user_id` key (whole-key equality; `description` never matches `ip`).

**Caddy access log — corrected (advisor / primary source).** `deploy/Caddyfile` sets `format json` with
`roll_size 10MiB` / `roll_keep 5` / `roll_keep_for 720h`, inside a COMMENTED block documenting the 2026-09-18
deployment. The block's prose comment ("Route + host + method + status only … no query string") is the
deployer's INTENT, NOT what the directive implements: `format json` is not field-restricted, so it emits
Caddy's full default field set (including the client address, and the query string inside `request.uri`).
SECURITY.md §Data now states this honestly — "Caddy's JSON access log format … not field-restricted, so the
log includes the client address; no request body is logged … nothing retained beyond [720 h]" — it never
claims "route/host/method/status only" (a field-restriction the config does not set) and never claims "no IP
logged" (non-collection). The core L-5 claim — no personal data is REQUIRED (no account/e-mail/wallet) —
holds regardless. **Formed item (deployment)**: if field restriction is actually wanted, the Caddy block needs
a `format filter` (the comment's intent) — flagged for the orchestrator; MONARK's honesty stance does not
depend on it. Site on Vercel: hosting stated; its logs not characterized.

## Formed items (zero debt, not bare dues)

1. **Test 42(f') — exported job bodies byte-identical to source** (ADR-M004 D7 ter): owed by "the first lot
   that touches `.github/workflows/ci.yml`". This lot touches ci.yml (g6 SBOM steps). I did NOT implement it
   (a 7th test beyond the mission's closed base+6 scope; the D7-ter owner is not assigned to CRA-B). It is NOT
   violated: my edit adds steps to g6 only (g1/g3/g4 bodies untouched), and `derivePublicWorkflow` rewrites
   only `on:` / the r25 job / the header / the "Delivery flow" comment — none inside g6 — so the derived g6
   body is byte-identical to source by construction; test 42 (`export_public_no_governance_no_french`) is
   green. **Trigger for the orchestrator**: implement 42(f') here (small, mirrors 42(f); +1 test, +~20 R-25)
   or reaffirm the D7-ter owner.
2. **ISO/IEC 29147:2018** (coordinated disclosure) — NOT read (paywalled ISO standard). Named in SECURITY.md
   and ADR-CRA-B as the framework the 72 h / 90-day windows align with; **no number is attributed to it** (the
   windows are the maintainer's committed policy, investor decision 43). **Procurement (docs 03)**: if a
   verbatim citation of 29147's coordinated-disclosure process is required, acquire ISO/IEC 29147:2018 (ISO,
   list ~CHF 200; identity ISO/IEC 29147:2018 "Information technology — Vulnerability disclosure"; usage: cite
   the disclosure-process clause). Formed with trigger.
3. **Caddy `format filter`** (deployment) — see the L-5 census above: the Caddyfile comment's field
   restriction is not implemented by `format json`. Item for the orchestrator/deployment, not a blocker for
   this lot's honesty.

## Reste (honest)

- The heavy export test in `npm run ci` runs a nested `npm ci && npm run ci` in the export (~31.7 s) — inherent
  to the repo (CA-X), unchanged by this lot.
- `cra_surfaces_stay_conditional` is negation-aware (mission), so it asserts `MONARK is not in scope` stays
  GREEN. Doctrinally, asserting NON-applicability is also forbidden (G0 objective: assert neither). This is
  NOT caught mechanically — it is a G2 review item. My artefacts do not assert non-applicability: SECURITY.md
  says it "makes no statement about whether any specific regulation applies", and the procedure is conditional
  ("if MONARK is in scope as a manufacturer"), never "not in scope".
- `deploy/Caddyfile` access-log block is COMMENTED (deployment documentation); I did not measure the live VPS
  log — the SECURITY.md statement is grounded in the file's directive (`format json` + rotation), reproducible
  by reading `deploy/Caddyfile`.
- Adversarial verification (R-21) and G2/G7 remain with the orchestrator; I did not commit (R-20).

## Annexe — Pli CRA-B-2 (G2 fold, closed list C-G2-1..3)

Worker: **`claude-opus-4-8`** (1M context, effort max) — R-1 resolution control: exact id
`claude-opus-4-8[1m]`, prefix `claude-opus-4-8` (pinned, non-banned; Opus 5 banned). Date: 2026-09-20.
Base `lot/cra-b` HEAD `849e2c9` (G2 freeze). No commit, no workflow (R-20). Scratch `F:/tmp/cra-b-2/`
(nothing on C:). Folds the three closed corrections of `docs/G2-lot-cra-b.md` (`error_origin: worker`,
carried from G2). Touched set = EXACTLY `SECURITY.md`, `docs/PRODUCT-BOUNDARY.md`,
`test/public-surfaces-honesty.test.ts`, and this file.

**Supersession (audit trail; body left verbatim).** The L-5 census line above — "Site on Vercel: hosting
stated; its logs not characterized." — is SUPERSEDED by C-G2-1: the storefront is NOT on Vercel. Sources of
truth: `docs/BASCULEMENT-COMPTE.md:34` ("site sur VPS, pas Vercel") and `deploy/Caddyfile.monark-narabi.snippet`
+ `deploy/Caddyfile.monark-harness:2-3,11` (vitrine `monarkgate.tech` + www -> localhost:3000, live on the SAME
VPS as the harness). No `vercel.json` in the tree. The PLI body is not rewritten; this annex is the correction
of record.

### Corrections
- **C-G2-1** — `SECURITY.md` §Data final sentence and `docs/PRODUCT-BOUNDARY.md:8` no longer say "Vercel".
  Option (a') (G2-licit: "restore ... or remove"): real hosting restored AND the vitrine's own access log
  stated, so §Data carries no omission (the narabi snippet log block is an uncommented directive; its insertion on the live VPS is not measured here, same file-grounded posture as the harness block, PLI 'Reste'). Clause -> source:

  | clause (SECURITY.md) | source (only what the file says) |
  |---|---|
  | served on the same VPS behind Caddy | `BASCULEMENT-COMPTE.md:34`; `Caddyfile.monark-harness:2-3` (vitrine block live), `:11` ("SAME VPS as the vitrine") |
  | its site block carries the same JSON access log format and rotation (10 MiB x 5, 720 h), nothing shipped | `Caddyfile.monark-narabi.snippet:16-27` (`format json`, `roll_size 10MiB`, `roll_keep 5`, `roll_keep_for 720h`; comment: "no IP is kept ... (5 files, 30 days); nothing is shipped anywhere") |

- **C-G2-3** — `SECURITY.md:44` path `deploy/Caddyfile` -> `deploy/Caddyfile.monark-harness` (that file `:26-36`
  IS the 2026-09-18 commented JSON log block §Data describes).
- **C-G2-2** — `test/public-surfaces-honesty.test.ts`: +1 membership assertion inside
  `public_surfaces_make_no_probative_claim`: `assert.ok(files.includes(join(ROOT, "SECURITY.md")), ...)`. Closes
  the tuyau ADR-CRA-B declared but G2 found unproven (MG2 survived).

### sha256 (LF-normalized: `tr -d '\r' < f | sha256sum`), before -> after
| file | before (PLI/G2) | after |
|---|---|---|
| `SECURITY.md` | `b94fe854bc0212b020852e6353bb51303621afaf9531f73828d5cde530fb2c78` | `429ac43ffb6f954d10da504515a767634ca46ff24a2f7e41124a763fbd88b596` |
| `docs/PRODUCT-BOUNDARY.md` | `2cca3ff3abf8d2c412975ca3dfc68ff1e8d38f06ace073b6a158ad158c56c134` | `f87976ba3d8e957c449609361fb2a547b60b2a2e244c109dd8c2875e77f21148` |
| `test/public-surfaces-honesty.test.ts` | `de54c0f4c76364bfafa592f841ede8bc17d04607c88086a62c7b03aeb07a076a` | `0d10f1927514b7bc9b0ee39ff2b4cee30860c1018094f0ca1ac71ba0912ede78` |

### MG2 (replay; sha-exact restoration)
MG2 = drop `SECURITY.md` from `surfaces()` (line 83 -> `[join(ROOT, "README.md")]`), replayed on the real file
with a durable backup in `F:/tmp/cra-b-2/`. Result: `public_surfaces_make_no_probative_claim` REDS (exit 1;
pass 1 / fail 1) with `AssertionError: SECURITY.md must be a scanned public surface (surfaces(); MG2)`; the
sibling scrub test stays green. Restored from backup -> LF-sha256 `0d10f1927514b7bc9b0ee39ff2b4cee30860c1018094f0ca1ac71ba0912ede78` (sha-exact). Before C-G2-2, MG2 survived (G2 table); it now reds exactly its target.

### Oracles (partial set; full `npm run ci` withheld — Bell -b1 running), scratch on F:
`typecheck` 0 · `test/cra-b.test.ts` 6/6 · `test/public-surfaces-honesty.test.ts` 2/2 · `lint` 0 ·
`lint:ratchet` 69/69 · `lang:gate` 0 (12 scopes) · `export:check` 0 forbidden / 0 French.

### R-25 (STAT pathspec, `627113c` .. worktree; gate CHANGED = ins + del)
**297** (296 insertions, 1 deletion; bound 400) = baseline 293 + 4. Counted delta: `SECURITY.md` 48 -> 50 ins
(+2: C-G2-1 real hosting + vitrine-log clause, C-G2-3 path); `test/public-surfaces-honesty.test.ts` 4/-1 ->
6/-1 (+2: C-G2-2). `docs/PRODUCT-BOUNDARY.md` and this annex are `docs/**/*.md` (excluded). vs "~296": +1 is
option (a') (extra vitrine-log clause) rather than removing the hosting characterization; both were G2-licit.

R-20/R-21: no commit, no workflow; adversarial verification, `error_origin`, and the G7 verdict remain with the
orchestrator.
