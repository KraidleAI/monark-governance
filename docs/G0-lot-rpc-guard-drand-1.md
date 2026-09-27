claude-opus-5-5[1m]

# G0 — journal du lot rpc-guard DRAND-RELAY-GET-1 (deux libellés GET sans clé des relais drand), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; worker planificateur, contexte frais ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : tâche de workflow de l'orchestrateur (texte calculé, horodatage 2026-09-27T10:35Z) ; aucune copie de mission sur disque citée par la tâche.
- **Livrable** : `docs/adr/ADR-RPC-GUARD-DRAND-1.md` (97 l., 0 CR, première ligne = modèle résolu), **sha256 `88d5319ec7cbce0a786750ec301bb77a10b912e6afc83c635c5cf63235e6432d`**, calculé à 10:43:42Z (`date -u`) ; non committé ; aucune édition après ce hachage. Hachages antérieurs, qui ne désignent plus le livrable : `d72ebcf0…9d81` (10:41:33Z, avant la seconde consultation), `6d285591…51f5` (10:43:37Z, heure de dernière édition inexacte).
- **Pli cp-1 (2026-09-27, C-V-5)** : « aucune édition après ce hachage » est **périmé**. Chaîne des états de l'ADR (chacun des trois premiers est préfixe du suivant, vérifié par `head -n` puis `sha256sum` à 10:57Z) : `88d5319e…6432d` (97 l., remise du G0, 10:43:42Z) → **`3261b32443ebc82696115097d765f53e620e00e9a576b99ad10ac04a4c742d19`** (99 l., 0 CR : + ligne datée de l'orchestrateur 10:44Z ; état lu par le checkpoint-1) → `39a2e68a8d1866817075e03a5fc8beead6e32449dfd992673dc9c6437042d8a9` (101 l., 0 CR : + ligne datée 10:57Z, verdict cp-1 et révision de Q-1 ; relevé à 10:57:22Z) → **`5525d88299012a0fbecfd4082f39095b2f897c6e329af8e952fae3fc782a59d5`** (117 l., 0 CR : pli cp-1, 16 lignes additives (dont 2 vides) insérées au fil du texte, aucune supprimée ni réécrite, `diff` sans ligne `<` ; relevé à 11:04:17Z). Le sha256 de ce journal est rendu hors du fichier.
- **Base** : worktree `F:/Monark-wt-dojo-a2`, branche `lot/dojo-pr2-2`, HEAD `f8f6105`. `git status --short` à l'ouverture : fichiers du G1 de PR-2-2 (G2 en cours), dont ` M docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` (copie égale au tronc) ; aucun n'est touché. Écrits : ce journal et l'ADR seulement.
- **Horloge** (`date -u`) : 10:32:28Z orientation (avant l'horodatage de mission 10:35Z : écart déclaré, sans effet) ; 10:38:52Z relevé des sha256 ; 10:40Z écriture de l'ADR ; 10:41:20Z fin de la première écriture ; 10:41:33Z premier hachage après correction des renvois au FAITS ; 10:43:37Z édition de D-1 (b) ; 10:43:42Z hachage final.
- **Discipline** : aucun `git` écrivant (lecture : `log`, `status`) ; aucun réseau ; rien sur C: ; aucun fichier existant modifié.

## Lu (sha256 relevés à 10:38:52Z, sauf mention)

| Entrée | sha256 | Lecture |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-2.md` (492 l.) | `2cf0fa34b38ff32f20d95436e276737d71259589e4d09f48d32e947749514dce` | D-1 (l.103-119), D-5 (l.151-165), §3, §4, §5, §6, §7 (lignes DRAND et P-3), §8 Q-O5, lignes datées 07:50Z, 08:00Z, 08:28Z ; reste par recherches |
| `docs/G1-lot-dojo-pr2-2.md` (177 l.) | `7c920b9d0cdc6d0214d6d5c2df44a89e8dc46ab87fda6b8cdc269085d5fd9e61` | en entier |
| `F:/tmp/dojo/pr2-2-deliver/withdrawn/DRAND-RELAY-GET-1-withdrawn.md` | `87613b3be1793bc2e24d7d64d64c46aa192c78050ebcc45c2c35eff7dfd49285` | en entier |
| `F:/Monark/docs/dojo/FAITS-drand-relays-terms-2026-09-27.md` (30 l.) | `1c19b94fe884dbaa0dd394cfc236206640a193fa5c6aeac3c25e66faf7a759e9` | en entier ; copie du worktree égale (même sha256) ; le G1 citait une version antérieure (`f1eeb197…`, 27 l.) |
| `docs/adr/ADR-DOJO-PR-2B.md` (904 l.) | `20e4d5d58dcfc821940bf93244ab63369286f85b9e6c346bca998a49f3c565fd` | D-13, l.478-492, table R-25 (l.514) ; par recherches |
| `apps/bell/test/bell-keys.test.ts` | `25ab6a2ac802ece1a0bc5fbf0fbbf231b76d97b0dc51f4c199d537ae1f7a59e8` | l.120-185 |
| `packages/rpc-guard/src/transport.ts` | `64a84454b8e8acd8c9f1cbb6347e0dc174f3a695573fa2d8ddbedbdbeb17385e` | en entier |
| `packages/rpc-guard/src/index.ts` | `db2908e99f2ea30824cb67d2ed380e50ba51475632a01d1d7ca43e14b7d4c5c8` | en entier |
| `packages/rpc-guard/test/exports.test.ts` | `8e69ccd545e9505fe8dc04197bb101e4f50463635b7d02cdfd5bfcb7fd8a37a8` | en entier |
| `packages/rpc-guard/src/client.ts` | `6553556c5d21079ac9609040f5bf312b81faf6ab8a472ea3d04dbb5a8402d50f` | en entier |
| `packages/rpc-guard/src/guarded.ts` | `a36fa005360cd4eae5f203b6f61771f24f3bc5deff3e4c8a5a3270ffb0b7fab6` | en entier |
| `packages/rpc-guard/src/lock.ts` | `6655a9c82a40106f5069e0e971467713e91678c6b19f43aa1b912ad5a322c244` | en entier |
| `packages/rpc-guard/src/ledger.ts` | `625c759fa6bc86748db4680b09419cebd1fe84677fb15b1e7a185d7f365146cb` | l.1-60, l.130-210 |
| `packages/rpc-guard/src/bell-methods.ts`, `classify.ts`, `errors.ts` | — | en entier ; l.20-40 ; l.1-30 |
| `packages/rpc-guard/test/error-hint.test.ts` | `f8543bb912f5f59966e3ddf433919c5d016d8e0e3d403fc47edafe38557ceb6e` | l.145-175 |
| `packages/rpc-guard/test/transport-hardening.test.ts` | `aafd5ebccfa49a46b4f93c466ea968667c7e52ae8fa421b02ec45d3f63b01ebd` | noms des tests, l.81-101 |
| `apps/dojo/src/collect.ts` (G1 PR-2-2, en G2) | `e903cf8adb35fc695233049a158a872a556c2cbeb9d689131c3758f3140caa5a` | recherches ; l.115-157 |
| `apps/dojo/src/dojo-methods.ts` | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` | recherches |
| `apps/dojo/test/helpers/collect-chain.ts` | `a77f0fcce1310aba020e1caf014cb26ba89ede362bfaf917b87f6497980e5332` | l.60-97 |
| `apps/dojo/test/dojo-collect.test.ts` | `ab065c7af42588bcf5576c8ab4a4fc2d217a142e58994182451522b27d9eed49` | recherches (`relays`) |
| `apps/bell/src/operators.ts`, `apps/bell/src/collect.ts` | — | l.1-33 ; recherches (`GET_LOGS_KEYLESS_LABELS`) |

Recherches : `operatorLabels(`, `resolveOperators(`, `.classes` sur `apps/`, `packages/` (consommateurs de l'ensemble des libellés : l'épingle de Bell et `error_preamble_carries_no_vocabulary_token`) ; `drand` hors `apps/dojo` : aucun.

## Constats qui fondent les décisions

1. L'épingle de Bell rougit pour **tout** libellé ajouté (égalité de liste), non pour le seul point : l'amender est inévitable (D-1, Q-2).
2. Le garde n'applique à un opérateur `keyless` que `maxCalls` ; aucun plafond par jour n'existe : un `--plan` manuel répété sur 404 n'est pas borné (D-1 (b), Q-1).
3. `RunDeps.relays` (fonctions nues) ne peut pas porter un client gardé, dont les verrous vivent une course : le consommateur passe par `course()` (D-2, Q-3). Formulation de la mission « via `RunDeps.relays` → `openGuardedClient` » : écart déclaré dans l'ADR.
4. ADR PR-2 §4 l.256 (« ensemble fermé des exports inchangé ») contre la mission (« test de gel amendé ») : la mission est suivie, l'écart est déclaré dans l'ADR.
5. L'estimation +45 de l'ADR PR-2 §5 ne comptait ni le consommateur ni le plafond par jour : ≈ 111 ; coupe 1a/1b pré-déclarée, G7 au gel de 1b (règle Branchement).

## Advisor

- Consulté une fois après l'orientation, avant l'écriture : suivi sur tous les points (épingle : cause = égalité de liste ; hash épinglé et test d'égalité ; forme (a) du tuyau et ses deux conséquences ; plafond par jour et traitement de `cycle_attempts` comme « aucun plan » ; arithmétique R-25 et coupe ; ordre D-5 ; menace TY-5 ; questions). Seconde consultation, avant la remise : (1) le sha256 de l'ADR est porté ici avec son heure, comme au précédent `G0-lot-dojo-pr2.md` ; (2) D-1 (b) précisé après lecture de `errors.ts:8` (`BudgetExceededError` sans motif structuré) : dans la course des relais, toute `BudgetExceededError` vaut « aucun plan à ce passage » ; (3) renvois de lignes vérifiés, aucun à corriger. Suivie.

## `error_origin` proposés (à assigner au G7)

- Rouge `bell-keys` du G1 de PR-2-2 et retrait du lot : planificateur du G0 de PR-2 (§4 l.256 et §7 : lot décrit sans lecture de l'épingle de Bell ni des consommateurs de `operatorLabels`) et générateur du G1 (déjà proposé au G1 §13).
- Estimation +45 (ADR PR-2 §5) : planificateur du G0 de PR-2 (consommateur et plafond non comptés).

## État à la remise

- `git status --short` : état d'ouverture, plus `?? docs/adr/ADR-RPC-GUARD-DRAND-1.md` et `?? docs/G0-lot-rpc-guard-drand-1.md`.
- **Pli cp-1 (2026-09-27, C-V-1 à C-V-5)** : passe de pli par `claude-opus-5-5[1m]` (tâche de workflow horodatée 10:55Z ; `date -u` 10:57:22Z ouverture, 11:04:16Z application à l'ADR, 11:04:17Z hachage de l'ADR). Lus en entier : `docs/CHECKPOINT1-lot-rpc-guard-drand-1.md` (40 l., `86327388f8fd2920c68d51315805637ef5dd7027bff301dd449db7dc697a6e54`), l'ADR (101 l.) et ce journal ; relus : `apps/dojo/src/collect.ts` l.120-180 et l.220-245, `apps/dojo/test/dojo-collect.test.ts` l.255-290, `packages/rpc-guard/src/client.ts` l.100-140, `apps/bell/src/collect.ts` (recherches `unlock`, `finally`), `docs/RUNBOOK-rpc-guard.md` (plan), `.github/workflows/ci.yml` l.76-96, ADR-DOJO-PR-2 l.235, l.310, l.326. Écrits : 16 lignes ajoutées à l’ADR (dont 2 vides), 2 à ce journal, aucune supprimée ; `git status --short` à la remise : les deux fichiers écrits restent `??`, aucune autre entrée touchée par cette passe (relevé d'ouverture de cette passe tronqué à 10 lignes : égalité complète non affirmée) ; aucun `git` écrivant, aucun réseau, rien sur C:. Advisor intégré consulté deux fois (avant l'écriture ; à la remise, 11:05Z) ; suivi (arithmétique par cas du plafond 4, placement des lignes, questions portées à l'orchestrateur).
