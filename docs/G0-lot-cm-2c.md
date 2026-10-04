# G0 du lot CM-2c : BYO-ASCII-LOOKALIKE-1 (B-10)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « (nuit, 2) : plan de CM-2 », ligne **B-10** (go du fondateur « oui aux 1, 2 et 3 », point 3). Item BYO-ASCII-LOOKALIKE-1 (amendement « soir », §10).
- **Base** : `2abe801` (`recherches/cm-2b`, empilée sur CM-2a et CM-2b, non fusionnées). Auteur : RECHERCHES.
- **Cas** : la sonde de MONARK, E1 à E17 (`recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-RAPPORT.md`, C-1 et tableau l.80) : tous rendaient 200 sous le nom imitant (16 `commit` ; E16 `defer`, `interval_too_wide`). Correction datée 2026-10-04 (C-6 (a) de MONARK) : « tous `commit` » était faux pour E16.

## Règle

Sur le seul chemin BYO, **après** la garde B-1 (ses messages et ses codes restent identiques octet pour octet ; un nom que B-1 refuse garde le refus de B-1) :

1. **Réduction** `confusableReduce`, appliquée aux deux côtés de chaque comparaison, dans cet ordre : minuscules ASCII (A à Z) ; blancs retirés (tous, `\s` Unicode) ; `rn` → `m` ; `i`, `l`, `1` → `l` (le I majuscule devient i, puis l) ; `0` → `o` ; `_` et `.` → `-` ; suites de `-` réduites à un seul ; `-` retirés en tête et en fin.
2. Refus en 400 `byo_lookalike_confusable` (code neuf de la liste fermée) si :
   - la classe réduite égale une classe verrouillée réduite (`btc-dir-15m`, `cascade-liquidable-24h`, `liquidation-eligible-coverage`) ;
   - la classe réduite appartient à l'ensemble des 32 noms kata réduits (le motif `^(btc|eth|bnb|sol)-(dir|range|mae-down|mae-up)-(1h|4h)$` énuméré, puis réduit : un ensemble exact, pas une expression réduite) ;
   - le couple (classe, clé) réduit égale un couple commis réduit (USDe, strates liq) ;
   - la clé réduite, avec en plus `4` lu `a` (pour la seule lecture du préfixe), commence par `kata:`.
3. Message : `task_class '<c>' / predictor_id '<k>' reduces to a committed or reserved name once ASCII confusables are folded (l, I, 1; rn, m; 0, o; _ and . as -; repeated -; blanks): use a distinct caller-owned name for BYO (ADR-CM B-10)`.

## Écarts au texte de B-10 (à acter)

B-10 nomme : l, I, 1 ; rn, m ; 0, o ; `_`, `-` ; blancs internes. Pour refuser E8 (`btc--dir-15m`), E9 (`btc-dir-15m.`) et E14 (`k4ta:…`), comme demandé, la réduction ajoute trois règles précises :
- `.` lu comme `-`, et suites de `-` réduites, `-` de bord retirés (E8, E9) ;
- `4` lu `a`, **pour le seul préfixe de clé `kata:`** (E14). Il n'est pas appliqué aux classes ni aux couples commis : deux adresses `0x…` réelles ne différant que par `4` et `a` seraient sinon confondues (faux refus d'une autre population).
Ces trois règles élargissent les refus de B-10 ; elles sont nommées ici et dans le G7 pour le contrôle par diff et, si besoin, un amendement daté.

E16 (clé USDe avec `O` pour `0`) : le rapport de MONARK la disait passante « par conception (A6) ». B-10 compare aussi les couples commis après réduction : E16 est donc refusée (une clé qui n'imite que la clé commise n'est pas une autre population). Une autre population de la classe stable-run (`caller:other-population`) décide toujours.

## Faux refus possibles (déclarés)

