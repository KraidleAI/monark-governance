# CHECKPOINT-2 (LIVRABLE) — lot E-honnêteté, gel `6e07274` (base `ac04d41`, régime site T0)
Rapport du validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS (V-1..V-4, liste fermée) ; aucune escalade.**

## Oracle rejoué (copie `git archive 6e07274`, `npm ci` 282 pkgs, tout sous `F:\tmp\cp2-ehonnetete\`, rien sur C:)
`npm run ci` : gate:vocab 156 · tsc 0 · **328/328** ; lint 0 ; ratchet 69/69 ; lang-gate `root,contracts,schemas,site,skills,sentinel,bell` 0 hit (`sentinel`/`bell` GATED) ; export:check 0 ; oracle racine seul 2/2 ; R-25 `ac04d41..6e07274` pathspec `ci.yml:52` **203** (D9 septies : 192). Diff : 12 fichiers, +380/−18, deux commits `site[T0]`.
**E7 ×6** : diff mesuré site par site = exactement les six d'ADR-EC C-2 (`README:48,111,112`, `shogen-panel:51,57`, `fleet-presentation:33`) ; `:63` intouché ; « proves » `:57` borné + désaveu — licite ; « signed » = revendication d'origine (`attestor[].key`, contrôle TLSN délégué, résidus portés) — licite. CA-2 : doctrine mesurée ADR-M012 l.61 / ADR-B0:69, aucune décision de valeur nouvelle.
**Oracle racine `public_surfaces_make_no_probative_claim`** : census indépendant 19 occurrences = 4 négations + 15 spans du masque relus 1:1, 0 résidu (piège `**` non-glob de git mesuré : 16 vs 19 — l'archive fait foi) ; mutants M1 README:111 `verified`, M2 SKILL « verified testimony », M3 « proven » how/page, M4 capitale, M5 multi-ligne ⇒ tous rouges (fail-closed) ; M6 « validated/guaranteed » vert (hors motif, attendu ; census des synonymes : aucun surclaim).
**Skill/DEMO vs code** : chaque phrase de « The `gate` envelope » confrontée à `gate.ts:538-613`, `attestation-binding.ts:48-49`, `gate.test.ts:695-709` — conforme ; `INTEGRATION.md` intouché justifié.
**E8** : `MONARK_PHASE` 0 importeur (seule occurrence = liste `SYMBOLS` du census + sortie stale, O-3).
**C-11 i (`sentinel`/`bell`) — correction V-1** : Ma/Mb (français dans src) ⇒ test 42 rouge ; Mc (scopes retirés) ⇒ rouge fail-closed ; Me (français dans un test bell) ⇒ rouge (faux-rouge possible, O-6) ; **Md — FAUX-VERT MESURÉ** : retrait de la branche `classifyScope` `apps/bell` (SCOPES intacts) + français dans `apps/bell/src/digest.ts` ⇒ hit classé `root`, non sélectionné par l'appel source-tree ⇒ lang-gate rc 0 ⇒ **test 42 VERT**. Asymétrie : `sentinel` est attrapé par l'appel export (exporté), `bell` seul est fail-open (non exporté). Aucun test n'épingle `classifyScope`/`SCOPES`. Mode MAST « faux-vert de garde » d'ADR-EC.
**C-11 iv/vi** : ADR-M002:166 « 49,1 % » = calcul analytique de première main ([abs] acceptable) ; « 35 % » vs « 35,3 % » = O-2 ; README:98 + shogen-panel:47 « execute · upcoming » ; prose de patron README:16/page.tsx:72/roadmap:50 licite (item formé G1 §11) ; board.tsx corrigé sur `bd3fa0a`.
**Amendement ADR-M018 D2** : bloc identique mot à mot à ADR-M019 l.78-81 ; original l.22 intact ; `error_origin = planificateur`. **Mais** le G2 §8 cite `DECISIONS-investisseur-2026-09-19.md` §23 — **fichier absent** (dépôt et F: profondeur 3) ; l'enregistrement réel = `CHANTIERS.md:67` + ADR-EC Q3, sans verbatim investisseur ⇒ V-2.
**T0 / CA-11** : `fleet.ts` blob `f770e19` identique ; aucune pièce « built » nouvelle ; tuyaux ADR-EC présents et rejoués.
**Fusions** : merge-tree `6e07274` vs `bd3fa0a`, `4a15e5b`, `e8bcfe4`, `88c3324`, et base courante `e51564e` ⇒ rc 0 tous ; **arbre composé** etude-suite + e-honnêteté + e-registre + u-1b-a : `npm run ci` **340/340**, lang-gate 0, export:check OK, lint 0, ratchet 69/69.
**O-2..O-11 sous décision 21** : code bloquant = O-5 (présent à `bd3fa0a:55`, fermé par E-registre), **O-7 + O-10 = V-4** ; non bloquants : O-6, O-2/O-3 (docs), O-11 ; **O-4** = plier maintenant (ADR-M019 l.4/l.76 « à ratifier » et l.38 « MONARK_PHASE conservé » périmés).

## Checklist
CA-1/2/3 conformes ; CA-4/5 n-a ; CA-6 conforme ; CA-7 conforme sous V-1..V-4 ; **CA-8 correction V-2/V-3** ; CA-9 conforme ; CA-10 conforme ; CA-11 conforme.

## Corrections (liste fermée)
- **V-1 (code, test seul, bloquant décision 21, avant G7)** : épingler le routage de `lang-gate.mjs` — assertion (test 42 ou test dédié important `classifyScope`/`SCOPES`) que `classifyScope("apps/bell/src/x.ts") === "bell"`, `classifyScope("apps/sentinel/src/x.ts") === "sentinel"`, `SCOPES` contient les deux ; mutant Md rejoué rouge consigné ; G2 fraîche sur le delta. `error_origin` : worker (routage non épinglé) + miss relecteur G2 (Ma/Mb rejoués, pas Md).
- **V-2 (docs)** : (a) G2 §8 citation fantôme → enregistrement réel ou chemin hors dépôt (`error_origin` relecteur) ; (b) amendement ADR-M018 D2 : où la décision 23 est enregistrée ; (c) verbatim investisseur de la décision 23 versé par l'orchestrateur.
- **V-3 (journal, clôture)** : entrée JOURNAL-PROVENANCE avec gel, oracle, R-25, `error_origin` (C-1 `shogen-panel:47` orchestrateur ; prémisse ADR-M018 l.22 planificateur ; census ADR-EC C-1 sous-mesuré (3 négations vs 25 occurrences) orchestrateur ; V-1 worker + relecteur) ; O-4 plié au G7.
- **V-4 (code, bloquant release, déclencheur ≤ cartographie D2)** : étendre `surfaces()` de l'oracle racine aux READMEs exportés (`apps/harness/README.md`, `apps/sentinel/README.md`, `packages/*/README.md` ; span à masquer mesuré : `packages/atelier/README.md:22` « mutant verified ») et `.mdx` à `EXTS`, avec mutant — pliable dans le delta V-1.

## AM-1
Attrapé : mutant Md fail-open (non vu par G2) ; citation fantôme du G2 ; base mobile pendant le checkpoint (re-mesuré sur `e51564e`).
Preuves AM-2 : `git status --porcelain` 0 avant/après ; 13 blobs du gel identiques ; écritures sous `F:\tmp\cp2-ehonnetete\` seulement (AM-2 ter, ratification due).

---
## Suite donnée par l'orchestrateur
V-1 + V-4 = lot **E-honnêteté-2** (worker Opus 4.8 sur `lot/e-honnetete`, G2 fraîche sur le delta, puis G7) ; V-2 (a)(b)(c) pliées par l'orchestrateur (verbatim décision 23 = « 3. ta reco » du message investisseur « 1. b 2. ta reco 3. ta reco 4. ok pour la lecture 5. ta reco », 2026-09-19 — enregistré dans CHANTIERS §E et l'amendement ADR-M018 D2) ; V-3 + O-4 au G7. E-registre fusionné en premier (`3f2f19c`, fichiers disjoints, arbre composé 340/340 mesuré par le validateur).
