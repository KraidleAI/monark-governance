claude-opus-5-5

# G0 — journal du lot Dōjō PR-4c-2 (tableau de toutes les adresses, recherche par adresse, preuve) : pli de l'ADR-DOJO-PR-4 avant le G1, sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session ; préfixe vérifiable `claude-opus-5-5`, décision 133), effort max, contexte frais. Worker planificateur : ne committe pas, ne lance aucun workflow (R-20).
- **Mission** : `F:/tmp/dojo/mission-g0-pr4c2.md` (23 l., 5 060 o.), sha256 `40e0b6305a6ad7040555477f3f23e9d1a8941736f16e49bbc62cb52454ecd689`, recalculé AVANT lecture (22:24:58Z), égal au reçu `F:/tmp/dojo/mission-g0-pr4c2.recu.json` (verdict vert, 2026-09-30T22:24:48Z, `repo` `F:/Monark-wt-dojo-pr4c2`, `base` = `head` = `2896c574a6fb3b2ab29c0f03def783c49ef8eed9`, douze règles du linter à 0).
- **Amendement 1** (orchestrateur, décision 299, reçu en cours de mission) : `F:/tmp/dojo/mission-g0-pr4c2-amendement-1.md` (10 l., 2 297 o.), sha256 `53bfbe0f99d7793cb1f3e68351906cc40315530ea2109096fd033cffafa12998`, recalculé AVANT lecture (22:31:34Z), égal à la valeur transmise ; fait foi avec la mission et l'emporte en cas de conflit ; cité en tête du pli.
- **Règles communes** : `F:/Monark/docs/methode/REGLES-MISSION.md` (18 l., 8 526 o.), sha256 `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335`, lues en entier (22:25Z).
- **Livrables** : (1) pli ajouté à la fin de `docs/adr/ADR-DOJO-PR-4.md`, l.401 (ligne vide de séparation) à l.518 : 118 lignes (≤ 120) ; son titre (l.402) porte `claude-opus-5-5` ; la l.1 de l'ADR porte `claude-opus-5-5[1m]` (rédacteur du G0 du 2026-09-27), laissée intacte ; l.1-400 inchangées (sha256 de `head -n 400` = `b71297be12c43868cdfc2557e855caaea09ec9766ec3ac3ae61e1d8b53e138e3`, égal à l'ouverture) ; lignes de table `| PR-4c-2 |` l.421, `| PR-4c-2a |` l.422, `| PR-4c-2b |` l.423 (la première ligne `| PR-4c-2 |` du fichier reste l.170 : É-K1 du pli) ; (2) ce journal.
- **Base** : worktree `F:/Monark-wt-dojo-pr4c2`, branche `lot/dojo-pr4c2`, HEAD `2896c574a6fb3b2ab29c0f03def783c49ef8eed9` (tronc) ; `git --no-optional-locks status --porcelain --untracked-files=all` à l'ouverture (22:25:16Z) : vide (arbre propre) ; à la remise : relevé en fin de journal.
- **Heures** (`date -u`, 2026-09-30) : 22:24:58Z (sha256 de la mission), 22:25:16Z (état du worktree), 22:25:25Z (sha256 des onze entrées), 22:25:35Z (lecture de l'ADR), 22:26:27Z (mère), 22:27:11Z (code), 22:31:34Z (amendement 1 vérifié, puis lu), 22:46:26Z (début de l'écriture, après la première consultation de l'advisor), 22:53:36Z (brouillon du pli sous `F:/tmp/methode/dojo-pr4c2/`), 22:56:41Z (premier ajout du pli), 22:59:10Z à 23:02:05Z (lectures complétées en entier, É-J1), 23:02:27Z (ADR reconstruit : l.1-400 d'origine puis le pli corrigé), 23:03:28Z (écriture de ce journal), 23:04:37Z (journal contrôlé, puis seconde consultation de l'advisor), 23:08:30Z (ADR reconstruit avec les corrections de la seconde consultation, même procédure et mêmes contrôles).

## Entrées de la mission, dans l'ordre (sha256 à 22:25:25Z)

| # | Entrée | l. | sha256 | Lecture |
|---|---|---|---|---|
| 1 | `docs/adr/ADR-DOJO-PR-4.md` | 400 | `b71297be12c43868cdfc2557e855caaea09ec9766ec3ac3ae61e1d8b53e138e3` | en entier (D-1, D-2, §3 à §10, lignes datées et plis de fin) |
| 2 | `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | 1 367 | `cd976054b22837b0aeef1d50fdafcd360f768b7c97a4241e583a2ee6769111ec` | sections nommées par la mission, en entier : D-7 (l.225-233), D-10 (l.256-263, lignes datées comprises), D-16 (l.283-295), résumés du §0 (l.21, l.24, l.30) ; en plus D-6 (l.214-223) et les lignes du vérificateur l.1055, l.1063, l.1067 ; amendements touchant D-7, D-16, `--address` et la preuve cherchés par motif |
| 3 | `apps/site/lib/dojo-live.ts` | 297 | `645b5a53d21db60aa6d68a4e70cb321f8b08765a90e2e6775f7a1456e647f234` | en entier |
| 4 | `apps/site/lib/dojo-served.ts` | 149 | `e2ddafacb354d878f8dbf7cb0c3a236a2df87e940a74edc119c984496f3842b6` | en entier |
| 5 | `apps/site/lib/dojo-copy.ts` | 80 | `2e973ec4df40d6a5936983098ccc35e02a86277963de434b65aa66b1f6e4e9ec` | en entier |
| 6 | `apps/site/components/dojo/dojo-figures.tsx` | 22 | `368ed8526609dab067d48a179864bb5f34129626247fb6eb3bc0e0205b4ef4b9` | en entier |
| 7 | `apps/site/components/dojo/dojo-live.tsx` | 51 | `082c145ed26e4b3b6330229ec1c8a1725080ff6e155e50da1ab660fbc4deb0c8` | en entier |
| 8 | `apps/dojo/scripts/dojo-verify.mjs` | 372 | `ef6d15b21239e3a78ebb874c654b6e7a5ba2ecb5952ba1fd5b794d3d42f6c49f` | parties nommées par la mission : clés du rapport et `VERIFY_BOUNDS` (l.36-45), `LINE_KEYS`, `addressOk`, `lt` (l.93-107), `checkInclusion` (l.164-167), `--address` (l.336-342) ; plus les contrôles de lignes (l.284-331) ; recherche par motif du reste |
| 9 | `test/dojo-live.test.ts` | 356 | `7ba6395d88cf0dbc5d6eb4fda94bc6e0e30196c45a47ee79bfefd31887bbae9e` | en entier (É-J1) |
| 10 | `test/dojo-live-surface.test.ts` | 324 | `8f75095863b3f4b25252defb04038a7617ff58bf8f72e0788a76829872711dfc` | en entier (É-J1) |
| 11 | `docs/CHANTIERS.md` : entrées du 2026-09-30 (l.2122-2186) | 2 261 | `a7432c95d2156f6867f8016a5136f130fd4978646ef9fe3cbc46180a25537a7a` | les soixante-cinq entrées en entier (É-J1) ; recherche `PR-4c-2` sur tout le fichier |

## Lectures complémentaires (par extraits, lignes citées au pli)

| Fichier | l. | sha256 | Objet |
|---|---|---|---|
| `scripts/assert-fleet-html.mjs` | 764 | `63f3e4a64452f60293c49e40bc140077e72f0996cd906841e639de5a651ed85f` | `DOJO_FORBIDDEN` l.585-591, `assertDojoBody` l.593-644 (règle (4) l.629-634), `dojoExpected` l.660-684 |
| `apps/dojo/scripts/dojo-core.mjs` | 492 | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | `base58Decode` l.254-273, `ownerClass` l.305-311, Merkle l.314-410 (`proofOf` l.364, `verifyProof` l.387), `stepLots` l.85-92 |
| `apps/site/lib/dojo-served-load.ts` | 248 | `d63b532658c1a9ec2cd48e7c773099cf4f9f3220e50f768885df2137af3e0346` | types l.21-56, ancre en vigueur l.200-212, projection l.228-246 |
| `test/dojo-page.test.ts` | 174 | `d1d17f9c76048db099c9143ede4cd76eef8670fc48968d2566cceaec8a6e59b7` | `dojo_page_lexicon_is_closed` l.99-125 (22 textes, `b8ffb789…`) |
| `apps/site/app/dojo/page.tsx` | 42 | `369c6c889d0b5b7a15150f34a0eecaf251a015486511c5cec1399ca8e565b777` | composition (`DojoLive` l.34) |
| `apps/site/lib/narabi-live.ts` | 970 | `e794a94736367b159a1c0548d84575f3eabe03f575a88b272ec310adceef6cfd` | en-tête l.1-10 (double compilation, aucun import relatif de valeur) |
| `tsconfig.json`, `apps/site/tsconfig.json` | 36, 42 | `e9f78b864977f387e67fde8810211c6a84e8e589abc4fec53d8c554882d3f72f`, `14787368432063eb22fea69b4deacaa9cb92f72130ba345be30c2a431a367019` | `nodenext` et `allowImportingTsExtensions` à la racine ; `bundler` et alias `@/*` au site |
| `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` | 59 | `ce85cc2ecdc2180a121c620d4e5b48cff608cf80cfb2360a085cd31db7d9e5eb` | L-1, L-2 (l.9-10), L-14, L-15 (l.47-48), conséquences l.50, RFC 9162 §2.1.3.2 (l.52-57) |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | 247 | `ffc7e139be26997b2c6dfc925f2ccc65b6d1e39f26772c88ac20bdc0eb2853da` | l.76 et l.80 (tailles du fichier de lignes) |
| `docs/methode/CHECKLIST-G7.md` | 14 | `6eee480f6f04cce25c10e44ee86cba3d23c08659fd20198496d3bdac3698b644` | l.8 (unité R-25 : 547 ascendant, 1 150 mesuré, 1 205 CI) |
| `F:/Monark/scripts/mission/gen.mjs` | 115 | `9eecb3717c7a2ad11a021d81ebfe949dc38c9279c8db73743fe6b07c82711ae2` | ancre l.66-67 (première ligne `| <LOT> |`) |
| `F:/Monark/scripts/mutants/run.mjs` | 238 | `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19` | `--killers` l.3-11, l.85-93, l.142 |
| `F:/tmp/site-docs-1/g2/tools/mobile375.mjs` | 41 | `b6bac9799ea354b73508433814909091e2eacca99db9cf8b4fcbdc1e466d8b3a` | en-tête l.1-25 (CDP, 375 × 812) |
| `docs/G0-lot-dojo-pr4c1.md` | 89 | `727e20d356f12827c708d205bcc77cf3bd5eed7015907cd9c3e56be3ff1bd462` | forme du journal (l.1-30) |

## Écarts et déclarations

- **É-J1** (ordre de lecture) : la mission dit « lis en entier » ; au premier ajout du pli (22:56:41Z), `test/dojo-live.test.ts`, `test/dojo-live-surface.test.ts` et les entrées CHANTIERS du 2026-09-30 n'étaient lus que par extraits ; lectures complétées de 22:59:10Z à 23:02:05Z ; constats reportés au pli AVANT la remise : réancrage des `// killer:` (PK-1, +10 à 2a, total ≈ 817), « sinon aucun GET » de PL-2 l.303 (É-K7, Q-K2), épingles de source de `dojo-live.ts` et `dojo-live.tsx` (PK-2), raison jamais rendue (PK-7), compilation des `.tsx` (PK-7), checkpoint-2 maintenu (décision 295, PK-1) ; l'ADR a été reconstruit (l.1-400 d'origine, sha256 contrôlé, puis le pli corrigé) plutôt qu'édité en place ; `error_origin` : ce worker.
- **É-J2** : `dojo-verify.mjs` lu par ses parties nommées par la mission et la mère par ses sections nommées (tableau ci-dessus), non en entier.
- **Git** : lecture seule, `--no-optional-locks`, `GIT_TERMINAL_PROMPT=0`, `< /dev/null` : `rev-parse HEAD`, `branch --show-current`, `status --porcelain --untracked-files=all` ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun `git` écrivant.
- **Périmètre** : aucun réseau ni outil de recherche distant (ni recherche web, ni lecture d'article, ni firecrawl, arxiv, semantic-scholar, openalex), aucun appel memstack, aucun test ni harnais, aucun navigateur ; rien sur C: ; deux écritures dans le worktree (le pli, ce journal) ; TEMP `F:/tmp/methode/dojo-pr4c2/` (`pli-g0-pr4c2.md`, `adr-head-400.md`, `adr-new.md`), aucun `rm` ; commandes Bash sous 6 Ko, textes longs écrits par l'outil d'écriture dans le TEMP puis ajoutés par `cat` et `cp`.
- **Garde d'octets** (pli et journal) : aucun TAB, CR, barre inverse, DEL ni octet de contrôle (C0 hors LF ; C1 contrôlés en code points, séquences `C2 80` à `C2 9F`), UTF-8 valide (`iconv`) ; commande : `LC_ALL=C grep -c -P` sur ces motifs.
- **Advisor intégré** : première consultation après l'orientation, avant l'écriture ; douze points, chacun vérifié sur pièce avant usage (fichiers et lignes cités au pli) : définition de l'octet pour octet (D-K5), repli pré-déclaré de 2a (PK-1), réponse explicite sur `assertDojoBody` (PK-6), séquence de remise (ce journal), générateur (É-K1, `gen.mjs` l.66 relu), questions bornées au mandat (PK-11), rejeu des mutants de 4c-1a (PK-2), tête rendue (D-K3), numérotation libre (TY-16 et M-K8 et suivants cherchés : absents ; `M-T2` pris, `apps/dojo/src/collect.ts:183`, écarté), textes (PK-6), aucun chiffre non sourcé (formules, tailles lues : mère l.229, ADR PR-1B-4 l.80), forme ; seconde consultation avant la remise : une contradiction interne corrigée (la ligne `| PR-4c-2a |` disait `DojoTable` « monté sur la vue établie » contre D-K8 et PK-6 qui exigent TXT-17 au build : constatée sur le brouillon, l.22, puis réécrite : monté dès le premier rendu, n'agit qu'après la vue établie), la règle des tueurs relue dans l'outil (`F:/Monark/scripts/red-proof.mjs` l.9, sha256 `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` : « a changed killer line never counts ») et écrite au pli à la place d'une analogie, le remplacement de TXT-17 par TXT-17a ou TXT-17c précisé ; pli toujours de 118 lignes ; conseil, jamais verdict.

## Remise (dernier acte d'écriture ; aucune édition après, ni de l'ADR ni de ce journal)

- **sha256 final de `docs/adr/ADR-DOJO-PR-4.md`** : `e4e79922510b5f6115a99c6dec2c976fc338f6a226f6b0e4c0de3877ebf51047` (518 l. ; l.1-400 d'origine, sha256 `b71297be12c43868cdfc2557e855caaea09ec9766ec3ac3ae61e1d8b53e138e3` ; pli l.401-518), relevé à 23:09:02Z (`date -u`, 2026-09-30).
- **`git --no-optional-locks status --porcelain --untracked-files=all`** à 23:09:02Z : ` M docs/adr/ADR-DOJO-PR-4.md` et `?? docs/G0-lot-dojo-pr4c2.md` ; HEAD `2896c574a6fb3b2ab29c0f03def783c49ef8eed9` inchangé ; aucun autre fichier touché.
- Le sha256 de ce journal est rendu hors du fichier (réponse finale).
