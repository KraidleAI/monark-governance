# Rapport de passe — MONARK — Passe « Narabi + ACI + vitrine v0.4.0 »

- **Période** : 2026-09-12 → 2026-09-18
- **Objectif (G0)** : livrer Narabi comme sensor publié et rejouable (ADR-M012 : sentinelle quotidienne, tracker quantile adaptatif
  Angelopoulos–Barber–Bates 2024, deux fichiers statiques sous `/narabi/`), tenir la phrase D8 sur toutes les surfaces publiques,
  publier v0.4.0 (ADR-M010), puis mettre la vitrine à jour sous les régimes ADR-M013 et annoncer (décision investisseur 2026-09-18 :
  « on annonce aujourd'hui, dès que le site est mis à jour » ; Shōgen FULL mis de côté après consultation advisor).

## 1. Réalisé
- **Sentinelle en production** : J0 = 2026-09-17, `state.json` (`t: 0`, `q₁ = q_t = 1.311923e-4`, digest `48d40651…`) et `timeline.jsonl`
  (1 ligne, `pair non_evaluable`, chaîne de hash GENESIS → `09beb656…`) servis par Caddy `handle_path /narabi/*` ; premier pas attendu
  2026-09-19 vers 00:39 UTC (timer 00:30 UTC + délai ≤ 30 min).
- **Release v0.4.0** (go all) : PR gouvernance #64, miroir public `KraidleAI/Monark` (`ca12b59`), tag + GitHub Release, ClawHub 1.0.3,
  registre MCP 0.4.0 ; harnais redéployé, `serverInfo.version 0.4.0` depuis `apps/harness/src/version.ts` (M012-f, fixtures re-pinnées).
- **ADR-M013** (validé investisseur) : régimes vitrine T0 (édition + oracle + G2 sur diff) / T1 (mini-plan + worker + G2) / T2 (AgileGates) ;
  acceptation finale T0/T1 = relecture personnelle de l'investisseur après déploiement.
- **F-site-9a-i (T2)** : modèle/machine/audit SAS (`components/sas/*`), G2 approuvé, ADR-M004 D18. **F-site-9a-ii** : port du diagramme
  concept D **rejeté au rendu** par l'investisseur ; reverté intégralement, ancien diagramme conservé ; seuls `narabi-panel.tsx` et le bloc ACI
  conservés (commit `dfdd47b`).
- **F-site-10 (T1)** : page `/narabi` (concept B), lecture des fichiers publiés avec repli snapshot déclaré, explication T ≥ 7, borne Thm 1
  imprimée depuis l'état, critère de dérive, table des fenêtres, recette de recalcul, registre opérationnel ; 6 tests ; G2 approuvé.
- **T0 vitrine** : page token (CA copiable en tête, rôle du token, phrase « Skin in the game » verbatim, discount retiré) ; ligne de footer
  retirée ; home : Narabi 4ᵉ panneau + bloc ACI ; panneau « How to connect » built ; `/narabi` enrichi (six niveaux, recette de fenêtre,
  usage par le gate, « what this is not », glossaire — `lib/narabi-copy.ts`) ; rewrite dev-only pour la relecture locale.
- **Déploiements vitrine** (RUNBOOK-vitrine, sauvegarde + build `.new` + bascule atomique) : `0239faf` 08:44 UTC, `ab64d7c` 08:56 UTC ;
  200 sur `/`, `/narabi`, `/token`, `/fleet`, `/narabi/state.json`, `/narabi/timeline.jsonl` ; Caddy non touché.
- **Gouvernance** : PR #65 (2538 lignes) scindée pour R-25 en #66 (1180), #67 (1044), #68 (314), toutes vertes (G1/G3/G4/G6/R-25/CodeQL)
  et fusionnées ; miroir public resynchronisé (`2861d0c`, CI publique verte) ; casse `KraidleAI/Monark` alignée (README, release tooling).
- **Annonce** : thread day-zero de 16 tweets (teaser, release, liens, six niveaux, T ≥ 7, correction du fil v0.3.0 item 15), film 28,6 s
  (Higgsfield, puzzle des 11 pièces), remis à l'investisseur ; aucune mention du token.

## 2. Gates
| Gate | État | Preuve |
|---|---|---|
| G0 cadrage | ☑ | ADR-M010, ADR-M012 (+ amendement M012-e), ADR-M013 ; PLAN-Fsite-9-sas, PLAN-Fsite-9aii (amendé : port abandonné) |
| G1 provenance | ☑ | `docs/JOURNAL-PROVENANCE.md` (entrées 2026-09-18 : M012-f, F-site-10 + T0, T0 home + déploiement, `/narabi` enrichi + déploiement) ; G1-lot-fsite-9a-i, G1-lot-fsite-10, G1-lot-m012f |
| G2 revue 100 % | ☑ | G2-lot-fsite-9a-i, G2-lot-fsite-10 (relecteur ≠ générateur) ; T0 : relecture investisseur post-déploiement (ADR-M013) |
| G3 vérification auto | ☑ | `npm run ci` 270/270, lint 0, lang-gate 0, `next build` 13/13 à chaque commit ; CI GitHub verte sur #66/#67/#68 et sur le miroir |
| G4 métriques archi | ☑ | lint-ratchet 69/69 inchangé (plafond du 2026-09-16) ; 0 duplication nouvelle signalée par G2 ; churn : 1 lot reverté avant commit (9a-ii), voir §4 |
| G5 dette | ☑ | §3 : aucun dû nu ; items formés avec déclencheur et action |
| G6 compliance | ☑ | `npm ci` 0 vulnérabilité (VPS, 2 builds) ; CodeQL vert ; aucun secret dans l'arbre ; export whitelisté (manifeste sha256). CRA UE (règl. 2024/2847) : Art. 14 applicable depuis 2026-09-11 ; plateforme ENISA à re-vérifier à la prochaine passe |
| G7 verdict | ☑ | §5 |

## 3. Clôture zéro dette
### 3.a Demandes de procurement formées
**PR-M012-h — Lorden (1971), « Procedures for reacting to a change in distribution », Ann. Math. Statist. 42(6) 1897–1908 ;
Shin, Ramdas, Rinaldo (2022), arXiv:2203.03532 ; Vovk (2012), PMLR 25.** Identité complète et tentatives : ADR-M012 item (h) ;
usage : théorie ARL de l'instrument CUSUM. **Précondition de toute citation publique de l'instrument** (item (l)) ; aucune citation faite
dans cette passe (l'instrument n'est ni publié ni cité sur la vitrine).

### 3.b Recherches de solutions / items formés (déclencheur → action)
- **ADR-M012 (m) pool RPC** : deux alias `publicnode` dans `PUBLIC_ENDPOINTS` ⇒ quorum 2 possiblement non indépendant. Déclencheur :
  premier désaccord ou incident live ; action : dédoublonner par fournisseur + test « deux fournisseurs distincts ».
- **ADR-M012 (n) `rr` sous `await`** : déclencheur tout appel concurrent ; action : figer `start` + test.
- **ADR-M012 (o) journal d'accès Caddy** (téléchargements de `timeline.jsonl`/`state.json` non observables) : action sortante sous go,
  directive `log` avec rotation et sans IP conservée.
- **ADR-M012 (l) instrument post-J0** : publication de `instrument.json` sous `/narabi/` et rejeu des 11 mois sur la timeline live,
  **après** PR-M012-h ; déclencheur : premières paires évaluables.
- **ADR-M012 (i) redondance `GATE_TOOL_DESCRIPTION`** : prochain lot touchant la description ; re-pin h5.
- **ADR-M012 (g) ancrage hebdomadaire** : déclencheur premier mois live ; décision investisseur.
- **Registre MCP** : URL de dépôt à aligner sur `KraidleAI/Monark` à la prochaine version publiée (0.4.0 déjà en ligne, inchangé).
- **ADR-M012 en-tête** : la ligne « approbation — (checkpoint-2 dû) » est périmée (checkpoint-2 M012-e rendu, amendement du 2026-09-18) ;
  action : corriger l'en-tête au prochain lot touchant l'ADR.
- **Concept D (diagramme vivant)** : prototype archivé dans le dossier design ; leçon consignée : aucun port sans capture du rendu réel
  validée par l'investisseur. Aucune action sans directive.
- **Nettoyage VPS** : timer systemd `monark-app-prev-cleanup` au 2026-09-25 09:00 UTC (suppression `.prev` + `.bak-20260918-*`).

### 3.c Dette délibérée-prudente contractée par ADR
| ADR | Principal | Propriétaire | Échéance |
|---|---|---|---|
| ADR-M012 | borne Thm 1 au-dessus de la cible jusqu'à T = 1789 (publiée telle quelle, « weak » dit) | orchestrateur | revue à T = 7 (2026-09-26) puis mensuelle |

## 4. Métriques G4 (R-15)
| Métrique | Passe N−1 (v0.3.0) | Passe N | Tendance |
|---|---|---|---|
| Duplication nouvelle | non relevée en série | 0 signalée par G2 (9a-i, F-site-10) | première mesure de série |
| Churn < 2 sem. | non relevé | 1 lot reverté avant commit (9a-ii, 5 fichiers non suivis), 0 commit reverté | à suivre |
| Ratio refactoring/ajout | non relevé | faible : passe d'ajout (page, panneaux, copy) ; refactoring = M012-f (source unique de version) | à suivre |

Aucune dégradation consécutive constatée ; la série démarre ici.

## 5. Verdict final (G7)
**Passe close.** Objectif G0 atteint : Narabi publie et rejoue, D8 tenue sur README / ADR / skill / site / harnais (test byte-identique),
v0.4.0 publié sur les quatre surfaces, vitrine à jour et validée par l'investisseur, gouvernance fusionnée en trois lots R-25, miroir synchronisé.
`error_origin` de la passe : orchestrateur (spécification de mission M012-f contraire à ADR-M010, refusée à raison par le worker ; port du
diagramme lancé sans validation du rendu). Prochaine étape, consigne investisseur : étude « prochain produit vs enrichir l'existant »
(advisors + chercheurs), puis Shōgen FULL après sa campagne ; contrôle T = 1 le 2026-09-19, retour public à T = 7.
