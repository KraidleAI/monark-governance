# L-lecture — Token-2022 `SetAuthority` / `AuthorityType` (PR-B-SETAUTH), 2026-09-20

Lecteur `claude-sonnet-5` (effort max), mission MONARK/Bell **PR-B-SETAUTH** (procurement formé G0 `-b1-bis` l.106, reformé checkpoint-1 C-6 `docs/CHECKPOINT1-lot-t1a-ii-b3d.md` l.32, prérequis bloquant de L-1/L-2 du lot `T-1a-ii-b3d`). Discipline doc 03 (`[lu]`/`[abs]`/`[2nd]`, citations ≤ 25 mots, aucun chiffre de mémoire). Le lecteur n'écrit que ce fichier ; rien d'autre dans `F:\Monark`. Aucun commit, aucun appel à l'outil advisor intégré pendant l'extraction. Toutes les lectures datent du **2026-09-20**.

**Modèle résolu (Gate 0, R-1) : `claude-sonnet-5`** — préfixe conforme à l'attendu.

## En-tête

| Champ | Valeur |
|---|---|
| Dépôt | `github.com/solana-program/token-2022` — « The SPL Token 2022 program and its clients », org `solana-program`, branche par défaut `main`, créé `2024-05-09T11:24:35Z` (`api.github.com/repos/solana-program/token-2022`, [lu], vérifié curl) |
| Commit épinglé | `714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be` — **existe** (`api.github.com/repos/…/commits/714a2ce6…` → HTTP 200) ; auteur/committeur `github-actions[bot]`, date **2025-05-13T22:01:45Z**, message « Publish spl-token-cli v5.3.0 », parent `e3065cfb7673ec4b265a122ae72003922f031c98` ; ne modifie que `Cargo.lock` + `clients/cli/Cargo.toml` (bump 5.2.0→5.3.0) — commit d'automation de release, pas de changement de code ; sert ici de **point figé de l'arbre**, comme dans la lecture sœur ScaledUiAmount. [lu], vérifié curl. |
| Remplace le monorepo historique ? | **Oui, confirmé.** `solana-labs/solana-program-library` est `"archived": true` (`api.github.com/repos/solana-labs/solana-program-library`, [lu] vérifié curl). Son README (branche `master`, HEAD `264ca72de06b0c2b45c0b15d298000fe3f82db2e`, `2025-03-10T23:17:04Z` — **non épinglé**, vérification de contexte seulement) déclare verbatim : « PLEASE READ: This repo no longer contains the SPL program implementations » et liste `Token-2022` migré vers `https://github.com/solana-program/token-2022`. [lu], vérifié curl. |
| Licence | **Apache-2.0**, triple confirmation : (a) GitHub API `license.spdx_id = "Apache-2.0"` ; (b) `Cargo.toml:29` (racine, épinglé) `license = "Apache-2.0"` ; (c) fichier `LICENSE` (épinglé, 10173 octets) commence par « Apache License / Version 2.0, January 2004 ». `program/Cargo.toml:10` hérite `license = { workspace = true }`. [lu], vérifié curl. |
| Date de lecture | 2026-09-20 |
| Modèle | `claude-sonnet-5`, effort max |
| Outils utilisés | `Bash` (`curl` direct vers `raw.githubusercontent.com` et `api.github.com`, écriture dans le scratchpad session), `Read`, `Grep` (sur les fichiers bruts téléchargés) |
| Méthode de vérification | **Aucun WebFetch utilisé** — chaque fichier a été téléchargé par `curl` brut vers le scratchpad puis lu intégralement/grepé ligne à ligne (`Read`/`Grep`), sans étape de résumé par un modèle intermédiaire. Chaque affirmation ci-dessous est donc **« vérifié curl »** au sens le plus strict (texte brut lu directement, pas de résumé à recontrôler) ; ceci est noté explicitement par item plutôt que supposé. |
| Style/prérequis | Lu d'abord `F:\Monark\docs\biblio\bell\L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md` (fiche source, discriminants 25/TLV et 43/instruction, `ScaledUiAmountConfig`) pour ne pas répéter son travail ; ce fichier ne re-décrit **pas** `UpdateMultiplier`/`Initialize` (déjà [lu] là-bas), seulement `SetAuthority`/`AuthorityType`. Contexte d'usage lu : `docs/G0-lot-t1a-ii-b3d.md` (fait 10, L-1, item PR-B-SETAUTH) et `docs/CHECKPOINT1-lot-t1a-ii-b3d.md` (C-6, C-9). |

