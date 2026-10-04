# G0 du lot SPEC-PUBLISH-PIPELINE-1 : producteur du contenu de `KraidleAI/monark-kata-spec`

- **Demande** : MONARK, `recherches/coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-trois-taches.md` §1.2 ; zone ouverte : `scripts/` pour un outil neuf, son test sous `test/`, une ligne de CI s'il le faut, le G0 et le G7 du lot.
- **Cadre** : plan 1.1.0 r2 (`PLAN-CM-3c-CM-4.md` §9.2, acte 3 ; §9.4, item SPEC-PUBLISH-PIPELINE-1 ; §5.3, BLQ-DEP-7), brouillon `SPEC-1-1-0-brouillon.md` §2 (écriture canonique) et §10 (fichiers de table), avis du conseiller contrat §3 (acte 3).
- **Base** : `3e2cb345` (`origin/lot/etude-suite`), branche `recherches/spec-publish-pipeline-1`. Auteur : RECHERCHES.
- **Hors périmètre** : toute publication. L'outil n'écrit que dans un répertoire local ; il ne pousse rien. Publier reste l'acte de MONARK, sous les deux go datés du fondateur (F-5a, F-5b). La CI du dépôt de la spécification et la règle « table servie = table publiée » côté service restent à MONARK (questions en fin de G0).

## 1. Le dépôt public aujourd'hui (clone en lecture, tête `ddfee9e076d979081fa7b21ec27940e3556bacf7`)

| Fichier public | sha256 | Source | Statut |
|---|---|---|---|
| `KATA-SPEC.md` | `b32a4062…c39d` | `recherches` `kata/spec/KATA-SPEC.md` (commit `4ad765d`) | octets égaux |
| `vectors.json` | `06ecf069…a9fb` | `recherches` `kata/spec/vectors.json` (`4ad765d`) | octets égaux |
| `reports/wave1-report.md` | `e91edb41…016b` | `recherches` `kata/registry/wave1-report.md` (`a43ad70`), publié au commit `4b92f09` | octets égaux |
| `reports/README.md` | `32f26de6…0b2e` | **aucune** : ni dans le dépôt de gouvernance ni dans `recherches` ; écrit à la publication de `4b92f09` | sans source ; reporté depuis l'arbre publié |

Aucun des quatre fichiers n'a de copie dans le dépôt de gouvernance (recherche par empreinte sur `git ls-files` à la base : 0). « Depuis le dépôt de gouvernance » ne vaut donc aujourd'hui que pour l'outil et sa liste d'entrées ; les sources de la version actuelle sont dans `recherches` (privé). Les entrées 1.1.0 déclarées (§3) sont, elles, dans le dépôt de gouvernance.

## 2. Dessin

1. **Outil** : `scripts/spec-publish.mjs` (Node 24, sans dépendance hors des portes du dépôt), surface de types `scripts/spec-publish.d.mts`.
   `node scripts/spec-publish.mjs --release <id> --date <AAAA-MM-JJ> --out <rép> [--root <nom>=<rép>]… [--verify <rép>]`.
