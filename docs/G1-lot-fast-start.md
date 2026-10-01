claude-opus-5-5

# G1 — lot FAST-START (partie 2 de la page : mise en service accélérée) — 2026-10-01

Implémenteur G1, instance fraîche, palier `claude-opus-5-5`, effort `max`. Mission scellée `F:/tmp/dojo/mission-fast-start.md`
(sha256 `fab30a68822945365d36289de805fd40f80183cf43afae258328f504c468e6f0`, recalculé à 11:26 UTC avant lecture). Worktree
`F:/Monark-wt-fast`, branche `lot/fast-start`, base `894037968db4a38a64f21a51c6261b7b69ffb998` (arbre propre à 11:26:50 UTC).
Aucun git écrivant (un écart déclaré, Q-11 : un rafraîchissement d index), aucun `GIT_DIR`, aucun `--write-tree`, aucun réseau, rien sur C:.

## 1. Lecture (avant tout code, 11:39:09 UTC)

| Entrée | Lignes | sha256 |
|---|---|---|
| `F:/Monark/docs/ETAT.md` (tronc `c05f7e04`) | 158 | `5096235aded910596b8f04369ff940ae01c803e2627f4d79da719dea242dbcfa` |
| `apps/dojo/src/history-collect.ts` | 453 | `53445d2d5558916ea25a30128e14580033a195da98d517e2b4e2a6407763c17f` |
| `apps/dojo/src/history-build.ts` | 256 | `e42db6a812c4b44dd0e818f036f72465c8b301af0974a20b9916ed6527bb46e4` |
| `apps/dojo/src/layout.ts` | 97 | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` |
| `apps/dojo/scripts/dojo-publish.mjs` (`readHistory`, `evePile`) | 542 | `516ce36505bd2d9f21d3e71d0d060a2324a74ef074e58d65f4b650b68d3a914f` |
| `docs/RUNBOOK-dojo.md` (sections 1 à 7, 10, 16 à 18) | 870 | `7949b10716fe07b1c05cd7afb9c23f8f8710a9aecca6c02cd9f826f573aa5a4c` |
| `apps/dojo/test/dojo-history-collect.test.ts` | 505 | `af68a5b601ff631c81e0382b63592a851f268ff0798be7d81539c12b2706e6e5` |
| `apps/dojo/test/dojo-history-build.test.ts` | 381 | `6e3584c5720141ea64669420895a6812adba9adbb73710f67d98fa3d4e5f693c` |
| `apps/dojo/test/helpers/history-chain.ts` | 141 | `4a88317d3e07f0913b4038741c1b1bbc20502282507e2a04b753529a7a15d39f` |
| `test/dojo-history-e2e.test.ts` | 112 | `2e34ef6206e0963f4a97fae7a215225a836bc07897eb079a5b7aabb2e2a3b49b` |
| `test/dojo-collect-deploy.test.ts` (`dojo_collect_tree_is_the_import_closure`) | 368 | `1d009900af9ce43a467af19833b859d2b9537e20506e672baede17f0f137e4b7` |
| `test/dojo-publish-deploy.test.ts` (épingles du mode d emploi) | 462 | `97b2a681e115fcd678b03c435e67c03efd75dddfd52b777d047dcf1d8297af1b` |
| `test/dojo-entry-link.test.ts` | 62 | `2d3bb84e78eb0eb509ef7d5baa1054d609a3340380f6d6e6fbda2cd9d9e217cf` |
| `scripts/dojo-deploy.mjs` (`DOJO_COLLECT_TREE_PATHS`, `DOJO_PUBLISH_TREE_PATHS`) | 62 | `fb3047c0f72f086cf07fbbf7694100bad43cd63d5ce14adbacefe46a03daa2e9` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller`) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` (= mission) |
| `F:/Monark/scripts/oracle/run.mjs`, `r25.mjs` | — | `f22b9045…cb2a41b`, `4d0544df…827cf0` (= mission) |

Constats de lecture qui fixent le plan (chacun rejouable par `grep -n` sur les fichiers ci-dessus) :
- L1. `history-collect.ts` et `history-build.ts` ne sont ni dans `DOJO_COLLECT_TREE_PATHS` ni dans `DOJO_PUBLISH_TREE_PATHS`
  (`scripts/dojo-deploy.mjs` l.13-19 et l.50-52) : les changer ne touche aucun arbre de l hôte. `layout.ts` (`readEve`) est dans
  les deux arbres : inchangé.
- L2. `readHistory` de l éditeur (`dojo-publish.mjs` l.351-368) exige `publish/SHA256SUMS` (manquant : `history_bundle_malformed`).
  Une course qui n écrit jamais `publish/` ne peut donc jamais être lue par `--history`.
- L3. `buildHistory` ne tire des relevés du premier jour lu que trois choses : le jour (D_LAST = jour - 1), les énumérations
  (contrôle (ii), fenêtres) et S_CUT = max E_e. Le mode provisoire les remplace par P, aucune énumération et `--cut`.
- L4. Une Eve imprécise ne peut produire qu un refus : une adresse en trop lit « 0 » sans ligne (`reading.ts` l.126-135) ; une
  adresse détentrice manquante est refusée par `evePile` (`dojo-publish.mjs` l.496-500, `eve_mismatch`), jamais une ligne fausse.
- L5. Neuf tueurs sont ancrés sur des lignes de `history-collect.ts` (l.128, 156, 213, 238, 328, 333, 433, 452 deux fois) et
  quatre sur des lignes du mode d emploi (l.440, 633, 750, 793) : ils sont réancrés après les modifications.
- L6. `dojo_runbook_counts_only_after_the_block` épingle l ANCIEN ordre (preuve Bitcoin avant A-9) ; il devient rouge par décision et
  est réécrit, renommé, sur le nouvel ordre. Restent épinglés et donc gardés à l octet : la commande `dojo-eve.mjs` de la section 6,
  deux occurrences de `install -d -o dojo-collect -g dojo-handoff -m 2750 .../bundles` (A-2 et A-9), le bloc `systemd-run` de 18 (iv),
  l ordre « contrôle hors ligne < STOP < stamp » dans la section 16, la numérotation des sections.

## 2. Plan (écrit avant tout code)

**P1 — `history-build.ts`.** Le corps de `buildHistory` devient une fonction interne partagée, paramétrée par (jour lu, énumérations,
S_CUT) ; `buildHistory` garde son comportement à l octet (mêmes entrées, mêmes sorties). Nouvel export `provisionalEve({txs, noQuorum,
day, cut})` : jour P, aucune énumération, S_CUT = `cut`, D_LAST = P - 1 ; il ne rend QUE l `Eve` (jamais un `HistoryBuild`) : aucun
paquet, donc aucun manifeste, ne peut naître d une course provisoire, même par erreur de code. « La chaîne a des détenteurs » = au soir
de D_LAST, un propriétaire au moins a un solde reconstruit > 0 ; une Eve vide dans ce cas est refusée par un arrêt nommé neuf,
`eve_empty`, ajouté à `DOJO_HISTORY_BUILD_STOPS` (disjoint des 45 codes du vérificateur et des refus de l éditeur : mesuré à 11:4x
UTC) ; `DojoHistoryBuildStop` reçoit son code en paramètre (défaut `enumeration_mismatch`, inchangé pour l existant).

**P2 — `history-collect.ts`.** Option fermée `--provisional-day <AAAA-MM-JJ>` : exactement une de `--first-read` et
`--provisional-day` (les deux ou aucune : `usage`) ; jour malformé, ou antérieur au 2026-09-11 (D_LAST avant le jour 1) : `usage` ;
jour futur à l horloge injectée : refus neuf `provisional_day_future` (avant tout verrou, rien d écrit) ; `--cut` absent ou non entier :
`usage` (règle existante de l argv). En mode provisoire, le contrôle `--cut` = max E_e est sans objet (aucun relevé) : S_CUT = `--cut`,
écrit à la première ligne du journal `{mint, mint_sha256, cut, collector_sha256, provisional_day, d_last}` (rejeu : mêmes entrées, sinon
`inputs_mismatch` ; un état normal et un état provisoire ne se reprennent jamais l un l autre). Phases A, B, C inchangées ; à la fin de
C, sans arrêt : l évidence de la course, puis `provisional/eve.json` (octets `canonical(eve)` + LF, ceux que `readEve` accepte), puis
`status.json` = `{"status":"provisional","stop_reason":null}`. Jamais `publish/`. `phase_order` refuse aussi un état dont
`provisional/eve.json` existe. Sortie de `main` : `dojo/history-collect: provisional`, code 0.

**P3 — tests neufs** (`apps/dojo/test/dojo-history-provisional.test.ts`), chacun avec sa ligne `// killer:`, rouges à la base par
assertion : (a) les refus (jour malformé, futur, `--cut` absent ou non entier, deux options ou aucune) : refus nommé, aucun appel,
aucun verrou, rien sous `--state` ; (b) la course provisoire complète par la CLI (A, B, C) sur un monde à plusieurs jours : l Eve est
celle de l oracle recodé ici depuis la vérité de la chaîne, acceptée par `readEve`, l arbre de l état ne contient que `evidence/**` et
`provisional/eve.json` (aucun `publish/`, aucun `SHA256SUMS` hors `evidence/runs/`, aucun manifeste), la première ligne du journal épingle
P, D_LAST et `--cut`, le rejeu est refusé `phase_order` ; puis l éditeur réel `--history` sur cet état est refusé
`history_bundle_malformed`, sa chronologie inchangée à l octet ; (c) Eve vide alors que la chaîne a des détenteurs (P = 2026-09-11 : le
jour de création n a aucune ligne, le propriétaire de la courbe détient) : `eve_empty`, partiel, aucun `provisional/eve.json` ; (d) le
mode d emploi : plus de jour de répétition ni d attente du bloc Bitcoin sur le chemin réel.

