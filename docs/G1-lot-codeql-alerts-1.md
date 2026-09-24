Modèle résolu : claude-opus-5-5[1m]

# G1 — LOT CODEQL-ALERTS-1 : remédiation des 25 alertes CodeQL ouvertes sur `main` (ADR-CODEQL-ALERTS-1 v2.1)

Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort `max` déclaré par la mission (non
mesurable de l'intérieur). Worktree `F:\Monark-wt-codeql`, branche `lot/codeql-alerts-1`, base `e7af51c` (ADR v2.1).
Aucun commit (R-20), aucun workflow déclenché. Artefacts hors dépôt : `F:\tmp\codeql-alerts-1\` (A-4). Horodatage UTC.

## Journal (date -u)

- ~02:58Z — début ; lus intégralement : `docs/adr/ADR-CODEQL-ALERTS-1.md` (v2.1, inventaire « nature réelle », D1-D6,
  C-V2-1..4), `docs/codeql/ALERTS-2026-09-24.md` (25 alertes), puis le code visé (liste de la mission) et
  `docs/CONSIGNE-STANDARD-G1.md` (A-1..A-13, D-1-bis).
- ~03:03Z — `npm ci --no-audit --no-fund` dans le worktree (jamais de jonction), exit 0, 283 paquets ; cache npm
  `F:\cache\npm` (rien sur C:) ; lockfile inchangé (`git status` vide après).
- 03:07:38Z — A-2 : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-codeql\packages\rpc-guard\src\index.ts` ;
  A-6 AVANT : 9/9 gelés U-4b identiques (tableau §A-6) ; sha AVANT des 13 cibles (§Fichiers).
- 03:08:18Z — ligne de base (AVANT toute modification) des tests ciblés : 214 tests, 214 pass, 0 fail
  (`baseline-targeted.tap`).
- 03:08:25Z — mesure D2 (R-21, non héritée du validateur) : 396 cas, 0 divergence (§D2).
- ~03:10Z — advisor intégré, 1ᵉʳ appel (après orientation, avant code) : recommande deux passes pour D3. 2ᵉ appel :
  le worker y soumet la divergence (passe unique, traces X1/X3 ANALYTIQUES, pas encore mesurées) ; la réponse porte
  sur la recherche de parseur (aucun parseur installé, ruling « maison » confirmé) et ne traite pas la divergence.
- 03:12Z D1 vert (32/32) ; 03:12:43Z D2 vert (46/46) ; 03:13:03Z D3 : test nouveau ROUGE sur l'ancien code (codé vers un
  rouge) ; 03:13:19Z sonde D3 sur l'ancien code ; 03:14:12Z D3 vert (11/11) ; 03:15:32Z D4 vert (40/40) ; 03:16:25Z D5
  vert (18/18) ; 03:16:32Z → 03:17:32Z six portes statiques exit 0 ; 03:18:16Z oracle ciblé 220/220 ; 03:24:03Z
  importeurs `rpc-guard` 186 pass / 1 skip win32 préexistant / 0 fail ; 03:24:12Z test 42 lancé (arrière-plan).
- ~03:28Z — F-2 : deux noms de tests nouveaux portaient un tiret cadratin (non-ASCII) → remplacé par ` - ` ; 0 caractère
  non-ASCII dans les lignes ajoutées (`git diff -U0 e7af51c | grep '^+' | grep -cP '[^\x00-\x7F]'` = 0).
- 03:28:27Z — test 42 (lancé 03:24:12Z) : 2/2. Aucun harnais n'a tourné pendant sa copie d'arbre (séquencement voulu).
- 03:29:0xZ → 03:29:50Z — harnais de mutants : 14/14 tués par le test visé, 0 autre rouge, 14/14 restaurations
  octet-exactes ; `git status` identique après, 0 fichier `.mut-tmp` résiduel.
- 03:30:44Z → 03:43:54Z — oracle final sur l'arbre final (§Oracle final) : 6 portes exit 0, ciblés 220/220, importeurs
  186/1 skip/0 fail, test 42 2/2 ; A-6 APRÈS 9/9 ; sha APRÈS relevés.
- ~03:45Z — advisor intégré, consultation de clôture (livrables durables) : aucun défaut de code ; D-1 confirmé (passe
  unique, sur la mesure X3) ; demandé : corriger le récit des appels advisor (fait ici et en D-1), ajouter R-f (mesuré
  03:48Z : DIFF fail-closed, §Résidus) et déclarer A-12 partiel (fait) ; sha du journal et `DELIVERED.sha256` régénérés.
  Aucune ligne de code modifiée après l'oracle final (seul ce journal a changé).
