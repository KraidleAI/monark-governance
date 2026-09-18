# Checkpoint-1 — ADR-M015 / PLAN-STRATEGIE (phase de portefeuille) — avis du validateur-humain, persistés (K-B)

> Instance `validateur-humain` (`claude-fable-5-1`), contexte frais, Bash vérification seule. Deux avis le 2026-09-18. Persistés ici verbatim
> pour les sections décisionnelles (précédent : CHECKPOINT1-M004/M008/phase2). Artefacts jugés par sha : avis 1 = ADR `3bd7dc95905c1eb3`,
> PLAN `cfd6203c5b183a7f` (HEAD `1e71264`) ; avis 2 = ADR `eac213dbc0de119f`, PLAN `a6a7e61b22bca014` (HEAD `b37d16a`).

## Avis 1 — ESCALADE-INVESTISSEUR (CA-2) + corrections C-1..C-9

**Incident de gel** : pendant l'avis, `docs/biblio/procurements-M015/` est apparu (chercheurs, 20:25–20:26 UTC) — arbre non gelé, `error_origin = orchestrateur`.

**Six points demandés** :
1. *Thèse « moteur réel et mesuré avant toute pièce »* : **décision de valeur nouvelle**, pas conséquence de doctrine — le G7 UKEMI (ADR-M002 l.183) est
   scopé à Ukemi ; Shōgen, Hikae, Narabi ont été construits sans acheteur nommé ; ADR-M006 D8 fonde « mesurer la demande », pas « rien avant la
   mesure ». Les « Alternatives rejetées » étaient des one-liners sans lot ⇒ décision (0) à ajouter avec au moins une alternative costée.
2. *Réconciliation D4* : honnête en forme, invérifiable en matière tant que le second avis n'est pas archivé ; l'étiquette « seuils fixés après
   100 % des données » n'est un fait que si le régime 1 j n'a aucun held-out intact ; ε = 0,05 de (c′) perdu dans la réconciliation.
3. *P1* : ne touche ni contrat gelé ni oracle K8 (`GateEnvelope` hors `schemas/`, M005 D8) — mais `tool_schema_equals_frozen_schema` n'asserte que
   `properties.prediction` ⇒ ajouter `attested` ne le rougit pas ; le scan K-8 interdit `child_process` ⇒ attestation non vérifiée à l'appel (à
   déclarer, jamais via `residual`, `gate.ts:316`) ; `crossAgentGate` ne vérifie aucune liaison `subject` ↔ `prediction` ; composition paires vs
   scores committés à dire. 11 sites `residual: []` dans `gate.ts` ; `@monark/ukemi` importé par `cascade.ts:41`.
4. *Procurements* : émis au bon moment, pas tous formés (tentatives absentes sauf PR-2 ; 13 ≠ 14 ; PR-3/5/12/14 sont des recherches/mesures ;
   dûs de l'AUDIT §5 non repris : AIP 262, Aave V4 × Ethena, `TetherToken.redeem`, Risk Committee Ethena).
5. *Décisions* : manque (0) ; (2) à reformuler « ouvrir une 2ᵉ clé maintenant ou non » ; D3 confond M1 (vitrine) et D8 (harnais) ; « GTM 08 S7–S9 »
   = demande à l'investisseur, pas un lot.
6. *« 219 pulls »* : n'entre pas (lecture d'écran sans capture, définition non sourcée, « 8 jours » inféré) ⇒ quarantaine PR-4.

**Corrections** : C-1 décision (0) + alternative costée ; C-2 archiver les trois avis + entrée journal ; C-3 réinjecter ε = 0,05 et poser la question du
held-out du régime 1 j ; C-4 P1-a nomme test de dérive, non-vérification à l'appel, liaison, composition ; corriger 12 → 11 et le scope de « jamais
importé » ; C-5 14 partout, colonne tentatives, étiquettes R/M, reprendre ou clore les quatre dûs de l'AUDIT §5 ; C-6 séparer M1/D8, dire que M015 D3
clôt PF-M006-8 ; C-7 « 219 » en quarantaine ; C-8 MAST « rétention d'information » + « artefact mouvant » ; C-9 consigner l'incident de gel.

