claude-opus-5-5

# G1 : lot SITE-PREP (partie 3 de la page snapshot du Dōjō : préparation de l'envoi du site), 2026-10-01

## 0. Identité, mission, conduite

- Modèle résolu (R-1) : `claude-opus-5-5`, effort max, rôle G1 (implémenteur), instance fraîche. Heures par `date -u`.
- Mission `F:/tmp/dojo/mission-site-prep.md`, sha256 recalculé AVANT lecture (17:05:14Z) :
  `807748c932d45cf9b4b04806eb24f3cf0692e9de395da2658f81aca2f495207d`, égal au sceau donné par l'orchestrateur. Item ajouté en cours de
  mission par l'orchestrateur (message, vers 17:31Z) : DOJO-TABLE-DUST-HIDE-1 (§2, item 12).
- Worktree `F:/Monark-wt-site`, branche `lot/site-prep`, HEAD `c0c60617f713c81c4b6a6a64b6ab0f8b9873428b`, arbre propre à 17:29:26Z.
- Git : lectures seules sur le worktree et sur `F:/Monark` (`rev-parse`, `status`, `diff`, `ls-files`, `worktree list`, avec
  `GIT_OPTIONAL_LOCKS=0`) ; git écrivant seulement dans mon clone `F:/tmp/dojo/siteprep/c1` (`clone --no-local`, `checkout --detach`) et
  dans les clones jetables des outils du tronc. **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun commit, aucun
  workflow (R-20). TEMP, TMP, TMPDIR = `F:/tmp/dojo/siteprep/tmp`. Aucun réseau (sondes et tests en boucle locale) ; rien sur C: de ma main.
