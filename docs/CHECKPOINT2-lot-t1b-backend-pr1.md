# Checkpoint-2 — lot T-1b-backend, PR-1 (validateur-humain Fable 5.1)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/cp2-t1b-pr1/CP2.md` (sha256 4e2070e341bea7b2a458efdf6592ec78c726bf400a5289277afd9ce4bae533d7). Décision : ACCEPTE-AVEC-CORRECTIONS (C-V-1 vocabulaire des labels ↔ garde `BARE_LABEL` + pli (b) FAULTS-PROVIDER-NAME-1 ; C-V-2 test tueur de la branche `inspect` (mutant mv5 survivant) ; C-V-3 lignes ADR D-9/D-13/D-20, `error_origin` PROC/D-18, CI-POSIX-FSYNCDIR-1 sous décision 136, PR du test « aucune publication privée » ; C-V-4 observation anti-close consignée, aucune purge). C-V-1/C-V-2 transmises au worker PR-2 (17:0xZ) ; C-V-3/C-V-4 au G7. Rejeu indépendant : tests 26/26, R-25 1 134, périmètre 0 ligne, mutants propres mv1-mv4 tués, sortie réelle de `runMain` sondée (labels nus publient, labels pointés refusés).

---

# CHECKPOINT-2 — LIVRABLE PR-1 du lot T-1b-backend (validateur-humain Fable 5.1) — FIGE 2026-09-23 16:3xZ

