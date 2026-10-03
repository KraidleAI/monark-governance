# G7 du lot CM-1 : BYO-NEAR-NAME-1 (S-11)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` (ACCEPTÉ 2026-10-03), §5 B-1 ; plan `docs/G0-lot-cm-1-byo-near-name.md`.
- **Base** : `404480e8` ; branche `recherches/cm-1-byo-near-name`.

## Oracle

- Tests d'abord : T-1, T-2, T-3 rouges à la base, T-4 vert (mesuré par l'auteur et par la G2).
- `npx tsc --noEmit` vert ; eslint vert sur les fichiers changés ; `gate:vocab` vert ; `lint:ratchet` 69/69.
- `npm test` (Node 24.21.0) : 1 seul échec, `bell-served.test.ts:153`, l'échec d'environnement du clone superficiel déjà présent à la base. Des tests de `test/lot-retire.test.ts` manquent au décompte de la suite complète (sorties concurrentes) ; lancés seuls, ils passent (38 tests, 0 échec).
- R-25 : 167 lignes de code et de tests au premier commit (docs exclus), sous 1 150.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Les neuf noms imitants de la sonde de MONARK sont refusés ; le message de la garde exacte est inchangé octet pour octet ; aucun contrôle hors du chemin BYO ; aucun faux refus trouvé ; aucun chemin vers une 500 au servi.
- 15 mutants : 13 tués ; M10 (liq retirée de `CLASS_LOCKED`) et M12 (ancre `^` retirée du motif kata) survivaient. Corrections 1 et 2 pliées (deux cas de test ajoutés) ; les deux mutants sont maintenant tués (rejoué par l'auteur). Correction 3 pliée au G0 : au servi, le schéma gelé `^[ -~]+$` refuse déjà les non-ASCII ; BYO-HOMOGLYPH-1 se réduit à l'appel direct.

## Changements servis livrés

B-1 (ce lot) et B-0 (hérité de la base, chantier 2 : plafond de tau en BYO set, ensemble vide en `intent_not_in_region`), seuls, conformément au §5 de l'ADR. La sentinelle de la base (NARABI-L-1) est un changement de MONARK, déployé par lui.

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03`. Déploiement : par MONARK, sur le sha de fusion, après le go de l'investisseur.
