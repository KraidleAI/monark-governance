# G2 — lot BELL-SHORTPAGE-1 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G2 — Lot BELL-SHORTPAGE-1 (`lot/bell-shortpage-1` @ `e5dfbb4`, base `de30eab`)

Relecteur G2, instance séparée, contexte frais. Le rendu intégral est `F:\tmp\g2-bellsp1\G2.md` (534 lignes, sha256 `71742791b1fa374cc11dac7d7bdea6c4eac59e57ebaf6ce148d2cd8977fd9971`, 0 octet NUL, écrit au fil de l'eau jusqu'à 22:17:14Z). Ce message en reprend l'essentiel ; le fichier porte en plus les tables complètes et les journaux cités.

**Verdict : PASS-AVEC-CORRECTIONS.** Trois corrections de tests sont à poser avant la fusion, une correction de l'ADR au commit qui insère D1-nonies. Aucun changement de code n'est requis.

Aucun commit, aucun workflow, aucun appel réseau ni Helius. Rien n'a été écrit dans `F:\Monark` ni dans `F:\Monark-wt-*`. `F:\course-bell\bell-b3d-run-tslax-completion\` n'a été que lu (mtimes inchangés).

## 0. Reprise après la seconde coupure (~21:37 UTC)

- **Clone de revue `tree`** : intact, 0 octet NUL, sha livrés. L'oracle de l'arbre fusionné s'était terminé avant la coupure (21:36:08Z).
- **Clone de mutants `mtree`** : il était resté muté (mutant G03 en cours au moment de la coupure). Je l'ai restauré depuis le blob, avec sha et `cmp` égaux à la copie dorée.
- **Batterie G2** : relancée en entier avec un harnais durci (marqueur de reprise, journal fsyncé ligne par ligne).
- **Piège d'outillage mesuré** : l'outil Bash transforme `\\` en `\`. Il n'a touché qu'un prototype de test, corrigé puis rejoué.

## 1. Ce que le lot fait bien (tout re-mesuré)

- **Ordre C-1 respecté** (`scanFullMint` `:352-373`) :
  - une seule sonde, qui rejoue la requête de la page (`pageParams`) avec son token ;
  - l'ancre C-8 n'est demandée que si la sonde est vide ;
  - le commit n'a lieu que si l'ancre est égale ;
  - sinon le scan s'arrête en `not_full_pages` avant tout `events.push`, `n +=` ou `onPage` ;
  - l'ancre n'est jamais rejouée (`endAnchorOk === undefined`) ;
  - sonde et ancre sont dans le `try`, donc un dépassement de budget donne `budget_exhausted` sans rien committer.
- **Invariants et format inchangés** :
  - N et pages ne bougent qu'au commit ; la reprise est idempotente ;
  - `--allow-short-pages` ne déclenche aucune sonde ;
  - la provenance figure dans l'artefact et dans le rapport ;
  - les 9 fichiers du gel U-4b sont byte-identiques ;
  - `ledger-format-lock` est vert, lancé seul comme dans la suite ;
  - `LedgerEntry`, `LedgerRecord` et la chaîne sont identiques à la base.
- **Oracles** (8 clés retirées par `env -u` sur chaque exécution) :

| Arbre | Gates | Tests / pass / fail / skip | Notes |
|---|---|---|---|
| Lot | 7 à exit 0 | 930 / 929 / 0 / 1 | `lint:ratchet` 69/69 ; R-25 = 322 lignes |
| Fusion à blanc (`ebf364d` + `e5dfbb4`) | 7 à exit 0 | 942 / 940 / 0 / 2 | 942 = 933 + 9 ; 2ᵉ skip = SIGTERM win32, déjà déclaré |

- **Rejeu des 30 mutants G1** : 30/30 rouges, chacun par le test désigné, avec restauration à l'octet près.
- **Anti-close** : aucun identifiant réel de la page 8 784 (signatures, slots, hashes) dans le diff, les sources ou les rendus.
- **Marqueur d'époque refusé dans `budget.json` (D-n iv)** : le refus est motivé et j'y souscris. Aucun lecteur ne consommerait ce champ ; l'époque est portée par la ligne ANCHORS (I-SP-1).

## 2. Corrections exigées (liste fermée)

J'ai écrit 25 mutants. 9 survivent. Pour chacun, un test prototype écrit dans un clone jetable (non livré) le tue, par son seul test désigné (9/9).

- **C-G2-1 — test à ajouter avant la fusion.**
  - Aucun test ne sert une sonde NON vide qui porte un token, alors que c'est la forme réaliste d'une continuation tronquée (consigne A-8).
  - Mutant survivant : G06. Prototype qui le tue : P1.
- **C-G2-2 — tests à ajouter avant la fusion.**
  - Aucun test n'épingle l'ancre C-8, qui est pourtant la seule preuve du commit relâché.
  - Trois trous :
    - sa requête (desc, `limit 1`, `slot.lte = oracle_slot`, une seule fois, sur les deux chemins) : mutants G07 et G08 ;
    - le refus d'une autre tx au même slot : G23 ;
    - son passage par le `retry` : G25.
  - Ces lacunes existaient déjà sur la base (B07, B08, B23, B25 survivent aussi), mais le lot les rend porteuses.
  - Prototypes : P2, P3, P7.
- **C-G2-3 — tests à ajouter avant la fusion (C-6).**
  - Trois propriétés annoncées par le lot ou l'ADR ne sont pas testées :
    - (a) `budget.json` est durable avant la ligne de ledger : mutant G19 (lacune déjà présente sur la base) ;
    - (b) la troncature durable d'une queue NUL à la reprise : G20 ;
    - (c) les écritures de la sonde de densité : G21 et G22.
  - Seuls 5 des 8 sites d'écriture sont épinglés par les tests.
  - Prototypes : P4, P5, P6. P5 prouve au passage qu'une queue NUL est réparée durablement et que la reprise se complète.
- **C-G2-4 — ADR, au commit d'insertion de D1-nonies.**
  - (a) Coût de C-6 à corriger :
    - le chiffre de l'ADR (« ≈ 5 ms, ≈ 25 min ») vient de primitives isolées et n'a pas de source en dépôt ;
    - « ~296 k » est le plafond SPYx (295 700 pages), pas un compte ;
    - l'hypothèse NTFS de R-C6-1 doit être marquée comme non sourcée.
  - (b) Citer l'INCIDENT, en dépôt depuis `5bbbfda` : I-SP-4 se réduit à une citation.
  - (c) I-SP-5 est déjà satisfait par `c17cdc8`.
  - (d) Distinguer, sur `budget_exhausted`, le refus sur la sonde du refus sur l'ancre.
  - (e) Déclarer le résidu R-SP-3 : la provenance est écrite à chaque invocation, et une re-vérification l'écrase. Le test (d) du lot le montre lui-même. Il faut donc poser l'ancre `mint_end` avant toute ré-invocation du même mint.

## 3. Question ouverte du G1 : provenance `null` sur `budget_exhausted`

- Le garde budgétaire lève avant l'appel réel (`apps/bell/src/collect.ts:294-307`).
- **Refus sur la sonde** : la sonde n'a été ni émise ni facturée, donc `null` est exact.
- **Refus sur l'ancre** : la sonde a été émise et facturée (≤ 10 crédits). Son résultat n'est pas tracé, mais l'appel est visible dans `calls_by_method` et dans le ledger de cycle, et la reprise refait la sonde.
- **Jugement : acceptable tel que déclaré.**
  - C-1 est tenu.
  - Le souci MAST du checkpoint-1 porte sur une fin prouvée, et `budget_exhausted` n'en est pas une.
  - Seule la rédaction de l'ADR est à préciser : c'est C-G2-4 (d).

## 4. Coût de C-6 mesuré

J'ai mesuré sur le vrai `runRebaseCrosscheckCli`, 2 000 pages pleines en mode strict, sous win32, disque F: et node v24.15.0.

| Mesure par page | p50 | Moyenne | p99 |
|---|---|---|---|
| Surcoût du lot par rapport à la base | +7,6 ms | +10,9 ms | +79 ms |
| Bloc durable seul | 7,78 ms | 11,15 ms | 80,7 ms |

- Le coût ne croît pas avec la taille du ledger. Le p50 d'un ajout durable reste le même sur un fichier de 261 Mio.
- Rapporté au rythme du tirage :
  - au rythme donné par la mission (~2 pages/s, non recoupé) : 1,5 % au p50, 2,2 % en moyenne ;
  - au rythme de r1, ≈ 0,7 page/s selon l'INCIDENT (1 222 pages en ≈ 1 720 s) : 0,5 % au p50.
- **Conclusion** : coût acceptable. Au plafond SPYx, cela fait ≈ 55 min en moyenne, soit à peu près le double des 25 min annoncées par l'ADR.
- Taille de ligne réelle mesurée par moi, en lecture seule : 12 226 209 octets pour 8 784 lignes, soit ≈ 1 392 octets par ligne. Le chiffre « 881 » du brouillon venait du G1 : c'était du [2nd], je l'ai retiré.

## 5. Observations non bloquantes

- **O-1** : `ledgerPagesOnDisk` compte une queue NUL comme une page (`trim()` ne retire pas U+0000). Ce n'est pas atteignable dans un tirage réel. À joindre au RUNBOOK de GARDE-FSYNC-1.
- **O-2** : l'ancre post-boucle est hors du `try`. Asymétrie déjà présente sur la base, fail-closed, déjà couverte par un test. Aucune action.
- **O-3 à O-5** : queues de fsync, écart de rythme, `DURABLE_FS` mutable. Aucune action.
- **Demande formée** : lecture sur place, par l'orchestrateur, des pages Microsoft Learn `FlushFileBuffers` et `MoveFileExW` (section `MOVEFILE_WRITE_THROUGH`). Déclencheur : lot GARDE-FSYNC-1. Usage : qualifier R-C6-1.

## 6. Artefacts et état final

Tout est sous `F:\tmp\g2-bellsp1\`.

- Harnais de mutants et journaux : `mut-g1\`, `mut-g2\`, `mut-base\`, `mut-g25\`, `proto-kill\`.
- Prototypes de tests : `proto\`.
- Banc de mesure : `bench\`.
- Oracles : `logs\` et `oracle.sh`.
- État final des clones, vérifié à 22:16:36Z :
  - fusion à blanc de `tree` annulée (`merge --abort`) ;
  - `mtree` et `btree` propres ;
  - `node_modules` retirés par `rm-nm.ps1` dans les trois clones ;
  - `F:\Monark\node_modules` intact (220 entrées), `F:\Monark` propre.

Modèle résolu : claude-opus-5-5[1m]
