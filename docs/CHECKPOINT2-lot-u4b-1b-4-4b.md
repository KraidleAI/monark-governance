# Re-checkpoint-2 micro-pli U-4b-1b-4b (206bc56) — validateur-humain claude-fable-5-1, 2026-09-23

Modèle résolu : claude-fable-5-1

# RE-CHECKPOINT-2 — micro-pli U-4b-1b-4b (`lot/u4b-1b-4` @ `206bc56`, parent `30a2eee`) — **ACCEPTE-AVEC-CORRECTIONS**, conditionné au re-G2 rendu et concordant au G7

Rendu au fil de l'eau : `F:\tmp\cp2-u4b1b4\CP2-4b.md` (sha256 `2743ba4a5ea800af12c73dd0faf0ad17ed16da73bdf9ce5a443c5141c40f3800`), index A-12 des journaux : `F:\tmp\cp2-u4b1b4\logs\A12-INDEX-4b.txt`. Le cp-2 précédent reste `F:\tmp\cp2-u4b1b4\CP2.md` (`e0ff7c20…`).

## 1. Checkpoint RE-LIVRABLE — artefacts lus
`F:\Monark\docs\G2-lot-u4b-1b-4.md` (intrant, lu maintenant), `F:\tmp\u4b1b4\RENDU-MICROPLI-4b.md`, `F:\tmp\u4b1b4\{DELIVERED.sha256, mutants.mjs (39, c9eacb62…), orch4b\}`, `git diff 30a2eee 206bc56` (3 fichiers, +116/−10, intégral), `docs/CHANTIERS.md:935,936,949`, `docs/course-ukemi/SIDECAR…` (Sidecar 0-3), `.github/workflows/ci.yml:43`, `scripts/census/u4-guard.mjs:100-106`, `u4b-select-episode.mjs:22-31`, `test/guard-scripts-u4.test.ts:436-438`. Non ouverts : `F:\course-ukemi\*`, `F:\course-bell\*`, re-G2.

## 2. Rejeux (clones `tree-4b` @ 206bc56, `tree-es2` @ `fad24ab`, `tree` @ 30a2eee ; `env -u` ×8 ; TEMP sur F:)
- Oracle 7 gates : tous exit 0, **952/950/0/2** (mêmes 2 skips). Fusion à blanc sur `lot/etude-suite` @ **`fad24ab`** → `9d4dd01`, 0 conflit, blobs = 206bc56, oracle fusionné **977/975/0/2**.
- **39/39 mutants** tués par leur test nommé (harnais du worker, TREE/TMPF seuls changés) ; **phase AVANT sur `30a2eee` : 13/13 survivants + MG13 = golden** — les 14 mises à mort sont dues aux tests du pli.
- Mes 4 mutants propres : VX-L1 (`--ledger-dir ""` accepté), VX-D1 (`decide` : `null === null` ⇒ GO), VX-E1 (refus ⇒ exit 3) tués ; **VX-L2 SURVIVANT** : racine du garde neutralisée — un `--ledger-dir` SOUS le dépôt serait accepté par la sonde ; 0 test rouge (le refus « sous la racine » est épinglé pour le prober et le sélecteur, pas pour la sonde) ⇒ trou de test, code golden correct, pas de faux GO.
- A-6 **14/14** ; DELIVERED **8/8** ; R-25 verbatim `ci.yml:65` : cumul **903** (pli seul 116/10), gate CI `VIBEGATES_PR_LIMIT = 1205` ; export réel 206bc56 vs 30a2eee : **0 fichier** (330/330).
- Contrôles runbook sur la sonde corrigée : C-7-bis/C-9-bis/réducteur/C-10-bis exit 0, GO→C-12 0, STOP→C-12 3 ; instance R-1b4-2 GO 0/STOP 3 ; **scénario C-G2-1 hors test** : CLI réelle depuis un cwd hors dépôt sans `--ledger-dir` ⇒ `FATAL … is required`, exit 1, cwd vide, aucun `--out`.
- Chronologie CA-2 : `30a2eee` committé **2026-09-22T22:21:03Z**, PREREG-DELTA (D-5 `max(B_fresh, 23 545 087)`) 22:10:56Z, mon cp-2 23:4xZ ; sélection de l'épisode frais **2026-09-23T00:17:02Z** avec B0 23 414 968 < 23 545 087 ⇒ la branche D-5 est la branche vive, fixée avant la donnée.

