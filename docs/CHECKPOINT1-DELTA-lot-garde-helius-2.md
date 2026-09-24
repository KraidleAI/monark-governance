# CHECKPOINT-1 DELTA - GARDE-HELIUS-2 - avis du validateur-humain (verbatim, claude-fable-5-1, 2026-09-21)

# CHECKPOINT-1 DELTA — PLAN — GARDE-HELIUS-2

**Décision : ACCEPTE-AVEC-CORRECTIONS.** Liste fermée C-1..C-7, à plier dans l'addendum AVANT tout code, puis contrôle du pli par l'orchestrateur (R-21). Une frontière d'escalade est nommée sur D4 (ii).

**Ce que j'ai lu.**
- L'addendum : `F:\Monark\docs\G0-ADDENDUM-lot-garde-helius-2.md` à `c6ca3db`.
- Les FAITS Chainstack : `F:\PRODUITS\etude-2026-09-21\garde-helius-2\FAITS-tarification-chainstack-2026-09-21.md`.
- Le plan d'origine `docs/G0-lot-garde-helius.md` §3.4, §4, §6.1, et `docs/G7-lot-garde-helius-1a.md:19-20`.
- `docs/adr/ADR-U4b-calibration-episode-frais.md` D4.
- Dans le code : `apps/sentinel/src/ukemi/record.ts:79-147,312-347`, `apps/sentinel/src/rpc.ts:48-130`, `apps/sentinel/src/ukemi/{abi,wadray}.ts`, `scripts/census/u4b/*.mjs`, `scripts/record-u4b-calib.mjs`.
- Pour le paquet : les sources de `b13850c` lues au second checkpoint-2. Je n'ai pas re-vérifié `88c63bb` ; l'orchestrateur l'annonce fusionné.
- Lecture seule et greps, aucune exécution.

## Tes six points
1. **D1, tarif 2 RU.** Je le garde pour les caps : il ne sous-compte jamais. Passer le tip au tarif n'apporte rien, car on ne peut facturer 1 RU sans risque qu'avec une borne supérieure du tip, et le tip croît pendant la course.
   - Le faux NO-GO souple est possible. Mesure : le recorder n'utilise que `eth_call`, `eth_getLogs` et `eth_getBlockByNumber`, tous dans la liste sensible à l'âge, donc 100 % des appels sont comptés 2 RU. `rpc2.ts:251` appelle `["finalized"]`, qui sera en général facturé 1 RU (full).
   - Le sur-compte vaut donc la part d'appels facturés full. Dès qu'il dépasse `max(50 RU, 0,5 %)`, une course honnête rend NO-GO souple, puis STOP et escalade, selon le protocole de l'addendum lui-même.
   - Deux faits tranchent et manquent aux FAITS. Le premier est le type de nœud : Trader archive, tout à 2 RU, rend D1 exact ; Global classe chaque requête. Le second est la granularité de la page Usage, puisque `Snapshot.byMethod` suppose une ventilation par méthode.
   - Le G0 §4 et §3.4-3 accepté pré-enregistre « 1ʳᵉ course Chainstack = étalonnage, pas de verdict RU ». L'addendum l'abandonne sans le dire. Voir C-1.
2. **D4 (ii).** Tel qu'écrit, c'est un trou. Il n'est licite que comme dépendance d'ordre.
   - Trois contradictions : la phrase d'objectif (l.6 : « le pool sentinel n'atteint plus aucun endpoint payant hors garde ») contre D4 (ii) ; le G0 §6.1 l.326-327, dont les deux déclencheurs sont remplis et qui engage la migration de `sentinel/rpc.ts:52-77` au lot 2 ; le G0 §6.1 l.322, « Allowlist = UN SEUL module. Aucune autre entrée ».
   - Atténuation : E-5 n'est pas déployé, donc ce lot n'aggrave rien.
   - **Frontière d'escalade** : l'investisseur doit trancher si l'orchestrateur compte redéployer E-5 avec la clé Chainstack avant la migration de `rpc.ts`. Même chose si l'env de production porte déjà la clé aujourd'hui, car le chemin payant reste alors hors garde au-delà de ce que le plan approuvé promettait. Voir C-4.
