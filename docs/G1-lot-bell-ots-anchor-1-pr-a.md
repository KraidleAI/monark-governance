# G1 : Lot BELL-OTS-ANCHOR-1, PR-A (outil d'ancrage P-1, registre des publications servi, RUNBOOK 13 bis)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max), déclaré à l'ouverture de la session (R-1).
Worktree `F:/Monark-wt-ots`, branche `lot/bell-ots-anchor-1`, base `1c78543` (arbre propre au démarrage) ; aucun commit, aucun workflow (R-20) ; rien n'est indexé (l'index réel ne porte aucun changement, `git diff --cached --quiet`).
Cadre : `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` au commit `7cffd34` (D1 à D9, §0 bis, amendement « Corrections checkpoint-1 » C-1 à C-8, qui fait foi ; tuyaux D7 ; oracle §7 ; items §6), lu en entier avant tout code ; relu à la tête de `lot/etude-suite` `3107730` : l'amendement daté du 2026-09-24 15:03 UTC (décision 198) ne concerne que le dépôt SEC v4 (E-13) ; périmètre PR-A tel que la mission de l'orchestrateur `claude-fable-5-1` l'énumère (écart E-1).
Hygiène : toute commande node/npm sous `env -u` des 8 variables payantes, `TEMP/TMP/TMPDIR=F:/tmp`, `NEXT_TELEMETRY_DISABLED=1`, jamais `env` nu ; `npm ci --ignore-scripts` (cache `F:\cache\npm`) ; rien écrit sur C: ; `F:/PRODUITS/bell-mirror/` lu, jamais écrit. Réseau : `npm ci` (registre npm) et GET publics sur `https://bell.monarkgate.tech` seulement (deux immuables de seq 2 à 14:48:03Z-14:48:05Z ; mode de comparaison de l'outil à 14:48:18Z-14:48:21Z puis à 15:14:35Z-15:14:36Z, trois GET chacun) ; aucun `ots` exécuté (ni `stamp`, ni `upgrade`, ni `info`). Consultations : advisor intégré deux fois (avant l'approche ; avant la clôture), conseil, jamais verdict (R-26).

## 1. Journal de provenance (gabarit du corpus)

| Date | PR/commit | Modèle (identifiant épinglé exact) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | PR-A du lot BELL-OTS-ANCHOR-1, non committée, base `1c78543` | `claude-opus-5-5` | max | ADR-BELL-OTS-ANCHOR-1 @ `7cffd34` + mission de l'orchestrateur (périmètre PR-A énuméré, oracle, R-25 cible 350) | worker | orchestrateur (R-21), puis G2 fraîche et checkpoint-2 (régime complet, D9.2) | en attente |

`error_origin` proposés, à assigner au G7 : (a) `site_names_no_kitchen` rouge au premier passage complet (identifiant `ADR-…` dans un commentaire de `apps/site/lib/bell-anchors.ts`, fichier exporté) : génération, worker, attrapé par l'oracle avant livraison, corrigé ; (b) R-25 au-dessus de la cible (E-5) : planification (périmètre déplacé de PR-B vers PR-A) et génération.

## 2. Fichiers livrés (sha256 des octets du worktree, LF)

| Fichier | État | +/− (pathspec R-25) | sha256 livré | sha256 à `1c78543` |
|---|---|---|---|---|
| `scripts/anchor-bell-timeline.mjs` | nouveau (non exporté) | 99/0 | `44b7d633f2ef6bdea041853296dce4eb32dfc13a64f2ccb76bf8bf337ed68dab` | absent |
| `apps/site/lib/bell-anchors.ts` | ajout en fin de fichier (code de course inchangé) | 78/0 | `1e30ce63f46d68135bdb8471eb997f88d0f390029ebd2e188a46ffd17658b153` | `aa9ac307…5343` |
| `scripts/sync-bell-anchors.mjs` | étendu | 20/13 | `e01ca3d38afced4fc49029430e7b9d2bf7ae5b3d217548c5ff4dab72d59eed1a` | `c9022049…b42f` |
| `test/bell-anchor-timeline.test.ts` | nouveau | 93/0 | `805938199c25f1f754870e9990ece7a0201def1f78d289dcd988c0eb79b0afd4` | absent |
| `test/bell-anchors.test.ts` | étendu | 53/5 | `4baaee5344dbc99f383874d14475c170c21ee171d4ebfa4fc787196070704d79` | `499bcf45…8565` |
| `test/fixtures/fixture-bell-seq2-pending.ots` | nouveau, binaire, synthétique (100 o) | −/− | `f340e4966ef99eb0c0d4c59af42ac86bc2a549ae78e2b359c516c50ac72857c5` | absent |
| `test/fixtures/fixture-bell-seq2-block.ots` | nouveau, binaire, synthétique (76 o) | −/− | `9607f1ea2155f3fc75e836dd52cf22815277dd1a9cf9318a867b14f8a0c6d8e8` | absent |
| `apps/site/public/bell/anchors/publications.json` | nouveau, écrit par la synchro | 6/0 | `b01a98ed63c6d5b98e1a16ee05a5c078631011e53df273c42d55a5d14d5a76ab` | absent |
| `apps/site/public/bell/anchors/timeline-seq2-manifest.txt` | nouveau, copie du committé | 4/0 | `602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946` | absent |
| `apps/site/public/bell/anchors/timeline-seq2-manifest.txt.ots` | nouveau, copie du committé, binaire | −/− | `abfaf787237a40b95ff02a93ec23faa51010ce90d867ccb93a1b1eb21387f4ca` | absent |
| `apps/site/COMPONENTS-PROVENANCE.md` | 2 lignes remplacées par 3 | 3/2 | `7de2712e7f6345cd0f35f51fc3225b90307359146f07488c4475e07b47c4cffb` | `5c110ee8…87b7` |
| `docs/RUNBOOK-bell.md` | étapes 13 et 13 bis, « Next publications », R5, « Never » | exclu (93/7) | `c3b9b9b4beccdf8e2fe664d18c8a9f2adf15bf7c2c4f5ca4cae5017cb5c80c6e` | `36811992…dde6` |
| `docs/bell-publications/ANCHORS.md` | section « Format » (prose) ; ligne de seq 2 intacte | exclu (6/0) | `e97cd35bc744bb95dbab47998e1060b0d340d31740b7810f487d3c33ad97c638` | `780c9ae0…b48b` |
| `docs/G1-lot-bell-ots-anchor-1-pr-a.md` | ce journal | exclu | dans `F:\tmp\ots-1\pr-a\DELIVERED.sha256` | absent |

