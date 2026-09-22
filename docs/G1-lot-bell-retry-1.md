# G1 BELL-RETRY-1 (worker Opus 4.8)

All deliverables durable and verified: git status shows exactly my 3 files, 0 non-ASCII in additions, DELIVERED.sha256 checks OK, all rendu artifacts present. All advisor fixes applied and empirically confirmed. Here is the integral rendu.

---

Modèle résolu : claude-opus-4-8[1m]

# G1 — Lot BELL-RETRY-1 : `NonJsonBody` (HTTP 200 + corps non-JSON) devient TRANSITOIRE (retry borné)

- **Worker** : `claude-opus-4-8[1m]`, effort max (R-1, préfixe `claude-opus-4-8` ; Opus 5 banni). **Aucun commit** (R-20). Écrit pour vérification adversariale (R-21).
- **Worktree** : `F:\Monark-wt-bellretry1`, branche `lot/bell-retry-1`, base `lot/etude-suite` @ `1f4b746` (la base avait avancé au-delà du snapshot `d1e3547` du statut initial ; branché sur le tip courant, vérifié). `node_modules` isolé via `mk-nm.ps1 -Tree F:\Monark-wt-bellretry1` (path littéral) ⇒ 220 entries, 10 @monark, 0 fail ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-bellretry1\packages\rpc-guard\src\index.ts` (sous le worktree). **Fusion différée après le cycle de tirage (D-n)** — rien d'autre touché.
- **Déclencheur** (`docs/CHANTIERS.md:748`, journal 14:21 UTC) : TSLAx STOP fail-closed après 201 pages sur `FATAL HTTP 200` = `TransportError NonJsonBody` (corps non-JSON sur une 200 Helius) ; `isTransient` ne le classait pas transitoire ⇒ `withRetry` rejetait immédiatement. `error_origin` : plan.

## 1. Code livré — `apps/bell/src/quorum.ts` SEUL ; `packages/rpc-guard/src/**` INTOUCHÉ

Fait de transport [lu] : `raise(op,"NonJsonBody",res.status,text)` (`transport.ts:241`) ⇒ `TransportError` `.name="NonJsonBody"`, `.code=res.status` (`errors.ts:38`, `transport.ts:193`). Un `NonJsonBody` n'est atteignable que sur un **2xx** : `!res.ok` part en `HttpError` (`:229`), un 3xx en `RedirectBlocked` (`:228`), AVANT le `JSON.parse` (`:241`). Cas réel = page HTML de passerelle à HTTP 200.

**(1) `isTransient`** (une ligne, placée avant l'arm `HttpError`) :
```
if (n === "NonJsonBody") return e.code !== undefined && (e.code === 200 || e.code === 429 || e.code >= 500);
```
transitoire ssi `code ∈ {200,429} ∪ [500,∞)` ; 4xx≠429 reste fatal. Arms 429/5xx défensives (via ce transport le code est toujours 2xx), arm 200 = le cas réel. Doc-comment mise à jour (ASCII).

**(2) `statusOf`** (une ligne, avant la branche générique `.code`) :
```
if (e.name === "NonJsonBody") return "non-json " + String(e.code ?? "?");
```
⇒ `non-json 200`, plus jamais `HTTP 200` (qui masquait la classe). Commentaire stale « … NonJsonBody: no mappable HTTP code » corrigé.

`withRetry` (borne appelant : défaut 4 ; `RETRY_TRIES=6` pour le cross-check) et le backoff `400·(i+1) ms` **inchangés**.

**Consommateurs du jeton `statusOf` (grep déclaré)** : le seul consommateur filtrant sur un préfixe HTTP est `universe-cli.ts:258` (`f.status === "HTTP 429"`) — NON affecté : un `NonJsonBody` ne porte jamais 429 via ce transport, et `"HTTP 200"`→`"non-json 200"` n'est ni l'un ni l'autre. Aucune logique aval ne dépend de l'ancien libellé (les `rb.status` de `collect.ts` sont le statut de REBASE, sans rapport) ⇒ pur RE-LIBELLÉ de journal.

## 2. Tests

- **A-8 intégration réelle** — `rebase-crosscheck.test.ts` (append) : `bell_crosscheck_guarded_nonjsonbody_200_gateway_html_is_retried_and_metered`. `runMain --rebase-crosscheck` via le **vrai `openGuardedClient`**, **seul `globalThis.fetch` bouchonné** (D-3) : la 1ʳᵉ gTfA asc renvoie une page HTML de passerelle REPRÉSENTATIVE (502, style Cloudflare) à HTTP 200 ⇒ transport lève `NonJsonBody@200` ⇒ retry borné (RETRY_TRIES=6, backoff réel) re-fetche (JSON) ⇒ **verdict `equal`** + `budget.json.retries_by_method.getTransactionsForAddress >= 1` (le champ qui valait 0 à TSLAx). Reproduction exacte du STOP TSLAx et sa correction (avant le fix : `scanFullMint` jette, `runMain` REJETTE — `rebase-crosscheck.ts:685-704` a un `finally` sans `catch`). **Portée A-8 honnête** : le corps EXACT du STOP TSLAx n'est pas enregistré (C-2 : `detailOf`→`""` pour NonJsonBody) ; tout corps non-JSON suit le même chemin, seul `JSON.parse` décide.
- **Unités** — `apps/bell/test/bell-retry-nonjson.test.ts` (nouveau, 4 tests ; `TransportError` construit comme le transport le lève) : (1) retry pris + métré via `onRetry` (calque `rebase-crosscheck.ts:672`) puis succès, valeur résolue assertée ; (2) matrice {200,429,502,503,504} transitoires / {400,404} fatals ; (3) épuisement tries=4 ⇒ re-jette le MÊME `NonJsonBody` (nom+code 200), onRetry=3, attempts=4 ; (4) `statusOf` `non-json 200`/`non-json 503`, jamais `HTTP 200`, un `HttpError` reste `HTTP 503`.

## 3. Mutants (`F:\tmp\bellretry1\mutants.mjs`) — 9 mutants, TOUS ROUGES, TOUS RESTAURÉS

Mutation source transitoire de `quorum.ts` + test nommé + restauration byte-exacte par sha (R-20) ; chaque test lancé avec les 8 clés payantes retirées (A-7). `golden quorum.ts = 5871b4b6…` ; `ALL_RED=true ALL_RESTORED=true`, exit 0.

| # | mutant | test rougi |
|---|---|---|
| M1 | `NonJsonBody` retiré du prédicat (`->false`) | retry_200_metered (unité) |
| M1b | idem (le STOP TSLAx exact) | crosscheck garanti (verdict/rejet) |
| M2 | 4xx admis (`>=500 -> >=400`) | matrice (400 réessayé) |
| M3 | 200 retiré | matrice (200 fatal) |
| M4 | 5xx retiré | matrice (503 fatal) |
| M5 | `statusOf` ancien libellé (`HTTP 200`) | statusof |
| M6 | `onRetry` sur tentative finale | exhaustion (onRetry 4) |
| M7 | retry non borné (`tries+100`) | exhaustion (attempts 104) |
| M8 | épuisement jette un `Error` générique | exhaustion (nom) |

## 4. Oracle complet (A-3, exits capturés directement, env `-u` des 8 clés payantes)

| gate | exit | | gate | exit |
|---|---|---|---|---|
| `gate:vocab` | 0 | | `lint:ratchet` | 0 |
| `typecheck` | 0 | | `lang:gate` | 0 |
| `lint` | 0 | | `export:check` | 0 |
| `test` | 0 | **872 / 871 pass / 0 fail / 1 skip** (voir §7) | | |

## 5. R-25 (pathspec `ci.yml:65` VERBATIM, docs exclus)

`3 files changed, 139 insertions(+), 4 deletions(-)` = **143** < 300 (attendu) ≪ 1150. Fichiers : `M quorum.ts`, `A bell-retry-nonjson.test.ts`, `M rebase-crosscheck.test.ts`. `packages/rpc-guard/src/**` non listé (INTOUCHÉ). **NOTE outillage** : le fichier neuf est non-suivi ⇒ invisible à `git diff` sans `git add -N`. Mesuré ICI avec `git add -N` = 143 ; SANS = **62** (58+/4−) — l'orchestrateur qui ré-mesure doit `git add -N` le fichier neuf (ou ajouter ses 81 lignes).

## 6. Gel U-4b (A-6) — 9/9 byte-identiques AVANT (HEAD LF) == APRÈS (worktree LF)

| # | fichier | LF sha AVANT==APRÈS | vs ADR §3 |
|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df0527` | = |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f46` | = |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40a` | = |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23` | = |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb2` | = |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6` | = |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43` | = |
| 8 | `packages/contracts/src/calib-digest.ts` | `3603265d0a1f1a4e` | = |
| — | `scripts/census/u3-realized.mjs` (labeler, gel déféré) | `cb0204250cce05f4` | re-gelé `cb020425` par U-4b-1b-1 (`298e04a`), supersède la valeur base-`f26693f` `755b3a38` de l'ADR §3 |

`ADR-U4b-calibration-episode-frais.md` intact (`2551f3e6…`). Aucun fichier gelé dans mon diff. Pas de STOP : les 8 du gel ACTIF sont intacts et canoniques ; le labeler (déféré) est byte-identique pour ce lot.

## 7. Déviations / items formés (D-n, zéro dette nue)

- **1 skip pré-existant** : `u4b_labels_replay_via_main_real_artifact` (`test/u3-realized-param.test.ts:238`) — skip CONDITIONNEL `{ skip: reason }` gaté sur des artefacts e2 réels HORS dépôt (gitignored). Fichier NON touché. La branche le porte déjà (`298e04a` « 822/821/0/1 », `2cbdea2` « 816/815/0/1 » — le `1` = ce skip). Mécanisme : artefact gitignored ⇒ absent de tout worktree frais, mais PEUT être présent dans `F:\Monark` ⇒ une ré-mesure depuis l'arbre principal pourrait voir 0 skip (à ne pas lire comme un écart de ce lot). Indisponibilité data, pas défaut code.
- **R-BR1 — `NonJsonBody` sur 201–299 reste fatal** : choix littéral de la mission. Non atteignable en pratique (page passerelle = 200). *Déclencheur* : 1ʳᵉ occurrence sur un 2xx≠200 OU décision d'élargir à `[200,300)`. Propriétaire : orchestrateur.
- **R-BR2 — classifieur SYMÉTRIQUE Ukemi non aligné** : `apps/sentinel/src/ukemi/record.ts:345` porte le même prédicat SANS la clause `NonJsonBody` (`record.ts:322-323` l'exclut explicitement). Une course Ukemi heurtant un `NonJsonBody@200` STOPperait à l'identique. HORS périmètre (Bell-scoped). *Déclencheur* : prochain lot touchant `record.ts` OU 1ʳᵉ occurrence sur une course Ukemi (alors STOP + lot immédiat). Propriétaire : orchestrateur. `error_origin` : plan.
- **Amendement ADR PROPOSÉ** : `F:\tmp\bellretry1\ADR-amendement.md` (cible `ADR-GARDE-HELIUS` ; révise la clause 2b « JAMAIS NonJsonBody » ; ne touche AUCUN fichier du dépôt — à folder par l'orchestrateur au G7).

## 8. Consigne standard G1 — point par point

- **A-1** FAIT (modèle résolu, préfixe `claude-opus-4-8`). **A-2** FAIT (mk-nm 220/10/0, require.resolve sous worktree ; retrait par rm-nm). **A-3** FAIT (exits directs, oracle complet §4). **A-4** FAIT (DELIVERED.sha256 chemins relatifs 3 fichiers ; rendu sous `F:\tmp\bellretry1` ; aucun commit ; rien sur `C:` ; aucun réseau — seul `globalThis.fetch` bouchonné, hôtes `.invalid`, `env -u`). **A-5** FAIT (R-25 143 < 300). **A-6** FAIT (9/9 gel byte-identiques + ADR-U4b intact ; pas de STOP).
- **A-7** FAIT (aucune variable affichée ; oracle ET mutants sous `env -u` des 8 clés). **A-8** FAIT (corps HTML de passerelle 502 @200 via le vrai transport ⇒ `NonJsonBody@200` ; corps exact non enregistré C-2, chemin identique tout corps non-JSON). **A-9** N-A (aucune phrase publique servie ; jeton de journal fermé `"non-json <status>"`). **A-10** FAIT-adapté (surfaces servies : jeton `journal.faults[].status` — M5 préserve la lecture `.code`, altère la sortie `HTTP 200` ⇒ rouge ; comportement retry servi verdict `equal`+`retries_by_method` — M1/M1b préservent l'erreur, altèrent la sortie STOP ⇒ rouge sur l'artefact réel `runMain`→`crosscheck-SPYx.json`/`budget.json`).
- **B-1..B-6** N-A/FAIT (aucun corps payant en clair ; le jeton ne porte que le code ; `NonJsonBody` a `detail=""` inchangé ; **B-4** `isTransient`/`statusOf` lisent `.name`/`.code`/`instanceof` seulement). **C-1** FAIT (une classe canonique, `instanceof`, aucune classe locale). **C-2** FAIT (`BudgetExceededError` jamais réessayé, inchangé). **C-3** FAIT (une couche de retry, inchangée ; 403/3xx/4xx≠429 fatals).
- **D-1** FAIT (chaque test imposé → mutant nommé ROUGE, restauration sha-exacte). **D-2** FAIT (vecteurs non vides, listes fermées, valeurs recomputées). **D-3** FAIT (intégration bout-en-bout, seul `globalThis.fetch` bouchonné). **D-4** FAIT (aucune assertion affaiblie ; aucun test existant modifié, seul append). **E-1/E-2** N-A (aucun verrou/état modifié). **E-3** FAIT (backoff + bornes à l'ADR).
- **F-1** FAIT (Tuyaux à l'ADR ; aucun renvoi `F:\tmp` dans les sources ; R-BR1/R-BR2 à déclencheur). **F-2** FAIT (ajouts 100 % ASCII, vérifié `git diff | grep -P '^\+.*[^\x00-\x7F]'` = 0 ; em dashes des commentaires ajoutés → `--`). **F-3** FAIT (déviations §7 déclarées).

## 9. Fichiers

- Code : `F:\Monark-wt-bellretry1\apps\bell\src\quorum.ts` (sha `5871b4b6…`)
- Tests : `F:\Monark-wt-bellretry1\apps\bell\test\bell-retry-nonjson.test.ts` (nouveau) ; `F:\Monark-wt-bellretry1\apps\bell\test\rebase-crosscheck.test.ts` (append)
- Rendu : `F:\tmp\bellretry1\G1.md`, `F:\tmp\bellretry1\DELIVERED.sha256`, `F:\tmp\bellretry1\mutants.mjs`, `F:\tmp\bellretry1\ADR-amendement.md`
