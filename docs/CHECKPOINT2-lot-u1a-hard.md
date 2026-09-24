# CHECKPOINT-2 (LIVRABLE) — lot U-1a-hard, gel `e8bcfe4` (base `a3f85f4`)
Rapport du validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 15:32 ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS** (V-1..V-5, liste fermée) ; pas d'escalade ; pas de refus.

## Oracle rejoué (copie `git archive e8bcfe4`, `npm ci --cache F:/tmp/npm-cache`, rien sur C:)
`npm run ci` : gate:vocab 157 · tsc 0 · **336/336** ; lint 0 ; ratchet **69/69** ; lang-gate root 0 ; export:check 0 ; `no_secret_in_repo` + `bell_no_secret_in_repo` 24/24 ; R-25 exact `ci.yml:52` **372** (`a3f85f4...e8bcfe4` et three-dot etude-suite, merge-base `a3f85f4`) ; mutants ukemi baseline 26/26 (piège : `vocab-banned.json` requis à la racine de la copie).
**Mutants rejoués (copie séparée, restauration sha)** : M4 un revert benche ⇒ fail 1 ; M5 `revertKey` ignore `data` ⇒ fail 1 ; M5b garde `!== "0x"` retirée ⇒ fail 1 ; M6 clause message retirée ⇒ fail 2 ; R1 retry sur `RpcError` ⇒ fail 1 ; **R2 retry infini ⇒ ✖ à 5 s MAIS processus jamais terminé (345 s, tué)** — sans `--test-timeout` ni `timeout-minutes` (mesuré : aucun dans `package.json`/`ci.yml`), une régression pend le job (limite GitHub 6 h) ; le « timeout 12 s » de la G2 est sans source ; la correction O-2 `{timeout:5000}` est insuffisante (mesuré) — correction juste : le stub sert 200 après N > `retries+1` tentatives ⇒ une boucle non bornée réussit et `count===3` échoue vite.
**Oracle `defaultCall`** : sonde du checkpoint-2 bis rejouée contre `e8bcfe4` : 7/7 = test in-repo ; baseline `034fbff9…`. **Garde M5b** : 6 paires des formes consignées ⇒ 6/6 `ConcordantRevertError` ; formes live cohérentes ; **mais la sortie brute de `gho-probe.mjs` n'est pas persistée** (table §5 non re-vérifiable) ⇒ V-5.
**Bug CLI `main()`** : reproduit — ancien garde OLD=false / NEW=true sur la machine ; `oldrec --cluster bogus` ⇒ sortie vide exit 0 (no-op silencieux) ; `e8bcfe4` ⇒ `FATAL unknown cluster` exit 1 ; `--retries -1` ⇒ fail-closed. **Finding nouveau** : l'ancien garde est aussi faux **sous POSIX** dès qu'un chemin porte un caractère percent-encodable (`/tmp/a b/` ↔ `%20`) ⇒ **guardable en CI Linux** (`probes/o1-crossplatform.mjs` : NEW=true / OLD=false) — l'énoncé G2 O-1 « inguardable » est faux.
**Journal** : aucune URL (`git grep` néant) ; sondes HTTP 400 / abort ⇒ `provider` = domaine ; **trou** : une 200 non-JSON (`record.ts:70 res.json()`) ⇒ `SyntaxError`, 1 tentative, **0 entrée de journal** (fail-safe mais « journal complet » faux).
**PIN + clés** : canonicaliseur indépendant : `a3f85f4` = `e8bcfe4` (omis, `fromBlock` < plancher) = `034fbff9…` ; `fromBlock=23000000` ⇒ `81dffe3e…` via `enumeration.from_block` ; census 12 top-keys / 43 chemins, différence ∅ ⇒ aucune clé nouvelle ; aucun littéral `"latest"`.
**D9** : `weth-live.json` `63f82134…` (77 448 o), `susde-live.json` `7864b6cc…` (26 311 o) = G1 ; compteurs = G1 ; `ukemi_sha 5b666ace…` = recompute sur 6 blobs ; aucune URL/clé ; formes : drpc 400 « free plan » 31/31 + « Can't route » 25/32 ; `eth_call code 3` mevblocker ×1, blastapi ×1.

