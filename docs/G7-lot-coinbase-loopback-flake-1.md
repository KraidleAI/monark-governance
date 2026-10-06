# G7 du lot COINBASE-LOOPBACK-FLAKE-1 : un port de serveur qui n'écoute plus n'est plus jamais tiré dans le même processus

- **Base** : `6c6c0957`. **PR** : #204, branche `monark/coinbase-loopback-flake-1`. **Fusion au tronc** : `1bb5cdb3` (tête `6c3b4f1f`).
- **Commits du lot** :
  - `7336d0f7` : premier envoi ;
  - `dcb28610` : copie du harnais, test sans `fetch` ;
  - `f9ec88c3` : B-1, retrait dès l'appel à `close()` ;
  - `48921673` : note de G2, commentaire seul ;
  - `6c3b4f1f` : synchro du tronc `db778e2e`, pour `g6-compliance`.
- **G0** : `docs/G0-lot-coinbase-loopback-flake-1.md`. **Auteur** : MONARK. **Runtime des oracles et rejeux** : Node 24.15.0 (win32).

## G2 (RECHERCHES)

- **B-1** (moyenne), relevée sur `7336d0f7` (`e9de455`) : le port était retiré à l'événement `close`, qu'une connexion ouverte retient, alors
  que `close()` libère le port aussitôt. Pliée en `f9ec88c3` : l'assistant garde les serveurs rendus par port et ne tire plus le port d'un
  serveur dont `listening` est faux. RECHERCHES proposait d'envelopper `close` ; la lecture de `listening` couvre aussi toute autre fin
  d'écoute, ce qu'elle a accepté.
- **G2 sur `f9ec88c3`** : APPROUVE (`ac356e2`). Copie du harnais égale à l'octet, deux tests neufs qui disent leur cause.
- **Note optionnelle** : la carte garde chaque serveur rendu pour toute la vie du processus. Pliée en `48921673` (commentaire seul) ; pli
  accordé par RECHERCHES (`4dcf01d`).

## Mesures

- **Rouge à la base** : à l'assistant de `6c6c0957`, les deux tests neufs sont rouges par assertion (8 tests verts sur 10). À l'assistant de
  `dcb28610`, le second est rouge 5 fois sur 5.
- **Tueurs** : quatre mutants à la main, chacun tué par le test que nomme sa ligne « reddened by » :
  - lecture de `listening` retirée ;
  - aucun serveur gardé ;
  - retrait dès l'écoute ;
  - retrait à l'événement `close` seulement.
- **Windows** :
  - `test/loopback.test.ts`, 20 passages sous `--test-force-exit` : aucun arrêt du processus ;
  - rejeu des 22 fichiers de test qui utilisent l'assistant, sur la fusion : 438 tests, 410 verts, 0 échec, 28 sautés (plateforme), aucun
    arrêt.
- **Oracles** :
  - G1 sur `dcb28610` : sortie 0 (record `8d4940f5…`) ;
  - G1 sur `f9ec88c3` : sortie 0 (record `3d61a77e…`) ;
  - G7 sur la fusion `1bb5cdb3` : sortie 0 (record `4b5a4f59…`).
- **CI** : 10/10 sur `6c3b4f1f`.

## `error_origin`

- **Orchestrateur (MONARK)** : le premier envoi a fait rougir `g3-verification` (garde de la copie à l'octet du harnais), et le test à `fetch`
  arrêtait son fichier sous Windows, 20 fois sur 20. La copie n'avait pas suivi, l'oracle complet n'avait pas été lancé avant la PR, et
  l'aléa `UV_HANDLE_CLOSING` est connu des notes (G2 de U4b et de T1a-iii-a1). Cause : les notes du prédécesseur (HANDOFF, ETAT,
  TABLEAU) n'avaient pas été lues à la relève, ce qu'a relevé le fondateur. Correction : lues, et l'oracle complet précède désormais toute PR.
- **Générateur (MONARK)** : B-1, plié.

## Items

- **FORCE-EXIT-WASM-TIERUP-1** (formé à ETAT). Faits lus sur place : `docs/methode/FAITS-node-win-exit-abort-2026-10-06.md`, nodejs/node#56645,
  corrigé par nodejs/node#61999 dans Node 24.20.0 LTS. Construction : Node 24.21.0 sur l'hôte de travail (accord du fondateur), puis
  la sonde rejouée.
- **TEST-FORCE-EXIT-NEED-1** : porteur MONARK depuis la relève (Q-2 de RECHERCHES, `e9de455`), avec l'item précédent.
- **SITE-SEND-PRUNE-1** (formé à ETAT) : chaque envoi du site ajoute un `.bak` et un `.prev-*` (relevé au ménage du 2026-10-06).
