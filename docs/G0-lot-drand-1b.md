claude-opus-5-5

# G0 — journal et plan du lot bloquant DRAND-RELAY-GET-1b (consommateur des relais drand dans `collect.ts`, TU-B, et items routés à son G1), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré à la session ; préfixe `claude-opus-5-5`). Rôle : planificateur-worker, contexte frais. Ne committe pas (R-20), ne lance aucun workflow. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` : git en lecture seule (`status`, `rev-parse`, `branch`, `log`, `show`, `cat-file -t`, `diff --stat`, `worktree list`).
- **Mission** : `F:/tmp/dojo/plans/mission-g0-drand-1b.md` (20 l.), sha256 `58926275b18d2c2e2739f6c28c7ee99a984aa4f5e8979a06681c1c74bc818d98` recalculé à 23:16:03Z, égal au champ `sha` du reçu `F:/tmp/dojo/plans/mission-g0-drand-1b.recu.json` (sha256 `1ba876cd94f7b1971189d2f366cddda5ff7acb4bdf248d8e1318bd28893c1c72` ; verdict `vert`, douze codes du linter à 0, `base` = `head` = `ae330bf4`). Règles communes `docs/methode/REGLES-MISSION.md` lues en entier (sha256 `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335`, égal au tronc et au worktree).
- **Worktree** : `F:/Monark-wt-drand-1b`, branche `lot/drand-1b`, HEAD `ae330bf47ca9abb61132918b74466ba53f569a9d` = base (tronc). Arbre propre annoncé : `git status` « nothing to commit, working tree clean » à 23:16Z, 0 ligne `--short` à 23:39:10Z. Le tronc `F:/Monark` a bougé depuis la base (`93ef10e1` au relevé `worktree list`, `7f18ea7f` à 23:39:10Z) : les lectures ci-dessous sont celles de la base `ae330bf4` ; le G1 relit à sa propre base (§9).
- **Horloge (`date -u`, 2026-09-30)** : 23:16:03Z ouverture, sha256 et reçu ; 23:16:23Z inventaire ; 23:16:59Z G0 et ADR de DRAND-1 ; 23:17:23Z collecteur et ses imports ; 23:17:59Z client drand du garde ; 23:18:32Z tests du collecteur ; 23:19:15Z ADR PR-2 et PR-3, puis sources citées ; 23:39:10Z et 23:46:15Z derniers relevés ; 23:47:34Z début d'écriture de ce journal ; 23:50:46Z premier contrôle d'octets ; 23:58:49Z ajouts de la seconde consultation ; sha256 final rendu hors du fichier.
- **Discipline** : aucun réseau, aucun outil de recherche distant, rien sur C:, aucun test ni harnais (lot documentaire). Un seul fichier écrit : ce journal ; aucun fichier existant modifié.
- **Sigles** : [INV] `F:/tmp/dojo/inventaire-page/INVENTAIRE.md` ; [DR] `docs/adr/ADR-RPC-GUARD-DRAND-1.md` ; [P2], [P3], [P2B], [P1B4] `docs/adr/ADR-DOJO-PR-2.md`, `ADR-DOJO-PR-3.md`, `ADR-DOJO-PR-2B.md`, `ADR-DOJO-PR-1B-4.md` ; [P3b2] blob `483d004c:docs/adr/ADR-DOJO-PR-3.md` ; [L299] blob `cdaf67c8:docs/adr/ADR-DOJO-PR-3.md` l.620-626 ; [EML] blob `a75f7f5d:docs/G0-lot-entry-main-link-1.md` ; [RB] `docs/RUNBOOK-dojo.md` ; [CH] `docs/CHANTIERS.md`. Numéros de ligne à la base `ae330bf4`, sauf blobs nommés.

## 1. Lu (sha256 relevés entre 23:16:03Z et 23:46:15Z)