**P4 — mode d emploi.** Sections 6, 7, 16 et 18 selon les décisions ; en plus, par nécessité (Review Focus), l en-tête (« Before A-9 »),
l ordre de la section 10 et les bloqueurs de la section 17, qui gardaient la répétition ou le bloc sur le chemin réel (écart déclaré).
Numérotation, commandes épinglées et bloc `systemd-run` de 18 (iv) gardés à l octet (L6).

**P5 — réancrage** des treize tueurs de L5 par recherche du texte `before` sur sa nouvelle ligne (une occurrence exacte).

## 3. Compte ascendant par fichier (estimation avant code ; insertions + suppressions, assiette R-25 hors `docs/**/*.md`)

| Fichier | Estimé | Mesuré au gel (`git diff --numstat`) | Nature |
|---|---|---|---|
| `test/dojo-history-e2e.test.ts` | 2 | 1 + 1 = 2 | 1 tueur réancré |
| `test/dojo-entry-link.test.ts` | 4 | 2 + 2 = 4 | 2 tueurs réancrés |
| `apps/dojo/test/dojo-history-collect.test.ts` | 12 | 6 + 6 = 12 | 6 tueurs réancrés |
| `apps/dojo/src/history-build.ts` | 25 | 27 + 10 = 37 | P1 |
| `test/dojo-publish-deploy.test.ts` | 45 | 22 + 15 = 37 | L6 : un test réécrit, 3 tueurs réancrés |
| `apps/dojo/src/history-collect.ts` | 55 | 45 + 22 = 67 | P2 |
| `apps/dojo/test/dojo-history-provisional.test.ts` (neuf) | 170 | 158 + 0 = 158 | P3 |
| **Total** | **≈ 313** | **261 + 56 = 317** | borne 1 150 (mission) ; porte CI 1 205 |

