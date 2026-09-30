claude-opus-5-5

# G0 — journal du lot Dōjō PR-4c-1 (tête du jour relue par le navigateur) : pli de l'ADR-DOJO-PR-4 avant le G1, sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session ; préfixe vérifiable `claude-opus-5-5`, décision 133), effort high (mission), contexte frais. Worker planificateur : ne committe pas (R-20), ne lance aucun workflow, aucun git écrivant.
- **Mission** : `F:/tmp/dojo/mission-g0-pr4c1.md` (21 l., 4 465 o.), sha256 `5bb1677699b31aebd1dcb496df6e1e629cb91d65f7d62130ab917cbc5b13789b`, recalculé AVANT lecture (01:29:22Z), égal au reçu `F:/tmp/dojo/mission-g0-pr4c1.recu.json` (verdict vert, 12 codes à 0, `repo` = ce worktree, `base` = `head` = `b7615de9bf869bf1e012bb9980cb1419a04dbaea`). Règles `docs/methode/REGLES-MISSION.md` (17 l.), sha256 `c5a3c674a5c1b1411acf3fd7133f34e8e4444bc4741ac527656a916715711f5b`, égal au fichier du tronc `F:/Monark/docs/methode/REGLES-MISSION.md` ; lues en entier.
- **Livrable** : pli ajouté à la fin de `docs/adr/ADR-DOJO-PR-4.md`, l.267 (ligne vide de séparation) à l.368 : 102 lignes (≤ 120) ; son titre (l.268) porte `claude-opus-5-5` ; la l.1 de l'ADR porte `claude-opus-5-5[1m]` (rédacteur du G0 d'origine). ADR 266 → 368 l., 98 891 o., LF final, 0 CR, 0 TAB, aucun caractère de contrôle (C0 hors LF, U+007F à U+009F). **sha256 final de l'ADR : `c36f6448543c99083b148e0c7b895270db1aff8004ff5028e4dfebbc26c3a768`** (02:01:09Z) ; avant le pli : `1a97275b425de61cee3142e3f2b23277d2299a61681733d5f46b6db3ff5ca435` (recontrôlé juste avant l'ajout, 02:01:01Z). Aucune édition de l'ADR après ce hachage.
- **Base** : worktree `F:/Monark-wt-dojo-pr4c1`, branche `lot/dojo-pr4c1`, HEAD `b7615de9bf869bf1e012bb9980cb1419a04dbaea` (tronc) ; `git status --porcelain` à l'ouverture : vide (arbre propre) ; à la remise : ` M docs/adr/ADR-DOJO-PR-4.md` et `?? docs/G0-lot-dojo-pr4c1.md`, rien d'autre.
- **Heures** (`date -u`) : 01:29:22Z (sha256 de la mission, puis lecture), 01:29:36Z (sha256 des dix entrées), 01:51:10Z (sha256 des lectures complémentaires), 01:53:39Z (début de l'écriture), 02:01:01Z (ajout du pli), 02:01:09Z (hachage final de l'ADR) ; remise : dernière ligne de ce journal.

## Entrées de la mission, dans l'ordre (sha256 à 01:29:36Z ; toutes lues en entier)

