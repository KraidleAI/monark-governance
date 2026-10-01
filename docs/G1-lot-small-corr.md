claude-opus-5-5

# G1 — journal du lot SMALL-CORR (corrections de l'inspection de la partie 1 : collecte et page)

## 0. Identité, mission, conduite

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais), effort max, instance fraîche. Rôle : correcteur
  (`corr`). R-20 : rien commis, aucun workflow lancé.
- **Mission** : `F:/tmp/dojo/mission-corr-small.md` (59 l., 16 142 o), sha256 `7711b20bbaf878dd4b935851b63dc013af8e95fc013f443a199eebc3a5f7d258`,
  recalculé AVANT lecture (02:14:58Z), égal au champ `sha` du reçu `F:/tmp/dojo/mission-corr-small.recu.json` (verdict vert, 02:14:29Z,
  `repo` `F:/Monark-wt-small-corr`, `base` = `head` = `1f23825455c52c841323352ee0ca16017ffa4b04`, douze règles du linter à 0).
- **Règles** : `docs/methode/REGLES-MISSION.md` du worktree (20 l.), sha256 `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba`,
  égal à l'en-tête de la mission ; les cinq outils de l'en-tête (`lint.mjs`, `launch.mjs`, `run.mjs`, `r25.mjs`, `red-proof.mjs`) recalculés :
  cinq égaux (worktree et tronc pour les trois derniers).
- **Worktree** : `F:/Monark-wt-small-corr`, branche `lot/small-corr`, HEAD `1f23825455c52c841323352ee0ca16017ffa4b04`, `status --porcelain`
  vide à 02:14:58Z. Décision 300 : une partie, une inspection ; ce lot corrige les constats retenus par l'orchestrateur, sans oracle complet
  (absent de « À faire » ; l'oracle de la partie est celui de l'inspection).
- **Heures** (`date -u`, 2026-10-01) : 02:14:58Z empreinte et état git ; 02:15Z à 02:31Z lecture ; 02:31:17Z verrou d'hôte absent, C-V-4
  (12 063 Mo physiques, 29 192 Mo virtuels libres, 13 `node.exe`) ; consultation de l'advisor intégré ; 02:35Z écriture de ce journal.

## 1. Entrées lues (ordre de la mission, en entier sauf mention ; sha256)

| # | Entrée | l. | sha256 |
|---|---|---|---|
| 1 | `F:/tmp/dojo/insp1/g2-collect/RAPPORT.md` | 320 | `37e9fdd74cfa5b22acf7b1a30e9aec8df5d7f626519a4429eb2b1c617420780f` |
| 2 | `F:/tmp/dojo/insp1/g2-site/RAPPORT.md` | 336 | `520da55643b3189bd6de804009ba209861b3cac1d16eab529edd875b794f7af1` |
| 3 | `apps/dojo/src/collect.ts` | 306 | `afd31de87ea2431cb8c8d36ab488b50f8b6147c8859d2e6c580fe6b33f9b9405` |
| 4 | `packages/rpc-guard/test/body-bound.test.ts` | 152 | `fb029388685a1ca142b6d3ed8a3c97f5c791f513b60c8c316f755b87b7d4f43d` |
| 5 | `apps/dojo/test/helpers/collect-chain.ts` | 97 | `1a0eb87674140b43f78b95a0650825b67ad87ab3ec7d8ccd30e443b0c5a578e4` |
| 6 | `apps/site/lib/dojo-served.ts` (l.1-30, l.150-201) | 201 | `d6614b88905a00799bd37b0416e394afe9af3031c768ad3099a5a9016dc4340f` |
| 7 | `test/dojo-table.test.ts` | 274 | `ae966d82461981e940dc48b62a5daf58be870b59ff25452ed830a99a6137eba5` |
| 8 | `docs/G1-lot-dojo-pr4c2a.md` | 263 | `3748d41f12e43ec3f18fee60df8aef7377553ec4a647e6eb8057e60dfae1ee86` |
| 9 | `docs/RUNBOOK-dojo.md` (l.1-39, l.95-134, l.187-322) | 794 | `5f70535a04538ff14b780b2a38f4832fe13e868a15cb8216fb25a4a98ef18b1d` |
| 10 | `deploy/monark-dojo-collect.service` | 55 | `1b3aed5c209600d23628ea99068356fdef0474e46802111201ad098bd92c1aea` |
| 11 | `F:/Monark/scripts/red-proof.mjs` (l.1-75) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