3. **D3.** Les trois corrections du cœur sont nécessaires, et insuffisantes. « Prior par opérateur déjà structurel » est vrai pour les fichiers, faux pour les entrées :
   - `RunLimits.cycleFloor` est un seul nombre pour tous les opérateurs (`guarded.ts:13`). Un floor RU Chainstack s'appliquerait donc à `helius`.
   - `openGuardedClient` ouvre un ledger pour tout opérateur résolu, et `makeClient` verrouille tout opérateur payant de la classe. Une course Ukemi lancée dans un env Bell verrouillerait donc `helius`.
   - `maxCredits` somme des crédits et des RU.
   - Un seul `cycleId` sert deux cycles de facturation distincts. Voir C-2.
4. **Gel U-4b.**
   - `record.ts` est hors zone gelée, et ni les scripts gelés ni leurs transitifs épinglés (`wadray.ts`, `abi.ts`, `l1-split.ts`) ne l'importent (grep vide ; `record-u4b-calib.mjs` n'importe que `@monark/contracts` et `@monark/hikae`).
   - En revanche `abi.ts:7` importe `TRANSFER_TOPIC` de `../rpc.ts`. `rpc.ts` est donc un transitif de second niveau du code de score, et il n'est pas épinglé.
   - D2 et le fait 2 sont inexacts. La clé du recorder est lue à `record.ts:328` et sa porte est `record.ts:92`. `rpc.ts:50-54` et `:125` ne servent que le job quotidien. Voir C-3.
5. **R-25 et seam.** La fourchette 500–800 est optimiste.
   - `record.ts:79-130` porte son propre `fetch`, avec timeout 30 s, abort, `scrubUrls`, le hook `onRpcError` qui alimente le moniteur 5 %, et un retry placé SOUS le compteur.
   - `transport.ts:53` n'a ni timeout, ni abort, ni hook.
   - `ETH_CALL_PROVIDERS` et `GET_LOGS_PROVIDERS`, utilisés comme URL dans `record.ts:329-330`, doivent devenir des labels keyless dans `transport.ts`, avec ordre épinglé et `book_digest` inchangés. Voir C-5.
6. **CA-11.** Conforme. `upcoming` jusqu'à la première course rapprochée est plus strict que la règle. `ukemi_record_spends_only_through_guard` via le `runRecorder` réel avec un espion `fetch` est bien une composition depuis l'entrée réelle. Un ajout en C-6.

## Checklist
- **CA-1** : correction. L-2-3 ne se reformule pas en une phrase tant qu'on ne sait pas où vivent les endpoints keyless, le timeout et le hook d'erreur. Le test bi-processus de D3 devra rendre « prior à jour » par construction, sans dépendre d'une course entre processus.
- **CA-2** : conforme, sauf la frontière du point 2.
- **CA-3** : correction, voir C-7.
- **CA-4** : non applicable.
- **CA-5** : conforme. Le tableau MAST est présent ; y ajouter « unités mélangées à l'entrée » et « verrou d'un opérateur non utilisé ».
- **Anti-close bis** : 127, 5 000 et 1–2 RU sont des constantes de documentation lues, pas des prix. Hors clause.
- **FAITS** : « 12:0x UTC » n'est pas une heure lue à l'horloge. À corriger dans le fichier.

## Corrections (liste fermée)
- **C-1 (point 1).**
  - Avant le pré-enregistrement, l'orchestrateur lit sur place, sans page à clé, le type de nœud et la granularité de la page Usage, et complète les FAITS.
  - Nœud Global : la 1ʳᵉ course est un étalonnage, comme au G0 §4. La borne dure s'applique, la bande souple est informative, et on enregistre le ΔRU contre les requêtes par méthode. La bande de la 2ᵉ course est pré-enregistrée à partir de là.
  - Nœud Trader archive : D1 est exact, la bande reste inchangée.
  - Usage en agrégat seulement : `runReconcile` reçoit un mode agrégat déclaré, avec un test nommé.
  - L'addendum dit explicitement ce qu'il supersède du G0 §3.4-3 et §4 : le cap RU devient évaluable dès la 1ʳᵉ course.
