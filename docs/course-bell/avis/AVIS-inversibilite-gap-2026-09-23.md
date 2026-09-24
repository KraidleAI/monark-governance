<!-- Persisté par l'orchestrateur depuis le rendu de l'advisor-defi (claude-fable-5-1, effort medium), 2026-09-23 22:5x UTC ; recopie intégrale du texte rendu (l'advisor n'écrit pas, R-20) ; avis, jamais verdict (R-26). -->

# AVIS — inversibilité du gap publié par Bell (consultation R-26, 2026-09-23)

## 0. Ce que j'ai lu [lu] et ce que j'infère

[lu] : `docs/course-bell/FAITS-close-sources-2026-09-23.md` (13 candidats, C-POL Nasdaq GDA 5.0 §1.8/§1.18, C-POL-2 UTP, addendum Cboe/Databento `statistics`), `docs/course-bell/FAITS-databento-licence-24h-2026-09-23.md`, `apps/bell/src/gap.ts` (l.1-14, 62-77), `apps/bell/src/collect.ts` (l.150-210), `apps/bell/src/digest.ts` (l.10-21), `docs/adr/ADR-B0-programme-bell.md` l.74 (ESC-1 c), `docs/sec-4927/work-2026-09-23/PLACEHOLDERS-RESTANTS-2026-09-23.md`. Les clauses des fournisseurs sont reprises telles que le chercheur les a extraites (firecrawl directQuote, fidélité à re-vérifier par l'orchestrateur sur les clauses porteuses — je ne les ai pas rouvertes).

Inféré (fait documentaire, pas avis juridique) : toute qualification « recréable », « substitut raisonnable », « redistribution ».

## 1. Trois faits qui reformulent la question

**F1 — La forme publiée aujourd'hui est plus riche que ce que le produit consomme.** `gap.ts:70` : `gT = ln(vwap/close)` à 10 décimales ; `vwap` (fait on-chain de première main) publié à 10 décimales ; `collect.ts:200/207` publie DÉJÀ `exceed1/exceed2/exceed5` par session. Les placeholders SEC Q3 (`t4_TSLAx_wkn_gt1/gt2/gt5`, tableau régime × seuil) ne consomment que des parts d'exceedance. Donc **la valeur Q3 vit dans les booléens ; `gT` à 10 décimales est un surplus publié** qui, avec `vwap`, restitue le close à 10 décimales près (close = vwap · e^(−gT)).

**F2 — ESC-1 (c) est contredit par les textes lus.** `gap.ts:6-7` et ADR-B0 l.74 posent : « Publishing vwap+g_t DOES let one derive close — accepted by ESC-1 (c) (the close is a public fact) ». Or Nasdaq GDA §1.18 [lu] range dans l'« Information » tout élément « processed in such a way that the Information … can be identified, recalculated or re-engineered » ; §1.8 définit la « Derived Data » comme ce qui « cannot be reverse engineered or decompiled to recreate the Information » ; Cboe DataShop §6 [lu] : « works … from which Data can be readily recalculated, will constitute Data » ; Tiingo (ii) [lu] nomme comme exemple interdit « calculations supplied with an anchor, reference value ». Trois textes indépendants, même règle. `digest.ts:21` le signale déjà comme « a point for checkpoint-2, not a ruling ». **Le vrai objet de l'avis n'est pas a/b/c/d : c'est qu'ESC-1 (c) doit être réécrit.** « Le close est un fait public » est vrai au sens économique, faux au sens des définitions contractuelles lues.

**F3 — Deux problèmes distincts se cachent sous « Databento 24 h ».**
- Problème *définitionnel* (Nasdaq §1.8/§1.18, Cboe §6, Tiingo) : une valeur inversible n'est pas une dérivée. **Aucune exemption temporelle** dans ces définitions : décaler la publication ne le résout pas.
- Problème *Databento* (§1.1 « distributing data externally within 24 hours » vs §1.7 « license … You plan to redistribute the data » vs FAQ prix « redistributed … after 24 hours ») : contradiction interne confirmée en première main (A1), qui ne se lève que par un écrit (P-DBN-1).
L'offset `16:00 ET + 24 h` répond au second, pas au premier. L'option « close décalé au-delà d'un délai » (variante de b) est donc **inopérante sur le problème définitionnel**.

## 2. Recommandation

**(b) maintenant, en forme binnée : retirer `gT` de la surface publique, garder `vwap` + `exceed1/2/5` (+ `abstain`, résidus, `earliest_publish_utc`).** (a) et (d) ne sont pas des options concurrentes mais des **portes** pour réintroduire `gT` un jour. (c) est écarté en l'état.

Pourquoi :
- Préserve intégralement Q3 (parts d'heures/sessions au-delà de 1/2/5 % par régime) — c'est exactement ce que la lettre 4-927 publie ; aucune perte de valeur produit mesurable sur les placeholders.
- Retire l'objet qui « recreate[s] the Information » à 10 décimales. Ce n'est pas une préférence de présentation : c'est ce qui change la **qualification** de la donnée sous les trois textes lus.
- La propriété ADR-B0 l.74 « recalculable par un tiers disposant d'une licence de close » tient : le tiers recalcule `gT` puis `exceedN` à partir de `vwap` publié (bit-identique, `bell_session_gap_identical_to_replay`) et de son propre close.
- Compatible avec l'invariant MONARK : le témoin atteste des faits recalculables (`vwap`, booléens de seuil) ; le seuil est déjà côté appelant (1/2/5 déclarés dans la méthode).

Coût (réel, à porter par un lot avec ADR) : changement de forme du digest ⇒ `PINNED_BELL_SHA` re-épinglé, whitelist T-1b (`bell_publish_whitelist_covers_all_collector_gap_shapes`) et `bell-report.mjs` (rendu `pct` 2 décimales) à aligner, `/bell/method` à réécrire (« g = … » ⇒ « exceedance at 1/2/5 % ; g not published »), ligne à 2 % à trancher avec C-6 des placeholders. Rien de servi aujourd'hui ne porte `gT` (4/4 `no_close_ref`) : la fenêtre pour changer la forme **avant** la première valeur de marché est ouverte et c'est le moment le moins coûteux.

## 3. Attaque de (b) — ce qu'il faut mesurer avant de le dire « défendable »

Avec `vwap` publié et une bande de seuil active, le close est **borné** : si `exceed1 = 0`, close ∈ [vwap/1.01, vwap/0.99] ; si `exceed1 = 1, exceed2 = 0`, close ∈ deux intervalles disjoints, etc. Quatre sessions (pre/regular/after/overnight) partagent le même `refDate` (`collect.ts:162`) ⇒ **intersection de quatre bornes** sur un même close. Ce n'est pas une reconstruction, mais est-ce un « reasonable substitute » (Nasdaq §1.8, suite de la définition) ? Question de juriste (P-POL-1), pas de modélisation.

**Mesure à faire (interne, données fondatrices, avant publication)** : pour chaque jour de référence, largeur de l'intersection des intervalles admissibles impliqués par les 4 × 3 booléens ; distribution sur la fenêtre fondatrice (2025-07 → 2025-10). Si la largeur médiane descend sous quelques dizaines de bp sur des jours réels (typiquement quand une session est juste au-dessus de 1 % et une autre juste en dessous), la défense « non recréable » s'affaiblit et il faudra soit **arrondir `vwap`** (ex. 2 décimales ou 10 bp — c'est un fait on-chain, l'arrondi ne coûte rien de contractuel mais casse « recalculable bit-identique » : à déclarer), soit ne publier qu'**un** booléen agrégé par jour, soit obtenir l'écrit (a)/(d). Je donne cette mesure comme **condition** de (b), pas comme acquis. À 3 seuils sur 4 sessions, la borne théorique minimale est de l'ordre de 1 % (largeur d'une bande [1 %, 2 %]) — donc bien plus large que la précision d'un close (1 cent), mais l'intersection réelle dépend de la dispersion des VWAP inter-sessions, qui est justement ce que Bell mesure.

Variante à ne pas retenir : « gap sans le prix on-chain en clair ». `vwap` est la jambe publique, recalculable, non licenciée — la retirer détruit la propriété de rejeu sans rien gagner (c'est `gT`, pas `vwap`, qui porte le close).

## 4. (a), (c), (d) — statut

- **(a) P-DBN-1 (écrit Databento)** : condition, pas option. La FAQ prix « Most of our datasets can be redistributed internally or externally after 24 hours » [lu] rendrait `gT` publiable *a fortiori* — mais contredite par §1.7 [lu], et Databento écrit lui-même « we have to pass through the licensing restrictions from the original publisher » [lu], ce qui renvoie au problème définitionnel Nasdaq. Un écrit Databento ne lève le point Nasdaq que s'il l'adresse explicitement (question à formuler ainsi dans P-DBN-1 : « valeur mono-titre à partir de laquelle le close se recalcule »).
- **(d) P-POL-1 (juriste, CTA/UTP)** : condition. UTP « End-of-Day … not fee liable » [lu] vise le SIP ; EQUS.SUMMARY vient de NLS+ propriétaire (C2bis) — transposition non lue. « Single Security Derived data that contains price data … generally fee liable at the underlying product rates » [lu, Nasdaq 2016-4 et UTP] : même si le produit sous-jacent End-of-Day est non redevable, l'articulation n'est établie par aucune page. C'est ce qui ferait basculer vers publier `gT` : **l'un des deux écrits (a) ou (d)**.
- **(c) Tiingo 250 $/mois, Twelve Data Enterprise** : écarté en l'état. Leurs propres textes [lu] interdisent la dérivée inversible même avec droit d'affichage, sauf approbation écrite ; leur close n'est pas qualifié officiel (Tiingo composite « at least 3 data sources » ; Twelve Data NON TROUVÉ) ; Tiingo Starter interdit la rétention persistante (incompatible bundle rejouable). Payer ne change pas la définition.

## 5. Même exposition sur Q6 — à nommer, non résolue ici

`digest.ts:18-21` [lu] : l'ADV est dérivable de `vol_ratio` + `volumeBase`, « the SAME derivation shape ». Le volume consolidé est aussi une donnée Nasdaq end-of-day (NLS+ « consolidated volume »). Le binning n'est **pas** disponible ici : Q6 exige le ratio (condition F, ADV/ADV). Deux pistes à instruire, pas à trancher : (i) publier `vol_ratio` arrondi (l'ADV d'un titre liquide sur un mois est-il un « reasonable substitute » à 2 chiffres significatifs ? — même question juriste) ; (ii) demander l'écrit (a)/(d) en couvrant explicitement le volume. Ne bloque pas (b) pour Q3 ; **bloque toute clôture « inversibilité traitée »**. À joindre à P-DBN-1 et P-POL-1.

## 6. Ce qui ferait basculer l'avis

- Vers **publier `gT`** : écrit Databento (a) ou avis juriste (d) disant qu'une valeur mono-titre inversible publiée ≥ 24 h après la clôture est hors « Information » / non redevable pour EQUS.SUMMARY.
- Vers **plus restrictif que (b)** : mesure §3 montrant une intersection étroite ; ou lecture CTA/CT Plan (SPY) plus stricte que UTP.
- Vers **changer de source** : rien dans les textes lus — aucun candidat ne cumule close officiel + dérivée inversible autorisée + provenance ; Cboe reste le meilleur témoin interne de la clôture officielle (condition 63), usage interne seulement.

## 7. Items formés (pas de dû nu)

1. **ESC-1-REWRITE** (orchestrateur, ADR) : réécrire ESC-1 (c) — « close dérivable accepté car fait public » ⇒ « close non recréable à partir de la surface publique ; forme binnée ; `gT` réservé au bundle interne / tiers licencié » ; déclencheur : avant la première publication d'un gap calculé (porte G-b re-déclenchée).
2. **MESURE-INTERSECTION-1** (worker, données fondatrices, hors publication) : largeur d'intersection des bornes de close par jour de référence, distribution ; déclencheur : G0 du lot ESC-1-REWRITE.
3. **P-DBN-1 amendé** : ajouter la question du volume (Q6) et la formulation « valeur à partir de laquelle le close se recalcule ».
4. **P-POL-1 amendé** : ajouter « reasonable substitute » pour des bornes d'intervalle et pour un ratio de volume arrondi.
5. **Fidélité des clauses** (orchestrateur, lecture sur place) : relire sur URL Nasdaq GDA §1.8/§1.18, Cboe §6, Tiingo (ii) — l'avis repose sur des extraits directQuote.

Avis, pas verdict : G2/G7 et l'acceptation restent chez l'orchestrateur et le validateur.
