# PASSATION — dossier de reprise pour un nouvel orchestrateur (nouveau compte Claude ou nouvelle session) — mis à jour à chaque retour d'agent et à chaque décision (décision 271, investisseur, 2026-09-28)

**Dernière mise à jour** : 2026-09-28 03:35 UTC — orchestrateur `claude-fable-5-1`, session `e03dd7cc…` ; workflow 268 rendu et traité ; en vol : cp-1 bis ADR-METHODE-2 v2 (`F:/tmp/methode/ADR-METHODE-2.v2.md`), Shōgen `wf_4c261979-6a9`.

## 0. Lire dans cet ordre (30 minutes)
1. `F:\claude-config\CLAUDE.md` (règles globales, roster, amendement 267 en fin de fichier) — **contient des octets 0x08/0x07 aux l.203 et l.286 (BYTE-GUARD-CONFIG-1), ne pas « corriger » sans go**.
2. `F:\Monark\docs\DOCTRINE.md` (D-0 but ; D-1 C1..C6 ; D-2 capital de tiers ; D-3 activité publique ; D-4 superpowers + roster par palier ; D-5 Shōgen : le dossier fait le plan).
3. `F:\Monark\docs\FILE-ATTENTE-2026-09-28.md` (ce qui est en vol, ce qui attend un go, les items) puis la fin de `F:\Monark\docs\CHANTIERS.md` (décisions 259 → 271, une entrée datée par retour).
4. `F:\tmp\methode\ADR-METHODE-2.md` (+ v2 si rendue) et `CP1-methode.md` : la méthode en cours de calibration.
5. Corpus qualité : `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\docs\` (02 gates, 03 méthodologie, 06 AgileGates).

## 1. Qui est qui
- **Investisseur** : KACIMI (siège des exigences, gos, escalades). Nom donné à l'orchestrateur : **Fable**. Ton : partenaires ; il tutoie ; réponses en français, courtes, chiffrées, sourcées ; jamais d'accord performatif.
- **Orchestrateur** : `claude-fable-5-1`, effort high, seul à committer (R-20) et à lancer des workflows ; planificateur ; verdict G7.
- **Validateur-humain** : agent `validateur-humain` (Fable 5.1, high) — checkpoint-1 (plan) et checkpoint-2 (livrable), checklist CA-1..CA-11, Bash vérification seule.
- **Workers** : `claude-opus-5-5` effort `max` (jugement, G1 multi-fichiers, G2, provers, corrections) ; `claude-sonnet-5` effort `max` (mécanique à brief complet, re-revues ciblées, lecteurs/chercheurs) ; `claude-opus-5` BANNI ; jamais sous Sonnet 5 ; toujours l'ID complet, déclaré à chaque lancement (décision 267).
- **Advisors** : `advisor`, `advisor-defi`, `advisor-marche`, `lecture-advisor` (Fable 5.1, medium) : avis, jamais verdict ; ils n'ont pas Write → l'orchestrateur persiste leurs retours (tel quel, scellé sha256). Les lecteurs non plus.

## 2. État gelé (décision 265 + 271) — AUCUN lancement jusqu'à calibration de la méthode
- **Interdit** : lancer une tâche nouvelle (workflow, agent) tant que l'ADR-METHODE-2 n'est pas acceptée et ses lots M-1 → M-4 livrés (G7). Exception : rien. Les agents déjà en vol vont à leur terme ; leurs retours sont traités (lecture, décisions, gel = commit dans le worktree, consignation) et la suite est écrite en file d'attente.
- **En vol au moment de cette passation** : `wf_8f56a396-264` (décision 268 : pli ADR-METHODE-2 ; recherches METHODE-PLAN-1 / SRC-1 / PUB-1 + synthèse advisor ; G2 légers PROVER-2.v2 et PROVER-C-PX2-b.v2 ; prover seqsel M = 1 ; mesure Ukemi ties ; lecture principal-agent) ; `wf_4c261979-6a9` (Shōgen : cp-1 bref → G1 filtre d'exclusion ADR-0025). Journaux : `F:\claude-config\projects\F--Monark\e03dd7cc-…\subagents\workflows\<run>\journal.jsonl` (une ligne `result` par agent ; si le fichier de sortie d'un agent est vide, le texte n'est que dans la notification : persister depuis là).
- **À chaque retour** : (1) `sha256sum -c` des livrables ; (2) préfixe de modèle vérifié (R-1) ; (3) décisions Q-n tranchées et écrites ; (4) gel = `git add -A && git commit` dans le worktree du lot (jamais sur le tronc pour du code) ; (5) entrée CHANTIERS + FILE-ATTENTE ; (6) tabulations : le transport Bash réduit `\\t` en TAB → vérifier `count(chr(9)) == 0`, corriger par `replace(chr(9), chr(92)+'t')`.

## 3. Où sont les choses
- Tronc : `F:\Monark`, branche `lot/etude-suite` (main protégée ; `main` n'avance qu'aux publications). Worktrees des lots : `F:\Monark-wt-<lot>` (85 ; 67 déjà fusionnés à purger, lot M-8). Gels en attente de G2/cp-2/G7 : N2-1a `78b9378`, N2-3 `cb476f8`, K-1a `3402af4`, RG-1a `3c95562`, RG-1b `b9186e4`, RG-1c `5bf1ad0`, DRAND-1a `1252140`, PR-2b-3 `c07c01b`, PR-4b `0a23979`, PR-3b-1 fusionné `b45e7e0` (oracle vert, push sous go).
- Shōgen : dépôt `F:\Shogen` (roadmap `docs/05`, RUNBOOK `s2-harness/RUNBOOK-campagne.md`, harnais `s2-harness/shogen_s2/report.py`), campagne close et scellée `F:\shogen-campagne\campagne\` (`SHA256SUMS-cloture-2026-09-28.txt`, `CLOTURE-2026-09-28.md` ; **lecture seule absolue**, copies sous `F:\tmp\shogen-j28\work`) ; watchdog à désactiver (acte investisseur).
- Missions et rapports d'agents : `F:\tmp\<lot>\` (méthode : `F:\tmp\methode\` ; Narabi : `F:\tmp\narabi-px2\` ; Dōjō : `F:\tmp\dojo\` ; K-1 : `F:\tmp\k1\` ; conformal : `F:\tmp\conformal-2026-09-28\`). Produits et lectures : `F:\PRODUITS\` (procurements, PAROXYSME, LECTURES, AVIS).
- Verrou d'hôte : `F:\tmp\oracle-lock` (mkdir atomique, `owner.txt`, rmdir en trap ; C-V-4 : compter node.exe ET la mémoire libre ; 64 Go RAM, suites ≈ 1,3 Go/24 node).
- Miroir public : `KraidleAI/Monark` (export par `scripts/export-public.mjs`, `docs/**` jamais exporté, push sous go) ; gouvernance privée `KraidleAI/monark-governance`.

## 4. Décisions récentes à connaître (verbatim au CHANTIERS)
259 revue advisors ; 260 go permanent redéploiements (après G7 + cp-2) ; 261 Q-K1-6 (A) ; 262 lecteurs `high` (puis 267) ; 263 doctrine D-2 ; 264 audit de méthode ; 265 gel des lancements ; 266 activité publique + sécurités (D-3) ; 267 superpowers suivi + roster par palier, opus 5 banni ; 268 trois recherches + chantiers sans verrou (avant 271) ; 269 ADR-0025 acceptée + D-5 ; 270 J14 produit ; **271 : plus aucune tâche avant calibration de la méthode ; passation tenue à jour**.

## 5. Actes en attente de l'investisseur
Push PR-3b-1 ; redéploiements (harnais S1, sentinelle X8/X10, clé K-1) ; 2FA organisation GitHub + secret scanning org ; facturation GitHub Actions (CI privée) ; go correction `CLAUDE.md` (octets) ; désactiver le watchdog Shōgen ; procurements : P-PX2-g (Barber 2023 dernière version + NeurIPS), McLean-Pontiff 2016, Opdyke 2007, Mertens 2002, Lou 1996, Schwager 1983, Howard et al. 2021, LTT AoAS 2025, SM Science PPI, Tetenov 2016, PMLR 238/267 ; B-QUOTA-1 (décompte de la limite de session) ; publication J14/J28 Shōgen.

## 6. Bascule de compte Claude — ce qui change et ce qu'il faut refaire
- Le dossier de configuration est `F:\claude-config` (`CLAUDE_CONFIG_DIR`) : agents (`agents\*.md`), settings, transcriptions restent. Vérifier après bascule : (a) l'UUID du connecteur Firecrawl exposé (`ToolSearch firecrawl`) — il a changé cinq fois ; réécrire l'entrée `tools:` des 21 agents si besoin (procédure et sauvegardes : amendements CLAUDE.md 2026-09-19 → 09-26) ; (b) memstack reconnecté (headers) ; (c) `advisorModel` = `claude-fable-5-1` dans settings ; (d) plugin superpowers présent (magasin de l'application sous `C:\Users\KACIMI\AppData\Roaming\Claude\...`) ; (e) premier worker de chaque palier : contrôle de résolution R-1 (préfixe du modèle) avant consommation.
- La reprise automatique après limite lit `docs/HANDOFF-2026-09-27-fenetre.md` (ancien) : **ce fichier PASSATION.md le remplace** ; si une tâche planifiée pointe encore l'ancien, la corriger.
- Rien n'est à relancer sans go tant que 271 tient ; les agents morts à une limite laissent des états partiels dans les worktrees : préambule de reprise `F:\tmp\REPRISE-2026-09-28.md` (réutiliser l'état cohérent, section « Reprise », « [repris, non rejoué] »).

## 7. PAROXYSME (rappel obligatoire à chaque point d'étape)
Registres `F:\PRODUITS\paroxysme-2026-09-27\PAROXYSME-{Shogen,Hikae,Ukemi,Narabi,Bell}.md`. Narabi campagne 1 en cours (provers v2 en G2 léger ; items NARABI-K-SUP-90-122-1, NARABI-POW-ACC-1) ; Ukemi : UKEMI-UPPER-BOUND-1 (mesure en vol) ; Shōgen : clôture S2 = le rapport J14/J28 ; Hikae, Bell : campagnes à ouvrir après la méthode ; nature « Tiers » (D-2) à ajouter aux registres.
