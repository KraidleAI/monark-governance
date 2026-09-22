# FICHE GO-1 — Course Bell : sonde de densité K=8 (decision 125, GO en deux temps) — PRE-ENREGISTREE

> **Statut : PRE-ENREGISTRE (worker Opus 4.8, R-20/R-21).** Ce document est une donnee brute pour l'orchestrateur : il fixe les
> preconditions verifiables, la commande EXACTE de la sonde, les criteres de lecture, l'ancre `probe_end` et les points d'arret,
> pour que la course soit **executable a la seconde ou GARDE-HELIUS-1b est fusionne**. **Il ne rend aucune decision** (les GO go-1/go-2
> sont des gates investisseur, hors portee du GO 119 [lu `docs/CHANTIERS.md:561,640`]). La sonde est un **appel Helius PAYANT** : elle
> est executee par l'**ORCHESTRATEUR** (R-20 : jamais le worker). Ce worker ne fait que pre-enregistrer le format.

**Modele resolu (R-1) : `claude-opus-4-8[1m]`** (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilise).
**Provenance** : worker DOCS `claude-opus-4-8[1m]`, **2026-09-22T05:33:11Z** (`date -u` mesure). Base de lecture : `F:\Monark`
`lot/etude-suite` HEAD **`23a27b4`** [mesure `git rev-parse`] ; **arbre fusionne Bell** `F:\tmp\bell-merge\tree` @ **`14784ee`**
(= `lot/etude-suite` `c10c13d` + 1b-i `d9abbe1` + 1b-ii `3982ca1` + 1b-iii `1c8e0ea`, oracle orchestrateur 830/830/0/0)
[lu `F:\tmp\garde1b\MISSION-G2-CP2-1b-i-ii-iii.md`]. **Toutes les citations `fichier:ligne` de code renvoient a l'arbre fusionne
`14784ee`** ; si le sha de fusion REEL (post-G7) differe, **re-confirmer les lignes** (idiome `[a re-ancrer]` du G0). Lecture seule
de `F:\Monark` et de l'arbre fusionne ; **ecritures UNIQUEMENT sous `F:\tmp\bell-go1\`** ; aucun commit, aucun reseau ; **A-7**
(jamais l'affichage d'une variable d'environnement — controle par PRESENCE/LONGUEUR seulement [lu `docs/CONSIGNE-STANDARD-G1.md:45`]) ;
aucune valeur de cle nulle part. Reviseur = orchestrateur (R-21).
>
> **PLI (passe de refutation)** : worker PLI `claude-opus-4-8[1m]`, **2026-09-22T06:22:13Z** (`date -u` mesure), effort max. Base
> RE-VERIFIEE au HEAD courant `F:\Monark` `lot/etude-suite` **`894d06b`** [mesure `git rev-parse`] : le HEAD a avance depuis
> `23a27b4`, mais **`docs/CHANTIERS.md` n'a derive qu'au hunk `@@ -702 +702 @@`** [mesure `git diff 23a27b4..894d06b`] ⇒ **toutes les
> citations `docs/CHANTIERS.md:<=642` de cette fiche sont stables au HEAD** ; **G0/ANCHORS.template/FAITS byte-identiques**
> `23a27b4`→`894d06b` [mesure `git diff --stat`]. Arbre fusionne `14784ee` inchange. **12 refutations pliees, tracees §8 (« Pli »)** ;
> snapshot pre-pli : `F:\tmp\bell-go1\FICHE-GO-1.pre-pli.md`.

---

## REPONSE DIRECTE A L'INVESTISSEUR — « peut-on le faire des maintenant ? y a-t-il des prerequis qui prennent des heures ? »

**Non, pas des maintenant — un seul prerequis prend des heures, le reste se prepare en parallele MAINTENANT.** Le seul gate long
est **P1 (GARDE-HELIUS-1b fusionne dans `lot/etude-suite`)** : a ce jour **seul le sous-lot paquet 1b-0 est fusionne**
(`6114ce9`, `6a639e8` [mesure `git log`]) ; les **consommateurs 1b-i / 1b-ii / 1b-iii ne sont PAS fusionnes** — ils vivent dans
l'arbre de PREVISION `14784ee` dont la revue **G2 ‖ checkpoint-2 est EN VOL** [lu `F:\tmp\garde1b\MISSION-G2-CP2-1b-i-ii-iii.md`,
06:13]. La suite obligatoire avant la sonde : G2‖cp-2 -> pli des corrections -> G2-delta -> **G7 + fusion `--no-ff`** dans
`lot/etude-suite`. **C'est cela, les heures.**

