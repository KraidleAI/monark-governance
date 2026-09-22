# Checkpoint-2 (+cp-1 implicite) BELL-RETRY-1 (validateur-humain) — ACCEPTE-AVEC-CORRECTIONS

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (+ checkpoint-1 implicite) — Lot BELL-RETRY-1 (`lot/bell-retry-1` @ `d0584fa`)

## 1. Checkpoint et artefacts lus

- Checkpoint : **LIVRABLE** (CA-6..CA-11) **et plan implicite** (CA-1..CA-5 sur `MISSION-G1.md`, décision 130 : pas de checkpoint-1 séparé, lot correctif de course).
- Artefacts lus (jamais le fil de travail du worker) : `F:\tmp\bellretry1\MISSION-G2-CP2.md`, `MISSION-G1.md`, `G1.md`, `DELIVERED.sha256`, `mutants.mjs`, `ADR-amendement.md` ; dépôt : `docs/CHANTIERS.md:748-760` (décisions 131/132, STOP 14:21 et 14:45), `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md:320` (clause 2b verbatim), `docs/course-bell/ANCHORS.md`, `F:\course-bell\go1\anchor.sh`.
- Rejeu (AM-2 ter) : clones `git clone --no-hardlinks --branch lot/bell-retry-1` sous `F:\tmp\cp2-bellretry1\tree` (oracle) et `F:\tmp\cp2-bellretry1\tree-mut` (mutants), `node_modules` par jonctions (`mk-nm.ps1`, 220 entrées, 10 @monark, 0 fail, `@monark/rpc-guard` résolu SOUS le clone) ; `TEMP/TMP/TMPDIR=F:/tmp` ; les 8 clés payantes présentes dans l'environnement ont été RETIRÉES (`env -u`) de chaque exécution (A-7, présence contrôlée, jamais affichée). Logs : `F:\tmp\cp2-bellretry1\v-*.log`, `my-mutants.mjs`.
- `F:\tmp\g2-bellretry1\G2.md` : **absent** au moment de mon rejeu (le G2 tourne en parallèle) — je n'ai lu aucun chiffre G2 ; tout ci-dessous est re-exécuté.

## 2. Vérifications demandées (1)-(8), re-exécutées

