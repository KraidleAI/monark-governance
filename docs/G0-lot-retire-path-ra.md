# G0 du lot R-a d'ENGINE-ROW-RETIRE-PATH-1 : la liste de retrait épinglée, le recouvrement de la projection, la borne `LIVE_N_MAX`

- **Demande** : lot R-a d'ENGINE-ROW-RETIRE-PATH-1 (voie de retrait d'une ligne kata servie), coupe du brouillon de G0 de RECHERCHES (§3).
  MONARK l'a relu (`coordination/messages/2026-10-06-MONARK-vers-RECHERCHES-204-finale-d9-retrait.md`, §5 : F-1 à F-4, réponses Q-R1 à
  Q-R6) ; RECHERCHES a accepté F-1 à F-4 et ouvert la zone (`2026-10-06-RECHERCHES-vers-MONARK-G2-204-205-zone.md`, « Q-R4 : zone
  ouverte »). Ce G0 plie le brouillon et la relecture pour R-a : F-2, F-3 et F-4 s'appliquent ici ; F-1 (la liste publiée dans le
  dossier daté, et son test) est à R-b.
- **Base** : `lot/etude-suite` `a43b0126`, branche `monark/retire-path-ra`. Auteur : MONARK (worker `claude-opus-5-5`, effort max,
  2026-10-06). Pliage de la vérification (verdict APPROUVE-AVEC-CORRECTIONS, `F:/tmp/dojo/verify-ra.json` : M-1, M-2 option (a),
  m-1, m-2, m-4 à m-6, et l'ajout de RECHERCHES sur la chaîne) : worker `claude-opus-5-5`, effort max, 2026-10-06 à partir de 22:04Z (`date -u`).
- **Zone** : `apps/harness/src/policy-retire.ts` (neuf), `policy-projection.ts`, `policy-table-file.ts`, `policy-guard.ts` (zone de
  RECHERCHES ouverte pour R-a et R-b), `policy-wave2.ts` (l'ajout de `LIVE_N_MAX` seul, addendum 9 point 5), le test neuf
  `apps/harness/test/policy-retire.test.ts`, neuf lignes `// killer:` ré-ancrées dans trois fichiers de test (aucun corps de test
  touché), ce G0. RECHERCHES a confirmé la zone pour `policy-wave2.ts`, `policy-retire.ts` et ces ré-ancrages (relayé par MONARK
  le 2026-10-06, m-3 de la vérification).
- **Sources lues** (sha256 des copies lues) : brouillon de G0, §1 à 10 (`140330449c12…`) ; addendum 9 de l'ADR 0006, points 1, 2, 5 et 6
  (`8ae73cdb3b1b…`, versé, ligne P0 du 2026-10-06) ; CONTRACT `ffb5ea3` (`ac8187fa7662…`) l.192, l.346-347, l.441, l.444, l.447,
  l.492-493. Au pliage, le brouillon et l'addendum n'ont pas été relus (copies non retrouvées sur disque) : la phrase du point 2 de
  l'addendum vient de la relecture de MONARK (§4 point 2, brouillon du message 204, `F:/tmp/dojo/msg-204-final-draft.md`), celle du
  §4.2 du brouillon (la garde, seule autorité sur les comptes) de la décision de MONARK sur m-6.

## Comportement à la base (mesuré sur une copie `git archive a43b0126`)

Sonde hors dépôt `F:/tmp/dojo/ra-probe/base-probe.mjs`, lancée depuis la copie `F:/tmp/dojo/ra-base` (`git archive a43b0126 package.json
apps/harness/package.json apps/harness/src apps/harness/test/helpers`, `node_modules` prêté par une jonction vers celui du worktree, retirée
après la mesure) : `node F:/tmp/dojo/ra-probe/base-probe.mjs F:/tmp/dojo/ra-base`, puis la même sonde sur `F:/Monark-wt-ra` pour le gel.

1. **Une table qui porte une ligne retirée est refusée**, sur la première colonne qui diffère dans l'ordre des clés de la projection :
   `MONARK policy table: btc-dir-1h kata:trend-ema-v1@binance/BTCUSDT/1h/up-b1: column bound_on differs from the projection.` Le
   brouillon (§2 point 2) annonçait `column status` : `bound_on` précède `status` dans la projection.
2. **`guardKataRow` admet un retrait `live:1` de n_test 2 209 à 1h et 553 à 4h** quand k_test = n_test (le veto tire) : aucune
   borne. Avec k_test 0, le refus est celui du veto (`has retire counts off its cause or a live block the binomial rule does not fire on`).
3. **Aucun appel de `guardKataTable` hors des tests** (`git grep` à `a43b0126`) ; `apps/harness/data/` n'existe pas : aucune liste de
   retrait, aucune table kata engagée.

## Construction

1. **`LIVE_N_MAX`** (`policy-wave2.ts:15-16`) : `{ "1h": 2208, "4h": 552 }`, sous `W2_BLOCK_N_MAX`, son commentaire cite l'addendum
   9 point 5. Rien d'autre ne change dans ce fichier.
2. **Lecteur fermé `kata-retire-v1`** (`policy-retire.ts`, hors du graphe servi) : `readRetireList(pin, registryBytes, previous?)`
   rend `{date, entries}`. Une entrée a exactement huit colonnes : `cell_key`, `task_class`, `calib_attempt`, `cause`, `k_test`,
   `n_test`, `u_test`, `evidence_sha256`. Refus nommés, dans l'ordre du code :
   - octets dont le sha256 n'est pas l'épingle (`:61`) ;
   - nom autre qu'exactement `retire-<YYYY-MM-DD>.json` (nom nu, sans dossier : m-5 de la vérification), ou jour irréel
     (`:62-64`) ; mesuré : `Date.parse` de V8 roule 2027-02-30 au 2027-03-02, d'où l'aller-retour par `toISOString` ;
   - octets qui ne sont pas l'écriture canonique de leur valeur (`:40-48`, spec §2 ; ni espace ni fin de ligne, comme une table publiée,
     `not_canonical` de `scripts/spec-publish.mjs`) ;
   - clé inconnue, clé absente, colonne hors type, `format` autre que `kata-retire-v1` (`:32-37`, `:65-66`) ;
   - entrées non triées par (`task_class`, `cell_key`), ou case répétée (`:67-70`) ;
   - case absente du registre, essai autre que l'essai courant de la case, case qui ne sert pas de région (statut du registre autre que
     `region`, `vetoed` compris) (`:74-76`) ;
   - cause hors `live:<k>` et `adr:decisions/<fichier>.md` (`:77`) ;
   - comptes hors la forme de leur cause : `live:` 1 ≤ n_test, k_test ≤ n_test, u_test présent ; `adr:` aucun compte (`:78`) ;
   - n_test au-dessus de `LIVE_N_MAX` à l'horizon de la case (`:79`, addendum 9 point 5) ;
   - `live:<k>` dont la fin de trimestre E_k = `Date.UTC(2026, 9 + 3k, 1)` est après 00:00Z du jour de la liste (`:80`, addendum 9
     points 1 et 6 ; relecture de MONARK §4 point 5 : le contrôle de date vit dans la liste, pas dans la garde) ;
   - liste qui perd ou change une entrée de la liste précédente, ou qui n'est pas datée après elle (`:82-83`, cumul).
