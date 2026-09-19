# CHECKPOINT-2 bis (borné) — lot U-1b-a / U-1b-a-bis, gel candidat `28747e0` (→ `90b891d` après C-3 doc) sur `lot/u-1b-a`
Validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2bis-u1b\` (AM-2 ter, git d'écriture dans le clone seulement) ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS (C-1..C-3, docs seules, aucune ne touche le gel ni l'objet de signature) — la signature investisseur peut être prise dès maintenant.**

## Objet exact de la signature (recomputé par le validateur à quatre révisions, disque = blobs)
- `schemas/attested-book.schema.json` sha LF **`8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b`** (5 870 o, LF pur, blob `208b920`)
- `test/contracts-frozen.manifest.json` sha LF **`d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066`** (1 615 o, blob `f2c72c6`)
Lignée : `4a15e5b` = `b64ca1b` = `d5b1bee…`/`4d912d41…` (byte-inchangée) ; seule différence = `residual.contains = {"const": "no_third_party_verifier"}`.

## Mesures
1. Delta `4a15e5b→HEAD` : 2 commits, 6 fichiers (RAPPORT, ADR 2 lignes, `schema.test.ts` +18, schéma +1, manifest 1 valeur, en-tête `contracts-frozen.test.ts` +2 commentaire, hors manifest gelé). Le commit `28747e0` (orchestrateur, hors périmètre G2 delta) couvert par lecture directe.
2. Mutant M1 (ligne `contains` retirée) ⇒ sha revient à `d5b1bee…`, `schema.test.ts` ROUGE et `contracts-frozen` ROUGE ; restauration ⇒ `8ba71122…`. Sondes ajv indépendantes 12/12 (abstention D4 couplée/découplée, `description:""`, `contains` 1 et 2 éléments, minItems, enum, doublon, `clock:""` rejeté V-5).
3. Oracle `git archive HEAD` : **337/337**, lint 0, ratchet 69/69, lang-gate 0, export:check 0.
4. Arbre composé (clone) `etude-suite 47ac040` + `u-1b-a 28747e0` : **0 conflit** (seul fichier commun `README.md`, fusionné proprement), **343/343** = 326 (merge-base) + 11 (lot) + 6 (etude-suite) ; `visage_register_is_frozen`, `contracts_frozen` verts.
5. CA-11 : `fleet.ts` blob HEAD = merge-base ; README/roadmap/how « upcoming until served » ; aucune pièce built nouvelle ; D7 3 tuyaux déclarés.
6. V-1 portée (`site[T0]` au G7/fusion) ; V-2 pliée (le fichier `F:\PRODUITS\etude-2026-09-19\DECISIONS-investisseur-2026-09-19.md` **existe**, décisions 1-25, décision 20 verbatim) ; V-4/V-5 pliées ; V-3 : propriétaires manquants (C-1).
7. R-25 `lot/etude-suite...lot/u-1b-a` pathspec `ci.yml:52` : **606** ≤ 1 205.

## Corrections (liste fermée, docs)
- **C-1** CHANTIERS l.19/l.76 : objet de signature périmé (`d5b1bee…`) et « V-6 à trancher » contredits par la décision 33 ; propriétaires à nommer pour « M017 union » et « U-1b-b ». `error_origin` orchestrateur. **Pliée.**
- **C-2** CHANTIERS l.70 : « aucun fichier `DECISIONS-investisseur-2026-09-19.md` n'existe » est **faux** (il existe, décisions 1-25) ; le registre CHANTIERS est le seul enregistrement des décisions 26+. `error_origin` orchestrateur. **Pliée.**
- **C-3** ADR-U1b D7 : `attested_book_roundtrip` et `attested_book_canonical_deterministic` étiquetés **livrables U-1b-b** (absents à HEAD par construction). `error_origin` rédacteur ADR-U1b. **Pliée** (commit doc sur `lot/u-1b-a`).
- V-1 portée ; O non bloquant : titre du garde `contracts-frozen.test.ts:61` cite « ADR-U1b D1 » sans D2ter (appréciation G7 : « ADR-U1b » couvre l'amendement, laissé tel quel).

## AM-1
Attrapé : commit hors périmètre G2 ; objet de signature périmé dans CHANTIERS ; affirmation d'inexistence fausse (fichier V-2 présent) ; V-3 sans propriétaires ; D7 non étiquetée ; recompte exact 326→337/332→343 ; R-25 606.
Preuve R-20/AM-2 ter : `git status` vide sur `F:\Monark` et `F:\Monark-wt-u1b` avant/après ; sha avant = après.

---
## Suite donnée par l'orchestrateur
C-1/C-2/C-3 pliées ; **signature investisseur demandée** sur le couple `8ba71122…` / `d50f5c51…` ; à la signature : G7 (`site[T0]` dans la ligne de journal et le message de fusion) et fusion sur `lot/etude-suite`.