2. **Liste d'entrées fermée** : `scripts/spec-publish-inputs.json`, format `spec-inputs-v1`. Par version (`releases.<id>`) : `previous_commit` (tête du dépôt public que la version suit, ou `null`) et `entries`, chacune `{out, root, path, kind, sha256}` (plus `note` facultative). Clés fermées ; chemin de sortie relatif, sans `.`, `..` ni `.git` en tête, unique, hors noms réservés `VERSION` et `MANIFEST.sha256`. Tout écart : refus `inputs_invalid`.
3. **Racines** : `governance` (ce dépôt par défaut), `recherches` (un clone), `previous` (un clone propre du dépôt public à `previous_commit`). Une entrée d'une racine externe épingle son sha256 ; une entrée de `governance` peut l'épingler ou prendre l'octet de l'arbre courant (cas des schémas servis).
4. **Sortie déterministe** : chaque entrée copiée octet pour octet ; `VERSION` = la date en argument et un LF ; `MANIFEST.sha256` = une ligne `<sha256>  <chemin>` par autre fichier, triée par chemin, LF, vérifiable sans outil par `sha256sum -c --strict MANIFEST.sha256`. La date en argument est le seul temps de la sortie ; aucune horloge n'est lue. Mêmes sources et même date : mêmes octets. Le manifeste ne nomme aucune source (ni `recherches`, ni chemin interne).
5. **Fermé à l'échec** (sortie 1, rien d'écrit), chaque problème nommé par son code et tous listés : `release_unknown`, `date_invalid` (pas un jour du calendrier), `root_missing`, `input_blacklisted` (source de gouvernance sur la liste noire structurelle de `export-public.mjs`), `input_missing` (entrée déclarée absente), `input_digest`, `not_text` (non UTF-8 ou NUL), `crlf`, `vocabulary`, `json_invalid`, `schema_invalid` (sans `$schema`), `policy_table_invalid`, `not_canonical`, `previous_commit`, `previous_dirty`, `withdrawn` (un fichier de l'arbre publié que la version retirerait : règle « publiée, jamais retirée », CR-8). Un `--out` non vide est refusé.
6. **Fichiers de table** (`kind: policy-table`) : objet `{row_format: "class-policy-v2", class, rows}`, rangé sous `policy/<class.task_class>.json`, et **déjà écrit en écriture canonique** (brouillon §2) : ses octets égalent `canonicalJson(JSON.parse(octets))`. Ainsi le sha256 de la ligne du manifeste est le `policy_table_sha256` servi, et la CI du dépôt public le recalcule avec `sha256sum`.
7. **Porte de vocabulaire du dépôt public** (liste fermée de règles, sur chaque fichier sorti) : `lang` (porte de langue, masques de `lang-exempt.json`), `claims` (interdits globaux de `vocab-banned.json`), `vendor` (noms de fournisseurs de `public-text-deny.mjs`, toute casse), `kitchen` (formes de cuisine de `public-text-deny.mjs` sauf `G0..G7`, plus `RECHERCHES`), `secret` (formes de clé), `path` (chemin local Windows), `format` (caractère `\p{Cf}`), `email` (hors `noreply@`). **Proposition pour M-7 (BLQ-DEP-7)** : les noms de lieu (`binance`, `aave-v3-core`) ne sont pas interdits dans le dépôt de la spécification, puisque la grammaire des clés les porte ; les portées `site`, `skills` et `bell` ne s'y appliquent pas. La forme `G0..G7` et `monark-governance` restent permises : le rapport et les vecteurs publiés les citent (mesuré à `ddfee9e`).
8. **`--verify <rép>`** : après production, compare la sortie à un arbre (son `.git` ignoré), chemin par chemin ; sortie 0 si et seulement si mêmes chemins et mêmes octets. C'est le contrôle de composition que MONARK rejoue sur un clone du dépôt public.
9. **Git** : trois lectures seulement de l'arbre `previous` (`rev-parse HEAD`, `status --porcelain`, `ls-files`) ; aucune autre commande, aucun réseau.

## 3. Versions déclarées

- **`kata-wave1`** : le contenu publié à `ddfee9e` (KATA-SPEC version 2026-10-02, vecteurs, rapport de la vague 1, note du rapport), plus `VERSION` et `MANIFEST.sha256`. Sources : `recherches` pour trois fichiers, `previous` pour `reports/README.md` (sans autre source). `previous_commit` = `ddfee9e`.
- **`contract-1.1.0`**, déclarée d'avance, **fermée à l'échec tant que ses entrées manquent** : `GATE-CONTRACT.md`, `KATA-SPEC.md` (clarification des §2 et §5) et `NOTICE-1.1.0.md` depuis `spec/` du dépôt de gouvernance (chemins proposés) ; les schémas servis `prediction`, `coverage-verdict`, `gate-decision` depuis `schemas/`, et `policy-row`, `tool-error` (CM-3c-1) ; `vectors/contract-1.1.0.json` (vecteurs des tests CM-3c et CM-4, source proposée `spec/contract-1.1.0-vectors.json`) ; les 34 fichiers de table, un par `task_class` (32 classes kata `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}`, `stable-run-velocity-24h`, `liquidation-eligible-coverage`), source proposée `apps/harness/policy/<classe>.json` ; `vectors.json` et les deux rapports reportés de `previous`, épinglés. Les chemins proposés sont fixés par le lot qui pose la source ; modifier la liste est un commit relu.

## 4. Tests (`test/spec-publish.test.ts`, rouges à la base par échec d'assertion)

Le module est chargé à la demande : à la base, absent, chaque test rougit sur l'assertion « le module se charge ». Chaque test de premier niveau porte un tueur en forme fermée `// killer: <fichier>:<ligne> <OP> "<avant>" -> "<après>"`. Les arbres sources sont synthétiques, sous le répertoire temporaire du système (un arbre `previous` est un dépôt git local) ; aucun réseau.

- I-1 la liste épingle les quatre fichiers publiés à `ddfee9e` ; I-2 la liste déclare les entrées 1.1.0 (les 34 tables, les 5 schémas) et toute entrée de gouvernance absente de l'arbre est rapportée `input_missing`, rien n'est produit ; I-3 `parseInputs` refuse chaque écart du format fermé ;
- P-1 production octet pour octet, `VERSION`, `MANIFEST.sha256` ; P-2 **composition** : deux productions égales octet pour octet, seule la date déplace `VERSION` et le manifeste ; P-3 `--verify` en CLI (égal, différent, refus sans écriture) ;
- F-1 entrée absente, altérée ou sur liste noire, racine absente, `--out` non vide : refus sans écriture ; F-2 arbre `previous` à un autre commit, sale, ou fichier publié retiré (`VERSION` et le manifeste ne comptent pas) ;
- G-1 porte de vocabulaire, une règle par échantillon, et l'échantillon propre (lieux, `G0` d'un nom de fichier, `monark-governance`, `noreply@`) ; K-1 contrôles par sorte et table canonique ; C-1 écriture canonique (vecteurs du brouillon §2) ; D-1 date du calendrier et aucune lecture d'horloge ; N-1 aucune commande git hors des trois lectures, une seule écriture de fichier ; U-1 erreurs d'usage, sortie 2.

