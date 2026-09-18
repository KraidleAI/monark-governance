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
| P1-a | ADR | amendement M005 D5/D8 + M003 D4 : prise `AttestedPrice` optionnelle, `crossAgentGate` servi ; alternative « 5ᵉ outil compose » rejetée (K8) | docs | M014-a | checkpoint-1 |
| P1-b | code | `GateEnvelope.attested?`, projection schéma, 12 sites `residual`, OpenAPI, tests, re-pin h5 ; M012 (i) | 500–700 l. | F1b (550) | ci, `tool_schema_equals_frozen_schema`, diff contrats 0 octet |
| D3 | infra | `log` bloc Caddy harnais (POST host/route, sans payload, 5 × 30 j) ; N fixé ; lecture J+30 | snippet | M012 (o) | go investisseur ; rapport J+30 |
| (l) | sentinelle | rejeu 11 mois à digest séparé + `instrument.json` sous `/narabi/` + phrase D3 M014 ; test co-variable sUSDe → USDe | 2 lots | M012-c, M014-b | T ≥ 7, go |
| P3 | 2ᵉ clé | selon décision investisseur : (c′) seul (clôtures + admissibilité) ou escalade sUSDe/FDUSD avec PLAN F2-C pré-enregistré | 2 lots + census | F2a/F2b | checkpoint-1 F2-C |
| K-0 | Koyomi census | seuils avant pull ; gap par marché HIP-3 ; held-out 07-27 recomputé ; archive mesurée | census hors dépôt + rapport | census B | verdict région ; G0 seulement si non dégénéré + acheteur nommé |
| G-0 | Genkan | ADR-Genkan avec la `Prediction` nommée ; procurement `before_tool` ; conditionné à D3 ≥ N et P0-b | docs | M015 | checkpoint-1 |

Ordre : P0 → P1 ‖ D3 → (l) à T ≥ 7 → P3 (après décision) → K-0 → G-0 (après J+30). P4/P5 = ADR de décision seulement.

## 3. Ce que le validateur exigera (anticipé)
Décisions investisseur écrites avant les lots concernés (§4) ; item (a) M009 mesuré avant tout Genkan ; nommage tranché avant P3 ; squelette ISO 42010
par ADR ; taille de lot avec méthode ; phrase D8 byte-identique ; MAST résiduel par lot ; procurements émis ici, pas pendant.

## 4. Décisions investisseur (liste fermée, à trancher au checkpoint-1 ou juste après)
1. **N** (ADR-M006 D8) — sans N, D3 n'est pas falsifiable.
2. **2ᵉ clé** : (c′) seul, ou escalade sUSDe (régime 1 j, breadth) / FDUSD (classe calendaire) avec l'étiquette « seuils fixés après 100 % des données ».
3. **M014 (d)/(d′)** : union des déclencheurs ; doctrine de lecture du e-détecteur dans un ADR de dérive.
4. **M012 (g)** : ancrage hebdomadaire au premier mois live (~2026-10-17).
5. **Token ↔ `B_t`** : après mesure d'usage (recommandé) ou maintenant (4–6 lots + contrat gelé nouveau).
6. **Go** pour le `log` Caddy du harnais (action sortante).

## 5. Procurements formés (émis maintenant, règle « signaler avant production »)
| # | Document / mesure | Usage | Bloque |
|---|---|---|---|
| PR-1 | Doc primaire du hook `before_tool` OpenClaw (version, URL, date) | forme du point d'interception Genkan | G-0 |
| PR-2 | `produit-ukemi-loop-clearing.md` (cité par narabi-phase 05/08, introuvable dans Downloads) | fiche Ukemi | FICHES |
| PR-3 | Scouting PSM Sky/Maker, PYUSD, LUSD/BOLD (nommés par l'advisor-defi) | clôture du critère d'admissibilité | P3 |
| PR-4 | Export/capture datée du compteur ClawHub (pulls par jour/version) | lever la quarantaine du « 219 » | D3 |
| PR-5 | Extrait anonymisé du journal Caddy vitrine à J+30 | M1 | D3 |
| PR-6 | Blockaid AI agent tools : statut (beta/GA), pricing, fiche | incumbent Genkan | G-0 |
| PR-7 | MetaMask Agent Wallet Guard Mode : docs (règles, journal, export) | comparaison File vs journal | G-0 |
| PR-8 | HIP-3* : spec des proxy actions reduce-only, statut mainnet | faisabilité Koyomi | K-0 |
| PR-9 | Post-mortem trade.xyz SK Hynix (texte primaire, règle de remboursement) | requalification held-out | K-0 |
| PR-10 | Kaiko Best Execution : grille et périmètre CASP | seul précédent de pricing réglementaire (Kessai) | hors 12 mois |
| PR-11 | x402 Bazaar : frais facilitateur, catalogue MCP tools sept. 2026 | coût de (d) par appel | D3 |
| PR-12 | Statut du blocage ClawPump (un agent peut-il POST vers `api.` / monter un MCP externe ?) | origine de l'agent externe S2 | D3 |
| PR-13 | Archive HIP-3 (profondeur, API `info`, marques clampées, premiers prints) | census Koyomi | K-0 |
| PR-14 | Traces S2 pour l'item (a) M009 (localisation, format) | mesure P(B_t < 0) | P0-b |

## 6. Ce qui ferait basculer le plan
Un acheteur nommé formulant une exigence de couverture sur une pièce (cette pièce prend la place de K-0/G-0, **après** P0/P1) ; (iii) qui tire
(ouvre l'ADR de dérive, P4 devient prioritaire) ; l'item (a) M009 infirmé (Genkan avance) ou confirmé sans remède (Genkan sans `B_t`) ; archive HIP-3
inaccessible (tue Koyomi) ; Aave basculant USDe sur un feed sensible au spot (rouvre Ukemi ← book par ADR) ; D3 à 0 appel non-crawler (pas de Genkan).

## 7. MAST résiduel
Dérive de spec (pièce « améliorée » hors ADR) → fichiers autorisés par lot ; vérification par le même contexte → G2 fraîche + oracle non-LLM ;
artefact mouvant pendant un checkpoint → sha listés avant invocation ; surclaim → gate:vocab + honesty-lint + phrase D8 ; chiffre [abs] présenté
comme fait → niveaux obligatoires dans chaque rapport.
