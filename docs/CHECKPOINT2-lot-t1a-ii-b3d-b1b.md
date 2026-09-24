# CHECKPOINT-2 — Bell -b3d-b1b — avis du validateur-humain (verbatim, `claude-fable-5-1`, 2026-09-21, HEAD jugé `8646c62`)

# CHECKPOINT-2 (LIVRABLE) — sous-lot Bell T-1a-ii-b3d-b1b, HEAD `8646c62`

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Contexte frais ; G2 parallèle non lue. Artefacts : `docs/G0-lot-t1a-ii-b3d-b.md` l.158-182/184-208/295/298, `docs/PLI-lot-t1a-ii-b3d.md` §2 H6 + §3(c) l.60, `docs/G0-lot-t1a-ii-b3d-f.md`, `F:\tmp\b3db1b\RENDU-G1.md`, diff complet `d8d25e3..8646c62` (3 fichiers), `lint-ratchet.json`. Rejeu sous **`F:\tmp\cp2-b3db1b\`** : `git archive 8646c62` extrait (blobs HEAD) — sha des 3 fichiers extraits == worktree == RENDU (`e40a0b57…`, `1770b50c…`, `de1e624f…`) ; `git status` 0 ligne avant/après ; aucune écriture dépôt, aucun `npm install`, aucun réseau, `TEMP/TMP=F:/tmp/cp2-b3db1b/tmp`.

## Rejeux (mes mesures)
- Copie HEAD non mutée : fichier crosscheck **54/54**. **7 mutants tués**, restauration byte-exacte OK : M-b1b-10 (ledger écrit par la sonde) 53/1 ; M-b1b-11 (genesis = oracle−500) 53/1 ; M-b1b-12 (gate `--max-credits` sans `|| rebaseDensity`) 53/1 ; M-b1b-12b (global = compte du process, non cumulé) 53/1 ; M-b1b-12c (`priorByMethod` dé-gaté) 53/1 ; M-b1b-13 (`min`) 52/2 ; M-b1b-14 (densité max × span) 52/2.
- Oracle complet dans le worktree : **`npm run ci` 602/602, CI_EXIT=0** (gate:vocab 188 OK, tsc OK) ; **`npm run lint` EXIT 0** ; **`lint:ratchet` 69/69 EXIT 0** (plafond 69 inchangé, `measured_on 2026-09-16`).
- R-25 : `git diff --shortstat d8d25e3 HEAD` pathspec `ci.yml:65` ⇒ `3 files changed, 268 insertions(+), 11 deletions(-)` ⇒ **279 ≤ 1 205**.
- (e) écart chiffré, fixture [densités 1,2,3,4,3,2,1,0,5 ; pas 100 ; span de page 10] : lecture retenue ⇒ N = **1 575** ; formule littérale de l'Amendement 3(4) `d_j = tx_j/(slot_{j+1}−slot_j)` ⇒ N = **157,5** (d_7 indéfini, pris = tx_7/pas) ; **ratio 10 = pas de grille / span de page**. Sur le réel (segment ≈ span/7 ≫ span d'une page de 1 000 tx) la formule littérale sous-projette de plusieurs ordres de grandeur.

## Checklist
- **CA-1** conforme (L-b1b-1/2 : phrase, test nommé, mutant par livrable). **CA-2** conforme (aucune décision de valeur ; lecture de densité = résolution technique, voir C-V-2). **CA-3** : Amendement 3 encore dans le G0, à committer SEUL après b1b — voir C-V-2 (à corriger AVANT ce commit). **CA-4/5** conformes. **CA-6** : oracle rejoué par moi ; G2 séparée en cours (régime B) — l'acceptation reste conditionnée à son PASS. **CA-7** : items déclarés (§7.4 by_mint/fencepost/erreurs sonde) avec porteur ; voir C-V-3. **CA-8** : R-1 `claude-opus-4-8[1m]`, `error_origin` G7 b1a proposé pour (i) — accepté (les fusions locales `--no-ff` ne passent pas g4 ; correctifs = 1 cast retiré + 1 type nommé, sans `any`, plafond intact : sûrs, déclarés). **CA-9** conforme (indépendance imposée : copie hors worktree, 7 mutants, oracle complet). **CA-10** conforme (aucun ré-étalonnage du ratchet). **Anti-close** n-a avec motif (mints/slots/compteurs synthétiques ; aucune constante on-chain ; aucune valeur citée ici).
- **CA-11 durci — CORRECTION BLOQUANTE (C-V-1)** : le RENDU §3 (ligne 4) déclare le tuyau « sonde `points[]` → projection H6 » **câblé, rejeu bout-en-bout, « assertion finale » de `bell_density_projects_N_with_interval`**. **Faux sur pièces** : `grep projectPagesAtFraction(` dans le test ne rend que les lignes 1111-1127 (modèles construits à la main) ; aucun test ne lit `sonde-report.json.points[]` pour l'injecter dans `projectPagesAtFraction`. Un test qui construit l'entrée à la main ne prouve pas le branchement (CA-11 durci). R-21 : assertion annoncée et absente.

## Réponses (a)–(k)
(a) prouvé (M-b1b-10 tué ; `existsSync` faux pour ledger et crosscheck via `runMain`). (b) prouvé (M-b1b-11). (c) prouvé cumulatif (prior 4 + 2×9 = 22 ; M-b1b-12b et 12c tués). (d) gates : `collect.ts:443` `--max-credits`, `:592/:595` reprise, `--max-pages` non gaté (contrôle `parsed.maxCredits` vert) — conforme au fait 11 ; la 3ᵉ ligne (`priorByMethod`) est une nécessité prouvée, pas un ajout. (e) **lecture licite mais DÉVIATION DU TEXTE DU PLAN** : le G0 Amendement 3(4) écrit `tx_j/(slot_{j+1}−slot_j)` ; le code fait `tx_j/(lastSlot_j−firstSlot_j)` de la page. Ce n'est **pas** un D-n (l'Amendement 3 n'est pas encore un pré-enregistrement en vigueur : §2 H6 ne fixe que `max(linéaire, densité)` ; le texte (4) doit être committé SEUL après b1b) ⇒ **correction du texte avant son commit** (C-V-2). La formule littérale est indéfinie en j = K−1 et sous-projette d'un facteur pas/span-de-page ; la lecture retenue est la seule cohérente avec PLI §3(c) « tx/slot local ». `error_origin` : **rédacteur du pli G0 + validateur checkpoint-1** (C-B-8(c) : j'ai exigé « pré-enregistrer ENTIÈREMENT » sans vérifier la formule). (f) prouvé (throw sur span ≤ 0, fraction ≤ 0, < 2 points, non triés ; M-b1b-13/14 tués). (g) **NON prouvé** — C-V-1. (h) 9 appels/mint via `budgeted.call` (stub gTfA-only jette sur toute autre méthode) ⇒ ≤ 36 ; conforme. (i) acceptées. (j) 602/602, 0, 69/69 — reproduits. (k) 279 — reproduit.

## Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée ; C-V-1/C-V-2 bloquantes avant G7 ; acceptation conditionnée au PASS de la G2 séparée)
1. **C-V-1 (bloquante, test — `apps/bell/test/rebase-crosscheck.test.ts`, section b1b)** : exécuter le tuyau depuis l'artefact réel : lire `sonde-report.json` écrit par `runMain --rebase-density`, passer `report.<MINT>.points` (forme émise, `{slot, tx, span, density}`) à `projectPagesAtFraction(slotHi, genesis_slot, oracle_slot, 0, points)` et asserter `== n_projected / GTFA_PAGE_LIMIT` (1,575 sur la fixture) ; mutant « `points[]` émis sous une autre clé/forme » ⇒ rouge. Corriger le RENDU §3 ligne 4 (« assertion finale » n'existe pas). `error_origin` : worker G1.
2. **C-V-2 (bloquante, docs — texte de l'Amendement 3(4), G0 l.203, AVANT son commit solo)** : réécrire `d_j = tx_j / (lastSlot_j − firstSlot_j)` de la page tirée au nœud j (`limit:1000 slot.gte = slot_j`), page dégénérée (0/1 tx, même slot) ⇒ `d_j = 0` ; nœuds `slot_j = round(genesis + j·(oracle−genesis)/(K−1))`, j = 0..7, dernier nœud = `oracle_slot` avec `gte` seul (fencepost déclaré : densité au/après l'oracle) ; conversion pages = N/`GTFA_PAGE_LIMIT` ; **rejeter explicitement la formule de grille** avec l'écart chiffré (facteur pas/span-de-page ; 1 575 vs 157,5 sur la fixture). `error_origin` : pli G0 + validateur checkpoint-1.
3. **C-V-3 (non bloquante — au pli ou item formé, porteur worker)** : `runDensityProbeCli` n'a pas de `finally` par mint (§7.4) ⇒ tranche `by_mint` perdue sur `BudgetExceededError` en cours de mint ; aligner sur `runRebaseCrosscheckCli:618` (≈ 3 lignes) ou item formé avec déclencheur « avant la sonde ».
4. **C-V-4 (non bloquante, docs)** : la course reste SUSPENDUE ; L-b1b-1/2 restent **upcoming** dans tout registre public (consommateur servi = orchestrateur hors process, course non lancée) — déjà écrit au RENDU §3, à reporter au G7.

Aucune escalade due. **AM-1** — attrapé : tuyau sonde→projection annoncé et non exécuté ; formule de densité du plan fausse (la mienne à valider en checkpoint-1). Manqué antérieur assumé : C-B-8(c).

**Modèle résolu (R-1) : `claude-fable-5-1`.**


---

# RÉ-ACCEPTATION SUR PIÈCES — Bell -b3d-b1b, HEAD `8c82535` : **NON ACCORDÉE, liste résiduelle fermée**

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Lecture seule, aucun réseau, aucune écriture dépôt (`git status` 0 ligne avant/après).

Le commit `8c82535` ne contient pas le pli qu'il annonce. C-V-1 et C-V-3 ne sont pas dans son arbre, donc je n'ai rien rejoué : ni le test C-V-1, ni M-b1b-15/16, ni l'oracle complet.

## Constat sur pièces
- `git diff --stat 8646c62 8c82535` ne liste qu'**un fichier** : `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1b.md` (+28). Aucun fichier sous `apps/` n'est touché.
- Les blobs à `8c82535` sont byte-identiques à `8646c62` : `rebase-crosscheck.ts` `e40a0b57…` et `rebase-crosscheck.test.ts` `de1e624f…`. `git grep` de `bell_density_report_points_feed_projection` et de `bell_density_by_mint_survives_budget_exhaustion` sur HEAD ne rend **aucune occurrence**.
- Ni l'arbre de travail ni les autres refs récentes ne les contiennent ; aucun stash.
- R-25 mesuré avec le pathspec `ci.yml:65`, base `d8d25e3` : **279** et non 315. L'arbre est inchangé. Le message de commit annonce « 604/604, 9/9 mutants, R-25 315 » : ces chiffres sont **faux pour le commit** qui les porte.
- Le pli existe, mais **hors dépôt** : `F:\tmp\b3db1b\delivered\` porte `rebase-crosscheck.test.ts` `44aad27a…` (qui contient les deux tests) et `rebase-crosscheck.ts` `15018848…` (`finally` par mint l.739). `gate-battery.out` y indique 604/604 et ratchet 69/69.
- C'est le même mode d'échec que la première perte reconnue par le worker (restauration de snapshot). Il est ici doublé d'un commit orchestrateur dont le message n'a pas été confronté au `--stat`.
- Je n'ai pas rejoué le snapshot scratch. Ma preuve d'intégrité porte sur les blobs HEAD (AM-2) ; accepter des fichiers hors arbre serait accepter un livrable que le dépôt ne porte pas.

## C-V-2 — texte vérifié : CONFORME
`lot/etude-suite` `f4b0d9c`, `docs/G0-lot-t1a-ii-b3d-b.md:203`. Le texte porte :
- `d_j = tx_j/(lastSlot_j − firstSlot_j)` de la page au nœud j ; page dégénérée ⇒ 0 ;
- K=8 nœuds `round(genesis + j·(oracle−genesis)/(K−1))` ; dernier nœud = `oracle_slot`, `gte` seul, fencepost déclaré ;
- pages = N/`GTFA_PAGE_LIMIT` ;
- formule de grille **rejetée** avec l'écart 1 575 vs 157,5 ;
- trapèze, enveloppe min/max et rejet « max × span » conservés ;
- `error_origin` = pli G0 + validateur checkpoint-1 ;
- corrigé **avant** le commit solo de l'Amendement 3.

C-V-2 est fermée.

## Liste résiduelle fermée (bloquante avant toute ré-acceptation)
1. **R-1 — committer réellement le pli.** Écrire dans le worktree les fichiers du pli C-V-1/C-V-3 : `rebase-crosscheck.ts` et `rebase-crosscheck.test.ts` ; `collect.ts` est inchangé (`1770b50c…`). Committer, puis vérifier `git show --stat <sha>` **avant** de me renvoyer le sha. L'arbre committé doit porter les deux tests et le `finally` par mint. Le message doit dire que `8c82535` ne contenait que le doc (erratum, R-21).
2. **R-2 — ré-acceptation sur le nouveau HEAD.** Je rejouerai sur blobs HEAD : le test C-V-1, M-b1b-15 (clé `samples`), M-b1b-16, l'oracle `ci && lint && lint:ratchet`, et R-25 (attendu ≈ 315 ; à mesurer, pas à reprendre du message).
3. **R-3 — `error_origin` à consigner au G7.** Commit au message non vérifié contre son contenu = **orchestrateur**. Pli resté en scratch après restauration de snapshot = **worker**. Seconde occurrence de ce mode d'échec : prescrire au worker, en fin de mission, un `sha256sum` du worktree comparé au snapshot livré.
4. **R-4 — G2 séparée.** Elle juge `8646c62`. Le futur commit de pli modifiera du **source** (`finally` par mint), donc il faut un G2-delta sur ce diff ou une exemption motivée par écrit au G7 (même règle que C-V-2 de b1a).
5. **C-V-4** (registre `upcoming`, course SUSPENDUE) : inchangée, au G7.

Aucune escalade due : c'est un défaut d'exécution, pas une décision de valeur.

**AM-1** — attrapé : commit docs-seul présenté comme pli de code, R-25 annoncé 315 mais mesuré 279, tests annoncés absents de l'arbre. La checklist fermée « blobs HEAD d'abord » l'a vu avant tout rejeu.

**Modèle résolu (R-1) : `claude-fable-5-1`.**

---

# RÉ-ACCEPTATION SUR PIÈCES — Bell -b3d-b1b, HEAD `06795cc` : **ACCEPTE** (conditionnée au PASS de la G2 séparée et de son G2-delta `8646c62..06795cc`)

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Le rejeu s'est fait sous `F:\tmp\cp2-b3db1b\head2\` à partir de `git archive 06795cc` (blobs HEAD). Aucune écriture dépôt, aucun réseau, aucun `npm install`. `git status` rend 0 ligne avant et après.

## Vérifié sur pièces
- **R-1 tenue.** `git show --stat 06795cc` liste `rebase-crosscheck.ts` et `rebase-crosscheck.test.ts` (53 ins / 17 del).
  - Les blobs HEAD valent `15018848…` (src), `44aad27a…` (test) et `1770b50c…` (`collect.ts`, inchangé). Ce sont les sha du snapshot livré et ceux de ma copie extraite.
  - Les deux tests sont dans l'arbre (`git grep` sur HEAD : 2 occurrences).
  - Le message de commit porte l'erratum R-21 sur `8c82535`.
- **C-V-1.** `bell_density_report_points_feed_projection` exécute `runMain --rebase-density` et lit le `sonde-report.json` **écrit par le CLI**.
  - Il passe `report.SPYx.points` (forme émise `{slot,tx,span,density}`) à `projectPagesAtFraction(450, genesis_slot, oracle_slot, 0, points)`.
  - Il asserte `== n_projected / GTFA_PAGE_LIMIT` et `== 1.575`. La composition part donc de l'artefact réel (CA-11 durci), jamais d'un modèle construit à la main.
  - Mon mutant **M-b1b-15** (clé `points` → `samples` dans le rapport) donne 54/2, **TUÉ**. Il rougit le test du tuyau et aussi `projects_N_with_interval`, qui asserte `points.length`.
- **C-V-3.** Le `finally` par mint couvre les deux `continue` (pas de genesis, span dégénéré) et le throw budgétaire en cours de points. `global` et `calls_used` restent exacts par la couche budgétée.
  - Mon mutant **M-b1b-16** (`setSlice`/`writeBudget` du `finally` conditionnés au succès du mint) donne 55/1, **TUÉ** par `bell_density_by_mint_survives_budget_exhaustion`. Celui-ci vérifie `by_mint.SPYx.getTransactionsForAddress == 3` après un stop à `--max-calls 3`.
- **Non-régression.** Le fichier crosscheck passe **56/56** sur la copie. M-b1b-14 rejoué donne 53/3, **TUÉ** ; il rougit désormais aussi le test du tuyau. Restaurations byte-exactes OK.
- **Oracle complet dans le worktree.** `npm run ci` : **604/604**, CI_EXIT=0 (gate:vocab 188 OK, tsc OK). `npm run lint` : EXIT 0. `lint:ratchet` : **69/69**, EXIT 0, plafond inchangé.
- **R-25.** Pathspec `ci.yml:65`, base `d8d25e3` : `3 files changed, 304 insertions(+), 11 deletions(-)`, soit **315 ≤ 1 205**. C'est concordant avec ta mesure.
- **C-V-2.** Déjà vérifiée conforme sur `lot/etude-suite` `f4b0d9c` (avis précédent).
- **Anti-close.** Sans objet : le lot ne touche aucune donnée de prix et les fixtures sont synthétiques. Aucune valeur n'est citée ici.

## Liste résiduelle (rien de bloquant pour l'acceptation ; tout est dû au G7)
1. **Condition de régime B.** Il faut le PASS de la G2 séparée sur `8646c62` **et** celui de son G2-delta sur le diff source `8646c62..06795cc` (`finally` par mint, `rebase-crosscheck.ts`). Si la G2 rend un défaut, mon acceptation tombe pour le périmètre touché et je rejoue.
2. **R-3 (`error_origin`), à consigner au G7.** Orchestrateur : commit `8c82535` au message non confronté à son `--stat`. Worker : pli resté en scratch après une restauration de snapshot, seconde occurrence.
   - Prescription de fin de mission pour le worker : comparer le `sha256sum` du worktree au snapshot livré.
   - Prescription symétrique pour l'orchestrateur : lancer `git show --stat` avant tout envoi en acceptation.
3. **C-V-4.** L-b1b-1/2 restent **`upcoming`** dans tout registre public. La course reste SUSPENDUE : (a)–(e) HELIUS-1, (f) lot -f, Amendement 3 committé seul. Le consommateur servi, c'est-à-dire l'orchestrateur hors process, n'existe pas avant la sonde.
4. **Persistance.** Compléter `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1b.md` avec mes deux ré-acceptations : le refus sur `8c82535`, puis cette acceptation sur `06795cc`, verbatim.

Aucune escalade n'est due.

**AM-1.** À ce tour, je n'ai rien trouvé de nouveau : le pli est fidèle, les mutants du worker sont reproduits par des mutants que j'ai écrits moi-même. Au tour précédent, la vérification « blobs HEAD d'abord » a arrêté un commit vide de code avant tout rejeu. Je propose de la garder comme première ligne de chaque checkpoint-2 sur pièces.

**Modèle résolu (R-1) : `claude-fable-5-1`.**
