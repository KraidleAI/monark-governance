# ADR-CM : chantier moteur (points de l'audit P3), découpage en cinq parties, exception de zone W2-E, règles des contrats gelés

- **Statut** : ACCEPTÉ (2026-10-03). Checkpoint-1 d'un validateur neuf : ACCEPTE-AVEC-CORRECTIONS C-1 à C-9, pliées (§11). Validation du fondateur, verbatim : « oui aux trois » (Q-F2 liste B-0 à B-9, Q-F3 exception de zone, Q-F5 deux go distincts), réponse à la présentation de RECHERCHES du 2026-10-03. Le contrôle par diff de MONARK est demandé ; ses retours entrent par amendement daté. Aucun code avant : avis des advisors (fait, §8), checkpoint-1 du validateur, validation du fondateur (décision 300). Les questions du §7 sont au fondateur.
- **Mission** : investisseur, 2026-10-03, verbatim « donne cette mission a recherches, il va la faire lui méme » ; confirmé au fondateur par RECHERCHES : « oui, RECHERCHES fait le chantier moteur, code compris ». Message `recherches:coordination/messages/2026-10-03-MONARK-vers-RECHERCHES-chantier-moteur-audit-P3.md` ([MC]) et sa suite `…-chantier-moteur-branche.md`.
- **Rattachement** : audit `recherches:monark/AUDIT-P3-2026-10-01.md` ([A]) ; statut MONARK `recherches:coordination/messages/2026-10-01-MONARK-vers-RECHERCHES-statut-audit-P3.md` ([S]) ; ADR 0005 et ADR 0006 v8.1 avec addenda 1 à 6 (`recherches:decisions/`).
- **Base mesurée** : `base/chantier-moteur-2026-10-03` = `404480e887a15b647d00110c3a4762a8aa8cf551` (union du tronc MONARK, servi `af9b889`, et de `main` `207f021f`). `apps/harness/src/tools/gate.ts`, `packages/hikae/**` et `packages/contracts/**` sont identiques octet pour octet à `207f021f` (`git diff --stat 207f021f..404480e8` vide sur ces chemins) : les lignes de [A] dans ces fichiers tiennent, sauf les lignes du moteur que [S] a déjà dites fausses (lignes réelles au §2).
- **Écart entre la base et le servi (checkpoint-1, C-1)** : le `gate.ts` de la base (sha256 `0bfc18ba…`) n'est PAS le servi (`4cc340e2…`, lu sur l'hôte par MONARK, égal à `62e0cae:apps/harness/src/tools/gate.ts`). `git diff 62e0cae 404480e8` sur les sources servies : `gate.ts` (+26/−3 : plafond de tau en BYO set rendu 400 nommé ; ensemble vide BYO set rendu `intent_not_in_region` au lieu de `covered`, chantier 2, P3/D8), `verdict.ts` (commentaire), et des ajouts du moteur (`binomial.ts`, `l1-split.ts`, `runs.ts`, `index.ts`) qu'aucun chemin servi n'appelle. La sentinelle de la base (`apps/sentinel/src/run.ts` `a02a9542…`) diffère aussi de la servie (`45557d6e…`) : c'est NARABI-L-1, changement de MONARK, déployé par lui. `l3-gate.ts` (`c23a4030…`) et `calibration.ts` (`6aef88d2…`) sont égaux au servi. Le premier déploiement du chantier livre donc B-0 (§5).
- **Oracle de base** : `npm ci`, `npm run typecheck` vert, `npm test` : voir §2.3 (Node 24.21.0).
- **Provenance** : RECHERCHES, avec trois advisors (relevé du service, relevé du moteur, méthode et découpage), avis et jamais verdicts. Lecture seule ; seule écriture : ce fichier.

## 1. Décision en une phrase

Le chantier corrige les 26 points encore ouverts de [A] (S-16 est fermé) en **cinq parties ordonnées, regroupées par couche de code**, chacune avec plan, tests rouges à la base, G2 par une instance neuve, revue, G7 et go de l'investisseur ; le service ne change que par une **liste fermée de différences servies** par partie ; le code W2-E (`tail.ts`) reste écrit par MONARK, par une **exception de zone** limitée à ce fichier neuf.

## 2. Contexte mesuré à 404480e8

### 2.1 Chemin servi (`apps/harness`, `apps/sentinel`)

| Point | État | Lieu réel |
|---|---|---|
| S-1 | ouvert ; sur liq, `tau` et `tauInterval` restent aussi de l'appelant | `gate.ts:493,508,569,578` ; `l3-gate.ts:103,130` |
| S-2 | ouvert ; `riskControlQuantile` (`l1-split.ts:61`) n'est appelé par aucun chemin servi | `gate.ts:416,493,569,638` |
| S-3 | ouvert | `gate.ts:297-307,766-798` |
| S-4 (harnais) | ouvert | `gate.ts:434,578` ; `ukemi-strata.ts:58` |
| S-5 | ouvert ; voie (a) décidée par MONARK ([S]) | `gate.ts:299,306` |
| S-6 | ouvert | `http.ts:101-102` ; `gate.ts:255-260` |
| S-7 | partiel : liq est généré par `scripts/emit-u4b-calibration.mjs` avec garde d'empreinte, USDe collé à la main, ni statut ni unicité | `calibration.ts:77,206-256,274-288` |
| S-8 | ouvert, **concret** : `LIQ_COMMITTED_SENTENCE` s'affiche aussi pour un yhat de strates s1 à s3 qui rendent `under_calib` | `gate.ts:220,673-692` ; `registry.ts:72` |
| S-9 / E-13 | ouvert ; contrat gelé | `contracts/src/enums.ts:27` ; `schemas/coverage-verdict.schema.json:25` |
| S-10 | ouvert ; P5(b) ouvert sur appel direct de `runGate` | `gate.ts:720-831` |
| S-11 | ouvert, **servi** ; la garde compare `===` à trois noms et à deux couples (classe, clé) | `gate.ts:737-750` ; `calibration.ts:274-288` |
| S-12 | branche btc-dir ouverte ; btc-dir **toujours servie** (`gate.ts:62,200,769-774`) bien que l'ADR 0005 la dise retirée | `gate.ts:507-508,517` |
| S-13 | ouvert | `contracts/src/calib-digest.ts:14-23` ; `serialize.ts:41-52` |
| S-14 / E-11 | partiel (`budgetAt` appelé, `timeline.ts:146`) ; sentinelle figée sur USDe (α 0,1, nMin 50) ; `binomUpperTailLeq` absent | `apps/sentinel/src/timeline.ts:20,29` |
| S-15 | ouvert | `http.ts:97-98` |
| S-16 | **fermé** : registre liq non vide (s0, n = 170) ; commentaires « empty -2a registry » périmés (`gate.ts:75,600,629,741,792`) | `calibration.ts:247-255` |
| E-7 (harnais) | partiel | `gate.ts:434,578` ; `ukemi-strata.ts:58` |

### 2.2 Moteur (`packages/hikae`, `packages/contracts`)

| Point | État | Lieu réel |
|---|---|---|
| E-1 | ouvert : seule la bande additive ŷ ± q̂ existe | `interval-conformer.ts:84,88` ; `region.ts:62` |
| E-2 | ouvert | `contracts/src/calib-digest.ts:20` |
| E-4 | ouvert : ±Infinity et scores négatifs acceptés | `l1-split.ts:65` |
| E-5 | ouvert : rang flottant, comparateur `a - b` | `l1-split.ts:39,41` |
| E-6 | ouvert | `l1-split.ts:78,87-96` |
| E-7 (moteur) | ouvert | `interval-conformer.ts:88` |
| E-8 | ouvert dans le moteur, non atteint au servi (`gate.ts:273`) | `l3-gate.ts:88,100,103,123,126,130` |
| E-9 | ouvert : CDF recalculée pour chaque k | `binomial.ts:69-87,96` |
| E-10 | ouvert, hors du chemin kata | `predictor.ts:28-44` |
| E-12 | ouvert | `l1-split.ts:61` ; `binomial.ts:148` |
| E-14 | présent par construction (NDG-1) | `region.ts:71-76` |

### 2.3 Oracle de base

