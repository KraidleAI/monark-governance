# G2 - lot R25-ASSET-PNG-HARDEN-1 (revue fraîche, adverse)

- **Objet** : `git diff a0f59fcd..469e7500`, worktree `/home/user/monark-governance-png`, branche `recherches/r25-asset-png-harden-1`, tête `469e7500` (commits `97a17ce1`, `b4a10021`, `055bc4fa`, `469e7500`).
- **Mode** : revue seule. Aucun fichier du worktree modifié à la fin (`git status` propre, sha256 de `scripts/lot-size-integration.mjs` = `da50e0e7…f7be`, identique à `HEAD`, vérifié après chaque mutant). Fichiers de travail : scratchpad `g2png/` (`probe.mjs`, `bomb.mjs`, `mut.mjs`, `muts.json`, `muts2.json`).
- **Environnement** : Node 24.21.0, variables de proxy retirées pour les tests seulement.

## Verdict : **non bloquant**

Aucun contournement ne fait passer une capacité **nouvelle** : le seul champ libre qui grossit (palette) était déjà sous R25-ASSET-FREE-FIELD-1, et `iCCP` reste un champ libre non borné. Le plafond est bien posé avant `inflateSync`, `maxOutputLength` est présent, CRC, liste fermée, APNG, données après `IEND` tiennent. Mais le G7 affirme un fait faux (palette « jusqu à 768 octets »), le `tRNS` en palette n est pas borné comme le disent le G0, le G7 et l ADR, le plafond refuse une image 4096 x 4096 RVBA 8 bits, et deux propriétés annoncées par les tests ne sont pas tenues par eux (mutants survivants). À corriger avant fusion de préférence : N-1 (texte au minimum), N-3, N-4.

## Mesures

| Mesure | Résultat |
|---|---|
| `node --test test/r25-integration.test.ts` (tête) | 73 tests, 73 verts, 48,6 s |
| les 3 tests neufs contre le module de la base (module remplacé puis restauré, sha256 vérifié) | 3 rouges ; `r25s_png_ends_at_iend_with_sound_chunks` et `r25s_every_trunk_asset_passes_its_structure` verts : F2P confirmé |
| durée de `r25s_png_pixel_data_is_capped_before_inflating` | 0,41 s (G0/G7 : ≈ 0,3 s) |
| bombe sous le plafond (8191 x 8192 gris, `IDAT` de 64 Mio de zéros) | blob 65 295 octets ; 69 ms par appel de `png` (moyenne sur 20) ; pic RSS ≈ +217 Mo sur 20 appels (rendu au GC) |
| flux qui dépasse la taille déclarée (2^28 zéros sous un en-tête 8191 x 8192) | refusé `pixel data` en 32 ms (`maxOutputLength`) |
| APNG `acTL`, `tEXt` x2, morceau privé | refusés `chunk <t>` (liste fermée) |
| 16 bits gris (`sBIT` 1, `bKGD` 2, `tRNS` 2), 16 bits RVBA (`sBIT` 4, `bKGD` 6), gris+alpha (`sBIT` 2, `bKGD` 2), palette (`sBIT` 3), palette 1 bit 9 x 1 | admis (pas de faux refus) |
| gris+alpha avec `tRNS` | refusé `chunk tRNS of 2 bytes` (conforme au spec) |
| `w = h = 2^32-1`, Adam7, 16 bits | refusé `pixel data size` (calcul en double, pas de débordement : au plus ≈ 2^67, toujours au-delà du plafond) |

## Tueurs tirés à la main (un test seul, fichier restauré, sha256 vérifié à chaque tir)

