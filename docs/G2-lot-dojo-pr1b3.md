claude-opus-5-5[1m]

# G2 — relecture adversariale du G1 de PR-1b-3 (MONARK Dōjō : balise publique et lectures sur l'ancre, le snapshot, le marcheur et le vérificateur)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Relecteur G2, instance fraîche, distincte du générateur ; effort high (mission).
- **Mission** : `F:/tmp/dojo/mission-g2-pr1b3.md` (15 l., sha256 `60e991dbc4a61ed7566b61a2876bcf0517b1a36b1ab34218853cfe287678f023`), horodatage 2026-09-27T07:45Z. Horloge de la machine (`date -u`) à l'ouverture : **07:36:35Z**, soit avant l'horodatage de mission (même écart que le G1) ; toutes les heures ci-dessous sont celles de `date -u`.
- **Objet** : worktree `F:/Monark-wt-dojo-1b3`, branche `lot/dojo-pr1b3`, HEAD `02884eb`, fichiers non committés du G1 ; ADR de lot `docs/adr/ADR-DOJO-PR-2.md` (sha256 `397e6d4c…6267a1`, 411 l.), qui fait foi ; mère `ADR-DOJO-SNAPSHOT-1.md` (`fc93f66c…d35078`).
- **Discipline** : aucun git écrivant dans le worktree (`status`, `diff`, `log` seuls) ; aucun réseau ; rien écrit sur C: ; rejeux sur mon clone `F:/tmp/dojo/g2-pr1b3/clone` et sur des copies sous `F:/tmp/dojo/g2-pr1b3/` ; suite complète puis test 42 sous le verrou d'hôte `F:/tmp/oracle-lock` (propriétaire « G2 PR-1b-3 »), processus node relevés à la prise et au rendu (C-V-4) ; clones et livrables du G1 intacts (sha256 relus, §7).

## 0. Verdict

