# CHECKPOINT-2 - Bell -b3d-f - avis du validateur-humain (verbatim, claude-fable-5-1, 2026-09-21, HEAD juge 291d389)

# CHECKPOINT-2 (LIVRABLE) — lot Bell T-1a-ii-b3d-f (condition de GO (f), ITEM-A), HEAD `291d389`

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** Contexte frais, G2 parallèle non lue. Aucune écriture dépôt, aucun réseau, aucun `npm install`.

**Première ligne — blobs HEAD.**
- Les blobs de `291d389` valent `2c852f0c…` (src) et `299d3146…` (test). Ils sont identiques aux sha annoncés, au worktree et à ma copie.
- `git show --stat` : 2 fichiers, +144/−48. `git status` : 0 ligne avant et après.
- R-25 (pathspec `ci.yml:65`, base `f459cc2`) : **192 ≤ 1 205**.

**Artefacts lus.** `F:\tmp\b3df\RENDU-G1.md`, le diff source complet, les tests `:640-720`, `packages/rpc-guard/test/ledger-format-lock.test.ts`, le G0 -f et mon checkpoint-1.

**Rejeu.** Sous `F:\tmp\cp2-b3df\`, avec `git archive` de la base `f459cc2` et de HEAD, mon harnais cp1 réécrit et `TEMP=F:/tmp/cp2-b3df/tmp`.

## Rejeux (mes mesures)

| Point | BASE `f459cc2` | HEAD `291d389` |
|---|---|---|
| (a) retrait d'updA de `page_events`, `entry_sha256` intact | reprise ⇒ **`equal`, `scan_complete:true`** (ITEM-A reproduit) | **refus** `/chain does not re-derive/` via `runMain` |
| (a′) édition d'un champ **en place**, mêmes longueurs (`multiplierBitsHex`) | reprise acceptée (`divergence`) | **refus** |
| (b) hand-off injecté dans `page_handoffs` | `equal` **et `authority_change_found = true`** (vecteur L-5 réel) | **refus** |
| (c) C-F-1, `payload_sha256` supprimé sur disque, via `runMain` | sans objet | **refus** |
| (e) reprise honnête | `equal` | `equal` |

- **(d) refus avant écriture.** Sur (a), (a′) et (b), `budget.json` est byte-identique. La liste des fichiers de `--out` est la même avant et après. Il n'y a aucun `-attempt` ni aucun artefact nouveau.
- **Mutants sur la copie HEAD** (référence non mutée 58/58, restaurations byte-exactes OK) :

| Mutant | Résultat |
|---|---|
| M-f-1 | 56/2, tué |
| M-f-2 | 57/1, tué (chirurgical, sous-cas (b)) |
| M-f-3 | 45/13, tué |
| M-f-4 | 57/1, tué |
| refuse-always | 45/13, tué |

- **(f) mes deux mutants du helper partagé SURVIVENT à 58/58.**
  - **M-f-5** : `payloadSha` ne hache que les longueurs (`{e: events.length, h: handoffs.length}`), côté writer et côté vérificateur.
  - **M-f-6** : l'ordre des clés du payload haché est inversé des deux côtés.
- **(i) oracle.** `npm run ci` : 699 tests, **698 pass / 0 fail / 1 skip**. Le skip est `fetch_only_inside_client`, « until 1b », préexistant et déclaré. `ledger_format_locked_to_rebase_crosscheck` passe. `lint` : 0. `lint:ratchet` : **69/69**, plafond inchangé.

## Checklist
- **CA-1** conforme : (f) tient en une phrase, tests et mutants nommés.
- **CA-2** conforme : C-F-4 reste une question investisseur au G0 de la course.
- **CA-3** : l'Amendement de format n°2 est dû au pli G7 (voir (j)).
- **CA-4, CA-5** conformes.
- **CA-6** : oracle rejoué par moi. La G2 séparée est en cours, mon acceptation est conditionnée à son PASS.
- **CA-7** : l'item `ledger-format-lock` est formé ; son déclencheur est à nommer (C-V-3).
- **CA-8** : R-1 `claude-opus-4-8[1m]`. Le sha256 du worktree a été comparé au snapshot livré, la prescription R-3 de b1b est donc appliquée.
- **CA-9** conforme : base rouge et HEAD vert rejoués par moi.
- **CA-10** conforme.
- **CA-11 durci** conforme : tuyau `ledger-<MINT>.jsonl` → `verifyLedgerChain` → `resumeFromLedger:583`, exécuté par `runMain` depuis l'artefact réel. `…rederives_from_disk` lit désormais un ledger écrit par `runMain` (C-F-5 tenue).
- **Anti-close** : sans objet. Les fixtures sont synthétiques et le lot ne touche aucune donnée de prix.

## Réponses
- **(d)** Le `mkdirSync(candidateDir)` avant le refus est **acceptable, ne pas réordonner**. À une vraie reprise le répertoire existe déjà depuis run-1 (mon rejeu : `candidates/SPYx` déjà peuplé, liste de fichiers inchangée). Aucun octet porteur de verdict n'est écrit. À déclarer dans l'Amendement n°2 : « le refus précède toute écriture de `budget.json`, d'artefact et de ledger ; seule la création idempotente de répertoires le précède ».
- **(e)** Le contrôle couplé (c) et les 9 reprises honnêtes nommées suffisent : refuse-always fait 13 échecs.
- **(f)** Le code livré est correct : (a′) est refusé sur HEAD. La suite, elle, ne l'épingle pas. Un helper partagé dégénéré passe au vert, parce que (a) et (b) changent tous deux les longueurs. Un vecteur de valeur attendue littéral est donc nécessaire.
- **(g)** Reproduit. L'inversion de M-b1a-7/9 est déclarée proprement. M-b1a-7b reste valide, avec un correctif d'attribution honnête.
- **(h)** Le verrou du paquet **reste probant pour ce qu'il verrouille** : genèse, tête vide, primitive `sha(stringify(core))`. Il est générique et n'épingle aucun nombre de champs. L'arité 3 est inerte (`payloadSha(undefined, undefined)`). Elle masque toutefois qu'un appel sans payload est haché silencieusement (C-V-3).

## Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée ; C-V-1 bloquante avant G7)

Le pli C-V-1 est **test-seul**, donc sans G2-delta (précédent -b3d-a). L'acceptation reste conditionnée au PASS de la G2 séparée.

1. **C-V-1 (bloquante — `apps/bell/test/rebase-crosscheck.test.ts`).**
   - (i) Ajouter à `bell_crosscheck_resume_refuses_edited_payload` un sous-cas d'édition **en place à longueurs égales** : un champ d'un `MultiplierEvent` de `page_events`, `entry_sha256` conservé. Il doit produire le refus, `budget.json` byte-identique.
   - (ii) Ajouter un **vecteur de valeur attendue littéral** : pour un payload synthétique fixe, `payload_sha256` et `entry_sha256` valent deux hex écrits en dur. Cela rend exécutable la forme pré-enregistrée de l'Amendement n°2.
   - (iii) Ajouter le sous-cas C-F-1 **via `runMain`** : champ supprimé sur disque ⇒ refus. Mon checkpoint-1 l'exigeait par ce chemin ; le test livré est en mémoire.
   - Mutants à montrer rouges : M-f-5 (longueurs seules) et M-f-6 (ordre des clés).
   - `error_origin` : worker G1 pour les deux éditions de test qui changent la longueur ; validateur checkpoint-1 parce que mon C-F-3 n'exigeait pas l'édition en place.
2. **C-V-2 (docs, au pli G7 — voici ce que j'exige d'y voir, point (j)).** Amendement de format n°2, daté à la date réelle, §2 sha `7071484f…` recomputé avant et après, contenant :
   - le core à 10 champs, `payload_sha256` en dernier, avec sa formule exacte et l'ordre des clés `{page_events, page_handoffs}` ;
   - « forme écrite, ordre d'ingestion, writer unique ; JCS non retenue », avec le motif ;
   - un record sans `payload_sha256` est refusé, aucune migration ;
   - la phrase sur l'ordre refus/écriture du point (d) ;
   - `candidate_shas` hors chaîne, déclaré ;
   - le §5 en **deux vérifications** : (i) intégrité sur disque par recompute, (ii) vérité du payload **par ensemble `eventKey`** sur les pages re-tirées, **jamais** par recalcul de `payload_sha256` d'une page re-tirée, avec le motif (dédoublonnage de frontière, ordre non garanti) ;
   - le retrait du caveat ITEM-A de C-V-1(vii) b1a **par ce texte** ;
   - M-b1a-7/9 marqués inversés aux G0-b `:122-123` et `:153` ;
   - la condition (f) du G0-b `:239` notée « tenue par -f, sha de fusion ».
3. **C-V-3 (non bloquante, item formé).** Le déclencheur de `ledger-format-lock.test.ts:16-17` doit être **nommé GARDE-HELIUS-1b**, et non « un prochain lot » : synchroniser `RefMod` en arité 5 et passer `[], []`. `error_origin` : fait 5/6 du G0 -f, dont le grep des consommateurs précédait la fusion de rpc-guard (orchestrateur).
4. **C-V-4 (rappel).** C-F-4, l'ancrage externe par page, relève d'une **ESCALADE-INVESTISSEUR au G0 de la course**. (f) ne défait pas un éditeur qui re-hache toute la chaîne avant la publication de `ledger_sha256`. Cette limite est à écrire telle quelle dans l'Amendement n°2.

Aucune escalade n'est due maintenant.

**AM-1** — Attrapé : la suite ne distingue pas un engagement réel du payload d'un engagement de ses seules longueurs (M-f-5 survivant), ni une dérive de forme bilatérale (M-f-6). C-F-1 n'était pas prouvé par `runMain`. Manqué de mon checkpoint-1 : C-F-3 prescrivait « page_events édité (Initialize retiré) » et « +1 handoff », deux éditions qui changent la longueur. Le trou de test vient de ma prescription.

**Modèle résolu (R-1) : `claude-fable-5-1`.**


---

# RÉ-ACCEPTATION SUR PIÈCES — Bell -b3d-f, HEAD `85d4db6` : **ACCEPTE** (conditionnée au PASS de la G2 séparée)

**Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`.** J'ai rejoué sous `F:\tmp\cp2-b3df\head3\` depuis `git archive 85d4db6` (blobs HEAD). Aucune écriture dans le dépôt, aucun réseau, aucun `npm install`. `git status` est à 0 ligne avant et après.

