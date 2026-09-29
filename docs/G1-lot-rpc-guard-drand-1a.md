claude-opus-5-5[1m]

# G1 — DRAND-RELAY-GET-1a (lot rpc-guard, ADR-RPC-GUARD-DRAND-1) : deux libellés GET sans clé à hôte unique pour les relais drand, plafond de tentatives par relais et par jour tenu par le garde

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort max (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-drand-1a.md` (17 l., sha256 `01c55cd9b5b063338b794d73771797049acd68d97711450b06a8d98f96b6197a`, préfixe égal à celui de la tâche), texte calculé par le script de l'orchestrateur, lu comme tel ; `date -u` à l'ouverture : 13:10:33Z.
- **Demande relayée de l'utilisateur** : « tu peux le faire sur chrome? » (seule voix de l'utilisateur transmise par le harnais). Elle ne nomme aucun objet de cette mission ; la mission interdit tout appel réseau réel et la lecture sur place est un acte de l'orchestrateur (CLAUDE.md, « Recherche — lecture sur place ») : **aucun navigateur ouvert, aucune page lue**. Question Q-1 (§12).
- **Base / HEAD** : worktree `F:/Monark-wt-drand`, branche `lot/rpc-guard-drand-1a`, HEAD `bce645f857e2306d5cc0160b9bb1a551cdb84fbb` (tronc portant PR-2-2 et PR-2b-2 fusionnées) ; `git status --short` **vide** à l'ouverture (13:17:08Z, `F:/tmp/dojo/drand-1a-work/open.txt`). Aucun autre worktree touché.
- **Processus `node` (C-V-4)** : **31** à l'ouverture (13:17:08Z ; verrou d'hôte tenu par « cv1 PR-4a-1 ») ; à la prise et au rendu du verrou de l'oracle : §9. Une seule suite complète à la fois (verrou `F:/tmp/oracle-lock`, propriétaire « G1 DRAND-1a »).

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 13:10:33Z → 13:17:08Z | mission (sha256 vérifié) ; worktree, HEAD, arbre propre ; processus `node` : 31 |
| 13:1xZ | ADR de lot en entier (119 l., égal à `21eb5ec`) ; FAITS drand (30 l.) ; `transport.ts`, `client.ts`, `ledger.ts`, `guarded.ts`, `lock.ts`, `errors.ts`, `index.ts`, `cli.ts`, `classify.ts`, `tariff.ts` ; tests `exports`, `transport-hardening`, `caps`, `error-hint`, `harness.ts` ; `bell-keys.test.ts:150-169` et `BARE_LABEL` (`apps/bell/scripts/bell-publish.mjs:95`) ; gardes racine `fetch_only_inside_client` et `no_secret_in_repo` ; `export-public.mjs` (tous les `packages/*` sont exportés) ; `lang-gate.mjs` ; rapport cp-1 ; journal G1 PR-2b-2 (forme) ; scripts d'oracle, de R-25 et de mutants des lots précédents |
| 13:2xZ | advisor intégré, avant toute écriture (§14) |
| 13:2xZ → 13:24:15Z | `transport.ts` (4 éditions à ancre exacte, puis un mot du commentaire retouché : `normalisation` → `normalization`, `node -e` à ancre unique) ; `mk-nm.ps1` sur le worktree (`entries: 220  monark: 10  fail: 0`) ; `bell_publish_bare_label_guard_pins_operator_vocabulary` **rouge** sur la seule modification du garde (`+ 'drand-cf'`, `+ 'drand-pl'`, `pin-red-before-list.log`) : l'épingle voit le changement, comme au G1 de PR-2-2 |
| 13:24Z → 13:26:53Z | `client.ts`, `ledger.ts`, `index.ts`, `exports.test.ts`, `bell-keys.test.ts` (12 éditions à ancre exacte) ; `drand-labels.test.ts` écrit ; 2/2, puis `exports` + `bell-keys` 13/13 (l'épingle étendue passe : `withLabel` rend `published` pour les deux libellés, mesuré à l'exécution) |
| 13:27:07Z → 13:27:49Z | `tsc --noEmit` exit 0 ; `eslint` des 7 fichiers exit 0 ; `lint-ratchet` **76/69** : 0 coup dans les fichiers du lot, 7 dans `test/lang-gate-routing.test.ts` (Q-2) ; `lang-gate` OK ; `gate:vocab` OK |
| 13:29:41Z → 13:30:25Z | deux clones `--no-local` (oracle, mutants), HEAD `bce645f` ; `mk-nm.ps1` ×2 ; `lint-ratchet` sur le clone **vierge** (0 fichier du lot) : **76/69**, défaut du tronc |
| 13:30:39Z → 13:32:07Z | arbre des mutants synchronisé ; passe 1 : 19/19 |
| 13:32:44Z → 13:33:08Z | suite `packages/rpc-guard/test` : 101/101 ; `dojo-collect.test.ts` : 16/16 |
| 13:34:15Z | clone de l'oracle synchronisé (sha256 égaux dans les trois arbres) ; R-25 = 154 |
| 13:34:34Z → 13:34:51Z | mutants, passe 2 (fait foi) : 19/19 |
| 13:34:58Z → 13:35:2xZ | tests (1)-(4), deux passages : verts |
| 13:3xZ → 13:41:07Z | journal rédigé pendant l'attente du verrou (tenu par « G2 PR-2b-3 » depuis 13:32:50Z) ; `lot.diff` et `greps.txt` versés |
| 13:44:27Z → 13:57:54Z | verrou pris après 600 s ; sept gates : 6/7 exit 0, `lint:ratchet` 76/69 (défaut du tronc, Q-2) ; `test` 1 436/1 439, 0 échec ; test 42 seul : 2/2 ; verrou rendu (§9) |
| 13:58:05Z → 13:58:14Z | jonctions des deux clones retirées ; `F:/Monark/node_modules` intact |
| 13:5xZ → 14:0xZ | §9 complété ; livraison `F:/tmp/dojo/drand-1a-deliver/` ; advisor intégré (seconde consultation) |

## 1. Sources (niveau) et entrées

- **[lu]** ADR `docs/adr/ADR-RPC-GUARD-DRAND-1.md` (119 l., sha256 `3048c5f294629699dd40cc21bfbd42d098c0d0533de79e7c63f7591801944bbb` = `git show 21eb5ec:docs/adr/ADR-RPC-GUARD-DRAND-1.md`), en entier ; les lignes « Pli cp-1 », 10:57Z et le verdict 11:07Z priment (plafond 4, coupe (β), TY-5 + 2 lignes).
- **[lu]** FAITS `docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` (30 l., sha256 `1c19b94fe884dbaa0dd394cfc236206640a193fa5c6aeac3c25e66faf7a759e9`, égal à la citation de l'ADR l.8) : relais l.5 ; v1 et v2 l.4, l.20 ; hash quicknet l.21, l.26 ; forme v1 l.30 ; hash de la chaîne « default » **tronqué** l.21 (`8990e7a9…b2ce`).
- **[lu] Concordance du hash**, sans réseau : ADR D-1 l.35 = FAITS l.21 et l.26 = `READ_RULE.beacon_chain_hash` (`apps/dojo/src/dojo-methods.ts:27`) = champ `hash` des deux copies `/info` de l'orchestrateur (`F:/tmp/dojo/drand-info-drandsh.json`, `drand-info-cf.json`) = constante `DRAND_QUICKNET_HASH` = littéral du test (1), qui l'asserte.
- **[lu]** code de base, sha256 avant : `transport.ts` `64a84454…385e`, `client.ts` `6553556c…d50f`, `ledger.ts` `625c759f…46cb`, `index.ts` `db2908e9…c5c8`, `exports.test.ts` `8e69ccd5…a8a7`, `bell-keys.test.ts` `25ab6a2a…59e8` (égaux aux sha de l'ADR l.25-26 et du cp-1) ; `guarded.ts` `a36fa005…fab6`, `lock.ts` `6655a9c8…c244`, inchangés.
- **[lu]** rapport cp-1 `F:/tmp/dojo/cp1-drand/CP1-report.md` (la règle y est rejouée sur 12 chemins, dont `/…/public/../info`).
- Précédents lus, non copiés : motif `xstocks-issuer` (`getOps` et `urls.set`, `transport.ts` l.89-122 de la base), `resolveGetUrl` (l.198-206), `redirect: "manual"` (l.220), `meter`/`commit` (`client.ts` l.107-135), P6 (`exports.test.ts:15-31`), épingle (`bell-keys.test.ts:152-169`), `harness.ts`, pièges socket et DNS (`apps/dojo/test/helpers/collect-chain.ts:14-15`).

## 2. Interfaces

```ts
// packages/rpc-guard/src/transport.ts (le seul module à URL)
const DRAND_RELAY_HOSTS: ReadonlyMap<string, string>;  // PRIVÉE : drand-pl -> api.drand.sh, drand-cf -> drand.cloudflare.com
export const DRAND_RELAY_LABELS: readonly string[];    // ["drand-pl", "drand-cf"], dérivés de la table ; exportés par index.ts
export const DRAND_QUICKNET_HASH: string;              // épinglé ; PAS dans index.ts (1b : égalité avec READ_RULE par import relatif de test)
export const DRAND_ROUND_PATH: RegExp;                 // ^/<hash>/public/[1-9][0-9]{0,15}$ ; PAS dans index.ts
// resolveOperators : drand-pl, drand-cf = { unit: "keyless" }, getOps ; resolveGetUrl : chaîne brute contre DRAND_ROUND_PATH, sinon Error
// packages/rpc-guard/src/client.ts
interface RunLimits { ...; readonly cycleAttempts?: Readonly<Record<string, number>> }  // refus "cycle_attempts" (ligne refused)
// packages/rpc-guard/src/ledger.ts
interface CycleLedger { ...; priorAttemptsAtOpen(): number }  // lignes attempted à l'ouverture
// packages/rpc-guard/src/index.ts
export { DRAND_RELAY_LABELS } from "./transport.ts";
```

## 3. Fichiers (modifiés ou créés ; aucun autre)

| Fichier | État | Lignes | `git diff --numstat` | sha256 |
|---|---|---|---|---|
| `packages/rpc-guard/src/transport.ts` | modifié | 279 | 18 0 | `84f2783c63ca6c41f9bd1d4936b8728a8fb119308dd7d2e6c1c5c371ae20497f` |
| `packages/rpc-guard/src/client.ts` | modifié | 151 | 12 0 | `e326f9a4eeae9c4a0f7a8c6ab8f91fd840e92f195be2e743c47467c0ee4fcd48` |
| `packages/rpc-guard/src/ledger.ts` | modifié | 214 | 4 0 | `c721094e51aab3ca9a8bbe27612375bd93e47b56522a682779d2f2a49afa4f61` |
| `packages/rpc-guard/src/index.ts` | modifié | 31 | 2 0 | `3e1ae1248c6085fc47a1697fa009e0ec3dbf0db6ad892fce580901246d2679dc` |
| `packages/rpc-guard/test/drand-labels.test.ts` | créé | 111 | (non suivi) | `38e76aaaaf39bce0f4af1bae4961188240c22e8010fdb6b982e32b23d1e6c68b` |
| `packages/rpc-guard/test/exports.test.ts` | modifié | 89 | 3 1 | `65722dcdc261d8dd06b32b812c8e8ee19efc6567c043eba501e0da5d1b3a5055` |
| `apps/bell/test/bell-keys.test.ts` | modifié (liste de l'épingle et commentaire daté seuls, Q-2 de l'ADR) | 221 | 2 1 | `2ef4aa7ebe782494274858093c44e37cc3927068b3c64d3f8641869317dd855a` |
| `docs/G1-lot-rpc-guard-drand-1a.md` | créé (ce journal, hors compte R-25) | — | — | rendu hors du fichier |

- Gelés, `git diff --stat HEAD` vide : `apps/dojo/**` (dont `collect.ts` : PR 1b), `apps/bell/**` hors l'épingle, `package*.json`, `tsconfig.json`, `guarded.ts`, `lock.ts`, `errors.ts`, `cli.ts`, `docs/adr/**`, FAITS. Aucune dépendance, aucune fixture.
- 0 octet CR, 0 caractère hors ASCII dans les sept fichiers (mesuré par `node`).
- `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore`), à retirer par `rm-nm.ps1 -Tree F:\Monark-wt-drand` si l'orchestrateur le veut.

## 4. Choix déclarés (jamais silencieux)

1. **Règle de chemin sur la chaîne brute.** L'ADR (D-1 l.36) refuse une requête drand « si `search` ou `hash` non vides ou chemin hors `DRAND_ROUND_PATH` », c'est-à-dire sur l'URL résolue. Le code teste `params[0]` **brut**, avant toute résolution, contre l'expression ancrée (sans drapeau `i`) : c'est un **surensemble** des trois clauses, qui refuse en plus un `?` ou un `#` nus (que `URL` rend avec `search`/`hash` vides), un segment `..` ou `.`, un antislash, un blanc de tête, une URL absolue de même hôte, une barre finale. Le test (1) porte un cas de chacun ; la sonde P-1 (règle écrite sous la forme littérale de l'ADR) est tuée par le `?` nu. Aucun contrôle `search`/`hash` séparé : après le test brut il serait tautologique (mutant équivalent). Q-4.
2. **Autre chaîne.** Le hash complet de la chaîne « default » n'est pas dans les FAITS (l.21 : `8990e7a9…b2ce`) ; aucune valeur n'est écrite de mémoire. Le cas « hash d'une autre chaîne » est tenu par des hex64 **synthétiques** déclarés : le hash épinglé au dernier chiffre changé (quasi-collision, tue M-D1), le hash nul, et le hash épinglé en majuscules. Procurement formé Q-3.
3. **`cycleAttempts`** (champ optionnel de `RunLimits`) : validé dans `assertLimits`, donc avant tout verrou : entier > 0, sinon `BudgetExceededError` (un `NaN` ferait sinon ouvrir le plafond : `x + 1 > NaN` est faux) ; plafond sur un opérateur **payant** demandé : refusé (un plafond de cycle payant est en unités, décision 112/115) ; plafond nommant un opérateur **non demandé** par la course : ignoré, comme `runCaps` et `cycleFloor` aujourd'hui. Q-6.
4. **Ordre dans `meter`** : `run_calls` (inchangé), puis `cycle_attempts`, puis les contrôles payants (inchangés). Le consommateur traite les deux motifs de même (« aucun plan à ce passage », D-1 (b)). Q-7.
5. **Prior** : `priorAttemptsAtOpen()` compte les seules lignes `attempted` du grand livre à l'ouverture (lu sous le verrou, comme `priorAtOpen`) ; `makeClient` tient **un** compteur par opérateur, initialisé au prior et incrémenté par `commit` : prior + tentatives de la course. Les lignes `refused`, `reconciled` et `unlocked` ne comptent pas (le test (2) libère par l'`unlock` servi pour que des lignes `unlocked` soient au grand livre ; sonde P-5 tuée).
6. **Pas de garde `unit === "keyless"` dans `meter`** : la validation assure qu'un plafond sélectionné ne porte que sur un opérateur sans clé ; la garde serait un mutant équivalent (avis de l'advisor, retenu).
7. **Table privée, libellés dérivés** : `DRAND_RELAY_LABELS = [...DRAND_RELAY_HOSTS.keys()]`, une seule source ; le test (1) écrit les hôtes attendus en littéraux (FAITS l.5, ADR D-1), oracle indépendant de la table (M-D3).
8. **Test (2)** : l'ADR ne nomme pas son fichier ; il vit dans `drand-labels.test.ts` avec le test (1). Trois courses du même jour : sous `maxCalls` 4 et avec `run_calls` contrôlé d'abord, la cinquième tentative de `drand-cf` ne peut être refusée `cycle_attempts` qu'à une troisième course ; `drand-pl` totalise ses quatre tentatives admises sur deux courses et sa cinquième est refusée à la deuxième, comme l'écrit le pli C-V-1 ; la troisième course montre aussi le prior 4 lu à l'ouverture. Q-5.
9. **TY-5 à deux formes** : un appel de Bell porte un `params[0]` **chaîne** (une adresse) ; sans règle de chemin il serait résolu en `https://api.drand.sh/<adresse>`, même hôte, et envoyé. L'ADR (D-3 TY-5) ne décrit que la forme non chaîne (`""` puis `/`). Les deux formes sont au test (1), par `openGuardedClient` sous un cycle appelant (`bell-cycle`) : deux lignes `attempted` à coût 0 sous ce cycle (verdict 11:07Z), aucune sous `drand-<jour>`, 0 `fetch`. Q-8.
10. **Test (3)** : `DRAND_RELAY_LABELS` ajouté à l'ensemble fermé, et `DRAND_QUICKNET_HASH` ajouté aux symboles interdits (M-D8b tué par son nom, pas seulement par l'égalité d'ensemble).
11. **Épingle de Bell** : liste fermée à 10 libellés et une ligne de commentaire datée ; l'épingle a d'abord été vue rouge sur le seul changement du garde (13:24:15Z), puis verte après l'extension.
12. **Outils et forme des commandes** (commandes < 6 Ko) : fichiers de plus de 6 Ko écrits par l'outil Write (le test, le harnais des mutants, ce journal) ; éditions du code par `F:/tmp/dojo/drand-1a-work/patch.mjs` (remplacements exacts, compte d'occurrences contrôlé, refus d'un CR). Mesuré : le transport des commandes réduit `\\` à `\` (le premier `patch.mjs` et une retouche du harnais ont cassé ainsi, corrigés) ; aucun double antislash n'est passé en commande ; l'antislash du cas de test est construit par `String.fromCharCode(92)`.

## 5. R-25 (méthode `ci.yml:82` et `:90`, base `bce645f`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec de `ci.yml:82` extrait du fichier (20 éléments), `git diff --numstat bce645f` pour les suivis, `--no-index` pour les non suivis, métrique insertions + suppressions ; aucune écriture git.
- Clone `F:/tmp/dojo/drand-1a-clone` (`F:/tmp/dojo/drand-1a-work/r25-clone.txt`, sha256 `04adcbe1d22e13bc4fc6cdc6894fea728180c4ac80a49042b6395aabfe592fe1`) et worktree : **154** = code 36 (`transport.ts` 18, `client.ts` 12, `ledger.ts` 4, `index.ts` 2) + tests 118 (`drand-labels.test.ts` 111, `exports.test.ts` 3 + 1, `bell-keys.test.ts` 2 + 1). Ce journal est exclu par le pathspec.
- Estimation ascendante (ADR D-4 l.84, 81, + 2 du verdict 11:07Z = 83) ; dérive **×1,86** ; **≤ 170** (×2,1) : la coupe n'est pas posée ; STOP 1 150 à 996 lignes. Écart : code 36 contre 19 (commentaires de rattachement, validation du plafond, compteur) ; tests (1) + (2) 111 contre 62 (en-tête et outillage ≈ 25 l. : pièges, `offline`, lecteurs du grand livre ; cas du surensemble brut et bornes de la ronde ; TY-5 à deux formes ; validation du plafond ; troisième course).

## 6. Tests

| Test | Fichier | Couvre | Mutants visés |
|---|---|---|---|
| (1) `rpc_guard_drand_labels_are_host_bound` (nouveau) | `packages/rpc-guard/test/drand-labels.test.ts` | libellés exacts `["drand-pl", "drand-cf"]` (export public) ; hash épinglé = littéral FAITS ; classe `{ unit: "keyless" }` ; un GET par libellé sur son hôte exact, méthode `GET`, sans corps, `redirect: "manual"`, corps v1 rendu tel quel ; par libellé, 24 refus avant tout `fetch` : `/info`, `/<hash>/info`, `/v2/beacons/quicknet/rounds/1`, `/public/latest`, `/<hash>/public/latest`, ronde 0, `01`, 17 chiffres, hash en majuscules, quasi-collision, hash nul, `?x=1`, `?` nu, `#f`, `#` nu, `/…/public/2/../1`, antislashs, blanc de tête, barre finale, `//hôte`, sosie suffixe `//hôte.evil.invalid`, sosie préfixe `//xhôte`, URL absolue de même hôte, chaîne vide ; `params[0]` non chaîne ; par `openGuardedClient` sous `drand-2026-09-27` : une ligne `attempted` à coût 0 par libellé (`drand-pl\|GET`, `drand-cf\|GET`), sur disque **avant** son GET (P6), `maxCalls` 2 tenu (troisième appel refusé `run_calls`, 0 `fetch`) ; TY-5 (§4 point 9) | M-D1, M-D2, M-D3, M-D4 ; P-1 à P-4 |
| (2) `rpc_guard_keyless_cycle_attempts_hold_across_courses` (nouveau) | idem | plafond 4 par relais et par jour, `maxCalls` 4 par course, libération par l'`unlock` servi (`runCli`) ; course 1 `pl,cf,pl,cf` ⇒ 4 admises ; course 2 `pl,pl,pl,cf` ⇒ `ok,ok,refused,ok` ; course 3 `cf,cf,pl` ⇒ `ok,refused,refused` ; jour suivant ⇒ `ok,ok` ; hôtes dans l'ordre (4 GET par relais le jour d, 0 sur un refus) ; issues exactes des deux grands livres (`attempted`, `unlocked`, `refused:cycle_attempts`) ; plafonds 0, −1, 2,5, `NaN` et plafond sur `helius` refusés avant tout verrou (aucun répertoire de cycle créé) | M-D5, M-D6 ; P-5 à P-9 |
| (3) `public_export_set_is_closed` (amendé) | `packages/rpc-guard/test/exports.test.ts` | + `DRAND_RELAY_LABELS` ; `DRAND_QUICKNET_HASH` interdit | M-D8a, M-D8b |
| (4) `bell_publish_bare_label_guard_pins_operator_vocabulary` (amendé) | `apps/bell/test/bell-keys.test.ts` | liste fermée à 10 libellés, commentaire daté ; la boucle `withLabel` asserte `published` pour les deux libellés | M-D7a, M-D7b |

- **Deux passages** des fichiers des tests (1)-(4) (worktree, 13:34:58Z et 13:35:09Z) : 15/15 chacun, les quatre noms ✔ (`four-tests-pass1.log` `d56c06cd8e276d39fb602c6f73bc294ba93e9b5f2b7db530a2aeffec7b66773d`, `four-tests-pass2.log` `6a1539ade66f76567d8f2156742ffcf8d6893b5d6914fc4c4ed2d898eca4c720`) ; dans l'oracle : §9.
- **Suite `packages/rpc-guard/test`** (worktree, 13:32:44Z) : **101/101**, 0 échec (`rpcguard-suite-1.log`).
- **À contrôler par nom** : `error_preamble_carries_no_vocabulary_token` ✔ sans amendement (`drand-pl`, `drand-cf` ne portent aucun jeton de `ERROR_HINT_TOKENS`) ; `dojo_tick_before_0015_fetches_beacon_once`, `dojo_collect_reads_only_inside_the_window` ✔ (et `dojo_collect_beacon_is_all_day_or_nothing`, `dojo_collect_to_verify_end_to_end` ✔ : `dojo-collect.test.ts` 16/16, 13:32:58Z ; `collect.ts` non touché, les relais du Dōjō restent `RunDeps.relays` jusqu'à 1b).
- `npx tsc --noEmit` exit 0 ; `npx eslint` des sept fichiers exit 0 ; règles du cliquet réactivées sur les trois fichiers de test du lot : **0** coup ; `lang-gate` OK ; `gate:vocab` OK.

## 7. Mutants (copie hors dépôt `F:/tmp/dojo/drand-1a-mutants/`)

- Arbre `F:/tmp/dojo/drand-1a-mutants/tree` : clone `--no-local` de la branche (HEAD `bce645f`), sept fichiers du lot copiés (`cmp` égal, sha256 égaux au worktree), `node_modules` par `mk-nm.ps1` (`@monark/*` pointe l'arbre lui-même, donc le mutant est exercé par le spécificateur du paquet). Harnais `mutants.mjs` (sha256 `1cb6f0a8960fbb092168d9f3a5a39d2f13f3473491e5a8ad2bbbc686b363c5fc`) : témoin d'abord (les quatre tests visés `ok`), remplacement exact à compte contrôlé, test visé seul (`--test-name-pattern`, TAP), **tué seulement si le TAP porte `not ok N - <test visé>`**, fichier restauré puis contrôlé au sha256 après chaque mutant ; TAP par mutant (`<id>.tap.txt`).
- Passe qui fait foi (13:34:34Z → 13:34:51Z, fichiers livrés) : témoin 4/4 `ok` ; **19/19 tués** ; sept fichiers dorés inchangés au sha256 après la passe (`RESULTS.txt`, sha256 `b1f8d8553c6dc21fdb29d35fc03942fcf0b02e05b9517c8fb11428d770e6be65`). Passe antérieure sur les mêmes fichiers (13:31:53Z → 13:32:07Z, `RESULTS-run1.txt`) : même verdict ligne pour ligne (seule l'extraction du message d'erreur du harnais a changé entre les deux).

| Id | Mutation | Test visé | Verdict (assertion qui tue) |
|---|---|---|---|
| M-D1 | hash générique `[0-9a-f]{64}` admis | (1) | tué (quasi-collision `…c84e978` admise) |
| M-D2 | règle de chemin retirée | (1) | tué (`/info` admis) |
| M-D3 | hôtes des deux libellés permutés | (1) | tué (URL des GET) |
| M-D4 | GET drand hors `meter` (aucune ligne de grand livre) | (1) | tué (`maxCalls` 2 non tenu ; aucune ligne avant le GET) |
| M-D5 | contrôle `cycle_attempts` retiré | (2) | tué (course 2) |
| M-D6 | prior compté sur la course seule | (2) | tué (course 2) |
| M-D7a | libellé pointé réintroduit (`drand-pl` → son hôte) | (4) | tué (liste de l'épingle) |
| M-D7b | version retirée : libellés = hôtes | (4) | tué (liste de l'épingle) |
| M-D8a | export `DRAND_RELAY_LABELS` manquant | (3) | tué (ensemble fermé) |
| M-D8b | export de trop (`DRAND_QUICKNET_HASH`) | (3) | tué (ensemble fermé) |
| P-1 | règle sur l'URL résolue (forme littérale de l'ADR) | (1) | tué (`?` nu admis) |
| P-2 | borne de la ronde relâchée | (1) | tué (17 chiffres) |
| P-3 | ronde 0 et zéro de tête admis | (1) | tué (`/public/0`) |
| P-4 | libellés drand hors `getOps` (POST JSON-RPC) | (1) | tué (corps non rendu tel quel) |
| P-5 | prior = toutes les lignes du grand livre | (2) | tué (course 2) |
| P-6 | validation du plafond retirée | (2) | tué (plafond 0 accepté) |
| P-7 | plafond sur un opérateur payant accepté | (2) | tué |
| P-8 | décalage d'une unité (refus à la quatrième) | (2) | tué (course 2) |
| P-9 | tentatives de la course non comptées (prior seul) | (2) | tué (course 2) |

- **M-D9 et M-D10 visent le test (5)** (`dojo_collect_beacon_is_all_day_or_nothing` sous garde) : **lot 1b**, non joués ici (mission). M-B3, M-B4, M-B5 « sous garde » : 1b également.

## 8. Tuyaux (règle Branchement)

- **Entrée** : transport GET du garde pour `drand-pl` et `drand-cf` (hôte unique, chemin fermé), par `openGuardedClient` seul (aucun symbole public ne rend une URL ; `resolveOperators` reste interne).
- **Sortie** : `DRAND_RELAY_LABELS`, les deux classes `keyless`, `RunLimits.cycleAttempts` et `CycleLedger.priorAttemptsAtOpen`. **Consommateurs à 1a : les tests (1)-(4) seuls.** Aucun chemin servi ne les lit : **TU-B absent, item formé** (ADR D-2, pli C-V-2 : entrée = ce transport ; sortie = `collect.ts` `--plan`/`--tick` et `main` par `openGuardedClient` ; état = grand livre `<state>/ledger/drand-<jour>/` ; tests = `dojo_collect_beacon_is_all_day_or_nothing` et `dojo_collect_to_verify_end_to_end` sous garde ; déclencheur : G1 de 1b ; clos au G7 de 1b ; propriétaire : l'orchestrateur).
- **État** : grand livre par (cycle, opérateur) `<ledgerDir>/drand-<AAAA-MM-JJ>/drand-{pl,cf}.jsonl` + `.head` + `.lock`, une ligne par appel, coût 0 ; plafond (b) : lignes `attempted` du cycle.
- **Test d'intégration** : aucun chemin servi à ce lot ; la composition garde → grand livre est rejouée par le test (1) et (2) sur le chemin public `openGuardedClient`, ce qui ne vaut pas branchement. **La pièce reste `upcoming`** ; ce lot ne déclare rien « built ».

## 9. Oracle (sept gates sur clone, sous verrou d'hôte « G1 DRAND-1a ») et test 42

- **Scripts** `F:/tmp/dojo/drand-1a-work/` : `run-oracle.sh` (sha256 `5baaa845…70c9` : `npm run` des sept gates `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, codes capturés directement, huit variables payantes retirées par `env -u`, TEMP sur F:), `locked.sh` (`b7e354ba…5129` : verrou `F:/tmp/oracle-lock` par `mkdir` atomique, `owner.txt` « G1 DRAND-1a », attente par pas de 60 s jusqu'à 90 min, retrait dans le piège EXIT ; **`node.exe` comptés à la prise et au rendu**), `oracle-all.sh` (`93d2a8e4…527a` : les sept gates puis le test 42 seul, sous la même prise ; compte au lancement du test 42), `t42.sh` (`63752638…a981`), `sync.sh` (`fd34bd8c…d1e1` : sept fichiers du worktree vers un clone, `cmp`), écrits à neuf sur le motif des scripts de PR-2b-2.
- **Arbre** : `F:/tmp/dojo/drand-1a-clone` (`git clone --no-local --branch lot/rpc-guard-drand-1a F:/Monark`, 13:29:41Z, HEAD `bce645f`), sept fichiers du lot copiés à 13:34:15Z (sha256 égaux au worktree et à l'arbre des mutants) ; `node_modules` par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; Node v24.15.0.
- **Verrou et C-V-4** (`oracle/out-1/node-count.txt`) : attente de 600 s derrière « G2 PR-2b-3 » (tenu depuis 13:32:50Z) ; pris à 13:44:27Z, **23 `node.exe` à la prise** ; sept gates 13:44:28Z → 13:52:24Z ; **25 au lancement du test 42** (13:52:25Z) ; **22 au rendu** (13:57:53Z) ; verrou rendu à 13:57:54Z, absent à 13:57:58Z. Une seule suite complète pendant la prise.
- **Sept gates : 6/7 exit 0 ; `lint:ratchet` exit 1**, 76/69, **identique au clone vierge** (13:30:25Z, aucun fichier du lot) : défaut du tronc, 7 coups à `test/lang-gate-routing.test.ts:65-66`, 0 dans les fichiers du lot (Q-2). `test` : **1 439 tests, 1 436 pass, 0 fail**, 0 annulé, 3 skipped, préexistants et déclarés (`sentinel_run_releases_chainstack_lock_on_sigterm` et `sentinel_instrument_out_win32_short_name` sous win32, `u4b_labels_replay_via_main_real_artifact` sans artefact) ; ✔ les quatre tests du lot, `error_preamble_carries_no_vocabulary_token`, `dojo_tick_before_0015_fetches_beacon_once`, `dojo_collect_reads_only_inside_the_window`, `fetch_only_inside_client`, `no_secret_in_repo`, test 42 dans la suite (411 s) (`test.log` `77e0fd95421b1cc6efcf42f70f0fe2f58d1ecccd0c0d10897af7e53d3300ae64`) ; `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`, `gate:vocab` `f34eddc2…94f1`, `lang:gate` OK 0 coup `b22ac8f8…0dd7`, `export:check` `2f9645a9…8f16`, `lint:ratchet` `8a4553cc…fec3`.
- **Test 42 à part**, après la suite, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0`, `export_public_no_governance_no_french` ✔ en 327 s (`t42/test42.log` `719d7677080ee42adbbdb57d374307a9e6fa3956ae6b227d334c6f3459b7a241`). `packages/rpc-guard/**` et `apps/bell/test/**` sont exportés : `lang-gate` du miroir vert.
- Jonctions des deux clones (oracle, mutants) retirées par `rm-nm.ps1` (`removed`, 13:58:05Z → 13:58:14Z) ; `F:/Monark/node_modules` intact (218 entrées, `@monark` 10).

## 10. Aucun réseau (greps sur les fichiers du lot)

- `fetch(` : **0** ligne ajoutée hors `transport.ts` et 0 dans `drand-labels.test.ts` (le bouchon s'écrit `globalThis.fetch = …`). `node:http`, `node:https`, `undici`, `child_process` : 0. Le test importe `node:net` et `node:dns` pour **armer les pièges** (une socket ou une résolution lève), motif `collect-chain.ts:14-15`.
- `https://` dans le code : **une** ligne, la résolution de la table privée (`` urls.set(label, `https://${host}`) ``, `transport.ts`, seul module à URL). Dans le test : deux lignes, une entrée refusée (URL absolue de même hôte) et l'URL attendue des deux GET ; hôtes des deux relais ou `.invalid` ; jamais atteints (bouchon et pièges). Aucune URL exportée : `DRAND_RELAY_LABELS` ne porte que les libellés, la table et l'expression restent dans `transport.ts`, le hash n'est pas public (test (3)).
- Aucun appel réseau réel pendant la passe : tous les tests tournent sous bouchon ; aucun navigateur ; aucune lecture de page.

## 11. Ce que je n'ai pas fait, et pourquoi

- `apps/dojo/**` inchangé : `collect.ts`, `dojo-methods.ts`, `collect-chain.ts`, `dojo-collect.test.ts` (test (5), M-D9, M-D10, `RunDeps.relays` retiré, runbook `docs/RUNBOOK-dojo.md`) sont **1b**.
- Aucune édition de l'ADR ni des FAITS ; aucune correction de `test/lang-gate-routing.test.ts` (hors du lot : Q-2).
- Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; git en lecture seule (`status`, `rev-parse`, `log`, `diff`, `show 21eb5ec:<chemin>`, `ls-files --eol`, `worktree list`, `merge-base --is-ancestor`) ; deux `git clone --no-local` jetables sous `F:/tmp/dojo/`. **Écart déclaré** : un `git stash list` (lecture seule, sans effet) a été lancé par inadvertance sur le clone jetable de l'oracle (13:3xZ), jamais sur le worktree.
- **Hors verrou** : les passes au niveau du fichier ou du paquet (tests (1)-(4) ×2, suite `packages/rpc-guard/test`, `dojo-collect.test.ts`, deux passes de mutants, `tsc`, `eslint`, cliquet, `lang-gate`, `gate:vocab`) ont tourné hors du verrou d'hôte, en partie pendant la prise de « G2 PR-2b-3 » (précédent des lots PR-2b-2 et PR-2-2) ; la suite complète `npm test` et le test 42 n'ont tourné que sous le verrou (§9).
- Rien sur C: : TEMP, TMP, TMPDIR sur `F:/tmp/dojo/drand-1a-work/tmp` (et `F:/tmp/dojo/drand-1a-mutants/tmp`), cache npm `F:\cache\npm` ; le binaire `node` de `C:\Program Files\nodejs` est exécuté, jamais écrit.

## 12. Questions formées (aucun « dû » nu)

- **Q-1 (orchestrateur ; demande relayée « tu peux le faire sur chrome? »)** : elle ne nomme aucun objet de cette mission ; aucun navigateur ouvert (mission : aucun appel réseau ; lecture sur place = acte de l'orchestrateur). Si elle vise une lecture (conditions des relais P-3, disponibilité P-4, hash de la chaîne « default » de Q-3), elle revient à l'orchestrateur, navigateur interne puis externe, FAITS daté.
- **Q-2 (orchestrateur ; défaut du tronc, item formé TRUNK-RATCHET-76-1 ; BLOQUANT pour la fusion, pas pour ce G1)** : `npm run lint:ratchet` rend **76/69** sur `bce645f` **vierge** (clone sans fichier du lot, 13:30:25Z, `ratchet-base-pristine.log` `6229efed083f2051cc767a4e672503d51597a33916024376d23c8ef2e4f617c6`) : 7 coups à `test/lang-gate-routing.test.ts:65-66` (`JSON.parse(...).files` non typé, puis `.map` dessus : `no-unsafe-assignment` ×2, `no-unsafe-member-access` ×3, `no-unsafe-call` ×2), apportés par `4ef2b15` (LANG-GATE-CLAUDE-1), absent des bases des lots Dōjō (`eb5392a`, `94a56b6`, `accf72e` ne le contiennent pas, `cc762cc` et `4e89620` si). Ce lot n'y ajoute rien (0 coup dans ses fichiers). Conséquence : le job `g4-architecture` rougit sur toute PR issue du tronc. Proposition : typer le résultat (`JSON.parse(...) as { files: Array<{ rel: string }> }`) dans `lang_gate_skips_the_session_folder`, attendu 69/69 ; déclencheur : avant la fusion de 1a ; propriétaire : l'orchestrateur.
- **Q-3 (procurement, orchestrateur)** : hash complet de la chaîne drand « default » (FAITS l.21 : `8990e7a9…b2ce` seulement). Acquisition : lecture sur place par l'orchestrateur, par exemple de la page `/info` sans hash d'un relais (chaîne par défaut, forme des exemples de FAITS l.6 ; à confirmer sur la documentation primaire), consignée dans les FAITS drand ; tentative faite ici : aucune (mission sans réseau) ; usage : un cas « autre chaîne » littéral au test (1) (une entrée de tableau), les cas synthétiques restant.
- **Q-4 (orchestrateur, D-1 l.36)** : règle sur la chaîne brute, surensemble déclaré de la forme résolue (§4 point 1) ; à confirmer ou amender par ligne datée.
- **Q-5 (orchestrateur, D-4 test (2))** : fichier (`drand-labels.test.ts`) et forme à trois courses (§4 point 8) ; à confirmer.
- **Q-6 (orchestrateur, D-1 (b))** : un plafond nommant un opérateur non demandé est ignoré (précédent `runCaps`/`cycleFloor`) ; le refuser serait plus strict mais obligerait 1b à bâtir un `RunLimits` par course ; à trancher.
- **Q-7 (orchestrateur, D-1 (b))** : `run_calls` est contrôlé avant `cycle_attempts` ; quand les deux mordent, la ligne `refused` porte `run_calls` ; à confirmer.
- **Q-8 (orchestrateur, D-3 TY-5)** : précision proposée pour une ligne datée : « un `params[0]` chaîne (une adresse de Bell) serait résolu sur le même hôte et envoyé sans la règle de chemin ; il est refusé par elle, après `meter` et `commit` » (§4 point 9).
- **Q-9 (orchestrateur, D-4 R-25)** : 154 mesurées pour 83 estimées (×1,86), sous 170 ; ventilation au §5.

## 13. Livraison

`F:/tmp/dojo/drand-1a-deliver/` (script `F:/tmp/dojo/drand-1a-work/deliver.sh`) : les sept fichiers du lot et ce journal (arborescence du dépôt) ; `evidence/` : `r25-clone.txt`, `ratchet-base-pristine.log`, `pin-red-before-list.log`, `four-tests-pass1.log`, `four-tests-pass2.log`, `rpcguard-suite-1.log`, `greps.txt`, `lot.diff` (`git diff HEAD` + le fichier neuf, lecture seule), `mutants/RESULTS.txt` et `mutants/mutants.mjs`, `oracle/` (`header.txt`, `exits.txt`, `node-count.txt`, `t42/exits.txt`) ; `DELIVERED.sha256` (sha256 de chaque fichier livré ; ceux du lot et du journal relus contre le worktree). Journaux complets de l'oracle et TAP par mutant : restés sous `F:/tmp/dojo/drand-1a-work/oracle/out-1/` et `F:/tmp/dojo/drand-1a-mutants/`.

## 14. Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : demande Chrome non actée (question) ; règle brute, surensemble déclaré et un cas discriminant de chaque forme ; `01` et 17 chiffres ; aucun hash écrit de mémoire (synthétiques + procurement) ; validation de `cycleAttempts` dans `assertLimits`, payant refusé, non demandé ignoré ; pas de garde `keyless` dans `meter` (équivalent) ; arithmétique du test (2) et `unlock` servi entre les courses ; `DRAND_QUICKNET_HASH` aux interdits du test (3) ; épingle vue rouge puis verte ; TY-5 à deux formes ; greps classés, test non réécrit pour les esquiver ; oracle : comptes `node` à la prise et au rendu. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation avant la remise : rendue hors du fichier.

## 15. `git status --short` final (worktree)

```
 M apps/bell/test/bell-keys.test.ts
 M packages/rpc-guard/src/client.ts
 M packages/rpc-guard/src/index.ts
 M packages/rpc-guard/src/ledger.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/exports.test.ts
?? docs/G1-lot-rpc-guard-drand-1a.md
?? packages/rpc-guard/test/drand-labels.test.ts
```

## 16. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; worker correcteur, effort max, contexte frais (correcteur ≠ relecteur ≠ générateur). Mission `F:/tmp/dojo/mission-corr-drand-1a.md` (17 l., sha256 `fb8ff8b351d722b4df0202e471693af13224c7dbc22c7718d93d3f0c9c409cbf`, égal au préfixe `fb8ff8b3` de la tâche), texte calculé par le script de l'orchestrateur, lu comme tel. Entrée : rapport G2 `F:/tmp/dojo/g2-drand-1a/G2-report.md` (sha256 `f7942aa1f987b1c377bd7fd90d941c702b81fe310a98f3ce7715a6ce759eb73b`, égal à `G2-report.md.sha256`), lu en entier (C-G2-1 à C-G2-4, P-1 à P-10, X-1 à X-8, mutants G-1 à G-17, formes éprouvées `g2-corrforms.test.ts`).
- **Base** : worktree `F:/Monark-wt-drand`, branche `lot/rpc-guard-drand-1a`, HEAD `9e285e8` inchangé ; à l'ouverture (15:52:19Z, `F:/tmp/dojo/drand-1a-corr-work/open.txt`) les sept fichiers du lot et ce journal égaux aux livrables du G1 (sha256 du §3) ; base de fusion avec le tronc `lot/etude-suite` (tête `4d5320c` à l'ouverture) : **`3416807`**, inchangée.
- **Horloge** (`date -u`) : 15:45:43Z orientation ; 15:52:19Z état d'ouverture ; advisor intégré avant toute écriture ; 15:56:00Z éditions (après essai à sec sur copie, `diff` conforme) ; 15:56:12Z → 15:56:35Z tests du lot, passage 1 ; 15:56:49Z → 15:57:19Z `tsc`, `eslint` ; 15:58:29Z ligne datée de l'ADR ; 15:58:47Z → 15:59:12Z passage 2 et suite `packages/rpc-guard/test` ×2 ; 15:59:26Z → 16:00:03Z deux clones `--no-local`, synchronisation, jonctions ; 16:03:08Z → 16:04:41Z mutants (après, puis avant) ; 16:05:19Z oracle mis en file derrière « corr PR-3b-1 » ; 16:05Z R-25 ; 16:06:06Z greps. Suite au §16.6.
- **Discipline** : aucun `git` écrivant dans le worktree (`status`, `rev-parse`, `log`, `diff`, `merge-base`, `branch --show-current`, tous `--no-optional-locks`) ; deux `git clone --no-local` jetables sous `F:/tmp/dojo/` ; **aucun appel réseau réel** (bouchon `fetch` et pièges socket/DNS du test ; hash default relu dans la copie locale de l'orchestrateur `F:/tmp/dojo/drand-info-default-drandsh.json`, sha256 `fcf35be5…d927`) ; rien sur C: (TEMP, TMP, TMPDIR sur `F:/tmp/dojo/drand-1a-corr-work/tmp` ou `F:/tmp/dojo/drand-1a-corr-mutants/tmp` à chaque `node` et `npm` ; cache npm `F:\cache\npm`) ; huit variables payantes retirées à chaque exécution ; suite complète et test 42 sous le seul verrou d'hôte « corr DRAND-1a ».

### 16.1 Décisions appliquées (liste fermée de la mission)

| Point | Fait | Où | Mutant tué par le lot |
|---|---|---|---|
| C-G2-1 (bloquante, ADR 14:06Z Q-3) | entrée littérale `"/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/1"` au tableau des refus du test (1), groupée avec les autres chaînes (l.48) : **25 refus par libellé** (24 au G1) ; en-tête l.5 amendé (le hash default est LU, FAITS l.33 ; la quasi-collision et le hash nul restent synthétiques) ; code inchangé (il refusait déjà la forme : P-4, X-7 du G2) | `drand-labels.test.ts` l.5, l.48 | K-1 (mien : hash default admis par alternance), tué par (1) |
| C-G2-2 (Q-6) | `assert.doesNotThrow` : un plafond valide nommant un opérateur non demandé (`drand-cf`, course sur `drand-pl`) est ignoré | test (2) l.116 | G-1, tué par (2) à l.116 |
| C-G2-3 | sur l'état que laisse le test (1) (`drand-pl` sous `drand-2026-09-27` : 1 `attempted` + 1 `refused:run_calls`) : `unlock` servi, puis course à plafond 2 : un appel admis, le suivant refusé (`BudgetExceededError`) ; prior épinglé à 1 exactement | test (1) l.80-82 | G-2, tué par (1) à l.82 |
| C-G2-4 | deux commentaires exacts, 0 ligne nette : l.36 « ALL required except the OPTIONAL `cycleAttempts` » ; l.81 « validated (an integer > 0), then ignored (stricter than runCaps / cycleFloor, ignored unvalidated) » | `client.ts` l.36, l.81 | (commentaires) |
| Q-G2-2 = oui (Q-7) | une course de cinq `drand-pl` sur un cycle neuf `drand-2026-09-29` par l'aide `course()` du test (2) (`maxCalls` 4, plafond 4, `unlock` servi) : la cinquième tentative voit mordre les deux plafonds, la ligne `refused` porte `run_calls` | test (2) l.110-111 | G-3, tué par (2) à l.111 |
| Q-G2-3 (orchestrateur) | ligne datée écrite à la fin de l'ADR (§4, où vivent les items et lignes datées), ajout seul : « fusion après RG-RECONCILE-1 ; rejeu des tests nommés, des mutants et de C-G2-3 sur la base portant RG avant le G7 » | ADR l.122-123 | — |

- Forme de Q-7 : le G2 proposait la forme X-8 (troisième course, `maxCalls` 1) à la suite de C-G2-3 dans le test (1) ; il y faut un `unlock` de plus (3 lignes). Retenu : le test (2), dont l'aide `course()` rend les verrous par l'`unlock` servi et porte déjà les limites du consommateur (`maxCalls` 4 = un passage, plafond 4) : 2 lignes, dans son propre bloc `offline` (bouchon `fetch` ; l'assertion des hôtes l.103 inchangée), cinq littéraux (jamais `Array(5).fill`, `any[]` hors cliquet).
- Aucune ligne de `transport.ts`, `ledger.ts`, `index.ts`, `exports.test.ts`, `bell-keys.test.ts` touchée (octet pour octet égaux aux livrables du G1).

### 16.2 Fichiers (état final du worktree ; aucun autre)

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `packages/rpc-guard/test/drand-labels.test.ts` | corrigé (non suivi) | 118 | `c9d44f502ce03cac1ce7fe6de882b314586598451d55772abcdacde93003f1f5` |
| `packages/rpc-guard/src/client.ts` | corrigé (commentaires) | 151 | `e9bef84f4b38b77267b09ae8e5573aaf737d0adb2a8a25a572938364ff63e692` |
| `docs/adr/ADR-RPC-GUARD-DRAND-1.md` | + ligne datée Q-G2-3 (ajout seul, préfixe octet pour octet égal à `3183f228…30c5`) | 123 | `19597946e6918f33eba8deeb9b87e63a36648dbfb3d7a33816e543e80cef7788` |
| `packages/rpc-guard/src/transport.ts`, `ledger.ts`, `index.ts`, `test/exports.test.ts`, `apps/bell/test/bell-keys.test.ts` | inchangés depuis le G1 | — | sha256 du §3 |
| `docs/G1-lot-rpc-guard-drand-1a.md` | ce §16 ajouté (préfixe égal au G1) | — | rendu hors du fichier |

- 0 octet CR, 0 caractère hors ASCII, 0 tabulation, 0 blanc final, LF final dans `drand-labels.test.ts` et `client.ts` (mesuré par `node`). Diff de correction (livrables du G1 → état final) : `evidence/corr.diff`, +11 −3 (test +8 −1, `client.ts` +2 −2, ADR +1 et une ligne vide).

### 16.3 R-25 (méthode `ci.yml:82` et `:90`, base `3416807`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé), lecture seule : **163** sur le worktree = sur le clone de l'oracle (sorties égales octet pour octet ; `r25-worktree-3416807.txt` sha256 `46323890e3b2cb7a8c1062720327328802b5b1c2255517366e34712ef6933fb9`). Code **38** (`transport.ts` 18, `client.ts` 13 + 1, `ledger.ts` 4, `index.ts` 2) ; tests **125** (`drand-labels.test.ts` 118, `exports.test.ts` 3 + 1, `bell-keys.test.ts` 2 + 1). Journal et ADR exclus par le pathspec.
- **Attendu 161, mesuré 163 : écart +2 déclaré.** `client.ts:36` est une ligne de la base (hors des ajouts du G1) : sa correction (C-G2-4) compte une insertion et une suppression sous la métrique de `ci.yml:90` ; la projection « 0 ligne nette » du G2 ne comptait pas ce couple. `client.ts:81` est une ligne du lot : neutre. **163 ≤ 170** ; STOP 1 150 à 987. Aucune coupe.

### 16.4 Tests

- Tests du lot (1)-(4) (fichiers `drand-labels.test.ts`, `exports.test.ts`, `bell-keys.test.ts`, worktree) : **15/15, deux passages** (15:56:12Z, 15:58:47Z ; `lot-tests-pass1.log`, `lot-tests-pass2.log`), les quatre noms ✔.
- Suite `packages/rpc-guard/test/*.test.ts` (worktree) : **101/101, deux passages** (15:58:57Z, 15:59:05Z ; `rpcguard-suite-1.log`, `rpcguard-suite-2.log`), 0 échec, 0 annulé, 0 sauté. Aucun test ajouté : des assertions dans les tests (1) et (2).
- `npx tsc --noEmit` exit 0 ; `npx eslint` des sept fichiers exit 0 ; les six règles du cliquet réactivées (`--rule …:error`, appliquées après la configuration comme l'`overrideConfig` de `scripts/lint-ratchet.mjs`) sur les trois fichiers de test du lot : **0 coup** (worktree et arbre des mutants) ; témoin positif sur l'arbre des mutants (fichier sonde `any`, créé puis retiré) : 3 coups, la mesure n'est donc pas décorative.

### 16.5 Mutants (copie hors dépôt `F:/tmp/dojo/drand-1a-corr-mutants/`)

- Arbre `F:/tmp/dojo/drand-1a-corr-mutants/tree` : `git clone --no-local --branch lot/rpc-guard-drand-1a F:/Monark` (HEAD `9e285e8`), sept fichiers corrigés copiés (`sync.sh`, `cmp` égal), jonctions par `mk-nm.ps1` (sha256 `d70d8aea…fbe4` ; `entries: 220  monark: 10  fail: 0`, `@monark/rpc-guard` résolu dans l'arbre même). Jamais le worktree.
- Harnais `mutants.mjs` (sha256 `c25b71532ce6cc0d07193468a6ccb5552994a51e10ed38b42d3436db3ddc6f6d`) : les **19 du G1 à leurs textes** (évalués tels quels depuis le harnais du G1, sha256 `1cb6f0a8…c5fc`, aucune recopie), **G-1, G-2, G-3 aux textes du G2** (importés de `g2-mutants-list.mjs`, sha256 `63cc8eee…02ba`), plus K-1 et K-2 (miens) ; ancres comptées à sec contre les fichiers corrigés (`anchors.mjs` `305bdf28…c0a9` : 24 mutants, 24 ancres, 0 écart) ; témoin d'abord (quatre tests verts) ; chaque cible lancée seule (`--test-name-pattern`, TAP) ; **tué seulement si le TAP porte `not ok N - <cible>`** ; fichier restauré puis contrôlé au sha256 après chaque mutant ; fichiers dorés égaux après la passe.
- **Passe « après »** (16:03:08Z → 16:04:12Z, `after/RESULTS.txt` sha256 `15efc4e7cc0d9f1bcc03d157c3ede415903e29cc28e9d664e2b4b211dfba0471`) : **les 19 du G1 tués par le test que l'ADR leur assigne (19/19)** : M-D1 à M-D4, P-1 à P-4 par (1) ; M-D5, M-D6, P-5 à P-9 par (2) ; M-D8a, M-D8b par (3) ; M-D7a, M-D7b par (4). **G-1, G-2, G-3 et K-1 tués par les tests du lot (4/4)**, chacun sur la ligne corrigée :

| Id | Mutation | (1) | (2) | (3) | (4) | Assertion qui tue | Avant (test du G1) |
|---|---|---|---|---|---|---|---|
| G-1 | Q-6 : un plafond valide nommant un opérateur non demandé refusé | survit | **tué** | survit | survit | l.116 « a valid cap naming an unrequested operator is ignored (Q-6) » | survit (1), (2) |
| G-2 | lignes `refused` (et `reconciled`) comptées au prior | **tué** | survit | survit | survit | l.82 : premier appel de la course à plafond 2 refusé `cycle_attempts` | survit (1), (2) |
| G-3 | Q-7 : `cycle_attempts` contrôlé avant `run_calls` | survit | **tué** | survit | survit | l.111 « Q-7: maxCalls 4 and cap 4 bite on the fifth call… » (`refused:cycle_attempts` au lieu de `refused:run_calls`) | survit (1), (2) |
| K-1 | hash de la chaîne default admis (alternance avec le littéral de FAITS l.33) | **tué** | survit | survit | survit | l.51 « drand-pl: '/8990e7a9…2ce/public/1' refused before any fetch » | survit (1), (2) |
| K-2 (observation) | validation du plafond sautée pour un opérateur non demandé | survit | survit | survit | survit | aucune : Q-C1 | — |

- **Passe « avant »** (16:04:35Z → 16:04:41Z, `before/RESULTS.txt` sha256 `a50fdcf3dd65eb90588525fe8be8538878a61789bea92e235032523610f7b259`) : le fichier de test du G1 (`38e76aaa…`) mis en place dans l'arbre, puis rendu (sha256 revérifié `c9d44f50…`) : G-1, G-2, G-3 et K-1 **survivent** aux tests (1) et (2) du G1 ; ce sont donc les lignes de cette passe qui les tuent.
- **K-2** : le commentaire corrigé (C-G2-4) affirme « validated (an integer > 0), then ignored » ; aucun test du lot ne l'épingle (au test (2) l.107, la valeur invalide porte aussi sur l'opérateur demandé ; le G2 le couvrait par sa sonde P-7). Asymétrie déclarée par le G2, non corrigée par mandat (C-G2-4 : commentaires seuls) : question Q-C1.

### 16.6 Oracle : sept gates sur clone, sous verrou d'hôte « corr DRAND-1a », test 42 à part

- **Arbre** : `F:/tmp/dojo/drand-1a-corr-work/clone` = `git clone --no-local --branch lot/rpc-guard-drand-1a F:/Monark` (15:59Z), HEAD `9e285e8a5ab1e9b7c2209d07178d16c854a199d5`, sept fichiers corrigés copiés (`sync.sh`, `cmp` égal ; sha256 égaux au worktree, `lot-sha-before.txt` = `lot-sha-after.txt` = worktree) ; `git status` de l'arbre : les sept seuls (`header.txt`) ; jonctions par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; Node v24.15.0 ; aucune sonde ni mutant dans cet arbre.
- **Scripts** (écrits à neuf sur le motif du G1, `F:/tmp/dojo/drand-1a-corr-work/`) : `locked.sh` (sha256 `89c2bab6…245e` : `mkdir` atomique de `F:/tmp/oracle-lock`, `owner.txt` « corr DRAND-1a », attente par pas de 60 s jusqu'à 90 min, retrait dans le piège EXIT, `node.exe` comptés à la mise en file, à la prise et au rendu), `run-oracle.sh` (`14145c65…4b05`), `t42.sh` (`063570ad…4491`), `oracle-all.sh` (`86c3ad33…2e1a`), `sync.sh` (`6fdeec7e…fcf1`), `nt.sh` (`e06df09c…4690`).
- **Processus de fond** : un seul, l'oracle (`bash locked.sh … oracle-all.sh`, PID 175560, lancé 16:05:19Z, `oracle/pid.txt`), terminé exit 0 à 16:24:01Z ; un moniteur de ses fichiers d'état, terminé avec lui. À 16:24:31Z : 0 `node.exe` et 0 `bash` rattachés aux arbres de cette passe (ligne de commande relevée).
- **Verrou et C-V-4** (`oracle/out-1/node-count.txt`) : mis en file 16:05:19Z derrière « corr PR-3b-1 » (pris 15:55:58Z) ; **pris à 16:10:20Z** après 300 s, **25 `node.exe` à la prise** ; sept gates 16:10:21Z → 16:20:07Z ; **23 au lancement du test 42** (16:20:07Z) ; **23 au rendu** ; verrou rendu à 16:24:01Z, répertoire absent ensuite. Une seule suite complète pendant la prise.

| Gate | Exit | Fin (`date -u`) | Journal (sha256) | Constat |
|---|---|---|---|---|
| `gate:vocab` | 0 | 16:10:22Z | `54da045d…b245` | « scanned 322 file(s), no forbidden claim » ; = G2 octet pour octet |
| `typecheck` | 0 | 16:10:30Z | `03481a8f…2051` | = G1 et G2 |
| `test` | 0 | 16:19:30Z | `df5ca85b…ebce` | **1 443 tests, 1 440 pass, 0 fail**, 0 annulé, 3 skipped préexistants (`sentinel_run_releases_chainstack_lock_on_sigterm`, `sentinel_instrument_out_win32_short_name`, `u4b_labels_replay_via_main_real_artifact`) ; = G2 au compte près ; ✔ tests (1)-(4), `error_preamble_carries_no_vocabulary_token`, `dojo_tick_before_0015_fetches_beacon_once`, `dojo_collect_reads_only_inside_the_window`, `fetch_only_inside_client`, `no_secret_in_repo`, `transport_3xx_on_get_operator_is_hard_stop_never_followed`, `ledger_format_locked_to_rebase_crosscheck` |
| `lint` | 0 | 16:19:46Z | `f845417c…4a4f` | = G1 et G2 |
| **`lint:ratchet`** | **0** | 16:20:03Z | `45ede4ce…6b42` | **« lint-ratchet: 69/69 (deferred-typing violations in the tests / committed ceiling, measured_on 2026-09-16) »** ; = G2 octet pour octet |
| `lang:gate` | 0 | 16:20:05Z | `b22ac8f8…0dd7` | 0 coup ; = G1 et G2 |
| `export:check` | 0 | 16:20:07Z | `2f9645a9…8f16` | = G1 et G2 |

- **Test 42 à part**, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts`, 16:20:07Z → 16:24:00Z ⇒ **exit 0, `tests 2, pass 2, fail 0`** ; `export_public_no_governance_no_french` ✔ en 233 s ; `export_public_derived_jobs_are_byte_identical` ✔ (`t42/test42.log` sha256 `309b65679f4eeb89d6b0b44808676762bae6eaae512071747d15b48265bc8fbd`).
- Jonctions des deux clones (oracle, mutants) retirées par `rm-nm.ps1` (sha256 `b51b5d22…8749`, `removed` ×2, 16:24:55Z) ; `F:/Monark/node_modules` intact : 220 entrées avant et après, `@monark` 10.

### 16.7 Aucun réseau (greps sur les lignes ajoutées, `evidence/greps.txt`)

- Diff de correction (`corr.diff`) : `fetch(`, `https://`, `node:`, `process.env` : **0** ligne ajoutée. Diff du lot entier (`lot.diff`, 155 lignes ajoutées contre `HEAD`) : `fetch(` 0 ; `https://` 3 (la résolution de la table privée `transport.ts`, une entrée refusée et l'URL attendue du test : inchangées depuis le G1) ; `http://`, `node:http`, `undici`, `child_process`, `node:tls`, `WebSocket`, `process.env`, `XMLHttpRequest` : 0 ; `node:net` et `node:dns` : un import chacun, pour armer les pièges.
- Les trois blocs ajoutés qui appellent le transport (C-G2-3, Q-7) tournent sous `offline(…)` (bouchon `fetch`), pièges socket et DNS armés à l'import du fichier. Aucun appel réseau réel pendant la passe ; aucun navigateur ; aucun PDF.

### 16.8 Écarts déclarés, et ce que je n'ai pas fait

- **Commande de plus de 6 Ko (une)** : l'écriture du harnais `mutants.mjs` par heredoc (6 106 octets, commande ≈ 6,3 Ko) dépasse la règle « commandes < 6 Ko » ; fichier contrôlé ensuite (`node --check`, 8 antislashs attendus et comptés, 65 lignes, fin intacte) avant toute exécution. Toutes les autres commandes : < 6 Ko (la plus longue, un ajout à ce journal : 5 161 octets de heredoc ; l'ajout du §16.6, 8 082 octets, joint un heredoc de 3 704 octets et la copie par `cat >>` d'un fichier préparé de 4 378 octets).
- **Fichier sonde transitoire dans le worktree** : 15:57Z, premier témoin positif du cliquet, `packages/rpc-guard/test/zz-probe-any.test.ts` créé puis retiré dans la même commande (mesure nulle : formateur `unix` absent d'`eslint`) ; `git status` du worktree identique avant et après ; le témoin a été refait sur l'arbre des mutants (§16.4).
- **Commande sans effet** : un contrôle de la fonction de comptage des `node.exe` a sourcé par erreur la ligne 4 de `locked.sh` (`mkdir -p ""` : échec, rien créé) ; la ligne 5 a ensuite été contrôlée (comptage correct).
- Non fait, par mandat : aucune ligne hors de la liste fermée (`transport.ts`, `ledger.ts`, `index.ts`, `exports.test.ts`, `bell-keys.test.ts` inchangés ; K-2 non épinglé : Q-C1) ; aucune fusion ni reprise sur RG-RECONCILE-1 (Q-G2-3 : hors de ma charge ; la ligne datée de l'ADR la consigne) ; rien de 1b (`apps/dojo/**`, test (5), M-D9, M-D10, TU-B) ; aucun `git add/commit/stash/checkout` ; jonctions `node_modules` du worktree gardées (ADR 14:06Z : jusqu'au G7).
- **Hors verrou** (précédent du G1 §11 et du G2) : les passes au niveau du fichier ou du paquet (tests du lot ×2, suite `packages/rpc-guard/test` ×2, `tsc`, `eslint`, règles du cliquet, deux passes de mutants) ont tourné hors du verrou d'hôte, en partie pendant la prise de « corr PR-3b-1 » ; la suite complète `npm test` et le test 42 n'ont tourné que sous le verrou « corr DRAND-1a » (§16.6).

### 16.9 Questions formées (aucun « dû » nu)

- **Q-C1 (orchestrateur ; K-2, C-G2-4)** : le commentaire corrigé de `client.ts:81` affirme qu'un plafond nommant un opérateur non demandé est validé avant d'être ignoré ; aucun test du lot ne l'épingle (K-2 survit à (1)-(4) ; sonde P-7 du G2 seule). Épingler (+1 ligne au test (2), forme : `assert.throws(() => openGuardedClient({}, { ...limits(4), cycleAttempts: { "drand-pl": 4, "drand-cf": 0 } }, dir, { "drand-pl": "drand-q6b" }), BudgetExceededError, …)`, R-25 164, K-2 tué par (2)) ou garder l'asymétrie déclarée (G2 §6 : plus stricte que Q-6, fail-closed) ? Déclencheur : G7 de 1a ; propriétaire : l'orchestrateur.
- **Rappel (règle PAROXYSME, O-7 du G2)** : les résiduels déclarés de D-3 (TY-1 « jour perdu », TY-8 « résiduel déclaré ») sont à vérifier au registre PAROXYSME par l'orchestrateur avant le G7 du lot ; TY-2 et TY-7 sont couverts par DRAND-CAP-REVISIT-1 et les actes P-3, P-4, P-5 de l'ADR. Aucune action de cette passe.

### 16.10 `error_origin` proposés (à assigner au G7)

| Point | `error_origin` proposé |
|---|---|
| C-G2-1 | orchestrateur (FAITS l.21 tronqué, repris par D-1 au G0 ; Q-3 formé par le G1, servi 14:04:53Z) : pas une erreur de génération |
| C-G2-2, C-G2-3 | générateur du G1 (choix déclarés §4 points 3 et 5, sans test de la branche) |
| C-G2-4 | générateur du G1 (commentaires) |
| Q-G2-2 (Q-7) | générateur du G1 (ordre déclaré §4 point 4, non épinglé) |
| R-25 163 contre 161 attendu | relecteur G2 (projection « 0 ligne nette » d'une ligne de base) ; sans effet sur la borne 170 |

### 16.11 Livraison

`F:/tmp/dojo/drand-1a-corr-deliver/` (script `F:/tmp/dojo/drand-1a-corr-work/deliver.sh`) : les sept fichiers du lot, l'ADR et ce journal (arborescence du dépôt, relus contre le worktree) ; `evidence/` : état d'ouverture, R-25 (worktree et clone), journaux des tests (lot ×2, suite ×2, `tsc`, `eslint`, règles du cliquet et témoin positif), `lot.diff`, `corr.diff`, `greps.txt`, spécification et outil des éditions (`spec-test.txt`, `apply.mjs`), comptes de `node_modules` ; `evidence/mutants/` (harnais, contrôle des ancres, `after/RESULTS.txt`, `before/RESULTS.txt`, journaux) ; `evidence/oracle/` (`header.txt`, `exits.txt`, `node-count.txt`, `lot-sha-before.txt`, `lot-sha-after.txt`, journaux des gates courts, résumé de `test`, `t42/`) ; `evidence/scripts/` ; `DELIVERED.sha256`. TAP par mutant et journaux complets de l'oracle : restés sous `F:/tmp/dojo/drand-1a-corr-mutants/{after,before}/` et `F:/tmp/dojo/drand-1a-corr-work/oracle/out-1/`. sha256 de ce journal : rendu hors du fichier (`DELIVERED.sha256`).

### 16.12 Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : formes du G2 reprises (C-G2-1 : une ligne, en-tête amendé sur place ; C-G2-3 : `unlock` d'abord, `c` tenant encore `drand-pl.lock` ; C-G2-2 : `doesNotThrow`) ; Q-7 au test (2) par `course()`, dans son propre bloc `offline`, cinq littéraux ; `client.ts:36` ligne de base ⇒ R-25 163 attendu, déclaré plutôt qu'esquivé ; ligne de l'ADR en fin de fichier, ajout seul, ADR ajouté aux livrables ; TEMP sur F: pour chaque `node`, pas de double antislash, commandes < 6 Ko ; ancres des mutants contrôlées à sec, matrice à quatre cibles pour les nouveaux, K-1, passe « avant » bornée ; oracle en fond, PID consigné, seul processus de fond. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation avant la remise : rendue hors du fichier.

### 16.13 `git status --short` final (worktree, `--no-optional-locks`)

```
 M apps/bell/test/bell-keys.test.ts
 M docs/adr/ADR-RPC-GUARD-DRAND-1.md
 M packages/rpc-guard/src/client.ts
 M packages/rpc-guard/src/index.ts
 M packages/rpc-guard/src/ledger.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/exports.test.ts
?? docs/G1-lot-rpc-guard-drand-1a.md
?? packages/rpc-guard/test/drand-labels.test.ts
```
