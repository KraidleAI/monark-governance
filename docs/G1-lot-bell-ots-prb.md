# G1 : Lot BELL-OTS-ANCHOR-1, PR-B — coupe PR-B1 exécutée (T-B1, T-B2, T-B3, ordre des synchros de T-B11), puis STOP : contradiction ADR/code, consultation formée (R-26)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max), déclaré en première ligne de la session (R-1).
Worktree `F:/Monark-wt-prb`, branche `lot/bell-ots-prb`, HEAD `17147d3` (arbre propre à l'ouverture, `git status --short` vide) ; aucun commit, aucun workflow (R-20) ; rien d'indexé : `git diff --cached --quiet` rend 0 dans le worktree et dans `F:/Monark` (mesuré à la clôture) ; l'index du worktree est octet pour octet celui relevé à l'ouverture (sha256 `26b806a3…e9a6`). L'index de `F:/Monark` a changé pendant la session avec sa tête (`a3f7d98` à la lecture de `git worktree list`, `a3b32fa` au premier relevé, `5cb8d76` à la clôture : commits `CHANTIERS` de l'orchestrateur) ; aucune commande de ce worker n'écrit dans ce dépôt (clones `--shared` lus, `rev-parse`, `diff --cached --quiet`). Horloge `date -u` : 2026-09-25T01:24:45Z (fin de l'orientation), 01:34:39Z (premiers outils), 02:21:09Z (début de ce journal).
Cadre : `docs/adr/ADR-BELL-OTS-PRB.md` à `17147d3` (466 lignes, sha256 `2a43fbdbe1e452a67e0eac2c5dd5dd7ece09c3ec6c406bf294657f6843744d61`, égal à celui de la mission), lu en entier, amendement « Corrections checkpoint-1 » et rulings 214/215 compris ; ADR mère `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` (386 lignes, sha256 `5bab9eeb…188b`) lue de D3 à la fin (D5, D6, D7, D8, D9, §4 à §11, corrections, amendement 198, ruling D8) ; mission `F:\tmp\ots-prb\mission-g1.md` (sha256 `d81faacd730c66e11dc0977fdccf7888aa11763ca2ae23e3497adb4f5b23e7df`).
Hygiène : toute commande node/npm sous la ceinture `F:/tmp/ots-prb/g1/tools/belt.sh` (les 8 variables payantes et les variables `GIT_*` de localisation retirées par `env -u`, `TEMP/TMP/TMPDIR=F:/tmp/ots-prb/g1/tmp`, `NEXT_TELEMETRY_DISABLED=1`), jamais `env` affiché ; `npm ci --offline --ignore-scripts` depuis le cache `F:\cache\npm` (283 paquets, `package-lock.json` inchangé entre `e6b8305` et `17147d3`, `git diff --stat` vide) ; rien écrit sur C: ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; copies de travail par `git clone --shared` sous `F:/tmp/ots-prb/g1/` (`base`, `tree`, `v4tree`), jamais dans le worktree ni dans le dépôt : les tests qui invoquent `git` (révision du collecteur) exigent un `.git`, ce que la mission prévoit (« un test qui a besoin de `.git` tourne sur le clone ») ; aucun `git archive` n'a donc servi. Réseau : **aucun appel** (aucun GET, `npm` hors ligne) ; seul le bouclage `127.0.0.1:3072` pour les sondes servies. Consultations : advisor intégré (R-26, canal 1), une après l'orientation, une avant la clôture (§14).

## 0. STOP : contradiction ADR/code, demande de consultation formée (R-26, canal 2, pour l'orchestrateur)

**Le problème, en une phrase.** Le G0 affirme que `listedDigests` n'a plus de consommateur une fois `/bell` et `/bell/method` basculées (D-B7 : « `listedDigests` quitte `apps/site/lib/bell-anchors-load.ts` (plus aucun consommateur) » ; M-6 : « le retrait de `listedDigests` fait en outre rougir `typecheck` » ; §2.2 : « CONTENT attendu à 0 (aucun fichier sous `apps/site/app/docs` … ) »), or trois pages `/docs` le consomment à `17147d3` avec le même `.some` sur les digests de la tête et rendent une affirmation d'ancrage.

**Preuve** (`git grep -n listedDigests 17147d3 -- apps/site`, lecture seule) :

| Fichier:ligne | Code | Phrase rendue |
|---|---|---|
| `apps/site/app/bell/page.tsx:255` | `.some((d) => anchors.listedDigests.includes(d))` | prévu par le G0 (T-B6) |
| `apps/site/app/bell/method/page.tsx:106` | idem | prévu par le G0 (T-B6) |
| `apps/site/app/docs/bell/page.tsx:31` | idem | `:202-204` « No anchor manifest lists the latest record's digests: it is signed and chained, not timestamp-anchored yet. » |
| `apps/site/app/docs/use-cases/page.tsx:68` | idem (`headAnchored`) | `:166` « The latest record … is signed and chained, not timestamp-anchored yet. » |
| `apps/site/app/docs/verify/page.tsx:41` | idem | `:52` étape « The timestamps » tracée en tirets tant que `anchored` est faux ; `:78-80` et `:136-138` « … Anchoring each published line with OpenTimestamps is in preparation; this gesture applies once it is served. » |

Ces trois consommateurs viennent de SITE-DOCS-1 (`0a632e5`, 2026-09-24T16:49:39Z, fusion `0e70fae`), ancêtre de la base du G0 `0e38b5d` (`git merge-base --is-ancestor 0a632e5 0e38b5d` vrai) ; le recensement du G0 (§1.2, §1.5, §1.7) ne cite que les lignes de `bell-anchors-load.ts` et les deux pages Bell. Aucun test n'épingle les phrases `/docs` (recherche de « timestamp-anchored yet », « in preparation », `headAnchored` sous `test/` : 0 résultat).