| # | Demande | Résultat mesuré |
|---|---|---|
| (1) | diff = `quorum.ts` + 2 tests, rpc-guard intouché, 9 gelés | `git diff --stat 1f4b746 d0584fa` : 3 fichiers, +139/−4 = **143** (pathspec `ci.yml:65`, docs exclus ; merge-base avec `lot/etude-suite` = `1f4b746`, donc le diff trois-points CI donne le même chiffre). `git diff 1f4b746 HEAD -- packages/rpc-guard/src/` = **vide**. DELIVERED.sha256 = shas du clone (`5871b4b6…`, `299e36a0…`, `fdb5aa92…`) **3/3 égaux**. Gel U-4b : 8 fichiers actifs + labeler + ADR-U4b : `git show 1f4b746:` == `git show HEAD:` sur les 10 (`2f9a31f6`, `a5e66cd3`, `5733daeb`, `7bee76fc`, `3376eb08`, `9206df91`, `0e232519`, `3603265d`, `cb020425`, `2551f3e6`) et = ADR §3 (lignes 394-399). |
| (2) | prédicat `isTransient` | Lu à la source : `if (n === "NonJsonBody") return e.code !== undefined && (e.code === 200 \|\| e.code === 429 \|\| e.code >= 500);` avant l'arm HttpError ; `BudgetExceededError` re-jeté avant `isTransient` (`withRetry` inchangé) ; borne défaut 4 / `RETRY_TRIES = 6` (`rebase-crosscheck.ts:626`), backoff `400*(i+1)` inchangés. Fait de transport confirmé [lu] `transport.ts:228-241` : un `NonJsonBody` n'est atteignable que sur `res.ok` (2xx) ; arms 429/5xx défensives. |
| (3) | A-8 intégration réelle | Rejouée : `bell_crosscheck_guarded_nonjsonbody_200_gateway_html_is_retried_and_metered` **pass en 457 ms** (= un backoff réel de 400 ms : le retry a bien eu lieu). Mutant « NonJsonBody retiré » rejoué à la main sur `tree-mut` : `runMain` **rejette** avec `NonJsonBody: rpc-guard: NonJsonBody for operator 'helius' (code 200)` — la classe exacte du STOP TSLAx. Vrai `openGuardedClient`, seul `globalThis.fetch` bouchonné, sortie lue depuis les artefacts réels (`crosscheck-SPYx.json`, `budget.json`). |
| (4) | 9 mutants + ≥ 3 à moi | `my-mutants.mjs` (14 mutants, restauration sha-exacte, golden `5871b4b6…`) : **M1..M8 + M1b : 9/9 ROUGES** ; miens : V1 `return true` rouge, V2 garde `isTransient` retirée de `withRetry` rouge, V3 branche `statusOf` réordonnée après la branche générique rouge, V5 `onRetry` jamais tiré (intégration, `retries_by_method`) rouge, **V4 `=== 200` élargi à `[200,300)` : SURVIT** (attendu : c'est la borne R-BR1, non épinglée par un test — voir C-2). 14/14 restaurés, arbres `git status` vides. |
| (5) | `statusOf` et consommateurs | `non-json <code>` en place. Grep `apps/ packages/ scripts/` (hors tests) : « HTTP 200 » n'apparaît qu'en commentaires ; unique consommateur filtrant un jeton : `universe-cli.ts:258` (`"HTTP 429"`) — non affecté (un 429 est un `HttpError`). Le fallback regex `quorum.ts:142` ne s'applique qu'aux erreurs non-package. Aucun schéma JSON ne contraint `faults[].status`. **Pur re-libellé de journal.** |
| (6) | oracle + fusion à blanc | Re-exécuté : `gate:vocab`/`typecheck`/`lint`/`lint:ratchet`/`lang:gate`/`export:check` **exit 0** ; `test` exit 0, **872 / 871 / 0 / 1** ; le skip = `u4b_labels_replay_via_main_real_artifact` (artefacts e2 gitignored, pré-existant, fichier non touché). Fusion à blanc : `git merge-tree --write-tree origin/lot/etude-suite HEAD` (lecture seule) ⇒ **exit 0, aucun conflit**, arbre fusionné = etude-suite + les 3 fichiers ; `lot/etude-suite` a avancé (`bdb4478` → `f2a275b`, **docs seulement** sur `apps/packages/scripts` depuis la base). |
| (7) | R-BR1 / R-BR2 | Jugés en §4 (C-2, C-3). |
| (8) | Amendement ADR | Lu ; cite correctement la ligne 320 (vérifiée verbatim) ; déclare tuyaux, bornes, résidus ; statut PROPOSÉ hors dépôt — voir C-1. |

Anti-close (lots Bell) : census des littéraux des lignes ajoutées = codes HTTP, compteurs, numéros de ligne, `2.0` (jsonrpc) — **aucune forme de close** ; 0 octet non-ASCII ajouté.

## 3. Checklist

**Plan implicite (MISSION-G1)**
- **CA-1** conforme : chaque livrable est falsifiable (prédicat par code, libellé, tests nommés, mutants ≥ 6, oracle 0 fail, gel 9 sha, R-25). Reformulation en une phrase : « rendre `NonJsonBody@200` réessayable côté Bell sans toucher au transport, et prouver sur le chemin servi que le STOP TSLAx ne se reproduit pas ».
- **CA-2** conforme : la décision de valeur (réviser la clause 2b « JAMAIS NonJsonBody ») est portée par la décision investisseur 131 (item formé BELL-RETRY-1). Le **moment de fusion** est traité en §4 (D-n).
- **CA-3** correction (C-1) : l'ADR de rattachement n'existe qu'en proposition hors dépôt.
- **CA-4** conforme/n-a : mono-worker + G2 + checkpoint-2 en instances séparées, aucun fan-out d'exécution.
- **CA-5** correction mineure : la mission ne nomme aucun mode MAST ; celui qui s'applique (« vérification incorrecte » : tests verts sans reproduction du STOP) est de fait contré par A-8 + M1b — à nommer au pli, non bloquant.

**Livrable**
- **CA-6** conforme : oracle re-exécuté par moi (§2 (6)) ET revue G2 en cours (instance séparée) — l'acceptation reste conditionnée à la remise du G2.
- **CA-7** corrections : R-BR1 et R-BR2 sont formés avec déclencheur, mais (C-2) la propriété « 2xx≠200 reste fatal » n'est pinée par aucun test (V4 survit) ; (C-3) le déclencheur de R-BR2 accepte un STOP connu sur une course payante.
- **CA-8** conforme : `claude-opus-4-8[1m]` (R-1), `error_origin: plan` renseigné, générateur ≠ relecteur ≠ validateur, DELIVERED.sha256 concordant.
- **CA-9** conforme : indépendance imposée par le système — clone frais, oracle et 14 mutants rejoués ici, aucun chiffre G2 lu.
- **CA-10** conforme : 143 lignes, lot unitaire ; aucun argument de vitesse.
- **CA-11 (durci)** conforme : `isTransient` → `withRetry` → `scanFullMint` (`rebase-crosscheck.ts:672`, CLI `--rebase-crosscheck` servie) ; le test d'intégration exécute la composition depuis l'entrée réelle (réponse HTTP → transport réel → `budget.json`/`crosscheck-*.json` relus) ; V5 prouve que `retries_by_method` est bien le fil consommé.
- **Anti-close** conforme (§2).

## 4. Risque de fusion à une frontière de mint (D-n) et R-BR1/R-BR2

**Fusion entre deux mints — avis** : aucun risque bloquant, quatre points à consigner.
1. **Ledger / reprise** : chaque retry = un `client.call` = une ligne write-ahead + crédits métrés ; format du ledger inchangé (`rpc-guard` intouché) ; chemin de reprise non touché (test `…resume_without_loss…` vert dans les 872).
2. **Crédits** : un retry sur `NonJsonBody` coûte une gTfA supplémentaire (bornée ×6/page) ; les sous-plafonds enshrined (`--max-credits`) tiennent, `BudgetExceededError` jamais retenté ; `--max-pages = sous-plafond/10` suppose 1 appel/page ⇒ un STOP budget peut précéder max-pages (fail-closed, acceptable). La bande ±30 % lit `N_exact/N_projeté` (pages/tx), **non affectée**.
3. **Comparabilité `retries_by_method`** (compteur conjoint, même `--out`) : avant la fusion, une re-lecture après `NonJsonBody` passait par une REPRISE (non métrée comme retry) ; après, elle est métrée. Le compteur change de sémantique à la frontière ⇒ la ligne ANCHORS `mint_end`/`mint_start` doit porter « époque retry : BELL-RETRY-1 fusionnée, `quorum.ts` `5871b4b6…` » et l'arbre qui exécute le tirage doit être vérifié à ce sha avant `mint_start` (le manifeste d'ancre ne pin pas le code, seul le commit d'ancre le fait implicitement).
4. **Journal** : deux libellés pour la même classe dans le cycle (`FATAL HTTP 200` sur TSLAx, `non-json 200` ensuite) — une ligne CHANTIERS suffit ; aucun consommateur code.
Par ailleurs : la décision 131 fixe le déclencheur « clôture du cycle OU 3e occurrence » et n'admet un changement d'outil intra-cycle qu'**à une frontière avec ancre** ; fusionner après 2 occurrences à une frontière ancrée respecte la lettre de la parenthèse mais dévie du ruling 132 (« fusion APRÈS la clôture du cycle ») ⇒ **D-n à consigner** (C-4). Si l'orchestrateur ne dispose pas d'une ligne investisseur couvrant ce choix, c'est une question d'une ligne à poser à la prochaine lecture de frontière — pas une escalade de ma part, le cadre investisseur (131) l'admet.

**R-BR1** : garder le prédicat littéral (200) est le sens fail-closed ; mais l'assertion « 201–299 reste fatal » n'est pas pinée (V4 survit) ⇒ C-2.
**R-BR2** : `record.ts:322-323/345` confirmés [lu] — même prédicat sans `NonJsonBody`. **Hors de ce lot** (isolation d'un lot fusionné dans un tirage vivant, R-25, `apps/sentinel` non touché) ; **mais** le déclencheur « 1re occurrence sur une course Ukemi » = accepter un STOP connu sur une course payante ⇒ C-3 : lot séparé calque (UKEMI-RETRY-1, `record.ts` hors gel, `rpc.ts` gelé intouché) **précondition du départ de la course Ukemi**, pas un déclencheur d'incident.

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée), conditionnée à un G2 PASS/PASS-AVEC-CORRECTIONS concordant

- **C-1 (bloquant avant fusion)** : folder `ADR-amendement.md` dans `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (amendement daté révisant la clause ligne 320) dans le même commit/fusion — un ADR « proposé » sous `F:\tmp` n'est pas un rattachement (CA-3).
- **C-2 (au pli, test seul)** : ajouter au moins un vecteur 2xx≠200 (ex. 204) à la matrice `bell_retry_nonjson_transient_matrix_…` asserté fatal (n=1) pour pinner R-BR1 ; ré-enregistrer le sha du test.
- **C-3 (item reformé)** : R-BR2 → déclencheur « AVANT le premier tirage Ukemi payant » (précondition de course), propriétaire orchestrateur ; pas « 1re occurrence ».
- **C-4 (consigne)** : D-n de fusion intra-cycle consigné dans CHANTIERS avec les 4 points du §4, ligne ANCHORS portant le sha `quorum.ts` et l'époque retry, vérification du sha de l'arbre d'exécution avant `mint_start`.
- **C-5 (au pli, doc)** : nommer le mode MAST contré (CA-5) dans le rapport de passe.
- Divergence G7/checklist ou refus contesté ⇒ ESCALADE-INVESTISSEUR ; aucune question investisseur nouvelle à ce stade.

**AM-1 — ce que la checklist a attrapé** : le survivant V4 (borne R-BR1 non testée), le déclencheur R-BR2 qui planifiait un STOP payant, l'ADR non folded, et la sémantique du compteur `retries_by_method` à la frontière de fusion.

## 6. Preuve d'innocuité (AM-2 bis/ter)

- `F:\Monark` AVANT : HEAD `bdb4478`, `lot/bell-retry-1` `d0584fa`, `quorum.ts` `f5b37cd4…`, `rebase-crosscheck.test.ts` `b7ac7f5b…`, `git status` = `?? docs/token/SOURCES-coingecko.md`. APRÈS : `lot/bell-retry-1` `d0584fa` (idem), mêmes shas de fichiers, même `git status` ; **HEAD `f2a275b`** — avancé par un commit de l'orchestrateur (« G2 U-4b-1b-2 … ») pendant ma session, **pas par moi** (aucune commande `git` d'écriture émise). Worktree `F:\Monark-wt-bellretry1` : `d0584fa`, status vide. Clones `tree`/`tree-mut` : status vide, golden restauré 14/14. Aucune écriture hors `F:\tmp\cp2-bellretry1\`.

Modèle résolu : claude-fable-5-1
