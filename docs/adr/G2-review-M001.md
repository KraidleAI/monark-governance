# Revue G2 — Lot Phase 0 MONARK (`F:\Monark`), rattachement ADR-M001
**Date** : 2026-09-04. **Relecteur** : worker **`claude-opus-4-8[1m]`**, effort max, **instance séparée, contexte
frais** (réviseur ≠ générateur — le générateur est le worker Opus 4.8 de la session). Gate-0/R-1 : conforme.
**Checklist** : `templates\checklist-revue-G2.md` du corpus, 100 %, revue 3 étapes AgileCoder.
**Contexte fourni au relecteur (artefacts seuls)** : le dépôt `F:\Monark` intégral, `docs/adr/ADR-M001`,
`docs/JOURNAL-PROVENANCE.md`, doc 02 + checklist G2, et `Downloads/grok 1/src/lib/hac-cp.ts` comme input de diff.

## Preuve reproduite (pas crue)
- **Oracle CI** : `npm run ci` re-exécuté → `gate:vocab OK` · `tsc --noEmit` propre · **tests 37 / pass 37 / fail 0**
  (état au moment de la revue ; 41/41 après fermeture de M3/M4).
- **`calib_digest` cross-langage** : **réimplémenté en Python** (`struct.pack('>d')` + `sha256`, indépendant du TS)
  → `[0,1]` → `1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081` ✓ ; `[]` → `e3b0c442…` ✓ ;
  ordre-indépendant ✓ ; `-0`/`+0` même digest ✓. **Claim C5 vérifié empiriquement.**
- **Source primaire Shōgen** : `temoignage_canonique.rs:15-17` confirme 03 §0 (pas de vérité/confiance/validated).
- **R-8** : `package-lock.json` épingle `typescript@7.0.2`, `ajv@8.20.0`, `ajv-formats@3.0.1`, `@types/node@24.13.3`.
- **R-20 / C14** : 36 fichiers `A` (à la revue), 0 commit, `git remote -v` vide.

## Les 6 claims attaqués — tous tenus
1. **Schémas = source de vérité exécutée** : ajv compile les 4 ; le `$ref` gate-decision → coverage-verdict résout ;
   rejets vérifiés (attestor vide/dupliqué, hash 63c, caractère de contrôle, **`residual:[]` rejeté par le SCHÉMA**
   et non seulement par TS, `oneOf` région) ; `additionalProperties:false` partout, variantes `oneOf` incluses.
2. **Union set|interval ne fuit pas** : `intentInRegion` gère set (`labels.includes`) et interval (`lo≤·≤hi`) ;
   `intent: string|number|null` ; `intent_not_in_region` neutre. Aucun cas UKEMI-interval bloqué.
3. **Rien lifté de Grok** (diff `hac-cp.ts`) : `findForbiddenKey` (chemin `$…`, tableaux explicites) ≠
   `hasForbiddenKey` (booléen) ; `serialize*` (closed-check + garde récursif) ≠ `serializeVerdict` (racine seule) ;
   types retravaillés (région polymorphe, `calib_digest`, `schema_version`, taxonomie) ; float64-BE propre à MONARK.
4. **`FORBIDDEN_KEYS` récursif** : tableaux + objets imbriqués, les 12 clés à tout rang ; liste = 4 Grok ∪ 03 §0.
5. **`calib_digest`** : déterministe, tri ascendant, `-0`→`+0`, NaN/±∞ refusés ; oracle `[0,1]` reproduit en Python.
6. **Discipline** : `AttestedPrice` sans champ prix/vérité/confiance ; les 3 omissions C3 traitées ; R-13 tenu ;
   CI réellement bloquante (`&&`).

## Findings — aucun bloquant, aucun majeur
| # | Finding (mineur) | Disposition orchestrateur (G7) |
|---|---|---|
| M1 | CI : `build`/`lint` absents vs texte ADR D8 | **R1 ratifiée** : ADR D8 réconcilié (`build`≡`typecheck` noEmit ; `lint` différé DEVOPS) |
| M2 | Gate vocab n'inclut pas `FORBIDDEN_KEYS` | **R1** : `FORBIDDEN_KEYS` enforcées structurellement (schémas fermés + garde récursif), pas par grep — écrit dans D8 |
| M3 | Enum `reason` tripliqué sans test de synchro des valeurs | **FERMÉ** : `enums.ts` source unique, types dérivés, `enums.test.ts` deepEqual schémas↔TS |
| M4 | Clé interdite dans `verdict` imbriqué non exercée end-to-end | **FERMÉ** : test e2e `forbidden-keys.test.ts` (`$.verdict.p_correct` + `serializeGateDecision` lève) |
| M5 | `region.interval` : `lo≤hi` non contraint | **Phase 1** : invariant producteur (inexprimable proprement en JSON Schema), nommé |
| M6 | `region.set.labels` sans `uniqueItems` | observation, inoffensif (`includes`) |
| M7 | Provenance « union 03 §0 » = cadrage généreux (principe en prose, pas liste) | observation ; défense en profondeur, sur-refus sans risque |
| M8 | README « guaranteed inference » — tournure limite (09) | **reclassé correction par le checkpoint 2 → corrigé** (« coverage-controlled inference ») |

## Bornes de portée (remontées au G7, tranchées le 2026-09-04)
- Pendants roadmap hors `F:\Monark` : (a) « résidus de diversité » → corrigée ✅ ; (b) « trois » → « quatre » ✅ ;
  (c) ratification investisseur d'ADR-CERT-MONARK → **pendant formé, avant Phase 3**.
- **Intervalle non borné inexprimable** (JSON sans ±∞) → **choix de conception** (miroir du refus Hikae de +∞ :
  `under_calib`) ; UKEMI émet un intervalle borné ou s'abstient — à nommer au contrat d'intégration Phase 1.
- C13 (roster scindé) → **résolu** (flip global 2026-09-04).

## Verdict G2 : **approuvé-avec-réserves**
Conformité à ADR-M001 vérifiée (C1-C14 retrouvées dans les artefacts) ; discipline 03 §0 / 09 tenue ; 6 claims
vérifiés avec preuve reproductible ; aucun code lifté ; staged sans commit ni remote. Réserves : **R1** (ratifier le
texte CI — fait), **R2** (M3, M4 — fermés ; M5 — Phase 1), **G7** (bornes de portée — tranchées ; `error_origin` —
assigné). Aucune modification apportée par le relecteur, aucun commit (R-20).
