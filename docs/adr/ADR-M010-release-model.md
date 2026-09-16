# ADR-M010 — Release model of the public mirror (tags + GitHub Releases)

> **Status** : **ACCEPTED-WITH-CORRECTIONS** (2026-09-16) — G0 written 2026-09-16, then the
> checkpoint-1 validateur returned **ACCEPTE-AVEC-CORRECTIONS** (blocking B-1..B-7, notes N-1..N-7).
> This revision folds them. No lot-4 code is committed before this amended ADR lands on `lot-m010`.
> **Number** : M010 (M009 is **reserved for ACI**, cf. ADR-M008 D8). **Attachment** : post-audit plan
> `docs/PLAN-post-audit-narabi-repo.md` lot 4 + investisseur rulings 2026-09-16 (repo model = Option 1).
> Committer seat `claude-opus-4-8` (Opus-seat exception). No line of code was written at G0.

## 1. Context
The public repo `KraidleAI/monark` is a **push-only mirror** of the private governance (Option 1
ratified): `scripts/release-public.mjs` regenerates the export and pushes "Public sync <ISO>" commits
— **no tag, no Release** (gh api 2026-09-16: 0 tag, 0 release). Consequence: a tweet or a community
link can today cite only a machine sync commit or `/commits/main` (mobile), the anti-pattern the
GitHub-Pro constitution proscribes ("a permalink that still resolves in 3 years"). The FR export block
(Shōgen fixtures) that stalled every sync is **already lifted** (commit 6d50158, `export:check` green
all scopes). The audit **refuted** a root `CHANGELOG.md` and a `SECURITY.md` (GH-01/GH-02): release
notes live on the **GitHub Release object**, not in a root file (persisted in §9 + G1, N-4).

## 2. Decision
1. **Tags + Releases on the mirror** : extend `release-public.mjs` so that, after the sync push, it
   (a) creates an **annotated tag** `v0.MINOR.PATCH` on the sync commit; (b) `gh release create` from
   the tag with **English release notes**; (c) tags the **governance SHA** of the same version
   (private↔public traceability) — that governance tag is **local-only, never pushed** (B-2).
2. **Notes = a required English `--notes <file>` argument**, stored on the Release object — **not** a
   root `CHANGELOG.md` (GH-01 refuted). **There is no free-text message argument** (`msgArg` deleted,
   B-3): the sync commit message stays fixed/generated; the only human free text is the notes file, and
   it is gated (§4).
3. **Cadence** : one tag **per lot that changes the public surface** (schema, tool description, skill,
   site), **never per sync**. `v0.1.0` = the **current** public state. **`v0.2.0` = F1 only** (investisseur
   ruling 2026-09-16, **supersedes** the earlier "`v0.2.0` = F1+F2" — see ADR-M008 §3 amendment): the
   AttestedFlow contract (the 5th additive typed contract = **minor** bump) + the velocity adapter + the
   `stable-run-velocity-24h` gate class, shipped **honestly `under_calib`** (synthetic fixtures declared;
   the gate **abstains by design** until a committed calibration lands) — **never labelled "V1"**.
   **`v0.3.0` = F2** (the committed msUSD split-conformal calibration; a clean, no-deadline lot). `1.0.0`
   = a **human** decision, never an agent (the schemas do not thaw).
4. **Version source of truth = the git tag**. `package.json` stays `0.0.0` / `private:true` (not npm
   published); `CONTRIBUTING.md` §Releases states it.
5. **PR template** : on the **governance** repo only (the mirror takes no PR — a PR merged on the mirror
   is reverted at the next sync); not whitelisted, never exported. Fields: attached ADR; frozen schema
   touched (y/n, default no); tool surface touched (y/n); G2 reviewer; test count before/after. **Without**
   Grok's tweet/hop fields.
6. **README** : Release badge + link to the latest Release (the CI + Apache badges are already posted,
   lot 3). Never a fake "coverage %".