Oracle de MONARK sur la base : 1 938 tests, 0 échec (message de branche). Rejeu de RECHERCHES, Node 24.21.0, `npm ci` puis `npm run typecheck` : vert. `npm test` : 1 936 tests, 1 913 verts, 22 ignorés, 1 échec, 170 s. L'échec est `test/bell-served.test.ts:153` (`bell_served_collector_revision_is_a_collector_commit`) : `git cat-file -t 3bda2cad…` ne trouve pas l'objet dans le clone superficiel de RECHERCHES. C'est le même échec d'environnement que l'audit avait relevé, pas un défaut du code (MONARK rapporte 1 938 tests et 0 échec sur son tronc complet). Chaque partie compare ses tests à cette base : seul cet échec est toléré, et seulement dans un clone superficiel.

## 3. Découpage (cinq parties, dans l'ordre)

| # | Partie | Points | Différences servies | Déploiement |
|---|---|---|---|---|
| CM-1 | BYO-NEAR-NAME-1 | S-11 | noms et clés imitant une classe commise, ou portant une espace en tête ou en fin, refusés en 400 nommé ; motif des classes kata `^(btc\|eth\|bnb\|sol)-(dir\|range\|mae-down\|mae-up)-(1h\|4h)$` (à élargir pour la vague 2) et préfixe `kata:` réservés ; un BYO honnête reste en 200 | oui, seul |
| CM-2 | SERVED-HARDENING-1 | S-6, S-15, S-12, S-1, S-10 (grille de `produced_at`, P5(b)), E-7 (texte) | voir §5 ; S-1 crée la table de politique par classe (F-7), socle de CM-4 | oui |
| CM-3 | Moteur et contrats | E-8, E-4, E-5, E-2, E-6, E-12, E-9, E-1 (avec S-4), E-13/S-9, S-13 ; raisons écrites E-10, E-14 | **aucune** : E-5, E-4 et la garde NaN vont dans des fonctions neuves ou des options ; `splitQuantile` servi (BYO, USDe, liq, btc-dir) est inchangé ; E-13/S-9 ne change ni `schema_version` (1.0.0) ni les empreintes `openapi.json` ; l'oracle prouve des verdicts rejoués identiques octet pour octet à la base | non |
| CM-4 | Chemin kata servi | S-7, S-2, S-3, S-5, S-8, S-4 (harnais), S-10 (partie kata), branchement `class-policy-v2` et colonnes `tail_*` (ADR 0006) | nouvelles classes kata, **registre kata vide** au déploiement ; le texte d'honnêteté vient de la ligne de politique résolue | oui, registre vide |
| CM-5 | Surveillance | E-11/S-14 | sentinelle par clé kata, pilotée par F-7, test binomial exact des ratés (`binomUpperTailLeq`) ; tracker ABB hors des clés kata | oui (sentinelle) |

Règles :
- **R-25** : chaque PR ≤ 1 150 lignes changées. CM-2 et CM-3 en deux PR, CM-4 en deux ou trois ; la coupe de chaque partie est fixée dans son plan, avant le code.
- **Parallélisme** : CM-3 ne partage aucun fichier avec CM-2 ; il peut être préparé pendant que CM-2 attend son déploiement. Les G7 restent dans l'ordre.
- **Service effectif de la vague 1** : décision distincte du déploiement de CM-4 (registre kata vide). Ce n'est pas un go de ce chantier.

## 4. W2-E : exception de zone

- L'ADR 0006 (`recherches:decisions/0006-ADR-draft-wave2.md` l.8, l.215, §9 l.315-316) : RECHERCHES écrit les tests de W2-E (`recherches:kata/w2e/`) ; MONARK écrit `tail.ts` **après ses corrections du moteur**, et la garde `class-policy-v2` est une ligne MONARK. Les corrections du moteur sont désormais CM-3. Ce chantier garde les deux règles telles quelles.
- **Ordre** : `tail.ts` est écrit par MONARK après le G7 de CM-3 (corrections du moteur), soit dès que CM-3 est fusionné, en parallèle de CM-4. Sa garde des scores non finis s'aligne sur celle d'E-4 (CM-3). Il garde son propre C(n, k), sans partage avec `binomial.ts`.
- **Exception de zone** (la seule) : pendant le chantier, MONARK peut créer, par PR contre la base du chantier :
  - `packages/hikae/src/tail.ts` (fichier neuf) et sa ligne d'export dans `packages/hikae/src/index.ts` ;
  - la garde `class-policy-v2` comme **fonction pure dans un fichier neuf** du harnais (`apps/harness/src/class-policy-v2-guard.ts`), qui recalcule les colonnes `tail_*` d'une ligne et rend la ligne épinglée ou un refus.
- **CM-4** (RECHERCHES) fournit la table F-7 et **appelle** cette garde à l'import ; il ne l'écrit pas. La séparation générateur et vérificateur de l'ADR 0006 tient donc sans amendement.
- Conflit possible : le seul bloc d'export de `index.ts` ; la PR fusionnée en second se rebase.

## 5. Changements de comportement servi (liste fermée, à accepter par le fondateur)

Liste de toutes les parties. Partout ailleurs, verdicts et corps de réponse identiques octet pour octet au servi `af9b889`, sauf B-0, prouvés par rejeu.

| # | Partie | Aujourd'hui | Après |
|---|---|---|---|
| B-0 | CM-1 (hérité de la base, chantier 2) | BYO set : tau > nombre de candidats − 1 accepté ; ensemble vide rendu `covered` | 400 nommé ; ensemble vide rendu abstain `intent_not_in_region` |
| B-1 | CM-1 | `BTC-DIR-15M`, clé USDe suivie d'une espace, adresse en casse de somme de contrôle, etc. rendent 200 `commit` | 400 nommé. Règle : toute `task_class` ou clé contenant un caractère `\s` (Unicode) en tête ou en fin est refusée ; la comparaison aux classes et clés commises se fait après minuscules ASCII ; une clé contenant une adresse `0x…` est comparée après minuscules de l'adresse ; le motif kata et le préfixe `kata:` (insensibles à la casse) sont réservés. Le 400 n'a pas encore de `code` (S-6 arrive en CM-2) |
| B-2 | CM-2 | alpha, nMin, tau et `tauInterval` choisis par l'appelant (USDe à α 0,5 rend `commit`) | valeurs de la table F-7, fixées dans le plan de CM-2 depuis les calibrations commises (USDe : α 0,10 et nMin 50 de sa calibration ; liq : valeurs déjà imposées ; tau plafonné à 1) ; une valeur différente envoyée rend 400 nommé |
| B-3 | CM-2 | corps d'erreur `tool_error` sans code | champ `code` stable ajouté (hors contrat gelé) |
| B-4 | CM-2 | `produced_at` en 2099, non RFC 3339 sur appel direct (P5(b)) accepté | 400 nommé ; la grille par classe servie (horizon, pas de barre) est fixée dans le plan de CM-2 ; les classes sans grille gardent le seul contrôle RFC 3339 et « pas dans le futur » |
| B-5 | CM-2 | btc-dir servie (ensemble vide rendu `covered`) | btc-dir retirée, comme décidé le 2026-09-30 (ADR 0005 l.5, l.13) : `btc-dir-15m` rend 400 nommé (« retired »), le nom reste réservé contre le BYO |
| B-6 | CM-2 | sortie HTTP non validée | validée ; une sortie invalide rend 500 |
| B-7 | CM-2 | bord de la bande USDe à un ulp près, non dit | écart d'un ulp écrit dans le texte servi d'USDe (la bande ne change pas). Liq : rien tant que DEM-4 n'a pas tranché la mesure ([S] : aucun écart sur liq) |
| B-8 | CM-4 | texte d'honnêteté liq « calibré » affiché aussi pour les strates s1 à s3 en `under_calib` | texte tiré de la ligne de politique résolue : la phrase calibrée seulement pour s0 |
| B-9 | CM-4 | aucune classe kata | classes kata présentes, registre vide : toute requête kata rend `under_calib` (ou 400 nommé hors domaine, S-5) |

S-4 côté harnais ne touche que le nouveau chemin kata : les bandes de `gate.ts:434,578` et `ukemi-strata.ts:58` ne changent pas.

## 6. Risques et parades

