# Checkpoint-1 A-9-OUTILLE — APPROUVE-AVEC-CORRECTIONS (C-1..C-8)

Modèle résolu : claude-fable-5-1

# Checkpoint-1 (PLAN) — lot A-9-OUTILLE — avis du validateur-humain

## 1. Artefacts lus (lecture seule ; `git -C F:\Monark status --porcelain` = vide avant et après ; aucune écriture, aucun `git` mutateur)

- `F:\tmp\a9outille\MISSION-G1.md` (plan, 7 livrables)
- `F:\Monark\docs\CHANTIERS.md` l.766 (item formé A-9-OUTILLE : déclencheur U-5b, propriétaire orchestrateur), l.776 (dernier G7 : 921/921/0/0), l.794/806 (U-4b-1b-3 : 926/925/0/1)
- `F:\Monark\docs\CHECKPOINT2-lot-u5a.md` l.24-25, 52, 71 (observation d'origine : V5 injection « verified 95% probability … within the interval » survit à `gate:vocab`)
- `F:\Monark\docs\CONSIGNE-STANDARD-G1.md` A-9, A-10, A-11
- `F:\Monark\scripts\grep-forbidden.mjs` (intégral), `F:\Monark\vocab-banned.json` (intégral), `F:\Monark\package.json:17,20`
- `F:\Monark\apps\harness\src\{server.ts:88-95, tools/registry.ts:1-80}`, `apps/harness/test/{registry.test.ts:70-80, calibrate.test.ts:213-240}`, `test/ci-gates.test.ts:335-380`, `test/h5-e2e-probe.test.ts:51-67`, `test/u3-realized-param.test.ts:238`, `.github/workflows/ci.yml:65`
- Mesures Bash (grep PCRE sur `apps/harness/src`) des mots que le plan veut bannir — voir CA-1/CA-3.

## 2. Checklist

**CA-1 (critères falsifiables ; reformulation une phrase par livrable)** — CORRECTION.
Reformulation : (1) ajouter des motifs au scope `scan.harness.banned` avec exemptions nommées ; (2) le CLI rougit (exit 1) sur toute constante servie du harness, 0 hit sur l'arbre ; (3) un test rejoue l'injection sur la liste d'outils réelle et rougit en nommant l'outil, chaque exemption a son jumeau « sans négation ⇒ rouge », ≥ 6 mutants attribués (A-11) ; (4) le gate reste appelé par `npm run ci` ; (5) oracle complet vert ; (6) amendement ADR avec tuyaux ; (7) rendu + sha. Reformulable, donc bien posé — sauf deux critères non falsifiables tels qu'écrits :
- (a) « 0 skip » : le seul skip de l'arbre est `u4b_labels_replay_via_main_real_artifact` (`test/u3-realized-param.test.ts:238`), conditionné à des artefacts **gitignorés** ; dans un worktree frais (`git worktree add`, plan l.3) ils sont absents ⇒ 1 skip par construction (précédent : 926/925/0/1 sur `801859f`, CHANTIERS l.794). Le critère doit dire « 0 skip hors ce skip déclaré env-dépendant ».
- (b) « scope étendu à … `instructions` » : `server.ts:91` construit `McpServer({ name, version })` sans `instructions` — la surface n'existe pas sur cet arbre (grep : aucune occurrence). Les surfaces servies réelles sont : `HARNESS_TOOLS[].description` (registry.ts:61-107), les `description` d'`inputSchema`/`outputSchema` (schema-projection.ts), et les quatre carriers `*HonestyText()`. Le worker ne doit pas inventer une surface.
- Note : `confidence` figure déjà dans le scope harness (`vocab-banned.json:59`) — le livrable 1 ne doit pas le « re-ajouter ».

**CA-2 (décisions de valeur)** — CONFORME, avec **déclencheur conditionnel**. Le plan n'ajoute pas de valeur nouvelle : il outille A-9/ADR-M020 déjà décidés. Mesuré : tous les hits qu'induiraient les mots proposés sont des spans honnêtes ou des identifiants — `Shōgen-verified` (attest.ts:33/69, compound sanctionné attest.ts:29), « not re-verified » (gate.ts:179), « NOT re-verified » (ukemi-predict.ts:64), identifiant `accuracy` du générateur synthétique (calibration.ts:19/23), négations « never a / no / no_ probability » (calibrate.ts:57, gate.ts:109, cascade.ts:79), commentaire replié « never a\n * probability » (gate.ts:161-162). Aucun surclaim réel. **Si** le G1 découvre un surclaim véritable exigeant de réécrire une phrase publique servie, c'est une décision de valeur ⇒ ESCALADE-INVESTISSEUR à ce moment-là, jamais une réécriture silencieuse.

**CA-3 (ADR de rattachement ; gates non suspendus)** — CORRECTION. Le livrable 6 prévoit l'amendement ADR (conforme). Mais le plan tel qu'écrit **contredit une décision ADR enregistrée** : `gate.ts:136-138` (U-4b delta D-1) scope l'interdit « interval » à la constante liq (`mutant (o) is scoped to this constant, not to … vocab-banned.json`), et « interval » est le vocabulaire du contrat de fil (`mode: "interval"`, `region.kind === "interval"`, descriptions d'inputSchema servies dans `tools/list` : schema-projection.ts:122/134/135/280 ; clause BYO de `GATE_TOOL_DESCRIPTION` gate.ts:192). Mesuré : 34 occurrences de `\binterval\b` dans `apps/harness/src`. Un ban nu de « interval » sur le scope fichier est impossible sans dizaines d'exemptions (= dérive générique, contraire au plan lui-même). Correction : retirer « interval » nu de la liste de scope fichier ; le garder comme assertion d'ABSENCE sur les constantes servies d'honnêteté (précédent `u4b_liq_class_text_says_upper_bound_never_interval`, à étendre aux constantes Ukemi en -5b). Si un motif contextuel est voulu (ex. `within the interval`, `probability … interval`), il est nommé et motivé dans la ligne ADR.