## Checklist
CA-1 conforme ; CA-2 conforme (aucune décision de valeur ; lecture littérale de D3) ; **CA-3 correction V-2** (aucune ligne Tuyaux U-1a-hard dans ADR-EC) ; CA-4/5 conformes ; CA-6 conforme (tout rejoué) ; **CA-7 correction V-1** (D3 littéral : items de code bloquants) ; **CA-8 correction V-4** (incident CLI no-op sans `error_origin`) ; CA-9 conforme ; CA-10 conforme ; CA-11 conforme (aucun registre, recorder upcoming, fusions propres — intersections de fichiers vides avec etude-suite et t-1a-ii-a).

## Classification D3 (décision 21, littérale)
**Bloquants avant release (code/test)** : (a) `export function isMainModule(argv1, metaUrl)` + tueur cross-plateforme « chemin avec espace » ; (b) refonte du stub de `ukemi_record_retry_is_bounded` (succès au-delà de `retries+1` ⇒ rouge rapide) + `--test-timeout` dans le script `test` / `timeout-minutes` dans `ci.yml` ; (c) plafond backoff ; (d) garde `res.json()` + entrée de journal pour une 200 non-JSON ; (e) drpc 400 « free plan » : bencher sans splitter ; (f) oracle de non-chevauchement/dédup inter-chunks. **Non bloquants (notes de release)** : retry live sous charge ; book plein deploy→B (U-6) ; forme inédite `isRpcRevert` (conditionnel) ; digests bornés = sous-ensembles ; `--out` par défaut sur `os.tmpdir()` = discipline machine.

## Corrections (liste fermée)
- **V-1 (code → worker Opus 4.8, G2 fraîche)** : lot **U-1a-hard-2** = (a)-(f), bloquant avant release.
- **V-2 (doc ADR-EC)** : ligne Tuyaux U-1a-hard (entrée RPC keyless quorum-2 ; sortie artefact D9 hors dépôt ; aucun chemin servi ; état recorder upcoming U-6 ; tests `ukemi-record.test.ts` (6) + `ukemi_default_call_classifies_rpc_errors`).
- **V-3 (doc CHANTIERS §E)** : ligne durcissement à jour + sous-items avec état D3.
- **V-4 (CA-8, G7)** : `error_origin` de l'incident CLI no-op (wrapper hors dépôt, U-1a) dans `G7-lot-u1a-hard` ; corriger dans `G2-lot-u1a-hard.md` « timeout CI 12 s » et « inguardable sous CI Linux ».
- **V-5 (provenance)** : persister la sortie brute de `gho-probe.mjs` avec sha (déclencheur G1 §10 item 4).

## AM-1
Attrapé : R2 = pendaison (pas un rouge) ; O-1 guardable cross-plateforme ; trou `res.json()` ; `error_origin` absent ; Tuyaux ADR-EC absente ; sortie brute §5 non persistée. **Manqué par ce siège au checkpoint-2 bis** : la CLI U-1a committée n'avait jamais été lancée telle quelle ⇒ règle apprise : **un checkpoint-2 lance la CLI officielle au moins en mode fail-closed hors ligne (`--cluster bogus` ⇒ exit 1 attendu)**.
Artefacts : `F:\tmp\cp2-u1ahard\` (tree/, mut/mutant-driver.mjs, probe-defaultcall.mjs, probe-pin-keys.mjs, probe-m5b-json.mjs, probes/guard-repro.mjs, probes/o1-crossplatform.mjs, gates.log, oldrec/, oldtree/).

---
## Suite donnée par l'orchestrateur
V-2/V-3 pliées (ADR-EC Tuyaux, CHANTIERS) ; V-1 = lot **U-1a-hard-2** lancé (worker) sur `lot/u-1a-hard` ; V-4 au G7 ; V-5 dans le brief du worker ; règle §F « le checkpoint-2 lance la CLI officielle » ajoutée ; note G2 corrigée par annotation (pas de réécriture).