| # | Entrée | l. | sha256 |
|---|---|---|---|
| 1 | `docs/adr/ADR-DOJO-PR-4.md` (D-1 à D-5, §3 à §10, lignes datées de fin dont QF-3 l.266 et le pli G7 de PR-4a-2 l.248-264) | 266 | `1a97275b425de61cee3142e3f2b23277d2299a61681733d5f46b6db3ff5ca435` |
| 2 | `docs/dojo/FAITS-webcrypto-ed25519-edge-cache-2026-09-30.md` | 25 | `feaad9f534a21177eaf578982f9411ac796d3bf598c5aba1086e6f12b555086f` |
| 3 | `F:/Monark-wt-dojo-pr1b4/docs/adr/ADR-DOJO-PR-1B-4.md` (worktree voisin, lecture seule ; D-1 bornes totales l.72-82, D-3 l.94-112, item l.191, pli cp-1 l.225-236) | 236 | `888d5a5b2fc6d83119d5dfeff5589b8c22fddfdc464da2e3842be0221548bca5` |
| 4 | `apps/site/lib/dojo-served-load.ts` | 248 | `a83faaed956f54225481373dbcbec1ca06e70c4e3ee152ac5d792f728fda5a88` |
| 5 | `apps/site/lib/dojo-served.ts` | 41 | `0eeae2b3ceed980b4e8b78233ea5f863108a67406bca8727d2f07007658c8d00` |
| 6 | `apps/site/app/dojo/page.tsx` | 58 | `6731a41d0de8abf753deaf45879c721a29e46e0c89d9da244fb50481ec9dda36` |
| 7 | `apps/dojo/scripts/dojo-verify.mjs` (`VERIFY_BOUNDS` l.37 : deux clés à la base) | 355 | `d768df168b1784bc53e76989c0a767bfb7e737f7fd7c6075565bb7fc98b349cb` |
| 8 | `apps/site/next.config.mjs` | 49 | `3bb4cf7dd1066ae77c00a49ecaca9d9c277e0d85c76062a5b8741365603caf5e` |
| 9 | `apps/site/lib/narabi-live.ts` (précédent) | 970 | `e794a94736367b159a1c0548d84575f3eabe03f575a88b272ec310adceef6cfd` |
| 10 | `docs/CHANTIERS.md` : entrées du 2026-09-30 (l.2122-2128), avec celles du 29 au soir (l.2119-2121) ; recherches `PR-4c-1` et identifiants d'items | 2 202 | `5504b8d5d28b0664027cfdfca718fba0e333067e32a078299d18ee3b2e060bb9` |

## Lectures complémentaires (sha256 à 01:51:10Z ; par extraits, lignes citées au pli)

