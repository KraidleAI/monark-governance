# Checkpoint 1 — Phase 2 MONARK (ADR-M003) : avis du validateur-humain et traitement

- **Date** : 2026-09-05. **Artefact soumis** : `docs/adr/ADR-M003-phase2-integration.md` (md5 `ae93ed7b` à la soumission ; après corrections : voir journal).
- **Validateur** : agent `validateur-humain`, modèle résolu déclaré `claude-fable-5-1`, instance séparée, contexte frais, advisor intégré non appelé.
- **Verdict** : **ACCEPTE-AVEC-CORRECTIONS** (14 items, liste fermée) + **ESCALADE-INVESTISSEUR** sur D10 seul.
- **Persistance** : avis intégral verbatim ci-dessous (§1), traitement orchestrateur (§2).

## 1. Avis intégral (verbatim)

# CHECKPOINT 1 — Acceptation du PLAN Phase 2 MONARK (ADR-M003)

Avis du `validateur-humain`, instance séparée, contexte frais (aucun fil de travail du planificateur lu — artefacts seulement), checklist fermée CA-1..CA-10. Rendu le 2026-09-05. Advisor intégré non appelé (consigne de l'orchestrateur ; cohérent avec le filtre de régurgitation, CLAUDE.md 2026-09-05).

**Limites déclarées** : ni Bash ni Write dans ma session — je n'ai pas pu rejouer `git show --shortstat` (D9) ni recalculer le md5 de la copie `F:\Clawpumptech` ; ces deux points sont traités comme « non vérifiés par le validateur », pas comme conformes.

## 1. Artefacts lus (chemins)

- `F:\Monark\docs\adr\ADR-M003-phase2-integration.md` (artefact soumis, intégral)
- `F:\Monark\docs\adr\ADR-M001-phase0-depot-langage-contrats.md` (Déc. 1-9, l.66-99 Déc. 3, l.166, l.190)
- `F:\Monark\docs\adr\ADR-M002-phase1-moteurs-hikae-ukemi.md` (D0-D13, §4)
- `F:\Monark\docs\G7-phase1.md`, `F:\Monark\docs\CHECKPOINT2-phase1.md`, `F:\Monark\docs\JOURNAL-PROVENANCE.md` l.112-151
- `F:\Clawpumptech\ROADMAP-MONARK.md` l.104-127 (§7)
- `F:\Clawpumptech\procurements-lectures\P-K4-1-rogers2013.md`, `P-HIKAE-3-tibshirani2019.md`, `P-K1-1-qin2021.md`
- `F:\Shogen\crates\shogen-core\src\verification.rs` l.60-160 (`Constat` l.81-120, `Verdict` l.124-135) ; `temoignage_canonique.rs` (struct `Temoignage` l.123-137) ; `F:\Shogen\crates\shogen-verifier\src\main.rs` l.225-348 ; `F:\Shogen\crates\shogen-verifier\tests\fixtures\PROVENANCE.md` ; `F:\Shogen\docs\adr-0023\ADR-0023.md` l.28
- `F:\Monark\schemas\attested-price.schema.json` ; `F:\Monark\packages\contracts\src\enums.ts` l.16-20 ; `F:\Monark\packages\monark\src\index.ts` ; `F:\Monark\packages\hikae\src\l3-gate.ts` l.59-66 ; `F:\Monark\fixtures\*` ; `F:\Monark\packages\hikae\docs\S2-*`
- `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\templates\ci-gates.yml` l.1-60 ; `docs\02-referentiel-gates-et-regles.md` l.42, 114, 135

## 2. Checklist

**CA-1 (critères falsifiables, reformulation une phrase par tâche)** — **correction**.
Reformulation : V = « la CI bloquante du corpus tourne à distance sur un remote créé par l'investisseur, premier push signé » (test 38, CA-V) ; S = « un snapshot Coinbase daté et haché rejoue à l'octet près » (32-33) ; I = « un couple réel (Temoignage, Verdict) de Shōgen devient un `AttestedPrice` valide puis une `GateDecision` valide » (29-31) ; P = « après recherche R-P1, un client UsePod sans réseau sous test » (39) ; K = « conformeur interval, classe 24 h synthétique, (α,β) Rogers-Veraart avec non-régression E&N » (34-37) ; W = « l'atelier existant servi statiquement, 0 secret » (40). Cinq lots se reformulent. Le Lot I **ne se reformule pas sans trous** — trois faits d'artefact le rendent mal posé :
- D3 l.53 émet `ABSTAIN{reason:"upstream-schema-mismatch"}` : ce littéral **n'existe pas** dans l'enum gelé (`enums.ts:16-20` = `upstream_timeout, attestation_absent, attestation_refused, binding_broken, non_evaluable`) ; la « fixture 07 » citée est `07-abstain-upstream-timeout`, pas un schema-mismatch. D3 contredit D2 (l.49, « jamais silencieux ») dans le même ADR.
- D3 l.52 signe `fromShogen(temoignage: json, verdict: json)` : Shōgen n'émet **aucun JSON** — 0 occurrence de `serde`/`Serialize` dans `F:\Shogen\crates`, le lot réel est du CBOR canonique (`s3-binance.lot.cbor`, 7399 octets), et le vérificateur **imprime de la prose** (`main.rs:326-348` : résidus joints par « , », révision amont dans une phrase). Qui produit les deux JSON, et comment ils sont liés aux octets réels, n'est pas dit ; sans cela le test 29 valide une transcription, pas Shōgen.
- Lot I dépend d'un « témoignage Shōgen réel BTC-USD » (l.41) et D3 l.54 conditionne le label à « la campagne Shōgen couvre BTC-USD ». Le seul témoignage attesté réel existant est **`s3-binance`** : subject Binance **`BTCUSDT`** (USDT, pas USD), notaire = **Shōgen lui-même** — « démonstratif, pas probant » (PROVENANCE.md §4). La campagne S2 Shōgen (`s2-harness`, Python) mesure des sources de prix ; elle ne produit pas de témoignages TLSN Coinbase. La condition de D3 l.54 est donc **fausse au 2026-09-05** et l'ADR ne le dit pas.
- D4 l.57 : `(price, prediction) → GateDecision` ne dit pas d'où viennent l'état de calibration (scores, n_calib, q̂) ni B_t ; un test 30 « bout en bout » n'est pas spécifiable sans ce contexte.
- Test 34 (l.90) « couverture ≥ 1−α sur n=300 seedé » : à α=0,01, la couverture empirique d'un seul tirage est une variable aléatoire (miscover attendu 3 ; ≥ 4 non rare) — un vert obtenu par choix de graine est exactement le mode d'échec HULA (« tests passés » ≠ propriété).

**CA-2 (décisions de valeur non déléguées)** — **correction + escalade**.
Deux décisions de valeur sont déléguées à un lot : (a) D1 Lot S l.40, repli « snapshot Kraken » — la décision investisseur (a) du 2026-09-04 nomme **Coinbase Exchange** ; changer de source de label est une décision investisseur, pas un repli automatique ; (b) D8 l.74 / Lot V l.39, hébergement public « pages GitHub ou équivalent décidé en Lot V » — c'est un compte/plateforme, action réservée par D0.3 même. D10 (roster) : voir §3, escalade.

**CA-3 (ADR de rattachement, gates non suspendus)** — **conforme**. ADR présent, rattaché M001/M002/G7/CP2 ; aucun gate suspendu (D0.2, D2, D9 R-23, D11 mutants). Correction de forme : D3 doit se plier à D2 (point CA-1).

**CA-4 (fan-out justifié par indépendance/isolation, jamais par débit)** — **correction**. D1 l.46 ordonne « S ∥ K » sans une phrase de justification (M002 D1 en avait une). L'isolation est réelle (`packages/ukemi/**` vs snapshot/harnais S2, chemins disjoints) — il faut l'écrire ; les autres lots sont séquentiels = mono-agent + oracle, à dire aussi.

**CA-5 (modes MAST + contre-mesure)** — **correction**. D12 l.101 nomme cinq modes en prose ; « pression de délai » n'a **aucune contre-mesure nommée** (M002 D13 en avait : R-22, R-25, aucune publication avant checkpoint 2) ; « collision Hermes » a une convention (pré-vérif 4) mais aucune contre-mesure imposée par le système (un motif dans `vocab-banned.json` la rendrait falsifiable). Table mode → contre-mesure, comme M002 D13.

**CA-6 (oracle ET revue)** — **n/a** au checkpoint 1 ; noté pour le checkpoint 2 : D11 + « chaque test tué par ≥ 1 mutant » est la bonne forme.

**CA-7 (zéro dette nue)** — **conforme avec une correction**. §4 forme tout (investisseur, R-P1, P-HIKAE-1, procurements, Phase 2b). Un « dû » implicite subsiste : le pendant **(i)** (dépôt + clé de signature) porte le **chemin critique entier** (D0.1) et n'a **aucune date**, alors que (g) et (h) en ont une (≤ 2026-09-10) et que CA-W exige une vitrine avant le 2026-09-20 ; sans date, le chemin critique n'a pas de déclencheur, et le repli « rien de public » n'est pas écrit.

**CA-8 (provenance, R-1, générateur ≠ relecteur, error_origin)** — **conforme** sur le plan (Gate-0 au premier worker l.46 ; `error_origin` au G7 §3 Global) ; la ligne D10 « modèle résolu » n'est requise qu'en cas de déviation — voir escalade.

**CA-9 (vérification imposée par le système)** — **correction**. M003 ne reconduit pas explicitement M002 D12 (relecteur G2 = instance séparée, contexte frais, ≠ générateur, mutants re-exécutés) ; D10 ne le dit que pour le cas de déviation. Une phrase de reconduction, sinon la revue Phase 2 est réputée non spécifiée.

**CA-10 (aucun argument de vitesse, lots petits)** — **conforme, non vérifié sur le chiffre**. Aucun argument de vitesse dans l'ADR ; DORA pp. 39-40 est bien cité comme [lu] primaire dans doc 02 l.114/135 (pas un chiffre de seconde main). Sur D9 (point 1 de l'orchestrateur) : (a) je **n'ai pas pu re-mesurer** 5131/1205/826 ; (b) le **chemin d'exclusion est faux** : les artefacts S2 sont sous `packages/hikae/docs/S2-*` (Glob), pas `docs/S2-*` — l'exclusion telle qu'écrite serait inopérante et le lot H de Phase 2 rougirait pour la raison même que D9 veut neutraliser ; le template (`ci-gates.yml:34`) n'exclut que les lockfiles, l'exclusion supplémentaire doit être un pathspec `':(exclude)packages/*/docs/S2-*'` commis dans le workflow ; (c) une borne = médiane bloque par construction environ la moitié des lots passés — c'est un resserrement délibéré, à écrire comme tel.

