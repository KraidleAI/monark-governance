# G1 : Lot BELL-OTS-ANCHOR-1, PR-A (outil d'ancrage P-1, registre des publications servi, RUNBOOK 13 bis)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max), déclaré à l'ouverture de la session (R-1).
Worktree `F:/Monark-wt-ots`, branche `lot/bell-ots-anchor-1`, base `1c78543` (arbre propre au démarrage) ; aucun commit, aucun workflow (R-20) ; rien n'est indexé (l'index réel ne porte aucun changement, `git diff --cached --quiet`).
Cadre : `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` au commit `7cffd34` (D1 à D9, §0 bis, amendement « Corrections checkpoint-1 » C-1 à C-8, qui fait foi ; tuyaux D7 ; oracle §7 ; items §6), lu en entier avant tout code ; relu à la tête de `lot/etude-suite` `3107730` : l'amendement daté du 2026-09-24 15:03 UTC (décision 198) ne concerne que le dépôt SEC v4 (E-13) ; périmètre PR-A tel que la mission de l'orchestrateur `claude-fable-5-1` l'énumère (écart E-1).
Hygiène : toute commande node/npm sous `env -u` des 8 variables payantes, `TEMP/TMP/TMPDIR=F:/tmp`, `NEXT_TELEMETRY_DISABLED=1`, jamais `env` nu ; `npm ci --ignore-scripts` (cache `F:\cache\npm`) ; rien écrit sur C: ; `F:/PRODUITS/bell-mirror/` lu, jamais écrit. Réseau : `npm ci` (registre npm) et GET publics sur `https://bell.monarkgate.tech` seulement (deux immuables de seq 2 à 14:48:03Z-14:48:05Z ; mode de comparaison de l'outil à 14:48:18Z-14:48:21Z puis à 15:14:35Z-15:14:36Z, trois GET chacun) ; aucun `ots` exécuté (ni `stamp`, ni `upgrade`, ni `info`). Consultations : advisor intégré deux fois (avant l'approche ; avant la clôture), conseil, jamais verdict (R-26).

## 1. Journal de provenance (gabarit du corpus)