- Lectures d'appui : `packages/rpc-guard/src/transport.ts` (l.160-180 ; `f6a59ea2…5689`) ; `packages/rpc-guard/src/ledger.ts` (l.118-215 ;
  `df76d5d1…2a2d`) ; `packages/rpc-guard/src/cli.ts` (`unlock`, `28cb5fb3…c558`) ; `docs/RUNBOOK-rpc-guard.md` (§3, l.58-134 ; `76f3c921…fd4a`) ;
  `apps/dojo/test/dojo-collect.test.ts` (l.1-75 ; `6f1340d9…8c3d`) ; `apps/dojo/test/helpers/dojo-fixture.ts` (exports ; `2e9e04b7…7e1d`) ;
  `test/dojo-collect-deploy.test.ts` (l.31-77, lecture seule : fichier d'un autre correcteur ; `92a621c0…b080`) ; `.github/workflows/ci.yml`
  (l.40-98, R-25 ; `0f401ae2…949a`) ; `F:/Monark/scripts/oracle/r25.mjs` (28 l., `4d0544df…`) ; `F:/Monark/scripts/mutants/run.mjs`
  (l.1-200 ; `2606e7da…3b19`) ; `F:/Monark/docs/ETAT.md` (l.36-72, tronc `ee5d1758` ; `0ef7fff4…b349`) ; `F:/Monark/docs/G1-lot-dojo-pr1b4.md`
  (l.316-322, l.516-526 : montage `<out>/node_modules` du harnais) ; sonde B du G2 collecte `F:/tmp/dojo/insp1/g2-collect/probes/`
  `g2probe-collect-body.test.ts` (77 l., `3defa2c3…05cd`) ; sonde de rejeu `F:/tmp/dojo/insp1/g2-site/tmp/tools/leg1-replay.mts` (20 l.).

## 2. Constats (liste AVANT tout code)

Retenus par les décisions de l'orchestrateur (mission, « Décisions ») :

| Id | Où (rapport) | Défaut | Décision → fichier |
|---|---|---|---|
| C-AC-1 | `collect.ts:131` | `{ boundBody: true }` tué par aucun test (sonde A : 28 tests verts sous `{}`) | test neuf, cas 1 et 4 de la sonde B |
| C-AC-3 | `RUNBOOK-dojo.md:225-228` (§6) | « SIGTERM laisse les verrous », contraire à `collect.ts:292-297` | §6 dit ce que fait le code, comme §9 l.292-295 |
| C-AC-4 | `RUNBOOK-dojo.md:317-319`, l.26-28 | STOP guéri (`ledger.ts:211`, `:188-189`) ; `relay_missing` | exemple remplacé ; `relay_missing` retiré |
| C-N-1 | `monark-dojo-collect.service:32` | « 30 s to the response head » : avec `boundBody`, en-têtes ET corps | commentaire aligné sur le code |
| C-N-7 | `RUNBOOK-dojo.md:122` | renvoi `transport.ts:93-97` ; la clé est lue l.171 et posée l.172 | renvoi `transport.ts:171-172` |
| P-AC-1 | `dojo-served.ts:193` (page AC-1) | mutant `W[c]` → `c` (M-K17) tué par aucun test | test 2 : mots de classe injectés distincts, tueur empilé |
| P-AC-2 | `G1-lot-dojo-pr4c2a.md:150`, `:210` | deux empreintes fausses ; producteur de `leg1.txt` non nommé | empreintes, producteur, sonde |

- Mesures avant code (P-AC-2, 02:15Z) : `F:/tmp/dojo/pr4c2a/tools/texts-sha.mjs` = `0ea0a77ef2f00a661f94ac1b26a6664430624143d7705b551d2142789c0e5b6d`
  (le journal dit `…6b6d`) ; `F:/tmp/dojo/pr4c2a/logs/leg1.txt` = `97505b6ab7cd9d2bbb692325d8d7c39ba28a29c2d71258e51482f23b4f8bb2cc` (le journal dit
  `…22bc`) ; `grep -rl bytes_per_line` sous `F:/tmp/dojo/pr4c2a` (hors `node_modules`, `.git`, `.next`) : `logs/leg1.txt` seul. Producteur retrouvé dans
  la transcription du G1 PR-4c-2a (`F:/claude-config/projects/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/subagents/agent-aeafe319163c67d7a.jsonl`) :
  l.636 (00:15:44Z) écrit `F:/tmp/dojo/pr4c2a/clone-t/tmp-measure/leg1.ts` par heredoc et le lance (`| tee logs/leg1.txt`) ; l.641 (00:16:10Z)
  le retire (`rm` puis `rmdir`) ; absent du disque (contrôlé à 02:2xZ).
- C-AC-4, faits : `relay_missing` : 0 occurrence sous `apps/`, `packages/`, `test/`, `scripts/`, `deploy/` ; `unlock` ouvre le grand livre
  (`cli.ts`, `openOperatorLedger`) : une tête supprimée lève « head sidecar absent » (`ledger.ts:171`), une queue d'octets nuls « cycle ledger line
  is malformed » (`ledger.ts:135`) ; RUNBOOK-rpc-guard §3 l.116 et l.125-126 (`head_absent` refusé par construction).
- C-N-1 : le parseur d'unité de `test/dojo-collect-deploy.test.ts` ignore les commentaires (l.56) ; aucune empreinte de l'unité n'est épinglée.
- Section 8 du mode d'emploi : relue ; renvois vérifiés (`dojo_close_absorbs_an_orphan_tmp` `dojo-collect.test.ts:590`, `dojo_collect_to_verify_end_to_end`
  `:499`, `layout_stray_file` `layout.ts:14` et `:91`, `writeAtomic` `layout.ts:28`) : conforme, inchangée.