- Modèle résolu : `claude-fable-5-1` (préfixe conforme R-1).
- Date : 2026-09-23. Contexte frais : G2 NON lu ; artefacts seuls (rendu, ADR v2, CP1, backlog, rulings, mission, FAITS, livrable).
- Livrable : `lot/t1b-backend` @ `64dbbd65e92ad4c991895c76f2fd4e2390912383`, worktree `F:\Monark-wt-t1b`, base `c0f905ccb01985865e550e9e1fe2f5578c8cd680` (merge-base recomputé = c0f905c).
- Rejeu (AM-2 ter) : `F:\tmp\cp2-t1b-pr1\tree\` = `git archive 64dbbd6` ; TEMP/TMP = `F:\tmp\cp2-t1b-pr1\os-tmp` ; ceinture `env -u` x 8 sur chaque commande.

## 0. Preuve AM-2 ter — AVANT (recomputé par moi)
- `F:\Monark-wt-t1b` : HEAD 64dbbd6, `git status --porcelain --untracked-files=all` = 0 ligne.
- `F:\Monark` : HEAD 24c7655 (= lot/etude-suite), `git status --porcelain` = 0 ligne.
- sha256 des 7 livrables (worktree) = DELIVERED.sha256 du rendu, 7/7 identiques :
  42d36b02 bell-chain.mjs ; fedb91d2 bell-chain.d.mts ; 14175454 bell-publish.mjs ; d89b252b bell-publish.d.mts ;
  83ba2873 bell-publish-chain.test.ts ; 11cfc6ef bell-publish-validate.test.ts ; d5d7a117 bell-publish-durable.test.ts.
- Artefacts : RENDU-G1-PR1.md sha 0db7cd90… (= annonce orchestrateur) ; MISSION-G1-PR1.md fa1c51ea… (= rendu) ; FAITS-rfc8032 42137d4b… (= rendu §15.1, blob 69c80da).
- Diff `c0f905c...64dbbd6` : 7 fichiers, +1134/-0, tous sous apps/bell/scripts et apps/bell/test.

## 1. Journal du rejeu
- 16:19Z `git archive 64dbbd6` -> `tree\` ; sha des 5 fichiers code/tests de la copie = golden (42d36b02 / 14175454 / 83ba2873 / 11cfc6ef / d5d7a117).
- 16:19Z `npm ci --offline --cache F:/tmp/npm-cache` dans la copie : exit 0, 283 paquets ; `require.resolve('@monark/rpc-guard')` = `F:\tmp\cp2-t1b-pr1\tree\packages\rpc-guard\src\index.ts` (liens @monark/* vers MA copie).
- 16:21Z tests rejoues (ceinture env -u x 8, TAP `tap\{chain,validate,durable}.tap`) : chain 6/6, validate 12/12, durable 8/8 ; 0 fail, 0 todo, 0 skip ; exit 0 x 3. Sous-tests KAT `rfc8032_section_7_1_test1` ok, `line_signing_excludes_sig_and_verifies` ok. Diagnostics : 54 + 36 points de panne ; TAILLES 3759/623/165 et 2849/523/856 = rendu section 9.
- 16:22Z `tsc --noEmit` copie : exit 0. Gardes racine `no_cash_cross_provider_name_in_export`, `no_secret_in_repo` : 2/2 ok (`tap\guards.tap`). `grep-forbidden` sur les 2 .mjs : exit 0 ; 0 ligne non-ASCII et 0 echappement unicode dans les 7 fichiers ; 0 mot interdit (mission section 6) dans les .mjs.
- R-25 forme CI exacte (`git diff --numstat c0f905c...64dbbd6 -- . <14 pathspecs verbatim ci.yml:65>`) : 7 fichiers, +1134/-0 = 1134 (= rendu ; <= 1150).
- Perimetre/registre : `git diff --stat c0f905c...64dbbd6 -- apps/site README.md skills schemas packages/contracts apps/bell/src apps/sentinel deploy scripts .github vocab-banned.json test docs` = 0 ligne ; les 7 fichiers du diff sont sous apps/bell/scripts et apps/bell/test. Bell reste `upcoming` (decision 80 : rien de prive, l'editeur publie tous les runs du bundle sans filtre).
- Mutants du validateur (hors liste worker ; `mut.sh` : mutation dans la copie, TAP par mutant, restauration par copie du golden + sha relu) :
  | id | fichier | test vise | verdict |
  |---|---|---|---|
  | mv1 encodage base64url non canonique accepte (`verifyLine`) | bell-chain.mjs | bell_chain_ed25519_rfc8032_kat | KILLED byIntended |
  | mv2 `sig_new` inclus dans les octets signes | bell-chain.mjs | bell_chain_ed25519_rfc8032_kat | KILLED byIntended |
  | mv3 `keyIdOf` hache la chaine `x` au lieu des 32 octets | bell-chain.mjs | bell_chain_ed25519_rfc8032_kat | KILLED byIntended |
  | mv4 C-in-5 `<=` -> `<` (l'egalite doit publier) | bell-publish.mjs | bell_publish_refuses_unpublishable_session | KILLED byIntended |
  | mv5 controle "public/timeline.jsonl de meme longueur mais contenu != prive" retire (`inspect`) | bell-publish.mjs | bell_publish_refuses_corrupt_existing_timeline | SURVIVED (exit 0, aucun rouge) |
  | m38 (rejeu du worker) cle `rebase_residuals` retiree de `K` | validate.test.ts | tsc | KILLED : TS2741, exit 2 |
  Restauration : sha copie apres chaque mutant = golden (42d36b02 / 14175454 / 11cfc6ef).
- Sonde `probe-provider.mjs` (sortie REELLE de `runMain` laissee par le test rejoue, un champ mute, `publishToDir`) :
  - provenance reelle offline : `providers.providers` = ["helius","solana-foundation"] (labels nus), `faults` = [] ; `earliest_publish_utc` = 13 chiffres => millisecondes (coherent avec `t = Date.now()` ; `earliestPublishUtc` = `etWallClockToUtcMs + 24 h`, close.ts:69-74).
  - `providers[0]` = `providerOf(<URL reelle>)` (`helius-rpc.com`, `chainstack.com`, `solana.com`) => REFUSE `url_or_key_shaped_string`. NON atteignable en production : `solProviders = operators` (collect.ts:742) = labels du garde (`helius`, `chainstack`, `solana-foundation`) et `providerOf(label)` rend le label tel quel (rpc.ts:29-37). `faults[].provider` avec ces labels et `ethereum` => PUBLIE.
  - labels keyless ETH `drpc.org`/`mevblocker.io`/`tenderly.co`/`pocket.network` (rpc-guard transport.ts:37) => REFUSES ; NON atteignables aujourd'hui : `ethereum.ts` ne pousse aucun `faults[]` (grep vide), la jambe ETH se replie en `{provider:"ethereum"}` (collect.ts:829) ; labels exclus de `--operators` (collect.ts:708) ; `errByOp` (collect.ts:717-719) = compteurs seulement. Le refus attendu (ruling (a)) reste : panne de la jambe cash (close.ts:162/167/173, collect.ts:435, libelles pointes) => run entier refuse.
  - `close_source` deplace sous `providers` => `unknown_field` (liste blanche a tous les niveaux, D-5 tenue).
- `fsyncDir` win32 re-mesure : `open(dir,"r")`+fsync => EPERM ; `"r+"` => ok (D-3 confirmee).
- `.d.mts` : 17 codes `RefusalCode` = 17 `REFUSAL_CODES` runtime ; `BOUNDS` = {64, 64 MiB, 64 MiB, 1 MiB} (C-7 valuees).
- Hygiene : 0 repertoire `t1b-creds-*` restant sous mon os-tmp apres le rejeu.
- Anti-close (lots Bell), `anticlose.mjs` + `anticlose2.mjs`, bruts `F:\PRODUITS\etude-2026-09-20\bell-b3b-raws\get_range-{AAPL,NVDA,SPY,TSLA}-ohlcv1d-2026-09-14_19.json` (20 enregistrements, PROVENANCE.md sha-pinnee) : 615 litteraux numeriques scannes sur les 1134 lignes ajoutees ; 0 coincidence sur les formes de la clause (decimale point/virgule, entier scale, arrondi au cent) ; 2 correspondances HORS formes enumerees (`[masque]`, forme entiere sans decimale) a durable.test.ts:36 et validate.test.ts:237, sur un litteral PREEXISTANT a la base (`collect.test.ts:706,754,828` @ c0f905c, copie par le lot) ; classification dans `anticlose2.log` (hors depot, non a persister). Precedent : CP2bis -b3b (docs/CHECKPOINT2bis-lot-t1a-ii-b3b.md, controle 1 et observation I-3) : candidats voisins juges "non interdits", forme entiere sans decimale = coincidence numerique (observation, pas une dette). Aucun enregistrement brut copie. Cet avis ne cite aucune valeur. Anti-close bis : n-a (aucune constante on-chain nouvelle ; le `multiplier` de validate:234 est un evenement synthetique).

## 2. Checklist fermee, regle par regle (LIVRABLE)
- CA-1 (criteres falsifiables) — CONFORME : les 24 tests nommes du backlog S-1..S-3 existent, chacun tranche un critere (a)..(g) ; reformules au CP1.
- CA-2 (valeur non deleguee) — CONFORME : aucune decision de valeur nouvelle. FAULTS-PROVIDER-NAME-1 rule (a) par l'orchestrateur sous 143 (technique, fail-closed, servir moins) ; PROC-RFC8032-KAT-1 clos par lecture sur place. Rien a escalader.
- CA-3 (ADR, gates) — CONFORME : ADR v2 D3-D8 rattache ; chaine G1 -> G2 || cp-2 -> G7 tenue ; aucune derogation ; aucun commit du worker (64dbbd6 = orchestrateur, R-20).
- CA-4 (fan-out) — CONFORME : mono-agent ; independance par G2 separe + ce rejeu.
- CA-5 (MAST) — CONFORME : table ADR ; residuels PR-1 : FM-3.3 (G1/G2 meme famille) contre par mes 5 mutants + m38 ; FM-2.4 contre (entrees = `runMain`/`collect()` reels, verifie dans le code des tests) ; FM-1.3 C-in-9/10 + `seq` contigu (m17/m33/m36) ; FM-3.2 win32 mesure, item CI-POSIX-FSYNCDIR-1.
- CA-6 (tests passes != correct) — CONFORME : oracle rejoue par moi (26/26, tsc 0, gardes 2/2) ET mutants (4/5 miens tues + m38) ; G2 en vol (non lu). Reserve : mv5 survivant (branche `inspect` sans test) => C-V-2.
- CA-7 (zero dette) — CONFORME : items formes avec proprietaire/declencheur (rendu section 14) ; PROC clos ; aucun "du" nu. Manque : `error_origin` de PROC-RFC8032-KAT-1 (vecteur non lu au G0) et de D-18 => C-V-3 (G7).
- CA-8 (provenance) — CONFORME : R-1 `claude-opus-5-5[1m]` en tete du rendu ; generateur != relecteur (G2 separe, cp-2 = moi) ; section Provenance ; `error_origin` a assigner au G7 (C-V-3).
- CA-9 (verification imposee par le systeme) — CONFORME : rejeu dans une copie independante (liens vers ma copie prouves), mesures propres (R-25, perimetre, sha), G2 non lu.
- CA-10 (anti-vitesse) — CONFORME : aucun argument de vitesse ; lot 1134 <= 1150 ; R-25 intermediaires mesures (880 -> 1132 -> 1134).
- CA-11 + durci (branchement) — CONFORME sur ce que la PR-1 revendique : "cable (code) + composition testee depuis sortie reelle de `runMain`/`collect()`", jamais "branche"/"built" ; registre 0 ligne ; tuyaux T-a/T-b/T-d/T-e/T-f declares partiels (section 11) avec le test PR-2 nomme (`bell_publish_consumes_real_runmain_output_end_to_end`, C-3 deep-equality runs[i] <-> state.json) ; aucun consommateur servi avant PR-3, declare. Les tests S-2 EXECUTENT la composition depuis l'artefact reel (bundle = copie du --out de runMain tel qu'ecrit) : le durci est tenu pour l'entree ; la sortie servie reste S-5.
- Anti-close — CONFORME au texte de la clause (0 coincidence de forme) ; observation hors formes enumerees consignee, deja couverte par le precedent CP2bis -b3b I-3 => C-V-4 (consignation seulement).
- Corrections CP1 : C-3 tenu en PR-1 pour --out reel hors depot + published_at unique (test e, m30) ; deep-equality etat = S-5 (PR-2, nomme). C-4 tenu (K Record<GapKey,true>, m38 rejoue, egalite runtime + 12 objets epingles). C-6 tenu (double egalite lue et rejouee, m02/m03). C-7 tenu (valeurs + motifs, 5 refus a borne x2, TAILLES). C-9 : PR-1 cree le trousseau et refuse une cle hors trousseau (test g, m32) ; racine --keyring = S-4 (PR-2). Decision 69 : close_source/adv_source jamais servis (projection + m21 ; gardes racine vertes) ; aucun nom de fournisseur cash dans les .mjs ; identifiants de types `DatabentoGet`/`PolygonGet` importes par validate.test.ts:19,63-64 = ceux du collecteur (precedent collect.test.ts:680-744), fichier non exporte, perimetre EXPORT-BELL-1.
- Deviations D-1..D-20 : acceptables telles que declarees ; trois exigent une ligne d'ADR au G7 (D-9 published_at dans provenance.json vs D5 ; D-13 trousseau a l'etape 3 ; D-20 reparations avant validation) => C-V-3. D-3 re-mesuree. D-17 levee. D-18 => A13-UNICODE-ESCAPE-1.

## 3. Decision : ACCEPTE-AVEC-CORRECTIONS (liste fermee C-V-1..C-V-4) ; aucune ESCALADE-INVESTISSEUR

Aucun motif de refus : oracle rejoue vert (26/26, tsc 0, gardes 2/2), mutants tues (worker 41/41 lus ; miens 4/5 + m38 rejoue), 0 coincidence anti-close de forme, registre 0 ligne, R-25 1134, aucune cle ni secret, aucun fait calcule par l'editeur, aucune decision de valeur nouvelle. Les corrections ci-dessous sont des complements de preuve et de documentation, pas des defauts de comportement servi (tout ce qui est incomplet ferme sans rien ecrire).

| # | Correction | Ou / quand | error_origin propose | Preuve attendue |
|---|---|---|---|---|
| C-V-1 (au G7, documentaire ; non bloquante pour la fusion) | Completer FAULTS-PROVIDER-NAME-1 : la garde `BARE_LABEL` n'est juste que parce que le vocabulaire de labels (`OperatorLabel` du garde, `ethereum`) est sans point (verifie par sonde sur sortie reelle de `runMain`) ; tout label pointe (ex. keyless ETH `drpc.org`... s'il entrait un jour dans `faults[]`) ferait refuser le run entier. Specifier le pli (b) "faults dont `provider` in `providers.providers`" (declencheur inchange : avant G-e) et ajouter en PR-2 un test qui epingle vocabulaire <-> garde (chaque label admis par le collecteur et `ethereum` matchent `BARE_LABEL` ; mutant : label pointe ajoute => rouge). | rendu section 13 / item pli (b) ; PR-2 | redacteur G1 (affirmation "les pannes RPC passent" vraie mais non prouvee sur le vocabulaire) | ligne d'item amendee au G7 ; test nomme en PR-2 |
| C-V-2 (PR-2, non bloquante) | Test + mutant : `public/timeline.jsonl` de MEME nombre de lignes que le prefixe prive mais contenu different => `existing_timeline_corrupt`, rien d'ecrit (branche `inspect` `pub.texts.some(...)` : mon mutant mv5 survit a la suite actuelle). | backlog S-5 ou S-3 bis, PR-2 | redacteur G1 (branche sans test = declarative, D-1) | `not ok` de mv5 sous le nouveau test |
| C-V-3 (au G7, documentaire) | (a) lignes ADR : D5 (D-9 : `provenance.json` servi porte `published_at`), D8 (D-13 : trousseau ecrit a l'etape 3 au premier run ; D-20 : reparations de l'etat commite avant validation du bundle) ; (b) `error_origin` de PROC-RFC8032-KAT-1 (redacteur G0 : RFC citee [lu-WF] sans les valeurs) et de D-18 (outillage Write, item A13-UNICODE-ESCAPE-1) ; (c) CI-POSIX-FSYNCDIR-1 : declencheur explicitement conditionne a la decision 136 (aucune CI sans prevenir) ; (d) nommer la PR qui porte le test "aucune publication privee ni acces restreint" de D13.5 (decision 80) — absent du backlog v2. | ADR v2, CHANTIERS, backlog | orchestrateur (G7) | lignes datees |
| C-V-4 (consignation, non bloquante) | Anti-close : 0 coincidence sur les formes de la clause ; 2 correspondances hors formes enumerees (`[masque]`) sur un litteral synthetique preexistant a la base (collect.test.ts:754 @ c0f905c), deja classees "coincidence numerique" par le precedent CP2bis -b3b (I-3). Consigner une ligne au G7 ; aucune purge exigee. Si l'orchestrateur souhaite durcir la clause aux formes entieres, c'est un amendement date de ma checklist (pas un acte de ce lot). | CHANTIERS (G7) | n-a | ligne datee |

Verdict de fusion : la PR-1 peut etre fusionnee au G7 sous reserve d'un G2 PASS (non lu par moi) ; C-V-1 (ligne d'item), C-V-3 et le ruling C-V-4 sont des actes du G7 ; C-V-1 (test) et C-V-2 sont portes par la PR-2 (backlog amende).

## 4. Artefacts lus (chemins ; sha256 recomputes par moi)
- `F:\tmp\t1b-a1\RENDU-G1-PR1.md` 0db7cd9014bdb2e3... (= annonce) ; `F:\tmp\t1b-g0\MISSION-G1-PR1.md` fa1c51ea6d6808f2... (= rendu) ; `F:\tmp\t1b-a1\{DELIVERED.sha256, MUTANTS.txt (41 lignes), R25.txt, TAILLES.txt}` ; `F:\Monark\docs\adr\ADR-T1b-backend.md` (v2 persistee), `docs\CHECKPOINT1-lot-t1b-backend.md`, `docs\SPRINT-BACKLOG-lot-t1b-backend.md`, `docs\RULINGS-lot-t1b-backend.md`, `docs\biblio\FAITS-rfc8032-test1-2026-09-23.md` 42137d4b99c022e3... (= rendu 15.1, blob 69c80da) ; `docs\CHECKPOINT2bis-lot-t1a-ii-b3b.md`, `docs\CHECKPOINT2-lot-t1a-ii-b3b.md` (precedent anti-close) ; `docs\CHANTIERS.md:208,223,229` + diff 24c7655..a79a902 (decision 148, sans effet sur PR-1) ; livrable : les 7 fichiers @ 64dbbd6 ; contexte depot : `apps/bell/src/{collect,close,quorum,digest,ethereum}.ts`, `apps/sentinel/src/rpc.ts:29-37`, `packages/rpc-guard/src/{client,transport}.ts`, `.github/workflows/ci.yml:65`, `package.json`.
- NON lu : le G2 (instance separee, en vol) ; aucun fil de travail.

## 5. Verdict de fusion (conditions fermees)
1. G2 PASS (non lu par moi) ; en cas de divergence entre le G2 et cet avis : ESCALADE-INVESTISSEUR (frontiere).
2. Oracle complet (7 portes, ceinture) sur l'ARBRE FUSIONNE au G7 : la pointe `lot/etude-suite` (a79a902) porte depuis c0f905c des changements hors `docs/` (SITE-CHARTE-C, `packages/rpc-guard`, `apps/sentinel/test`, `.gitattributes`) ; `validate.test.ts` atteint `@monark/rpc-guard` via `runMain` (chemin hors ligne). Toutes mes mesures portent sur `c0f905c...64dbbd6`.
3. C-V-1 (ligne d'item + pli (b) specifie), C-V-3 (lignes ADR D5/D8, error_origin x2, CI-POSIX conditionne a la decision 136, PR du test decision 80) et C-V-4 (consignation) = actes du G7 (orchestrateur, R-20). C-V-1 (test vocabulaire <-> garde) et C-V-2 (test + mutant mv5) = a porter a la PR-2 : la mission G1 PR-2 etant deja lancee (decision 149, 2b00d32), par message au worker PR-2 en cours ou par pli PR-2 avant son G2 || checkpoint-2 ; jamais un oubli.
4. Registre public inchange (Bell `upcoming`) ; aucun "built"/"branche" revendique ; premiere publication toujours conditionnee aux portes G-a..G-e de l'ADR (PR-B-DBN n 8, I-G2-2 desormais rule par la decision 148, DNS, premier bundle).

## 6. AM-1 (ii) — ce que la checklist a attrape
mv5 : branche `inspect` (public/timeline.jsonl de meme longueur, contenu different) sans test tueur ; dependance implicite de `BARE_LABEL` au vocabulaire de labels (prouvee par sonde sur sortie reelle de runMain : labels d'operateurs nus passent, tout label pointe refuse) ; D-9/D-13/D-20 sans ligne d'ADR ; `error_origin` manquants (PROC-RFC8032-KAT-1, D-18) ; test de la decision 80 (D13.5) non place dans le backlog ; `earliest_publish_utc` en ms verifie (13 chiffres) ; `fsyncDir` win32 re-mesure. Ce qu'elle a manque : a renseigner par l'orchestrateur a posteriori.

## 7. Preuve AM-2 ter — APRES (recompute a 2026-09-23T16:33:57Z, apres redaction)
- F:\Monark-wt-t1b : HEAD 64dbbd65e92ad4c991895c76f2fd4e2390912383, branche lot/t1b-backend, git status lignes = 0 ; sha 7 livrables (8 car.) : 42d36b02 fedb91d2 14175454 d89b252b 83ba2873 11cfc6ef d5d7a117 = DELIVERED (7/7 inchanges vs AVANT).
- F:\Monark : HEAD 2b00d32cf88a9980a4dd499c0cc816cc9a875917 (24c7655 -> a79a902 -> 2b00d32 pendant ce checkpoint = commits de l orchestrateur, aucun du validateur ; docs T-1b ADR/backlog/rulings inchanges a a79a902, 2b00d32 relu ci-dessous), git status lignes = 0.
- Copie de rejeu F:\tmp\cp2-t1b-pr1\tree : 5 fichiers code/tests restaures au golden apres mes 6 mutants : 42d36b02 14175454 83ba2873 11cfc6ef d5d7a117 .
- Fichiers ecrits par moi, TOUS sous F:\tmp\cp2-t1b-pr1\ : CP2.md, npm-ci.log, tsc.log, tsc-m38.log, mut.sh, probe-provider.mjs, probe-provider.log, anticlose.mjs, anticlose.log, anticlose2.mjs, anticlose2.log (NE PAS persister : porte la classification), tap\{chain,validate,durable,guards,mv1..mv5}.tap, tree\ (git archive + node_modules), os-tmp\ (temporaires des tests). Aucun octet dans un depot, aucun git mutatif, aucune installation globale, rien sur C:.
- Aucune valeur de close, de prix ni de brut n est citee dans cet avis.

Modele resolu : claude-fable-5-1.
- 2b00d32 = Decision 149 (publish bell.monarkgate.tech ~23:00Z, full fan-out): G1 PR-2 + G1 PR-3 launched on PR-1 base, lot PROBER-E (diff a79a902..2b00d32 : docs seulement, verifie) ; status 0.
