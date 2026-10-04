# G7 du lot CM-3c-1 (contrat 1.1.0, bloc A)

- **Plan** : `docs/G0-lot-cm-3c-1.md` (commit `49b64c33`) ; plan r3 §8.3 (ligne A) et §8.4. Réponses à Q-1 et Q-3 : `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/avis/DECISION-PolicyRow-Q1-Q3.md` et `AVIS-advisor-PolicyRow-Q1-Q3.md` (table « colonne | type | obligatoire | source »), approuvées par MONARK (`recherches` `3e2fe0c`). Q-2 réglée par l'avance de la base.
- **Base** : `43d90ac9` (`base/chantier-moteur-2026-10-03`). **Gel** : `6bd1d1df` (branche `recherches/cm-3c-1`, non poussée).
- **Statut** : code écrit ; un garde rouge, `lang:gate`, sur trois identifiants de colonne fixés par la décision (Q-L ci-dessous). Reste la G2.

## Ce que le lot change

Tout dans `packages/contracts/src/`, aucun fichier de `schemas/`, aucun octet servi :
- `canonical.ts` : `canonicalJson`, `sha256Canonical`, `scoresSha256`, `requestSha256` (spec §2). Écart déclaré avec `canonicalRow` de `hikae` jusqu'au bloc C : seule la clé non ASCII les distingue.
- `tool-error-codes.ts` : `TOOL_ERROR_CODES`, 32 codes (les 24 de `HARNESS_ERROR_CODES` dans leur ordre, puis les 8 réservés). `gate.ts` réexporte la liste (`HARNESS_ERROR_CODES = TOOL_ERROR_CODES`, import l.36) ; le bloc l.266-279 garde ses 14 lignes, le commentaire nomme les 8 codes réservés et leur lot. `HarnessErrorCode` passe à 32 sans casse sous `tsc`.
- `policy-table.ts` : `QHAT_UNITS`, `REGION_RULES`, `ROW_STATUSES`, `STATEMENTS`, `CELL_KEY_RULES`, `SCORE_ORDERS`, `CHECK_OUTCOMES` ; `ClassEntry` (16 clés) et `PolicyRow` (60 clés), types dérivés des formes du contrôle ; `POLICY_ALLOWED_KEYS` ; `assertClosedClassEntry`, `assertClosedPolicyRow`, `assertClosedPolicyTable`. Un seul type de bloc pour `test`, `bridge` et `fwd`. Couplages de l'avis §1.5 tenus ; grammaires de valeurs laissées au garde.
- `index.ts` exporte le tout ; `calibDigest` et les types 1.0.0 restent.
- `test/contracts-frozen.manifest.json` ré-épinglé dans le même commit (D9-ter, ré-épinglage 1) : 3 fichiers neufs, `index.ts` changé ; compte de 7 schémas inchangé.

## Oracle

- `node scripts/red-proof.mjs --base 43d90ac9 --gel 6bd1d1df --repo /home/user/monark-governance-c3c1 --draw 15 --seed 37` (Node 24.21.0) : **OK**, 15 tests jugés (1 F2P, `harness_error_codes_are_a_closed_pinned_list` ; 14 new-module, `canonical.test.ts` et `policy-table.test.ts`), 5 inchangés, 15 tueurs tirés, **15 tués** ; `RED-PROOF.json` sha256 `01b11d7f…0490e`.
- Tueur `gate.ts:273` de `error-code.test.ts` ré-ancré en `packages/contracts/src/tool-error-codes.ts:8`, tué. `verifie-ancres.mjs` (`--ref 43d90ac9`) : 782 tueurs, 773 ANCRE, DERIVE 0, PERDU 9, les 9 déjà PERDU à la base (768 tueurs, 759 ANCRE). Aucune ancre existante ne bouge.
- `tsc --noEmit`, `eslint` (fichiers changés), `lint:ratchet` 69/69, `gate:vocab` (338 fichiers) : verts.
- `npm test` complet (Node 24.21.0, variables de proxy retirées) : 2 130 tests, 2 107 verts, 22 sautés, **1 rouge** : `export_public_no_governance_no_french` (test 42), même cause que `lang:gate`. `contracts_frozen` (les deux tests), `served-replay-cm3`, `harness-served` et `narabi-live` verts.
- `lang:gate` : **rouge**, 11 occurrences du mot `aux` dans `aux_seq`, `runs_aux` et `aux_sha256` (`policy-table.ts` l.75, 76, 83 ; `policy-table.test.ts`). Mesuré : avec ces trois termes dans `terms` de `scripts/lang-exempt.json`, `lang:gate` et le test 42 sont verts (essai annulé, fichier non touché).
- **R-25** (`r25()` contre `43d90ac9`) : **481 lignes comptées** (+464/−17, 9 fichiers ; borne du lot 547) ; contenu 0.

## Différences servies

Aucune. La liste des codes n'est servie nulle part ; les 24 premiers codes gardent leur ordre ; aucun lanceur neuf.

## Questions

**Q-L (MONARK) : exemption de langue de trois colonnes figées.** `aux_seq`, `runs_aux` et `aux_sha256` sont des noms de colonne fixés par la décision Q-1 (spec §10), donc gelés. Le mot `aux` est un mot français de la liste du garde. `lang-exempt.json` relève de la plume de l'orchestrateur (ADR-M004 D7 quater) ; je ne l'ai pas modifié, et je n'ai ni renommé ni masqué les colonnes. Proposition : ajouter les trois termes à `terms`, comme D7 quater l'a fait pour les identifiants gelés en collision. Sans cela, le bloc C (`schemas/policy-row.schema.json`, portée `schemas`) rougira aussi.