## 5. Taille et oracle

Code, surface de types, liste d'entrées et test : sous 547 lignes ascendantes (`scripts/oracle/r25.mjs`). Aucune ligne de CI : le test tourne dans `npm test`. Oracle : `npx tsc --noEmit`, eslint sur les fichiers changés, `npm run gate:vocab`, `npm run lang:gate`, `npm run export:check`, le test du lot, `scripts/red-proof.mjs --base 3e2cb345 --seed 37`.

## 6. Questions pour MONARK

- Q-SP-1 : les sources de la version actuelle restent dans `recherches` (privé). Faut-il les poser dans le dépôt de gouvernance (par exemple sous `spec/`), dans un lot dont la zone est à ouvrir ? Le rapport de la vague 1 (962 lignes) y dépasserait seul la borne de 547 sans exclusion R-25.
- Q-SP-2 : `reports/README.md` n'a aucune source ; il est reporté depuis l'arbre publié. Faut-il lui donner une source ?
- Q-SP-3 (M-7, BLQ-DEP-7) : accepter la porte du §2.7 (noms de lieu permis dans le dépôt de la spécification) ?
- Q-SP-4 : les schémas servis portent des renvois de gouvernance dans leur `description` (« ADR-M001 Decision 6 », « Decision 4 », « Decision 5 ») ; la porte `kitchen` les refuse, donc `contract-1.1.0` échouera sur eux tant que CM-3c ne les réécrit pas. Les réécrire en CM-3c, ou permettre ces formes dans le dépôt de la spécification ?
- Q-SP-5 : chemins proposés des sources 1.1.0 (`spec/…`, `apps/harness/policy/<classe>.json`) à confirmer par CM-3c, CM-4 et SPEC-1-1-0-RELEASE.
- Q-SP-6 : la CI du dépôt public (recalcul de `MANIFEST.sha256`, des empreintes de schémas et de `policy_table_sha256`) : un fichier de workflow produit par cet outil depuis une source de gouvernance (le format de chemin admet `.github/…`), ou écrit par MONARK dans le dépôt public ?