| Entrée | sha256 | Lecture |
|---|---|---|
| [INV] (189 l.) | `2875738f152cb2ff992452cc7d7af2570efb3b3ee2bcd8181abcff190dbb6158` (préfixe `2875738f` de la mission) | §0 ; §1.A ligne LC-06 (l.25) et preuve commune (l.42) ; §1.B ; §1.C par recherche (LS-01 à LS-03, LS-18, LS-19) ; §2 (lu en plus) ; §3 ; §4 |
| `docs/G0-lot-rpc-guard-drand-1.md` (61 l.) | `a1e2ba95b2d2368fb4c6d6534720f5799ac02d996852a75fd948621b5187f9a1` | en entier |
| [DR] (134 l.) | `a7e3734cdd18f38ca6c90bb8c34538890a60c15b39c01e1f454cd891727017f3` | en entier |
| `apps/dojo/src/collect.ts` (274 l.) | `d257c08c259e16417852fb8d7eb782dcf7c210338dc622dd7f8f656933897352` | en entier |
| `apps/dojo/src/dojo-methods.ts` (29 l.) | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` | en entier |
| `apps/dojo/src/layout.ts` (97 l.) | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` | en entier |
| `apps/dojo/src/bundle.ts` (211 l.) | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` | en entier |
| `apps/dojo/src/reading.ts` (238 l.) | `b5908f852ca29d96c1d312caacfd64d43796fa62aae4e4bff2adc0491ceb01c8` | l.1-40 et liste des `export` seulement (`collect.ts` n'en importe que le type `Pair`, l.18) |
| `apps/dojo/scripts/dojo-core.mjs` (492 l.) | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | NON LU (importé par `collect.ts` l.16, hors de `apps/dojo/src/`, hors périmètre) |
| `packages/rpc-guard/src/client.ts` (173 l.) | `ef99818b3c996ceafb978fd8c73be628c73374aaa6f159666e0b1a10a488ba21` | en entier |
| `packages/rpc-guard/src/guarded.ts` (63 l.) | `e506d825fd1767ed79e3618963086194593e66984da106c2f2fdcf7f74ae5ff2` | en entier |
| `packages/rpc-guard/src/lock.ts` (44 l.) | `6655a9c82a40106f5069e0e971467713e91678c6b19f43aa1b912ad5a322c244` | en entier |
| `packages/rpc-guard/src/cli.ts` (58 l.) | `28cb5fb38290b13c16e196a1ad5cf00f02b6d735ecfada966105ee7e379cc558` | en entier |
| `packages/rpc-guard/src/index.ts` (31 l.) | `3e1ae1248c6085fc47a1697fa009e0ec3dbf0db6ad892fce580901246d2679dc` | en entier |
| `packages/rpc-guard/src/transport.ts` (301 l.) | `4ad8e9d9c450fff13cc9246783f9c31ec4d5614c54d2bb6889d6028c8f642ed6` | l.76-100, l.140-170, l.195-301 ; recherche `drand` |
| `packages/rpc-guard/src/ledger.ts` (221 l.) | `0a9699bc3bdf9abdac4df645340bd420acea2b45aa54853245f69279639afac4` | l.138-185 ; recherches |
| `packages/rpc-guard/src/errors.ts` (62 l.) | `8622947f93d158a1311b43d46651c6b7076a1574ecc5984c6f5169a82380c504` | l.1-30 |
| `packages/rpc-guard/test/drand-labels.test.ts` (119 l.) | `03f8f7c75c9cfb18aa70f0cc6ac634d4075070e040e2ac6ba49e5577f74a8368` | recherche seule |
| `apps/dojo/test/dojo-collect.test.ts` (509 l.) | `ad9e85561a259d54ee53b2168f87f0b47fe759afdf1976ef0f4050135c4cc602` | en entier |
| `apps/dojo/test/helpers/collect-chain.ts` (100 l.) | `89318fec03ceeda68602e051f3b7bd8e89a0a919fe2a8241ceccf0cff381227f` | en entier |
| `apps/dojo/test/dojo-collect-pure.test.ts` (335 l.) | `294a0a9c39be8b5e7c5d590cb00e3e9a4c509f0489afb85fcfaa318464f1a8a3` | imports (n'importe pas `collect.ts`) |
| `apps/dojo/test/dojo-history-collect.test.ts` (505 l.) | `af68a5b601ff631c81e0382b63592a851f268ff0798be7d81539c12b2706e6e5` | imports et recherches (importe `closeLayout`) |
| `test/dojo-collect-deploy.test.ts` (316 l.) | `04f966e2845eb1db2d5409c7066e966dc7514f9894011979caf27f958e411954` | l.1-56, l.134-316 |
| `deploy/monark-dojo-collect.service` | `0144a937bd265de1a8d6eea9934d788480f4b639ec703d1664bf68f348c01ae8` | en entier |
| [P2] (517 l.) | `268f2f099dc10a6f43920817ce28818e0fb2cb3579961eb03943865771bba870` | l.189, l.256, l.336-342, l.505-517 ; recherche des identifiants |
| [P3] (430 l.) | `d05e881c63a2f2561ef8249db70b1d9f8e48fe6920a24dd24c9fc4129324d0da` | l.214-230, l.270-285, l.407 ; recherche des identifiants |
| [P3b2] (blob, `git show`) | `55b2d763488b19ad6672f16fc5943d2ddd2136eef53d52ab58d76ed9e5d42529` | l.388, l.393 |
| [L299] (blob, `git show`) | `6cffcaf9f7919ef533077b01e54434ef98196c66f8d3fb2d3f82d72ab4e52270` | l.620-626 |
| [P2B] (1003 l.) | `222c13251a067412c08a9424c3be1faebf1c9f4222c27ce6b07e6965e1b816cb` | l.739, l.983, l.989 |
| [P1B4] (247 l.) | `ffc7e139be26997b2c6dfc925f2ccc65b6d1e39f26772c88ac20bdc0eb2853da` | l.18, l.48-49, l.114-125, l.157, l.188, l.193, l.200, l.223-231 |
| [RB] (315 l.) | `4135e84e158be8a05c6da419b26dd6f849a260ce55cad099876f324272822c04` | l.1-36, l.66-91, l.132-183, l.257-315 |
| [CH] (2 268 l.) | `f2a32ea1863d72cb60deb8d2d8c7931b7635717045d63cc46f4097977cf99c1a` | l.1890 (extrait DRAND-QUORUM-3-1), l.2186-2188 ; recherches |
| [EML] (blob, `git show`, branche `lot/entry-main-link-1`) | `c5490b571ebe9bec523c7b67b33cc54d0aeaf23bcbdb622930fc9bf00a4f3345` | l.1-38 (périmètre du lot parallèle ; format de la table R-25) |
| `apps/sentinel/src/run.ts` | `a02a9542f340eaf44a2d634bff52830e879973e67576f5c949305defe750aaf8` | l.320-350 ; recherche `release` (l.273-307) |
| `apps/sentinel/test/sentinel-chainstack-guard.test.ts` | `3535eda25712ee485aef23426ac76fe709404e198681e36eda58b3583e619ef7` | l.300-345 |
| `apps/dojo/src/history-collect.ts` (451 l.) | `11a45354a75a3eb566d025fedd138011b7896e6ab710aed00bc4fd3fd008e7a0` | l.112-123 |
| `apps/dojo/scripts/dojo-seed.mjs` (50 l.) | `6743aae1ccf37b2f9ee99d9bba7b23cc9877f7fa47f949d40e153f85d4aeb38a` | en entier |
| `docs/dojo/FAITS-systemd-timer-2026-09-27.md` | `afff6ae9230dac28d701736b7a7042ba6dbee98048f07959427ef25c040dc989` | l.20-40 |
| `docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` (33 l.) | `b6bc1e0f2c7823027e9d28a038f1850824ef4eeba590691248b005cd42617c86` | l.10-16 (le G0 de DRAND-1 citait `1c19b94f`, 30 l. : le fichier a reçu depuis la section 14:04:53Z) |
| `scripts/oracle/r25.mjs` | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | l.1-30 |
| `.github/workflows/ci.yml` | `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a` | l.76-90 |
| `scripts/mission/gen.mjs` | `9eecb3717c7a2ad11a021d81ebfe949dc38c9279c8db73743fe6b07c82711ae2` | l.1-21, l.62-68 (ancre du lot) |
| `scripts/mission/lint.mjs` | `4d1383c87260a3d12419fda644f5bbb37b343d6a07fcaea79323b8d0decdf808` | recherche (codes) |
| `scripts/red-proof.mjs` | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-14, l.100-102, l.172-174 ; recherche `pins` : 0 |
| `docs/adr/ADR-METHODE-2.md` | `b7e1e30f6abc8d6ef96674b061b2e91d70283eec113fe0302429ff3d53394c2b` | l.22 (D2, catégorie « épingle ») ; recherche « épingle » |
| `F:/Monark/node_modules/@types/node/child_process.d.ts` (`@types/node` 24.13.3 ; `node --version` v24.15.0) | `c06b2652ffeb89afd0f1c52c165ced77032f9cd09bc481153fbd6b5504c69494` | l.270-282 |
| `F:/Monark/node_modules/@types/node/process.d.ts` | `1569ad5969ae0de6ad0bdfaaab0dabcd8878bc3147ab096206eed2019bb84e7f` | l.2019, l.2036 (signatures `emit` et `on` des signaux) |

Recherches (lecture seule) : `relay_missing`, `RelayGet`, `relays` sur `apps/`, `packages/`, `scripts/`, `test/`, [RB] (consommateurs : `collect.ts`, `dojo-methods.ts` en commentaire, `dojo-collect.test.ts`, `collect-chain.ts`, `test/dojo-collect-deploy.test.ts`, [RB] l.24) ; `DRAND_QUICKNET_HASH`, `DRAND_RELAY_LABELS`, `cycleAttempts` sous `apps/` et `test/` : 0 occurrence (aucune égalité assertée côté Dōjō) ; `process.on(` dans `collect.ts` : 0 ; importeurs de `dojo-methods` sous `apps/`, `test/`, `scripts/` (hors `collect.ts`) : `apps/dojo/scripts/dojo-publish.mjs`, `apps/dojo/test/dojo-collect.test.ts`, `apps/dojo/test/dojo-publish.test.ts`, `test/dojo-collect-deploy.test.ts`, `test/dojo-publish-e2e.test.ts`, `test/dojo-served.test.ts`, `scripts/dojo-deploy.mjs`, `scripts/sync-dojo-served.mjs`. Garde d'octets de la mission (commande de §14) : 11 octets 0x80-0x9F (continuations UTF-8), 0 point de code C1, 0 octet de contrôle, lint vert : la garde se lit au niveau des points de code.

## 2. Constats qui fondent les décisions

1. **TU-B n'existe pas en production** : `--plan` refuse `relay_missing` sans `RunDeps.relays` (`collect.ts:172`) et `main` n'en passe aucun (l.274) ; [DR] l.133 (CA-11 « à brancher ») ; porte : aucun jour lu sans TU-B servi par le garde ([DR] l.95).
2. **Le garde porte les deux libellés depuis 1a** (fusion `d452247a`, [DR] l.127) : `transport.ts:83-90` (hôtes, `DRAND_RELAY_LABELS`, hash épinglé, chemin fermé), l.159, l.239 ; `client.ts:49-51`, l.87 (validation du plafond), l.99-101, l.125-126 (refus `cycle_attempts` avant `fetch`) ; `index.ts:22` (seul `DRAND_RELAY_LABELS` exporté).
3. **`course()`** n'ouvre le garde que pour les opérateurs de chaîne (`collect.ts:126`), passe les relais par `RunDeps.relays` (l.130) et rend TOUS les opérateurs sur `c.cycle`, le cycle de helius (l.149) : avec des libellés drand, c'est M-D9 ([DR] l.79).
4. **`call()` relance toute `BudgetExceededError`** (`collect.ts:140`) ; [DR] l.39-40 exige, dans la seule course des relais, « aucun plan à ce passage ».
5. **Aucun gestionnaire de `SIGTERM`** dans `collect.ts` ; l'unité le dit (`deploy/monark-dojo-collect.service:34`), [RB] l.285-286 aussi ; `TimeoutStartSec=1500` (l.35) ; à l'échéance, l'action dépend de `TimeoutStartFailureMode=` (défaut `terminate`, signal `KillSignal=`) : `FAITS-systemd-timer-2026-09-27.md` l.29 [lu, relevé de l'orchestrateur]. Calque servi : `apps/sentinel/src/run.ts:300-307` (`release` idempotente) et l.341 (`release` puis `process.exit(1)`) ; test calque `sentinel-chainstack-guard.test.ts:321-344`, sauté sur win32.
6. **`writeAtomic`** (`layout.ts:28-32`) : nom de `.tmp` fixe (`<cible>.tmp`), ouverture `"w"` qui retronque, puis `renameSync` ; `readDayLayout` refuse tout fichier de `readings/` ou `publish/` hors liste (`layout.ts:91`, `layout_stray_file`) ; cas atteignable d'un `.tmp` qui survit à son jour : deux processus ([RB] l.259-263 ; [P1B4] l.117).
7. **Enveloppe d'un pas** : la pire course d'une lecture vaut 1 210 s (`test/dojo-collect-deploy.test.ts:48-52`, assertions l.152-153 ; unité l.31-33) et `TimeoutStartSec` = 1,25 × 1 210 arrondi = 1 500. Avec TU-B, la course des relais entre dans le pas d'avant 00:15 (`tick` : plan l.247 avant les lectures). Même formule (`TRIES` 2 ; `DEFAULT_TIMEOUT_MS` 30 000, `transport.ts:40` ; attente plafonnée à 60 s, `transport.ts:94`) : 2 relais × 2 essais × 30 s + 2 × 60 s = 240 s ; plan + une lecture de d−1 dont la fenêtre chevauche minuit = 1 450 s ≤ 1 500 (marge 50 s) ; plan + deux lectures > 1 500 (DOJO-COLLECT-STEP-COURSES-1).
8. **Deux grands livres neufs par jour** (`ledger/drand-<AAAA-MM-JJ>/drand-pl.jsonl`, `drand-cf.jsonl`) : une coupure dure entre la première ligne et son `head` rend le grand livre refusé à l'ouverture (`ledger.ts:169`, RPC-GUARD-FIRST-APPEND-HEAD-1, lot LC-08) ; l'exposition passe de mensuelle (cycle helius) à quotidienne ; l'ajout est synchrone, hors d'atteinte d'un gestionnaire de `SIGTERM` (fenêtre SIGKILL ou coupure seule).
9. **Écart mission / inventaire** : la mission nomme huit items ; la ligne LC-06, qu'elle déclare « liste exacte », en porte dix : en plus, OUTSIDE-REPO-SEGMENT-1 partie `collect.ts` ([P2B] l.739) et DOJO-UNLOCK-CHAIN-TEST-1 ([P3] l.281). Les dix sont traités, plus TU-B et les deux recherches.
10. **Lots parallèles sur les mêmes fichiers** : ENTRY-MAIN-LINK-1 (LC-07, G1 en vol) remplace la garde d'entrée de `collect.ts` (l.274) et ajuste ses imports `node:fs` et `node:url` (l.9, l.12), et la garde de `dojo-seed.mjs` ([EML] l.9-10) ; PR-3b-2a (LC-01, G1 en vol) remet [RB] §5-§7 en cohérence ([L299] l.626).
11. **`cycleAttempts`** : littéral 4 par relais, côté consommateur, dans `dojo-methods.ts` (verdict cp-1 11:07Z, [DR] l.119) ; `dojo-methods.ts` est aussi importé par l'éditeur ([P3] l.407) : le lot touche les deux arbres, donc précède le G7 final ; un seul G7 pour les deux arbres ([P3b2] l.388) et un arbre de collecte changé au nouveau G7 impose A-3 et A-5 refaits ([P3b2] l.393).
12. **Le RUNBOOK du collecteur existe** (PR-3b-1) : « un `docs/RUNBOOK-dojo.md` est créé à 1b » ([DR] l.119) est sans objet ; 1b y ajoute ses lignes (en-tête, §8, §9).

## 3. Plan — intention, classement, périmètre

### 3.1 Intention unique

Rendre le collecteur de l'arbre de collecte apte au premier pas réel SANS répétition (décision 299 (a), [CH] l.2188 : les préalables que la répétition portait passent au premier jour réel) : la balise du jour passe par le garde (TU-B servi), et un pas interrompu ne laisse ni verrou durable ni fichier qui bloque son jour ; tout ce qui n'y sert pas est routé en item daté (décision 298, [CH] l.2186).

### 3.2 Règle de classement (décision 298) et application aux treize éléments

Règle, appliquée à chaque élément : il est GARDÉ si, absent au premier pas réel (démarrage unique de A-5, puis A-9 (5) à (7), [L299] l.622-623), un jour compté peut être perdu, faussé ou bloqué sans reprise servie, ou si un acte documenté l'exige avant lui ; sinon il est ROUTÉ : identifiant conservé, ligne datée écrite au G7 de 1b dans son ADR d'origine (§10), déclencheur « discussion d'après mise en ligne (décision 298) », propriétaire l'orchestrateur, jamais abandonné. Tout code gardé précède A-3 (arbre au G7 : [P3b2] l.393 ; [INV] AH-02) et le G7 final des deux arbres (constat 11).

| Élément | Source | Classement | Avant quel acte (preuve) | Traitement dans 1b |
|---|---|---|---|---|
| TU-B (cœur du lot) | [DR] l.55, l.95, l.133 ; [L299] l.623 | GARDÉ | A-3 ; démarrage unique de A-5 ([L299] l.623) ; A-9 (7), premier jour lu (porte, [DR] l.95) | code et tests (§4.1, §5) |
| DOJO-COLLECT-SIGTERM-UNLOCK-1 | [P3] l.217 ; [RB] l.20 | GARDÉ | A-5 ([P3] l.217) | code et tests (§4.2) |
| DOJO-TMP-STRAY-1 | [P2] l.341, l.517 ; [P3] l.284 (décision 275) ; [P1B4] l.18, l.114-120 | GARDÉ pour la partie un processus (MESURE) ; partie deux processus sous Q-2 | A-5 ([P3] l.284) | test, 0 ligne de code ; si la mesure échoue : STOP (§4.3) |
| DOJO-SEED-FS-TRACE-1 | [P3] l.224 | GARDÉ | A-4, qui exécute l'outil en root sur la vraie graine ([P3] l.224 ; [INV] AH-03) | test seul, hors arbre déployé (§4.4) |
| DOJO-UNLOCK-CHAIN-TEST-1 | [P3] l.281 | GARDÉ : seule reprise prouvée d'un verrou laissé par SIGKILL au premier jour réel, sans répétition | A-9 (7) ; déclencheur atteint (« G1 du prochain lot touchant le collecteur ») | test seul, sur la copie de l'arbre (§4.4) |
| DOJO-COLLECT-STEP-COURSES-1 | [P3] l.221 | ROUTÉ | — | aucun ; filet : SIGTERM-UNLOCK (un pas qui dépasse rend ses verrous) |
| DOJO-ANCHOR-CRED-PATH-1 | [P3] l.222 | ROUTÉ | — | aucun ; liaison tenue par l'argv épinglée (`dojo_collect_unit_argv_is_the_tick_contract`, `test/dojo-collect-deploy.test.ts:157`) |
| DOJO-RETRY-AFTER-CAP-1 | [P2] l.340, l.511, l.515 ; [P3] l.274 | ROUTÉ | — | aucun ; fenêtre gardée par `read_at` (`collect.ts:203`) ; attente plafonnée à 60 s par le garde |
| DOJO-EVIDENCE-RAW-BYTES-1 | [P2] l.189, l.339, l.515 ; [P3] l.274 | ROUTÉ | — | aucun ; `evidence/` n'est jamais publié ; exige un amendement du transport du garde (`packages/rpc-guard`) |
| DOJO-ENV-NAMES-COMMENT-1 | [P3] l.276 | ROUTÉ | — | aucun ; coût du report consigné : ce commentaire seul repassera par les deux arbres |
| OUTSIDE-REPO-SEGMENT-1 (partie `collect.ts`) | [P2B] l.739 | ROUTÉ sous Q-3 (borne datée « au plus tard avant le prochain acte réseau ») | — | aucun ; `--state` épinglé hors de tout dépôt ; graine liée au répertoire des crédentials |
| DRAND-QUORUM-3-1 (recherche) | [CH] l.1890 | ROUTÉ (« avant DRAND-1b » remplacé) | — | aucun ; résiduel « jour perdu » déclaré, rattaché aussi à PX-Dojo-1 et PX-Dojo-2 ([DR] l.132) |
| DRAND-STALE-LOCK-1 (recherche) | [DR] l.132 | ROUTÉ (« G1 de DRAND-1b » remplacé) | — | aucun ; doctrine C-9 inchangée ; reprise par `unlock` servi prouvée (T5) ; procurement Gray et Cheriton inchangé |

DRAND-CAP-REVISIT-1 ([DR] l.109) n'est pas touché : son déclencheur reste la réponse à P-3.

### 3.3 Périmètre fermé (fichiers) — rien d'autre n'est touché

| Fichier | Arbre | Changement | Éléments |
|---|---|---|---|
| `apps/dojo/src/collect.ts` | collecte (programme de l'unité) | TU-B (§4.1) ; gestionnaire de `SIGTERM` (§4.2) ; commentaires d'en-tête, de `course()` et de `plan()` ; **l.9, l.12 et l.274 non touchées** (ENTRY-MAIN-LINK-1) | TU-B, SIGTERM |
| `apps/dojo/src/dojo-methods.ts` | collecte et publication | `DRAND_CYCLE_ATTEMPTS` = `{ "drand-pl": 4, "drand-cf": 4 }` (littéral, [DR] l.119) ; commentaire d'en-tête l.1-4 (relais par le garde) | TU-B |
| `deploy/monark-dojo-collect.service` | unité | commentaires seuls : l.34 (le pas tué rend ses verrous) ; enveloppe du pas d'avant 00:15 (plan et une lecture) ; aucune directive | SIGTERM, TU-B |
| `apps/dojo/test/helpers/collect-chain.ts` | test | branche GET du `fetch` simulé pour `api.drand.sh` et `drand.cloudflare.com` (opération par hôte, `params: [pathname]`, forme v1 inchangée) ; export `relays` retiré ; en-tête | TU-B |
| `apps/dojo/test/dojo-collect.test.ts` | test | TU-B (§5) ; test d'absorption du `.tmp` ; cas `.tmp` dans la boucle des refus de disposition | TU-B, TMP-STRAY |
| `apps/dojo/test/dojo-collect-sigterm.test.ts` (neuf) | test | deux enfants réels et variante du signal réel (T7) | SIGTERM |
| `apps/dojo/test/helpers/sigterm-hang.mjs` (neuf) | test | chargé par `--import` : pièges socket et DNS, `Date.now` figé, `fetch` qui pend, `process.emit("SIGTERM")` au premier `fetch`, `process.exit(99)` de repli | SIGTERM |
| `apps/dojo/test/helpers/fs-trace.mjs` (neuf) | test | préchargement qui trace les écritures à chemin de `node:fs` et `node:fs/promises` | SEED-FS-TRACE |
| `test/dojo-collect-deploy.test.ts` | test | tick réel sans relais injecté (l.20, l.290, l.312) ; enveloppe (T6, assertée dans T5) ; `dojo_seed_writes_only_its_seed` (T9) ; chaîne verrou, `unlock` servi, pas suivant sur la copie de l'arbre (T5) | TU-B, SEED-FS-TRACE, UNLOCK-CHAIN |
| `docs/RUNBOOK-dojo.md` (hors R-25) | doc | en-tête l.16-26 ; §8 (résultat de la mesure) ; §9 : verrous `drand-<AAAA-MM-JJ>/drand-pl.lock` et `drand-cf.lock`, `unlock --cycle drand-<AAAA-MM-JJ>` avec `--op drand-pl` puis `--op drand-cf` et `--floor 0`, STOP « of ONE cycle » (l.293) amendé pour une course de relais, `SIGTERM` désormais géré (l.285-286) ; les chaînes testées par `dojo_collect_tree_is_the_import_closure` restent | TU-B, SIGTERM, TMP-STRAY |
| `docs/G1-lot-drand-1b.md` (neuf, hors R-25) | doc | journal du G1 | — |

Hors périmètre : `packages/rpc-guard/**` (livré par 1a) ; `apps/dojo/src/layout.ts` (mesure seule) ; `apps/dojo/scripts/**` (dont `dojo-seed.mjs`, testé sans être touché) ; `apps/bell/**` ; `scripts/dojo-deploy.mjs` : aucun fichier neuf dans l'arbre (la fermeture d'imports de `collect.ts` ne change pas), `dojo_collect_tree_is_the_import_closure` reste vert sans amendement.

## 4. Conception prescrite au G1

### 4.1 TU-B (forme retenue de [DR] l.50, précisée)

- `course()` reçoit la table libellé → cycle et les bornes de sa course ; une seule voie, `openGuardedClient`, pour les deux genres de course ; `send` = `g.call(...)`.
- Course des relais (`plan()`) : libellés `DRAND_RELAY_LABELS` importés de `@monark/rpc-guard` (dans la ligne d'import existante, l.13-14) ; cycle `drand-<AAAA-MM-JJ>` du jour d du plan, distinct de `HELIUS_CYCLE_ID` ; bornes `{ maxCalls: 4, runCaps: {}, methodCaps: {}, cycleFloor: {}, cycleAttempts: DRAND_CYCLE_ATTEMPTS }`, `maxCalls` dérivé (2 relais × `TRIES`).
- **Une seule fonction `release`** (chaque opérateur sur SON cycle ; `floor` = `c.floor` pour helius, 0 sinon), idempotente, partagée par le `finally` de `course()` et le gestionnaire de `SIGTERM` (calque `run.ts:300-307`). La ligne qui change est `collect.ts:149` (aujourd'hui `c.cycle` pour tous). Ordre conservé : verrous rendus AVANT la ligne `runs.jsonl` (K-8).
- **« Aucun plan à ce passage »** : le `catch` de `BudgetExceededError` entoure chacun des deux `call(...)` du corps de la course des relais et rend `null` ; il n'entoure JAMAIS `openGuardedClient` : une `BudgetExceededError` d'ouverture vient d'`assertLimits` (`client.ts:87`, configuration invalide) et reste fatale (`budget_stop`). Les bornes étant des littéraux, ce cas n'est déclenchable par aucune entrée : contrôle de LECTURE au G2, sans mutant.
- Les deux relais restent interrogés à chaque passage (`dojo_tick_before_0015_fetches_beacon_once` : 3 × 2) ; `betaOf` inchangé.
- `lock_held` sur un verrou drand : inchangé ([DR] l.72 : passage interrompu, lectures de d−1 dues pendant le verrou écrites `missed`) ; l'adoucir serait un amendement d'ADR, hors de ce lot.
- Retirés (Q-3 = oui, [DR] l.113) : `RunDeps.relays` et `RelayGet` (l.34-38), le code `relay_missing` (l.25, l.172) ; la liste fermée `DOJO_COLLECT_REFUSALS` perd une entrée.

### 4.2 DOJO-COLLECT-SIGTERM-UNLOCK-1

- Un marqueur de module « course en vol » (la `release` de la course ouverte), posé après l'ouverture du client, effacé dans le `finally`.
- Gestionnaire enregistré dans `main`, jamais au niveau du module ni sur la ligne d'entrée l.274 (rien ne s'exécute à l'import, exigence d'ENTRY-MAIN-LINK-1) : `release` de la course en vol s'il y en a une, `dojo/collect: sigterm` sur stderr, `process.exit(1)` (calque `run.ts:341`).
- Déclaré : `process.exit` saute volontairement le `finally` ; la course abandonnée n'a pas de ligne `runs.jsonl` (ses appels sont au grand livre par écriture anticipée ; la ligne `unlocked` de motif `dojo/collect: SIGTERM` est la trace consignée) ; un `unlock` qui lève (grand livre refusé, `ledger.ts:169`) est au mieux : le verrou reste, [RB] §9 STOP et escalade.
- Non couvert, déclaré : SIGKILL, OOM, coupure (verrous laissés : [RB] §9, prouvé par T5) ; doctrine C-9 inchangée.

### 4.3 DOJO-TMP-STRAY-1 (mesure)

- Un processus : une panne injectée dans `writeAtomic` par le crochet `spy` existant (`dojo-collect.test.ts:60-65`), après l'écriture du `.tmp` et avant le renommage, aux points d'écriture d'une lecture, d'une lecture manquée à la clôture et de `readings/SHA256SUMS`, laisse `<cible>.tmp` ; le passage suivant réécrit la même cible et l'absorbe ; mesure : `readDayLayout` vert et zéro `*.tmp` sous `readings/` et `publish/`.
- Deux processus (un `.tmp` qui survit à un jour clos) : refus nommé `layout_stray_file` inchangé ; cas `readings/1.json.tmp` ajouté à la boucle des refus de disposition (`dojo-collect.test.ts:466-474`) ; procédure de [RB] §8 inchangée ; décision de conception sous Q-2.
- Si la mesure à un processus échoue : STOP et retour à l'orchestrateur ; aucune purge improvisée (une purge a sa propre course de renommage tardif : [P1B4] l.117).

### 4.4 DOJO-SEED-FS-TRACE-1 et DOJO-UNLOCK-CHAIN-TEST-1

- `dojo_seed_writes_only_its_seed` : `node --import <fs-trace.mjs> apps/dojo/scripts/dojo-seed.mjs --init <dossier>/seed --horizon 365` ; le préchargement enrobe les fonctions d'écriture à chemin de `node:fs` et de `node:fs/promises` (liste fermée déclarée au G1), les rebinde par `syncBuiltinESMExports()` (mécanisme prouvé en dépôt pour `node:fs` seulement : `dojo-collect.test.ts:60-65`) et écrit sa trace hors du dossier de la graine par les fonctions d'origine. Attendu : le fichier de graine et son dossier, rien d'autre. Contrôle positif obligatoire : un mutant qui écrit par `node:fs/promises` est tué.
- Chaîne sur l'arbre (dans `dojo_collect_unit_runs_the_real_tick`, copie de l'arbre) : un `helius.lock` laissé (motif SIGKILL) ; le `--tick` refuse `lock_held` ; `node <arbre>/packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir <état>/ledger --floor 0 unlock --cycle <cycle> --op helius --reason runbook-lock-held-unlock` (forme de [RB] §9) sort 0, verrou retiré, dernière ligne `unlocked` ; le `--tick` suivant lit.

## 5. Tests nommés et mutants nommés

Tests (fichier ; ce qui est asserté) :
- **T1 `dojo_collect_beacon_is_all_day_or_nothing`** (amendé, `dojo-collect.test.ts`) : sous garde ; une ligne `attempted` du grand livre `drand-<d>` par GET ; verrous drand rendus après la course ; `DRAND_QUICKNET_HASH` (import relatif de `transport.ts`) = `READ_RULE.beacon_chain_hash`, libellés = `DRAND_RELAY_LABELS` ; relais DIVERGENT (cas menteurs existants, l.182-189) : aucun plan ; relais INDISPONIBLE (404 à chaque passage ; 503 double) : aucun plan, puis plan nul `beacon_unavailable` à T_d + 900 ; relais LENT (le `fetch` simulé rejette `AbortError`, délai du garde) : deux essais, aucun plan ; quatre tentatives par relais puis la cinquième refusée `cycle_attempts` avant tout GET : aucun plan ; refus `cycle_attempts` au second essai : aucun plan, jamais fatal ([DR] l.40, cas (3)) ; verrou `drand-pl.lock` périmé : `lock_held` avant tout GET, lecture de d−1 écrite `missed`, plan nul à T_d + 900 sans GET, d+1 non affecté, puis `unlock` servi (`runCli`) et passage suivant qui planifie ([DR] l.72, l.78) ; l'assertion `relay_missing` (l.198-199) retirée.
- **T2 `dojo_collect_to_verify_end_to_end`** : sous garde, sans relais injecté, sinon inchangé.
- **T3 `dojo_collect_calls_have_the_closed_forms`** et **`dojo_tick_before_0015_fetches_beacon_once`** : libellés `drand-pl`, `drand-cf` (l.127, l.318) ; `3 * 2` inchangé.
- **T4 `dojo_collect_reads_only_inside_the_window`** : l.259-260 devient « le plan de d+1 prend puis rend les verrous drand, les verrous de chaîne restent tenus » ([DR] l.52).
- **T5 `dojo_collect_unit_runs_the_real_tick`** (`test/dojo-collect-deploy.test.ts`) : chemin servi (argv de l'unité, copie de l'arbre, garde) sans relais injecté ; un GET pour `drand-pl` et un pour `drand-cf` ; plus la chaîne verrou, `unlock` servi, pas suivant (§4.4).
- **T6 (enveloppe, assertée DANS T5)** : `WORST_PLAN_S` recalculé des constantes (240) ; `WORST_PLAN_S + WORST_S <= TimeoutStartSec` de l'unité lue par T5 ; `dojo_collect_timer_steps_inside_the_read_window` reste inchangé (une assertion vraie à la base y serait refusée comme auto-confirmante, ci-dessous).
- **T7 `dojo_collect_releases_locks_on_sigterm`** (neuf) : enfant A, course des relais (état vide, horloge T(D1) + 60) ; enfant B, course de lecture (`plan.json` et `eve.json` écrits d'avance, motif de `dojo-collect.test.ts:264-268`) ; pour chacun : `fetch` qui pend, `process.emit("SIGTERM")`, puis sortie 1, `dojo/collect: sigterm` sur stderr, aucun `.lock` sous le cycle de la course, une ligne `unlocked` par opérateur de la course sur SON cycle ; ensuite un `--tick` en processus sur le même état passe (reprise sans `lock_held`). Variante du signal réel (`child.kill("SIGTERM")`) sautée sur win32, saut déclaré (Q-1).
- **T8 `dojo_close_absorbs_an_orphan_tmp`** (neuf, `dojo-collect.test.ts`) et le cas `.tmp` de la boucle des refus (§4.3).
- **T9 `dojo_seed_writes_only_its_seed`** (neuf, `test/dojo-collect-deploy.test.ts`) (§4.4).
- À contrôler par nom, verts sans amendement : `error_preamble_carries_no_vocabulary_token`, `dojo_tick_is_idempotent`, `dojo_tick_fills_the_days_it_missed`, `dojo_tick_stops_on_a_missing_first_eve_after_the_plan`, `dojo_collect_tree_is_the_import_closure`, `dojo_collect_unit_argv_is_the_tick_contract`, `dojo_collect_timer_steps_inside_the_read_window`, `dojo_seed_init_prints_only_the_anchor`, les tests de `packages/rpc-guard/test/drand-labels.test.ts` ; et, `dojo-methods.ts` recevant un export (deux arbres), les fichiers de test qui l'importent, non lus ici : `apps/dojo/test/dojo-publish.test.ts`, `test/dojo-publish-e2e.test.ts`, `test/dojo-served.test.ts` (autres importeurs, par recherche : `apps/dojo/scripts/dojo-publish.mjs`, `scripts/dojo-deploy.mjs`, `scripts/sync-dojo-served.mjs`).

Mutants (sur copie, restaurés au sha256 ; une ligne `// killer:` valide au-dessus de chaque test jugé, neuf ou amendé) :
- **M-D9** (fonction `release` partagée) : cycle de helius pour tous les opérateurs : tué par T1 et T7 enfant A ; **M-D10** `cycle_attempts` traité en erreur fatale du `--tick` : T1 ; **M-B3**, **M-B4**, **M-B5** ([P2] l.256) : tués sous garde par T1.
- **M-R1** un seul libellé interrogé : T1, T3 ; **M-R2** cycle des relais = `c.cycle` : T1 (grand livre `drand-<d>` absent, d+1 affecté) ; **M-R3** `cycleAttempts` omis des bornes : T1 (cinquième tentative admise) ; **M-R4** `drand-cf` interrogé seulement si `drand-pl` a répondu : T3 (3 × 2).
- **M-S1** gestionnaire non enregistré : T7 (sortie 99, verrou resté) ; **M-S2** sortie sans `release` : T7. Le mutant « marqueur non effacé » est équivalent par l'idempotence de `release` : déclaré, sans test.
- **M-T1** nom de `.tmp` propre au processus dans `writeAtomic` : T8 ; **M-T2** `readDayLayout` qui ignore les `*.tmp` : T8 (cas de la boucle).
- **P5b-i** copie du secret hors du dossier de la graine ([P3] l.224) et **M-F1** la même par `node:fs/promises` : T9 (contrôle positif).
- **M-U1** `unlock` servi qui n'efface pas le `.lock` : T5.
- **M-W1** troisième libellé drand : T6 (360 + 1 210 > 1 500).
- Lecture G2, sans mutant : le `catch` de `BudgetExceededError` hors d'`openGuardedClient` (§4.1).

Forme des tests à la base (preuve F2P : ADR-METHODE-2 l.22, D2 ; [P1B4] l.227, C-V-1 ; `scripts/red-proof.mjs` l.100-102 et l.172-174 : refus « green at base », « import red » sur un fichier présent à la base, « red at base without an assertion failure ») :
- (1) tout test JUGÉ (corps neuf ou modifié : T1 à T5, T7) rougit à la base par un échec d'assertion, jamais par un refus nu ; à la base, `--plan` sans relais injecté lève `relay_missing` : chaque appel qui peut le lever est enveloppé dans une assertion (`codeOf(...)` égal à `"none"`) avant tout le reste ;
- (2) `DRAND_CYCLE_ATTEMPTS`, export neuf d'un fichier présent à la base, n'est lu que par import d'espace de noms, première assertion = son existence ; aucun import nommé (sinon le fichier entier rougit à l'import et chacun de ses tests est refusé) ; `DRAND_RELAY_LABELS` et `DRAND_QUICKNET_HASH` existent à la base (1a) ;
- (3) T8 et T9 sont verts à la base par construction (code inchangé : mesure de `writeAtomic`, trace de l'outil de graine) : catégorie « épingle » admise (ADR-METHODE-2 l.22, décision 275 : tueur tué, texte `<before>` du tueur présent à la base), comptés à part (`pins`), jamais F2P ; l'outil de la base ne connaît pas encore `pins` (aucune occurrence dans `red-proof.mjs`, item RED-PROOF-PIN-1) : le journal G1 les déclare avec leurs tueurs, le G2 les dérive ;
- (4) l'enveloppe (T6) vit dans T5, jugé et rouge à la base, pour la même raison.

Couverture du Review Focus (tâche 2) :
- **Relais drand indisponible, lent ou divergent** : T1 (404, 503, `AbortError`, menteurs, `cycle_attempts`), M-B3 à M-B5, M-R1 à M-R4, M-D10 ; issue unique : plan nul `beacon_unavailable`, jour abstenu NOMMÉ, jamais un instant sans β ni une β d'un seul relais (TB-1).
- **Collecteur tué au milieu d'un pas** : T7 (deux enfants, reprise sans `lock_held`), M-S1, M-S2, M-D9 ; SIGKILL : T5 (chaîne sur l'arbre), M-U1 ; verrou drand périmé : T1 (TB-2, TB-7).
- **Fichier temporaire orphelin sous `readings/`** : T8 (absorbé, un processus), cas de la boucle (`layout_stray_file`, deux processus), M-T1, M-T2 (TB-3, Q-2).

## 6. R-25 prévu (estimation ascendante, jamais une mesure)

Méthode : `scripts/oracle/r25.mjs` (insertions + suppressions, chemins de `ci.yml:82`, `docs/**/*.md` exclus) ; facteurs ×2,1 (règle : 547 × 2,1 = 1 148,7) et ×2,31 (pire dérive mesurée, R25-FACTOR-DRIFT-1 : [P1B4] l.193, borne ascendante 497) ; mesure `r25()` jugée à 1 150 ; une PR.

| Lot | Fichiers | Asc. | ×2,1 | ×2,31 | Borne |
|---|---|---|---|---|---|
| DRAND-RELAY-GET-1b | `collect.ts`, `dojo-methods.ts`, l'unité (commentaires), `collect-chain.ts`, `dojo-collect.test.ts`, `dojo-collect-sigterm.test.ts`, `sigterm-hang.mjs`, `fs-trace.mjs`, `test/dojo-collect-deploy.test.ts` | ≈ 226 | ≈ 475 | ≈ 522 | 547 asc. (497 sous R25-FACTOR-DRIFT-1) ; mesure `r25()` jugée à 1 150 |

| Partie | Détail | Asc. |
|---|---|---|
| TU-B | `collect.ts` ≈ 26 ; `dojo-methods.ts` ≈ 4 ; `collect-chain.ts` ≈ 14 ; `dojo-collect.test.ts` ≈ 41 ; `test/dojo-collect-deploy.test.ts` ≈ 8 ; formes F2P (enveloppes `codeOf`, import d'espace de noms, lignes `// killer:` de T1 à T5) ≈ 13 | ≈ 106 |
| SIGTERM-UNLOCK | `collect.ts` ≈ 8 ; unité ≈ 2 ; `dojo-collect-sigterm.test.ts` ≈ 40 ; `sigterm-hang.mjs` ≈ 15 ; ligne `// killer:` 1 | ≈ 66 |
| TMP-STRAY | test ≈ 18 ; cas de la boucle 1 ; ligne `// killer:` 1 | ≈ 20 |
| SEED-FS-TRACE | test ≈ 10 ; `fs-trace.mjs` ≈ 15 ; ligne `// killer:` 1 | ≈ 26 |
| UNLOCK-CHAIN | cas sur l'arbre | ≈ 8 |

- Réconciliation avec « 1b ≈ 40 » ([DR] l.90) + 1 (renommage, [DR] l.119) = 41 : TU-B passe à ≈ 106 par ce que l'ADR ne comptait pas (branche GET du `fetch` simulé et retrait de `relays` ≈ +6 ; tick réel de l'arbre et enveloppe ≈ +8 ; égalité du hash et des libellés ≈ +3 ; relais lent, 404, 503 et cas (3) ≈ +12 ; `unlock` puis passage suivant ≈ +3 ; en-têtes, bornes, `release` par cycle, `catch` autour des appels ≈ +20 ; formes F2P ≈ +13) ; s'y ajoutent les éléments gardés (≈ +120).
- Solde R-25 projeté : ≈ 628 lignes sous 1 150 à ×2,31. Au G1, un solde sous 10 lignes impose une SCISSION avant toute compaction (REGLES-MISSION, ligne 13:0x). Scission pré-déclarée : 1b-i (TU-B, SIGTERM, UNLOCK-CHAIN) puis 1b-ii (TMP-STRAY, SEED-FS-TRACE : tests seuls, hors arbre déployé) ; STOP au-delà de 1 150 mesurées sur une PR.

