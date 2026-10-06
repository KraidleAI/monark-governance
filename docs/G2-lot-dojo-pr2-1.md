claude-opus-5-5[1m]

# G2 — relecture adversariale du G1 de PR-2-1 (MONARK Dōjō, collecteur, partie pure)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Relecteur G2, instance fraîche, distincte du générateur ; effort high (mission).
- **Mission** : `F:/tmp/dojo/mission-g2-pr2-1.md` (14 l., sha256 `54b07600347a90b3516699f258bc55e227fa40e84383b2f282a8026cf0cbb050`), horodatage 2026-09-27T06:10Z ; `date -u` à l'ouverture : 06:06:01Z.
- **Objet** : worktree `F:/Monark-wt-dojo`, branche `lot/dojo-snapshot-1`, HEAD `9cca56b`, fichiers non committés du G1 ; ADR de lot `docs/adr/ADR-DOJO-PR-2.md` (sha256 `82427c52…d6f2e7`, 396 l.), qui fait foi.
- **Discipline** : aucun git écrivant dans le worktree (lecture seule : `status`, `diff`, `log`) ; aucun réseau ; rien écrit sur C: ; rejeux sur mon propre clone et sur des copies sous `F:/tmp/dojo/g2-pr2-1/` ; suite complète et test 42 sous le verrou d'hôte `F:/tmp/oracle-lock` (propriétaire « G2 PR-2-1 ») ; clones du G1 intacts.

## 0. Verdict

**CORRECTIONS D'ABORD.** Le code est conforme à l'ADR sur tous les points relus (§2) et les 17 mutants nommés, rejoués avec mes propres remplacements, tombent tous (21 variantes) sauf une variante de M-Q22 ; mais une variante légitime de **M-Q22** survit (tests), trois sondes demandées par la mission survivent (clé ouverte, tri des comptes, fraction non réduite), le chemin « lecture non faite » n'a aucun test, et Q-6 exige une ligne datée et un changement de forme de `dojo-reading-v1`. Corrections C-G2-1 à C-G2-5 bloquantes, toutes prototypées sur copie et vérifiées (tests verts, mutants tués, §4) ; R-25 mesuré sur la copie corrigée (C-G2-1 à C-G2-5) : **898** ≤ 934,5.

## 1. État du worktree

- **Avant** (06:06:01Z) : ` M apps/dojo/scripts/dojo-core.d.mts`, ` M apps/dojo/scripts/dojo-core.mjs`, `?? apps/dojo/src/`, `?? apps/dojo/test/dojo-collect-pure.test.ts`, `?? apps/dojo/test/fixtures/`, `?? docs/G1-lot-dojo-pr2-1.md` : conforme à l'annonce de la mission. `git diff --stat` : 2 fichiers, +85.
- **Pendant la relecture, hors de mon fait** : trois fichiers ont été écrits par une autre piste (heure des fichiers, heure locale UTC+1) : ` M docs/dojo/FAITS-probe-12-2026-09-27.md` (07:08:11, relevé Helius n°2 : plafond de cycle 10 000 000, item HELIUS-CREDIT-RECONCILE-1), ` M docs/adr/ADR-DOJO-SNAPSHOT-1.md` (07:16:44, onzième pli, décision 253, +51 −3), `?? docs/PLAN-DOJO-PAGE-1.md` (07:16:26). Constatés à 06:20:38Z. Le onzième pli laisse inchangés la série de la piste A (PR-2-1 → PR-1b-3 → PR-2-2) et les tests et fixtures livrés (sa ligne « Inchangé ») ; il ne touche aucun fichier de PR-2-1 ; `docs/**/*.md` est hors du compte R-25. Je n'ai rien écrit dans le worktree.
- **Après** (relu en fin de passe, §9) : les huit fichiers du lot et le journal G1 ont les sha256 du G1 (§9) ; les trois fichiers étrangers restent présents.

## 2. Table des dix points