**CA-4 (fan-out justifié)** — CONFORME. Un seul worker ; le checkpoint-1 en parallèle du G1 est la déviation déclarée (décision 130, « corrections au pli »).

**CA-5 (modes MAST nommés)** — CORRECTION. La mission ne nomme aucun mode. À nommer dans l'amendement ADR : vérification incorrecte (tests par PRÉSENCE seule — c'est exactement C-1 de U-5a) ⇒ contre-mesure : assertions d'absence + mutant d'injection attribué ; dérive de périmètre (le worker « corrige » des phrases servies ⇒ octets `tools/list` modifiés ⇒ re-pin h5 couplé à U-5b) ⇒ contre-mesure : invariance des octets servis (ci-dessous).

**CA-11 (branchement — tuyaux déclarés, composition exécutée)** — CORRECTION.
- Le gate statique est déjà branché : `package.json:20` `ci` → `gate:vocab`. Le livrable 4 est une vérification, pas un tuyau nouveau.
- Le test d'injection `tools/list` (livrable 3a) n'est un test d'intégration non-LLM **que s'il exécute la composition depuis l'artefact réel** : la réponse `tools/list` obtenue via `createHarnessHandler()` (server.ts:88) ou `registerTools` + SDK, en scannant TOUTES les chaînes (descriptions, `inputSchema`/`outputSchema.description`), plus les quatre carriers `*HonestyText()`. Scanner seulement `HARNESS_TOOLS[].description` avec `scanText` **existe déjà** (`harness_tool_descriptions_pass_vocab`, registry.test.ts:72 ; carriers calibrate : calibrate.test.ts:213) — un test parallèle sur la même donnée serait un doublon. Le plan doit dire : étendre ces tests existants (ou un frère qui lit la réponse servie), avec attribution A-11 `byIntended` du mutant tueur.
- L'amendement ADR déclare les tuyaux : entrée = `HARNESS_TOOLS` + carriers ; sortie = `npm run ci` (statique) + `npm test` (servi) ; état = `vocab-banned.json` `scan.harness` ; test de composition = celui ci-dessus.
- Item formé obligatoire, déclencheur U-5b : `UKEMI_PREDICT_TOOL_DESCRIPTION` (ukemi-predict.ts:231) — la constante qui a motivé l'item — n'entre dans `HARNESS_TOOLS` qu'en -5b ; le scan servi doit y être rejoué à ce moment.

**Périmètre harness vs site / duplication du `gate:vocab` du site** — CORRECTION de prémisse. `apps/site/package.json` n'a **pas** de script `gate:vocab` ; le site est couvert par le `gate:vocab` racine via `scan.site` du même `vocab-banned.json` ; `apps/site/test/honesty-lint.ts` est un détecteur de littéraux numériques (autre sujet). « Aligner sur le site » se réduit donc à : ajouter des motifs à `scan.harness.banned` dans l'unique fichier racine, aucun second fichier de motifs, aucun second gate. Le risque de duplication réel est interne au harness (tests existants ci-dessus), pas site/harness.

