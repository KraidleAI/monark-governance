# G2 — Revue, Lot M010-m4 (barre honnêteté vitrine pour `checkReleaseText`)

- **Réviseur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 vérifié), **instance séparée du générateur,
  contexte frais**. Ne committe pas (R-20). 2026-09-16.
- **Verdict G2** : **PASS_WITH_NITS** — code correct et sûr (aucun surclaim ne passe, l'union ne sur-exempte
  pas, oracle vert 185/185). Nits : F1 (provenance, ce fichier + G1-m4 + réconciliation), F3 (fail-open sur la
  config de la garde — **corrigé** par l'orchestrateur en fail-closed), F2 (liste de mots interdits pour les
  notes, non-bloquant). Obs B (test de sur-exemption) **ajouté**.

## Vérifié (empirique, rejouable — probes scratchpad)
- **Union non sur-exemptive (preuve porteuse)** : le masker de `scanText` (grep-forbidden l.42-49) blanchit
  UNIQUEMENT le span exact de la phrase exempte (espaces = non-mots ⇒ peut casser un match, jamais en créer).
  Pour chaque phrase exempte, seul le ban visé y figure : `no confidence field` → `confidence` (visé) et rien
  d'autre ; `$/token spend cap` → `spend cap` (visé) et rien d'autre. Rangée la plus propre : `Plugs into
  Aave; no confidence field.` → **exactement 1 hit `Aave`** (confidence masqué, Aave rougit). Co-localisations :
  autonomous/APY/stake/yield/predicts + phrase exempte → rougissent toujours sur le ban non-visé.
- **Couverture** : table byte-check `harness ⊆ site ∪ skills` (guarantee/probative dans skills). Pas de trou.
- **Mutant-catchers genuins** : `Aave` (site-only), `yield` (skills-only) — absents de GLOBAL et de l'autre
  scope ; chaque test rougit si son scope tombe.
- **Pas de faux positif sur notes plausibles** : `coverage`/`gate`/`abstain`/`defer`/`frozen`/`predictor`
  (≠ `predicts`)/`confident`(≠`confidence`)/`delivered`/`alive`(≠`\blive\b`) restent verts.
- **Oracle reproduit par le réviseur** : `npm run ci` 185/185 ; `gate:vocab` OK ; `lang:gate` 0 ; `export:check`
  0. Pureté/inertie d'import intactes.

## Findings et résolution G7 (correction-loop, orchestrateur)
- **F1 (MEDIUM, provenance)** : l'ADR citait `docs/G1-lot-m010-m4.md`/`G2-lot-m010-m4.md` inexistants, et
  `G2-lot-m010.md:32` disait m-4 « DÉFÉRÉ / GLOBAL-only » (périmé). Résolu : ce fichier + `G1-lot-m010-m4.md`
  créés ; la ligne périmée de `G2-lot-m010.md` réconciliée (pointe vers la décision + ce lot).
- **F3 (LOW → corrigé, doctrine fail-closed)** : `?? {}` laissait la garde retomber en GLOBAL-only si un scope
  disparaissait. Corrigé : `checkReleaseText` refuse tout texte si `scan.site.banned`/`scan.skills.banned` est
  absent/vide (fail-closed). ADR §4 le note.
- **F2 (LOW, non-bloquant)** : liste de mots que la barre vitrine rougit (journalisée en G1-m4 § résidu) — à
  porter au rédacteur des notes `v0.1.0` (sinon `--tag` refusé, fail-closed).
- **Obs A** (prose §5) : reformulable, immatériel. **Obs B** : test de régression sur-exemption ajouté.

## Oracle final (après F3 + Obs B)
`npm run ci` **185/185** ; `lang:gate` 0 ; `export:check` 0 ; `node --check` OK. `error_origin` = néant
(générateur conforme ; F1/F3 attrapés au G2, corrigés avant commit). Aucun push.