## 3. Checklist
CA-1 conforme · **CA-2 conforme** : dérogation R-25 = lecture (903 < gate ADR 1205 ; 800 = cible indicative cp-1, 1 150 = règle orchestrateur ; pli test-only sauf 4 lignes de refus) ; I-6 = D-n fail-closed (l'étape 1 n'importe aucun des 8 fichiers du lot — imports vérifiés) sous conditions C-V4b-2 · CA-3 correction maintenue (amendement ADR, ADDENDUM-2, deltas RUNBOOK toujours hors dépôt — actes G7 journalisés) · CA-4/5 conforme · CA-6 conditionné au re-G2 · CA-7 corrections (items périmés PREREG-DELTA :53/:143, ADR-amendement :97 ; VX-L2) · CA-8 conforme (`error_origin` worker confirmé) · CA-9 conforme · CA-10 conforme · **CA-11 conforme** (le test C-G2-1 exécute la CLI réelle en enfant depuis `mkdtempSync(tmpdir())` hors dépôt, `fetch` levant, contenu exact du cwd asserté — reproduit par moi) · Anti-close n-a.

## 4. Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée)
- **C-V-1..C-V-4** maintenues (porteur orchestrateur ; G7 / avant 2c-bis / fusion `<HEAD_E2>` / item), avec `8bdb1478` et R-25 903 portés dans PREREG-DELTA :53/:143 et ADR-amendement :97.
- **C-V4b-1** (CA-2, docs-only ; orchestrateur ; à la rédaction de l'ADDENDUM-2, avant 2c-bis) : citer la fixation a priori de `max(B_fresh, 23 545 087)` (`30a2eee` 22:21:03Z, PREREG-DELTA 22:10:56Z, cp-2 23:4xZ < sélection 00:17:02Z) — sans cela, une règle écrite après la donnée est indistinguable d'une règle post-hoc.
- **C-V4b-2** (CA-2/I-6, docs-only ; orchestrateur ; G7 = `<HEAD_E2>`) : Sidecar « gel `<HEAD_E2>` » avec sha des blobs fusionnés (`4ed4c31e`, `8bdb1478`) re-mesurés ; aucune étape ≥ 2c-bis avant cette ligne ; arbre d'exécution 2c-bis/5 épinglé au sha de fusion (calque R-SP-C).
- **C-V4b-3** (CA-7, test-only, non bloquante pour la fusion ; prochain pli sonde ou micro-pli avant 2c-bis) : épingler le refus `--ledger-dir` SOUS la racine pour la sonde (VX-L2) dans `u4b_probe_cutoff_refuses_before_any_fetch`.
Aucune ESCALADE-INVESTISSEUR.

**AM-1** — attrapé : VX-L2 ; exigence de citation a priori pour l'ADDENDUM-2 ; conditions d'I-6. **Manqué (mon cp-2 précédent)** : C-G2-1 — `arg("--ledger-dir") ?? ""` était dans le diff que j'ai lu ; je n'ai jamais lancé la sonde depuis un cwd tiers sans `--ledger-dir`. Leçon fermée : tout `arg(...) ?? <défaut>` d'un script de course se rejoue depuis un cwd hors dépôt.

## 5. Innocuité
`F:\Monark` : 4 sha témoins identiques avant/après (`u4-oracle-path.mjs a2b39d0e`, prereg `1971d9b1`, ADDENDUM `eb7ad29b`, FAITS `4f23216d`), HEAD `f1b9f5d`→`fad24ab` par l'orchestrateur seul, `?? docs/course-ukemi/FAITS-mevblocker-2026-09-23.md` = sien. `F:\Monark-wt-u4b1b4` : `206bc56`, propre. Suppressions uniquement sous mon carve-out (dossiers plats, 0 jonction ; `node_modules` par `rm-nm.ps1` ×3).

Modèle résolu : claude-fable-5-1
