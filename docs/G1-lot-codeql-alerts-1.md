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
- **Pli G2 delta** (mission orchestrateur reçue après la revue G2 du delta, gel `8229745` commité ; même worktree,
  par-dessus le gel, sans commit ; §« G2 delta pliée ») : ~07:05Z lecture du rapport `g2b\G2-delta-report.md` et de ses
  artefacts ; 07:14:28Z copies du gel (`pli2\gel\`) ; ~07:15Z relecture [lu] des états commentaire 13.2.5.43-.52 ;
  ~07:16Z advisor intégré (conception, avant code : variante A de la règle d'ambiguïté, bifurcation soumise) ; ~07:17Z
  vecteurs validés contre parse5 (`pli2\vectors-pli2.mjs`, 28/28) puis écrits D'ABORD : rouges sur le gel (07:18:44Z) ;
  ~07:20Z pli du scanner, fichiers touchés verts 52/52 ; 07:21Z PLI2 figé (`ea466fe3…`), variante B dérivée
  (instrument) ; 07:22:16Z → 07:54:49Z énumération exhaustive jusqu'à 7 jetons (183 063 615 séquences, 15 tranches) ;
  07:26:39Z → 07:27:17Z `next build` hors réseau (0 connexion), 19/19, g3-site vert ; 07:28:12Z → 07:29:21Z 6 portes ;
  07:32:04Z → 07:32:41Z différentiel exhaustif de la grammaire des commentaires contre parse5 (0 désaccord) ; ~07:33Z fuzz
  du relecteur rejoué ; ~07:37Z advisor intégré (fuzz : recadrage du critère, classement par accident) ; 07:41:16Z →
  07:44:18Z 39 mutants ; 07:44Z oracle ciblé : 1 rouge (D-11), corrigé, identité prouvée ; 07:47:35Z → 07:50:19Z 39 mutants
  rejoués sur l'arbre final ; 07:55:40Z → 08:03:39Z oracle final ; 07:55:35Z → 08:00:19Z classement exhaustif jusqu'à 7 jetons ; 08:04:09Z →
  08:04:22Z build final hors réseau (0 connexion), 19/19, g3-site vert ; ~08:08Z advisor intégré en clôture (livrables
  écrits) : aucun blocage ; deux retouches demandées, faites (P2 dans les améliorations, cette consultation au journal).
  Avis, jamais verdict.
- **Pli 3** (décision investisseur 187, option B de l'escalade L-2 du checkpoint-2 bis ; même worktree, par-dessus le gel 2
  `f33e6c5`, sans commit ; §« Pli 3 ») :
  - 13:33:37Z : `cp2b\CP2b-report.md` lu en entier ; ancrage vérifié (HEAD `f33e6c5`, `git status` vide, blobs = sha de
    passation 14/14) ; ~13:34Z : décision investisseur 187 reçue (option B).
  - ~13:40Z : sonde L-2 contre parse5 (`pli3\probe-l2.mjs`) ; relecture [lu] des états et règles du texte brut.
  - avant 14:00Z : advisor intégré (conception, avant code : trois clauses, garde linéaire, vecteurs).
  - 14:00:10Z : vecteurs écrits d'abord, rouges sur le gel 2.
  - ~14:01Z : pli du scanner ; `durable.test.ts` d'abord (1/1), fichiers touchés 53/53 ; PLI3 figé (`fcbd28b0…`).
  - 14:03:13Z → 14:28:47Z : énumération 7 jetons (183 063 615 séquences, 225 tranches).
  - 14:07:04Z → 14:13:28Z : 51 mutants.
  - 14:14:47Z → 14:16:19Z : `next build` hors réseau (0 connexion), 19/19, g3-site vert.
  - 14:17:22Z → 14:30:47Z : oracle.
  - 14:29:53Z → 14:33:10Z : variante `<title>`, fuzz et énumération attribut (constat L-3).
  - ~14:34Z : sonde de temps.
  - ~14:41Z : G1, sha de passation (DELIVERED.sha256 du gel 3), diffs ; advisor intégré en clôture.
  - 14:46:48Z → 14:47:50Z : différentiel de commentaires sur le blob livré (0 désaccord), 6 portes rejouées après le G1.
- **Pli des corrections de la G2 de confirmation** (mission orchestrateur ; même worktree, par-dessus le gel 3 `6443dcc`,
  sans commit ; §« G2 de confirmation pliée ») :
  - 15:57:29Z : ancrage (HEAD `6443dcc`, `git status` vide, blobs du gel 3 = livraison du pli 3, 14/14) ; rapport lu.
  - 16:00:46Z → 16:00:49Z : X12/X13 AVANT le diff : survivants, 8/8 (constat m-1 reproduit).
  - ~16:01Z : diff m-1 appliqué (+3 lignes, = fichier `b` du relecteur).
  - 16:01:45Z → 16:01:47Z : X12/X13 APRÈS : tués, restaurés à l'octet.
  - ~16:02Z : fusion vérifiée contre `lot/etude-suite` `833dce9` (1 zone).
  - 16:03:55Z → 16:04:33Z : build hors réseau (0 connexion), 19/19 identique au gel 3, g3-site vert.
  - ~16:07Z : textes du G1 (M-2, m-2, m-3, M-1).
  - 16:08:16Z → 16:09:49Z : oracle ; 16:10:04Z : R-25 et invariants.
  - 16:10:59Z → 16:11:41Z : 6 portes rejouées sur l'arbre final (G1 rempli) ; balayage A-7 (0 fichier, témoin positif vu).
  - ~16:12Z : advisor intégré en clôture : aucun blocage ; chiffres rafraîchis (R-25 en I-8, « ×5 » des résidus identiques,
    mesuré à 16:15:38Z, `pli4\residuals-x5.log`) ; puis `DELIVERED.sha256` et diffs. Avis, jamais verdict.
- **Pli 5** (décision investisseur 205 ; même worktree, par-dessus le gel 3 bis `624550a`, sans commit ; §« Pli 5 ») :
  - 19:12:41Z : ancrage (HEAD `624550a`, `git status` vide, blobs du gel 3 bis = livraison du pli des corrections, 14/14) ;
    ligne `STAT=` à la l.71 ici, à la l.65 dans `lot/etude-suite` (texte identique) ; tête `lot/etude-suite` `c56c746`.
  - ~19:14Z : relevé d'`apps/site` ; classe actuelle des 4 formes : UNDER (`pli5\family-now.log`).
  - ~19:16Z : advisor intégré (conception des deux gardes, avant code).
  - ~19:17Z : gardes écrites (+51 lignes en fin de fichier) ; 10/10 verts.
  - 19:19:36Z → 19:19:39Z : 5 mutants de gardes, tués, restaurés à l'octet.
  - ~19:20Z : `git merge-tree` (1 fichier en conflit) et `merge-file` sur la copie de travail (1 zone).
  - 19:20:22Z → 19:20:44Z : build hors réseau (0 connexion), 19/19 identique au gel 3 bis, g3-site vert.
  - 19:21:03Z → 19:22:10Z : oracle ; 19:22:24Z : R-25 et invariants.
  - ~19:24Z : textes du G1 (I-9, I-10, I-6, I-8, D-15, D-20, Tuyaux) ; 19:25:02Z → 19:25:41Z : 6 portes rejouées sur l'arbre avec le G1 écrit ;
    balayage A-7 (0 fichier, témoin vu).
  - ~19:27Z : advisor intégré en clôture : le message de la garde 1 prétendait à la conformité ; reformulé (D-21), test +1
    ligne (`58935e6e…`).
  - 19:31:14Z → 19:32:17Z : oracle rejoué sur le test final (10/10, 224/224, 6 portes) ; 19:32:18Z → 19:32:21Z : 5 mutants
    rejoués (`pli5\run2\`), tués, restaurés à l'octet ; R-25 = 546 ; fusion : 1 zone.
  - ensuite : G1 mis à jour, `DELIVERED.sha256`, diffs, rendu `pli5\PLI-5.md`. Avis, jamais verdict.

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
  - **pli face à l'ancien : 0 ; pli face à lot-v1 : 0** — sur cet alphabet de 9 jetons et jusqu'à 6 jetons SEULEMENT
    (borne corrigée au pli G2 delta, M-4) : au-delà, le G2 du delta a trouvé B-2 (U1b, 7 jetons avec `<!-->`) ; mesure
    refaite jusqu'à 7 jetons sur 15, §« G2 delta pliée ».
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

## G2 delta pliée (2026-09-24, ~07:10Z → 08:07Z ; rapport `F:\tmp\codeql-alerts-1\g2b\G2-delta-report.md`, gel `8229745`)

Mission orchestrateur reçue après la revue G2 du delta (même worktree, par-dessus le gel 1 commité, sans commit). Lus
avant tout pli : le rapport (320 lignes), `g2b\vectors-under.log`, `g2b\vectors-g2b.log`, `g2b\enum\new-vs-old-L6.txt`,
`g2b\killmatrix\killmatrix.out`, `g2b\depth-probe.log`. Règles relues [lu] par le worker sur la copie locale de la
spécification (`g2\whatwg-parsing.html`, sha `de2e84b4…`) : les états commentaire 13.2.5.43 à 13.2.5.52 en entier, et
la numérotation des états script data échappés et double échappés (13.2.5.18 à 13.2.5.31). Copies de référence figées
sous `F:\tmp\codeql-alerts-1\pli2\` : `gel\` (les 6 fichiers au gel), `pli2-final-assert-fleet-html.mjs` (sha `f40333f2…`,
l'arbre livré). Les instruments ont tourné sur la copie `pli2-assert-fleet-html.mjs` (sha `ea466fe3…`), qui ne diffère de
la finale que par 2 lignes de commentaire (D-11) ; identité de comportement prouvée sur les 813 615 séquences E15 de 1 à
5 jetons (`pli2\identity-check.log` : 813 615 sorties identiques, chaîne ou message levé, 0 différente).

| Constat G2 delta | Pli | Preuve |
|---|---|---|
| **B-2** (bloquant) : dans un template, la branche commentaire (« `<!--` jusqu'à la première `-->` ») court au-delà de la fin réelle d'un commentaire abrupt, avale l'ouvrante d'une surface cachée POSTÉRIEURE et fait compter sa charge (U1-U7) ; U1b ne lève plus | `commentEnd(html, lt)` : fin de commentaire du navigateur, partout où la branche s'applique (racine et contenu de template) : `<!-->` et `<!--->` se ferment aussitôt (13.2.5.43/.44) ; sinon juste après le premier `--` suivi de `>` ou de `!>` (13.2.5.51/.52) ; les états « `<!--` dans un commentaire » (13.2.5.46-.49) ne déplacent pas cette fin ; non fermé : throw (message nommé `no matching --> or --!>`) | test nouveau `rendered_body_comment_forms_and_template_depth` : U1, U2, U3, U7 ⇒ `VA` ; U6 ⇒ l'en-tête seul ; U1b ⇒ throw `unclosed <script> block` ; Rb4t exact. Rouges sur le gel (`pli2\vectors-on-gel.log`, `pli2\red-on-gel.tap`), verts ensuite. Différentiel exhaustif de la seule grammaire contre parse5 (ci-dessous) : 0 désaccord |
| **L-1** (décision orchestrateur : dans le périmètre, même correctif) | le même `commentEnd` sert à la racine | Lb1, Lb2 ⇒ throw `unclosed <script> block` (lettre de D3 (iv) rétablie) ; Lb5, Lb6 ⇒ `VA` ; Rb1 `<!-->`, Rb2 `<!--->`, Rb3 `--!>` seuls et Rb4 ⇒ exacts ; Rb5 `<!--!>` ⇒ throw (ne ferme rien, 13.2.5.43) |
| `<!--` en texte brut ou en valeur d'attribut : règle explicite fail-closed demandée | le scanner ne voit ni le texte brut (M-24) ni les attributs : un `<!--` n'y est pas un commentaire pour le navigateur. Règle : si l'étendue d'un commentaire contient l'ouvrante d'une surface cachée (`<script`, `<noscript`, `<template` + frontière de nom, casse ASCII indifférente), les deux lectures divergent sur ce qui suit (l'une cache la surface, l'autre l'exécute) : throw nommé `a <!-- comment spans a <name> opener` | Lb3 (`<style>`), Lb4 (attribut), U4, U5 (dans un template), Ca1-Ca3 ⇒ throw nommé. Portée : les OUVRANTES seulement (variante A) ; la variante B (ouvrantes + une fin `</template` dans le contenu d'un template) est mesurée en instrument et laissée à l'arbitrage (§Résidus : S1t/Rft ; « Needs » du rendu) |
| **M-1** : MT5, MT6, MT6b survivants | vecteurs Tcase, Tws (`</template \t\n\f\r>`), Tx (`</templatex>`), Tc (commentaire contenant `</template>` dans un template ⇒ `VA`) dans `rendered_body_scanner_outcomes` | MT5p, MT6, MT6b tués par le test visé (§Table des mutants, pli G2 delta) |
| **M-2** : récursion non bornée (`RangeError` à 9 629 niveaux) | `MAX_TEMPLATE_DEPTH = 256` : `templateEnd(html, from, depth)` lève `<template> nested deeper than 256 levels` ; `depth` propagé par `surfaceEnd(html, lt, depth)` | D256 ⇒ `VDEEP`, D257 ⇒ throw nommé ; MC6, MC7, MC8 tués |
| **M-3** : GM7c, GM7d survivants | leurres `https://a.eth.drpc.org` (ukemi) et `https://a.api.mainnet.solana.com/` (bell) | GM7c, GM7d tués ; GM7e, GM7f, GM7g aussi |
| **M-4** : déclarations du G1 inexactes | §« G2 pliée » (borne d'alphabet), D-1, §Résidus, I-4 corrigés en place | ci-dessous et en place |
| O-2 : docstring de `closerEnd` | « exact pour noscript (RAWTEXT) et le script data simple ; états échappé et double échappé (13.2.5.18-.31) non modélisés (R-e) » | diff |
| O-1 : drapeau `doubleEscaped` de `pli\enum-under-list.mjs` (regex contiguë, faux sur 12 des 34 lignes) | le G1 n'a jamais conclu sur ce drapeau ; la classe R-e des 34 lignes est confirmée par le relecteur (34/34 sur l'arbre parse5) | `g2b\enum\re-signature.out` |

**Grammaire des commentaires : différentiel exhaustif contre parse5** (`pli2\comment-grammar-diff.mjs`, sortie
`pli2\comment-grammar-diff.log`). `commentEnd` (copie figée + une ligne `export`, `pli2\instr-commentEnd.mjs`) contre la
fin du premier commentaire selon parse5 8.0.1 (copie du relecteur, intégrité sha512 vérifiée), pour `<!--` suivi de toutes
les chaînes de 0 à 9 caractères sur `{-, !, >, <, x}` (les caractères qui pilotent les états 13.2.5.43-.52, `x` = tout
autre). Fermé selon parse5 = même fin en ajoutant un `Z`, qui ne peut rien fermer. **2 441 406 chaînes : 708 219 fermées
à la même position, 1 733 187 non fermées des deux côtés, 0 désaccord.** (Un premier critère, « erreur
`eof-in-comment` », attribuait à tort au premier commentaire l'erreur d'un second `<!--` : instrument corrigé, écart
déclaré.)

**Énumération exhaustive, mécanisme du relecteur** (`pli2\enum\enum-pli2.mjs` : oracle `g2b\enum\p5oracle.mjs`
importé tel quel, marqueurs `A${p}_`, alphabet de 15 jetons dans l'ordre du relecteur ; 15 tranches par premier jeton en
parallèle, 07:22:16Z → 07:54:49Z ; fusion `pli2\enum\L7-merged.out`). Cinq implémentations : ANCIEN (`e7af51c`), LOT-V1, GEL
(`8229745`), PLI2, et VARB (variante B de la règle d'ambiguïté, instrument hors lot). Quatre vues du même passage, selon
les jetons employés : E15 (tout), E11 (les 9 du worker + `<!-->` + `--!>`, l'alphabet demandé), M9 (l'alphabet L7 du
relecteur), W9 (les 9 du worker).

| Vue (jusqu'à 7 jetons) | Séquences | PLI2 : exact / UNDER / OVER / UNDER+OVER / throw | PLI2 UNDER, toutes causes (GEL) | **NOUVEAU caché PLI2** face à l'ANCIEN / LOT-V1 / GEL | nouveau sur-retrait PLI2 face à l'ANCIEN / LOT-V1 / GEL |
|---|---|---|---|---|---|
| E15 | 183 063 615 | 45 819 869 / 44 537 / 348 663 / 228 / 136 850 318 | 44 765 (232 518) | **361 / 6 082 / 9 189** | 30 108 / 1 573 / 1 302 |
| E11 | 21 435 887 | 4 209 865 / 1 148 / 0 / 0 / 17 224 874 | 1 148 (58 640) | **4 / 140 / 140** | 0 / 0 / 0 |
| M9 | 5 380 839 | 1 348 238 / 730 / 0 / 0 / 4 031 871 | 730 (21 408) | **4 / 110 / 110** | 0 / 0 / 0 |
| W9 | 5 380 839 | 780 686 / 689 / 0 / 0 / 4 599 464 | 689 (689) | **0 / 0 / 0** | 0 / 0 / 0 |

Pour mémoire, UNDER de chaque version sur E15 : ANCIEN 13 721 008, LOT-V1 387 636, GEL 232 518, PLI2 44 765 ; sur W9 : ANCIEN 730 788, LOT-V1 22 691, GEL 689, PLI2 689. Variante B (instrument) : passe d'exact (chez PLI2) à throw sur 12 258 séquences E15 (E11 2 337, W9 471) ; nouveau sur-retrait face à l'ANCIEN 30 096 (PLI2 30 108). Coût de levée de PLI2 (exact chez X, throw chez PLI2) sur W9, où la règle d'ambiguïté est la seule différence avec le GEL : 154 920 face au GEL.

**Classement de chaque nouveau texte caché compté** (`pli2\enum\enum-classify.mjs`, `fuzz-classify.mjs`, partition
`partition.mjs`, vues `views.mjs`). Pour chaque séquence où PLI2 compte un marqueur caché `m` que X (ANCIEN, LOT-V1, GEL)
ne comptait pas (X levait, ou ne gardait pas `m`) : S' = S avec `<!-->` → `<!---->` et `--!>` → `-->` (le navigateur lit
chaque paire de la même façon comme jeton commentaire) ; « accident » = parse5 donne à S' les mêmes marqueurs visibles
qu'à S ET X compte `m` sur S' : X ne manquait `m` que parce que SA grammaire des commentaires lisait mal une forme abrupte
(levée « non fermé », ou texte coupé ailleurs), pas parce qu'il classait `m` juste. Le marqueur est alors caché par une
construction hors modèle (R-h texte brut, R-a fermante, R-e double échappement), que X compte aussi.

| Portée | Nouveau caché de PLI2 face à | Total | Accident, normalisation complète | Accident, normalisation partielle (seulement `<!-->`) | R-h (`<style>` en texte brut) compté à l'identique par LOT-V1 et le GEL | R-h, et accident pour LOT-V1 / GEL | Inexpliqué |
|---|---|---|---|---|---|---|---|
| ≤ 7 jetons, E15 | ANCIEN | 361 | 278 | 0 | 79 | 4 | **0** |
| ≤ 7 jetons, E15 | LOT-V1 | 6 082 | 6 076 | 6 | — | — | **0** |
| ≤ 7 jetons, E15 | GEL | 9 189 | 9 183 | 6 | — | — | **0** |
| ≤ 7 jetons, E11 (M9) | ANCIEN / LOT-V1 / GEL | 4 / 140 / 140 (4 / 110 / 110) | 4 / 134 / 134 | 0 / 6 / 6 | 0 | 0 | **0** |
| ≤ 7 jetons, W9 | les trois | 0 | — | — | — | — | **0** |
| fuzz, 7 à 12 jetons (10^6) | ANCIEN / LOT-V1 / GEL | 26 / 135 / 165 | 20 / 134 / 164 | 0 / 1 / 1 | 4 / — / — | 2 / — / — | **0** |

Sources : `pli2\enum\C7-partition.out`, `C7-views.out`, `C7-refine.out` (7 jetons, 9 276 enregistrements, classement
07:55:35Z → 08:00:19Z) ; `pli2\enum\C6-all.jsonl` (6 jetons : 277 enregistrements, tous des accidents sauf 1, R-h
compté aussi par LOT-V1 et le GEL) ; `fuzz-classify.jsonl`, `fuzz-refine.out`. Lecture :
- les accidents à normalisation partielle sont des R-e : un `--!>` DANS le texte d'un script échappé n'équivaut pas à
  `-->` (états script data échappés), donc seule la forme `<!-->` hors du script est normalisée ;
- les 83 cas R-h face à l'ANCIEN sont des cas où l'ANCIEN levait par sa garde `<script` (sur une ouvrante fantôme logée
  dans le texte brut d'un `<noscript>`, ou sur l'ouvrante réelle qu'une ouvrante lue dans un `<style>` avale) ;
- le marqueur y est caché par un `<style>` que le scanner ne modélise pas (M-24) : dans un template (R-h déclaré) ou à la
  racine (`<style><noscript></style><script></noscript>A`, R-h racine, préexistant depuis LOT-V1, « Needs »).

Aucun de ces cas ne relève du mécanisme B-2/L-1 (une ouvrante avalée par un commentaire mal lu) : la fin de commentaire est
celle du navigateur (différentiel ci-dessus) et toute étendue de commentaire contenant une ouvrante lève (règle
d'ambiguïté). Le critère littéral « 0 nouveau caché face à l'ancien et face à lot-v1 » n'est donc pas atteignable par la
seule correction de la grammaire des commentaires : cette correction retire des levées qui masquaient par hasard des
résidus préexistants (« Needs » du rendu).

**Fuzz du relecteur rejoué** (`g2b\enum\fuzz-ext.mjs` copié, seuls l'import de l'oracle et le chemin PLI changent,
`pli2\enum\fuzz-ext-pli2.out` ; 10^6 échantillons de 7 à 12 jetons, graine `20260924`) : PLI2 nouveau caché face à LOT-V1
135, face à l'ANCIEN 26, face aux deux 21 ; nouveau sur-retrait face à LOT-V1 80, face à l'ANCIEN 262. Classés
(`pli2\enum\fuzz-classify.jsonl`, mêmes tirages : comptes identiques, contrôle) : 170 enregistrements ; face à LOT-V1 134
accidents + 1 R-e hors normalisation ; face au GEL 164 + le même ; face à l'ANCIEN 20 accidents + 6 non-accidents, tous
R-h (un `<noscript>` ou une fin `</template>` logés dans un `<style>` non modélisé) : les 4 à la racine sont comptés à
l'identique par LOT-V1, GEL et PLI2 (préexistants depuis LOT-V1), les 2 autres sont des accidents pour LOT-V1 et le GEL.

**Artefact réel** (arbre du pli avant D-11 ; identité de comportement ci-dessus)
- Moniteur `pli\netmon.ps1` (inchangé) auto-testé sans réseau externe par la sonde locale du relecteur (serveur et client
  node sur l'adresse non-loopback `192.168.100.2`, connexion tenue 3 s) : 2 connexions vues (`pli2\build\netmon-selftest.log`).
- `npm run build -w @monark/site` sous `pli\ev-build.sh` : exit 0 de 07:26:39Z à 07:27:17Z, 19 routes ; moniteur : **0
  connexion**, jusqu'à 24 processus node du build ; 6/6 configurations suivies inchangées ; `.next` et `next-env.d.ts`
  (créé à 07:27:04Z, ignoré par git) retirés ensuite.
- `renderedBody` ANCIEN = LOT-V1 = GEL = PLI2 octet pour octet sur les **19/19** pages (`pli2\build\real-compare4.log`) ;
  empreintes de sortie identiques à celles des builds précédents (ex. /fleet `c943be8c…`) ; comptes : 0 `<template`,
  0 `<!-->`, 0 `<!--->`, 0 `--!>`, 0 commentaire contenant un `<` (la règle d'ambiguïté ne peut s'y déclencher).
- g3-site `node scripts/assert-fleet-html.mjs` : **exit 0** (/fleet 33 813 caractères, 4 notes ; /ukemi 0 jeton
  numérique, statut `built`, 4 678 caractères). Rejoué sur l'arbre FINAL (après D-11) : `next build` exit 0 de 08:04:09Z à 08:04:22Z, moniteur 0 connexion (24 processus observés), 19/19 identiques ANCIEN = LOT-V1 = GEL = PLI2 final (`pli2\build\real-compare4-final.log`), g3-site exit 0 (`pli2\build\g3-site-final.log`) ; `.next` et `next-env.d.ts` retirés.

**D-11 (incident mesuré, corrigé).** Premier oracle ciblé du pli (07:44Z) : 220 pass, **1 fail**,
`durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` (`packages/rpc-guard/test/durable.test.ts:188`).
Ce test balaie les sources à la recherche de `from` + guillemet + spécificateur + guillemet sur une même ligne ; la
nouvelle docstring de `templateEnd` (« starts at `from`, else -1; `depth` is… ») lui présentait le « spécificateur »
`, else -1; ` (espace finale : « canonical spelling »). Reformulée (2 lignes de commentaire, aucun code) ; le test repasse ;
identité de comportement prouvée (ci-dessus) ; mutants, portes, oracle et build rejoués sur l'arbre final.

## Pli 3 (L-2, décision investisseur 187 ; 2026-09-24, ~13:33Z → 14:41Z)

**Mandat.** Checkpoint-2 bis sur le gel 2 `f33e6c5` (`F:\tmp\codeql-alerts-1\cp2b\CP2b-report.md`, validateur
`claude-fable-5-1`, lu en entier avant tout pli : (a) à (f), C-1 bis à C-6) : ACCEPTE-AVEC-CORRECTIONS et ESCALADE sur L-2.
Décision investisseur 187 : option **B** (correction fail-closed) ; le correctif préparé devient le pli 3 officiel, gel 3
ensuite, une seule G2 de confirmation sur `8229745..gel 3`, puis un checkpoint-2 ter court (règle (a)-4 du CP2b). Même
worktree, par-dessus le gel 2 commité, sans commit.

**Règles relues [lu]** (copie locale de la spécification, sha `de2e84b4…`) :
- tokenizer 13.2.5.2 (RCDATA), 13.2.5.3 (RAWTEXT), 13.2.5.5 (PLAINTEXT) ;
- 13.2.5.11 et 13.2.5.14 (fin de balise : `</nom` puis un espace, `/` ou `>` ; sinon le texte est émis tel quel) ;
- arbre 13.2.6.4.4 « in head » : `title` en RCDATA, `noframes` et `style` en texte brut ;
- arbre 13.2.6.4.7 « in body » : `textarea` en RCDATA, `xmp`, `iframe` et `noembed` en texte brut, `plaintext` sans issue (« no
  way to switch the tokenizer out of the PLAINTEXT state ») ;
- 13.2.6.4.16 « in template » (relu au pli G2) : `style`, `title`, `noframes` par les règles « in head ».

**Constat (CP2b (c)).** `<style><noscript></style><script></noscript>A` : pour parse5, `<script>` n'est jamais fermé et `A`
est caché ; l'ANCIEN levait (garde `<script` après retrait des scripts) ; LOT-V1, le GEL et le GEL2 comptent `A`. Sonde
worker `pli3\probe-l2.mjs` (25 vecteurs, 0 écart main/parse5) : même régression pour les sept éléments à texte brut ou
RCDATA ; variante à script fermé (L2c : ANCIEN exact) ; R-h dans un template dont l'accident de commentaire du GEL2 venait de
lever le masque (Rh1acc : ANCIEN et LOT-V1 exacts, GEL2 UNDER) ; deux contournements par un `<!--` lu comme commentaire (Byp1
en texte brut, Byp2 en valeur d'attribut).

**Pli** (scanner +58 −9, `.d.mts` +4 −2, test +48 ; aucun antislash ni caractère non-ASCII ajouté) :
- `RAW_TEXT_ELEMENTS` (`style`, `title`, `textarea`, `xmp`, `iframe`, `noembed`, `noframes`, `plaintext`) ;
  `openerAt(html, lt, names)` porte la grammaire d'ouvrante D3, désormais unique pour `hiddenOpenerAt` et
  `rawTextOpenerAt` (corps de `hiddenOpenerAt` déplacé, inchangé).
- `rawTextEnd(html, lt, name, inTemplate)` : le contenu court jusqu'à la première fermante D3 (`closerEnd`) ; trois clauses,
  chacune un throw nommé :
  - (1) le contenu porte une ouvrante cachée ;
  - (2) dans le contenu d'un template, il porte une fermante `</template>` (grammaire D3, `closerAt`) ;
  - (3) l'élément n'est jamais fermé (`plaintext` ne l'est jamais).
- Appel depuis les deux boucles (`stripHiddenSurfaces` à la racine, `templateEnd` dans un template), sur chaque ouvrante à
  texte brut située hors du contenu déjà vérifié (`rawSeen`) : chaque contenu est vérifié une fois (temps linéaire) et une
  ouvrante à texte brut à l'intérieur reste du texte.
- Règle d'ambiguïté étendue (`commentEnd`) : une étendue de commentaire portant l'ouvrante d'un élément à texte brut lève,
  comme pour une ouvrante cachée. Si le `<!--` est du texte brut ou une valeur d'attribut, l'élément est vivant, et le
  scanner lirait la suite de son contenu sans que `rawTextEnd` l'ait vue.
- La lecture du scanner est **inchangée** : le pli n'ajoute que des levées. Donc PLI3 ∈ {sortie du GEL2, throw}, prouvé
  exhaustivement ci-dessous (0 violation d'identité).

**Vecteurs d'abord.** Test nouveau `rendered_body_raw_text_elements` (`test/site-build-fleet.test.ts`, inséré après le test D257,
dans le bloc du lot : la fusion C-5 garde une seule zone de conflit, vérifié ci-dessous). 36 vecteurs contrôlés contre parse5
par `pli3\vectors-pli3.mjs` (0 écart) : rouge sur le gel 2 (`pli3\red-on-gel2.tap`, 14:00:10Z, au premier vecteur L2), vert
après le pli (`pli3\vectors-on-pli3.log` 36/36 conformes).

| Clause | Vecteurs (issue exigée) | Face au gel 2 |
|---|---|---|
| 1 : ouvrante cachée dans le contenu | L2, L2c, `title`, `textarea`, `xmp`, `iframe`, `noembed`, `noframes`, L2case (casse, attributs, fermante espacée), L2nf (pas la première balise), L2tpl, L2scr, L2t (dans un template) ⇒ throw `a <nom> element holds a <x> opener` | UNDER (ou exact : L2t) ⇒ throw |
| 2 : `</template>` dans le contenu, en template | Rh1 (`style`), Rh2 (`textarea`), Rh3 (`title`) ⇒ throw `… element in a <template> holds a </template>` | UNDER ⇒ throw |
| 3 : jamais fermé | Ru1, Rh1acc, Pt (`plaintext`) ⇒ throw `an unclosed <nom> element` | exact ou UNDER ⇒ throw |
| règle d'ambiguïté étendue | Byp1 (texte brut), Byp2 (attribut), Byp3 (dans un template), Ca4 (vrai commentaire `<!-- <style> -->`, coût déclaré) ⇒ throw `a <!-- comment spans a <style> opener` | UNDER (Ca4 : exact) ⇒ throw |
| cas exacts conservés | Ex1-Ex4, Ex6-Ex8, Bnd (`<styles>`), Rtop (`</template>` hors template), Nest et NestT (ouvrante à texte brut dans un contenu : du texte), Cls (fermante espacée), Rax (`</template x>`, R-a) | identiques |

Vecteurs des plis précédents rejoués sur PLI3 : les 28 du pli G2 delta, 28/28 conformes (`pli3\vectors-pli2-on-pli3.log`) ;
les 37 du relecteur (`pli3\vectors-g2b-pli3.log`, colonne PLI3 ajoutée) : 29 identiques au GEL2, et **Rh1 à Rh8 passent
d'UNDER à throw** (R-h dans un template, de `style` à `plaintext`) ; Rh9 (CDATA d'un `svg`, contenu étranger) reste UNDER ;
U1 à U10 identiques (11/11, `pli3\vectors-under-pli3.log`).

**Énumération exhaustive jusqu'à 7 jetons.** Mécanisme du relecteur : oracle `g2b\enum\p5oracle.mjs` importé tel quel,
marqueurs `A${p}_`, alphabet de 15 jetons dans son ordre, avec `<style>` et `</style>`. Instrument `pli3\enum\enum-pli3.mjs` :
- quatre versions depuis des copies figées : ANCIEN, LOT-V1, GEL2 `f40333f2…`, PLI3 `fcbd28b0…` ;
- 225 tranches (deux premiers jetons), 22 en parallèle, 14:03:13Z → 14:28:47Z ;
- fusion `pli3\enum\L7-merged.out`, enregistrements `L7-merged-under-all.jsonl` ;
- vues : E15 (tout), **E13** (sans jeton R-a : l'alphabet du critère, `<style>` compris), E11, M9, W9 ;
- parse5 n'est sauté que si la séquence n'a pas de marqueur ou si les quatre versions lèvent.

| Vue | Séquences | PLI3 : exact / UNDER / OVER / UNDER+OVER / throw | PLI3 UNDER, toutes causes (GEL2) | **Nouveau caché PLI3** face à ANCIEN / LOT-V1 / GEL2 | Nouveau sur-retrait face à ANCIEN / LOT-V1 / GEL2 | Violations d'identité PLI3 ↔ GEL2 |
|---|---|---|---|---|---|---|
| E15 | 183 063 615 | 31 422 620 / 8 828 / 97 372 / 210 / 151 534 585 | 9 038 (44 765) | 14 / 741 / **0** | 4 558 / 676 / **0** | **0** |
| **E13** | 67 977 559 | 10 074 399 / 1 663 / 8 742 / 0 / 57 892 755 | 1 663 (21 589) | **4** / 170 / **0** | 2 534 / 0 / **0** | **0** |
| E11 | 21 435 887 | = GEL2 : 4 209 865 / 1 148 / 0 / 0 / 17 224 874 | 1 148 (1 148) | 4 / 140 / **0** | 0 / 0 / 0 | **0** |
| M9 | 5 380 839 | = GEL2 : 1 348 238 / 730 / 0 / 0 / 4 031 871 | 730 (730) | 4 / 110 / **0** | 0 / 0 / 0 | **0** |
| W9 | 5 380 839 | = GEL2 : 780 686 / 689 / 0 / 0 / 4 599 464 | 689 (689) | 0 / 0 / 0 | 0 / 0 / 0 | **0** |

- **Face au gel 2** : 0 nouveau caché, 0 nouveau sur-retrait et 0 violation d'identité sur les cinq vues. Toute séquence où
  PLI3 ne lève pas donne la sortie du GEL2 octet pour octet ; c'est le « 0 face au gel » de la mission, prouvé sur les
  183 063 615 séquences.
- **Face à l'ANCIEN hors classe R-e**, classement de chaque nouveau caché dans l'arbre parse5 (contenu des templates compris),
  par deux tests :
  - « reSigDoc » est le critère du validateur (un script dont le texte porte `<!--` puis `<script`) ;
  - « reOfMarker » est plus strict : le marqueur compté est dans le texte d'un tel script.
  Résultats :
  - **E13 : 4/4 R-e, marqueur dans le script R-e, 0 hors R-e** ;
  - E11 et M9 : les 4 mêmes ;
  - E15 : 14 = les 4 R-e + 10 non R-e, qui portent **tous** `</script/>` (R-a : fermante que le navigateur accepte et que D3
    refuse) avec un accident de commentaire de l'ANCIEN ; classe R-a hors de l'alphabet du critère (I-4).
- **Coût par clause** (séquences exactes au GEL2 qui lèvent chez PLI3) :

| Vue | C1 (ouvrante dans le contenu) | C2 (`</template>` en template) | C3 (jamais fermé) | Ambiguïté étendue | Total |
|---|---|---|---|---|---|
| E13 | 148 468 | 17 116 | 4 399 933 | 434 385 | 4 999 902 |
| E15 | 269 116 | 33 124 | 13 067 491 | 1 027 518 | 14 397 249 |

  La clause 3 domine : toute séquence dont un `<style>` n'est jamais fermé lève. E11, M9 et W9 n'ont aucune séquence à
  texte brut : leur coût est nul et PLI3 y égale le GEL2.

**Variante `<title>`** (même instrument, `<title>`/`</title>` à la place de `<style>`/`</style>`, jusqu'à 6 jetons,
12 204 240 séquences, 14:29:53Z → 14:31:50Z, `pli3\enum\T6-merged.out`) :
- E13 : **0 nouveau caché face à l'ANCIEN**, 0 face au GEL2, 0 violation d'identité ;
- coût E13 : C1 6 980, C2 898, C3 375 729, ambiguïté 29 820 ;
- la règle est uniforme d'un nom à l'autre.

**Fuzz du relecteur rejoué** (générateur, graine `20260924`, longueurs 7 à 12 et alphabet recopiés octet pour octet ;
`pli3\enum\fuzz-pli3.mjs`, 10^6 tirages, 14:31:50Z → 14:33:10Z) :
- 0 violation d'identité ;
- nouveau caché face à ANCIEN / LOT-V1 / GEL2 : 6 / 40 / **0** ; les 6 face à l'ANCIEN : 2 R-e, et 4 non R-e qui portent tous
  `</script/>` (R-a) ;
- nouveau sur-retrait : 42 / 30 / **0**.

**Artefact réel** :
- `next build` hors réseau sous `pli\ev-build.sh` : exit 0, 14:14:47Z → 14:16:19Z, 19 routes ; moniteur `pli\netmon.ps1` :
  **0 connexion**, 24 processus node du build.
- `renderedBody` ANCIEN = LOT-V1 = GEL2 = PLI3 octet pour octet sur **19/19** pages (`pli3\build\real-compare-pli3.log`) ;
  empreintes de sortie identiques aux builds précédents (/fleet `c943be8c…`, /ukemi `e4b23ce7…`).
- Relevé parse5 (`pli3\build\spans-pli3.log`) : 23 éléments à texte brut (20 `title`, 2 `style`, 1 `iframe`) ; 0 porte une
  ouvrante cachée ; 0 porte `</template` ; 0 non fermé ; 0 commentaire portant une ouvrante ; 0 valeur d'attribut
  contenant `<` ; 0 template. Aucune règle du pli 3 ne peut s'y déclencher.
- g3-site `node scripts/assert-fleet-html.mjs` : **exit 0** (/fleet 33 813 caractères, 4 notes ; /ukemi 0 jeton
  numérique, `built`, 4 678 caractères). `.next` et `next-env.d.ts` retirés ensuite.

**Temps linéaire** (`pli3\time-probe.mjs`, machine au repos, pile Node par défaut). Chaque forme est jouée à n = 10^6 et
4 × 10^6 caractères ; le rapport de temps PLI3 4n/n vaut 2,2 à 4,5 (une forme quadratique donnerait environ 16). Pire cas :
un commentaire de 4 Mo couvrant 10^6 balises génériques, 594 ms (GEL2 66 ms), car la règle d'ambiguïté teste huit noms de
plus par `<`.

**Mutants** : 51/51 tués par le test visé, 51/51 restaurés (§Table des mutants du pli 3).

**C-5 (fusion)**, `git merge-file -p --diff3` en lecture seule sur des copies de blobs (`pli3\merge\`) contre
`lot/etude-suite` (`84add61`, avancée depuis le `c9b5b7a` du CP2b) :
- `test/site-build-fleet.test.ts` : **1** zone de conflit, comme au CP2b (le bloc du lot grandit, aucune zone nouvelle) ;
- `scripts/assert-fleet-html.mjs` et `.d.mts` : fusion propre (le côté `lot/etude-suite` porte le blob de la base `e7af51c`).

**C-6 (sha de passation)** :
- gel 2 : `pli3\DELIVERED-gel2.sha256` = `cp2b\HEAD-blobs.sha256` = `git show f33e6c5:<f>` (14/14, vérifié à 13:33Z) ;
- gel 3 : `F:\tmp\codeql-alerts-1\DELIVERED.sha256` (14/14, régénéré après la dernière écriture de ce journal).

**Grammaire des commentaires remesurée sur le blob livré.** `commentEnd` a changé : la règle d'ambiguïté porte aussi
les ouvrantes à texte brut. Le différentiel du pli G2 delta est rejoué sur `pli3\instr-commentEnd-pli3.mjs` (copie figée
et une ligne `export`, `pli3\comment-grammar-diff-pli3.log`, 14:46:48Z → 14:47:12Z) : 2 441 406 chaînes, 708 219 fermées
à la même position, 1 733 187 non fermées des deux côtés, **0 désaccord**.

**error_origin (C-3 bis)** : les sept assignés par l'orchestrateur sont recopiés tels quels, et L-2, L-3 et Rh1acc sont
proposés sans être tranchés, dans la section « error_origin » ci-dessous (avant les tables de mutants).

**Constat nouveau L-3 (non plié ; hors du mandat 187, qui vise le texte brut ; item I-9).** Une ouvrante cachée logée dans une
VALEUR D'ATTRIBUT (famille A1, attributs non modélisés : D3, R-c) est lue vivante et avale une ouvrante `<script>` réelle.
- Att1 `<p title="<noscript>"><script></noscript>HA` : l'ANCIEN lève ; LOT-V1, le GEL2 et PLI3 comptent HA (même lettre de
  D3 (iv) que L-2).
- Att1c, même forme avec `</script>` : l'ANCIEN est exact ; LOT-V1, le GEL2 et PLI3 comptent HA.
- Mesure `pli3\enum\enum-attr.mjs` (les 9 jetons du worker plus `<i title="` et `">`, jusqu'à 6 jetons, 1 948 716 séquences) :
  0 violation d'identité, 0 nouveau caché face au GEL2, 122 enregistrements face à l'ANCIEN. Classés par la position du
  marqueur dans l'arbre parse5 (`classify-attr.mjs`) :
  - **2 L-3 proprement dits** : le marqueur est dans une surface cachée réelle, et l'ANCIEN levait ;
  - 9 où le marqueur est dans une valeur d'attribut : `renderedBody` conserve les balises génériques et leurs attributs
    PAR CONCEPTION (ADR D3 : `mainCorpus` lit `alt`, `title` et `aria-label`) ; l'ANCIEN levait par accident ;
  - 115 où le marqueur est jeté par le navigateur, la fin de l'entrée tombant dans une balise ou une valeur d'attribut
    ouverte (résidu R-t, toutes versions ; l'ANCIEN levait par accident sur 113).
- Réalité : 0 valeur d'attribut contenant `<` sur les 19 pages.
- Borne (G2 de confirmation) : la forme minimale compte 6 jetons ; jusqu'à 7 jetons, 100 séquences (§Résidus, L-3).
- Option mesurée en instrument (`pli3\varg-assert-fleet-html.mjs`, hors lot) : une vérification « scripts d'abord » (toute
  ouvrante `<script` doit atteindre une fermante D3, sinon throw). Elle ferme les 2 L-3 et Att1, pas Att1c (script fermé).
  Coût sur cet alphabet : 10 393 séquences exactes lèvent (C2, Tn compris). Décision à l'orchestrateur (« Needs » du rendu).

## G2 de confirmation pliée (2026-09-24, ~15:57Z → 16:15Z ; rapport `F:\tmp\codeql-alerts-1\g2-confirm\G2-CONFIRM.md`, gel 3 `6443dcc`)

**Mandat.**
- La G2 de confirmation a relu la plage `8229745..6443dcc`, code seul, en instance séparée. Verdict : ACCEPTE-AVEC-CORRECTIONS.
- La mission de l'orchestrateur est de plier ses corrections sur le worktree, par-dessus le gel 3, sans commit :
  - m-1, le test ;
  - M-2, m-2 et m-3, le texte du G1 ;
  - M-1, le texte du G1 sous I-9.
- Le scanner n'est pas touché. C'est un pli de test et de texte seuls : selon la règle CP2b (a)-2, il ne rouvre ni le gel ni
  un checkpoint-2, et le G7 re-contrôle les sha.
- Lus avant tout pli :
  - le rapport, 567 lignes, en particulier le §4 (corrections proposées) ;
  - `proposed/site-build-fleet.test.ts.diff` et `proposed/prove-test-diff.log` ;
  - `mutants/mutants-g2c.mjs` : X12 et X13, l.45-46 ;
  - `enum/counts.out`.

| Constat | Pli | Preuve |
|---|---|---|
| **m-1** : la borne du saut `lt < rawSeen` n'est épinglée par aucun test ; X12 (racine) et X13 (template), `<` → `<=`, survivent | 3 lignes après NestT (un commentaire, L2adj, Rh1adj), appliquées par `pli4\apply-test-diff.mjs` depuis le fichier de diff lui-même (lignes `+` lues, jamais ressaisies, contexte vérifié) ; résultat identique octet pour octet au fichier `b` du relecteur (`a3df31fe…`) | X12/X13 rejoués (mini-harnais `pli4\mutants-x12x13-*.mjs`, harnais du pli 3 dont seul le tableau MUTANTS change) : AVANT, sur le test du gel 3, survivants (8/8 verts, `pli4\before\`) ; APRÈS, tués par `rendered_body_raw_text_elements` (« (L2adj) back-to-back raw-text elements », « (Rh1adj) likewise in a template »), sha muté identique au relecteur (`58ec943d…`, `ea4cf9bf…`), scanner restauré `fcbd28b0…` et test `a3df31fe…` (sha avant = après, `pli4\x-after.sha-*`), 0 `.mut-tmp` |
| **M-2** : déclarations fausses ou incomplètes (D-15, R-c, L-3, « Attributs », I-6, critère I-8) | textes du §4.2 posés en place | §Décisions (D-15), §Résidus, §Items |
| **m-2** : `</template>` dans une valeur d'attribut, dans un template, ferme le template pour le scanner (UNDER ×5, préexistant) | ligne ajoutée à I-4 et à la liste des préexistants identiques | G-TplAttr du relecteur |
| **m-3** : jetons `error_origin` du gabarit ; « plan contributif » n'est pas une valeur | valeurs écrites `PLANIFICATEUR` et `IMPLEMENTEUR` ; « plan contributif » devient une note | §error_origin |
| **M-1** : trois formes hors grammaire D3 contournent le correctif L-2 | déclarées sous I-9, avec « aucune nouvelle face au gel 2, 0 sur 19 pages » et la décision investisseur 193 en attente d'élargissement | §Items I-9 |
| m-4 (optionnel) : docstring de `rawTextEnd` | NON appliqué : le scanner n'est pas touché (mission ; risque D-11) ; la correction de D-15 suffit | — |

**Écarts au texte proposé (D-19).**
- R-c : « ×4 » devient « ×5 ». Les cinq versions sont mesurées exactes sur Tattr2 (`pli3\vectors-g2b-pli3.log`), et l'en-tête
  de la liste compte cinq versions depuis le pli 3. Même mise à jour, mesurée, pour R-e, B1-B3, SR et Ra de la même liste
  (`pli4\residuals-x5.log`).
- Source ajoutée aux chiffres L-3 à 7 jetons : `g2-confirm\enum\counts.out`, lu.
- Ajouts de cohérence :
  - « sur la grammaire D3 » dans le bloc « CORRIGÉ par le pli 3 » ;
  - un renvoi sur la borne dans le paragraphe L-3 du §« Pli 3 » ;
  - m-2 déclaré aussi dans la liste des préexistants identiques ;
  - les `error_origin` que la G2 de confirmation propose pour ses propres constats, recopiés comme non assignés ;
  - l'ordre de deux lignes du journal du pli 3 rétabli.

**Fusion (C-5)**, `git merge-file` en lecture seule sur des copies (`pli4\merge\`).
- La tête de `lot/etude-suite` a encore avancé : `833dce9`.
- `test/site-build-fleet.test.ts` : **1** zone de conflit, l.216 à 1336 du fichier fusionné ; les deux assertions ajoutées y
  tombent (l.1331 et 1332). Aucune zone nouvelle.
- `scripts/assert-fleet-html.mjs` et `.d.mts` : fusion propre.

**Ceinture (D-18)** : tout node et tout npm de ce pli passent par `pli4\ev.sh`, la ceinture de la mission mot pour mot (ligne
`exec` identique à `cp2b\ev.sh`) :
- les 8 variables absentes, vérifié par un test de présence, jamais par leur valeur ;
- TEMP, TMP et TMPDIR sur F: ;
- `NEXT_TELEMETRY_DISABLED=1`.

**Artefact réel.**
- `next build` hors réseau : exit 0 de 16:03:55Z à 16:04:33Z, 19 routes ; moniteur `pli\netmon.ps1` : **0 connexion**, 24
  processus node du build.
- `renderedBody` identique au build du gel 3, page par page : **19/19** (empreintes de sortie de
  `pli3\build\real-compare-pli3.log` contre `pli4\build\real-compare-pli4.log`, scanner `fcbd28b0…` des deux côtés) ;
  ANCIEN = LOT-V1 = GEL2 = PLI3 sur 19/19.
- g3-site : exit 0.
- `.next` et `next-env.d.ts` retirés ensuite.

**Oracle** : §« Oracle du pli des corrections de la G2 de confirmation ».

## Pli 5 (décision investisseur 205 ; 2026-09-24, ~19:12Z → 19:33Z ; test et texte seuls, gel 3 bis `624550a`)

**Mandat.** Décision investisseur 205, « ok » à 19:15Z, transmise par l'orchestrateur. C'est l'option (iii) de l'escalade M-1 :
- la décision 193 est élargie à toute la famille ;
- pas de 4ᵉ pli de code ; la fusion vient ensuite ;
- un lot séparé « scanner conforme » viendra plus tard.

Ce pli est un pli de test et de texte seuls, sur le worktree, par-dessus le gel 3 bis : sans commit, et jamais `GIT_DIR`
pour un test. Le scanner est inchangé (`fcbd28b0…`).

| Point | Pli | Preuve |
|---|---|---|
| 1. G1, sous I-9 | La décision 205, datée, remplace « en attente d'élargissement ». La limite connue est la famille entière : R-a, R-c, ouvrante à texte brut dans un attribut, Att1. 0 forme nouvelle face au gel 2 ; 0 sur les 19 pages. Item I-10 SCANNER-CONFORME-1 formé. | §Items |
| 2. Garde 1 | `rendered_body_known_limit_family_pinned` : une assertion par forme, avec les vecteurs exacts de `G2-CONFIRM.md` §M-1 (G-RaSkip, G-RcSkip, G-AttRaw) et Att1. Chaque forme doit être THROW ou UNDER (HA compté) ; une forme EXACT rougit avec « remove its exemption (I-9, decision 205) ». | Classe actuelle mesurée (`pli5\family-now.log`) : parse5 cache HA dans les 4 formes ; l'ANCIEN lève ; le GEL2 et le gel 3 bis donnent UNDER. Mutant MG5 tué. |
| 3. Garde 2 | `site_raw_html_injection_points_pinned`, par un parcours de fichiers sans git. `node_modules` et `.next` sont exclus. Non-vacuité : au moins 20 `.tsx`, `app/layout.tsx` compris. Attendus : `dangerouslySetInnerHTML` dans les `.tsx` d'`apps/site` = `apps/site/app/layout.tsx x1` ; aucun `rehype-raw` ni `innerHTML =` dans un fichier d'`apps/site`. Toute autre occurrence rougit avec son chemin. | Mutants MG1 à MG4 tués (tableau §Mutants) ; garde verte même avec un `.next` frais présent (19:20Z). |
| 4. Oracle | test du site 10/10, liste ciblée 224/224, 6 portes, build 19/19, R-25, fusion | §« Oracle du pli 5 », §R-25 |

**Relevé d'`apps/site` avant écriture** (19:14Z, `grep` hors `node_modules` et `.next`) :
- `dangerouslySetInnerHTML` : `apps/site/app/layout.tsx:67` (`<script dangerouslySetInnerHTML={{ __html: themeInit }} />`), une seule occurrence ;
- `rehype-raw` : 0 fichier ;
- `innerHTML =` : 0 fichier ;
- 154 fichiers au total, aucun ignoré ni non suivi.

**Fusion (C-5).**
- `git merge-tree --write-tree --name-only lot/etude-suite lot/codeql-alerts-1` (`c56c746` contre `624550a`, base de fusion
  `e7af51c`, `pli5\merge\merge-tree.out`) : exit 1, **1 fichier en conflit**, `test/site-build-fleet.test.ts`. Fusion
  automatique pour `apps/bell/test/bell-served-e2e.test.ts`, `apps/bell/test/helpers/bell-served.ts` et `test/bell-caddy.ts`.
  La commande écrit un arbre dans la base d'objets (`e31df968…`) ; aucune ref, aucun worktree touché.
- `merge-tree` ne voit que les commits. Le delta du pli 5, non commité, est donc vérifié par `git merge-file` sur des copies
  de blobs : **1 zone de conflit** (l.216 à 1388 du fichier fusionné) ; les gardes 1 et 2 (l.1345 et 1367) et L2adj
  (l.1331) sont dedans.
- Les imports de `node:fs` ne sont pas touchés : `lot/etude-suite` a déjà réécrit cette ligne, et une autre réécriture
  ouvrirait une seconde zone de conflit. La garde 2 importe `readdirSync` et `sep` dans son corps (D-20).

**R-25.** La ligne `STAT=` est la l.71 de `ci.yml` dans cet arbre et la l.65 dans `lot/etude-suite` ; leur texte est
identique (même pathspec). §R-25.

**Ceinture.** `pli5\ev.sh`, identique à `pli4\ev.sh` (texte de la mission, `NEXT_TELEMETRY_DISABLED=1` compris).

## Pli 6 (corrections du checkpoint-2 ter ; 2026-09-24, ~19:58Z → 20:04Z ; test seul, gel 4 `7fb53dc`)
- **C-1 (garde 1)** : `catch { return true; }` comptait toute exception comme THROW. Désormais seule une exception du
  scanner, dont le message commence par `assert-fleet-html: ` (toutes les levées accessibles depuis `renderedBody`, l.114
  à 234 du scanner), compte comme THROW ; toute autre exception est relancée. Mutant MG8 (le scanner lève
  `RangeError("x")` sur Att1) : survivant avant, tué après (erreur `x` relancée).
- **C-2 (garde 2)** : `dangerouslySetInnerHTML` est cherché dans tous les fichiers de code d'`apps/site` (`.tsx`, `.ts`,
  `.jsx`, `.js`, `.mjs`), et non plus dans les seuls `.tsx`. Mutant MG9 (occurrence plantée dans `apps/site/lib/how-copy.ts`) :
  survivant avant, tué après ; le message nomme `apps/site/lib/how-copy.ts x1`.
- **C-3 (garde 2)** : non traité ici, par décision de la mission. `apps/site/public/scene/blocks-hero.html` est supprimé sur
  `lot/etude-suite` (`05c66aa`, scène native) ; l'orchestrateur ajoutera l'assertion « 0 fichier `public/**/*.html` » à la
  résolution de fusion, où elle est vraie. Relevé en lecture seule sur `lot/etude-suite` (`b8cc04f`) : 0 fichier `.html`
  sous `apps/site/public` ; `dangerouslySetInnerHTML` seulement à `app/layout.tsx:67` ; 0 `rehype-raw` ; 0 `innerHTML =`.
- Mutants : MG1 à MG7 (harnais du validateur, entrées recopiées octet pour octet, sha muté identique au validateur) et MG8,
  MG9 : 9/9 tués par le test visé, 9/9 restaurations octet-exactes (7 fichiers, sha avant = après).
- Le texte du §« Pli 5 » qui borne la garde 2 aux `.tsx` est à lire avec C-2 (extension aux `.ts`, `.jsx`, `.js`, `.mjs`).

3. Fichiers touchés : ligne `test/site-build-fleet.test.ts`, APRÈS `e72e14ca8b0ab28f7931f7e953a3682dc85820165fc8d8bc061796672244eeb1`
   (au gel 4 : `58935e6e…`) ; +9 −4.

4. R-25 : après le pli 6, même pathspec verbatim (`ci.yml:71` ici, `ci.yml:65` dans `lot/etude-suite`, ligne identique) :
   `13 files changed, 515 insertions(+), 36 deletions(-)` ⇒ **551** ; delta face au gel 4 : 13.

5. Oracle du pli 6 (ceinture `pli6\ev.sh`) : test du site seul 10/10 ; liste ciblée 224/224 ; 6 portes exit 0 ; ratchet 69/69 ;
   build hors réseau 0 connexion, 19/19 identique au gel 4 ; g3-site exit 0.

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
  — la fin d'un `<template>` respecte l'imbrication, §« G2 pliée » ; après le pli G2 delta : + `commentEnd` et `MAX_TEMPLATE_DEPTH`,
  §« G2 delta pliée » ; non exportés, zéro dépendance) ; garde `/<script\b/i` et son
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
  `https://xeth.drpc.org` et `https://xapi.mainnet.solana.com/` ; pli G2 delta M-3 : leurres SOUS-DOMAINE
  `https://a.eth.drpc.org` et `https://a.api.mainnet.solana.com/`). Les tests de course qui dépendent du
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
  à lot-v1 (sur l'alphabet de 9 jetons jusqu'à 6 : borne corrigée au pli G2 delta). La passe unique reste retenue. Au
  pli G2, elle rapprochait du navigateur X3, T4, C1, C2, K1 et P2 ; au pli G2 delta, la règle d'ambiguïté fait lever
  X1, X3, T4, C1 et P2 (un commentaire dont l'étendue contient une ouvrante cachée) : cet appui a disparu. Elle reste
  fondée sur (a) ci-dessous (par construction, mesuré de nouveau : `visible-->`) et sur C2, K1, Tn, exacts chez PLI2 alors
  que l'ANCIEN levait. Seule la fin de `template` exigeait de respecter l'imbrication. Faits MESURÉS au G1 sur
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
- **D-11 (pli G2 delta : incident mesuré, corrigé).** Voir §« G2 delta pliée » : une docstring présentait au balayage
  d'imports de `packages/rpc-guard/test/durable.test.ts:188` un faux spécificateur (`from` suivi d'un texte entre accents
  graves sur la même ligne) ; rouge au premier oracle ciblé, reformulée (2 lignes de commentaire), identité de
  comportement prouvée, tout rejoué sur l'arbre final.
- **D-12 (pli G2 delta : portée de la règle d'ambiguïté).** Le scanner ne peut pas savoir si un `<!--` est un commentaire
  ou du texte brut / une valeur d'attribut (M-24, R-c). Retenu : throw quand l'étendue contient une OUVRANTE de surface
  cachée (le seul cas où la lecture change ce qui est CACHÉ après l'étendue : texte caché compté, famille B-2/L-1).
  Écarté, mesuré et soumis à l'orchestrateur : étendre à une fin `</template` dans un template (variante B), qui ferme
  aussi les sur-retraits S1t/Rft mais fait lever Tc et 12 258 séquences exactes de plus (§Résidus). Avis advisor
  concordant (variante A, bifurcation soumise).
- **D-13 (pli G2 delta : borne de profondeur).** `MAX_TEMPLATE_DEPTH = 256` : choix d'ingénierie, sans source externe
  prétendue. Mesures : la récursion sans borne atteignait la limite de pile à 9 629 niveaux (Node v24.15.0, relecteur,
  `g2b\depth-probe.log`) ; le site construit ne porte aucun `<template>` ; 256 niveaux passent, 257 lèvent (D256/D257).
- **D-14 (pli 3 : trois clauses, séparables).** Clause 1, le texte de la mission : une ouvrante cachée dans le contenu d'un
  élément à texte brut lève, sans analyse paresseuse ; elle lève donc aussi quand la surface lue resterait dans le contenu
  (L2t : exact au GEL2). Clause 2, `</template>` dans le contenu, en template : sans elle, le critère « 0 nouveau caché hors
  R-e » tombait sur Rh1acc (R-h rendu visible par la fin de commentaire du pli G2 delta). Clause 3, élément jamais fermé :
  symétrie de D-5 et option 2 du validateur ; son texte courrait jusqu'à la fin de l'entrée, un faux vert réel pour un
  `<style>` ou un `<title>` jamais fermé. Messages distincts, coût mesuré par clause (§« Pli 3 »). Avis advisor concordant
  (trois clauses, garde linéaire) ; la clause 3 est séparable si l'orchestrateur la refuse.
- **D-15 (pli 3 : fin du contenu = fermante D3).** Le contenu d'un élément à texte brut finit à sa première fermante D3
  (`closerEnd` : `</nom` + espaces facultatifs + `>`), comme pour `script` et `noscript`. `</style/>` et `</style x>`
  finissent l'élément pour un navigateur (13.2.5.11, 13.2.5.14), pas pour ce contrôle : le contenu vu est plus long. La
  vérification y est plus large, MAIS le saut `rawSeen` traite alors comme du texte l'ouvrante d'un élément à texte brut RÉEL
  logée entre la fin navigateur et la fermante D3 : son contenu n'est pas vérifié et la clause 1 est contournée (G2 de
  confirmation, G-RaSkip `<style></style/><title></style><noscript></title><script></noscript>HA` : ANCIEN throw, LOT-V1 à
  PLI3 UNDER ; variantes `</style x>` et script fermé). Ce n'est donc PAS « sens fail-closed » : R-a déclaré, faux vert
  possible, 0 sur les 19 pages (aucune fermante R-a d'élément à texte brut) ; tranchée par la décision 205 (limite connue,
  I-9 ; garde 1).
- **D-16 (pli 3 : règle d'ambiguïté étendue par NOM, pas par étendue).** Une étendue de commentaire portant une ouvrante à
  texte brut lève, comme pour une ouvrante cachée, sans calculer le contenu de l'élément avalé. L'autre voie (vérifier ce
  contenu depuis l'ouvrante) exigeait un état partagé entre commentaires pour rester linéaire (N commentaires portant
  `<style>` avant une seule fermante lointaine : quadratique sans lui). Coût déclaré : un vrai commentaire portant une
  ouvrante à texte brut lève (Ca4 `<!-- <style> -->VA`).
- **D-17 (pli 3 : incidents d'instrument, déclarés).**
  - (a) L'outil Bash de ce poste réduit `\\` à `\` dans les heredocs : le premier correctif de l'ancre MR7b n'a rien trouvé
    (`found 0`, aucun fichier modifié), réécrit avec l'outil Write.
  - (b) Première répétition à blanc du harnais : l'ancre de MR7b apparaissait deux fois (la ligne à 4 espaces est incluse
    dans celle à 6) ; ancrée par sa ligne précédente, 51/51 uniques AVANT exécution.
  - (c) Alerte « child_process.exec » d'un hook de sécurité sur deux instruments : faux positif, `exec` y nomme une fonction
    locale (try/catch autour de `renderedBody`), aucun processus n'est lancé.
  - (d) Premier jet des vecteurs : Ex8 (attendu faux), Ru1 (marqueur contraire à la convention de l'oracle) et L2t (visible
    selon moi, caché selon parse5) ; corrigés avant tout code, 0 écart main/parse5 ensuite.
- **D-18 (pli des corrections de la G2 de confirmation : ceinture).** Ce pli emploie `pli4\ev.sh`, la ceinture de la mission
  mot pour mot. Écart déclaré, rétrospectif : aux plis 1 à 3, `F:\tmp\codeql-alerts-1\ev.sh` (tests, portes, énumérations)
  ne posait pas `NEXT_TELEMETRY_DISABLED=1`. Les builds passaient par `pli\ev-build.sh`, qui le pose ; le moniteur réseau
  a vu 0 connexion à chaque build. Aucune de ces commandes n'invoque Next : la variable ne les concerne pas, mais la
  ceinture était incomplète au sens de la mission.
- **D-19 (même pli : écarts au texte proposé).** Détail au §« G2 de confirmation pliée » :
  - « ×5 » pour « ×4 » dans la ligne R-c (mesuré) ;
  - « ×5 » (ou « cinq versions ») aussi pour R-e, B1-B3, SR et Ra dans la même liste : mesuré (Ret et Ra,
    `pli3\vectors-g2b-pli3.log` ; B1-B3 et SR, `pli4\residuals-x5.log`) ;
  - source ajoutée aux chiffres L-3 à 7 jetons ;
  - quatre ajouts de cohérence ;
  - l'ordre du journal du pli 3.
- **D-20 (pli 5 : fusion et imports).**
  - La garde 2 importe `readdirSync` (`node:fs`) et `sep` (`node:path`) dans son propre corps, par un import dynamique : la
    ligne d'import de `node:fs` n'est pas touchée. `lot/etude-suite` l'a déjà réécrite ; une autre réécriture ouvrirait une
    seconde zone de conflit, et une réécriture identique laisserait `statSync` sans usage (eslint).
  - `git merge-tree --write-tree` écrit un arbre dans la base d'objets, sans ref : ce n'est pas un commit (R-20), mais c'est
    une écriture ; déclarée.
  - Aucun `git stash create` (qui écrirait un objet commit) ; aucun `GIT_DIR` pour un test.
- **D-21 (pli 5 : message de la garde 1, advisor de clôture).** Un résultat EXACT (aucune levée, HA non compté) ne prouve
  pas la conformité : un scanner qui PERD la charge donne le même résultat, et c'est exactement le mutant MG5. Le
  commentaire et le message de la garde 1 disent donc les deux lectures (conforme ⇒ retirer l'exemption ; charge perdue ⇒
  régression) et renvoient à un analyseur de niveau navigateur (I-10). La phrase « remove its exemption (I-9, decision
  205) » est gardée telle quelle. Cascade rejouée sur le test final : test du site, liste ciblée, 6 portes, 5 mutants, fusion.

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

**Réécrit au pli G2 delta (M-4)** : trois énoncés antérieurs étaient faux et sont retirés : « R-a et R-b4 IDENTIQUES
ancien = lot-v1 = pli » (faux dans un template), « faux rouge possible, jamais faux vert » pour les écarts fail-closed
(faux dès qu'un `-->` suit : sur-retrait ; et, avant ce pli, dès qu'une ouvrante suivait : L-1), et la liste R-h (incomplète).
Chaque ligne est MESURÉE sur quatre versions : ANCIEN (blob `e7af51c`), LOT-V1 (livré au G1), GEL (`8229745`, pli G2),
PLI2 (ce pli). Sources : `pli2\vectors-g2b-pli2.log` (les 37 vecteurs adverses du relecteur, colonne PLI2 ajoutée),
`pli2\vectors-under-pli2.log` (U1-U10), `pli2\vectors-on-final.log` (les 28 vecteurs du pli), `pli\probe-residuals.log`,
l'énumération et son classement (§« G2 delta pliée »). Verdict navigateur : règles relues [lu] (§« G2 pliée », §« G2
delta pliée ») et oracle parse5 du relecteur (0 écart sur les vecteurs de ces trois fichiers). Aucune de ces formes
n'existe dans les 19 pages construites (`pli2\build\real-compare4.log` : 0 `<template`, 0 forme abrupte, 0 commentaire
contenant un `<` ; relecteur : 23 blocs texte brut ou RCDATA, aucun ne contient `<!--`, `-->`, `<script`, `template` ni
`noscript`).

**Réécrit au pli 3 (L-2, décision 187)** : chaque ligne vaut aussi pour PLI3 (l'arbre du pli 3). Elle est mesurée par les
mêmes vecteurs, rejoués avec une colonne PLI3 (`pli3\vectors-g2b-pli3.log`, `pli3\vectors-under-pli3.log`,
`pli3\vectors-pli2-on-pli3.log`, `pli3\probe-l2-pli3.log`), et par l'énumération du pli 3. Seules changent les lignes R-h et
L-2 (corrigées, ci-dessous) ; s'ajoutent L-3, R-t et la convention des attributs.

Préexistants, IDENTIQUES ANCIEN = LOT-V1 = GEL = PLI2 = PLI3 (non revendiqués ; I-4) :
- `</template>` dans une valeur d'attribut à l'intérieur d'un template (G2 de confirmation, m-2) : ferme le template pour le
  scanner ; UNDER ×5, préexistant à l'ANCIEN (`<template><i title="</template>">HA</i></template>VA`).
- R-e état double échappé d'un script (`<!--` puis `<script>` dans un script) : fermeture à la première `</script>`
  (sous-retrait ; Ret UNDER ×5 ; alphabet du worker jusqu'à 7 jetons : 689 séquences UNDER chez le GEL comme chez PLI2).
- R-h `</template>` logée dans la section CDATA d'un `svg` imbriqué dans un template (Rh9 : UNDER ×5 ; contenu étranger,
  non modélisé). Les autres R-h (`style`, `title`, `textarea`, `xmp`, `iframe`, `noembed`, `noframes`, `plaintext`,
  Rh1-Rh8) : CORRIGÉS par le pli 3 (ci-dessous).
- B1-B3 commentaires « bogus » `<! x>`, `</ x>`, `<?x>` : cachés par un navigateur, copiés par les cinq versions.
- SR `<template shadowrootmode=…>` : rendu par un navigateur, retiré par les cinq versions (OVER ×5).
- Ra `</template x>` qui ferme un template pour le navigateur : OVER ×5.

Préexistants, NON identiques (déclarés ; I-4) :
- R-c `>` dans un attribut quoté d'une ouvrante : ouvrante close au premier `>` (Tattr2 exact ×5). Sur l'ouvrante d'un élément
  à texte brut, NON identique : `<style title="x></style>"><noscript></style><script></noscript>HA` (ANCIEN throw, LOT-V1 à
  PLI3 UNDER : la fermante logée dans l'attribut clôt le contenu vu, la clause 1 ne voit pas la `<noscript>`) ; 0 sur les 19
  pages (fin d'ouvrante scanner = fin parse5 pour les 23 éléments à texte brut).
- R-a dans un template, fermante hors grammaire D3 (`</script/>`, `</script x>`, `</template x>`) : Rat (ANCIEN OVER,
  LOT-V1 exact, GEL = PLI2 OVER), U10 (ANCIEN UNDER, LOT-V1 exact, GEL = PLI2 UNDER), U9 (ANCIEN exact, LOT-V1 UNDER,
  GEL = PLI2 throw) ; R-a avec imbrication (`<template><template></template></template x>A</template>` : LOT-V1 exact par
  hasard, puisqu'il ignore l'imbrication ; GEL = PLI2 OVER). Aucun n'est nouveau face à l'ANCIEN côté texte caché (U10 :
  l'ANCIEN comptait déjà) ; la correction relève de la grammaire des fermantes (I-4), hors de ce pli.
- L-2 (ancien « R-h à la racine », CP2b (c)) : une ouvrante cachée logée dans un élément à texte brut, lue vivante par la
  passe unique, avalait l'ouvrante d'un `<script>` suivant (`<style><noscript></style><script></noscript>A` : ANCIEN throw,
  LOT-V1 = GEL = PLI2 UNDER) : CORRIGÉ par le pli 3 (throw nommé, ci-dessous).
- L-3 (pli 3, constat nouveau, non plié ; I-9) : une ouvrante cachée logée dans une balise (valeur OU nom d'attribut, A1)
  avale l'ouvrante réelle d'une surface cachée qui suit (`<script>`, et dès 7 jetons `<template>` et `<!--`) (Att1
  `<p title="<noscript>"><script></noscript>HA` : ANCIEN throw ; Att1c, script fermé : ANCIEN exact ; LOT-V1 = GEL2 = PLI3
  UNDER). Alphabet d'attribut : 2 séquences jusqu'à 6 jetons (forme minimale : 6 jetons), 100 jusqu'à 7 jetons (marqueur
  dans une surface cachée réelle : 87 script/noscript, 4 template, 4 commentaire, 5 mixtes ; l'ANCIEN levait sur 98 ; G2 de
  confirmation, `g2-confirm\enum\counts.out`). La famille comprend l'ouvrante à texte brut en attribut qui contourne la
  clause 1 (G-AttRaw). 0 sur les 19 pages (aucun `<` dans une balise ouvrante).
- R-t (pli 3, déclaré) : une balise ou une valeur d'attribut encore ouverte à la fin de l'entrée est jetée par le
  navigateur (fin d'entrée dans une balise) ; toutes les versions la copient quand elles ne lèvent pas (115 marqueurs sur
  l'alphabet d'attribut, l'ANCIEN levant par accident sur 113). Les pages construites sont des documents complets.
- Convention (ADR D3, pas un résidu) : le texte d'une valeur d'attribut est conservé, comme les balises génériques
  (`mainCorpus` lit `alt`, `title` et `aria-label`) ; l'oracle parse5, qui ne compte que les nœuds texte, le classe
  « caché ».

CORRIGÉ par le pli G2 (B-1) : R-d template imbriqué (ANCIEN et LOT-V1 UNDER, GEL = PLI2 exacts) ; T1 / T2
`</template>` dans un `<script>`/`<noscript>` imbriqué (LOT-V1 UNDER) ; T3 `<script>` jamais fermé dans un template
(LOT-V1 sans throw).

CORRIGÉ par le pli G2 delta (B-2, L-1 ; fin de commentaire du navigateur, 13.2.5.43/.44/.52) :
- U1, U2, U3, U6, U7 (GEL UNDER) : exacts ; U1b (GEL sans throw) : throw ; Rb4t, Rb4t2, Rb3t (GEL OVER) : exacts ;
- Lb1, Lb2 (LOT-V1 = GEL UNDER, sans throw) : throw `unclosed <script> block` ; Lb5, Lb6 (LOT-V1 = GEL UNDER) : exacts ;
- Rb1 `<!-->` et Rb2 `<!--->` seuls (ANCIEN exact, LOT-V1 = GEL throw) : exacts ; Rb3 `--!>` seul (ANCIEN UNDER,
  LOT-V1 = GEL throw) : exact ; R-b4 `<!-->` puis un `-->` plus loin (OVER ×3) : exact.

CORRIGÉ par le pli 3 (L-2, décision investisseur 187 ; éléments à texte brut vérifiés, trois clauses), sur la grammaire D3
(contournements hors grammaire : M-1 de la G2 de confirmation, I-9) :
- L-2 et ses variantes (les sept éléments à texte brut ou RCDATA, casse, attributs, script fermé plus loin, dans un
  template) : throw nommé (clause 1).
- R-h dans un template, Rh1 à Rh8 (UNDER ×4 jusqu'au GEL2) : throw nommé (clause 2 ; clause 3 pour `plaintext`, qui ne se
  ferme jamais). Rh1acc (ANCIEN et LOT-V1 exacts, GEL2 UNDER) : throw (clause 3).
- Contournements par un `<!--` lu comme commentaire, en texte brut ou en valeur d'attribut (Byp1 à Byp3) : throw (règle
  d'ambiguïté étendue).
- Énumération jusqu'à 7 jetons sur l'alphabet du critère (E13, `<style>` compris) : 4 nouveaux cachés face à l'ANCIEN,
  4/4 R-e ; 0 face au GEL2 sur toutes les vues (§« Pli 3 »).

Écarts FAIL-CLOSED déclarés (throw ⇒ faux rouge possible) :
- S1 / S2 `<!--` dans `<style>` (texte brut) ou `<title>` (RCDATA), Rf `<!--` en valeur d'attribut, SANS terminateur
  plus loin : commentaire non fermé ⇒ throw ; A1 `<noscript>` en valeur d'attribut ⇒ noscript non fermé ⇒ throw.
- D-5 `<noscript>`, `<template>` ou commentaire non fermés (ANCIEN : fail-OPEN, texte caché compté).
- Règle d'ambiguïté (pli G2 delta) : une étendue de commentaire contenant l'ouvrante d'une surface cachée ⇒ throw nommé.
  Elle remplace un faux vert quand le `<!--` est en texte brut ou en attribut (Lb3, Lb4, U4, U5), et produit un faux
  rouge sur un vrai commentaire portant une ouvrante (X3, T4, C1, P2, Tc2, Ca1-Ca3 : exacts au GEL, throw désormais).
  Coût mesuré sur l'alphabet du worker jusqu'à 7 jetons, où cette règle est la seule différence de comportement entre
  le GEL et PLI2 : 154 920 séquences (sur 5 380 839) passent d'exact à throw.
- M-2 : plus de 256 templates imbriqués ⇒ throw nommé.
- Pli 3, éléments à texte brut (faux rouge possible là où le contenu ne ferait pas de mal) :
  - clause 1 : ouvrante cachée dans le contenu, même close à l'intérieur (L2t) ;
  - clause 2 : `</template>` dans le contenu, en template ;
  - clause 3 : élément jamais fermé (`plaintext` toujours).
  Coût jusqu'à 7 jetons (séquences exactes au GEL2 qui lèvent), clauses 1 / 2 / 3 : sur E13, 148 468 / 17 116 /
  4 399 933 ; sur E15, 269 116 / 33 124 / 13 067 491.
  La règle d'ambiguïté étendue aux ouvrantes à texte brut fait aussi lever un vrai commentaire portant une telle ouvrante
  (Ca4) : E13 434 385, E15 1 027 518.
  Attributs : une ouvrante à texte brut dans une valeur d'attribut (`<p title="<style>">`) est lue comme un élément
  (symétrie A1). Jamais fermé : throw (clause 3), faux rouge possible. Fermé plus loin (par une fermante logée dans le
  contenu d'un élément à texte brut réel) : son contenu fictif couvre l'ouvrante réelle, sautée par `rawSeen`, et la clause 1
  est contournée, faux vert (G-AttRaw, famille L-3, I-9). Réel : 0 (§« Pli 3 »).

Sur-retraits déclarés (texte visible retiré : faux vert possible pour les contrôles d'ABSENCE de /ukemi, doctrine D-1 (b)) :
- R-f à la racine : `<!--` en texte brut ou en attribut suivi d'un `-->` sans ouvrante cachée entre les deux : l'étendue est
  retirée ; identique à l'ANCIEN (sa regex de commentaires retirait la même étendue).
- S1t / Rft dans un template : `<!--` en texte brut ou en attribut dont l'étendue contient la `</template>` réelle :
  PLI2 OVER (le GEL aussi), ANCIEN et LOT-V1 exacts ⇒ NOUVEAU face à l'ANCIEN et à LOT-V1. La règle d'ambiguïté ne vise
  que les ouvrantes (variante A) ; la variante B (étendue contenant aussi une fin `</template` dans un template ⇒ throw)
  fermerait S1t/Rft mais ferait lever Tc (un vrai commentaire contenant `</template>`, exact au GEL et chez PLI2) ; mesure
  de la variante B jusqu'à 7 jetons sur l'alphabet de 15 : 12 258 séquences de plus passent d'exact à throw, 12 sur-retraits
  nouveaux face à l'ANCIEN en moins (30 108 → 30 096) ; arbitrage laissé à l'orchestrateur.
- Agrégat jusqu'à 7 jetons : nouveau sur-retrait de PLI2 face à l'ANCIEN, LOT-V1 et au GEL = **0** sur les alphabets E11,
  M9 et W9 ; sur E15 : 30 108, 1 573 et 1 302, et chacun porte `</template x>`, `</script/>`, `<style>` ou `</style>`
  (R-a, R-h) — par construction des vues, puisque E15 privé de ces quatre jetons est E11.
- Agrégat jusqu'à 7 jetons au pli 3 : nouveau sur-retrait de PLI3 face à l'ANCIEN / LOT-V1 / GEL2 = 4 558 / 676 / **0** sur
  E15, 2 534 / 0 / **0** sur E13, 0 sur E11, M9 et W9. Tous existaient déjà au GEL2 (0 nouveau face au GEL2). Sur E13, ce
  sont des S1 : un `<!--` dans un `<style>`, lu comme commentaire (fin `-->` ou `--!>`), retire du texte du `<style>`, ou,
  s'il franchit la fermante, du texte visible (déclarés plus haut, R-f/S1).

AMÉLIORATIONS face à l'ANCIEN : Rb3, V1 (`<script` + U+000B : ANCIEN sur-retrait ⇒ throw), C2, K1 exacts ; X3, T4, C1, P2
(exacts au pli G2) lèvent désormais par la règle d'ambiguïté : l'ANCIEN les sur-retirait (X3, T4), levait (C1) ou laissait `<!--` dans sa sortie sans lever (P2 : `<!-- a VISIBLE`).

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
  montée majeure de Next/React, ou une anomalie g3-site. Périmètre (pli G2 : + M-3 et R-h ; pli G2 delta : M-4 ; pli 3 :
  R-h retiré sauf CDATA de `svg`, R-t ajouté, L-3 renvoyé à I-9) :
  - R-a, y compris dans un template (Rat, U10, U9, et avec imbrication), et `</style/>` / `</style x>` pour les éléments à
    texte brut (D-15) ;
  - R-c, R-e, R-h du CDATA de `svg` (Rh9), R-t ;
  - `</template>` dans une valeur d'attribut à l'intérieur d'un template : ferme le template pour le scanner ; UNDER ×5,
    préexistant à l'ANCIEN (`<template><i title="</template>">HA</i></template>VA` ; G2 de confirmation, m-2) ;
  - B1-B3 (commentaires bogus), SR (`shadowrootmode`) ;
  - les sur-retraits R-f, S1, S1t, Rft ;
  - les levées déclarées : S1/S2/A1/Rf sans terminateur, règle d'ambiguïté sur un vrai commentaire portant une ouvrante
    cachée ou à texte brut, clauses 1 à 3 du pli 3.
  Action : re-mesurer (sondes `pli3\vectors-pli3.mjs`, `pli3\vectors-g2b-pli3.mjs`, énumération `pli3\enum\enum-pli3.mjs`,
  classement dans le même instrument) et, si retenu par ADR, rendre fail-closed ou fidèles les formes concernées :
  grammaire complète des fermantes (`</name` + espace ou `/` hors grammaire D3), états script data échappés, contenu
  étranger (`svg`, `math`).
- **I-5 SUBSTRING-STUBS-UNFLAGGED** — déclencheur : une alerte CodeQL sur l'un d'eux, ou le besoin d'un test à leurre.
  Même classe de routage par sous-chaîne, NON signalée par CodeQL, hors périmètre ADR (CA-5, R-25) :
  `ukemi-guard-record.test.ts:673` (`u.includes(host)` sur `["eth.drpc.org","rpc.mevblocker.io"]`) et les stubs
  `String(input).includes(CS_HOST)` du même fichier (hôte `.invalid` fixe).
- **I-6 R-H-RACINE (L-2)** — **CLOS SUR LA GRAMMAIRE D3** par la décision investisseur 187 (option B) et le pli 3 : clauses 1 à 3
  et règle d'ambiguïté étendue. Vérifié par énumération (E13 jusqu'à 7 jetons : 0 nouveau caché hors R-e face à l'ANCIEN,
  0 face au GEL2), 51 mutants et 19/19. Contournable hors grammaire D3 (G2 de confirmation M-1 : R-a et R-c d'un élément à
  texte brut, ouvrante à texte brut en attribut ; 0 atteignable) : tranchée par la décision 205 (I-9, I-10). Reste à l'orchestrateur
  l'amendement de D3 (« pas de `<style` », I-8).
- **I-7 AMBIGUITE-VARIANTE-B** — déclencheur : décision de l'orchestrateur avant G7. Variante A retenue (ouvrantes) ;
  variante B (+ une fin `</template` dans l'étendue d'un commentaire dans un template) ferme les sur-retraits S1t/Rft au
  prix de Tc et de 12 258 séquences exactes qui lèveraient (jusqu'à 7 jetons sur 15) ; instrument
  `pli2\variantB-assert-fleet-html.mjs`, mesures §« G2 delta pliée » et §Résidus.
- **I-8 ADR-D3-AMENDEMENT** — déclencheur : G7 (amendement de texte par l'orchestrateur, F-1). D3 écrit « les
  commentaires `<!-- … -->` » : le scanner suit désormais la fin de commentaire du navigateur (13.2.5.43, .44, .51, .52),
  lève sur une étendue de commentaire contenant une ouvrante cachée, et borne l'imbrication des templates à 256 ; X3, T4,
  C1, P2 (exacts au pli G2) lèvent ; R-25 = 392 (fourchette indicative 150-300 dépassée, seuil STOP 1 150 tenu).
  Au pli 3 (C-2 bis du CP2b, avec la décision 187), l'amendement porte aussi :
  - (vii) les éléments à texte brut (`style`, `title`, `textarea`, `xmp`, `iframe`, `noembed`, `noframes`, `plaintext`) :
    toujours pas retirés, mais vérifiés. Une ouvrante cachée dans le contenu, un `</template>` dans le contenu en
    template, ou un élément jamais fermé ⇒ throw nommé ; la règle d'ambiguïté couvre aussi leurs ouvrantes.
  - Le critère d'acceptation, écrit comme changement de métrique (CP2b (b)) : « 0 nouveau caché face à l'ANCIEN HORS la
    classe R-e, chaque cas classé contre parse5 ; 0 face au gel précédent », avec les comptes du pli 3 (E13 : 4, 4/4 R-e),
    sur la grammaire D3 (alphabet E13) ; classes exclues, chacune déclarée avec ses comptes : R-e, R-a (y compris texte
    brut), R-c (y compris texte brut), balises portant un `<` (A1, L-3).
  - La portée de D3 (iv) : grammaire du scanner, pas états échappés du navigateur (CP2b (b)(ii)).
  - R-25 = 546 (491 au pli 3 ; 494 au pli des corrections de la G2 de confirmation ; 546 au pli 5).
  - (viii) Décision investisseur 205 :
    - exemption écrite de D3 (iv) pour la famille entière (R-a et R-c d'un élément à texte brut, ouvrante à texte brut en
      attribut, Att1), limite connue épinglée par la garde 1 ;
    - points d'injection de HTML brut du site épinglés par la garde 2 ;
    - scanner conforme renvoyé à un lot séparé (I-10), qui renverserait le ruling « D3 maison ».
- **I-9 L-3 ATTRIBUT-SWALLOW** — **TRANCHÉ par la décision investisseur 205** (ci-dessous). Déclencheur d'origine : décision
  de l'orchestrateur avant G7 ; même lettre de D3 (iv) que L-2, hors du mandat 187. Constat, mesures et option VARG :
  §« Pli 3 ». Options examinées :
  - (i) résidu déclaré, avec exemption écrite de D3 (iv) pour les valeurs d'attribut non modélisées (R-c, A1) ;
  - (ii) vérification « scripts d'abord » : ferme les formes à script non fermé (Att1), pas Att1c ; coût sur l'alphabet
    d'attribut jusqu'à 6 jetons : 10 393 séquences exactes lèvent (C2, Tn compris) ;
  - (iii) modéliser les valeurs d'attribut quotées des balises génériques (13.2.5.32 à 13.2.5.42) : ferme A1, R-c et Rf
    (Lb4, U5 et Byp2 deviendraient exacts), au prix d'un changement plus large (I-4).
  Réalité : 0 valeur d'attribut contenant `<` sur les 19 pages.
  **M-1 (G2 de confirmation, `g2-confirm\G2-CONFIRM.md` §2)** : même famille (une construction hors de la grammaire D3 fait
  compter un texte caché là où l'ANCIEN levait ou était exact). Trois formes contournent le correctif L-2 du pli 3, mesurées
  contre parse5 (ANCIEN throw ou exact, LOT-V1 à GEL3 UNDER) :
  - R-a sur un élément à texte brut : `<style></style/><title></style><noscript></title><script></noscript>HA` (aussi
    `</style x>`, et le script fermé plus loin) ;
  - R-c sur l'ouvrante d'un élément à texte brut : `<style title="x></style>"><noscript></style><script></noscript>HA` ;
  - ouvrante à texte brut dans une valeur d'attribut :
    `<p title="<style>"></p><title></style><noscript></title><script></noscript>HA`.
  Mécanisme commun : le saut `rawSeen` traite comme du texte l'ouvrante d'un élément à texte brut RÉEL logée dans un
  contenu que le scanner croit à texte brut ; le contenu de cet élément n'est jamais vérifié (clause 1 contournée).
  **Aucune n'est nouvelle face au gel 2** (LOT-V1, GEL1, GEL2 et GEL3 UNDER à l'identique). **0 sur les 19 pages** : aucune
  fermante R-a d'élément à texte brut, 0 écart de fin d'ouvrante ou de fin de contenu entre le scanner et parse5, aucun `<`
  dans une balise ouvrante. Le scanner n'est pas modifié : un 4ᵉ pli de code relèverait de l'escalade CP2b (a)-4.
  **Décision investisseur 193** (transmise par l'orchestrateur) : option (i), résidu déclaré avec exemption écrite de D3 (iv).
  **Décision investisseur 205** (2026-09-24, « ok » à 19:15Z, transmise par l'orchestrateur ; option (iii) de l'escalade M-1,
  distincte de l'option (iii) ci-dessus) : la décision 193 (option (i), exemption écrite de D3 (iv)) est **élargie à toute
  la famille**.
  - **Limite connue** = la famille entière : R-a d'un élément à texte brut ; R-c sur l'ouvrante d'un élément à texte brut ;
    ouvrante à texte brut dans une valeur d'attribut ; Att1 (ouvrante cachée dans une valeur d'attribut, L-3).
  - **0 forme nouvelle face au gel 2** ; **0 sur les 19 pages**.
  - Pas de 4ᵉ pli de code ; la fusion vient ensuite ; un scanner conforme fera l'objet d'un lot séparé (I-10).
  - Épinglé au pli 5 par deux gardes non-LLM (`test/site-build-fleet.test.ts`) :
    - garde 1, `rendered_body_known_limit_family_pinned` : chaque forme THROW ou UNDER ; EXACT ⇒ retirer l'exemption ;
    - garde 2, `site_raw_html_injection_points_pinned` : `dangerouslySetInnerHTML` seulement dans
      `apps/site/app/layout.tsx`, une fois ; 0 `rehype-raw` et 0 `innerHTML =` dans `apps/site`.
- **I-10 SCANNER-CONFORME-1** (formé au pli 5, décision investisseur 205) — déclencheur : **décision investisseur**,
  découplée de CodeQL (ni la fenêtre publique ni une alerte ne la déclenchent). Objet : un scanner conforme à la
  tokenisation HTML, qui lève la limite connue d'I-9 (la famille entière) et les résidus d'I-4. Deux points connus :
  - **parse5 serait une dépendance nouvelle** : vérification du registre AVANT installation (R-8). Elle renverse le ruling
    du checkpoint-1 « D3 maison (pas `parse5`) » et appelle donc un ADR.
  - **Le contrat de sortie du scanner est à réécrire.** `renderedBody` rend aujourd'hui le HTML privé de ses surfaces
    cachées, balises génériques et attributs CONSERVÉS, parce que `extractMain` et `mainCorpus` lisent `<main …>` et les
    attributs `alt`, `title` et `aria-label`. Un scanner fondé sur un arbre doit redéfinir ce contrat avec ses consommateurs
    (g3-site sur /fleet et /ukemi).
  À la clôture de cet item, la garde 1 passe à l'exact (l'exemption retirée) et la garde 2 est revue avec le nouveau
  contrat.

## error_origin (C-3 bis ; doc 06 §4.3 : étage fautif ∈ {PLANIFICATEUR, IMPLEMENTEUR, RELECTEUR, ORACLE}, assigné au G7)

Assignés par l'orchestrateur (C-3 bis du checkpoint-2 bis, transmis au worker avec la décision 187 ; recopiés tels quels).
Les valeurs sont écrites avec les jetons de `ERROR_ORIGINS` du gabarit `templates\workflow-passe-agilegates.js:38` du
corpus : « plan » = `PLANIFICATEUR`, « génération » = `IMPLEMENTEUR`. Doc 06 §4.3 accentue « IMPLÉMENTEUR » : c'est une
incohérence interne au corpus (G2 de confirmation, m-3), et les jetons du gabarit sont retenus pour la lecture machine.

| Constat | error_origin | Objet |
|---|---|---|
| B-1 (G2) | génération (IMPLEMENTEUR) | fin de template prise à la première `</template>` ; énoncé « strictly safer » repris de l'advisor |
| A-r1 (G2) | génération (IMPLEMENTEUR) | texte de dismiss #17 inexact (`subject` EST une URL) |
| A-r2 (G2) | plan (PLANIFICATEUR) | numéros de ligne de l'ADR (l.61/l.70 ; `transport.ts` l.157) |
| L-1 (G2 delta) | plan (PLANIFICATEUR) | l'ADR D3 fixait la grammaire littérale `<!-- … -->` |
| B-2 (G2 delta) | génération (IMPLEMENTEUR) | cette grammaire réemployée dans `templateEnd` |
| M-2 (G2 delta) | génération (IMPLEMENTEUR) | récursion non bornée |
| D-11 (pli G2 delta) | génération (IMPLEMENTEUR) | docstring lue par le balayage d'imports de `durable.test.ts` |

Proposés par le worker, NON assignés (absents de la liste transmise ; l'orchestrateur tranche au G7) :

| Constat | Lecture proposée | Motif |
|---|---|---|
| L-2 (CP2b (c)) | génération (IMPLEMENTEUR) | La passe unique (D-1, décision du worker) a retiré l'ordre « scripts d'abord » qui faisait lever l'ANCIEN sur toute ouvrante `<script` non fermée. Note, et non seconde valeur (doc 06 §4.3 assigne UN étage) : le périmètre « pas de `<style` » (M-24, plan) était le même pour l'ANCIEN, qui restait sûr ; le plan l'avait écrit sans analyse du texte brut. |
| L-3 (pli 3, non plié) | génération (IMPLEMENTEUR) | Même racine (passe unique), valeur d'attribut au lieu de texte brut. |
| Rh1acc (pli 3) | génération (IMPLEMENTEUR) | La fin de commentaire du pli G2 delta a levé le masque d'un R-h préexistant dans un template (ANCIEN et LOT-V1 exacts par accident). |

Proposés par la G2 de confirmation pour ses propres constats (`g2-confirm\G2-CONFIRM.md` §3 (d)), NON assignés :

| Constat | Lecture proposée | Motif du relecteur |
|---|---|---|
| M-1 | génération (IMPLEMENTEUR) | introduit à LOT-V1 (ANCIEN throw ou exact, LOT-V1 UNDER) |
| M-2 | génération (IMPLEMENTEUR) | journal G1 |
| m-1 | génération (IMPLEMENTEUR) | test manquant (borne du saut) |
| m-2 | préexistant à l'ANCIEN, étage non attribuable au lot | — |

## Table des mutants (D-1, A-11, D-1-bis)

Exécution 1 (G1, arbre LOT-V1) ci-dessous, conservée pour l'histoire ; l'exécution qui fait foi pour l'arbre livré est
celle du pli 3 (dernière sous-section) ; celles du pli G2 et du pli G2 delta restent consignées.

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

### Table des mutants du pli G2 delta (39 ; historique)

Harnais `F:\tmp\codeql-alerts-1\pli2\mutants-pli2.mjs` = harnais du pli G2 épissé en node (entrées inchangées copiées octet pour
octet ; MT1-MT4 adaptés à la signature `depth` ; les 8 mutants du relecteur (`g2b\mutants-own.mjs`, MT5 adapté,
`testFiles` ramené au fichier du test visé) et 10 mutants du worker ajoutés), même protocole A-11 / D-1-bis. Deux exécutions :
sur l'arbre du pli avant D-11 (`results-1790235858491.json`, 07:41:16Z → 07:44:18Z) et sur l'arbre FINAL (`results-1790236218935.json`, 07:47:35Z →
07:50:19Z, fait foi) : **39/39 tués par le test visé, 39/39 restaurations octet-exactes**, statut de mise à mort identique
aux deux exécutions pour les 39 ; sha muté identique au pli G2 pour les mutants des fichiers que ce pli ne touche pas.

| # | Mutation | Test tueur | autres rouges | sha golden → muté | = pli G2 ? |
|---|---|---|---|---|---|
| M1-D1-block-removed | idem pli G2 | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `0492396020ef…` | oui |
| M2-D1-contents-write | idem pli G2 | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `7c4805512a2a…` | oui |
| M3-D1-job-level-write-all | idem pli G2 | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `a6a3b25079e4…` | oui |
| M4-D1-block-above-on | idem pli G2 | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `59fbd6cb4279…` | oui |
| M5-D2-escaping-removed | idem pli G2 | `keyless_redact_matches_target_forms_literally_not_as_patterns` → **rouge (tué)** | — | `64a84454b8e8…` → `0b31b77c6902…` | oui |
| M6-D3-script-output-guard-removed | idem pli G2 | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `cdfd81cfc976…` | non (fichier modifié par ce pli) |
| M7-D3-comment-output-guard-removed | idem pli G2 | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `541e2784d7dc…` | non (fichier modifié par ce pli) |
| M8-D3-closer-without-whitespace | idem pli G2 | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `8383836a7ea4…` | non (fichier modifié par ce pli) |
| M9-D3-unclosed-block-fail-open | idem pli G2 | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `f40333f2317b…` → `25ad6e97a48b…` | non (fichier modifié par ce pli) |
| M10-D4-ukemi-isHost-includes | idem pli G2 | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `c7ff185c3738…` | non (fichier modifié par ce pli) |
| M11-D4-bell-isHttpsHost-startsWith | idem pli G2 | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `9dc3ac37f288…` | non (fichier modifié par ce pli) |
| M12-D5b-escapeHtml-dropped | idem pli G2 | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | — | `3a76793ab6eb…` → `2c7b544326f3…` | oui |
| M13-D5b-served-listing-unescaped | idem pli G2 | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | — | `3a76793ab6eb…` → `8bb2d2fa34d2…` | oui |
| M14-D5a-rename-reverted-at-a-call-site | idem pli G2 | `npm run typecheck (exit 2)` → **rouge (tué)** | — | `da10ff690170…` → `345730e0a21c…` | oui |
| GM4p-D3-closer-accepts-any-tail | idem pli G2 | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `17cdcc7a12ad…` | non (fichier modifié par ce pli) |
| GM7-D4-ukemi-hostname-suffix | idem pli G2 | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `e556f87c6d32…` | non (fichier modifié par ce pli) |
| GM7b-D4-bell-hostname-suffix | idem pli G2 | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `f5349d2ab44f…` | non (fichier modifié par ce pli) |
| MT1p-B1-template-ends-at-first-closer | `surfaceEnd` : fin de template = première `</template>` (lot-v1) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `f40333f2317b…` → `e3e624d42df3…` | — (nouveau) |
| MT2p-B1-nested-noscript-not-skipped-in-template | `templateEnd` : `<noscript>` imbriqué non sauté | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `1743f6e534e0…` | — (nouveau) |
| MT3p-B1-unclosed-nested-surface-swallowed-in-template | `templateEnd` : surface imbriquée non fermée avalée | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `f40333f2317b…` → `e54b634799fa…` | — (nouveau) |
| MT4p-B1-nested-template-not-counted | `templateEnd` : `<template>` imbriqué non compté | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `f40333f2317b…` → `2b68632128bc…` | — (nouveau) |
| MT5p-G2b-comment-not-skipped-in-template | `templateEnd` : commentaire non consommé (MT5 du relecteur) | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `f40333f2317b…` → `4bbb38a1927d…` | — (nouveau) |
| MT6-G2b-template-closer-exact-lowercase-no-space | fermante de template exacte, minuscule, sans espace (relecteur) | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `56aea5749c3e…` | — (nouveau) |
| MT6b-G2b-template-closer-no-name-boundary | fermante de template sans frontière de nom (relecteur) | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `f40333f2317b…` → `75eeb37cba50…` | — (nouveau) |
| GM7c-G2b-ukemi-dot-boundary-subdomain | `isHost` : `=== host || endsWith("." + host)` (relecteur) | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `f0c7d2d9c453…` | — (nouveau) |
| GM7d-G2b-bell-dot-boundary-subdomain | `isHttpsHost` : idem (relecteur) | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `ed6d6db56493…` | — (nouveau) |
| GM7e-G2b-ukemi-hostname-prefix | `isHost` : `startsWith(host)` (relecteur) | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `7cd1ca7884b9…` | — (nouveau) |
| GM7f-G2b-bell-hostname-prefix | `isHttpsHost` : `startsWith(host)` (relecteur) | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `bc94da5bfa66…` | — (nouveau) |
| GM7g-G2b-ukemi-hostname-includes | `isHost` : `includes(host)` (relecteur) | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `2c8421595a2e…` | — (nouveau) |
| MC1-B2-abrupt-empty-comment-not-closed | `<!-->` non fermé aussitôt (13.2.5.43) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `d238d4f0c6ee…` | — (nouveau) |
| MC2-B2-abrupt-dash-comment-not-closed | `<!--->` non fermé aussitôt (13.2.5.44) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `1e2952eccfc4…` | — (nouveau) |
| MC3-B2-bang-close-not-a-terminator | `--!>` n'est pas une fin (13.2.5.52) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `ded53865d093…` | — (nouveau) |
| MC4-B2-ambiguous-span-rule-removed | règle d'ambiguïté retirée | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `e83f381e340a…` | — (nouveau) |
| MC5-B2-ambiguous-span-checks-first-tag-only | règle d'ambiguïté limitée à la première balise de l'étendue | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `4c472c1d3497…` | — (nouveau) |
| MC6-M2-depth-bound-removed | borne de profondeur retirée | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `b3a07771b614…` | — (nouveau) |
| MC7-M2-depth-bound-off-by-one | borne de profondeur décalée d'un cran (`>=`) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `465af993672e…` | — (nouveau) |
| MC8-M2-depth-not-propagated-to-nested-surfaces | profondeur non propagée aux surfaces imbriquées | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `7a7d6e5c7e24…` | — (nouveau) |
| MC9-B2-terminator-search-overlaps-the-opener | recherche de la fin à partir de `lt + 2` (chevauche l'ouvrante) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `96744021d1d6…` | — (nouveau) |
| MC10-B2-bang-close-length-wrong | longueur de `--!>` fausse (toujours `+ 3`) | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `f40333f2317b…` → `6ec0f5220667…` | — (nouveau) |

Messages exacts (champ `error:` du TAP du test tueur ; M14 : ligne de `tsc`) :

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
MT1p-B1-template-ends-at-first-closer: (T1) a </template> inside a nested <script> closes nothing + actual - expected  + '";</script>HIDDEN</template>VISIBLE' - 'VISIBLE' 
MT2p-B1-nested-noscript-not-skipped-in-template: (T2) a </template> inside a nested <noscript> closes nothing + actual - expected  + 'HIDDEN</noscript></template>VISIBLE' - 'VISIBLE' 
MT3p-B1-unclosed-nested-surface-swallowed-in-template: 'Missing expected exception: (T3) an unclosed <script> nested in a <template> throws (ADR D3 (iv))'
MT4p-B1-nested-template-not-counted: (Rd) a nested template closes its own </template> first + actual - expected  + 'HIDDEN</template>VISIBLE' - 'VISIBLE' 
MT5p-G2b-comment-not-skipped-in-template: (Tc) a </template> inside a comment in a template closes nothing + actual - expected  + ' -->HA</template>VA' - 'VA' 
MT6-G2b-template-closer-exact-lowercase-no-space: 'assert-fleet-html: an unclosed <template> block (no matching </template>) - fail-closed'
MT6b-G2b-template-closer-no-name-boundary: 'assert-fleet-html: an unclosed <template> block (no matching </template>) - fail-closed'
GM7c-G2b-ukemi-dot-boundary-subdomain: a decoy never routes as drpc: https://a.eth.drpc.org  true !== false 
GM7d-G2b-bell-dot-boundary-subdomain: a decoy never routes as the Solana RPC: https://a.api.mainnet.solana.com/  true !== false 
GM7e-G2b-ukemi-hostname-prefix: a decoy never routes as drpc: https://eth.drpc.org.evil.com  true !== false 
GM7f-G2b-bell-hostname-prefix: a decoy never routes as the Solana RPC: https://api.mainnet.solana.com.evil.com/  true !== false 
GM7g-G2b-ukemi-hostname-includes: a decoy never routes as drpc: https://eth.drpc.org.evil.com  true !== false 
MC1-B2-abrupt-empty-comment-not-closed: 'assert-fleet-html: an unclosed <!-- comment (no matching --> or --!>) - fail-closed'
MC2-B2-abrupt-dash-comment-not-closed: 'assert-fleet-html: an unclosed <!-- comment (no matching --> or --!>) - fail-closed'
MC3-B2-bang-close-not-a-terminator: 'assert-fleet-html: an unclosed <!-- comment (no matching --> or --!>) - fail-closed'
MC4-B2-ambiguous-span-rule-removed: 'Missing expected exception: (Lb3) `<!--` in a <style>'
MC5-B2-ambiguous-span-checks-first-tag-only: 'Missing expected exception: (Lb3) `<!--` in a <style>'
MC6-M2-depth-bound-removed: 'Missing expected exception: (D257) deeper nesting throws, named'
MC7-M2-depth-bound-off-by-one: 'assert-fleet-html: <template> nested deeper than 256 levels - fail-closed'
MC8-M2-depth-not-propagated-to-nested-surfaces: 'Missing expected exception: (D257) deeper nesting throws, named'
MC9-B2-terminator-search-overlaps-the-opener: 'Missing expected exception: (Rb5) `<!--!>` closes nothing: only a `>` right after `<!--` does (13.2.5.43)'
MC10-B2-bang-close-length-wrong: (Rb3) `--!>` closes the comment  '>VA' !== 'VA' 
```

### Table des mutants du pli 3 (51 ; fait foi)

Harnais `F:\tmp\codeql-alerts-1\pli3\mutants-pli3.mjs` = harnais du pli G2 delta (`pli2\mutants-pli2.mjs`) recopié en node octet
pour octet (diff = 38 lignes : les 12 entrées MR ajoutées, la ligne OUT), même protocole A-11 / D-1-bis ; `--dry` : ancres
uniques 51/51 (MR7b ancrée par la ligne qui la précède, la ligne seule apparaissant deux fois). Exécution `results-1790259208197.json`
(14:07:04Z → 14:13:28Z, arbre du pli 3, scanner `fcbd28b0…`) : **51/51 tués par le test visé, 51/51 restaurations octet-exactes** ;
parité avec le passage du pli G2 delta : message du tueur identique 39/39 (les 39 anciens), sha muté identique 17/17 pour les
mutants des fichiers que le pli 3 ne touche pas (les 22 autres visent le scanner, dont le blob a changé).

| # | Mutation | Test tueur | autres rouges | sha golden → muté | = pli G2 delta ? |
|---|---|---|---|---|---|
| M1-D1-block-removed | idem plis précédents | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `0492396020ef…` | oui |
| M2-D1-contents-write | idem plis précédents | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `7c4805512a2a…` | oui |
| M3-D1-job-level-write-all | idem plis précédents | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `a6a3b25079e4…` | oui |
| M4-D1-block-above-on | idem plis précédents | `ci_workflow_declares_least_privilege_permissions` → **rouge (tué)** | — | `207dfe808014…` → `59fbd6cb4279…` | oui |
| M5-D2-escaping-removed | idem plis précédents | `keyless_redact_matches_target_forms_literally_not_as_patterns` → **rouge (tué)** | — | `64a84454b8e8…` → `0b31b77c6902…` | oui |
| M6-D3-script-output-guard-removed | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `fcbd28b03798…` → `53cef1ba86d5…` | non (scanner modifié) ; message identique |
| M7-D3-comment-output-guard-removed | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `fcbd28b03798…` → `f927f8d208a0…` | non (scanner modifié) ; message identique |
| M8-D3-closer-without-whitespace | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_raw_text_elements` | `fcbd28b03798…` → `251392df2f66…` | non (scanner modifié) ; message identique |
| M9-D3-unclosed-block-fail-open | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `fcbd28b03798…` → `e44dd8558a85…` | non (scanner modifié) ; message identique |
| M10-D4-ukemi-isHost-includes | idem plis précédents | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `c7ff185c3738…` | oui |
| M11-D4-bell-isHttpsHost-startsWith | idem plis précédents | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `9dc3ac37f288…` | oui |
| M12-D5b-escapeHtml-dropped | idem plis précédents | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | — | `3a76793ab6eb…` → `2c7b544326f3…` | oui |
| M13-D5b-served-listing-unescaped | idem plis précédents | `bell_caddy_browse_listing_escapes_entry_names` → **rouge (tué)** | — | `3a76793ab6eb…` → `8bb2d2fa34d2…` | oui |
| M14-D5a-rename-reverted-at-a-call-site | idem plis précédents | `npm run typecheck (exit 2)` → **rouge (tué)** | — | `da10ff690170…` → `345730e0a21c…` | oui |
| GM4p-D3-closer-accepts-any-tail | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_raw_text_elements` | `fcbd28b03798…` → `0f2f8f1fba86…` | non (scanner modifié) ; message identique |
| GM7-D4-ukemi-hostname-suffix | idem plis précédents | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `e556f87c6d32…` | oui |
| GM7b-D4-bell-hostname-suffix | idem plis précédents | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `f5349d2ab44f…` | oui |
| MT1p-B1-template-ends-at-first-closer | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth`, `rendered_body_raw_text_elements` | `fcbd28b03798…` → `05dac020f109…` | non (scanner modifié) ; message identique |
| MT2p-B1-nested-noscript-not-skipped-in-template | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `fcbd28b03798…` → `8604fec041ee…` | non (scanner modifié) ; message identique |
| MT3p-B1-unclosed-nested-surface-swallowed-in-template | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth`, `rendered_body_raw_text_elements` | `fcbd28b03798…` → `7d17a2b79810…` | non (scanner modifié) ; message identique |
| MT4p-B1-nested-template-not-counted | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth` | `fcbd28b03798…` → `2ddc999ae20c…` | non (scanner modifié) ; message identique |
| MT5p-G2b-comment-not-skipped-in-template | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_comment_forms_and_template_depth`, `rendered_body_raw_text_elements` | `fcbd28b03798…` → `6a62ffbdc8d6…` | non (scanner modifié) ; message identique |
| MT6-G2b-template-closer-exact-lowercase-no-space | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | — | `fcbd28b03798…` → `bc9e8f2b76ce…` | non (scanner modifié) ; message identique |
| MT6b-G2b-template-closer-no-name-boundary | idem plis précédents | `rendered_body_scanner_outcomes` → **rouge (tué)** | `rendered_body_raw_text_elements` | `fcbd28b03798…` → `2901e38aeb38…` | non (scanner modifié) ; message identique |
| GM7c-G2b-ukemi-dot-boundary-subdomain | idem plis précédents | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `f0c7d2d9c453…` | oui |
| GM7d-G2b-bell-dot-boundary-subdomain | idem plis précédents | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `ed6d6db56493…` | oui |
| GM7e-G2b-ukemi-hostname-prefix | idem plis précédents | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `7cd1ca7884b9…` | oui |
| GM7f-G2b-bell-hostname-prefix | idem plis précédents | `bell_adv1_stub_routes_rpc_by_exact_https_host` → **rouge (tué)** | — | `b444efae2aa8…` → `bc94da5bfa66…` | oui |
| GM7g-G2b-ukemi-hostname-includes | idem plis précédents | `ukemi_record_stub_routes_drpc_by_exact_hostname` → **rouge (tué)** | — | `49f8c3ededdf…` → `2c8421595a2e…` | oui |
| MC1-B2-abrupt-empty-comment-not-closed | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `c7209537765b…` | non (scanner modifié) ; message identique |
| MC2-B2-abrupt-dash-comment-not-closed | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `48b7af2595c6…` | non (scanner modifié) ; message identique |
| MC3-B2-bang-close-not-a-terminator | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `681598ba668b…` | non (scanner modifié) ; message identique |
| MC4-B2-ambiguous-span-rule-removed | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | `rendered_body_raw_text_elements` | `fcbd28b03798…` → `8cd4a3b9d289…` | non (scanner modifié) ; message identique |
| MC5-B2-ambiguous-span-checks-first-tag-only | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | `rendered_body_raw_text_elements` | `fcbd28b03798…` → `7cc3e314f16c…` | non (scanner modifié) ; message identique |
| MC6-M2-depth-bound-removed | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `643b0d9d5501…` | non (scanner modifié) ; message identique |
| MC7-M2-depth-bound-off-by-one | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `ff82ad0014d5…` | non (scanner modifié) ; message identique |
| MC8-M2-depth-not-propagated-to-nested-surfaces | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `601a39c8549a…` | non (scanner modifié) ; message identique |
| MC9-B2-terminator-search-overlaps-the-opener | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `c3d992cec565…` | non (scanner modifié) ; message identique |
| MC10-B2-bang-close-length-wrong | idem plis précédents | `rendered_body_comment_forms_and_template_depth` → **rouge (tué)** | — | `fcbd28b03798…` → `8d5d38c5351a…` | non (scanner modifié) ; message identique |
| MR1-L2-check-removed-at-top-level | contrôle des éléments à texte brut retiré de la boucle racine | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `b4baeaa429e4…` | — (nouveau) |
| MR2-L2-check-removed-in-templates | même contrôle retiré de la boucle des templates | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `7d47ad36f8ba…` | — (nouveau) |
| MR3-L2-clause1-opener-in-content-not-thrown | clause 1 retirée (ouvrante cachée dans le contenu) | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `1d2e31d98612…` | — (nouveau) |
| MR4-L2-clause2-template-closer-in-content-not-thrown | clause 2 retirée (fermante de template dans le contenu, en template) | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `8b00742cacb1…` | — (nouveau) |
| MR5-L2-clause3-unclosed-not-thrown | clause 3 retirée (élément jamais fermé) | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `09385a4a5026…` | — (nouveau) |
| MR6-L2-clause2-also-at-top-level | clause 2 appliquée aussi à la racine | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `f403a5c5608e…` | — (nouveau) |
| MR7-L2-no-skip-inside-raw-text-top-level | pas de saut des ouvrantes à texte brut dans un contenu déjà vérifié (racine) | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `86727076520f…` | — (nouveau) |
| MR7b-L2-no-skip-inside-raw-text-in-templates | idem, dans un template | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `bcb8027e5093…` | — (nouveau) |
| MR8-L2-ambiguity-rule-back-to-hidden-openers-only | règle d'ambiguïté ramenée aux seules ouvrantes cachées | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `0cbad5ad88bf…` | — (nouveau) |
| MR9-L2-title-dropped-from-the-list | `title` retiré de la liste | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `f7491bb19bc2…` | — (nouveau) |
| MR10-L2-plaintext-closable | `plaintext` fermable | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `198c67c4f637…` | — (nouveau) |
| MR11-L2-raw-text-opener-in-content-also-thrown | une ouvrante à texte brut dans le contenu lève aussi | `rendered_body_raw_text_elements` → **rouge (tué)** | — | `fcbd28b03798…` → `3922b34ff293…` | — (nouveau) |

Messages exacts des 12 mutants nouveaux (champ `error:` du TAP du test tueur) :

```
MR1-L2-check-removed-at-top-level: 'Missing expected exception: (L2) the noscript read in the style swallowed the script opener'
MR2-L2-check-removed-in-templates: 'Missing expected exception: (L2t) inside a template too'
MR3-L2-clause1-opener-in-content-not-thrown: 'Missing expected exception: (L2) the noscript read in the style swallowed the script opener'
MR4-L2-clause2-template-closer-in-content-not-thrown: 'Missing expected exception: (Rh1)'
MR5-L2-clause3-unclosed-not-thrown: 'Missing expected exception: (Ru1) its text would run to the end of the input'
MR6-L2-clause2-also-at-top-level: 'assert-fleet-html: a <style> element in a <template> holds a </template> (text to a browser, the template end to this scanner) - fail-closed'
MR7-L2-no-skip-inside-raw-text-top-level: 'assert-fleet-html: an unclosed <title> element (its text runs to the end of the input) - fail-closed'
MR7b-L2-no-skip-inside-raw-text-in-templates: 'assert-fleet-html: an unclosed <title> element (its text runs to the end of the input) - fail-closed'
MR8-L2-ambiguity-rule-back-to-hidden-openers-only: 'Missing expected exception: (Byp1) a <!-- in raw text'
MR9-L2-title-dropped-from-the-list: 'Missing expected exception: (L2-title) every raw-text element'
MR10-L2-plaintext-closable: 'Missing expected exception: (Pt) plaintext never ends'
MR11-L2-raw-text-opener-in-content-also-thrown: 'assert-fleet-html: a <style> element holds a <title> opener (text to a browser, live markup to this scanner) - fail-closed'
```

Rejoués au pli des corrections de la G2 de confirmation : **X12, X13** (mutants du relecteur, `lt < rawSeen` → `lt <= rawSeen`,
à la racine et dans un template). Sur le test du gel 3, ils survivent (8/8). Après le diff m-1, ils sont tués par
`rendered_body_raw_text_elements` (« (L2adj) back-to-back raw-text elements », « (Rh1adj) likewise in a template ») ; le sha
muté est identique à celui du relecteur (`58ec943d…`, `ea4cf9bf…`) et les restaurations sont octet-exactes
(`pli4\before\`, `pli4\after\`).

Mutants des gardes du pli 5 : mini-harnais `pli5\mutants-guards-run.mjs`, qui est le harnais du pli 3 dont seul le tableau
MUTANTS change (`pli5\run\`, 19:19:36Z → 19:19:39Z ; rejoués sur le test final, `pli5\run2\`, 19:32:18Z → 19:32:21Z, mêmes tueurs). **5/5 tués par le test visé, 5/5 restaurations octet-exactes** : sha
avant = après sur les 5 fichiers (`pli5\mg.sha-*`), 0 `.mut-tmp`.

| # | Mutation | Test tueur | Message du tueur |
|---|---|---|---|
| MG1 | `// dangerouslySetInnerHTML` planté dans `apps/site/app/fleet/page.tsx` | `site_raw_html_injection_points_pinned` | la liste reçue nomme `apps/site/app/fleet/page.tsx x1` |
| MG2 | attribut du script de thème retiré d'`app/layout.tsx` | idem | liste reçue vide au lieu de `apps/site/app/layout.tsx x1` |
| MG3 | `"rehype-raw"` planté dans `apps/site/package.json` | idem | la liste reçue nomme `apps/site/package.json` |
| MG4 | `innerHTML =` planté dans `apps/site/app/fleet/page.tsx` | idem | la liste reçue nomme `apps/site/app/fleet/page.tsx` |
| MG5 | le scanner rend sa sortie sans `HA` : les 4 formes deviennent EXACT | `rendered_body_known_limit_family_pinned` | « (G-RaSkip, R-a closer of a raw-text element) came out EXACT (no throw, HA not counted). Conformant on this known-limit form? Then remove its exemption (I-9, decision 205) … Payload lost? Then it is a regression. … » (au premier passage, avant D-21 : « … the scanner is now conformant … ») |

## Fichiers touchés (13 de code + ce journal) — sha256 octets bruts AVANT (base `e7af51c`) → APRÈS (état livré après le pli 5)

Le pli G2 a changé 4 fichiers ; leur sha LOT-V1 (livré au G1) : `scripts/assert-fleet-html.mjs` `6c0f7976…`,
`test/site-build-fleet.test.ts` `04809f16…`, `apps/bell/test/bell-adv-1.test.ts` `250ea0af…`,
`apps/sentinel/test/ukemi-guard-record.test.ts` `3077bd84…`. Les 9 autres fichiers de code sont inchangés depuis le G1.
Le pli G2 delta a changé 5 fichiers ; leur sha au gel `8229745` : `scripts/assert-fleet-html.mjs` `5b4359d6…`, `scripts/assert-fleet-html.d.mts` `26aaf6e4…`, `test/site-build-fleet.test.ts` `1f51285d…`, `apps/bell/test/bell-adv-1.test.ts` `b9db1f04…`, `apps/sentinel/test/ukemi-guard-record.test.ts` `9e053410…`. Les 8 autres fichiers de code
sont inchangés depuis le gel.
Le pli 3 a changé 3 fichiers ; leur sha au gel 2 `f33e6c5` : `scripts/assert-fleet-html.mjs` `f40333f2…`, `scripts/assert-fleet-html.d.mts` `697275b7…`, `test/site-build-fleet.test.ts` `98871205…`. Les 10 autres fichiers de code
sont inchangés depuis le gel 2.
Le pli des corrections de la G2 de confirmation a changé 1 fichier de code (test) : `test/site-build-fleet.test.ts` `b9de36e4…` → `a3df31fe…`
(+3 lignes, m-1). Les 12 autres fichiers de code sont inchangés depuis le gel 3.
Le pli 5 a changé 1 fichier de code (test) : `test/site-build-fleet.test.ts` `a3df31fe…` → `58935e6e…` (+52 lignes, gardes 1 et 2).
Les 12 autres fichiers de code sont inchangés depuis le gel 3 bis.

| Fichier | AVANT | APRÈS |
|---|---|---|
| `.github/workflows/ci.yml` | `468e17b632729b875a588fc2e590754444cdf3f908dc1919a6e6222553470460` | `207dfe8080140933a2bdba477311ebc9664b831272f0f86c5f3d95d646e40603` |
| `test/ci-gates.test.ts` | `96c4f563922784386dcdaf5ceb2bec4409d6528a27cf760edcd093696ab2f032` | `c010f60ecee1b2ec3b321a6ec41048bdfafc8fa61097f2abcf993f4b3e9a296b` |
| `packages/rpc-guard/src/transport.ts` | `fa1b9f1b7afd4e624537b14ad42c59cd2938cdf22e38f60a53c4f9e172af8485` | `64a84454b8e8acd8c9f1cbb6347e0dc174f3a695573fa2d8ddbedbdbeb17385e` |
| `packages/rpc-guard/test/error-hint.test.ts` | `8ba546cf808312ea72558582ff4037568bfc68284341e85c4dc6ed4afef0628c` | `f8543bb912f5f59966e3ddf433919c5d016d8e0e3d403fc47edafe38557ceb6e` |
| `scripts/assert-fleet-html.mjs` | `ba1d8324b13c9e607d1d85e5b96444303a53e57cececfe9f6dc0d6d7b7da2cbc` | `fcbd28b03798e1fd6eba8ced14dbc9e2563373e71549fc58e0d3dac4f0f23bf8` |
| `scripts/assert-fleet-html.d.mts` | `7c761adfdf1e30c708e64631759a018bc40fbef4f713c7a4f7b37d23b09be648` | `27cac187afc988a99789938d8a49fd134cd988aea4af9cf6f93b1dcea0c3e926` |
| `test/site-build-fleet.test.ts` | `22798272df18871d56776afc38353c167e1c0aad84f52c0809320e8858e68936` | `58935e6e3bbac169959f4f52b7b7ffef75fbc8feb59cb51e3462da421a93392e` |
| `apps/bell/test/bell-adv-1.test.ts` | `08415639d11559c487743395acbd55cddfe21e6e9188d7d0a4b34647b6d04f5b` | `b444efae2aa824e0ba2a4ed6f60a825cbdc62a3a7608c5ac0ad1ad4c87f3b00d` |
| `apps/sentinel/test/ukemi-guard-record.test.ts` | `c05791b2996eea9c0ca9d98c94839207e09743cf3fb2ba2f0d3d7cf4b7d4d631` | `49f8c3ededdf2c6f787896be12fc81091e8d285fc2b24ebd990f6c45a00a489c` |
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
- **Re-mesurés après le pli G2 delta** (08:0xZ, arbre final, scanner `f40333f2…`) : gel U-4b SAME ×9 ; tranche
  l.82-129 `c2f03ba8…` inchangée (les vecteurs ajoutés vont dans le test des issues D3 et dans un test nouveau, en fin
  de fichier) ; garde `/<script\b/i` + message présents verbatim ×1 (`guard-check.mjs`) ; 0 CR sur les 5 fichiers du pli ;
  0 caractère non-ASCII ajouté dans le code (`git diff -U0 e7af51c -- . ':(exclude)docs'`) ; 0 TODO/FIXME ajouté.
- **Re-mesurés après le pli 3** (~14:3xZ, scanner `fcbd28b0…`) :
  - gel U-4b SAME ×9 ;
  - tranche l.82-129 `c2f03ba8…` inchangée (le test nouveau est inséré après le test D257, dans le bloc du lot) ;
  - garde `/<script\b/i` + message présents verbatim ×1 (`guard-check.mjs`) ;
  - 0 CR sur les 3 fichiers du pli ; 0 caractère non-ASCII ajouté dans le code ; 0 TODO/FIXME ;
  - antislashs du scanner 40 → 40 (le code nouveau n'en porte aucun), du test 33 → 36 (les trois `<\/template>` voulus).
- **Re-mesurés au pli des corrections de la G2 de confirmation** (16:10:04Z, scanner `fcbd28b0…` inchangé) :
  - gel U-4b SAME ×9 ;
  - tranche l.82-129 `c2f03ba8…` inchangée (les deux assertions sont insérées dans le test du pli 3) ;
  - garde `/<script\b/i` + message présents verbatim ×1 ;
  - 0 CR ; 0 caractère non-ASCII ajouté dans le code ;
  - antislashs du test 36 → 37 (le `<\/template>` voulu de Rh1adj).
- **Re-mesurés au pli 5** (19:22:24Z, scanner `fcbd28b0…` inchangé) :
  - gel U-4b SAME ×9 ;
  - tranche l.82-129 `c2f03ba8…` inchangée (les gardes sont ajoutées en fin de fichier) ;
  - garde `/<script\b/i` + message présents verbatim ×1 ;
  - 0 CR ; 0 caractère non-ASCII ajouté dans le code ; 0 TODO/FIXME ;
  - antislashs du test 37 → 38 (le `\s` voulu de la regex `innerHTML`).

## Tuyaux (règle Branchement) — preuve par tuyau

| Tuyau (ADR) | Entrée | Sortie | Test d'intégration non-LLM (mesuré) |
|---|---|---|---|
| `ci.yml` → GitHub Actions | bloc `permissions` | jobs sous `contents: read` ; miroir dérivé idem | `ci_workflow_declares_least_privilege_permissions` (lit le fichier ET `derivePublicWorkflow`) ; test 42 (CI exportée verte) ; run vert de la fenêtre = I-1/I-3 |
| `transport.ts` (`redact`) → quorum / journaux | corps d'erreur RPC keyless | corps rédigé | client gardé réel, seul `fetch` bouchonné : `error-hint.test.ts` `:145`, `:186`, test nouveau ; `multi-operator.test.ts:312-313` ; `ukemi-guard-record.test.ts` (`rpcErrorsOf`, corps keyless rédigé journalisé) ; 17 importeurs `rpc-guard` verts |
| `assert-fleet-html.mjs` → `g3-site` | HTML rendu | texte contrôlé | `site-build-fleet.test.ts:82` (octet-identique) + `rendered_body_scanner_outcomes` (dont T1-T3, Rd, GM4, Tc, Tcase, Tws, Tx) + `rendered_body_comment_forms_and_template_depth` (B-2, L-1, M-2) + `rendered_body_raw_text_elements` (L-2, pli 3) + `rendered_body_known_limit_family_pinned` et `site_raw_html_injection_points_pinned` (gardes 1 et 2, décision 205) + `site-ukemi.test.ts` (via `assertUkemiBody`) ; pli G2 : composition servie rejouée sur l'artefact RÉEL construit hors réseau (19/19 pages identiques, `node scripts/assert-fleet-html.mjs` exit 0) + énumération exhaustive contre oracle de référence (0 nouveau texte caché compté) ; pli G2 delta : 19/19 sur l'arbre final, énumération jusqu'à 7 jetons sur 15 et classement de chaque nouveau texte caché (0 inexpliqué) |

## R-25 (A-5)

Au G1 : `git diff --shortstat e7af51c` (pathspec de la mission et pathspec verbatim de `ci.yml:71`) ⇒ +234 −36 =
**270**. **Après le pli G2** (pathspec VERBATIM de la ligne `STAT=` de `ci.yml`, l.71, exclusions séries bell comprises)
: `13 files changed, 277 insertions(+), 36 deletions(-)` ⇒ **313**. Le pli seul, face à lot-v1 : +74 −31 sur 4 fichiers
(`assert-fleet-html.mjs` +57 −25, `site-build-fleet.test.ts` +10 −1, `ukemi-guard-record.test.ts` +3 −2,
`bell-adv-1.test.ts` +4 −3). Au-dessus de la fourchette indicative 150-300 de l'ADR, sous la borne 1 205 et le seuil
STOP A-5 (1 150) : mesuré, pas rogné.

**Après le pli G2 delta** (même pathspec verbatim de `ci.yml:71`) : `13 files changed, 356 insertions(+), 36
deletions(-)` ⇒ **392**. Delta face au gel `8229745` : 5 fichiers, +112 −33 (`assert-fleet-html.mjs` +49 −24,
`site-build-fleet.test.ts` +51, `assert-fleet-html.d.mts`, `bell-adv-1.test.ts` et `ukemi-guard-record.test.ts` +4 −3
chacun). Au-dessus de la fourchette indicative 150-300 de l'ADR, sous le seuil STOP A-5 (1 150) et la borne 1 205 :
mesuré, pas rogné.

**Après le pli 3** (même pathspec verbatim de `ci.yml:71`) : `13 files changed, 455 insertions(+), 36 deletions(-)` ⇒
**491**. Delta face au gel 2 `f33e6c5` : 3 fichiers, +110 −11 (`assert-fleet-html.mjs` +58 −9, `site-build-fleet.test.ts` +48,
`assert-fleet-html.d.mts` +4 −2). Périmètre de la G2 de confirmation (`8229745..gel 3`, code seul) : 5 fichiers, +216 −38.
Au-dessus de la fourchette indicative 150-300 de l'ADR, sous le seuil STOP A-5 (1 150) et la borne 1 205 : mesuré, pas
rogné.

**Après le pli des corrections de la G2 de confirmation** (même pathspec verbatim de `ci.yml:71`) : `13 files changed, 458 insertions(+), 36 deletions(-)` ⇒ **494**. Delta face
au gel 3 `6443dcc` : 1 fichier (`test/site-build-fleet.test.ts`), +3 ⇒ 3 (le G1 est exclu par la pathspec).
Au-dessus de la fourchette indicative 150-300 de l'ADR, sous le seuil STOP A-5 (1 150) : mesuré, pas rogné.

**Après le pli 5** (même pathspec verbatim : `ci.yml:71` dans cet arbre, `ci.yml:65` dans `lot/etude-suite`, ligne
identique) : `13 files changed, 510 insertions(+), 36 deletions(-)` ⇒ **546**. Delta face au gel 3 bis `624550a` : 1 fichier
(`test/site-build-fleet.test.ts`), +52 ⇒ 52. Au-dessus de la fourchette indicative 150-300 de l'ADR, sous le seuil STOP
A-5 (1 150) : mesuré, pas rogné.

## Consigne standard : point par point

- A-1 fait (l.1). A-2 fait (`npm ci`, D-8 ; `require.resolve` dans le worktree). A-3 fait pour l'oracle ; D-9 pour
  `npm ci`. Oracle : 7 portes + tests ciblés (§Oracle) ; `npm test` complet NON lancé (ordre de mission : orchestrateur).
- A-4 fait : `F:\tmp\codeql-alerts-1\DELIVERED.sha256` (chemins relatifs au worktree) ; aucun commit ; rien sur C: (cache
  npm `F:\cache\npm`, `TEMP/TMP/TMPDIR=F:/tmp`) ; réseau : registre npm (`npm ci`) seulement ; tests en boucle locale
  (`127.0.0.1`) et `fetch` bouchonné.
- A-5 fait (270 au G1 ; 313 après le pli G2 ; 392 après le pli G2 delta ; 491 après le pli 3 ; 494 après le pli des corrections de la G2 de confirmation ; 546 après le pli 5). A-6 fait (9/9 avant/après + invariants, re-mesurés après chaque pli). A-7 fait
  (wrapper `ev.sh` ; build sous `pli\ev-build.sh` = `ev.sh` + `NEXT_TELEMETRY_DISABLED=1`), écart D-7 déclaré.
- A-8 : le test D2 alimente le transport réel par un corps HTTP 400 texte, forme d'un corps d'erreur keyless ; les
  entrées D3 sont des chaînes synthétiques de forme React (fixtures existantes) ET, au pli, les 19 pages RÉELLEMENT
  construites par `next build` (I-2 clos).
- A-9 / A-10 : n-a (aucune phrase servie ni valeur câblée vers une surface servie n'est modifiée).
- A-11 fait (harnais TAP, `byIntended` : 14/14 au G1, 21/21 au pli G2, 39/39 au pli G2 delta, 51/51 au pli 3 ; X12 et X13 du relecteur tués après m-1 ; 5/5 mutants des gardes au pli 5). A-12 partiel, déclaré : chaque TAP de mutant porte node, fichier de
  test, statut et sha muté ; l'identité de l'arbre (base `e7af51c` + diff non commité, épinglé par
  `DELIVERED.sha256`) est dans l'en-tête de ce journal, pas dans chaque en-tête de TAP. A-13 fait (sources à antislash par Edit/Write ; recomptes node
  `hunk-check.mjs`, `guard-check.mjs` ; deux recomptes bash faussés par le transport, refaits dans node).
- B-1 n-a (chemin payant inchangé : `closedHint`). B-2 tenu (`keyless_host_after_truncation…` vert). B-3 n-a
  (énumération des cibles inchangée). B-4 tenu (aucune lecture d'env ajoutée). B-5 n-a (aucun site `fetch` nouveau).
  B-6 : `bell_adv1_stub_routes_rpc_by_exact_https_host` épingle l'hôte ADMIS `api.mainnet.solana.com` (mutant M11).
- C-1..C-4 : n-a (classes d'erreur et classifieurs inchangés).
- D-1 fait (14 mutants nommés au G1 ; 21 au pli G2, dont GM4p/GM7/GM7b et MT1-MT4 ; 39 au pli G2 delta, dont les 8 du
  relecteur et MC1-MC10 ; 51 au pli 3, dont MR1-MR11 et MR7b ; tous tués par le test visé). D-2
  fait (vecteurs non vides, sorties exactes). D-3 fait (§Tuyaux). D-4 fait : aucune assertion retirée ni affaiblie —
  le diff des tests est additif, sauf les 4 conditions de stub rendues plus strictes et le renommage `match`→`matches`
  ; aux plis G2 et G2 delta, uniquement des ajouts (vecteurs, leurres, un test nouveau).
- E-1..E-3 : n-a. F-1 : l'ADR n'est pas modifié par le worker (tuyaux et résidus au présent journal ; report à l'ADR =
  orchestrateur). F-2 fait (0 non-ASCII ajouté, `gate:vocab` propre). F-3 fait (D-1..D-10). G-1 : n-a pour le worker.
  D-1-bis fait (restauration durable + relecture du sha).

## Oracle final (A-3 : codes capturés directement ; A-7 : `ev.sh`)

Au G1, arbre LOT-V1, conservé pour l'histoire ; l'oracle qui fait foi pour l'arbre livré est celui du pli 5
(dernière sous-section). Commandes lancées depuis `F:\Monark-wt-codeql`, journaux sous `F:\tmp\codeql-alerts-1\final\` (03:30:44Z →
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

### Oracle du pli G2 (historique ; A-3 : codes capturés directement ; A-7 : `ev.sh`)

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

### Oracle du pli G2 delta (arbre FINAL, scanner `f40333f2…` ; historique ; A-3 : codes capturés directement ; A-7 : `ev.sh`)

Journaux sous `F:\tmp\codeql-alerts-1\pli2\final\` (`final-*.log`, `final-*.tap`, `final-oracle.time`), 07:55:40Z →
08:03:39Z, après les 39 mutants rejoués sur l'arbre final et leurs restaurations. Premier passage (07:44Z, avant D-11) :
220 pass, 1 fail (`durable_production_path…`, D-11), corrigé ; tout ce qui suit est sur l'arbre final.

| Porte / suite | Résultat |
|---|---|
| `npm run gate:vocab`, `typecheck`, `lint`, `lang:gate`, `export:check` | exit 0 ×5 (typecheck : 0 erreur) |
| `npm run lint:ratchet` | exit 0 — `69/69` (plafond inchangé) |
| liste ciblée de la mission + ajouts D-10 | exit 0 — **221 tests, 221 pass, 0 fail, 0 skip** (220 + le test nouveau `rendered_body_comment_forms_and_template_depth`) ; `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` vert |
| importeurs de `rpc-guard` (liste G2 de 20 fichiers) | exit 0 — 232 tests, 230 pass, 0 fail, 2 skip préexistants déclarés (mêmes que G2 et le pli G2) |
| `test/export-public.test.ts` (test 42) | exit 0 — 2/2 (08:00:03Z → 08:03:39Z) |
| g3-site sur artefact construit hors réseau (arbre final) | exit 0 ; 19/19 identiques (§« G2 delta pliée ») |

### Oracle du pli 3 (arbre du pli 3, scanner `fcbd28b0…` ; historique ; A-3 : codes capturés directement ; A-7 : `ev.sh`)

Journaux sous `F:\tmp\codeql-alerts-1\pli3\final\` (`*.log`, `*.tap`, `oracle.time`), script `pli3\run-oracle3.sh`
(séquentiel, aucun mutant actif), 14:17:22Z → 14:30:47Z. `durable.test.ts` lancé seul d'abord, avant tout le reste
(garde D-11 : 1/1, `pli3\durable-first.tap`).

| Porte / suite | Résultat |
|---|---|
| `npm run gate:vocab`, `typecheck`, `lint`, `lang:gate`, `export:check` | exit 0 ×5 (typecheck : 0 erreur) |
| `npm run lint:ratchet` | exit 0 — `69/69` (plafond inchangé) |
| liste ciblée de la mission + ajouts D-10 (commande identique au pli G2 delta) | exit 0 — **222 tests, 222 pass, 0 fail, 0 skip** (221 + le test nouveau `rendered_body_raw_text_elements`) ; `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` vert |
| importeurs de `rpc-guard` (liste G2 de 20 fichiers) | exit 0 — 232 tests, 230 pass, 0 fail, 2 skip préexistants déclarés |
| `test/export-public.test.ts` (test 42) | exit 0 — 2/2 (14:23:50Z → 14:30:47Z) |
| g3-site sur artefact construit hors réseau (arbre du pli 3) | exit 0 ; 19/19 identiques sur 4 versions (§« Pli 3 ») |
| 6 portes statiques rejouées après l'écriture de ce journal | exit 0 ×6 (14:47:13Z → 14:47:50Z, `pli3\final\post-g1-*.log`) |

### Oracle du pli des corrections de la G2 de confirmation (test et texte ; scanner `fcbd28b0…` inchangé ; historique ; ceinture `pli4\ev.sh`)

Journaux sous `F:\tmp\codeql-alerts-1\pli4\final\`, script `pli4\run-oracle4.sh` (séquentiel, aucun mutant actif), 16:08:16Z → 16:09:49Z (sha au lancement : scanner `fcbd28b0…`, test `a3df31fe…`).

| Porte / suite | Résultat |
|---|---|
| `test/site-build-fleet.test.ts` seul, avec les drapeaux du script `test` de `package.json` | exit 0 — **8 tests, 8 pass**, 0 fail (`site-alone.tap`) |
| `npm run gate:vocab`, `typecheck`, `lint`, `lang:gate`, `export:check` | exit 0 ×5 (typecheck : 0 erreur) |
| `npm run lint:ratchet` | exit 0 — `69/69` (plafond inchangé) |
| liste ciblée de la mission + ajouts D-10 (commande identique aux plis précédents) | exit 0 — **222 tests, 222 pass, 0 fail, 0 skip** (`targeted.tap`) |
| build hors réseau, `renderedBody` face au build du gel 3 | 19/19 identiques, 0 connexion, g3-site exit 0 (§« G2 de confirmation pliée ») |
| 6 portes rejouées sur l'arbre final (G1 rempli) | exit 0 ×6 (16:10:59Z → 16:11:41Z, `pli4\final\final-*.log`) |

### Oracle du pli 5 (test et texte ; scanner `fcbd28b0…` inchangé ; fait foi ; ceinture `pli5\ev.sh`)

Journaux sous `F:\tmp\codeql-alerts-1\pli5\final\`. Script `pli5\run-oracle5.sh` : celui du pli des corrections, dont seuls la
ceinture et le dossier changent ; séquentiel, aucun mutant actif. 19:31:14Z → 19:32:17Z sur le test final ; sha au lancement : scanner
`fcbd28b0…`, test `58935e6e…`. Premier passage 19:21:03Z → 19:22:10Z sur `86ffc5a8…` (avant D-21), mêmes résultats,
journaux dans `final\first-run\`.

| Porte / suite | Résultat |
|---|---|
| `test/site-build-fleet.test.ts` seul, avec les drapeaux du script `test` de `package.json` | exit 0 — **10 tests, 10 pass**, 0 fail (8 + les gardes 1 et 2) |
| `npm run gate:vocab`, `typecheck`, `lint`, `lang:gate`, `export:check` | exit 0 ×5 (typecheck : 0 erreur) |
| `npm run lint:ratchet` | exit 0 — `69/69` (plafond inchangé) |
| liste ciblée (commande identique aux plis précédents) | exit 0 — **224 tests, 224 pass, 0 fail, 0 skip** (222 + les 2 gardes) |
| build hors réseau, `renderedBody` face au build du gel 3 bis | 19/19 identiques, 0 connexion, g3-site exit 0 ; garde 2 verte avec `.next` présent |
| 6 portes rejouées sur l'arbre final (G1 écrit) | exit 0 ×6 (19:25:02Z → 19:25:41Z, `pli5\final\final-*.log`) |

## G7 — error_origin de la famille M-1 et de L-3 (2026-09-24 20:07 UTC, orchestrateur `claude-fable-5-1`, critère du checkpoint-2 ter)
- Critère écrit : un défaut corrigeable dans la grammaire D3 est IMPLEMENTEUR (L-2 : corrigé par le pli 3) ; un défaut qui ne l'est pas sans changer de plan (I-10) est PLANIFICATEUR. Assignation : **L-3 (Att1) et les trois formes M-1 (R-a, R-c, ouvrante à texte brut dans un attribut) = PLANIFICATEUR** (conception D3, coupe maison, acceptée comme limite connue par la décision 205) ; L-2 = IMPLEMENTEUR ; Rh1acc (gel 2) = IMPLEMENTEUR ; C-1/C-2 du cp-2 ter (gardes trop larges) = IMPLEMENTEUR (pli 5) ; C-3 = PLANIFICATEUR (inventaire des portes brutes incomplet dans la mission de l'orchestrateur ; devenu vrai après `05c66aa`).
- G2 courte annoncée à 19:11Z non tenue sur `6443dcc..7fb53dc` : règle CP2b (a)-2 (scanner octet-identique `fcbd28b0…` sur les trois gels) ; les tests des plis 5 et 6 sont relus à 100 % par le validateur (cp-2 ter) et éprouvés par MG1..MG9. Consigné, pas tu.
