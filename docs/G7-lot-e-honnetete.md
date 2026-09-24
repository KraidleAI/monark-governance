# G7 — lot E-honnêteté (+ E-honnêteté-2) (ADR-EC D1, régime site T0) — verdict de l'orchestrateur
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel du lot : **`4e752a6`** (base `ac04d41`, branche `lot/e-honnetete`, worktree `F:\Monark-wt-ehonnetete`). Fusionné sur `lot/etude-suite` en **`e756490`** (après E-registre `3f2f19c` ; 0 marqueur de conflit).

## Verdict : **CLOS — ACCEPTÉ**
Chaîne de vérification indépendante (instances séparées, contexte frais) :
1. Livraison worker `claude-opus-4-8[1m]` max `d44b656` (`site[T0]`) → G2 fraîche Opus 4.8 (`docs/G2-lot-e-honnetete.md`, APPROUVÉ-AVEC-CORRECTIONS) → pliage worker `6e07274` → delta revu CONFORME (`96b33f5`).
2. **Checkpoint-2 validateur `claude-fable-5-1` sur `6e07274`** (`docs/CHECKPOINT2-lot-e-honnetete.md`) : ACCEPTE-AVEC-CORRECTIONS V-1..V-4 — **V-1 = faux-vert mesuré** (branche `apps/bell` retirée du routage lang-gate ⇒ test 42 reste vert, Bell non exporté) ; V-4 = oracle racine aveugle aux READMEs exportés.
3. Lot **E-honnêteté-2** (worker Opus 4.8, `fededb7`) : test `lang-gate-routing.test.ts` épinglant `classifyScope`/`SCOPES` (mutant Md rouge, rejoué aussi par l'orchestrateur), `surfaces()` dérivé de `collectFiles(ROOT).kept` + `.mdx` ; G2 fraîche sur le delta CONFORME (`docs/G2-delta-lot-e-honnetete-2.md`, C-1 docs pliée en `4e752a6`).
4. **Checkpoint-2 bis** (`docs/CHECKPOINT2bis-lot-e-honnetete.md`) : ACCEPTE-AVEC-CORRECTIONS, zéro code ; mutant tuyau supplémentaire rouge (CA-11) ; arbre composé 332/332.
5. Fusion `e756490` ; **oracle rejoué sur la fusion réelle (C-3) : 332/332 (rc 0), tsc 0, lint 0, ratchet 69/69, gate:vocab 156 OK, lang-gate 0 sur 7 scopes dont `sentinel`/`bell`, export:check 0 sur 12 scopes** (log `F:\tmp\orch\merged-e756490-ci.log`).

## Provenance / `error_origin` (V-3, C-2)
- C-1 G2 `shogen-panel.tsx:47` « act (execute) » jumeau de README:98 : **orchestrateur** (cadrage C-2 ADR-EC incomplet).
- Prémisse ADR-M018 l.22 « Ukemi non consommé » : **planificateur** (écrite avant la mesure P1).
- Census ADR-EC C-1 sous-mesuré (3 négations vs 25 occurrences) : **orchestrateur**.
- V-1 routage non épinglé : **worker** (générateur) + **relecteur G2** (Ma/Mb rejoués, pas Md, alors que « faux-vert de garde » figure dans la table MAST d'ADR-EC).
- Prémisse « `apps/sentinel/README.md` exporté existant » (V-4) : **validateur** (C-2 checkpoint-2 bis) — corrigée : l'export le silent-skip ; item (a) rédiger = décision investisseur 29, lot CI-site.
- Citation fantôme `DECISIONS-investisseur-2026-09-19.md` (G2 §8) : **relecteur** ; enregistrement réel = CHANTIERS §E + ADR-EC Q3 + ADR-M018 amendement (verbatim « 3. ta reco »).
- Journal : ligne ajoutée à `docs/JOURNAL-PROVENANCE.md`.

## Items formés (déclencheur), zéro dette nue
- **CI-site** (déjà formé par E-registre V-3) reçoit : (a) `apps/sentinel/README.md` (prose anglaise, gatée par l'oracle racine dès son existence — mutant A le prouve).
- **O-1 (checkpoint-2 bis)** : garde indirecte du tuyau `collectFiles → surfaces()` ; déclencheur : premier span LICIT porté par un README exporté ⇒ assertion directe.
- O-2/O-3 (docs « 35 % » vs « 35,3 % », `import-graph.out.json` stale), O-6 (faux-rouge possible sur un test bell en français — fail-closed), O-11 (forward, lot qui câblera D2(i)) : formés, non bloquants (docs / fail-closed).
- **O-4 plié ici** : ADR-M019 — mentions « proposé, à ratifier » (l.4, l.77) et « `MONARK_PHASE` conservé » (l.38) annotées comme périmées (ratifié décision 23 ; E8 a retiré `MONARK_PHASE`).

## Branchement (ADR-M018, CA-11)
Aucune pièce « built » nouvelle ; `fleet.ts` intact (T0). Tuyaux ADR-EC présents et rejoués : prose → README/site/skill gardée par `public_surfaces_make_no_probative_claim` (root + apps/site + skills + READMEs exportés), `export:check`, `gate:vocab`, lang-gate scopes `sentinel`/`bell` avec routage épinglé.
