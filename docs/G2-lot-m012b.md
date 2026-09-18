# G2 — Revue du Lot M012-b (sentinelle Narabi, ADR-M012)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur, 2026-09-18. Lecture seule ; mutants M1/M4 apply-and-revert
  avec preuve sha (arbre final octet-identique : 7 M + 5 ??, HEAD `ed3d36d`).
- **Cible** : 8 sha conformes au périmètre (`windows b84827ae…`, `rpc 24274a11…`, `flow 976bcb69…`, `timeline 4f55efe5…`, `run d3f70432…`,
  test `1d39ed1a…`, fixture `f4e50948…`, `tracker 1d3677ad…` — en-tête seul, vecteurs épinglés intacts). RUNBOOK hors arbre (M012-c).

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS** (C1 appliqué par le worker ; C2/C3 → M012-c ; RC1 runbook → M012-c)

- **C1 (moyenne, `run.ts:135` + `service:18-19`)** — sans `MONARK_SENTINEL_J0` et état vide, `startDay` chasse « today » à chaque run,
  `dueDays` rend `[]` à 00:30 UTC et la veille n'est jamais reprise ⇒ **no-op silencieux indéfini** ; commentaire de l'unité mesuré faux.
  **Correctif** : `throw` explicite (fail-closed, doctrine ADR-M009 D2) + test `sentinel_fails_closed_without_J0` + commentaires vrais.
- **C2 (mineure)** — `gate:vocab` ne scanne pas `apps/sentinel/` (`lang:gate` oui) ; 0 motif « adaptive … » vérifié à la main ; ajout du
  scope en M012-c si voulu.
- **C3 (mineure, R-3)** — import profond `../../harness/src/calibration.ts` (dépendance inter-app non déclarée) ; acceptable (source unique
  de `q₁`, transitivement hors `tools/**`) ; export de paquet plus tard.
- **O1-O4** — ceinture `run.ts:84` inatteignable ; chemin quorum sans cooldown/retry (fail-closed, timer `Persistent` rattrape) ;
  `loadState` recompute les faits mais ne revérifie pas `line_hash` (conforme ADR : garant = recompute onchain) ; références « RUNBOOK
  step N » pendantes jusqu'à M012-c.
- **Section M012-c (runbook, revu hors arbre)** : **RC1 REQUIS** — en-tête (b)/(c) dit « J0 = first real tracker step », contredit le
  ruling D5 (J0 = première fenêtre publiée, premier pas = J0+1) ; RC2 IP VPS en clair, non exporté, acceptable ; RC3 étape « première
  édition du bloc vitrine » conforme (backup, validate, reload, curl, rollback, dry-run, perms).

## Oracle rejoué par le relecteur
`npm run ci` **250/250** ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `lint` 0 ; `export:check` 0 ; `gate:vocab` 117 OK ; tracker 10/10 (hex
`3fa29520dacf6cca`) ; sentinelle 16/16 ; `git diff --check` propre ; typecheck 0. Valeurs re-dérivées : `q₁ = 0.00013119228083333334` ;
`T(≤ 0,10) = 1789` ; max rolling90 = 27/90, 0 déclenchement à 0,40 sur 616 paires.

## Mutants (relecteur)
**M1** (`&& calm` sur la garde de pas) ⇒ ✖ `sentinel_regime_is_metadata` « a stressed pair still steps the tracker » (kill sémantique).
**M4** (`finalized` → `latest`) ⇒ ✖ `sentinel_waits_for_finality` « finalized head is before D's close » (kill sémantique).

## Points ciblés
Quorum 2 ✓ ; `finalized` min sur 2 endpoints + gate temporel `dueDays` ✓ ; C1 identité fail-closed ✓ ; hash A3 identique au recorder
(2025-03-01 `8a64cfe3…`) ✓ ; `fromAttestedFlow` non réimplémenté ✓ ; `E_static` direct, 0 `reason` de gate dans `timeline.ts` ✓ ; régime
métadonnée ✓ ; drift = flag seul ✓ ; chaîne de hash ✓ ; `q₁` recalculé ✓ ; T = 0 ✓ ; **no-peek prouvé par causalité** (muter une fenêtre
future laisse `line_hash` et `q_after` antérieurs identiques) ✓ ; K-8 direct + transitif ✓, `registry.test.ts` vert ; 0 réseau en test ✓ ;
fixture 701 entrées, blocs ≤ 23586523, invariant 0 violation, **0 donnée > 2025-10-15** ✓ ; pull = mêmes bornes C-6 ✓ ; unité durcie
(user dédié, `ReadWritePaths` seul, `ProtectSystem=strict`, caps), timer `Persistent`, snippet `handle_path` à insérer ✓ ; 0 secret,
0 `0.0.0.0` ✓ ; honnêteté : 0 « adaptive coverage… », 0 `skills/` touché, 0 `guarantee` nu, 0 français ✓ ; R-8 : 0 dépendance externe ✓ ;
R-13 : 0 TODO ✓. **R-25 = 1115** (48 + 1067 ; ±1 vs orchestrateur = fin de fichier) < 1205.

## MAST résiduels
Fuite de futur (test 3 + M4) ✓ ; fabrication de régime (test 5 + M1) ✓ ; reason qui fuit (test 4, grep 0) ✓ ; perte silencieuse : test 8 ✓
mais **C1** (no-op J0) et O2 (quorum sans retry) relevés ; overclaim ✓ ; regard sur les 11 mois : 0 donnée ✓ ; vérification incorrecte :
oracle + mutants + max glissant rejoués ✓.

## Addendum 2026-09-18 — relecture du patch C1 (≠ générateur)
Shas post-C1 : `run.ts 7cd17440e3601d31b6332ea75a943321a19783439fc06f42aa703d529f8850eb`, `sentinel.test.ts de67f125e7581a793d781bdc34c918ea1fc64f296e0a9822833e6a925dd63259`,
`monark-sentinel.service ec168bb0be446c81aa9151430392e1bb6d03a01b5dceedee6d4045801a628a89` ; **17/17**, `ci` **251/251**. Relecture indépendante du patch = **checkpoint-2
validateur `claude-fable-5-1`** (§4 de son avis : `throw` avant toute écriture et avant `rpc.finalized()`, `Type=oneshot` + `exitCode = 1` ⇒ unité `failed`,
`Persistent` rejoue ; le test prouve `resolveStartDay`, le câblage `main` est vérifié par lecture ; nuance : `--day D` non-dry sur état vide fait de D le J0 de
facto — à interdire au RUNBOOK M012-c) + orchestrateur G7 (oracle rejoué). Mutants M1..M5 valides (`timeline.ts`, `rpc.ts` inchangés).
