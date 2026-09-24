# MESURES — Cartographie de branchement temps 1 (BASELINE) — commandes rejouables

> Worker Opus 4.8 epingle. **Modele resolu (R-1)** : `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8`, effort max ; Opus 5 banni).
> Lecture seule de `F:\Monark` ; ecriture UNIQUEMENT sous `F:\tmp\carto-t1\` ; aucun commit (R-20) ; aucun reseau.
> Chaque chiffre du fichier `CARTOGRAPHIE-TEMPS-1-BASELINE.md` renvoie a un M-n ci-dessous. Aucun chiffre de seconde main.

## M-0 — Provenance (baseline epinglee)
```
$ git rev-parse HEAD                 -> 4d2efad6c219466b22f41d91a407fd14dc097c40   (short 4d2efad)
$ git rev-parse --abbrev-ref HEAD    -> lot/etude-suite
$ git status --porcelain | wc -l     -> 0            (arbre propre : le code mesure EST 4d2efad)
$ date -u '+%Y-%m-%dT%H:%M:%SZ'      -> 2026-09-21T20:33:06Z
$ node --version                     -> v24.15.0
```
**Avance de HEAD en cours de session (fait mesure, R-21).** HEAD au demarrage = `b38a399` (mission) ; HEAD a la mesure = `4d2efad`.
```
$ git merge-base --is-ancestor b38a399 HEAD ; echo $?   -> 0   (HEAD descend de b38a399 ; "HEAD >= b38a399" TENU)
$ git log b38a399..HEAD --oneline
  4d2efad TABLEAU: v2 mockups delivered with final logos (decision 120); 6 questions ...
  7c372f5 U-4b-1b prereg CANDIDATE persisted (... commit of the real prereg ALONE after 2b-ii + 2b-iii merge ...)
  3491975 Decision 122: acceleration ... Bell 1b starts right after 2b-ii merge ...
  c0515d8 TABLEAU: 7 agents in flight ...
$ git diff --stat b38a399 HEAD
  docs/CHANTIERS.md | 7 +  ; docs/CONSIGNE-STANDARD-G1.md | 43 + ; docs/PLAN-u4b-prereg.CANDIDAT.md | 257 + ;
  docs/PLAN-u4b-prereg.DRAFT.md | 306 - ; docs/PLAN-u4b-prereg.MESURES.md | 70 + ; docs/TABLEAU-DE-BORD.md | 11 +-
  6 files changed, 383 insertions(+), 311 deletions(-)
$ git diff --name-only b38a399 HEAD -- apps/sentinel apps/bell apps/harness packages scripts test apps/site/lib apps/site/components apps/site/app deploy
  (VIDE : 0 fichier de CODE du perimetre modifie)
```
=> Les 4 commits b38a399..4d2efad sont **docs-only** ; le graphe d'imports (derive du code) est **identique** a b38a399.
2b-ii/2b-iii ne sont **pas fusionnes** (commits 3491975/7c372f5 les nomment "after 2b-ii + 2b-iii merge") : la baseline est bien
**AVANT 2b-ii/2b-iii/course**. Decision 122 (acceleration, 4 leviers, aucun gate retire) est nouvelle et **code-inerte**.

**Ancres de citation.** Les **numeros de decision** (117-122) sont les ancres primaires (stables). Les `fichier:ligne` de code
(`.ts/.mjs`, tests) sont stables (0 code change). Pour les 2 docs edites dans les 4 commits (CHANTIERS, TABLEAU), les lignes citees
sont **verifiees a `4d2efad`** : `grep -n "Décision investisseur 118" docs/CHANTIERS.md` -> **549** ; `grep -n "E-5 (VPS site"
docs/TABLEAU-DE-BORD.md` -> **39** ; `grep -n "Upcoming until served" README.md` -> **117** (edits additifs : decision 122 appendue
en 607, entete TABLEAU l.3 — les ancres citees n'ont pas bouge).

## M-1 — Grapheur d'imports statiques (script rejouable)
```
$ cd F:/tmp/carto-t1 && node carto.mjs F:/Monark F:/tmp/carto-t1
repoRoot=F:/Monark
files_scanned=319
packages_mapped=11 [@monark/atelier, @monark/bell, @monark/contracts, @monark/harness, @monark/hikae, @monark/monark,
                    @monark/rpc-guard, @monark/sentinel, @monark/site, @monark/ukemi, monark]