**Décisions à porter à l'investisseur** : (0) ratification de la thèse, de la règle généralisée, du calendrier, des pièces hors 12 mois ; (1) N ;
(2) 2ᵉ clé maintenant ou non ; (3) M014 (d)/(d′) ; (4) M012 (g) ; (5) token ↔ B_t ; (6) go `log` Caddy harnais ; (7) demande : GTM 08 S7–S9.

## Avis 2 (re-checkpoint) — ACCEPTE-AVEC-CORRECTIONS + ESCALADE maintenue sur (0)

**Gel** : 6/6 sha conformes à l'ouverture ; **rupture de gel n° 2** mesurée pendant la fenêtre : HEAD `b37d16a` → `b7ff7d8` (orchestrateur, PR-2 clos :
PLAN `a6a7e61b` → `d05def3d`, INDEX +7, deux fichiers Ukemi ajoutés). Avis rendu sur l'arbre de `b37d16a`.

**Jugement C-1..C-9** : C-1 foldée ; C-2 foldée (archivage architecture partiel, déclaré) ; C-3 foldée (ε = 0,05 verbatim de (c′)) ; C-4 foldée et
ancrée (vérifié : `schema.test.ts:48-95`, `registry.test.ts:34`, `gate.ts:316`, `cascade.ts:41`) ; C-5 **partiellement** (PR-15..18 en prose, 14 ≠ 18) ;
C-6 foldée et ancrée (`Caddyfile.monark-harness` sans `log`) ; C-7 foldée ; C-8 foldée ; C-9 texte foldé, **pratique non tenue** (2ᵉ occurrence).

**Provenance (CA-8)** : `74c9122` message « corrections foldées » sur un commit qui ne touchait pas l'ADR/PLAN (script avorté) ; entrée journal
« étude de portefeuille » annoncée deux fois et **absente** ; `b7ff7d8` mutation d'artefact gelé ; premier avis non persisté. Tous `error_origin = orchestrateur`.

**CA-1** : conforme sauf **K-0** (aucun critère de dégénérescence ni document de pré-enregistrement nommé). **CA-3** : M015 D3(b) accepté comme le texte
de l'ADR infra exigé par ADR-M006 l.69, à condition que le lot snippet cite « ADR-M015 D3(b) clôt PF-M006-8 ».

**Corrections** : **K-A** (bloquante) entrée journal avec les trois `error_origin` ; **K-B** (bloquante) persister les deux avis dans ce fichier ;
**K-C** (bloquante, structurelle) gel par identité d'artefact : chaque checkpoint reçoit un SHA de commit, le validateur lit `git show <sha>:<chemin>`,
l'orchestrateur ne committe rien sur la branche pendant la fenêtre ; **K-D** un seul compte (18), PR-15..18 en lignes complètes ; **K-E** K-0 nomme
son document de pré-enregistrement et ses seuils (ρ_min, nMin, largeur nulle) + checkpoint-1 avant pull ; **K-F** alignements (11/12 sites ; compte
des fichiers du dossier ; rattachement aux quatre AVIS) ; **K-G** (non bloquante) le mandat d'un re-checkpoint liste les corrections en clair.

**Escalade** : (0) ratification explicite face aux alternatives A/B/C/D ; **définition d'« acheteur nommé »** (entité identifiée formulant une
exigence de couverture, ou un profil suffit-il ? — rendue nécessaire par Ukemi mode L « payeur par profil ») ; N ; décisions 2–6.

**Prêt à exécuter ?** P0-a/P0-b dès K-A/K-B/K-C posées (indépendants de (0) et de N) ; P1-a après P0 ; D3 après N + go ; (l) à T ≥ 7 ; K-0/G-0/P3
après (0) + définition « acheteur nommé » + K-E / J+30 / décision (2).
