claude-opus-5-5[1m]

# G1 — PR-2-1 MONARK Dōjō : collecteur, partie pure (graines, ronde, instants, décodeurs, quorum par compte, composition, prix, enregistrement d'une lecture, paquet du jour et son lecteur, fixtures)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort high (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-pr2-1.md` (22 l., sha256 `85346ab82f7864a3b59559e44eb73f2470e5fb570ce2859bebac3c6122c5d88f`), horodatage de mission 2026-09-27T05:25Z. Seconde tentative : la première a été interrompue par la limite de fenêtre ; son brouillon (`F:/tmp/dojo/pr2-1-partial-0350/`) a été lu comme brouillon, relu ligne à ligne contre l'ADR, repris en partie et corrigé (§4.9) ; aucun fichier n'en a été copié tel quel.
- **Base / HEAD** : worktree `F:/Monark-wt-dojo`, branche `lot/dojo-snapshot-1`, HEAD `9cca56b2141efc2f1670f9d6832219c6bead7250` (dixième pli de la mère) ; `git status --short` vide à l'ouverture (05:22:25Z).

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 05:22:25Z | orientation : mission, HEAD, `git status` vide, ADR de lot lu en entier, mère (D-4, D-5, D-10, D-17, §6 PR-2, septième et dixième plis), code gelé, réponses brutes, FAITS, rapport |
| 05:22:25Z → 05:27:52Z (heures intermédiaires non relevées) | advisor intégré, avant toute écriture (§14) |
| 05:27:52Z | verrou d'hôte absent ; `date -u -d @1790467200` = 2026-09-27T00:00:00Z ; `scripts/export-public.mjs` ne nomme pas `dojo` |
| 05:27:52Z → 05:38:46Z (heures intermédiaires non relevées) | deux clones `--no-local` neufs (`pr2-1b-clone`, `pr2-1b-clone-base`, HEAD `9cca56b`, arbres propres) ; `node_modules` par `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0` pour chacun ; six comptes vérifiés ; fixtures ; noyau, `reading.ts`, `bundle.ts`, test ; `tsc` 0, test 12/12, `eslint` 0, R-25 870 ; mutants 21/21 et 4/4 |
| 05:38:57Z → 05:45:51Z | verrou pris (`owner.txt` « G1 PR-2-1 ») ; sept gates, passage 1 (`out-1`) : `lang:gate` exit 1 (15 mots « LE » : noms `readBigInt64LE`, `writeInt32LE`… et « i128 LE ») ; verrou rendu |
| 05:45:55Z → 05:47:20Z | correction (§4 point 10) ; test 12/12, `tsc` 0, `eslint` 0, `lang-gate` OK sur le clone ; mutants rejoués (21/21, 4/4) ; R-25 = 881 |
| 05:47:15Z → 05:55:33Z | verrou ; sept gates, passage 2 (`out-2`) : 7/7 exit 0 |
| 05:55:34Z → 06:00:56Z | verrou ; test 42 seul : 2/2 |
| 06:01:28Z | journal complété, livraison `pr2-1-deliver/` ; seconde consultation advisor, puis corrections de ce journal et nouvelle livraison |

## 1. Sources (niveau) et entrées

- **[lu]** ADR de lot `docs/adr/ADR-DOJO-PR-2.md` (sha256 `82427c52f0f18e2793044161fa890c4e7f00b34a4590d0e5565d3236d9d6f2e7`, 396 l.), en entier : D-1 à D-8, §3, §4 PR-2-1, §5, §9, pli cp-1 et verdict. Chaque constante du code cite sa ligne (forme `ADR D-3 l.132`).
- **[lu]** mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (sha256 `fc93f66c6da322c6016d6c2e0643a635543520e18026081372deb89149d35078`, 1103 l.) : D-4 (l.189-204, dont les lignes datées du dixième pli l.193, l.198, l.200, l.202), D-5 (l.205-213), D-10 (l.256-263 ; liste fermée l.260), D-17 (l.295-308 ; l.298, l.299, l.301), §6 PR-2 (l.413-416), septième pli (l.924-933), dixième pli (l.1057-1103).
- **[lu]** code gelé, sha256 inchangés : `dojo-core.mjs` avant ce lot `59273423…dd09a3`, `dojo-chain.mjs` `9baa03c4…64d3`, `dojo-verify.mjs` `5867b4df…7bf9d`, `apps/bell/src/quorum.ts` `5871b4b6…1d53`, `supply.ts` `b7352581…26bb` (l.62-77), `collect.ts` `4eb82713…b829` (recherches), `bell-chain.mjs` (`canonical`), `operators.ts` ; `probe-12.mjs` (sha256 `0ad3f985…763c`) : décodeurs `Pool` et Pyth (l.282-309), référence de forme.
- **[lu]** réponses brutes `F:/PRODUITS/dojo-mirror/probe-12/out/2026-09-27T0229Z/` : `sha256sum -c SHA256SUMS` OK sur les 18 lignes (SHA256SUMS lui-même `cfb3d4aa…673d`).
- **[lu]** FAITS `docs/dojo/FAITS-pr2-lectures-2026-09-27.md` (`3b86f76b…4e11`) : §2 (requête), §3.1, §6 (disposition `PriceUpdateV2` et `Pool`) ; `FAITS-probe-12-2026-09-27.md` (`4a964b97…a7cb4`, 81 l.) : l.12 (voûte du verrou), l.80 (ligne de correction).
- **[lu]** rapport `F:/PRODUITS/dojo/randomness/RAPPORT-DOJO-RANDOMNESS-1-2026-09-27.md` (`a8686e58…9f33`) : l.84 (règle ronde ↔ temps), l.139 et l.146 (β : 48 octets, bits de tête 0x80 compression et 0x40 infini), l.156 (`period: 3`, `genesis_time: 1692803367`), l.159 (vecteur de la ronde 123, pris pour sa **forme** seule dans le test).

## 2. Interfaces exportées (signatures)

### 2.1 `apps/dojo/scripts/dojo-core.mjs` (ajouts seuls, 0 ligne retirée ; `.d.mts` : 6 lignes ajoutées)

```ts
export function seedAnchor(secret: string, horizon: number): string;                 // H^n(s), mère D-4 l.191
export function daySeed(secret: string, horizon: number, j: number): string;         // H^(n-j)(s), 1 <= j <= n
export function beaconRound(dayStart: number, genesisTime: number, period: number): number; // ceil((T_d - g) / p) + 1
export function readInstants(seed: string, beaconSig: string, k: number, dayStart: number, offset: number): number[]; // D-5 l.149
export function readingPrice(numerator: Decimal, denominator: Decimal): [Decimal, Decimal] | null; // réduite ; null si dénominateur 0
export function dayMinimum(values: readonly (Fraction | null)[]): [Decimal, Decimal] | null;       // π_d, σ_d
```

Modules intégrés seuls (`node:crypto` déjà importé) ; aucune horloge, aucune valeur par défaut : ronde et instants prennent `genesis_time`, `period`, K et O en arguments (`read_rule`, ADR D-5 l.151). β est contrôlée à l'entrée (96 hexadécimaux minuscules, bit 0x80 posé, bit 0x40 nul).

### 2.2 `apps/dojo/src/reading.ts`

```ts
export const DOJO_READING_REFUSALS: readonly [26 noms];  export type Refusal; export type Decoded<T>;
export const byteOrder: (x: string, y: string) => number;               // = dojo-verify.mjs:99
export interface Pair { a: unknown; b: unknown }                           // null = faute d'opérateur
export interface Piece<T> { value: T | null; slots: number[]; faults: number }
export function concord<T extends { slot: number; key: string }>(p: Pair, decode: (r: unknown) => Decoded<T>): Piece<T>;
export function decodeEnumeration(result: unknown, mint: string): Decoded<Enumeration>;
export interface Eve { addresses: string[]; accounts: [account, owner][] }
export function accountStatuses(accepted: Enumeration[], eve: Eve): AccountStatus[];
export function composeAddresses(readings: Enumeration[][], eve: Eve): AddressReads[];
export function persistentNoQuorum(perReading: {account, cause}[][], k: number): { account: string }[];
export function decodeMint(result: unknown): Decoded<MintRead>;           // clé = JSON canonique de la valeur
export function checkMint(value: unknown, decimals: number): Refusal | null;
export function decodePool(result: unknown, mint: string, quoteVault: string): Decoded<PoolRead>; // clé = propriétaire + octets
export function decodeWsol(result: unknown, pool: string): Decoded<WsolRead>;                     // clé = (montant, propriétaire)
export function poolPrice(pool: PoolRead | null, wsol: WsolRead | null, statuses: AccountStatus[]): Fraction | null;
export function decodePyth(result: unknown): Decoded<PythRead>;                                    // clé = propriétaire + octets
export function solUsd(pyth: PythRead | null, instant: number, readAt: number, maxAge: number): { usd_per_sol; publish_time };
```