`docs/RUNBOOK-dojo.md` et ce journal sont hors assiette (`ci.yml` l.82, `:(exclude,glob)docs/**/*.md`).

## 4. Tuyaux (règle Branchement)

- **Entrée** : l opérateur, sur sa machine, `history-collect.ts --provisional-day J --cut <créneau finalisé du jour J>` (A-11 (i)).
- **Sortie** : `<état>/provisional/eve.json` → copie par l acte A-11 (i) dans `bundles/<J+1>/eve.json` de l hôte → lue par
  `collect.ts` (`readEve`, `layout.ts`) au premier jour ouvert. Jamais lue par l éditeur (`--history` ne lit que `publish/`).
- **État** : le `--state` neuf de la course provisoire, sur la machine de l opérateur (jamais sur l hôte).
- **Test qui prouve la composition** : P3 (b), course réelle par la CLI → `readEve` → refus de `--history` de l éditeur réel.

## 5. Réalisation (décision → fichier → test)

- **D1, option fermée.** `--provisional-day` exclusive de `--first-read` ; D_LAST = P - 1 ; S_CUT = `--cut`, écrit à la première ligne du
  journal ; refus nommés, rien d écrit (jour malformé ou avant le 2026-09-11 : `usage` ; P futur : `provisional_day_future` ; `--cut`
  absent ou non entier : `usage`). Fichier : `apps/dojo/src/history-collect.ts` (`parseArgv`, `setup`, `openJournal`), sha256 au gel
  `c8e80c88de1ab0bd601c9225994ccb334a36bfb47e5ba364621582e826335fac`. Test : `dojo_history_provisional_refusals_write_nothing`,
  tueur `history-collect.ts:160`.
