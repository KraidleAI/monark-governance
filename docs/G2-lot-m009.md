# G2 — Revue du Lot M009 (primitive quantile tracker, ADR-M009)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1 vérifié), ≠ générateur, 2026-09-17. Lecture seule ; mutants
  rejoués sur **copies scratchpad** (arbre projet intact, sha `37db3331…` inchangé). Advisor intégré **non invoqué**
  (transcript porteur d'extraits ABB verbatim ⇒ risque de filtre de régurgitation, règle 2026-09-05 ; indisponibilité consignée).
- **Cible** : `tracker.ts` sha `37db3331c653b5cb13c573303528ef57de2236bf25a901caac5bf57b07f68e3c` ; `tracker.test.ts` sha
  `f5bb3554eb58e639ce93f810cd28d73d7fc470e943dff2ef508e827ccdf5cd3c` ; `index.ts` +4 ; ADR-M009 ; PLAN-m009 ; amendements M002/M008/PLAN-m008-f2.

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS (R-1, R-2 ; R-3, R-4 observations) — aucune bloquante**

## Findings
- **R-1 (doc, LOW)** — ADR §6 « encodage fixé » omettait la normalisation `-0 → +0` de `trackerDigest` (`tracker.ts:153,157`,
  miroir `calib-digest.ts:27`) ; cas atteignable (`q1 = -0`, `s = -0` acceptés). Code gardé ; **ADR §6 + PLAN §2 amendés**
  (orchestrateur, 2026-09-17).
- **R-2 (clôture, MEDIUM)** — entrée JOURNAL M009 absente (AC-7/AC-8) et `G2-lot-m009.md` à déposer. **Fait** par l'orchestrateur
  (ce fichier + entrée JOURNAL avec `error_origin` + items (a)-(e)).
- **R-3 (INFO)** — « adaptive » apparaît 5× dans la prose ADR/PLAN (toutes méta : interdiction, item (e), règle AC-5) ; 0 dans
  le code. **PLAN AC-5 précisé** : le grep porte sur les ajouts de code.
- **R-4 (INFO)** — `trackerStepSize` rejette `η` non finie mais pas `η = 0` (sous-flot par `eps` pathologique) ; non atteignable
  avec `eps` validé > 0 et les valeurs testées. Durcissement noté (rejeter `η ≤ 0`) si `eps` devient exposé — **item (f)**.

## Oracle rejoué par le relecteur (Node v24.15.0)
`node --test packages/hikae/test/tracker.test.ts` **10/10** ; `npm run ci` **232/232** ; `lang:gate` 0 ; `lint:ratchet` **69/69** ;
`npm run lint` propre ; `export:check` 0. `git status` : 3 code + 6 gouvernance, aucun fichier interdit §1 ; en-tête
« TRACKER, NO GUARANTEE CLAIMED » présent (`tracker.ts:4`) ; aucun commit M009, rien de staged (R-20 tenu).

## Mutants rejoués (harnais scratchpad byte-équivalent : reproduit `3fa29520dacf6cca` et `06e2a024…` sur la copie non mutée)
- **M1 clamp** — TUÉ : test 5 (`3fa27ec7b99a2ff6`), test 3 précondition (`leaves[0,B]=false`), test 4 (`0.40 > 0.1262` — **le clamp
  vide Thm 1 lui-même**).
- **M4 t₀ double** — TUÉ : test 5 (`3fa20d1740760ce5`) ; tests 3/4 inchangés (t₀=0 y neutralise) ⇒ rationnel C-4 confirmé.

## Sanité mathématique (texte ABB primaire relu par le relecteur)
Règle (4) ≡ `imocpStep` (réutilisé, import l.29, appel l.110), `E` strict ✓ ; Lemme 1 éq. (8) : direction/signe/indexation du
test 2 corrects (`mMax` après l'itération k = `M_{k+1}`, borne `q_{k+2}`) ✓ ; Thm 1 : le papier borne la couverture, le test la
mécouverture — équivalence exacte `|couv − (1−α)| = |moy(E) − α|` ; `η_1 = stepSize(0)`, `η_T = stepSize(T−1)`, T = 1000 pas
⇒ indexation conforme ; borne 0.1262 ✓.

## Checklist G2 corpus
Revue 3 étapes AgileCoder ✓ (imports, 8 exports exacts, AC-1..AC-6 vérifiés ; AC-7/AC-8 → R-2, faits). Validation fail-closed
complète et testée (test 7) ; aucune dépendance nouvelle (R-8) ; aucune duplication (R-3) ; `clipScore` jamais appelé dans la
récursion ; digest ordre-sensible ≠ `calibDigest` ; pas de TODO nu (R-13) ; commentaires anglais ; R-25 code ≈ 399 lignes.

## MAST résiduel
Dérive de spéc (clamp) FAIBLE (M1 tué 3×) ; perte d'information FAIBLE-MOYEN (maths vérifiées à la source, mémoire non ouverte) ;
vérification incorrecte FAIBLE (tout rejoué) ; clôture prématurée MOYEN → FAIBLE après R-2 ; désobéissance de rôle FAIBLE.