### 2.3 `apps/dojo/src/bundle.ts`

```ts
export const DOJO_BUNDLE_REFUSALS = ["day_not_ended", "bundle_input_malformed", "record_malformed", "bundle_malformed", "bundle_records_mismatch"];
export const DOJO_DAY_REASONS = ["beacon_unavailable", "mint_changed", "mint_unchecked"];
export class DojoBundleError extends Error { code; detail }
export interface Read { instant; read_at; slot_min; slot_max; accounts_concordant; accounts_no_quorum; pool_price; usd_per_sol; usd_per_sol_publish_time } // D-8 l.183
export interface ReadingRecord { schema: "dojo-reading-v1"; day; i; read; enumerations; mint; pool; pyth; faults; no_quorum_accounts }
export interface ReadingInput { day; i; instant; read_at; enumeration: Pair; mint: Pair | null; pool: Pair; wsol: Pair; pyth: Pair; eve: Eve; anchor: ReadingAnchor }
export function readingRecord(x: ReadingInput): ReadingRecord;
export const recordBytes: (r: ReadingRecord) => string;                 // JSON canonique (clés triées) + LF
export interface DayBundle { schema: "dojo-day-bundle-v1"; day; status; reason; mint; program; decimals; k_reads; seed; beacon; reads; addresses;
  pool_price_daily; usd_per_sol_daily; mint_check; accounts_no_quorum_persistent; records_sha256; eve_sha256 }
export function writeDayBundle(x: DayInput, now: number): { bundle: DayBundle; bytes: string };
export function readRecord(text: string): ReadingRecord;
export function readDayBundle(text: string, check?: { records: string[]; eve: Eve }): DayBundle;
```

Octets canoniques : `canonical` de `apps/bell/scripts/bell-chain.mjs` (importé, inchangé), suivi d'un LF ; le lecteur exige ces octets exacts et des clés fermées à chaque niveau.

## 3. Fichiers (créés ou modifiés ; aucun autre) — état du G1 ; état après les corrections du G2 : §16.3

| Fichier | État | Lignes | sha256 | Δ |
|---|---|---|---|---|
| `apps/dojo/scripts/dojo-core.mjs` | modifié (ajouts seuls) | 492 | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | +79 / −0 |
| `apps/dojo/scripts/dojo-core.d.mts` | modifié (ajouts seuls) | 41 | `82bcbcd6fcdbf2446bd9f5c4dddee1cb363fbc95815dd2f84a26a6b0d2735c2e` | +6 / −0 |
| `apps/dojo/src/reading.ts` | créé | 238 | `2f83df608cc4a332064f5f1313e8e4834b0d456dddd7850dc0e74996482a4114` | +238 |
| `apps/dojo/src/bundle.ts` | créé | 205 | `2e91085f0752650aa48f652518224a2742fd442edd22ee28833962e1954f6916` | +205 |
| `apps/dojo/test/dojo-collect-pure.test.ts` | créé | 307 | `0d6fb1f3c167b97a1364e2121545f231e241e49a475f63de2944b8bcaf2f8051` | +307 |
| `apps/dojo/test/fixtures/collect/enumeration.json` | créé | 16 | `9e3125effd44808497b1c729de51c62dfb9074f63930aad65e956354e5c5f11e` | +16 |
| `apps/dojo/test/fixtures/collect/accounts.json` | créé | 12 | `584af319cf4dde5eec58bf775916741bb1ed8a55f1bd687a29a9d4e09d9cee04` | +12 |
| `apps/dojo/test/fixtures/collect/provenance.json` | créé | 18 | `597817b69cc712973078605627aa1b152379e5f6e198308b6fdf532f41f7e379` | +18 |
| `docs/G1-lot-dojo-pr2-1.md` | créé (ce journal ; hors compte R-25, `ci.yml:82`) | — | rendu hors du fichier | — |

Gelés, `git diff --stat HEAD` vide : `apps/bell/**`, `dojo-chain.mjs`, `dojo-verify.mjs`, `apps/dojo/package.json`, `package.json`, `package-lock.json`, `tsconfig.json` (qui inclut déjà `apps/dojo/src/**/*.ts`), `docs/adr`. Aucune dépendance nouvelle.

## 4. Choix de forme déclarés (jamais silencieux)