- **D2, structurellement non engageable.** Jamais `publish/` ; l Eve seule dans `provisional/eve.json`, aux octets que `readEve` accepte ;
  statut `provisional` ; un état provisoire fini refuse tout rejeu (`phase_order`) ; `--history` de l éditeur réel ne le lit pas.
  Fichiers : `history-collect.ts` (`runHistoryCollect`) et `apps/dojo/src/history-build.ts` (`provisionalEve` ne rend qu une `Eve`,
  jamais un `HistoryBuild`), sha256 au gel `597bba2ad70976ea166229a76aabca177629be7dc5e82dbb85a6c0d71943a96c`. Test :
  `dojo_history_provisional_course_writes_the_eve_alone`, tueur `history-collect.ts:449`.
- **D3, Eve jamais vide sur une chaîne détenue.** Arrêt `eve_empty`, statut partiel, aucune Eve. Fichier : `history-build.ts` (`rebuild` :
  `held` au soir de D_LAST ; `DOJO_HISTORY_BUILD_STOPS`). Test : `dojo_history_provisional_eve_is_never_empty_on_a_held_chain`, tueur
  `history-build.ts:97`.
- **D4, mode d emploi.** A-7 hors du chemin réel ; départ unique de A-5 gardé ; A-9 et A-11 réécrits (jour J, P = J, Eve à
  `bundles/<J+1>/eve.json`, d lu sur le plan de J + 1) ; A-8 sans attente du bloc, horodatage après la première publication ; chaque
  STOP gardé. Fichier : `docs/RUNBOOK-dojo.md`, sha256 au gel `8fefc99b36522061a5d18468085d9d3492ca54b993d28dabb64a3c5d9aabb464`. Test :
  `dojo_runbook_counts_without_rehearsal_and_stamps_after_the_first_publication` (réécrit et renommé depuis
  `dojo_runbook_counts_only_after_the_block`, qui épinglait l ancien ordre), tueur `RUNBOOK-dojo.md:608`.
- **D5, arbres de l hôte inchangés.** Aucun fichier de `DOJO_COLLECT_TREE_PATHS` ni de `DOJO_PUBLISH_TREE_PATHS` au diff ; tests
  `dojo_collect_tree_is_the_import_closure` et `dojo_publish_tree_is_the_import_closure` verts.

Tueurs réancrés (texte `before` relu sur sa nouvelle ligne, une occurrence exacte ; script `F:/tmp/dojo/fast/tmp/tools/killers.mjs`,
qui appelle `parseKiller` de `F:/Monark/scripts/red-proof.mjs` : 32 tueurs des fichiers de test touchés, 0 défaut) :
`history-collect.ts` 128→135, 156→166, 213→226, 238→251, 328→341, 333→346, 433→456, 452→475 (deux) ; `RUNBOOK-dojo.md`
440→453, 750→814, 793→857 ; le tueur 633 disparaît avec l ancien test (remplacé par 608, ci-dessus).

Écarts déclarés au mode d emploi (au-delà des sections 6, 7, 16, 18, nécessaires au Review Focus) : en-tête (A-7 et « Before A-9 »),
section 5 (la minuterie à A-9 (7), l échantillon de tâches sur d), section 10 (ordre), section 12 (une phrase), section 17 (bloqueurs),
« Never » (deux phrases et l Eve de 18 (i)). Ajouts dans 18 (i), au-delà des décisions, issus de Q-1 (d) et de Q-9 (section 6) : la
phase A jetable qui lit `--cut` par le garde, et la reprise de la phase C sur `method_cap` ; tous deux à confirmer par l orchestrateur.
Deux lignes réécrites portent l adresse déjà publiée de l hôte (section 5, retour arrière
désormais sur sa propre ligne ; 18 (i), chemin de l Eve) : aucune adresse nouvelle (`git diff` : 2 lignes `+` et 2 lignes `-` la
portent). Une ligne ajoutée dépasse 160 caractères : la commande de retour arrière de la section 5, texte d origine inchangé, séparée
de la prose modifiée (convention « une commande par ligne » des sections 1 à 9).

