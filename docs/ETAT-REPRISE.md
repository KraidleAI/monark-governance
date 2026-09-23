# ETAT DE REPRISE — orchestrateur MONARK (Fable 5.1) — tenu a jour a chaque jalon

> Objet : si la session courante tombe (limite 5 h, coupure, contexte), une session NEUVE reprend d'ici, avec
> `docs/CHANTIERS.md` (journal complet, dernieres sections = etat le plus recent) et `~/.claude/CLAUDE.md` (regles).
> Consigne investisseur du 2026-09-22 22:1x UTC : « qu'ils ecrivent au fil de l'eau — si on atteint la limite session de 5 h ».
> Derniere mise a jour : **2026-09-22 22:1x UTC** (HEAD `lot/etude-suite` = voir `git log -1`).

## 0. Decisions permanentes qui gouvernent la reprise
- Decision 137 : TOUS les gos sont permanents (fusions G7, redeploiements harness/VPS, course Ukemi complete sous plafonds,
  mints Bell restants, U-6 conditionnel mecanique). L'orchestrateur INFORME, ne demande jamais. Actes investisseur restants :
  revocation cle Helius au verdict global, formulaire CoinGecko, facturation GitHub / repo prive, DNS Bell.
- Decision 136 : ne JAMAIS declencher la CI GitHub sans prevenir l'investisseur (repo temporairement public).
- Decision 133 : workers/chercheurs/lecteurs = `claude-opus-5-5` effort max (prefixe R-1 `claude-opus-5-5`) ; orchestrateur,
  advisors, validateur = `claude-fable-5-1` ; `claude-opus-5` BANNI ; jamais un tier nu.
- Securite : jamais afficher une cle (A-7) ; oracles sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL
  -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` ; la cle
  Helius n'est lue QUE par le processus de tirage via PowerShell (`[Environment]::GetEnvironmentVariable('HELIUS_API_KEY','User')`,
  longueur 36 verifiee, jamais imprimee) ; tout temporaire sur F:.
- Zero dette (regle absolue) ; Branchement (« built » ⇔ chemin servi + test d'integration) ; R-25 ≤ 1 150 (CI 1 205) ;
  R-13 (aucune ligne TAP `# todo` dans un commit) ; horodatages CHANTIERS depuis `TZ=UTC git log --date=iso-local`.

## 1. Course Bell (tirage go-1, cycle `helius-2026-09-19`, floor 60 938)
- FAIT : TSLAx COMPLET `equal` (8 784 pages, completion dans `F:\course-bell\bell-b3d-run-tslax-completion`) ; **AAPLx COMPLET
  `equal`** (2 629 pages, N_exact 2 628 814 ; completion dans `F:\course-bell\bell-b3d-run-aaplx-completion` ; ancre
  `mint_end-AAPLx` `244a903`).
- EN COURS : **NVDAx r1**, lance 22:10:09 UTC depuis l'arbre EPINGLE `F:\Monark-wt-bellexec` (detache `a703e24`), dossier strict
  `F:\course-bell\bell-b3d-run`, sous-caps 125 `--max-credits 1670000 --max-calls 167000 --max-pages 167000` ; pid dans
  `F:\course-bell\go1\NVDAx.pid`, logs `F:\course-bell\go1\NVDAx-r1.{out,err}.log`. Projection 5 495 pages (max 7 620).
- Supervision (RUNBOOK `docs/course-bell/RUNBOOK-supervision-tirage.md`) : `tasklist //FI "PID eq <pid>"` + `wc -l` du ledger
  `ledger-NVDAx.jsonl` ; sous le code ANCIEN (pre-C-6) la lecture de `budget.json` est toleree mais inutile.
- Fin de mint (processus sorti) : lire `crosscheck-report.json` :
  - `complete:true` + `equal` ⇒ ancre `mint_end` : `bash F:\course-bell\go1\anchor.sh mint_end NVDAx ledger-NVDAx.jsonl crosscheck-NVDAx.json`
    (commit + push + OTS + ligne ANCHORS automatiques) ;
  - `not_full_pages` (page courte finale avec token, cas TSLAx/AAPLx) ⇒ procedure 135(a) : `cp -r bell-b3d-run bell-b3d-run-nvdax-completion`,
    relancer la MEME commande avec `--allow-short-pages --out F:\course-bell\bell-b3d-run-nvdax-completion` (3 appels), puis
    `ANCHOR_OUT=/f/course-bell/bell-b3d-run-nvdax-completion bash anchor.sh mint_end NVDAx …` ;
  - crash / coupure ⇒ INCIDENT `docs/course-bell/INCIDENT-powercut-2026-09-22.md` §5 : `repair2.py` (queues NUL, head, budget.json
    reconstruit), `rpc-guard … unlock --cycle helius-2026-09-19 --op helius|solana-foundation --reason …` (servi), ancre
    `mint_resume` (`ANCHOR_SEQ=N`), relance (r+1) — depuis l'arbre epingle (ou le nouvel arbre si les 3 lots C-6 sont G7, cf. §3).
