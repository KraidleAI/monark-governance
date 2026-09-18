# G2 — Revue du lot M012-e (textes publics « adaptive », go 4)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur, 2026-09-18 ; provenance R-21 : sha256 des 11 fichiers du lot
  **11/11 MATCH** le rapport générateur ; oracles rejoués dans `F:\Monark` (`ci` 256/256, `gate:vocab` 129, `lang:gate` 0, `lint` 0, `lint:ratchet`
  69/69, `export:check` 0, `typecheck` 0, `diff --check` propre, `checkReleaseText` README + fil ok) ; R-25 mesuré 265.

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS** (3 must-fix texte public + 5 hygiène) — toutes foldées par l'orchestrateur, rejouées 256/256

### Vérifications réussies
D8 octet-identique (655 caractères, sha16 `2d08e9aef3888efa`) aux 4 endroits (README:72, ADR-M012, ADR-M009:81, constante `ci-gates.test.ts`) ;
ligne CA README:123 hors diff et `token_ca_pinned` vert ; contenu interdit absent (aucun replay 2025-10-16→J0, aucun instrument/CUSUM, aucun
pourcentage de couverture, aucun token/price hors négation, aucun « first/only », aucun `live` dans `skills/`) ; hiérarchie des mots tenue
(« adaptive » ne qualifie que « quantile tracker » ; « the tracker adapts, the gate does not yet ») ; faits live vrais ; formule Thm 1 adossée à
`timeline.ts:40-43` et `tracker.ts:16-17` ; comptes 4 built / 7 roadmap cohérents sur toutes les surfaces rendues ; `WhatInside` rend bien
« What's inside » pour Narabi built ; fil : 13 tweets ≤ 280, 0 tiret, « What this is NOT », recette de recalcul ; rulings 1-7 honorés.

### Corrections (error_origin G7 : **générateur** pour C1-C8)
- **C1** `fleet-presentation.ts:63` « adaptive split-conformal quantile tracker » → « adaptive quantile tracker » (ABB 2024 est online/adaptatif ; « split-conformal »
  est réservé à la calibration statique committée, ADR-M012 l.104). **Foldée.**
- **C2** `package.json:5` description « 3 agents built, 8 on the roadmap » **exportée au miroir** (`WHITELIST_FILES`) — surface manquée. → « 4 / 7 ». **Foldée**,
  et l'observation « chaîne libre non couverte par `fleet_register_built_set_is_frozen` » est **close par un garde** (0) dans ce test (mutant prouvé, G1).
- **C3** fil, tweet 4 : « 613 calm onchain windows » → « 613 calm calibration pairs » (701 fenêtres ≠ 613 paires calmes, ADR D5). **Foldée.**
- **C4** `fleet/page.tsx:116` commentaire « eight » → « seven » ; **C5** `visage-register.test.ts:69` idem ; **C6** `placeholder-panel.tsx` doc-commentaire
  (sert aussi Narabi built) ; **C7** fil : slot de borne `[BOUND_TODAY]` ajouté au tweet 6 (269 car.) + NOTE réécrite ; **C8** tweet 1 « T = [T_TODAY] »
  marqué inline. **Toutes foldées.**

### §R
Aucune R-n bloquante ; C1-C3 = exactitude du texte public (doc 03 zéro-dette, R-21) ; C4-C8 hygiène. Séquencement respecté : C1/C2 avant le push go 4,
C3/C7/C8 avant la mise en file du fil go 5.