## 6. Questions et items formés (Q-n), chacun avec sa conséquence bornée et son déclencheur

- **Q-1 (source du créneau finalisé de `--cut`, à confirmer avant A-11 (i)).** Aucun outil ne lit `getSlot` : la liste fermée de la
  course (`DOJO_HISTORY_METHODS`) ne le porte pas, la CLI servie du garde ne fait que `reconcile` et `unlock`
  (`packages/rpc-guard/src/cli.ts`). Options : (a) `getSlot` `finalized` hors garde (un crédit hors du grand livre : contraire à « tout
  appel par le garde ») ; (b) lecture sur place d une page primaire d explorateur (valeur et URL au JOURNAL) ; (c) lot court : la course
  lit `getSlot` par le garde (liste D-2 et tarif à amender) ; **(d), retenue au mode d emploi 18 (i), à confirmer** : une phase A
  provisoire sur un état jetable (la phase A lit tout l index du mint, par le garde, en `finalized`, et n emploie `--cut` qu à la
  première ligne du journal : `history-collect.ts` l.161, 167, 212 ; le coupage vit en phases B et C, l.302, 324, 331, 342), puis
  `--cut` = le plus petit des deux créneaux les plus récents des deux opérateurs. Aucune transaction de J - 1 ne suit ce créneau (il est
  le plus récent connu) : Q-3 est réglée du même geste. Prix : la phase A deux fois. Sonde sur la chaîne simulée, hors livrable :
  `F:/tmp/dojo/fast/q1/probe-cut.mts`, sortie `{"exit":0,"slots":[445903375,445903375],"min":445903375,"truth_last_slot":445903375,
  "equal":true}` (12:16 UTC).
- **Q-2 (Eve de P = J déposée pour J + 1).** L Eve provisoire est celle de J (lignes de J - 1), un jour plus ancienne que l Eve exacte de
  J + 1. Conséquence bornée (L4) : au pire `eve_mismatch` à 18 (iv), jamais une ligne fausse ; le résidu B-1 devient « acquiert entre
  J - 1 et d - 1, ferme avant le premier instant lu de d » (texte de 18 (iv) mis à jour). Réduction possible, non faite (hors décision) :
  réunir à l Eve les propriétaires détenteurs à S_CUT (une adresse en trop lit 0 sans ligne). Item PROVISIONAL-EVE-AT-CUT-1, déclencheur :
  un `eve_mismatch` à 18 (iv).
- **Q-3 (`--cut` qui ne couvrirait pas tout D_LAST).** La course ne peut pas dater S_CUT sans lecture ; un `--cut` antérieur à la fin de
  J - 1 donnerait une Eve incomplète (même conséquence bornée que Q-2). Contrôle possible, non fait (« le reste de la course est celui du
  mode normal ») : refuser une course dont un index fusionné porte une entrée de créneau > S_CUT et de `blockTime` antérieur à P (trois
  lignes, données déjà lues). Item PROVISIONAL-CUT-COVERS-DLAST-1, déclencheur : un `--cut` venu d une autre source que Q-1 (d).
- **Q-4 (`dojo-eve.mjs` sans consommateur sur le chemin réel).** L outil de l arbre de collecte ne sert plus qu à la section 6 (répétition
  à la demande) et au test `dojo_collect_unit_runs_the_real_tick` ; l arbre ne change pas (mission). Item DOJO-EVE-TOOL-OFF-PATH-1,
  déclencheur : le prochain changement de `DOJO_COLLECT_TREE_PATHS` (garder pour la répétition à la demande, ou retirer).