| Mutant | Test | Résultat |
|---|---|---|
| `:271` `size <= PNG_INFLATE_MAX` -> `size < PNG_INFLATE_MAX` (tueur déclaré) | `r25s_png_pixel_data_is_capped_before_inflating` | tué |
| `:266` `Math.min(n, seen.get("PLTE") / 3)` -> `n` (tueur déclaré) | `r25s_png_colour_chunks_fit_the_colour_type_once_each` | tué |
| `:254` `cHRM: 32` -> `cHRM: 33` (tueur déclaré) | `r25s_png_fixed_size_chunks_have_their_spec_length` | tué |
| `:265` ` \|\| (t !== "IDAT" && seen.has(t))` -> `` (tueur ré-visé) | `r25s_png_ends_at_iend_with_sound_chunks` | tué |
| `:266` `seen.get("PLTE") / 3` -> `seen.get("PLTE")` (non déclaré) | colour | tué |
| `:271` ligne du plafond retirée (non déclaré) | capped | tué |
| `:254` `sBIT: [1, null, 3, 3, 2, …]` -> `[1, null, 3, 9, 9, …]` | colour | **survit** (N-3) |
| `:254` `bKGD: [2, null, 6, 1, 2, …]` -> `[2, null, 6, 1, 9, …]` | colour | **survit** (N-3) |
| `:254` `tRNS: [2, null, 6]` -> `[2, null, 6, null, 2]` (tRNS admis en gris+alpha) | colour | **survit** (N-3) |
| `:271`+`:272` plafond déplacé **après** `inflateSync` (retiré de 271, ajouté au `return` de 272) | capped | **survit** (N-4) |
| `:265` unicité restreinte à `gAMA` et `IHDR` | les six `r25s_png_` | **survit** (M-4) |

Les tueurs déclarés tirés (4 sur 12) sont réels et tués par assertion.

## Constats

### N-1 - `PLTE` n est pas borné : le `tRNS` d une image palette devient un champ libre d un tiers de la palette ; le G7 affirme le contraire

- **Fichier** : `scripts/lot-size-integration.mjs:265-266` ; `docs/G7-lot-r25-asset-png-harden-1.md:36` et `:76` ; `docs/adr/ADR-M003-phase2-integration.md:205` (« au plus un octet par entrée de `PLTE` déjà lue ») ; `docs/G0-lot-r25-asset-png-harden-1.md` section 2 (`tRNS` « bornes du spec »).
- **Constat** : aucune ligne ne contrôle la taille de `PLTE`. Le G7 (l.76) écrit « `PLTE` libre jusqu à 768 octets » : c est faux, rien ne tient 768. Comme la borne de `tRNS` en palette est `PLTE / 3`, un `PLTE` de 65 001 octets de texte autorise un `tRNS` de 21 667 octets de texte. La borne du spec (256 entrées au plus) n est donc pas tenue, alors que le G0 la présente comme « bornes du spec ». Le `gAMA` de 65 000 octets refusé par le lot revient sous la forme `PLTE` + `tRNS` dans une image palette. Ce n est pas une capacité nouvelle : `PLTE` et `iCCP` sont déjà des champs libres sous FREE-FIELD-1. Le compte rendu, lui, est inexact.
- **Reproduction** (`g2png/probe.mjs`) : `pngOf(2, 1, 3, 0, [0,0,1], [PLTE(65 001 octets de "console.log('run me');\n"…), tRNS(21 667 octets du même texte)])` -> `png()` = `null` (admis). Variantes admises aussi : `PLTE` de 4 octets (pas un multiple de 3), et une image palette **sans** `PLTE` (M-1).
- **Correctif proposé** : en l.265, ajouter `|| (t === "PLTE" && (n % 3 !== 0 || n === 0 || n > 768))`. La borne de `tRNS` retombe alors à 256. Ajouter un cas à T-12 (`PLTE` de 771 octets refusé, `PLTE` de 4 octets refusé). Corriger G7 l.76 (« libre et **non borné** » si le correctif n est pas pris), ainsi que la ligne `tRNS` du G0 et de l ADR. **≈ 1 ligne de code + 1 ligne de test + 3 lignes de doc** ; 0 refus au tronc (aucune palette).

### N-2 - Le plafond de 64 Mio refuse une image 4096 x 4096 RVBA 8 bits, à 4 096 octets près

