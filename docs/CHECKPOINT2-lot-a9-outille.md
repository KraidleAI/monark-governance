# Checkpoint-2 A-9-OUTILLE (649db8b) — ACCEPTE-AVEC-CORRECTIONS (C-V-1 ADR au dépôt)

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (LIVRABLE) — lot A-9-OUTILLE, `lot/a9-outille` @ `649db8b` (base `b130852`) — avis du validateur-humain

## 1. Artefacts lus et chemin de rejeu

- Lus : `F:\Monark\docs\CHECKPOINT1-lot-a9-outille.md` (mes C-1..C-8), `F:\Monark\docs\G1-lot-a9-outille.md`, `F:\tmp\a9outille\{DELIVERED.sha256, mutants.mjs, ADR-amendement.md, work\{check-head-hits, served-bytes-invariance, run-proofs}.mjs, logs\proof-*.log, logs\final\exits.txt}`, `F:\tmp\g2-garde2bi\mk-nm.ps1` ; diff intégral `b130852..649db8b` (11 fichiers, 391+/18−) ; `package.json` scripts et `.github/workflows/ci.yml` (l.65 pathspec, l.110-111 job g3) sur `649db8b`. Le fil du planificateur et le G2 en cours n'ont pas été lus (contexte frais).
- Rejeu (AM-2 ter) : `F:\tmp\cp2-a9outille\tree` = `git clone --no-hardlinks --branch lot/a9-outille` (HEAD `649db8b`), `node_modules` par `mk-nm.ps1` (`entries: 220 monark: 10 fail: 0`, `@monark/rpc-guard` résolu dans le clone — dispositif fourni par l'orchestrateur, junctions sur `F:\Monark\node_modules`, limite déclarée). Scripts du worker recopiés et repointés (`WT` → clone ; `HEAD:` → `b130852:`) : `F:\tmp\cp2-a9outille\{mutants.mjs, served-bytes-invariance.mjs, check-head-hits.mjs, probe.mjs}`. `env -u` des 8 clés, `TEMP/TMP/TMPDIR=F:\tmp\cp2-a9outille\os-tmp`.
- **Preuve d'innocuité** : `F:\Monark` `git status --porcelain` = 0 ligne AVANT et APRÈS ; `lot/a9-outille` = `649db8b` AVANT/APRÈS ; `F:\Monark-wt-a9outille` HEAD `649db8b`, status 0 AVANT/APRÈS, `sha256sum -c DELIVERED.sha256` 11/11 OK sur son disque ; les 11 blobs de `649db8b` = `DELIVERED.sha256` 11/11. **`lot/etude-suite` est passé de `0440b23` à `153582f` pendant ce checkpoint** — cause : deux commits de l'orchestrateur (`50f78b0` décision 137, `153582f` TABLEAU-DE-BORD), tous sous `docs/` ; aucun acte de ma part.

## 2. Checklist

**CA-1 (critères falsifiables)** — CONFORME. Chaque livrable reformulé au cp-1 a sa réponse localisable et rejouée ci-dessous (règles, CLI file:line:word, composition servie, CI, oracle, ADR, rendu+sha).

**CA-2 (valeur)** — CONFORME. Aucune phrase servie réécrite ; les 9 hits levés sur les blobs `b130852` sont tous des commentaires (rejoué `check-head-hits`: schema-projection 41, attest 7/29, gate 162/174, ukemi-predict 20/56/205, calibrate 19 ; 0 hit après). L'escalade conditionnelle C-2 n'est pas déclenchée.

**CA-3 (ADR de rattachement ; gates)** — **CORRECTION (bloquante pour la fusion)**. L'amendement ADR (D-A9-1..5, tuyaux, MAST, items formés) existe seulement dans `F:\tmp\a9outille\ADR-amendement.md`. `git grep A-9-OUTILLE -- docs/adr` = vide sur `649db8b` **et** sur `153582f`. Ma C-7 et CA-11 (« chaque ADR de lot déclare ses tuyaux ») exigent le dépôt. Gates : aucun suspendu (six scripts rejoués verts).

**CA-4 / CA-5** — CONFORME. Un seul worker ; MAST nommés dans l'amendement (vérification incorrecte → assertions d'absence + 13 mutants attribués ; dérive de périmètre → invariance des octets servis) — à condition que l'amendement entre au dépôt (CA-3).

