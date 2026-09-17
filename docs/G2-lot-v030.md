# G2 — Revue fraîche, Lot release v0.3.0 (surfaces publiques)

- **Relecteur** : worker **`claude-opus-4-8[1m]`** (R-1), instance séparée, contexte frais, ≠ générateur. 2026-09-17.
- **Verdict : PASS-AVEC-RÉSERVES — 0 bloquant.** Aucune édition par le relecteur.

## Ce qui a été vérifié (commandes rejouées)
- `gate-check` (garde pure `checkReleaseText`) : README / notes / description ⇒ ok=true, 0 hit, sha conformes à l'annonce.
- `npm run ci` 222/222 ; `lang:gate` 0 ; `gate:vocab` OK (115) ; `export:check` 0.
- Plan d'export `export-public.mjs --out <stage>` vs miroir local (baseline `2fce143`) : **A=7, M=20, D=0** ; D sous `out/` = 0 ;
  triade `out/` présente ; aucun chemin gouvernance ; parité README stage==source IDENTICAL.
- **Anti-affaiblissement (MAST)** : diff baseline→courant de `vocab-banned.json`, `grep-forbidden.mjs`, `export-public.mjs`
  = **purement additif** (scope `narabi_docs`, +2 scripts whitelistés) — aucun ban retiré ; non modifiés par ce lot.
- **Traçabilité claim par claim** (README/SKILL/notes/description) : 5 contrats (`schemas/*.schema.json`) ; 4 outils
  (`registry.ts:32`) ; clé USDe (`calibration.ts:67-74,173-181` ; test `usde_committed_key_is_the_ratified_value`) ;
  « every other population abstains » (`gate.ts:67-68,407-410`) ; « not yet on the public endpoint » (ADR-M008 §3) ;
  « CI (5 blocking jobs) » (`ci.yml`) ; `clawhub install monark` (`integrators/page.tsx:123`) ; hermes/openclaw
  (`INTEGRATION.md:16,27`) ; Node ≥ 24 + zéro dep runtime (`package.json`) ; Apache-2.0 + skill MIT-0 ; URLs canoniques
  (`verify-harness.mjs:28-29`, `h5-trace-builder.ts:24-25`) ; NDG-1 (`gate.ts:435`) ; msUSD refusé (`gate.test.ts:541-561`).
- **Caveat des notes RECOMPUTÉ** depuis `fixtures/usde-calib-series.json` (sha `7c33027a…`, exportée) : 10 oct. 1.1042e-3
  (> q99 committé 3.4009e-4, < sensibilité 1.221e-3) ; 11 oct. 4.6498e-3 (> les deux) ; 12 oct. 4.0210e-4 (> committé
  seulement) ⇒ « first-day crossing depends on the pre-registered stress exclusion; only the peak day is robust » **exact**.
- Verbatim byte-exact : bannière, badges + commentaires, ligne CA (`token_ca_pinned` PASS), phrases signature.
- Cohérence inter-surfaces Narabi : README/SKILL/notes concordent ; le site sous-revendique (Narabi « upcoming », imposé par
  `fleet_register_built_set_is_frozen`) — aucune contradiction ; le README ne dit JAMAIS que Narabi est servi par l'endpoint.

## Réserves (non bloquantes) et disposition (orchestrateur, G7)
| # | Réserve | Disposition |
|---|---|---|
| R1 | `roadmap:87` « four schemas » vs « five contracts » — scoped-correct, risque de confusion | **Appliquée** : « the first four schemas » |
| R2 | `how/page.tsx:53` commentaire « AttestedFlow … NOT frozen » périmé (pré-existant) | **Appliquée** (commentaire seul) |
| R3 | jetons gouvernance en commentaires source du site exportés (pré-existant, non rendus) | Notée → passe de scrub ultérieure |
| R4 | linktree ancré gouvernance seul ; site/skill ne le portent pas | Notée : README + description le portent ; lien site → redesign |
| R5 | « reverse-DNS name is `tech.monarkgate` » sous-revendique vs registre officiel (GET orchestrateur : `tech.monarkgate/monark` actif 2026-09-11) | **Appliquée** : « listed on the official MCP Registry as `tech.monarkgate/monark` » ; ADR-M006/JOURNAL « near-publication / reste dû » **périmés** (documentaire) |
| R6 | miroir `https://api.monarkgate.tech/mcp` non confirmé (hérité SKILL/INTEGRATION v0.2.0) | **Appliquée** : mesuré **404** (vs `/gate` 405) ⇒ REST par outil `POST https://api.monarkgate.tech/{attest\|gate\|cascade\|calibrate}` dans README + SKILL/INTEGRATION/DEMO |
| R7 | LF final de la description (303 vs 302) | **Appliquée** (302) |
| R8 | double espace `hermes  mcp add` | **Appliquée** |
| R9 | dev-deps n'énumère pas eslint/typescript-eslint | **Appliquée** (présents dans `package.json`) |
| R10 | « Next: adaptive conformal inference for drift » — intention roadmap | Assumée par l'orchestrateur ; garde-fou D8 respecté |

**Note de séquençage (R-20)** : SKILL/notes « as of v0.3.0 » supposent le tag créé ; push `main` miroir, tag, GitHub Release,
description repo, republication ClawHub = actions SORTANTES sous go investisseur per-action.
