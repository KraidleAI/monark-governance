# Re-checkpoint-2 (micro-pli f5fc682) — lot BELL-SHORTPAGE-1 — validateur-humain (claude-fable-5-1), 2026-09-23

Modèle résolu : claude-fable-5-1

# Re-checkpoint-2 (LIVRABLE) — micro-pli BELL-SHORTPAGE-1b, `lot/bell-shortpage-1` @ `f5fc682` (parent `e5dfbb4`) — **ACCEPTE** sous trois réserves nommées

Rendu au fil de l'eau : `F:\tmp\cp2-bellsp1\CP2-1b.md` (sha256 `a3d078c7…`).

## 1. Artefacts lus (contexte frais, aucun fil de travail)

`docs/G2-lot-bell-shortpage-1.md` (PASS-AVEC-CORRECTIONS, C-G2-1..4) ; `F:\tmp\bellsp1\RENDU-MICROPLI-1b.md` (§0-§17) ; `ADR-DELTA-1b.md` (a)-(d) ; `docs/course-bell/RUNBOOK-supervision-tirage.md` ; `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md` ; `docs/CHANTIERS.md:894-899` (R-SP-A/B/C, décision 137) ; `git diff e5dfbb4..f5fc682` (2 fichiers, +301/−8) ; `DELIVERED.sha256` `15cc8773…` / `bed50110…`. `F:\course-bell\*` et `F:\course-ukemi\*` non ouverts ; `F:\Monark-wt-bellexec` : `rev-parse`/`status` seulement (`a703e24`, propre).

## 2. Rejeux (CA-9, AM-2 ter — `F:\tmp\cp2-bellsp1\`)

| Rejeu | Mesuré | Attendu |
|---|---|---|
| Clone `tree1b` @ `f5fc682`, status 0, `mk-nm.ps1` (220/10/0) | sha = `DELIVERED.sha256` | = |
| Oracle 7 gates, `env -u` 8 clés, TEMP F: (00:20Z, **en parallèle des 46 mutants**) | 6 gates 0 ; `test` exit 1 : 940/938/**1**/1 | — |
| Rouge : `probe_smtp_connect_deadline_bounds_handshake` (`test/probe-narabi.test.ts:895`, borne murale `< 700+4000 ms`, mesuré 6 396 ms, fichier hors lot, dernier commit `780a631`) — contention CPU | fichier seul : 47/47 ; **`npm run test` machine libre (00:31Z) : 940/939/0/1** | 940/939/0/1 |
| 46 mutants, harnais livré (seules les 2 constantes de chemin changées, ligne 15 = commentaire), clone séparé `tree1b-mut` | résumé du harnais : **« run 46/46: KILLED 46, SURVIVED 0, FIND-ERROR 0 »**, contrôle vert, restauration `15cc8773…`/`bed50110…`, aucun marqueur | 46 |
| Mutants PROPRES sur le retry (`mutants-vh.mjs`) : V01 plafond off-by-one (`left < 0`), V02 saut silencieux au plafond, V03 backoff sans doublement, V04 attente non rognée, V05 `waited` non cumulé | **5/5 KILLED byIntended** (V01/V02/V05 par `…cap_exhausted…`, V03 par `…reader_released…`, V04 par `…codes_schedule…`) | ≥ 2 |
| R-25 (pathspec verbatim `ci.yml:65`, `de30eab...f5fc682`) | **617** (575+42) ; micro-pli seul 309 | 617 |
| A-6, 9 sha gelés recomputés | **9/9** | 9/9 |
| Anti-close (lignes `+` du micro-pli) | 0 base58 ≥ 43, 0 entier ≥ 7 chiffres, 0 décimal | propre |
| Fusion à blanc contre `lot/etude-suite` @ **`3d1303f`** (`b147db0` a avancé) | propre (`ee97fe2`), blobs identiques lot/fusion, typecheck 0, test **970/967/1/2** (skips SIGTERM win32 + `u4b_labels…`) ; rouge = `no_secret_in_repo` | voir §4 (i) |
| `no_secret_in_repo` sur la BASE SEULE `3d1303f` (sans le lot) | **not ok** — `docs/G2-lot-u4b-1b-4-integral.md:78`, motif `*_API_KEY= inline assignment`, commité `b147db0` ; vert sur le lot seul | attribution mesurée |

Consigne d'outillage (mesurée) : ne pas paralléliser un oracle avec un harnais de mutants sur le même poste — la suite porte des tests à borne murale.

## 3. Checklist

