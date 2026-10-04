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
