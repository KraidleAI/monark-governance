# G0 du lot CM-3b : moteur, seconde moitié (E-1/S-4 côté moteur, E-2, S-13 ; raisons E-10, E-14 ; amendement proposé E-13/S-9)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3 (CM-3 : aucune différence servie), §8 (remède ou raison écrite), R-2, R-3. Audit `recherches:monark/AUDIT-P3-2026-10-01.md` (S-4/E-1 §1, E-2 et S-13 §2, E-10 §2, E-13/S-9 et E-14 §3). Avis `recherches:decisions/0005-AVIS-advisor-conformal-P2a-band-edge.md` (bord de bande). Format du banc P2 : `recherches:kata/registry/FORMAT.md` l.36 et `recherches:kata/bench/calibrate.ts:17` (`seqDigest`).
- **Base** : `ad40dd5` (tête de `recherches/cm-3a`, PR #108 non fusionnée ; CM-3b s'empile dessus, branche `recherches/cm-3b`). Auteur : RECHERCHES. Borne locale R-25 : 547 lignes comptées contre `ad40dd5`. `schemas/**` et `packages/contracts/**` ne sont pas touchés.

## Règles

### E-1 / S-4 côté moteur : bande à l'échelle [0, h*] (`packages/hikae/src/scaled-band.ts`, fichier neuf)

`conformScaledBand(scores, sigmaHat, alphaDec, baseDeltaDec, nMin, { attempt, spendIndex })` :
1. `riskControlRow` de CM-3a, domaine `band` (aucun score négatif, aucun non fini), sans `silenceAt` (une bande n'est jamais en silence par q̂) ;
2. `sigmaHat` fini et > 0, sinon `under_calib` ; q̂ = 0 rend `under_calib` (NDG-1, voir E-14) ;
3. h* = le plus grand double h ≥ 0 tel que fl(h / σ̂) ≤ q̂ (avis du conformal advisor), par bissection sur les motifs de bits entre 0 et `MAX_VALUE` (63 pas, exacte, prédicat monotone) ; si `MAX_VALUE` passe, pas de bord fini : `under_calib` ; par la monotonie de la division correctement arrondie, |r| ≤ h* équivaut double pour double à fl(|r| / σ̂) ≤ q̂ ;
4. région `buildIntervalRegion(0, h*)` (bande [0, h*], fermée ; h* = 0 rend `under_calib`) ; le résultat porte la ligne (`qhat`, `rank`, `kStar`, `kObs`, `calibMisses`, `attempt`, `spendIndex`, `testDelta`, `missBound`), `hStar` et la région.

Unités : la région [0, h*] est en unités de |r| (ou du label positif des cases de chemin, `label / sigma_hat` de FORMAT.md ; ADR-CM R-4) ; c'est la transposition du [−h*, h*] de l'avis 0005. L'appartenance se teste sur |r| ou sur le label, par l'appelant (CM-4), qui calcule les scores par la seule division fl(|r| / σ̂).

Les scores sont ceux de l'appelant, dans l'ordre du temps (le calcul du rang n'en dépend pas ; l'ordre sert à l'empreinte E-2 et aux contrôles de runs de l'import, CM-4). Le chemin servi (`conformInterval`, bandes additives USDe et liq, `gate.ts:434,578`, `ukemi-strata.ts:58`) ne change pas (§5 de l'ADR-CM : S-4 côté harnais seulement au chemin kata, CM-4).

### E-2 : empreinte ordonnée (`packages/hikae/src/canonical-row.ts`, fichier neuf)

`orderedCalibDigest(scores, aux)` rend `{ scoresSha256, auxSha256 }` : sha256 de chaque suite dans l'ordre du temps, écrite en JSON comme JavaScript écrit les nombres (décimal aller-retour le plus court, `0` et `1` sans point, `1e-7`, sans espace), octet pour octet comme `seqDigest` du banc P2. Écart déclaré : un nombre non fini lève une `RangeError` (le banc écrirait `null`) ; −0 s'écrit `0`, comme au banc. Vecteur croisé : calculé par `seqDigest` du banc de RECHERCHES et par `sha256sum` sur le texte littéral, épinglé dans le test. Rien dans `contracts` (R-3) ; `calibDigest` (trié) reste.

### S-13 : un canonicaliseur pour les lignes F-7 (même fichier)

`canonicalRow(value)` : JSON minifié, clés triées par octets UTF-8 (même ordre que `canonicalStringify` de `packages/monark`), `null`, booléens, chaînes, tableaux, nombres finis écrits en décimal aller-retour le plus court ; un nombre non fini, `undefined`, une fonction lèvent une `RangeError`. `orderedCalibDigest` l'utilise (une seule écriture des nombres pour les lignes F-7 et leurs empreintes). Dans `hikae` et non dans `contracts` : `contracts` est gelé (R-3).

Raison écrite pour les deux autres canonicaliseurs, qui restent :
- `calibDigest` (`contracts/src/calib-digest.ts`, doubles big-endian triés) : champ `calib_digest` du contrat gelé `CoverageVerdict`, épinglé dans les empreintes servies (USDe, liq) et le miroir public ; le changer déplacerait des octets servis. Il garde son rôle (multiensemble des scores), l'empreinte ordonnée s'y ajoute.
- `canonicalStringify` / `canonicalAttestedBook` (`packages/monark/src/book-canonical.ts`) : domaine du livre Ukemi et de l'enveloppe `AttestedBook` (pas de flottants par construction) ; hors des lignes F-7, épinglé par `book_digest`.

### E-10 : raison écrite (pas de remède)

`labelOf` et `signDirection` (`predictor.ts`) rendent `non_evaluable` pour un flat ; ils ne sont sur aucun chemin kata : le chemin kata a sa propre fonction de label avec `flat` explicite (`kataLabel`), livrée par CM-4 avec la répartition kata. La raison tombe si la surveillance (CM-5) réutilise `labelOf`.

### E-14 : raison écrite et test épinglé

NDG-1 rend `under_calib` un q̂ = 0 calibré ; l'effet est nul en pratique à α 0,01 (q̂ = 0 demande au moins n − k* scores nuls). Une raison distincte demanderait d'amender `COVERAGE_REASONS` (gelé) : c'est la ligne « hors support » de l'amendement proposé ci-dessous. Épinglé par un test : q̂ = 0 donne `under_calib` dans la bande additive (`buildIntervalRegion(y, y)`) et dans la bande à l'échelle (`conformScaledBand` sur des scores nuls). Les cases de chemin le disent dans leur texte (CM-4).

## E-13 / S-9 : décidé par le fondateur, non codé ici (lot CM-3c)

Décision du fondateur, verbatim (2026-10-03) : « Tout passer en 1.1.0. Toutes les empreintes changent, et il faut prévenir les appelants et republier la spécification. » C'est l'option (i) (passage global). CM-3b reste sans différence servie ; le changement est l'item **CONTRACT-1-1-0**, lot **CM-3c**, ligne **B-11** de l'ADR-CM (amendement daté du 2026-10-03, « nuit, 5 ») :

1. `schema_version` 1.0.0 → 1.1.0 pour **tout** verdict et toute décision (adaptateurs `adapter-shogen.ts:38`, `adapter-narabi.ts:26`, `adapter-book.ts:26`, `s2/instrument.ts:33`, harnais) ;
2. valeurs d'énumération ajoutées : `METHODS` gagne `risk-control` ; `COVERAGE_REASONS` gagne `calib_silence`, `calib_vetoed`, `out_of_support` ; aucune valeur retirée ni renommée ;
3. champs optionnels neufs `qhat_unit` (`"score"` ou `"label"`) et `h_star` (demi-largeur servie [0, h*]) ; un q̂ non fini n'est jamais écrit ;
4. conséquences assumées : `schema_version` est dans les octets de chaque verdict, donc **toutes** les empreintes de verdicts bougent, et l'épingle du rejeu (`b891dcab…`) aussi ; le schéma est fermé (`additionalProperties: false`, `method` en énumération fermée), donc un consommateur 1.0.0 refuse une ligne 1.1.0 : les appelants sont prévenus ;
5. répartition : RECHERCHES pour `packages/contracts`, `schemas/**`, les adaptateurs, les épingles et les tests ; MONARK pour la spécification publique (`KraidleAI/monark-kata-spec`), l'export du miroir public, le site, `apps/bell` et `apps/dojo` s'ils portent `schema_version`, et l'avis aux appelants ;
6. calendrier : CM-3c est programmé avec le chemin kata (CM-4), pour que les appelants servis voient un seul changement de format.

L'option (ii) (1.1.0 seulement sur les lignes kata) n'est pas retenue.

## Différences servies

**Aucune.** Le rejeu épinglé de CM-3a (`apps/harness/test/served-replay-cm3.test.ts`, sha256 `b891dcab…d238`, 111 appels) reste vert sans changement.

## Tests

Tests neufs, F2P contre `ad40dd5` (noms lus par l'espace de noms de `index.ts`, la base rougit par assertion), un tueur chacun, épingles pliées :
- `packages/hikae/test/cm3b-engine.test.ts` : bord h* sur une grille (q̂ × σ̂) contrôlé par un arrondi exact en BigInt côté test, plus l'équivalence |r| ≤ h* ⇔ fl(|r| / σ̂) ≤ q̂ aux voisins d'un ulp ; forme [0, h*] via `buildIntervalRegion`, refus (`sigmaHat`, négatifs, q̂ = 0 / E-14) ; empreinte ordonnée (vecteur croisé du banc) ; canonicaliseur (ordre des clés, nombres, refus).

## Oracle

`tsc`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet`, `node --test` sur `packages/hikae/test` et `apps/harness/test` (rejeu épinglé inchangé), `node scripts/red-proof.mjs --base ad40dd5 --gel <sha du code> --repo /home/user/monark-governance-cm3 --draw 8 --seed 31`, R-25 ≤ 547.

## Questions ouvertes

1. L'amendement E-13/S-9 ci-dessus (fondateur, contrôle par diff de MONARK).
2. h* au servi (MONARK, avis §« MONARK's decision ») : CM-4 sert [0, h*] des classes kata ; `conformInterval` (USDe, liq) garde la bande additive et l'écart d'un demi-ulp écrit (B-7).

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- **Bord h*** : la marche d'un ulp depuis fl(q̂ · σ̂) ne finissait pas pour un q̂ nul ou sous-normal avec un σ̂ grand, et la `RangeError` sortait de `conformScaledBand` (pas fermé). Remplacée par une bissection sur les motifs de bits (63 pas). Couples du relecteur vérifiés par la règle exacte du test : (6.752248630174e-311, 1.0124145746231078e28) → 6.836074924667226e-283, (5e-324, 1e300) → 7.410984687618697e-24, (0, 1e300) → 2.470328229206233e-24.
- **Canonicaliseur** : refuse les tableaux creux, les objets non simples (`Date`, `Map`, nombre emballé ; prototype nul admis), les chaînes et clés mal formées (surrogate isolée), les cycles (un objet partagé sans cycle passe).
- **Unités de [0, h*]** écrites (en-tête de `scaled-band.ts`, §E-1 ci-dessus).
- **E-13/S-9 point 4** : remplacé par la décision du fondateur (section ci-dessus).
- **Tests** : refus nommé de q̂ négatif (`/qhat -1/`) ; q̂ > 0 avec h* = 0 (q̂ 5e-324, σ̂ 0,3) rend `under_calib` ; q̂ sous-normal à σ̂ 1000 ne lève plus. Écart : le relecteur attendait `under_calib` à σ̂ 1000 ; la règle donne un bord h* > 0 vérifié exactement (fl(h*/1000) ≤ 5e-324, pas son successeur), donc une bande [0, h*] servie par le moteur ; le test l'épingle. Refuser les q̂ sous-normaux serait une règle neuve (à décider, CM-4).
