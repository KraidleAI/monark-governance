# G1+G2+G7 — Lot H3 (outil `attest`)

> Provenance consolidée. Rattachement G0 : ADR-M005 D1/D3/D7/D8/D9, PLAN §H3. Matérialisé par l'orchestrateur au merge. **checkpoint-2 = campagne** (M004 D15). **Complète la surface terminale : `attest·gate·cascade`.**

## G1 — Génération (worker `claude-opus-4-8[1m]`, R-20)
- `apps/harness/src/shogen-fixture.ts` (**niveau `src/`, `node:fs` autorisé**) : charge les 3 fixtures Shōgen commises (lot.cbor→Uint8Array, verdict.txt→texte, constat.json→objet), figées à l'import.
- `apps/harness/src/tools/attest.ts` (**PUR**, aucun I/O — K-8) : appelle `fromShogen` (I-b, importé de `@monark/monark`) sur la fixture commise → `AdapterOutput{price, provenance, label}` (K-1). Fail-closed (`isAdapterError`→`AttestToolError`, jamais un prix silencieux). Description : « projection of a committed Shōgen-verified witness (Binance BTCUSDT, self-notarized); the verifier is NOT executed at call time » — aucune revendication `live`/`probative` ; label démonstratif + provenance **hors** contrat gelé.
- Modifs : `schema-projection.ts` (ATTEST_INPUT/OUTPUT ; `price`=projection gelée), `registry.ts` (**set terminal `["attest","cascade","gate"]`**), `test/registry.test.ts`, `package.json` (`@monark/monark` + **réconciliation lockfile** : ajoute `@monark/monark` ET la dérive H2 `@monark/ukemi`), `packages/monark/src/index.ts` (re-export **additif** de la surface I-b). `packages/contracts`/`schemas` : 0 octet.

## G2 — Revue (relecteur `claude-opus-4-8[1m]`, fraîche ≠ générateur) — **PASS**
- **Oracle** : ci 140/140, lint 0, ratchet 92/92, lang-gate harness 0, grep 0 (105 fichiers), gelé 0 octet ; R-25 ~358 < 1205.
- **K-8** : `grep tools/**` I/O = **NONE** (loader au niveau `src/`) ; set terminal asserté.
- **Honnêteté (tranché GARDE SOLIDE)** : sur les octets réels — le jeton `verified` EST rendu au client (dans `Shōgen-verified`, descripteur passé) MAIS avec le disclaimer même-phrase « the verifier is NOT executed at call time » ; tout jeton probant **nu** (`live`/`verified`/`probative`) rougit. Le témoin commis porte un verdict valide (`fromShogen` rejette un verdict nié), l'outil n'exécute aucun vérificateur au call-time (K-8). Honnête, non trompeur.
- **Contrat gelé (K-1)** : `price` seul ⊨ `assertClosedAttestedPrice` + schéma gelé (ajv, drift-guard byte-for-byte) ; `label`/`provenance` hors `price` ; mutants M1/M3 rougissent.
- **Fail-closed** + **barrel additif** (crossAgentGate/MONARK_PHASE inchangés) confirmés.
- **Lockfile RÉSOLU** : `lock == package.json` prouvé structurellement (8 workspaces IN SYNC ; contrôle positif discriminant). **Réserve méthodo (G7)** : `npm ci --dry-run` retourne exit 0 même sur un arbre désynchronisé → non fiable pour une dérive de membre de workspace ; le `npm ci` réel de la CI de PR reste l'oracle final.

### Observations non bloquantes — DISPOSÉES (durcissement de garde d'honnêteté)
- **OBS-1 (largeur du masque, `error_origin=générateur`) — CORRIGÉ.** L'ancien masque `/Sh\S*gen-verified/` pouvait cacher un jeton probant dans un mot contigu forgé (`Sh<token>gen-verified`). **Fix** : classe macron **bornée** `[oŌō̄]{1,2}`. **Régression ajoutée** : `scrub("Shprobativegen-verified")` doit laisser `probative` visible (assertion verte). Non atteignable en langue naturelle ; artefact livré déjà propre.
- **OBS-2 (couverture des porteurs, `error_origin=générateur`) — CORRIGÉ.** `attest_makes_no_probative_claim` ne scannait que la description ; **étendu à TOUS les porteurs rendus** (description + `attestHonestyText()` MCP content + `DEMONSTRATIVE_LABEL`), avec une **2ᵉ phrase sanctionnée** (`not probative`) masquée avant scan (sinon le disclaimer honnête rougirait). Oracle re-passé **140/140**.
- **OBS-3 (méthodo)** : `npm ci --dry-run` non discriminant (ci-dessus) — note pour G7, pas un défaut H3.

## G7 (orchestrateur)
- **R-21** : oracle ré-exécuté post-OBS-1/OBS-2 — ci **140/140**, lint 0, ratchet 92/92, lang 0, grep 0, gelé 0 octet. Adjudication indépendante : `attest.ts` pur + honnête (lecture), K-8 NONE, barrel additif, frozen 0.
- **error_origin** : OBS-1/OBS-2 = générateur (conception/portée du test), corrigés avant merge ; lockfile = résolu (dérive H2 réconciliée par H3) ; OBS-3 = méthodo (note).
- **Résidus nommés** : seam SDK `tools/call` (gate/cascade/attest non exercés via `createHarnessHandler`) = **H5** (`probe_harness_records_real_decision`) ; méthodo `npm ci --dry-run` consignée.
- **G7 CLOS — merge H3.** Siège committeur `claude-opus-4-8` exception Opus-seat. **La surface terminale attest·gate·cascade est complète.** Prochain : **H4** (miroir HTTP/JSON + déploiement investisseur ; DNS `mcp.`/`api.` déjà posés).
