claude-opus-5-5

# ADR-DOJO-PR-1B-4 : MONARK Dōjō, pièce 1, piste A — vérificateur par URL et par jour (DOJO-VERIFY-URL-1) : `dojo-verify.mjs --url`, `--day`, contrat de sortie lu par la CA (G0 de lot, plan de sprint sans code)

- **Statut** : proposé (G0 de lot) ; checkpoint-1 bref du validateur-humain dû avant le G1 (CHANTIERS du tronc l.2115 : « Suite : cp-1 bref, puis G1 ; débloque PR-3b-2 »). Ce document n'écrit ni code ni test, ne committe rien, n'émet aucun appel réseau (R-20 ; mission).
- **Dates** : reçu de mission 2026-09-29T22:20:57Z ; `date -u` 22:21:14Z (sha256 de la mission recalculé), 22:23:20Z (lectures), 22:38:49Z (première consultation advisor ; lectures de CHANTIERS l.2043-2103 poursuivies jusqu'à 22:46:39Z), 22:46:39Z (début de l'écriture) ; sha256 final rendu hors du fichier (journal `docs/G0-lot-dojo-pr1b4.md`).
- **Propriétaires** : l'orchestrateur `claude-fable-5-1` (planificateur) pour D-1 à D-5, Q-1 et Q-2 ; le validateur-humain pour le checkpoint-1 bref ; aucune question à l'investisseur.
- **Rattachement** : mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (1 363 l., sha256 `562d9be7…a69f0c`, égale au tronc et à la base) : D-9 l.254, D-10 l.258-262, TU-5 l.360 et l.371, règle Branchement l.377, §7 l.505 et l.511, §11 l.704 (DOJO-VERIFY-URL-1) et l.705 (DOJO-VERIFY-SCALE-1), table des emplois des codes par le vérificateur l.1034-1063, onzième pli C-1 l.1156 ; plan `docs/PLAN-DOJO-PAGE-1.md` (`87db0cd9…8154`) l.56, l.82, l.250 ; `docs/adr/ADR-DOJO-PR-3.md` (`f1f0e12c…3526`) l.83-84 (DOJO-CA-FORMAT-1), l.135, l.149, l.203-204, l.217, l.274, l.276 ; `docs/adr/ADR-DOJO-PR-2.md` (`6acbdc5a…e324`) l.330, l.341, l.498, l.515 ; `docs/CHECKPOINT1-lot-dojo-pr3.md` (`3b1b89c4…de3a`) §3 (b) ; `docs/adr/ADR-DOJO-PR-4.md` (`d1b5bf35…eea7`) l.107, l.114-120 ; complément de l'orchestrateur (décision 275) : DOJO-VERIFY-BREAKS-1, rapport G2 de PR-3a-1a `F:/tmp/dojo/g2-pr3a1a/G2-report.md` (251 l., sha256 `1a3ed4e0…85be15`, recalculé) l.61, l.204, l.217.
- **Notation** : « D-n », « T-n », « TY-n », « É-n », « Q-n » désignent ce document ; « mère D-n » la mère ; « ADR PR-n » les G0 voisins. Mutants nouveaux : M-U1 à M-U10 (transport), M-D1 à M-D6 (jour), M-B1 (ruptures), M-C1 et M-C2 (contrat).
- **Rédaction** : worker `claude-opus-5-5` (R-1), effort high (mission), contexte frais ; mission `F:/tmp/dojo/mission-g0-pr1b4.md` (5 440 o.), sha256 `838b6be2ab9fa2ea8052640430ccd8d264cd9ea0f5100559ad5cb21274026b9a`, égal au reçu `F:/tmp/dojo/mission-g0-pr1b4.recu.json` (verdict vert, 12 codes à 0).
- **Base** : worktree `F:/Monark-wt-dojo-pr1b4`, branche `lot/dojo-pr1b4`, HEAD `7d9e413eee466eb5a740baaf1547d10f172d9a2b`, verrouillé ; `git status --porcelain` à l'ouverture : 0 ligne (arbre propre). Tronc `F:/Monark` à `842178b3` = base + un commit de registres (CHANTIERS, FILE-ATTENTE, PASSATION ; aucun code). Toute référence de code `fichier:n` est lue à `7d9e413e`.

## 0. Décisions, une ligne chacune