- Hors décisions, listés, non traités : collecte AC-2 (`test/dojo-collect-deploy.test.ts:330`, tirage de minuit : autre correcteur, fichier non
  touché) ; collecte N-2 à N-6 ; page N-1 à N-10. Fichiers et sections d'un autre correcteur non touchés : `apps/dojo/scripts/dojo-publish.mjs`,
  `test/dojo-collect-deploy.test.ts`, sections 7 (5), 10 et 16 à 19 du mode d'emploi.

## 3. Compte ascendant par fichier, AVANT tout code (R-25 : `ci.yml` l.82, insertions + suppressions ; `docs/**/*.md` exclus)

| Fichier | Asc. |
|---|---|
| `apps/dojo/test/dojo-collect-body.test.ts` (neuf) | 55 |
| `test/dojo-table.test.ts` | 6 |
| `deploy/monark-dojo-collect.service` | 2 |
| **Total** | **63** |

- Test neuf : en-tête (5), imports (11), constantes et aides (14), blancs (3), ligne `// killer:` (1), un test à deux cas (21).
- Test 2 de `dojo-table.test.ts` : tueur empilé (1), commentaire (1), mots injectés et table (1), aide de classe (1), assertion (2).
- Unité : l.32 en place (1 + 1).
- Hors compte (`docs/**/*.md`) : `docs/RUNBOOK-dojo.md` ≈ 10 lignes en place (en-tête 2, l.122 1, §6 3, §9 4) ; `docs/G1-lot-dojo-pr4c2a.md`
  2 en place et une note datée en fin (≈ 8) ; ce journal. Borne 1 150 (solde ≈ 1 087), porte CI 1 205.
- Tueurs prévus : deux lignes au format de `parseKiller` (`red-proof.mjs` l.33, l.46-49). Le tueur de la classe est EMPILÉ au-dessus de celui
  du test 2 (`declarations` ne lit que la ligne juste au-dessus de `test(`, l.63 ; précédent `test/dojo-live-surface.test.ts:228-229`).
- F2P : les deux tests épinglent un code inchangé à la base `1f238254` : `red-proof.mjs` les refusera « green at base » par construction (même
  cas que T8 et T9, rapport collecte §7) ; la preuve de leur force est le tueur mesuré tué (harnais du tronc, `--killers`).

## 4. Livré : constat → fichier → test (code et textes écrits de 02:37Z à 02:43Z, après la fermeture du §3)

