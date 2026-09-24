# ADR-M015 — Phase de portefeuille après Narabi + ACI : « rendre le moteur réel et mesuré » avant toute nouvelle pièce

- **Statut** : proposé (G0 de phase) 2026-09-18 · checkpoint-1 validateur dû · décision = investisseur (CA-2)
- **Rattachement** : `docs/PHASE-SUIVANTE.md` Action 1 ; inventaire `docs/etude-suite-2026-09-18/` (INDEX-corpus 139 fichiers, FICHES-pieces 16,
  PROPOSITIONS, CARTOGRAPHIE-code, ACTU-defi-par-piece, AVIS-advisor-defi-2e-cle-c-prime, AVIS-advisor-marche, AVIS-advisor-defi-portefeuille,
  AVIS-advisor-architecture, produit-ukemi-loop-clearing + ukemi-eisenberg-noe-audit reçus le 09-18) ; trois consultations du 2026-09-18 archivées ;
  checkpoint-1 persisté `docs/CHECKPOINT1-M015.md` ; ADR-M005 (harnais pur, D0/D6/K-8), M006 (D8 mesure de demande, N non fixé), M008, M009 (item a), M012, M014.
- **Demande investisseur (verbatim)** : « on continue la partie moteur ? ou on va plutôt étudier les 7 pièces restantes… la fleet reste la même…
  cartographie complète, est-ce que les composants se parlent ? plomberie, puis l'orchestrateur pose un plan qu'on va suivre, pose une stratégie…
  trouvons la grosse plus-value et comment la décrocher. »

## Contexte (faits établis par l'inventaire, tous sourcés dans le dossier)
1. **Les composants ne se parlent presque pas** (CARTOGRAPHIE §3) : deux tuyaux réels (sentinelle → fichiers → site ; harnais → 4 outils purs
   servis). Le triangle Shōgen + Hikae + Ukemi (`crossAgentGate`) n'est appelé que par son test ; le `gate` servi n'a **aucune prise pour une
   attestation** (`GateEnvelope = {prediction, params}`, 12 sites `residual: []`) ; le site n'importe aucun moteur ; le token n'est câblé à rien.
2. **Aucune des 12 pièces à venir n'a d'acheteur nommé** (FICHES) ; l'actualité montre des problèmes vivants partout mais une demande de la forme
   MONARK **non démontrée** pour chacune (ACTU §13). Trois marchés adjacents paient des titulaires (risk stewards Aave, pare-feu de transaction
   type Blockaid, builders HIP-3 qui absorbent leurs pertes).
3. **Calibrabilité** (advisor-defi) : sur les 7 pièces, une seule est calibrable après mesure de façon nette (**Koyomi** : gap de réouverture par
   marché, paires denses, held-out 2026-07-27 à recomputer) ; Kaihi et Kyokusen conditionnelles ; Mokugeki déplacé vers le produit Verdict ;
   Kessai (attestation, pas région), Kamae (PnL non observable, politique) et **Genkan (politique, pas région)** non calibrables.
4. **Genkan** : la fonction « allow / renvoi humain / deny + journal » existe déjà (Blockaid AI agent tools, MetaMask Agent Wallet Guard Mode,
   Fystack open source, Coinbase Agentic Wallets, Safe Allowance) ; le gap MONARK est de **packaging** (région nommée, `B_t` dépletable,
   résidu nommé, File rejouable), et c'est exactement ce qui n'est pas câblé. Question non résolue : *quelle `Prediction` Hikae conformalise
   quand l'entrée est `transfer(to, amount)` ?* Sans réponse, Genkan est un spend guard en vocabulaire MONARK.
5. **La demande n'est pas mesurable aujourd'hui** : ADR-M006 D8 fixe le test (« ≥ N POST d'origine ≠ MONARK sous 30 j »), **N n'a jamais été
   fixé** ; le bloc Caddy du harnais (`mcp.`/`api.`) **n'a pas de directive `log`** (seule la vitrine `/narabi/*` en a une depuis 09:33 UTC).
   Compteur ClawHub : « Downloads 30d = 219 » lu à l'écran par l'orchestrateur le 2026-09-18 (226 à 20:35 UTC, capture textuelle datée dans
   `docs/biblio/procurements-M015/PR-4-clawhub-counter.md`), définition du compteur non sourcée, non reproduit par API (404) ⇒ **quarantaine PR-4** ;
   des pulls, pas des appels ; jamais une mesure de demande, jamais une phrase publique.
6. **Dettes d'entrée mesurées** : recorder `q99 = ∞` silencieux pour n < 99 (bloque toute population < 99 paires) ; item (a) M009 (`B_t` à
   bFloor = 0, P(B_t < 0) 35–47 % [abs]) non mesuré ; `@monark/ukemi` déclaré jamais importé ; commentaires périmés ; contradiction de nommage
   `stable-run-velocity-24h` vs `flow-redeem-1h` ; `under_witness` cité dans ADR-M008 sans exister dans l'enum ; `lint-ratchet` 69.

