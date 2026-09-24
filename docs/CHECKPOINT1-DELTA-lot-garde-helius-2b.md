# CHECKPOINT-1 DELTA — complément GARDE-HELIUS-2b (`docs/G0-COMPLEMENT-lot-garde-helius-2b.md`, HEAD `9dd7615`)

**Décision : APPROUVE-AVEC-CORRECTIONS** (liste fermée C-1..C-7, à plier dans le complément avant tout code). Pas d'escalade.

**Ce que j'ai lu, sans rien exécuter :**
- le complément ;
- `apps/sentinel/src/ukemi/rpc2.ts:20-72,205-222` et `record.ts:55-62,101-120,335-427` ;
- `packages/rpc-guard/src/{transport.ts:139-142, errors.ts}` fusionnés ;
- `apps/sentinel/src/rpc.ts:29-35` ;
- `docs/G0-lot-garde-helius.md` et `docs/CHANTIERS.md:550`.

Je n'ai pas revérifié la clôture de C-R-3 que tu décris : je la prends telle que rapportée.

## Tes quatre questions

**(1) D6 ferme-t-elle C-GD-2 ?**
- Oui pour le texte libre, à condition que l'indice émette les jetons du vocabulaire sous forme canonique et jamais la sous-chaîne prise dans le corps.
- La liste réelle est `more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size|maximum allowed|ranges? over|narrow your filter`, plus `free plan`.
- `result` est large, mais c'est un littéral. Il ne transporte que « result ». Sa largeur existe déjà sur le corps brut ; D6 ne l'aggrave pas.
- Le seul canal restant est la présence ou l'ordre d'une quinzaine de jetons, soit quelques dizaines de bits. Voir C-5 pour le réduire encore.
- D6 oublie en revanche un troisième classifieur qui lit le même message. Voir C-1.

**(2) Journal `rpcErrors`.**
- Je confirme : oui, c'est une correction. Voir C-3.
- `rpc_errors` est écrit sous `--out` (`record.ts:398/427`) avec `message: body` et `data`.

**(3) Checklist sur le complément.**
- CA-2 : aucune décision de valeur. D6 est du travail sur le paquet fait dans le lot de migration. Il faut le déclarer par rapport à la couture 2a/2b.
- CA-3 : A-3bis est nommé. Il faut ajouter un amendement daté pour l'identité `RpcError` (C-1).
- CA-7 : le résidu keyless est déclaré. Il faut déclarer le résidu de C-1, troisième sous-point.
- CA-11 : conforme. Test de bout en bout `runRecorder → unlock → reconcile`, et `upcoming` jusqu'à la première course rapprochée.

**(4) Reprise de mes C-3 à C-6.**
- C-3 : présent, ligne 18.
- C-5 (tests) : présent, ligne 22.
- C-6 : présent, lignes 22 et 30.
- `--floor` : présent, ligne 21.
- C-4 : pas entièrement plié.
  - Le déclencheur d'allowlist NARABI-OPS-1d est présent, ligne 20.
  - Le résiduel accepté est dans `CHANTIERS.md:550`.
  - Mais je ne trouve aucune ligne datée amendant le G0 §6.1 (« Allowlist = UN SEUL module »). Voir C-7.

## Corrections (liste fermée)

- **C-1 (bloquant) — le troisième classifieur, `isRpcRevert` (`rpc2.ts:54`), casse sous le garde.**
  - Sans ces trois corrections, le quorum de 2b est faux sur les reverts. Cela touche la tolérance `description()` de `book.ts`, donc le livre.
  - *Identité de classe.*
    - Le `RpcError` du recorder (`rpc2.ts:37`) n'est pas le `TransportError` du garde, même quand `name:"RpcError"`.
    - `instanceof` échoue, donc tout revert passant par le garde est mis sur le banc et `ConcordantRevertError` ne se forme plus.
    - C'est le cas C-13/D5 pour une seconde classe.
    - Exigé : une seule classe canonique exportée par le paquet et ré-exportée par `rpc2.ts` (calque D5). À défaut, une reconnaissance déclarée.
    - Dans les deux cas, un mutant « identité cassée » doit être rouge.
  - *Vocabulaire.* `ERROR_HINT_TOKENS` doit contenir `execution reverted` et `revert`. Le test de conformité doit couvrir `isRpcRevert`.
  - *`.data` perdue.*
    - `transport.ts:142` ne passe que le message, alors que `revertKey` (`rpc2.ts:57-59`) compare d'abord `e.data`.
    - Avec D6, tous les messages de revert payants deviennent identiques. Deux reverts pour des raisons différentes paraîtraient concordants.
    - Pour les keyless, le message porte le label de l'opérateur, donc deux fournisseurs ne concordent jamais.
    - Exigé :
      - `TransportError.data?`, validée `/^0x[0-9a-fA-F]*$/`, sinon abandonnée ;
      - le message JSON-RPC brut expurgé, exposé sans le préambule à label ;
      - une règle déclarée : sans `data`, un revert d'opérateur payant va au banc.
  - `error_origin` : partagé entre le plan D5, le worker 2a et moi.

