# G2 delta du lot SURFACES-1-1-0 (repli de la G2)

- **Objet** : `git diff 5bd5da74..361c92c7`, hors fichiers V-1 (`scripts/public-text-deny.mjs`, `test/public-text-deny.test.ts`, `docs/*v1-spec-url-allow*`). Commits : fusion `4c2c2003`, pli `72530dc9`, `fd5bda12`, `8572a88c`, `639eff18`, `361c92c7`.
- **Revue seule** : rien modifié, rien commité. `git status` est propre en fin de revue.

## Verdict : **non bloquant**

B-1 est fermé, et les faits du nouveau paragraphe sont exacts contre le code servi. N-1 à N-4, M-1, M-2 et M-5 sont fermés. M-4 est fermé à moitié : le titre `README.md:245` dit encore « Six » (D-1 ci-dessous). Il ne s'agit pas d'une description fausse de l'API, mais d'une incohérence interne du README public. Je recommande de la corriger avant la fusion de T0 ; ce n'est pas une condition.

## Contrôles

| Point | Résultat |
|---|---|
| B-1, faits | `runGate` en processus, `nowMs` sur la grille. `btc-dir-1h`, yhat 0.3 : `abstain` / `under_calib`, `region` null. yhat 0 : `abstain` / `non_evaluable`, `region` null. `btc-range-4h`, yhat 0.02 : `abstain` / `under_calib`, `region` null. Aucune ligne servie (`kataTablesHoldNoRow`), donc `kata-path.ts:78-79` ne rend que ces deux raisons. Une requête mal formée donne un 400 nommé (`assertKataRequest`). |
| B-1, motif | La phrase du skill reprend `KATA_CLASS_RE.source` (`gate.ts:775`), et le test la lit depuis le code. BYO `xrp-dir-24h`, `my-range-1h`, `EURUSD-dir-1h` : `byo_reserved_kata`. Pas de région ni de bande promise, conformément à la contrainte de MONARK (`b561bc5`). |
| N-1, sonde rejouée (sens 1.0.0 remis dans la ligne du pré-vol) | **tuée** (épingle `7793735f…`). sha256 restauré. |
| N-2, sonde rejouée (« sorted ascending ») | **tuée** (`srf_ukemi_digest_note_is_the_1_1_0_note`). sha256 restauré. |
| Tueur B-1 (`byo_reserved_kata` → `byo_overrides_committed`) | **tué**. sha256 restauré. |
| N-3, `CONTRIBUTING.md:20, 25-26` | fermé, épinglé |
| N-4, `RUNBOOK-harness.md:195` | fermé. Le message est celui de `verify-harness.mjs:391`, et le compte 15 est dérivé du script. |
| M-1, M-2 | fermés (`apps/harness/README.md:36, 83`) |
| M-5 | fermé. L'entrée du 2026-10-05 retrouve ses mots ; nouvelle ligne datée du 2026-10-06. |
| M-4 | `:20`, `:94` et `:317` sont justes (8 schémas de contrat dans `schemas/`, comme le site). **`:245` reste ouvert** (D-1). |
| Tests | `surfaces-1-1-0`, `gate-kata-served`, `gate-byo-lookalike`, `narabi-live`, `site-ukemi` : 90/90 verts |
| `checkPublicText` (notes), lignes ajoutées | ok sur `SKILL.md`, `CONTRIBUTING.md`, `apps/harness/README.md` et `RUNBOOK-harness.md`. `README.md` : une seule violation, q3 « budget » sur la l.94, **préexistante** ; même ligne sans `budget \`B_t\`` : 0 violation ; fichier entier, 16 violations avant comme après. |
| Octets servis, `647e078a` contre `361c92c7` | `git diff --stat` vide sur `apps/harness/src`, `packages`, `schemas`, `apps/site/data`, `fixtures/*.json` et `apps/harness/test`. `/openapi.json` en processus : `61c9df97…8ccbf0` des deux côtés. |
| Fusion `4c2c2003` | n'apporte que les 5 fichiers V-1. `647e078a..361c92c7` ne contient que les fichiers du lot. Aucun conflit, aucun reste. |

## Constats delta

### D-1 (non bloquant, à faire avant la fusion si possible) : `README.md:245` titre « Six frozen contracts », avec un tableau de 6 lignes

- **Preuve** : le pli fait dire « eight frozen interface contracts » aux l.20 et 94, mais la section `## Six frozen contracts` (l.245-256) garde 6 lignes. `PolicyTable` (titre de `schemas/policy-row.schema.json`) et `ToolError` (`schemas/tool-error.schema.json`) n'y figurent pas. Le README public se contredit ; avant le pli, il disait six partout. Aucun test n'épingle ce titre.
- **Correctif** : l.245 `## Six frozen contracts` → `## Eight frozen contracts`, et ajouter deux lignes au tableau :
  - `| \`PolicyTable\` | MONARK (policy tables) | A class's policy table: one class entry and its rows (cell key, alpha, n, the served rank and q̂, \`scores_sha256\`). The verdict carries the digest of the table (\`policy_table_sha256\`) and of the row it used (\`policy_row_sha256\`). |`
  - `| \`ToolError\` | the harness | The body of an HTTP 400 or 500 answer: \`{error, operation, message, code}\`, the \`code\` from the closed catalogue of the specification. Read the \`code\`, not the message. |`
- Repasser ensuite `checkPublicText` sur les deux lignes. Le commentaire `apps/site/app/how/page.tsx:56` (« AttestedBook is the SIXTH frozen schema ») est un commentaire de code, non rendu : on peut le laisser.

### D-2 (mineur) : le skill ne mentionne pas l'exception `btc-dir-15m`

- `btc-dir-15m` entre dans le motif cité, mais BYO y répond `byo_overrides_committed`, et `BTC-DIR-15M` répond `byo_lookalike_committed` (mesuré). La note §2.13 nomme cette exception. La phrase reste vraie au sens où le nom est refusé, mais le code cité n'est pas le seul. Correctif facultatif, en fin de phrase : « it is refused (`byo_reserved_kata`; the retired `btc-dir-15m` keeps its own refusal). »

### Rappel

N-5 (UKEMI-COURSE-DIGEST-PIN-1) et M-3 (le `COMMENT` de `sync-ukemi-served.mjs`) sont correctement renvoyés à MONARK et à l'après-T0 dans le G7. Ils ne bloquent pas.