## 7. Tuyaux (règle Branchement)

| # | Entrée (qui produit) | Sortie (qui consomme) | État | Test non-LLM |
|---|---|---|---|---|
| TU-B | transport GET du garde (`drand-pl`, `drand-cf`) par `openGuardedClient` (1a, `d452247a`) | `collect.ts` `--plan` et `--tick` (β, ronde, instants dans `bundles/<d>/evidence/plan.json`), puis lectures, clôture, paquet du jour, éditeur | grand livre `<état>/ledger/drand-<AAAA-MM-JJ>/` ; `evidence/plan.json`, `runs.jsonl`, `parsed/` | T5 (chemin servi : argv de l'unité, copie de l'arbre), T2 (collecte puis vérificateur), T1 |
| TU-S | `SIGTERM` de systemd à `TimeoutStartSec` (FAITS l.29) | `unlock` servi (`runCli`) : lignes `unlocked`, `.lock` retirés, pas suivant | grand livre du cycle de la course | T7 (enfants réels, reprise) |
| TU-U | verrou laissé (SIGKILL, coupure) | `packages/rpc-guard/bin/rpc-guard.mjs unlock` de l'arbre ([RB] §9), pas suivant | grand livre | T5 (chaîne sur la copie de l'arbre) |

Au G7 de 1b : TU-B « câblé » ; l'item TU-B de [DR] l.55 et CA-11 de [DR] l.133 sont clos. Registre public inchangé : la pièce reste `upcoming` (TU-1c et la suite absents).

