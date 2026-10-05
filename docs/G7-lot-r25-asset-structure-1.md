# G7 - lot R25-ASSET-STRUCTURE-1 (option (c) réduite de Q-c : fin de structure des cinq formats d actifs déclarés et listes fermées, en durcissement)

- **Session** : RECHERCHES, 2026-10-05. Branche `recherches/r25-asset-structure-1`, depuis le tronc `lot/etude-suite` à `e4aac057` (fusion de #173, R25-MINIFIED-LINE-1). Aucun rebase, aucune PR (à la main de MONARK). Aucun Z-3 : aucun octet servi ne change.
- **Plan** : G0 `docs/G0-lot-r25-asset-structure-1.md` (commit `c30780bd`). Décision de MONARK : message `2026-10-05-MONARK-vers-RECHERCHES-d2-z3-qc.md`, section 3 ; prix : pièce `coordination/pieces/2026-10-05-qc-option-c/PRIX-option-c.md`.
- **Item touché** : **R25-ASSET-POLYGLOT-1**, **durci, pas fermé**. L item reste ouvert, (a) chiffrée comme construction de fermeture (déclencheur : un actif qui devient une entrée exécutée, ou la revue d après T0). Son état dans `docs/ETAT.md` reste à la main de MONARK.
- **Intention tenue** : avant tout compte de R-25, `refusals` (donc `pin` en CI et l oracle par son propre module) lit en entier chaque actif déclaré changé qui a passé son nombre magique, et le refuse `asset-structure` s il ne finit pas où finit son format ou s il porte une partie hors des listes fermées mesurées au tronc. **0 refus sur les 45 actifs du tronc.**

## 1. Commits

| Commit | Rôle |
|---|---|
| `c30780bd` | G0 et tests rouges (dix `r25s_`, tueur de `r25h_pin_requires_the_workflow_and_the_base` ré-ancré `:268` -> `:351`) ; poussé seul d abord |
| `cf849d53` | gel : module, `.d.mts`, ADR D9 quindecies et résidu de D9 terdecies reformulé |
| `57fa03c7` | cas OTS renforcé : la charge Bitcoin à octet de trop est placée dans une fourche, où l octet de trop se lirait comme une marque de fourche ; le tueur de la l.305 (lecture entière de la charge) survivait, il est tué |
| `90d6e499` | deux tests `r25g_` (R25-NUL-BINARY-1) tenaient un actif déclaré fait du nombre magique puis de texte, que le gel refuse (rouges au premier `test:main`) : leur police et leur image sont désormais valides (les lignes dans la table `name` et dans `PLTE`) et comptent toujours 0 ; chaque test affirme en plus que l ancienne fixture est refusée `asset-structure` (rouge à la base, donc F2P) |
| ce commit | G7 ; statut du G0 |

## 2. Ce que livre le gel

| Fichier | Changement |
|---|---|
| `scripts/lot-size-integration.mjs` | l.17 (sur place) : `import { inflateSync } from "node:zlib"` sur la ligne de l import de `node:url` (aucun tueur existant décalé avant la l.247) ; l.205 (sur place) : commentaire de `refusals`, résidu « a polyglot in a legitimate field of its format passes » ; l.209-210 (sur place) : une extension de `BINARY_ASSETS` sans entrée dans `ASSET_STRUCTURE` lève ; l.226 (sur place) : `else if (ASSET_STRUCTURE[x](b) !== null) out.push(\`asset-structure ${p}\`)`, après le contrôle du nombre magique ; l.247-328 (nouvelles, après `named()`) : table CRC-32, listes fermées, `png`, `jpg`, `ttf`, `ots`, `cbor`, `ASSET_STRUCTURE` |
| `scripts/lot-size-integration.d.mts` | `PNG_CHUNKS`, `JPEG_SEGMENTS`, `TTF_TABLES`, `OTS_CALENDARS`, `OTS_OPERAND_MAX`, `ASSET_STRUCTURE` |
| `test/r25-integration.test.ts` | dix tests `r25s_`, helpers en mémoire ; un tueur ré-ancré ; fixtures de `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` et `r25g_ci_w_counts_code_named_as_an_asset_outside_the_asset_directories` rendues valides, plus l assertion du refus de l ancienne forme |
| `docs/adr/ADR-M003-phase2-integration.md` | **Addendum D9 quindecies** (lettre libre après `quaterdecies`) ; dans D9 terdecies, le résidu devient « un polyglotte **dans un champ légitime** de son format passe », reformulé sur place avec renvoi daté à D9 quindecies |

`ci.yml`, les lignes `STAT=` et `CONTENT_STAT=`, `scripts/oracle/r25.mjs`, le workflow public dérivé : **inchangés**. Le module n est pas exporté au dépôt public (absent de la liste blanche de `scripts/export-public.mjs`).

### 2.1 Règles par format (après le nombre magique)

| Format | Règles du gel | Ce qui survit (champs libres légitimes) |
|---|---|---|
| PNG | `IHDR` en premier (13 octets) et seul ; chaque morceau dans le fichier, CRC juste (table CRC-32 propre : `zlib.crc32` n existe qu à partir de Node 20.15, le job tourne avant `setup-node`) ; liste fermée `IHDR PLTE IDAT IEND tRNS gAMA cHRM sRGB iCCP pHYs bKGD sBIT` ; `PLTE` en type 3 seulement ; zéro octet après `IEND` ; `IDAT` concaténés : premier bloc deflate non stocké, **un seul flux zlib sans octet après sa fin** (`engine.bytesWritten` de `inflateSync(..., { info: true })`), taille inflatée égale à la taille de l image, Adam7 compris, `maxOutputLength` à cette taille (pas de bombe de décompression) | `PLTE` (768 octets en type 3), `tRNS`, `bKGD`, `sBIT`, nom et profil `iCCP`, flux deflate non stocké (Huffman fixe : littéraux 0 à 143 sur 8 bits) |
| JPEG | après `ff d8`, segments de la liste fermée `SOF0 SOF1 SOF2 DHT DQT DRI SOS` (aucun `APPn`, aucun `COM`, aucun octet de remplissage `ff ff`) ; données entropiques jusqu au prochain marqueur hors `RSTn` et `ff00` ; zéro octet après `EOI` | `DQT`, `DHT`, données entropiques |
| TrueType | les 23 balises des 5 polices du tronc, strictement croissantes (aucun doublon) ; tables dans l ordre des offsets, 0 à 3 octets **nuls** avant chacune et après la dernière, aucune table hors du fichier | `name`, `glyf` (dont les zones hors `loca`), `fpgm`, `prep`, `cvt `, `post`, `DSIG`, zones non référencées de `gvar`, `GSUB`, `GPOS` |
| OpenTimestamps | port en JS de `readOtsProof` (`apps/site/lib/bell-anchors.ts`) : opération de hachage du fichier `08 02 03`, arbre à profondeur au plus 256, opérations `f0 f1 f2 f3 02 03 08 67`, attestations Bitcoin (charge = un varuint, rien d autre) et pending (charge = une URI, rien d autre) ; resserrements : **aucune attestation inconnue**, URI pending **égale** à `https://` suivi de l un des 5 calendriers du tronc, opérande d au plus **89** octets ; zéro octet après la preuve | opérandes de 1 à 89 octets, en nombre quelconque ; branches pending, invérifiables hors ligne ; condensat du fichier |
| CBOR | un seul élément bien formé, longueurs définies (`ai` 28 à 31 refusés), profondeur au plus 64 ; zéro octet après | toute chaîne |

**Ce que cela ferme** : la famille « charge ajoutée en fin » pour les cinq formats, dont l archive zip que `python3` exécute parce que zip se lit depuis la fin (le cas `out/zip.png` du G7 de R25-GUARDS-2) ; un flux zlib suivi d octets dans `IDAT` ; les morceaux et segments de texte ou de métadonnées (`tEXt`, `zTXt`, `iTXt`, `eXIf`, `tIME`, `APPn`, `COM`), le cas mesuré `PNG-TEXT-RAN` ; les tables, opérations, attestations et calendriers inconnus. Ferme aussi le complément N-1 de R25-ASSET-POLYGLOT-1 (G7 de R25-MINIFIED-LINE-1, section 8) : un actif déclaré à vraie tête suivie de texte sans NUL ne passe plus, il ne finit pas où finit son format.

## 3. Tests et tueurs (numéros de ligne du gel)

| Test | Ce qu il tient | Tueurs |
|---|---|---|
| `r25s_ci_refuses_an_asset_with_a_payload_after_its_end` | 5 actifs du tronc renommés dans leurs répertoires (zip après `IEND`, `COM`, `PK` après la dernière table, un octet après la preuve OTS et l élément CBOR) : refusés `asset-structure` par `pin` (job rouge, sans compte) et par l oracle ; le logo renommé passe | `:226` |
| `r25s_png_ends_at_iend_with_sound_chunks` | logo admis ; zip ou octet après `IEND`, CRC faux, longueur qui déborde, sans `IEND`, second `IHDR` refusés | `:268`, `:264`, `:265` |
| `r25s_png_chunks_are_a_closed_list` | `tEXt zTXt iTXt eXIf tIME acTL caNv` refusés ; `gAMA sRGB pHYs` admis ; `PLTE` refusé en type 6, admis avec `tRNS` en type 3 | `:254` (x2), `:265` |
| `r25s_png_pixel_data_is_one_zlib_stream_of_the_image_size` | bloc stocké, ligne de trop, octet de moins, zip après le flux zlib refusés ; Adam7 3 x 3 admis à 15 octets, refusé à 12 | `:271`, `:272`, `:270` |
| `r25s_jpeg_ends_at_eoi_with_closed_segments` | bannière et `DRI` admis ; après `EOI`, `APP0`, `APP1`, `COM`, `SOF3`, sans `EOI` refusés | `:278`, `:254` (x2) |
| `r25s_ttf_tables_cover_the_file` | 3 nuls en fin admis ; 4 nuls, `PK`, bourrage non nul, chevauchement, table hors du fichier, balise inconnue, doublon refusés | `:292` (x2), `:291`, `:289` |
| `r25s_ots_proof_is_read_whole` | deux preuves du tronc et des preuves construites admises ; après la preuve, troncature, opérande de 90, opération inconnue, Litecoin, hôte hors liste, `http`, chemin, charge Bitcoin trop longue refusés | `:312`, `:303`, `:304`, `:306`, `:308`, `:305` |
| `r25s_cbor_is_one_item_and_nothing_after` | profondeur 64 admise ; après l élément, indéfini, `ai` 28, troncature, profondeur 65 refusés | `:326`, `:318` (x2) |
| `r25s_structure_lists_are_the_measured_ones` | listes fermées, plafond 89, une entrée par extension de `BINARY_ASSETS` | `:256`, `:255` |
| `r25s_every_trunk_asset_passes_its_structure` | les 45 actifs du dépôt passent | `:254`, `:256` |
| `r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection` (ajusté) | une police valide dont la table `name` porte un NUL et 2 000 lignes compte 0 ; la fixture d avant (`00 01 00 00`, puis du texte) est refusée `asset-structure` | `:188` (inchangé) |
| `r25g_ci_w_counts_code_named_as_an_asset_outside_the_asset_directories` (ajusté) | une image à palette valide dont `PLTE` porte un NUL et 50 lignes compte 0 ; la fixture d avant (signature PNG, puis du texte) est refusée `asset-structure` | `:188` (inchangé) |

**30 tueurs** au total pour le lot, plus le tueur ré-ancré (`:351`). Tous tirés à la main au gel (un test seul, fichier restauré, sha256 vérifié avant et après) : **31 sur 31 tués** par assertion, plus les deux tueurs des tests `r25g_` ajustés (2 sur 2). Les tueurs voisins (`r25h_`, `r25m_`, `oracle_r25_refuses_what_the_job_refuses` : 30) rejoués : 30 sur 30 tués, aucun décalé.

Sans tueur, dit tel quel : le contrôle défensif « une extension de `BINARY_ASSETS` sans validateur lève » (l.209) ; le tuer exigerait de muter `BINARY_ASSETS`, que `r25g_binary_assets_are_the_measured_list` tient déjà ; `r25s_structure_lists_are_the_measured_ones` tient la correspondance des deux tables.

## 4. Vérifications (worktree `/home/user/monark-governance-r25s`, Node 24.21.0, git 2.43.0, proxy retiré pour les tests ; tronc `e4aac057`, inchangé au dernier `fetch` ; gel `90d6e499`)

| Vérification | Résultat |
|---|---|
| red-proof `--base e4aac057 --gel 90d6e499 --repo . --draw 40 --seed 37` | **OK** : 12 jugés (les dix `r25s_` et les deux `r25g_` ajustés), **12 F2P**, 0 refusé ; 58 inchangés ; 12 tueurs tirés (un par test), **12 tués**. `RED-PROOF.json` sha256 `09216fe05b3c8e32213bcf2d0dda4319806c03aaa5fcce76711bab85a837cb26` |
| tueurs à la main | 31 sur 31 du lot, 2 sur 2 des `r25g_` ajustés, 30 sur 30 voisins (section 3) |
| ancres `verifie-ancres.mjs . --touched origin/lot/etude-suite HEAD` | 114 tueurs, 114 ANCRE, 0 DERIVE, 0 PERDU |
| `npm run test:main` (`node_modules` copié, pas lié) | tête `90d6e499` : **2 495 tests, 2 473 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 (au premier gel `57fa03c7` : 2 rouges, les deux `r25g_` ajustés depuis, commit `90d6e499`) |
| `npm run test:export` | vert (1/1) |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| workflow public dérivé | export complet (`export-public.mjs --out`) au gel et au tronc `e4aac057` : **identiques fichier pour fichier**, `.github/workflows/ci.yml` dérivé compris ; `.github/` et `scripts/oracle/` inchangés sur la plage ; `ci.yml` et les lignes `STAT=` inchangés |

## 5. R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/lot/etude-suite` (`e4aac057`), tête `90d6e499` : `STAT 260 insertions, 10 deletions, changed 270`, `CONTENT_STAT 0`, GREEN (mode `unproven`), **sous 547**. Estimation de la pièce : ≈ 260. **Un seul lot**, pas de découpe en deux (PNG/JPEG/CBOR puis TTF/OTS). `refusals` a tourné sur la plage du lot : aucun refus (le lot ne change aucun actif).

## 6. Mesures (tronc `e4aac057`, par objets)

| Mesure | Résultat |
|---|---|
| Contrôle du gel sur les 45 actifs déclarés | **0 refusé** |
| Morceaux PNG du logo (512 x 512, type 6, non entrelacé) | `IHDR iCCP IDAT IEND` |
| Segments JPEG de la bannière | `DQT SOF0 DHT SOS`, puis `EOI` |
| Balises TrueType | 23 (la pièce annonçait 21 et en listait 23) ; bourrage 0 à 3 octets nuls entre tables ; 0 octet après la dernière table, dans les 5 polices |
| OTS : opération de hachage du fichier | `08` seule |
| OTS : opérandes | 3 708 : 238 de 4 octets, 208 de 8, 173 de 16, 2 989 de 32, 100 de 89 |
| OTS : attestations | 139 pending, 101 Bitcoin, aucune autre |
| OTS : URI pending | exactement `https://` et l un des 5 hôtes de la liste |
| Table CRC-32 propre | égale à `zlib.crc32` sur les 45 actifs |

## 7. Windows

Contrôle sur objets seuls : indifférent à `autocrlf`, aux liens, à la casse de NTFS. `inflateSync` est le même ; la table CRC est propre ; aucune recompression canonique (la zlib embarquée varie avec Node, d où le rejet de C-PNG-1). Fixtures : actifs du tronc lus par objet (`cat-file blob HEAD:<chemin>`) et changés en mémoire, ou construits en mémoire, mis en index par `hash-object -w --no-filters` ; **aucun fichier binaire ajouté au dépôt** ; chemins par `join` ; aucun nom réservé. **Aucun saut `win32`.** `zlib.crc32` n est utilisé que par les tests (Node 24 sous `setup-node`), jamais par le module.

## 8. Items résiduels pour l ETAT (règle PAROXYSME ; MONARK écrit l ETAT avec cette PR)

Portés par RECHERCHES, déclencheur « avant T0 » sauf mention. Prix de la pièce `PRIX-option-c.md` (section 7), mesurés au tronc `75c6bc52` et inchangés à `e4aac057` (aucun actif changé entre les deux).

| Item | Résidu, dit tel quel | Options et prix |
|---|---|---|
| **R25-ASSET-FREE-FIELD-1** | après ce lot, une charge dans un champ légitime d un format admis : PNG `PLTE` en type 3, `tRNS`, flux deflate ; JPEG `DQT`/`DHT`/données entropiques ; TTF `name`, `glyf`, hinting, `post`, `DSIG` ; OTS opérandes de 89 octets au plus en nombre quelconque et branches pending ; CBOR chaînes. Elle ne s exécute que si du code l appelle, ce code étant compté et relu | (i) **laisser à la règle actuelle** (invoquer un actif comme du code est une ligne comptée et relue) : 0 ligne — choix de MONARK du 2026-10-05 ; (ii) (a) en régime tronc : ferme ; ≈ 49 lignes + ≈ 30 tests ; ≈ 7 à 9 PR de liste par mois, plus à chaque surclassement Bell ; (iii) par format, sans fermer : C-OTS-2 (≈ 60 lignes + 20 tests, ferme les branches Bitcoin seulement ; 36/45 refusés si pending est refusé) ; C-PNG-1 (≈ 6 lignes, 1/1 PNG refusé, instable selon la zlib) |
| **R25-ASSET-PNG-DEFLATE-1** | octets choisis dans un flux deflate non stocké (Huffman fixe, littéraux 0 à 143 sur 8 bits) ; seul le **premier** bloc est contrôlé non stocké ; raisonné, non construit | (i) laisser (sous FREE-FIELD-1) : 0 ; (ii) C-PNG-1, recompression canonique : ≈ 6 lignes + 2 tests, refuse `out/logo.png` (1/1, aucun des 100 réglages essayés ne le reproduit), non portable entre versions de Node ; (iii) refuser tout bloc stocké, pas seulement le premier : un petit lecteur d en-têtes de blocs deflate, ≈ 15 lignes + 2 tests, 0 refus attendu (à mesurer), sans fermer (Huffman fixe reste) ; (iv) (a) |
| **R25-ASSET-ICCP-1** | nom du profil `iCCP` (1 à 79 octets latin1) et profil compressé | (i) C-PNG-3, nom `^[A-Za-z0-9 ]{1,79}$` : +1 ligne, +1 test, 0 refus (le tronc porte `ICC Profile`) ; (ii) refuser `iCCP` : 0 ligne de plus (un mot de `PNG_CHUNKS`), 1 refus (`out/logo.png`, à réexporter en `sRGB`) |
| **R25-ASSET-TTF-TABLES-1** | octets libres dans `name`, `glyf` (dont les zones hors `loca`), `fpgm`, `prep`, `post`, `DSIG` | (i) laisser : 0 ; (ii) parse `loca`/`glyf` pour refuser les octets non couverts : +15 lignes, +3 tests, 0 refus attendu (à mesurer) ; (iii) sommes de contrôle de tables et `checkSumAdjustment` : +8 lignes, +2 tests, à mesurer sur les 5 polices ; un assainisseur complet est hors de proportion |
| **R25-ASSET-OTS-PENDING-1** | branches pending invérifiables hors ligne ; opérandes libres (au plus 89 octets chacun depuis ce lot) ; condensat du fichier libre | (i) C-OTS-1, **livré par ce lot** ; (ii) C-OTS-2, liste fermée d en-têtes de blocs Bitcoin et vérification du chemin jusqu à la racine de Merkle : ≈ 60 lignes + 20 tests (sha256, sha1, ripemd160, keccak en JS sans dépendance), et une PR d en-tête à chaque surclassement ; ne ferme pas pending ; (iii) C-OTS-3, condensat égal au sha256 du manifeste voisin : +6 lignes, +2 tests, **3 refus au tronc** (`test/fixtures/fixture-bell-seq2-block.ots` et `test/fixtures/fixture-bell-seq2-pending.ots`, sans voisin, à lister nommément ; `docs/course-bell/mint_resume-TSLAx-manifest.txt.ots`, BELL-COURSE-TSLAX-DRIFT-1, pris par MONARK) |
| **R25-ASSET-CBOR-1** | chaînes CBOR libres | (i) laisser : 0 ; (ii) schéma par fixture : ≈ 20 lignes + 4 tests pour l unique fixture, sans fermer (la clé de la signature est dans le dépôt) |
| **R25-ASSET-STRIP-1** | coût d usage de ce lot : un actif neuf d un outil courant porte des métadonnées refusées (ImageMagick écrit `tEXt date:create` ; les exports photo écrivent `APP0` JFIF, `APP1` Exif/XMP, `COM`) ; il est refusé `asset-structure` tant qu il n est pas dépouillé, sans PR préalable | (i) documenter une commande de dépouillement dans le RUNBOOK : 0 ligne de code ; (ii) un sous-mode `strip` du module : ≈ 25 lignes + 4 tests (PNG et JPEG seulement) |

Rappel, hors de ce lot : **R25-ASSET-POLYGLOT-1** reste ouvert, (a) chiffrée comme construction de fermeture ; **BELL-COURSE-TSLAX-DRIFT-1** est pris par MONARK (message du 2026-10-05, section 4).

## 9. Ligne d ADR

Versée dans `docs/adr/ADR-M003-phase2-integration.md` : **Addendum D9 quindecies** (daté du 2026-10-05) et, dans D9 terdecies, le résidu reformulé « un polyglotte dans un champ légitime de son format passe » avec renvoi à D9 quindecies (« la vraie tête, puis du code ou une archive » ne passe plus). À contrôler par MONARK au diff.

## 10. Décisions et questions ouvertes (défauts du G0 tenus)

- **Q-1 (liste JPEG)** : aucun `APPn` ni `COM` (la liste stricte de la pièce, 0 refus au tronc). Coût : R25-ASSET-STRIP-1.
- **Q-2 (hachage du fichier OTS)** : le port de `readOtsProof` tel quel (`08 02 03`, sans `67`) ; 0 refus.
- **Q-3 (URI pending)** : égalité exacte à `https://<hôte>` (sans chemin, port ni barre finale) ; 0 refus. Variante : hôte seul par `new URL`, si un client OpenTimestamps futur écrit une barre finale.
- **Q-4 (raison du refus)** : `asset-structure <chemin>` seul dans le journal de `pin` et de l oracle ; la raison détaillée est rendue par `ASSET_STRUCTURE` mais non écrite. Variante : l écrire sur stderr (+1 ligne, elle passerait par `named()`).
- **Q-5 (lettre d ADR)** : D9 quindecies, vérifiée libre dans `docs/adr`.
- **Q-6 (items)** : section 8, pour l ETAT.
- **Ouvert** : la pièce de prix comptait 21 balises TrueType et en listait 23 ; le gel tient les 23 mesurées.
