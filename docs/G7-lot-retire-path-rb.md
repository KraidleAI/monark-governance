# G7 du lot R-b d ENGINE-ROW-RETIRE-PATH-1 : versions datées des tables, dossier daté jamais réécrit, ligne retirée publiée avec sa liste

- **Base** : `a43b0126`. **PR** : #211, branche `monark/retire-path-rb`, tête `9bccd2e5`. **Fusion au tronc** : `5348b9d2` (tronc avant
  fusion `57a131fc`, qui porte R-a).
- **G0** : `docs/G0-lot-retire-path-rb.md`. **Runtime** : Node 24.21.0 (win32).
- **Construction** : worker `claude-opus-5-5` (effort max) du workflow de MONARK ; vérificateur neuf `claude-opus-5-5` (effort max) :
  REFUSE (B-1 bloquante, M-1, M-2, dix mineures) ; pli par un worker (rôle corrections) sur les décisions de MONARK et les deux
  précisions de RECHERCHES (`4b0a929`) ; diff relu par MONARK.

## Vérification et G2

- **Vérificateur** (pièce `recherches:coordination/pieces/2026-10-06-retire-path-rb/VERIFICATION-Rb.json`, table du pli `PLI-Rb.md`) :
  B-1, `--write` sans `--date` réécrivait en place un dossier daté publié et sortait 0.
- **Pli** :
  - un dossier daté n est jamais réécrit, quelle que soit l option, sa propre date comprise ;
  - sans `--date`, le comportement de la base est gardé sous `contract-1.1.0/`, écrit et testé mot pour mot ;
  - une ligne retirée n est publiée que d un dossier daté, avec la liste de son dossier (`retire_list_missing`).
- **Q-Rb-9** : le refus n est pas étendu à `contract-1.1.0/`, ce qui contredirait M-2 ; le filet est l épingle de la CI. Accord de
  RECHERCHES ; item SPEC-WRITER-PIN-GUARD-1.
- **G2 de RECHERCHES : APPROUVE** (`d7a5a13`). Note mineure : la liste copiée dans un dossier daté prend le nom du dossier, et la note de
  version doit le dire ; portée avec RETIRE-HEADER-WORDING-1.

## Mesures

- **red-proof** (pli, `--draw 8 --seed 31`) : 8 tests jugés, tous F2P ; 8 tueurs tués par assertion. 19 mutants à la main tués ; tueurs
  existants re-tirés 45 sur 46 (le survivant, POSIX, est sauté sous win32, comme au rapport du vérificateur).
- **Rejeu Windows sur le tronc** (fusions de #211 puis #210) : tests de la spécification, de R-b, du lot 1a et `ci-gates`, 129 tests,
  128 verts, 1 sauté (win32), 0 échec.
- **Oracles** : G1 sur `9bccd2e5`, sortie 0 (`78605703…`). Un premier oracle G7, lancé une seule fois sur le tronc après les deux
  fusions (`0c2e487d`, base `57a131fc`), est sorti 1 sur la seule porte R-25 : 1 529 lignes, les deux lots comptés ensemble
  (record `0c4db2c5…`, toutes les autres portes et tous les tests verts). Oracle G7 refait sur la seule fusion de R-b (`5348b9d2`, base
  `57a131fc`, worktree détaché) : sortie 0 (record `b569bd5c…`).
- **CI** : 10/10 sur `9bccd2e5`. **R-25** : 484, sous 1 150.

## `error_origin`

- **Générateur (MONARK)** : B-1, M-1, M-2 et les mineures, pliés avant la PR.
- **Orchestrateur (MONARK)** : un seul oracle G7 lancé sur deux fusions pour gagner du temps ; sa porte R-25 a compté les deux lots
  ensemble et l a refusé. Un oracle G7 par fusion, chacun sur sa base, est la règle ; refait ainsi.

## Items formés (ETAT)

- SPEC-WRITER-PIN-GUARD-1, SPEC-DATED-RELEASE-ENTRY-1, SPEC-TABLES-TEST-PER-DIR-1, RETIRE-LATENCY-REHEARSAL-1, RETIRE-CAUSE-VOCAB-1,
  RETIRE-RUNBOOK-1, RETIRE-NEXT-CONTRACT-1 ; l entrée d inventaire de TEST-GIT-ENV-ISOLATION-1 ; RETIRE-HEADER-WORDING-1 étendu à la
  note de la G2.
- **D6 d ADR 0006** (« livré et mesuré ») reste ouvert : la répétition chronométrée (RETIRE-LATENCY-REHEARSAL-1) vient maintenant.
