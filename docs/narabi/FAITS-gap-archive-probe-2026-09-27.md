# FAITS — NARABI-L-GAP-1 : sonde d'archive du pool public avant le tirage des 11 mois (orchestrateur `claude-fable-5-1`, 2026-09-27 00:47-00:55 UTC)

Go investisseur (décision 246, « GO ») ; précondition (ii) de la décision Q-1 : sonde bornée d'UN jour vieux de onze mois avant la boucle. Arbre propre `F:\tmp\narabi-gap-tree` (clone de `d974e81`), état scratch `F:\tmp\narabi-gap`, variables `CHAINSTACK_*` retirées (`env -u`), `MONARK_SENTINEL_J0=2025-10-15`. Scripts et sorties : `F:\tmp\narabi-gap-logs\` (`probe-archive.mjs`, `probe-day.mjs`, `diag-day.mjs`, `probe-sub.mjs`, JSON horodaté). Aucun retry automatique ; 21 + 6 + 11 + 6 = 44 appels JSON-RPC sans clé, 0 RU.

## 1. Essai à blanc du moteur (`run.ts --dry-run`, 00:47 UTC)
`stopped: "fetch_error:2025-10-15:windowFlow: quorum needs >= 2 live endpoints from 2 providers (last: method not available)"` ; `finalized` 26 065 214 ; `lag` 347 jours ; 11 s ; rien écrit.

## 2. Sonde par endpoint au bloc 23 586 600 (oct. 2025) — `eth_getBlockByNumber`, `eth_getLogs` (100 blocs, USDe), `eth_call totalSupply` à ce bloc [mesure]
| Endpoint | Bloc | getLogs archive | eth_call archive |
|---|---|---|---|
| `ethereum-rpc.publicnode.com`, `ethereum.publicnode.com` | ok | **403** « Archive requests require a personal token » | 403 idem |
| `eth.drpc.org` | ok | **400** « Can't route your request to suitable provider » (plage jour : « ranges over 10000 blocks are not supported on free plan ») | ok |
| `rpc.mevblocker.io` | ok | **ok** (365 logs) | ok |
| `1rpc.io/eth` | ok | -32602 « limited to 0 - 50 blocks range » | -32000 « historical state … is not available » |
| `eth.rpc.blxrbdn.com` | ok | -32000 « method not available » | -32000 « historical state … is not available » |
| `eth.api.pocket.network` | ok | **ok** (365 logs) | ok |
⇒ **deux fournisseurs d'archive seulement** : `mevblocker.io` et `pocket.network` (le quorum de deux exige exactement les deux).

## 3. Rejeu de `windowFlow` du moteur sur le jour 2025-10-15 (blocs 23 579 376 → 23 586 550, 7 175 blocs, topic Transfer) [mesure, 00:52 UTC]
- `rpc.mevblocker.io` : **9 706 logs** en une réponse.
- `eth.api.pocket.network` : « query exceeds max results 5000 » ⇒ découpe récursive du moteur : 4 375 + 2 897 + **0** logs (plage 23 581 170-23 582 963 rendue VIDE) = 7 272 ⇒ `QuorumDisagreementError: windowFlow: endpoints disagree on burns/mints` (comportement fail-closed correct du moteur).
- Contre-mesure (00:54 UTC), même plage 23 581 170-23 582 963, même requête : Pocket **2 434 / 0 / 2 434** logs sur trois appels consécutifs ; mevblocker 2 434 (et 2 897 + 2 434 + 4 375 = 9 706 : mevblocker cohérent avec lui-même).
- **Constat** : Pocket rend une réponse **bien formée mais vide** environ une fois sur trois sur une plage d'archive (un supplier de la session sans état d'archive répond `[]` au lieu d'une erreur) — illustration mesurée, sur nos propres données, du constat de l'étude Pocket (doc 15 §1 : aucune vérification du contenu, une réponse fausse bien formée est payée). Item **POCKET-LOSSY-LOGS-1** (Shōgen doc 15 addendum ; production Narabi : le quorum de deux protège, mais un jour peut manquer si Pocket est tiré en face de mevblocker ; le VPS a la jambe Chainstack).

## 4. Conséquence pour le tirage
Avec le pool public seul, chaque jour exige que Pocket tombe sur un supplier complet EN MÊME TEMPS que mevblocker répond : ≈ 2 chances sur 3 par tentative, sur ≈ 337 jours × plusieurs fenêtres par jour, sous une boucle bornée à 150 passes de 180 s ⇒ tirage long, aléatoire, et un jour bloqué possible. **STOP conforme à la règle** (« arrêt persistant sur un même jour ⇒ décision ; jamais d'élargissement du pool ni de jambe payante sans décision »). **Décision demandée à l'investisseur** : jambe Chainstack Ethereum (archive ; abonnement existant ; jambe prévue par le moteur sous le garde `@monark/rpc-guard` : plafonds 2 000 appels et 20 000 RU par passe, plancher de cycle lu 282 530 RU le 26/09 05:44Z, garde ×10) pour le tirage seulement ; estimation orchestrateur ≈ 5 à 10 appels par jour × 337 jours ≈ 2 000 à 3 500 appels, ordre de 50 000 à 100 000 RU au barème `chainstack-2026-09-21` (à mesurer au grand livre, jamais repris comme fait). Sans cette jambe : pas de tirage.
