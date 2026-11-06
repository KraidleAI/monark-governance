# STRATEGIE.md — la stratégie du fondateur et son interface avec le moteur

Écrit le 2026-11-04. La partie 1, la stratégie du fondateur, vit dans le dépôt privé `KraidleAI/monark-strategie`
(décision du fondateur du 2026-11-05), jamais ici : c'est l'étape 2 de `ROADMAP.md`, finie quand ses signaux, ses
marchés, ses horizons et ses règles de sortie y sont écrits. La partie 2 dit, d'après le code, ce que le moteur attend
d'une stratégie ; elle suit le code, et le code fait foi.

## 1. La stratégie (dans le dépôt privé)

La partie 1 vit dans le fichier `STRATEGIE.md` du dépôt privé `KraidleAI/monark-strategie`, à remplir par le
fondateur : les signaux (1.1), les marchés et l'unité des montants (1.2), les horizons (1.3), les règles d'entrée et de
sortie, DEFER et ABSTAIN compris (1.4), les montants (1.5) et l'historique de chaque classe (1.6). La partie 2 y renvoie
par ces numéros. Rien de la stratégie n'entre dans ce dépôt public.

## 2. Ce que le moteur attend (lu dans le code le 2026-11-04, au commit `8b21aff4` ; le suivi sur la voie BYO le 2026-11-05 ; le niveau en ligne le 2026-11-06)

### 2.1 Un signal devient une `Prediction`

`schemas/prediction.schema.json` fait foi. Une `Prediction` a cinq champs requis et un optionnel :

| Champ | Ce qu'il porte |
|---|---|
| `schema_version` | `1.1.0` ; toute autre version est refusée (`schema_version_unsupported`) |
| `task_class` | la classe du signal, en ASCII imprimable (voir 2.2) |
| `yhat` | le signal : un nombre, ou une étiquette (une chaîne) |
| `predictor_id` | qui produit le signal, en ASCII imprimable |
| `produced_at` | l'instant du signal, en RFC 3339 ; refusé s'il est plus de 300 s après l'horloge du serveur (`produced_at_future`) |
| `features_digest` | optionnel : une empreinte de ses données d'entrée, en 64 caractères hexadécimaux ; exigé sur les classes kata |

Aucun champ ne porte l'horizon : il appartient à la classe. Les classes kata, par exemple, le portent dans leur nom
(`15m`, `1h`, `4h`, `24h`) et dans `h_ms` de leur entrée de classe (`packages/contracts/src/policy-table.ts`).

### 2.2 Les classes : la voie BYO, celle de la stratégie, et la voie committée

**La voie BYO, celle des classes de la stratégie.** L'appelant porte sa propre calibration dans `params.calibration` :
ses scores de non-conformité (`scores`) et un `mode` (`apps/harness/src/tools/gate.ts`, `byoVerdict`). La calibration
des classes de la stratégie et l'historique de 1.6 vivent dans le dépôt privé, jamais ici (décision du fondateur du
2026-11-05) : l'adaptateur les porte à chaque appel. C'est l'étape 3 de `ROADMAP.md`.

- En mode `interval`, `yhat` est un nombre, les scores sont positifs ou nuls, et la région est `[yhat - q̂, yhat + q̂]`.
- En mode `set`, `yhat` est une étiquette, et la région est un ensemble conforme parmi les `candidates` de
  l'appelant ; `params.tau` doit alors être au plus le nombre de candidats moins un (`byo_set_tau_cap`).
- `q̂` est le quantile conforme (split) des scores au niveau `alpha`, ou, si l'appelant le porte, au niveau en ligne de la
  classe (ci-dessous) ; au plus 10 000 scores (`CALIBRATE_MAX_N`) ; avec moins de `nMin` scores, ou trop peu pour le niveau
  `alpha`, la décision s'abstient (`under_calib`).
- La classe et la clé ne doivent prendre aucun nom réservé, ni s'en approcher par la casse ou des caractères qui se
  ressemblent : les classes `btc-dir-15m`, `cascade-liquidable-24h` et `liquidation-eligible-coverage`, la clé USDe
  committée, les noms kata (`KATA_CLASS_RE`) et le préfixe de clé `kata:`.
