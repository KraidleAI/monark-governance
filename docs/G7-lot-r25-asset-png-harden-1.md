# G7 - lot R25-ASSET-PNG-HARDEN-1 (taille exacte des morceaux PNG de taille fixe, un seul de chaque, plafond absolu de décompression)

- **Session** : RECHERCHES, 2026-10-06. Branche `recherches/r25-asset-png-harden-1`, depuis le tronc `lot/etude-suite` à `a0f59fcd` (fusion de #178 ; #177 en `74120213`). Aucun rebase, aucune PR : fusion **après T0**, à la main de MONARK. Aucun Z-3 : aucun octet servi ne change.
- **Plan** : G0 `docs/G0-lot-r25-asset-png-harden-1.md` (commit `97a17ce1`). Source : G2 fraîche de R25-ASSET-STRUCTURE-1, constats 2 et 3 (pièce `coordination/pieces/2026-10-04-G2-recherches/G2-r25-asset-structure-1.md`).
- **Items touchés** : **R25-ASSET-FIXED-CHUNK-SIZE-1** et **R25-ASSET-INFLATE-CAP-1**, livrés. R25-ASSET-POLYGLOT-1 et R25-ASSET-FREE-FIELD-1 restent ouverts (décision (i) de MONARK inchangée). L ETAT reste à la main de MONARK.
- **Intention tenue** : un morceau PNG dont la spécification fixe la taille n a que cette taille, n apparaît qu une fois, et aucune image déclarée au-delà de 64 Mio de pixels n est décompressée. **0 refus sur les 45 actifs du tronc, à la base comme au gel.**

## 1. Commits

| Commit | Rôle |
|---|---|
| `97a17ce1` | G0 et tests rouges (trois `r25s_`), poussé seul d abord |
| `b4a10021` | gel : `PNG_SIZES`, `PNG_INFLATE_MAX`, un seul de chaque morceau sauf `IDAT`, plafond avant `inflateSync` ; `.d.mts` ; complément daté de D9 quindecies |
| `055bc4fa` | la règle « une seule fois » refuse aussi un second `IHDR` : la clause `(t === "IHDR" && o !== 8)` devenait un mutant équivalent (son tueur dans `r25s_png_ends_at_iend_with_sound_chunks` survivait au tir à la main) ; clause retirée, tueur ré-visé sur la clause d unicité (tué) |
| ce commit | G7 |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | **7 lignes changées sur place, 0 insertion nette** (aucun tueur existant décalé) : l.254 `PNG_SIZES` et `PNG_INFLATE_MAX = 2 ** 26` sur la ligne de `PNG_CHUNKS` ; l.258 commentaire de `png` ; l.260 `seen = new Map()` ; l.265 un seul de chaque morceau sauf `IDAT` (le second `IHDR` y compris) ; l.266 taille de la table, par type de couleur, `tRNS` en palette au plus `PLTE / 3` ; l.267 `seen.set(t, n)` ; l.271 `if (!(size <= PNG_INFLATE_MAX)) return "pixel data size"` avant `inflateSync` |
| `scripts/lot-size-integration.d.mts` | `PNG_SIZES`, `PNG_INFLATE_MAX` |
| `test/r25-integration.test.ts` | trois tests `r25s_` et un helper (`splitIdat`) ; un tueur existant ré-visé (section 1) |
| `docs/adr/ADR-M003-phase2-integration.md` | **Complément à D9 quindecies**, daté du 2026-10-06, à la fin du fichier (règle inchangée) |

`ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs`, le workflow public dérivé : **inchangés** (aucun fichier sous `.github/` ni `scripts/oracle/` dans le diff ; le module n est pas dans la liste blanche de `scripts/export-public.mjs`).

### 2.1 Tailles tenues (spécification PNG)

| Morceau | Taille | Laissé variable |
|---|---|---|
| `IHDR` | 13 (déjà tenu : premier morceau lu à 13 ; un second est refusé par l unicité) | |
| `IEND` 0, `gAMA` 4, `cHRM` 32, `sRGB` 1, `pHYs` 9 | fixes | |
| `sBIT` | gris 1, couleur vraie 3, palette 3, gris et alpha 2, couleur vraie et alpha 4 | |
| `bKGD` | gris et gris alpha 2, couleur vraie et couleur vraie alpha 6, palette 1 | |
| `tRNS` | gris 2, couleur vraie 6, palette au plus une entrée par couleur de `PLTE` déjà lue (donc `PLTE` avant `tRNS`), avec alpha interdit | |
| `PLTE`, `iCCP`, `IDAT` | | champs libres (R25-ASSET-FREE-FIELD-1) |

Mesure du constat 3 (scratchpad `png/bomb.mjs`, en-tête 16384 x 16384 gris, `IDAT` = `deflate` de 268 Mo de zéros, blob 1,17 Mo) : **base** accepté, 405 ms, +523 Mo de RSS ; **gel** refusé `pixel data size`, 18 ms, +7 Mo.

## 3. Tests et tueurs (numéros de ligne du gel)

| Test | Ce qu il tient | Tueurs |
|---|---|---|
| `r25s_png_fixed_size_chunks_have_their_spec_length` | `gAMA` 4, `cHRM` 32, `sRGB` 1, `pHYs` 9 admis ; `gAMA` de 65 000 octets de texte, `gAMA` 5, `cHRM` 33, `sRGB` 2, `pHYs` 10, `IEND` d un octet refusés | `:266`, `:254` (x3) |
| `r25s_png_colour_chunks_fit_the_colour_type_once_each` | `sBIT`/`bKGD`/`tRNS` admis à leur taille en gris, couleur vraie, palette, couleur vraie et alpha ; autre taille, `tRNS` avec alpha, plus long que la palette ou avant elle refusés ; second `gAMA` refusé ; deux `IDAT` admis | `:265` (x2), `:266`, `:254` (x3) |
| `r25s_png_pixel_data_is_capped_before_inflating` | 8191 x 8192 gris (64 Mio exactement) admis ; une ligne de plus refusée `pixel data size` ; en-tête 16384 x 16384 à flux court refusé | `:254`, `:271` |

**12 tueurs** neufs, tous tirés à la main (un test seul, fichier restauré, sha256 vérifié) : **12 sur 12 tués** par assertion. Les 30 tueurs des dix `r25s_` de #177 rejoués sur le gel : **30 sur 30 tués** (après `055bc4fa` ; avant, le tueur `:265` de l IHDR survivait, section 1). Les cas « admis » des trois tests sont verts à la base : aucun test ne refuse ce que le spec admet.

## 4. Vérifications (worktree `/home/user/monark-governance-png`, Node 24.21.0, proxy retiré pour les tests ; gel `055bc4fa`)

| Vérification | Résultat |
|---|---|
| red-proof `--base a0f59fcd --gel 055bc4fa --repo . --draw 15 --seed 37` | **OK** : 3 jugés, **3 F2P**, 70 inchangés ; 3 tueurs tirés, **3 tués**. `RED-PROOF.json` sha256 `d645c528c90c71d8d9a56c99396029be5e174c5e99d3eb216ea2825a8a70d0f2` |
| tueurs à la main | 12 sur 12 neufs, 30 sur 30 des `r25s_` existants |
| ancres `verifie-ancres.mjs . --touched a0f59fcd HEAD` | 126 tueurs, 126 ANCRE, 0 DERIVE, 0 PERDU |
| `npm run test:main` (`node_modules` copié) | tête `055bc4fa` : **2 498 tests, 2 476 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| actifs déclarés (scratchpad `png/all.mjs`, nombre magique puis structure, par objets) | base `a0f59fcd` : 45, **0 refusé** ; gel : 45, **0 refusé** (`out/logo.png` : `IHDR(13) iCCP(264) IDAT(28879) IEND(0)`) |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `a0f59fcd`, tête `055bc4fa` : `STAT 54 insertions, 9 deletions, changed 63`, `CONTENT_STAT 0`, GREEN (mode `unproven`), **sous 547** (G0 : ≈ 50).

## 6. Windows

Lecture par objets ; fixtures en mémoire (le logo du tronc lu par objet, images construites par `pngOf`) ; aucun binaire ajouté ; aucun nom réservé ; aucun saut `win32`. T-13 alloue 64 Mio de zéros et les compresse une fois par cas (≈ 0,3 s).

## 7. Items résiduels (pour l ETAT, MONARK l écrit)

| Item | Résidu, dit tel quel | Options et prix |
|---|---|---|
| **R25-ASSET-PNG-ORDER-1** (neuf) | l ordre des morceaux n est pas contrôlé (spec : `PLTE` avant `IDAT`, `IDAT` consécutifs, `gAMA`/`cHRM`/`sRGB`/`iCCP`/`sBIT` avant `PLTE` et `IDAT`, `tRNS`/`bKGD` après `PLTE`) ; aucun octet libre de plus (tailles et unicité tiennent), donc sans capacité de contrebande | (i) laisser : 0 ; (ii) un rang par morceau et un contrôle croissant : ≈ 2 lignes + 1 test, 0 refus attendu (logo `IHDR iCCP IDAT IEND`) |
| **R25-ASSET-PNG-PLTE-1** (neuf) | `PLTE` libre jusqu à 768 octets, sans contrôle de multiple de 3 ni de borne `2^depth` | (i) laisser (sous FREE-FIELD-1) : 0 ; (ii) `n % 3 === 0 && n / 3 <= 2 ** depth` : +1 condition, +1 test, 0 refus (aucune palette au tronc) ; la palette reste un champ libre de 768 octets |
| **R25-ASSET-PNG-IHDR-1** (neuf) | profondeur, méthodes de compression/filtre/entrelacement de `IHDR` non contrôlées (une profondeur hors spec, p. ex. 3 en gris, est lue telle quelle ; un type de couleur invalide donne une taille NaN, refusée ; un entrelacement 2 est lu comme Adam7) | (i) laisser : 0 ; (ii) table des couples (type, profondeur) valides et octets 26 à 28 : ≈ 1 ligne + 1 test, 0 refus |
| R25-ASSET-FREE-FIELD-1, R25-ASSET-PNG-DEFLATE-1, R25-ASSET-ICCP-1 | inchangés (G7 de R25-ASSET-STRUCTURE-1, section 8) : capacité PNG désormais `PLTE` (768 octets), `iCCP`, flux deflate | inchangés |

## 8. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Complément à D9 quindecies — 2026-10-06** (à la fin du fichier, après D9 quindecies), règle inchangée. À contrôler par MONARK au diff.

## 9. Décisions et questions ouvertes (défauts du G0 tenus)

- **Q-1 (unicité)** : un seul de chaque morceau sauf `IDAT`, le second `IHDR` compris (dépasse la lettre de l item : sans elle, la taille fixe se contournait par répétition) ; 0 refus. Variante : tailles seules.
- **Q-2 (plafond)** : 64 Mio (`2 ** 26`, inclus) ; le logo pèse 1 Mio. Variante : 16 Mio.
- **Q-3 (`tRNS` en palette)** : `PLTE` avant `tRNS`, au plus une entrée par couleur ; 0 refus.
- **Q-4 (ADR)** : complément daté à la fin de D9 quindecies, pas une nouvelle lettre.
- **Q-5 (fusion)** : après T0, par MONARK ; une avance du tronc d ici là entrera par un commit de fusion.