**Points signalés par l'orchestrateur** : (1) D9 — non re-mesuré (pas de Bash), chemin d'exclusion faux, voir item 7 ; (2) D10 — oui, escalade, voir §3 ; (3) D3 — aucun champ **inventé** dans `AttestedPrice` (les 9 requis + `sens_emis_digest` optionnel existent, schéma l.8-18, 63), mais **une provenance mal attribuée** (`empreinte_du_sens_emis` vit dans `Constat`, `verification.rs:81-119`, pas dans `Temoignage` ni `Verdict` — « composition de deux types » est faux pour ce champ) et **un littéral `reason` inventé** (voir CA-1) ; (4) D6.2 — clair **dans l'ADR** ; pas encore **imposé au fil** : l'identifiant `ukemi-liquidable-24h` sur le fil et à l'écran ne porte pas « synthétique » — la ligne D10 (M002 D0) doit être exigée sur tout rapport/panneau de cette classe ; (5) chemin critique — replis nommés pour S/I/P/W ; **(i) sans date**, repli V non écrit, repli Kraken = décision investisseur (voir CA-2, CA-7).

## 3. Décision : ACCEPTE-AVEC-CORRECTIONS (14 items, liste fermée) + ESCALADE-INVESTISSEUR sur D10 seul

Le plan n'est pas mal posé dans son ensemble : cinq lots sur six se reformulent et se falsifient ; le Lot I est mal posé sur ses entrées et se corrige par ADR sans changer de périmètre. D10 est carved-out : il ne bloque pas le démarrage des lots.

