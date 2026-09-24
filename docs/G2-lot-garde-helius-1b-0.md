Modèle résolu : claude-opus-4-8[1m]

# G2 (relecteur, instance neuve, contexte frais) — Lot GARDE-HELIUS-1b-0 (cote PAQUET)

- **Role** : relecteur G2. **Modele** : `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni).
- **Objet** : branche `lot/garde-helius-1b-0` @ `ee8a94fb3fa98556713add6e9a39436935f18324`, base `5394dfe` (2b-ii fusionne).
- **Methode** : clone A HISTORIQUE COMPLET `git clone --no-hardlinks --branch lot/garde-helius-1b-0 F:\Monark F:\tmp\g2-garde1b0\tree`
  (HEAD verifie = ee8a94f, 997 commits, base 5394dfe presente) ; `node_modules` par `mk-nm.ps1` (220 entrees, 10 @monark, 0 fail ;
  `require.resolve('@monark/rpc-guard')` => `...\tree\packages\rpc-guard\src\index.ts`, A-2 : resout DANS mon arbre, pas F:\Monark).
- **Verifications 1-8 REFAITES sur mon clone** (jamais lues dans le rendu G1). **R-20** : aucun commit, aucun workflow.
  **A-7** : aucune variable d'environnement affichee ; tout oracle/mutant sous
  `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL
  -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. Ecritures : `F:\tmp\g2-garde1b0\` uniquement.

## Precheck mission (drift base -> 2b-iii fusionne)
`git diff --stat 5394dfe 985fed9 -- packages/rpc-guard apps/sentinel/test/ukemi-guard-record.test.ts` = **VIDE**. Aucun fichier
touche par 1b-0 n'a bouge entre la base `5394dfe` et `985fed9` (2b-iii fusionne). La fusion G7 n'a pas de conflit sur ces fichiers.
`5394dfe` est ancetre de `ee8a94f` (verifie), donc R-25 deux-points == trois-points.

## 1. Invariant byte-identite — **PASS**
- `git diff --stat 5394dfe ee8a94f -- apps` = **`apps/sentinel/test/ukemi-guard-record.test.ts` SEUL** (22 ins / 17 del, l'inversion
  declaree du test `_KNOWN_DEFECT`). Aucun autre `apps/**`.
- `git diff --stat 5394dfe ee8a94f -- scripts` = **VIDE** (`scripts/**` intact).
- `sha256sum -c freeze-before.sha256` sur MON clone = **9/9 OK** : gel U-4b (7 sha : `rpc.ts 0e232519`, `abi.ts 3376eb08`,
  `wadray.ts 7bee76fc`, `l1-split.ts 9206df91`, `u4b-reduce.mjs a5e66cd3`, `u4b-scores.mjs 9ad20666`, `record-u4b-calib.mjs 5733daeb`)
  + `u3-realized.mjs 755b3a38` + `adapter-narabi.ts` intacts. `git diff 5394dfe ee8a94f` sur ces 9 fichiers = VIDE.
- `sha256sum -c DELIVERED.sha256` sur MON clone = **17/17 OK** : mes octets clones == la livraison G1 exactement (je revois bien le
  meme code). `apps/bell/src/rebase-crosscheck.ts` (mute+restaure par le harnais) absent du diff => byte-identique.

## 2. Oracle complet ×1 sous `env -u` — **PASS** (codes captures directement `cmd > log 2>&1; echo exit=$?`)
| Gate | Exit | Detail (mesure) |
|---|---|---|
| `npm run ci` | **0** | tests **773 / pass 771 / fail 0 / skip 2** |
| `npm run lint` | **0** | eslint clean |
| `npm run lint:ratchet` | **0** | **69/69** |
| `npm run lang:gate` | **0** | 0 hit FR (scope {root,contracts,schemas,hikae,ukemi,atelier,monark,site,harness,skills,sentinel,bell}) |
| `npm run export:check` | **0** | 0 chemin interdit, 0 FR |
- Les **2 skips** sont les attendus : `u4_redraw_selects_by_book_digest_seed` (# until 2b-iii migrates scripts/census/u4-redraw.mjs)
  et `fetch_only_inside_client` (# until 1b: apps/bell/src paid fetch/env.<key> migrate into @monark/rpc-guard). Conforme.
- **R-25 (pathspec verbatim `.github/workflows/ci.yml:65`, base `5394dfe`)** recompute sur mon clone = **476 ins + 47 del = 523**
  (docs/**/*.md et package-lock.json exclus par la magie `:(exclude,glob)`). **523 <= 1150** => pas de STOP, pas de couture de repli.
  **ECART F-1 (correction)** : le RENDU-G1 §4 annonce « TOTAL R-25 = 517 » (et un decompte « 11 fichiers, 215 ins + 46 del = 261 »).
  Les DEUX sont faux : le bucket modifie mesure 267 (pas 261), total = 523. Le message de commit ee8a94f dit « R-25 523 » (correct) ;
  seul le corps du RENDU sous-compte de 6. Conclusion du gate inchangee ; nombre rapporte a corriger (doc 03, R-21).

