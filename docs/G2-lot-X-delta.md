claude-opus-4-8[1m]

# Revue G2 DELTA — Lot X (export public) — corrections D7 bis (ADR-M004)

- **Relecteur** : worker Opus 4.8 (effort max), instance séparée, contexte frais, != générateur.
- **Date** : 2026-09-06.
- **Worktree** : F:\Monark-wt-export, branche lot-x-export, commit 35e9863 (rebasé sur origin/main).
- **Portée** : vérifier que les 4 réserves R1-R4 de `docs/G2-lot-X.md` sont fermées par le code présent — RIEN de plus.
- **Contrainte** : jamais commit/push ; mutants restaurés PAR COPIE (jamais `git checkout`) + sha256 avant/après.

(fichier écrit incrémentalement — anti-coupure)

---

## Journal de vérification

### Contexte mesuré (rejouable)
- Worktree `F:\Monark-wt-export` @ `35e9863` ; `git status` propre (seul `?? docs/G2-lot-X-delta.md`). Files du Lot X
  **commis** ⇒ restauration mutant OBLIGATOIREMENT par copie (jamais `git checkout`). `npm ci` = exit 0, 0 vuln.
- **Baseline sha256 (état revu, = G1 Suite 2 SS3)** : `scripts/export-public.mjs` =
  `06f01c7ea7a79486a1ac7fcd4ca2fc6ed5394a856e670f77a4248bc38a06b5f5` (**concorde** exactement) ;
  `scripts/lang-exempt.json` = `46a7ff75…` ; `scripts/export-exclude-tests.json` = `5080631544…` ;
  `scripts/lang-gate.mjs` = `672c6e11…` (**269 lignes**, inchangé ce pass) ; `.github/workflows/ci.yml` = `4ff88b63…`.
  Backups pristine copiés hors worktree (scratchpad) pour restauration par copie.

### R1 — Dérivation de la CI vitrine (`derivePublicWorkflow`) — **FERMÉE (conforme)**
`scripts/export-public.mjs:180-236`. Vérification **indépendante par égalité unique** (harnais scratchpad
`r1-harness.mjs` : reconstruit l'attendu par chirurgie de lignes explicite, MA logique, puis `derived === expected`).
- **`derived === expected` = true** (byte-pour-byte). L'égalité prouve d'un coup : en-tête préfixé, `push` ajouté sous
  `on:`, job `r25` retiré, paire « Delivery flow » retirée, **et tout le reste byte-identique**.
- Source 96 lignes (split) → dérivé **65** (= 96 + en-tête + `push` − 2 delivery-flow − 31 bloc r25). Concorde G1 SS2.
- **`grep -c r25` = 0** (oracle) ; `push` sous `on:` = true ; **2 SHA distincts** (`3d3c42e5…`, `8207627…`) ; **0 directive
  `continue-on-error`** ; « Delivery flow » absente.
- **Corps de job g1/g3/g4/g6 = BYTE-IDENTIQUES** source↔dérivé (extraits et comparés un à un) ; `r25` ABSENT.
- **Fail-closed si motif introuvable** (`export-public.mjs:203-206, 213-216`) — vérifié sur la **copie temporaire** :
  `pull_request:` retiré du `ci.yml` copié ⇒ export **exit 1** « on / pull_request trigger block was not found » (cf. mutant M5
  = même classe). `doCheck` exerce aussi la dérivation (`export-public.mjs:305-306`) ⇒ pas de fail-open `--check`.
- **CA-X « CI verte à distance » dans l'export** (fresh mkdtemp, copie d'arbre + LICENSE factice comme le test) :
  export **OK 96 fichiers** (+manifeste = 97), `docs/` absent, `s2.test.ts` exclu (1), 3 READMEs FR exclus.
  - **g1** `bash enforcement/lint-model-pinning.sh .` = **exit 0** (« green by absence », pas de `.claude/` exporté).
  - **g3** `npm ci && npm run ci` = `npm ci` exit 0 (0 vuln) puis **tests 73 / pass 73 / fail 0**, exit 0.
  - **g4** `npm run lint` exit 0 ; `npm run lint:ratchet` = **67/92, exit 0** (racine `test/` non exportée ⇒ 67 ≤ 92).
  - **g6** `npm audit --audit-level=high` = **0 vuln**, exit 0.
  - lang-gate sur la sortie : `--scope root,contracts` **exit 0** (= test 42c) ; global **exit 1** (E-* non faits, attendu).
  Les 4 jobs restants sont **verts** et le workflow **déclenche désormais sur `push`** ⇒ le défaut R1 initial (push ne
  déclenchait rien + r25 incompatible avec un snapshot à historique neuf) est **corrigé**. Le vert *distant réel* reste une
  vérification **orchestrateur à la première publication** (R-20 ; « aucune poussée vers KraidleAI/monark ») — pas un
  reste du worker. Test 42(f) porte les assertions permanentes.