**Corrections (chaque item : ligne de l'ADR visée → ce qui est attendu)**

1. **D3 l.53** — remplacer `"upstream-schema-mismatch"` par un mappage sur les littéraux gelés (`enums.ts:16-20`) : verdict absent → `attestation_absent` ; `Err(ErreurVerification)` → `attestation_refused` ; champ manquant / forme non conforme au schéma → `binding_broken` (ou `attestation_refused`, mais **un seul**, écrit) ; retirer « fixture 07 » ; test 31 (l.87) aligné sur le littéral choisi.
2. **D3 l.52 et §1.3 l.23** — `sens_emis_digest` : déclarer sa source réelle (`Constat.empreinte_du_sens_emis`, `verification.rs:119`) — soit `fromShogen(temoignage, verdict, constat?)`, soit champ omis en Phase 2 et dit ; corriger « composition de deux types existants ».
3. **D3 l.52** — dire **qui produit** les deux entrées et comment elles sont liées aux octets réels : (a) décodeur du sous-ensemble CBOR canonique en TS dans le Lot I (code nôtre, zéro dépendance, testé contre le sha256 du lot `8700d88f…`) + `Verdict` reconstruit depuis la sortie du vérificateur (`main.rs:327-346` : `octets_recalcules`, résidus, révision) avec sha256 de cette sortie commis ; ou (b) transcription = fixture, et alors le test 29 est renommé pour ne pas dire « réel ». Décision + ligne de provenance exigées.
4. **D1 l.41 et D3 l.54** — nommer la fixture réelle disponible (`s3-binance.lot.cbor`, subject Binance `BTCUSDT`, notaire Shōgen = démonstratif, PROVENANCE.md §4) ; écrire que « la campagne Shōgen couvre BTC-USD » est **faux au 2026-09-05** ⇒ label = Coinbase brut (M002 D8) en Phase 2, sauf session TLSN Coinbase nouvelle = travail Shōgen hors M003 (pendant formé si voulu) ; la ligne D10 de tout rapport/vitrine portant ce témoignage dit « réel, notaire Shōgen, démonstratif ». Nommer aussi l'adaptateur **octets → prix** (utterance.bytes ⇒ nombre) que le label par `AttestedPrice` exige (M001 Déc. 3 : le nombre n'est pas porté) — pendant ou D3.
5. **D4 l.57** — nommer l'origine de l'état de calibration et de B_t (paramètre `GateContext{…}` ou état de module) ; préciser que la signature du stub (`index.ts:12`) n'est pas l'un des quatre contrats gelés, donc qu'un contexte ajouté n'est pas un bump — et le dire.
6. **D6.2 l.66 et D11 test 34 l.90** — oracle précisé : (a) quantile et région vérifiés exactement (déterministe) ; (b) couverture **moyenne sur R répétitions seedées** (R déclaré) ≥ 1−α − tolérance déclarée ; mutant nommé (q̂ décalé d'un rang) rouge. Exiger la ligne D10 « synthétique » sur tout rapport/panneau de la classe `ukemi-liquidable-24h`.
7. **D9 l.77** — coller la sortie brute des trois `git show --shortstat` dans l'ADR ou le journal (rejouable par quiconque) ; corriger le chemin d'exclusion en `':(exclude)packages/*/docs/S2-*'` dans le workflow commis ; écrire que borne = médiane est un resserrement délibéré.
8. **D1 l.40** — repli Kraken : nommé, mais **activation = décision investisseur** (une ligne au §4, rattachée à (a)), jamais automatique.
9. **D8 l.74 et D1 l.39** — hébergement public de la vitrine : décision investisseur rattachée à (i), pas « décidé en Lot V ».
10. **D1 l.46** — une phrase : « S ∥ K justifié par l'isolation (chemins disjoints, aucune dépendance) ; V, I, P, W séquentiels = mono-agent + oracle ; aucun fan-out par débit ».
11. **D12 l.101** — table mode → contre-mesure imposée par le système, avec au minimum : pression de délai (R-22, R-25 via `VIBEGATES_PR_LIMIT`, aucune publication avant checkpoint 2) ; collision Hermes (motif `\bHermes\b` nu interdit hors `pyth-hermes|clawpump-hermes` dans `vocab-banned.json`, parcours étendu à `packages/monark/**`) ; générateur = vérificateur (dépend de l'escalade D10).
12. **Nouvelle ligne (D10 ou D12)** — reconduction explicite de M002 D12 : relecteurs G2 = instances séparées, contexte frais, ≠ générateur, mutants re-exécutés ; s'applique à tous les lots, déviation ou non.
13. **D5 l.60** — R-P1 tranche la collision de nom résiduelle : M001 D2 dit « Grok Hermes = Nous Research Hermes (runtime) », M003 dit « harnais Hermes/claw-agent ClawPump » — même objet ? Le nom `clawpump-hermes` ne se fige qu'après.
14. **§4 l.113 et D1 l.39** — dater (i) (dépôt distant + clé de signature ; proposition ≤ 2026-09-10, comme (g)/(h)) et écrire le repli de V : sans (i), aucun remote, aucune vitrine, déclaré — jamais un push non signé.

**Ce qui bloque quoi** : items 7, 10, 11, 12, 14 avant le Lot V (premier lot) ; item 6 avant le Lot K ; item 8 avant le Lot S ; items 1-5 avant le Lot I ; item 13 avant le Lot P ; item 9 avant le Lot W. Quick-verify du diff ADR par le validateur après intégration, copie ≡ source (md5 cité par l'orchestrateur — je ne le recalcule pas).

**ESCALADE-INVESTISSEUR — D10 (l.79-80), question précise à poser**
D10 transforme une déviation consignée (journal l.145 : Lots H et U et 10 corrections écrits par `claude-fable-5-1` après 4 morts de workers) en **règle de roster** — domaine mainteneur (CLAUDE.md global : « workers Opus 4.8 épinglés » ; frontière d'escalade : « changement de roster de modèles »). Le risque que l'investisseur doit peser, en clair : l'orchestrateur devient **générateur ET auteur du verdict G7**, et le validateur (moi) est de la même famille de modèles (Fable/Fable) — la seule vérification indépendante restante est la relecture G2 delta Opus 4.8. Question : « Pour MONARK Phase 2, acceptez-vous que l'orchestrateur Fable 5.1 écrive du code en siège worker quand le worker Opus 4.8 d'un lot meurt deux fois sur limite d'usage, à condition d'une relecture G2 delta Opus 4.8 avant G7 et d'une ligne de journal R-1 ? Options : (a) oui, D10 tel quel ; (b) non — attendre/relancer, jamais Fable en siège worker ; (c) oui, limité aux corrections G2 (pas aux modules), avec un plafond de lignes déclaré. » **Tant que non tranché** : D10 n'est pas en vigueur ; toute nouvelle déviation est consignée au cas par cas et remontée, pas appliquée par règle. Aucun lot n'est bloqué par cette escalade.

**Ligne AM-1** — attrapé : littéral `reason` hors enum gelé (D3 vs D2) ; provenance de `sens_emis_digest` (Constat, pas Temoignage/Verdict) ; absence de toute émission JSON côté Shōgen ; unique témoignage réel = Binance BTCUSDT auto-notarisé, condition BTC-USD fausse ; chemin d'exclusion D9 inopérant (`packages/hikae/docs/S2-*`) ; oracle du test 34 non falsifiable sur une graine ; (i) sans date sur le chemin critique ; deux décisions de valeur déléguées (Kraken, hébergement) ; D10 = roster. Non vérifiable par moi : mesure 5131/1205/826, md5 de la copie.

## 4. Modèle résolu (R-1)

`claude-fable-5-1` (Fable 5.1), effort de session ; instance séparée du planificateur, contexte frais.

## 2. Traitement par l'orchestrateur (2026-09-05)

Vérification indépendante des faits avancés (grep/ls orchestrateur) : enum `COVERAGE_REASONS` = `budget_exhausted, clock_expired, upstream_timeout, attestation_absent, attestation_refused, binding_broken, non_evaluable` (confirmé) ; `empreinte_du_sens_emis` ∈ `Constat` l.119 (confirmé) ; 0 occurrence de `serde` dans `F:\Shogen\crates` (confirmé) ; fixtures `s3-binance.{lot.cbor,constat.json,registre.txt}` + PROVENANCE.md (confirmé, subject `BTCUSDT`) ; artefacts S2 sous `packages/hikae/docs/` (confirmé) ; M001 l.47 « runtime Hermes/`claw-agent` = Python » (confirmé). Mesures D9 : sortie brute collée dans l'ADR D9 (item 7).

| Item | Traitement | Où |
|---|---|---|
| 1 | littéraux gelés : absent → `attestation_absent` ; `Err` → `attestation_refused` ; champ manquant/forme → `binding_broken` ; fixture 07 retirée ; test 31 aligné | D3, D11 |
| 2 | `sens_emis_digest ← Constat.empreinte_du_sens_emis` (`s3-binance.constat.json`) ; « trois types » | D3, §1.3 |
| 3 | option (a) : décodeur CBOR canonique TS (zéro dépendance) + Verdict reconstruit depuis la sortie du vérificateur, sha256 des deux commis ; test 29 nommé en conséquence | D3, D11 |
| 4 | fixture `s3-binance` nommée, BTCUSDT, notaire Shōgen, démonstratif ; « BTC-USD couvert » = faux au 2026-09-05 ; label = Coinbase brut ; adaptateur octets→prix nommé ; pendant TLSN Coinbase | D1, D3, §4 |
| 5 | `GateContext{calib, budget}` ; signature du stub ≠ contrat gelé, pas de bump | D4 |
| 6 | oracle test 34 : quantile exact + couverture moyenne sur R=100 répétitions ≥ 1−α−0.005 ; mutant q̂−1 rang ; ligne D10 « synthétique » exigée | D6.2, D11 |
| 7 | sortie brute `git show --shortstat` collée ; pathspec `':(exclude)packages/*/docs/S2-*'` ; resserrement délibéré | D9 |
| 8 | repli Kraken = décision investisseur (a′) au §4 | D1, §4 |
| 9 | hébergement = décision investisseur rattachée à (i) | D1, D8, §4 |
| 10 | phrase de justification S ∥ K / séquentiel | D1 |
| 11 | table MAST mode → contre-mesure ; motif Hermes nu dans `vocab-banned.json`, parcours `packages/monark/**` | D12 |
| 12 | reconduction M002 D12 (relecteurs séparés, mutants) | D10bis |
| 13 | R-P1 tranche l'identité Hermes (Nous Research runtime vs harnais ClawPump) avant de figer `clawpump-hermes` | D5 |
| 14 | (i) daté ≤ 2026-09-10 ; repli V : sans (i) aucun remote, aucune vitrine, jamais de push non signé | D1, §4 |

**ESCALADE D10** : transmise à l'investisseur telle quelle (question et options (a)/(b)/(c) du validateur). D10 **non en vigueur** tant que non tranché ; toute déviation est consignée au cas par cas.

## 3. Quick-verify (validateur-humain, instance fraîche, 2026-09-05)

Verdict : **CORRECTIONS-INTÉGRÉES sauf 1 item** (13/14 « oui », item 7 « oui, non re-mesuré » ; item 3 **partiel**). Attrapé : le sha256/taille (616 octets, `899898…`) que l'orchestrateur avait attribués à la sortie du vérificateur sont ceux de `s3-binance.registre.txt`, une **entrée** du vérificateur ; aucune fixture de sortie n'existe. Demandé : D3 dit que la sortie (stdout + stderr + code de sortie) sera produite par rejeu au Lot I et commise avec son sha256 à ce moment-là. Non bloquant, consigné pour le checkpoint 2 : test 41 doit nommer l'entrée « octets émis » (non portés par le témoignage) ; bloc D9 non rejouable à l'octet (préfixe de hash ajouté à la main) ; « Hermes » nu dans l'ADR lui-même si le gate couvre `docs/` ; titre D10 à aligner sur l'escalade. D10 « non en vigueur » et escalade confirmés intacts. Copie Clawpumptech identique à la lecture (md5 non recalculé par lui). Modèle résolu déclaré `claude-fable-5-1`.

**Traitement orchestrateur** : item 3 corrigé (D3 : sortie produite au Lot I, registre nommé comme entrée) ; titre D10 aligné (« ESCALADÉ, NON EN VIGUEUR ») ; commande D9 rendue rejouable à l'octet (`echo -n "$c "` ajouté). Reste pour le Lot I : entrée du test 41. ADR final md5 `12d8e26f`, miroir identique.

## 4. Escalade D10 — tranchée par l'investisseur (2026-09-05)

Message investisseur, verbatim : « escalade D10 option A, oui ». **Option (a) : D10 tel quel, en vigueur** pour la Phase 2 MONARK, sous ses trois conditions (deux morts Opus consignées ; relecture G2 delta `claude-opus-4-8` avant G7 ; ligne R-1). Addendum daté ajouté à l'ADR D10 (aucune réécriture d'historique : mention initiale barrée). La règle roster globale du mainteneur n'est pas modifiée.
