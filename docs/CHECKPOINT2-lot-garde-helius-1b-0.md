# CHECKPOINT-2 GARDE-HELIUS-1b-0 (validateur-humain, 2026-09-22, persisté verbatim par l'orchestrateur)

**Modèle résolu : claude-fable-5-1**

# Checkpoint-2 — LIVRABLE — lot GARDE-HELIUS-1b-0 (côté paquet)

## 1. Artefacts lus et rejeu

- Mission : `F:\tmp\garde1b0-rev\MISSION-G2-CP2-garde-helius-1b-0.md` ; rendu G1 `F:\tmp\garde1b0\RENDU-G1.md`, manifeste `DELIVERED.sha256`, harnais `mutants.mjs`, `freeze-before.sha256` ; plan `docs/G0-lot-garde-helius-1b.md` (§3.1, §5, §10), items 1b-0 de `docs/G7-lot-garde-helius-2b-ii.md §5` (lu par `git show 985fed9:`), amendement ADR 1b-0 (`docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`, diff `5394dfe..ee8a94f`), diff complet du lot (src, bin, tests, lock), `transport.ts` intégral, `cli.ts`, `reconcile.ts`, `apps/bell/src/universe.ts:477-493`.
- Rejeu (AM-2 ter) : clone à historique complet `F:\tmp\cp2-garde1b0\tree` (`ee8a94f`, base `5394dfe`), `mk-nm.ps1` (220 entrées, `@monark` 10, `require.resolve` → le clone), logs `F:\tmp\cp2-garde1b0\logs\`, harnais à moi `my-mutants.mjs`, sondes `probe.mjs` / `probe-get.mjs`, copie du code de base 5394dfe sous `base\`. Tout oracle sous `env -u` des 8 clés ; aucune variable affichée.
- **Déclaration** : dans le clone jetable seulement, j'ai fait `checkout -b` / `merge --no-commit` / un commit de sonde pour mesurer l'arbre fusionné (`985fed9` + `ee8a94f`) — verification au sens de la mission, jamais dans `F:\Monark`. Preuve dépôt intact : sha de `transport.ts` / `ledger.ts` / `ukemi-guard-record.test.ts` identiques AVANT/APRÈS (`8fbb26b2…`, `4d53c168…`, `3b087cbe…`), `git status` vide ; le HEAD du dépôt a bougé `f0ea922`→`8f2c1d0` pendant ma session par commits TABLEAU de l'orchestrateur (pas moi).

## 2. Vérifications 1-8 refaites

| # | Résultat mesuré |
|---|---|
| 1 Invariants | `git diff --stat 5394dfe -- apps/` = `ukemi-guard-record.test.ts` seul (22/17) ; `scripts/` vide ; `freeze-before.sha256` 9/9 OK ; `DELIVERED.sha256` 17/17 OK. Dérive base→`985fed9` sur les chemins touchés : **seul l'ADR** (92 lignes, amendement 2b-iii) ⇒ **conflit textuel à la fusion** (les deux branches ajoutent en fin de fichier ; `merge-tree` exit 1, marqueurs l.465/558/663). |
| 2 Oracle | `npm run ci` exit 0 : **773/771/0/2** (skips `u4_redraw` [2b-iii], `fetch_only_inside_client` [until 1b]) ; lint 0 ; ratchet **69/69** ; lang:gate 0 ; export:check 0. R-25 pathspec `ci.yml:65` = 476+47 = **523** ≤ 1 150 (le rendu dit 517 : chiffre périmé, sans effet). **Arbre fusionné** (conflit ADR résolu en gardant les deux amendements) : ci exit 0, **789/788/0/1** (skip unique `fetch_only_inside_client`, condition « skipped == 1 » du G7 2b-ii tenue), lint/ratchet 69/69/lang/export = 0, gel 9/9. |
| 3 Mutants | Les 14 du worker rejoués sur mon clone : **14 KILLED**, restauration byte-exacte. Les miens (11) : **VH-a** resolveGetUrl court-circuité KILLED ; **VH-b1** branche 3xx retirée KILLED ; **VH-c1** récupération sans self-heal KILLED ; **VH-c2** récupération désactivée → test sentinel inversé ROUGE (KILLED) ; **VH-c3** trop permissif → `ledger.test.ts` C-V-8(c) ROUGE (KILLED) ; **VH-d1** `opts.network` ignoré (guarded.ts) KILLED ; **VH-d2** `opts.network` ignoré (transport.ts) KILLED ; **VH-e** défaut réseau basculé Solana → e2e sentinel ROUGE (KILLED). **SURVIVANTS** (code correct à l'inspection, test plus étroit que la revendication) : **VH-a2** comparaison d'hôte relâchée en `endsWith` (pas de sonde hôte sosie) ; **VH-b2** `redirect:"manual"` retiré de la branche GET (le test 3xx n'exerce que le POST) ; **VH-d3** `network` estampillé sur TOUT opérateur (aucune ligne helius pinée). |
| 4 A-7 | Clés lues uniquement `transport.ts:96,106` ; messages `raise`/`resolveGetUrl`/`RedirectBlocked` portent le label et le statut, jamais l'URL (`:202-204,209,223,230`) ; `bin/rpc-guard.mjs` n'imprime que les messages de `runCli` (chemins de ledger). 0 forme d'accès à clé hors transport ; scan anti-close du diff : seul littéral décimal `2.0` (jsonrpc). |
| 5 Clause 121 | Un seul opérateur/URL/cap : `transport.ts:105-110` (`CHAINSTACK_CYCLE_CAP_RU` 16 M inchangé `:23`) ; `network` = attribut de ligne, stamp limité à `chainstack` : `guarded.ts:52-53`, `ledger.ts:131` ; prior gelé sur TOUTES les lignes : `ledger.ts:128` ; reconcile somme `attempted` sans filtre réseau : `reconcile.ts:38-39`. Test `chainstack_one_account_cap_across_networks` (prior 3 = 2+1) rejoué. |
| 6 CA-11 | Lot PAQUET, aucun consommateur nouveau ; rendu et ADR 1b0-F disent **UPCOMING** pour `bin`, consommateurs 1b-i (universe), 1b-ii (collect), 1b-iii (eth + dé-skip) nommés (G0 §3.1/§5). Pas de surclaim `built`. Mais voir C-1 : une pièce livrée ne compose pas avec son consommateur réel. |
| 7 Lock | `package.json` : seule ligne `bin` ; lock : entrée `bin` seule (4/1) ; `npm install --package-lock-only --offline` exit 0, sha lock inchangé `1c76936b…` ; aucune dépendance ajoutée ; `bin` s'exécute (sans args exit 2, dossier absent exit 2 fail-closed). |
| 8 ADR | Amendement daté 1b0-A..G présent, résidus formés (crash 1er append, T4, `BudgetExceededError` 1b-i, `PUBLIC_SOLANA` 1b-ii, ripple finally, Databento/Polygon). **Aucune ligne « Tuyaux »** (entrée/sortie/état/test) dans la section 1b-0 malgré le rendu F-1 (grep « tuyau » : dernières occurrences l.77/397/431 = lots 1a/2b-ii). |
| Ruling C-R-b6 | Le test asserte `!("network" in lines[0])` + chaîne vérifiée + prior 3 — **pas** l'identité d'octets. Je l'ai établie moi-même : même appel via `openGuardedClient` (sans `network`) sur le code `ee8a94f` et sur le code `5394dfe` extrait ⇒ **ligne byte-identique** (7 clés `prev_entry_sha256,cycle_id,tariff_version,by_op_method,outcome,credits_derived,entry_sha256`). Prémisse vraie, établie par rejeu de composition, non par le test. |

## 3. Checklist

| Règle | Verdict | Preuve |
|---|---|---|
| CA-1 | conforme | chaque item 1b-0 a un test nommé + mutant nommé ROUGE, rejoués (§2-3). |
| CA-2 | conforme | aucune décision de valeur nouvelle ; déviations (défaut ETH au lieu du ripple recorder, `BudgetExceededError` déplacé à 1b-i) déclarées ADR 1b0-B/F, découlent de l'invariant de mission. |
| CA-3 | conforme | amendement ADR daté présent (C-9). |
| CA-4 / CA-5 | n-a au livrable (plan approuvé ; G0 §12 MAST). |
| CA-6 | **correction** | oracle + mutants verts, mais **C-1** : le GET `xstocks-issuer` ne compose pas avec son entrée réelle (sonde P3). |
| CA-7 | **correction** | résidus formés, sauf déclencheur du ripple `finally` (C-5) et reconcile mixte (C-6). |
| CA-8 | conforme | worker `claude-opus-4-8[1m]` (préfixe conforme), générateur ≠ relecteur G2 ≠ moi ; `error_origin` au G7. |
| CA-9 | conforme | tout re-exécuté par moi sur clone frais (§1). |
| CA-10 | conforme | aucun argument de vitesse. |
| CA-11 (+durci) | **correction** | statut UPCOMING correct ; ligne Tuyaux absente (C-4) ; **C-1** est le motif durci : test qui fabrique l'entrée dans la forme attendue par l'aval. |
| Anti-close | conforme | aucun littéral ressemblant à un close. |

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)

**Bloquantes avant fusion (pli + G2-delta, rejeu non-LLM exigé)**

- **C-1 — le GET keyless résout `undefined` sur tout corps réel de l'émetteur.** `transport.ts:236-243` applique à la branche `isGet` le désenveloppage JSON-RPC (`return json.result`, contrôle `json.error`). L'API xStocks renvoie `{assets:[…]}`/tableau (`universe.ts:477-482` tolère `array | {data|assets|items|results}`), jamais `result`. Sonde P3 sur `ee8a94f` : `{assets:[1]}` → `undefined`, `[1]` → `undefined`, `{data:[1]}` → `undefined`. Composé avec Bell : `pageAssets(undefined)` = `[]` ⇒ ancre de fin à la page 0 ⇒ **univers vide silencieux (fail-open)**. Le test `xstocks_issuer_get_uses_get_and_structural_host` ne passe que parce qu'il enveloppe `{assets:[]}` dans un cadre JSON-RPC (`jrpc(...)`) — précédent CA-11 durci (Bell -b3a). **Clôture** : pour un `getOps`, retourner le JSON parsé tel quel (aucun `.result`, aucun contrôle `error` JSON-RPC ; NonJsonBody conservé) ; test avec corps de forme réelle (`{assets:[…]}` ET tableau nu) assertant la valeur résolue = le corps ; mutant « GET désenveloppé comme JSON-RPC » ROUGE ; cohérence documentée avec `foldPage` (1b-i).
- **C-2 — « 403 SANS `retryAfterMs` » n'est pas structurel.** `transport.ts:238` parse `Retry-After` pour tout non-ok, 403 inclus. Sonde P1 : 403 + `retry-after: 5` ⇒ `retryAfterMs=5000`. Phrases fausses : `errors.ts:103-104` (« `undefined` for a fatal status (403) ») et ADR 1b0-C(iii) (« un 403 conserve `code:403` SANS `retryAfterMs` ») ; le test n'exerce qu'un 403 sans en-tête. **Clôture** : `res.status === 403 ? undefined : parseRetryAfterMs(...)` ; test 403 + en-tête ⇒ `retryAfterMs === undefined` ; mutant ROUGE ; texte ADR/errors.ts rectifié.
- **C-3 — conflit ADR à la fusion** (mécanique G7) : garder les DEUX amendements (2b-iii puis 1b-0), et **re-jouer l'oracle sur l'arbre fusionné** : attendu ci 0 avec fail 0 et **skipped == 1**, ratchet 69/69 (mesuré ici 789/788/0/1).

**Non bloquantes (à plier au même G7 ou au 1b-i, item formé chacune)**

- **C-4** ADR : ajouter la ligne « Tuyaux 1b-0 » (entrée `openGuardedClient(env, limits, dir, cycles, {network})` ; sortie = consommateurs 1b-i/ii/iii ; état `<cycle>/chainstack.{jsonl,head,lock}` + attribut `network` ; tests `cycle_ledger_mixes_legacy_and_network_lines` + e2e sentinel) et corriger le rendu F-1.
- **C-5** Ripple `finally` par `(op, cycles[op])` : ADR 1b0-E nomme 1b-i, qui touche `apps/bell/src/universe*`, pas `apps/sentinel/src/ukemi/record.ts` — nommer le lot qui touche le recorder (sinon item pendant, CA-7).
- **C-6** Reconcile sous 121 : `reconcile.ts:12` décrit un agrégat Chainstack « par réseau par jour » ; l'ADR 1b0-B(c) dit reconcile inchangé sur le total du compte. Quel instantané pour un ledger mixte ETH+Solana ? Item formé, déclencheur « premier reconcile d'une course Solana (1b-i) ».
- **C-7** Trois assertions pour les survivants : hôte sosie (`//xapi.xstocks.fi/...` ou `//api.xstocks.fi.evil.invalid/...` refusé) ; 3xx sur l'opérateur GET ⇒ `RedirectBlocked` ; ligne helius SANS `network` quand la course passe `opts.network` (compte pour IT-1 : une course universe porte helius + chainstack).
- **C-8** Test C-R-b6 : épingler l'ordre fermé des 7 clés de la ligne legacy (ce que « byte-identique » signifie), pour que la prémisse soit assertée et non seulement rejouée par moi.
- **C-9** Rendu : R-25 = 523 (pas 517).

Pas d'ESCALADE : aucune décision de valeur nouvelle, pas de divergence avec un G7 (non rendu), aucun coût investisseur.

**AM-1 (ce que la checklist a attrapé)** : la sonde de composition CA-11 durci (corps de forme réelle plutôt que l'enveloppe du test) a attrapé un GET livré qui résout `undefined` sur toute réponse réelle ; la sonde 403+en-tête a attrapé une garantie documentée mais non codée ; 3 survivants révèlent des tests plus étroits que l'ADR. Manqués à signaler a posteriori par l'orchestrateur, le cas échéant.

Chemins : `F:\tmp\cp2-garde1b0\{tree, base, my-mutants.mjs, probe.mjs, probe-get.mjs, logs\}` (jetables).