## Décision (stratégie sur 12 mois)
**La grosse plus-value n'est pas une 5ᵉ pièce : c'est un moteur dont les composants se parlent réellement, dont la demande est mesurée, et dont
la seule revendication statistique publique (une région mesurée sur une loi mesurée) s'étend par des mesures, pas par des promesses.** On la
décroche par le tuyau le moins cher qui rend le triangle servi, par l'instrumentation de la demande avant tout lot produit, et par une seule
nouvelle pièce instruite sur pièces (Koyomi), le reste restant gaté par des décisions investisseur explicites.

**D1 — P0, dette d'entrée (2 lots, T1).** (a) recorder : `q99_alert: null` + raison « retrospective-undecidable » pour n < 99, test mutant n = 98
rougit ; (b) `@monark/ukemi` retiré ou justifié ; commentaires périmés ; (c) **mesure de l'item (a) M009** sur traces S2 puis amendement ADR-M002
D5/D6 ; (d) ADR de nommage des `task_class` : coexistence `…-24h` / `…-1h` (deux lois, deux régions ; l'advisor-defi tranche « coexistence »,
pas supersession) ; (e) rectificatif ADR-M008 : `under_witness` n'existe pas dans l'enum gelé.

**D2 — P1, prise `AttestedPrice` optionnelle dans `GateEnvelope` (1 ADR + 1–2 lots, T1).** `crossAgentGate` devient le chemin **servi** ; les
résidus d'attestation sont filés dans `CoverageVerdict.residual`. K8 = 0 (pas de 5ᵉ outil), GEL = 0 (`params` non gelé, ADR-M005 D8), D6 = 0.
Honnêteté : `attest` reste une fixture (label K-1) tant qu'aucun témoin vivant n'existe ; on le dit. Inclut M012 (i) (dédoublonnage de la
description du gate, re-pin h5). **Précisions mesurées au checkpoint-1 (C-4)** : (a) `tool_schema_equals_frozen_schema` n'asserte que
`properties.prediction` et la sortie ⇒ ajouter `attested` ne le rougit pas : P1-a nomme un **nouveau test de dérive** `gate_attested_is_frozen_attested_price`
(motif `attest_output_is_frozen_attested_price`) + assertion `required === ["prediction","params"]` et clés d'enveloppe = `{prediction, params, attested}` ;
(b) le scan K-8 interdit `child_process` ⇒ le vérifieur Shōgen ne peut pas tourner dans `gate` ⇒ **l'attestation portée par l'appelant n'est pas
vérifiée à l'appel** — déclaré dans la description et l'ADR, jamais via `residual` (`gate.ts:316` : « residual is NOT an honesty carrier ») ;
(c) `crossAgentGate` ne vérifie aucune **liaison** `price.subject` ↔ `prediction` (la trace h5 compose Binance BTCUSDT avec une prédiction sans lien) :
P1-a nomme la règle de liaison, sinon le triangle servi est décoratif ; (d) `crossAgentGate` conformalise sur des paires (`ctx.calib.pairs`) alors que
le gate servi dispatche par `task_class` sur des scores committés : P1-a dit quelle composition est servie. Rectificatifs : 11 sites `residual: []`
dans `gate.ts` (le 12ᵉ est `packages/hikae/src/s2/instrument.ts`) ; `@monark/ukemi` est importé par `apps/harness/src/tools/cascade.ts:41`, « jamais
importé » ne vaut que pour `packages/monark`.

**D3 — Instrumentation de la demande (immédiat, hors lot). Deux surfaces, deux journaux, deux critères.** (a) L'investisseur fixe **N** (ADR-M006
D8) ; (b) **D8 = harnais** (`mcp.`/`api.`) : directive `log` sur le bloc Caddy du harnais (POST par host/route, jamais de payload, rotation 5 × 30 j,
aucune IP au-delà) = action sortante sous go ; **cet ADR clôt PF-M006-8** (ADR-M006 l.69 : ADR infra dédié avant instrumentation) ; critère :
≥ N `tools/call` d'origine ≠ MONARK sous 30 j, dont ≥ 1 `gate` avec `task_class` ≠ fixture ; (c) **M1 = vitrine** (`/narabi/*`, journal actif depuis
2026-09-18 09:33 UTC) : ≥ 3 clients externes distincts non-crawlers × ≥ 10 fetches, ou une entité nommée demandant une population/classe précise ;
(d) lecture des deux à J+30 de l'instrumentation D8. **Ce qui gate D6 (Genkan) est D8**, pas M1. Falsifiable : 0 `tools/call` non-crawler à J+30
⇒ « la distribution était de la visibilité », consigné, aucun lot Genkan.

