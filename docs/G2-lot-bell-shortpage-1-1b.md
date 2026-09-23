# Re-G2 (micro-pli f5fc682) — lot BELL-SHORTPAGE-1 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# RE-G2 — Micro-pli BELL-SHORTPAGE-1b (`lot/bell-shortpage-1` @ `f5fc682`, parent `e5dfbb4`, base du lot `de30eab`)

Cette réponse résume le rendu complet `F:\tmp\g2-bellsp1\G2-1b.md` (435 lignes, sha256 `e3880076dd0d2d20a9babe94cd4769ce2b35be640ba7f040c7ee61b71a8909fe`, écrit au fil de l'eau). Les tables complètes, les sha et le détail de chaque mutant sont dans le fichier.

**Verdict : PASS-AVEC-CORRECTIONS.** La liste de corrections est fermée : aucune ne touche au code de production, et aucune ne bloque la fusion du code. Aucune escalade investisseur pour le lot.

## Alerte hors lot, à traiter immédiatement : `lot/etude-suite` @ `b147db0` est rouge sur `no_secret_in_repo`

- **Constat** : le scanner signale `docs/G2-lot-u4b-1b-4-integral.md:78`, une affectation `HELIUS_API_KEY=` suivie de **13 caractères**.
  - Je n'ai jamais affiché la valeur (mesure masquée).
  - Faute de source lue sur le format des clés Helius, je ne peux pas qualifier sa forme : ce peut être un fragment de clé réelle.
- **Attribution prouvée** :
  - le même test échoue sur `b147db0` seul, fusion annulée ;
  - le fichier est ajouté par `b147db0` et absent de `f5fc682`.
  - Le micro-pli n'y est pour rien.
- **Suite formée** (orchestrateur, avant toute fusion dans `lot/etude-suite`) :
  1. inspecter la ligne 78 ;
  2. la caviarder par un commit docs-only ;
  3. si c'est un fragment réel, décider de la rotation (décision investisseur si coût) ;
  4. rejouer `no_secret_in_repo`.
- Tant que ce point n'est pas traité, aucune fusion vers `lot/etude-suite` n'aura un oracle vert.

## Ce qui est acquis (mesuré)

- **Livrables vérifiés** : les sha du rendu, de l'ADR-DELTA et de `DELIVERED.sha256` sont conformes ; les deux fichiers du commit sont identiques à `DELIVERED.sha256`.
- **Oracle du lot** : 7 gates à 0, **940 / 939 / 0 / 1** ; les 10 nouveaux tests passent.
  - A-6 : 9/9 fichiers gelés identiques.
  - Le verrou de format passe seul, et le format du ledger n'est pas touché.
- **R-25 cumulé = 617** (575 + 42), sous A-5 (1 150) et sous la limite CI (1205).
- **Mutants**
  - Les **46 du worker** : 46/46 tués par leur test désigné, rejoués pour la première fois sur l'arbre commité. La version sur laquelle le worker les avait tournés ne différait que par 10 lignes de commentaires.
  - **Mes 25** : 25/25 tués ; **les 9 anciens survivants tombent chacun par le test nommé**.
- **Mes propres attaques sur le retry R-SP-A** (16 mutants) : 11 tués, 1 pendaison (X02), 4 survivants.
  - Un prototype jetable de 38 lignes de test les tue tous (5/5), X02 compris, qui rougit alors en quelques secondes.
- **Branche POSIX des tests (D-4)** : forcée sur win32, les 2 tests passent.
- **graceful-fs** : l'affirmation de l'ADR-DELTA est exacte à la source (`polyfills.js:86-123`, 4.2.11).
- **Durée réelle des attentes** (mesurée) : l'échéancier complet dure 3,09 à 3,10 s, cohérent avec « ≤ ≈ 3,3 s ».
- **Fusion à blanc sur `b147db0`** :
  - propre, 970 / 967 / 1 / 2 contre 951 / 948 / 1 / 2 pour la base seule ;
  - +19 tests, tous verts (9 du lot, 10 du micro-pli) ;
  - aucune régression : le seul rouge est celui de la cible (alerte ci-dessus).
- **Anti-close** propre, sans ouvrir `F:\course-bell\*` ni `F:\course-ukemi\*`.

## Corrections (liste fermée)

- **C-1b-1 (tests seulement, 2 lignes ; non bloquante).**
  - Ajouter un coupe-circuit sur le nombre de tentatives dans les coutures `renameAttemptSync` des tests (ii) et (iii).
  - **Pourquoi** : le mutant X02 (retry infini sans attente) pend au lieu de faire échouer un test. Les coupe-circuits actuels sont dans `sleepSync`, et `--test-timeout` ne se déclenche pas sur une boucle synchrone : mesuré, 240 s sans aucun `not ok` nommé.
  - **Pourquoi non bloquante** : pas de faux vert possible (le job CI est coupé à 10 min) et le code de production est correct.
  - **Déclencheur** : prochaine modification de `apps/bell/test/rebase-crosscheck.test.ts`.
- **C-1b-2 (tests seulement, ≈ 34 lignes ; non bloquante ; même déclencheur).** Épingler quatre affirmations de l'ADR-DELTA qui restent déclaratives :
  - un ENOENT survenant après un premier EPERM est relancé tel quel (X05) ;
  - le `code` de `DurableWriteError` est le code réellement refusé, pas toujours EPERM (X07) ;
  - la `cause` est conservée (X13) ;
  - le message ne contient pas le chemin de `--out` (X12).
- **C-1b-3 (ADR-DELTA, au commit d'insertion de D1-nonies).**
  - (i) « 8 sites d'écriture entière » : il y en a 7 (`writeDurable`) plus 1 ajout (`appendDurable`, sans rename).
  - (ii) R-C6-1 : l'exclusivité « ancien OU nouveau fichier » doit être écrite comme hypothèse d'environnement non sourcée. La reprise est de toute façon fail-closed si `budget.json` manque (`readPriorCalls`).
  - (iii) L'item cp-2 C-1 est périmé : il est traité par `f5fc682` ; reste CP2-C1-bis.
- **C-G2-4 reconduite (bloquante au commit d'insertion, pas à la fusion).**
  - **Écart d'attente** : tu m'as demandé de vérifier ces points « dans l'ADR-DELTA », mais il ne les porte pas (0 occurrence au grep). Le worker l'avait écrit : ils sont « portés par l'orchestrateur ».
  - L'insertion de D1-nonies doit donc porter :
    - (a) le coût C-6 de `docs/G2-lot-bell-shortpage-1.md` §4, et « ~296 k » présenté comme plafond, pas comme un compte ;
    - (b) la citation de l'INCIDENT ;
    - (c) la clôture de I-SP-5 par `c17cdc8` ;
    - (d) dans l'ADR §3, la distinction entre refus sur la sonde et refus sur l'ancre ;
    - (e) la déclaration de R-SP-3.
  - Seule la reformulation R-C6-1/R-C6-2 est prête (avec la précision de C-1b-3 (ii)).

## À trancher par toi

- **Borne R-25 du cumul lot + micro-pli** : la mission du lot initial fixait < 600 (dépassée de 17) ; le worker cite « < 700 attendu », dont je ne vois pas la source. Dis-moi laquelle s'applique.

## Observations non bloquantes (suite formée)

- **RUNBOOK §2** : le ledger n'est pas strictement append-only. À une reprise après crash, la troncature C-B-5 le remplace par rename. Un `tail` resté ouvert fait alors tomber la reprise au bout d'environ 3 s (fail-closed). Il faut écrire « fermer tout lecteur du ledger avant une reprise post-crash ».
- **Commentaire `ci.yml:24-27`** : « `--test-timeout` est le garde par test » est faux pour une boucle synchrone. À corriger au prochain toucher de `ci.yml`.

## Contrôles de sécurité et état final

- **Secret** :
  - le vrai scanner reste vert avec mes deux rendus ajoutés dans `docs/` (copies retirées ensuite) ;
  - la regex exacte ne trouve rien dans mes 116 fichiers de preuve.
- **Clones** : les 5 clones ont un `git status` vide, sans fusion en cours, et `node_modules` retiré (« removed » ×5).
- **`F:\Monark`** : intact (220 entrées, `git status` vide).
- **Aucun** commit, workflow ou appel réseau.

## Fichiers

- Rendu complet : `F:\tmp\g2-bellsp1\G2-1b.md`
- Oracles et contrôles : `F:\tmp\g2-bellsp1\logs\`
- Mutants : `F:\tmp\g2-bellsp1\mut-w46\`, `mut-g2-1b\`, `mut-x-1b\`, `mut-x17-1b\`, `mut-xproto-1b\`
- Prototypes jetables (non livrés) : `F:\tmp\g2-bellsp1\proto-1b\`
- Mesure des attentes : `F:\tmp\g2-bellsp1\bench\atomics-overrun.log`

Modèle résolu : claude-opus-5-5[1m]
