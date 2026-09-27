claude-opus-5-5[1m]

# G1 — lot Dōjō PR-2-2 (collecteur, partie réseau : `collect.ts` sous garde, `--tick`, disposition du passage local, test d'intégration)

## 0. Identité, base, horloge

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1) ; worker, contexte frais. Mission `F:/tmp/dojo/mission-g1-pr2-2.md` (tâche de workflow de l'orchestrateur, horodatage 2026-09-27T09:20Z).
- **Horloge** (`date -u`) : 09:13:23Z orientation (avant l'horodatage de mission : écart déclaré, sans effet) ; 09:25:57Z début de l'écriture ; 09:38:47Z premier passage des tests ; 09:40:04Z clone ; 09:42:03Z premiers mutants ; 09:47:28Z → 09:57:41Z oracle, premier passage (5/7, §8) ; 09:58:38Z corrections synchronisées ; 09:59:49Z → 10:00:12Z mutants finaux ; oracle final : §8.
- **Base** : worktree `F:/Monark-wt-dojo-a2`, branche `lot/dojo-pr2-2`, HEAD `f8f6105` ; `git status --short` à l'orientation : **vide**.
- **Lu** : ADR de lot `docs/adr/ADR-DOJO-PR-2.md` en entier (492 l. ; lignes datées de fin de fichier tenues pour faisant foi) ; mère par recherches (dixième pli l.211, TU-3 l.357, T-7 l.417) ; FAITS du tronc : `FAITS-drand-relays-terms-2026-09-27.md` (sha256 `f1eeb197…5268`, 27 l., section `/info` de 08:28Z absente de la copie du worktree), `FAITS-helius-credits-2026-09-27.md` (`30b60bc5…fca`), `FAITS-probe-12-2026-09-27.md` (`e3964ea3…341a`) ; code : `reading.ts`, `bundle.ts`, `dojo-core.mjs` (exports, l.400-492), `dojo-chain.mjs` (l.1-120), `dojo-verify.mjs` (en entier), `dojo-fixture.ts` (en entier), `apps/bell/src/collect.ts` (l.430-560, l.630-800), `quorum.ts` (l.80-160), `operators.ts`, `packages/rpc-guard/src/{transport,guarded,client,lock,cli,errors,bell-methods,index}.ts`, `tariff.ts` (l.1-40), `test/exports.test.ts`, `ci.yml:70-100`, `scripts/lang-gate.mjs` (en-tête), `scripts/export-public.mjs` (liste blanche).
- **Discipline** : aucun `git add/commit/stash/checkout/branch` ; `git` en lecture seule dans le worktree (`status`, `log`, `diff`, `show f8f6105:<chemin>` pour restaurer trois fichiers du garde, §1) ; deux `git clone --no-local` hors dépôt (`F:/tmp/dojo/pr2-2/clone`, `F:/tmp/dojo/pr2-2-mutants/tree`) ; **aucun appel réseau** (§9) ; rien sur C: (TEMP/TMP sur `F:/tmp/dojo/pr2-2/tmp`, `F:/tmp/dojo/pr2-2-mutants/tmp`) ; jonctions `node_modules` par `mk-nm.ps1 -Tree` (copie de `F:/tmp/cp2-bellretry1/mk-nm.ps1`, md5 `4809e762…a91254ae5db` comme les cinq copies connues) sur le worktree, le clone et l'arbre des mutants : `entries: 220  monark: 10  fail: 0` pour chacun ; laissées en place (retrait par `rm-nm.ps1 -Tree` seulement). Une commande de retouche lancée par erreur via `python3` (absent) est restée en attente et a été arrêtée (`TaskStop`) sans effet.
- **Advisor intégré** : consulté après l'orientation (conseil suivi, sauf le point 2, retiré ensuite), puis au premier passage de l'oracle (5/7) : recommandation de revenir au repli de la mission pour les relais (transport injecté) et de déclarer la dépendance du garde sur le précédent de Bell, avec question ; suivie (§1, Q-1, Q-2). Troisième consultation avant la remise : §13.

## 1. Livrable et interfaces

| Fichier | Rôle |
|---|---|
| `apps/dojo/src/dojo-methods.ts` (29 l., nouveau) | `DOJO_SOLANA_METHODS` = [`getAccountInfo`, `getProgramAccounts`] ; `DOJO_METHOD_CAPS` = {gPA 2, gAI 8} (D-6 l.173 : 2 × 10 + 8 = 28 ≤ 40 crédits ; 5 pièces × 2 opérateurs × 2 essais = 20 ≤ 24 appels) ; `TRIES` 2 (D-6 l.173), `BACKOFF_MS` 400 (`apps/bell/src/quorum.ts:159`), `PUBLIC_HOST_GAP_MS` 1 000 (D-2 l.130 ; `probe-12.mjs:48`) ; `CHAIN_OPERATORS` = [`helius`, `solana-foundation`] ; `ENV_CYCLE_ID` = `HELIUS_CYCLE_ID`, `ENV_CYCLE_FLOOR` = `HELIUS_CYCLE_FLOOR` (provisoires, Q-4) ; `TOKEN_2022` (D-2 l.125), `DECIMALS` 6 (§1.3 l.54) ; `READ_RULE` épinglé (quicknet du FAITS drand, tronc l.26 ; O 900 D-5 l.153, tolérance 600 D-1 l.112, fraîcheur 165 D-3 l.135) |
| `apps/dojo/src/collect.ts` (260 l., nouveau) | `parseArgv` (argv fermée), `runCollect(argv, deps)`, `main`, `DOJO_COLLECT_REFUSALS` (14 codes), `DojoCollectError`, `RunDeps = {env, nowMs: () => number, sleep?, relays?}`, `RelayGet` |
| `apps/dojo/src/layout.ts` (97 l., nouveau) | écrivain de disposition `closeLayout`, `writeAtomic`, `ensureDir`, `nextEve` ; lecteur de disposition `readDayLayout(dir)` et `readEve(text)` (à importer tel quel par PR-3a-1) ; `DOJO_LAYOUT_REFUSALS` (4 codes), `DojoLayoutError` |
| `apps/dojo/src/bundle.ts` (+3 −1) | DOJO-READER-MISSED-FORM-1 : `readRecord` exige, pour `read_at` null, `enumerations` vide, `mint`, `pool`, `pyth` nuls et `slot_min`, `slot_max`, `pool_price`, `usd_per_sol`, `usd_per_sol_publish_time` nuls (Q-3) |
| `apps/dojo/package.json` (+4 −1), `package-lock.json` (+4 −1) | dépendance déclarée `"@monark/rpc-guard": "0.0.0"`, calque exact de `apps/bell/package.json` et de son nœud de verrou (Q-1) |
| `apps/dojo/test/helpers/collect-chain.ts` (97 l., nouveau) | chaîne simulée (fetch remplacé pour helius et l'hôte public ; relais injectés ; pièges `net.Socket.prototype.connect` et `dns.lookup`) |
| `apps/dojo/test/dojo-collect.test.ts` (419 l., nouveau) | les 14 tests nommés de PR-2-2 et de l'oracle du `--tick` |

**Modes** (D-1 ligne C-V-2) : `--tick` (clôtures des jours ouverts dont la fin du jour de lecture est passée, puis plan du jour s'il manque, puis chaque lecture échue et non écrite, une par instant, doublons compris ; arrêt à la première erreur) ; `--plan` (jour courant ; β de r_d sur les deux relais, identique octet pour octet, ronde = r_d, `randomness` = SHA-256(β), bit de compression posé et bit d'infini nul ; sinon aucun plan à ce pas ; à partir de T_d + 900 sans plan : plan à `beacon` nul, motif `beacon_unavailable`, **sans aucun appel** ; deux relais injectés exigés, sinon `relay_missing` avant tout appel) ; `--reading i` (jour dont le plan porte t_i avec t_i ≤ maintenant ≤ t_i + 600 : aujourd'hui puis la veille, fenêtre à cheval sur minuit ; lecture déjà écrite ⇒ rien ; `eve.json` absent ⇒ `eve_missing` ; `read_at` = horloge après le dernier appel, hors fenêtre ⇒ `outside_window`, rien écrit ; paires a = helius, b = solana-foundation passées à `readingRecord`) ; `--close-day <jour>` (avant la fin du jour de lecture ⇒ `day_not_ended` ; jour clos ⇒ rien ; lectures manquées, `writeDayBundle`, disposition dans l'ordre de D-7, `bundles/<d+1>/eve.json`).

**Refus** (hors des 45 de `dojo-verify`, asserté) : collecteur `usage`, `outside_repo`, `credentials_path`, `anchor_malformed`, `mint_mismatch`, `seed_mismatch`, `cycle_missing`, `budget_guard`, `state_missing`, `anchor_day_not_read`, `outside_window`, `eve_missing`, `lock_held`, `relay_missing` ; disposition `layout_malformed`, `layout_sha_mismatch`, `layout_stray_file`, `eve_malformed` ; `day_not_ended` est celui de `bundle.ts`. Argv, ancre, mint, graine, cycle, garde ×10 (plancher + 10 × `--max-credits` ≤ `HELIUS_CYCLE_CAP_CREDITS` importé, D-6 l.173), couverture des plafonds (`assertMethodCapsCover`) et `<state>/ledger` préexistant : contrôlés avant tout verrou et tout appel.

**Relais de la balise : transport injecté (repli de la mission)**. Le lot DRAND-RELAY-GET-1 a d'abord été écrit dans le garde (deux libellés GET, règle de chemin, export et gel amendés, test `rpc_guard_drand_labels_are_host_bound`) : le premier passage de l'oracle a rougi `bell_publish_bare_label_guard_pins_operator_vocabulary` (`apps/bell/test/bell-keys.test.ts:152`), qui fige le vocabulaire des libellés émis (`operatorLabels` hors libellés ETH sans clé) et rappelle que la garde `BARE_LABEL` de Bell suppose un vocabulaire **sans point** (`api.drand.sh` en porte) ; `apps/bell/**` est intouchable. Les trois fichiers du garde ont été restaurés octet pour octet (`git show f8f6105:<chemin>`) et le test du garde supprimé : **aucune ligne sous `packages/`**. `--plan` prend ses deux relais dans `RunDeps.relays` (même boucle d'essais, même évidence) ; `main` n'en passe aucun : en production, `--plan` et `--tick` refusent `relay_missing` jusqu'au lot DRAND-RELAY-GET-1 (déclencheur, §10). Conséquences déclarées : le plan ne prend aucun verrou d'opérateur (l'assertion de coexistence devient triviale) ; les GET des relais ne sont bornés que par `TRIES`, pas par `--max-calls`, et n'ont pas de ligne de grand livre.

**Choix déclarés** : (a) ancre contrôlée par un calque des seuls contrôles d'`anchorForm` (module-privé) dont dépend le collecteur, plus `seedAnchor(graine, horizon)` = `seed_anchor` et `read_rule` égal aux constantes épinglées ; le fichier d'ancre peut être la ligne signée ou son corps ; (b) `nowMs` est une fonction (écart au `number` de Bell) ; (c) essais bornés propres, et non `withRetry` de Bell, qui n'honore pas `retryAfterMs` (ADR §1.6) ; (d) `LockHeldError` n'étant pas exporté par le garde, il est reconnu au nom de sa classe ; (e) évidence : `evidence/plan.json`, `evidence/raw/<sha256>.json.gz`, `evidence/runs.jsonl` (une ligne par course) — non chaînée (Q-6) ; (f) droits : jour et `publish/` 0750, `evidence/` et `readings/` d'un jour ouvert 0700, `readings/` passé à 0750 à la clôture ; fichiers 0640 ; groupe `dojo-handoff` et setgid non posés (actes d'hôte, PR-3) ; renommage après `fsync` du fichier, sans `fsync` de répertoire ; (g) un jour dont le répertoire existe mais jamais planifié est clos `beacon_unavailable` à T_{d+1} ; un jour abstenu reporte son `Eve` au lendemain (verdict 08:28Z (3)).

## 2. Fichiers (sha256, état final du worktree)

| Fichier | sha256 |
|---|---|
| `apps/dojo/src/collect.ts` | `e903cf8adb35fc695233049a158a872a556c2cbeb9d689131c3758f3140caa5a` |
| `apps/dojo/src/dojo-methods.ts` | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` |
| `apps/dojo/src/layout.ts` | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` |
| `apps/dojo/src/bundle.ts` | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` |
| `apps/dojo/package.json` | `c0a7eb01522b26b2cf19b5867f38809f487251b3529ff64a018fef3d06491e71` |
| `package-lock.json` | `d1d880999d2cb9ea12d08da58e53f3a654d01839bc73263e305583e720735d39` |
| `apps/dojo/test/dojo-collect.test.ts` | `ab065c7af42588bcf5576c8ab4a4fc2d217a142e58994182451522b27d9eed49` |
| `apps/dojo/test/helpers/collect-chain.ts` | `a77f0fcce1310aba020e1caf014cb26ba89ede362bfaf917b87f6497980e5332` |

0 CR dans les six fichiers de code et de test. Inchangés (`git diff --stat` : trois fichiers modifiés seulement, `apps/dojo/package.json`, `apps/dojo/src/bundle.ts`, `package-lock.json`) : `tsconfig*`, `apps/bell/**`, `packages/**`, `reading.ts`, `dojo-core.*`, `dojo-chain.*`, `dojo-verify.*`, `dojo-fixture.ts`, tests et fixtures de PR-2-1 et PR-1b-3.

## 3. R-25 (méthode `ci.yml:82` / `:90`, clone `--no-local`, base `f8f6105`)

- Script `F:/tmp/dojo/pr2-2/r25.sh` = `F:/tmp/dojo/pr1b3/r25.sh` au chemin de la copie d'index près ; pathspec de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` extraits par `sed` ; copie d'index propre au clone ; fichiers du lot copiés par `sync.sh` (`cmp` égal).
- **Mesure finale : `7 files changed, 909 insertions(+), 2 deletions(-)` ⇒ 911** (09:58Z ; `package-lock.json` et ce journal hors pathspec). Par fichier : `collect.ts` 260, test 419, `layout.ts` 97, helper 97, `dojo-methods.ts` 29, `package.json` 4+1, `bundle.ts` 3+1. Mesure intermédiaire (avec le garde) : 946.
- Estimation ≈ 488 ⇒ dérive **×1,87** ; sous la cible ≤ 1 025 ; sous le seuil de coupe de la mission (> 950 CODE) de 39 ; STOP 1 150 à 239. Coupe C-6 non posée.

## 4. Tests (14 tests nommés, un fichier)

`apps/dojo/test/dojo-collect.test.ts` : `dojo_tick_refuses_unknown_argv`, `dojo_collect_budget_stops_fail_closed`, `dojo_collect_calls_have_the_closed_forms`, `dojo_mint_is_the_pinned_ca`, `dojo_collect_never_publishes_one_operator`, `dojo_collect_beacon_is_all_day_or_nothing`, `dojo_collect_refuses_the_anchor_day`, `dojo_collect_reads_only_inside_the_window`, `dojo_collect_retries_are_bounded_and_honour_retry_after`, `dojo_tick_is_idempotent`, `dojo_tick_before_0015_fetches_beacon_once`, `dojo_tick_at_instant_launches_one_reading`, `dojo_tick_after_day_end_closes_once`, `dojo_collect_to_verify_end_to_end`. `rpc_guard_drand_labels_are_host_bound` n'est **pas** livré (lot du garde reporté, §1, §10). Résultat : 14/14 sur le worktree et sur le clone ; `tsc --noEmit` 0 ; `eslint apps/dojo` 0 ; `lang-gate` 0 occurrence ; `deps-hygiene`, `bell-keys`, `exports` verts sur le clone (28/28 avec le test du lot).

Ce que chaque test asserte :
- **argv** : 13 formes refusées `usage` (vide, deux modes, drapeau inconnu, répété, obligatoire absent, `--reading 0`, valeur absente, jour invalide ×2, `--max-calls 0`, valeur non entière, `--state=`, valeur qui commence par `--`) ; aucun appel, aucun répertoire de cycle.
- **budget** : garde ×10 (`--max-credits 800001` ; plancher 7 999 601), `cycle_missing` (identifiant absent, plancher négatif), couverture des plafonds, plafonds ≤ 40 crédits ; `--max-calls 3` ⇒ arrêt au 4ᵉ appel, `--max-credits 10` ⇒ arrêt au 3ᵉ ; `BudgetExceededError` ; rien écrit ; verrous rendus ; refus au grand livre.
- **formes fermées** : GET v1 exact sur les deux relais ; lectures 1 et 2 : liste exacte (opérateur, méthode, paramètres) en forme canonique : gPA `finalized`, `jsonParsed`, `withContext`, un seul `memcmp` offset 0 sur le mint (ni `dataSize`, ni `dataSlice`, ni `tokenAccountState`) ; `getAccountInfo` `finalized` en `jsonParsed` ou `base64` ; mint lu une fois par jour.
- **mint** : `out/mint.txt` = le CA épinglé (`token_ca_pinned`) = le mint des fixtures ; `--mint-file` ≠ ancre ⇒ `mint_mismatch` ; mint synthétique ⇒ filtre et lecture du mint sur ce mint (M-Q6).
- **un opérateur** : chaque paire = un appel à helius puis le même à solana-foundation, `operatorOf` distincts ; hôte public en 403 ⇒ aucune reprise sur helius, 6 comptes sans quorum, prix nuls, fautes 1 par pièce.
- **balise** : relais menteur (signature, `randomness`, ronde), réponse sans forme, relais en 404 ⇒ aucun plan ; un seul relais injecté ⇒ `relay_missing`, aucun appel ; à T_d + 900 : aucun appel, plan nul ; clôture à T_{d+1} seulement, paquet `abstained`/`beacon_unavailable`, `publish/SHA256SUMS` à 2 lignes ; instants du plan = formule recodée de la fixture.
- **jour d'ancre** : `--plan` et `--close-day` (jour d'ancre, jour antérieur) ⇒ `anchor_day_not_read` ; `--tick` n'appelle rien et ne crée rien.
- **fenêtre** : t_i − 1 et t_i + 601 refusés ; course lente (`read_at` > t_i + 600) ⇒ rien écrit ; verrou helius tenu ⇒ `lock_held`, aucun appel, aucun verrou laissé ; `--plan` de d+1 passe malgré ce verrou ; `--close-day` à max t_i + 599 ⇒ `day_not_ended` ; lecture de la veille à T_{d+1} + 400 (plan synthétique).
- **essais** : 429 + `Retry-After: 7` ⇒ attente de 7 000 ms une fois, deux essais ; 503 ⇒ 400 ms, deux essais ; 403 ⇒ un seul essai ; fautes comptées.
- **tick** : idempotence (aucun appel au second passage, plan et lecture inchangés) ; β une seule fois pour 00:00/00:05/00:10 ; sans β, 404 non réessayé, puis 00:15 ⇒ plan nul sans appel, aucune lecture aux instants, clôture `beacon_unavailable` ; deux instants à moins de 600 s (β synthétique cherché) ⇒ deux lectures d'indices distincts au même pas, 10 + 8 appels, aucune relance ; clôture à la première passe après la fin du jour de lecture, aucune avant, aucune seconde, ordre des mtimes, `Eve` du lendemain = (compte, propriétaire) acceptés ; droits 0700/0750 hors win32.
- **intégration** : §6.

## 5. Mutants (copie `F:/tmp/dojo/pr2-2-mutants/tree` ; harnais `mutants.mjs` sha256 `d25b518c74886820b745f787c68608debe6f75553eaeea3022e2076e1263c19a`, résultats `RESULTS.txt` `f6eaf177029dd06e0dc33e1e8c23b73b7f47ed72960fb6eeb4d289504e0ea4db`)

Chaque mutant est appliqué seul sur la copie, le test visé lancé par `--test-name-pattern=^<nom>$` (1 test exécuté par ligne), le fichier restauré et son sha256 revérifié (`restored=true` sur les 20 lignes) ; la ligne d'échec est relevée (aucune erreur de syntaxe parmi les mises à mort).

| Id | Mutation | Test visé | Échec relevé |
|---|---|---|---|
| M-Q3a | gPA `confirmed` | `calls_have_the_closed_forms` | formes fermées |
| M-Q3b | `getAccountInfo` `confirmed` | idem | formes fermées |
| M-Q6 | mint littéral dans le filtre | `mint_is_the_pinned_ca` | filtre gPA |
| M-Q11 | `dataSize: 165` ajouté | `calls_have_the_closed_forms` | formes fermées |
| M-Q17a | `Retry-After` ignoré | `retries_are_bounded_…` | « Retry-After honoured » |
| M-Q17b | 5 essais | idem | « two tries » |
| M-Q18 | repli sur helius quand l'hôte public échoue | `never_publishes_one_operator` | « no fallback » |
| M-Q19a | contrôle de `read_at` retiré | `reads_only_inside_the_window` | « read_at past the window » |
| M-Q19b | fenêtre 2 × 600 | idem | appels à t_i + 601 |
| M-Q21 | `--close-day` accepté avant la fin (contrôle retiré, `now` porté à la fin) | idem | « before max_i t_i + 600 » |
| M-B3 | repli sans β (β de remplacement) | `beacon_is_all_day_or_nothing` | plan écrit |
| M-B4 | β d'un seul relais | idem | plan écrit |
| M-B5 | β cherchée après T_d + 900 | idem | « no call at all » |
| M-T1 | plan refait au second passage | `tick_is_idempotent` | « no call, the plan kept » |
| M-T2 | lecture écrite relancée | idem | « never read again » |
| M-T3 | clôture par le pas avant la fin du jour de lecture | `tick_after_day_end_closes_once` | le pas rejette `day_not_ended` (seconde défense de `close`) |
| M-T4 | argument inconnu accepté | `tick_refuses_unknown_argv` | `usage` attendu |
| P-1 (sonde, item) | durcissement DOJO-READER-MISSED-FORM-1 retiré | `to_verify_end_to_end` | « empty forms only » |
| P-3 (sonde) | refus d'un fichier étranger retiré | idem | `layout_stray_file` attendu |
| P-4 (sonde) | contrôle sha256 du lecteur de disposition retiré | idem | `layout_sha_mismatch` attendu |

**Liste fermée : 14/14 tués (17 variantes)** ; sondes 3/3. Déclarations : une première écriture de P-3 (instruction vidée) donnait une erreur de syntaxe, réécrite (`false &&`) puis tuée par assertion ; la sonde P-2 (règle de chemin du garde) est retirée avec le lot du garde ; M-T3 est tué par le refus que `close` lève, pas par l'assertion « aucune clôture » (les deux défenses sont dans le lot).

## 6. Test d'intégration `dojo_collect_to_verify_end_to_end` (§3 de l'ADR, étapes 1 à 5)

1. **Montage** : chaîne simulée (`collect-chain.ts`), `fetch` remplacé avant toute course, vrai `openGuardedClient` sur `<state>/ledger` temporaire ; helius sur `helius.dojo.invalid` (environnement), hôte public sur son hôte fixe, jamais résolus (pièges socket et DNS armés) ; relais injectés.
2. **Déroulé** : deux jours lus (ancre + 1, ancre + 2 ; dates synthétiques de la fixture) entièrement par `--tick` à horloge injectée : plan, lectures aux instants, clôtures ; jour 1 : désaccord (lecture 2), achat en cours de journée (nouveau compte d'une nouvelle adresse, lecture 3), lecture 4 manquée ; jour 2 : compte fermé (absent des deux opérateurs dès la lecture 2), désaccord sur un compte aux quatre lectures ; `Eve` du premier jour = adresses seules (Q-2 de l'ADR).
3. **Assertions** : code 0 ; `readDayLayout` sur les deux jours ; `addresses` (lectures composées) égales à l'oracle recodé depuis les lignes de vérité ; `accounts_no_quorum_persistent` [] puis [{compte cible}] ; π_d = 161 206 676 086 / 117 283 623 429 277 réduit ; σ_d = prix Pyth des octets de la fixture × 10⁻⁸ ; `publish/SHA256SUMS` et `readings/SHA256SUMS` exacts (ensemble, ordre, format) ; sha256 énumérés = `records_sha256[i−1]` et `eve_sha256` ; aucun libellé d'opérateur dans `eve.json`, `publish/day.json`, `readings/*.json` ; `Eve` du jour 2 = adresses du paquet 1 ; lecture manquée écrite par la clôture ; refus du lecteur de disposition sur fichier ajouté (`publish/extra.json`, `readings/9.json` ⇒ `layout_stray_file`), retiré (`readings/2.json` ⇒ `layout_malformed`), altéré (`readings/1.json`, `publish/day.json` ⇒ `layout_sha_mismatch`) ; DOJO-READER-MISSED-FORM-1 : trois variantes d'une lecture manquée (emplacement, énumération, pool non nuls) ⇒ `record_malformed`.
4. **Vérification (jamais un skip)** : une ancre, une ligne d'historique vide et les deux `snapshot` (depuis les paquets : `seed`, `beacon`, `reads`, `status`, et lignes du jour recalculées depuis `addresses` par le noyau, à la place de l'éditeur) signés par la clé éphémère de la fixture (`render`, `seal`) ; `dojo-verify` rend **`consistent_with_supplied_keyring`**, 2 snapshots ; instant altéré ⇒ `read_instant_mismatch` ; β altérée (forme valide) ⇒ `read_instant_mismatch`.
5. **Limite déclarée** : l'éditeur PR-3a n'existe pas ; lignes calculées par le test, `price_version` nulle ; la composition servie complète reste la condition du G7 de la pièce.

Annexes asserties : les 14 + 4 + 5 refus (collecteur, disposition, paquet) n'intersectent pas les 45 codes de `dojo-verify` ; `READ_RULE` épinglé = celui de la fixture = valeurs `/info` lues sur deux relais (FAITS drand, tronc l.26 : clé, `period` 3, `genesis_time` 1692803367, `hash` `52db9ba7…e971`, `schemeID`) : **concordance assertée** (ligne 08:28Z).

## 7. Tuyaux (ADR-M018 D3 ; règle Branchement)

| Tuyau | État au G1 |
|---|---|
| TU-1a (chaîne via le garde → `readings/<i>.json`) | **composé en test** (vrai garde, fetch simulé) |
| TU-B (relais → β, instants) | **composé en test par transport injecté** ; le libellé du garde manque (DRAND-RELAY-GET-1, §10) : en production `--plan` refuse `relay_missing` |
| TU-1b (`--close-day` → `publish/`) | composé en test |
| TU-1p (paquet d−1 → `Eve` de d) | **composé en test** (`nextEve`, `eve.json` du jour 2, report d'un jour abstenu) |
| TU-1c (`publish/` → éditeur PR-3a) | **absent** : déclencheur G7 de PR-3a (§7 de l'ADR) ; `readDayLayout` est le point d'entrée qu'il importera |
| TU-1h (`readings/` → PR-2b) | hors lot (G7 de PR-2b-2) |

Aucun chemin servi ne consomme `collect.ts` ni `layout.ts` (aucune unité, aucune surface) : **la pièce reste `upcoming`** ; aucune surface modifiée. `apps/dojo` **n'est pas exporté** (`scripts/export-public.mjs:45` : `APP_PACKAGE_DIRS` = `apps/harness`, `apps/sentinel`).

## 8. Oracle (sept gates sur le clone, sous verrou d'hôte) et test 42

- **Scripts** (hors dépôt, `F:/tmp/dojo/pr2-2/`) : `locked.sh` (`14f09c39…51e7`) = `pr1b3-corr/locked.sh` au propriétaire près (« G1 PR-2-2 ») : `mkdir F:/tmp/oracle-lock` atomique, `owner.txt`, attente 60 s jusqu'à 90 min, retrait dans le piège EXIT ; `run-oracle.sh` (`79e0d193…df49`), `oracle-all.sh` (`f4fdb276…bb88`), `t42.sh` (`a302c6b3…ee24`), `t42-all.sh` (`ec0f8b7d…8181`) = ceux de `pr1b3-corr` au dossier près : sept gates par `npm run`, codes capturés, huit variables payantes retirées (`env -u`), TEMP/TMP sur F:, `tasklist` des processus node avant et après (C-V-4) ; `sync.sh` (`2c5d4466…f316`). Arbre : `F:/tmp/dojo/pr2-2/clone` (clone `--no-local`, HEAD `f8f6105`, fichiers du lot copiés, `cmp` égal au worktree) ; Node v24.15.0.
- **Premier passage** (verrou attendu 60 s, tenu par « G1 PR-2b-2 » ; 09:47:28Z → 09:54:20Z ; archivé `F:/tmp/dojo/pr2-2/oracle-pass1/`) : **5/7** — `test` exit 1 (1 406 tests, 1 402 pass, **2 fail** : `bell_publish_bare_label_guard_pins_operator_vocabulary` et `deps_hygiene_monark_imports_are_declared`), `lang:gate` exit 1 (`dojo-methods.ts:12`, mot français dans une citation) ; test 42 à part 2/2 (sur l'état fautif). Corrections : lot du garde retiré (§1), dépendance déclarée (Q-1), citation réécrite en anglais.
- **Passage final** (verrou attendu 960 s, tenu par « G1 PR-2b-2 » puis « G1 PR-4a-1 » ; pris 10:16:18Z, rendu 10:23:37Z) : `exits.txt` **7/7 exit 0** (`gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`) ; `test` : **1 405 tests, 1 403 pass, 0 fail, 0 annulé, 2 skipped** (préexistants) ; les 14 tests du lot ✔ par nom ; `lang:gate` 0 occurrence. sha256 : `test.log` `8fb4b65ea4eb757093ecc2d878db78a12cf34e78f2592a2d09860a940c7396b4` ; `gate-vocab` `f1b1a916…be2b`, `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`, `lint-ratchet` `45ede4ce…6b42`, `lang-gate` `b22ac8f8…0dd7`, `export-check` `2f9645a9…f16` (les six égaux à ceux des G1 de PR-1b-3 et de PR-2-1).
- **Test 42 à part, après la suite** (verrou repris sans attente, 10:23:37Z → 10:27:09Z) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 211 s (`test42.log` `197cc8471335bd0d94ac087a7fbaef5ecf7e786e53873c1f6e538c4078e375fb`). Verrou absent après chaque passage (repris ensuite par « G1 PR-4a-1 » à 10:27:12Z).
- **Processus node (C-V-4)** : oracle final, 24 à la prise (10:16:18Z), 23 au rendu (10:23:37Z) : deux PID de la prise absents au rendu (124196, 124904 : présents avant la passe, non lancés par elle), un PID nouveau au rendu (120432), présent à la prise du test 42 (10:23:37Z) et absent à son rendu (10:27:09Z) : non attribué, disparu seul ; test 42 : mêmes PID avant et après, à ce 120432 près. Aucun processus laissé par la passe.

## 9. Aucun appel réseau

- `grep -n "fetch\s*("` sur `apps/dojo/src/*.ts`, le test et le helper : **0** ; `globalThis.fetch` : seulement `collect-chain.ts:66` (le remplacement de test) et son commentaire l.1 ; URL littérales : aucune dans `apps/dojo/src` ; dans les tests, une seule, `https://${HELIUS_HOST}` (`helius.dojo.invalid`, `collect-chain.ts:23`) ; aucun import `node:http(s)`, `node:net`, `node:dns`, `child_process`, `undici` dans `apps/dojo/src`.
- Le seul site `fetch` du chemin reste `packages/rpc-guard/src/transport.ts` (allowlisté, inchangé) ; dans les tests, `fetch` est remplacé et `net.Socket.prototype.connect` / `dns.lookup` lèvent : une socket ou une résolution aurait fait échouer la suite ; les relais sont des fonctions injectées.
- Libellés d'opérateur dans `apps/dojo/src` : `dojo-methods.ts:16` (constantes) et deux usages dans `collect.ts` ; jamais écrits sous `publish/` ni `readings/` (asserté).

## 10. Non fait (formé)

- **DRAND-RELAY-GET-1** (lot du garde, hors série) : **non livré**, tuyau TU-B de production absent. Bloqueurs mesurés : `apps/bell/test/bell-keys.test.ts:152-157` fige le vocabulaire des libellés émis par `operatorLabels` (hors libellés ETH sans clé) et la garde `BARE_LABEL` de Bell suppose un vocabulaire sans point. Le G0 du lot doit choisir des libellés sans point (par exemple `drand-pl`, `drand-cf`) et amender ce test de Bell (ligne d'ADR), ou exclure les libellés drand de ce vocabulaire comme les libellés ETH ; puis `main` de `collect.ts` passe `relays` depuis le garde (≈ +5 lignes). Déclencheur : avant le premier jour lu (acte A-7 de l'ADR PR-3) ; propriétaire : orchestrateur. La version écrite puis retirée (8 + 2 + 2 lignes de garde, test de 43 lignes) est conservée hors dépôt dans `F:/tmp/dojo/pr2-2-deliver/withdrawn/` pour ce G0.
- **Journal chaîné de l'évidence** (D-7) : `runs.jsonl` non chaîné (Q-6).
- **Groupe `dojo-handoff`**, setgid : actes d'hôte (ADR PR-3 A-2).
- **Forme de la réponse v1 d'une ronde** : non mesurée ; seuls `round`, `randomness`, `signature` sont lus (Q-5).
- **Droits observés** : assertés hors win32 seulement (limite de plateforme, pas un skip).

## 11. Questions à l'orchestrateur

- **Q-1** (bloquante pour la règle de mission) : `package*.json` devait rester inchangé ; `test/deps-hygiene.test.ts` (ADR-M018 D1) rougit dès que `apps/dojo/src` importe `@monark/rpc-guard` sans le déclarer, et l'ADR exige `openGuardedClient` dans `collect.ts`. Fait : déclaration `"@monark/rpc-guard": "0.0.0"` dans `apps/dojo/package.json` et le nœud `apps/dojo` de `package-lock.json`, calque exact de Bell. Alternatives rejetées (contournements) : import relatif de `packages/rpc-guard/src`, point d'entrée hors `src/`, injection du client depuis un script non scanné. Acceptée ?
- **Q-2** : DRAND-RELAY-GET-1 reporté (§10) et relais injectés : acceptable pour PR-2-2, le lot du garde passant en G0 propre avant le premier jour lu ?
- **Q-3** : la mission dit « fichiers de PR-2-1 inchangés » et « DOJO-READER-MISSED-FORM-1 : à faire ici » ; l'item (§7 de l'ADR) nomme `readRecord`. Fait dans `bundle.ts` (+3 −1), assertion et sonde P-1 dans le test du lot. Exception acceptée ?
- **Q-4** : noms d'environnement `HELIUS_CYCLE_ID` et `HELIUS_CYCLE_FLOOR` (calque sentinelle) provisoires jusqu'au G1 de PR-3b-1 ; le transport exige aussi `BELL_SOLANA_RPC` et `HELIUS_API_KEY` dans le même `EnvironmentFile`.
- **Q-5** : forme v1 de la réponse d'une ronde non mesurée : lecture sur place par l'orchestrateur de `/<hash>/public/<r>` sur les deux relais avant le premier jour lu ?
- **Q-6** : évidence non chaînée : suffisant pour PR-2-2, ou chaîne à ajouter (≈ +5 lignes) ?
- **Q-7** : un jour sans répertoire (collecteur arrêté plus d'un jour) n'est ni clos ni reporté ; le report d'`Eve` ne traverse que les jours dont le répertoire existe (créé par la clôture de la veille) : suffisant ?
- **Q-8** : « aucun fournisseur nommé dans le code » lu comme : aucun hôte ni URL dans `apps/dojo` ; les libellés `helius` et `solana-foundation` y sont nommés comme configuration du garde (D-1 ligne C-V-2). Lecture confirmée ?

## 12. `git status --short` final (worktree)

```
 M apps/dojo/package.json
 M apps/dojo/src/bundle.ts
 M package-lock.json
?? apps/dojo/src/collect.ts
?? apps/dojo/src/dojo-methods.ts
?? apps/dojo/src/layout.ts
?? apps/dojo/test/dojo-collect.test.ts
?? apps/dojo/test/helpers/collect-chain.ts
?? docs/G1-lot-dojo-pr2-2.md
```

Jonction `node_modules` du worktree posée par `mk-nm.ps1` (ignorée par git). Livraison : `F:/tmp/dojo/pr2-2-deliver/` (les huit fichiers du lot, ce journal, `harness/` : `mutants.mjs`, `RESULTS.txt`, `r25.sh`, `r25.log`, `sync.sh`, `locked.sh`, `run-oracle.sh`, `oracle-all.sh`, `t42.sh`, `t42-all.sh`, `mk-nm.ps1`, `rm-nm.ps1`, journaux de l'oracle final et du premier passage ; `withdrawn/DRAND-RELAY-GET-1-withdrawn.md`) et `DELIVERED.sha256` ; sha256 de ce journal rendu hors du fichier.

## 13. Remise

- `error_origin` proposés (à assigner au G7) : rouge `bell-keys` du premier passage = générateur du G1 (vocabulaire figé de Bell non cherché avant d'ajouter des libellés au garde) ; rouge `deps-hygiene` = planificateur (mission : « package*.json inchangés » incompatible avec ADR-M018 D1 dès que `collect.ts` importe le garde) ; `lang:gate` = générateur du G1 (citation française non passée au crible).
- Contrôle par nom dans `oracle/test.log` du passage final : les 14 tests du lot ✔ (14 occurrences ancrées `^✔ <nom> `), et ✔ `bell_publish_bare_label_guard_pins_operator_vocabulary`, `public_export_set_is_closed`, `deps_hygiene_monark_imports_are_declared` (les trois touchés par les corrections du premier passage).
- Advisor intégré, troisième consultation (avant la remise, conseil) : ordre de clôture (journal, puis copie livrée, puis `DELIVERED.sha256`) et contrôle par nom ci-dessus ; suivis. sha256 de ce journal : rendu hors du fichier (`DELIVERED.sha256`).

## 14. Corrections après G2 (2026-09-27)

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1) ; worker correcteur, contexte frais, distinct du relecteur G2. Mission `F:/tmp/dojo/mission-corr-pr2-2.md` (sha256 `5565a3fb6f5602aa7769d07a17b449260deecc7b58d2edafb89eba30e50b31f8`, 17 l.), horodatage 2026-09-27T11:10Z ; entrée : rapport G2 `F:/tmp/dojo/g2-pr2-2/G2-report.md` (sha256 `7b15aa1b780c063386c2b1357766fe2c9b2738dc9c62a78527563f9a01cfe7da`, égal à `G2-report.md.sha256`).
- **Horloge** (`date -u`) : 11:05:29Z orientation (avant l'horodatage de mission : écart déclaré, sans effet) ; 11:12:14Z état épinglé (huit fichiers du lot aux sha du §2 ; les cinq fichiers hors prototype égaux à ceux du clone `corr` du G2 par `cmp`) ; 11:13Z prototype du G2 (`collect.ts`, test, helper du clone `corr` = `proposal-C-G2-1-5.diff`) copié dans le worktree, puis corrections propres ; 11:17:25Z premier `tsc` ; 11:19:32Z → 11:19:58Z `apps/dojo/test` deux passages ; 11:20:07Z clones ; 11:22:19Z → 11:24:27Z mutants G1 et K ; 11:29:11Z → 11:35:32Z mutants, deuxième passage ; 11:21Z → 12:00:24Z attente du verrou d’hôte ; 12:10:56Z premier oracle rendu (6/7, §14.5) ; 12:11:37Z → 12:25:16Z oracle final ; 12:13:00Z → 12:20:17Z mutants, passage final.
- **Base** : pendant cette passe, la branche `lot/dojo-pr2-2` du worktree est passée de `f8f6105` à **`21eb5ec`** (commits de l'orchestrateur `13cec81` et `21eb5ec` : `docs/CHECKPOINT1-lot-rpc-guard-drand-1.md`, `docs/G0-lot-rpc-guard-drand-1.md`, `docs/adr/ADR-RPC-GUARD-DRAND-1.md`, `docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` +7 ; documents seuls, hors pathspec de R-25 ; aucun fichier du lot touché). Clones `--no-local --branch lot/dojo-pr2-2` à `21eb5ec` : `F:/tmp/dojo/pr2-2-corr/clone` (oracle) et `F:/tmp/dojo/pr2-2-corr/mut` (mutants), fichiers du lot copiés, `cmp` égal ; jonctions `node_modules` par `mk-nm.ps1 -Tree` (md5 `4809e7622ebdfa966703aa91254ae5db`) : `entries: 220  monark: 10  fail: 0` sur les deux, laissées en place (retrait par `rm-nm.ps1 -Tree` seulement). Un premier clone sans `--branch` avait pris le HEAD du dépôt principal : retiré avant toute jonction.
- **Discipline** : aucun `git` écrivant (worktree : `status`, `log`, `diff`, `ls-files`, `rev-parse`, `branch --show-current` ; R-25 en lecture seule, sans `git add -N`) ; **aucun appel réseau réel** (`fetch` remplacé, pièges socket et DNS armés dans tous les rejeux) ; rien sur C: (TEMP/TMP/TMPDIR sous `F:/tmp/dojo/pr2-2-corr/{tmp,mtmp}`) ; les trois documents du lot rpc-guard DRAND-RELAY-GET-1 non ouverts, non touchés ; suite complète et test 42 sous verrou d'hôte « corr PR-2-2 ». Advisor intégré consulté après l'orientation (conseil suivi : Q-G2-5 lu comme propriété testée ; ordre de D-7 rendu observable par trace ; R-25 sans écriture d'index ; mutants rejoués sur clone aux ancres finales) et avant la remise.

### 14.1 Décisions appliquées

| Point | Fait | Test | Mutants |
|---|---|---|---|
| C-G2-1 (D-8) | `reading()` refuse `anchor_day_not_read` pour T ≤ jour d'ancre ; la boucle des lectures du `--tick` ne considère que les jours > jour d'ancre | `dojo_collect_refuses_the_anchor_day` (plan et `Eve` du jour d'ancre plantés : `--reading 1` ⇒ `anchor_day_not_read`, `--tick` ⇒ aucun appel) | K-1a, K-1b |
| C-G2-2 (D-5, D-7) | `plan()` crée `evidence/` (0700) avant d'écrire le plan, nul ou non | `dojo_collect_beacon_is_all_day_or_nothing` (premier `--tick` à T_d + 900 sur état neuf : plan nul, aucun appel) | K-2 |
| C-G2-3 (Q-7, D-7) | `--tick` parcourt les jours un à un jusqu'à aujourd'hui ; jour sans répertoire créé et clos `beacon_unavailable`, `Eve` reportée ; `eve.json` d'un jour ouvert reconstitué depuis la veille close (`nextEve(readDayLayout(veille))`) ; `--close-day` direct garde l'ordre de D-7 sans reprise (le pas suffit, déclaré) | `dojo_tick_fills_the_days_it_missed` (D1 clos, D2 retiré après la clôture, reprise à D1 + 5 : D2 à D4 clos, `Eve` reportée, `eve.json` du jour présent) | K-3a, K-3b |
| C-G2-4 (Q-6) | `evidence/runs.jsonl` chaîné : `prev` = sha256 de la ligne précédente avec son LF, `null` pour la première du jour | `dojo_collect_to_verify_end_to_end` (chaîne relue sur les deux jours) | K-4 |
| C-G2-5 (M-Q17) | test : 429 `Retry-After: 5` sur helius, sommeil injecté qui avance l'horloge sur une macrotâche, heure de chaque requête relevée par le stub (`stampOf`) : écart des deux essais ≥ 5 000 ms | `dojo_collect_retries_are_bounded_and_honour_retry_after` | K-5 = G-3 |
| C-G2-6 (Q-G2-2 : G-15, G-16, G-25 bloquants) | assertions compactées : G-12 (`--reading` direct : aucun appel, octets inchangés) ; G-15, G-25 (`outside_repo`) ; G-16 (`credentials_path`, et `CREDENTIALS_DIRECTORY/dojo-seed` accepté) ; G-17 (`seed_mismatch`) ; G-18, G-26 (`anchor_malformed`) ; G-22 (`state_missing`) ; G-19 (β de forme invalide `c0…` puis `00…` rendue par les deux relais ⇒ aucun plan) ; G-20 (appels à l'hôte public espacés d'au moins 1 000 ms sur l'horloge qui avance) ; **G-8a à G-8c** : ordre d'écriture de la clôture observé par une trace de `chmodSync`/`renameSync` (fonctions de `node:fs` enveloppées, liaisons ESM resynchronisées par `syncBuiltinESMExports`, restaurées en `finally`), `eve.json` de d+1 compris ; la déclaration « non observable sous win32 » du G2 cède ; la comparaison des mtimes du G1 est retirée | `dojo_tick_refuses_unknown_argv`, `dojo_collect_budget_stops_fail_closed`, `dojo_collect_calls_have_the_closed_forms`, `dojo_collect_beacon_is_all_day_or_nothing`, `dojo_collect_retries_are_bounded_and_honour_retry_after`, `dojo_tick_after_day_end_closes_once` | les 13 sondes G survivantes du G2 |
| Q-G2-3 (D-1) | `--reading i` avec i > `k_reads` de l'ancre ⇒ `usage` avant tout verrou (dans `setup`, après la lecture de l'ancre) | `dojo_tick_refuses_unknown_argv` (`--reading 5`, K = 4) | K-6 |
| Q-G2-4 (D-7) | `evidence/raw/` → `evidence/parsed/` : gzip du résultat analysé en JSON canonique, nommé par son sha256 ; item DOJO-EVIDENCE-RAW-BYTES-1 (ADR §7, G1 de PR-3b-1) | `dojo_collect_to_verify_end_to_end` (chaque sha256 du journal nomme un fichier dont les octets décompressés ont ce sha256 et sont canoniques) | K-9 |
| Q-G2-5 (A-11) | à la clôture d'un jour sans `eve.json` ni veille close : arrêt nommé `eve_missing` ; le plan du jour et les lectures échues courent encore, puis le pas rend l'arrêt ; dépôt tardif de l'`Eve` ⇒ la chaîne reprend au pas suivant ; seul `eve_missing` est intercepté, toute autre erreur de clôture arrête le pas aussitôt | `dojo_tick_stops_on_a_missing_first_eve_after_the_plan` | K-7, K-7c |
| C-G2-7 | journal : §14.6 | — | — |
| R-25 (Q-G2-1) | coupe C-6 **non** appliquée (décision) ; mesure §14.3 | — | — |

**Observations du G2 (§6), disposition** : (1) **traitée** : `ensureDir(evidence/parsed)` avant la prise des verrous ; verrous rendus avant l'ajout de la ligne du journal ; test (ajout du journal en échec ⇒ aucun verrou, aucune lecture) et mutant K-8 ; (2) `Retry-After` non plafonné, verrous tenus pendant l'attente : **question Q-C1** (§14.7) ; (3) = Q-G2-4, traitée ; (4) `<i>.json.tmp` laissé sous `readings/` par un arrêt brutal ⇒ `layout_stray_file` pour toujours : **question Q-C2** ; (5) = Q-G2-5, traitée ; (6) **traitée** : l'étape 4 asserte aussi `ok === false` des deux exécutions altérées ; (7) laxité d'oracle de `dojo_tick_before_0015_fetches_beacon_once` (plan de D2 avec la β de D1) : sans effet sur l'assertion, déclarée ; (8) `lock_held` reconnu au nom de la classe : déclaré au G1 (§1 (d)), inchangé.

### 14.2 Fichiers (sha256, état final du worktree)

| Fichier | sha256 |
|---|---|
| `apps/dojo/src/collect.ts` | `d257c08c259e16417852fb8d7eb782dcf7c210338dc622dd7f8f656933897352` |
| `apps/dojo/src/dojo-methods.ts` | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` |
| `apps/dojo/src/layout.ts` | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` |
| `apps/dojo/src/bundle.ts` | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` |
| `apps/dojo/package.json` | `c0a7eb01522b26b2cf19b5867f38809f487251b3529ff64a018fef3d06491e71` |
| `package-lock.json` | `d1d880999d2cb9ea12d08da58e53f3a654d01839bc73263e305583e720735d39` |
| `apps/dojo/test/dojo-collect.test.ts` | `ad9e85561a259d54ee53b2168f87f0b47fe759afdf1976ef0f4050135c4cc602` |
| `apps/dojo/test/helpers/collect-chain.ts` | `89318fec03ceeda68602e051f3b7bd8e89a0a919fe2a8241ceccf0cff381227f` |
| `docs/adr/ADR-DOJO-PR-2.md` | `a9bb5cca1ee59d33b1793903e51a0c2c8fe72b8de737bef1c3d4b9f4c297f64b` |

0 CR et 0 caractère hors ASCII dans les six fichiers de code et de test (compte par `node`), LF final partout. `dojo-methods.ts`, `layout.ts`, `bundle.ts`, `apps/dojo/package.json`, `package-lock.json` inchangés depuis le G1.

### 14.3 R-25

Méthode en lecture seule (script `F:/tmp/dojo/pr2-2-corr/r25-ro.sh`) : pathspec de `ci.yml:82` extrait par `sed` (20 jetons) ; `git diff --shortstat f8f6105 -- <pathspec>` = `2 files changed, 7 insertions(+), 2 deletions(-)` (9) + lignes des non suivis du pathspec (`git ls-files --others --exclude-standard -- <pathspec>`, puis `wc -l`) : `collect.ts` 274, `dojo-methods.ts` 29, `layout.ts` 97, test 509, helper 100 = 1 009 ⇒ **1 018**. Contre `21eb5ec` : même mesure (commits de documents hors pathspec). Estimation ≈ 488 ⇒ ×2,09 ; cible ≤ 1 025 tenue (marge 7) ; STOP 1 150 à 132. Ligne datée au §5 de l'ADR.

### 14.4 Tests

- Lot : **16/16** (14 du G1 + `dojo_tick_fills_the_days_it_missed` + `dojo_tick_stops_on_a_missing_first_eve_after_the_plan`). `apps/dojo/test/*.test.ts` : **76/76**, deux passages (60 existants + 16), sur le worktree. `tsc --noEmit` 0, `eslint apps/dojo` 0.

### 14.5 Mutants et oracle

Harnais hors dépôt, sur le clone `F:/tmp/dojo/pr2-2-corr/mut` (jamais le worktree) ; chaque mutant appliqué seul, fichier restauré et sha256 revérifié (`restored=true` sur toutes les lignes) ; tué ssi l'exécution des tests visés sort non nulle, ligne d'échec relevée (aucune erreur de syntaxe parmi les mises à mort) ; aucun fichier étranger laissé dans le clone (`git status --short` : les 8 fichiers du lot). Trois passages : le premier (11:22Z → 11:29Z, archivé `mutants-run1/`) avant les deux retouches de test ultérieures (étape 4 `ok === false`, typage de `plan.json`), le deuxième (11:29Z → 11:35Z) avant la seconde ; **le passage final (12:13:00Z → 12:20:17Z) sur les fichiers finaux** fait foi :
- **G1** (`g1-mutants.mjs` `3261980ecac758ea948136b1360ad157bc4dcf53c548c239ed429d0c0c454096`, test visé seul) : liste fermée **14/14 tués (17 variantes)** + sondes P-1, P-3, P-4 : **20/20** ; ancre de M-T3 réécrite sur la boucle corrigée (`… try {`) ; résultats `g1-mutants.txt` `f6eaf177029dd06e0dc33e1e8c23b73b7f47ed72960fb6eeb4d289504e0ea4db`, **octet pour octet égal au `RESULTS.txt` du G1**.
- **K** (`k-mutants.mjs` `1a770edffc8eb9d22568ce1235a2715ced4649c6a05d2cb01e72c932596440de`, les 16 tests du lot) : K-1a, K-1b, K-2, K-3a, K-3b, K-4, K-5 (= G-3), K-6, K-7, K-7c, K-8, K-9 : **12/12 tués** (`k-mutants.txt` `b4052233eb71ee17e3d6935c1de50fb6b88f2cad8bdf16816b737500ee0c800c`).
- **Sondes G du G2** (`g2-mutants.mjs` `7314a6f360592f4645f7f35eabcc8f61ef97610be8f8dff5d86f388ab2c28fe1` = celui du G2 aux chemins près, les 16 tests du lot) : **30/30 tuées**, dont les **13 ex-survivantes** G-3, G-8b, G-8c, G-12, G-15, G-16, G-17, G-18, G-19, G-20, G-22, G-25, G-26 (`g2-mutants.txt` `ee93f4aa89b99aaf03f6985b0a5c10f72cc16e7eed9e40a2a3b7958e86a40f2f`).
- Total : **62/62 tués** ; aucun mutant équivalent déclaré.

**Oracle** (sept gates sur le clone `F:/tmp/dojo/pr2-2-corr/clone`, sous verrou d'hôte « corr PR-2-2 » ; scripts `locked.sh`, `run-oracle.sh`, `all.sh` = ceux du G2 au propriétaire et aux chemins près ; Node v24.15.0 ; huit variables payantes retirées, TEMP/TMP sur F:) :
- **Premier passage** (verrou attendu 2 340 s, tenu par « corr PR-4a-1 » puis « corr PR-2b-2 » ; pris 12:00:24Z, rendu 12:10:56Z ; archivé `oracle-pass1/`) : **6/7** — `lint:ratchet` exit 1 (`70/69`) : une lecture non typée de `plan.json` (`JSON.parse(…).beacon`) venue du prototype du G2, `no-unsafe-member-access` réactivé par le cliquet sur les tests ; `test` 1 407 / 1 405 / 0 échec / 2 skipped ; test 42 2/2. Correction : lecture typée (`as { beacon: unknown }`, 0 ligne) ; sonde du cliquet (script hors dépôt, copié puis retiré de `scripts/` du worktree et du clone le temps d'une exécution) : 0 violation dans le test et le helper du lot.
- **Passage final** (verrou pris sans attente 12:11:37Z, rendu 12:25:16Z ; `oracle-final/`) : `exits.txt` **7/7 exit 0** (`gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet` **69/69**, `lang:gate` 0 occurrence, `export:check`) ; `test` : **1 407 tests, 1 405 pass, 0 fail, 0 annulé, 2 skipped** (préexistants ; 1 405 du G1 + 2 tests du lot) ; les 16 tests du lot ✔ par nom, et ✔ `no_secret_in_repo`, `deps_hygiene_monark_imports_are_declared`, `bell_publish_bare_label_guard_pins_operator_vocabulary`. sha256 : `test.log` `82313f964021774eca450e27805b7101722128f8ff021edd14f9f24b2ed8cffd` ; six journaux de gate aux sha du G1 et du G2 (`f1b1a916…`, `03481a8f…`, `f845417c…`, `45ede4ce…`, `b22ac8f8…`, `2f9645a9…`).
- **Test 42 à part**, après la suite, sous le même verrou (12:20:46Z → 12:25:16Z) : exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 269 s (`test42.log` `5f9a5e8bf9e275e794b7ad4ef1b1962910c87a886654e2b13cfd9b3f49eb044c`).
- **Processus node (C-V-4)** : 26 à la prise (12:11:37Z), 22 au rendu de la suite (12:20:46Z) et au rendu du test 42 (12:25:16Z) : quatre PID de la prise absents ensuite (149352, 186860, 59808, 96432 : présents avant la passe, non lancés par elle), aucun PID nouveau : aucun processus laissé. Mes mutants du passage final ont couru pendant la suite verrouillée, sur l'autre clone (charge partagée, sans effet mesuré : 0 échec).

### 14.6 Corrections du journal (C-G2-7 ; ajout seul, ces lignes font foi sur §1, §9, §10, §11)

- **§9** : « URL littérales … dans les tests, une seule » est inexact : le helper `collect-chain.ts` porte aussi, comme clé de son stub (table `OPS`), le nom d'hôte littéral de l'hôte fixe du libellé public du garde (test seul, jamais résolu, piège DNS armé) ; `apps/dojo/src` n'en porte aucun. Le littéral reste : le stub doit reconnaître l'hôte que le garde résout.
- **§10** : « forme de la réponse v1 d'une ronde : non mesurée » cède : mesurée par l'orchestrateur (FAITS drand, section « Forme v1 d'une ronde », 10:30:50Z), et l'extraction du code rejouée par le G2 sur les deux réponses relevées (acceptées) ; commentaire du helper mis à jour.
- **§11 Q-7** : « un jour sans répertoire n'est ni clos ni reporté » était inexact : le report se propageait d'un jour par passage (la clôture de d crée `bundles/<d+1>/` et son `eve.json`), et un arrêt entre `publish/SHA256SUMS` de d et `eve.json` de d+1 bloquait tout ; après C-G2-3, un passage clôt tous les jours manqués.
- **§1, état du worktree** : `docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` modifié par l'orchestrateur après le G1, puis versé au `21eb5ec`.

### 14.7 Questions à l'orchestrateur

- **Q-C1** (observation 2 du G2) : `Retry-After` n'est pas plafonné et les verrous d'opérateur restent tenus pendant l'attente ; la fenêtre reste protégée par le contrôle de `read_at` (rien n'est écrit après t_i + 600 s), pas la durée des verrous. Proposé : plafonner l'attente au reste de la fenêtre (t_i + 600 s − maintenant, ≈ +1 ligne, +1 assertion, 1 mutant) dans une passe ultérieure, ou item DOJO-RETRY-AFTER-CAP-1 déclenché au G0 de PR-3b-1. Décision ?
- **Q-C2** (observation 4 du G2) : un `readings/<i>.json.tmp` laissé par un arrêt brutal pendant `writeAtomic` fait refuser la disposition (`layout_stray_file`) pour toujours ; proposé : la clôture retire les `*.tmp` de `readings/` avant d'écrire `readings/SHA256SUMS` (≈ +1 ligne, +1 assertion), ou consigne d'hôte (retrait manuel) au G0 de PR-3. Décision ?
- **Q-C3** (Q-G2-5, lecture) : « ne bloque pas les jours suivants autrement que par la chaîne d'Eve » a été lue comme une propriété : le plan du jour (β) et les lectures échues courent malgré l'arrêt, le pas rend `eve_missing` ensuite, et un dépôt tardif reprend la chaîne. Lecture confirmée ?
- **Q-C4** (C-G2-7, §9, lecture) : « hôte public nommé dans le helper : remplacer par un libellé neutre » a été lu comme une consigne de rédaction du journal (§14.6 décrit la clé du stub sans écrire le nom d’hôte) ; le littéral reste dans `collect-chain.ts:24`. L’autre lecture (retirer le littéral du helper) exige que le stub tire l’hôte du garde au lieu de le porter (export du garde ou résolution par libellé), hors du périmètre du lot. Lecture confirmée ?

### 14.8 `error_origin` proposés (à assigner au G7)

C-G2-1, C-G2-2, C-G2-4, C-G2-5 = générateur du G1 ; C-G2-3 = planificateur (ordre de D-7 sans reprise, décision Q-7 postérieure) et générateur (instantané de `readdirSync`) ; C-G2-6, C-G2-7 = générateur ; Q-G2-3 = générateur (« i ∈ 1..K » de D-1 lu comme borne d'argv) ; Q-G2-4 = planificateur (« réponses brutes » de D-7 sans transport qui expose les octets) ; Q-G2-5 = planificateur (acte A-11 sans échéance écrite).

Livraison : `F:/tmp/dojo/pr2-2-corr-deliver/` (fichiers du lot, ce journal, l'ADR, `harness/`) et `DELIVERED.sha256` ; sha256 de ce journal rendu hors du fichier.