- **R-1 Changement servi non voulu.** Parade : §5 fermé ; test de rejeu octet pour octet par partie ; empreintes épinglées (`openapi.json`, description) déplacées seulement par les lignes de §5.
- **R-2 E-5 et E-4 déplacent un verdict servi** (rang split entier différent d'une unité, scores négatifs refusés en BYO). Parade : `splitQuantile` servi reste inchangé ; le rang exact, le refus des non finis et des négatifs vont dans une fonction neuve utilisée par le chemin kata ; le BYO garde son comportement, avec une raison écrite.
- **R-3 Contrats gelés** (`packages/contracts`, `schemas/**`), qui alimentent le miroir public et la spécification publique. Parade : changements **additifs seulement** (aucun renommage, aucun retrait), version de contrat incrémentée, chaque changement posé par un amendement daté de cet ADR, contrôle par diff de MONARK avant fusion. E-2 va dans `hikae`, pas dans `contracts`.
- **R-4 Ré-interprétation du pré-enregistrement** (bande [0, h*], silence, flat). Parade : toute ambiguïté remonte à un ADR, jamais au code ; tests écrits depuis le texte des ADR 0005 et 0006 ; registre comparé octet pour octet ; G2 par une instance neuve et recalcul de MONARK, puisque RECHERCHES est auteur de l'audit, des ADR et du code.
- **R-5 Calendrier.** Cinq parties avec G2, G7 et déploiements par MONARK : c'est le chemin critique vers la vague 1. Parade : CM-3 en parallèle de CM-2 ; plan de coupe R-25 avant chaque partie.
- **R-6 Surfaces de MONARK.** Le retrait de btc-dir touche `apps/site` (`fleet.ts`, `harness-served.json`, `sim.ts`), `scripts/verify-harness.mjs` et `skills/monark/SKILL.md`. Parade : ces fichiers restent à MONARK ; RECHERCHES lui envoie la liste et le diff proposé, MONARK les applique.

## 7. À décider par le fondateur avant tout code

- **Q-F1 btc-dir** : information, pas de nouvelle décision : son retrait est déjà décidé (2026-09-30, ADR 0005 l.5, l.13) et s'exécute dans CM-2 (B-5). Il touche des surfaces publiques de MONARK (R-6).
- **Q-F2** : accepter la liste fermée des changements servis du §5 (B-0 à B-9).
- **Q-F3** : l'exception de zone du §4 (MONARK écrit `tail.ts` et la garde `class-policy-v2` après CM-3, dans des fichiers neufs), qui garde l'ADR 0006 sans amendement.
- **Q-F4** (information, décision technique des advisors et de MONARK) : contrats gelés modifiés par addition seulement, avec contrôle par diff de MONARK (R-3).
- **Q-F5** : le déploiement de CM-4 (registre kata vide) et le service effectif de la vague 1 sont deux go distincts.

## 8. Remède ou raison écrite

- **Remède** : tout point de CM-1, CM-2, CM-4, CM-5, et E-8, E-4, E-5, E-2, E-6, E-12, E-9, E-1, E-13/S-9.
- **Raison écrite** :
  - **E-10** : hors du chemin kata ; CM-4 apporte sa propre fonction de label avec `flat` explicite (`kataLabel`). La raison tombe si la surveillance réutilise `labelOf`.
  - **E-14** : q̂ = 0 calibré rendu `under_calib` ; effet nul en pratique à α 0,01 ; figé par un test, et les cases de chemin le disent dans leur texte. Une raison distincte demanderait d'amender `COVERAGE_REASONS` (gelé).
- **Mixtes** : S-4 et S-10 (harnais et kata, répartis entre CM-2 et CM-4) ; E-7 (texte pour USDe et liq ; bord défini par le test du score pour la nouvelle bande d'E-1) ; S-13 (un seul canonicaliseur pour les lignes F-7, les deux autres restent avec une raison écrite).
- **Hors chantier** : E-3 (note au registre de P2, RECHERCHES) ; S-5 côté spécification publique (version datée, MONARK).

## 9. Ce qui reste à MONARK

Déploiement du harnais servi après G7 et go de l'investisseur (RECHERCHES donne le sha) ; contrôle par diff sur demande ; fusion des PR dans son tronc ; `apps/site`, `apps/dojo`, `apps/bell`, `scripts/export-public.mjs`, la spécification publique et le miroir `KraidleAI/Monark` ; `tail.ts` (§4).

## 10. Items formés

| Item | Propriétaire | Déclencheur |
|---|---|---|
| CM-1 plan et tests rouges | RECHERCHES | validation de cet ADR |
| CM-2 à CM-5 plans | RECHERCHES | G7 de la partie précédente (CM-3 : en parallèle de CM-2) |
| BTC-DIR-RETIRE-SURFACES-1 | MONARK, sur diff de RECHERCHES | plan de CM-2 |
| W2E-TAIL-1 (`tail.ts`, garde `class-policy-v2`) | MONARK | G7 de CM-3 |
| STALE-COMMENTS-1 (commentaires « empty -2a registry ») | RECHERCHES, dans CM-2 | — |

## 11. Pli du checkpoint-1 (2026-10-03)

C-1 écart base et servi (en tête, B-0) ; C-2 btc-dir déjà retirée (Q-F1, B-5) ; C-3 ordre et rôles de W2-E selon l'ADR 0006 (§4) ; C-4 CM-3 sans changement servi (§3) ; C-5 B-8, B-9 et S-4 harnais (§5) ; C-6 B-2, B-4, B-7 précisés ; C-7 règle de normalisation de B-1 ; C-8 oracle et `timeline.ts:146` ; C-9 Q-F4 en information.

## Amendement daté 2026-10-03 (soir) : contrôle par diff de MONARK sur CM-1, DEM-4

- **Version qui fait foi** : le texte accepté est `87ca96a1…` (commit `955f545`) ; il ne change que par des amendements datés en fin de fichier, comme celui-ci.
- **B-7, liq confirmé** : DEM-4 mesure 0 ulp sur liq, sur tout le domaine servi de s0 (max(ŷ + q̂) = 326 184 298 995 < 2^53, donc fl(ŷ + q̂) exact ; 4 400 009 centres, 0 écart). B-7 reste sur USDe seul (écarts mesurés jusqu'à 4 ulp de q̂).
- **Items ajoutés au §10** :

| Item | Propriétaire | Déclencheur |
|---|---|---|
| LIQ-BAND-EXACT-GUARD-1 : garde « max ŷ de la strate + q̂ ≤ 2^53 » au chargement d'une calibration liq, avec son test (s3 la romprait, mesuré par MONARK) | RECHERCHES, dans CM-4 (import gardé) | avant toute strate liq nouvelle |
| BYO-ASCII-LOOKALIKE-1 : imitations ASCII (l, I, 1 ; rn, m ; `_`, `-` ; `k4ta:`) qui passent B-1 ; remède par liste fermée et réduction des confusables | RECHERCHES | plan de CM-2 ; tout remède est une ligne B neuve au §5 et passe par le go du fondateur |

## Amendement daté 2026-10-03 (nuit) : chiffres et prix (re-revue de MONARK sur CM-1, F-2 et F-4)

- **Chiffres** : à l'en-tête (« Écart entre la base et le servi »), le diff `62e0cae..404480e8` de `gate.ts` (B-0) est **+23/−3**, et non +26/−3. CM-1 seul mesure `gate.ts` +38/−0 et `calibration.ts` +16/−0 (`git diff 404480e8 c53f0a72`).
- **Prix de BYO-ASCII-LOOKALIKE-1** : environ 40 lignes de code et 80 de tests, une ligne B neuve au §5 (go du fondateur). Cas : rapport `recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-RAPPORT.md` (sha256 `d6ef7ec9…6b99`), E1 à E15.
- **CM-1 fusionnée** dans la base (`c53f0a72`, PR #103) et dans le tronc de MONARK (`59b95f29`) ; rien n'est déployé.

## Amendement daté 2026-10-03 (nuit, 2) : plan de CM-2, B-2 resserré, B-10 ; go du fondateur

- **Go du fondateur**, verbatim : « oui aux 1, 2 et 3 », réponse à la présentation de RECHERCHES du 2026-10-03 (1 : B-2 resserré ; 2 : changements servis qui en découlent ; 3 : B-10). Avis de l'advisor du plan de CM-2 (avis, jamais verdict) ; mesures de MONARK (`recherches:coordination/pieces/2026-10-03-cm1-dem4/dem4-RAPPORT.md` §3 et §4).
- **B-2 remplacé** par : le serveur impose les seuls paramètres liés à la calibration. Table F-7 :

| Classe | α | nMin | tau | `tauInterval` |
|---|---|---|---|---|
| USDe, clé commise seulement | 0,10 imposé | 50 imposé | sans objet (validé fini ≥ 0) | appelant |
| USDe, autres clés | appelant (`under_calib`) | appelant | appelant | appelant |
| liq | 0,01 imposé (déjà) | 100 imposé (déjà) | sans objet | appelant |
| cascade | sans objet (registre vide) | sans objet | appelant | appelant |
| BYO set et interval | inchangé (plafond de B-0) | inchangé | inchangé | inchangé |

  Un α ou un nMin envoyé différent de la table rend un 400 nommé (égalité stricte, comme liq aujourd'hui) ; la valeur de l'appelant n'est jamais remplacée en silence. `tauInterval` est la tolérance de largeur de l'appelant : il ne change aucune revendication de couverture. Le plafond tau ≤ 1 passe aux classes kata `set` (CM-4).
- **B-3 étendu** : le code d'erreur stable figure aussi côté MCP (`_meta`, `monarkgate.tech/error_code`), le premier contenu du message restant identique octet pour octet.
- **B-4 précisé** : `produced_at` RFC 3339 strict dans `runGate` (ferme P5(b)) ; « pas dans le futur » aux points d'entrée HTTP et MCP, avec une tolérance déclarée de 300 s et l'instant injecté depuis `src/` (K-8) ; aucune grille pour USDe, liq, cascade et le BYO.
- **B-5 précisé** : `btc-dir-15m` rend un 400 nommé `task_class_retired` ; la liste `known:` du message de classe inconnue et la description du service changent ; empreintes de la description et d'`openapi.json` déplacées.
- **B-7 précisé** : l'écart du texte USDe est compté en ulp **du bord** (au plus un demi-ulp du bord, la bande n'est pas élargie).
- **B-10 (nouveau, CM-2c)** : BYO-ASCII-LOOKALIKE-1 : un nom BYO dont la réduction des confusables ASCII (l, I, 1 ; rn, m ; 0, o ; `_`, `-` ; blancs internes) égale un nom commis ou suit le motif kata, ou une clé dont la réduction commence par `kata:`, rend un 400 nommé.
- **Ordre des 400** : une requête invalide sur deux points peut changer de message ; 400 reste 400.
- **Découpage** : CM-2a (S-6, S-15/B-6, S-10/B-4, STALE-COMMENTS-1) ; CM-2b après 2a (S-12/B-5, S-1/B-2, E-7/B-7) ; CM-2c (B-10).

## Amendement daté 2026-10-03 (nuit, 3) : jointure attest → gate dormante après le retrait de btc-dir (CM-2b)

- **Décision du fondateur**, verbatim (2026-10-03, réponse à la question 1 du G0 de CM-2b) : « oui mais on ne touche pas au statut de shogen, on laisse built sur la page et on fait ce qu on doit faire ici. de toute façon y a un agent qui travaille sur le VRAI SHOGEN dans son propre repertoire, pas le shogen de monark ».
- **Jointure dormante** : btc-dir-15m était la seule classe servie dont la table d'attestation (`apps/harness/src/attestation-binding.ts`) a un sujet. Après B-5, un `attested` concordant n'atteint plus aucune décision servie (il rend `task_class_retired`) : la jointure `attest` → `gate` (ADR-M017) devient dormante au servi. C'est accepté ; la ligne btc-dir de la table reste.
- **Statut de Shōgen inchangé** : `built` reste sur la page. La liste BTC-DIR-RETIRE-SURFACES-1 ne propose à MONARK que de ré-adresser la preuve du registre aux tests unitaires de la jointure qui restent (`gate_attested_is_frozen_attested_price`, `gate_attested_discordant_is_tool_error`) et, pour l'étape 7 de la trace h5, retrait ou ré-épinglage avec note de provenance (MONARK décide).
- **Item formé** : ATTEST-KATA-SUBJECT-1 (sujet attesté pour les futures classes kata Binance) ; propriétaire RECHERCHES ; déclencheur : après CM-4 ; aucun travail maintenant ; toute ligne neuve de la table d'attestation passe par une ligne B neuve au §5.
- **BTC-DIR-RETIRE-SURFACES-1** est livré par MONARK avec CM-2b ; jusque-là, les tests de `test/` qui comparent le harnais aux surfaces de MONARK (liste dans `docs/G0-lot-cm-2b.md`) sont rouges par construction.

## Amendement daté 2026-10-03 (nuit, 4) : précisions de B-10 (CM-2c)

- **Intention du go 3 du fondateur** (« oui aux 1, 2 et 3 ») : B-10 refuse les imitations ASCII mesurées par MONARK (E1 à E17). Trois précisions, déclarées au G0 (`docs/G0-lot-cm-2c.md`, §Écarts), en font partie : (1) `.` lu `-`, suites de `-` réduites, `-` de bord retirés ; (2) `4` lu `a` pour le seul préfixe de clé `kata:` ; (3) E16 (clé USDe avec `O` pour `0`) refusée comme imitation de la clé commise, non comme une autre population au sens d'A6.
- **Résidu déclaré** (passe encore, aucun item maintenant) : `|` pour l, S/5, 7/t, 8/b, nn/m, cl/d, z/2 ; séparateurs `+` et `~` ; blancs internes retirés, non lus `-` ; clés `kata-:x`, `kata.:x`, `kata_:x`, `kata;x`, `k@ta:x`.

## Amendement daté 2026-10-03 (nuit, 5) : contrat 1.1.0 (E-13/S-9), B-11, lot CM-3c (source : recherches/cm-3b 58ca01b)

- **Décision du fondateur**, verbatim (2026-10-03) : « Tout passer en 1.1.0. Toutes les empreintes changent, et il faut prévenir les appelants et republier la spécification. »
- **§3, ligne CM-3, amendée** : « E-13/S-9 ne change ni `schema_version` (1.0.0) ni les empreintes `openapi.json` » ne vaut plus que pour CM-3a et CM-3b. E-13/S-9 devient le lot **CM-3c** (item CONTRACT-1-1-0), qui passe `schema_version` à 1.1.0 et déplace les empreintes.
- **B-11 (nouveau, CM-3c)** :

| # | Partie | Aujourd'hui | Après |
|---|---|---|---|
| B-11 | CM-3c | `schema_version` 1.0.0 ; `method` ∈ {`split`, `hac-cp`} ; pas de raison distincte pour silence, veto, hors support ; q̂ sans unité | `schema_version` 1.1.0 pour tout verdict et toute décision ; `method` gagne `risk-control` ; `COVERAGE_REASONS` gagne `calib_silence`, `calib_vetoed`, `out_of_support` ; champs optionnels `qhat_unit` et `h_star` ; aucune valeur retirée ni renommée. Toutes les empreintes de verdicts, l'épingle du rejeu, `openapi.json` et la description bougent ; un consommateur 1.0.0 refuse une ligne 1.1.0 (schéma fermé) : les appelants sont prévenus |

- **Répartition** : RECHERCHES pour `packages/contracts`, `schemas/**`, les adaptateurs, les épingles et les tests (par exception à R-3, sur cette décision du fondateur, avec contrôle par diff de MONARK) ; MONARK pour la spécification publique (`KraidleAI/monark-kata-spec`), l'export du miroir public, `apps/site`, `apps/bell` et `apps/dojo` s'ils portent `schema_version`, et l'avis aux appelants.
- **Calendrier** : CM-3c est programmé avec le chemin kata (CM-4), pour que les appelants servis voient un seul changement de format.
- **Item formé** : CONTRACT-1-1-0 ; propriétaires ci-dessus ; déclencheur : plan de CM-4.

## Amendement daté 2026-10-04 (1) : OPENAPI-ERROR-CODE-1 au §10 (contrôle par diff de MONARK sur CM-2a, C-5) (source : recherches/cm-2a-suite 7e37bb9)

| Item | Propriétaire | Déclencheur |
|---|---|---|
| OPENAPI-ERROR-CODE-1 : `openapi.json` décrit le champ `code` du corps d'erreur 400 (liste fermée `HARNESS_ERROR_CODES`) et le 500 `output_invalid` ; prix : environ 60 lignes (code d'`openapi.ts` et son test), empreinte d'`openapi.json` déplacée | RECHERCHES | avec CM-3c et CM-4 (une seule nouvelle empreinte d'`openapi.json` et une seule version datée de la spécification publique) |

## Amendement daté 2026-10-04 (2) : contrôle par diff de MONARK sur CM-2c (source : recherches/cm-2c 136e029c)

- **Source** : rapport de MONARK `recherches:coordination/pieces/2026-10-04-controles-107-112/cm2c-RAPPORT.md` (sha256 `e1215864…52fa`), verdict APPROUVE-AVEC-CORRECTIONS. Ici, « l'amendement (nuit, 4) » désigne seulement celui de ce lot, « (nuit, 4) : précisions de B-10 (CM-2c) ».
- **Résidu de B-10, déclaré comme une classe** (remplace la liste close « passe encore, aucun item maintenant » de l'amendement (nuit, 4)). Toute ressemblance ASCII qui n'est pas dans la réduction fermée de B-10 passe. Cette réduction est : casse ASCII ; blancs ; `rn` → `m` ; `l`, `I`, `1`, `i` → `l` ; `0` → `o` ; `_` et `.` → `-` ; suites de `-` ; `-` de bord ; `4` → `a` pour le seul préfixe de clé `kata:`. Le mot « confusable » reste un jugement ; la mesure, c'est la liste. Exemples mesurés par MONARK sur 96 251 variantes à une édition des noms commis et réservés :
  - déjà nommés par l'amendement (nuit, 4) : `|` pour l, 1 ou I ; S/5 ; 7/t ; 8/b ; nn/m ; cl/d ; z/2 ; séparateurs `+` et `~` ; blancs internes retirés, non lus `-` ; clés `kata-:x`, `kata.:x`, `kata_:x`, `kata;x`, `k@ta:x` ;
  - non nommés jusqu'ici : `!` pour l, 1 ou I (49 variantes, par exemple `btc-dir-!5m`) ; 27 séparateurs autres que `+` et `~` à la place de `-` (86 variantes chacun, par exemple `btc=dir=15m`, `btc/dir/15m`, `btc:dir:15m`) ; `-` supprimé (86, par exemple `btcdir-15m`) ; vv pour w (`btc-mae-dovvn-1h`) ; rr pour m ; 3 pour e ; 9 ou q pour g ; 6 pour b ; `$` pour s ; v pour u ; `@` et `4` pour a dans les classes (`4` écarté à dessein hors du préfixe de clé : G0 de CM-2c, §Écarts) ; clés `kata` suivi d'une autre ponctuation (`kata/x`, `kata=x`, `kata,x`, `kata|x`), `lcata:x`, `|<ata:x`.
- **Précision (4) de B-10, actée** : `asciiLower` puis `[l1i]` → `l` plient aussi le `i` minuscule en `l`. C'est la composition du pli de casse de B-1 avec « l, I, 1 » de B-10. Des noms qui ne diffèrent d'un nom kata que par i ou l sont donc refusés, par exemple `btc-dlr-1h` (`dlr` peut se lire « dollar ») : c'est un faux refus possible, déclaré. Un test l'épingle (`byo_confusable_kata_names_and_keys_refused`). La question Q-1 de MONARK reste ouverte au fondateur : le go 3 couvre-t-il les précisions (1) à (4) ?
- **Prix de l'amendement (nuit)** : il citait « E1 à E15 » ; le lot refuse E1 à E17, tous les cas de la sonde de MONARK. À la base, E16 rendait 200 `defer` (`interval_too_wide`), et non `commit`.
- **Items ajoutés au §10** :

| Item | Propriétaire | Déclencheur | Prix |
|---|---|---|---|
| BYO-LOOKALIKE-RESIDUAL-1 : la classe résiduelle de B-10 ci-dessus (imitations ASCII hors de la réduction fermée), et le faux refus i/l de la précision (4) | RECHERCHES | (a) plan de CM-4 : B-14 élargit le motif kata réservé (r2 §2), avec deux effets attendus, à lire comme tels et non comme une régression : l'épingle « `doge-dir-1h` décide » (`gate-byo-confusable.test.ts`, test C-2) rougit, car `doge` entre dans le motif ; le faux refus i/l s'étend à tout `<actif>-dlr-<h>` du motif élargi. Le G0 de CM-4b retourne l'épingle et mesure ce faux refus. (b) Plus tôt : une imitation résiduelle observée dans un appel BYO réel, ou rapportée par un tiers. Le rejeu de MONARK mesure déjà ces formes au servi (lignes U1 à U20 et U30 à U35, `cm2c-RAPPORT.md` §(1)). Décision : déclencheur non tiré. C'est une sonde de nos agents, et aucun appelant BYO n'existe aujourd'hui (« en ce moment personne n utilise monark engine », fondateur, 2026-10-04) | trois remèdes distincts. (1) Ressemblances de caractères (`!`, `|`, `$`, vv/w, rr/m, nn/m, cl/d, `lc` ou `\|<` pour k, v/u, `@`/a) : squelette UTS #39 restreint aux cibles ASCII. `confusables.txt` du 2026-08-06 (sha256 `6ed3ee96…5b92`) compte 6 712 correspondances, dont 2 269 de cible ASCII. Les paires chiffre-lettre que la table ne porte pas (3/e, 9 ou q/g, 6/b, 5/S, 7/t, 8/b, z/2) vont dans une table fermée de MONARK, à mesurer à la lecture. Environ 30 lignes de code. (2) Les 27 séparateurs, `+`, `~` et le `-` supprimé : une règle de séparateurs qui retire tout caractère non alphanumérique des deux côtés avant comparaison. Un squelette ne la donne pas. Environ 10 lignes de code. (3) `kata` suivi d'une autre ponctuation : préfixe de clé lu « `kata` suivi d'un caractère non alphanumérique ». Cela retourne l'épingle « `kata-model` décide » de B-1 (`gate-byo-lookalike.test.ts`, T-3b) : faux refus à décider. Environ 5 lignes de code. Tests : environ 150 lignes, dont le balayage à une édition de MONARK rejoué et les faux refus de (2) et (3) mesurés sur un corpus commis avec son générateur. R-25 : la table de (1) est commise en `fixtures/**/*.json`, déclarée et hachée (D9 sexies), donc hors du compte. Hors de `fixtures/`, ses 2 269 lignes dépasseraient la borne de 547. Une ligne B neuve au §5, avec go du fondateur |
| BYO-HOMOGLYPH-1 : homoglyphes non ASCII (cité à `gate.ts`, `byoLookAlike` ; revue de CM-1, C-1). Au servi, le schéma `^[ -~]+$` de `task_class` et `predictor_id` les refuse en 400 `invalid_input` ; seul l'appel direct à `runGate` les atteint | RECHERCHES | tout élargissement de ce motif dans `schemas/prediction.schema.json`, ou tout consommateur de `runGate` hors des points d'entrée HTTP et MCP | squelette UTS #39 complet : `confusables.txt` du 2026-08-06 (sha256 `6ed3ee96…5b92`, 763 128 octets, 6 712 correspondances) ; environ 60 lignes de code et 80 de tests. R-25 : la table est commise en `fixtures/**/*.json`, déclarée et hachée (D9 sexies), donc hors du compte. Ailleurs, ses 6 712 lignes dépasseraient les deux bornes (547 et 1 205). Une ligne B neuve au §5, avec go du fondateur |

- **Ligne datée 2026-10-04, 03:3x UTC (horloge lue) : Q-1 close, go explicite du fondateur.** Question : le go 3 (« oui aux 1, 2 et 3 ») couvre-t-il les quatre précisions de B-10 de CM-2c ? Choix du fondateur, verbatim : « Go explicite aux quatre (Recommandé) ». Les quatre précisions ont donc un go explicite : (1) `.` lu `-` ; (2) `4` lu `a` dans le seul préfixe `kata:` ; (3) E16, la clé USDe avec `O` pour `0`, refusée comme imitation ; (4) le `i` minuscule replié en `l`, avec le faux refus déclaré `btc-dlr-1h` et l'item BYO-LOOKALIKE-RESIDUAL-1. La règle de l'amendement « soir » (l.156 : tout remède est une ligne B neuve au §5 et passe par le go du fondateur) est tenue. Source : relais de MONARK (règle 8), `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-go-CM-2c-Q-1.md` §1 (sha256 `48983973…9b6f`) ; consigné au tronc, ETAT et HANDOFF, `8a1b0036`.

## Amendement daté 2026-10-04 (3) : contrat 1.1.0, révision r3 (B-9 précisée, B-11 amendée, B-17, Q-F3, trois actes)

- **Texte amendé** : ce fichier après la réparation des titres (amendements 1 à 8), tel qu'il est sur `base/chantier-moteur-2026-10-03` `87f6081c` et sur `lot/etude-suite` `d305ae15` : 234 lignes, sha256 `20ea6e7bec215375d882d025cca732b33be419ce7d50c1799eb33bc201693492`. Texte proposé : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/AMENDEMENT-ADR-CM-r3.md` §2 (sha256 `774a560134ff17f5962e6c1de3c97d276850a4d442c1572c0a6892910604d0d0`), repris à l'octet hors de cette ligne et de la précision « l.209 ici » ci-dessous ; les faits postérieurs à r3 entrent par les lignes datées du 2026-10-05, en fin d'amendement.
- **Sources, verbatim** :
  - fondateur, 2026-10-03 : « Tout passer en 1.1.0. Toutes les empreintes changent, et il faut prévenir les appelants et republier la spécification. » ;
  - fondateur, 2026-10-04, sur la liste B groupée (la ligne B-11 du plan r1, `pieces/2026-10-04-contrat-1-1-0/PLAN-CM-3c-CM-4.md:217`, LF `1bb9668b…`, puis B-12, B-13, B-14, B-16) et sur la publication de la table de politique : « oui aux deux » (`recherches:coordination/messages/2026-10-04-RECHERCHES-vers-MONARK-go-1-1-0.md` l.6, sha256 `a55840b1…e937`) ;
  - fondateur, 2026-10-04, délégation : « pour les choix que tu me demandes, lances des advisors spécialisés et décidez ». Premier relais écrit : `recherches:coordination/messages/2026-10-04-RECHERCHES-vers-MONARK-CM-2b-plie.md:46` ; ligne FONDATEUR du `JOURNAL.md` de la boîte, posée avec sa source. Décision prise par RECHERCHES sur l'avis de trois advisors : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r2/avis/DECISION-deleguee.md` (sha256 `77c8c7b6…6918`). Les lignes qui en relèvent portent « décision déléguée (2026-10-04) », jamais « go du fondateur » ;
  - MONARK, 2026-10-04, B-15 : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-1-1-0-controle.md` §3.
- **Plan** : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md`, sha256 `3e0da1a617cf5385f6567ec998b33a79fcde00e06d3de3392af47ff9ae07653c`. **Spécification** : `…-r3/SPEC-1-1-0-brouillon.md`, sha256 `975bb40c691b39358ef03cf902858bff68a2edf2034f41f678c867d9948f7b9d`.

**§5, lignes ajoutées ou amendées** (contre le servi `af9b889`, comme le reste du §5) :

| # | Partie | Aujourd'hui | Après | Source |
|---|---|---|---|---|
| B-9 (précisée) | CM-4b | aucune classe kata | classes kata du registre des classes, sans ligne au déploiement : toute requête kata bien formée rend `under_calib`. Contrat de requête, liste fermée : `predictor_id` sans panier, sinon 400 `kata_key_invalid` ; `yhat` hors domaine, 400 `kata_yhat_domain` ; `features_digest` absent, 400 `features_digest_required` ; `tau` > 1 sur un ensemble, 400 `policy_tau_cap` ; `alpha` et `nMin` **requis**, égaux aux valeurs de la classe, sinon 400 `policy_alpha_mismatch` ou `policy_nmin_mismatch`, même sans ligne ; `produced_at` hors grille (contrôle pur, aussi sans horloge), 400 `produced_at_off_grid` ; `maintenant − t > 300 s`, 400 `produced_at_stale`. La grille kata est fixée ici, en CM-4b, et non dans le plan de CM-2 (B-4, l.94). Aucun changement contre le servi : aucune classe kata n'y existe | B-9 accepté (« oui aux trois ») ; B-15 décision de MONARK ; `alpha`/`nMin` : décision déléguée (2026-10-04), Q1 |
| B-11 (amendée) | CM-3c | `schema_version` 1.0.0 ; `method` ∈ {`split`, `hac-cp`} ; aucune raison pour silence, veto, retrait, hors support ou région dégénérée ; q̂ sans unité ; ni champ de case ni empreinte de politique ; corps d'erreur sans `code` normatif | **Le format 1.1.0, énuméré** (plan r3 §2, spécification r3 §3, §5, §6, §13, par les empreintes ci-dessus) : `schema_version` `"1.1.0"` pour la prédiction, le verdict et la décision, **et refus de toute prédiction 1.0.0** (400 `schema_version_unsupported`) ; verdict : `method` gagne `risk-control` ; `region` peut valoir `null` ; `qhat` vaut `null` si et seulement si `region` le vaut ; `qhat_unit` (`label`, `scale`, `score`) et `scale` **requis** ; `scores_sha256` ; `cell_key` ; `policy_row_sha256` ; `policy_table_sha256` ; décision : `request_sha256` ; raisons neuves : `calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate` ; corps d'erreur 400 `{error, operation, message, code}` (plus `issues` sur `invalid_input`), `code` pris dans le catalogue fermé de 32 codes de la spécification §13 ; 500 `output_invalid` ; aucun nombre non fini. **Puis la liste fermée des retraits et renommages**, pour laquelle seule la clause « aucune valeur retirée ni renommée » est levée : `calib_digest` → `scores_sha256` (définition changée) ; empreinte triée retirée du contrat ; ensemble vide « sans région » → `region: null` ; `h_star` abandonné ; « champs optionnels » → `qhat_unit` et `scale` requis ; jeton `calib_digest=` de la ligne de résumé du gate → `scores_sha256=` ; jeton `set_digest=` de la ligne de résumé de `calibrate` → `scores_sha256=` (avec B-17) ; corps `invalid_input` et `invalid_json` qui gagnent `message` et `code`. Toute autre valeur retirée ou renommée reste interdite et demande une ligne B | « oui aux deux » |
| B-12 | CM-3c | rang split flottant sur les chemins servis | rang exact ⌈(n + 1)(1 − a)⌉ en entiers ; sur le BYO et `calibrate`, a = le rationnel de l'écriture aller-retour la plus courte de l'`alpha` reçu, sans limite de décimales ; aucun refus neuf | « oui aux deux » |
| B-13 | CM-3c | bords additifs fl(ŷ ± q̂) | bords tirés du test du score ; phrase B-7 retirée | « oui aux deux » |
| B-14 | CM-4b | motif kata réservé : 4 symboles, 1h et 4h | `^[a-z0-9]{2,10}-(dir\|range\|mae-down\|mae-up)-(15m\|1h\|4h\|24h)$` ; B-10 compare au motif réduit ; plus de noms BYO refusés (`byo_reserved_kata`, `byo_lookalike_confusable`) ; `btc-dir-15m` garde `task_class_retired` | « oui aux deux » |
| B-16 | CM-3c | NDG-1 additif rendu `under_calib` ; ligne NDG-1 de L3 `under_calib` | `region_degenerate` dans les deux cas | « oui aux deux » |
| **B-17** | CM-3c | `calibrate` rend `set_digest = calibDigest(scores)` (trié) ; jeton `set_digest=` sur sa ligne de résumé | `calibrate` rend `scores_sha256` (ordre de l'appelant), par la même fonction que le verdict, au même rang exact que le gate ; jeton `scores_sha256=` ; la boucle d'audit BYO ferme sur `scores_sha256`, `alpha` et `qhat` (ou deux `under_calib`) ; `set_digest` retiré | décision déléguée (2026-10-04), Q2 |

**Textes de cet ADR renversés, avec leur nouvelle lecture** :
- §3, ligne CM-1 (l.63) : le motif kata réservé est celui de B-14.
- §3, ligne CM-3 (l.65) : « aucune », « `schema_version` (1.0.0) », « Déploiement : non » ne valent que pour CM-3a et CM-3b ; CM-3c porte B-11 à B-13, B-16 et B-17 et se déploie à T0 avec CM-4b.
- §3, règle R-25 (l.70) : borne de lot 547 (décision du fondateur, « 547 dès CM-2c »), borne de PR 1 205 (`ci.yml:49`) ; CM-3c et CM-4 en blocs A, B1, B2, C, D (plan r3 §8.3), et non en deux ou trois PR par partie.
- §4 (l.80) : la garde `class-policy-v2` recalcule les colonnes `tail_*` **depuis les comptes** de la ligne (interface de M-3), par addendum daté de l'ADR 0006.
- §5, B-4 (l.94) : « la grille par classe servie … est fixée dans le plan de CM-2 » se lit : la grille des classes kata est fixée par B-9 précisée, en CM-4b ; les classes sans grille restent celles de l'amendement 3 (USDe, liq, cascade, BYO).
- R-2 (l.106) : `splitQuantile` reste exporté, inchangé, hors chemin servi ; les chemins servis passent au rang exact (B-12).
- R-3 (l.107) : « additifs seulement » est levé pour CM-3c ; l'écriture canonique et `scoresSha256` vont dans `packages/contracts`.
- **§7, Q-F3 (l.116)** : « qui garde l'ADR 0006 sans amendement » se lit : l'exception de zone du §4 reste telle quelle (MONARK écrit `tail.ts` et la garde `class-policy-v2` dans des fichiers neufs) ; l'ADR 0006 reçoit **un addendum daté** (D2, dernière puce ; §9, ligne du tuyau) qui écrit l'entrée en comptes de la garde, avec sa ligne P0. **Sous réserve de la réponse du fondateur** (demande portée par RECHERCHES, `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/DEMANDE-FONDATEUR-Q-F3.md`), à obtenir avant la ligne P0 de cet addendum et avant le G0 de CM-4a.
- §8, E-14 (l.125) : la raison distincte existe (`region_degenerate`, B-16).
- Amendement 6, répartition (l.204 sur `cm-3b`, l.209 ici) : aucun adaptateur ne change (attestations en 1.0.0) ; l'avis aux appelants reste à MONARK pour le contrôle et la publication, et RECHERCHES le rédige (acte 2 ci-dessous).

**Trois actes du verbatim du 2026-10-03** (item CONTRACT-1-1-0) :

| Acte | Responsable | Preuve qui le ferme | Porte |
|---|---|---|---|
| 1. « Toutes les empreintes changent » | RECHERCHES (épingles du dépôt, `test/contracts-frozen.manifest.json`) ; MONARK (29 + 10, temps (i) et (ii)) | recensement ancien → nouveau par épingle ; aucun `"1.0.0"` chez les producteurs de prédiction, verdict et décision ; CI verte au sha fusionné ; CA verte au sha déployé | ferme CONTRACT-1-1-0 ; ne porte pas le déploiement |
| 2. « prévenir les appelants » | RECHERCHES rédige NOTICE-1-1-0 ; MONARK contrôle et publie | avis passé par la porte de vocabulaire, qui nomme `calib_digest` et `set_digest` → `scores_sha256`, le rang exact et `alpha`/`nMin` requis ; publié à T − D (D ≥ 7 jours) dans le dépôt de la spécification, dans un bloc daté de `/docs/integrators` et en note du miroir ; message du refus 1.0.0 qui pointe vers la spécification et la date | porte le déploiement |
| 3. « republier la spécification » | MONARK (SPEC-PUBLISH-PIPELINE-1, puis SPEC-1-1-0-RELEASE) | commit daté dans `monark-kata-spec` égal aux pièces revues ; CI verte là-bas ; empreinte de table publiée égale au `policy_table_sha256` servi | porte le déploiement |

- F-5 devient deux go datés du fondateur : spécification et avis à T − D, déploiement à T0.
- D est fixé par le fondateur et MONARK avant le G0 de CM-4b ; la date d'effet T0, au go de spécification.
- Le déploiement de CM-2, qui précède la base de CM-3c, passe par son propre go du fondateur, demandé par MONARK.
- La visibilité des dépôts reste l'acte de l'investisseur.
- Le go de service de la vague 1 reste distinct (Q-F5), avec l'ordre pré-enregistré « Range and path rows ship before direction rows » (ADR 0005 D11 P3).

**§10, items ajoutés** :

| Item | Propriétaire | Déclencheur |
|---|---|---|
| NOTICE-1-1-0 | RECHERCHES rédige, MONARK publie | G0 de CM-4b |
| SPEC-PUBLISH-PIPELINE-1 | MONARK | G7 de CM-4b ; CI verte avant le go de spécification |
| SPEC-1-1-0-RELEASE | MONARK | go de spécification (T − D) |
| SERVED-PENDING-1 (instantané servi en attente, lu par les épingles en ligne et par le chargeur du site, pour que la CI reste verte entre fusion et déploiement) | MONARK | avant le G0 du bloc C |
| FIXTURES-GATE-DECISION-GEN-1 | RECHERCHES, sur ouverture de zone | bloc C |
| LATE-CALL-WINDOW-1 (résidu de la fenêtre de retard de 300 s) | RECHERCHES | avant le G7 de CM-4b |
| CALIB-SEQ-IMPORT-1, SHORT-DIGEST-INVERSION-1, DECIDED-AT-1 | RECHERCHES | voir le plan, §9.4 |

**Actes de MONARK dans sa zone** (nommés ici, écrits par lui ; texte proposé dans `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/TEXTES-ACTES-MONARK.md`) : ADR-M001 Décision 9 (addendum, avant le G0 de 3c-1) ; exception datée à ADR-PUBLIC-CADENCE-1 D2 (avant le G0 de 3c-1) ; ADR-M011 D3 (b) et ADR-M002 l.144 et l.264 (raison NDG-1 de L3, avant le G0 de 3c-2) ; ADR-M001 (Décision 4, C5) ; ADR-M005 K-4 (c) ; ADR-M007 (B-7) ; ADR-M011 D2, D4, D5 et D6 (b) ; ADR-M010 l.38 et l.139 et `CONTRIBUTING.md:56-57`.

**Lignes datées du 2026-10-05** (horloge lue : 00:4x UTC ; rédigées par RECHERCHES, contrôlées par MONARK avant le code du lot CM-3c-2, réponse Q-M8 de `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-bloc-C-reponses.md`, sha256 `19de89cc0d0a8512bf5d2f66142b6999794f67c7757800b0feff0e5009e1eb05`). Chaque ligne dit sa qualité. Le G0 du bloc C (`docs/G0-bloc-c-cm-3c-2.md` de `recherches/cm-3c-2`) en est la source de mesure.

- **Ligne datée 2026-10-05 (1) : Q-F3 close, décision déléguée.** La réserve de la ligne §7, Q-F3 (l.116) ci-dessus (« sous réserve de la réponse du fondateur ») est levée par une **décision déléguée (2026-10-04)**, et non par un go du fondateur : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/avis/DECISION-Q-F3.md` (sha256 `73ddbe34c35e438232865d1e69eb2ea86e01d242f530afe171221bd70ca5e6da`), « oui, avec une formulation corrigée ». L'exception de zone du §4 reste. L'ADR 0006 a reçu l'addendum daté 8 (`recherches:decisions/0006-ADR-addendum-8-guard-recomputes-from-counts.md`) : la garde recalcule les queues depuis les comptes de la ligne ; `tail_m`, `tail_a` et `miss_adj_a` sont attestés hors ligne par un vérificateur listé distinct du générateur. Contrôle de MONARK et ligne P0 publiée (`ec202d00`) : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-reponses-G2-L2-Q1-CM-4a.md` (sha256 `cadd361926b252b7d5f4dff928eaa559efea42d72cee44470f1eb7b4e31c8bb6`).
- **Ligne datée 2026-10-05 (2) : D = 7 jours.** La puce « D est fixé par le fondateur et MONARK avant le G0 de CM-4b » ci-dessus est tenue. Réponse du fondateur, verbatim, à l'arbitrage du 2026-10-04 entre deux réponses croisées : « D = 7 jours » (`recherches:coordination/messages/2026-10-04-RECHERCHES-vers-MONARK-D-arbitrage.md` l.8, sha256 `6d1efdbfc9b3f226a125956e9c1d299f2ed604f6564123ac13a5cd47561a1661`) ; accord de MONARK (`…/2026-10-04-MONARK-vers-RECHERCHES-D-7-accord.md`, sha256 `6231d3a8f4c9f1e474d241d241816f5745a9bd8f5d973af217800eacfa46d1c0`). Conforme au plan r3 §9.2 (D ≥ 7 jours).
- **Ligne datée 2026-10-05 (3) : découpe du bloc C en trois PR (R-25 en blocs, l.70).** Le bloc C de la lecture de l.70 ci-dessus se livre en trois PR, chacune ≤ 1 205 et verte en tête, chaque lot ≤ 547 : **C1** = lot CM-3c-2 (préparation, aucun octet servi) ; **C2** = lots CM-3c-3a, 3c-3b et 3c-3c (la bascule : B-11 amendée, B-17) ; **C'** = lot CM-3c-4 (B-12, B-13, B-16, OPENAPI-ERROR-CODE-1, B-8). Dans C2, les têtes des lots 3c-3a et 3c-3b peuvent être rouges sur une liste close à leur G7 ; l'oracle est la CI de la tête de C2, et la preuve rouge porte sur la PR entière au gel de 3c-3c. Décision de MONARK (Q-M1, Q-M2). La lecture de l'addendum D9-ter de l'ADR-M001 qui en découle (ré-épinglage 2 en deux commits, un par lot CM-3c-2 et CM-3c-3 ; C' hors du paquet gelé) est une ligne de MONARK sous D9-ter ; elle n'est pas reprise ici.
- **Ligne datée 2026-10-05 (4) : B-8 au bloc C (C').** La ligne B-8 du §5 (l.98) passe de la partie CM-4 au lot **CM-3c-4 (PR C')**, inchangée sur le fond : texte d'honnêteté liq tiré de la ligne de politique résolue, la phrase calibrée pour s0 seulement ; le texte servi des strates s1 à s3 en `under_calib` devient le texte de la classe. Changement servi de la liste fermée du bloc C. Décision de MONARK : `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-141-et-audit-P3.md` (audit P3, sha256 `73494fc55b32fc0da7cad535f46ba5294ef66f508ff42f3d2eab5bde4727e3e5`) et Q-M13 (« S-8 va en C' »).
- **Ligne datée 2026-10-05 (5) : §5, liste fermée des changements servis, une ligne ajoutée sous B-11 amendée (refus I-JSON).** Accord de MONARK sur le fond, avec demande de la porter ici, à la liste fermée, où il la contrôle et la valide avant le code du lot CM-3c-2 : `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-bloc-C-hors-delegation.md` (commit `3d7f63b`, sha256 `e683a666a39278f36ee0d454f593b880f370883b018bf13ed1f0b4241d739416`). Qualité du fond : **décision déléguée (2026-10-05)**, Q-C2 (`recherches:coordination/pieces/2026-10-05-bloc-C-avis/DECISION-bloc-C-QC1-QC5.md`, sha256 `9d3e6231866bd40f5d8dec5182711c93f6d127c89bbd83222531ab0eb79fc042`) ; liste r4, ligne 21.

| # | Partie | Aujourd'hui | Après | Source |
|---|---|---|---|---|
| B-11 (amendée, I-JSON) | CM-3c (lot CM-3c-3b, PR C2) | une requête `gate` dont l'enveloppe n'a pas d'écriture canonique rend **200** : surrogate isolée dans une chaîne libre (`intent`, `tool`, `yhat` chaîne en mode ensemble) ; littéral numérique hors binary64 (`1e400`, lu `Infinity`) sur `yhat` ou `intent`, rendu `non_evaluable` ou en écho (par exemple `intent: null`) | **400 `param_invalid`**, nommé, **sans code neuf** (le catalogue reste à 32 codes) : la requête est I-JSON (RFC 7493) ; le contrôle se fait au calcul de `request_sha256`, après tous les contrôles existants et avant toute décision ; seule l'erreur d'écriture canonique est convertie, et les refus existants gardent leur code (`scores` `[1e400]` → `byo_calibration_invalid` ; `tau` `1e400` → `param_invalid` ; `yhat` `"\ud800"` en intervalle → `byo_yhat_type`) ; `calibrate` avec `scores` `[1e400]` → `calibrate_input_invalid` avant `scoresSha256`. Une phrase de NOTICE-1-1-0 le dit aux appelants | décision déléguée (2026-10-05), Q-C2 ; ligne contrôlée par MONARK |

- **Ligne datée 2026-10-05 (6) : go du fondateur Q-F1, publication des trois tables marginales.** Question portée par RECHERCHES : à partir de la PR C2, le service et le dépôt public contiennent l'empreinte réelle des tables de politique USDe, liq et cascade, avant le go F-5a. Réponse du fondateur, verbatim : « Oui, ces 3 tables (Recommandé) ». C'est l'exception, pour ces trois tables seulement, à la condition 1 de C-10 de la décision déléguée CM-4b ; les 32 tables kata restent synthétiques jusqu'à F-5a. Source : `recherches:coordination/messages/2026-10-05-RECHERCHES-vers-MONARK-bloc-C-decisions-QF.md` §1 (sha256 `5d6aa7bbb0961fc0fae44eb52357f70f6bcc7fabc7643753c8b44c4fe70273e2`). Les textes et `source` de ces tables sont ceux de la ligne datée Z-3 de MONARK, qui n'est pas reprise ici ; règle de MONARK (même message que la ligne (5)) : le texte de table est le préfixe exact de la phrase servie, suivie du suffixe inchangé (`; B_t is caller-carried.`), et un test épingle cette composition. Les deux schémas neufs entrent sur le site à T0, par MONARK, avec la republication de la spécification, pas dans le bloc C.
- **Ligne datée 2026-10-05 (7) : go du fondateur Q-F2, message du refus 1.0.0.** L'acte 2 ci-dessus veut un « message du refus 1.0.0 qui pointe vers la spécification et la date ». Réponse du fondateur, verbatim : « Version + dépôt de spec (Recommandé) ». En C2, le message nomme la version parlée (1.1.0) et le dépôt de la spécification ; la date T0 y entre par une ligne au go F-5a. Le texte exact passe par la porte de vocabulaire et une ligne datée de MONARK. Même source que la ligne (6).
- **Ligne datée 2026-10-05 (8) : §10, items.**

| Item | Propriétaire | Déclencheur |
|---|---|---|
| LATE-CALL-WINDOW-1 : l'échéance « avant le G7 de CM-4b » ci-dessus est remplacée par trois échéances. **Forme**, avant le G0 du bloc C : **conclue**, constante de la version de 300 s (`PRODUCED_AT_FUTURE_TOLERANCE_MS`, même source que B-4), aucune colonne de `ClassEntry` (une borne par classe après la fusion de C2 demandera une nouvelle valeur de `row_format` et un acte d'ADR). **Valeur** publiée : avant F-5a. **Code** et vecteurs : avant le G7 du lot de D qui sert `produced_at_stale`. Décision déléguée (2026-10-04), C-9, condition 1 (`recherches:coordination/pieces/2026-10-04-CM-4b-avis/DECISION-CM-4b-C1-C11.md`, sha256 `bee35dbc5da002b81949b09028d3e26e3194525fc6c04600863aea6f4decbb5a`) | RECHERCHES | voir ces trois échéances |
| UKEMI-PENDING-SNAPSHOT-1 : instantané en attente de l'état servi d'ukemi (`apps/site/data/ukemi-pending.json`, `--pending` de `scripts/sync-ukemi-served.mjs`), formé au G0 d'UKEMI-PENDING-1 (§6 point 3). **Déclenché** par le G0 du bloc C : C2 change l'empreinte C5 de la strate engagée, et C' la clause liq (B-8). Lot à part, prix noté ~405 lignes R-25 ; zone de Q-UP-1 rouverte par MONARK sur les fichiers nommés jusqu'à sa fusion (Q-M5) | RECHERCHES | fusionné sur la base avant C2 |

- **Ligne datée 2026-10-05 (9) : branche d'intégration de C2 et exception R-25 bornée de sa PR d'intégration (décision de la cellule, Q-3b-1, écrite par MONARK avant le résultat).** Mesure de RECHERCHES (G0 de 3c-3b, prototype mesuré puis retiré) : C2 ≈ 1 340 lignes R-25 après les coupes (a) et vers T0 ; aucune combinaison de coupes ne la ramène sous 1 205, et la bascule est atomique (Q-M2 : seule C2 entière atteint la base). Règle :
  1. MONARK crée `base/c2-integration` depuis la tête de la base qui porte cette ligne. C2 y entre en deux PR relues, chacune sous 1 205 et chaque lot sous 547 : **C2a** (3c-3a et 3c-3b1, ≈ 780) puis **C2b** (3c-3b2 et 3c-3c, ≈ 560), chacune avec sa G2 neuve, le contrôle par diff de MONARK et sa CI.
  2. La tête de C2a peut porter la liste rouge fermée déclarée à son G7 (harnais non chargé), et rien d'autre : MONARK compare les rouges de la CI et de son oracle à cette liste, test par test. La tête de C2b est verte en entier.
  3. La PR d'intégration `base/c2-integration` → base ne porte que des commits déjà relus. Elle est **l'exception R-25 des PR d'intégration** (précédents : décisions 169 et 210 de l'investisseur), **bornée à 1 400 lignes** : au-delà, elle est refusée. Sa CI est verte sauf `r25-taille-de-lot` ; l'oracle Windows de MONARK rend `bad=[r25]` seul, 0 échec de test, et des comptes de tests comparés aux G7 de C2a et C2b.
  4. Rien d'autre ne fusionne dans `base/c2-integration`. La base reste verte d'un bout à l'autre ; la branche d'intégration est retirée après sa fusion, sur accord de l'investisseur (suppression).
  Source : `recherches:coordination/messages/2026-10-05-RECHERCHES-vers-MONARK-C2-R25.md` (proposition) et la réponse de MONARK du même jour.