| Date | PR/commit | Modèle (identifiant épinglé exact) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | PR-A du lot BELL-OTS-ANCHOR-1, non committée, base `1c78543` | `claude-opus-5-5` | max | ADR-BELL-OTS-ANCHOR-1 @ `7cffd34` + mission de l'orchestrateur (périmètre PR-A énuméré, oracle, R-25 cible 350) | worker | orchestrateur (R-21), puis G2 fraîche et checkpoint-2 (régime complet, D9.2) | G2 fraîche du 2026-09-24 (`claude-opus-5-5[1m]`, instance séparée ; `F:/tmp/ots-1/g2/G2-PR-A.md`, sha256 `699e8dc29bb57f388ea4469a16862deacd28ba4178071499afc09139b6160dd4`) : lentille A ACCEPTE-AVEC-CORRECTIONS, lentille B ACCEPTE-AVEC-CORRECTIONS ; corrections pliées (§14) |
| 2026-09-24 | pli G2 de PR-A (C-G2-1 à C-G2-6), non committé, sur `45cefcc` | `claude-opus-5-5` | max | rapport G2 ci-dessus ; diff proposé `F:/tmp/ots-1/g2/prop/PROPOSED.diff` (sha256 `5df96e29ce75fa0f3131f36de19a08d2377a1516813af7bc2cc277c9f98682b8`) ; mission de pli de l'orchestrateur, reprise après la coupure de courant de 16:46Z | C-G2-1 à C-G2-4 : code et tests écrits par le relecteur G2 (diff validé sur copie), appliqués sans retouche (`git apply`) par le worker du pli ; C-G2-5 et C-G2-6 : worker du pli | orchestrateur (R-21), puis G2 de confirmation courte en contexte frais, par une instance distincte du relecteur G2 (auteur du code plié) et du worker du pli | en attente |

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
| rendu (`renderedBody()` de chaque page construite) | 19 empreintes | **19 empreintes identiques** (fichier d'empreintes identique, sha256 `afe495cf…e938` des deux côtés) ; **erratum §14.3** : la méthode n'est pas stable d'un build à l'autre | `base-rendered.sha`, `after-rendered.sha` |

## 5. Rejeu G1 déclaré (C-5, D7 P-1, §7) sur la copie miroir réelle de seq 2

- Entrées : copie durable `F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl` (2 407 o, sha256 `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b` = digest de l'étape 13, `docs/JOURNAL-PROVENANCE.md:389`) ; trousseau committé `apps/bell/keys/bell-keyring.json` ; les deux immuables de seq 2, absents du miroir durable (l'étape 13 de seq 2 précède C-5), relus par GET à 2026-09-24T14:48:03Z-14:48:05Z : `states/4564701add6e…08b9.json` (14 070 o) et `provenance/ad8dd9b023bd…c39b.json` (1 202 o), sha256 égal au nom pour les deux, `Cache-Control: public, max-age=31536000, immutable`, `Last-Modified: Thu, 24 Sep 2026 08:41:22 GMT` ; copies dans `F:/tmp/ots-1/pr-a/replay/immutables/`.
- Commande, entrée locale et sortie hors dépôt : `node scripts/anchor-bell-timeline.mjs --seq 2 --timeline F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl --immutables F:/tmp/ots-1/pr-a/replay/immutables --mirror-sha fba1824d…d28b --line-hash ef3b06f2…6464 --out-dir <répertoire hors dépôt>` ; puis la même avec `--compare-url https://bell.monarkgate.tech` ; puis `--check --timeline <la même copie>` sur le registre réel.
- Premier rejeu (outil avant compactage, 14:48:18Z-14:48:21Z) et rejeu de l'outil FINAL (sha256 `44b7d633…8dab`, 15:14:35Z-15:14:36Z), mêmes résultats : exit 0, manifeste de 457 octets, 4 lignes, sha256 **`602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946`**, `cmp` identique octet pour octet à `docs/bell-publications/timeline-seq2-manifest.txt`, en entrée locale comme en mode de comparaison (« the served bytes are the local ones ») ; `--check` : exit 0, « seq 2 timeline-seq2-manifest.txt.ots: bound to manifest 602ff93d…; pending, no Bitcoin block record yet; 4 calendar(s) pending (read from the file, not checked against a node) » ; avec la copie de seq 1 (une ligne) : exit 1, « fewer than 2 LF-terminated lines » (attendu).
- La ligne de registre imprimée par l'outil porte les trois digests de la ligne committée (`ef3b06f2…`, `fba1824d…`, `602ff93d…`) et le nom de preuve `timeline-seq2-manifest.txt.ots` ; le commit `694e98b` nommé par la ligne porte bien la paire (`git show 694e98b:docs/bell-publications/timeline-seq2-manifest.txt | sha256sum` = `602ff93d…`, preuve = `abfaf787…`), ce que le repli `git show` de la synchro suppose.
- Contrôle complémentaire hors dépôt, ligne de clé (`F:/tmp/ots-1/pr-a/keyline-check.mjs`, sha256 `ca3c02a3…3237`, sortie `keyline-check.out`) : timeline synthétique de trois lignes (deux publications, puis une `key_rotation` contresignée, clés éphémères, trousseau à deux clés), `walkTimeline` ok ; l'outil sur `--seq 3` sans `--immutables` : exit 0, manifeste de deux entrées (`timeline.jsonl#L1-L3`, `timeline.jsonl#L3`) ; `bindPublicationAnchor` accepte la ligne de registre de `kind` `key_rotation` et refuse la même comme `publication` (« does not have exactly the entries of publication line 3 »). Ce chemin n'est pas dans `npm test` (item KEYLINE-TOOL-TEST-1). **Pli G2** : il y est désormais (C-G2-3, §14.1).

## 6. Servir `publications.json` ne change aucune page

- Le chargeur des pages (`apps/site/lib/bell-anchors-load.ts`) et les pages ne sont pas modifiés ; `listedDigests` ne réunit toujours que les manifestes de course ; l'épingle `anchored === false` de `test/bell-anchors.test.ts` reste verte.
- Rendu identique sur les 19 pages (§4 ; erratum §14.3), dont `/bell`, `/bell/method` et `/bell/anchors` ; `assert-fleet-html` vert ; la route `/bell/anchors/:file(.+\.ots)` de `apps/site/next.config.mjs` couvre déjà la nouvelle preuve.
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
| CM-13 | synchro | liaison au moment de la synchro retirée | **aucun (survivant déclaré)** ; tué au pli G2 (C-G2-1, §14.1) |
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
- **E-11 Immuables de seq 2** : relus par GET pour le rejeu (§5) ; ils ne sont pas dans le miroir durable (item SEQ2-IMMUTABLES-MIRROR-1). **Clos** (pli G2, §14.4).
- **E-12 Fenêtre de deux commits (13 bis)** : la ligne nomme le commit qui ajoute la paire, donc la paire est committée avant la ligne (comme `anchor.sh` et `694e98b` puis `1c78543`) ; entre les deux, `bell_publication_anchors_source_holds_no_fixture` est rouge (paire qu'aucune ligne ne nomme). Écrit dans la 13 bis, point 4, comme fenêtre déclarée (l'oracle complet tourne après le point 5). L'advisor proposait de le déclarer seulement et de laisser le pli au G2 ; plié directement (une phrase), puis les quatre fichiers de tests qui lisent le RUNBOOK et la suite complète relancés sur l'arbre final.
- **E-13 Amendement amont** : `lot/etude-suite` porte depuis `3107730` (2026-09-24 15:03 UTC, décision 198) un amendement daté de l'ADR : la condition BELL-OTS-NODE-VERIFY-1 / C-2 est levée pour le seul dépôt SEC v4 ; SEC-L56-ANCHOR-1 est clos par la formule de la décision 192. Aucun effet sur PR-A (aucune surface servie ne change ; la clause « not checked against a node » est tenue par l'outil et le RUNBOOK) ; la worktree reste sur `1c78543` (aucun fichier commun).
- **E-14 Fixture du test de P-1 (déclaré au pli G2, C-G2-6)** : l'ADR (D7, ligne P-1, l.231) nomme « la fixture signée à deux lignes construite par `test/bell-served.test.ts:274` ». Le test livré construit sa propre timeline (`served()`, `test/bell-anchor-timeline.test.ts:24-39`) avec une clé de test DÉTERMINISTE (l.21). La fixture de `test/bell-served.test.ts:274` n'est pas exportée et tire une clé aléatoire (`generateKeyPairSync`, l.275) : avec elle, le digest du manifeste changerait à chaque exécution, et les deux preuves synthétiques de `test/fixtures/`, qui doivent horodater CE digest (C-7), ne pourraient pas être épinglées. Les deux constructions diffèrent (lignes à `runs: []` contre états complets) : ce n'est pas une duplication au sens de R-3.
- **E-15 Option `--keyring` de l'outil (déclarée au pli G2, C-G2-6)** : l'outil accepte `--keyring <fichier>` (`scripts/anchor-bell-timeline.mjs`, l.3 et l.37). Par défaut, il lit le trousseau committé `apps/bell/keys/bell-keyring.json`, et le RUNBOOK ne passe jamais l'option à l'outil (étape 13 bis, l.392 et l.434). L'option sert au test (clé de test hors trousseau). Elle n'affaiblit aucune affirmation servie : le trousseau servi et ses épingles sont inchangés, et le stamp reste un acte de l'orchestrateur. Selon la G2 (mutant G2-M5b, non rejoué au pli), ajouter la clé de test au trousseau committé fait rougir deux tests épinglés.