- **Q-5 (items de `docs/ETAT.md` « avant A-7 »).** DOJO-SIGTERM-LINUX-PROOF-1 et les bloqueurs de l en-tête « Before A-7 » s appliquent
  désormais avant la minuterie de A-9 (7) (en-tête du mode d emploi réécrit) ; `docs/ETAT.md` (tronc) reste à aligner par l orchestrateur.
- **Q-6 (ADR).** Les actes A-7, A-9, A-11 et la règle DOJO-ANCHOR-OTS-DATE-RULE-1 (ADR-DOJO-PR-3 D-4) et le mode provisoire
  (ADR-DOJO-PR-2B) n ont pas de ligne datée dans ce lot (documentation, hors mission) : ligne datée à poser par l orchestrateur.
- **Q-7 (limite déclarée, PAROXYSME).** Jusqu à la mise à niveau de la preuve, la date de l ancre ne repose que sur sa ligne signée et le
  miroir de A-8 (3) : item DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1 (nommé par l orchestrateur), déclencheur : la première publication.
- **Q-8 (barre oblique inverse).** Aucune dans les fichiers créés (garde d octets : 0). Une ligne modifiée de `history-collect.ts`
  porte la séquence d échappement du saut de ligne (barre inverse, puis n) dans un gabarit, comme chaque écriture du fichier existant ;
  deux lignes de tueurs réancrées gardent leurs guillemets échappés d origine ; le mode d emploi en compte 15 avant et après.
- **Q-9 (plafond de méthode de la phase C, mesuré dans le code, préexistant, hors de ce lot).** Le garde compte les tentatives par
  (opérateur, méthode) et par course (`packages/rpc-guard/src/client.ts` l.43 et l.132) ; `setup` fixe `getSignaturesForAddress` à
  pages(S(J), 1000) = 143 le 2026-10-01 (J = 22, S = 6 467 x 22 = 142 274) ; la phase C lit l index de chaque compte de jeton une fois par
  opérateur (`history-collect.ts` l.342). Avec N comptes, N > 143 : la phase C s arrête `method_cap` (fermée, partielle) et se reprend
  (D-11 : servi ce qui est clos, le reste appelé), soit environ N / 143 courses de C. N n est pas mesuré ici (aucun réseau). Mode d emploi
  18 (i) : la reprise de C sur `method_cap` est écrite, sans quoi la boucle s arrêtait au premier `method_cap` (STOP à tort ce soir) ; la
  course FINALE (18 (ii) à (iv)) a la même propriété. Item HISTORY-PHASE-C-METHOD-CAP-1, déclencheur : le premier `method_cap` de C.
- **Q-10 (sorties hors de la liste « À créer » de la mission).** Fichiers modifiés hors de la liste nommée, par conséquence nécessaire :
  `apps/dojo/test/dojo-history-collect.test.ts`, `test/dojo-entry-link.test.ts`, `test/dojo-history-e2e.test.ts` (tueurs ancrés sur des
  lignes déplacées de `history-collect.ts`) ; `test/dojo-publish-deploy.test.ts` (test épinglant l ancien ordre, réécrit ; tueurs ancrés
  sur des lignes déplacées du mode d emploi). Aucun autre chemin.
- **Q-11 (écart d outillage git, déclaré).** Un `git status --short` lancé sans `GIT_OPTIONAL_LOCKS=0` à 11:26:50 UTC a rafraîchi l index
  du worktree (`F:/Monark/.git/worktrees/Monark-wt-fast/index`, mtime 11:26:51 UTC) : ni objet, ni ref, ni commit. Tous les appels git
  suivants portent `GIT_OPTIONAL_LOCKS=0`. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun `git add`, `commit` ou
  `stash` dans le worktree ni dans `F:/Monark` ; les seules écritures git sont dans des clones neufs sous `F:/tmp/dojo/fast/` (`mclone`)
  et dans ceux que créent `red-proof.mjs`, `oracle/run.mjs` et `mutants/run.mjs`.
- **Q-12 (écritures sur C:, déclarées).** TEMP sous `F:/tmp/dojo/fast/tmp` pour chaque course ; PowerShell a tourné pour `mk-nm.ps1`,
  `rm-nm.ps1` (sans `-NoProfile`) et `Get-CimInstance` (avec) : il peut réécrire ses propres fichiers de profil sur C: (item admis et
  déclaré CV4-POWERSHELL-C-WRITE-1 de `docs/ETAT.md`) ; aucun fichier du projet ni de livrable sur C:.
