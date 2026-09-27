claude-opus-5-5[1m]

# G0 — journal du lot Dōjō PR-3, piste B (unité de collecte et minuterie ; éditeur ; unité de publication, CA, export ; historique), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` (décision 133), effort high (mission), contexte frais. Worker planificateur ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : `F:/tmp/dojo/mission-g0-pr3.md` (20 l.), sha256 `473835eb3bd8eb8800936da3e10af010f70ee618d93dd10af80c8d02d660a894` ; horodatage de mission 2026-09-27T07:10Z.
- **Livrable** : `docs/adr/ADR-DOJO-PR-3.md` (242 l., première ligne = modèle résolu, 0 CR, LF final), **sha256 `e89afa4882df167e9ec093f73c607e0f436cb96955fb23738666da9666d1f835`**, calculé à 07:32:01Z (`date -u`) ; non committé ; aucune édition après ce hachage. Un premier hachage (`7129b289…7290`, 236 l., 07:27:17Z) précède les corrections de la seconde consultation advisor ; il ne désigne plus le livrable.
- **Base** : worktree `F:/Monark-wt-dojo-b`, branche `lot/dojo-editeur-hote`, HEAD `02884eb` ; `git status --porcelain` : 0 ligne à l'ouverture (07:06:28Z) ; à la remise : `?? docs/adr/ADR-DOJO-PR-3.md`, `?? docs/G0-lot-dojo-pr3.md`.

## Horloge (`date -u`)

