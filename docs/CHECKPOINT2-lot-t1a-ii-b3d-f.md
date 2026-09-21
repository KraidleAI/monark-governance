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
