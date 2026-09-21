# G2 (revue adversariale) — lot Bell T-1a-iii-a1 (univers Solana : identité + `ScaledUiAmount`, ZÉRO Helius)

- **Relecteur** : RELECTEUR G2, instance séparée à contexte frais (je n'ai PAS écrit ce code).
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, non banni, effort max).
- **Date** : 2026-09-21 (UTC, `date -u`). **Aucun appel réseau/RPC/API émis** ; tests lancés sous `env -u` de `CHAINSTACK_*`/`HELIUS_*` ; aucun secret lu ni imprimé ; rien écrit dans le worktree ; rien committé (R-20) ; rien sur C:.
- **Périmètre jugé** : worktree `F:\Monark-wt-univers`, branche `lot/t-1a-iii-a1`, base `bfcc7cd`, `cf07ee2` = pré-enregistrement SEUL, `c1418bf` = code G1 (HEAD). Rejeux sur copie `git archive c1418bf` → `F:\tmp\bell-univers\g2\tree\` (node_modules = symlink lecture vers `F:\Monark\node_modules`, aucun `npm ci` dans le worktree).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le code est fail-closed, isolé (7 fichiers, tous des ADDITIONS ; `pools.ts`/`XSTOCKS`/`collect.ts`/`discover.ts` intacts), et TOUS les oracles sont verts (494/494, typecheck, eslint, vocab, ratchet, export, lang, R-25 = 1 020 ≤ 1 205). Les 11 mutants nommés du worker sont rejoués RED. **Deux corrections bloquantes AVANT FUSION** (déterminisme du tri d'artefact ; assertion « secret » vacuité + ceinture de scrub manquante) et **deux bloquantes AVANT LE PREMIER APPEL RÉSEAU** (suivi de redirection ; schéma `http:`/non-URL admis) ; trois résidus à FORMER (zéro dette). Aucune n'est un échec de test sur cette machine ; deux propriétés « prouvées » se révèlent non testées, pas fausses.

---

## Défauts C-G2-n

### C-G2-1 — Tri d'artefact non déterministe entre environnements (couplage `localeCompare`) — **BLOQUANT AVANT FUSION**
- **Fichier:ligne** : `apps/bell/src/universe.ts:308` — `rows...sort((a, b) => str(a.mint).localeCompare(str(b.mint)))`.
- **Problème** : `localeCompare` (sans locale) dépend de l'ICU/locale du runtime ; `digest.ts:29` `canonical()` utilise DÉLIBÉRÉMENT le tri par unité de code pour le déterminisme. Le corps d'artefact (ordre du tableau `candidates`) et donc le sha256 pinné en provenance dépendent du collateur.
- **Mesuré** : l'ordre locale-par-défaut `(Xsb,Xsc,XsDo,Xso)` = le fixture gelé `expected-universe-candidates.json` ; le collateur POSIX/C `Intl.Collator("en-US-u-va-posix")` (ce que reporte l'ICU sous `LANG=C`/`C.UTF-8`, fréquent sur `ubuntu-latest`) donne l'ordre PAR UNITÉ DE CODE `(XsDo,Xsb,Xsc,Xso)`, **différent**. Mutant N-1 (localeCompare→unité de code) ⇒ `bell_universe_artifact_byte_exact_replay` RED.
- **Conséquence** : le rejeu à l'octet et le sha pinné sont contingents à l'environnement ; g3 (`ubuntu-latest`, CI de G7) PEUT échouer ce test, et un rejeu checkpoint-2 sur une autre machine peut diverger.
- **Correction minimale** : remplacer `localeCompare` par un comparateur par unité de code (`const x=str(a.mint),y=str(b.mint); return x<y?-1:x>y?1:0;`, même discipline que `canonical`) **ET régénérer** `expected-universe-candidates.json` (l'ordre bascule en `XsDo,Xsb,Xsc,Xso`).
- **error_origin** : worker.

### C-G2-2 — Assertion « secret » vacue sur la provenance + ceinture de scrub manquante — **BLOQUANT AVANT FUSION**
- **Fichier:ligne** : `apps/bell/test/universe.test.ts:304` (`assert.equal(prov.includes("deadbeef"), false)`) ; `apps/bell/src/universe-cli.ts:156` (écriture `provenanceMd(...)` SANS `scrubSecret`) ; `provenanceMd` `:164-165`.
- **Problème** : « deadbeef » n'apparaît nulle part (la const de test `CHAINSTACK` = `.../tk-node-key-placeholder`, `universe.test.ts:38`) ⇒ l'assertion est vacue ; la revendication CA-11 (commentaire `:302` « never prints the Chainstack url ») n'est PAS vérifiée. De plus l'écriture de la provenance n'a AUCUNE ceinture `scrubSecret` (contrairement à chaque `log()`) : la seule défense est que `provenanceMd` utilise par hasard une chaîne d'opérateurs fixe.
- **Scénario/mutant** : N-2 — `provenanceMd` interpole `providers[1]` ⇒ la suite universe reste **17/17 VERTE** (SURVIVOR) alors que la provenance produite contient l'URL Chainstack `tk-node-key-placeholder` (prouvé directement). *Le code GELÉ ne fuit PAS aujourd'hui (chaîne fixe) — le défaut est la garantie non vérifiée + la ceinture absente (R-21).*
- **Correction minimale** : (a) asserter l'absence du placeholder ET de `chainstack.com` sur une provenance produite avec un `providers[1]` en forme Chainstack ; (b) envelopper l'écriture de la provenance dans `scrubSecret(..., chainstack)`.
- **error_origin** : worker.

### C-G2-3 — Allowlist d'hôtes non appliquée aux REDIRECTIONS HTTP (chemin live) — **BLOQUANT AVANT LE PREMIER APPEL RÉSEAU**
- **Fichier:ligne** : `apps/bell/src/universe-cli.ts:186` (`liveHttpGet` → `fetch(url,{...})`) et `:196` (`liveRpcCall` → `fetch(url,{...})`) — **aucune option `redirect`** ⇒ défaut Node/undici `redirect:"follow"`.
- **Problème** : `assertHostAllowed` n'est vérifié que sur l'URL INITIALE (`universe-cli.ts:104` `pagedGet` ; `guardedRpcCall`). Un 3xx d'un hôte admis vers un hôte non admis est suivi automatiquement ⇒ le second saut atteint un hôte hors allowlist (et pour le POST RPC, y porte le corps de requête). « Refus AVANT l'envoi » est défait sur le saut redirigé. Non exerçable hors ligne (aucun réseau ce tour).
- **Correction minimale** : `redirect: "manual"` (ou `"error"`) sur les DEUX `fetch`, et traiter tout 3xx comme un ARRÊT DUR (une redirection est déterministe — ne PAS retenter ; re-`assertHostAllowed` sur le `Location` si un saut est un jour voulu).
- **error_origin** : worker.

### C-G2-4 — `assertHostAllowed` admet le schéma `http:` et des non-URL — **BLOQUANT AVANT LE PREMIER APPEL RÉSEAU**
- **Fichier:ligne** : `apps/bell/src/universe.ts:45-50`.
- **Mesuré (probe)** : `assertHostAllowed("http://api.xstocks.fi/x")` et `("http://api.mainnet.solana.com")` **ADMIS** (schéma non contrôlé) ; `assertHostAllowed("chainstack")` **ADMIS** (chaîne nue → `operatorOf` repli == "chainstack"). Inoffensif au `fetch` (hit en clair ou TypeError), MAIS : si `CHAINSTACK_SOLANA_URL` était mal réglée en `http://…`, la clé hex du chemin partirait EN CLAIR ; combiné à C-G2-3, une redirection pourrait rétrograder un hôte admis en `http:`.
- **Correction minimale** : dans `assertHostAllowed`, exiger `hostOf(url) !== ""` (rejet des non-URL) ET `new URL(url).protocol === "https:"` avant les branches littéral/opérateur ; ajouter un mutant.
- **error_origin** : worker.

