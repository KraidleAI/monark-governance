# CLAUDE.md — MONARK : HIKAE et Genkan

Écrit le 2026-11-04, au recentrage demandé par le fondateur. Ce fichier remplace, pour MONARK, toutes les règles et décisions
antérieures. Il reste court : une règle nouvelle remplace une ligne existante, elle ne s'ajoute pas en bas.

## 1. Le but

Construire le moteur de MONARK, celui qui accueillera la stratégie de trading du fondateur. La chaîne visée :

```
stratégie du fondateur ──signal──▶ HIKAE ──COMMIT / DEFER / ABSTAIN──▶ Genkan ──ordre vérifié──▶ place de marché
```

- **HIKAE** décide s'il est permis d'agir sur un signal, sous une couverture contrôlée, et sait se taire (ABSTAIN).
- **Genkan** vérifie chaque ordre par un noyau Lean avant qu'il parte.
- Le reste n'est pas notre travail. On accélère, et ce qu'on affirme est vérifié.

## 2. Le périmètre, et rien d'autre

| Où | Quoi |
|---|---|
| `packages/hikae` | la porte conforme : L1 split conforme par classe, L2 moniteur et budget `B_t`, L3 politique → `GateDecision` |
| `packages/contracts`, `schemas/` | les contrats : `AttestedPrice`, `Prediction`, `CoverageVerdict`, `GateDecision` (les schémas JSON font foi) |
| `apps/harness` | le moteur servi (serveur MCP : `gate`, `calibrate`, `judge`) |
| `apps/genkan` | la porte d'ordres : noyau Lean 4, chaîne d'outils épinglée `leanprover/lean4:v4.32.1` |
| `fixtures/`, `tools/kata-recalc/` | les données et vérificateurs que le moteur lit |

Hors périmètre : Bell, Dōjō, Koyomi, Narabi, le site, Shōgen et UKEMI comme produits, PIXEL, la stigmergie, KAIZEN, TYCHO.
Tout cela est archivé (section 7). On n'y retourne que sur demande du fondateur.

## 3. Les documents : cinq au plus

À la racine du dépôt, et nulle part ailleurs :

1. `CLAUDE.md` : ce fichier, les règles de travail.
2. `README.md` : ce qu'est le moteur, comment l'installer et le tester.
3. `ROADMAP.md` : où on en est, les étapes, le choix en vigueur de chaque sujet.
4. `ARCHITECTURE.md` : comment HIKAE, le harness et Genkan s'emboîtent (à écrire quand la stratégie est connue).
5. `STRATEGIE.md` : la stratégie du fondateur et son interface avec le moteur (quand il la partage).

Les README de paquets décrivent leur code, rien d'autre. Interdits : journaux de décisions, copies « gel », registres,
items, fichiers FAITS datés, plans de lot, rapports de passe. Une décision du fondateur devient une ligne de `ROADMAP.md`
(qui remplace l'ancienne) ou directement du code et un test.

## 4. Les décisions

Toutes les décisions antérieures au 2026-11-04 sont effacées : ADR, journaux du fondateur, PAUSE-MONARK, ETAT, registres
PAROXYSME, méthode par parties, mémoires. La seule référence est le code, ses tests, ces documents, et ce que le fondateur
dit à partir de maintenant.

## 5. Comment on travaille

1. **Vérifier avant d'affirmer.** Lire le code avant d'en parler, lancer le test avant de dire « ça marche », lire
   l'horloge (`date -u`) avant d'écrire une date. Un fait extérieur (API, place de marché, papier, prix) se cite avec sa
   source lue (lien et date) ; s'il n'est pas vérifié, on le dit en une phrase.
2. **Petits pas testés.** Un changement de comportement arrive avec le test qui le prouve, écrit d'abord quand c'est
   possible. `npm run ci` vert avant chaque commit ; le noyau Lean de Genkan passe en CI (`.github/workflows/ci.yml`).
3. **Pas de cérémonie.** Ni G0–G7, ni validateur, ni checkpoints, ni quatre couches, ni PAROXYSME, ni mutants ou
   « killers » obligatoires, ni zones, ni messages à RECHERCHES. Une revue par un agent neuf seulement pour un changement
   risqué (argent, clé, ordre réel, noyau Lean).
4. **Sous-agents** seulement s'ils font gagner du temps (recherche large, revue indépendante) ; modèle épinglé par son
   identifiant complet (règles du CLAUDE.md global, section 5).
5. **Le fondateur décide** de la stratégie, de l'argent, des places de marché et de ce qui est publié : une question
   claire, avec une recommandation. Le reste, on avance sans attendre.
6. **Rendre compte en clair** : ce qui est fait, vérifié comment, ce qui reste. En français.

## 6. Garde-fous qui restent

- **Aucun ordre réel**, dépôt, retrait ou transfert sans un go explicite du fondateur, ordre par ordre.
- **Aucune clé ni secret** lu, écrit, affiché ou committé ; aucun agent ne touche une clé.
- **HIKAE ne rend jamais une probabilité d'avoir raison** : sa garantie est celle que déclare son code (couverture
  marginale, en échantillon fini, sous échangeabilité dans la classe). Le test de vocabulaire (`npm run gate:vocab`) le tient.
- **Le dépôt GitHub `KraidleAI/monark-governance` est public** : rien n'est poussé sans l'accord du fondateur.
- **Rien sur C:** : caches, TEMP et outils restent sur F: (Lean : `ELAN_HOME=F:/elan`).
- **On archive, on ne supprime pas** (section 7).

## 7. L'archive

- Dossier : `F:\ARCHIVE-MONARK-2026-11-04\` (lire d'abord `MANIFESTE.md`) : worktrees, dossiers satellites, journaux,
  sources HIKAE et Genkan, et tout ce qui a quitté le dépôt.
- Git : le tag `archive/avant-recentrage-2026-11-04` garde le tronc complet ; les refs `refs/archive/2026-11-04/wt/*`
  gardent la tête de chaque ancien worktree.

## 8. Commandes

```bash
npm ci                     # installer
npm run ci                 # vocabulaire + typecheck strict + tests (hors noyau Lean)
npm run lint               # eslint, puis npm run lint:ratchet
node apps/genkan/scripts/audit.mjs --source-only             # audit des sources du noyau
ELAN_HOME=F:/elan node apps/genkan/scripts/lake.mjs build    # construire le noyau (F:/tmp/genkan doit exister)
ELAN_HOME=F:/elan npm run test:genkan                        # tous les tests Genkan, noyau compris
```