**CA-6 (oracle ET revue)** — CONFORME sous réserve. Oracle re-exécuté par moi dans le clone : `gate:vocab` 0 (`scanned 220 file(s), no forbidden claim`), `typecheck` 0, `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0, `test` 0 = **925 tests / 924 pass / 0 fail / 1 skip** (`u4b_labels_replay_via_main_real_artifact`, artefacts gitignorés = C-6). Le G2 tourne en parallèle : cette acceptation vaut **sous réserve du G2 rendu**, jamais seule.

**CA-7 (zéro dette)** — CORRECTION (même item que CA-3). Items formés 1 (rejeu U-5b sur `ukemi-predict`), 2 (refus composés `packages/monark`), 3 (`instructions`), 5 (modulo `%`) sont formés avec déclencheur — mais hors dépôt. Item 4 (CONSIGNE A-1 → `claude-opus-5-5`) est déjà clos sur `etude-suite` (`docs/CONSIGNE-STANDARD-G1.md:6`). L'item `CHANTIERS.md:766` reste ouvert et doit être remplacé par l'item 1.

**CA-8 (provenance)** — CONFORME sur ce qui est vérifiable : G1 première ligne `claude-opus-5-5[1m]` (conforme décision 133) ; générateur Opus ≠ relecteur (orchestrateur Fable R-21, G2, ce siège) ; aucun incident ⇒ `error_origin` n-a ; le journal formel relève du G7.

**CA-9 (vérification imposée par le système)** — CONFORME, rejouée : 13/13 mutants tués par le test attendu (TAP `not ok`), 13/13 restaurés byte-exact, codes CLI = attendus (`F:\tmp\cp2-a9outille\mutants-cp2.log`) ; sonde regex **indépendante** de la logique du test (`probe.mjs`, 29 sondes) : jumeaux rouges `Shōgen-verified` sans `committed`, `re-verified` sans `not`, `previously verified` sans `committed,`, `the accuracy`, `a/the probability`, `95%`/`95 %`/`0.5%`/`12 per cent` ; verts `not re-verified`, `committed Sh[ō|o]gen-verified`, `never a/not a/no probability`, `seed, n, accuracy`, `verifier verification verify`, `percent` nu, `interval` ; V5 = 3 hits `verified/probability/95%`.

**CA-10** — CONFORME. R-25 recomputé avec le pathspec verbatim de `ci.yml:65` sur `b130852..649db8b` : **11 fichiers, 391+/18− = 409** ; `git merge-base 0440b23 649db8b` = `b130852` (le chiffre du CI réel sera le même). Aucun argument de vitesse.

**CA-11 (branchement, composition exécutée)** — CONFORME.
- Tuyau statique : `package.json` `ci` = `gate:vocab && typecheck && test` ; `ci.yml:111` job g3 `npm run gate:vocab && npm run typecheck && npm test` (lu sur pièce) ; état `vocab-banned.json` `scan.harness` (4 règles + 8 exemptions fermées) ; test `a9_harness_static_scope_wired_and_clean` prouve `collectTargets` câble chaque fichier harness et que la suppression du scope le décâble (mutants `scope-harness-removed-{config,code}` tués).
- Tuyau servi : `harness_tool_descriptions_pass_vocab` et `harness_served_honesty_carriers_pass_vocab` lisent la **réponse réelle** `tools/list` / `tools/call` via `createHarnessHandler().fetch` (SDK in-process, toutes les feuilles chaîne, 11 appels dont 6 branches d'honnêteté, liage texte servi === carrier) — c'est une composition exécutée depuis l'artefact réel, pas un test de forme (CA-11 durci). Mutants `schema-description-probability`, `demonstrative-label-accuracy` (texte né hors `apps/harness/src`, CLI exit 0, seul le scan servi l'attrape), `honestytext-liq-composed-percent`, `registry-served-text-unbound` tués.
- Consommateur réel : `npm run ci` / job g3. Tuyau annoncé et manquant : aucun (le rejeu `ukemi-predict` est l'item 1, déclencheur U-5b).

**C-2 spécifiquement (invariance des octets servis)** — CONFORME, rejouée : émission TS sans commentaires `b130852` vs lot byte-identique pour les 5 fichiers (`ALL_EMITTED_EQUAL=true`) ; `probe_harness_records_real_decision` **vert dans mon run** (trace vivante `tools/list`+`tools/call` == trace committée, pin h5 `4ad9b340…` intouché — `test/h5-e2e-probe.test.ts` et `fixtures/` absents du diff). **C-3** : composition depuis le vrai `tools/list`/`tools/call` (ci-dessus). **C-4** : 8 exemptions fermées épinglées, jumeaux rouges (rejoués), `exemptPhrases` absent du scope (`vocab_adaptive_coverage_reddens` vert inchangé). **C-1/C-5/C-6/C-8** : rejoués verts (`interval` non banni sur fichier + absent des textes servis, mutant `stable-run-uncalibrated-interval` tué ; `confidence` banni une fois ; 1 skip nommé ; un seul fichier de motifs).

**A-6** : 9 sha gelés recomputés sur les blobs `649db8b` = `frozen-before-disk.txt` 9/9. **Anti-close** : n-a (aucun `apps/bell/**` ni `ANCHORS.md` dans le diff ; littéraux de test synthétiques). **Fusion à blanc** : `git merge-tree --write-tree` propre (exit 0) contre `50f78b0` **et** `153582f` ; 27 fichiers avancés sur `etude-suite` depuis la base, tous sous `docs/`, 0 chevauchement avec les 11 fichiers du lot ni `apps/harness/**`.

**Observation non bloquante** : `probabilistic` échappe à `\bprobabilit\w*` (sonde BAD). Pas un trou V5 (« probabilistic guarantee » tombe sur `guarantee`) ; frontière non écrite de D-A9-1 → une ligne « limite déclarée » dans l'ADR, pas une règle nouvelle imposée par ce siège.

## 3. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée), sous réserve du G2 rendu

- **C-V-1 (bloquante avant fusion)** : insérer l'amendement `F:\tmp\a9outille\ADR-amendement.md` dans `docs/adr/ADR-U5a-producteur-ukemi-predict.md` (+ renvoi d'une ligne dans la table MAST de `ADR-M020-programme-ukemi.md`), avec ses tuyaux, MAST et items formés 1/2/3/5 ; remplacer l'item `docs/CHANTIERS.md:766` par l'item 1 (déclencheur U-5b). Sur la branche du lot ou dans le commit de fusion ; `docs/**/*.md` exclu du pathspec ⇒ R-25 reste 409.
- **C-V-2 (une ligne ADR)** : consigner « `probabilistic` hors motif `probabilit\w*` » comme limite déclarée de D-A9-1.

**Fusion AVANT U-5b** : **admissible**, mes trois conditions mesurées vertes — (i) octets servis invariants (émission identique + h5 vert), (ii) 0 fichier `apps/bell/**`/ANCHORS, enregistrement `ukemi-predict` intouché (3 commentaires), (iii) item déclencheur U-5b formé — **conditionnée à C-V-1** (la condition (iii) n'est satisfaite sur aucun artefact committé tant que l'ADR est hors dépôt). Ordre vis-à-vis de HARNESS-DESC-1 (en vol, touche les descriptions harness) : A-9 d'abord (le gate précède ce qu'il gate) ; si HARNESS-DESC-1 fusionne le premier, rejouer `gate:vocab` + tests harness après rebase.

Aucune ESCALADE-INVESTISSEUR : ni valeur nouvelle, ni dérogation, ni divergence connue avec un G7.

## 4. AM-1 — ce que la checklist a attrapé / manqué
Attrapé : amendement ADR et items formés hors dépôt (CA-3/CA-7/CA-11) ; `probabilistic` hors motif ; avance de la branche cible pendant le checkpoint (fusion à blanc rejouée sur le tip courant) ; item 4 déjà clos (non redemandé). Manqué : à signaler par l'orchestrateur a posteriori.

Modèle résolu : claude-fable-5-1
