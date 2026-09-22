# G1 BELL-SHORTPAGE-1 (Opus 5.5) — sonde de page finale + C-8 + fsync

Modèle résolu : claude-opus-5-5[1m]

# Rendu G1 — Lot BELL-SHORTPAGE-1 (worker Opus 5.5, effort max)

Les corrections cp-1 C-1 à C-5 et le ruling C-6 sont traités. Oracle final : 930 tests, 929 pass, 0 fail, 1 skip nommé. 30 mutants sur 30 tués par leur test désigné et restaurés à l'octet près. R-25 = 322 lignes. Les 9 sha gelés U-4b sont identiques avant et après. Aucun commit (R-20), aucun réseau, aucun appel Helius.

## Coupure de courant (vers 20:3x UTC)
J'ai contrôlé l'état avant de reprendre :
- **Octets NUL :** aucun, fins de fichiers intactes.
- **Rejeu :** mes éditions rejouées sur `git show HEAD:<fichier>` donnent un résultat identique au disque pour les deux fichiers.
- **node_modules :** intact.

## Corrections checkpoint-1 et ruling C-6 (toutes closes)
| # | Ce qui est fait | Preuve |
|---|---|---|
| C-1 | Ordre sonde, puis ancre C-8, puis commit (`scanFullMint` `:351-359`). L'ancre est déplacée, jamais rejouée (`:373`). Sonde et ancre passent par `retry(() => call(...))`, avec les mêmes paramètres que la page plus le token. « Vide » = 0 tx brut, quel que soit le token. Une seule sonde. | tests (c) et (f) ; mutants M02, M03, M11, M14, M17 |
| C-2 | Amendement **D1-nonies** pour `ADR-T1aii…` (§ = sections de `ADR-amendement.md`) : C-B-1 replié d'abord (sources lues), puis la relaxation avec un énoncé de sûreté précis, les tuyaux, la D-n (i)-(v). Marqueur d'époque dans `budget.json` : **non**, motivé. | `ADR-amendement.md` §1, §3, §5, §6 |
| C-3 | `:1027` et `:1112` reformulés : fixture seule, plus une assertion renforçante chacun, aucune retirée. 9 tests nouveaux. | table de mutants dans `G1.md` §5 |
| C-4 | Les 4 modes MAST nommés avec leurs contre-mesures. | ADR §7 |
| C-5 | `ledger-format-lock` rejoué seul : `ok 1 - ledger_format_locked_to_rebase_crosscheck`. `LedgerRecord` ne gagne aucun champ. Provenance additive `short_final_page_probe` dans l'artefact et le rapport ; lecteurs déclarés. | `lock.log` |
| C-6 | Tout écrit du module passe par `DURABLE_FS` : ajout, fsync, fermeture pour la ligne de ledger ; fichier `.tmp`, fsync, fermeture, renommage pour chaque JSON. | test `…writes_are_durable_fsync…` via `runMain` ; mutants M22 à M28 |

## Tests et mutants
- **9 nouveaux tests.** Ils couvrent le chemin heureux, la sonde non vide avec une ancre qui serait égale, la sonde vide avec une ancre différente, la reprise en 3 runs (idempotente), le mode `--allow-short-pages` sans sonde, le budget mordu sur la sonde et sur l'ancre, un test d'intégration par la garde réelle (seul `globalThis.fetch` bouchonné : 4 lignes gTfA helius et 40 crédits, contre 3 lignes et 30 pour le contrôle sans token), le retry de la sonde, et la durabilité.
- **30 mutants**, harnais en sortie TAP avec attribution au test désigné. Chaque trace porte son en-tête (sha de l'arbre, version de node, commande exacte). Un marqueur restaure les fichiers si un run est interrompu par une coupure.
- **Un mutant de la consigne n'est pas exprimable :** « sonde hors `call` budgété ». Le seul accès réseau de `scanFullMint` est `call`, qui est déjà l'appel budgété. Je l'ai déclaré sans le simuler ; ses formes exprimables (M05 sonde fabriquée sans appel, M16 routée hors helius, M18 erreur avalée) sont tuées.

## Oracle et invariants
- **Base `de30eab` :** 921 tests, 920 pass, 0 fail, 1 skip.
- **Final :** 930, 929, 0, 1 skip (`u4b_labels_replay_via_main_real_artifact`). Les sept étapes sortent à 0, `lint:ratchet` reste à 69/69.
- **Écart avec la mission :** elle annonçait « 934+n ». La base mesurée sur `de30eab` est 921 ; la mesure fait foi (D-n 1).
- **R-25 :** 322 lignes (281 insertions, 41 suppressions), mesurées avec la pathspec verbatim de `ci.yml:65`.
- **Fichiers livrés :** `rebase-crosscheck.ts` `d50901b7…`, `rebase-crosscheck.test.ts` `f32de2bd…`.

## Décision pour vous
Sur `budget_exhausted`, la provenance de la sonde vaut `null`, alors que la sonde a été faite et facturée. Je l'ai déclaré (ADR §3) plutôt que de toucher au code : aucune décision de règle n'est atteinte et la reprise refait la sonde. Si vous préférez la tracer, il faut poser la moitié « sonde » avant l'ancre et la propager dans le retour du `catch`, puis ajuster le test (f).

## Autres déviations déclarées
- `--max-pages` ne borne pas la sonde, qui n'alimente pas `fetched`.
- C-6 est appliqué à tout écrit du module, densité et troncature de queue comprises.
- La couture C-6 est un objet exporté plutôt qu'un paramètre, pour que le test couvre le vrai câblage via `runMain` sans toucher `collect.ts`.
- F-2 : il reste un seul caractère non ASCII dans le diff, le libellé pré-existant `(α)`.
- Correction faite après l'avis de l'advisor : R-C6-1 est une dérive bornée d'une page de provenance, pas un fail-closed garanti.

## Actions pour vous
- Insérer `ADR-amendement.md` sous le nom D1-nonies. Dans le même commit, porter les chiffres C-6 dans `docs/CHANTIERS.md` (I-SP-4) et committer `docs/CHECKPOINT1-lot-bell-shortpage-1.md` (I-SP-5).
- Fusionner après `mint_end-AAPLx` et avant `mint_start-NVDAx`, jamais sur un `mint_resume`. La fin d'AAPLx relève encore de la procédure 135 (a).
- Ajouter la ligne ANCHORS « époque shortpage » (I-SP-1).
- Lancer `rm-nm.ps1` sur le worktree après le G2.

Fichiers dans `F:\tmp\bellsp1\` :
- G1.md
- ADR-amendement.md
- DELIVERED.sha256
- mutants.mjs
- mutants.log

Fichiers touchés (worktree `F:\Monark-wt-bellsp1`) :
- F:\Monark-wt-bellsp1\apps\bell\src\rebase-crosscheck.ts
- F:\Monark-wt-bellsp1\apps\bell\test\rebase-crosscheck.test.ts
