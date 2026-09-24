# Re-checkpoint-2 NARABI-OPS-1d (pli 7daf8e5) — ACCEPTE-AVEC-CORRECTIONS (forme)

Modèle résolu : claude-fable-5-1

# RE-CHECKPOINT-2 — LIVRABLE — pli NARABI-OPS-1d `e12f59f..7daf8e5` (branche `lot/narabi-ops-1d`, base `lot/etude-suite` `f6442fe`)

## 1. Artefacts lus et rejeu (AM-2 ter, contexte frais — G2-delta ignoré, aucun chiffre du PLI consommé sans rejeu)

Lus : `F:\tmp\nops1d\MISSION-G2DELTA-RECP2.md`, `RENDU-PLI.md`, `DELIVERED.sha256`, `mutants.mjs`, `linux-sigterm-trace.log`, `linux-sigterm-mutant-V6.log`, `ci-88-sigterm-trace.log`, `F:\tmp\g2-garde2bi\mk-nm.ps1` ; dans le dépôt (lecture seule) : `docs/CHECKPOINT2-lot-narabi-ops-1d.md` (mon avis précédent), `docs/G2-lot-narabi-ops-1d.md`, `docs/CHANTIERS.md:783-808` (rulings C-V-0 = (b), C-V-1), `docs/PLI-lot-narabi-ops-1d.md` (`58a1ff0`), `docs/CONSIGNE-STANDARD-G1.md:50` (A-11), `.github/workflows/ci.yml:65`, `apps/sentinel/src/run.ts:240-300`, `packages/rpc-guard/src/client.ts:64-77`, le test file au pli ; en ligne (gh, lecture) : PR #88, runs `35763895313`/`35769452047`, job `106887215941`, commit `0f2c2d9`.

