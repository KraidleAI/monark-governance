# G1 : génération tracée, lot SITE-DOCS-1 (section /docs de la vitrine MONARK, et /roadmap devenu MONARK Building)

- **Générateur** : worker `claude-opus-5-5[1m]`, effort max (contrôle R-1 : préfixe `claude-opus-5-5` déclaré en première
  prise de parole ; la session a été continuée après un résumé de contexte le 2026-09-24, même modèle résolu). Rôle :
  implémenteur. Aucun commit, aucun push, aucun workflow (R-20).
- **Worktree livré** : `F:\Monark-wt-docs`, branche `lot/site-docs-1`, base et HEAD `3436304`, modifications non commitées
  (index = HEAD). `node_modules` installé par `npm ci --ignore-scripts` (répertoire réel, pas de jonction ; journal
  `F:\tmp\site-docs-1\npm-ci.log` : 283 paquets ajoutés, sortie 0).
- **Spécification** : mission SITE-DOCS-1 de l'orchestrateur (sections a à k, contrôles, tests à ajouter, captures, R-25,
  journal, DELIVERED) ; ajout du coordinateur, décision 191 du 2026-09-24 : /roadmap devient MONARK Building (route
  conservée, libellé « Building », alias /building, Now / Next daté / Longer term, schéma de trajectoire, contenu existant
  conservé et réorganisé).
- **Réviseur attendu** : orchestrateur (vérification adversariale R-21), puis G2 séparée et validateur-humain.

| Date | PR/commit | Modèle | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | non commité (worktree `lot/site-docs-1`) | claude-opus-5-5[1m] | max | mission SITE-DOCS-1, décision 191, script du deck, registre, données servies commitées | worker implémenteur | orchestrateur | à rendre |

## 1. Périmètre livré

Modifiés (8 fichiers suivis ; lignes +/- mesurées par `git diff --numstat 3436304`) :

| Fichier | +/- | Objet |
|---|---|---|
| `apps/site/app/roadmap/page.tsx` | 130/43 | MONARK Building : Now (dérivé du registre et des données servies), Next (intentions datées `INTENTIONS_STATED`), Longer term, schéma de trajectoire ; couches, phases et listes d'agents conservées (tirets longs remplacés par deux-points) |
| `apps/site/components/site-header.tsx`, `site-footer.tsx` | 4/2, 2/1 | libellé « Building » pour /roadmap, lien « Docs » |
| `apps/site/next.config.mjs` | 5/0 | redirection temporaire `/building` vers `/roadmap` |
| `apps/site/data/manifest.sha256.json` | 3/2 | entrée `apps/site/data/docs-references.json` et phrase du `$comment` |
| `scripts/lang-gate.mjs`, `scripts/lang-gate.d.mts` | 13/2, 7/0 | `skipDir` exporté : le dossier `docs` sous `apps/site` est une route, il est parcouru (écart D2) |
| `test/export-public.test.ts` | 26/1 | miroir BLACKLIST : exemption exacte des deux dossiers vitrine de /docs, test d'épingle dans les deux sens (écart D3) |

Nouveaux (46 fichiers, 6230 lignes, `wc -l`) : 22 pages sous `apps/site/app/docs/` (vue d'ensemble, gate, pieces et 11
pages de pièce, bell, ukemi, narabi, integrators, use-cases, research, verify, glossary) avec `layout.tsx` et `docs.css` ;
`apps/site/components/docs/` (kit SVG, kit de page, navigation, page de pièce partagée, 11 modules de schémas) ;
`apps/site/lib/docs-{nav,pieces,gate,references-load,vocab}.ts` ; `apps/site/data/docs-references.json` (bibliographie
commitée, hachée au manifeste) ; `test/site-docs.test.ts` (10 tests). Plus ce journal.

Rendu mesuré sur le build : 42 routes statiques, dont 22 sous /docs ; 38 schémas SVG dans le HTML construit, chaque page
/docs en porte au moins un (extraction `F:\tmp\site-docs-1\extract-svgs.mjs`, index `_controles\svg\index.json`) ;
`/building` répond 307 vers `/roadmap` sous `next start`. En production le site est servi par `next start` derrière
Caddy (`deploy/Caddyfile.monark-narabi.snippet:4` : bloc du site avec `reverse_proxy localhost:3000`), donc la
redirection de `next.config.mjs` s'y applique.

## 2. Sources, lues avant le travail

### 2.1 Sources projet [lu], première main

