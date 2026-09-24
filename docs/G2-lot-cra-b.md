# G2 — Lot CRA-B (revue fraîche, contexte frais)

Relecteur G2 : **Opus 4.8**, modèle résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni non utilisé — R-1).
Gel `849e2c9` sur `lot/cra-b` ; base `627113c` (= merge-base avec `lot/etude-suite`). Rejeu sur copie `git archive 849e2c9` → `F:\tmp\g2-crab\tree`, `npm ci --cache F:/tmp/npm-cache`, `TEMP=TMP=TMPDIR=F:/tmp`, rien sur C:. Un seul `npm run ci` complet (contrainte Bell -b1). R-20 : aucune modification du dépôt.

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS (liste fermée)

- **C-G2-1 (surface publique, fait faux)** — `error_origin: worker`. SECURITY.md §Data (« The storefront site is hosted on Vercel ») et PRODUCT-BOUNDARY.md (« the storefront (monarkgate.tech, on Vercel) ») affirment un hébergement **Vercel** contredit par la cartographie committée du dépôt : `docs/BASCULEMENT-COMPTE.md:34` « site sur VPS, **pas Vercel** » + `deploy/Caddyfile.monark-narabi.snippet` (bloc vitrine `monarkgate.tech → localhost:3000` sur le VPS). Claim non sourcé (PLI : « hosting stated »). Aucun `vercel.json` dans l'arbre. Correction : rétablir l'hébergement réel (VPS) ou retirer la caractérisation (la thèse L-5 « no personal data required » n'en dépend pas).
- **C-G2-2 (branchement, tuyau déclaré non prouvé)** — `error_origin: worker` (contributif validateur/checkpoint-1). MG2 (retrait de `SECURITY.md` de `surfaces()`) ne rougit **aucun** test ; or l'ADR-CRA-B (Tuyaux, artefact du worker) déclare `public_surfaces_make_no_probative_claim (surfaces() extended)` comme **preuve** de ce tuyau — affirmation fausse (règle Branchement : tuyau déclaré prouvé par un test qui ne le prouve pas). La regex PROBATIVE (`verified|proven|certified`) est **disjointe** de la regex CRA (`compliant|in scope|secure|CE mark`) : un surclaim `verified/proven/certified` futur sur SECURITY.md échapperait à tout test si la ligne est retirée. Contributif : C-2 a exigé un mutant pour la jambe WHITELIST (gardée par `product_boundary`) mais pas pour `surfaces()`. Correction : +1 assertion d'appartenance (~2 lignes).
- **C-G2-3 (citation imprécise, mineure)** — `error_origin: worker`. SECURITY.md cite `deploy/Caddyfile` ; le fichier réel est `deploy/Caddyfile.monark-harness`. Corriger le chemin exact.

Aucune n'est de niveau REFUSÉ : cœur du lot sain, corrections bornées et localisées. Vérification adversariale R-21 + assignation error_origin au G7 = orchestrateur.

## Checklist (vérifiée indépendamment)

1. **Diff = PLI, rien d'autre / T0** ✓. `627113c..849e2c9` = 16 fichiers = les 15 déclarés au PLI + `docs/PLI-lot-cra-b.md` (non auto-listé). `git diff --stat -- schemas packages apps/site` = **vide** (T0).
2. **Formulations conditionnelles** ✓ (juge le texte, pas le test). Les 4 surfaces + README affirment l'**indétermination** (« makes no statement », « undetermined », « asserts neither applicability nor non-applicability ») — jamais l'applicabilité NI la non-applicabilité. Zéro mot probatoire (`secure|verified|compliant|certified|proven`) sur toute surface (grep -niE). « in scope » : conditionnel (masque licite `if MONARK is in scope as a manufacturer`) ; « within scope » = catégorie du Règlement.
3. **C-2** ✓ (partiel, cf. C-G2-2). `SECURITY.md` ∈ `WHITELIST_FILES` (+`collectFiles().kept`, gardé par `product_boundary`, M2 rouge) ; ∈ `surfaces()` (présent, non gardé → C-G2-2) ; ADR-M004 **D7 quinquies** présent ; **aucun lien** SECURITY.md → `docs/**` (seul lien = URL advisories).
4. **C-3** ✓. Ligne `run: npm sbom --sbom-format cyclonedx --omit dev --package-lock-only > sbom.cdx.json` exacte ; `upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` **recoupé** (`git ls-remote https://github.com/actions/upload-artifact v7.0.1` → `043fb46...`, tag léger → commit, cohérent `object.type=commit`) ; commentaire de provenance présent ; `npm sbom ... --package-lock-only` local → **CycloneDX 1.5, 183 composants**, exit 0.
5. **C-4** ✓. Oracle langue **réel** : `import { scanFile, loadExempt } from "../scripts/lang-gate.mjs"` exécuté sur la procédure. Horloges art. 14 **recoupées [lu]** dans `cra-2024-2847-EN.txt` (sha256 `b44295eb...` = registre `SOURCES-sha256-reglementaire.txt`) : art. 14(2) 24 h/72 h/**14 days** ; art. 14(4) 24 h/72 h/**one month** ; CSIRT-coordinateur + ENISA plateforme unique (art. 16). « 11 September 2026 » (art. 71(2)) recoupé [lu] ligne 4104.
6. **C-7** ✓. « No personal data is required... (no account, e-mail, or wallet) » — identique README/SECURITY (test d'identité). **Aucun** surclaim « stored/we do not store ». Caddy : correction du worker **CONFIRMÉE** — `deploy/Caddyfile.monark-harness` bloc **commenté**, `format json` (pas de `format filter`) ⇒ **non restreint**, l'IP client est émise ; `roll_size 10MiB`/`roll_keep 5`/`roll_keep_for 720h` = « 10 MiB x 5 »/« 720 h ». Test clés **entières** (probe : `ip` capturé, `description` non). « no request body is logged » = défaut Caddy, non sourcé mais défendable.
7. **Mutants** ✓ (cf. table).
8. **Oracle** ✓. `npm run ci` = **383/383** (gate:vocab + typecheck propres ; test 42 lourd 29,96 s vert) ; `lint` 0 ; `lint:ratchet` **69/69** ; `lang:gate` **0** (12 scopes) ; `export:check` **0**. npm **11.12.1**.
9. **R-25 & merge** ✓. R-25 sous pathspec `STAT=` exacte (`627113c...849e2c9`) = **293** (292 ins / 1 del ≤ 400). `git merge-tree --write-tree lot/etude-suite 849e2c9` = **exit 0, propre** (tree `54c87fb...`, zéro marqueur/CONFLICT). NB mesuré : sur `etude-suite` depuis 627113c, `ci.yml`/`README.md`/`test/ci-gates.test.ts` **n'ont PAS bougé** (contra la prémisse) ; 17 fichiers changés (U-1b-b AttestedBook/T-1a-ii-b), zéro chevauchement avec les 16 du lot. H-attested (`9a2efca`) et checkpoint-2 U-1b-b (`809630a`) sont **déjà dans la base 627113c** (ancêtres de 849e2c9), pas des avancées d'etude-suite.
10. **Items formés** ✓ (cf. section).

## Mutants (rejeu sur copie ; restauration `git show 849e2c9:... > copie` + `sha256sum -c` ; baseline copie == PLI à l'octet, LF préservé)

| # | Mutation (sur la copie) | Test visé | Résultat |
|---|---|---|---|
| M1 | ligne SBOM → `run: echo` | ci_publishes_sbom | 5 pass / 1 fail visé ✓ |
| M2 | retrait `"SECURITY.md"` de WHITELIST_FILES | product_boundary | 5/1 ✓ |
| M3 | schéma copié avec clé `ip` | no_personal_data | 5/1 ✓ |
| M4 | `MONARK is in scope.` → SECURITY.md | cra_surfaces | 5/1 ✓ |
| M5 | phrase française → procédure | notification (jambe langue, oracle réel) | 5/1 ✓ |
| M6 | `s/72 h/7 days/g` procédure | notification (jambe horloge) | 5/1 ✓ |
| M7 | suppression `## Reporting` | security_policy | 5/1 ✓ |
| MG1a (mien) | retrait `--package-lock-only` (ci.yml seul) | ci_publishes_sbom | 5/1 ✓ (mismatch SBOM_COMMAND) |
| MG1b (mien) | retrait dans ci.yml **et** sbom.mjs (verrou) | ci_publishes_sbom | 5/1 ✓ (littéral `--package-lock-only`) |
| MG2 (mien) | retrait `SECURITY.md` de `surfaces()` | public_surfaces | **SURVIT** → C-G2-2 |

Chaque mutant déclaré rougit **exactement** sa cible ; restauration vérifiée. MG1b prouve que le double-source `--package-lock-only` ne peut dériver silencieusement (rouge même si ci.yml + sbom.mjs changent ensemble).

## Chiffres recoupés
- sha256 des 7 fichiers neufs (blob `849e2c9` | sha256sum) = **PLI, à l'octet** (ex. SECURITY.md `b94fe854...`, cra-b.test.ts `c594b020...`).
- SBOM : CycloneDX 1.5, 183 composants ; `metadata.component.name=tree` (confirme : octets non reproductibles, nom = dossier de checkout).
- Décisions investisseur 42-43 (`etude-suite:docs/CHANTIERS.md:95`) : 42 = GitHub Advisories seul (PVR enabled:true) ; 43 = voie B, 72 h/90 j « retenus par défaut ». Citations SECURITY.md/ADR **tracées**.

## Items formés (appréciation G2)
- **42(f′) (ADR-M004 D7 ter)** : ACCEPTÉ comme item formé. CRA-B **n'est PAS** « le premier lot touchant `ci.yml` » depuis D7 ter (`4eba633`, ancêtre de 849e2c9) : e66324b (timeout-minutes), d3eb9bb/7d6d117/bd3fa0a (pathspec R-25) l'ont touché avant. Le déclencheur a fait feu **plus tôt** ⇒ dette **héritée** de la lignée etude-suite, non imputable à CRA-B (D7 ter = non bloquant, échéance = 1re publication). `etude-suite` ne l'implémente pas (ci-gates.test.ts : seul un commentaire :1083 sur les pathspecs). **Signalé à l'orchestrateur** : dette vieillissante à assigner avant publication. Non-implémenté ici = correct.
- **ISO/IEC 29147:2018** : ACCEPTÉ. Non lu ; **aucun chiffre attribué** (72 h/90 j = politique investisseur, décision 43) ; item de procurement formé (identité/prix ~CHF 200/usage/déclencheur). « aligned with the CVD practice of » repose sur le **titre** du standard (notoire), pas un [2nd] chiffré. Absent de l'audit et de l'avis advisor (cohérent avec « non lu »).
- **Caddy `format filter`** : ACCEPTÉ (item déploiement, non bloquant).

## Template `checklist-revue-G2.md` (lu) — mappé sur les points 1-10
Compréhension/intention ↔ G0 (diff = PLI, chaque bloc explicable). Pièges (fonctionnel ≠ preuve, Perry : scrub négation/condition-aware, zéro mot probatoire ; `sbom.mjs` valide `bomFormat`+composants ≥ 1). **R-8** : **aucune dépendance npm nouvelle** (package.json/lock intacts ; seule action GH `upload-artifact` épinglée par SHA recoupé). **R-25** 293. Traçabilité PLI/ADR ; **aucun TODO/FIXME nu** (R-13) ; aucun tier modèle banni. AgileCoder 3 étapes : (1) impl. vides/imports → typecheck propre ; (2) conformité backlog → base+6 exact, rien en trop ; (3) critères d'acceptation → oracle + mutants. Aucun script `Workflow` dans le diff (N/A). Aucun écart au template hors les 3 corrections listées.

## Provenance
G2 fraîche, Opus 4.8 `claude-opus-4-8[1m]`, effort max, 2026-09-20. Rejeu isolé `F:\tmp\g2-crab\` (hors C:). R-20 : aucune écriture dans le dépôt ; aucun commit ; aucun workflow. Verdict adversarial final + error_origin = orchestrateur (G7).
