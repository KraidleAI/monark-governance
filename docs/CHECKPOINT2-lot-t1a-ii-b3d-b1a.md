# CHECKPOINT-2 — Bell -b3d-b1a — avis du validateur-humain (verbatim)

Validateur `claude-fable-5-1` (R-1 déclarée à la ré-acceptation), instance séparée. Persisté par l'orchestrateur depuis le transcript du sous-agent (le `.output` de l'outillage était vide ; note outillage CHANTIERS). Avis 1 rendu sur `f2f8808` (2026-09-21 ~06:10 UTC) ; ré-acceptation sur pièces (régime B) rendue sur `a01cb4e` (~08:20 UTC de l'horloge de session).

##### message du validateur — 2026-09-21T06:14:51.934Z 

# CHECKPOINT-2 (LIVRABLE) — sous-lot Bell T-1a-ii-b3d-b1a

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Instance séparée, contexte frais (artefacts seuls, jamais le fil du planificateur). 2026-09-21 ~05:40→06:10 UTC.

## 1. Artefacts lus (chemins)

- `F:\Monark-wt-b3db1a\docs\G0-lot-t1a-ii-b3d-b.md` (plié ; amendement L-b1a-1 l.413-415 ; amendement de format du ledger l.210-227 ; tuyaux l.297-309)
- `F:\Monark-wt-b3db1a\docs\CHECKPOINT1-lot-t1a-ii-b3d-b.md` (mon avis checkpoint-1 transcrit)
- `F:\tmp\b3db1a\RENDU-G1.md` ; `F:\Monark-wt-b3db1a\docs\G2-lot-t1a-ii-b3d-b1a.md` ; `F:\Monark-wt-b3db1a\docs\PLI-lot-t1a-ii-b3d-b1a.md`
- `F:\Monark-wt-b3db1a\docs\PLI-lot-t1a-ii-b3d.md` (§2 sha recomputé `7071484f…` intact ; §5, §6, §7 lus verbatim)
- `F:\Monark-wt-b3db1a\docs\CHANTIERS.md:382-403` (erratum, HELIUS-1, décisions 97-99)
- Code : `apps/bell/src/rebase-crosscheck.ts` (l.130-626), `apps/bell/src/collect.ts` (l.285-320, 560-630), `apps/bell/src/quorum.ts` (l.100-136), `apps/bell/test/rebase-crosscheck.test.ts` (l.1-105, 600-1007) ; `.github/workflows/ci.yml:43,65-72`
- Rejeu de référence checkpoint-1 `F:\tmp\cp1-b3d-b\{h1.ts,replay.test.ts}` — lecture seule, sha inchangés avant/après (`ade1d27c…`, `07854a85…`).

État jugé : worktree `F:\Monark-wt-b3db1a`, branche `lot/t-1a-ii-b3d-b1a`, base `6d26117`, HEAD `f2f8808`, `git status` propre (0 ligne) avant et après mes rejeux.

## 2. Rejeux AM-2 ter — chemin `F:\tmp\cp2-b3db1a\` (aucune écriture dépôt, aucun `git checkout`/`stash`, aucun `npm ci`, aucun réseau)

Préparation : `git archive 6d26117 apps/bell apps/sentinel/src packages` extrait sous `base/` (sha `rebase-crosscheck.ts` = `72cfedfc…`, `collect.ts` = `41cba3ff…` — identiques au pristine annoncé par G1 et G2) ; copie `head/apps/{bell,sentinel/src}` du worktree (sha des 4 fichiers = HEAD, voir §6) ; `TEMP/TMP/TMPDIR=F:/tmp/cp2-b3db1a/tmp`.

| Rejeu | Commande / fichier | Résultat mesuré |
|---|---|---|
| **V-1/V-2/V-3 contre BASE `6d26117`** | `replay-base.test.ts` (mon harnais cp1, imports réécrits vers `base/`) | **0 pass / 3 fail** : V-1 « FAUX EQUAL » (reprise ⇒ `equal`, `scan_complete=true`, ledger 2 pages) ; V-2 `equal` → `inconclusive:budget_exhausted` ; V-3 Σ=4 vs `calls_used`=3 |
| **V-1/V-2/V-3 contre HEAD `f2f8808`** | `replay-head.test.ts` (imports vers le worktree, sorties `run/head`) | **3 pass / 0 fail** : V-1 ⇒ `divergence` (`missingFromSeries=[updA]`, 6,46 s = retry réel sur 503 puis body_quorum, ledger 1 page) ; V-2 artefact byte-identique ; V-3 Σ=3=`calls_used` |
| **Suite complète** | `npm run test` dans le worktree | **569 / 569, fail 0**, exit 0 |
| **`npm run ci`** | gate:vocab + tsc + test | gate:vocab OK (186 fichiers), `tsc --noEmit` OK, 569/569, **CI_EXIT=0** |
| **Fichier crosscheck seul (copie head non mutée)** | `node --test head/apps/bell/test/rebase-crosscheck.test.ts` | 48 / 48 |
| **R-25** | pathspec `STAT=` exact de `ci.yml:65`, base `6d26117` | `4 files changed, 737 insertions(+), 121 deletions(-)` ⇒ **858 ≤ 1 205** (numstat `apps/bell` = 858, concordant) |

**Mutants (9, harnais `mut.mjs` : occurrence unique de la cible exigée, restauration byte-exacte sha vérifiée)** — tous sur la copie scratch `head/`, jamais le dépôt :

| Mutant | Cible | Résultat | Tueur (attendu) |
|---|---|---|---|
| M-G2-1 | `rebase-crosscheck.ts:506` `if (false && !verifyLedgerChain…)` | 47/1 **TUÉ** | `resume_onto_broken_chain_is_refused` |
| M-G2-2a | `:588` `onRetry` no-op | 47/1 **TUÉ** | `retries_by_method_wired_through_runmain` |
| M-G2-2b | `:588` `retry = (fn) => fn()` | 47/1 **TUÉ** | idem |
| M-b1a-1b | `:296` garde page courte neutralisée | 45/3 **TUÉ** (+ `paginates_and_bounds`, `heals_on_resume`) | `short_nonfinal_page_is_not_committed` |
| M-b1a-1c | `:296` `data.length` → `pageTxs.length` | 46/2 **TUÉ** | `full_boundary_page_deduped_does_not_false_stop` |
| garde de mode | `:566` `if (false)` | 46/2 **TUÉ** | `require_full_pages_mode_guard` |
| M-G2-C | `:566` `!== true` → `=== false` | 47/1 **TUÉ** (mode_guard reste vert : tueur spécifique) | `require_full_pages_absent_strict_resume_refused` |
| M-b1a-3 | `collect.ts:312` compteur avant la garde | 46/2 **TUÉ** | `calls_by_method_equals_calls_used` |
| M-b1a-14 | `:616` écriture inconditionnelle | 47/1 **TUÉ** | `artifact_write_is_monotone` |

Chaque restauration : `restore OK` (sha == pristine).

**Rejeu ITEM-A (mon propre test `itemA-head.test.ts`, HEAD)** : run 1 commet 2 pages (init, updA) puis budget ; contrôle honnête ⇒ **`divergence`** (`missingFromSeries=[updA]`) ; édition sur disque de `page_events` (retrait d'updA, core et `entry_sha256` intacts) ⇒ `verifyLedgerChain` = **`ok:true`** ⇒ reprise ⇒ **`equal`, `scan_complete=true`** ⇒ relance mordante ensuite : artefact byte-identique (**scellé par C-B-2**). Le verdict-flipping du G2 est reproduit indépendamment.

## 3. Checklist (règle par règle, preuve par artefact)

- **CA-1** — conforme : chaque L-b1a-n a un critère falsifiable et un test nommé ; je reformule chaque tâche en une phrase (page fautée non committée + stop ; artefact monotone ; Σ==calls_used ; budget en finally ; queue tronquée ; candidates par mint ; chaîne re-dérivée ; semis ; format atomique). La formule `notFullPages` du plan était falsifiée (RENDU §7(1)) — résolue par amendement daté L-b1a-1, `error_origin` incluant mon checkpoint-1.
- **CA-2** — conforme : aucune décision de valeur nouvelle ; option (d) est une résolution technique dans la doctrine C-B-1 (voir §4).
- **CA-3** — **CORRECTION BLOQUANTE (C-V-1)** : C-B-7 exigeait un **amendement PLI DATÉ** pour le changement de format persisté ; le G0 le disait « committé AVANT le code b1a (c'est une spéc) ». Vérifié : `docs/PLI-lot-t1a-ii-b3d.md` ne contient **aucun** « Amendement de format du ledger » ; §6 (l.87) décrit encore l'entrée sans `page_events`, `candidates/<sig>.json` plat ; §7 (l.111) ne mentionne pas la disparition d'`events-`/`handoffs-` ni `require_full_pages`, `-attempt`, `set_authority_scan`, `retries_by_method`. Le code écrit un format que la spéc pré-enregistrée ne décrit pas.
- **CA-4** — conforme : un worker G1, un relecteur G2 séparé, un worker PLI ; fan-out justifié par l'indépendance (G2 a rejoué mon harnais base-rouge/HEAD-vert).
- **CA-5** — conforme (G0 §Risques MAST ; V-1 nommé mode dominant).
- **CA-6** — oracle d'exécution rejoué (§2) ET revue G2 : conforme sur `93446f8`/`f4ae59f`. **CORRECTION (C-V-2)** : le pli `f2f8808` modifie du **source** (`rebase-crosscheck.ts:566-567`, `!== true` + `existsSync`) dans une forme qui **dévie** de la prescription G2 (`=== false → !== true` nu) ; aucune instance séparée n'a relu ces lignes livrées (l'orchestrateur a rejoué un mutant ; le précédent -b3d-a n'exemptait qu'un pli **test-seul**). Ma lecture de la table 4 cas ne remplace pas une revue (déclaration 3).
- **CA-7** — clôture zéro dette : items A/B/C/D portent propriétaire + déclencheur ; **mais le déclencheur d'ITEM-A est faux** (voir §4, C-V-3). `Retry-After`, C-13, `--crosscheck-dir` : items maintenus, conformes.
- **CA-8** — modèles épinglés résolus dans chaque artefact (`claude-opus-4-8[1m]` ×3, G2 séparé) ; `error_origin` renseigné (V-1/2/3, plan `tx_count`, C-G2-1/2/3). **CORRECTION docs (C-V-4)** : pas de « JOURNAL de provenance » par étape pour b1a (convention du projet : PLI -b3d-a l.249, un modèle résolu par étape, commits orchestrateur, heures UTC réelles).
- **CA-9** — conforme : je re-exécute moi-même (base rouge / HEAD vert, suite, CI, 9 mutants, ITEM-A) ; indépendance imposée par le système (copies sous `F:\tmp\cp2-b3db1a\`). Réserve portée dans C-V-1 : le §5 du PLI affirme « `ledger_sha256` commet transitivement toutes les pages » — vrai pour l'**énumération** (core), **faux pour le payload qui pilote le verdict** tant qu'ITEM-A est ouvert ; et le **sens de comparaison C-B-4** (« dashboard ≤ recomputed, borné par `retries_by_method` ») n'est pas porté au §5.
- **CA-10** — conforme : aucun argument de vitesse ; lot 858 sous plafond ; seam déclaré non actionné sur mesure, pas sur affirmation.
- **CA-11 + durci** — conforme : chaque tuyau b1a de la table G0 l.300-307 a son test **exécutant `runMain` depuis les artefacts réels écrits par le code** (V-1 deux `runMain` ; monotone ; Σ ; finally ; C-G2-1 ledger tamperé sur disque ; C-G2-2 retry via le câblage CLI réel `collect.ts:610` → `:588` ; C-V-9 lit les `crosscheck-*.json` écrits). `set_authority_scan` (`:611`) : sortie sans consommateur = **upcoming** déclaré (ITEM-D, b2), aucun registre public ne le dit « built » — conforme. Tuyaux densité/H6 : b1b, déclarés.
- **Anti-close (+ bis)** — **n-a avec motif** : le lot ne touche aucune donnée de prix ; aucun brut de close sha-pinné n'entre dans son périmètre. Diff `apps/bell` : les littéraux décimaux/entiers ajoutés sont des multiplicateurs, slots et horodatages **synthétiques** (fixtures C-16, b58 de 0xaa/0xbb) ; diff docs : durées, numéros de ligne, préfixes sha. Aucune valeur citée dans cet avis. Secrets : `BELL_SOLANA_RPC` jamais imprimée (`collect.ts:285`) ; `apps/bell` hors whitelist d'export (G2 §8).

## 4. Réponses aux questions de l'orchestrateur

- **Option (d) `notFullPages` vs doctrine C-B-1** : **conforme**. C-B-1 offrait (i) « page qui lève un drapeau n'est PAS committée et sera re-tirée » ; (d) applique (i) à `notFullPages` sur le `data.length` **brut** (`:296`), avec garde de mode persistée. Ma prescription « dérivé du ledger » était fausse (tx_count post-dédoublonnage) — `error_origin` accepté. Une conséquence à écrire (docs) : si Helius rend **légitimement** des pages courtes non-finales, le tirage strict reste `inconclusive` (fail-closed, escalade) et `--allow-short-pages` devient le mode du tirage ⇒ la sonde §3 doit mesurer la plénitude sur `data.length` **brut** (même piège que `tx_count`).
- **ITEM-C `!== true` + `existsSync`** : **acceptable, écart déclaré correct**. Table des 4 cas exacte ; `!== true` nu casserait tout premier run strict (case 3) ; forme livrée juste sur les 4 ; M-G2-C tué chez moi avec `mode_guard` toujours vert. Réserve CA-6 (C-V-2) : relecture séparée des 2 lignes de source.
- **ITEM-A — licite de fusionner b1a ?** **Oui, fusion licite — mais le déclencheur « b2 » est REFUSÉ.** Motifs : (a) pas de régression — la base consommait déjà `events-<MINT>.jsonl` non haché à la reprise ; b1a est strictement meilleur ; (b) b2 est **post-tirage** alors que le trou vit **pendant** le tirage (reprise multi-jours, même `--out`, scellé par C-B-2 — reproduit §2) ; le remettre à b2 laisserait courir la course avec un verdict falsifiable sans casser la chaîne, contredisant la propriété « tamper-evident » revendiquée au §5 (CA-9). Déclencheur corrigé = **AVANT la course**, condition de GO **(f)** à côté de (a)-(e) ; porteur : lot b1b ou b1a-bis avec G0 + checkpoint-1. Critère d'acceptation formé : mon `itemA-head.test.ts` inversé — une reprise via `runMain` sur un `page_events` édité **refuse** (throw). Contrainte à écrire pour ce G0 (je ne conçois pas) : tout remède qui reste sur disque (re-décoder depuis `candidates/`, dont les sha sont eux-mêmes re-dérivés du disque) est défait par la même édition ; la propriété exigée est que le `headSha` (ancrable hors bande par l'orchestrateur page par page) **commette transitivement le payload**. Ce n'est pas une décision de valeur nouvelle ⇒ pas d'escalade ; l'investisseur le voit dans la liste GO de la course.
- **ITEM-B** (`onCandidate` `:277` avant la décision de faute) : item formé acceptable (aucun impact false-equal : `equal` exige un scan complet ; le raw est réécrit au re-tirage). **ITEM-D** : upcoming déclaré, une assertion de forme en b2. Conformes.
- **`error_origin`** : complet et cohérent (G2 §9, PLI, RENDU §8) ; ajouter pour C-V-1 : **orchestrateur** (amendement non porté au PLI avant le code) ; pour C-V-3 : **worker G1 + relecteur G2 + moi** (déclencheur b2 accepté sans croiser « b2 = post-tirage »).

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)

Fusion de b1a licite après C-V-1, C-V-2 et C-V-3 (docs + une relecture, R-25 = 0) ; course toujours SUSPENDUE (HELIUS-1, b1b, Amendement 3) **plus** condition (f).

1. **C-V-1 (bloquante avant G7 — docs, `docs/PLI-lot-t1a-ii-b3d.md`)** : porter l'« Amendement de format du ledger » du G0 l.215-227 au PLI (après §6 l.87, §7 l.111), **daté à la date réelle de rédaction** avec écart de séquence déclaré (« rédigé après le code, contrairement au G0 » ; `error_origin` orchestrateur), jamais rétrodaté ; §2 sha `7071484f…` intact avant/après. Contenu à corriger/compléter au portage : (i) la phrase G0 l.222 « `notFullPages` est DÉRIVÉ du ledger, JAMAIS une raison de non-écriture » contredit L-b1a-1 (G0 l.413-415) — la remplacer par l'option (d) (faute re-tirable sur `data.length` brut, `GTFA_PAGE_LIMIT`, non committée + STOP ; `--allow-short-pages` commet) et ajouter une ligne dans le G0 l.222 disant que cette phrase est supersédée par L-b1a-1 ; (ii) schéma `budget.json` complété de `require_full_pages` (absent du texte) ; (iii) sidecar `crosscheck-<MINT>-attempt.json` (C-B-2) ; (iv) champ d'artefact `set_authority_scan` (`:611`, upcoming) ; (v) `candidates/<MINT>/<sig>.json` en §6 (l.87 dit encore `<out>/candidates/<sig>.json`) ; (vi) §7 l.111 : `events-`/`handoffs-<MINT>.jsonl` disparus, `retries_by_method` ; (vii) §5 l.84 : sens de comparaison C-B-4 « dashboard ≤ recomputed, écart borné par `retries_by_method` » et caveat « `ledger_sha256` commet l'énumération (core), pas le payload qui pilote le verdict, jusqu'à la clôture d'ITEM-A » ; (viii) marquer résolus par l'enregistrement atomique les items PLI l.194 et l.243 (ordre d'append events/ledger).
2. **C-V-2 (bloquante avant G7 — revue)** : G2-delta par instance séparée, lecture seule, sur `git diff f4ae59f f2f8808 -- apps/bell/src` (`rebase-crosscheck.ts:566-567`, 2 lignes) ; à défaut, exemption **motivée par écrit dans le G7** citant le précédent -b3d-a (pli test-seul) et la différence (ici du source) — jamais silencieuse.
3. **C-V-3 (bloquante avant G7 — docs, `docs/CHANTIERS.md` §course + `docs/G0-lot-t1a-ii-b3d-b.md` l.233-238)** : ITEM-A re-déclenché : ajouter la condition de GO **(f)** « verdict à la reprise non falsifiable par édition de `page_events`/`page_handoffs` : test `runMain` refusant une reprise sur payload édité, vert » ; porteur b1b ou b1a-bis (G0 + checkpoint-1) ; supprimer « déclencheur b2 » dans RENDU §7(7)/G2 §6/PLI ; `error_origin` worker G1 + relecteur G2 + validateur checkpoint-2 (moi, si je l'avais laissé passer) ; contrainte de conception de §4 recopiée.
4. **C-V-4 (non bloquante, à plier avec C-V-1 — docs, `docs/PLI-lot-t1a-ii-b3d-b1a.md`)** : journal de provenance par étape (G1 `93446f8`, option (d) `f4ae59f`, G2 `eeeeaef`, pli `f2f8808`, ce checkpoint-2 ; un modèle résolu par étape ; heures UTC réelles `git log %aI` converties).
5. **C-V-5 (non bloquante — docs, protocole sonde §3 du PLI)** : la mesure de plénitude des pages à la sonde se fait sur `data.length` **brut** vs `GTFA_PAGE_LIMIT` (jamais `tx_count`), et le résultat décide du mode du tirage (strict vs `--allow-short-pages`) **avant** la première page du tirage (la garde de mode `:566` rend tout changement de mode en cours de tirage fail-closed).

Aucune ESCALADE-INVESTISSEUR due : aucune décision de valeur/périmètre nouvelle ; mon avis et le verdict G7 attendu ne divergent pas ; aucune dérogation demandée.

## 6. Preuve d'intégrité (AM-2 bis/ter)

sha256 des fichiers du dépôt **avant = après** mes rejeux : `rebase-crosscheck.ts` `482b93774bb475240e570a7bd51b734f5e8e1979f9702ccdfb3001844411beb2` ; `collect.ts` `3b849ae9e91454536480166b089a198723cffe71c282925cc1e312dbe28f86fc` ; `quorum.ts` `e42dfe60254b9998f92cdaf8751e2351bedf26808340414daed57091e20fcf64` ; `rebase-crosscheck.test.ts` `4248d3cf28b70502b631eedbaa48ca29de519b2264f43435a08f7a2fa09724f2` (= sha livrés du PLI). `git status --short` : 0 ligne ; HEAD `f2f8808` inchangé. Référence `F:\tmp\cp1-b3d-b\` intacte. Tout écrit vit sous `F:\tmp\cp2-b3db1a\{base,head,run,tmp,h1-*.ts,replay-*.test.ts,itemA-head.test.ts,mut.mjs}` ; reproductible : `node --test F:/tmp/cp2-b3db1a/replay-{base,head}.test.ts`, `node F:/tmp/cp2-b3db1a/mut.mjs <mutant…>`, `node --test F:/tmp/cp2-b3db1a/itemA-head.test.ts`.

## 7. AM-1 — ce que la checklist a attrapé / manqué

**Attrapé** : amendement de format du ledger jamais porté au PLI (C-B-7 non exécutée, §6/§7 décrivent un format que le code n'écrit plus) ; phrase G0 l.222 contradictoire avec L-b1a-1 ; déclencheur « b2 » d'ITEM-A incompatible avec un trou qui vit pendant le tirage ; source modifié au pli `f2f8808` sans relecture séparée ; §5 sans sens de comparaison C-B-4 ; journal de provenance absent. **Manqué par moi au checkpoint-1 (attribué par les artefacts)** : formule `notFullPages` sur `tx_count` prescrite sans croiser le dédoublonnage (RENDU §8) ; mutant C-B-5 prescrit sur `readJsonl` au lieu de la ceinture `verifyLedgerChain` au resume (G2 C-G2-1) ; et, en germe, la spéc « `entry_sha256` sur le SEUL core » (C-B-7, la mienne) qui laisse le payload hors chaîne — ITEM-A en descend.

**Modèle résolu (R-1) : `claude-fable-5-1`.**

##### message du validateur — 2026-09-21T06:49:51.992Z 

# RÉ-ACCEPTATION SUR PIÈCES (régime B, décision 116) — Bell -b3d-b1a, HEAD `a01cb4e`

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Lecture seule, aucun réseau, aucun git d'écriture ; code non relu (jugé au checkpoint-2 ci-dessus sur `f2f8808`).

## Vérifié sur pièces
- `a01cb4e` = docs seuls sur `f2f8808` : `git diff --stat f2f8808 HEAD` = 4 fichiers docs, **0 fichier sous `apps/`** ; `git status` 0 ligne.
- **§2 (H1..H6) byte-intact** : sha recomputé par moi à `f2f8808` ET à `a01cb4e` = `7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867` (identiques).
- **C-V-1 (i–viii)** — `docs/PLI-lot-t1a-ii-b3d.md:331-360` : conforme. Écart de séquence déclaré, daté à la date réelle, `error_origin` orchestrateur (l.337) ; (i) option (d) + note inline « SUPERSÉDÉE » posée dans le G0 l.222 (diff vérifié) ; (ii) schéma `budget.json` avec `require_full_pages`, `credits_recomputed` correctement placé dans l'artefact ; (iii) sidecar ; (iv) `set_authority_scan` UPCOMING ; (v) `candidates/<MINT>/` ; (vi) §7 sans `events-`/`handoffs-` ; (vii) sens `dashboard ≤ recomputed` borné par `retries_by_method` + caveat ITEM-A (énumération ≠ payload) ; (viii) l.194/l.243 marqués RÉSOLU inline ; registre item 5 harmonisé « RÉSOLU b1a » (l.326).
- **C-V-2** — `docs/G2-DELTA-lot-t1a-ii-b3d-b1a.md` : PASS par instance séparée `claude-opus-4-8[1m]`, 4 cas justes, mutant `!== true → === false` rouge, voisin `existsSync` retiré rouge (porteur), restauration byte-exacte ; statut porté PLI-b3d l.366-370 avec le trou de numérotation déclaré. Conforme (concorde avec mon propre mutant M-G2-C).
- **C-V-3** — PLI-b1a l.21 et l.69-77 + G0 l.239 condition **(f)** verbatim : « déclencheur b2 » retiré, porteur b1b/b1a-bis avec G0 + checkpoint-1, contrainte de conception (headSha commet transitivement le payload ; remède sur-disque exclu ; tension §6 à trancher au G0 du porteur, pas ici), `error_origin` incluant le validateur. Conforme.
- **C-V-4** — journal PLI-b1a l.79-92 : un modèle par étape, heures UTC réelles via `--date=format-local`, caveat R-1 honnête. Conforme.
- **C-V-5** — PLI-b3d l.362-364 : plénitude sur `data.length` brut, mode fixé AVANT la première page du tirage, cohérent H4/A-6. Conforme.

## Décision : **ACCEPTE** — fusion de -b3d-b1a licite au G7 ; course toujours SUSPENDUE ((a)–(e) HELIUS-1 + b1b + Amendement 3 + **(f)**).

Liste résiduelle fermée (docs, non bloquante pour la fusion, due au G7 — jamais un dû nu) :
1. **Persistance de mon avis** : le journal l.89 et l'item l.94 disent « avis NON PERSISTÉ, R-1 non vérifiable ». L'avis intégral checkpoint-2 (§1-7 de mon message précédent, `f2f8808`) et cette ré-acceptation (`a01cb4e`) sont à persister verbatim en `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md` (n'existe pas encore : 0 fichier) ; R-1 déclarée ici : **`claude-fable-5-1`** ⇒ l'item l.94 se ferme et la ligne l.89 gagne son horodatage (avis rendu 2026-09-21 ~06:10 UTC ; ré-acceptation ~06:50 UTC). Propriétaire orchestrateur.
2. **`docs/G2-lot-t1a-ii-b3d-b1a.md:66`** (rapport gelé du relecteur) porte encore « déclencheur b2/ADR-format » pour ITEM-G2-A : ne pas éditer le rapport ; une ligne « supersédé par PLI-b1a §C-V-3 / G0 (f) » suffit dans le G7 ou en tête du fichier, pour qu'aucun lecteur ne reprenne l'ancien déclencheur.

Aucune escalade investisseur : pas de décision de valeur nouvelle ; ma checklist et le G7 attendu concordent.

**AM-1** — attrapé à cette ré-acceptation : rien de nouveau (les 5 corrections sont pliées fidèlement, y compris la nuance `credits_recomputed` hors `budget.json` que je n'avais pas explicitée et que le rédacteur a corrigée de lui-même) ; résidu = ma propre trace non persistée par l'outillage (précédent `514ee1a`).

**Modèle résolu (R-1) : `claude-fable-5-1`.**
