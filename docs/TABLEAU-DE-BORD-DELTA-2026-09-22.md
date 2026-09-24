# DELTA — brouillon `TABLEAU-DE-BORD-draft.md` vs `e60ea07:docs/TABLEAU-DE-BORD.md`

Modèle résolu : claude-opus-5-5[1m] (préfixe `claude-opus-5-5` — contrôle R-1 à faire par l'orchestrateur)

## 0. Provenance et périmètre
- Worker `claude-opus-5-5[1m]` (effort max), 2026-09-22, rédaction 19:40 UTC puis mise à jour 19:50 UTC (`date -u`). Mission `F:\tmp\tdb\MISSION-TDB.md`. Réviseur : orchestrateur (R-21). Aucun commit, aucun workflow (R-20) ; aucune écriture dans `F:\Monark` (lecture seule).
- État lu : `lot/etude-suite` @ **`60b54c0`** (19:40:49 UTC). `docs/CHANTIERS.md` = 834 lignes : :1-824 inchangées entre `50f6d12` et `60b54c0`, :825-834 ajoutées par `60b54c0` (G2-delta NARABI-OPS-1d, erratum d'heures O-4, A-12). Commits postérieurs à `50f6d12` : `b130852` (19:23:52 UTC, checkpoint-1 A-9-OUTILLE), `1be4a34` (19:29:50 UTC, re-checkpoint-2 NARABI-OPS-1d), `1d4f385` (19:31:01 UTC, traces Linux + erratum PLI 1d), `60b54c0` (19:40:49 UTC, G2-delta NARABI-OPS-1d PASS). Le premier jet (19:40, @ `1d4f385`) a été mis à jour sur `60b54c0` (D-01, D-12, D-29, D-30, D-44, D-45, D-46).
- Base : `docs/TABLEAU-DE-BORD.md` = blob de `e60ea07` (`git show e60ea07:docs/TABLEAU-DE-BORD.md | cmp - docs/TABLEAU-DE-BORD.md` : identique), 84 lignes, UTF-8, LF, sans BOM.
- **Constat de base** : seul le §7 a été réécrit à `e60ea07` (14:12 UTC). Les cellules des §1-§6 datent au plus tard de `3c6afde` (01:12 UTC) et `7801083` (00:46 UTC) (`git log -p -- docs/TABLEAU-DE-BORD.md`). La liste de faits de la mission ne suffit donc pas à rendre le corps exact : des G7 antérieurs à 14:12 (00:14-07:51 UTC) sont aussi reportés. Chaque entrée hors liste de mission est marquée **[hors liste]** et peut être rejetée isolément.
- Notation des sources : `CH:n` = `docs/CHANTIERS.md` ligne n à `60b54c0` (lignes 1-824 identiques depuis `50f6d12`) ; `G7:<lot>:n` = `docs/G7-lot-<lot>.md` ligne n ; sha = commit git (heures UTC par `TZ=UTC git log --date=format-local:…`). Niveau : tout est [lu] de première main dans le dépôt par ce worker, sauf mention contraire (le montant Fast Pass CoinGecko est lu dans le dossier du chercheur, non relu à la source).
- Heures : les titres CHANTIERS `:788`, `:800`, `:805`, `:811` sont POSTÉRIEURS aux commits qui les ont introduits (O-1) ; le brouillon date donc par sha ou par l'heure du commit, jamais par ces titres.

## 1. Plages modifiées (`diff tdb-old.md TABLEAU-DE-BORD-draft.md`)
`3c3` · `15,17c15,18` · `20,21c21` · `33,34c33,34` · `36c36` · `40c40,41` · `46,49c47,59` · `57,58c67,68` · `61c71,74` · `67c80,81` · `69a84` · `77c92,99` · `79c101` · `82,84c104,106`. Lignes anciennes modifiées : 23 sur 84 ; 61 lignes reprises à l'identique. Une entrée D-nn par cellule modifiée ou ligne ajoutée ci-dessous.

## 2. Entrées

### En-tête
**D-01 — L3 → L3, phrase « Dernière mise à jour »**
- Avant : « Dernière mise à jour : 2026-09-21 18:05 UTC (`date -u`) — 16 lots fusionnés le 21/09 — régime B. Nouvelle session (Fable 5.1 `claude-fable-5-1`, 4ᵉ compte) reprise depuis `BASCULEMENT-COMPTE.md` §11. »
- Après : « Dernière mise à jour : [à compléter par l'orchestrateur : `date -u` au commit] — brouillon worker `claude-opus-5-5[1m]` rédigé le 2026-09-22 à 19:50 UTC (`date -u`) sur `lot/etude-suite` @ `60b54c0` — 13 G7 ACCEPTED le 22/09 (UTC, `git log`) — régime B. Session post-restart (décisions 133/134) : orchestrateur Fable 5.1 `claude-fable-5-1` ; workers, chercheurs et lecteurs Opus 5.5 `claude-opus-5-5` (effort `max` explicite). »
- Sources : 13 G7 = `TZ=UTC git log --date=format-local:'%Y-%m-%d %H:%M' --format='%h %ad %s' lot/etude-suite --since='2026-09-21 22:00' | grep -E "G7 .*ACCEPTED|Merge UKEMI-RETRY-1"` filtré sur 2026-09-22 ⇒ `fec2848` `3c6afde` `0534551` `6114ce9` `37af534` `ee51e56` `761839f` `54c8255` `b90efba` `eda73ca` `b9b207b` `0f989a9` `f6442fe` ; session post-restart / roster : CH:788-790, CH:811-814 (`a872716`). « 16 lots le 21/09 » retiré, non recalculé (O-10).

### §1 Bell
**D-02 — L15 → L15, GARDE-HELIUS, colonnes État + Étape** [hors liste pour 1b-0]
- Avant (État) : « **1a FUSIONNÉ `88c63bb`** ; **1b PLAN APPROUVÉ** (`docs/G0-lot-garde-helius-1b.md`, cp-1 plié `d6af611`, 4 sous-lots 1b-0..1b-iii) » ; (Étape) : « **1b démarre dès la fusion de 2b-ii (décision 122)** ; course Bell PENDANT U-4b-2 → U-7 ».
- Après (État) : « **1a FUSIONNÉ `88c63bb`** ; **1b-0 (paquet) FUSIONNÉ `6a639e8`** (G7 `6114ce9` : 795/794/0/1, lint 0, ratchet 69/69, R-25 638) ; **1b (1b-i + 1b-ii + 1b-iii) FUSIONNÉ `a380867`** (G7 `54c8255`, ADR `6ffc5e3` : 857/857/0/0, `fetch_only_inside_client` levé, lint 0, ratchet 69/69 ; R-25 1b-i 1 136 / 1b-ii 680 / 1b-iii 465 / pli 296) » ; (Étape) : « — (chaîne 1 CLOSE ; course Bell servie via `openGuardedClient` ; items Pli-2/Pli-3/Pli-4 à l'ADR, déclencheurs nommés) ».
- Sources : G7:garde-helius-1b-0:1,6 ; G7:garde-helius-1b:1,6,24,27 ; commits `6114ce9`, `54c8255`, `a380867`.

**D-03 — L16 → L16, -b3d-f, colonne Étape**
- Avant : « Amendement de format n°2 + ADR D1-octies dans le SHA ; C-F-4 = escalade investisseur au G0 de course ; `RefMod` arité 5 → GARDE-HELIUS-1b ».
- Après : « Amendement de format n°2 + ADR D1-octies dans le SHA ; C-F-4 TRANCHÉE (décision 124 : ancrage OpenTimestamps aux frontières, appliqué en course) ; `RefMod` arité 5 SOLDÉ par 1b-0 (`ee8a94f`) ».
- Sources : CH:629-636 (décision 124) ; `docs/course-bell/ANCHORS.md:37-46` (ancres posées) ; `packages/rpc-guard/test/ledger-format-lock.test.ts:14-30` (commentaire « GARDE-HELIUS-1b-0 (L-1 / C-4) … ARITY 5 », `interface RefMod` à 5 paramètres) ; dernier commit du fichier `ee8a94f`, fusionné par `6a639e8`.

**D-04 — L17 → L17, Course de contre-vérification, colonnes État + Étape**
- Avant (État) : « BLOQUÉ » ; (Étape) : « GARDE-HELIUS-1b (seul gate de code restant ; G-1/2/3/5 REMPLIS) ; décisions 124 (ancrage B) et 125 (plafond 5 396 170, go-1 sonde / go-2 tirage) rendues ; G0 de course à plier sur 123/124/125 ; G0 de course DRAFT persisté ; fenêtre de cycle : départ avant ~15/10 ; chevauche le temps 1 (122) ».
- Après (État) : « **BLOQUÉ — décision investisseur (§6 Q-B1/Q-B2)** : TSLAx `inconclusive`, STOP avant AAPLx » ; (Étape) : « G0 de course PLIÉ `f5314e7` (décisions 123/124/125) ; **go-1 EXÉCUTÉ** 14:00-14:08 UTC (floor Helius n2 60 938 null-debit ; sonde K=8 : 36 appels, 360 cr pire cas ; point (a) : 44 appels cumulés, 440 cr pire cas ; point (b) : reprise inter-process sans double comptage prouvée ; projection Σ MAX 274 303 cr ; ancre probe_end `c05e37c`) ; **go-2** (décision 131 : bande ±30 %, arrêt à la frontière 14 %) : TSLAx ancre mint_start 14:11:33Z (`e12ee3a`), lancement 14:12 UTC, puis reprises r1..r4 sous ancres mint_resume (`f7b7bc5`, `ca05c1c`, `88cb5f9`, `5a7c066`) ; 3 arrêts `NonJsonBody` (201 / 827 / 4 571 pages) ⇒ BELL-RETRY-1 fusionnée à la frontière ; r3 terminé 19:08:00 UTC : **8 783 pages committées, N_exact 8 782 993**, page NON finale courte ⇒ `not_full_pages`, verdict `inconclusive` ; r4 (1 appel, 19:12:08 UTC) : même page ⇒ arrêt persistant ; crédits recomputés 42 250 (pire cas 88 570) ; ratio 131-bis 8 783 / 3 674 = **2,39**, hors bande ⇒ STOP mécanique avant AAPLx ; aucun processus de tirage en vol ; cycle Helius jusqu'au 19/10 (jamais chevaucher, décision 125) ».
- Sources : G0 plié = commit `f5314e7` (« G0 course Bell (t1a-ii-b3d) FOLDED on decisions 123/124/125 ») et `docs/G0-lot-t1a-ii-b3d-course.md` ; go-1 = CH:737 (floor n2), CH:739-742 (sonde, points (a)/(b), projection, ancre `c05e37c`) ; go-2 = CH:746-747 ; lancement 14:12 = §7 figé (`e60ea07`, L82) ; ancres = `docs/course-bell/ANCHORS.md:38,42,44,45,46` ; arrêts = CH:748 (201), CH:757 (827), CH:770 (4 571) ; r3/r4 = CH:817-818 ; ratio = CH:819 (8 783 / 3 674 = 2,3906) ; aucun tirage en vol = CH:818 (r4 arrêté) ; cycle = CH:642. Nomenclature r1..r4 : O-6. Chiffres go-1 : O-5.

**D-05 — L18 (nouvelle ligne), BELL-RETRY-1**
- Avant : (ligne absente).
- Après : « | BELL-RETRY-1 (`NonJsonBody` transitoire côté Bell) | FUSIONNÉ `4db059e` (G7 `b9b207b`, arbre `fc8514b` : 901/901/0/0, lint 0, ratchet 69/69 ; `quorum.ts` `5871b4b6…`) — fusion D-n à une frontière ancrée (3ᵉ arrêt `NonJsonBody`, 4 571 pages ; époque retry portée par l'ancre mint_resume-3, `aefb071`) | items R-BR3 (`universe.ts:113`, avant la phase B univers), R-BR4 (`ethereum.ts:77`, 1ʳᵉ course `--eth`) | — | ».
- Sources : G7:bell-retry-1:1,3,6,15 ; CH:763-765 (cp-2, D-n), CH:770 ; `ANCHORS.md:45` ; commit `aefb071`.

**D-06 — L20 → L21, -iii-a1-bis, colonne Étape** [hors liste]
- Avant : « D4 re-diagnostiqué (défaut amont Node/Windows, item sourcé) ; phantom-fresh + CONV-2 → GARDE-HELIUS-1b ».
- Après : « D4 re-diagnostiqué (défaut amont Node/Windows, item sourcé) ; phantom-fresh + CONV-2 : fermés par 1b-i (L-2 + D-6, ledger de CYCLE, test `universe_out_moved_on_resume_keeps_cycle_prior` ; résidu run-ledger borné déclaré, ADR-GARDE-HELIUS :694/:767) ».
- Sources : `docs/G0-lot-garde-helius-1b.md:65,170-177` ; `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md:694,767` ; test présent dans l'arbre : `apps/bell/test/universe.test.ts:911` (`grep -rn universe_out_moved_on_resume_keeps_cycle_prior apps packages`) ; fusion 1b `a380867`.

**D-07 — L21 (ancienne, ligne vide) supprimée** [hors liste, forme]
- Avant : ligne vide à l'intérieur du tableau §1 (entre -iii-a1-bis et R1) — en Markdown, les 6 lignes R1…T-2/T-3 formaient un second bloc sans en-tête, donc non rendu en tableau.
- Après : ligne supprimée ; le tableau §1 est continu (16 lignes de données : 15 anciennes + BELL-RETRY-1, brouillon L12-L27).
- Source : lecture de `e60ea07:docs/TABLEAU-DE-BORD.md:20-22` (O-3).

### §2 Narabi
**D-08 — L33 → L33, -1b-ii-a, colonnes État + Worktree** [hors liste]
- Avant : État « CHECKPOINT-2 OK (isolation) » ; Worktree « `Monark-wt-narabi1b2a` ».
- Après : État « FUSIONNÉ dans -1b-ii `c0027cb` (CHECKPOINT-2 OK en isolation) » ; Worktree « — (worktree `Monark-wt-narabi1b2a` retiré) ».
- Sources : commit `c0027cb` (« Narabi -1b-ii (-a SMTP alert + -b state.json cross-check) G7 ACCEPTED ») ; `git worktree list` à 19:3x UTC (aucune entrée `Monark-wt-narabi1b2a`).

**D-09 — L34 → L34, -1b-ii-b, colonne État + cellule manquante** [hors liste]
- Avant : « | -1b-ii-b détection jour manquant | CHECKPOINT-2 OK (isolation) | — | » (3 cellules dans un tableau à 4 colonnes).
- Après : « | -1b-ii-b détection jour manquant | FUSIONNÉ dans -1b-ii `c0027cb` (CHECKPOINT-2 OK en isolation) | — | — | ».
- Sources : commit `c0027cb` ; comptage de cellules `awk -F'|'` (O-3).

**D-10 — L36 → L36, Rattrapage `run.ts`, colonnes État + Étape** [hors liste]
- Avant : État « À VENIR » ; Étape « G0/ADR, AVANT E-5 ».
- Après : État « COUVERT par -1c (FUSIONNÉ `c4981d0`, ligne -1c) » ; Étape « — ».
- Sources : commit `c4981d0` (« run.ts in-process catch-up budget … ») ; commit `3fbf2b0` (livelock de rattrapage sous `TimeoutStartSec` = défaut bloquant avant le redéploiement) ; CH:588 (-1c CLOS, sha `run.ts` = sha de production E-5) ; ligne -1c inchangée du tableau (BUILT).

**D-11 — L40 (nouvelle ligne), Release Narabi**
- Avant : (ligne absente).
- Après : « | Release Narabi (temps 1, décision 117) | **EN LIGNE** (décision 130, 22/09 : export public de `db14e8a`, G7 SITE `b90efba`, `/opt/monark-redeploy.sh` swap atomique ; `/`, `/narabi`, `/ukemi`, `/icons/{narabi,ukemi}.svg` = 200 ; `/ukemi` pilule « built », 0 « interval ») | parcours visuel investisseur (résiduel C-7) à sa convenance ; COMMS-1 ouvert (déclencheur = cette release) | — | ».
- Sources : CH:731-733 ; CH:665-668 (COMMS-1, déclencheur « G7 de la release Narabi ») ; G7:site-release-1:33 (résiduel C-7).

**D-12 — L40 → L41, -1d, toutes colonnes**
- Avant : « | -1d migration `rpc.ts` vers le garde | APRÈS le temps 1 | résiduel accepté (décision 118) ; second redéploiement | — | ».
- Après : Lot « -1d jambe payante Chainstack de la sentinelle sous `@monark/rpc-guard` (`rpc.ts` GELÉ, intouché) » ; État « **EN COURS — chaîne de revue COMPLÈTE, G7 à rendre** : G1 `3a9c1f5` ; rebasé `e12f59f` sur `f6442fe` (931/929/0/2) ; G2 PASS-AVEC-CORRECTIONS (`bc282ea`) ‖ checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`a601e7c`) ; pli test-only `7daf8e5` (933/931/0/2, 12/12 mutants) ; re-checkpoint-2 ACCEPTE-AVEC-CORRECTIONS de forme (`1be4a34`) ; C-RV-1 (traces Linux persistées) + C-RV-2 (erratum PLI) pliées `1d4f385` (CI : run 35763895313 @ `e12f59f` 931/930/0/1 ; run 35769452047, job 106887215941, @ `7daf8e5` 933/932/0/1) ; **G2-delta PASS** (`60b54c0`, 1er worker Opus 5.5, R-1 conforme ; fusion à blanc contre `1d4f385` 933/931/0/2 ; 5 survivants pré-existants à `e12f59f`, non bloquants) » ; Étape « G7 + fusion locale (C-V-0 option (b)) dès réception du brouillon d'amendements ADR (worker en vol ; amendements datés C-G2-1/C-G2-4/C-V-4 + tuyaux dans le même commit) ; pli §11-1 AMENDÉ (code mort `rpc.ts` + entrée d'allowlist ; liage verbatim des `endpoints` DÉPLACÉ sur le chemin servi, pas supprimé — C-G2D-1 ; moitiés « chaîne vide » du garde `unconfigured` — C-G2D-2) + G2-delta + re-cp-2 + 2ᵉ redéploiement VPS (décision 118) APRÈS la clôture de la course -1b » ; Worktree « `F:\Monark-wt-nops1d` (`lot/narabi-ops-1d` @ `7daf8e5`) ».
- Sources : commit `e12f59f` (message : « sentinel paid Chainstack leg through @monark/rpc-guard … rpc.ts frozen byte-identical ») ; `3a9c1f5` (G1 persisté) ; CH:755 ; CH:781-786 (rebase, C-V-0 (b), C-V-1, C-G2-*) ; CH:800-803 (pli `7daf8e5`, 933/931/0/2, 12/12) ; `1be4a34` + `docs/CHECKPOINT2-lot-narabi-ops-1d-re.md:1,54-60` ; `1d4f385` + `docs/traces/narabi-ops-1d/README.md:9,12` (run et job ids, cités selon A-12) ; `60b54c0` + CH:826-830, CH:834 + `docs/G2-lot-narabi-ops-1d-delta.md:1,9` ; `git worktree list`.

### §3 Ukemi
**D-13 — L46 → L47, U-4b, colonne Étape** [hors liste]
- Avant : « -0 après GARDE-HELIUS-1a→2 et POOL-RPC-1a ; -1b : prereg (3 sha D4 + 3 transitifs, liste C-V-7, `--concordance-out`), `PR-U4-3-ter`, « agrégat ≠ Σ jambes » avant la course ».
- Après : « -0 subsumé par GARDE-HELIUS-2 (chaîne CLOSE) ; `PR-U4-3-ter` CLOS en [lu] ; « agrégat ≠ Σ jambes » CLOS ; prereg et sous-lots : lignes suivantes ».
- Sources : ligne GARDE-HELIUS-2 (« subsume U-4b-0 ») + `3c6afde` (chaîne 2b close) ; CH:578 (PR-U4-3-ter CLOS en [lu]) ; CH:604 (« Q5 : item « agrégat ≠ Σ jambes » CLOS »).

**D-14 — L47 → L48, GARDE-HELIUS-2, colonne Étape + 4ᵉ cellule** [hors liste]
- Avant : Étape « **2b-ii** : G0 committé `de2aff0` (rulings R-A..R-G), checkpoint-1 EN COURS → G1 (worktree neuf) → G2 ‖ cp-2 → G7 ; puis prereg U-4b-1b (brouillon `docs/PLAN-u4b-prereg.DRAFT.md`) → course », suivie d'une 4ᵉ cellule « — » dans un tableau à 3 colonnes.
- Après : Étape « — (chaîne 2 CLOSE ; statut `built` du paquet `@monark/rpc-guard` au registre interne = reconcile Chainstack, gate comptable séparée — décision 129) » ; 4ᵉ cellule supprimée. Colonne État inchangée.
- Sources : `fec2848`, `3c6afde` (G7 2b-ii, 2b-iii) ; CH:703 (décision 129 : le reconcile conditionne le statut `built` du paquet) ; comptage `awk -F'|'` (O-3).

**D-15 — L49 (nouvelle), U-4b-SCORE-1** [hors liste]
- Après : « | U-4b-SCORE-1 (score unilatéral `max(Y − ŷ, 0)`, décision 126) | FUSIONNÉ `6652ed0` (G7 `0534551` : 781/780/0/1, lint 0, ratchet 69/69, R-25 83 ; `u4b-scores.mjs` re-gelé `2f9a31f6…`) | — | ».
- Sources : G7:u4b-score-1:1,6 ; CH:646-651.

**D-16 — L50 (nouvelle), U-4b-1b-0** [hors liste]
- Après : « | U-4b-1b-0 outillage de course (décision 128) | FUSIONNÉ `5d58a8a` (G7 `ee51e56` : 820/819/0/1, lint 0, ratchet 69/69, R-25 722 ; garde prereg/labeler PAR CODE, `<out>.diag.json` durable, `u4b-discover.mjs` keyless) | — | ».
- Sources : G7:u4b-1b-0:1,6 et §3 (Livré) ; message `5d58a8a` ; CH:659-662, CH:676-677.

**D-17 — L51 (nouvelle), U-4b-1b-1** (liste mission : `761839f`)
- Après : « | U-4b-1b-1 labeler paramétré (QF-2 α) | FUSIONNÉ `506db2d` (G7 `761839f`, ADR `fc7eeff` : 832/831/0/1, lint 0, ratchet 69/69, R-25 933 ; labeler re-gelé `cb020425…`, labels e2 byte-égaux) | — | ».
- Sources : G7:u4b-1b-1:1,6 ; CH:692-694, CH:712-723.

**D-18 — L52 (nouvelle), Prereg U-4b-1b** [hors liste]
- Après : « | Prereg U-4b-1b (committé SEUL, régime B) | v1 `9e095a0` (sha LF `770413d9…`) SUPERSÉDÉ par **v2 `a75dbf1`** (§5b réécrit sur les lignes gelées de -1b-2 ; sha LF `1971d9b1…` = blob HEAD) ; 9 sha gelés ; floor Chainstack n2 **12 916 RU** (lu sur place 13:56 UTC) | reconcile Chainstack = gate comptable SÉPARÉE (décision 129) ; go U-6 conditionnel pré-enregistré (décision 122 amendée par 129) | ».
- Sources : recompute `git show <c>:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum` ⇒ `9e095a0` : `770413d992b5…4598`, `a75dbf1` : `1971d9b14ce0…2f49`, `HEAD` : `1971d9b14ce0…2f49` ; `6685e15` (sidecar : v2 supersède v1) ; `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:13` ; `docs/course-ukemi/FAITS-floor-chainstack-n2-2026-09-22.md:3,10` (lu 13:56:23 UTC, « Used 12,916 ») ; G7:u4b-1b-2:6 (9 sha) ; `docs/PLAN-u4b-prereg.md:156,359`.

**D-19 — L53 (nouvelle), U-4b-1b-2** (liste mission : `eda73ca`)
- Après : « | U-4b-1b-2 préconditions de course (discover v2, sélecteur d'épisode, prober D_e paramétré, `--fill-ts`) | FUSIONNÉ `cabe67f` (G7 `eda73ca` : 896/896/0/0, lint 0, ratchet 69/69, 9 sha gelés intacts ; 3 PR empilées R-25 209 / 547 / 929) | — | ».
- Sources : G7:u4b-1b-2:1,3,6 ; message `cabe67f`.

**D-20 — L54 (nouvelle), UKEMI-RETRY-1** (liste mission : `f6442fe`)
- Après : « | UKEMI-RETRY-1 (`NonJsonBody` transitoire, recorder Ukemi) | FUSIONNÉ `f6442fe` (fusion de `ecac47e` ; G7 porté par `docs/CHANTIERS.md` et le message de fusion : 921/921/0/0, R-25 170) | **PRÉCONDITION** de la course (étape 5a recorder) — remplie ; items R-U-2 (`u4-guard.mjs:136`), R-BR3/R-BR4 (Bell) | ».
- Sources : CH:774-779 ; message `f6442fe` (« … G7 921/921/0/0 ») ; CH:764 (C-3 : précondition) ; absence de `docs/G7-lot-ukemi-retry-1.md` (O-2).

**D-21 — L55 (nouvelle), U-4b-1b-3** (liste mission : G1 `801859f`, G2/cp-2 rendus, pli en vol)
- Après : « | U-4b-1b-3 `--fill-ts` borné à `to_block` + sidecar reprenable | **EN COURS — pli post-restart (worker Opus 5.5)** : G1 `801859f` (926/925/0/1, R-25 221 ; lancé sans checkpoint-1, déviation consignée) ; checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (C-V-1 BLOQUANTE : verrou de cycle tenu sur refus de reprise ; C-V-2 : 3 tests) ; G2 PASS-AVEC-CORRECTIONS (concordant) | pli (C-V-1 + C-V-2/C-G2-1/C-G2-2 + C-G2-3/C-V-6 + textes) → G2-delta ‖ re-cp-2 → G7 → rerun `--fill-ts` réel ; worktree `F:\Monark-wt-u4b1b3` (`lot/u4b-1b-3` @ `801859f`) | ».
- Sources : CH:772 (lancement du lot) ; `42f94f6` (G1 persisté) ; CH:793-798 (`3ba5a06`) ; CH:805-807 (`a41331b`) ; CH:824 (pli en vol) ; `git worktree list` / `git branch --list 'lot/u4b*'`.

**D-22 — L56 (nouvelle), Course U-4b-1b** [hors liste pour discover v1]
- Après : « | Course U-4b-1b (épisode frais ; GO 119, gos permanents 130) | **EN COURS, phase keyless (0 RU)** — BLOQUÉ par U-4b-1b-3 | discover v1 (13:57 UTC) : échec au témoin (pocket élagué, brut non écrit) ⇒ corrections dans -1b-2 ; discover v2 (16:38-16:58 UTC) COMPLET : 13 696 `LiquidationCall` [22803459, 26034127] ; sélection ⇒ `--fill-ts` ; `--fill-ts` ×3 STOP (recherche de fenêtre au-delà de `to_block`) ⇒ lot -1b-3 ; ~36 000 appels keyless perdus, 0 RU ; ensuite `--fill-ts` → select → check-version → course (recorder 5a…) ; RUNBOOK course Ukemi en préparation | ».
- Sources : CH:559-562 (119), CH:732 (130), CH:736, CH:771-772, CH:808-809, CH:824.

**D-23 — L57 (nouvelle), U-4b-2** [hors liste]
- Après : « | U-4b-2 (classe servie + registre frais) | **-2a FUSIONNÉ `88b20d2`** (G7 `37af534` : 810/809/0/1, lint 0, ratchet 69/69, R-25 720 ; classe `liquidation-eligible-coverage` sur registre VIDE, `under_calib`, 4 outils inchangés) | -2b APRÈS la course : registre frais épinglé + `fleet.ts` (borne haute `built`) ; `cascade` NON retiré ici (décision 123 → U-5b) | ».
- Sources : G7:u4b-2a:1,6 ; CH:625 (123) ; CH:690 ; CH:760 (option B : retrait en U-5b).

**D-24 — L48 → L58, U-5, colonnes État + Étape** (liste mission : U-5a `0f989a9`)
- Avant : État « À VENIR » ; Étape « après U-4b ».
- Après : État « **U-5a FUSIONNÉ `a050f75`** (G7 `0f989a9` : 917/917/0/0, lint 0, ratchet 69/69, R-25 1 146 ; `fromRealizedBook` pur + module `ukemi-predict` NON enregistré — option B, 4 outils, décisions 51/123) » ; Étape « U-5b après -2b : enregistrement + route + retrait `cascade` 4→4 + re-pin h5 + skill/MCP/README/site dans la MÊME fusion (décisions 51/127) ; A-9-OUTILLE (§4) déclenché par U-5b ».
- Sources : G7:u5a:1,6,12,15 ; CH:750-753, CH:759-761 ; CH:766.

**D-25 — L49 → L59, U-6, colonne Étape** [hors liste]
- Avant : « go investisseur ».
- Après : « go conditionnel PRÉ-ENREGISTRÉ (prereg -1b : décision 122 amendée par 129 — aucune strate servie en NON à H-3 ET `labels_no_quorum` non résolus = 0 ; sinon retour investisseur) ; toute NOUVELLE dépense Chainstack en U-6 re-enclenche la gate reconcile ».
- Sources : `docs/PLAN-u4b-prereg.md:359` (clause verbatim) ; CH:610 (122 item 3) ; CH:701-704 (129).

### §4 Transverse
**D-26 — L57 → L67, EXPORT-CLEAN, colonne Étape** [hors liste]
- Avant : « item : `export:check` en CI avant la fenêtre publique ».
- Après : « item `export:check` en CI : CLOS (CI-EXPORT-CHECK `3df2f73`) ».
- Sources : CH:587 (« Ferme l'item « `export:check` en CI avant la fenêtre publique » … TABLEAU EXPORT-CLEAN ») ; ligne CI-EXPORT-CHECK du tableau.

**D-27 — L58 → L68, HELIUS-1, colonne Étape** [hors liste]
- Avant : « scripts de brouillon hors garde (ledger reset, throw retiré) ; reste : lot GARDE-HELIUS avant toute course Bell ».
- Après : « scripts de brouillon hors garde (ledger reset, throw retiré) ; condition « lot GARDE-HELIUS avant toute course Bell » REMPLIE (1b FUSIONNÉ `a380867`) ; floor Helius n2 60 938 lu null-debit avant le go-1 ».
- Sources : `a380867`/`54c8255` ; CH:737 ; CH:403 (60 938 à la lecture HELIUS-1 n°1, 21/09).

**D-28 — L71 (nouvelle), SITE-RELEASE-1** (liste mission : `b90efba`, Narabi LIVE)
- Après : « | SITE-RELEASE-1 (index + `/narabi` + `/ukemi`, maquettes v4) | FUSIONNÉ `eb2e716` (A) + `db14e8a` (B) (G7 `b90efba` : 867/867/0/0, lint 0, ratchet 69/69, build + `assert-fleet-html` 0 ; R-25 A 171 / B 858) ; **DÉPLOYÉ EN LIGNE** (décision 130) | résiduel C-7 (pilule Narabi client-rendue) jusqu'au parcours visuel investisseur ; items : lien de navigation `/ukemi`, figures design-set, bloc servi (U-4b-2b) | — | ».
- Sources : G7:site-release-1:1,6,27,33 ; CH:733.

**D-29 — L72 (nouvelle), A-9-OUTILLE**
- Après : « | A-9-OUTILLE (garde de vocabulaire du harness : « verified » nu, « % », « probability », « interval ») | **EN COURS** — checkpoint-1 APPROUVE-AVEC-CORRECTIONS C-1..C-8 (`b130852`) ‖ G1 EN COURS (branche `lot/a9-outille` créée depuis `b130852`) | déclencheur U-5b (même fusion que l'enregistrement de `ukemi-predict`) ; moment de fusion = ruling orchestrateur (avis du checkpoint-1) | `F:\Monark-wt-a9outille` (`lot/a9-outille`) | ».
- Sources : CH:766 (item formé, déclencheur U-5b) ; CH:824 (G1 ‖ cp-1 lancés, `lot/a9-outille`) ; `b130852` + `docs/CHECKPOINT1-lot-a9-outille.md:1,47,49` ; `git branch --list 'lot/a9*'` (vide à 19:3x UTC, présente à 19:5x UTC) et `git worktree list` ⇒ `F:/Monark-wt-a9outille  b130852 [lot/a9-outille]`.

**D-30 — L73 (nouvelle), ROSTER Opus 5.5** (liste mission : roster `claude-opus-5-5`)
- Après : « | ROSTER Opus 5.5 (décision 133) | **APPLIQUÉ** : global (`a872716` : `~/.claude/CLAUDE.md` + `worker`/`chercheur`/`lecteur` → `claude-opus-5-5`, effort `max` explicite — défaut du modèle `medium`) ; agents PROJET balayés (`50f6d12` : Kraidle ×4, Vernier ×4, Shōgen `devops`, PermAegis `refutant`) | contrôle R-1 au premier worker FAIT : relecteur G2-delta NARABI-OPS-1d `claude-opus-5-5[1m]`, CONFORME (`60b54c0`) ; corps des agents globaux alignés (O-5 CLOS, effet au prochain redémarrage) ; effet au redémarrage de chaque projet ; orchestrateurs projet restent `claude-fable-5-1` | — | ».
- Sources : CH:768-769, CH:811-814, CH:821-822, CH:827, CH:833 ; `a872716`, `50f6d12`, `60b54c0` ; `docs/roster/FAITS-opus-5-5-2026-09-22.md`.

**D-31 — L61 → L74, Clôture temps 1, colonne Étape**
- Avant : « en dernier ».
- Après : « en dernier ; une cartographie temps 1 (lecture seule, `F:\tmp\carto\`) est en vol depuis 19:1x UTC ».
- Source : CH:823-824 (commit `50f6d12`, 19:18:03 UTC).

### §5 Site et marque
**D-32 — L67 → L80, Maquettes v2, colonne État (ajout en fin de cellule)** [hors liste]
- Avant : cellule se terminant par « … ; scripts `F:/MONARK SUITE/maquettes-v2-build/` ».
- Après : même cellule + « ; SUPERSÉDÉES par les maquettes v4 (ligne suivante) ».
- Source : `docs/G0-lot-site-release-1.md:12` (« maquettes v4 validées par relecture conjointe investisseur + orchestrateur »).

**D-33 — L81 (nouvelle), Maquettes v4** [hors liste]
- Après : « | Maquettes v4 temps 1 (index, narabi, ukemi) | VALIDÉES en relecture conjointe investisseur + orchestrateur (`F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\`) ; portées en production par SITE-RELEASE-1 (G7 `b90efba`) ; **EN LIGNE** 22/09 (décision 130) ; écarts à la maquette v4 = information investisseur (G0 SITE-RELEASE-1 §16.1) ; parcours visuel investisseur (C-7) à sa convenance | ».
- Sources : `docs/G0-lot-site-release-1.md:12,209` ; G7:site-release-1:1 ; CH:733.

**D-34 — L84 (nouvelle), Listing CoinGecko** (liste mission : CoinGecko dossier)
- Après : « | Listing CoinGecko du token MONARK | DOSSIER PRÊT (`docs/token/DOSSIER-COINGECKO-MONARK.md` + `docs/token/SOURCES-coingecko.md`, `831a87b`) ; FAITS lus sur place (`606b80b` : procédure CoinGecko ; paire MONARK/SOL déjà suivie par GeckoTerminal sur PumpSwap) ; 8 actes investisseur listés (§5 du dossier) — BLOQUÉ investisseur (§6 Q-C1) | ».
- Sources : `831a87b` (2 fichiers, 683 insertions) ; `606b80b` + `docs/token/FAITS-coingecko-listing-2026-09-22.md:13,15` ; `docs/token/DOSSIER-COINGECKO-MONARK.md:439-476` ; CH:824 (« Bloques : … CoinGecko (investisseur) »).

### §6 En attente de l'investisseur
**D-35 — L77 → L92, ~~F-1~~, chemin** [hors liste, forme]
- Avant : « `F:MONARK SUITE<FF>onts` » — l'octet 0x0C (saut de page) remplace « \f » ; les deux antislashs sont perdus (`od -c` de la ligne 77).
- Après : « `F:\MONARK SUITE\fonts\` ».
- Sources : CH:441 (« vers `F:\MONARK SUITE\fonts\` ») ; `ls -d "/f/MONARK SUITE/fonts"` ⇒ existe.

**D-36 — L93 (nouvelle), ~~130, 131 (+bis), 133, 134~~ (décisions investisseur rendues)**
- Après : « | ~~130, 131 (+bis), 133, 134~~ | gos PERMANENTS (130) ; go-2 Bell, bande ±30 % (131) + lecture du ratio = acte orchestrateur (131-bis) ; Opus 5.5 (133) ; gel des sous-agents jusqu'au restart (134) — RENDUES | — | ». La 132 (ruling orchestrateur, pas une question investisseur) n'y figure pas.
- Sources : CH:731-732, CH:746-747, CH:756, CH:768-769, CH:788-790 ; CH:750 (132 = « Rulings orchestrateur »).

**D-37 — L94 (nouvelle), Q-B1 — 1ʳᵉ question**
- Après : « | Q-B1 | **TSLAx `inconclusive`** (`not_full_pages` persistant après r3 et r4 ; 8 783 pages, N_exact 8 782 993) : (a) run de complétion `--allow-short-pages` sur le même répertoire (~2-3 appels ; commit de la page courte puis l'ancre de fin C-8 décide la complétude ; irréversible pour ce run) ; (b) clore ici (inconclusive, ledger ancré) ; (c) lot de code « page courte + page suivante vide = finale » (G1/G2/G7 puis rejeu). Hypothèse orchestrateur, vérifiable par (a) : la page courte est la VRAIE fin (344 slots avant `oracle_slot`) | la fin du mint TSLAx (mint_end + ancre) et donc la suite de la course Bell | ».
- Sources : CH:816-819 (options (a)/(b)/(c) et hypothèse verbatim résumée) ; CH:818 (`--allow-short-pages` = décision investisseur, porte à sens unique).
- Ordre : en tête parce qu'elle bloque le seul chantier arrêté faute de décision (Bell) ; proposition, l'ordre final est à l'orchestrateur.

**D-38 — L95 (nouvelle), Q-B2 — 2ᵉ question**
- Après : « | Q-B2 | **Suite du tirage après le ratio hors bande** (131-bis : 8 783 pages vs projection 3 674, max 4 711 ⇒ 2,39 ; bande ±30 %) : poursuite vers AAPLx ou non — options [à former par l'orchestrateur, chiffres à l'appui] | AAPLx → NVDAx → SPYx (STOP mécanique déjà appliqué) ; cycle Helius jusqu'au 19/10 (décision 125 : jamais chevaucher) | ».
- Sources : CH:756 (131-bis : « hors bande ⇒ STOP + retour investisseur avec les chiffres ») ; CH:819 ; CH:642. CHANTIERS ne forme d'options que pour la complétude TSLAx (Q-B1) : les options de Q-B2 ne sont pas inventées ici.

**D-39 — L96 (nouvelle), B-verdict**
- Après : « | B-verdict | Au verdict Bell : lecture Helius n°3 (tableau de bord, par méthode) ; révocation de la clé Helius de course | la publication du verdict Bell | ».
- Sources : CH:820 ; CH:756 (« Il ne reste a l'investisseur que la revocation de la cle Helius au verdict ») ; CH:641 (condition (4)).

**D-40 — L97 (nouvelle), Q-C1 CoinGecko**
- Après : « | Q-C1 | **Listing CoinGecko** (`docs/token/DOSSIER-COINGECKO-MONARK.md` §5, 8 actes) : préalable = contrôle du compte X `x.com/usemonark` (post public de vérification) ; Regular Pass (jusqu'à 5 j) ou Fast Pass (1 000 $, non remboursable, réponse sous 24 h) ; tout paiement = go explicite | le listing CoinGecko (hors chemin du release) | ».
- Sources : `docs/token/DOSSIER-COINGECKO-MONARK.md:439-476` (liste fermée des actes, préalable bloquant `x.com/usemonark`), `:335-347` (prix Fast Pass, cité verbatim par le chercheur depuis la FAQ CoinGecko — niveau pour ce worker : repris du dossier, non relu à la source), `:301` (Regular Pass jusqu'à 5 jours ; la gratuité n'est pas affirmée ici, le dossier la tient pour non confirmée, `:358`).

**D-41 — L98 (nouvelle), Q-D1 dépôt public**
- Après : « | Q-D1 | **Dépôt GitHub PUBLIC temporairement** (décidé par l'investisseur le 22/09 ~18:1x UTC, pendant le blocage de la CI privée : « recent account payments have failed ») : repasser PRIVÉ quand l'investisseur le décide | rien (la CI tourne en public) | ».
- Sources : CH:784 ; CH:808 (« depot PUBLIC temporairement (investisseur) — a repasser PRIVE quand l'investisseur le decide »).

**D-42 — L99 (nouvelle), C-7 parcours visuel**
- Après : « | C-7 | Parcours visuel du site en ligne (`/narabi`, `/ukemi` ; résiduel C-7 : pilule Narabi client-rendue) | rien (à sa convenance ; résiduel nommé au G7 SITE) | ».
- Sources : CH:733 ; G7:site-release-1:33.

**D-43 — L79 → L101, Plus tard, colonne Quoi** [hors liste en partie]
- Avant : « mot de passe SMTP (au déploiement Narabi) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) ».
- Après : « ~~mot de passe SMTP~~ (posé par l'investisseur au déploiement de la sonde Narabi sur le VPS Bell, 21/09, `a0f1183`) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) ; rapprochement Chainstack de comptabilité après le release (décision 129 : deux lectures sur place) ; renouvellement Chainstack avant le 19/10 (dû du 20/09, état non consigné depuis) ; purge de la ligne exposée de `ConsoleHost_history.txt` (dû du 21/09, état non consigné depuis) ».
- Sources : SMTP = CH:283, CH:520-521, commit `a0f1183` ; 129 = CH:703 ; renouvellement = CH:207 + `docs/BASCULEMENT-COMPTE.md:82` ; purge = CH:521 (aucune clôture trouvée : `grep -rln ConsoleHost docs/` ⇒ seul CHANTIERS) — O-12.

### §7 Agents en vol
**D-44 — L82 → L104, ligne « En vol »**
- Avant : « En vol (14:12 UTC `date -u`) : **NARABI EN LIGNE** (monarkgate.tech/narabi + /ukemi, deploiement `db14e8a`, G7 SITE `b90efba`). **BELL go-2 EN COURS** : tirage TSLAx lance 14:12 UTC (pid 66840, cap 254 670 cr, ~0,5 page/s), ancres probe_end `c05e37c` + mint_start-TSLAx `e12ee3a` (OTS pendantes, poussees) ; go-1 : 36+8 appels, 800 cr derives, projection Sigma max 274 k cr. **UKEMI** : prereg commite SEUL `9e095a0` (sha 770413d9), floor n2 12 916 RU, discover echoue au temoin (pocket elague, brut non ecrit) -> lot U-4b-1b-2 (reducteur de selection + prober parametre + discover corrige) en G1, checkpoint-1 APPROUVE-AVEC-CORRECTIONS (C-1..C-9 transmises). G7 du jour : U-4b-1b-1 `761839f`, GARDE-HELIUS-1b `54c8255` (857/857/0/0), SITE-RELEASE-1 `b90efba` (867/867/0/0). Decisions 130 (gos permanents) et 131 (go-2 : bande +/-30 %, arret frontiere 14 %). **Aucune question investisseur en attente** ; prochain acte investisseur : lecture du ratio N_exact/N_projete a la frontiere TSLAx+AAPLx (je l'apporte). »
- Après : voir `TABLEAU-DE-BORD-draft.md:104` (verbatim). Contenu : littéral « [à compléter par l'orchestrateur] » pour `date -u` + liste exacte ; agents déclarés en vol à 19:18 UTC ; re-cp-2 et G2-delta 1d rendus (`1be4a34`, `60b54c0`) ; cp-1 A-9 rendu ; R-1 Opus 5.5 conforme ; Narabi en ligne ; Bell TSLAx arrêté (`inconclusive`, 8 783 pages, N_exact 8 782 993, ratio 2,39, STOP avant AAPLx, escalade) ; aucun tirage en vol ; ancres ; Ukemi phase keyless 0 RU ; prereg v2 ; floor 12 916 RU ; 13 G7 du 22/09 ; décisions 130-134 ; dépôt public + CI #88 ; « Questions investisseur en attente : §6 Q-B1 d'abord ».
- Sources : CH:824 (liste déclarée) ; `1be4a34`, `b130852`, `60b54c0` (CH:826-827) ; CH:731-733 ; CH:816-820 ; `ANCHORS.md:37-46` ; CH:771-772 ; D-18 ; D-01 (13 G7) ; CH:731, :746-747, :750, :756, :768, :788-790, :811-814, :821-822 ; CH:784, CH:808, `docs/traces/narabi-ops-1d/README.md:9,12`. Retirés car périmés : « pid 66840, ~0,5 page/s » (tirage arrêté, CH:818) ; « aucune question investisseur en attente » (CH:816, :819) ; « prochain acte : lecture du ratio (je l'apporte) » (fait, CH:819) ; « 36+8 appels, 800 cr dérivés » (O-5).

**D-45 — L83 → L105, ligne « Règles »**
- Avant : « Règles : tout worktree de code reçoit `F:/tmp/g2-garde2bi/mk-nm.ps1` et se retire par `rm-nm.ps1` (jamais `Remove-Item -Recurse`). HORS portée (119) : course Bell + C-F-4, U-6, site, DNS, achats. Firecrawl : UUID `6fa0ba96-…` posé dans les 22 agents, effet au REDÉMARRAGE (aucun lecteur/chercheur avant). »
- Après : voir `TABLEAU-DE-BORD-draft.md:105` (verbatim) : phrase mk-nm/rm-nm inchangée ; roster 133 (`claude-opus-5-5`, effort `max` explicite ; R-1 vérifié à chaque worker, premier contrôle CONFORME `60b54c0`) ; Firecrawl « en effet (restart fait) » ; gos permanents (130), go-2 (131) ; restent hors portée (119) : U-6 live, go DNS Bell, tout achat ou action de compte.
- Sources : CH:812-814, CH:822, CH:827 ; UUID constaté dans la liste d'outils différés de cette session worker (`mcp__6fa0ba96-ab74-44be-99f9-71b6aa5a577a__firecrawl_*`) ; CH:732 (130) ; CH:746 (131) ; CH:562 (liste hors portée de 119, verbatim « course live U-6 ; … go DNS Bell ; tout achat ou action de compte ») ; `docs/PLAN-u4b-prereg.md:359`.

**D-46 — L84 → L106, ligne « À faire (temps 1) »**
- Avant : « À faire (temps 1) : 2b-ii G2‖cp-2→G7 → 2b-iii idem → prereg committé seul → floor lu sur place → course U-4b-1b (GO 119) → U-4b-2 → U-5 → U-6 (go conditionnel pré-enregistré, 122) → U-7 → clôture (carto diff, K-1, g3-site, Linux) → site (relecture conjointe) · E-5 : run réel 22/09 00:41 UTC · Bell (temps 2, chevauché — 122) : 1b dès 2b-ii fusionné → G0 course (2 questions) → course → b2. Consigne standard G1 : `docs/CONSIGNE-STANDARD-G1.md` citée dans chaque mission. »
- Après : voir `TABLEAU-DE-BORD-draft.md:106` (verbatim).
- Sources : CH:807-809 (pli -1b-3 puis G2-delta ‖ re-cp-2 → G7 → fill-ts → select → check-version → course) ; CH:703 (hors-ligne puis -2b/U-5/U-6/U-7 sans attendre le reconcile) ; CH:760 (U-5b) ; CH:766 (A-9 → U-5b) ; CH:783, CH:803, CH:829-830, CH:834 (1d : brouillon d'amendements ADR puis G7 + fusion locale (b) ; pli §11-1 amendé C-G2D-1/C-G2D-2 + 2ᵉ redéploiement post-course) ; CH:756, CH:819 (Bell) ; CH:634 (B-code, déclencheur « avant la publication du verdict ») ; CH:742 (`ots upgrade` avant publication) ; CH:802 + `58a1ff0` (A-11) ; `60b54c0` diff de `docs/CONSIGNE-STANDARD-G1.md` (A-12). Retirés car faits : 2b-ii/2b-iii (`fec2848`, `3c6afde`), prereg (`9e095a0`/`a75dbf1`), floor (D-18), 1b (`54c8255`), G0 course (`f5314e7`), E-5 (`7801083`).

## 3. Couverture des faits de la mission (chacun vérifié, jamais recopié de la mission)
| Fait de la mission | Vérifié dans | Reflété en |
|---|---|---|
| G7 U-4b-1b-1 `761839f` | `git log` + G7:u4b-1b-1:1 | D-17 |
| G7 GARDE-HELIUS-1b `54c8255` | `git log` + G7:garde-helius-1b:1,6 | D-02, D-27 |
| G7 SITE-RELEASE-1 `b90efba`, Narabi LIVE | `git log` + G7:site-release-1 + CH:731-733 | D-11, D-28, D-33 |
| G7 U-4b-1b-2 `eda73ca` | `git log` + G7:u4b-1b-2:1,6 | D-19 |
| G7 BELL-RETRY-1 `b9b207b` (fusion `4db059e`) | `git log` + G7:bell-retry-1 + CH:770 | D-05 |
| G7 U-5a `0f989a9` (fusion `a050f75`) | `git log` + G7:u5a | D-24 |
| G7 UKEMI-RETRY-1 `f6442fe` | message de fusion + CH:774-779 | D-20 |
| NARABI-OPS-1d rebasé `e12f59f`, G2/cp-2, pli `7daf8e5`, G2-delta ‖ re-cp-2, CI #88 | CH:781-786, :800-803, :826-834 ; `1be4a34`, `1d4f385`, `60b54c0` (tous deux rendus depuis la mission) | D-12, D-44 |
| U-4b-1b-3 G1 `801859f`, G2/cp-2 rendus, pli en vol | CH:793-798, :805-807, :824 | D-21 |
| Bell go-1 + go-2 TSLAx r1..r4, 3 × NonJsonBody + page courte, 8 783 p., N_exact 8 782 993, `inconclusive`, ratio hors bande ⇒ STOP avant AAPLx, escalade | CH:737-748, :757, :770, :816-820 ; ANCHORS.md | D-04, D-37, D-38, D-44 |
| Décisions 130..134 | CH:731, :746, :750, :768, :788 | D-36, D-44, D-45 |
| Roster Opus 5.5 `claude-opus-5-5` | CH:811-814, :821-822 ; `a872716`, `50f6d12` | D-01, D-30, D-45 |
| CoinGecko dossier | `831a87b`, `606b80b`, dossier §5 | D-34, D-40 |
| Dépôt GitHub public temporairement | CH:784, :808 | D-41, D-44 |
| §6 mise à jour dans l'ordre | — | D-35..D-43 |
| §7 : « [à compléter par l'orchestrateur] » | — | D-44 |

## 4. Observations — items formés pour l'orchestrateur (propriétaire : orchestrateur ; déclencheur : commit de ce tableau)
- **O-1 (horodatage CHANTIERS)** : titres postérieurs aux commits qui les introduisent — `:788` « 18:3x UTC » vs `3631b60` 18:28:55Z ; `:800` « 19:0x UTC » vs `58a1ff0` 18:46:59Z ; `:805` « 19:1x UTC » vs `a41331b` 18:58:50Z ; `:808` « 19:1x UTC » idem ; `:811` « 19:5x UTC » vs `a872716` 19:02:53Z. Méthode : `git blame -L 746,824 --date=iso docs/CHANTIERS.md` + `TZ=UTC git log`. Même classe que la correction d'horloge CH:616. Les heures TSLAx (19:08:00, 19:12:08 ; ancre 19:11:46Z = commit `5a7c066` 19:11:46Z) concordent. **Mise à jour 19:50** : l'erratum CH:832 (`60b54c0`) corrige `:800`, `:805` et `:811` ; restent non couverts `:788` (« 18:3x » pour un commit à 18:28:55Z, écart mineur) et `:808` (« Etat au restart (19:1x UTC) », commit `a41331b` à 18:58:50Z).
- **O-2** : aucun `docs/G7-lot-ukemi-retry-1.md` (les 12 autres G7 du 22/09 ont le leur) ; le G7 vit dans CH:774-779 et le message de `f6442fe`. Fait rapporté, non jugé.
- **O-3 (défauts de forme du tableau figé, corrigés dans le brouillon)** : ligne vide dans le tableau §1 (D-07) ; -1b-ii-b à 3 cellules sur 4 (D-09) ; GARDE-HELIUS-2 à 4 cellules sur 3 (D-14) ; octet 0x0C dans la ligne F-1 (D-35).
- **O-4 (CHANTIERS, non corrigé — mission en lecture seule)** : 8 lignes portent des caractères de contrôle issus d'antislashs mangés (`\b` de « \bell », « \book » ; `\a` de « \apps ») : CH:106, 110, 125, 127, 203, 207, 208, 209. Mesure : `LC_ALL=C grep -n -P '[\x00-\x08\x0B\x0C\x0E-\x1F]' docs/CHANTIERS.md`.
- **O-5 (chiffres go-1)** : le §7 figé disait « go-1 : 36+8 appels, 800 cr derives » ; CH:740 donne sonde 36/150 appels, 360 cr pire cas (ledger de cycle `credits_derived = 360`) puis point (a) « 44/150 appels, 440 cr worst-case ». « 800 » (= 360 + 440 ?) n'est pas reproductible depuis les documents lus ; le brouillon porte les chiffres de CH:740, lus comme cumulés (44 = 36 + 8, cohérent avec le « 36+8 » du §7 figé). À trancher contre `F:\monark-ledger\helius-2026-09-19\helius.jsonl` (non lu : hors périmètre « docs seuls »).
- **O-6 (nomenclature r1..r4)** : seuls « r3 » et « r4 » figurent en toutes lettres (CH:817-818). Correspondance retenue : r_k = run lancé après l'ancre mint_resume-k (`ANCHORS.md:42` f7b7bc5, `:44` ca05c1c, `:45` 88cb5f9, `:46` 5a7c066) ; `:43` (34ba979) = doublon non horodaté (collision de nom `.ots`) ; le run initial part de mint_start (`:38`) et n'est pas numéroté. Arrêts : run initial 201 p., r1 827 p., r2 4 571 p. (NonJsonBody), r3/r4 page courte.
- **O-7 (ANCHORS.md, non corrigé)** : `:45` a 9 cellules pour un en-tête à 8 colonnes (époque retry ajoutée en 9ᵉ cellule) ; `:6` cite `G0-lot-t1a-ii-b3d-course.PLIE.md`, alors que le G0 plié est `docs/G0-lot-t1a-ii-b3d-course.md` (`f5314e7`).
- **O-8 (R1, §1)** : la condition de la décision 97 (« après -b3d-b1 ») est remplie depuis `2c717f8` (b1a) et `f459cc2` (b1b) ; statut laissé « À VENIR » (l'ordonnancement relève des décisions 117/122, donc de l'orchestrateur).
- **O-9 (LANG-GATE-CI, « premier run Linux »)** : des runs GitHub Actions ubuntu existent sur la PR #88 (35763895313, 35769452047 : `docs/traces/narabi-ops-1d/README.md:9,12`). Les extraits ne montrent pas l'étape `lang:gate` du job r25 : cellule laissée inchangée. À vérifier sur le run.
- **O-10** : le décompte « 16 lots fusionnés le 21/09 » de l'en-tête figé n'est pas recalculé (retiré) ; un grep naïf des G7 du 21/09 surcompte (messages en double).
- **O-11** : l'en-tête figé (21/09 18:05 UTC) n'avait pas été rafraîchi au commit `e60ea07` (22/09 14:12 UTC).
- **O-12 (dus ressortis)** : renouvellement Chainstack avant le 19/10 (CH:207, `BASCULEMENT-COMPTE.md:82`) et purge de `ConsoleHost_history.txt` (CH:521) étaient absents du §6 figé ; aucune clôture trouvée (`grep` sur `docs/`). Portés en « Plus tard » avec « état non consigné » : à confirmer ou à barrer.
- **O-13** : ligne E-5 « reste : tir suivant de la sonde Bell (`healthy`, boîte vide) » laissée inchangée (aucune consignation postérieure trouvée : `grep -n -i healthy docs/CHANTIERS.md` ⇒ :271, :294 seulement).
- **O-14** : le titre « §1 Bell (chemin critique du release) » est conservé (structure) alors que Bell est au temps 2 (117). À renommer, au choix de l'orchestrateur.

## 5. Littéraux laissés à l'orchestrateur (voulus par la mission ou non établis par les sources)
L3 `date -u` au commit ; L104 liste exacte des agents en vol ; L95 options de Q-B2 (non formées dans CHANTIERS). (Deux littéraux du premier jet sont levés : état du G2-delta 1d — rendu `60b54c0` ; worktree A-9-OUTILLE — `F:\Monark-wt-a9outille`, constaté par `git worktree list`.)

## 6. Vérifications de sortie (commandes rejouables)
- `wc -l F:/tmp/tdb/TABLEAU-DE-BORD-draft.md` ⇒ 106 ; `sha256sum` ⇒ `4c8a3fbe370827dde68a2a5160f2854ca46e8e1e8ef680e32e44b788a9aed220` (état final, 19:54 UTC, HEAD `60b54c0`).
- `file …draft.md` ⇒ « Unicode text, UTF-8 text, with very long lines » ; `LC_ALL=C tr -cd '\r' < …draft.md | wc -c` ⇒ 0 (LF seul) ; `head -c3 … | od -An -tx1` ⇒ `23 20 54` (pas de BOM) ; `LC_ALL=C grep -c -P '[\x00-\x08\x0B\x0C\x0E-\x1F]' …draft.md` ⇒ 0.
- Cellules par ligne de tableau (`awk -F'|' '/^\|/{print NF-2}' | sort | uniq -c`) ⇒ 8 × 2 (§5), 32 × 3 (§3 + §6), 42 × 4 (§1 + §2 + §4) : aucune ligne mal formée.
- `git -C F:/Monark status --porcelain` ⇒ vide (aucune écriture dans le dépôt).