- **Q-13 (limite déclarée des tueurs).** La garde `c.a.provisionalDay === null` de la branche `publish/` (`history-collect.ts` l.452) n a
  pas de tueur propre : la non-engageabilité repose sur le type de `provisionalEve` (une `Eve`, jamais un `HistoryBuild`) et sur
  l assertion d absence de `publish/` du test 2 ; le tueur 449 prouve que l Eve va dans `provisional/`, pas que la branche `publish/` est
  morte en mode provisoire. Une mutation de cette garde lancerait `closeHistory` sans relevé (`read_malformed` hors du `try`, course en
  échec, test 2 rouge) : déduit du code, non mesuré. Item PROVISIONAL-PUBLISH-GUARD-KILLER-1, déclencheur : la relecture G2 de la partie.

## 7. Mesures (horodatées à `date -u` ; TEMP `F:/tmp/dojo/fast/tmp` ; verrou d hôte relu absent avant chaque course)

- Courses ciblées sur le worktree (jonctions `node_modules` par `mk-nm.ps1`, retirées à la fin) : 11:46:02-11:46:41, les quatre fichiers
  de l historique existants, 34 tests, 34 verts ; 11:51:55-11:51:58, le fichier neuf, 3 sur 3 ; 12:00:06-12:01:22, tous les fichiers du
  Dōjō (`apps/dojo/test/*.test.ts`, `test/dojo-*.test.ts`), 251 tests, 249 verts, 0 rouge, 2 sautés (la clé du serveur ; le vrai signal
  sous Windows) ; 12:17:24-12:17:28, après les dernières retouches du mode d emploi, `dojo-publish-deploy`, `dojo-collect-deploy` et le
  fichier neuf, 24 tests, 23 verts, 1 sauté (TU-K, la clé).
- `tsc --noEmit` (11:59:21, code 0 ; `--listFiles` relu pour quatre des sept fichiers TypeScript touchés) ; `eslint` sur les sept fichiers
  touchés (11:59:44, code 0).
- `red-proof` n° 1 (12:01:49-12:03:53) : OK, 4 jugés F2P, 37 inchangés, 4 tueurs tirés (graine 20261001) et tués ;
  `F:/tmp/dojo/fast/red-proof/RED-PROOF.json` sha256 `f8fce9192617e64fda1136470161cff0d31a71b95f4c8919dbc51bd272f56dbe`, remplacé par le
  n° 2 (tueurs du mode d emploi réancrés depuis).
- `red-proof` n° 2, arbre final (12:17:38-12:19:39) : OK, les mêmes 4 F2P (rouges à la base par `ERR_ASSERTION`, verts au gel), 4 tueurs
  tués ; `F:/tmp/dojo/fast/red-proof-2/RED-PROOF.json` sha256 `df0e19e4b5958a5c70e40b68bc5bd9f81af957919533b7cf51cd6250737ac133`.
- Oracle n° 1 (rôle G1, 12:05:02-12:13:33) : code 0 ; enregistrement
  `F:/tmp/oracle-results/894037968db4a38a64f21a51c6261b7b69ffb998-1f519fab8370d66d-G1-20261001T120502Z-323296.json` sha256
  `cb4a4d8967478174ceaa9db1c488e163fe3ef20770aef14c28c844bd7df4bd88` ; 1 852 tests, 1 847 verts, 0 rouge, 5 sautés ; r25 STAT 261 + 56 =
  317 (borne 1 205), CONTENT 0 ; portes statiques à 0. Son arbre est figé avant les dernières retouches du mode d emploi : remplacé par le
  n° 2 ci-dessous.
- Campagne de tueurs n° 1 (`mutants/run.mjs --killers`, 12:20:09-12:20:26) : 32 sur 32 « non conclu (base) », base rouge : le clone de
  l outil n avait pas de `node_modules` (`nmSrc` = le `node_modules` voisin du `--git-common-dir` de `--repo`, absent dans `mclone`) ;
  `F:/tmp/dojo/fast/mutants-k1/RESULTS.json` sha256 `2215a7ccb1ed15e28a6604a6d88fb9e1da15c72142aabf91e7e15b0e1cd4773e`, `RESULTS.txt` lu
  avant la relance ; relance n° 2 sur une sortie neuve après `mk-nm.ps1` sur `mclone` (ci-dessous).
