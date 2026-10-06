# G0 - lot R25-ASSET-PNG-HARDEN-1 (taille exacte des morceaux PNG de taille fixe, un seul de chaque, plafond absolu de décompression)

- **Mission** : items **R25-ASSET-FIXED-CHUNK-SIZE-1** et **R25-ASSET-INFLATE-CAP-1**, constats 2 et 3 (NOTE) de la G2 fraîche de R25-ASSET-STRUCTURE-1 (#177), pièce `coordination/pieces/2026-10-04-G2-recherches/G2-r25-asset-structure-1.md`. **Durcissement, pas fermeture** : R25-ASSET-POLYGLOT-1 et R25-ASSET-FREE-FIELD-1 restent ouverts (décision (i) de MONARK inchangée).
- **Branche** : `recherches/r25-asset-png-harden-1`, depuis le tronc `origin/lot/etude-suite` = `a0f59fcd` (fusion de #178 ; #177 fusionné en `74120213`). Aucun rebase ; une avance du tronc entre par un commit de fusion. Aucune PR (fusion après T0, à la main de MONARK).
- **Statut** : G0 et tests rouges ; gel ensuite ; compte rendu au G7 `docs/G7-lot-r25-asset-png-harden-1.md`.

## 1. Existant mesuré (tronc `a0f59fcd`, Node 24.21.0, lecture par objets)

| Mesure | Résultat |
|---|---|
| Actifs déclarés (`BINARY_ASSETS`) | 45 : 37 `.ots`, 5 `.ttf`, 1 `.cbor`, 1 `.jpg`, 1 `.png` ; **0 refusé** (nombre magique et structure) |
| Morceaux de `out/logo.png` (seul PNG) | `IHDR(13) iCCP(264) IDAT(28879) IEND(0)` ; 512 x 512, type 6, taille des pixels 1 049 088 octets |
| Constat 2 de la G2 | un `gAMA` de 65 000 octets de texte (spec : 4) passe `ASSET_STRUCTURE.png` ; idem `cHRM`, `sRGB`, `pHYs`, `sBIT`, `IEND` non vide ; deux `gAMA` passent |
| Constat 3 de la G2 | `maxOutputLength` = taille déclarée par `IHDR`, sans borne absolue : un en-tête 16384 x 16384 fait allouer 268 Mo à `inflateSync` (échec fermé par OOM au pire, jamais un « pass ») |

## 2. Construction (`scripts/lot-size-integration.mjs`, lignes changées **sur place** : aucun tueur existant décalé)

Taille des morceaux, selon la spécification PNG (ISO/IEC 15948), pour les morceaux de la liste fermée **dont la taille est fixée** :

| Morceau | Taille | Note |
|---|---|---|
| `IHDR` | 13 | déjà tenu (premier morceau, lu à 13, second refusé) |
| `IEND` | 0 | |
| `gAMA` | 4 | |
| `cHRM` | 32 | |
| `sRGB` | 1 | |
| `pHYs` | 9 | |
| `sBIT` | type 0 : 1 ; 2 : 3 ; 3 : 3 ; 4 : 2 ; 6 : 4 | selon le type de couleur |
| `bKGD` | type 0 et 4 : 2 ; 2 et 6 : 6 ; 3 : 1 | selon le type de couleur |
| `tRNS` | type 0 : 2 ; 2 : 6 ; 3 : au plus un octet par entrée de `PLTE` déjà lue ; 4 et 6 : interdit | bornes du spec |
| `PLTE`, `iCCP`, `IDAT` | variables | **laissés** (champs libres, R25-ASSET-FREE-FIELD-1) |

- Table exportée `PNG_SIZES` (nombre, ou tableau indexé par type de couleur), sur la ligne de `PNG_CHUNKS` ; dans `png`, un morceau de la table à une autre taille est refusé `chunk <t> of <n> bytes`.
- **Un seul de chaque morceau, `IDAT` excepté** (spec : `IHDR PLTE IEND tRNS gAMA cHRM sRGB iCCP pHYs bKGD sBIT` au plus une fois). Sans cette règle, la taille fixe se contourne par 16 250 `gAMA` de 4 octets ; ajoutée au titre du même item (une condition), voir Q-1.
- **Plafond absolu** `PNG_INFLATE_MAX = 2 ** 26` (64 Mio) : une taille de pixels déclarée au-delà (ou non calculable) est refusée `pixel data size` **avant** `inflateSync`, donc avant toute allocation. Le logo du tronc pèse 1 Mio de pixels.

`ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs` et le workflow public dérivé : **inchangés** (l oracle appelle `refusals` de son propre module). `.d.mts` : les deux exports.

## 3. Tests rouges d abord (`test/r25-integration.test.ts`), puis tueurs

Fixtures : le logo du tronc lu par objet et changé en mémoire, ou des images construites en mémoire (`pngOf`, `pngChunk`, `beforeIend` du lot #177). **Aucun fichier binaire ajouté.**

| # | Test | Attendu au gel | À la base |
|---|---|---|---|
| T-11 | `r25s_png_fixed_size_chunks_have_their_spec_length` | `gAMA` 4, `cHRM` 32, `sRGB` 1, `pHYs` 9 admis ; `gAMA` de 65 000 octets de texte, `gAMA` 5, `cHRM` 33, `sRGB` 2, `pHYs` 10, `IEND` d un octet refusés | refusés admis : rouge par assertion |
| T-12 | `r25s_png_colour_chunks_fit_the_colour_type_once_each` | `sBIT`/`bKGD`/`tRNS` admis à la taille de leur type (gris, couleur vraie, palette, couleur vraie et alpha) et refusés à une autre ; `tRNS` en type 6, plus long que la palette ou avant elle refusé ; second `gAMA` refusé ; deux `IDAT` admis | idem |
| T-13 | `r25s_png_pixel_data_is_capped_before_inflating` | 8191 x 8192 gris (64 Mio exactement) admis ; une ligne de plus refusée `pixel data size` ; en-tête 16384 x 16384 à flux court refusé | la ligne de plus passe : rouge |

Tueurs (forme close, au-dessus de chaque `test(`, lignes du gel) : 12 prévus, chacun tiré à la main (restauration vérifiée par sha256). Les cas « admis » de T-11 et T-12 sont verts à la base : les tests ne refusent rien de ce que le spec admet.

## 4. R-25 du lot

Prévu : module ≈ 6 lignes changées sur place (0 insertion nette), `.d.mts` 1, tests ≈ 40 : **≈ 50 sous 547**.

## 5. Windows

Lecture par objets ; fixtures en mémoire ; aucun nom réservé ; aucun saut `win32`. T-13 alloue 64 Mio de zéros et les compresse (≈ 0,3 s) : sans effet de plateforme.

## 6. Questions pour MONARK (avec mes défauts)

- **Q-1 (unicité)** : **défaut : un seul de chaque morceau sauf `IDAT`** (spec), car sans elle la taille fixe se contourne par répétition ; 0 refus au tronc. Variante : tailles seules (la capacité reste ≈ 4/16 du blob).
- **Q-2 (plafond)** : **défaut : 64 Mio** (`2 ** 26`), proposé par la G2 ; le logo en pèse 1. Variante : 16 Mio (un logo 2048 x 2048 RVBA tient encore).
- **Q-3 (`tRNS` en type 3)** : **défaut : `PLTE` avant `tRNS`** (spec), au plus une entrée par couleur de la palette. Ordre des autres morceaux (`IDAT` consécutifs, `PLTE` avant `IDAT`) : non contrôlé, résidu chiffré au G7.
- **Q-4 (ADR)** : une ligne datée « complément » à la fin de D9 quindecies (règle inchangée).
