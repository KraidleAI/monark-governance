# ADR-M016 — Nommage des `task_class` : coexistence par horizon, `<objet>-<horizon>`

- **Statut** : **PROPOSÉ** — décision orchestrateur `claude-fable-5-1` sur avis advisor-defi ; à accepter par le
  validateur-humain / investisseur (AgileGates). Aucun code, aucun contrat gelé modifié par cet ADR (diff 0 octet
  sur `schemas`/`packages/contracts`).
- **Date** : 2026-09-18. **Rattachement** : mission P0-b (ADR-M015 D1 (d)) ; ADR-M008 D4 (`stable-run-velocity-24h`) ;
  `docs/etude-suite-2026-09-18/PROPOSITIONS.md` l.50-67 (contradiction relevée) ;
  `NARABI PHASE/narabi-phase/04-task-classes.md` (2026-09-15).
- **Roster / provenance** : rédigé par worker `claude-opus-4-8[1m]` effort max ; G2 fraîche ≠ générateur ; vérif
  adversariale orchestrateur (R-21). Squelette ISO/IEC/IEEE 42010 (contexte, décision, alternatives, conséquences).

## Contexte

Deux documents internes nomment différemment ce qui *paraît* être la même classe de tâche (PROPOSITIONS.md
§CONTRADICTION, l.50-67, [lu]) :

- `PROCUREMENT-P-F-5-msusd-data.md` puis ADR-M008 F2, `packages/monark/src/adapter-narabi.ts:29`, `gate.ts:54`,
  `skills/monark/*`, `README.md` : **`stable-run-velocity-24h`** (horizon 24 h) — **committée et servie** (region
  `interval`, calibration USDe committée par clé, sinon `under_calib`).
- `NARABI PHASE/narabi-phase/04-task-classes.md` (2026-09-15, [lu]) : classes live **`flow-redeem-1h`**
  (Diamond–Dybvig, run intra-day, horizon **1 h**) et **`utilization-lock-1h`** (contrainte de capacité
  Morpho/Aave/Kamino, horizon 1 h), et **REJETTE** explicitement « `flow-redeem-15m` / `-24h` » comme
  « **copies d'horizon ≠ Mondrian** ».

Le document le plus récent lu (`docs/AUDIT-next-piece-2026-09-18.md`) continue d'utiliser
`stable-run-velocity-24h` sans mentionner l'autre nom : la contradiction **n'est pas** résolue par récence. Deux
options avaient été remontées (canal 2) : (a) `flow-redeem-1h` **supersède** `stable-run-velocity-24h` (renommage) ;
(b) **coexistence** (lois différentes).

**Fait dirimant** (04-task-classes.md, [lu]) : `flow-redeem-1h` et `utilization-lock-1h` ont un **payeur
différent** (holder secondaire / file AP vs borrower-curateur) ⇒ « **Mélange = Mondrian vide** » (partition
conformale par classe ; le doc invoque Vovk, [2nd] — **aucun chiffre n'en dépend ici** ; procurement formé si une
borne Mondrian devient porteuse). Un horizon différent = une **loi** différente (une file Diamond–Dybvig 1 h n'est
pas un pas de clearing 24 h) ⇒ une **région** conformale différente.

