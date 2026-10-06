claude-opus-5-5

# G0 — RPC-GUARD-FIRST-APPEND-1 : plan du lot, sans code (grand livre neuf, corps de réponse borné, relevés entiers)

Plan d'un lot de la partie 1 du chantier « page snapshot » (décision 300). Planificateur `claude-opus-5-5`, effort `max`, contexte frais, lot documentaire : aucun code, aucun test exécuté, aucun commit. Lectures du 2026-09-30, de 23:15:56Z à 23:56:28Z (`date -u`, détail au §1) ; fichier écrit le 2026-10-01 à 00:02:37Z (`date -u -r`, lu après l'écriture : la première rédaction portait à tort la date du 2026-09-30, corrigée avant la remise). Base : worktree `F:/Monark-wt-rpcguard-first`, branche `lot/rpcguard-first`, HEAD `ae330bf47ca9abb61132918b74466ba53f569a9d` (tronc, égal au reçu), arbre propre à 23:15:56Z, 23:46:25Z et 23:56:28Z. Tous les numéros de ligne cités sont ceux de cette base, sauf mention d'un blob.

## 0. Décisions, une ligne chacune

- **D-1 (périmètre)** : RPC-GUARD-FIRST-APPEND-HEAD-1, RPC-GUARD-BODY-TIMEOUT-1, RG-SNAPSHOT-NONNEG-INT-1, plus RG-PRECEDENCE-TEST-1 (même déclencheur que NONNEG, absent de LC-08) et la correction du RUNBOOK-rpc-guard §6 étape 5 (cp-2 1a C-V-5) ; une seule PR.
- **D-2 (grand livre neuf)** : la tête de genèse (64 zéros) est écrite, de façon durable, par le premier ajout et AVANT la première ligne ; « tête = genèse, `jsonl` absent » s'ouvre comme un grand livre neuf ; tout le reste de C-V-8 est inchangé.
- **D-3 (corps borné)** : une seule échéance par tentative (en-têtes et corps), tenue par la course propre du transport sur son signal, et un plafond d'octets `maxBodyBytes` (défaut 8 MiB) ; échéance ⇒ `AbortError` (code = statut reçu), plafond ⇒ `BodyTooLarge` ; corps d'erreur coupé ⇒ `HttpError` inchangé, détail vide.
- **D-4 (relevés)** : prédicat `Number.isSafeInteger(v) && v >= 0` sur toute valeur, dans les deux modes et les deux fenêtres ; motif `snapshot_invalid`.
- **D-5 (bloquant)** : fusion AVANT A-3 et A-3p (NE-4, décision de l'orchestrateur) ; premier usage réel de D-2 et D-3 au premier pas du jour zéro (A-7) ; D-4 et RG-PRECEDENCE-TEST-1 avant le go de l'acte 1 d'historique.
- **D-6 (régime)** : pas un petit lot (quatre critères de la décision 116 tombent) ; sous la décision 300, qui fait foi : ni cp-1 ni cp-2 par lot, mais implémentation, intégration dans `lot/page-v1` et inspection unique de la partie 1, avec un domaine de relecture « rpc-guard ».
- **D-7 (R-25)** : ≈ 246 lignes ascendantes (≤ 547) ; ×2,1 = 517 ; STOP à 1 150 mesurées par `r25()` ; repli nommé 1a/1b.
- **D-8 (STOP)** : aucun fichier neuf sous `packages/rpc-guard/src/` et aucune ligne dans `apps/dojo/src/collect.ts`, `scripts/dojo-deploy.mjs`, `docs/RUNBOOK-dojo.md` ni `deploy/*` ; sinon arrêt et retour à l'orchestrateur.

## 1. Lecture (tâche 1) : entrées, sha256, heures

Convention : sha256 complet pour les entrées primaires, 16 premiers caractères pour les renvois. Relevés `sha256sum` à 23:15:56Z (mission), 23:17:07Z (`packages/rpc-guard`), 23:46:15Z et 23:46:25Z (le reste), blobs à 23:3xZ et 23:47Z.

**Hors worktree**

| Entrée | sha256 | Lu |
|---|---|---|
| mission `F:/tmp/dojo/plans/mission-g0-rpcguard-first.md` | `8d14fdde5c36a342e22d3e9fd6dd38e065f53b32edb70f64bffd8a6b3db60cd9` (recalculé, égal au champ `sha` du reçu) | en entier (20 l.) |
| reçu `F:/tmp/dojo/plans/mission-g0-rpcguard-first.recu.json` | `4ffb7d2e04d3c3cd54b1d056be67090f8d3ab04c2ae84abdc7cf9127b0239104` | en entier : verdict vert, `base` = `head` = `ae330bf4…` |
| règles `F:/Monark/docs/methode/REGLES-MISSION.md`, version 1 (= copie du worktree) | `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` | en entier (18 l.), 23:16Z |
| mêmes règles, version 2 (commit `d2db76c3`) | `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba` | l.19-20 par `diff` contre la version 1 (ligne datée 23:42 UTC, décision 300), 23:46:25Z |
| inventaire `F:/tmp/dojo/inventaire-page/INVENTAIRE.md` | `2875738f152cb2ff992452cc7d7af2570efb3b3ee2bcd8181abcff190dbb6158` (préfixe de la mission égal) | en entier (189 l.) : §0, LC-08 l.27, §1.B (AH-02 l.50, AH-14 l.63), §3 l.147-157, §4 (NE-5 l.165, l.170) |
| essai du validateur `F:/tmp/dojo/cp2-rg1a/evidence/nonneg-trial.diff` | `564df2cf87fde3b9644858040a2e06e648141e05059f520760c8179fbf6c9edf` | en entier |

**Blobs (`git show`, lecture seule)**

| Blob | sha256 | Lignes |
|---|---|---|
| `483d004c:docs/adr/ADR-DOJO-PR-3.md` ([P3b2]) | `55b2d763488b19ad6672f16fc5943d2ddd2136eef53d52ab58d76ed9e5d42529` | l.393 |
| `cdaf67c8:docs/adr/ADR-DOJO-PR-3.md` ([L299]) | `6cffcaf9f7919ef533077b01e54434ef98196c66f8d3fb2d3f82d72ab4e52270` | l.621-623 |
| `dda06abe:docs/adr/ADR-DOJO-PR-3.md` (tronc, 442 l.) | `e13d6784eb337dc18e4d94e4e311dc2deb2c116715bbe98b149293a1de2184a6` | l.433-434 (NE-4, NE-5), l.438-442 (décision 300) |
| `dda06abe:docs/CHANTIERS.md` (tronc, 2 275 l.) | `7381e4c721ff60207bd9898bce2e64368ffbbbf9c2db91d3d48f2eed8c7685df` | l.2194-2200 |

**Paquet `packages/rpc-guard` (base `ae330bf4`)**

| Fichier | sha256 | Lu |
|---|---|---|
| `src/ledger.ts` | `0a9699bc3bdf9abdac4df645340bd420acea2b45aa54853245f69279639afac4` | en entier (221 l.) |
| `src/lock.ts` | `6655a9c82a40106f5069e0e971467713e91678c6b19f43aa1b912ad5a322c244` | en entier (44 l.) |
| `src/transport.ts` | `4ad8e9d9c450fff13cc9246783f9c31ec4d5614c54d2bb6889d6028c8f642ed6` | en entier (301 l.) |
| `src/client.ts` | `ef99818b3c996ceafb978fd8c73be628c73374aaa6f159666e0b1a10a488ba21` | en entier (173 l.) |
| `src/reconcile.ts` | `d4b86972df03a8577d9159fc4ea66a7bf414ebcec1afa35a56fd74c77514fecc` | en entier (162 l.) |
| `src/cli.ts`, `src/guarded.ts`, `src/repair.ts`, `src/errors.ts`, `src/index.ts`, `bin/rpc-guard.mjs` | `28cb5fb38290b13c`, `e506d825fd1767ed`, `e997c6fdd4802a61`, `8622947f93d158a1`, `3e1ae1248c6085fc`, `44842f8457a9dfdd` | en entier |
| `src/classify.ts` | `49a0828563fcd9ac` | l.1-48 sur 81 |
| `src/tariff.ts`, `src/bell-methods.ts` | `06d2b664b64a6877`, `60a0b2f256bc3e70` | non lus (hors besoin) |
| `test/` : 21 fichiers, 2 967 l. | `bare-revert` `c9df0d06a3f0d583`, `caps` `9a3f17ba61dc9de1`, `client` `27a33d23f7dafb0f`, `course-window` `a02998f630c26585`, `drand-labels` `03f8f7c75c9cfb18`, `durable` `009c1568a6da2066`, `error-hint` `f8543bb912f5f599`, `exports` `9844bfc26fead635`, `gtfa-tariff` `82dad001f2bedc19`, `harness` `7053b42ca341fa8e`, `helius-host` `9018207b8bbee354`, `ledger-format-lock` `fe8d12fbe5d63381`, `ledger-recovery` `4e4838023b2173ae`, `ledger` `9c9e69838b0daeb3`, `lock` `a14026f1bc3df96b`, `multi-operator` `5b828f3b79036d8b`, `no-fsync` `45a6597fe7b6e70c`, `reconcile` `1d80f102d6df2571`, `repair-tail` `f086ac0c3cd95917`, `tariff` `8788e369f3680fb6`, `transport-hardening` `aafd5ebccfa49a46` | tous en entier |

**Documents et code hors paquet (base `ae330bf4`)**

| Fichier | sha256 (16) | Lignes lues |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-3.md` (430 l.) | `d05e881c63a2f256` | l.216-221, 228, 276-278 |
| `docs/adr/ADR-RPC-GUARD-DRAND-1.md` (134 l.) | `a7e3734cdd18f38c` | en entier |
| `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` (220 l.) | `6883cea94f9c63b8` | en entier |
| `docs/adr/ADR-DOJO-PR-2B.md` | `222c13251a067412` | l.1001 |
| `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` | `de27e4e3f678e7f2` | l.1193, l.1289 |
| `docs/adr/ADR-C01-amendement-2026-09-21-cadence.md` (26 l.) | `b99a82c3e9e09afd` | l.11, l.14 (par recherche) |
| `docs/CHANTIERS.md` (2 268 l.) | `f2a32ea1863d72cb` | l.504-505, 617, 1887, 1946, 2105, 2107, 2135, 2144, 2252 ; par recherche : l.922, 982, 1193, 2191 |
| `docs/RUNBOOK-dojo.md` (315 l.) | `4135e84e158be8a0` | l.23-26, 154-160, 184-192, 279-315 |
| `docs/RUNBOOK-rpc-guard.md` (219 l.) | `fa78eb7562bb11f3` | l.14-30, 104-116, 128-151, 175-219 |
| `docs/G1-lot-dojo-pr3b1.md` | `1b306725ca9a4acb` | l.200, 235, 239, 249 |
| `docs/dojo/FAITS-probe-12-2026-09-27.md` | `e3964ea3e001a2fe` | l.8, l.32-40 |
| `apps/dojo/src/collect.ts` | `d257c08c259e1641` | l.116-150, l.199 |
| `apps/dojo/src/history-collect.ts` | `11a45354a75a3eb5` | l.191-199 ; par recherche : l.23, 42, 142, 156-157, 197, 200-207, 215, 238 |
| `apps/dojo/src/dojo-methods.ts` | `495368211802acb1` | l.6-9 (par recherche) |
| `apps/sentinel/src/run.ts` | `a02a9542f340eaf4` | l.276-312 ; par recherche : l.224, 232 |
| `apps/sentinel/src/keyless-transport.ts` | `be2266c5a3c5b113` | l.10-35 |
| `apps/dojo/scripts/dojo-verify.mjs`, `apps/bell/scripts/bell-verify.mjs` | `ef6d15b21239e3a7`, `14a7e07c116ef3be` | l.36-62 ; l.20-30 |
| `scripts/probe-narabi.mjs` | `4e4338c026ad6508` | l.50-66, l.236-312 |
| `scripts/dojo-deploy.mjs` | `60de228ea357833b` | l.9-21, 28 (par recherche) |
| `scripts/mission/gen.mjs`, `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml` | `9eecb3717c7a2ad1`, `4d0544dfe6c3cb31`, `0f401ae2da253b76` | l.60-69 (l.44 par recherche) ; l.1-28 ; l.76-90 |
| `deploy/monark-dojo-collect.service` (52 l.) | `0144a937bd265de1` | en entier |
| `test/dojo-collect-deploy.test.ts` | `04f966e2845eb1db` | par recherche : l.19, 44, 48-51, 151-153, 224 |
| `apps/dojo/test/dojo-collect.test.ts` | `ad9e85561a259d54` | l.273-294 |
| `apps/sentinel/test/ukemi-guard-record.test.ts` | `49f8c3ededdf2c6f` | l.524-546 ; l.930 par recherche |
| `apps/bell/test/eth-leg-budgeted.test.ts` | `d07ba9efe4d24285` | l.18-34 |

**Lots en vol (lecture seule, `--no-optional-locks`)** : premier relevé entre 23:17:07Z et 23:41:43Z : `F:/Monark-wt-drand-1b` propre ; `F:/Monark-wt-entrylink` modifié, non commis (` M` sur `apps/dojo/scripts/dojo-eve.mjs`, `dojo-publish.mjs`, `dojo-seed.mjs`, `apps/dojo/src/collect.ts`, `history-collect.ts` ; non suivis `docs/G1-lot-entry-main-link-1.md` et `test/dojo-entry-link.test.ts`) ; `F:/Monark-wt-dojo-pr3b2` : ` M docs/RUNBOOK-dojo.md`, ` M scripts/dojo-deploy.mjs`, ` M scripts/dojo-deploy.d.mts`, et non suivis les unités et le Caddyfile de publication et `docs/G1-lot-dojo-pr3b2a.md`. Second relevé à 23:46:25Z : `F:/Monark-wt-drand-1b` HEAD `ae330bf4`, propre ; `F:/Monark-wt-entrylink` HEAD `0bf2afc0`, propre (gel, CHANTIERS du tronc l.2200) ; `F:/Monark-wt-dojo-pr3b2` HEAD `cdaf67c8`, mêmes modifications non commises, plus `test/dojo-publish-deploy.test.ts` non suivi. Branche d'intégration `lot/page-v1` = `7ae00f37` : 13 chemins changés depuis `ae330bf4`, aucun sous `packages/rpc-guard` ni `docs/RUNBOOK-rpc-guard.md` (23:48:02Z).

**Mesures (aucun test, aucun harnais)** : un `node -e` d'arithmétique entre 23:41:43Z et 23:46:15Z (plafond 8 388 608 octets ; 674 641 / 1 144 = 589,72 octets par compte ; marge ×12,43 ; ≈ 14 225 comptes au plafond, moitié ≈ 7 112 ; 16 MiB ≈ 28 449 comptes ; `Number.isInteger(2 ** 53)` vrai, `Number.isSafeInteger(2 ** 53)` faux ; 20 × 30 + 10 × 60 + 10 × 1 = 1 210) ; un `node -e` qui importe les fonctions pures de `packages/rpc-guard/src/classify.ts` entre 23:48:02Z et 23:56:28Z : les préambules `rpc-guard: BodyTooLarge for operator 'helius' (code 200)` et `rpc-guard: AbortError for operator 'helius' (code 200)` donnent `closedHint` vide et `isResultLimit`, `isPlanLimited`, `isRevertText` faux.

## 2. Plan (tâche 2)

### 2.1 Intention unique

Qu'un premier appel sur un grand livre neuf ne laisse jamais un état refusé, qu'aucune tentative de transport ne dépasse son échéance ni ne tienne un corps géant en mémoire, et qu'un relevé qui n'est pas un entier ≥ 0 ne donne jamais un GO : les trois préalables `rpc-guard` de la page, dans l'arbre de collecte, avant A-3.

### 2.2 Table des PR

| PR | Contenu | Fichiers | Asc. | ×2,1 | Base | Aval |
|---|---|---|---|---|---|---|
| RPC-GUARD-FIRST-APPEND-1 | C-FA, C-BT, C-NN, C-PR, C-RB (§2.4) | 4 sources, 2 tests neufs, 3 fichiers de test amendés, 1 runbook | 246 | 517 | `ae330bf4` | intégration dans `lot/page-v1`, inspection unique de la partie 1 |

**Repli nommé** (si `r25()` mesure plus de 1 150, ou si l'inspection ne bloque qu'une moitié) : 1a = C-FA, C-NN, C-PR, C-RB (`ledger.ts`, `repair.ts`, `reconcile.ts`, `first-append.test.ts`, `durable.test.ts`, `course-window.test.ts`, runbook ; ≈ 130) ; 1b = C-BT (`transport.ts`, `body-bound.test.ts`, `error-hint.test.ts` ; ≈ 116). Toutes deux avant A-3.

### 2.3 Périmètre fermé

**Fichiers touchés** : `packages/rpc-guard/src/ledger.ts`, `packages/rpc-guard/src/repair.ts` (commentaire l.34), `packages/rpc-guard/src/transport.ts`, `packages/rpc-guard/src/reconcile.ts` ; `packages/rpc-guard/test/first-append.test.ts` (neuf), `packages/rpc-guard/test/body-bound.test.ts` (neuf), `packages/rpc-guard/test/durable.test.ts`, `packages/rpc-guard/test/course-window.test.ts`, `packages/rpc-guard/test/error-hint.test.ts` ; `docs/RUNBOOK-rpc-guard.md` ; le journal du G1.

**Interdits (STOP D-8)** : tout fichier neuf sous `packages/rpc-guard/src/` (l'arbre de collecte nomme ses 13 fichiers, `scripts/dojo-deploy.mjs` l.13-19, épinglé par `dojo_collect_tree_is_the_import_closure`, `test/dojo-collect-deploy.test.ts` l.224 ; ce fichier est modifié en ce moment par PR-3b-2a) ; `packages/rpc-guard/src/index.ts` et `package.json` (ensemble fermé des exports, `exports.test.ts` l.49-69) ; toute lecture de `process.env` et toute affectation de `DURABLE_FS` dans `src/` (`durable.test.ts` l.291-292) ; `apps/dojo/**`, `scripts/**`, `deploy/**`, `docs/RUNBOOK-dojo.md`, `apps/sentinel/**`, `apps/bell/**`.

### 2.4 Constructions

**C-FA — RPC-GUARD-FIRST-APPEND-HEAD-1** (définition : ADR PR-3 l.218 ; origine : sonde P-12b, `docs/G1-lot-dojo-pr3b1.md` l.235). Aujourd'hui, un crash entre la première ligne d'un grand livre neuf et sa tête laisse « `jsonl` présent, tête absente », refusé à l'ouverture (`ledger.ts` l.168-169) et donc à l'`unlock` servi (`cli.ts` l.53) ; le résiduel est déclaré à l'en-tête (l.15-16).
- (a) `appendChained` (l.202-212) : un drapeau `headOnDisk`, posé à l'ouverture à `hasHead` (l.166). S'il est faux au premier ajout : `replaceDurable(headPath, LEDGER_GENESIS)` AVANT `writeDurable(path, "a", …)` (l.208), puis vrai. Premier ajout : tête de genèse (tmp, fsync, rename), ligne (a, write, fsync, close), tête de la ligne (tmp, fsync, rename). Ajouts suivants inchangés.
- (b) Ouverture, branche l.192-193 (tête présente, `jsonl` absent) : acceptée si et seulement si la tête lue (`trim`) vaut `LEDGER_GENESIS` (grand livre neuf, `entries = []`) ; toute autre tête garde le refus actuel, message inchangé.
- (c) Inchangés : « `jsonl` présent, tête absente » reste un refus (une tête supprimée, ou un grand livre antérieur au lot) ; la guérison d'une tête d'une entrée en retard (l.186) couvre désormais la première ligne, puisque la tête avant-dernière d'une chaîne d'une ligne est la genèse ; la troncature de queue reste refusée ; `repair-tail` refuse toujours `head_absent` (`repair.ts` l.34).
- (d) L'ouverture d'un grand livre neuf n'écrit rien : la genèse n'est écrite qu'au premier ajout.
- (e) Commentaires : en-tête de `ledger.ts` l.13-16 (résiduel clos pour tout grand livre ouvert par ce code) ; `repair.ts` l.34.
- Rejetées : (1) guérir « `jsonl` présent, tête absente », qui admet « tête supprimée + troncature » (`ledger.ts` l.15-16) ; (2) écrire la genèse à l'ouverture, qui laisserait une tête seule pour tout opérateur ouvert sans appel, qu'un arbre épinglé plus ancien refuse (« head sidecar present but ledger absent », l.193 ; lecteurs anciens : RECONCILE-1 l.169, RG-OLD-READER-1) ; (3) un renommage atomique de dossier pour la ligne et la tête (disproportionné).

**C-BT — RPC-GUARD-BODY-TIMEOUT-1** (définition : ADR PR-3 l.220 ; origine : `docs/G1-lot-dojo-pr3b1.md` l.239). Aujourd'hui, le minuteur est armé à `transport.ts` l.253 et effacé dans le `finally` de la l.265, dès les en-têtes ; les corps sont lus par `res.text()` sans délai ni plafond (l.274 pour une erreur, l.277 sinon).
- (a) Une échéance par tentative : le minuteur est effacé dans un `finally` qui enveloppe `fetch` ET la lecture du corps. Précédents du dépôt : `apps/sentinel/src/keyless-transport.ts` l.23-35 (minuteur effacé après `res.json()`), `scripts/probe-narabi.mjs` l.263-302.
- (b) Lecture bornée, fonction locale de `transport.ts` (aucun fichier neuf) : `res.body` nul ⇒ chaîne vide ; sinon un lecteur dont chaque `read()` est mis en course contre une promesse résolue par l'événement `abort` du signal de la tentative (le transport ne suppose pas que `fetch` interrompt le flux : non lu, §2.17) ; octets comptés par morceau ; au-delà de `maxBodyBytes`, arrêt ; sur arrêt, `ctl.abort()` et `reader.cancel()` sans attente, rejet capté ; décodage par `new TextDecoder()` (utf-8, BOM retiré, remplacement), dont l'équivalence avec `Response.text()` est prouvée par T-7, jamais supposée.
- (c) Noms et règlement. Réponse 2xx : échéance ⇒ `raise(op, "AbortError", res.status, "")`, même nom que l'échéance aux en-têtes, le code (statut reçu) les distingue ; réessayée par `collect.ts` l.143 ; réservation gardée (`client.ts` l.164). Plafond ⇒ `raise(op, "BodyTooLarge", res.status, "")`, non réessayé par `collect.ts` l.143 (un corps géant revient géant), réservation gardée, nom sans jeton du vocabulaire fermé (mesure du §1). Réponse non-2xx (l.269-276) : la même lecture bornée remplace `res.text().catch(() => "")` ; échéance ou plafond ⇒ détail vide, jamais un corps partiel (une clé coupée à la frontière échapperait à la rédaction : C-R-3, `multi-operator.test.ts` l.264-279) ; `HttpError` garde son statut et son `retryAfterMs` (règlement Q-O1 (a) inchangé). 3xx : corps jamais lu (inchangé).
- (d) `TransportOpts.maxBodyBytes?: number` (l.74) ; `DEFAULT_MAX_BODY_BYTES = 8 * 1024 * 1024`, exporté par `transport.ts` seulement, comme `DEFAULT_TIMEOUT_MS`, jamais par `index.ts` ; validé dans `resolveOperators` (entier sûr ≥ 1, sinon erreur nommée `rpc-guard: maxBodyBytes must be a safe integer >= 1 (fail-closed)`, avant tout verrou puisque `guarded.ts` l.26 appelle `resolveOperators` avant les verrous) ; `DEFAULT_TIMEOUT_MS` inchangé (30 000) : l'assertion `WORST_S` = 1 210 (`test/dojo-collect-deploy.test.ts` l.151-153) reste verte et devient vraie.
- (e) Source du défaut : précédent mesuré `scripts/probe-narabi.mjs` l.62-63 (8 MiB « peaks ~100 MiB RSS on the GET path (measured) », 64 MiB « ~247 MiB ») ; corps légitime mesuré sur le chemin de la page : 674 641 octets re-sérialisés pour N = 1 144 comptes (`FAITS-probe-12` l.36-40), soit une marge ×12,43 (§1) ; `MemoryMax=512M` (`deploy/monark-dojo-collect.service` l.52). **Porte STOP du G1 (S-3)** : pic RSS ≤ 256 MiB (la moitié de 512M) pour un corps de 8 MiB à la forme de `collect.ts` l.199 (`jsonParsed`, `withContext`), passé par `openGuardedClient` jusqu'au `JSON.parse` ; au-delà, STOP et retour à l'orchestrateur ; mesure win32 déclarée, qui n'est pas le cgroup Linux de l'hôte. Le relèvement à 16 MiB est une ligne datée future (R-9).

**C-NN — RG-SNAPSHOT-NONNEG-INT-1** (RECONCILE-1 l.195 ; CHANTIERS l.1946, l.2107). `reconcile.ts` l.124 (mode agrégé, `total_ru`) et l.146 (par méthode, `byMethod`) : `Number.isFinite(v)` devient `Number.isSafeInteger(v) && v >= 0` ; motif `snapshot_not_finite` renommé `snapshot_invalid` ; préséance inchangée (après `rollover` et `repaired_in_window`, avant toute borne, sans tableau, avec sa ligne). Base : l'essai du validateur (`nonneg-trial.diff`, §1), qui gardait l'ancien motif. `isSafeInteger` est un surensemble strict de l'`isInteger` de la ligne datée : il refuse en plus les entiers au-delà de 2^53 − 1, dont la soustraction perd l'exactitude (Q-3).

**C-PR — RG-PRECEDENCE-TEST-1** (RECONCILE-1 l.196, « même déclencheur »). Une assertion dans `reconcile_course_window_isolates_one_course` : sur la course C (6 gTFA à `{limit: 100}` = 60 crédits, aucun `getTransaction`), relevés `pm("c", 500, 10)` puis `pm("c", 500, 9)` en `--course-end C` ⇒ `negative_delta:getTransaction`. Sous le mutant V-3 (bande souple testée avant `negative_delta`), la réponse serait `soft` : sur-compte 60 − (−1) = 61 > max(50 ; 0,3).

**C-RB — `docs/RUNBOOK-rpc-guard.md`** (documentation, hors R-25) : §1 (l.18-19) : un grand livre neuf a sa tête (64 zéros) avant sa première ligne, et un crash de processus pendant le premier ajout est guéri à l'ouverture ; §3, table l.112, `head_absent` : « tête supprimée, ou grand livre créé avant RPC-GUARD-FIRST-APPEND-HEAD-1 et coupé à son premier ajout » ; §6 étape 2 (l.190) et étape 4 (l.204) : `snapshot_invalid` (valeur qui n'est pas un entier sûr ≥ 0) ; §6 étape 5 (l.209) : retirer « another course » des causes de `course_end_unknown`, et écrire que le sha d'une autre course du même grand livre est ACCEPTÉ et rapproche cette course-là (cp-2 1a C-V-5, RECONCILE-1 l.197), donc qu'il se prend au seul `unlock` de l'étape 1.

### 2.5 Bloquant pour la page, et avant quel acte

| # | Élément | Avant | Source |
|---|---|---|---|
| B-1 | le lot entier (fusion) | **A-3 et A-3p** (acte qui borne) | NE-4, `dda06abe:docs/adr/ADR-DOJO-PR-3.md` l.433 (lot nommé : « fusionnés AVANT A-3 et A-3p : un seul G7, aucun redéploiement ») ; [P3b2] l.393 (arbre de collecte différent ⇒ A-3 et A-5 refaits) ; `scripts/dojo-deploy.mjs` l.13-19 |
| B-2 | C-FA, C-BT : premier usage réel | premier pas du jour zéro (A-7, RUNBOOK-dojo §6) | `dda06abe` l.441 (répétition rétablie, RUNBOOK §5 à §7 inchangés) ; RUNBOOK-dojo l.157-158 (le démarrage de A-5 « writes nothing and calls nothing ») |
| B-3 | C-NN, C-PR | go de l'acte 1 d'historique (premier acte `--course-end`) et prochain rapprochement Bell | RECONCILE-1 l.195-196 ; ADR-DOJO-PR-2B l.1001 ; CHANTIERS l.2135, l.2144 |
| B-4 | C-RB §6 étape 5 | go de l'acte 1 (la procédure §6 est celle de l'acte) | RUNBOOK-rpc-guard l.175-219 ; RECONCILE-1 l.197 |

Dans l'ordre de l'inventaire (§3, l.151-155), A-3 précède le jour zéro et l'acte 1 : B-1 borne tout le lot.

### 2.6 Non bloquant : items routés (datés, jamais abandonnés, décision 298)

| # | Item | Objet | Propriétaire | Déclencheur |
|---|---|---|---|---|
| R-1 | RUNBOOK-DOJO-RPCGUARD-TEXT-1 (neuf) | RUNBOOK-dojo l.25 : retirer RPC-GUARD-FIRST-APPEND-HEAD-1 de la liste « Before A-7 », de nouveau en vigueur avec le jour zéro ; §9 l.305 : l'exemple « a kill between the first line of a new cycle's ledger and its head » ne produit plus de refus ; le STOP sur « head sidecar » reste (altération) | orchestrateur | pli G7 de l'inspection de la partie 1, après la fusion de PR-3b-2a (qui modifie `docs/RUNBOOK-dojo.md`, non commis à 23:46:25Z) ; au plus tard avant A-2 |
| R-2 | DOJO-TIMEOUT-DERIVATION-TEXT-1 (neuf) | « to the response head » devient « per attempt, head and body » dans `deploy/monark-dojo-collect.service` l.32 et `test/dojo-collect-deploy.test.ts` l.48-49 (commentaires seuls ; `WORST_S` = 1 210 inchangé, désormais vrai) | orchestrateur | prochain lot qui touche l'un des deux fichiers ; au plus tard l'intégration de la partie 1 |
| R-3 | cellule TY-2 de RECONCILE-1 (l.100) | « une autre course » est acceptée, non refusée (cp-2 1a C-V-5) | orchestrateur | pli G7 de ce lot (ligne datée) |
| R-4 | RG-COURSE-LEDGER-BIND-1 (existant, RECONCILE-1 l.197) | lier le sha de course aux relevés ; défaut de registre : aucun déclencheur à sa ligne | orchestrateur | proposé : avant l'acte 2 d'historique (second acte `--course-end`) ; l'acte 1 tient par la procédure (sha rendu par l'`unlock` de la course, `run.json`) et par C-RB |
| R-5 | I-1 (existant, ADR-GARDE-HELIUS l.1289 ; CHANTIERS l.922) | fsync du dossier parent : variante « coupure de courant » de la fenêtre du premier ajout (entrée de dossier de la tête ou du `jsonl` non durable) | orchestrateur | inchangé (« avant le 2e redéploiement VPS » ; atteint ou non : non établi ici) ; Q-2 |
| R-6 | NARABI-BODY-CAP-1 (neuf, si Q-1 = oui) | plus grand corps de la jambe gardée de Narabi (`eth_getBlockByNumber`, `eth_getLogs`, `eth_call` : `apps/sentinel/src/run.ts` l.232, l.295) mesuré ≤ 8 MiB, sinon `maxBodyBytes` passé par `run.ts` (ligne datée) | orchestrateur | avant le prochain déploiement de l'arbre de la sentinelle qui porte ce lot |
| R-7 | BELL-GTFA-CREDITS-1 (existant, RECONCILE-1 l.150), étendu | plus grande page gTFA pleine (`limit: 1000`) mesurée ≤ 8 MiB, sinon `maxBodyBytes` passé par Bell | orchestrateur | inchangé : avant toute course Bell qui appelle gTFA |
| R-8 | DOJO-COLLECT-BODY-STALL-1 (neuf, tuyau partiel TU-BT) | test au niveau du collecteur : un corps bloqué est réessayé une fois (`AbortError`, code 200) puis rend une lecture nulle, journal `[op, method, null, "AbortError", 200]` ; exige un délai injectable dans `collect.ts` (l.126 n'en passe aucun : 30 s réelles) | orchestrateur | prochain lot qui touche `apps/dojo/src/collect.ts` (DRAND-RELAY-GET-1b, plan en vol) ; au plus tard l'inspection de la partie 1 |
| R-9 | DOJO-GPA-BODY-GROWTH-1 (neuf, PAROXYSME du plafond) | la réponse gPA croît avec les titulaires ; relèvement par ligne datée (16 MiB ≈ 28 449 comptes) après une mesure RSS | orchestrateur | premier `snapshot` publié avec N ≥ 7 000 titulaires (moitié de ≈ 14 225) |
| R-10 | registre PAROXYSME (`PAROXYSME-Dōjō.md`, ADR PR-3 l.228) | RPC-GUARD-BODY-TIMEOUT-1 clos par ce lot | orchestrateur | G7 de l'inspection |

### 2.7 Tests nommés

**Neufs, `packages/rpc-guard/test/first-append.test.ts`**
- **T-1 `rpc_guard_new_ledger_head_precedes_its_first_line`** : journal `harness.journal()` du premier ajout d'un grand livre neuf = genèse (`open:w`, `write`, `fsync`, `close` de `helius.head.tmp`, puis `rename` vers `helius.head`), PUIS les neuf opérations `APPEND` (`durable.test.ts` l.15-16) ; une ouverture sans ajout ne crée aucun fichier ; tête = 64 zéros et `jsonl` absent ⇒ ouverture d'un grand livre neuf (`entries()` vide, `priorAtOpen()` = plancher), et le premier ajout n'écrit alors pas de seconde genèse.
- **T-2 `rpc_guard_first_append_crash_is_healed_never_refused`** : échec injecté au `renameSync` qui suit la première ligne (code non transitoire ; la ligne est durable) ⇒ `appendChained` lève ; réouverture sans refus, tête guérie = `entry_sha256` de E1, `priorAtOpen()` compte E1 ; `runCli unlock` sort 0, sa ligne `unlocked` chaîne depuis E1, verrou retiré. Échec injecté à l'ouverture du `jsonl` après la genèse ⇒ réouverture en grand livre neuf.
- **T-3 `rpc_guard_first_append_kill_is_unlocked_by_the_served_bin`** (intégration non-LLM, P-12b rejouée) : un processus fils réel (motif `realWriter`, `harness.ts` l.45-52) ouvre `openGuardedClient` et fait un appel (`fetch` remplacé), puis se tue (`SIGKILL` sur lui-même, posé par la couture `DURABLE_FS` dans le fils) au renommage qui suit sa première ligne ; le parent lance le vrai `packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir <d> --floor 0 unlock --cycle <c> --op helius --reason <r>` (forme du RUNBOOK-dojo §9) : sortie 0, `unlocked <sha>` imprimé, dernière ligne `unlocked`, verrou retiré.
- **T-4 `rpc_guard_head_tamper_stays_refused_after_the_genesis_head`** : `jsonl` présent et tête supprimée après une ligne ⇒ « head sidecar absent » ; tête autre que la genèse et `jsonl` supprimé ⇒ « head sidecar present but ledger absent » ; tête = genèse et `jsonl` de deux lignes ⇒ « tail truncation » (jamais guérie à deux entrées d'écart) ; aucun refus n'écrit d'octet.

**Neufs, `packages/rpc-guard/test/body-bound.test.ts`** (motif `driveTransport`, `multi-operator.test.ts` l.188-199 : vrai `openGuardedClient`, `fetch` remplacé, délai injecté)
- **T-5 `rpc_guard_attempt_deadline_bounds_a_body_that_never_ends`** : avec l'option `timeout` de `node:test`, pour que l'arbre de base ROUGISSE au lieu de pendre (preuve F2P). Réponse 2xx dont le corps s'ouvre puis se tait ⇒ `TransportError` `AbortError`, code 200, sous `timeoutMs` + marge ; crochet `(op, "AbortError", 200)` ; message sans URL ni clé ; grand livre : une ligne `attempted`, aucune `settled` (réservation gardée). Réponse 503 avec `Retry-After` et corps sans fin ⇒ `HttpError` 503, `retryAfterMs` gardé, détail vide, ligne `settled` à 0 pour helius (Q-O1 (a) inchangé).
- **T-6 `rpc_guard_body_cap_refuses_a_giant_body_by_name`** : flux tiré à la demande (morceaux de 64 Kio, jamais matérialisé), `maxBodyBytes` injecté. Exactement le plafond (JSON valide complété de blancs) ⇒ analysé ; plafond + 1 ⇒ `BodyTooLarge`, code 200 ; `cancel` de la source observé ; octets tirés ≤ plafond + un morceau ; corps d'erreur géant ⇒ `HttpError` avec son statut, détail vide ; `maxBodyBytes` à 0, −1, 1,5, `NaN` ou `Infinity` ⇒ refus nommé avant tout verrou (aucun dossier de cycle créé) ; `DEFAULT_MAX_BODY_BYTES === 8 * 1024 * 1024`.
- **T-7 `rpc_guard_bounded_read_decodes_like_response_text`** : oracle différentiel contre `new Response(octets).text()` sur un corps vide, un corps nul, un BOM de tête, un caractère multi-octet coupé entre deux morceaux et de l'UTF-8 invalide ⇒ même chaîne.

**Amendés (déclarés)**
- `durable_append_writes_the_line_then_the_head_in_order` (`durable.test.ts` l.33) : `[GENESIS, APPEND, APPEND, APPEND]` avec GENESIS = `APPEND.slice(4)`.
- `durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff` (l.82-120) : en (1) et (4), le grand livre reçoit une ligne avant le journal, sinon la genèse consomme les échecs injectés ; comptes de (2) ajustés.
- `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` (l.205) : 5 ⇒ 6 (verrou, genèse, et deux fois ligne et tête).
- `reconcile_course_window_isolates_one_course` (`course-window.test.ts` l.85-89) : valeurs augmentées de −1, 1,5 et `2 ** 53` ; motif `snapshot_invalid` ; cas mesuré « avant −10, après −5 » (NO-GO, était GO) ; assertion C-PR.
- `cli_unlock_returns_the_unlocked_sha` (l.214) : le bin imprime `NO-GO snapshot_invalid`.
- `error_preamble_carries_no_vocabulary_token` (`error-hint.test.ts` l.158) : `BodyTooLarge` ajouté à la liste des noms.

**À contrôler par nom (inchangés, verts)** : `ledger_persists_and_fail_closes`, `delete_ledger_prior_ge_floor`, `ledger_recovers_crash_in_append_window_but_refuses_tail_truncation`, `durable_heal_of_a_head_one_behind_is_tmp_fsync_rename`, `durable_orphan_head_tmp_is_removed_once_the_pair_verifies`, `durable_head_one_entry_behind_advances_to_the_last_durable_entry_never_back_never_double_counted`, `durable_head_rename_outlasts_a_real_reader_then_fails_closed_without_fallback`, les huit `repair_tail_*`, `reconcile_reads_the_repair_journal_per_window`, `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`, `lock_blocks_second_writer`, `unlock_subcommand_chains_release`, `public_api_never_reaches_fetch_without_a_ledger_line`, `public_export_set_is_closed`, `transport_error_path_network_abort`, `transport_error_path_http_non_ok_keeps_body`, `transport_error_path_non_json_body`, `transport_error_never_echoes_operator_key`, `transport_error_key_straddling_truncation_never_leaks`, `transport_3xx_is_hard_stop_never_followed`, `transport_403_carries_no_retry_after_even_with_header`, `xstocks_issuer_get_returns_body_verbatim_not_jsonrpc_unwrapped`, `rpc_guard_drand_labels_are_host_bound`, `rpc_guard_gtfa_failure_settlement`, `ledger_format_locked_to_rebase_crosscheck`, `reconcile_aggregate_calibration_enforces_hard_bound_and_consigns_soft` ; hors paquet : `dojo_collect_tree_is_the_import_closure` et l'assertion `WORST_S` (`test/dojo-collect-deploy.test.ts` l.224, l.151-153), `dojo_collect_retries_are_bounded_and_honour_retry_after`, `ukemi_record_crash_between_append_and_head_is_recovered_by_unlock`, `sentinel_chainstack_leg_uses_20s_timeout`.

**Sondes hors suite** (journal du G1, sorties hachées ; une sonde en boucle locale reste hors de la suite : ORACLE-FLAKE-LOOPBACK-1)
- **S-1** : serveur `node:http` en boucle locale, libellé `chainstack` (`CHAINSTACK_ETH_URL=http://127.0.0.1:<port>/k`) ; en-têtes 200 et corps partiel, puis silence ⇒ `AbortError` code 200 vers `timeoutMs`, fermeture de la socket observée côté serveur.
- **S-2** : même montage, `content-encoding: gzip`, forme décodée au-delà du plafond ⇒ `BodyTooLarge` (le plafond compte les octets livrés par `fetch` après décodage).
- **S-3** : porte STOP de C-BT (e), pic RSS ≤ 256 MiB.

Campagne de tueurs et de mutations par l'outil du tronc (REGLES-MISSION, ligne datée 14:5x du 2026-09-29), `RESULTS.json` cité par chemin et sha256.

### 2.8 Mutants nommés (tueurs)

- **M-FA1** écriture de la genèse retirée (T-1, T-2, T-3) ; **M-FA2** genèse écrite après la première ligne (T-1, T-2) ; **M-FA3** genèse écrite en place, sans tmp ni rename (T-1) ; **M-FA4** genèse écrite à l'ouverture (T-1 : une ouverture n'écrit rien) ; **M-FA5** « tête présente, `jsonl` absent » accepté pour toute tête (T-4) ; **M-FA6** acceptation de la genèse seule retirée (T-1, T-2) ; **M-FA7** guérison élargie à « `jsonl` présent, tête absente » (T-4, `ledger_persists_and_fail_closes`).
- **M-BT1** minuteur effacé aux en-têtes, comme aujourd'hui (T-5) ; **M-BT2** course propre retirée, confiance dans `fetch` pour interrompre le corps (T-5 : le flux remplacé ignore le signal) ; **M-BT3** contrôle du plafond retiré (T-6) ; **M-BT4** `>=` au lieu de `>` (T-6, plafond exact) ; **M-BT5** échéance de corps sous un autre nom qu'`AbortError` (T-5) ; **M-BT6** échéance ou plafond réglés comme un échec reçu (T-5, T-6 : aucune ligne `settled`) ; **M-BT7** dépassement du corps d'erreur levé en `BodyTooLarge`, statut perdu (T-6) ; **M-BT8** décodage par `Buffer.toString`, BOM gardé (T-7) ; **M-BT9** lecteur non annulé au dépassement (T-6) ; **M-BT10** URL ou détail repris dans le message d'une faute de corps (T-5) ; **M-BT11** `maxBodyBytes` non validé (T-6).
- **M-NN1** retour à `isFinite` (amendement, −1 et 1,5) ; **M-NN2** `> 0` au lieu de `>= 0` (cas existants à 0) ; **M-NN3** `isInteger` au lieu de `isSafeInteger` (`2 ** 53`) ; **M-NN4** prédicat sur un seul mode (amendement, deux modes dans sa liste) ; **M-NN5** motif non renommé (amendement).
- **M-PR1** (= V-3) `negative_delta` testé après la bande souple (assertion C-PR).

### 2.9 Classes d'entrée de la mission, couverture (tâche 2)

| Classe (Review Focus) | Construction | Tests | Mutants |
|---|---|---|---|
| premier appel sur un grand livre neuf : accepté, ligne de tête écrite, jamais un refus | C-FA | T-1, T-2, T-3, T-4 | M-FA1 à M-FA7 |
| corps de réponse sans fin ou géant : borné, refus nommé | C-BT | T-5, T-6, T-7 ; S-1, S-2, S-3 | M-BT1 à M-BT11 |
| relevé négatif ou fractionnaire : refusé, jamais un GO | C-NN, C-PR | amendements de `reconcile_course_window_isolates_one_course` et de la l.214 | M-NN1 à M-NN5, M-PR1 |

### 2.10 R-25 prévu

Estimation ascendante, insertions et suppressions, pathspec de `ci.yml` l.82 (`docs/**/*.md` exclu), jamais une mesure ; ×2,1 = pire mesuré (RECONCILE-1 l.114) ; PR-3b-1 a mesuré ×2,31 (ADR PR-3 l.276). Mesure au G1 par `r25()` (`scripts/oracle/r25.mjs` l.14), jugée à 1 150.

| Fichier | Poste | Asc. |
|---|---|---|
| `src/ledger.ts` | genèse dans `appendChained` 3 ; branche d'ouverture 5 ; en-tête 8 ; commentaire 2 | 18 |
| `src/repair.ts` | commentaire l.34 | 2 |
| `src/transport.ts` | lecture bornée 16 ; constante et doc 4 ; option et validation 4 ; échéance sur toute la tentative 10 ; deux lectures de corps 6 ; doc l.38-39 2 | 42 |
| `src/reconcile.ts` | deux prédicats 4 ; commentaires 4 | 8 |
| `test/first-append.test.ts` (neuf) | T-1 16 ; T-2 22 ; T-3 26 ; T-4 14 | 78 |
| `test/body-bound.test.ts` (neuf) | T-5 28 ; T-6 30 ; T-7 14 | 72 |
| `test/durable.test.ts` | l.33 2 ; reprises (1) et (4) 6 ; l.205 2 | 10 |
| `test/course-window.test.ts` | l.85, 87, 89, 214 : 8 ; cas mesuré 3 ; C-PR 3 | 14 |
| `test/error-hint.test.ts` | l.158 | 2 |
| **Total** | | **246** |

×2,1 = 517 ; ×2,31 = 568 ; les deux sous 1 150. Au-delà de 1 150 mesurées : repli 1a/1b (§2.2). Solde sous 10 lignes : scission, jamais compaction (REGLES-MISSION, ligne datée 13:0x du 2026-09-29).

### 2.11 Tuyaux (entrée, sortie, état, test d'intégration non-LLM)

| # | Entrée (qui produit) | Sortie (qui consomme) | État | Test |
|---|---|---|---|---|
| TU-FA | première ligne écrite en tête d'une course sur un (cycle, opérateur) neuf (`openGuardedClient` puis `commit`), ou `unlock` servi (`collect.ts` l.148-150 ; RUNBOOK-dojo §9) | ouverture suivante par les chemins servis (`openGuardedClient`, `runCli unlock` et `reconcile`, `repair-tail`) : guérison, puis ajout | `<ledger>/<cycle>/<op>.head` (genèse avant la première ligne) et `<op>.jsonl` | T-3 : fils réel tué dans la fenêtre, puis le vrai bin `unlock` |
| TU-BT | réponse HTTP d'un opérateur (`fetch` remplacé ; S-1 et S-2 en boucle locale) vers le transport | `TransportError` (`AbortError` code = statut, `BodyTooLarge`, `HttpError`) lue par `client.call` (réservation gardée ou `settled` à 0) et par les consommateurs (`collect.ts` l.143 réessaie `AbortError` ; `history-collect.ts` l.238) | lignes `attempted` et `settled` du grand livre | T-5 et T-6 par le vrai `openGuardedClient` ; composition avec le collecteur : partielle, item R-8 |
| TU-NN | relevés CSV écrits en JSON (acte), passés au bin `reconcile --course-end` | code de sortie et ligne de verdict (`NO-GO snapshot_invalid`), lus par la procédure de l'acte (RUNBOOK-rpc-guard §6) | ligne `course_reconciled` | amendement de `reconcile_course_window_isolates_one_course` (par `runCli`) et de la l.214 (par le bin) |

Registre public : `@monark/rpc-guard` reste `upcoming` ; ce lot ne déclare rien « built » (RECONCILE-1 l.87 ; CA-11 « à brancher »).

### 2.12 Menaces (forme de l'audit Vernier) et MAST

| # | Menace | Parade | Statut |
|---|---|---|---|
| TY-1 | crash de processus (SIGTERM de `TimeoutStartSec`, OOM, arrêt) entre la première ligne d'un grand livre neuf et sa tête ⇒ refus à l'ouverture et à l'`unlock`, verrous tenus, collecte arrêtée (STOP du §9) | genèse avant la ligne ; guérison « une entrée en retard » | fermé (T-2, T-3) |
| TY-2 | coupure de courant dans la même fenêtre (entrées de dossier non durables) | I-1 | résiduel déclaré, routé (R-5, Q-2) |
| TY-3 | « tête supprimée + troncature » (motif du résiduel, `ledger.ts` l.15-16) | la tête n'est jamais absente légitimement ; « `jsonl` présent, tête absente » reste un refus | fermé (T-4, M-FA7) |
| TY-4 | `jsonl` supprimé tant que la tête vaut encore la genèse (fenêtre du premier ajout) | au plus une ligne perdue ; exposition égale à celle d'avant le lot | résiduel déclaré, sans élargissement |
| TY-5 | première ligne fabriquée ajoutée à un grand livre dont la tête vaut la genèse | guérie en sur-compte (sens sûr) ; le modèle C-V-8 défend la troncature | déclaré |
| TY-6 | arbre épinglé plus ancien face à une tête de genèse seule | écrite seulement dans la fenêtre du premier ajout (construction paresseuse) ; RG-OLD-READER-1 | réduit |
| TY-7 | corps sans fin (flux lent, serveur muet) | une échéance par tentative, course propre du transport | fermé ; la dérivation des 1 210 s devient vraie |
| TY-8 | corps géant (mémoire, arrêt par le cgroup, verrous tenus) | plafond d'octets, `BodyTooLarge`, `cancel` et `abort` | fermé pour le transport ; valeur du plafond : R-6, R-7, R-9 |
| TY-9 | bombe de décompression | le plafond compte les octets livrés par `fetch` ; décodage par undici non lu | réduit ; S-2 |
| TY-10 | fuite de clé par un chemin d'erreur neuf | messages par `raise` (nom et code seuls), détail vide, jamais un corps partiel (C-R-3) | fermé (T-5, T-6, M-BT10) |
| TY-11 | dérive de décodage entre la lecture bornée et `res.text()` | oracle différentiel | fermé (T-7, M-BT8) |
| TY-12 | relevés négatifs, fractionnaires ou au-delà de 2^53 − 1 ⇒ faux GO | prédicat entier sûr ≥ 0 | fermé (amendements, M-NN1 à M-NN5) |
| TY-13 | régression d'un consommateur servi (Narabi) par le plafond, ou par l'échéance étendue au corps | l'échéance s'aligne sur les jambes sans clé (`keyless-transport.ts` l.23-35) ; plafond : Q-1, R-6 | réduit |
| TY-14 | conflit avec les lots en vol | fichiers disjoints mesurés (§1) ; STOP D-8 | réduit ; fusion à blanc par l'orchestrateur |

MAST : FM-1.1 (spécification non suivie : dépendre de `fetch` pour interrompre le corps ⇒ M-BT2) ; FM-2.2 (clarification non demandée : périmètre de trois items dans la mission, un quatrième de même déclencheur ⇒ É-4, déclaré) ; FM-3.2 (vérification incomplète : le chemin undici réel n'est pas dans la suite ⇒ S-1, S-2) ; FM-3.3 (vérification incorrecte : oracle tiré du code ⇒ T-7 compare à `Response.text()`, jamais à la fonction testée).

### 2.13 Régime

1. **Sous les critères de la mission** (décision 116 ; ADR-C01 amendement l.11, critères cumulatifs) : ce n'est PAS un petit lot. Réseau : `transport.ts` est le seul site `fetch`. Secret : c'est le seul lecteur des clés payantes, et les chemins d'erreur sont sous hygiène de clé. Argent : le grand livre des crédits et le verdict du rapprochement. Servi : la jambe payante de Narabi (`apps/sentinel/src/run.ts` l.295, `deploy/monark-sentinel.service`). Le seuil de 300 lignes est sans objet. Ancienne règle : checkpoint-1 bref, puis checkpoint-2 (l.14).
2. **Sous la décision 300** (`dda06abe:docs/adr/ADR-DOJO-PR-3.md` l.438-440, 23:27 UTC) **et la ligne datée 23:42 UTC de REGLES-MISSION** (l.20, commit `d2db76c3`), qui font foi : plus aucun G0, cp-1, G2 ni cp-2 par lot. **Régime appliqué** : ce plan, puis l'implémentation (tests nommés, tueurs et mutations sur la PR ; R-25 par PR ≈ 1 150, porte CI 1 205), l'intégration dans `lot/page-v1` (`7ae00f37`, disjoint à 23:48:02Z), puis l'inspection unique de la partie 1 (relecture fraîche, oracle complet, F2P et mutants, checkpoint du validateur, G7). **Recommandé** : un domaine de relecture « rpc-guard » (réseau, secret, argent) dans cette inspection, seule relecture indépendante de ce code.
3. Le nom `docs/G0-lot-rpcguard-first.md` est gardé parce que la mission le déclare au linter (MISSION-LINT-OUTPUTS-1) ; il vaut « plan du lot » au sens de la méthode par parties.

### 2.14 Actes de l'orchestrateur au G7

Clore RPC-GUARD-FIRST-APPEND-HEAD-1 et RPC-GUARD-BODY-TIMEOUT-1 (ADR PR-3 l.218, l.220), RG-SNAPSHOT-NONNEG-INT-1 (RECONCILE-1, 1a/Q-V-2, l.195) et RG-PRECEDENCE-TEST-1 (1a/C-V-2, l.196) ; cellule TY-2 (R-3) ; registre PAROXYSME (R-10) ; ligne LC-08 de l'inventaire ; R-1 et R-2 à leur déclencheur ; amendement de NE-5 (l.434) si la lecture « jour zéro » du §2.5 est retenue (É-3).

### 2.15 Questions fermées pour l'orchestrateur

- **Q-1** : le plafond `DEFAULT_MAX_BODY_BYTES` (8 MiB) s'applique à tous les consommateurs du transport, y compris la jambe payante servie de Narabi (`run.ts` l.295) et Bell, avec l'option `maxBodyBytes` et les items R-6 et R-7 avant leur prochain déploiement ou leur prochaine course : **oui (recommandé)** / non (le plafond ne vaut que sur option ; le collecteur devrait alors la passer, ce qui touche `apps/dojo/src/collect.ts`, fichier de lots en vol).
- **Q-2** : I-1 (fsync du dossier parent) est replié dans ce lot : **non (recommandé** : la lecture RQ-1 de `fsync(2)` Linux sur un dossier est un acte sur place que ce plan ne peut pas faire ; la fenêtre « crash de processus » est close sans lui ; la variante « coupure de courant » reste son résiduel) / oui (≈ +8 lignes ; FAITS RQ-1 lus sur place par l'orchestrateur avant l'implémentation).
- **Q-3** : prédicat des relevés : **`Number.isSafeInteger(v) && v >= 0` (recommandé**, surensemble strict) / `Number.isInteger(v) && v >= 0` (lettre de la ligne datée 1a/Q-V-2).

### 2.16 Écarts déclarés

- **É-1** : les règles ont changé pendant la mission (décision 300 à 23:27 UTC, REGLES-MISSION à 23:42 UTC ; mission émise à 23:15:44Z) ; le régime est rendu en deux temps (§2.13).
- **É-2** : la mission écrit « avant A-9 (7) » (NE-5) et « aucun jour de répétition » ; NE-4 (même ligne datée, l.433) place le lot avant A-3, et la répétition rétablie (l.441) remet le premier usage réel au jour zéro (A-7). Ces deux phrases de la mission sont périmées sur ce point.
- **É-3** : incohérence de registre, rapportée et non résolue : NE-5 (l.434, écrite à 23:16) dit « avant A-9 (7) », la l.441 (23:27) rétablit la répétition ; sans effet sur l'ordre, puisque NE-4 place le lot avant A-3.
- **É-4** : périmètre étendu à RG-PRECEDENCE-TEST-1 (« même déclencheur », RECONCILE-1 l.196), absent de LC-08 (inventaire l.27), et à la correction C-RB §6 étape 5 (cp-2 1a C-V-5).
- **É-5** : `isSafeInteger` au lieu de l'`isInteger` de la ligne datée 1a/Q-V-2 : Q-3.
- **É-6** : RG-COURSE-LEDGER-BIND-1 n'a pas de déclencheur à sa ligne (RECONCILE-1 l.197) : défaut de registre, déclencheur proposé (R-4).
- **É-7** : [L299] l.623 (« A-5, premier appel réel ») contredit RUNBOOK-dojo l.157-158 (« writes nothing and calls nothing ») ; l'écart de libellé était déjà relevé (inventaire l.170). La lecture retenue suit le RUNBOOK, dont les §5 à §7 sont inchangés (l.441).
- **É-8** : les numéros de ligne cités de `collect.ts` sont ceux de `ae330bf4` ; `lot/page-v1` a modifié ce fichier (ENTRY-MAIN-LINK-1), ils peuvent y différer.

### 2.17 Non établi, et ce qui le tranche

- Comportement de `fetch` (Node 24, undici) quand le signal s'interrompt après les en-têtes : non lu ; la construction n'en dépend pas (course propre) ; S-1 l'observe.
- « UTF-8 decode » du standard Fetch pour `text()` : non lu ; l'équivalence est prouvée par T-7, pas citée.
- Décodage `content-encoding` par undici : non lu ; S-2 l'observe.
- Plus grands corps légitimes de Narabi (`eth_getLogs`, `eth_getBlockByNumber`) et de Bell (gTFA, `limit: 1000`) : non mesurés dans le dépôt ; R-6, R-7.
- Pic RSS d'un corps de 8 MiB sur le chemin du transport : non mesuré ; S-3 (win32, pas le cgroup de l'hôte).
- `fsync(2)` Linux sur un dossier (RQ-1) : non lu ; I-1.
- Forme exacte de la requête gPA de la sonde 12 (encodage) : non précisée à la l.8 ; la table l.36-40 donne `context.slot` et des octets « re-sérialisés » : la marge ×12,43 est un ordre de grandeur, et S-3 mesure la forme de `collect.ts` l.199.
- Aucun procurement : toutes les sources sont dans le dépôt, ou sont des mesures du G1.

## 3. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict |
|---|---|---|---|---|---|---|---|
| 2026-09-30 (lectures) et 2026-10-01 (écriture, 00:02:37Z) | plan du lot RPC-GUARD-FIRST-APPEND-1 | `claude-opus-5-5` | max | mission `8d14fdde…60cd9` et ses entrées (§1) | planificateur-worker | orchestrateur (R-21), puis inspection unique de la partie 1 | sans objet |

**Conduite** : `git` en lecture seule (`status`, `rev-parse`, `log`, `show` de blobs, `diff --stat`, `diff --name-only`, `worktree list`, `cat-file -t`) ; un `git status` sur le worktree sans `--no-optional-locks` entre 23:15:56Z et 23:16:33Z (rafraîchissement d'index possible, aucun contenu changé), tous les suivants avec `--no-optional-locks` ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun réseau, aucun outil de recherche distant ; aucun test, aucun harnais ; deux `node -e` (§1) ; rien sur C: ; écrits : ce fichier, dans le worktree, et un script de garde d'octets sous `F:/tmp/methode/rpcguard-first/`. Advisor intégré consulté trois fois : après l'orientation (avant l'écriture), sur le conflit des règles de 23:42 UTC, puis avant la remise ; avis, jamais verdict ; chaque point vérifié sur pièce. Éditions après la première écriture (2026-10-01 00:02:37Z) : la date de la l.5 et de la provenance (00:03:19Z), puis, après la consultation de remise, le premier relevé des lots en vol, les lignes atteintes par recherche (§1) et ces phrases de conduite. Le sha256 rendu dans la réponse finale est celui du fichier après ces éditions ; aucune édition ne suit.

## 4. Remise (tâche 3)

Le sha256 final de ce fichier est rendu hors du fichier, dans la réponse finale ; aucune édition après.