- Campagne de tueurs n° 2 (`node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/fast/mclone --base 89403796 --out
  F:/tmp/dojo/fast/mutants-k2 --killers --targets <les cinq fichiers de test touchés> --lock-root F:/tmp --min-free-mb 4096`, outil
  sha256 `41cdf83f9f52cdc8b95d592546ab567fbab68dd861823dffcc785adbb0261ac8`, lancé 12:21:47, outil 12:22:05-12:23:24 UTC ; verrou absent ; 12 `node.exe` à
  12:19:45 ; à 12:21:33, 16 203 148 Kio physiques et 29 951 436 Kio virtuels libres, `Get-CimInstance`) : base verte (110 tests verts,
  52,8 s), **31 tués sur 32** ; K30 non conclu : le tueur
  de `dojo_keyring_shares_no_key_with_bell`, test sauté par nom jusqu à l acte A-4p (préexistant, item DOJO-KEYRING-KILLER-REMEASURE-1 du
  tronc) ; les douze tueurs réancrés (K1 à K6, K18 à K20, K28, K31, K32) et les quatre neufs (K7, K8, K9, K29) tués.
  `F:/tmp/dojo/fast/mutants-k2/RESULTS.json` sha256 `4da0ff54eaf1783387e5fccd2fae35eefbdeb79d80a83ddf2128b4ad2680c7d7` ;
  `RESULTS.txt` sha256 `bca26598ff73472d491ed449d2208b0c12e1efd4e1793d7c9c229ededc1bc008`. Jonctions `node_modules` de `mclone`, du clone
  de l outil (MUTANTS-NM-UNLINK-1) et du worktree retirées par `rm-nm.ps1` à 12:23 UTC ; `F:/Monark/node_modules` intact (218 entrées).

## 8. Fin (R-25, portes, livrables)

- **R-25** (calcul exporté `F:/Monark/scripts/oracle/r25.mjs`, sha256 `4d0544df…827cf0`, porté par l oracle) : STAT 261 insertions + 56
  suppressions = 317 lignes, sous la borne de la mission (1 150) et sous la porte CI (1 205) ; CONTENT 0.
- **Portes statiques** (oracle, rôle G1) : `lint-model-pinning`, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`,
  `lint:ratchet` à 0.
- **`red-proof`** : `F:/tmp/dojo/fast/red-proof-2/RED-PROOF.json` sha256 `df0e19e4b5958a5c70e40b68bc5bd9f81af957919533b7cf51cd6250737ac133`.
- **Garde d octets** des fichiers créés (`F:/tmp/dojo/fast/tmp/tools/bytes.mjs`) : 0 TAB, 0 octet de contrôle, 0 barre inverse, 0 ligne
  de plus de 160 caractères ; lignes ajoutées des fichiers modifiés (`added.mjs`) : une seule de plus de 160, déclarée (section 5).
- **Livrables** : ce journal ; `F:/tmp/dojo/fast-deliver/REPONSE.md` ; `F:/tmp/dojo/fast-deliver/DELIVERED.sha256`.

## 9. Oracle n° 2 (arbre final ; ajouté après son passage, seul delta du journal)

- `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-fast --base 89403796` (12:24:04-12:32:35 UTC) : code 0 ;
  enregistrement `F:/tmp/oracle-results/894037968db4a38a64f21a51c6261b7b69ffb998-a50ac6343af50f0d-G1-20261001T122404Z-379220.json`,
  sha256 `f8e251f002993142c7761116318c58a2e4f8618370d24d9e0900366ffe6455b3` ; 1 852 tests, 1 847 verts, 0 rouge, 5 sautés ; objet d arbre
  du gel `76177793d3c0615d4861bffeec1eb129f6b35599` ; portes statiques à 0 ; r25 STAT 261 + 56 = 317, CONTENT 0 ; C-V-4 : 13 `node.exe`,
  16 503 Mo libres.
- Delta entre son arbre figé (`F:/tmp/oracle-runs/run-yqxGq4/tree`, comparé fichier à fichier à 12:29:35 UTC) et la livraison : ce
  journal seul ; les huit autres fichiers égaux au sha256 près.