## 11. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **PRB-LOADER-GUARD-1** (nouveau) | code (PR-B) | retirer la garde de T-2 (E-9) dans le même changement que `publicationAnchorState`, le chargeur étendu et T-3 ; jamais avant | PR-B | orchestrateur, puis worker PR-B |
| **SYNC-LINES-CHECK-1** (ADR D5), **étendu au pli G2** | code et décision (PR-B) | la synchro refuse toute ligne dont le `line_hash` n'est pas celui de `lines[seq]` et tout `seq` au-delà de `lines[]` ; exige le schéma v4 de `bell-served.json`. Extension (G2 §8, mutant G2-M7) : lier aussi les fichiers du manifeste aux immuables de la ligne. Décision de l'orchestrateur (`docs/CHANTIERS.md:1440` à `80eb2cf`) : `lines[]` portera `state_sha256` et `provenance_sha256` des lignes `publication` (amendement de D5 au G0 de PR-B) ; la synchro et T-2 exigeront alors les fichiers que `--check --timeline` exige depuis C-G2-2. Mesuré au pli : G2-M7 passe encore la synchro et T-2 (§14.1) | G0 de PR-B | orchestrateur, puis worker PR-B |
| **KEYLINE-TOOL-TEST-1** (nouveau) — **CLOS au pli G2** (C-G2-3, §14.1) | code (test) | ajouter au test de l'outil le cas d'une ligne `key_rotation` (manifeste de deux entrées, sans immuables), aujourd'hui vérifié hors dépôt seulement (§5) ; environ 12 lignes R-25 | décision R-25 de l'orchestrateur (E-5) : dans A1 en cas de découpage, sinon au pli du G2 | worker |
| **SEQ2-IMMUTABLES-MIRROR-1** (nouveau) — **CLOS** (§14.4) | procédure | verser au miroir durable `F:/PRODUITS/bell-mirror/` les deux immuables de seq 2 (copies volatiles `F:/tmp/ots-1/pr-a/replay/immutables/`, sha256 = noms, relus à 14:48:05Z), pour que le rejeu local de seq 2 ne dépende plus d'un GET | avant la prochaine fenêtre 13 bis | orchestrateur |
| Upgrade de la preuve de seq 2 (ADR D9.1, C-6 (ii), existant) | procédure | toujours pendante (§5 : 4 calendriers, 0 bloc) ; upgrade après vérification de la copie durable, puis synchro, build, upload | fenêtre opérateur suivante | orchestrateur |
| BELL-OTS-NODE-VERIFY-1, BELL-VERIFY-SCHEDULE-1, Q6-ANCHOR-1 (ADR §6) | inchangés (BELL-OTS-NODE-VERIFY-1 : condition levée pour le seul dépôt SEC v4, amendement de 15:03 UTC ; reste ouvert pour la clause servie) ; SEC-L56-ANCHOR-1 clos en amont (décision 192) | sans objet | ADR §6 et amendement | orchestrateur |
| **RENDER-FINGERPRINT-NONDET-1** (G2 §8) | recherche et procédure | sur un même arbre, l'empreinte `renderedBody()` de `/bell/anchors` varie avec la position de `<meta name="next-size-adjust">` (§14.3). Toute affirmation « rendu identique » normalise cette balise, ou déclare N builds et exige l'égalité sur au moins l'un d'eux ; lire la documentation du rendu des métadonnées de Next 16 avant de choisir | prochaine affirmation « rendu identique » (G1 et G2 de PR-B) | orchestrateur |
| **FIXTURE-GEN-VERSIONED-1** (G2 §8) | code | le générateur des preuves de fixture n'existe que hors dépôt (`F:/tmp/ots-1/pr-a/gen-fixtures.mjs`, volatil) ; PR-B (T-1) aura besoin d'autres preuves : versionner un générateur de test, ou construire les preuves dans le test par substitution de digest (motif de MP-9, C-G2-2) | G0 de PR-B | orchestrateur, puis worker PR-B |
| **OTS-REF-STRICT-1** (G2 §8) | décision de conception | le parseur lit toute valeur d'`ots_ref` sans `.ots` comme « non horodatée » (règle de la course, D3) : une faute de frappe passe `--check` et la synchro, seuls C-7 et T-2 la voient (mutant G2-M6, mesure de la G2). Options : (a) garder (conforme à D3) ; (b) imposer `^not timestamped at <ISO Z>$` (recommandation de la G2) | G0 de PR-B | orchestrateur |
| **PRB-BIND-IN-LOADER-1** (G2 §8) | condition PR-B | conséquence d'E-2 : le chargeur des pages appelle `bindPublicationAnchor` sur chaque ligne horodatée avant `publicationAnchorState` (sinon un état serait dérivé de lignes non liées) | PR-B | worker PR-B, relu au G2 de PR-B |
| **SCRIPTS-STATIC-COVERAGE-1** (G2 §8) | recherche | les `.mjs` sont hors ESLint (`eslint.config.mjs:39`, `**/*.mjs` ignoré) et hors `tsc` (`include` de `tsconfig.json` sans `scripts/`) : l'outil et la synchro ne sont couverts que par les tests et `node --check`. Options : `checkJs` sur `scripts/` avec les `.d.mts` existants, ou garder et déclarer | prochain lot d'outillage CI | orchestrateur |
| **TMP-HYGIENE-1** (G2 §8, hors lot) | code | des tests créent des répertoires temporaires sans les supprimer (une suite complète en laisse environ 600 sous `F:/tmp`, mesure de la G2) ; le test de l'outil nettoie depuis C-G2-3. Recoupe O-MP-1 (`docs/adr/ADR-U4b-calibration-episode-frais.md:992`) : un seul item à tenir. Le résidu antérieur à la coupure du 2026-09-24 a été retiré au pli (liste avant retrait dans le rendu du pli) | prochain lot qui touche les tests concernés | orchestrateur |

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

