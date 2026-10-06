# G2 du lot SURFACES-1-1-0 (textes publics et surfaces du site en contrat 1.1.0)

- **Objet** : `git diff ec0e023d..5bd5da74`, worktree `/home/user/monark-governance-srf`, branche `recherches/surfaces-1-1-0`.
- **Références** : `docs/G0-lot-surfaces-1-1-0.md`, `docs/G7-lot-surfaces-1-1-0.md`, note de version `NOTICE-1-1-0.md`, code servi au gel (`apps/harness/src`, `packages/contracts`, `schemas`).
- **Hôte** : Linux, Node 24.21.0, proxys désactivés pour les tests seulement. Revue seule : rien modifié, rien commité ; `git status` propre en fin de revue, HEAD `5bd5da74`.

## Verdict : **bloquant** (un seul point, B-1, correctif d'une phrase)

Les changements du lot sont exacts. Chaque phrase modifiée a été vérifiée contre le code servi, et les octets servis sont inchangés. Le seul bloquant est une phrase **préexistante** de `skills/monark/SKILL.md`, fichier du lot, qui décrit mal le service 1.1.0. Le G0 l'a vue et l'a renvoyée en question (Q-SRF-2). Une fois B-1 corrigé, le lot est **non bloquant**.

## Mesures

| Contrôle | Résultat |
|---|---|
| `git diff --stat ec0e023d..5bd5da74 -- apps/harness/src packages schemas apps/site/data 'fixtures/*.json' apps/harness/test` | vide |
| `/openapi.json` en processus (`handleJsonMirror(new Request("https://api.monarkgate.tech/openapi.json"))`), au gel | 200, `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0` |
| idem sur `git archive ec0e023d` | 200, `61c9df97…8ccbf0` (identique) |
| `test/surfaces-1-1-0.test.ts`, `narabi-live`, `site-ukemi`, `byo-demo-probe` | 71/71 verts |
| Narabi : empreinte du verdict servi | `apps/harness/test/gate.test.ts:394` : `runGate(USDE_PRED).verdict.scores_sha256 === USDE_STABLE_RUN_SCORES_SHA256_PINNED` = `e44a68b6…cfd28` ; `hikae/src/verdict.ts:57` calcule `scoresSha256(params.scores)` dans l'ordre donné, celui de `USDE_STABLE_RUN_CALIB` (ordre temporel, déclaré `time` dans la table marginale) |
| Narabi : ordre du chargeur | `JSON.stringify(parsed)` sur le tableau du fichier, sans tri : identique à `canonicalJson` pour des nombres finis (même `JSON.stringify`, -0 écrit 0). Le port est égal au producteur sur les scores engagés et sur `[0,-0]`, `[-0,0]`, `[1,0]`, `[3,1,2]`, `[1e-9,5e-7]`, `[1e21,1e-7]`. `sha256(fixtures/usde-calib-scores.json)` = `e44a68b6…` aussi : le fichier est déjà en écriture canonique. |
| Ancienne empreinte triée `c9793b28…` | absente de `apps/site` et de `test/`. Elle reste dans `calibration.ts:158` (épingle de provenance, non servie), `fixtures/PROVENANCE-usde.md:76` (nommée « provenance digest », correct), des tests `hikae`/harnais sur `calibDigest` (outil de provenance) et des docs historiques. Rien ne l'affiche. |
| Traces | `byo-demo-trace.json` : calibrate et gate portent `scores_sha256 3e12ae9e…`, `alpha 0.1`, `qhat 1`, `schema_version 1.1.0`. `h5-e2e-trace.json` : `e44a68b6…` (étape USDe) et `4f53cda1…` (= `scoresSha256([])`, cascade). Les textes de DEMO et des PROVENANCE concordent. |

### Tueurs tirés à la main (mutation, test seul, restauration, sha256 vérifié)