**Pourquoi cela bloque PR-B2** : exécuté tel qu'écrit, D-B7 fait rougir `typecheck` et `next build` sur trois fichiers hors de la liste fermée du §4.1 ; gardé, `listedDigests` ne réunit que des manifestes de course (garde E-9 : `loadAnchors()` ne lit pas `publications.json`), donc le `.some` des pages `/docs` reste faux pour toujours, et `/docs/verify` dirait « in preparation … applies once it is served » le jour où `/bell` dit `pending` (premier build de PR-B2), puis `anchored` (après la mise à niveau, D-B16). Deux surfaces servies se contrediraient ; ce n'est pas un item qu'on peut garer sans règle d'upload.

**Ce qui a été fait** : la seule partie que la contradiction n'atteint pas, la coupe PR-B1 écrite par le G0 lui-même (§2.3 : T-B1, T-B2, T-B3 et la partie « ordre des synchros » de T-B11 ; « aucune page, aucune phrase publique ne change ; la garde E-9 reste ; `bell-anchors-load.ts`, les pages, `assert-fleet-html.mjs` et `fleet.ts` ne sont pas touchés »), réutilisée ici sous un autre déclencheur que le sien (R-25 > 1 150), écart E-1 (§9). Rien n'a été écrit dans le chargeur, les pages, `/docs`, `assert-fleet-html.mjs`, `fleet.ts` ni les gardes D8 : T-B4 à T-B10 ne sont pas commencés.

**Options** (aucune tranchée ici) :
- **(a) Étendre PR-B2 aux trois pages `/docs`** : l'état de la tête y est calculé par `publicationAnchorState` (mêmes entrées que `/bell`) et rendu par `publicationAnchorSentence` ou par un renvoi vers `/bell` ; `/docs/verify` passe `today: state.state === "anchored"` ; `listedDigests` est retiré comme prévu (D-B7 et M-6 redeviennent vrais). Conséquences : R-25 CONTENT > 0 (les trois fichiers sont des chemins CONTENT, `ci.yml:86`, borne 8 000, régime de la décision 207 ; estimation 15 à 30 lignes) ; des phrases `/docs` nouvelles (attaques ou renvois) hors de la liste fermée du §4.3, à faire accepter ; §4.1 et §4.2 étendus ; la garde D8 couvre déjà `/docs` (aucun changement de portée) ; T-3b peut être étendu à `/docs/verify` (facultatif).
- **(b) Garder `listedDigests` pour les seules pages `/docs`** (écart à D-B7), `/docs` inchangées dans PR-B2, item formé : alors l'item doit être livré avant l'upload de PR-B, sinon le site sert une contradiction entre `/bell` et `/docs` ; en pratique, (a) dans une PR séparée avant l'upload.
- **(c) PR-B2 sans `/docs` et sans upload** jusqu'à ce qu'un lot `/docs` soit livré : (b) avec une porte d'upload explicite.