## 14. Pli G2 (2026-09-24) : corrections C-G2-1 à C-G2-6, erratum

- Cadre : la G2 fraîche `F:/tmp/ots-1/g2/G2-PR-A.md` (sha256 `699e8dc2…0dd4`), lue en entier, et ses corrections en liste fermée (son §1). Décisions de l'orchestrateur à `docs/CHANTIERS.md:1440` (`lot/etude-suite` à `80eb2cf`) : R-25 de 376 avalisé sans découpe A1/A2 (E-5), SYNC-LINES-CHECK-1 étendu, six items formés.
- Worker du pli : `claude-opus-5-5[1m]` (R-1 conforme), effort max ; aucun commit, aucun workflow (R-20). Une coupure de courant a interrompu le pli (démarrage de la machine à 16:46:59Z). À la reprise, les 1 534 fichiers suivis ont été hachés : les seuls écarts face à `45cefcc` sont les cinq fichiers du pli.
- Ce journal est gelé AVANT l'oracle du pli et ne porte pas ses chiffres (portes, `npm test`, build, export). Ils sont dans le rendu du pli, `F:/tmp/ots-1/pr-a/PLI-G2.md`, avec `DELIVERED.sha256` recalculé ; l'ancien est conservé en `DELIVERED-45cefcc.sha256` (sha256 `76436088…9c27`).

