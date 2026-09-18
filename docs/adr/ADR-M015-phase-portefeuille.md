# ADR-M015 — Phase de portefeuille après Narabi + ACI : « rendre le moteur réel et mesuré » avant toute nouvelle pièce

- **Statut** : proposé (G0 de phase) 2026-09-18 · checkpoint-1 validateur dû · décision = investisseur (CA-2)
- **Rattachement** : `docs/PHASE-SUIVANTE.md` Action 1 ; inventaire `docs/etude-suite-2026-09-18/` (INDEX-corpus 139 fichiers, FICHES-pieces 16,
  PROPOSITIONS, CARTOGRAPHIE-code, ACTU-defi-par-piece, AVIS-advisor-defi-2e-cle-c-prime) ; trois consultations du 2026-09-18 (advisor-marché,
  advisor-defi, advisor architecture) ; ADR-M005 (harnais pur, D0/D6/K-8), M006 (D8 mesure de demande, N non fixé), M008, M009 (item a), M012, M014.
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
   Le compteur ClawHub (219 téléchargements sur 8 jours, **lu par l'orchestrateur sur la page le 2026-09-18**, l'advisor-marché ne l'ayant pas
   trouvé par API) mesure des pulls, pas des appels.
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
description du gate, re-pin h5).

**D3 — Instrumentation de la demande (immédiat, hors lot).** (a) L'investisseur fixe **N** (ADR-M006 D8) ; (b) directive `log` sur le bloc Caddy du
harnais (POST par host/route, jamais de payload, rotation 5 × 30 j, aucune IP au-delà) = action sortante sous go ; (c) critère M1 reconduit
(≥ 3 clients externes distincts non-crawlers × ≥ 10 fetches, ou une entité nommée qui demande une population/classe précise) ; (d) lecture à J+30.
Falsifiable : 0 `tools/call` non-crawler à J+30 ⇒ « la distribution était de la visibilité », consigné, et aucun lot Genkan.

**D4 — P3, 2ᵉ clé Narabi = décision investisseur, puis F2-C sous protocole pré-enregistré.** Les deux avis advisor-defi divergent : (c′)
« ni sUSDe ni FDUSD sous le protocole existant ; extension USDe 11 mois + sUSDe en co-variable » vs « sUSDe pour le churn, régime 1 jour seul,
co-variable de breadth pré-enregistrée ». Réconciliation orchestrateur : (i) l'extension USDe = rejeu à digest séparé (item M012 (l), T ≥ 7, ne
touche jamais les scores committés) — **fait dans tous les cas** ; (ii) le test co-variable sUSDe → USDe (lag = cooldown, seuil ≥ 50 % avec base
< 15 % ⇒ ADR v3) — **fait dans tous les cas** ; (iii) l'ouverture d'une clé sUSDe (régime 1 j, breadth) ou FDUSD (classe calendaire) = **escalade
investisseur** avec l'étiquette « seuils fixés après lecture de 100 % des données », jamais un choix d'orchestrateur ; (iv) clôtures négatives
formelles + critère d'admissibilité inter-chaînes (ne brûle pas sur mainnet, ou `from` séparable).

**D5 — Koyomi = seule nouvelle pièce instruite (T2), par census avant tout G0.** Variable : gap log-return entre la marque HIP-3 clampée et le
premier print de l'oracle du déployeur à la réouverture ; Mondrian par marché (jamais poolé) ; seuils pré-enregistrés avant pull ; held-out
2026-07-27 **recomputé** (les chiffres −19 %/57 M$/17 M$ sont [abs]/[lu presse]) et requalifié (pré-marché de semaine, pas week-end : le cadrage de
`produit-G` est trop étroit pour son propre meilleur cas) ; profondeur d'archive HIP-3 mesurée. G0 seulement si non dégénéré **et** acheteur
nommé (le G7 UKEMI du 2026-09-03 s'applique par analogie) ; sinon clôture négative.

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
- **Construire une pièce parmi les 7 sans acheteur nommé** : contraire au G7 UKEMI (2026-09-03) et à la doctrine (CA-2).
- **Ledger / token câblé maintenant** : architecture (D6 + GEL + chaîne) sans acheteur ; kill-criteria GTM 09 (« B_t vendu comme APY »).
- **Campagnes « la claque » telles quelles** : chacune suppose du code absent (résidus hors enum, 11 pièces, `before_tool`, `AttestedDoc`).
- **Abandonner les 7 pièces** : escalade investisseur, pas un avis ; la fleet reste la même (11 + 5).

## Conséquences
- Calendrier : **T1 (oct.–déc. 2026)** P0 + P1 + D3 + rejeu (l) à T ≥ 7 + ADR de nommage + décision 2ᵉ clé ; **T2 (janv.–mars 2027)** census
  Koyomi, F2-C si décidé, lecture J+30 → Genkan v1 ou non ; **T3** mesure d'usage, décision P5 par ADR, revue (iii) ; **T4** selon P5.
- Décisions investisseur à prendre, listées pour le checkpoint-1 : (1) N ; (2) 2ᵉ clé : escalade sUSDe/FDUSD ou (c′) seul ; (3) M014 (d)/(d′) ;
  (4) M012 (g) ancrage hebdo au premier mois ; (5) token ↔ `B_t` : maintenant ou après mesure ; (6) go pour le `log` Caddy harnais.
- Procurements formés à l'ADR (13, liste dans `PLAN-STRATEGIE.md` §5) : hook `before_tool` OpenClaw ; `produit-ukemi-loop-clearing.md`
  introuvable ; PSM Sky / PYUSD / LUSD-BOLD à scouter ou écarter ; export du compteur ClawHub ; journal Caddy vitrine J+30 ; Blockaid AI agent
  tools (statut, pricing) ; MetaMask Agent Wallet Guard Mode (docs) ; HIP-3* proxy reduce-only (spec) ; post-mortem trade.xyz SK Hynix ; Kaiko
  Best Execution (grille) ; x402 Bazaar (frais, catalogue MCP) ; statut du blocage ClawPump ; archive HIP-3 (profondeur, API).
- `error_origin` de l'étude : orchestrateur (avis (c′) non archivé avant le second avis ; « 219 pulls » transmis sans niveau de source).

## Sources
Dossier `docs/etude-suite-2026-09-18/` (six fichiers, sha dans les rapports d'agents) ; ADR-M002 D4/D9, M005 D1/D6/D8/D15, M006 D8, M008 D4/D7,
M009 item (a), M012 D3–D8 et items, M014 ; `apps/harness/src/tools/{registry,gate}.ts`, `packages/monark/src/index.ts`,
`scripts/record-usde-calib.mjs:71,115`, `packages/contracts/src/enums.ts`, `deploy/Caddyfile.*` ; ACTU §2–§13 (URL + dates) ; avis advisors du
2026-09-18 (rapports de consultation, archivés pour (c′)).