La réduction n'est appliquée qu'aux comparaisons avec les noms commis ou réservés : un nom honnête n'est refusé que si, réduit, il égale l'un d'eux. Les cas restants sont des noms qui ne diffèrent d'un nom commis ou kata que par les confusables listés (par exemple `btc-dir-lh`, `sol-dir-ih`, `cascade_liquidable_24h`, une clé `k4ta:…`) : ils imitent par construction. Aucun faux refus mesuré sur les noms honnêtes épinglés (`acme-model-1`, `my_model`, `cascade-v2`, `liquidity-model`, `eth-dir-1d`, `sol-scorer`, `model-rn-01`, `btc-dir-15m-v2`, `liquidation-model`, `cascade_liquidity_7d`, `btc-dir-2h`, `sol-dir-1hr` ; clés `kat:x`, `katana:x`, `caller:kata`, `4ta:x`). Ajout daté 2026-10-04 (C-4 de MONARK) : le `i` minuscule est plié en `l`, donc un nom qui ne diffère d'un nom kata que par i ou l est refusé, par exemple `btc-dlr-1h` (`dlr` peut se lire « dollar ») ; c'est un faux refus possible, déclaré et épinglé. Les adresses hexadécimales ne se confondent pas entre elles (o, i, l ne sont pas des chiffres hexadécimaux ; `4` n'est pas réduit hors du préfixe).

## Différence servie (B-10)

Un nom BYO dont la réduction égale un nom commis ou réservé rend 400 `byo_lookalike_confusable` (rendait 200). Partout ailleurs, rien ne change : B-1 inchangé, description et `openapi.json` inchangés.

## Tests (rouges à la base par échec d'assertion)

Neuf : `apps/harness/test/gate-byo-confusable.test.ts`, un tueur chacun :
- C-1 `byo_confusable_class_names_refused` : E1 à E10, E17, deux formes de casse et de séparateur ; dix noms honnêtes décident ;
- C-2 `byo_confusable_kata_names_and_keys_refused` : E11 à E15 et variantes ; noms et clés proches décident ;
- C-3 `byo_confusable_committed_pair_refused` : E16 refusée, autre population décide, codes B-1 inchangés, corps HTTP exact.

Modifié : `error-code.test.ts` E-1, la liste épinglée des codes gagne `byo_lookalike_confusable` (après `byo_reserved_kata`). Tueurs hérités ré-ancrés sur les lignes décalées (ligne tueuse seulement).

## Taille et sortie

Code : `gate.ts`, `calibration.ts` (`matchesCommittedKeyWith`). R-25 sous 1 150. Oracle : `tsc`, eslint, `gate:vocab`, `lint:ratchet`, tests du harnais, `red-proof --base 2abe801 --gel <sha> --repo /home/user/monark-governance --draw 6 --seed 5`.

## Mesures (gel `73802b8`)

R-25 au gel `73802b8` (commit `73802b82`, code de CM-2c) : 12 fichiers, +166/−28, soit 194 lignes comptées contre `2abe801` (borne locale de MONARK : 547). Tests du harnais : 126 → 129. `red-proof --base 2abe801 --gel 73802b8 --repo /home/user/monark-governance --draw 6 --seed 5` : OK, 3 jugés F2P, 3 tueurs tirés, 3 tués. Le changement d'E-1 (`error-code.test.ts`) est dans la constante de tête : non jugé, rouge à la base. Autocontrôle : `lang-gate` lisait le mot « il » dans la classe `[il1]` de l'expression ; écrite `[l1i]`, même sens.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- ~~Corpus : 381 noms honnêtes testés, 10 refus ; 0 collision sur 200 000 adresses aléatoires.~~ Retiré le 2026-10-04 (C-5 de MONARK) : ni le corpus ni son générateur ne sont commis, ces chiffres ne sont pas reproductibles. Mesures qui en tiennent lieu, celles de la G2 de MONARK (`cm2c-RAPPORT.md` §(2)) : 1 000 paires honnêtes générées (mulberry32, graine 20261004) et 49 lignes honnêtes proches, 0 refus ; 201 001 adresses réduites, 0 collision, et l'injectivité de la réduction sur l'hexadécimal démontrée (casse, 0 → o et 1 → l seulement).
- C-3 gagne `stable_run_velocity_24h` avec la clé USDe commise (classe confusable, clé commise) : refusé. Il tue M15 (la classe non réduite dans `matchesCommittedKeyWith`), vérifié à la main : le test rougit par assertion (« class confusable + committed key: refused »). M13 : équivalent.
- Après la G2 : `red-proof --base 2abe801 --gel f29f153 --repo /home/user/monark-governance --draw 6 --seed 13` OK (3 jugés F2P, 3 tueurs tués) ; harnais 129/129 ; R-25 195 lignes comptées (+167/−28).
- Les trois précisions de B-10 et le résidu déclaré sont actés par l'amendement daté « (nuit, 4) » de l'ADR-CM.
- Le test 42 d'export n'échoue que sous la charge de la suite complète ; seul, il passe à `36c1feb` (vérifié par RECHERCHES).

## Contrôle par diff de MONARK (2026-10-04) : APPROUVE-AVEC-CORRECTIONS, plié

Rapport : `recherches:coordination/pieces/2026-10-04-controles-107-112/cm2c-RAPPORT.md` (sha256 `e1215864…52fa`). Base du lot inchangée (`2abe801`) ; base de la PR : `base/chantier-moteur-2026-10-03` (`98e3779a`, porte CM-2a).

- **C-1 (bloquant)** : `refused()` de `gate-byo-lookalike.test.ts` exige maintenant un code de B-1 (`byo_edge_blank`, `byo_lookalike_committed`, `byo_reserved_kata`) et un message qui cite « (ADR-CM B-1 ». Les trois tueurs hérités ré-ancrés (`gate.ts:791` sur T-1, `:796` sur T-3 et T-3b) tuent de nouveau leur test (à `839cb6a` : survivants, mesuré aussi ici). Épingle du code de B-1 pour une clé kata dans C-3 : `outcome("byo-x", "kata:x") === "byo_reserved_kata"` (tue K14). Tous les tueurs du fichier revérifiés au gel neuf : 5 sur 5 tués.
- **C-2 (bloquant)** : le résidu de B-10 est déclaré comme une classe, avec les exemples mesurés par MONARK, et deux items reçoivent propriétaire, déclencheur et prix : BYO-LOOKALIKE-RESIDUAL-1 (neuf) et BYO-HOMOGLYPH-1 (préexistant, sans ligne jusqu'ici). Ils figurent dans l'amendement daté 2026-10-04 (2) de l'ADR-CM (items ajoutés au §10) et au G7. Le commentaire de `byoConfusable` nomme l'item, sans ligne ajoutée : aucune ancre ne bouge.
- **C-3** : les quatre survivants sont tués par leurs tueurs mesurés. G13 : `-btc-dir-15m` dans C-1 et `_kata:x` dans C-2. G19 : `sol_mae_up_4h` dans C-2. G24 : `doge-dir-1h` décide, dans C-2. C05 : `my-model` avec la clé USDe commise décide, dans C-3.
- **C-4** : le pli i → l est acté comme précision (4) dans l'amendement daté 2026-10-04 (2) ; `btc-dlr-1h` est épinglé refusé dans C-2. Faux refus possible, déclaré (voir § Faux refus possibles), dans le périmètre de BYO-LOOKALIKE-RESIDUAL-1. Q-1 (le go 3 couvre-t-il les précisions ?) reste au fondateur.
- **C-5** : la ligne des 381 noms est retirée (§ G2 ci-dessus).
- **C-6** : (a) E16 `defer` corrigé (en tête) ; (b) R-25 : 194 au gel `73802b8`, 195 à `839cb6a`, 206 au gel `52d2d18` ; (c) « E1 à E15 » de l'amendement (nuit) relu « E1 à E17 » par l'amendement daté 2026-10-04 (2) ; (d) le rejeu octet pour octet que promet l'ADR §6 R-1 est celui de la G2 de MONARK (226 lignes, trois canaux, 0 hors classe : `cm2c-RAPPORT.md` §(1)), cité au G7.
- **C-7** : le paragraphe README des codes de B-1 et B-10 n'est pas dans ce lot. Il va dans #110, qui réécrit le README, ou dans la PR fusionnée en second avec #107 (critique K-9). Propriétaire : RECHERCHES ; déclencheur : la fusion en séquence de la pile CM-2.
- **C-8** : outillage, à MONARK.
- **Gel neuf** : `52d2d18` (tests `63002e5`, puis code `52d2d18`, commentaire seulement).