## Première ligne — blobs HEAD
- `git show --stat 85d4db6` liste un seul fichier : `apps/bell/test/rebase-crosscheck.test.ts` (+39/−0).
- Les blobs HEAD valent `8091ac06…` pour le test et `2c852f0c…` pour le source. Le source est **inchangé** depuis `291d389` ; ma copie extraite porte les mêmes sha.
- Le pli ne touche que le test, donc pas de G2-delta (précédent -b3d-a).
- **R-25** (pathspec `ci.yml:65`, base `f459cc2`) : `2 files changed, 183 insertions(+), 48 deletions(-)`, soit **231 ≤ 1 205**. Cela concorde avec l'annonce.

## C-V-1 — vérifiée sur pièces et rejouée
- **(ii) Vecteur littéral recalculé par moi** avec `vector.mjs` : `createHash` brut, aucun import du dépôt. J'ai reconstruit l'événement à la main (champs dans l'ordre de `ev(...)`, `blockTimeSec = slot·100`, bits f64 LE) et le core à 10 champs avec `payload_sha256` en dernier.
  - `payload_sha256 = a3b346f0de060d33c20a461fcb40d600417f9b6f52282cd1a14fda69da40fd8e`
  - `entry_sha256 = 1e47da9efc918af3a74e7239677bf29c15a0fb1316f6a1e5fb2f9156c58cfbf4`
  - Les deux hex sont **identiques** aux littéraux du test. La forme pré-enregistrée de l'Amendement n°2 est donc exécutable et reproductible hors du code jugé. Ce sont des sha de données synthétiques, donc rien à signaler au titre de l'anti-close.
- **(i)** Le sous-cas (d) modifie `multiplierBitsHex` en place, sans changer les longueurs et en gardant `entry_sha256`. La reprise est refusée par `runMain` et `budget.json` reste byte-identique. Aucun `crosscheck-SPYx.json` ni `-attempt` n'est écrit.
- **(iii)** Le sous-cas (e) supprime `payload_sha256` sur disque. La reprise est refusée par `runMain`, avec les mêmes assertions de non-écriture.
- **Mutants sur la copie HEAD** (référence non mutée 58/58, toutes restaurations byte-exactes) :
  - **M-f-5** (longueurs seules) : 56/2, **TUÉ** par le vecteur et par (d).
  - **M-f-6** (ordre des clés) : 57/1, **TUÉ** par le vecteur. Ces deux mutants survivaient à `291d389`.
  - M-f-1 : 56/2, TUÉ.
  - M-f-2 : 56/2, TUÉ. Le vecteur le tue désormais aussi.
  - M-f-3 : 45/13, TUÉ.
  - M-f-4 : 56/2, TUÉ, désormais aussi par `runMain` (e).
  - refuse-always : 45/13, TUÉ.
- **Oracle complet dans le worktree** :
  - `npm run ci` : 699 tests, **698 pass, 0 fail, 1 skip** (`fetch_only_inside_client`, « until 1b », préexistant et déclaré), CI_EXIT=0.
  - `lint` : EXIT 0.
  - `lint:ratchet` : **69/69**, plafond inchangé.

## Liste résiduelle fermée (non bloquante pour l'acceptation ; due au G7, dans le SHA de fusion)
1. **Condition de régime B** : pas de G7 sans le PASS de la G2 séparée sur `291d389`. Si elle rend un défaut, je rejoue sur le périmètre touché.
2. **C-V-2** : l'Amendement de format n°2 doit porter les 9 points exigés, soit :
   - la formule et l'ordre des clés ;
   - la forme écrite (JCS non retenue) ;
   - le refus d'un record sans `payload_sha256`, sans migration ;
   - l'ordre refus/écriture, y compris la création idempotente de répertoires ;
   - `candidate_shas` hors chaîne ;
   - le §5 en deux vérifications, la seconde **par ensemble `eventKey`**, jamais par recalcul de `payload_sha256` sur une page re-tirée ;
   - le retrait du caveat ITEM-A ;
   - M-b1a-7/9 inversés ;
   - (f) notée « tenue par -f, sha de fusion ».
   Il faut aussi la limite « (f) ne défait pas un re-hachage complet avant publication de `ledger_sha256` », et le §2 `7071484f…` recomputé avant et après. J'exige d'y lire les **deux hex du vecteur** comme valeur de référence de la spéc.
3. **C-V-3** : déclencheur nommé **GARDE-HELIUS-1b** (`packages/rpc-guard/test/ledger-format-lock.test.ts:16-17`, arité 5, `[], []`).
4. **C-V-4** : l'ancrage externe par page reste une **ESCALADE-INVESTISSEUR** au G0 de la course.
5. **Persistance** : ajouter cette ré-acceptation au fichier de checkpoint-2 du lot.

Aucune escalade n'est due.

**AM-1** — Ce tour n'a rien révélé de nouveau : le pli est fidèle, et mes deux mutants qui survivaient sont maintenant tués par un vecteur que j'ai recalculé hors du code jugé. Une leçon à garder pour ma checklist : tout test d'intégrité par hachage doit comporter une édition à longueur égale et un vecteur de valeur attendue littéral, recalculé indépendamment du code.

**Modèle résolu (R-1) : `claude-fable-5-1`.**