- **Fichier** : `scripts/lot-size-integration.mjs:254` (`PNG_INFLATE_MAX = 2 ** 26`) et `:271`.
- **Constat** : avec les octets de filtre, taille = 4096 x (1 + 4096 x 4) = 67 112 960 > 67 108 864. Une texture ou une illustration 4096² RVBA (format courant) est refusée `pixel data size`. Le G0 (Q-2) ne cite que la variante 16 Mio et un logo 2048². Ce n est pas une faille (le refus est fermé et le tronc n a qu un logo de 1 Mio), mais c est un faux refus futur non documenté.
- **Reproduction** : `pngOf(4096, 4096, 6, 0, Buffer.alloc(4096 * 16385))` -> `"pixel data size"` (179 ms). `2896 x 2896` RVBA 16 bits passe.
- **Correctif proposé** : soit (i) documenter dans G7 section 9 Q-2 et dans l ADR que la plus grande image RVBA 8 bits carrée admise est 4095 x 4095 (≈ 2 lignes de doc) ; soit (ii) un plafond de `2 ** 26 + 2 ** 16` (couvre les octets de filtre jusqu à 65 536 lignes) ou `2 ** 27`, avec T-13 re-dimensionné et ses deux tueurs ré-visés (≈ 1 ligne de code + 2 lignes de test). Défaut proposé : (i), décision à MONARK.

### N-3 - Type de couleur 4 (gris+alpha) et `sBIT` en palette non testés : trois mutants de la table survivent

- **Fichier** : `test/r25-integration.test.ts:1178-1188` (T-12). La table est en `scripts/lot-size-integration.mjs:254`.
- **Constat** : le titre de T-12 annonce « greyscale, truecolour, palette, truecolour with alpha ». Aucun cas n a le type 4, et aucun cas palette n a de `sBIT`. Les valeurs `sBIT[3]`, `sBIT[4]` et `bKGD[4]` peuvent donc changer sans que T-12 rougisse, et `tRNS[4]` peut même être ajouté, ce qui admettrait `tRNS` avec alpha. Cela contredit le G7 (section 3 : « 12 sur 12 tués », ce qui est vrai pour les tueurs déclarés seulement).
- **Reproduction** : `node g2png/mut.mjs g2png/muts.json` -> `SURVIVED` pour `sBIT: [1, null, 3, 9, 9, null, 4]`, `bKGD: [2, null, 6, 1, 9, null, 6]` et `tRNS: [2, null, 6, null, 2]` (T-12 : pass=1 fail=0).
- **Correctif proposé** : dans T-12, ajouter `ga: pngOf(1, 1, 4, 0, Buffer.alloc(3), [c("sBIT", "0808"), c("bKGD", "0000")])` -> `true`, `gaTRNS: pngOf(1, 1, 4, 0, Buffer.alloc(3), [c("tRNS", "0000")])` -> `false`, et `c("sBIT", "080808")` dans le cas `palette`. Ajouter deux tueurs : `sBIT … 3, 2 …` -> `… 3, 3 …` et `tRNS: [2, null, 6]` -> `[2, null, 6, null, 2]`. **≈ 2 lignes de test + 2 lignes de tueur.** Les deux cas ont été mesurés à la tête : `ga` admis, `gaTRNS` refusé.

### N-4 - « refusé avant de décompresser » n est pas tenu par T-13 : le cas `header` passe aussi sans le plafond

