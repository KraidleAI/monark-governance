# G0 du lot CM-3b : moteur, seconde moitié (E-1/S-4 côté moteur, E-2, S-13 ; raisons E-10, E-14 ; amendement proposé E-13/S-9)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3 (CM-3 : aucune différence servie), §8 (remède ou raison écrite), R-2, R-3. Audit `recherches:monark/AUDIT-P3-2026-10-01.md` (S-4/E-1 §1, E-2 et S-13 §2, E-10 §2, E-13/S-9 et E-14 §3). Avis `recherches:decisions/0005-AVIS-advisor-conformal-P2a-band-edge.md` (bord de bande). Format du banc P2 : `recherches:kata/registry/FORMAT.md` l.36 et `recherches:kata/bench/calibrate.ts:17` (`seqDigest`).
- **Base** : `ad40dd5` (tête de `recherches/cm-3a`, PR #108 non fusionnée ; CM-3b s'empile dessus, branche `recherches/cm-3b`). Auteur : RECHERCHES. Borne locale R-25 : 547 lignes comptées contre `ad40dd5`. `schemas/**` et `packages/contracts/**` ne sont pas touchés.

## Règles

### E-1 / S-4 côté moteur : bande à l'échelle [0, h*] (`packages/hikae/src/scaled-band.ts`, fichier neuf)

`conformScaledBand(scores, sigmaHat, alphaDec, baseDeltaDec, nMin, { attempt, spendIndex })` :
1. `riskControlRow` de CM-3a, domaine `band` (aucun score négatif, aucun non fini), sans `silenceAt` (une bande n'est jamais en silence par q̂) ;
2. `sigmaHat` fini et > 0, sinon `under_calib` ; q̂ = 0 rend `under_calib` (NDG-1, voir E-14) ;
3. h* = le plus grand double h ≥ 0 tel que fl(h / σ̂) ≤ q̂ (avis du conformal advisor) : départ de fl(q̂ · σ̂), puis pas d'un ulp (`nextUp` / `nextDown`) ; produit non fini rend `under_calib` ; par la monotonie de la division correctement arrondie, |r| ≤ h* équivaut double pour double à fl(|r| / σ̂) ≤ q̂ ;
4. région `buildIntervalRegion(0, h*)` (bande [0, h*], fermée) ; le résultat porte la ligne (`qhat`, `rank`, `kStar`, `kObs`, `calibMisses`, `attempt`, `spendIndex`, `testDelta`, `missBound`), `hStar` et la région.

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

## E-13 / S-9 : amendement daté proposé (non codé, contrat gelé)

Texte proposé pour l'ADR-CM, à valider par le fondateur et à contrôler par diff par MONARK avant tout code (R-3 : additif seulement, version de contrat incrémentée) :

> **Amendement daté 2026-10-0x : contrat `CoverageVerdict` pour les lignes de contrôle du risque (E-13/S-9).**
> 1. `METHODS` (`contracts/src/enums.ts:27`, `schemas/coverage-verdict.schema.json:25`) gagne la valeur `risk-control` (rang n − k*, delta de test dépensé, ADR 0004 D2-D3) ; `split` et `hac-cp` restent. Une ligne F-7 servie porte `method: "risk-control"`.
> 2. `COVERAGE_REASONS` gagne trois valeurs : `calib_silence` (case en silence : contrôle de runs ou erreurs au-dessus de k*), `calib_vetoed` (veto du TEST), `out_of_support` (σ̂ ou ŷ hors du support CALIB). Aucune valeur n'est retirée ni renommée ; `under_calib` garde son sens (n, n0, q̂ = 0 de NDG-1).
> 3. Unité de q̂ : champ optionnel neuf `qhat_unit` (`"score"` pour un multiplicateur sans unité, `"label"` quand la région porte q̂ lui-même) et champ optionnel `h_star` (demi-largeur servie [0, h*] d'une bande à l'échelle) ; un q̂ non fini n'est jamais écrit (`null` réservé à `under_calib`).
> 4. `schema_version` 1.0.0 → 1.1.0 ; les verdicts des classes servies aujourd'hui (USDe, liq, cascade, BYO) restent octet pour octet ceux de 1.0.0 hors `schema_version` (aucun champ neuf émis) ; empreintes `openapi.json` et description déplacées, liste B neuve au §5 de l'ADR-CM, go du fondateur.
> 5. Miroir public et spécification publique : MONARK.

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
