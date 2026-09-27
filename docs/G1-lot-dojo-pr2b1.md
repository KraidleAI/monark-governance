claude-opus-5-5[1m]

# G1 — PR-2b-1 MONARK Dōjō : historique rétroactif, lecture pure (`apps/dojo/src/history-read.ts` : fusion des index, clé de lecture, admission, chaînage, offre par transaction, contrôles (iv) à (vii) ; fixtures réduites de la sonde)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort high (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-pr2b1.md` (20 l., sha256 `2c1f76aa43d9892dc4be3ec0be185676e81f1948780703e133c254fbaa8388f7`), horodatage de mission 2026-09-27T07:40Z (texte calculé par le script de l'orchestrateur, lu comme tel).
- **Base / HEAD** : worktree `F:/Monark-wt-dojo-d`, branche `lot/dojo-historique`, HEAD `02884eb2f9f84bbbee567dc3c0b7692f6c2327ae` (gel 1 de PR-2-1) ; `git status --short` **vide** à l'ouverture (07:34:25Z).
- **Processus `node` au lancement (règle C-V-4, DOJO-G1-CONCURRENCY-1)** : **22** `node.exe` à 07:39:41Z (`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`, avant toute commande `node` de ce G1 ; heure lue à l'horloge UTC de PowerShell dans la même commande, non à `date -u` : écart déclaré) ; **26** au lancement de la suite complète (07:54:20Z, `out-1/node-count.txt`) ; **25** au lancement du test 42. Une seule suite complète à la fois : verrou d'hôte `F:/tmp/oracle-lock` (absent à 07:54:16Z, pris à 07:54:20Z).

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 07:34:25Z | orientation : mission, HEAD, arbre propre ; ADR de lot lu en entier (D-1 à D-14, §3, §4, §8, §9, pli cp-1) ; mère (D-10, D-18, dixième pli ; onzième pli lu sur `b876747` du tronc : absent de cette branche) ; PLAN-DOJO-PAGE-1 (C-V-4, DOJO-PR2B1-ADVANCE-1, coupe) ; code gelé ; réponses brutes de la sonde (`sha256sum -c SHA256SUMS` : 49 OK) |
| 07:39:41Z | processus `node` relevés : 22 |
| → 07:4xZ | sonde `lang-gate` sur les réponses brutes (§4 point 2) ; advisor intégré, avant toute écriture (§14) |
| 07:4xZ → 07:53:28Z (heures intermédiaires non relevées) | `mk-nm.ps1` sur le worktree (`entries: 220  monark: 10  fail: 0`) ; module ; réducteur et fixtures ; test ; `tsc` 0, test 6/6, `eslint` 0, `lang-gate` 0 ; R-25 = 673 (worktree) ; mutants 14/14 (deux passes à cette heure ; troisième après le point 12 du §4, ligne suivante ; §8) |
| 07:53:28Z → 07:54:16Z | clone `--no-local` `pr2b1-clone` (HEAD `02884eb`), fichiers du lot copiés (`cmp` égal), `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; R-25 sur le clone = 673 |
| 07:54:20Z → 08:01:50Z | verrou pris (« G1 PR-2b-1 ») ; sept gates, passage 1 (`out-1`) : 7/7 exit 0 (1 391 pass, 0 fail) ; verrou rendu ; puis §4 point 12, test, `tsc`, `eslint`, `lang-gate`, mutants (3e passe) rejoués, R-25 = 677, fichiers recopiés (`cmp` égal) ; passage 2 (`out-2`, 08:02:08Z → 08:10:01Z) : 7/7 exit 0 |
| 08:10:01Z → 08:13:47Z | verrou ; test 42 seul : 2/2 |
| 08:1xZ | journal complété ; livraison `F:/tmp/dojo/pr2b1-deliver/` ; advisor intégré avant la remise |

## 1. Sources (niveau) et entrées

- **[lu]** ADR de lot `docs/adr/ADR-DOJO-PR-2B.md` (sha256 `20e4d5d58dcfc821940bf93244ab63369286f85b9e6c346bca998a49f3c565fd`, 904 l.), en entier. Chaque constante du code cite sa ligne (forme `D-8 l.370`).
- **[lu]** mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (sha256 `fc93f66c6da322c6016d6c2e0643a635543520e18026081372deb89149d35078`, 1 103 l., dixième pli) : D-10 (l.256-263, liste des 45 codes l.260), D-18 (l.309-322). Le **onzième pli** que nomme la mission n'est pas sur cette branche (`git log` : dernier pli = dixième, `9cca56b`) ; il est lu sur le tronc (`git show b876747:docs/adr/ADR-DOJO-SNAPSHOT-1.md`, C-V-6, sans effet sur PR-2b-1) et `PLAN-DOJO-PAGE-1` (même commit) pour C-V-4, DOJO-PR2B1-ADVANCE-1 et la coupe de repli.
- **[lu]** code gelé, sha256 inchangés (`git diff --stat HEAD` vide) : `dojo-core.mjs` `34075c6f…32f5`, `reading.ts` `120e5112…9213`, `bundle.ts` `e8b1fb38…3fda` (forme de `DojoBundleError`, calquée), `apps/bell/scripts/bell-chain.mjs` `521270a3…6ce7` (`canonical`, importé).
- **[lu]** FAITS : `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` (`ce85cc2e…eb`) L-10 (formes `jsonParsed` de `mintTo`, `burn`, `mintToChecked`, `burnChecked` : Q-7 de l'ADR, levée) ; `docs/dojo/FAITS-cp1d-lectures-2026-09-26.md` (`598a43e5…856a`) L-3 (atomicité : FAITS-SOLANA-ATOMICITY-1).
- **[lu]** réponses brutes `F:/PRODUITS/dojo-mirror/probe-3/2026-09-26T0145Z/` (chemin de l'ADR §1.2 l.70) : `SHA256SUMS` sha256 `e8ff845f…e28f` égal à l'épingle de l'ADR (§12 l.816), `sha256sum -c` 49 OK ; le réducteur recontrôle chaque source.
- **[lu]** `probe-3.mjs:179-189` (résolution des comptes, calquée), `scripts/lang-gate.mjs` (§4 point 2), `.github/workflows/ci.yml:82`/`:90`, harnais et scripts du G1 de PR-2-1 (calques).

## 2. Interfaces exportées (`apps/dojo/src/history-read.ts`, modules intégrés et `bell-chain.mjs` seuls)

```ts
export const DOJO_HISTORY_STOPS: readonly ["creation_mismatch", "chain_break", "supply_mismatch", "no_quorum_unbounded", "instruction_not_allowed",
  "day_not_monotone", "bound_exceeded", "index_inconsistent", "owner_unknown", "read_malformed"];      // 7 de D-11 l.425 + 3 proposés (Q-1)
export class DojoHistoryStop extends Error { readonly code: HistoryStop; readonly detail: string }
export const DOJO_HISTORY_CREATION: { signature; slot: 445903343; blockTime: 1789049406; decimals: 6; supply: "1000000000000000" }; // §1.2 l.74, D-8 l.368
export const DOJO_HISTORY_INSTRUCTIONS: readonly [15 types];                                         // D-8 (vi) l.370
export const dayOf: (blockTime: number) => string;                                                   // AAAA-MM-JJ, D-3 l.229
export interface IndexEntry { signature; slot; blockTime: number | null; failed: boolean; finalized: boolean }
export function readIndex(pages: unknown): IndexEntry[];                                             // transactionIndex non lu (D-4 l.307)
export interface Merged { read: string[]; failed: string[]; contested: string[] }                   // R, F, X (D-4 l.296-309)
export function mergeIndexes(a: unknown, b: unknown, sCut: number): Merged;
export interface MintEntry { account; side: "pre" | "post"; owner: string | null; amount; program: string | null }
export interface Body { signature; slot; blockTime: number | null; rank: number | null; err: unknown; mint: MintEntry[]; ins: Ins[]; supply: Supply[] }
export function readBody(raw: unknown, mint: string): Body;                                          // getTransaction ou corps gTFA `full`
export function readKey(b: Body, withRank: boolean): string;                                         // sha256(canonical(clé)), D-5 l.313-322
export const FAULT: unique symbol;                                                                   // faute d'opérateur, distincte d'un `null`
export type Admission = { kind: "admitted"; tx: Body } | { kind: "failed"; moves: boolean } | NoQuorum;
export interface NoQuorum { kind: "no_quorum"; signature; slots: number[]; blockTimes: number[]; touched: { account; owner: string | null }[] }
export function admit(signature: string, a: unknown, b: unknown, mint: string): Admission;         // D-5 l.326, D-6 l.331-338
export function checkSupply(tx: Body): void;                                                         // (i), partie transaction
export function checkCreation(indexA: unknown, indexB: unknown, sig0: Body | null, mint: string): void; // (iv)
export function checkDays(items: readonly { slot: number; blockTime: number | null }[]): void;       // (v)
export function checkInstructions(tx: Body): void;                                                   // (vi)
export function checkBounds(c: HistoryCounts, b: HistoryBounds): void;                               // (vii), bornes en entrée (Q-2)
export function chainAccounts(txs: readonly Body[], noQuorum: readonly NoQuorum[]): Map<string, AccountState>; // (iii)
```

Aucune horloge, aucune E/S, aucune valeur par défaut ; aucun opérateur nommé (côtés `a` et `b`) ; tout arrêt lève `DojoHistoryStop` (motif et détail, jamais une valeur secrète).

## 3. Fichiers (créés, ou modifiés après G2 ; aucun autre)

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/dojo/src/history-read.ts` | créé ; corrigé après G2 (§16) | 278 | `f9f1463ec404c9a7aa996b8a0966f79199b5b65844fcb4d07e6aa589c8651875` |
| `apps/dojo/test/dojo-history-read.test.ts` | créé ; corrigé après G2 (§16) | 234 | `1ca4876ff4f8ced54b84c5da84b919dc3bae9068907b5de02dfd23fb452ef98c` |
| `apps/dojo/test/fixtures/history/reduce-probe3.mjs` | créé (réducteur, ADR l.630) ; corrigé après G2 (§16) | 74 | `77f0422ad9d8988587b6906dc8762e89958e6f47b3dc4e74ba7822cb5ff1b87f` |
| `apps/dojo/test/fixtures/history/sources.json` | créé (sources, sha256, règles, clés ; écrit par le réducteur) ; réécrit après G2 (§16) | 144 | `db73caf13fbbe36c1ad586213fa28219daa1753b5c31379a80452a6a11b350e4` |
| `sig0.a.json`, `sig0.b.json` | créés (noms corrigés après G2) | 1 + 1 | `bfb6ef49…a44` (les deux : octets égaux après réduction canonique, R-b) |
| `sig0.a-page.json` | créé (nom corrigé après G2) | 1 | `e7479f891bf773ec953d9500e5a4cdbde94e8ca4d7250cd81b6fdf32e2a6df2d` |
| `c1.a.json`, `c1.b.json` | créés (noms corrigés après G2) | 1 + 1 | `f69331bb…5ec7` (les deux) |
| `c2.a.json`, `c2.b.json` | créés (noms corrigés après G2) | 1 + 1 | `aa1bf326…a752` (les deux) |
| `mint-tail.a.json`, `mint-tail.b.json` | créés (noms corrigés après G2) | 1 + 1 | `b19870a7…83fd` (les deux) |
| `mint-before-sig0.b.json` | créé (nom corrigé après G2) | 1 | `86fbc04fa6a422d962576ed0d621f43e9e330d462337fd2f334633de2c7042f8` |
| `mint-head.a.json` ; `mint-head.b.json` | créés (noms corrigés après G2) | 1 + 1 | `7c5e542c…dcf` ; `1c0c4b23…4786` |
| `acct-6tW6.a.json` ; `acct-6tW6.b.json` | créés (noms corrigés après G2) | 1 + 1 | `672f9ad7…69bf` ; `f7ac819b…5da82` |
| `acct-MeQM.a.json` ; `acct-MeQM.b.json` | créés (noms corrigés après G2) | 1 + 1 | `5d8e4fcd…7e` ; `b9292010…ec84` |
| `probe3-expect.json` | créé | 1 | `18a0cd531d8333115f639f89faa0a83059d58bcc4bbba9b493d7df47258a33b4` |
| `docs/adr/ADR-DOJO-PR-2B.md` | modifié après G2 : lignes datées, ajout seul (17 lignes, §16 ; hors compte R-25, `ci.yml:82`) | 921 | `0acac987abd56d9b740594028472e887e07a62e31e60907c8c6d61d02ef752ea` |
| `docs/G1-lot-dojo-pr2b1.md` | créé (ce journal ; hors compte R-25, `ci.yml:82`) | — | rendu hors du fichier |

Gelés, `git diff --stat HEAD` vide : `apps/bell/**`, `dojo-core.*`, `reading.ts`, `bundle.ts`, `dojo-chain.mjs`, `dojo-verify.mjs`, `package*.json`, `tsconfig.json` (qui inclut déjà `apps/dojo/src/**/*.ts`), `docs/adr` (état du G1 ; après G2, `docs/adr/ADR-DOJO-PR-2B.md` reçoit les lignes datées du §16, ajout seul), `scripts/lang-exempt.json`. Aucune dépendance nouvelle. `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore:1`), à retirer par `rm-nm.ps1` si l'orchestrateur le veut.