- **Fichier** : `test/r25-integration.test.ts:1192-1196` (T-13) ; `scripts/lot-size-integration.mjs:271-272`.
- **Constat** : le cas `header` (16384², flux court) rend `pixel data size` avec ou sans plafond, car un flux court donne une taille fausse dans tous les cas. Seul le cas `over` tient le plafond, et il le tient **après** une décompression de 64 Mio aussi bien qu avant. Un mutant qui déplace le contrôle après `inflateSync` (`return buffer.length === size && size <= PNG_INFLATE_MAX && …`) survit. Ce déplacement rouvre précisément le constat 3 : une bombe de 268 Mo sous un en-tête 16384² repasserait par une allocation de 268 Mo. Le titre de T-13 et le G7 disent pourtant « before inflating ».
- **Reproduction** : appliquer les deux remplacements (l.271 : retirer ` if (!(size <= PNG_INFLATE_MAX)) return "pixel data size";` ; l.272 : `buffer.length === size && engine` -> `buffer.length === size && size <= PNG_INFLATE_MAX && engine`), puis `node --test --test-name-pattern="^r25s_png_pixel_data_is_capped" test/r25-integration.test.ts` -> pass 1, fail 0. Fichier restauré, sha256 vérifié.
- **Correctif proposé** : donner au cas `header` un flux deflate **invalide** mais non « stored » (par exemple `789c0700000000`, BTYPE = 3). Avec le plafond avant : `pixel data size` ; sans plafond ou après : `inflateSync` lève, `pixel data`. Mesuré à la tête : 16384² + ce flux -> `pixel data size` ; 4 x 4 + ce flux -> `pixel data`. Construire le PNG à la main (`Buffer.concat([signature, pngChunk("IHDR", …), pngChunk("IDAT", hex), pngChunk("IEND", "")])`) et ajouter le tueur « plafond déplacé ». **≈ 3 lignes de test + 1 ligne de tueur.** Le cas devient en outre instantané, sans `zeros.subarray(0, 16385)`.

### M-1 - Image palette sans `PLTE`, largeur ou hauteur nulle : admises

- **Fichier** : `scripts/lot-size-integration.mjs:259-272`.
- **Reproduction** : `pngOf(2, 1, 3, 0, [0,0,1])` sans `PLTE` -> `null` ; `pngOf(0, 5, 0, 0, Buffer.alloc(5))` -> `null` ; `pngOf(5, 0, 0, 0, Buffer.alloc(0))` -> `null` ; `w = 2^32-1, h = 0` -> `null`. Le spec exige `PLTE` en type 3 et 0 < w, h < 2^31. Aucun octet libre n est ajouté, mais ces fichiers ne sont pas des PNG.
- **Correctif proposé** : les rattacher à R25-ASSET-PNG-IHDR-1 dans le G7 (≈ 1 ligne de doc). Ou bien ajouter au calcul de taille `w && h && w < 2 ** 31 && h < 2 ** 31`, et `color === 3 && !seen.has("PLTE")` sur le premier `IDAT` (≈ 1 ligne + 1 cas de test).

### M-2 - La règle « une seule fois sauf IDAT » est formulée comme une règle universelle

- **Fichier** : `scripts/lot-size-integration.mjs:265` (et le commentaire de la l.258, l ADR l.205).
- **Constat** : pour les 11 morceaux de la liste fermée actuelle, la règle est **exacte** au regard du spec. `IHDR PLTE IEND tRNS gAMA cHRM sRGB iCCP pHYs bKGD sBIT` sont tous « au plus un ». Elle ne refuse donc aucun PNG légal aujourd hui. Les morceaux qui peuvent légalement se répéter (`tEXt`, `zTXt`, `iTXt`, `sPLT`, et `fcTL`/`fdAT` en APNG) sont déjà refusés par la liste fermée : un `tEXt` seul ou deux `tEXt` donnent `chunk tEXt`. Le piège est latent : le jour où `tEXt` ou `iTXt` entreront dans `PNG_CHUNKS`, un PNG à plusieurs morceaux de texte, très courant, sera refusé sans que rien ne le signale.
- **Correctif proposé** : écrire la condition avec une liste explicite (`PNG_REPEAT = ["IDAT"]`, ou un commentaire « morceaux répétables par le spec : IDAT, sPLT, tEXt, zTXt, iTXt ; à étendre avec la liste fermée »). **≈ 1 ligne.**

### M-3 - Cohérence des documents

