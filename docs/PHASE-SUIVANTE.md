# Phase suivante — consigne investisseur du 2026-09-18 (déclenchée à la clôture de la phase Narabi + ACI + site)

> Verbatim : « on a 11 produits, on en est qu'au 4ème, un début de documentation t'a été fourni pour chaque produit.
> quand on terminera narabi et ACI, le choix à faire est crucial, soit on étudie le prochain produit à livrer, soit on
> enrichit narabi aci et tout ce qui existe déjà, task class, flux, à toi d'étudier cette question avec les advisor et les
> chercheurs. au même temps, la campagne shogen est en cours. une fois qu'elle aura terminé, on devra aussi continuer de
> développer shogen en FULL, suivre sa roadmap, en réétudiant l'horizon du moment, réajuster ou pas. »

## Déclencheur (tout doit être clos)
go 3 sentinelle (J0 = 2026-09-17) · go 4 textes publics « adaptive » · go 5 annonce (T, J0) · refonte du site (designer,
page `/narabi/live`) · items formés ADR-M012 (a)(e)(g)(h)(i)(l) · seuil R-25 code-seul (ADR) · lot M012-d (quorum RPC).

## Action 1 — Étude de portefeuille (lot G0 dédié, aucun code)
1. Inventaire des **11 produits** depuis les débuts de documentation fournis (`Downloads\MONARK SUITE\`, sous-produits,
   « autres produits monark », `NARABI`, `NARABI PHASE`) ; confirmer les **4 livrés** (gate/HIKAE, cascade/UKEMI,
   attest/Shōgen, Narabi/AttestedFlow) contre les docs.
2. Pour chacun des 7 restants : fiche fermée — besoin (acheteur nommé), gap (whitespace vs encombré), dépendances aux
   5 contrats gelés, effort, risque d'overclaim, données disponibles.
3. Alternative **« enrichir l'existant »** chiffrée au même format : nouvelles `task_class` Narabi (autres stablecoins /
   familles, cadence horaire = nouvelle classe Mondrian), flux, branche (a) ACI si le critère (iii) tire, `B_t` à
   bFloor = 0 (item (a)), BYO, dashboard de risque « vue, pas score » (DefiDrama).
4. Consultations formées, en tandem : **advisor-marché** (demande réelle, précédents de pricing) + **advisor-defi**
   (validité statistique, données) + **advisor** (architecture, dette) + **chercheurs Sonnet 5** (corpus produit,
   comparables) — avis, jamais verdict.
5. Sortie : recommandation classée + **ADR de phase** ; **décision = investisseur** (CA-2), checkpoint-1 validateur.

## Action 2 — Shōgen FULL (après la fin de la campagne Shōgen en cours)
Reprendre le développement complet selon la roadmap Shōgen (`F:\Shogen`, `docs/DEVOPS.md`, ADR-0019..0023, campagne S2/S3,
J0 = 21 août) ; **réétudier l'horizon du moment** (marché, données, contraintes) et décider par ADR **réajustement ou non** ;
roster : `shogen-orchestrator` (à épingler `claude-fable-5-1`), workers Opus 4.8 max, chercheurs Sonnet 5 max, audit
d'entrée dû (`docs/AUDIT-ENTREE.md`).

Les deux actions sont **séquencées après** la phase courante, jamais en parallèle d'elle. Mémoire : memstack uid `a6c68626…`.