| Mutation | Test | Résultat | sha256 restauré |
|---|---|---|---|
| `narabi-calib-load.ts` `JSON.stringify(scores)` → `JSON.stringify([...scores].sort((a, b) => a - b))` | `narabi_gate_facts_read_from_committed_sources` | **tué** | `7eb44534…` identique |
| `SKILL.md:20` `` `scores_sha256`, `alpha` `` → `` `calib_digest`, `alpha` `` | `srf_skill_audit_names_scores_sha256` | **tué** | `5f51984c…` identique |
| `apps/harness/README.md:73` ``must be `1.1.0` `` → ``must be `1.0.0` `` | `srf_harness_readme_states_the_served_contract` | **tué** | `df0fd2e2…` identique |
| `RUNBOOK-vitrine.md:35` `` `preflight` `` → `` `main` `` | `srf_runbook_vitrine_refusal_falls_at_preflight` | **tué** | `9e85fa4d…` identique |
| (sonde) `RUNBOOK-vitrine.md:35` « refus tombe au pré-vol, avant toute porte locale » → « refus ne tombe qu après les portes locales complètes » | tout `surfaces-1-1-0.test.ts` | **survit** (8/8 verts), voir N-1 | identique |
| (sonde) `ukemi-copy.ts` `DIGEST_NOTE` « , in the order the class's table lists them; » → « , sorted ascending; » | `surfaces-1-1-0` et `site-ukemi.test.ts` (32 tests) | **survit**, voir N-2 | `cf3f821b…` identique |

## Constats

### B-1 : `skills/monark/SKILL.md:62` dit que deux classes sont servies ; au gel, les 32 classes kata le sont aussi (Q-SRF-2)