| Fichier | sha256 | Objet |
|---|---|---|
| `F:/Monark-wt-dojo-pr1b4/apps/dojo/scripts/dojo-verify.mjs` (blob `7e395e27` = `381de4fd:` du même chemin) | `f3292bdba25c1434528809ad12ef928f230b7e54dbf88ccf9c9217ea06118298` | `VERIFY_BOUNDS` à cinq clés l.44-45, `SERVED` l.65, `urlSource` l.72-103 |
| `F:/Monark-wt-dojo-pr3a1b/apps/dojo/src/bundle.ts` (blob = HEAD `b0e595a5`) | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` | l.54-72, l.88-126 (lectures d'un jour abstenu) |
| `F:/Monark-wt-dojo-pr3a1b/apps/dojo/scripts/dojo-publish.mjs` (blob = HEAD `b0e595a5`) | `8d864a9c156eb9611399fdac6f0daf2c19a1650a0f7bf0d2d1c3aa5becaeb0f9` | l.196-230 (ligne `snapshot`) |
| `F:/Monark/scripts/mission/gen.mjs` (tronc) | `9eecb3717c7a2ad11a021d81ebfe949dc38c9279c8db73743fe6b07c82711ae2` | l.1-21, l.62-68 (ancre ADR) |
| `apps/site/components/dojo/dojo-figures.tsx` | `41ac0249c7b19029277d496d180617bdeed6aea33dea46ff4116bcbf83cf6def` | en entier |
| `apps/site/lib/dojo-copy.ts` | `0699b27483650aadac0606529d3b90406a877ed7cb7e1cc76f331493ba0abe07` | en entier |
| `scripts/assert-fleet-html.mjs` | `31975dbdece2c548d74ab4f0111b3b6b74b299ffe6f8c4e3e591d66af46864e6` | l.580-700, fin (garde d'exécution) |
| `test/dojo-page.test.ts` | `7e0c61263227e9b14004163e26a62efd2a8d17bd56185c2e2d7b418f47f30569` | noms de tests, l.65, l.99 |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `aa4151bcf4fd967b19c15b52d2e981d2992daf5e40eb0c4af1b540dbec1d7d51` | exports |
| `apps/bell/scripts/bell-chain.mjs` | `521270a3793716c53b61ba1ee7ccec5aa4faa0f24406cba04e6a254398816ce7` | l.11-23, l.49-92 |
| `apps/dojo/scripts/dojo-core.mjs` | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | l.325-364 |
| `scripts/probe-narabi.mjs` | `4e4338c026ad650882ebde28b2af2c2fa7a457ca2077788a30382251483883b8` | l.1-40, exports |
| `deploy/monark-probe.service`, `deploy/monark-probe.timer` | `985f8381de31f7cb071305c4eb01ae7df258d506ca3b2e124e7c23d3ef5f9ce8`, `39335a1e1621733fc9b67020029bf504c6857f2738d18989e5d761e42bece3ee` | en entier |
| `.github/workflows/ci.yml` | `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a` | l.76-92 (pathspec de R-25) |
| `docs/adr/ADR-DOJO-PR-3.md` | `dd630e8750b618038569ea22fbe6a54bc51dc92b35331c75450d31d299bb03dd` | l.49, l.66, l.98, l.208 ; recherches |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (mère) | `562d9be74707b38f49c8c4ea04c30153504a875cdbb2197e0943bcd5c3a69f0c` | l.249, l.268, l.717, l.1360, l.1363 ; recherches |
| `docs/G1-lot-dojo-pr4a1.md`, `docs/G1-lot-dojo-pr4a2.md`, `docs/G1-lot-dojo-pr3a1.md` | `f926c8f61c77953d899dbbcd4b4f8216bab00ec8f978aa078df950ae121dbff7`, `b7ef0d3f0a87ba5d6052a8d7d71e5b4e17cf9b43cffc0ffd63247ea2719a9143`, `7cde71ae5570f2c7705533f3278dd4a7ac7785db77767f171bf987c1bc612327` | l.63, l.142, l.151, l.252 ; l.100-106, l.279-284 ; l.134 |
| `docs/dojo/rapports/G2-pr4a1-2026-09-27.md`, `docs/dojo/rapports/CP2-pr4a1-2026-09-27.md` | `17b61686b861fd3c0075cb604d96adc5ea51493407a7c36cc2f86615e65b286c`, `93832675bdef916ce1fb1827e9615adf77b40434a09f7d0ecd8b63e1f528b1e9` | G-M8, G-M19, C-8 |
| `docs/G0-lot-dojo-pr4.md` (patron de ce journal) | `a02f990664eac2854dd98264a5d39f514ff42e491780ca37a2952244f20089e8` | l.1-30 |
| `apps/site/lib/bell-served-load.ts`, `apps/site/components/narabi/narabi-live.tsx` | `15ddace27f8ea521644dadb3e69facf59433448679ee5aaed4cc7c5a8373fc67`, `70d3dc64fc8de52949a2f073d34a1bf68f45789d875094f1b3004ef88ca8435e` | `deploy_check` ; `no-store` l.77 |

## Décisions (une ligne ; détail au pli, l.268-368 de l'ADR)

- D-P1 : coupe pré-déclarée avant toute écriture : PR-4c-1a (module pur, oracles, FIXTURE-SPREAD) 409 ; PR-4c-1b (surface) 360 ; PR-4c-1c (sonde) 340 ; lot 1 109 (l.169 : 430).
- D-P2 : `dojoBodyOf(figures)` unique pour le premier rendu et la relecture ; TXT-14r ajoutée à `shown` de `dojoExpected`.
- D-P3 : jour de la tête rendue toujours visible, repli avec chiffres et jour committés, phrase d'issue contiguë ; lexique sur toutes les constantes, aucun « independent ».
- D-P4 : ancres committées (`line_hash`, `keyring`) ; genres suivis fermés ; oracles : égalité avec `buildDojoServed`, refus de tout ce que refuse `walkDojoTimeline`.
- D-P5 : sans Ed25519 utilisable (import + réponse connue), aucune relecture, chiffres committés, TXT-14b-r ; D-1 (2) révisé (Q-P1).
- D-P6 : `no-store` imposé par F3 et par le `fetch` ; `cf-cache-status` mesuré à l'acte puis chaque jour.
- D-P7 : `DOJO_LIVE_BOUNDS` = `VERIFY_BOUNDS` (cinq clés) par `deepStrictEqual`, chaque clé appliquée, jamais importé.
- D-P8 : sonde quotidienne sur l'hôte Bell : mandataire = hôte à l'octet, en-têtes, vrai `dojo-verify`, fraîcheur ; condition de (iii-a).
- D-P9 : items : deux traités, trois re-routés avec motif, un étendu, trois neufs (FAITS-CADDY-PROXY-HEADERS-1, DOJO-PROBE-VANTAGE-1, PLI-MERE-PR4C1-1).

## R-25 prévu (borne 547 ; facteur R25-FACTOR-DRIFT-1 ×2,31 appliqué : ascendant ≤ 497)

| PR | Ascendant | ×2,31 | Marge sous 1 150 |
|---|---|---|---|
| PR-4c-1a | 409 (385 si Q-P2 (b)) | 944,8 | 205,2 |
| PR-4c-1b | 360 | 831,6 | 318,4 |
| PR-4c-1c | 340 | 785,4 | 364,6 |
| lot PR-4c-1 | 1 109 | (coupé) | — |

## Contrôles faits (reproductibles)

- Octets et forme du pli, puis de l'ADR entier : script `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/check-pli.mjs` (lecture seule) : « control characters: none », LF final, aller-retour UTF-8 exact ; `grep -c` TAB = 0, CR = 0.
- Lexique : TXT-14r et TXT-14b-r passées au `DOJO_FORBIDDEN` du worktree (`scripts/assert-fleet-html.mjs`, importé sans exécuter son `main()`, garde d'exécution en fin de fichier) : « forbidden none », aucun chiffre hors « Ed25519 ».
- Ancres : `grep -n "^| PR-4c-1 |"` sur l'ADR ⇒ l.169 et l.286 (le générateur prend la première, É-P4) ; `| PR-4c-1a |` l.287, `| PR-4c-1b |` l.288, `| PR-4c-1c |` l.289, chacune unique.
- Constat É-P5 : lecture de code seulement (aucune exécution) ; blobs lus égaux aux blobs committés (`git hash-object` sans `-w` contre `git rev-parse <commit>:<chemin>`).
- Garde d'octets de REGLES-MISSION (« 0x7F-0x9F ») lue au niveau des points de code (U+007F à U+009F) : l'ADR committé avant ce pli (`git show b7615de9:docs/adr/ADR-DOJO-PR-4.md`, sha256 `1a97275b…ca435`, égal à l'entrée 1) porte déjà 254 octets 0x80-0x9F, suites UTF-8 de `é`, `ō`, `→` (`od -tx1`) ; une lecture par octets refuserait tout fichier français.
- Négation « aucune sonde de fraîcheur Dōjō n'existe » (PL-3) : `grep -c -i` de « fraîcheur|freshness » et de « sonde externe|external probe|monark-probe|probe-dojo » sur `docs/adr/ADR-DOJO-PR-3.md` (0 ; 3 : `monark-probe` de Narabi sur l'hôte Bell, l.44, l.49, l.265), la mère (3, source SOL/USD, l.302, l.1092, l.1105 ; 0), `docs/RUNBOOK-dojo.md` (sha256 `4135e84e158be8a05c6da419b26dd6f849a260ce55cad099876f324272822c04` ; 0 ; 0), `docs/PLAN-DOJO-PAGE-1.md` (sha256 `87db0cd99170d4240c4ab16a4b6d1c906a8c3d3c7a1affb5628eb4b5494c8154` ; 1, l.28 : fraîcheur de la page, motif de DOJO-PAGE-LIVE-1) ; `deploy/` : `monark-dojo-collect.service` et `.timer`, aucune unité de sonde Dōjō.
- **Point de vigilance pour la mission du G1 de PR-4c-1a** (aucune décision changée) : FIXTURE-SPREAD est estimé à 40 ascendantes, mais `buildDojoServed` passe le vérificateur complet (forme (B), ADR l.120) et `dojo-verify` recalcule chaque `price_version` depuis les `snapshot` comptés de sa fenêtre (`dojo-verify.mjs` l.209-219 à la base ; fenêtre de sept jours, `dojo-fixture.ts` l.147) : une seconde version exige au moins sept jours comptés de plus dans la fixture ; la marge de 88 ascendantes sous 497 absorbe un doublement, la règle de coupe pré-déclarée couvre au-delà.

## Conduite

- `git` en lecture seule : avec `--no-optional-locks`, `status --porcelain`, `rev-parse`, `log --oneline`, `worktree list`, `grep`, et, après le hachage de l'ADR, `show b7615de9:docs/adr/ADR-DOJO-PR-4.md` (comptage d'octets ci-dessous) ; sans ce drapeau, `hash-object` (sans `-w` : n'écrit aucun objet, ne prend aucun verrou) ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun `add`, `commit`, `stash`.
- Aucun réseau ; aucun test, harnais, oracle ni mutant lancé ; rien écrit sur C: ; commandes Bash courtes (< 6 Ko). Écritures : dans le worktree, l'ADR (ajout du pli par `cat >>` après contrôle du sha256 d'avant) et ce journal ; hors worktree, sous `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/` : brouillon du pli (`pli-pr4c1.md`), `relabel.mjs` (renommage compté des intitulés, arrêté une fois avant écriture sur un compte faux, corrigé), `check-pli.mjs`.
- Worktrees voisins (`F:/Monark-wt-dojo-pr1b4`, `F:/Monark-wt-dojo-pr3a1b`) lus seulement ; le fichier non committé de `-pr1b4` (` M docs/G1-lot-dojo-pr1b4.md`) n'est pas à moi et n'a pas été lu.
- **Advisor intégré, première consultation** (après l'orientation, avant toute écriture) : conseils suivis : coupe 1a/1b/1c et R-25 à ×2,31 ; TY-3 en révision déclarée de D-1 (2) avec réponse connue sur l'ancre committée ; vérifier le constat d'abstention avant de l'affirmer (fait : `bundle.ts` l.65-69, l.96-99, l.124) ; liste complète des items routés, DOJO-ANCHOR-SERVE-1 et DOJO-LOOKUP-PAYLOAD-1 compris ; sonde : cœur « mandataire = hôte » puis ajouts déclarés, un seul chemin pour le vérificateur (l'hôte ; liste F3 inchangée) ; ancre du générateur en question fermée ; rendu unique nommé ; lexique vérifié. Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **Advisor intégré, seconde consultation** (après le hachage de l'ADR, avant la remise) : pli jugé complet au regard de la tâche 2, ADR à ne pas rouvrir ; conseils suivis dans ce journal seul : heure de remise et état git final, affirmation sur `--no-optional-locks` corrigée (`hash-object` en était exclu), méthode de la négation de PL-3, lecture de la garde d'octets par points de code, point de vigilance FIXTURE-SPREAD. Aucune décision ni aucun octet de l'ADR changés.
- **Remise** : `date -u` 02:08:06Z ; sha256 de l'ADR relu à cette heure : `c36f6448543c99083b148e0c7b895270db1aff8004ff5028e4dfebbc26c3a768` (inchangé depuis 02:01:09Z) ; `git status --porcelain` : ` M docs/adr/ADR-DOJO-PR-4.md`, `?? docs/G0-lot-dojo-pr4c1.md`, rien d'autre.