## 3. Mutants — **PASS** (avec 1 survivant informatif, F-2)
- **14 mutants nommes G1 rejoues sur mon clone** (`node F:/tmp/garde1b0/mutants.mjs <clone>`, sous env -u) : **14/14 KILLED**,
  `OK - all KILLED and every file restored byte-exact`. `git status --porcelain` APRES = **vide** (restauration byte-exacte
  confirmee independamment, HEAD toujours ee8a94f).
- **5 mutants A MOI** (`F:\tmp\g2-garde1b0\g2-mutants.mjs`, points de mutation DISTINCTS des 14), sous env -u :
  - **G2-a KILLED** — `u.hostname.toLowerCase() !== admitted.hostname.toLowerCase()` => `false` (garde https, retire la SEULE egalite
    d'hote ; distinct du `if(false)` nomme) => `xstocks_issuer_get_uses_get_and_structural_host` ROUGE. Le controle d'hote structurel
    (C-7 beta) est bien load-bearing PAR L'EGALITE, pas seulement par le `if`.
  - **G2-b KILLED** — branche 3xx rendue MORTE (`res.status < 400` => `< 300`) => un 302 tombe en `HttpError`, pas type
    `RedirectBlocked` => `transport_3xx_is_hard_stop_never_followed` ROUGE (assertion `e.name==='RedirectBlocked'`).
  - **G2-c KILLED** — recuperation compare `onDisk` au head COURANT (`entries.slice(0,-1)` => `entries`) => un head en retard d'1 ne
    heale jamais => le test INVERSE sentinel `ukemi_record_crash_between_append_and_head_is_recovered_by_unlock` ROUGE.
  - **G2-d KILLED** — `opts.network` IGNORE au tampon dans `guarded.ts:52` (`? opts.network :` => `? undefined :`) => la ligne reseau
    perd son attribut => `cycle_ledger_mixes_legacy_and_network_lines` ROUGE (assertion `lines[1].network==='solana-mainnet'`).
    Distinct des mutants nommes #9 (scission de chemin, ledger.ts) et #10 (filtre du prior).
  - **G2-e SURVIVED** (sonde de couverture) — `redirect:"manual"` RETIRE du fetch **GET** seulement (POST toujours `manual`) =>
    AUCUN test ne rougit. Verifie : le seul stub 3xx du suite est `transport_3xx_is_hard_stop_never_followed` (l.53) sur l'operateur
    POST `helius` ; aucun test n'envoie un 3xx a l'operateur GET `xstocks-issuer`. **F-2 (item forme)** : l'invariant « un 3xx n'est
    JAMAIS suivi » que l'ADR 1b0-C revendique pour GET **et** POST n'est teste QUE pour POST. Le CODE est correct (transport.ts:220
    porte bien `redirect:"manual"` sur le GET) ; c'est un TROU DE COUVERTURE (une regression qui le retire du GET passerait verte).
    L'operateur GET est keyless et consomme au 1b-i (upcoming). Declencheur : 1b-i (ajouter une assertion 3xx-sur-GET quand Bell
    consomme `xstocks-issuer`), ou ajout immediat de l'assertion (petit).
  - `git status --porcelain` APRES mes mutants = **vide** (restauration byte-exacte confirmee).