Rejeu (trois clones, tous sous `F:\tmp\cp2-nops1d\`) :
- `tree-delta` (win32) : `git clone --no-hardlinks --branch lot/narabi-ops-1d` ⇒ HEAD `7daf8e5`, status 0 ; `mk-nm.ps1` ⇒ `entries: 220 monark: 10 fail: 0`, `require.resolve('@monark/rpc-guard')` → `F:\tmp\cp2-nops1d\tree-delta\packages\rpc-guard\src\index.ts` (A-2) ; `TEMP/TMP/TMPDIR=F:\tmp\cp2-nops1d\tmp-delta` ; tout sous `env -u` des 8 clés.
- `tree-linux`, `tree-linux2` (docker `node:24` déjà présent localement, image `b795e77f6c25`, aucun pull ; node v24.21.0 Linux x86_64 ; `npm ci --cache F:/tmp/cp2-nops1d/npm-cache` ; `paidkeys=0` dans l'env du conteneur, vérifié).
- Logs : `F:\tmp\cp2-nops1d\logs\{delta-ci,delta-mutants12,delta-mut-one,delta-gates,delta-gate-*,docker-linux-7daf8e5,docker-linux2-7daf8e5,docker-v6-linux-7daf8e5,ci-7daf8e5-g3,merge-tree-delta,merge-tree-delta-b130852}.log`, `delta-mut-{floor,origin}.tap`, `tmp-linux\ci-linux2.log`, `tmp-linux-v6\v6-linux.tap`. Harnais à moi : `F:\tmp\cp2-nops1d\{mut-one-delta.mjs,v6-linux.mjs,probe-floor-delta.mjs}`.

**Preuve d'innocuité (AM-2 bis/ter)** — AVANT : `F:\Monark` HEAD `a872716`, status 0, stash 0, `rpc.ts 0e232519…`, `run.ts 54619a40…` ; `F:\Monark-wt-nops1d` HEAD `7daf8e5`, status 0. APRÈS (dernier relevé, tous rejeux finis) : `F:\Monark` HEAD **`b130852`** (quatre commits de l'orchestrateur pendant mes rejeux : `5a7c066`, `7b99737`, `50f6d12`, `b130852` — activité orchestrateur, pas la mienne), status 0, stash 0, `rpc.ts 0e232519…` identique ; `lot/narabi-ops-1d` = `7daf8e5` inchangé ; worktree `7daf8e5`, status 0, `run.ts 45557d6e…`, test `3535eda2…` ; les trois clones status (hors `??`) 0, `run.ts 45557d6e…` restauré partout ; `DELIVERED.sha256` 8/8 OK sur `tree-delta` ; 0 `narabi-guard-*` sous `C:\Users\KACIMI\AppData\Local\Temp` ; 0 conteneur restant. Aucun `git` d'écriture, aucune installation globale.

**Déviations à moi (error_origin validateur)** : (i) un `git merge-tree --write-tree` exécuté une fois dans `F:\Monark` ⇒ objets libres écrits dans `.git\objects` (aucune ref, index ni arbre de travail touchés ; `count-objects` 153 relevé) — écriture au sens strict d'AM-2, consignée ; le second dry-run (contre `b130852`) a été fait dans le clone après `git fetch`. (ii) Couche d'écriture des conteneurs sur le stockage Docker Desktop (C:) ; TMPDIR et cache npm sur F: (même pratique que la trace orchestrateur). (iii) Premier rejeu docker complet avec `TMPDIR` DANS l'arbre (`/w/.tmp`) ⇒ 75 rouges de bruit d'environnement, cause mesurée : `ledger_path_is_outside_out_and_repo` (« the ledger is OUTSIDE the repo tree ») et `no_secret_in_repo` (ENOENT sur `/w/.tmp/bell-univ-…` en marchant l'arbre), cascade u4/u4b ; rejeu refait sur clone frais avec `/t` hors arbre ⇒ tout vert (ci-dessous). Pas un défaut du lot.

## 2. Vérifications refaites (mission items 1-8)

1. **Diff du pli exact** : `git diff e12f59f..7daf8e5` = 1 fichier, +37/−0, `apps/sentinel/test/sentinel-chainstack-guard.test.ts` (10 → 12 tests, insertions pures, aucune assertion existante touchée). `run.ts` **`45557d6e…` byte-identique** aux deux commits ; `rpc.ts` `0e232519…` = gel D4 ; les 9 gelés recomputés depuis les blobs `7daf8e5` : `2f9a31f6 / a5e66cd3 / 5733daeb / 7bee76fc / 3376eb08 / 9206df91 / 0e232519 / 3603265d / cb020425` — tous identiques à mon avis précédent ; `git diff --stat e12f59f..7daf8e5 -- scripts/census apps/sentinel/src packages docs/adr` = vide.
2. **Test floor malformé** : sur code réel `ok 9` (win32 et Linux). Mutant `floor_regex_removed` ⇒ **rouge**, assertion tueuse mesurée (`delta-mut-floor.tap`) : `floor "-3": the leg did not open => chainstack=false` (`true !== false`). **Mesure par valeur** sous le mutant (`probe-floor-delta.mjs`, `openChainstackLeg` importé, cycle + origine + parent ledger posés) : `abc` ⇒ `config_error`, `-3` ⇒ **`ok`**, `12.5` ⇒ **`ok`**, `7` ⇒ `ok` ; restauration sha vérifiée. `client.ts:72-74` confirme : `assertLimits` ne rejette qu'un floor non fini ou `> cycleCap` ⇒ un floor négatif passe sans la regex. La revendication « `12.5` discrimine aussi » est désormais mesurée, pas raisonnée.
3. **Test origine absente** : code réel `ok 10`. Mutant `origin_absent_half_removed` ⇒ **rouge** par le test nommé ; assertion tueuse mesurée (`delta-mut-origin.tap`) : `the leg did not open => chainstack=false` — **pas** l'assertion « every published endpoint is a non-empty string » (ordre des `assert` : `status`, `chainstack`, `chainstack_guard`, puis `endpoints`). Voir C-RV-2.
4. **12 mutants rejoués** (`F:\tmp\nops1d\mutants.mjs`, `NOPS1D_WORKTREE=tree-delta`, `env -u`) : `ALL MUTANTS KILLED (RED by named test) + RESTORED BYTE-EXACT (12 mutants)`, exit 0, `byIntended=true` pour les 12, chaque tueur nommé conforme à la table du PLI (`delta-mutants12.log`).
5. **Oracle `env -u`** win32 (`npm run ci`) : **933 / 931 / 0 / 2**, exit 0 ; `gate:vocab` 222 fichiers 0 hit ; skips nommés : `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `u4b_labels_replay_via_main_real_artifact` (artefacts e2). `lint` 0, `lint:ratchet` 0, `lang:gate` 0, `export:check` 0. **Oracle Linux** (docker, clone frais, TMPDIR hors arbre) : **933 / 932 / 0 / 1** (SIGTERM ✔, seul skip = artefacts e2), 4 gates 0.
6. **R-25** recomputé au pathspec `ci.yml:65` verbatim : `f6442fe..7daf8e5` = 641+/93− = **734 < 1 150** ; lot seul `f6442fe..e12f59f` = 697 (== G2) ; delta du pli +37.
7. **Traces Linux C-V-1** : voir §3.
8. **Fusion à blanc** : `git merge-tree --write-tree` contre `a872716` (exit 0, arbre `aabf138b…`) puis contre le HEAD courant **`b130852`** (exit 0, arbre `1d02e82f…`), aucun conflit ; `origin/lot/etude-suite...HEAD` = 8 fichiers, 641+/93−.

## 3. Les deux traces Linux closent-elles C-V-1 ? — Réponse : **pas par elles-mêmes ; C-V-1 est CLOSE par identité byte + mes propres rejeux**

- Les deux traces livrées sont **antérieures au pli**, toutes deux sur `e12f59f` : `ci-88-sigterm-trace.log` porte `tests 931` et 18:12Z = run `35763895313` (headSha `e12f59f`, jobs démarrés 18:12:12Z) ; le docker est déclaré `@ e12f59f` (CHANTIERS:784) et montre 10 tests. Toutes deux sont des **extraits** (pas de commande, pas de sha d'arbre en tête) — passation R-21 incomplète. Elles ne satisfont pas littéralement ma clause « sur le sha rebasé » du pli.
- Ce qui clôt : (a) `run.ts` `45557d6e…` et le test SIGTERM byte-identiques entre `e12f59f` et `7daf8e5` ; (b) **run CI `35769452047`, job `106887215941`**, lu de première main : checkout `refs/remotes/pull/88/merge` = `0f2c2d9` « Merge 7daf8e5 into f6442fe », **arbre `4c946086…` == `7daf8e5^{tree}`** (vérifié `gh api` vs `git rev-parse`), `sentinel_run_releases_chainstack_lock_on_sigterm` ✔ à 18:47:33Z, 933/932/0/1 ; (c) **mes rejeux** : fichier guard sous docker sur `7daf8e5` **12/12, 0 skip, SIGTERM `ok 12`** (`docker-linux-7daf8e5.log`) ; **mutant V6** (`process.on("SIGTERM")` retiré) sous Linux sur `7daf8e5` ⇒ **rouge** par le test nommé, message `the child exited after SIGTERM (the handler ran then process.exit)`, 11/1, restauration `45557d6e…` — mesuré deux fois (`tree-linux`, `tree-linux2`).
- **C-V-1 : CLOSE.** Correction de forme au G7 (C-RV-1).

## 4. Checklist

| Règle | État | Preuve |
|---|---|---|
| CA-1 | conforme | Les deux tâches du pli (C-V-2, C-V-3) sont chacune un test nommé + un mutant rouge attribué, rejoués par moi (§2-2/3/4). |
| CA-2 | conforme | Pli test-only, aucune décision de valeur ; C-V-0 tranché option (b) par l'orchestrateur (CHANTIERS:783) — ma condition « (a) ou (b) ⇒ aucune escalade » est **remplie**. |
| CA-3 | conforme (items formés) | Aucun gate suspendu ; C-G2-1/C-G2-4/C-V-4 (amendements ADR datés + tuyaux, ADR-U4b AVANT==APRÈS pour -1d) = actes orchestrateur au G7, propriétaire + déclencheur nommés, pas de « dû » nu. |
| CA-4 | conforme | Mono-worker pli ; G2-delta ‖ re-cp-2 = indépendance de vérification, pas débit. |
| CA-5 | conforme | PLI §6 : FM-2.4 contré A-8 (stub réutilisé, vérifié), FM-3.3 contré `env -u` (appliqué à tous mes rejeux, `paidkeys=0` en conteneur). |
| CA-6 | **conforme** | Oracle re-exécuté (win32 + Linux) ET revue G2 (PASS-AVEC-CORRECTIONS amont ; G2-delta en parallèle) ; chemin SIGTERM désormais tracé sur l'arbre exact et par mon mutant (§3). |
| CA-7 | conforme | C-V-2/C-V-3/C-G2-2 clos par preuve ; C-V-5 clos pour le lot **et** résiduel clos : A-11 inséré `docs/CONSIGNE-STANDARD-G1.md:50` (`58a1ff0`) ; `docs/PLI-lot-narabi-ops-1d.md` == `RENDU-PLI.md` octet pour octet. |
| CA-8 | conforme | R-1 worker `claude-opus-4-8[1m]` (licite au moment du pli ; décision 133 à effet au redémarrage) ; générateur ≠ relecteur ≠ validateur ; provenance à corriger sur un point (C-RV-1). |
| CA-9 | conforme | Trois clones isolés, `node_modules` re-pointés / `npm ci` en conteneur, `env -u`, codes hors pipe, 12 mutants + V6 rejoués et attribués par moi. |
| CA-10 | conforme | Aucun argument de vitesse ; pli +37 lignes, 734 cumulé. |
| CA-11 (+ durci) | conforme | Les deux tests EXÉCUTENT la composition depuis l'artefact réel (`spawnSync` du vrai `run.ts` sur la fixture committée, garde réel, ledger réel, seul `fetch` bouchonné) et lisent la ligne servie `timeline.jsonl` ; pas de grep-sur-source. |
| Anti-close | n-a | Lot non Bell ; `-3`, `12.5`, `abc` sont des vecteurs synthétiques de floor, aucune valeur de marché. |

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée, toutes de forme, propriétaire orchestrateur, déclencheur G7)

- **C-RV-1 (provenance C-V-1)** : le journal de provenance cite le run `35769452047` / job `106887215941` (arbre `4c946086…` == `7daf8e5^{tree}`) et mes logs `docker-linux-7daf8e5.log`, `docker-linux2-7daf8e5.log`, `docker-v6-linux-7daf8e5.log` ; l'artefact `ci-88-sigterm-trace.log` est ré-étiqueté « run 35763895313 @ e12f59f » ; `linux-sigterm-{trace,mutant-V6}.log` notés « @ e12f59f, extraits ».
- **C-RV-2 (libellé A-10 du PLI, `58a1ff0`)** : le mutant `origin_absent_half_removed` rougit sur `chainstack=false`, pas sur « `endpoints.length === 8` / 8ᵉ non-chaîne » comme l'écrit le PLI §1 test 2 — mécanisme exact, assertion tueuse inexacte. Le liage de sortie reste tenu (assertions `length` + `every string` exécutées sur l'artefact réel ; un `null` publié est tué par `origin_published_without_open` via la longueur). Erratum d'une ligne dans le PLI doc ou note G7.
- **C-V-0** : option (b) tenue — G7 + fusion locale après ce pli, 2ᵉ redéploiement seulement après le pli §11-1 avec G2-delta + re-cp-2. Aucune escalade.

