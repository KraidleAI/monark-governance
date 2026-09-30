claude-opus-5-5

# G0 — journal du pli du lot Dōjō PR-3a-1c « éditeur : vérification avant engagement, tests manquants, version de prix atomique » (ADR-DOJO-PR-3), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant déclaré par le système), effort high (mission), contexte frais. Planificateur-worker ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : `F:/tmp/dojo/mission-g0-pr3a1c.md` (5 016 octets), sha256 recalculé AVANT lecture = `7bd7bb588fd0f5f7d088620f6abc6f9f94b30503e5852a303b5125c82f6d7200`, égal au reçu `F:/tmp/dojo/mission-g0-pr3a1c.recu.json` (verdict `vert`, 12 codes à 0, `base` = `head` = `0d9913e46f7e128ec7228945fe88f26d0398594d`, 2026-09-30T02:00:41Z). Règles `F:/Monark/docs/methode/REGLES-MISSION.md` lues en entier (17 l., sha256 `c5a3c674a5c1b1411acf3fd7133f34e8e4444bc4741ac527656a916715711f5b`).
- **Livrable** : pli « Pli G0 de PR-3a-1c » en fin de `docs/adr/ADR-DOJO-PR-3.md`, l.295-383 (89 lignes ≤ 120), insertions seules : les 294 lignes d'avant sont identiques octet pour octet à la copie d'avant (`cmp`). ADR d'avant : 294 l., sha256 `dd630e8750b618038569ea22fbe6a54bc51dc92b35331c75450d31d299bb03dd`. **ADR final : 383 l., 106 804 octets, sha256 `52dc1da8eef262165ccb7b90054d050cecb8cfcf73cd60262e161aecf35011df`** (02:33:47Z), aucune édition après. Garde d'octets : 0 TAB et 0 CR (octets 0x09 et 0x0D comptés par `od -tx1`), 0 point de code de contrôle C0 hors LF, 0 C1, 0 barre inverse, pas de BOM, LF final. Ligne d'ancre du générateur (`scripts/mission/gen.mjs` l.10) : `| PR-3a-1c |` à la l.312, seule de sa forme.
- **Empreinte intermédiaire, remplacée** : `5a70a6b9650fe2fa1faf0f543c506bf4eaec033289a5b51e34b37a6606daa5ac` (02:32:13Z), avant la correction d'É-C2 (écart J-3 ci-dessous) ; une seule ligne changée (l.374).
- **Base** : worktree `F:/Monark-wt-dojo-pr3a1c`, branche `lot/dojo-pr3a1c`, HEAD `0d9913e4` (tronc), verrouillé ; `git status` à l'ouverture (vers 02:01Z) : propre ; à la remise : ` M docs/adr/ADR-DOJO-PR-3.md`, `?? docs/G0-lot-dojo-pr3a1c.md`.

## Horloge (`date -u`)

02:00:58Z (règles, état du worktree) ; 02:01:12Z (sha256 des entrées, gel `48556d80` relu propre) ; 02:20:39Z (HEAD de PR-1b-4 relu : gel 2 `db158c8a`) ; 02:29:44Z (copie d'avant, début de l'écriture du pli) ; 02:31:39Z (fin de l'écriture) ; 02:32:13Z (première empreinte) ; 02:33:47Z (correction d'É-C2, empreinte finale) ; le journal suit.

## Lu (sha256 recalculés à 02:01:12Z sauf mention)

