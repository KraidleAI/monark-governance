# Checkpoint-2 (livrable) — lot BELL-SHORTPAGE-1 — validateur-humain (claude-fable-5-1), 2026-09-22

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (LIVRABLE) — Lot BELL-SHORTPAGE-1 — **ACCEPTE-AVEC-CORRECTIONS** (liste fermée, toutes hors code ; une question d'escalade pré-cadrée, non bloquante)

## 0. Reprise post-coupure (~21:37 UTC)

Tous mes rejeux s'étaient terminés AVANT la coupure (oracle lancé 21:28:02Z, mutants 21:28:06Z, fusion à blanc + oracle fusionné ensuite). Contrôle post-coupure (21:45 UTC) : `tree` (`8785247` = commit de fusion à blanc) et `tree-mut` (`e5dfbb4`) `git status` 0, `git fsck` propre ; **aucun octet NUL** dans mes journaux (`logs/*.log`, `mut/*.log`, `mut/golden/*`) ni dans les fichiers du lot des deux clones ; queues des journaux intactes (`export:check exit=0`, `ALL 30 MUTANTS KILLED…`, résumés `ℹ` présents) ; golden restauré à l'octet (`d50901b7…` / `f32de2bd…`), aucun `mutants.inprogress.json`. **Rejeu APRÈS la coupure** : fichier de test du lot sur `tree-mut`, TAP, 71/71/0/0, les 10 tests nommés du lot verts (`logs/postcut-lotfile.tap`). Aucun rejeu à refaire.

## 1. Checkpoint et artefacts lus

Checkpoint **LIVRABLE**, en parallèle du G2 (ignoré, CA-9). Lus : `docs/CHECKPOINT1-lot-bell-shortpage-1.md` (mes C-1..C-5) ; `docs/G1-lot-bell-shortpage-1.md` ; `docs/course-bell/INCIDENT-powercut-2026-09-22.md` (ruling C-6) ; `F:\tmp\bellsp1\{DELIVERED.sha256, mutants.mjs, mutants.log, ADR-amendement.md, fsync-probe.log, frozen-before/after.txt, r25-final.log}` ; `git diff de30eab..e5dfbb4` (2 fichiers, +281/−41) ; `docs/CHANTIERS.md:765,817-839,865,882` ; `docs/course-bell/ANCHORS.md` ; `ADR-T1aii…:380-396` (D1-octies, point d'insertion) ; `apps/bell/src/collect.ts:744-762`. Aucun fil de travail du worker lu.

## 2. Rejeux (CA-9, AM-2 ter — chemin `F:\tmp\cp2-bellsp1\`)

| Rejeu | Résultat mesuré | Attendu |
|---|---|---|
| Clone `--no-hardlinks` `lot/bell-shortpage-1` → `tree` ; `mk-nm.ps1` (220 entrées, `@monark` 10, `require.resolve` → le clone) | HEAD `e5dfbb4`, sha `d50901b7…` / `f32de2bd…` = `DELIVERED.sha256` | = |
| Oracle 7 étapes (`env -u` 8 clés, TEMP/TMP/TMPDIR F:) | 7 × exit 0 ; **930/929/0/1** (skip `u4b_labels_replay_via_main_real_artifact`) ; ratchet 69/69 ; lang-gate 0 ; export:check 0 ; vocab 220 fichiers | 930/929/0/1 |
| 30 mutants, harnais livré recopié à l'identique **sauf les deux constantes de chemin** (diff vérifié : seule la ligne de commentaire 9 diffère), sur le clone séparé `tree-mut` | contrôle vert ; en-tête `d50901b7…` ; **30/30 KILLED byIntended**, restauration à l'octet, 0 SURVIVED/FIND-ERROR | 30 |
| R-25, pathspec verbatim `ci.yml:65`, `de30eab...HEAD` | **322** (281+41) | 322 |
| A-6 : 9 sha gelés recomputés dans le clone vs `frozen-before.txt` | **9/9 FROZEN-OK** | 9/9 |
| Fusion à blanc : `FETCH_HEAD` = `lot/etude-suite` @ **`e3884ae`**, `merge --no-ff` du lot | propre (`ort`), 0 conflit ; blobs `rebase-crosscheck.ts` `16fee0f…` et test `89173e3…` identiques lot/fusion ; typecheck 0 ; **942/940/0/2** (2ᵉ skip = `sentinel_run_releases_chainstack_lock_on_sigterm`, SIGTERM win32 — pas une régression ; +12 tests = commits de `lot/etude-suite` depuis `de30eab`) | vert |
| Validité de la fusion contre le HEAD courant | `F:\Monark` a avancé `e3884ae` → `15fb00a` (G1 HARNESS-DESC-1, ancre `mint_resume-AAPLx-2`) : **docs + ancres seulement, fichiers du lot et `collect.ts` intacts** (`git diff --quiet`), `de30eab` ancêtre | fusion toujours valide |

Non re-mesuré, déclaré : le coût fsync (`fsync-probe.log` = chiffres ADR §4, 1,54 / 3,33 ms) et le compte de base 921 sur `de30eab` — non porteurs.

## 3. Checklist

- **CA-1** conforme : chaque critère du checkpoint-1 a un test nommé, relu dans le diff (a→`…commits_the_final_page`, b→`…nonempty_stops…`, c→`…anchor_differs…`, d→`…idempotent_reverification`, e→`…never_probes`, f→`…budget_bites…` avec max-calls 4 **et** 5 = sonde ET ancre, +g garde réelle, +h retry, +i C-6).
- **CA-2** conforme : décision 135(2) verbatim ; C-1 est sa lecture fail-closed. Aucune valeur nouvelle.
- **CA-3** correction (non bloquante pour le code) : D1-nonies est proposé et complet (repli C-B-1 §1, relaxation §3, tuyaux §6, MAST §7, D-n §5) mais **non inséré** (G1 : « insertion au G7 ») — deux items y sont **déjà périmés**, voir C-2/C-3 ci-dessous.
- **CA-4** conforme : mono-worker, G2 et validateur en instances séparées.
- **CA-5** conforme : 4 modes MAST nommés avec contre-mesures (ADR §7), dont « la sonde reprend le token de la page courante » tué seulement par la requête enregistrée (M30 rouge, vérifié).
- **CA-6** : oracle rejoué par moi ; **acceptation sous réserve du G2 PASS en main du G7**.
- **CA-7** : I-SP-1..5, R-SP-1/2, R-C6-1/2 formés ; deux items périmés et un déclencheur mal posé (corrections).
- **CA-8** : worker `claude-opus-5-5[1m]` déclaré (décision 133), commit `e5dfbb4` par `Kraidle` (orchestrateur, R-20) ; `error_origin` proposé « plan » ×2, à adjuger au G7.
- **CA-9** conforme : tout re-exécuté sur clones séparés, harnais indépendant du worktree du worker.
- **CA-10** conforme : lot ≤ 322, aucun argument de vitesse.
- **CA-11 (durci)** conforme pour la RÈGLE : les tests a/d/g exécutent la composition depuis `runMain` (`b1aArgsStrict` = `--rebase-crosscheck` sans `--allow-short-pages`) → `collect.ts:753` → `runRebaseCrosscheckCli` → `scanFullMint` → fichiers **réels** relus (`readSP`, `reportProbe`, `spLedger`) ; `calls_by_method.getTransactionsForAddress` **= 4 exactement** asserté ; g passe par la garde réelle (`globalThis.fetch` seul bouchonné, 4 lignes helius, 40 cr vs 3/30 en contrôle). Nuance déclarée : le **champ** `short_final_page_probe` n'a aucun consommateur code — provenance lue par l'orchestrateur à `mint_end` (I-SP-3) ; acceptable en tant que provenance déclarée, pas comme pièce.
- **Anti-close** conforme : le diff n'ajoute aucun base58 ≥ 43, aucun entier ≥ 7 chiffres, aucun décimal ; fixtures synthétiques (`nfBulk`/`nfFiller`, slots 1008-1187, sigs `s0..s178`). Coïncidence vue, hors clause : SP2 RAW = **180** = compte de tx public de la page 8 784 (`CHANTIERS.md:838`) — un compte, ni prix, ni sig, ni slot.

## 4. Les six questions

**(a) Sonde `null` sur `budget_exhausted` — acceptable, mais pas tel qu'écrit.** Pas une décision de valeur (artefact jamais scellé, reprise re-sonde, appel payé visible dans `calls_by_method` et le ledger de cycle). Mais l'ADR §3 **se contredit** (« toujours présent ; `null` = pas de sonde » puis « pas tracé sur `budget_exhausted` ») et le commentaire `rebase-crosscheck.ts:761` (« null = no probe ») est faux dans le cas max-calls 5 du test (f) — exactement le mode « rétention d'information » nommé au checkpoint-1. → **C-1** (texte, à l'insertion, coût nul) : redéfinir `null` = « aucune décision de sonde atteinte (l'appel payé reste dans `calls_by_method`) » dans l'ADR §3 ; item formé pour `:761` et la JSDoc `:214-220` au prochain toucher du fichier. **Pas de changement de code maintenant** (un octet invaliderait le G2 en cours et l'oracle rejoué).

**(b) Refus du marqueur d'époque dans `budget.json` : fondé, accepté.** L'invariant « pleine OU prouvée finale » tient dans les deux époques ; le seul lecteur (`:715`) ne lit qu'un booléen ; un champ sans consommateur = tuyau mort (règle Branchement). L'époque vit dans ANCHORS (I-SP-1).

**(c) CA-11** : voir checklist — règle branchée et prouvée par composition exécutée ; champ = provenance déclarée.

**(d) `DURABLE_FS`** : câblage **réel** — `appendDurable`/`writeDurable` sont les seules primitives d'écriture du module (grep : plus aucun `writeFileSync`/`appendFileSync` direct sur un chemin ; `writeFileSync` importé n'est utilisé que dans l'objet) ; le test (i) enveloppe l'objet exporté et traverse `runMain` jusqu'aux fichiers réels (chaîne re-dérivée, artefact complet) ; **M27** prouve la liaison production → `fs.fsyncSync` réel (EBADF) ; mutants d'ordre **M23/M25/M26 rouges** par le test désigné ; M28 (contournement) rouge. Lecteurs : `^ledger-.*\.jsonl$` et `endsWith(".json")` ne matchent pas un `.tmp` résiduel. Coût : non re-mesuré, non porteur. **R-C6-2** mal posé : l'INCIDENT §2 montre que l'orchestrateur lit `budget.json` PENDANT le tirage ; sous `rename`, un lecteur non-Node (PowerShell) peut provoquer un STOP fail-closed → **C-4**.

**(e) D-n** : frontière `mint_end-AAPLx` / avant `mint_start-NVDAx`, ligne ANCHORS « époque shortpage » = I-SP-1 (déclencheur `mint_start-NVDAx`, non due), compatibilité deux sens déclarée §5 (iii) — conformes. Mais **la D-n ne nomme pas l'arbre d'exécution** (l'époque retry avait « arbre d'exécution `b9b207b` », ANCHORS:45) ; je n'ai pas trouvé lequel exécute AAPLx. → **C-5** : écrire la condition sous les deux formes : arbre épinglé distinct ⇒ la fusion de branche est libre et le **déploiement** vers l'arbre est l'événement D-n ; `F:\Monark` HEAD = arbre d'exécution ⇒ la fusion elle-même attend `mint_end-AAPLx` ; l'orchestrateur désigne l'arbre dans la ligne I-SP-1. **Fait nouveau (post-coupure)** : `4699db9`/`15fb00a` posent `mint_resume-AAPLx-2` — r3 tourne une troisième fois sous l'ancien code sans fsync. Le motif de « jamais à un `mint_resume` » (processus en vol) ne tient pas à une reprise post-crash (aucun processus en vol) et §5 (iii) déclare format et compatibilité inchangés ; avancer C-6 à une reprise serait une **modification de la D-n = dérogation = décision investisseur**, pas la mienne.

**(f) Anti-close** : conforme (§3).

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée, sous réserve G2 PASS au G7)

- **C-1** (ADR §3 à l'insertion + item code) : sémantique de `null` = « aucune décision de sonde atteinte » ; `:761` et JSDoc `:214-220` au prochain toucher.
- **C-2** (à clore à l'insertion) : I-SP-4 périmé — les chiffres C-6 sont en dépôt deux fois (`INCIDENT-powercut-2026-09-22.md` §1, `CHANTIERS.md:865`) ; §4 les cite, sans duplication.
- **C-3** (à clore à l'insertion) : I-SP-5 périmé — `docs/CHECKPOINT1-lot-bell-shortpage-1.md` tracké depuis `c17cdc8`.
- **C-4** (runbook, non bloquant code) : ligne dans `docs/course-bell/` — pendant un tirage, lire `budget.json`/ledgers/artefacts avec Node ou Git-Bash seulement ; déclencheur = avant le premier tirage sous le nouveau code, pas « première occurrence ».
- **C-5** (ADR §5) : condition d'arbre d'exécution sous ses deux formes ; arbre désigné dans la ligne I-SP-1.
- **ESCALADE-INVESTISSEUR (non bloquante, pré-cadrée)** : « Après deux coupures et deux pertes de ~600 pages en une soirée, la durabilité C-6 doit-elle attendre `mint_end-AAPLx` (D-n déclarée, motif : processus en vol) ou peut-elle être déployée à la **prochaine reprise post-crash** d'AAPLx (aucun processus en vol ; format et compatibilité deux sens inchangés §5 (iii) ; fusion à blanc et oracle fusionné verts) ? » Le lot est accepté à la frontière déclarée quelle que soit la réponse.
- Divergence G7/checklist ou refus contesté deux fois ⇒ escalade.

**AM-1 — attrapé** : auto-contradiction de l'ADR sur `null` (et commentaire `:761`), deux items formés déjà périmés, déclencheur R-C6-2 mal posé face à la pratique de supervision mesurée, absence de l'arbre d'exécution dans la D-n.

## 6. Preuve d'innocuité (AM-2 / AM-2 ter)

Rejeux sous `F:\tmp\cp2-bellsp1\{tree, tree-mut, mut, logs}` uniquement. `F:\Monark` : `git status` 0 avant et après (HEAD a avancé par commits de l'orchestrateur `e3884ae`→`15fb00a`, pas par moi), `rebase-crosscheck.ts` `6a2b96ef…` / test `fdb5aa92…` avant = après, aucun NUL post-coupure ; `F:\Monark-wt-bellsp1` `e5dfbb4`, status 0, `d50901b7…` / `f32de2bd…` intacts ; `F:\tmp\bellsp1\` non touché (mon `OUT` = `cp2-bellsp1/mut`, `golden/` du worker daté 22:23 antérieur). Aucun `git` d'écriture dans le dépôt, aucune installation, aucun réseau, aucun appel Helius.

Fichiers de preuve : `F:\tmp\cp2-bellsp1\logs\{header,exits,test,merged-test,merge,postcut-lotfile.tap}`, `F:\tmp\cp2-bellsp1\mut\mutants.log`, `F:\tmp\cp2-bellsp1\mutants.mjs`, `F:\tmp\cp2-bellsp1\oracle.sh`.

Modèle résolu : claude-fable-5-1