- Ensuite SPYx (`--max-credits 2957000 --max-calls 295700 --max-pages 295700`, ancre `mint_start-SPYx` d'abord :
  `bash anchor.sh mint_start SPYx budget.json ledger-AAPLx.jsonl ledger-NVDAx.jsonl ledger-SPYx.jsonl ledger-TSLAx.jsonl`),
  puis -b3d-b2 post-tirage, lecture Helius n°3 (acte investisseur) au verdict global.
- Commande de lancement (PowerShell, cwd = arbre d'execution) : voir CHANTIERS « NVDAx lance » ; ne jamais copier-coller une cle.

## 2. Agents en vol (ids de sous-agents ; rendus recuperables par `python "F:/MONARK SUITE/persist.py" <id> "<prefixe 1re ligne>" <out> "<titre>"`)
| Agent | id | Lot / role | Etat attendu |
|---|---|---|---|
| G2 U-4b-1b-4 (Opus 5.5) | `afdb550182047c179` | `lot/u4b-1b-4` @ `30a2eee` (G1 commite, R-25 795) ; rulings R-1b4-1/2 | rendu G2 → G7 (avec cp-2) |
| ~~cp-2 U-4b-1b-4~~ RENDU ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-u4b-1b-4.md`) | `a55d595455411a3a1` | C-V-1 ADR + journal error_origin ; C-V-2 ADDENDUM-2 date + SIDECAR ; C-V-3 deltas RUNBOOK ; C-V-4 WORKTREE-DURABILITY-1 | G7 des le G2 (fusion `30a2eee` + insertion `F:\tmp\u4b1b4\ADR-amendement.md` + ADDENDUM-2 + RUNBOOK-DELTA §2) |
| ~~cp-2 U-4b-STATS-1 1a~~ RENDU ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-u4b-stats-1-1a.md`) | `a84d7f5cc56e01719` | C-V-1 deux segments first-parent ; C-V-2 ADR (Q-1 date, `:207` renvoi) ; C-V-3 tests 1b (demandes au worker `a63a3c73d4adcf630` : `seam/1b-v2.patch`, 46 mutants) ; C-V-4 procurement JKK / I-2 A&B | G7 1a « upcoming » apres G2-1a ; puis 1b-v2 → G2-delta ‖ cp-2 (1b) → G7 |
NOTE lancement Bell (mesure 23:43-23:49 UTC) : le processus du tirage doit tourner en priorite **AboveNormal** (`(Get-Process -Id <pid>).PriorityClass='AboveNormal'`) — sinon les oracles des agents (charge CPU 76 %) le font tomber de 46 a 10 pages/min.
| G2 U-4b-STATS-1 unite 1a (Opus 5.5) | `ae170458b7dad7fbf` | `lot/u4b-stats-1` @ **`564292d`** (1a commite, R-25 640 ; re-verif orchestrateur 7 gates 0, 933/932/0/1, 16/16) | rendu G2-1a → puis `git apply F:\tmp\u4bstats1\seam\1b.patch` (verifie `--check` OK sur `564292d`) → commit 1b → G2-delta ‖ cp-2 (1b) → ADR `F:\tmp\u4bstats1\ADR-U4b-amendement-STATS-1.md` + `RUNBOOK-DELTA.md` → G7 |
| cp-2 U-4b-STATS-1 unite 1a (validateur) | `a84d7f5cc56e01719` | idem, clones `F:\tmp\cp2-u4bstats1\` | ACCEPTE attendu |
NOTE limite de session (22:3x-23:20 UTC, HTTP 429 « session limit ») : 6 agents tues puis RELANCES par message a 23:22 UTC (ids ci-dessus inchanges : GARDE-FSYNC-1, fold U-4b-1b-3, G2 HARNESS-DESC-1, G2 + cp-2 U-4b-1b-4, micro-pli BELL-SP-1b). Si la session neuve trouve un agent « failed 429 » : `SendMessage` a son id (« RÉESSAIE … reprends depuis ton dernier etat ECRIT ») suffit — les transcripts survivent.
| ~~G1 GARDE-FSYNC-1~~ RENDU (`docs/G1-lot-garde-fsync-1.md`) → **pli pre-G2 en cours** (meme worker) | `a770d3ec4e7ffca89` | `F:\Monark-wt-gfsync1` (10 fichiers NON commites, `F:\tmp\gfsync1\DELIVERED.sha256`) : R-GF-2 = duree de la suite (374 s → ≤ 100 s) sans porte publique/env ; rendu `F:\tmp\gfsync1\RENDU-PLI-1.md` | rendu du pli → re-verif orchestrateur (oracle + 32+ mutants) → commit G1 → G2 ‖ cp-2 → G7 (ADR `F:\tmp\gfsync1\ADR-amendement.md` dans ADR-GARDE-HELIUS ; RUNBOOK-rpc-guard) → deploiement C-6 vers l'arbre Bell a la frontiere (avec BELL-SP-1 + BELL-SP-1b) |
| Micro-pli BELL-SHORTPAGE-1b (Opus 5.5) RENDU (46/46, 940/939/0/1, R-25 613) → application cp-2 C-1 (commentaires) en cours | `acf0e86ad990966c5` | `F:\Monark-wt-bellsp1` @ `e5dfbb4` + 2 fichiers modifies NON commites (`F:\tmp\bellsp1\DELIVERED.sha256`) ; harnais `F:\tmp\bellsp1\mutants.mjs` (46) ; `ADR-DELTA-1b.md` | re-verif orchestrateur (oracle 7 gates + `node F:\tmp\bellsp1\mutants.mjs`) → commit sur `lot/bell-shortpage-1` → re-G2 (`a6118978970b2247f`) ‖ re-cp-2 (`a730448c2222b2962`) → G7 (fusion + D1-nonies + corrections cp-2/G2 C-G2-4 + ADR-DELTA-1b + R-C6-1 « r+ » de GARDE-FSYNC-1) → deploiement C-6 a la frontiere Bell (avec GARDE-FSYNC-1) |
| Fold ADR v3 U-4b-1b-3 (Opus 5.5, docs) | `a5c67a23641fcf55c` | livrables `F:\tmp\u4b1b3\fold\{ADR-amendement-v3.md, PLI-provenance-line.md, CHANTIERS-G7-entry.md, insert.py, RENDU.md}` | rendu → relecture orchestrateur → G7 U-4b-1b-3 (fusion `1bcfbd7` + `insert.py`) |
| ~~G2 HARNESS-DESC-1~~ RENDU PASS-AVEC-CORRECTIONS (`docs/G2-lot-harness-desc-1.md`) | `a594ad5f6b690cbaa` | C-G2-1 (controle negatif de la CA, test seul) ⇒ micro-pli 1b | re-G2 du micro-pli par cet agent (contexte intact) |
| Micro-pli HARNESS-DESC-1b (Opus 5.5) | `ac567cdb92da03fd7` | `F:\Monark-wt-hdesc1` @ `906064b` : test (α)(β)(γ) serveur-fixture + 3 mutants G2-5a/b/c ; rendu `F:\tmp\hdesc1\RENDU-MICROPLI-1b.md`, `ADR-DELTA-1b.md` | rendu → re-verif orchestrateur → commit → re-G2 (`a594ad5f6b690cbaa`) + re-cp-2 (`ad8a301cf768f77fb`) → G7 : fusion + `python F:\tmp\hdesc1\insert-adr.py` (ADR-amendement + O-2/O-3/O-4 + ADR-DELTA-1b, MEME commit) → redeploiement harness a un SHA nomme (`/opt/monark-harness-redeploy.sh`, CA 12/12, `docs/deploy-CA-harness.json`, JOURNAL ; investisseur informe, 137) |
Termines et persistes : G2 BELL-SHORTPAGE-1 (`docs/G2-lot-bell-shortpage-1.md`, PASS-AVEC-CORRECTIONS), G1 U-4b-1b-4 (`docs/G1-lot-u4b-1b-4.md`).
Rendus deja persistes : voir `docs/G1-*`, `docs/G2-*`, `docs/CHECKPOINT1-*`, `docs/CHECKPOINT2-*` (grep du nom de lot).

## 3. G7 dus (ordre) et scripts prets
1. ~~A-9-OUTILLE~~ **FAIT** (G7 : micro-pli `4ff171e`, fusion `eab911a`, docs `147d50f` — ADR-U5a/ADR-M020 inseres, CONSIGNE A-13,
   CHANTIERS :766 remplace ; oracle `F:\Monark` 937/936/0/1). Worktree `F:\Monark-wt-a9outille` a retirer (`rm-nm.ps1` puis
   `git worktree remove`).
2. ~~U-4b-1b-3~~ **FAIT** (G7 : fusion `b9eb62b`, docs `f28a184` = `<HEAD_E1>` ; ADR-U4b amendement v3 + PLI inseres ; oracle tronc
   951/950/0/1). **Course Ukemi ETAPE 1 EN COURS** : `--fill-ts` reel lance 2026-09-23T00:00:24Z depuis `F:\Monark` @ `f28a184`
   (script verbatim `F:\course-ukemi\fill-ts-4.sh`, detache ; pid `F:\course-ukemi\fill-ts-4.pid` = bash lanceur ; log
   `F:\course-ukemi\logs\fill-ts-4.log`, fin marquee par une ligne `exit=<code> <date>` ; `<N_FILL>` 20 000). Supervision : log + ledgers
   de cycle `F:\monark-ledger\chainstack-2026-09-19\chainstack-2026-09-19\*.jsonl` seulement — NE JAMAIS ouvrir
   `F:\course-ukemi\select\block-ts-extra.json` ni `.tmp-*` pendant le run. A la fin : `exit=0` + stdout `phase=complete` ⇒ controle C-1
   (RUNBOOK :150) + Sidecar 1 (SIDECAR fichier, ligne preparee) ⇒ etape 2 (selection) ; `exit=1` STOP partial ⇒ attendre 25 s, relancer
   la MEME commande (reprise sans re-fetch) ; sidecar `unreadable`/`belongs to another brut` ⇒ le deplacer dans un dossier date, relancer.
   Un `mint`/merge dans `F:\Monark` pendant le run est sans effet sur le processus charge, mais toute RELANCE tourne sur le HEAD du
   moment : verifier 0.2 (blob selecteur `20e1cf9d…`) avant de relancer.
3. **HARNESS-DESC-1** (`906064b`) apres G2 PASS : fusion (apres A-9) + insertion `F:\tmp\hdesc1\ADR-amendement.md` dans ADR-U4b (C-V-1)
   → redeploiement harness a un SHA nomme (`/opt/monark-harness-redeploy.sh`, CA `scripts/verify-harness.mjs` 12/12,
   `docs/deploy-CA-harness.json`, JOURNAL) — informer l'investisseur (137).
4. **BELL-SHORTPAGE-1** (`e5dfbb4`) apres G2 PASS : fusion + insertion D1-nonies (`F:\tmp\bellsp1\ADR-amendement.md` + corrections
   cp-2 C-1/C-2/C-3/C-5 + R-C6-2 corrige par le fait mesure EPERM + ruling R-SP-C) dans `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md`
   (fin de fichier, apres l.396) ; puis lancer **BELL-RENAME-RETRY-1** (micro-lot code, worker Opus 5.5, cf. RUNBOOK supervision §3).
5. **GARDE-FSYNC-1** : G1 → G2 ‖ cp-2 → G7.
6. Deploiement C-6 vers l'arbre d'execution Bell : SEULEMENT quand BELL-SHORTPAGE-1 + GARDE-FSYNC-1 + BELL-RENAME-RETRY-1 sont
   fusionnes, a une frontiere sans processus en vol (reprise post-crash ou `mint_end-NVDAx`) : re-epingler `F:\Monark-wt-bellexec`
   (`git -C F:\Monark-wt-bellexec checkout --detach <sha>`, `mk-nm.ps1` si besoin), ligne ANCHORS « epoque shortpage » (sha).
7. Puis : U-4b-1b-4 / U-4b-STATS-1 G2‖cp-2 → G7 ; course Ukemi (RUNBOOK `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md`) ;
   NARABI-OPS-1d pli §11-1 post-course + 2e redeploiement VPS ; U-4b-2b, U-5b, U-6 (conditionnel), U-7 ; cloture temps 1.

## 4. Outillage (pieges mesures)
- Scripts longs : ecrire un fichier (outil Write) puis l'executer ; le transport Bash mange `\x00` et reduit `\\` en `\` (A-13).
- `node_modules` d'un worktree : `powershell -NoProfile -File F:\tmp\g2-garde2bi\mk-nm.ps1 -Tree <dir>` ; retrait `rm-nm.ps1`, jamais `rm -rf`.
- Ancres : `F:\course-bell\go1\anchor.sh <boundary> <mint> <fichiers…>` (env `ANCHOR_SEQ`, `ANCHOR_OUT`).
- Persistance des rendus d'agents : `persist.py` (ci-dessus). Les transcripts d'agents vivent dans
  `C:\Users\KACIMI\.claude\projects\F--Monark\<session>\subagents\agent-<id>.jsonl`.
