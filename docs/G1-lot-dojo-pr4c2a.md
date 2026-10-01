claude-opus-5-5

# G1 — journal du lot Dōjō PR-4c-2a (tableau de toutes les adresses et recherche par adresse, page `/dojo`)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session ; préfixe vérifiable
  `claude-opus-5-5`), effort max, contexte frais. Implémenteur G1 : ne committe pas, ne lance aucun workflow (R-20).
- **Mission** : `F:/tmp/dojo/mission-impl-pr4c2a.md` (60 l.), sha256 `5a88e8d7a953d1a6f844b4a674a01519da7df80e0e39f732e8ca63f31b6a1591`,
  recalculé AVANT lecture (`date -u` 23:29:05Z), égal au reçu `F:/tmp/dojo/mission-impl-pr4c2a.recu.json` (verdict vert,
  2026-09-30T23:28:55Z, `repo` `F:/Monark-wt-dojo-pr4c2`, `base` `f4ebcf5b`, `head` `f11df0ac`, douze règles du linter à 0).
- **Règles** : la copie du worktree `docs/methode/REGLES-MISSION.md` (18 l., sha256 `12d5f2df…0335`) est celle que la mission insère
  verbatim ; la copie du tronc `F:/Monark/docs/methode/REGLES-MISSION.md` (20 l., sha256 `64700025…d2ba`) porte en plus une ligne
  datée de l'orchestrateur (2026-09-30 23:42 UTC, décision 300, méthode par parties), postérieure à la génération de la mission
  (23:28:54Z) ; lue, sans conflit avec la mission (aucun F2P, aucun mutant ni oracle ici ; l'inspection finale les fait).
- **Décision 300** (mission, « Contexte ») : trois parties au plus, UNE inspection finale (relecture, oracle complet, F2P, mutants,
  checkpoint, G7) sur la branche intégrée ; ce G1 livre du code et ses tests verts, sans contrôle par lot.
- **Décision 301 de l'investisseur** (message de l'orchestrateur reçu en cours de mission, lu à `date -u` 23:35:15Z ; verbatim de
  l'investisseur : « classe le tableau par score ») : remplace l'ordre (a) de la mission par l'option (b) de Q-K1 (rapport cp-1 §6) :
  (1) rangées par score décroissant (champ `score` de la ligne signée), égalités par adresse, tri stable, aucune colonne ni numéro de
  rang ; (2) une phrase de la liste fermée déclare l'ordre (exemple donné : « Listed by hold score, highest first; equal hold scores
  by address ») ; (3) liaison et recherche sur le tableau lié dans l'ordre du fichier signé (par adresse), jamais sur l'ordre affiché ;
  (4) `dojo_table_rows_are_the_verifier_lines` compare chaque rangée à la ligne du vérificateur par `inclusion.index` dans le tableau
  lié, jamais par position affichée ; (5) M-K12 reformulé : ordre affiché = ordre déclaré ; lignes en plus comptées (≈ +25).
- **Base** : worktree `F:/Monark-wt-dojo-pr4c2`, branche `lot/dojo-pr4c2`, HEAD `f11df0ac1e67062e88796f8b7ff179ed4e844313` ;
  `git status --porcelain` vide à 23:29Z ; base → HEAD : `docs/G0-lot-dojo-pr4c2.md` (A, `35947225…`) et `docs/adr/ADR-DOJO-PR-4.md`
  (M, `c6ab06ae…`), égaux aux empreintes de la mission.