## 4. Securite A-7 sur le code — **PASS**
- `no_secret_in_repo` (test/no-secret-in-repo.test.ts) marche l'ARBRE COMMITTE ENTIER contre ~13 formes de credential (bloc private
  key, AWS AKIA, GitHub PAT classic/fine, Slack xox*, Google AIza, UUID Helius en contexte api-key, Chainstack hex-in-path,
  p2pify, wss hex, Bearer>=16, `*_API_KEY=` inline, Databento db-). Il est **VERT** dans mon `npm run ci` => aucun secret committe,
  `bin/rpc-guard.mjs` et les nouveaux fichiers 1b-0 inclus.
- Par inspection des NOUVEAUX chemins : `bin/rpc-guard.mjs` ne lit que `--ledger-dir`/`--floor` (args CLI explicites, jamais une sonde
  d'env ; commentaire l.5 « No secret is read here ») et n'ecrit que le verdict + une raison a vocabulaire FERME (GO/NO-GO/rollover/
  hard:*/soft) ; il ne touche ni transport ni fetch ni endpoint. Message `RedirectBlocked` = `scrubUrls("rpc-guard: RedirectBlocked
  for operator 'op' (code NNN)")`, detail vide (transport.ts:228,186-193). Message 403/`HttpError` = pour un op PAYANT `closedHint`
  (vocabulaire ferme, jamais un octet brut du corps), pour keyless le corps `redact`e ; toujours `scrubUrls`. Le hook `onErr` recoit
  label+nom+code, jamais l'URL. `resolveGetUrl` jette « ... operator 'op' is off the admitted host » (label seul, pas d'URL). Aucune
  clef ni URL-a-clef n'est imprimee, journalisee ou renvoyee.

## 5. Clause 121 (network = attribut, jamais un 2e plafond ; un seul ledger par compte ; reconcile lit le total du compte) — **PASS**
- **Un seul operateur/plafond par compte** : `transport.ts:105-109` — `const network = opts.network ?? "ethereum-mainnet"` puis
  `urls.set("chainstack", chainstackUrl)` (UN operateur « chainstack », pas de `chainstack-solana`) et
  `classes["chainstack"] = { unit:"ru", ..., cycleCap: CHAINSTACK_CYCLE_CAP_RU }` (UN cap 16 M RU, pas par-reseau).
- **Un seul ledger de cycle par compte** : `ledger.ts:96` — `const path = join(cycleDir, \`${op}.jsonl\`)` (fichier clef par
  OPERATEUR, jamais par reseau) => un seul `chainstack.jsonl`. Le mutant nomme #9 (scission `${op}-${network}.jsonl`) est KILLED.
- **network = ATTRIBUT du journal** : `ledger.ts:38` (`readonly network?: string`), stampe `ledger.ts:134` APRES `credits_derived`
  AVANT `reason`, `...(network!==undefined?{network}:{})` ; `guarded.ts:52` — `const network = label === "chainstack" ? opts.network
  : undefined` (stampe UNIQUEMENT pour chainstack, omis sinon => lignes legacy byte-identiques).
- **Jamais un 2e plafond** : `ledger.ts:128` — `frozenPrior = Math.max(floor, Sigma attempted credits_derived)` **sans filtre
  `e.network`** => le prior/cap somme TOUS les reseaux (total compte). Le mutant nomme #10 (ajout `&& e.network===network`) est KILLED.
- **reconcile lit le total du compte** : `reconcile.ts:28` — `AGGREGATE_ONLY_OPERATORS = new Set(["chainstack"])` (mode aggregate,
  total RU) ; `reconcile.ts:31-42` `ledgerRunSinceLastReconciled` lit le `chainstack.jsonl` unique sans filtre reseau ; `reconcile.ts:58`
  `ledgerTotal = Sigma run` (tous reseaux) ; `l.59` `delta = after.total_ru - before.total_ru` (total tableau de bord). Conforme a la
  decision 121 (« un seul ledger de cycle Chainstack ... la ventilation par reseau est un attribut du journal (network), jamais un
  second plafond ... le protocole de rapprochement lit le total du compte », CHANTIERS.md:602-603).