**CORRECTIONS D'ABORD.** Le code livré est conforme au D-5, au D-8 et au D-10 sur tout ce que l'ADR écrit (§2), R-25 = 273 rejoué, 60/60, r_d et les quatre instants recalculés à la main égaux au test, les 14 mutants du G1 rejoués tombent (14/14, `RESULTS.txt` identique octet pour octet à celui du G1), et 46 de mes 54 mutants et sondes tombent par le test visé. Mais les trois décisions de l'orchestrateur Q-6, Q-7 et Q-9 demandent du code que le lot n'a pas (sondes B-3, B-3b, B-4, B-2, B-1 : acceptées aujourd'hui), et trois sondes de la mission survivent faute de test (doublon d'instants perdu ; emplacements d'une lecture manquée ; jour compté sans balise ni lectures). Corrections **C-G2-1 à C-G2-6 bloquantes**, toutes **prototypées sur copie** (`F:/tmp/dojo/g2-pr1b3/fix/`, patch `fix-patch.mjs`) : 60/60, `tsc` 0, `eslint` 0, `lang-gate` OK, 56/58 mutants tués (les deux survivants gardent le refus, §4), **R-25 mesuré sur la copie corrigée : 302 ≤ 304,5** (×2,08 ; marge 2,5).

## 1. État

- **Worktree** (07:36:35Z, relu à 08:25:14Z) : ` M` `apps/dojo/scripts/dojo-chain.d.mts`, `dojo-chain.mjs`, `dojo-verify.d.mts`, `dojo-verify.mjs`, `apps/dojo/test/dojo-chain.test.ts`, `dojo-verify.test.ts`, `apps/dojo/test/helpers/dojo-fixture.ts` ; `??` `docs/G1-lot-dojo-pr1b3.md` (sha256 `6d44f391e76b1d11573e1e35447ae9efde8166e5612ce2ad6d2de046c335f628`) : conforme à l'annonce. HEAD `02884eb`. Les sept fichiers ont les sha256 du §3 du journal G1 aux deux relevés.
- **Livraison du G1** : `sha256sum -c DELIVERED.sha256` : 16/16 OK.

## 2. Table des dix points

| # | Point | Verdict | Constat |
|---|---|---|---|
| 1 | R-1 | conforme | Première ligne du journal G1 et de ce rapport : `claude-opus-5-5[1m]`. |
| 2 | R-25 | conforme | **273** rejoué (§3.1), base `02884eb`, pathspec extrait de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` par script : `7 files changed, 244 insertions(+), 29 deletions(-)` ; ventilation égale au journal ; journal G1 exclu (`docs/G1-lot-*.md`). 273 / 145 = ×1,88 ≤ ×2,1 (304,5). Copie corrigée : **302**. |
| 3 | Tests rejoués et lus | conforme, avec lacunes (C-G2-4, C-G2-5) | 60/60 sur mon clone (07:38:11Z → 07:38:20Z) ; 34/34 dans les copies de mutants ; les quatre tests nommés lus en entier. Recalcul à la main (`node:crypto` seul, §3.2) : r_d = **32 698 612**, instants 03:08:57, 09:42:29, 18:02:34, 22:46:37 UTC du 2026-10-02 : égaux au test et à l'oracle Python du G1. Les trois tests existants retouchés le sont pour les seuls motifs du journal §5 (diff relu : jour retiré 5 → 10 ; sept snapshots au lieu de trois ; `versionAt` → `versionBody` aux deux appels ; imports), aucune autre assertion existante modifiée. |
| 4 | Mutants et sondes | **non conforme** (C-G2-1 à C-G2-5) | G1 rejoué : 14/14. Mes remplacements : 54, 46 tués par le test visé (dont 4 par exception de `dojo-core`, déclarés), 8 survivent (§4). Sondes de comportement : 17 (§3.3), dont 5 acceptées contre Q-6, Q-7, Q-9. |
| 5 | D-5, D-8, D-17, D-10 | conforme au texte, Q-6/Q-7/Q-9 manquants | Aucun code nouveau (`DOJO_VERIFY_REFUSALS` et `DOJO_WALK_REASONS` hors du diff) ; `detail` émis ∈ {`read_rule`, `beacon`, `instant`, `read_at`, `usd_per_sol`, `reads`, `pool_price_daily`, `usd_per_sol_daily`} ; `beacon_bls_verified: false` présent et asserté ; `read_rule` à 8 clés fermées et valeurs fixées (900, 600, 165, schéma) ; fraîcheur à deux bornes (D-3 l.134) ; lecture manquée à instant et nuls (D-8 l.188). Q-2 : la phrase sur β altérée manque au rapport JSON (C-G2-6). |
| 6 | Hygiène | conforme | Aucun fournisseur nommé dans les lignes ajoutées (seul « Python » répond à `pyth`) ; constantes de la balise = FAITS PR-2 l.55 octet pour octet (relu), `period`/`genesis_time` = rapport l.156, règle de ronde = rapport l.84 ; imports ajoutés : `beaconRound`, `dayMinimum`, `readInstants` de `dojo-core` et un `import type` ; `dojo-core.*`, `package*.json`, `tsconfig.json`, `apps/bell/**`, `docs/adr/**` : `git diff --stat HEAD` vide. |
| 7 | Journal G1 | conforme | §0 à §14 présents ; sha256 des fichiers, de l'ADR (`397e6d4c…`), des FAITS (`3b86f76b…`), du rapport (`a8686e58…`), de l'oracle (`c8650e71…`), de `RESULTS.txt` (`2527a580…`) et des logs de l'oracle G1 (`4b9433e3…`, `c9e0fd22…`, six autres) relus égaux ; `exits.txt` 7/7 à 0 ; `test.log` 1 391 / 1 389 / 0 / 2 skipped. Aucune affirmation fausse trouvée. |
| 8 | Tuyaux | conforme | Journal §10 : `read_rule`, `beacon`/`reads` et vérificateur amendé non branchés (aucune ancre publiée, TU-1c absent, `dojo_collect_to_verify_end_to_end` de PR-2-2 à venir) ; la pièce reste `upcoming`. |
| 9 | Q-6, Q-7, Q-9 | corrections rédigées (§5) | C-G2-1 (Q-6), C-G2-2 (Q-7), C-G2-3 (Q-9), avec fichier:ligne, texte attendu, test et mutant, prototypés et mesurés. |
| 10 | Forme | conforme | 0 CR (octets comptés) et LF final dans les 7 fichiers et le journal ; aucun caractère hors ASCII dans les 7 fichiers, donc dans les noms de test ; vocabulaire sobre (`garanti|guarant|certif` : 0 ; « Promise » = type TS). |

## 3. Rejeux

### 3.1 Clone et R-25

- `git clone --no-local F:/Monark-wt-dojo-1b3 F:/tmp/dojo/g2-pr1b3/clone` (07:37:49Z), `02884eb` ; sept fichiers copiés, `cmp` égal ; journal G1 copié non suivi ; `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0` (retiré en fin de passe par `rm-nm.ps1 -Tree`).
- `r25-g2.sh` (sha256 `0b1a1e26…d866`) = celui du G2 de PR-2-1 au dossier près : `tokens: 20`, `STAT: 7 files changed, 244 insertions(+), 29 deletions(-)`, **273** (`r25-clone.log` `80301463…3816`). Copie corrigée : `7 files changed, 264 insertions(+), 38 deletions(-)`, **302** (`r25-fix.log` `68869698…a835`) ; par fichier : `dojo-chain.mjs` 21, `dojo-verify.mjs` 56, `dojo-chain.test.ts` 37, `dojo-verify.test.ts` 125, autres inchangés.

### 3.2 Recalcul à la main (`hand.mjs`, `node:crypto` seul, sha256 `2c438d5c…4017` ; sortie `hand.log` `4ff6dd19…21a7`)

- T_d = 1 790 899 200 (2026-10-02T00:00Z) ; T_d − 1 692 803 367 = 98 095 833, divisible par 3 : chaque minuit ouvre une ronde (rapport l.84), donc « r_d − 1 » est la dernière ronde de la veille ; r_d = 98 095 833 / 3 + 1 = **32 698 612** = 32 554 612 + 5 × 28 800.
- g_d = H^39(SHA-256(« dojo-fixture-seed »)) = `1c92af33…fbf154` ; β = `a3a66f18…d8a4e9` (premier octet `a3` : 0x80 posé, 0x40 nul) ; restes mod 85 500 : 64 054, 34 049, 81 097, 10 437 ⇒ triés 03:08:57, 09:42:29, 18:02:34, 22:46:37 UTC : égaux au test (`dojo-verify.test.ts`, cas épinglé) et à `oracle.py`.

### 3.3 Sondes de comportement (copie `probe/`, `g2-probe.test.ts` `44661f88…2e96`, sortie `probe.log` `a12cea51…0a0c`)

| Sonde | Aujourd'hui | Attendu (décision) |
|---|---|---|
| B-1 ancre K = 256 | marcheur OK ; vérificateur `timeline_malformed @3 reads` | refus à l'ancre (Q-9) |
| B-2 jour de fenêtre `abstained` avec balise et K lectures | **ok** | refus (Q-7) |
| B-2b jour de fenêtre abstenu sans balise ni lectures | `price_version_mismatch @10 pool_price_daily` | idem |
| B-3 v2 publiée FIRST+8 02:00, fenêtre FIRST+2..FIRST+8 (cas M-4 existant) | **ok** | refus (Q-6) |
| B-3b v1 publiée FIRST+6 02:00, avant la fin de sa fenêtre et avant le snapshot FIRST+6 | **ok** | refus (Q-6) |
| B-4 v1 publiée FIRST+7 00:30, après la fin de fenêtre, placée avant le snapshot FIRST+6 | **ok** | refus (Q-6, snapshots avant la version) |
| B-5 β synthétique à instants en doublon (compteur 8 962 ; 17:54:34 deux fois) | ok | ok (D-5 l.152 : doublons gardés) |
| B-6/B-6b lecture manquée avec `slot_min` / `slot_max` | `timeline_malformed @3 reads` | idem (non testé : C-G2-5) |
| B-7 lecture manquée avec SOL/USD et heure | `timeline_malformed @3 reads` | idem |
| B-8 jour compté, balise null, `reads` vide | `timeline_malformed @12 beacon` | idem (non testé : C-G2-5) |
| B-9 jour abstenu, balise null, K lectures | `timeline_malformed @12 beacon` | idem |
| B-10 jour abstenu pour le mint, balise et K lectures, hors fenêtre | ok | ok (Q-5) |
| B-11 `scope` | « …; the beacon's BLS signature is not verified », `beacon_bls_verified` false | Q-2 : dire β altérée ⇒ instants (C-G2-6) |

## 4. Mutants (harnais `g2-mutants.mjs` `908ea30c…0e8`, listes `g2-list.mjs` → `g2-mutants.json` `8d6f7b10…cfaee`)

Remplacements exacts, compte d'occurrences contrôlé, copies sous `mut/<id>/` ; tué = « not ok » du test visé (« * » : n'importe lequel) ; « par exception » = l'échec du test visé porte une erreur `dojo/core:` et non un refus nommé. Témoin : exit 0, 34 ok. Sources du clone inchangées après chaque passe (`golden unchanged: true,true`). Node v24.15.0.

- **G1 rejoué** (`mutants-g1-replay.mjs` = harnais du G1 aux trois chemins près ; 07:53:48Z → 07:56:58Z) : **14/14**, `mut-g1/RESULTS.txt` sha256 `2527a580…7152`, égal à celui du G1.
- **Mes 54** (07:45:43Z → 07:53:40Z ; `mut/RESULTS.txt` `952b8dd6…620f`) : **46 tués** par le test visé :
  - marcheur (12/12) : M-K3a (contrôle retiré), M-K3b (`read_offset_s` quelconque), clé en trop admise, clé de 95 octets, clé en capitales, hash non contrôlé, schéma non contrôlé, genèse négative, période 0, tolérance ≥ 600, fraîcheur ≥ 165, `detail` renommé ;
  - balise et instants : M-20a, M-20b, M-21c (instants d'une β fixe), clés de `beacon` ouvertes, M-22a, M-22b (r_d ± 1), M-22c (r_d − 1 exigée), `reads` de K − 1 admis (`>` au lieu de `!==`), clés de lecture ouvertes, fraction non réduite, SOL/USD sans heure, `read_at` avant l'instant, `read_at` au-delà de 600 s, `publish_time` > `read_at` ; **par exception de `dojo-core`** (déclaré, comme M-21 au G1) : M-21a (bit d'infini), M-21b (bit de compression), β de 47 octets admise par la forme, jour antérieur à la genèse non refusé par nom ;
  - fraîcheur : M-23a, M-23b, M-23c (âge compté depuis `read_at`) ;
  - valeurs journalières : M-24a à M-24f (contrôle retiré ; série SOL/USD ; jour sans snapshot sauté ; jour à prix nuls admis ; première lecture au lieu du minimum ; fenêtre décalée d'un jour) ;
  - `detail` et rapport : P-1 à P-6 (`read_at`, `detail` du marcheur perdu, ronde, `usd_per_sol`, `reads`, `beacon_bls_verified` vrai).
- **8 survivants** :

| Id | Mutation | Lecture |
|---|---|---|
| **S-dup-lost** | instants recalculés dédoublonnés (`new Set`) | **lacune** : aucun jour de la fixture n'a de doublon ; un vérificateur qui perd un doublon refuserait un jour valide (sonde B-5) ⇒ C-G2-4 |
| **S-K256** | `k > 255` retiré | **lacune** : aucun test à K = 256 ⇒ Q-9, C-G2-3 |
| **S-missed-slot-min / -max** | lecture manquée à emplacement admise | **lacune** : seul `pool_price` est testé (Q-8 exige les quatre nuls) ⇒ C-G2-5 |
| **S-status** | balise null admise pour un jour compté sans lectures | **lacune** : le cas « jour compté sans balise » garde ses K lectures (refusé par la longueur) ; Q-5 ⇒ C-G2-5 |
| S-absent-reads | jour abstenu, balise null, K lectures : refusé `reads` au lieu de `beacon` | refus gardé, `detail` seul change ; non bloquant (C-G2-7) |
| S-missed-usd | lecture manquée à SOL/USD admise par la forme : refusée `read_instant_mismatch usd_per_sol` au lieu de `timeline_malformed reads` | refus gardé, code change ; non bloquant (C-G2-7) |
| P-8 | phrase de `scope` sur la BLS retirée | non assertée ; C-G2-6 l'asserte |

- **Copie corrigée** (`G2_SRC=…/fix`, `g2-list-fix.mjs` → `g2-mutants-fix.json` `550fa670…41fc`, 58 mutants : les 52 applicables et six mutants des corrections ; ≈ 08:01Z → 08:11:55Z ; `mut-fix/RESULTS.txt` `e554802d…050b`) : **56/58 tués**, dont S-dup-lost, S-status, S-missed-slot-min/-max, F-Q6w (contrôle de temps du marcheur retiré), F-Q6v (filtre `seq` retiré), F-Q7 (clause de statut retirée), F-Q9 (borne 255 retirée), F-Q9b (255 refusé), F-Q2 (phrase retirée) ; survivants : S-absent-reads, S-missed-usd (refus gardés, ci-dessus).

## 5. Corrections

Les numéros de ligne sont ceux du worktree (livraison du G1) ; le texte attendu est celui de la copie `fix/` (diff complet `fix.diff`, sha256 `3d17d1a8…af18`, contre `02884eb`). Tests : 60/60 (`fix-tests.log` `70424be5…9a37`) ; `tsc` 0 ; `eslint` des trois fichiers de test 0 ; `lang-gate` OK.

- **C-G2-1 (bloquante ; Q-6 : version après sa fenêtre et après ses sept snapshots)**.
  - `apps/dojo/scripts/dojo-chain.mjs:78` → `if (eff <= first + st.anchor.price_window_days - 1 || !(instantOf(l.published_at) >= (first + st.anchor.price_window_days) * DAY_MS)) return "price_version_mismatch";` ; commentaire l.71 : « published after its window's end (Q-6 of PR-1b-3) ». Bell ne contrôle pas `published_at` (`grep` : 0 occurrence dans `bell-chain.mjs`) et `versionCheck` non plus aujourd'hui : le texte attendu ajoute `|| instantOf(l.published_at) === null` à la ligne `timeline_malformed` de `versionCheck` (l.75-77, comme `snapshotCheck` avec `t === null`), sans quoi une date mal formée sortirait en `price_version_mismatch` (écart au prototype, qui ne l'a pas). Code existant, sens étendu comme à la mère l.970 (jour d'effet ≤ dernier jour de fenêtre ⇒ `price_version_mismatch`, « étendu ») : **ligne d'emploi à ajouter à cette table au pli** (acte de l'orchestrateur).
  - `apps/dojo/scripts/dojo-verify.mjs:215` → `m = s === undefined || s.seq > v.seq || s.status !== "counted" ? null : dayMinimum(…)` (partie `s.seq > v.seq` ; la clause de statut est C-G2-2) ; commentaire l.210 : « counted and before the version (Q-6, Q-7 of PR-1b-3) ». Même code et même `detail` (`pool_price_daily`) qu'un jour sans snapshot.
  - Tests : `dojo-chain.test.ts` après l.214 : `published_at = at(FIRST + 6, 23.5)` ⇒ `refused(10, "price_version_mismatch")` ; `at(FIRST + 7, 0)` ⇒ `OK` (borne). `dojo_verify_daily_values_follow_the_snapshot_reads` : « Q-6 a version before the snapshot of its window's last day » (v1 déplacée avant le snapshot FIRST+6) ⇒ `price_version_mismatch @9 pool_price_daily`.
  - **Deux tests existants à réécrire (pas un)** : (i) `dojo_verify_refuses_a_price_version_on_history_days` l.153-157 : la version y est publiée `at(FIRST, 0.75)` avant ses snapshots ; le cas témoin `tl(FIRST)` « ok » tombe, et `tl(ANCHOR_DAY)` serait refusé par le nouveau contrôle de temps et non plus par DOJO-WALK-GAPS-1 (a) (même chaîne `price_version_mismatch @3`, autre cause). Texte prototypé : version publiée `at(first + 7, 0.75)` (après sa fenêtre) ; le témoin placé après ses sept snapshots (`tl(FIRST, true)`), ainsi (a) reste le contrôle exercé des deux cas refusés. (ii) M-4 de `dojo_verify_refuses_each_named_mutant` l.347 et l.354-355 : v2 est publiée avant la fin de sa fenêtre. **Choix à trancher par l'orchestrateur** : avec Q-6 et un jour d'effet égal à `first + 7`, aucun snapshot postérieur à v2 n'a un jour antérieur à son effet ; « publiée, pas encore en vigueur » n'est observable que si `effective_day` > `first + 7`, ce que le marcheur admet (borne basse seule, journal PR-1b-1 Q-5) mais que D-17 (« le lendemain de la fenêtre ») pourrait fermer. Option C (prototypée, verte) : `v2 = { ...versionBody(2, FIRST + 2, at(FIRST + 9, 2)), effective_day: dateOf(FIRST + 10) }`, `s4 = [...f.steps, v2, snapshot(FIRST + 9, seed(10), 1)]`, lignes du seq 14 sous v2 ⇒ `threshold_mismatch @14`. Option A (sans laxité) : v2 publiée `at(FIRST + 9, 2)` après tout, lignes du snapshot FIRST+8 (seq 12, jour antérieur à l'effet, **placé avant v2**) sous v2 ⇒ refus attendu ; elle ne tue plus le mutant « dernière version vue » que visait M-4, déjà couvert par « version 1 applied to a day before it ».
  - Écart à dire : le cas du marcheur `dojo-chain.test.ts:229-230` (« published before the snapshot of the window's last day, which it does not cover » ⇒ `OK`) reste vert au marcheur (v1 publiée après la fin de fenêtre) mais décrit une chronologie que le vérificateur corrigé refuse. Soit le libellé devient « the walker leaves the order to the verifier », soit le marcheur contrôle aussi l'ordre (`st.last` ≥ `first + 6`, même code ; le cas passe à `refused(10, "price_version_mismatch")`). Non prototypé ; à trancher.
  - Mutants proposés (noms à fixer au pli) : marcheur, contrôle de temps retiré (F-Q6w, tué par `dojo_walk_price_version_takes_effect_after_its_window`) ; vérificateur, filtre `seq` retiré (F-Q6v, tué par `dojo_verify_daily_values_follow_the_snapshot_reads`).
- **C-G2-2 (bloquante ; Q-7 : jour de fenêtre abstenu)** : `dojo-verify.mjs:215`, clause `s.status !== "counted"` (texte ci-dessus) ; test « Q-7 a window day abstained, its beacon and reads kept » (`body(s, 4).status = "abstained"`) ⇒ `price_version_mismatch @10 pool_price_daily` ; mutant F-Q7 (clause retirée) tué.
- **C-G2-3 (bloquante ; Q-9 : K ≤ 255 à l'ancre)** : `dojo-chain.mjs:55` → `[l.k_reads, l.horizon, l.validation_days].every(count) && l.k_reads <= 255 && positive(…)` ; commentaire l.51 : « k_reads <= 255, byte(i) (ADR-DOJO-PR-2 D-5 l.152; Q-9 of PR-1b-3) ». Refus `timeline_malformed` sans `detail` (comme `k_reads` = 0 aujourd'hui) : `k_reads` n'est pas un nom de la liste fermée des `detail` ; l'alternative que la décision permet (`detail` `read_rule`) nommerait un champ qui ne porte pas la faute. `dojo-verify.mjs:119` : retirer `|| k > 255` devenu inatteignable (sinon mutant équivalent), commentaire « K <= 255: the anchor's (walker) ». Tests : `dojo_walk_refuses_malformed_fields` l.242-243, cas `[0, "k_reads", 256]` ⇒ `refused(1, "timeline_malformed")`, plus `k_reads = 255` ⇒ `OK`. Mutants F-Q9 (borne retirée) et F-Q9b (255 refusé) tués.
- **C-G2-4 (bloquante ; sonde « doublon d'instants perdu »)** : `dojo_verify_recomputes_the_read_instants`, cas « duplicate instants kept (D-5 l.152) » : β **SYNTHETIC** `98ed72ad771288c9c6fbbc9cde6e100d62c4d4d1050b8b94510e8028c5b0016d6e534dfcf4b0b98a51dcde6ac8d17f87`, dérivation à écrire en commentaire du test : SHA-256(« g2-dup-8962 ») ‖ SHA-256(« g2-dup+8962 »), 48 premiers octets, octet 0 masqué `& 0x3f | 0x80`, compteur cherché jusqu'à ce que deux des quatre instants du jour de lecture 1 coïncident (17:54:34 deux fois), instants recodés par `instantsOf` de la fixture (jamais le module), `read_at`/`publish_time` suivis, `new Set(t).size === 3` asserté ⇒ `ok`. Tue S-dup-lost. `instantsOf` ajouté aux imports du test.
- **C-G2-5 (bloquante ; Q-8 et Q-5 confirmés, non testés)** : même test, cas « a missed read with slot_min » et « with slot_max » ⇒ `timeline_malformed @3 reads` ; cas « a counted day without beacon nor reads » ⇒ `timeline_malformed @3 beacon`. Tuent S-missed-slot-min/-max et S-status.
- **C-G2-6 (bloquante sous mon interprétation de Q-2, « à dire dans le rapport JSON »)** : `dojo-verify.mjs:309`, `scope` complété : « …; the beacon's BLS signature is not verified: an altered signature of valid form is refused as its instants » ; assertion l.289 : `[beacon_bls_verified, scope.endsWith("refused as its instants")]` = `[false, true]`. Tue F-Q2 (et P-8). Si l'orchestrateur entendait le seul `beacon_bls_verified: false` déjà présent, C-G2-6 tombe.
- **C-G2-7 (non bloquante)** : S-absent-reads et S-missed-usd gardent le refus avec un autre `detail`/code ; deux cas de plus les tueraient (≈ +2 lignes) ; la marge R-25 (302 sur 304,5) plaide pour les laisser.
- **À consigner au pli (actes de l'orchestrateur, pas du code)** : Q-3 (ligne datée C-V-1 (b) : `detail` `reads`, et `pool_price_daily`/`usd_per_sol_daily` émis par le contrôle journalier) ; Q-10 (ligne datée du §4 PR-1b-3 : trois retouches du G1, plus les deux réécritures de C-G2-1) ; emploi étendu de `price_version_mismatch` à la mère l.970 (C-G2-1) ; Q-5 transmis au G0/G1 de PR-3a-1 ; choix M-4 (option A ou C) et cas `dojo-chain.test.ts:229-230`.

## 6. Oracle (sept gates sur mon clone non modifié, sous verrou) et test 42

- Scripts : `g2-locked.sh` (`974a046e…5e00`) = `g2-pr2-1/g2-locked.sh` au propriétaire près (« G2 PR-1b-3 ») ; `g2-run-oracle.sh` (`0bce133e…2ade`) = celui de PR-2-1 au dossier près ; `g2-oracle-all.sh` (`c29f4cab…b165`) : `tasklist` node avant et après ; `g2-t42.sh` (`3df4d724…739c`).
- **Sept gates** : verrou pris **après 120 s d'attente** (tenu par une autre piste), 08:14:07Z → 08:21:13Z ; `exits.txt` (`3943c3b3…65d5`) : 7/7 exit 0 ; `test` : **1 391 tests, 1 389 pass, 0 fail, 2 skipped** (préexistants), les quatre tests nommés ✔ ; `test.log` `a4abd231…5d94` ; `gate-vocab`, `typecheck`, `lint`, `lint-ratchet`, `lang-gate`, `export-check` : sha256 égaux octet pour octet à ceux du G1. Processus node (C-V-4) : 22 à la prise (08:14:07Z), les mêmes 22 PID au rendu (08:21:12Z) : aucun processus laissé par la passe.
- **Test 42 à part** : verrou repris sans attente 08:21:30Z → 08:25:07Z ; exit 0, `tests 2, pass 2` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 216 s (`test42.log` `48132cef…66d5`) ; node : 22 avant, 22 après. Verrou absent après chaque passage.
- `apps/dojo/**` n'est pas exporté (`scripts/export-public.mjs` : 0 occurrence de « dojo ») : export local sans objet.

## 7. sha256 et traces

- Worktree (inchangé) : `dojo-chain.mjs` `33152178…721a`, `.d.mts` `387b637a…84a3`, `dojo-verify.mjs` `98999b2d…d376`, `.d.mts` `98d9f1bc…53f6`, fixture `aa4151bc…7d51`, `dojo-chain.test.ts` `2830cbc8…44e7`, `dojo-verify.test.ts` `3359f51b…e106`, journal G1 `6d44f391…f628`.
- Clone du G1 `F:/tmp/dojo/pr1b3/clone` : non touché (état et sha256 relus) ; `F:/tmp/dojo/pr1b3-mutants/` non touché (rejeu dans `g2-pr1b3/mut-g1/`).
- Dossier du G2 : `F:/tmp/dojo/g2-pr1b3/` : `hand.mjs`/`hand.log`, `g2-probe.test.ts`/`probe.log`, `g2-mutants.mjs`, `g2-list.mjs`, `g2-list-fix.mjs`, `mut/`, `mut-g1/`, `mut-fix/`, `fix/` (copie corrigée, hors dépôt), `fix-patch.mjs` (`4fd41fcc…1f20`), `fix.diff`, `r25-*.sh|log`, `oracle/`, `dojo-tests.log` (`44951b84…bc1f`), `fix-tests.log`. Jonctions `node_modules` de `clone/` et `fix/` retirées par `rm-nm.ps1 -Tree`.
- Aucun `git add/commit/stash/checkout/branch` dans le worktree ; `git clone --no-local` et `git checkout` de `02884eb` dans mes seules copies ; `GIT_INDEX_FILE` vers des copies d'index de mes clones (R-25). Aucun réseau. Rien sur C:. Commandes < 6 Ko : harnais, listes, sonde, patch et ce rapport écrits par l'outil d'écriture, hors dépôt.

## 8. Verdict

**CORRECTIONS D'ABORD** : C-G2-1 (Q-6, dont deux tests existants et le choix M-4), C-G2-2 (Q-7), C-G2-3 (Q-9), C-G2-4 (doublons), C-G2-5 (lectures manquées, jour compté sans balise), C-G2-6 (Q-2, sous interprétation) bloquantes ; C-G2-7 non bloquante. Prototype complet vert, 56/58 mutants, R-25 302 ≤ 304,5. Après correction par le générateur et rejeu, le lot est prêt pour le checkpoint-2.
