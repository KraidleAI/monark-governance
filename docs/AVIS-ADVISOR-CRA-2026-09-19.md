# AVIS ADVISOR — applicabilité du CRA (règlement UE 2024/2847) à MONARK — 2026-09-19
Consultation formée routée par l'orchestrateur (décision investisseur 30 « consulte un advisor ») ; agent `advisor` Fable 5.1, lecture seule. **Avis, jamais verdict.** Persisté par l'orchestrateur ; la décision reste à l'investisseur.

## 1. Reformulation de l'advisor
La question n'est pas « MONARK est-il dans le champ ? » mais « **quel fait** ferait entrer MONARK dans le champ, et existe-t-il déjà ? ». Déclencheur = **monétisation** (abonnement, paiement en token) ou **donnée personnelle exigée** comme condition d'usage ; pas la release. Second fait discriminant : la **forme juridique** de KraidleAI (personne physique ⇒ hors CRA pour la version gratuite, ligne directrice §53).

## 2. Source nouvelle : ligne directrice C(2026) 5252 (annexe, 27/07/2026), non contraignante
Deux copies sauvées sur F: (règle disque) — **non identiques octet à octet** (encodage PDF différent, à comparer par texte avant citation) :
- miroir dataleaks.org : `F:\PRODUITS\etude-2026-09-19\reglementaire\cra-guidance-C2026-5252-annex-mirror.pdf` sha256 `3388397e93f7b70eafb4d89af2e6adcbf8ab3c5e4b0d03e36eaf2cf367a4da05` (lu par l'advisor : §2, 3, 8, 9.1 ; 9.3 p. 80-81 NON LU) ;
- officiel `https://ec.europa.eu/newsroom/dae/redirection/document/131456` : `…-official.pdf` sha256 `fe209c250e3d1f7599e42826d91963666951332927edcf511a2e79fe8d2f8234` (non lu — item : lecteur, comparaison texte des § cités).

| Point | Annexe [lu, miroir] | Conséquence MONARK |
|---|---|---|
| FOSS non monétisé sur dépôt public | §23, §42, §65 ; cons. 18 | miroir GitHub Apache-2.0 : pas une mise sur le marché |
| Logiciel exécuté à distance et seulement accédé ≠ produit | §20-21, Ex. 5-6 | service MCP/API hébergé seul : hors champ (NIS2 éventuel) |
| Portail émettant les jetons nécessaires au produit = RDPS | §194 | pertinent si un `gate` à clé conditionne un client distribué |
| FOSS gratuit par lequel on monétise d'autres services ⇒ marché | §54, Ex. 14-15 | au premier abonnement, la pièce gratuite qui vend l'accès devient produit |
| Donnée personnelle exigée (hors sécurité) ⇒ activité commerciale | §54, Ex. 16 ; cons. 15 | **trou de l'audit** : l'API/MCP exige-t-il inscription/e-mail/wallet ? à vérifier |
| Open-core : gratuit ⇒ steward ; payant ⇒ fabricant ; même entité | §52-53, §72-76 | Q4 de l'audit réglée par la ligne directrice |
| Personne physique éditrice de la version gratuite ⇒ hors CRA | §53 | la forme de KraidleAI tranche la moitié du tableau |
| Steward qui monétise ensuite ⇒ fabricant à partir de cette date | §84 | la release gratuite antérieure n'est pas rattrapée |
| Art. 14 depuis 11/09/2026 pour tout produit dans le champ ; pas rétroactif | §210, §217 | si un produit entre dans le champ, art. 14 immédiat ; art. 13§8 ≥ 5 ans et CE = 2027 |

Consultés en ligne le 2026-09-19 [abs-WF] : page Commission de publication (liens officiels 131455/131456), page `cra-reporting`, FAQ ORC WG v1.4 (04/09/2026).

## 3. Estimation conditionnelle (advisor, non sourcée comme chiffre)
| | KraidleAI personne physique | KraidleAI personne morale |
|---|---|---|
| Aujourd'hui (0 paiement, 0 donnée exigée — à confirmer) | hors CRA ; art. 14 non | pas de produit sur le marché ; steward possible (art. 24, 2027) ; art. 14 non |
| Au premier abonnement / paiement token / donnée exigée | fabricant + RDPS ⇒ art. 14 immédiat | idem + steward de la version communautaire |
Probabilité que l'art. 14 soit courant aujourd'hui : faible (calibrage advisor « < 15 % », non sourcé). Deux faits techniques à trancher en interne : (a) la skill ClawHub est-elle du « computer code » (art. 3(4)) ? (b) `packages/contracts` ou un client MCP s'exécute-t-il côté utilisateur ? Si non aux deux : seule la piste steward reste.

## 4. Recommandation de l'advisor : **B maintenant, A déclenché par deux événements**
Release publique sans juriste **à condition** de ne conditionner aucun accès à un paiement, don, token ou donnée personnelle, et de trancher (a)(b). **Juriste (A) obligatoire** dès que (i) KraidleAI = personne morale **et** (ii) décision de facturer — **avant** le premier paiement. Renversement : si la skill est du code exécuté chez l'utilisateur **et** que le gate exige déjà une donnée personnelle ⇒ produit existant, art. 14 court, A urgent.

**Sans regret avant release** : (1) `SECURITY.md` + canal de divulgation + page `/security` ; (2) `docs/PROCEDURE-notification-CRA.md` (horloge 24 h / 72 h / 14 j, §211-215, plateforme unique ENISA/CSIRT) ; (3) SBOM en CI (CycloneDX / `npm sbom`) publiée par release ; (4) document « frontière produit » (= cartographie de branchement) ; (5) écrire noir sur blanc qu'aucune donnée personnelle n'est exigée ; (6) template G6 du corpus corrigé ; (7) ADR (contexte / décision / alternatives / conséquences, tuyaux SECURITY.md → site, SBOM → release).

## 5. Questions au juriste (reformulées)
Q1 ancrage hors UE (importateur art. 3(16), représentant art. 18, autorité art. 52) ; Q3 l'intention documentée sans mécanisme suffit-elle (§40 vs Ex. 14-16) ; **Q6 nouvelle** : une skill ClawHub est-elle un « logiciel » art. 3(4) ; Q2/Q5 fusionnées : si oui, le service hébergé est-il RDPS (§184-202) ; Q4 seulement si la scission gratuit/payant n'est pas nette.

## 6. Inconnues déclarées
Identité texte miroir/officiel ; donnée personnelle exigée ou non par l'API/MCP ; exécution côté utilisateur de la skill/contracts ; forme et pays de KraidleAI ; §9.3 p. 80-81 ; consolidation/rectificatif du règlement.

---
## Décision orchestrateur (sous réserve investisseur)
Voie **B** retenue comme plan de travail : les 7 items « sans regret » forment le lot **CRA-B** (docs + `SECURITY.md` + SBOM CI ; propriétaire orchestrateur ; déclencheur : avant la cartographie pré-release, car SBOM et SECURITY.md sont des surfaces publiques ⇒ bloquants au sens de la décision 21). Faits (a)(b) et « donnée exigée » : à mesurer par un worker (grep code + skill) dans le même lot. **A** reste conditionnel aux deux événements ; l'investisseur fournit forme + pays.
