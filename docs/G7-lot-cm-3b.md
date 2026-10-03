# G7 du lot CM-3b : bande à l'échelle [0, h*], empreinte ordonnée, canonicaliseur F-7 (S-4/E-1 moteur, E-2, S-13) ; raisons E-10, E-14 ; amendement E-13/S-9 proposé

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3, §8, R-2, R-3. Plan : `docs/G0-lot-cm-3b.md`.
- **Base** : `ad40dd5` (tête de `recherches/cm-3a`, PR #108). Branche `recherches/cm-3b`. Commits : `9efecb4` (G0), `86e4798` (tests rouges), `0430d28` (code), `04430e4` (G7) ; corrections de la G2 : `b96054b` (tests), `307a163` (code, **gel**), puis G0, ADR-CM et G7.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Bord h* par bissection sur les motifs de bits (la marche d'un ulp ne finissait pas pour q̂ nul ou sous-normal avec σ̂ grand) ; les trois couples du relecteur sont égaux et vérifiés par la règle exacte du test.
- `canonicalRow` refuse tableaux creux, objets non simples, surrogates isolées, cycles.
- Unités de [0, h*] écrites (|r| ou label positif, transposition de l'avis 0005).
- Tests : refus nommé de q̂ négatif, h* = 0 avec q̂ > 0 rend `under_calib`, q̂ sous-normal à σ̂ 1000 sans exception. **Écart** : à σ̂ 1000 le moteur sert un bord h* > 0 exact (le relecteur attendait `under_calib`) ; refuser les q̂ sous-normaux serait une règle neuve, laissée à CM-4.
- **E-13/S-9** : décision du fondateur (« Tout passer en 1.1.0 … ») écrite au G0 et en amendement daté de l'ADR-CM (« nuit, 4 ») : B-11, lot CM-3c (CONTRACT-1-1-0), §3 ligne CM-3 amendée, répartition RECHERCHES / MONARK, calendrier avec CM-4. Non codé ici.

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