## 8. Menaces

| # | Menace | Parade | Statut |
|---|---|---|---|
| TB-1 | relais indisponible, lent ou divergent | tout ou rien sur deux opérateurs, `betaOf`, deux essais, plafond 4 par relais et par jour ; aucun plan à ce passage ; plan nul `beacon_unavailable` à T_d + 900 : jour abstenu NOMMÉ, jamais un instant sans β (M-B3, M-B5) ni une β d'un seul relais (M-B4) | réduit ; résiduel : jour abstenu (TY-1, TY-2 de [DR]) |
| TB-2 | pas tué par `TimeoutStartSec` au milieu d'une course | gestionnaire de `SIGTERM` : `release` puis sortie ; reprise au pas suivant (T7) | fermé pour SIGTERM ; SIGKILL : [RB] §9 (TU-U, T5) |
| TB-3 | `.tmp` orphelin sous `readings/` | un processus : absorbé (mesuré, T8) ; deux processus : refus nommé `layout_stray_file` et [RB] §8 | Q-2 |
| TB-4 | enveloppe du pas d'avant 00:15 | plan (240 s) + une lecture (1 210 s) ≤ 1 500, asserté (T6) ; plan + deux lectures : STEP-COURSES (routé), filet TB-2 | réduit ; suppose RPC-GUARD-BODY-TIMEOUT-1 (LC-08) : d'ici là, corps de réponse non borné, `TimeoutStartSec` seule borne, TB-2 rend les verrous |
| TB-5 | `BudgetExceededError` d'ouverture masquée en « aucun plan » (chaque jour abstenu en silence) | `catch` autour des appels seulement (§4.1) | fermé à la lecture du G2 |
| TB-6 | grand livre drand neuf chaque jour : fenêtre première ligne, `head` | ajout synchrone, hors SIGTERM ; LC-08 (RPC-GUARD-FIRST-APPEND-HEAD-1) avant A-3 ([INV] §3, P3-1) | dépendance déclarée (§9) |
| TB-7 | verrou drand périmé pendant [T_d, T_d + 900) | inchangé ([DR] l.72) : `lock_held`, jour abstenu, lectures de d−1 `missed` ; [RB] §9 amendé pour les verrous drand ; reprise testée (T1) | résiduel déclaré ; DRAND-STALE-LOCK-1 routé |
| TB-8 | conflit avec ENTRY-MAIN-LINK-1 et PR-3b-2a | l.9, l.12, l.274 de `collect.ts` non touchées ; conflit dans [RB] (docs) résolu à la fusion | déclaré (§9) |
| TB-9 | preuve Linux du signal réel absente de l'oracle Windows | variante `process.emit` non vacante ; variante réelle sautée sur win32 | Q-1 |