## 4. Choix de forme déclarés (jamais silencieux)

1. **Noms d'arrêt** : les sept motifs de D-11 l.425 que PR-2b-1 lève gardent leur nom ; trois cas que D-5/D-6 arrêtent sans les nommer reçoivent un nom **proposé** : `index_inconsistent` (deux `null` pour une signature listée, D-6 l.338 ; signature listée deux fois par un même index), `owner_unknown` (propriétaire introuvable, D-5 l.329), `read_malformed` (forme d'une page, d'une entrée, d'un corps ou des bornes). Lecture de « refus nommés dans les 45 codes » (mission) : les 45 sont les codes du vérificateur (mère D-10 l.260) ; aucun ne nomme un arrêt du collecteur ; la liste de ce module leur est **disjointe**, assertée par le test (précédent PR-2-1, `DOJO_READING_REFUSALS`), et aucun code n'est ajouté à D-10. Question Q-1.
2. **Fixtures en hexadécimal** : chaque fixture est **une** ligne JSON, la chaîne hexadécimale de `canonical(valeur réduite)`. Motif mesuré : `scripts/lang-gate.mjs` (global, suite de la CI) lit des mots de sa liste française dans les suites de lettres des chaînes base58 (sonde `scanText` sur les réponses brutes : 1 coup sur 100 entrées de A2-p024, 1 sur B1, 7 sur le corps C2, soit trois sources touchées et neuf coups ; le commentaire du réducteur du G1 disait « three hits », retiré à la correction, C-G2-6) ; `scripts/lang-exempt.json` est une liste fermée gardée par le test 42 (non touchée) ; l'hexadécimal n'a que les lettres a à f, qui ne forment aucun mot de la liste. `sources.json` porte, par fixture : source, règle, sha256 du texte **décodé**, et pour chaque corps la clé de lecture calculée sur la réponse **brute** ; le test recalcule le sha256 et la clé sur la fixture et exige l'égalité (réduction sans perte pour les champs lus : contre-mesure FM-2.4 de l'ADR §6) ; c'est aussi cette égalité, sur des réponses brutes aux octets différents, qui établit R-b (les paires réduites sont, elles, identiques). Question Q-3.
3. **Nom `sources.json`** (ADR §4 l.630) ; la mission dit `provenance.json` : même fichier (source, sha256, règle de réduction), le nom de l'ADR fait foi. Question Q-4.
4. **Trois états par côté** pour l'admission : corps brut, `null` (résultat nul) ou `FAULT` (faute d'opérateur) ; la table du D-6 distingue « deux `null` » (incohérence d'index) de « deux fautes » (comptes inconnus), ce que la convention `Pair` de `reading.ts` (`null` = faute) ne permet pas. Un corps qui ne se décode pas, ou qui nomme une autre signature, compte comme une faute.
5. **Instruction « portant sur MINT ou l'un de ses comptes »** (D-5 l.321, D-8 l.370) : instruction du programme Token-2022, filtrée par `programId` seul (le programme classique porte aussi `program: "spl-token"`, relevé sur C1 et C2), dont une valeur de premier niveau de `info` égale le mint ou un compte du mint de ce corps (entrées pre/post). Une instruction Token-2022 **non analysée** compte si sa liste `accounts` nomme le mint ou l'un de ses comptes, ou si cette liste manque (fail-closed) ; elle reçoit le type `unparsed`, hors liste fermée, donc arrêt (vi). Question Q-5.
6. **Réduction d'un corps** (ADR l.630) : champs gardés, et en plus `meta.loadedAddresses` s'il existe (aucun des corps de la sonde) ; les instructions externes hors Token-2022 ne gardent que leur `programId`, pour garder les positions qui rattachent les groupes internes (`innerInstructions[].index`) ; les instructions internes hors Token-2022 sont retirées (l'ordre relatif reste).
7. **Clé** : `{signature, slot, blockTime, err, mint, supply, types}` et `rank` seulement si les deux corps le portent ; entrées du mint triées par (côté, compte) en ordre des chaînes ; `supply` dans l'ordre des positions (externe i, puis ses internes) ; montant de `mintTo`/`burn` dans `info.amount`, de `mintToChecked`/`burnChecked` dans `info.tokenAmount.amount` (FAITS L-10).
8. **(vi) sur les transactions admises**, (i) aussi ; un corps sans quorum n'est contrôlé que pour l'offre (arrêt D-6 l.335-336). Question Q-6.
9. **Chaînage** : ordre (emplacement, rang) ; un emplacement est non ordonné si une transaction admise de cet emplacement n'a pas de rang (ensemble global, D-3 l.269) ; il exige alors un chemin d'Euler sur le multigraphe des (montant, propriétaire) pre → post partant du solde connu, le propriétaire étant ignoré à 0. Une fenêtre sans quorum libère le pre suivant quand un `NoQuorum` touchant le compte a un emplacement entre l'emplacement de la transaction admise précédente et celui de la suivante, bornes comprises. Après une telle fenêtre, un emplacement non ordonné dont les mouvements forment un circuit a une fin ambiguë : arrêt `chain_break` (fail-closed). Propriétaire absent : celui de l'`initializeAccount*` du compte dans la transaction (côté post), sinon le dernier propriétaire connu, sinon `owner_unknown`. Question Q-7.
10. **Bornes (vii)** : entrée explicite, sans défaut ; la justification due à ce G1 (ADR D-8 l.371 ; mère, sixième pli (b)) est une **proposition** (§12, Q-2), jamais une constante du code.
11. **Égalité du corps entier** (D-5 l.328, mesure de l'évidence) : non implémentée ici (évidence : PR-2b-3) ; §11.
12. **Groupe interne orphelin** (ajout après le passage 1 de l'oracle, revue propre) : un groupe `innerInstructions` dont l'`index` ne désigne aucune instruction externe, ou sans liste, arrête (`read_malformed`) au lieu d'être sauté en silence ; assertion ajoutée au test `…allowlist_stops`.

## 5. Fixtures (`apps/dojo/test/fixtures/history/`, comptées R-25 : 17 fichiers d'une ligne, soit 16 fixtures et `probe3-expect.json`, + réducteur 55 + `sources.json` 121 au G1 ; après G2 : 17 + 74 + 144, §16)

- Réducteur committé `reduce-probe3.mjs` (ADR l.630) : `node reduce-probe3.mjs <répertoire de la sonde>` ; contrôle le sha256 de `SHA256SUMS` contre l'épingle de l'ADR, puis celui de chaque source contre `SHA256SUMS` ; écrit les 17 fichiers d'une ligne (16 fixtures et `probe3-expect.json`) et `sources.json`. Rejoué une seconde fois : sorties égales octet pour octet (idempotent).
- Table de l’ADR §4 l.632-642 suivie à la lettre au G1, qui nommait les opérateurs (C-G2-1) ; noms corrigés après G2 (ligne datée de l’ADR sous la table, §16) : `sig0.a.json` et `sig0.b.json` (A5, A3), `sig0.a-page.json` (A1, page `full`, `{data, paginationToken}`), `c1.a.json` et `c1.b.json`, `c2.a.json` et `c2.b.json`, `mint-tail.a.json` (100 plus anciennes de A2-p024, SIG0 en dernier), `mint-before-sig0.b.json` (A6 = `[]`), `mint-tail.b.json` (100 plus anciennes de B1), `mint-head.a.json` (A2-p001, entrées 1 à 100, après L[0]) et `mint-head.b.json` (B3, 100 premières, `before = L[0]`), `acct-6tW6.a.json` et `acct-6tW6.b.json` (D1), `acct-MeQM.a.json` et `acct-MeQM.b.json` (D2), `probe3-expect.json` (`derived.json` R2 : SIG0, `slot`, `blockTime` ; SMID : signature et `blockTime` de C2). Membre a = premier opérateur de `OPS` (D-3 l.231), b = le second.
- Faits relevés sur les fixtures (sans réseau) : SIG0 partage son emplacement 445 903 343 avec quatre signatures (trois réussies, rangs 793, 739, 696 ; une en échec, rang 449) ; SIG0 a le plus petit rang (342), d'où sa place de dernière entrée ; `mint-head.b.json` ne porte pas `transactionIndex` (R-a) ; 10 échecs sur les 100 entrées de `acct-6tW6.a.json`.
- Variantes synthétiques dérivées dans le test et déclarées à leur usage : entrée retirée, `blockTime` décalé, statut `confirmed`, doublon ; propriétaire, montant, rang ou frappe modifiés ; rang retiré d'un côté ; corps signé d'une autre signature ; échec concordant (et à pre = post) ; brûlages `burn`/`burnChecked` et frappe `mintToChecked` ajoutés ; corps synthétiques de chaînage (comptes `A`, `B`, `C`, signatures `SYN(n)`) ; instruction hors liste, non analysée, ou non analysée hors du mint ; `decimals` 9 ; jours et emplacements synthétiques.

## 6. R-25 (méthode `ci.yml:82` / `:90`, clone `--no-local`, base `02884eb`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec de `ci.yml:82` extrait du fichier (20 éléments), `git diff --numstat 02884eb` pour les suivis, `git diff --no-index --numstat /dev/null <f>` pour les non suivis, métrique insertions + suppressions ; aucune écriture git.
- Sur `F:/tmp/dojo/pr2b1-clone` (sortie `F:/tmp/dojo/pr2b1-tmp/r25-clone.txt`) et sur le worktree : `history-read.ts` 274, test 210, réducteur 55, `sources.json` 121, 17 fichiers d'une ligne (16 fixtures et `probe3-expect.json`) : 274 + 210 + 55 + 121 + 17 = **677** lignes CODE (673 au passage 1 de l'oracle, avant le point 12 du §4 ; « 16 fixtures × 1 » au G1, corrigé, C-G2-6). Après G2 : **747** (§16).
- Estimation ascendante (ADR D-14 l.516) : 547 ; dérive mesurée 677 / 547 = **×1,24** ; seuil de la coupe pré-déclarée (> 1 100, mission) non atteint ; STOP 1 150 à 473 lignes. **Coupe (a)/(b) non posée** : tout le périmètre de PR-2b-1 est livré.

## 7. Tests (`apps/dojo/test/dojo-history-read.test.ts`, 6 tests : tous les noms de l'ADR §4 l.557-570)

Oracles recodés dans le test (ensembles et ordres des pages, sommes des soldes, jours par `Date.UTC`) ; jamais le module pour se vérifier lui-même. Les paires réduites des deux opérateurs sont octet pour octet égales (réduction canonique) : l'égalité des clés entre fixtures y est donc triviale ; ce qui établit R-b est l'égalité de la clé de chaque fixture avec la clé enregistrée dans `sources.json` sur la réponse **brute**, dont les octets diffèrent d'un opérateur à l'autre (sha256 des sources distincts). Aucun réseau, aucune horloge.

| Test | Couvre | Mutants visés |
|---|---|---|
| `dojo_history_quorum_on_signatures_and_balances` | liste d'arrêts ⊇ D-11 (sept) et disjointe des 45 codes ; clé égale entre les deux opérateurs pour SIG0, C1, C2 et entre gTFA et `getTransaction` (R-b) ; jeton gTFA `445903343:342` ; C2 atteint le mint par table seulement (R7) ; fusion sur trois paires de pages (ensembles égaux, X = 0, R trié, F = entrées `err`) ; contestation (une seule liste, `blockTime`, statut) lue chez les deux ; S_CUT (SIG0 et ses trois voisines réussies) ; doublon ; admission avec rang, rang d'un seul côté ; clé différente sur copie (propriétaire, montant, rang, frappe) ⇒ sans quorum, union des propriétaires ; un seul corps (faute, `null`, autre signature) jamais admis ; deux `null`, deux fautes, faute + `null` ; frappe sans quorum ⇒ arrêt ; bornes (vii) ; sha256 des fixtures décodées et clés des corps bruts | M-Y1, M-Y8, M-Y9 (a, b) |
| `dojo_history_excludes_failed_before_bodies` | F = les échecs concordants de `acct-6tW6`, jamais dans R ; échec listé par un seul index, ou échec d'un côté et succès de l'autre ⇒ contesté et lu ; échec concordant des corps : exclu, `moves` vrai sur C1, faux à pre = post | M-Y10 (a, b) |
| `dojo_history_supply_moves_match_instructions` | SIG0 : Σ (post − pre) recodé = 10^15 = sa frappe ; C1, C2 ; brûlages `burn` et `burnChecked` synthétiques justes passent, faux arrêtent ; frappe `mintToChecked` après SIG0 arrêtée même si les soldes la suivent | M-Y4 (a, b) |
| `dojo_history_chain_break_stops` | chaîne ordonnée ; trou de solde ; propriétaire changé ; fenêtre sans quorum qui libère ; fermeture puis recréation ; emplacement non ordonné (ordre d'entrée inversé) qui enchaîne, et qui n'enchaîne pas ; propriétaire absent : `initializeAccount3`, puis dernier propriétaire, sinon `owner_unknown` | M-Y13 (a, b) |
| `dojo_history_instruction_allowlist_stops` | les neuf types de SIG0 (R-c, R-d ; l'instruction du programme de lancement n'est pas Token-2022) ; C1, C2 ; filtre par `programId` ; type hors liste ; instruction Token-2022 non analysée sur un compte du mint ; non analysée hors du mint : passe ; groupe interne orphelin ⇒ `read_malformed` | M-Y19 (a, b) |
| `dojo_history_creation_and_day_monotonicity` | (iv) sur les pages `mint-tail` et le corps SIG0 admis ; rien avant SIG0 ; dernière entrée retirée, corps absent, autre mint, `decimals` 9 ⇒ `creation_mismatch` ; jour de SIG0 ; C2 = SMID, à 4 s de 2026-09-14T00:00Z (recodé par `Date.UTC`), jour 2026-09-14, la seconde d'avant 2026-09-13 ; (v) sur pages et corps ; `blockTime` nul, deux `blockTime` dans un emplacement, jour décroissant ⇒ `day_not_monotone` ; `blockTime` qui baisse dans un même jour : passe | M-Y6 (a, b) |

- Commandes (worktree puis clone) : `node --test --test-timeout=120000 apps/dojo/test/dojo-history-read.test.ts` ⇒ `tests 6, pass 6, fail 0` ; `npx tsc --noEmit` exit 0 ; `npx eslint apps/dojo/src/history-read.ts apps/dojo/test/dojo-history-read.test.ts` exit 0 ; `node scripts/lang-gate.mjs` OK (0 coup).

## 8. Mutants (copies hors dépôt, `F:/tmp/dojo/pr2b1-mutants/`)

Harnais `mutants.mjs` (sha256 `74e6c7f2f52a430337493e1301cadbb2ebf7d39197f8168fad5617f8f1c1a330`) : en-tête et liste propres, **exécuteur recopié mot pour mot** de `F:/tmp/dojo/pr2-1-mutants/mutants.mjs` (remplacements exacts à nombre d'occurrences contrôlé, copie des fichiers nécessaires sous `<id>/`, TAP gardé par mutant avec l'en-tête des sha256, tué seulement si le TAP porte `not ok N - <test visé>`, témoin d'abord). Trois passes, même verdict : la première avant que les assertions d'épingle des clés soient placées en fin de test (M-Y9 a et b y étaient tués par l'épingle, trop tôt pour montrer l'assertion visée) ; la deuxième avant le point 12 du §4 (`RESULTS.txt` d'alors, sha256 `c9aa6780cc82378d64d5e37f14d3a1bcba93ad6d95c3246f1d76fbad39c2ce47`) ; la troisième, sur les fichiers livrés, fait foi (`RESULTS.txt`, sha256 `8bf9a11c0d2d7ac2c5b3d951eb306fb73e14e5e008eebf6f472ca4513d1be2e0`) : témoin exit 0, 6 ok, 0 not ok ; `history-read.ts` d'origine inchangé au sha256 (`c9aa808d…a6c`).

| Id | Mutation | Test visé | Verdict (message de l'assertion qui tue) |
|---|---|---|---|
| M-Y1 | une transaction admise sur le corps d'un seul opérateur | `dojo_history_quorum_on_signatures_and_balances` | tué (`kind` attendu `no_quorum`) |
| M-Y4a | écart d'offre d'une transaction toléré | `dojo_history_supply_moves_match_instructions` | tué (arrêt attendu) |
| M-Y4b | frappe après SIG0 tolérée | idem | tué (arrêt attendu) |
| M-Y6a | jour pris sur une horloge autre que `blockTime` UTC (une heure d'avance) | `dojo_history_creation_and_day_monotonicity` | tué (jour de la seconde d'avant minuit) |
| M-Y6b | jour de (v) pris sur l'emplacement | idem | tué (arrêt attendu) |
| M-Y8 | signature d'un seul index écartée sans lecture des corps | `dojo_history_quorum_on_signatures_and_balances` | tué (aussi rouge : `…excludes_failed…`) |
| M-Y9a | clé sans le propriétaire | idem | tué (clé de la copie au propriétaire changé égale) |
| M-Y9b | clé sans le rang quand les deux corps le portent | idem | tué (clé de la copie au rang changé égale) |
| M-Y10a | échec concordant lu | `dojo_history_excludes_failed_before_bodies` | tué (aussi rouge : `…quorum…`) |
| M-Y10b | échec contesté exclu sans lecture | idem | tué (aussi rouge : `…quorum…`) |
| M-Y13a | rupture de chaînage tolérée (emplacement ordonné) | `dojo_history_chain_break_stops` | tué (arrêt attendu) |
| M-Y13b | rupture tolérée (emplacement non ordonné sans ordre qui enchaîne) | idem | tué (arrêt attendu) |
| M-Y19a | type hors liste toléré | `dojo_history_instruction_allowlist_stops` | tué (arrêt attendu) |
| M-Y19b | instruction Token-2022 non analysée sur le mint non relevée | idem | tué (arrêt attendu) |

**Liste fermée de PR-2b-1 (ADR §4 l.557-570) : 8 mutants (14 variantes) tués par leur test visé, 0 survivant.**

## 9. Oracle (sept gates sur clone, sous verrou d'hôte) et test 42

- Scripts : `F:/tmp/dojo/pr2b1-run-oracle.sh` (sha256 `42f066465b07c70d9323314f630ad307684dd1d68b7314d6c08c71f03ccf87b8`) = `pr2-1b-run-oracle.sh` au dossier temporaire près (`diff` : une ligne) : `npm run <gate>` pour `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, codes capturés directement, huit variables payantes retirées (`env -u`), TEMP/TMP sur F: ; lanceur `pr2b1-oracle-pass.sh` (`e99fcbd8…365e` : compte des `node.exe` au lancement, C-V-4, puis le script) ; verrou `pr2b1-locked.sh` (`a5785203…bb5d`) = `pr2-1b-locked.sh` au nom du propriétaire près (« G1 PR-2b-1 ») : `mkdir F:/tmp/oracle-lock` atomique, attente 60 s jusqu'à 90 min, retrait dans le piège EXIT (verrou absent après chaque passage, vérifié). Arbre : `F:/tmp/dojo/pr2b1-clone` (clone `--no-local` de `02884eb`, fichiers du lot copiés par `pr2b1-sync.sh` (`47d55285…6f21`), `cmp` égal au worktree avant chaque passage) ; Node v24.15.0.
- **Passage 1** (`out-1`, 07:54:20Z → 08:01:50Z, fichiers d'avant le §4 point 12 ; 26 `node.exe` au lancement) : **7/7 exit 0** ; `test` 1 393 tests, 1 391 pass, 0 fail, 2 skipped (préexistants) (`test.log` `43cb2373f88e0f8368abfd6fd7b70653f7a9825cc098f444892c14bdcf76c351`). Trace ; ne vaut pas pour les fichiers livrés.
- **Passage 2, fait foi** (`out-2`, 08:02:08Z → 08:10:01Z, fichiers livrés ; 28 `node.exe` au lancement) : **7/7 exit 0**. `test` : 1 393 tests, **1 391 pass, 0 fail**, 0 annulé, 2 skipped (préexistants), les 6 tests `dojo_history_*` ✔ (`test.log` `7fb39f89154585774eb12d466be95f5e0c112c1c70ed41e1ce2f81f2818e097f`) ; `lint:ratchet` **69/69** (`45ede4ce…`) ; `lang:gate` OK, 0 coup (`b22ac8f8…`) ; `typecheck` (`03481a8f…`) ; `lint` (`f845417c…`) ; `gate:vocab` (`f1b1a916…`) ; `export:check` (`2f9645a9…`).
- **Test 42 à part, après la suite** (verrou repris 08:10:01Z → 08:13:47Z ; 25 `node.exe` au lancement ; script `pr2b1-t42.sh`, `f4794657…50fc`) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` sur le même clone ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 226 s (`test42.log` `db0a03d66c0644538907675867d30aa16d81874801ebb7b18c8642b1ec12a609`). Il était aussi vert dans la suite des deux passages (`test.log` l.1772 : ✔ en 385 s au passage 1, 413 s au passage 2).
- `apps/dojo` n'est pas exporté (§10).

## 10. Export-run (CONSIGNE-G1-EXPORT-RUN-1)

- `grep -n dojo scripts/export-public.mjs` : aucune ligne (exit 1) ; `apps/dojo/**` n'est pas exporté vers le miroir public. Aucun fichier neuf sous un dossier exporté : l'export local n'est pas exécuté.

## 11. Ce que je n'ai pas fait, et pourquoi

- Aucun réseau, aucun RPC ; aucune lecture de page web.
- Hors de PR-2b-1 (ADR D-14 l.516) : fenêtres sans quorum et jours manquants, séries, repli D-7, valeurs du jour, offre par jour, contrôle (ii), lignes et paquet (PR-2b-2) ; journal, dépôt brut, cohérence gTFA ↔ index (D-9), sha256 du corps entier (D-5 l.328), assemblage des compteurs de (vii) (PR-2b-3) ; phase C et reprise (PR-2b-4). Les signatures des fonctions (`NoQuorum.slots`/`blockTimes`/`touched`, `Merged`, `HistoryCounts`) sont écrites pour ces consommateurs.
- Aucune modification de `scripts/lang-exempt.json` (liste fermée gardée par le test 42) : §4 point 2.
- Aucun `git add/commit/stash/branch` dans le worktree (R-20) ; `git` en lecture seule dans le worktree (`status`, `rev-parse`, `log`, `diff --stat`, `show <sha>:<chemin>`). Dans le clone jetable hors dépôt : `git clone --no-local`, puis un `git checkout --quiet --detach 02884eb` redondant (le clone était déjà à `02884eb`) — déclaré ici, sans effet sur le dépôt. Rien sur C:.

## 12. Questions formées (choix fail-closed explicites ; aucun « dû » nu ; tranchées par l'orchestrateur, lignes datées au §16)

- **Q-1 (orchestrateur, D-11 l.425)** : trois noms d'arrêt proposés, `index_inconsistent`, `owner_unknown`, `read_malformed` (§4 point 1) ; à confirmer ou renommer par ligne datée de D-11. Lecture de « dans les 45 codes » : liste disjointe du vérificateur, aucun code ajouté à D-10 ; à confirmer.
- **Q-2 (orchestrateur, D-8 (vii) l.371 ; mère sixième pli (b)) — bornes, justification due à ce G1, proposée ici** :
  - corps en échec des pages gTFA avec pre ≠ post : **0** ; source : FAITS-SOLANA-ATOMICITY-1 (FAITS cp1d L-3 : une transaction en échec ne change aucun état, frais exceptés) ; tout écart est une contradiction de la chaîne ;
  - emplacements non ordonnés : **0** ; source : le déclencheur d'escalade de D-7 (compteur Q-1 non nul à l'acte 1 et un détenteur touché ⇒ effet présenté à l'investisseur **avant** toute publication) ; l'arrêt `partial` est la forme fail-closed de « avant publication » ; relevé : 0 sur 2 937 emplacements partagés (R-f) ;
  - transactions sans quorum : **0** proposé ; aucune mesure n'appuie une autre valeur (corps : 9 sur 9 égaux, R-b) ; tout cas arrête et est présenté, la reprise pouvant suivre une ligne datée ;
  - X rapporté à |R| : **3 / 2 000** proposé ; arithmétique sur la sonde : les index des deux opérateurs ont été comparés sur 2 000 entrées (R5 : B1 et B3, 0 différence) ; le plus grand taux p tel qu'observer 0 écart sur n = 2 000 garde une probabilité d'au moins 5 % est 1 − 0,05^(1/2 000) = 0,001497 (≈ 3 / 2 000) ; le seuil de 5 % est une convention, non une source : il reste à l'orchestrateur de le retenir ou d'en fixer un autre ; tout X > 0 est consigné dans le FAITS de l'acte, borne franchie ou non (mère, sixième pli (b)).
  - Ligne datée attendue avant le G1 de PR-2b-3, premier appelant de `checkBounds`.
- **Q-3 (orchestrateur, ADR-M004 D7)** : fixtures en hexadécimal (§4 point 2) ; alternative : une entrée `paths` de `scripts/lang-exempt.json` pour `apps/dojo/test/fixtures/history/*.json` (décision de gouvernance du gate, hors de ce G1).
- **Q-4 (orchestrateur)** : `sources.json` (ADR) tient lieu du `provenance.json` de la mission ; à confirmer.
- **Q-5 (orchestrateur, D-5 l.321, D-8 l.370)** : portée « sur MINT ou l'un de ses comptes » (valeur de premier niveau de `info`) et traitement des instructions Token-2022 non analysées (§4 point 5) ; à confirmer.
- **Q-6 (orchestrateur, D-8 l.370)** : (vi) appliqué aux transactions admises seulement ; un corps sans quorum ne subit que l'arrêt d'offre de D-6.
- **Q-8 (orchestrateur, écart mission ↔ base)** : la mission cite la mère au « onzième pli » ; la branche `lot/dojo-historique` (HEAD `02884eb`) porte le dixième (`9cca56b`) ; le onzième (C-V-6) n'est que sur le tronc (`b876747`), lu là, sans effet sur PR-2b-1. `error_origin` proposé : orchestrateur (texte de mission). À aligner au G7 (fusion) ou par ligne de mission.
- **Q-7 (orchestrateur, D-8 l.367, D-5 l.329)** : règles du chaînage déclarées au §4 point 9 (fenêtre à bornes comprises, fin ambiguë d'un circuit après une fenêtre ⇒ arrêt, ordre du repli de propriétaire) ; à confirmer ou amender par ligne datée.

## 13. Tuyaux (règle Branchement)

- **Entrée** : réponses brutes des deux opérateurs (pages de `getSignaturesForAddress`, corps `getTransaction` et gTFA `full`), produites par le collecteur de PR-2b-3 (TU-12a) ; hors ligne ici, les fixtures réduites de la sonde.
- **Sortie** : `Merged` (R, F, X), `Admission` (`Body` admis, échecs, `NoQuorum`), `AccountState` du chaînage et les arrêts nommés. **Consommateurs** : PR-2b-2 (`history-build.ts` : fenêtres, séries, valeurs du jour, (i) par jour, (ii)) et PR-2b-3 (collecteur : phases A et B, compteurs de (vii)). Aucun n'existe encore.
- **État** : aucun (module pur).
- **Test d'intégration** : aucun dans ce lot ; `dojo_history_collect_to_verify_end_to_end` (PR-2b-4) rejouera la composition. **La pièce reste `upcoming`** : aucun chemin servi ne consomme cette sortie ; tuyau formé avec déclencheur (G1 de PR-2b-2, puis G7 de PR-3a pour le service, TU-12c), jamais un oubli.

## 14. Advisor

- Consulté par l'outil intégré après l'orientation, avant toute écriture : séquence (a) puis mesure R-25 à mi-course ; fixtures hexadécimales décidées avant le réducteur, clés des corps bruts dans `sources.json` et assertées ; noms d'arrêt de D-11, trois proposés, disjonction des 45 ; trois états par côté ; bornes en entrée et justification au journal ; pièges (`programId`, `info.amount` / `tokenAmount.amount`, cliquet `lint:ratchet`, propriétés de paramètre refusées en « strip-only ») ; vérification sous verrou. Chaque point appliqué après vérification sur pièce ; conseil, jamais verdict.
- Seconde consultation avant la remise : après l'écriture de ce journal et la livraison ; son avis et ce qui en a été retenu sont rendus hors du fichier (réponse structurée à l'orchestrateur).

## 15. `git status --short` final (worktree, après les corrections du G2)

```
 M docs/adr/ADR-DOJO-PR-2B.md
?? apps/dojo/src/history-read.ts
?? apps/dojo/test/dojo-history-read.test.ts
?? apps/dojo/test/fixtures/history/
?? docs/G1-lot-dojo-pr2b1.md
```

## 16. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Correcteur worker, contexte frais, distinct du relecteur G2. **Mission** : `F:/tmp/dojo/mission-corr-pr2b1.md` (16 l., sha256 `50853d4cecd28e70e8374ac7adb5ada8dbb6c4539398afc5767cebeb31147ef0`), horodatage 2026-09-27T08:40Z, texte calculé par le script de l'orchestrateur, lu comme tel ; `date -u` à l'ouverture : 08:39:49Z. **Entrée** : rapport G2 `F:/tmp/dojo/g2-pr2b1/G2-report.md` (sha256 `e42da218a081e8ceb62927d50ca874ee97fb1348828c9f26a257a9a78c1a58a8`, recalculé, lu en entier), verdict CORRECTIONS D'ABORD.
- **État d'ouverture** (08:41:40Z) : HEAD `02884eb`, les quatre lignes `??` du G1 ; worktree égal à `F:/tmp/dojo/pr2b1-deliver/DELIVERED.sha256` (22/22) ; copie de l'état du G1 hors dépôt `F:/tmp/dojo/pr2b1-corr/before/` (`before.sha256`, 23 lignes).
- **Processus `node` (C-V-4)** : 25 à 08:41:40Z (ouverture, verrou d'hôte absent) ; **22 au lancement de la suite complète** (08:52:28Z, `oracle/out-1/node-count.txt` ; verrou tenu par « corr PR-1b-3 » depuis 08:45:17Z à mon arrivée, pris à 08:52:27Z après 120 s d’attente) ; **22 au lancement du test 42** (08:59:06Z). Une seule suite complète à la fois.
- **Point de départ déclaré** : les fichiers du prototype du G2 (`F:/tmp/dojo/g2-pr2b1/fix/`, diff `fix.diff` sha256 `71100333…`, relu hunk par hunk) pour le module, le test et le réducteur, puis mes éditions (script `F:/tmp/dojo/pr2b1-corr/corr-patch.mjs` et `corr-patch-r.mjs`, remplacements exacts à compte contrôlé ; `corr-patch.mjs` s’est arrêté sur sa partie réducteur, faute d’échappement, sans rien écrire au réducteur, partie refaite par `corr-patch-r.mjs`, par lignes à ancres contrôlées). Les fixtures sont régénérées par le réducteur corrigé depuis la sonde (lecture seule), jamais copiées.

### 16.1 Corrections

| Id | Décision de l'orchestrateur | Fait | Preuve |
|---|---|---|---|
| C-G2-1 | membres a / b ; sources résolues par sha256 et identifiant d'appel ; suffixe d'opérateur hors dépôt ; `sources.json` = {call, member, source_sha256, rule, sha256, key} ; test renommé ; « gTFA » ⇒ « full-page » ; sha commun déclaré ; ligne datée de l'ADR §4 | 16 fixtures renommées (`sig0.{a,b}.json`, `sig0.a-page.json`, `c1.{a,b}`, `c2.{a,b}`, `mint-tail.{a,b}`, `mint-before-sig0.b`, `mint-head.{a,b}`, `acct-6tW6.{a,b}`, `acct-MeQM.{a,b}`) et `probe3-expect.json` ; réducteur : chaque source retrouvée par (identifiant d'appel, sha256) dans `SHA256SUMS`, toutes les correspondances contrôlées ; `sources.json` sans nom de fichier de la sonde, `members` et `shared_sha256` ; test : `SIG0A`/`SIG0B`, `page`, ensemble des fichiers = clés de `sources.json`, nom portant exactement son membre (`.a.json`, `.a-page.json`, `.b.json`) ; commentaire du module « full-page » ; correspondance fixture ↔ fichier de la sonde hors dépôt : `F:/tmp/dojo/pr2b1-evidence/members-pr2b1.tsv` (sha256 `d4ddf57648c9507946f08bc0b62938f3c2f322a2ff263800023012b5c45719e9`) | 17/17 fichiers égaux octet pour octet aux fixtures du G1, sha256 et clés de `sources.json` égaux (`check-rename.mjs`) ; 17/17 égaux aussi aux fixtures du prototype du G2 ; réducteur rejoué deux fois : 18/18 fichiers égaux (idempotent) ; troisième passage avec le `/` final de l’argument, comme au G1 : seule `probe_dir` de `sources.json` change ; recherche insensible à la casse de `helius`, `chainstack`, `solana-foundation`, `gtfa` dans le module, le test, le réducteur, `sources.json` et le texte décodé des 17 fixtures : 0 |
| C-G2-1, sha commun | déclaration du sha commun C1 | **mesuré plus large que le rapport** : sous l'appel C1 **et** sous l'appel C2, membre b, deux fichiers de la sonde portent le même sha256 (`c97b29b2…4c10`, `3617b24d…fe29`, octets identiques, dont l'un du troisième opérateur) ; A3/A4, A6/A7 et B1/B2 partagent aussi un sha256 mais sous des identifiants d'appel différents, que la résolution par appel sépare (la résolution par sha256 seul du prototype les ouvrait tous les cinq chez le troisième opérateur, la dernière ligne gagnant) | `sources.json` : `shared_sha256.fixtures` = `c1.b.json`, `c2.b.json` ; ligne datée de l'ADR §4 |
| C-G2-2 | bornes ou compteurs manquants ⇒ `read_malformed` | `checkBounds` : paire de X lue par `list(...) ?? []`, les trois autres bornes et les cinq compteurs exigés entiers naturels, sinon `read_malformed` ; trois assertions (borne absente, compteur `NaN`, paire absente) | sondes P-12a, P-12b, P-12c tuées |
| C-G2-3 | six assertions de chaînage | trou antérieur à la transaction admise précédente, trou d'un autre compte, trou ne libérant que le pre suivant, ordre des rangs contre l'ordre d'entrée, départ libre d'un emplacement non ordonné après une fenêtre, compte fermé = `A=0/-` | P-4a, P-4b, P-4c, P-4e, P-4f, P-4h tuées |
| C-G2-4 | `err` hors clé ; non analysée sans liste ; (iv) mint, `blockTime`, index b ; `finalized` des deux côtés | copies à `err` et à pre différents dans la boucle « clé différente » ; instruction Token-2022 non analysée sans `accounts` ⇒ arrêt ; (iv) : index b privé de SIG0, `blockTime` de l'entrée la plus ancienne décalé, frappe de SIG0 à 999 ; statut `confirmed` du seul côté a | P-2c, P-2a (assertion sémantique, l.79, non plus l'épingle), P-6a, P-8a, P-8b, P-8c, P-1c tuées |
| C-G2-5 | (a) rangs égaux dans un emplacement ordonné ⇒ `read_malformed` (code) ; (b), (c) items ; (d), (e) lignes datées | (a) `chainAccounts` : deux transactions admises d'un emplacement ordonné au même rang arrêtent (`read_malformed`), assertion dans les deux ordres d'entrée ; (e) assertion : `innerInstructions` à `null` ⇒ aucune instruction interne ; (b) DOJO-HISTORY-ORDERED-HOLE-1 et (c) DOJO-HISTORY-UNORDERED-CIRCUIT-1 au §8 de l'ADR, avec déclencheur ; (d) ligne datée de Q-6 | sondes P-11, P-11b, P-13 tuées ; ADR, lignes datées |
| C-G2-6 | journal corrigé | §3, §5, §6 : 17 fichiers d'une ligne (16 fixtures et `probe3-expect.json`), 274 + 210 + 55 + 121 + 17 = 677 ; §4 point 2 : trois sources touchées, neuf coups (le « three hits » du réducteur est retiré) ; noms corrigés aux §3 et §5 ; §15 à jour ; l.83 (`docs/adr` gelé) précisée | ce journal |
| Q-2 | 3 / 2 000 gardé, convention 5 % déclarée | ligne datée de l'ADR (fin de document), avant le G1 de PR-2b-3 | 1 − 0,05^(1/2 000) = 0,0014967 ≤ 0,0015 |
| Sous-chaîne | admis pour les corps ; pour les pages, « réduction indépendante des bruts, 17/17 égales » | déclaré ici et dans la ligne datée de l'ADR ; jamais « sous-chaîne » pour les pages | G2 §3.2 (réduction indépendante, 17/17) ; mes 17/17 égaux aux fixtures du G1, que le G2 a vérifiées |

- **ADR de lot** `docs/adr/ADR-DOJO-PR-2B.md` : **ajout seul**, 17 lignes, 0 suppression (`git diff`) : ligne datée sous la table des fixtures du §4 (C-G2-1, `error_origin` G0 + G1), deux lignes au registre du §8 (items de C-G2-5 (b) et (c)), bloc final « Lignes datées des corrections du G2 de PR-2b-1 » (Q-2, Q-6, Q-7 avec C-G2-5 (a) à (e), preuve des fixtures de pages, `error_origin`). sha256 `0acac987abd56d9b740594028472e887e07a62e31e60907c8c6d61d02ef752ea` (921 l.). Écrit par `F:/tmp/dojo/pr2b1-corr/adr-apply.mjs` (ancres contrôlées). **Citations de lignes** : toutes les citations de lignes de l’ADR dans le code, le test, le réducteur et ce journal renvoient à l’ADR au sha256 `20e4d5d5…65fd` (904 l., état du G1) ; les ajouts décalent les lignes ≥ 643 de +2 et ≥ 731 de +4 (l.816 ⇒ l.820 ; table des fixtures l.632-642 inchangée) ; les citations du module (l.70 à l.570) précèdent les ajouts.

### 16.2 R-25

- Méthode du G1 (`F:/tmp/dojo/pr2-1-r25-methodA.mjs`, sha256 `140be120…d3bf`, aucune écriture git ; pathspec de `ci.yml:82`, 20 éléments ; métrique de `ci.yml:90`), sur le clone `--no-local` `F:/tmp/dojo/pr2b1-corr-clone` (HEAD `02884eb`, fichiers du lot et ADR copiés, `cmp` égal) et sur le worktree : **747** = `history-read.ts` 278 + test 234 + réducteur 74 + `sources.json` 144 + 17 fichiers d'une ligne (`r25-clone.txt`). L'ADR (`docs/**/*.md`) et ce journal sont exclus par le pathspec. Prototype du G2 : 722 ; écart +25 : contrôle des rangs égaux (+3), assertions des rangs égaux et de `innerInstructions` nul (+4), résolution par appel et sha commun (+11 réducteur, +7 `sources.json`). 747 / 547 = ×1,37 ; STOP 1 150 à 403 lignes.

### 16.3 Tests

- `node --test apps/dojo/test/dojo-history-read.test.ts` : 6/6 ; `node --test apps/dojo/test/*.test.ts` : **62/62**, deux passages (08:47:05Z, `dojo-tests-1.log` `4af84035…`, et 08:51:50Z, `dojo-tests-2.log` `05212e45…`) ; `npx tsc --noEmit` exit 0 ; `npx eslint` du module, du test et du réducteur : exit 0 (le réducteur est ignoré par la configuration, avertissement seul) ; `node scripts/lang-gate.mjs` OK, 0 coup ; 0 octet CR, 0 caractère hors ASCII dans le module, le test, le réducteur et `sources.json`.

### 16.4 Mutants et sondes (copies hors dépôt, `F:/tmp/dojo/pr2b1-corr-mutants/`)

- **Liste fermée du G1** (harnais `mutants-g1.mjs` = `F:/tmp/dojo/g2-pr2b1/mutants-g1-fix.mjs` aux chemins près) : témoin 6 ok ; **14/14 tués** par leur test visé (`g1/RESULTS.txt`, sha256 `1f4a7210…2990`).
- **Toutes les sondes du G2 et les miennes** (harnais `mutants-g2.mjs` = `g2-mutants-fix.mjs` aux chemins près ; liste `corr-list.mjs` = les 51 de `g2-list-fix.mjs` inchangées, plus six sondes sur le code ajouté : P-11 contrôle des rangs égaux retiré, P-11b contrôle porté sur les emplacements non ordonnés, P-12a bornes non contrôlées, P-12b compteurs non contrôlés, P-12c paire de X lue sans garde, P-13 `innerInstructions` nul lu comme malformé) : témoin 6 ok ; **57/57 tués** par leur test visé (`g2/RESULTS-CORR.txt`, sha256 `e0123200…261f`) ; module inchangé au sha256 après chaque passe (`f9f1463e…1875`).

### 16.5 Oracle (sept gates sur clone, sous verrou d'hôte « corr PR-2b-1 ») et test 42

- Scripts `F:/tmp/dojo/pr2b1-corr/` : `run-oracle.sh`, `locked.sh`, `t42.sh`, `oracle-pass.sh`, `sync.sh`, engendrés par `corr-scripts.sh` depuis ceux du G1 (diffs imprimés : dossier temporaire, propriétaire du verrou « corr PR-2b-1 », chemins du clone ; `sync.sh` copie en plus l’ADR et retire d’éventuels anciens noms). Clone `F:/tmp/dojo/pr2b1-corr-clone` (`git clone --no-local`, 08:49:54Z, HEAD `02884eb`), fichiers du lot et ADR copiés, `cmp` égal au worktree ; `node_modules` par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; Node v24.15.0 ; huit variables payantes retirées, TEMP sur F:.
- **Sept gates** (`oracle/out-1`, 08:52:28Z → 08:59:06Z) : **7/7 exit 0** ; `test` : 1 393 tests, **1 391 pass, 0 fail**, 0 annulé, 2 skipped (préexistants), les six `dojo_history_*` ✔ (`test.log` `c7dc2de82ba6896ac324e070463d4d810387436a4ea56615ae284c57db075830`) ; `lint:ratchet` 69/69 ; `lang:gate` OK, 0 coup ; test 42 vert aussi dans la suite (344 s).
- **Test 42 à part**, verrou repris 08:59:06Z → 09:02:44Z : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0`, `export_public_no_governance_no_french` ✔ en 218 s (`t42/test42.log` `23e1de40ce1f7c3fadb747c45b041a02de737433f9bcba4d2f77f034f3332b35`) ; verrou absent à 09:02:54Z.
- `apps/dojo` n’est pas exporté (`grep dojo scripts/export-public.mjs` : aucune ligne ; `export:check` vert).

### 16.6 Non fait, et pourquoi

- Aucun réseau ; aucun `git add/commit/stash/checkout/branch` dans le worktree (lecture seule : `status`, `log`, `diff`, `rev-parse`) ; un `git clone --no-local` vers `F:/tmp/dojo/pr2b1-corr-clone` (jetable, hors dépôt). Les 16 fixtures aux anciens noms, non suivies, ont été retirées du worktree par `rm` (fichiers du lot renommés ; copie dans `F:/tmp/dojo/pr2b1-corr/before/`). Rien sur C:.
- Le journal n'est pas copié dans le clone de l'oracle (précédent du G1 ; `docs/**/*.md` hors des gates relus : `gate:vocab` ne parcourt pas `docs/`, `lang:gate` non plus) ; l'ADR l'est.
- Aucun code pour C-G2-5 (b) et (c) (décision : items avec déclencheur) ni pour (d) (ligne datée).

### 16.7 Questions formées

- **QC-1 (orchestrateur, C-G2-1)** : le sha256 commun concerne C1 **et** C2 (membre b), non C1 seul comme le dit le rapport G2 ; déclaré dans l'ADR, `sources.json` et ici. À confirmer que la déclaration couvre les deux.
- **QC-2 (orchestrateur, ADR)** : les deux items de C-G2-5 sont inscrits au registre du §8 (ajout) en plus du bloc final ; le déclencheur de DOJO-HISTORY-UNORDERED-CIRCUIT-1 (« avant toute ligne datée qui relève la borne des emplacements non ordonnés au-dessus de 0, ou au G1 de PR-2b-3 ») est ma proposition, la décision ne le fixant pas. À confirmer ou amender.

### 16.8 Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : sha256 communs mesurés sur `SHA256SUMS` (cinq paires, dont C1 et C2 sous un même appel), contrôle des rangs égaux absent du prototype et sonde propre, ordre des opérations sur les fixtures, ADR en ajout seul et §15, pathspec R-25 à vérifier (`docs/**/*.md` exclu : vérifié), listes de mutants. Chaque point vérifié sur pièce ; conseil, jamais verdict. Seconde consultation avant la remise, rendue hors du fichier.
