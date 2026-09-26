Modèle résolu : claude-opus-5-5[1m]

# G2 — relecture adversariale du G1 de PR-1a (noyau pur MONARK Dōjō) — 2026-09-26

- **Relecteur** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`), effort max, contexte frais, instance distincte du générateur (même modèle : biais d'affinité déclaré ; mitigation : rejeux sur copies, scripts de contrôle écrits par moi, sondes hors liste). Aucun commit, aucun workflow (R-20) ; aucune édition de l'arbre ; aucun `git` écrivant dans le dépôt ; aucun réseau ; rien écrit sur C: (corpus lu seulement).
- **Mission** : `F:\tmp\dojo\mission-g2-pr1a.md` (24 l., sha256 `5c8cad8858ff26a9913c1b0f9e162c702226507495bcadc881d40eee1b949d4c`).
- **Horloge** (`date -u`) : ouverture 16:54:30Z ; snapshot du lot 17:02:12Z ; tests 17:02:28Z → 17:02:30Z ; clone R-25 17:02:46Z → 17:02:52Z ; mutants 17:03:42Z → 17:04:19Z ; sondes 17:05:22Z → 17:06:13Z ; verrou npm 17:07:31Z → 17:08:20Z ; portes du dépôt 17:08:37Z → 17:09:32Z ; Merkle étendu 17:10:57Z → 17:11:20Z ; FAITS §5 relu 17:11:26Z ; `npm test` complet 17:15:06Z → 17:21:03Z ; test git rejoué dans le clone 17:21:27Z → 17:21:28Z ; état final du worktree 17:22:32Z.
- **Preuves** : tout sous `F:\tmp\dojo\g2-pr1a\` (scripts, journaux, copies) et le clone jetable `F:\tmp\dojo\g2-pr1a-clone\`. Les copies du lot sont prises du worktree une seule fois (`snap\`, `sha256sum -c DELIVERED.sha256` : 7/7 OK) ; tous mes scripts importent la copie, jamais l'arbre.

## 1. État du worktree `F:\Monark-wt-dojo`

- **Avant** (16:54Z) et **après** (fin de la relecture, §10) : branche `lot/dojo-snapshot-1`, HEAD `29f645829bb59b1232948ba62f175c01390a6039` ; `git --no-optional-locks status --porcelain=v1 --untracked-files=all` = ` M package.json`, ` M tsconfig.json`, `?? apps/dojo/package.json`, `?? apps/dojo/scripts/dojo-core.d.mts`, `?? apps/dojo/scripts/dojo-core.mjs`, `?? apps/dojo/test/dojo-core-curve-merkle.test.ts`, `?? apps/dojo/test/dojo-core-hold.test.ts`, `?? docs/G1-lot-dojo-pr1a.md` — conforme à l'état annoncé par la mission.
- Index du worktree (`F:\Monark\.git\worktrees\Monark-wt-dojo\index`) : mtime 2026-09-26 17:11:38 +0100 (16:11:38Z, commit `29f6458` de l'autre worker), antérieur à mon ouverture : aucune écriture d'index par cette relecture.
- sha256 des 9 fichiers relus avant et après : égaux (table du §8).

## 2. Table des 10 points

| # | Point | Verdict | Preuve (reproductible) |
|---|---|---|---|
| 1 | R-1 | **CONFORME** | journal l.1 = `Modèle résolu : claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`) ; même déclaration l.5 et §15. |
| 2 | R-25 | **CONFORME** | **978** par deux méthodes, dans mon clone `--no-local` et avec mon propre extracteur de `ci.yml:82` (§3.2) ; mes 20 jetons = ceux du G1 (égalité de listes calculée) ; 978 < STOP 1 150 < borne CI 1 205. |
| 3 | Tests | **CONFORME** | 14 / 14 pass, 0 fail, exit 0, hors ligne, dans le worktree, sans écriture (§3.3) ; les 14 noms = les 14 noms de la mère l.363-365 (extraction par script, 0 écart) ; oracles recodés dans les tests ; vecteurs des FAITS présents. |
| 4 | Mutants | **CONFORME** | 27 / 27 tués par le test visé, sur copie ; mon `RESULTS.txt` est identique octet pour octet à celui du G1 (sha256 `8c68852d…a900` des deux côtés) ; mutant équivalent recomputé, et équivalent pour une seconde raison indépendante (§3.4). Sondes hors liste : 27, dont 4 survivantes non équivalentes (→ C-G2-1, C-G2-5). |
| 5 | Fidélité à la mère | **CORRECTION bloquante (C-G2-1)** | Le code est fidèle sur tous les items (§3.5) ; mais la règle « valeur du jour = plus petite lecture concordante » (D-2 l.158 ; P-34) n'est épinglée par aucune assertion : `dayValue` = maximum, première ou dernière lecture concordante passe les 14 tests (sondes P-D1, P-D2, P-D3 survivantes). |
| 6 | Courbe | **CONFORME** (+ C-G2-3 non bloquante) | `ownerClass` = FAITS §2 point par point, relu contre les copies de dalek (sha256 = préfixes des FAITS) ; alphabet du module = alphabet du test = FAITS L-14 ; d et B = FAITS L-13 (égalités calculées, B sur la courbe) ; refus hors table et longueur ≠ 32 octets (la borne de 44 caractères de `FromStr` est impliquée : toute chaîne de 45 à 60 caractères décode en ≥ 33 octets). |
| 7 | Merkle | **CONFORME** (+ C-G2-5 non bloquante : test) ; texte de 9162 §2.1.3.2 **NON VÉRIFIABLE** ici | Préfixes, coupe, PATH, `MTH({})` conformes à FAITS L-1 ; contre-contrôle indépendant n = 1..300 : 300 racines, 14 089 chemins = mon PATH, 42 264 contrôles négatifs, 167 860 cas différentiels `verifyProof` / mon 9162 à verdicts identiques (§3.7). Le texte intégral de 9162 §2.1.3.2 n'est pas lisible sans réseau (Q-5, C-G2-4). |
| 8 | Q-1..Q-10 | **Q-1 vérifiée** ; lignes de l'orchestrateur requises pour Q-1, Q-2, Q-3, Q-4, Q-8, Q-10 | Table §5. Q-1 : `npm ci` rejoué sur copie, à blanc ET complet hors ligne (§3.8). |
| 9 | MAST | **CORRECTION (via C-G2-1 ; C-G2-5)** | FM-1.2 : aucun écart ; FM-2.4 : aucune rétention ; FM-3.1 : aucun arrêt prématuré ; FM-3.3 : aucun test n'utilise la fonction testée comme oracle ; FM-3.2 (vérification incomplète, voisine de FM-3.3) : la règle du minimum du jour (§6). |
| 10 | Hygiène | **CONFORME** | 0 URL, 0 « verified / guarantee / probab / likely / chance », 0 TODO/FIXME, 0 secret dans les 5 fichiers créés ; 0 CR ; 0 octet non ASCII (les 3 de `package.json` sont préexistants, mesurés sur `29f6458`) ; `grep-forbidden.mjs` sur les 5 fichiers nommés explicitement : « no forbidden claim » (322 = 317 + 5 fichiers). |

## 3. Détail des rejeux

### 3.2 R-25 (point 2)

- Clone : `git clone --no-local --branch lot/dojo-snapshot-1 F:/Monark F:/tmp/dojo/g2-pr1a-clone` (exit 0 ; HEAD `29f6458` ; aucun fichier `objects/info/alternates`). Les 7 fichiers du lot et le journal copiés depuis `snap\` ; `sha256sum -c DELIVERED.sha256` dans le clone : 7/7 OK.
- Extracteur : `F:\tmp\dojo\g2-pr1a\r25-g2.mjs` (sha256 `8504cceb85a3228b04f0f6efc5ec8e0b9b972f854a41dc3773d69fe779ff02a4`), analyseur de mots shell (apostrophes, guillemets, mots nus) sur la ligne 82 lue du fichier, indépendant de `r25.mjs` ; 20 jetons ; égalité avec la liste obtenue par l'expression régulière de `r25.mjs` : `true`.
- Méthode A (avant tout `add -N`, dans le clone) : suivis `package.json` +1 −1, `tsconfig.json` +3 −1 ; non suivis dans le pathspec (`ls-files --others --exclude-standard`) : 7 + 35 + 413 + 189 + 328 = 972 ; le journal `docs/G1-lot-dojo-pr1a.md` n'y figure pas (exclu) ; **CHANGED = 978** (`r25-methodA.log`, sha256 `1b6fc2e8…95fa`).
- Méthode B (`git add -N` des six non suivis, journal compris, dans le clone seul) : `git diff --shortstat 9ee4ab3 -- <ci.yml:82>` = `7 files changed, 976 insertions(+), 2 deletions(-)` ; **CHANGED (métrique de `ci.yml:90`) = 978** (`r25-methodB.log`, sha256 `a39ff65d…bb84`).
- Base : `git merge-base HEAD lot/etude-suite` = `9ee4ab35…` (lu à 16:5xZ ; le tronc était alors à `7648e1a`) ; `git diff --stat 9ee4ab3 HEAD` = les deux ADR sous `docs/adr/` (exclus). `package-lock.json` est exclu par le pathspec : le correctif de Q-1 ne change pas le compte.
- 978 = valeur du journal ; sous le STOP de 1 150 (mère l.419) et la borne CI de 1 205.

### 3.3 Tests (point 3)

- Commande (worktree, `env -u` des huit variables payantes, `TEMP/TMP/TMPDIR` = `F:/tmp/dojo/g2-pr1a/tmp`) : `node --test --test-reporter=spec "apps/dojo/test/*.test.ts"` (Node v24.15.0). Sortie : `tests 14`, `pass 14`, `fail 0`, `cancelled 0`, `skipped 0`, `exit=0` (`tests-worktree.log`, sha256 `555551a0…798b`). État du worktree et sha256 inchangés après.
- Noms : `names.mjs` (sha256 `2f8a3e63…4362`) extrait les noms entre accents graves des l.363-365 de la mère (14) et les `test("…")` des deux fichiers (14, uniques) : 0 manquant, 0 en trop. Mutants nommés par la mère sur ces lignes : 26 identifiants.
- Oracles (lecture de chaque test) : somme des minima glissants et forme fermée de D-16 l.278 recodées (`closedForm`, hold l.28-49 ; formule relue contre la mère : p = dernier jour compté ≤ d − W + 1, contribution min(h_τ, h_p)) ; MTH et vérification 9162 recodées (curve-merkle l.103-139) ; `is_on_curve` recodée (l.12-31) ; propriétés d'invariance (grille 9⁵ × 4 = 236 196 contrôles ; 300 découpages) ; valeurs littérales des exemples de la mère (M2 (B), M4 (D), M6 (F), M8 (E6), `rejeu-ambig2` (3) et (4)), chacune recomputée à la main par moi (ex. E6 : lot (150, 3) sur 58 jours comptés = 8 700 validés ; lot (50, 46) sur 15 jours = 750 provisoires). Aucun test n'appelle la fonction testée comme son propre oracle : les compositions (`unitThreshold(…)` réutilisé, `proofOf` passé à `verifyProof`) sont chacune d'abord fixées contre un littéral ou un recodage.
- Vecteurs des FAITS présents : 7 feuilles et chemins d0 [b, h, l], d3 [c, g, l], d4 [f, j, k], d6 [i, k] (l.163-178) ; y = 2 hors courbe et 3/(4d + 1) non carré (l.58-59) ; 2²⁵⁵ − 18 = p + 1 sur la courbe (l.61) ; x = 0 signé, `enc(1n, true)` sur la courbe (l.62) ; adresses de contrôle de D-6 l.207 / l.57 (l.76-88) ; `MTH({})` (l.145).

### 3.4 Mutants (point 4)

- Harnais : copie `F:\tmp\dojo\g2-pr1a\mutants-g2.mjs` (sha256 `9df9cc4e…dcb5`) du harnais du G1, trois lignes changées seulement (`SRC` = ma copie, `OUT` = `g2-pr1a\mutants`, `TEMP`) : le harnais du G1 fait `rmSync` sur ses dossiers et réécrit `RESULTS.txt`, il n'a donc pas été relancé en place (preuve du G1 intacte, sha256 de son `RESULTS.txt` relu égal).
- Résultat : contrôles non mutés exit 0 et 0 `not ok` (deux fichiers) ; **27 tués / 27, 0 survivant**, chacun par son test visé (`not ok N - <test visé>`) ; `RESULTS.txt` identique octet pour octet à celui du G1 (mêmes listes rouges, mêmes attendu / obtenu, mêmes sha256 des sources mutées).
- Relecture des mutations : chacune rend la forme nommée par la mère ; deux remarques sans effet sur le verdict : M-S2 (« une baisse ne change rien », 400 sur [100, 150, 100]) n'est pas la forme « sans remise » mesurée par M2 (B) (Σ m_d = 350) ; ma sonde P-S2b rend cette seconde forme et elle est tuée par le même test (§3.4 bis). M-S9 teste l'âge par `day − b ≥ 30` (décalage d'un jour par rapport à la validation) : sans effet, le mutant est tué.
- **Mutant équivalent déclaré** (branche `if (v === 0n) return false`, l.301) : recomputé (`node`, BigInt) : d = 37095705934669439343138083508754565189542113879843219016388785533085940283555 ; d^((p−1)/2) = p − 1 (d non carré) ; (−1)^((p−1)/2) = 1 (−1 carré, p ≡ 5 mod 8) ; (−1/d)^((p−1)/2) = p − 1 : −1/d non carré, donc v = d·y² + 1 ≠ 0 pour tout y : la branche est inatteignable. **Seconde raison, indépendante de la non-résiduosité** : sans la branche, l.302 rend `pow(0, (p−1)/2) = 0 ≠ 1`, donc `false`, le même verdict. La sonde P-C5 (branche retirée) survit, comme attendu.

### 3.4 bis Sondes hors liste (27 mutants à moi, `probes.mjs` sha256 `09afabef…7333`, `probes/PROBES.txt` sha256 `907734de…9614`)

Chaque sonde : un remplacement exact (occurrence unique contrôlée) sur une copie du noyau, les deux fichiers de test lancés en TAP.

| Sonde | Mutation | Verdict |
|---|---|---|
| **P-D1** | `dayValue` = **maximum** des lectures concordantes (témoin « maximum du jour » de M8, mère l.145) | **SURVIT** |
| **P-D2** | `dayValue` = première lecture concordante | **SURVIT** |
| **P-D3** | `dayValue` = dernière lecture concordante | **SURVIT** |
| P-C1 | bit 255 non masqué | tuée (curve) |
| P-C2 | d de signe opposé | tuée (curve) |
| P-C3 | y lu en gros-boutiste | tuée (curve) |
| P-C4 | u/v remplacé par v/u | survit — **équivalente** (symbole de Legendre de v/u = celui de u/v, u, v ≠ 0) |
| P-C5 | branche `v === 0` retirée | survit — **équivalente** (§3.4) |
| P-B1 | « 1 » de tête non décodé en octet nul | tuée (curve) |
| P-B2 | alphabet avec x et y permutés | tuée (curve) |
| P-B3 | contrôle des 32 octets retiré d'`ownerClass` | survit — **équivalente** : `ed25519OnCurve` refuse elle-même toute longueur ≠ 32 avec un message qui contient aussi « 32 bytes » |
| P-V1 | validation en jours comptés au lieu de calendaires | tuée (missing_day, closed_form) |
| P-V2 | validation à `> W` | tuée (4 tests) |
| P-S2b | « sans remise » de M2 (B) : score = Σ m_d | tuée (lifo et 5 autres) |
| P-L1 | lot né le lendemain de la hausse | tuée |
| P-L2 | lots de montant nul conservés | tuée |
| P-T1 | palier le plus bas atteint au lieu du plus haut | tuée (migration) |
| P-H1 | `holderCounted` en `>` | tuée (dust) |
| P-H2 | `holderCounted` ignore la classe | tuée (dust) |
| P-P1 | médiane sans tri | tuée (price) |
| P-P2 | `unitPrice` sans le facteur 10⁻³ | tuée (price) |
| P-M1 | coupe à ceil(n/2) | tuée (merkle) |
| P-M2 | chemin rendu du haut vers le bas | tuée (merkle) |
| **P-M3** | longueur du chemin non comparée dans `verifyProof` | **SURVIT — non équivalente** : avec la taille vraie, un chemin raccourci ou allongé reste refusé ; mais avec une taille annoncée plus grande et la racine d'un arbre plus petit, le mutant accepte ce que 9162 refuse. Mesuré en passant mon contrôle §3.7 sur la copie mutée (`merkle-g2-on-PM3.log`, sha256 `b64ba38b…009a`) : premier écart n = 2, m = 0, taille annoncée 3 : `verifyProof` `true`, 9162 `false` → C-G2-5 |
| P-M4 | `MTH({})` = hachage d'une feuille vide | tuée (merkle) |
| P-M5 | feuille hachée avec son LF | tuée (merkle) |
| P-R1 | liste de comptes vide : levée au lieu de « 0 » (alternative de Q-3) | tuée par la seule assertion l.263 (épinglage du choix de Q-3) |

Bilan : 20 tuées ; 3 équivalentes (P-C4, P-C5, P-B3) ; **4 survivantes non équivalentes** : P-D1, P-D2, P-D3 sur la règle du minimum du jour (C-G2-1, bloquante) et P-M3 sur la liaison du chemin à (index, taille) dans `verifyProof` (C-G2-5, non bloquante). Une première lecture de P-M3 comme « équivalente » a été réfutée par la mesure ci-dessus avant l'écriture de ce rapport.

### 3.5 Fidélité à la mère (point 5)

| Item | Verdict | Où |
|---|---|---|
| `dayValue` = minimum du jour (D-2 l.158 ; P-34) | code fidèle (l.42-50 : plus petit solde concordant, `null` si aucun) ; **non épinglé par un test** | C-G2-1 |
| LIFO | fidèle : hausse = lot (m − H, d), baisse retirée du plus récent, égalité sans effet (l.54-66 ; D-16 l.271) ; M-S1 tué | — |
| Vente = perte ; rachat = lot neuf sans créance (P-29 bis, D-16 l.275) | fidèle par construction ; aucun champ de créance ; M-R1 à M-R5 tués | — |
| Validation à 30 jours par lot (D-16 l.273) | fidèle : d − b + 1 ≥ W en jours calendaires (l.113) ; P-V1, P-V2, M-S8 tués | — |
| Paliers et W (D-3 l.171-172, C-16) | fidèle : cinq paliers, u_1 = 1, u strictement croissant, palier le plus haut atteint (l.171-188). Interprétation déclarée au §3 du journal mais hors Q-1..Q-10 : **W non décroissant** exigé en précondition (l.179), dérivé de l'argument de monotonie de D-3 l.172 ; tenu par les valeurs de l'ancre (30, 30, 30, 30, 180) ; non bloquant | — |
| Jour manquant : ni compte ni remise à zéro (D-2 l.158, D-16 l.271) | fidèle (l.101-104) ; M-S6 tué | — |
| C-9 composition des comptes (D-2 l.157) | fidèle (l.29-38) ; M-S15 tué | — |
| C-1 compte fermé = 0 (D-7 l.217) | fidèle : `"0"` vide la pile ; M-S7 tué | — |
| Seuil de poussière en paramètre (C-10, D-17 l.290) | fidèle : `holderCounted(klass, series, dustThreshold)`, aucun littéral ; M-S17 tué | — |
| Aucune I/O ni horloge | fidèle : un seul import, `createHash` de `node:crypto` ; 0 occurrence de `Date`, `process`, `fetch`, `fs`, `Math.random`, `console` ; 0 paramètre par défaut (arités à l'exécution = arités du `.d.mts` pour les 22 exports) | — |
| Constantes citées | littéraux du code hors commentaires : structurels (0, 1, 2, 8, 31, 32, 64, 58n, 255n), 3 (indice de la médiane de 7), 5 (D-3 l.171, l.165), 7 (D-17 l.287, l.216), 1000n (D-17 l.287, l.229-230), 19n et 121665n/121666n (Ed25519 : RFC 8032 cité, pas de ligne de la mère — la mère ne les donne pas ; FAITS L-13 depuis 16:53Z) ; aucun 30, 180 ni 1 000 000 dans le noyau ; les numéros de ligne cités dans le code relus contre la mère (l.157, 158, 159, 160, 171-174, 190, 206-211, 217, 220, 270-275, 278, 287, 290 : tous exacts) | C-G2-3 (p et d : citer L-13) |

### 3.6 Courbe (point 6)

- FAITS relus à 17:11:26Z : 50 l., sha256 `6086aa5ad94875b0b39886b24063e47248737d119b430853b899800376fd6eb2`, commit `7648e1a` (§5 ajouté ; `git diff dc79237 7648e1a` : +10 lignes, §1 à §4 inchangés). Le journal cite la version précédente (40 l., `494e79f2…fdec`) : note au §7.
- `ed25519OnCurve` (l.293-303) = FAITS §2 : (1) bit 255 masqué (l.297) ; (2) y petit-boutiste sur 255 bits réduit mod p sans rejet (l.296-297) ; (3) u = y² − 1, v = d·y² + 1, sur la courbe ssi u = 0 ou (v ≠ 0 et u/v carré, critère d'Euler) ; (4) signe jamais dans le verdict. Relu contre les copies du brouillon de session, sha256 égaux aux préfixes des FAITS (`address_lib.rs` `9e00c07b…` l.186-199 et l.318-322 ; `dalek_edwards.rs` `503b92d4…` l.211-256 ; `dalek_field.rs` `9129d87e…` l.306-366, dont `was_nonzero_square = correct_sign_sqrt | flipped_sign_sqrt` ; `dalek_field64.rs` `c0a773dd…` l.385-395). `bytes_are_curve_point` rend `false` sur une longueur ≠ 32 (`from_slice`) ; le noyau lève à la place (choix fail-closed : une adresse Solana a 32 octets, FAITS L-15 l.3).
- FAITS §5 : d calculé = d de la Table 1 (L-13) ; 4/5 mod p = y de B (L-13) ; B vérifie −x² + y² = 1 + d·x²·y² avec les deux coordonnées de la Table 1 ; alphabet du module (l.254) = alphabet du test (l.38) = chaîne de L-14 extraite de la ligne 47 des FAITS (58 symboles distincts, ordre ASCII croissant, sans 0, O, I, l).
- `base58Decode` : caractère hors table ⇒ « not a base58 string » (testé : `0OIl`) ; `ownerClass` : longueur décodée ≠ 32 ⇒ levée (testé : « 1 » + adresse, 33 octets ; rejoué : 45 « 1 », 45 caractères, 31 « 1 », chaîne vide : tous refusés) ; la borne de 44 caractères de `FromStr` (L-15) est impliquée (longueur décodée minimale d'une chaîne de 45 à 60 caractères : 33). Ancres proposées par FAITS §5 rejouées hors test : Programme Système → 32 octets nuls, `holder` ; mint `FYZc…38AhT` → aller-retour identique ; `1nc1nerator…` → `program` (calcul du journal confirmé). Remarque : l'identifiant du programme Token-2022 et le mint sont sur la courbe (`holder`) : la classe est « sur / hors courbe », comme le disent FAITS §2 et D-6 l.209.

### 3.7 Merkle (point 7)

- Code (l.313-413) : feuille SHA-256(0x00 ‖ ligne), nœud SHA-256(0x01 ‖ g ‖ d) ; `split` = plus grande puissance de deux < n (n ≥ 2) ; aucune duplication ; `MTH({})` = SHA-256() ; `proofOf` = PATH de 6962 §2.1.1, du plus profond au plus haut ; `verifyProof` rend `false` sur toute entrée mal formée (try/catch, l.388-412).
- Tests : n = 1..33, chaque m, contre `mthRef` et `verify9162` recodés ; exemple à 7 feuilles ; seconde préimage ; n impair sans duplication.
- Mon contre-contrôle (`merkle-g2.mjs`, sha256 `600f2f0a…6bb6`) : MTH et PATH réécrits depuis FAITS L-1 (k par longueur binaire de n − 1), vérification 9162 réécrite de mémoire ([2nd], déclaré), lignes texte et octets mêlées, n = 1..300 (tous les m jusqu'à n = 160, dix m ensuite) : 300 racines égales ; 14 089 chemins égaux à mon PATH ; `verifyProof` vrai 14 089 fois ; mon 9162 vrai 14 089 fois ; 42 264 contrôles négatifs faux (mauvais index, chemin raccourci, chemin allongé) ; différentiel `verifyProof` / mon 9162 sur (index, taille) décalés (n − 1, n + 1, 2n, n + 7 ; m, m ± 1) : 167 860 cas, verdicts identiques (37 322 acceptés par les deux : même forme de chemin et même racine fournie, comportement attendu d'un vérificateur qui reçoit la taille et la racine de l'appelant).
- Le code est conforme, mais le test ne lie pas le chemin à (index, taille) : il vérifie un chemin altéré, une ligne fausse et un chemin raccourci pour le seul 9162 recodé (l.160), jamais `verifyProof` sous une taille annoncée différente ; la sonde P-M3 survit (§3.4 bis) → C-G2-5. Impact borné pour les consommateurs prévus : le vérificateur calcule lui-même le chemin et reçoit taille et racine d'une même ligne signée (D-7 l.221, D-10).
- Limite : le texte intégral de 9162 §2.1.3.2 n'est pas lisible sans réseau ; L-2 ne cite que l'ordre des deux hachages ; la boucle de décalage et le test final `sn == 0` du test (l.119-139) et de mon script restent de mémoire (Q-5, C-G2-4).

### 3.8 Q-1 rejouée (point 8)

- Copies `git archive 29f6458` (depuis mon clone) dans `F:\tmp\dojo\g2-pr1a\npm\{pristine,overlay,regen}` ; les 7 fichiers du lot posés sur `overlay` et `regen` (`sha256sum -c` : 7/7) ; cache npm copié de `F:\tmp\npm-cache` vers `F:\tmp\dojo\g2-pr1a\npm-cache` (112 Mo ; le cache du G1 n'est pas modifié).
- `npm ci --ignore-scripts --offline --dry-run --no-audit --no-fund --no-update-notifier --cache <copie>` : `pristine` exit 0 (283 paquets) ; `overlay` sans patch **exit 1**, « `npm ci` can only install packages when your package.json and package-lock.json … are in sync » et « Missing: @monark/dojo@0.0.0 from lock file » (`ci-dry-overlay.log`, sha256 `b0535a5b…6b38`).
- `patch -p1 < pr1a-package-lock.patch` (sha256 `c4522ea6…5fef`) : appliqué sans rejet ; verrou obtenu sha256 `d4f3a4f8…af52` = verrou complet du G1. `npm ci … --dry-run` : **exit 0** (284 paquets). **`npm ci --ignore-scripts --offline` complet : exit 0**, 284 paquets en 17 s, lien `node_modules/@monark/dojo` → `apps/dojo` de la copie (`ci-full-overlay-patched.log`, sha256 `4dc3d8b7…5dbe`).
- Régénération indépendante (`regen`, sans patch) par `npm install --package-lock-only --offline --ignore-scripts` : verrou identique octet pour octet au verrou patché (sha256 `d4f3a4f8…af52`).
- Les jobs CI qui lancent `npm ci` sont bien `ci.yml` l.140, l.153, l.166, l.202 (relu).
- Portes du dépôt rejouées sur cette copie, `node_modules` installé depuis le cache (aucune jonction vers `F:\Monark`) : `typecheck` exit 0 (le programme TS contient `dojo-core.d.mts` et les deux tests, `tsc --listFilesOnly`) ; `lint` exit 0 (les deux tests lintés ; `*.mjs` et `*.d.mts` ignorés par `eslint.config.mjs` l.34-46, règle du dépôt, comme `bell-chain.mjs`) ; `lint:ratchet` **69/69** ; `gate:vocab` exit 0 (317 fichiers : `apps/dojo` hors portée, comme le dit le journal) ; `lang:gate` exit 0 ; `export:check` exit 0 (`oracle\exits.txt`, sha256 `9a4f9a48…d423`).
- `npm test` complet sur la même copie : voir §4.

## 4. `npm test` complet (hors checklist, contre-épreuve de l'oracle du G1)

- Copie `npm\overlay` (archive `29f6458` + lot + verrou patché, `node_modules` installé depuis le cache copié), `env -u` des huit variables, 17:15:06Z → 17:21:03Z : `tests 1345`, `pass 1342`, `fail 1`, `skipped 2` (`oracle\test.log`, sha256 `adae3f5910cd799f6690069bafbe9dc11c210e23ba5bd73d6f9f15dfc0b8414d`). Les 14 tests `dojo_*` passent dans la suite. Le seul échec est `bell_served_collector_revision_is_a_collector_commit` : « fatal: not a git repository » (`git cat-file -t 3bda2cad…`), l'échec d'environnement décrit par le journal (§7) sur une archive.
- Ce fichier (`test/bell-served.test.ts`) rejoué dans mon clone git, avec une jonction temporaire `node_modules` → `npm\overlay\node_modules` (cible dans ma copie, jamais `F:\Monark`), retirée aussitôt par `rmdir` non récursif (cible intacte : 218 entrées) : `tests 13`, `pass 13`, `fail 0`, dont `bell_served_collector_revision_is_a_collector_commit` (`oracle\bell-served-in-clone.log`, sha256 `7de27c0a…a9a3`).
- Bilan : 1 345 tests, 1 343 réussis, 0 échec de code, 2 sautés : égal au résultat « après » du journal (1 345 / 1 343 / 0 / 2 = 1 331 + 14).

## 5. Questions Q-1..Q-10 du journal

| Q | Choix du worker | Avis G2 |
|---|---|---|
| Q-1 | verrou non touché (hors périmètre), patch mesuré prêt | **Choix correct ; ligne de l'orchestrateur requise** : le lot tel quel rougit les quatre jobs `npm ci` ; le patch est vérifié à blanc, en installation complète hors ligne et par régénération indépendante (§3.8). → C-G2-2. |
| Q-2 | information : ×2,03 de 481 | **Conforme** (978 / 481 = 2,033). **Ligne de l'orchestrateur recommandée** : porter ×2,03 comme pire facteur dans la table de dérive (mère l.419). Effet chiffré à ×2,03 : PR-2 555 → 1 127 (marge 23 sous 1 150) ; PR-4a 553 → 1 123 ; PR-2b-1 547 → 1 110 ; PR-2b-2 530 → 1 076. |
| Q-3 | liste de comptes vide = lecture concordante `"0"` | **Conforme à la lettre de C-9 ; ligne de l'orchestrateur requise.** Contrairement à ce que dit le journal (l.207, C-G2-6), le cas est légitime : une adresse nouvelle n'a, aux lectures du jour qui précèdent son premier compte, ni compte rendu ni compte de la veille (D-2 l.157) ; sa lecture vaut alors 0, et le jour d'achat vaut le solde d'avant l'achat, comme sur les jours rétroactifs (D-18 l.299). Risque résiduel : une liste vide émise **par erreur** (comptes de la veille oubliés) viderait la pile en silence (LIFO). Deux voies : (i) garder `"0"` et exiger de PR-2 un test et un mutant « comptes de la veille oubliés » (motif de M-Q10) — avis G2 ; (ii) lever sur liste vide (principe « toute entrée mal formée lève »), le collecteur codant alors l'absence légitime par des comptes à `"0"` ; coût de (ii) mesuré par la sonde P-R1 : une ligne (l.30) et l'assertion l.263, aucun autre test touché. |
| Q-4 | sept fixé, tout autre compte refusé | **Conforme** (la mère nomme `medianOfSeven`, §6 l.363, et exige sept valeurs, D-17 l.287). **Ligne de l'orchestrateur requise** : écrire dans la mission de PR-1b-1 le refus d'une ancre dont `price_window_days` ≠ 7 (ou amender la mère). |
| Q-5 | étapes de 9162 au-delà de L-2 recodées de mémoire | **NON VÉRIFIABLE** ici (réseau interdit). Mon recodage indépendant, de mémoire lui aussi, concorde partout (§3.7). La dernière phrase de FAITS §5 (l.50) dit ces étapes « reproduites au §1 (L-2) » : L-2 n'en cite que l'ordre des deux hachages → C-G2-4 ; la demande (a) du journal reste ouverte. |
| Q-6 | d, B et alphabet en [2nd] ancré | **Levée par FAITS §5** : L-13 (d, B) et L-14 (alphabet) ; égalités vérifiées (§3.6). Reste [inféré] (FAITS l.50) : l'alphabet de `five8`, décodeur de `solana-address` (L-15) ; la demande (c) se réduit à la source de `five8`. → C-G2-3. |
| Q-7 | âge = jours comptés du plus ancien lot | **Conforme** : l'exemple de C-1 (D-2 l.158) le fixe (jours calendaires : 8 ; jours comptés : 5 = la mère). |
| Q-8 | interfaces héritées | **Conformes** à D-7 l.217 (`lots` = `[montant, jour]`, palier 0 à 5, `null` avant la première version). **Ligne de l'orchestrateur requise** : les consigner au G0 ou à la mission de PR-1b-1, dont le tri des lignes par adresse **en ordre d'octets** (D-7 l.217) à la charge de l'appelant de `rootOf`. |
| Q-9 | « fenêtres » = W_k ; fenêtre sans quorum de PR-2b = jours `null` | **Conforme** : D-18 l.298 rend une fenêtre sans quorum en jours manquants pour l'adresse ; `null` testé (missing_day, C-9). |
| Q-10 | C-8 (a) à la lettre : points d'ordre faible `holder` | **Conforme à C-8 (a)**. **Ligne de l'orchestrateur requise** : contrôle par SNAPSHOT-PROBE-1 (b) ou liste d'exclusion déclarée (P-6), comme le propose le journal. |

## 6. MAST (point 9)

- **FM-1.2 (écart à la spécification)** : aucun. Fichiers touchés = périmètre de la mission (état du §1) ; noms des tests exacts ; mutants sur copie ; R-25 par la méthode de la mère l.478 ; forme des citations en ASCII déclarée (journal l.24, CONSIGNE F-2).
- **FM-2.4 (rétention d'information)** : aucune. Le journal déclare les incidents d'outillage, l'avancée de la branche pendant le travail, les jonctions laissées dans trois arbres, l'absence du FAITS sur la branche, l'écart d'estimation 456 / 481 et le verrou.
- **FM-3.1 (arrêt prématuré)** : aucun. T-1 à T-4, 14 tests, 27 exécutions de mutants, R-25, oracle complet avant / après, questions et demandes formées. FAITS §5 est postérieur au G1 (16:53Z contre ~16:48Z) : son absence du journal n'est pas un arrêt prématuré (C-G2-3).
- **FM-3.3 (vérification incorrecte)** : aucun test n'appelle la fonction testée comme oracle (§3.3). **FM-3.2 (vérification incomplète)**, voisine : la règle du minimum du jour, annoncée par le journal (§3 : « minimum des lectures concordantes ») et nommée par la mère avec son témoin (« maximum du jour », M8), n'est falsifiée par aucune assertion (§3.4 bis) → C-G2-1 ; de même, la liaison du chemin à (index, taille) dans `verifyProof` (conformité à 9162, point 7) n'est pas épinglée côté module (P-M3) → C-G2-5.

## 7. Corrections (liste fermée)

- **C-G2-1 — bloquante** — `apps/dojo/test/dojo-core-hold.test.ts`, après la l.261 (test `dojo_address_reading_needs_every_account_concordant`). Texte attendu :
  ```ts
  // the day value is the smallest concordant reading (D-2 l.158); a reading without quorum never lowers it, and neither
  // the maximum (the non-super-additive witness of M8, l.145) nor the first or last reading of the day is taken
  assert.equal(dayValue([["100", "50"], ["40", null], ["40", "30"], ["90", "80"]]), "70");
  ```
  (lectures 150, sans quorum, 70, 170 : minimum 70 ; maximum 170 ; première 150 ; dernière 170 ; somme partielle 40). Texte essayé sur copies (`c-g2-1-check.mjs`, sha256 `e17a9b83…a263` ; `c-g2-1\CHECK.txt`, sha256 `d12d0a45…77e1`) : noyau d'origine 12/12 pass ; P-D1, P-D2, P-D3 et M-S15 rendent chacun `dojo_address_reading_needs_every_account_concordant` rouge. Preuve attendue du G1 : ces quatre exécutions dans son harnais ; journal : ligne ajoutée au §4 (règle épinglée) et au §5 (trois mutants hors liste de la mère, tués) ; R-25 : 978 + 3 = 981.
- **C-G2-2 — bloquante pour la CI (destinataire : orchestrateur, décision de périmètre)** — `package-lock.json` : appliquer `F:\tmp\dojo\pr1a-deliver\pr1a-package-lock.patch` (sha256 `c4522ea6e9d58756fdfeb19ff512984d4a8af05c8378985b868260b207b05fef`), soit les blocs `"apps/dojo": {"name": "@monark/dojo", "version": "0.0.0"}` (après le bloc `"apps/bell"`, l.26-32 du verrou d'origine ; l.33 du verrou patché) et `"node_modules/@monark/dojo": {"resolved": "apps/dojo", "link": true}` (après `"node_modules/@monark/contracts"`, l.1140-1143 d'origine ; l.1148 patché) ; verrou résultant sha256 `d4f3a4f8b27bd425732a7ef6b2ef03aa6ff6de0b64258fdfefd69b393baaaf52`. Sans lui, `npm ci` sort en 1. Exclu du compte R-25.
- **C-G2-3 — non bloquante** — rattacher le lot à FAITS §5 (écrit après le G1) : `apps/dojo/scripts/dojo-core.mjs` l.256-257 (alphabet : citer FAITS L-14, refus de L-15, en plus du précédent de Bell), l.275 (p : citer FAITS L-13), l.286 (d : « RFC 8032 s5.1 Table 1, FAITS L-13 ») ; test `dojo-core-curve-merkle.test.ts` l.24 et l.55 (même renvoi) ; option : deux ancres de FAITS §5 après la l.89 (`assert.deepEqual(base58Decode("11111111111111111111111111111111"), new Uint8Array(32))` et l'aller-retour du mint) ; journal l.13 et l.195 (FAITS : 50 l., sha256 `6086aa5a…6eb2`, commit `7648e1a`), l.28 et l.210 ((b) et (c) passent en [lu] par L-13 et L-14, sauf l'alphabet de `five8`, [inféré]), l.219-220 (demande (b) close ; demande (c) réduite à la source de `five8`).
- **C-G2-4 — non bloquante (destinataire : orchestrateur, FAITS)** — `F:\Monark\docs\dojo\FAITS-pr1a-lectures-2026-09-26.md` l.50, dernière phrase (« les étapes de RFC 9162 §2.1.3.2 sont reproduites au §1 (L-2) ») : L-2 (l.10) ne cite que l'ordre des deux hachages ; soit ajouter à L-2, par lecture sur place, les étapes 1 à 5 de §2.1.3.2 (conditions initiales fn = index, sn = taille − 1 ; boucle de décalage ; test final `sn == 0`), soit corriger la phrase ; jusque-là la demande (a) du journal reste ouverte.
- **C-G2-5 — non bloquante** — `apps/dojo/test/dojo-core-curve-merkle.test.ts`, après la l.156 (dans la boucle n = 1..33, test `dojo_merkle_root_and_proofs`). Texte attendu :
  ```ts
      // a count other than the tree's: the verdict of the recoded RFC 9162 check (path length bound to (index, count))
      assert.equal(verifyProof(line, m, n + 1, path, root), verify9162(H(ZERO, utf8(line)), m, n + 1, raw, Buffer.from(root, "hex")));
  ```
  Texte essayé sur copies (`c-g2-5-check.mjs`, sha256 `34b2bd81…71d1` ; `c-g2-5\CHECK.txt`, sha256 `c2887f37…9db2`) : noyau d'origine 2/2 pass ; P-M3 rend `dojo_merkle_root_and_proofs` rouge (attendu `false`, obtenu `true`). R-25 : + 2 lignes.
- **C-G2-6 — non bloquante** — journal l.207 (Q-3), phrase « Le collecteur (PR-2) n'est pas censé produire ce cas (D-2 l.157 : les comptes d'une lecture incluent ceux de la veille) » : inexacte ; une liste vide est légitime pour une adresse nouvelle aux lectures du jour qui précèdent son premier compte (D-2 l.157 : aucun compte rendu par un opérateur, aucun compte de la veille) ; elle vaut alors 0, comme une absence concordante (C-1), et le jour d'achat vaut le solde d'avant l'achat, comme sur les jours rétroactifs (D-18 l.299). Texte attendu : remplacer la phrase par ce constat, et renvoyer le risque d'une liste vide erronée au collecteur (§5, Q-3).

## 8. sha256 des fichiers relus (égaux à ceux du journal ?)

| Fichier | sha256 relu | Journal |
|---|---|---|
| `apps/dojo/scripts/dojo-core.mjs` | `b1071f74b637a514f30f44195b04fe76df3c61c6df1aff2b954bc7b8a44f470b` | égal |
| `apps/dojo/scripts/dojo-core.d.mts` | `c5a8d5a8ac83362db49f6bd7034ea4c44dad51849ae4ac737a8114583566cddc` | égal |
| `apps/dojo/test/dojo-core-hold.test.ts` | `d9c828f9700d121008f5b8bc93d9bef42924ea9ecba566f0946fca00416cf94a` | égal |
| `apps/dojo/test/dojo-core-curve-merkle.test.ts` | `8721718c0262e10a90c6aa5bbb17ad46019ccf0f34d52904c833dca341c9dacd` | égal |
| `apps/dojo/package.json` | `5fac9690f0a38b3f0603b71d762399852379997112c184cad09a51adf4af238e` | égal |
| `package.json` | `d7a429e1afb7618b5b037f3923b01fb35fca5f76cdc6b5a49bfb20495b059700` | égal |
| `tsconfig.json` | `e9f78b864977f387e67fde8810211c6a84e8e589abc4fec53d8c554882d3f72f` | égal |
| `docs/G1-lot-dojo-pr1a.md` | `b596c12db2b330e79601acf631a78ff7d484aca3f07cba1971e1fc5a8408b443` (247 l.) | égal à la mission |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | `ae1281d50bf7baa6f4e919766c1b15d0ff974891cbeb8ccc0c0bf599c6fbc080` (849 l.) | égal |
| `F:\tmp\dojo\pr1a-mutants\mutants.mjs` | `f71319a159655667908769f49e6557a354bfe13f7bbcf6c4fa085863a6799851` | égal |
| `F:\tmp\dojo\pr1a-mutants\RESULTS.txt` | `8c68852dc6668a5813c8efc6248caa666636df4d1fdc2095c977b9809b71a900` | égal |
| `F:\tmp\dojo\pr1a-deliver\pr1a-package-lock.patch` | `c4522ea6e9d58756fdfeb19ff512984d4a8af05c8378985b868260b207b05fef` | égal |
| `F:\tmp\dojo\r25.mjs` | `ad945944d43214a250bc190a641741b77202144e4fe3f1d9fc031de00bcb8c26` | égal |
| `F:\tmp\dojo\run-oracle.sh` | `cdb2e9581969e9969bd3a9bf176561749669634e373fe13c4f721c444f416572` | égal |
| `F:\tmp\dojo\mission-g1-pr1a.md` | `3a942b7d8b8ea1a62d70e6a3c50d44af5e4a64817b11c5be2e20320859fff235` | égal |
| `FAITS-pr1a-lectures-2026-09-26.md` (tronc) | `6086aa5ad94875b0b39886b24063e47248737d119b430853b899800376fd6eb2` (50 l., `7648e1a`) | **différent** : le journal cite `494e79f2…fdec` (40 l., `dc79237`), version antérieure à §5, relue égale par moi à 16:54Z avant l'ajout (C-G2-3) |

Oracle du G1 lu, non rejoué tel quel : `pr1a-oracle\out-clone-base\exits.txt` et `out-clone\exits.txt` (7/7 exit 0 chacun) ; `test.log` avant `tests 1331 / pass 1329 / fail 0 / skipped 2`, après `1345 / 1343 / 0 / 2` (égal au journal).

## 9. Ce que je n'ai pas pu rejouer

- Texte intégral de RFC 9162 §2.1.3.2 (réseau interdit) : Q-5, C-G2-4.
- Source de l'alphabet de `five8` : non lue par les FAITS ([inféré], FAITS l.50) ; hors de ma portée sans réseau.
- `npm test` complet d'un seul tenant dans un dépôt git : non fait ; rejoué en deux parts (suite complète sur l'archive, puis le seul fichier qui exige un dépôt dans mon clone git), §4.
- Aucune surveillance réseau au niveau du système : la suite `npm test` est hors ligne par construction (fetch injecté, ex. `apps/sentinel/test/ukemi-conc.test.ts` l.1-9), ce que je n'ai pas mesuré au niveau des sockets.

## 10. Git, écritures, provenance

- **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`.** Worktree : `status --porcelain` (avec `--no-optional-locks`), `rev-parse`, `worktree list`, `merge-base`, `diff --stat 9ee4ab3 HEAD`, `diff package.json tsconfig.json`, `config --get`. Dépôt `F:\Monark` : `count-objects -vH`, `log`, `status -- docs/dojo/`, `diff dc79237 7648e1a -- <FAITS>`, `show --stat 7648e1a` (lecture seule). Clone jetable `F:\tmp\dojo\g2-pr1a-clone` : `git clone --no-local`, puis dans le clone seul `rev-parse`, `config --get`, `status`, `diff --numstat/--shortstat`, `ls-files --others`, `diff --no-index`, `add -N`, `archive`. Aucun `add`, `commit`, `stash`, `checkout`, `branch` dans le dépôt.
- Écritures : `F:\tmp\dojo\g2-pr1a\` (copies, scripts, journaux, cache npm copié, `node_modules` installé dans `npm\overlay` avec liens internes à la copie) et `F:\tmp\dojo\g2-pr1a-clone\` (dont une jonction temporaire `node_modules` → `F:\tmp\dojo\g2-pr1a\npm\overlay\node_modules`, créée à 17:21Z et retirée par `rmdir` non récursif à 17:21Z, §4) ; aucune jonction vers `F:\Monark\node_modules` ; les preuves du G1 (`pr1a-mutants`, `pr1a-deliver`, `pr1a-oracle`, `pr1a-npm`, `F:\tmp\npm-cache`) sont lues, jamais réécrites. Rien sur C:. Pour un nettoyage : `npm\overlay\node_modules` contient des liens `@monark\*` vers `npm\overlay\` seulement (aucun vers `F:\Monark`).
- Advisor intégré : deux consultations ; conseil, jamais verdict ; chaque point vérifié sur pièce. **N°1** (après l'orientation, ~17:00Z) : ordre des rejeux, harnais du G1 à ne pas relancer en place, R-25 dans le clone, sonde du minimum du jour, lecture de Q-3 (« lever ») ; suivis, sauf deux points écartés sur pièce : (a) Q-3 « lever » : écarté par D-2 l.157, D-7 l.218, C-9 et D-18 l.299 (cas légitime de la liste vide, §5) ; (b) « ne pas rejouer typecheck / lint / ratchet (jonction de plus) » : rejoués quand même, parce que l'installation `npm ci --offline` sur copie (Q-1) donnait un `node_modules` propre sans aucune jonction vers `F:\Monark`. **N°2** (~17:25Z, rapport écrit) : confirme la voie (i) de Q-3 et le reclassement de P-M3 (mesuré) ; demande l'écriture de l'asymétrie de sévérité (§11) et un contrôle de cohérence du rapport ; suivis.

| Date | Objet | Modèle | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-26 | G2 de PR-1a (lot non committé sur `29f6458`) | `claude-opus-5-5[1m]` | max | mission G2 ; journal G1 ; livrables ; harnais ; patch ; ADR-mère ; FAITS (40 puis 50 l.) ; checklist G2 du corpus | worker G1 (instance distincte) | ce relecteur ; puis checkpoint-2, G7 | voir §11 |

## 11. Verdict

**CORRECTIONS D'ABORD.**

- Bloquantes : **C-G2-1** (worker : trois lignes de test qui épinglent le minimum du jour ; la règle est aujourd'hui annoncée, codée juste, mais aucune assertion ne la falsifie) ; **C-G2-2** (orchestrateur : étendre le périmètre du lot au verrou et appliquer le patch vérifié, sans quoi `npm ci` sort en 1 dans quatre jobs CI).
- Asymétrie de sévérité, déclarée : C-G2-1 et C-G2-5 sont toutes deux « code fidèle, test qui n'épingle pas » ; C-G2-1 bloque parce que la règle est tranchée par l'investisseur (décision 228, P-34 ; D-2 l.158), que la mère nomme son témoin fautif (« maximum du jour », M8, l.145) et qu'aucun consommateur prévu ne la borne (le collecteur de PR-2 appellera `dayValue` tel quel) ; C-G2-5 ne bloque pas parce que l'usage prévu borne l'écart (le vérificateur calcule son propre chemin et reçoit taille et racine d'une même ligne signée, D-7 l.221, D-10).
- Non bloquantes : C-G2-3 (renvois à FAITS §5 dans le code et le journal), C-G2-4 (phrase de FAITS l.50 sur L-2), C-G2-5 (lier `verifyProof` à (index, taille) dans le test Merkle), C-G2-6 (phrase du journal sur Q-3).
- Lignes de l'orchestrateur (§5) : Q-2 (facteur ×2,03), Q-3 (voie (i) ou (ii) ; avis G2 : (i), test et mutant au collecteur), Q-4 (report dans la mission de PR-1b-1), Q-8 (interfaces au G0 de PR-1b-1), Q-10 (points d'ordre faible).
- Tout le reste est conforme et rejoué : R-25 = 978 (deux méthodes, extracteur indépendant) ; 14 / 14 tests ; 27 / 27 mutants de la mère tués, résultats identiques au G1 ; 20 de mes 27 sondes tuées, 3 équivalentes justifiées, 4 survivantes (C-G2-1, C-G2-5) ; courbe et Merkle conformes aux FAITS (§1, §2, §5) ; portes du dépôt et suite complète au vert sur copie avec le verrou patché. Après C-G2-1 et C-G2-2 (et, si retenue, C-G2-5), un rejeu court suffit (deux fichiers de test, sondes P-D1 à P-D3 et P-M3, R-25 ≈ 983) : le lot sera alors, à mon avis, prêt pour le checkpoint-2.
