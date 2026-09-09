# PLAN — Lot F-2c (vitrine MONARK : roadmap flotte + 8 teasers d'agents + câblage segment→produit)

- **Auteur du PLAN (R-1)** : orchestrateur, modèle résolu **`claude-opus-4-8`** (siège committeur MONARK sous **exception investisseur Opus-seat** datée 2026-09-07, précédent PR #1 ; journalisée par commit). Worker d'implémentation ne committe jamais (R-20).
- **Statut** : v2 — **checkpoint-1 validateur ACCEPTE-AVEC-CORRECTIONS (C-1..C-11) ; corrections appliquées ci-dessous et tracées §10.** Démarrable après commit du PLAN + addendum ADR (G0). Le worker précédent (mort sur limite de session) a été **jeté** (partielle pré-C-2, non vérifiée).
- **Rattachement** : `PLAN-F2-lot.md` §4 (sous-lot F-2c) + **ADR-M004 addendum D14** (C-2, ce lot) + ROADMAP-MONARK §8/§9. **Base** : `main = bee7ad7` (F-2b mergé, PR #17).

## 1. Décision investisseur intégrée — C-2 (2026-09-09, memstack uid=9864041b)
La réserve C-2 du checkpoint-2 de F-2b est tranchée : **chaque carte de segment OUVRE le panneau du produit correspondant.** Tracé ici (pas un commentaire de code). Mapping :
| Segment (Home) | Produit (doigt) | Agent-moteur | Statut produit |
|---|---|---|---|
| Leverage | MONARK Softlanding | Ukemi (bâti) + gate Hikae (bâti) | **upcoming** |
| Vault LP | MONARK Firebreak | Ukemi (bâti) | **upcoming** |
| Betting desk | MONARK Verdict | **non tranché** (câblage β « event vs UMA ») | **upcoming** |
| DAO / agent | MONARK Warden | Genkan (roadmap) | **upcoming** |
| Rate treasury | MONARK Ballast | Kyokusen (roadmap) | **upcoming** |

**C-1** : la ligne Verdict ne nomme **aucun** agent-moteur (β = « event vs UMA », `MONARK SUITE\sous produits\1\biblio-00-index.md` l.8 : Economics Letters 268 / ISDA DC/CDS — **aucun Mokugeki nommé**, vérifié). Règle d'implémentation : **le placeholder Verdict décrit le câblage en générique, sans nommer d'agent-moteur.** Pendant formé (hors ce lot) : question investisseur « le capteur du câblage β est-il Mokugeki ? ».

**Invariant d'honnêteté (dur)** : **aucun des 5 produits n'est bâti** (le produit ≠ l'agent : Softlanding/Firebreak restent `upcoming` même avec Ukemi bâti). Tout segment ouvre un placeholder `upcoming` — jamais un faux panneau « built ».

## 2. Périmètre (3 livrables) + retouches Home induites
1. **Route `/roadmap`** : les **3 agents bâtis** (Shōgen/Hikae/Ukemi) en renvoi vers **leurs panneaux Home existants** (une seule source de vérité, pas de panneaux dupliqués) + les **8 agents `upcoming`** en teasers. `metadata` de la route sans chiffre (scan §6b) ; **pas de `generateMetadata`** (garde F-2b).
2. **8 teasers d'agents `upcoming`** (noms budō publics ; gabarit C2 = carte non-ouvrable : nom + phrase + badge `Upcoming`). Phrases EN sourcées (deck flotte + archive chercheur ; **wording final** ci-dessous — le G1 signalera les 2 écarts vs archive : Narabi « such as », Genkan « along with ») :
   - **Mokugeki** — *Mokugeki attests the facts it extracts from a document or an event, without adding sentiment or interpretation.*
   - **Narabi** — *Narabi watches for the signals that a redemption run has begun, such as a burn spike, a lengthening redeem queue, or a witness going silent.*
   - **Kaihi** — *Kaihi exits a liquidity range — minting or burning it — ahead of toxic order flow.*
   - **Kessai** — *Kessai routes a swap to a venue and issues a settlement receipt for the execution.*
   - **Kamae** — *Kamae quotes both sides of a market from inventory, and stays silent when told to abstain.*
   - **Kyokusen** — *Kyokusen fits a yield curve across maturities and gates rollovers and looped positions against it.*
   - **Koyomi** — *Koyomi flattens leveraged exposure ahead of a recurring weekend trading-window closure.*
   - **Genkan** — *Genkan is the point every transfer, swap, or signature passes through first, returning a commit, defer, or abstain decision along with the remaining budget.*
3. **Câblage segment→produit (C-2)** : les 5 cartes segment ouvrent chacune le `UpcomingPanel` de leur produit (§3), avec l'illustration du câblage.
- **Retouches Home induites (C-3)** : réviser le `act` de chaque carte segment (`page.tsx:40-46`) pour coller à la fonction du produit ouvert (sourcé ROADMAP §9.2, **en générique**, soumis au checkpoint-2) **ou** maintien justifié ; mettre à jour le commentaire l.37-39 (« No roadmap agent is named here ») et la phrase l.117-118 ; ajouter le lien Home → `/roadmap`.
- **C-9 (deux étages, rendu)** : une phrase rendue (sur `/roadmap` ou en tête des placeholders) pose l'invariant : **un produit est un câblage d'agents de flotte ; l'agent est le moteur.** Les **5 produits ne figurent PAS sur `/roadmap`** (le compte « three built, eight on the roadmap » reste vrai) — ils vivent uniquement derrière les cartes segment.

**Hors périmètre** : construire un produit/agent ; rendre un chiffre ; nommer une plateforme tierce sur le public (câblages en générique : « a lending venue », « a perp DEX », « a multisig treasury », « the rate surface »).

## 3. Composant `UpcomingPanel` (placeholder honnête)
Client, même feuille latérale que `panel-shell` (cohérence) mais **léger** — PAS les 8 blocs `built`. Contenu : titre (nom produit MONARK …), 1 phrase de fonction, **schéma de câblage** (capteur → gate → acte, SVG inline sobre, ink `currentColor`), 1 ligne « what it will connect » (générique), **un seul badge `Upcoming` au niveau produit** + « to be announced ». **C-10** : les nœuds du schéma **peuvent** nommer Ukemi/Hikae mais **ne portent aucune pilule « Built »** (un seul signal de statut par placeholder). Aucun bloc Frozen contract / Living proof / Bibliography (rien d'honnête à montrer pour un produit non bâti).

## 4. Honnêteté / gates (invariants durs) + oracle du joyau
- Statuts `built`/`upcoming` seulement (type `AgentStatus`), **jamais `live`**. Aucun `p_correct`/confidence/score ; aucun chiffre rendu (test 44) ; anglais (lang-gate site 0).
- **C-2 (oracle du joyau)** : un **registre de données** (les 8 agents roadmap + 5 produits, chacun avec statut) consommé par la route `/roadmap` et les placeholders, **verrouillé par un test racine** (`test/ci-gates.test.ts`) : `built` s'applique à **exactement {Shōgen, Hikae, Ukemi}** ; les **13 autres** (8 agents + 5 produits) sont `upcoming`. **Mutant nommé** : basculer un des 13 à `built` ⇒ **rouge**. Preuve au G1.
- **C-4 (gate plateformes tierces)** : étendre la liste fermée du scope vocab `site` (`vocab-banned.json` + `test/ci-gates.test.ts`) aux noms **non ambigus** : au moins **Aave, Polymarket, Kalshi, Pendle, Hyperliquid, HIP-3, Arrakis** (+ **UMA**, **Gamma** avec frontière de mot stricte pour éviter les faux positifs « gamma »/prose) + **mutant rouge**. Mots **ambigus** (« Safe ») en **contrôle manuel déclaré** + checkpoint-2 mot à mot.
- `git diff main -- schemas/ packages/` **vide**.

## 5. Oracle (déterministe, exit codes réels ; orchestrateur R-21 avant merge)
`npm run ci` (vocab+tsc+test, dont test 44 + gardes F-2b + le nouveau test de registre C-2 + le mutant plateformes C-4) ; `npm run lint` ; `npm run lint:ratchet` (≤ plafond) ; `(cd apps/site && npx next build)` exit 0 (route `/roadmap` rendue ; frontière RSC des placeholders client) ; `lang-gate --scope site` 0 ; `grep-forbidden` 0. **CA manuelle** : hydratation `next dev` — ouverture des placeholders depuis les cartes segment + la route `/roadmap` — déclarée, non couverte par `next build`.

## 6. MAST (C-8) — modes d'échec de ce lot
Héritage `PLAN-F2-lot` §8/§9. Deux modes propres : (a) **maquette-vs-réel** (MAST #1) — un placeholder `upcoming` ne doit rien présenter comme bâti ; contre-mesure = §3 (aucun bloc built) + oracle C-2. (b) **dérive d'assertion de mapping non sourcé** — nommer un agent-moteur non attesté par une source (ex. Mokugeki pour β) ; contre-mesure = C-1 (Verdict générique) + revue G2.

## 7. R-25 / provenance (C-5, C-11)
- R-25 : PR < 1205 (mesuré à la clôture ; exclusions docs/G1-*/G2-*/package-lock). Si > 1205 → **scinder** (roadmap+teasers | câblage segment→produit), mesuré et tracé (**C-11**).
- **C-5** : l'archive de sourcing des 8 phrases est rendue **durable** en la reversant dans **`docs/G1-lot-F2c.md`** (exclu R-25, hors whitelist d'export → export-sûr) : les 8 phrases finales + le détail « retiré de la source » par agent + les 2 écarts vs archive scratchpad. Le deck reste cité hors-git/confidentiel + uid memstack (comme JOURNAL l.182).
- **C-11** : `docs/G1-lot-F2c.md` consigne l'`error_origin` du worker mort (partielle jetée) = **outillage / limite de session**.
- G2 : `docs/G2-lot-F2c.md` (relecteur ≠ générateur, contexte frais, mutants nommés). Entrée `JOURNAL-PROVENANCE`. Zéro dette nue.

## 8. G0 — artefacts à commettre AVEC le PLAN (avant le 1er worker)
- Ce PLAN v2.
- **C-7 — Addendum ADR-M004 D14** : trace C-2 (segment ouvre le produit), l'invariant « les 5 produits sont `upcoming` », et note que **C-2 amende la réserve ROADMAP §9 l.176** (« un produit n'apparaît en public que quand il est bâti ») — C-2 est plus récente et explicite ; uid memstack cité. (ROADMAP hors-git ⇒ le porteur durable est l'ADR.)

## 9. Séquence
G0 (PLAN + ADR D14 commis) → implémentation mono-agent (worker Opus 4.8 : route `/roadmap` + 8 teasers + `UpcomingPanel` + câblage segment→produit + registre C-2 + gate C-4 + retouches Home C-3/C-9) → G2 (relecteur ≠ générateur, mutants nommés) → oracle R-21 → G7 → checkpoint-2 (validateur) → commit + PR + 5 CI verts + merge.

## 10. Traçage des corrections checkpoint-1 (C-1..C-11)
- **C-1** §1 (Verdict sans agent-moteur, biblio l.8 citée). **C-2** §4 (registre + test racine + mutant). **C-3** §2 (copy cartes segment + retouches Home). **C-4** §4 (gate plateformes + mutant ; ambigus manuels). **C-5** §7 (archive durable en G1 + wording final + 2 écarts). **C-6** en-tête (R-1 auteur + exception Opus-seat). **C-7** §8 (addendum ADR-M004 D14). **C-8** §6 (MAST). **C-9** §2 (phrase deux-étages rendue ; 5 produits absents de /roadmap). **C-10** §3 (un seul badge, nœuds sans pilule). **C-11** §7 (error_origin worker mort ; scission R-25 tracée).
Aucune correction ne rouvre une décision investisseur.

## 11. Erratum checkpoint-2 (validateur, 2026-09-09) — error_origin = spec/PLAN
- **C-1** : « aucune source ne nomme d'agent-moteur pour β » ne valait que pour `biblio-00-index.md` l.8 et ROADMAP §9.2. Le fichier de détail vers lequel l.8 pointe, `biblio-beta-adjudication.md`, est titré « Event vs adjudication (**Mokugeki × Kamae**) » et **nomme Mokugeki** (attesteur des bytes) apparié à Kamae. Le rendu Verdict **reste générique** (tenu — aucun agent-moteur affiché, vrai quelle que soit la décision), mais la question « le capteur de β est-il Mokugeki × Kamae ? » est **escaladée investisseur** (décision de valeur, non bloquante pour le merge). Règle de lecture retenue : une claim « aucune source ne nomme X » exige de suivre les renvois du document cité, pas seulement la ligne.
- **C-5** : « 2 écarts vs archive (Narabi/Genkan) » est **faux** — 0 écart PLAN↔archive (les deux tokens sont dans l'archive) ; les vrais écarts sont archive↔deck (transformations « retiré de la source »). `docs/G1-lot-F2c.md` §3 fait foi.
