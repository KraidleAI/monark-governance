# G2 du lot T0-TOOLING-1 (parties a et b), relecture adverse

- **Arbres lus** : `-a` `fffb07fe` (diff `597a986d..04c3a76a`), `-b` `17e2594a` (diff `04c3a76a..1981d9a2`, plus le G7 `5a9d1d25`). Worktree le worktree du lot laissé intact : même `HEAD` (`17e2594a`), même branche, même `git status --ignored`, sha256 de ses 2 286 fichiers identiques avant et après.
- **Méthode** : lecture du code ; Node 24.21.0, proxys retirés pour les tests ; aucun appel réseau, aucun hôte réel. Le harnais tourne en processus sur la boucle locale ; le registre MCP est une donnée locale ; `fetch` est redirigé par un module de préchargement local (`g2tool/mock.mjs`). Les fichiers temporaires sont sous `g2tool/` ; worktrees de travail retirés à la fin ; seul le serveur que j'ai lancé a été arrêté.

## Verdicts

| Partie | Verdict | Motif |
|---|---|---|
| **a** (`recherches/t0-tooling-1-a`) | **non bloquant** | CA, refus d'option, `ph`, M-3 et m-a tiennent, et leurs tueurs sont tués. Restent deux trous de la classe m-b (N-1, N-2) et une écriture `--out` sur une passe `http` (N-3). |
| **b** (`recherches/t0-tooling-1-b`) | **non bloquant** | Promotion répétée de bout en bout par les vrais `main()` des synchros, sur un clone avec `.git` : `test:main` vert, aux 3 rouges connus de l'hôte près. Les épingles dérivées rougissent dans les deux états. Restent une promotion interrompue qui exige un `rm` à la main (N-4), un test de runbook trop lâche (N-5) et une liste `git add` incomplète (N-6). |

Les N sont des corrections courtes. Je recommande de les faire avant T0, au nom de la consigne « sans dette » ; aucune n'empêche T0 de réussir.

---

## 1. Preuves positives (mesurées)

### 1.1 Répétition de la promotion (clone `g2tool/reh`, `.git` complet, `17e2594a`)

1. **CA** : `verify-harness.mjs --api http://127.0.0.1:47201 --mcp … --api-host api.monarkgate.tech --out …`. Résultat : sortie 0, 15/15. Les URL et le bloc TLS ont ensuite été réécrits en `https` avec `authorized: true`, comme au G7.
2. **Synchro du harnais** : `node --import mock.mjs scripts/sync-harness-served.mjs`, le vrai `main()`, avec toutes ses gardes. Sortie 0. La promotion est faite, l'entrée `harness-pending` est retirée, l'entrée du servi est posée, le manifeste reste canonique.
3. **Synchro Narabi** : sortie 0, entrée posée.
4. **Synchro ukemi** : le vrai `main()` passe `promotionBlocked`, puis `setManifestEntry` et `removeManifestEntry` sur le manifeste écrit par la synchro du harnais. Sortie 0. **La garde ukemi accepte le manifeste.**
5. **Ré-épinglage** : `repin-served.mjs` réécrit la ligne et retire la ligne en attente ; `--check` rend 0.
6. **Fichiers changés** : exactement les 8 chemins du `git add` de l'acte 6. Le commit est local, dans le clone seulement.
7. **Tests T0** sur l'arbre promu : 8 fichiers (`harness-served`, `site-send-guard`, `release-public-flow`, `narabi-live`, `site-ukemi`, `surfaces-1-1-0`, `verify-harness-liq`, `public-text-deny`), **117/117 verts**.
8. **`test:main`** sur l'arbre promu, avec `.git` : **2 706 tests, 2 681 verts, 22 sautés, 3 rouges**. Ce sont les 3 rouges connus de l'hôte : `sentinel_sigterm_*` ×2 et `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`. Les tests qui lisent git sont tous verts (mutants, R-25, missions). Le G7 n'avait pas pu les faire tourner sur sa copie sans `.git`. `gate:vocab` est vert. `git status` est propre après la suite : **aucun test n'écrit dans l'arbre**.

