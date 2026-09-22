# CHECKPOINT-2 U-4b-2a (validateur-humain, 2026-09-22, persisté verbatim par l'orchestrateur)

The diff mismatch is only the path prefix (relative vs absolute); the sha values are identical (`c19a960b…`, `2c3dd3d4…`). Repository and clone are unchanged.

---

**Modèle résolu : claude-fable-5-1**

# CHECKPOINT-2 — lot U-4b-2a (`lot/u4b-2a` @ `1892144`, fourche `f0720ae`)

## 1. Checkpoint et artefacts lus

- **Checkpoint** : LIVRABLE (checkpoint-2), avant verdict G7.
- **Mission** : `F:\tmp\u4b2a-rev\MISSION-G2-CP2-u4b-2a.md`.
- **Plan** : `docs/G0-lot-u4b-2.md` (plié ×2, §0-§15) dans le clone ; rulings Q-NEW-3 (b) / Q-NEW-4 / Q-NEW-5 dans le message de `f0720ae`.
- **Livrable** : diff `f0720ae...1892144` (14 fichiers), lu intégralement (src + tests + fixtures + provenance).
- **Rapport de passe** : `F:\tmp\u4b2a\G1-lot-u4b-2a.md`, `DELIVERED.sha256`, `mutants.mjs`. **Déviation déclarée** : j'ai lu le G1 en entier (artefact permis : rapport de passe) pour en extraire la table des mutants et les items formés ; **aucun chiffre ci-dessous n'est copié du G1 — tous sont re-exécutés**. Le G2 (`F:\tmp\g2-u4b2a\`) n'existe pas encore et n'a pas été lu (CA-9).
- **Rejeu (AM-2 ter)** : clone à historique complet `F:\tmp\cp2-u4b2a\tree` (`git clone --no-hardlinks --branch lot/u4b-2a`, `mk-nm.ps1` : 220 entrées, 10 `@monark`, `require.resolve('@monark/rpc-guard')` → sous le clone) ; harnais et logs sous `F:\tmp\cp2-u4b2a\` ; `TEMP/TMP/TMPDIR=F:/tmp` ; tout oracle et mutant sous `env -u` des 8 clés ; aucune variable d'environnement affichée.

## 2. Vérifications 1-10 refaites

| # | Résultat mesuré |
|---|---|
| **1. Périmètre** | `git diff --name-status f0720ae...1892144` = **14 fichiers**, exactement ceux du §2 (5 M src, 5 A, 4 M re-pins/exclusions). 0 fichier sous `packages/contracts`, `schemas/`, `region.ts`, `verdict.ts`, `apps/site`, `skills/`, README. `HARNESS_VERSION` absent du diff (`version.ts:22` = `"0.4.0"` inchangé). `apps/site/lib/fleet.ts` : 0 ligne de diff, `Ukemi status: "built"` (`fleet.ts:156`). `ALLOWED_TOOL_NAMES` = 4 outils (`registry.ts:32`). Aucun fichier `docs/` dans le diff (voir C-1). |
| **2. Oracle branche** (`npm run ci` sous `env -u`) | exit 0 ; **794 / 793 / 0 fail / 1 skipped** ; lint 0 ; ratchet **69/69** ; lang:gate 0 ; export:check 0. Skip unique = `fetch_only_inside_client` (« until 1b »), pré-existant. |
| **2. Fusion à blanc** `git merge --no-commit --no-ff d4d15a0` dans le clone | auto-merge propre ; intersection lot ∩ `f0720ae..d4d15a0` = **∅** ; oracle sur l'arbre fusionné : exit 0, **796 / 795 / 0 / 1**, lint 0, ratchet 69/69, lang:gate 0, export:check 0. Puis `git merge --abort`, `git status` = 0 ligne, HEAD `1892144`. Note : `F:\Monark` a avancé à `3afde03` pendant mon rejeu (commit orchestrateur, 4 fichiers **tous sous `docs/`**, aucun dans les 14) — le résultat se transporte, mais G7 mesure son propre arbre fusionné. |
| **3. Registre vide / texte** | `calibration.ts` : 0 entrée `taskClass: "liquidation-eligible-coverage"` ; `hasCommittedCalibrationForClass` = false. Exécution directe via `handleJsonMirror` sur un ŷ réel de la fixture : 200, `abstain`, `under_calib`, région `kind:"set"`, texte servi = phrase registre-vide. Grep scopé exécuté sur les 6 constantes `LIQ_*` et sur la tranche `For 'liquidation-eligible-coverage' … ` de `GATE_TOOL_DESCRIPTION` (648 car.) : **0 « interval », 0 token de probabilité**. Nom de classe B dans `apps/harness/src` : **0**. |
| **4. Miroir `strateOf` / helper** | `STRATA_CUTS_SERVED` = `[2e11,1e13,1e14]` ; frontières `0,0,1,1,2,2,3` ; test sentinel (égalité par index au gel bigint, 9 frontières, **565/565 lignes `score_a`**) vert sur la fixture POST-SCORE-1 (`301d39fa…`). Champs lus par -2a invariants sous SCORE-1 : `yhat`/`strate`/`address` **0 diff sur 565 lignes**, `meta.cell_a.predictor_id` identique. `liqUpperBoundRegion(y,q)` ≡ `buildIntervalRegion(0,y+q)` (q>0) / `{abstain, under_calib}` (q=0) : égalité JSON vérifiée sur 6 couples. Classe inconnue ⇒ `HarnessToolError` ⇒ **400 `tool_error`** via `handleJsonMirror` (exécuté) ; α≠0.01 ⇒ 400 nommé (exécuté). |
| **5. Mutants** (rejeu sur l'**arbre fusionné**, celui que G7 mesurera) | G1 ×12 (`g1-mutants.mjs`, copie du harnais G1 où seule `WT` diffère, vérifié par `diff`) : **12/12 tués**, baseline verte, ancre unique, restauration sha-identique. Miens ×14 (`cp2-mutants.mjs`) : **10 tués** — V-n-helper (symétrique bornée), V-o-h3 (« interval » dans H-3), V-p (`qhat<0`), V-h-covered ×2 (cellule fabriquée ⇒ `covered` sur registre vide : rouge sur le test artefact ET le test littéral), V-h-text (texte inversé), V-strate-1 ×2 (coupe +1 : tuée par le test harness ET par l'égalité par index du test sentinel — aucune ligne `score_a` n'est sur la coupe, donc la partie JSONL seule ne la tuerait pas), V-dispatch (branche liq retirée ⇒ le test artefact rougit : **il exerce bien la composition**), V-mirror (`hasCommitted…` ⇒ true). **4 survivants** : V-n-gate (région symétrique côté `gate.ts` en contournant le helper), V-h-clientkey (honnêteté keyée sur la clé client) — **inobservables sur registre vide, attendus**, cf. C-3 ; **V-o-empty (« interval » injecté dans `LIQ_EMPTY_REGISTRY_SENTENCE`, la seule phrase liq réellement servie en -2a) : survit à la suite COMPLÈTE (794 tests, 0 fail)** — cf. C-2 ; V-o-desc (« interval » dans la clause de description) : survit aux tests `u4b_*` mais est tuée par `probe_harness_records_real_decision` (pin h5), c.-à-d. un pin d'octets, pas une assertion sémantique. |
| **6. Re-pins** | `node scripts/record-h5-e2e-trace.mjs` rejoué hors réseau (serveur in-process, aucun `fetch`) : **21943 octets, sha `4ad9b340…`**, `git status` vide après rejeu ⇒ byte-identique au committé ; == `TRACE_SHA256_PINNED` (`h5-e2e-probe.test.ts:67`) == `PROVENANCE-h5-e2e-trace.md`. Étiquette « v0, replaced at U-5 » : **0 hit** sur `apps/site`, `skills/`, README, `apps/harness/README.md`, `docs/adr`. Précision : elle est servie sur `tools/list` (par `response_sha256`), dans le texte `content` des appels `cascade` (étapes 3 et 8 de la trace, `cascadeHonestyText`) et dans l'openapi servi (`openapi.ts:73` réutilise `tool.description`) — conforme au plan 2a-5 (description ET honnêteté) ; la formule « QUE tools/list » de la mission est plus étroite que le plan. |
| **7. CA-11** | Chemin servi = `HARNESS_TOOLS[gate].run` (MCP) + `POST /gate` (`handleJsonMirror`), même registre. `gate-liq-artifact.test.ts` lit la fixture committée `U4b-scores-e2.jsonl` dans sa forme réelle (`yhat` string → `Number`, `predictor_id` depuis `meta.cell_a.predictor_id`), mappe **toutes** les lignes `score_a` (≥500, ≥50 ŷ distincts), exécute `run` sur chacune et le miroir HTTP sur la première, n'asserte que `under_calib` (option b, D-3). Mutant V-dispatch prouve que ce test traverse la branche. Nuance : les 400 nommés sont dans `gate-liq.test.ts` (classe B via `runGate` + `handleJsonMirror`), pas dans le test artefact — défendable sous D-3, observation seulement. Aucune pièce nouvelle déclarée `built` ; Ukemi reste `built` sur la couture `cascade` inchangée. |
| **8. R-25** | Pathspec verbatim `ci.yml:65` rejoué : **13 fichiers, 705 + 15 = 720**. Borne réellement imposée : `VIBEGATES_PR_LIMIT: "1205"` (`ci.yml:43`), pas 1150 (chiffre de la mission) ; 720 est sous les deux. Écart vs 480-500 : tests 444/720, chaque test avec un tueur nommé ; lignes ajoutées **commentaires** : `gate.ts` 58/146, `ukemi-strata.ts` 39/56, `gate-liq.test.ts` 40/225 — l'écart est de la provenance (chaque bloc cite une décision), pas du code mort. **Pas de gras, pas de correction.** |
| **9. R-26 placeholder** | Avis motivé : **(a) conserver**. Sur pièces : `UKEMI_LIQ_PREDICTOR_BASE` n'est utilisé qu'à `gate.ts:585` (lookup), jamais imprimé (0 hit dans la trace h5, absent de `honestyText`) ; inerte sur registre vide ; le garde -2b est le test 11 du G0 §6 (`meta.cell_a.predictor_id == UKEMI_LIQ_PREDICTOR_BASE`) qui rougit si -2b oublie le re-pin. (b) embarquerait la clé de l'épisode DESIGN e2 dans `src/` contre ADR-U4b D1 « jamais servi », sans gain de comportement. L'orchestrateur tranche. |
| **10. A-7 code neuf** | Grep du diff : 0 `process.env`, 0 `fetch(`, 0 `node:http`/`undici`, 0 nom de clé, 0 chemin `F:\`/`Monark-wt` ; seules URL = `api.monarkgate.tech` (miroir in-process) et `example.test`. Scan K-8 vert. |

**Provenance (CA-8)** : `DELIVERED.sha256` **14/14** identiques aux blobs de `1892144` — le commit orchestrateur porte exactement les octets du worker ; générateur (Opus 4.8) ≠ relecteur ≠ moi. Sha D4 : `u4b-scores.mjs` `9ad20666…` et JSONL `84f8aa13…` cités au G1 §B sont les valeurs **à f0720ae** (G1 le déclare) ; post-SCORE-1 elles valent `2f9a31f6…` / `301d39fa…` — toute ligne TABLEAU/G7 reprise du G1 §B doit utiliser les valeurs courantes (précédent : correction sha au G2 SCORE-1).

**Anti-close** : amendement Bell-scoped, **n-a** ici (Ukemi, on-chain). Diff des littéraux fait tout de même : coupes, frontières, 2^53-1, ŷ synthétiques de test, et un ŷ de la fixture in-repo (montant liquidable dérivé on-chain, pas un prix). Je ne cite aucune valeur de la fixture.

## 3. Checklist CA-1..CA-11

| Règle | Avis | Preuve |
|---|---|---|
| CA-1 | conforme | critères §9 falsifiables, tous rejoués ci-dessus |
| CA-2 | conforme | aucune décision de valeur nouvelle ; étiquette v0 = décision 123 + Q-NEW-2 ; placeholder = choix technique inerte (R-26 posée) |
| CA-3 | **correction C-1** | ADR-U4b à `1892144` : **aucun amendement 2a-8**, tuyaux `:26-27` périmés (« région servie … -2 », « cascade retrait … fleet.ts … no_cascade_class_in_harness ») ; G0 §9(8) en fait un critère d'acceptation |
| CA-4 / CA-5 | n-a / conforme | plan approuvé au checkpoint-1 ; §12 MAST présent (+ « dérive de forme ») |
| CA-6 | conforme sous condition | trace d'oracle = la mienne (§2) ; **acceptation conditionnelle à un G2 PASS rendu comme artefact séparé** (non lu) |
| CA-7 | conforme | items G1 §I tous formés avec déclencheur ; « skips 2 vs 1 » clos par arithmétique reproductible (mesuré 1) |
| CA-8 | conforme | DELIVERED 14/14 ; modèle résolu préfixe `claude-opus-4-8` ; `error_origin` dû au G7 |
| CA-9 | conforme | rejeu intégral par moi dans un clone séparé, contexte frais |
| CA-10 | conforme | aucun argument de vitesse ; lot 720 ≤ 1205 |
| CA-11 (durci) | conforme | test non-LLM depuis l'artefact committé dans sa forme réelle, à travers les deux surfaces servies, jusqu'à la décision consommée ; V-dispatch prouve la traversée ; aucune pièce déclarée `built` sans tuyau |

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée), conditionnée à un G2 PASS séparé

- **C-1 (bloquante avant G7, pli documentaire orchestrateur, R-20)** : insérer l'amendement 2a-8 (G1 §H) dans `docs/adr/ADR-U4b-calibration-episode-frais.md` **après** l'amendement 2026-09-22 (décision 126, ligne 156 à `d4d15a0`), pas après celui du 2026-09-21 comme l'écrit §H ; réécrire les tuyaux `:26-27` (« -2 » → « -2b » ; « cascade retrait → U-5/-5b, `no_cascade_class_in_harness` à U-5 »). Le G7 montre sur son arbre fusionné le grep de l'en-tête et des lignes 26-27 réécrites.
- **C-2 (bloquante avant G7, test seul, ~3 lignes, aucun octet gelé)** : `u4b_liq_class_text_says_upper_bound_never_interval` doit aussi asserter `!LIQ_EMPTY_REGISTRY_SENTENCE.includes("interval")` et `!honestyText(TASK_LIQ_ELIGIBLE, "x", false).includes("interval")` — mutant V-o-empty survit aujourd'hui à la suite complète. Recommandé en plus : `gate-liq-artifact.test.ts` asserte que le `text` servi sur le chemin composé contient `LIQ_EMPTY_REGISTRY_SENTENCE` (le test d'intégration n'asserte que `structured`). Mutant à rejouer au G7 : « interval » dans `LIQ_EMPTY_REGISTRY_SENTENCE` ⇒ ROUGE.
- **C-3 (non bloquante, G0 -2b)** : migrer vers 2b-4 (à côté de (b)) les deux mutants inobservables sur registre vide : (n') région symétrique dans `liqEligibleVerdict` contournant le helper ; (h') honnêteté keyée sur `lookupCommittedCalibration(TASK_LIQ, clé client)` — actuellement listé sous « -2a » au G0 §6 alors qu'il ne peut y rougir.
- **C-4 (non bloquante, rédaction)** : la mission cite une borne R-25 de 1150 ; `ci.yml:43` impose 1205 — aligner le prompt ; et préciser que l'étiquette v0 est servie sur `tools/list` + texte `content` de `cascade` + openapi (plan 2a-5), 0 sur les surfaces publiques.

Aucune escalade : pas de décision de valeur nouvelle, pas de dérogation demandée, pas de divergence connue avec un G7 (non rendu).

## 5. Preuve AM-2 bis/ter et apprentissage (AM-1)

- Rejeu : `F:\tmp\cp2-u4b2a\tree` ; harnais `g1-mutants.mjs`, `cp2-mutants.mjs`, `full-mut.mjs`, `desc-mut.mjs` et logs `b-*.log`/`m-*.log` sous `F:\tmp\cp2-u4b2a\`.
- Sha des 6 fichiers mutés/régénérés du clone AVANT == APRÈS (28 mutations restaurées + recorder + merge abort) ; clone `git status` 0, HEAD `1892144`. `F:\Monark` : `git status` 0 avant et après ; `gate.ts` `c19a960b…` / `cascade.ts` `2c3dd3d4…` inchangés ; le passage de HEAD `d4d15a0` → `3afde03` est un commit orchestrateur docs-only, pas le mien. Aucun `git` d'écriture, aucune installation.
- **Ce que la checklist a attrapé** : l'amendement ADR manquant (CA-3/CA-11) ; un trou de couverture réel — le mot « interval » injecté dans la seule phrase liq servie en -2a traverse les 794 tests ; deux mutants du G0 inobservables en -2a à migrer. À signaler a posteriori par l'orchestrateur : ce qu'elle aurait manqué.

**Modèle résolu : claude-fable-5-1** (validateur-humain, effort high, instance séparée, contexte frais).
