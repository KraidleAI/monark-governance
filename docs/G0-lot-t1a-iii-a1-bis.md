# G0 — Sprint backlog sous-lot Bell **T-1a-iii-a1-bis** : durcissements bloquants AVANT la première course univers (ledger chaîné non réductible, identité assainie, test-22 sans egress, drain des tests à serveur)

**Rôle** : RÉDACTEUR du **PLI checkpoint-1** (PLAN plié, **remplaçant** ; AUCUN code, AUCUN réseau). **Modèle résolu (R-1)** :
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Statut** : **ACCEPTE-AVEC-CORRECTIONS** par le validateur-humain (`claude-fable-5-1`, checkpoint-1 2026-09-21 ~07:40 UTC ;
record [lu] `docs/CHANTIERS.md:491-492` ; avis intégral persisté `CHECKPOINT1-lot-t1a-iii-a1-bis.md`). Ce document **plie la
liste fermée C-1..C-13** (**C-1..C-11 bloquantes avant G1**, C-12/C-13 non bloquantes) **et les six rulings CP1-Q1..Q6** — chaque
correction **rouverte à son `fichier:ligne`** au pli. **Aucune question / escalade investisseur.**
**Provenance** : plan initial `claude-opus-4-8[1m]` 2026-09-21 (advisor intégré 2×) ; **pli `claude-opus-4-8[1m]` 2026-09-21**
(advisor intégré 2×) ; réviseur = orchestrateur (R-21, vérification adversariale avant consommation). **R-20** : aucun commit,
aucun workflow, aucun fichier du dépôt modifié — écriture unique hors dépôt `F:\tmp\a1bis\pli-cp1\G0-lot-t1a-iii-a1-bis.md`.
**R-21** : chaque `fichier:ligne` a été **rouvert au pli** et concorde ; **shas du code jugé re-vérifiés identiques** ce jour
(`universe.ts d6026584…`, `universe-cli.ts 560cd5d0…`, `universe.test.ts 19edfb99…` ; G0 revu `686c02e0…`, byte-identique).
**AUCUN appel réseau. Aucun secret lu** : `F:\Monark` (branche `lot/etude-suite`, **HEAD `5724f05` au pli** — le validateur a revu
`b3acf20→796b32d`, G0 byte-identique) et `F:\Monark-wt-b3db1a` (branche `lot/t-1a-ii-b3d-b1a`) ouverts en LECTURE seule ; aucune
URL à clé recopiée.

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main dans un fichier du dépôt à `fichier:ligne` (vérifiable par l'orchestrateur).
- **[à mesurer]** = projection de ce G0 (R-25 par livrable), à confirmer au G1 par mesure sous la pathspec `ci.yml:65`.
- **[lacune]** = fait NON établi de première main, nommé comme tel avec son déclencheur de levée (jamais deviné).

---

## 1. Objet et périmètre

**Objet (bloquant AVANT la première course univers)** : clore les quatre corrections G2/G2-delta/checkpoint-2 de -iii-a1
qui gatent la course (G7 `docs/G7-lot-t1a-iii-a1.md:18` ; PLI `docs/PLI-lot-t1a-iii-a1.md:100-101,125-128`), **sans**
lancer la course ni toucher un registre public (tout reste `upcoming`). Ce sous-lot est **100 % HORS LIGNE** : code +
tests offline + fixtures synthétiques. Il **précède** la course ; il ne la déclenche pas (R-20).

**Les quatre corrections traitées (liste fermée)** :
1. **C-G2-7** — ledger de course chaîné, tamper-**évident**, non réductible (calque -b3d). Redevenu **BLOQUANT** par
   C-G2D-2 (Chainstack Growth facture l'overage 15 $/M RU — pas de plafond dur : `docs/PLI-lot-t1a-iii-a1.md:126`) ⇒
   un `budget.json` édité à la baisse ferait re-dépenser au-delà du plafond ⇒ coût réel.
2. **C-G2-6** — `name`/`symbol` en texte libre pouvant porter un prix ⇒ `sanitizeIdentityText` (forme déjà probée, PLI
   `docs/PLI-lot-t1a-iii-a1.md:107`) + test/mutant, **sans faux-rejet mesuré** sur la fixture.
3. **C-G2D-3** — test 22 (`spawnSync` du vrai CLI) : jamais de sortie réseau en CI même si la garde https régressait
   (stub `fetch` par `--import` du sous-processus). **AVANT** la prochaine campagne de mutants.
4. **C-G2D-1** — stabilisation des tests à serveur (drain explicite des handles en `finally`) ; le flag
   `--test-force-exit`, **verrouillé** par `test/ci-gates.test.ts:1329`, n'est **PAS** retiré.

**Les trois résidus laissés FORMÉS (zéro dette — déclencheur + propriétaire ; §3)** : (5a) « page courte/vide
prématurée » (**sonde d'OBSERVATION ajoutée à la course, C-11** ; sonde assertante reportée) ; (5b) `digest.ts:96-97` `localeCompare` (hors périmètre -b3) ; (6) reprise à mi-course non persistée
(item a1-bis du PLI §3). **Aucune n'est un défaut fail-closed** ; chacune a une raison de ne PAS être pliée ici qui
n'est **pas** l'esquive de R-25 (§3).

**Isolation** : `apps/bell/**` (universe.ts / universe-cli.ts / universe.test.ts + fixtures + un shim de test) +
deux fichiers de tests d'infra hors lot (`apps/harness/test/server.test.ts`, `test/byo-demo-probe.test.ts`, drain
seul) + ADR/PLI docs. **Ne touche PAS** `collect.ts`, `rebase-crosscheck.ts` (édité en vol par -b3d-b1a — un import `src`
créerait une surface de conflit ; cf. §4 — un import **de test** reste licite, C-3), `pools.ts`, `digest.ts`, ni un registre public. Un worker, un worktree neuf.

---

## 2. Livrables (fichier:ligne, test non-LLM, mutant, tuyau, R-25)

### D1 — C-G2-7 : ledger de course chaîné, non réductible, tamper-évident (calque -b3d fidèle)

**Cible** : `apps/bell/src/universe.ts:132-155` (bloc « Persistent APPELS budget ») — réécriture de
`readPriorCalls` (`:147-154`) + ajout du journal chaîné ; `apps/bell/src/universe-cli.ts:123` (`persist()`) + `:117`
(`writeOut`) ; `provenanceMd` (`:185-199`).

**Conception (deux pièces liées, calque -b3d — COMPTEUR d'abord)** — la faille actuelle : `readPriorCalls`
(`universe.ts:147-154`) lit un `budget.json {calls}` et accepte **tout** `calls >= 0` fini ⇒ une baisse manuelle
passe. Le calque -b3d impose deux pièces liées :
- **(a) une ancre-compteur** `budget.json {calls}` (champ existant **conservé** ; calque du writer
  `rebase-crosscheck.ts:571-573` b3db1a).
- **(b) un journal chaîné append-only** `universe-budget-ledger.jsonl` (dans `dirname(--ledger)` — **PAS de nouveau flag** ;
  **nom HORS du glob** `^ledger-.*\.jsonl$` de `rebase-crosscheck.ts:388` (`ledgerPagesOnDisk`) et `^(ledger|events|handoffs)-.*\.jsonl$`
  de `:395` (`hasResumeState`) — un `ledger-universe.jsonl` serait faussement ramassé comme état de reprise -b3d : **C-13**) :
  une entrée par `persist()`, cœur `{prev_entry_sha256, seq, calls_cumulative}`, `entry_sha256 = sha(JSON.stringify(core))`
  **dans l'ordre d'écriture des champs** — discipline **byte-identique** au calque `chainedLedgerEntry`
  (`rebase-crosscheck.ts:136-145`) et `LEDGER_GENESIS = "0".repeat(64)` (`:110`, **redéclaré** cité, §4).
- **Ordre d'écriture = ANCRE-COMPTEUR D'ABORD, append du journal ENSUITE** (calque **b3db1a**
  `rebase-crosscheck.ts:592-597` : « counter FIRST (before the ledger append) so a crash in the append window leaves
  `calls_used >= pages` — a resume re-fetches; over-count by one, conservative »). Un crash **dans la fenêtre entre les
  deux écritures** laisse l'ancre **en avance** sur le journal (sur-compte borné ⇒ reprise sûre). **Portée honnête
  (C-1, phrase i)** : `persist()` tourne en `finally` **APRÈS** les deux envois quorum-2 (`universe-cli.ts:159`) ⇒ à la
  granularité du persist c'est du **write-BEHIND** — un kill entre un envoi et son persist **sous-compte ≤ 2 appels
  logiques** (une confirmation quorum-2). Le **write-ahead réel** (append AVANT le fetch) est le **ledger de CYCLE
  GARDE-HELIUS**, pas ce ledger de RUN. *(Retiré « jamais un sous-compte » — sur-claim ; collatéral : le commentaire
  `universe-cli.ts:159` « never under-count » porte le même excès, à amender au G1.)*

**Contrôles fail-closed de la reprise** (réécriture `readPriorCalls`/reader de reprise, calque
`rebase-crosscheck.ts:403-419` + `resumeFromLedger` `:429-436`) : journal présent + ancre absente ⇒ throw (calque
`:405-408`) ; **cohérence ancre/journal = `ancre.calls ≥ calls_cumulative de tête`, sinon throw — `≥`, PAS `==`** (la
fenêtre de crash laisse l'ancre **en avance** ; un G1 qui vérifie l'égalité **casse la reprise post-crash** : **C-4**) ⇒
une **baisse** (`ancre.calls < tête`) est détectée (adaptation du `calls_used < pages` de `:413-418`) ; **`verifyChain`**
(introduit ici car **absent d'etude-suite**) = **re-dérivation `sha(core)`** + **`prev` enchaîné depuis genesis** +
**`calls_cumulative` monotone non décroissant** (C-4) ; il ne se re-dérive pas ⇒ throw ; toute ligne illisible ⇒ throw
(fail-closed, pas de skip). Absent (ni ancre ni journal) ⇒ 0 (fresh). **La reprise CONTINUE la chaîne depuis la tête lue
du journal** (`ledgerSha`, `:147-149`) — jamais `prev = GENESIS` une seconde fois. **Reprise sans réparation (C-1,
phrase ii)** : un kill **ENTRE** les deux écritures reprend de l'ancre **sans intervention** ; une **ancre ou une ligne
tronquée** ⇒ throw fail-closed **+ réparation manuelle consignée** (jamais un skip silencieux).

**Modèle de menace (honnêteté R-21)** : tamper-**évident** pour les éditions **non coordonnées** — le cas C-G2-7
visé : « un `budget.json` abaissé à la main » (`docs/G2-lot-t1a-iii-a1.md:56-57`) ⇒ `ancre.calls < calls_cumulative`
⇒ throw ; une ligne de journal éditée ⇒ `verifyChain` throw. Il **ne prétend PAS** attraper une **réécriture
coordonnée** (tronquer le journal à K entrées ET poser `ancre.calls = calls_cumulative(K)` : préfixe valide + compteur
cohérent) — au-delà de « **le ledger PROPRE de l'opérateur** » (modèle de menace G2, `:57`). **Écrire
« tamper-évident », jamais « non-falsifiable ».** **Ancrage & exposition (C-1, phrase iii)** : un `head_sha256` dans
l'ancre (**Design B**) **ne bat pas non plus** la réécriture coordonnée (l'attaquant réécrit les deux fichiers de façon
cohérente) — l'exiger serait du spec-gaming. Le **seul ancrage hors de la main de l'opérateur** est le **floor lu sur le
tableau de bord Chainstack** (GARDE-HELIUS §3.1, **décision 115 : 16 M RU**). L'exposition d'une reprise trafiquée est
**bornée par `--max-calls` par run** — le compteur in-process de `makeBudgetedCall` (`collect.ts:296-306`) ne dépend
**d'AUCUN fichier**.

**Test non-LLM** (réécriture de test 8 `apps/bell/test/universe.test.ts:180-201` + ajouts) :
`bell_universe_ledger_chain_rederives_and_refuses_downward_edit` — une chaîne écrite se re-dérive (`verifyChain` VERT) ;
`ancre.calls` abaissé sous le `calls_cumulative` de tête ⇒ throw ; une ligne illisible ⇒ throw (pas de skip) ; ancre
absente + journal présent ⇒ throw ; une reprise CONTINUE la chaîne (offset M17 `total()=priorCalls+calls()` préservé,
`:185`). **Simulation de crash (C-6)** : un `deps.appendFile` injecté qui **throw APRÈS l'écriture de l'ancre** ⇒ le run
suivant reprend avec `priorCalls = ancre.calls` (`≥` tête) **SANS throw** — la preuve **exécutée** de la conservativité,
au-delà du spy d'ordre.
**Verrouillage du format (C-3)** — `bell_universe_ledger_format_is_byte_identical_to_b3d` : importe **côté test seulement**
`LEDGER_GENESIS`/`chainedLedgerEntry`/`ledgerSha` de `../src/rebase-crosscheck.ts` (`:110,136-145,147-149`) et asserte même
genesis + `entry_sha256` d'universe == celui d'un **cœur de page** re-haché par la fonction de hachage d'universe (`sha` est
**module-local** `:40`, non exporté ⇒ on **reproduit** le hachage, on ne l'importe pas) + head == `ledgerSha`. Sans lui,
« format verrouillé » n'est qu'un commentaire (détail §4, CONV-1).

**Mutants** (chacun rougit sa cible ; leçon -b3d `rebase-crosscheck.ts:167-172` **b3db1a** : un vérifieur qui **relit**
`prev_entry_sha256` au lieu de recalculer `sha(core)` laisse survivre le mutant qui le mute — le vérifieur **recalcule**) :
- **M-chain** : `verifyChain` compare le champ au lieu de recalculer ⇒ `prev_entry_sha256` muté survit ⇒ le test rougit.
- **M-down** : `ancre.calls < calls_cumulative` accepté ⇒ le test de **baisse** rougit.
- **M-regenesis** : la reprise repart de `GENESIS` (leçon -b3d « chains from genesis a SECOND time », b3db1a `:189`) ⇒
  la chaîne du run suivant ne re-dérive pas ⇒ `verifyChain` rougit.
- **M-order** : ordre inversé (append avant l'ancre-compteur) ⇒ la **simulation de crash (C-6)** laisse `ancre.calls < tête`
  (**sous-compte**) ⇒ la reprise **throw** ⇒ le test rougit (en plus du spy d'ordre sur les écritures).
- **M-format (C-3)** : hacher le cœur via `canonical()` (au lieu de `JSON.stringify(core)`) ou renommer un champ ⇒
  `entry_sha256` d'universe ≠ celui du calque -b3d ⇒ `bell_universe_ledger_format_is_byte_identical_to_b3d` rougit.
- **M-absent** : ancre absente lue comme 0 (au lieu de throw sur journal présent) ⇒ le test **ancre-absente** rougit.

**Tuyau (branchement)** : entrée = `persist()` du CLI (ancre-puis-journal, à chaque appel) ; sortie consommée = la
reprise au démarrage **et** le test d'intégration `bell_universe_cli_composes_from_file_to_artifact`
(`universe.test.ts:289-321`) qui **rejoue la composition de bout en bout**. **Durci (C-5)** : le test **relit le journal
écrit PAR le run** (jamais un journal fabriqué à la main), le re-dérive (`verifyChain.ok`), et fait **coïncider sa tête
avec la ligne head de `PROVENANCE-univers-solana.md`** produite ; l'appel `readPriorCalls` (`:304`) rend désormais
`{calls, head}` (la ligne 304 change). Un run suivant sur un ledger baissé throw. État = fichiers hors dépôt sous
`dirname(--ledger)`, `upcoming`. **Branché** (consommateur servi = la reprise + l'oracle d'intégration).

**Collatéraux à porter (sinon dette)** :
- **`appendFile` dans `RunDeps`** : `RunDeps.writeFile` (`universe-cli.ts:34`) **écrase** ⇒ le journal append-only exige
  un `appendFile` injecté (calque `appendFileSync`, `rebase-crosscheck.ts:597`) — ajouté à `RunDeps` (`:27-38`),
  `fileDeps` (`universe.test.ts:275-288`) et `main()` (`:238-244`), **enveloppé de la ceinture `scrubSecret`** comme
  `writeOut` (`:117`). (Alternative read-modify-write via `writeFile` : pas de changement d'interface mais un crash en
  ré-écriture tronque ⇒ affaiblit le write-ahead ; **non retenue**.)
- **Reader de reprise à valeur riche** : `readPriorCalls` rend `{calls, head}` (tête de chaîne) pour CONTINUER la
  chaîne — pas un simple nombre.
- **`persist()` no-op** : les `persist()` à `:162`/`:178` peuvent tirer avec `calls` inchangé ⇒ **skip-si-inchangé**
  (n'append que quand `budget.total()` a avancé depuis la dernière entrée) — déclaré (sinon entrées vides).
- **Provenance** : `provenanceMd` (`:185-199`) porte le head du ledger sous une **ligne de forme FIXE**
  `- ledger head sha256: <hex>` (audit **informatif** + cible **parsable** par le test de composition C-5, PAS un contrôle
  fail-closed) **et** une ligne `- identity_text_emptied: N` (compteur C-7, D2) ; **réordonner** pour que le `persist()`
  final précède l'écriture de la provenance (sinon head périmé d'une entrée, ordre actuel `:176-178`). `provenanceMd` gagne
  **deux paramètres** (head, `identity_text_emptied`) ⇒ **UNE** mise à jour de signature : l'appel `:177` **et** le test 17
  `:403` (`bell_universe_provenance_never_prints_operator_url`).
- **Ceinture C-G2-2** : le journal ajouté au scan « produced » de test 12 (`:308-319`) — domains/counts only, aucun url/clé.
- **`serializeLedger`** (`:155`) — **inchangé** si l'ancre garde `{calls}` ; le journal a sa propre sérialisation
  (`chainedEntry`). **Amendement daté du PLI §3** (pur ajout — le §3 décrit `budget.json {calls}` aujourd'hui).
- **Note cohérence (pré-empte un flag G2)** : le cœur de chaîne utilise `JSON.stringify(core)` dans l'ordre d'écriture
  (pour être **byte-identique** au calque -b3d `rebase-crosscheck.ts:144` — condition de CONV-1), tandis que le corps
  d'artefact utilise `canonical()` (`digest.ts:23-31`) ; divergence **assumée et déclarée**.

**Pièges (à éviter au G1)** : (i) **AUCUN nouveau flag CLI** — chemin du journal dérivé de `dirname(--ledger)` ; un
flag imposerait `KNOWN_FLAGS` (`universe-cli.ts:48-50`) **et** une 2ᵉ ré-enregistrement §6 (déjà un en attente au titre du
**checkpoint-2 C-3**, `docs/CHECKPOINT2-lot-t1a-iii-a1.md:145` — **distinct** du checkpoint-1 C-3 de ce pli ; noter aussi le
+1 GET de la sonde C-11, §3).
(ii) `readJsonl` d'etude-suite (`rebase-crosscheck.ts:421-425`) **n'est PAS** durci torn-line (celui de b3db1a l'est) ⇒
ici **fail-closed sur toute ligne illisible** ; la réparation torn-line est un **item de convergence** (CONV-1), pas un
demi-mécanisme livré. (iii) ordre d'écriture = **ancre-compteur d'abord** — un G1 qui inverse casse la conservativité au crash.

**R-25 [à mesurer]** : ledger inline universe.ts (~60-90) + `appendFile`/persist ancre-puis-journal universe-cli.ts
(~20-30) + provenance head + réordonnancement (~8) + tests (test 8 réécrit ~30-50, chaîne+reprise ~70-100, ceinture
+journal ~10, test 17 sig ~2) ≈ **~210-320**.

### D2 — C-G2-6 : `sanitizeIdentityText` sur `name`/`symbol` (sans faux-rejet mesuré)

**Cible** : `apps/bell/src/universe.ts:309-319` (`buildCandidateRecord`), champ `name`/`symbol` **:311** —
`sanitizeIdentityText` appliqué **AVANT** `assertOnlyAllowedFields` (`:305-308`) et `assertNoClose` (`:317`).

**Forme (déjà probée hors dépôt, PLI `docs/PLI-lot-t1a-iii-a1.md:107`)** : liste blanche `[A-Za-z0-9 .,&()+'-]` +
longueur ≤ 64 + refus de tout motif monétaire. **Forme EXACTE du refus « code devise » (C-7) = liste FERMÉE à frontières
de mot `\b(USD|EUR|GBP|CHF|JPY|CAD|AUD)\b`, insensible à la casse** (une forme ouverte `[A-Z]{3}` faux-rejetterait un nom
légitime) — **plus** `$` et `\d+\.\d+` ⇒ champ **vidé** (jamais tronqué à un sous-prix). **Sans faux-rejet mesuré sur les
8 `name` + 8 `symbol` de la fixture** `issuer-assets.json` (tous ASCII, < 64, sans `$` ni décimale — « Tesla xStock »,
« SP500 xStock », « Apple xStock », symboles `TSLAx`/`SPYx`… ⇒ **IDENTITÉ**, test 13 intact) et sur « 3M », « S&P 500 »,
« Moody's », « AT&T » ; vide « …420.69 », « $500 », « USD 12 », « 1.5x ». **Résidu déclaré (C-7)** : « **TSLA 420** »
(entier NU) **PASSE** — indissociable de « S&P 500 », « 3M », « SP500 xStock » ; résidu **borné** (valeurs issues de la
liste d'identité publique de l'émetteur ; rien de publié ce tour ; revue avant publication). Faux-rejet **déclaré** : un
nom légitime à décimale (« Fund 2.5 ») est vidé. **Compteur** : `provenanceMd` porte `identity_text_emptied=N` (D1) — une
course qui vide N champs est **visible**. Vider `name`/`symbol` **n'affecte pas** `foundingCalibration`
(`universe.ts:281-290`, clé = mint ; symboles lus depuis `XSTOCKS`), qui tourne AVANT la construction de l'artefact.

**Test non-LLM** : `bell_universe_identity_text_sanitized_no_false_reject` — la liste probée passe inchangée (0 faux-rejet) ;
les trois cas monétaires sont vidés ; un `name` porteur d'un prix injecté dans un candidat ⇒ champ vidé dans l'artefact.

**Mutant** : sanitizer no-op (retourne l'entrée) ⇒ le cas « prix injecté dans `name` » rougit.

**Vérification obligatoire (sinon test 13 casse)** : la fixture `expected-universe-candidates.json` est **inchangée** —
prouver que le sanitizer appliqué à **chaque** `name`/`symbol` de la fixture est **l'IDENTITÉ** (les trois conditions —
liste de caractères, ≤ 64, aucun motif monétaire — laissent la valeur inchangée). **Si ce n'est pas l'identité, test 13
(`bell_universe_artifact_byte_exact_replay`, `:324-330`) exige une régénération** — c'est un **signal rouge** (une
fixture porte un caractère hors liste, un nom > 64, ou un prix), à remonter, jamais régénérer en silence.

**Tuyau** : entrée = `buildCandidateRecord` ; sortie = artefact committable + le test d'intégration (l'artefact
produit ne porte aucun prix en valeur libre). État = artefact hors dépôt, `upcoming`. **Branché** (oracle
d'allowlist de champs `bell_universe_artifact_built_by_field_allowlist_no_price`, `:107-123`).

**R-25 [à mesurer]** : ~20-30 src + ~40-60 test ≈ **~60-90**.

### D3 — C-G2D-3 : test 22 ne sort jamais sur le réseau, même garde https régressée

**Cible** : `apps/bell/test/universe.test.ts:473-487` (test 22, `spawnSync` du vrai CLI) + nouveau shim
`apps/bell/test/helpers/no-network.mjs`.

**Forme** : `spawnSync(process.execPath, ["--import", pathToFileURL(shim).href, cli, "--out", …], {env, encoding})` —
le `--import` est un **argument du binaire node AVANT le script** (ce n'est **PAS** `execArgv`, une option de `fork()`
absente de `spawnSync`) ; sur Windows la forme `file://` (`pathToFileURL`) est requise. **Le shim bloque au niveau `net`
(C-8)** : `net.Socket.prototype.connect = () => { throw … }` (+ override `globalThis.fetch` en **ceinture** pour un message
clair — le `net` est le shim, `fetch` la ceinture). **Mesure [lu] (C-8, `F:\tmp\cp1-a1bis\`, Node 24.15.0)** : un shim
**fetch-seul** laisse `http.request`/`https.request` **tenter une connexion** (`ECONNREFUSED` = egress ouvert) ; le patch
`net` ferme **fetch/undici + https + http** (`SHIM: socket connect blocked`) ; contrôle sans shim ⇒ `ECONNREFUSED`
(tentative réelle). Node **retire `--import <url>` de `process.argv`** ⇒ `process.argv[1]` reste le CLI ⇒ la garde
`import.meta` (`universe-cli.ts:249`) **tire toujours** (mesuré : `argv[1]`=script, `argv.length`=3). **Garde de vacuité** :
le shim écrit `[no-network shim armed]` sur stderr au chargement ; test 22
**asserte** ce marqueur (sinon le stub pourrait ne pas être chargé et le test passerait vacuement).

**Test non-LLM (C-9)** : test 22 durci, **deux sous-cas déterministes sous code pristine** — (a) placeholder **`http`**
(non-https) ⇒ STOP au préflight (déjà VERT hors ligne, `docs/G2-DELTA-lot-t1a-iii-a1.md:112`) **et** marqueur shim présent
⇒ la STOP est prouvée **sans réseau réel** ; (b) placeholder **`https`** ⇒ le CLI **franchit le préflight** et **stderr
porte le throw du shim** (`SHIM: …`), **exit ≠ 0**, aucune connexion ⇒ **preuve EXÉCUTÉE que l'egress est fermé** SANS
rejouer C-G2-4a dans un sous-processus (la déviation consignée du G2-delta `:114-115` devient **inutile par construction**).

**Mutants (C-9)** : `--import` retiré ⇒ marqueur `[no-network shim armed]` absent ⇒ rouge (le stub n'arme pas) ; **et**
sous-cas (b) https ⇒ **pas de `SHIM:` sur stderr** ⇒ rouge (le shim n'est pas sur le chemin).

**Tuyau** : entrée = `spawnSync` du CLI ; sortie = assertion « 0 egress » indépendante du réseau ; état = test CI.
**Branché** (le test EST la preuve ; prérequis **AVANT** la prochaine campagne de mutants, PLI `docs/PLI-lot-t1a-iii-a1.md:154`).

**R-25 [à mesurer]** : shim ~15-25 + édits test 22 ~15-25 ≈ **~40-60**.

### D4 — C-G2D-1 : drain explicite des handles des tests à serveur (flag NON retiré)

**Cible** : `apps/harness/test/server.test.ts:81-83, :165-166, :179-181, :232-233` et
`test/byo-demo-probe.test.ts:177-179` — **ajouter `server.closeAllConnections()` AVANT chaque `server.close()`** dans
les blocs `finally` (calque `apps/bell/test/universe.test.ts:427`, test 18). **Test 18 est déjà drainé** (aucun
changement) ; **test 22 est `spawnSync`** (synchrone, aucun handle rémanent — aucun changement ; à dire).

**Le flag `--test-force-exit` reste** : verrouillé par `test/ci-gates.test.ts:1329` (assertion `scripts.test` doit le
porter ; commentaire de mutant `:1302-1303` : « drop --test-force-exit => red ») — backstop anti-hang mesuré porteur.
**Ne PAS le retirer** ; toute évolution de politique passe par un amendement ADR de V-1(b)/V-3.
*(Note : la mission/PLI citent `ci-gates.test.ts:1269` — **périmé** ; le verrou réel est `:1329`, le fichier a
glissé ; à corriger dans le PLI au pli.)*

**Test non-LLM / oracle (C-10)** : **honnêtement, aucun mutant déterministe ne rougit ici** (le flake est intermittent,
1/30, jamais isolé — `docs/G2-DELTA-lot-t1a-iii-a1.md:71-82`). L'oracle est (i) la **matrice discriminante G2-delta
re-jouée à ×100** (**puissance déclarée** : au taux observé 1/30, P(0 échec | rien changé) ≈ **0,034** ; **×30 ne
discrimine PAS** — P ≈ (29/30)³⁰ ≈ **0,36**) sous `--test-force-exit` = **0 échec** (contre 1/30 avant le drain) ; (ii)
une assertion **déterministe** `getActiveResourcesInfo()` en `finally` (aucun socket loopback rémanent après `close`).
Preuve = **absence de flake sur la matrice ×100 + l'assertion de handles**, pas un mutant.

**Tuyau** : entrée = tests à serveur sous force-exit en charge parallèle ; sortie = suite déterministe (CI verte) ;
état = infra de test. **Branché** (la CI complète est le consommateur ; pré-existence prouvée à `bfcc7cd`,
`docs/G2-DELTA-lot-t1a-iii-a1.md:99` — le lot n'introduit ni le flake ni le flag, il ajoute le **drain**).

**R-25 [à mesurer]** : ~5 lignes × 5 sites ≈ 15-25 + assertion `getActiveResourcesInfo` ~10 ≈ **~25-40**.
`error_origin` : worker (revendication sous-dimensionnée) ; cause racine infra **pré-existante** ; propriétaire orchestrateur.

---

## 3. Résidus laissés FORMÉS (zéro dette — raison ≠ R-25, déclencheur, propriétaire)

- **(5a) « page courte/vide prématurée ⇒ faux épuisement »** — **FORMÉ** (pas pour R-25). Une sonde **assertante**
  (« page+1 non vide ⇒ contradiction ⇒ STOP ») **exige de savoir ce que `/public/assets` renvoie PASSÉ l'épuisement**
  (tableau vide ? statut 4xx ?) — **[lacune]** : non mesuré de première main. Un 4xx passé-fin **entrerait**
  `withUniverseRetry` (`universe.ts:118-127`, qui retente **tout** sauf 403/Budget — 403→`Fatal403Error` `:122`) ⇒ 4
  retries puis throw ⇒ **casse tout run légitime**. La sonde **assertante** est donc **non sûre** sans ce fait (**reportée,
  CP1-Q4**). **Faille de la ceinture actuelle (C-11)** : la calibration « 4 fondateurs confirmés » (`universe.ts:281-290`)
  ne couvre qu'une fin prématurée **AVANT** la page des fondateurs (page 0 sur ~9, très probablement) — une **page courte
  à la page 3 PASSE la calibration**. **Décision (C-11) : ajouter à la course une sonde d'OBSERVATION seule** — après
  l'ancre de fin, un GET **`page+1`** via un **GET paçé dédié** `{maxRetries: 0}` (`pagedGet:125` hérite le défaut
  `maxRetries=4` ⇒ la sonde passe explicitement `deps.maxRetries=0`, `universe.ts:114`), en **try/catch**, **JAMAIS un
  STOP** — le catch **avale** HTTP/transport (y compris un 4xx passé-fin) et **re-jette** un `BudgetExceededError` (pas de
  fail-open budget) ; résultat (statut / forme : tableau vide, longueur, 4xx) écrit dans la provenance `past_end_probe=…`
  (aucun contenu) et **compté au budget (+1 GET)** — **amendement daté du PLI §6**. Elle **lève la [lacune]** lors de la
  première course **sans pouvoir la casser** ; 5a **reste FORMÉ** (la sonde assertante attend cette mesure). **Rattrapage
  actuel (fail-closed)** : un épuisement prématuré qui manque un fondateur ⇒ STOP sans artefact ; rien publié ce tour (tout
  `upcoming`) ; artefact re-dérivable du brut sha-pinné. **Déclencheur** : mesure [lu] passé-fin de `/public/assets` **avant
  la première publication**. **Propriétaire** : orchestrateur.
- **(5b) `digest.ts:96-97` `localeCompare` (même couplage locale que C-G2-1)** — **FORMÉ** ; **R-25 n'est PAS la
  contrainte liante**. `buildDigest` trie par `localeCompare` (`:96-97`, dépend de l'ICU/locale). Le modifier change
  l'ordre ⇒ le `bell_sha` de lots -b3a/-b3b/-b3d aux **digests gelés** ⇒ casse des shas pinnés ; **et** `digest.ts` est
  **édité en vol par -b3d-b1a** ⇒ conflit. La contrainte est le **gel des digests -b3 + le conflit b3d-b1a**, pas la
  taille. **Déclencheur** : avant tout **rejeu inter-machine** d'un digest -b3 (risque identique à C-G2-1 : g3
  ubuntu-latest vs poste dev). **Propriétaire** : orchestrateur (lot -b3 dédié, revue G2 propre).
- **(6) Reprise à mi-course non persistée (item a1-bis du PLI §3)** — **RESTE FORMÉ** (n'entre PAS ici). C'est une
  **capacité**, pas un défaut fail-closed : le comportement actuel est **sûr** (une reprise re-pagine et re-confirme
  sous le plafond résiduel, ou l'orchestrateur relance avec un ledger neuf `--max-calls` amendé — PLI §3
  `docs/PLI-lot-t1a-iii-a1.md:25`). L'entrer élargirait R-25 et **coupleraient la forme des entrées du ledger** (D1) —
  persister les readouts confirmés changerait le cœur chaîné. Le faire **après** que le ledger est proprement chaîné
  (D1) est le bon ordre : la reprise à mi-course **consommera** le ledger chaîné. **Déclencheur** : inchangé (un run
  s'arrête avec des mints non confirmés). **Propriétaire** : orchestrateur.

---

## 4. Harmonisation du ledger (fork TRANCHÉ au checkpoint-1 : γ-prime CONFIRMÉ ; hôte du format = `@monark/rpc-guard` ; FORMAT verrouillé par test C-3)

**Fait mesuré** : le calque chaîné existe **déjà sur etude-suite** dans `rebase-crosscheck.ts` — `LEDGER_GENESIS`
(`:110`), `LedgerEntry` (`:116-127`, spécifique-page), `chainedLedgerEntry` (`:136-145`), `ledgerSha` (`:147-149`),
`readPriorCalls` tamper C-G2D-2 (`:403-419`). **Mais `verifyLedgerChain` (re-dérivation indépendante, la « seule
preuve » que la chaîne engage chaque entrée) est une addition de b3db1a** (`F:\Monark-wt-b3db1a\...:173-182`) **NON
fusionnée** ; l'etude-suite `readJsonl` (`:421-425`) n'est pas durci torn-line non plus. Le `LedgerEntry` existant est
**spécifique-page** (`slot_lo`/`slot_hi`/`tail_sigs`/`list_sha256`) — **non importable tel quel** pour un compteur
d'APPELS.

**Trois voies** :
- **γ-prime (RETENUE — CONFIRMÉE CP1-Q1)** — inline dans `universe.ts`, **section délimitée**, **noms de champs et
  discipline de hachage IDENTIQUES** à `rebase-crosscheck.ts:110-149` (etude-suite) : `LEDGER_GENESIS = "0".repeat(64)`,
  `prev_entry_sha256`, `entry_sha256 = sha(JSON.stringify(core))` dans l'ordre d'écriture. `LEDGER_GENESIS` **redéclaré
  avec citation** (pas importé) : universe.ts **n'importe volontairement pas** `rebase-crosscheck.ts` en `src` (isolation
  — le fichier est édité par -b3d-b1a ; un import `src` créerait une surface de conflit et tirerait tout son graphe).
  **Verrou de format rendu FALSIFIABLE (C-3)** : le test `bell_universe_ledger_format_is_byte_identical_to_b3d` importe
  `LEDGER_GENESIS`/`chainedLedgerEntry`/`ledgerSha` **côté TEST seulement** (un import de test n'est PAS un couplage `src`)
  et asserte genesis + `entry_sha256`(cœur de page) + head == `ledgerSha` ; `sha` étant module-local (`:40`, non exporté),
  le test **reproduit** le hachage. Sans lui, « format verrouillé » n'est qu'un commentaire (D1, mutant **M-format**).
- **β (alternative checkpoint-1)** — module partagé `apps/bell/src/ledger-chain.ts`. **Écarté par défaut** : un module
  sous `apps/bell/src` **ne peut PAS être importé par `packages/rpc-guard`** (sens apps→packages), donc garde-helius
  devrait le **déplacer**, pas le consommer ⇒ β achète « un fichier de plus » sans acheter « un mécanisme partagé
  Bell + rpc-guard », et crée un module dont les 2ᵉ/3ᵉ consommateurs vivent sur une branche non fusionnée et un paquet
  non construit (architecture spéculative dans un « plan court »).
- **α (import direct)** — écartée : `verifyLedgerChain` n'est pas sur etude-suite, et le `LedgerEntry` disponible est
  spécifique-page (inadapté aux APPELS) ; importer imposerait la fusion b3d-b1a d'abord.

**La contrainte d'harmonisation réelle est le FORMAT, pas le fichier.** γ-prime verrouille le format (mêmes champs,
même hachage, même ordre compteur-puis-journal) ⇒ convergence sans réécriture quand les autres ledgers arrivent.
**Items de convergence formés (déclencheur + propriétaire)** :
- **CONV-1** : à la **fusion de -b3d-b1a**, le `verifyLedgerChain` de b3db1a (`:173-182`) et le `verifyChain` introduit
  ici deviennent **UN** vérifieur (pas deux) ; la réparation torn-line de b3db1a (`:477-497`) est portée au ledger
  universe. Propriétaire : orchestrateur.
- **CONV-2** : à **GARDE-HELIUS 1a** (`F:\tmp\garde-helius\G0-lot-garde-helius.md:113-128` : ledger de cycle chaîné,
  `verifyLedgerChain`, write-ahead — **même calque -b3d**), **l'hôte du format est `@monark/rpc-guard`** (tranché
  **CP1-Q2** ; G0 GARDE-HELIUS §3.2 déjà accepté ; décisions 112-114 : b3d-b1a avant garde-helius-1a) : `@monark/rpc-guard`
  **absorbe/promeut** le mécanisme de chaîne, **universe MIGRE** pour consommer le primitif canonique. **La règle « qui
  fusionne le premier héberge » est RETIRÉE** (CP1-Q2). **Ordre de fusion** : **a1-bis (ce lot, hors ligne) → b3d-b1a
  (CONV-1) → garde-helius-1a (CONV-2)** ; garde-helius est **aussi** un gate de la première course (G7
  `docs/G7-lot-t1a-iii-a1.md:18`). Propriétaire : orchestrateur.

**Ce que garde-helius ne duplique PAS** : son ledger est un **ledger de CYCLE** (crédits payants inter-runs, par
`(opérateur, méthode)`) ; le ledger universe est un **ledger de RUN** (APPELS, cap fail-closed, `budget.json` par
`--ledger`). Deux ledgers de contenus distincts, **UN** mécanisme de chaîne (le primitif tamper-évident). C'est le
mécanisme, pas le contenu, qu'on n'invente qu'une fois. **Unité du compteur (C-2)** : `calls_cumulative` = **ticks
logiques** — `pacedInner` (`universe-cli.ts:121`) met `withUniverseRetry` **SOUS** le tick ⇒ un retry n'incrémente PAS
(déjà attrapé au checkpoint-1 GARDE-HELIUS, `docs/CHANTIERS.md:487`). **Ce ledger de RUN sert la reprise sans double
compte et le cap de run ; il n'est PAS la source du rapprochement Chainstack** — le **ledger de CYCLE** (tentatives,
write-ahead) l'est. L'unité et la borne d'exposition (`--max-calls`) sont portées à l'amendement ADR (§10, C-2).

---

## 5. R-25 — projection et découpe

**Base = merge-base avec `lot/etude-suite`** (merge-base vivante ; HEAD etude-suite `5724f05` au pli) — **PAS cumulatif** avec les 1 195 de
-iii-a1 (déjà fusionnés). Pathspec `STAT=` de `.github/workflows/ci.yml:65` (plafond 1 205, `:43`) ; `docs/**/*.md`
exclus ; **`apps/bell/test/**` compté** (hors `series/`) ; **le shim `apps/bell/test/helpers/no-network.mjs` compté**.

| Livrable | Contenu | R-25 [à mesurer] |
|---|---|---|
| **D1** C-G2-7 | ledger chaîné inline + ancre-puis-journal + reprise fail-closed (`≥`, `verifyChain` monotone C-4) + provenance head + tests/mutants + **verrou format C-3** + **crash-sim C-6** | **~245-370** |
| **D2** C-G2-6 | `sanitizeIdentityText` (**forme devise C-7** + compteur `identity_text_emptied`) + test/mutant + preuve fixture = identité | **~65-100** |
| **D3** C-G2D-3 | shim `--import` **niveau `net` (C-8)** + test 22 durci **2 sous-cas (C-9)** + marqueur vacuité | **~55-80** |
| **D4** C-G2D-1 | drain `closeAllConnections` (5 sites) + assertion handles + **matrice ×100 (C-10)** | **~25-40** |
| **C-11** sonde | GET `page+1` d'OBSERVATION (`maxRetries:0`, try/catch) + `past_end_probe=` provenance | **~15-25** |
| **Total** | 5b/6 FORMÉS (0 ligne) ; 5a porte la sonde C-11 ; base ~335-510 **+ ~80** (C-3/C-6/C-9/C-11) | **~415-590** |

**Une seule PR** (< 1 205, marge large). **Déclencheur de découpe déclaré** (pas un oubli) : si le G1 mesure D1 >
~1 000, scinder **D1 seul** en `-iii-a1-bis-α` (ledger) et le reste en `-iii-a1-bis-β` — chacun gelé et re-mesuré.
PR petite et unitaire (R-25, `ci.yml:41`).

---

## 6. Risques MAST (checklist de risque résiduel, doc 06)

| Mode MAST | Risque ici | Atténuation (fichier/section) |
|---|---|---|
| **Incorrect-verification** | vérifieur de chaîne qui **relit** `prev_entry_sha256` au lieu de recalculer ⇒ mutant survivant (leçon -b3d `b3db1a:167-172`) | `verifyChain` **recalcule** `sha(core)` ; **M-chain** rougit (D1) |
| **Fail-open silencieux** | ledger baissé lu tel quel ; ancre absente ⇒ 0 ; ligne torn skippée | `ancre.calls < calls_cumulative` ⇒ throw (D1) ; **M-down/M-absent** ; torn-line ⇒ throw |
| **Spec-gaming / over-claim** | « non-falsifiable » (faux) ; « jamais un sous-compte » (faux) ; demi-mécanisme (checksum) déclaré tamper-evident | modèle de menace honnête « ledger propre de l'opérateur » + **write-behind ≤ 2 appels (C-1)** déclaré (D1, R-21) ; chaîne re-dérivable + `ancre.calls ≥ calls_cumulative` (**`≥`, pas `==`** C-4), pas un checksum ; exposition ≤ `--max-calls` |
| **Secret-leak** | url/clé Chainstack dans le nouveau journal/ancre | ceinture `scrubSecret` sur **chaque** écriture (`universe-cli.ts:117`, dont `appendFile`) ; journal au scan « produced » test 12 ; domains/counts only |
| **Terminaison prématurée** | faux épuisement (page courte, même APRÈS la page des fondateurs) présenté comme complet | FORMÉ (5a) — calibration 4 fondateurs (ne couvre PAS une fin après leur page) + **sonde d'OBSERVATION C-11** (`page+1`, `past_end_probe=`, JAMAIS un STOP) ; sonde assertante reportée [lacune passé-fin] |
| **Vérification incomplète** | prix dans `name`/`symbol` libre | `sanitizeIdentityText` avant l'allowlist (D2) + mutant no-op |
| **Egress non gardé** | test 22 sort sur le réseau si garde https régresse (fetch-seul laisse `http/https.request` sortir — mesuré C-8) | shim `--import` au niveau **`net.Socket.prototype.connect` (C-8)** + `fetch` en ceinture + marqueur vacuité + **2e sous-cas https (C-9)** (D3) ; egress fermé **prouvé sans réseau réel** |
| **Branchement / duplication** (règle investisseur) | 3ᵉ mécanisme de ledger non branché | format verrouillé (γ-prime) + CONV-1/CONV-2 (§4) ; universe consomme + test d'intégration rejoue la composition |
| **Step-repetition / concurrence** | deux runs universe sur le même dossier `--ledger` forkent le journal | **résidu NOMMÉ au PLI (C-12)** : run manuel mono-opérateur ; **déclencheur = verrou `openSync("wx")` à CONV-2** (calque GARDE-HELIUS cp-1 `(cycle,op)`, §3.3) |
| **Isolation / dépendance non fusionnée** | importer `rebase-crosscheck.ts` (édité par -b3d-b1a) | redéclaration citée, aucun import (§4) ; aucune modif hors `apps/bell` sauf le drain D4 |

---

## 7. Tuyaux déclarés (entrée / sortie / état / test — règle de Branchement)

| Pièce | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| ledger chaîné universe (`universe-budget-ledger.jsonl`, C-13) | `persist()` (ancre-puis-journal, chaque appel) | reprise `readPriorCalls`→`{calls,head}` au démarrage ; oracle d'intégration | hors dépôt (dossier `--ledger`), `upcoming` | `bell_universe_ledger_chain_rederives_and_refuses_downward_edit` (+ **crash-sim C-6**) + `bell_universe_ledger_format_is_byte_identical_to_b3d` (**C-3**) + `bell_universe_cli_composes_from_file_to_artifact` (**relit le journal du run, `verifyChain.ok`, tête==head provenance, C-5**) |
| `sanitizeIdentityText` | `buildCandidateRecord` | artefact committable (name/symbol assainis) | artefact hors dépôt, `upcoming` | `bell_universe_identity_text_sanitized_no_false_reject` + oracle allowlist de champs |
| shim no-network (test 22, niveau `net` C-8) | `spawnSync` du CLI | assertion « 0 egress » indépendante du réseau | test CI | test 22 durci — 2 sous-cas (a) http STOP préflight + marqueur, (b) https ⇒ `SHIM:` stderr, exit≠0 (**C-9**) |
| drain tests à serveur | tests à serveur sous force-exit | suite CI déterministe | infra de test | **matrice ×100** (puissance déclarée C-10) sous force-exit = 0 échec + `getActiveResourcesInfo` |
| convergence ledger (CONV-1/2) | ce format chaîné | b3d-b1a `verifyLedgerChain` ; `@monark/rpc-guard` | **item à déclencheur** (fusions) | (re-mesuré au lot de convergence) |

**Tout reste `upcoming`** : Bell absent de fleet/README/site/skills/export ; aucune pièce -iii-a1-bis n'a de chemin
servi ; consommateurs = reprise + oracles d'intégration + décision investisseur. Bell « built » à T-1b.

---

## 8. Rulings du checkpoint-1 (validateur `claude-fable-5-1` — questions TRANCHÉES)

Les six questions du plan initial sont **résolues** par l'avis (persisté `CHECKPOINT1-lot-t1a-iii-a1-bis.md` §6) :

- **CP1-Q1 — home du mécanisme de chaîne** : **γ-prime CONFIRMÉ** (inline universe.ts, format verrouillé, `LEDGER_GENESIS`
  redéclaré cité) **sous C-3** (le verrou de format devient un test) ; **β** (module `apps/bell/src/ledger-chain.ts`)
  **écarté** (non-importable par `packages/rpc-guard`, spéculatif) ; CONV-1/CONV-2 formés. (§4)
- **CP1-Q2 — hôte vs GARDE-HELIUS** : la règle « qui fusionne le premier héberge » est **REMPLACÉE** — **l'hôte est
  `@monark/rpc-guard`** (G0 GARDE-HELIUS §3.2 déjà accepté ; décisions 112-114) ; **universe MIGRE** à CONV-2. **Ordre de
  fusion : a1-bis → b3d-b1a (CONV-1) → garde-helius-1a (CONV-2)** ; ce lot fusionne **avant les deux** (hors ligne, gate de
  la course). (§4)
- **CP1-Q3 — ordre d'écriture** : **Design A CONFIRMÉ** (ancre-compteur d'abord, journal ensuite ; crash-conservateur) —
  **B non exigé** (un `head_sha256` dans l'ancre **ne bat pas** la réécriture coordonnée ⇒ l'exiger serait du spec-gaming),
  sous **C-1/C-2/C-4/C-6**. (§2 D1)
- **CP1-Q4 — page courte** : report de la sonde **ASSERTANTE** **confirmé** ([lacune] passé-fin de `/public/assets`) ;
  **sonde d'OBSERVATION EXIGÉE** (C-11 : `page+1`, `maxRetries:0`, try/catch, JAMAIS un STOP, `past_end_probe=`, +1 GET,
  amendement daté du PLI §6). (§3)
- **CP1-Q5 — mid-course resume** : **reste FORMÉ** (capacité, comportement actuel sûr ; le coupler au ledger chaîné
  **après** D1 est le bon ordre). (§3)
- **CP1-Q6 — forme C-G2D-3** : **shim `--import` CONFIRMÉ**, **au niveau `net`** (C-8) **avec le 2e sous-cas https** (C-9) ;
  piquet réseau « 0 hit » écarté (le shim est déterministe, aucun socket). (§2 D3)

**Verdict** : **ACCEPTE-AVEC-CORRECTIONS** — **C-1..C-11 bloquantes avant G1**, C-12/C-13 non bloquantes ; **aucune
ESCALADE-INVESTISSEUR** (pas de décision de valeur/périmètre ; la course reste gatée par l'investisseur, checkpoint-2 C-3).

---

## 9. Questions INVESTISSEUR

**AUCUNE question investisseur n'apparaît pour -iii-a1-bis.** Ce sous-lot est **code + tests offline** (aucun réseau,
aucun crédit, aucune publication). L'unique escalade investisseur du dossier — « toute exemption / tout tirage Helius
= escalade » (checkpoint-2 C-3, `docs/CHECKPOINT2-lot-t1a-iii-a1.md:14`) — est une **condition du GO de la course**,
pas de ce sous-lot ; elle ne se pose qu'au moment de lancer la course, après ce lot. (Le fork ledger et l'ordre vs
garde-helius sont des choix de **doctrine/architecture** ⇒ checkpoint-1, pas investisseur.)

---

## 10. ADR + provenance (règle de branchement — tuyaux déclarés de CE lot)

**Amendement daté à porter par l'orchestrateur** (worker rédige, orchestrateur porte, R-20) dans
`docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` (suite de D1-septies, **D1-septies-bis**) **ou** `ADR-B0` D5 :
(D-a) ledger de course chaîné tamper-évident γ-prime — format verrouillé (champs `prev_entry_sha256`/`entry_sha256`,
`LEDGER_GENESIS`, **ordre ancre-compteur-puis-journal**, head en provenance seule), **verrouillé par test (C-3)**, modèle
de menace « ledger propre de l'opérateur », **unité `calls_cumulative` = ticks logiques** et **exposition ≤ `--max-calls`
(C-2)** — **hôte du format = `@monark/rpc-guard`** (CP1-Q2) ; items de convergence CONV-1 (b3d-b1a) / CONV-2 (garde-helius
rpc-guard) ; (D-b) `sanitizeIdentityText` (allowlist de valeurs, **refus devise `\b(USD|EUR|GBP|CHF|JPY|CAD|AUD)\b`**,
faux-rejets + résidu « TSLA 420 » déclarés, compteur `identity_text_emptied`) ; (D-c) shim no-network test 22 **niveau
`net`** (C-8) ; (D-d) drain des tests à serveur (flag `--test-force-exit` conservé, verrou `ci-gates.test.ts:1329`) ;
MAST (§6) ; **table des tuyaux (§7)** ; `error_origin` : C-G2-6/7 worker + plan, C-G2D-1 worker (cause infra
pré-existante), C-G2D-3 worker ; **corrections checkpoint-1 C-1..C-13 `error_origin` = plan (RÉDACTEUR G0), sauf C-10/D4
= worker (cause infra pré-existante)**. **À porter au PLI par l'orchestrateur** : **amendement daté §6** = sonde d'observation
+1 GET (C-11) ; résidus nommés **concurrence multi-run** (C-12) et **nom de journal hors glob** `universe-budget-ledger.jsonl`
(C-13) ; **corrections de citation** `ci-gates.test.ts:1269 ⇒ :1329` et (avis/tâche, C-13) `rebase-crosscheck.ts:441-452 ⇒
:385-395` (`ledgerPagesOnDisk`/`hasResumeState`).

**Ce lot ne crée aucune dette nue** : chaque reste est un item formé à déclencheur — 5a (mesure passé-fin de
`/public/assets`), 5b (`digest.ts` au rejeu inter-machine -b3), 6 (reprise à mi-course post-D1), CONV-1/2 (fusions),
concurrence multi-run (harmonisée à CONV-2). Aucun papier introuvable (sources = fichiers du dépôt [lu]).

---

## RÉSUMÉ (12 lignes — plan PLIÉ checkpoint-1)
1. **Modèle** : `claude-opus-4-8[1m]` (R-1, préfixe conforme, effort max) ; RÉDACTEUR du PLI checkpoint-1 ; R-20 aucun commit/workflow ; hors ligne, aucun secret lu. **Verdict validateur (`claude-fable-5-1`) : ACCEPTE-AVEC-CORRECTIONS (C-1..C-13 ; C-1..C-11 bloquantes)**, aucune question investisseur.
2. **Objet** : clore les 4 corrections gatant la première course univers -iii-a1 (C-G2-7, C-G2-6, C-G2D-3, C-G2D-1), sans lancer la course ; tout `upcoming`.
3. **D1 (C-G2-7, ~245-370)** : ledger chaîné tamper-**évident** (γ-prime inline, format = calque -b3d `rebase-crosscheck.ts:110-149`, **verrouillé par test C-3**) — ancre-compteur `budget.json {calls}` **écrite D'ABORD**, puis journal append-only `universe-budget-ledger.jsonl` ; baisse ⇒ `ancre.calls < calls_cumulative` throw ; cohérence **`≥`, PAS `==`** + `verifyChain` monotone (C-4) ; **crash-sim C-6** ; mutant **recalcule**.
4. **Honnêteté R-21 (C-1)** : **write-BEHIND ≤ 2 appels** (persist en `finally` après 2 envois, `universe-cli.ts:159`) — PAS « jamais un sous-compte » ni « non-falsifiable » ; modèle de menace = « ledger propre de l'opérateur » ; Design B ne bat pas la réécriture coordonnée ; ancrage hors opérateur = **floor Chainstack déc. 115** ; exposition ≤ `--max-calls` (`collect.ts:296-306`).
5. **D2 (C-G2-6, ~65-100)** : `sanitizeIdentityText` (`universe.ts:311`) avant l'allowlist ; **refus devise `\b(USD|EUR|GBP|CHF|JPY|CAD|AUD)\b` (C-7)**, sans faux-rejet sur les 8+8 de la fixture (identité, test 13 intact), résidu « **TSLA 420** » (entier nu) déclaré, compteur `identity_text_emptied`.
6. **D3 (C-G2D-3, ~55-80)** : shim par `--import` **avant le script** (PAS `execArgv`) **au niveau `net.Socket.prototype.connect` (C-8, mesuré [lu] `F:\tmp\cp1-a1bis\` Node 24.15.0** — fetch-seul laissait `http/https.request` sortir) + `fetch` en ceinture + marqueur ; **2 sous-cas (C-9)** : http STOP préflight, https ⇒ `SHIM:` stderr exit≠0 ⇒ egress fermé prouvé **sans** réseau réel.
7. **D4 (C-G2D-1, ~25-40)** : `closeAllConnections()` avant `close()` (`server.test.ts:81/165/179/232`, `byo-demo-probe.test.ts:177`) ; flag `--test-force-exit` **conservé** (verrou réel `ci-gates.test.ts:1329`, non `:1269`) ; oracle = **matrice ×100 (C-10**, P≈0,034 ; ×30≈0,36 non discriminant) + `getActiveResourcesInfo()`, pas un mutant.
8. **Résidus FORMÉS** : 5a page-courte — **sonde d'OBSERVATION exigée (C-11**, `page+1`, `maxRetries:0`, JAMAIS un STOP, +1 GET, PLI §6) ; assertante reportée [lacune passé-fin] ; 5b `digest.ts:96-97` (gel digests -b3 + conflit b3d-b1a) ; 6 mid-course (capacité ; après D1).
9. **Harmonisation ledger** : γ-prime CONFIRMÉ ; **hôte du format = `@monark/rpc-guard` (CP1-Q2)**, universe MIGRE ; ordre a1-bis → b3d-b1a (CONV-1) → garde-helius-1a (CONV-2) ; **`calls_cumulative` = ticks logiques, ledger de RUN ≠ source du rapprochement Chainstack (C-2)**.
10. **R-25** : base merge-base `lot/etude-suite` (**non** cumulatif 1 195) ; total ≈ **415-590 ≤ 1 205** (base 335-510 + ~80 C-3/C-6/C-9/C-11), une PR ; découpe déclarée si D1 > ~1 000.
11. **Investisseur** : **AUCUNE** question — sous-lot offline ; l'escalade Helius est une condition du GO de course, pas de ce lot.
12. **Zéro dette** : 6 rulings CP1-Q1..Q6 **TRANCHÉS** (γ-prime, hôte rpc-guard, Design A, sonde d'observation, mid-course formé, shim `net`) ; C-12/C-13 non bloquants portés au PLI ; chaque reste = item formé à déclencheur ; sources = fichiers du dépôt [lu].