## 6. Chemin servi (CA-11) — pas de surclaim `built` + surface d'export publique (C-V-2/P6) — **PASS**
- **Surface d'export publique (verif adversariale : `index.ts`+4 ET `exports.test.ts`+3 modifies dans LE MEME commit => CI verte ne
  suffit pas)** : `git diff 5394dfe ee8a94f -- src/index.ts` n'ajoute au set de VALEURS publiques QUE `BELL_SOLANA_METHODS` +
  `assertMethodCapsCover` (table de 4 methodes + verif de couverture a la construction ; AUCUN symbole ne renvoie/accepte une URL
  d'endpoint => pas un chemin paye), plus les TYPES `TransportOpts`/`NetworkLabel` (effaces au runtime, hors set de valeurs). Le test
  `public_export_set_is_closed` garde INCHANGE l'assertion FERMEE : `makeClient`, `resolveOperators`, `resolveConfig`, `InMemorySink`,
  `openOperatorLedger`, `acquireLock`, `runUnlock` **NE DOIVENT PAS** etre publics (C-V-2) — toujours assertee absente. Le test
  transport-hardening importe `resolveOperators` depuis `../src/transport.ts` DIRECTEMENT (pas l'index), coherent avec son statut
  prive. L'invariant « seul chemin paye public = `openGuardedClient` (ligne ledger AVANT tout fetch) » est PRESERVE. Pas de fuite.
- 1b-0 est un lot PAQUET sans consommateur servi. `bin/rpc-guard.mjs:6-7` : « UPCOMING until a served course consumes this exit code
  (Branchement rule): 1b-0 ships the executable + its bin entry; the consumer lands at 1b-i+ ». RENDU §1 (R-6) : « (UPCOMING) ...
  consommateur servi a 1b-i+ » ; §7 nomme les consommateurs 1b-i/ii/iii comme declencheurs. Aucune occurrence de `built`/`branche`
  n'attribue a 1b-0 un statut branche (la seule mention « branche cote Bell au 1b-i » DIFFERE correctement). Pas de surclaim.

## 7. `package-lock.json` — seule l'entree `bin`, aucun paquet nouveau — **PASS**
- `git diff 5394dfe ee8a94f -- package-lock.json` = **la SEULE entree `bin`** ajoutee au workspace `packages/rpc-guard`
  (`"bin": { "rpc-guard": "bin/rpc-guard.mjs" }`, 4 ins / 1 del). Aucune entree `node_modules/*`, aucune dependance nouvelle, aucun
  bump de version externe. `package.json` de rpc-guard : ajout `bin` seul, aucune `dependencies`. `node_modules` (junctions) non
  affecte par cet ajout de metadonnee de workspace.

## 8. Amendement ADR « 1b-0 » date — **PASS (substance)** avec correction F-3
- Amendement DATE (« Amendement GARDE-HELIUS-1b-0 ... date 2026-09-22, worker claude-opus-4-8[1m] »), sections 1b0-A..1b0-G.
- **Residus formes AVEC declencheur — les 6 presents** (1b0-G sauf indication) : (1) crash au TOUT PREMIER append => « Item forme,
  declencheur : observation en course (proprietaire : orchestrateur) » ; (2) T4 `fetch_only_inside_client` => de-skip 1b-iii ;
  (3) re-export `BudgetExceededError` cote Bell => 1b-i (1b0-F, C-1) ; (4) `PUBLIC_SOLANA` mainnet-beta => 1b-ii (C-2 voisin) ;
  (5) ripple `finally` du recorder par `(op, cycles[op])` => 1b-i (1b0-E) ; (6) Databento/Polygon => « G0 course cash Bell » 1b-iii.
- **Tuyaux** : chaque section 1b0-A..F declare son livrable (sortie), son etat (fichier ledger / clef de cap / lock) et le test
  nomme qui le prouve ; le statut de branchement (upcoming, consommateurs 1b-i..iii) est explicite (1b0-F bin, 1b0-E ripple).
  La table CONSOLIDEE entree/sortie/etat/test vit au **G0 §5** (le plan). **F-3 (correction)** : le RENDU §6 F-1 affirme « ADR : ligne
  « Tuyaux » (renvoi table G0 §5) » — **cette ligne n'existe PAS** dans l'amendement 1b-0 (grep « Tuyaux » => seulement les sections
  1a/2b-ii pre-existantes, l.77/397/431) ; les tuyaux y sont declares DISPERSES par section, pas en tuple consolide ni par un renvoi
  explicite. Substance de la regle Branchement satisfaite (statut upcoming + consommateurs + tests nommes + G0 §5) ; description du
  RENDU a corriger (R-21).

## C-R-b6 (ruling orchestrateur) — premisse « octets identiques » assertee par le test — **VERIFIE**
Le test `cycle_ledger_mixes_legacy_and_network_lines` (transport-hardening.test.ts:122-152) asserte la premisse STRUCTURELLEMENT :
(l.136) la ligne legacy est PRODUITE par la vraie pile `openGuardedClient(...)` SANS `opts.network` — le meme point d'entree que le
recorder 2b-ii ; (l.146) `assert.ok(!("network" in lines[0]))` — la ligne legacy ne porte AUCUN champ network ; (l.148) la chaine
mixte se re-derive. La byte-identite au recorder tient parce que (i) `apps/sentinel/src/record.ts` est byte-identique a 5394dfe
(verif 1) et appelle `openGuardedClient` sans network, (ii) la SEULE evolution 1b-0 de la forme de ligne est le champ `network`
OPTIONNEL, omis quand `opts.network` absent (ledger.ts:134), donc le core est inchange. L'assertion est la plus forte possible SANS
un import inverse `apps/sentinel`<-test paquet (que l'orchestrateur a correctement refuse) : un diff d'octets direct contre une
ligne-or du recorder exigerait cette inversion. Premisse adequatement assertee ; conforme au ruling. Pas un defaut.

## Findings (aucun ne casse un gate, un invariant, la securite, ou un test)
- **F-1 (correction, non-bloquant)** : RENDU §4 « R-25 = 517 » est FAUX ; la mesure exacte (pathspec ci.yml:65, base 5394dfe) = **523**
  (== message de commit == attendu mission). Corriger le nombre dans le RENDU (le decompte « 261 » du bucket modifie est aussi faux :
  267). Conclusion <= 1150 inchangee.
- **F-2 (item forme, declencheur 1b-i)** : mutant G2-e SURVIVANT — le `redirect:"manual"` du chemin **GET** (`xstocks-issuer`) n'est
  couvert par AUCUN test 3xx ; l'invariant « 3xx jamais suivi » de l'ADR 1b0-C (GET et POST) n'est prouve que pour POST. Code correct,
  trou de couverture. Ajouter une assertion 3xx-sur-GET (immediat, petit) ou la porter au 1b-i quand Bell consomme le GET.
- **F-3 (correction, non-bloquant)** : RENDU §6 F-1 sur-decrit l'ADR (pas de « ligne Tuyaux (renvoi G0 §5) » dans l'amendement 1b-0 ;
  tuyaux disperses + tuple consolide au G0 §5). Corriger la description.

## VERDICT G2 : **PASS-AVEC-CORRECTIONS**
Substance saine sur les 8 verifications refaites : invariant byte-identite (git + sha256 freeze + DELIVERED), oracle vert
773/771/0/2 + lint/ratchet/lang/export = 0 + R-25 523 <= 1150, 14 mutants nommes KILLED byte-exact + 4 mutants a moi KILLED a des
points distincts, securite A-7 (no-secret vert + chemins neufs scrubbes), clause 121 (lignes citees), pas de surclaim built,
package-lock = bin seul, ADR date avec 6 residus a declencheur, premisse C-R-b6 assertee. **Corrections requises avant cloture
zero-dette** : F-1 (RENDU R-25 517 -> 523), F-2 (former l'item couverture 3xx-sur-GET avec declencheur 1b-i, ou ajouter l'assertion),
F-3 (corriger la description ADR-tuyaux du RENDU). Aucune n'est bloquante (ni gate, ni invariant, ni securite, ni test casse).