- **D-1 (`--url <base>`)** : grammaire `node dojo-verify.mjs (<arbre servi> | --url <base>) (--keyring <fichier> | --self-consistent-only) [--address <adresse>] [--day <AAAA-MM-JJ>]` ; transport de `bell-verify.mjs:30-68` recopié en onze règles, chacune avec un code de D-10, dont deux divergences déclarées (`?` et `#` refusés dans la base ; `detail` sans valeur) ; le seul `fetch` du module vit dans `urlSource` ; quatre formes de chemins en liste fermée ; bornes par corps (64 Mio, 1 Mio, 30 s par GET) et totales provisoires (1 024 fichiers, 2 Gio), fixées par la mesure de DOJO-VERIFY-SCALE-1.
- **D-2 (`--day <jour>`)** : la vérification reste entière (marche, F-1 relative à la tête, lignes de chaque `snapshot` jusqu'à la tête) ; puis la cible est le `snapshot` du jour D : ses lignes, sa racine signée recalculée, rapportées sous `target` ; `--address` prouve contre la racine de D ; refus `line_missing` (emploi étendu) avant l'ancre, après la tête (« futur » = après la tête servie, aucune horloge lue), sans `snapshot`.
- **D-3 (contrat)** : une ligne JSON canonique sur stdout pour tout verdict, exit 0 ssi `ok` ; 18 clés fermées = les 15 d'aujourd'hui + `breaks` (DOJO-VERIFY-BREAKS-1, inclus), `target`, `timeline_sha256`, exportées par `DOJO_VERIFY_REPORT_KEYS` ; mappage clé par clé vers DOJO-CA-FORMAT-1 (`c03_dojo_verify_keyring_root`, `c11_head_and_history_recomputed`) ; test d'intégration non-LLM sous `test/` ; la pièce reste `upcoming`.
- **D-4 (DOJO-TMP-STRAY-1)** : routé hors de ce lot, à DRAND-RELAY-GET-1b (collecteur), déclencheur G1 de DRAND-1b, avant A-5 ; motif : défaut du collecteur (`layout.ts`), cas atteignable = deux processus (RUNBOOK-dojo §8), famille de DOJO-COLLECT-SIGTERM-UNLOCK-1 ; alternative en lot chiffrée (≈ +25) ; question Q-1.
- **D-5 (preuves)** : huit tests nommés (sept sous `apps/dojo/test/`, un sous `test/`), dix-neuf mutants nommés, F2P à la base, rejeu par nom de `dojo_collect_to_verify_end_to_end` au G7 (C-V-4 (b)) ; R-25 ≈ 236 ascendantes (≈ 496 à ×2,1, ≈ 545 à ×2,31), coupe au-delà de 547 ; menaces TY-1 à TY-9 ; neuf items.

## 1. Contexte mesuré

### 1.1 Ce que la mère, le plan et les G0 voisins fixent

- Mère D-10 l.258 : CLI d'origine `(--url <base> | --dir <dir>) --keyring <fichier> [--address <adresse>] [--day <jour>]`, « sources et bornes comme `bell-verify.mjs` (l.30-68) » ; l.260 : liste fermée de 45 codes, lue par deux tests par le début de sa ligne ; l.262 (neuvième pli) : CLI livrée par PR-1b-2 (arbre servi en argument positionnel, `--keyring` XOR `--self-consistent-only`, `--address`), `--url` et `--day` renvoyés à DOJO-VERIFY-URL-1, aucun code nouveau.
- Mère l.704 (DOJO-VERIFY-URL-1) : `--url <base>` (https partout, http sur boucle locale seule, aucune redirection suivie, corps bornés), `insecure_url`, `redirect_refused`, `http_status` déjà dans D-10, `--day` pour la preuve d'un jour passé ; porté par PR-1b-4 (piste A, plan C-1), dépendance réelle du G1 de PR-3b-2, déclencheur G7 de PR-1b-4. L.705 (DOJO-VERIFY-SCALE-1) : coût O(S × N × d), mesure sur un arbre synthétique de 10^4 puis 10^5 adresses, déclencheur G1 de PR-3b-2.
- Mère D-9 l.254 : disposition servie `/timeline.jsonl`, `/dojo/pubkey.json`, `/lines/<sha256>.jsonl`, `/history/<sha256>.jsonl`, aucun listage ; la synchro de PR-4a-2 GET les mêmes corps. TU-5 (l.360, treizième pli) : consommateur réel `verify-dojo.mjs` lançant `dojo-verify --url`, composé en test au G7 de PR-3b-2, servi à l'annonce (QI-4 (c)) ; l.371 : composé en test par `dojo_verify_cli_is_fail_closed`.
- Plan l.56 (C-1) : PR-1b-4 → G1 de PR-3b-2 ; l.82 : piste A, ≈ 120 ascendantes (≈ 252 à ×2,1), estimation du planificateur ; l.250 (C-V-4 (b)) : PR-1b-4 ∥ PR-2-2, le G7 fusionné en second rejoue `dojo_collect_to_verify_end_to_end`. PR-2-2 est fusionnée (`4e89620`, ADR PR-3 l.274) : PR-1b-4 fusionne en second.
- ADR PR-3 l.83 : `verify-dojo.mjs` lance le vrai `dojo-verify.mjs --url --keyring <trousseau committé>` ; l.84 (DOJO-CA-FORMAT-1, gelé) : `head` {`seq`, `day`, `lines_sha256`, `lines_count`, `recomputed_root`}, `history` {`history_sha256`, `history_lines_count`, `history_root`} ou `null`, `bodies_sha256`, contrôles `c03_dojo_verify_keyring_root`, `c07_tls_authorized`, `c11_head_and_history_recomputed` ; l.149 : `verify_dojo_ca_runs_real_dojo_verify` (PR-3b-2).

### 1.2 Code relu (au `7d9e413e` ; sha256 au journal)

- `apps/dojo/scripts/dojo-verify.mjs` (355 l.) : une seule source, `dirSource` l.40-51 (`get(rel)` rend les octets ; `unreachable`, `too_large`) ; `VERIFY_BOUNDS` l.37 (64 Mio par corps, 1 Mio par ligne, aucun délai) ; un fichier de lignes lu par `snapshot` (l.251-293) et le fichier d'historique (l.231-247) ; formes hex64 contrôlées avant toute lecture (`lines_sha256` l.202 ; `history_sha256` par le marcheur, `dojo-chain.mjs:116`) ; rapport l.303-309 : 15 clés, `head` sans `day` (le `day` de premier niveau est celui de la tête), sans `breaks`, que `walkDojoTimeline` rend pourtant (`dojo-chain.mjs:133`, `:150`, `:167`) ; CLI l.323-353 : une ligne `canonical` sur stdout pour tout verdict, exit 0 ssi `ok`, usage et faute fatale sur stderr seul (exit 1) ; `detail` : « names a file, a line or a field, never a value » (l.17). Aucune occurrence de `fetch` ni de `breaks` (deux méthodes : `git grep` au `7d9e413e` et `grep -c` du blob).
- `apps/dojo/test/dojo-verify.test.ts` (430 l., 19 tests) : l.91-96 interdit dans le module `fetch(`, `node:http(s)`, `node:net`, `node:tls`, `node:dns`, `child_process`, `import(`, `require(`, `process.env` ; CLI lancée par `spawnSync` (l.70) ; l.424-429 : `DOJO_VERIFY_REFUSALS` égal à la ligne D-10 de la mère, et toute raison vue appartient à D-10.
- `apps/bell/scripts/bell-verify.mjs` (137 l.) l.25-68 : bornes chiffrées et motivées (`TIMEOUT_MS` 30 s = `DEFAULT_TIMEOUT_MS` de rpc-guard, `packages/rpc-guard/src/transport.ts:40`) ; `urlAllowed` lu sur la chaîne brute ; `urlSource` : barres finales retirées, un GET par fichier, `redirect: "manual"`, `opaqueredirect` ou 3xx ⇒ `redirect_refused`, statut autre que 200 ou corps nul ⇒ `http_status` (`detail` « chemin: statut »), compte en flux ⇒ `too_large`, minuteur couvrant en-têtes et corps levé en `finally`, toute autre faute ⇒ `unreachable` ; son motif d'hôte admet `?` et `#` juste après l'hôte ; l.115 : `breaks: w.breaks`. Test précédent `apps/bell/test/bell-verify.test.ts:83-104` : serveur de boucle locale, cible de redirection jamais demandée, borne abaissée, serveur muet à 200 ms sous garde de course de 5 s (l.101).
- `scripts/verify-bell.mjs` (244 l.) l.20-23, l.90-97, l.162-165 : le contrôle 5 lance la CLI `--url --keyring` par `execFile` asynchrone (délai 180 000 ms) et passe ssi exit 0 et `status` = `consistent_with_supplied_keyring` ; le vrai vérificateur est éprouvé sous `test/` (`test/verify-bell.test.ts:196`, `:227`).
- Consommateurs de la bibliothèque, à ne pas casser : `apps/site/lib/dojo-served-load.ts:233-235` (lit `ok`, `reason`, `seq`, `detail`, `head.recomputed_root`, `history.recomputed_root`), `test/dojo-served.test.ts:206-208`, `test/dojo-page.test.ts:21-26`, `apps/dojo/test/dojo-collect.test.ts:491` (`dirSource`, `verifyDojoServed`) et l.506-507 (refus du collecteur hors des 45).
- `apps/dojo/src/layout.ts` (97 l.) : `writeAtomic` l.28-32 (`<cible>.tmp` puis renommage) ; `closeLayout` l.41-49 ; `readDayLayout` l.89-92 refuse tout fichier de `readings/` ou `publish/` hors liste (`layout_stray_file`). `docs/RUNBOOK-dojo.md` §8 (l.257-275) : consigne d'hôte en vigueur ; un `.tmp` n'y survit que si aucune écriture de la même cible ne vient (second processus arrêté après le renommage de l'autre) ; « Code fix: PR-1b-4 » (l.263).

### 1.3 Écarts relevés

- **É-1** : la mission dit « contrôle 5 » (numérotation de `verify-bell.mjs`, `c05_bell_verify_keyring_root`) ; DOJO-CA-FORMAT-1 nomme le calque Dōjō `c03_dojo_verify_keyring_root`, et `c11_head_and_history_recomputed` lit `head` et `history` : ce document dit c03 et c11.
- **É-2** : DOJO-CA-FORMAT-1 veut `head.day` et `history.history_root` ; le rapport porte `day` au premier niveau et `history.recomputed_root` : mappage au D-3, aucun renommage (le site et deux tests lisent `recomputed_root`).
- **É-3** : le motif d'hôte de Bell admet `?` et `#` après l'hôte ; une base qui en porte ferait demander un autre chemin que `<base>/<rel>` : divergence déclarée (T-2).
- **É-4** : Bell écrit le statut HTTP dans le `detail` ; la convention Dōjō (l.17 ; ADR PR-2 D-8, ligne C-V-1 (b)) exclut une valeur : `detail` = le chemin seul (T-5), divergence déclarée.
- **É-5** : le test de PR-1b-2 interdit `fetch(` (l.94) : il est amendé (T-10), jamais retiré.
- **É-6** : plan ≈ 120 ascendantes (l.82) contre ≈ 236 ici (§5) : le plan ne comptait ni les bornes totales, ni la liste fermée, ni `breaks` (item postérieur), ni le test sous `test/`, ni le `.d.mts`.
- **É-7** : facteur de dérive ×2,1 de la règle (mère l.505 : 547 × 2,1 = 1 148,7) ; mesurés depuis : ×2,19 (PR-1b-3, ADR PR-2 l.498) et ×2,31 (PR-3b-1, ADR PR-3 l.276, « cause à nommer ») : item R25-FACTOR-DRIFT-1.
- **É-8** : DOJO-TMP-STRAY-1 est routé « code à PR-1b-4 » (ADR PR-2 l.515, ADR PR-3 l.274, RUNBOOK l.263) ; D-4 le route ailleurs, sous Q-1.

## 2. Décisions

### D-1 : `--url <base>`

- **Grammaire, fermée** : exactement une source, l'arbre servi (argument positionnel de PR-1b-2) ou `--url <base>` ; exactement une racine, `--keyring <fichier>` ou `--self-consistent-only` (inchangé) ; `--address <adresse>` et `--day <AAAA-MM-JJ>` facultatifs, avec l'une ou l'autre source. Zéro ou deux sources, drapeau répété ou inconnu, valeur absente ou commençant par `--`, `--day` hors forme ⇒ usage (stderr `dojo/verify: usage: …`, stdout vide, exit 1). Le `--dir` de la mère (l.258) est l'argument positionnel (l.262) : aucun second nom. Bibliothèque : `urlSource(base, bounds)` exporté ; `verifyDojoServed({source, keyring, address, day, bounds})`, `day` facultatif et nul par défaut (signature additive).
- **Transport** (règles de `bell-verify.mjs:30-68`, chacune avec son code de D-10) :

| Règle | Contenu | Code | Source (`bell-verify.mjs`, sauf mention) |
|---|---|---|---|
| T-1 | lue sur la chaîne brute, avant toute normalisation : `https://` (schéma sans égard à la casse, comme Bell) puis un hôte non vide sans barre, `?`, `#`, `@`, blanc ni barre oblique inverse ; `http://` seulement vers `127.0.0.1` ou `[::1]`, port facultatif de 1 à 5 chiffres ; sinon refus, avant toute requête | `insecure_url`, `detail` `--url` | l.30-32, l.49 |
| T-2 | divergence (É-3) : aucun `?` ni `#` dans toute la base | `insecure_url` | ce G0 |
| T-3 | barres finales retirées ; chaque requête vise exactement `<base>/<rel>` | — | l.50 |
| T-4 | un GET par fichier, `redirect: "manual"` ; `opaqueredirect` ou statut 3xx ⇒ refus ; la cible n'est jamais demandée | `redirect_refused` | l.55-56 |
| T-5 | statut autre que 200 ou corps nul ⇒ refus ; `detail` = le chemin, jamais le statut (É-4) | `http_status` | l.57 |
| T-6 | corps lu en flux, compte cumulé ; au-delà de `MAX_BODY_BYTES`, refus ; `content-length` jamais lu | `too_large` | l.58-60 |
| T-7 | un minuteur par GET (`TIMEOUT_MS`) couvre en-têtes ET corps, levé en `finally` ; délai échu, faute réseau, DNS ou TLS ⇒ refus | `unreachable` | l.53, l.62-65 |
| T-8 | chemin demandé dans la liste fermée : `timeline.jsonl`, `dojo/pubkey.json`, `lines/<64 hex minuscules>.jsonl`, `history/<64 hex minuscules>.jsonl` ; tout autre ⇒ refus avant toute requête (défense en profondeur : formes déjà contrôlées, `dojo-verify.mjs:202` et `dojo-chain.mjs:116`) | `insecure_url`, `detail` le chemin | mère D-9 l.254 |
| T-9 | aucun en-tête posé, aucune option TLS (ni agent ni répartiteur) : la validation du certificat est celle du runtime | — | TY-4 |
| T-10 | le module porte exactement un appel `fetch(`, dans le corps d'`urlSource` ; `fetch` est le global du runtime, aucun import nouveau ; le reste de la liste interdite (l.94) est inchangé | — (test 7) | É-5 |
| T-11 | la source d'arbre local est inchangée ; les bornes totales s'appliquent aux deux sources | — | `dojo-verify.mjs:40-51` |

- **Bornes** (`VERIFY_BOUNDS`, valeur et motif, forme de `bell-verify.mjs:25-28`) :

| Borne | Valeur | Motif | Refus |
|---|---|---|---|
| `MAX_BODY_BYTES` | 64 Mio par corps | inchangée ; un jour de lignes pèse 26,7 Mio à N = 10^5, K = 4 (mère l.229) | `too_large`, `detail` le chemin |
| `MAX_LINE_BYTES` | 1 Mio par ligne de chronologie | inchangée | `too_large` |
| `TIMEOUT_MS` (nouvelle) | 30 000 ms par GET | calque de Bell = `DEFAULT_TIMEOUT_MS` de rpc-guard (`transport.ts:40`) | `unreachable` |
| `MAX_FILES` (nouvelle, totale) | 1 024 fichiers par vérification (GET émis, ou fichiers ouverts par l'arbre local), compte vérifié AVANT d'émettre ou d'ouvrir le suivant | 3 fixes + 1 021 `snapshot` : ≈ 2,8 ans d'un `snapshot` par jour, contre un horizon d'ancre de 365 (ADR PR-3 D-4 l.100) ; provisoire | `too_large`, `detail` `total files` |
| `MAX_TOTAL_BYTES` (nouvelle, totale) | 2 Gio (2 147 483 648 o) | 1 021 jours à ≈ 313 Kio (N = 1 144 mesuré, K = 4, ADR PR-2 l.330 [calc]) ≈ 312 Mio, marge ×6,5 ; ≈ 767 jours à N = 10^4 (2,67 Mio par jour, mère l.229) ; provisoire | `too_large`, `detail` `total bytes` |

- Les deux bornes totales sont **provisoires** : la mesure de DOJO-VERIFY-SCALE-1 (déclencheur inchangé, G1 de PR-3b-2) les fixe par ligne datée (Q-2). Durée au pire = fichiers × `TIMEOUT_MS` (1 024 × 30 s ≈ 8 h 32) : le délai `execFile` du consommateur (180 000 ms chez Bell, `verify-bell.mjs:93`) est un paramètre de PR-3b-2, dimensionné par la même mesure (consigne transmise). `VERIFY_BOUNDS` gagne trois clés : le test d'identité `DOJO_LIVE_BOUNDS` = `VERIFY_BOUNDS` d'ADR PR-4 l.107 les verra (item DOJO-LIVE-BOUNDS-KEYS-1).
- **Alternatives rejetées** : importer `urlSource` de Bell (fichiers de Bell gelés dans les lots Dōjō, mère l.703 ; codes et convention de `detail` différents) ; `node:https` direct (plus de code, aucun gain : T-4 à T-7 tiennent avec `fetch`) ; suivre une redirection vers le même hôte (la disposition servie n'en porte aucune : une redirection est une anomalie à nommer).

### D-2 : `--day <jour>`

- **Ce qui est vérifié** : exactement ce qu'un appel sans `--day` vérifie (marche sous la racine fournie, versions, historique, lignes de chaque `snapshot` jusqu'à la tête, règle F-1 relative à la tête, mère l.262). `--day` n'est lu qu'après ce succès : un arbre refusé l'est avec son code, quel que soit D.
- **Quelles lignes, quelle racine, quelle tête** : la tête reste le dernier `snapshot` (`head` inchangé). La cible est l'unique `snapshot` dont `day` = D (unicité tenue par `day_not_increasing`) ; ses lignes = `lines/<lines_sha256 de D>.jsonl`, déjà relues et recalculées par la boucle (`dojo-verify.mjs:251-293`) ; sa racine = la `root` signée de D, égale à la racine recalculée (sinon `root_mismatch` plus tôt). Rapport : `target` = {`seq`, `day`, `lines_sha256`, `lines_count`, `recomputed_root`} de D ; le `day` de premier niveau reste celui de la tête sous `--day` (la CA le lit pour `head.day`, D-3). Avec `--address`, `inclusion` (même forme qu'aujourd'hui) est calculée dans le fichier de D contre la racine de D.
- **Refus**, après le succès de la vérification, code `line_missing` (emploi étendu ; précédent `--address`, mère l.1053) ; `seq` et `day` = ceux de la tête, `seq` = dernière ligne sans tête (comme `dojo-verify.mjs:298`) ; `detail` en anglais (porte de langue) : D avant le jour de la première ancre (jour UTC de son `published_at`, `dojo-verify.mjs:97`) ⇒ `--day: before the anchor's day` ; aucune tête, ou D après le jour de la tête ⇒ `--day: after the head's day` ; sinon aucun `snapshot` de ce jour (jour d'ancre, jour manquant) ⇒ `--day: no snapshot of that day`. « Futur » se lit par rapport à la tête SERVIE : le vérificateur ne lit aucune horloge, le même arbre rend le même verdict tout jour.
- **Forme** : la CLI n'admet que `AAAA-MM-JJ` à aller-retour exact (règle `dayOk`, `dojo-verify.mjs:95-96`) ; aucun jour voisin, aucun préfixe, aucun fuseau local ; hors forme ⇒ usage. La bibliothèque, qui reçoit `day` sans la CLI, traite un jour hors forme comme un jour sans `snapshot` (`line_missing`, `--day: no snapshot of that day`, sans comparaison à l'ancre ni à la tête).
- **Jours d'historique** (au plus le jour d'ancre) : refusés (« before the anchor's day », ou « no snapshot » pour le jour d'ancre) ; une preuve contre `history_root` par la même fonction de chemin est possible : limite déclarée, item DOJO-VERIFY-HISTORY-DAY-1.
- **Alternative rejetée** : tronquer la vérification à D (moins de fichiers lus) : statut partiel nouveau, règle F-1 à redéfinir, verdict « cohérent jusqu'à D » d'un arbre incohérent après D ; le coût relève de DOJO-VERIFY-SCALE-1.

### D-3 : contrat avec le consommateur (`scripts/verify-dojo.mjs`, PR-3b-2)

- **Sortie** (inchangée depuis PR-1b-2) : stdout = exactement une ligne, `canonical(rapport)` + LF, pour un succès comme pour un refus ; exit 0 ssi `ok: true` ; exit 1 pour un refus (ligne sur stdout) et pour l'usage ou une faute fatale (stdout vide ; stderr `dojo/verify: usage: …` ou `dojo/verify: fatal: <nom>`). Divergence avec Bell, dont les refus vont à stderr (`bell-verify.mjs:119-133`).
- **Clés fermées d'un succès (18)**, dans l'ordre de `canonical` : `active_key_id`, `beacon_bls_verified`, `breaks`, `day`, `detail`, `head`, `history`, `inclusion`, `ok`, `reason`, `scope`, `seq`, `snapshots`, `status`, `target`, `timeline_sha256`, `trust_root`, `voided_lines` ; exportées, figées, par `DOJO_VERIFY_REPORT_KEYS` (le consommateur et les tests les lisent, aucune copie). **D'un refus (5, inchangées)** : `ok`, `reason`, `seq`, `day`, `detail`.
- **Clés nouvelles** : `breaks` = liste de {`seq`, `lost_key_id`, `new_key_id`} rendue par le marcheur (`dojo-chain.mjs:150`), `[]` sans rotation rompue (DOJO-VERIFY-BREAKS-1 : calque de `bell-verify.mjs:115` ; une rotation `broken` n'est aujourd'hui visible qu'en lisant la ligne, rapport G2 de PR-3a-1a l.204) ; `target` (D-2), `null` sans `--day` ; `timeline_sha256` = sha256 des octets de `timeline.jsonl` vérifiés, qui lie le verdict aux octets que la CA hache dans `bodies_sha256` (sans cette égalité, une publication entre les deux lectures rendrait c11 ambigu).
- **Mappage** (DOJO-CA-FORMAT-1, ADR PR-3 l.84) :

| Champ ou contrôle de la CA | Source dans la sortie de `dojo-verify --url --keyring` |
|---|---|
| `c03_dojo_verify_keyring_root` passe | exit 0, une ligne, `ok` vrai, `status` = `consistent_with_supplied_keyring`, `trust_root` = `supplied_keyring` (calque de `verify-bell.mjs:162-165`) |
| `head.seq`, `head.lines_sha256`, `head.lines_count`, `head.recomputed_root` | mêmes clés de `head` |
| `head.day` | `day` de premier niveau (É-2) |
| `history.history_sha256`, `history.history_lines_count` | mêmes clés de `history` |
| `history.history_root` | `history.recomputed_root` (É-2) ; `history` nul ⇒ `null` |
| égalité avec `bodies_sha256` de `/timeline.jsonl` | `timeline_sha256` (emploi par c11 : décidé au G1 de PR-3b-2, consigne transmise) |

- **Consommateurs existants** : clés additives seulement ; `verifyDojoServed` garde sa signature (paramètre `day` facultatif) ; `DOJO_VERIFY_REFUSALS` inchangé (45 codes) ; `head`, `history` et `inclusion` gardent leur forme.
- **Test d'intégration non-LLM** (règle Branchement) : `dojo_verify_url_cli_is_the_ca_contract`, fichier neuf `test/dojo-verify-url.test.ts` (racine de câblage `test/` de `WIRING_TEST_ROOTS` ; précédents ADR PR-4 D-3 l.114 et `test/verify-bell.test.ts:227`) : fixture signée à l'exécution (`dojoFixture`, `render`) servie par un serveur de boucle locale du processus de test (`node:http`, `127.0.0.1`, port 0) ; le VRAI CLI lancé par `execFile` ASYNCHRONE (jamais `spawnSync` : un enfant synchrone bloque la boucle et le serveur ne répond pas ; précédent `test/verify-bell.test.ts:196`) ; il asserte exit 0, une ligne, clés = `DOJO_VERIFY_REPORT_KEYS`, les égalités du mappage (racines recodées par `rootOf` sur les lignes servies), `timeline_sha256` = sha256 du corps servi ; puis un corps altéré ⇒ exit 1 et une ligne de refus ; `--day` et `--address` par la CLI.
- **Composition prouvée à ce lot** : fichiers servis → HTTP de boucle locale → CLI `--url` → contrat. Le consommateur réel est absent jusqu'à PR-3b-2, qui le compose par `verify_dojo_ca_runs_real_dojo_verify` (ADR PR-3 l.149) : TU-5 au G7 de PR-1b-4 = « composé en test (boucle locale), consommateur absent, déclencheur G7 de PR-3b-2 ». **Registre** : la pièce reste `upcoming` (mère l.377, condition de G7 l.511) ; ce lot ne déclare rien `built`.

### D-4 : DOJO-TMP-STRAY-1

- **Décision** : routé hors de ce lot, à DRAND-RELAY-GET-1b (« DRAND-1b », lot du collecteur) ; déclencheur : G1 de DRAND-1b, qui précède A-5 (DOJO-COLLECT-SIGTERM-UNLOCK-1, ADR PR-3 l.217), donc le premier pas de collecte sur l'hôte (A-7) ; propriétaire : l'orchestrateur ; sous Q-1.
- **Motifs** : (1) le défaut vit dans le collecteur (`writeAtomic` et `closeLayout` de `layout.ts`, lus par `readDayLayout` l.89-92), que ce lot ne touche pas ; `dojo-verify` ne lit jamais `bundles/` ; c'est le critère de routage de l'orchestrateur pour DOJO-VERIFY-BREAKS-1 (« ton lot touche ce fichier ») et pour DOJO-RETRY-AFTER-CAP-1 (ADR PR-2 l.515 : « qui touche `collect.ts` ») ; (2) le cas atteignable est une concurrence (RUNBOOK l.260-262 ; lecture concordante de `layout.ts:28-32` et `collect.ts:192`, `:217-221` : `writeAtomic` retronque et renomme le même `.tmp` à la prochaine écriture de la même cible) : une purge à la clôture a sa propre course avec un renommage tardif, et purge ou verrou exclusif par jour est une décision de conception du collecteur, de la famille de DOJO-COLLECT-SIGTERM-UNLOCK-1 ; (3) aucun trou : la consigne d'hôte de RUNBOOK §8 est en vigueur et le collecteur ne tourne sur l'hôte qu'après A-5 ; (4) PR-1b-4 reste unitaire (R-25).
- **Prix de l'alternative en lot** (Q-1 = garder) : ≈ +25 ascendantes (`layout.ts` : purge des `*.tmp` de `readings/` et `publish/` avant `readings/SHA256SUMS` ≈ 4 ; `apps/dojo/test/dojo-collect.test.ts` : test de concurrence par le crochet de renommage existant, `dojo_close_leaves_no_stray_tmp`, et un mutant ≈ 21) ; couverte au G7 par le rejeu de `dojo_collect_to_verify_end_to_end`. Si routé : ADR PR-2 l.515, ADR PR-3 l.274 et RUNBOOK l.263 reçoivent une ligne datée au pli G7 de ce lot (PLI-MERE-PR1B4-1).

### D-5 : tests, mutants, R-25, menaces

- Tests et mutants : §4 ; R-25 : §5 ; menaces : §6 ; items : §7 ; questions : §8.
- **C-V-4 (b)** : PR-2-2 fusionnée d'abord ⇒ le G7 de PR-1b-4 cite **par son nom** `dojo_collect_to_verify_end_to_end` vert sur le `dojo-verify.mjs` fusionné (dans la suite de l'oracle G7). **C-V-4 (a)** : nombre de processus `node` relevé au lancement du G1 et consigné ; aucune course ciblée sous le verrou d'un oracle (REGLES-MISSION).

## 3. Tuyaux (ADR-M018 D3 ; état au G7 de PR-1b-4)

| # | Entrée → sortie | État | Test non-LLM | Au G7 de PR-1b-4 |
|---|---|---|---|---|
| TU-5 (url) | fichiers servis par HTTP → `dojo-verify --url` → ligne JSON | aucun | `dojo_verify_url_cli_is_the_ca_contract` (`test/`) ; `dojo_verify_url_equals_dir_on_the_same_tree` | composé en test (boucle locale) ; servi à l'annonce (QI-4 (c)) |
| TU-5 (dir) | arbre local → `dojo-verify` | aucun | tests de PR-1b-2 | inchangé |
| TU-5c | ligne JSON → c03 et c11 de la CA → `docs/deploy-CA-dojo.json` | dépôt | `verify_dojo_ca_runs_real_dojo_verify` (PR-3b-2) | absent, tuyau formé (TU-5, TU-6 de la mère), déclencheur G7 de PR-3b-2 |
| TU-1b → TU-5 | collecteur → paquet → lignes signées par la fixture → `dojo-verify` | aucun | `dojo_collect_to_verify_end_to_end` (PR-2-2) | rejoué par nom au G7 (C-V-4 (b)) |
| TC-0 (site) | arbre → `verifyDojoServed` dans `buildDojoServed` | build | `dojo_served_refuses_a_tree_the_verifier_refuses` | inchangé (clés additives) |

- **Règle Branchement** : un tuyau absent au G7 est un item formé avec déclencheur (TU-5c) ; la pièce reste `upcoming`.

## 4. Tests nommés et mutants

Aucun réseau réel : serveurs de boucle locale (`127.0.0.1`, port 0, fermés en `after`), délais abaissés et garde de course (motif `apps/bell/test/bell-verify.test.ts:101`) ; clés générées à l'exécution ; arbres temporaires sous `os.tmpdir()` sur F: (`removeTrees`) ; noms de tests, messages d'assertion, commentaires et `detail` en anglais (porte `lang:gate`, ADR-M004 D7 : l'oracle n° 1 du G1 de M-5c a rougi ce jour sur des libellés français, CHANTIERS l.2086). F2P : chaque test neuf ou amendé est rouge à la base `7d9e413e` (outil du tronc `scripts/red-proof.mjs`), aucune épingle attendue.

1. `dojo_verify_url_transport_is_the_bell_policy` (`apps/dojo/test/dojo-verify.test.ts`) : listes admises et refusées de T-1 (celles de Bell, `apps/bell/test/bell-verify.test.ts:84-85`, plus `?` et `#`), refus sans aucune requête vue par le serveur ; 302 ⇒ `redirect_refused`, cible jamais demandée ; 404 ⇒ `http_status` ; corps sans `content-length` (en morceaux) au-delà d'une borne abaissée ⇒ `too_large` ; en-têtes puis silence sous `TIMEOUT_MS` abaissé ⇒ `unreachable` ; chemin hors liste passé à `urlSource(...).get` ⇒ `insecure_url`, aucune requête.
2. `dojo_verify_url_equals_dir_on_the_same_tree` : même arbre signé par l'arbre local et par URL (avec et sans barre finale) ⇒ même rapport à l'octet ; le serveur a vu exactement {`timeline.jsonl`, `dojo/pubkey.json`, `history/<hex64>.jsonl`, `lines/<hex64>.jsonl` × S}, chacun une fois.
3. `dojo_verify_totals_are_bounded` : `MAX_FILES` abaissé sous 2 + 1 + S ⇒ `too_large` `total files` par les deux sources, aucun GET au-delà ; `MAX_TOTAL_BYTES` abaissé ⇒ `too_large` `total bytes`.
4. `dojo_verify_day_proves_a_past_day` : `--day` d'un `snapshot` passé ⇒ `target` = son `seq`, `lines_sha256`, `lines_count` et sa racine recodée par `rootOf` ; `head` inchangé ; avec `--address`, chemin = `proofOf` dans le fichier de D, contre la racine de D.
5. `dojo_verify_day_refusals_are_named` : avant l'ancre, jour d'ancre, jour manquant (un pas retiré), après la tête, chronologie sans `snapshot` ⇒ `line_missing` et les trois `detail` ; arbre fautif + `--day` ⇒ le code de l'arbre.
6. `dojo_verify_reports_broken_rotations` : fixture à rotation rompue (`broken: true`, `dojo-fixture.ts:64`, `:76`) ⇒ `breaks` = [{`seq`, `lost_key_id`, `new_key_id`}] ; sans rupture ⇒ `[]`.
7. `dojo_verify_cli_is_fail_closed` (amendé) : cas d'usage neufs (`--url` répété, `--url` avec un arbre, `--url` sans valeur, `--day` hors forme : `2026-02-30`, `2026-9-1`, `2026-10-02T00:00Z` ; `--day` sans valeur) ; garde T-10 (exactement un `fetch(`, dans `urlSource`) ; clés d'un rapport = `DOJO_VERIFY_REPORT_KEYS`.
8. `dojo_verify_url_cli_is_the_ca_contract` (`test/dojo-verify-url.test.ts`) : D-3.

**Mutants** (sur copie, restaurés au sha256 ; campagne par l'outil du tronc `scripts/mutants/run.mjs`, `--file apps/dojo/scripts/dojo-verify.mjs`, `--targets` les deux fichiers de test, `--lock-root F:/tmp` ; `RESULTS.json` cité par sha256) : **M-U1** http hors boucle locale admis (`localhost`) ; **M-U2** redirection suivie ; **M-U3** statut non contrôlé ; **M-U4** borne par `content-length` seul ; **M-U5** minuteur levé aux en-têtes ; **M-U6** liste fermée retirée ; **M-U7** `?` ou `#` admis ; **M-U8** second `fetch` hors `urlSource` ; **M-U9** fichiers non comptés ; **M-U10** octets totaux non comptés ; **M-D1** cible = tête ; **M-D2** preuve contre la racine de la tête sous `--day` ; **M-D3** jour voisin ou préfixe admis ; **M-D4** jour après la tête ramené à la tête ; **M-D5** `--day` lu avant la vérification complète ; **M-D6** jour d'avant l'ancre accepté sans refus ; **M-B1** `breaks` toujours `[]` ; **M-C1** clé ajoutée ou retirée hors `DOJO_VERIFY_REPORT_KEYS` ; **M-C2** `timeline_sha256` calculé sur d'autres octets (JSON re-sérialisé). Tueurs attendus : M-U1 à M-U7 par 1 ; M-U8 par 7 ; M-U9, M-U10 par 3 ; M-D1, M-D2 par 4 ; M-D3 à M-D6 par 5 et 7 ; M-B1 par 6 ; M-C1, M-C2 par 7 et 8.

## 5. R-25 (méthode de la mère : estimation ascendante ; ×2,1 = règle ; pathspec de `ci.yml:82`, insertions + suppressions ; coupe au-delà de 547)

| PR | Base (source) | Composants de ce G0 (estimations) | Ascendant | ×2,1 | ×2,31 | Marge au STOP 1 150 (×2,1) |
|---|---|---|---|---|---|---|
| PR-1b-4 | 120 (plan l.82, C-1) | `dojo-verify.mjs` ≈ 67 (`urlAllowed` et `urlSource` 25 ; bornes totales 8 ; `--day` 14 ; rapport 6 ; CLI 10 ; bornes 4) ; `dojo-verify.d.mts` ≈ 12 ; `apps/dojo/test/dojo-verify.test.ts` ≈ 112 (serveur de boucle locale 18, tests 1 à 6 86, test 7 amendé 8) ; `test/dojo-verify-url.test.ts` ≈ 45 | **236** | 495,6 | 545,2 | 654,4 |
| PR-1b-4 (si Q-1 = garder DOJO-TMP-STRAY-1) | 236 | + `layout.ts` ≈ 4 ; test de concurrence et mutant ≈ 21 | 261 | 548,1 | 602,9 | 601,9 |

- Estimations du planificateur, jamais des mesures ; mesure au G1 (`git diff --shortstat` depuis `7d9e413e`, pathspec de `ci.yml:82` recopié, fichiers non suivis dans une copie de l'index). 236 ≤ 547 : aucune coupe ; si le compte ascendant de la mission du G1 dépasse 547, coupe avant toute écriture (règle C-V-5 du cp-1 de PR-3), jamais sur une mesure ; coupe de repli pré-déclarée : PR-1b-4a (`--url`, bornes, contrat, tests 1, 2, 3, 6, 7, 8) puis PR-1b-4b (`--day`, tests 4, 5). Écart au plan : É-6 ; facteur : É-7.

## 6. Menaces (forme de l'audit Vernier) et MAST

| # | Menace | Mécanisme | Parade | Statut |
|---|---|---|---|---|
| TY-1 | redirection | 3xx vers un autre hôte ou vers http | `redirect: "manual"`, 3xx et `opaqueredirect` refusés, cible jamais demandée (T-4 ; M-U2) | neutralisé |
| TY-2 | corps sans `content-length`, ou énorme | réponse en morceaux, longueur mensongère, compression | compte en flux sur les octets rendus, ceux qui sont hachés (T-6 ; M-U4) ; bornes totales (M-U9, M-U10) | neutralisé par corps ; totaux provisoires |
| TY-3 | corps lent | en-têtes puis silence, goutte-à-goutte | minuteur par GET sur en-têtes et corps (T-7 ; M-U5) ; durée totale ≤ fichiers × 30 s | réduit ; délai total du consommateur à dimensionner (DOJO-VERIFY-SCALE-1) |
| TY-4 | TLS | certificat invalide ; environnement du lecteur qui affaiblit la vérification | aucune option TLS posée (T-9) ; c07 de la CA fait sa propre poignée de main (ADR PR-3 l.84) | réduit ; résiduel déclaré ; FAITS-NODE-FETCH-TLS-1 |
| TY-5 | hôte non-https | `http://` hors boucle locale, `localhost`, `127.1`, `127.0.0.1.example`, identifiants `u@` | T-1 sur la chaîne brute, refus avant toute requête (M-U1) | neutralisé |
| TY-6 | chemin hors liste | champ signé hors forme, `?` ou `#` dans la base | formes hex64 avant lecture ; liste fermée T-8 ; T-2 (M-U6, M-U7) | neutralisé |
| TY-7 | jour falsifié | `snapshot` qui revendique un autre jour ; `--day` voisin, préfixe ou fuseau local | jour strictement croissant, graine chaînée, ronde de la balise et instants recalculés, graine révélée après le jour (M-8, M-9, M-12, M-20 à M-22 existants) ; forme exacte (M-D3, M-D4) | neutralisé ; résiduel : les soldes restent le rapport de deux opérateurs (mère l.261) |
| TY-8 | vue scindée | l'hôte sert d'autres octets à la CA et au vérificateur, ou publie entre les deux lectures | `timeline_sha256` au rapport, égalité avec `bodies_sha256` (D-3 ; M-C2) | réduit ; résiduel : vues différentes à des lecteurs différents, chacune vérifiable |
| TY-9 | déni du lecteur | chronologie à milliers de `snapshot`, corps énormes | `MAX_FILES`, `MAX_TOTAL_BYTES`, `MAX_LINE_BYTES` | réduit ; valeurs provisoires |

| Mode MAST | Menace dans ce lot | Contre-mesure |
|---|---|---|
| FM-3.2 vérification absente | composition PR-1b-4 et PR-2-2 non rejouée après la seconde fusion | rejeu par nom de `dojo_collect_to_verify_end_to_end` au G7 (C-V-4 (b)) |
| FM-1.1 spécification non suivie | calque de Bell avec divergences muettes | É-3 et É-4 déclarées ; tests 1 et 2 observés côté serveur |
| FM-2.2 clarification non demandée | bornes totales fixées par défaut | valeurs motivées, provisoires, Q-2, DOJO-VERIFY-SCALE-1 |
| FM-3.3 vérification incorrecte | le test du contrat relit ce que le vérificateur affirme | racines recodées depuis les lignes servies ; chemins comptés par le serveur, jamais par le vérificateur |

## 7. Items et procurements

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| DOJO-VERIFY-URL-1 (mère) | code | porté par ce lot (D-1, D-2, D-3) | résolu au G7 de PR-1b-4 | orchestrateur |
| DOJO-VERIFY-BREAKS-1 (G2 de PR-3a-1a) | code | inclus (D-3) : une ligne au rapport, type, test 6, M-B1 | résolu au G7 de PR-1b-4 | orchestrateur |
| DOJO-TMP-STRAY-1 (ADR PR-2) | code | routé (D-4) : purge ou verrou par jour dans le collecteur, test de concurrence | G1 de DRAND-1b, avant A-5 (sous Q-1) | orchestrateur |
| DOJO-VERIFY-SCALE-1 (mère) | mesure | fixe aussi `MAX_FILES`, `MAX_TOTAL_BYTES` et le délai `execFile` du consommateur, par ligne datée | G1 de PR-3b-2 (inchangé) | orchestrateur |
| DOJO-VERIFY-HISTORY-DAY-1 (nouveau, PAROXYSME) | conception | `--day` d'un jour d'historique prouvé contre `history_root` (ligne jour et adresse, `proofOf` sur le fichier d'historique) | première ligne `history` servie (G7 de PR-3a-2), ou G0 de PR-4c-2 | orchestrateur |
| DOJO-LIVE-BOUNDS-KEYS-1 (nouveau) | consigne de G0 | `VERIFY_BOUNDS` gagne `TIMEOUT_MS`, `MAX_FILES`, `MAX_TOTAL_BYTES` : le test d'identité de `DOJO_LIVE_BOUNDS` (ADR PR-4 l.107) les compare ou les exclut par déclaration | G0 de PR-4c-1 | orchestrateur |
| FAITS-NODE-FETCH-TLS-1 (nouveau, PAROXYSME) | lecture sur place | ce que le `fetch` du runtime (Node 24) applique par défaut à TLS : magasin de certificats, variables d'environnement qui l'affaiblissent ou l'étendent, mandataires, décodage `content-encoding` ; si la vérification peut tomber sans signe, recherche d'une parade (refus nommé ou mention au rapport) | G1 de PR-3b-2 (conception de c07 et du lancement du vérificateur) | orchestrateur |
| R25-FACTOR-DRIFT-1 (nouveau, méthode) | décision | pire dérive mesurée ×2,31 (PR-3b-1) au-dessus de ×2,1 : borne ascendante 547 à revoir (1 150 / 2,31 ≈ 497) | prochain G0 dont une PR dépasse 497 ascendantes | orchestrateur |
| PLI-MERE-PR1B4-1 (nouveau) | pli de la mère | D-10 l.262 (CLI) ; table l.1062 (`insecure_url`, `redirect_refused`, `http_status` émis ; `too_large` étendu aux totaux ; `line_missing` étendu à `--day`) ; TU-5 l.360 ; §11 l.704 (résolu), l.705 ; routage de DOJO-TMP-STRAY-1 (ADR PR-2 l.515, ADR PR-3 l.274, RUNBOOK l.263) | G7 de PR-1b-4 | orchestrateur |

- **Procurements** : aucun papier ; la seule lecture due (FAITS-NODE-FETCH-TLS-1) est un acte de l'orchestrateur (lecture sur place, règle du 2026-09-20).

## 8. Questions (à l'orchestrateur ; fermées, recommandation jointe)

- **Q-1** : DOJO-TMP-STRAY-1 routé à DRAND-1b (D-4) ou gardé dans ce lot (≈ +25 ascendantes, `layout.ts` et `dojo-collect.test.ts`) ? **Recommandation : routé.**
- **Q-2** : bornes totales provisoires `MAX_FILES` = 1 024 et `MAX_TOTAL_BYTES` = 2 Gio, jusqu'à la mesure de DOJO-VERIFY-SCALE-1, ou bornes sans valeur jusque-là (le G1 ne pourrait alors pas les tester) ? **Recommandation : provisoires, testées.**

## 9. Non établi, et ce qui le tranche

1. Comportement TLS par défaut du `fetch` de Node 24 et son exposition à l'environnement : non lu ici (aucun réseau) ; FAITS-NODE-FETCH-TLS-1.
2. Forme de la réponse de `fetch` sous `redirect: "manual"` (`opaqueredirect` ou 3xx brut) : les deux sont refusées (T-4) ; le refus est éprouvé par le test de Bell (`apps/bell/test/bell-verify.test.ts:96-97`), vert dans les oracles G7 récents (CHANTIERS l.2114 : 1 711 tests, 0 rouge).
3. Octets comptés quand le serveur compresse : T-6 compte ceux que rend le flux du corps (ceux qui sont hachés) ; le traitement de `content-encoding` par `fetch` n'est pas lu ici (même item).
4. Coût de la vérification à N croissant, valeur finale des bornes totales et du délai du consommateur : DOJO-VERIFY-SCALE-1.
5. Stabilité des serveurs de boucle locale sous la suite complète : un rouge « loopback » non attribué est consigné (CHANTIERS l.2110, ORACLE-FLAKE-LOOPBACK-1 ; l.2112, E-1 de PR-3a-1) : ports 0, fermeture en `after`, délais abaissés, garde de course.
6. Tailles du §5 : estimations, jamais des mesures.

## 10. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-29 | G0 de lot PR-1b-4, `docs/adr/ADR-DOJO-PR-1B-4.md`, non committé, base `7d9e413e` | `claude-opus-5-5` | high | mission ; mère ; plan ; ADR PR-2, PR-3, PR-4 ; rapport cp-1 de PR-3 ; code et tests du vérificateur ; précédents Bell ; CHANTIERS du 2026-09-29 ; complément de l'orchestrateur (DOJO-VERIFY-BREAKS-1) | worker | orchestrateur (R-21), puis checkpoint-1 bref | sans objet (G0) |

- **Lu en entier** : mission et règles `docs/methode/REGLES-MISSION.md` ; mère (1 363 l.) ; plan (251 l.) ; ADR PR-3 (282 l.) ; ADR PR-2 (515 l.) ; rapport cp-1 de PR-3 ; `dojo-verify.mjs`, `dojo-verify.test.ts`, `bell-verify.mjs`, `verify-bell.mjs`, `layout.ts` ; patron `docs/G0-lot-dojo-pr4.md` et `docs/adr/ADR-DOJO-PR-4.md` ; CHANTIERS du tronc, entrées du 2026-09-29 (l.2043-2115). **Par extraits** : rapport G2 de PR-3a-1a (l.50-70, l.204, l.217), `dojo-chain.mjs`, `dojo-verify.d.mts`, `dojo-fixture.ts`, `collect.ts` (l.185-250), `dojo-collect.test.ts` (l.424-509), `apps/bell/test/bell-verify.test.ts` (l.60-110), `test/verify-bell.test.ts` (l.220-236), `dojo-served-load.ts`, `test/dojo-served.test.ts` (l.200-212), RUNBOOK-dojo §8, `ci.yml` (l.76-92), `package.json` (l.16). Sha256 au journal.
- **Conduite** : aucun appel réseau ; `git` en lecture seule (`status`, `rev-parse`, `log`, `diff --stat`, `merge-base`, `worktree list`, `grep`, `show`, `ls-tree`) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; rien écrit sur C: ; deux écritures dans le worktree (ce fichier et le journal) par l'outil d'écriture ; sorties longues déposées par le harnais sous `F:/claude-config/projects/…/tool-results/`, relues depuis la source.
- **Advisor intégré** : consulté après l'orientation, avant l'écriture (garde T-10 écrite, `?` et `#`, convention de `detail`, bornes totales chiffrées et provisoires, `execFile` asynchrone, « futur » par rapport à la tête, emploi étendu de `line_missing`, c03 et c11, mappage, consommateurs à ne pas casser, BREAKS inclus, routage de DOJO-TMP-STRAY-1 et éditions dues, rejeu C-V-4 (b), deux facteurs de dérive, TLS sans affirmation, pli de la mère) ; seconde consultation avant la remise, rendue au journal. Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **`error_origin` proposés** (à assigner au G7) : É-1 = rédaction de la mission (orchestrateur ; numérotation de Bell) ; É-2 = aucune erreur (formes de deux lots, mappées) ; É-3, É-4 = aucune erreur (divergences décidées ici) ; É-5 = aucune erreur (garde de PR-1b-2 juste à son époque) ; É-6 = planificateur du plan (estimation antérieure aux items) ; É-7 = méthode (orchestrateur) ; É-8 = aucune erreur (routage révisé sous Q-1).

- **Ligne datée (orchestrateur, 2026-09-29 23:0x UTC, décision 275) — réponses au G0** : **Q-1 = routage** de DOJO-TMP-STRAY-1 vers le G1 de DRAND-1b (avant A-5 ; la consigne d hôte du RUNBOOK §8 tient jusque-là) ; le renversement des lignes datées ADR PR-2 l.515, ADR PR-3 l.274 et RUNBOOK l.263 est porté par PLI-MERE-PR1B4-1 au G7 ; l affirmation « un `.tmp` orphelin est absorbé par toute réécriture de la même cible » est une LECTURE du code, à MESURER par un test au G1 de DRAND-1b. **Q-2 = valeurs provisoires chiffrées et TESTÉES** (1 024 fichiers, 2 Gio), fixées ensuite par la mesure de DOJO-VERIFY-SCALE-1. **É-1** : la numérotation de la CA de Dōjō fait foi (`c03`) ; « contrôle 5 » de la mission était celle de Bell (`error_origin` orchestrateur). R25-FACTOR-DRIFT-1 : accepté comme item.

## Pli cp-1 (2026-09-29 23:1x UTC) — lignes datées de l orchestrateur, font foi (rapport `F:/tmp/dojo/cp1-pr1b4/CP1-report.md`, sha256 `93bc024d…`, ACCEPTE-AVEC-CORRECTIONS)

- **C-V-1 (§4, forme des tests rouges à la base)** : tout test neuf atteint les exports nouveaux (`urlSource`, `DOJO_VERIFY_REPORT_KEYS`) par import d ESPACE DE NOMS, sa première assertion étant un contrôle d existence (ou il passe par la CLI seule) ; son premier échec à la base est un `ERR_ASSERTION`, jamais un import nommé manquant ni une `TypeError` (refus de `scripts/red-proof.mjs` l.100-102, l.172-174, épinglé `test/red-proof.test.ts:206`) ; une ligne `// killer:` au-dessus de chaque test (l.167) ; le test 7 tient son rouge de la garde T-10 et du contrôle des clés.
- **C-V-2 (D-3, `head` nul)** : un arbre sans `snapshot` rend `head` nul ; `c11` ÉCHOUE alors (`pass: false`, détail « no snapshot served ») : aucune CA de déploiement ne passe avant le premier `snapshot` servi (P-10 de la mère).
- **C-V-3** : item **DOJO-CA-TIMELINE-SHA-1** : `c11` exige l égalité de `timeline_sha256` du rapport avec l entrée `/timeline.jsonl` de `bodies_sha256` (TY-8 « réduit » en dépend) ; propriétaire orchestrateur ; déclencheur : G1 de PR-3b-2.
- **C-V-4** : PLI-MERE-PR1B4-1 nomme aussi les sens étendus de `insecure_url` : base portant `?` ou `#` (T-2), chemin hors de la liste fermée (T-8), et le refus TLS ci-dessous (T-9).
- **C-V-5** : routage de DOJO-TMP-STRAY-1 écrit au tronc (`22023682`, `888a9886`, `ab0fea8c` : lignes datées ADR PR-2 et PR-3, RUNBOOK-dojo l.263).
- **C-V-6 (§1.2)** : consommateur en vol `scripts/sync-dojo-served.mjs` (PR-4a-2, gel 2 `dec7a055`) importe `VERIFY_BOUNDS` et `verifyDojoServed` ; le G7 de PR-1b-4 rejoue par son nom `dojo_served_data_matches_deploy_ca` (et `dojo_sync_get_holds_its_contract`) sur l arbre fusionné.
- **Q-V-1 = compteur dans la SOURCE URL** (`urlSource`) : les bornes totales protègent contre un hôte distant ; les sources locales (arbre servi, source du site `dojo-served-load.ts:232`) gardent leurs bornes par corps ; TC-0 reste inchangé.
- **Q-V-2** : item **DOJO-SYNC-FETCH-CONVERGE-1** : `scripts/sync-dojo-served.mjs` converge sur `urlSource` (un seul chemin de transport ; `content-length` jamais lu, annulation du corps sur refus) ; propriétaire orchestrateur ; déclencheur : avant l acte TU-7 (après le G7 de ce lot) ; absorbe DOJO-SYNC-GET-BODY-CANCEL-1 si porté ensemble.
- **Q-V-3** : « ou » se lit « le premier des deux » ; DOJO-VERIFY-HISTORY-DAY-1 couvre TOUT l intervalle de l historique admis par le vérificateur.
- **Q-V-4 = FAITS lus AVANT le G1** : `F:/Monark/docs/dojo/FAITS-node-fetch-tls-2026-09-30.md` (tronc `cc3d747a`, sha256 `7de80c82…`) ; FAITS-NODE-FETCH-TLS-1 RÉSOLU pour ce lot : **T-9 amendé** : en `--url`, refus `insecure_url` quand `NODE_TLS_REJECT_UNAUTHORIZED` vaut `0` (F-1) ; la présence de `NODE_EXTRA_CA_CERTS`, `NODE_USE_SYSTEM_CA` ou `NODE_USE_ENV_PROXY` est DÉCLARÉE au rapport (F-2 à F-5 ; forme au G1 sous le contrat fermé de D-3, sans clé nouvelle si le `detail` suffit) ; tout refus sur statut ou longueur annule le corps (F-6) ; le décodage de `Content-Encoding` reste non établi (F-7) : T-6 compte les octets rendus par le flux, déclaré.
