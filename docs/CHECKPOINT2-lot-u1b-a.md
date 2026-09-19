# CHECKPOINT-2 — Lot U-1b-a (6ᵉ contrat gelé `AttestedBook`, zone gelée `schemas/` + `packages/contracts`)
Rapport du validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19, gel `b64ca1b` ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS (V-1..V-6, liste fermée, aucune ne touche `b64ca1b`) — SIGNATURE INVESTISSEUR DUE** (zone gelée, décision 16).

## Vérifications re-exécutées (copie `git archive b64ca1b` + `npm ci`, rien sur C:)
`npm run ci` **336/336** (gate:vocab 156, tsc 0) ; lint 0 ; ratchet 69/69 ; lang-gate 0 ; export:check 0 ; R-25 three-dot **589** ; manifest recomputé indépendamment : 15/15 concordent, `schemas/` = 7 ; **8/8 blobs identiques** (5 schémas gelés, `forbidden-keys.json`, `fleet.ts`, `narabi-copy.ts`) ; description D3 **871 caractères verbatim** ; amendement D2 : `*` = 1, `+` = 3, `number` = 0 ; `merge-tree` propre.
Mutants rejoués (restauration sha) : c1/c2 (abstain les deux sens) rouges ; e1 « verified » rouge ; e2 « proven » : honnêteté vert (regex flotte byte-identique `attest.test.ts:109`, doctrine M017 D6) mais **garde de gel rouge** ; g (`*`→`+`) rouge ; S1 (`subject` `+`→`*`) et S6 (`book_digest` hors `required`) : sémantique 31/31 vert, **gel rouge** — contraintes présentes et justes dans les octets gelés, garde hermétique. Sondes ajv indépendantes 14/14 (abstention D4 valide, `description:""` valide, `n_positions:"0"` rejeté = O-1, `schema_version` non figé = lignée) ; **deux non-contraintes** : (i) `residual` sans `no_third_party_verifier` accepté → V-6 ; (ii) `quorum.achieved` > fournisseurs accepté (assigné à l'adaptateur, D5).
**Arbres fusionnés réellement joués** : `u-1b-a + e-honnêteté` (`f40cd35`) → 338/338, oracle racine 2/2 ; `u-1b-a + e-registre` (`2b99591`) → 338/338, `ci-gates` 24/24 (par paires ; l'arbre triple est à rejouer à la fusion). Piège consigné : `node_modules` copié ⇒ faux rouge `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` — `npm ci` propre obligatoire.

## Checklist
CA-1/2/4/5 conformes (décisions (A)/(B) prises par l'investisseur, décision 20) ; CA-3 conforme (M001 Déc. 9 / Option A : re-baseline sans bump) ; CA-6 conforme ; **CA-7 correction V-3/V-4** ; CA-8 conforme + V-2 ; CA-9 conforme ; CA-10 conforme (589) ; CA-11 conforme (`fleet.ts` blob identique, upcoming partout, D7 tuyaux avec état) ; zone gelée gelable **sous V-5/V-6** ; schéma vs ADR conforme ; mutants suffisants pour le gel (O-2 re-ciblé U-1b-b) ; surface T0 **correction V-1**.

## Corrections (liste fermée, aucune ne modifie `b64ca1b`)
- **V-1** — régime `site[T0]` à déclarer dans la ligne de journal G7 et le message du commit de fusion (M013).
- **V-2** — ADR-U1b:98 cite `DECISIONS-investisseur-2026-09-19.md` sans chemin (hors dépôt) : citer `F:\PRODUITS\etude-2026-09-19\…` ou replier la décision 20 verbatim.
- **V-3** — inscrire K-1 (`attestor.key` placeholder), M017 union (U-4), U-1b-b, O-2, O-3 dans la **liste release** (décision 21 : code bloquant quel que soit le déclencheur) avec propriétaire ; K-1 Ukemi suit la décision 22 (clé sur VPS).
- **V-4** — O-2 + O-3 → U-1b-b ; O-5 : clore « non-défaut, aucun item » ou nommer l'ADR flotte d'extension de la regex PROBATIVE.
- **V-5** — ligne datée ADR-U1b D2 : `observed_at.clock` `pattern ^[ -~]+$ minLength:1`, `providers[].name` `minLength:1` (lignée attested-flow) — aucune contrainte gelée implicite.
- **V-6 (à trancher par l'investisseur à la signature)** — « `residual` always carries `no_third_party_verifier` » (description gelée, D2ter) **non imposé par le schéma**. (a) ligne D2ter « imposé par l'adaptateur » + test `fromAttestedBook` en U-1b-b ; (b) `"contains": {"const": "no_third_party_verifier"}` sur `residual` **avant gel** (re-baseline, nouveau SHA, G2 fraîche sur le delta). **Recommandation validateur (et orchestrateur) : (b)** — bon marché maintenant, bump `schema_version` + ADR plus tard.

## Signature investisseur due — objet exact
`schemas/attested-book.schema.json` sha LF `d5b1beeab23482322da59041b9e62874a74c4cd53f55d7b730a7c150975da3cd` et `test/contracts-frozen.manifest.json` sha LF `4d912d41…` à `b64ca1b`, **y compris l'amendement D2 pré-gel** (`+`→`*` sur `oracle_sources[].description`, décision orchestrateur postérieure au checkpoint-1, datée, `error_origin` rédacteur ADR-U1b, oracle + mutant g), plus le choix **V-6 (a)/(b)**. Pas d'ESCALADE (aucune décision de valeur nouvelle). État attendu : ADR-U1b « proposé » → basculé par le G7.

## AM-1 (attrapé hors des rapports)
`site[T0]` absent du commit ; fichier de décisions hors dépôt sans chemin ; décision 21 reclassant cinq items de code comme bloquants ; invariant `no_third_party_verifier` non imposé (V-6) ; deux contraintes de lignée absentes de la table D2 ; mutant « proven » exécuté ; S6 rejoué ; CI jouée sur les deux arbres fusionnés.

---
## Suite donnée par l'orchestrateur (2026-09-19)
V-2, V-4, V-5 pliées dans l'ADR-U1b (docs seuls, nouveau gel du lot sans changement de code — G2/checkpoint-2 sur `b64ca1b` restent valides pour le code) ; V-3 pliée dans CHANTIERS §E (liste release) ; V-1 appliquée au G7/fusion ; **V-6 et la signature = investisseur à son retour** (recommandation (b) ; si (b) : lot U-1b-a-bis = une ligne de schéma + re-baseline + G2 delta avant gel final).
