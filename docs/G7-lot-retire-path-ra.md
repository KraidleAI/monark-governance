# G7 du lot R-a d ENGINE-ROW-RETIRE-PATH-1 : la chaîne des listes de retrait, le recouvrement de la projection, `LIVE_N_MAX`

- **Base** : `a43b0126`. **PR** : #209, branche `monark/retire-path-ra`, tête `79fbc1ac`. **Fusion au tronc** : `f2152918` (tronc avant
  fusion `d8fe354c`).
- **G0** : `docs/G0-lot-retire-path-ra.md`. **Runtime** : Node 24.21.0 (win32).
- **Sources du G0 citées par sha256**, avec leurs chemins (demande de RECHERCHES, `8437a42`) :
  - brouillon de G0 : `recherches:coordination/pieces/2026-10-06-G0-retire-path/G0-ENGINE-ROW-RETIRE-PATH-1-brouillon.md`
    (sha256 `140330449c12b121…`) ;
  - addendum 9 : `recherches:decisions/0006-ADR-addendum-9-live-k-quarter-counts.md` (sha256 `8ae73cdb…`), publié en ligne P0
    (`monark-precommitments` `43472d7`).
- **Construction** : worker `claude-opus-5-5` (effort max) du workflow de MONARK ; vérificateur neuf `claude-opus-5-5` (effort max) :
  APPROUVE-AVEC-CORRECTIONS, 2 moyennes et 7 mineures ; pli par un worker (rôle corrections) sur les décisions de MONARK et l ajout de
  RECHERCHES ; diff relu par MONARK, qui a réécrit la raison de la voie (a) au G0 (Tuyaux) avant le commit.

## Vérification et G2

- **Vérificateur** (pièce `recherches:coordination/pieces/2026-10-06-retire-path-ra/VERIFICATION-Ra.json`) :
  - M-1 : la garde n était pas testée à travers son lecteur ;
  - M-2 : la règle du cumul n avait pas de consommateur ;
  - m-1 à m-7. Table du pli : `PLI-Ra.md` (même pièce).
- **M-2, voie (a)** : la garde lit la chaîne `GuardPins.retireLists`, chacune contre sa précédente. Une liste qui omet un retrait
  antérieur est refusée, quel que soit le statut de la ligne dans la table (ajout de RECHERCHES, `4b0a929`).
- **G2 de RECHERCHES : APPROUVE** (`8437a42`). Une note mineure (N-1, en-tête de `readRetireList`) et deux points connus à écrire comme
  limites (`evidence_sha256`, cause `adr:`) : items ci-dessous.

## Mesures

- **red-proof** sur `79fbc1ac` : 10 tests jugés (module neuf), 10 tueurs tués par assertion. **Mutants à la main** (pli) :
  - MF1 (lecteur contourné) ;
  - MF2 (région exigée retirée) ;
  - MF3 (chaîne retirée) ;
  - MF4 (contrôle préalable du registre vidé) ;
  - MF5 (veto forcé) ;
  - MF6 (dossier admis dans le nom) ;
  - KF1 et KF2.

  Tous tués par assertion.
- **Rejeu Windows sur la fusion** : `apps/harness/test/*.test.ts` 270/270 ; `test/ci-gates.test.ts` 44/44.
- **Oracles** : G1 sur `79fbc1ac`, sortie 0 (`46c0ba51…`) ; G7 sur la fusion `f2152918` : sortie 0 (record `ad0e1bf9…`).
- **CI** : 10/10 sur `79fbc1ac`. **R-25** : 370 (74 lignes suivies, 296 neuves), sous 1 150.
- **Branchement** : non servi. La garde n a aucun appelant hors des tests ; le chargeur d E-2a est le tuyau absent
  (RETIRE-LISTS-E2A-PIPE-1). R-a n est « built » dans aucun registre public.

## `error_origin`

- **Générateur (MONARK)** : M-1, M-2, m-1, m-2, m-4 à m-6, pliés avant la PR.
- **Orchestrateur (MONARK)** : la raison écrite au G0 pour la voie (a) disait la garde sur un chemin servi alors que le même G0 la dit
  hors du graphe servi ; relevé par le worker du pli, réécrit par MONARK avant le commit.

## Items formés (ETAT)

- RETIRE-LISTS-E2A-PIPE-1 (Q-R7), RETIRE-CHILD-ROW-1 (Q-R8), RETIRE-EVIDENCE-BIND-1 (Q-R9), RETIRE-ADR-CAUSE-FILE-1,
  RETIRE-HEADER-WORDING-1 (N-1), KILLER-ASSERT-KILL-1 (Q-R11).
- Q-R10 (précision datée de CONTRACT l.492) reste à R-b, à la prochaine révision datée de la spécification.