| Delai | Prerequis | Preparable des MAINTENANT, en parallele ? |
|---|---|---|
| **HEURES** (revue + pli + G7 + fusion) | **P1** GARDE-HELIUS-1b fusionne + oracle vert sur `lot/etude-suite` | Non — depend de la revue en vol |
| **MINUTES** | **P2** oracle vert rejoue sur l'arbre fusionne (830/830/0/0) ; **P9** G-4-bis (9 tests density/h6) | Oui, des que P1 atterrit |
| **MINUTES a HEURES** (acte investisseur, hors code) | **P3** debit de fond Helius NUL (2 lectures dashboard espacees) ; **P4** floor lu sur place | Oui, quand tu veux, juste AVANT la sonde |
| **MINUTES** (actes orchestrateur, hors code) | **P5** `HELIUS_LEDGER_DIR` parent pre-existant ; **P6** `HELIUS_CYCLE_ID` ; **P7** `--out` durable frais ; **P8** `--method-caps` ; **P10** `ANCHORS.md` depuis le template ; **P11** cle dediee (optionnel) | **Oui, TOUT maintenant** |
| **MINUTES** puis **HEURES en differe** (apres la sonde) | **P12** go OTS + `ots stamp` (secondes) ; puis `ots upgrade` (confirmation Bitcoin, ~heures, non bloquant pour go-2) | Install + essai a blanc **DEJA FAITS** [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:25-28`] |

En clair : **on peut preparer P5..P11 tout de suite** ; **P3/P4 se font a la minute juste avant la sonde** ; **P1 est le seul
mur d'heures** et il est deja engage (revue en vol). La sonde elle-meme coute **~400-600 credits** (attendu), **dur <= 1 500 cr**
(<= 0,03 % du budget) [mesure §3.3, lu `docs/G0-lot-t1a-ii-b3d-course.md:294-299`].

**Contrainte de CALENDRIER (pas un mur d'heures, mais un point d'arret a respecter, decision 125)** : le cycle Helius court
**jusqu'au 19/10** ; la course doit **demarrer avant ~15/10** (tirage ~45 h + marge 48 h [lu `docs/G0-lot-t1a-ii-b3d-b.md:238`]) et **ne JAMAIS chevaucher la bascule du
19/10** (sinon **ESCALADE**, routage C-4) [lu `docs/CHANTIERS.md:642`, `docs/G0-lot-t1a-ii-b3d-course.md:337-343`]. Un glissement
au-dela **re-ouvre l'arithmetique du floor** sur le cycle suivant (le floor se reinitialise). Detaille §5.2 (STOP) et §6 (go-2).

---

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de premiere main a `fichier:ligne` (rejouable) — code cite dans l'arbre fusionne `14784ee`, sauf mention `F:\Monark`.
- **[mesure]** = sortie d'une commande rejouee par ce worker (git/grep/ls), brute dans le corps.
- **[2nd]** = chiffre lu dans un document sans premiere main — jamais reutilise comme fait de course (p. ex. floor « 60 938 » du jour).
- **[a lire sur place]** = fait a etablir par l'investisseur/orchestrateur au navigateur (regle « lecture sur place » 2026-09-20) — jamais devine ici (floor, debit de fond, snapshots dashboard).
- **`<INSTANCE>`** = valeur que ce worker ne peut PAS fixer sans deviner : nommee, jamais une valeur devinee ; recapitulees §7.2.

---

## 1. Preconditions — une par une, avec la commande de verification OU l'acte investisseur

> Chaque ligne est un **gate rempli**, un **gate a declencheur nomme**, ou un **item forme** (jamais un « du » nu). L'ordre des actes
> juste avant la sonde est fixe en §5.0. Tous les oracles et verifications se lancent **cles payantes RETIREES** du process
> (`env -u HELIUS_API_KEY -u BELL_SOLANA_RPC -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u
> CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY …`) [lu `docs/CONSIGNE-STANDARD-G1.md:45`].
> **`BELL_SOLANA_RPC` (URL d'endpoint, PAS une cle) doit AUSSI etre retire** : c'est LUI qui resout l'operateur `helius`
> (`heliusBase = BELL_SOLANA_RPC.split(',')[0]` ; si defini ⇒ helius enregistre) [lu `packages/rpc-guard/src/transport.ts:93-95`] ;
> la cle n'ajoute qu'un query-param, donc **helius se resout KEYLESS sans la cle** [lu `:96-97`] et un dry-run « sans cle » mais
> endpoint present atteindrait `fetch` = le reseau [lu `:220-221`]. Endpoint retire ⇒ **fail-closed** `requested operator 'helius' is
> not resolved from env` [lu `packages/rpc-guard/src/guarded.ts:33` ; mesure `F:\tmp\bell-go1\dryrun-guard.mjs` : ctor=Error,
> elapsed_ms=1, AVANT tout transport]. **Sans effet sur l'oracle** : les tests injectent leur propre `env` (`env: { BELL_SOLANA_RPC:
> … }`), jamais `process.env` [mesure `grep BELL_SOLANA_RPC apps/bell/test/rebase-crosscheck.test.ts` = 4 injections locales
> l.355/525/601/1341 ; `grep process.env` = 0]. La sonde REELLE (§2), elle, tourne avec l'env portant **endpoint + cle** (le
> transport est le seul lecteur ; A-7 : jamais affichee).

### P1 — GARDE-HELIUS-1b FUSIONNE dans `lot/etude-suite` + oracle vert (condition architecte 1, G-4) [gate, HEURES]
- **Enonce** : les 4 sous-lots 1b-0/1b-i/1b-ii/1b-iii fusionnes dans `lot/etude-suite` ; a ce jour seul 1b-0 l'est [lu `docs/G7-lot-garde-helius-1b-0.md:1`, mesure `git log` : `6114ce9`/`6a639e8`]. Declencheur d'atterrissage : G7 de 1b (apres G2‖cp-2 en vol).
- **Verification (apres fusion, sur `lot/etude-suite`)** :
  ```
  git -C F:\Monark log --oneline -5           # attendu : un merge "GARDE-HELIUS-1b" (1b-i/ii/iii) en tete
  cd <worktree lot/etude-suite post-fusion> ; <mk-nm.ps1>   # node_modules du worktree (A-2)
  env -u HELIUS_API_KEY -u BELL_SOLANA_RPC -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY npm run ci ; echo exit=$?
  ```
  Attendu : **exit 0, 830/830/0/0** (0 skip : `fetch_only_inside_client` leve) [lu `F:\tmp\garde1b\MISSION-G2-CP2-1b-i-ii-iii.md`, verification 1]. Source oracle vert de l'arbre fusionne : orchestrateur 830/830/0/0 [2nd, a rejouer sur la branche fusionnee].
- **Source** : G-4 [lu `docs/G0-lot-t1a-ii-b3d-course.md:62`] ; condition architecte 1 [lu `docs/G0-lot-t1a-ii-b3d-course.md:330`].

### P2 — Worktree epingle au sha de fusion REEL + `node_modules` (A-2) [gate, MINUTES apres P1]
- **Enonce** : la sonde tourne depuis un worktree **epingle au sha de fusion** de 1b, `node_modules` reconstruit par `mk-nm.ps1` (`@monark/*` -> le worktree), `require.resolve('@monark/rpc-guard')` verifie [lu `docs/CONSIGNE-STANDARD-G1.md:7`]. Aucun autre consommateur Helius cote orchestrateur pendant la sonde (worktree epingle) [lu `docs/G0-lot-t1a-ii-b3d-course.md:45`].
- **Verification** : `node --version` (attendu >= 24 [lu `F:\Monark`/`package.json:11-12` `"node": ">=24"`], strip .ts natif) ; `node -e "console.log(require.resolve('@monark/rpc-guard'))"` -> chemin du worktree.
- **Re-ancrage** : si le sha de fusion reel != `14784ee`, **re-confirmer** les `fichier:ligne` de §2/§3/§4 (1b-ii deplace des lignes).

### P3 — Debit de fond Helius NUL juste avant la sonde (condition architecte 2, G-6(b)) [acte INVESTISSEUR, sur place]
- **Enonce** : **deux lectures du tableau de bord Helius, espacees et IDENTIQUES**, lues SUR PLACE par l'investisseur (Chrome, page Usage seule, aucune page a cle ouverte, aucun telechargement), **aucun process MONARK actif** ; consommation gTfA depuis le dernier point attendue NULLE. Hors bande / != 0 ⇒ **incident, PAS de sonde** [lu `docs/G0-lot-t1a-ii-b3d-course.md:331`, `docs/CHANTIERS.md:346` (1), `:403`].
- **Acte** : lecture 1 a t0 ; lecture 2 a t0 + `<DELTA-LECTURES>` (espacement, instance — le G0 ne le fixe pas) ; les deux **identiques** (total du cycle ET ligne gTfA inchangees) ⇒ debit de fond nul. `error_origin` du besoin : lecon HELIUS-1 (~49 675 cr non attribues du 20/09) [lu `docs/CHANTIERS.md:388,403`].
- **Note** : le worktree epingle ne couvre PAS un consommateur VPS/tiers (« sonde VPS Bell », debit de fond non verifie ici) — d'ou cette mesure sur place, non contournable [lu `docs/G0-lot-t1a-ii-b3d-course.md:158-163` ; « sonde VPS Bell » = [2nd via G0:160] (le `docs/CHANTIERS.md:560` cite par le G0 est au HEAD `7801083` ; a `14784ee` `:560` porte un autre E-5, redeploiement VPS site -1c [mesure `sed -n 560p`])].

### P4 — Floor Helius du cycle lu sur place (decision 112/114) [acte INVESTISSEUR, sur place]
- **Enonce** : le floor du cycle Helius = crediters deja consommes du cycle, **lu sur place** au dashboard AVANT la course (jamais reutilise du jour) ⇒ instance **`<FLOOR-HELIUS>`**. Le « 60 938 » connu est **du jour, [2nd]**, a RE-LIRE [lu `docs/CHANTIERS.md:478` (decision 112), `:388`, `docs/G0-lot-t1a-ii-b3d-course.md:125-126`].
- **Contrainte de garde (fail-closed)** : le client garde EXIGE un floor **fini** par operateur paye et **floor <= cap** ; sinon `BudgetExceededError` a la construction [lu `packages/rpc-guard/src/client.ts:72-74`]. Le cap helius = **`HELIUS_CYCLE_CAP_CREDITS = 8_000_000`** [lu `packages/rpc-guard/src/transport.ts:22,98`] (decision 112, 80 % du plan 10 M [lu `docs/CHANTIERS.md:478`]). Le prior de cycle gele = `max(floor, Sigma attempted)` [lu `packages/rpc-guard/src/client.ts:85`, `ledger.ts:128`] ; le cap est enforce a chaque appel : `priorFrozen + runByOp + cost > cycleCap ⇒ refuse "cycle_cap"` [lu `packages/rpc-guard/src/client.ts:118`].
- **Verification (apres pose)** : `<FLOOR-HELIUS>` est un nombre fini, `0 <= <FLOOR-HELIUS> <= 8000000`.

### P5 — `HELIUS_LEDGER_DIR` parent pre-existant, hors depot (decision 114 ; E-2) [acte ORCHESTRATEUR, MINUTES]
- **Enonce** : le **parent** du ledger de cycle doit **pre-exister** ; le code ne le cree JAMAIS (mutant M3 `mkdirp(ledgerDir)` = rouge [lu `F:\tmp\garde1b\1b-i\G1-lot-garde-helius-1b-i.md:25,65`]) ; « jamais reset-on-missing » (lecon HELIUS-1) [lu `docs/CONSIGNE-STANDARD-G1.md:35` E-2, `docs/CHANTIERS.md:488`]. Racine posee = **`F:\monark-ledger\`** (hors depot, sauvegardee avec MONARK SUITE) [lu `docs/CHANTIERS.md:480`]. Le sous-dossier `<HELIUS_CYCLE_ID>\` est cree par `ensureCycleDir` [lu `packages/rpc-guard/src/cli.ts:29`] ; installer le PARENT AVANT tout dry-run.
- **Instance** : **`<HELIUS_LEDGER_DIR>`** = `F:\monark-ledger` (defaut pose) — a confirmer.
- **Verification** : `test -d "<HELIUS_LEDGER_DIR>"` (parent present) ; le sous-dossier `<HELIUS_LEDGER_DIR>\<HELIUS_CYCLE_ID>\` peut etre absent (cree au run) — mais l'installer AVANT le dry-run est plus sur.

### P6 — `HELIUS_CYCLE_ID` (decision 114) [acte ORCHESTRATEUR, MINUTES]
- **Enonce** : **UN** identifiant de cycle pour tous les operateurs demandes, keyless inclus, requis sans defaut [lu `apps/bell/src/collect.ts:640`, `docs/CHANTIERS.md:488`]. Instance **`<HELIUS_CYCLE_ID>`**.
- **Verification** : chaine non vide ; identique dans la commande sonde, dans les snapshots reconcile (champ `cycle`) et dans `unlock`.

### P7 — `--out` durable, FRAIS, hors depot (G0 §6.4 ; condition go 346(2)) [acte ORCHESTRATEUR, MINUTES]
- **Enonce** : `--out` sur un chemin **durable** (partage go-1 <-> go-2, jamais un temp efface entre les deux GO) [lu `docs/G0-lot-t1a-ii-b3d-course.md:301-306`], et **ABSENT/frais au go-1** (« `F:/tmp/bell-b3d-run` absent » = condition du go) [lu `docs/CHANTIERS.md:346` (2)]. Doit etre **hors du depot** (le CLI throw sinon, CA-11) [lu `apps/bell/src/collect.ts:493`].
- **Defense de code (arbre fusionne)** : la sonde LIT le prior avant d'ecrire `require_full_pages` — si `budget.json` existe et n'est pas prouve `require_full_pages:true`, elle throw fail-closed (C-G2-3 porte par 1b-ii) [lu `apps/bell/src/rebase-crosscheck.ts:727,735`]. Un `--out` frais evite tout heritage loose. (C-G2-3, ex-ouvert au HEAD pre-1b, est **CLOS sur l'arbre fusionne** ; verifie par `bell_density_strict_probe_over_loose_budget_is_fail_closed` [lu `apps/bell/test/rebase-crosscheck.test.ts`].)
- **Instance** : **`<OUT-BELL-B3D-RUN>`** = chemin durable hors depot, basename recommande `bell-b3d-run` (defaut CLI `F:/tmp/bell-out` [lu `apps/bell/src/collect.ts:468`]).
- **Verification** : `test ! -e "<OUT-BELL-B3D-RUN>"` (frais) ; le chemin resolu n'est pas sous la racine du depot.

### P8 — `--method-caps` couvrant BELL_SOLANA_METHODS (decision 114 ; condition architecte 1) [acte ORCHESTRATEUR, MINUTES]
- **Enonce** : `--method-caps` requis et **non vide**, `k=v` par methode ; doit **couvrir** les 4 methodes `BELL_SOLANA_METHODS` sinon fail-closed a la construction [lu `apps/bell/src/collect.ts:642,644`, `packages/rpc-guard/src/bell-methods.ts:9`]. C'est un cap **INTERNE du garde** (par methode) ; le **`--max-credits` reste autoritaire** vs le `--method-caps` (les deux fail-closed) — c'est la clause **G-4-bis (2)** a re-verifier sur l'arbre fusionne [lu `docs/G0-lot-t1a-ii-b3d-course.md:372-374`]. Regler les caps assez haut pour ne PAS mordre avant `--max-credits 1500` (36 gTfA << cap).
- **Instance** : **`<METHOD-CAPS>`** — defaut documente [lu `apps/bell/src/collect.ts:642`] : `getSignaturesForAddress=200000,getTransaction=5000000,getAccountInfo=100000,getTransactionsForAddress=650000`.

### P9 — G-4-bis : 9 tests `bell_density_*`/`bell_h6_*` verts sur l'arbre fusionne (condition architecte 1) [gate, MINUTES]
- **Enonce** : re-verifier, sur l'arbre FUSIONNE post-1b-ii, que les tests density/H6 restent VERTS ; que `--max-credits` reste autoritaire vs `--method-caps` ; que l'etalonnage sonde (36 gTfA x 10 = 360 cr) est inchange sous le client garde [lu `docs/G0-lot-t1a-ii-b3d-course.md:330,372-374`].
- **Verification** (tous dans `apps/bell/test/rebase-crosscheck.test.ts` [mesure grep]) :
  ```
  env -u HELIUS_API_KEY -u BELL_SOLANA_RPC -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
    node --test --test-name-pattern "bell_density_|bell_h6_" "apps/bell/test/rebase-crosscheck.test.ts" ; echo exit=$?
  ```
  **9 tests distincts** [mesure grep unbounded, arbre fusionne] — le G0 §8.1 dit « 8 » [lu `docs/G0-lot-t1a-ii-b3d-course.md:330`], **recompter au G-4-bis** : `bell_density_by_mint_survives_budget_exhaustion`, `bell_density_feeds_global_calls_by_method`, `bell_density_projects_N_with_interval`, `bell_density_report_points_feed_projection`, `bell_density_requires_max_credits`, `bell_density_strict_probe_over_loose_budget_is_fail_closed`, `bell_density_writes_budget_never_ledger`, `bell_h6_projection_pure_function`, `bell_h6_projection_rejects_max_times_span`. Attendu : 0 fail.

### P10 — `docs/course-bell/ANCHORS.md` cree depuis le template (decision 124) [acte ORCHESTRATEUR, MINUTES]
- **Enonce** : copier `docs/course-bell/ANCHORS.template.md` -> `docs/course-bell/ANCHORS.md`, committe + pousse par l'orchestrateur (R-20) [lu `docs/course-bell/ANCHORS.template.md:3-4`]. Le format d'UNE ancre est **gele au commit du pli** ; la ligne `probe_end` y est ajoutee a §4.
- **Verification** : `test -f docs/course-bell/ANCHORS.md` ; en-tete et colonnes = celles du template [lu `docs/course-bell/ANCHORS.template.md:33-46`].

### P11 — `BELL_SOLANA_RPC` (endpoint = RESOLUTION de helius) + cle Helius dediee (condition architecte 4) [acte INVESTISSEUR]
- **Enonce** : **la RESOLUTION de l'operateur `helius` depend de `BELL_SOLANA_RPC` (URL d'endpoint), PAS de la cle** [lu `packages/rpc-guard/src/transport.ts:93-95`] : `heliusBase = BELL_SOLANA_RPC.split(',')[0]` ; si defini ⇒ helius est enregistre. La cle **`HELIUS_API_KEY` n'ajoute qu'un query-param** (`base?api-key=<cle>`) ⇒ **helius resout KEYLESS sans elle** [lu `:96-97`]. Donc **`BELL_SOLANA_RPC` present est une PRECONDITION de la sonde reelle (§2)** (item investisseur nomme, §7.2) ; une cle **dediee** (revoquee ensuite, si Helius le permet) reste condition architecte 4, **non bloquante** [lu `docs/G0-lot-t1a-ii-b3d-course.md:333`]. **Aucune cle lue par un worker (A-7)** ; **aucune valeur (cle NI endpoint) affichee nulle part.**
- **Verification (A-7, PRESENCE/LONGUEUR seulement, jamais `echo` de la valeur)** :
  ```
  [ -n "$BELL_SOLANA_RPC" ] && echo "present" || echo "ABSENT"     # endpoint helius (transport.ts:93-95) — presence, jamais la valeur
  [ -n "$HELIUS_API_KEY" ]  && echo "present" || echo "ABSENT"     # cle (query-param, optionnelle)     — presence, jamais la valeur
  echo "len=${#HELIUS_API_KEY}"                                    # longueur, jamais la valeur
  ```
  **Consequence directe pour le « zero reseau » des dry-runs fail-closed (§1, P1, P9)** : la garantie ne tient QUE si **`BELL_SOLANA_RPC` est AUSSI absent** — sinon helius resout keyless et atteint `fetch` [lu `packages/rpc-guard/src/transport.ts:220-221`]. `BELL_SOLANA_RPC` (endpoint) + cle Helius sont **ITEM investisseur nomme, a poser AVANT la course** [lu `docs/G0-lot-t1a-ii-b3d-course.md:65`]. Deux operateurs distincts requis (helius paye + solana-foundation keyless) [lu `docs/CHANTIERS.md:346` (3)].

### P12 — Prealables OpenTimestamps (decision 124, prealable) [install FAIT ; go du 1er stamp = acte INVESTISSEUR]
- **Enonce** : (1) conditions d'usage OTS **lues sur place** (FAIT, 2026-09-22 02:39 UTC : service gratuit, sans cle, l'ancre ne revele que le hash, aucune ToS liee) [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:5-13`] ; **installation + essai a blanc FAITS** (client `F:\MONARK SUITE\ots\venv\Scripts\ots`, versions epinglees, 4 calendriers, essai 1,70 s) [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:25-28`] ; (2) **go investisseur EXPLICITE pour le PREMIER stamp REEL a `probe_end`** — la demande de go 124 portait sur (a) l'install ET (b) « soumettre le premier hash … a la frontiere `probe_end` » ; le « fais le toi meme » du 03:05 UTC a couvert l'install + un essai a blanc explicitement « PAS une piece de course » [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:22-28`]. **Donc le go du premier stamp de course reste un acte investisseur du go-1** (non presume). Un refus d'outil / certificat / CAPTCHA n'est **jamais contourne** (consigner « non contourne » + procurement) [lu `docs/course-bell/ANCHORS.template.md:9-10`].

---

## 2. Commande EXACTE de la sonde K=8 (`--rebase-density`) — chaque argument nomme + source (arbre fusionne)

> Executee par l'**ORCHESTRATEUR** (appel PAYANT, R-20), depuis la racine du worktree epingle (P2), avec l'env portant la cle Helius
> (le transport est le SEUL lecteur de cle ; A-7 : jamais affichee). Runner : **`node`** (Node >= 24, strip .ts natif) [lu `package.json:11-12`].
> Point d'entree : `apps/bell/src/collect.ts` `main()` [lu `apps/bell/src/collect.ts:780-782,791-793`]. `--rebase-density` route vers
> `runDensityProbeCli` [lu `apps/bell/src/collect.ts:702-704`].

```
node apps/bell/src/collect.ts \
  --rebase-density \
  --pools TSLAx,AAPLx,NVDAx,SPYx \
  --operators helius \
  --ledger-dir <HELIUS_LEDGER_DIR> \
  --cycle <HELIUS_CYCLE_ID> \
  --floor helius=<FLOOR-HELIUS> \
  --method-caps <METHOD-CAPS> \
  --max-credits 1500 \
  --max-calls <MAX-CALLS> \
  --out <OUT-BELL-B3D-RUN>
```

> **AVERTISSEMENT (pli, refutation principale)** : `--pools TSLAx,AAPLx,NVDAx,SPYx` est **indispensable**. Executee SANS lui, la
> « commande EXACTE » ci-dessus produit **SILENCIEUSEMENT** une sonde a **1 mint** (`wanted=['TSLAx']` par defaut [lu `collect.ts:429`
> ; mesure `dryrun-parse.mjs`]) — soit un `sonde-report.json` a 1 mint / ~9 gTfA au lieu des **4 mints / 36 gTfA** annonces (§4.1,
> §3.3, enveloppe de cout ci-dessous). Le point (a) (§2.1) filtre AUSSI par `wanted` [lu `rebase-crosscheck.ts:658`] ⇒ meme
> exigence. L'ordre des symboles est indifferent (le traitement suit l'ordre de `XSTOCKS` via `.filter`).

| Argument | Valeur / instance | Obligatoire ? — source (`14784ee`) |
|---|---|---|
| `--rebase-density` | (drapeau) | Mode sonde ; route vers `runDensityProbeCli` [lu `apps/bell/src/collect.ts:452,702-704`] |
| `--pools` | **`TSLAx,AAPLx,NVDAx,SPYx`** | **REQUIS pour la sonde 4-mints.** Defaut **`TSLAx`** (1 SEUL mint) [lu `apps/bell/src/collect.ts:429` `argOf(argv,'--pools') ?? 'TSLAx'`] ; la sonde filtre `XSTOCKS.filter(t=>wanted.includes(t.symbol))` [lu `apps/bell/src/rebase-crosscheck.ts:746`]. Sans lui, `wanted=['TSLAx']` ⇒ **1 mint / 9 gTfA** au lieu de 4 mints / 36 gTfA [mesure `dryrun-parse.mjs` : sans → `['TSLAx']`, avec → `['TSLAx','AAPLx','NVDAx','SPYx']`]. Ordre indifferent. |
| `--operators` | **`helius`** | REQUIS non vide [lu `:479,641`]. **`helius` suffit** : la sonde ne mesure QUE `getTransactionsForAddress` (gTfA), Helius-exclusif [lu `apps/bell/src/rebase-crosscheck.ts:726,743`] ; moindre privilege. (`solana-foundation` n'est requis que par le point (a), §2.1.) |
| `--ledger-dir` | **`<HELIUS_LEDGER_DIR>`** | REQUIS (racine durable du ledger de cycle par operateur, doit pre-exister) [lu `:478,639`] |
| `--cycle` | **`<HELIUS_CYCLE_ID>`** | REQUIS (un id de cycle pour tout operateur) [lu `:478,640`] |
| `--floor` | **`helius=<FLOOR-HELIUS>`** | Format **`k=v`** (`parseKvNums`) [lu `:480`] ; floor de cycle fini requis par le garde [lu `packages/rpc-guard/src/client.ts:72-74`]. **Attention : format DIFFERENT de reconcile (§5.1, scalaire).** |
| `--method-caps` | **`<METHOD-CAPS>`** | REQUIS non vide, couvre `BELL_SOLANA_METHODS` [lu `:480,642,644`] ; defaut documente [lu `:642`] |
| `--max-credits` | **`1500`** | REQUIS pour `--rebase-density` [lu `:453-454`] ; « 1500 for the probe » [lu `:454`] ; c'est le plafond-reserve go-1 (<= 1 500 cr) [lu `docs/G0-lot-t1a-ii-b3d-course.md:275`]. Autoritaire vs `--method-caps` (G-4-bis). |
| `--max-calls` | **`<MAX-CALLS>`** | REQUIS `> 0` (cap d'ESSAIS par run) [lu `:441-443`, `:605`]. Recommande **150** (= 1500/10 : `--max-credits` mord d'abord ; nominal 36 gTfA) — instance, jamais devine. |
| `--out` | **`<OUT-BELL-B3D-RUN>`** | Defaut `F:/tmp/bell-out` [lu `:468`] ; DOIT etre hors depot (CA-11) [lu `:493`] ; durable + frais (P7) |

**Arguments deliberement ABSENTS** (et pourquoi) :
- **`--max-pages`** : NON applicable a `--rebase-density` — la garde `--max-pages` est keyed sur `--rebase-crosscheck` **seul** ; la sonde tire exactement 1 page par point d'echantillon [lu `apps/bell/src/collect.ts:449-451,461`].
- **`--max-ru`** : non requis (chainstack absent de `--operators` ; requis seulement si `chainstack` present) [lu `:646`].
- **`--series-dir`** : OMIS ⇒ defaut = **les series committees** `apps/bell/test/fixtures/series/rebase` [lu `:472,703`] (rebase-{TSLAx,AAPLx,NVDAx,SPYx}.json + PROVENANCE, portant `oracle_slot`, epinglees `PINNED_BELL_SHA`) [mesure `ls` ; lu `F:\tmp\garde1b\1b-ii\G1-lot-garde-helius-1b-ii.md:79`]. **A confirmer** par l'orchestrateur que ces fixtures SONT les series fondatrices committees (sinon passer `--series-dir <SERIES-DIR>`).
- **`--allow-short-pages`** : JAMAIS (la sonde est stricte, `require_full_pages` persiste ; C-G2-3) [lu `apps/bell/src/rebase-crosscheck.ts:735,741`].

**Enveloppe de cout attendue** : nominal **360 cr** (1 + `DENSITY_POINTS`=9 gTfA/mint x 4 mints = 36 gTfA x 10 cr) [lu `apps/bell/src/rebase-crosscheck.ts:447-449` `DENSITY_POINTS = 8`] ; go-1 total attendu **~400-600 cr** (avec (a)/(b)), **dur <= 1 500** [lu `docs/G0-lot-t1a-ii-b3d-course.md:294-299`].

### 2.1 Points (a) et (b) du go-1 (derives, meme `--out`, budget partage) — cadres, args a confirmer
Le go-1 inclut, EN PLUS de la sonde, les points (a)/(b) du PLI (verifier `slot.gte`/`slot.lte` `asc` et la reprise inter-process **sur l'API REELLE**) [lu `docs/G0-lot-t1a-ii-b3d-course.md:262-266`, `docs/CHANTIERS.md:640`].
- **Point (a)** — 1 page/mint de disponibilite (= 4 gTfA = ~40 cr [lu `docs/G0-lot-t1a-ii-b3d-course.md:296`]), **derive** : `--rebase-crosscheck --pools TSLAx,AAPLx,NVDAx,SPYx --max-pages 1` sur le meme `--out` (le crosscheck filtre AUSSI par `wanted` : `runRebaseCrosscheckCli` ⇒ `XSTOCKS.filter(t=>wanted.includes(t.symbol))` [lu `apps/bell/src/rebase-crosscheck.ts:658`, `apps/bell/src/collect.ts:711`] — sans `--pools`, (a) ne couvre que TSLAx, PAS les 4 gTfA annonces). Ici `--max-pages` est REQUIS et vaut **1** [lu `apps/bell/src/collect.ts:461-462`], et `--operators` doit inclure **`solana-foundation`** (les corps `getTransaction` sont tires sur l'operateur keyless `otherOp`) [lu `apps/bell/src/rebase-crosscheck.ts:302`]. Ce point ECRIT `ledger-<MINT>.jsonl` page-1 [lu `apps/bell/src/rebase-crosscheck.ts:662,681`] (capturee dans le manifeste `probe_end`, §4). **Un `crosscheck-<MINT>-attempt.json` / `not_at_genesis` a 1 page est ATTENDU (borne a 1 page), PAS un STOP decision 67** [lu `apps/bell/src/collect.ts:457-458`, `apps/bell/src/rebase-crosscheck.ts:700`].
  ```
  node apps/bell/src/collect.ts --rebase-crosscheck --pools TSLAx,AAPLx,NVDAx,SPYx --max-pages 1 --operators helius,solana-foundation \
    --ledger-dir <HELIUS_LEDGER_DIR> --cycle <HELIUS_CYCLE_ID> --floor helius=<FLOOR-HELIUS> \
    --method-caps <METHOD-CAPS> --max-credits 1500 --max-calls <MAX-CALLS> --out <OUT-BELL-B3D-RUN>
  ```
- **Point (b)** — reprise inter-process sans perte : re-lancer la meme commande (a) apres interruption, verifier reprise depuis le ledger sans double-comptage (`resumeFromLedger`, `verifyLedgerChain` re-derive la chaine a CHAQUE reprise, fail-closed sur chaine cassee) [lu `apps/bell/src/rebase-crosscheck.ts:574-583`]. Mecanique d'interruption = acte orchestrateur ; instance **`<PROC-B-INTERRUPT>`** (le G0 ne la chiffre pas).

---

## 3. Ce que la sonde ecrit + criteres de lecture

### 3.1 Artefacts ecrits (tous a `resolve(<OUT-BELL-B3D-RUN>, …)`)
- **`sonde-report.json`** [lu `apps/bell/src/rebase-crosscheck.ts:784`] : par mint, un objet `{ genesis_slot, oracle_slot, points, n_projected, n_min, n_max, duration_ms }` [lu `:774`] ; sur echec : `{ error: "no_committed_series" | "no_measured_genesis" | "degenerate_span" }` [lu `:749,760,764`]. C'est la synthese des points (a)-(g).
- **`budget.json`** (partage, cumulatif) [lu `:740-741`] : `calls_used`, `credits_worst_case`, `calls_by_method.global`, `retries_by_method`, **`pages:0`**, **`require_full_pages:true`** persiste (pour qu'un tirage strict ulterieur sur le meme `--out` ne soit pas refuse) [lu `:729-741`]. La sonde **n'ecrit JAMAIS de ledger** (`bell_density_writes_budget_never_ledger`).
- **`ledger-<MINT>.jsonl` page-1** : ecrite par le **point (a)** seulement [lu `apps/bell/src/rebase-crosscheck.ts:662,681`] (pas par `--rebase-density`).

### 3.2 Projection par mint (HORS PROCESS, cout 0)
`projectPagesAtFraction` integre le modele de densite lu depuis `sonde-report.json` (methode trapezoidale, formule de grille rejetee) [lu `apps/bell/src/rebase-crosscheck.ts:487,497` ; `trapezoidIntegral` renvoie `{projected, min, max}` `:467`]. A appliquer a `f = 0,05` **et** (decision 125, cout 0, lecture ledger) `f = 0,25` et `f = 0,5` [lu `docs/G0-lot-t1a-ii-b3d-course.md:315,384-385`]. Pour chaque mint : **pages projetees** = `n_projected / GTFA_PAGE_LIMIT` (`GTFA_PAGE_LIMIT = 1000` [lu `apps/bell/src/rebase-crosscheck.ts:64,497`]) ; **credits projetes** = pages x 10 (gTfA 10 cr/page).

### 3.3 Criteres de lecture (arme go-2)
1. **Comparaison par mint aux sous-plafonds ENSHRINED (Amendement 3(3)) — BASE FAIL-CLOSED du go-2** : pour chaque mint, la **borne haute** de l'intervalle (`n_max`) projetee en credits vs son **sous-plafond ENSHRINED** = le `--max-credits` fail-closed [lu `docs/G0-lot-t1a-ii-b3d-course.md:101,112,316-317`] : **TSLAx 254 670 · AAPLx 513 000 · NVDAx 1 670 000 · SPYx 2 957 000 cr** (Sigma **5 394 670**, roulant descendant). Borne haute d'un mint > son sous-plafond enshrined ⇒ **ESCALADE avant le mint** (go-2).
   - **Estimation RECOMPUTEE de premiere main (a NE PAS confondre avec l'enshrined ; ex-« Bases enshrined recomputees » corrige au pli)** [lu `docs/G0-lot-t1a-ii-b3d-course.md:95-98`] : TSLAx 25 421 550 tx / **254 220 cr** ; AAPLx 51 348 555 / **513 490** ; NVDAx 166 973 130 / **1 669 740** ; **SPYx 295 661 880 tx / 295 662 pages / 2 956 620 cr** ; Sigma corps **5 394 070**. **Delta enshrined − recompute = 600 cr** (arrondi) [lu `:101-102`].
   - **Piege AAPLx (materiel)** : le sous-plafond enshrined **513 000** est **490 cr SOUS** son estimation recomputee **513 490** — une projection dans **(513 000 ; 513 490]** passerait un controle base sur le recompute mais **VIOLERAIT** le `--max-credits` enforced ; seul le roulant descendant l'absorbe (~980 cr de marge cumulee) [lu `:104-106`]. ⇒ **comparer au sous-plafond ENSHRINED, jamais au recompute.**
   - **Arithmetique reconciliee** : plafond autorise **5 396 170** = **1 500** (sonde) + **5 394 670** (enshrined) [lu `:112`] ≠ Sigma recompute **5 394 070** ; l'ecart **2 100** = 600 (arrondi) + 1 500 (sonde) [mesure].
2. **Ratio `N_exact / N_projete` + fractions cumulatives roulant-descendant** : au go-1 il n'existe PAS de `N_exact` (aucun tirage) ; ce ratio est l'**etalonnage HORS ECHANTILLON de TSLAx** applique au go-2 a chaque frontiere de mint [lu `docs/G0-lot-t1a-ii-b3d-course.md:318-321`]. **Fractions cumulatives** (sur Sigma corps 5 394 070) : **TSLAx 4,71 % (cumul 4,71 %) · +AAPLx 9,52 % (cumul 14,23 %) · +NVDAx 30,96 % (cumul 45,19 %) · +SPYx 54,81 % (cumul 100 %)** [lu `:95-98,120`]. **Point d'arret ~14 %** (decision 125(3), condition architecte 3 [lu `docs/CHANTIERS.md:641`]) = la **frontiere TSLAx+AAPLx (14,23 %)** — `G0:119-121` corrige le verbatim « ~14 % (TSLAx) » de CHANTIERS:641 : c'est le **dernier point d'arret AVANT** le couteux NVDAx (31 %) puis SPYx (55 %) ⇒ escalade avant NVDAx/SPYx si le ratio sort de la bande. Au go-1, le critere operant est la **projection + intervalle** ci-dessous. La **bande numerique `b`** (`|N_exact/N_projete - 1| <= b`) est **figee au go-2** (decision investisseur) — instance **`<BANDE-b>`** [lu `:322-325,411`].
3. **Bande +/- 20 % sur SPYx** (decision 125) : « sonde LARGE » = **> +/- 20 % sur SPYx** ⇒ consentement large go-2 « jusqu'a H6 6,5 M » ; sinon **retour investisseur** [lu `docs/CHANTIERS.md:640`, `docs/G0-lot-t1a-ii-b3d-course.md:282-283`]. **Deux lectures possibles, a NE PAS confondre — la fiche imprime les DEUX ; la definition operante est l'instance `<DEF-LARGE>` (lecture investisseur au go-1)** :
   - **(i) ecart du point** : `| n_projected_SPYx / 295 661 880 - 1 | > 0,20` (deviation vs l'**estimation RECOMPUTEE de premiere main** ; 295 661 880 tx = la ligne RECOMPUTEE `G0:98`, PAS le sous-plafond enshrined SPYx 2 957 000 cr [lu `docs/G0-lot-t1a-ii-b3d-course.md:98,101`]).
   - **(ii) largeur de l'intervalle** : demi-largeur `(n_max_SPYx - n_min_SPYx) / (2 x n_projected_SPYx) > 0,20` (l'advisor-defi note : min/max des noeuds n'est PAS un intervalle de confiance ; K=32 le resserrerait, item conditionnel §7.1) [lu `docs/G0-lot-t1a-ii-b3d-course.md:324-325`].
   Les deux se calculent a **cout 0** depuis `sonde-report.json` (`n_projected`, `n_min`, `n_max`).
4. **Garde H6 dure** : toute projection en credits **> 6 500 000** (seuil de STOP de projection, §2 gele) ⇒ **STOP + ESCALADE** [lu `docs/G0-lot-t1a-ii-b3d-course.md:113,116-117,317,386`]. **Ne PAS conflater DEUX nombres** [lu `G0:108-121`] : **6 500 000** = seuil de STOP de projection (§2 gele) ; **6 497 500** = `--max-credits` **PAR COMMANDE** (valeur d'argument, PAS le seuil ; Amendement 1). Echelle : 5 396 170 sous-plafonds < **6 497 500** (`--max-credits`/cmd) / **6 500 000** (STOP H6) < 8 000 000 cycle. **Tension de corpus signalee (item §7.1)** : `docs/CHANTIERS.md:639` etiquette « 6 497 500 (STOP H6) », alors que `G0:81-83,116` porte le **[sic]** (le §2 gele STOPpe sur projection > 6 500 000 ; 6 497 500 est le `--max-credits`/cmd) — les deux nombres reproduits, **aucun tranche**.
5. **Point (g)** : `Sigma calls_by_method.global == calls_used` ; violation ⇒ STOP [lu `docs/G0-lot-t1a-ii-b3d-course.md:383`, `docs/CHANTIERS.md:346` (5)].

---

## 4. Ancre `probe_end` (decision 124 = option B) — manifeste, `ots stamp`, ligne ANCHORS.md, commit + push

> **Acte ORCHESTRATEUR** (R-20), a la frontiere `probe_end`, **pendant** la course (non rattrapable) [lu `docs/G0-lot-t1a-ii-b3d-course.md:227`, `docs/CHANTIERS.md:633` (« Non rattrapable »)]. Sous **P12** (go OTS du premier stamp).

### 4.1 Manifeste de tete deterministe — champs EXACTS
Objet horodate par OTS = un **manifeste** deterministe (pas un `entry_sha256` nu : la sonde n'ecrit aucun ledger) [lu `docs/G0-lot-t1a-ii-b3d-course.md:192-196`].
- **Nom** : `probe_end-manifest.txt`, place dans **`docs/course-bell/`** (a cote de `ANCHORS.md`) [lu `docs/course-bell/ANCHORS.template.md:37` `ots_ref = probe_end-manifest.txt.ots`].
- **Contenu** : une ligne `"<relpath> <sha256hex>"` par artefact pertinent, **`<relpath>` relatif a la racine de l'etat `--out`** [lu `docs/course-bell/ANCHORS.template.md:21`], **trie par `<relpath>` en ordre d'octets**, **fins de ligne LF**, **aucun espace de fin**, **un LF final**, **sha256 en minuscules 64-hex** [lu `docs/G0-lot-t1a-ii-b3d-course.md:200-201`, `docs/course-bell/ANCHORS.template.md:18-21`].
- **Artefacts `probe_end`** : `budget.json`, `sonde-report.json`, et chaque `ledger-<MINT>.jsonl` page-1 ecrite par le point (a). **Tous a la racine `--out`** (`resolve(out, …)`) [lu `apps/bell/src/rebase-crosscheck.ts:740,784,662/681`] ⇒ relpaths **`budget.json`**, **`ledger-AAPLx.jsonl`**, **`ledger-NVDAx.jsonl`**, **`ledger-SPYx.jsonl`**, **`ledger-TSLAx.jsonl`**, **`sonde-report.json`** (ordre d'octets).
- **INCOHERENCE DE FORMAT A GELER AU PLI (R-21, item §7.1, AVANT P10) — DEUX ecarts, dont l'un dans G0 §5.1 LUI-MEME** (la pre-inscription que nomme la mission, pas seulement le template) :
  - **(a) prefixe** : la REGLE dit « `<relpath>` relatif a la racine de l'etat `--out` » [lu `docs/course-bell/ANCHORS.template.md:21`, `docs/G0-lot-t1a-ii-b3d-course.md:200`], mais les EXEMPLES prefixent `bell-b3d-run/` ET **melangent** : `template:24` et `G0:202-204` ecrivent `bell-b3d-run/budget.json` (prefixe) tandis que `G0:205` ecrit `sonde-report.json` (NON prefixe). Le code ecrit a `resolve(out, "budget.json")` [lu `apps/bell/src/rebase-crosscheck.ts:740`] ⇒ **retenir la forme relative a la racine `--out`, SANS prefixe** (coherente avec la regle et le code).
  - **(b) separateur** : la regle dit UN espace `<relpath> <sha256hex>` [lu `template:19`, `G0:200`], mais l'exemple `G0:202-205` utilise **PLUSIEURS espaces d'alignement** [mesure `cat -A`]. Comme `manifest_sha256 = sha256(manifest.txt)` sur CES octets exacts [lu `G0:219`], un tiers qui suit l'exemple `G0 §5.1` a la lettre calcule un hash **DIFFERENT** du manifeste non-prefixe/un-espace ⇒ **geler EXACTEMENT UN espace 0x20**.
  - **`error_origin`** : la **lignee de pre-inscription G0 §5.1** (regle :200-201 vs exemple :202-210) **+** le template DRAFT (:21 vs :24) — **pas « template » seul** (G0 §5.1 est inchange `23a27b4`→`894d06b` [mesure], donc present a la base propre de la fiche).
  - **Recette rejouable** : trier en ordre d'octets `LC_ALL=C sort` ; une ligne `<relpath> <UN espace> <sha256 minuscule 64-hex>` ; LF ; aucun espace de fin ; un LF final. **Attention** : `sha256sum` emet le **hash EN PREMIER** — sur cette plateforme (Git Bash) mode binaire `<hash> *<file>` [mesure `printf x | sha256sum | cat -A` → `…4881 *-`], mode texte GNU `<hash>  <file>` (deux espaces) — jamais le format manifeste ⇒ **reformater** en `<relpath> <UN espace> <hash>`. A geler dans **G0 §5.1 ET le template** au commit du pli, **AVANT P10**.

### 4.2 `ots stamp` — invocation FIGEE (lue sur place, [lu FAITS])
```
PATH="F:\MONARK SUITE\ots\dll;C:\Program Files\Git\mingw64\bin;%PATH%" HOME=F:\tmp\ots-home F:\MONARK SUITE\ots\venv\Scripts\ots stamp docs\course-bell\probe_end-manifest.txt
```
[lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:27`] ⇒ preuve **pendante** `probe_end-manifest.txt.ots`. Plus tard (au plus tard avant la publication du verdict) : `… ots upgrade docs\course-bell\probe_end-manifest.txt.ots` ⇒ preuve **attestee Bitcoin** [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:30`]. **Aucun delai chiffre** (confirmation Bitcoin ~heures, [abs]) [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:18,28`]. **Repli** : si **< 2 calendriers** repondent, ligne « non horodatee, calendriers indisponibles a <heure> », posee a la frontiere suivante, **jamais rattrapee**. Sources : libelle + seuil [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:17,30`] ; **seuil OPERANT = « < 2 »** (`ots stamp -m` par defaut **2** : « complete if at least M calendars reply prior to the timeout » [lu `F:\MONARK SUITE\ots\venv\Lib\site-packages\otsclient\args.py:180-181`] ; « politique 2-sur-4 » [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:28`]) ; « jamais rattrapee / non rattrapable » [lu `docs/G0-lot-t1a-ii-b3d-course.md:227`, `docs/CHANTIERS.md:633`]. **Le template ne porte PAS ce repli** (`:52` = « Aucun delai de confirmation n'est chiffre … B1 = le push »). **Contradiction de FAITS a geler (item §7.1, declencheur P10)** : `FAITS:17` dit « si AUCUN ne repond » (seuil 0) vs `FAITS:30` « < 2 » (seuil 2) — retenir **< 2** ; `FAITS:17` « si aucun » a corriger en « < 2 ».

> **FORME D'EXECUTION A GELER (item §7.1) — la chaine FIGEE ci-dessus n'est executable verbatim dans AUCUN shell** : hybride prefixe
> POSIX `VAR=val cmd` + `%PATH%` (CMD) + separateurs `;` + chemins backslash ⇒ ni Git Bash (`%PATH%` non expanse), ni CMD (`PATH=..
> prog` en ligne n'est pas de la syntaxe CMD), ni PowerShell ne la lancent telle quelle. **Les SEMANTIQUES de `ots stamp <manifest>`
> sont prouvees** (essai a blanc anterieur : exit 0, 4 calendriers = jeu exact `FAITS:28`, preuve pendante valide [lu
> `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:28`]) ; **la forme LITTERALE reste a figer**. Reco : **Git Bash**, affectation
> POSIX + chemins forward-slash (`/f/MONARK SUITE/…`), `$PATH`, separateur `:` ; ou un `.bat` CMD avec `set`. **`HOME` est INERTE pour
> le cache ots sur Windows** : le cache = `appdirs.user_cache_dir` (= `LOCALAPPDATA`), PAS `$HOME` [lu
> `F:\MONARK SUITE\ots\venv\Lib\site-packages\otsclient\args.py:26,47`] ⇒ pour isoler l'etat sous `F:`, passer **`--cache <F:...>`**
> [lu `otsclient/args.py:45-48`] ou poser `LOCALAPPDATA` ; `HOME=F:\tmp\ots-home` ne fait rien.

### 4.3 Ligne ANCHORS.md (colonnes gelees)
`date_u` = `date -u +%Y-%m-%dT%H:%M:%SZ` au relevement (mesure, jamais estime — recidive d'horloge) [lu `docs/G0-lot-t1a-ii-b3d-course.md:216`].
```
| <date_u> | probe_end | n/a | <manifest_sha256> | n/a | n/a | <commit> | probe_end-manifest.txt.ots |
```
- `manifest_sha256` = `sha256(probe_end-manifest.txt)` minuscules 64-hex — **c'est l'objet qu'OTS horodate** [lu `docs/G0-lot-t1a-ii-b3d-course.md:219`, `docs/course-bell/ANCHORS.template.md:37`].
- `entry_sha256` = **`n/a`** a `probe_end` (mint `n/a` ; la sonde n'ecrit pas de ledger ; les shas des pages-1 du point (a) sont DANS le manifeste) [lu `docs/course-bell/ANCHORS.template.md:37,43`].
- `ledger_sha256` = **`n/a`** (pas de `crosscheck-<MINT>.json` a `probe_end`) [lu `docs/course-bell/ANCHORS.template.md:44`].
- `commit` = SHA git du commit **ajoutant** cette ligne + `probe_end-manifest.txt` + la preuve `.ots` (committe ET **pousse**, R-20 : orchestrateur) [lu `docs/course-bell/ANCHORS.template.md:45,50`].
- **CONCORDANCE `.ots` A GELER (item §7.1, declencheur P10)** : la ligne gelee (8 colonnes) porte `ots_ref` = un **CHEMIN**, et **AUCUN champ pour le sha de la preuve `.ots`** [lu `docs/course-bell/ANCHORS.template.md:35`, `docs/G0-lot-t1a-ii-b3d-course.md:214`] — alors que `FAITS:30` promet « l'`.ots` ET son sha … ecrits dans ANCHORS.md ». Comme `ots upgrade` **reecrit l'`.ots` EN PLACE** (pendante→attestee) [lu `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:30`, `docs/course-bell/ANCHORS.template.md:46,51`], un tiers ne distingue pas les octets pendants des attestes sans un sha d'`.ots` enregistre. **A trancher (hors ce worker, « aucune decision »)** : (a) **ajouter une colonne `ots_sha256`** a la ligne gelee (satisfait FAITS:30), OU (b) **amender FAITS:30** (retirer la promesse du sha `.ots`, s'appuyer sur l'historique git de l'`.ots`). **Geler UNE** option et croiser template/G0/FAITS pour qu'elles concordent.

### 4.4 Commit + push (orchestrateur, R-20)
Un seul commit ajoute : `docs/course-bell/ANCHORS.md` (ligne `probe_end`) + `docs/course-bell/probe_end-manifest.txt` + `docs/course-bell/probe_end-manifest.txt.ots` (pendante) ; puis **push** (B1 = temoin faible ; B2 = OTS = temoin independant, seul qui ferme C-F-4) [lu `docs/G0-lot-t1a-ii-b3d-course.md:181-183`, `docs/course-bell/ANCHORS.template.md:50-53`]. Le commit de l'upgrade (`.ots` attestee) suit plus tard. **Limite ADR D1-octies (verbatim)** : « L'ancrage prouve l'anteriorite de la tete de chaine a la date de l'ancre, PAS la provenance des pages ni l'execution du scan » [lu `docs/G0-lot-t1a-ii-b3d-course.md:177-178`, `docs/CHANTIERS.md:632` (« Prealables … a l'ADR D1-octies »)].

---

## 5. Points d'arret / STOP + retour investisseur

### 5.0 Ordre des actes juste avant/apres la sonde (fixe)
1. **P3** lecture dashboard 1 (t0). 2. **P4** floor lu ⇒ `<FLOOR-HELIUS>`. 3. **P3** lecture dashboard 2 (t0+`<DELTA-LECTURES>`), **identique** ⇒ debit de fond nul, ET **`<SNAP-HELIUS-BEFORE>`** = ligne per-methode de cette lecture. 4. **Sonde** (§2) puis points (a)/(b) (§2.1). 5. lecture dashboard 3 ⇒ **`<SNAP-HELIUS-AFTER>`**. 6. **Etalonnage 113** (§5.1). 7. **Ancre `probe_end`** (§4). 8. Lecture des criteres (§3.3) ⇒ arme go-2 ou retour investisseur. (**3 lectures dashboard**, pas 4.)

### 5.1 Etalonnage 113 a `probe_end` (borne dure decision 113, condition (d) G-6, premier point de la borne)
Rapprochement `Delta dashboard <= ledger_run` via la sous-commande **servie** `reconcile` [lu `docs/G0-lot-t1a-ii-b3d-course.md:155-157`, `packages/rpc-guard/src/cli.ts:4,22-34`, `bin/rpc-guard.mjs`] :
```
node packages/rpc-guard/bin/rpc-guard.mjs reconcile \
  --before <SNAP-HELIUS-BEFORE> --after <SNAP-HELIUS-AFTER> \
  --cycle <HELIUS_CYCLE_ID> --op helius \
  --ledger-dir <HELIUS_LEDGER_DIR> --floor <FLOOR-HELIUS> [--mode <RECONCILE-MODE>]
```
- `--before`/`--after` = **chemins de FICHIERS JSON** d'instantane, lus par `JSON.parse` [lu `bin/rpc-guard.mjs:12,25`, `packages/rpc-guard/src/cli.ts:32`]. **`--ledger-dir` requis** [lu `bin/rpc-guard.mjs:15-16`] ; **`--floor` ici est un SCALAIRE** `Number(floorRaw)` [lu `bin/rpc-guard.mjs:18-19`] — **format DIFFERENT du `--floor helius=<…>` k=v de la sonde (§2)**. Verdict **GO ⇒ exit 0 / NO-GO ⇒ exit 1** [lu `packages/rpc-guard/src/reconcile.ts:53`] ; le reconcile **appende `reconciled`** au ledger de cycle = **marqueur de frontiere 125(3)** [lu `packages/rpc-guard/src/reconcile.ts:52` (l'append `ledger.appendChained("reconciled",…)`), declenche par `packages/rpc-guard/src/cli.ts:32` `runReconcile(…)` ; NB `cli.ts:30` = `acquireLock`, PAS l'append].
- **CORRECTION R-21 sur la FORME du snapshot (le task et le ruling runbook disent `{cycle,total_ru}`)** : `total_ru` est la forme **AGGREGAT**, exigee **seulement** pour les operateurs sans dashboard par-methode = **`{chainstack}`** [lu `packages/rpc-guard/src/reconcile.ts:34`]. **Helius A un dashboard PAR-METHODE** [lu `docs/CHANTIERS.md:403`] : en **mode `per-method` (defaut)**, le snapshot porte **`byMethod`** et **`total_ru` est REJETE fail-closed** [lu `packages/rpc-guard/src/reconcile.ts:25,79-82`]. La borne 113 per-methode = **dure PAR METHODE** (`delta_m > run_m ⇒ NO-GO hard:<method>`) + **souple 0,5 % du run total** (`total_run - total_delta > max(50 ; 0,005 x total_run) ⇒ NO-GO soft`) [lu `packages/rpc-guard/src/reconcile.ts:88,91`, decision 113 verbatim `:79`]. **Doctrine retenue = `per-method`** (borne par-methode = la garde la plus fine ; la sonde est gTfA-seule) ⇒ **`<SNAP-HELIUS-BEFORE>`/`<SNAP-HELIUS-AFTER>`** = fichiers `{ "cycle": "<HELIUS_CYCLE_ID>", "byMethod": { "getTransactionsForAddress": <credits>, … } }` (valeurs per-methode **lues sur place** par l'investisseur, jamais devinees). **Divergence a trancher (item forme §7.1)** : le ruling runbook « snapshots `{cycle,total_ru}` » [lu `F:\tmp\garde1b\MISSION-G2-CP2-1b-i-ii-iii.md`] impliquerait `--mode aggregate` pour helius (licite mais **perd la borne par-methode**) — `<RECONCILE-MODE>` instance ; **recommande `per-method`** (defaut, omis). **Attention (mode per-methode)** : un compteur dashboard reinitialise (`delta < 0`) n'est **PAS** attrape par `negative_delta` (ce garde est dans la branche AGGREGAT seule [lu `packages/rpc-guard/src/reconcile.ts:66`]) — en per-methode un delta negatif passe la borne dure (`delta_m <= run_m`) puis gonfle `total_run - total_delta` (NO-GO `soft` si assez grand, sinon silencieux) ; les defenses restent donc le garde **`rollover`** (`before.cycle == after.cycle == --cycle`) [lu `:55`] ET la mesure **P3** (2 lectures identiques). `before.cycle`/`after.cycle` != `<HELIUS_CYCLE_ID>` ⇒ NO-GO `rollover` [lu `:55`].
- **Regle** : NO-GO (exit 1) hors bande ⇒ **incident, STOP, retour investisseur AVANT go-2** [lu `docs/G0-lot-t1a-ii-b3d-course.md:157`].

### 5.2 STOP de la sonde (retour investisseur, jamais un contournement)
| Declencheur | Regle | Source |
|---|---|---|
| Debit de fond Helius != 0 (P3) | STOP + incident, pas de sonde | `docs/G0-lot-t1a-ii-b3d-course.md:331`, `docs/CHANTIERS.md:346` (1) |
| `sonde-report.json` porte `error` (no_committed_series / no_measured_genesis / degenerate_span) | STOP + retour | `apps/bell/src/rebase-crosscheck.ts:749,760,764` |
| Point (g) `Sigma calls_by_method.global != calls_used` | STOP | `docs/G0-lot-t1a-ii-b3d-course.md:383`, `docs/CHANTIERS.md:346` (5) |
| Projection credits > 6 500 000 (H6) | STOP + ESCALADE | `docs/G0-lot-t1a-ii-b3d-course.md:317,386` |
| Reconcile 113 NO-GO (hard/soft/rollover/negative) | incident, STOP AVANT go-2 | `packages/rpc-guard/src/reconcile.ts:53,88,91` |
| < 2 calendriers OTS repondent (`-m` defaut 2) | ancre « non horodatee », jamais rattrapee ; pas un STOP de course | `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:17,30`, `otsclient/args.py:180-181`, `docs/G0-lot-t1a-ii-b3d-course.md:227` (non rattrapable) |
| Refus d'outil / certificat / CAPTCHA (OTS, dashboard) | **jamais contourne** : consigner « non contourne » + procurement | `docs/course-bell/ANCHORS.template.md:9-10` |
| Flake local Windows (oracles offline rejoues, `nodejs/node#56645`) | 0 echec non signe ; relance locale Windows ; **aucun retry CI** ; ne vise PAS l'appel reseau | `docs/G0-lot-t1a-ii-b3d-course.md:273-274` |
| **Course a-cheval sur la bascule de cycle Helius (19/10)** | **ESCALADE** (routage C-4) — jamais chevaucher ; **depart avant ~15/10** ; un glissement au-dela re-ouvre l'arithmetique du floor sur le cycle suivant. **Distinct du garde `rollover`** (id de cycle du snapshot, `reconcile.ts:55`) | `docs/CHANTIERS.md:642`, `docs/G0-lot-t1a-ii-b3d-course.md:337-343` |

**Le TIRAGE NE S'ENCHAINE PAS a la sonde** : go-1 et go-2 sont deux gates separes ; la sonde ne calibre pas H6 [lu `docs/CHANTIERS.md:346` (6)].

---

## 6. Fiche go-2 (un paragraphe) — ce que l'investisseur decide avec les chiffres de la sonde

**go-2 = TIRAGE full-mint (TSLAx -> AAPLx -> NVDAx -> SPYx, sous-plafonds cumulatifs roulant descendant), rendu QUAND la projection de la sonde est connue** [lu `docs/G0-lot-t1a-ii-b3d-course.md:280-292`]. Avec les chiffres du `sonde-report.json`, l'investisseur decide : **(1) le consentement** — pre-libelle « jusqu'a H6 **6,5 M** » **si la sonde sort LARGE (> +/- 20 % sur SPYx**, definition `<DEF-LARGE>` §3.3), **sinon retour investisseur** (engager 5 396 170 cr avant la sonde reviendrait a signer un point estime) [lu `docs/CHANTIERS.md:640`, `docs/G0-lot-t1a-ii-b3d-course.md:282-283`] ; **(2) la bande d'escalade `b`** (`<BANDE-b>`) du ratio `N_exact/N_projete` a **figer numeriquement** (etalonnage hors echantillon TSLAx ; escalade avant NVDAx/SPYx si hors bande) [lu `docs/G0-lot-t1a-ii-b3d-course.md:319-325,411`] ; **(3) l'Amendement 4 conditionnel** (K=32, ~1 320 cr dans la reserve 1 500) **seulement si la sonde sort large** [lu `docs/G0-lot-t1a-ii-b3d-course.md:405-406`] ; **(4) le bundling de la phase B univers** (50 000 cr, ledger dedie, decision 84) — sequencee sonde -> phase B -> tirage **sans bundler en silence**, decision au go-2 [lu `docs/G0-lot-t1a-ii-b3d-course.md:394-397`]. Gates go-2 : les 4 sous-lots 1b + G-4-bis, conditions architecte 1-4, **go-1 rentre** (sonde dans la bande 113, points (a)/(b) verts sur l'API reelle), points d'arret §7 (rapprochement 113 partiel + ancre `mint_*` + projection `f=0,05/0,25/0,5` + ratio TSLAx) pre-enregistres ; plafond fail-closed **5 396 170 cr** (= 1 500 sonde + Sigma sous-plafonds **enshrined** 5 394 670 ; base fail-closed par mint = **254 670 / 513 000 / 1 670 000 / 2 957 000**, NON les recomputes 254 220/…, cf. §3.3(1)), STOP H6 sur **projection > 6 500 000** (`--max-credits` par commande **6 497 500** ; ne pas conflater : 6 500 000 = seuil, 6 497 500 = argument [lu `docs/G0-lot-t1a-ii-b3d-course.md:113,116-118,288`]), jamais au-dela du **cycle 8 000 000**, floor re-lu [lu `docs/G0-lot-t1a-ii-b3d-course.md:284-289`]. **Fenetre de cycle** : demarrer avant ~15/10, jamais chevaucher la bascule du 19/10 (sinon ESCALADE, routage C-4) [lu `docs/CHANTIERS.md:642`, `docs/G0-lot-t1a-ii-b3d-course.md:337-343`].

---

## 7. Zero dette (cloture)

### 7.1 Items formes (declencheur + porteur ; aucun « du » nu)
1. **Format du manifeste `probe_end` a GELER (prefixe + separateur), AVANT P10** : (a) prefixe — regle « relpath relatif a la racine `--out` » [`template:21`, `G0:200`] vs exemples prefixes+mixtes `bell-b3d-run/…` [`template:24`, `G0:202-204`] avec `sonde-report.json` non prefixe [`G0:205`] ⇒ **retenir NON-prefixe** (coherent code `resolve(out,…)` [`rebase-crosscheck.ts:740`]) ; (b) separateur — regle UN espace [`template:19`, `G0:200`] vs exemple multi-espaces [`G0:202-205`, mesure `cat -A`] ⇒ **geler EXACTEMENT UN 0x20**. Impact : `manifest_sha256 = sha256(octets)` [`G0:219`] ⇒ un exemple suivi a la lettre donne un AUTRE hash. `error_origin` : **lignee de pre-inscription G0 §5.1** (regle :200-201 vs exemple :202-210) **+ template DRAFT** (:21 vs :24) — pas « template » seul (G0 §5.1 inchange `23a27b4`→`894d06b`). Recette : `LC_ALL=C sort` ; `sha256sum` emet le hash d'abord (`<hash> *<file>` binaire [mesure `printf x|sha256sum|cat -A`] / `<hash>  <file>` texte) ⇒ reformater `<relpath> <1 espace> <hash>`. Declencheur : commit du pli / P10. Porteur : orchestrateur.
2. **Forme du snapshot reconcile helius** : ruling runbook `{cycle,total_ru}` [F:\tmp\garde1b\MISSION-G2-CP2] vs code per-method `byMethod` (helius non aggregate-only, `total_ru` rejete `reconcile.ts:82`) — retenir **`per-method`/`byMethod`** (borne par-methode, decision 113) ou trancher `<RECONCILE-MODE>`. Declencheur : go-1. Porteur : orchestrateur.
3. **Confirmation `--series-dir`** : verifier que `apps/bell/test/fixtures/series/rebase` SONT les series fondatrices committees (`PINNED_BELL_SHA`) ; sinon passer `<SERIES-DIR>`. Declencheur : avant la sonde. Porteur : orchestrateur.
4. **Amendement 4 conditionnel** (K=32) — seulement si la sonde sort large ; petit lot G1->G7. Declencheur : go-1 « large ». Porteur : worker [lu `docs/G0-lot-t1a-ii-b3d-course.md:405-406`].
5. **Bande d'escalade `<BANDE-b>`** et **valeur du consentement large `<DEF-LARGE>`** — decisions investisseur au go-2 [lu `docs/G0-lot-t1a-ii-b3d-course.md:322-325,411`].
6. **Re-ancrage `fichier:ligne`** au sha de fusion REEL de 1b (si != `14784ee`). Declencheur : atterrissage P1. Porteur : orchestrateur.
7. **Colonne `ots_sha256` vs `FAITS:30`** : la ligne d'ancre gelee n'a pas de champ pour le sha `.ots` [`template:35`, `G0:214`] mais `FAITS:30` le promet, et `ots upgrade` reecrit l'`.ots` en place. Trancher : (a) ajouter colonne `ots_sha256`, ou (b) amender FAITS:30. Declencheur : AVANT P10. Porteur : orchestrateur. (§4.3)
8. **Contradiction de seuil OTS dans FAITS** : `FAITS:17` « si aucun » (seuil 0) vs `FAITS:30` « < 2 » (seuil 2) ; seuil operant = **< 2** (`ots stamp -m` defaut 2 [`args.py:180-181`]). Geler « < 2 », corriger FAITS:17. Declencheur : P10. Porteur : orchestrateur. (§4.2)
9. **Tension de corpus H6 (6 497 500 vs 6 500 000)** : `CHANTIERS:639` etiquette « 6 497 500 (STOP H6) », `G0:81-83,116` porte le [sic] (STOP sur projection > 6 500 000 ; 6 497 500 = `--max-credits`/cmd). NE trancher aucun ; reproduire les deux desambiguises. Declencheur : pli du G0 de course. Porteur : orchestrateur. (§3.3(4), §6)
10. **Forme d'execution `ots stamp` a figer** : la chaine FIGEE (`FAITS:27`) n'est executable verbatim dans aucun shell ; `HOME` inerte pour le cache ots sur Windows (cache = `appdirs.user_cache_dir` [`args.py:26,47`]). Figer UN shell (reco Git Bash) + `--cache <F:...>` pour l'isolation d'etat. Declencheur : premier stamp (P12). Porteur : orchestrateur. (§4.2)
11. **`BELL_SOLANA_RPC` (endpoint) = precondition de RESOLUTION helius** : distinct de la cle (query-param) ; a POSER en env AVANT la course, et a RETIRER (`-u`) de chaque dry-run fail-closed, sinon helius resout keyless = reseau [`transport.ts:93-97,220-221`]. Declencheur : avant la sonde (pose) / chaque dry-run (retrait). Porteur : investisseur (pose) + orchestrateur (retrait). (§1, P11, §7.2)

### 7.2 Instances a remplir (jamais devinees)
| Instance | Nature | Qui / quand |
|---|---|---|
| `<HELIUS_LEDGER_DIR>` | racine ledger hors depot (defaut `F:\monark-ledger`) | orchestrateur, P5 |
| `<HELIUS_CYCLE_ID>` | id de cycle (sonde + reconcile + unlock) | orchestrateur, P6 |
| `<FLOOR-HELIUS>` | floor du cycle **lu sur place** (0..8 000 000) | investisseur, P4 |
| `BELL_SOLANA_RPC` (endpoint) + `HELIUS_API_KEY` | **precondition** posee en env AVANT la course : endpoint = RESOLUTION helius (`transport.ts:93-95`), cle = query-param optionnel ; A-7 presence/longueur seulement, jamais la valeur | investisseur, P11 |
| `<OUT-BELL-B3D-RUN>` | `--out` durable + frais hors depot | orchestrateur, P7 |
| `<METHOD-CAPS>` | `k=v` couvrant BELL_SOLANA_METHODS (defaut collect.ts:642) | orchestrateur, P8 |
| `<MAX-CALLS>` | cap d'essais > 0 (recommande 150) | orchestrateur, §2 |
| `<DELTA-LECTURES>` | espacement des 2 lectures dashboard | investisseur, P3 |
| `<SNAP-HELIUS-BEFORE>` / `<SNAP-HELIUS-AFTER>` | fichiers JSON `{cycle, byMethod:{…}}` per-methode, valeurs **lues sur place** | orchestrateur/investisseur, §5.1 |
| `<RECONCILE-MODE>` | `per-method` (recommande) ou `aggregate` | orchestrateur, §5.1 / item 2 |
| `<SERIES-DIR>` | seulement si les fixtures ne sont pas les series committees | orchestrateur, item 3 |
| `<PROC-B-INTERRUPT>` | mecanique d'interruption du point (b) | orchestrateur, §2.1 |
| `<DEF-LARGE>` | definition operante du « > +/- 20 % SPYx » (i)/(ii) | investisseur, go-1 |
| `<BANDE-b>` | bande numerique du ratio N_exact/N_projete | investisseur, go-2 |

**Aucun contournement, aucun « du » nu** : chaque precondition est un gate a declencheur, un acte nomme, ou une instance. La course reste **BLOQUEE** tant que P1 (4 sous-lots + G-4-bis) / P3 / P4 / P5-P8 / P10 / **P11 (`BELL_SOLANA_RPC` endpoint)** / P12 ne sont pas remplis ; la sonde est un appel PAYANT execute par l'orchestrateur (R-20).

---

## 8. Pli (passe de refutation) — chaque refutation → correction → preuve

> 12 refutations, ordre de la mission. Deux lentilles portent chacune R1..R4 : **(plafonds/H6)** = 4-7 ; **(ancrage-OTS)** = 8-11.
> Toutes les preuves `[mesure]` sont **de ce worker** (dry-runs, grep, `cat -A`, A-7 — rejouables). Ce worker **NE tranche aucun** item
> forme (« aucune decision » : gates investisseur/G7).

1. **REFUTATION PRINCIPALE (arguments-cli) — la « commande EXACTE » §2 (et §2.1 a/b) OMET `--pools` ⇒ sonde SILENCIEUSE a 1 mint.**
   - **Correction** : §2 (commande + ligne de tableau `--pools` + avertissement), §2.1(a) (commande + texte) — ajout `--pools TSLAx,AAPLx,NVDAx,SPYx` ; §2.1(b) **herite** via « re-lancer la meme commande (a) » [lu §2.1(b)].
   - **Preuve** : defaut `argOf(argv,'--pools') ?? 'TSLAx'` [lu `apps/bell/src/collect.ts:429`] ; filtre sonde `XSTOCKS.filter(t=>wanted.includes(t.symbol))` [lu `apps/bell/src/rebase-crosscheck.ts:746`] + crosscheck (point a) [lu `:658`, `collect.ts:711`] ; commentaire « 1 + DENSITY_POINTS = 9 gTfA/mint => <= 36 pour les 4 mints » [lu `:447-449`] ; [mesure `F:\tmp\bell-go1\dryrun-parse.mjs` : sans `--pools` → `wanted=['TSLAx']` ; avec → `['TSLAx','AAPLx','NVDAx','SPYx']`].

2. **REFUTATION SECONDAIRE — la RESOLUTION de helius depend de `BELL_SOLANA_RPC` (endpoint), pas de la cle ; `env -u` et P11 l'omettaient ⇒ garantie « zero reseau » fausse (helius keyless).**
   - **Correction** : §1 (recette), P1, P9 — ajout `-u BELL_SOLANA_RPC` ; P11 — controle A-7 de `BELL_SOLANA_RPC` + enonce « endpoint = resolution / cle = query-param » ; §7.2 (ligne precondition) ; §7.1 item 11.
   - **Preuve** : `heliusBase=BELL_SOLANA_RPC.split(',')[0]` [lu `packages/rpc-guard/src/transport.ts:93-95`] ; keyless `key ? base+'?api-key='+key : base` [lu `:96-97`] ; `fetch` [lu `:220-221`] ; throw fail-closed [lu `packages/rpc-guard/src/guarded.ts:33`] ; [mesure `F:\tmp\bell-go1\dryrun-guard.mjs` : endpoint + 8 cles retires → ctor=Error « not resolved from env », elapsed_ms=1, avant transport] ; [mesure `grep` test = 4 injections locales `env:{BELL_SOLANA_RPC}` l.355/525/601/1341, 0 `process.env` ⇒ oracle 830/830 inchange] ; A-7 mon env : endpoint ABSENT, cle presente (longueur seule).

3. **REFUTATION MINEURE — §5.1 cite `cli.ts:30` (=`acquireLock`) pour l'append `reconciled`.**
   - **Correction** : §5.1 — `cli.ts:30` → `cli.ts:32` (`runReconcile`, le declencheur) ; l'append reste `reconcile.ts:52` ; NB `cli.ts:30`=`acquireLock` conserve comme clarification.
   - **Preuve** : [lu `cli.ts:30`=`acquireLock(cycleDir,op)`, `cli.ts:32`=`runReconcile(openOperatorLedger…)`, `reconcile.ts:52`=`ledger.appendChained("reconciled",…)`].

4. **R1 (plafonds/H6) — echelle mal citee : la fiche attribue « 6 500 000 STOP H6 » a `CHANTIERS:639`, qui dit « 6 497 500 (STOP H6) » ; 6 497 500 etait absent.**
   - **Correction** : §3.3(4) + §6 — reproduire les DEUX nombres desambiguises (6 500 000 = seuil STOP de projection ; 6 497 500 = `--max-credits`/cmd), seuil attribue a `G0:113,116` ; §7.1 item 9 (tension corpus, non tranchee).
   - **Preuve** : [lu `CHANTIERS:639` « 6 497 500 (STOP H6) », `G0:81-83` [sic], `G0:113,116-117,288` desambiguisation, corroboration `CHANTIERS:353` « --max-credits 6497500 »] ; [mesure grep : « 6 497 500 » 3× post-pli, 0 avant].

5. **R2 — sous-plafonds RECOMPUTES etiquetes « enshrined » et employes comme base fail-closed ; incoherence arithmetique.**
   - **Correction** : §3.3(1) — base fail-closed = **enshrined** 254 670/513 000/1 670 000/2 957 000 (Σ 5 394 670) ; recomputes 254 220/… (Σ 5 394 070) presentes a part ; piege AAPLx (−490) ; arithmetique 5 396 170 = 1 500 + 5 394 670 reconciliee ; §3.3(3)(i) libelle « recompute » corrige ; §6 base par mint explicitee.
   - **Preuve** : [lu `G0:101` enshrined, `G0:95-98` recompute, `G0:104-106` AAPLx −490, `G0:112` 5 396 170 = 1 500 + 5 394 670] ; [mesure : Σ recompute = 5 394 070 ; ecart au plafond 2 100 = 600 arrondi + 1 500 sonde].

6. **R3 — fractions cumulatives 14,23 % / 45,19 % et point d'arret « ~14 % » (decision 125(3)) absents.**
   - **Correction** : §3.3(2) — ajout 4,71 / 14,23 / 45,19 / 100 % + point d'arret ~14 % = frontiere TSLAx+AAPLx (`G0:119-121` corrige le verbatim « ~14 % (TSLAx) » de `CHANTIERS:641`).
   - **Preuve** : [lu `G0:96-98,119-121,120`, `CHANTIERS:641`] ; [mesure grep : « 14,23 » & « 45,19 » presents post-pli, 0 avant].

7. **R4 — point d'arret « fenetre de cycle » (decision 125, calendrier 19/10) totalement absent (le garde `rollover` cite est une autre chose).**
   - **Correction** : §5.2 (nouvelle ligne STOP), §6 (fenetre de cycle) + reponse investisseur — depart avant ~15/10, jamais chevaucher le 19/10 ⇒ ESCALADE (routage C-4) ; distinct du garde `rollover` (`reconcile.ts:55`).
   - **Preuve** : [lu `CHANTIERS:642`, `G0:337-343` ; `reconcile.ts:55` `before.cycle/after.cycle != cycle`] ; [mesure grep : « 19/10 » & « 15/10 » presents post-pli, 0 avant].

8. **R1 (ancrage-OTS) — le repli « < 2 calendriers » est mal source (template:52 & G0:227 ne le portent pas) ; contradiction interne FAITS:17 vs :30.**
   - **Correction** : §4.2 + §5.2 — repli re-source a `FAITS:17` (libelle) + `FAITS:30` (seuil « < 2 ») + `-m` defaut 2 ; `template:52` retire comme source ; `G0:227` garde pour « jamais rattrapee » ; §7.1 item 8 (geler « < 2 », corriger FAITS:17 — non tranche).
   - **Preuve** : [lu `template:52` = « Aucun delai… B1=push » (pas de repli), `G0:227` = « non rattrapable », `FAITS:17` seuil 0, `FAITS:30` seuil 2, `FAITS:28` « politique 2-sur-4 », `otsclient/args.py:180-181` `-m type=int default="2"` « complete if at least M calendars reply prior to the timeout »].

9. **R2 (strong) — la forme du relpath du manifeste contredit `G0 §5.1` lui-meme (pas que le template), et l'exemple viole sa propre regle « un espace » ⇒ change `manifest_sha256` (l'objet OTS).**
   - **Correction** : §4.1 + §7.1 item 1 — re-source a `G0:200-201` (regle) vs `G0:202-210` (exemple) ET `template:21` vs `:24` ; `error_origin` = lignee de pre-inscription G0 §5.1 + template DRAFT ; geler NON-prefixe + EXACTEMENT UN espace 0x20 ; recette (`LC_ALL=C sort` ; reformater le `<hash>  <file>` de `sha256sum`).
   - **Preuve** : [lu `G0:200` regle un-espace, `G0:202-205` exemple prefixe (`bell-b3d-run/…`) + `sonde-report.json` non prefixe + multi-espaces, `G0:219` `manifest_sha256`=objet OTS, `template:19,21,24`, code `resolve(out,"budget.json")` `rebase-crosscheck.ts:740`] ; [mesure `cat -A` = espaces d'alignement multiples ; `git diff` : G0 §5.1 inchange `23a27b4`→`894d06b`].

10. **R3 (strong) — la ligne d'ancre gelee omet le sha `.ots` que `FAITS:30` promet (ecart de concordance vs la 3e piece).**
    - **Correction** : §4.3 + §7.1 item 7 — item forme AVANT P10 : (a) ajouter une colonne `ots_sha256`, OU (b) amender FAITS:30 ; NON tranche.
    - **Preuve** : [lu `template:35` / `G0:214` = 8 colonnes, `ots_ref`=chemin, aucun champ pour le sha `.ots` ; `FAITS:30` promet le sha ; `template:46,51` + `FAITS:30` = `ots upgrade` reecrit l'`.ots` en place].

11. **R4 (precision) — la chaine `ots stamp` FIGEE n'est executable verbatim dans aucun shell ; `HOME` est inerte pour le cache ots sur Windows.**
    - **Correction** : §4.2 (note) + §7.1 item 10 — figer UN shell (reco Git Bash POSIX + chemins forward-slash) ; isolation d'etat via `--cache <F:...>` (pas `HOME`) ; « semantiques prouvees, forme litterale a figer » conserve.
    - **Preuve** : [lu `FAITS:27` = hybride POSIX `VAR=val` + `%PATH%` (CMD) + `;` + backslash ; `otsclient/args.py:26,47` cache = `appdirs.user_cache_dir` (=`LOCALAPPDATA`), override `--cache` `args.py:45-48`] ; semantiques `ots stamp` prouvees par un essai a blanc anterieur [lu `FAITS:28`] — **NON rejoue ici** (aucun reseau : contrainte de la mission).

12. **R5 (minor) — pointeurs `CHANTIERS:631` decales (D1-octies = :632 ; « non rattrapable » = :633).**
    - **Correction** : §4 en-tete `CHANTIERS:631` → `:633` ; §4.4 `CHANTIERS:631` → `:632` ; co-citations `G0:177-178` / `G0:227` (exactes) conservees.
    - **Preuve** : [lu `CHANTIERS:631` = « Contenu », `:632` = « Prealables…a l'ADR D1-octies », `:633` = « Non rattrapable », `G0:177-178`, `G0:227`] ; [mesure grep : `CHANTIERS.md:631` = 0 post-pli].

**Auto-verification du pli [mesure ce worker]** : re-grep FICHE post-pli — PRESENTS : `--pools`(5), `6 497 500`(3), `14,23`(1), `45,19`(1), `9,52`(1), `19/10`(4), `254 670`(2), `513 000`(3), `2 957 000`(3), `5 394 670`(3), `BELL_SOLANA_RPC`(14), `cli.ts:32`(1), `CHANTIERS.md:632`(1)/`:633`(2), `FAITS…:17,30`(2), `otsclient/args.py:180`(3), `ots_sha256`(2), `--cache`(2). DISPARUS : co-citation erronee `reconcile.ts:52`+`cli.ts:30`(0), `CHANTIERS.md:631`(0), `ANCHORS.template.md:52` comme source du repli(0), libelle « Bases enshrined recomputees de premiere main »(0). `diff FICHE-GO-1.pre-pli.md FICHE-GO-1.md` = 106 lignes sur 16 hunks (aucune ligne hors des zones visees). Snapshot pre-pli : `F:\tmp\bell-go1\FICHE-GO-1.pre-pli.md`.

**Base du pli [mesure ce worker]** : `F:\Monark` HEAD **`894d06b`** ; `docs/CHANTIERS.md` derive au SEUL hunk `@@ -702 +702 @@` ⇒ toutes les citations `CHANTIERS:<=642` stables ; `G0` / `ANCHORS.template` / `FAITS` byte-identiques `23a27b4`→`894d06b` ; arbre fusionne `14784ee`. Aucun commit, aucun reseau, aucune valeur de cle/endpoint affichee (A-7 : presence/longueur seulement) ; ecritures uniquement sous `F:\tmp\bell-go1\`.