**Recommandation du worker : (a)**, parce qu'une seule source d'état pour toute surface qui affirme l'horodatage de la tête (R-3) ; parce que l'arbitrage §0 bis point 2 de l'ADR mère (« les deux défauts actuels (`.some`, preuve pendante comptée) sont corrigés dans PR-B ») vise le défaut là où il est rendu ; et parce que `/docs/verify:136-138` (« in preparation ») est déjà inexact depuis l'upload 17, qui a servi le manifeste de seq 2 et sa preuve (`docs/JOURNAL-PROVENANCE.md:398`, sondes de l'orchestrateur depuis le VPS, 10 chemins sur 10 à 200 ; lu, non re-sondé ici). Les textes `/docs` sont à écrire sous le régime que l'orchestrateur nommera.

**Ce que PR-B1 exige avant tout commit vert (dépendance de build)** : livrée telle quelle, la branche ne construit pas sans l'artefact v4 (`next build` exit 1, 16 rouges de `npm test`, tous dus au refus du fichier v3, §4). Séquence attendue de l'orchestrateur, dans le worktree : `node scripts/sync-bell-served.mjs` (six GET ; écrit `bell-served.json` v4 et son entrée du manifeste, imprime le sha256) ; `PINNED_FILE_SHA256` de `test/bell-served.test.ts:67` re-posé sur ce sha256 (E-4 ; par un worker si l'orchestrateur y voit un pli de code, FOLD-BY-WORKER-1) ; `npm test` sur `test/bell-served.test.ts` et `test/bell-anchors.test.ts`, puis l'oracle complet ; commit du code et des données ensemble (ou deux commits successifs, l'intervalle rouge déclaré). `node scripts/sync-bell-anchors.mjs` n'a rien à réécrire (C-V-1 : servi octet pour octet), mais refuse de tourner tant que les données sont v3.

**Décision attendue** : de l'orchestrateur (périmètre de PR-B2, régime des phrases `/docs`, compte CONTENT) ; avis de l'agent ADVISOR sur demande de l'orchestrateur (canal 2). `error_origin` proposés, à assigner au G7 : rédaction du G0 de PR-B (recensement de `listedDigests` limité à `bell-anchors-load.ts`) ; checkpoint-1 de PR-B (non relevé) ; SITE-DOCS-1 (trois reprises du `.some` que D5 retirait, sans item vers PR-B).

## 1. Journal de provenance (gabarit du corpus)

| Date | PR/commit | Modèle (identifiant épinglé exact) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-25 | PR-B1 du lot BELL-OTS-ANCHOR-1 (coupe §2.3 du G0), non committée, base `17147d3` | `claude-opus-5-5` | max | ADR-BELL-OTS-PRB @ `17147d3` (G0 plié, rulings 214 et 215) + ADR mère + mission G1 de l'orchestrateur `claude-fable-5-1` | worker | orchestrateur (R-21), puis G2 et checkpoint-2 | en attente |

`error_origin` proposés (worker), à assigner au G7 : (a) la contradiction du §0 (voir ce §) ; (b) l'écart R-25 de PR-B1 (321 mesurées contre environ 176 estimées, §7) : planification (estimation des tests) et génération.

## 2. Fichiers livrés (sha256 des octets du worktree, LF)

| Fichier | État | +/− (pathspec R-25) | sha256 livré | sha256 à `17147d3` |
|---|---|---|---|---|
| `apps/site/lib/bell-served-load.ts` | schéma v4, `lines[]` (chargeur fail-closed et projection), `setManifestEntry` | 39/6 | `15ddace27f8ea521644dadb3e69facf59433448679ee5aaed4cc7c5a8373fc67` | `b44941d4…7826` |
| `scripts/sync-bell-served.mjs` | v4 ; écrit l'entrée du manifeste de données (SYNC-MANIFEST-WRITE-1) | 13/7 | `1bb60dbbf5a59a3fcdac50eba4c96eb4ef4a5224fe83b0077635d8cfbd4b5bbc` | `019a3094…b85b` |
| `apps/site/lib/bell-anchors.ts` | `bindPublicationRowToLines`, type `TimelineLineFacts`, ligne D-B15 du parseur ; code de course inchangé | 20/3 | `023ae095b8dacd3c74a8013230f98f7bb4919cc389ccd78c6c8a41788bc3b8a7` | `1e30ce63…b153` |
| `scripts/sync-bell-anchors.mjs` | liaison de chaque ligne de publication à `lines[]`, `noLinkOnPath` | 35/5 | `2ee55ea3ea7a719292d52719bc35f7504b3e64ffc333ba087bbdb09c3564c9ba` | `4bf6df19…e391` |
| `test/bell-served.test.ts` | L-1 à L-8 bis, `lines[]` épinglé, `lines[].seq`, test de l'entrée du manifeste | 43/1 | `a31487eea0a2865a7a2f042c245e4540b1a1028005986ef71e1522426246b406` | `da6fc06c…87b8` |
| `test/bell-anchors.test.ts` | `syncRoot()`, T-2 étendu, S-1 à S-11, CM-13, C-V-1, liens B1 à B6, erreurs nommées | 135/14 | `e5456067125ab0b848e8c230ab1692db90c25f1649da29058f5273796ecafe69` | `5a21114f…4576` |
| `docs/RUNBOOK-bell.md` | 13 bis point 6 (une mise à niveau ne relance pas `sync-bell-served`), « Next publications » (ordre des synchros ; phrase périmée BELL-SITE-SEQ2-1 réécrite) | exclu (9/5) | `885fa27852854830680886585deb497bef239a84ef9b065d63778b7108c1b67a` | `5ceec718…496c` |
| `docs/RUNBOOK-vitrine.md` | étape 0 : deux registres, ordre des deux synchros | exclu (1/1) | `273d0965cc6a02854a103c96c0760a70ad1f0e1f9ce179c5137c5e67269400d0` | `32ace7b4…3ecf` |
| `docs/G1-lot-bell-ots-prb.md` | ce journal | exclu | dans `F:\tmp\ots-prb\g1\DELIVERED.sha256` | absent |

**Non livré, acte de l'orchestrateur (ruling 215, D-B12)** : `apps/site/data/bell-served.json` reste v3 (`d93c6878…4025`), `apps/site/data/manifest.sha256.json` et l'épingle `PINNED_FILE_SHA256` de `test/bell-served.test.ts:67` aussi. Après les six GET de `node scripts/sync-bell-served.mjs` : la synchro écrit `bell-served.json` v4 et son entrée du manifeste, et imprime le sha256 à re-poser dans `PINNED_FILE_SHA256` (écart E-4, §9).

## 3. Correspondance tâches du G0 → livrable

| Tâche (G0) | Livré | Où | Preuve |
|---|---|---|---|
| T-B1 `lines[]` v4 (D-B2) | schéma `monark-site-bell-served-v4` ; `BellServedTimelineLine` ; `lines` dans l'ensemble fermé des clés ; chargeur : `lines.length === timeline.lines`, entrée i = ligne i + 1, clés exactes par `kind` (état et provenance pour une `publication` seulement), `kind` dans la liste fermée de `bell-chain.mjs:102` (recopiée, le module n'importe rien), chaînage depuis la genèse, nombre de publications, faits de `first_record` et de `head`, aucune publication après la tête ; `buildBellServed` émet `lines` (ordre des clés : après `timeline`) ; `$comment` étendu | `apps/site/lib/bell-served-load.ts` | `bell_served_build_binds_the_latest_publication_not_the_first` (L-1, `lines[]` = recalcul sur la fixture signée) ; `bell_served_first_record_and_latest_publication_pinned` (`lines[]` = tableau du §1.1 par les épingles de tête et de premier enregistrement) ; `bell_served_loader_is_fail_closed` (L-2 à L-8 bis, copies hachées) ; rejeu hors ligne (§5) |
| T-B1, SYNC-MANIFEST-WRITE-1 (C-9 (i)) | `setManifestEntry(text, rel, sha256)` (pure ; exactement une entrée, 64 hex ; tous les autres octets gardés) ; la synchro la calcule avant toute écriture, écrit les deux fichiers et imprime le sha256 à épingler | `bell-served-load.ts`, `scripts/sync-bell-served.mjs` | `bell_served_sync_sets_its_manifest_entry_only` (copie en mémoire ; E-3) |
| T-B2 synchro liée (D-B3) | `bindPublicationRowToLines(row, entries, lines)`, quatre erreurs nommées mot pour mot (« seq <n> is beyond the served lines (run the served-data sync first) », « line_hash is not that of line <n> », « kind is not that of line <n> », « the manifest's files are not those line <n> names ») ; une ligne sans preuve ne subit que les trois premiers contrôles ; la synchro lit `lines[]` par `loadBellServed` (hachage vérifié ; un fichier v3 est refusé) et lie chaque ligne de publication, horodatée ou non, avant toute écriture | `apps/site/lib/bell-anchors.ts`, `scripts/sync-bell-anchors.mjs` | S-1 à S-4, CM-13, S-3 = G2-M7 (§6) |
| T-B2 aucun lien suivi (D-B4) | `noLinkOnPath(rel, dir)` : `lstat` de chaque composant depuis la racine, répertoire réel pour chaque intermédiaire, fichier régulier pour la feuille ; appliqué aux deux registres, aux deux fichiers de données avant `loadBellServed`, à chaque preuve et manifeste (remplace l'ancien `:57`), au répertoire servi avant le balai | `scripts/sync-bell-anchors.mjs` | `bell_anchors_sync_follows_no_link` (B1 à B6) |
| T-B2 D-B15 (OTS-REF-STRICT-1) | un `ots_ref` qui n'est pas un nom `.ots` doit être exactement `not timestamped at <ISO Z>` (erreur nommée « is neither a proof name nor 'not timestamped at <ISO Z>' ») ; parseur de course inchangé | `apps/site/lib/bell-anchors.ts` | S-11 (unité et synchro) |
| T-B3 tests de la synchro | `syncRoot()` (R-3) : refuse tout lien dans les sources copiées (`lstat` récursif) AVANT `cpSync` (TEST-CPSYNC-SYMLINK-1), manifestes de course aux octets servis (aucun `git show`), nettoyage en `finally` (TMP-HYGIENE-1 pour ce fichier) ; C-V-1 ; CM-13 et S-1 à S-4, S-11 sur `syncRoot()` ; liens B1 à B6 (saut par nom sur EPERM) ; T-2 étendu (chaque ligne servie liée à `lines[]` committé) ; erreurs nommées étendues ; **garde E-9 gardée** (§2.3 du G0) | `test/bell-anchors.test.ts` | §4, §6 |
| T-B11, partie « ordre des synchros » | RUNBOOK-bell (13 bis point 6 ; « Next publications ») et RUNBOOK-vitrine (étape 0) | `docs/` | lecture |
| T-B4 à T-B10 | **non commencés** (STOP, §0) | — | — |

## 4. Oracle (ceinture ci-dessus ; journaux sous `F:\tmp\ots-prb\g1\oracle\`)

Trois arbres, clones partagés du dépôt à `17147d3`, jamais le worktree : `base` (propre) ; `v4tree` = les fichiers livrés copiés à l'octet (`tools/overlay.sh`, sha256 comparés un à un) plus **trois substitutions déclarées** (`tools/v4subst.sh`) : `apps/site/data/bell-served.json` ← la fixture v4 du §5, son entrée du manifeste ← le sha256 de la fixture (par `setManifestEntry`), `PINNED_FILE_SHA256` ← ce même sha256 ; `tree` = les fichiers livrés seuls, données v3 committées (l'état réel de la livraison).

| Porte | Base `17147d3` | PR-B1 sur `v4tree` (final) | Journal |
|---|---|---|---|
| `npm run typecheck` | exit 0 | exit 0 | `base-typecheck.log`, `v4final-typecheck.log` |
| `npm run lint` | exit 0 | exit 0 | `*-lint.log` |
| `npm run lint:ratchet` | 69/69 | **69/69** | `*-lint-ratchet.log` |
| `npm run gate:vocab` | exit 0, 313 fichiers | exit 0, 313 fichiers | `*-gate-vocab.log` |
| `npm run lang:gate` | exit 0 | exit 0 | `*-lang-gate.log` |
| `npm run export:check` | exit 0 | exit 0 | `*-export-check.log` |
| `node --check` des trois `.mjs` du lot (`sync-bell-anchors`, `sync-bell-served`, `assert-fleet-html`) | ok | ok | `*-node-check.log` |
| `npm run build -w @monark/site` (`.next` supprimé avant) | exit 0, 41 pages | exit 0, 41 pages | `*-build.log` |
| `node scripts/assert-fleet-html.mjs` | exit 0 | exit 0 | `*-assert-fleet.log` |
| rendu (`renderedBody()` de chaque page, balise `next-size-adjust` retirée, RENDER-FINGERPRINT-NONDET-1) | 41 empreintes | **41 empreintes identiques** (fichier d'empreintes sha256 `8fbd2be8…3620` des deux côtés) ; trois builds déclarés : un de la base, deux de PR-B1 (préliminaire et final), identiques | `base-rendered.sha`, `pre-v4-rendered.sha`, `v4final-rendered.sha` |
| `npm test` complet | tests 1302, pass 1300, fail 0, skipped 2 (01:37:07Z-01:43:22Z) | **tests 1311, pass 1309, fail 0, skipped 2** (02:14:18Z-02:20:27Z) ; +9 = `bell_served_sync_sets_its_manifest_entry_only`, `bell_anchors_sync_rewrites_the_served_set_byte_for_byte`, `bell_anchors_sync_follows_no_link` et ses six sous-tests ; sauts identiques à la base, par nom (`sentinel_run_releases_chainstack_lock_on_sigterm`, win32 ; `u4b_labels_replay_via_main_real_artifact`, artefacts absents) ; 0 saut dans le test des liens | `base-test.log` (sha256 `86ce19f2…57f4`), `v4final-test.log` (`deded42e…b3b5`) |

**Livraison telle quelle (`tree`, données v3 committées), rouges déclarés avec leur motif unique** : le chargeur v4 refuse le fichier v3 (« bell served: file must carry exactly {$comment, schema, host, read_at, timeline, lines, … } », la clé `lines` manque) ; l'artefact v4 est dû par l'acte de l'orchestrateur (ruling 215, D-B12). Mesure (02:20:55Z-02:27:56Z, `v3asis-summary.txt`, `v3asis-classified.txt`) : les six portes statiques et `node --check` à exit 0 ; `next build` exit 1 (pages Bell, même refus), donc `assert-fleet-html` exit 1 (artefact absent) ; `npm test` : tests 1311, pass 1293, **fail 16**, skipped 2. Les 16 = 15 tests, chacun portant ce refus dans sa trace (15 sur 15, vérifié par programme), plus le parent du sous-test B4 : `bell-served.test.ts` (8 : premier enregistrement et tête épinglés, deploy check, révision du collecteur, aucune valeur de marché, chargeur fail-closed, liste fermée, valeurs jamais tapées, appariement), `bell-anchors.test.ts` (4 : T-2, refus de la synchro, C-V-1, B4, dont la synchro refuse au chargement avant d'atteindre le contrôle du répertoire servi), `bell-method.test.ts` (2), `site-build-fleet.test.ts` (1, `register_pages_read_served_bell_facts_never_typed`). Aucun autre rouge. Cette liste a été classée après le passage (post hoc), par programme sur les traces, et non écrite avant.

**Sondes servies** (`next start -H 127.0.0.1 -p 3072` sur `v4tree`, 02:20:38Z-02:20:41Z, `tools/probe.mjs`, `probe.log`) : `/bell` 200, phrase `none` (S-0) présente, « proves » ×2 (la phrase de `page.tsx:693-695`, que P-B5 remplace en PR-B2), 0 forme fournisseur ; `/bell/method` 200 ; `/bell/anchors` 200, 0 forme fournisseur ; après l'arrêt, **0 écouteur** sur le port 3072 (`netstat -ano`). PR-B1 ne change aucune phrase servie : attendu.

**Export réel** (`node scripts/export-public.mjs --out F:/tmp/ots-prb/g1/export`, sur `v4tree`, `export-real.log`) : exit 0, 483 fichiers ; 17 `.ots`, tous sous `apps/site/public/bell/anchors/` ; 0 `fixture-*` ; 0 fichier `test/` racine ; les deux synchros non exportées ; `assert-fleet-html.mjs`, `bell-served-load.ts`, `bell-anchors.ts`, `publications.json` exportés ; `EXPORT-MANIFEST.json` sha256 `559cfd297b66ffe3f1ab54605b2111a7b540030b90c788c3317da4f2925d1d87` (il porte la fixture v4, pas l'artefact réel).

## 5. Rejeu hors ligne (G0 §5 point 5) : la fixture v4 est `buildBellServed` sur des octets réels

`F:/tmp/ots-prb/g1/tools/build-v4-fixture.mjs` (sha256 `532c72ef…27fc`, sortie `oracle/v4-fixture-build.log`) appelle le `buildBellServed` livré, hors ligne, sur : la copie durable de la timeline servie (`F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl`, 2 407 o, sha256 `fba1824d…d28b`) ; les deux immuables de seq 2 du miroir durable (`4564701a…08b9`, 14 070 o ; `ad8dd9b0…c39b`, 1 202 o) ; l'immuable d'état de seq 1, `F:/tmp/ots-1/cp1/a828489f…a240.json` (5 326 o, capturé par le checkpoint-1 de PR-A le 2026-09-24 ; sha256 égal à son nom, vérifié ; **copie volatile**, item E-5) ; le trousseau committé (239 o, `beec868a…ef81`, = `bodies_sha256` du trousseau servi et `keyring_sha256` du deploy check) ; le deploy check committé (`8942b973…b396`) ; la révision du collecteur et `read_at` du fichier v3 committé (révision relue : `git log -1 -- apps/bell/src` = `3bda2cad…`, 2026-09-24T02:24:30Z, égale). Contrôles, tous verts :
- `lines[]` = le tableau du §1.1 du G0, tapé depuis l'ADR (indépendant du constructeur) ;
- recalcul indépendant : sha256 de chaque ligne brute sans son LF = `line_hash`, `prev_line_hash` lu dans la ligne = chaînage du tableau ;
- la fixture moins `{$comment, schema, lines}` égale, en profondeur, le fichier v3 committé moins les mêmes clés : la projection est inchangée pour tout le reste ;
- sha256 (CRLF→LF) de la fixture : `214b00f2191c80c338bbd6bb9776c513a321641220445fee6a9a4cacddffeddd` ; le manifeste de la fixture ne diffère du committé que par l'entrée de `bell-served.json`.

L'artefact réel diffèrera de cette fixture par `read_at` (et par tout corps servi qui aurait changé, ce que le deploy check committé fait refuser, `bell-served-load.ts:526` à `17147d3`).

## 6. Mutants (sur `v4tree`, jamais le worktree ; exécuteur `tools/mutants.mjs`, liste `oracle/mutants.json`, résultats `oracle/mutants.tsv`)

Chaque mutant : chaque motif remplacé existe exactement une fois, octets d'origine restaurés, sha256 revenu à la valeur lue avant (« restored » pour les 25) ; `git status --short` de `v4tree` et sha256 des 10 fichiers modifiés identiques avant et après la série. **25 sur 25 tués**, aucun survivant, aucune seconde tentative.

| Id | Mutation | Test rouge |
|---|---|---|
| L-1 | `buildBellServed` n'émet pas `lines` | `bell_served_build_binds_the_latest_publication_not_the_first` |
| L-2 | chaînage `prev_line_hash` non contrôlé | `bell_served_loader_is_fail_closed` (erreur nommée attendue) |
| L-3 | `seq` d'une entrée non contrôlé | idem |
| L-3 bis | `kind` hors liste fermée accepté | idem |
| L-4 | faits de `first_record` et de `head` non comparés à `lines[]` | idem |
| L-5, L-6 | clés exactes par `kind` relâchées (sous-ensemble des six clés) | idem (les deux cas) |
| L-7 | une publication après la tête acceptée | idem |
| L-8 | `lines.length` non comparé à `timeline.lines` | idem |
| L-8 bis | nombre de publications non comparé | idem |
| S-1 | `line_hash` de la ligne non comparé | refus de la synchro + erreurs nommées |
| S-2 | `seq` au-delà de `lines[]` non refusé par son nom | idem |
| S-3 | fichiers du manifeste non comparés à ceux de la ligne | idem |
| S-4 | `kind` non comparé | idem |
| S-5..S-10 | `noLinkOnPath` sans effet | B1, B2, B3, B4, B5, B6 rouges (les six, rejoués un à un, `mutant-links.json`) |
| S-9 seul | répertoire servi non contrôlé avant le balai (SYNC-SERVED-JUNCTION-1) | B4 |
| S-10 seul | données du site non contrôlées | B6 |
| S-5/S-6 seuls | registres non contrôlés | B1, B2 (B3 et B5 restent refusés par les chemins des preuves : défense en profondeur) |
| S-11 | ligne D-B15 retirée | refus de la synchro + erreurs nommées |
| SYNC sans preuve | lignes non horodatées non liées à `lines[]` | refus de la synchro (S-1, S-2, S-4) |
| SYNC horodatée | lignes horodatées non liées à `lines[]` (G2-M7 à la synchro) | refus de la synchro (S-3) |
| CM-13 | `bindPublicationAnchor` retiré de la synchro | refus de la synchro (erreur nommée attendue) |
| C-V-1 | `publications.json` non écrit | `bell_anchors_sync_rewrites_the_served_set_byte_for_byte` |
| SMW-a | une entrée listée deux fois acceptée | `bell_served_sync_sets_its_manifest_entry_only` |
| SMW-b | entrée calculée mais non écrite par la synchro | idem |
| S-3-T2 | G2-M7 appliqué aux données committées (registre, manifeste et preuve, source et servi ; digest `67b917e3…6aee`) | T-2 (`bell_publication_anchors_served_register_matches_source`) |

Mutants du G0 **non rejoués**, faute de code (STOP, §0) : M-1 à M-9 (T-1), M-5, M-5 bis, M-5 ter, M-6, M-10, M-11, M-12 (chargeur, pages, T-3). Survivant connu hors liste : aucun ; la branche `git show` de la synchro reste sans test (SYNC-GITSHOW-BRANCH-TEST-1, C-6).

## 7. R-25

- Méthode : `F:/tmp/ots-prb/g1/tools/r25.sh` sur le clone `tree` (fichiers livrés) : pathspec CODE de `.github/workflows/ci.yml:82` et CONTENT de `:86` extraits du fichier, `awk` de `:90` extrait tel quel ; `git diff --shortstat 0e38b5d -- <pathspec>` (`0e38b5d` = base de fusion avec `lot/etude-suite`, recalculée dans le clone) ; aucun fichier non suivi dans cette coupe ; l'index réel n'est ni lu ni écrit (aucun `GIT_INDEX_FILE`). Sortie `oracle/r25.log`.
- **CODE : 6 fichiers, 285 insertions, 36 suppressions = 321 lignes** ; **CONTENT : 0**. Sous le seuil STOP de 1 150 et le plafond de 1 205.
- Base : la tête de `F:/Monark` a bougé pendant la session (en-tête) ; tous les clones sont épinglés sur `17147d3` et la base de fusion avec `lot/etude-suite` était `0e38b5d` au moment de la mesure (`r25.log`).
- Après l'acte D-B12 de l'orchestrateur, le lot comptera en plus `bell-served.json` (environ 24 lignes), `manifest.sha256.json` (2) et l'épingle (2) : environ 349.
- Écart : le G0 estimait PR-B1 à environ 176 lignes (données comprises) ; 321 sans les données. Cause : les tests (`test/bell-anchors.test.ts` +135/−14 contre 55 estimées : `syncRoot()`, table des refus avec la construction de G2-M7, six cas de liens ; `test/bell-served.test.ts` +43 : neuf cas `lines[]`, test de l'entrée du manifeste).

## 8. Tuyaux après PR-B1 (règle Branchement)

| Tuyau | Entrée | Sortie, consommateur | État | Test non-LLM | État après PR-B1 |
|---|---|---|---|---|---|
| `lines[]` (T-B1) | timeline servie, marchée sous le trousseau committé (`buildBellServed`, par `sync-bell-served.mjs`) | `lines[]` → la synchro des ancres (branché), T-2 (branché) ; le chargeur et les pages : PR-B2 | `apps/site/data/bell-served.json` (v4 après D-B12) | build (L-1), chargeur (L-2..L-8 bis), rejeu §5 | **câblé jusqu'à la synchro** ; artefact dû (ruling 215) |
| P-4 registre → servi (T-B2) | deux registres, manifestes, preuves, `lines[]` | `apps/site/public/bell/anchors/` | dépôt | C-V-1, T-2, S-1..S-11, CM-13, B1..B6 | câblé, lié à la chaîne, sans lien suivi |
| P-5 servi + tête → affirmation | — | — | — | — | **inchangé** (le `.some` des pages demeure, garde E-9 gardée) : PR-B2, bloqué par le §0 |
| manifeste de données (SYNC-MANIFEST-WRITE-1) | `sync-bell-served.mjs` | `apps/site/data/manifest.sha256.json` → `loadBellServed` | dépôt | `bell_served_sync_sets_its_manifest_entry_only` | câblé ; la synchro réelle (six GET) n'est exécutée que par l'orchestrateur |

## 9. Écarts déclarés

- **E-1 Coupe PR-B1 sous un autre déclencheur** : le G0 écrit la coupe pour R-25 > 1 150 ; elle sert ici de périmètre maximal non atteint par la contradiction (§0). Composition tenue telle quelle : T-B4 (état) et T-B7 (T-1), pourtant sans lien avec `/docs`, ne sont pas avancés, pour ne pas livrer une fonction sans consommateur servi ni dupliquer `utcLabel` (qui vit dans `bell-anchors-load.ts`, intouchable en PR-B1).
- **E-2 R-25** : 321 contre environ 176 (§7).
- **E-3 SYNC-MANIFEST-WRITE-1** : le G0 demande un test « sur une copie temporaire du manifeste » ; le test travaille sur une copie en mémoire (même propriété : seul l'octet de la valeur change), sans fichier temporaire.
- **E-4 Épingle `PINNED_FILE_SHA256`** : le G0 dit à la fois « `bell_served_data_is_listed_and_hash_pinned` est vert après la régénération sans édition manuelle » (T-B1) et « `:67` sha256 v3 → sha256 v4 » (§1.7). Lecture retenue : la synchro écrit le manifeste (plus d'édition manuelle du manifeste) ; l'épingle littérale reste (garde de revue) et se re-pose dans l'acte D-B12, sur le sha256 que la synchro imprime ; sa valeur n'est pas connaissable avant les GET (`read_at`). Si l'orchestrateur tient le pli d'une épingle pour un pli de code (FOLD-BY-WORKER-1), il revient à un worker.
- **E-5 Immuable d'état de seq 1** : la fixture v4 a lu `F:/tmp/ots-1/cp1/a828489f…a240.json` (volatile) ; l'orchestrateur peut le verser au miroir durable, comme SEQ2-IMMUTABLES-MIRROR-1 l'a fait pour seq 2 (aucune écriture du worker hors `F:/tmp/ots-prb/g1/`).
- **E-6 Liens sous win32** : les six cas ont tourné sur ce poste (0 saut) : `symlinkSync(…, "file")` réussit (Mode développeur actif : `AllowDevelopmentWithoutDevLicense = 0x1`, lu dans le registre). Mesure `lstat` (C-7), Node v24.15.0, win32 : une jonction donne `isSymbolicLink() = true`, `isDirectory() = false` (et `statSync` la suit : `isDirectory() = true`) ; un lien fichier donne `isSymbolicLink() = true`, `isFile() = false` (`oracle/lstat-win32.log`). La preuve CI ubuntu que C-7 demande pour B1, B2 et B6 reste à citer au G7.
- **E-7 Copies de travail** : clones partagés au lieu de `git archive` (les tests de révision du collecteur exigent `.git`), comme la mission le prévoit.

### Écarts à l'ADR mère constatés (C-10 : la ligne datée est l'acte de l'orchestrateur ; rien n'est écrit dans l'ADR mère)

- `lines[]` porte `state_sha256` et `provenance_sha256` pour une ligne `publication` (amendement de D5 :206, décidé par l'orchestrateur, `docs/CHANTIERS.md:1445`) : exécuté.
- D3 :167 précisé pour le seul registre des publications (option (b) de P-6, D-B15) : exécuté.
- PR-B coupée en PR-B1 livrée et PR-B2 bloquée (D9.3 prévoyait une PR) ; `/docs` absent de D5, D7 et D9.3 (§0).
- Anomalie de datation, pour l'orchestrateur : l'en-tête des rulings du G0 dit « 2026-09-25 01:45 UTC », alors que le commit qui les porte, `17147d3`, est daté 2026-09-25T02:12:54+01:00, soit 01:12:54Z (`git log -1 --format=%cI`).
- Les autres écarts que le G0 déclare (signature `(head, lines, bound)`, « UTC » de S-1, ré-épingle de `site-build-fleet`, attribution de M-6, « before » de D6 :219) portent sur PR-B2, non exécutée.

## 10. Items

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **PRB-DOCS-LISTEDDIGESTS-1** (nouveau, §0) | décision puis code | trois pages `/docs` consomment `listedDigests` et rendent l'affirmation d'ancrage de la tête | décision de l'orchestrateur sur la consultation du §0, avant tout lancement de PR-B2 | orchestrateur |
| D-B12 (G0), ruling 215 | acte | six GET de `sync-bell-served.mjs`, commit de `bell-served.json` v4 et de son entrée du manifeste, épingle `PINNED_FILE_SHA256` re-posée (E-4) ; contrôle hors ligne de `lines[]` : fait sur la fixture (§5), à refaire sur l'artefact | après ce G1, avant la G2 de PR-B1 | orchestrateur |
| SEQ1-IMMUTABLE-MIRROR-1 (nouveau, E-5) | procédure | verser `states/a828489f…a240.json` au miroir durable (seule copie locale : `F:/tmp/ots-1/cp1/`, volatile) | avant la prochaine régénération hors ligne ou le prochain rejeu | orchestrateur |
| SYNC-LSTAT-PATH-1, SYNC-SERVED-JUNCTION-1, TEST-CPSYNC-SYMLINK-1, C-V-1, OTS-REF-STRICT-1, SYNC-LINES-CHECK-1 étendu, SYNC-MANIFEST-WRITE-1 (ce script) | code | **absorbés** par PR-B1 (§3, §6) ; SYNC-LSTAT-PATH-1 : B1..B6 verts localement, preuve CI ubuntu à citer au G7 (C-7) | G7 de PR-B1 | orchestrateur |
| TMP-HYGIENE-1 | code | absorbé pour `test/bell-anchors.test.ts` (tous les temporaires en `finally`) ; reste ouvert ailleurs, déclencheur inchangé | inchangé | orchestrateur |
| PRB-LOADER-GUARD-1, PRB-BIND-IN-LOADER-1, FIXTURE-GEN-VERSIONED-1, RENDER-FINGERPRINT-NONDET-1 (méthode appliquée ici : balise retirée, trois builds), BELL-D8-PROVES-1, BELL-METHOD-ANCHOR-1 | code | **non absorbés** : PR-B2 | décision du §0 puis PR-B2 | orchestrateur, puis worker |
| SYNC-GITSHOW-BRANCH-TEST-1, SCRIPTS-STATIC-COVERAGE-1, mise à niveau de la preuve de seq 2, BELL-OTS-NODE-VERIFY-1 et les items du §3.2 et §3.3 du G0 | — | inchangés | ceux du G0 | ceux du G0 |

## 11. Ce que je n'ai pas pu confirmer

1. **L'artefact v4 réel** : non produit (ruling 215) ; tout l'oracle vert porte sur la fixture v4 du §5 ; l'égalité de `lines[]` avec l'artefact réel est à rejouer après les GET de l'orchestrateur.
2. **La branche réseau de `sync-bell-served.mjs`** (GET, `git log`, écriture des deux fichiers) : non exécutée ; seules `buildBellServed` et `setManifestEntry` sont éprouvées hors ligne, plus deux épingles de source sur la synchro.
3. **Absence de trafic réseau pendant `npm test`** : non surveillée (aucun outil de capture) ; les tests se déclarent hors ligne (par exemple `apps/sentinel/test/ukemi-conc.test.ts:1-9`, `fetch` remplacé) et aucune variable payante n'était posée.
4. **Run CI ubuntu** du test des liens (C-7) : hors de portée du worker (aucun workflow déclenché, R-20).
5. **Mesure à 375 px** et **liens** (`mobile375.mjs`, `links.mjs`) : non exécutées ; les 41 pages rendues sont identiques à la base (§4), donc sans objet pour PR-B1 ; dues avec PR-B2.
6. **G2-M7 sur la synchro réelle du dépôt** : rejoué sur copies seulement (`syncRoot()`, `v4tree`).

## 12. Sources et niveaux

- [lu] `docs/adr/ADR-BELL-OTS-PRB.md` à `17147d3`, en entier ; `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` :1-80 et :150-386 ; `F:\tmp\ots-prb\cp1\CP1-report.md` (recherches C-9, P-7, P-11 ; sha256 `9b96e674…673b`) ; `docs/G1-lot-bell-ots-anchor-1-pr-a.md` en entier.
- [lu] dépôt à `17147d3` : `apps/site/lib/bell-anchors.ts`, `bell-anchors-load.ts`, `bell-served-load.ts` en entier ; `scripts/sync-bell-anchors.mjs`, `sync-bell-served.mjs`, `assert-fleet-html.mjs` et `.d.mts` ; `scripts/export-public.mjs:40-120` ; `test/bell-anchors.test.ts`, `test/bell-served.test.ts` en entier ; `test/site-build-fleet.test.ts:975-1005`, `:1111-1180` ; `test/site-docs.test.ts:40-100`, `:670-734` ; `test/public-surfaces-honesty.test.ts:1-80` ; `test/ci-gates.test.ts:920-935`, `:1040-1100` ; `test/verify-bell.test.ts:200-236` ; `test/bell-anchor-timeline.test.ts:1-45`, `:90-110` ; `test/site-ukemi.test.ts:55-80`, `:170-185` ; pages `/bell`, `/bell/method`, `/bell/anchors`, `components/bell/anchors-table.tsx`, `contact.tsx` ; `apps/site/app/docs/{bell,use-cases,verify}/page.tsx` (sections citées au §0) ; `apps/site/lib/fleet.ts:330-360` ; `apps/site/test/honesty-lint.ts:1-75`, `honesty-lint.exempt.json` ; `vocab-banned.json` ; `tsconfig.json`, `apps/site/tsconfig.json`, `package.json`, `apps/site/package.json`, `next.config.mjs` ; `.github/workflows/ci.yml:40-100` ; `docs/RUNBOOK-bell.md:425-470`, `docs/RUNBOOK-vitrine.md:1-30` ; `docs/bell-publications/` ; `docs/CHANTIERS.md:1422`, `:1469` (recherches) ; `apps/bell/scripts/bell-chain.mjs:40-160`.
- [lu] hors dépôt, lecture seule : `F:/PRODUITS/bell-mirror/` (listing, sha256) ; `F:/tmp/ots-1/cp1/` (listing, sha256 de l'immuable de seq 1) ; `F:/tmp/ots-1/cp2/scripts/` ; `F:/tmp/site-docs-1/g2/tools/{mobile375,links}.mjs` (en-têtes, sha256 `b6bac979…8d3b`, `dda562c3…efcd`).
- Mesures : toutes par les commandes et outils cités, journaux sous `F:\tmp\ots-prb\g1\oracle\` ; aucun chiffre de seconde main.

## 13. Artefacts hors dépôt (worker, non committés, `F:\tmp\ots-prb\g1\`)

Les sha256 complets des 32 artefacts ci-dessous sont dans `F:\tmp\ots-prb\g1\ARTIFACTS.sha256` (sha256 `ca0faa37c657b80ae9b4e0d89311593fbb8092ce144b934100a363d59d1228e5`), ceux des fichiers livrés dans `F:\tmp\ots-prb\g1\DELIVERED.sha256`.

| Fichier | Rôle |
|---|---|
| `tools/belt.sh` | ceinture |
| `tools/oracle.sh` | portes, `node --check`, build, assert, empreintes, `npm test`, résumé |
| `tools/overlay.sh`, `tools/v4subst.sh`, `tools/refresh-v4.sh` | copie des fichiers livrés sur un clone (sha256 comparés), trois substitutions v4 déclarées |
| `tools/build-v4-fixture.mjs` | fixture v4 et rejeu du §5 |
| `tools/gen-mutants.mjs`, `tools/mutants.mjs`, `tools/one.mjs` | liste des mutants, exécuteur (restauration contrôlée), rejeu d'un mutant avec le détail des sous-tests |
| `tools/r25.sh` | R-25 (pathspec et `awk` extraits de `ci.yml`) |
| `tools/rendered-sha.mjs`, `tools/probe.mjs` | empreintes de rendu, sondes servies sur le bouclage |
| `v4/bell-served.json`, `v4/manifest.sha256.json` | fixture v4 (sha256 CRLF→LF `214b00f2…eddd`) et son manifeste |
| `oracle/` | journaux : `base-*`, `pre-v4-*` (passage préliminaire), `v4final-*`, `v3asis-*`, `mutants.*`, `r25.log`, `probe.log`, `export-real.log`, `lstat-win32.log`, `v4-fixture-build.log` |
| `export/EXPORT-MANIFEST.json` | export réel de `v4tree` (`559cfd29…1d87`) |

## 14. Consultations de l'advisor (canal 1, conseil, jamais verdict)

- Après l'orientation, avant tout code : l'advisor a qualifié le recensement faux de `listedDigests` de contradiction ADR/code au sens de la règle d'arrêt, conseillé d'exécuter la seule partie que la contradiction n'atteint pas puis de s'arrêter avec la consultation formée, et jugé conforme aussi un arrêt sans code ; il a proposé la fixture v4 construite par `buildBellServed` sur les octets réels (entrées toutes présentes hors ligne), l'épingle v3 laissée à l'orchestrateur, la vérification du verrou avant `npm ci --offline`, l'extraction du pathspec R-25 par programme et la mesure de `lstat` sur une jonction. Retenu : tout, sauf l'extension de la coupe à T-B4 et T-B7 (E-1) et `git archive` pour la base (E-7).
- Avant la clôture, sur ce journal écrit : l'advisor a demandé de mesurer « rien d'indexé » au lieu de l'affirmer (fait, en-tête), d'écrire en tête du §0 la dépendance de build et la séquence de l'orchestrateur (fait), de noter le déplacement de la tête de `F:/Monark` et l'épinglage des clones (fait, en-tête et §7), de dire que la liste des rouges v3 a été classée après coup (fait, §4) ; il a retiré son avis d'étendre la coupe à T-B4 et T-B7 (E-1 tient) et confirmé la garde E-9 gardée, `noLinkOnPath` sur `isSymbolicLink()`, les quatre erreurs nommées et le traitement de « proves » ×2. Tout retenu.
- Ce journal est gelé avant un dernier passage complet de `npm test` sur `v4tree` qui l'inclut ; le résultat de ce passage est rendu hors du fichier, avec le sha256 du journal.