- Une classe BYO n'accepte pas `attested`.
- Son suivi en ligne (2.5) se lie à sa classe et à la clé de l'appelant : un verdict BYO ne nomme aucune cellule
  (`cell_key` nul), donc la politique nomme pour `task_class` la classe de la requête et pour `cell_key` son
  `predictor_id`.
- MONARK ne voit ni ne vérifie les données ou le modèle de l'appelant, ni que ces nombres sont des scores de non-conformité
  d'un modèle (`CALIBRATE_LABEL`).

**Le niveau en ligne de la classe, optionnel (`calibration.aci`).** L'appelant porte les preuves du niveau, et le serveur
les rejoue à chaque appel sans rien garder (`packages/hikae/src/aci.ts`, `aciReplay`). `scores` porte alors tous les scores
arrivés, dans leur ordre d'arrivée, et `aci` :

- `gamma` : le pas du niveau, dans ]0, 1[, fixé pour la classe ;
- `window` : combien de derniers scores la région lit ;
- `decided_after` : pour chaque score, combien de scores étaient arrivés quand son signal a été décidé, un entier de 0 à
  son rang.

Le niveau part de `alpha` et bouge quand une issue arrive : `A` devient `A + gamma (alpha - err)`, sans plancher ni
plafond. `err` vaut 1 quand le score de l'issue dépasse le seuil que son signal a reçu, retard compris. La région est le
quantile des `window` derniers scores au rang `ceil((n + 1)(1 - A))`.

- Tant que la fenêtre n'a pas de région au niveau `alpha`, un signal ne bouge rien et son score ne fait que calibrer : la
  première région est exactement celle du split.
- Un niveau sous `1/(n + 1)` donne la ligne entière, sans région finie : la décision s'abstient (`under_calib`). Un
  niveau à 1 ou au-dessus donne la région vide : elle s'abstient aussi (`region_degenerate`). À `alpha = 0.1` et
  `gamma = 0.05`, sur une fenêtre de 100 scores, trois manqués de suite mènent le niveau à -0,035, donc à l'abstention,
  et neuf issues couvertes rouvrent une région.
- Le verdict porte `method: "hac-cp"` ; son `n_calib` et son `scores_sha256` décrivent la fenêtre ; son `alpha` reste la
  cible. La décision fermée n'a pas de champ pour le niveau : le texte de la réponse le donne (`aci level=…`).
- Le moteur tient un niveau par preuve portée. Une classe de la stratégie a le sien, une autre source de signaux a sa
  propre classe et donc le sien, et un actif n'en a pas par lui-même : il entre par l'unité de son score, que l'adaptateur
  choisit. `gamma` et `window` se déclarent avec la classe, dans le dépôt privé.
- Au plafond de 10 000 scores, l'adaptateur repart des `window` derniers scores, chacun avec `decided_after` à 0 : le
  niveau revient à `alpha`, et la borne de 2.4 repart de zéro.
- Le suivi en ligne (2.5) reste à part : il ne peut que baisser `B_t`. Ses manqués se jugent sur la région split de la
  classe, pas sur celle du niveau : sur une région qui bouge avec ses propres manqués, leur taux revient à `alpha` par
  construction, et l'alarme ne sonnerait pas.

**La voie committée, celle des classes du moteur.** La calibration d'une classe entre dans ce dépôt, sous la forme d'une
table de politique `class-policy-v2` par classe, et chaque décision nomme sa table par `policy_table_sha256`. Pour les
classes kata, le code lit chaque table dans le fichier `apps/harness/data/kata/tables/<task_class>.json`
(`policy-committed.ts`) et refuse de charger des octets dont le sha256 n'est pas celui épinglé pour la classe dans
`apps/harness/src/policy-committed-pins.ts`. Aucune table n'y est encore committée (`COMMITTED_TABLES` est vide) : toute
classe kata s'abstient aujourd'hui. Les classes de la stratégie ne prennent pas cette voie, puisque leur calibration
n'entre pas dans ce dépôt public.

### 2.3 Les paramètres d'un appel (`params`)

| Paramètre | Ce qu'il règle |
|---|---|
| `remainingBudget` | `B_t`, le budget d'autorisation restant, porté par l'appelant |
| `bFloor` | le plancher : en dessous, la décision s'abstient (`budget_exhausted`) |
| `tau` | la taille au plus d'un ensemble pour un COMMIT |
| `tauInterval` | la largeur au plus d'un intervalle pour un COMMIT |
| `alpha` | la non-couverture visée, dans ]0, 1[ |
| `nMin` | le nombre de points de calibration au moins (`n_calib`), entier ≥ 1 |
| `intent` | ce que la stratégie veut faire : une étiquette de l'ensemble, ou un nombre de l'intervalle |
| `tool` | le nom de l'outil visé : recopié dans la décision, jamais appelé |
| `clockOpen` | la fenêtre de décision est-elle encore ouverte |
| `calibration` | optionnel : la voie BYO, et le niveau en ligne de la classe (2.2) |
| `suivi` | optionnel : le suivi en ligne (2.5) |

### 2.4 Ce que rend `gate`, et ce que la stratégie en fait

La règle de HIKAE L3 (`packages/hikae/src/l3-gate.ts`) :

- **ABSTAIN** quand `yhat` n'est pas évaluable (`non_evaluable`) ; quand il y a moins de `nMin` points de calibration
  ou pas de région (`under_calib`, ou la raison du verdict) ; quand un intervalle est dégénéré (`region_degenerate`) ; quand
  `intent` n'est pas dans la région (`intent_not_in_region`) ; quand `B_t` est sous `bFloor` (`budget_exhausted`) ;
  et quand un DEFER arrive fenêtre fermée (`clock_expired`).
- **DEFER**, fenêtre ouverte, quand l'ensemble a plus de `tau` étiquettes (`set_too_large`) ou que l'intervalle est
  plus large que `tauInterval` (`interval_too_wide`).
- **COMMIT** quand `intent` est dans la région, que la région tient sous `tau` ou `tauInterval`, et que `B_t` est
  au moins `bFloor` (`covered`).

La garantie est celle que déclare le code : couverture marginale `1 - alpha`, en échantillon fini, sous échangeabilité
dans la classe. Elle ne vaut que pour des signaux échangeables avec ceux de la calibration ; des données décalées ou
ordonnées dans le temps la font tomber (`CALIBRATE_LABEL`). Ce n'est jamais une probabilité d'avoir raison. Des
signaux de marché sont ordonnés dans le temps : le suivi en ligne (2.5) suit les issues arrivées de la cellule et peut
fermer son segment sur une alarme.

Avec le niveau en ligne (`calibration.aci`, 2.2), cette couverture ne s'applique plus. Le code déclare autre chose, sans
aucune hypothèse sur les scores : sur les `T` issues qui ont bougé le niveau, avec `k` manqués et `D` le plus grand retard,
`|k/T - alpha|` reste sous `max{alpha + (D+1) gamma (1-alpha), 1 - alpha + (D+1) gamma alpha} / (gamma T)` (`aciBound`,
preuve dans `aci.ts`). Cette borne compte tous les signaux rejoués, pris ou non ; une issue qui a reçu la ligne entière
compte comme couverte, une qui a reçu la région vide comme manquée. Elle ne dit rien d'une fenêtre, ni des seuls signaux
pris. Au-dessus de 1, elle ne dit rien : à `alpha = 0.1`, `gamma = 0.05` et sans retard, elle vaut 0,0604 à `T = 300` et
2,0112 à `T = 9`. Le moteur ne peut pas vérifier que les preuves portent toutes les issues.

`gate` ne fait que rendre une décision : il n'appelle jamais `tool`, et il ne place aucun ordre.

### 2.5 Le suivi en ligne (`params.suivi`), optionnel

L'appelant porte les preuves de la cellule, et le serveur les rejoue à chaque appel sans rien garder
(`packages/hikae/src/suivi/replay.ts`, `SuiviEvidence`) :

- `policy` : la politique de la cellule ; son `task_class` est la classe de la requête, et son `cell_key` la cellule du
  verdict, ou sur la voie BYO le `predictor_id` de la requête (2.2) ;
- `evaluations` : ses évaluations de référence depuis son début (`seq`, `t_step_ms`, `yhat_ref`, `produced_at_ref`,
  `pre_member`) ;
- `outcomes` : leurs issues arrivées (`seq`, `resolved`, `member`, `miss`) ;
- `open` : l'état de départ du segment.

Bornes : 500 évaluations et 500 issues, 8 paris par mélange, 20 caractères par texte rationnel, et une borne de
travail de 3600 bits (`ROADMAP.md`, ligne « Le suivi dans le gate »). Le gate prend pour `B_t` le plus petit de
`remainingBudget` et du budget rejoué : le suivi ne peut que baisser le budget. Un segment sans licence ou fermé
(`closed_by` vaut `alarm` ou `w_exhausted`) rend `B_t` à -1, donc un ABSTAIN `budget_exhausted`. La politique d'une
classe de la stratégie vit avec sa calibration dans le dépôt privé (étape 3), et l'appelant la porte, sur la voie BYO
(2.2).

### 2.6 Un ordre passe par Genkan (`judge`)

`judge` (`apps/harness/src/tools/judge.ts`) prend l'enveloppe du gate (`prediction`, `params`, `attested` optionnel),
plus un ordre et des limites :

- `order` : `kind`, `target` (la place), `asset`, `amount`, et pour un SWAP seulement `assetOut` et `minOut` ;
- `limits` : `venues`, les places permises, et `assets`, chacun avec son `cap` ; 255 places et 255 actifs au plus.

Un montant est la chaîne décimale d'un entier : 0, ou 1 à 39 chiffres sans 0 de tête (`JUDGE_DECIMAL_PATTERN`). La
stratégie choisit donc l'unité de chaque actif (1.2). Un nom de place ou d'actif suit `JUDGE_NAME_PATTERN` : 1 à 128
caractères parmi `0-9`, `a-z`, `:`, `.`, `_`, `/`, `@`, `-`.

Les règles du noyau Lean (`apps/genkan/kernel/Genkan/Judge.lean`, `judge`), dans l'ordre :

1. Seuls SWAP, EXIT et OPEN passent ; TRANSFER et APPROVE sont refusés (`kind`).
2. La cible doit être une place listée (`venue`).
3. Une EXIT est alors permise, quelle que soit l'action de HIKAE, l'actif et le montant.
4. Tout autre ordre exige l'action COMMIT (`not-commit`), un actif listé (`asset`) et un montant au plus égal à son
   plafond (`over-cap`).
5. Un SWAP exige en plus un `assetOut` listé (`asset-out`) et un `minOut` au-dessus de 0 (`min-out`).

Un `allow` ne dit rien de plus (`JUDGE_LABEL`) : le noyau ne connaît ni solde, ni position, ni prix, ni règle de place ;
un plafond tient un ordre, pas un total ; un `minOut` au-dessus de 0 n'est pas une borne de glissement ; une EXIT
permise est marquée `reduce_only` et doit s'exécuter en réduction seule. Quand aucun noyau ne tourne (`unavailable`),
que le noyau refuse la requête (`refused`) ou que sa réponse n'est pas un verdict (`unreadable`), l'ordre est refusé.
Une EXIT dont le gate refuse l'enveloppe est jugée quand même, sous l'action ABSTAIN, sans décision du gate
(`decision` à `null`, le refus dans `gate_error`) ; une enveloppe que refuse le schéma d'entrée reste refusée, EXIT
comprise. La réponse porte `decision`, `gate_error`, `kernel_verdict`,
`kernel_reason`, `reduce_only` et `kernel_request_sha256`.

### 2.7 Sur papier (étape 8)

L'exécuteur papier (`apps/harness/src/paper.ts`) prend une configuration (`venues` et, par actif, son `total`) et des
soumissions (`id`, `at_ms`, `prediction`, `params`, `attested` optionnel, `order`).

- Seuls OPEN et EXIT sont remplis ; un SWAP est refusé (`kind_not_paper`).
- Il donne au noyau, comme plafond de chaque actif, le reste de son total : le total tient sur tout le journal.
- Une OPEN permise remplit son montant ; une EXIT permise remplit au plus la position ouverte ; le montant engagé est
  brut, une EXIT ne le libère pas.
- Chaque étape va dans un journal déterministe, une ligne canonique par étape, que `replayPaperJournal` rejoue sur le
  noyau ; garder à part la tête du journal (le sha256 de sa dernière ligne) le tient à sa fin.

### 2.8 Ce qui reste au fondateur

- La stratégie elle-même (partie 1).
- Les places, les actifs et l'unité des montants ; les totaux réels.
- Ce que fait la stratégie sur un DEFER et sur un ABSTAIN.
- Le premier ordre réel (étape 9), ordre par ordre, la place et la garde des clés.
- Ce qui est publié : ce fichier public ne porte que la partie 2 ; la stratégie reste dans le dépôt privé (décision du
  fondateur du 2026-11-05).
