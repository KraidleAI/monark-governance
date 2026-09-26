Modèle résolu : claude-opus-5-5[1m]

# G1 — PR-1a MONARK Dōjō : noyau pur (score de détention, classe par la courbe, arbre de Merkle, espace de travail)

- **Worker** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, décision 133), effort max, contexte frais. Aucun commit, aucun workflow (R-20). Écrit pour vérification adversariale (R-21) : chaque chiffre porte sa commande ou sa ligne.
- **Mission** : `F:\tmp\dojo\mission-g1-pr1a.md` (25 lignes, sha256 `3a942b7d8b8ea1a62d70e6a3c50d44af5e4a64817b11c5be2e20320859fff235`). Consigne standard : `docs/CONSIGNE-STANDARD-G1.md` (point par point au §12).
- **Worktree** : `F:\Monark-wt-dojo`, branche `lot/dojo-snapshot-1`. HEAD à l'ouverture `1dd71f91a9d6335bac8001f1bded528cf909fd19` (conforme à la mission). `git status --short` à l'ouverture : ` M docs/adr/ADR-DOJO-PR-2B.md` — **non vide**, édition de l'autre worker annoncée par la mission, non touchée. Pendant le travail la branche a avancé à `29f645829bb59b1232948ba62f175c01390a6039` (auteur git `Kraidle`, 17:11:38 +0100, message « ADR PR-2b : Q-F tranchee … relu R-21 », `docs/adr/ADR-DOJO-PR-2B.md` seul, +5/−4 : l'édition de l'autre worker, committée hors de ce lot) ; aucun fichier de ce lot n'y figure.
- **Base de fusion** avec le tronc `lot/etude-suite` (`ed4d724` à la mesure) : `9ee4ab35b9ea17a9ac8de5affce14053466225a8` (`git merge-base HEAD lot/etude-suite`) ; `git diff --stat 9ee4ab3 HEAD` = les deux ADR sous `docs/**` (exclus de R-25). `git diff 1dd71f9 lot/etude-suite -- package-lock.json package.json tsconfig.json` : vide (les `node_modules` jonctionnés de `F:\Monark` sont ceux de cet arbre).
- **Temporaires et preuves** : `F:\tmp\dojo\` (sous-dossiers `pr1a-*`), `TEMP`/`TMP`/`TMPDIR` = `F:/tmp/dojo/pr1a-tmp`. Rien écrit sur C: (cache npm de l'utilisateur = `F:\cache\npm`, relu par `npm config get cache` ; les runs npm de ce lot passent `--cache F:/tmp/npm-cache`).

## 0. Journal (`date -u`)

- Avant 16:16:07Z (première horloge relevée ; les lectures la précèdent) : mission, ADR-mère en entier par tranches (849 l., sha256 `ae1281d50bf7baa6f4e919766c1b15d0ff974891cbeb8ccc0c0bf599c6fbc080` recalculé égal), FAITS PR-1a (version à jour : 50 l., sha256 `6086aa5ad94875b0b39886b24063e47248737d119b430853b899800376fd6eb2`, commit `7648e1a`, relue au pli G2 ; le G1 avait lu la version antérieure au §5, 40 l., `494e79f2…fdec`, commit `dc79237`), ADR de lot PR-2b par recherche des interfaces, précédents (`docs/G1-lot-bell-retry-1.md`, `docs/G1-lot-bell-adv-1.md`, `docs/CONSIGNE-STANDARD-G1.md`, `apps/sentinel/test/pool-rpc-1a.test.ts`, `apps/bell/test/bell-publish-chain.test.ts`, `apps/bell/scripts/bell-chain.mjs` et `.d.mts`), `package.json`, `tsconfig.json`, `.github/workflows/ci.yml` l.40-100, `docs/adr/ADR-BELL-OTS-PRB.md` l.212-222, `eslint.config.mjs`, `scripts/lint-ratchet.mjs`, `scripts/grep-forbidden.mjs`, `scripts/lang-gate.mjs`, `scripts/export-public.mjs` (tête). Advisor n°1 (§13).
- 16:16:07Z : `git archive 1dd71f9` → `F:\tmp\dojo\pr1a-oracle\base` ; 16:16:27Z oracle sur cette archive : 6/7 exit 0, `test` exit 1 sur un seul test, `bell_served_collector_revision_is_a_collector_commit`, qui exige un dépôt git (`fatal: not a git repository`) : l'oracle de référence se fait donc sur des clones (§7).
- ~16:2xZ : `dojo-core.mjs` et `.d.mts` écrits (outil Write, A-13), contrôle hors dépôt des exemples chiffrés de la mère (`F:\tmp\dojo\pr1a-tmp\sanity.mjs`) : tous égaux ; tests écrits, 12/12 puis 2/2 ; espace de travail (T-4).
- 16:31:15Z : clones `--no-local` (§6) ; oracle de base sur `pr1a-clone-base` (fin 16:38:00Z, 7/7 exit 0).
- ~16:3xZ : R-25 par deux méthodes = 978 (§6) ; 16:32:12Z `npm ci --dry-run` hors ligne sur copie (Q-1, §9).
- ~16:3xZ : mutants 27/27 tués (§5).
- 16:38:06Z : les 14 tests dojo ensemble (§4) ; 16:38:03Z → 16:44:36Z oracle complet après, sur `pr1a-clone` (§7, 7/7 exit 0).
- ~16:4xZ : rédaction de ce journal (outil Write, puis remplacements exacts par scripts Node). Deux incidents d'outillage A-13, détectés et corrigés, sans effet sur le code livré : (1) un extracteur de messages écrit par heredoc (`killmsg.mjs`, première version) a perdu la barre de `\d` et ne trouvait rien — réécrit par l'outil Write ; (2) un script de remplacement écrit par heredoc a converti `\t` d'un chemin Windows en tabulation dans une ligne de ce journal — ligne réécrite par un script écrit par l'outil Write ; contrôle : 0 tabulation hors du bloc `--numstat` du §6, 0 CR. Scripts de mesure : `r25.mjs` (heredoc) ne porte que des barres simples dans ses expressions régulières, conservées (relu : `/(\d+) insertion/`, `/'([^']*)'|(\S+)/g`) ; `run-oracle.sh` n'en porte aucune ; le harnais des mutants est écrit par Write ; les deux méthodes R-25 concordent (§6).

## 1. Sources (niveau)