## 3. Branch topology (B-1)
Lot-4 lands on **`lot-m010`, branched from `main` (3b9805a)** — **not** `lot-m008-f1`. Rationale: the
branch guard (§4) requires a clean `main`; the release tooling must therefore live **on `main`** (via a
`lot-m010` merge) **independently of F1**, so `v0.1.0` can sync from `main` **without** shipping the
AttestedFlow 5th contract (that ships as `v0.2.0`, §2.3).

The five doc/hygiene commits were cherry-picked in order onto `lot-m010`:
`c37fd29` → `1f14b9b` (**split**) → `d4d6644` → `6d50158` → `6b45a2a`. Verification: **none touches an F1
file** (`packages/monark/src/adapter-narabi.ts`, its test, `schemas/attested-flow.schema.json`, the
frozen-contracts manifest). `1f14b9b` was a **mixed** commit (lot-3 hygiene **+** F1 governance-doc
edits); it was **split** — only its `README.md` + `CONTRIBUTING.md` hunks were applied on `lot-m010`; its
`ADR-M008` D-Surface and `PLAN-m008-f2` §9 hunks **stay on `lot-m008-f1`** with F1. Those two files are
F1-only, absent from `main`, and **never exported** (`STRUCTURAL_BLACKLIST /^docs\/adr\//` +
`docs/PLAN-*` not whitelisted), so **`v0.1.0`'s public surface is byte-identical** with or without the
split — the checkpoint-1 B-1 escalation trigger fires literally but its substance is nil (discharged
with this evidence, not asserted).

**Oracle on `lot-m010`** : `npm run ci` = **180/180** (the 19-test gap vs 199 = exactly the F1 tests,
absent by design, not a regression); `export:check` = **0 forbidden, 0 non-exempt French, all scopes
GATED**. **error_origin** of the B-1 friction = the original `1f14b9b` bundled two lots in one commit
(**R-25** violation). **N-1** : a future rebase of `lot-m008-f1` onto post-m010 `main` will conflict on
`README.md`/`CONTRIBUTING.md` (the split commit is not the same patch-id) — resolve by **taking `main`'s
version**. `v0.1.0` syncs from `main` only **after `lot-m010` is merged**; F1 stays unmerged.

## 4. Guard-rails (fail-closed)
- **Gated free text** : the release notes, the annotated-tag message, and the Release title each pass
  **both** (a) `lang-gate.mjs` **`scanText`** (in-memory, `loadExempt` maskers) **and** (b) the
  grep-forbidden **GLOBAL** patterns, **before** `git tag` / `gh release create`. Fail-closed on any
  non-exempt hit **or** empty/whitespace text. This is the **only** free text reaching the public — the
  same English firewall as the rest (B-8/N-3). `scanText`, **not** `scanFile` (the text is an in-memory
  string, not necessarily a file on disk).
  - **Scope decision (open, checkpoint-2 m-4)** : the vocab gate applied to the notes is the **GLOBAL**
    banned set only, **not** the site/harness/skills honesty-scoped bans. So a public Release note could
    carry a storefront-banned surclaim (e.g. *autonomous*, *predicts*, *confidence*, *accuracy*, a
    third-party brand) that the site itself reddens on. The Release object **is** public storefront text.
    **DECIDED + IMPLEMENTED (investisseur 2026-09-16 ; lot m4, same day)** : `checkReleaseText` applies the
    **site** AND **skills** scoped honesty bans (`vocab-banned.json` `scan.site.banned` / `scan.skills.banned`)
    on top of GLOBAL, with the **UNION** of the two scopes' `exemptPhrases` masked first (so an honest
    negation exempt on one storefront surface — `no confidence field`, `$/token spend cap` — is not reddened
    by the other's scan). Release notes now meet the same honesty bar as the site, on-thesis ("never a
    probability of being right"). The `--tag` gate is **OPEN** (the storefront bar is enforced). **Fail-closed
    (F3)** : a missing/empty `scan.site.banned` or `scan.skills.banned` makes `checkReleaseText` refuse all
    text — never a silent GLOBAL-only fallback on public text. Provenance: `docs/G1-lot-m010-m4.md`,
    `docs/G2-lot-m010-m4.md`.
