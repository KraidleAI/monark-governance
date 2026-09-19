# CHECKPOINT-2 bis (LIVRABLE) — lot E-honnêteté-2, gel `4e752a6` (G2 delta sur `fededb7`, +1 ligne docs relue)
Rapport du validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2bis-ehonnetete\` (AM-2 ter) ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée, zéro code ⇒ pas de checkpoint-2 ter ; G7 peut suivre).**

## Vérifications sur pièces
- **V-1 fermée** : mutant Md rejoué (branche `apps/bell` retirée de `classifyScope`) ⇒ `lang-gate-routing.test.ts` ROUGE (`actual 'root', expected 'bell'`) ; suite complète 330/329/1, seul rouge = routage (test 42 vert = asymétrie fail-open désormais attrapée) ; `lang-gate.mjs` blob `38832c5c…` identique `6e07274`/`4e752a6`, sha `cbf28054…` avant = après.
- **V-4 fermée** : `surfaces()` dérive les READMEs de `collectFiles(ROOT).kept` ; mutant A (README sentinel créé avec surclaim) ROUGE ; mutant B (`verified` nu l.44 atelier) ROUGE (masque span-spécifique) ; **mutant TUYAU** (boucle `collectFiles` retirée de `surfaces()`, non rejoué par worker ni G2) ⇒ ROUGE « dead mask entry » — la composition est sous garde (CA-11). Restaurations sha-identiques ; README sentinel absent après.
- **V-2 cohérente** aux trois endroits (CHANTIERS §E, ADR-EC Q3, ADR-M018 amendement) + G2 §8 annoté.
- **Oracle** gel `4e752a6` : vocab 156 · tsc 0 · **330/330** · lint 0 · ratchet 69/69 · lang-gate 0 (12 scopes) · export:check 0. **Arbre composé** `merge-tree(etude-suite@8026280, e-honnetete@4e752a6)` rc 0 : **332/332** (328 + 4 tests neufs), lint/ratchet/lang-gate/export verts.
- **CA-11 / T0** : `fleet.ts` blob `f770e191…` identique base/6e07274/4e752a6 ; aucune pièce built nouvelle.
- **R-25** `ac04d41...4e752a6` = 407 brut / **264** D9 septies (pathspec confirmé `ci.yml:55` d'etude-suite).

## Checklist
CA-1/2/3 conformes ; CA-4/5 n-a ; CA-6 conforme ; CA-7 conforme sous liste fermée ; **CA-8 correction C-2** ; CA-9 conforme ; CA-10 conforme ; CA-11 conforme (tuyau rejoué rouge).

## Corrections (liste fermée)
- **C-1 (G7 tranche)** : `apps/sentinel/README.md` absent — (a) rédiger (surface publique, bloquant release, propriétaire + déclencheur) ; si (b) ⇒ escalade CA-2. → **Déjà tranché par l'investisseur : décision 29 = (a)**, plié dans le lot CI-site. Pas d'escalade.
- **C-2 (journal V-3)** : `error_origin` de la prémisse « README sentinel existant » = **validateur** (V-4 l'a listé) ; item `.mdx` avec propriétaire nommé (orchestrateur, inerte) ; consigner la chaîne `fededb7` → `4e752a6`.
- **C-3 (G7 standard)** : base mobile docs-only pendant le checkpoint ; G7 rejoue la CI sur le commit de fusion réel.
- **O-1 (formé, non bloquant, orchestrateur)** : la garde du tuyau `collectFiles → surfaces()` est indirecte (tient parce que « mutant verified » n'existe qu'à `atelier/README.md:22`) ; déclencheur : premier span LICIT porté par un README exporté ou ajouté hors READMEs ⇒ assertion directe « `surfaces()` contient ≥ 1 README dérivé de `collectFiles` ».
- V-3 + O-4 (ADR-M019 lignes « à ratifier » / « MONARK_PHASE conservé » périmées) dus au G7.

## AM-1
Attrapé : mutant tuyau non rejoué par worker ni G2 ; `error_origin` mal attribué ; base mobile. **Contre le validateur** : premier mutant B = no-op (`sed 44i` sur 42 lignes) rendu « vert », rattrapé par relecture ; refait par append ⇒ rouge l.44.
Preuve AM-2 ter : worktree et branche propres avant/après ; les commits concurrents sur `F:\Monark`, `wt-bell2a`, `wt-u1ahard2` sont ceux de l'orchestrateur (contenus étrangers au checkpoint), identité git partagée déclarée.

---
## Suite donnée par l'orchestrateur
G7 rendu (`docs/G7-lot-e-honnetete.md`), fusion `e756490`, CI rejouée sur la fusion réelle (C-3) ; C-1 = décision 29 (a) ; C-2 dans la ligne de journal ; O-4 plié dans ADR-M019 ; O-1 formé dans CHANTIERS.