- **[lu]** ADR-mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` au `29f6458` (identique au `1dd71f9`) : D-2 l.154-165, D-3 l.168-181, D-4 l.190, D-6 l.204-213, D-7 l.215-224, D-8 l.227, D-16 l.268-280, D-17 l.282-293, §6 PR-1a l.361-366, §7 l.417-482, amendements l.717-849. Chaque règle du noyau cite sa ligne dans le code (forme ASCII `ADR-DOJO-SNAPSHOT-1 D-16 (l.270)`, la forme `ADR-mère` de la mission portant un `è` contraire à CONSIGNE F-2).
- **[lu] par l'orchestrateur, reçu en entrée** : `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` (tronc `F:\Monark`, version à jour 50 l., sha256 `6086aa5ad94875b0b39886b24063e47248737d119b430853b899800376fd6eb2`, commit `7648e1a` sur `lot/etude-suite`, absente de cette branche) : §1 (RFC 6962 §2.1 = RFC 9162 §2.1.1, L-1, L-2), §2 (`is_on_curve`, L-3 à L-9), §5 (ajout de 16:53Z, relu au pli G2 : L-13 constantes de RFC 8032 §5.1 Table 1, L-14 alphabet base58 Bitcoin, L-15 décodage d'une adresse Solana par `five8::decode_32`, `MAX_BASE58_LEN` = 44).
- **[lu] par moi** : copies des sources de référence dans le brouillon de session `F:\tmp\claude\F--Monark\e03dd7cc-4452-4c79-9aa6-58827dad4d19\scratchpad\`, sha256 recalculés égaux aux préfixes des FAITS : `address_lib.rs` `9e00c07be57471b6…` (l.188-198 `bytes_are_curve_point` = `from_slice(...).decompress().is_some()`, l.320-322 `is_on_curve`) ; `dalek_edwards.rs` `503b92d41d9b1644…` (l.211-219 `decompress`, l.229-236 `step_1` : u = y² − 1, v = d·y² + 1, `sqrt_ratio_i` ; l.246-256 `step_2` : signe appliqué après coup, aucun rejet de x = 0) ; `dalek_field.rs` `9129d87e80e6d5ac…` (l.308-366 `sqrt_ratio_i` : `(Choice(1), zero)` si u = 0, `(Choice(0), zero)` si v = 0 et u ≠ 0, `was_nonzero_square = correct_sign_sqrt | flipped_sign_sqrt`) ; `dalek_field64.rs` `c0a773dd8e673116…` (l.385-395 `from_bytes` : bit haut masqué, « will happily decode 2^255 - 18 to 1 »).
- **[lu]** scripts de mesure de la mère, sha256 recalculés égaux au §14 de la mère : `m8-r0-daymin.mjs` `3e8c42db…` (cas E6, l.178-181 : 200 achetés au créneau 1 du jour 2, 50 vendus au créneau 5 du jour 40, 50 rachetés au créneau 3 du jour 45), `m4-validation.mjs` `e7063090…`, `m3-sizes-curve.mjs` `f30f518a…` (verdicts M3, et son `if (y >= p) return false` = exactement le mutant M-C2), `m2-rules.mjs` `a951c971…` ; validateur `F:\tmp\dojo\cp1b\rejeu-ambig2.txt` `37fbdf23…6176a4ff` (égal à la mère l.687) : cas (3) jour j10 et (4) 231 contre 231 000 000.
- **[2nd], anti-dette au §11** : (a) étapes de RFC 9162 §2.1.3.2 au-delà de la citation FAITS L-2 (boucle de décalage, test final `sn == 0`) : recodées de mémoire dans le test, toujours [2nd]. **Passées en [lu] au pli G2 par les FAITS §5** : (b) d = −121665/121666 et B (y = 4/5) : L-13, RFC 8032 §5.1 Table 1 (égalités recalculées : d = la valeur décimale de L-13 ; 4/5 mod p = y_B ; B vérifie l'équation de la courbe ; `ed25519OnCurve(y_B)` vrai) ; (c) alphabet base58 : L-14 (alphabet Bitcoin de `bs58`), et décodage d'une adresse : L-15 (`five8::decode_32`, 44 caractères au plus, 32 octets) ; seule l'égalité « alphabet de `five8` = alphabet Bitcoin » reste [inféré] (FAITS l.50). Précédent du dépôt conservé : `apps/bell/src/rebase-scan.ts:30-40`. Ancrages de première main : (a) accord exhaustif avec PATH de 6962 (FAITS L-1, cité en entier) pour n = 1..33 et tout m, plus les quatre chemins de l'exemple à sept feuilles ; (b) 64 clés publiques Ed25519 tirées par `node:crypto` à l'exécution, toutes sur la courbe ; d non carré et −1 carré vérifiés (§5, M-C) ; (c) les six adresses de la mère (l.54, l.57) décodent en 32 octets et se ré-encodent à l'identique.

## 2. Fichiers (créés ou modifiés ; aucun autre)

| Fichier | État | Lignes | sha256 (fichier de travail, LF, 0 CR) |
|---|---|---|---|
| `apps/dojo/scripts/dojo-core.mjs` | créé | 413 | `b1071f74b637a514f30f44195b04fe76df3c61c6df1aff2b954bc7b8a44f470b` |
| `apps/dojo/scripts/dojo-core.d.mts` | créé | 35 | `c5a8d5a8ac83362db49f6bd7034ea4c44dad51849ae4ac737a8114583566cddc` |
| `apps/dojo/test/dojo-core-hold.test.ts` | créé | 328 | `d9c828f9700d121008f5b8bc93d9bef42924ea9ecba566f0946fca00416cf94a` |
| `apps/dojo/test/dojo-core-curve-merkle.test.ts` | créé | 189 | `8721718c0262e10a90c6aa5bbb17ad46019ccf0f34d52904c833dca341c9dacd` |
| `apps/dojo/package.json` | créé | 7 | `5fac9690f0a38b3f0603b71d762399852379997112c184cad09a51adf4af238e` |
| `package.json` | modifié (+1 −1 : motif `"apps/dojo/test/*.test.ts"` ajouté au script `test`) | 33 | `d7a429e1afb7618b5b037f3923b01fb35fca5f76cdc6b5a49bfb20495b059700` |
| `tsconfig.json` | modifié (+3 −1 : `apps/dojo/src/**/*.ts`, `apps/dojo/test/**/*.ts`) | 36 | `e9f78b864977f387e67fde8810211c6a84e8e589abc4fec53d8c554882d3f72f` |
| `docs/G1-lot-dojo-pr1a.md` | créé (ce journal) | — | rendu hors du fichier |

- Comptes de CR et d'octets non ASCII refaits dans `node` (un premier `grep -c $'\r'` passé par le harnais comptait autre chose : invalide, écarté) : 0 CR partout ; 0 octet non ASCII dans les cinq fichiers créés ; `package.json` porte 3 octets non ASCII préexistants (un tiret long de `description`), 0 dans la ligne ajoutée.
- Écriture : fichiers longs par l'outil Write (A-13, borne de 6 Ko des commandes) ; `package.json` et `tsconfig.json` par remplacement exact contrôlé (`node -e`, occurrence unique vérifiée).

## 3. Le noyau : interface, règle, ligne de la mère

Pur : `node:crypto` seul (SHA-256), aucune I/O, aucune horloge, aucune valeur par défaut (aucun paramètre optionnel ; toute valeur métier est un argument) ; toute entrée mal formée lève (`dojo/core: …`). Montants, points, seuils : chaînes décimales canoniques `^(0|[1-9][0-9]*)$`, calcul en BigInt (D-2 l.160). **Série** d'une adresse : `series[i]` = valeur du jour i + 1, jour 1 = création du token (D-16 l.270), `null` = jour manquant.

| Fonction | Règle | Mère |
|---|---|---|
| `addressReading(accounts)` | lecture concordante ssi chaque compte l'est ; solde = somme ; `null` sinon ; `"0"` = absence concordante | C-9 D-2 l.157, D-4 l.190, C-1 D-7 l.217 |
| `dayValue(readings)` | minimum des lectures concordantes ; `null` (jour manquant) si aucune ; K ≥ 1 | D-2 l.158 |
| `stepLots(lots, day, value)` | LIFO : hausse = lot neuf né `day` ; baisse retirée du lot le plus récent ; `null` ne change rien ; lots `[montant, jour]` de D-7 | D-16 l.271, D-7 l.217, l.275 |
| `lotsOf`, `scoreOf` | pile au dernier jour ; S = Σ q × c(b, d), c = jours comptés dans [b, d] | D-16 l.272, D-2 l.159 |
| `validatedOf(series, W)`, `provisionalOf(series, W)` | validé ssi d − b + 1 ≥ W (jours calendaires, jour de naissance compris) | D-16 l.273, C-16 D-3 l.172 |
| `ageOf(series)` | jours comptés du plus ancien lot tenu, 0 si pile vide (Q-7) | exemple C-1 de D-2 l.158 |
| `unitsOf(series, W, T_1)` | floor(V^(W) / T_1), points validés seuls ; `null` avant la première version | D-3 l.173, D-7 l.217 |
| `tierOf(series, T_1, u, W)` | palier k ssi floor(V^(W_k) / T_1) ≥ u_k ; le plus haut ; 0 à 5, `null` avant la première version ; cinq paliers ; u_1 = 1, u strictement croissant ; W non décroissant | D-3 l.171-172, D-7 l.217, décision 224 |
| `holderCounted(class, series, dust)` | classe `holder` et valeur du dernier jour ≥ seuil (unités de base) ; faux sinon (jour manquant compris) ; `null` avant la première version | D-7 l.217, C-10, D-17 l.290 |
| `medianOfSeven(fractions)` | médiane de sept fractions exactes `[num, den]`, rendue réduite ; autre compte refusé (Q-4) | D-17 l.287 |
| `unitPrice(pi[7], sigma[7])` | médiane des π_d × σ_d × 10⁻³ (µ$ par unité de base) | D-17 l.287 |
| `unitThreshold(µ$, p)` | ceil(x / p) : T_1 = ceil(O_1 / p) et `dust_threshold` = ceil(`dust_threshold_microusd` / p) | D-3 l.174, D-17 l.290 |
| `base58Decode`, `ed25519OnCurve`, `ownerClass` | bit 255 masqué ; y réduit mod p, jamais rejeté ; u = y² − 1, v = d·y² + 1 ; sur ssi u = 0 ou (v ≠ 0 et u/v carré) ; hors courbe ⇒ `program` | D-6 l.206-211, C-8, FAITS §2 |
| `leafHash`, `nodeHash`, `rootOf`, `proofOf`, `verifyProof` | feuille SHA-256(0x00 ‖ ligne sans LF), nœud SHA-256(0x01 ‖ g ‖ d), coupe à la plus grande puissance de deux < n, sans duplication ; MTH({}) = SHA-256() ; PATH de 6962 §2.1.1 ; hachages hexadécimaux minuscules ; `verifyProof` rend `false` sur toute entrée mal formée | D-7 l.220, FAITS §1 |

**Chiffres du noyau** (aucun autre littéral métier) : 7 (valeurs de la médiane, D-17 l.287), 1000n (facteur 10⁻³, D-17 l.287), 5 (paliers, D-3 l.171), p = 2²⁵⁵ − 19 et d = −121665/121666 (Ed25519, RFC 8032 §5.1 Table 1, FAITS L-13), préfixes 0x00 et 0x01 (D-7 l.220). Les valeurs de l'ancre — W = 30 (D-16 l.270), fenêtres 30, 30, 30, 30, 180 (D-8 l.227), `dust_threshold_microusd` = 1 000 000 (D-8 l.227, décision 225 (7)) — sont des **arguments** ; elles n'apparaissent que dans les tests, ligne citée. Les décimales (6) n'entrent pas dans le noyau : le rendu en jetons-jours par décalage décimal est du site (D-3 l.173).

**Interface consommée par PR-2b** (ADR de lot l.35, l.283, l.287, l.500, l.546, l.579) : `ownerClass(address)` → `"holder" | "program"` ; `rootOf(lines)` sur les lignes sans LF, dans l'ordre fourni (tri à la charge de l'appelant) ; `dayValue(readings)` pour les jours lus (PR-2b calcule lui-même le minimum du jour rétroactif et remet `null` sur les fenêtres sans quorum, que le noyau traite en jours manquants).

## 4. Tests — noms exacts de la mère §6 PR-1a (l.363-365)

Commande (worktree, hors ligne, sans `node_modules`, `env -u` des huit variables payantes, A-7) : `node --test --test-reporter=spec "apps/dojo/test/*.test.ts"`. Sortie intégrale (`F:\tmp\dojo\pr1a-deliver\dojo-tests.log`) :

```
16:38:06Z
✔ dojo_owner_class_is_the_ed25519_curve_test (351.3495ms)
✔ dojo_merkle_root_and_proofs (201.0123ms)
✔ dojo_score_is_the_lifo_running_minimum (28.3056ms)
✔ dojo_units_never_rise_by_splitting (1878.0578ms)
✔ dojo_missing_day_neither_counts_nor_resets (0.3584ms)
✔ dojo_absence_reads_zero (0.2688ms)
✔ dojo_validation_after_thirty_days (0.4138ms)
✔ dojo_validated_points_match_the_closed_form (35.1907ms)
✔ dojo_units_never_rise_by_splitting_with_validation (74.3239ms)
✔ dojo_price_version_is_exact (0.7626ms)
✔ dojo_address_reading_needs_every_account_concordant (0.4667ms)
✔ dojo_migration_counts_lots_held_long_enough (0.8987ms)
✔ dojo_holder_counted_uses_the_dust_threshold (0.3525ms)
✔ dojo_sold_part_never_recovers (0.4231ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2175.6583
exit=0
```

| Test (nom de la mère) | Ce qu'il fixe (source) | Mutants visés |
|---|---|---|
| `dojo_score_is_the_lifo_running_minimum` | M2 (B) l.119 : [100, 150, 100] = 300, [100, 0, 100] = 100 ; transitions de `stepLots` ; 2⁵³ + 1 exact (D-2 l.160) ; oracle recodé (somme des minima glissants, D-16 l.278) sur 500 séries à graine fixe ; refus des décimales non canoniques | M-S1, M-S2, M-S3 |
| `dojo_units_never_rise_by_splitting` | M2 (A) l.118, l.125 : 30 unités pour 1 000 × 30 jours ; 29 adresses (28 × 34 + 48) = 29 ; 10 × 100 = 30 ; grille exhaustive deux adresses × 5 jours × {0, 10, 20} (9⁵ = 59 049 configurations), avec et sans jour manquant commun, W ∈ {1, 3} : unités et V jamais au-dessus du tout (236 196 contrôles) | M-S4, M-S5 |
| `dojo_missing_day_neither_counts_nor_resets` | D-2 l.158, D-16 l.271 ; M4 (D) l.127 : jour manquant commun en j10, lu en j29 : 2 900 validés | M-S6 |
| `dojo_absence_reads_zero` | C-1, D-2 l.158 : [100, 100, 100, 0, 0, 0, 100, 100] = 200 et âge 2 (500 et 5 en jours manquants) ; `"0"` du collecteur vide la pile | M-S7 |
| `dojo_validation_after_thirty_days` | M4 (D) l.127 : 29 j = 0 / 2 900 ; 30 j = 3 000 ; vente j20, rachat j21, lu j40 = 0 / 2 000 ; 4 100 au j40 ; D-16 l.275 : vente partielle d'un lot validé (1 640) et totale (0) ; unités sur les seuls validés (D-3 l.173) | M-S8 |
| `dojo_validated_points_match_the_closed_form` | forme fermée de D-16 l.278 recodée (p = dernier jour compté ≤ d − W + 1), 800 séries à graine fixe, jours manquants et zéros, W ∈ {1, 2, 3, 7, 30} : V, P et S | M-S9 |
| `dojo_units_never_rise_by_splitting_with_validation` | M4 (C) l.127 : 1 160 × 60 j, T_1 = 2 400 : 29 et 29 × 1 ; témoin de passation au jour 30 ; motif M4 (B) : 300 découpages quotidiens arbitraires entre 2 et 6 adresses | M-S10 |
| `dojo_price_version_is_exact` | D-17 l.287 : médiane exacte (non moyenne, non maximum), sortie réduite ; produits π × σ × 10⁻³ ; D-3 l.174 : ceil (334, 333, 2 858) ; refus | M-S12a, M-S12b, M-S13 |
| `dojo_address_reading_needs_every_account_concordant` | C-9 D-2 l.157, rejeu-ambig2 (3) : X = 100, Y = 50, Y sans quorum en j10 : 5 850 au j39 (5 450 en somme partielle) ; lecture sans quorum écartée du minimum ; minimum du jour épinglé contre le maximum, la première et la dernière lecture (pli G2, C-G2-1) ; liste vide (Q-3) | M-S15 ; sondes du G2 P-D1, P-D2, P-D3 (pli G2) |
| `dojo_migration_counts_lots_held_long_enough` | C-16 D-3 l.172, rejeu-ambig2 (4), M6 (F) l.134 : V^(180) = 231 contre 231 000 000 ; V^(30) = 31 000 231 ; paliers 4 et 5 ; palier sur les unités ; refus des paramètres | M-S11, M-S16 |
| `dojo_holder_counted_uses_the_dust_threshold` | D-7 l.217, D-17 l.290, C-10 : valeur du jour contre le seuil (pas le score) ; seuil paramètre ; `null` avant version ; ceil(1 000 000 / 3) = 333 334 | M-S14, M-S17 |
| `dojo_sold_part_never_recovers` | D-16 l.275, décision 228 : (a) vente totale puis rachat tenu 40 j : V = 4 000 ; (b) M8 (E6) l.145 : 8 700 validés et 750 provisoires au jour 60 ; (c) retour à zéro : rien | M-R1 à M-R5 |
| `dojo_owner_class_is_the_ed25519_curve_test` | FAITS §2 : point de base, y = 2 (3/(4d + 1) non carré recalculé), y = 1 canonique, en 2²⁵⁵ − 18 et avec bit de signe, zéro non canonique ; les 19 codages y ∈ [p, 2²⁵⁵) × 2 signes et y < 200 contre la référence recodée ; 64 clés `node:crypto` ; adresses de contrôle de D-6 l.207 (formes pleines l.57) : créateur et verrou `holder`, courbe de liaison, compte associé et pool `program` ; 64 aller-retour base58 | M-C1, M-C2 |
| `dojo_merkle_root_and_proofs` | FAITS §1 : racines n = 1..33 contre MTH recodé ; toutes les preuves contre RFC 9162 §2.1.3.2 recodé et `verifyProof` ; altérations refusées ; exemple à sept feuilles, chemins d0 [b, h, l], d3 [c, g, l], d4 [f, j, k], d6 [i, k] ; MTH({}) ; seconde préimage à 64 octets ; n impair sans duplication ; `verifyProof` sous une taille annoncée n + 1 contre 9162 recodé (pli G2, C-G2-5) | M-M1, M-M2 ; sonde du G2 P-M3 (pli G2) |

Aucun autre test nommé par la mère pour PR-1a : les tests de PR-1b-1, PR-1b-2 et suivants (l.368-416) ne sont pas de ce lot.

## 5. Mutants (liste fermée de la mère, sur copie hors dépôt)

Harnais `F:\tmp\dojo\pr1a-mutants\mutants.mjs` (sha256 `f71319a159655667908769f49e6557a354bfe13f7bbcf6c4fa085863a6799851`) : chaque mutant = remplacements exacts (occurrence unique contrôlée) appliqués à une **copie** de `apps/dojo` sous `F:\tmp\dojo\pr1a-mutants\<id>\` (écriture durable : `fsync` puis relecture du sha256, D-1-bis), fichier de test visé lancé en `--test-reporter=tap`, CRLF normalisé, « tué » seulement si le TAP porte `not ok N - <test visé>` (A-11) ; en-tête A-12 en tête de chaque `tap.txt` ; `mutation.txt` garde le couple avant/après. Contrôles non mutés : exit 0, 0 `not ok` (deux fichiers). Le fichier du dépôt n'est jamais écrit (sha256 relu égal à la fin du harnais : `tree file untouched: true`). Résultat : `F:\tmp\dojo\pr1a-mutants\RESULTS.txt` (sha256 `8c68852dc6668a5813c8efc6248caa666636df4d1fdc2095c977b9809b71a900`), **27 tués / 27, 0 survivant** (26 identifiants de la mère : 17 M-S, 5 M-R, 2 M-C, 2 M-M ; M-S12 en deux formes, moyenne et maximum, d'où 27 exécutions).

| Mutant | Mutation | Test visé (`not ok N - …`) | Échec observé dans le test visé (TAP) | Tests rouges au total |
|---|---|---|---|---|
| M-S1 | FIFO au lieu de LIFO | `dojo_score_is_the_lifo_running_minimum` | expected '300', actual '250' | 4 |
| M-S2 | aucune remise à zéro (une baisse ne change rien) | `dojo_score_is_the_lifo_running_minimum` | expected '300', actual '400' | 8 |
| M-S3 | arithmétique en nombre JavaScript | `dojo_score_is_the_lifo_running_minimum` | expected '9007199254740993', actual '9007199254740992' | 1 |
| M-S4 | plafond C = 100 par jour réintroduit | `dojo_units_never_rise_by_splitting` | expected 30n, actual 3n | 7 |
| M-S5 | droit binaire (1 si V ≥ T) | `dojo_units_never_rise_by_splitting` | expected 30n, actual 1n | 3 |
| M-S6 | jour manquant traité comme une baisse à zéro | `dojo_missing_day_neither_counts_nor_resets` | expected '300', actual '100' | 5 |
| M-S7 | absence concordante (`"0"`) traitée comme jour manquant | `dojo_absence_reads_zero` | expected '200', actual '500' | 6 |
| M-S8 | validation à W − 1 jours | `dojo_validation_after_thirty_days` | expected '0', actual '2900' | 2 |
| M-S9 | points validés gardés après la sortie du lot | `dojo_validated_points_match_the_closed_form` | expected '900', actual '4000' (série imprimée, W = 1) | 3 |
| M-S10 | unités comptées sur les points provisoires | `dojo_units_never_rise_by_splitting_with_validation` | expected 29n, actual 0n | 3 |
| M-S11 | palier sur les points au lieu des unités | `dojo_migration_counts_lots_held_long_enough` | expected 4, actual 5 | 1 |
| M-S12a | médiane remplacée par le maximum | `dojo_price_version_is_exact` | expected ['3', '2'], actual ['5', '1'] | 1 |
| M-S12b | médiane remplacée par la moyenne | `dojo_price_version_is_exact` | expected ['3', '2'], actual ['1165', '588'] | 1 |
| M-S13 | T_1 arrondi par défaut | `dojo_price_version_is_exact` | expected '334', actual '333' | 2 |
| M-S14 | `holder_counted` sur le score au lieu de la valeur du jour | `dojo_holder_counted_uses_the_dust_threshold` | expected false, actual true | 1 |
| M-S15 | somme partielle d'une adresse prise pour une lecture | `dojo_address_reading_needs_every_account_concordant` | expected null, actual '100' | 1 |
| M-S16 | Migration par l'âge du plus ancien lot validé | `dojo_migration_counts_lots_held_long_enough` | expected 4, actual 5 | 1 |
| M-S17 | seuil de poussière en littéral (1 000 000) au lieu du paramètre | `dojo_holder_counted_uses_the_dust_threshold` | expected true, actual false | 1 |
| M-R1 | forme RA : rachat tenu 30 jours qui rend les points perdus | `dojo_sold_part_never_recovers` | expected '4000', actual '10000' | 2 |
| M-R2 | rachat qui rend les points perdus à l'instant | `dojo_sold_part_never_recovers` | expected '4000', actual '10000' | 7 |
| M-R3 | forme RB : points rendus dans une banque qui survit aux ventes | `dojo_sold_part_never_recovers` | expected '4000', actual '10000' | 3 |
| M-R4 | lot racheté qui reprend le jour de naissance de la part vendue | `dojo_sold_part_never_recovers` | expected '4000', actual '10100' | 8 |
| M-R5 | forme K : la part vendue garde 70 % de ses points | `dojo_sold_part_never_recovers` | expected '4000', actual '8200' | 8 |
| M-C1 | toujours sur la courbe | `dojo_owner_class_is_the_ed25519_curve_test` | expected false, actual true | 1 |
| M-C2 | codage non canonique y ≥ p rejeté (verdict ≠ `is_on_curve`) | `dojo_owner_class_is_the_ed25519_curve_test` | expected true, actual false | 1 |
| M-M1 | sans préfixes 0x00 / 0x01 | `dojo_merkle_root_and_proofs` | expected '3c7e9bc9…0ccb', actual '2d711642…4881' (première assertion, feuille) ; hors test, collision de seconde préimage mesurée : `true` sous M-M1, `false` sans mutation (`F:\tmp\dojo\pr1a-tmp\mm1-check.mjs`) | 1 |
| M-M2 | dernière feuille dupliquée pour n impair | `dojo_merkle_root_and_proofs` | `root n=3`, expected 'b9fa42b5…d6fd', actual '237227ab…03db' | 1 |

- Extraction des messages : `F:\tmp\dojo\pr1a-tmp\killmsg.mjs` (lecture seule des `tap.txt`) ; messages complets dans `F:\tmp\dojo\pr1a-mutants\<id>\tap.txt`.
- Mutant équivalent déclaré, non compté : retirer la branche `if (v === 0n) return false` d'`ed25519OnCurve` ne change aucun verdict, v = d·y² + 1 ne s'annulant jamais (−1/d non carré : d non carré et −1 carré mod p, calculés hors dépôt le 26/09 : `d^((p−1)/2) = p − 1`, `(−1)^((p−1)/2) = 1`). La branche reste pour la conformité au texte de `sqrt_ratio_i`.

## 6. R-25 (mère §7 l.478 ; pathspec de `ci.yml:82` extrait du fichier, jamais retapé)

- **Méthode B, celle de la mission** (copie de l'index, méthode G1 PR-A) — exécutée dans un clone **isolé** `git clone --no-local --branch lot/dojo-snapshot-1 F:/Monark F:/tmp/dojo/pr1a-clone` (sans `alternates`, sans liens durs : un `git add -N` écrit l'objet vide dans le dépôt où il tourne, donc jamais dans `F:\Monark`) ; fichiers du lot copiés, puis `node F:/tmp/dojo/r25.mjs F:/tmp/dojo/pr1a-clone 9ee4ab3 --intent-to-add <les cinq fichiers créés>` (script sha256 `ad945944d43214a250bc190a641741b77202144e4fe3f1d9fc031de00bcb8c26` : lit `ci.yml` l.82, en extrait les 20 éléments du pathspec, lance `git add -N` dans ce clone seulement puis `git diff --shortstat 9ee4ab3 -- <pathspec>`, métrique de `ci.yml:90`). Sortie :

```
git diff --shortstat 9ee4ab3 -- <ci.yml:82>: 7 files changed, 976 insertions(+), 2 deletions(-)
CHANGED (ci.yml:90 metric) = 978
7	0	apps/dojo/package.json
35	0	apps/dojo/scripts/dojo-core.d.mts
413	0	apps/dojo/scripts/dojo-core.mjs
189	0	apps/dojo/test/dojo-core-curve-merkle.test.ts
328	0	apps/dojo/test/dojo-core-hold.test.ts
1	1	package.json
3	1	tsconfig.json
```

- **Méthode A, contre-épreuve sans aucune écriture**, dans le worktree : `git diff --shortstat 9ee4ab3 -- <pathspec>` (suivis : `2 files changed, 4 insertions(+), 2 deletions(-)`) plus `git diff --no-index --numstat /dev/null <f>` pour chaque fichier de `git ls-files --others --exclude-standard -- <pathspec>` (7 + 35 + 413 + 189 + 328 = 972) : **978**, égal.
- Re-mesure A à 16:45:32Z, ce journal présent : `git ls-files --others --exclude-standard` rend six fichiers, dont cinq dans le pathspec (972 lignes) — `docs/G1-lot-dojo-pr1a.md` en est exclu — et les suivis `2 files changed, 4 insertions(+), 2 deletions(-)` : **978**, inchangé.
- **978** lignes : sous le STOP de 1 150 (mère l.419, C-6) et la borne CI de 1 205 (`ci.yml:49`) ; aucune coupe (le repli déclaré, l.477 — « espace de travail, score, validation et paliers, puis courbe et Merkle » — n'est pas déclenché ; les deux fichiers de test suivent déjà cette ligne de coupe). Estimations : la mission dit 456 (second pli, l.450) ; la mère, au quatrième pli, dit **481** ascendantes, 952 à ×1,98 (l.475). Dérive mesurée 978 / 481 = ×2,03, au-dessus du pire facteur ×1,98 (l.419 ; information de calibrage, item Q-2). Ce journal (`docs/G1-lot-*.md`, `docs/**/*.md`) et `package-lock.json` sont exclus par le pathspec.

## 7. Oracle complet (A-3 : codes de retour capturés directement, `env -u` des huit variables payantes)

- Script `F:\tmp\dojo\run-oracle.sh` (sha256 `cdb2e9581969e9969bd3a9bf176561749669634e373fe13c4f721c444f416572`) : `npm run <gate> > <log> 2>&1; echo "<gate> exit=$?"` pour `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`.
- `node_modules` des clones par `F:\tmp\g2-garde2bi\mk-nm.ps1` (A-2), jamais dans le worktree : `entries: 220  monark: 10  fail: 0` ; `require.resolve('@monark/rpc-guard')` = `F:\tmp\dojo\pr1a-clone-base\packages\rpc-guard\src\index.ts` et `F:\tmp\dojo\pr1a-clone\packages\rpc-guard\src\index.ts`.
- **Avant** (clone `pr1a-clone-base` à `29f6458`, 16:31:15Z → 16:38:00Z) : 7/7 exit 0 ; `test` **1 331 / 1 329 pass / 0 fail / 2 skipped** (`out-clone-base\test.log`, sha256 `0d4b45a03a744508d14761e0c79fd6072a7e84a888d0d5070b1f718b7a497852`) ; `lint:ratchet` 69/69 (plafond atteint : un seul `no-unsafe-*` de plus dans un test rougirait).
- **Après** (clone `pr1a-clone`, les sept fichiers du §2 copiés, sha256 égaux à `DELIVERED.sha256` par `sha256sum -c` ; 16:38:03Z → 16:44:36Z) : **7/7 exit 0** ; `test` **1 345 / 1 343 pass / 0 fail / 2 skipped** (= 1 331 + 14, aucun test existant perdu ni rougi) ; `typecheck` exit 0 (les tests dojo sont dans le programme TS) ; `lint` exit 0 ; `lint:ratchet` **69/69** (inchangé : 0 violation `no-unsafe-*` ajoutée) ; `gate:vocab` 317 fichiers avant comme après (`apps/dojo` hors portée, mesuré) ; `lang:gate` et `export:check` OK (`apps/dojo` n'est pas exporté). Journaux : `F:\tmp\dojo\pr1a-oracle\out-clone\*.log`.
- Remarque : sur une archive sans `.git` (16:16:27Z), `test` rend 1 331 / 1 328 / 1 / 2, l'échec étant `bell_served_collector_revision_is_a_collector_commit` (exige un dépôt git) : environnement, pas code ; d'où les clones.

## 8. Ce que je n'ai pas fait, et pourquoi

- **`package-lock.json` non touché** : hors du périmètre d'écriture de la mission ; mesure et correctif au §9 (Q-1).
- Aucune fonction de composition de ligne (`holdOf`, champs D-7 réunis) : ni la mère (§6 l.363) ni la mission ne la listent ; la composition revient à l'éditeur (PR-3a) et au vérificateur (PR-1b-2), qui consomment ces fonctions.
- Aucune sélection de la version en vigueur (`effective_day`) : contrôle de PR-1b-2 (`version_not_in_force`, D-10 l.248) et du marcheur (PR-1b-1).
- Aucun décalage décimal ni rendu en jetons : site (D-3 l.173, `shiftDecimal`).
- Aucun ajout aux listes d'export, au registre, à la vitrine, à `vocab-banned.json` : PR-3b, PR-4a, PR-4b. `apps/dojo` n'est ni exporté (`scripts/export-public.mjs:45`, l.94-108) ni dans une portée de `gate:vocab`.
- Aucun réseau, aucun RPC, aucune clé committée (clés de test tirées à l'exécution, jamais écrites).
- Aucun texte public (mère §8 : aucun dans PR-1a).
- Renvoi à résoudre à la fusion : les commentaires des tests citent `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md`, committé sur le tronc (`lot/etude-suite` ; version à jour 50 l., sha256 `6086aa5ad94875b0b39886b24063e47248737d119b430853b899800376fd6eb2`, commit `7648e1a` ; première version `dc79237`, `494e79f2…fdec`) mais absent de `lot/dojo-snapshot-1` : le renvoi se résout quand la branche rejoint le tronc (acte de l'orchestrateur au G7).

## 9. Q-1 mesurée : l'espace de travail neuf exige deux entrées de `package-lock.json`

- Précédent : `227f217` (pli V-1 du checkpoint-2 de T-1a) ajoute au verrou `"apps/bell"` et `"node_modules/@monark/bell"` (8 lignes) après l'arrivée de `apps/bell/package.json` sans elles (`8e5752a`).
- Mesure sur copies `git archive 29f6458` (`F:\tmp\dojo\pr1a-npm\`), hors ligne, `npm ci --ignore-scripts --offline --dry-run --cache F:/tmp/npm-cache` : arbre d'origine exit 0 ; arbre + fichiers du lot **exit 1**, « `npm ci` can only install packages when your package.json and package-lock.json … are in sync » puis « Missing: @monark/dojo@0.0.0 from lock file » (`ci-dry-overlay.log`, sha256 `1419938eb1d3ede2a2e1df56a3137d3b1f40b2ba63513ea7fd02b58d8b9d2f7a`). Les jobs CI qui lancent `npm ci` (`ci.yml` l.140, l.153, l.166, l.202) rougiraient.
- Correctif produit sur la copie par `npm install --package-lock-only --offline --ignore-scripts` : exactement la forme du précédent, un bloc `"apps/dojo": {"name": "@monark/dojo", "version": "0.0.0"}` et un bloc `"node_modules/@monark/dojo": {"resolved": "apps/dojo", "link": true}` ; avec lui, `npm ci --dry-run` **exit 0** (`ci-dry-overlay-patched.log`, sha256 `2cac0651…5655`). Patch prêt : `F:\tmp\dojo\pr1a-deliver\pr1a-package-lock.patch` (sha256 `c4522ea6e9d58756fdfeb19ff512984d4a8af05c8378985b868260b207b05fef`, `patch -p1`), verrou complet `F:\tmp\dojo\pr1a-npm\overlay\package-lock.json` (sha256 `d4f3a4f8b27bd425732a7ef6b2ef03aa6ff6de0b64258fdfefd69b393baaaf52`).

## 10. Questions formées (choix fail-closed explicites)

- **Q-1 (bloquante pour une CI verte)** — `package-lock.json` doit porter les deux blocs de `@monark/dojo` (§9). Choix : fichier non touché (périmètre de la mission) ; patch mesuré prêt. Décision de l'orchestrateur : l'appliquer au G7, ou étendre le périmètre du lot. Sans lui, `npm ci` échoue.
- **Q-2 (information)** — estimation R-25 : 456 (mission, second pli l.450) contre 481 (quatrième pli l.475) ; mesuré 978, soit ×2,03 de 481, au-dessus du pire facteur mesuré ×1,98 (mère l.419). À reporter dans la table de dérive des lots suivants (PR-1b-1, PR-1b-2) : leur marge sous 1 150 est calculée à ×1,98.
- **Q-3** — lecture d'adresse à liste de comptes vide : la lettre de C-9 (« concordante ssi chacun de ces comptes l'est », solde = somme) la rend concordante et nulle (`"0"`), ce qui ne peut qu'abaisser un minimum ; l'alternative serait de lever. Choix : `"0"`, épinglé par `dojo_address_reading_needs_every_account_concordant`. **Corrigé au pli G2 (C-G2-6)** : le cas est légitime. Une adresse nouvelle n'a aucun compte aux lectures du jour qui précèdent son achat (D-2 l.157 : aucun compte rendu par un opérateur, aucun compte de la veille) ; sa lecture vaut alors 0, comme une absence concordante (C-1), et le jour d'achat vaut le solde d'avant l'achat, comme sur les jours rétroactifs (D-18 l.299). Le risque résiduel est une liste vide émise par erreur (comptes de la veille oubliés), qui viderait la pile en silence (LIFO). **Décision de l'orchestrateur (pli G2)** : le « 0 » sur liste vide est RETENU ; un test « comptes de la veille oubliés » est exigé à PR-2.
- **Q-4** — la ligne `anchor` publie `price_window_days` (7) comme paramètre (D-8 l.227), mais la mère nomme la fonction `medianOfSeven` (§6 l.363) et fixe sept valeurs (D-17 l.287). Choix : sept fixé dans le noyau, tout autre compte refusé. Conséquence à porter par PR-1b-1 : refuser une ancre dont `price_window_days` ≠ 7, ou la mère généralise la fonction.
- **Q-5** — étapes de RFC 9162 §2.1.3.2 au-delà de la citation des FAITS (L-2) recodées de mémoire ; leur accord exhaustif avec PATH de 6962 (FAITS L-1) pour n ≤ 33 en tient lieu dans ce lot ; demande de procurement §11 (a), toujours ouverte : la dernière phrase des FAITS (l.50) dit ces étapes reproduites en L-2, qui n'en cite que l'ordre des deux hachages (G2, C-G2-4, à l'orchestrateur).
- **Q-6** — **levée au pli G2** : d et B par FAITS L-13 (RFC 8032 §5.1 Table 1), l'alphabet par L-14, le décodage d'une adresse par L-15 ([lu], FAITS à jour `6086aa5a…6eb2`) ; reste [inféré] l'alphabet de `five8` (FAITS l.50) : §11 (b) close, (c) réduite.
- **Q-7** — « âge » est listé sans définition (§6 l.363) ; le seul chiffrage est l'exemple de C-1 (D-2 l.158 : âge 5 en jours manquants, 2 en lectures de 0), qui fixe « jours comptés du plus ancien lot tenu ». Choix pris de cet exemple ; l'âge de validation reste calendaire (d − b + 1, D-16 l.273).
- **Q-8 (choix d'interface hérités par PR-1b-1, PR-1b-2, PR-2, PR-2b, PR-3a)** — série indexée depuis le jour 1 ; lots `[montant, jour]` (D-7) ; fractions `[num, den]` en chaînes, rendues réduites ; hachages en hexadécimal minuscule ; palier 0 à 5 ou `null` ; `holderCounted(classe, série, seuil)` lit la valeur du dernier jour de la série ; `rootOf` ne trie pas (l'appelant trie par adresse, ou par jour puis adresse pour l'historique). À confirmer ou amender au G0 de PR-1b-1, jamais en silence.
- **Q-9** — la mission écrit « fenêtres sans quorum » dans T-1 ; la mère §7 l.450 dit « composition des comptes, fenêtres, seuil en paramètre », les fenêtres étant les W_k de C-16. Lecture retenue : fenêtres de palier (`validatedOf(series, W)`, `tierOf`) et composition C-9 ; un jour couvert par une fenêtre sans quorum de PR-2b (mère l.298) arrive au noyau en `null`, traité comme jour manquant (testé).
- **Q-10 (non bloquante, observation)** — la fonction de référence classe « sur la courbe » les points d'ordre faible : 32 octets nuls (y = 0, l'identifiant du Programme Système `11111111111111111111111111111111`) rendent `holder` (testé, verdict de la référence). Des jetons tenus par un compte dont le propriétaire serait un tel point seraient comptés, alors qu'aucune clé ne signe pour lui sous une vérification stricte (rejet des clés faibles : [2nd], non lu). Choix : C-8 (a) à la lettre (verdict de `is_on_curve`), aucune exception inventée ; l'adresse d'incinération usuelle `1nc1nerator11111111111111111111111111111111` est hors courbe, donc `program` (calculé). Suite : contrôle par la sonde (aucun compte du mint à propriétaire d'ordre faible, SNAPSHOT-PROBE-1 (b)) ou liste d'exclusion déclarée (P-6) ; décision de l'orchestrateur.
- **Q-11** — formée au pli G2 : refus explicite au-delà de 44 caractères (FAITS §5, L-15) cité, impliqué et mesuré, non ajouté (voir §16).

## 11. Demandes de procurement (règle Dettes)

- **(a) RFC 9162** « Certificate Transparency Version 2.0 », B. Laurie, E. Messeri, R. Stradling, IETF, décembre 2021, DOI `10.17487/RFC9162`, §2.1.3.2 « Verifying an Inclusion Proof » (texte intégral de l'algorithme). Tentative : aucune, réseau interdit par la mission ; la page a été lue sur place par l'orchestrateur (FAITS L-2) mais seule la ligne des deux ordres de hachage est citée. Usage : relecture [lu] de `verify9162` (`apps/dojo/test/dojo-core-curve-merkle.test.ts`). Voie : lecture sur place par l'orchestrateur et ajout des étapes au FAITS.
- **(b) RFC 8032** « Edwards-Curve Digital Signature Algorithm (EdDSA) », S. Josefsson, I. Liusvaara, IRTF, janvier 2017, DOI `10.17487/RFC8032`, §5.1 (d = −121665/121666, B = (x, 4/5)) ; ou `curve25519-dalek/src/constants.rs` (`EDWARDS_D`) au même commit que `edwards.rs` des FAITS L-7. **Close au pli G2** : RFC 8032 §5.1 Table 1 lue sur place par l'orchestrateur (FAITS L-13, 16:53Z, copie sha256 `ed63657ff3893012…`) ; d, y_B et l'équation de la courbe en B recalculés égaux ; citée dans le noyau (l.275, l.286) et les tests (l.24, l.55).
- **(c) Alphabet base58 de Solana** : source de référence (documentation Solana des adresses, ou crate `bs58` / `five8` employée par `solana-address`). **Réduite au pli G2** : l'alphabet Bitcoin (L-14, `bs58-rs` `src/alphabet.rs` l.39-40) et le décodage d'une adresse (L-15, `solana-address` l.62, l.114-131) sont [lu] ; reste la source de la crate `five8` (décodeur appelé par `FromStr`, L-15) pour lire son alphabet. Tentative : l'orchestrateur ne l'a pas trouvée aux chemins essayés (FAITS l.50). Usage : passer l'égalité « alphabet de `five8` = alphabet Bitcoin » de [inféré] à [lu].

## 12. Consigne standard : point par point

- **A-1** fait (première ligne). **A-2** fait dans les copies (§7), jamais dans le worktree. **Jonctions laissées en place** vers `F:\Monark\node_modules` dans trois arbres, gardées pour un rejeu de l'oracle au G2 : `F:\tmp\dojo\pr1a-oracle\base`, `F:\tmp\dojo\pr1a-clone-base`, `F:\tmp\dojo\pr1a-clone` ; retrait seulement par `F:\tmp\g2-garde2bi\rm-nm.ps1 -Tree <arbre>` pour chacun des trois, **avant** toute suppression de `F:\tmp\dojo` (une suppression récursive traverserait les jonctions jusque dans `F:\Monark\node_modules`), jamais `Remove-Item -Recurse` ni `rm -rf`. **A-3** fait (§7). **A-4** fait : `F:\tmp\dojo\pr1a-deliver\DELIVERED.sha256` (chemins relatifs au worktree, sept fichiers), aucun commit, rien sur C:, aucun réseau. **A-5** fait (§6 : 978 ≤ 1 150, pathspec extrait verbatim de `ci.yml:82` ; la consigne dit `:65`, la ligne est `:82` dans cet arbre, comme le dit la mission). **A-6** : aucun fichier du gel U-4b touché (le lot n'écrit que les sept fichiers du §2). **A-7** fait (tests, mutants, oracle sous `env -u` ; aucune variable affichée). **A-8** n-a (aucun tuyau externe dans ce lot ; le noyau reçoit des valeurs du collecteur, PR-2). **A-9**, **A-10** n-a (aucune phrase ni surface servie). **A-11** fait (§5). **A-12** fait (en-têtes des TAP et de `run-oracle.sh`). **A-13** fait (Write pour les fichiers longs ; les `\\` du harnais écrits par Write).
- **B-1 à B-6**, **C-1 à C-4**, **E-1 à E-3** : n-a (aucun transport, aucune clé, aucune erreur de transport, aucun état).
- **D-1** fait (14 tests, chacun avec au moins un mutant visé et tué). **D-2** fait (vecteurs non vides, valeurs recomputées, grilles et graines fixes). **D-3** n-a pour PR-1a : le noyau n'est consommé par aucun chemin servi à ce jour (§14). **D-4** n-a (aucun test existant modifié). **D-1-bis** fait (copies, écriture durable relue).
- **F-1** : tuyaux au §14 ; aucun renvoi à `F:\tmp` dans les sources. **F-2** fait (ASCII, 0 octet non ASCII dans les fichiers créés ; `gate:vocab` ne couvre pas `apps/dojo`). **F-3** fait (§10, §11).

## 13. Consultations advisor (outil intégré, avis jamais verdict)

- **n°1** (après l'orientation, avant l'écriture) : verrou (mesurer `npm ci`, produire le patch, Q-1) ; mutants M-R1 à M-R5 inclus (mère l.363, l.478) et cas qui les tue vraiment (le rachat de E6 n'a que 15 jours au jour 60 : c'est le cas (a) qui tue M-R1, vérifié) ; R-25 481 contre 456 ; sources [2nd] à déclarer et ancrer (clés `node:crypto`, adresses de 32 octets, sources dalek du brouillon) ; Q-3, Q-7, Q-8 ; citations ASCII ; noms de tests exacts ; R-25 dans un clone, jamais dans le worktree ; oracle sur copie ; pièges de typage. Suivis, chacun vérifié sur pièce. Écart assumé : le clone est `--no-local` (et non `--shared`), un `git add -N` dans un clone à `alternates` pouvant rafraîchir un objet du dépôt source.
- **n°2** (16:48Z, livrables durables) : revue finale. Suivis : compte des identifiants de mutants corrigé (26, et non 25, §5) ; avertissement sur les jonctions laissées dans trois arbres (§12 A-2) ; liste exhaustive des commandes git en lecture seule (§15) ; renvoi des tests au FAITS absent de cette branche (§8). L'advisor confirme le clone `--no-local` et retire sa suggestion `--shared` du n°1. Conseil, jamais verdict ; chaque point vérifié sur pièce (dont `dc79237` ci-dessous).
- **n°3** (pli G2, ~17:43Z, livrables du pli durables) : revue finale du pli. Confirme : les quatre corrections appliquées telles que spécifiées ; C-G2-2 et C-G2-4 laissées à l'orchestrateur ; Q-11 déclarée ; R-25 = 983 expliqué ; l'attribution de M-S15 rapportée en deux temps (arrêt du harnais à l.257, puis valeur 40 au lieu de 70 au niveau de l'assertion). Demandes suivies : consigner cette consultation, renvoi de Q-11 au §10, ligne de provenance du pli au §15, empreinte du journal recalculée après la dernière édition seulement. Conseil, jamais verdict.

## 14. Tuyaux (règle Branchement)

- Entrée : les appels du collecteur (PR-2), du collecteur d'historique (PR-2b : `ownerClass`, `rootOf`), de l'éditeur (PR-3a) et du vérificateur (PR-1b-2). Sortie : valeurs pures rendues à ces appelants. État : aucun. Test : les 14 tests de ce lot (unitaires, non-LLM).
- **Statut : non branché** — aucun chemin servi ne consomme encore le noyau ; la pièce reste `upcoming` (mère §5 l.355). Le branchement est porté par les tuyaux TU-1 à TU-12 et leurs tests d'intégration des PR suivantes (mère §5), pas par ce lot.

## 15. Provenance et fichiers livrés

| Date | Objet | Modèle | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-26 | G1 PR-1a : `apps/dojo/**`, `package.json`, `tsconfig.json`, ce journal, non committés, base `9ee4ab3`, branche à `29f6458` | `claude-opus-5-5[1m]` | max | mission `mission-g1-pr1a.md` ; ADR-mère ; ADR de lot PR-2b ; FAITS PR-1a ; sources dalek ; scripts M2-M8 | worker | relecteur G2 frais, checkpoint-2, G7 (orchestrateur) | à venir |
| 2026-09-26 | Pli G2 du G1 PR-1a (C-G2-1, C-G2-3, C-G2-5, C-G2-6), même lot non committé, branche à `29f6458` | `claude-opus-5-5[1m]` | max | rapport G2 `8dd72861…` ; message de l'orchestrateur ; FAITS à jour `6086aa5a…` (`7648e1a`) | worker (générateur du G1) | checkpoint-2, puis G7 (orchestrateur) | CORRECTIONS D'ABORD (verdict avant le pli) |

- `DELIVERED.sha256` : `F:\tmp\dojo\pr1a-deliver\DELIVERED.sha256` (sha256 des sept fichiers du §2 hors ce journal ; `sha256sum -c` depuis le worktree).
- Git : commandes en lecture seule dans le worktree (`status`, `rev-parse`, `log`, `show`, `diff`, `merge-base`, `ls-files`, `ls-files --eol`, `archive`, `get-tar-commit-id`, `diff --no-index`, `count-objects`, `config --get`, `cat-file -e`) ; `git clone --no-local` vers `F:\tmp\dojo\` ; `git add -N` dans le seul clone `F:\tmp\dojo\pr1a-clone`. **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun `add`, `commit`, `stash`, `checkout` ni `branch` dans le dépôt.
- `git status --short` final (worktree) : `M package.json`, `M tsconfig.json`, `?? apps/dojo/`, `?? docs/G1-lot-dojo-pr1a.md` — rien d'autre (l'édition de l'autre worker, visible à l'ouverture, a été committée en `29f6458`).

## 16. Pli G2 (2026-09-26, 17:29:40Z → 17:4xZ)

- **Entrée** : rapport G2 `F:\tmp\dojo\g2-pr1a\G2-report.md` (229 l., sha256 `8dd72861df4daeddd631b25f6253b827cfc39772f2808c683e3e77bf8f9b4ef7` recalculé égal, lu en entier), verdict CORRECTIONS D'ABORD ; message de l'orchestrateur : C-G2-1, C-G2-3, C-G2-5 et C-G2-6 au worker ; C-G2-2 et C-G2-4 à l'orchestrateur ; Q-3 : « 0 » retenu. FAITS relus dans leur version à jour (50 l., sha256 `6086aa5a…6eb2`, commit `7648e1a`, §5 : L-13 à L-15).
- **Horloge** (`date -u`) : lecture du rapport 17:29:40Z ; éditions 17:31:57Z → 17:35:50Z ; tests 17:32:37Z ; mutants 17:33:07Z → 17:33:50Z ; R-25 17:34:15Z ; oracle 17:34:31Z → 17:40:57Z ; empreintes 17:41:06Z.

| # | Fichier : lignes (après le pli) | Contenu | Preuve |
|---|---|---|---|
| C-G2-1 (bloquante) | `apps/dojo/test/dojo-core-hold.test.ts` l.262-264 | texte du G2 (deux lignes de commentaire et `assert.equal(dayValue([["100", "50"], ["40", null], ["40", "30"], ["90", "80"]]), "70")`, lectures 150, sans quorum, 70 et 170) ; « P-34 » ajouté à la citation de la première ligne, comme le demande le message de l'orchestrateur | la même expression sur les copies mutées rend 170 (P-D1, maximum), 150 (P-D2, première lecture), 170 (P-D3, dernière lecture) et 40 (M-S15, somme partielle) au lieu de 70 (`F:\tmp\dojo\pr1a-mutants-pli\assertion-check.log`, sha256 `d5c7d355…d30c`) ; au harnais, les trois sondes rendent `not ok 9 - dojo_address_reading_needs_every_account_concordant` (expected '70', actual '170', '150', '170') ; M-S15 rougit le même test, arrêté plus tôt par l'assertion l.257 (expected null, actual '100') |
| C-G2-3 | `dojo-core.mjs` l.256-257 (alphabet : FAITS L-14 ; Solana : `five8::decode_32`, 44 caractères au plus (`MAX_BASE58_LEN`), 32 octets : L-15 ; précédent Bell conservé), l.275 (p : L-13), l.286 (d : L-13), l.306 (`ownerClass` : autres longueurs refusées, 45 caractères ou plus décodant en 33 octets ou plus, L-15) ; tests `dojo-core-curve-merkle.test.ts` l.24 et l.55 (L-13) ; journal l.13, 25, 28, 67, 195, 209, 210, 219-220, lignes des deux tests au §4 | renvois aux FAITS §5 à la place des sources [2nd] ; dans le code, commentaires seulement, en place, aucune ligne ajoutée | recalculé : d = la valeur décimale de L-13, 4/5 mod p = y_B de L-13, B vérifie −x² + y² = 1 + d·x²·y², `ed25519OnCurve(y_B)` vrai ; la plus petite longueur décodée d'une chaîne de 45 à 120 caractères vaut 33 octets (atteinte à 45 caractères, sans « 1 » de tête) ; `ownerClass` refuse 16 chaînes sur 16 de 45 à 60 caractères |
| C-G2-5 | `dojo-core-curve-merkle.test.ts` l.157-158 | texte du G2 : `verifyProof(line, m, n + 1, path, root)` égal au verdict de 9162 recodé | P-M3 (comparaison des longueurs retirée) rend `not ok 2 - dojo_merkle_root_and_proofs` (expected false, actual true) ; sur copie, n = 2, m = 0, taille annoncée 3 : `verifyProof` vrai sous P-M3, faux sans mutation ; 9162 recodé : faux |
| C-G2-6 | journal §10, Q-3 (l.207) | phrase inexacte remplacée : une adresse nouvelle n'a aucun compte aux lectures qui précèdent son achat (D-2 l.157), sa lecture vaut 0 ; décision de l'orchestrateur consignée (« 0 » retenu, test « comptes de la veille oubliés » exigé à PR-2) | — |

- **Non faits, pour l'orchestrateur** : C-G2-2 (`package-lock.json` ; patch `F:\tmp\dojo\pr1a-deliver\pr1a-package-lock.patch` inchangé, sha256 `c4522ea6…5fef`) ; C-G2-4 (phrase de FAITS l.50 sur L-2) ; lignes de l'orchestrateur Q-2, Q-4, Q-8 et Q-10 (G2 §5). `package-lock.json` et les FAITS ne sont pas touchés.
- **Q-11 (formée au pli)** : la conséquence (2) de FAITS §5 décrit, pour `base58Decode`, un refus au-delà de 44 caractères. L'instruction du pli demande des renvois, pas un changement de comportement. Choix : aucun refus explicite ajouté ; il est impliqué pour `ownerClass` (mesuré ci-dessus), et `base58Decode` reste un décodeur général. Si l'orchestrateur veut le refus explicite : une ligne dans `ownerClass` (ou `base58Decode`), et l'assertion l.97 du test courbe à adapter (son entrée de 45 caractères échouerait avec un autre message).
- **Tests après** : `node --test --test-reporter=spec "apps/dojo/test/*.test.ts"` (worktree, hors ligne, `env -u` des huit variables payantes) donne 14 tests, 14 pass, 0 fail, exit 0 (17:32:37Z ; `F:\tmp\dojo\pr1a-deliver\dojo-tests-pli.log`, sha256 `f73614ed…3e17`).
- **Oracle complet après**, sur `pr1a-clone` (les sept fichiers du pli copiés ; `sha256sum -c DELIVERED-pli-g2.sha256` : 7/7 dans le clone), 17:34:31Z → 17:40:57Z : 7/7 exit 0 ; `test` **1 345 / 1 343 / 0 / 2**, les 14 `dojo_*` verts ; `lint:ratchet` 69/69 ; `gate:vocab` 317 fichiers (`F:\tmp\dojo\pr1a-oracle\out-clone-pli\exits.txt` sha256 `3943c3b3…65d5`, `test.log` sha256 `ae6cc511…e891`).
- **Mutants rejoués** : harnais du pli `F:\tmp\dojo\pr1a-mutants-pli\mutants.mjs` (sha256 `020883dc…0099`), dérivé de celui du G1 par `make-harness.mjs` (sha256 `0196be9d…1d74`) avec deux changements seulement (dossier de sortie ; les quatre sondes du G2 P-D1, P-D2, P-D3 et P-M3, remplacements copiés de `g2-pr1a\probes.mjs`). Les preuves du G1 ne sont pas relancées (sha256 relus inchangés : harnais `f71319a1…9851`, `RESULTS.txt` `8c68852d…a900`). Résultat (`RESULTS.txt`, sha256 `120af744…75c8`) : contrôles non mutés exit 0 et 0 `not ok` ; **31 tués / 31**, soit les 27 exécutions de la liste de la mère (M-S15 compris) et les 4 sondes, chacun par son test visé ; noyau d'origine sha256 `59273423…09a3` ; fichier de l'arbre intact (`tree file untouched: true`).
- **R-25 après** : méthode B (clone `pr1a-clone`, `git add -N` dans le clone seul) : `node F:/tmp/dojo/r25.mjs F:/tmp/dojo/pr1a-clone 9ee4ab3 --intent-to-add <5 fichiers>` donne `7 files changed, 981 insertions(+), 2 deletions(-)`, **983** (`r25-pli-methodB.log`, sha256 `01439061…8835`) ; méthode A (worktree, lecture seule) : suivis 4+/2−, non suivis dans le pathspec 7 + 35 + 413 + 191 + 331 = 977, **983** (`r25-pli-methodA.log`, sha256 `44818d26…f090`). 983 = 978 + 3 (C-G2-1) + 2 (C-G2-5) ; C-G2-3 est en place (0 ligne nette). L'attendu « ≈ 981 » du message compte C-G2-1 seule ; le G2 annonçait ≈ 983. Sous le STOP de 1 150.
- **sha256 après** (inventaire courant `F:\tmp\dojo\pr1a-deliver\DELIVERED-pli-g2.sha256`, sha256 `35d256de…2eb3`, 7/7 OK dans le worktree et dans le clone ; `DELIVERED.sha256` reste l'inventaire du G1) :

| Fichier | sha256 après le pli | État |
|---|---|---|
| `apps/dojo/scripts/dojo-core.mjs` | `59273423b0eadf4ab6264044ee07bc0c94e1f1f95deec7091cd203cdefdd09a3` | modifié (commentaires) |
| `apps/dojo/test/dojo-core-hold.test.ts` | `b5b31d0d9aaa849bc8e1d6ce86aa8e3c822a8168d3498cc36ae117981b8b9de1` | modifié (+3 lignes) |
| `apps/dojo/test/dojo-core-curve-merkle.test.ts` | `0b12559d32fcaf146d364cc13b53068101f64db1c61306ae3e5acd4b0079bb8c` | modifié (+2 lignes, commentaires) |
| `apps/dojo/scripts/dojo-core.d.mts` | `c5a8d5a8ac83362db49f6bd7034ea4c44dad51849ae4ac737a8114583566cddc` | inchangé |
| `apps/dojo/package.json` | `5fac9690f0a38b3f0603b71d762399852379997112c184cad09a51adf4af238e` | inchangé |
| `package.json` | `d7a429e1afb7618b5b037f3923b01fb35fca5f76cdc6b5a49bfb20495b059700` | inchangé |
| `tsconfig.json` | `e9f78b864977f387e67fde8810211c6a84e8e589abc4fec53d8c554882d3f72f` | inchangé |

- Octets : 0 CR, 0 octet non ASCII, LF final dans les trois fichiers modifiés (compte fait dans `node`). Journal : sha256 rendu hors du fichier.
- **Git et écritures** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`. Worktree : `rev-parse`, `status`, `diff --shortstat`, `ls-files --others`, `diff --no-index` (lecture). `F:\Monark` : `log`, `show <commit>:<FAITS>` (lecture). `git add -N` dans le seul clone `pr1a-clone`. Aucun réseau, rien sur C:. Éditions du code et des tests par l'outil Edit ; journal par remplacements exacts tout ou rien (`F:\tmp\dojo\pr1a-tmp\pli-g2-journal-lines.mjs`, écrit par Write, sha256 `c532f635…f549`), puis cette section par l'outil Edit.
- `git status --short` final : `M package.json`, `M tsconfig.json`, `?? apps/dojo/`, `?? docs/G1-lot-dojo-pr1a.md`.