07:06:28Z (mission, état du worktree) ; 07:14:10Z (sha256 des entrées) ; 07:20:14Z (début de l'écriture) ; 07:27:12Z (deux renvois de lignes corrigés : `READ` l.143, `CHECK_NAMES` l.35-37 ; empreinte abrégée du RUNBOOK-bell corrigée en `…b67a`) ; 07:27:17Z (premier hachage) ; 07:32:01Z (hachage du livrable après les corrections de la seconde consultation).

## Lu (sha256 recalculés à 07:14:10Z sauf mention)

| Entrée | sha256 | Lecture |
|---|---|---|
| mission | `473835eb…a894` | en entier |
| plan `F:/Monark-wt-dojo/docs/PLAN-DOJO-PAGE-1.md` (232 l., non committé) | `7a333905e5686393b2da7a267648577f4c74ab242af73b7e476ebc78ea0eb28b` | en entier |
| mère, arbre de travail `F:/Monark-wt-dojo` (1 171 l., non committée) | `e3ec03afc592748e17c2134a38ac5dce1adc512c51644d3925b25110c8667f36` | onzième pli l.1123-1171 en entier |
| mère au `02884eb` (1 103 l.) | `fc93f66c6da322c6016d6c2e0643a635543520e18026081372deb89149d35078` | §0, D-7 à D-11, D-15 à D-18, §4 à §7, §9, §10.1, §11, dixième pli |
| rapport cp-1 du plan (52 l.) | `769d7328e4b3f77ee00e2ccdc6a323078e583831b3f74d8d66d822b160a4a063` | en entier |
| `docs/adr/ADR-DOJO-PR-2.md` (411 l.) | `397e6d4c9e0a93033220d857187140d934e35c8ee0d19015d1a6c9199a6267a1` | en entier |
| `apps/dojo/src/bundle.ts` / `reading.ts` | `e8b1fb38…3fda` / `120e5112…9213` | en entier / l.1-40 et exports |
| `docs/RUNBOOK-bell.md` / ADR-BELL-OTS-ANCHOR-1 / `scripts/verify-bell.mjs` | `885fa278…b67a` / `1f94a5e1…3246` / `ab0a386e…c70f` | extraits (ADR §10) |
| `deploy/monark-sentinel.service` / `monark-bell-publish.service` | `d526f9c0…6e46` / `1eb65e93…660d` | en entier (avec `.timer`, `monark-probe.*`, `Caddyfile.monark-bell`) |
| CHANTIERS du tronc (1 795 l.) | `5c125e572a9100688fdca7f65f129743a31db35b4b40f6a1499f6d7e443ee449` | l.1621, 1685, 1760, 1762, 1767, 1770, 1783, 1791, 1795 |

## Décisions (une ligne ; détail dans l'ADR)

- D-1 coupe et ordre : PR-3b-1 (≈ 185) → PR-3a-1 (≈ 512) → PR-3b-2 (≈ 457) → PR-3a-2 (≈ 90), série dans `-b` ; lot Bell BELL-CA-DOJO-1 hors série (≈ 30) ; coupe de repli de PR-3a-1 pré-déclarée, non prise d'avance.
- D-2 tuyaux : TU-2 amendé, TU-C (nouveau), TU-4 amendé (passage local), TU-1c avec `check`, TU-11, TU-12c, TU-5, TU-6, TU-10, TU-K ; format de CA gelé (`dojo-deploy-ca-v1`, douze contrôles) ; la pièce reste `upcoming` à tous les G7 de PR-3.
- D-3 hôte : A (hôte Bell) recommandée, B (VPS du site, PR-3b-3) écrite ; actes A-1 à A-10 sous go groupé ; partition statique du cycle Helius.
- D-4 ancre : OpenTimestamps procédural sur la machine opérateur ; premier jour compté après le bloc constaté, heure du bloc par FAITS-BTC-BLOCKTIME-1 ; `horizon` 365 proposé ; répétition d'un jour au moins ; QI-4 option (c) : rien de servi avant l'annonce.
- D-5 sécurité : deux utilisateurs disjoints, clé de signature hors réseau, clé Helius par `EnvironmentFile` (imposé par `transport.ts:96`), graine par `LoadCredential`, état hors de `public/`, garde de graine, rotation avant la clé, minuteries à valeurs posées.
- D-6 : tests et mutants par PR (M-E5 à M-E12, M-H4 à M-H15 nouveaux) ; R-25 ; C-V-4, C-V-5.

## R-25 par PR (estimations, ×2,1)

PR-3b-1 185 (388,5) ; PR-3a-1 512 (1 075,2 ; marge 74,8) ; PR-3b-2 442 (928,2 ; 457 et 959,7 si QI-4 = (a)) ; PR-3a-2 90 (189) ; lot d'export à l'annonce 15 (31,5 ; si QI-4 ≠ (a)) ; BELL-CA-DOJO-1 30 (63) ; PR-3b-3 (variante B) 100 (210). Piste B : 1 229 + 15 = 1 244 (plan : 1 104).

## Questions

- Investisseur : QI-2 (hôte de la collecte ; A recommandée) ; QI-4 reformulée ((a), (b), (c) ; (c) recommandée) ; QI-5 (jour de répétition ; oui).
- Orchestrateur : Q-O1 (second worktree pour B1) ; Q-O2 (DOJO-TICK-ARGV-1, DOJO-HANDOFF-LAYOUT-1 dans la ligne datée `--tick`) ; Q-O3 (lot Bell) ; Q-O4 (G7 de PR-3b-1 après PR-2-2) ; Q-O5 (outil de graine) ; Q-O6 (C-V-6 avant le cp-1 de ce G0).

## Écarts relevés (ADR §1.4)

É-1 sonde réseau déjà sur l'hôte Bell (plan QI-2 inexact) ; É-2 BELL-CA-DOJO-1 = lot Bell (contrôle 11 à une seule ligne `import`) ; É-3 plafond Helius 10 000 000 contre 8 000 000 à l'ADR PR-2 ; É-4 TU-1c exige les `readings` et `Eve` ; É-5 rotation absente de T-9 ; É-6 minuterie de publication absente de T-10 ; É-7 dérogation à « aucune collecte sur l'hôte » ; É-8 un seul worktree pour B1 et B2.

## Conduite

- Aucun appel réseau ni RPC ; aucun navigateur ; `git` en lecture seule (`log`, `status`, `branch`, `remote -v`) ; aucun `GIT_DIR`, `GIT_WORK_TREE`, `--write-tree` ; rien sur C: ; écritures dans le worktree : l'ADR et ce journal (outil d'écriture ; une première tentative par heredoc a échoué au lancement, « name too long », sans rien écrire) ; deux corrections en place par `sed` (renvois de lignes et empreinte abrégée), avant le hachage.
- Advisor intégré : (1) après l'orientation, avant l'écriture : points listés à l'ADR §10, chacun vérifié sur pièce ; (2) après le premier hachage, avant la remise : sept points, tous appliqués (conseil, jamais verdict) : (a) tuyaux absents sans item ⇒ item DOJO-PR3-PIPES-1 (TU-C, TU-4, TU-1c, TU-12c, TU-K, TU-1p et TU-1h du premier jour, chacun avec déclencheur) ; (b) amendements de la mère non formés ⇒ item PLI-MERE-PR3-1 (T-9, T-10, D-9, §5, §7, §11) ; (c) transferts du premier jour compté (paquet d'historique vers l'hôte, `readings/` vers la machine opérateur) ⇒ acte A-11, lignes TU-1p et TU-1h au §3, refus quotidiens `history_missing` attendus avant la ligne `history` ; (d) export sous QI-4 (c) ⇒ lignes et test d'export hors de PR-3b-2 sauf (a), lot DOJO-EXPORT-AT-ANNOUNCE-1 (≈ 15), PR-3b-2 à 442 ; (e) verrous `<cycleDir>/<op>.lock` sous `/var/lib/monark-dojo-collect/ledger`, collision avec Bell (TY-4) sans objet en variante A ; (f) répertoires 0700 pré-créés à A-2 (l'umask 0027 donnerait 0750) ; (g) remise : `wc -l` 242, 0 CR, LF final, nouveau sha256.

## Pli cp-1

- **Pli cp-1 (2026-09-27, en-tête)** : checkpoint-1 bref de ce G0, validateur `claude-fable-5-1`, rapport `F:/tmp/dojo/cp1-pr3/CP1-report.md` (46 l., sha256 `3b1b89c4216122ead6555c44730b48da065d13f20ed7563297a2e071a9e0de3a`, recalculé à 07:50:05Z) : **ACCEPTE-AVEC-CORRECTIONS**, liste fermée C-V-1 à C-V-6, pliées dans l'ADR par 15 lignes datées « Pli cp-1 (2026-09-27, …) », insertions seules. ADR d'avant : 242 l., sha256 `e89afa4882df167e9ec093f73c607e0f436cb96955fb23738666da9666d1f835` ; **ADR d'après : 257 l., sha256 `c6e75f59cb0414fe421f5609e4135fa3937f3c82e5a3e757d86b0500b2d78c74`**, calculé à 07:56:19Z (`date -u`) ; aucune édition après ce hachage. Journal d'avant ce pli : 54 l., sha256 `186fb648e8dd28fee87876aecbfa5d94d0c0b7fd83befcebc533256455ac36b1` ; d'après : rendu hors du fichier. En-tête « Statut » de l'ADR non touché (orchestrateur).
- **Pli cp-1 (2026-09-27, C-V-1)** : plan et onzième pli cités par le commit `b876747b924bdde4b7f246815926d76034d0e640` : plan 251 l., sha256 `87db0cd99170d4240c4ab16a4b6d1c906a8c3d3c7a1affb5628eb4b5494c8154` ; mère 1 179 l., sha256 `6e1f916a28b58c570e1957784a4ca8b9922057871e77a76878659f21143d2bfe` (onzième pli l.1123-1171, pli cp-1 du plan l.1172-1179) ; recalculés par `git show b876747:<chemin> | sha256sum` ; ADR l.10 (Rattachement) et l.232 (Q-O6 répondue) ; delta avec les sha d'arbre de travail = lignes de pli cp-1 du plan, aucune relecture due (constat du validateur, rapport §4).
- **Pli cp-1 (2026-09-27, C-V-2)** : DOJO-HANDOFF-LAYOUT-1 ajouté aux dépendances du G1 de PR-3a-1 ; `dojo_publish_to_verify_end_to_end` écrit dans la disposition de la ligne datée de l'ADR PR-2 D-7, citée par sha ; ADR l.70 (D-1), l.127 (§3, TU-1c), l.203 (§7).
- **Pli cp-1 (2026-09-27, C-V-3)** : dérive de format entre worktrees = FM-1.1 (mère l.541, l.1177 au `b876747` ; plan l.100, piste B1) ; FM-3.3 réservé à « éditeur et vérificateur partagent un défaut » (mère l.554) ; ADR l.117 (D-6). La même lecture pour D-1 « Alternatives rejetées » est une extension du rédacteur, soumise à l'orchestrateur.
- **Pli cp-1 (2026-09-27, C-V-4)** : liste fermée A-1 à A-11 partout (la mention « A-1 à A-10 » de la ligne D-3 de ce journal et de l'ADR est caduque) ; décision de l'orchestrateur (texte de la mission de ce pli) : sous QI-4 (c), A-1 et A-6 « au jour de l'annonce » = tranche du même go groupé, un seul go, deux dates d'exécution ; variante B relue en B-1 à B-13 (arithmétique du rédacteur du pli, 11 + 2) ; ADR l.91, l.93 (D-3), l.198 (§7 DOJO-HOST-1), l.221 (QI-2). Bloquante avant le go groupé, non avant un G1.
- **Pli cp-1 (2026-09-27, C-V-5)** : coupe de repli de PR-3a-1 pré-déclarée à l'ouverture de son G1 : compte ascendant de la mission au-delà de 547 ⇒ coupe avant toute écriture ; au-delà de 1 150 mesuré = STOP de R-25, jamais un déclencheur ; motif de débit de D-1 non retenu (CA-10) ; ×2,05 (913 / 445) et ×2,00 (913 / 456, cp-2 de PR-2-1 C-V-1) tracés ; ADR l.74 (D-1), l.189 (§7).
- **Pli cp-1 (2026-09-27, C-V-6)** : porte fermée unique du G1 de PR-3b-1 = QI-2 répondue + ligne datée `--tick` (DOJO-TICK-ARGV-1 et DOJO-HANDOFF-LAYOUT-1, Q-O2) avec son cp-1 bref + FAITS-SYSTEMD-TIMER-1 lu + PLI-MERE-PR3-1 plié ; préalable : ce pli relu par l'orchestrateur ; ADR l.72 (D-1), l.214 (renvoi du §7).
- **Pli cp-1 (2026-09-27, décisions déléguées)** : rendues par le rapport §4, consignées ici seulement (non pliées dans le corps de l'ADR ; placement laissé à l'orchestrateur) : `horizon` = 365 accepté (CA-2) ; DOJO-ANCHOR-PRIORITY-1 et DOJO-ANCHOR-OTS-DATE-RULE-1 clos à ce cp-1 ; DOJO-CA-FORMAT-1 gelé par D-2 ; Q-O1 à Q-O5 concordantes avec la checklist. Aucune question nouvelle à l'investisseur (QI-2, QI-4, QI-5 inchangées).
- **Pli cp-1 (2026-09-27, horloge)** : `date -u` 07:50:05Z (lecture, sha256 des entrées) ; 07:54:11Z (copies d'avant sous le scratchpad F:) ; 07:55:59Z (fragments remplis par commande) ; 07:56:19Z (hachage de l'ADR) ; 07:56:51Z (écriture de cette section).
- **Pli cp-1 (2026-09-27, conduite)** : worker `claude-opus-5-5[1m]` (R-1), tâche de workflow de l'orchestrateur (horodatage 2026-09-27T07:55Z) ; empreintes, compteurs de lignes et citations (« au jour de l'annonce », libellés FM-1.1 et FM-3.3, « éditeur et vérificateur partagent un défaut », « deux lecteurs d'une même forme ») copiés par commande dans des fragments, insérés en un passage `sed` ; `diff` d'avant/après : 0 ligne retirée, 15 ajoutées (ADR) ; 0 CR, LF final ; `git` en lecture seule (`log`, `status`, `show`, `cat-file`, `merge-base`, `rev-parse`), aucun réseau, rien sur C: ; advisor intégré consulté après l'orientation, avant l'écriture ; conseil, jamais verdict.