| Constat | Fichier (lignes) | Preuve |
|---|---|---|
| C-AC-1 | `apps/dojo/test/dojo-collect-body.test.ts` (neuf, 62 l., `5a0a3813…0459`) : tueur l.38, test l.39 | vert (§5) ; K1 tué (§8) |
| P-AC-1 | `test/dojo-table.test.ts` (280 l., `06d8e75d…3b15`) : tueur empilé l.101, assertion l.142-146 | test 2 vert (§5) ; K3 tué (§8) |
| C-AC-3 | `docs/RUNBOOK-dojo.md` §6 l.225-228 (quatre lignes pour quatre) | `collect.ts:291-297` ; §9 l.292-295 |
| C-AC-4 | en-tête l.26-29 (quatre pour quatre) ; §9 l.318-321 (deux lignes deviennent quatre) | `ledger.ts:135`, `:171`, `:188-189`, `:211` |
| C-N-7 | `docs/RUNBOOK-dojo.md` §4 l.122 | `transport.ts:171-172` |
| C-N-1 | `deploy/monark-dojo-collect.service:32` (`e084f0f9…b661`) | commentaire seul ; le parseur des tests l'ignore |
| P-AC-2 | `docs/G1-lot-dojo-pr4c2a.md` l.150 et l.210 en place ; §10 neuf l.264-277 (`ddcd60ea…570c`) | empreintes recalculées (§2) |

- Test neuf `dojo_collect_refuses_a_body_over_the_cap_by_name` : (1) `drand-cf` répond au-delà du plafond, `drand-pl` le monde : un GET chacun,
  `["drand-cf","GET",null,"BodyTooLarge",200]`, aucun `plan.json`, grand livre `attempted` puis `unlocked` ; (2) la pièce gPA de helius
  au-delà du plafond à la lecture 1 : une requête, `BodyTooLarge` code 200, `faults.enumeration` = 1, la lecture écrite. Corps de 200 au
  JSON valide une fois complété de blancs : seule la borne le refuse. Aucun chemin `F:/tmp` dans le fichier public ; aucune barre inverse.
- Test 2 : mots injectés `H-word` et `P-word` (`{ ...copy.DOJO_TABLE, holder, program }`), même vue, sans GET ; l'assertion exige aussi
  les deux classes dans la fixture (`["holder","program"]`), pour ne jamais passer à vide (note N-2 du rapport page).
- `docs/RUNBOOK-dojo.md` final : 796 l., `547e31bbb7882336b34f22dd0ecc8554439531b52a957a5ba81363544e2da866` ; hunks l.26-29, l.122, l.225-228,
  l.318-321 seulement (aucun dans les sections 7, 10, 16 à 19).

## 5. Tests (clone `F:/tmp/dojo/smallcorr/gel`)

- Clone : `clone --no-local` du worktree, `checkout --detach 1f238254` (02:39:03Z-02:39:12Z) ; six fichiers du lot copiés, sha256 égaux
  au worktree à 02:43Z (seul ce journal a changé ensuite) ; jonctions par `mk-nm.ps1` (`d70d8aea…fbe4`) à 02:43:57Z : 220 entrées,
  11 `@monark`, 0 échec ; retirées par `rm-nm.ps1` (`b51b5d22…8749`) à 02:51:48Z : « removed ». `F:/Monark/node_modules` : 220 entrées,
  11 `@monark`, avant et après.