- **C-2 (point 3).**
  - Un floor et un cycle par opérateur (`Record<label, …>`).
  - Un paramètre de sous-ensemble d'opérateurs sur `openGuardedClient` : seuls les opérateurs demandés sont ouverts et verrouillés.
  - Un cap de run par opérateur ou par unité : `--max-ru` ne se somme pas aux crédits.
  - `two_paid_operators_keep_separate_priors_and_units` tourne avec des floors et des unités distincts.
  - Mutants : « floor partagé » rouge, « verrou de l'opérateur non demandé » rouge.
  - `--floor` entre dans la liste des arguments REQUIS de D4 (i).
- **C-3 (point 4).**
  - Réécrire le fait 2 et D2 : clé du recorder en `record.ts:328`, porte en `record.ts:92`.
  - `apps/sentinel/src/rpc.ts` est déclaré non touché, et ajouté aux invariants avec un sha byte-identique vérifié au G1.
- **C-4 (point 2).**
  - Réécrire la phrase d'objectif, limitée au recorder.
  - Ajouter une ligne datée qui amende le G0 §6.1 : seconde entrée d'allowlist, avec déclencheur.
  - Inscrire dans CHANTIERS la dépendance dure « redéploiement E-5 ⇐ migration `rpc.ts` (lot `run.ts`) ».
  - Déclarer comme fait d'orchestrateur si l'env de production porte la clé Chainstack aujourd'hui. Sinon, c'est la frontière d'escalade du point 2.
  - Ajouter au protocole la clause « aucune fenêtre before/after ne chevauche l'heure du job quotidien ».
- **C-5 (point 5).**
  - Seam décidé d'emblée, selon le précédent Q3 : 2a (paquet : tarif, opérateur, cœur, timeout/abort dans `transport.ts`, labels keyless ETH) et 2b (migration du recorder, grep CI). Deux PR, et aucune ne clôt seule.
  - Déclarer où se re-branche le hook `onRpcError`.
  - Ajouter le test `ukemi_budget_counts_http_attempts` : R retries d'appelant donnent R+1 lignes sur disque. Le retry de `record.ts:86` est aujourd'hui SOUS le compteur. Mutant « retry sous le tick » rouge.
- **C-6 (CA-11 durci).** Un test part du ledger produit par `runRecorder`, puis `runCli unlock`, puis `runCli reconcile` : verdict et code de sortie, de bout en bout.
- **C-7 (CA-3).** Nommer l'ADR de rattachement : un amendement daté d'ADR-GARDE-HELIUS (tarif RU, entrées par opérateur, allowlist) et la note ADR-U4b D5 « U-4b-0 subsumé ».

## AM-1
- **Attrapé par la checklist :**
  - le faux NO-GO souple systématique, et l'abandon muet de la course d'étalonnage ;
  - le floor, le cycle et le verrou qui ne sont pas par opérateur à l'entrée ;
  - `rpc.ts` transitif du code gelé via `abi.ts:7` ;
  - le fait 2 et D2 faux ;
  - L-2-3 sous-dimensionné ;
  - l'allowlist qui contredit le G0 §6.1.
- **Ma part :** mon checkpoint-1 avait accepté « allowlist = un seul module » et « 1ʳᵉ course = étalonnage », deux clauses que cet addendum plie. Mes deux checkpoints-2 de 1a n'avaient pas vu que `cycleFloor` est un scalaire ni que `openGuardedClient` verrouille tout opérateur résolu. Un second opérateur payant dans un test les aurait montrés.

**Modèle résolu (R-1)** : `claude-fable-5-1` (effort high). Aucune écriture, aucun `git`, aucun réseau.
