# G1 UKEMI-RETRY-1 (worker Opus 4.8)

All final: DELIVERED.sha256 regenerated and repo deliverables verify OK; git status is exactly the 3 intended tracked files (no untracked, `rpc.ts` and the 8 other frozen sha untouched). Everything durable. The integral rendu follows (it is also persisted at `F:\tmp\ukemiretry1\G1.md`, consumed by the orchestrator via `DELIVERED.sha256`).

---

Modèle résolu : claude-opus-4-8[1m]

# G1 — Lot UKEMI-RETRY-1 : `NonJsonBody@200` devient TRANSITOIRE dans le recorder Ukemi (calque BELL-RETRY-1, R-BR2) — PRÉCONDITION du départ de la course U-4b

- **Worker** : `claude-opus-4-8[1m]`, effort max (R-1, préfixe `claude-opus-4-8` vérifié ; Opus 5 banni). **Aucun commit / aucun workflow** (R-20). Écrit pour vérification adversariale (R-21).
- **Worktree** : `F:\Monark-wt-ukemiretry1`, branche `lot/ukemi-retry-1`, base `lot/etude-suite` @ `831a87b` (la base avait avancé au-delà du snapshot `855073e` du statut initial ; branché sur le tip courant, vérifié). `node_modules` isolé via `mk-nm.ps1 -Tree F:\Monark-wt-ukemiretry1` ⇒ **220 entries, 10 @monark, 0 fail** ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-ukemiretry1\packages\rpc-guard\src\index.ts` (SOUS le worktree). TEMP/TMP/TMPDIR = `F:/tmp`.
- **Déclencheur** (R-BR2 ; BELL-RETRY-1 checkpoint-2 §4 + ruling orchestrateur 2026-09-22 15:42 UTC C-3, `docs/CHANTIERS.md:764`) : le recorder `apps/sentinel/src/ukemi/record.ts:322-345` portait le MÊME prédicat de retry que Bell **sans** la clause `NonJsonBody` (`:322-323` l'excluait explicitement). `error_origin` : plan.
- **Couche de retry propre : PRÉSENTE (lu avant d'écrire, exigence mission).** `record.ts:327-356` (shim `call`) EST une couche de retry appelant bornée et métrée : boucle `for(attempt)` + `if (transient && attempt < args.retries)` + backoff `min(backoffMs*2**attempt, backoffCapMs)` ; R retries ⇒ R+1 `c.call` ⇒ R+1 lignes write-ahead ledger + R+1 tally. **Aucun `withRetry` ajouté** (inutile ; pas un contournement).

## 1. Code livré — `apps/sentinel/src/ukemi/record.ts` SEUL (hors gel) ; `rpc.ts` + 8 sha gelés INTOUCHÉS

Fait de transport [lu] `packages/rpc-guard/src/transport.ts:241` : `raise(op,"NonJsonBody",res.status,text)` ⇒ `TransportError` `.name="NonJsonBody"`, `.code=res.status`, `.detail=""` (`:175`). **Atteignable seulement sur un 2xx** : `:229` `!res.ok`→HttpError, `:228` 3xx→RedirectBlocked, AVANT `JSON.parse`. Cas réel = page HTML de passerelle à HTTP 200. Vérifié empiriquement (node) : `Response(null,{status:204}).text()===""` ⇒ `JSON.parse` jette ⇒ `NonJsonBody@204` ; `Response("<html>",{status:201})` ⇒ `NonJsonBody@201`.

Trois éditions, **calque exact de BELL-RETRY-1** (`apps/bell/src/quorum.ts` `isTransient`/`statusOf`) :

**(1) Prédicat `transient`** (shim `call`) — ajout d'une disjonction (calque `isTransient`) :
`|| (e.name === "NonJsonBody" && e.code !== undefined && (e.code === 200 || e.code === 429 || e.code >= 500))`
⇒ transitoire ssi `code in {200,429} ∪ [500,∞)`. **2xx≠200 (201/204) et 4xx≠429 (400/404) restent FATALS.** Les bras 429/≥500 sont **DÉFENSIFS** (via ce transport un `NonJsonBody` ne porte qu'un 2xx — R-U-3 formé).

**(2) Libellé de diag** (`rpc_errors` push, bras avant le générique) — calque `statusOf` :
`: e.name === "NonJsonBody" ? { provider: op, method, message: "non-json " + String(e.code ?? "?") }`
⇒ `non-json 200`, plus jamais le `NonJsonBody` nu. **Message SEUL** — pas de champ `http` : `RpcErrorRecord` (record.ts:36-40) réserve `http` à une réponse **non-2xx**, et un `NonJsonBody` est un 2xx.

**(3) Commentaire `:321-327`/`:348-352`** mis à jour (il excluait `NonJsonBody`) ; formulation du STOP **honnête** (cf. §9). 100 % ASCII.

`rpc.ts` (gelé `0e232519…`) et `packages/rpc-guard/src/**` **INTOUCHÉS** (je ne lis que `.name`/`.code`).

## 2. Tests — `apps/sentinel/test/ukemi-guard-record.test.ts` (intégration réelle : VRAI `openGuardedClient`, SEUL `globalThis.fetch` bouchonné, A-8)

- **A-8 chemin servi (nouveau)** `ukemi_record_nonjsonbody_200_gateway_html_is_retried_and_metered` : passe de compte complète (`mevblocker.io,chainstack`), 1re réponse chainstack = **page HTML de passerelle 502 à HTTP 200** ⇒ `NonJsonBody@200` ⇒ retry borné ⇒ 2e = fixture ⇒ **la course CONTINUE**, `book_digest` = PIN `034fbff9…`, `rpc_errors` = **un** `{provider:chainstack, method:eth_getBlockByNumber, message:"non-json 200", http:undefined, code:undefined}`, chainstack fetché ≥ 2×.
- **Matrice de prédicat (nouveau)** `ukemi_record_nonjsonbody_transient_matrix` : chainstack renvoie PERSISTAMMENT le vecteur, `--retries 3` ⇒ **200 → 4 fetches (transitoire, épuisé)** ; **201, 204 (corps vide), 400, 404 → 1 fetch chacun (FATALS)**. 201/204 = `NonJsonBody` 2xx≠200 ; 400/404 = `HttpError` 4xx≠429. **R-BR1 (analogue) PINNÉ** — plus fort que Bell (V4 survivait chez lui).
- **Épuisement borné + journal (nouveau)** `ukemi_record_nonjsonbody_200_exhausts_bounded_and_journals` : `NonJsonBody@200` persistant, `--retries 2` ⇒ **exactement 3 fetches, 3 lignes write-ahead ledger** ; puis bench ⇒ `NoQuorumError` (fail-closed) ; `<out>.diag.json` porte **3** entrées `non-json 200`.
- **Test existant MODIFIÉ (D-4 déclarée)** `ukemi_budget_counts_http_attempts_and_caller_retry_is_scoped` : retrait du cas `"html"`@200 de la boucle fatale `["rpc","400","html"]` → `["rpc","400"]`. Ce cas assertait **exactement** le contrat que ce lot inverse ; couverture **MIGRÉE** vers les 3 tests ci-dessus. Pas un affaiblissement (503-retenté et rpc/400-fatal restent).

## 3. Mutants (`F:\tmp\ukemiretry1\mutants.mjs`) — 7 mutants, TOUS ROUGES sur leur test nommé, TOUS RESTAURÉS byte-exact

Golden `record.ts` sha256 (raw==LF) `afa20f8cbe4421cc3b3ed98a0676088b998c99d6aa2cf39e57c34ceb18028d7e`. Chaque mutant : substitution unique sur le golden, test cible lancé via le VRAI transport sous **env -u des 8 clés** (clés supprimées de l'env enfant, A-7), assertion ROUGE sur le test **nommé**, restauration byte-exacte (vérifiée sha). **Baseline** : chaque test cible prouvé VERT sur le golden (chaque mutant = flip vert→rouge). `BASELINE_OK=true ALL_RED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true`, exit 0.

| # | mutant | test rougi |
|---|---|---|
| M1 | clause retirée (toute la disjonction `NonJsonBody` ôtée) | A-8 (la course REJETTE = le STOP exact) |
| M2 | 4xx admis (`HttpError >= 500` → `>= 400`) | matrice (400/404 réessayés) |
| M3 | 2xx≠200 admis (`NonJsonBody code===200` → tout 2xx) | matrice (201/204 réessayés) |
| M4 | retry illimité (borne `< args.retries` → `+ 100`) | épuisement (102 ≠ 3 fetches) |
| M5 | libellé (perd le `<code>` : `non-json 200` → `non-json`) | A-8 (message ≠ `non-json 200`) |
| M6 | non compté (seul `attempt 0` journalisé) | épuisement (1 ≠ 3 entrées) |
| M7 | 200 retiré (chirurgical : garde 429/≥500, ôte `code===200`) | matrice (200 devient fatal) |

## 4. Oracle complet (A-3, exits directs, env `-u` des 8 clés)

`env -u HELIUS_API_KEY -u POLYGON_API_KEY -u DATABENTO_API_KEY -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_ROBINHOOD_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_ETH_URL` (les 8, `docs/BASCULEMENT-COMPTE.md:81`). TEMP sur F:.

| gate | exit | | gate | exit |
|---|---|---|---|---|
| `gate:vocab` | 0 | | `lint:ratchet` | 0 |
| `typecheck` | 0 | | `lang:gate` | 0 |
| `lint` | 0 | | `export:check` | 0 |
| `test` | 0 | **870 / 869 pass / 0 fail / 1 skip** | | |

`test` relancé sous les DEUX formes contre l'arbre final : `--test-reporter=tap` ⇒ **870/869/0/1** (`oracle-test-final.log`) ; commande `package.json` verbatim (`--test-force-exit`) ⇒ **exit 0, 0 `not ok`**. Le **1 skip** = `u4b_labels_replay_via_main_real_artifact` (`# SKIP real e2 artifacts absent`) : **pré-existant, nommé, fichier NON touché** (le même que Bell). **0 fail.**

## 5. R-25 (pathspec `ci.yml:65` VERBATIM, `docs/**/*.md` exclus)

`git diff --shortstat` avec le pathspec CI (`:(exclude,glob)docs/**/*.md` …) : **2 fichiers, 118(+)/13(−) = 131** < 300. `M record.ts` (+17/−7), `M ukemi-guard-record.test.ts` (+101/−6). L'amendement ADR-U4b (`docs/adr/**.md`, +97/−0) est **EXCLU** (vérifié verbatim). Aucun fichier neuf ⇒ pas de `git add -N` requis.

## 6. Gel U-4b (A-6) — 9/9 byte-identiques AVANT==APRÈS == prereg §2

Recompute LF (`tr -d '\r' | sha256sum`), AVANT et APRÈS mes éditions (et après l'append ADR + les runs de mutants) : identiques et concordants au prereg §2 (`docs/PLAN-u4b-prereg.md:116-124`) — `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, **`rpc.ts 0e232519…` INTOUCHÉ**, `calib-digest 3603265d…`, labeler `u3-realized cb020425…`. `record.ts` est **hors** du jeu — 3 confirmations : prereg §2 (absent) ; BELL-RETRY-1 G1 §6 ; **ADR-U4b §3 l.133 verbatim « `record.ts` / `rpc2.ts` sont hors du gel »**. Pas de STOP.

## 7. Amendement ADR-U4b (D-n) — FOLDÉ EN DÉPÔT (pas sous `F:\tmp`), APPEND PUR

Section datée **« Amendement daté 2026-09-22 (UKEMI-RETRY-1) »** dans `docs/adr/ADR-U4b-calibration-episode-frais.md` (motif : la checkpoint-2 BELL-RETRY-1 C-1/CA-3 a fait d'un amendement sous `F:\tmp` un défaut bloquant). **Preuve d'append pur** : sha LF AVANT (HEAD) `2551f3e645661d9a…` (= la valeur Bell) ; APRÈS `1b49f4a946055e62…` ; `git diff --numstat` = **+97/−0** (451 lignes d'origine intactes). ADR-U4b n'est pas dans le gel du prereg §2 ; l'amendement n'édite aucun sha de référence ⇒ recompute prereg §2 reste vrai ; docs exclus de R-25. Il porte : **prereg §5a INCHANGÉ** (`--prereg-sha`/`--labeler-sha` ne lient pas `record.ts` ; annotations §5a APRÈS l'insertion dérivent de +10, celles AVANT inchangées ; `ukemi_sha` change mais HORS du `book_digest`) ; **Tuyaux** (Branchement) ; **coût** + **`errors_by_operator`** (§9) ; **mécanique du STOP** (§9).

## 8. Consigne standard G1 — point par point

*(Source A-1..A-10 : pas de doc canonique séparé lu ; sémantique reprise de BELL-RETRY-1 `docs/G1-lot-bell-retry-1.md:94-98` §8, acceptée au checkpoint-2 — même famille de lot.)*
- **A-1..A-6** FAIT (modèle résolu ; worktree+mk-nm 220/10/0 ; oracle §4 ; rendu sous `F:\tmp` + DELIVERED, aucun commit/workflow, rien sur `C:`, aucun réseau — seul `globalThis.fetch` bouchonné + hôtes `.invalid` + clés supprimées ; R-25 131 ; gel 9/9 == prereg §2).
- **A-7** FAIT (oracle ET mutants sous `env -u` des 8 clés ; tests passent une FAUSSE clé via `DEPS.env`). **A-8** FAIT (corps HTML de passerelle @200 via le VRAI `openGuardedClient`, seul `fetch` bouchonné). **A-9** N-A. **A-10** FAIT (surfaces servies : `rpc_errors[].message` — M5/M6 ; retry servi — M1 rougit `book_digest`/reject, M4 la borne).
- **MAST contré** (calque Bell C-5) : **« vérification incorrecte »** (cat. 3, FC3 ; via doc 06) — suite verte ne reproduisant pas le STOP. Contré par A-8 + M1 (clause retirée ⇒ A-8 REJETTE = STOP exact).

## 9. Déviations / items formés (D-n, zéro dette nue)

- **Test existant modifié (D-4)** — cas `"html"`@200 (contrat inversé) retiré de la boucle fatale ; couverture migrée vers 3 tests neufs.
- **Honnêteté « STOPperait à l'identique »** — raffinée : Bell = **lecture unique** `withRetry` (rejet immédiat) ; recorder = **quorum-2** (`rpc2.ts`) ⇒ un `NonJsonBody@200` isolé **BENCHE** la jambe et le quorum se reforme (pas de STOP immédiat à > 2 opérateurs). **La jambe payante (chainstack, appendée EN DERNIER `record.ts:293-295`) n'est tirée que si < 2 keyless répondent** — à 3 keyless eth_call un bench isolé ne l'appelle PAS. STOP sous **famine de quorum** (blip corrélé ≥ N−1 jambes) ⇒ `NoQuorumError`. Le classifieur est identique (R-BR2) ; la valeur = éviter le bench (et le tirage payant qu'il peut induire) en réessayant SUR PLACE.
- **`errors_by_operator` (D-4, monitor 5%-rule) — sémantique CONSIGNÉE** (calque Bell C-4 pt 3) : le hook (`record.ts:318` ← `transport.ts:177`) incrémente `errByOp` à CHAQUE faute ⇒ un `NonJsonBody@200` retenté jusqu'à R+1 fois. `errByOp` est **affichage/provenance/diag SEUL** ([lu] : aucune garde/`throw`/`if`), **PAS une garde-code** ⇒ effet borné. Consigne (amendement §3) : toute lecture 5%-rule enjambant la fusion lit ce changement.
- **R-U-1 (contradiction ADR-GARDE-HELIUS, transitoire jusqu'au fold Bell C-1)** : `record.ts:322-323` cite C-4/C-6(iii) ; `ADR-GARDE-HELIUS-...:320,502` (non révisé) dit « JAMAIS `NonJsonBody` ». L'amendement PROPOSÉ de BELL-RETRY-1 (`F:\tmp\bellretry1\ADR-amendement.md` l.9-12, [lu]) révise la clause ~320 **DOCTRINE-GÉNÉRALE** ⇒ COUVRE le recorder une fois foldée. *Déclencheur* : au fold C-1, confirmer que la clause reste doctrine-générale ; sinon un 2e amendement daté. Propriétaire : orchestrateur.
- **R-U-2 (classifieurs symétriques non alignés)** : `scripts/census/u4-guard.mjs:120` ET `apps/bell/src/universe.ts:99,114` (`withUniverseRetry`) portent le même prédicat « NonJsonBody fatal ». HORS périmètre. *Déclencheur* : 1re occurrence census/redraw ou pagination Bell, OU un lot touchant ces fichiers. `error_origin` : plan.
- **R-U-3 (branches défensives non atteignables)** : bras `NonJsonBody` 429/≥500 défensifs (transport ne lève qu'un 2xx) ⇒ aucun mutant du chemin servi ne les rougit. Gardés pour la fidélité du calque. *Déclencheur* : un transport levant `NonJsonBody` sur un code non-2xx.

## 10. Fichiers

- Code : `F:\Monark-wt-ukemiretry1\apps\sentinel\src\ukemi\record.ts` (sha `afa20f8c…`)
- Tests : `F:\Monark-wt-ukemiretry1\apps\sentinel\test\ukemi-guard-record.test.ts` (sha `3f0dd6a3…` ; 1 modifié + 3 neufs)
- ADR (foldé, append pur +97/−0) : `F:\Monark-wt-ukemiretry1\docs\adr\ADR-U4b-calibration-episode-frais.md` (sha `1b49f4a9…`)
- Rendu : `F:\tmp\ukemiretry1\G1.md`, `F:\tmp\ukemiretry1\DELIVERED.sha256`, `F:\tmp\ukemiretry1\mutants.mjs`, `F:\tmp\ukemiretry1\ADR-U4b-amendment-append.md`, `F:\tmp\ukemiretry1\oracle-test.log`, `F:\tmp\ukemiretry1\oracle-test-final.log`