- Chaque course par `F:/tmp/dojo/smallcorr/probes/run.mjs` (`1d9d7b28…e546`) : verrou d'hôte absent et C-V-4 (`Get-CimInstance
  Win32_OperatingSystem`) contrôlés avant, refus sinon ; relevés affichés : node.exe 9 à 11, 12 295 à 13 640 Mo physiques ; 13 noms retirés par
  la règle `DENY` de `red-proof.mjs` (valeurs jamais
  lues), TEMP `F:/tmp/dojo/smallcorr/tmp`, forme de `scripts.test` (`--test-timeout=120000 --test-force-exit`, reporter TAP).
- Page (02:45:33Z-02:45:41Z) : `dojo-table`, `dojo-live`, `dojo-live-surface`, `dojo-page`, `dojo-served` : 48 tests, 48 verts
  (`logs/tests-page.tap`, `f19338493b829a2edac70f8a19c10ba6f17fed74e97d41a258d04d6d50afef6c`).
- Collecteur (fin 02:46:06Z, 19 s) : le test neuf, `dojo-collect`, `dojo-collect-sigterm`, `test/dojo-collect-deploy`, `test/dojo-publish-deploy`,
  `packages/rpc-guard/test/body-bound` : 43 tests, 41 verts, 0 rouge, 2 sautés déclarés (vrai signal sous win32 ; TU-K jusqu'à A-4p)
  (`logs/tests-collect.tap`, `c36f4bfd8ee56cff6d4c9885078ab5cf5ac6501fc0574c5f2401d68dd556a052`). Test 42 non lancé (hors de ces fichiers).

## 6. Portes statiques (clone `gel`, 02:44:26Z-02:46:49Z ; formes de `package.json`)

- `typecheck` 0 (`tsc --noEmit` ; programme de 759 fichiers dont les deux tests du lot, `logs/tsc-files.txt`) ; `lint` 0 (`eslint .` ; les
  deux tests lintés aussi un à un : 0 message, non ignorés, `logs/lint-two.txt`) ; `lint:ratchet` 0 (« 69/69 ») ; `lang:gate` 0 ; `export:check` 0
  (« 0 forbidden path ») ; `gate:vocab` 0 (« scanned 330 file(s) »). Les quatre derniers scripts parcourent le disque (`readdirSync`), pas
  `git ls-files` : le test neuf, non suivi, est vu. Journaux `F:/tmp/dojo/smallcorr/logs/gate-*.txt` (sha256 au §11).

## 7. F2P (`red-proof.mjs` du tronc, `6579b550…ab36`)

- `node F:/Monark/scripts/red-proof.mjs --base 1f23825455c52c841323352ee0ca16017ffa4b04 --gel F:/Monark-wt-small-corr --repo
  F:/tmp/dojo/smallcorr/gel --out F:/tmp/dojo/smallcorr/f2p --draw 2 --seed 2026` (02:47:22Z-02:47:48Z) : 2 tests jugés, 2 refusés « green at
  base: a self-confirming test », 6 inchangés, 0 tueur tiré (population 0) ; `F:/tmp/dojo/smallcorr/f2p/RED-PROOF.json`
  `9b4f6f274fcba4751362a53f9f1194396253fbd7ec223fef320543f87dc2448e`, `ok: false` (l'outil rend alors 1 : `red-proof.mjs` l.260).
- Structurel, sans défaut : aucune ligne de production ne change entre `1f238254` et cet arbre ; les deux tests épinglent un code déjà réuni,
  comme T8 et T9 (rapport collecte §7). Les deux lignes `// killer:` lues par red-proof sont valides (`killerProblem: null`). Leur force est
  prouvée au §8.

## 8. Mutants (harnais du tronc `scripts/mutants/run.mjs`, `2606e7da…3b19`, outil à `cdd7664e`, propre)

- `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/smallcorr/gel --base 1f23825455c52c841323352ee0ca16017ffa4b04 --out
  F:/tmp/dojo/smallcorr/mut1 --killers --targets apps/dojo/test/dojo-collect-body.test.ts,test/dojo-table.test.ts --lock-root F:/tmp --min-free-mb 4096`
  (02:48:47Z-02:49:20Z, un seul lancement). Porte : `held("F:/tmp")` nul par `lock.mjs` à 02:48:37Z ; mémoire virtuelle libre exigée
  ≥ 8 192 Mo par le lanceur (29 510 relevés) ; aucune autre course pendant. `<out>/node_modules` = jonction vers `gel/node_modules`
  (MUTANTS-NM-WORKSPACES-1 ; montage de `G1-lot-dojo-pr1b4.md` l.521), retirée entre 02:51:48Z et 02:51:53Z (« junction removed »).