| Entrée | sha256 | Lecture |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-3.md` (294 l., avant le pli) | `dd630e8750b618038569ea22fbe6a54bc51dc92b35331c75450d31d299bb03dd` | en entier |
| `F:/tmp/dojo/g2-pr3a1b/G2-report.md` (128 l.) | `4f1a74864e9c05f1201ee03348db1e8269c586aa0aa03529a22f6d36b69c78b5` | en entier |
| `F:/tmp/dojo/g2-pr3a1b/logs/proto-vbc.diff` (364 l.) | `d7cf2bc8e6128efd8702e4513dc19b6ad58d126e95dd94ea61eb4b5fde32dd1f` | en entier ; recompté (M-1) |
| `apps/dojo/scripts/dojo-publish.mjs` au gel `48556d80` (343 l.) | `8d864a9c156eb9611399fdac6f0daf2c19a1650a0f7bf0d2d1c3aa5becaeb0f9` | en entier |
| `apps/dojo/test/dojo-publish.test.ts` au gel (486 l.) | `a5d1fa1f7f122094477475f2080cebec0589f14e26b2c0a590c881ed5e36260f` | en entier |
| `test/dojo-publish-e2e.test.ts` au gel (129 l.) | `afef7b9d6fe95344087e8e9921c8bacc875ab1694ba1657cb20d5073cdb46544` | en entier |
| `docs/G1-lot-dojo-pr3a1b.md` au gel (181 l.) | `97b800ba051f74d304b186cdc6ba83d679725391089426fe5a1a86f9d6b4b054` | §10 et §11 en entier ; en-tête, §2 et §5 (R-25) |
| `apps/dojo/scripts/dojo-verify.mjs` du tronc (355 l., égal au gel) | `d768df168b1784bc53e76989c0a767bfb7e737f7fd7c6075565bb7fc98b349cb` | en entier |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (1 363 l.) | `562d9be74707b38f49c8c4ea04c30153504a875cdbb2197e0943bcd5c3a69f0c` | T-9 (l.427) ; D-17 (l.296-308) ; l.17, l.344 (T-17), l.555 (FM-3.3) |
| `docs/CHANTIERS.md` (2 204 l.) | `a94dede887aab9315c88ae9a05c0590a599df2b3bbdbb9bbe5a903fb2a734a0d` | entrées du 2026-09-30 (l.2122-2129) en entier ; l.2118 (R25-FACTOR-DRIFT-1) |

**Hors liste, lus pour trancher sur pièce** (sha256 à la lecture) :

| Fichier | sha256 | Objet |
|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` du tronc (168 l.) | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` | l.60-130 : `versionCheck`, `snapshotCheck` (Q-2) |
| `dojo-verify.mjs` de PR-1b-4, gel 2 `db158c8a` (422 l. ; lu dans l'arbre de travail avant ce commit, égal au blob) | `596a349dbf64afcf3c408ceaee27c40c4287b56d01f09b4c92542e45e48aef59` | exports, bornes (l.41-62, l.81, l.92), `fetch(` l.85 |
| même fichier au gel 1 `381de4fd` (`git show`, 422 l.) | `f3292bdba25c1434528809ad12ef928f230b7e54dbf88ccf9c9217ea06118298` | `fetch(` l.85 |
| `docs/adr/ADR-DOJO-PR-1B-4.md` (gels 1 et 2, blob identique) | `888d5a5b2fc6d83119d5dfeff5589b8c22fddfdc464da2e3842be0221548bca5` | l.11, l.19, l.48, l.152-159, l.193 (R25-FACTOR-DRIFT-1) |
| `apps/dojo/src/dojo-methods.ts` du tronc | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` | exports ; aucun import ; aucun jeton interdit (M-3) |
| `apps/dojo/src/bundle.ts` du tronc | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` | `read_rule` et `readInstants` : l.9, l.37, l.88, l.109, l.116-117 seulement |
| `apps/dojo/src/layout.ts` du tronc | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` | aucun `read_rule` ni `readInstants` (faisabilité de T-1) |
| `F:/tmp/dojo/g2-pr3a1b/mutants/g2-rows.json` | `fc07ec8bbf019ed5048d5c63bd37c6670f6dce6d0c23b41c12b70afc6e1c333c` | six survivants (ligne, avant, après) |
| `F:/tmp/dojo/g2-pr3a1b/mutants/table-g2.json` | `bb9f42722a24ad20a2bfc63b5bf7f001243fd7643a29db37d948e50eca447b51` | identifiants (aucun `M-E13` ni au-delà) |
| `F:/Monark/scripts/oracle/r25.mjs` | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | l.1-19 : `git diff --shortstat <base>...HEAD`, sans `-M`, `-C`, `-B` |
| `F:/Monark/scripts/mission/gen.mjs` | `9eecb3717c7a2ad11a021d81ebfe949dc38c9279c8db73743fe6b07c82711ae2` | l.1-40 : ancre = première ligne qui commence par `| <LOT> |` |
| `F:/Monark-wt-dojo-pr4c1/docs/adr/ADR-DOJO-PR-4.md` (branche `lot/dojo-pr4c1`, `e84804a8`) | `d4b738458a20ea5807c1c37d9c2bda6d76aea916b6a6904e3503782da64ad467` | l.268-294 : forme d'un pli G0 de sous-lot |
| `docs/G0-lot-dojo-pr3.md` du tronc | `deb0a8b77bfc114c689fd2fb2cb7e5702a0780a80b3daee1a4b035deda023cca` | l.1-40 : forme de ce journal |

## Mesures (reproductibles ; aucune n'exécute de code du dépôt)

- **Gel de référence** : `git rev-parse b0e595a5^{tree} 48556d80^{tree}` = `04b707c23d66ccd0ef1f9953f9b9a901b848fb2b` deux fois ; parent de `48556d80` = `450830fe` ; `git diff --stat b0e595a5 48556d80` vide ; `48556d80` n'est pas ancêtre de `0d9913e4`. Les numéros de ligne du G2 valent pour le gel.
- **M-1 (prototype en lot séparé)** : `awk` sur `proto-vbc.diff` (lignes `+` et `-` hors en-têtes) : `.d.mts` +2/−2, module +11/−5, test unitaire +52/−43 (24 lignes de tueurs, 71 autres), TU-1c +3/−2 : **+68/−52 = 120**. Le « +22 » du G2 (l.66) = 558 − 536, delta d'un lot plié dans 3a-1b (É-C1).
- **M-2 (VAE universelle)** : au gel, lignes appelant `publishAnchor(`, `rotateKey(` ou `revokeKey(` : 35 (unitaire) + 1 (TU-1c) ; lignes `world(` : 11 + 2 ; corps de test synchrones touchés : l.208, l.254.
- **M-3 (liste interdite du test de fermeture, l.191, appliquée par `grep -E`)** : vérificateur du tronc : 0 occurrence ; PR-1b-4 (gels 1 et 2) : 1, `fetch(` l.85 ; `dojo-methods.ts` : 0.
- **M-4** : bornes totales de PR-1b-4 (`MAX_FILES`, `MAX_TOTAL_BYTES`) appliquées dans `urlSource` seul (l.81, l.92) ; `dirSource` n'a que la borne par corps.
- **M-5** : mère l.17 (« versionné chaque semaine … jamais rétroactif »), l.304 (« jour d'effet (le lendemain de la fenêtre) »), l.305 (« Première version : à la fin du septième jour compté après l'ancre »), l.344 (T-17), l.555 (FM-3.3) : relus par `sed`.
- **M-6** : `DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1` et `DOJO-PUBLISH-PV-ATOMIC-1` : 0 occurrence dans l'ADR PR-3 avant ce pli (présents au CHANTIERS l.2124 et à `docs/FILE-ATTENTE-2026-09-28.md` l.220).

## Décisions (une ligne ; détail au pli, PC-0 à PC-4)

- **Q-1** : VAE dans `publishDay` (le `snapshot` et la `price_version` vérifiés ensemble, et la version complétée) ; `--anchor` refuse un `read_rule` autre que `READ_RULE` ; lignes d'ancre et de clé en miroir (liste fermée PC-2) ; généralisation = DOJO-PUBLISH-VERIFY-ALL-LINES-1.
- **Q-2** : contrôle par `dojo-verify` (N1 jour d'effet = fin de fenêtre + 1, N2 sans recouvrement, N3 fenêtre la plus précoce, exception de tête), codes réutilisés, lot du vérificateur (DOJO-VERIFY-PV-SCHEDULE-1) ; reformulation rejetée (T-17).
- **DOJO-PUBLISH-PV-ATOMIC-1** : reprise qui complète au démarrage de `--inbox` (seule action du lancement, vérifiée), `price_version_pending` à `--anchor` ; ≈ 18 lignes ascendantes.
- **Tests manquants** : T-3 (C-G2-2), T-4 (C-G2-3), T-5 et T-6 (C-G2-4) tuent G2-M1, G2-M2, G2-M4, G2-M3, G2-M10, G2-M12 ; T-1 = irréversibilité.
- **R-25** : 170 asc. (111 recomptées + 59 estimées) ; ×2,31 = 392,7 ≤ 547, solde 154,3 ; 170 ≤ 497 ; repli pré-déclaré 150 / 20.
- **Déclencheur** : G1 après les G7 de PR-3a-1b et de PR-1b-4, et du lot du vérificateur sous Q-C1 = (a) ; G7 avant A-8.

## Items et questions

- Neufs : DOJO-PUBLISH-VERIFY-ALL-LINES-1 (Q-C3), DOJO-VERIFY-CORE-NO-NET-1 (Q-C1), DOJO-VERIFY-PV-SCHEDULE-1 (avant A-10, ou avant le G1 sous Q-C1 = (a)), DOJO-VERIFY-INDEPENDENT-1 (cartographie de clôture de phase). Clos au G7 de PR-3a-1c : DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1 (texte corrigé par C-G2-6), DOJO-PUBLISH-PV-ATOMIC-1. Étendus ou rattachés : DOJO-PUBLISH-SCALE-1, DOJO-PUBLISH-SINGLE-WRITER-1 (Q-C2), exigence VAE au G0 de PR-3a-2, consigne STOP du RUNBOOK-dojo (G1 de PR-3b-2).
- Questions fermées : Q-C1 (cœur de vérification : (a) lot PR-1b-5 d'abord, recommandé ; (b) exception étroite), Q-C2 (SINGLE-WRITER : lot propre, recommandé), Q-C3 (déclencheur de la VAE universelle : (a) première ligne de clé sur l'hôte, recommandé).

## Conduite

- Aucun appel réseau ; aucun navigateur ; aucun test, harnais, oracle ni mutant (lot documentaire) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; `git` en lecture seule (`status`, `log`, `rev-parse`, `diff --stat`, `merge-base`, `cat-file -p`, `show <rev>:<chemin>`, `grep`, `worktree list`) sur ce worktree, sur `F:/Monark-wt-dojo-pr3a1b`, `F:/Monark-wt-dojo-pr1b4` et `F:/Monark-wt-dojo-pr4c1` ; rien sur C: ; copies de travail sous le bloc-notes de session `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/` (copie d'avant de l'ADR, extrait du CHANTIERS). Deux écritures dans le worktree : le pli (ajouts par morceaux de moins de 6 Ko : 3 174, 2 050, 4 082, 5 303 octets de contenu, puis les autres plus courts) et ce journal. `node -e` n'a servi qu'à lire des JSON et compter des points de code.
- **J-1** (vers 02:01Z) : deux `git status` lancés sans `--no-optional-locks` (ce worktree, puis `F:/Monark-wt-dojo-pr3a1b`) : lectures, git peut y rafraîchir l'index sans toucher au contenu ; lectures git suivantes avec `--no-optional-locks`.
- **J-2** : un comptage des CR par `od -c | grep` a rendu 3 303 (faux positif sous MSYS, déjà vu au G2, E-5) ; recompté en hexadécimal (`od -tx1`) : 0, comme le décompte des points de code.
- **J-3** : le worktree de PR-1b-4 est passé du gel 1 `381de4fd` au gel 2 `db158c8a` pendant ma lecture ; `596a349d…` est le fichier du gel 2 (relevé dans l'arbre de travail avant son commit) ; le pli disait d'abord « gels 1 et 2 » pour cette empreinte ; corrigé à 02:33Z (l.374) après mesure du gel 1 (`f3292bdb…`, `fetch(` aussi l.85) ; empreinte de l'ADR recalculée.
- **Advisor intégré, consultation 1 (avant l'écriture)** : Q-1 (a) confirmé avec la liste fermée des miroirs, garde `read_rule` à décider et non à demander, alternative et conséquences à écrire ; Q-2 (a) confirmé, livrable = texte de la règle (éligibilité, ancre neuve, N1 à N3, exception de tête, codes réutilisés) ; reprise qui complète confirmée, deux pièges à nommer (`RangeError` sans `snapshot`, arrêt durable si complétion refusée) ; R-25 : les deux lectures et l'écart du « ≈ 37 » ; **angle mort signalé : `fetch(` du vérificateur de PR-1b-4 dans la fermeture de l'éditeur**, mesuré ici (M-3) et devenu É-C2 et Q-C1 ; item FM-3.3 si la mère n'en a pas (elle n'a que la parade l.555) ; mécanique (empreintes des fichiers hors liste, ancre du générateur, garde d'octets, ordre de remise). Conseil, jamais verdict ; chaque point vérifié sur pièce. Consultation 2 (avant la remise) : après ce journal ; son avis est rendu dans la réponse à l'orchestrateur.
- **`error_origin` proposés** (à assigner au G7) : É-C1 = relecteur G2 et orchestrateur ; É-C2 = aucun ; É-C3 = aucun (précondition implicite de `versionAfter`, jamais atteinte au gel, atteignable seulement par D-C3) ; J-1 à J-3 = ce planificateur.
