# Avis advisor-marché — étude de portefeuille Action 1 — 2026-09-18 — archivage de l'artefact (C-2 du checkpoint-1)

> Instance `advisor-marche` (`claude-fable-5-1`) ; avis, jamais verdict ; lecture + recherche seules. Niveaux : [lu] page lue ; [abs] ; [2nd].

## Réponse en tête
Pour les quatre options (a) plomberie, (b) une pièce, (c) un produit, (d) distribution : **la demande de la forme MONARK est non démontrée**.
Trois marchés adjacents paient des titulaires (mandats risk steward Aave 1,6–8 M$/an [lu theblock 2026-04-06] ; pare-feu de transaction classe
Blockaid ; ~17 M$ absorbés par trade.xyz [lu cryptotimes 2026-07-29]) mais aucun ne paie « région conforme + budget dépletable + résidu nommé ».
Classement : (d) *mesurée* → (a) *restreinte à l'honnêteté du skill* → (b) Genkan *conditionnel au seuil N* → (b′) Kessai → (c) bundle Warden.
Koyomi et le token non classés (récit ; coût sans acheteur).

## Le chiffre « 219 pulls »
Non trouvé par l'advisor (API `clawhub.ai/api/skills/monark` 404 ; page sans compteur pour lui) ⇒ quarantaine ; **pulls ≠ appels**. La mesure gelée
par ADR-M006 D8 est « ≥ N POST d'origine ≠ MONARK sous 30 j au niveau Caddy », **N jamais fixé**, PF-M006-8 hors lot. Vérifié dans `deploy/` : `log`
seulement sur le bloc vitrine `/narabi/*` ; **`Caddyfile.monark-harness` sans `log`** ⇒ zéro donnée rétroactive sur `mcp./api.`. Pivot factuel unique.
(Note orchestrateur : compteur lu à l'écran, capture datée dans `docs/biblio/procurements-M015/PR-4-clawhub-counter.md`, 226 au 20:35 UTC.)

## Genkan — le chercheur a sous-lu les incumbents
| Acteur | Date | Ce qu'il livre | Source |
|---|---|---|---|
| Blockaid « AI agent tools » | 2025-01-02, private beta | simulation + validation avant exécution ; MCP, LangChain, Eliza, Virtuals | [lu] blockaid.io/blog |
| MetaMask Agent Wallet | 2026-06-08 | Guard Mode = politique + approbation humaine 2FA (un *defer*), Beast Mode ; couverture 10 k$/mois | [lu] kucoin.com/news |
| Fystack policy engine (OSS) | 2026-06-24 | « no-match returns to the standard approval flow. It is not an automatic allow » ; journal de la règle | [lu] fystack.io/blog |
| Coinbase Agentic Wallets | 2026-02-11 | session caps, limites par tx, allowlists | [abs] |
| Safe Allowance Module | doc | cap par token avec reset ; « AI agent with a spending limit » | [abs] |
Conséquence : la fonction « allow / renvoi humain / deny + journal » existe déjà ; le gap MONARK est de **packaging** (région nommée, B_t dépletable,
résidu nommé, File rejouable) — exactement ce qui n'est pas câblé. Pour qu'un acheteur nommé paie : « un `before_tool(transfer|swap|sign)` servi, dont
la `Prediction` conformalisée est nommée (grandeur, task_class, calibration committée), dont `remaining_budget` est persistant et recomputable par le
client, et dont chaque abstain produit un File hashé rejouable sans MONARK ». Sans la `Prediction` nommée, Genkan = spend guard en vocabulaire MONARK.

## Koyomi — deux corrections de fait, puis « récit »
L'épisode SK Hynix / trade.xyz est le **2026-07-27 23:01 UTC, un lundi** (= 08:01 KST mardi, ouverture du pré-marché NXT), pas un week-end ni la
fenêtre 53 h ; −19 % relayé par plusieurs fournisseurs, ~57 M$ liquidés / ~17 M$ pertes réalisées / ~960 comptes [lu]. Le seul flux d'argent observé
est chez le builder (trade.xyz absorbe ~17 M$, annonce des filtres) ; HIP-3* (annoncé 2026-09-03, testnet) = allowlist + proxy actions reduce-only,
qui permet au builder d'internaliser un « flatten ». Verdict : coût démontré, internalisé ; demande côté desk = récit ; « 25 M$ slashables » = exposition
du builder, pas un budget d'achat.

## Les 5 autres pièces
Kessai : encombré (Kaiko Best Execution vendu pour MiCA art. 78 depuis 2026-07-01, CoinRoutes, Talos, ION) ; seule pièce adossée à une obligation
réglementaire chiffrée ; sous-segment « reçu natif » non démontré ; venue hors D0. Kyokusen : trou en comblement côté Aave, zéro mandat Morpho.
Mokugeki : problème documenté (arXiv 2609.15368), demande non démontrée, `AttestedDoc` non gelé. Kaihi : Arrakis 1 % AUM + 50 % fees [abs] ; demande
adjacente. Kamae : payeur = capital propre ; auto-falsification écrite dans produit-D.

## Le token — deux objets
Token on-chain / bond / slashing : aucun acheteur nommé ; GTM 05 = objet de coordination ; kill-criteria GTM 09 « B_t vendu comme APY » ; la seule
demande observée = la communauté voulant le CA visible. **Coût sans acheteur.** `B_t` persistant hors chaîne (motif sentinelle) : précondition pour que
`remaining_budget` de Genkan ne soit pas fictif ; à séparer du token dans tout ADR ; décision investisseur 2026-09-09 (« abstain → MONARK paie
l'inférence ; le client ne paie que sur commit ») à respecter.

## GTM playbook et « la claque »
Collisions : GTM 08 S7–S9 « design partner » (mot banni) ; « Hermes » nu dans GTM 03/04/09 et gap-01 ; gap-04 « SCOTUS probable ». Face au code :
01 The Lock (résidus hors enum gelé) ; 02 1010 Replay (7 pièces absentes) ; 03 Skill-gate et 05 Tweet-signs (`before_tool` + `AttestedDoc` absents) ;
04 Event-or-vote (aucun code). ACV GTM (2–10 k$, 50–180 k$, 180–540 k$) = cibles internes, jamais des précédents de pricing.

## Recommandation : ne construire aucune des 7 pièces dans les 30 jours ; convertir la fenêtre en sonde de demande instrumentée
1. **2026-09-19** : l'investisseur fixe N (ADR-M006 D8) ; critère M1 reconduit (≥ 3 clients externes distincts non-crawlers × ≥ 10 fetches, ou une
   entité nommée demandant une population précise).
2. **09-21 → 09-25** : ADR infra PF-M006-8 : `log` sur le bloc harnais (POST par host/route, jamais de payload, 5 × 30 j).
3. **09-21 → 09-30 (judging)** : un agent externe non-fondateur émet un `GateDecision` (north star GTM 09) — depuis OpenClaw/Hermes générique, pas
   ClawPump (ne peut pas appeler MONARK dans cette phase) ; démonstrable : `calibrate` BYO → `gate` sur une `Prediction` nommée ; aucune démo Bankr/Grok.
4. **10-01 → 10-15** : lot (a) restreint = prise d'attestation dans `gate` ; pas de B_t persistant tant que N n'est pas atteint.
5. **10-25 (J+30)** : lecture PF-M006-8 + M1 → décision : si seuil atteint, G0 Genkan `before_tool` avec la `Prediction` nommée ; sinon « demande non
   démontrée » consigné et fenêtre suivante à la 2ᵉ clé Narabi.
Falsifiabilité : confirme = ≥ N POST d'origine ≠ MONARK dont ≥ 1 `tools/call gate` avec task_class ≠ fixture, ou entité nommée ; tue = 0 appel non-crawler ou
seulement des `tools/list`.

## Procurements formés
Compteur ClawHub ; journal Caddy vitrine J+30 ; Blockaid AI agent tools (statut, pricing) ; MetaMask Guard Mode (docs) ; HIP-3* (spec) ; post-mortem
trade.xyz ; Kaiko Best Execution (grille) ; x402 Bazaar (frais, catalogue) ; FDUSD vs sUSDe (décision) ; statut ClawPump (clos : ne peut pas).