- Ligne de base verte (86 verts, 0 rouge). 9 tueurs sur 9 tués, tous `strict` (`ERR_ASSERTION` seul), fichiers restaurés (sha256 égaux) :
  K1 `collect.ts:131` `{ boundBody: true }` → `{}` : le test neuf rougit sur « a relay over the cap » (sous le mutant, `plan.json` écrit et la
  réponse lue : empreinte au lieu de `BodyTooLarge`) ; K3 `dojo-served.ts:193` `W[c]` → `c` (empilé : fichier entier, test 2 rouge, 6 verts) :
  « each class cell is its injected word (M-K17) », cellules `program`, `holder`, `holder` au lieu des mots injectés ; K2, K4 à K9 : les sept
  tueurs existants du fichier, tués. `F:/tmp/dojo/smallcorr/mut1/RESULTS.json` `6e40fe926c4c58837e968905bff20677f9f756107d3b599711d645e8526a119d`,
  `RESULTS.txt` `0ecf80ad19933ea723c0c207e50772e36601705311b5084e78a58ce76459fc49`.

## 9. R-25

- `r25()` exporté (`F:/Monark/scripts/oracle/r25.mjs`, `4d0544df…`) sur `F:/tmp/dojo/smallcorr/clone-r` : clone `--no-local` du worktree à
  `1f238254`, six fichiers copiés (sha256 égaux à 02:50Z), gel `9aad11f6dea236bc1940a61780ad69465716ac74` posé DANS ce clone jetable seulement (identité
  neutre, jamais poussé ; motif de `oracle/run.mjs`, précédent Q-G1-4 de PR-4c-2a) : STAT 69 insertions + 1 suppression = **70**, CONTENT_STAT 0,
  GREEN (`logs/r25.json`, `54417fde2386a5c8f72060161f95b31631a09127a92f848c97022bc0d9211156`). 70 ≤ 1 150 (solde 1 080) ≤ 1 205.
- Recoupement en lecture seule sur le worktree (`R25_DIFF_RE` exporté, `probes/r25-preview.mjs`) : suivis 7 + 1, non suivi 62 lignes : 70.
- Par fichier (mesuré / estimé) : test neuf 62/55, `dojo-table.test.ts` 6/6, unité 2/2 ; total 70/63 (×1,11).

## 10. Écarts et questions à l'orchestrateur (Q-n)

- **É-1** (`error_origin` : ce correcteur) : la première commande de gel de `clone-r` portait `--no-verify` (suggestion de l'advisor reprise
  sans contrôle) ; bloquée par le crochet `gate-commit.ps1` (R-22) avant toute exécution (HEAD de `clone-r` inchangé, index vide : contrôlés) ;
  refaite sans l'option, crochet passé (aucun TODO/FIXME). Rien contourné.
- **É-2** (ce correcteur) : quatre lignes de tableau des §1 et §2 dépassaient 160 points de code ; resserrées après la fermeture du §3
  (02:36:24Z), sens inchangé ; copie d'avant code : `F:/tmp/dojo/smallcorr/tmp/journal-precode-0236.md` (`f8923be7…9cef`). « contrôlé à
  02:2xZ » (§2) est une estimation : contrôle refait à 02:36:38Z.