1. **Paires pour le mint, le `Pool`, le SOL enveloppé et Pyth.** `readingRecord` reçoit, pour chaque pièce, les deux réponses `{a, b}` (null = faute) et les concorde en code pur (`concord`) : octets et propriétaire identiques pour `Pool` et Pyth (ADR D-3 l.131, D-4 l.141), (montant, propriétaire) pour le SOL enveloppé (D-4 l.143), JSON canonique de la valeur pour le mint. Motifs : D-4 l.145 (« trois pièces concordantes… emplacements dans `slot_min` et `slot_max` ») et mère D-4 l.197 (« les deux emplacements ») ; `quorum2` rend une seule valeur et perd le second emplacement ; M-Q8 (réserve d'un seul opérateur) se tue ainsi dans PR-2-1. Compatibilité É-9 : chaque décodeur rend une `key` ; PR-2-2 peut la passer comme `keyOf` à `quorum2` importé. Question Q-1.
2. **Forme de l'entrée « adresses de la veille »** : `Eve = {addresses, accounts}`. Les adresses composent (une adresse sans compte à une lecture lit « 0 », D-7 l.178) ; les comptes connus comptent dans `accounts_no_quorum` sous faute (C-V-3, D-2 l.125) et donnent le « 0 » concordant d'un compte absent chez les deux (mère D-4 l.196). Le premier jour lu (historique de PR-2b, par adresse) peut n'avoir que des adresses. Question Q-2.
3. **Contrôle du mint en calque, pas `readMintToken2022` importé** : mère §6 T-7 dit « `readMintToken2022` importé » ; cette fonction (`supply.ts:62-77`) prend des valeurs par défaut (`supply` « 0 », `decimals` 0) et ne lit que trois extensions nommées, donc ne voit ni une extension non prévue (mère D-4 l.194) ni les autorités. `checkMint` en calque la forme, sans défaut : programme et parseur, décimales, autorités nulles, extensions exactement {`metadataPointer`, `tokenMetadata`} (ADR §4 l.228). Question Q-3.
4. **Refus nommés du collecteur** (`DOJO_READING_REFUSALS`, 26 ; `DOJO_BUNDLE_REFUSALS`, 5) : du côté collecteur, hors de la liste du vérificateur (précédent `day_not_ended`, `anchor_day_not_read`, `beacon_unavailable`, ADR D-1 l.113, D-8 l.190) ; le test asserte leur disjonction avec `DOJO_VERIFY_REFUSALS` (mère D-10 l.260 : aucun code ajouté). Ils ne sont jamais écrits dans une lecture publiée ; `mint_check` du paquet porte le refus du mint.
5. **Motifs d'abstention** : `beacon_unavailable` (ADR D-5 l.153) ; `mint_changed` (mint concordant contrôlé, refusé) et `mint_unchecked` (aucun mint concordant de tout le jour) **proposés** : la mère dit « le jour s'abstient et la ligne le dit » (D-4 l.194) sans nommer le motif. Question Q-4.
6. **Fixtures** : `context` réduit à `{slot}` (les autres champs, dont une chaîne de version différente d'un opérateur à l'autre, sont retirés et la règle est écrite dans `provenance.json`) ; chaque entrée gardée et chaque valeur gardée restent des sous-chaînes exactes de leur fichier source (contrôlé par le générateur). L'enregistrement garde du mint la valeur concordante et les deux emplacements, jamais la réponse brute.
7. **r_M = 0** : « prix nul pour la lecture » (ADR D-4 l.144) lu comme **absence de prix** (`null`), pas [r_S, 0] ni 0 : un rapport à dénominateur nul n'est pas une fraction. Question Q-5.
8. **Emplacements d'une lecture** : `slot_min`/`slot_max` sur tous les emplacements des réponses décodées de la lecture (énumérations acceptées, mint, `Pool`, SOL enveloppé, Pyth). Lecture manquée (`read_at` null) : toutes les paires vides, lectures `null`, comptes de la veille sans quorum ; jamais un « 0 ». État du G1 : fautes 2 par pièce, sauf le mint (0 quand il n'est pas lu à cette lecture), cause `fault`. **Après C-G2-5 (Q-6)** : fautes 0 pour chaque pièce, cause `missed` (§16).
9. **Brouillon de la première tentative** : repris après relecture pour le noyau (identique en substance, commentaires recités), `decodeEnumeration`, `accountStatuses`, `composeAddresses`, `persistentNoQuorum`, `checkMint`, les décodeurs, le lecteur et la plupart des tests ; corrigés : paires (point 1 ; le brouillon prenait une réponse unique par pièce, M-Q8 côté r_S intuable), `Eve` (point 2 ; le brouillon ne portait que des comptes), fixtures (point 6 ; le brouillon gardait `apiVersion`), valeur du mint dans l'enregistrement (le brouillon gardait la réponse brute), `DojoBundleError` sans propriété de paramètre (refusée par Node en mode « strip-only », mesuré : `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`).
10. **Porte de langue** (mesuré au passage 1) : `scripts/lang-gate.mjs` lit « LE » (mot français) dans `readBigInt64LE` et consorts (un chiffre n'est pas une lettre pour sa frontière, l.128-132) et dans « i128 LE ». Les lectures d'entiers petit-boutistes passent par `intAt` (boucle d'octets, complément à deux, `reading.ts`) ; le test écrit et lit ses octets par ses propres fonctions recodées (`put`, `at`) ; « little-endian » en toutes lettres. Aucune exemption demandée ; comportement inchangé (test, mutants, sondes P-3 et P-4 rejoués).
11. **Comptes concordants** : `accounts_concordant` compte aussi les « 0 » concordants des comptes de la veille absents chez les deux (mère D-4 l.196 : lecture concordante de 0).
12. **Compte de base du pool absent de l'énumération de la lecture** (contrôle de D-4 l.141) : prix de lecture `null`, pas un refus nommé du `Pool` (le `Pool` ne dit rien de faux ; c'est la lecture qui manque d'une pièce concordante).
13. **Adresse de la veille mal formée** : `composeAddresses` appelle `ownerClass`, qui lève une erreur simple (pas un `DojoBundleError`) ; fail-closed dans les deux cas ; forme de l'entrée : Q-2.

## 5. Fixtures (`apps/dojo/test/fixtures/collect/`, comptées R-25)

- Générateur hors dépôt `F:/tmp/dojo/pr2-1b-tmp/fx/gen.mjs` (sha256 `13a3f425988c85a0e8a9d234e4e29106d8c10e37553bc5ae95170e4b42b9f85f`) puis `prov.mjs` (`0d2d08577010a838882cc2b9feb73b03cca2a58a62c126bc9c81cd19e55776bd`) : sha256 de chaque source contrôlé contre `SHA256SUMS` ; a/b triés par `context.slot` ; les noms d'opérateur ne servent qu'à ouvrir les fichiers et ne sont écrits nulle part.
- Six comptes par réponse d'énumération (P1b1, emplacements 450 862 697 et 450 862 700), vérifiés sur les deux réponses brutes par `check6.mjs` (`45fe1004…75e1fc`) : `3tdL…4HWi` et `7uZB…aQUJ` (`holder`, 170 octets) ; `MeQM…Ykzd` (compte de base du pool, `program`, 117 283 623 429 277) ; `AD76…w4nr` (voûte du verrou, `program`, 165 octets, FAITS probe-12 l.12) ; `7Ysy…kpj8` (`holder`, 165 octets) ; `CM72…1hiW` (`holder`, cible des mutations). Mint (P1a), `Pool` (P2a), SOL enveloppé (P2b), Pyth (P2c) : valeurs entières.
- Variantes synthétiques dérivées dans le test et déclarées à leur usage (ADR §4 l.239) : adresse à deux comptes, désaccords, compte fermé, achat en cours de jour, extension ajoutée, Pyth `Partial`, périmé, autre flux, autre propriétaire, longueurs et octets du `Pool`, SOL enveloppé d'un autre montant.

## 6. R-25 (méthode `ci.yml:82` / `:90`, clone `--no-local`, base = HEAD)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, égal octet pour octet à `pr1b2-r25-methodA.mjs`) : pathspec de `ci.yml:82` extrait du fichier (20 éléments), `git diff --numstat 9cca56b` pour les suivis, `git diff --no-index --numstat /dev/null <f>` pour les non suivis, métrique insertions + suppressions ; aucune écriture git.
- Sur `F:/tmp/dojo/pr2-1b-clone` : `dojo-core.d.mts` 6, `dojo-core.mjs` 79, `bundle.ts` 205, `reading.ts` 238, test 307, fixtures 12 + 16 + 18 = **881** lignes CODE (870 avant la correction du §4 point 10).
- Estimation ascendante (ADR §5, ligne du pli) : 445 ; dérive mesurée 881 / 445 = **×1,98** ; cible ≤ 934,5 tenue ; seuil d'arrêt 950 non atteint ; STOP 1 150 à 269 lignes. Coupe C-6 non posée.

## 7. Tests (`apps/dojo/test/dojo-collect-pure.test.ts`, 12 tests, tous les noms de l'ADR §4 PR-2-1)

Oracles recodés dans le test (chaîne SHA-256, formule des instants, règle de ronde par la propriété « première ronde à ou après T_d », i128 petit-boutiste, pgcd, minima, décalages Pyth) ; jamais le module pour se vérifier lui-même. Aucun réseau, aucune horloge.

| Test | Couvre | Mutants visés |
|---|---|---|
| `dojo_collect_instants_follow_the_seed_chain` | H^n, H^(n−j), H^j(g_j) = ancre ; instants recodés ; O = 900 ; β dans le tirage ; doublons gardés (β synthétique trouvée au compteur 256 : instants `1790469960, 1790480732, 1790480732, 1790485173`) ; formes de β refusées ; minuit exigé | M-B1 |
| `dojo_beacon_round_is_the_first_round_of_the_day` | 32 554 612 le 2026-09-27, +28 800 le lendemain ; propriété sur genèses non alignées (synthétiques) | M-B2 (a, b) |
| `dojo_collect_reads_quorum_per_account` | fixture concordante ; adresse synthétique à deux comptes (somme) ; désaccord de montant ou de propriétaire ⇒ null ; compte chez un seul ⇒ null ; réponse d'un seul opérateur ⇒ 0 concordant | M-Q1, M-Q2, M-Q10 |
| `dojo_address_without_account_reads_zero` | absence concordante d'un compte de la veille = « 0 » ; veille par adresses seules ; achat en cours de jour (« 0 » avant) ; faute ⇒ null ; paquet : jour à 0 | M-Q7, M-Q16 |
| `dojo_collect_abstains_on_mint_change` | mint verbatim accepté (a et b) ; 8 variantes (extension ajoutée, retirée, dupliquée, décimales, deux autorités, programme, extensions absentes) ; paquet abstenu `mint_changed` ; mint en désaccord à la lecture 1 ⇒ contrôlé à la lecture 2 ; aucun mint concordant ⇒ `mint_unchecked` | M-Q4 |
| `dojo_enumeration_refuses_an_unparsed_response` | repli base64, autre mint, état, montant, propriétaire ⇒ réponse entière refusée ; `frozen` accepté ; réponse refusée ⇒ `accounts_no_quorum` = comptes connus (N + 1 avec la veille), 0 concordant, causes `fault`, aucune adresse à « 0 » ; refus disjoints de D-10 | M-Q13, M-Q20 |
| `dojo_pool_reserve_adds_virtual_quote_reserves` | coffre du `Pool` = `6KLx…ZbTW` sur les octets ; i128 recodé ; r_S = 161 206 676 086 ; prix [r_S, r_M] réduit ; enregistrement du pool ; `Pool` ou SOL enveloppé d'un seul opérateur, octets ou montant divergents, r_M en désaccord ⇒ null ; longueurs 271, 261, 245, 203 et refus 260, 246, 202 ; négatif, discriminant, deux mints, coffre, propriétaire | M-Q8, M-Q12 |
| `dojo_sol_usd_needs_a_full_fresh_feed` | décalages recodés (prix 12 163 640 373, −8, `publish_time` 1 790 476 108) ; fraîcheur 165 s bornes incluse/exclue ; publié après la lecture ; 7 refus ; par l'enregistrement : `Partial`, périmé, autre flux, autre propriétaire ⇒ null ; octets divergents ⇒ null | M-Q14 (a, b), M-Q15 (a, b) |
| `dojo_day_prices_are_the_minimum_of_concordant_readings` | π_d et σ_d = minima sur trois lectures synthétiques ; lecture 4 sans compte de base concordant et périmée ⇒ null | M-Q9 (a, b) |
| `dojo_bundle_carries_no_operator_label_and_no_secret` | paquet, enregistrements et fixtures sans domaine ni libellé de `OPERATOR_OF_DOMAIN`, sans `apiVersion` ; ni s ni aucune autre graine que g_d ; `day_not_ended` une seconde avant la fin du jour de lecture ; jour sans β : fin T_{d+1} ; ronde r_d + 1 refusée | M-Q5 |
| `dojo_bundle_round_trips_through_its_reader` | écrivain → lecteur égal, octets canoniques ; enregistrements relus égaux ; sha256 ; lecture 2 en faute ⇒ null ; clé en trop, statut altéré, valeur composée altérée, veille ou enregistrement substitués ⇒ refus nommés. Au G1, la « clé en trop » était refusée par le contrôle d'octets (octets non canoniques), non par les clés fermées : aucune des deux défenses n'était isolée (G2, sondes G-07, G-27, G-28 ; corrigé par C-G2-2, §16) | — |
| `dojo_bundle_counts_accounts_without_quorum_at_every_read` | `no_quorum_accounts` triés `{account, cause}` ; comptes 2, 2, 2, 1 ; persistant = le seul compte en désaccord aux quatre lectures ; fautes exclues (verdict cp-1 point (5)) | M-Q22 |

- Commande (clone) : `node --test --test-timeout=120000 apps/dojo/test/dojo-collect-pure.test.ts` ⇒ `tests 12, pass 12, fail 0` (avant et après la correction du §4 point 10 ; dans la suite du passage 2 : les 12 ✔). `npx tsc --noEmit` exit 0 ; `npx eslint apps/dojo/src/reading.ts apps/dojo/src/bundle.ts apps/dojo/test/dojo-collect-pure.test.ts` exit 0.

## 8. Mutants (copies hors dépôt, `F:/tmp/dojo/pr2-1-mutants/`)

Harnais `mutants.mjs` (sha256 `7709946e425cfceb37e9189e2695ff95c1d94f4243519f1c842f0778f4745b73`, inchangé entre les deux passes), calque de celui de PR-1b-2 : remplacements exacts (nombre d'occurrences contrôlé) dans une copie des 16 fichiers dont le test a besoin, sous `<id>/` ; TAP gardé par mutant (`<id>/tap.txt`, avec l'en-tête des sha256) ; tué seulement si le TAP porte `not ok N - <test visé>` ; témoin d'abord : exit 0, 12 ok, 0 not ok. Fichiers d'origine inchangés au sha256 après la passe. Deux passes : la première sur les fichiers d'avant la correction du §4 point 10 (`RESULTS-run1-before-langfix.txt`, sha256 `92c104d169cb9f89116a2a9e124b3b1099a9766e27ea107f16dc82c84d325ded`, même verdict), la seconde sur les fichiers livrés (`RESULTS.txt`, sha256 `9344309186f5cbf3a69df520a3a5dc47e0f51f2b9a07aef5df05189cb95a9c70`), qui fait foi. Variantes a/b d'un même mutant de la liste ; P-* = sondes hors liste.

| Id | Mutation | Test visé | Verdict |
|---|---|---|---|
| M-Q1 | la réponse d'un seul opérateur prise pour quorum (statuts et composition) | `dojo_collect_reads_quorum_per_account` | tué |
| M-Q2 | désaccord compté comme baisse (plus petit montant) | idem | tué |
| M-Q4 | extensions du mint non contrôlées | `dojo_collect_abstains_on_mint_change` | tué |
| M-Q5 | contrôle `day_not_ended` retiré (graine et instants écrits avant la fin du jour de lecture) | `dojo_bundle_carries_no_operator_label_and_no_secret` | tué |
| M-Q7 | absence concordante écrite `null` (jour manquant) | `dojo_address_without_account_reads_zero` | tué |
| M-Q8 | pièce d'un seul opérateur acceptée (`concord`) | `dojo_pool_reserve_adds_virtual_quote_reserves` | tué |
| M-Q9a | prix du jour au maximum | `dojo_day_prices_are_the_minimum_of_concordant_readings` | tué |
| M-Q9b | prix du jour à la moyenne | idem | tué |
| M-Q10 | somme partielle (comptes concordants seuls) écrite comme concordante | `dojo_collect_reads_quorum_per_account` | tué |
| M-Q12 | `virtual_quote_reserves` ignoré dans r_S | `dojo_pool_reserve_adds_virtual_quote_reserves` | tué |
| M-Q13 | entrée sans parseur sautée, réponse interprétée | `dojo_enumeration_refuses_an_unparsed_response` | tué |
| M-Q14a | Pyth `Partial` accepté | `dojo_sol_usd_needs_a_full_fresh_feed` | tué |
| M-Q14b | Pyth périmé accepté | idem | tué |
| M-Q15a | `feed_id` non contrôlé | idem | tué |
| M-Q15b | propriétaire Pyth non contrôlé | idem | tué |
| M-Q16 | adresse sans compte écrite `null` au lieu de « 0 » | `dojo_address_without_account_reads_zero` | tué |
| M-Q20 | réponse refusée traitée comme énumération vide | `dojo_enumeration_refuses_an_unparsed_response` | tué |
| M-Q22 | persistant calculé sur K − 1 lectures : écriture du G1, lecture K omise | `dojo_bundle_counts_accounts_without_quorum_at_every_read` | tué ; l'écriture « lecture 1 omise » (M-Q22b du G2) survivait au G1 : tuée après C-G2-1 (§16) |
| M-B1 | instants sans β | `dojo_collect_instants_follow_the_seed_chain` | tué |
| M-B2a | ronde r_d + 1 | `dojo_beacon_round_is_the_first_round_of_the_day` | tué |
| M-B2b | dernière ronde de la veille (r_d − 1) | idem | tué |
| P-1 | ronde « à ou avant » T_d (égale sur minuits alignés) | idem | tué (genèse synthétique non alignée) |
| P-2 | désaccord de propriétaire seul accepté | `dojo_collect_reads_quorum_per_account` | tué |
| P-3 | longueurs 246 à 260 du `Pool` lues comme 0 | `dojo_pool_reserve_adds_virtual_quote_reserves` | tué |
| P-4 | `virtual_quote_reserves` négatif accepté | idem | tué |

**Liste fermée : 17 mutants (21 variantes) tués par leur test visé, 0 survivant ; 4 sondes tuées.**

## 9. Oracle (sept gates sur clone, sous verrou d'hôte) et test 42

- Scripts : `F:/tmp/dojo/pr2-1b-run-oracle.sh` (sha256 `c98e982d4ca09613f0d737274042c3b87bc7e53811733df77a43bc4c403d7a9e`) = `pr1b2-run-oracle.sh` au dossier temporaire près (`diff` : une ligne) : `npm run <gate> > <log> 2>&1` pour `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, codes capturés directement, huit variables payantes retirées (`env -u`), TEMP/TMP sur F: ; verrou `F:/tmp/dojo/pr2-1b-locked.sh` (sha256 `fc2493f5a212eb71bacfd0a0f3076613284996f9565f4668689328f0db2442db`) : `mkdir F:/tmp/oracle-lock` atomique, `owner.txt` « G1 PR-2-1 », attente 60 s jusqu'à 90 min, retrait dans le piège EXIT. Arbre : `F:/tmp/dojo/pr2-1b-clone` (clone `--no-local` de HEAD `9cca56b`, fichiers du lot copiés par `pr2-1b-sync.sh`, égaux octet pour octet au worktree, `cmp` après le passage 2) ; Node v24.15.0.
- **Passage 1** (`out-1`, 05:38:57Z → 05:45:51Z, fichiers d'avant le §4 point 10) : `gate:vocab` 0, `typecheck` 0, `test` 0 (1 387 tests, 1 385 pass, 0 fail, 2 skipped ; `test.log` sha256 `25e83927c6230f55c4cb136eadab6637145d88910694e9dc42c4667fb0caf21f`), `lint` 0, `lint:ratchet` 0 (69/69), **`lang:gate` 1** (15 « LE », `lang-gate.log` sha256 `057079be2326bbaa42d6edf88371d66731be3a614d3a00304e752edcfeb5ccad`), `export:check` 0. Gardé ; jamais cité comme vert.
- **Passage 2** (`out-2`, 05:47:15Z → 05:55:33Z, fichiers livrés) : **7/7 exit 0**. `test` : 1 387 tests, **1 385 pass, 0 fail**, 0 annulé, 2 skipped (préexistants), les 12 tests de ce lot ✔ (`test.log` sha256 `84fcb19bcbf9376b36a1141175c1dc6508615d77726c98fd947443e10966f8ed`) ; `lint:ratchet` 69/69 (`45ede4ce…6b42`) ; `lang:gate` OK, 0 occurrence (`b22ac8f8…0dd7`) ; `typecheck` `03481a8f…2051` ; `lint` `f845417c…4f` ; `gate:vocab` `f1b1a916…be2b` ; `export:check` `2f9645a9…f16`.
- **Test 42 à part, après la suite** (verrou repris 05:55:34Z → 06:00:56Z) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` sur le même clone ⇒ exit 0, `tests 2, pass 2, fail 0` (le motif prend aussi `export_public_derived_jobs_are_byte_identical … (test 42(f'))`) ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 322 s (`test42.log` sha256 `694d73745198aa97fc3ac83d6c7f04197dccacf0ff9c2612f6fa99c51156ff36`). Il était aussi vert dans la suite des deux passages (350 s et 433 s).

## 10. Export-run (CONSIGNE-G1-EXPORT-RUN-1)

- `grep -n dojo scripts/export-public.mjs` : aucune ligne (exit 1) ; `apps/dojo/**` n'est pas exporté vers le miroir public (constat déjà fait au G1 de PR-1b-2). Aucun test neuf sous un dossier exporté : l'export local n'est pas exécuté, par la règle elle-même.

## 11. Ce que je n'ai pas fait, et pourquoi

- Aucun réseau, aucun RPC, aucun appel à un relais de la balise : PR-2-1 est pure ; la ronde 32 554 612 est calculée, pas lue.
- Aucune vérification BLS de β (forme (ii), ADR D-5 ; DOJO-BLS-VERIFY-1) : seule la forme est contrôlée.
- Aucun appel à `quorum2`, aucun import de `readMintToken2022` (§4 points 1 et 3, questions Q-1 et Q-3).
- Refus du jour d'ancre (`anchor_day_not_read`), fenêtre de lecture, verrous, budget : PR-2-2 (ADR D-1 l.110-114, D-8 l.190).
- Aucun passage « avant » des sept gates sur le clone de base (`pr2-1b-clone-base` créé, non utilisé par la méthode A, qui mesure contre le commit de base dans le clone de travail).
- Aucun `git add/commit/stash/checkout/branch` (R-20) ; `git` en lecture seule dans le worktree ; deux `git clone --no-local` hors dépôt ; aucune écriture sur C:.

## 12. Questions formées (choix fail-closed explicites ; aucun « dû » nu)

- **Q-1 (orchestrateur, É-9)** : les quatre pièces sont concordées en paires par `reading.ts` (clés exportées pour `quorum2`). PR-2-2 garde-t-il `quorum2` pour elles (et alors comment rend-il le second emplacement que D-4 l.145 exige), ou passe-t-il les deux réponses à `readingRecord` ? Recommandation : les deux réponses (une seule règle de concordance, testée ici).
- **Q-2 (orchestrateur, D-7 l.178)** : forme de l'entrée de la veille `{addresses, accounts}` ; qui la produit (PR-2-2 depuis le paquet d−1 et ses enregistrements ; PR-2b pour le premier jour, adresses seules) ; ligne datée de l'ADR de lot ?
- **Q-3 (orchestrateur, mère §6 T-7)** : `checkMint` calque `readMintToken2022` au lieu de l'importer (défauts silencieux de la fonction de Bell ; extensions non prévues invisibles). Ligne datée de la mère au prochain pli ?
- **Q-4 (orchestrateur, mère D-4 l.194)** : motifs `mint_changed` et `mint_unchecked` (proposés) ; un jour sans aucun mint concordant est abstenu (fail-closed). À confirmer ou à renommer.
- **Q-5 (orchestrateur, ADR D-4 l.144)** : r_M = 0 ⇒ `pool_price` null (lecture « nul » = absence de prix).
- **Q-6 (orchestrateur)** : lecture manquée (`read_at` null) : fautes comptées 2 par pièce et comptes de la veille sans quorum, cause `fault` ; ou une cause distincte (lecture non faite) pour le déclencheur de remplacement du D-6 ?

## 13. Tuyaux (règle Branchement)

- Entrée de PR-2-1 : réponses de la chaîne en paires (PR-2-2, TU-1a) ; balise (TU-B) ; veille (TU-1p). Sortie : `readingRecord`/`recordBytes` → `readings/<i>.json` (PR-2-2) et PR-2b (TU-1h, par `readRecord`) ; `writeDayBundle` → `publish/day.json` (PR-2-2 `--close-day`) → PR-3a (TU-1c, absent, déclencheur G7 de PR-3a) ; `readDayBundle` → PR-3a.
- Aucun chemin servi ne consomme ces sorties à ce G1 : la pièce reste `upcoming` ; la composition bout en bout est `dojo_collect_to_verify_end_to_end` (PR-2-2). Ici, composition testée en pur : réponses → enregistrements → paquet → lecteur (`dojo_bundle_round_trips_through_its_reader`).

## 14. Consultations advisor (outil intégré, avis jamais verdict)

- Après l'orientation, avant l'écriture : ordre de travail ; paires pour les quatre pièces (condition de M-Q8 côté r_S et de D-4 l.145) ; forme de la veille ; réduction de `context` ; noms de refus côté collecteur et motifs proposés ; re-vérification des six comptes sur les réponses brutes ; mesure R-25 tôt ; M-B2 sur genèse non alignée ; verrou et test 42 à part. Chaque point vérifié sur pièce ; tous suivis.
- Après la livraison, avant la remise : aucun changement de code ; hygiène du journal (heures non relevées dites comme telles au §0, second passage de l'advisor consigné ici, durée périmée retirée du §7, points 11 à 13 du §4 déclarés), nouvelle livraison. Conseil, jamais verdict ; suivi.

## 15. Provenance, git, fichiers livrés

- **Lu en entier** : mission ; ADR de lot ; FAITS PR-2 §2, §3.1, §6 ; `dojo-core.mjs`, `dojo-chain.mjs`, `quorum.ts`, `operators.ts`, `supply.ts` l.1-120 ; brouillon de la première tentative (4 fichiers). **Par extraits** : mère (sections du §1), `dojo-verify.mjs` (l.1-30, l.87-99), `collect.ts` (recherches), `probe-12.mjs` (recherches, l.76-82, l.152-155, l.282-309), rapport (recherches), `lang-gate.mjs` (l.120-135), `eslint.config.mjs`, `lint-ratchet.mjs`, `ci.yml` (l.78-95).
- **git** : lecture seule dans le worktree (`status --short`, `log -1`, `diff --stat`) ; deux `git clone --no-local` du worktree vers `F:/tmp/dojo/` ; aucun `add/commit/stash/checkout/branch`, aucun `GIT_DIR`, aucun `GIT_WORK_TREE`. Écritures dans le worktree : les 8 fichiers du §3 et ce journal. Rien sur C: ; aucun réseau ; commandes < 6 Ko ; heures lues à `date -u`.
- **Jonctions `node_modules`** : posées par `mk-nm.ps1` dans `pr2-1b-clone` et `pr2-1b-clone-base` ; laissées en place pour le relecteur (retrait par `rm-nm.ps1 -Tree <arbre>` seulement). Les clones de la première tentative (`pr2-1-clone`, `pr2-1-clone-base`) ne sont pas touchés.
- **Livrés** : `F:/tmp/dojo/pr2-1-deliver/` (les 8 fichiers du §3, ce journal, `mutants.mjs`, `RESULTS.txt`), `DELIVERED.sha256` ; oracle `F:/tmp/dojo/pr2-1b-oracle/` ; mutants `F:/tmp/dojo/pr2-1-mutants/`.
- **`git status --short` final (worktree, relu après la dernière écriture de code, 06:0xZ)** : ` M apps/dojo/scripts/dojo-core.d.mts`, ` M apps/dojo/scripts/dojo-core.mjs`, `?? apps/dojo/src/`, `?? apps/dojo/test/dojo-collect-pure.test.ts`, `?? apps/dojo/test/fixtures/`, `?? docs/G1-lot-dojo-pr2-1.md` — rien d'autre ; HEAD `9cca56b`.
- **`error_origin` proposé** (au G7) : §4 point 10 (porte de langue rouge au passage 1) = générateur (ce G1 ; noms de méthodes `Buffer` non passés au crible avant l'oracle) ; É-9 de l'ADR de lot : voir Q-1.

## 16. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker correcteur, effort high (mission), contexte frais, distinct du relecteur G2.
- **Mission** : `F:/tmp/dojo/mission-corr-pr2-1.md` (15 l., sha256 `6651fd55274faa883c8dc1f7f3a95584b372e862463487e3b074b2db05483436`), horodatage 2026-09-27T06:40Z ; `date -u` à l'orientation : 06:36:16Z (horloge de la machine avant l'horodatage de mission : écart déclaré, sans effet).
- **Entrées lues en entier** : rapport G2 `F:/tmp/dojo/g2-pr2-1/G2-report.md` (sha256 `b39f663979798fe907c4e909e019f5648a5b307744b5df476e42db729bf984d3`, égal à l'annonce ; C-G2-1 à C-G2-8, sondes G-01 à G-31, prototypes `q6-patch.cjs` et `fix-patch.cjs`, listes `g2-mutants*.json`) ; ce journal ; ADR de lot (`82427c52…d6f2e7` à l'ouverture, 396 l.) ; mission G1 ; les trois fichiers de code et le test du lot. Sources du lot au sha256 du §3 à l'ouverture (`F:/tmp/dojo/pr2-1-corr/before.sha256`).
- **Discipline** : aucun git écrivant dans le worktree (lecture : `status`, `diff`, `log`) ; un `git clone --no-local` vers `F:/tmp/dojo/pr2-1-corr/clone` ; aucun réseau ; rien sur C: ; `docs/PLAN-*`, `docs/adr/ADR-DOJO-SNAPSHOT-1.md`, `docs/dojo/FAITS-*` non touchés (modifiés par une autre piste, §1 du rapport G2) ; suite complète et test 42 sous le verrou d'hôte `F:/tmp/oracle-lock` (propriétaire « corr PR-2-1 »).

### 16.1 Journal (`date -u`)

| Heure | Fait |
|---|---|
| 06:36:16Z | orientation : mission, rapport G2 (sha256 relu), worktree (HEAD `9cca56b`, six lignes du lot et trois fichiers étrangers), sources du lot, journal G1, ADR de lot, mission G1, harnais et listes du G2 et du G1 |
| 06:37:58Z → 06:40:37Z | advisor intégré, avant toute écriture (§16.9) |
| 06:40:37Z | clone `--no-local` (HEAD `9cca56b`) ; `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0` |
| 06:4xZ (non relevée) → 06:43:37Z | corrections de code (`corr-code.cjs`) et de test (`corr-test.cjs`) dans le worktree ; synchronisation (`sync.sh`, `cmp` égal) ; test du lot 12/12 |
| 06:44:14Z | `tsc` 0 ; `eslint` 1 (une assertion de type inutile dans le test), corrigée, puis 0 ; `lang-gate` OK ; R-25 = 913 |
| 06:46:02Z → 06:46:28Z | mutants et sondes : 69/69 tués par leur test visé |
| 06:46:40Z → 06:53:20Z | verrou pris sans attente ; sept gates : 7/7 exit 0 ; verrou rendu |
| 06:47:15Z | lignes datées de l'ADR de lot (ajout seul, 396 → 411 l.) ; corrections en place de ce journal (C-G2-7) |
| 06:53:47Z → 06:57:14Z | verrou repris ; test 42 seul : exit 0, 2/2 ; verrou rendu (absent à 06:57:19Z) |

### 16.2 Corrections

| Id | Nature | Fait | Preuve |
|---|---|---|---|
| C-G2-1 | test | `late` : un compte en désaccord aux lectures 2 à 4 seulement, et le seul compte en désaccord aux quatre, S165 ; persistant = `[{account: S165}]` | M-Q22 (lecture K omise) et M-Q22b (lecture 1 omise) tués ; M-Q22c (au moins K − 1) tué |
| C-G2-2 | test | `canonical` importé de `bell-chain.mjs` ; pour `readDayBundle` et `readRecord` : clé en trop **en octets canoniques** ⇒ `bundle_malformed` / `record_malformed` ; clés exactes en octets non canoniques ⇒ même refus ; codes exacts assertés | G-07, G-27, G-28 tués |
| C-G2-3 | test | réponse refusée avec un compte de la veille absent des réponses : aller-retour `readRecord(recordBytes(r))` égal ; liste `no_quorum_accounts` inversée ⇒ `record_malformed` | G-08b, G-08c tués |
| C-G2-4 | code et test | test : r_S = 2 r_M (SYNTHÉTIQUE) ⇒ `pool_price` = `["2", "1"]` ; lecteurs : `frac` exige pgcd = 1 (`bundle.ts`, `gcd`), pour `pool_price`, `usd_per_sol`, `pool_price_daily`, `usd_per_sol_daily` ; test : `["2", "2"]` dans le paquet et `["10", "10"]` dans un enregistrement, en octets canoniques ⇒ refus | G-09 tué ; sonde nouvelle G-31 (lecteurs sans pgcd) tuée |
| C-G2-5 | code et test (Q-6) | décision de l'orchestrateur : cause **`missed`**, admise seulement avec `read_at` null ; fautes à 0 pour une lecture non faite (option b) ; `accounts_no_quorum_persistent` inchangé. Code : `Cause` gagne `missed` (`reading.ts`) ; écrivain : `cause` `missed` et fautes 0 quand `read_at` est null ; lecteur : `missed` ⇔ `read_at` null, fautes 0 quand `read_at` est null (`bundle.ts`). Test : lecture non faite ⇒ `[{account, cause: "missed"}]`, fautes `[0, 0, 0, 0, 0]`, aller-retour égal ; `missed` réécrit `fault`, fautes à 2, `disagreement` réécrit `missed` dans une lecture faite ⇒ `record_malformed` ; lecture non faite portant une réponse ⇒ `bundle_input_malformed` | M-Q23a à M-Q23f tués ; G-14, G-15 tués |
| C-G2-6 | test | SOL enveloppé `isNative` faux et programme `spl-token-2022` ⇒ `wsol_malformed` ; clé publique en double ⇒ `enumeration_malformed` ; emplacements Pyth 1 et 2^40 (SYNTHÉTIQUES, octets identiques) ⇒ `slot_min` 1, `slot_max` 2^40, σ gardée ; lecture 1 saine et lecture 2 changée, concordantes ⇒ `counted`, `mint_check` `ok` (É-5) | G-16, G-17, G-18, G-19, G-21 tués |
| C-G2-7 | journal | §4 renuméroté (10 après 9, liste continue) ; §4 point 8 (état G1 et état après C-G2-5) ; §7 (la « clé en trop » du G1 tombait sous le contrôle d'octets) ; §8 (M-Q22 : deux écritures) ; titre du §3 (état G1) | ce journal |
| C-G2-8 | déclaration | §16.7 | — |

Lignes datées de l'ADR de lot (ajout seul, décisions de l'orchestrateur ; numéros de la version `82427c52…`) : après É-9 l.97 et D-1 l.114 (Q-1 ; la mission cite « D-1 l.115 », la phrase visée est la l.114, dit dans la ligne) ; après D-4 l.144 (Q-5) ; après D-7 l.177 (C-G2-5 et Q-6 ; Q-4) ; après l.178 (Q-2) ; après §4 PR-2-1 l.230 (M-Q23, distinct de M-23 de PR-1b-3) ; après PR-2-3 l.242 (un compte `missed` n'est jamais soumis au témoin) ; section finale « Pli G2 PR-2-1 ». Contrôle par le script : l'ancien fichier se retrouve en retirant les lignes ajoutées ; `git diff --numstat` : +15 −0. Commentaires du code alignés sur Q-1, Q-2, Q-4 (en place, sans ligne ajoutée dans `reading.ts`).

### 16.3 Fichiers après correction (aucun autre)

| Fichier | Lignes | sha256 | Δ contre le G1 |
|---|---|---|---|
| `apps/dojo/scripts/dojo-core.mjs` | 492 | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | inchangé |
| `apps/dojo/scripts/dojo-core.d.mts` | 41 | `82bcbcd6fcdbf2446bd9f5c4dddee1cb363fbc95815dd2f84a26a6b0d2735c2e` | inchangé |
| `apps/dojo/src/reading.ts` | 238 | `120e5112e8f8b765a37d4ad65f4cf9151c0dab1ff338ad55eb2b6c83ad5b9213` | 5 lignes modifiées en place (`Cause`, commentaires Q-1 et Q-2) |
| `apps/dojo/src/bundle.ts` | 209 | `e8b1fb3830bdb8af03e44263ce3d66c4a89eab0c257b2236d3598129547c3fda` | +4 ; 8 lignes modifiées en place |
| `apps/dojo/test/dojo-collect-pure.test.ts` | 335 | `294a0a9c39be8b5e7c5d590cb00e3e9a4c509f0489afb85fcfaa318464f1a8a3` | +28 ; 1 ligne modifiée en place (liste des refus d'énumération) |
| fixtures `enumeration.json`, `accounts.json`, `provenance.json` | 16, 12, 18 | inchangés (§3) | — |
| `docs/adr/ADR-DOJO-PR-2.md` | 411 | `397e6d4c9e0a93033220d857187140d934e35c8ee0d19015d1a6c9199a6267a1` | +15 −0 |
| `docs/G1-lot-dojo-pr2-1.md` (ce journal) | — | rendu hors du fichier (`DELIVERED.sha256`) | §3, §4, §7, §8 corrigés en place ; §16 ajouté |

### 16.4 R-25

- Script `F:/tmp/dojo/pr2-1-corr/r25-corr.sh` (calque de `r25-g2.sh` du G2, copie d'index propre `F:/tmp/dojo/pr2-1-corr/idx-copy`) : pathspec de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` extraits par `sed`, `git add -N` des non suivis dans la copie d'index seule, `git diff --shortstat 9cca56b` sur le clone : `8 files changed, 913 insertions(+)` ⇒ **913** (`dojo-core.d.mts` 6, `dojo-core.mjs` 79, `bundle.ts` 209, `reading.ts` 238, test 335, fixtures 12 + 16 + 18). Index réel du clone intact (`git status` inchangé).
- 913 / 445 = ×2,05 ; cible ≤ 934,5 tenue (marge 21,5) ; STOP 1 150 à 237. Attendu de la mission ≈ 900 : +13, dû à C-G2-6 et au test du pgcd des lecteurs.

### 16.5 Tests et mutants

- Test du lot (clone) : `node --test apps/dojo/test/dojo-collect-pure.test.ts` ⇒ `tests 12, pass 12, fail 0` ; `npx tsc --noEmit` 0 ; `npx eslint` des trois fichiers 0 ; `lang-gate` OK.
- Harnais `F:/tmp/dojo/pr2-1-corr/corr-mutants.mjs` (calque de `g2-mutants.mjs` et de `mutants.mjs` du G1 ; copies sous `F:/tmp/dojo/pr2-1-corr/mut/<id>/`, TAP gardé, tué seulement si le test **visé** est « not ok ») ; résultats `mut/RESULTS.txt`. Témoin : exit 0, 12 ok. Sources du clone inchangées au sha256 après la passe.
- **69/69 tués par leur test visé** :
  - liste fermée du §4 PR-2-1 dans les écritures du G1 (M-Q1, M-Q2, M-Q4, M-Q5, M-Q7, M-Q8, M-Q9a, M-Q9b, M-Q10, M-Q12, M-Q13, M-Q14a, M-Q14b, M-Q15a, M-Q15b, M-Q16, M-Q20, M-Q22, M-B1, M-B2a, M-B2b : 21) et du G2 (M-Q5, M-Q14a, M-Q14b, M-B2b : 4), plus M-Q22b et M-Q22c ;
  - **M-Q23** a à f (écrit `fault` ; fautes comptées ; lecteur sans lien `cause`/`read_at` ; lecteur sans lien fautes/`read_at` ; `missed` admis dans une lecture faite ; `fault` admis dans une lecture non faite) ;
  - sondes du G2 réécrites sur le code corrigé, G-01 à G-30 (31, variantes comprises), dont les **13 survivantes** (G-07, G-08b, G-08c, G-09, G-14, G-15, G-16, G-17, G-18, G-19, G-21, G-27, G-28), chacune visée sur le test qui porte désormais son assertion ; G-15 réécrite (« toute chaîne admise comme `cause` »), sa chaîne d'origine n'existant plus ;
  - sonde nouvelle G-31 (lecteurs sans pgcd) ; sondes du G1 P-1 à P-4.
- L'écriture `sets.slice(1).every` de M-Q22 (G2, mutant équivalent : le candidat vient de `sets[0]`) n'est pas rejouée.

### 16.6 Oracle (sept gates, test 42)

- Scripts : `corr-locked.sh` (= `g2-locked.sh` au propriétaire près, `diff` : deux lignes) ; `corr-run-oracle.sh` (= `g2-run-oracle.sh` au dossier temporaire près, `diff` : une ligne) ; huit variables payantes retirées ; Node v24.15.0 ; arbre : le clone, les huit fichiers du lot égaux (`cmp`) au worktree.
- **Sept gates** (verrou 06:46:40Z → 06:53:20Z, pris sans attente) : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check` : **7/7 exit 0**. `test` : 1 387 tests, **1 385 pass, 0 fail**, 0 annulé, 2 skipped ; les 12 tests du lot ✔ (relevés par nom) ; `lint:ratchet` 69/69 ; `lang:gate` OK. sha256 : `gate-vocab` `f1b1a916…be2b`, `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`, `lint-ratchet` `45ede4ce…6b42`, `lang-gate` `b22ac8f8…0dd7`, `export-check` `2f9645a9…f16` (les six égaux à ceux du G1 et du G2) ; `test.log` `bd380723010e7d81c47be68d384c6cc26543d7c3858b409b40283d703f373aa1` (durées différentes).
- **Test 42 à part, après la suite** : verrou repris 06:53:47Z → 06:57:14Z ; `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` sur le même clone (`t42.sh`) ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 206 s (`test42.log` `d91a5c89aed527c2c57bb101db5119e5b38360ad869b27a40776bb02d43e5827`). Il était aussi vert dans la suite (344 s). Aucun test neuf sous un dossier exporté (`apps/dojo/**` non exporté, §10) : pas d'export local.

### 16.7 Déclarations (C-G2-8) et limites

- Sans `check`, `readDayBundle` accepte un jour abstenu à balise non nulle portant `beacon_unavailable`, et un `mint_check` quelconque quand la balise est nulle : formes que l'écrivain ne produit pas ; avec `check`, la recomputation par `composed` les refuse (`bundle_records_mismatch`). Le lecteur ne recalcule pas les instants (il n'a pas `read_rule`) : charge du vérificateur (PR-1b-3).
- Lecture non faite : `readRecord` lie `cause` et fautes à `read_at` ; il n'exige pas que `enumerations` soit vide, ni que `mint`, `pool`, `pyth`, emplacements et prix soient nuls (formes que l'écrivain ne produit pas : `readingRecord` refuse une lecture non faite portant une réponse, `bundle_input_malformed`, asserté). Question Q-C1.
- Aucun code de refus nouveau : `DOJO_READING_REFUSALS` (26) et `DOJO_BUNDLE_REFUSALS` (5) inchangés, disjoints des 45 de `dojo-verify` (asserté).

### 16.8 Points ouverts et questions formées

- **Q-1 à Q-6** : tranchées par l'orchestrateur, lignes datées dans l'ADR de lot (§16.2).
- **Item formé (orchestrateur, prochain pli de la mère)** : Q-3 (calque de `readMintToken2022`, mère §6 T-7 et l.194) et Q-1 (mère §6 T-7, « `quorum2` importé ») ; la mère n'est pas touchée par ce pli.
- **Q-C1 (orchestrateur)** : `readRecord` doit-il exiger, pour `read_at` null, `enumerations` vide, `mint`, `pool`, `pyth` nuls, emplacements et prix nuls (≈ +2 lignes de code, +1 assertion, +1 sonde ; R-25 ≈ 916) ? Recommandation : oui, au G1 de PR-2-2 (premier producteur réel de lectures non faites), ou maintenant si l'orchestrateur le préfère.
- **Q-C3 (orchestrateur, ADR de lot §5)** : estimation ascendante de PR-2-1 (445) : le G2 chiffrait C-G2-5 et M-Q23 à « +11 environ » ; aucune ligne datée écrite au §5 par ce pli (mesure : 913, sous la cible de 934,5) ; à l'orchestrateur.
- **Q-C2 (orchestrateur, C-G2-8)** : PR-3a et PR-2b appellent-ils toujours `readDayBundle` avec `check` ? Recommandation : oui, écrit dans leurs G0 (le lecteur sans `check` ne contrôle que la forme).

### 16.9 Consultation advisor (outil intégré, avis jamais verdict)

- Après l'orientation, avant l'écriture : liste des retouches ; pgcd des lecteurs à tester par une entrée propre et une sonde (G-31) ; codes exacts dans C-G2-2 (le prototype n'exigeait qu'un refus quelconque) ; mint passé explicitement à la lecture 2 pour G-21 ; emplacements Pyth extrêmes à octets identiques pour G-19 ; G-15 à réécrire ; lignes de l'ADR ajoutées de bas en haut, sha256 relu avant ; « D-1 l.115 » = l.114 ; M-Q23 nommé au §4 ; aucune hausse de cible R-25 de ma main. Chaque point vérifié sur pièce ; tous suivis.

### 16.10 Provenance et livraison

- **Scripts** (hors dépôt, `F:/tmp/dojo/pr2-1-corr/`) : `corr-code.cjs`, `corr-test.cjs`, `corr-adr.cjs`, `corr-journal-fix.cjs` (remplacements exacts, nombre d'occurrences contrôlé), `sync.sh`, `r25-corr.sh`, `corr-mutants.mjs`, `corr-locked.sh`, `corr-run-oracle.sh`, `t42.sh` ; sonde ad hoc `probe/missed-day.ts` (paquet avec une lecture non faite, relu avec `check` : `counted`, fautes 0, `missed`, persistant vide ; non livrée comme preuve).
- **git** : lecture seule dans le worktree ; un `git clone --no-local` hors dépôt ; `GIT_INDEX_FILE` vers une copie d'index du clone seulement (R-25) ; aucun `add/commit/stash/checkout/branch`. Jonctions `node_modules` du clone laissées en place (retrait par `rm-nm.ps1 -Tree` seulement).
- **Livrés** : `F:/tmp/dojo/pr2-1-corr-deliver/` (les huit fichiers du lot, l'ADR de lot, ce journal, scripts, `RESULTS.txt`, `r25.log`, `exits.txt`), `DELIVERED.sha256`.
- **`git status --short` final (worktree)** : HEAD `9cca56b` ; les six lignes du lot (` M apps/dojo/scripts/dojo-core.d.mts`, ` M apps/dojo/scripts/dojo-core.mjs`, `?? apps/dojo/src/`, `?? apps/dojo/test/dojo-collect-pure.test.ts`, `?? apps/dojo/test/fixtures/`, `?? docs/G1-lot-dojo-pr2-1.md`), ` M docs/adr/ADR-DOJO-PR-2.md` (ce pli), et les trois fichiers d'une autre piste, non touchés (` M docs/adr/ADR-DOJO-SNAPSHOT-1.md`, ` M docs/dojo/FAITS-probe-12-2026-09-27.md`, `?? docs/PLAN-DOJO-PAGE-1.md`) ; relu à 06:57:33Z.
- **Pli G7 PR-2-1 (2026-09-27, C-V-4 du checkpoint-2)** : les trois fichiers d'une autre piste sont **hors gel**. `docs/adr/ADR-DOJO-SNAPSHOT-1.md` et `docs/dojo/FAITS-probe-12-2026-09-27.md` sont suivis et présents dans `02884eb` à leur état committé ; au gel et pendant le checkpoint-2, leurs modifications de worktree (` M`) n'étaient pas committées et n'appartiennent pas au gel ; le commit `b876747` de l'orchestrateur (07:33Z, après le gel, parent `02884eb`) les a versées avec le plan de page, sans toucher aux dix fichiers du gel. `docs/PLAN-DOJO-PAGE-1.md` était non suivi (`??`) ; il est absent de `02884eb` (`git ls-tree` du gel ; le clone `--no-local` du checkpoint-2 ne le porte pas). Ils évoluent par la piste page (onzième pli de la mère, plan de page) pendant les passes de PR-2-1 ; `ADR-DOJO-SNAPSHOT-1.md` et `PLAN-DOJO-PAGE-1.md` ont changé entre 07:05:15Z et 07:21:13Z pendant le checkpoint-2 (rapport §5), hors du fait du validateur ; les dix fichiers du gel et le FAITS probe-12 sont restés identiques.
- **`error_origin` proposés** (au G7) : C-G2-1 à C-G2-4, C-G2-6 et C-G2-7 = générateur du G1 ; C-G2-5 = planificateur du G0 (D-7 muet sur la lecture non faite) ; « D-1 l.115 » de la mission = numéro de ligne décalé d'une unité (sans effet).
- **Pli G7 PR-2-1 (2026-09-27) : `error_origin` assigné au G7** (verdict de l'orchestrateur ; table complète dans l'ADR de lot, section « Acceptation G7 de PR-2-1 ») : §4 point 10 (porte de langue, 15 « LE ») = générateur du G1 ; C-G2-1 à C-G2-4, C-G2-6 et C-G2-7 = générateur du G1 ; C-G2-5 = planificateur du G0 ; C-G2-8 = aucune erreur (déclaration) ; « D-1 l.115 » = orchestrateur (mission de correction), sans effet ; C-V-1 et C-V-4 du checkpoint-2 = aucune erreur ; C-V-2 = orchestrateur ; C-V-3 = correcteur de PR-2-1. PR-2-1 accepté au gel `02884eb` ; la pièce reste `upcoming`.