**D4 — P3, 2ᵉ clé Narabi = décision investisseur, puis F2-C sous protocole pré-enregistré.** Les deux avis advisor-defi divergent : (c′)
« ni sUSDe ni FDUSD sous le protocole existant ; extension USDe 11 mois + sUSDe en co-variable » vs « sUSDe pour le churn, régime 1 jour seul,
co-variable de breadth pré-enregistrée ». Réconciliation orchestrateur : (i) l'extension USDe = rejeu à digest séparé (item M012 (l), T ≥ 7, ne
touche jamais les scores committés) **avec le test pré-enregistré de (c′) §1** : couverture empirique de [v̂ ± q̂_committé] sur les paires calmes
consécutives fraîches, acceptation ≥ 1 − α − ε avec **ε = 0,05 fixé maintenant** ; échec ⇒ un nombre de dérive mesuré (Barber 2023) dans la phrase
d'honnêteté, **jamais une recalibration** — **fait dans tous les cas** ; (ii) le test co-variable sUSDe → USDe (lag = cooldown, seuil ≥ 50 % avec base
< 15 % ⇒ ADR v3) — **fait dans tous les cas** ; (iii) l'ouverture d'une clé sUSDe (régime 1 j, breadth) ou FDUSD (classe calendaire) = **escalade
investisseur** ; l'étiquette « seuils fixés après lecture de 100 % des données » est l'opinion de (c′) et vaut **sauf si** le régime 1 jour
(post-bloc 24669809) conserve un held-out intact — question factuelle non établie, à mesurer avant l'escalade (les deux avis advisor-defi sont
archivés : `AVIS-advisor-defi-2e-cle-c-prime.md`, `AVIS-advisor-defi-portefeuille.md`) ; (iv) clôtures négatives
formelles + critère d'admissibilité inter-chaînes (ne brûle pas sur mainnet, ou `from` séparable).

**D5 — Koyomi = seule nouvelle pièce instruite (T2), par census avant tout G0.** Variable : gap log-return entre la marque HIP-3 clampée et le
premier print de l'oracle du déployeur à la réouverture ; Mondrian par marché (jamais poolé) ; seuils pré-enregistrés avant pull ; held-out
2026-07-27 **recomputé** (les chiffres −19 %/57 M$/17 M$ sont [abs]/[lu presse]) et requalifié (pré-marché de semaine, pas week-end : le cadrage de
`produit-G` est trop étroit pour son propre meilleur cas) ; profondeur d'archive HIP-3 mesurée. G0 seulement si non dégénéré **et** acheteur
nommé (règle **proposée** par cet ADR, décision (0) : le G7 UKEMI du 2026-09-03 est scopé à Ukemi ; Shōgen, Hikae et Narabi ont été construits
   sans acheteur nommé) ; sinon clôture négative.

**D6 — Genkan = couche d'interception côté appelant, après P1, après l'item (a) M009, et seulement si D3 mesure une demande.** Forme
honnête : `before_tool` dans le runtime de l'opérateur (produit-H), `B_t` persisté chez l'opérateur, appel du `gate` pur ; aucune revendication
statistique nouvelle ; la `Prediction` conformalisée doit être **nommée** dans l'ADR-Genkan avant tout code (sinon spend guard). Procurement
formé avant : documentation primaire du hook `before_tool` OpenClaw (absente du dépôt).

