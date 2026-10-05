# G0 - lot R25-ASSET-STRUCTURE-1 (option (c) réduite de Q-c : fin de structure des cinq formats d actifs déclarés et listes fermées, en durcissement)

- **Mission** : item **R25-ASSET-POLYGLOT-1**, option (c) **réduite**, tranchée par MONARK pour Q-c (message `2026-10-05-MONARK-vers-RECHERCHES-d2-z3-qc.md`, section 3) et chiffrée par la pièce `coordination/pieces/2026-10-05-qc-option-c/PRIX-option-c.md`. **Durcissement, pas fermeture** : l item reste ouvert, (a) chiffrée comme construction de fermeture.
- **Branche** : `recherches/r25-asset-structure-1`, depuis le tronc `origin/lot/etude-suite` = `e4aac057` (fusion de #173, R25-MINIFIED-LINE-1). Aucun rebase ; une avance du tronc entre par un commit de fusion. Aucune PR ouverte (à la main de MONARK).
- **Statut** : G0 et tests rouges (`c30780bd`) ; gel poussé ensuite, compte rendu au G7 `docs/G7-lot-r25-asset-structure-1.md` (R-25 mesuré : 270).

## 1. Existant mesuré (tronc `e4aac057`, Node 24.21.0, git 2.43.0, lecture par objets)

| Mesure | Résultat |
|---|---|
| Actifs déclarés (`BINARY_ASSETS`) | 45 : 37 `.ots`, 5 `.ttf`, 1 `.cbor`, 1 `.jpg`, 1 `.png` |
| Contrôle du gel (section 2), sur les 45 | **0 refusé** |
| Morceaux PNG (`out/logo.png`, 512 x 512, type 6, non entrelacé) | `IHDR iCCP IDAT IEND` |
| Segments JPEG (`out/banner.jpg`) | `DQT SOF0 DHT SOS EOI`, aucun `APPn`, aucun `COM` |
| Balises TrueType (5 polices) | 23 distinctes (la pièce de prix annonçait 21 et en listait 23) ; bourrage 0 à 3 octets nuls, 0 octet après la dernière table |
| OTS : opération de hachage du fichier | `08` (sha256) seule |
| OTS : opérandes `append`/`prepend` | 3 708 : 238 de 4 octets, 208 de 8, 173 de 16, 2 989 de 32, 100 de 89 ; maximum 89 |
| OTS : attestations | 139 pending, 101 Bitcoin, aucune autre |
| OTS : URI pending | exactement `https://` suivi de l un des 5 hôtes de la pièce |

## 2. Construction

Dans `refusals` (`scripts/lot-size-integration.mjs`), pour un actif déclaré **qui a passé son nombre magique** : `ASSET_STRUCTURE[ext](blob)` ; s il rend une raison, le chemin est refusé `asset-structure` (nommé par `named()`, comme les autres refus). Un tableau `ASSET_STRUCTURE` sans entrée pour une extension de `BINARY_ASSETS` lève (comme `ASSET_MAGIC`).

| Format | Règles |
|---|---|
| PNG | `IHDR` en premier (13 octets), chaque morceau dans le fichier et à CRC juste (table CRC-32 propre : `zlib.crc32` n existe qu à partir de Node 20.15), liste fermée `IHDR PLTE IDAT IEND tRNS gAMA cHRM sRGB iCCP pHYs bKGD sBIT`, un seul `IHDR`, `PLTE` en type 3 seulement, `IEND` puis **zéro octet** ; `IDAT` concaténés : premier bloc deflate non stocké, un seul flux zlib **sans octet après sa fin** (`bytesWritten` du moteur), taille inflatée égale à la taille de l image (Adam7 compris), `maxOutputLength` à cette taille |
| JPEG | après `ff d8`, segments de la liste fermée `SOF0-2 DHT DQT DRI SOS` (aucun `APPn`, aucun `COM`), données entropiques jusqu au prochain marqueur hors `RSTn` et `ff00`, `EOI` puis **zéro octet** |
| TTF | balises de la liste fermée des 23, strictement croissantes ; tables dans l ordre des offsets, 0 à 3 octets **nuls** avant chacune et après la dernière, aucune table hors du fichier |
| OTS | port en `.mjs` de `readOtsProof` (`apps/site/lib/bell-anchors.ts`), plus : aucune attestation inconnue, URI pending égale à `https://<hôte>` d une liste fermée de 5, opérande d au plus **89** octets ; **zéro octet** après la preuve |
| CBOR | un seul élément bien formé, longueurs définies (`ai` 28 à 31 refusés), profondeur au plus 64, **zéro octet** après |

`ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs` : **inchangés** (l oracle appelle déjà `refusals` de son propre module).

## 3. Tests rouges d abord (`test/r25-integration.test.ts`), puis tueurs

Fixtures : actifs du tronc lus par objet (`cat-file blob HEAD:<chemin>`) et changés en mémoire, ou construits en mémoire ; mis en index par la plomberie (`hash-object -w --no-filters`). **Aucun fichier binaire ajouté au dépôt.**

| # | Test | Attendu au gel | À la base |
|---|---|---|---|
| T-1 | `r25s_ci_refuses_an_asset_with_a_payload_after_its_end` | zip après `IEND`, `COM` JPEG, `PK` après la dernière table, un octet après la preuve OTS et après l élément CBOR : 5 refus `asset-structure` par `pin` (job rouge) et par l oracle ; le logo sous un autre nom passe | rien de refusé, vert |
| T-2 | `r25s_png_ends_at_iend_with_sound_chunks` | logo admis ; zip ou octet après `IEND`, CRC faux, longueur qui déborde, sans `IEND`, second `IHDR` refusés | export absent |
| T-3 | `r25s_png_chunks_are_a_closed_list` | `tEXt zTXt iTXt eXIf tIME acTL caNv` refusés ; `gAMA sRGB pHYs` admis ; `PLTE` refusé en type 6, admis avec `tRNS` en type 3 | idem |
| T-4 | `r25s_png_pixel_data_is_one_zlib_stream_of_the_image_size` | bloc stocké, une ligne de trop, un octet de moins, zip après le flux zlib dans `IDAT` refusés ; Adam7 admis à sa taille | idem |
| T-5 | `r25s_jpeg_ends_at_eoi_with_closed_segments` | bannière et `DRI` admis ; après `EOI`, `APP0`, `APP1`, `COM`, `SOF3`, sans `EOI` refusés | idem |
| T-6 | `r25s_ttf_tables_cover_the_file` | 3 nuls en fin admis ; 4 nuls, `PK`, bourrage non nul, chevauchement, table hors du fichier, balise inconnue, balise en double refusés | idem |
| T-7 | `r25s_ots_proof_is_read_whole` | deux preuves du tronc, preuves construites (pending listé, fourche Bitcoin, opérande de 89) admises ; après la preuve, troncature, opérande de 90, opération inconnue, Litecoin, hôte hors liste, `http`, chemin, charge Bitcoin trop longue refusés | idem |
| T-8 | `r25s_cbor_is_one_item_and_nothing_after` | profondeur 64 admise ; après l élément, indéfini, `ai` 28, troncature, profondeur 65 refusés | idem |
| T-9 | `r25s_structure_lists_are_the_measured_ones` | listes fermées et plafond 89 ; une entrée par extension de `BINARY_ASSETS` | idem |
| T-10 | `r25s_every_trunk_asset_passes_its_structure` | les 45 actifs du dépôt passent | idem |

Tueurs (forme close `// killer: fichier:ligne OP "avant" -> "après"`, au-dessus de chaque `test(`, numéros de ligne du gel) : 30 prévus, chacun tiré à la main (restauration vérifiée par sha256). Le tueur existant de `r25h_pin_requires_the_workflow_and_the_base` est ré-ancré (`:268` -> `:351`, bloc inséré avant). Le contrôle défensif « une extension sans validateur lève » n a pas de tueur (il faudrait muter `BINARY_ASSETS` ; T-9 tient les données).

## 4. R-25 du lot

Prévu : module ≈ 93 (88 insertions, 5 lignes sur place), `.d.mts` 2, tests ≈ 152 : **≈ 247 sous 547**, un seul lot (pas de découpe PNG/JPEG/CBOR puis TTF/OTS). Docs hors pathspec. Le lot passe ses propres contrôles (aucune ligne de plus de 2 000 octets).

## 5. Windows

- Lecture par objets : indifférent à `autocrlf` et à NTFS ; `inflateSync` identique ; table CRC propre ; aucune recompression canonique (la zlib embarquée varie avec Node).
- Fixtures en mémoire et par la plomberie ; chemins par `join` ; aucun nom réservé (`nul`, `con`, `prn`, `aux`, `com1` à `com9`, `lpt1` à `lpt9`). Aucun saut `win32` prévu.

## 6. Questions pour MONARK (avec mes défauts)

- **Q-1 (liste JPEG)** : la pièce de prix admettait au prototype `APP0`/`APP1`/`APP2`/`APP14`. **Défaut : aucun `APPn` ni `COM`** (liste plus stricte de la pièce, 0 refus au tronc). Coût : un JPEG neuf d un outil courant doit être dépouillé (item R25-ASSET-STRIP-1).
- **Q-2 (opération de hachage OTS)** : `readOtsProof` admet `08`, `02`, `03` ; la pièce ajoutait `67` (keccak). **Défaut : le port tel quel** (`08 02 03` ; 0 refus, le tronc n a que `08`).
- **Q-3 (URI pending)** : **défaut : égalité exacte à `https://<hôte>`**, sans chemin ni port (0 refus). Variante : hôte seul, par `new URL`.
- **Q-4 (raison du refus)** : **défaut : `asset-structure <chemin>` seul** dans le journal ; la raison détaillée est rendue par `ASSET_STRUCTURE` (tests) mais pas écrite par `pin`. Variante : l écrire sur stderr (+1 ligne).
- **Q-5 (ADR)** : lettre libre après `quaterdecies` : **D9 quindecies** ; le résidu de D9 terdecies est reformulé sur place (« un polyglotte dans un champ légitime »).
- **Q-6 (items résiduels)** : R25-ASSET-FREE-FIELD-1, R25-ASSET-PNG-DEFLATE-1, R25-ASSET-ICCP-1, R25-ASSET-TTF-TABLES-1, R25-ASSET-OTS-PENDING-1, R25-ASSET-CBOR-1, R25-ASSET-STRIP-1 : options et prix au G7, pour l ETAT (MONARK l écrit).