- **CA-1** conforme : chaque correction G2 a un test nommé et un mutant rouge par lui (table §9 du rendu, rejouée 46/46). **CA-2** : R-SP-A (retry) et R-SP-B (runbook) = ingénierie et procédure, conformes ; **R-SP-C amende la D-n §5 (i)-(ii)** — c'était ma question d'escalade ; tranchée sous la décision 137 (GO général, investisseur informé, veto possible) : conforme, en consignant que **la fenêtre de veto est l'événement de DÉPLOIEMENT** (ré-épinglage de `F:\Monark-wt-bellexec`), pas la fusion. **CA-3** : D1-nonies **non inséré** (grep vide) ; `ADR-amendement.md` porte encore « NTFS journalise » ; actes d'insertion §4 (iii). **CA-4/CA-5** conformes (mono-worker ; MAST §7 complété par ADR-DELTA (b)). **CA-6** : oracle rejoué par moi ; **sous réserve du re-G2 PASS en main du G7**. **CA-7** : items R-SP-A-1, DURABLE-FS-UNIFY, CI-POSIX-1b, CP2-C1-bis formés ; aucun dû nu. **CA-8** : worker `claude-opus-5-5[1m]`, commit par `Kraidle` (R-20) ; D-1..D-8 déclarées ; `error_origin` à adjuger au G7. **CA-9** conforme (tout re-exécuté sur clones séparés + 5 mutants propres). **CA-10** conforme (617 ≤ borne CI ; aucun argument de vitesse).
- **CA-11 (durci)** conforme : C-G2-1, C-G2-2 (a)(b), C-G2-3 (a)(b)(c) et les trois tests R-SP-A traversent `runMain` (`--rebase-crosscheck` strict, `--rebase-density` pour (c)) jusqu'aux fichiers réels relus ; le lecteur est **réel** (`fs.openSync(cible,"r")`), le vrai `EPERM` win32 est exercé sur le poste du tirage ; C-G2-2 (c) passe par `scanFullMint` + retry injecté (calque du test (h) du lot, D-3 déclarée). Câblage : `DURABLE_FS.renameSync` = `renameWithBoundedRetry` sur les 8 sites de `writeDurable` ; M26/M27 conservés byte-identiques.
- **Anti-close** conforme. C-1 de mon cp-2 : appliqué en commentaires seuls (`:223-225`, `:814-817`), sémantique de `null` = « aucune décision de sonde atteinte », refus sur la sonde (rien émis) ≠ refus sur l'ancre (sonde payée visible) distingués — exact.

## 4. Décision : **ACCEPTE** le micro-pli `f5fc682`, sous trois réserves (liste fermée)

- **(i) Précondition de fusion, PAS une correction du lot** : `lot/etude-suite` @ `b147db0`..`3d1303f` échoue `npm run test` **seul** — `docs/G2-lot-u4b-1b-4-integral.md:78` porte une affectation `*_API_KEY=` en clair dans un document (règle docs : jeton `[masqué]`, jamais une valeur, fût-elle « factice » ; **valeur non lue par moi**). Item formé, propriétaire orchestrateur, déclencheur : **avant toute fusion dans `lot/etude-suite`** ; aucun G7 ne peut afficher « arbre fusionné 7 gates 0 » avant purge.
- **(ii) CA-6** : re-G2 PASS en main du G7.
- **(iii) Actes d'insertion à contrôler au G7 (texte inséré = relu)** : D1-nonies + ADR-DELTA (a)-(d) ; retrait de « NTFS journalise » (ADR-DELTA (c)) ; C-G2-4 (a) coût §4 (« ≈ 5 ms / 25 min / ~296 k » → mesure G2 +10,9 ms/page ≈ 55 min ; 295 700 = plafond, pas un compte) ; C-G2-4 (b)(c) = mes C-2/C-3 (I-SP-4/I-SP-5 périmés) ; mon C-5 → R-SP-C dans §5 avec deux précisions : (a) la condition « BELL-RENAME-RETRY-1 G7 » est **satisfaite par ce micro-pli** ⇒ condition = BELL-SHORTPAGE-1 G7 + GARDE-FSYNC-1 G7 ; (b) la ligne ANCHORS « époque shortpage » porte le sha du **re-pin de `bellexec`**, pas celui de `F:\Monark` ; CP2-C1-bis (`:242` « absent when no probe was made », commentaire seul).
- Observation non bloquante : les tests R-SP-A (i)/(ii) ajoutent des bornes murales (`heldMs ≥ 250`, `ms < 3 600`) — même classe de fragilité sous charge que le rouge de §2, déjà couverte par D-4/CI-POSIX-1b.
- Aucune ESCALADE-INVESTISSEUR : R-SP-C est couvert par 137 et consigné ; divergence G7/checklist ou refus contesté deux fois ⇒ escalade.

**AM-1 — attrapé** : secret-pattern en clair sur la branche cible (rouge invisible pour un G7 qui ne rejoue pas l'arbre fusionné, attribué par mesure sur la base seule) ; condition R-SP-C déjà satisfaite par le lot lui-même ; aléa de charge d'un test à borne murale (et sa consigne d'outillage).

## 5. Preuve d'innocuité (AM-2 / AM-2 ter, 00:37Z)

Rejeux sous `F:\tmp\cp2-bellsp1\{tree1b, tree1b-mut, logs1b, mut1b, mutvh}` uniquement. `F:\Monark` : `3d1303f`, `git status` vide, `rebase-crosscheck.ts` `6a2b96ef…` / test `fdb5aa92…` avant = après (inchangés, = base). `F:\Monark-wt-bellsp1` `f5fc682`, status 0, `15cc8773…`/`bed50110…`. `F:\tmp\bellsp1\` : dernière écriture `mutants-run.log` 00:15:41Z (orchestrateur), antérieure à mon clone ; l'horodatage 00:37/00:39Z vu en listant est `..` (= `F:\tmp`, touché par le re-G2 parallèle `g2-bellsp1\mut-*` et mes propres entrées). Aucun `git` d'écriture, aucune installation, aucun réseau, aucun appel Helius.

Fichiers : `F:\tmp\cp2-bellsp1\CP2-1b.md`, `logs1b\{header,exits,test,test-idle,narabi-alone.tap,merge,merged-typecheck,merged-test,nosecret-base-alone.tap}`, `mut1b\mutants-run.log`, `mutvh\mutants-vh.log`, `mutants1b.mjs`, `mutants-vh.mjs`, `oracle1b.sh`.

Modèle résolu : claude-fable-5-1
