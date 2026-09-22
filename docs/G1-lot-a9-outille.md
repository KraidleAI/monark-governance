# G1 A-9-OUTILLE (Opus 5.5) — gate vocab servi du harness

Modèle résolu : claude-opus-5-5[1m]

# G1 — lot A-9-OUTILLE : gate de vocabulaire servi du harness (moitié statique + moitié servie)

Worker Opus 5.5 (`claude-opus-5-5[1m]`, effort max), 2026-09-22. Worktree `F:\Monark-wt-a9outille`, branche `lot/a9-outille`, base = merge-base `b130852` (HEAD de `lot/etude-suite` au moment du `worktree add`, commit du checkpoint-1). R-20 : aucun commit, aucun workflow ; l'index du worktree est STAGÉ (`git add -A`, précédent G1 U-5a) pour la mesure R-25 `--cached`. Checkpoint-1 `docs/CHECKPOINT1-lot-a9-outille.md` (APPROUVE-AVEC-CORRECTIONS C-1..C-8) intégré — il prime sur la mission là où il diverge (message orchestrateur). Advisor intégré consulté AVANT le code (10 points, tous appliqués : lookbehind tolérant au macron en échappement JSON, vérification comportementale au lieu d'un parse de regex, carrier h5 nommé, pas de `throw` dans `collectTargets`, mutants V5 et schéma ajoutés, restauration asserted, `.d.mts`, compte CLI 220=220, sections du rendu) et avant ce rendu.

## Résultat en une ligne par livrable
1. `vocab-banned.json` `scan.harness` : **4 règles A-9** (`verified` nu ; `probability` hors négation nommée ; pourcentage numérique ; `accuracy`), **8 exemptions NOMMÉES et FERMÉES** (lookbehind, motif exact + carrier committé + échantillon exact + justification) ; `interval` NON banni sur le scope fichier (C-1) ; `confidence` non ré-ajouté (C-5).
2. `scripts/grep-forbidden.mjs` : sortie `FORBIDDEN VOCAB: <fichier>:<ligne>:<mot>  <why>` ; exit 1 fail-closed (inchangé) ; **0 hit sur l'arbre, 220 fichiers scannés avant ET après** ; la moitié servie vit dans `npm test` (C-3/C-7).
3. Tests : `harness_tool_descriptions_pass_vocab` ÉTENDU (vrai `tools/list` via `createHarnessHandler`, toutes les feuilles chaîne, injection V5 dans CHAQUE outil servi ⇒ rouge nommant l'outil) ; frère `harness_served_honesty_carriers_pass_vocab` (vrai `tools/call`, 11 branches, liage carrier, absence d'`interval`) ; extension de `calibrate_honesty_carriers_…` ; racine `test/vocab-harness-a9.test.ts` (3 tests : exemptions fermées + jumeaux + non-élargissement + charge portante ; câblage du scope + état stable + retrait du scope ; CLI réel file:line:word). **13 mutants nommés, 13/13 tués par le test tueur attendu (TAP, byIntended), 13/13 restaurés byte-exact.**
4. CI : déjà branché (`npm run ci` = `gate:vocab && typecheck && test` ; job g3 `npm run gate:vocab && npm run typecheck && npm test`) — aucun changement de `ci.yml` ; `lang:gate` et `export:check` verts.
5. Oracle complet `env -u` : **gate:vocab 0 · typecheck 0 · lint 0 · lint:ratchet 0 (69/69) · lang:gate 0 · export:check 0 · test 0 = 925 tests / 924 pass / 0 fail / 1 skip** (le skip déclaré `u4b_labels_replay_via_main_real_artifact`, C-6) = 921 + 4. **R-25 = 409** (pathspec extrait VERBATIM de `ci.yml:65`) < 600. **9 sha gelés U-4b byte-identiques.**
6. Amendement ADR proposé : `F:\tmp\a9outille\ADR-amendement.md` (mécanisme (i) nommé, table des 8 exemptions, tuyaux, MAST, 3 items formés, fusion).
7. Rendu : ce fichier, `F:\tmp\a9outille\DELIVERED.sha256` (11 fichiers, `sha256sum -c` OK depuis la racine du worktree), `F:\tmp\a9outille\mutants.mjs`.