| # | Point | Verdict | Constat |
|---|---|---|---|
| 1 | R-1 | conforme | Première ligne du journal G1, de l'ADR et de ce rapport : `claude-opus-5-5[1m]`. |
| 2 | R-25 | conforme | **881** rejoué (§3.1) : pathspec extrait de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` par script, index temporaire dans mon clone, `git diff --shortstat 9cca56b` : `8 files changed, 881 insertions(+)`. Fixtures comptées (le glob `fixtures/**` est ancré à la racine). 881 / 445 = ×1,98 ; ≤ 934,5 ; STOP 1 150 à 269. |
| 3 | Tests rejoués et lus | conforme, avec réserves (C-G2-1, C-G2-5) | 12/12 ; 56/56 dans `apps/dojo/test/` (44 + 12). Les onze noms du §4 PR-2-1 et le test du pli cp-1 sont présents. Oracles recodés dans le test (chaîne SHA-256, formule, règle de ronde, i128, pgcd). Recalcul à la main (§3.2) égal au module. Aucun test ne construit une lecture non faite (`read_at` null). |
| 4 | Mutants | **non conforme** (C-G2-1 à C-G2-4) | 21 variantes nommées rejouées avec mes propres remplacements : 20 tuées, **M-Q22** : ma variante « K − 1 lectures » équivalente au code d'origine (sans effet), puis la variante réelle « lecture 1 omise » (M-Q22b) **survit** ; celle du G1 (« lecture K omise ») est tuée. Sondes : 31 posées, 18 tuées, 13 survivent (§3.3). Total de la première passe : 38 tuées sur 52. |
| 5 | Conformité ADR | conforme, avec Q-6 à plier | D-2, D-3, D-4, D-5, D-7, D-8, C-1, C-9, D-10 relus ligne à ligne contre le code (§3.4). |
| 6 | Hygiène | conforme | Aucun opérateur nommé dans le code, les tests, les fixtures (a/b ; le seul mot « foundation » est dans la regex d'absence du test, l.264) ; chaque constante cite une ligne vérifiée ; imports : `node:crypto`, `bell-chain.mjs`, `dojo-core.mjs` ; aucune horloge (`Date.now` absent ; `now` explicite) ; `package*.json`, `tsconfig.json`, `apps/bell/**`, `dojo-verify.mjs`, `dojo-chain.mjs` inchangés ; `dojo-core` : +79/−0, exports existants intacts. |
| 7 | Journal G1 | conforme, corrections de forme (C-G2-7) | §0 à §15 présents ; `DELIVERED.sha256` 11/11 OK ; `RESULTS.txt` `93443091…9c70` relu ; oracle du G1 `out-2/exits.txt` 7/7 à 0. Écarts : §4 numéroté 1…9, 11, 12, 13, 10 ; §4 point 8 « fautes comptées 2 par pièce » faux pour le mint (0 quand la paire du mint est `null`, mesuré) ; §8 dit M-Q22 tué sans dire que seule la lecture K omise l'est. |
| 8 | Tuyaux | conforme | §13 : aucun chemin servi ne consomme les sorties ; la pièce reste `upcoming` ; TU-1c absent formé (G7 de PR-3a) ; composition pure testée (réponses → enregistrements → paquet → lecteur). |
| 9 | Q-1 à Q-6 | recommandations au §5 | Q-6 faisable sans code de refus nouveau ; nom `unread` déconseillé (homonyme de Bell) : `missed` proposé ; C-G2-5. |
| 10 | Forme | conforme | 0 CR dans les 8 fichiers et le journal ; aucun caractère hors ASCII dans les 8 fichiers (donc dans les noms de test) ; vocabulaire sobre, aucune promesse (recherche `garanti|guarant|promise|certif` : 0). |

## 3. Rejeux

### 3.1 Clone et R-25

- Clone `git clone --no-local F:/Monark-wt-dojo F:/tmp/dojo/g2-pr2-1/clone` (06:11:06Z), HEAD `9cca56b` ; les huit fichiers du lot copiés, `cmp` égal au worktree, sha256 égaux au §3 du journal G1 ; `node_modules` par `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0`.
- Script `F:/tmp/dojo/g2-pr2-1/r25-g2.sh` : `sed -n 82p` et `sed -n 90p` de `ci.yml`, pathspec et `awk` extraits par `sed`, copie de l'index du clone en `GIT_INDEX_FILE`, `git add -N` des non-suivis dans cette copie seule, puis la commande de CI contre `9cca56b`. Sortie : `tokens: 20`, `STAT: 8 files changed, 881 insertions(+)`, `881` ; par fichier : `dojo-core.d.mts` 6, `dojo-core.mjs` 79, `bundle.ts` 205, `reading.ts` 238, test 307, `accounts.json` 12, `enumeration.json` 16, `provenance.json` 18. Index réel du clone intact (`git status` inchangé).

### 3.2 Recalcul à la main (`node:crypto` seul, `F:/tmp/dojo/g2-pr2-1/hand.mjs`)

- s = SHA-256(« SYNTHETIC dojo collect secret ») ; ancre H^30(s) = `c1bfe3d0…16871508` ; g_3 = H^27(s) = `d6f422c2…c0685fcc`.
- T_d = 1 790 467 200 (2026-09-27T00:00:00Z) ; T_d − genesis = 97 663 833, **divisible par 3** : minuit est aligné sur une ronde, donc « à ou après » et « à ou avant » coïncident ce jour-là ; r_d = 97 663 833 / 3 + 1 = **32 554 612** (temps de la ronde = T_d), lendemain 32 583 412 (+28 800). La sonde P-1 du G1 (genèse non alignée) est donc la seule à distinguer les deux règles ; rejouée : genèse + 1 ⇒ r = 32 554 612, ronde à T_d + 1, égal au module.
- β du test (forme seule) : 48 octets, premier octet `b7` (bit 0x80 posé, 0x40 nul). t_i = T_d + 900 + (SHA-256(g_3 ‖ « dojo-read » ‖ i ‖ β) mod 85 500) : i = 1 → mod 63 919 → 1 790 532 019 ; i = 2 → 84 406 → 1 790 552 506 ; i = 3 → 75 669 → 1 790 543 769 ; i = 4 → 70 287 → 1 790 538 387 ; triés `[1790532019, 1790538387, 1790543769, 1790552506]` ; fin du jour de lecture 1 790 553 106. Comparaison **après** calcul : `seedAnchor`, `daySeed`, `beaconRound`, `readInstants` égaux. β synthétique du compteur 256 : `[1790469960, 1790480732, 1790480732, 1790485173]`, égal au journal G1 (doublon gardé).

### 3.3 Mutants et sondes (`F:/tmp/dojo/g2-pr2-1/g2-mutants.mjs`, listes `g2-mutants.json`, `-2.json`, `-fix.json` ; résultats `mut/RESULTS-G2*.txt`)

Témoin : exit 0, 12 ok. Tué = « not ok » du test visé (« * » : n'importe lequel). Sources inchangées au sha256 après chaque passe.

| Id | Mutation (mes remplacements) | Verdict |
|---|---|---|
| M-Q1, M-Q2, M-Q4, M-Q7, M-Q8, M-Q10, M-Q12, M-Q13, M-Q15a, M-Q15b, M-Q16, M-Q20, M-B1 | comme la liste de l'ADR | tués par leur test |
| M-Q5 | écriture admise dès T_d (`now < t` au lieu de `now < end`) | tué |
| M-Q9a / M-Q9b | maximum / moyenne vraie | tués |
| M-Q14a / M-Q14b | octet 40 ≤ 1 admis / borne d'âge ×10 | tués |
| M-B2a / M-B2b | r_d + 1 / `ceil((T_d − g)/p)` (dernière ronde de la veille) | tués |
| M-Q22 (1re écriture) | `sets.slice(1).every` | survit, **mutant équivalent** (le candidat vient de `sets[0]`) : écarté |
| **M-Q22b** | candidats et contrôle sur les lectures 2 à K (lecture 1 omise) | **survit** |
| M-Q22c / M-Q22d | au moins K − 1 lectures / lecture K omise (variante du G1) | tués |
| G-01 | analogue de `dataSize` : seuls les comptes de 165 octets gardés (PR-2-1 ne construit pas la requête ; le filtre est un acte de PR-2-2, M-Q11) | tué |
| G-02 | `virtual_quote_reserves` lu non signé (négatif accepté) | tué |
| G-05 | moins de deux réponses acceptées ⇒ « 0 » concordant pour tous (réponse refusée ⇒ zéros) | tué |
| G-06 | persistants comptant les fautes | tué |
| **G-07** | lecteur à clés ouvertes (clé en trop) | **survit** |
| G-08a | lignes d'énumération non triées | tué |
| **G-08b** | comptes connus non triés (`no_quorum_accounts` hors ordre dès qu'un compte de la veille manque aux réponses) | **survit** |
| **G-08c** | lecteur : ordre de `no_quorum_accounts` non contrôlé | **survit** |
| **G-09** | prix de lecture non réduit | **survit** |
| G-10 | fraîcheur comptée depuis `read_at` au lieu de l'instant | tué |
| G-11 | doublon d'instant perdu | tué |
| G-12a / G-12b | décalage O ignoré / modulo 86 400 | tués |
| G-13 | contrôle de ronde de l'écrivain retiré (β d'un autre jour annoncée pour r_d ± k) | tué ; une β d'un autre jour **portant** le numéro r_d n'est pas détectable sans BLS : résiduel déclaré par D-5 (forme (ii)), non testable ici |
| **G-14** | lecture non faite portant des réponses acceptée | **survit** (chemin sans test) |
| **G-15** | lecteur : `cause` hors de {disagreement, fault} acceptée | **survit** |
| **G-16 / G-17** | SOL enveloppé : `isNative` / programme `spl-token` non contrôlés (D-4 l.143) | **survivent** |
| **G-18** | clé publique en double dans une énumération acceptée | **survit** |
| **G-19** | emplacements Pyth hors de `slot_min`/`slot_max` | **survit** |
| G-20 | lecteur : sha256 de la veille non contrôlé | tué |
| **G-21** | mint contrôlé à la dernière lecture qui le porte (É-5 : la première) | **survit** |
| G-22 | pièce concordante malgré deux clés différentes | tué |
| G-23 | aucun mint concordant ⇒ jour compté | tué |
| G-24, G-25, G-26, G-29, G-30 | coffre, `base_mint`, exposant > 0, prix ≤ 0, autre mint | tués |
| **G-27 / G-28** | lecteurs : octets canoniques non contrôlés (enregistrement / paquet) | **survivent** |

Lecture des survivants : G-07 d'une part, G-27/G-28 d'autre part, se masquent : les tests « clé en trop » du G1 utilisent des octets non canoniques (`JSON.stringify` non trié, clé insérée avant `schema`), refusés par le contrôle d'octets ; aucun test n'isole l'une des deux défenses. Avec le lecteur à clés ouvertes, un paquet ou un enregistrement portant une clé en trop **en octets canoniques** est accepté.

### 3.4 Conformité ADR (lecture ligne à ligne)

- **D-2** : `decodeEnumeration` refuse la réponse entière pour `program` ≠ `spl-token-2022` (`enumeration_unparsed`), type ≠ `account` ou autre mint (`enumeration_foreign`), état ∉ {initialized, frozen}, montant non décimal, propriétaire non décodable (`reading.ts:79-96`) ; réponse refusée ou faute ⇒ tous les comptes connus (réponse acceptée ∪ comptes de la veille) sans quorum, cause `fault`, jamais « 0 » (`reading.ts:117`, `:134`) ; M-Q20 tué ; tri par octets (`:95`).
- **D-3** : propriétaire, 134 octets, discriminant, `Full` (octet 40 = 1), `feed_id` (41..73), `price` > 0, `exponent` ≤ 0 (`reading.ts:218-231`) ; σ = [price, 10^−exponent] réduite ; fraîcheur t_{d,i} − `sol_usd_max_age_s` ≤ `publish_time` ≤ `read_at`, l'âge venant de l'argument d'ancre (`bundle.ts:38`, `:63`), jamais codé en dur dans le module (165 n'apparaît que dans le test).
- **D-4** : offsets 43, 75, 139, 171 et i128 petit-boutiste 245..260 ; longueur < 203 ou 246..260 refusée, ≤ 245 ⇒ 0, négatif refusé (`reading.ts:176-189`) ; r_S = SOL enveloppé + vqr ; r_M = montant **concordant** du compte de base (`:204-209`) ; r_M = 0 ⇒ `null` (Q-5).
- **D-5** : formule, O en argument (900 au test), mod 86 400 − O, tri, doublons gardés, β contrôlée en forme (`dojo-core.mjs:459-481`) ; `DayInput.read_rule` porte 4 des 8 clés (décalage, tolérance, genèse, période) : les 8 clés et leur forme sont la charge de PR-1b-3 (`anchorForm`), l'âge SOL/USD entre par `ReadingAnchor` ; aucune écart.
- **D-7** : clés fermées à chaque niveau, octets canoniques + LF, sans horloge, `cause` ∈ {disagreement, fault}, `accounts_no_quorum_persistent` sur les seuls désaccords (verdict cp-1 (5)) ; les propriétés sont codées, mais trois d'entre elles ne sont pas isolées par un test (G-07, G-08b/c, G-27/28).
- **D-8** : `Read` à 9 clés fermées ; instants `toISOString` ; fractions réduites par construction (non testé : G-09 ; le lecteur n'exige pas la forme réduite).
- **C-1 / C-9** : absence concordante « 0 » (M-Q7), adresse sans compte « 0 » (M-Q16), somme seulement si chaque compte concorde (M-Q10).
- **D-10** : `DOJO_VERIFY_REFUSALS` = 45 (lu dans le clone) ; `dojo-verify.mjs` inchangé ; le test asserte la disjonction des 26 + 5 refus du collecteur avec les 45.
- **Fixtures** (`verify-fixtures.mjs`) : chaque source retrouvée par son sha256 dans `SHA256SUMS`, sha256 recalculé, `context.slot` égal, `context` réduit à `{slot}`, a = plus petit emplacement, six entrées par réponse égales et sous-chaînes exactes des fichiers bruts dans l'ordre source, valeurs entières du mint, `Pool`, SOL enveloppé et Pyth égales et sous-chaînes ; aucun nom d'opérateur dans les trois fichiers. `provenance.json` exact.

## 4. Corrections

Prototypées sur copie (`F:/tmp/dojo/g2-pr2-1/q6/` puis `fix/`, scripts `q6-patch.cjs`, `fix-patch.cjs`) : 12/12 verts ; puis 13 mutants rejoués contre la copie corrigée : **13/13 tués** (M-Q20, M-Q22b, M-Q22d, G-07, G-08b, G-08c, G-09, G-14, G-27, G-28, Q6-a, Q6-b, Q6-c ; `mut-fix/`). Deltas mesurés contre le G1 : `reading.ts` +1 −1, `bundle.ts` +4 −4 (lignes modifiées en place), test +17 ; R-25 contre `9cca56b` mesuré par `r25-g2.sh` sur mon clone portant les trois fichiers corrigés : `8 files changed, 898 insertions(+)` ⇒ **898** (≤ 934,5 ; C-G2-6 ajouterait ≈ 6). `tsc` et `eslint` : §6.

- **C-G2-1 (bloquante ; test, `dojo-collect-pure.test.ts:302`)** : M-Q22 « calculé sur moins de K lectures » n'est tué que si la lecture omise est la dernière. Ajouter après l.302 :
  `const late = [rec(1, { enumeration: { a: E.a, b: y(E.b) } }), rec(2, { enumeration: xy }), rec(3, { enumeration: xy }), rec(4, { enumeration: xy })];`
  `assert.deepEqual(day(late).bundle.accounts_no_quorum_persistent, [{ account: S165 }], "reading 1 counts too (M-Q22)");`
  Journal §8 : M-Q22 en deux variantes (lecture 1 omise, lecture K omise).
- **C-G2-2 (bloquante ; test, `:286-288`)** : isoler les deux défenses des lecteurs (D-7 : clés fermées, octets canoniques). Importer `canonical` de `../../bell/scripts/bell-chain.mjs` ; pour `readDayBundle` et `readRecord`, un objet à clé en trop **en octets canoniques** (`${canonical({ ...t, extra: 1 })}\n`) et l'objet exact en octets non canoniques (`${JSON.stringify(t, null, 1)}\n`) sont refusés. Tue G-07, G-27, G-28.
- **C-G2-3 (bloquante ; test, `:183`)** : tri de `no_quorum_accounts` (D-7 « liste triée »). Dans `dojo_enumeration_refuses_an_unparsed_response`, où un compte de la veille (`1111…2`) est absent des réponses : `assert.deepEqual(readRecord(recordBytes(r)), r)` et refus `record_malformed` de la liste inversée. Tue G-08b et G-08c.
- **C-G2-4 (bloquante ; test, `:207`)** : fraction réduite (D-8). `rec(1, { wsol: same(wsolOf(String(2n * rM - vqr))) }).read.pool_price` = `["2", "1"]` (variante SYNTHÉTIQUE, r_S = 2 r_M). Tue G-09. Recommandation non bloquante : que `frac` du lecteur exige pgcd = 1 pour `pool_price`, `usd_per_sol` et les valeurs journalières.
- **C-G2-5 (bloquante ; code et test ; Q-6)** : lecture non faite distincte des fautes d'opérateur, et chemin `read_at` null testé. **Partie (a), requise** : nouvelle valeur de `cause`, admise par le lecteur seulement avec `read_at` null, test et M-Q23 ; (a) seule tue Q6-a et Q6-c. **Partie (b), recommandée, choix de l'orchestrateur** (forme D-7 « compte des fautes par pièce ») : `faults` à 0 pour une lecture non faite et règle correspondante du lecteur ; le mutant Q6-b ne vaut que si (b) est retenue. Le prototype porte (a) et (b).
  - `reading.ts:103` : `export type Cause = "disagreement" | "fault" | "missed";`
  - `bundle.ts:65` : `cause: at === null ? "missed" as const : s.cause` ; `bundle.ts:74` (partie (b)) : `faults` à zéro pour chaque pièce quand `at === null` (une fenêtre manquée n'est pas une faute d'opérateur) ;
  - `bundle.ts:163-165` (lecteur) : `missed` exige `read.read_at` null (et, avec (b), les cinq fautes à 0) ; `disagreement` et `fault` exigent `read_at` non null ;
  - test (`dojo_bundle_counts_accounts_without_quorum_at_every_read`) : lecture non faite ⇒ `[{ account, cause: "missed" }]` et fautes `[0, 0, 0, 0, 0]` ; aller-retour par `readRecord` ; `missed` réécrit `fault` ⇒ `record_malformed` ; lecture non faite portant une réponse ⇒ `bundle_input_malformed` ;
  - mutant **M-Q23** (nom libre dans la mère et l'ADR de lot ; `M-23` de PR-1b-3 est distinct) : « lecture non faite écrite `fault` » ; variantes : fautes comptées pour une lecture non faite, lecteur sans lien `cause`/`read_at` ; toutes tuées sur la copie ;
  - ligne datée de l'ADR de lot : D-7 l.177 (`cause` ∈ {`disagreement`, `fault`, `missed`}) et PR-2-3 l.242 (un compte `missed` n'est jamais soumis au témoin, comme `fault`) ; §5 : +11 environ.
  - Aucun code de refus nouveau : `cause` vit dans `dojo-reading-v1`, jamais dans le `snapshot` ni dans `dojo-verify` (45 inchangés) ; une valeur hors liste tombe sous `record_malformed` existant.
- **C-G2-6 (non bloquante ; test)** : contrôles écrits sans test : `isNative` et programme du SOL enveloppé (G-16, G-17 ; D-4 l.143), clé publique en double (G-18), emplacements Pyth dans `slot_min`/`slot_max` (G-19), mint contrôlé à la **première** lecture concordante (G-21 ; É-5 : un cas « lecture 1 concordante et saine, lecture 2 concordante et changée » ⇒ `counted`). Une assertion chacun.
- **C-G2-7 (non bloquante ; journal G1)** : §4 renuméroté (10 après 9) ; §4 point 8 : « fautes 2 par pièce, 0 pour le mint quand il n'est pas lu à cette lecture » (ou 0 partout après C-G2-5) ; §7 : « clé en trop » refusée par le contrôle d'octets, et non par les clés fermées, avant C-G2-2 ; §8 : variantes de M-Q22.
- **C-G2-8 (non bloquante ; déclaration)** : sans `check`, `readDayBundle` accepte un jour abstenu à balise non nulle portant `beacon_unavailable`, et un `mint_check` quelconque quand la balise est nulle (formes que l'écrivain ne produit pas ; `check` les refuse par `composed`) ; le lecteur ne recalcule pas les instants (il n'a pas `read_rule` ; charge du vérificateur, PR-1b-3). À déclarer au journal.

## 5. Points ouverts du G1 : recommandations

- **Q-1** : suivre la décision de l'orchestrateur : PR-2-2 passe les deux réponses à `readingRecord` (une seule règle de concordance, testée ici, deux emplacements gardés). Ligne datée de l'ADR de lot amendant D-1 l.115 et É-9 l.97 (« par `quorum2` importé » ⇒ « par `concord` de PR-2-1 ») et mère §6 T-7 au prochain pli. Condition à reporter dans PR-2-2 : `quorum2` garantissait deux opérateurs distincts (`operatorOf`) ; `concord` ne voit que a et b : `dojo_collect_never_publishes_one_operator` doit asserter que a et b viennent de deux opérateurs distincts.
- **Q-2** : suivre : `Eve` = {addresses, accounts} ; PR-2-2 la forme depuis le paquet d−1 (adresses) et ses enregistrements (comptes), PR-2b donne les adresses seules pour le premier jour lu. La ligne datée doit fixer la source des comptes : union des (compte, propriétaire) des énumérations acceptées des K enregistrements de d−1 (ou de la dernière lecture : à trancher), liée par `eve_sha256`.
- **Q-3** : confirmer le calque (`readMintToken2022` a des défauts silencieux et ne voit pas une extension non prévue) ; ligne datée de la mère (l.194) ; le calque est plus strict que la mère (égalité d'ensembles), à dire.
- **Q-4** : `mint_changed`, `mint_unchecked` confirmables ; à inscrire par ligne datée dans D-7 (motifs de `status`), à côté de `beacon_unavailable`.
- **Q-5** : confirmer : r_M = 0 ⇒ `pool_price` null (une fraction à dénominateur nul n'existe pas ; `dayMinimum` ignore les null).
- **Q-6** : faisable sans code de refus nouveau (C-G2-5, prototypé). **Nom** : `unread` est déjà pris avec un autre sens dans le dépôt : `AuthorityKind = … | "unread"` (`apps/bell/src/pools.ts:154`, `discover.ts:162-169`) et mère l.70, où il signifie **quorum manqué**, c'est-à-dire ce que `fault` veut dire ici ; je recommande `missed` (le code dit déjà « missed reading », `bundle.ts:39`). Si l'orchestrateur garde `unread`, l'homonyme est à déclarer dans la ligne datée. Le déclencheur D-6 compte les échecs par hôte dans l'évidence libellée, pas dans cet enregistrement : les fautes à 0 d'une lecture non faite n'en retirent rien.

## 6. Oracle (sept gates, test 42) et contrôle des corrections

- Scripts : `g2-locked.sh` (sha256 `7f8f4604…129e` ; `mkdir F:/tmp/oracle-lock` atomique, `owner.txt` « G2 PR-2-1 », attente 60 s jusqu'à 90 min, retrait dans le piège EXIT) ; `g2-run-oracle.sh` (`e0246c2f…4124`) = `pr2-1b-run-oracle.sh` du G1 au dossier temporaire près (`diff` : une ligne) ; huit variables payantes retirées ; Node v24.15.0 ; arbre : mon clone.
- **Sept gates** (verrou 06:19:46Z → 06:27:18Z, pris sans attente) : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check` : **7/7 exit 0**. `test` : 1 387 tests, **1 385 pass, 0 fail**, 0 annulé, 2 skipped ; les 12 tests du lot ✔ (relevés par nom). `lint:ratchet` 69/69 ; `lang:gate` OK, 0 occurrence. sha256 des journaux : six égaux, en valeur complète, à ceux de `F:/tmp/dojo/pr2-1b-oracle/out-2/` (hachés directement) (`gate-vocab` `f1b1a916…be2b`, `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`, `lint-ratchet` `45ede4ce…6b42`, `lang-gate` `b22ac8f8…0dd7`, `export-check` `2f9645a9…f16`) ; `test.log` `9b146663…387b` (durées différentes).
- **Test 42 à part, après la suite** (verrou repris 06:27:18Z → 06:31:05Z) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 227 s (`test42.log` `b530f407…848c`). Verrou absent après la passe (relu).
- **Copie corrigée** (C-G2-1 à C-G2-5, posée dans mon clone de 06:31:23Z à la restauration, puis retirée : `cmp` égal au worktree pour les trois fichiers) : `npx tsc --noEmit` exit 0 ; `eslint` des trois fichiers exit 0 ; `lang-gate` OK ; test 12/12 ; R-25 898. La suite complète n'a pas été rejouée sur la copie corrigée, et seuls 13 des 55 mutants et sondes (52 + 3) l'ont été : les 42 autres, la suite et le test 42 sont dus au G1 de correction.

## 7. Ce que je n'ai pas pu rejouer

- Réseau, `dataSize` réel (M-Q11), relais de la balise, BLS de β : hors de PR-2-1 ou interdits par la mission ; G-01 et G-13 en sont les analogues purs.
- Une β d'un autre jour annoncée avec le bon numéro de ronde : indétectable sans BLS (D-5, forme (ii)), non testable.
- Sur la copie corrigée : ni la suite complète, ni le test 42, ni 42 des 55 mutants et sondes (dus au G1 de correction, §6).
- La passe « avant » des gates sur la base : non refaite (le G1 ne l'a pas faite non plus ; R-25 se mesure contre le commit de base).

## 8. Incident de passe (déclaré)

- 06:1xZ : une commande de prototype contenait par erreur un appel `python3 -` sans entrée ; l'interpréteur Windows est entré dans une boucle d'erreurs de console et a écrit ≈ 215 Mo dans le fichier de sortie de tâche du harnais (`F:/tmp/claude/F--Monark/e03dd7cc-4452-4c79-9aa6-58827dad4d19/tasks/b69ow0l3g.output`, sur F:). Tâche arrêtée par `TaskStop` ; aucun processus Python restant de ce lancement (liste des processus relue) ; aucun `.python_history` créé sous `C:/Users/KACIMI` ; rien d'autre écrit. Le prototype a été refait en Node seul. Fichier de sortie laissé en place (appartient au harnais).

## 9. sha256 relus (06:32:05Z) et état final

- **Worktree, fin de passe** : HEAD `9cca56b` ; `git status --short` : les six lignes du lot (annoncées par la mission) plus les trois fichiers étrangers du §1 (` M docs/adr/ADR-DOJO-SNAPSHOT-1.md`, ` M docs/dojo/FAITS-probe-12-2026-09-27.md`, `?? docs/PLAN-DOJO-PAGE-1.md`), écrits par une autre piste, jamais par moi.
- **Fichiers du lot, égaux au §3 du journal G1** : `dojo-core.mjs` `34075c6f…32f5` ; `dojo-core.d.mts` `82bcbcd6…2c2e` ; `reading.ts` `2f83df60…4114` ; `bundle.ts` `2e910850…6916` ; test `0d6fb1f3…8051` ; `enumeration.json` `9e3125ef…c11e` ; `accounts.json` `584af319…ee04` ; `provenance.json` `597817b6…e379` ; journal G1 `111cb20b70c1fb07462fad6c52aee08f6f29f3aad74f16c62b5efd63c35e485d` (égal à l'annonce) ; ADR de lot `82427c52…d6f2e7` (égal au §1 du journal G1).
- **G1** : `pr2-1-deliver/DELIVERED.sha256` 11/11 OK ; `pr2-1-mutants/RESULTS.txt` `9344309186f5cbf3a69df520a3a5dc47e0f51f2b9a07aef5df05189cb95a9c70` ; oracle G1 `out-2/exits.txt` 7/7 à 0.
- **Artefacts du G2** (`F:/tmp/dojo/g2-pr2-1/`) : `r25-g2.sh` `7dfd7f2e…46f3` ; `hand.mjs` `06c20bec…7ca2` ; `verify-fixtures.mjs` `be88b61e…b685` ; `g2-mutants.mjs` `5608c531…48a2` (état final ; la première passe a tourné avant l'ajout des paramètres `argv`/`G2_SRC`/`G2_OUT`, logique inchangée ; son résultat est copié en `RESULTS-G2-run1.txt`) ; `g2-mutants.json` `2fe5e26c…bf1c` ; `g2-mutants-2.json` `06113e6b…46b9` ; `g2-mutants-fix.json` `8ab74c13…99de4` ; `q6-patch.cjs` `169f1517…be6f` ; `fix-patch.cjs` `26e602f8…7d39` ; `mut/RESULTS-G2.txt` `5a944a01…a123` ; `mut/RESULTS-G2-g2_mutants_2_json.txt` `a2e936a5…71f2` ; `mut-fix/RESULTS-G2-g2_mutants_fix_json.txt` `f49155ba…c375` ; `g2-locked.sh` `7f8f4604…129e` ; `g2-run-oracle.sh` `e0246c2f…4124` ; journaux de l'oracle : §6.
- **Ce rapport** : sha256 rendu hors du fichier, dans `G2-report.md.sha256`.
- **Laissé en place** : mon clone `F:/tmp/dojo/g2-pr2-1/clone` avec ses jonctions `node_modules` (retrait par `rm-nm.ps1 -Tree` seulement) ; copies `q6/`, `q6-mut*/`, `fix/`, `mut/`, `mut-fix/`. Clones du G1 vérifiés intacts à 06:34:21Z : les huit fichiers du lot dans `pr2-1b-clone` égaux (`cmp`) au worktree ; `pr2-1-mutants/mutants.mjs` `7709946e…5b73` inchangé. Aucune écriture git hors de la copie d'index de mon clone ; aucun réseau ; rien sur C:.
