# CHECKPOINT-2 U-4b-SCORE-1 (validateur-humain, 2026-09-22, persisté verbatim par l'orchestrateur)

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 (LIVRABLE) — lot U-4b-SCORE-1, branche `lot/u4b-score-1` @ `35f7a67`

## 1. Artefacts lus / rejoués

- Mission : `F:\tmp\u4bscore\MISSION-G2-CP2-u4b-score-1.md`
- Clone à historique complet : `F:\tmp\cp2-u4bscore\tree` (`git clone --no-hardlinks --branch lot/u4b-score-1 F:/Monark`), `node_modules` isolé par `F:\tmp\g2-garde2bi\mk-nm.ps1` (`@monark/rpc-guard` résout dans le clone, 220 entrées, 0 fail). Scripts de recompute sous `F:\tmp\cp2-u4bscore\scratch\`, fixture régénérée sous `F:\tmp\cp2-u4bscore\regen\` (AM-2 ter). `TEMP/TMP/TMPDIR=F:/tmp`.
- Artefacts du dépôt (dans le clone) : `scripts/census/u4b/u4b-scores.mjs`, `u4b-scores.d.mts`, `u4b-reduce.mjs`, `scripts/record-u4b-calib.mjs`, `apps/sentinel/test/fixtures/ukemi/u4b/{PROVENANCE-u4b.md,U4b-*.json(l)}`, `apps/sentinel/test/ukemi-u4b-scores.test.ts`, `docs/adr/ADR-U4b-calibration-episode-frais.md` (amendement 2026-09-22), `docs/PLAN-u4b-prereg.CANDIDAT.md`, `docs/CHANTIERS.md:646-652` (décision 126), `.github/workflows/ci.yml:65`.
- Bruts hors dépôt (lecture seule) : `F:\PRODUITS\etude-2026-09-20\u4-raws\`.
- G1 : seul l'en-tête de provenance lu (`Modèle résolu : claude-opus-4-8[1m]`, base déclarée `f26693f`) ; aucun chiffre du G1 ni du G2 consommé (CA-9).

## 2. Les 8 vérifications, refaites

| # | Attendu | Mesuré par moi | Verdict |
|---|---|---|---|
| 1 | diff code = `u4b-scores.mjs` (1 ligne + commentaire), `.d.mts`, fixture, test ; reduce/record inchangés | `git diff f26693f..35f7a67 -- scripts` : `u4b-scores.mjs` +2/−1 (commentaire `:29-30`, score `:245`), `u4b-scores.d.mts` 1 ligne de commentaire (doc de signature ; aucune signature ne change — justifié). `apps` : PROVENANCE, fixture JSONL, test. sha256 `u4b-reduce.mjs` = `a5e66cd3…7a6fac0`, `record-u4b-calib.mjs` = `5733daeb…1fbc31a3` — inchangés, `git diff --quiet` rc 0 | conforme (voir C-1 sur le numéro de ligne, C-5 sur la base) |
| 2 | fixture régénérée byte-à-byte | sha bruts `8f620f6c…` / `7b87f6d3…` vérifiés d'abord ; recette PROVENANCE §3 rejouée sous `env -u` vers `F:\tmp\cp2-u4bscore\regen\` : `cmp` IDENTIQUE pour les 3 fichiers (book, oracle-path, scores). LF-sha des 3 = table §1 (`baf717b7…`, `5e6448dc…`, `301d39fa…`). LF-sha `u4b-scores.mjs` = `2f9a31f6…f51445c0` ; blob de base `f26693f` = `9ad20666…f83feacf` | conforme |
| 3 | q̂ k0 = 23169870364, k1 = 3609978241254, k2/k3 under_calib ; 0 ligne Y<ŷ avec score≠0 | script indépendant (`scratch/qhat.mjs`, sans le réducteur) : k0 n=363 p=361 q̂=23169870364 ; k1 n=148 p=148 q̂=3609978241254 (= max) ; k2 n=46 p=47, k3 n=8 p=9 ⇒ under_calib ; cellule A poolée 1861718113769 ; B under_calib. `Y<ŷ ∧ score≠0` = 0 ; scores négatifs = 0 ; `score ≠ max(Y−ŷ,0)` = 0 ; méta strates identiques. Diff structuré ancien/nouveau : 665/665 lignes, census IDENTIQUE, méta hors q̂/digests IDENTIQUE, 552 scores changés / 112 inchangés, 0 champ non-score modifié ; digests A `dc9ab572`→`2feb4ab0`, B `89897a61`→`07bb8e3b` | conforme |
| 4 | mutant symétrique ⇒ `u4b_score_is_one_sided_exceedance` ROUGE ; restauration byte-exacte | 1ʳᵉ tentative à `:244` (ligne citée par le lot) : `sed` ne touche RIEN (`:244` = `const yhat`), 13/13 VERT — faux positif évité par relecture de `git diff --stat` (vide). Mutant appliqué à `:245` : 3 tests ROUGES (`u4b_scores_on_e2`, `u4b_score_is_one_sided_exceedance` avec l'assertion « every Y<ŷ account scores exactly 0 », `u4b_scores_input_mutants_shift_digest`), 10 verts. Restauration `git checkout --` : sha `2f9a31f6…` identique, `git status` vide | conforme |
| 5 | ci 765/763/0/2 skips connus, lint 0, ratchet 69/69, lang:gate 0, export:check 0 | `npm run ci` rc 0 : 765 / 763 / 0 fail / 2 skipped (`u4_redraw_selects_by_book_digest_seed` « until 2b-iii… », `fetch_only_inside_client` « until 1b ») ; `lint` rc 0 ; `lint:ratchet` 69/69 rc 0 ; `lang:gate` 0 hit rc 0 ; `export:check` 0 forbidden path rc 0. Tout sous `env -u` des 8 clés | conforme |
| 6 | tableau 9 sha = fichiers du clone ; région « borne haute `[0, ŷ+q̂_k]` » ; `region.kind` reste `"interval"` sur le fil ; item Mondrian avec déclencheur | LF-sha recomputés des 9 fichiers (#1..#8 + labeler `755b3a38…618db2de4`) = tableau §3 de l'amendement, tous. Sur la pointe `f0720ae` de `lot/etude-suite`, les 8 non re-gelés sont les MÊMES blobs (seul #1 diffère, attendu) ⇒ fermeture transitive tenue après fusion. §2 et §5 clause 4 écrivent « borne haute `[0, ŷ + q̂_k]`, jamais un intervalle ». Item formé §6 : propriétaire orchestrateur, déclencheur « épisode frais ≥ 100 liquidés mono-WETH dans une strate ». **`region.kind` : l'ADR ne nomme PAS le champ de fil** (grep `kind` = 0 hit ; seules les formulations « texte servi upper bound, jamais interval ») — voir C-2 | conforme sauf C-2 |
| 7 | prereg : H-3 conservateur sous ex æquo, n ≥ 199, compteurs, disjonction 3 vs 1 vérifiée sur le code, score dans §Définitions, aucune revendication nouvelle | §Définitions l.63 : `s = max(Y − ŷ, 0)` + « région servie = borne haute ». H-2bis `n ≥ 199` distinct de nMin. H-3 réécrit « CONSERVATEUR sous ex æquo (atomes en 0 comptés couverts) », zéros par strate 344/120/38/7 = 509 — **recomptés identiques** sur la fixture. Clause 3 : code `:176` (`no_crossing` ⇒ `continue`, pas de `pstar`) vs `:224` (`crossed_yhat_zero++` après franchissement, `pstar` posé) ⇒ disjoints par construction ; fixture : {ŷ=0 ∧ liquidés} = 3, tous `pstar=null`, 0 avec `pstar≠null` ; census `crossed_yhat_zero` = 1 ⇒ « 3, pas 3−1 » exact ; q̂₀ = le 3ᵉ score (top-3 strate 0 = exactement les 3 Y de ces comptes, n−p = 2). Aucune revendication nouvelle (« un OUI de H-3 ne licencie rien de plus » conservé). Résidu : l.207 « Le q̂ et les intervalles » — voir C-4 | conforme sauf C-4 |
| 8 | R-25 = 83 | pathspec exact de `ci.yml:65`, `--shortstat` en trois points : 4 fichiers, 67 insertions, 16 suppressions = **83** (identique avec base `f26693f`, `31a9b42`, `f0720ae`) ; borne 1205 | conforme |

Vérification supplémentaire (hors liste, motivée par C-5) : fusion à blanc dans le clone jetable, branche `cp2-merge-check` = `f0720ae` + `35f7a67`, sans conflit, fichiers du lot identiques au HEAD du lot ; `npm run ci` sur l'arbre fusionné rc 0 : **781 / 780 / 0 / 1 skip** (`fetch_only_inside_client`, attendu). `f0ea922` (pointe actuelle) = TABLEAU seulement, sans recouvrement.

## 3. Checklist CA-1..CA-11

- **CA-1** (critères falsifiables) : conforme — chaque attendu de la mission est un chiffre ou un sha, tous reproduits ; le lot se résume en une phrase : « le score U-4b devient `max(Y−ŷ,0)`, le sha #1 est re-gelé, la fixture est régénérée, quatre clauses pré-enregistrées ».
- **CA-2** (valeur) : conforme — la décision de valeur (forme du score, option 1 vs 2/3/4/5) est la décision 126, prise par l'orchestrateur sur délégation investisseur verbatim « audite la décision de l advisor et tranche » (`CHANTIERS.md:646`) ; les quatre clauses de l'ADR §5 correspondent à celles de 126 (lues l.646-652). Aucune décision de valeur nouvelle dans le lot.
- **CA-3** (ADR, gates) : conforme — amendement daté ADR-U4b 2026-09-22 avec provenance ; le re-gel d'un sha D4 passe par un checkpoint-2 malgré la taille du lot (aucun gate suspendu).
- **CA-4 / CA-5** (fan-out, MAST) : n-a au checkpoint-2 — lot mono-worker Opus 4.8 + relecteur G2 séparé + ce siège ; pas de fan-out à justifier.
- **CA-6** (oracle ET revue) : conforme de mon côté — oracle rejoué (§2 #5, mutant #4, fixture #2) ; la revue G2 (Opus 4.8, contexte frais) est parallèle ; l'acceptation ci-dessous est conditionnée à un G2 PASS/PASS-AVEC-CORRECTIONS non divergent (sinon escalade, frontière).
- **CA-7** (zéro dette) : conforme — item formé Mondrian §6 avec propriétaire et déclencheur ; résiduel strate 0 §7 nommé et mesuré, rapporté, pas contourné ; conséquence sur `G0-lot-u4b-2` déjà anticipée dans le fold (`G0-lot-u4b-2.md:110`, delta D-6).
- **CA-8** (provenance) : conforme — G1 en-tête `claude-opus-4-8[1m]` ; ADR : rédaction worker, insertion orchestrateur `claude-fable-5-1` (R-20), générateur ≠ relecteur (G2 Opus séparé, ce siège Fable) ; `error_origin` : aucun incident à assigner dans le lot lui-même (les défauts de forme C-1/C-3 sont d'origine générateur — à consigner au G7).
- **CA-9** (indépendance imposée) : conforme — instance séparée, contexte frais, tout recomputé par exécution dans `F:\tmp\cp2-u4bscore\` ; aucun chiffre lu du G1/G2.
- **CA-10** (anti-vitesse) : conforme — aucun argument de vitesse ; lot de 83 lignes R-25.
- **CA-11** (branchement) : conforme — le re-gel ne change aucun chemin servi : consommateurs de `u4b-scores.mjs` = `u4b-reduce.mjs` (runner de fixture) et le test ; `apps/harness/src/tools/gate.ts` ne l'importe pas ; U-4b-2 (le branchement dans `gate`) reste « upcoming » ; états `branché`/`built` inchangés — exactement ce que la mission déclare. Registre public non touché par le lot.
- **Anti-close (Bell)** : n-a — lot Ukemi/Aave ; les valeurs `$` citées (Y de 3 comptes, q̂) sont des agrégats de liquidation on-chain en devise de base, ni prix ni close ni VWAP.

## 4. Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée)

Aucune correction ne touche un octet gelé ni la fixture ; toutes sont de forme documentaire, applicables au fold ou au G7.

- **C-1 (non bloquante, à corriger au fold)** — Numéros de ligne périmés : le score est à `u4b-scores.mjs:245` (le commentaire inséré `:29-30` a décalé d'une ligne), pas `:244` ; cité `:244` dans le message de commit, PROVENANCE §5, ADR §1, décision 126 et le commentaire du test `ukemi-u4b-scores.test.ts` (« Reverting u4b-scores.mjs:244 »). Idem `:175`/`:223` (mission) → `:176`/`:224`. Corriger ADR §1, PROVENANCE §5 et le commentaire du test ; un rejeu de mutant sur `:244` est un faux vert (mesuré ici).
- **C-2 (non bloquante, à corriger au fold)** — ADR §2 et prereg l.63 : ajouter une phrase distinguant le TEXTE servi (« upper bound », jamais « interval ») du champ de fil `region.kind: "interval"` qui reste (contrat gelé, checkpoint-1 delta U-4b-2 D-1, commit `4e63f7b`) ; tel qu'écrit, « jamais un intervalle » se lit comme contredisant le contrat de fil.
- **C-3 (non bloquante, à corriger au fold)** — ADR « Licéité » : « 2b-iii n'est pas fusionné » est périmé (fusion `985fed9` 02:10, commit du lot 02:51) ; la condition déterminante, vérifiée sur `f0720ae`, est « prereg -1b non committé (`docs/PLAN-u4b-prereg.md` absent, CANDIDAT seul) et aucune donnée fraîche » — l'écrire ainsi.
- **C-4 (non bloquante)** — prereg CANDIDAT l.207 « Le q̂ et les intervalles » → « les régions (bornes hautes) », résidu de vocabulaire.
- **C-5 (à porter au G7, pas un défaut du lot)** — La mission cite une base `31a9b42` ; la fourche réelle est `f26693f` (G1 exact). Le G7 doit prendre l'oracle sur l'ARBRE FUSIONNÉ (mesuré ici : 781/780/0/1 sur `f0720ae`+lot ; à refaire sur la pointe au moment de la fusion), pas les 765/763 de l'arbre du lot qui prédate 2b-iii.

Point de frontière : si le G2 rend FAIL ou diverge de cette acceptation, ESCALADE-INVESTISSEUR (checklist vs verdict).

## 5. Preuves AM-2 / AM-2 ter

Chemin de rejeu `F:\tmp\cp2-u4bscore\` (clone, regen, scratch). `git -C F:/Monark status --porcelain` vide avant et après ; `lot/u4b-score-1` dans `F:\Monark` = `35f7a671…` inchangé ; LF-sha de `u4b-scores.mjs` dans `F:\Monark` (via `git show`, sans checkout) = `2f9a31f6…` = clone après le cycle mutant/restauration. Écritures (`sed -i`, branche `cp2-merge-check`, fusion) confinées au clone jetable. Aucun commit, aucune installation, aucune variable d'environnement affichée.

## 6. AM-1 — ce que la checklist a attrapé

Le mutant rejoué à la ligne citée par le lot (`:244`) ne mutait rien et rendait 13/13 vert : sans le contrôle `git diff --stat` avant lecture du résultat, la vérification 4 aurait été un faux positif — d'où C-1. Manqués (à signaler a posteriori par l'orchestrateur) : néant connu à ce stade.
