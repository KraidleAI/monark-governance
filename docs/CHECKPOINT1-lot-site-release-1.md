# CHECKPOINT-1 SITE-RELEASE-1 (validateur-humain, 2026-09-22, persisté verbatim par l'orchestrateur)

Modèle résolu : claude-fable-5-1

# CHECKPOINT-1 — lot SITE-RELEASE-1 (sous-lots A Narabi + favicons / B page `/ukemi`)

## 1. Checkpoint et artefacts lus (contexte frais : artefacts seuls, jamais le fil du planificateur)

- `F:\Monark\docs\G0-lot-site-release-1.DRAFT.md`, `F:\Monark\docs\G0-lot-site-release-1.MESURES.md` (HEAD `a56e739`, arbre propre : `git status --short` = 0 ligne).
- `F:\Monark\docs\CHANTIERS.md` l.680-690 (rulings Q-1..Q-8, couture A/B) ; l.116 (décision 51) ; l.646-657 (126, 127).
- `F:\Monark\apps\site\lib\fleet.ts` (`FleetStatus = "built" | "upcoming"`, l.24 ; entrée Ukemi l.153-166), `apps\site\lib\narabi-live.ts` (`SERIES_MIN_STEPS = 7` l.36, `D8_SENTENCE` l.438), `apps\site\lib\narabi-copy.ts` (GATE.body l.61 porte « 613 » dans une constante `.ts`), `apps\site\lib\narabi-snapshot.ts` (parsé), `apps\site\components\narabi\narabi-live.tsx` (`"use client"` l.1, `{WHY_SEVEN}` l.131), `apps\site\test\honesty-lint.ts` (portée l.1-25, `exemptValues` l.349), `apps\site\test\honesty-lint.exempt.json`, `test\site-honesty.test.ts`, `test\site-build-fleet.test.ts` l.160-183, `test\ci-gates.test.ts` l.1146-1185, `test\narabi-live.test.ts` l.96-123, `scripts\assert-fleet-html.mjs`, `.github\workflows\ci.yml` l.65 et l.152-176, `apps\harness\src\tools\gate.ts` l.125-170 et l.632-648, `apps\harness\test\gate-liq.test.ts` l.169-184, `docs\G7-lot-u4b-2a.md` §4, `docs\CONSIGNE-STANDARD-G1.md` (D-1, D-3, F-1, F-2, A-7..A-9), `docs\CARTOGRAPHIE-TEMPS-1-BASELINE.md` l.20, `docs\G1-lot-fsite-10.md` l.55-70.
- `F:\PRODUITS\etude-2026-09-21\maquettes-release\NOTE-maquettes-v4.md` (le G0 la situe dans `v4\` ; elle est un niveau au-dessus — détail de chemin, sans conséquence).

Rejeu propre (AM-2 ter) : une seule écriture, un script de mesure dans le scratchpad de session `F:\tmp\claude\F--Monark\7a32969b-…\scratchpad\measure-t.mjs` (échec de syntaxe, remplacé par un `node --input-type=module` sans fichier) — déviation déclarée : le chemin prescrit était `F:\tmp\cp1-site-release-1\`. Aucun octet dans le dépôt, aucun `git`, `git status` = inchangé (0 ligne avant et après).

## 2. Faits mesurés par moi (pas lus dans le plan)

- M-V1 : `honesty-lint.ts` l.13-16 : « EVERYTHING ELSE is ignored: … object-literal properties, variable initialisers ». Une constante chaîne portant des chiffres dans un `.ts`, rendue par identifiant `{X}`, n'est PAS vue par test 44 (b). Preuve vivante : `narabi-copy.ts:61` expédie « calibrated on 613 calm pairs » et test 44 est vert. Conséquence : test 44 ne garantit PAS « aucun chiffre non committé rendu sur `/ukemi` » ; seul un scan du body rendu le garantit.
- M-V2 : snapshot committé (`NARABI_SNAPSHOT`, `capturedAt 2026-09-19`) : `tracker.t = 1`, `timelineJsonl` = 2 lignes (`2026-09-17 non_evaluable`, `2026-09-18 evaluable`). Donc « day N » avec N = `t` est déjà FAUX sur les données committées (jour 2 de publication, pas 1 de tracker) ; `narabi-live.ts:274` le dit : « The tracker only steps on evaluable pairs ».
- M-V3 : `SERIES_MIN_STEPS = 7` existe déjà (`narabi-live.ts:36`) ; `WINDOW_BEFORE_FIRST_READING` du G0 serait un doublon.
- M-V4 : `gate.ts:145` `LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100"` est interpolé dans `GATE_TOOL_DESCRIPTION` (l.191) — texte servi — et ABSENT des 4 constantes de `ukemi-copy.ts` (§3.1) sans que l'omission soit déclarée.
- M-V5 : `honestyText` (l.646-648) sert `LIQ_EMPTY_REGISTRY_SENTENCE` au temps 1 ; `gate-liq.test.ts:178-184` (`u4b_liq_class_text_says_upper_bound_never_interval`) asserte déjà `!honestyText(...).includes("interval")` — le mutant A-9 côté `honestyText` a déjà son test ; il reste à le REJOUER.
- M-V6 : `exemptValues()` (`honesty-lint.ts:349`) = `Set` des valeurs seules ; le champ `context` est documentaire ; la garde C-6 vérifie l'existence d'un porteur, pas son emplacement. La phrase du G0 §7 « bornée par `context` … non réutilisable » est inexacte (sans effet sur la contrainte retenue, plus stricte).
- M-V7 : `assert-fleet-html.mjs` : `renderedBody()` renvoie du HTML débarrassé des scripts (balises conservées) ; `assertFleetBody` ne fait ni scan de chiffres ni test de `under_calib`. Ligne `run: node scripts/assert-fleet-html.mjs` épinglée par `site-build-fleet.test.ts:167` et `derived_workflow_run_paths_are_exported` cite ce chemin.
- M-V8 : `\bBell\b` sur `apps/site` (`.ts/.tsx/.mdx`, hors `.next`) = 0 fichier. Décision 117 lue à `CARTOGRAPHIE-TEMPS-1-BASELINE.md:20`.
- M-V9 : `fleet.ts` entrée Ukemi : `line: "Liquidation-cascade survival."`, `wiring.note` contient « cascade seam » — si `/ukemi` rend autre chose que `status`, l'assertion `\bcascade\b = 0` sur le body rougit.
- M-V10 : incohérence interne du plan : §3.4 recommande la voie (i) (étendre `assert-fleet-html.mjs`, ligne `run:` inchangée) ; §9 (table R-25 : `scripts/assert-site-pages.mjs` + `.d.mts` + `ci.yml` ~5 + `site-build-fleet.test.ts`), §11 (« `node scripts/assert-site-pages.mjs` (O-2) ») et §13 supposent la voie (ii).

## 3. Checklist (CA-1..CA-11)

| Règle | État | Preuve |
|---|---|---|
| CA-1 falsifiabilité (une phrase par tâche) | **correction** | Reformulable : A = « pilule N lue du snapshot + glossaire + favicons par route » ; B = « route statique `/ukemi`, copie byte-identique à `gate.ts`, état `under_calib`, body asserté ». Mais deux critères ne sont pas falsifiables tels qu'écrits : (i) « aucun chiffre non committé rendu » n'a pas de test qui le tue (M-V1) ; (ii) « day N » n'a pas de sémantique (M-V2). → C-1, C-3. |
| CA-2 décisions de valeur | **conforme** | Les 8 questions fermées sont tranchées par rulings datés ; aucune valeur nouvelle : « shipped »→« built » (Q-8) et T≥7 (Q-4) découlent du registre gelé (l.24) et de la décision 51, de rang supérieur à un libellé de maquette. À signaler à l'investisseur comme information (écart à la maquette validée), pas escalade. |
| CA-3 ADR / gates | **correction** | Pas d'ADR encore (normal au G0) ; F-1 exige une ligne « Tuyaux » PAR sous-lot (A et B ont chacun leur fusion). → C-8. Aucun gate suspendu ; Q-6(b) laisse `g3-site` « blocking conditional » : état préexistant, compensé par le rejeu local G2/checkpoint-2. |
| CA-4 fan-out | **conforme** | §2 : mono-worker G1 + oracle déterministe ; relecteur G2 et checkpoint-2 justifiés par l'indépendance de vérification, jamais le débit. |
| CA-5 MAST | **conforme** | §14 nomme FM-1.1, 1.3, 2.2, 3.1, 3.2, 3.3 avec contre-mesures. FM-3.3 (vérification incorrecte) reçoit ici une occurrence de plus : test 44 comme faux garant de `/ukemi` (M-V1). |
| CA-6 oracle + G2 | n-a (checkpoint-1) | Cadré §13 : oracle complet + build + assertion body ; G2 séparé. |
| CA-7 zéro dette | **conforme** | §15 : items formés avec déclencheur (Q-5(a) → U-4b-2b ; re-câblage/cascade → U-4b-2b/U-5b) ; fait daté Blast/Llama du snapshot 2026-09-19 antérieur à D-106. Aucun « dû » nu. |
| CA-8 provenance | **conforme** | G0 : modèle résolu `claude-opus-4-8` en 1ʳᵉ ligne, base `58e4d13`, chaque chiffre avec sa commande (MESURES). |
| CA-9 vérification imposée par le système | **conforme** (à tenir) | `g3-site` = build + assertion sur l'artefact rendu (jamais un grep sur le source). Le checkpoint-2 rejouera lui-même `npm run build -w @monark/site` + `node scripts/assert-fleet-html.mjs` sous `F:\tmp\cp2-site-release-1\`. |
| CA-10 anti-vitesse | **conforme** | R-25 estimé 760–1 020 < 1 150 ; couture A/B pré-déclarée ; aucun argument de vitesse. Voir C-4 pour la cohérence de l'estimation. |
| CA-11 branchement (+ durci) | **correction** | `/ukemi` : tuyau entrée (`gate.ts` → `ukemi-copy.ts` → body) exécuté par `next build` + assertion sur `ukemi.html` = composition depuis l'artefact réel — CONFORME si C-1 est faite. Pilule Narabi : composant client ⇒ N absent du HTML de build (§4, exact) ; preuve = fonction pure alimentée par les octets réels du snapshot (artefact d'entrée réel : accepté) + porteur dans le `.tsx` (grep sur source : NE prouve PAS l'exécution) ⇒ résiduel à NOMMER (C-7). Registre : aucun statut ne bascule (Ukemi déjà `built`, décision 51/123 ; borne haute `built` en -2b, `G7-lot-u4b-2a.md` §4 l.21) — cohérent. |

## 4. Réponses aux sept questions fermées

1. **Honnêteté `/ukemi` au temps 1 — NON garanti par le plan tel qu'écrit.** Test 44 (b) ignore les initialiseurs de variables (M-V1) : un worker peut mettre « 185 of 189 » dans `ukemi-copy.ts`, rendre `{X}`, et test 44 reste vert. La liste `assertUkemiBody()` (§3.3) ne porte ni scan de chiffres ni présence de `under_calib`. → C-1 (bloquante).
2. **Byte-identité et A-9 — OUI pour 4 constantes, omission non déclarée de la 5ᵉ.** `LIQ_UPPER_BOUND_SENTENCE`, `LIQ_H3_SENTENCE`, `LIQ_CONDITIONAL_SENTENCE` (« which the gate does not check », `gate.ts:156-158`, vérifié), `LIQ_EMPTY_REGISTRY_SENTENCE` : test d'égalité par lecture des deux sources, faisable (les tests racine importent déjà `apps/harness/src/tools/gate.ts`, `h5-e2e-probe.test.ts:32`). `LIQ_REQUIREMENTS_SENTENCE` (chiffres) est servie dans la description et omise sans le dire → C-2. Mutant A-9 sur `honestyText` : déjà porté par `gate-liq.test.ts:178` ; à REJOUER au G1 et à consigner, avec les mutants côté site (injection dans chaque constante `ukemi-copy.ts` ⇒ égalité + never-interval + body rouges).
3. **Pilule Narabi — d'accord sur « built ».** `FleetStatus` gelé l.24 (« No "live" exists »), décision 51 verbatim, `fleet_register_built_set_is_frozen` : un mot de statut sur une surface publique suit le registre, un libellé de maquette cède. N lu du snapshot : preuve par fonction pure alimentée par `NARABI_SNAPSHOT.stateJson` — d'accord, avec résiduel nommé (C-7). Bascule T ≥ 7 : d'accord, mais N = `t` étiqueté « day » est déjà faux sur les données committées (M-V2) et le « 7 » doit dériver de `SERIES_MIN_STEPS` (M-V3) → C-3, C-5.
4. **Tuyaux et chemin servi — vérifié.** Aucune pièce servie ne bouge (`fleet.ts` gelé, pas de bump, pas d'outil) ⇒ skill/MCP/README hors lot (127) : exact. `g3-site` est bien la composition non-LLM exécutée depuis l'artefact réel pour `/ukemi` (sous C-1). Point à écrire : `/ukemi` ne lit QUE `status` dans `FLEET_AGENTS` (M-V9) → C-6.
5. **Couture A/B et R-25 — correction de cohérence.** L'estimation §9 compte des fichiers de la voie (ii) que §3.4 écarte (M-V10) ; `app/ukemi/icon.svg` est rangé en A alors que la route `/ukemi` naît en B → C-4, C-9. Avec la voie (i), la couture tient sous 1 150 avec marge ; R-25 mesuré par sous-lot au G1 (pathspec verbatim `ci.yml:65`, vérifié).
6. **Bell absent — vérifié** : 0 fichier `apps/site` (M-V8) ; décision 117 lue ; contrôle G1 `\bBell\b = 0` sur les trois bodies rendus, conservé.
7. **CA-1..CA-11** : table §3.

## 5. Décision : **APPROUVE-AVEC-CORRECTIONS** (liste fermée, à plier avant le G1 du sous-lot concerné)

Bloquantes :
- **C-1 (B, CA-1/CA-11 durci)** — `assertUkemiBody()` ajoute : (a) un scan de jetons numériques sur le TEXTE rendu de `/ukemi` (nœuds texte après retrait des balises + attributs visibles alt/title/aria-label), mêmes exclusions que `honesty-lint` (dates ISO, `ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+`), 0 attendu — le scan ne porte pas sur `className`/`style`/`viewBox` (barre schématique, marques inline), à écrire dans le script ; (b) `LIQ_EMPTY_REGISTRY_SENTENCE` présente byte-identique dans le body (l'état `under_calib` de Q-5(a)/Q-7(a)) ; (c) `interval`/`\bcascade\b`/`\bBell\b`/`\bAave\b` = 0 et clause « which the gate does not check » présente (déjà prévu). Chaînes attendues importées dynamiquement depuis `ukemi-copy.ts` (comme `main()` importe `fleet.ts`), jamais depuis `gate.ts` (dépendances harness). Mutants nommés : un chiffre injecté dans une constante `ukemi-copy.ts` rendue ⇒ rouge ; `LIQ_EMPTY_REGISTRY_SENTENCE` retirée du rendu ⇒ rouge.
- **C-2 (B)** — déclarer dans l'ADR le jeu FERMÉ des constantes portées (4) et l'omission de `LIQ_REQUIREMENTS_SENTENCE` avec son motif (chiffres, Q-5(a)) ; le test d'égalité nomme ce jeu.
- **C-3 (A, CA-1)** — sémantique de N : « day N » ≠ `tracker.t` (M-V2). Deux branches pour l'orchestrateur : « step N of 7 before first reading » (cohérent avec `WHY_SEVEN` « seven daily steps ») OU « day » défini dans l'ADR comme « N-ième pas évaluable » avec un test sur un état où fenêtres publiées > `t`. Pour Q-4(a), définir N de « N windows published » (lignes de timeline ou `t`). Tests aux bornes t = 6 (encore « of 7 ») et t = 7 (bascule), chacun avec mutant. Écart de libellé à la maquette validée (« shipped », et « day » si changé) à rapporter à l'investisseur comme information.
- **C-4 (plan)** — trancher la voie (i) (recommandée §3.4, conforme au brief) et réaligner §9, §11, §13 : pas de `assert-site-pages.mjs`, pas d'étape `ci.yml`, `.d.mts` jumeau de `assert-fleet-html.mjs` mis à jour pour toute nouvelle exportation.
- **C-5 (A)** — pas de `WINDOW_BEFORE_FIRST_READING` : le libellé dérive de `SERIES_MIN_STEPS` (source unique, M-V3).
- **C-6 (B)** — écrire que `/ukemi` lit UNIQUEMENT `status` de l'entrée Ukemi de `FLEET_AGENTS` (jamais `line` ni `wiring.note`, qui portent « cascade », M-V9) ; un rendu de ces champs rougit C-1(c) et ne se répare jamais par une édition de `fleet.ts` (gelé).

Non bloquantes (à porter au G1) :
- **C-7 (A, CA-11)** — nommer le résiduel : composant client ⇒ la composition DOM de la pilule n'est pas exécutée par un test non-LLM ; plancher accepté = fonction pure sur les octets réels du snapshot + porteur asserté + parcours visuel investisseur (décision 101). Option à évaluer sans obligation : amorcer l'état initial du composant depuis le snapshot committé, ce qui ferait rendre la pilule dans `narabi.html` au build et l'assertion O-2 pourrait l'exécuter.
- **C-8 (A et B)** — une ligne « Tuyaux » par sous-lot dans chaque ADR (F-1), pas seulement le §10 de lot.
- **C-9 (couture)** — `app/ukemi/icon.svg` passe en B (aucune route `/ukemi` en A) ; G1 vérifie dans le `<head>` bâti de `/narabi` et `/ukemi` le `<link rel="icon">` par route.
- **C-10 (plan)** — corriger §7 : l'exemption 01-04 n'est pas bornée par `context` (M-V6) ; la contrainte retenue (accès propriété depuis `ukemi-copy.ts`) reste et est plus stricte.
- **C-11 (B)** — `ukemi-copy.ts` = données pures (aucun import React/Next, régime PORTABILITY de `fleet.ts`) pour être importable par le programme de tests racine ; `metadata` title/description de `/ukemi` sans chiffre (règle (5) du lint) ; entrée de glossaire `under_calib` finalisée générique (le brouillon dit « in the stratum », vocabulaire Ukemi sur la page Narabi).

Pas d'ESCALADE : rulings et checklist convergent ; aucune valeur nouvelle ; la seule information due à l'investisseur est l'écart de libellé à la maquette validée (C-3).

AM-1 (ligne d'apprentissage) : la checklist a attrapé (i) test 44 pris pour garant d'une page qu'il ne couvre pas (constantes `.ts` rendues par identifiant), (ii) « day N » déjà faux sur le snapshot committé (2 fenêtres, t = 1), (iii) le doublon de `SERIES_MIN_STEPS` et l'incohérence voie (i)/(ii) du plan. Manqués : à signaler par l'orchestrateur a posteriori.

Modèle résolu : claude-fable-5-1