**D7 — Décisions reportées par ADR, jamais inférées** : P4 tracker → gate (gaté par le critère (iii), évaluable ≈ 100 j après J0) ; P5 ledger de
budget / token ↔ `B_t` (architecture D6 + GEL + réseau ; seulement après mesure d'usage de D6 ; le token reste une CA affichée) ; Mokugeki
(`AttestedDoc`, nouveau contrat gelé) ; Kessai, Kaihi, Kamae, Kyokusen (hors 12 mois sauf acheteur nommé formulant une exigence de couverture).

**D8 — Invariants de phase** : set d'outils `{attest, gate, cascade, calibrate}` inchangé sans ADR nommant l'oracle K8 ; diff `schemas/`
`packages/contracts/` = 0 octet dans chaque CA jusqu'à P5 ; tout état hors `apps/harness/src/tools/**` sur le motif sentinelle ; phrase D8
byte-identique sur 8 surfaces tant que (iii) n'a pas tiré ; chaque pièce passant `built` = re-pin `fleet_register_built_set_is_frozen` dans le
même commit ; `lint-ratchet` non croissant ; R-25 < 1205 par lot avec méthode d'estimation nommée ; procurements émis à l'ADR, jamais pendant
les lots ; « partner » et « autonomous » jamais, y compris dans les campagnes GTM (GTM 08 S7–S9 « design partner » à réécrire).

## Alternatives rejetées
- **Construire Genkan maintenant** (rang 1 du chercheur) : fonction encombrée, demande de la forme non démontrée, `Prediction` non nommée, item (a)
  M009 non mesuré ⇒ « abstient au hasard » à la première démo.
- **Construire une pièce parmi les 7 sans acheteur nommé** : contraire à la règle **proposée** ici (généralisation du G7 UKEMI, scopé à Ukemi) —
  c'est la décision (0), à ratifier par l'investisseur face aux alternatives costées de PLAN-STRATEGIE §2bis.
- **Ledger / token câblé maintenant** : architecture (D6 + GEL + chaîne) sans acheteur ; kill-criteria GTM 09 (« B_t vendu comme APY »).
- **Campagnes « la claque » telles quelles** : chacune suppose du code absent (résidus hors enum, 11 pièces, `before_tool`, `AttestedDoc`).
- **Abandonner les 7 pièces** : escalade investisseur, pas un avis ; la fleet reste la même (11 + 5).

## Conséquences
- Calendrier : **T1 (oct.–déc. 2026)** P0 + P1 + D3 + rejeu (l) à T ≥ 7 + ADR de nommage + décision 2ᵉ clé ; **T2 (janv.–mars 2027)** census
  Koyomi, F2-C si décidé, lecture J+30 → Genkan v1 ou non ; **T3** mesure d'usage, décision P5 par ADR, revue (iii) ; **T4** selon P5.
- Décisions investisseur à prendre, listées pour le checkpoint-1 : (1) N ; (2) 2ᵉ clé : escalade sUSDe/FDUSD ou (c′) seul ; (3) M014 (d)/(d′) ;
  (4) M012 (g) ancrage hebdo au premier mois ; (5) token ↔ `B_t` : maintenant ou après mesure ; (6) go pour le `log` Caddy harnais.
- Procurements formés à l'ADR (**18**, liste dans `PLAN-STRATEGIE.md` §5, avec tentatives faites et étiquette document / recherche / mesure ;
  les quatre dûs de l'AUDIT §5 y sont repris : AIP 262, Aave V4 × Ethena, `TetherToken.redeem`, Risk Committee Ethena) : hook `before_tool` OpenClaw ; `produit-ukemi-loop-clearing.md`
  introuvable ; PSM Sky / PYUSD / LUSD-BOLD à scouter ou écarter ; export du compteur ClawHub ; journal Caddy vitrine J+30 ; Blockaid AI agent
  tools (statut, pricing) ; MetaMask Agent Wallet Guard Mode (docs) ; HIP-3* proxy reduce-only (spec) ; post-mortem trade.xyz SK Hynix ; Kaiko
  Best Execution (grille) ; x402 Bazaar (frais, catalogue MCP) ; statut du blocage ClawPump ; archive HIP-3 (profondeur, API).
- `error_origin` de l'étude : orchestrateur — avis (c′) non archivé avant le second avis (rétention d'information) ; « 219 pulls » transmis sans
  niveau de source ; règle « acheteur nommé » présentée comme héritée alors qu'elle est proposée ; ε = 0,05 perdu dans la réconciliation ;
  **arbre non gelé pendant le checkpoint-1** (chercheurs écrivant `docs/biblio/procurements-M015/` à 20:25–20:26 UTC) ; **rupture de gel n° 2** au
  re-checkpoint (commit `b7ff7d8` PR-2 pendant la fenêtre) ; commit `74c9122` au message « corrections foldées » alors que le script avait avorté ;
  entrée journal annoncée et absente jusqu'au 09-18 soir ; premier avis du validateur non persisté avant `CHECKPOINT1-M015.md` ; 13 ≠ 14 ≠ 18 ;
  M1/D8 confondus. Remède structurel (K-C) : gel par identité d'artefact (SHA de commit lu par `git show`), aucun commit pendant la fenêtre.