- **Pli G2** (mission orchestrateur reçue après la revue G2 ; même arbre, HEAD `e7af51c`, sans commit ; §« G2 pliée ») :
  ~04:50Z lecture du rapport `F:\tmp\codeql-alerts-1\g2\G2-report.md` et de ses artefacts ; ~04:52Z advisor intégré
  (plan du pli, avant code : vecteurs d'abord, `templateEnd` écrite par le worker, passe unique conservée) ;
  04:54:40Z copies lot-v1 des 6 fichiers à toucher (`pli\lotv1\`) ; ~04:55Z vecteurs T1-T3, Rd, GM4 et leurres suffixe
  écrits D'ABORD : ROUGE sur lot-v1 (T1 : `";</script>HIDDEN</template>VISIBLE`) ; ~04:56Z pli du scanner ; fichiers
  touchés verts 51/51 ; 04:57:49Z → 04:58:20Z énumération exhaustive contre oracle de référence ; 04:59Z → 05:00Z
  moniteur réseau auto-testé ; 05:00:38Z → 05:01:07Z `next build` hors réseau (0 connexion) ; 19/19 pages identiques,
  g3-site vert ; `.next` et `next-env.d.ts` (artefacts ignorés, créés par le build) retirés ; 05:03:19Z → 05:04:33Z
  21 mutants, 21/21 tués ; 05:05:05Z → 05:16:56Z oracle final du pli (6 portes, ciblés 220/220, importeurs 230/2 skip/0,
  test 42 2/2). L'énoncé « strictly safer » de D-1 (citation de l'advisor) est RÉFUTÉ par G2 B-1 et RETIRÉ (D-1 réécrit).

## G2 pliée (2026-09-24, ~04:50Z → 05:2xZ ; rapport `F:\tmp\codeql-alerts-1\g2\G2-report.md`)

Entrées lues avant tout pli :
- le rapport G2 (279 lignes) et `g2\probe-scanner.log`, `g2\enum-scanner.out`, `g2\enum-new-vs-proto.out` ;
- `g2\proto\` : proposition de conception, relue, **non copiée** ;
- la copie locale de la spécification WHATWG procurée par G2 (`g2\whatwg-parsing.html`, sha `de2e84b4…`, extraite à
  04:20:09Z ; lue sans réseau). Règles lues [lu, copie G2] :
  - §13.2.6.4.16 « in template » : start tags `script`/`template`/`style`/`title`/`noframes` et end tag `template` →
    règles « in head » ; « any other start tag » → « in body » ; « any other end tag » → ignoré ;
  - « in head » : `script` → « switch the tokenizer to the script data state » ; `noscript` si le scripting n'est pas
    Disabled, `noframes`, `style` → algorithme raw text générique ; `template` ; end tag `template` ;
  - « in body » : `noscript` si le scripting n'est pas Disabled → raw text ;
  - tokenizer : §13.2.5.14, .15, .17, .18, .19, .22, .23, .25, .29, .30, double escape start/end, .51.

Pas de modification de l'ADR (A-r2, numéros de ligne : réservé à l'orchestrateur au G7).

| Constat G2 | Pli | Preuve |
|---|---|---|
| **B-1** (bloquant) : fin d'un `<template>` = première `</template>` venue, même dans un `<script>`/`<noscript>` imbriqué (T1, T2) ; `<script>` jamais fermé dans un template : plus de throw (T3, lettre de D3 (iv)) | `closerAt(html, name, c)` (fermeture à une position ; grammaire ADR inchangée, partagée par `closerEnd`) ; `surfaceEnd(html, lt)` (une surface cachée : commentaire, `script`, `noscript`, `template` ; LÈVE sur surface non fermée en nommant la plus interne) ; `templateEnd` : contenu de template = balisage, chaque surface imbriquée est consommée ENTIÈRE (récursion mutuelle), puis la `</template>` suivante ferme. Conception propre : la proposition G2 comptait la profondeur en itératif, ici un template imbriqué est une surface comme les autres | vecteurs dans `rendered_body_scanner_outcomes` : T1 ⇒ `VISIBLE`, T2 ⇒ `VISIBLE`, T3 ⇒ throw `unclosed <script> block`, Rd (template imbriqué) ⇒ `VISIBLE`. ROUGES sur lot-v1 (T1 : `";</script>HIDDEN</template>VISIBLE`), verts après. MT1-MT4 tués, chacun par son vecteur. Énumération et artefact réel ci-dessous |
| **M-1** : GM7/GM7b (suffixe) et GM4 (fermante à queue quelconque) survivants | leurres `https://xeth.drpc.org` (ukemi) et `https://xapi.mainnet.solana.com/` (bell) ; vecteur `<script>a</scriptx>b</script>c` ⇒ `c` | GM7, GM7b, GM4p tués (§Table des mutants, pli) |
| **M-2** : écarts fail-closed et améliorations non déclarés | §Résidus réécrit, chaque forme mesurée sur ancien / lot-v1 / pli | `pli\probe-residuals.log`, `pli\probe-old-vs-pli.log` |
| **M-3** : résidus préexistants non déclarés (commentaires bogus, `shadowrootmode`) | mesurés identiques ×3, versés à I-4, avec R-h (texte brut `style`/`title`/`textarea` dans un template) | `pli\probe-residuals.log` |
| **A-r1** : dismiss #17 inexact (`subject` EST une URL) | texte proposé par G2 repris (§Dismiss) | relu : `gate-liq.test.ts:245` `const subject = "https://example.test/book-not-a-price-feed"` |
| **A-r3** : D-1 « strictly safer » réfuté | D-1 réécrit (rétractation explicite) | — |

**Énumération exhaustive contre un oracle de référence** (`pli\enum-oracle.mjs`, sortie `pli\enum-oracle.out`).
- Mêmes 597 870 séquences que G2 (longueurs 1 à 6 sur `<template>`, `</template>`, `<script>`, `</script>`,
  `<noscript>`, `</noscript>`, `<!--`, `-->` et un texte), avec un marqueur UNIQUE par position.
- L'oracle calcule le texte que rend un navigateur par les règles lues ci-dessus (scripting actif). Il est auto-testé
  sur 9 cas dérivés à la main : 9/9.
- « Texte caché compté » = un marqueur caché présent dans la sortie de `renderedBody`.

| Version | Exact | Texte caché compté (UNDER) | Sur-retrait (OVER) | UNDER+OVER | Throw |
|---|---|---|---|---|---|
| ANCIEN (`e7af51c`) | 290 437 | 76 972 | 150 | 4 | 230 307 |
| LOT-V1 (livré au G1) | 122 227 | 1 715 | 0 | 0 | 473 928 |
| PLI | 109 212 | **34** | 0 | 0 | 488 624 |

- NOUVEAU texte caché compté (marqueur compté par la version récente et pas par l'autre) :
  - lot-v1 face à l'ancien : **514** séquences (B-1 retrouvé mécaniquement, ex. `<template><script></template>A3`) ;
  - **pli face à l'ancien : 0 ; pli face à lot-v1 : 0**.
- Les 34 UNDER du pli (`pli\enum-pli-under.txt`) sont tous de la classe R-e (script double échappé) et tous aussi
  comptés par l'ancien, sur le même marqueur.
- La hausse des throws est le fail-closed D-5 : ces séquences laissent un template, un noscript ou un commentaire
  ouvert, que l'ancien comptait souvent (76 972 UNDER).

**Artefact réel** (`next build` hors réseau, sur l'arbre PLIÉ)
- Moniteur réseau `pli\netmon.ps1` (sondage 0,5 s des connexions TCP non-loopback des processus node dont la ligne de
  commande désigne le worktree ou Next). Auto-test : il a vu une connexion TLS tenue 3 s vers le registre npm
  (`104.16.8.34:443`, `pli\netmon-selftest.log`), seul réseau autorisé. Un premier auto-test par `npm ping` n'avait rien
  vu (connexions plus brèves que le sondage) : limite déclarée de l'instrument.
- Build `npm run build -w @monark/site` sous `pli\ev-build.sh` (= `ev.sh` + `NEXT_TELEMETRY_DISABLED=1`) :
  - exit 0 de 05:00:38Z à 05:01:07Z, 19 routes ;
  - moniteur : **0 connexion**, jusqu'à 24 processus node du build observés ;
  - configs suivies inchangées (6/6 sha, `pli\build-before.sha256`) ;
  - `.next` et `next-env.d.ts` (créé à 05:00:56Z, ignoré par git) retirés ensuite.
- `renderedBody` ANCIEN = LOT-V1 = PLI, octet pour octet, sur les **19/19** pages (`pli\real-compare.log`). Comptes :
  0 `<template`, 0 `<noscript`, autant de `<!--` que de `-->`, 0 fermante espacée ou attribuée.
- g3-site `node scripts/assert-fleet-html.mjs` : **exit 0**. /fleet : en-tête et 4 notes, 33 813 caractères ;
  /ukemi : 0 jeton numérique, statut `built`, 4 678 caractères de corpus (`pli\g3-site.log`).

## Faits d'orientation (lus, avec ligne)

- F-1 `.github/workflows/ci.yml` (base) : aucun bloc `permissions`, aucune occurrence de `write` ni de `permission` (grep
  insensible à la casse : 0) ; `on:` l.18-19, `jobs:` l.21.
- F-2 `scripts/export-public.mjs:412-449` : `derivePublicWorkflow` cherche la needle `on:<eol>  pull_request:` et coupe le
  job `  r25-taille-de-lot:` jusqu'à la clé de job suivante ; un bloc de niveau racine placé entre le bloc `on:` et
  `jobs:` n'est touché par aucune des deux opérations.
- F-3 Consommateurs de `ci.yml` : `test/ci-gates.test.ts` (test 38 (5) borne le bloc `on:` à la clé racine suivante :
  `permissions:` la ferme, `pull_request` reste dedans ; `ci_runs_export_check`/`ci_runs_lang_gate` bornés au job r25 ;
  `ci_jobs_have_timeout…` part de `jobs:`), `test/cra-b.test.ts:29` (bloc g6), `test/export-public.test.ts:259` (42(f)),
  `:383` (42(f'), `jobBodies` part de `jobs:`), `test/site-build-fleet.test.ts:150,171`.
- F-4 `packages/rpc-guard/src/transport.ts` : l'échappement manuel est à la **l.156** et le puits `new RegExp` à la
  **l.158** (l'ADR écrit « l.157 » / « l.157-158 » : décalage d'une ligne, sans effet ; une justification de dismiss
  option B doit citer `transport.ts:156/158`).
- F-5 TypeScript 6.0.3 (`node_modules/typescript/package.json`) : `lib.esnext.d.ts` référence `es2025`, qui référence
  `es2025.regexp` ; `lib.es2025.regexp.d.ts` déclare `RegExpConstructor.escape(string: string): string`. Le
  `tsconfig.json` racine (`lib: ["esnext"]`) est EXPORTÉ tel quel (`WHITELIST_FILES`) ⇒ aucun problème de typage dans
  l'export ; option B non nécessaire côté typage. Node mesuré : v24.15.0.
- F-6 `scripts/assert-fleet-html.mjs` (base, sha `ba1d8324…`) : trois regex de retrait l.61, l.68-69, l.70 ; garde
  `/<script\b/i` l.65-66. Consommateurs de `renderedBody` : `test/site-build-fleet.test.ts` (import direct) et
  `test/site-ukemi.test.ts` (via `assertUkemiBody`) — ce dernier absent de la liste d'oracle de la mission : ajouté.
- F-7 Aucun parseur HTML dans l'arbre (`node_modules` : seuls `character-entities*`, `parse-entities`,
  `stringify-entities`) ; de toute façon hors jeu (ruling « D3 maison, pas parse5 », R-8). Les énoncés « ce que rend un
  navigateur » ci-dessous sont de mémoire du tokenizer WHATWG (états comment / script data), **non relus dans cette
  session** ; seules les sorties de `renderedBody` sont mesurées. **Pli G2** : les règles utilisées depuis sont relues
  [lu] sur la copie locale procurée par G2 (`F:\tmp\codeql-alerts-1\g2\whatwg-parsing.html`, sha `de2e84b4…`, lue
  sans réseau) — liste au §« G2 pliée ».
- F-8 `apps/sentinel/test/ukemi-guard-record.test.ts` est EXPORTÉ (absent de `scripts/export-exclude-tests.json`) ;
  `apps/bell/test` et `test/` ne le sont pas ⇒ aucun helper partagé entre ces répertoires (ADR D4).
- F-9 NTFS (lecteur F: du worker, mesuré 03:2xZ) : `writeFileSync('a"b<c')` ⇒ `ENOENT` ; `writeFileSync("a&b'c.json")` ⇒ OK.
- F-10 Gel U-4b (`docs/PLAN-u4b-prereg.md` §2, 9 fichiers) : aucun n'est une cible du lot.

## Livrables (D1-D5 de l'ADR)

- **D1** `.github/workflows/ci.yml` : bloc `permissions:` / `  contents: read` inséré entre le bloc `on:` (l.18-19) et
  `jobs:` (désormais l.27), précédé de 3 lignes de commentaire anglais (aucun `r25`, aucun `if:`). Test racine
  `ci_workflow_declares_least_privilege_permissions` (`test/ci-gates.test.ts`, en fin de fichier ; import
  `derivePublicWorkflow` ajouté l.31) : UNE seule clé `permissions` sur toutes les lignes non-commentaire (tout niveau
  d'indentation : un bloc de job rougit), clé racine ouvrant un bloc, `on < permissions < jobs`, corps exactement
  `["  contents: read"]`, aucun jeton `write`/`write-all` hors commentaire, et le workflow DÉRIVÉ garde le bloc.
  `derivePublicWorkflow` : prouvé par test 42 (2/2, CI exportée verte) et par l'assertion « dérivé » du test racine.
- **D2** `packages/rpc-guard/src/transport.ts:156` : `.map((t) => RegExp.escape(t))` (même ligne, aucun décalage).
  Mesure R-21 (`F:\tmp\codeql-alerts-1\measure-d2.mjs`, logique `secretTargets` copiée verbatim, hunk d'échappement
  recompté identique dans node, A-13) : 9 URL (5 keyless ETH, solana-foundation, 3 synthétiques clé-chemin / userinfo /
  query avec métacaractères), 396 corps, **0 divergence** entre l'échappement manuel et `RegExp.escape` ;
  `RegExp.escape("eth.drpc.org")` = `\x65th\.drpc\.org`, `test("ETH.DRPC.ORG")` = true, `test("eth-drpc-org")` = false.
  Test nouveau `keyless_redact_matches_target_forms_literally_not_as_patterns` (`error-hint.test.ts`, après `:186`) :
  corps `x eth.drpc.org y eth-drpc-org z` ⇒ `detail === "x <redacted> y eth-drpc-org z"` (témoin positif + sosie intact).
- **D3** `scripts/assert-fleet-html.mjs` : les regex de retrait l.61, l.68-69 et l.70 remplacées par un scanner maison
  (`stripHiddenSurfaces` + `hiddenOpenerAt` + `closerEnd` ; après le pli G2 : + `closerAt`, `surfaceEnd`, `templateEnd`
  — la fin d'un `<template>` respecte l'imbrication, §« G2 pliée » ; non exportés, zéro dépendance) ; garde `/<script\b/i` et son
  message CONSERVÉS octet pour octet, appliqués à la sortie du scanner ; garde nouvelle `<!--` résiduel ⇒ throw (C-V2-2b) ;
  `extractMain`/`mainCorpus` inchangés ; pas de `<style` (M-24). Docstring du jumeau `.d.mts` mise à jour (aucun symbole
  nouveau). Test nouveau `rendered_body_scanner_outcomes` (fin de `test/site-build-fleet.test.ts`) : (i) `b`,
  (ii) `<scr`, (iii) throw `<!-- comment opener survived stripping`, (iv) throw `unclosed <script> block` (+ `noscript`,
  `template`, commentaire non fermés), (v) throw par la GARDE (`<script> tag survived stripping`), balises génériques
  conservées. Régression `rendered_body_strips_hidden_surfaces_and_fails_closed` : tranche l.82-129 sha
  `c2f03ba8…` AVANT = APRÈS (octets identiques), verte.
- **D4** 4 stubs `fetch` réécrits : `apps/sentinel/test/ukemi-guard-record.test.ts` (ex-l.725/783/834, désormais
  l.738/796/847) via `isHost(input, "eth.drpc.org")` = `URL.canParse(String(input)) && new URL(String(input)).hostname
  === host` ; `apps/bell/test/bell-adv-1.test.ts:347` (ex-l.344) via `isHttpsHost(url, host)` = `URL.canParse(url) &&
  protocol === "https:" && hostname === host` (D-3). Tests nouveaux `ukemi_record_stub_routes_drpc_by_exact_hostname`
  et `bell_adv1_stub_routes_rpc_by_exact_https_host` (leurres : `https://evil.com/?x=eth.drpc.org`,
  `https://eth.drpc.org.evil.com`, `https://evil.com/eth.drpc.org`, entrée non absolue ; côté bell :
  `https://api.mainnet.solana.com.evil.com/`, `http://…`, requête, non absolue ; pli G2 M-1 : leurres SUFFIXE
  `https://xeth.drpc.org` et `https://xapi.mainnet.solana.com/`). Les tests de course qui dépendent du
  routage drpc réel (RETRY-2 408, HEARTBEAT-1) restent verts. Les 8 autres sites : NON touchés (§Dismiss).
- **D5a** `apps/bell/test/helpers/bell-served.ts` : `HeaderRule.match` → `matches` (l.118, variable locale l.147-149,
  raccourci l.154, appel l.171) + `apps/bell/test/bell-served-e2e.test.ts:69`. `test/bell-caddy.ts:67` (autre
  `HeaderRule`, sans rapport) non touché. **D5b** `test/bell-caddy.ts` : `escapeHtml` (`& < > " '`, `&` d'abord) et
  `listingHtml(names)` exportés ; la ligne de listing de `serveCaddy` (ex-l.213, désormais l.219) appelle `listingHtml`. Test nouveau
  `bell_caddy_browse_listing_escapes_entry_names` (`test/bell-deploy-config.test.ts`) : `a"b<c` ⇒
  `<a href="a&quot;b&lt;c">a&quot;b&lt;c</a>` (2 balises, 2 guillemets exactement) ; chemin SERVI via `serveCaddy` (site
  synthétique `file_server browse`, fichier `a&b'c.json`) ⇒ `200 <a href="a&amp;b&#39;c.json">a&amp;b&#39;c.json</a>`.

## Décisions et déviations (D-n, F-3)

- **D-1 (D3 : passe unique en ordre de document) — corrigé au pli G2.** L'advisor intégré recommandait, AVANT toute
  mesure, deux passes (blocs cachés puis commentaires) ; le worker a mesuré puis retenu la passe unique ; l'advisor l'a
  confirmée à la clôture. **Rétractation** : l'énoncé « strictly safer » (repris ici de l'advisor) et « Résidus …
  identiques, aucune régression » étaient FAUX. Telle que livrée au G1, la passe unique prenait pour fin d'un
  `<template>` la première `</template>` venue, même logée dans un `<script>`/`<noscript>` imbriqué (texte brut) :
  faux vert que l'ancien code n'avait pas, et un `<script>` jamais fermé dans un template ne levait plus, contre la
  lettre de D3 (iv) (G2 B-1 ; mesuré : 514 séquences de l'énumération où lot-v1 compte un texte caché que l'ancien ne
  comptait pas). Plié : `templateEnd` (§« G2 pliée »), après quoi l'énumération donne 0 cas face à l'ancien comme face
  à lot-v1. La passe unique reste retenue : elle rapproche du navigateur X3, T4, C1, C2, K1 et P2 (G2, mesuré). Seule
  la fin de `template` exigeait de respecter l'imbrication. Fondement de la passe unique : trois faits MESURÉS sur
  `renderedBody` (`probe-d3-compare.txt`, ancien = blob HEAD `ba1d8324…`, qui EST l'ordre à deux passes) :
  (a) la propriété ex-l.57-60 (« un `<!--` d'une charge ne s'apparie pas à un `-->` du corps ») tient par construction —
  un bloc est consommé entier dès son ouvrante, qui précède sa charge ; mesuré : `<script>var a = "<!--";</script>visible-->`
  ⇒ `visible-->` avant ET après ; (b) X3 `<main><!-- <script> -->visible<!-- </script> --></main>` : ancien
  `<main></main>` (le texte « visible », hors de toute surface cachée selon les règles de commentaire [mémoire, non
  relu], disparaît : sur-retrait = faux vert possible des contrôles d'ABSENCE de /ukemi), nouveau `<main>visible</main>` ;
  (c) X1 `a<!--b<script>--></script>c` : ancien `a<!--bc` (aucun throw ; « b » compté), nouveau `a</script>c`. Les 5
  issues de l'ADR et le test l.82 tiennent sous les deux conceptions ; si l'orchestrateur préfère deux passes, le
  changement est local à `stripHiddenSurfaces` (deux appels à jeux de noms disjoints), le test des 5 issues inchangé.
- **D-2 (D4 : « inline » lu comme « local au fichier »).** Le mutant exigé (« retour à `includes` ⇒ un test
  `evil.com/?x=eth.drpc.org` rougit ») est intestable si la condition est recopiée à chaque stub : l'enregistreur ne
  requête jamais un leurre. Un prédicat par fichier (`isHost`, `isHttpsHost`), aucun import entre répertoires (le motif
  de l'ADR D4 est le miroir d'export). Avis advisor concordant.
- **D-3 (D4 bell : schéma conservé).** Le préfixe d'origine `startsWith("https://…")` épinglait le schéma ; une égalité
  de `hostname` seule aurait admis `http://api.mainnet.solana.com` (plus faible sur cet axe, MAST « dérive »).
  `isHttpsHost` épingle donc `https:` ET l'hôte exact. Côté ukemi, l'original (`includes`) n'épinglait aucun schéma ⇒
  égalité de `hostname` exactement comme l'ADR l'écrit. Lignes bell 339/343 (`startsWith("https://api.polygon.io/")`,
  `…databento.com/"` : barre finale = hôte délimité, non signalées) non touchées.
- **D-4 (D5b : fonction pure exportée).** `a"b<c` est illégal sur NTFS (F-9, mesuré) : la preuve `a"b<c` porte sur
  `listingHtml` pur ; le chemin servi est prouvé par `serveCaddy` avec `a&b'c.json` ; `serveCaddy` appelle `listingHtml`
  (source unique : le mutant M13 le prouve).
- **D-5 (D3 : fail-closed étendu).** `<noscript>`, `<template>` et commentaire NON fermés lèvent désormais (ancien code :
  fail-OPEN, texte caché compté — mesuré, `probe-d3-compare.txt`). ADR D3 : « fail-closed sur bloc caché non fermé » ;
  la garde `/<script\b/i` seule ne voit pas `<noscript`/`<template`. Changement de comportement sur des entrées que les
  fixtures n'émettent pas ; sur l'artefact réel : aucun effet (G2 et pli : 19/19 pages identiques, I-2 clos).
- **D-6 (D3 : l.68-69 aussi).** L'ADR dit « remplace uniquement les deux regex l.61 et l.70 » mais son scanner « retire
  les blocs cachés script, noscript, template » : les regex l.68-69 seraient des doublons morts portant le même défaut
  (`</noscript >`) ; remplacées. « Uniquement » est lu comme « aucun retrait de balises génériques » (tenu).
- **D-7 (A-7, écart d'orientation).** Un `node -e` (liste des `scripts` de `package.json`) a été lancé SANS le préfixe
  `env -u …` ; il n'a imprimé que l'objet `scripts`, aucune variable ni environnement. Toute commande node/npm suivante
  passe par `F:\tmp\codeql-alerts-1\ev.sh` (`env -u` des 8 variables + `TEMP/TMP/TMPDIR=F:/tmp`).
- **D-8 (A-2).** `node_modules` construit par `npm ci` dans le worktree (ordre de mission : « jamais de jonction »), pas
  par `mk-nm.ps1` ; `require.resolve` résout dans le worktree.
- **D-9 (A-3).** Le code de retour de `npm ci` a été lu par `${PIPESTATUS[0]}` derrière `| tail` (code de npm lui-même) ;
  tous les codes d'oracle sont capturés directement (`cmd > log 2>&1; echo exit=$?`).
- **D-10 (oracle élargi).** Lancés en plus de la liste de la mission, parce qu'ils exercent un fichier changé :
  `test/site-ukemi.test.ts` (`renderedBody`), `apps/bell/test/bell-verify.test.ts` (`serveDir`), `test/cra-b.test.ts`
  (`ci.yml`), les 17 autres importeurs de `rpc-guard` (D2), `test/export-public.test.ts` (test 42).

## Dismiss « false positive » des 8 sites non réécrits (texte anglais prêt à poser, une phrase par site)

| # | Site | Justification (dismiss reason: false positive) |
|---|---|---|
| 14 | `apps/bell/test/guard-collect-1bii.test.ts:191` | `includes` asserts the ABSENCE of an excluded host literal from the rpc.ts SOURCE TEXT (CONF-SRC-5); nothing is routed or authorised, and any occurrence anywhere must red, so a substring test is the exact assertion. |
| 15 | `apps/bell/test/universe.test.ts:558` | `includes` asserts the ABSENCE of the operator host from produced output/stdout (a leak check over free text); a hostname-equality rewrite would weaken it. |
| 16 | `apps/bell/test/universe.test.ts:747` | `includes` asserts the ABSENCE of the operator host from the generated provenance markdown (a leak check over free text), not a URL check. |
| 17 | `apps/harness/test/gate-liq.test.ts:251` | `e.message.includes(subject)` asserts that the thrown error MESSAGE quotes the attested subject (a synthetic URL on the reserved example.test domain); the check neither routes nor authorises anything, it only proves the message echoes its input. |
| 18 | `apps/sentinel/test/sentinel-retry.test.ts:266` | `Array.prototype.includes` over already-normalised provider labels (`map(providerOf)`): exact element equality, not a substring match. |
| 22 | `test/probe-narabi.test.ts:322` | `includes` asserts the ABSENCE of the key-bearing path prefix `chainstack.com/` from a produced file's text (a leak check), not a URL check. |
| 23 | `test/u3-realized-param.test.ts:267` | `Array.prototype.includes` over `meta.providers` (exact provider labels): element equality, not a substring match. |
| 24 | `test/u3-realized-param.test.ts:287` | `Array.prototype.includes` over the default pool's provider labels: element equality, not a substring match. |

Replis prévus par l'ADR (à poser SEULEMENT si la re-analyse de la fenêtre garde l'alerte ouverte après ce lot) :
- #25/#26 (D2 option B) : "The flagged literals are keyless RPC URL constants used as secret-target forms; the only regex
  sink (transport.ts:158) is built from RegExp.escape'd forms (transport.ts:156), so '.' matches literally — proven by
  keyless_redact_matches_target_forms_literally_not_as_patterns."
- #31 (D5a repli) : "r.matches(p) calls HeaderRule's own function property; the only RegExp in bell-served.ts (glob,
  l.125) escapes its input; no request value reaches a RegExp constructor."
- #30 (D5b, si l'échappement manuel n'est pas modélisé comme assainisseur) : "Test-only model of Caddy's browse listing;
  entry names are HTML-escaped (& < > \" ') by listingHtml, proven by bell_caddy_browse_listing_escapes_entry_names."
  (Réserve : #30 est classée RÉELLE par l'ADR ; ce repli n'est licite que si la correction est en place et l'alerte
  persiste par non-modélisation — décision orchestrateur.)

## Résidus déclarés (D3, grammaire ADR vs tokenizer HTML — non revendiqués)

**Réécrit au pli G2 (M-2, M-3)** : l'ancienne phrase « identiques avant/après, aucune régression » était fausse (B-1).
Chaque ligne est MESURÉE sur trois versions : ANCIEN (blob `e7af51c`), LOT-V1 (livré au G1), PLI. Sources :
`pli\probe-residuals.log`, `pli\probe-old-vs-pli.log` (sonde G2 rejouée sur le pli), `probe-d3-compare.txt`. Le
comportement navigateur suit les règles relues [lu] sur la copie G2 de la spécification (§« G2 pliée ») et, pour les
commentaires bogus et `shadowrootmode`, la lecture de G2 (§13.2.5.42, §13.2.5.7). Aucune de ces formes n'existe dans
les 19 pages construites (comptes G2 et `pli\real-compare.log` : 0 `<template`, 0 `<noscript`, 0 fermante espacée ou
attribuée).

Préexistants, IDENTIQUES ancien = lot-v1 = pli (non revendiqués ; I-4) :
- R-a fermante avec attribut ou `/` (`</script foo>`) : une fermante plus loin est cherchée (sur-retrait si elle existe,
  throw sinon).
- R-b4 `<!-->` suivi d'un `-->` plus loin : sur-retrait (le navigateur ferme `<!-->` aussitôt, §13.2.5.43-44 lu par G2).
- R-c `>` dans un attribut quoté d'une ouvrante : ouvrante close au premier `>`.
- R-e état « double échappé » d'un script (`<!--` puis `<script>` dans un script) : fermeture à la première
  `</script>` (sous-retrait). C'est la SEULE classe de texte caché compté que l'énumération trouve encore au pli :
  34 séquences, toutes aussi comptées par l'ancien, sur le même marqueur.
- R-h `</template>` dans un `<style>`, `<title>` ou `<textarea>` imbriqué dans un template : le scanner ne connaît que
  `script`/`noscript` comme texte brut (M-24 : `<style` hors périmètre) ⇒ sous-retrait, UNDER ×3.
- B1-B3 commentaires « bogus » `<! x>`, `</ x>`, `<?x>` : cachés par un navigateur (G2), copiés par les trois versions
  (UNDER ×3).
- SR `<template shadowrootmode=…>` (DOM de l'ombre déclaratif) : rendu par un navigateur (G2), retiré par les trois
  versions (OVER ×3).

CORRIGÉ par le pli (lot-v1 : faux vert ou fail-open) :
- R-d template imbriqué : ancien et lot-v1 UNDER, pli exact (vecteur Rd).
- T1 / T2 `</template>` dans un `<script>`/`<noscript>` imbriqué : lot-v1 UNDER (régression B-1), ancien et pli exacts.
- T3 `<script>` jamais fermé dans un template : lot-v1 aucun throw (régression B-1), ancien et pli throw.

Écarts FAIL-CLOSED déclarés (ancien : sans throw ; lot-v1 = pli : throw ⇒ faux rouge possible, jamais faux vert) :
- Rb1 / Rb2 `<!-->` et `<!--->` seuls : fermés aussitôt par un navigateur, lus comme commentaire non fermé.
- S1 / S2 `<!--` dans `<style>` (texte brut) ou `<title>` (RCDATA) : lu comme commentaire.
- A1 `<noscript>` et Rf `<!--` en texte de valeur d'attribut : lus comme ouvrantes.
- D-5 `<noscript>`, `<template>` ou commentaire non fermés (ancien : fail-OPEN, texte caché compté).

AMÉLIORATIONS (l'ancien comptait un texte caché ou sur-retirait ; lot-v1 = pli exacts ou throw) :
- Rb3 `--!>` seul (ancien UNDER ⇒ throw) ; V1 `<script` + U+000B (ancien sur-retrait ⇒ throw) ; X3, T4, C1, C2, K1
  (exacts, ancien OVER ou throw) ; P2 (exact).

## Items formés (avec déclencheur)

- **I-1 CODEQL-D6-WINDOW** (ADR D6, déjà planifié) — déclencheur : prochaine fenêtre publique. Re-analyse ; attendu
  fermé par le code : #7-12 (D1), #13, #19-21 (D4), #27-29 (D3) ; #25/#26 (D2) si CodeQL modélise `RegExp.escape`
  (non vérifiable hors fenêtre), sinon option B ; #30 (D5b) et #31 (D5a) idem, sinon replis ci-dessus ; 8 dismiss FP
  (#14-18, #22-24). Aucune alerte réelle fermée par dismiss.
- **I-2 G3-SITE-REPLAY — CLOS.** Par G2 (19/19 identiques, g3-site vert, build hors réseau mesuré), puis par le worker
  sur l'arbre PLIÉ : `next build` sous `ev.sh` + `NEXT_TELEMETRY_DISABLED=1`, exit 0, moniteur 0 connexion ; ancien =
  lot-v1 = pli sur les 19 pages ; `node scripts/assert-fleet-html.mjs` exit 0 (§« G2 pliée »).
- **I-3 UPLOAD-ARTIFACT-PIN — partie lecture CLOSE** par G2 (`action.yml` et `dist/upload/index.js` du SHA épinglé
  `043fb46d…` lus : l'upload lit `ACTIONS_RUNTIME_TOKEN`, pas le `GITHUB_TOKEN`) ; partie exécution (job SBOM vert sous
  `contents: read`) : déclencheur = run de la prochaine fenêtre (I-1).
- **I-4 ASSERT-FLEET-TOKENIZER-1** — déclencheur : tout HTML non produit par React/Next soumis à `renderedBody`, une
  montée majeure de Next/React, ou une anomalie g3-site. Périmètre (pli G2 : + M-3 et R-h) : R-a, R-b4, R-c, R-e, R-h,
  B1-B3 (commentaires bogus), SR (`shadowrootmode`), et les écarts fail-closed Rb1/Rb2/S1/S2/A1/Rf (§Résidus). Action :
  re-mesurer ancien/nouveau (sondes `pli\probe-residuals.mjs`, `pli\enum-oracle.mjs`) et, si retenu par ADR, rendre
  fail-closed ou fidèles les formes concernées (throw sur `</name` + espace/`/` hors grammaire, états double échappé,
  texte brut `style`/`title`/`textarea` dans un template).
- **I-5 SUBSTRING-STUBS-UNFLAGGED** — déclencheur : une alerte CodeQL sur l'un d'eux, ou le besoin d'un test à leurre.
  Même classe de routage par sous-chaîne, NON signalée par CodeQL, hors périmètre ADR (CA-5, R-25) :
  `ukemi-guard-record.test.ts:673` (`u.includes(host)` sur `["eth.drpc.org","rpc.mevblocker.io"]`) et les stubs
  `String(input).includes(CS_HOST)` du même fichier (hôte `.invalid` fixe).

## Table des mutants (D-1, A-11, D-1-bis)

Exécution 1 (G1, arbre LOT-V1) ci-dessous, conservée pour l'histoire ; l'exécution qui fait foi pour l'arbre livré est
celle du pli (§ sous-section suivante).

Harnais `F:\tmp\codeql-alerts-1\mutants.mjs` (A-11 : TAP, CRLF normalisé, tué SEULEMENT si `not ok … - <test attendu>` ;
D-1-bis : golden copié d'abord, restauration par fichier temporaire + `fsync` + renommage, sha RE-LU après fermeture).
Exécution 03:29:0xZ → 03:29:50Z, `results-1790220590773.json` : **14/14 tués par le test attendu, 0 autre test rouge, 14/14 restaurations octet-exactes**.

| # | Mutation | Test tueur attendu → résultat | sha golden → muté → restauré |
|---|---|---|---|
| M1-D1-block-removed | `ci.yml` : bloc `permissions:`/`contents: read` retiré | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `0492396020ef…` → `207dfe808014…` (=) |
| M2-D1-contents-write | `ci.yml` : `contents: read` → `contents: write` | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `7c4805512a2a…` → `207dfe808014…` (=) |
| M3-D1-job-level-write-all | `ci.yml` : `permissions: write-all` ajouté au job g4 | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `a6a3b25079e4…` → `207dfe808014…` (=) |
| M4-D1-block-above-on | `ci.yml` : bloc déplacé au-dessus de `on:` | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `59fbd6cb4279…` → `207dfe808014…` (=) |
| M5-D2-escaping-removed | `transport.ts:156` : `.map((t) => RegExp.escape(t))` → `.map((t) => t)` | `keyless_redact_matches_target_forms_literally_not_as_patterns` → **rouge (tué)** | `64a84454b8e8…` → `0b31b77c6902…` → `64a84454b8e8…` (=) |
| M6-D3-script-output-guard-removed | `assert-fleet-html.mjs` : garde `/<script\b/i` retirée (ADR : « garde retirée ») | `rendered_body_scanner_outcomes` → **rouge (tué)** | `6c0f79769863…` → `5ef04e0b9d4e…` → `6c0f79769863…` (=) |
| M7-D3-comment-output-guard-removed | `assert-fleet-html.mjs` : garde `<!--` résiduel retirée | `rendered_body_scanner_outcomes` → **rouge (tué)** | `6c0f79769863…` → `8b121019e1c9…` → `6c0f79769863…` (=) |
| M8-D3-closer-without-whitespace | `assert-fleet-html.mjs` : fermante sans tolérance d'espaces (`</script >`) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `6c0f79769863…` → `bbf1f784935a…` → `6c0f79769863…` (=) |
| M9-D3-unclosed-block-fail-open | `assert-fleet-html.mjs` : plus de throw sur bloc caché non fermé | `rendered_body_scanner_outcomes` → **rouge (tué)** | `6c0f79769863…` → `330076742bed…` → `6c0f79769863…` (=) |
| M10-D4-ukemi-isHost-includes | `ukemi-guard-record.test.ts` : `isHost` → `String(input).includes(host)` | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | `3077bd84de54…` → `c321caafecab…` → `3077bd84de54…` (=) |
| M11-D4-bell-isHttpsHost-startsWith | `bell-adv-1.test.ts` : `isHttpsHost` → `` url.startsWith(`https://${host}`) `` | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | `250ea0af50f2…` → `172ddc249c0d…` → `250ea0af50f2…` (=) |
| M12-D5b-escapeHtml-dropped | `bell-caddy.ts` : `escapeHtml` retiré de `listingHtml` | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | `3a76793ab6eb…` → `2c7b544326f3…` → `3a76793ab6eb…` (=) |
| M13-D5b-served-listing-unescaped | `bell-caddy.ts` : `serveCaddy` revient au listing en ligne non échappé | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | `3a76793ab6eb…` → `8bb2d2fa34d2…` → `3a76793ab6eb…` (=) |
| M14-D5a-rename-reverted-at-a-call-site | `bell-served.ts:171` : `r.matches(p)` → `r.match(p)` (oracle `npm run typecheck`) | `npm run typecheck (exit 2)` → **rouge (tué)** | `da10ff690170…` → `345730e0a21c…` → `da10ff690170…` (=) |

Messages exacts (champ `error:` du TAP du test tueur ; M14 : ligne de sortie de `tsc`) :

```
M1-D1-block-removed: exactly ONE permissions key in the workflow (a job-level block overrides the workflow one), saw 0  0 !== 1 
M2-D1-contents-write: the permissions block is exactly `contents: read` (read-only repository contents) + actual - expected  [ +   '  contents: write' -   '  contents: read' ] 
M3-D1-job-level-write-all: exactly ONE permissions key in the workflow (a job-level block overrides the workflow one), saw 2  2 !== 1 
M4-D1-block-above-on: 'permissions: must sit after the on: block and before jobs: (on=19, permissions=17, jobs=25)'
M5-D2-escaping-removed: the host is redacted and its dot-substituted look-alike survives verbatim + actual - expected  + 'x <redacted> y <redacted> z' - 'x <redacted> y eth-drpc-org z' ^ 
M6-D3-script-output-guard-removed: 'Missing expected exception: (v) the output guard throws'
M7-D3-comment-output-guard-removed: 'Missing expected exception: (iii) a residual <!-- throws'
M8-D3-closer-without-whitespace: 'assert-fleet-html: an unclosed <script> block (no matching </script>) - fail-closed'
M9-D3-unclosed-block-fail-open: '(iv) an unclosed <script> throws'
M10-D4-ukemi-isHost-includes: a decoy never routes as drpc: https://evil.com/?x=eth.drpc.org  true !== false 
M11-D4-bell-isHttpsHost-startsWith: a decoy never routes as the Solana RPC: https://api.mainnet.solana.com.evil.com/  true !== false 
M12-D5b-escapeHtml-dropped: the name is escaped in the href value and in the text + actual - expected  + '<a href="a"b<c">a"b<c</a>' - '<a href="a&quot;b&lt;c">a&quot;b&lt;c</a>' ^ 
M13-D5b-served-listing-unescaped: the SERVED listing carries the escaped name only + actual - expected  + `200 <a href="a&b'c.json">a&b'c.json</a>` - '200 <a href="a&amp;b&#39;c.json">a&amp;b&#39;c.json</a>' 
M14-D5a-rename-reverted-at-a-call-site: apps/bell/test/helpers/bell-served.ts(171,40): error TS2551: Property 'match' does not exist on type 'HeaderRule'. Did you mean 'matches'?
```

### Table des mutants du pli G2 (21 : les 14 + GM4p, GM7, GM7b + MT1-MT4)

Harnais `F:\tmp\codeql-alerts-1\pli\mutants-pli.mjs` = harnais du G1 épissé en node (entrées inchangées copiées octet pour
octet ; M8/M9 déplacés par le refactor ; 7 entrées ajoutées), même protocole A-11 / D-1-bis. Exécution 05:03:19Z →
05:04:33Z, `results-1790226273780.json` : **21/21 tués par le test visé, 0 autre test rouge, 21/21 restaurations octet-exactes**.

| # | Mutation | Test tueur → résultat | sha golden → muté → restauré | sha muté = G1 ? |
|---|---|---|---|---|
| M1-D1-block-removed | idem G1 (§ci-dessus) | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `0492396020ef…` → `207dfe808014…` (=) | oui (fichier inchangé) |
| M2-D1-contents-write | idem G1 (§ci-dessus) | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `7c4805512a2a…` → `207dfe808014…` (=) | oui (fichier inchangé) |
| M3-D1-job-level-write-all | idem G1 (§ci-dessus) | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `a6a3b25079e4…` → `207dfe808014…` (=) | oui (fichier inchangé) |
| M4-D1-block-above-on | idem G1 (§ci-dessus) | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | `207dfe808014…` → `59fbd6cb4279…` → `207dfe808014…` (=) | oui (fichier inchangé) |
| M5-D2-escaping-removed | idem G1 (§ci-dessus) | `keyless_redact_matches_target_forms_literally_not_as_patterns` → **rouge (tué)** | `64a84454b8e8…` → `0b31b77c6902…` → `64a84454b8e8…` (=) | oui (fichier inchangé) |
| M6-D3-script-output-guard-removed | idem G1 (§ci-dessus) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `a3484092c5e3…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| M7-D3-comment-output-guard-removed | idem G1 (§ci-dessus) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `dbe210635395…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| M8-D3-closer-without-whitespace | `closerAt` : boucle de tolérance d'espaces retirée (`</script >`, CodeQL #27) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `8b449ab82880…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| M9-D3-unclosed-block-fail-open | `surfaceEnd` : bloc non fermé traité comme non-surface (plus de throw) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `cb4041cb09ff…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| M10-D4-ukemi-isHost-includes | idem G1 (§ci-dessus) | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | `9e053410b883…` → `8c11edcb01fa…` → `9e053410b883…` (=) | — (fichier plié ou mutant nouveau) |
| M11-D4-bell-isHttpsHost-startsWith | idem G1 (§ci-dessus) | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | `b9db1f045226…` → `1b95027d8842…` → `b9db1f045226…` (=) | — (fichier plié ou mutant nouveau) |
| M12-D5b-escapeHtml-dropped | idem G1 (§ci-dessus) | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | `3a76793ab6eb…` → `2c7b544326f3…` → `3a76793ab6eb…` (=) | oui (fichier inchangé) |
| M13-D5b-served-listing-unescaped | idem G1 (§ci-dessus) | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | `3a76793ab6eb…` → `8bb2d2fa34d2…` → `3a76793ab6eb…` (=) | oui (fichier inchangé) |
| M14-D5a-rename-reverted-at-a-call-site | idem G1 (§ci-dessus) | `npm run typecheck (exit 2)` → **rouge (tué)** | `da10ff690170…` → `345730e0a21c…` → `da10ff690170…` (=) | oui (fichier inchangé) |
| GM4p-D3-closer-accepts-any-tail | `closerAt` : toute queue après le nom jusqu'au `>` suivant ferme (GM4 de G2, adapté au refactor) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `0d80567fff29…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| GM7-D4-ukemi-hostname-suffix | `isHost` : `hostname.endsWith(host)` (GM7 de G2, verbatim) | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | `9e053410b883…` → `56c3123953dc…` → `9e053410b883…` (=) | — (fichier plié ou mutant nouveau) |
| GM7b-D4-bell-hostname-suffix | `isHttpsHost` : `hostname.endsWith(host)` (GM7b de G2, verbatim) | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | `b9db1f045226…` → `e7bca6865299…` → `b9db1f045226…` (=) | — (fichier plié ou mutant nouveau) |
| MT1-B1-template-ends-at-first-closer | `surfaceEnd` : fin de template = première `</template>` (comportement lot-v1, B-1) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `3e80cf7b9c68…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| MT2-B1-nested-noscript-not-skipped-in-template | `templateEnd` : un `<noscript>` imbriqué n'est pas sauté | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `0f240d941a4e…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| MT3-B1-unclosed-nested-surface-swallowed-in-template | `templateEnd` : une surface imbriquée non fermée est avalée (plus de throw) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `09d094122780…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |
| MT4-B1-nested-template-not-counted | `templateEnd` : un `<template>` imbriqué n'est pas compté | `rendered_body_scanner_outcomes` → **rouge (tué)** | `5b4359d6df63…` → `c46893ff24ad…` → `5b4359d6df63…` (=) | — (fichier plié ou mutant nouveau) |

Messages exacts du pli (champ `error:` du TAP du test tueur ; M14 : ligne de `tsc`) :

```
M1-D1-block-removed: exactly ONE permissions key in the workflow (a job-level block overrides the workflow one), saw 0  0 !== 1 
M2-D1-contents-write: the permissions block is exactly `contents: read` (read-only repository contents) + actual - expected  [ +   '  contents: write' -   '  contents: read' ] 
M3-D1-job-level-write-all: exactly ONE permissions key in the workflow (a job-level block overrides the workflow one), saw 2  2 !== 1 
M4-D1-block-above-on: 'permissions: must sit after the on: block and before jobs: (on=19, permissions=17, jobs=25)'
M5-D2-escaping-removed: the host is redacted and its dot-substituted look-alike survives verbatim + actual - expected  + 'x <redacted> y <redacted> z' - 'x <redacted> y eth-drpc-org z' ^ 
M6-D3-script-output-guard-removed: 'Missing expected exception: (v) the output guard throws'
M7-D3-comment-output-guard-removed: 'Missing expected exception: (iii) a residual <!-- throws'
M8-D3-closer-without-whitespace: 'assert-fleet-html: an unclosed <script> block (no matching </script>) - fail-closed'
M9-D3-unclosed-block-fail-open: 'Missing expected exception: (T3) an unclosed <script> nested in a <template> throws (ADR D3 (iv))'
M10-D4-ukemi-isHost-includes: a decoy never routes as drpc: https://evil.com/?x=eth.drpc.org  true !== false 
M11-D4-bell-isHttpsHost-startsWith: a decoy never routes as the Solana RPC: https://api.mainnet.solana.com.evil.com/  true !== false 
M12-D5b-escapeHtml-dropped: the name is escaped in the href value and in the text + actual - expected  + '<a href="a"b<c">a"b<c</a>' - '<a href="a&quot;b&lt;c">a&quot;b&lt;c</a>' ^ 
M13-D5b-served-listing-unescaped: the SERVED listing carries the escaped name only + actual - expected  + `200 <a href="a&b'c.json">a&b'c.json</a>` - '200 <a href="a&amp;b&#39;c.json">a&amp;b&#39;c.json</a>' 
M14-D5a-rename-reverted-at-a-call-site: apps/bell/test/helpers/bell-served.ts(171,40): error TS2551: Property 'match' does not exist on type 'HeaderRule'. Did you mean 'matches'?
GM4p-D3-closer-accepts-any-tail: (GM4) `</scriptx>` is not a closer of <script>  'b</script>c' !== 'c' 
GM7-D4-ukemi-hostname-suffix: a decoy never routes as drpc: https://xeth.drpc.org  true !== false 
GM7b-D4-bell-hostname-suffix: a decoy never routes as the Solana RPC: https://xapi.mainnet.solana.com/  true !== false 
MT1-B1-template-ends-at-first-closer: (T1) a </template> inside a nested <script> closes nothing + actual - expected  + '";</script>HIDDEN</template>VISIBLE' - 'VISIBLE' 
MT2-B1-nested-noscript-not-skipped-in-template: (T2) a </template> inside a nested <noscript> closes nothing + actual - expected  + 'HIDDEN</noscript></template>VISIBLE' - 'VISIBLE' 
MT3-B1-unclosed-nested-surface-swallowed-in-template: 'Missing expected exception: (T3) an unclosed <script> nested in a <template> throws (ADR D3 (iv))'
MT4-B1-nested-template-not-counted: (Rd) a nested template closes its own </template> first + actual - expected  + 'HIDDEN</template>VISIBLE' - 'VISIBLE' 
```

## Fichiers touchés (13 de code + ce journal) — sha256 octets bruts AVANT (base `e7af51c`) → APRÈS (état livré après le pli G2)

Le pli G2 a changé 4 fichiers ; leur sha LOT-V1 (livré au G1) : `scripts/assert-fleet-html.mjs` `6c0f7976…`,
`test/site-build-fleet.test.ts` `04809f16…`, `apps/bell/test/bell-adv-1.test.ts` `250ea0af…`,
`apps/sentinel/test/ukemi-guard-record.test.ts` `3077bd84…`. Les 9 autres fichiers de code sont inchangés depuis le G1.

| Fichier | AVANT | APRÈS |
|---|---|---|
| `.github/workflows/ci.yml` | `468e17b632729b875a588fc2e590754444cdf3f908dc1919a6e6222553470460` | `207dfe8080140933a2bdba477311ebc9664b831272f0f86c5f3d95d646e40603` |
| `test/ci-gates.test.ts` | `96c4f563922784386dcdaf5ceb2bec4409d6528a27cf760edcd093696ab2f032` | `c010f60ecee1b2ec3b321a6ec41048bdfafc8fa61097f2abcf993f4b3e9a296b` |
| `packages/rpc-guard/src/transport.ts` | `fa1b9f1b7afd4e624537b14ad42c59cd2938cdf22e38f60a53c4f9e172af8485` | `64a84454b8e8acd8c9f1cbb6347e0dc174f3a695573fa2d8ddbedbdbeb17385e` |
| `packages/rpc-guard/test/error-hint.test.ts` | `8ba546cf808312ea72558582ff4037568bfc68284341e85c4dc6ed4afef0628c` | `f8543bb912f5f59966e3ddf433919c5d016d8e0e3d403fc47edafe38557ceb6e` |
| `scripts/assert-fleet-html.mjs` | `ba1d8324b13c9e607d1d85e5b96444303a53e57cececfe9f6dc0d6d7b7da2cbc` | `5b4359d6df6364d36da7a4cf70a6e79b141199c3280ba97781c9a4c9397b9e3e` |
| `scripts/assert-fleet-html.d.mts` | `7c761adfdf1e30c708e64631759a018bc40fbef4f713c7a4f7b37d23b09be648` | `26aaf6e4af6e5c09370ba74afcb49234df62350120a050fb5fc12ee5c849af39` |
| `test/site-build-fleet.test.ts` | `22798272df18871d56776afc38353c167e1c0aad84f52c0809320e8858e68936` | `1f51285d99beecd9b6d6d5723924f2457b45a802f9c9b3542b3a4516c20ef0f5` |
| `apps/bell/test/bell-adv-1.test.ts` | `08415639d11559c487743395acbd55cddfe21e6e9188d7d0a4b34647b6d04f5b` | `b9db1f0452264831448c29a0570ccaec9b265448301b492e895a144ca9b63719` |
| `apps/sentinel/test/ukemi-guard-record.test.ts` | `c05791b2996eea9c0ca9d98c94839207e09743cf3fb2ba2f0d3d7cf4b7d4d631` | `9e053410b883092bf5425a9e0859d6a538657ec199326030ac3c3115ef7c0446` |
| `apps/bell/test/helpers/bell-served.ts` | `3f79789a9e4f523e38954675fd6763a38db6e89b8892352774c22ef1e2bb7472` | `da10ff690170390719af985541b4692151a941d87ce8f989635fe51c5a9f2dc6` |
| `apps/bell/test/bell-served-e2e.test.ts` | `68d286c66fc8c0b532c0ac25b8319e343c48f0cafb0099fa823fcdb54e60d122` | `bcc420732504d401a0aa240a8b33b947cc822b3380d2651be0daf9f0ebdee25a` |
| `test/bell-caddy.ts` | `ca4f1d41c4b83af3c8d62aee3152cc5e193a83f6c18a1bb8bbd9528f4d374297` | `3a76793ab6ebc82e80d92e8d2178f121998302941275f5d6947993f64dd343f9` |
| `test/bell-deploy-config.test.ts` | `4e2e29c4444a5f807f10995d0a48c085db38e1be48dfcc4748474e4542bf1209` | `1cfed521416233b35f441ac02a14c86b6595554f4bf458d13006d5e056ecc800` |
| `docs/G1-lot-codeql-alerts-1.md` (nouveau) | — | cf. `F:\tmp\codeql-alerts-1\DELIVERED.sha256` (un journal ne peut porter son propre sha) |

Tous les fichiers sont en LF (0 CR mesuré sur les cibles). Aucun fichier nouveau hors ce journal ; aucune dépendance
ajoutée (R-8 : `package.json`/`package-lock.json` intacts).

## Invariants octet-identiques (A-6)

- Gel U-4b, 9/9, LF sha256 blob HEAD = arbre de travail, AVANT (03:07Z) ET APRÈS (03:3xZ) : `u4b-scores.mjs`
  `2f9a31f6…`, `u4b-reduce.mjs` `a5e66cd3…`, `record-u4b-calib.mjs` `5733daeb…`, `wadray.ts` `7bee76fc…`, `abi.ts`
  `3376eb08…`, `l1-split.ts` `9206df91…`, `apps/sentinel/src/rpc.ts` `0e232519…`, `calib-digest.ts` `3603265d…`,
  `u3-realized.mjs` `cb020425…` — **SAME ×9 avant et après** (aucun n'est touché : `git status` ne les liste pas).
- Test de régression D3 : tranche `test/site-build-fleet.test.ts:82-129` sha `c2f03ba817d15151c7245f0d9774bc5e0d26f23ac5c225613ef52a016b2c619b`
  AVANT = APRÈS (le test nouveau est ajouté en fin de fichier).
- Garde `/<script\b/i` + son message (base l.65-66) : présents verbatim, 1 occurrence, dans le nouveau fichier (recompte
  node, `guard-check.mjs`, A-13).
- `extractMain`, `mainCorpus`, `decodeEntities`, `assertFleetBody`, `assertUkemiBody` : non modifiés (diff limité au bloc
  `renderedBody`).
- **Re-mesurés après le pli G2** (05:1xZ) : gel U-4b SAME ×9 ; tranche l.82-129 `c2f03ba8…` inchangée (les vecteurs du
  pli sont dans le test de FIN de fichier) ; garde `/<script\b/i` + message présents verbatim ×1 (`guard-check.mjs`) ;
  0 CR sur les 4 fichiers pliés ; 0 caractère non-ASCII ajouté.

## Tuyaux (règle Branchement) — preuve par tuyau

| Tuyau (ADR) | Entrée | Sortie | Test d'intégration non-LLM (mesuré) |
|---|---|---|---|
| `ci.yml` → GitHub Actions | bloc `permissions` | jobs sous `contents: read` ; miroir dérivé idem | `ci_workflow_declares_least_privilege_permissions` (lit le fichier ET `derivePublicWorkflow`) ; test 42 (CI exportée verte) ; run vert de la fenêtre = I-1/I-3 |
| `transport.ts` (`redact`) → quorum / journaux | corps d'erreur RPC keyless | corps rédigé | client gardé réel, seul `fetch` bouchonné : `error-hint.test.ts` `:145`, `:186`, test nouveau ; `multi-operator.test.ts:312-313` ; `ukemi-guard-record.test.ts` (`rpcErrorsOf`, corps keyless rédigé journalisé) ; 17 importeurs `rpc-guard` verts |
| `assert-fleet-html.mjs` → `g3-site` | HTML rendu | texte contrôlé | `site-build-fleet.test.ts:82` (octet-identique) + `rendered_body_scanner_outcomes` (dont T1-T3, Rd, GM4) + `site-ukemi.test.ts` (via `assertUkemiBody`) ; pli G2 : composition servie rejouée sur l'artefact RÉEL construit hors réseau (19/19 pages identiques, `node scripts/assert-fleet-html.mjs` exit 0) + énumération exhaustive contre oracle de référence (0 nouveau texte caché compté) |

## R-25 (A-5)

Au G1 : `git diff --shortstat e7af51c` (pathspec de la mission et pathspec verbatim de `ci.yml:71`) ⇒ +234 −36 =
**270**. **Après le pli G2** (pathspec VERBATIM de la ligne `STAT=` de `ci.yml`, l.71, exclusions séries bell comprises)
: `13 files changed, 277 insertions(+), 36 deletions(-)` ⇒ **313**. Le pli seul, face à lot-v1 : +74 −31 sur 4 fichiers
(`assert-fleet-html.mjs` +57 −25, `site-build-fleet.test.ts` +10 −1, `ukemi-guard-record.test.ts` +3 −2,
`bell-adv-1.test.ts` +4 −3). Au-dessus de la fourchette indicative 150-300 de l'ADR, sous la borne 1 205 et le seuil
STOP A-5 (1 150) : mesuré, pas rogné.

## Consigne standard : point par point

- A-1 fait (l.1). A-2 fait (`npm ci`, D-8 ; `require.resolve` dans le worktree). A-3 fait pour l'oracle ; D-9 pour
  `npm ci`. Oracle : 7 portes + tests ciblés (§Oracle) ; `npm test` complet NON lancé (ordre de mission : orchestrateur).
- A-4 fait : `F:\tmp\codeql-alerts-1\DELIVERED.sha256` (chemins relatifs au worktree) ; aucun commit ; rien sur C: (cache
  npm `F:\cache\npm`, `TEMP/TMP/TMPDIR=F:/tmp`) ; réseau : registre npm (`npm ci`) seulement ; tests en boucle locale
  (`127.0.0.1`) et `fetch` bouchonné.
- A-5 fait (270 au G1 ; 313 après le pli). A-6 fait (9/9 avant/après + invariants, re-mesurés après le pli). A-7 fait
  (wrapper `ev.sh` ; build sous `pli\ev-build.sh` = `ev.sh` + `NEXT_TELEMETRY_DISABLED=1`), écart D-7 déclaré.
- A-8 : le test D2 alimente le transport réel par un corps HTTP 400 texte, forme d'un corps d'erreur keyless ; les
  entrées D3 sont des chaînes synthétiques de forme React (fixtures existantes) ET, au pli, les 19 pages RÉELLEMENT
  construites par `next build` (I-2 clos).
- A-9 / A-10 : n-a (aucune phrase servie ni valeur câblée vers une surface servie n'est modifiée).
- A-11 fait (harnais TAP, `byIntended` : 14/14 au G1, 21/21 au pli). A-12 partiel, déclaré : chaque TAP de mutant porte node, fichier de
  test, statut et sha muté ; l'identité de l'arbre (base `e7af51c` + diff non commité, épinglé par
  `DELIVERED.sha256`) est dans l'en-tête de ce journal, pas dans chaque en-tête de TAP. A-13 fait (sources à antislash par Edit/Write ; recomptes node
  `hunk-check.mjs`, `guard-check.mjs` ; deux recomptes bash faussés par le transport, refaits dans node).
- B-1 n-a (chemin payant inchangé : `closedHint`). B-2 tenu (`keyless_host_after_truncation…` vert). B-3 n-a
  (énumération des cibles inchangée). B-4 tenu (aucune lecture d'env ajoutée). B-5 n-a (aucun site `fetch` nouveau).
  B-6 : `bell_adv1_stub_routes_rpc_by_exact_https_host` épingle l'hôte ADMIS `api.mainnet.solana.com` (mutant M11).
- C-1..C-4 : n-a (classes d'erreur et classifieurs inchangés).
- D-1 fait (14 mutants nommés au G1 ; 21 au pli, dont GM4p/GM7/GM7b et MT1-MT4 ; tous tués par le test visé). D-2
  fait (vecteurs non vides, sorties exactes). D-3 fait (§Tuyaux). D-4 fait : aucune assertion retirée ni affaiblie —
  le diff des tests est additif, sauf les 4 conditions de stub rendues plus strictes et le renommage `match`→`matches`
  ; au pli, uniquement des ajouts (5 vecteurs, 2 leurres).
- E-1..E-3 : n-a. F-1 : l'ADR n'est pas modifié par le worker (tuyaux et résidus au présent journal ; report à l'ADR =
  orchestrateur). F-2 fait (0 non-ASCII ajouté, `gate:vocab` propre). F-3 fait (D-1..D-10). G-1 : n-a pour le worker.
  D-1-bis fait (restauration durable + relecture du sha).

## Oracle final (A-3 : codes capturés directement ; A-7 : `ev.sh`)

Au G1, arbre LOT-V1, conservé pour l'histoire ; l'oracle qui fait foi pour l'arbre livré est celui du pli (sous-section
suivante). Commandes lancées depuis `F:\Monark-wt-codeql`, journaux sous `F:\tmp\codeql-alerts-1\final\` (03:30:44Z →
03:43:54Z).

| Porte / suite | Résultat |
|---|---|
| `npm run gate:vocab` | exit 0 — `gate:vocab OK — scanned 256 file(s), no forbidden claim.` |
| `npm run typecheck` | exit 0 (`tsc --noEmit` ; `RegExp.escape` et `URL.canParse` typés) |
| `npm run lint` | exit 0 |
| `npm run lint:ratchet` | exit 0 — `lint-ratchet: 69/69` (plafond `lint-ratchet.json` = 69, inchangé) |
| `npm run lang:gate` | exit 0 — 0 non-exempt French hit, 12 scopes |
| `npm run export:check` | exit 0 — 0 forbidden path, 0 non-exempt French hit |
| `node --test --test-force-exit` liste de la mission (`test/ci-gates`, `test/site-build-fleet`, `packages/rpc-guard/test/*`, `apps/bell/test/bell-served-e2e`, `apps/bell/test/bell-adv-1`, `apps/sentinel/test/ukemi-guard-record`, `test/bell-*`) + ajouts D-10 (`test/site-ukemi`, `test/cra-b`, `apps/bell/test/bell-verify`) | exit 0 — **220 tests, 220 pass, 0 fail, 0 skip** (ligne de base AVANT : 214/214 ; +6 tests nouveaux) |
| 17 autres importeurs de `rpc-guard` (D2) | exit 0 — 187 tests, 186 pass, 0 fail, 1 skip (`sentinel_run_releases_chainstack_lock_on_sigterm`, SKIP win32 déclaré, préexistant) |
| `test/export-public.test.ts` (test 42 : export complet + `npm run ci` de l'arbre exporté ; 42(f')) | exit 0 — 2/2 (343 s) |

`derivePublicWorkflow` lu directement (sortie `derived-head.txt`) : `on:` / `push:` / `pull_request:`, puis
`permissions:` / `  contents: read`, puis `jobs:` ; 0 mention `r25` ; 1 clé `permissions`.

### Oracle du pli G2 (arbre livré ; fait foi ; A-3 : codes capturés directement ; A-7 : `ev.sh`)

Journaux sous `F:\tmp\codeql-alerts-1\pli\final\` (05:05:05Z → 05:16:56Z), sur l'arbre plié, APRÈS les 21 mutants et
leurs restaurations (sha `DELIVERED.sha256` relus OK).

| Porte / suite | Résultat |
|---|---|
| `npm run gate:vocab`, `typecheck`, `lint`, `lang:gate`, `export:check` | exit 0 ×5 |
| `npm run lint:ratchet` | exit 0 — `69/69` (plafond inchangé) |
| liste ciblée de la mission + ajouts D-10 (`test/site-ukemi`, `test/cra-b`, `apps/bell/test/bell-verify`) | exit 0 — **220 tests, 220 pass, 0 fail, 0 skip** (les vecteurs du pli sont des assertions ajoutées à des tests existants : le nombre de tests ne change pas) |
| importeurs de `rpc-guard` (liste G2 de 20 fichiers, `g2\rpcguard-importers-run.txt`) | exit 0 — 232 tests, 230 pass, 0 fail, 2 skip préexistants déclarés (`sentinel_run_releases_chainstack_lock_on_sigterm` SKIP win32 ; `u4b_labels_replay_via_main_real_artifact` SKIP artefacts e2 réels absents) — mêmes comptes que G2 |
| `test/export-public.test.ts` (test 42) | exit 0 — 2/2 (05:10:28Z → 05:16:56Z) |
| g3-site sur artefact construit hors réseau | exit 0 (§« G2 pliée ») |