### C-G2-5 — Bornes pré-enregistrées non encodées dans le parseur (fail-open sur faute de frappe) — **NON BLOQUANT (durcissement, à former)**
- **Fichier:ligne** : `apps/bell/src/universe-cli.ts:45-68` ; `num()` `:50` (accepte `>= 0`).
- **Mesuré** : (a) un flag inconnu/mal orthographié est silencieusement ignoré (`argOf` ne lit que les clés connues) ⇒ un `--max-pages`/`--min-interval` mal tapé retombe sur le DÉFAUT (maxPages **200** vs 20 pré-enregistré ; interval 286) ; (b) `--min-interval 0` est accepté ⇒ pacing désactivé. Le plafond 3,5 req/s et la borne 20 pages ne vivent QUE dans la commande tapée. Mutant N-4 (sleep de pacing retiré) **SURVIVOR** (aucun test ne couvre le pacing).
- **Correction minimale** : rejeter (fail-closed) tout token `--…` hors de l'ensemble de flags connus ; exiger `--min-interval >= 1` (ou le plancher pré-enregistré).
- **error_origin** : worker.

### C-G2-6 — L'allowlist de champs ne capture pas un prix dans une VALEUR libre — **NON BLOQUANT (résidu à FORMER)**
- **Fichier:ligne** : `apps/bell/src/universe.ts:294-304` (`name`/`symbol` recopiés verbatim du brut émetteur) ; `assertOnlyAllowedFields` `:290` ; `assertNoClose` `digest.ts:38`.
- **Problème** : les deux gardes portent sur les NOMS de champs (et valeurs numériques) ; un prix inséré dans `name` (ex. « Tesla xStock 420.69 ») passe (`CLOSE_KEY` ne matche pas « name » ; `isNumericLike` est faux sur une chaîne mixte). Risque théorique : les noms émetteurs observés ne portent pas de prix (`L-lecture…:303,308` name="Tesla xStock") et rien n'est publié ce tour — mais le résidu est UN-déclaré (le PLI §7/§12.3 présentent l'allowlist de champs comme LE mécanisme anti-close porteur, sans noter la faille valeur-libre).
- **Correction minimale** : soit retirer `name` (non porteur d'identité ; mint+owner+decimals le sont), soit ajouter un contrôle de densité numérique sur les champs libres, soit **DÉCLARER le résidu** dans le PLI (zéro dette).
- **error_origin** : worker.

### C-G2-7 — Le ledger accepte une édition À LA BAISSE (pas de tamper-evidence) — **NON BLOQUANT (résidu à FORMER)**
- **Fichier:ligne** : `apps/bell/src/universe.ts:132-139` (`readPriorCalls` accepte tout `calls >= 0` fini).
- **Problème** : un `budget.json` abaissé à la main sous-compte `priorCalls` et laisse une reprise re-dépenser au-delà du plafond 2 000 (leçon -b3d-a « ledger édité à la baisse »). Modèle de menace = le ledger propre de l'opérateur (protection anti-double-compte à la reprise), pas l'auto-sabotage ; fichier hors dépôt, contrôlé opérateur ⇒ résidu acceptable mais UN-déclaré.
- **Correction minimale** : DÉCLARER le résidu (ledger de confiance, non tamper-evident) dans le PLI, OU un contrôle monotone (ne jamais accepter un `calls` inférieur à une valeur observée antérieurement).
- **error_origin** : worker (conception).

### Observations mineures (pas des défauts)
- `assertOut` n'est appliqué que dans `main()` (`universe-cli.ts:209`), pas dans `runUniverse` : le chemin live est gardé (main asserte avant délégation), mais un futur appelant de `runUniverse` contournant `main` pourrait écrire dans le dépôt. Défense en profondeur.
- `liveRpcCall:199` lève un `Error` nu sur `json.error` (jamais `SolRpcError`) ⇒ `isSolRevert`/`ConcordantRevertError` inatteignables sur le chemin live ; une erreur de nœud déterministe est retentée 4× (pacée, non budgétée par conception PLI §3) puis benchée → `no_quorum`. Fail-closed et borné.
- Le scrub top-level de `main()` (`:225`) n'est pas exerçable hors ligne (une erreur porteuse d'URL n'apparaît qu'après le préflight, qui exige Chainstack ⇒ le pas suivant serait un vrai GET). Résidu.