## Sources
Dossier `docs/etude-suite-2026-09-18/` (douze fichiers après le 09-18 soir, sha dans les rapports d'agents et le journal) ; ADR-M002 D4/D9, M005 D1/D6/D8/D15, M006 D8, M008 D4/D7,
M009 item (a), M012 D3–D8 et items, M014 ; `apps/harness/src/tools/{registry,gate}.ts`, `packages/monark/src/index.ts`,
`scripts/record-usde-calib.mjs:71,115`, `packages/contracts/src/enums.ts`, `deploy/Caddyfile.*` ; ACTU §2–§13 (URL + dates) ; avis advisors du
2026-09-18 (rapports de consultation, archivés pour (c′)).

## Décision (0) — à ratifier par l'investisseur (C-1 du checkpoint-1)
La thèse « rendre le moteur réel et mesuré avant toute nouvelle pièce », la règle **généralisée** « aucun G0 de pièce sans acheteur nommé », le calendrier
T1–T4 et la mise hors 12 mois de Kessai / Kaihi / Kamae / Kyokusen / Mokugeki sont une **décision de valeur nouvelle**, pas une conséquence de la doctrine
existante (le G7 UKEMI est scopé à Ukemi ; ADR-M006 D8 fonde « mesurer la demande », pas « rien avant la mesure »). Elle est soumise face aux
alternatives costées de `PLAN-STRATEGIE.md` §2bis. Le « je valide le plan » de l'investisseur (2026-09-18) est enregistré comme ratification de
principe ; la ratification explicite de (0) est demandée avec les six autres décisions.

## Décisions investisseur du 2026-09-18 (soir) — consignées verbatim et appliquées
- **(0) et (0bis), reformulées par l'investisseur** : « il ne faut pas voir les pièces à elles seules, mais le moteur au complet, un moteur
  d'inférence conforme avec des outils internes faits par nos soins. On n'a pas besoin d'acheteurs individuels, mais on a besoin de savoir que le
  gap existe. » ⇒ la règle de garde d'un G0 de pièce devient : **le gap est démontré sur pièces (mesure, pas récit) ET la pièce est calibrable
  honnêtement (région, pas nombre)** ; « acheteur nommé » n'est plus une condition. D5 (Koyomi), D6 (Genkan) et Ukemi mode L se lisent sous
  cette règle. La thèse « moteur réel et mesuré avant toute nouvelle pièce » est ratifiée (plan C de §2bis, avec P0 en tête : « ce qui prime
  c'est de corriger ce qui existe »).
- **(5) Token ↔ `B_t`** : « on ne relie pas le token pour le moment, on attend que toute la flotte soit érigée, testée, enrichie, fonctionnelle et
  auditée. » ⇒ P5 hors de cette phase et des suivantes tant que la flotte n'est pas complète ; le token reste une CA affichée.
- **(1) N** : validé = **20 `tools/call` d'origine ≠ MONARK sous 30 jours, dont ≥ 5 `gate` hors fixture, d'au moins 3 clients distincts**
  (ADR-M006 D8 clos sur ce chiffre). Jauge d'orientation, pas condition de construction.
- **(6) Journal Caddy du harnais** : go « ce soir » ⇒ **déployé 2026-09-18 21:11 UTC** (Caddyfile sauvegardé `.bak-…-harnesslog`, `caddy validate`
  OK, reload, `active`, première ligne JSON vérifiée : host, méthode, route, statut, aucun corps). Snippet documenté dans `deploy/Caddyfile.monark-harness`.
  Lecture à J+30 = 2026-10-18.
- **(2) 2ᵉ clé Narabi** : « pas de 2ᵉ clé aujourd'hui » ⇒ (c′) (i)(ii) seuls : rejeu 11 mois à digest séparé avec test de couverture ε = 0,05 à
  T ≥ 7 ; test co-variable sUSDe ; clôtures négatives ; PYUSD reste ouvert (PR-3).
- **(3) M014 (d)/(d′)** : validé « un seul déclencheur (rolling90), e-détecteur cité comme évidence sans doctrine de lecture », sous consultation
  advisor-defi rapide (en cours ; réserve éventuelle consignée en amendement M014).
- **(4) M012 (g)** : validé, **dépôt public dédié** pour l'ancrage hebdomadaire de la timeline, à partir de T ≥ 30 (~2026-10-17), automatisé par la
  sentinelle — lot à planifier (action sortante sous go au moment de la création du dépôt).
- **(7) GTM** : « corrigez » ⇒ fait le 2026-09-18 dans `F:\PRODUITS\downloads-monark\GTM monark version 1\GTM\` : `08-90-jours.md` (« design partner » → « premier
  utilisateur de conception (aucun accord, aucune exclusivité) »), `03-beachhead.md`, `04-clawrena.md`, `09-kpis-risques.md` (« Hermes » nu →
  « Hermes runtime open source, aucun accord »). Aucun autre mot changé.