internal_edges_distinct=846
internal_edge_kinds={"import":655,"import-type":126,"export-from":38,"export-type":26,"dynamic-import":1}
unresolved_internal=2 (rows in unresolved.tsv)
external_import_sites=712 distinct_external_specs=34
wrote: edges.tsv nodes.tsv unresolved.tsv
```
Methode du grapheur (dans l'entete de `carto.mjs`) : scan `.ts/.tsx/.mts/.mjs/.js/.cjs` sous le depot, EXCLUANT
`node_modules/ .next/ out/ .git/` et les declarations `*.d.ts/*.d.mts/*.d.cts` ; **strip des commentaires bloc+ligne
AVANT extraction** (le validateur G0-2b-ii a attrape 3 faux "importeurs" qui etaient des commentaires ; `@monark/y` ne vit
que dans un bloc JSDoc de `test/deps-hygiene.test.ts`) ; 5 genres d'aretes {import, import-type, export-from, export-type,
require, dynamic-import} ; resolution INTERNE seule (relatif ; `@monark/<pkg>` via `package.json` name->dir, `exports["."]`
= `./src/index.ts` partout ; alias `@/`->`apps/site/`) ; une ligne par (source, cible, genre) + un compteur d'occurrences.

## M-2 — Manifeste sha256 des artefacts (ancre du diff de cloture)
```
$ sha256sum carto.mjs edges.tsv nodes.tsv unresolved.tsv
8bc5fd4f422f9d4ec2ef72a63927ed8b0eee29ffe010990f5fc9c234032f7632 *carto.mjs
93997e09b27eb104530f15ae3d1fd867c776a3ddcd8bce230e7226ab6e879488 *edges.tsv
d84b3c41f6dbb82ab9aa8b8cbb948a4fa1f604bda871caa2747e2b875b47756f *nodes.tsv
f5d6675de462484266d6a20f764f7c1accdd00f8c75175a4a4c7fbbe18d35c02 *unresolved.tsv
```
A la cloture : re-executer `node carto.mjs F:/Monark <out>` sur le HEAD de cloture, puis `diff edges.tsv` — tout ecart d'arete
est un delta de branchement a expliquer.
**Determinisme verifie** : re-execution vers `F:/tmp/carto-t1/_repro` puis `diff -q` sur les 3 TSV = **IDENTICAL** pour les 3
(edges/nodes/unresolved) ; `_repro` supprime apres verification (rien ne subsiste hors des 6 livrables).

## M-3 — Aretes non resolues (tout est audite, rien de masque)
```
$ cat unresolved.tsv
source                     specifier            kind    reason               count
apps/site/app/layout.tsx   ./globals.css        import  unresolved-relative  1
eslint.config.mjs          ./lint-ratchet.json  import  unresolved-relative  1
```
Les 2 sont des ASSETS non-code (CSS, JSON), pas des modules — attendu. `@monark/y` (cite `deps-hygiene.test.ts:11-12`) est
**absent** (correctement retire comme commentaire). 34 specificateurs externes (node:*, react, next, ajv, @modelcontextprotocol/server,
@base-ui/react/*, lucide-react, clsx, class-variance-authority, tailwind-merge, typescript, typescript-eslint, next/font/google, @next/mdx)
= dependances hors depot, jamais des aretes internes.

## M-4 — rpc-guard : consomme UNIQUEMENT par ses propres tests (fait porteur pour la regle Branchement)
```
$ grep -P "^(packages/rpc-guard/src/index\.ts)\t" nodes.tsv
path                              product     role  out  in  in_from_src  in_from_test
packages/rpc-guard/src/index.ts  ukemi-guard src   9    9   0            9
$ grep -P "\tpackages/rpc-guard/src/index\.ts\t" edges.tsv   # tous les importeurs
  packages/rpc-guard/test/{caps,client,error-hint,exports,ledger,lock,multi-operator,reconcile,tariff}.test.ts  (9 test files)
```
`in_from_src=0` : AUCUN fichier `apps/*/src` ou `packages/*/src` n'importe le paquet a la baseline. Consommateur = tests seuls
=> **fixture/upcoming** (ADR-M018 D1(b)). Concorde avec ADR-GARDE-HELIUS "upcoming en 1a" et TABLEAU "paquet upcoming jusqu'a 2b".

## M-5 — Ukemi ENGINE (packages/ukemi) : consomme par la surface servie `cascade`
```
$ grep -P "^packages/ukemi/src/index\.ts\t" nodes.tsv
  packages/ukemi/src/index.ts  ukemi-engine  src  4  8  in_from_src=1  in_from_test=7
$ grep -P "\tpackages/ukemi/src/index\.ts\t" edges.tsv
  apps/harness/src/tools/cascade.ts   packages/ukemi/src/index.ts   import       1   <- SEUL consommateur src (outil MCP servi)
  apps/harness/src/tools/cascade.ts   packages/ukemi/src/index.ts   import-type  1
  apps/harness/test/cascade.test.ts + 6 tests packages/ukemi/test/*
```
Le seul consommateur `src` est l'outil MCP `cascade` (`apps/harness/src/tools/cascade.ts`) => chemin **servi** => **cable**.

## M-6 — Ukemi RECORDER (apps/sentinel/src/ukemi/record.ts) : consomme par tests + scripts de course, aucun chemin servi
```
$ grep -P "^apps/sentinel/src/ukemi/record\.ts\t" nodes.tsv
  apps/sentinel/src/ukemi/record.ts  ukemi-recorder  src  6  7  in_from_src=3  in_from_test=4
$ grep -P "\tapps/sentinel/src/ukemi/record\.ts\t" edges.tsv
  apps/sentinel/test/{ukemi-record,ukemi-u4-governance,ukemi-u4a,ukemi}.test.ts        (4 tests)
  scripts/census/u4-oracle-path.mjs | u4-probe.mjs | u4-redraw.mjs                      (3 scripts de course/sonde)
```
Les 3 "in_from_src" sont des SCRIPTS de course (`u4-*`), pas une surface servie => recorder = **upcoming** (AttestedBook servi a U-6).
Le recorder N'IMPORTE PAS `@monark/rpc-guard` a la baseline (confirme 2b-ii non fusionne) :
```
$ grep -P "^apps/sentinel/src/ukemi/record\.ts\t" edges.tsv | grep rpc-guard   -> (VIDE)
```

## M-7 — Chemins PAYANTS : lectures de cle (motif etendu C-1-c) dans le CODE (hors tests)
```
$ grep -rnE "(HELIUS|CHAINSTACK|POLYGON|DATABENTO)_[A-Z_]*" apps packages scripts --include=*.ts --include=*.mts --include=*.mjs \
    | grep -vE "/test/|\.test\.|\.d\.mts" | grep -E "process\.env|env\.|env\[|in env|env\)"
  packages/rpc-guard/src/transport.ts:68   const key = env.HELIUS_API_KEY;
  packages/rpc-guard/src/transport.ts:73   const chainstackUrl = env.CHAINSTACK_ETH_URL;      (:72 = COMMENTAIRE)
  apps/sentinel/src/rpc.ts:54              const u = env.CHAINSTACK_ETH_URL?.trim();
  apps/sentinel/src/ukemi/record.ts:328    const archiveEnvUrl = deps.env.CHAINSTACK_ETH_URL;
  scripts/census/u3-realized.mjs:273       const ENV_ARCHIVE = process.env.CHAINSTACK_ETH_URL;
  scripts/census/u4-oracle-path.mjs:55     const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  scripts/census/u4-probe.mjs:67           const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  scripts/census/u4-redraw.mjs:83          const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
  apps/bell/src/collect.ts:582             const polygonKey = deps.env.POLYGON_API_KEY ?? "";
  apps/bell/src/collect.ts:583             const databentoKey = deps.env.DATABENTO_API_KEY ?? "";
  apps/bell/src/universe-cli.ts:111/297/312  CHAINSTACK_SOLANA_URL
```
Sorties reseau (`fetch(`) correspondantes (hors tests) :
```
$ grep -rnE "fetch\(|undici|http\.request" apps/sentinel apps/bell packages/rpc-guard scripts/census --include=*.ts --include=*.mjs | grep -vE "/test/|\.test\."
  packages/rpc-guard/src/transport.ts:162 ; apps/sentinel/src/rpc.ts:125 ; apps/sentinel/src/ukemi/record.ts:92 ;
  scripts/census/u3-realized.mjs:292 ; scripts/census/{aave-liquidations:122, burns-by-burner:106} (KEYLESS: pas de cle) ;
  apps/bell/src/{close.ts:176,:191 ; collect.ts:284 ; ethereum.ts:64 ; rpc.ts:44 ; universe-cli.ts:267,:281}
```
Classement (etat "sous garde / hors garde accepte (118) / hors garde non accepte") : cf. CARTOGRAPHIE §3.

## M-8 — Definition de "sous garde" a la baseline : la garde CI `fetch_only_inside_client`
Fichier `test/rpc-guard-fetch-only-inside-client.test.ts` (lu [lu]) :
- **Portee declaree** (l.8-9) : `apps/bell/src/**` + `packages/*/src/**`, EXCLUANT `test/`. **N'INCLUT PAS** `apps/sentinel/src/**`
  ni `scripts/**` a la baseline.
- **Allowlist** (l.36) = EXACTEMENT `packages/rpc-guard/src/transport.ts` (le transport prive).
- Test ACTIF `rpc_guard_package_src_clean_and_allowlist_load_bearing` (l.68) : `packages/*/src` propre hors allowlist (VERT) +
  allowlist porteuse (vider l'allowlist rougit).
- Test **SKIP** `fetch_only_inside_client` (l.79) : portee complete apps/bell+packages ROUGE (14 hits mesures dans apps/bell/src,
  entete l.18-24, base 514ee1a), **skip-until-1b** (GARDE-HELIUS-1b migre Bell dans le client). Motif KEY (l.38) =
  `\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b`.
- Note de derive : mes lignes mesurees (M-7, HEAD 4d2efad) different de l'entete du test (base 514ee1a) — code edite depuis
  (`collect.ts:583/584`->`582/583`, `universe-cli.ts:109/237/251`->`111/297/312`). Je cite MES lignes (premiere main).

## M-9 — `u3-realized.mjs` DEPENSE reellement sur la jambe payante
`scripts/census/u3-realized.mjs` (lu) : `:273 const ENV_ARCHIVE = process.env.CHAINSTACK_ETH_URL` puis
`:274 const CALL_EPS = [...(ENV_ARCHIVE ? [ENV_ARCHIVE] : []), ...PUBLIC_ENDPOINTS]` et `:292 res = await fetch(url, ...)` dans
`callOn` (section "LIVE PULL (run-guarded main). Everything below touches the network"). Donc si `CHAINSTACK_ETH_URL` est pose,
la jambe archive-env est appelee HORS garde. Non nomme par 2b-iii (C-9 ne nomme que `u4-oracle-path`/`u4-redraw`).

## M-10 — Surface servie MCP : 4 outils {attest, gate, cascade, calibrate}
`apps/harness/src/tools/registry.ts` (lu) : `ALLOWED_TOOL_NAMES = ["attest","gate","cascade","calibrate"]` (l.32) ;
`HARNESS_TOOLS` (l.58) = les 4 ; oracle K-8 asserte l'ensemble EXACT. Aucun `node:fs/net/child_process/fetch/process.env`
sous `src/tools/**` (entete). C'est la seule surface servie du perimetre (+ les fichiers publies /narabi/, M-12).

## M-11 — Portes CI et emplacement des tests d'integration
`package.json` scripts (lu) : `ci` = `gate:vocab && typecheck && test` ; `test` = `node --test` sur
`test/*` `packages/*/test/*` `apps/harness/test/*` `apps/sentinel/test/*` `apps/bell/test/*`.
`.github/workflows/ci.yml` (lu) : jobs `g1-controle-generation`, `r25-taille-de-lot` (porte aussi `lang:gate`+`export:check`,
l.94/96), `g3-verification` (`npm run ci`), `g4-architecture` (eslint + ratchet), `g6-compliance` (SBOM + audit),
`g3-site` (`next build` typecheque apps/site + `assert-fleet-html.mjs`). Les tests d'integration nommes (narabi_live_*,
gate_stable_run_*, probe_harness_records_real_decision) tournent en `g3-verification`.

## M-12 — Chaine d'EXECUTION Narabi (flux, pas import) — lue dans les fichiers de deploiement
- `deploy/monark-sentinel.service` : `ExecStart=/usr/bin/env node /opt/monark-harness/apps/sentinel/src/run.ts` (Type=oneshot) ;
  `EnvironmentFile=-/etc/monark/sentinel.env` (CHAINSTACK optionnel) ; `ReadWritePaths=/var/lib/monark-sentinel`.
- `deploy/monark-sentinel.timer` : 4 creneaux `OnCalendar=*-*-* {00,03,06,09}:30:00 UTC` + `RandomizedDelaySec=1800` + `Persistent=true`.
- `deploy/Caddyfile.monark-narabi.snippet` : `handle_path /narabi/* { root * /var/lib/monark-sentinel/public ; file_server }`
  => sert `state.json` + `timeline.jsonl`.
- `apps/site/lib/narabi-live.ts` : `STATE_PATH="/narabi/state.json"`, `TIMELINE_PATH="/narabi/timeline.jsonl"`, `NARABI_ROUTE="/narabi"` ;
  `loadNarabi` fetch les fichiers live (meme origine) avec repli sur le snapshot committe (`narabi-snapshot.ts`), declare.
- `run.ts` : `in_from_src=0` dans nodes.tsv => point d'entree (consomme par systemd, arete d'EXECUTION, jamais par import).

## M-13 — Etats REVENDIQUES par les registres (lus)
- `README.md` : tableau des couches (l.38-43) "Backbone Built ; Fleet 4 built - Narabi runs - 7 named ; Harness Built ;
  Self-improving Direction" ; 4 built {Shogen, Hikae, Ukemi} + Narabi runs (l.47-84) ; **AttestedBook "upcoming until served
  (schema frozen; the served path is wired at U-6)"** (l.117) ; 0 mention Bell/Kane (verifie Bell passe2).
- `apps/site/lib/fleet.ts` (lu) : `FLEET_AGENTS` = 4 built {Shogen(:116), Hikae(:131), Ukemi(:153), Narabi(:176)} chacun avec
  `wiring{served_by, integration_test[], note}` ; 7 upcoming {Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan} ;
  `PRODUCTS` = 5 upcoming {Firebreak, Warden, Softlanding, Verdict, Ballast}. `UpcomingFleetAgent.wiring?: never` (l.72) =>
  tout wiring sur un upcoming = erreur TS. Gele par `fleet_register_built_set_is_frozen`. **0 Bell/Kane.**
- `skills/monark/SKILL.md` / README : outils = {attest, gate, cascade, calibrate} = exactement M-10.
- ADR "Tuyaux" (lus) : ADR-NARABI-OPS-1 (6 tuyaux, built/deploye c0027cb ; TimeoutStartSec wired a E-5) ;
  ADR-U4b (score-code gele "-1a upcoming, consomme par un test seul" ; region servie "built ssi -2" ; cascade retrait "-2") ;
  ADR-GARDE-HELIUS (client "upcoming en 1a, aucun consommateur servi tant que 1b/2 ne le branche" ; compo servie reconcile/unlock
  prouvee par test non-LLM via `runCli` = tests internes du paquet).
- `docs/TABLEAU-DE-BORD.md` : Narabi "en production (E-5 deploye c4981d0, premier run reel 22/09 00:41 pending)" ;
  Ukemi U-4b "-1a fusionne 006da8f", 2b-ii "MIGRATION a lancer" ; Bell "temps 2, reste upcoming au temps 1".

## M-14 — Comptes de noeuds par produit (etiquette de regroupement ; le chemin reste autoritaire)
```
$ tail -n +2 nodes.tsv | cut -f2 | sort | uniq -c | sort -rn
  69 site  39 bell  32 test-root  24 hikae  23 harness  22 ukemi-guard  16 contracts  15 ukemi-recorder
  15 shared-tooling  14 other  12 ukemi-engine  10 narabi  10 monark-adapters  9 ukemi-scripts  8 atelier  1 narabi-scripts
                                                                                            (total 319)
```

## M-15 — Aretes inter-produits (source hors-test seulement) — matrice de couplage
```
$ awk -F'\t' 'NR==FNR{if(FNR>1){p[$1]=$2;r[$1]=$3}next} FNR>1&&r[$1]!="test"{print p[$1]" => "p[$2]}' nodes.tsv edges.tsv | sort | uniq -c | sort -rn
  158 site=>site  67 bell=>bell  44 hikae=>hikae  30 ukemi-guard=>ukemi-guard  22 harness=>harness  21 ukemi-scripts=>ukemi-recorder
  15 narabi=>narabi  13 contracts=>contracts  11 ukemi-recorder=>ukemi-recorder  10 monark-adapters=>monark-adapters  9 ukemi-engine=>ukemi-engine
  9 hikae=>contracts  9 atelier=>atelier  8 harness=>contracts  6 bell=>narabi  5 shared-tooling=>narabi  5 narabi=>hikae
  4 monark-adapters=>contracts  4 harness=>hikae  3 ukemi-scripts=>narabi  3 harness=>monark-adapters  2 ukemi-recorder=>narabi
  2 ukemi-engine=>contracts  2 harness=>ukemi-engine  1 narabi=>monark-adapters  1 narabi=>harness  1 bell=>ukemi-recorder ...
```
**Aucune ligne `* => bell`** (hors `bell=>bell`) : rien hors Bell n'importe Bell.
```
$ grep -P "\tapps/bell/" edges.tsv | grep -vP "^apps/bell/" | wc -l   -> 0   (Bell = puits pur => upcoming)
```
Couplage Bell->sentinel (Bell consomme sentinel, jamais l'inverse) : `apps/bell/src/{collect,operators,quorum,rebase-*}.ts ->
apps/sentinel/src/rpc.ts` ; `apps/bell/src/ethereum.ts -> apps/sentinel/src/ukemi/rpc2.ts` (**site de la ripple R-D 2b-ii**, `ethereum.ts:67`).

## M-16 — Sous-graphes src->src par produit (rendus en Mermaid dans la CARTOGRAPHIE ; extraits d'`edges.tsv`)
- Narabi : `grep -P "^apps/sentinel/src/[^/]+\.ts\t" edges.tsv` (run->flow/rpc/timeline/windows ; flow->rpc/windows/@contracts/@monark ;
  instrument->edetector/flow/timeline/@hikae ; timeline->@hikae + **apps/harness/src/calibration.ts** [constante servie USDE_STABLE_RUN_CALIB]).
- Ukemi recorder : `grep -P "^apps/sentinel/src/ukemi/" edges.tsv` (record->rpc/abi/book/clusters/resume/rpc2 ; book->abi/clusters/rpc2/wadray/@monark ;
  rpc2->rpc ; resume->abi/rpc2).
- Ukemi engine : `grep -P "^packages/ukemi/src/" edges.tsv` (index barrel -> clearing/lattice/liquidable/prediction).
- rpc-guard : `grep -P "^packages/rpc-guard/src/" edges.tsv` (index re-exporte 9 modules ; guarded->client/ledger/lock/transport ;
  transport->classify/errors/tariff ; classify->errors).
- Score-code gele Ukemi : `u4b-reduce->u4b-scores` ; consommateurs = `ukemi-u4b-scores.test.ts` (test) => upcoming.