### 1.2 Épingles dérivées : un fichier altéré rougit dans les deux états

Matrice sur `harness-served.test.ts` (22 tests). Chaque altération re-hache le manifeste, pour que seul le contenu change.

| Cas | État | Rouges |
|---|---|---|
| P1 : sha `/gate` du servi altéré | en attente | `listed_and_hash_pinned`, `matches_deploy_ca`, `repin_served…` |
| P2 : `openapi_sha256` de l'instantané en attente altéré | en attente | `pending_bodies…`, `matches_in_process_harness`, `pending_sync…`, `listed…`, `repin…` |
| P3 : instantané en attente absent (fichier et entrée) | en attente | 13 rouges (loaders, `byo_loop`, `pages_render…`) : **un instantané manquant n'est pas masqué** |
| P4 : P1 puis `repin-served` (ré-épinglage complaisant) | en attente | `matches_deploy_ca` |
| P5 : P2 puis `repin-served` | en attente | `pending_bodies…`, `matches_in_process_harness`, `pending_sync…` |
| R1 : sha `/gate` du servi altéré | promu | `listed…`, `matches_deploy_ca`, `pending_bodies…`, `repin…` |
| R2 : R1 puis `repin` | promu | `matches_deploy_ca`, `pending_bodies…` |
| R3 : R1, puis CA alignée sur le faux sha, puis `repin` | promu | `pending_bodies_are_pinned_byte_for_byte` (`bodiesAgree`) |
| R4 : sha `/openapi.json`, puis CA, puis `repin` | promu | `pending_bodies…`, `matches_in_process_harness`, `pending_sync…` |

`ensurePendingSnapshot` n'écrit que dans la copie temporaire (`src` sous `mkdtemp`), et `stage` et `stageCanonical` aussi. Un instantané réellement manquant avant T0 rougit déjà ailleurs (P3). Ce helper ne masque donc rien en CI.

### 1.3 Tueurs tirés à la main (appliqués, lancés, restaurés, sha256 du fichier identique après)