- **Preuve** : la l.62 dit « Two other `task_class`es are served. » après la cascade et la classe retirée : la liste des classes servies s'arrête donc à cascade, liquidation et stable-run. Or au gel, `SERVED_POLICY_TABLES` (`apps/harness/src/tools/gate.ts`, bloc D) sert les 32 tables kata (`kata-path.ts:78`, abstention `under_calib` sans ligne). La note (§2.13, §2.14) les annonce, et §4.10 demande aux appelants de réinstaller ce skill depuis le miroir. Le skill ne dit pas non plus que le motif réservé s'est élargi : un appelant BYO qui suit le skill et nomme sa classe `xrp-dir-24h` ou `my-range-1h` reçoit `byo_reserved_kata` (`gate.ts:775`, `:834`) sans que rien ne l'en ait prévenu. Ce texte public décrit mal l'API servie, et c'est le texte que la note fait réinstaller.
- **Correctif** (l.62, première phrase) : remplacer « Two other `task_class`es are served. » par
  « Two other `task_class`es are served with a committed calibration. »
  et insérer après la l.70 (fin du paragraphe Narabi), séparé par une ligne vide :
  > The 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` are also served, with no calibrated row yet: a well-formed call abstains (`under_calib`, or `non_evaluable` for a lean of exactly 0 on a `dir` class), and a malformed one is a named 400. Do not bring your own calibration under a class name of the form `^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` (compared without ASCII case): it is refused (`byo_reserved_kata`).
- Épingle suggérée, dans `srf_skill_audit_names_scores_sha256` : `assert.ok(skill.includes("byo_reserved_kata"))`, et le motif lu depuis `KATA_CLASS_RE.source` (`gate.ts:775`), jamais tapé. Repasser `checkPublicText` (notes) et `gate:vocab` sur la phrase.

### N-1 : le correctif de porte de langue `72be5ed9` n'épingle plus l'affirmation du runbook

- **Preuve** : avant le commit, le test vérifiait la phrase « refus tombe au pré-vol, avant toute porte locale ». Après, il vérifie trois choses : l'absence de « 15 min » dans tout le fichier, la présence de « #181 (RELEASE-PREFLIGHT-SEND-GUARD-1) », et la présence de « (`scripts/release-public.mjs`, `preflight`) ». La sonde ci-dessus remet le sens 1.0.0 (« ne tombe qu après les portes locales complètes ») et le test reste vert. Le test ne pin plus ce que dit son nom : il ne vérifie pas **où** tombe le refus. Le tueur déclaré (`preflight` → `main`) ne touche qu'un renvoi de code.
- **Correctif** : épingler les deux lignes par empreinte, sans citer de français dans `test/`. Dans le test :
  ```ts
  const lines = runbook.split("\n");
  const at = lines.findIndex((l) => l.includes("#181 (RELEASE-PREFLIGHT-SEND-GUARD-1)"));
  assert.equal(createHash("sha256").update(lines.slice(at, at + 2).join("\n")).digest("hex"),
    "0e57fc0175342ab97753dd545df0d50e75a9053dc61a00a4569395df1e0608a5", "the preflight sentence of the runbook, byte for byte");
  ```
  (valeur mesurée sur les l.34-35 au gel, `\n` entre les deux, sans fin de ligne). Garder la prémisse `release-public.mjs` ; le tueur déclaré peut rester.

### N-2 : la clause d'ordre de `DIGEST_NOTE` n'est épinglée par rien

- **Preuve** : `apps/site/lib/ukemi-copy.ts:144-145`. Le test ne vérifie que le préfixe `^The scores digest identifies the calibration points`. Remplacer « in the order the class's table lists them » par « sorted ascending » (la définition 1.0.0) laisse `surfaces-1-1-0` et `site-ukemi` verts. Le golden de `/ukemi/course` ne lit pas cette note.
- **Correctif** : dans `srf_site_says_scores_digest`, `assert.equal(copy.DIGEST_NOTE, "The scores digest identifies the calibration points this bound is computed from, in the order the class's table lists them; the gate returns it with every answer on this stratum, so an answer can be matched to its calibration.")`, ou au minimum `assert.match(copy.DIGEST_NOTE, /in the order the class's table lists them/)`.

### N-3 : `CONTRIBUTING.md:25`, texte exporté au miroir, garde le nom et la boucle d'audit de 1.0.0

- **Preuve** : `scripts/export-public.mjs:58` exporte `CONTRIBUTING.md`. Les l.19-27 disent « a digest over exactly those scores » et « The loop closes when the verdict's calibration digest equals the digest the calibrate step returned ». En 1.1.0 (note §2.3), le champ s'appelle `scores_sha256`, il dépend de l'ordre, et la boucle se ferme sur `scores_sha256`, `alpha` et `qhat`, ou quand les deux répondent `under_calib`. Ce n'est pas faux au sens strict, mais c'est le libellé que le lot retire partout ailleurs, sur une surface publique. Le fichier est hors de la liste de MONARK : je le range en non bloquant et je recommande de le corriger dans ce lot (deux lignes).
- **Correctif** : l.20 « split-conformal quantile and a digest over exactly those scores. » → « split-conformal quantile and a `scores_sha256` over exactly those scores, in the order sent. » ; l.25-26 « The loop closes when the verdict's calibration digest equals the digest the calibrate step returned » → « The loop closes when the verdict's `scores_sha256`, `alpha` and `qhat` equal those the calibrate step returned ». Ajouter `CONTRIBUTING.md` à la boucle `OLD_DIGEST_NAMES` du test, avec en plus `/calibration digest/i` pour ce fichier.

### N-4 : `docs/RUNBOOK-harness.md:195` cite un message que le script n'imprime pas et un compte faux (Q-SRF-3)

- **Preuve** : `scripts/verify-harness.mjs:391` imprime « VERIFY OK — all checks passed. » (ou la variante « TLS skipped »), sans compte. Le script pousse 15 contrôles (`health`, `openapi`, `origin_403_api`, `origin_403_mcp`, `mcp_tools_list`, `gate_call`, `gate_retired_call`, `gate_future_call`, `gate_liq_call`, `gate_liq_uncommitted_call`, `mcp_gate_description_liq`, `cascade_call`, `attest_call`, `calibrate_call`, `gate_byo_call`), et le CA du 2026-10-04 en porte 15.
- **Correctif** (l.195) : « the command **exits 0** AND its stderr prints `VERIFY OK` (13 of 13 checks). » → « the command **exits 0** AND its stderr prints `VERIFY OK — all checks passed` (15 checks today; the CA's `checks` array lists them all, each `ok: true`). » Document interne, non exporté : à faire dans ce lot, puisque le fichier est déjà touché et que l'opérateur le lit à T0.

### N-5 : sur `/ukemi/course`, « scores digest » ne devient vrai qu'après la promotion d'ukemi à T0

- **Preuve** : `apps/site/data/ukemi-served.json:20` porte encore `calibration_digest e7e67366…`, l'empreinte C5 triée lue sur le service 1.0.0. `ukemi-pending.json:16` porte `a9277222…` (= `UKEMI_LIQ_SCORES_SHA256_PINNED`). Un build fait avant la synchro rendrait « served scores digest e7e67366… » sous une note qui parle d'ordre de table : c'est faux pour cette valeur. Aujourd'hui, seule la garde d'envoi (`export-public --out` et le pré-vol de `release-public`, tant qu'un `*-pending.json` existe) empêche de publier cet état. `sync-ukemi-served.mjs:152` écrit bien `calibration_digest: v.scores_sha256` : l'état promu sera juste.
- **Correctif** (facultatif, non bloquant) : un test qui, quand aucun `ukemi-pending.json` n'existe, exige `ukemi-served.json` `liq_verdict.calibration_digest === UKEMI_LIQ_SCORES_SHA256_PINNED[<clé s0>]`. Il lie le libellé à la valeur 1.1.0 dès la promotion. Sinon, rappeler dans la passation de T0 l'ordre déjà écrit : CA, synchro du harnais, synchro d'ukemi, puis seulement l'envoi du site.

### M-1 : la ligne kata de `apps/harness/README.md` omet les contrôles de `yhat`

- `apps/harness/README.md:36` énumère « key grammar, `features_digest`, the class's `alpha`/`nMin`, the `tau` cap on `dir`, the `produced_at` grid and the 300 s staleness, each a named 400 ». La note §2.14 ajoute `yhat_type_mismatch` et `kata_yhat_domain`. Correctif : « … the `tau` cap on `dir`, the `yhat` type and domain, the `produced_at` grid and the 300 s staleness, each a named 400 ».

### M-2 : la ligne `nCalib` de `apps/harness/README.md:83` ne nomme pas les classes kata

- Correctif : ajouter « ; a kata class: `0` (no row served) » avant « ; BYO: the caller's `scores.length` ».

### M-3 : `scripts/sync-ukemi-served.mjs` réécrit « the calibration digest » dans le `$comment` du fichier servi

- `apps/site/data/ukemi-served.json:2` (non rendu) dit « the calibration digest ». La synchro de T0 réécrit ce `$comment` depuis `COMMENT` du script, qui garde le libellé. Hors lot (script et donnée servie), à signaler à MONARK. Correctif dans le script : « the calibration digest » → « the scores digest (the verdict's scores_sha256) ».

### M-4 : `README.md` compte six contrats figés, le site en compte huit

- `README.md:20` dit « the **six frozen interface contracts** (the sixth, AttestedBook, upcoming… », `:94` « six frozen contracts (the sixth, AttestedBook, upcoming until served) » et `:317` « it compiles the six frozen JSON Schemas ». Or `schemas/` en compte 8 (`policy-row` et `tool-error` en plus), et le site dit « Eight frozen contracts (AttestedBook upcoming until served) ». Les deux surfaces publiques se contredisent. Hors de la liste de MONARK, ces lignes sont antérieures au lot et le texte n'est pas faux sur l'API : à signaler, et à corriger dans ce lot si c'est bon marché. Correctif : `:20` « the **eight frozen interface contracts** (one of them, AttestedBook, upcoming… » ; `:94` « eight frozen contracts (AttestedBook upcoming until served) » ; `:317` « it compiles the frozen JSON Schemas » (sans chiffre). Vérifier avant qu'aucun test n'épingle « six ».

### M-5 : `RUNBOOK-vitrine.md:34-35` réécrit sur place une entrée datée du 2026-10-05

- L'entrée datée « 2026-10-05 14:3x UTC » cite maintenant #181, fusionné après. Si la convention des runbooks est d'ajouter une ligne datée, ajouter « (2026-10-06, SURFACES-1-1-0) » à la phrase modifiée. Sinon, rien à faire.

## Vérification des textes changés contre le code (sans écart hors des points ci-dessus)

- `SKILL.md:20` : boucle sur `scores_sha256`, `alpha`, `qhat` (`tools/calibrate.ts:163-171`, `verdict.ts:57`, note §2.3). Exact.
- `DEMO.md` : les quatre blocs JSON sont égaux à la trace, ou en sont des sous-ensembles (test). `"schema_version": "1.1.0"` = `SCHEMA_VERSION`. La ligne d'audit cite `3e12ae9e…`. Exact.
- `README.md:328` : `scoresSha256` est exporté par `packages/contracts` (`canonical.ts:53`, `index.ts:65`). Exact.
- `RUNBOOK-harness.md:168-175` : `verify-harness.mjs:291, 350, 362` comparent `scores_sha256`. `LIQ_S0_SCORES_SHA256` = `a9277222…` = l'épingle de `calibration.ts`. Exact.
- `apps/harness/README.md` : `region: null` (cascade) ; bords pris du test de score (§2.8) ; `scores_sha256` + `alpha` + `qhat` (BYO) ; `KATA_CLASS_RE` identique au caractère près (`gate.ts:775`) ; `schema_version_unsupported` (`gate.ts:903`) ; `byo_lookalike_confusable` (`gate.ts:941`) ; épingle de `btc-dir` par `scoresSha256` (`calibration.ts:32-35`). Exact, sauf M-1 et M-2.
- `PROVENANCE-*` : valeurs égales aux traces et aux épingles ; `h5-e2e-probe.test.ts:139` vérifie bien ce que dit la l.130. `PROVENANCE-usde.md:75-78` distingue correctement l'empreinte de provenance (`calibDigest`) du `scores_sha256` servi, égal à l'épingle du fichier. Exact.
- `RUNBOOK-vitrine.md:34-35` : `release-public.mjs:186-187` et `preflight()` (dernier contrôle : `sendGuard`) tombent avant la boucle `gates` (l.195). Exact. Au sens strict, le pré-vol passe d'abord la porte du message de commit, mais « porte locale » y désigne les longues portes : acceptable.
- Site : « scores digest » sur `/how`, `/narabi`, `/docs/narabi`, `/ukemi/course` ; `sim.ts` vaut 1.1.0, illustratif. Aucun « calibration digest » ni `calib_digest`/`set_digest` dans `apps/site` hors `data/` (`harness-served.json:70` : synchro de T0, déclaré).
- Note de version : aucune contradiction relevée.

## Fenêtres (Windows)

- `.gitattributes` : `* text=auto eol=lf`, donc les fichiers sont extraits en LF et les regex `\n` du test (blocs JSON de DEMO, ligne coupée du runbook) tiennent sous Windows.
- `readdirSync(..., { recursive: true })` filtre par `split(sep)` et relativise par `relative()`. Les chemins passent par `join`. Pas de nom réservé, pas de fichier créé (le test Narabi garde `mkdtempSync(tmpdir())`). Aucun saut ajouté. Rien à signaler.

## Avis sur les questions de l'agent

- **Q-SRF-1** (« Eight frozen contracts ») : garder 8, sans changement. `ToolError` est servi : c'est le corps 400/500 de `/openapi.json` (note §2.11, §2.15). La ligne de politique (`policy-row.schema.json`) est servie en empreinte (`policy_row_sha256`, `policy_table_sha256` du verdict). Les deux sont publiées avec la spécification (note §5, qui nomme `policy-row` et `tool-error`). `UNSERVED_CONTRACT_FILES = ["attested-book.schema.json"]` reste juste. Le G0 nomme le contrat « PolicyTable » alors que le fichier est `policy-row` ; le site dérive les titres des schémas, donc rien à corriger côté site.
- **Q-SRF-2** (`SKILL.md:62`) : à corriger **dans ce lot**. C'est B-1.
- **Q-SRF-3** (`RUNBOOK-harness.md:195`) : à corriger dans ce lot. C'est N-4 : le compte est faux, et le message cité n'est pas celui que le script imprime.
- **`docs/deploy-CA-harness.json`** : d'accord pour le laisser hors lot. C'est l'enregistrement d'un contrôle en ligne ; l'éditer à la main fabriquerait un faux CA, et trois tests (`harness-served`, `site-ukemi`, `fleet-ukemi-liq-leg`) le lisent comme le CA déployé. Il doit être régénéré par `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json` juste après le déploiement de T0, **avant** les deux synchros (ordre de `RUNBOOK-vitrine` l.29-30), et son sha256 journalisé (RUNBOOK-harness §6). Le CA neuf comptera 15 contrôles, dont `gate_byo_call` en `scores_sha256` : c'est cohérent avec N-4.