## Corrections cp-1 C-1..C-8 : état
- **C-1 CLOSE.** `interval` absent de `scan.harness` ; asserté VERT sur le scope harness (« `interval` mode … the open interval (0,1) », `test/vocab-harness-a9.test.ts:111`) ; asserté ABSENT de chaque texte d'honnêteté SERVI (contenu `tools/call` + `label`) par `harness_served_honesty_carriers_pass_vocab` (`apps/harness/test/registry.test.ts:192`). Preuve : mutant `stable-run-uncalibrated-interval` → CLI `gate:vocab` exit 0 (le scope fichier ne le bannit pas, conforme à ADR-U4b delta D-1) ET test servi ROUGE. Aucun motif contextuel ajouté (V5 déjà attrapé par verified/%/probability, mesuré).
- **C-2 CLOSE.** Zéro octet servi : les 9 hits levés par les nouvelles règles sur l'arbre committé étaient TOUS des commentaires (`schema-projection.ts:41`, `attest.ts:7/29`, `gate.ts:162/174`, `ukemi-predict.ts:20/56/205`, `calibrate.ts:19` — mesuré sur les blobs HEAD, `work/check-head-hits.mjs`, journal `logs/proof-check-head-hits.log`), reformulés. Émission TypeScript sans commentaires des 5 fichiers touchés : **byte-identique HEAD vs lot** (`work/served-bytes-invariance.mjs`, `ALL_EMITTED_EQUAL=true`, journal `logs/proof-served-bytes-invariance.log`). Pin h5 `4ad9b340…` (`test/h5-e2e-probe.test.ts:67`) intouché, `probe_harness_records_real_decision` VERT (trace vivante == trace committée, `tools/list` compris). Aucun surclaim réel trouvé ⇒ aucune escalade.
- **C-3 CLOSE.** Composition exécutée depuis la réponse `tools/list` RÉELLE (`createHarnessHandler().fetch`, in-process, sans socket) : toutes les feuilles chaîne (≥ 20 descriptions de schéma asserted), liage description servie === constante du registre, injection V5 rejouée dans CHAQUE description d'outil servie (chaque hit nomme l'outil, restauration asserted). Les quatre carriers `*HonestyText()` via un vrai `tools/call` par branche (6 branches `honestyText` distinctes + cascade + attest + calibrate ×2), texte servi === carrier (+ résumé de verdict). En EXTENSION des deux tests existants (aucun doublon de donnée : le scan constante par constante d'origine est conservé tel quel). Attribution A-11 byIntended.
- **C-4 CLOSE.** Voie **(i) lookbehind** choisie et nommée (ADR D-A9-2) ; **aucun `exemptPhrases` sur le scope harness** ⇒ le câblage `grep-forbidden.mjs:156` (numérotation cp-1 ; `:171` sur le lot) n'est pas requis et l'affirmation de `test/ci-gates.test.ts:362-365` reste vraie (test `vocab_adaptive_coverage_reddens` inchangé, vert). Liste fermée de 8, épinglée dans le test ; pour chaque exemption : échantillon VERT, jumeau sans le préfixe ROUGE, aucun suffixe-mot plus court n'exempte (anti-élargissement), échantillon présent verbatim dans le carrier committé, retrait du lookbehind ⇒ le carrier ROUGIT, aucun lookbehind non déclaré. Macron `Shōgen` : classe tolérante `[oō̄]{1,2}` écrite en échappements JSON ; les carriers sont lus sur les octets committés (et les constantes servies sont scannées vivantes par le test servi).
- **C-5 CLOSE.** `confidence` non ré-ajouté (asserté : banni exactement une fois) ; `%` nu admis sans exemption (0 hit mesuré à `b130852`, consigné dans le `why` et l'ADR) ; `instructions` non revendiqué (`server.ts:92` : `new McpServer({ name, version })`) → item formé 3 (déclencheur : premier `instructions`).
- **C-6 CLOSE.** 925/924/0/1, skip = `u4b_labels_replay_via_main_real_artifact` (artefacts gitignorés, worktree frais).
- **C-7 CLOSE.** Amendement ADR : MAST « vérification incorrecte » (tests par présence seule → assertions d'absence + 13 mutants attribués) et « dérive de périmètre » (octets servis → invariance prouvée) ; tuyaux CA-11 (entrée `HARNESS_TOOLS` + carriers ; sortie `npm run gate:vocab` statique + `npm test` servi ; état `scan.harness` ; tests nommés) ; item formé U-5b (rejeu sur `UKEMI_PREDICT_TOOL_DESCRIPTION`, `ukemi-predict.ts:231`).
- **C-8 CLOSE.** Un seul fichier de motifs racine (`vocab-banned.json`), aucun second gate, aucun second fichier de motifs (le seul fichier nouveau est un test).
- **Contrainte de fusion avant U-5b** : aucun fichier `apps/bell/**` (vérifié sur le diff), zéro octet servi (C-2), enregistrement `ukemi-predict` intouché (3 lignes de COMMENTAIRE seulement dans `ukemi-predict.ts`), item U-5b formé ⇒ fusion avant U-5b ADMISSIBLE ; décision orchestrateur.

## Consigne standard : point par point
- **A-1** fait — première ligne. Voir D-1 (le texte d'A-1 dit encore `claude-opus-4-8…` ; la mission, décision 133, attend `claude-opus-5-5` : le modèle résolu `claude-opus-5-5[1m]` est conforme à la mission).
- **A-2** fait — `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0` ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-a9outille\packages\rpc-guard\src\index.ts`. Le retrait (`rm-nm.ps1`) est laissé à l'orchestrateur (worktree encore utile au G2).
- **A-3** fait — codes capturés directement (`cmd > log 2>&1; echo x=$?`), `logs/final/exits.txt` ; oracle complet ci-dessous.
- **A-4** fait — `DELIVERED.sha256` (11 chemins relatifs, vérifié `sha256sum -c` : 11 OK ; identique avant/après l'oracle final) ; rendu sous `F:\tmp\a9outille\` ; aucun commit ; TEMP/TMP sur `F:\tmp\a9outille\os-tmp` ; aucun réseau (handler MCP in-process, aucun `fetch`, aucune clé).
- **A-5** fait — R-25 = **409** (`11 files changed, 391 insertions(+), 18 deletions(-)`), pathspec extrait par `sed` de `ci.yml:65` puis `git diff --cached --shortstat b130852 -- <pathspec>`.
- **A-6** fait — 9 sha LF gelés AVANT == APRÈS (`logs/frozen-before-disk.txt` / `logs/frozen-after-disk.txt`, `diff` vide) : u4b-scores `2f9a31f6…`, u4b-reduce `a5e66cd3…`, record-u4b-calib `5733daeb…`, wadray `7bee76fc…`, abi `3376eb08…`, l1-split `9206df91…`, rpc.ts `0e232519…`, calib-digest `3603265d…`, u3-realized `cb020425…` ; aucun fichier gelé, `apps/bell/**` ni ADR-U4b dans le diff.
- **A-7** fait — oracle, tests et mutants lancés sous `env -u` des 8 variables ; `mutants.mjs` les supprime de l'env enfant sans jamais les imprimer ; aucune variable affichée.
- **A-8** n-a au sens strict (aucun tuyau d'API externe) ; le test servi consomme la réponse RÉELLE du SDK (trame SSE telle que produite, désenveloppée comme un client).
- **A-9** fait — objet du lot : scan statique de chaque ligne servie + scan de la réponse `tools/list` réelle + `tools/call` réel (sortie COMPOSÉE, registre vide, abstention) ; injections rejouées sur chaque description d'outil servie (boucle), sur la sortie composée `honestyText` (mutant `honestytext-liq-composed-percent`), sur une phrase d'honnêteté (`stable-run-uncalibrated-interval`) et sur un texte servi né HORS `apps/harness/src` (`demonstrative-label-accuracy`, CLI exit 0 ⇒ seul le scan servi l'attrape).
- **A-10** fait — liage : description servie === constante du registre ; texte servi === carrier (+ résumé) ; mutant `registry-served-text-unbound` (lit toujours `honestyText` mais altère la sortie servie, type-valide) ROUGE sur le chemin servi réel.
- **A-11** fait — `mutants.mjs` : `node --test --test-reporter=tap`, CRLF normalisé, tué seulement si `not ok … - <tueur attendu>` ; 13/13.
- **A-12** fait — en-tête (HEAD `b130852…`, liste des fichiers du lot non committés, node v24.15.0, win32 10.0.19045 x64, commandes exactes) ; par mutant : diff (find/repl), sha du fichier muté, sha de restauration == sha doré.
- **B-1..B-6** n-a — aucun opérateur payant, aucune lecture de clé, aucun code réseau. (Le test racine utilise `node:child_process` pour lancer le CLI : code de TEST, hors périmètre B-5.)
- **C-1..C-4** n-a — aucune classe d'erreur, aucun retry.
- **D-1** fait (13 mutants, harnais TAP). **D-2** fait — vecteurs non vides et fermés : 4 outils servis (liste == registre), ≥ 20 descriptions de schéma, 11 appels dont 6 branches d'honnêteté distinctes (asserted), 8 exemptions épinglées. **D-3** fait — test d'intégration non-LLM depuis l'artefact servi réel (handler SDK réel, aucun faux client, aucun bouchon). **D-4** fait — diff des tests : une seule ligne « − » (`test("harness_tool_descriptions_pass_vocab", () => {` → `async () => {`, requis par les appels servis) ; AUCUNE assertion retirée ni affaiblie (les assertions d'origine sont conservées verbatim ; tout le reste est « + »).
- **E-1..E-3** n-a — aucun verrou, ledger ni backoff.
- **F-1** fait — amendement ADR avec tuyaux, aucun renvoi `F:\tmp` (vérifié : 0 occurrence), résidus nommés avec déclencheur. **F-2** fait — tout texte AJOUTÉ est ASCII (les seuls octets non-ASCII des lignes modifiées sont des caractères préexistants, tirets cadratins et `Shōgen` des lignes reformulées) ; `gate:vocab` propre ; aucune clé. **F-3** fait — déviations D-n ci-dessous ; aucun double échec ; advisor consulté.
- **G-1** fait — décisions relues et citées : item A-9-OUTILLE (`docs/CHANTIERS.md:766`), ruling SITE-RELEASE-1 Q-1 (b) « pas de durcissement GLOBAL de `vocab-banned.json` » (`docs/CHANTIERS.md:681`) respecté (règles SCOPÉES `scan.harness`, GLOBAL intouché, `cascade` non banni), §F-gate-vocab (`:132`, `gate:vocab` lancé à chaque oracle), ruling 14:48 UTC U-5a option (B) (enregistrement `ukemi-predict` = U-5b, intouché).

## Oracle complet (`env -u` des 8 clés ; TEMP sur F: ; arbre = staged == worktree)
`gate:vocab=0` (`scanned 220 file(s), no forbidden claim`) · `typecheck=0` · `lint=0` · `lint:ratchet=0` (**69/69**, zéro dette nouvelle) · `lang:gate=0` · `export:check=0` · `test=0` : **925 tests, 924 pass, 0 fail, 1 skip** (`u4b_labels_replay_via_main_real_artifact`, « real e2 artifacts absent »). Base mesurée avant le lot sur le même worktree : 921/920/0/1 ⇒ n = 4 tests nouveaux (3 racine + 1 frère harness). Journaux : `F:\tmp\a9outille\logs\final\`.

## Preuve avant/après (le trou fermé)
- La phrase V5 du checkpoint-2 U-5a scannée avec GLOBAL + `scan.harness` : config HEAD `b130852` ⇒ **0 hit** ; config du lot ⇒ **3 hits** `verified`, `probability`, `95%` (`work/v5-head-vs-lot.mjs`, journal `logs/proof-v5-head-vs-lot.log` ; les trois journaux de preuve portent l'en-tête A-12 : HEAD, fichiers du lot, sha de `DELIVERED.sha256`, node, plateforme, commande exacte). Le mutant `v5-ukemi-label` fait passer le CLI `gate:vocab` de 0 (avant, mesuré au cp-2) à **exit 1** (mesuré).
- Les nouvelles règles rougissent les blobs HEAD des 5 fichiers reformulés (9 hits nommés ligne:mot) et sont propres sur le lot (`work/check-head-hits.mjs`).

## Mutants (A-11 byIntended, A-12) — 13/13 tués, 13/13 restaurés (`logs/mutants.log`)
| Mutant | Fichier | Tueur attendu (TAP `not ok`) | Autres rouges | CLI `gate:vocab` |
|---|---|---|---|---|
| `v5-ukemi-label` (V5 fondateur, cp-2 U-5a l.24) | ukemi-predict.ts | `a9_harness_static_scope_wired_and_clean` | `a9_gate_vocab_cli_names_file_line_word` | 1 |
| `schema-description-probability` | schema-projection.ts | `harness_tool_descriptions_pass_vocab` | — | 1 |
| `stable-run-uncalibrated-interval` (C-1) | gate.ts | `harness_served_honesty_carriers_pass_vocab` | — | 0 |
| `demonstrative-label-accuracy` (texte servi hors scope statique) | packages/monark/src/adapter-shogen.ts | `harness_served_honesty_carriers_pass_vocab` | — | 0 |
| `honestytext-liq-composed-percent` (sortie composée) | gate.ts | `harness_served_honesty_carriers_pass_vocab` | — | 1 |
| `scope-harness-removed-config` (mission 3c ; tué à la précondition « `scan.harness` présent », `harnessOf`) | vocab-banned.json | `a9_harness_static_scope_wired_and_clean` | `a9_harness_exemptions_are_named_closed_and_load_bearing` | 0 |
| `scope-harness-removed-code` (mission 3c ; exerce le chemin de câblage `collectTargets`) | grep-forbidden.mjs | `a9_harness_static_scope_wired_and_clean` | — | 0 |
| `not-re-widened` (exemption rendue générique) | vocab-banned.json ×2 | `a9_harness_exemptions_are_named_closed_and_load_bearing` | — | 0 |
| `undeclared-lookbehind` | vocab-banned.json | `a9_harness_exemptions_are_named_closed_and_load_bearing` | — | 0 |
| `percent-rule-disabled` | vocab-banned.json | `a9_harness_exemptions_are_named_closed_and_load_bearing` | `a9_harness_static_scope_wired_and_clean` | 0 |
| `cli-word-dropped` (livrable 2) | grep-forbidden.mjs | `a9_gate_vocab_cli_names_file_line_word` | — | 0 |
| `registry-served-text-unbound` (A-10) | registry.ts | `harness_served_honesty_carriers_pass_vocab` | — | 0 |
| `never-a-lookbehind-dropped` | vocab-banned.json | `calibrate_honesty_carriers_pass_the_negation_aware_vocab_gate` | — | 1 |
Chaque exécution : fichier de test du tueur seul (`--test-reporter=tap`), env sans clés ; sha doré / muté / restauré imprimés.

## Décisions de conception (contrôlables)
- Exemptions = DONNÉES à côté de la règle (`exemptions: [{after, lookbehind, carrier, sample, why}]`) ; la regex `re` porte les lookbehinds en ligne (convention du scope, `compilePatterns` INCHANGÉ ⇒ tous les consommateurs existants — sondes h5/byo, `vocab_adaptive_coverage_reddens`, `release-public.mjs` — restent verts sans modification). La cohérence liste ⇔ regex est prouvée par le test (présence de chaque lookbehind déclaré ; résidu sans `(?<!` après retrait des déclarés).
- `scanText` renvoie aussi `word` (le span apparié) ; les règles `probability`/pourcentage matchent le mot entier (`probabilit\w*`, `\d+(?:[.,]\d+)?\s*%`) pour nommer `probability` / `95%`.
- Scan servi dans les tests du harness (exportés, auto-suffisants) plutôt qu'un import dynamique du harness dans le CLI (le CLI reste sans dépendance ; `release-public.mjs` l'importe) — architecture du checkpoint-1 (sortie statique `gate:vocab` + sortie servie `npm test`, les deux dans `npm run ci`).

## Déviations (D-n)
- **D-1** Le texte de la CONSIGNE A-1 (« stop si ce n'est pas `claude-opus-4-8…` ») et le prompt système de ce worker (« épinglé `claude-opus-4-8` ») sont antérieurs à la décision 133 ; la mission attend `claude-opus-5-5` et le modèle résolu est `claude-opus-5-5[1m]` ⇒ poursuite. Item : amender A-1 (`claude-opus-5-5…`) — propriétaire orchestrateur, déclencheur : ce rendu.
- **D-2** Livrables 1/2/5 de la mission amendés par le cp-1 (priorité donnée par l'orchestrateur) : `interval` (absence seulement), `confidence` (non ré-ajouté), `instructions` (retiré), « 0 skip » (1 skip déclaré), prémisse « gate:vocab du site » (un seul fichier racine).
- **D-3** Extension de schéma de `vocab-banned.json` : clés `exemptions` (4 règles) et `$comment_a9` (scope harness) ; ignorées par tout consommateur existant (mesuré : suite complète verte).
- **D-4** API `scanText` : champ `word` ajouté + `re.lastIndex = 0` (identique pour les motifs compilés sans `/g` ; supprime l'état d'un `/g` fourni par un appelant) ; `.d.mts` mis à jour.
- **D-5** 9 reformulations de COMMENTAIRES dans 5 fichiers source du harness (dont 3 lignes de `ukemi-predict.ts`) : chevauchement textuel possible, trivial, avec U-5b.
- **D-6** Le CLI seul reste exit 0 si `scan.harness` est supprimé (mesuré sous le mutant) ; le pipeline est fail-closed via `npm test` dans `npm run ci` (précédent sentinel ; conseil advisor : pas de `throw` nouveau dans un script exporté). Consigné en frontière déclarée dans l'ADR.
- **D-7** Index du worktree stagé (`git add -A`) pour la mesure R-25 `--cached` ; aucun commit.
- **D-8** L'exemple de la mission « 95% accurate » est DÉJÀ attrapé par le GLOBAL (sert au test CLI) ; les injections du lot utilisent la phrase V5, prouvée survivante à HEAD (0 hit) et attrapée par le lot (3 hits).

## Items formés (déclencheur — zéro dette ; détail `ADR-amendement.md`)
1. **U-5b : rejeu servi sur `ukemi-predict`** (`UKEMI_PREDICT_TOOL_DESCRIPTION`, `ukemi-predict.ts:231`) — automatique par la liste réelle ; le G1 U-5b montre les rondes d'injection nommant `ukemi-predict` et ajoute une ligne `ukemi-predict` au tableau CALLS du test servi. Propriétaire orchestrateur ; déclencheur : enregistrement U-5b.
2. **Messages de refus composés de texte `packages/monark`** (`attest.ts:53`, `ukemi-predict.ts:180/183`) : non couverts par les règles A-9 (scope monark) ; 0 hit mesuré aujourd'hui ; déclencheur U-5b (refus `ukemi-predict` servis) ; forme : règles A-9 sur `adapter-{shogen,book}.ts` OU chemins `isError` dans le test servi. Propriétaire orchestrateur.
3. **`initialize`/`instructions`** : surface inexistante (C-5) ; déclencheur : premier `instructions` passé à `McpServer` (`server.ts:92`) ; forme : ajouter les feuilles de `initialize` au scan servi dans le même commit.
4. **CONSIGNE A-1** : amender le préfixe attendu en `claude-opus-5-5` (D-1). Propriétaire orchestrateur ; déclencheur : ce rendu.
5. **Limite déclarée de la règle pourcentage** : un modulo littéral `<chiffre> % <chiffre>` dans une source du harness rougirait ; 0 aujourd'hui (220/0) ; déclencheur : le premier ; forme : réécriture identifiant/commentaire ou ligne d'ADR (consigné ADR D-A9-1).

## Fichiers
Livrables dépôt (worktree `F:\Monark-wt-a9outille`, stagés, 11 ; `DELIVERED.sha256`) :
- `vocab-banned.json` (+33/−1 : 4 règles A-9, 8 exemptions, `$comment_a9`)
- `scripts/grep-forbidden.mjs` (+20/−5 : `word`, sortie file:line:word, commentaires)
- `scripts/grep-forbidden.d.mts` (+2 : `VocabHit.word`)
- `apps/harness/test/registry.test.ts` (+153/−1 : helpers servis, test étendu, test frère)
- `apps/harness/test/calibrate.test.ts` (+10 : extension (d))
- `test/vocab-harness-a9.test.ts` (NEUF, 162 : 3 tests racine, non exporté)
- commentaires seulement : `apps/harness/src/schema-projection.ts`, `apps/harness/src/tools/attest.ts`, `apps/harness/src/tools/gate.ts`, `apps/harness/src/tools/ukemi-predict.ts`, `apps/harness/src/tools/calibrate.ts`

Rendu (`F:\tmp\a9outille\`) : `G1.md`, `DELIVERED.sha256`, `mutants.mjs`, `ADR-amendement.md`, `logs\` (oracle de base et final, mutants, R-25, gels), `work\` (scripts de preuve : `check-head-hits.mjs`, `served-bytes-invariance.mjs`, fragments d'insertion).

## Provenance
Généré par `claude-opus-5-5[1m]` (effort max), 2026-09-22, contexte : mission `F:\tmp\a9outille\MISSION-G1.md` + checkpoint-1 A-9-OUTILLE + consigne standard G1 (A-1..A-12) ; base `b130852` ; réviseur : orchestrateur (R-21), puis G2 / checkpoint-2.
