# MONARK — le moteur : HIKAE et Genkan

Ce dépôt construit le moteur qui accueillera une stratégie de trading réelle :

- **HIKAE** reçoit un signal et décide s'il est permis d'agir : `COMMIT`, `DEFER` ou `ABSTAIN`, sous une couverture
  contrôlée. Il sait se taire. Il ne rend jamais une probabilité d'avoir raison.
- **Genkan** vérifie chaque ordre par un noyau Lean avant qu'il parte.

État vérifié, étapes et choix en vigueur : [`ROADMAP.md`](ROADMAP.md). Règles de travail : [`CLAUDE.md`](CLAUDE.md).

## Ce qu'il y a dedans

| Chemin | Rôle | État |
|---|---|---|
| `packages/hikae` | la porte conforme, en trois couches (ci-dessous), plus le suivi en ligne (détecteur de changement par paris, moniteur, budget `B_t`) | testé |
| `packages/contracts`, `schemas/` | les contrats gelés : `AttestedPrice`, `Prediction`, `CoverageVerdict`, `GateDecision` ; les schémas JSON font foi, le paquet en est la liaison TypeScript | testé |
| `apps/harness` | le moteur servi : un serveur MCP sans état (`gate`, `calibrate`, et encore `attest` de Shōgen et `cascade` d'UKEMI) | testé ; à réduire à HIKAE |
| `apps/genkan` | la porte d'ordres : noyau Lean 4 (`leanprover/lean4:v4.32.1`) qui décode un ordre au format `GNK1` et calcule un SHA-256 | noyau testé ; juge et théorèmes à venir |
| `packages/ukemi`, `packages/monark` | dépendances du harness (cascade UKEMI, adaptateurs Shōgen), gardées le temps de le réduire | testé |
| `fixtures/`, `tools/kata-recalc/` | données lues par le moteur et vérificateurs Python des tables de politique | — |

## Ce que HIKAE garantit, et ce qu'il ne garantit pas

| Couche | Rôle | Garantie déclarée par le code |
|---|---|---|
| L1 `l1-split` | split conforme par classe ; refus net (`under_calib`) si la calibration manque | couverture marginale, en échantillon fini, sous échangeabilité dans la classe ; aucune couverture conditionnelle à `x` |
| L2 `l2-monitor` | pas d'IM-OCP sur les étiquettes arrivées, budget `B_t` | moniteur : aucune garantie revendiquée |
| L3 `l3-gate` | politique fermée → `GateDecision` | justesse de la porte ; l'erreur conditionnelle à `COMMIT` n'est **pas** bornée par α |

Le détail et les sources sont dans [`packages/hikae/README.md`](packages/hikae/README.md).

## Installer et tester

Node 24 ou plus.

```bash
npm ci
npm run ci          # vocabulaire interdit + typecheck strict + tests
npm run lint        # puis : npm run lint:ratchet
```

Le noyau Lean de Genkan (chaîne d'outils sous `ELAN_HOME`). Le script `lake.mjs` ne crée rien : sous Windows, son dossier
temporaire `F:\tmp\genkan` (ou celui de `GENKAN_TMP`) doit exister avant le build.

```bash
node apps/genkan/scripts/audit.mjs --source-only
ELAN_HOME=F:/elan node apps/genkan/scripts/lake.mjs build
ELAN_HOME=F:/elan npm run test:genkan
```

La CI (`.github/workflows/ci.yml`) lance les tests, le lint, l'audit des dépendances, et construit puis rejoue le noyau Lean.

## Ce qui a quitté ce dépôt

Le 2026-11-04, tout ce qui n'est ni HIKAE, ni le moteur, ni Genkan a été archivé (Bell, Dōjō, Koyomi, Narabi, le site,
la documentation de gouvernance). Le tag git `archive/avant-recentrage-2026-11-04` garde le tronc complet d'avant.

## Licence

Apache 2.0 ([`LICENSE`](LICENSE)).