- **Branch guard (B-2)** : `release-public.mjs` refuses unless local **`HEAD == main`** **and**
  `git status --porcelain` is **empty**. The `origin/main`-worktree variant of the old draft is
  **removed** — `origin/main` is a stale remote ref (fail-open: it can lag a reverted push). A sync on
  `lot-m008-f1` must never publish F1 before F2 (ADR-M008 §3).
- **`--dry-run`** (oracle, N-7) : prints the tag + Release + notes, **refuses** without notes,
  **refuses** a non-semver tag, **refuses** on `gh auth` failure — **without touching the remote**. A
  green dry-run while the real sync would fail is a fail-open (class R2(a)). The dry-run calls the **same**
  guard functions as the real path (§5) — no divergent second code path.

## 5. CLI contract & guards as pure functions (B-4, B-5)
CLI : `node scripts/release-public.mjs --tag vX.Y.Z --notes <file> [--dry-run]`. `--tag` and `--notes`
are **all-or-none** (both, or neither; neither = a plain sync with no tag). Fail-closed refusals:
- tag not matching `/^v0\.\d+\.\d+$/` → refuse (semver, `0.x` only);
- MAJOR ≥ 1 → refuse (`1.0.0` is a human decision, §2.3 — the schemas do not thaw);
- tag already exists — local (`git tag -l`) or on the public remote (read-only `git ls-remote --tags`)
  → refuse (no clobber);
- `gh auth status` fails, or `gh` is absent → refuse (system dep, N-7; surfaced from `--dry-run`);
- `--notes` file missing / empty, or its text reddens the gate (§4) → refuse.

Guards are **importable pure functions** with **mutant tests** (the deterministic oracle — reduction
guardrail: a simple, verifiable, tight-budget task takes mono-worker + oracle, not fan-out):
- `isSemverTag(tag) → boolean` : `/^v0\.\d+\.\d+$/` (rejects `v1.0.0`, `v0.1`, `0.1.0`, `v0.1.0-rc`,
  trailing junk).
- `checkReleaseText(text) → {ok, hits}` : runs lang-gate `scanText` (with `loadExempt(REPO_ROOT)` maskers,
  loaded **inside**) AND grep-forbidden `scanText` at the **storefront bar** — `compilePatterns` over the
  GLOBAL `banned` **plus** the `scan.site.banned` and `scan.skills.banned` scoped bans, with the union of
  both scopes' `exemptPhrases` masked first (m-4, §4); empty / whitespace text → `ok:false`. **Erratum (2026-09-16, checkpoint-2 m-3)** : the signature is
  **1-arg** `checkReleaseText(text)` — the maskers are loaded internally from `REPO_ROOT`, not passed in;
  an earlier draft wrote `(text, maskers)`. The function is side-effect-free (no write, no network, no
  `process.exit` — safe to import and unit-test), reading only the two committed configs.
- `branchGuard(headRef, porcelain) → {ok, reason}` : `ok` iff `headRef === 'main' && porcelain === ''`.

`--dry-run` and the real path both call these functions. Mutant tests: `isSemverTag` mutated to accept
`v1` must red; `branchGuard` mutated to ignore `porcelain` must red; `checkReleaseText` mutated to pass
empty text must red.

## 6. Per-deliverable acceptance criteria (B-6)
| Deliverable | Acceptance |
| --- | --- |
| `release-public.mjs` | 3 pure guards exported; `--tag`/`--notes` all-or-none; refuses per §5; `--dry-run` calls the same functions; **no** `msgArg`; branch guard = local `main` clean only. |
| release tests | mutant tests for the 3 guards (each mutation caught); `npm run ci` green. |
| `CONTRIBUTING.md` §Releases | version source = git tag; `package.json` stays `0.0.0`/`private`; English; `lang:gate` green. |
| README Release badge | badge + link to the latest Release; no fabricated coverage %; English. |
| PR template (governance) | `.github/PULL_REQUEST_TEMPLATE.md` (English, `lang:gate` green) **or** `docs/PULL_REQUEST_TEMPLATE.md`; fields per §2.5; **not** whitelisted (never exported); inert on the mirror (B-7). |

