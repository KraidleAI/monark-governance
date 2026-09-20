# L-lecture — SPL Token-2022 ScaledUiAmount (PR-B-SPL-TOKEN2022), 2026-09-20
Lecteur `claude-sonnet-5` (effort max), lecture web + code source, discipline doc 03 ([lu]/[abs]/[2nd], citations ≤ 25 mots). Commandité par l'orchestrateur MONARK pour Bell -b3 (reconstruction du multiplicateur de rebase des xStocks). Le lecteur n'écrit pas ; ce fichier est la persistance orchestrateur de son rapport (verbatim, entités HTML décodées). Toutes les lectures datent du **2026-09-20**.

## (A) Fiche source par document

| # | Document | Identification | Sections/fichiers lus | Niveau |
|---|---|---|---|---|
| 1 | `github.com/solana-program/token-2022` — dépôt courant du programme (a remplacé le monorepo historique `solana-labs/solana-program-library` ; commit `714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be`, message « Publish spl-token-cli v5.3.0 », lignée postérieure à la release crate `spl-token-2022` 11.0.0/2026-05-08) | `program/src/extension/scaled_ui_amount/{mod.rs, instruction.rs, processor.rs}`, `program/src/extension/mod.rs`, `program/src/instruction.rs`, `program/src/processor.rs` (raw.githubusercontent.com, extraits ciblés) | [lu] |
| 2 | Idem, `clients/js-legacy/src/actions/amountToUiAmount.ts` | branche `main`, **commit non épinglé** (gap, cf. E) | [lu] |
| 3 | `solana.com/docs/tokens/extensions/scaled-ui-amount` | page « Scaled UI Amount » | [lu] |
| 4 | `solana.com/docs/tokens/extensions/scaled-ui-amount/issuer-guide` | « Issuer Guide » | [lu] |
| 5 | `solana.com/docs/tokens/extensions/scaled-ui-amount/integration-guide` | « Integration Guide » | [lu] |
| 6 | `solana.com/docs/rpc/http/getsignaturesforaddress` | doc RPC | [lu] |
| 7 | `solana.com/docs/rpc/http/gettransaction` | doc RPC | [lu] |
| 8 | `solana.com/docs/rpc/http/getaccountinfo` | doc RPC | [lu] |
| 9 | `docs.chainstack.com/docs/solana-archive-nodes-…` | page conceptuelle « archive nodes » | [lu] (muette sur `getAccountInfo` à slot passé) |
| 10 | `helius.dev/docs/rpc/historical-data` | « Historical Data Overview » | [lu] (muette sur lecture de compte à slot passé) |
| 11 | `helius.dev/docs/wallet-api/balance-at` | « balance-at » (Wallet API, bêta) | [lu] |
| 12 | `alchemy.com/blog/solana-account-archive` | billet « Solana Account Archive » | [lu] |
| 13 | `solanacompass.com/news/transaction-v1-simd-0385-…` | activation Transaction v1 | [lu] |
| 14 | Origine PR/issue ScaledUiAmount (`solana-labs/solana-program-library` #7511/#7525, nov. 2024) | mention via recherche, page non lue | [2nd] |

## (B) Règle ScaledUiAmount — pseudo-code (source #1, `scaled_ui_amount/mod.rs` ; `processor.rs` fonction lue verbatim)

Lecture (pure) — `impl ScaledUiAmountConfig` :
```
current_multiplier(t) = new_multiplier  si t >= new_multiplier_effective_timestamp
                       = multiplier     sinon
total_multiplier(decimals, t) = current_multiplier(t) / 10^decimals
ui_amount = amount × total_multiplier(decimals, t)
```
Comparaison **large (`>=`)**, vérifiée deux fois (lecture et écriture). Doc #3 (paraphrase) : avant `new_multiplier_effective_timestamp` on utilise `multiplier`, à partir de ce timestamp `new_multiplier` ; les conversions « are not guaranteed to round-trip exactly » (f64).

Écriture — `processor.rs::process_update_multiplier` (corps intégral lu) :
```
UpdateMultiplier(new_multiplier, effective_timestamp):
    new_multiplier_effective_timestamp <- max(effective_timestamp, 0)
    new_multiplier                     <- new_multiplier            # écrasement INCONDITIONNEL
    if clock.unix_timestamp >= effective_timestamp:                 # test sur le ts DE CET APPEL
        multiplier <- new_multiplier                                # repli immédiat
```
Le champ stocké `multiplier` n'est réécrit que lors d'un nouvel appel `UpdateMultiplier`, jamais par une lecture. Entre deux appels, `current_multiplier(t)` reste correct en lecture dynamique même si `multiplier` stocké est périmé.

Cross-check JS (#2) : `scaledAmount = amount × (multiplier / 10^decimals)` — identique.

## (C) Discriminants et layout (source #1, comptage manuel)

Deux espaces distincts :
- `ExtensionType::ScaledUiAmount = 25` (u16, `extension/mod.rs`) — tag TLV de l'état du mint.
- `TokenInstruction::ScaledUiAmountExtension = 43` (u8, `instruction.rs`, 45 variantes 0→44 ; dispatcher `processor.rs` route vers `scaled_ui_amount::processor::process_instruction(&input[1..])`).

Sous-instructions (`enum ScaledUiAmountMintInstruction`, `#[repr(u8)]`) : `Initialize = 0`, `UpdateMultiplier = 1`.

Layout `UpdateMultiplierInstructionData` (18 octets) :
```
[0]=43  [1]=1  [2..10)=multiplier f64 LE (PodF64)  [10..18)=effective_timestamp i64 LE (PodI64)
```
`InitializeInstructionData` : `[0]=43 [1]=0`, `authority: OptionalNonZeroPubkey` (32 o, tout-zéro = None — convention spl_pod, [abs] léger), `multiplier: f64 LE`.

État persistant `ScaledUiAmountConfig` (ordre exact) : `authority (32) · multiplier (f64 LE) · new_multiplier_effective_timestamp (i64 LE) · new_multiplier (f64 LE)` — ordre **différent** de l'instruction.

## (D) Reconstruction historique et coût

Méthode : scan **par mint**, jamais par autorité (#6 verbatim : signatures « that reference the supplied address in `accountKeys`, newest first »).
1. `getSignaturesForAddress(M, {limit:1000, before})` paginé jusqu'à page vide (`limit` max 1000 ; `before` / `until` définis #6).
2. Pour chaque signature : `getTransaction(sig, {maxSupportedTransactionVersion:1, encoding:"base64"})` — #7 : « Set it to 1 to also fetch v1 transactions — the value must be the JSON integer 1 ». Fait daté #13 [lu] : Transaction v1 activée mainnet epoch 1035, ~2026-09-15 01:04 UTC ; sans ce paramètre, erreur `-32015`.
3. Filtrer côté client : programme Token-2022, `data[0]==43`, `data[1]==1`, décoder f64 LE / i64 LE.
4. **Rejouer chronologiquement** chaque `(mᵢ, tsᵢ)` avec l'algorithme (B), jamais depuis un snapshot de compte (piège F-2).

Coût par mint : `⌈N/1000⌉` `getSignaturesForAddress` + **N** `getTransaction`, N = signatures **totales** référençant le mint (transferts checked, mint/burn…), pas seulement les `UpdateMultiplier`. Aucun filtre serveur par discriminant en RPC standard.

`getAccountInfo` à un slot passé : **non** en RPC standard (#8 : `minContextSlot` = plancher de fraîcheur, pas lecture rétrospective).

Fournisseurs archive : **Alchemy** [lu] étend `getAccountInfo` avec `slot` / `lastUpdateBeforeSlot` / `firstUpdateAfterSlot` (« State as of slot S (inclusive…) », couverture « back to July 2025 »), palier gratuit/payant non confirmé (contradiction [2nd]/[lu], E-4) ; **Chainstack** : page lue muette (not_found) ; **Helius** : `balance-at` = solde brut de wallet, inutilisable pour `multiplier(t)`.

## (E) Gaps et demandes de procurement formées
1. [not_found] Date/epoch d'activation mainnet de l'extension ScaledUiAmount (piste PR #7511 / issue #7525, [2nd]) → lire feature-gates Agave ou `CHANGELOG.md` de #1 ; usage : borner la date la plus ancienne d'un `UpdateMultiplier`.
2. [not_found] Chainstack : `getAccountInfo` à slot passé → lire la référence API (pas le blog) ou support ; usage : alternative d'infra pour -b3.
3. [gap] Client JS (#2) lu sur `main` sans commit → refixer sur le tag npm `@solana/spl-token` que Bell vendorisera.
4. [contradiction 2nd vs lu] Palier Alchemy account-archive → lire la page tarifaire officielle.
5. [not_found] Corps de `try_validate_multiplier()` (bornes de validité) — non bloquant.

## (F) Pièges pour Bell -b3
1. Deux espaces de discriminants (25 TLV vs 43 instruction).
2. « Idiosyncrasie » (#4 [lu]) : chaque `UpdateMultiplier` écrase inconditionnellement `new_multiplier`/`effective_timestamp` ; un second appel programmé avant l'échéance du premier efface le premier sans le figer ; correctif PR #522 mergé, « not live yet » au 2026-09-20 ⇒ **rejeu des instructions obligatoire**, jamais un snapshot.
3. Comparaison large `>=` en lecture et en écriture.
4. f64 IEEE-754 LE, aller-retour non garanti exact : ne pas re-sérialiser en décimal avant rejeu.
5. Transaction v1 (SIMD-0385) active depuis ~2026-09-15 : `maxSupportedTransactionVersion:1` obligatoire dans tout scan Bell.
6. Coût dominé par l'activité totale du mint, pas par le nombre de changements.
7. Helius `balance-at` : piège de nom.
8. Ordre des champs instruction ≠ état persistant : deux décodeurs.

## Chemins à ré-consulter
`https://github.com/solana-program/token-2022/blob/714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be/program/src/extension/scaled_ui_amount/{mod.rs,instruction.rs,processor.rs}` ; `…/program/src/{instruction.rs,processor.rs,extension/mod.rs}` ; `…/blob/main/clients/js-legacy/src/actions/amountToUiAmount.ts` ; `https://solana.com/docs/tokens/extensions/scaled-ui-amount` (+ `/issuer-guide`, `/integration-guide`) ; `https://solana.com/docs/rpc/http/{getsignaturesforaddress,gettransaction,getaccountinfo}` ; `https://www.alchemy.com/blog/solana-account-archive` ; `https://www.helius.dev/docs/wallet-api/balance-at` ; `https://docs.chainstack.com/docs/solana-archive-nodes-the-backbone-of-solanas-data-availability-and-developer-tooling`.