### 14.1 Corrections pliées

| Id | Objet | Fichiers (+/− du pli) | Mutant tué |
|---|---|---|---|
| C-G2-1 | test : la synchro refuse une ligne de publication non liée AVANT toute écriture (racine temporaire, répertoire servi inchangé) | `test/bell-anchors.test.ts` (+17/−1 avec C-G2-4) | CM-13 (liaison retirée de la synchro) |
| C-G2-2 | `--check --timeline` exige que les entrées du manifeste hors `timeline.jsonl#` soient exactement `provenance/<provenance_sha256>.json states/<state_sha256>.json` de la ligne n (publication), aucune pour une ligne de clé ; test MP-9 | `scripts/anchor-bell-timeline.mjs` (+2/−0) ; test de l'outil | la ligne désactivée : MP-9 rouge ; G2-M7 sur la jambe opérateur |
| C-G2-3 | test : ligne `key_rotation` contresignée (KEYLINE-TOOL-TEST-1), MP-10 (ligne annulée par une révocation), MP-11 (octets non canoniques) ; répertoires temporaires supprimés | `test/bell-anchor-timeline.test.ts` (+35/−3 avec C-G2-2) | V-1, V-2 |
| C-G2-4 | la synchro refuse tout fichier source non régulier (`lstat`, aucun lien suivi) ; C-7 exige des fichiers réguliers sous `docs/bell-publications/` | `scripts/sync-bell-anchors.mjs` (+2/−1) ; `test/bell-anchors.test.ts` | G2-M8 (lien symbolique suivi) |
| C-G2-5 | RUNBOOK, étape 13 : `timeline-seq<n>.jsonl` au lieu de `timeline-seq1.jsonl` (deux occurrences, même ligne) et `--fail` ajouté au `curl` ; la 13 bis lit `timeline-seq<n>.jsonl` (l.392, l.434) | `docs/RUNBOOK-bell.md` (+1/−1, exclu de R-25) | sans objet |
| C-G2-6 | cet erratum : §1, §4, §5, §6, §7, §10 (E-11, E-14, E-15), §11, §14 | ce journal (exclu de R-25) | sans objet |

