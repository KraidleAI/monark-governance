# ADR-M014 — e-détecteur de dérive (Shin–Ramdas–Rinaldo) : pré-enregistrement ancré, instrument étiqueté, jamais déclencheur

- **Statut** : décision (pré-enregistrement) 2026-09-18 · checkpoint-1 validateur — dû avant le code · checkpoint-2 — dû avant clôture
- **Dates** : décision 2026-09-18 · dernière modification 2026-09-18
- **Rattachement** : ADR-M012 D6 (section instrument hors état), items (h) (clos 2026-09-18, `docs/biblio/M012-h/`) et (l) (publication
  post-J0, T ≥ 7) ; ADR-M010 (release) ; ADR-M013 ne s'applique pas (hors `apps/site`).
- **Décision investisseur (verbatim, 2026-09-18)** : « demande aux deux advisor si on peut le faire maintenant, on est la, on vient juste de
  publier narabi, pourquoi attendre ? » puis « go, full puissance une passe sans arret jusqu au livrable final, consultation advisor quand ça bloque ».
- **Ancre de pré-enregistrement (chaîne publiée au moment de cette décision)** : `T = 0`, dernière ligne publiée `2026-09-17`,
  `line_hash = 09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82`, `state.json.digest = 48d40651eb2e69c3…` (lus sur
  monarkgate.tech/narabi le 2026-09-18). Fixture de design : `fixtures/usde-calib-series.json` sha256 `7c33027a0e4c6a72…`.
  **Aucune donnée postérieure au 2025-10-15 n'a été rejouée par l'instrument avant ce commit** (le tirage (l) des 11 mois 2025-10-16 → J0
  n'a pas eu lieu, journal 2026-09-18). L'antériorité est locale (dépôt privé, fenêtre de push fermée) : ce commit est le premier poussé à
  la réouverture, avant tout tirage. **Limite écrite (C-7)** : l'ancre `line_hash` prouve la *post-datation* (cet ADR est postérieur au
  2026-09-17) ; l'antériorité vis-à-vis du tirage (l) n'est prouvable que par l'ordre des commits une fois poussés, sans horodatage tiers.
  La section `edetector` publiée portera `preregistration_commit: <sha M014-a>` (une date n'est pas une ancre) ; le journal de (l) consigne l'ordre.

## Contexte
La lecture intégrale de PR-M012-h (Lorden 1971 ; Shin, Ramdas & Rinaldo 2022, arXiv:2203.03532v4, ci-après SRR ; Vovk 2012) établit :
- la garantie classique d'ARL de Lorden (Thm 1–3) suppose l'i.i.d. (preuve p. 1900) — mesuré faux ici (taux de ratés calmes par semestre
  0/16, 6/182, 23/161, 31/163, 3/94, advisor-defi [mesuré]) ;
- SRR donnent un contrôle **non asymptotique** de l'ARL **sans i.i.d.** pour tout e-détecteur (Thm 2.4 p. 7 ; Rem. 2.1 p. 6 : aucune
  hypothèse sur le changepoint ni le post-changement pour l'ARL ; c'est le **délai** qui suppose l'i.i.d.) ;
- **identité algébrique (advisor-defi, [mesuré] 9,5446 des deux côtés)** : avec λ* = log(p₁(1−p₀)/(p₀(1−p₁))), l'incrément SRR éq. (65) p. 24
  est exactement le rapport de vraisemblance Bernoulli ; `pageCusumMax(calmMiss, 0,125, 0,25)` **est** `log M^CU_n` (Déf. 2.11, éq. (14) p. 9)
  pour la classe {E[X_n | F_{n−1}] ≤ 0,125} — identité des **maxima** (Page S_n = max(0, log M^CU_n)), pas des chemins (C-10). Ce qui manque n'est pas l'arithmétique : (a) une règle d'arrêt à 1/α (Déf. 2.12 p. 10) au lieu
  du quantile de permutation ; (b) une classe pré-dérive qui **contienne la référence** — à p₀ = 0,125 le e-SR (grille D1 [λ*(0,40), λ*(0,90)]) franchit 1/1000 in-sample le
  **2024-10-11** (paire calme d'indice 279, étiquetée par le jour de sa fenêtre de clôture ; 2024-10-10 avec q_L ∈ {0,20 ; 0,25} — C-2, recompute validateur), donc cette classe est inapte ; 0,125 ≈ q97,5 de Beta(61, 553), la classe « échangeable avec la calibration »
  (Vovk 2012 Prop. 2b p. 479), que l'ADR-M012 D7 mesure fausse.
- Le contrôle par permutation n'est couvert par aucun des trois papiers (0 occurrence) : c'est un test d'échangeabilité intra-échantillon
  (Vovk Prop. 1 p. 477), valable sur une séquence close, sans validité séquentielle.

Deux avis convergents (advisor ingénierie, advisor-defi, 2026-09-18) : la validité d'un e-détecteur ne dépend d'aucune donnée live, seulement
de ce que le design soit figé **avant** les données sur lesquelles la borne est revendiquée ; attendre T ≥ 7 n'apporte rien et coûte
l'antériorité. Ce qui ne peut pas attendre (le texte des paramètres) est séparé de ce qui peut (le code, un lot avec plan).

## Décision
**D1 — Pré-enregistrement (ce document, avant tout code et tout tirage).** Classe pré-dérive P = {suites de misses E_static des **paires
calmes** (filtre mécanique `isCalm` sur les deux fenêtres, même sélection que la calibration), filtration = paires calmes passées, telles que
E[X_n | F_{n−1}] ≤ p₀}. Constantes (option A de l'advisor-defi) :

| Constante | Valeur | Source / justification |
|---|---|---|
| `p0` | **0,30** | **Sélection** (C-8) : constante déjà committée, record roulant-90 in-sample du taux de raté calme (ADR-M012 D6, 27/90 au 2025-04-30) — sélection sur les données de calibration, aucune borne in-sample ; la table e-SR par p₀ de l'advisor-defi a été consultée et est déclarée. **Design check** (clause distincte) : le rejeu prospectif e-SR sur les 616 paires commises ne franchit pas 1/α avec marge ≥ log 10 — mesuré 4,383 vs 6,908 (marge 2,52). **La classe est bord-à-bord avec le record** : la statistique a de la marge, la classe n'en a pas ; une répétition de 2025H1 est au bord, pas dedans |
| `q_L`, `q_U` | **0,40 ; 0,90** | q_L = seuil du critère (iii) rolling90 ; q_U = choix de réglage (le domaine irait à 1,0 ; SRR p. 26 plafonnent de même) — C-9 |
| `alpha_arl` | **10⁻³** | précédent SRR (§1.2 p. 5, §5.1 p. 26) ; 1000 paires calmes ≈ 3 ans à 336 calmes/an ([mesuré]) |
| statistique primaire | **e-SR** (Déf. 2.12, Rem. 2.13 p. 10) | pré-changement non stationnaire ⇒ c = 1/α ; e-SR détecte plus tôt à ARL égal |
| statistique secondaire | **e-CUSUM** (Déf. 2.11 éq. (14)) | continuité avec la statistique de Page publiée |
| mélange | **grille géométrique uniforme K = 12** sur λ ∈ [λ*(q_L), λ*(q_U)] — K et l'espacement en λ (SRR Alg. 3 espace les KL, pas λ) sont des **choix de réglage** ; validité indépendante (Prop. 2.3 p. 7 : tout mélange fixe est un e-détecteur), seul le délai en dépend (C-9) | la borne de délai explicite (Thm 4.3, Alg. 3) est **renoncée** ; item formé ci-dessous |
| incrément de base | éq. (65) p. 24 : L_n^(λ) = exp{λ(X_n − p₀) − B(λ)}, **B(λ) = log(1 − p₀ + p₀e^λ) − λp₀** (cumulant **centré**, SRR l. 1558 ; C-1) | E_{p₀}[L^(λ)] = 1 exactement ; à λ fixe = rapport de vraisemblance Bernoulli |
| départ | M₀ = 0 à la **première paire calme postérieure au 2025-10-15** ; n compte les **paires calmes**, jamais des jours | segment J0 marqué |
| franchissement | fait daté publié ; l'ADR décide un nouveau segment (M remis à 0, classe éventuellement révisée) ; la borne ARL vaut jusqu'à la **première** alarme de chaque segment (Thm 2.4), « between false alarms » se lit par segment remis à 0 (C-10) | doctrine des segments D6 |
| symbole | `alpha_arl` (« 1/alpha_arl = 1000 calm pairs ») — jamais « α » nu | collision avec α (couverture) et ε (ABB) |

**D2 — Rôle : évidence citée, jamais déclencheur.** Le critère pré-enregistré (iii) `rolling90_calm_miss ≥ 0,40` et la phrase D8 (« the
pre-registered drift criterion », singulier, 8 surfaces publiques) sont **inchangés**. Doctrine : tout ADR ouvert par (iii) cite l'état du
e-SR **comme évidence, sans présomption : l'ADR décide** (C-5 ; la règle « franchi ⇒ défaut = recalibration / non franchi ⇒ phase connue » est
retirée du plan et portée à l'item (d′), décision investisseur). `drift_flag` intouché. Aucun second déclencheur (chemin 1 de l'advisor-defi) ;
l'union (chemin 2) est un amendement ultérieur sous décision investisseur.

**D3 — Revendication bornée (la seule phrase publiable, à T ≥ 7 sous go, ADR-M012 (l)).** « The instrument's e-detector carries a bound on
the average run length: at least 1/alpha_arl = 1000 calm pairs between false alarms for any sequence whose conditional calm miss rate stays
at or below p0 = 0.30 (Shin, Ramdas and Rinaldo 2022, Theorem 2.4); nothing is claimed on detection delay or optimality, which would require
i.i.d. data this series does not satisfy (Lorden 1971). » Le mot **guarantee** nu, **probability** et **typically** sont interdits ; la borne
vaut contre le pire membre de la classe (« au moins », jamais « typiquement »). Le prix est écrit en clair : pour 0,30 → 0,40 (KL = 0,0226
nat/paire), délai d'ordre (log 1/α + 2)/KL ≈ 394 paires calmes (~14 mois) ; rolling90 tire bien avant parce qu'il n'a aucun contrôle.
Probabilité à horizon H : P(N ≤ H) ≤ H·alpha_arl (Ville, [abs]) — jamais sans H.

**D4 — Permutation : diagnostic rétrospectif figé sur la fixture.** Le CUSUM de Page (0,125 ; 0,25) + contrôle par permutation restent
publiés **comme section pré-J0** (preuve de D7 : 9,54 vs q999 = 6,24) ; ils sont retirés de toute lecture séquentielle (continuation
optionnelle). Amendement ADR-M012 D6 correspondant ; le test `sentinel_instrument_separate_digest` re-pinne explicitement.

**D5 — Isolation : lot VPS-zéro.** Aucune action sortante ; `diff = 0` sur `run.ts`, `timeline.ts`, `flow.ts`, `windows.ts`, `rpc.ts` ;
`state.json` garde ses 4 clés ; la timeline publiée ne bouge pas d'un octet ; `sentinel_sha` du VPS inchangé avant/après (rien déployé).
Le rejeu `--timeline <jsonl>` et la publication `instrument.json` restent rattachés à (l).

**D6 — Rejeu in-sample publié comme fait.** Sur les 616 paires calmes commises : max log M_SR = 4,38 (p₀ = 0,30), aucun franchissement,
étiqueté « design check, no bound » ; à p₀ = 0,125 le e-SR (grille D1) franchit 1/1000 le 2024-10-11 (convention : jour de la fenêtre de
clôture de la paire) — publié tel quel, c'est ce qui disqualifie 0,125 comme classe (C-2). Attente pré-déclarée : le gap commence le 2025-10-16, probablement en post-run (les 3 paires 10-13/14/15 sont calmes
mécaniquement et toutes ratées) ; les premières semaines n'invitent aucun re-réglage.

## Alternatives rejetées
- **A. Attendre T ≥ 7** : aucune raison statistique ni d'ingénierie ; perd l'antériorité (motif C-14).
- **B. Remplacer le CUSUM** : casse l'oracle pré-J0 épinglé (9,5446, 63 ratés, 0 dépassement), ressemble à un déplacement de cible après J0.
- **D. Basculer (iii) sur le e-détecteur** : change un critère pré-enregistré sans donnée live ; réédition publique de D8 ; hors périmètre.
- **Contrôle de la PFA (Rem. 2.7 p. 8)** : plus lisible mais délai non borné ; à reconsidérer seulement si un franchissement déclenche une
  action automatique.
- **Option B (p₀ = 0,20, alpha 10⁻⁴)** : plus rapide, mais compte une phase à 0,30 soutenue comme dérive ; réservée au cas où le e-détecteur
  devait devenir le seul critère (décision investisseur, non prise).

## Conséquences
- Deux PR (R-25) : **M014-a** = cet ADR + PLAN + corrections README M012-h ; **M014-b** = code + tests. Le commit G0 précède le code.
- `sentinel_sha` changera à la ré-archive de publication (l) — déclaré alors.
- **Items formés** : (d′) doctrine du défaut à la lecture du e-SR dans un ADR de dérive (retirée par C-5) — décision investisseur ; (a) borne de délai explicite via Alg. 3 (`computeBaseline`, Kmax = 1000, oracle R des auteurs en dev seulement, R-8) —
  déclencheur : demande de délai chiffré ; (b) garde `--out` hors de `public/` (exigée par (l), absente) — livrée en M014-b ; (c) taux de
  `non_evaluable` par régime à publier avec (l) (sélection dépendante de l'issue si l'indisponibilité RPC corrèle avec le stress) ;
  (d) union des déclencheurs (chemin 2) — décision investisseur.

## Sources
- [lu] SRR 2022 v4 (`docs/biblio/M012-h/fiche-shin-ramdas-rinaldo-2022.md`, texte `_txt`) : Rem. 2.1 p. 6 ; Déf. 2.2, Prop. 2.3, Thm 2.4 p. 7 ;
  Déf. 2.8, Rem. 2.7 p. 8 ; Déf. 2.11 éq. (13)-(14) p. 9 ; Déf. 2.12, Rem. 2.13 p. 10 ; Thm 4.3 p. 19 ; Alg. 1 p. 20 ; §5.1 éq. (65) p. 24-26 ;
  §6.2 p. 32-33 ; Alg. 3 p. 45.
- [lu] Lorden 1971 (`fiche-lorden-1971.md`) : éq. (2)-(3) p. 1897-1898 ; Thm 1 p. 1899 ; Thm 2 p. 1900 (preuve i.i.d.).
- [lu] Vovk 2012 (`fiche-vovk-2012.md`) : Prop. 1 p. 477 ; Prop. 2a p. 478 ; Prop. 2b p. 479.
- [mesuré] advisor-defi 2026-09-18 (Bash vérification seule, fixture `7c33027a…`) : 616/63 ; semestres ; glissant-90 max 0,3000 (2025-04-30) ;
  CUSUM 9,5446 / 25,0809 ; table e-SR par p₀ ; Beta(61, 553) quantiles ; 336 calmes / 365 j.

## Amendement 2026-09-18 (soir) — items (d) et (d′) tranchés par l'investisseur, sous avis advisor-defi (accord avec réserve)
- **(d) — un seul déclencheur** de l'ADR de dérive : le critère pré-enregistré `rolling90_calm_miss ≥ 0,40` (ADR-M012 D6, phrase D8 au singulier).
  L'e-détecteur n'est pas un second déclencheur ; l'union (chemin 2, D2) est écartée. Honnêteté : les deux rôles sont publiés côte à côte,
  avec la phrase « rolling90 carries no false-alarm control » sur les mêmes surfaces que la phrase D3 ; le « ≈ 2,5 % par fenêtre » reste [abs]
  binomial, par fenêtre de 90 paires, jamais converti en « par an » sans simulation.
- **(d′) — aucune doctrine de décision, mais une règle de REPORTING pré-enregistrée** (réserve de l'advisor : sans elle, la lecture « e-SR non
  franchi ⇒ phase connue » serait une citation sélective, alors que le non-franchissement est le cas *attendu* — délai ≈ 394 paires vs ≈ 70 j pour
  rolling90). Tout ADR de dérive ouvert par rolling90 cite obligatoirement : (i) log M_SR **à la paire qui a fait tirer rolling90** et son max sur le
  segment, le nombre de paires calmes du segment, le seuil log(1/alpha_arl) = 6,908 ; (ii) la phrase figée « a crossing is a controlled signal
  (bound, Thm 2.4); a non-crossing is not evidence of absence (no delay bound off i.i.d.) » ; (iii) le segment e-SR n'est ni remis à zéro ni
  re-paramétré dans l'ADR qui le lit (reset après décision, D1) ; (iv) l'ensemble des issues est énuméré d'avance {phase connue ; recalibration ;
  indéterminé/attente}, choix libre parmi elles. Le lecteur sait d'avance ce qu'il verra, pas ce qui sera décidé.
- **Vocabulaire dans tout ADR de dérive** : « bound on the average run length », jamais « guarantee » ; `alpha_arl`, jamais « α » ; « at least
  1/alpha_arl = 1000 calm pairs between false alarms », jamais « false-alarm probability » sans horizon H ; « threshold crossed at calm pair n of
  segment k », jamais « drift detected » ; unités en paires calmes, jamais en jours ; « e-process / e-detector », jamais « p-value » ; « design check,
  no bound » conservé pour le 4,38 in-sample.
- **Bascule** : si un franchissement devait un jour déclencher une action automatique, D2 tombe et le contrôle PFA (Rem. 2.7) devient obligatoire.
- Rectificatif de renvoi : les « chemins 1/2 » sont portés par D2 de cet ADR, pas par `AVIS-advisor-defi-2e-cle-c-prime.md`.