### R2 — LICENSE / entrée de liste blanche absente ⇒ fail-closed — **FERMÉE (conforme)**
`export-public.mjs:53-58` (`TOLERATED_ABSENT = {apps/site}` seul), `113,142-151` (`missingRequired`), `246-250` (`doExport`
exit 1) et `297-301` (`doCheck` exit 1). Mesuré sur le **worktree nu** (LICENSE réellement absente, Q4 investisseur ouvert) :
- `node scripts/export-public.mjs --out <tmp>` ⇒ **exit 1**, « required whitelist entr(ies) missing … LICENSE », **répertoire
  de sortie NON créé** (l'exit 1 précède `mkdirSync` ⇒ **pas** de fail-open silencieux).
- `--check --scope root,contracts` ⇒ **exit 1** (LICENSE absente). Le test 42 crée un `LICENSE` factice dans une copie
  d'arbre (l.118-121) pour exercer le chemin nominal — c'est la seule raison pour laquelle le test peut exporter.
- `apps/site` = **seule** tolérance (D7) ; `PACKAGE_SUBPATHS` restent optionnels par paquet (gardés par `existsSync`).

### R3 — `enforcement/` en liste blanche, commenté — **FERMÉE (conforme)**
`export-public.mjs:33-37` : commentaire citant **D7 bis R3** (« required by the exported g1-controle-generation job »).
Contenu réel = **`enforcement/lint-model-pinning.sh` SEUL** (bash anglais, linter de pinning modèle ; aucune fuite
gouvernance/FR). D7 amendé par D7 bis R3 (ADR-M004 l.87). Confirmé en liste blanche, justifié.

### R4 — ordre liste-noire AVANT règle `.md` FR — **FERMÉE (conforme)** (preuve mutant M6 ci-dessous)
`export-public.mjs:153-168` : boucle de classification, ordre **load-bearing** documenté (l.153-157) — (1) liste noire
structurelle **fail-closed, EN PREMIER** (l.164) ; (2) tests gouvernance-only (l.165) ; (3) `.md` FR = exclusion **rapportée,
non fatale** (l.166). Un `.md` de gouvernance **français** glissé en liste blanche est capté par (1) **avant** (3) ⇒ échec dur,
jamais masquage silencieux. Prouvé par M6/MINE-B (§ Mutants). test 42(g) = ce mutant manuel (pas une assertion permanente).

### Tâche 6 — Non-régression racine
- `npm run ci` = **tests 84 / pass 84 / fail 0**, exit 0. **conforme.**
- `npm run lint` = **exit 0** (0 problème). **conforme.**
- `npm run lint:ratchet` = **92/92, exit 0 (VERT)** — **état attendu, expliqué** : le « 107/92 rouge » de G1 §8 était
  **antérieur** au correctif Lot K `e57ddd3` (« type the ajv fixtures in interval-conformer.test.ts (107 -> 92, ceiling
  unchanged) », mergé PR #1 `34d085d`, présent à HEAD). Count 92 = plafond 92 (exactement, vert). **Lot X contribue 0** :
  mesuré `test/export-public.test.ts` = **0** violation des 6 règles suivies (typé, `interface ManifestEntry`, aucun `any`) ;
  `export-public.mjs`/`lang-gate.mjs` = `.mjs` hors scope `**/*.test.ts`. **conforme (déclaré, non contourné)**.
- `git diff origin/main -- packages/contracts schemas` = **vide** (contrats gelés intacts). **conforme.**

### Tâche 7 — English only (D0.5) sur les fichiers du lot
- `test/export-public.test.ts` : **0** token français (grep large : orchestrateur/française/français/réserve/vérif/données/
  fichier/preuve/erreur/sortie = aucun). **conforme.**
- `scripts/export-public.mjs` : le seul token FR = **`orchestrateur`** ×2 (l.190, l.224), utilisé comme **valeur de
  taxonomie `error_origin`** (rôle de gouvernance), dans des **commentaires** — pas de la prose. La gate ne le signale pas
  (pas de diacritique, hors `FR_WORDS`). **Distinction data/prose** : c'est un jeton de rôle de gouvernance figé, pas une
  phrase française. **Observation** (non défaut) : dans un fichier exporté, la forme anglaise `orchestrator` serait plus
  cohérente D0.5 — décision orchestrateur, jamais promue par le worker (voir §Observations).
- `scripts/lang-gate.mjs` (inchangé ce pass, 269 l., sha `672c6e11…`) : les lignes à signal FR sont **les données du
  détecteur** (`FR_WORDS`, `DIACRITICS`, `FRENCH_IDENTIFIERS`) ou des exemples cités dans commentaires anglais — **data,
  pas prose** (le gate énumère les tokens FR par construction). **conforme (data)** ; caractérisation reprise du G2 initial,
  fichier non modifié.
- `scripts/lang-exempt.json` : données d'exemption (descriptions gelées, nom du corpus) — data, pas prose. **conforme.**

### Tâche 8 — Point d'honnêteté : suppression du commentaire « Delivery flow »
`derivePublicWorkflow` étape (4) (`export-public.mjs:220-232`) retire **exactement 2 lignes** (source `ci.yml` l.11-12) :
`# Delivery flow (ADR-M003 D9 bis): every lot lands through a pull request; main is protected.` et `# A direct push
produces no run (and github.base_ref would be empty for r25) — by design.`. Dans la vitrine, les DEUX sont **FAUSSES** :
la dérivation ajoute un déclencheur `push` ⇒ **une poussée directe déclenche bien un run**, et `r25` n'existe plus. **Rien
de vrai n'est supprimé** : l'égalité byte-pour-byte du harnais R1 prouve que **seules** la paire delivery-flow et le job r25
diffèrent (2 hunks) — les l.14-15 (provenance vraie « Rewritten by the orchestrator … ») sont **conservées**. Documenté
`error_origin = orchestrateur` (l.224 + G1 Suite 2 SS1 rule (4), adjugé advisor 2026-09-06). **conforme.**

### Tâche 5 — Mutants (restauration PAR COPIE, backup hors worktree, sha256 avant/après)
Baseline `scripts/export-public.mjs` = `06f01c7e…a06b5f5`. Rejeu direct `node --test test/export-public.test.ts` (chaque
run refait la CI d'export imbriquée). Mutation appliquée depuis le backup pristine (jamais compoundée) ; restauration `cp`.

| Mutant | sha256 mutant → restauré | Résultat test 42 | Discriminant ? |
|---|---|---|---|
| **M5** (R1) — court-circuit `derivePublicWorkflow` (`return raw`) | `b56bb39f…` → `06f01c7e…` (=baseline) | `tests 1 / pass 0 / **fail 1**` — `AssertionError: exported workflow must contain no r25 reference (…grep -c r25 = 0)` (**assertion f**) | **OUI** |
| **M6 / MINE-B** (R4) — `docs/JOURNAL-PROVENANCE.md` (FR, gouvernance) glissé en `WHITELIST_FILES` | `cdbfa131…` → `06f01c7e…` | `tests 1 / pass 0 / **fail 1**` — export **FAILS HARD** : `the whitelist selected forbidden governance path(s) (blacklist, D7)` | **OUI** |
| **MINE (de mon cru)** — splice r25 **sur-gourmand** (`/^ {2}\S/` → `/^ {2}g6/`) : mange g3+g4 du workflow dérivé | `0e8fc693…` → `06f01c7e…` | `tests 1 / pass **1** / fail 0` (**VERT**) | **finding, pas défaut** (voir O1) |

Les **trois** restaurés **byte-exact** (sha256 après = baseline pour chacun). `git status` final = seul `?? docs/G2-lot-X-delta.md`.

- **M5 prouve R1** : sans la dérivation, le workflow exporté garde `r25` et n'a pas `push` ⇒ 42(f) rouge. La transformation
  est donc load-bearing pour le test.
- **M6 prouve R4** : un fichier de gouvernance **français** en liste blanche est capté **fail-closed par la liste noire
  structurelle** (évaluée EN PREMIER, `export-public.mjs:164`), **jamais** masqué silencieusement par la règle `.md` FR.
  L'en-tête « forbidden governance path » est celui de `structuralViolations` (testé avant `missingRequired` dans
  `doExport`). **Désambiguïsation de nommage** : ce M6 (Suite 2, mutation **simple** : JOURNAL en liste blanche, liste noire
  intacte) **≠** le « MINE-B » du G2 initial (mutation **double** : motif de liste noire retiré **+** liste blanche). Le
  variant double reste **vert-avec-drop-silencieux par construction** (une défense retirée ne peut pas se déclencher) mais
  **ne produit aucune fuite** (le fichier étant français, la règle `.md` FR l'exclut) ; D7 bis R4 ferme la question de
  l'**ORDRE**, que M6 prouve. `test 42(g)` n'est **pas** une assertion permanente — c'est **ce mutant manuel M6** (G1 SS0
  décision 5).
- **MINE (finding, O1)** : le workflow dérivé sous ce mutant ne conserve que `g1-controle-generation` et `g6-compliance`
  (g3+g4 **mangés**), pourtant `grep r25` = 0, `push` présent, **2 SHA distincts** (g1+g6), 0 `continue-on-error` ⇒ test 42(f)
  **passe**. Et 42(e) exécute `npm run ci` **depuis `package.json`, pas depuis le YAML** ⇒ la perte de jobs YAML n'y paraît
  pas. Donc **42(f) ne détecte PAS une perte de job** : l'invariant « jobs g1/g3/g4/g6 conservés à l'identique » n'est garanti
  que par la **revue manuelle** (mon harnais d'égalité byte-à-byte, §R1), pas par l'oracle. **Observation** (durcissement),
  pas défaut : le code commis EST correct (byte-identité prouvée), et le test **satisfait** la spec 42(f) de D7 bis (« pas de
  r25 + push »). `error_origin = orchestrateur` (spec de 42(f)).

---

## Observations (séparées des réserves — pour promotion éventuelle par l'orchestrateur ; le worker ne les promeut pas, « RIEN de plus »)
- **O1 — 42(f) ne détecte pas la perte de job** (preuve : mutant MINE reste vert). Durcissement possible : asserter la
  byte-identité des 4 corps de job (comme le harnais R1 le fait). Non bloquant ; le code commis est correct.
- **O2 — R2(a) sans oracle de test dédié.** Le test 42 écrit un `LICENSE` factice ⇒ il ne peut **structurellement pas**
  détecter une régression qui ajouterait `LICENSE` (ou une autre entrée requise) à `TOLERATED_ABSENT`. La garantie
  fail-closed R2(a) n'est vérifiée que par mon contrôle manuel d'export réel (exit 1, dir non créé) — qui **passe**. Non
  bloquant (portée mission = fermeture par le code, et le code est fail-closed).
- **O3 — `orchestrateur` (FR) ×2 dans les commentaires de `export-public.mjs` exporté** (l.190, l.224), valeur de taxonomie
  `error_origin`. Non signalé par la gate (correct — pas de la prose). Anglicisation en `orchestrator` plus cohérente D0.5 ;
  décision orchestrateur.
- **O4 (contexte, pas défaut) — vert distant réel** = vérification **orchestrateur à la première publication** (R-20 ;
  « aucune poussée vers KraidleAI/monark ») ; non vérifiable par le worker. Le mécanisme (push trigger + jobs verts en
  local) est en place.
- **Contexte pendant investisseur (pré-existant, ADR-M004 §4 / D7 bis R2(b)) — non une réserve DELTA** : l'export réel
  **échoue exit 1 tant que Q4 (choix de licence) n'est pas tranché** ; c'est le comportement fail-closed **voulu et déclaré**
  (une vitrine sans licence = « tous droits réservés »). Le worker ne tranche pas Q4 (investisseur).

---

## VERDICT DELTA : **CLOS**

Les **4 réserves R1–R4** du G2 initial (`docs/G2-lot-X.md` §D) sont **FERMÉES par le code présent** (commit `35e9863`,
`export-public.mjs` sha `06f01c7e…`), conformément à l'addendum **ADR-M004 D7 bis** (l.84-89) :
- **R1** — dérivation déterministe de `.github/workflows/ci.yml` : `push` ajouté sous `on:`, job `r25` retiré, jobs
  g1/g3/g4/g6 **byte-identiques** (prouvé par égalité indépendante), fail-closed si motif introuvable ; CI de l'export
  **verte** (g1 vide / g3 73·73 / g4 lint+ratchet 67·92 / g6 0 vuln) ; test 42(f) discriminant (M5). **FERMÉE.**
- **R2** — entrée de liste blanche absente ⇒ **exit 1, répertoire non créé** (pas de fail-open) ; `apps/site` seule
  tolérance ; export réel échoue sur `LICENSE` (voulu, Q4 ouvert). **FERMÉE.**
- **R3** — `enforcement/` en liste blanche, **commenté** (D7 bis R3) ; contenu = script anglais unique. **FERMÉE.**
- **R4** — liste noire **évaluée en premier** (documenté, load-bearing) ; M6 prouve le fail-closed pour un `.md` de
  gouvernance français. **FERMÉE.**

**Non-régression** : `npm run ci` 84/84, `npm run lint` 0, `lint:ratchet` 92/92 vert (expliqué ; Lot X contribue 0),
contrats gelés intacts (`git diff origin/main -- packages/contracts schemas` **vide**). **English-only** conforme (seul
jeton FR = taxonomie `orchestrateur`, O3). **Point d'honnêteté (tâche 8)** confirmé (rien de vrai supprimé).

Le verdict est **CLOS** (et non CLOS-AVEC-RÉSERVES) : aucune des 4 réserves ne subsiste, aucun défaut de code introduit par
D7 bis. Les **observations O1–O4** sont des durcissements/contextes **séparés**, laissés à la promotion éventuelle de
l'orchestrateur — **jamais** promus par le worker (portée « RIEN de plus »). Aucune dette nue, aucun contournement : le seul
pendant restant (Q4 licence investisseur) est **formé dans l'ADR** et le code **fail-close** dessus.

**Interdits respectés** : aucun commit/push (R-20) ; aucune poussée vers `KraidleAI/monark` ; mutants restaurés **PAR COPIE**
(sha256 après = baseline `06f01c7e…` pour les 3) ; aucun `packages/**`/`schemas/**` touché ; `package-lock.json` inchangé.
**Advisor intégré** : 1 appel de cadrage (avant travail substantiel ; conseil, jamais verdict — R-26). Revue = conseil au
G7 ; verdict final + acceptation validateur = orchestrateur (R-21).

---
*Relecteur G2 DELTA `claude-opus-4-8[1m]`, effort max, 2026-09-06. Instance séparée, contexte frais, ≠ générateur. Chaque
chiffre/commande est rejouable (R-21). Le worker ne committe pas (R-20).*
