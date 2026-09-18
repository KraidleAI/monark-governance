# PLAN — Stratégie de phase « rendre le moteur réel et mesuré » (ADR-M015) — G0, checkpoint-1 avant tout code

> Méthode inchangée : plan posé → checkpoint-1 validateur → biblio/procurements **avant** production (règle investisseur 2026-09-18) → lots
> R-25 → G2 fraîche → oracle → checkpoint-2 → G7. La fleet reste 11 + 5 ; aucune 17ᵉ pièce.

## 1. La thèse en trois lignes
- Ce qui vaut cher chez MONARK est **vérifiable** : une région mesurée sur une loi mesurée (USDe, 613 paires), publiée et rejouable (Narabi, T qui monte).
- Ce qui ne vaut rien tant que ce n'est pas câblé : le triangle attest → gate → act (test-only), le budget (sans état), le token (affiché).
- Ce qui n'est pas mesurable aujourd'hui : la demande. On l'instrumente avant de construire une pièce pour elle.

## 2. Phases et lots (R-25 par lot, méthode d'estimation = analogie à un lot mesuré)
| # | Lot | Contenu | Estimation | Analogie | Gate de sortie |
|---|---|---|---|---|---|
| P0-a | dette code | recorder `q99` fail-closed + test n = 98 ; `@monark/ukemi` ; commentaires périmés | < 400 l. | F1a (314) | ci vert, mutant rouge |
| P0-b | gouvernance | ADR nommage task_class (coexistence 24h/1h) ; rectificatif M008 `under_witness` ; **mesure item (a) M009** sur traces S2 + amendement M002 D5/D6 | docs + 1 script de mesure | M012-f | chiffre P(B_t < 0) [mesuré] |
| P1-a | ADR | amendement M005 D5/D8 + M003 D4 : prise `AttestedPrice` optionnelle, `crossAgentGate` servi ; alternative « 5ᵉ outil compose » rejetée (K8) ; nomme le test de dérive `gate_attested_is_frozen_attested_price` + assertion clés d'enveloppe, la mention « attestation portée par l'appelant, non vérifiée à l'appel » (hors `residual`), la règle de liaison `subject` ↔ `prediction`, la composition servie (scores committés vs paires) | docs | M014-a | checkpoint-1 |
| P1-b | code | `GateEnvelope.attested?`, projection schéma, 12 sites `residual`, OpenAPI, tests, re-pin h5 ; M012 (i) | 500–700 l. | F1b (550) | ci, `tool_schema_equals_frozen_schema`, diff contrats 0 octet |
| D3 | infra | `log` bloc Caddy harnais (POST host/route, sans payload, 5 × 30 j) ; N fixé ; lecture J+30 | snippet | M012 (o) | go investisseur ; rapport J+30 |
| (l) | sentinelle | rejeu 11 mois à digest séparé + `instrument.json` sous `/narabi/` + phrase D3 M014 ; test co-variable sUSDe → USDe | 2 lots | M012-c, M014-b | T ≥ 7, go ; **critère (c′) : couverture empirique de [v̂ ± q̂] sur les paires calmes fraîches ≥ 1 − α − 0,05, sinon nombre de dérive déclaré, jamais recalibration** |
| P3 | 2ᵉ clé | selon décision investisseur : (c′) seul (clôtures + admissibilité) ou escalade sUSDe/FDUSD avec PLAN F2-C pré-enregistré | 2 lots + census | F2a/F2b | checkpoint-1 F2-C |
| K-0 | Koyomi census | seuils avant pull ; gap par marché HIP-3 ; held-out 07-27 recomputé ; archive mesurée | census hors dépôt + rapport | census B | verdict région ; G0 seulement si non dégénéré + acheteur nommé |
| G-0 | Genkan | ADR-Genkan avec la `Prediction` nommée ; procurement `before_tool` ; conditionné à D3 ≥ N et P0-b | docs | M015 | checkpoint-1 |

Ordre : P0 → P1 ‖ D3 → (l) à T ≥ 7 → P3 (après décision) → K-0 → G-0 (après J+30). P4/P5 = ADR de décision seulement.
Topologie par lot (CA-4) : **mono-agent (worker Opus 4.8) + oracle déterministe** ; G2 = instance fraîche ; fan-out seulement pour des consultations indépendantes.