**Distinction load-bearing à ne pas confondre** : `AttestedFlow.window` (`1h | 24h`, enum **gelé** du schéma,
`adapter-narabi.ts:69/155`) est la **fenêtre d'observation de l'attestation** (elle normalise la vélocité *par
heure*, `velocityPerHour = ratio / WINDOW_HOURS[window]`) — c'est un **axe distinct** du **suffixe d'horizon de la
`task_class`** (l'horizon de *prévision* et la clé de région Mondrian). Le premier est gelé et n'est pas l'objet de
cet ADR ; le second est ce que cet ADR nomme.

## Décision

**COEXISTENCE.** Deux horizons = deux lois = deux régions, **jamais poolées**. Précisément :

1. **Le suffixe d'horizon est porteur** (partie de la clé Mondrian `(task_class, predictor_id)`). Règle de
   nommage : **`<objet>-<horizon>`** (ex. `stable-run-velocity-24h`, `flow-redeem-1h`, `utilization-lock-1h`),
   l'horizon en unité explicite (`15m`/`1h`/`24h`/`Nd`).
2. **La classe 24 h reste telle quelle.** `stable-run-velocity-24h` (committée, servie) **n'est ni renommée ni
   superseded** : elle porte la calibration USDe committée (ADR-M008 F2/Amendement bis) et le contrat gelé.
3. **Toute classe 1 h = NOUVELLE `task_class` Mondrian** : nouvelle clé, **nouveau census**, nouvelle calibration
   committée (ou `under_calib` honnête), **jamais une « copie d'horizon »** d'une classe existante. `flow-redeem-1h`
   et `utilization-lock-1h`, si construites, sont des classes **neuves**, pas des variantes de
   `stable-run-velocity-24h`.
4. **`AttestedFlow.window` (`1h|24h`) reste gelé et inchangé** : il ne devient PAS le sélecteur de `task_class`.
   Une attestation à `window=1h` reste, aujourd'hui, mappée par l'adaptateur sur `stable-run-velocity-24h`
   (`NARABI_TASK_CLASS` hardcodé, `adapter-narabi.ts:212`) avec vélocité normalisée par heure — l'ouverture d'une
   `task_class` 1 h distincte est un **lot futur** (adaptateur + calibration + census), pas un effet de bord du
   champ `window`.

Cette décision suit la doctrine interne (04-task-classes.md) et l'avis advisor-defi ; elle **n'est pas** un verdict
final (G7 + acceptation validateur-humain restent dus).

## Alternatives rejetées

- **(a) `flow-redeem-1h` supersède `stable-run-velocity-24h` (renommage/horizon unique)** : orphelinerait la
  calibration USDe committée et la classe servie (gate.ts, skill, README, endpoint), **casserait la clé gelée**, et
  **confondrait deux lois** (run Diamond–Dybvig intra-day 1 h vs vélocité de rachat USDe 24 h). Rejetée.
- **(b) Pooler les horizons (une classe, plusieurs `window`)** : « Mondrian vide » (04-task-classes.md, [lu]) — des
  lois/payeurs différents ne peuvent partager une région conformale sans vider la garantie par classe. Rejetée.
- **(c) Créer `stable-run-velocity-1h` / `-15m` par copie d'horizon** : explicitement « copies d'horizon ≠
  Mondrian » (04-task-classes.md). Un autre horizon exige un **census et une calibration propres**, pas une copie.
  Rejetée.
- **(d) Ne pas trancher (laisser les deux noms flotter)** : dette nue interdite (P5, règle Dettes) — la
  contradiction resterait un piège de dispatch/marketing. Rejetée.

## Conséquences

- **`packages/monark/src/adapter-narabi.ts`** : enum `window` **gelé `1h|24h` INCHANGÉ** (fenêtre d'attestation,
  normalisation vélocité) ; `NARABI_TASK_CLASS = "stable-run-velocity-24h"` inchangé. Aucune modification dans ce lot.
- **`apps/harness/src/tools/gate.ts`** : le **dispatch reste par `task_class`** (D5). Une future classe 1 h = un
  **nouveau bras de dispatch** + sa calibration committée (ou `under_calib`), jamais un ré-emploi de la clé 24 h.
- **skill / README** : **aucune classe annoncée sans calibration committée** (honnêteté ADR-M008 D9 / K-1). Tant
  qu'une classe 1 h n'est pas calibrée+committée, elle **n'apparaît sur aucune surface publique** ; les surfaces
  déclarent honnêtement l'écart repo/endpoint (ADR-M008 Amendement 2026-09-16).
- **Nommage** : `<objet>-<horizon>` documenté ; le suffixe d'horizon est **normatif** (clé Mondrian). Toute nouvelle
  classe passe G0 (census + calibration) avant service.
- **Positif** : contradiction close sans toucher au gelé (diff 0 octet `schemas`/`contracts`) ; la doctrine
  Mondrian (une loi = une région) est rendue explicite et opposable ; extension future (1 h) cadrée.
- **Négatif (assumé)** : la coexistence multiplie les classes (une par horizon/loi) — c'est le prix de la garantie
  par classe, déclaré, pas masqué.
- **Relations** : cite ADR-M008 D4/D9 ; n'amende aucun contrat gelé ; `error_origin` = n/a (gouvernance de nommage).