- Verrou d'hôte relevé avant chaque course : tenu par d'autres oracles à 17:05Z (G7, pid 285468), 17:33Z (G7, pid 371408) et 17:51Z (G1
  d'un autre lot, pid 94008, `history-read.ts`) : aucune course pendant ces fenêtres ; C-V-4 par `Get-CimInstance Win32_OperatingSystem`
  avant chaque course (15 à 17 Go physiques, 32 à 34 Go virtuels libres, 4 à 18 `node.exe`).

## 1. Entrées lues (en entier, dans l'ordre de la mission)

| Entrée | sha256 |
|---|---|
| `F:/Monark/docs/ETAT.md` (tronc, 220 l.) | `0d10a77ce0d6b9456cbb80f4de682ea71d5af8ca2b1ffe465b731e2a08217286` |
| `F:/PRODUITS/inspections/page-partie1-2026-10-01/RAPPORT-g2-site.md` (403 l.) | `95873fbc8ca1a971cfd39492359f8b9b29be322bb7dd4345e2c2853ba85ea89f` |
| `F:/PRODUITS/inspections/page-partie1-2026-10-01/RAPPORT-g2-publish.md` (445 l.) | `8cbc8922c5e59d2efc45d8e83ce408dce1e2a0c505164031dcb1a2c3b60c19a8` |
| `F:/PRODUITS/inspections/page-partie1-2026-10-01/CP2-RAPPORT.md` (349 l.) | `3bc97433310f8b91ac18753672e81e26b3cf6405d536596402b5f1d347d8c245` |
| `F:/PRODUITS/inspections/page-partie1-2026-10-01/RAPPORT-g2-depth.md` (317 l.) | `221701fa38eceb393dcd3fa1cfe8951271e33da0b14064b54fea011ee868f658` |

Puis, à `c0c60617` : `apps/site/lib/dojo-copy.ts`, `dojo-served.ts`, `dojo-served-load.ts`, `dojo-live.ts`, `dojo-lookup.ts`,
`apps/site/components/dojo/` (trois fichiers), `apps/site/app/dojo/page.tsx`, `scripts/sync-dojo-served.mjs`,
`apps/dojo/scripts/dojo-verify-cli.mjs`, les tests qui les couvrent, `F:/Monark/scripts/red-proof.mjs` (`parseKiller`, `killerProblem`).
Lus pour juger : `scripts/assert-fleet-html.mjs` l.575-684, `docs/adr/ADR-DOJO-PR-4.md` PK-5 et PK-6 (sha256 `cac88bc8…2376`),
`docs/G1-lot-dojo-pr4c1b.md` l.255-277 (définition de DOJO-LIVE-RENDER-ORACLE-1, `d1c3b92d…9077`), `docs/G1-lot-dojo-pr3b2a.md` l.138-143,
l.276-284, l.338-343 (É-G1-6, mesure d'origine de DOJO-VERIFY-URL-IDLE-1), `apps/site/test/honesty-lint.ts` (`renderedTexts`),
`apps/dojo/scripts/dojo-core.mjs` l.186-200 (`holderCounted`), `apps/dojo/scripts/dojo-publish.mjs` l.210-240,
`apps/dojo/test/dojo-verify.test.ts` l.110-133 (épingle T-10), `F:/Monark/scripts/oracle/run.mjs`, `r25.mjs`, `mutants/run.mjs` (en-têtes),
react-dom 19.2.8 `react-dom-client.development.js` (sha256 `261c3275…`) l.6410-6440 et l.8264-8268.

## 2. Items, constat d'origine, traitement (décidé AVANT le code)

1. **DOJO-COPY-VALIDATION-30-1** (ETAT l.169-172 ; `dojo-copy.ts:46` « sixty days »). Le code permet la dérivation : l'enregistrement
   committé porte l'ancre entière (`dojo-served-load.ts:35-38`, « the one committed source of k_reads, validation_days, tier_units and
   tier_windows », entier >= 1 contrôlé par `anchorOf` l.92). TXT-5 dit `{validation_days}` ; la figure `validation_days` est portée par
   tout état montré (EA, E1, E2), lue de l'ancre par `dojoPageFiguresOf` (`windowOf`, refus nommé si absente) ; la page la rend par
   `DojoSentence` ; `dojoExpected` la compose à part depuis l'ancre (source « timeline.anchor ») ; « thirty » reste interdit (M-P19).
2. **SYNC-SERVED-DEPTH-SCAN-1** (G2 DEPTH-BOUND N-1). `immutablesOf` mesure chaque ligne par `jsonDepth` du chargeur avant `JSON.parse` ;
   au-delà de `DOJO_SERVED_MAX_DEPTH`, la ligne ne nomme aucun fichier et n'est jamais analysée ; la construction la refuse par son nom
   (`timeline_malformed` à sa seq). Commentaire devenu faux de `dojo-chain.mjs:171-172` corrigé en place.
3. **DOJO-VERIFY-URL-IDLE-1** (ETAT l.59 ; G2 éditeur, avis sur É-G1-6). Dans `urlSource` : la même GET envoyée une seconde fois, une
   seule, quand son premier essai a échoué avant toute réponse sur une connexion fermée ou réinitialisée (codes mesurés, §5) ; jamais sur
   le minuteur de la GET, jamais après une réponse (statut, refus, corps coupé), jamais pour une autre erreur. L'unique `fetch(` reste
   dans le corps d'`urlSource` (épingle T-10 de `dojo-verify.test.ts:122-125`) : boucle bornée à deux essais, règle dans `replayOf`.
4. **Page N-1** : TXT-17c dit aussi le cas d'une ligne hors forme (texte proposé P-10, à la lettre).
5. **Page N-2** : garde de non-vacuité dans l'aide `rowsOf` de `test/dojo-table.test.ts` (Q-3).
6. **Page N-3** : la table est clé par la tête montrée (`dojoTableKeyOf`, `dojo-live.tsx:50`) : une autre tête remonte une table neuve,
   qui repart de `dojoTableFirstOf` de sa vue (Q-4).
7. **Page N-4** : fichier de lignes vide : TXT-17a seule (ni phrase d'ordre, ni champ, ni tableau).
8. **Page N-8** : `role="status"` sur TXT-15a, TXT-15b-r et la phrase neuve d'une ligne masquée trouvée.
9. **DOJO-LIVE-RENDER-ORACLE-1**, construction (b) : `test/dojo-render.test.ts` transpile les composants (`typescript`, `jsx: react-jsx`),
   résout l'alias `@/` vers les fichiers du site, rend par `react-dom/server` (aucune dépendance neuve) ; la table est scindée en coque à
   état (`DojoTable`) et corps sans crochet (`DojoTableBody`) ; la page entière, rendue sur trois enregistrements de la fixture, passe
   `assertDojoBody`. Volet « au navigateur » de PK-6 : avec la jambe 2 (item 10, Q-5).
10. **DOJO-LOOKUP-PAYLOAD-1 jambe 2** : refus nommé, sans code (Q-8) : ADR-DOJO-PR-4 PK-5 et Q-K3 = (a) en font un acte de l'orchestrateur
    (Chrome piloté par CDP, 375 x 812, bridage), dont FAITS-CDP-MOBILE-1 et FAITS-WEB-PERF-BUDGET-1 n'existent pas sur disque (relevé 17:16Z).
11. **Aucun texte servi ne revendique un horodatage Bitcoin ni une vérification BLS** : audit (Q-6) ; garde ajoutée à `DOJO_FORBIDDEN`
    (`/bitcoin/i`, `/time[- ]?stamp/i`, BLS en mot entier), épinglée par le test du lexique.
12. **DOJO-TABLE-DUST-HIDE-1** (orchestrateur, vers 17:31Z ; investisseur, mot pour mot « il faut exclure les comptes de moins de 1$ »,
    option « Masquer dès le 1er prix »). Règle lue sur pièce : `holder_counted` vaut `null` sur toute ligne sans version de prix ; sous une
    version, `false` pour toute ligne `program` et pour un détenteur dont la valeur du jour est sous le seuil de poussière ou absente
    (`dojo-core.mjs:190-200`, `dojo-publish.mjs:227-230`). Traitement : une ligne est listée sauf `holder` avec `holder_counted === false`
    (les `program` gardent leur règle) ; toute ligne reste liée et cherchée ; forme de `holder_counted` contrôlée (booléen sous une
    version, jamais vrai pour un `program`, `null` sans version), sinon aucune ligne ; la table dit la règle de son état ; la recherche
    trouve une ligne masquée et le dit en région de statut. Textes rendus vrais dans chaque état : TXT-17 et TXT-17a ne disent plus
    « every line », TXT-15r et TXT-15b-r ne bornent plus la recherche aux lignes listées ; trois phrases neuves (`tableDust`,
    `tableNoVersion`, `lookupDust`) ; aucun « dollar » ni « $ » (déjà interdits par `DOJO_FORBIDDEN`, épinglés par le test du lexique).

## 3. Coupe et compte ascendant

Pas de coupe. Estimé avant le code : 480 (sans l'item 12, arrivé ensuite). Mesuré au gel (numstat contre `c0c60617`, fichier neuf entier) :
329 insertions et 98 suppressions suivies, plus 234 lignes de `test/dojo-render.test.ts` : **661** au périmètre CI (le journal est exclu par
`:(exclude,glob)docs/**/*.md`, `.github/workflows/ci.yml` l.82). La porte `r25` de l'oracle est citée au §7.

| Fichier | + | - |
|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` (commentaire) | 1 | 1 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` | 12 | 2 |
| `apps/site/COMPONENTS-PROVENANCE.md` | 3 | 1 |
| `apps/site/app/dojo/page.tsx` | 7 | 2 |
| `apps/site/components/dojo/dojo-live.tsx` | 3 | 3 |
| `apps/site/components/dojo/dojo-table.tsx` | 39 | 16 |
| `apps/site/lib/dojo-copy.ts` | 17 | 10 |
| `apps/site/lib/dojo-served.ts` | 39 | 17 |
| `scripts/assert-fleet-html.mjs` | 10 | 4 |
| `scripts/sync-dojo-served.mjs` | 5 | 5 |
| `test/dojo-live-surface.test.ts` | 16 | 8 |
| `test/dojo-live.test.ts` | 3 | 2 |
| `test/dojo-page.test.ts` | 24 | 11 |
| `test/dojo-served.test.ts` | 30 | 1 |
| `test/dojo-table.test.ts` | 58 | 13 |
| `test/dojo-verify-url.test.ts` | 62 | 2 |
| `test/dojo-render.test.ts` (neuf) | 234 | 0 |

## 4. Tueurs à ligne fixe

- Éditions en place, ou ajouts en fin de fichier (`windowOf`, `unitOf`, `dojoTableKeyOf` ; `replayOf`, fonction hissée), pour ne déplacer
  aucune ligne visée de `dojo-served.ts` (:68 à :143), `dojo-live.tsx` (:30, :38, :44), `dojo-verify-cli.mjs` (:32, :33, :37, :80, :89,
  :94), `sync-dojo-served.mjs` (:74, :145, :162), `dojo-copy.ts:75`.
- Réancrés (même mutation, ligne déplacée ; une ligne réancrée ne rend pas son test jugé) : `assert-fleet-html.mjs:675` vers `:679` ;
  `dojo-served.ts:193` vers `:198` (deux), `:183` vers `:187`, `:195` vers `:200`, `:196` vers `:201` ; `dojo-table.tsx:58` vers `:80`.
  Tous mesurés tués (§6).

## 5. Sondes (hors dépôt, `F:/tmp/dojo/siteprep/`, rejouables par `node <sonde>` ; aucune adresse littérale : nom de boucle locale)

- `tools/probe-idle.mjs` (`855e5a51…e43f`), sortie `logs/probe-idle.txt` (`7231ee24…ebd4`), 17:38:56Z : serveur et client dans un même
  processus ; seul un socket détruit sous sa première requête fait échouer `fetch` : `TypeError`, cause `UND_ERR_SOCKET` (« other side closed »).
- `tools/probe-idle2.mjs` (`538bb3f5…1886`), sortie `logs/probe-idle2.txt` (`c1c9a033…98b9`), 17:39:59Z : client dans un processus enfant,
  comme la CLI ; la seconde GET part sur une connexion neuve ; la course de boucle bloquée (1 500 ms, inactivité du serveur 300 ms) n'est
  pas reproduite.
- `tools/probe-idle3.mjs` (`6e099c35…c672`), sortie `logs/probe-idle3.txt` (`49017f15…3491`), 17:40:37Z : même course après 50 ms de repos
  du client : non reproduite (connexion neuve).
- `tools/probe-idle4.mjs` (`15faf562…3f93`), sortie `logs/probe-idle4.txt` (`c3557132…fe97`), 17:41:11Z, client enfant : FIN sous la
  requête, `UND_ERR_SOCKET` ; RST (`resetAndDestroy`), `ECONNRESET` ; corps coupé après l'en-tête : l'erreur vient de la lecture du corps,
  jamais du `fetch`, donc jamais rejouée.
- `tools/texts-sha.mjs` (`b4385c05…b499`), 17:4xZ : liste fermée de 32 textes et 13 mots, sha256 `5c11eb6a…63f5` (épinglé par le test).

Liste fermée des codes rejoués : `UND_ERR_SOCKET`, `ECONNRESET` (mesurés) ; `EPIPE` non mesuré, donc non inclus (Q-2).

## 6. Tests, tueurs, preuve F2P

- Typecheck du site (`tsc --noEmit -p apps/site/tsconfig.json`, quatre fichiers Dōjō inclus) : 0 erreur (`logs/tsc-site.txt` vide) ;
  typecheck racine : 0 (après correction de mon test, `noUncheckedIndexedAccess`) ; `eslint` des fichiers `.ts`/`.tsx` du lot : 0 (les
  `.mjs` sont hors périmètre d'`eslint` par configuration) ; garde d'octets et de longueur (`tools/guard.mjs`, `0a2e66a5…6096`) : 0.
- Courses ciblées sur le clone `c1` (copie du worktree, jonctions de `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec) :
  `logs/run2.tap` (`7d558581…f10c`), 18:00:26Z-18:00:45Z : **283 tests, 283 verts, 0 rouge, 0 ignoré** sur 17 fichiers (les neuf du lot,
  `ci-gates`, `site-build-fleet`, `site-docs`, `site-ukemi`, `site-honesty`, `bell-publication-state`, `dojo-publish-deploy`,
  `apps/dojo/test/dojo-publish`). Première course (`run1.tap`) : un rouge, l'épingle des clés EA de `dojo-live.test.ts:268-270`, mise à jour.
- **`red-proof`** du tronc (`6579b550…ab36`), `--base c0c60617 --gel F:/Monark-wt-site --repo F:/Monark --draw 17 --seed 2155301065`
  (graine : 32 premiers bits du sha256 de la mission), 18:02:01Z-18:03:08Z, sortie 0 : `F:/tmp/dojo/siteprep/rp1/RED-PROOF.json`, sha256
  `7165d3841150f159cd5eb5f5df5fbef5928af2eb1e641e52e16bc571d10ba8dd` : `ok: true`, 17 jugés, **17 F2P**, 43 inchangés, **17 tueurs tirés, 17 tués**,
  digest du gel `c47a1219…812e`.
- **Tueurs non tirés** (empilés ou réancrés), outil de mutants du tronc (`41cdf83f…1ac8`), `--killers --only K6,K49,K51,K52,K54,K56`,
  18:03:57Z-18:04:25Z, sortie 0 : `F:/tmp/dojo/siteprep/mut1/RESULTS.json`, sha256
  `9e00ea04a9dc70fdd88f7795bd83c6b2c8a436e2a87427633810252662407178` : ligne de base verte (58), **6 tués sur 6**.

Item, fichiers, tests (tueur tiré) :

- COPY-VALIDATION-30-1 : `dojo-copy.ts`, `dojo-served.ts`, `page.tsx`, `assert-fleet-html.mjs` ; `dojo_render_page_passes_the_build_check`
  (`page.tsx:39`), `dojo_page_renders_served_figures_only` (`assert-fleet-html.mjs:679`), `dojo_live_renders_through_the_same_figures`,
  `dojo_sentence_refuses_a_figure_the_state_lacks`, `dojo_live_calls_the_reread_without_bounds`, `dojo_served_accepts_an_abstained_head_with_readings`.
- SYNC-SERVED-DEPTH-SCAN-1 : `sync-dojo-served.mjs`, `dojo-chain.mjs` ; `dojo_sync_measures_a_line_before_parsing_it` (`sync-dojo-served.mjs:125`).
- VERIFY-URL-IDLE-1 : `dojo-verify-cli.mjs` ; `dojo_verify_url_replays_a_get_once_on_a_closed_socket` (`dojo-verify-cli.mjs:103`).
- N-1 : `dojo-copy.ts` ; `dojo_render_table_says_each_state`, `dojo_page_lexicon_is_closed` (empreinte de la liste fermée).
- N-2 : aide `rowsOf` de `test/dojo-table.test.ts` ; garde déclarée (Q-3).
- N-3 : `dojo-live.tsx`, `dojo-served.ts` ; `dojo_render_table_starts_over_for_another_head` (`dojo-served.ts:211`).
- N-4 : `dojo-table.tsx` ; `dojo_render_table_says_each_state` (`dojo-table.tsx:66`).
- N-8 : `dojo-table.tsx` ; `dojo_render_table_says_a_look_up_in_a_status_region` (`dojo-table.tsx:90`).
- RENDER-ORACLE-1 (b) : `dojo-table.tsx` (scission) ; les six tests de `test/dojo-render.test.ts`, dont `dojo_render_table_lists_the_lines`
  (`dojo-table.tsx:67`).
- Bitcoin et BLS : `assert-fleet-html.mjs` ; `dojo_page_lexicon_is_closed` (quatre mots refusés de plus).
- TABLE-DUST-HIDE-1 (la consigne « une fixture avec version, une sans, chacune avec son tueur » est tenue par deux tests qui couvrent chacun
  les deux fixtures, avec version et sans) : `dojo-served.ts`, `dojo-table.tsx`, `dojo-copy.ts` ;
  `dojo_table_hides_dust_lines_under_a_version` (`dojo-served.ts:202`),
  `dojo_render_table_says_the_dust_rule` (`dojo-table.tsx:71`), `dojo_table_refuses_a_file_it_cannot_bind` (`dojo-served.ts:196`),
  `dojo_table_rows_are_the_verifier_lines` (`dojo-served.ts:198`).

## 7. Oracle du tronc (rôle G1)

`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-site --base c0c60617` (outil `f22b9045…`, `r25.mjs` `4d0544df…`),
18:04:35Z-18:13:47Z, sortie **0** : enregistrement
`F:/tmp/oracle-results/c0c60617f713c81c4b6a6a64b6ab0f8b9873428b-8a39a974157105bb-G1-20261001T180435Z-97404.json`, sha256
`3f13cb096abb7f51cc324379693a32f6e9e1311ce8e850b32e1ac46abb5f97e6` ; arbre : tête `c0c60617`, `dirty` `8a39a974…b8a2`, objet `2dfbdeb9…`,
`static_only` false, `served_from` null.

- Portes, toutes à 0 : épinglage des modèles, **`r25`** (563 insertions, 98 suppressions, **661**, borne 1 205 ; contenu 0 sur 8 000 ;
  `02-r25.log` `5005f488…b42f`), `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` (489 s).
- Tests : **1 862, 1 858 verts, 0 rouge, 4 ignorés** (sauts déjà connus, hors lot) ; test 42 (`export_public_no_governance_no_french`) vert en
  458 s, une seule fois, dans la suite ; aucun fichier de test mort (`09-test.log` `56067bf7…7231`).

## 8. Questions et choix (Q-n), chacun avec sa preuve

- **Q-1 (COPY-VALIDATION-30-1, forme)** : dérivée, non tapée. La page dit « held for 30 days in a row », le chiffre étant une figure rendue
  comme toutes les autres (et non le mot « thirty », qui reste interdit, M-P19). Conséquences assumées : EA porte deux figures (jour, fenêtre),
  l'épingle M-L11 dit « exactement une `DojoSentence` dans la page, celle de la méthode », les clés EA épinglées gagnent `validation_days`.
  Forme à confirmer par l'investisseur à la validation visuelle (chiffre plutôt que mot). Même classe de littéral, hors lot :
  « one hundred and eighty » (phrase `tier`, `tier_windows[4]`), que `anchorForm` ne fixe pas (seulement croissant) ; « seven » (phrase
  `noVersion`) est fixé à 7 par le marcheur (`price_window_days === 7`, `dojo-chain.mjs:58`, recodé `dojo-live.ts:162`) : sans dérive possible.
  Item formé : §9 (a).
- **Q-2 (VERIFY-URL-IDLE-1)** : la course exacte d'É-G1-6 n'est pas reproduite par deux montages (§5) : le client détecte la fermeture avant
  d'envoyer ; la parade couvre la classe « connexion fermée ou réinitialisée avant toute réponse », simulée de façon déterministe par le
  serveur du test. Codes mesurés seulement (`EPIPE` exclu, non mesuré : un tel échec reste un refus `unreachable`, fermé). Le délai
  d'inactivité du Caddy de l'hôte reste non lu (aucun réseau ; lecture sur place par l'orchestrateur) : item §9 (b).
- **Q-3 (N-2)** : la garde est dans l'aide `rowsOf`, hors des corps de test : une garde de non-vacuité ne peut pas rougir à la base par
  nature ; elle couvre les deux sites du G2 (`bound.length === file.length` lie le fichier aux lignes liées). Aucun appel actuel n'attend zéro
  ligne ; le cas du fichier vide (N-4) passe par le rendu du corps, sans cette aide.
- **Q-4 (N-3)** : remise par clé. Sémantique React lue [lu] (react-dom 19.2.8, `react-dom-client.development.js`, sha256 `261c3275…`) :
  l.6420-6430, `updateSlot` ne garde un enfant que sous la même clé (sinon `null`, l'ancien est supprimé et un neuf est créé) ; l.8264-8268,
  `mountStateImpl` appelle l'initialiseur au montage. Testé : la fonction de clé (une clé par tête, deux têtes d'un même état comprises), la
  liaison dans `dojo-live.tsx`, et le premier état de chaque vue par rendu serveur. La transition côté client elle-même n'est exécutée par
  aucun test racine (aucun DOM dans le dépôt ; en ajouter un serait une dépendance neuve et un accès réseau) : volet navigateur, §9 (c).
- **Q-5 (RENDER-ORACLE-1)** : construction (b) faite (rendu serveur, aucune dépendance neuve) ; la page entière rendue passe `assertDojoBody`
  sur E1, E2, EA et sur une ancre à 60 jours, et la page à 30 jours est refusée contre l'ancre à 60. Restent au navigateur (PK-6) : rangées
  après liaison dans un vrai DOM, remises de `found` et `count` au clic : §9 (c).
- **Q-6 (Bitcoin et BLS)** : audit par recherche (`bitcoin|opentimestamp|timestamp|bls|drand|beacon`) dans `apps/site/lib/dojo-*.ts`,
  `components/dojo`, `app/dojo` : aucun texte ne revendique un horodatage ni une vérification ; la phrase `beacon` dit « this page does not check that
  signature » ; seules mentions de Bitcoin : un commentaire (alphabet base58 de `dojo-lookup.ts:8`) et les modules de Bell. Garde ajoutée.
  Observation pour la validation des textes, sans changement : TXT-5 dit « a seed committed in advance and revealed afterwards » ; tant que
  l'horodatage est reporté, un tiers ne peut vérifier « in advance » que par une copie de la ligne d'ancre lue avant le jour.
- **Q-7 (DUST-HIDE, textes)** : quatre textes modifiés et trois neufs, candidats à la validation visuelle de l'investisseur ; « under the dust
  threshold » couvre aussi une ligne de détenteur sans valeur du jour (règle du cœur : jour manquant, `false`), même lecture que « smaller
  lines » de la phrase `holders`. Cas limite non spécialisé : sous une version, si aucune ligne n'est listée (tous détenteurs sous le seuil, aucun
  `program`), la table ne liste rien et la recherche trouve chaque ligne ; inatteignable avec de vraies données.
- **Q-8 (LOOKUP-PAYLOAD-1 jambe 2)** : refus nommé (acte de l'orchestrateur par PK-5 et Q-K3 = (a) ; prérequis absents) : demande §9 (c).
- **Q-9 (épingles amendées)** : cinq assertions existantes changent avec le contrat qu'elles gardent, chaque test rouge à la base par
  assertion (red-proof, F2P) : (1) M-L11, la page rend exactement une `DojoSentence`, celle de la méthode
  (`dojo_live_calls_the_reread_without_bounds`) ; (2) figures EA et sources EAV, fenêtre comprise (`dojo_page_renders_served_figures_only`) ;
  (3) clés des figures EA (`dojo_served_accepts_an_abstained_head_with_readings`) ; (4) liste fermée, compte 32 et empreinte
  (`dojo_page_lexicon_is_closed`) ; (5) ordre affiché porté par les lignes listées (`dojo_table_rows_are_the_verifier_lines`).

## 9. Items formés et demandes (règle Dettes : aucun dû nu)

- **(a) DOJO-COPY-DURATIONS-DERIVED-1** : la durée de Migration de la phrase `tier` (« one hundred and eighty days ») est un littéral que l'ancre peut
  contredire (`tier_windows[4]`) ; construction : la même figure d'ancre que TXT-5 (`tier_windows`, rendue par `DojoSentence`), ou un refus
  de construction si `tier_windows[4]` diffère de 180 ; propriétaire : orchestrateur ; déclencheur : avant toute ancre dont `tier_windows[4]`
  ne vaut pas 180, ou à la prochaine validation des textes.
- **(b) DOJO-VERIFY-URL-IDLE-MEASURE-1** : rejouer la sonde (ii) de DOJO-VERIFY-SCALE-1 (journal G1 de PR-3b-2a l.341-343 : 1 144 adresses,
  30 jours, serveur `node:http` aux délais par défaut) contre la CLI corrigée, et lire sur place le délai d'inactivité du Caddy de l'hôte ;
  propriétaire : orchestrateur ; déclencheur : avant CA-1 de la partie 3. D'ici là, un échec hors liste reste un refus `unreachable`.
- **(c) Demande formée à l'orchestrateur : jambe 2 de DOJO-LOOKUP-PAYLOAD-1 et volet navigateur de DOJO-LIVE-RENDER-ORACLE-1** (PK-5, PK-6,
  Q-K3 = (a)) : (1) lire sur place FAITS-CDP-MOBILE-1 (facteur de bridage du processeur d'un profil mobile) et FAITS-WEB-PERF-BUDGET-1 (budget
  d'une vue mobile) ; (2) construire le site sur une racine portant un `dojo-served.json` de fixture (construction (c) du journal G1 de
  4c-1b, racine injectable dans `page.tsx`, environ 10 lignes) et le servir en boucle locale avec un miroir `/dojo-served/*` à N = 10^3,
  10^4, 10^5 ; (3) mesurer par `F:/tmp/site-docs-1/g2/tools/mobile375.mjs` (présent) le temps jusqu'à la première tranche et jusqu'à la
  liaison complète, les tâches longues et le tas, en couvrant le cas (B) (deux fichiers, environ 4N empreintes), la double analyse des
  lignes (liaison puis table), « Show more lines » par 100, le `canonical` ajouté (N-9) et le filtre de poussière (une passe de plus) ;
  (4) dans le même Chrome, les transitions du client (N-3, remises de `found` et `count`). Chrome est présent sur l'hôte ; son profil doit
  vivre sous F:. Déclencheur : avant l'envoi du site (iii-a).
- **(d) DOJO-VERIFY-CLI-DOC-REPLAY-1** : commentaire de `dojo-verify-cli.mjs:19` à préciser (détail et texte de remplacement au §10).

## 10. Écarts de conduite (`error_origin` : ce G1)

- La première version du rejeu ajoutait un second site `fetch(` hors d'`urlSource` : vue avant toute course par la lecture de l'épingle T-10,
  refaite en boucle sur l'unique `fetch(`.
- `tools/probe-idle3.mjs` a été dérivé de la sonde 2 par une commande `node -e` portant des échappements dans la ligne de commande (aucun
  dans le fichier produit) ; `tools/texts-sha.mjs` et `tools/kids.mjs` écrits par heredoc sans barre inverse.
- Typecheck racine rouge une fois (sept erreurs, mon test neuf, `noUncheckedIndexedAccess`), lint rouge une fois (fonction asynchrone sans
  `await`, mon test neuf) : corrigés avant `red-proof`.
- Le journal a été complété après le départ de l'oracle (§7) : l'empreinte `dirty` de son enregistrement couvre le journal tel qu'il était à
  18:04Z ; aucun fichier de code ni de test n'a changé depuis (sha256 au §11).
- **Fichiers hors de la liste nommée de la mission**, chacun pour un item de la mission : `apps/site/app/dojo/page.tsx` (la phrase de
  méthode y est rendue, et `DojoSentence` est le seul chemin d'une figure) ; `scripts/assert-fleet-html.mjs` (le contrôle de construction doit
  composer la figure neuve à part, sinon la construction rougit ; et la garde Bitcoin et BLS) ; `apps/dojo/scripts/dojo-chain.mjs` (un
  commentaire devenu faux par SYNC-SERVED-DEPTH-SCAN-1, même classe que C-1 de la relecture DEPTH-BOUND) ; `apps/site/COMPONENTS-PROVENANCE.md`
  (l'entrée du composant scindé) ; et `test/dojo-live.test.ts` (épingle des clés EA).
- **Portes statiques pendant le verrou d'un autre** : `tsc` (site et racine) et `eslint` ont tourné de 17:58Z à 18:01Z pendant que le pid
  94008 tenait le verrou (précision du §0) : portes statiques, hors verrou par la règle même de l'oracle (en-tête de `run.mjs` : « STATIC gates
  run outside the host lock ») ; aucun test, aucune sonde, aucun harnais dans cette fenêtre.
- **Imprécision restante** : `apps/dojo/scripts/dojo-verify-cli.mjs:19` dit encore « one GET per file of the closed list » ; avec `replayOf`,
  un fichier peut être demandé deux fois quand le premier essai échoue avant toute réponse (commentaire de la l.35, et doc de `replayOf`).
  Ligne de 154 caractères, non modifiée pour garder intactes les preuves (`red-proof`, oracle). Item formé : DOJO-VERIFY-CLI-DOC-REPLAY-1,
  remplacer en place « one GET per file of the closed list, » par « one GET per file of the closed list (replayed once by replayOf), »
  en raccourcissant la ligne (la référence « bell-verify.mjs:47-68 » passe à la ligne suivante) ; propriétaire : orchestrateur ; déclencheur :
  le prochain tour de corrections de ce lot, ou son G7.

## 11. État à la remise

- Worktree `F:/Monark-wt-site` : HEAD `c0c60617`, 16 fichiers modifiés et 2 neufs (`docs/G1-lot-site-prep.md`, `test/dojo-render.test.ts`),
  rien d'autre (`git status --porcelain`, 18:14:46Z). Rien commis, aucun workflow (R-20).
- Jonctions retirées par `rm-nm.ps1` (`b51b5d22…8749`) de `F:/tmp/dojo/siteprep/c1` et de `F:/tmp/dojo/siteprep/mut1/clone` (« removed »,
  18:14:35Z) ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant et après. Les clones restent, sans `node_modules`.
- Le digest de `red-proof` recalculé sur l'arbre livré par sa recette (`tools/digest.mjs`, `4be8108d…32f3`, 18:15:42Z) vaut
  `c47a1219…812e`, celui de `RED-PROOF.json` (18:03:07Z) : code et tests livrés = code et tests jugés, puis gelés par l'oracle (18:04:35Z).
- Empreintes des fichiers du lot (identiques à celles du clone `c1` où les tests ont tourné, et aux fichiers de `red-proof` et de l'oracle) :
  - `apps/dojo/scripts/dojo-chain.mjs` `e8d058d307b12f6a0842326c362a14776168de4d9c503b7a8936f273aa6af61e`
  - `apps/dojo/scripts/dojo-verify-cli.mjs` `be9f71056b5b952240698e875fe5fd7278dc8bd67d358f3c1485fe6468ca3dcb`
  - `apps/site/COMPONENTS-PROVENANCE.md` `c13901709c4d4b4a8c033a0a3e9e8886b1f08c48e158bce0761e622231519423`
  - `apps/site/app/dojo/page.tsx` `03688ffe33545c264ef89ff5886ba13cb98ebc44043a28deaa6ec6f4dc2671dc`
  - `apps/site/components/dojo/dojo-live.tsx` `3860052c8bd733cc5d3834d17382cac1ccc3bcd9e36b7ed21a69732a43ce3ddc`
  - `apps/site/components/dojo/dojo-table.tsx` `6941323625bd2693a6243dd70d41c955ee1afad3bc4f949ad7bef1f480907abf`
  - `apps/site/lib/dojo-copy.ts` `32d95972d15b5cff9dfd8fe7c80483488269cd60d1b0673e8cd62776965ec411`
  - `apps/site/lib/dojo-served.ts` `955dda56699878ca07c078676769c98718663da5f6b15daec00cd536c5372347`
  - `scripts/assert-fleet-html.mjs` `32fc6f3b766f5d2e2efa672a15784b48e85ff9fa86f6a7b3a39ea191053075e1`
  - `scripts/sync-dojo-served.mjs` `d7dbe6e052981fb19c82fa8f1e61cb9cc1af20ab766253ad987aacaba5238efe`
  - `test/dojo-live-surface.test.ts` `88370d5fd43f4642ff5bc28395ba4049ec3d9466e5db75d575d0b95fecf8353b`
  - `test/dojo-live.test.ts` `8b052b9b43da3af7738124ca0d5bd863cc68eecfdccb77b45f78191ae86d82b1`
  - `test/dojo-page.test.ts` `36afe461c878b3e5b228433da78045e2415b348e9a4ef0de946c7b267d3d1f2b`
  - `test/dojo-served.test.ts` `24662ec14b9c238999f1f47390ee85953af1ad4057abd8248313c6870e8fade1`
  - `test/dojo-table.test.ts` `97fbac3d08c4501a94d92efd9765ad40758bb0236d69c88a78a5012c41f6ab34`
  - `test/dojo-verify-url.test.ts` `04e03de43c847bbabcc113ff4f4c3e33507e9a46c86e272b4c539e00bee05302`
  - `test/dojo-render.test.ts` `a93aac4c84c672c94ee9a65c569f0cce46d6887a53802033b0a9e741c75ba2a5`
- Livrables hors dépôt : `F:/tmp/dojo/siteprep-deliver/REPONSE.md` et `DELIVERED.sha256` (écrit en dernier) ; preuves sous
  `F:/tmp/dojo/siteprep/` (`tools/`, `logs/`, `rp1/`, `mut1/`).
- Verdict de ce G1 : **LIVRE-AVEC-RESERVES** : les réserves sont les items et la demande du §9 (jambe 2 et volet navigateur, actes de
  l'orchestrateur ; mesure de la course réelle d'inactivité ; littéral de Migration), et la validation visuelle des textes par
  l'investisseur (Q-1, Q-7).
