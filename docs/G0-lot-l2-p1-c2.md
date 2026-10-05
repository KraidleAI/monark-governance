# G0 du lot P1-c2 du chantier L2 : rejeu du carnet, minutes et parité

- **Rattachement** : ADR-L2-CAPTURE-1 (D-9, D-10, D-11, D-17 ; §2.3 points 5, 7 et 9 ; TL-3 `l2_minute_window_exact`, TL-5
  `l2_daily_parity_counts` ; M-2, M-4) ; plan `docs/G0-partie-l2-p1.md` §3 points 3, 20 et 21, §4 (S4, S5, A1 à A3, Q-P1-7), §7, §8.2
  (ligne P1-c2), §8.3 (c2 sur b2 et c1 ; Q-P1-8 tranchée) ; faits `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md` (e), (h), (k) ;
  G0 et G7 de c1 (`docs/G0-lot-l2-p1-c1.md`, `docs/G7-lot-l2-p1-c1.md` : m-5 du premier G2, m-9) ; réponses de MONARK à c1
  (`recherches/coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-143-reponses.md` : Q-G2-2, m-5 à c2 ; Q-C1-7, amorce et
  ancres hors de c1).
- **Base** : `173ea0fd` (`lot/etude-suite`, c1 #143 et #144 fusionnés). Branche `recherches/l2-p1-c2`. Auteur : RECHERCHES. Aucun
  réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, ancres et instantanés écrits à la main, horloges
  injectées ; données synthétiques, aucune série brute au dépôt.

## Prérequis et faits

- **Q-P1-8, tranchée** : minutes et parité sont calculées au scellé par le code du rejeu, depuis le brut seul. Ici : la dérivation est
  une fonction pure et synchrone du dossier `--out` (segments, ancres du dossier du jour, instantanés REST gardés par b1), appelée par
  `sealDay` avant toute écriture ; c6 la rappelle pour `--from-raw`.
- **Q-P1-7, tranchée** : lecture de chaîne ; un premier événement restant dont `U` = `lastUpdateId` + 1 est accepté.
- **FAITS-L2-ACCESS-2 (e)** : quantités absolues ; (h) : S4 strict, S5 large et fermé, A1 strict ; (k) : prix multiples de `tickSize`,
  échelle s = rang de la dernière décimale non nulle (`exchangeInfoFacts().scale` de b1).
- **m-5 du premier G2 de c1** (Q-G2-2, à c2) : une rupture ouverte à J 23:59 et refermée à J+1 n'apparaît pas au `missing.json` de J+1,
  et le premier départ n'ouvre aucun trou de 00:00 au premier `open`. c2 rejoue la chaîne depuis le brut et nomme ses trous.
- **m-9 de c1** : les dérivés entrent au dossier et au manifeste avant `SHA256SUMS` ; `DAY_FILES` porte déjà `minutes.jsonl`.

## Contenu (fichiers de §8.2 : `scripts/l2/derive.mjs`, `scripts/l2/derive.d.mts`, `test/l2-derive.test.ts` ; crochet dans `day.mjs`)

Couture : `deriveDay({ out, symbol, day, start, end, segs, marks, dir, scale })`, passée à `sealDay` par son appelant (c5, c6) sous
la forme `derive: (ctx) => deriveDay({ ...ctx, scale })`.

1. **Crochet de `sealDay` (m-9)** : paramètre `derive` (nul par défaut : sans lui, rien ne change, les tests de c1 restent exacts).
   Appelé après l'index du jour, avant la création du dossier : un arrêt nommé du dérivé n'écrit rien. Il rend `files` (noms de
   `DAY_FILES`, écrits et synchronisés avant `SHA256SUMS`), `manifest` (clés ajoutées au manifeste), `missing` (clés ajoutées à
   `missing.json`), `refs` (chemins relatifs listés en plus au `SHA256SUMS`), `modules` (ajoutés à `script_sha256`). Lignes de
   `day.mjs` changées en place, aucune ligne ajoutée avant une ancre : les onze tueurs de c1 gardent leur ligne.
2. **Instantanés candidats** : `anchor-open.json` du dossier du jour (écrit par c5, Q-C1-7) ; les instantanés `depth` gardés par b1
   (`rest/<SYMBOLE>/<SYMBOLE>-depth-<heure>.json`) dont l'heure de demande est dans [début − 1 h ; fin) et, si l'ancre est là, dont le
   `lastUpdateId` la dépasse. Ordonnés par `lastUpdateId`. Un corps illisible est écarté (essai vain en ligne, `snapshot_shape`).
3. **Rejeu (code de chaîne de b2, transcrit)** : différences du flux `<symbole>@depth@100ms` des connexions spot du symbole, segments
   de la fenêtre de c1 (Q-C1-6), dans l'ordre de lecture (`cid`, `seg`, `rank`), queues marquées exclues par le lecteur de a2. Carnet
   absent : candidats dont `lastUpdateId` < `U` − 1 passés (S4, lecture de chaîne) ; l'événement dont `u` ≤ `lastUpdateId` écarté (S5,
   large) ; sinon carnet posé à l'instantané (S6), puis l'événement appliqué (S7). Carnet présent : `u` < identifiant ignoré (A1, ce qui
   absorbe les doublons d'un chevauchement), `U` > identifiant + 1 ou forme illisible : rupture, carnet jeté ; quantité posée, niveau
   retiré à zéro (A2) ; identifiant = `u` (A3). L'amorce (différences de la veille postérieures à l'ancre) est ainsi rejouée sans être
   copiée : ses segments sont dans la fenêtre et déjà listés au `SHA256SUMS` (seuls ceux des trames du jour le sont : les segments de
   l'amorce y entrent par `refs`).
4. **Prix en entiers (§3 point 20, §2.3 point 7)** : chaque prix lu à l'échelle s en `BigInt` ; un chiffre non nul au-delà de s
   arrête le dérivé du symbole, `off_scale` (`DayStop`), rien écrit ; aucune heure ni aucun prix en flottant.
5. **Minutes (§3 point 21, D-10, TL-3)** : t = début + k × 60 s, k de 0 à 1 439 ; la minute t est le carnet après les événements
   d'heure de place strictement antérieurs à t, écrite au premier événement enchaîné d'heure ≥ t. Ligne : `t`, `u`, `bids` et `asks`
   (niveaux à ±100 pb, chaînes telles que reçues, du meilleur au plus loin), `n` (nombre par côté), `dist_bp` (par côté, distance au
   milieu du niveau le plus profond de l'instantané d'ancrage ou de reprise, M-2, arrondie vers le bas). Fenêtre : 100·|2p − b − a| ≤
   b + a, b et a meilleurs prix. Absente et listée : `chain_open` (rupture ouverte à t), `side_empty`, `no_later_event` (aucun événement
   enchaîné d'heure ≥ t avant la fin du brut lu).
6. **Trous de chaîne (m-5)** : au `missing.json`, clé `chain_holes`, chaque trou en heure de place (`from_place_us`, `to_place_us`) :
   d'une rupture (heure du dernier événement appliqué) ou du début du jour si le carnet n'est pas posé à minuit, jusqu'à l'événement de
   la reprise (nul si aucune) ; coupés au jour. Heures de place, nommées à part des heures de l'hôte des trous de c1.
7. **Parité (D-9, §2.3 point 9, TL-5)** : ancre de fermeture `anchor-close.json` (L = son `lastUpdateId`) ; au premier événement
   appliqué dont `u` ≥ L, si `U` ≤ L + 1, carnet et ancre portés au même `u` par cet événement (quantités absolues), écarts comptés par
   côté dans la plage de prix de l'ancre (quantités comparées en décimales normalisées) ; sinon, ou si le jour finit avant, absente
   nommée `chain_open` ; ancre absente ou illisible : `anchor_missing`, `anchor_shape`. Au manifeste : `parity` = `{ u, since, bids,
   asks }`, `since` = `lastUpdateId` de l'instantané sur lequel le carnet a été posé.
8. **Manifeste** : `replay` = `{ scale, start, syncs, minutes: { present, absent } }` (`start` : `anchor` ou `snapshot` ou nul) ;
   `script_sha256` porte `scripts/l2/derive.mjs`.

## Tests (`test/l2-derive.test.ts`), tueurs (un par test)

Le fichier appelle `keepCause` au chargement et fait son dossier temporaire dans `before()` ; chaque test charge `derive.mjs` par un
import dynamique qu'il affirme : la base, sans le module, rougit par assertion.
- **`l2_minute_window_exact`** (TL-3) : niveaux à la borne de ±100 pb gardés, au-delà écartés ; rupture ouverte ⇒ minute absente
  `chain_open`, trou nommé ; prix hors de l'échelle ⇒ `off_scale`, aucun dossier. Tueur : `<=` → `<` de la fenêtre.
- `l2_minute_place_time_strict` : un événement d'heure t n'est pas dans la minute t ; distance arrondie vers le bas ; minutes de fin
  sans événement : `no_later_event`. Tueur : `t <= E` → `t < E`.
- **`l2_daily_parity_counts`** (TL-5) : 0 écart sur une suite cohérente, ancre de fermeture portée par un événement à cheval ; écarts
  comptés par côté sur une ancre altérée, hors de sa plage non comptés ; ancre manquée ⇒ `anchor_missing`. Tueur : comparaison des
  quantités.
- `l2_day_replay_from_anchor_and_amorce` : départ à l'ancre d'ouverture, amorce de la veille rejouée (`U` = `lastUpdateId` + 1
  accepté, Q-P1-7), événements antérieurs écartés ; carnet égal à celui de `createBook` de b2 nourri des mêmes trames ; sans ancre,
  départ sur un instantané gardé, référencé au `SHA256SUMS`, segments de l'amorce listés ; `minutes.jsonl` et `script_sha256`.
  Tueur : borne de S4 (`lastUpdateId` < `U` − 1 → < `U`).
- `l2_day_chain_holes_across_midnight` (m-5) : rupture ouverte la veille, refermée après minuit par un instantané : trou de 00:00 à la
  reprise ; premier départ sans ancre ni instantané avant midi : trou de 00:00 ; rupture du jour. Tueur : coupe du trou au début du jour.

## Preuve rouge, contrôles

- Commit du G0 ; commit des tests seuls (rouges, avec `derive.d.mts` et le type du crochet dans `day.d.mts`) ; gel ;
  `node scripts/red-proof.mjs --base 173ea0fd --gel <gel> --repo <worktree> --draw 5 --seed 37` ; ancres par `verifie-ancres.mjs
  --touched` (tueurs de c1 compris) ; `test:main`, `test:export`, `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; R-25 ≤ 547.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie : `scripts/l2` est hors de la liste d'export)

- **Q-C2-1** : le rejeu transcrit S4, S5, A1 à A3 de b2 en code synchrone et pur, plutôt qu'appeler `createBook` (asynchrone, lié au
  client REST et au journal, alors que `sealDay` est synchrone). Garde : le test du rejeu compare le carnet à celui de `createBook`
  nourri des mêmes trames. (défaut : transcription ; refondre `book.mjs` déplacerait les ancres de b2)
- **Q-C2-2** : crochet `derive` de `sealDay` tel que §1, lignes de `day.mjs` changées en place. (défaut : oui ; c3 y ajoutera ses deux
  empreintes par la même voie, c5 compose les deux)
- **Q-C2-3** : candidats de reprise = ancre d'ouverture et instantanés `depth` gardés par b1 dans [début − 1 h ; fin) ; seuls ceux
  utilisés sont listés au `SHA256SUMS` (un candidat jamais utilisé ne change pas le choix des autres). Limite : un instantané antérieur
  à la fenêtre n'est pas lu (« dernier instantané antérieur » de §2.3 point 9 borné à une heure, comme L2-DAY-SCAN-WINDOW-1).
  (défaut : oui)
- **Q-C2-4** : minutes de 00:00 à 23:59 ; une minute n'est présente que si un événement enchaîné d'heure ≥ t la suit (sinon
  `no_later_event`) : une liaison morte sans rupture vue ne donne pas un carnet périmé. (défaut : oui)
- **Q-C2-5** : trous de chaîne au `missing.json`, clé `chain_holes`, en heure de place, plutôt qu'au manifeste. (défaut : oui, réponse
  littérale à m-5)
- **Q-C2-6** : parité portée au même `u` par le seul événement à cheval ; `since` déclare un carnet posé sur l'ancre de fermeture
  elle-même (parité triviale, lisible). (défaut : oui)
- **Q-C2-7** : `minutes.jsonl` est tenu en mémoire avant l'écriture (rien d'écrit avant un `off_scale` possible) ; taille réelle
  mesurée en M-1, comme `INDEX_BOUND`. (défaut : oui ; item proposé L2-MINUTES-SIZE-1)
- **Q-C2-8** : l'échelle s est passée par l'appelant (c5 la tient d'`exchangeInfo` de la veille, §3 point 14), écrite au manifeste ;
  une échelle qui n'est pas un entier de 0 à 18 arrête, `bad_scale`. (défaut : oui)
- **Q-C2-9** : chevauchement rejoué connexion par connexion ; les doublons de la neuve sont ignorés par A1. Limite : deux connexions
  parallèles hors chevauchement, la plus ancienne rompue, la neuve sans rupture : le rejeu reprend sur un instantané au lieu de
  basculer. (défaut : oui, déclaré ; M-5)