3. **Grammaire des causes, une seule source** : `retireQuarter` (`policy-retire.ts:51-53`) rend k pour `live:<k>`, 0 pour
   `adr:decisions/<fichier>.md`, rien sinon. `guardKataRow` s'en sert (`policy-guard.ts:92-93`), avec le même texte de refus.
4. **Recouvrement** (`policy-projection.ts:125-136`, en fin de fichier) : `retireOverlay(row, cell)` est la ligne B1 avec exactement
   cinq colonnes posées, `status` `retired`, `status_reason` `retired: <cause>`, `retire` `{cause, k_test, n_test, u_test}`,
   `miss_bound` et `bound_on` nuls ; `qhat`, `text`, `current` et les autres colonnes restent celles de B1 (Q-E6, Q-R5). Sans case
   listée : la ligne B1 elle-même. `projectCell` et `ProjectionInputs` ne changent pas.
5. **Comparaison** (`policy-table-file.ts:44`, `:52`) : `assertTableMatchesRegistry` prend un cinquième argument optionnel, les entrées
   lues (`[]` par défaut) ; la ligne attendue d'une case listée de la classe est `retireOverlay(projection, entrée)`. Les appelants à
   quatre arguments ne changent pas.
6. **Épingles et chaîne** (`policy-guard.ts:16-17`, `:112-117`) : `GuardPins` gagne `retireLists?: readonly RetirePin[]` (chacune
   `{file, sha256, bytes}`), la chaîne des listes datées de la plus ancienne à la plus récente, à côté de l'épingle du registre
   (Q-R2). `guardKataTable` contrôle d'abord l'épingle du registre (`:114`, m-2) par `assertRegistryPinned`
   (`policy-table-file.ts:62-65`, ajoutée en fin de fichier, refus mot pour mot de `:48`) ; puis il lit chaque liste par
   `readRetireList` contre sa devancière (`:115-116`, branche de cumul `policy-retire.ts:82-83`) et passe les entrées de la plus
   récente à la comparaison (`:117`). Dates strictement croissantes le long de la chaîne ; une liste qui perd ou change une entrée
   d'une liste antérieure est refusée avant toute comparaison, quel que soit le statut de la ligne dans la table : un retrait ne
   quitte jamais la chaîne (M-2, option (a) de MONARK ; ajout de RECHERCHES). Sans liste, ou chaîne vide, comportement de la base.