Mesures faites sur le worktree plié avant le gel de ce journal, avec les exécuteurs de la G2 (`prop-kill.mjs`, `m7-prop.mjs`) dérivés par une seule substitution de chemins ; l'arbre est restauré à l'octet après chaque mutant.
- CM-13 est rouge (C-G2-1). La ligne de C-G2-2 désactivée rend MP-9 rouge. V-1 (ligne annulée acceptée) et V-2 (octets non canoniques acceptés) sont rouges (MP-10, MP-11). Preuve source remplacée par un lien symbolique vers un fichier hors dépôt : synchro exit 1 avant écriture, répertoire servi inchangé, C-7 rouge (C-G2-4).
- G2-M7 rejoué en entier : `--check --timeline` sort 1 (« the manifest's files are not those line 2 names ») ; la synchro sort 0 et les tests restent verts après elle. La jambe opérateur (13 bis, point 5) est fermée ; la synchro et T-2 restent aveugles jusqu'à SYNC-LINES-CHECK-1 étendu.
- Chemin positif sur la donnée réelle : `--check --timeline` avec la copie durable de seq 2 (`F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl`) et le registre committé sort 0, lié à `602ff93d…6946`. Les deux entrées de fichiers du manifeste égalent `provenance_sha256` et `state_sha256` de la ligne 2 réelle : la comparaison porte sur des valeurs, pas sur des champs absents.

### 14.2 Fichiers modifiés par le pli et R-25

| Fichier | sha256 au gel `45cefcc` (§2) | sha256 après pli |
|---|---|---|
| `scripts/anchor-bell-timeline.mjs` | `44b7d633…8dab` | `aa09e1430d64e65a17c46ee1efabd735b56fc118659c66f6069cd7bbe508c9fe` |
| `scripts/sync-bell-anchors.mjs` | `e01ca3d3…ed1a` | `4bf6df1964072a3bce286f533bffdd4332d1d7ed682325aaa21509427059e391` |
| `test/bell-anchor-timeline.test.ts` | `80593819…afd4` | `90e7bb2ede06b8da1e6f763999feba5536e6445a8af566c4279119388c28dc8f` |
| `test/bell-anchors.test.ts` | `4baaee53…4d79` | `5a21114fe030cd2970af82f6b87fac99d38c265df934f29965cc78e8a7374576` |
| `docs/RUNBOOK-bell.md` | `c3b9b9b4…0c6e` | `5ceec718b070c025122483ddb19c2df1f6dac883a86f250d28b3012fd751496c` |
| ce journal | `5b1becee…2130` | `DELIVERED.sha256` recalculé (hors dépôt) |

R-25 a été mesuré avant l'écriture de ce journal, qui est exclu du pathspec. Commande : `git diff --shortstat 1c78543 -- <pathspec>` sur l'arbre plié, avec le pathspec de `.github/workflows/ci.yml:65` recopié mot pour mot, puis l'`awk` de `:69`. Résultat : **11 fichiers, 409 insertions, 22 suppressions, soit 431 lignes** ; le même pathspec à `45cefcc` donne toujours 376. L'estimation « environ 437 » (376 + 61) compte deux fois les trois lignes de `test/bell-anchor-timeline.test.ts` (fichier nouveau) que le pli remplace.

### 14.3 Erratum au §4 et au §6 : rendu

- « 19 empreintes identiques (sha256 `afe495cf…e938` des deux côtés) » est vrai pour les builds du G1, mais la méthode n'est pas stable. Mesure de la G2 (`G2-PR-A.md` §4.5) : trois builds de la même tête (`.next` supprimé avant chacun) donnent deux fichiers d'empreintes, `afe495cf…e938` aux builds 1 et 2 et `2511b793…b8f2` au build 3 ; ce dernier égale son unique build de la base. La seule différence porte sur `bell/anchors.html` : la position de `<meta name="next-size-adjust" content=""/>` dans `<head>`.
- Relu au pli sur les deux rendus sauvegardés par la G2 (`F:/tmp/ots-1/g2/logs/anchors-base.txt` et `anchors-head.txt`, 21 924 octets et une occurrence de la balise chacun) : ils sont identiques octet pour octet une fois la balise retirée.
- La conclusion tient (PR-A ne change aucune page) ; la méthode est à corriger (item RENDER-FINGERPRINT-NONDET-1).

### 14.4 Erratum : E-11 et tête amont

- E-11 est clos : `F:/PRODUITS/bell-mirror/immutables/states/4564701a…08b9.json` (14 070 octets) et `provenance/ad8dd9b0…c39b.json` (1 202 octets) existent depuis 2026-09-24T15:37:00Z (date de création lue au pli), et le sha256 de chacun égale son nom. Le rejeu local de seq 2 ne dépend plus d'un GET.
- La tête amont n'est plus `3107730` (en-tête, E-13) : `lot/etude-suite` était à `7f875c6` lors de la G2, puis à `80eb2cf` lors du pli. La base de fusion reste `1c78543`. Dans l'ADR, le seul changement amont reste l'amendement de 15:03 UTC déjà lu (E-13). Aucun des 9 fichiers modifiés en amont n'est commun avec PR-A et le pli.

### 14.5 Items et `error_origin`

- §11 mis à jour : KEYLINE-TOOL-TEST-1 et SEQ2-IMMUTABLES-MIRROR-1 clos ; SYNC-LINES-CHECK-1 étendu ; six items formés par l'orchestrateur à partir de la G2 (§8).
- `error_origin` proposés par la G2 (son §9), à assigner au G7 : CM-13 survivant et V-1/V-2 sans test (génération) ; G2-M7 (conception de la liaison dans ADR D5, et génération) ; liens symboliques suivis (antérieur au lot, étendu par la génération) ; E-14 et E-15 non déclarés au G1 (génération) ; rendu non déterministe (méthode de vérification du G1).
- Observation de revue, hors code du lot, à assigner au G7 (méthode de revue) : le rejeu G2-M5b de la G2 a lancé `test/verify-bell.test.ts` avec `GIT_DIR` pointé sur le dépôt principal. Le test (l.210-220 : `git init`, `git add unit.service`) a alors écrit dans l'index de ce dépôt. Preuves dans le rendu du pli.

### 14.6 Sources lues pour le pli

- [lu] `F:/tmp/ots-1/g2/G2-PR-A.md` (316 lignes) et `F:/tmp/ots-1/g2/prop/PROPOSED.diff` (144 lignes), en entier. Exécuteurs de la G2 `prop-kill.mjs` et `m7-prop.mjs`, relus au pli, avec des sha256 égaux à ceux de `F:/tmp/ots-1/g2/ARTIFACTS.sha256`.
- [lu] `docs/CHANTIERS.md:1440-1441` à `80eb2cf` ; `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` l.231 et `git diff 1c78543 80eb2cf` sur l'ADR.
- [lu] dépôt : `test/bell-served.test.ts:272-280`, `test/bell-anchor-timeline.test.ts:15-40`, `scripts/anchor-bell-timeline.mjs` l.1-40 et l.73-100, `docs/RUNBOOK-bell.md` l.365, l.392 et l.434, `.github/workflows/ci.yml:60-72`, `eslint.config.mjs:34-47`, `tsconfig.json` (`include`), `test/verify-bell.test.ts:207-220`.
- Mesures de la G2 citées sans rejeu au pli, avec leur source : les trois builds (§14.3), G2-M5b (E-15), G2-M6 (OTS-REF-STRICT-1), environ 600 entrées laissées sous `F:/tmp` par une suite complète (TMP-HYGIENE-1). Aucun autre chiffre de seconde main.