## (A) Fiche source par fichier (commit `714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be`)

| # | Fichier | Octets | Rôle dans cette lecture | Niveau |
|---|---|---|---|---|
| 1 | `program/src/instruction.rs` | 104 139 | `TokenInstruction::SetAuthority` (déclaration, pack, unpack), `AuthorityType` (enum + mapping), constructeur `set_authority()`, test croisé `spl_token` vs `spl_token_2022` | [lu] |
| 2 | `program/src/processor.rs` | 293 779 | `process_set_authority` (branches par `AuthorityType`, dont `ScaledUiAmount`), `validate_owner` (signataire simple/multisig), dispatcheur `process()` | [lu] |
| 3 | `program/src/pod_instruction.rs` | 8 235 | `PodTokenInstruction` (mirroir pod du discriminant), `SetAuthorityData`, `decode_instruction_data_with_coption_pubkey`, `unpack_pubkey_option` (chemin rapide utilisé par le dispatcheur) | [lu] |
| 4 | `program/src/extension/scaled_ui_amount/instruction.rs` | 5 130 | `ScaledUiAmountMintInstruction` (2 variantes seulement : `Initialize`, `UpdateMultiplier`) — confirme l'absence de sous-instruction d'autorité | [lu] |
| 5 | `program/src/extension/scaled_ui_amount/processor.rs` | 4 396 | `process_initialize`, `process_update_multiplier` — confirme qu'aucun des deux ne touche l'autorité par un autre chemin que `validate_owner` partagé | [lu] |
| 6 | `program/src/extension/scaled_ui_amount/mod.rs` | 12 994 (relu, extrait ciblé) | `ScaledUiAmountConfig { authority: OptionalNonZeroPubkey, multiplier, new_multiplier_effective_timestamp, new_multiplier }` — re-vérifié indépendamment (pas hérité de la lecture sœur) | [lu] |
| 7 | `program/Cargo.toml`, `Cargo.toml` (racine) | 2 928 / — | Licence, version crate `spl-token-2022 = 9.0.0`, dépendance **non-dev** `spl-token = "8.0"` (ligne 48) | [lu] |
| 8 | `LICENSE`, `README.md` (ce dépôt) | 10 173 / 7 218 | Texte de licence ; README ne mentionne pas explicitement la migration (0 occurrence "solana-labs"/"monorepo") | [lu] |
| 9 | `solana-labs/solana-program-library` — statut + README (`master`, non épinglé) | — | Confirmation croisée « dépôt remplacé » | [lu] (secondaire, hors périmètre d'épinglage) |
| 10 | Commit `4b153a1a7e7db0ae7677128c2cc681bf8c7b1b13` (PR #7562, « Add Pausable extension ») — métadonnées + diff via `api.github.com` | — | Ancre historique : ajout de `AuthorityType::Pause`/`…PausableExtension` par pur append | [lu] |
| 11 | `program/CHANGELOG.md`, `CHANGELOG.md` (racine) | — | 404 sur les deux chemins au commit épinglé | NON TROUVÉ |

## (B) Question 1 — `SetAuthority` : discriminant, layout binaire, comptes

**Discriminant (octet de tag) = `6`.** Confirmé par **deux chemins de code indépendants** dans le dépôt :
- Chemin « manuel » `TokenInstruction` : `unpack()` — `instruction.rs:774` `6 => { let (authority_type, rest) = … AuthorityType::from(t)… ; SetAuthority { … } }` ; `pack()` — `instruction.rs:918-925` `Self::SetAuthority { authority_type, ref new_authority } => { buf.push(6); buf.push(authority_type.into()); Self::pack_pubkey_option(new_authority, &mut buf); }`.
- Chemin « pod » rapide `PodTokenInstruction` (utilisé par le dispatcheur `processor.rs::process()`) : `pod_instruction.rs:61-72`, `#[derive(…, TryFromPrimitive, IntoPrimitive)] #[repr(u8)] pub(crate) enum PodTokenInstruction { … // 5 \n Revoke, \n SetAuthority, … }` — position ordinale 6 (0-indexé : InitializeMint, InitializeAccount, InitializeMultisig, Transfer, Approve, Revoke, **SetAuthority**), avec commentaires numérotés `// 0`/`// 5` dans le fichier confirmant l'absence de décalage.
- Dispatcheur : `processor.rs:1700-1710` `PodTokenInstruction::SetAuthority => { … decode_instruction_data_with_coption_pubkey::<SetAuthorityData>(input)? … Self::process_set_authority(…, AuthorityType::from(data.authority_type)?, new_authority) }`.

**Layout binaire exact** (octets après le tag) :
1. `[0]` = `6` (tag `TokenInstruction`/`PodTokenInstruction::SetAuthority`).
2. `[1]` = `authority_type: u8` — décodé via `AuthorityType::from(u8)` (chemin manuel, `instruction.rs:775-778,1182-1203`) ou struct pod fixe `SetAuthorityData { authority_type: u8 }` (`pod_instruction.rs:48-53`, 1 seul champ — le reste « ne peut pas être inclus comme donnée pod simple », commentaire source `pod_instruction.rs:51-52`).
3. `[2..]` = `new_authority` comme **`COption<Pubkey>`**, encodage **variable** : octet de présence `0` = `None` (**aucun octet supplémentaire**) ou `1` = `Some` suivi de **32 octets** (`PUBKEY_BYTES`) de clé publique. Deux implémentations identiques relues : `instruction.rs::unpack_pubkey_option`/`pack_pubkey_option` (`:1068-1089`) et `pod_instruction.rs::unpack_pubkey_option` (`:120-132`, utilisée par `decode_instruction_data_with_coption_pubkey`, `:138-148`, qui découpe `input[1..1+len(SetAuthorityData)]` puis passe le reste à `unpack_pubkey_option`). Toute autre valeur que `0`/`1` au niveau de l'octet de présence ⇒ `Err(InvalidInstructionData)` (`pod_instruction.rs:130`).

**Longueur totale de l'instruction** : `3` octets si `new_authority = None` (tag + type + présence=0) ; `35` octets si `new_authority = Some(pubkey)` (tag + type + présence=1 + 32).

**Comptes attendus** (doc source `instruction.rs:183-194`, code `processor.rs::process_set_authority:675-677` et `validate_owner:1937-1973`, constructeur `instruction.rs::set_authority():1488-1519`) :
- **Index 0** : `[writable]` le mint ou compte cible dont l'autorité change (jamais lui-même exigé signataire).
- **Index 1** : l'autorité **courante** — soit la clé simple `[signer]` (cas simple), soit l'adresse du **compte multisig lui-même** `[]` non-signataire (cas multisig).
- **Index 2..`2+M`** : `[signer]` les M comptes signataires individuels du multisig — présents **seulement** dans le cas multisig, lus depuis `account_info_iter.as_slice()` (tout ce qui suit l'index 1).

Le constructeur `set_authority()` (`instruction.rs:1488-1519`) confirme le même ordre côté client : `accounts.push(AccountMeta::new(*owned_pubkey, false))` (idx0), `accounts.push(AccountMeta::new_readonly(*owner_pubkey, signer_pubkeys.is_empty()))` (idx1, `is_signer` vrai seulement si aucun signataire multisig fourni), puis boucle sur `signer_pubkeys` (idx2+, chacun `[signer]` readonly).

**Piège de layout signalé** : ce `COption<Pubkey>` (présence + 32 octets **optionnels**, longueur totale variable) est **différent** du type `OptionalNonZeroPubkey` utilisé par `InitializeInstructionData.authority` de l'extension `scaled_ui_amount` (`extension/scaled_ui_amount/instruction.rs:74-79`, déjà lu dans la fiche sœur), qui est **toujours 32 octets fixes** (zéro = None, convention spl_pod). Un décodeur générique ne doit pas supposer une seule convention d'« optional pubkey » dans ce programme.

## (C) Question 2 — `AuthorityType` : liste complète, valeur de ScaledUiAmount, confirmation du chemin `SetAuthority`

**Enum complet** (`instruction.rs:1116-1157`, doc + déclaration ; mapping numérique explicite — **pas** de dérivation `#[repr(u8)]` implicite ni `num_enum` — via deux méthodes inhérentes `into()`/`from()` à `instruction.rs:1159-1204`) :

| Valeur | Variante | Doc source (verbatim, ≤ 25 mots) |
|---|---|---|
| 0 | `MintTokens` | « Authority to mint new tokens » |
| 1 | `FreezeAccount` | « Authority to freeze any account associated with the Mint » |
| 2 | `AccountOwner` | « Owner of a given token account » |
| 3 | `CloseAccount` | « Authority to close a token account » |
| 4 | `TransferFeeConfig` | « Authority to set the transfer fee » |
| 5 | `WithheldWithdraw` | « Authority to withdraw withheld tokens from a mint » |
| 6 | `CloseMint` | « Authority to close a mint account » |
| 7 | `InterestRate` | « Authority to set the interest rate » |
| 8 | `PermanentDelegate` | « Authority to transfer or burn any tokens for a mint » |
| 9 | `ConfidentialTransferMint` | « Authority to update confidential transfer mint and approve accounts… » |
| 10 | `TransferHookProgramId` | « Authority to set the transfer hook program id » |
| 11 | `ConfidentialTransferFeeConfig` | « Authority to set the withdraw withheld authority encryption key » |
| 12 | `MetadataPointer` | « Authority to set the metadata address » |
| 13 | `GroupPointer` | « Authority to set the group address » |
| 14 | `GroupMemberPointer` | « Authority to set the group member address » |
| **15** | **`ScaledUiAmount`** | **« Authority to set the UI amount scale »** |
| 16 | `Pause` | « Authority to pause or resume minting / transferring / burning » |

**L'autorité de l'extension ScaledUiAmount est `AuthorityType::ScaledUiAmount`, valeur numérique `15`** (`instruction.rs:1177` dans `into()`, `:1199` dans `from()`). Note : `from()` est `pub(crate)` (`instruction.rs:1182`) — **non exposé publiquement hors du crate** ; un client externe (TS/Rust hors ce crate) ne peut pas appeler cette fonction et doit ré-implémenter sa propre table de correspondance (exactement ce que fait cette lecture pour Bell).

**Confirmation : c'est bien par `SetAuthority` (pas par une instruction propre à l'extension 43/x).**
- L'enum de sous-instructions de l'extension, `ScaledUiAmountMintInstruction` (`extension/scaled_ui_amount/instruction.rs:23-67`), ne contient que **deux** variantes : `Initialize` et `UpdateMultiplier` — relu indépendamment, aucune troisième variante « SetAuthority »/« UpdateAuthority ». `IntoPrimitive`/`TryFromPrimitive` (`:21-22`) sur ces 2 seules variantes.
- Le processeur de l'extension (`extension/scaled_ui_amount/processor.rs:100-124`) ne route que `Initialize`/`UpdateMultiplier` ; aucun troisième bras.
- C'est le processeur **générique** `process_set_authority` (`processor.rs:668-970`) qui, dans sa branche mint (`PodStateWithExtensionsMut::<PodMint>`), traite `AuthorityType::ScaledUiAmount => { let extension = mint.get_extension_mut::<ScaledUiAmountConfig>()?; … extension.authority = new_authority.try_into()?; }` (`processor.rs:935-947`) — c'est-à-dire l'instruction générique `SetAuthority` (tag `6`) avec `authority_type = 15`, **et rien d'autre**.

## (D) Question 3 — `process_set_authority` pour `ScaledUiAmount` : contrôle de signataire, multisig, `new_authority = None`

Code intégral relu, `processor.rs:668-970` (fonction), branche `AuthorityType::ScaledUiAmount` à `processor.rs:935-947` :
```
AuthorityType::ScaledUiAmount => {
    let extension = mint.get_extension_mut::<ScaledUiAmountConfig>()?;
    let maybe_authority: Option<Pubkey> = extension.authority.into();
    let authority = maybe_authority.ok_or(TokenError::AuthorityTypeNotSupported)?;
    Self::validate_owner(program_id, &authority, authority_info,
        authority_info_data_len, account_info_iter.as_slice())?;
    extension.authority = new_authority.try_into()?;
}
```
(extrait, licence Apache-2.0 du dépôt source, 6 lignes)

**Contrôle de signataire** — `validate_owner` (`processor.rs:1937-1973`, code intégral relu) :
1. `expected_owner != owner_account_info.key` ⇒ `Err(TokenError::OwnerMismatch)` — l'account à l'index 1 doit **littéralement porter la même clé** que l'autorité actuellement stockée (`ScaledUiAmountConfig.authority`), que ce soit une clé simple ou l'adresse d'un compte multisig.
2. **Détection multisig** — heuristique sur le compte à l'index 1 : `program_id == owner_account_info.owner && owner_account_data_len == PodMultisig::SIZE_OF` (propriétaire = le programme Token-2022 **et** taille exacte d'un `PodMultisig` — pas un octet de type dédié). Si reconnu multisig : lit `PodMultisig` (`signers[0..n]`, `m`), itère les comptes **suivants** (`signers` = `account_info_iter.as_slice()`, indices 2..fin), exige `signer.is_signer == true` pour chaque clé appariée, requiert `num_signers >= multisig.m` (seuil M-of-N).
3. Sinon (cas simple) : exige `owner_account_info.is_signer` directement.
⇒ **Oui, le compte multisig figure dans les comptes de l'instruction (à l'index 1) même si ce sont ses membres qui signent** — son adresse propre doit égaler l'autorité stockée ; les membres signataires sont des comptes **distincts**, ajoutés après lui.