Les 32 fichiers de course servis et `anchors.json` sont identiques octet pour octet à la base (`sha256sum -c` des digests de base après chaque synchro) ; le répertoire servi passe de 33 à 36 fichiers.

## 3. Correspondance mission et ADR → livrable

| # | Exigence (mission ; ADR) | Livré | Où | Preuve |
|---|---|---|---|---|
| 1 | Outil P-1 : manifeste D1 de la ligne n (`timeline.jsonl#L<n>` = sha256 de la ligne sans LF = `line_hash` ; `timeline.jsonl#L1-L<n>` = sha256 du préfixe avec LF ; les deux immuables nommés par la ligne) ; entrée locale par défaut, GET en mode de comparaison seulement (C-5) ; jamais d'écrasement (`-<k>`, k ≥ 2) ; commande `ots stamp` figée GO1-F imprimée, jamais exécutée ; vérification après coup (preuve, manifeste, ligne de registre) | outil sans `git`, sans `ots`, sans sous-processus ; marche des lignes 1..n sous le trousseau (`walkTimeline`), refus d'une ligne annulée, octets de la ligne n = forme canonique (`sha256(octets) = lineHash`), `--line-hash`, `--mirror-sha` = digest du préfixe, immuables hachés vers leur nom ; comparaison : https seul, `redirect: "manual"`, 200 seul, corps borné, la timeline servie COMMENCE par les lignes locales 1..n, immuables octet pour octet ; écriture en création exclusive (`wx`) puis relecture ; `--check` : `parsePublicationAnchors` + `bindPublicationAnchor` + `readOtsProof` (lu, jamais vérifié contre un nœud) et, avec `--timeline`, recalcul de `line_hash` et `prefix_sha256` | `scripts/anchor-bell-timeline.mjs` (non exporté, source-repo) | `bell_anchor_tool_writes_the_d1_manifest_from_local_input` (hors réseau, dans `npm test`) ; rejeu G1 sur la copie réelle (§5) |
| 2 | Parseur du registre L2, neuf colonnes, exigences d'égalité, `ots_ref` non `.ots` = non horodatée, fail-closed à messages nommés ; énumération fermée de course intacte | `parsePublicationAnchors(markdown)` (en-tête exact, toute ligne après l'en-tête est une ligne réelle, 9 cellules, `date_u` ISO Z, `seq` entier, `kind` ∈ {publication, key_rotation, key_revocation}, trois digests 64-hex, `commit` court, nom de preuve `timeline-seq<seq>[-<k>]-manifest.txt.ots` du même `seq`, nommé une fois ; tri seq puis date) ; `manifestEntries(text)` (format D1 : relpaths ASCII imprimables en ordre d'octets strict, LF, LF final) ; `bindPublicationAnchor(row, texte, sha256, preuve)` (octets = `manifest_sha256` ; exactement les entrées de la ligne ; `#L<seq>` = `line_hash` clé ET valeur ; `#L1-L<seq>` = `prefix_sha256` ; la preuve horodate `manifest_sha256` en sha256) | `apps/site/lib/bell-anchors.ts` (ajout en fin de fichier ; code de course inchangé) | `bell_publication_anchors_reader_fails_closed_with_named_errors` (12 erreurs nommées) ; T-2 |
| 3 | `sync-bell-anchors.mjs` étendu (P-4) : deux registres, deux répertoires pour le repli `git show`, `anchors.json` inchangé, `publications.json` ; balai et ensemble exact étendus ; C-7 ; T-2 ; chargeur et pages inchangés | boucle unique sur les deux registres (`dir` par registre), refus d'un nom servi deux fois, liaison de chaque ligne de publication avant toute écriture, `publications.json` (clés anglaises, sans note) ; `anchors.json` et les 32 fichiers de course identiques octet pour octet (§4) | `scripts/sync-bell-anchors.mjs` ; `apps/site/public/bell/anchors/{publications.json, timeline-seq2-manifest.txt, timeline-seq2-manifest.txt.ots}` | `bell_anchors_served_register_matches_source` (ensemble exact étendu) ; `bell_publication_anchors_served_register_matches_source` (T-2) ; `bell_publication_anchors_source_holds_no_fixture` (C-7) ; rendu inchangé (§6) |
| 4 | RUNBOOK : étape « 13 bis » (outil, stamp figé, copie durable immédiate, ligne de registre, commit dans la même fenêtre, upgrade seulement après la copie durable, C-6) ; « Next publications » | étape 13 : enregistre aussi les deux immuables de la ligne (C-5, D9.2) ; nouvelle étape 13 bis en six points (outil ; stamp GO1-F et `date_u` ; copie durable immédiate sous `/f/PRODUITS/bell-mirror/ots/` ; octets committés = octets horodatés ; ligne de registre et `--check` ; upgrade après la copie durable, `.bak` jamais committé ni servi ; fenêtre déclarée entre le commit de la paire et celui de la ligne, E-12) ; « Next publications » ; « Key incidents » R5 (13 et 13 bis pour une ligne de clé) ; « Never » (stamp sur l'hôte, upgrade avant la copie durable, `.bak` committé ou servi, preuve écrasée) | `docs/RUNBOOK-bell.md` | la commande de stamp imprimée par l'outil figure mot pour mot dans la 13 bis (épinglé par le test de l'outil) ; `bell_runbook_never_prints_private_key`, `bell_ops_*` verts |
| 5 | Section format du registre (D9.2) | section « Format » en prose (aucune ligne de tableau hors du registre, le parseur strict n'en voit qu'un) ; la ligne de seq 2 n'est pas touchée | `docs/bell-publications/ANCHORS.md` | T-2, C-7 |
| 6 | Vocabulaire D8 | lexique fermé dans tout texte nouveau (« timestamp », « pending », « block record », « before » ; « anchor » réservé aux noms d'outils, de tests, de routes et du registre) ; balayage des lignes ajoutées sur « proof that », « proves », « anchored », « guarantee », « partner », « verified », « tamper », « trustless », « permanent », « at a point in time », probabilités : aucune occurrence en prose ; aucun nom de fournisseur | tous | `gate:vocab`, `site_names_no_kitchen`, `public_surfaces_make_no_probative_claim` |

## 4. Oracle (commande sous l'hygiène ci-dessus ; journaux sous `F:/tmp/ots-1/pr-a/`)

| Porte | Base `1c78543` | PR-A (arbre final) | Journal |
|---|---|---|---|
| `npm run typecheck` | non mesuré | exit 0 | `o-typecheck.log` |
| `npm run lint` | non mesuré | exit 0 | `o-lint.log` |
| `npm run lint:ratchet` | 69/69 | **69/69** (aucune violation ajoutée) | `base-ratchet.log`, `o-ratchet.log` |
| `npm run gate:vocab` | non mesuré | exit 0, 267 fichiers | `o-vocab.log` |
| `npm run lang:gate` | non mesuré | exit 0, 0 occurrence non exemptée | `o-lang.log` |
| `npm run export:check` | non mesuré | exit 0 | `o-export.log` |
| export réel `--out F:/tmp/ots-1/pr-a/export` | non mesuré | 436 fichiers ; 17 `.ots`, tous sous `apps/site/public/bell/anchors/` ; 0 `fixture-*` ; 0 fichier `test/` racine ; ni l'outil ni la synchro exportés ; `publications.json` et la paire de seq 2 exportés ; `EXPORT-MANIFEST.json` sha256 `0f4d5e9f41c49233151ab3b1528475a798eb3896b529c7538ee5a563fb851f09` (export de l'arbre final, 15:32Z) | `o-export-out.log` |
| `npm test` complet | tests 1262, pass 1260, fail 0, skipped 2 (427 s) | tests 1266, pass 1264, fail 0, skipped 2 (+4 tests : l'outil, T-2, C-7, erreurs nommées) ; deux passages complets sur arbre gelé : 15:13:51Z-15:22:35Z, puis 15:23:59Z-15:35:19Z sur l'arbre final (après la phrase E-12 du RUNBOOK ; `o-test-final2.log` sha256 `26145d3a38889f864cceda30d1fc2a49275020dd6d886a6e6ad5a75d5e13947e`, 678 s) | `base-test.log`, `o-test-final.log`, `o-test-final2.log` |
| `next build` (`.next` supprimé avant, comme la base) | exit 0 | exit 0, 20 pages statiques | `base-build.log`, `o-build.log` |
| `node scripts/assert-fleet-html.mjs` | exit 0 | exit 0 (4 notes /fleet ; /ukemi sans chiffre) | `base-assert-fleet.log`, `o-assert-fleet.log` |
| rendu (`renderedBody()` de chaque page construite) | 19 empreintes | **19 empreintes identiques** (fichier d'empreintes identique, sha256 `afe495cf…e938` des deux côtés) | `base-rendered.sha`, `after-rendered.sha` |

## 5. Rejeu G1 déclaré (C-5, D7 P-1, §7) sur la copie miroir réelle de seq 2

- Entrées : copie durable `F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl` (2 407 o, sha256 `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b` = digest de l'étape 13, `docs/JOURNAL-PROVENANCE.md:389`) ; trousseau committé `apps/bell/keys/bell-keyring.json` ; les deux immuables de seq 2, absents du miroir durable (l'étape 13 de seq 2 précède C-5), relus par GET à 2026-09-24T14:48:03Z-14:48:05Z : `states/4564701add6e…08b9.json` (14 070 o) et `provenance/ad8dd9b023bd…c39b.json` (1 202 o), sha256 égal au nom pour les deux, `Cache-Control: public, max-age=31536000, immutable`, `Last-Modified: Thu, 24 Sep 2026 08:41:22 GMT` ; copies dans `F:/tmp/ots-1/pr-a/replay/immutables/`.
- Commande, entrée locale et sortie hors dépôt : `node scripts/anchor-bell-timeline.mjs --seq 2 --timeline F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl --immutables F:/tmp/ots-1/pr-a/replay/immutables --mirror-sha fba1824d…d28b --line-hash ef3b06f2…6464 --out-dir <répertoire hors dépôt>` ; puis la même avec `--compare-url https://bell.monarkgate.tech` ; puis `--check --timeline <la même copie>` sur le registre réel.
- Premier rejeu (outil avant compactage, 14:48:18Z-14:48:21Z) et rejeu de l'outil FINAL (sha256 `44b7d633…8dab`, 15:14:35Z-15:14:36Z), mêmes résultats : exit 0, manifeste de 457 octets, 4 lignes, sha256 **`602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946`**, `cmp` identique octet pour octet à `docs/bell-publications/timeline-seq2-manifest.txt`, en entrée locale comme en mode de comparaison (« the served bytes are the local ones ») ; `--check` : exit 0, « seq 2 timeline-seq2-manifest.txt.ots: bound to manifest 602ff93d…; pending, no Bitcoin block record yet; 4 calendar(s) pending (read from the file, not checked against a node) » ; avec la copie de seq 1 (une ligne) : exit 1, « fewer than 2 LF-terminated lines » (attendu).
- La ligne de registre imprimée par l'outil porte les trois digests de la ligne committée (`ef3b06f2…`, `fba1824d…`, `602ff93d…`) et le nom de preuve `timeline-seq2-manifest.txt.ots` ; le commit `694e98b` nommé par la ligne porte bien la paire (`git show 694e98b:docs/bell-publications/timeline-seq2-manifest.txt | sha256sum` = `602ff93d…`, preuve = `abfaf787…`), ce que le repli `git show` de la synchro suppose.
- Contrôle complémentaire hors dépôt, ligne de clé (`F:/tmp/ots-1/pr-a/keyline-check.mjs`, sha256 `ca3c02a3…3237`, sortie `keyline-check.out`) : timeline synthétique de trois lignes (deux publications, puis une `key_rotation` contresignée, clés éphémères, trousseau à deux clés), `walkTimeline` ok ; l'outil sur `--seq 3` sans `--immutables` : exit 0, manifeste de deux entrées (`timeline.jsonl#L1-L3`, `timeline.jsonl#L3`) ; `bindPublicationAnchor` accepte la ligne de registre de `kind` `key_rotation` et refuse la même comme `publication` (« does not have exactly the entries of publication line 3 »). Ce chemin n'est pas dans `npm test` (item KEYLINE-TOOL-TEST-1).

## 6. Servir `publications.json` ne change aucune page

- Le chargeur des pages (`apps/site/lib/bell-anchors-load.ts`) et les pages ne sont pas modifiés ; `listedDigests` ne réunit toujours que les manifestes de course ; l'épingle `anchored === false` de `test/bell-anchors.test.ts` reste verte.
- Rendu identique sur les 19 pages (§4), dont `/bell`, `/bell/method` et `/bell/anchors` ; `assert-fleet-html` vert ; la route `/bell/anchors/:file(.+\.ots)` de `apps/site/next.config.mjs` couvre déjà la nouvelle preuve.
- Garde (E-9) : T-2 exige que le chargeur ne nomme pas « publications » tant que le `.some` des pages existe (mutant DM-8 rouge).
- ADR §5 rejoué sur les fichiers servis de PR-A : `publications.json`, `timeline-seq2-manifest.txt` et `bell-anchors.ts` ne portent aucune des 12 formes fournisseurs de `test/bell-served.test.ts:158` ni aucune clé interdite de `:157` ; clés de `publications.json` : register, rows, date_utc, seq, kind, line_hash, prefix_sha256, manifest_sha256, commit, manifest_file, proof_file (la note opérateur, en français, n'est jamais copiée) ; le manifeste ne liste que des octets déjà servis (ligne, préfixe, deux immuables), aucun engagement sur un fichier non servi (ESC-1 (c)).

## 7. Mutants (restauration contrôlée par sha256 ; exécuteur `F:/tmp/ots-1/pr-a/mutants.mjs`, sortie `mutants.tsv`)

Mutants d'entrée, internes au test de l'outil (chacun : exit 1, message nommé, rien d'écrit) : MP-1 préfixe (`--mirror-sha` d'un octet de moins), MP-2 immuable (fichier `states/` remplacé), MP-3 clé (trousseau d'une autre clé : `seq 1: key_not_in_keyring`), MP-4 `--line-hash` de la ligne 1, MP-5 timeline servie altérée d'un octet (`--compare-url`), MP-6 URL non https ; MP-7 second passage : `timeline-seq2-2-manifest.txt`, le premier intact ; MP-8 `--check` sur une ligne au `line_hash` faux. MP-1 à MP-3 sont les mutants nommés par l'ADR (D7, P-1 : préfixe, immuable, clé).

Mutants de code et de données, appliqués au dépôt, tests `test/bell-anchors.test.ts` et `test/bell-anchor-timeline.test.ts` relancés, octets d'origine restaurés, sha256 revenu à la valeur d'avant pour chacun (« TREE RESTORED ») :

| Id | Cible | Mutation | Tests rouges |
|---|---|---|---|
| CM-1 | outil | contrôle du préfixe retiré | outil (MP-1) |
| CM-2 | outil | contrôle du hachage des immuables retiré | outil (MP-2) |
| CM-3 | outil | marche sous le trousseau ignorée | outil (MP-3) |
| CM-4 | outil | pas de nom `-<k>` | outil (MP-7) |
| CM-5 | outil | redirections suivies (`redirect: "follow"`) | outil (le bouchon ne répond qu'à `manual`) |
| CM-6 | outil | timeline servie non comparée | outil (MP-5) |
| CM-7 | parseur | `line_hash` non lié | outil (MP-8) + erreurs nommées |
| CM-8 | parseur | ensemble exact des entrées non exigé (bonne valeur sous une mauvaise clé) | erreurs nommées |
| CM-9 | parseur | liste fermée des `kind` ouverte | erreurs nommées |
| CM-10 | parseur | ordre des relpaths non exigé | erreurs nommées |
| CM-11 | parseur | digest de la preuve non lié | erreurs nommées |
| CM-12 | parseur | nom de preuve d'un autre `seq` accepté | erreurs nommées |
| CM-13 | synchro | liaison au moment de la synchro retirée | **aucun (survivant déclaré)** |
| DM-1 | `publications.json` | un digest changé | T-2 |
| DM-2 | preuve servie de seq 2 | un octet ajouté | T-2 |
| DM-3 | `publications.json` | supprimé | (1) ensemble exact + T-2 |
| DM-4 | `docs/bell-publications/fixture-x.ots` | créé | C-7 |
| DM-5 | `scripts/export-public.mjs` | `test` ajouté à `WHITELIST_DIRS` | C-7 |
| DM-6 | `apps/site/public/bell/anchors/fixture-x.ots` | créé | (1) ensemble exact + C-7 |
| DM-7 | `fixtures/fixture-x.ots` | créé | C-7 |
| DM-8 | `bell-anchors-load.ts` | nomme « publications » | T-2 (garde E-9) |
| DM-9 | RUNBOOK | commande de stamp divergente | outil (commande identique exigée) |
| DM-10 | registre | `line_hash` de la ligne changé | T-2 + erreurs nommées |
| DM-11 | manifeste servi | une entrée changée | T-2 |

Survivant CM-13, examiné : la synchro écrirait alors une ligne incohérente, mais T-2 relie de nouveau chaque ligne aux fichiers SERVIS ; mutant composé CM-13 + ligne de registre au `line_hash` faux : synchro exit 0, puis T-2 et le test des erreurs nommées rouges (« publications register, seq 2 (timeline-seq2-manifest.txt): the manifest entry timeline.jsonl#L2 differs from line_hash »), arbre restauré. Sans CM-13, la même ligne fausse fait refuser la synchro (exit 1, même message) et le répertoire servi n'est pas touché (`sha256sum -c`). La liaison de la synchro est une défense en profondeur (refus avant écriture), dont l'oracle est T-2. L'assertion C-7 rougit aussi sur un `.bak` laissé dans `docs/bell-publications/` après un upgrade (même mécanisme que DM-4 : un fichier qu'aucune ligne ne nomme).

## 8. R-25

- Mesure : copie de l'index dans un fichier temporaire (`GIT_INDEX_FILE`), `git add -N` des fichiers non suivis dans CETTE copie seulement, puis `git diff --shortstat 1c78543 -- <pathspec d'exclusion de .github/workflows/ci.yml, recopiée mot pour mot>` ; l'index réel n'est pas touché (sha256 identique avant et après ; rien d'indexé).
- Résultat : **11 fichiers, 356 insertions, 20 suppressions = 376 lignes** (`r25-final.txt`, sha256 `ad6566cf…ce26`) ; les `.ots` comptent 0 (binaires) ; `docs/**/*.md` exclus (RUNBOOK 93/7, registre 6/0, ce journal).
- Base de mesure : `1c78543` est aussi la base de fusion avec `lot/etude-suite` (`git merge-base 1c78543 lot/etude-suite` = `1c78543`, tête `3107730` relue juste après 15:22:35Z, qui n'ajoute que des `.md` sous `docs/`) : une PR vers `lot/etude-suite` compte ces 376 lignes ; contre `main` (base de fusion `4b59d09`), le diff embarquerait d'autres lots et ne mesurerait pas PR-A.
- Cible de la mission ≤ 350 : dépassée de 26 lignes (+7 %), écart E-5 ; seuil STOP 1 150 et plafond CI 1 205 loin. Mesures intermédiaires : 500 (premier jet), 391, 376 après compactage des commentaires, sans changement de comportement (mêmes octets servis, mêmes tests).

## 9. Tuyaux D7 après PR-A (règle Branchement)

| Tuyau | État au 2026-09-24, avant PR-A (ADR D7) | État après PR-A | Test non-LLM |
|---|---|---|---|
| P-1 timeline servie → manifeste | absent (outil) | **câblé** : outil versionné, entrée locale, consommé par l'étape 13 bis (acte orchestrateur) et par le registre | `bell_anchor_tool_writes_the_d1_manifest_from_local_input` ; rejeu G1 §5 |
| P-2 manifeste → preuve pendante | procédural (seq 2) | inchangé : procédural (stamp = acte orchestrateur), forme figée écrite en 13 bis point 2 et imprimée par l'outil | T-2 (la preuve horodate le digest du manifeste, au moins une attestation) |
| P-3 pendante → mise à niveau | absent (publications) | inchangé : procédural, écrit en 13 bis point 6 (après la copie durable) ; la preuve de seq 2 est toujours pendante (`--check`, §5) | aucun (appel aux calendriers non rejouable hors ligne, déclaré ADR D7) ; item existant de l'ADR |
| P-4 registre → servi | absent pour les publications | **câblé jusqu'au répertoire servi du dépôt** (`apps/site/public/bell/anchors/`, route statique `/bell/anchors/` après l'upload de l'orchestrateur) ; aucune page ne lit encore ces fichiers (C-8 et P-5 : PR-B) ; aucune affirmation publique nouvelle | T-2 ; C-7 ; ensemble exact du servi |
| P-5 servi + tête → affirmation | câblé mais défectueux (`.some`) | inchangé (PR-B) ; garde ajoutée : le chargeur des pages ne lit aucun fichier de publication tant que le `.some` existe | garde dans T-2 (§10, E-9) |
| P-6 servi → tiers | fixture | inchangé (BELL-OTS-NODE-VERIFY-1) ; les fichiers des gestes 1 à 3 et 5 seront servis à l'upload | T-3a en PR-B |
| P-7 export → miroir public | câblé par construction | câblé : `EXPORT-MANIFEST.json` mesuré (§4) | `export:check` |

## 10. Écarts déclarés et choix

- **E-1 Périmètre** : la mission place en PR-A le parseur L2, l'extension de la synchro (P-4), T-2 et l'assertion C-7, que l'ADR D9.2/D9.3 rangeait en PR-B. Appliqué tel que la mission l'énumère ; restent en PR-B : `publicationAnchorState`, `lines[]` (schéma v4) et le contrôle de synchro contre `lines[]` (D5), le chargeur, les trois pages, T-1, T-3. Le régime de revue C-4 (G2 + checkpoint-2 sur tout le chemin d'affirmation hors JSX) est tenu puisque PR-A est au régime complet (D9.2).
- **E-2 Signature du parseur** : ADR D5 écrit `parsePublicationAnchors(markdown)` qui « jette si `line_hash` ou `prefix_sha256` diffèrent des entrées du manifeste » ; une fonction pure sans les octets du manifeste ne le peut pas, et le module reste sans import Node (en-tête « PURE »). Découpage : `parsePublicationAnchors` (structure) + `bindPublicationAnchor` (liaisons, erreurs nommées ; l'appelant hache) + `manifestEntries` ; chaque appelant (synchro, T-2, `--check`) lie toutes les lignes horodatées. `manifestDigests` (course) inchangé ; `manifestEntries` est plus strict (règles de format D1).
- **E-3 `ots info`** : autorisé par la mission, exclu par ADR D2 (« ne lance pas `ots` … pas de sous-processus ») ; l'outil lit toujours la preuve par `readOtsProof` et imprime la commande `ots --no-cache info <preuve>` de contre-contrôle pour l'orchestrateur.
- **E-4 Mode de comparaison** : « égalité octet pour octet » appliquée aux octets ancrés : la timeline servie doit COMMENCER par les lignes locales 1..n (elle ne fait que croître, append-only), les immuables doivent être identiques.
- **E-5 R-25** : 376 lignes pour une cible de 350 (+26, §8). Cause : parseur, synchro, T-2 et C-7 venus de PR-B (E-1), que l'estimation de l'ADR pour PR-A (230 à 280 lignes) ne comptait pas ; les commentaires ont été compactés sans changer le comportement. Si la cible est tenue pour bloquante, découpage mesuré : A1 = parseur + outil + son test + fixtures + RUNBOOK (78 + 99 + 93 = 270 lignes), puis A2 = synchro + fichiers servis + T-2, C-7 et erreurs nommées + provenance (33 + 10 + 58 + 5 = 106 lignes) ; les erreurs nommées du parseur ne seraient alors testées qu'en A2 (ou déplacées en A1, environ 17 lignes). Décision de l'orchestrateur.
- **E-6 Fixtures** : deux preuves synthétiques committées sous `test/fixtures/` (binaires, 0 ligne R-25) ; la timeline signée est construite à l'exécution avec une clé de test DÉTERMINISTE (graine = sha256 d'un libellé public, dans aucun trousseau committé ; aucun bloc PEM, aucune clé privée committée) ; le test exige que les deux preuves horodatent exactement le manifeste que l'outil écrit (empreinte dorée) et qu'elles ne portent qu'une attestation synthétique chacune (`https://calendar.invalid` ; bloc de hauteur 1).
- **E-7 Messages de la synchro** : une erreur levée par `parsePublicationAnchors` ou `bindPublicationAnchor` sort par exception non rattrapée (code 1, pile) avant toute écriture, comme `parseAnchorsRegister` aujourd'hui ; fail-closed tenu, message sans le préfixe « FAIL-CLOSED — ».
- **E-8 Ensemble exact** : l'extension de `test/bell-anchors.test.ts:52` est faite dans le test (1) (un seul ensemble exact pour le répertoire servi), T-2 ne le duplique pas.
- **E-9 Garde ajoutée (hors ADR)** : la ligne de seq 2 liste `states/4564701a…08b9.json`, qui est `head.state_sha256` de `apps/site/data/bell-served.json` ; si le chargeur des pages lisait `publications.json` avant que PR-B retire le `.some` (`page.tsx:254`, `method/page.tsx:106`), la page dirait « an anchor manifest lists the latest record's digests » d'une preuve PENDANTE (défauts (i) et (ii) de l'ADR §1.2). T-2 exige donc que `bell-anchors-load.ts` ne nomme pas « publications » ; PR-B lève cette garde dans le même changement que `publicationAnchorState` et T-3.
- **E-10 Registre** : seule la prose du registre (section « Format », D9.2) est écrite par le worker ; la ligne de seq 2 est intacte (T-2 la relit).
- **E-11 Immuables de seq 2** : relus par GET pour le rejeu (§5) ; ils ne sont pas dans le miroir durable (item SEQ2-IMMUTABLES-MIRROR-1).
- **E-12 Fenêtre de deux commits (13 bis)** : la ligne nomme le commit qui ajoute la paire, donc la paire est committée avant la ligne (comme `anchor.sh` et `694e98b` puis `1c78543`) ; entre les deux, `bell_publication_anchors_source_holds_no_fixture` est rouge (paire qu'aucune ligne ne nomme). Écrit dans la 13 bis, point 4, comme fenêtre déclarée (l'oracle complet tourne après le point 5). L'advisor proposait de le déclarer seulement et de laisser le pli au G2 ; plié directement (une phrase), puis les quatre fichiers de tests qui lisent le RUNBOOK et la suite complète relancés sur l'arbre final.
- **E-13 Amendement amont** : `lot/etude-suite` porte depuis `3107730` (2026-09-24 15:03 UTC, décision 198) un amendement daté de l'ADR : la condition BELL-OTS-NODE-VERIFY-1 / C-2 est levée pour le seul dépôt SEC v4 ; SEC-L56-ANCHOR-1 est clos par la formule de la décision 192. Aucun effet sur PR-A (aucune surface servie ne change ; la clause « not checked against a node » est tenue par l'outil et le RUNBOOK) ; la worktree reste sur `1c78543` (aucun fichier commun).

## 11. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **PRB-LOADER-GUARD-1** (nouveau) | code (PR-B) | retirer la garde de T-2 (E-9) dans le même changement que `publicationAnchorState`, le chargeur étendu et T-3 ; jamais avant | PR-B | orchestrateur, puis worker PR-B |
| **SYNC-LINES-CHECK-1** (ADR D5) | code (PR-B) | la synchro refuse toute ligne dont le `line_hash` n'est pas celui de `lines[seq]` et tout `seq` au-delà de `lines[]` ; exige le schéma v4 de `bell-served.json` | PR-B | worker PR-B |
| **KEYLINE-TOOL-TEST-1** (nouveau) | code (test) | ajouter au test de l'outil le cas d'une ligne `key_rotation` (manifeste de deux entrées, sans immuables), aujourd'hui vérifié hors dépôt seulement (§5) ; environ 12 lignes R-25 | décision R-25 de l'orchestrateur (E-5) : dans A1 en cas de découpage, sinon au pli du G2 | worker |
| **SEQ2-IMMUTABLES-MIRROR-1** (nouveau) | procédure | verser au miroir durable `F:/PRODUITS/bell-mirror/` les deux immuables de seq 2 (copies volatiles `F:/tmp/ots-1/pr-a/replay/immutables/`, sha256 = noms, relus à 14:48:05Z), pour que le rejeu local de seq 2 ne dépende plus d'un GET | avant la prochaine fenêtre 13 bis | orchestrateur |
| Upgrade de la preuve de seq 2 (ADR D9.1, C-6 (ii), existant) | procédure | toujours pendante (§5 : 4 calendriers, 0 bloc) ; upgrade après vérification de la copie durable, puis synchro, build, upload | fenêtre opérateur suivante | orchestrateur |
| BELL-OTS-NODE-VERIFY-1, BELL-VERIFY-SCHEDULE-1, Q6-ANCHOR-1 (ADR §6) | inchangés (BELL-OTS-NODE-VERIFY-1 : condition levée pour le seul dépôt SEC v4, amendement de 15:03 UTC ; reste ouvert pour la clause servie) ; SEC-L56-ANCHOR-1 clos en amont (décision 192) | sans objet | ADR §6 et amendement | orchestrateur |

## 12. Sources et niveaux

- [lu] ADR `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` @ `7cffd34`, en entier (378 lignes) ; son amendement daté de 15:03 UTC à `3107730` (`git diff 1c78543 lot/etude-suite`, 6 lignes).
- [lu] dépôt à `1c78543` : `apps/site/lib/bell-anchors.ts`, `apps/site/lib/bell-anchors-load.ts`, `scripts/sync-bell-anchors.mjs`, `scripts/sync-bell-served.mjs`, `apps/bell/scripts/bell-chain.mjs` (+ `.d.mts`), `apps/bell/scripts/bell-publish.mjs:264`, `:290` (sorties des étapes 10 et R3), `apps/site/lib/bell-served-load.ts:440-470`, `scripts/export-public.mjs` (+ `.d.mts`), `scripts/lang-gate.mjs`, `vocab-banned.json`, `test/bell-anchors.test.ts`, `test/bell-served.test.ts:240-330`, `test/bell-deploy-config.test.ts:160-240`, `test/site-build-fleet.test.ts:1110-1192`, `test/public-surfaces-honesty.test.ts`, `test/no-secret-in-repo.test.ts`, `apps/bell/test/bell-ops.test.ts`, `docs/RUNBOOK-bell.md`, `docs/bell-publications/ANCHORS.md`, `docs/course-bell/ANCHORS.md`, `docs/CHANTIERS.md:739-743` (ruling GO1-F), `docs/JOURNAL-PROVENANCE.md:385-393`, `docs/course-bell/FAITS-opentimestamps-*.md`, `.github/workflows/ci.yml` (job R-25), `.gitattributes`, `tsconfig.json`, `eslint.config.mjs`, `lint-ratchet.json`, `apps/site/next.config.mjs` (en-tête des `.ots`), `apps/site/COMPONENTS-PROVENANCE.md`, `apps/site/data/bell-served.json` (tête seq 2 : `state_sha256` `4564701a…08b9`, `line_hash` `ef3b06f2…6464`).
- [lu] hors dépôt, lecture locale : client installé `F:\MONARK SUITE\ots\venv\Lib\site-packages\otsclient\cmds.py` (sha256 `c20e8f77…3d25`, égal à ADR §1.4) : `upgrade_command` renomme en `<preuve>.bak` puis réécrit en création exclusive, sort 1 si « not complete » ; `F:\course-bell\go1\anchor.sh` ; gabarit `templates/journal-provenance.md` du corpus.
- [lu] GET du worker : `https://bell.monarkgate.tech/states/4564701a…08b9.json` et `/provenance/ad8dd9b0…c39b.json` (14:48:03Z-14:48:05Z), puis `/timeline.jsonl` et les deux mêmes chemins en mode de comparaison (14:48:18Z-14:48:21Z, puis 15:14:35Z-15:14:36Z avec l'outil final).
- Aucun chiffre de seconde main ; toute valeur ci-dessus est mesurée par une commande citée.

## 13. Artefacts hors dépôt (worker, non committés)

| Fichier | Rôle | sha256 |
|---|---|---|
| `F:/tmp/ots-1/pr-a/gen-fixtures.mjs` | générateur des deux preuves synthétiques (même construction que le test, digest pris de la sortie réelle de l'outil) | `9d8dadaafeb6dd25f970ec48179318ca4d768de3080052085b81411af59e114f` |
| `F:/tmp/ots-1/pr-a/mutants.mjs` | exécuteur des mutants | `97c259e35fff340050b8cf8c1283fa9daf4d186f23e285eed75b5b5481c60e51` |
| `F:/tmp/ots-1/pr-a/mutants.tsv` | résultats des 24 mutants (24 lignes de données) : 23 rouges, 1 survivant déclaré (CM-13) | `da947dcb05bb6a5862032987947691524d241684e0a2f7d6e8195080a571ed27` |
| `F:/tmp/ots-1/pr-a/rendered-sha.mjs` | sha256 de `renderedBody()` de chaque page construite | `fb2c4996beb5dcb88b38a91398cd97d19ba05ac3a77a198d562428ec38475001` |
| `F:/tmp/ots-1/pr-a/replay/` | rejeu §5 (immuables relus, sorties, journaux) | manifestes `602ff93d…6946` |
| `F:/tmp/ots-1/pr-a/keyline-check.mjs` | contrôle hors dépôt d'une ligne de clé (§5) | `ca3c02a36b4dbcb3c930aaa9ab7bcdf31f57dd8bafab845271d8f88a1f173237` |
| `F:/tmp/ots-1/pr-a/assemble-g1.mjs` | assemblage de ce journal depuis ses parties rédigées | voir `DELIVERED.sha256` |
| `F:/tmp/ots-1/pr-a/DELIVERED.sha256` | sha256 de chaque fichier livré | voir le fichier |
