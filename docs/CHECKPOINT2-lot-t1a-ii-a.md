# CHECKPOINT-2 (LIVRABLE) — lot T-1a-ii-a (Bell collecteur faits iii-iv + jambe Ethereum), gel candidat `a52f67c` (base `88c3324`)
Validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2-t1aiia\` (AM-2 ter) ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS — V-1..V-3 code bloquantes (pli worker → G2 delta → checkpoint-2 bis borné), items O-8..O-11 formés.**

## Oracle rejoué
`npm run ci` **337/337** (vocab 162, tsc 0), lint 0, ratchet 69/69, lang-gate 0, export:check 0, `no_secret_in_repo` + `bell_no_secret_in_repo` verts. Divulgation : un run concurrent avec l'oracle de l'arbre fusionné a donné 332/333 (`apps/harness/test/server.test.ts`, port loopback fixe) — artefact d'environnement, `server.test.ts` seul 5/5 ⇒ **règle §F : jamais deux oracles en parallèle sur une machine quand un test lie un port fixe**.
**Arbre fusionné** (`c2199f0` × `a52f67c`, résolution `ci.yml` UNION dans un clone) : `npm ci` frais, **343/343**, ratchet 69/69, lang-gate 0, export:check OK, R-25 1 139 sous la ligne fusionnée. Conflit `ci.yml` seul ; `test/ci-gates.test.ts` auto-fusionné et prouvé.

## C-1..C-14 ⇔ code (lu)
C-1 `PUBLIC_SOLANA` mainnet-beta seul, défaut épinglé ⇒ `NoQuorumError`, mutant publicnode RED ; CLI sans clé ⇒ `no_quorum: 2` fail-closed. C-2 `quorum.ts` importe `providerOf` seul ; `ethereum.ts` importe `makeUkemiPool.getLogsRange`. C-3 `POR_SOURCES`, `por_unavailable`. C-4 Token-2022 RPC plain. C-5 recompute indépendant : Σ|base| 193 751 892, Σ|quote| 705 693 060, **vwap 364.2251194119**, g_t −0.0007544151 = G2. C-6 `vol_ratio` + `multiplier_unit` seuls, garde CLOSE_KEY (mutant RED). C-7 tueur ADV RED. C-8 seuils 1/2/5. C-9 union + liaison type (mutant RED). **C-10** : grep arbre UUID/`api-key`/`helius-rpc.com` = 0 hors détecteurs et fixtures de test ; `bell-out` scan = 0 ; mutants W1/W4 RED. C-11/C-12 différés -b (G1 §8). **C-13** : aucun artefact Helius ; fixtures re-sha = PROVENANCE ; `getAccountInfo` live mainnet-beta = fixture (owner/decimals/authorities/scaled/pausable/permanentDelegate) ; `getTransaction` de la 1ʳᵉ signature rejoué ⇒ deltas = ligne 1 de la série. C-14 `series/` seul exclu. 14 shas LF recalculés = PLI/G1.
**Mutants** : W1-W6 worker RED ; G2 7/8/9a/9b RED ; O-1 RED ; V1 (validateur) RED. **Sondes vertes = trous** : V2 `isSolRevert` sans exclusion −32005/−32004/−32603 ; **V3 `shares = tokens` (multiplicateur ignoré dans la VALEUR du ratio) vert** ; V4 `quorum_sampled` jamais émis (= O-6) ; V5 `BELL_SOLANA_RPC` ignoré.
**CA-11** : `fleet.ts` blob identique, Bell `upcoming` ; `assertOutsideRepo` câblée (9b RED) ; **CLI officielle hors ligne (§F)** : `--out` sous l'arbre ⇒ exit 1 (majuscule, minuscule, racine) mais stderr = `FATAL transport` (raison effacée par `statusOf`) ; **`--pools ZZZ` ⇒ exit 0** avec `state.json` vide ; **`--window-days abc` ⇒ exit 0**, `from_utc_ms: null` (NaN ⇒ `bt < NaN` toujours faux ⇒ pagination jusqu'à `maxPages` sur chaque fournisseur puis filtre vide ⇒ **course Helius payée pour rien**) ; `--pools TSLAon --eth` sans bornes ⇒ exit 0, `symbols=0`. Journal `"quorum": 2` **codé en dur** avec `providers: ["solana.com"]`.
**Run réel** : scan fuite 0 ; `bell_sha e30ed838…` recalculé = identique ; 0 crédit Helius, 4 appels publics.
**R-25** : (A) pathspec etude-suite 1 236 ; (B) lot seul 1 190 ; **(C) UNION 1 139** — **licite** (deux exclusions déjà décidées : D9 septies décision 25 ; D9 sexies + C-14 `series/`) ; seule résolution qui passe les deux tests.
**C-6 dérivabilité ADV** : ESC-1 (c) accepte la recomposition et ne protège que le verbatim ; `vol_ratio` 10 décimales ⇒ ADV recouvrable moins précisément que le close déjà admis ⇒ conforme a fortiori, **amendement C-6 à consigner dans l'ADR au G7**.

## Checklist
CA-6 conforme ; **CA-7 correction** (V-1..V-3 code) ; **CA-8 correction** (`error_origin` G2-delta C-1 = orchestrateur, base non rebasée après D9 septies ; V-1/V-2/V-3 = générateur + co-origine planificateur, §F non citée dans la mission) ; CA-9 conforme ; CA-10 conforme ; **CA-11 correction** (V-1/V-3).

## Corrections (liste fermée)
- **V-1 (code, bloquante)** : CLI fail-closed — symbole `--pools` inconnu, numérique NaN (`--window-days abc`), `--eth` sans bornes valides quand TSLAon demandé ⇒ **exit 1** avec message ; motif O-2 : fonction pure `parseArgs(argv, knownSymbols)` + test + preuve de câblage + mutants « inconnu accepté » / « appel retiré » rouges.
- **V-2 (code, même pli)** : `journal.quorum: 2` / provenance constante ⇒ `quorum_required: 2` + `providers_distinct` dérivé ; `bell_sha` fixture `4375042c…` inchangé.
- **V-3 (code, même pli)** : `main().catch` — erreur locale préfixée `bell/collect:` ⇒ message verbatim ; erreur réseau ⇒ `statusOf` (scrub conservé).
- **Bis borné** : CLI cas a/b/b2 exit 1 lisible, c/e/TSLAon-sans-bornes exit 1, d journal honnête ; oracle 337+N ; `bell_sha` inchangé ; mutants du pli seuls ; `merge-tree` × nouveau gel = `ci.yml` seul ; pli ≤ 60 lignes.
- **Items formés (code ⇒ bloquants release Bell)** : O-8 tueur C-7 sur la valeur de `vol_ratio` sous multiplicateur ≠ 1 ; O-9 test `isSolRevert` codes transport ; O-10 test `solanaEndpoints` override env ; O-11 test d'intégration hors ligne de la jambe Ethereum (stub `eth_getLogs`/`eth_getBlockByNumber` → `liveEthSwaps` → `collect`) — déclencheur : avec O-6, avant -b.
- **Fusion (orchestrateur)** : `ci.yml` en UNION, compter les marqueurs, compléter le bloc commentaire (racine série Bell) ; corriger PLI §5, typos `F:\tmp\bell-out` (ADR l.42, G1 §8), CHANTIERS « non committé » périmé ; amendement C-6 ADV ; E-1 ⇔ décision 38.

## AM-1 / AM-2
Attrapé : no-op silencieux de la CLI committée (pool inconnu, NaN, `--eth` sans bornes) invisible aux G1/G2/delta ; `quorum: 2` constante ; raison de garde effacée ; trois trous de couverture ; oracle de l'arbre fusionné jamais exécuté avant. **Divulgation** : `git merge-tree --write-tree` a écrit un objet tree pendant (`07fb7880…`) dans `F:\Monark\.git\objects` (aucune ref, prunable) — un octet dans le dépôt contre la lettre d'AM-2 ; répétitions faites dans un clone. `git status` vide avant/après.

---
## Suite donnée par l'orchestrateur
V-1/V-2/V-3 = pli **T-1a-ii-a-2** (worker) → G2 delta → checkpoint-2 bis borné → G7 + fusion UNION ; O-8..O-11 portés dans CHANTIERS ; règle §F « pas deux oracles en parallèle avec port fixe » ajoutée.