**Si `new_authority` est `None`** : le code ne fait **aucun cas spécial** — `extension.authority = new_authority.try_into()?;` s'exécute inconditionnellement après validation du signataire, qu'il s'agisse de `Some` ou de `None`. Conséquence, par chaînage de deux faits lus dans le même fichier :
- (a) si l'autorité *courante* est déjà `None`, la ligne `maybe_authority.ok_or(TokenError::AuthorityTypeNotSupported)?` échoue **avant même** la vérification de signataire ⇒ aucun `SetAuthority` ultérieur ne peut réussir sur une autorité déjà retirée (pas de chemin de réintroduction dans ce bras).
- (b) l'unique autre instruction touchant ce champ, `Initialize` (`extension/scaled_ui_amount/instruction.rs:24-27`), « Fails if the mint has already been initialized » (doc verbatim, ≤ 25 mots) — donc inutilisable après coup.
⇒ **Passer `new_authority = None` retire l'autorité de façon définitive** (aucune instruction de ce dépôt ne permet de la réintroduire ensuite). Raisonnement déduit du code lu, pas une citation directe d'un commentaire l'énonçant explicitement.

## (E) Question 4 — Piggyback : présence de l'ancienne autorité, possibilité de CPI

**L'adresse A (autorité courante) apparaît-elle TOUJOURS dans les comptes, clé simple et multisig ?** **Oui**, garanti on-chain, pas seulement par convention client : `validate_owner` (§D, point 1) exécute `expected_owner != owner_account_info.key ⇒ Err(OwnerMismatch)` **avant** de distinguer les deux cas — donc toute transaction qui exécute avec succès un `SetAuthority`/`AuthorityType::ScaledUiAmount` changeant l'autorité stockée doit avoir, à l'index 1 de cette instruction, un compte dont la **clé** est A, que A soit une paire de clés simple (alors signataire direct) ou l'adresse d'un compte multisig (alors non-signataire, ses membres signant séparément aux index 2+). Aucune voie de succès n'existe sans cette égalité de clé — le canal piggyback (scanner l'historique de A) ne peut pas manquer ce compte pour cette raison structurelle.

**CPI (inner instruction) : rien dans le programme ne l'interdit.** Relecture complète de `process_set_authority` (`processor.rs:668-970`) : le seul mécanisme sensible au contexte d'appel dans cette fonction est `CpiGuard` (`extension/cpi_guard`), et il n'apparaît que dans les branches `AuthorityType::AccountOwner` (`:701-707`, teste `cpi_guard.lock_cpi.into() && in_cpi()`) et `AuthorityType::CloseAccount` (`:736-740`) — toutes deux dans le bloc `PodStateWithExtensionsMut::<PodAccount>` (**compte-jeton**, `:681`), jamais dans le bloc mint (`PodStateWithExtensionsMut::<PodMint>`, `:748`) où vit `ScaledUiAmount`. Le dispatcheur `Processor::process` (`processor.rs:1626` et suite) ne fait qu'un décodage de tag puis un `match` — aucune recherche de `get_stack_height`/hauteur de pile/sysvar d'instructions dans tout le fichier (grep dédié, 0 résultat). **Conclusion, strictement d'après cette source** : rien n'empêche `SetAuthority`/`AuthorityType::ScaledUiAmount` d'être émis en instruction interne (CPI) — cohérent avec le fait que Token-2022 est routinièrement appelé en CPI pour ses autres instructions. **Non établi par cette lecture** : le comportement du décodeur TypeScript `rebase-produce.ts`/`rebase-crosscheck.ts` de Bell (scanne-t-il `meta.innerInstructions` en plus des instructions de premier niveau ?) — ce fichier n'a pas été ouvert dans cette passe, hors périmètre (mission = source du programme, pas le code Bell).

## (F) Question 5 — Pièges de décodage

1. **Aucune instruction « batch »/« wrapper »** : recherche dédiée (`grep -i "batch"` sur `instruction.rs` intégral) ⇒ **0 résultat**. [lu], vérifié curl (négatif confirmé, pas une absence supposée).
2. **Layout Token vs Token-2022 pour `SetAuthority`** : **identique** pour les variantes partagées, avec **preuve par test dans ce dépôt même** — `instruction.rs:2730-2751` construit `spl_token::instruction::set_authority(…, spl_token::instruction::AuthorityType::AccountOwner, …)` (crate externe **`spl-token = "8.0"`**, dépendance réelle non-dev déclarée `program/Cargo.toml:48`, pas un mock) et l'instruction Token-2022 équivalente, puis `assert_eq!(instruction_v3, instruction_2022)` — égalité **octet-à-octet** des deux `Instruction` (donc même tag `6`, même ordre de champs) pour `AccountOwner`. La différence entre Token et Token-2022 est **dans l'espace de valeurs** de `AuthorityType` : Token-2022 ajoute 13 valeurs (4-16) absentes du programme Token historique (qui n'a pas d'extensions). **Non établi par cette lecture** : la borne haute exacte déclarée par l'enum `AuthorityType` du crate `spl-token` (legacy) lui-même — ce crate n'a pas été ouvert dans cette passe (hors périmètre : source = `token-2022`, pas `token`).
3. **Décalage d'index historique — un cas confirmé, un cas non trouvé.**
   - **Confirmé par l'historique git du dépôt** (`api.github.com`, requêtes datées, hors contenu du commit épinglé lui-même mais sur le même dépôt) : le commit `4b153a1a7e7db0ae7677128c2cc681bf8c7b1b13` (PR #7562, « token-2022: Add Pausable extension », date de merge/committeur **2025-01-09T15:00:19+01:00**) a ajouté `AuthorityType::Pause = 16` et `TokenInstruction`/`PodTokenInstruction::PausableExtension = 44`. Le **diff exact** de ce commit sur `program/src/instruction.rs` montre un **pur append** : les lignes `AuthorityType::ScaledUiAmount => 15,` et `15 => Ok(AuthorityType::ScaledUiAmount),` sont du **contexte inchangé** (pas des lignes `+`/`-`), seules des lignes `+` apparaissent après elles pour `Pause`. Confirmé ancêtre direct du commit épinglé (`api.github.com/.../compare/4b153a1a…...714a2ce6…` ⇒ `status: "ahead"`, `ahead_by: 362`, `behind_by: 0`). ⇒ **`ScaledUiAmount = 15` était déjà stable avant l'ajout de `Pause`**, et l'historique observé montre un motif d'ajout strictement additif (jamais de renumérotation), au moins pour ce changement.
   - **Non trouvé** : le commit exact qui a introduit `AuthorityType::ScaledUiAmount` côté **programme** (`program/src/instruction.rs`). Recherches tentées (`api.github.com/search/commits`, requêtes journalisées en §I) : `"Add scaled ui amount"` (3 résultats, le plus proche est `22a6437b…`, **client** `clients/js-legacy` PR js-legacy#60, 2025-01-14 — postérieur et hors programme) ; `"Add the scaled ui"` (0 résultat). ⇒ **NON TROUVÉ** par cette passe ; la stabilité de la valeur `15` n'est donc établie qu'à partir du commit `4b153a1a…` (2025-01-09) jusqu'au commit épinglé (2025-05-13), pas depuis sa toute première introduction.
4. **`AuthorityType` n'est pas dérivé par `num_enum`** (contrairement à `PodTokenInstruction` et `ScaledUiAmountMintInstruction`, qui utilisent `#[derive(IntoPrimitive, TryFromPrimitive)]`) : ses méthodes `into()`/`from()` sont **écrites à la main** (`instruction.rs:1159-1204`), et `from()` est `pub(crate)` — non appelable hors du crate. Un décodeur externe (Bell) doit maintenir sa **propre** table, non importable.
5. **Deux conventions d'« optional pubkey » coexistent** dans le même dépôt (déjà signalé en §B) : `COption<Pubkey>` (présence + 32 octets **conditionnels**, longueur variable) pour `SetAuthority.new_authority`, vs `OptionalNonZeroPubkey` (32 octets **fixes**, zéro = None) pour `ScaledUiAmountMintInstruction::Initialize`'s `authority`. Piège de confusion direct pour un décodeur unique.

## (G) Ce que cette lecture n'établit pas

- Le commit exact d'introduction de `AuthorityType::ScaledUiAmount`/`TokenInstruction::ScaledUiAmountExtension` côté programme (recherches infructueuses journalisées en §I) — seule la fenêtre « stable au 2025-01-09, stable au 2025-05-13 (épinglé) » est établie.
- La date/l'epoch d'**activation mainnet** de l'extension ScaledUiAmount (identique au gap déjà ouvert par la lecture sœur, non ré-instruit ici — hors périmètre de cette procurement, qui portait sur `SetAuthority`/`AuthorityType`).
- La borne haute exacte de l'enum `AuthorityType` du crate legacy `spl-token` (dépendance déclarée `"8.0"`, source non ouverte dans cette passe).
- L'encodage bit-exact du sentinel « None » d'`OptionalNonZeroPubkey` (type externe `spl_pod::optional_keys`, crate non ouvert dans cette passe — seul le **nom du type** et son usage dans `token-2022` sont [lu]).
- Le comportement du décodeur TypeScript Bell (`rebase-produce.ts`/`rebase-crosscheck.ts`) vis-à-vis des `innerInstructions` — code produit non lu ici (hors périmètre : mission = source du programme on-chain uniquement).
- Tout comportement runtime réel (logs de transaction, exemples on-chain de `SetAuthority` sur `ScaledUiAmount` observés en production) — cette lecture est **uniquement** du code source statique, aucune transaction n'a été interrogée.
- La valeur littérale de `PUBKEY_BYTES` (utilisée partout comme « 32 octets ») provient du crate externe `solana-pubkey`, non ouvert dans cette passe ; c'est la constante standard universellement utilisée dans tout l'écosystème Solana (déjà utilisée sans contestation dans la lecture sœur), mais elle n'est **pas** définie dans `solana-program/token-2022` lui-même.

## (H) Table récapitulative

**Discriminants (tag `u8`, premier octet de l'instruction Token-2022)**

| Discriminant | Instruction | Source |
|---|---|---|
| 6 | `TokenInstruction::SetAuthority` / `PodTokenInstruction::SetAuthority` | `instruction.rs:774,918-922` ; `pod_instruction.rs:63-72` ; dispatch `processor.rs:1700-1710` |
| 43 | `TokenInstruction::ScaledUiAmountExtension` (préfixe de sous-instructions) | `instruction.rs:844,874` (déjà connu de la lecture sœur, re-confirmé) |

**`AuthorityType` (octet `[1]` d'un `SetAuthority`, valeurs `0`-`16`, table complète en §C)** — pertinent ici : `ScaledUiAmount = 15` (« Authority to set the UI amount scale »), seul chemin de changement de `ScaledUiAmountConfig.authority`.

**Comptes de `SetAuthority` (indices)**

| Index | Rôle | Flags |
|---|---|---|
| 0 | Mint/compte cible | `[writable]`, jamais signataire requis |
| 1 | Autorité courante — clé simple **ou** compte multisig | `[signer]` si clé simple ; `[]` (non-signataire) si adresse d'un compte multisig |
| 2..`2+M` | Signataires individuels du multisig | `[signer]`, présents **seulement** si idx1 est un multisig |

**Layout des données `SetAuthority`**

| Octets | Champ | Encodage |
|---|---|---|
| `[0]` | tag | `6` |
| `[1]` | `authority_type` | `u8`, table §C |
| `[2]` | présence `new_authority` | `0`=None (fin) / `1`=Some (suite) |
| `[3..35]` | `new_authority` (si présence=1) | `Pubkey`, 32 octets |

## (I) Journal des URL consultées (y compris infructueuses)

Toutes en `GET`, aucune clé/auth, aucun téléchargement de binaire — uniquement JSON API GitHub et fichiers texte brut (`raw.githubusercontent.com`).

| URL | Statut | Usage |
|---|---|---|
| `api.github.com/repos/solana-program/token-2022/commits/714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be` | 200 | Existence + métadonnées du commit épinglé |
| `api.github.com/repos/solana-program/token-2022` | 200 | Métadonnées dépôt + licence |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/instruction.rs` | 200 (104 139 o) | §B, §C, §F |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/processor.rs` | 200 (293 779 o) | §D, §E |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/pod_instruction.rs` | 200 (8 235 o) | §B (chemin pod) |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/extension/scaled_ui_amount/instruction.rs` | 200 (5 130 o) | §C (2 seules sous-instructions) |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/extension/scaled_ui_amount/processor.rs` | 200 (4 396 o) | §C |
| `raw.githubusercontent.com/.../714a2ce6.../program/src/extension/scaled_ui_amount/mod.rs` | 200 (12 994 o) | §C, re-vérification indépendante de `ScaledUiAmountConfig` |
| `raw.githubusercontent.com/.../714a2ce6.../LICENSE` | 200 (10 173 o) | Licence |
| `raw.githubusercontent.com/.../714a2ce6.../README.md` | 200 (7 218 o) | Identification (grep migration : 0 résultat) |
| `raw.githubusercontent.com/.../714a2ce6.../program/Cargo.toml` | 200 (2 928 o) | Version crate, dépendance `spl-token = "8.0"` |
| `raw.githubusercontent.com/.../714a2ce6.../Cargo.toml` | 200 | Licence racine |
| `raw.githubusercontent.com/.../714a2ce6.../program/CHANGELOG.md` | **404** | NON TROUVÉ |
| `raw.githubusercontent.com/.../714a2ce6.../CHANGELOG.md` | **404** | NON TROUVÉ |
| `api.github.com/repos/solana-labs/solana-program-library` | 200 | `archived: true` |
| `raw.githubusercontent.com/solana-labs/solana-program-library/master/README.md` | 200 (21 269 o) | Verbatim migration (non épinglé, corroboration seule) |
| `api.github.com/repos/solana-labs/solana-program-library/commits/master` | 200 | Date/sha du README lu (`264ca72d…`, 2025-03-10) |
| `api.github.com/search/commits?q=repo:solana-program/token-2022+Pause+AuthorityType` | 200, `total_count:0` | Recherche infructueuse (requête trop littérale sur message de commit) |
| `api.github.com/search/commits?q=repo:solana-program/token-2022+pausable` | 200, `total_count:8` | Trouvé `4b153a1a…` (PR #7562) |
| `api.github.com/repos/solana-program/token-2022/commits/4b153a1a7e7db0ae7677128c2cc681bf8c7b1b13` | 200 | Fichiers modifiés + diff patch (§F.3) |
| `api.github.com/search/commits?q=repo:solana-program/token-2022+"Add scaled ui amount"` | 200, `total_count:3` | Seul hit pertinent = client JS, pas programme ⇒ NON TROUVÉ côté programme |
| `api.github.com/search/commits?q=repo:solana-program/token-2022+"Add the scaled ui"` | 200, `total_count:0` | Recherche infructueuse |
| `api.github.com/repos/solana-program/token-2022/compare/4b153a1a...714a2ce6` | 200, `status:ahead, ahead_by:362, behind_by:0` | Confirme l'ancêtre direct |

## Chemins à ré-consulter

`https://github.com/solana-program/token-2022/blob/714a2ce6d2b5ed5f6df05b2dd3c92b2a2aa4e0be/program/src/{instruction.rs,processor.rs,pod_instruction.rs}` ; `…/program/src/extension/scaled_ui_amount/{instruction.rs,processor.rs,mod.rs}` ; `…/program/Cargo.toml` ; `https://github.com/solana-program/token-2022/commit/4b153a1a7e7db0ae7677128c2cc681bf8c7b1b13` (PR #7562).