- **Heures** (`date -u`, 2026-09-30) : 23:29:05Z (sha256 de la mission), 23:29:57Z (sha256 du code lu), 23:35:15Z (décision 301),
  23:49:02Z (sha256 de toutes les entrées), 23:49:25Z (verrou d'hôte absent, TEMP créé), puis écriture de ce journal avant tout code.

## 1. Entrées lues (dans l'ordre de la mission, en entier ; sha256 à 23:49:02Z)

| # | Entrée | l. | sha256 |
|---|---|---|---|
| 1 | `docs/adr/ADR-DOJO-PR-4.md` (l.1-524) | 524 | `c6ab06ae0eb094a0b2c940f7e095127fb183587d81b6eb6532ce7b831c8ccbe2` |
| 2 | `docs/G0-lot-dojo-pr4c2.md` | 61 | `359472255248b027365bcdca63f4a6288b0c5d89f7f153983953d0c7db0ac8ef` |
| 3 | `F:/tmp/dojo/cp1-pr4c2/CP1-report.md` | 87 | `7e896c9ecfe521fd36429415e9a2e6cd8c963862469a83dfbf0f8d0058597553` |
| 4 | `apps/site/lib/dojo-live.ts` | 297 | `645b5a53d21db60aa6d68a4e70cb321f8b08765a90e2e6775f7a1456e647f234` |
| 5 | `apps/site/lib/dojo-served.ts` | 149 | `e2ddafacb354d878f8dbf7cb0c3a236a2df87e940a74edc119c984496f3842b6` |
| 6 | `apps/site/lib/dojo-copy.ts` | 80 | `2e973ec4df40d6a5936983098ccc35e02a86277963de434b65aa66b1f6e4e9ec` |
| 7 | `apps/site/components/dojo/dojo-figures.tsx` | 22 | `368ed8526609dab067d48a179864bb5f34129626247fb6eb3bc0e0205b4ef4b9` |
| 8 | `apps/site/components/dojo/dojo-live.tsx` | 51 | `082c145ed26e4b3b6330229ec1c8a1725080ff6e155e50da1ab660fbc4deb0c8` |
| 9 | `apps/site/app/dojo/page.tsx` | 42 | `369c6c889d0b5b7a15150f34a0eecaf251a015486511c5cec1399ca8e565b777` |
| 10 | `scripts/assert-fleet-html.mjs` (l.570-764) | 764 | `63f3e4a64452f60293c49e40bc140077e72f0996cd906841e639de5a651ed85f` |
| 11 | `apps/dojo/scripts/dojo-verify.mjs` | 372 | `ef6d15b21239e3a78ebb874c654b6e7a5ba2ecb5952ba1fd5b794d3d42f6c49f` |
| 12 | `test/dojo-live.test.ts` | 356 | `7ba6395d88cf0dbc5d6eb4fda94bc6e0e30196c45a47ee79bfefd31887bbae9e` |
| 13 | `test/dojo-live-surface.test.ts` | 324 | `8f75095863b3f4b25252defb04038a7617ff58bf8f72e0788a76829872711dfc` |
| 14 | `test/dojo-served.test.ts` | 390 | `4706c27276822ad2641610d9df0776c07f96a6f108411c72023bc119cf05f8a2` |
| 15 | `F:/Monark/scripts/red-proof.mjs` | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

- Parties nommées par la mission, lues dans ces fichiers : D-1, D-4, plis de PR-4c-1, pli G0 de PR-4c-2 et ligne datée finale (1) ;
  §4 à §7 du rapport (3) ; `DOJO_FORBIDDEN`, `assertDojoBody`, `dojoExpected`, `main()` (10) ; `--address`, `inclusion` (11) ;
  `parseKiller`, `killerProblem`, `judgedOf` (15). Le reste de chaque fichier est lu aussi, sauf (10) avant l.570 (portes Fleet, Ukemi).
- Lectures complémentaires : `test/dojo-page.test.ts` (174 l., `d1d17f9c…`, amendé par ce lot, en entier) ;
  `apps/site/lib/dojo-served-load.ts` (248 l., `d63b5326…`, en entier) ; `apps/dojo/test/helpers/dojo-fixture.ts` (334 l.,
  `2e9e04b7…`, en entier) ; `apps/dojo/scripts/dojo-core.mjs` l.245-320 (`base58Decode`, `ownerClass` ; `34075c6f…`) ;
  `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` l.44-58 (L-14, L-15 ; `ce85cc2e…`) ; `apps/site/test/honesty-lint.ts`
  (`VISIBLE_ATTRS`, `renderedTexts` ; `ca3ca401…`) ; `eslint.config.mjs` (`c1c9ac9d…`) ; `tsconfig.json` (`e9f78b86…` :
  `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) ; `apps/site/tsconfig.json` (`14787368…`) ; `.github/workflows/ci.yml`
  l.75-100 (pathspec R-25 ; `0f401ae2…`) ; `F:/Monark/scripts/oracle/r25.mjs` (28 l., `4d0544df…`) ; `F:/Monark/scripts/oracle/run.mjs`
  l.91-142 (gel du clone de l'oracle) ; `apps/site/COMPONENTS-PROVENANCE.md` (`f2d2c47b…`) ; `vocab-banned.json` (portée `site`).

## 2. Compte ascendant par fichier, AVANT tout code (unité R-25 : insertions + suppressions ; journal hors compte)

Conception de départ (tenue ensuite, écarts dits au §8) : `bindDojoLines(bytes, signed, sha256)` extraite de `project` l.279-287 et
placée en fin de `dojo-live.ts` (aucun tueur avant l.279 ne bouge) ; issue `reread` portant `rows` BRUTES (C-V-1 du cp-1) ;
`DojoLiveView` gagne `head` et `rows` facultatifs, posés dès que la relecture a une issue (le premier rendu n'en porte pas : le
tableau attend), modifications EN PLACE l.104, l.136, l.145 (aucun des six tueurs de `dojo-served.ts` ne bouge) ; section neuve en fin
de `dojo-served.ts` (`dojoTableFirstOf`, `dojoTableOf` : lignes liées, formes, ordre signé, cellules, ordre affiché de la décision 301) ;
`dojo-lookup.ts` neuf ; `dojo-table.tsx` neuf, monté par `dojo-live.tsx` après sa dernière phrase (un import : ses trois tueurs l.29,
l.37, l.43 bougent d'une ligne, réancrés) ; `page.tsx` inchangé (Q-G1-3).

| Fichier | Asc. |
|---|---|
| `apps/site/lib/dojo-live.ts` | 31 |
| `apps/site/lib/dojo-served.ts` | 54 |
| `apps/site/lib/dojo-lookup.ts` (neuf) | 38 |
| `apps/site/components/dojo/dojo-table.tsx` (neuf, client) | 95 |
| `apps/site/components/dojo/dojo-live.tsx` | 4 |
| `apps/site/lib/dojo-copy.ts` | 26 |
| `scripts/assert-fleet-html.mjs` | 2 |
| `apps/site/COMPONENTS-PROVENANCE.md` | 4 |
| `test/dojo-table.test.ts` (neuf) | 248 |
| `test/dojo-page.test.ts` | 24 |
| `test/dojo-live-surface.test.ts` | 8 |
| `test/dojo-live.test.ts` | 10 |
| **Total** | **544** |

- `dojo-live.ts` : type de l'issue et sa doc (4) ; `project` l.279-287 remplacées par 2 lignes (11) ; retour avec `rows` (2) ;
  `bindDojoLines` exportée (14).
- `dojo-served.ts` : import de type (2) ; `DojoLiveView` et sa doc (4) ; `keep` (2) ; retour de la relecture (2) ; section du tableau :
  types et dépendances (14), `dojoTableFirstOf` (2), `dojoTableOf` avec formes, cellules, ordre signé et ordre affiché (28).
- `dojo-lookup.ts` : en-tête (5), import de type (1), `isDojoAddress` (11), `findDojoRow` (10), `DojoLookup` et `dojoLookupOf` (8),
  blancs (3).
- `dojo-table.tsx` : en-tête (9), imports (6), pas P (2), état et effet (18), attente et refus (3), champ et bouton (18),
  messages (2), tableau (26), boutons « Show all lines » et « Show more lines » (9), fermeture (2).
- `dojo-live.tsx` : import (1), montage (1), en-tête l.9 en place (2).
- `dojo-copy.ts` : TXT-14b-r2 en place (2) ; TXT-17, 17a, 17c, 17o (décision 301), 15r, 15a, 15b-r et leur commentaire (15) ;
  `DOJO_TABLE` (7) ; en-tête en place (2).
- `assert-fleet-html.mjs` : `dojoExpected` l.675 en place, TXT-17 dans `shown` en E1 et E2 (2).
- `COMPONENTS-PROVENANCE.md` : entrée de `components/dojo/dojo-table.tsx` et `lib/dojo-lookup.ts` (4).
- `test/dojo-table.test.ts` : en-tête (9), imports (16), aides et câblage du composant (50), sept tests avec leur ligne `// killer:`
  et leur blanc (≈ 173).
- `test/dojo-page.test.ts` : l.66 par état (3) ; deux cas rouges (2) ; `dojo_page_lexicon_is_closed` : compte, sha256, objet canonique,
  mots de `DOJO_TABLE` (10) ; `dojo_copy_is_digit_free` : exports, chaînes, noms, `renderedTexts` de `dojo-table.tsx` (9).
- `test/dojo-live-surface.test.ts` : liste `fixed` l.91 (2) ; tueurs de `dojo-live.tsx` réancrés, 3 × 2 (6).
- `test/dojo-live.test.ts` : tueurs de `dojo-live.ts` réancrés (l.284 et l.286 vers `bindDojoLines`, l.290 deux fois, l.295), 5 × 2.
- **Part de la décision 301 comprise** (≈ 20) : comparateur d'ordre affiché et double liste `bound`/`shown` (4), phrase TXT-17o et son
  rendu (2), tests de l'ordre déclaré et de la comparaison par `inclusion.index` (≈ 14).
- **Tueurs déplacés, comptés (Q-V-2 du cp-1)** : `dojo-live.ts` 5 (l.284, 286, 290 deux fois, 295) ; `dojo-live.tsx` 3 (l.29, 37, 43) ;
  `dojo-served.ts` 0 (éditions en place, choix de conception ci-dessus) ; `dojo-copy.ts:75` et `assert-fleet-html.mjs:675` : 0
  (textes ajoutés après l.79 ; l.675 éditée en place, son motif « T.rereadFirst, ...(counted » gardé une fois) ; 8 lignes
  `// killer:` à réancrer, 16 lignes comptées ci-dessus.
- **Repli** : 544 ≤ 547 : **aucun repli** ; la recherche reste dans 2a. Marge de 3 lignes seulement : déclarée (Q-G1-1). Le compte du
  planificateur repris composante par composante (519), plus la décision 301 (≈ +25), plus les trois tueurs de `dojo-live.tsx`
  (+6, Q-V-2 du cp-1), donnerait ≈ 550 : le compte qui décide est celui-ci, fichier par fichier (mission, tâche 1) ; la borne
  mesurée reste 1 150 par `r25()` (écarts mesurés des lots du site ×1,63 et ×1,74 : ≈ 947 projetés [calc]).
- Ce §2 a été écrit et fermé à 23:51:39Z, AVANT tout code : sha256 du journal à cette heure
  `bc75e9d1a521cd9d4af3a911f628c55ac4a21f9abb99a0613dfce67c120094fe` (115 l.), resté inchangé jusqu'à l'ajout des §3 à §9 (00:18Z).

## 3. Code livré : décision → fichier → test (code écrit de 23:52Z à 00:06Z ; corrections de longueur et de lint jusqu'à 00:09Z)

- **C-V-1 du cp-1** : `rows` = lignes servies BRUTES, chaînes sans LF telles que `linesOf` les rend : issue `reread` (`dojo-live.ts`
  l.25, l.289) ; `bindDojoLines(bytes, signed, sha256)` exportée (l.292-306 ; ordre de `project` gardé : compte, SHA-256, racine, clés,
  sommes, détenteurs ; un corps hors UTF-8 ou sans LF final, ou une ligne non JSON, lève comme avant), appelée par `project`
  (l.279-280) et par le tableau ; objets analysés dans `dojoTableOf` seul. Test : `dojo_table_rows_are_the_verifier_lines`.
- **D-K3 (source, une lecture)** : `DojoLiveView` (`dojo-served.ts` l.104) gagne `head` et `rows`, posés quand la relecture a une issue
  (`keep` l.136 : tête committée, `rows` nul ; succès l.145 : tête relue et ses lignes) ; `dojoTableOf` (l.179-201) : premier rendu
  (aucune `head`) ⇒ attente sans GET ; (A) lignes de la relecture, aucun second GET ; (B), (C) et refus de `dojoHeadRefusal` ⇒ un GET
  borné de `lines/<lines_sha256 committé>.jsonl` lié aux valeurs committées par `bindDojoLines`. Test :
  `dojo_table_follows_the_displayed_head` (GET et appels SHA-256 du tableau : 0 en (A), un GET et 2N en (B) et (C)).
- **D-K4 (tout ou rien)** : refus, ligne hors forme ou hors ordre strict ⇒ `refused`, TXT-17c, aucune rangée, aucune raison
  (`dojo-table.tsx` l.41 ; aucune occurrence de `why`) ; tête rendue abstenue ⇒ `none`, rien. Test :
  `dojo_table_refuses_a_file_it_cannot_bind` (absent, modifié, une ligne en moins, BOM, borne abaissée, autre racine ; puis par la
  voie (A) : hors ordre signé, classe hors liste, adresse hors alphabet, provisoire non décimal, palier au-delà de la liste).
- **D-K5 (cellules)** : adresse telle quelle ; classe → mot de `DOJO_TABLE` ; score, validé, provisoire = `shiftUnits(champ, decimals
  de la tête rendue)` ; sous une version seulement, unités telles quelles et palier = `DOJO_TIER_NAMES[tier − 1]`, « none » pour 0
  (`dojo-served.ts` l.185-193). Test : `dojo_table_rows_are_the_verifier_lines` (chaque cellule inversée redonne le champ exact).
- **D-K2 et décision 301** : `bound` dans l'ordre du fichier signé (ordre strict des octets vérifié, l.195) pour la liaison et la
  recherche ; `shown` = score décroissant, égalités par adresse (`byScore` l.172-174, tri stable) pour l'affichage ; aucune colonne
  ni numéro de rang ; phrase TXT-17o. Test : `dojo_table_rows_are_the_verifier_lines` (rangée comparée à `inclusion.index` dans `bound` ;
  ordre affiché = ordre déclaré, oracle `BigInt` et `Buffer.compare` ; « 10 » avant « 9 », égalités par adresse, sur lignes données).
- **D-K6 (recherche)** : `isDojoAddress` (`dojo-lookup.ts` l.13-21 : `trim()`, 32 à 44 caractères de l'alphabet, décodage BigInt à
  32 octets), `findDojoRow` (l.25-34, dichotomie exacte sur `bound`), `dojoLookupOf` (l.37-42 : invalide, absente, ou la rangée ;
  jamais la saisie) ; champ non contrôlé, lu par `ref` au bouton ou à Entrée (`dojo-table.tsx` l.44), ni `<form>` ni `name`. Tests :
  `dojo_lookup_address_rule_equals_the_core`, `dojo_lookup_never_echoes_the_input`, `dojo_lookup_sends_no_address`.
- **D-K7 (mobile)** : tranches de P = 100 (`dojo-table.tsx` l.19, paramètre de conception), « Show more lines » ; jambe 1 au §6.
- **D-K8 (assertion du rendu)** : TXT-17 dans `shown` de `dojoExpected` en E1 et E2 (`assert-fleet-html.mjs` l.675, en place) ; TXT-17a,
  17o, 17c, 15r, 15a, 15b-r absentes du build par `absentSentences`. Tests amendés : `dojo_page_renders_served_figures_only`,
  `dojo_live_renders_through_the_same_figures` ; construction réelle E2 et EA au §5.
- **D-K9 (textes)** : `dojo-copy.ts` l.72 (TXT-14b-r2), l.80-96 (TXT-17, 17a, 17o, 17c, 15r, 15a, 15b-r), l.99-105 (`DOJO_TABLE`) ; liste
  fermée MESURÉE (`F:/tmp/dojo/pr4c2a/tools/texts-sha.mjs`, sha256 `0ea0a77e…5b6d`), jamais tapée : 29 textes, 13 mots, sha256
  `711e929d69f43d9b4eacbe6eaf4afe9649bb513f49e7a69f5746faf7cbe45947` de `canonical({DOJO_TEXT, DOJO_TITLE, DOJO_TIER_NAMES,
  DOJO_TABLE})`, épinglée par `dojo_page_lexicon_is_closed` ; `dojo_copy_is_digit_free` étendu aux mots et au composant neuf.
- **Montage** : `dojo-live.tsx` l.16 (import) et l.50 (`<DojoTable view={view} get={get} sha256={sha256} />` après la dernière
  phrase) ; `page.tsx` inchangé (Q-G1-3). **Provenance** : entrée de `components/dojo/dojo-table.tsx` (`COMPONENTS-PROVENANCE.md`).

## 4. Tests et tueurs

- Sept tests neufs (`test/dojo-table.test.ts`, 274 l.), chacun sous sa ligne `// killer:` (format de `parseKiller`) :
  1. `dojo_lookup_address_rule_equals_the_core` : `apps/site/lib/dojo-lookup.ts:20 CONST "n === 32" -> "true"` (M-K16) ;
  2. `dojo_table_rows_are_the_verifier_lines` : `apps/site/lib/dojo-served.ts:193 CONST "shift(s), shift(v)" -> "s, shift(v)"` (M-K11) ;
  3. `dojo_table_follows_the_displayed_head` : `dojo-served.ts:183 CONST "view.rows ??" -> "null ??"` (M-K15) ;
  4. `dojo_table_refuses_a_file_it_cannot_bind` : `dojo-served.ts:195 SDL "address >= r.address" -> ""` (M-K13) ;
  5. `dojo_table_units_only_with_a_version` : `dojo-served.ts:196 CONST "...(versioned ? [W.units, W.tier] : [])" -> "W.units, W.tier"` (M-K6) ;
  6. `dojo_lookup_never_echoes_the_input` : `dojo-lookup.ts:41 CONST "row };" -> "row, typed };"` (M-K1) ;
  7. `dojo_lookup_sends_no_address` : `dojo-table.tsx:58 CONST "spellCheck={false}" -> "spellCheck={false} name={W.address}"` (M-K8).
- Amendés : `dojo_page_renders_served_figures_only` (TXT-17 par état ; TXT-17a rouge sur la page construite ; TXT-17 rouge en EA),
  `dojo_page_lexicon_is_closed` (`DOJO_TABLE` affirmé d'abord ; 29 et 13 ; sha256 ; mots balayés), `dojo_copy_is_digit_free` (exports,
  mots, porteurs de « SHA-256 », `renderedTexts` de `dojo-table.tsx`), `dojo_live_renders_through_the_same_figures` (TXT-17 dans
  `fixed` l.91, et une assertion : toute page construite à tête comptée porte TXT-17, Q-G1-8).
- **Tueurs réancrés (8 lignes, motifs inchangés)** : `test/dojo-live.test.ts` l.89 (295 → 288), l.316 et l.322 (290 → 283), l.335
  (284 → 301), l.343 (286 → 303) ; `test/dojo-live-surface.test.ts` l.228 et l.229 (dojo-live.tsx 29 → 30, 37 → 38) ;
  `test/dojo-page.test.ts` l.165 (dojo-live.tsx 43 → 44). Tueurs de `dojo-served.ts` (6), `dojo-copy.ts:75`, `assert-fleet-html.mjs:675` :
  cibles inchangées, vérifiées.
- **Contrôle statique des tueurs** (`F:/tmp/dojo/pr4c2a/tools/check-killers.mjs`, sha256 `e4fc6930…2784` : `parseKiller` du tronc et
  les règles de `killerProblem`, red-proof l.51-58, sans exécuter de test ni de mutation) : 36 lignes `// killer:` dans les quatre
  fichiers de test touchés (7 neuves, 29 existantes dont les 8 réancrées) et 4 dans `test/dojo-served.test.ts` (non touché) : 0 problème.
- Préparation au F2P de l'inspection (non exécuté, décision 300) : exports neufs lus par l'espace de noms et affirmés d'abord, module
  neuf affirmé présent avant son import dynamique ; tests amendés rouges à la base par assertion (`"DOJO_TABLE" in copy`, liste des
  exports, TXT-17 attendue), jamais par un import ni une `TypeError`.

## 5. Exécutions (clones `--no-local` sous `F:/tmp/dojo/pr4c2a/` ; verrou d'hôte absent avant chaque course ; C-V-4 relevé)

- C-V-4 : 00:06:31Z (node.exe 19, 14 338 Mo libres, 29 428 Mo virtuels), 00:10:59Z (10 ; 15 763 ; 31 799) ; verrou absent à chaque course.
- Clone de test `clone-t` (HEAD `f11df0ac`, les 13 chemins recopiés ; jonctions par `mk-nm.ps1`, retirées par `rm-nm.ps1` à 00:16:38Z) :
  `typecheck` 0 (00:07:00Z, rejoué 00:09:46Z) ; `lint` ROUGE à 00:07:58Z (1 erreur `no-unused-vars`, l.145 du test neuf), corrigé, puis
  0 (00:09:08Z) ; `lint:ratchet` 0 (69/69 ; 0 violation différée dans chacun des quatre fichiers de test touchés, comptée à part par
  `ratchet-files.mjs`) ; `lang:gate` 0 ; `export:check` 0 ; `gate:vocab` 0 (330 fichiers).
- Tests, passage final (00:16:22Z-00:16:29Z) : `dojo-table`, `dojo-page`, `dojo-live`, `dojo-live-surface`, `dojo-served`,
  `site-honesty`, `site-build-fleet`, `ci-gates` : 120 tests, 120 verts, 0 rouge, 0 ignoré (`logs/tests-final.txt`, sha256
  `d0e170d2…b2f0`). Test 42 non lancé (il vit dans `test/export-public.test.ts`, non lancé ; `export:check` couvre l'export).
- Construction du site (clone `clone-b`, jamais par jonction : `npm ci --offline --cache F:/cache/npm`, 284 paquets) :
  `npm run build -w @monark/site` sortie 0 (« Finished TypeScript » : `dojo-table.tsx` compilé et typé), puis
  `node scripts/assert-fleet-html.mjs` sortie 0 ; sans enregistrement committé, `/dojo` est la page introuvable (404) et `/token` sans
  lien : branche E0 seule, le premier rendu du tableau n'y est PAS exercé.
- Preuve supplémentaire, clone jetable seulement (jamais dans le worktree ; remis à l'état du lot ensuite) : enregistrement de la
  fixture semé par `buildDojoServed` en E2 puis en EA, construction 0 et `assert-fleet-html` 0 (« /dojo E2: 12 figure(s) », « /dojo EA:
  2 figure(s) ») ; HTML E2 (`dojo.html` sha256 `911aaf41…37b0`) : TXT-17 une fois ; TXT-17a, 17o, 15r, 17c, `<table`, `<input` absents ;
  HTML EA (`bb9da60a…5309`) : TXT-17 absente, TXT-3A présente.
- Après la seconde consultation : `clone-b` reconstruit en E0 (00:23:42Z-00:23:54Z ; arbre = les 13 chemins du lot, aucun fichier
  semé), construction 0, `assert-fleet-html` 0 (page introuvable, 404, sans `<main>`) ; `dojo.html` sha256 `771f8877…f792` ; journaux
  `logs/site-build-final.txt` (`2be8ad3d…1011`) et `logs/assert-final.txt` (`49aa59fc…e613`, égal au premier passage E0).
- Valeurs lues sur la fixture (sonde de lecture, non livrée, retirée) : trois lignes par tête ; E2 : une adresse à 8 unités et au
  palier « Monarch » ; ordre affiché (D7CE7W…, CHtTzM…, 8opHzT…) ≠ ordre signé (8opHzT…, CHtTzM…, D7CE7W…) ; `ADDR.D` sans ligne.
- Égalité des arbres : à 00:16Z, les 13 chemins ont les mêmes sha256 dans le worktree et dans `clone-t`, `clone-b`, `clone-r`.

## 6. DOJO-LOOKUP-PAYLOAD-1, jambe 1 (PK-5 ; borne basse de bureau, jamais une mesure mobile)

- Hôte : AMD Ryzen 9 3900X (12 cœurs, 24 fils), 15 487 Mo libres, 31 088 Mo virtuels, node.exe 10, Node v24.15.0 (00:15:35Z).
- `rootOf` de `dojo-live.ts` sous `crypto.subtle.digest` de Node (empreintes asynchrones, comme le navigateur), lignes de la forme d'une
  ligne de détenteur de la fixture (290 o), adresse variée ; trois passages, médiane (`logs/leg1.txt`, sha256 `97505b6a…b2cc`) :
  N = 10³ : 46 ms ; N = 10⁴ : 439 ms ; N = 10⁵ : 3 942 ms ; appels SHA-256 de `rootOf` : 2N − 1 (plus le corps : 2N, épinglé par test).

## 7. R-25

- **Calcul exporté du tronc** `r25()` (`F:/Monark/scripts/oracle/r25.mjs`, sha256 `4d0544df…`) sur `F:/tmp/dojo/pr4c2a/clone-r`,
  HEAD = gel `4444d1349cd30b69f45738839c2d49984555b5e5` de l'arbre de travail (commit DANS ce clone jetable, motif `run.mjs`
  l.99-104 ; jamais poussé ; Q-G1-4), base `f4ebcf5b` : `STAT` 562 insertions + 42 suppressions = **604**, `CONTENT_STAT` 0, vert ;
  604 ≤ 1 150 (solde 546) ≤ 1 205. Recoupement en lecture seule sur le worktree (`r25-preview.mjs`, `R25_DIFF_RE` exporté) : 604.
- Par fichier (mesuré / estimé) : `dojo-table.test.ts` 274/248, `dojo-table.tsx` 103/95, `dojo-served.ts` 62/54, `dojo-lookup.ts` 42/38,
  `dojo-live.ts` 35/31, `dojo-page.test.ts` 32/24, `dojo-copy.ts` 29/26, `dojo-live.test.ts` 10/10, `dojo-live-surface.test.ts` 7/8,
  `dojo-live.tsx` 4/4, `COMPONENTS-PROVENANCE.md` 4/4, `assert-fleet-html.mjs` 2/2 ; total 604/544 (×1,11).

## 8. Écarts et questions à l'orchestrateur (Q-n)

- **Q-G1-1** (repli) : compte ascendant 544 sous le seuil de 547 (marge 3) ; aucun repli pris ; mesuré 604. Le compte du planificateur
  avec la décision 301 et Q-V-2 donnerait ≈ 550 : l'orchestrateur peut juger autrement et porter la recherche en tête de 2b.
- **Q-G1-2** (textes, décision 301) : TXT-17 et TXT-17a perdent « , by address » (elles diraient un ordre que la page ne montre plus) ;
  TXT-17o ajoutée, à l'exemple de l'orchestrateur : « Listed by hold score, highest first; equal hold scores by address. » (0 motif de
  `DOJO_FORBIDDEN`, mesuré par `dojo_page_lexicon_is_closed`) ; candidates P-10 à l'inspection, puis validation visuelle.
- **Q-G1-3** (`page.tsx`) : la mission dit « montage dans `apps/site/app/dojo/page.tsx` » ; la ligne `| PR-4c-2a |` du pli monte
  `DojoTable` depuis `dojo-live.tsx`, qui tient la vue établie ; `page.tsx` reste inchangé, son source épinglé par
  `dojo_live_calls_the_reread_without_bounds` (un `<DojoLive committed={data} />`, aucune phrase de relecture) ; le pli fait foi.
- **Q-G1-4** (R-20) : `r25()` lit `base...HEAD` d'un clone ; le gel est un commit dans un clone jetable `--no-local` sous `F:/tmp`,
  comme l'oracle du tronc ; ni le worktree ni `F:/Monark` n'ont reçu d'écriture git. À trancher : ce gel est-il admis hors de l'oracle ?
- **Q-G1-5** (forme de la vue) : `head` et `rows` facultatifs dans `DojoLiveView` (absents au premier rendu) plutôt qu'un drapeau
  explicite : la l.130 (148 caractères) aurait dû passer sur deux lignes et décaler trois tueurs ; l'état « établie » = `head` présent.
- **Q-G1-6** : `dojoTableFirstOf` (non nommée au pli) porte l'état initial du composant (premier rendu, tête abstenue) comme fonction
  pure testée (M-K15, EA) ; `dojoTableOf` est asynchrone, ses lectures injectées (`read`, `bind`) comme le sont celles de la vue.
- **Q-G1-7** (pour l'inspection) : M-K17 sur la classe est équivalent par construction (les mots « holder », « program » égalent les
  valeurs brutes ; seul le palier les distingue) ; sur la voie du tableau, la racine attrape un fichier modifié même sans le contrôle
  SHA-256 (M-K7 tenu aussi par la relecture : `lines_sha_mismatch` épinglé par `dojo_live_falls_back_to_the_committed_figures`).
- **Q-G1-8** : `dojo_live_renders_through_the_same_figures` reçoit, en plus de TXT-17 dans `fixed`, l'assertion « toute page
  construite à tête comptée porte TXT-17 », pour qu'un test amendé soit rouge à la base par assertion (red-proof juge les tests amendés).
- **Q-G1-9** : `dojoTableOf` contrôle l'alphabet base58 des adresses (pli PK-2), non le décodage à 32 octets (fait par le vérificateur
  et par `isDojoAddress` sur la saisie) ; la sûreté du rendu (TY-4) tient par l'alphabet et les nœuds texte de React.
- **Erreurs propres, `error_origin` worker G1** (toutes rattrapées avant tout test) : doc de l'issue `reread` passée à 3 lignes
  (aurait décalé tous les tueurs de `dojo-live.ts` : ramenée à 2) ; lignes > 160 dans le journal, `dojo-served.ts` et le test neuf
  (repliées) ; variable inutilisée (lint) ; premier contrôle d'octets faux (`awk` en octets, octets de continuation UTF-8), remplacé.
- PAROXYSME : aucune limite neuve déclarée par ce lot au-delà du pli (TY-20, TY-22, TY-9 étendue déjà portées par PAROXYSME-DOJO-FILE-1).

## 9. Git, périmètre, provenance

- `git` dans le worktree en lecture seule (`--no-optional-locks` : `rev-parse`, `branch --show-current`, `status`, `diff`,
  `ls-files`) ; écritures git dans les clones jetables seulement (`clone --no-local`, `checkout --detach`, `add -A` et `commit` du gel
  dans `clone-r`, `checkout --` d'un fichier de `clone-b`) ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun
  `write-tree`, aucune page d'aide ; aucun réseau (`npm ci --offline`, `NEXT_TELEMETRY_DISABLED=1`), aucun outil de recherche distant,
  aucun memstack ; rien sur C: ; TEMP `F:/tmp/dojo/pr4c2a/tmp` ; `F:/Monark/node_modules` lu seulement (cible des jonctions).
- Outils écrits pour ce lot (`F:/tmp/dojo/pr4c2a/tools/`) : `guard.mjs`, `guard-diff.mjs` (garde d'octets : 0 constat sur les lignes
  du lot), `check-killers.mjs`, `texts-sha.mjs`, `ratchet-files.mjs`, `r25-measure.mjs`, `r25-preview.mjs` ; journaux sous `logs/`.
- Advisor intégré consulté une fois après l'orientation, avant toute écriture (fallback, textes de la décision 301, gel de `r25()`,
  tueurs, comportement de `bindDojoLines`, voies de test, épingles, F2P, `page.tsx`, exécutions) ; seconde consultation avant la
  remise (00:21Z) : un point retenu et fait (le `.next` de `clone-b` était la sortie du semis EA : reconstruit en E0, §5) ; ordre de
  remise : ce journal, `REPONSE.md`, puis `DELIVERED.sha256` en dernier ; conseil, jamais verdict, chaque point vérifié sur pièce.

## 10. Ligne datée (2026-10-01 02:42Z, correcteur SMALL-CORR `claude-opus-5-5`) : constat page AC-2 de l'inspection de la partie 1

- `error_origin` : ce G1 (deux empreintes abrégées mal recopiées, producteur de `leg1.txt` non nommé). l.150 et l.210 corrigées EN PLACE, à
  longueur égale (aucune ligne décalée). Valeurs complètes mesurées par `sha256sum` à 02:15Z :
  `F:/tmp/dojo/pr4c2a/tools/texts-sha.mjs` = `0ea0a77ef2f00a661f94ac1b26a6664430624143d7705b551d2142789c0e5b6d` (écrit `…6b6d`) ;
  `F:/tmp/dojo/pr4c2a/logs/leg1.txt` = `97505b6ab7cd9d2bbb692325d8d7c39ba28a29c2d71258e51482f23b4f8bb2cc` (écrit `…22bc`).
- Producteur de `leg1.txt` : `F:/tmp/dojo/pr4c2a/clone-t/tmp-measure/leg1.ts`, écrit par heredoc à 00:15:44Z et lancé dans `clone-t`
  (`node tmp-measure/leg1.ts`, sortie par `tee` vers `logs/leg1.txt`), retiré par ce G1 à 00:16:10Z (`rm`, `rmdir`) : absent du disque
  (contrôlé à 02:36:38Z). Son texte reste dans la transcription de ce G1 : `F:/claude-config/projects/F--Monark/`
  `a0cf3d1b-5446-43e6-b228-3b1feff36069/subagents/agent-aeafe319163c67d7a.jsonl`, l.636 (écriture et lancement), l.641 (retrait).
- Forme rejouable sur disque : la sonde de l'inspection `F:/tmp/dojo/insp1/g2-site/tmp/tools/leg1-replay.mts` (sha256
  `7233493fcde38b04e4249dc757a673eac3b6b91e61edf8e112fa0e15106ff6b8`) ; son rejeu (`F:/tmp/dojo/insp1/g2-site/tmp/logs/leg1-replay-2.txt`, sha256
  `411afb129fc662eab816a377b48f1fbc41ea3eec9520cdc21a96010c1b132121`) : médianes 54, 512 et 4 363 ms ; 1 999, 19 999 et 199 999 appels.
