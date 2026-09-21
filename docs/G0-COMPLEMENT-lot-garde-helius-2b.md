# G0-COMPLÉMENT — GARDE-HELIUS-2b (migration du recorder Ukemi sous `@monark/rpc-guard` + grep CI)
Orchestrateur/planificateur `claude-fable-5-1`, 2026-09-21 16:40 UTC (`date -u`). Base : `lot/etude-suite` après la fusion 2a `e98b54f` (G7 `docs/G7-lot-garde-helius-2a.md`). **Plan qui fait foi, déjà approuvé au checkpoint-1 delta** : `docs/G0-ADDENDUM-lot-garde-helius-2.md` (D4, D5, L-2-3, L-2-4, tuyaux, invariants) + son pli C-1..C-7 (en particulier C-3, C-4, C-5 « 2b », C-6). Ce complément n'ajoute QUE ce que la 2a a appris ; il ne rouvre rien.

## 1. Faits nouveaux [lu] (code fusionné `e98b54f`)
1. Signatures publiques finales du paquet : `openGuardedClient(env, limits, ledgerDir, cycles: Record<label,string>, opts?: { timeoutMs?, onTransportError?: (op, errorName, code|undefined) => void })` ; `RunLimits.{maxCalls, runCaps, methodCaps, cycleFloor}` PAR opérateur ; `spent().byOperator` ; unité `"ru"` ; `ReconcileMode` inclut `aggregate-calibration` ; exports `TransportError` (`.code`), `BudgetExceededError`, `ETH_CALL_KEYLESS_LABELS`, `GET_LOGS_KEYLESS_LABELS`, `chainstackRu`, `CHAINSTACK_TARIFF_VERSION` ; `AGGREGATE_ONLY_OPERATORS` interne (chainstack exige `--mode aggregate|aggregate-calibration` au `reconcile`).
2. Le recorder classe aujourd'hui les erreurs par le TEXTE : `isResultLimit` (`apps/sentinel/src/ukemi/rpc2.ts:67`, liste fermée de jetons : « more than », « range is too », « 10000 », « limit exceeded », « block range », « too large », « response size », « maximum allowed », « ranges over », « narrow your filter »…) et `isPlanLimited` (même fichier). `record.ts:103-105` remonte le corps d'un HTTP 400 pour que `getLogsVia` découpe la plage.
3. Le transport du paquet reprend le corps EXPURGÉ (C-R-1, C-R-3) ; résidu déclaré C-GD-2 : une clé transformée par le serveur (base64, hex) n'est pas expurgeable par motif (ADR A-3bis).

## 2. Décision D6 — C-GD-2 tranché : pour un opérateur PAYANT, le message ne porte JAMAIS de texte libre du corps
- Dans `packages/rpc-guard/src/transport.ts` : pour un opérateur payant (`helius`, `chainstack`), `TransportError.message` = préambule fixe + code + **indice à vocabulaire FERMÉ** : la liste, dans l'ordre d'apparition, des seuls JETONS d'une expression fermée exportée par le paquet (`ERROR_HINT_TOKENS`, sur-ensemble déclaré des jetons de `isResultLimit` et `isPlanLimited`) trouvés dans le corps. Aucun autre octet du corps n'est repris. Une clé, sous quelque forme que ce soit, ne peut pas appartenir à un vocabulaire fermé de mots anglais et de la constante « 10000 » ⇒ C-GD-2 et le résidu « clé coupée par un blanc » sont FERMÉS structurellement pour les opérateurs payants, pas bornés.
- Opérateurs **keyless** : corps expurgé conservé (leurs URL ne portent pas de secret ; le diagnostic du quorum gratuit en dépend). Déclaré.
- `redact` reste en place (défense en profondeur, et keyless).
- **Test de conformité inter-paquets (2b)** : pour chaque corps connu du recorder (fixtures existantes de range-cap et de plan-limit), `isResultLimit(hint) === isResultLimit(corps)` et `isPlanLimited(hint) === isPlanLimited(corps)` — le découpage de plage de `getLogsVia` se comporte à l'identique. Mutant « jeton retiré du vocabulaire » ⇒ ROUGE ; mutant « corps libre repris pour un payant » ⇒ ROUGE (corps porteur d'une clé factice en base64).
- ADR : A-3bis amendé (résidu C-GD-2 LEVÉ pour les payants, par D6 ; conservé et déclaré pour les keyless, sans secret).

## 3. Rappels d'exécution (issus de la journée, contraignants pour le worker)
- Codes de retour d'oracle capturés DIRECTEMENT, jamais après un pipe ; sorties collées dans le rendu.
- Invariants byte-identiques à vérifier par sha au G1 : `apps/sentinel/src/rpc.ts` (non touché, transitif du gel), les 3 sha de gel U-4b, `wadray.ts`, `abi.ts`, `l1-split.ts`, `book_digest 034fbff9…`, `PINNED_DIGEST 267cd991…`, fixtures `u4/` et `u4b/`. `rpc2.ts` : signature seulement si nécessaire, ordre des fournisseurs ÉPINGLÉ inchangé.
- Le skip `fetch_only_inside_client` (« SKIP until 1b ») : 2b étend la portée du grep à `apps/sentinel/src/ukemi/**` (L-2-4) ; le dé-skip complet reste au lot 1b (Bell) — dit tel quel dans le test.
- Allowlist du grep : `packages/rpc-guard/src/transport.ts` + `apps/sentinel/src/rpc.ts` avec déclencheur nommé **NARABI-OPS-1d** (décision 118) ; mutant « allowlist élargie sans déclencheur » ROUGE.
- Arguments REQUIS du recorder : `--ledger-dir`, `--cycle`, `--floor`, `--max-ru`, `--method-caps` ; `--max-calls` conservé ; sous-ensemble d'opérateurs = ceux de la course (jamais de verrou `helius` pour une course Ukemi). `--concordance-out` (POOL-RPC-1a) conservé.
- Tests imposés (addendum + C-5/C-6) : `ukemi_record_spends_only_through_guard`, `ukemi_record_requires_ledger_dir_cycle_and_method_caps`, `ukemi_record_budget_refusal_is_not_retried`, `ukemi_record_resume_hits_cost_zero_ru`, `ukemi_budget_counts_http_attempts` (R retries ⇒ R+1 lignes sur disque), `ukemi_record_then_unlock_then_reconcile_end_to_end` (mode `aggregate-calibration`).
- R-25 projeté 400–700 (+ D6 ≈ 60–100) ; seuil de découpe 1 150.
- Aucun appel réseau, aucune clé réelle, `fetch` bouchonné ; rien sur C: ; le worker ne committe pas.

## 4. Hors périmètre (inchangé)
Job quotidien Narabi (`run.ts`/`rpc.ts`, lot -1d) ; Bell (1b) ; prereg et course U-4b-1b (étape suivante, orchestrateur).

## 5. Critères d'acceptation
CA-11 : le recorder gardé est « branché » à la fusion (test de bout en bout `runRecorder` → `unlock` → `reconcile`), reste `upcoming` au registre public jusqu'à la première course rapprochée. Oracle G7 : `npm run ci && npm run lint && npm run lint:ratchet` sur l'arbre fusionné.