## 7. MAST residual-failure checklist (B-6)
The MAST modes that bite this lot, with the mitigation each:
- **FM-1.2 (disobey task spec)** — a dry-run that does not match the real path → shared pure functions (§5).
- **FM-2.4 (information withholding)** — a silent skip of the notes gate → fail-closed + no silent cap.
- **FM-3.1 (premature / partial action)** — a tag created then a failed Release → **atomicity/reprise
  (N-1, amended 2026-09-16, checkpoint-2 M-1)**: the sync commit is pushed **before** the tag block, so
  it is already public once the tag step runs. If `git push refs/tags` or `gh release create` fails, the
  rollback **deletes the tag(s)** and reports the **actual** delete outcome (a remote-delete that itself
  fails leaves the remote tag present — the tool says so and names the manual `git push --delete`). Because
  the sync commit is already public, **gh-failure recovery is MANUAL, not a re-run**: re-running would
  reset the mirror to `origin/main` (which already carries the sync), find nothing to publish, and be
  refused by **N-2** — so N-1 and N-2 are consistent only under manual recovery. The operator recreates the
  tag and re-runs `gh release create` on the already-pushed mirror HEAD (`sha` is printed in the abort).
  The N-2 abort message names this case. This is **fail-closed** (the failure mode is a Release that must
  be cut by hand, never an accidental publish). Auto-detecting `published-HEAD == export` was **rejected**:
  it needs persisted run-state a fail-closed tool must not trust.
- **FM-3.3 (incorrect verification)** — dry-run green ≠ real green → the oracle is the real `gh` dry-run
  **plus** the mutant tests.

## 8. What it does NOT do
Does **not** turn the mirror into a work repo (Option 1 held). Does **not** add a root
`CHANGELOG.md`/`SECURITY.md` (refuted). Does **not** touch the 4+1 frozen contracts, the 4 MCP tools, or
the gate math. Pushes nothing on its own: **every tagged sync (including the first, `v0.1.0`) is an
OUTBOUND action under a per-action investisseur go**; the `gh repo edit` of the metadata (topics/Website,
lot 2) is a separate go.

## 9. Alternatives rejected + GH-01/02 persistence (N-4)
Root `CHANGELOG.md` (GH-01 **refuted**: notes on the Release) ; mirror → work repo (Options 2/3 rejected,
English firewall) ; tag-per-sync (noise, a permalink per machine commit) ; `package.json` as version
source (not npm published ⇒ the carrying version is the frozen-contract set, ADR-versioned). The audit's
refutation of `CHANGELOG.md` (GH-01) and `SECURITY.md` (GH-02) is **recorded here and in the G1 journal**
so it is not re-litigated.

## 10. AgileGates sequence
G0 (this ADR, amended) → **checkpoint-1** (done: ACCEPTE-AVEC-CORRECTIONS, folded) → implementation
(`release-public.mjs` + mutant tests ; `CONTRIBUTING.md` §Releases ; README Release badge ; PR template
on governance) → **G2 fresh** (≠ generator) → **checkpoint-2** → **G7** → **local commit**. Then, **under
an investisseur go**, the first **tagged sync `v0.1.0`** (outbound). Out of scope: lot 2 (metadata,
separate go), F2.

**G1 journal** : `error_origin` assigned at G7; the B-1 friction `error_origin` = mixed commit `1f14b9b`
(**R-25**). The CA-in-README ruling (investisseur 2026-09-16) is journaled (N-6). Lot-4 is **5
deliverables, unitary** (release-public.mjs + tests + CONTRIBUTING §Releases + README badge + PR
template) — within the R-25 lot bound (N-5). `gh` is a **system dependency** (N-7):
`release-public.mjs` checks `gh` presence + auth and refuses fail-closed if absent.