| Tueur | Test | Résultat |
|---|---|---|
| `verify-harness.mjs:390` `args.out && failed.length === 0` → `args.out` (a) | `verify_harness_out_is_written_only_when_every_check_passes` | tué, restauré |
| `public-text-deny.mjs:125` motif rendu inerte (a) | `public_text_gate_refuses_an_unfilled_marker` | tué, restauré |
| `sync-harness-served.mjs:198` SDL (retrait de l'entrée en attente) (b) | `harness_sync_promotion_rewrites_the_manifest` | tué, restauré |
| `export-public.mjs:517` `if (blockers.length)` → `if (false)`, **sur l'arbre promu** (b) | `site_send_refused_while_a_pending_snapshot_exists` | tué, restauré |
| `sync-narabi-served.mjs:134` SDL (b) | `narabi_sync_sets_its_manifest_entry` | tué, restauré |

### 1.4 Autres mesures

- **R-25**, remesuré avec le pathspec exact de `ci.yml` :
  - `-a` : `8aea2299...fffb07fe` donne **155** (+129 −26). `597a986d...04c3a76a` donne la même valeur.
  - `-b` : `fffb07fe...17e2594a` donne **466** (+381 −85), comme `04c3a76a...1981d9a2`.
  - Les deux valeurs du G7 sont confirmées. Le lot entier contre `8aea2299` compte 621 (voir M-9).
- **Portes de `-b`** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `export:check` OK, `lang:gate` OK, `gate:vocab` OK.
- **Tests touchés de `-a` seul** (`verify-harness-liq`, `public-text-deny`, `surfaces-1-1-0`, `site-ukemi`) : 61/61.
- **Règle `ph`** :
  - 0 refus sur les 6 fichiers de `docs/public-notes/**`, qui couvrent les genres `notes`, `message` et `issue`, donc aussi les deux messages de miroir `v0.7.0` et `v0.8.0` ;
  - 0 refus sur 45 entrées de `spec-publish` : `kata-wave1` (KATA-SPEC, `vectors.json`, rapport) et `contract-1.1.0` (CONTRACT-1.1.0, `vectors-1.1.0.json`, les tables `spec/contract-1.1.0/policy/*.json` du worktree `monark-governance-spec` `f9290ecc`). **La règle ne casse donc pas l'acte 8** ;
  - la NOTICE brute est refusée, la NOTICE remplie passe (`ok: true`, 0 violation).
- **Manifeste** :
  - canonique après chaque écriture ;
  - une resynchro ne change que l'entrée du servi (le `read_at` est neuf) ;
  - Narabi est idempotent : la seconde passe rend « unchanged » ;
  - `--pending` sur un arbre promu repose les deux entrées à leur place de famille, et le manifeste reste canonique.
- **Windows** :
  - `.gitattributes` impose `* text=auto eol=lf` : le manifeste et `test/harness-served.test.ts` sont extraits en LF partout ;
  - les écrivains écrivent du LF, `lfSha` normalise les CRLF, et `repinText` aussi ;
  - les chemins passent par `join` ;
  - aucun renommage n'est utilisé, donc aucune question de renommage atomique ne se pose. C'est aussi la limite décrite en M-1 et N-4.

---

## 2. Constats

### Partie a

**N-1. `--out ""` (valeur vide) est accepté : aucun enregistrement, ni `--out` ni `.failed`.**
- *Preuve* :
  - `parseArgs(["--out",""])` rend `out: ""` ;
  - la passe rouge `--api http://127.0.0.1:1 … --out ""` sort en 1, et le répertoire reste vide ;
  - une passe verte sortirait 0 sans rien écrire : c'est exactement le défaut m-b, une faute de frappe qui « tourne sans être vue » (ex. `--out "$CA"` avec `CA` vide). `--out " "` écrit un fichier nommé « espace ».
- *Correction* : dans `parseArgs`, refuser une valeur vide ou faite d'espaces (`value.trim() === ""`), avec « option --out needs a value », sortie 2. Ajouter le vecteur `[..., "--out", ""]` à `verify_harness_refuses_an_unknown_option`.

**N-2. Une option répétée gagne en silence la dernière.**
- *Preuve* : `["--out","a","--out","b"]` rend `out: "b"`, et `["--api","http://x","--api","http://y"]` rend `api: "http://y"`.
- *Correction* : refuser la répétition (`if (seen.has(flag)) throw new Error(\`option ${flag} given twice\`)`), sortie 2, avec un vecteur de test.

**N-3. Une passe verte en `http` (TLS sauté) écrit `--out`.**
- *Preuve* :
  - `verify-harness.mjs:388-390` : `failed` n'ajoute `tls` que si le protocole est `https:`. Mesuré : `--api http://127.0.0.1:47201 … --out X` écrit X, puis « VERIFY OK … (TLS skipped) » ;
  - l'item 1 dit « TLS compris ». Une passe locale avec `--out docs/deploy-CA-harness.json` écrase la dernière CA verte `https`. La synchro la refuse ensuite (fail-closed), mais la CA verte est perdue jusqu'à une nouvelle passe ;
  - le G7 décrit ce comportement sans le corriger.
- *Correction* : n'écrire `--out` que si `tls.authorized === true`. Une passe `http` verte écrit `<out>.failed`, ou un `<out>.local`, ignoré lui aussi. Adapter `verify_harness_out_is_written_only_when_every_check_passes` : la passe verte locale vérifie alors `.failed` ou `.local`, et `--out` intact.

**M-1. `--out` est écrit en place (`writeFileSync`), sans fichier temporaire ni renommage.** Une interruption en pleine écriture tronque la dernière CA verte. *Correction* : écrire `<out>.tmp`, puis `renameSync(<out>.tmp, <out>)`. Sous Windows, `rename` remplace ; prévoir une relance bornée sur `EPERM` ou `EBUSY`.

**M-2. `*.failed` est un motif global.**
- *Preuve* : l'export ne filtre les fichiers ignorés que sous `apps/site` (`export-public.mjs:387`). Un `--out fixtures/x.json` (ou `schemas/`, `skills/`) rouge laisserait `x.json.failed`, qui serait exporté.
- *Correction* : restreindre le motif à `docs/*.failed`, et refuser un `--out` hors de `docs/`, ou ajouter `\.failed$` à `STRUCTURAL_BLACKLIST`.

**M-3. Les contrôles par `fetch` n'ont pas de délai** (`httpCheck`, `verify-harness.mjs:141-150`).
- *Preuve* : contre un port qui accepte sans répondre, la passe tournait encore à 8 s (tuée par `timeout`) ; `--out` est resté intact (sha256 identique). Seuls `wiredRequest` et TLS ont 10 s. Les synchros ont `AbortSignal.timeout(30_000)`.
- *Correction* : `fetch(url, { ...init, signal: AbortSignal.timeout(30_000) })`. Ce point est antérieur au lot, mais le chantier visait les chemins « délai ».

**M-4. `ph` ne nomme qu'un marqueur par ligne, et certaines formes voisines passent.**
- *Preuve* :
  - sur la NOTICE brute, la l.3 ne rapporte que `{T0}`, pas `{OPENAPI_SHA256}` ;
  - passent : `{ T0 }`, `{OPENAPI-SHA256}`, `{Τ0}` (tau grec), `{ScoresSha}`.
- *Correction* : soit le documenter dans l'en-tête (une violation par ligne et par règle, comme les autres règles), soit proposer à MONARK un acte V-3, `/\{\s*[A-Z][A-Z0-9_-]*\s*\}/` (`ph` est une règle de porte). Ne pas toucher sans acte.

### Partie b

**N-4. Une promotion interrompue laisse un état incohérent, avec un message faux. Une coupure au mauvais endroit exige un `rm` à la main.**
- *Preuve* : défaillance injectée par préchargement (`g2tool/inject.cjs`, `syncBuiltinESMExports`) dans le vrai `main()`.
  - **Écriture du manifeste en échec** :
    - le servi est déjà réécrit, l'entrée du manifeste est périmée (`match=false`) et le site refuserait de construire ;
    - le message dit « FAIL-CLOSED — … ; nothing written », ce qui est faux ;
    - une relance rattrape l'état.
  - **`rmSync(harness-pending.json)` en échec** (sous Windows, `EPERM` ou `EBUSY` par un antivirus ou un indexeur, plausible sur la machine de l'orchestrateur) :
    - le servi et le manifeste sont promus, mais le fichier en attente reste sans entrée ;
    - la relance refuse (« … has no entry in the manifest … remove apps/site/data/harness-pending.json »), et la synchro ukemi aussi (`promotionBlocked`) ;
    - seul un `rm` à la main débloque, contre la consigne « sans retouche à la main ».
  - `writeNarabiServed` et le `main()` d'ukemi ont le même ordre (servi, manifeste, `rm`) et le même défaut.
- *Correction* :
  1. écrire chaque fichier par `<f>.tmp` puis `renameSync`, le manifeste en dernier ;
  2. rendre la promotion reprenable : si le fichier en attente existe sans entrée, si le servi ne porte pas `pending_since` et si son entrée égale son sha LF, terminer en supprimant le fichier en attente ;
  3. corriger le message selon l'étape atteinte (« served written, manifest not »).

  Test : la même injection, sur l'arbre en attente, suivie d'une relance verte sans geste manuel.

**N-5. `srf_runbook_vitrine_t0_order` ne fige pas les commandes : 4 mutants sur 5 survivent.**
- *Preuve* : `RUNBOOK-vitrine.md` muté, test lancé, fichier restauré (sha256 identique). Survivent :
  - `apps/site/data/narabi-served.json` retiré du `git add` de l'acte 6 ;
  - l'acte 3 réécrit « avec `--pending` » ;
  - `--notes-file docs/public-notes/v0.9.0.commit.md` à l'acte 9 ;
  - `tar xzf - -C /opt/monark-app` à l'acte 1.

  Seul un drapeau ajouté **dans** l'empan de l'acte 2 (`--api http://…`) est tué.
- *Correction* :
  - figer, pour chaque acte, la liste exacte de ses empans de code (`deepEqual`) ;
  - dériver la liste `git add` des constantes des scripts (`OUT_REL`, `PENDING_REL` du harnais et d'ukemi, `MANIFEST_REL`, `CA_REL`, l'`OUT_REL` de Narabi, `PIN_TEST_REL`) ;
  - faire passer les arguments de chaque `node scripts/x.mjs …` par le `parseArgs` exporté du script quand il existe.

**N-6. Le `git add` de l'acte 6 omet le journal que l'acte 2 demande.**
- *Preuve* :
  - l'acte 2 demande `sha256sum docs/deploy-CA-harness.json`, à reporter dans `docs/JOURNAL-PROVENANCE.md` (`RUNBOOK-harness.md:216-219`) ;
  - l'acte 6 commite « un seul commit aux chemins explicites » sans ce fichier ;
  - un journal modifié et non commité salit l'arbre, et `release-public` (acte 9, `branchGuard`) refuse un arbre non propre.
- *Correction* : ajouter `docs/JOURNAL-PROVENANCE.md` à la liste de l'acte 6, ou dire que le journal se commite à part, avant l'acte 7. Le test de N-5 le fige.

**M-5. La synchro Narabi ne répare pas une entrée de manifeste périmée.** Son chemin « unchanged » (`sync-narabi-served.mjs:117-121`) sort sans comparer l'entrée au fichier. *Correction* : dans ce chemin, poser l'entrée si elle diffère du sha LF du fichier, ou le signaler avec `--check`.

**M-6. Commentaire déplacé dans `scripts/sync-ukemi-served.d.mts:49-51`.** La doc de `markPendingSince` est restée au-dessus de `writeUkemiPending`, qui en porte donc deux, et `markPendingSince` n'en a plus. *Correction* : remettre la ligne au-dessus de `markPendingSince`.

**M-7. M-b de la relecture n'est pas écrit dans l'ordre de T0.** Une CA relancée après les actes 3 à 5 oblige à relancer les trois synchros : `harness_served_data_matches_deploy_ca`, et le `read_at` d'ukemi doit être postérieur à `checked_at`. *Correction* : une phrase à l'acte 2 : « relancée après l'acte 3, refaire les actes 3 à 6 ».

**M-8. La liste des pages de la relecture (§3.4) n'est pas rattachée à l'acte 7.** L'étape 5 de la procédure ne contrôle que `/`, `/fleet` et `/narabi…`. *Correction* : à l'acte 7, renvoyer aux pages `/ukemi/course`, `/integrators`, `/docs/integrators`, `/how`, `/docs` et à leurs valeurs attendues.

**M-9. Ordre des PR (R-25).** `-b` mesure 466 contre `-a`, mais 621 contre `8aea2299`, au-delà de la borne de lot de 547. Sa PR doit donc s'ouvrir après la fusion de `-a` dans `lot/etude-suite`. *Correction* : l'écrire dans le G7 §4, ou dans la description de la PR `-b`.

### Reste de la relecture T0, hors de ce lot et toujours ouvert

Ce ne sont pas des constats de ce lot. Je les rappelle pour la consigne « sans dette » :
- B-1 : SPEC-1-1-0-RELEASE (worktree `-spec` en cours) ;
- M-e : bloc daté de `/integrators` ;
- M-f : montée de `HARNESS_VERSION` ;
- m-c : lecture `gh` avant le refus ;
- m-d : `docs/ETAT.md:81` liste encore RELEASE-PREFLIGHT-SEND-GUARD-1 dans « Reste avant T0 » ;
- m-f : TLS lu sur `api.` seulement. Avec N-3, la garde « TLS compris » ne couvre ni `mcp.` ni le mode `http`.

---

## 3. Fichiers de preuve (scratch)

- Répétition : `g2tool/reh` (clone, commit local `717e77f3`), `reh-t0tests.txt`, `reh-main.txt`, `reh-vocab.txt`.
- Préchargements : `mock.mjs` (`fetch` vers la boucle locale, registre local) et `inject.cjs` (échec injecté).
- Altérations : `tamper.sh`, `mut.cjs` ; portes de `-b` : `b-*.txt`.
- Instantané du worktree : `before-tree.sha` et `after-tree.sha` (identiques), `before-status.txt` et `after-status.txt` (identiques).