- ADR l.205 et G7 section 7 (ORDER-1) : « l ordre des morceaux n est pas contrôlé ». Or `tRNS` avant `PLTE` est refusé (T-12, `tRNSFirst`) : un ordre est donc contrôlé de fait. Il faut écrire « hors `PLTE` avant `tRNS` en palette ». **≈ 1 ligne de doc.**
- G7 section 7, ORDER-1 : il faut ajouter que des `IDAT` vides en nombre illimité et des `IDAT` non consécutifs (`IDAT gAMA IDAT`) passent. Les deux cas ont été mesurés : `null`. Il n y a pas d octet libre, puisque le CRC est déterministe, mais libpng refuse le second cas. **≈ 1 ligne de doc.**
- G0 et G7 section 6 : T-13 est annoncé à « ≈ 0,3 s » ; 0,41 s mesuré ici. Sans effet.
- Le reste concorde : le diff du module fait 7 lignes changées sur place (l.254, 258, 260, 265, 266, 267, 271), les numéros de ligne des tueurs sont justes, et `.d.mts`, `ci.yml`, `scripts/oracle/` sont hors diff sauf le `.d.mts` annoncé.

### M-4 - L unicité n est éprouvée que sur `gAMA` (et sur `IHDR` dans le test du lot précédent)

- **Fichier** : `test/r25-integration.test.ts:1186`.
- **Reproduction** : le mutant `(t !== "IDAT" && seen.has(t))` -> `((t === "gAMA" || t === "IHDR") && seen.has(t))` survit aux six `r25s_png_`. Le mutant est artificiel, donc le constat reste mineur.
- **Correctif proposé** : ajouter à T-12 un second `sRGB` ou un second `iCCP` (un `iCCP` est déjà dans le logo, donc `beforeIend(logo, iCCP)`) -> `false`. **≈ 1 ligne.**

### M-5 - Coût d une bombe sous le plafond

- 65 Ko de blob font 64 Mio décompressés, en 69 ms et avec ≈ 64 Mio alloués par appel. C est borné par fichier ; le coût est linéaire en nombre de PNG changés dans une PR, ce qui est acceptable. Rien à corriger ; une phrase dans le G7 suffit (≈ 1 ligne).

## Windows

Les fixtures sont en mémoire, le logo est lu par objet (`git cat-file`), aucun binaire n est versé, aucun nom réservé n est utilisé, il n y a aucun saut `win32` et aucun chemin construit. T-13 alloue ≈ 64 Mio de zéros et fait deux `deflateSync` de niveau 9 et une décompression de 64 Mio : la mémoire de pointe est d environ 200 Mo, sous le délai de 300 s du `test:main`. Aucune dépendance de plateforme n a été relevée. La correction N-4 rend le cas `header` instantané.

## Ce qui tient (chassé sans succès)

- `inflateSync` est appelé avec `maxOutputLength = max(1, size)`. Un flux plus long est refusé, un flux plus court aussi, et des octets après le flux zlib donnent `engine.bytesWritten`. Adler-32 est vérifié par zlib.
- La taille déclarée est calculée en double. `w * h * bpp`, Adam7 et les octets de filtre ne débordent jamais vers une petite valeur. Une taille `NaN` (type de couleur invalide) est refusée par `!(size <= MAX)`.
- Le CRC est vérifié sur chaque morceau. La liste est fermée : APNG `acTL`/`fcTL`/`fdAT`, morceaux ancillaires inconnus et morceaux privés sont refusés, quel que soit le bit critique. Les données après `IEND` sont refusées. Un second `IHDR` est refusé par l unicité.
- `tRNS` sans `PLTE` en palette : `undefined / 3` vaut `NaN`, donc refus. `tRNS` en type 4 ou 6 : le tableau est comparé à un nombre, donc refus.
- Il n y a pas de faux refus sur les 45 actifs du tronc (test vert), ni sur les images 16 bits, palette, palette avec `tRNS`, ou `tRNS` en gris.