**Exemptions nommées vs générique** — CORRECTION de mécanique. Le scope harness **ne consomme pas** `exemptPhrases` aujourd'hui (grep-forbidden.mjs:156 n'en passe aucune ; `test/ci-gates.test.ts:362-365` l'asserte). Deux voies licites, le worker en choisit UNE et la ligne ADR la nomme : (i) lookbehind de négation dans le motif, convention actuelle du scope (`vocab-banned.json:62-63` pour `guarantee`/`probative`) — noter que le motif Bell `(?<!not )(?<!no )\bverified\b` copié tel quel rougit « re-verified » et « Shōgen-verified » ; (ii) `exemptPhrases` harness, ce qui exige le câblage à :156 et la révision non-inerte du test ci-gates:362. Dans les deux cas : liste fermée, span exact + motif, et pour chaque exemption le jumeau « même phrase sans négation ⇒ rouge » (livrable 3b) — c'est la preuve anti-générique. Attention encodage : `Shōgen` a des variantes (attest.test.ts:114 utilise `Sh[oŌō̄]{1,2}gen`) ; une exemption littérale doit être testée contre la constante committée, pas une chaîne retapée. `%` : mesuré 0 occurrence de `\d+\s*%|percent` dans `apps/harness/src` ⇒ un ban nu `\d+\s*%` est acceptable dans le scope harness (à consigner « mesuré 0 hit » dans la ligne ADR) — plus falsifiable que « sur une phrase de justesse ».

**Invariance des octets servis (dérivée de CA-3/CA-5/CA-11)** — CORRECTION bloquante : ce lot ne change **aucun octet servi**. Tous les hits mesurés sont honnêtes ⇒ résolus par exemption nommée/lookbehind, jamais par réécriture. Preuve : le pin h5 `4ad9b340…` (`test/h5-e2e-probe.test.ts:67`) reste vert sans re-pin dans ce lot (précédent :62 — chaque changement de description a coûté un re-pin ; U-5b porte déjà le sien). Le commentaire replié gate.ts:161-162 peut être reflué (commentaire, aucun octet servi) ou exempté.

**CA-10 (aucun argument de vitesse ; lots petits)** — CONFORME (R-25 < 600 annoncé, pathspec `ci.yml:65` lu).

**Moment de fusion (U-5b vs plus tôt)** — avis, pas verdict (propriétaire : orchestrateur ; pas une escalade). Depuis le siège d'acceptation, une fusion **avant** U-5b est admissible si et seulement si : octets servis invariants (ci-dessus), aucun fichier sous `apps/bell/**` touché ni ligne ANCHORS affectée (course Bell en vol, règle D-n), enregistrement `ukemi-predict` intouché, et l'item formé déclencheur U-5b ci-dessus consigné. Sinon le déclencheur reste U-5b comme dans l'item.

## 3. Décision : **APPROUVE-AVEC-CORRECTIONS** (liste fermée, à porter au pli — décision 130)

- **C-1** « interval » : hors liste de scope fichier ; assertion d'absence sur constantes servies seulement (contradiction ADR U-4b delta D-1 sinon).
- **C-2** Zéro octet servi modifié ; pin h5 inchangé, pas de re-pin ; tout surclaim réel découvert ⇒ stop et ESCALADE-INVESTISSEUR.
- **C-3** Livrable 3a = composition exécutée depuis la réponse `tools/list` réelle + carriers honnêteté, en extension de `harness_tool_descriptions_pass_vocab` / `calibrate_honesty_carriers_…`, sans doublon ; attribution A-11.
- **C-4** Mécanique d'exemption choisie et nommée (lookbehind OU `exemptPhrases` câblé à :156 + ci-gates:362 révisé) ; liste fermée mesurée ci-dessus ; jumeaux « sans négation ⇒ rouge » ; test sur constantes committées.
- **C-5** Livrable 1 : ne pas re-ajouter `confidence` ; `%` nu admis (0 hit mesuré) ; « instructions » retiré du livrable 2 (surface inexistante).
- **C-6** Critère oracle : « 0 skip hors `u4b_labels_replay_via_main_real_artifact` (artefacts gitignorés) ».
- **C-7** Amendement ADR : modes MAST nommés (vérification incorrecte ; dérive de périmètre) + tuyaux CA-11 + item formé déclencheur U-5b (scan servi rejoué sur `UKEMI_PREDICT_TOOL_DESCRIPTION`).
- **C-8** Prémisse « gate:vocab du site » corrigée : un seul fichier de motifs racine, aucun second gate.

Aucune escalade immédiate ; escalade conditionnelle nommée en C-2.

## 4. AM-1 — ce que la checklist a attrapé
Contradiction avec une décision ADR enregistrée (« interval » = vocabulaire de fil, scope constante seulement) ; surface « instructions » inexistante ; « 0 skip » non atteignable en worktree frais ; doublon latent avec deux tests existants ; absence de plomberie `exemptPhrases` sur le scope harness ; couplage h5/U-5b si une phrase servie change ; prémisse fausse sur un `gate:vocab` du site. Manqué : à signaler par l'orchestrateur a posteriori.

Modèle résolu : claude-fable-5-1