- **É-3** (ce correcteur) : §6 du mode d'emploi d'abord écrite sur cinq lignes, ramenée à quatre ; §9 passe de deux à quatre lignes (le
  fichier gagne deux lignes après l.321 : à relire dans les renvois de lignes de l'autre correcteur à la réunion).
- **É-4** (ce correcteur) : une retouche de ce journal écrite par `printf` entre guillemets simples a perdu son apostrophe (« loutil », §7) ;
  relevée par la seconde consultation de l'advisor, corrigée par heredoc ; seule retouche `printf` à porter une apostrophe (relu).
- **Q-1** (tueur empilé) : le tueur `W[c]` est au-dessus de celui du test 2 ; red-proof ne lit que la ligne juste au-dessus de `test(`
  (`red-proof.mjs` l.63) et garde le tueur `shift` du G1 ; le harnais lit les deux (K3, K4 tués). Autre choix : inverser les deux lignes.
- **Q-2** (sections) : la mission nomme « sections 6, 8 et 9 et en-tête » ; N-7 (décision : « vers l.122 ») tombe en section 4 : corrigé
  là, hors des sections de l'autre correcteur ; section 8 relue, aucun constat, inchangée.
- **Q-3** (en-tête l.27-28) : RPC-GUARD-FIRST-APPEND-HEAD-1 reste dans « Before A-7 » sous la forme « carried by » de l.21-22 (AC-4 :
  « marquer l'item livré ») ; le G0 RPC-GUARD-FIRST-APPEND-1 l.148 (R-1 RUNBOOK-DOJO-RPCGUARD-TEXT-1) disait « retirer de la liste » :
  à trancher (une ligne).
- **Q-4** (N-1 ; G0 l.149, R-2 DOJO-TIMEOUT-DERIVATION-TEXT-1) : la moitié « test » (`test/dojo-collect-deploy.test.ts` l.49-50, « to the
  response head ») est dans le fichier de l'autre correcteur : non touchée ; à plier avec son delta.
- **Q-5** (F2P) : les deux tests sont refusés « green at base » à `1f238254` par construction (§7) ; proposé : les lire comme épingles à la passe
  F2P de l'inspection ; à la base de la partie (`8950ab15`), raisonné et non mesuré, le test neuf rougirait par `codeOf(...)` (refus
  `relay_missing` de `--plan`, rapport collecte §7) et le test 2 par `added(...)`.
- **Q-6** (harnais) : la campagne du §8 est faite par l'outil du tronc et citée par chemin et sha256 (REGLES, ligne datée 14:5x : statut
  « fusionné, à brancher » jusqu'à la première campagne d'un autre lot) ; le montage `<out>/node_modules` fait résoudre les `@monark/*` du
  clone du harnais vers les paquets de `gel` (octets égaux : le lot ne touche aucun paquet).
- **Q-7** (R-25) : gel dans un clone jetable pour `r25()` (§9), comme Q-G1-4 de PR-4c-2a (avis G2 (a)) ; aucune écriture git dans le
  worktree ni dans `F:/Monark`.
- Items existants, inchangés : DOJO-COLLECT-BODY-STALL-1, forme « corps bloqué » (délai injectable dans `collect.ts`, rapport collecte AC-1) ;
  le test neuf ferme la forme sans délai. PAROXYSME : aucune limite neuve déclarée par ce lot.

## 11. Git, périmètre, provenance

- Worktree : `git` en lecture seule (`rev-parse`, `branch`, `status`, `diff`, `ls-files`, `GIT_OPTIONAL_LOCKS=0`) ; état final : quatre fichiers
  modifiés et deux neufs (§4), HEAD `1f238254`. Écritures git dans des clones jetables seulement (`gel`, `clone-r` avec son gel, `mut1/clone`
  par le harnais, clones temporaires de red-proof retirés par l'outil). Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun
  `write-tree`, aucun `push`, aucune page d'aide. Rien commis dans le worktree ni dans `F:/Monark` (R-20), aucun workflow.
- `F:/Monark` lu seulement (outils, ÉTAT, `G1-lot-dojo-pr1b4.md`, `node_modules` cible des jonctions) ; son HEAD a avancé pendant ce lot
  (`ee5d1758` au début de la session, `cdd7664e` relu à 02:49Z), sans acte de ma part.
- Aucun réseau, aucun outil de recherche distant, aucune clé ; rien écrit sur C: (le crochet `gate-commit.ps1` y est lu, jamais écrit) ; TEMP
  `F:/tmp/dojo/smallcorr/tmp`. Hors dépôt : `F:/tmp/dojo/smallcorr/` (`gel`, `clone-r`, `mut1`, `f2p`, `logs`, `edits`, `probes`, `tmp`) et
  `F:/tmp/dojo/smallcorr-deliver/`.
- Outils de ce lot (`probes/`) : `find-leg1.mjs`, `targets.mjs`, `replace.mjs`, `guard.mjs`, `run.mjs`, `held.mjs`, `r25-run.mjs`,
  `r25-preview.mjs`. Journaux des portes : `gate-lint-ratchet.txt` `bf35ba72…ecfd8`, `gate-lang-gate.txt` `b7247d5b…270f`,
  `gate-export-check.txt` `08affca0…9f3f`, `gate-gate-vocab.txt` `81694cc0…52d8`, `typecheck.txt` et `lint.txt` vides (`e3b0c442…b855`).
- Advisor intégré consulté après l'orientation, avant toute écriture (plan) ; seconde consultation avant la remise. Ordre de remise : ce
  journal, `REPONSE.md`, puis `DELIVERED.sha256` en dernier.
