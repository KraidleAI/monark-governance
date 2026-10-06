claude-opus-5-5[1m]

# G2 — relecture adversariale du G1 de PR-2b-1 (MONARK Dōjō, historique rétroactif, lecture pure)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Relecteur G2, instance fraîche, distincte du générateur ; effort high (mission).
- **Mission** : `F:/tmp/dojo/mission-g2-pr2b1.md` (16 l., sha256 `06db0c4059d7063f4a2a6e8701130fbcc3cb09916a75ace8b9e634f78575a8b7`), horodatage 2026-09-27T08:20Z ; `date -u` à l'ouverture : 08:17:19Z. Texte calculé par le script de l'orchestrateur, lu comme tel.
- **Objet** : worktree `F:/Monark-wt-dojo-d`, branche `lot/dojo-historique`, HEAD `02884eb`, fichiers non committés du G1 ; ADR de lot `docs/adr/ADR-DOJO-PR-2B.md` (sha256 `20e4d5d5…65fd`, 904 l.), qui fait foi ; mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (`fc93f66c…5078`, dixième pli sur cette branche).
- **Discipline** : aucun git écrivant dans le worktree (lecture seule : `status`, `log`, `diff --stat`) ; aucun réseau ; rien écrit sur C: ; rejeux sur mes propres clones `--no-local` (`F:/tmp/dojo/g2-pr2b1/clone`, puis `fix` pour le prototype des corrections) et sur des copies sous `F:/tmp/dojo/g2-pr2b1/` ; `node_modules` par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`, deux fois) ; suite complète puis test 42 sous le verrou d'hôte `F:/tmp/oracle-lock` (propriétaire « G2 PR-2b-1 ») ; livrables et clones du G1 intacts (seulement lus).
- **Processus `node` (C-V-4)** : 31 à 08:18:29Z (ouverture ; verrou alors tenu par « G2 PR-1b-3 », pris 08:14:07Z, libre à 08:26:13Z) ; 32 à 08:22:12Z (tests `apps/dojo`, hors suite) ; **23 au lancement de la suite complète** (08:26:30Z, verrou pris sans attente) ; **22 au lancement du test 42** (08:33:38Z). Une seule suite complète à la fois.

## 0. Verdict

**CORRECTIONS D'ABORD.** Le code suit D-3 à D-8 et D-11 sur les points relus (§4), l'oracle est vert (7/7, 1 391 pass, 0 fail) et la liste fermée de mutants tombe (14/14 du G1 rejoués, sortie octet pour octet égale à la sienne ; 14/14 avec mes propres remplacements). Mais : (1) **C-G2-1** (bloquante, posée par l'orchestrateur) — les noms des fixtures nomment les opérateurs ; (2) **C-G2-2** — `checkBounds` passe en silence sur une borne absente ou un compteur `NaN` (fail-open mesuré) ; (3) **C-G2-3** — la sonde de la mission « chaînage sautant une fenêtre sans quorum » survit dans le sens fail-open (trois variantes), avec l'ordre par rang et le solde d'un compte fermé non testés ; (4) **C-G2-4** — la sonde « instruction non analysée admise » survit (liste `accounts` absente), `err` hors clé survit, la frappe de 10^15 de (iv) n'est pas testée. Les quatre corrections sont prototypées sur copie et vérifiées : 6/6 et 62/62 tests, `tsc` 0, `eslint` 0, `lang-gate` 0, **51/51** mutants et sondes tués, 14/14 du G1 ; R-25 du prototype **722** (677 au G1).

## 1. État du worktree

- **Ouverture** (08:17:40Z) : `?? apps/dojo/src/history-read.ts`, `?? apps/dojo/test/dojo-history-read.test.ts`, `?? apps/dojo/test/fixtures/history/` (19 fichiers : réducteur, `sources.json`, 16 fixtures hexadécimales de pages et de corps, `probe3-expect.json`), `?? docs/G1-lot-dojo-pr2b1.md` : conforme à l'annonce. `git diff --stat HEAD` vide (aucun fichier suivi modifié).
- **sha256 relus**, égaux au §3 du journal G1 et à `DELIVERED.sha256` (`sha256sum -c` : 22 lignes OK, soit les 21 fichiers du lot et le journal ; la mission dit « 21/21 », le compte inclut le journal) : `history-read.ts` `c9aa808d…a6c` (274 l.), test `f8b3feb5…19d2` (210 l.), réducteur `56e94e39…74c5` (55 l.), `sources.json` `a703cd26…30d7` (121 l.), journal `5149bd5e…6cd7` (205 l.).
- **Clôture** : §9.

## 2. Table des neuf points

| # | Point | Verdict | Constat |
|---|---|---|---|
| 1 | R-1 | conforme | Première ligne du journal G1 et de ce rapport : `claude-opus-5-5[1m]`. |
| 2 | R-25 | conforme | **677** rejoué sur mon clone (§3.1) : pathspec de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` extraits par script, index temporaire, `git diff --shortstat 02884eb` : `21 files changed, 677 insertions(+)` (274 + 210 + 55 + 121 + 17 fichiers d'une ligne). ≤ 1 083 (×1,98) ; STOP 1 150 à 473. Prototype corrigé : 722. |
| 3 | Tests rejoués et lus | conforme, avec lacunes (C-G2-3, C-G2-4) | 6/6 ; **62/62** dans `apps/dojo/test/` (56 + 6). Les six noms de l'ADR §4 l.557-570 sont présents. Oracles recodés (ensembles et ordres des pages, sommes par `BigInt`, jours par `Date.UTC`). Recalculs à la main (§3.2) : chaînage d'Euler et offre par transaction égaux au module ; différentiel du chaînage contre une force brute sur 6 000 cas : 0 écart fail-open. |
| 4 | Mutants et sondes | **non conforme** (C-G2-3, C-G2-4) | Liste fermée : 14/14 (rejeu du G1, `RESULTS.txt` identique au sien, sha256 `8bf9a11c…e2e0`) et 14/14 avec mes remplacements. Sondes : 37 posées, 25 tuées, **12 survivent** (§3.3) ; deux des sept sondes demandées par la mission ont des variantes survivantes (chaînage sautant une fenêtre : 3 variantes fail-open ; instruction non analysée admise : 1 variante) ; « clé ignorant `pre` » n'est tuée que par l'épingle de clé, calculée par le module lui-même. |
| 5 | Conformité D-3..D-8, D-11 | conforme, avec observations | Ligne à ligne au §4. Aucun code du vérificateur nouveau : les 10 arrêts sont disjoints des 45 codes (`DOJO_VERIFY_REFUSALS`, 45 éléments, intersection vide, mesurée). Observations non bloquantes pour la ligne datée de Q-7 et Q-6 (§5, C-G2-5). |
| 6 | Hygiène | **non conforme** (C-G2-1) | Code (`history-read.ts`) sans nom d'opérateur, sauf l'abréviation de méthode « gTFA » (commentaire l.80) ; **les noms de fichiers des fixtures, le réducteur, `sources.json` et le test nomment les opérateurs** (`*.helius.json`, `*.chainstack.json`, `*.gtfa.json`, clés `A3-chainstack-getTransaction.json`…, variables `SIG0H`/`SIG0C`). Aucune valeur inventée (chaque constante relue à sa ligne, §4) ; imports : `node:crypto`, `bell-chain.mjs` (module) ; `node:fs`, `node:test`, `dojo-verify.mjs` (test) ; aucun réseau, aucune horloge ; gelés inchangés (`git diff --stat HEAD` vide). |
| 7 | Journal et sha | conforme, deux corrections de forme (C-G2-6) | §0 à §15 présents ; sha256 relus égaux ; scripts du G1 relus à leur sha256 (`pr2b1-run-oracle.sh` `42f06646…`, `pr2b1-locked.sh` `a5785203…`, `pr2b1-t42.sh` `f4794657…`, `pr2-1-r25-methodA.mjs` `140be120…`) ; `out-2/exits.txt` 7/7 à 0 ; `out-2/test.log` `7fb39f89…` égal au journal. Réducteur rejoué sur copie : 18/18 fichiers égaux octet pour octet (idempotent). |
| 8 | Tuyaux | conforme | §13 du journal : entrée (réponses brutes, TU-12a), sortie (`Merged`, `Admission`, `AccountState`, arrêts), consommateurs PR-2b-2 et PR-2b-3, aucun n'existe ; état aucun ; test d'intégration `dojo_history_collect_to_verify_end_to_end` (PR-2b-4) ; **la pièce reste `upcoming`**, tuyau formé avec déclencheur (G1 de PR-2b-2 ; G7 de PR-3a, TU-12c). Aucun registre public ne la déclare « built ». |
| 9 | Forme | conforme | 0 octet CR dans les 22 fichiers ; 0 caractère hors ASCII dans le code, le test, le réducteur, `sources.json` ; noms de fichiers et de tests ASCII. |

## 3. Rejeux

### 3.1 Clone, R-25, tests, oracle

- Clone `git clone --no-local F:/Monark-wt-dojo-d F:/tmp/dojo/g2-pr2b1/clone` (08:18:34Z), HEAD `02884eb` ; fichiers du lot copiés, `cmp` égal au worktree.
- R-25 : `F:/tmp/dojo/g2-pr2b1/r25-g2.sh` (calque du G2 de PR-2-1 au chemin de l'index près) ; sortie `r25-clone.log` : `tokens: 20`, `21 files changed, 677 insertions(+)`, `677`. Index réel du clone intact.
- Tests `apps/dojo` (hors suite) : `node --test apps/dojo/test/*.test.ts` ⇒ `tests 62, pass 62, fail 0` (`dojo-tests.log`).
- **Oracle, sept gates sous verrou** (`g2-locked.sh` « G2 PR-2b-1 », `g2-run-oracle.sh` : `npm run` de `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, huit variables payantes retirées, TEMP sur F:) : 08:26:31Z → 08:33:38Z, **7/7 exit 0** ; `test` : 1 393 tests, **1 391 pass, 0 fail**, 0 annulé, 2 skipped (préexistants), les six `dojo_history_*` ✔ (`test.log` `65038cd6…`) ; `lint:ratchet` 69/69 ; `lang:gate` OK, 0 coup ; test 42 vert aussi dans la suite (367 s). Sorties `F:/tmp/dojo/g2-pr2b1/oracle/`.
- **Test 42 à part**, sous le même verrou, après la suite (08:33:38Z, 22 `node.exe`) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 214 s (`test42.log` `7c771a9c…`) ; fin 08:37:12Z, verrou rendu (absent à 08:38:29Z).
- `apps/dojo` n'est pas exporté (`grep dojo scripts/export-public.mjs` : aucune ligne, relevé du journal §10 confirmé par `export:check` vert).

### 3.2 Recalculs à la main et vérifications indépendantes (sans le module)

- **Offre par transaction** (réponses brutes, extraction propre) : SIG0 (A3) : pre vide, post `6tW6…` de propriétaire `2v82…` = 1 000 000 000 000 000 ; Σ(post − pre) = 10^15 = l'unique `mintTo` 10^15. C1 : `MeQM…` 120 772 024 720 137 → 120 634 718 860 999 (−137 305 859 138), `BMAH…` 600 071 571 628 → 737 377 430 766 (+137 305 859 138) ; Σ = 0, offre `[]`. Égal au module.
- **Chaînage d'Euler** (emplacement non ordonné, ordre d'entrée volontairement faux : 40→10, 70→40, 40→70, solde connu 40) : degrés sortant − entrant : 40 : +1, 70 : 0, 10 : −1 ; source 40 = solde connu ; chemin 40→70→40→10 ; fin **10**. Module : `A = 10/O`. Variante 40→71 au lieu de 40→70 : quatre sommets impairs ⇒ aucun ordre ⇒ `chain_break` ; module : `chain_break`. Exemple du test (u1 40→70, u2 70→10) : fin 10, égal.
- **Différentiel contre force brute** (`probe/direct.test.ts`) : 3 000 emplacements non ordonnés aléatoires sans fenêtre : 319 accords, 2 681 arrêts des deux côtés, **0 écart** ; 3 000 après une fenêtre : 931 accords, 1 926 arrêts des deux côtés, 100 arrêts du module sur une fin ambiguë (voulu), 43 arrêts du module là où la force brute trouve une fin unique (circuits, boucles pre = post : fail-closed, C-G2-5), **0 cas fail-open**.
- **Fixtures** (`verify-fixtures.mjs`, `canonical` gelé seul) : sha256 de chaque source = `SHA256SUMS` = `sources.json` (17/17) ; `SHA256SUMS` `e8ff845f…e28f` = épingle ADR l.816, `sha256sum -c` 49 OK ; texte décodé = sha256 épinglé et forme canonique (17/17) ; **ma réduction écrite depuis l'ADR l.630, appliquée au brut, donne exactement le texte de chaque fixture (17/17)** ; pour les corps, chaque pièce gardée (listes de soldes, signatures, instructions Token-2022) est une sous-chaîne octet pour octet du fichier brut (0 manque). **La propriété « sous-chaîne octet pour octet du brut » ne tient pas au sens littéral pour les pages** : 7 KO, parce que la forme canonique trie les clés (l'ordre des clés du brut diffère) ; elle tient après ré-encodage canonique, conséquence de la forme hexadécimale + canonique admise par Q-3. À l'orchestrateur de dire si cela remplit l'intention du contrôle.
- **R-b sans le module** : ma clé extraite à la main (entrées du mint triées, offre, types, rang, `err`) est égale entre les deux opérateurs pour SIG0, C1, C2, et entre la page `full` (A1) et `getTransaction` ; les sha256 des réponses brutes diffèrent (octets différents). C'est la preuve indépendante de R-b : l'épingle de clé de `sources.json` est calculée par `readKey(readBody(brut))` du module lui-même (le réducteur l'importe), donc c'est une épingle de régression, non un oracle.
- **Faits du journal** relus sur fixtures : `mint-head` b sans `transactionIndex` (0/100) ; 10 échecs sur 100 dans `acct-6tW6` a ; emplacement 445 903 343 : rangs 793, 739, 696 (réussies), 449 (échec), 342 (SIG0) ; ensembles des deux `mint-tail` égaux, SIG0 dernier.

### 3.3 Mutants et sondes

Harnais `g2-mutants.mjs` (`eb8b50fe…`), listes `g2-list.mjs` (`014f6a30…`) ; résultats `mut/RESULTS-G2.txt` (`219b0d6a…`) ; rejeu du G1 `mut-g1/RESULTS.txt` (`8bf9a11c…`, identique au sien). Tué = « not ok » du test visé ; la colonne « ligne » donne la ligne du test où l'assertion tue. Témoin : 6 ok. `history-read.ts` inchangé au sha256 après chaque passe.

| Id | Mutation (mes remplacements) | Verdict (ligne) |
|---|---|---|
| M-Y1g, M-Y4ag, M-Y4bg, M-Y6ag, M-Y6bg, M-Y8g, M-Y9ag, M-Y9bg, M-Y10ag, M-Y10bg, M-Y13ag, M-Y13bg, M-Y19ag, M-Y19bg | liste fermée, variantes propres (corps comparé à lui-même ; `false &&` ; jour UTC−2 ; jour de (v) sur l'emplacement ; entrée d'un seul index sautée ; propriétaire ou rang hors clé ; F lu ; échec contesté exclu ; rupture tolérée ; fin prise quel que soit le départ ; type hors liste ou non analysé toléré) | 14/14 tués (l. 82, 133, 138, 202, 207, 60/110, 76, 76, 105, 110, 154, 163, 178, 180) |
| P-1a | fusion tolérant un trou (entrée d'un index prise pour les deux) | tuée (60) |
| P-1b / **P-1c** | statut `finalized` exigé du côté a seul / du côté b seul | tuée (60) / **survit** |
| P-1d | emplacement d'une contestée = max | tuée (60) |
| **P-2a** | clé ignorant `pre` | tuée **par l'épingle seule** (96) |
| P-2b / P-2d | clé sans `program` / sans `types` | tuées par l'épingle seule (96) |
| **P-2c** | clé ignorant `err` | **survit** |
| P-3a, P-3b, P-3c, P-3d | côté FAULT pris pour un corps ; rang d'un seul corps gardé ; deux `null` ; offre sans quorum | tuées (82, 69, 85, 88) |
| **P-4a** | fenêtre sans borne basse (tout trou antérieur libère) | **survit (fail-open)** |
| **P-4b** | trou d'un autre compte libère | **survit (fail-open)** |
| **P-4c** | un trou libère toutes les transactions de l'emplacement | **survit (fail-open)** |
| P-4d | fenêtre jamais libératrice | tuée (157) |
| **P-4e** | fenêtre ignorée dans un emplacement non ordonné | **survit** (arrêt parasite) |
| **P-4f** | emplacement ordonné non trié par rang (ordre d'entrée) | **survit (fail-open)** |
| P-4g | propriétaire hors du sommet | tuée (155) |
| **P-4h** | compte fermé gardant son dernier solde | **survit** |
| P-5a, P-5b, P-5c | (vii) : borne de X, sans quorum, échecs mobiles non appliquées | tuées (92) |
| **P-6a** | instruction non analysée sans liste `accounts` non comptée | **survit (fail-open)** |
| P-6b, P-6c | non analysée jamais relevée ; portée réduite à `info.mint` | tuées (180, 172) |
| P-7a, P-7b | propriétaire manquant deviné ; repli `initializeAccount*` ignoré | tuées (167, 166) |
| **P-8a** | (iv) frappe de 10^15 non contrôlée | **survit** |
| **P-8b** / **P-8c** / P-8d | (iv) `blockTime` de l'entrée la plus ancienne / index b / index a non contrôlés | **survit** / **survit** / tuée (193) |
| P-8e, P-8f | (iv) `initializeMint2` ; (v) deux `blockTime` dans un emplacement | tuées (195, 207) |
| P-9a, P-9b, P-10 | brûlage compté en frappe ; `moves` toujours faux ; groupe interne orphelin sauté | tuées (132, 113, 184) |

Total première passe : liste fermée 14/14 ; sondes 25/37 ; **12 survivants**. Sur le prototype corrigé (§6) : **51/51** tués, P-2a par une assertion sémantique (l. 79 du test corrigé), non plus par l'épingle ; rejeu de la liste du G1 : 14/14.

### 3.4 Sondes directes du module d'origine (`probe/direct.test.ts`, `35bb4c53…`)

- `checkBounds` : borne `noQuorum` absente avec 5 transactions sans quorum ⇒ **passe** ; compteur `noQuorum` `NaN` ⇒ **passe** ; compteur `contested` `NaN` ⇒ **passe** ; compteur `unordered` absent ⇒ **passe** ; borne `NaN` ⇒ **passe** ; borne −1 ⇒ arrêt. Cinq passages silencieux là où un arrêt est dû (C-G2-2).
- Rangs égaux dans un emplacement ordonné : ordre d'entrée (a, c) ⇒ `B = 3/O2` ; ordre (c, a) ⇒ `chain_break` : le résultat dépend de l'ordre d'entrée (D-3, « Déterminisme ») ; cas impossible sur la chaîne, mais admis par quorum il ne doit pas dépendre de l'ordre (C-G2-5).
- Trou dans l'emplacement d'un groupe de deux transactions ordonnées : seule la première est libérée ; rupture sur la seconde ⇒ `chain_break` (fail-closed, arrêt possiblement parasite ; C-G2-5).
- Boucle pre = post dans un emplacement non ordonné après une fenêtre : `chain_break` (fin unique pourtant ; fail-closed ; C-G2-5).

## 4. Conformité ligne à ligne (D-3 à D-8, D-11)

- **D-4 fusion** (l.296-309) : concordance = présence dans les deux, `slot`, `blockTime`, nullité de `err` égaux, `finalized` des deux (l.67) ; échec concordant ⇒ F, jamais dans `read` ; contestée ⇒ R et X ; `transactionIndex` non lu ; S_CUT sur le plus petit emplacement lu. Conforme. Doublon dans un index ⇒ `index_inconsistent` (ajout déclaré).
- **D-5 clé** (l.313-322) : `signature`, `slot`, `blockTime`, `err`, rang seulement si les deux corps le portent, entrées du mint (compte, côté, propriétaire, montant, programme) triées par (côté, compte), offre (types `mintTo`/`mintToChecked`/`burn`/`burnChecked`, `info.mint` = MINT, montant `info.amount` ou `info.tokenAmount.amount`, ordre des positions), types uniques triés. Conforme. Résolution des comptes (l.325) : `lookupTable` ou statiques + `loadedAddresses`, conforme (le chemin `loadedAddresses` n'est exercé par aucune fixture). Admission (l.326) et rang (l.327) conformes. Égalité du corps entier (l.328) : non faite, renvoyée à PR-2b-3, déclarée (journal §11). Propriétaire absent (l.329) : `initializeAccount*` du compte (côté post), puis dernier propriétaire, sinon arrêt : conforme.
- **D-6** (l.331-338) : deux clés différentes ou un seul corps ⇒ sans quorum, union des (compte, propriétaire) ; arrêt si un corps porte une offre sur MINT (`supply_mismatch`) ; aucune lecture ⇒ `no_quorum_unbounded` ; deux `null` ⇒ `index_inconsistent`. Conforme ; la fenêtre en jours (l.339-341) est l'affaire de PR-2b-2.
- **D-7** (l.346-357) : emplacement non ordonné = un corps admis sans rang (ensemble global) : conforme ; valeurs du jour hors lot.
- **D-8** (l.365-371) : (i) partie transaction et frappe après SIG0 : conforme ; (iii) : conforme sur les points testés, lacunes de test (C-G2-3) ; (iv) : conforme, lacunes de test (C-G2-4) ; (v) : conforme ; (vi) : liste fermée de 15 types égale à l.370, non analysée ⇒ arrêt : conforme ; (vii) : bornes en entrée, contrôle de forme incomplet (C-G2-2).
- **D-11** (l.425) : 7 des 8 motifs (sans `enumeration_mismatch`, contrôle (ii) de PR-2b-2) gardent leur nom ; trois noms proposés, disjoints des 45 codes (mesuré).
- **Constantes relues à leur ligne** : `TOKEN_2022` (ADR-DOJO-PR-2 l.124, mère l.207, `apps/bell/src/pools.ts:69`) ; SIG0, emplacement 445 903 343, `blockTime` 1 789 049 406 (§1.2 l.74) ; 6 décimales et 10^15 (D-8 l.368) ; `DAY` 86 400 (D-3 l.229) ; types d'offre (D-5 l.319-320) ; épingle `SHA256SUMS` (l.816).
- **Q-2 (bornes (vii))** : 1 − 0,05^(1/2 000) = **0,0014967** (recalculé) ; 3 / 2 000 = 0,0015 l'arrondit au-dessus (règle de trois : −ln 0,05 / 2 000 = 0,0014979). L'échantillon est vérifié : B1 et B3 (2 × 1 000 entrées) contre la liste helius L (23 628 entrées, A2-p001 à p024) : **0 contestation au sens complet de D-4** (présence, `slot`, `blockTime`, nullité de `err`, `finalized` des deux ; mon calcul), et non seulement l'égalité d'ensemble et d'ordre de `derived.json` R5. Les trois bornes à 0 sont cohérentes avec leurs sources (FAITS cp1d L-3 ; déclencheur D-7 ; R-b 9/9). Le seuil de 5 % reste une convention à retenir par la ligne datée.
- **Q-5, Q-6, Q-7** relues contre D-5, D-6, D-8 : cohérentes, sauf les observations de C-G2-5.

## 5. Corrections et observations (C-G2-n)

- **C-G2-1 (bloquante ; posée par l'orchestrateur ; `error_origin` : G0 de lot, avec défaut du G1)** — Constat : la table de l'ADR §4 « Fixtures dérivées de la sonde » (l.632-642) **nomme elle-même** les fichiers `sig0.chainstack.json`, `sig0.helius.json`, `sig0.gtfa.json`… ; le G1 l'a suivie à la lettre, alors que sa mission (§2 : « aucun fournisseur nommé (réponses « a »/« b ») ») et le précédent PR-2-1 (`apps/dojo/test/fixtures/collect/provenance.json` : « never by an operator » ; journal G1 PR-2-1 l.123) disaient le contraire ; le G1 n'a pas posé ce conflit en question. Correction, prototypée (`fix.diff`, `fix-patch.mjs`) :
  1. **Renommage** : membre `a` = premier opérateur de `OPS` (D-3), `b` = second ; `sig0.a.json`, `sig0.b.json`, `sig0.a-page.json` (page `full`), `c1.{a,b}.json`, `c2.{a,b}.json`, `mint-tail.{a,b}.json`, `mint-before-sig0.b.json`, `mint-head.{a,b}.json`, `acct-6tW6.{a,b}.json`, `acct-MeQM.{a,b}.json`, `probe3-expect.json`. Contenus inchangés : 17/17 fichiers égaux octet pour octet aux anciens, clés et sha256 de `sources.json` inchangés.
  2. **Réducteur** sans nom : chaque source est désignée par son identifiant d'appel de la sonde (A5, A3, A1, C1…), son membre et son sha256, et retrouvée par son sha256 dans `SHA256SUMS` ; les noms de fichiers ne vivent que dans la sortie de la sonde, hors dépôt. **À déclarer** : `C1-chainstack` et `C1-solana-foundation` ont le même sha256 (`c97b29b2…4c10`) ; la résolution par sha256 peut ouvrir le fichier du troisième opérateur pour le membre b de C1 ; octets identiques, fixture identique, mais D-3 dit « jamais solana-foundation » : la correction doit l'écrire (ou résoudre par sha256 **et** identifiant d'appel, le suffixe d'opérateur restant hors dépôt).
  3. **`sources.json`** : `members` (règle a/b ci-dessus), et par fixture `{call, member, source_sha256, rule, sha256, key?}` ; plus aucun nom de fichier de sonde (137 lignes).
  4. **Test** : noms renommés, `SIG0H`/`SIG0C` ⇒ `SIG0A`/`SIG0B`, variable `gtfa` ⇒ `page` ; assertion ajoutée : l'ensemble des fixtures du dossier = les clés de `sources.json`, et chaque nom porte le membre `a` ou `b` de sa source (sans regex de noms d'opérateurs) ; commentaire du module l.80 « gTFA » ⇒ « full-page ».
  5. **Ligne datée de l'ADR PR-2B, §4 l.632-642** (acte de l'orchestrateur) : la table renomme les fixtures, sinon le code et l'ADR divergent. R-25 (C-G2-1 seule, estimation par fichier) : ≈ +26 (réducteur 55 ⇒ 63, `sources.json` 121 ⇒ 137, test +2).
- **C-G2-2 (bloquante, code)** — `checkBounds` (l.207-212) ne contrôle que la paire de X : une borne absente ou `NaN`, ou un compteur absent ou `NaN`, passe (cinq cas, §3.4), contre « entrée explicite, sans défaut » (journal §4 point 10) et D-8 (vii). Correction prototypée : `const [n, d] = list(b.contested) ?? []`, puis arrêt `read_malformed` si l'une des trois bornes ou l'un des cinq compteurs n'est pas un entier naturel ; trois assertions (borne absente, compteur `NaN`, paire absente).
- **C-G2-3 (bloquante, tests ; sonde de la mission)** — ajouter au test `dojo_history_chain_break_stops` : un trou d'un emplacement antérieur à la transaction admise précédente ne libère rien (tue P-4a) ; un trou d'un autre compte ne libère rien (P-4b) ; un trou ne libère que le pre suivant, non la seconde transaction de l'emplacement (P-4c) ; deux transactions d'un emplacement ordonné données dans l'ordre inverse des rangs enchaînent par le rang (P-4f) ; après une fenêtre, un emplacement non ordonné enchaîne depuis un départ libre (P-4e) ; un compte fermé vaut 0 (`A=0/-`, P-4h). Prototypé : six lignes, toutes tuent leur sonde.
- **C-G2-4 (bloquante, tests)** — ajouter : copies à `err` différent et à solde `pre` différent dans la boucle « clé différente » (P-2c survit, P-2a n'est tuée que par l'épingle auto-calculée) ; statut non `finalized` du côté a (P-1c) ; instruction Token-2022 non analysée **sans** liste `accounts` ⇒ arrêt (P-6a, branche fail-closed déclarée au journal §4 point 5, sonde de la mission) ; (iv) : index b privé de SIG0 (P-8c), `blockTime` de l'entrée la plus ancienne décalé (P-8b), frappe de SIG0 à 999 (P-8a, « la frappe de 10^15 » de D-8 l.368). Prototypé.
- **C-G2-5 (non bloquante ; observations pour les lignes datées de Q-7 et Q-6)** — (a) rangs égaux dans un emplacement ordonné : résultat dépendant de l'ordre d'entrée (D-3, déterminisme) ; recommandation : `read_malformed` ; (b) trou dans l'emplacement d'un groupe ordonné : seule la première transaction est libérée (arrêt parasite possible, fail-closed) ; (c) circuit ou boucle pre = post dans un emplacement non ordonné après une fenêtre : arrêt même quand la fin est unique (43 cas sur 3 000 au différentiel) ; (d) Q-6 : le texte de D-8 (vi) ne restreint pas (vi) aux transactions admises ; une instruction Token-2022 non analysée dans un corps sans quorum pourrait être une frappe que l'arrêt d'offre de D-6 ne voit pas (le contrôle (i) par jour la rattraperait à la fermeture de la fenêtre) ; la ligne datée de Q-6 doit le dire ; (e) `meta.innerInstructions` `null` est lu comme « aucune » (l.88) ; aucune fixture ne l'exerce.
- **C-G2-6 (forme, journal)** — §6 : « 16 fixtures × 1 = 677 » : la somme 274 + 210 + 55 + 121 + 16 = 676 ; il y a 17 fichiers d'une ligne (16 fixtures et `probe3-expect.json`) ; §5 « 16 lignes » de même. Commentaire du réducteur « three hits » contre journal §4 point 2 « 1 + 1 + 7 » (trois sources touchées, neuf coups) : à aligner. Après C-G2-1 : §3 et §5 à renommer.

## 6. Prototype des corrections (C-G2-1 à C-G2-4), sur copie

- Arbre `F:/tmp/dojo/g2-pr2b1/fix` (clone `--no-local`, HEAD `02884eb`, fichiers du lot copiés) ; fixtures régénérées par le réducteur corrigé depuis la sonde (lecture seule) ; `fix-patch.mjs` (`0c1125ee…`) puis deux retouches déclarées (`gtfa` ⇒ `page`, paire `list(b.contested)`) ; diff `fix.diff` (`71100333…`).
- sha256 du prototype : `history-read.ts` `73ff7816…5d93` (275 l.), test `e0813f1f…2c5a` (230 l.), réducteur `378efca2…9e54` (63 l.), `sources.json` `9f6f6182…18f5` (137 l.).
- Vérifications : `node --test` du test : 6/6 ; `apps/dojo/test/*.test.ts` : **62/62** ; `npx tsc --noEmit` exit 0 ; `eslint` sur module et test exit 0 ; `lang-gate` OK, 0 coup ; aucun nom d'opérateur dans le module, le test, les fixtures, `sources.json`, le réducteur (recherche insensible à la casse : 0) ; mutants et sondes : **51/51** (`mut-fix/RESULTS-G2.txt` `4e5b3c59…`), liste du G1 14/14 (`mut-g1-fix/RESULTS.txt` `d1d7aa3e…`) ; **R-25 = 722** (`r25-fix.log` : `21 files changed, 722 insertions(+)`), ≤ 1 083, STOP 1 150 à 428.
- Le prototype n'est pas un livrable : la correction revient au générateur, relue ensuite.

## 7. Décisions de l'orchestrateur (vérifiées)

- Q-1 : trois noms confirmés ; disjonction des 45 codes mesurée ; conforme.
- Q-2 : calcul vérifié (§4) ; échantillon vérifié au sens complet de D-4.
- Q-3 : hexadécimal admis ; conséquence : la propriété « sous-chaîne octet pour octet » ne tient qu'après ré-encodage canonique (§3.2).
- Q-4 : `sources.json` confirmé ; C-G2-1 en change le contenu.
- Q-5, Q-6, Q-7 : cohérentes avec D-3, D-6, D-7 ; observations C-G2-5.
- Q-8 : `error_origin` orchestrateur, sans effet sur PR-2b-1.

## 8. Fichiers de ce G2 (tous sous `F:/tmp/dojo/g2-pr2b1/`)

`r25-g2.sh`, `r25-clone.log`, `dojo-tests.log`, `verify-fixtures.mjs` (`00fbafd6…`), `verify-fixtures.log`, `mutants-g1-replay.mjs`, `mut-g1/`, `g2-mutants.mjs`, `g2-list.mjs`, `mut/`, `probe/direct.test.ts`, `probe/hand.test.ts`, `g2-locked.sh`, `g2-run-oracle.sh`, `g2-oracle-all.sh`, `oracle/` (sept journaux, `exits.txt`, `node-count.txt`, `test42.log`), `idem/` (rejeu du réducteur d'origine), `fix/`, `fix-patch.mjs`, `fix.diff`, `g2-list-fix.mjs`, `g2-mutants-fix.mjs`, `mut-fix/`, `mut-g1-fix/`, `r25-fix.sh`, `r25-fix.log`, `fix-tests.log`, `fix-tsc.log`, `fix-eslint.log`, `fix-lang.log`.

## 9. Clôture

- 08:38:34Z (`date -u`) : `git status --short` du worktree = les quatre lignes `??` de l’ouverture ; `git diff --stat HEAD` vide ; HEAD `02884eb` ; sha256 des 22 fichiers (lot et journal) égaux à `DELIVERED.sha256` (22/22, `close.sha256`). Rien écrit dans le worktree ni dans les dossiers du G1 (`pr2b1-mutants/RESULTS.txt` toujours `8bf9a11c…`). Verrou d’hôte absent.
- Aucun réseau, aucun git écrivant dans le worktree ; `git clone --no-local` vers deux clones jetables sous `F:/tmp/dojo/g2-pr2b1/` et `git add -N` dans une copie d’index de ces clones seulement (mesure R-25). Rien sur C:.
- Advisor intégré consulté une fois avant la rédaction (vérification de l’oracle avant verdict, formulation de la propriété de sous-chaîne, `error_origin` de C-G2-1 et doublon de sha256 de C1, épingle auto-calculée, fermeture de la paire de X) ; chaque point vérifié sur pièce ; conseil, jamais verdict.
