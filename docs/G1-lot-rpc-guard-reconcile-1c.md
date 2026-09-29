claude-opus-5-5[1m]

# G1 — RPC-GUARD-RECONCILE-1c HOST (lot rpc-guard RPC-GUARD-RECONCILE-1, ADR-RPC-GUARD-RECONCILE-1 D-3, D-5) : contrôle d'hôte structurel du premier élément de `BELL_SOLANA_RPC` avant `?api-key=` (RPC-GUARD-HELIUS-HOST-1)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort max (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-rg1c.md` (6 l., sha256 `e951ed3d1e7024a463d16fb5f1fdf059f6f24f5c2fd7e35e29f54fb9ba199818`, préfixe égal à celui de la tâche), texte calculé par le script de l'orchestrateur, lu comme tel ; `date -u` à l'ouverture : 14:23:18Z.
- **Base / HEAD** : worktree `F:/Monark-wt-rg1c`, branche `lot/rpc-guard-reconcile-rg1c`, HEAD `72214c974d230f27aa6023d7dbea69706b1b539d` ; **arbre propre à l'ouverture** (`git status` : « nothing to commit, working tree clean » à 14:23:18Z ; `status --short` : 0 ligne à 14:33:23Z, `F:/tmp/dojo/rg1c-work/open.txt`). Aucun autre worktree écrit.
- **Processus `node` (C-V-4)** : 38 à 14:32:48Z, 31 à 14:33:23Z (verrou d'hôte alors tenu par « G2 DRAND-1a ») ; à la prise et au rendu du verrou de l'oracle : §9.
- **Advisor** : l'outil intégré, appelé après l'orientation et avant toute écriture, a répondu « temporarily overloaded » avec consigne de ne pas le rappeler dans ce tour : **indisponibilité consignée, non contournée** (§15).

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 14:23:18Z → 14:33:23Z | mission (sha256 vérifié) ; worktree, HEAD, arbre propre ; ADR de lot en entier (166 l.) ; `transport.ts`, `guarded.ts`, `client.ts`, `tariff.ts` (tables), `lock.ts`, `ledger.ts` (`ensureCycleDir`), `classify.ts` (`ERROR_HINT_TOKENS`) ; tests `exports`, `harness.ts`, `ledger-format-lock`, `error-hint` l.1-30 et l.145-175, `transport-hardening` (structure) ; `bell-keys.test.ts` l.1-20 et l.145-180 ; journal G1 DRAND-1a en entier et son outillage ; diff DRAND-1a de `transport.ts` et `exports.test.ts` (lecture seule) ; recensement des 28 fichiers qui portent `BELL_SOLANA_RPC` ; gardes racine `fetch_only_inside_client`, `no_secret_in_repo`, `no_cash_cross_provider_name_in_export` ; gates vocabulaire et langue ; FAITS RFC 6761 ; `launch-q6.sh` l.20-24 et l.43-47 ; rapport cp-1 et journal G0 (lignes 1c) ; `run.ts` de Sentinel (classement des erreurs d'ouverture) et `collect.ts` de Bell et du Dōjō (appels d'`openGuardedClient`) |
| 14:3xZ | advisor intégré : surchargé (consigné, §15) |
| 14:33:23Z → 14:36Z | faits WHATWG mesurés (`url-facts.mjs`, `url-facts.txt`) ; `transport.ts` (5 éditions à ancre exacte), `guarded.ts` (2), `helius-host.test.ts` écrit, `exports.test.ts` (2) |
| 14:37Z → 14:38:41Z | `mk-nm.ps1` sur le worktree (`entries: 220  monark: 10  fail: 0`) ; les deux fichiers de test 6/6 ; suite `packages/rpc-guard/test` 100/100 ; `bell-keys` + `error-hint` 24/24, les deux tests nommés ✔ |
| 14:38:53Z → 14:40:00Z | `tsc --noEmit` exit 0 ; `eslint` des quatre fichiers exit 0 ; règles du cliquet sur les deux fichiers de test : 0 ; `lang-gate` OK ; `gate:vocab` OK ; `lint:ratchet` 69/69 (worktree) ; 0 CR, 0 caractère hors ASCII |
| 14:40:09Z | R-25 = 137, au-delà de l'enveloppe 132 de la mission : resserrement sans retrait de cas (§5) |
| 14:4xZ → 14:42:09Z | bloc helius restructuré (lignes de la base gardées à l'identique), commentaires resserrés ; suite 100/100, `tsc` 0, `eslint` 0, cliquet 0 ; **R-25 = 121** |
| 14:43:24Z → 14:45:33Z | arbre des mutants (`git archive 72214c9`, quatre fichiers du lot copiés, `cmp`) ; `mk-nm.ps1` ; passe 1 : 20 joués, 19 tués, E-1 survit (équivalent déclaré) |
| 14:46:20Z → 14:46:34Z | passe 2, qui fait foi (21 joués, P-H11 ajoutée) : 20 tués, E-1 survit ; fichiers dorés égaux au sha256 |
| 14:47:26Z → 14:48:54Z | clone jetable de l'oracle (`--no-local`, HEAD `72214c9`) ; `mk-nm.ps1` ; cliquet sur le clone **vierge** : 69/69 ; quatre fichiers du lot copiés (sha256 égaux au worktree) |
| 14:49:02Z | oracle lancé en fond, verrou demandé (tenu par « G2 PR-3b-1 » depuis 14:43:24Z) |
| 14:49:12Z → 14:50:20Z | tests du lot, deux passages (22/22 chacun) ; `lot.diff`, `greps.txt` ; fusion à blanc textuelle avec DRAND-1a : 0 conflit sur les deux fichiers communs (§11) |
| 14:5xZ → 14:57:45Z | journal rédigé pendant l'attente du verrou ; R-25 sur le clone synchronisé : 121, sortie identique (14:55:27Z) ; `closedHint` du message de refus : `""` ; `no_secret_in_repo` sur le worktree ✔ (14:57:40Z) |
| 14:58:03Z → 15:07:12Z | verrou pris après 540 s (27 `node.exe`) ; sept gates : 7/7 exit 0 ; `test` 1 442 tests, 1 439 pass, 0 fail, 3 skipped ; `lint:ratchet` 69/69 |
| 15:07:13Z → 15:14:03Z | test 42 seul : 2/2 ; verrou rendu (26 `node.exe`) |
| 15:14:36Z → 15:15:30Z | jonctions des deux arbres jetables retirées ; `F:/Monark/node_modules` intact ; aucun processus restant ; `git status --short` final |
| 15:1xZ | §9, §14 et §16 complétés ; livraison `F:/tmp/dojo/rg1c-deliver/` |

## 1. Sources (niveau) et entrées

- **[lu]** ADR `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` (166 l., sha256 `45ac97e226272c66d7b01d1986471d76b96aec4c3206e429287b580d4db9b4ab` = `git show 72214c9:<chemin>`), en entier ; le « Pli cp-1 » (l.156-165) et les lignes datées priment : C-V-4 (FAITS-RFC6761-INVALID-1 clos 14:07:53Z), décision 255 (1c part en parallèle de 1a et 1b depuis `1e179d2`), réponses Q-O1 à Q-O7 (l.154 ; pour 1c : Q-O3 « 1c indépendante », Q-O6 « `.invalid` admis, pièges socket/DNS conservés »).
- **[lu]** FAITS `docs/dojo/FAITS-rfc6761-invalid-2026-09-27.md` (7 l., sha256 `f3c2cd92ebcf15d66b14874f46a2b2ab7035211d6c9f0ddfa0aca51d4e837731`) : RFC 6761 §6.4 (1), (3), (4) ; « SHOULD, pas MUST » ; pièges conservés. Couverture partielle de l'item de l'ADR §4 : Q-5.
- **[lu]** `apps/bell/ops/launch-q6.sh:45` : `HELIUS_ENDPOINT='https://mainnet.helius-rpc.com/'` (l'hôte de production, fichier commité, sans clé) ; l.23 : retrait de `NODE_TLS_REJECT_UNAUTHORIZED` et `NODE_EXTRA_CA_CERTS`.
- **[lu]** code de base, sha256 avant : `transport.ts` `64a84454b8e8acd8c9f1cbb6347e0dc174f3a695573fa2d8ddbedbdbeb17385e` (égal au journal G0 l.52), `guarded.ts` `a36fa005360cd4eae5f203b6f61771f24f3bc5deff3e4c8a5a3270ffb0b7fab6`, `exports.test.ts` `8e69ccd545e9505fe8dc04197bb101e4f50463635b7d02cdfd5bfcb7fd8a37a8`, `harness.ts` `9188c606…c6b3`, `index.ts` `db2908e9…c5c8`, `ledger-format-lock.test.ts` `699546fd…c9d4` (ces trois derniers inchangés).
- **[lu] Recensement des valeurs de `BELL_SOLANA_RPC`** dans le code et les tests (`grep`, 28 fichiers hors `docs/`) : toutes les bases passées au garde sont en `https`, sans userinfo, requête, fragment ni port (certaines avec un chemin), en `.invalid` (`example.invalid/HELIUS`, `helius.example.invalid/RPC`, `sol.example.invalid`, `rpc.example.invalid`, `helius.invalid`, `helius.dojo.invalid`) ou `https://mainnet.helius-rpc.com` (listes `PROVIDERS` de Bell), sauf `not-a-url-scheme` (`exports.test.ts:79`, amendé). `bell-ops.test.ts:42` (requête `?api-key=`) n'est qu'une chaîne plantée pour un scanner, jamais passée au garde ; `universe.test.ts:49` passe sa liste à `confirmMintIdentity`, pas au garde. Aucun test ne compare la chaîne exacte envoyée à `fetch` pour helius (le bouchon du Dōjō, `collect-chain.ts:69`, analyse l'URL et lit l'hôte).
- **[lu]** consommateurs de `resolveOperators`/`operatorLabels` : `guarded.ts:26`, l'épingle de Bell (`bell-keys.test.ts:154`, hôte `.invalid`), `error-hint.test.ts:156` (hôte `.invalid`), tests du paquet (`.transport` seul) ; le type `Resolved` n'est employé qu'à `transport.ts`. Appelants d'`openGuardedClient` qui demandent helius : `apps/bell/src/collect.ts` (erreur propagée) et `apps/dojo/src/collect.ts:126-128` (seul `LockHeldError` est converti, le reste est relevé) ; Sentinel ne demande jamais helius (`run.ts:244` classe « not resolved from env » en `unconfigured`, sans objet ici).
- Précédents lus, non copiés : `resolveGetUrl` (contrôle structurel d'un hôte GET, `transport.ts` l.198-206 de la base), `secretTargets` (l.139-151), P6 (`exports.test.ts:15-31`), pièges socket et DNS (`apps/dojo/test/helpers/collect-chain.ts:14-15`, `drand-labels.test.ts:16-17` de DRAND-1a).

## 2. Interfaces

```ts
// packages/rpc-guard/src/transport.ts (le seul module à URL)
const HELIUS_ADMITTED_HOSTS: readonly string[];            // PRIVÉE : ["mainnet.helius-rpc.com"] (l.26, près de HELIUS_CYCLE_CAP_CREDITS l.22)
function admittedHeliusUrl(base: string): URL | undefined; // PRIVÉE (l.29-35) : une analyse, contrôle structurel, jamais d'exception ni d'écho
export interface Resolved { ...; readonly refused: Readonly<Record<string, string>> } // libellé -> motif fixe, jamais l'URL (l.95)
// resolveOperators (l.112-119) : refusé => refused.helius = "BELL_SOLANA_RPC host not admitted (fail-closed, RPC-GUARD-HELIUS-HOST-1)",
//   helius sans url ni classe ; admis => searchParams.set("api-key", clé) sur l'objet contrôlé, urls.set("helius", href)
// packages/rpc-guard/src/guarded.ts
// openGuardedClient, boucle du sous-ensemble (l.33-34), avant assertLimits et avant la boucle des verrous (acquireLock l.46) :
//   throw new Error(`rpc-guard: operator '${label}' refused: ${why}`)
```

`index.ts` inchangé : aucun symbole public nouveau (`public_export_set_is_closed` inchangé, vert).

## 3. Fichiers (modifiés ou créés ; aucun autre)

| Fichier | État | Lignes | `git diff --numstat 72214c9` | sha256 |
|---|---|---|---|---|
| `packages/rpc-guard/src/transport.ts` | modifié | 281 | 23 3 | `25c92541e6f278c9febdc54b5e36e15435cb9161d20bbc8711b98379231f7b57` |
| `packages/rpc-guard/src/guarded.ts` | modifié | 63 | 4 1 | `55054b37f3b9f4021102bee9f9e9f2b29e632931226a54217040ddc9a380aba6` |
| `packages/rpc-guard/test/helius-host.test.ts` | créé (test (12)) | 78 | (non suivi) 78 | `d8fa37eb581d5b6b85fb801a2747e58426a928001eff10fc2b930d3699dcba67` |
| `packages/rpc-guard/test/exports.test.ts` | modifié (amendement de D-3, import de type) | 93 | 9 3 | `b288b0a9e3fdf38d672a5d2f53a53c87fc26e2182d41541c80319a66d830413d` |
| `docs/G1-lot-rpc-guard-reconcile-1c.md` | créé (ce journal, hors R-25) | — | — | rendu hors du fichier |

- Gelés, `git diff --stat 72214c9` vide : `client.ts`, `ledger.ts`, `reconcile.ts`, `cli.ts`, `lock.ts`, `tariff.ts`, `index.ts`, `harness.ts`, `ledger-format-lock.test.ts`, `apps/**`, `docs/adr/**`, FAITS, `package*.json`, `tsconfig.json`. Aucune dépendance, aucune fixture.
- 0 octet CR, 0 caractère hors ASCII dans les quatre fichiers (mesuré par `node`).
- `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore`), à retirer par `rm-nm.ps1 -Tree F:\Monark-wt-rg1c` si l'orchestrateur le veut.

## 4. Choix déclarés (jamais silencieux)

1. **Message et préfixe.** Levé : `rpc-guard: operator 'helius' refused: BELL_SOLANA_RPC host not admitted (fail-closed, RPC-GUARD-HELIUS-HOST-1)`. La citation de D-3 en est le suffixe exact ; le préfixe `rpc-guard: ` est celui de toutes les erreurs de `guarded.ts`. Le motif fixe vit dans `refused.helius` (`transport.ts`) ; `guarded.ts` compose le message pour tout libellé refusé, sans rien de propre à helius. Aucun jeton de `ERROR_HINT_TOKENS` dans le message : `closedHint(message)` rend `""` (`hint-of-refusal.txt`). Q-1.
2. **Un seul enregistrement analysé.** La clé est posée par `searchParams.set` sur l'objet `URL` même qui a été contrôlé, et c'est son `href` qui est gardé (avec ou sans clé) : la chaîne remise à `fetch` est la sérialisation de ce qui a été contrôlé. Pour la base de production `https://mainnet.helius-rpc.com/` (launch-q6.sh:45), la chaîne est celle de l'ancienne concaténation (asserté par le test (12)). Pour une base sans barre finale (listes `PROVIDERS` de Bell), elle devient `…/?api-key=` au lieu de `…?api-key=` : même requête (`fetch` normalise), et aucune chaîne de ce genre n'est comparée par un test (§1). Sans clé : `href` (barre finale ajoutée), jamais comparé non plus.
3. **Règle sous la forme littérale de D-3** (champs de l'URL analysée). Conséquences mesurées (`url-facts.txt`) : `?` et `#` nus donnent `search` et `hash` vides, donc sont admis (la clé remplace la requête vide ; un fragment n'est jamais envoyé) ; `:443` est normalisé en port vide, donc admis (même point d'accès) ; `mainnet.helius-rpc.com.` (point final) est refusé (hors de la liste exacte) ; les majuscules sont rendues en minuscules par l'analyseur. Q-2.
4. **`.toLowerCase()` gardé**, à la lettre de D-3 et sur le motif de `resolveGetUrl`, bien qu'il soit équivalent (l'analyseur WHATWG rend déjà l'hôte d'une URL https en minuscules) : joué comme E-1, il survit, ce qui est déclaré.
5. **Forme du bloc helius** : `heliusUrl` est calculé avant le bloc ; `const key = …` et `classes["helius"] = …` restent à l'identique de la base (R-25, §5). Comportement identique entre la première forme et la forme finale (suite 100/100 sur chacune ; mutants joués sur la forme finale).
6. **Fichier du test (12)** : l'ADR ne le nomme pas. Nouveau fichier `helius-host.test.ts` (précédent `drand-labels.test.ts`), pièges socket et DNS armés à l'import sans toucher l'état global d'`exports.test.ts`. Q-3.
7. **Liste des refus de (12)** : les 14 entrées de D-5, dans l'ordre. Pour userinfo, les deux formes retenues sont les discriminantes : `u@` (utilisateur seul) et `:p@` (mot de passe seul), chacune tuant une moitié de M-H6. S'y ajoutent quatre entrées déclarées : `u:p@` ; `mainnet.helius-rpc.com@evil.example` (l'hôte admis en nom d'utilisateur devant un autre hôte) ; `evilinvalid`, **seul cas qui tue M-H2**, aucune entrée de D-5 ne finissant par « invalid » sans point ; `x.helius-rpc.com`, le suffixe de domaine que D-3 rejette (sans lui, la sonde P-H1 survivrait). Chaque refus est joué **avec et sans clé** (D-3 : « avec ou sans `HELIUS_API_KEY` » ; sonde P-H7).
8. **Cas admis ajoutés** : une clé portant `& = #` prouve « posée par l'API `URL` » (la concaténation injecterait un paramètre et un fragment ; la sonde P-H5 n'est tuée que par ce cas) ; sans clé, aucun paramètre. **Course sans helius** (partie (c)) : chainstack seul, `BELL_SOLANA_RPC` refusé, la course passe (D-3 : « une course qui ne demande pas helius n'est pas touchée » ; sonde P-H6).
9. **« Sans écho »** est asserté sur `util.inspect(e)` (message, pile et propriétés propres) : ni la valeur, ni son premier élément, ni l'hôte de celui-ci, ni la clé.
10. **« Avant tout verrou »** est observé par l'absence du répertoire de cycle : `ensureCycleDir` le crée juste avant `acquireLock` (`guarded.ts` l.45-46). M-H9 (refus levé après la boucle des verrous) laisse ce répertoire et est tué par cette assertion.
11. **Amendement de `transport_error_never_carries_url_or_key`** : helius `not-a-url-scheme` est refusé à l'ouverture (message nommé, sans écho, sans répertoire de cycle). Le chemin « URL illisible ⇒ `TypeError` expurgé » est gardé sur `CHAINSTACK_ETH_URL` `not-a-url-scheme/FAKEKEY-9z9z9z` (clé en segment de chemin) et `eth_blockNumber` (1 RU, table fermée). Le `fetch` réel reste employé, comme dans le test d'origine : l'URL ne s'analyse pas et aucun envoi n'est possible. Aucun piège n'est ajouté à `exports.test.ts` (Q-3). Sondes P-H9 et P-H10.
12. **Grand livre intact** : aucune ligne ni issue nouvelle (`ledger.ts`, `client.ts`, `cli.ts`, `reconcile.ts` inchangés) ; le format reste v1, `ledger_format_locked_to_rebase_crosscheck` n'est pas touché (§9).
13. **Outils** : éditions par l'outil Edit (remplacement exact, ancre unique), fichiers neufs par Write ; aucune commande Bash ne porte d'antislash doublé. Commandes sous 6 Ko.

## 5. R-25 (méthode `ci.yml:82` et `:90`, base `72214c9`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec de `ci.yml:82` extrait du fichier (20 éléments), `git diff --numstat 72214c9` pour les suivis, `--no-index` pour le non suivi, métrique insertions + suppressions, aucune écriture git.
- Mesure 1 (14:40:09Z) : **137** (`transport.ts` 29 + 4, `guarded.ts` 5 + 1, `exports.test.ts` 9 + 3, test 86), au-delà des 132 (×2,1) de la mission. Resserrement sans retrait de cas : lignes de la base gardées (§4 point 5), commentaires ramenés à la densité du dépôt.
- **Mesure finale** (worktree 14:42:09Z, `r25-worktree.txt` ; clone synchronisé 14:55:27Z, `r25-clone.txt`, sortie identique au sha256 `98f6b755…0f46`) : **121** = code 31 (`transport.ts` 23 + 3, `guarded.ts` 4 + 1) + tests 90 (`helius-host.test.ts` 78, `exports.test.ts` 9 + 3). Ce journal est exclu par le pathspec.
- Estimation ascendante 63 (16 + 3 + 34 + 10) ; dérive **×1,92**, sous ×2,1 ; STOP 1 150 hors d'atteinte ; la coupe de repli n'est pas posée. Écart : code 31 contre 19 (fonction pure séparée, champ `refused` documenté, commentaires de rattachement) ; tests 90 contre 44 (en-tête et pièges, 18 refus joués avec et sans clé, cinq cas admis, course sans helius, `inspect`, amendement à deux chemins).

## 6. Tests

| Test | Fichier | Couvre | Mutants visés |
|---|---|---|---|
| (12) `helius_key_is_never_sent_off_host` (nouveau) | `packages/rpc-guard/test/helius-host.test.ts` | par `openGuardedClient` réel, `fetch` espion, pièges socket et DNS : (a) **admis** : production (chaîne exacte = ancienne concaténation), majuscules (hôte rendu en minuscules), `.invalid` à chemin libre, clé `& = #` encodée (un seul paramètre), sans clé (aucun paramètre) ; `operatorLabels` contient helius ; (b) **refusés**, chacun avec et sans clé : `mainnet.helius-rpc.co`, `mainnet-helius-rpc.com`, `mainnet.helius-rpc.com.evil.example`, `evilhelius-rpc.com`, `x.invalid.evil.example`, hôte en chemin, `u@`, `:p@`, `http:`, `:8443`, `/?x=1`, `#f`, `not-a-url-scheme`, URL chainstack en premier élément, puis `u:p@`, `mainnet.helius-rpc.com@evil.example`, `evilinvalid`, `x.helius-rpc.com` : message nommé exact, rien de l'URL ni de la clé dans `inspect(e)`, aucun répertoire de cycle (donc ni verrou ni ligne), aucun `fetch`, helius absent d'`operatorLabels` ; (c) course chainstack seule avec `BELL_SOLANA_RPC` refusé : intacte ; total des `fetch` = 5 + 1 | M-H1 à M-H9 ; P-H1 à P-H8, P-H11 |
| `transport_error_never_carries_url_or_key` (amendé, D-3) | `packages/rpc-guard/test/exports.test.ts` | helius `not-a-url-scheme` refusé à l'ouverture, nommé, sans écho, sans répertoire de cycle ; `TypeError` expurgé gardé sur `CHAINSTACK_ETH_URL` (message sans URL ni clé, pas de `.input`) | P-H9, P-H10 |

- **Deux passages** des fichiers du lot et d'`error-hint.test.ts` (worktree, 14:49:12Z) : 22/22 chacun, (12), le test amendé et `error_preamble_carries_no_vocabulary_token` ✔ (`lot-tests-pass1.log` `0f6b6ee15f50013f2a669ae94a6ce4fa2372b9a0e81244e2af1cf105ce2196bf`, `lot-tests-pass2.log` `1ddc812b7617dcd9f9cb6ddaaa65d9412bf8349ba6d9026db21f979c8403ae8a`).
- **Suite `packages/rpc-guard/test`** (worktree) : **100/100**, 0 échec, à 14:37:59Z puis sur la forme finale à 14:41:47Z (`rpcguard-suite-2.log`).
- **À contrôler par nom** (mission) : `error_preamble_carries_no_vocabulary_token` ✔ sans amendement (hôte `sol.example.invalid` admis, helius parmi les libellés itérés) ; `bell_publish_bare_label_guard_pins_operator_vocabulary` ✔ sans amendement (hôte `rpc.example.invalid` admis, liste de l'épingle inchangée) (`by-name-1.log`, 14:38:12Z, 24/24) ; dans l'oracle : §9.
- `npx tsc --noEmit` exit 0 ; `npx eslint` des quatre fichiers exit 0 ; règles du cliquet forcées sur les deux fichiers de test : **0** coup ; `lang-gate` OK ; `gate:vocab` OK.

## 7. Mutants (copie hors dépôt `F:/tmp/dojo/rg1c-mutants/`)

- Arbre `F:/tmp/dojo/rg1c-mutants/tree` : `git archive 72214c9` extrait (1 746 fichiers suivis, plus le test neuf), les quatre fichiers du lot copiés (`cmp` égal, sha256 égaux au worktree), `node_modules` par `mk-nm.ps1` (`@monark/rpc-guard` pointe l'arbre lui-même). Harnais `mutants.mjs` (sha256 en §14) : témoin d'abord (les deux tests visés `ok`), remplacements exacts à compte contrôlé (un mutant peut toucher deux fichiers), test visé seul (`--test-name-pattern`, TAP), **tué seulement si le TAP porte `not ok N - <test visé>`**, chaque fichier restauré puis contrôlé au sha256 après chaque mutant ; TAP par mutant (`<id>.tap.txt`).
- Passe qui fait foi (14:46:20Z → 14:46:34Z) : témoin 2/2 `ok` ; **M-H1 à M-H9 : 9/9 tués** ; sondes 11/11 tuées ; E-1 survit (équivalent déclaré) ; quatre fichiers dorés égaux au sha256 après la passe (`RESULTS.txt`, sha256 `9e53ad03f6c8b0ddfafd12b400f855fb5773a2da764c36ea39f5f44104176ec2`). Passe antérieure (14:45:20Z → 14:45:33Z, `RESULTS-run1.txt`) : même verdict ligne pour ligne sur les 20 mutants communs (P-H11 ajoutée ensuite).

Pour un verdict « Missing expected exception », le cas nommé est le premier refus de la liste que le mutant admet (ordre de la liste de (12), avec clé d'abord).

| Id | Mutation | Test visé | Verdict (première assertion qui rougit) |
|---|---|---|---|
| M-H1 | contrôle retiré : bloc de la base rétabli (clé concaténée, jamais de refus) | (12) | tué (cible du `fetch` en majuscules : l'hôte n'est plus normalisé) ; P-H11 montre la mise à mort par les refus |
| M-H2 | suffixe `invalid` sans point | (12) | tué (`evilinvalid` admis : « Missing expected exception ») |
| M-H3 | `.invalid` par sous-chaîne | (12) | tué (`x.invalid.evil.example` admis) |
| M-H4 | requête admise | (12) | tué (`/?x=1`) |
| M-H5 | `http:` admis | (12) | tué (`http:`) |
| M-H6 | userinfo admis | (12) | tué (`u@`) |
| M-H7 | port admis | (12) | tué (`:8443`) |
| M-H8 | refus citant l'URL | (12) | tué (message nommé exact) |
| M-H9 | refus après le verrou (la classe du refusé gardée pour que la boucle des verrous tourne, contrôle déplacé après elle ; deux fichiers) | (12) | tué (« refused before any lock » : répertoire de cycle créé) |
| P-H1 | suffixe de domaine `*.helius-rpc.com` (forme rejetée par D-3) | (12) | tué (`x.helius-rpc.com`) |
| P-H2 | domaine helius en suffixe sans point | (12) | tué (`mainnet-helius-rpc.com`) |
| P-H3 | hôte admis en préfixe | (12) | tué (`mainnet.helius-rpc.com.evil.example`) |
| P-H4 | fragment admis | (12) | tué (`#f`) |
| P-H5 | clé concaténée au `href` contrôlé (pas l'API `URL`) | (12) | tué (clé `& = #`) |
| P-H6 | refus levé dans `resolveOperators` (toute course ; `operatorLabels` lève aussi) | (12) | tué (`operatorLabels` sur un refusé) |
| P-H7 | contrôle seulement quand une clé est posée | (12) | tué (refus sans clé) |
| P-H8 | contrôle nommé déplacé après la boucle des verrous, classe non gardée (le contrôle générique « not resolved » part alors le premier) | (12) | tué (message nommé exact) |
| P-H9 | M-H1 contre le test **amendé** | amendé | tué (helius `not-a-url-scheme` ouvert) |
| P-H10 | faute réseau relevée brute (URL et `.input`) : chemin chainstack de l'amendement | amendé | tué (« error message leaks the endpoint ») |
| P-H11 | tous les contrôles structurels retirés dans `admittedHeliusUrl`, API `URL` gardée | (12) | tué (premier refus : « Missing expected exception ») |
| E-1 | `.toLowerCase()` retiré (équivalent déclaré) | (12) | survit, comme déclaré (§4 point 4) |

## 8. Tuyaux (règle Branchement ; ADR D-4, TU-host)

- **Entrée** : `BELL_SOLANA_RPC` (lanceur, `EnvironmentFile`) → `resolveOperators` (`admittedHeliusUrl`, `refused`).
- **Sortie** : `openGuardedClient` (refus nommé avant tout verrou ; ou transport avec la clé posée sur l'hôte admis), lu par les chemins servis qui demandent helius : `apps/bell/src/collect.ts:719` (`openGuardedClient`, courses Bell) et `apps/dojo/src/collect.ts:126` (collecteurs Dōjō, hôte de test `helius.dojo.invalid`) ; `history-collect.ts` (PR-2b-3) n'est pas dans cet arbre.
- **État** : aucun (refus avant tout verrou, aucune ligne de grand livre).
- **Test d'intégration non-LLM** : (12), par le vrai `openGuardedClient` et un `fetch` espion (composition environnement → transport → `fetch`, refus avant verrou). Les chemins servis de Bell et du Dōjō passent par le chemin **admis** dans leurs tests existants (bases `mainnet.helius-rpc.com` et `.invalid` ; oracle §9). Aucun test ne rejoue un **refus** à travers `collect.ts` de Bell ou du Dōjō : la composition du refus est prouvée au niveau d'`openGuardedClient`, conformément à D-4 (« (12) par `openGuardedClient` et `fetch` espion »). **Rien n'est déclaré « built »** : `@monark/rpc-guard` reste `upcoming` (ADR D-4, GARDE l.1280, décision 129).

## 9. Oracle (sept gates sur clone, sous verrou d'hôte « G1 RG-RECONCILE-1c ») et test 42

- **Scripts** `F:/tmp/dojo/rg1c-work/`, écrits à neuf sur le motif de ceux de DRAND-1a : `run-oracle.sh` (sha256 `08c3e79e…007f` : `npm run` des sept gates `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, codes capturés directement, variables payantes retirées par motif, TEMP sur F:) ; `locked.sh` (`a12c5902…fb38` : verrou `F:/tmp/oracle-lock` par `mkdir` atomique, `owner.txt` « G1 RG-RECONCILE-1c », attente par pas de 60 s jusqu'à 90 min, retrait dans le piège EXIT, **`node.exe` comptés à la prise et au rendu**) ; `oracle-all.sh` (`a4dbccbc…d4e1` : les sept gates puis le test 42 seul, sous la même prise, avec un compte au lancement du test 42) ; `t42.sh` (`6368e3e5…74d3`) ; `sync.sh` (`e6068090…1cae`).
- **Arbre** : `F:/tmp/dojo/rg1c-clone` (`git clone --no-local --branch lot/rpc-guard-reconcile-rg1c F:/Monark`, 14:47:26Z, HEAD `72214c9`) ; cliquet sur le clone vierge : 69/69 (14:47:59Z, `ratchet-base-pristine.log`) ; quatre fichiers du lot copiés à 14:48:54Z (sha256 égaux au worktree et à l'arbre des mutants) ; `node_modules` par `mk-nm.ps1` ; Node v24.15.0 ; neuf variables payantes retirées (noms dans `header.txt`, jamais les valeurs).
- **Verrou et C-V-4** (`node-count.txt`, `a29ab6ac…52f2`) : demandé à 14:49:02Z derrière « G2 PR-3b-1 » (tenu depuis 14:43:24Z) ; pris à 14:58:03Z après 540 s, **27 `node.exe` à la prise** ; sept gates de 14:58:03Z à 15:07:12Z ; **27 au lancement du test 42** (15:07:13Z) ; test 42 fini à 15:14:02Z ; **26 au rendu** (15:14:02Z) ; verrou rendu à 15:14:03Z (repris à 15:14:06Z par « G1 RG-RECONCILE-1a »). Une seule suite complète pendant la prise.
- **Sept gates : 7/7 exit 0** (`exits.txt` `7789ea74…18d1`) : `gate:vocab` à 14:58:05Z (322 fichiers, `54da045d…b245`) ; `typecheck` à 14:58:13Z (`03481a8f…2051`) ; `test` à 15:06:26Z : **1 442 tests, 1 439 pass, 0 fail**, 0 annulé, 3 skipped préexistants et déclarés (`sentinel_run_releases_chainstack_lock_on_sigterm` et `sentinel_instrument_out_win32_short_name` sous win32, `u4b_labels_replay_via_main_real_artifact` sans artefact ; les trois mêmes qu'à l'oracle de DRAND-1a), 493 s (`test.log` `3235211c8b810dd6c3eebf1ff6495577dbdadbe4dbd9c7bac861b06eefb0f60b`) ; `lint` à 15:06:43Z (sortie vide, `f845417c…4a4f`) ; **`lint:ratchet` 69/69** à 15:07:06Z (`45ede4ce…6b42`) ; `lang:gate` OK, 0 coup, à 15:07:10Z (`b22ac8f8…0dd7`) ; `export:check` OK à 15:07:12Z (`2f9645a9…8f16`).
- **Contrôle par nom dans `test.log`** (ancres `^✔ <nom>`) : ✔ `helius_key_is_never_sent_off_host`, `transport_error_never_carries_url_or_key`, `error_preamble_carries_no_vocabulary_token`, `bell_publish_bare_label_guard_pins_operator_vocabulary`. De la liste générale de D-5 : ✔ `public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `crosscheck_credits_derived_from_ledger`, `bell_shortpage_probe_transient_error_is_retried`, `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface` ; tests de `guard-scripts-u4.test.ts` verts (0 échec au total). Aussi ✔ `ledger_format_locked_to_rebase_crosscheck`, `fetch_only_inside_client`, `no_secret_in_repo`, `public_export_set_is_closed`. `dojo_history_budget_stops_fail_closed` n'existe pas dans cet arbre (PR-2b-3, arbre `-d3` ; O-3 le fait rejouer au cp-2 de 1a).
- **Test 42 à part**, après la suite, sous la même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0`, `export_public_no_governance_no_french` ✔ en 408 s (`t42/test42.log` `e55792832fb5ca704504ad9197c2b6a813681f0b7c840d145cd642f562c93110`). `packages/rpc-guard/**` est exporté, et le miroir reste sans français.
- Jonctions des deux arbres jetables (clone de l'oracle, arbre des mutants) retirées par `rm-nm.ps1` (`removed`, 15:14:36Z → 15:14:48Z) ; `F:/Monark/node_modules` intact (220 entrées, `@monark` 10). À 15:14:57Z, aucun processus ne mentionne `rg1c` (37 `node.exe` sur l'hôte, ceux d'autres lots) ; les deux tâches de fond de cette passe (l'oracle et son moniteur) sont terminées.

## 10. Aucun réseau (greps sur les fichiers du lot, `greps.txt`)

- `fetch(` : **0** ligne ajoutée (le bouchon s'écrit `globalThis.fetch = …`). `node:http`, `node:https`, `undici`, `child_process` : 0. Le test importe `node:net` et `node:dns` pour **armer les pièges** (une socket ou une résolution lève), motif `collect-chain.ts:14-15`.
- `https://` dans le code ajouté : **0** ligne (la liste admise porte un nom d'hôte nu). Dans les tests : entrées refusées ou admises (hôtes de production, `.invalid`, `.example`), jamais atteintes (bouchon et pièges) ; aucune n'est exportée.
- Aucune affectation `*_API_KEY=` ni clé en forme d'UUID ajoutée ; clés factices `FAKEKEY-…`. `no_secret_in_repo` ✔ sur le **worktree** (14:57:40Z, puis 15:16:14Z sur le journal final, `no-secret-worktree.log`) : il parcourt le système de fichiers et couvre donc le test neuf et ce journal, lequel est absent du clone de l'oracle.
- Toutes les passes de test ont tourné **sans les variables payantes** : l'environnement de la session en porte (noms relevés, jamais les valeurs) ; chaque commande les a retirées (`env -u`, retrait par motif `*_API_KEY`, `CHAINSTACK_*_URL`, `BELL_SOLANA_RPC` dans l'oracle et le harnais des mutants). Aucun navigateur, aucune lecture de page, aucun appel réseau réel.

## 11. Conflits prévisibles avec DRAND-1a (TY-12), nommés, rien de copié

- **Fichiers communs à 1c et DRAND-1a** : `packages/rpc-guard/src/transport.ts` et `packages/rpc-guard/test/exports.test.ts`. Hunks de DRAND-1a (diff du worktree `F:/Monark-wt-drand`, lecture seule) : `transport.ts` en-tête l.16, constantes après l.66-67 (`DRAND_RELAY_HOSTS`, `DRAND_RELAY_LABELS`, `DRAND_QUICKNET_HASH`, `DRAND_ROUND_PATH`), boucle des relais après l.122, règle de chemin dans `resolveGetUrl` ; `exports.test.ts` l.60-68 (`public_export_set_is_closed`). Hunks de 1c : `transport.ts` l.24-35 (constante et fonction pure, placées près de l.22 et non de l.66, comme le demande D-6), `Resolved` l.94-95, `resolveOperators` l.103 et l.110-119, `return` l.275 ; `exports.test.ts` l.8 et l.77-86.
- **Fusion à blanc textuelle** (`git merge-file -p` sur des copies, `F:/tmp/dojo/rg1c-work/merge/`, sans écriture git) : bases identiques dans les deux lots (`64a84454…` et `8e69ccd5…`), copies de DRAND-1a égales à sa livraison (`84f2783c…`, `65722dcd…`) ; **0 conflit sur les deux fichiers** (fusionnés : `faa78aa8…7164` et `6e3484d1…be11`). La fusion exécutée (arbre fusionné, suites) reste au G2, comme le prévoit D-6.
- **`client.ts` et `ledger.ts`** (conflits probables de DRAND-1a avec 1b, et avec 1a pour `ledger.ts`) : **non touchés par 1c**, donc sans conflit de ce lot. Le test (11) de TY-12 relève de 1b.
- Relevé en passant : le journal G1 de DRAND-1a cite la base d'`exports.test.ts` en `8e69ccd5…a8a7` ; le sha complet est `8e69ccd545e9505fe8dc04197bb101e4f50463635b7d02cdfd5bfcb7fd8a37a8` (fin `…37a8`), identique dans les deux lots : coquille de ce journal, sans effet.

## 12. Ce que je n'ai pas fait, et pourquoi

- Rien de 1a ni de 1b (fenêtre de course, tarif gTFA, format v2) : hors périmètre de 1c.
- Aucune édition de l'ADR, des FAITS, de `index.ts` ou de `apps/**`.
- Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; git en lecture seule sur le worktree (`status`, `rev-parse`, `log`, `diff`, `show`, `ls-tree`, `archive`). **Écriture git hors dépôt, déclarée** : un `git clone --no-local` jetable sous `F:/tmp/dojo/rg1c-clone` pour l'oracle (précédent DRAND-1a §9 et §11) ; `bell_served_collector_revision_is_a_collector_commit` lit l'historique du dépôt, qu'un arbre sans `.git` n'aurait pas. Le clone n'écrit ni dans `F:/Monark` ni dans le worktree. Q-6.
- Hors verrou : les passes au niveau du fichier ou du paquet (tests du lot ×2, suite `packages/rpc-guard/test`, tests nommés, deux passes de mutants, `tsc`, `eslint`, cliquet, `lang-gate`, `gate:vocab`) ont tourné hors du verrou d'hôte, en partie pendant les prises de « G2 DRAND-1a » et de « G2 PR-3b-1 » (précédent de DRAND-1a et des lots PR-2b-2 et PR-2-2) ; la suite complète et le test 42 n'ont tourné que sous le verrou (§9).
- Rien sur C: : TEMP, TMP et TMPDIR sur `F:/tmp/dojo/rg1c-work/tmp` (et `F:/tmp/dojo/rg1c-mutants/tmp`), cache npm `F:\cache\npm` ; le binaire `node` de `C:\Program Files\nodejs` est exécuté, jamais écrit ; `.npmrc` de l'utilisateur lu, jamais écrit.

## 13. Questions formées (aucun « dû » nu)

- **Q-1 (orchestrateur, D-3)** : message levé = `rpc-guard: ` + la citation de D-3 (§4 point 1). À confirmer par ligne datée, ou amender (retirer le préfixe coûte une ligne et une constante du test).
- **Q-2 (orchestrateur, D-3)** : conséquences de la forme littérale (§4 point 3) : `?` et `#` nus admis, `:443` admis, point final refusé. La clé ne va qu'à l'hôte admis dans les deux premiers cas. À confirmer, ou passer à une règle sur la chaîne brute (surensemble, forme DRAND-1a) par amendement daté.
- **Q-3 (orchestrateur, D-5)** : fichier du test (12), `helius-host.test.ts`, et amendement sans piège dans `exports.test.ts` (le `fetch` réel sur une URL non analysable, comme à l'origine) (§4 points 6 et 11). À confirmer.
- **Q-4 (orchestrateur, R-25)** : 121 mesurées pour 63 estimées (×1,92, sous ×2,1 = 132) ; ventilation au §5 ; première mesure 137, ramenée sans retrait de cas.
- **Q-5 (procurement et lecture sur place, orchestrateur ; FAITS-RFC6761-INVALID-1, couverture partielle)** : l'item de l'ADR §4 nommait trois objets : RFC 6761 §6.4, **RFC 2606 §2** et **l'émission de certificats publics pour un nom réservé**. Le FAITS du 27/09 (7 l.) ne porte que le premier. La seconde barrière de TY-9 (« la clé ne part que dans une session TLS validée ») suppose qu'aucune AC publique ne certifie un nom en `.invalid`. Identité : IETF RFC 2606, « Reserved Top Level DNS Names », Eastlake & Panitz, BCP 32, juin 1999, §2 ; CA/Browser Forum, « Baseline Requirements for the Issuance and Management of Publicly-Trusted TLS Server Certificates », version courante, définitions « Reserved IP Address » et « Internal Name » et règle de refus correspondante (sections à relever sur place, non devinées ici). Tentatives : aucune (mission sans réseau ; la lecture sur place est un acte de l'orchestrateur). Usage : compléter le FAITS et TY-9. Déclencheur : avant le G7 de 1c. Propriétaire : orchestrateur.
- **Q-6 (orchestrateur, R-20)** : lecture de « aucun git écrivant » = aucune écriture dans le dépôt ni dans le worktree ; le clone jetable de l'oracle (§12) en est hors champ, comme au G1 de DRAND-1a. À confirmer ; sinon, l'oracle devra tourner dans le worktree (risque d'artefacts de tests dans l'arbre) ou sur une archive sans historique (un test rouge par construction).
- **Q-7 (item proposé HELIUS-TLS-BARRIER-1 ; PAROXYSME de TY-8 et TY-9)** : la seconde barrière de D-3 (TLS validé, `NODE_TLS_REJECT_UNAUTHORIZED` et `NODE_EXTRA_CA_CERTS` retirés) n'est épinglée que pour le lanceur Q6 de Bell (`launch-q6.sh:23`, `bell_ops_launch_unsets_only_read_unneeded_vars`) ; aucune unité ni lanceur de cet arbre ne sert encore les collecteurs Dōjō qui demandent helius (`deploy/` : aucune occurrence). Recherche à former : épingler le retrait pour chaque lanceur d'un consommateur helius, ou faire refuser par le garde (`transport.ts`, seul lecteur d'environnement) l'envoi de la clé quand `NODE_TLS_REJECT_UNAUTHORIZED` vaut `0`, avec son prix en lignes. Déclencheur : G0 des unités du Dōjō, et au plus tard avant DOJO-HISTORY-ACTE-1 (acte 1). Propriétaire : orchestrateur.
- **Q-8 (item proposé TRUNK-MANGLED-NAMES-1, hors lot)** : l'arbre `72214c9` suit cinq fichiers sous `docs/biblio/procurements-M015/` dont le nom porte des caractères de la zone privée (U+F022, U+F00A, U+F03A : guillemet, saut de ligne et deux-points transposés) et le texte d'une commande `cp` (reliquat d'une commande passée dans un nom de fichier). Sans effet sur le lot, mais les outils POSIX de Git Bash y voient un saut de ligne, et une liste de fichiers les coupe en deux lignes (mesuré à la vérification de l'arbre des mutants : 1 752 lignes pour 1 747 fichiers). Proposition : les retirer ou les renommer au prochain pli du tronc. Propriétaire : orchestrateur.

## 14. Livraison

`F:/tmp/dojo/rg1c-deliver/` (script `F:/tmp/dojo/rg1c-work/deliver.sh`) : les quatre fichiers du lot et ce journal, dans l'arborescence du dépôt ; `evidence/` : `open.txt`, `url-facts.mjs`, `url-facts.txt`, `hint-of-refusal.txt`, `r25-worktree.txt`, `r25-clone.txt`, `ratchet-base-pristine.log`, `ratchet-worktree-1.log`, `ratchet-one-2.log`, `lot-tests-pass1.log`, `lot-tests-pass2.log`, `rpcguard-suite-2.log`, `by-name-1.log`, `no-secret-worktree.log`, `greps.txt`, `lot.diff` (`git diff 72214c9` et le fichier neuf, lecture seule) ; `mutants/` (`RESULTS.txt`, `RESULTS-run1.txt`, `mutants.mjs`, sha256 `5418e1e1f70342d65186d6b16e7f9d3b69d367ab3e8bda8bb3e19b213e5d871c`) ; `merge/merge-result.txt` ; `oracle/` (`header.txt`, `exits.txt`, `node-count.txt`, `t42/exits.txt`) ; `scripts/` (les six scripts et `ratchet-one.mjs`) ; `DELIVERED.sha256` (sha256 de chaque fichier livré ; ceux du lot et du journal relus contre le worktree). Journaux complets de l'oracle et TAP par mutant : restés sous `F:/tmp/dojo/rg1c-work/oracle/out-1/` et `F:/tmp/dojo/rg1c-mutants/`.

## 15. Advisor

- Outil intégré appelé après l'orientation, avant toute écriture : « temporarily overloaded », avec consigne de ne pas le rappeler dans ce tour. **Indisponibilité consignée, non contournée** : aucun autre canal n'a été ouvert (le canal 2, demande formée routée, appartient à l'orchestrateur). Chaque choix est déclaré au §4, et chaque hypothèse sur l'API `URL` est mesurée (`url-facts.txt`) plutôt que supposée.

## 16. `git status --short` final (worktree, 15:15:30Z, HEAD `72214c9` inchangé)

```
 M packages/rpc-guard/src/guarded.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/exports.test.ts
?? docs/G1-lot-rpc-guard-reconcile-1c.md
?? packages/rpc-guard/test/helius-host.test.ts
```

## 17. Corrections après G2 (C-G2-1 à C-G2-3, Q-G2-4, Q-G2-5, Q-G2-1 ; 2026-09-27 → 2026-09-28)

### 17.0 Identité, entrées, horloge, discipline

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1) ; worker correcteur, effort max, contexte frais (≠ générateur du G1, ≠ relecteur du G2). **Reprise après limite de session** : une première instance du même rôle a travaillé de 21:23:19Z à 21:35:23Z (dernier artefact), puis est morte ; celle-ci reprend à 23:43:22Z (§17.1).
- **Entrées** : mission `F:/tmp/dojo/mission-corr-rg1c.md` (13 l., sha256 `764bf38d1b7f92c3665769721c429c76bafeb14ec27f19df4abaa10b4940567b`) et préambule `F:/tmp/REPRISE-2026-09-28.md` (8 l., `13bd476c…b2b7`), textes calculés par le script de l'orchestrateur, lus comme tels ; rapport G2 `F:/tmp/dojo/g2-rg1c/G2-report.md` (`sha256sum -c` OK, `8c10dba8…5f8d`, 243 l., lu en entier) ; mission G1 (`e951ed3d…9818`) ; ADR D-3, D-5 et pli cp-1 ; ce journal en entier.
- **Base** : worktree `F:/Monark-wt-rg1c`, branche `lot/rpc-guard-reconcile-rg1c`, HEAD `72214c9` (inchangé) ; tronc `lot/etude-suite` à `e26412f` (préambule), base de fusion `1e179d2`.
- **Horloge (`date -u`)** : 23:43:22Z → 23:50Z reprise et relecture ; 23:50:33Z → 23:54:00Z mutants ; 23:54:38Z → 23:55:24Z passes du paquet ; 23:55:57Z verrou demandé ; 23:56:03Z R-25 ; 23:56:28Z greps ; 23:58:44Z → 23:59:14Z forme de Q-C-1 éprouvée ; 00:28:48Z → 00:42:01Z oracle et test 42 sous verrou (§17.5) ; à partir de 00:43Z cette section, contrôles de clôture et livraison (§17.9).
- **Discipline** : aucun git écrivant (lectures `--no-optional-locks`) ; les deux clones jetables `--no-local` de la première instance (`F:/tmp/dojo/rg1c-corr/clone` pour l'oracle et les passes, `…/mtree` pour les mutants) réemployés après contrôle ; aucun réseau (`fetch` espion, pièges socket et DNS armés dans (12) et dans la sonde) ; rien sur C: (TEMP/TMP/TMPDIR `F:/tmp/dojo/rg1c-corr/tmp`, cache npm `F:/cache/npm`) ; variables payantes retirées par motif à chaque exécution (noms seuls : `CHAINSTACK_{BASE,BSC,ETH,ROBINHOOD,SOLANA}_URL`, `DATABENTO_API_KEY`, `HELIUS_API_KEY`, `PERPLEXITY_API_KEY`, `POLYGON_API_KEY`, `RAILWAY_TOKEN`).

### 17.1 Reprise

- **Trouvé** (inventaire daté `evidence/reprise.txt`, 23:57:28Z) : ouverture de la première instance à 21:23:19Z (`open.txt` : les cinq fichiers = relevé du G2, 5/5 OK) ; copies du G1 (`g1-files/`) ; worktree modifié : `helius-host.test.ts` (21:26:10Z, `5b155126…`), `guarded.ts` (21:26:28Z, `e506d825…`), ADR (21:28:06Z, `d635fa56…`) ; `transport.ts`, `exports.test.ts` et ce journal au G1 ; deux clones synchronisés sur six fichiers (21:29:4xZ), jonctions `entries: 220  monark: 10  fail: 0` ; scripts `env.sh`, `host.sh`, `nt.sh`, `sync.sh`, `apply-qg24.mjs`, `apply-qg25.mjs`, `mk-mtable.mjs`, `mtable.mjs`, `corr-mutants.mjs` et sonde `zz-corr-x3-probe.test.ts` (dans `mtree` seul) ; une passe du lot (21:27Z) ; `tsc-1.log` et `eslint-1.log` vides, codes de sortie non relevés ; une passe de mutants (21:32:46Z → 21:35:23Z). **Absents** : cette section, l'oracle, la livraison. Aucun processus restant (23:47:22Z).
- **Réemployé, parce que reproduit à l'octet** (et non sur la foi des journaux de l'instance morte) : `helius-host.test.ts` = copie éprouvée du G2 (`probe/helius-host.corr.test.ts`, `3cd104b1…`, C-G2-1..3 à la lettre) + `apply-qg24.mjs`, rejoué sur une copie : `5b155126…`, identique ; `guarded.ts` = G1 (`55054b37…`) + `apply-qg25.mjs`, rejoué : `e506d825…`, identique ; `mtable.mjs` régénéré par `mk-mtable.mjs` depuis le harnais du G2 (sha256 contrôlé `8fba25ed…`) : identique (`fa65dd55…`) ; clones : HEAD `72214c9`, six fichiers `cmp`-égaux au worktree, `git status` = ces six seuls (plus la sonde dans `mtree`). **ADR** : ajout en fin de fichier seulement (4 lignes : blanc, titre, blanc, ligne datée), écrit à 21:28:06Z par l'instance précédente et **non redaté** ; relu contre D-3, Q-1, Q-2 et le G2 (P-5, P-6) : conservé.
- **Refait et daté** : mutants (§17.3) ; passes du paquet, `tsc`, `eslint`, cliquet, `lang:gate`, `gate:vocab`, R-25, greps (§17.4) ; oracle et test 42 (§17.5) ; `no_secret_in_repo` sur le worktree ; cette section ; la livraison.
- **[repris, non rejoué]** : aucun chiffre de la première instance n'est repris ici ; ses sorties restent consignées (`lot-tests-pass1.log` de 21:27Z, `mutants-prev-2135Z/`).
- **Écarts à la mission** : R-25 **129** au lieu des 128 attendus (Q-C-2) ; oracle sur **six** fichiers, l'ADR compris (Q-C-3) ; le durcissement de Q-G2-5 n'est épinglé par aucun test du lot (Q-C-1).

### 17.2 Corrections appliquées (liste fermée, décisions de la mission)

| Id | Fichier : lignes (état final) | Contenu | Mutant(s) tué(s) par (12) | `error_origin` |
|---|---|---|---|---|
| C-G2-1 | `helius-host.test.ts:31` (entrée `mainnet.helius-rpc.com.`, ligne partagée) ; `:49-51` (trois tuples) | §10 du G2 à la lettre : point final refusé ; `:443`, `?` nu, `#` nu admis vers `${PROD}?api-key=${KEY}` (`#` final gardé) | G-5 (l.31) ; G-14 (l.49-51) | G1 (G2 §10) |
| C-G2-2 | `helius-host.test.ts:31` (entrée `x.mainnet.helius-rpc.com`) | §10 à la lettre : sous-domaine de l'hôte exact refusé | G-9, G-12 | G1 (G2 §10) |
| C-G2-3 | `helius-host.test.ts:81` | §10 à la lettre : `BELL_SOLANA_RPC` absent ⇒ « is not resolved from env », jamais le refus nommé | G-7 | G1 (G2 §10) |
| Q-G2-4 = épingle | `helius-host.test.ts:52` (tuple `[PROD, "", PROD]`) ; `:59` (`key \|\| null`) | clé vide : aucun paramètre `api-key` | G-6 | hors §10 ; proposé : G1 (clé vide non épinglée), à assigner au G7 |
| Q-G2-5 = oui | `guarded.ts:32-33` (`Object.hasOwn(refused, label)`) ; `:35` (`Object.hasOwn(classes, label)`, ligne de la base nommée au même site par le G2) | clés propres seulement ; 0 ligne nette | aucun des 23 ; H-1, H-2 (miens) survivent au lot (Q-C-1) | hors §10 ; proposé : G1 (`refused[label]`) et base (`classes[label]`, antérieure à 1c), à assigner au G7 |
| Q-G2-1 = oui | ADR l.166-169, section datée « 2026-09-27 — G2 RG-1c » | Q-1 : message = `rpc-guard: ` + littéral de D-3 ; Q-2 : `?`/`#` nus et `:443` admis, point final refusé | docs, hors R-25 | — |

- Rien d'autre de l'ADR n'est touché (blob partagé par 1a et 1b : union au G7). `transport.ts` et `exports.test.ts` sont ceux du G1. Fichier de test : 84 lignes (78 + 6).

### 17.3 Mutants (arbre `mtree`, harnais `corr-mutants.mjs`, 23:50:33Z → 23:54:00Z)

- **Textes** : les 23 mutants non équivalents du G2 et E-1, E-2, à la lettre du harnais du G2 (`g2-mutants.mjs`, `8fba25ed…`, l.13-15 et 18-51 copiées par `mk-mtable.mjs`), seule l'ancre `G_WHY` adaptée à Q-G2-5 ; plus H-1, H-2 (miens : durcissement retiré, une lecture chacun). **Témoin** vert : (12) sur chaque version du fichier de test (corrigée, G1, cinq ablations, variante de Q-C-1), sonde X-3, suite du paquet (16 fichiers). Tué ⇔ `not ok N - helius_key_is_never_sent_off_host` ; fichiers dorés restaurés et contrôlés au sha256 après chaque mutant (27/27), égaux en fin de passe ; 34 `node.exe` au départ.
- **(12) corrigé : 23/23 tués**, G-6 compris. (12) du G1 : 17/23 (survivants G-5, G-6, G-7, G-9, G-12, G-14, comme au G2 §4). **Chaque ajout est nécessaire** (ablations) : sans l'entrée à point final, G-5 survit ; sans les trois tuples, G-14 ; sans l'entrée `x.mainnet…`, G-9 et G-12 ; sans la l.81, G-7 ; sans la l.52, G-6. E-1 et E-2 survivent (équivalents, G2 X-2). H-1 (`refused[label]` rétabli) et H-2 (`classes[label]` rétabli) survivent à (12) et à la suite du paquet ; tués par la ligne de Q-C-1 et par la sonde X-3 (libellés `toString`, `constructor`, `hasOwnProperty`, `__proto__`, `valueOf`).
- `RESULTS.txt` `807181c3…cdde`, **identique à l'octet** à celui de la première instance (21:35:23Z) ; journal `mutants-run-2.log`.

### 17.4 Tests, gates, R-25, greps (clone, hors verrou, 23:54:38Z → 23:56:28Z)

- Fichiers du lot et `error-hint` : **22/22, deux passages** ; suite `packages/rpc-guard/test` : **100/100** ; par nom : `bell_publish_bare_label_guard_pins_operator_vocabulary`, `error_preamble_carries_no_vocabulary_token`, `paid_helius_http_error_reprises_only_the_closed_hint` ✔ ; `tsc --noEmit` 0 ; `eslint` des quatre fichiers 0 ; règles du cliquet forcées sur les deux fichiers de test : 6 règles, 0 coup, 0 fatal ; `lang:gate` OK ; `gate:vocab` OK, 322 fichiers (`evidence/pkg-exits.txt`).
- **R-25 = 129** (méthode `ci.yml:82`/`:90`, `pr2-1-r25-methodA.mjs` `140be120…`, contre `72214c9` ; worktree et clone, sorties identiques) = `guarded.ts` 5 + 2, `transport.ts` 23 + 3, `exports.test.ts` 9 + 3, `helius-host.test.ts` 84 ; ≤ 132 ; STOP 1 150 loin. Écart aux 128 attendus : Q-C-2.
- **Greps** (`evidence/greps.txt`, lignes ajoutées par les corrections) : `mainnet.helius-rpc.com` (`:443` admis ; point final refusé) et `x.mainnet.helius-rpc.com` (sous-domaine refusé, forme nommée par C-G2-2) ; **aucun n'est atteint** (refus avant tout `fetch`, `fetch` espion, pièges socket et DNS armés à l'import) ; aucune autre URL ; 0 `fetch(`, `node:http(s)`, `undici`, `child_process` ; 0 clé (`_API_KEY=`, 32 hexadécimaux). Ligne datée de l'ADR : `https://mainnet.helius-rpc.com/?api-key=<clé>` (docs, forme admise, sans clé). Lot entier (`72214c9` + fichiers neufs) : les hôtes classés au G2 §6, plus ces deux formes.

### 17.5 Oracle (sept gates sous verrou « corr RG-1c ») et test 42 à part

- **Arbre** : `F:/tmp/dojo/rg1c-corr/clone` (`git clone --no-local` de la première instance, HEAD `72214c9`) portant les six fichiers du worktree : les quatre du lot, ce journal dans son état G1 (`d1293ca1…`), l'ADR avec le pli daté (`d635fa56…`) ; sha256 des six égaux avant et après (`six-before.sha256` = `six-after.sha256`) ; `git status` du clone = ces six seuls, identique avant et après ; `node_modules` par `mk-nm.ps1` (`d70d8aea…`, `entries: 220  monark: 10  fail: 0`) ; Node v24.15.0 ; variables payantes retirées (noms dans `header.txt`). Scripts écrits à neuf : `locked-bounded.sh` (verrou `F:/tmp/oracle-lock` par `mkdir` atomique, propriétaire « corr RG-1c », attente bornée à 600 s pour qu'une tâche de fond ne soit jamais tuée en tenant le verrou, piège EXIT posé après la prise, `node.exe` comptés à la prise et au rendu ; pas de 60 s, puis de 15 s dès la tentative 3) et `oracle-all.sh` (sept gates par `npm run`, codes capturés directement, puis le test 42 seul sous la même prise).
- **Verrou et C-V-4** (`oracle-attempts.txt`) : demandé à 23:55:57Z ; tentatives 1 à 3 abandonnées à la borne, rien tenu (verrou tenu successivement par « cp-2 RG-1b », « G1 N2-1a (reprise) », « G1 K-1a reprise » ; à 00:16:04Z, il a été repris par un autre entre deux sondages de 60 s de la tentative 2, d'où le pas de 15 s) ; **tentative 4 : pris à 00:28:48Z après 120 s (attente cumulée 33 min), 24 `node.exe` à la prise** ; sept gates de 00:28:49Z à 00:37:33Z ; **25 au lancement du test 42** (00:37:34Z) ; **24 au rendu** ; verrou rendu à 00:42:01Z par le piège EXIT. Pendant la prise, aucune autre exécution `node` de ma part (lectures de journaux seulement).
- **Sept gates : 7/7 exit 0** (`exits.txt` `f6f24429…`) : `gate:vocab` (322 fichiers, aucun terme interdit) ; `typecheck` ; **`test` : 1 442 tests, 1 439 pass, 0 fail**, 0 annulé, 3 skipped (les trois préexistants : `sentinel_run_releases_chainstack_lock_on_sigterm` et `sentinel_instrument_out_win32_short_name` sous win32, `u4b_labels_replay_via_main_real_artifact` sans artefact), 466 s (`test.log` `e01d07d3…`) ; `lint` (sortie vide) ; **`lint:ratchet` « 69/69 »** ; `lang:gate` 0 coup ; `export:check` OK. Les six journaux déterministes sont **égaux octet pour octet** à ceux du passage 1 du G2 (donc du G1).
- **Test 42** : dans la suite ✔ (447 s) ; **à part**, même prise, après les gates : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, **2/2**, `export_public_no_governance_no_french` ✔ en 266 s (`t42/test42.log` `006a5427…`). Le rouge du passage 1 du G2 (test 42 dans la suite) ne s'est pas reproduit ; Q-G2-7 reste l'acte de l'orchestrateur au G7.
- **Contrôle par nom** (`by-name.txt`, ancres `^✔ <nom>`) : ✔ (12), l'amendé, `error_preamble_carries_no_vocabulary_token`, `bell_publish_bare_label_guard_pins_operator_vocabulary`, `paid_helius_http_error_reprises_only_the_closed_hint` ; de D-5 : `public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `crosscheck_credits_derived_from_ledger`, `bell_shortpage_probe_transient_error_is_retried`, `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface` ; gardes : `ledger_format_locked_to_rebase_crosscheck`, `public_export_set_is_closed`, `fetch_only_inside_client`, `no_secret_in_repo`, `no_cash_cross_provider_name_in_export`. `dojo_history_budget_stops_fail_closed` n'existe pas dans cet arbre (`-d3`, O-3).

### 17.6 Tuyaux (CA-11) : inchangés

- Entrée, sortie, état et test d'intégration du §8 inchangés : `BELL_SOLANA_RPC` → `resolveOperators` → `openGuardedClient`, lu par les chemins servis qui demandent helius (Bell `collect.ts:719`, Dōjō `collect.ts:126`) ; (12) passe par le vrai `openGuardedClient` et un `fetch` espion, et tue désormais 23/23. Q-G2-5 ne change rien pour un libellé d'opérateur réel (mêmes messages) ; un libellé qui nomme un membre d'`Object.prototype` devient « is not resolved from env », fail-closed, avant tout verrou et toute écriture (sonde X-3). Rien n'est déclaré « built » : `@monark/rpc-guard` reste `upcoming` (D-4).

### 17.7 Actes de l'orchestrateur (cités, non exécutés)

- **Q-G2-2** : I-G2-1 n'est pas de ce lot (ligne de `dojo-history-collect.test.ts` au prochain pli de PR-2b-3, par l'orchestrateur). **Q-G2-3** : union 1b × 1c à l'acte I-3 (forme éprouvée du G2 §5), jamais le côté 1b du bloc de `transport.ts`. **Q-G2-7** : passage 2 de la gate `test` à l'oracle de l'arbre fusionné, au G7 de 1c. **Q-G2-6** : confirmé (journal committé avec son lot), étendu à l'ADR par Q-C-3. Q-5 et Q-7 du G1 : inchangés (orchestrateur).

### 17.8 Questions formées (aucun « dû » nu)

- **Q-C-1 (orchestrateur ; PAROXYSME : durcissement sans épingle)** : Q-G2-5 n'est tenu par aucun test du lot (H-1, H-2 survivent à (12) et à la suite du paquet). Forme éprouvée d'**une ligne**, après la l.81 de `helius-host.test.ts` : `    assert.throws(open(envOf(PROD, KEY), "toString").client, /'toString' is not resolved from env/, "a prototype-named label is never resolved (Q-G2-5)");` ; variante `9018207b…` : (12) vert sur le code doré, `tsc` 0, `eslint` 0, cliquet 0/0, `lang:gate` 0 (`evidence/pin-check.txt`, 23:58:44Z → 23:59:14Z) ; tue H-1 et H-2 (§17.3). Prix : +1 ligne, R-25 130 ≤ 132. Hors de la liste fermée : non appliquée. Déclencheur : avant le G7 de 1c. Propriétaire : orchestrateur (appliquer, ou déclarer H-1/H-2 survivants).
- **Q-C-2 (orchestrateur, R-25)** : 129 mesurées pour 128 attendues. Ventilation : Q-G2-4 coûte **+1** (le tuple ; `key || null` modifie une ligne d'un fichier non suivi, compté en lignes entières : 0) ; Q-G2-5 coûte **+2** (la ligne de la base `classes[label]` modifiée : +1/−1 à la métrique `ci.yml:90`, insertions + suppressions ; 0 ligne **nette**, comme le disait la mission) ; C-G2-1..3 : +5. 121 + 5 + 1 + 2 = 129 ≤ 132. À accepter.
- **Q-C-3 (orchestrateur, méthode)** : oracle sur **six** fichiers : les cinq de Q-G2-6 plus l'ADR, qui porte le pli daté de 1c et sera committé avec le lot ; aucune gate ne lit `docs/` (`gate:vocab` : sources des paquets ; `lang:gate` saute `docs`), seul `no_secret_in_repo` parcourt le système de fichiers. À confirmer.

### 17.9 Livraison, advisor, clôture

- **Livraison** `F:/tmp/dojo/rg1c-corr-deliver/` (`scripts/deliver.sh`) : les six fichiers dans l'arborescence du dépôt (`cmp` au worktree) ; `evidence/` (inventaire de reprise, `open.txt` de la première instance, passes du paquet, R-25 du worktree et du clone, greps, `corr.diff`, `lot.diff`, `pin-check.txt`, sorties de l'oracle et du test 42, tentatives de verrou, contrôles de clôture) ; `mutants/` (`RESULTS.txt`, son journal, la passe de la première instance, la sonde X-3) ; `scripts/` ; `DELIVERED.sha256`. Journaux complets (`test.log`, TAP par mutant) : sous `F:/tmp/dojo/rg1c-corr/`.
- **Contrôles de clôture, après l'écriture de cette section** : `no_secret_in_repo` sur le worktree (il parcourt le système de fichiers et couvre ce journal final, que le clone de l'oracle porte dans son état G1) ; jonctions `node_modules` des deux clones retirées par `rm-nm.ps1` (`b51b5d22…`, jamais de suppression récursive) ; `final-check.sh` (HEAD, `git status`, sha256 des six fichiers, `F:/Monark/node_modules`, `node.exe`, processus restants). Sorties : `evidence/no-secret-worktree.log`, `evidence/rmnm.log`, `evidence/final-check.txt`, reprises au rapport de remise.
- **Advisor** : outil intégré consulté après l'orientation, avant toute écriture : plan confirmé (mutants d'abord, pendant l'attente du verrou ; passes du paquet rejouées, les journaux vides de l'instance morte non réemployés ; attente bornée, rien d'autre de ma part sous la prise ; test 42 à part ; R-25 129 décomposé sans lissage ; H-1 et H-2 en question formée, la liste fermée n'étant pas dépassée ; `x.mainnet.helius-rpc.com` classé comme au G2 §6 ; six fichiers déclarés) ; chaque point vérifié sur pièce ; conseil, jamais verdict.
- **`git status --short`** (worktree, 00:43:31Z, HEAD `72214c9` inchangé ; le journal était déjà non suivi, son ajout ne change pas cette sortie) :

```
 M docs/adr/ADR-RPC-GUARD-RECONCILE-1.md
 M packages/rpc-guard/src/guarded.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/exports.test.ts
?? docs/G1-lot-rpc-guard-reconcile-1c.md
?? packages/rpc-guard/test/helius-host.test.ts
```