Rien ne bloque le G7 : 12/12 mutants tués `byIntended`, oracles 933/931/0/2 (win32) et 933/932/0/1 (Linux, arbre exact), 4 gates 0 sur les deux plateformes, R-25 734, 9 gelés identiques, `DELIVERED.sha256` 8/8, fusion à blanc propre contre `b130852`.

**AM-1 — ce que la checklist a attrapé** : les deux traces présentées comme closant C-V-1 sont antérieures au pli (`e12f59f`) et sont des extraits sans en-tête reproductible — la clôture tient à l'identité byte de `run.ts` et à ma ré-exécution (CI sur l'arbre exact lue de première main, guard-file 12/12 et V6 rouge sous Linux sur `7daf8e5`) ; l'assertion tueuse du mutant origine n'est pas celle que le rendu annonce ; « `12.5` discrimine » était raisonné, désormais mesuré (`ok` sous le mutant).

**R-1** : `claude-fable-5-1`. Chemins de rejeu : `F:\tmp\cp2-nops1d\tree-delta` (win32), `F:\tmp\cp2-nops1d\tree-linux` et `tree-linux2` (docker `node:24`). Aucune écriture dans `F:\Monark`/`F:\Monark-wt-*` hors les objets libres déclarés (déviation i), aucun `git` d'écriture, aucune installation globale, aucune valeur d'environnement payante lue ni affichée.