7. **Borne dans la garde** (`policy-guard.ts:94`) : un retrait `live:<k>` dont n_test dépasse `LIVE_N_MAX[horizon]` est refusé par son
   nom, après le contrôle de la cause, avant le veto et la borne de `u_test` (`:95`, l'ancienne `:94`, inchangée).
8. **Graphe servi inchangé** : `policy-table-file.ts` et `policy-projection.ts` sont servis (par `kata-path.ts`) ; ils n'importent ni
   `policy-retire.ts` ni `policy-wave2.ts`. `served_policy_modules_are_the_four_marginal_ones`, `guard_modules_are_not_served`,
   `w2_module_is_not_served` et `kata_tables_hold_no_row_tripwire` restent verts, sans changement.
9. **Ancres (F-3, réancrage au gel)** : `LIVE_N_MAX` décale `policy-wave2.ts` de +2 lignes à partir de la l.15, la borne décale
   `policy-guard.ts` de +1 à partir de la l.94, le contrôle d'épingle et la chaîne de `guardKataTable` (pliage) de +3 de plus à
   partir de la l.115 ; la grammaire des causes quitte `policy-guard.ts:93`. Neuf lignes `// killer:`
   ré-ancrées, texte visé inchangé : `policy-guard.test.ts` (`:122`, `:109`, `:102`, et `policy-retire.ts:53` pour
   `guard_adr_cause_under_decisions_only`), `policy-wave2.test.ts` (`:41`, `:36`, `:60` deux fois), `kata-path.test.ts` (`:128`). Les
   lignes d'import et l'en-tête de `policy-guard.ts` restent sur leurs numéros (la ligne vide entre imports et `GuardPins` est prise),
   pour ne décaler aucun des 20 tueurs (sur 25) qui visent les l.24 à 89 de ce fichier. `verifie-ancres.mjs --ref a43b0126` sur les six fichiers :
   77 tueurs, 77 ANCRE, 0 DERIVE, 0 PERDU ; sur tout le dépôt suivi : 1 456 ANCRE, 0 DERIVE, 0 PERDU (mesure d'avant le pliage).
   Les neuf tueurs ré-ancrés, tirés un à un au gel (`F:/tmp/dojo/ra-probe/fire-reanchored.mjs`, fichier restauré, sha256 égal) : 9 tués,
   7 par assertion, 2 hors assertion (`guard_adr_cause_under_decisions_only` par `policy-retire.ts:53`, `w2_guard_tail_m_and_support`
   par `policy-wave2.ts:36` : l'admission refusée lève hors `assert`). À la base (clone `--shared` à `a43b0126`,
   `F:/tmp/dojo/ra-probe/fire-base-clone.mjs`), leurs tueurs d'origine (`policy-guard.ts:93`, `policy-wave2.ts:34`) font de même :
   vert sans mutant, rouge hors assertion avec. Le classement est antérieur au lot (Q-R11).
   Au pliage, `verifie-ancres.mjs` n'a pas été retrouvé ; contrôle de remplacement en lecture seule, règle de `killerProblem` de
   `scripts/red-proof.mjs` (`F:/tmp/dojo/ra-fold/anchors.mjs`) : `policy-retire`, `policy-guard`, `policy-wave2`, `kata-path`,
   `policy-table-file` et `policy-projection.test.ts`, 78 tueurs, 78 ANCRE ; tout l'arbre (suivis et non suivis), 1 466 ANCRE,
   0 DERIVE, 0 PERDU. Les deux tueurs ré-ancrés de nouveau (`:122`, `:128`), tirés à la main au gel : tués par assertion.

## Tuyaux (règle de branchement)

- **Entrée** : les listes de retrait épinglées `retire-<YYYY-MM-DD>.json`, en chaîne datée ; producteur MONARK, au premier retrait
  (`adr:` à toute date ; `live:<k>` après E_1 = 2027-01-01, addendum 9 point 6). Aucune liste n'existe.
- **Sortie** : les entrées de la liste la plus récente, lue contre ses devancières, consommées par `guardKataTable` (recouvrement,
  puis G-2 sur chaque ligne). Aucun chemin servi : la garde est hors du graphe servi, et les 32 tables kata servies sont vides
  (`kata_tables_hold_no_row_tripwire`).
- **État** : `apps/harness/data/kata/retire/retire-<YYYY-MM-DD>.json` (Q-R2) ; sa publication dans le dossier daté est à R-b (F-1).
- **Tests de composition** (en processus, sans LLM, par `guardKataTable`) :
  - `retired_row_matches_projection_under_pinned_list` : ligne retirée admise avec sa liste ; refusée sans liste, avec la liste
    d'une autre cause, avec la liste d'une autre case, ligne listée laissée en région ; table d'une autre classe inchangée. Le
    lecteur sur ce chemin (M-1) : épingle qui n'est pas l'empreinte des octets (empreinte fixe, ou octets d'une autre liste sous
    l'épingle de celle-ci) refusée ; `live:1` sur une liste du 2026-12-31 refusée (E_1 après la date de la liste). G-2 sur la
    ligne recouverte : `live:1`, n_test 100, k_test 0 et son u_test exact, refusé à `policy-guard.ts:95` (le veto ne tire pas).
  - `retire_lists_chain_through_the_guard` : chaîne admise, la plus récente s'applique ; liste ultérieure vide après une liste qui
    retirait la ligne, refusée par le cumul, la table portant la ligne retirée comme la ligne revenue en région ; dates non
    croissantes refusées ; épingle du registre contrôlée avant toute lecture de liste (m-2).
- **Règle du cumul (M-2, option (a) retenue par MONARK)** : « une ligne retirée ne revient jamais » (brouillon §4.1, R-T5) a pour
  consommateur `guardKataTable`, qui lit la chaîne (construction 6) ; une liste qui perd un retrait antérieur est refusée quel que
  soit le statut de la ligne dans la table (ajout de RECHERCHES). Raison : CLAUDE.md §3 (Branchement), une pièce n'est « built »
  que si un chemin servi la consomme sous un test d'intégration non-LLM. La règle va donc dans la pièce que le chemin servi
  appellera : `guardKataTable` est la garde d'import que le chargeur des lignes engagées (E-2a) appellera avant de servir une table
  kata. Placée dans un pas de CI (option b) ou dans la porte de publication de R-b (option c), elle resterait hors de tout chemin
  servi, même après E-2a. Aujourd'hui, la garde n'est pas encore servie (ci-dessus) : R-a reste « upcoming » jusqu'à E-2a.
- **Tuyaux absents** :
  - le chemin servi : le chargeur d'E-2a qui appelle `guardKataTable` avec `retireLists`, lues de `apps/harness/data/kata/retire/`
    seul, en ordre de date, chaque épingle venant d'une épingle versée (Q-R7). Déclencheur : le G0 d'E-2a ; test d'intégration du
    chemin servi à ce lot ;
  - le pas de CI qui appelle `guardKataTable` sur les tables kata engagées (brouillon §4.4, Q-E4), qui n'existe pas (mesure 3
    ci-dessus). Déclencheur : le premier fichier de table kata engagé (E-2a, Q-R7 ci-dessous).

  D'ici là, R-a n'est « built » dans aucun registre public.

## Preuve rouge

- Les 10 tests (9, plus `retire_lists_chain_through_the_guard` au pliage) sont dans le fichier neuf
  `apps/harness/test/policy-retire.test.ts`, qui importe `policy-retire.ts` : à la base, le fichier ne se charge pas (`new-module`,
  module ajouté par le lot).
- La logique est rouge à la base au-delà du module absent (mesures 1 et 2) : table à ligne retirée refusée (R-T2 à R-T5), 2 209 et 553
  admis (T-E7), aucun export `LIVE_N_MAX`.
- **R-T6 est une épingle déclarée** : `guardCalibChain` ne change pas ; la parente (ligne retirée bâtie par le recouvrement) est neuve.
  Le tueur réel `policy-wave2.ts:60` remplace le tueur « à la main » du brouillon.
- Les admissions passent par `admit()` : une ligne refusée fait échouer le test par assertion. Au premier passage, 4 des 9 tueurs
  tuaient sans assertion (erreur de la garde hors `assert`), ce que `scripts/mutants/run.mjs` compte « non conclu » ; corrigé, 9 sur 9
  tuent par assertion ; au pliage, 10 sur 10.
- Preuves antérieures : constructeur (graine 11, 9 tirés, `RED-PROOF.json` `5631d192929b…`, gel `3f8473ea5b54…`), vérification
  (graine 23, `607c62fdfd2c…`). Au pliage : `node scripts/red-proof.mjs --base a43b0126 --gel F:/Monark-wt-ra --draw 10 --seed 29
  --out F:/tmp/dojo/redproof-ra-fold` (2026-10-06T22:09:38Z à 22:10:18Z, Node v24.21.0, sortie 0, `RED-PROOF.json` sha256
  `ebef8e728d47…`, digest du gel `50aabc61b1ec…`, chaque tueur `assert-fail`, fichier restauré), dernières lignes :

```
killer killed       apps/harness/src/policy-projection.ts:135 CONST (retire_overlay_touches_five_columns_only)
killer killed       apps/harness/src/policy-retire.ts:65 CONST (retire_list_reader_closed)
killer killed       apps/harness/src/policy-retire.ts:83 CONST (retired_row_stays_current_and_is_never_revived)
killer killed       apps/harness/src/policy-table-file.ts:52 CONST (retired_row_matches_projection_under_pinned_list)
killer killed       apps/harness/src/policy-wave2.ts:60 CONST (retired_parent_digest_is_written_form)
killer killed       apps/harness/src/kata-path.ts:94 CONST (retired_row_keeps_calibration_qhat_audit_only)
killer killed       apps/harness/src/policy-guard.ts:94 ROR (retire_live_n_test_bounded)
killer killed       apps/harness/src/policy-guard.ts:116 CONST (retire_lists_chain_through_the_guard)
killer killed       apps/harness/src/policy-wave2.ts:16 CONST (live_n_max_is_longest_quarter)
killer killed       apps/harness/src/policy-retire.ts:80 ROR (retire_live_entry_waits_for_its_quarter_end)
red-proof OK: 10 judged, 50 unchanged, 10 killer(s) drawn -> F:\tmp\dojo\redproof-ra-fold\RED-PROOF.json
```

- Mutants à la main du pliage (`F:/tmp/dojo/ra-fold/mut.mjs`, copie du lanceur de la vérification ; un à la fois, octets restaurés,
  sha256 égal), tous tués par assertion (ERR_ASSERTION) : lecteur contourné par un `JSON.parse` brut (`policy-guard.ts:116`, M1 de
  la vérification) ; exigence de région ôtée (`:93`, M8) ; chaîne ôtée, chaque liste lue sans devancière (`:116`) ; contrôle
  d'épingle du registre ôté (`:114` vidé : `SyntaxError` brute au lieu du refus nommé) ; veto forcé à vrai (`:95`) ; nom avec
  dossier admis (`policy-retire.ts:62`).

## Tueurs

| Test | Brouillon | Ce qu'il tient | Tueur |
|---|---|---|---|
| `retire_list_reader_closed` | R-T1 | liste admise ; 16 refus de forme et de registre ; épingle ; 3 octets non canoniques ; 5 noms de fichier, dont un avec dossier (m-5) | `policy-retire.ts:65 CONST "v === \"kata-retire-v1\"" -> "true"` |
| `retired_row_matches_projection_under_pinned_list` | R-T2 | admise avec sa liste ; refusée sans liste, avec une autre liste, avec la liste d'une autre case ; autre classe inchangée ; par la garde (M-1) : épingle hors empreinte (deux cas), `live:1` daté du 2026-12-31, veto qui ne tire pas (n_test 100, k_test 0, u_test exact) | `policy-table-file.ts:52 CONST "retireOverlay(row, retired.find(…))" -> "row"` |
| `retire_overlay_touches_five_columns_only` | R-T3 | recouvrement = ligne écrite à la main ; cinq colonnes ; `qhat`, `text`, `scores_sha256`, `current` refusés par leur nom | `policy-projection.ts:135 CONST "miss_bound: null, bound_on: null" -> "miss_bound: null"` |
| `retired_row_keeps_calibration_qhat_audit_only` | R-T4 | colonne `qhat` = B1 ; servi : `{up, down}`, `qhat` 1 sur `dir`, aucune région et `qhat` nul sur bande, `calib_retired`, `policy_row_sha256` de la ligne retirée | `kata-path.ts:94 CONST "{ ...at, reason: calib }" -> "{ ...at, qhat: row.qhat, reason: calib }"` |
| `retired_row_stays_current_and_is_never_revived` | R-T5 | cumul ; entrée perdue ou changée, même date refusées ; la ligne retirée reste `current` (l.447) | `policy-retire.ts:83 CONST "previous.entries.every(…)" -> "true"` |
| `retire_lists_chain_through_the_guard` | R-T5 dans la garde (M-2) | chaîne admise ; liste ultérieure vide refusée, ligne retirée ou revenue en région ; dates non croissantes refusées ; épingle du registre d'abord (m-2) | `policy-guard.ts:116 CONST "readRetireList(pin, registryBytes, prev)" -> "readRetireList(pin, registryBytes)"` |
| `retired_parent_digest_is_written_form` | R-T6 | empreinte de la parente retirée écrite `current` faux (l.444) ; forme servie refusée | `policy-wave2.ts:60 CONST "sha256Canonical(p)" -> "sha256Canonical({ ...p, current: true })"` |
| `retire_live_n_test_bounded` | T-E7 | 2 208 / 552 admis ; 2 209 / 553 refusés par la borne, k_test qui tire ou non ; liste aussi ; `adr:` inchangé ; ligne `silence` retirée refusée par G-2 (m-1) | `policy-guard.ts:94 ROR "(c.n_test ?? 0) <= (LIVE_N_MAX" -> "(c.n_test ?? 0) < (LIVE_N_MAX"` |
| `live_n_max_is_longest_quarter` | addendum 9 point 5 | durées des trimestres k = 1 à 8 par `Date.UTC` depuis 2026-10-01 : 92, 90, 91, 92, 92, 91, 91, 92 ; max 92 ; 92 × 24, 92 × 6 | `policy-wave2.ts:16 CONST "\"1h\": 2208" -> "\"1h\": 2209"` |
| `retire_live_entry_waits_for_its_quarter_end` | relecture §4 point 5 | `live:1`, `live:2`, `live:5` admis au jour de E_k, refusés la veille ; k géant refusé ; `adr:` sans trimestre | `policy-retire.ts:80 ROR "1) <= day" -> "1) < day"` |

Les tueurs tronqués (`…`) sont écrits en entier au-dessus de chaque test.

## Contrôles exécutés

- Les 38 fichiers `apps/harness/test/*.test.ts` : 269 tests, 269 verts (à la base : 37 fichiers, 260 tests, `git show a43b0126`).
  Au pliage (2026-10-06T22:07Z) : 270 tests, 270 verts, 0 échec, sortie 0.
- `npx --no-install tsc --noEmit` : 0 erreur. `npx --no-install eslint` sur les neuf fichiers changés : 0. Les six règles du cliquet
  (`lint-ratchet.json`) activées sur le test neuf : 0 violation. Au pliage : `tsc` sortie 0 ; `eslint` sur les neuf `.ts`, sortie 0 ;
  `node scripts/lint-ratchet.mjs` : 69/69, sortie 0.
- `node scripts/grep-forbidden.mjs` : OK, 347 fichiers. `node scripts/lang-gate.mjs` : OK. Au pliage : les deux OK, et
  `node scripts/export-public.mjs --check` : OK.

## R-25

- `git diff --shortstat a43b0126 -- . ':(exclude,glob)docs/**/*.md'` : `7 files changed, 40 insertions(+), 24 deletions(-)`, soit 64.
- Fichiers neufs comptés (non suivis, `wc -l`) : `policy-retire.ts` 85, `policy-retire.test.ts` 181, soit 266.
- **Total : 330** (≤ 1 150). Estimation du brouillon : ~230 ± 30 %. L'écart vient de ce qui n'y était pas : trois tests (T-E7,
  `live_n_max_is_longest_quarter`, la date), les refus ajoutés par la relecture et la mission (épingle, nom daté, date du trimestre,
  cumul), la grammaire des causes mise en commun, les neuf tueurs ré-ancrés (18 lignes) et `admit()` (8 lignes).
- **Au pliage** : même commande, `7 files changed, 49 insertions(+), 25 deletions(-)`, soit 74 ; `policy-retire.ts` 85,
  `policy-retire.test.ts` 211, soit 296. **Total : 370** (≤ 1 150) ; +40 pour la chaîne, le contrôle d'épingle, `assertRegistryPinned`
  et les assertions de M-1, M-2, m-1, m-2 et m-5.

## Lectures déclarées

1. **Comptes** : le lecteur tient la forme des comptes par cause et la borne ; l'arithmétique (veto binomial, `u_test` exact) reste à
   `guardKataRow` sur la ligne recouverte (`:95`), seule source de `vetoFires`. Le brouillon cite le refus « comptes hors règle » à
   `policy-guard.ts:94`. Raison : la garde reste la seule autorité sur les comptes (brouillon §4.2). R-T2 le tient sur le chemin
   composé (veto qui ne tire pas, refusé à `:95`).
2. **Date de la liste** : le jour du nom de fichier ; E_k égal à 00:00Z de ce jour est admis.
3. **Cumul** : chaque entrée de la liste précédente est reprise à l'identique (écriture canonique) ; la garde lit la chaîne épinglée
   de la plus ancienne à la plus récente, chacune contre sa devancière (construction 6) ; par récurrence, la plus récente porte tout
   retrait de la chaîne. La garde ne voit que la chaîne qu'on lui donne : une liste omise relève du chargeur (Q-R7).
4. **Essai courant** : `calibAttempt` de la case du registre ; le registre B1 n'en connaît qu'un, l'essai 1.
5. **Ordre des refus** : `guardKataTable` contrôle l'épingle du registre avant toute lecture de liste (m-2) ; des octets de registre
   hors épingle, JSON ou non, reçoivent le refus nommé de `policy-table-file.ts:48`, mot pour mot, avec ou sans liste (mesuré avant
   le pliage : une `SyntaxError` brute quand une liste était épinglée).

## Écarts au brouillon et à la mission

1. **Le recouvrement passe par un cinquième argument de `assertTableMatchesRegistry`, l'épingle par `GuardPins`**, pas par
   `ProjectionInputs` : `served_policy_modules_are_the_four_marginal_ones` lit les imports des modules servis comme du texte et fixe leur
   liste ; `policy-table-file.ts` est servi, et le lecteur importe `policy-wave2.ts`.
2. **Tueurs** : adresses du brouillon indicatives ; R-T2 vise `policy-table-file.ts:52` (pas `:56`), R-T6 reçoit un tueur réel.
3. **Un neuvième test**, `retire_live_entry_waits_for_its_quarter_end`, pour le refus de date demandé par la relecture (§4 point 5).
4. **La grammaire des causes quitte `policy-guard.ts`** pour `retireQuarter` (une source pour le lecteur et la garde) ; un tueur suit.
5. **Brouillon §2 point 2** : le refus mesuré d'une ligne retirée nomme `bound_on`, pas `status`.
6. **R-25** : 330 contre ~230 estimés, 370 au pliage (section R-25).
7. **Chaîne dans la garde (M-2, option (a))** : le brouillon et la première version de ce G0 laissaient l'enchaînement des listes
   datées à R-b ; la garde le fait (construction 6, Tuyaux).
8. **`assertRegistryPinned` double le contrôle de `policy-table-file.ts:48`** au lieu de le remplacer : la l.48 reste pour tout
   appelant direct (aujourd'hui `policy-table-file.test.ts` seul, `git grep`), et son tueur (`policy-table-file.test.ts:52`) reste
   ancré ; un seul libellé, par le même `fail`.

## Questions (défaut entre parenthèses)

- **Q-R7** : le pas de CI qui garde les tables kata engagées contre le registre et la chaîne des listes épinglées. Chaque sha256
  d'épingle vient d'une épingle engagée, jamais du hachage des octets qu'elle contrôle (m-5) ; le chargeur lit les listes dans
  `apps/harness/data/kata/retire/` seulement, toutes, par ordre de date, et passe à la garde leur nom nu (`retire-<YYYY-MM-DD>.json`)
  et la chaîne entière. (Lot E-2a, déclencheur : premier fichier de table kata engagé.)
- **Q-R8** : trois cas d'une ligne enfant (`calib_attempt` 2), aucun possible aujourd'hui (`calibAttempt: lit([1])`,
  `policy-projection.ts:43`) : (1) clé de tri quand un enfant d'une ligne retirée sera retiré à son tour (deux entrées pour une case,
  cumul) ; (2) l'entrée de l'essai 1 reprise telle quelle après qu'un enfant existe heurte le contrôle d'essai courant
  (`policy-retire.ts:75`) ; (3) addendum 9 point 2 : un enfant n'est compté qu'à partir du premier trimestre Q_k dont S_k est à ou
  après la fin de ses données de calibration, ce que le lecteur ne contrôle pas (m-4). (Les trois avec la généralisation de E-1c,
  même déclencheur ; clé étendue à (`task_class`, `cell_key`, `calib_attempt`) ; R-a garde la clé du brouillon.)
- **Q-R9** : liaison de `evidence_sha256` au relevé des comptes LIVE. (Forme seule dans R-a ; la liaison est à CM-5-PLAN-1, déclencheur :
  premier retrait `live:`, après 2027-01-01.)
- **Q-R10** : précision datée de CONTRACT l.492 (F-2 : la phrase est à la l.492 de `ffb5ea3`, la l.493 est le bloc `recompute`).
  (Texte de F-1, « … and of the retire list published in the same dated directory », porté par R-b à la prochaine révision datée.)
- **Q-R11** : les deux tueurs existants qui tuent hors assertion (point 9 de la construction) ; `scripts/mutants/run.mjs` les compte
  « non conclu ». Les corriger change le corps de deux tests anciens, verts à la base : hors de la preuve `f2p` de ce lot. (Item proposé
  KILLER-ASSERT-KILL-1, lot `red-proof: test-only` qui passe leurs admissions par une assertion ; déclencheur : la G2 de R-a.)

## Hors champ

- R-b : écrivain par dossier daté, carte servie, entrée de release, latence (T_a à T_g), la liste publiée dans le dossier daté (F-1).
- Le texte servi d'une ligne retirée (Z-3, E-2a, Q-R5), la table mixte (E-1), la production des comptes LIVE (CM-5-PLAN-1).