| Source | Usage |
|---|---|
| `F:\PRODUITS\communication-2026-09-21\pitch-clawpump\deck\DECK-DETAILLE-SCRIPT.md` (sha256 `a50c41cd1083b1a286c398444f961287bbcf5502af7e114b02a12ca3dd1e87ff`) | plan des sections, planches couteau, étages, sas, trois brins ; §41 l.263-265 : pièces « in the order of demand evidence », démonstration à deux agents « Planned, no date », « more served classes and more distribution, not more pieces » |
| `apps/site/lib/fleet.ts` (registre : 11 agents, 6 applications) | noms, rôles, statuts, câblage servi (`wiring`), phrases de statut ; jamais recopiés à la main |
| `schemas/*.schema.json` (contrats gelés) | titres, clés requises, énumérations action et raison (`lib/gate-enums.ts`) |
| `apps/site/data/{harness-served,bell-served,ukemi-course,ukemi-served,narabi-served,narabi-capture}.json`, `fixtures/{h5-e2e-trace,byo-demo-trace,figures-sourced}.json` | tout exemple, chiffre, horodatage et empreinte affichés, lus par leurs chargeurs fail-closed |
| `packages/hikae/src/l3-gate.ts`, `packages/hikae/src/l2-monitor.ts` | ordre de priorité de la politique fermée ; nature du moniteur (IM-OCP, « no guarantee claimed ») |
| `apps/site/lib/bell-method.ts`, `apps/bell/scripts/bell-chain.mjs:51`, `bell-publish.mjs:255,310`, `bell-verify.mjs:6,114` | bornes de séance ; geste « chaîne » : `line_hash = sha256(canonical(line))` et ligne publiée `canonical(line) + "\n"`, donc `sed -n 'np' | tr -d '\n' | sha256sum` rend `line_hash` ; statuts `consistent_with_supplied_keyring` / `self_consistent_only` |
| `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` (D4, six gestes), `docs/adr/ADR-B0-programme-bell.md` (T-3, classe `tsv-offhours-gap-24h`, régime dans `predictor_id`), `docs/adr/ADR-U4b-2b-classe-servie.md`, `docs/PASSATION-2026-09-24.md:51` (EXPORT-BELL-1-PURGE), `README.md:95` (agents d'adaptation) | page Verify ; intentions Next et Longer term de MONARK Building |
| `test/token-ca-pinned.test.ts:22-23`, `out/mint.txt` | geste « adresse du jeton » |
| `apps/site/lib/ukemi-course-view.ts:131` (« the pre-registered exchangeability test with the design episode ») | préfixe de la glose des strates qui atteignent le plancher sur le schéma de /docs/ukemi, « exchangeability test with the design episode: », écrit par la page et aligné sur cette phrase |

Preuve par calcul du geste « chaîne » de /docs/verify (hors réseau) : le miroir opérateur
`F:\PRODUITS\bell-mirror\timeline-seq2-20260924T0841Z.jsonl` a pour sha256 `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b`,
égal à `bodies_sha256["/timeline.jsonl"]` de `apps/site/data/bell-served.json` (le corps servi sur lequel la donnée du site
a été synchronisée). Chaque ligne brute est déjà canonique (`canonical(JSON.parse(l)) === l`, fonction de
`apps/bell/scripts/bell-chain.mjs`) et ne porte pas de champ `line_hash`. sha256 de la ligne 1 sans son saut de ligne =
`4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c` = `first_record.line_hash` = `head.prev_line_hash` ;
sha256 de la ligne 2 = `ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464` = `head.line_hash`. La légende
du bloc JSON de /docs/bell dit désormais que la ligne servie ne porte pas `line_hash` (calculé) et que ses `runs` sont
omis.

### 2.2 Bibliographie publiée (`apps/site/data/docs-references.json`)

32 œuvres : 24 « read in part », 6 « read in full », 2 « not yet obtained » (French 1980, Perold 1988 : demandes de
procurement déjà formées, `F:\PRODUITS\communication-2026-09-21\pitch-clawpump\biblio\pieces-nommees\PROCUREMENT-french-1980.md`
et `PROCUREMENT-perold-1988.md` ; la page les cite par leur nom seulement). Les niveaux sont ceux des fiches de lecture
du projet : `F:\PRODUITS\communication-2026-09-21\pitch-clawpump\biblio\{noyau-conforme,attestation-porte-ukemi,pieces-nommees}\*.md`
et `docs/biblio/{ukemi-modeL,M012-h,bell}/*.md` ; « read in full » = fiche [lu] intégrale, « read in part » = [lu] par
sections ciblées. Deux titres ne sont pas reproduits (`title_note`) : Vovk et al. 2003 (mot banni du site dans le
titre) et Gatto 2026 (nom du protocole prêteur). Aucun chiffre de l'œuvre n'est reproduit hors du fichier de figures
sourcées déjà commité.

### 2.3 Les six résultats cités, relus en primaire par ce worker (texte extrait, pas l'image)

| Résultat | Œuvre, lieu | Primaire relu (fichier:lignes) | Niveau |
|---|---|---|---|
| `split-quantile` | Angelopoulos, Bates 2023, §1 et Thm 1 | `F:\PRODUITS\...\biblio\noyau-conforme\_txt\angelopoulos-bates-2023-gentle-introduction.txt:130-140, 219` | [lu] |
| `type-wise` | Vovk, Lindsay, Nouretdinov, Gammerman 2003, résumé et §2 | `...\noyau-conforme\_txt\vovk-2003-mondrian.txt:23-30` | [lu] |
| `beyond-exchangeability` | Barber, Candès, Ramdas, Tibshirani 2023, Thm 2 | `F:\Monark\docs\biblio\ukemi-modeL\_txt\barber-candes-ramdas-tibshirani-2023.txt:755-770` (borne inférieure 1 - alpha moins l'écart de couverture ; « The same result holds true for nonexchangeable split conformal ») | [lu] |
| `decaying-bound` | Angelopoulos, Barber, Bates 2024, Thm 1 | `...\noyau-conforme\_txt\angelopoulos-barber-bates-2024.txt:196-210` (suites arbitraires, pas positifs non croissants, borne (B + eta_1)/(eta_T T)) | [lu] |
| `reject-option` | Chow 1970, résumé et §I | `F:\Monark\docs\biblio\ukemi-modeL\_txt\chow1970.txt:23-28` (résumé en colonne gauche ; « some would-be correct recognitions are also converted into rejects » en colonne droite, §I) | [lu] |
| `eligible-not-loss` | Gatto 2026, résumé | `F:\Monark\docs\biblio\ukemi-modeL\_txt\gatto2026-ssrn-7157638.txt:13-39` | [lu] |

Corrections faites à cette relecture : les énoncés `beyond-exchangeability` et `decaying-bound` portaient une phrase de
MONARK attribuée à la source (« no coverage is measured », « printed with T ») ; elle est retirée de l'énoncé et dite par
la page comme phrase de MONARK. L'intitulé « In the words of the source » (qui suggérait une citation verbatim) devient
« The result, after » : les énoncés sont des reformulations attribuées, pas des citations. Le lieu de `reject-option`
devient « abstract and Section I ».

## 3. Écarts déclarés

- **D1 Planches du deck redessinées, pas incluses.** Les SVG du deck portent des statuts tapés, des chiffres, des chemins
  internes, des noms bannis, l'ancienne formulation du budget et un état ancien de Bell. Chaque planche est redessinée en
  composant TSX aux couleurs de la charte (variables CSS, clair et sombre), statuts lus au registre, valeurs lues aux
  données ; la légende de chaque figure dit « adapted from the pitch deck ».
- **D2 `scripts/lang-gate.mjs`.** `SKIP_DIRS` sautait tout dossier nommé `docs`, donc la route /docs échappait à la porte
  de langue. `skipDir` parcourt `docs` sous `apps/site` seulement ; `docs/` racine et `packages/*/docs/` restent sautés.
  Test `lang_gate_scans_the_docs_route` ; mutant M-LANG-GATE-DOCS-ROUTE-SKIPPED rouge. Changement d'un outil de
  gouvernance : relecture G2 requise (item LANG-GATE-DOCS-ROUTE-1).
- **D3 `test/export-public.test.ts`.** Le premier passage complet a rougi le test 42 : « blacklisted path exported:
  apps/site/app/docs/bell/page.tsx (matched /(^|\/)docs\//) ». Le script d'export exporte la route (sa
  `STRUCTURAL_BLACKLIST` n'a pas d'attrape-tout) ; le miroir du test en avait un. Le miroir exempte exactement
  `apps/site/app/docs/` et `apps/site/components/docs/` ; tout autre dossier `docs/`, sous `apps/site` aussi, reste noir.
  Nouveau test `export_blacklist_keeps_governance_docs_and_lets_the_docs_route_ship` ; mutants
  M-EXPORT-BLACKLIST-CATCHALL-BACK et M-EXPORT-BLACKLIST-TOO-WIDE rouges ; test 42 relancé seul après correction : vert
  (623 s). Relecture G2 requise (item EXPORT-TEST-DOCS-ROUTE-1).
- **D4 Textes servis cités verbatim avec tiret long.** 7 occurrences sur 5 pages /docs, toutes des textes du harnais
  servi : la clause de `btc-dir-15m` (« declared synthetic », suivie d'un tiret long puis de « a plumbing fixture, not a measured predictor », 6 fois) et la description de
  `params.remainingBudget` (1 fois). Ma prose n'en porte aucun : balayage du rendu (§5) ; le test `docs_data_is_clean` couvre les littéraux, les données et le texte JSX rendu des sources /docs et de /roadmap, en caractère comme en entité (mutants M-DOCS-LONG-DASH et M-DOCS-LONG-DASH-JSX rouges).
  Le titre OpenAPI servi (tiret long) n'est plus affiché ; la source de la figure Qin (tiret long dans
  `fixtures/figures-sourced.json`) est remplacée par l'attribution de la bibliographie, liée par DOI (échec du build si
  le DOI ne nomme aucune œuvre listée). Item HARNESS-TEXT-DASH-1.
- **D5 Noms de plateformes dans les figures de la littérature.** /docs/research affiche, verbatim, les figures de Qin et
  al. 2021 filtrées par le vocabulaire du site (une figure retenue pour « Aave », comptée et dite) ; trois noms non bannis
  y restent : MakerDAO, Compound, DAI. Item DOCS-RESEARCH-PLATFORM-NAMES-1 (arbitrage).
- **D6 Serveur de prévisualisation lié à toutes les interfaces.** Une première session de captures a lancé
  `next start -p 3107` sans `-H` (PID 34664, écoute `0.0.0.0:3107` et `[::]:3107`, constaté par `netstat`) ; contenu servi
  = build public de la vitrine, aucun appel sortant. Arrêté ; relancé `next start -H 127.0.0.1 -p 3107` (PID 110120,
  écoute `127.0.0.1:3107` seule), arrêté après les captures.
- **D7 Lecture de `~/.npmrc`.** Pour établir le cache et l'audit npm, le fichier a été lu avec la valeur du jeton
  masquée dans le même pipeline (`sed`) : la valeur n'a jamais été affichée. La règle « aucune page portant un secret n'est
  lue » est déclarée comme touchée.
- **D8 Captures mobiles par iframe.** Chrome sans tête impose une largeur minimale de fenêtre : une capture directe à 375
  px est coupée à droite sur toutes les pages, y compris /how (inchangée). Les captures mobiles sont faites dans une iframe
  de 375 px ; les captures directes, trompeuses, ont été supprimées.
- **D9 Réseau pendant les contrôles prescrits.** `npm ci --ignore-scripts` (prescrit) a audité les paquets (« audited 294
  packages », `audit=true` dans la configuration effective) ; le test 42 du `npm test` complet (prescrit) lance un
  `npm ci` puis `npm run ci` dans l'export temporaire, audit compris. Des requêtes vers le registre npm ont donc
  probablement eu lieu pendant des contrôles prescrits ; non mesurées. Les captures de revue ont été faites avec Chrome
  sans tête lancé sans `--disable-background-networking` ; les captures livrées (§6) ont été refaites avec ce drapeau et
  ses voisins. Le trafic de fond de Chrome n'est mesuré dans aucun des deux cas. Rien n'a été contourné. Items
  TEST42-NETWORK-1 et CAPTURE-NET-1.

## 4. Contrôles

Environnement de chaque contrôle : `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u
CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY
TEMP=F:/tmp TMP=F:/tmp TMPDIR=F:/tmp NEXT_TELEMETRY_DISABLED=1` (script `F:\tmp\site-docs-1\controls.sh`, un journal par
contrôle).

| Passage | Base | typecheck | lint | lint:ratchet | gate:vocab | lang:gate | export:check | npm test | next build | assert-fleet-html |
|---|---|---|---|---|---|---|---|---|---|---|
| référence `baseline/` (13:56Z à 14:09Z) | arbre `3436304` sans le lot | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `final/` (15:17Z à 15:25Z) | lot, avant D3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 (test 42, D3) | 0 | 0 |
| `final2/` (15:57Z à 16:10Z) | lot, avant les corrections de relecture (§2.3) et la garde JSX de D4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (1273 tests, 1271 verts, 2 ignorés) | 0 | 0 |
| `final3/` (16:11Z à 16:19Z) | lot, avant la légende précisée du bloc JSON de /docs/bell (§2.1) | 0 | 0 | 0 | 0 | 0 | 0 | 0 (1273 tests, 1271 verts, 2 ignorés) | 0 | 0 |
| `final4/` (16:29Z à 16:40Z) | arbre de code livré (ce journal est ajouté ensuite sous `docs/`, hors de tout contrôle, §12) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Détail du passage `final4/` : `npm test` = 1273 tests, 1271 verts, 0 rouges, 2 ignorés (les 2 ignorés le sont aussi dans la référence) ; les 11 tests du lot sont verts (10 dans `test/site-docs.test.ts`, 1 dans `test/export-public.test.ts`) ; test 42 vert en 576 s. lint:ratchet : « lint-ratchet: 69/69 (deferred-typing violations in the tests / committed ceiling, measured_on 2026-09-16) ». Journaux : `F:\tmp\site-docs-1\final4\`.

## 5. Texte rendu (diff des phrases visibles, page par page)

Procédé `F:\tmp\site-docs-1\text-diff.mjs` : titre, méta description et corps sans scripts ni styles, balises de bloc
comme fins de ligne, entités décodées, SVG compris ; base = HTML du build de référence
(`F:\tmp\site-docs-1\baseline\html`), nouveau = build final. Résultats : `F:\tmp\site-docs-1\_controles\text\`
(`<page>.base.txt`, `<page>.new.txt`, `<page>.diff.txt`, `summary.txt`, `summary.json`, `hits-new-build.txt`).

- 18 pages existantes hors /roadmap : 2 lignes retirées et 2 ajoutées chacune (en-tête et pied : « Roadmap » devient
  « Building », « Docs » ajouté), rien d'autre (/_global-error : 0).
- /roadmap : 14 lignes retirées, 92 ajoutées (titre MONARK Building, Now, Next, Longer term, schéma ; tirets longs
  des couches devenus deux-points).
- 22 pages nouvelles, 3333 lignes visibles.
- Balayage des lignes ajoutées : 0 motif cuisine (liste fermée de `test/site-build-fleet.test.ts`), 0 nom de source de
  données, 0 nom d'opérateur, 0 règle du vocabulaire site, 0 « partner », 0 « verified » nu, 0 « guarantee », 0
  « product(s) », 0 ClawHub ; « probability of being right » : toujours niée (« never a probability of being right »,
  « not a probability of being right ») ; tirets longs : les 7 citations servies de D4. Sur tout le build, les autres
  occurrences (bell/terms, how) préexistent à l'identique dans la référence.

## 6. Captures (`F:\tmp\site-docs-1\_controles\`)

Toutes les captures livrées sont faites sur le build de `final4/`, Chrome sans tête lancé avec un profil temporaire sous
`F:\tmp` et `--disable-background-networking --disable-component-update` (scripts `shoot-svgs.sh`, `capture-pages.sh`) ;
serveur `next start -H 127.0.0.1 -p 3107` (PID 71792, écoute sur la boucle locale seule, relevé `netstat` et réponse 307
de `/building` dans `_controles\server-listen.txt`), arrêté ensuite.

- `svg\` : les 38 schémas, chacun isolé en HTML avec les variables de la charte et capturé en clair et en sombre (76
  PNG), revus un à un ; corrections de mise en page faites (lame du couteau, boîte defer, politique, journée Bell, chaîne de
  publication, outils servis, strates Ukemi, suivi Narabi, contrats des planches, trajectoire).
- `pages\` : 23 pages en bureau clair (1280), 4 en sombre, 5 en mobile 375 par iframe (D8), 2 impressions PDF
  (`docs__gate__print.pdf`, `docs__bell__print.pdf` : menu, sommaire et chrome masqués, figures entières, couleurs gardées).

## 7. Mutants rejoués sur les fichiers réels

`F:\tmp\site-docs-1\mutants.mjs`, résultats `_controles\mutants.json` et `mutants.txt` : pour chacun, sha256 du fichier
avant, pendant, après ; oracle nommé ; restauration prouvée. Empreinte de l'arbre (`git status` et sha256 des 54 fichiers
du lot) identique avant et après (`_controles\pre-mutants.sha`, `post-mutants.sha`).

| Mutant | Fichier | Oracle | Résultat |
|---|---|---|---|
| M-DOCS-TYPED-STATUS-SENTENCE | `apps/site/app/docs/bell/page.tsx` | test/site-docs.test.ts :: docs_statuses_come_from_the_register | rouge, restauré (sha256 égal) |
| M-DOCS-LITERAL-STATUS-PROP | `apps/site/app/docs/bell/page.tsx` | test/site-docs.test.ts :: docs_statuses_come_from_the_register | rouge, restauré (sha256 égal) |
| M-DOCS-TYPED-EXAMPLE | `apps/site/app/docs/integrators/page.tsx` | test/site-docs.test.ts :: docs_examples_come_from_committed_data | rouge, restauré (sha256 égal) |
| M-DOCS-TYPED-DIGEST | `apps/site/app/docs/integrators/page.tsx` | test/site-docs.test.ts :: docs_examples_come_from_committed_data | rouge, restauré (sha256 égal) |
| M-DOCS-SCHEMA-REMOVED | `apps/site/app/docs/gate/page.tsx` | test/site-docs.test.ts :: docs_pages_render_a_schema | rouge, restauré (sha256 égal) |
| M-DOCS-DIAGRAM-REMOVED | `apps/site/components/docs/schemas/glossary.tsx` | test/site-docs.test.ts :: docs_pages_render_a_schema | rouge, restauré (sha256 égal) |
| M-LANG-GATE-DOCS-ROUTE-SKIPPED | `scripts/lang-gate.mjs` | test/site-docs.test.ts :: lang_gate_scans_the_docs_route | rouge, restauré (sha256 égal) |
| M-EXPORT-BLACKLIST-CATCHALL-BACK | `test/export-public.test.ts` | test/export-public.test.ts :: export_blacklist_keeps_governance_docs_and_lets_the_docs_route_ship | rouge, restauré (sha256 égal) |
| M-EXPORT-BLACKLIST-TOO-WIDE | `test/export-public.test.ts` | test/export-public.test.ts :: export_blacklist_keeps_governance_docs_and_lets_the_docs_route_ship | rouge, restauré (sha256 égal) |
| M-DOCS-DIGIT-IN-DATA | `apps/site/lib/docs-pieces.ts` | test/site-docs.test.ts :: docs_data_is_clean | rouge, restauré (sha256 égal) |
| M-DOCS-LONG-DASH | `apps/site/app/docs/gate/page.tsx` | test/site-docs.test.ts :: docs_data_is_clean | rouge, restauré (sha256 égal) |
| M-DOCS-LONG-DASH-JSX | `apps/site/app/docs/gate/page.tsx` | test/site-docs.test.ts :: docs_data_is_clean | rouge, restauré (sha256 égal) |
| M-DOCS-KITCHEN | `apps/site/app/docs/page.tsx` | test/site-build-fleet.test.ts :: site_names_no_kitchen | rouge, restauré (sha256 égal) |
| M-DOCS-DATA-SOURCE | `apps/site/app/docs/research/page.tsx` | test/site-build-fleet.test.ts :: site_names_no_data_source | rouge, restauré (sha256 égal) |
| M-DOCS-GUARANTEE | `apps/site/app/docs/gate/page.tsx` | npm run gate:vocab | rouge, restauré (sha256 égal) |
| M-BUILDING-ALIAS-REMOVED | `apps/site/next.config.mjs` | test/site-docs.test.ts :: building_page_derives_now_and_keeps_its_alias | rouge, restauré (sha256 égal) |
| M-BUILDING-NOW-TYPED | `apps/site/app/roadmap/page.tsx` | test/site-docs.test.ts :: building_page_derives_now_and_keeps_its_alias | rouge, restauré (sha256 égal) |
| M-DOCS-CITE-UNKNOWN | `apps/site/app/docs/gate/page.tsx` | test/site-docs.test.ts :: docs_references_fail_closed_and_every_cited_work_exists | rouge, restauré (sha256 égal) |
| M-DOCS-REF-TAMPERED | `apps/site/data/docs-references.json` | test/site-docs.test.ts :: docs_references_fail_closed_and_every_cited_work_exists | rouge, restauré (sha256 égal) |
| M-DOCS-REASON-GLOSS-MISSING | `apps/site/lib/docs-gate.ts` | test/site-docs.test.ts :: docs_reason_glosses_track_the_frozen_enum | rouge, restauré (sha256 égal) |
| M-HEADER-DOCS-LINK-REMOVED | `apps/site/components/site-header.tsx` | test/site-docs.test.ts :: docs_pieces_and_navigation_match_the_register | rouge, restauré (sha256 égal) |

## 8. R-25

Mesure avec le pathspec exact de `.github/workflows/ci.yml` (exclusions S2, docs/**/*.md, lockfile, séries) : fichiers
suivis `git diff --shortstat 3436304` = 8 fichiers, 190 insertions, 51 suppressions ; fichiers nouveaux non suivis
(hors pathspec exclu) = 46 fichiers, 6230 lignes. Total 6471 lignes, borne 1205 : dépassement attendu et déclaré (item
R25-SITE-DOCS-1, découpage proposé).

## 9. Ce qui n'a pas pu être confirmé

- Les niveaux de lecture de 26 des 32 œuvres sont transcrits des fiches du projet ; seuls les six résultats cités ont été
  relus en primaire par ce worker (§2.3).
- Les figures de Qin et al. sont reprises de `fixtures/figures-sourced.json` ; leur note de lecture est
  `F:\Clawpumptech\procurements-lectures\P-K1-1-qin2021.md` (lecteur, 2026-09-05, statut clos, [lu] corps et annexes,
  p. 341 et 344) ; ce worker ne les a pas relues en primaire.
- Le trafic réseau du test 42 et de Chrome sans tête (D9) : non mesuré.
- Mobile : iframe 375 dans Chrome de bureau, pas d'appareil réel ; impression : deux pages.
- La redirection /building est vérifiée sous `next start` local ; en production elle dépend du même `next start`
  derrière Caddy (§1), non vérifiée sur l'hôte (aucun appel sortant fait).

## 10. Items formés

| Item | Objet | Propriétaire | Déclencheur |
|---|---|---|---|
| R25-SITE-DOCS-1 | 6471 lignes pour une borne de 1205. Découpage proposé en 8 PR sous la borne : (1) fondations (kits, navigation, layout, CSS, vocabulaire, lang-gate, test export, en-tête et pied, redirection) ; (2a) bibliographie, chargeur et vue d'ensemble ; (2b) gate ; (3) pièces ; (4) Bell, Ukemi, Narabi ; (5a) intégrateurs et cas d'usage ; (5b) recherche, vérification, glossaire ; (6) MONARK Building ; les tests suivent leurs blocs | orchestrateur | avant l'ouverture de la PR |
| LANG-GATE-DOCS-ROUTE-1 | relecture G2 du changement `skipDir` (D2) | relecteur G2 | G2 de ce lot |
| EXPORT-TEST-DOCS-ROUTE-1 | relecture G2 du miroir BLACKLIST resserré (D3) ; son commentaire dit désormais que le miroir est plus strict que le script (attrape-tout des dossiers docs/), jamais plus lâche | relecteur G2, orchestrateur | G2 de ce lot |
| HARNESS-TEXT-DASH-1 | textes servis du harnais avec tiret long (clause `btc-dir-15m`, description de `params.remainingBudget`, titre OpenAPI), cités verbatim sur /docs (7) et déjà sur /integrators | lot MCP (harnais) | prochaine révision ou resynchro du texte servi |
| REGISTER-LINES-DASH-1 | trois lignes du registre (`lib/fleet.ts:132, 147, 225`) portent des tirets longs, rendues sur /roadmap (préexistant) | orchestrateur (arbitrage du texte du registre) | prochaine édition du registre |
| DOCS-RESEARCH-PLATFORM-NAMES-1 | MakerDAO, Compound, DAI dans les figures verbatim de Qin et al. sur /docs/research (D5) : garder (littérature attribuée) ou retenir | orchestrateur (arbitrage) | G7 de ce lot |
| DOCS-REF-TITLE-VOCAB-1 | deux titres non reproduits dans la bibliographie (mot banni, nom de protocole) : exemption de titres bibliographiques ou statu quo | orchestrateur (arbitrage) | prochaine révision de `vocab-banned.json` |
| DOCS-KNIFE-LAYOUT-1 | le couteau est dessiné pour deux lames ouvertes ; une troisième application « built » fait échouer le build, par construction (message nommé) | lot vitrine | une troisième application passe « built » au registre |
| DOCS-SVG-BUILD-CHECK-1 | « au moins un schéma par page /docs » est épinglé au source (test) et mesuré sur le build par ce lot ; une assertion sur le HTML construit dans `scripts/assert-fleet-html.mjs` l'épinglerait au build | orchestrateur (famille ASSERT-FLEET-SITE5J-1) | prochaine révision d'`assert-fleet-html.mjs` |
| TEST42-NETWORK-1 | le test 42 lance `npm ci` avec audit et scripts dans l'export pendant `npm test` : requêtes probables vers le registre (D9) ; piste : `npm ci --ignore-scripts --no-audit --offline` sur cache, à arbitrer (change le sens du contrôle « CI exportée verte ») | orchestrateur (gouvernance CI) | prochain lot ci-gates ou export |
| CAPTURE-NET-1 | captures de revue faites sans `--disable-background-networking --disable-component-update` (D9) ; drapeaux appliqués aux captures livrées et aux scripts ; le trafic de fond de Chrome reste non mesuré (une capture réseau le mesurerait) | orchestrateur | prochaine campagne de captures |
| BELL-SPYX-GAP-1 | observation : la ligne 2 servie porte pour SPYx, séance regular, un écart `gT` = `[masqué]` (négatif, hors de la bande des huit autres lignes), affiché tel quel sur /docs/bell ; à confronter à la méthode (multiplicateur, clôture) | lot Bell | prochaine revue de publication Bell |

## 11. Consultations (R-26)

Canal intégré (outil advisor du harnais), trois consultations. La première, avant la fin de la relecture visuelle, a
expiré sans réponse (consigné, non contourné). La deuxième, au lancement des contrôles finaux : ne pas toucher l'arbre
pendant un passage, captures de schémas périmées d'une retouche (refaites), serveur lié à toutes les interfaces à
consigner (D6), deux items à former (DOCS-KNIFE-LAYOUT-1, provenance de la glose Ukemi). La troisième, au moment de
déclarer la fin : prouver le geste « chaîne » par calcul (fait, §2.1, et légende de /docs/bell précisée), consigner les
consultations (cette section), citer la source de la glose Ukemi (§2.1), dire que le journal est ajouté après le dernier
passage. Avis, jamais verdict : G7 reste à l'orchestrateur.

## 12. Livraison

Empreintes : `F:\tmp\site-docs-1\DELIVERED.sha256` (fichiers du lot, chemins relatifs au worktree, puis preuves sous
`F:\tmp\site-docs-1\`). Ce journal ne change aucun contrôle : `docs/**/*.md` est hors export, hors porte de langue et hors
compte R-25.

## 13. Pli de la G2 fraîche et des remarques de l'investisseur (2026-09-24)

- **Générateur** : worker `claude-opus-5-5[1m]`, effort max, sur le gel 1 `0a632e5` (arbre propre au départ), sans commit (R-20),
  sans `GIT_DIR` pour aucun test ; ceinture de la mission sur chaque contrôle ; serveurs et Chrome sur 127.0.0.1 seulement.
- **Entrées** : rapport `F:\tmp\site-docs-1\g2\G2-SITE-DOCS-1.md` (ACCEPTE-AVEC-CORRECTIONS) ; correctifs
  `C-G2-01-09.patch` (sha256 `64ed687189ea65deba88284e46be57d766e2045072b9be491f3f18dcd87ca5cb`) et `C-G2-10-vwap.patch`
  (`2190c4462bbbb3cf180db02165d0c3f97c7a736f67ab2dc08be890a61d08d9f9`), égaux au rapport, appliqués tels quels par `git apply`
  (18:00:18Z) ; décisions 1 à 6 de l'orchestrateur ; remarques de l'investisseur V-1, V-3, schéma fluide, V-4 ; whitepaper
  Chainlink `F:\tmp\cl-wp.pdf` (sha256 `73300eda96e39870895468cf7a7b90616b37d5d7673671c89db1776c192ed2be`, 38 pages), texte
  extrait par `pdftotext -layout` (`F:\tmp\site-docs-1\pli\chainlink\cl-wp.txt`, sha256
  `e7f221b52d54c9b9b5a576b08e490c11ed774de0635d108b503229e4e254c8c9`), §4.1 (page 11) et §5.3 (page 19) relus par ce worker.

### 13.1 Appliqué

Tailles `git diff --numstat 0a632e5` (plus deux fichiers nouveaux) :

| Fichier | +/- | Objet |
|---|---|---|
| `apps/site/app/docs/{bell,gate,glossary,verify}/page.tsx`, `docs.css`, `test/site-build-fleet.test.ts` (opérateurs), `test/site-docs.test.ts` (5 tests) | 5/3, 6/4, 2/2, 8/6, 3/0, 25/0, 75/0 | correctifs C-G2-1 à 10, tels quels |
| `apps/site/lib/shogen-copy.ts` (nouveau) | 10/0 | V-1 : la phrase de l'investisseur, une constante |
| `apps/site/app/roadmap/page.tsx` | 9/4 | V-1 (note de la couche des pièces, après la liste des pièces bâties) ; V-3 (« The smart pieces », « An engine that improves itself ») ; section du schéma sans défilement horizontal ; clé React `company` renommée `engine` |
| `apps/site/components/docs/piece-doc-page.tsx` | 55/4 | V-1 en tête de « What is served today » (Shōgen) ; V-4 : section « The gap it fills » |
| `apps/site/components/docs/schemas/shogen.tsx` (nouveau) | 72/0 | V-4 : un schéma « source A copies source B, same upstream » |
| `apps/site/components/shogen-panel.tsx` | 2/0 | V-1 : deuxième paragraphe de « Honest limits » |
| `apps/site/app/fleet/page.tsx` | 2/1 | V-3 : « Eleven smart pieces. Four built, seven on the roadmap. », comptes dérivés du registre |
| `apps/site/components/docs/schemas/building.tsx`, `svg-kit.tsx` | 3/2, 3/2 | schéma de trajectoire fluide (`min={0}`, `maxWidth: 100%`) |
| `apps/site/data/docs-references.json`, `manifest.sha256.json` | 21/2, 1/1 | œuvre `chainlink-2017`, tableau `quotes` (schéma v2), `$comment` ; empreinte repinée |
| `apps/site/lib/docs-references-load.ts` | 41/10 | citations verbatim (au plus 25 mots, fail-closed), identifiant https, ids à chiffres |
| `apps/site/lib/docs-pieces.ts` | 1/1 | Shōgen cite `chainlink-2017` |
| `apps/site/lib/docs-vocab.ts`, `apps/site/app/docs/research/page.tsx` | 10/3, 5/1 | dérogation étiquetée du filtre de /docs/research (décision 3) |
| `vocab-banned.json` | 3/1 | MakerDAO, Compound (portée `site`, F-2c C-4) et phrase du `$comment_platforms` |
| `test/site-docs.test.ts` (pli), `test/site-build-fleet.test.ts` (pli) | 139/5, 1/1 | 6 tests nouveaux, collecte des ids à chiffres et des citations ; `smart pieces` ajouté à `TYPED_COUNT` |
| `docs/adr/ADR-M013-vitrine-regimes.md`, `docs/adr/ADR-M004-infrastructure-plateforme.md` | 9/0, 15/0 | exception R-25 datée ; amendement D14 daté (MakerDAO, Compound) |

### 13.2 Adaptations du texte dicté, déclarées

- V-4, « faults are correlated across data sources » devient « faults may be correlated across data sources » : la source dit
  « faults may be correlated across data sources » (§4.1, page 11 du PDF, ligne 28 du texte extrait de cette page).
- **Périmé au gel 3 (décision investisseur 204, « on laisse proves », 19:09 UTC ; annoté 2026-09-24 20:59 UTC, C-G2B-8)** : le point suivant est défait, la phrase sert « proves », forme épinglée dans `D8_ALLOWED`. Texte d'origine conservé pour l'historique : V-4, « An attestation proves what a source said » devenait « An attestation shows what a source said » : forme interdite D8
  d'`ADR-BELL-OTS-ANCHOR-1` (« proves » à propos d'un fait), la même lecture qui a fondé C-G2-4 ; la garde D8 ajoutée
  (`docs_carry_no_ots_d8_forbidden_form`) rougirait « proves ». Revenir au mot de l'investisseur demande de restreindre D8 aux
  textes d'ancrage, et la garde avec.
- V-4, la parenthèse « (Ellis, Juels, Nazarov, section 4.1, page 11) » est rendue au format de citation du site : « (Steve Ellis,
  Ari Juels and Sergey Nazarov (2017), Section 4.1, page 11) », lien vers la bibliographie ; année, lieu et auteurs lus de la
  bibliographie commitée (aucun chiffre tapé). « the first Chainlink whitepaper » : ordinal de version (v1.0), pas une primauté
  de MONARK, même lecture que la G2 pour les autres « first ».
- V-4, « Nine years later » : dérivé, `countWord` de l'année de l'énoncé (`GAP_STATED_ON = "2026-09-24"`) moins l'année de
  l'œuvre. L'absence affirmée (« no such map is published ») est l'énoncé daté de l'investisseur, non vérifié ici (aucun réseau).
- V-4, la citation : 13 mots, verbatim, §4.1, page 11 (lignes 31 à 33 du texte extrait de la page 11), entre guillemets, lue du
  nouveau tableau `quotes` de la bibliographie. Niveau « read in part » = [lu] par sections, comme au §2.2.
- V-4, id `chainlink-2017` : la regex d'id du chargeur et celles de la collecte du test acceptent désormais les chiffres ;
  l'identifiant https est accepté (https seulement).
- V-1, panneau Shōgen : la phrase est insérée en deuxième paragraphe de « Honest limits » ; les trois autres restent.
- Décision 3 (C-G2-11) : le relecteur proposait deux règles et le retrait des figures par le filtre ; la décision garde les deux
  figures sur /docs/research. Mécanisme de ce pli : une étiquette de dérogation que seules les deux règles portent, passée par la
  seule page /docs/research ; une étiquette qu'aucune règle ne porte fait échouer le build.

### 13.3 Tests ajoutés par le pli (en plus des 6 du correctif)

`shogen_served_scope_is_said_on_three_surfaces`, `shogen_gap_quotes_and_cites_the_chainlink_whitepaper`,
`docs_carry_no_ots_d8_forbidden_form` (garde D8 proposée par la G2, portée /docs et MONARK Building ; tue MX-09),
`docs_research_alone_waives_the_cited_platform_names`, `fleet_and_building_say_smart_pieces_not_company`,
`building_trajectory_is_fluid` ; `TYPED_COUNT` couvre `smart pieces` ; la collecte des citations du test de bibliographie couvre
les ids à chiffres et `quoteById`.

### 13.4 Mutants

- Les 11 mutants de la G2 (ancres et remplacements repris de `g2\tools\mutants.mjs`), sur le worktree : 11 tués. Les 9 survivants
  de la G2 meurent : MX-01, 02, 03, 06, 07, 09 par `test/site-docs.test.ts` ; MX-10 par `site_names_no_rpc_operator` ; **MX-04
  et MX-05 seulement par les outils de la G2 exécutés dans cet oracle** (`svg-overflow.mjs` : texte sorti de sa boîte de 415 px ;
  `links.mjs` : `/docs/pieces/ukemi -> /ukemi/courses`), aucune porte du dépôt ne les voit encore (items SVG-OVERFLOW-GATE-1,
  DOCS-LINKS-GATE-1). MX-08 et MX-11 restent tués.
- Les 11 mutants du pli (P-01 à P-11 : phrase V-1 retirée de Building, de la page Shōgen, reformulée ; citation détachée de son
  œuvre, tapée à la main ; « proves » dans la section ; étiquette de dérogation dérivée ; MakerDAO tapé dans une source ;
  « company » rétabli ; largeur minimale du schéma rétablie ; citation de plus de 25 mots) : 11 tués.
- Les 21 mutants du gel 1, rejoués sur l'arbre final : 21 tués.
- Restauration prouvée pour chacun (sha256 avant égal après) ; empreinte de l'arbre (22 fichiers, `git status`) identique avant
  et après chaque campagne. Journaux : `F:\tmp\site-docs-1\pli\mutants-pli.json`, `mutants-gel1-replay.json`.

### 13.5 Oracle

Environnement : ceinture de la mission sur chaque contrôle (`F:\tmp\site-docs-1\controls.sh`, journaux par contrôle).

| Passage | Arbre | typecheck | lint | lint:ratchet | gate:vocab | lang:gate | export:check | npm test | next build | assert-fleet-html |
|---|---|---|---|---|---|---|---|---|---|---|
| `pli-final/` (18:41Z à 18:48Z) | code du pli et ADR datés (ce §13 ajouté ensuite, hors de tout contrôle) | 0 | 0 | 0 (69/69) | 0 | 0 | 0 | 0 | 0 (42 routes) | 0 |

- `npm test` : 1 285 tests, 1 283 verts, 0 rouge, 2 ignorés (les deux de la référence) ; test 42 vert en 349 s ; les 12 tests nouveaux
  (6 du correctif, 6 du pli) verts.
- Export réel (`scripts/export-public.mjs --out F:\tmp\site-docs-1\pli\export`) : exit 0, 483 fichiers (**annoté 2026-09-24 20:59 UTC, C-G2B-8 / EXPORT-GITIGNORED-FILES-1** : ce compte incluait `apps/site/AGENTS.md` et `CLAUDE.md`, ignorés par git et présents dans l'arbre de travail ; l'export depuis l'arbre commité en compte 481), 40 fichiers de la route
  (`apps/site/app/docs`, `apps/site/components/docs`), aucun dossier `docs/` hors la route, 0 `.npmrc`/`.env*`, 0 chemin local ;
  motifs de jetons : 0 hors la liste de détection de `apps/bell/scripts/bell-publish.mjs:90` (préexistante) ;
  `EXPORT-MANIFEST.json` sha256 `44e8ff1245489eb608e4c34b22a873b059ae8ac5c4e0e82417f76c42a830b212`.
- 375 px (outil `mobile375.mjs` de la G2, émulation CDP 375 × 812, sur le build de `pli-final/`) : **23/23 pages sans débordement**
  (22 /docs et /roadmap) ; /fleet, /, /how conformes ; /bell 496 (préexistant, BELL-MOBILE-375-1).
- SVG (`svg-overflow.mjs`, 1 280 px) : 23 pages, 39 SVG (38 et le nouveau), 642 textes, 0 hors de sa boîte, 0 coupé.
- Liens (`links.mjs`) : **0 cassé** sur 1 784 liens internes (/docs et /roadmap) ; 0 sur 2 366 (42 pages du site).
- Panneau Shōgen de /fleet ouvert par CDP (`F:\tmp\site-docs-1\pli\panel-check.mjs`) : la phrase V-1 est le deuxième paragraphe de
  « Honest limits » (le panneau est rendu côté client : absent du HTML statique, présent dans le code client).
- `/building` : 307 vers `/roadmap` sous `next start -H 127.0.0.1`.
- Texte rendu (`F:\tmp\site-docs-1\pli\text-diff-pli.mjs`, base = HTML de `3436304`) : pages préexistantes identiques hors en-tête
  et pied, sauf /fleet (le titre, V-3) et /roadmap (MONARK Building), changements voulus ; 22 pages nouvelles, 3 353 lignes.
  Balayage des lignes ajoutées : 0 motif interne, 0 nom de source de données ou d'opérateur, 0 règle du vocabulaire hors les deux
  noms dérogés (MakerDAO 2, Compound 2, dans les figures verbatim de /docs/research, seule page où ils paraissent) ; « Chainlink »
  3 (l'auteur cité, autorisé par V-4 ; relevé par la liste de mon balayage, qui n'est pas une porte) ; 7 tirets longs (les textes
  servis du harnais, HARNESS-TEXT-DASH-1) ; « probability of being right » toujours niée.
- Après `pli-final/`, une ligne de test (`DOCS_LIBS` couvre aussi `apps/site/lib/shogen-copy.ts`, avis de la deuxième
  consultation) : rejouée, `test/site-docs.test.ts` 21/21, typecheck 0, eslint du fichier 0, lint:ratchet 69/69.
- R-25 (pathspec de `.github/workflows/ci.yml:65`, 18:59:02Z) : gel 1 6 490 ; pli 555 (suivis 420+/53-, nouveaux 82) ; lot
  entier depuis `3436304` : 6 949 ; borne 1 205 ; exception datée d'ADR-M013.
- Captures : `F:\tmp\site-docs-1\pli\svg\` (nouveau schéma en clair et en sombre, trajectoire et section « The gap it fills » à
  375 px).

### 13.6 Errata des §1 et §8 (G2, Needs 7)

`test/export-public.test.ts` : 28/2 au commit (§1 : 26/1) ; fichiers suivis : 192/52 (§8 : 190/51) ; R-25 du gel 1 : 6 490
(§8 : 6 471). Cause : la mesure du §8 précédait les dernières retouches du gel (commentaire du miroir d'export, +2/-1 ; ajouts de
tests). Compte périmé, pas un écart de contenu : les blobs de `0a632e5` sont égaux au bloc 1 de `DELIVERED.sha256` (vérifié par la
G2). Les numéros du §1 et du §8 restent tels quels, cet erratum les corrige.

### 13.7 Items

Soldés par ce pli : R25-SITE-DOCS-1 (exception datée d'ADR-M013, décision 2) ; DOCS-RESEARCH-PLATFORM-NAMES-1 (amendement daté
d'ADR-M004 D14, décision 3) ; LANG-GATE-DOCS-ROUTE-1 et EXPORT-TEST-DOCS-ROUTE-1 (relus par la G2, C-G2-8 appliqué).

| Item | Objet | Propriétaire | Déclencheur |
|---|---|---|---|
| SVG-OVERFLOW-GATE-1 (nouveau, décision 4) | l'outil `svg-overflow.mjs` de la G2 comme porte (MX-04 ne meurt que par lui) | orchestrateur | prochain lot site |
| DOCS-LINKS-GATE-1 (nouveau, décision 4) | l'outil `links.mjs` de la G2 comme porte (MX-05 ne meurt que par lui) | orchestrateur | prochain lot site |
| BELL-MOBILE-375-1 (nouveau, décision 4) | /bell déborde à 375 px (`scrollWidth` 496, 88 éléments, liste d'hôte `dt`/`dd`), hors lot | lot vitrine | prochaine édition de /bell |
| SHOGEN-SCOPE-SENTENCE-1 (nouveau ; **clos** au gel 4 par le couplage au registre, C-2 du cp-2, annoté 2026-09-24 20:59 UTC) | la phrase V-1 porte des mots d'état (« built and served », « not served yet ») écrits par l'investisseur, épinglés octet pour octet, non dérivés du registre : si le statut ou le câblage de Shōgen change dans `lib/fleet.ts`, la phrase est à revoir | lot vitrine | toute édition de l'entrée Shōgen du registre |
| RENDERED-VOCAB-GATE-1 (nouveau) | les règles de vocabulaire couvrent les sources (`gate:vocab`) et les données filtrées par `siteVocabulary` ; une page future qui imprimerait des données commitées sans ce filtre leur échapperait (classe préexistante) ; un balayage du HTML construit, avec la dérogation documentée de /docs/research, la fermerait | orchestrateur | prochain lot site, avec les deux portes ci-dessus |
| FLEET-PANEL-D8-1 (observation, rattachée à I-G2-3 ; **clos** par le ruling D8 du gel 3, décision 204, annoté 2026-09-24 20:59 UTC) | le premier paragraphe de « Honest limits » du panneau Shōgen (préexistant, base `3436304`) dit « An attested testimony proves what was said » : forme D8 selon la lecture large appliquée par C-G2-4 ; hors de la portée de la garde D8 (composants hors /docs) | lot OTS (portée de D8) | arbitrage de la portée de D8 ou prochaine édition du panneau |
| R25-CI-GATE-1 (nouveau ; **déplacé** au gel 6, lot R25-CONTENT-1, décision 207 : vert contre `lot/etude-suite`, rouge contre `main` par construction, annoté 2026-09-24 20:59 UTC) | l'exception d'ADR-M013 ne change pas le job CI `r25-taille-de-lot` (fail-closed à 1 205) : une PR portant le lot sera rouge sur ce job | orchestrateur | avant l'ouverture de la PR |
| V4-ABSENCE-CLAIM-1 (nouveau ; **partiellement clos** au gel 5 par la décision 208 « we know of no such map being published » ; la seconde moitié « the overlap is not reported » reste ouverte, C-G2B-2, choix investisseur A/B, annoté 2026-09-24 20:59 UTC) | « no such map is published » : énoncé daté de l'investisseur, non vérifié par une recherche ici (aucun réseau) | investisseur, orchestrateur | avant l'upload |

Items de la G2 laissés à leurs propriétaires : I-G2-3 (sa part /docs est désormais un test ; la part /bell/anchors reste au lot
OTS), I-G2-5 UNIT-SERVICE-STRAY-1, I-G2-6 DOCS-NAV-COMBINING-1, I-G2-7 DOCS-RESEARCH-UNIT-1, I-G2-8 DOCS-PITCH-DECK-1,
I-G2-9 FIGURES-UNDERWATER-1.

### 13.8 Réseau, processus, consultations

- Réseau : aucun appel sortant de ce worker ; exceptions déclarées : le test 42 du `npm test` complet lance `npm ci` et
  `npm run ci` dans l'export (TEST42-NETWORK-1). Chrome sans tête lancé avec `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE
  127.0.0.1`, `--disable-background-networking`, `--disable-component-update`, profil temporaire sous `F:\tmp`.
- Processus : `next start -H 127.0.0.1 -p 3107` (PID 10448) et Chrome CDP `127.0.0.1:9333` (PID 40964) pour les mesures ; `next
  start -H 127.0.0.1 -p 3108` lancé et tué par le rejoueur de mutants pour MX-04 ; pour les mesures finales, `next start -H 127.0.0.1 -p 3107` (PID 37580) et Chrome CDP `127.0.0.1:9333` (PID 37676), arrêtés à 18:51:09Z ; aucun écouteur restant (relevé
  `netstat`, `F:\tmp\site-docs-1\pli\listen.txt`).
- R-26 : canal intégré (outil advisor du harnais), deux consultations. Avant l'oracle final : ordre de fin (contrôles complets,
  export réel, remesure R-25, journal, rendu, empreintes) et déclarations à faire (outils contre portes pour MX-04 et MX-05,
  mots changés du texte dicté, phrase V-1 non dérivée, forme D8 préexistante du panneau). Avant de déclarer la fin : consigner
  cette deuxième consultation, balayer le rendu pour les tirets longs, relire au code l'ordre intervalle de C-G2-1 (fait :
  `packages/hikae/src/l3-gate.ts:119-138`, largeur nulle ou négative puis budget puis largeur puis intention, conforme à la page),
  mettre `shogen-copy.ts` dans `DOCS_LIBS` (fait). Avis, jamais verdict.

### 13.3 Gels 6 et 7, ligne datée 2026-09-24 21:35 UTC (C-V-3 du checkpoint-2 rejoué)

- Gel 6 `711b7f1` (R25-CONTENT-1, décision 207) : générateur worker `claude-opus-5-5`, relu par la lentille D de la G2 fraîche
  `0a632e5..711b7f1` (ACCEPTE, 12/12 mutants tués).
- Gel 7 `f703e59` : pli des corrections de cette G2 fraîche par l'orchestrateur (`C-G2B-main.patch` et `C-G2B-2-overlapA.patch`
  appliqués à l'octet ; décision 211, option A, avec deux assertions écrites par l'orchestrateur, tuées par le mutant M21b du
  checkpoint-2 rejoué) ; lignes datées ADR-M013, ADR-BELL-OTS-ANCHOR-1, ce journal §13.2. Oracle sur l'arbre final : 8 portes à 0,
  1 285 / 1 283 / 0 / 2.
- Gel 8 : erratum ADR-M004 (C-V-1, patch du validateur appliqué à l'octet) et cette section.
- `error_origin` des gels 3, 4, 5, 7 et 8 (écrits par l'orchestrateur, déviation de la règle « pliage par un worker ») :
  orchestrateur ; mitigation : G2 fraîche `0a632e5..711b7f1` puis checkpoint-2 rejoué `0a632e5..f703e59`.