- **C-2 — V-1(d) à reporter.**
  - `record.ts:114-119` garde le corps non-JSON hors du message levé, pour qu'une page HTML contenant « result » ne déclenche pas un découpage de plage.
  - Sur un opérateur payant, ce découpage peut aller jusqu'à 2^20 appels.
  - Le `NonJsonBody` du garde met le corps dans le message.
  - Exigé : pour `NonJsonBody`, aucun indice, que l'opérateur soit payant ou keyless. Ajouter une fixture HTML au test de conformité et un mutant.

- **C-3 — journal (ta question 2).**
  - Pour un opérateur payant, `RpcErrorRecord.message` reçoit l'indice fermé et `data` la valeur validée. Le corps ne va jamais sur disque.
  - Le recorder construit l'enregistrement dans son propre enveloppeur, à partir de la `TransportError` attrapée. Il a la méthode sous la main, alors que le hook ne la porte pas.
  - Test demandé : un corps contenant une clé factice en base64 ne doit apparaître ni dans `rpc_errors` ni dans stderr.

- **C-4 — source unique du vocabulaire.**
  - `rpc2.ts` importe `isResultLimit` et `isPlanLimited` (et le critère de revert) du paquet. Le sens apps→packages est licite.
  - Il ne garde pas une seconde regex que le test de conformité n'épinglerait que sur les fixtures d'hier.

- **C-5 — forme de l'indice.**
  - L'indice est l'ensemble trié et dédupliqué des jetons canoniques. Il ne suit pas « l'ordre d'apparition ».
  - Un test vérifie que le préambule et le code ne contiennent aucun jeton (la « ceinture » de `rpc2.ts:29-30`).

- **C-6 — à écrire noir sur blanc.**
  - *Grep CI.* La moitié `apps/sentinel/src/ukemi/**` du grep CI est ACTIVE dès 2b, avec 0 hit. Le skip ne subsiste que pour les 14 hits Bell. La ligne 19 peut se lire autrement.
  - *Verrous.*
    - Conséquence du ruling (h) : le `finally` du recorder relâche TOUS les opérateurs demandés, keyless compris, y compris sur `BudgetExceededError`.
    - Le test de bout en bout fait N `unlock`.
    - Un crash laisse N verrous : une ligne de runbook le dit.
  - *Retry.* La classification quitte `record.ts:104` pour l'appelant :
    - on réessaie sur `AbortError`/réseau, 429 et ≥ 500 ;
    - on ne réessaie jamais sur `RpcError`, `NonJsonBody`, les autres 4xx, ni `BudgetExceededError` ;
    - un test couvre cette règle.
  - *Contrôle au G1.* `providerOf` rend un nom nu inchangé (`rpc.ts:34`). Donc `operatorOf("nodies.app")` et `operatorOf("pocket.network")` donnent bien `"pocket"` : l'hypothèse Q7 tient. À asserter au G1.

- **C-7 — CA-3, reprise de mon C-4.**
  - Ajouter une ligne datée dans `docs/G0-lot-garde-helius.md` §6.1 : seconde entrée d'allowlist `apps/sentinel/src/rpc.ts`, déclencheur NARABI-OPS-1d, décision 118.

## AM-1
- **Attrapé :** `isRpcRevert`, avec ses trois défauts (identité de classe, vocabulaire, `.data`) ; V-1(d) ; la double source de regex.
- **Manqué par moi :** le recorder a trois classifieurs sur le chemin d'erreur. Mon checkpoint-1 delta et mes deux passes sur 2a n'en avaient nommé que deux. Je n'avais jamais écrit `.data` nulle part. Mon C-V-2 demandait « une erreur typée portant le code », sans l'identité de classe ni la donnée de revert.

**Modèle résolu (R-1)** : `claude-fable-5-1`, effort high. Lecture seule, aucun `git` d'écriture, aucun réseau.
