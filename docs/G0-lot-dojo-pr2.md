claude-opus-5-5[1m]

# G0 — journal du lot Dōjō PR-2 (collecteur quotidien ; coupe PR-2-1 / PR-2-2 ; rayon d'effet PR-1b-3), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` (décision 133), effort high (mission), contexte frais. Worker planificateur ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : `F:/tmp/dojo/mission-g0-pr2.md` (25 l.), sha256 `6f3300dbfc348ffa3abc880ef27877dfc08b4e15693cdd92c1d6d443affaddb1` ; horodatage de mission 2026-09-27T02:40Z.
- **Livrable** : `docs/adr/ADR-DOJO-PR-2.md` (322 l., première ligne = modèle résolu), **sha256 `a6b99c9141175400232bf76026930aba81dda12dee477296d1394991d5814538`**, calculé à 02:57:09Z (`date -u`) ; non committé ; aucune édition après ce hachage. Un premier hachage (`f0b8834d…9b07`, 02:53:36Z) précède les corrections de la seconde consultation advisor ; il ne désigne plus le livrable.
- **Base** : worktree `F:/Monark-wt-dojo`, branche `lot/dojo-snapshot-1`, HEAD `5022075`. `git status --short` à l'ouverture : `?? docs/dojo/FAITS-pr2-lectures-2026-09-27.md`, `?? docs/dojo/FAITS-probe-12-2026-09-27.md` (déposés par l'orchestrateur, attendus, non touchés ; sha256 égaux aux copies du tronc). À la remise : ces deux fichiers, plus `?? docs/adr/ADR-DOJO-PR-2.md` et `?? docs/G0-lot-dojo-pr2.md`.

## Lu (sha256 recalculés à 02:37:32Z)