---

## Confirmations POSITIVES (axes de la mission — PASS)

1. **Allowlist d'HÔTES** : `mainnet-beta`, publicnode, GeckoTerminal, CoinGecko REFUSÉS (test 6). Sous-domaine trompeur `evil-api.xstocks.fi` / `api.xstocks.fi.evil.tld` refusé (comparaison hostname exacte). Look-alike « chainstack » : `evil-chainstack.com`, `chainstack.com.evil.tld` REFUSÉS ; seuls les vrais `*.chainstack.com` / `*.p2pify.com` admis via `operatorOf` (`providerOf` = deux derniers labels, `sentinel/src/rpc.ts:28-36`). Casse : `hostOf` en minuscules. IDN→punycode ne matche pas l'allowlist ASCII. Chainstack admis PAR OPÉRATEUR, pas par env brut (`CHAINSTACK_SOLANA_URL=https://evil/x` refusé, test 6). `user@host` : hostname réel extrait. Port : hostname sans port (même hôte). Mutant N-3 (admettre `*solana*`) RED. *(Faille : `http:`/non-URL — C-G2-4 ; redirections — C-G2-3.)*
2. **Allowlist de MÉTHODES** (`getAccountInfo` seul) : batch impossible (méthode = argument unique, corps mono-requête `{jsonrpc,id,method,params}`) ; « méthode dans un champ inattendu » impossible (méthode = arg explicite, codée en dur `quorum.ts` accessor). Mutant W7 RED.
3. **Anti-close par allowlist de CHAMPS** : pick explicite + `assertOnlyAllowedFields` (mécanisme porteur, pas strip) ; aucun couple prix-dérivable (les DEUX jambes hors liste) ; `supply`/`multiplier` du brut RPC n'entrent jamais (test 3, fixture `rpc-getaccountinfo.json` les porte). Brut émetteur HORS dépôt (`assertOut` sur le chemin live ; subprocess cas 2 « under the repo root »). Les 3 fixtures 100 % synthétiques SAUF les 4 adresses fondatrices publiques (TSLAx/SPYx/NVDAx/AAPLx == `pools.ts:91-98` == `L-lecture…:83-86`). *(Faille valeur-libre — C-G2-6.)*
4. **Oracle de calibration** : 4 fondateurs présents + adresse identique (clé de Map) + owner Token-2022, sinon STOP sans artefact (tests 2/14 ; mutant W2 RED). **C1 mint ≠ token account** (`isMint`, test 1 `:62-63` ; mutant W1 RED). Désaccord ⇒ `unverified` jamais tranché (test 5 ; W5 RED). Miss ⇒ `scaled_ui_unread` (test 4 ; W4 RED). Préflight « deux opérateurs DISTINCTS » AVANT toute page (test 15 ; subprocess cas 3 : aucun dossier ni fichier créé).
5. **Budget** : fail-closed en APPELS, offset `priorCalls` (M17), ledger absent⇒0 / malformé⇒throw / invalide⇒throw, jamais re-genesis (test 8 ; W8/W9 RED). Reprise re-consomme mais le plafond 2 000 TIENT (offset `total()=priorCalls+calls()`). Retries ne re-tickent pas (`makeBudgetedCall` tick 1×/appel, `collect.ts:296-306`). `Retry-After` honoré + borné 60 s (test 9) ; 403 arrêt dur (`Fatal403Error` ⊂ `BudgetExceededError`, W10 RED) ; 429-streak STOP (boucle `confirm`, `universe-cli.ts:130-139`). **Débit** : `quorum2` SÉQUENTIEL (`quorum.ts:81` for-await) ⇒ chaque appel précédé de 286 ms ⇒ agrégat ≤ 3,5/s, ≈ 1,75/s par opérateur ⇒ sous 40 req/10 s (4/s) par RPC, sans rafale (tout sérialisé). **API > 811 / plus de mints** : pagination STOPpe à `--max-pages` sans ancre (throw), ou `BudgetExceededError` en cours de confirmation = STOP propre.
6. **Pagination à épuisement** : preuve par ancre de fin (`page < pageSize`) + index monotone + zéro id dupliqué ; doublons ⇒ throw ; `--max-pages` atteint ⇒ throw (jamais d'artefact partiel) (tests 11/11b ; W11 RED). *Résidu noté : une page courte/vide PRÉMATURÉE ⇒ faux épuisement (partiellement rattrapé par la calibration pour les 4 fondateurs).*
7. **Pré-enregistrement** : H1-H4 falsifiables sans chiffre attendu d'article ; critères d'arrêt ; liste committable ; commande cohérente avec le code (unités ms, défauts) SAUF flags inconnus/`--min-interval 0` (C-G2-5) ; PLI committé SEUL en `cf07ee2` (68 lignes, 1 fichier) AVANT le code `c1418bf` (`git log` vérifié).
8. **Secrets** : `scrubSecret` par secret exact + regex URL chainstack/p2pify, testé par motif + longueur (test 10) ; `statusOf` scrub en « HTTP <n> » (`quorum.ts:52-59`) ; ledger/brut ne portent aucune URL ; `no_secret_in_repo` VERT (placeholder de test non-hex, `universe.test.ts:36-38`). *(Faille provenance — C-G2-2.)*
9. **CA-11 durci** : composition depuis un fichier fixture → artefact via `runUniverse` (test 13) + rejeu à l'octet (test 14) ; **le VRAI point d'entrée process (`main()`) vérifié fail-closed sur 3 chemins PRÉ-réseau** (subprocess : no-args, `--out` in-repo, Chainstack absent ; guard `import.meta` OK sous Windows). Le chemin `main()`→artefact reste non exerçable hors ligne (toute erreur au-delà du préflight = vrai GET) — même résidu que le scrub top-level (observations mineures). `pools.ts`/`XSTOCKS`/`collect.ts`/`discover.ts` INCHANGÉS (`git diff --name-status bfcc7cd..c1418bf` = 7 ADD).

---

## Tableau des mutants (rejeu ; restauration byte-exacte vérifiée, jamais `git checkout`)

Shas pristine (ancre de restauration, re-vérifiés après chaque mutant) :
`universe.ts` = `d687be747408b78b96ccc60127dd7ad92542f02943e5689af4369fd27f1e3ebd` ;
`universe-cli.ts` = `1bb7210ebb76a1c9e9cdc1d11e8a2a9f4b7ac39cf382565773a1850d97958fcd`.
Note : la liste G1..G14 du worker n'est pas au dépôt (G1 rendu en texte) ; les mutants W* sont reconstruits des 9 puces nommées `universe.test.ts:4-12`.

| Mutant | Injection | Test attendu RED | Résultat |
|---|---|---|---|
| W1 | owner≠Token-2022 admis comme `confirmed` | test 1 (+13,14) | **RED (caught)** |
| W2 | `foundingCalibration.ok` toujours vrai | test 2 (+15) | **RED** |
| W3 | champ `price_usd` ajouté à `CANDIDATE_FIELDS` | test 3 | **RED** |
| W4 | miss (`no_quorum`) sans `scaled_ui_unread` | test 4 | **RED** |
| W5 | désaccord tranché (`confirmed`) au lieu d'`unverified` | test 5 | **RED** |
| W6 | `assertHostAllowed` n'échoue jamais | test 6 (+16) | **RED** |
| W7 | `assertMethodAllowed` n'échoue jamais | test 7 | **RED** |
| W8 | `total()` sans offset `priorCalls` (M17) | test 8 | **RED** |
| W9 | `readPriorCalls` retourne 0 (M15 re-genesis) | test 8 (+13) | **RED** |
| W10 | 403 retenté au lieu d'arrêt dur | test 9 | **RED** |
| W11 | épuisement non exigé (`if(false) throw`) | test 11b | **RED** |
| **N-1** (neuf, déterminisme) | `localeCompare` → tri unité de code | test 14 | **RED (prouve le couplage locale ⇒ C-G2-1)** |
| **N-2** (neuf, secret) | `provenanceMd` interpole `providers[1]` | (aucun) | **GREEN — SURVIVOR ⇒ C-G2-2** |
| **N-3** (neuf, allowlist hôtes) | `assertHostAllowed` admet `*solana*` | test 6 (+16) | **RED (robustesse OK)** |
| **N-4** (neuf, débit) | pacing `--min-interval` retiré | (aucun) | **GREEN — SURVIVOR ⇒ C-G2-5** |

Bilan : 13 RED / 2 SURVIVORS (N-2, N-4) — chaque survivant est un défaut formé ci-dessus.

---

## Oracles (suite COMPLÈTE, copie `c1418bf`, `env -u CHAINSTACK_*/HELIUS_*`)

| Oracle | Commande | Résultat |
|---|---|---|
| Tests (complet) | `npm test` (`node --test`, tous globs) | **494 pass / 0 fail / 0 skip** (35,8 s) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | exit 0 |
| ESLint | `npm run lint` (`eslint .`) | exit 0 |
| Ratchet | `npm run lint:ratchet` | 69/69 (plafond committé) |
| Vocab | `npm run gate:vocab` | OK — 178 fichiers |
| Export | `npm run export:check` | OK — 0 chemin interdit |
| Lang | `npm run lang:gate` | OK — 0 hit FR |
| no_secret_in_repo | `test/no-secret-in-repo.test.ts` | VERT (dans les 494) |
| series_pinned_are_declared_and_hashed | `test/ci-gates.test.ts:1142` | VERT (dans les 494) |

*(Note : `bell_universe_artifact_byte_exact_replay` passe sur CETTE machine ; C-G2-1 documente sa dépendance à la collation ICU du runtime — g3 `ubuntu-latest` à vérifier au G7.)*

## R-25
`git diff --shortstat bfcc7cd...HEAD` avec la pathspec `STAT=` exacte de `.github/workflows/ci.yml` (docs `.md` exclus ; fixtures `series/**` exclues ; **fixtures `universe/**` COMPTÉES car hors `series/`**) :
- **1 020 insertions (ins+del) ≤ 1 205** — conforme à l'annoncé 1 020. Décompte : universe-cli 228 + universe 339 + expected 1 + issuer-assets 30 + rpc 64 + test 358 = 1 020 (+ PLI 68 exclu = 1 088 brut). PR petite et unitaire (R-25). 7 fichiers, tous ADD.

## Items formés (zéro dette — à porter par l'orchestrateur au pli)
- C-G2-6 (prix en valeur libre) et C-G2-7 (ledger tamper) : **résidus à DÉCLARER** dans le PLI, ou corriger.
- Résidu « page courte/vide prématurée ⇒ faux épuisement » (axe 6) : à déclarer (rattrapé partiellement par la calibration).
- C-G2-5 : durcir le parseur (flags inconnus + `--min-interval` plancher) avant la course.