## 7. Bloc daté 2026-10-04 03:4x UTC : plis de la G2 (APPROUVE-AVEC-CORRECTIONS, 3 bloquantes) et scission R-25

**Scission (CHECKLIST-G7 §4 : « ≤ 547 ou lot scindé »).** La déclaration de la version `contract-1.1.0` (51 lignes de la liste d'entrées) et son test I-2 quittent ce lot pour **SPEC-1-1-0-RELEASE** (MONARK, go F-5a), qui les reprend avec des sources épinglées et ses chemins confirmés (Q-SP-5). Le §3 ne vaut plus que pour `kata-wave1` ; la sorte `policy-table` et l'écriture canonique restent dans l'outil, prêtes pour ce lot-là.

Le dessin du §2 change ainsi :
- **2.2 et 2.3** : toute entrée épingle son sha256, quelle que soit sa racine (`sha256: null` refusé ; règle de la G2 m2 : une version publiée n'a aucune entrée non épinglée). Deux sorties qui se recouvrent sont refusées : même nom à la casse près, ou un fichier sous un autre (`a` et `a/b.md`, `MANIFEST.sha256/x.md`) (B1).
- **2.3** : la racine `previous` doit être le sommet de son arbre git (`git rev-parse --show-toplevel HEAD` égal au chemin réel de la racine) au commit déclaré ; un sous-répertoire est refusé `previous_commit` (B2). Une entrée dont le chemin réel sort de sa racine (lien) est refusée `input_escapes` ; un répertoire, `input_not_file`.
- **2.4** : écriture atomique : l'arbre est écrit dans un répertoire temporaire à côté de `--out`, puis renommé ; tout échec laisse `--out` absent ou intact (`write_failed`). `--out` dans un arbre git est refusé (`out_in_git_tree`), un parent absent aussi (`out_parent_missing`). Fichiers en 0644, indépendants du umask.
- **2.7, porte de vocabulaire** (B3) : la porte des textes publics libres, `checkPublicText` de `public-text-deny.mjs` (sorte `notes`, portées de vitrine comprises), sur le texte normalisé NFKC, avec une **liste fermée d'exceptions** : `G0`..`G7` et `monark-governance` (déjà dans les fichiers publiés), l'URL du méta-schéma `https://json-schema.org/draft/…` (le `$schema` d'un schéma), et un nom de lieu **seulement dans une clé écrite dans sa grammaire** (`kata:<id>@<lieu>/…`, `ukemi:…@…/aave-v3-core/…`), jamais en prose. En plus : `recherches` à toute casse (`KraidleAI/recherches` compris), chemins personnels Unix et Windows, et des mots retenus hors de tout fichier par consigne, comparés par empreinte sha256 du mot NFKC en minuscules (le mot n'est écrit nulle part). Les fichiers JSON sont aussi passés décodés (clés et chaînes, échappements `\u` résolus). Les quatre fichiers publiés à `ddfee9e` passent.
- **2.9** : commandes git, toutes en lecture : `rev-parse --show-toplevel HEAD`, `status --porcelain`, `ls-files` sur `previous`, et `rev-parse --show-toplevel` sur le parent de `--out`.
- Non plié : l'état propre de l'arbre de gouvernance n'est plus contrôlé à part, parce que toute entrée est désormais épinglée par son sha256.
