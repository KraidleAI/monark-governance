# CHECKPOINT-2 — lot `CI-site`

Avis du `validateur-humain`, modèle résolu (R-1) **`claude-fable-5-1`** (Fable 5.1), instance séparée à contexte
frais ; horloge (`date -u`) : 2026-09-20 22:22 → 22:33 UTC. **Persisté dans le dépôt par le worker-implémenteur du
PLI checkpoint-2** (modèle résolu R-1 **`claude-opus-4-8[1m]`**, effort max, ce pli), à partir du **résumé de
l'orchestrateur** (vérifications condensées, corrections **intégrales**) — jamais le transcript. Artefact jugé :
commit `64cf0f6` (branche `lot/ci-site`, base `c9e7b4b`). Contexte frais : artefacts seuls (jamais le fil du
planificateur ni du worker). Aucune écriture (`git status` vide, HEAD inchangé), aucune action sortante ; `Bash` du
validateur en **vérification seule** (AM-2, CA-9 : re-exécuter, jamais lire les chiffres du G2).

## Décision
**ACCEPTE-AVEC-CORRECTIONS** (liste fermée C2-1..C2-6 ; **bloquantes avant gel : C2-1, C2-2** ; **avant G7 : C2-5** ;
**C2-4 = G2-delta par relecteur séparé, HORS ce pli** — lancée par l'orchestrateur après le pli). Pas d'ESCALADE :
aucune décision de valeur ni de périmètre nouvelle (décisions 69, 77 déjà prises).

## Re-exécutions CA-9 (rejeu à froid, `Bash` de vérification ; copie `git archive` + `npm ci`, hors `C:`)
| Oracle re-exécuté par le validateur | Résultat mesuré |
|---|---|
| `next build` via la **ligne `run:` EXTRAITE** de `ci.yml` (g3-site) | **exit 0** ; `fleet.html` **61 163 o** |
| O-2 `node scripts/assert-fleet-html.mjs` **EXTRAITE** de `ci.yml` | **exit 0** ; en-tête + **4** notes servies ; **34 099** car. de corps |
| Mutants imposés (job/étape `if:`, ordre, run-line, corps) | **tous ROUGES** sur le test nommé attendu |
| Suite complète `node --test` | **486/486** |
| `typecheck` | **0** |
| `lint:ratchet` | **69/69** |
| `gate:vocab` | **OK, 177 fichiers, propre** |
| `export:check` (défaut) / `lang:gate` (défaut) | **0 hit** / **0 hit** |
| R-25 (pathspec `ci.yml:65`, base `c9e7b4b`) | **601 ≤ 1 205** |
| **C-9** (décision 69) : `collectFiles(ROOT).kept` | **282 fichiers** ; **0** sous `test/`, `apps/bell`, `docs/` ; **0** forme du fournisseur de recoupement dans l'export |
| **Tuyau PUBLIC exécuté pour la PREMIÈRE fois** | build + O-2 **verts dans l'export réel** (composition côté miroir public) |
| `git merge-tree --write-tree` | **1 conflit ATTENDU** avec `lot/narabi-ops-1b-i` sur `vocab-banned.json` ; **0** avec `lot/etude-suite` |

## Survivants trouvés par le validateur (l'invariant `if:`/`continue-on-error` du pli G2 était incomplet)
La détection du pli G2 ancre le mot-clé en **début de ligne** (`/^\s*if\s*:/`, `/^\s*continue-on-error\s*:/`) et ne
voit donc pas une clé placée derrière un tiret de liste, un guillemet, ou dans un flow-mapping :
- **(a)** `      - if: false` **en PREMIÈRE clé de l'étape O-2** — YAML valide et idiomatique — **passe les 34 tests** :
  la regex `/^\s*if\s*:/` ne voit pas la clé derrière le tiret. Un required check **SKIPPÉ compte PASSANT** sur
  GitHub ⇒ déblocage silencieux de la gate que C-5 protège.
- **(b)** clé **entre guillemets** `"if": false` sur le job **passe** de même.
- **(c)** `'continue-on-error': true` (guillemets) **survit** — **trou antérieur au lot** dans le test 38 (la même
  fragilité d'ancrage sur `continue-on-error`).

## Corrections — liste fermée (intégrale)

- **C2-1 (bloquante avant gel).** Élargir la détection `if:` dans le **test 38** (branche 1bis) **ET** le contrôle du
  **bloc `g3-site`** (`g3_site_builds_then_asserts_fleet_html`). **Forme proposée : `^\s*(?:-\s+)?["']?if["']?\s*:`.**
  Mutants **ROUGES exigés** : `- if: false` sur l'étape O-2 ; `"if": false` sur le job ; **une forme en flow-mapping**
  (`{ if: false, … }`). Contrôles qui doivent **rester VERTS** : le `if [` shell (job r25) et `if-no-files-found:`
  (job g6). `error_origin` = **worker (pli G2)** ; **cause contributive** : **pli non relu** (aucune G2 fraîche sur le
  fold avant le checkpoint-2) — adressée par C2-4.
- **C2-2 (bloquante avant gel).** Réécrire le **bloc JOURNAL du PLI §8** avec **UN MODÈLE RÉSOLU PAR ÉTAPE** : G0
  (worker `claude-opus-4-8[1m]`) ; checkpoint-1 (`claude-fable-5-1`, `afd1efe`) ; pli du G0 + adjudications
  orchestrateur (`claude-fable-5-1`, `c9e7b4b`) ; G1 (`03e7b6c`) ; G2 relecteur **séparé** (`claude-opus-4-8[1m]`,
  `5195378`) ; pli G2 (`64cf0f6`, **instance distincte du G1** : worker `claude-opus-4-8[1m]` lancé séparément) ;
  consultations de l'advisor intégré **citées au PLI §6** ; checkpoint-2 (`claude-fable-5-1`) ; ce pli ; G2-delta à
  venir ; G7 à venir. Ajouter `error_origin` de **O-1..O-3 (worker)** et de **C2-1**.
- **C2-3.** Ajouter **`(1bis)`** à l'énumération d'en-tête du test 38 ; **aligner le commentaire `ci.yml:3-4`** (le
  bannissement porte sur `if:` **et** `continue-on-error`) ; **consigner la « déviation 8 » au PLI §6**.
- **C2-5 (avant G7).** Ajouter au **bloc CHANTIERS du PLI §8** les items **5** (re-mesure du `timeout-minutes`), **6**
  (oracle décision 69 sur la surface servie `/bell/`), **7** (ADR pour un `if:` légitime), **chacun avec déclencheur +
  propriétaire**. L'item **« premier run réel »** nomme **AUSSI le miroir public** : la composition côté export n'est
  couverte **par aucun test automatisé**.
- **C2-6 (adjudication orchestrateur — à faire ICI, zéro dette).** Appliquer **la même tolérance tiret + guillemets** à
  la regex `continue-on-error` du **test 38**. Mutants **ROUGES** : `'continue-on-error': true` ; `- continue-on-error:
  true` en première clé.
- **C2-4 (HORS ce pli).** **G2-delta par relecteur séparé** (instance fraîche) sur le pli du checkpoint-2 —
  **l'orchestrateur la lance après le worker**, ce n'est pas le travail de l'implémenteur.

## Directive de robustesse (jugement du validateur)
Réfléchir à la **ROBUSTESSE** plutôt qu'à la regex seule : si un **parseur YAML** est déjà une dépendance du dépôt
(vérifier `package.json`, **n'ajouter AUCUNE dépendance**), **préférer asserter sur la structure parsée** (aucune clé
`if` ni `continue-on-error` à `true` dans aucun job/étape) **en plus** de la regex ; **sinon**, regex élargie + les
mutants ci-dessus + **un mutant du cru du worker** (clé sur plusieurs lignes, indentation par tabulation si YAML
l'admet, casse). Corriger aussi l'**addendum D9 octies** de `docs/adr/ADR-M003-phase2-integration.md` pour qu'il **ne
sur-affirme rien** : l'invariant est « **asserté pour les formes X, Y, Z** », liste exacte.

## AM-1 — ce que la checklist a attrapé
Un invariant `if:` du pli G2 ancré en début de ligne, contourné par trois formes idiomatiques (`- if:`, `"if":`,
flow-mapping) qui rendaient une gate bloquante silencieusement débloquable ; le même trou hérité sur
`continue-on-error` ; un pli G2 non relu par une instance fraîche avant le checkpoint-2 (cause contributive) ; un
addendum ADR qui sur-affirmait « aucun `if:` » là où le mécanisme (regex, pas de parseur) ne prouve qu'une liste
fermée de formes ; un tuyau public dont la composition n'était couverte par aucun test automatisé.