## 2bis. Alternatives costées (C-1 du checkpoint-1 — pour que l'investisseur tranche entre des plans, pas un slogan)
| Alternative | Lots | Estimation | Analogie | Ce qu'elle suppose vrai | Ce qu'on perd |
|---|---|---|---|---|---|
| **A. Genkan maintenant** (ADR-Genkan + wrapper `before_tool` + skill + re-pin built-set), avant P1 et avant l'item (a) M009 | 3–4 | 400–600 l. (wrapper) + 300 l. (tests/doc) + ADR | M012-e (re-pin), F1b | qu'on sait nommer la `Prediction` d'un `transfer` ; que B_t à bFloor = 0 n'abstient pas au hasard ; qu'une demande existe (non mesurée) | P1 et D3 repoussés d'un trimestre ; risque « spend guard en vocabulaire MONARK » face à Blockaid/MetaMask/Fystack |
| **B. Koyomi d'abord** (census K-0 puis G0 + capteur calendrier/HIP-3 + nouvelle classe + calibration) | 4–5 | census hors dépôt + 3–4 lots code | census B, F2a/F2b | archive HIP-3 accessible sans clé ; held-out 07-27 requalifié ; acheteur nommé (aucun trouvé : le builder internalise) | P1 repoussé ; nouvelle classe isolée, faible composition |
| **C. Plan proposé** (P0 → P1 ‖ D3 → (l) → P3 → K-0 → G-0 conditionnel) | 2 + 2 + snippet + 2 | < 400, 500–700, 2 × ~500 l. | F1a, F1b, M012-c | que la demande se mesure en 30 j ; que la traçabilité (P1) a une valeur même sans témoin vivant | aucune pièce nouvelle avant T2 ; Genkan seulement sur mesure |
| **D. Enrichir seulement** (2ᵉ clé + classe horaire sUSDe + rejeu (l), aucun tuyau) | 3 | 2 × ~500 l. + ×24 pulls | F2a/F2b | qu'une population horaire non dégénérée existe ; que la traçabilité peut attendre | le triangle reste test-only ; `attest` reste terminal |

## 3. Ce que le validateur exigera (anticipé)
Décisions investisseur écrites avant les lots concernés (§4) ; item (a) M009 mesuré avant tout Genkan ; nommage tranché avant P3 ; squelette ISO 42010
par ADR ; taille de lot avec méthode ; phrase D8 byte-identique ; MAST résiduel par lot ; procurements émis ici, pas pendant.

## 4. Décisions investisseur (liste fermée, à trancher au checkpoint-1 ou juste après)
0. **Ratification de la thèse** (règle généralisée « aucun G0 de pièce sans acheteur nommé », calendrier T1–T4, pièces hors 12 mois) face aux alternatives §2bis.
1. **N** (ADR-M006 D8) — sans N, D3 n'est pas falsifiable.
2. **Ouvrir une 2ᵉ clé Narabi maintenant ou non** (sUSDe régime 1 j / FDUSD classe calendaire, sous PLAN F2-C pré-enregistré) — (c′) (i)(ii) se font dans tous les cas ; les deux avis advisor-defi sont archivés.
3. **M014 (d)/(d′)** : union des déclencheurs ; doctrine de lecture du e-détecteur dans un ADR de dérive.
4. **M012 (g)** : ancrage hebdomadaire au premier mois live (~2026-10-17).
5. **Token ↔ `B_t`** : après mesure d'usage (recommandé) ou maintenant (4–6 lots + contrat gelé nouveau).
6. **Go** pour le `log` Caddy du harnais (action sortante).
7. (Demande, pas décision) Réécriture de GTM 08 S7–S9 (« design partner ») dans les documents de l'investisseur hors dépôt.

