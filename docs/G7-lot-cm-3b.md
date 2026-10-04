# G7 du lot CM-3b : bande à l'échelle [0, h*], empreinte ordonnée, canonicaliseur F-7 (S-4/E-1 moteur, E-2, S-13) ; raisons E-10, E-14 ; amendement E-13/S-9 proposé

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3, §8, R-2, R-3. Plan : `docs/G0-lot-cm-3b.md`.
- **Base** : `ad40dd5` (tête de `recherches/cm-3a`, PR #108). Branche `recherches/cm-3b`. Commits : `9efecb4` (G0), `86e4798` (tests rouges), `0430d28` (code), `04430e4` (G7) ; corrections de la G2 : `b96054b` (tests), `307a163` (code, **gel**), puis G0, ADR-CM et G7.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Bord h* par bissection sur les motifs de bits (la marche d'un ulp ne finissait pas pour q̂ nul ou sous-normal avec σ̂ grand) ; les trois couples du relecteur sont égaux et vérifiés par la règle exacte du test.
- `canonicalRow` refuse tableaux creux, objets non simples, surrogates isolées, cycles.
- Unités de [0, h*] écrites (|r| ou label positif, transposition de l'avis 0005).
- Tests : refus nommé de q̂ négatif, h* = 0 avec q̂ > 0 rend `under_calib`, q̂ sous-normal à σ̂ 1000 sans exception. **Écart** : à σ̂ 1000 le moteur sert un bord h* > 0 exact (le relecteur attendait `under_calib`) ; refuser les q̂ sous-normaux serait une règle neuve, laissée à CM-4.
- **E-13/S-9** : décision du fondateur (« Tout passer en 1.1.0 … ») écrite au G0 et en amendement daté de l'ADR-CM (« nuit, 5 ») : B-11, lot CM-3c (CONTRACT-1-1-0), §3 ligne CM-3 amendée, répartition RECHERCHES / MONARK, calendrier avec CM-4. Non codé ici.

## Oracle (après la G2)

- `red-proof --base ad40dd5 --gel 307a163 --repo /home/user/monark-governance-cm3 --draw 6 --seed 41` : **OK**, 4 jugés F2P, 4 tueurs tirés, 4 tués. Moteur 77/77, harnais 127/127 (rejeu épinglé `b891dcab…` inchangé) ; `tsc`, eslint, `gate:vocab`, `lint:ratchet` 69/69 verts. R-25 : +359/−0, **359 lignes**.

## Oracle (avant la G2)

- `node scripts/red-proof.mjs --base ad40dd5 --gel 0430d28 --repo /home/user/monark-governance-cm3 --draw 8 --seed 31` : **OK**, 4 tests jugés F2P (rouges par assertion à la base), 4 tueurs tirés (tous ceux du lot), 4 tués.
- `npx tsc --noEmit`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet` 69/69 : verts. `packages/hikae/test` 77/77 (73 → 77) ; `apps/harness/test` 127/127.
- R-25 : 4 fichiers, +306/−0, soit **306 lignes comptées** contre `ad40dd5`, sous 547.

## Rejeu servi

Aucun fichier du chemin servi n'est touché (deux fichiers neufs de `hikae` et des lignes d'export ajoutées en fin de `index.ts`). Le test épinglé `served_replay_identical_and_nan_never_commits_in_the_served_gate` (111 appels, sha256 `b891dcab…d238`) reste vert au gel.

## Changements

- **S-4 / E-1 (moteur)** : `bandEdge(qhat, sigmaHat)` = le plus grand double h avec fl(h / σ̂) ≤ q̂, depuis fl(q̂ · σ̂) par pas d'un ulp ; `conformScaledBand` = `riskControlRow` (domaine `band`, `attempt`, `spendIndex`) puis `buildIntervalRegion(0, h*)`. Vérifié sur 1 600 couples (q̂, σ̂) par une règle d'arrondi exacte en BigInt (au plus près, pair) côté test ; |r| ≤ h* ⇔ fl(|r| / σ̂) ≤ q̂ aux voisins de h* ; le produit brut diffère de h* sur une part de la grille.
- **E-14** : q̂ = 0 rend `under_calib` dans la bande à l'échelle (sans cette garde, σ̂ = 2 servirait [0, 5e-324]) et dans la bande additive (épinglé).
- **E-2** : `orderedCalibDigest(scores, aux)`, égal au `seqDigest` du banc P2 sur un vecteur croisé (et `sha256sum` sur le texte) ; non fini refusé.
- **S-13** : `canonicalRow`, un canonicaliseur pour les lignes F-7 (clés triées en octets UTF-8, décimal aller-retour le plus court) ; `calibDigest` et le canonicaliseur du livre Ukemi restent, avec la raison écrite au G0.
- **E-10, E-14** : raisons écrites au G0. **E-13/S-9** : amendement daté proposé au G0 (non codé, contrat gelé).

## Autocontrôle

Aucun fichier de `schemas/**`, `packages/contracts/**`, `apps/**`, `skills/**`, `fixtures/**`, `scripts/export-public.mjs` touché. Code et commentaires en ASCII anglais. Aucune ligne existante de `hikae` déplacée (aucun tueur à ré-ancrer). Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs`, antérieur, n'est pas commis.

## Écarts au dessin

- `orderedCalibDigest` refuse un nombre non fini (le banc écrirait `null`).
- `conformScaledBand` refuse aussi h* = 0 et un produit q̂ · σ̂ non fini (`under_calib`).

## Questions ouvertes

1. E-13/S-9 tranché par le fondateur (1.1.0 global) : lot CM-3c, B-11, avec CM-4.
2. h* au servi des classes kata (CM-4) ; USDe et liq gardent la bande additive et l'écart d'un demi-ulp écrit (B-7).

## Sortie

Prêt pour la G2 par une instance neuve. Aucun déploiement (CM-3 ne change rien au servi).

## Suite de fusion après #106, #110 et #111 (2026-10-04, PLAN-FUSION étape 5)

- Base avancée : `e45340a` (base/chantier-moteur-2026-10-03 avec #106, #110 et #111). Fusion `--no-ff` de la base dans la branche : `217e682`. Aucune réécriture d'historique. #108 (`ad40dd5`) n'est pas encore dans la base.
- **Un conflit**, la queue de l'ADR-CM, résolu par le registre unique r3 (`AMENDEMENT-ADR-CM-r3.md` §1.3) : ordre chronologique des commits d'écriture, corps mot pour mot, titres 1 à 4 inchangés à l'octet.
  - `## Amendement daté 2026-10-03 (nuit, 4) : contrat 1.1.0 (E-13/S-9), B-11, lot CM-3c` → `## Amendement daté 2026-10-03 (nuit, 5) : contrat 1.1.0 (E-13/S-9), B-11, lot CM-3c (source : recherches/cm-3b 58ca01b)` (`58ca01b`, 2026-10-03T23:26Z), en premier ;
  - `## Amendement daté 2026-10-04 : OPENAPI-ERROR-CODE-1 au §10 (contrôle par diff de MONARK sur CM-2a, C-5)` → `## Amendement daté 2026-10-04 (1) : OPENAPI-ERROR-CODE-1 au §10 (contrôle par diff de MONARK sur CM-2a, C-5) (source : recherches/cm-2a-suite 7e37bb9)` (`7e37bb9`, 2026-10-04T00:12Z), ensuite.
  - Diff des corps vide contre les deux parents (seuls les deux titres changent) ; ADR sha256 (LF) `0d542bf1…71b2f5`, 212 lignes. L'amendement « 2026-10-04 (2) » (CM-2c) entrera avec #107.
- Citations de l'amendement de ce lot (règle par objet, r3 §1.4 ; chacune vise le contrat 1.1.0) : « nuit, 4 » → « nuit, 5 » dans `docs/G0-lot-cm-3b.md:42`, `docs/G7-lot-cm-3b.md:12` et `docs/G0-lot-cm-2a-suite.md:28` (deux occurrences). Aucune autre occurrence de « nuit, 4 » dans l'arbre.
- Aucun fichier de code touché par la suite. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas commis.

### Oracle

- `node scripts/red-proof.mjs --base ad40dd5 --gel 307a163 --repo /home/user/monark-governance-c3b --draw 6 --seed 41` : **OK**, 4 jugés F2P, 4 tueurs tirés, 4 tués (le lot prouve toujours contre sa base d'origine).
- `verifie-ancres.mjs` (refs base, cm-2b, cm-2a-suite, cm-2b-surfaces, cm-3a, cm-3b) sur l'arbre fusionné : tueurs 566, ANCRE 557, **DERIVE 0**, PERDU 9 (les 9 préexistants de la base), comme le plan.
- `tsc --noEmit`, `gate:vocab`, `lint:ratchet` 69/69 : verts. `packages/hikae/test` 77/77 ; `apps/harness/test` 129/129 (127 + les tests de #110).
- `lang:gate` : rouge à `15abaea` sur 7 occurrences en `hikae`, toutes de ce lot et déjà présentes à `58ca01b` (la base `e45340a` et `ad40dd5` sont vertes) : le jeton `aux` (`canonical-row.ts:59`, `:61` ; `cm3b-engine.test.ts:165`) et le `é` des données de test du canonicaliseur (`cm3b-engine.test.ts:191-193`). La porte n'était pas dans l'oracle d'origine. Plié par le commit suivant (voir ci-dessous).
- R-25 (motif exact de `ci.yml`, sur la référence de fusion de la PR, `docs/**/*.md` exclus) : **359** (4 fichiers, +359/−0 ; contenu 0) contre la base avec #108 fusionné ; 841 contre `e45340a` tant que #108 n'y est pas (le diff compte alors #108), sous la borne de PR 1 205.

### Correction `lang:gate` (2026-10-04) : le gel bouge

- **Le gel passe de `307a163` au commit qui porte ce paragraphe** (tête de `recherches/cm-3b`). Raison : la porte `lang:gate` (`ci.yml:122`) était rouge sur le code même du lot ; la correction touche le code et les tests du lot, donc le gel.
- `packages/hikae/src/canonical-row.ts:59` et `:61` : le paramètre `aux` de `orderedCalibDigest` devient `auxiliary` ; le champ rendu `auxSha256` (nom du banc P2) ne change pas, ni l'API.
- `packages/hikae/test/cm3b-engine.test.ts:165` : le tueur suit, `canonical-row.ts:61 CONST "sha(auxiliary)" -> "sha(scores)"`, même ligne visée.
- `cm3b-engine.test.ts:191-193` : `é` écrit `\u00e9` dans les quatre littéraux. La porte lit le texte source ; à l'exécution les chaînes sont identiques (vérifié littéral par littéral), le test donne toujours U+00E9 au canonicaliseur et l'ordre UTF-8 (`é`, U+FFFF, 😀) reste distinct de l'ordre UTF-16.
- Toutes les éditions sont en place : aucune ligne ne bouge, aucun tueur à ré-ancrer.

#### Oracle

- `red-proof --base ad40dd5 --gel <ce commit> --repo /home/user/monark-governance-c3b --draw 6 --seed 41` : **OK**, 20 jugés (F2P ou module neuf), 6 tueurs tirés, 6 tués. Le gel contient la fusion de la base, donc le diff `ad40dd5..gel` compte aussi #106, #110 et #111 (16 tests de plus).
- Preuve isolée du lot : même commande, base = fusion simulée de `e45340a` et `ad40dd5` (arbre `a88fa5da`, la base après #108 ; diff au gel = les 4 fichiers du lot) : **OK**, 4 jugés F2P, 4 tueurs tirés, 4 tués, dont `canonical-row.ts:61`.
- `lang:gate` : vert (0 occurrence). `tsc --noEmit`, `gate:vocab`, `lint:ratchet` 69/69, eslint (deux fichiers) : verts. `packages/hikae/test` 77/77 ; `apps/harness/test` 129/129.
- `verifie-ancres.mjs` (mêmes refs) : tueurs 566, ANCRE 557, DERIVE 0, PERDU 9 (les 9 préexistants).
- R-25 : inchangé, **359** contre la base après #108 (éditions en place, +6/−6 sur les deux fichiers du lot, déjà comptés).
