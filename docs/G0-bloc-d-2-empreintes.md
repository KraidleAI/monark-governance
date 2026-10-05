# G0 court du lot D-2 (bloc D, contrat 1.1.0) : empreintes des textes servis kata, pour la ligne Z-3 du bloc D

- **Plan** : `docs/G0-bloc-d.md` (`77d770ee`), §2.1 (lignes « textes kata (Z-3) » et « clause kata »), §4.2, §6 ; pièce de RECHERCHES `recherches:coordination/pieces/2026-10-05-bloc-d-textes-kata/TEXTES-kata-D2.md` (textes approuvés tels quels par MONARK : `recherches` `d6b26c0`, avec deux conditions : valeurs de la clause interpolées depuis les constantes ; `honestyText` lit les tables kata, T-13) ; go du fondateur Q-D1, ligne datée (11) de l'ADR-CM (base `c01b87d7`).
- **Base du lot** : `recherches/bloc-d` après la fusion de la base `c01b87d7` (commit de fusion `d811e65c`, sur D-1 `e38511a4`). Tests rouges : `0b069d34` (poussé). **Mise à jour** : la base a avancé à `a8ae38c0` (#168, TRANSPORT-500-SCHEMA-1), fusionnée par `2deaf7e8` ; les épingles de `/openapi.json` et de l'instantané en attente y sont recalculées (§5). Les empreintes des §2 et §3 sont remesurées sur le gel refait au-dessus de `a8ae38c0` : identiques, octet pour octet. Le gel n'est pas encore commité sur cette branche ; ces empreintes sont mesurées **sur l'arbre du gel**, à la place exacte de la clause et dans l'état liq du gel (`committed`, celui de la base).
- **Statut** : G0 court écrit avant le gel, pour que MONARK recalcule depuis notre tête et écrive sa ligne datée Z-3 du bloc D avant le gel. Auteur : RECHERCHES.

## 1. Mesure

Octets UTF-8 de la chaîne JavaScript, sans fin de ligne ni BOM ; tous les textes sont en ASCII imprimable. Mesures en processus (Node 24.21.0) sur l'arbre du gel : les 32 textes de table sont `SERVED_POLICY_TABLES[...].table.class.text` (gabarit `kataClassText`), les 32 phrases servies sont `honestyText(c, cellKey, false)` (texte + `; B_t is caller-carried.`, vérifié égal pour les 32), la clause est `kataClause()` (valeurs interpolées : `alpha` et `nMin` par famille depuis `kataClassEntries`, 300 s depuis `PRODUCED_AT_FUTURE_TOLERANCE_MS`), la description est `GATE_TOOL_DESCRIPTION`. Ce sont les octets que la pièce de RECHERCHES annonçait (aucun écart).

## 2. Les 32 textes de table, les 32 phrases servies, les 32 tables kata vides

Gabarit : `no ${task_class} calibration is committed for this cell_key; the gate abstains and serves no region`. Ordre de `kataClassEntries`.

| # | Classe | Texte de table : octets, sha256 | Phrase servie : octets, sha256 | `policy_table_sha256` (table vide servie) |
|---|---|---|---|---|
| 1 | `btc-dir-1h` | 96 `709e6bf3469dc1bc9e3a16dfa3a8e558bb53cc1297beee838ab8ca09dc7302b1` | 120 `18a2387e45603b47f61ed5d1c29d2919b0571e9652460d6daa8f5dc95a9cd653` | `c04ae2921430968857350fd2fa663d0931f92c1a9bfeb595a7d341d3a02cc6e1` |
| 2 | `btc-dir-4h` | 96 `d0f28be8fdd29f0da6b2f81348b9b7e2e1c0843e948936936199dd11781e2cd4` | 120 `ba4a942613a9dc530037417bd0d39303e3e34a6d5924133a78a74acfda96a3ff` | `2a06baeab97d92b37c631eb61e74817d7843688b11b95154581156c735e36ac7` |
| 3 | `btc-range-1h` | 98 `5a32efd10fd0d289eec63c163ec2159f2ed03b60f61579742cb4493427aa3cd5` | 122 `d9709565a6283c0c7858a65ed2e7c29ca9371976df71ac9de802f2f45e2464d0` | `1296c3336a96e23098f13acaf849f35c8c35970bd33d37d47f18fd26a50f955f` |
| 4 | `btc-range-4h` | 98 `5e8a71615041eaf99851e2f0ea1991f60af85b96ba26c492e3f4cc6ef8069955` | 122 `7b4c0d42220fac78186a5abb77c113423d23491ace7de8c3ffa45200861c44e9` | `b545641599a2c107c46102abf20060a2f82675e333d99d28f1a9625c956b8f1d` |
| 5 | `btc-mae-down-1h` | 101 `e7c9ee308029fe51ed3be4575673a8df072ab6f9137614e53aa841bffea0e275` | 125 `d4fafa5d06bb29abf1cc763c8e7579c12a9e27dbcf8416d94b167bf42e3eb685` | `db3aab7101196eea582c811bc76bacdd6bc7e21457ae895d5dd163a7a980e446` |
| 6 | `btc-mae-down-4h` | 101 `9d615fbe134d32055a2b2173fad7813057888095e6b11ff64ba3b9b281e60af4` | 125 `cb60362db85d157e057f27099a8d7ea46e614b8448722ac01275f484a2216779` | `a7767101899d1f429d4fa8fd4b5110e5d883f9833c3dd801d2f02d923025ffc1` |
| 7 | `btc-mae-up-1h` | 99 `839f63e53dcf115518f2f1b1baea20e98c6ef229c09910f69d9778ec1ce5b7ba` | 123 `7d13416efa0f0bd923f83816ae46d7c67a42c57ebe094efce7f104198fc9ffd1` | `b43ca5d1df3929cc058928391c5e8b2c337e0b6fd91808e29fbeaf835096d8dd` |
| 8 | `btc-mae-up-4h` | 99 `df2e3a0e3a5bf42962d279bab2fb01361d6b6b9fd63ec67baec7f79152325f8d` | 123 `946421d68a324522b360e4ce26dfc487b593d1063ab1e763dcd45acdd15573b5` | `0a0220a2b4b477a11f0974d382d8d97ec56f6b0a5f2748e58763660ce03435fc` |
| 9 | `eth-dir-1h` | 96 `83285590b57b47ac1b221089461c525b079ec1d9c9e6a99fe25f4f1a264a0ded` | 120 `41a6ef3570df6dc03498c830200466540506df983543eee51991a388bf3abdd4` | `f234e0fe34aa139cb8f12152e41035668942ef1f58163824d8842003955ea924` |
| 10 | `eth-dir-4h` | 96 `e0b2c9abc2e291388030fbf9a052964e0a9ee4fe2b1dec2de0767054332fe31d` | 120 `051033ec9672ef56868d9251e475c40666e9e9c9d061540732b0533f1774f9be` | `c0692930d80752faea21b92dc66368d87eda7a58ae722f2b3f8c2b18e48482bf` |
| 11 | `eth-range-1h` | 98 `33418324f090084d9c0f7aa4313c0402148e1b6fb763d89f1c97d17b30e45c9f` | 122 `d67b29daf9bac8aac5ed07cd675caa19832ae0f59f12d0218b65d6ceb8f144cf` | `b0aec0a3aaf0ca1398a9596d2974cf7c246681dbe56e8462601aefc5bfa26d8a` |
| 12 | `eth-range-4h` | 98 `775576785b08d9a3d9d8f314b8af2862dd3617cb5ef40e60459f72845164f2b0` | 122 `9833d101e539e07a31b0e45a58bf066bb1c76324dd7cc5497c25d2145e14eeb0` | `3aa29103cd057dc88641a4533843f9ce11d27519d5f02113f21be5f9fb7bb8b1` |
| 13 | `eth-mae-down-1h` | 101 `581dd76292ae68cabdb8fdb25cdb694d5bc4f3d515bf67be414beecc035cc829` | 125 `014f03e46581fccfdd59557d9101f9c7223d1d5b7e3e91099d38b9946afa914e` | `f0dad5aad506e2bebc318c2290d0b487c3df1118eeb274c973a4fa6a6ab0a764` |
| 14 | `eth-mae-down-4h` | 101 `303f0f4186b088e3f09c3914a9738d50852b035a28a9b3f9a6b117f8221e4574` | 125 `23d511827a31b93e10970cc66867a996e03a1563de7d312e63de9e81c3961781` | `a77b8432443f675d4889c8073ba16a328f87ac3d7eaa34bcc00ecaf005ad8077` |
| 15 | `eth-mae-up-1h` | 99 `95f8cf5896ba60142a46a555d2238057606aba1af15e665850fb667c4f1782eb` | 123 `a60cce8f0017fa40f5b588b1e3fa23903c58a95d17acc4fc98b5da69643e76aa` | `41196494ab01ff283505839e895f82e14fcc894bd06bc1c74991bc6092fa9188` |
| 16 | `eth-mae-up-4h` | 99 `60dac6d21ee2e348e223d889fb86bcb95e6a762592482bf710e8141b03d160d2` | 123 `4c8708aa8aa547141e654779af50981c7c038bc3b07ab56d305395098f3c9b27` | `4f31295ebd7d5592affadddf1b7ddf3d60e1e6df13afb88de494a56a8ad8eba2` |
| 17 | `bnb-dir-1h` | 96 `c306f4829c03319b2fbe153da55d6df5430adf8f25e50424436fe04bcf40b77a` | 120 `6844f0be0026c6d28bcb17e7c076c3f0b65e88e547420af2d7ae565612934152` | `91e4751e629d6d168251446577d23b00af208aefa39ae6b8bb590963b2f38057` |
| 18 | `bnb-dir-4h` | 96 `4148656549ce4e588f4cf95e71ef3fa06623fe1f1b580078b2f7edbf5ef38c7f` | 120 `adebeeba7474fe3d886912a3b37f0ccb84e2d8a4a36d843006ef17efa4cd5f05` | `36996ea2394f84c55fdbfbfb8cbd5299507b2cd05ec96515b2a2e503959925c0` |
| 19 | `bnb-range-1h` | 98 `1110f76302c709f694023a864524b1d93639f25220973e5c6bf68364acc5beeb` | 122 `619f6c354c152da9ac602ecb3ccb50c353f50f594c905416b8fda1b4928e74be` | `ad7ba4a5ab8d782be0c4c8ec30c1bbfed1c9a0e8b5a221098908e897faabbc1c` |
| 20 | `bnb-range-4h` | 98 `49b35460e4e1485a455a515e97ae41806ebc4362e5b6a424770e0475d2775b80` | 122 `4de60fee357f5a2d1ab2059b0a1250dc9a89d480fba41c4a5c2d253c8a8a8513` | `e03baaeb62afaca98206d2351adfea4f8c23dee1511cdb0f7d3c6ffaab38c8b3` |
| 21 | `bnb-mae-down-1h` | 101 `a348a699a3a6d8acfd1d2117f17a5c114474c52dd8c11be1aa2f4b1e89a54ee2` | 125 `7b7fa0dd0e3234f35b6985b1b82f93c555ec85d4b67223fe0ca75dfbcaa3a97f` | `22b452121e6842560a472912ddcf419100479f7aac4deca1e88068cb80be7a54` |
| 22 | `bnb-mae-down-4h` | 101 `ffb01eb5836010f1f5d9bec7d4ccebb62d3d2b132145f8b4939c0916bc82e68b` | 125 `79410dafaa75b40cb79600bc707beb74254f228defeee8393e24cc89989afd5a` | `baf3868c54925c9e96be11aa4513d3d729d7cf137d47fffd46c620d28b725da7` |
| 23 | `bnb-mae-up-1h` | 99 `c4b822362a77a89c6c168c695cd647d242a2b24ee993b4dd026d168ff7cc8c93` | 123 `40cff24fa44789fb09aaaf55dad35c00fa9384b4cd2d13c99c1b46ecb34ea627` | `96d31c282e38fc5d24a10b1b0ba72559d0275bec039c7e379bec5f5c5890f288` |
| 24 | `bnb-mae-up-4h` | 99 `47255e75e63d20b4e695313e6da4d369ae9ed6781434841760a5c3cec54e48dc` | 123 `2460ad816bcdf7890257495ef1d3a92a82362835f7713acb84299e618dfd1e4c` | `aa881258c0386ced81541f0631ebd279efc3871422ac7b5676e8c0266bd8adf8` |
| 25 | `sol-dir-1h` | 96 `9a0faf8acb0cbb0e6cb4a5d6a893ee5d2ce3123ac5df87ae6de73a1bee731622` | 120 `a37aa5c51d55a86daaa2f0e3d25ffb3f8ef9d23d01e7767155e086c73bfbab1d` | `a227a2773592229c60e26d14bd1d311efcfac5c279a69de31a5ffe86348e4243` |
| 26 | `sol-dir-4h` | 96 `6385d9ae3a21adf6e17f0989bfa42f3cbc864864af8cf43e7d91bd0945fe13bd` | 120 `1958b4b7230b2ee81ce7cdd27bd832e520d13d6cc3bf7c61d1e0ed00cb318127` | `29e8a39ef85da2ff0d2e6a80b29a5a560b62596938403eface772078eda249ba` |
| 27 | `sol-range-1h` | 98 `9dbe28822a91238933c76b24255e0c0abaaf4327e4c5954d84502882f3171748` | 122 `eceb4e3e21edde4762df45e3aaa26ab82bc95d82e84f95db72a5225a1f3574d6` | `224a4ef876deb8cf4eff9c09c8c22997426fe8d4dee83038cb8732cd730c21c1` |
| 28 | `sol-range-4h` | 98 `ecd4123bfc156f54768f9af2bfbdd0dc22a0edbdefe1d53b06bca7be16e93261` | 122 `08b082fb790ba5e078e9580f9f2da314ceb543978f0fb347c93efcfc1caa8aac` | `2844b89b00ccd8e4586e91b64fe35845517cdf08bb87df34da31efb023528666` |
| 29 | `sol-mae-down-1h` | 101 `d1dae26721dcbc357f9922d8833c1b70c0bbef588c084f319c6ff37b311e2fb5` | 125 `3a7d191c36c1fb2ea98c50676a2c3f27e351d54567e18c49cc209a64e5dc62bf` | `a48e313a43bba24a36a33f4346a6d39cd3a7bd9b2b38eabe8542d50e8a1809af` |
| 30 | `sol-mae-down-4h` | 101 `3dd0d88976e56d739c8f6fd07202856a4f3c4cb3fa3128878c2861147db9c430` | 125 `2d6b76b08e1cf30a5ea7a140c8d69a9bdf701bcac3e7b38297133c1c6191c404` | `62c18ade1cbf8c57936ab981cee9cdb5a73b63a048d9f81b6869a92c89616a8f` |
| 31 | `sol-mae-up-1h` | 99 `5695a0cac0fa83703c256bd2b3a5d831ce812f9254e30c3a30036c709cc2cc11` | 123 `896db5153ba28ff584ddf2d43c668c8304cd8627ebe982b8692db3c11a1d584e` | `0d4ca5611186a5de21c345ee2201a5318416457d9cedc0cde9cd5fff6b414f5a` |
| 32 | `sol-mae-up-4h` | 99 `406d60f5b02371bc74826e6385a92448e26cc72bb576168ff8de96b53fa18214` | 123 `558bae3b459ec1bf55a0de96af6fe76848f25672507e749df49433456b727782` | `b795a53a362815bc10af524d35f0921da064a63387cdc45fec107774213b7885` |

Tables marginales, inchangées : `cascade-liquidable-24h` `07bd085b4faafba67c03d2827bc690f5d082c7553b67491b86834345296b2465`, `liquidation-eligible-coverage` `3f957fd1b9d8061991637ae463dc95653f279c46bf490fa6c4ebde1c0a097bfd`, `stable-run-velocity-24h` `c7572e084a6765c5a145b54e3a93e1a0ee81b2ad6ccb38630399173454fbf0a8`. Empreinte des 35 couples `[task_class, policy_table_sha256]` de `SERVED_POLICY_TABLES` (`sha256(canonicalJson(...))`, épinglée par `kata_served_tables_digests`, condition (c) de MONARK : publié = servi) : `8da5dd421260d96e4b3dafa48733185b377df64261480aa92cdbeec9b462d2eb`.

## 3. La clause kata et la description de `/gate`

Clause (rendue, entre les marques) :

```
The 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` are served from their policy tables, which hold no committed calibration row: every well-formed kata call abstains with no region (under_calib, or non_evaluable on a dir lean of exactly 0), and no kata class has an attestation subject. A kata call carries a `predictor_id` of the form `kata:<kataId>@<venue>/<SYMBOL>/<h>` (no bucket, <h> the class horizon), a `features_digest`, alpha = 0.45, nMin = 6 on dir classes and alpha = 0.01, nMin = 299 on the others, tau at most 1 on dir classes, and a `produced_at` on the class horizon grid, received at most 300 s after it; the full request rules are in section 9 of the contract 1.1.0 specification.
```

**723 octets**, sha256 **`022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803`**.

Place : après la clause liq (`For 'liquidation-eligible-coverage' … ${liqClause}. `) et avant ``When the caller instead supplies a `calibration` ``, suivie d'une espace. Description servie de `gate` (`tools/list`, `/openapi.json`), état liq `committed` : **3 971 octets**, sha256 **`dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3`** (base : 3 247 octets, `bfb474f3…6443`). Aucune classe kata ne prend la forme `For '…'` : les classes `For '…'` restent les trois de `sync-harness-served.mjs:210-211`.

## 4. Recalcul depuis notre tête (`0b069d34` ou ce commit ; le code y est celui de la base)

1. Les 32 textes et les 32 phrases (sans le dépôt) :

```
node -e 'const {createHash}=require("node:crypto");const h=s=>createHash("sha256").update(s,"utf8").digest("hex");for(const a of ["btc","eth","bnb","sol"])for(const f of ["dir","range","mae-down","mae-up"])for(const z of ["1h","4h"]){const c=`${a}-${f}-${z}`,t=`no ${c} calibration is committed for this cell_key; the gate abstains and serves no region`,s=t+"; B_t is caller-carried.";console.log(c,Buffer.byteLength(t),h(t),Buffer.byteLength(s),h(s))}'
```

2. La clause : écrire le texte du §3 dans un fichier sans fin de ligne (`printf '%s' '<clause>' > clause.txt`), puis `sha256sum clause.txt` et `wc -c clause.txt`.

3. La description, depuis le code de la tête (base) plus la clause à sa place, à la racine de l'arbre (Node 24, `npm ci`) :

```
node --input-type=module -e 'import { createHash } from "node:crypto"; import { readFileSync } from "node:fs"; const g = await import("./apps/harness/src/tools/gate.ts"); const clause = readFileSync(process.argv[1], "utf8"); const at = "When the caller instead supplies a `calibration`"; const d = g.GATE_TOOL_DESCRIPTION.replace(at, `${clause} ${at}`); console.log(Buffer.byteLength(d, "utf8"), createHash("sha256").update(d, "utf8").digest("hex"));' clause.txt
```

Rejoué ici sur l'arbre de la tête (code de la base) : `3971 dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3`, égal à la mesure du gel. Les `policy_table_sha256` du §2 se recalculent sur l'arbre du gel, par `SERVED_POLICY_TABLES` de `apps/harness/src/tools/gate.ts`.

## 5. Ce que le gel ré-épingle (rappel, détail au G7 de D-2)

- `/openapi.json` en processus, contre la base `a8ae38c0` : `de635be9…7ba1` (après #168) → **`61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`** (`PENDING_BODIES_SHA256["/openapi.json"]`) ; les corps `/gate`, `/gate liquidation-eligible-coverage` et `/calibrate` ne bougent pas. (Contre `c01b87d7`, avant #168, c'était `ccae5fc0…844f` → `466b56d9…df4d6`, valeurs du commit `0b069d34`, remplacées par la fusion `2deaf7e8`.)
- `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json`, seuls `written_at` et `openapi_sha256` changent ; `harness-served.json` inchangé (`30afbec2…`) ; entrée du manifeste et `PINNED`, contre `a8ae38c0` : `cee3c6a0…f91e` → **`57cc4eae9b93fff342d0bcd1be4118443bad78cf1c571fb3969faf4211d67894`** (avant #168 : `f874bb44…` → `bed8a6ad…`).
- `node scripts/sync-ukemi-served.mjs --pending` lancé puis annulé : seul `written_at` bougeait ; `ukemi-pending.json` et son entrée restent `220c14c9…`.
- #168 est entrée dans la base (`a8ae38c0`) : fusion `2deaf7e8`, ces épingles refaites par-dessus ; les empreintes des §2 et §3 ne dépendent pas de #168 (remesurées : aucun écart).

## 6. Correction au G0 du bloc (N-6 de la G2 de D-1)

`docs/G0-bloc-d.md` §4.1, T-2 : le tueur est à `apps/harness/src/tools/gate.ts:762`, et non `:761` (ligne du motif réduit au gel de D-1, `b78ca20f`, comme le test l'écrit). Les notes N-2 et N-4 de cette G2 vont aux fermetures de D-3 ; N-5 va à NOTICE-1-1-0.