## 5. Procurements formés (14, émis maintenant, règle « signaler avant production ») — type : D = document, R = recherche, M = mesure
| # | Type | Document / recherche / mesure | Tentatives faites (datées) | Usage | Bloque | Statut 2026-09-18 |
|---|---|---|---|---|---|---|
| PR-1 | D | Doc primaire du hook `before_tool` OpenClaw (version, URL, date) | grep `before_tool`/`hook` dans `docs/R-P4-skills-recon.md` = 0 (09-18) | interception Genkan | G-0 | chercheur en cours |
| PR-2 | D | `produit-ukemi-loop-clearing.md` (cité par narabi-phase 05/08) | recherche par nom sur tout `Downloads\` = 0 (09-18) | fiche Ukemi | FICHES | demande au mainteneur |
| PR-3 | R | Scouting PSM Sky/Maker, PYUSD, LUSD/BOLD (admissibilité inter-chaînes) | non scoutés avant (FICHES) | critère d'admissibilité | P3 | chercheur en cours |
| PR-4 | D | Export/capture datée du compteur ClawHub | page lue 2 × (219, 226) ; API 404 (09-18) | quarantaine « 219 » | D3 | partiel (`PR-4-clawhub-counter.md`) |
| PR-5 | M | Extrait anonymisé du journal Caddy vitrine à J+30 | journal actif depuis 09-18 09:33 UTC | M1 | D3 | différé 2026-10-18 |
| PR-6 | D | Blockaid AI agent tools : statut, pricing, fiche | blog 2025-01-02 lu ; overview [abs] | incumbent Genkan | G-0 | chercheur en cours |
| PR-7 | D | MetaMask Agent Wallet Guard Mode : docs | KuCoin [lu], metamask.io non lu | File vs journal | G-0 | chercheur en cours |
| PR-8 | D | HIP-3* : spec proxy reduce-only, statut mainnet | crowdfundinsider [lu], docs HL non lues | faisabilité Koyomi | K-0 | chercheur en cours |
| PR-9 | D | Post-mortem trade.xyz SK Hynix | cryptotimes/KuCoin [lu], primaire non lu | held-out Koyomi | K-0 | chercheur en cours |
| PR-10 | D | Kaiko Best Execution : grille, périmètre CASP | non tenté avant | précédent de pricing (Kessai) | hors 12 mois | chercheur en cours |
| PR-11 | D | x402 Bazaar : frais, catalogue MCP tools | docs.x402.org [lu partiel] | coût de (d) | D3 | chercheur en cours |
| PR-12 | R | Statut ClawPump | test live 09-11 (memstack b4003fd6) | agent externe S2 | D3 | **clos** (investisseur : ne peut pas, pas dans cette phase) |
| PR-13 | M | Archive HIP-3 (profondeur, API `info`) | non tenté avant | census Koyomi | K-0 | chercheur en cours |
| PR-14 | M | Traces S2 (localisation, format) | trouvées 09-18 : `F:\shogen-campagne\campagne\{journal,control,raw}.jsonl` | item (a) M009 | P0-b | **clos** (`PR-12-14-clos.md`) |
Dûs de l'AUDIT §5 repris : **PR-15** (D) rapport d'exécution AIP 262 (oracle USDe Aave, gouvernance ; le fait on-chain est [mesuré]) ; **PR-16** (D)
source primaire Aave V4 × Ethena datée 2026-09-07 ; **PR-17** (D) source déployée `TetherToken.redeem` (sourcify 403 le 09-18) ; **PR-18** (D)
rémunération du Risk Committee Ethena 5ᵉ mandat. Clos par le census du 09-18 : StakedUSDeV2 docs + tx `cooldownShares` ; part Pool vs GSM des burns GHO.

## 6. Ce qui ferait basculer le plan
Un acheteur nommé formulant une exigence de couverture sur une pièce (cette pièce prend la place de K-0/G-0, **après** P0/P1) ; (iii) qui tire
(ouvre l'ADR de dérive, P4 devient prioritaire) ; l'item (a) M009 infirmé (Genkan avance) ou confirmé sans remède (Genkan sans `B_t`) ; archive HIP-3
inaccessible (tue Koyomi) ; Aave basculant USDe sur un feed sensible au spot (rouvre Ukemi ← book par ADR) ; D3 à 0 appel non-crawler (pas de Genkan).

## 7. MAST résiduel
Dérive de spec (pièce « améliorée » hors ADR) → fichiers autorisés par lot ; vérification par le même contexte → G2 fraîche + oracle non-LLM ;
**artefact mouvant pendant un checkpoint** (mesuré le 2026-09-18 : chercheurs écrivant `docs/biblio/procurements-M015/` pendant le checkpoint-1) →
gel annoncé avec sha ET aucun agent écrivant dans l'arbre pendant la fenêtre, répertoires en cours d'écriture explicitement exclus ; **rétention
d'information / artefact non archivé** (mesuré : avis (c′) absent des artefacts) → chaque consultation est archivée dans le dossier d'étude avant
d'être citée ; surclaim → gate:vocab + honesty-lint + phrase D8 ; chiffre [abs] présenté comme fait → niveaux obligatoires dans chaque rapport.