| Entrée | sha256 | Lecture |
|---|---|---|
| mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (1 033 l., `5022075`) | `791fc94f4631e2d3e99010a6240d4852a1a22d4d0430e7e23200736e581acfb9` | §0-§7, §10-§12, amendements 4 à 9 en entier ; §8, §9, §13, §14 et amendements 1 à 3 par extraits |
| `docs/dojo/FAITS-pr2-lectures-2026-09-27.md` (83 l.) | `3b86f76ba3d206f25ed95710678cf65f75212cdd6738457df2bbab001e624e11` | en entier |
| `docs/dojo/FAITS-probe-12-2026-09-27.md` (77 l.) | `c1f1cedfcf852ab28a0839dd87b2c5014083e84b2e037febb10b70ae12d92d9e` | en entier |
| `F:/PRODUITS/dojo/randomness/RAPPORT-DOJO-RANDOMNESS-1-2026-09-27.md` (326 l.) | `a8686e584816c7d2f973bf661bbac1e91155274790108d2bbb6889bcdb329f33` | en entier |
| `docs/adr/ADR-DOJO-PR-2B.md` (904 l.) | `20e4d5d58dcfc821940bf93244ab63369286f85b9e6c346bca998a49f3c565fd` | §0, D-3 (entrées), D-10 à D-14, §3, corrections du checkpoint-1 bref |
| `apps/dojo/scripts/dojo-core.mjs` | `59273423b0eadf4ab6264044ee07bc0c94e1f1f95deec7091cd203cdefdd09a3` | l.1-135, l.210-260 |
| `apps/dojo/scripts/dojo-chain.mjs` | `9baa03c4a853c4fd563cfa22e7703f7f3cbeadb41e6f12c2d123526e3a2264d3` | l.17-60, recherches |
| `apps/dojo/scripts/dojo-verify.mjs` | `5867b4dff1731e149afc7a1a3b4bc4db549356a72b39ff82c7bce2341137bf9d` | l.1-100, recherches |
| `apps/bell/src/collect.ts` | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` | recherches, montage du garde |
| `apps/bell/src/quorum.ts` | `5871b4b60fc416e3ab52de1c554c164e1d5bb1922b6fb869318e6312b3a51d53` | l.1-60, l.85-170 |
| `packages/rpc-guard/src/{bell-methods,transport,index,tariff}.ts` | — | recherches (GET sans clé, `Retry-After`, barème) |
| `F:/PRODUITS/dojo-mirror/probe-12/probe-12.mjs` et sortie `out/2026-09-27T0229Z/` (`SHA256SUMS`, `calls.jsonl`, réponses brutes) | script `0ad3f985…763c` | recherches ; réponses lues par le script de mesure |

## Mesure hors ligne (sans réseau)

`F:/tmp/claude/F--Monark/e03dd7cc-4452-4c79-9aa6-58827dad4d19/scratchpad/m-pr2-offline.mjs` (sha256 `c2a21514d95a0e069d00aa3be33b25355e6bfa81fd19342a3e53b522b6d8a5bd`), sortie `out-m-pr2-offline.txt` (`5b886fd9e53acde4296fe99787bed8f6273b3455f0de77f74a9b8b19cc8c6a3f`) : 0 propriétaire à plusieurs comptes, 0 point d'ordre faible sur 1 110, 1 144 `initialized`, `immutableOwner` sur 1 140, âge Pyth 41 s, r_d = 32 554 612 pour le 2026-09-27.

## Décisions (une ligne, détail dans l'ADR)

- D-1 coupe : PR-2-1 pure 420 asc. (≈ 882) ; PR-2-2 réseau 395 (≈ 830) ; PR-1b-3 rayon d'effet 140 (≈ 294) ; lot rpc-guard DRAND-RELAY-GET-1 hors série 45 ; ordre PR-2-1 → PR-1b-3 → PR-2-2.
- D-2 gPA `memcmp` offset 0 seul, `finalized`, `jsonParsed`, `withContext` ; jamais `dataSize` (M-Q11) ; refus « parseur absent » (M-Q13).
- D-3 Pyth `7UVimf…` sous quorum, récepteur, Full, `feed_id`, fraîcheur 165 s proposée.
- D-4 `Pool` décodé (offsets 139, 171, 245), r_S = solde SOL enveloppé + `virtual_quote_reserves` (M-Q12).
- D-5 balise drand forme (ii), champ d'ancre `read_rule`, `beacon` au `snapshot`, tout le jour ou rien, conditions des relais avant le G1 de PR-2-2.
- D-6 menaces : hôte public retirable (divergence avec PR-2b), absence masquée par un opérateur menteur, 53 crédits Helius par jour.
- D-7 tuyaux TU-1a, TU-B, TU-1b, TU-1p, TU-1c (absent, PR-3a), TU-1h (PR-2b), TU-11a ; test `dojo_collect_to_verify_end_to_end`.
- D-8 `reads` à clés fermées, aucun code de refus nouveau ; jour d'ancre sans lecture.

## Questions

- Investisseur : Q-I1 (K = 4), Q-I2 (marge Pyth 165 s), Q-I3 (forme (ii) avec abstention sans balise et minuterie avant le premier jour lu).
- Orchestrateur : Q-O1 (coupe), Q-O2 (solana-foundation opérateur ici, témoin pour PR-2b), Q-O3 (FAITS probe-12 : « ≈ 3 min » contre 41 s ; arrondi de `virtual_quote_reserves`), Q-O4 (DOJO-LINES-COMMIT-1), Q-O5 (P-3, acte sortant), Q-O6 (nom et portée du test d'intégration), Q-O7 (auteur du pli de la mère PLI-MERE-PR2-1).
- Consultation formée CF-1 (advisor, TY-2 départage à deux).

## Conduite

- Aucun appel réseau ni RPC ; aucun navigateur ; `git` en lecture seule (`status --short`, `rev-parse`, `log --oneline`) ; aucun `GIT_DIR`, `GIT_WORK_TREE`, `--write-tree` ; rien écrit sur C: ; écritures dans le worktree : l'ADR et ce journal, par l'outil d'écriture (aucun heredoc pour un texte portant des barres obliques inverses, HARNESS-BASH-BACKSLASH-1).
- Advisor intégré : (1) après l'orientation, avant l'écriture : R-25 par deltas depuis la base de la mère (555), borne exacte 547 ; tuyau des adresses de la veille ; aucun code de refus nouveau ; résiduel de (ii) tel que le rapport le pose ; divergence solana-foundation nommée ; écarts mesurés consignés ; portée du test d'intégration ; table des entrées de la mère ; mécanique de remise. Retenus, vérifiés sur pièce. (2) Avant la remise, sur l'ADR haché `f0b8834d…` : deux corrections, faites puis re-hachées. (a) §1.3 « Activité » : le FAITS probe-12 déduit ≈ 2,9 jours de 624 011 emplacements × 0,4 s ; recalculé depuis les `blockTime` de la même page (1 790 475 233 − 1 790 308 003 = 167 230 s = 1,94 jour), A ≈ 517 signatures par jour ; écart É-8, Q-O3 étendue. (b) import de `quorum2` nommé (mère T-7) : mint, `Pool`, SOL enveloppé et Pyth par `quorum2` ; énumération par quorum par compte, écart de forme É-9. Portée du test d'intégration (jusqu'au vérificateur, Q-O6) confirmée comme déclarée. Conseil, jamais verdict.
- Divergences entre la mission et ce G0, déclarées : estimation « ≤ 550 ⇒ < 1 150 » lue ≤ 547 ; rayon d'effet PR-1b-3 chiffré comme PR distincte, sans retirer de contenu à PR-2-1 et PR-2-2 ; test d'intégration prolongé jusqu'au vérificateur (+85 lignes) sous l'ordre PR-1b-3 avant PR-2-2 ; `tokenAccountState` (FAITS PR-2 §2) non retenu, conformément à la forme mesurée par la sonde.

## Pli cp-1 (2026-09-27)

- **Modèle résolu (R-1)** : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` (décision 133), effort high (mission), contexte frais ; worker documentaire ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : `F:/tmp/dojo/mission-corr-cp1-pr2.md` (17 l.), sha256 `4be984c8e990536b409bf8407d0122f9e9c42cac64aaf7e5d39440107b83d189` ; horodatage de passe 2026-09-27T04:20Z. Horloge de la machine (`date -u`) : 03:12:06Z (orientation), 03:21:26Z (copie de l'ADR plié) ; écart d'environ 68 min avec l'horodatage de passe et avec les entrées CHANTIERS datées 04:0x à 04:2x : déclaré, non résolu ; les lignes du pli portent la date de la mission, sans heure.
- **Entrées** (sha256 recalculés) : rapport cp-1 `F:/tmp/dojo/cp1-pr2/CP1-report.md` `f813db31711f9752eec24be4e9392948f3b4fa1c6f5dc80237c9e6ef7fdc3dba` (54 l., lu en entier) ; avis CF-1 `F:/tmp/dojo/cf1-pr2/AVIS-CF-1.md` `987d354b7273a047dbe1ebfd44aa0c9179e8fb7bf5ddaf78b6810166e978b01b` (lu en entier) ; `F:/Monark/docs/CHANTIERS.md` (tronc) `f43bb2ab39b8e2725ff0ef8abec528963fddc3067d3ab0299791e4916dec25ce`, entrées l.1719 (04:0x), l.1721 (04:1x, décision 248), l.1723 (04:2x, décision sur CF-1) ; FAITS probe-12 `2a2a2d70027aa4e5ef524512e441a5716f34e444bcb3506fa6a7250f1f19efdc` (81 l., dernière ligne sans saut final : `wc -l` = 80 ; worktree = tronc).
- **ADR** `docs/adr/ADR-DOJO-PR-2.md` : avant `a6b99c9141175400232bf76026930aba81dda12dee477296d1394991d5814538`, 322 l. ; après **`63185cb03a3cee3395875c64a9f11154f11dc7068b44cd3b9684dfdc9dd33086`**, 392 l. (état intermédiaire `95d6009b…eed7`, avant la retouche de `fix2.mjs`) ; 0 CR ; fichier non suivi (`git diff --stat` vide par construction).
- **Journal** (ce fichier) : avant `8d88b979fc00ded0762d02fa36e492c6dbfcbdbfd2e0178ecfef067121b95f15`, 52 l. mesurées (`wc -l` ; le rapport cp-1 en compte 53) ; sha256 après ce pli rendu hors du fichier.
- **Mécanique** : `apply.mjs` (sha256 `06d73298755b7aeb9a842ca7298d5ab0ee7705f7337c72baf2bf716052112e12`) et `inserts.txt` (`3c28c210d196454046db799009ab8fccc4104662c6f35b26a1c68d445a643252`), sous `F:/tmp/claude/F--Monark/e03dd7cc-4452-4c79-9aa6-58827dad4d19/scratchpad/pli-cp1-pr2/` : sha256 d'entrée exigé, 25 lignes d'ancrage contrôlées par leur début, ancres de remplacement uniques, tout ou rien, sur copie puis recopie ; verbatims 248 et CF-1 lus par le script dans CHANTIERS (l.1721, l.1723) et re-comparés octet pour octet (`cmp`) après écriture. Retouche `fix2.mjs` (sha256 `9a93863a75a8a78224caf251aa0df5e318994de10b2ed90924be7e8d81ef1d79`, même répertoire), après la seconde consultation advisor : `accounts_no_quorum_persistent` devient une liste triée d'objets à clés fermées `{account}` (le compte est sa longueur), lecture de la décision « clés fermées, sans libellé » et du défaut « ne dit pas quel compte » de l'avis ; cinq remplacements à ancre unique (l.167, 177, 184, 230, 247), sha256 d'entrée exigé.
- **Lignes ajoutées** (70, numérotation après le pli) : C-V-1 l.25, 150, 189 ; C-V-2 l.12, 61-62, 98 ; C-V-3 l.125, 230 ; C-V-4 l.113, 237 ; C-V-5 l.304 ; décision 248 l.24, 135, 157, 309-310, 318-322 (verbatim l.320) ; CF-1 l.167, 177, 184, 240-247 (PR-2-3), 257, 262 (R-25, tous les points), 278-279 (TY-2), 305-308, 334, 352-355, 362 (provenance) ; amendement récapitulatif l.370-392 (verbatim CF-1 l.388).
- **Lignes modifiées en place** (19, numérotation d'avant) : σ → β (28 occurrences) aux l.19, 68, 69, 89, 104, 140, 142, 143, 144, 145, 194, 205, 214, 220, 247, 248, 296 ; l.173 réécrite (β ; `usd_per_sol_publish_time` plus vieux que `sol_usd_max_age_s`) ; l.217 (M-21 : β ; M-23 réécrit avec `usd_per_sol_publish_time`). Aucune ligne supprimée ; en-tête Statut et Dates (l.5-6) non touché.
- **Choix du rédacteur, soumis au relecteur** : (1) β (`beacon_sig`), proposition de la mission ; clé publiée `beacon.signature` inchangée. (2) `accounts_no_quorum_persistent` (liste `{account}`) dans le paquet seul, pas dans le `snapshot` (motif et borne publique min_i au D-8). (3) Fin du jour d'un jour abstenu = T_{d+1}. (4) Refus du collecteur `day_not_ended` et mutants M-Q20 (nom de la mission), M-Q21, M-Q22, M-W1 à M-W6. (5) Estimation de PR-2-3 : 110 ascendantes, borne haute (avis : 60 à 90). (6) Persistance comptée sur « sans quorum » (désaccord ou faute), lettre de la décision ; la cause est gardée par lecture (`no_quorum_accounts`).
- **Conduite** : aucun réseau ; aucun `git` écrivant (`status --short`, `log -1`, `branch --show-current` seulement) ; aucun `GIT_DIR`, `GIT_WORK_TREE`, `--write-tree` ; rien écrit sur C: ; écritures : l'ADR et ce journal dans le worktree, le reste dans le répertoire de session. `git status --short` avant et après : les quatre mêmes `??`.
- **Advisor intégré** : consulté après l'orientation, avant l'écriture (portée réelle du renommage, horloge, verbatims par commande, choix « paquet ou snapshot » à chiffrer, verrous de C-V-4) ; points retenus, vérifiés sur pièce. Conseil, jamais verdict.