MAST : FM-1.1 (repli silencieux sur un relais : M-B4, M-R1) ; FM-2.2 (bornes par défaut : `cycleAttempts` littéral, `maxCalls` dérivé) ; FM-3.2 (forme v1 lue sur deux relais, FAITS drand, servie par `collect-chain.ts`) ; FM-3.3 (l'oracle recode les instants, inchangé).

## 9. Régime, ordre, dépendances

- **Régime : checkpoint-1 bref**, pas le petit lot de la décision 116 : le lot touche le réseau (GET réels des relais en production, par le garde), un chemin servi (unité, arbre, garde) et le secret (outil de graine testé) ; sa mesure projetée (≈ 475 à ×2,1) dépasse 300. Chaîne : cp-1 bref de ce plan, G1, G2 (instance séparée), checkpoint-2, G7 du lot (TU-B servi), fusion avant A-3 et avant le G7 final des deux arbres.
- **Base du G1** : le tronc au lancement ; si ENTRY-MAIN-LINK-1 est fusionné d'ici là, la base le porte ; sinon fusion du tronc dans `lot/drand-1b` avant le G2 (précédent : [DR] l.121, Q-2 de 14:06Z).
- **Conflits** : [RB] (PR-3b-2a réécrit §5-§7 ; 1b touche l'en-tête, §8, §9) : docs, à la fusion ; `test/dojo-collect-deploy.test.ts` lit [RB] (commande d'archive, formes des outils) : ces chaînes restent.
- **Avant A-3** (ordre déjà posé par [INV] §3, P3-1) : LC-06 (ce lot), LC-07, LC-08.
- **Oracle** : outil du tronc `node F:/Monark/scripts/oracle/run.mjs` (REGLES-MISSION) ; T7 tourne dans la suite ; aucun harnais pendant la suite sous verrou ; preuve F2P par `scripts/red-proof.mjs` (§5, forme des tests à la base).
- **Mission du G1, « À créer »** (MISSION-LINT-OUTPUTS-1 ; sinon R-PATH rouge sur un chemin absent de `--repo`) : `apps/dojo/test/dojo-collect-sigterm.test.ts`, `apps/dojo/test/helpers/sigterm-hang.mjs`, `apps/dojo/test/helpers/fs-trace.mjs`, `docs/G1-lot-drand-1b.md`.

## 10. Éléments routés (décision 298) — lignes datées que le G7 de 1b écrit

Forme : « Ligne datée (orchestrateur, G7 de DRAND-1b) — <identifiant> : routé par la décision 298 (G0 `docs/G0-lot-drand-1b.md` §3.2) ; non nécessaire au premier pas réel : <motif> ; déclencheur : discussion d'après mise en ligne ; propriétaire : orchestrateur. »

| Élément | Où la ligne datée | Motif en une ligne |
|---|---|---|
| DOJO-COLLECT-STEP-COURSES-1 | [P3], après l.228 | deux courses dans un pas : cas rare ; un pas qui dépasse rend ses verrous (SIGTERM-UNLOCK) ; une lecture non faite est reprise au pas suivant si sa fenêtre court |
| DOJO-ANCHOR-CRED-PATH-1 | [P3], après l.228 | liaison ancre et crédential tenue par l'argv épinglée et testée |
| DOJO-ENV-NAMES-COMMENT-1 | [P3], après l.276 | commentaire seul ; son report coûtera un passage dans les deux arbres |
| DOJO-RETRY-AFTER-CAP-1 | [P2], après l.517 | fenêtre gardée par `read_at` ; attente plafonnée à 60 s ; `TimeoutStartSec` la compte |
| DOJO-EVIDENCE-RAW-BYTES-1 | [P2], après l.517 | `evidence/` jamais publié ; exige un amendement du transport du garde |
| OUTSIDE-REPO-SEGMENT-1 (partie `collect.ts`) | [P2B], après l.739 | sous Q-3 : `--state` épinglé hors de tout dépôt, graine liée au répertoire des crédentials |
| DRAND-QUORUM-3-1 | [CH] (entrée du G7) et [DR] | deux relais tout ou rien : un relais absent abstient le jour, jamais un faux battement |
| DRAND-STALE-LOCK-1 | [DR], après l.132 | SIGTERM rendu par 1b ; SIGKILL repris par `unlock` servi, prouvé (T5) ; C-9 inchangée |
| DOJO-TMP-STRAY-1, partie deux processus | [P2] après l.517 et [P3] après l.284 | sous Q-2 |

Éléments clos par ce lot (ligne datée de clôture au G7) : TU-B ([DR] l.55 ; CA-11, [DR] l.133), DOJO-COLLECT-SIGTERM-UNLOCK-1 ([P3] l.217), DOJO-TMP-STRAY-1 partie un processus ([P3] l.284), DOJO-SEED-FS-TRACE-1 ([P3] l.224), DOJO-UNLOCK-CHAIN-TEST-1 ([P3] l.281).

## 11. Demandes formées (règle Dettes ; aucune lecture distante dans ce lot)

- **L-1, lecture sur place par l'orchestrateur** : documentation Node.js v24 (version installée v24.15.0), `child_process`, « subprocess.kill([signal]) » (comportement sur Windows), et `process`, « Signal events ». Aujourd'hui [2nd] : copie DefinitelyTyped `@types/node` 24.13.3, `child_process.d.ts:275-276` (« the process will be killed forcefully and abruptly »). Usage : fonder le saut win32 de T7 et la variante `process.emit`. Tentative : aucune (réseau interdit par la mission).
- **L-2, lecture sur place par l'orchestrateur** : `systemd.kill(5)` (`KillSignal=` par défaut, `FinalKillSignal=`, `TimeoutStopSec=`) et `systemd.timer(5)` (déclenchement d'une unité encore `activating`), systemd 259 de l'hôte. Aujourd'hui non lus (FAITS l.29 ne cite que `TimeoutStartFailureMode=`). Usage : temps dont dispose le gestionnaire avant un SIGKILL ; analyse du relais lent (aucun chiffre n'en est dérivé ici). Tentative : aucune (réseau interdit).
- Procurement déjà formé, inchangé : Gray et Cheriton, SOSP 1989, DOI 10.1145/74850.74870 (DRAND-STALE-LOCK-1, [DR] l.132).

## 12. Questions fermées pour l'orchestrateur (trois)

- **Q-1 — preuve Linux du signal réel** (l'oracle tourne sur Windows, où `child.kill("SIGTERM")` est un arrêt dur ; la CI Linux ne démarre pas, [INV] LS-02) : **(a) proposée** : variante `process.emit` au G1 (non vacante sur l'oracle) et variante réelle sautée sur win32, item daté DOJO-SIGTERM-LINUX-PROOF-1 « première fenêtre CI Linux (DE-03) », non bloquant pour A-9 (7) ; (b) le G7 de 1b attend une course Linux ; (c) la seule variante `process.emit`, sans item.
- **Q-2 — DOJO-TMP-STRAY-1, cas à deux processus** ([P1B4] l.117 : choix laissé au lot du collecteur) : **(a) proposée** : refus nommé `layout_stray_file` et [RB] §8, partie routée (0 ligne de code) ; (b) purge des `*.tmp` à la clôture (≈ +4 de code, course de renommage tardif déclarée) ; (c) exclusion par état (verrou du collecteur, ≈ +15, famille de SIGTERM-UNLOCK, verrou périmé à traiter).
- **Q-3 — OUTSIDE-REPO-SEGMENT-1 (partie `collect.ts`)** : **(a) proposée** : routé malgré sa borne datée « au plus tard avant le prochain acte réseau » ([P2B] l.739), motif : `--state` épinglé par `dojo_collect_unit_argv_is_the_tick_contract` (`/var/lib/monark-dojo-collect`, hors de tout dépôt) et graine liée au répertoire des crédentials (`credentials_path`) ; (b) gardé dans 1b (≈ +15 ascendantes, calque de `stateOutside`, `history-collect.ts:117-122`).

## 13. Advisor

- Consultation 1 (avant l'écriture, après l'orientation) : suivie sur tous les points : placement du `catch` ; `release` unique par cycle ; gestionnaire dans `main` ; enveloppe 240 + 1 210 ; commentaire de l'unité et [RB] §9 au périmètre ; égalité du hash ; branche GET du `fetch` simulé ; TY-8 non adouci ; règle unique appliquée aux dix items ; lignes datées du G7 ; deux enfants pour T7 ; contrôle positif `fs/promises` ; [2nd] déclarés en demandes formées ; dépendances LC-07, LC-01, LC-08 ; format de la table R-25 de [EML]. Écart : le mutant « marqueur non effacé » est déclaré équivalent (idempotence de `release`) au lieu d'être nommé.
- Consultation 2 (avant la remise, fichier écrit) : renvois de ligne recontrôlés par l'advisor, concordants ; suivie sur les trois ajouts : forme des tests à la base (F2P, §5, lue ensuite dans `red-proof.mjs` et ADR-METHODE-2 l.22 : T8 et T9 relèvent de la catégorie « épingle », l'enveloppe passe dans T5) ; fichiers neufs sous « À créer » de la mission du G1 (§9) ; importeurs de `dojo-methods.ts` à contrôler par nom (§5). R-25 révisée en conséquence (≈ 226). Corrigé avant : l'en-tête de [RB] commence l.16 (et non l.17).

## 14. État à la remise

- `git status --short` : `?? docs/G0-lot-drand-1b.md` seul (aucun autre fichier touché).
- Garde d'octets, rejouée sur les octets finaux : `node -e` qui compte les TAB, les CR, les octets 0x00-0x1F hors LF et 0x7F, et les points de code U+0080-U+009F ; résultat rendu hors du fichier avec le sha256 final (réponse de remise).
- sha256 final : rendu hors du fichier, calculé après la dernière édition ; aucune édition après.
