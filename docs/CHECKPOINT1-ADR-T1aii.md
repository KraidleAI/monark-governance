# CHECKPOINT-1 — ADR-T1aii (Bell : collecteur faits iii-iv + jambe Ethereum ; course fondatrice Helius)
Rapport du validateur-humain `claude-fable-5-1` (instance séparée), 2026-09-19 ; ADR jugé sha256 `5a68dd3d549b…b11634` (commit `545e5d6`) ; persisté par l'orchestrateur ; corrections pliées dans l'ADR (section « Corrections checkpoint-1 »).

**Décision : APPROUVÉ-AVEC-CORRECTIONS (C-1..C-14) + deux ESCALADES CONDITIONNELLES (E-1, E-2) déclenchées seulement par le spike de -b. P3 confirmé : aucune décision investisseur requise aujourd'hui.**

## Mesures propres du validateur (Bash lecture seule, réseau public, aucune clé, aucun crédit Helius)
- `api.mainnet-beta.solana.com` : `getBlockTime(350000000)` = 1751210681 (2025-06-29), `getBlock` (signatures) et un corps `getTransaction` complet (`2Z18nPMJ…`, transaction Vote) ⇒ second archival réel pour 2025 (G1 §0 sous-estimait la profondeur « ~85-90 j »).
- `solana-rpc.publicnode.com` : `getTransaction` = `null`, `getBlock` = « cleaned up, first available block 447832277 » ⇒ pas un second.
- Mint TSLAx `getAccountInfo(jsonParsed)` : `scaledUiAmountConfig{multiplier:"1", newMultiplier:"1", newMultiplierEffectiveTimestamp:0}`, `supply:"22963688049331"` (= `getTokenSupply.amount`), `pausableConfig{paused:false}`, `permanentDelegate`.
- `fleet.ts` : 0 occurrence Bell/Kane (upcoming) ; `sessions.ts:34-35` : régimes `{overnight-weekday, weekend, holiday}`, pre/after `regime: null` ; `gap.ts:53` `no_fill_in_window` ; `digest.ts:27` `CLOSE_KEY` ; `rpc2.ts:117` `quorum2` non exporté ; `record.ts:22,58-60` URL dans erreurs/provenance ; `bell.test.ts` 18 tests, src 709 lignes / 7 modules.

## Corrections (liste fermée)
C-1 politique de quorum archival (Helius + mainnet-beta ; publicnode retiré ; signatures plein, corps plein ou échantillonné avec `quorum_sampled` et taux publié) · C-2 `quorum2` non exporté ⇒ (a) après U-1a-hard ou (b) `bell/quorum.ts` important `providerOf` (choix orchestrateur : b) · C-3 fait (iv) : source PoR nommée ou résidu · C-4 Token-2022 en RPC plain ; multiplicateur constant déclaré/vérifié ; items `pausableConfig.paused` (T-1b), `permanentDelegate` (T-2) · C-5 test série réduite non vacuous (VWAP + chaîne + `exceeds` depuis g_t épinglé, aucun close) · C-6 ADV ratio seul, garde étendue · C-7 tueur du ratio · C-8 seuils 1/2/5 % · C-9 carte fermée des résidus, `bell_abstentions_counted`, citation de fichier corrigée · C-10 fuite de clé par URL : `providerOf` seulement, test + mutant · C-11 bornes réduites par pool déclarées · C-12 items (g1) census xStocks (-b) / (g2) MWCB + Ondo re-formés par amendement ADR-B0 · C-13 CGU Helius avant fixtures · C-14 exclusion R-25 dans -a sur sous-dossier `series/`, seam Ethereum → -a2.

## Checklist
CA-1 correction (C-1..C-9) ; CA-2 conforme (aucune dépense, aucune surface, décisions 1-3/10/11/19/21 couvrent) ; CA-3 conforme ; CA-4 conforme (mono-agent, séquencé) ; CA-5 correction (C-10, C-11) ; CA-6/8/9/10 conformes sur le plan ; CA-7 correction (C-12, C-13) ; CA-11 conforme (état à déclarer) ; R-25/P1 : estimations optimistes (450 src), seam pré-déclaré ; P2 : régimes = code (`sessions.ts`), pas une décision de valeur ; P3 confirmé.

## Escalades conditionnelles
E-1 : quorum plein impossible sur mainnet-beta et échantillonnage jugé insuffisant ⇒ « second archival payant (Triton/QuickNode, coût X) ou quorum échantillonné déclaré ? ». E-2 : CGU Helius interdisant les fixtures dérivées ⇒ « série réduite hors dépôt (D9 seul) ou renégociation ? ».

## AM-1 (attrapé)
(1) liste de quorum de l'ADR fausse sur publicnode et non budgétée sur mainnet-beta ; (2) clé Helius fuirait par les URL dans erreurs/provenance du motif `record.ts` ; (3) `scaledUiAmountConfig`/`pausableConfig` lisibles en RPC plain — détour DAS inutile.

## Preuve AM-2 bis
Aucun octet écrit ; `git status --short` vide ; sha de l'ADR identique avant/après lecture.
