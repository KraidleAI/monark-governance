claude-opus-5-5[1m] (préfixe `claude-opus-5-5`, R-1)

# G0 — lot rpc-guard RPC-GUARD-RECONCILE-1 : journal (sources lues, sha256, questions)

- **Mission** : `F:/tmp/dojo/mission-g0-rg-reconcile.md`, sha256 `a10c344232138c653d2bb5625837af5ab98d9ea87edcf7326c4dff999c40e535`, recalculé égal à la valeur annoncée (`a10c3442…`). Rôle : planificateur-worker `claude-opus-5-5[1m]`, effort max, contexte frais. Lancée par le workflow `wf_afa07dd5-f92` (CHANTIERS du tronc, entrée 13:19Z).
- **Base** : worktree `F:/Monark-wt-rg`, branche `lot/rpc-guard-reconcile-1`, HEAD `d4c12e983ea6107d2b5e0de802951378c618f397`. `git status` à 13:19:36Z : « nothing to commit, working tree clean ». **Arbre propre à l'ouverture.**
- **Livrables** (non suivis, jamais committés) : `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` (151 lignes ≤ 260, première ligne `claude-opus-5-5[1m]`, sha256 final `851b4462c807d0e8af0f839249294c4baf67e190d9563eb9c856cb6038450304` à 14:04:59Z ; version remise à l'advisor : 148 lignes, `e122de60…8647`) ; ce journal (sha256 rendu hors du fichier).

## 1. Chronologie (`date -u`)

| Heure | Fait |
|---|---|
| 13:19:36Z | lecture de la mission, sha256 recalculé ; `git status` propre ; `git worktree list` (dont `-d3` à `d37f258`, `-drand` à `bce645f`, `-dojo` à `ff71bde`) |
| 13:19Z → 13:40Z | lectures du §2 ; `git log d4c12e9..80828a0` au tronc `F:/Monark` (un commit, +7 lignes de CHANTIERS) ; une requête memstack en lecture (un souvenir pertinent : É-3 ×10,33 et chemin du grand livre `F:/monark-ledger/helius-2026-09-19/helius.jsonl`, que je n'ai pas ouvert) |
| 13:40:16Z | relevé sha256, premier lot |
| 13:4xZ | advisor intégré, avant toute écriture (§6) ; lectures complémentaires qu'il demandait (appels gTFA des tests du paquet, appelants de `client.tick`, lanceur `launch-q6.sh`, `bell-ops.test.ts`) |
| 13:50:32Z | relevé sha256, second lot ; sha256 du diff en vol de `-drand` |
| 13:51:49Z | début de l'écriture de l'ADR (outil d'écriture de fichiers) |
| 13:54:20Z → 13:57:31Z | ADR relu en entier ; corrections : 5 numéros de ligne revérifiés par `grep -n` (`cli.ts:32`, `lock.ts:39-44`, `exports.test.ts:74-87`, `collect.ts:766`, `rebase-crosscheck.ts:354/537`), bloc des écarts É-1 à É-9 ajouté, compte des tests et plancher du 22/09 précisés ; sha256 final à 13:57:31Z |
| 13:57Z → 13:59:19Z | ce journal (première version) ; barres obliques inverses retirées |
| 13:59Z → 14:0xZ | advisor intégré, avant la remise (§6) ; vérifications qu'il demandait : corps de `bell_shortpage_probe_transient_error_is_retried` (l.1572-1585, chemin hors ligne, aucun crédit) ; `stdout` et `exitCode` dans les tests qui lancent le bin (`repair-tail.test.ts:84`, l.278, l.292, l.304, l.320) ; édition de l'ADR |
| 14:04:59Z | sha256 final de l'ADR (151 lignes) ; mise à jour de ce journal |

## 2. Sources lues (niveau [lu], lecture seule ; aucune page web, aucun réseau)

| Source | sha256 | Étendue lue |
|---|---|---|
| mission `F:/tmp/dojo/mission-g0-rg-reconcile.md` | `a10c3442…e535` | entière |
| `docs/adr/ADR-RPC-GUARD-DRAND-1.md` (forme) | `3048c5f294629699dd40cc21bfbd42d098c0d0533de79e7c63f7591801944bbb` | entière (119 l.) |
| `F:/Monark-wt-dojo-d3/docs/G1-lot-dojo-pr2b3.md` (non committé) | `bcaeb783448391f0d9acbb85fcaba5ebec0ceae3219c418eeafea020f734a9da` | entière (154 l.) |
| `F:/Monark-wt-dojo-d3/docs/adr/ADR-DOJO-PR-2B.md` (modifié, non committé) | `5b97fcdd249af90b2e3a697fa5a37e1bdd8d3f81657881c4293da854ae502395` | l.925-967 (lignes datées ; ligne de l'orchestrateur 13:16Z en l.967) |
| `F:/Monark-wt-dojo-d3/apps/dojo/src/history-collect.ts` (non suivi) | `141dc63cfcf99dffedf6840e96bcecb85027f56f2877ed15e037167b857e623f` | entière (311 l.) |
| `F:/Monark-wt-dojo-d3/apps/dojo/test/dojo-history-collect.test.ts` (non suivi) | `736062e00b803e76ae16d7bf0d53077d13f33049b5e9256b4805f821182701a8` | l.80-125 (rapprochement servi, reprise, durée) |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (tronc = `F:/Monark-wt-dojo`, octets égaux) | `45500ca0a45b397cd385a6984d397c30f3e8ec99a6c95f7468003e278f401986` | l.1-120, §11 l.649-690 (dont l.682, l.684), cinquième et sixième plis l.896-941 (dont l.910), treizième pli l.1225-1244 (dont l.1237, l.1240) ; les autres sections, qui portent sur D-1 à D-18 de la pièce et non sur le garde, n'ont pas été lues |
| `docs/adr/ADR-DOJO-PR-2B.md` (tronc) | `b67d728f092f62b295d14b68cc18e77f77669ccddf40da94f12b9bd05d2b5ee1` | entière (944 l.) |
| `docs/adr/ADR-DOJO-PR-2.md` | `6acbdc5a3b9359ac3379872abbd9be7e9f1e4b3a267ef772c23e48e8567ae324` | D-6 (l.21, l.174), lignes trouvées par recherche de « rapproch », « plafond », « D-13 », « reconcil » ; aucune occurrence de `DOJO-RECONCILE` (É-8) |
| `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` | `de27e4e3f678e7f20fc1c80f1770fa2a9a036ba8215dbb7f599c96bd58f3d1b9` | l.20-110 (D2, D3, D4, tuyaux, items), l.136-137, l.1046-1047, l.1207-1210 (D-FS-5), l.1278-1280, l.1292-1293 |
| `docs/CHANTIERS.md` (base `d4c12e9`) | `6248b1a549a3aa3d38bf87971505ea65eec608276f90b48391773f37c9322c1a` | décision 112 (l.482-483), l.566, l.644, l.746, décision 247 (l.1685), HELIUS-CREDIT-RECONCILE-1 (l.1770, l.1811), entrées Dōjō l.1579-1601 par recherche |
| `F:/Monark/docs/CHANTIERS.md` (tronc `80828a0`) | `7a3a709e1877b492a4af27a912dc890fbedefc9af1ccb3f8bc8e732e2bf0472b` | diff `d4c12e9..80828a0` seul (entrée 13:19Z, 7 lignes) |
| `docs/dojo/FAITS-helius-credits-2026-09-27.md` | `30b60bc570fba4fb61200c767f734f40e7890a77c72f17a29777c7011456dfca` | entière |
| `docs/dojo/FAITS-cp1d-lectures-2026-09-26.md` (L-1, L-2, §4) | `598a43e59ed616e64f140acbb6794513fe3c873d2ed1a00aff957ac0840b856a` | entière |
| `docs/dojo/FAITS-probe-3-2026-09-26.md` | `de96f09244b6bcfdc7c6fc4d70efef6259b6172ac925cb27066b495cd5cef46c` | l.28-32 |
| `docs/dojo/FAITS-acte-0-2026-09-26.md` | `0bc3827a025e82f0505ddaaf2bd36ed9f32d83b8809cb6667cb08e1d02c133a6` | entière |
| `docs/course-bell/FAITS-floor-helius-2026-09-22.md` | `6b1e2752425751765f535ce2086f51dfa0ba10287eaf5aed41eddfcf5280149a` | entière |
| `docs/course-bell/FAITS-floor-helius-n2-2026-09-22.md` | `6019337ebd2169a745a84c716dfaf5a7b19f9403c84dac4b721413780a54224f` | entière |
| `docs/course-bell/FAITS-floor-helius-n3-2026-09-23.md` | `5641379508d20582dc998e2fd4ba7022f83fca5f1e90d88b175537a0d3b936a4` | entière |
| `docs/RUNBOOK-rpc-guard.md` | `ae0c283a83e65223bd9045ea2a2955b66c0e899b7230d1ec47d2502952510c2e` | titres et lignes « reconcile » (§3 étape 6, §4, §5) |
| `packages/rpc-guard/src/reconcile.ts` | `6e62cd6a67400197e126cca499d85fac78dc985d1dbb008b59a03b4ee7b0a5aa` | entier |
| `packages/rpc-guard/src/tariff.ts` | `77d5876ccecbb45a310cb09d7e33fc2057162855575a47c196b3888bcb343b48` | entier |
| `packages/rpc-guard/src/ledger.ts` | `625c759fa6bc86748db4680b09419cebd1fe84677fb15b1e7a185d7f365146cb` | entier |
| `packages/rpc-guard/src/client.ts` | `6553556c5d21079ac9609040f5bf312b81faf6ab8a472ea3d04dbb5a8402d50f` | entier |
| `packages/rpc-guard/src/transport.ts` | `64a84454b8e8acd8c9f1cbb6347e0dc174f3a695573fa2d8ddbedbdbeb17385e` | entier |
| `packages/rpc-guard/src/cli.ts` | `dccbe95f132d8b1f4e1c2088fe43abda15d10781fd4c62d273e55877e8d87d20` | entier |
| `packages/rpc-guard/src/guarded.ts`, `lock.ts`, `index.ts`, `errors.ts`, `bell-methods.ts` | `a36fa005…fab6`, `6655a9c8…c244`, `db2908e9…c5c8`, `8622947f…c504`, `a18b856b…935d` | entiers |
| `packages/rpc-guard/bin/rpc-guard.mjs` | `aadd89833c5ee963f69cc88daa1ffd559aa9ff091a5b4f842fceab19245ce745` | entier |
| `packages/rpc-guard/test/reconcile.test.ts` | `1d80f102d6df25711cdeab2016ba30654b9e9af237154c002e52dd718c62f089` | entier |
| `packages/rpc-guard/test/caps.test.ts` | `83f94f73d2cd307c21674c6e43d15c9f89e34c7598f811c99976bcd448657271` | entier |
| `packages/rpc-guard/test/ledger-format-lock.test.ts` | `699546fdd39f3e0ff8665c40adde6a69d251622b3abf416fd4bdb66485bbc9d4` | entier |
| `packages/rpc-guard/test/exports.test.ts` | `8e69ccd545e9505fe8dc04197bb101e4f50463635b7d02cdfd5bfcb7fd8a37a8` | entier |
| `packages/rpc-guard/test/tariff.test.ts`, `harness.ts` | `a79671f9…b13d`, `9188c606…c6b3` | entiers |
| `packages/rpc-guard/test/ledger.test.ts`, `multi-operator.test.ts`, `error-hint.test.ts` | `9c9e6983…c846`, `34ca56d6…f103`, `f8543bb9…ceb6e` | l.68-90 ; l.20-40, l.55-85 ; l.150-200 ; plus recherche de `getTransactionsForAddress` dans tous les tests du paquet |
| `packages/rpc-guard/test/repair-tail.test.ts` | `de8880b8bfe7ebc81055f9655bee7a0bab5b2d842cf0e923952afde42e0ca11e` | liste des tests ; l.42-91 par recherche (`unlock`, `exitCode`) ; l.265-296 ; lignes `stdout` (l.222, l.228, l.232, l.278) |
| `test/guard-scripts-u4.test.ts`, `apps/sentinel/test/ukemi-guard-record.test.ts` | `dc61087e…9651`, `49f8c3ed…489c` | lignes `stdout` et comptes d'issues (l.126-164 ; l.260-335, l.494-497, l.701-703) |
| `apps/bell/src/collect.ts` | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` | l.300-346, l.440-530, l.630-790 ; recherche de `unlock`, `--course-end` (absent), `max-credits` |
| `apps/bell/src/rebase-crosscheck.ts` | `15cc8773bf3bbddb7545ae5c7a2d2160ce8c6b8f1ed09850f300a514255c1adb` | l.30-110 ; recherche de `GTFA_PAGE_LIMIT` et `getTransactionsForAddress` |
| `apps/bell/src/rebase-produce.ts`, `discover.ts`, `operators.ts` | `25a64a65…60e9`, `c033ea4d…dca3`, `8e76a6c9…a50e` | l.70-100 ; l.118-145 et l.248 ; l.10-34 |
| `apps/bell/ops/launch-q6.sh` | `96a3f839570a747f60142db557f974dfee2c6397364dfc6bcfca704d41e0e451` | en-tête l.1-30, l.45, l.49, l.54-58, l.99-101, l.140-148 |
| `apps/bell/test/rebase-crosscheck.test.ts` | `bed50110c8850b05cdb0ea4e3c0d1be55a4933367c08204438e3a415bf17a091` | l.1328-1460, l.1555-1585 ; recherche de `max-credits`, `NF_P1` |
| `apps/bell/test/bell-ops.test.ts` | `777c37bccebe0551c9e4c6877eb3d9bd945125ae8ec7f7fb3767ff762f83362b` | l.30-67 |
| `apps/bell/test/fixtures/series/spike/PROVENANCE-spike.md` | `2b40464c2351766278ff14a23b0e4189e1241cbe8ff362184afc434d960bc39b` | l.25-27, l.51 |
| `apps/dojo/test/fixtures/history/sig0.a-page.json` | `e7479f891bf773ec953d9500e5a4cdbde94e8ca4d7250cd81b6fdf32e2a6df2d` | clés de tête décodées du JSON hexadécimal (`data`, `paginationToken`) ; corps non reproduit |
| diff en vol de `F:/Monark-wt-drand` (`git diff`, lecture seule) | `6c0808ef5d9ba45a7b2607847f73efa798e37cc474e9e0d06c269cd2eef07f27` | `client.ts`, `ledger.ts`, `transport.ts`, `index.ts` |
| recherches transverses | — | `BELL_SOLANA_RPC` dans le dépôt hors `docs/` (hôtes des tests) ; `heliusCredits` ; `helius-2026` ; `.tick(` ; `RECONCILE-WINDOW-1` ; `DOJO-RECONCILE` ; `6761` dans `docs/` |

## 3. Décisions (résumé ; l'ADR fait foi)

- D-1 : course = lignes entre la dernière frontière et la ligne `unlocked` ; `course_id` = sha de cette ligne (`--course-end`, rendu par `unlock`) ; issue `course_reconciled` avec `course: {from, to}` ; mode historique inchangé ; format v2 ; docstring D-FS-5 repliée.
- D-2 : réservation 10 × ⌈limit/100⌉ dans `meter` et la ligne `attempted` ; ligne `settled` signée après la réponse (10 × max(1, ⌈n/100⌉)) ; réponse en échec réglée à 0 sous Q-O1 (a) ; `HELIUS_TARIFF_VERSION` `helius-2026-09-26` ; Bell garde `limit: 1000` ; effet chiffré.
- D-3 : `mainnet.helius-rpc.com` ou `.invalid`, `https`, sans userinfo, requête, fragment ni port ; refus nommé avant verrou.
- **R-25 estimé par PR** (ascendant, jamais une mesure) : **1a ≈ 184 (×2,1 ≈ 386) ; 1b ≈ 190 (≈ 399) ; 1c ≈ 63 (≈ 132) ; lot ≈ 437 (≈ 918)**. É-6 : +292 sur les 145 de la mère, détaillés par nom. Coupe de repli nommée : 1a (i) ≈ 158 / (ii) ≈ 26 ; 1b (i) ≈ 168 / (ii) ≈ 22.
- Tests existants amendés, par nom (treize) : `repair_tail_composition_power_cut_signature_to_unlock_and_reopen` et `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (`repair-tail.test.ts`, sha d'`unlock` rendu et imprimé) ; `run_credits_cap_stops`, `cycle_cap_stops`, `cycle_cap_floor_probe` (`caps.test.ts`) ; `public_api_freezes_the_prior_p3_floor`, `transport_error_never_carries_url_or_key` (`exports.test.ts`) ; `two_paid_operators_keep_separate_priors_and_units`, `run_caps_are_per_operator_at_the_meter` (`multi-operator.test.ts`) ; `unknown_method_fail_closed` (`tariff.test.ts`) ; sous Q-O2, `crosscheck_credits_derived_from_ledger`, `bell_crosscheck_guarded_resume_without_loss_after_budget_stop` et `bell_shortpage_probe_metered_on_the_guarded_cycle_ledger…` (`apps/bell/test/rebase-crosscheck.test.ts`). `ledger_stamps_tariff_version_per_operator` ne fixe que le préfixe `helius-` : non touché.

## 4. Questions (liste fermée ; texte entier au §3 de l'ADR)

- **Q-I1 (investisseur)** : aucune course Bell gTFA avant le G7 de 1b et BELL-GTFA-CREDITS-1 (a, recommandé), ou une course sous go par action avec `--max-credits` divisé par 10 (b).
- **Q-O1** : réponse en échec réglée à 0 selon L-2, avec mesure (a, retenu), ou toute réservation gardée (b).
- **Q-O2** : amendement par 1b de `apps/bell/test/rebase-crosscheck.test.ts` sur trois points : oui / non.
- **Q-O3** : cp-2 de PR-2b-3 conditionné aux G7 de 1a et 1b seuls : oui / non.
- **Q-O4** : gel de `reconcile.ts` au sha `6e62cd6a…` levé : oui / non.
- **Q-O5** : `course: {from, to}` dans la ligne, verdicts par méthode dans la sortie du CLI : oui / non.
- **Q-O6** : hôtes `.invalid` admis comme classe de test, sous réserve de FAITS-RFC6761-INVALID-1 : oui / non.
- **Q-O7** : G1 de 1b depuis un tronc portant DRAND-1a et 1a : oui / non.
- **Items formés** (ADR §4) : GTFA-FAILED-CALL-BILLING-1, FAITS-RFC6761-INVALID-1, BELL-GTFA-CREDITS-1, BELL-COURSE-END-1 ; item hérité D-FS-5 replié dans 1a. **Procurements** : aucun, toutes les sources étant dans le dépôt ou des pages publiques à lire sur place.

## 5. Règles tenues

- Documentaire seulement : aucun code, aucun test, aucune configuration touchés. Deux fichiers créés sous `docs/`, non suivis. `git status --short` final : `?? docs/G0-lot-rpc-guard-reconcile-1.md`, `?? docs/adr/ADR-RPC-GUARD-RECONCILE-1.md`.
- `git` en lecture seule : `status`, `log`, `rev-parse`, `branch --show-current`, `worktree list`, `diff` (y compris dans `-d3` et `-drand`, jamais modifiés). Aucun `add`, `commit`, `stash`, `checkout` ni clone.
- Aucun réseau : aucun outil web, aucun RPC. Rien sur C: : lectures et écritures sur F: seulement ; sorties longues du harnais sous `F:/claude-config`.
- Aucun secret lu : la valeur de `BELL_SOLANA_RPC` n'a jamais été lue ; l'hôte de production vient du fichier committé `launch-q6.sh:45`. Aucune clé, aucun `.env` ouvert ; le grand livre `F:/monark-ledger` n'a pas été ouvert.
- Les deux longs fichiers ont été écrits avec l'outil d'écriture, puis corrigés par l'outil d'édition, et non par heredoc. Motifs : bornes de lexage du harnais (HARNESS-BASH-8K-1, précédent en PR-2B §13) et HARNESS-BASH-BACKSLASH-1. Aucun des deux textes ne contient de barre oblique inverse (vérifié par `grep -c` sur les deux fichiers).

## 6. Advisor

- **Consultation 1 (outil intégré, avant l'écriture)** : dix points, tous vérifiés sur pièces, puis appliqués :
  - (1) règlement des réponses en échec, arithmétique de la bande souple et alternatives (a)/(b) portées en Q-O1 ;
  - (2) inventaire complet des appels gTFA dans les tests du paquet, qui a ajouté `multi-operator.test.ts` et confirmé `ledger.test.ts:86` inchangé ;
  - (3) appelants de `client.tick` : aucun hors du paquet ;
  - (4) É-3 justifié par `launch-q6.sh:12`, `:19` et `reconcile.ts:40` ;
  - (5) É-6 détaillé par nom ;
  - (6) asymétrie des refus justifiée ;
  - (7) seconde barrière TLS (`launch-q6.sh:23`, `bell_ops_launch_unsets_only_read_unneeded_vars`), et longueur 31 citée comme corroboration seulement ;
  - (8) instantanés en CSV exact ; l'acte 0 n'est pas rapprochable par méthode ;
  - (9) justification de la borne de réparation ;
  - (10) ordre des livrables.
  - C'est un conseil, jamais un verdict.
- **Consultation 2 (outil intégré, avant la remise, sur les livrables écrits)** : cinq points et une précision, tous vérifiés sur pièces, puis appliqués :
  - (1) l'aide `attemptedOf` de Bell sert à la fois aux comptes et aux sommes. La correction garde le compte sur les seules lignes `attempted` et ajoute une aide `creditsOf` pour les sommes. Le test du réessai de la sonde est hors ligne et n'asserte aucun crédit (lu) ;
  - (2) les tests qui lancent le bin : `repair-tail.test.ts:84` (`deepEqual {exitCode: 0}`) et l.292, l.304, l.320 (stdout `""` d'`unlock`) sont amendés et déclarés, +8 lignes pour 1a ; les contrôles de fuite de l'enregistreur Ukemi et les comptes de `guard-scripts-u4` sont à contrôler par nom ;
  - (3) l'alternative de versionnage « champ `format: 2` » est nommée et rejetée ; les assertions v2 sont placées avant le `t.skip` de la l.44 ;
  - (4) coupe de repli nommée pour 1a et 1b ;
  - (5) consigne pour PR-2b-3 sous Q-O1 (a) ;
  - précision « dans une seule course » pour le chiffre de 426 186.
  - R-25 porté de 425 à 437 lignes. Conseil, jamais verdict.

## 7. Demande relayée hors mission

- Le harnais a relayé la demande de l'investisseur « 33 documents demandés (10 prioritaires) donne moi leurs DOI ». Elle ne fait pas partie de cette mission. D'après CHANTIERS du tronc (`80828a0`, entrée 13:19Z), l'orchestrateur a déjà rendu la liste des 33 procurements PAROXYSME avec DOI (PXP-01 à PXP-33 ; P1 = 01 à 10). Ce worker n'a rien fait à ce titre (question à l'orchestrateur dans la réponse).
