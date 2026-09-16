# G1 — Génération tracée, Lot M010-4 (modèle de release du miroir : tags + GitHub Releases)

- **Générateur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 : résolu `claude-opus-4-8[1m]`, préfixe
  `claude-opus-4-8` vérifié, effort max ; Opus 5 non utilisé). Dispatché en workflow (agent `worker`,
  `{model:'claude-opus-4-8', effort:'max'}`). Aucun commit (R-19/R-20 ; seul l'orchestrateur committe).
  Branche `lot-m010` (créée depuis `main 3b9805a`, topologie B-1). 2026-09-16.
- **Spec** : `docs/adr/ADR-M010-release-model.md` §2 (décision), §4 (garde-fous), §5 (contrat CLI + 3
  fonctions pures), §6 (critères d'acceptation par livrable), §7 (MAST + N-1/N-2). `docs/PLAN-post-audit-narabi-repo.md` lot 4.

## Topologie B-1 (orchestrateur, avant génération)
`lot-m010` créée depuis `main` (3b9805a). Cherry-picks dans l'ordre : `c37fd29` (CA README + test),
`1f14b9b` **SPLIT** (commit `d522107` = seuls les hunks `README.md`+`CONTRIBUTING.md` ; les hunks
`ADR-M008`/`PLAN-m008-f2`, F1-only et jamais exportés, restent sur `lot-m008-f1`), `d4d6644` (plan
post-audit), `6d50158` (fix export), `6b45a2a` (ADR-M010 G0) ; puis fold cp1 `4831524`. Aucun fichier F1
(`packages/monark/src/adapter-narabi.ts`, son test, `schemas/attested-flow.schema.json`, manifest gelé)
n'est présent → surface publique `v0.1.0` byte-identique. `error_origin` de la friction B-1 = `1f14b9b`
mixte (lot-3 hygiène + édits doc F1 en un commit, R-25). F1 reste non-mergé.

## Fichiers (2 modifiés + 3 nouveaux ; puis corrections G7/cp2 : release-public.mjs, CONTRIBUTING, ADR)
Modifiés : `scripts/release-public.mjs` (réécrit — 3 gardes pures exportées + main() sous run-guard +
chemin tag/Release), `CONTRIBUTING.md` (§Releases), `README.md` (badge Release).
Nouveaux : `scripts/release-public.d.mts` (surface de types, gouvernance-only), `test/release-public.test.ts`
(node:test, 4 blocs), `.github/PULL_REQUEST_TEMPLATE.md` (template gouvernance, jamais exporté).

## Gardes pures exportées (mutant-testées)
- `isSemverTag(tag)` : `/^v0\.\d+\.\d+$/` (0.x ; MAJOR≥1 refusé = décision humaine). Argument-pure.
- `branchGuard(headRef, porcelain)` : ok ssi `headRef==='main' && porcelain===''` (pas de variante
  origin/main, B-2). Argument-pure.
- `checkReleaseText(text)` : lang-gate `scanText`(French, `loadExempt(SRC)` maskers) ET grep-forbidden
  `scanText`(GLOBAL, `compilePatterns(vocab-banned.banned)`) ; vide/espaces → `ok:false`. Sans écriture,
  sans réseau, sans `process.exit` (lit seulement 2 configs committées) — importable/testable.

## Mutants (générateur) — rouge prouvé
1. `isSemverTag` : `/^v0\.\d+\.\d+$/` → `/^v\d+\.\d+\.\d+$/` (accepte `v1.0.0`) ⇒ test rouge.
2. `branchGuard` : `if (porcelain !== "")` → `if (false)` (ignore l'arbre sale) ⇒ test rouge.
3. `checkReleaseText` : `text.trim() === ""` → `false` (passe le vide) ⇒ test rouge.
4. Run-guard retiré ⇒ la sonde d'inertie d'import (subprocess `node -e import`) rouge (import lancerait
   une release sur `lot-m010`).

## Oracle (arbre livrable, après corrections cp2)
`npm run ci` **184/184** (baseline 180 [lu] ADR §3 + 4 tests neufs) ; `npm run lang:gate` 0 hit
(10 scopes) ; `npm run export:check` 0 forbidden / 0 French (10 scopes) ; `node --check
scripts/release-public.mjs` OK ; sonde d'inertie : import expose `branchGuard,checkReleaseText,isSemverTag`
SANS bannière `===`/release. Sécurité export : `scripts/release-public.mjs`+`.d.mts`, root `test/`,
`.github/PULL_REQUEST_TEMPLATE.md` non whitelistés → jamais exportés ; seuls `README.md`+`CONTRIBUTING.md`
touchent la surface publique (anglais, lang-gate propre). Aucun push (local-only jusqu'au go investisseur).
