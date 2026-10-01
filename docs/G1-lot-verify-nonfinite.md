# claude-opus-5-5

# G1 — journal du lot VERIFY-NONFINITE (un nombre non fini dans un fichier servi : un refus nommé, jamais une exception)

- **Modèle résolu** : `claude-opus-5-5`, effort `max`, instance fraîche (R-1). Rôle G1 (implémenteur). Date : 2026-10-01 (`date -u`).
- **Worktree** : `F:/Monark-wt-verify-nonfinite`, branche `lot/verify-nonfinite`, base = HEAD `8aaba4600702269b2940f55f523d5561539c828b`.
- **Mission** : `F:/tmp/dojo/mission-impl-nonfinite.md`, sha256 `08c6bb11c31c4ec6ecffd6c7bb4fe33d697dc60ccb77cad5e381afe8780e3a12`, recalculé AVANT
  lecture (2026-10-01T00:36:13Z), égal au reçu `F:/tmp/dojo/mission-impl-nonfinite.recu.json` (verdict vert, 2026-10-01T00:36:05Z).
- **Outils**, sha256 recalculés égaux à la mission : `scripts/mission/lint.mjs` `4d1383c8`, `launch.mjs` `fb6c277f`, `scripts/oracle/run.mjs` `f22b9045`,
  `scripts/oracle/r25.mjs` `4d0544df`, `scripts/red-proof.mjs` `6579b550`, `docs/methode/REGLES-MISSION.md` `64700025` (préfixes de 8).
- **Aucun commit** (R-20), aucun git écrivant dans le worktree ni dans `F:/Monark`, aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`.

## 1. Lecture et compte (écrit AVANT tout code)

Entrées lues en entier, dans l'ordre de la mission : `docs/ETAT.md` ; `apps/dojo/scripts/dojo-verify.mjs`, `dojo-verify-cli.mjs` ; `dojo-chain.mjs` ;
`apps/bell/scripts/bell-chain.mjs` ; `apps/site/lib/dojo-live.ts` ; `apps/dojo/test/dojo-verify.test.ts` ; `test/dojo-verify-url.test.ts` ;
`test/dojo-live.test.ts` ; `F:/Monark/scripts/red-proof.mjs` (`parseKiller`). Lus en plus pour situer les consommateurs : `dojo-core.mjs`
(empreintes), `apps/site/lib/dojo-served.ts`, `dojo-served-load.ts`, `apps/site/components/dojo/dojo-live.tsx`, `dojo-table.tsx`.

### 1.1 Le défaut, mesuré à la base

Sonde hors dépôt, rejouable : `node F:/tmp/dojo/nonfinite/probe/probe-b.mjs <arbre>` (TEMP sur F:), lancée sur le clone `--no-local` de la base
`F:/tmp/dojo/nonfinite/base` (HEAD `8aaba460`, propre). Node v24.15.0, 2026-10-01T00:52:46Z.

- `probe-a.mjs` sha256 `c71b8e513e96fca0894196dd515674dfa56ccc660c0ae88b42734d882b899c4a` (aides : arbre re-signé, CLI, transport du navigateur) ;
- `probe-b.mjs` sha256 `4d6c50b28afef4aad80d79850df65460c11b14bd0357dc47161c171d6d667ed4` (les cas) ;
- sortie `base-probe.json` sha256 `da0ea7fe5cf1794ce5b3e0be29be89255d8540478686eadab90217045da4fbff` ;
- piles : `probe-c6.mjs` sha256 `069abcf178a1f8b5f07134e294ab0c66d2b880fb1dac58fc4503cd49a5fa9cd4`, sortie `base-stacks7.txt`
  sha256 `b00d2cda3eae4de179f84e3715c8561dce5e98a0dc4e839d9d3032504eaeac8a`.

Issues mesurées à la base (`1e400` et `-1e400` donnent chaque fois la même issue) :

- chronologie, `lines_count` de la ligne 12, `beacon.round` (imbriqué) de la ligne 3 : exception `Error: non-finite number in digest` ;
  pile `canonical` ← `signingBytes` (bell-chain.mjs:71) ← `verifyLine` (:81) ← `walkDojoTimeline` (dojo-chain.mjs:144) ← `verify` (dojo-verify.mjs:182).
- chronologie, un `sig_new` en trop sur la ligne 1 (le corps signé est inchangé : `signingBytes` retire `sig_new`, la signature tient) : même
  exception ; pile `canonical` ← `lineHash` (bell-chain.mjs:51) ← `walkDojoTimeline` (dojo-chain.mjs:163) ← `verify` (dojo-verify.mjs:182).
- fichier immuable `history/`, un `day_value`, fichier re-signé (sha256 et racine portés par la ligne 2) : même exception ;
  pile `canonical` ← dojo-verify.mjs:153 ← `readImmutable` (:150) ← `verify` (:264).
- fichier immuable `lines/`, un `tier`, puis le jour d'un lot, fichier re-signé (ligne 12) : même exception ; pile dojo-verify.mjs:153 ← :150 ← :285.
- clé servie `dojo/pubkey.json`, `valid_from_seq` : `keyring_invalid @null`, détail `dojo/pubkey.json` (déjà nommé).
- trousseau fourni, `valid_from_seq` puis `revoked_from_seq` : `keyring_invalid @null`, détail `the supplied keyring` (déjà nommé).
- CLI sur une copie locale de l'arbre au `lines_count` non fini : stdout vide, stderr `dojo/verify: fatal: Error`, code 1 (le catch de
  dojo-verify-cli.mjs:87-89) ; CLI avec un fichier `--keyring` au `valid_from_seq` non fini : une ligne `keyring_invalid`, code 1 (déjà nommé).
- relecture du navigateur, ligne neuve 12 puis ligne 3 du préfixe engagé : `{"kind":"fallback","seq":null,"why":"non-finite number in digest"}`
  (l'exception de `canonical`, rattrapée par dojo-live.ts:265-266 : état d'échec atteint, mais sans nom ni seq).
- relecture du navigateur, fichier de lignes de la tête au `tier` non fini, re-signé : `{"kind":"reread","seq":12,"rows":3}`, ACCEPTÉ ;
  `bindDojoLines` sur ce fichier rend ses 3 lignes : aucune ligne n'y passe `canonical` (dojo-live.ts:300-301).

### 1.2 Sites (liste complète)

Règle de compte (déclarée, Q-1) : un **site** est une ligne de l'un des quatre fichiers que parcourent le vérificateur, sa CLI et la relecture du
navigateur (`dojo-verify.mjs`, la marche `dojo-chain.mjs` qu'il exécute, `dojo-verify-cli.mjs`, `dojo-live.ts`) qui passe une valeur tirée d'un
fichier servi (ou du trousseau fourni) à `canonical` ou à un calcul d'empreinte : SHA-256 (`sha256`, `createHash`, `hashTimes`, le `Sha256` injecté),
Merkle (`rootOf`, `proofOf`, `verifyProof`), ou une fonction de Bell ou du cœur qui canonise ou hache son argument (`trustOf` par `keyIdOf`,
`verifyLine` par `signingBytes`, `lineHash`, `signingBytes`, `lineHashOf`, `readInstants`). L'appel d'un enveloppeur local (`dojoTrustOf`,
`walkDojoTimeline`, `readImmutable`, `checkInclusion`, `bindDojoLines`) est une **entrée**, listée, non comptée ; le corps d'une primitive est **interne**.

Rejouable : `grep -nE` du motif `(canonical|sha256|sha256Hex|createHash|rootOf|proofOf|verifyProof|readInstants|trustOf|lineHash|lineHashOf|`
`verifyLine|signingBytes|hashTimes|leafOf|bindDojoLines|checkInclusion|walkDojoTimeline|dojoTrustOf|readImmutable)[(]` sur les quatre fichiers
du clone de base, commentaires et définitions écartés : 37 lignes, `F:/tmp/dojo/nonfinite/probe/census-grep.txt`
sha256 `f2e98e01a11a2df4a3767b1c0a4881ba23aeab8777f20bc6125d1fe419c02dbe`, classées ci-dessous en 25 sites, 7 entrées et 5 internes.

**`apps/dojo/scripts/dojo-verify-cli.mjs`** (1 site)

- `:85` `canonical(r …)`, le rapport : non atteignable, chaque nombre servi qu'il porte est un entier contrôlé avant (seq, `lines_count`,
  `history_lines_count`, `voided_lines`, `breaks`) ; à la base l'exception du cœur passe avant, au catch `:87-89`. Hors motif : `:80` lit le
  fichier `--keyring` (`JSON.parse`) pour `verifyDojoServed` (`:84`), qui le mène à `dojo-verify.mjs:74`.

**`apps/dojo/scripts/dojo-chain.mjs`** (4 sites ; interne `:45`, le corps de `hashTimes`)

- `:96` `hashTimes(l.seed, …)` : non atteignable (`hex64(l.seed)` en `:92`, et la ligne a déjà passé `:144`).
- `:144` `verifyLine(l, …)` puis `signingBytes` puis `canonical` (la ligne sans `sig` ni `sig_new`) : **ATTEINT** (mesure 1.1).
- `:149` `verifyLine({ ...l, sig: l.sig_new }, …)` : non atteignable seul (même corps qu'en `:144` ; un `sig_new` non chaîne rend `false` avant).
- `:163` `lineHash(l)` puis `canonical` (la ligne ENTIÈRE, `sig_new` compris) : **ATTEINT** par un `sig_new` en trop (mesure 1.1).

**`apps/site/lib/dojo-live.ts`** (5 sites ; entrée `:279` ; internes `:51`, `:58`, `:73`, `:175`)

- `:197` `hashTimes(l.seed, …, sha256)` : non atteignable (`hex64(l.seed)` en `:192`).
- `:247` `signingBytes(l)` puis `canonical` : **ATTEINT** pour une ligne neuve (seq au-delà de la tête engagée ; mesure 1.1).
- `:260` `lineHashOf(l, sha256)` puis `canonical` : **ATTEINT** pour toute ligne, préfixe compris (mesure 1.1).
- `:298` `sha256(bytes)` et `:299` `rootOf(rows, sha256)` : octets et lignes bruts, ne lèvent pas sur un nombre.
- **Trou, pas un site** : `:300-301` ne passe aucune ligne du fichier à `canonical` : un nombre non fini n'y est jamais vu, la relecture
  l'accepte (mesure 1.1) ; même chemin pour le tableau de la tête engagée (`apps/site/components/dojo/dojo-table.tsx:29`). Hors motif :
  `:240`, le `JSON.parse` de chaque ligne de chronologie, entrée de `:247` et `:260`.

**`apps/dojo/scripts/dojo-verify.mjs`** (15 sites ; entrées `:177`, `:179`, `:182`, `:264`, `:285`, `:341`)

- `:74` `trustOf(…)` puis `keyIdOf` (SHA-256 des octets de `public_key.x`), clé servie (`:177`) et trousseau fourni (`:179`) : non atteignable,
  `entry()` (`:69-71`) refuse `valid_from_seq` et `valid_to_seq` non entiers, `trustOf` refuse `revoked_from_seq` non entier
  (bell-chain.mjs:113), `x` est une chaîne (`isJwk`) : `keyring_invalid` (mesure 1.1).
- `:131` `readInstants(L.seed, b.signature, k, T, …)` : non atteignable (graine `hex64`, signature contrôlée en `:125-126`, `k` et décalage par la marche).
- `:149` `sha256(buf)`, `:159` `rootOf(raw)`, `:340` `proofOf(raw, i)`, `:349` `sha256(tl)` : octets ou chaînes bruts.
- `:153` `canonical(o)`, chaque ligne d'un fichier immuable : **ATTEINT** (mesure 1.1, `history/` et `lines/`).
- `:166` `verifyProof(line, …)` : chaîne brute, dans un `try` (dojo-core.mjs:388-412).
- `:204`, `:224`, `:309` : `canonical` de valeurs tirées de la chronologie (fractions, décimaux, ou valeurs calculées) : non atteignables, la marche
  canonise d'abord la ligne entière (dojo-chain.mjs:144).
- `:297`, `:301`, `:312`, `:316` : `canonical` de champs d'une ligne de `lines/` : non atteignables à la base (`:153` lève d'abord) ; atteints si le
  garde de `:153` était seulement retiré (`tier` et les lots ne sont pas contrôlés par la forme `:286-287`) : c'est la tuerie du test des lignes.

### 1.3 Compte ascendant par fichier (sites, base `8aaba460`)

Lecture déclarée de « compte ascendant par fichier » (Q-1) : le nombre de sites de chaque fichier, fichiers rangés par compte croissant, puis le total.

| Fichier | Sites | Atteints par un nombre non fini (mesure) |
|---|---|---|
| `apps/dojo/scripts/dojo-verify-cli.mjs` | 1 | 0 |
| `apps/dojo/scripts/dojo-chain.mjs` | 4 | 2 (`:144`, `:163`) |
| `apps/site/lib/dojo-live.ts` | 5 | 2 (`:247`, `:260`), plus le trou `:300-301` |
| `apps/dojo/scripts/dojo-verify.mjs` | 15 | 1 (`:153`) |
| **Total** | **25** | **5**, plus 1 trou |

### 1.4 Hors des trois surfaces (listés, non comptés)

- `apps/site/lib/dojo-served.ts:122` : `signingBytes` de l'ancre ENGAGÉE (l'enregistrement du build), dans un `try` : `false`, état `rereadNoCheck`.
- `apps/site/lib/dojo-served-load.ts`, le build de la page côté éditeur (`scripts/sync-dojo-served.mjs`) : `:196`, `:199` (`deps.walk`, donc
  `canonical` : ATTEINT, le build rejette avec l'exception sans nom, fail-closed, aucun enregistrement ; lu ici, mesuré ensuite : Q-3), `:213`,
  `:214`, `:233` (`deps.verify`),
  `:243`, `:246`. Voir Q-3.
- Bell (bell-chain.mjs:17, :51, :71, :81, :88-90, :111) et le cœur (dojo-core.mjs:333, :338, :360, :365, :405, :468) : primitives atteintes,
  inchangées (décision de l'orchestrateur : ni `canonical` de Bell ni la vérification de Bell).
- L'éditeur vérifie par le vrai vérificateur avant d'écrire (`apps/dojo/scripts/dojo-publish.mjs:276`) : il hérite du refus nommé. Le motif retenu
  existe déjà chez lui : `dojo-publish.mjs:362`, `canonical` dans un `try`, `null` sinon.

### 1.5 Plan du garde (arrêté avant le code)

Aucune ligne ajoutée ni retirée dans les deux fichiers de production : 13 lignes `// killer:` des tests citent `dojo-verify.mjs` et 15 citent
`dojo-live.ts` par numéro de ligne (compte corrigé au §2 : 14 écrit d'abord) ; une ligne insérée les invaliderait.
Chaque garde est une ligne modifiée EN PLACE. Aucun code neuf : les
codes existants conviennent (`timeline_malformed`, `line_malformed`, `keyring_invalid`).

- **G-1** `dojo-verify.mjs:175` : chaque ligne de chronologie passe `canonical` à sa lecture, dans un `try` : `timeline_malformed`, seq de la ligne,
  détail `timeline.jsonl`, comme une ligne hors JSON. Couvre dojo-chain.mjs:144, :149, :163 (et :96), dojo-verify.mjs:131, :204, :224, :309.
- **G-2** `dojo-verify.mjs:152-153` : la comparaison `canonical(o) !== s` entre dans le `try` existant : `o = null`, donc `line_malformed`, détail
  `<fichier> line <n>`. Couvre `:153`, `:297`, `:301`, `:312`, `:316`.
- **G-3** `dojo-live.ts:240` : le même garde à la lecture d'une ligne de chronologie : `fail("timeline_malformed")` en `:241`, à son seq. Couvre
  `:247`, `:260` (et `:197`).
- **G-4** `dojo-live.ts:300` : une ligne que `canonical` ne sait pas écrire est écartée, donc `objs.length !== rows.length` en `:301` :
  `line_malformed`. Ferme le trou, pour la tête relue (`:279`) et pour le tableau de la tête engagée (`dojo-table.tsx:29`).
- Clé servie, trousseau fourni, CLI : aucun changement (déjà nommés, mesure 1.1 ; la CLI imprime le refus nommé du cœur).

## 2. Code (écrit après le §1)

Deux fichiers de production, 7 lignes modifiées EN PLACE (7 insertions, 7 suppressions), aucune ajoutée ni retirée : 372 et 306 lignes, comme à la base.

- `apps/dojo/scripts/dojo-verify.mjs`, sha256 `7b707cbb1958098b5a8963d438bf91db0e6d8efdc1feedc3b955d05277512176` :
  - `:152` (G-2) `try { o = JSON.parse(s); if (canonical(o) !== s) o = null; } catch { o = null; }` : la forme canonique reste exigée, et un nombre
    que `canonical` ne sait pas écrire laisse `o` à `null` ; `:153` perd `canonical(o) !== s`, passé en `:152` ; même code, même détail.
  - `:175` (G-1) `try { const l = JSON.parse(s); canonical(l); return l; } catch { return refuse("timeline_malformed", i + 1, null, "timeline.jsonl"); }`
    remplace `parse(...)` pour la chronologie (même lecture : `s` vient du décodage UTF-8 de `tl`) ; `parse` ne sert plus qu'à `dojo/pubkey.json`,
    dont le code existant (`keyring_invalid`) ne change pas. `:176` porte le commentaire.
- `apps/site/lib/dojo-live.ts`, sha256 `0a13772401bd86418a053756b2748ac36db3e701a924f7cfcb8d9cce77e94f58` :
  - `:240` (G-3) `let l: unknown = JSON.parse(raw); try { canonical(l); } catch { l = null; }` : `:241`, inchangée, refuse `timeline_malformed` à son seq.
  - `:300` (G-4) chaque ligne passe `canonical` dans un `try`, `null` sinon ; `:301`, inchangée, rend `line_malformed`. `:294` : la note du commentaire.
- Contraintes tenues : aucun import ni export neuf (tests `dojo_verify_cli_is_fail_closed` l.128-129, `dojo_verify_core_imports_no_network_module`
  l.706-709, `dojo_live_bounds_equal_the_verifier` l.197-199) ; aucun des mots `fetch`, `window`, `document`, `crypto` dans une ligne de code de
  `dojo-live.ts` ; aucun code de refus neuf ; ni `canonical` ni la vérification de Bell touchés ; aucune barre oblique inverse ajoutée (comptes de
  `dojo-verify.mjs`, `dojo-live.ts` et des deux fichiers de test égaux à la base : 8, 2, 60, 32) ; lignes créées de 160 caractères au plus.
- Validité des tueries, mesurée par `F:/tmp/dojo/nonfinite/probe/killers-valid.mjs` (sha256 `49a70b783caeccbe4ce70e9aef1124726180eae3636deb1da138c0d5c6c8c065`,
  `parseKiller` du tronc) : base 349 lignes `// killer:`, gel 356 (7 neuves) ; 26 invalides dans les deux, listes identiques, toutes préexistantes et hors
  des fichiers du lot (`base-killers.json` `12f0b7fc`, `gel-killers.json` `83ea20f7`). Recompte : 13 tueries citent `dojo-verify.mjs`, 15 `dojo-live.ts`.

## 3. Tests (7 neufs, en fin de fichier, libellés en anglais)

`apps/dojo/test/dojo-verify.test.ts`, sha256 `fc4a0fe7181a3eda034f4c9adefbf07e351e9886257e54461376b25d9bf07b00` (+105 lignes) :

1. `dojo_verify_names_a_non_finite_number_in_the_timeline` : 1e400 et -1e400 au `lines_count` de la ligne 12, au `beacon.round` de la ligne 3, et
   dans un `sig_new` en trop sur la ligne 1 : `{ ok: false, reason: "timeline_malformed", seq, day: null, detail: "timeline.jsonl" }`.
   Tuerie `dojo-verify.mjs:175 CONST "canonical(l); return l;" -> "return l;"`.
2. `dojo_verify_names_a_non_finite_number_in_a_history_line` : un `day_value` (1e400, -1e400), fichier re-signé : `line_malformed`, seq 2, détail
   `history/<sha256>.jsonl line <n>`. Tuerie `:152 CONST "catch { o = null; }" -> "catch (e) { throw e; }"` : retirer seulement `canonical` serait
   une tuerie mort-née ici, chaque champ d'une ligne d'historique étant contrôlé par sa forme (`:265-266`), qui rendrait aussi `line_malformed`.
3. `dojo_verify_names_a_non_finite_number_in_a_lines_file` : `tier`, puis le jour d'un lot (1e400, -1e400), fichier re-signé : `line_malformed`,
   seq 12, jour du snapshot, détail `lines/<sha256>.jsonl line <n>`. Tuerie `:152 CONST "if (canonical(o) !== s) o = null;" -> "void s;"`.
4. `dojo_verify_names_a_non_finite_number_in_a_key_file` : `valid_from_seq` de `dojo/pubkey.json` ; `valid_from_seq` puis `revoked_from_seq` du
   trousseau fourni (1e400, -1e400) : `keyring_invalid`, détails `dojo/pubkey.json` et `the supplied keyring`. Vert à la base, déclaré (Q-2).
   Tuerie `:70 CONST "seqNo(e.valid_from_seq)" -> "true"`.
5. `dojo_verify_cli_names_a_non_finite_number` : la CLI sur une copie locale (`writeTree`) d'une chronologie à 1e400, d'un fichier de lignes à
   -1e400, puis avec un fichier `--keyring` à 1e400 : `[1, ligne canonique du refus suivie de LF, ""]` (code de sortie, stdout, stderr).
   Tuerie `:152 CONST "catch { o = null; }" -> "catch (e) { throw e; }"`.

`test/dojo-live.test.ts`, sha256 `877d53ad2b7c49a4c0e04a86bfddd481365df91e1e1a777a3f5c94ed9bb86369` (+46 lignes) :

6. `dojo_live_falls_back_on_a_non_finite_number_in_the_timeline` : ligne neuve 12 et ligne 3 du préfixe engagé (1e400, -1e400) :
   `{ kind: "fallback", seq, why: "timeline_malformed" }`, recoupé avec l'outil du lecteur sur le même arbre (`timeline_malformed @seq`).
   Tuerie `dojo-live.ts:240 CONST "canonical(l);" -> "void l;"`.
7. `dojo_live_falls_back_on_a_non_finite_number_in_a_lines_file` : `tier`, puis le jour d'un lot du fichier de la tête (1e400, -1e400), re-signé :
   `beyondTheWalker` (marché, refusé par le build, repli `line_malformed`) et `bindDojoLines` direct (le chemin du tableau, `dojo-table.tsx:29`),
   `"line_malformed"`. Tuerie `dojo-live.ts:300 CONST "catch { return null; }" -> "catch { return o; }"`.

Forme F2P : à la base le vérificateur levait ; `named` (et, au test 6, le second argument de `then`) change l'exception en chaîne, donc la base
rougit par une assertion (`ERR_ASSERTION`), jamais par l'exception du test lui-même.

## 4. Site → fichier → test

| Site (base) | Garde (fichier:ligne) | Test |
|---|---|---|
| `dojo-chain.mjs:144` (verifyLine), atteint | G-1 `dojo-verify.mjs:175` | 1 (seq 12, seq 3), 5 (chronologie) |
| `dojo-chain.mjs:163` (lineHash), atteint | G-1 `dojo-verify.mjs:175` | 1 (seq 1, `sig_new`) |
| `dojo-verify.mjs:153`, `history/`, atteint | G-2 `dojo-verify.mjs:152-153` | 2 |
| `dojo-verify.mjs:153`, `lines/`, atteint | G-2 `dojo-verify.mjs:152-153` | 3, 5 (fichier de lignes) |
| `dojo-live.ts:247` (signingBytes), atteint | G-3 `dojo-live.ts:240` | 6 (seq 12) |
| `dojo-live.ts:260` (lineHashOf), atteint | G-3 `dojo-live.ts:240` | 6 (seq 3) |
| trou `dojo-live.ts:300-301` | G-4 `dojo-live.ts:300` | 7 (relecture et `bindDojoLines`) |
| `dojo-verify.mjs:74` (clés), non atteint | aucun changement | 4 (épingle), 5 (fichier `--keyring`) |
| `dojo-verify-cli.mjs:85` (rapport), non atteint | aucun changement | 5 (stdout = la ligne canonique du refus) |

Les 18 autres sites du §1.2 ne sont atteignables par aucun nombre non fini une fois G-1 et G-2 posés : ils lisent des octets bruts, des valeurs
contrôlées comme entiers, chaînes ou fractions, ou des valeurs passées par `canonical` dès leur lecture.

## 5. Exécution (clones `--no-local` sous `F:/tmp/dojo/nonfinite/`, TEMP `F:/tmp/dojo/nonfinite/tmp`, verrou d'hôte libre à chaque lancement)

- Clone gel `F:/tmp/dojo/nonfinite/gel` : base, plus `gel.patch` (sha256 `f4893080a8892c707f2fd21bb699ef4ccb8bb52dfeaa4d4cbd35350113a81114`, le diff
  du worktree), plus le journal ; `node_modules` par `mk-nm.ps1` (220 entrées, 11 liens re-pointés). Fichiers du lot : sha256 égaux au worktree.
- Tests sur le gel (`node --test`, test 42 écarté par `--test-skip-pattern`, flux TAP sous `F:/tmp/dojo/nonfinite/runs/`) : 224 tests,
  223 verts, 0 rouge, 1 ignoré par conception (`dojo_keyring_shares_no_key_with_bell`, « skipped by name until act A-4p ») :
  - les deux fichiers touchés, 57/57 (les 7 neufs inclus) : `gel-touched.tap` sha256 `feb43de03dc4d72242f99d17ad5ac50642fa965db846f396b397130c0fddd390` ;
  - vérificateur (URL), éditeur, page, marche, 11 fichiers, 87 verts et 1 ignoré : `gel-others.tap`
    sha256 `eb36a571d98223d5bbe81d141a798be806bc88b2b95fe98915f3437e7204b47d` ;
  - reste du Dōjō, 8 fichiers, 79/79 : `gel-dojo-rest.tap` `e0d4946735d1911eb74fa8e9925cf7807b4af2802912b4aa78979f4504c1b22c`.
- `red-proof.mjs` du tronc (`--base 8aaba460 --gel F:/Monark-wt-verify-nonfinite --repo F:/Monark --draw 7 --seed 20261001`, 2026-10-01T01:10:29Z) :
  `F:/tmp/dojo/nonfinite/red-proof-1/RED-PROOF.json` sha256 `38c6a2d8b43da3ced7a25263dc879d4e40f51ba9564544febd51bca0cfd2b38f` (digest du gel
  `2b3a365c`, hors `docs/**/*.md`) : 7 jugés, 6 F2P (`assert-fail` à la base, `pass` au gel), 1 refusé (test 4, « green at base: a self-confirming
  test ») ; 6 tueries tirées sur 6 admises, 6 tuées par `ERR_ASSERTION`, fichiers restaurés. Sortie 1, du seul fait du test 4 (Q-2).
- Tuerie du test 4, rejouée comme `fire()` : `probe/killer-key.mjs` sha256 `d269c87fac439eb0a65fd37e66166e614af48fcd683f31e3a043a869e5555de5`,
  sortie `killer-key.out` `8a19e301cb8ff34104d6c38e07732487b15c29e6fdccfdbbfb35c7d7291581ef` : témoin `ok`, mutant `not ok` (`ERR_ASSERTION`),
  fichier restauré (sha256 `7b707cbb` avant et après).
- Sonde après correction, même `probe-b.mjs` (`4d6c50b2`) sur le gel : `gel-probe.json`
  sha256 `23ea341bfb59dceca15a04a16bfbc29e1e159870cebfa827a73f704721b64875` :
  32 cas, 0 exception (base : 12 exceptions sur 32) ; identique, empreintes aléatoires mises à part, au passage sur le worktree (`wt-probe-1.json` `c0531b2c`).

## 6. Portes statiques et R-25

Oracle du tronc `node F:/Monark/scripts/oracle/run.mjs --role G1 --static-only --tree F:/Monark-wt-verify-nonfinite --base 8aaba460…` (hors verrou,
`GIT_OPTIONAL_LOCKS=0`), 2026-10-01T01:12:31Z, enregistrement
`F:/tmp/oracle-results/8aaba4600702269b2940f55f523d5561539c828b-8537cf4395c848f1-G1-20261001T011231Z-231948.json`,
sha256 `bc5022bf898da4295e32cf2832884043bc36efab8963fe3a215c9ac4efff92ad` : sortie 0 ; `typecheck` 0, `lint` 0, `lint:ratchet` 0 (69/69 ; la base
mesure aussi 69/69, aucun ajout), `lang:gate` 0, `export:check` 0, `gate:vocab` 0 (330 fichiers), `lint-model-pinning` 0, `r25` 0.
R-25 par `r25.mjs` : STAT 158 insertions et 7 suppressions, **165** lignes (borne de la porte 1 205, borne de la mission 1 150) ; CONTENT_STAT 0.
Le journal (`docs/G1-*`) est hors du compte et hors des portes de langue et d'export ; le rejeu sur l'arbre final, ce journal achevé, est cité dans
`F:/tmp/dojo/nonfinite-deliver/REPONSE.md`.

## 7. Q-n (aucune dette nue : chaque point est une décision demandée ou un item formé)

- **Q-1, règle de compte** : « site » et « compte ascendant par fichier » sont lus au §1.2 et au §1.3 (25 sites : 1, 4, 5, 15). Si l'orchestrateur
  compte aussi les entrées (7) ou les primitives internes (5), les 37 lignes du grep rejouable donnent son compte sans nouvelle lecture.
- **Q-2, test 4 vert à la base** : la classe « clé servie, trousseau fourni » était déjà nommée (`keyring_invalid`) ; le test qu'exige la mission
  l'épingle, et `red-proof` le refuse comme auto-confirmant (sortie 1 du seul fait de ce test ; sa tuerie tue, §5). Décision demandée : garder
  l'épingle (recommandé : elle tue le mutant `seqNo` vers `true`) ou la retirer du lot.
- **Q-3, item formé BUILD-NONFINITE-1** : le build de la page (`apps/site/lib/dojo-served-load.ts:199`) marche la chronologie AVANT d'appeler le
  vérificateur : un nombre non fini, ou une imbrication profonde, dans une ligne servie le fait rejeter par l'exception sans nom, à la base comme au
  gel (`probe-d.mjs` `d8800bc4`, `probe-e.mjs` `f711a872` ; sorties base `51b5b99e`, `2ab249ad`, gel `085a6dd2`, `1c7dd88e`) ; fail-closed (aucun
  enregistrement, aucune page) et hors des trois surfaces du lot. Un fichier de lignes non fini y est désormais nommé (le build délègue au
  vérificateur). Construction proposée : le même garde à la lecture des lignes (`:198`, `canonical` dans le `try` de `parseJson`), ou vérifier avant
  de marcher. Déclencheur : avant la première synchro (partie 3 de `docs/ETAT.md`).
- **Q-4, écarts de méthode consignés** : (a) le script jetable `F:/tmp/dojo/nonfinite/probe/fix21.mjs` a été écrit par heredoc avec des guillemets
  échappés par une barre oblique inverse, contre la règle des heredocs ; (b) trois lignes de commande `node -e` jetables (pas des heredocs ; la
  troisième, à la suite, pour `delivered2.mjs`) portaient un échappement par barre oblique inverse. Aucun
  fichier livré n'en dépend ; mesuré : 0 barre oblique inverse ajoutée dans les fichiers du lot, 0 dans les sondes `probe-*.mjs`.
- **Q-5, item formé VERIFY-DEPTH-1 (classe voisine)** : une valeur imbriquée sur 200 000 niveaux (400 Ko, sous la borne de 1 Mio d'une ligne) passe
  `JSON.parse` mais épuise la pile du `canonical` récursif : à la base, `RangeError` sans nom au vérificateur, repli sans seq ou relecture ACCEPTÉE au
  navigateur ; au gel, le même `try` la nomme (`timeline_malformed @12`, `line_malformed @12`, replis nommés) : mesuré, non épinglé par un test (hors
  de la classe du lot) ; le build reste sans nom (Q-3). Proposé : un test d'épingle par surface, ou une borne de profondeur déclarée.
- **Q-6, item formé LIVE-NOTJSON-1** : au navigateur, une ligne qui n'est pas du JSON (chronologie ou fichier de lignes) se replie encore avec le
  message de l'analyseur et `seq: null` (préexistant, hors de la classe du lot), quand l'outil du lecteur la nomme (`timeline_malformed @12`,
  `line_malformed @12`) : mesuré, identique à la base et au gel (`probe-f.mjs` `54ef8635`, sorties `e14f8846`, `f91e5edb`). Proposé : `JSON.parse`
  dans le même `try` (`dojo-live.ts:240`, `:300`). Décision demandée.

Git : aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree` ; lectures du worktree sous `GIT_OPTIONAL_LOCKS=0` ; écritures git seulement dans mes
clones sous `F:/tmp/dojo/nonfinite/` (checkout, apply) et dans les clones des outils du tronc (gel de l'oracle, clones de `red-proof`).

## 8. Suite de la mission (message de l'orchestrateur, 2026-10-01 vers 01:25 UTC) : plan écrit avant le code (01:3x UTC)

Trois points ajoutés au même lot, même worktree, même cadre ; Q-2 tranchée en (a) : le test « clé » reste, classé épingle.

### 8.1 Recensement du chargeur (Q-3), même règle de compte que le §1.2

Rejouable : `grep -nE "(deps[.](trustOf|walk|rootOf|verify|lineHash)|sha256Hex|parseJson)[(]"` sur `apps/site/lib/dojo-served-load.ts` de la base,
définitions écartées : 11 lignes, `F:/tmp/dojo/nonfinite/probe/census-loader-grep.txt`
sha256 `46af4742ebe697483c59c41705dda391947c6b7996db1fe60a7f0ea231dc3843`.

- Lectures (`parseJson`, ni `canonical` ni empreinte) : `:194` (trousseau engagé), `:198` (chaque ligne de chronologie), `:218` (lignes de la tête).
- Entrées : `:195` et `:196` (`deps.trustOf`, vers `dojo-verify.mjs:74`, non atteignable) ; `:199` (`deps.walk`, vers `dojo-chain.mjs:144` et `:163` :
  ATTEINTE, mesuré, Q-3) ; `:233` (`deps.verify`, l'outil du lecteur, nommé depuis G-1 et G-2).
- Sites : `:213` et `:246` (`sha256Hex` d'octets), `:214` (`deps.rootOf` de chaînes brutes), `:243` (`deps.lineHash(head)`, une ligne déjà marchée) :
  4 sites, aucun atteignable. Le chargeur est une quatrième surface : 25 + 4 = 29 sites en tout.

### 8.2 Gardes et tests prévus

- **G-5, Q-3 (BUILD-NONFINITE-1)** : `dojo-served-load.ts:198`, modifiée en place, lit chaque ligne de chronologie par `walkable`, une fonction déclarée
  en fin de fichier (aucune ligne ne bouge : les tueries `:143`, `:145` et `:243` restent valides) : `parseJson` (refus inchangé pour une ligne hors
  JSON), puis `deps.lineHash` dans un `try` ; s'il lève (1e400, ou une valeur trop profonde), le refus que ce chargeur donne déjà à une ligne que la
  marche refuse : `the timeline does not walk under the committed keyring (seq <n>: timeline_malformed)`, avec le code de la marche et de l'outil
  du lecteur (Q-7). Test : 1e400, -1e400 et le cas profond, message exact attendu.
- **Q-5 (VERIFY-DEPTH-1)** : aucun code (G-1 et G-2 rattrapent déjà la `RangeError`) ; un test du vérificateur, chronologie et fichier de lignes à
  200 000 niveaux : F2P contre la base `8aaba460` (qui lève `RangeError`), épingle seulement au regard du gel de la première passe.
- **G-6, Q-6 (LIVE-NOTJSON-1)** : `dojo-live.ts:240` et `:300`, en place : `JSON.parse` entre dans le même `try` ; `:294`, la note. Une ligne de
  chronologie hors JSON devient `timeline_malformed` à son seq, une ligne de fichier hors JSON `line_malformed`, comme l'outil du lecteur. La tuerie
  du test 7 (`catch { return null; }` vers `catch { return o; }`) viserait alors un `o` hors de portée : réancrée sur `canonical(o); return o;` vers
  `return o;`.

### 8.3 Code de la suite (écrit après le §8.2)

- `apps/site/lib/dojo-served-load.ts`, sha256 `a201c3274cab08fe0c5cf6a835a6a7612dcffc7c52027a28cef5f659b136dbaf` (11 insertions, 1 suppression) :
  `:198` appelle `walkable(s, i + 1, deps.lineHash)` ; `walkable` (commentaire `:250-253`, corps `:254-258`) suit la dernière ligne de la base
  (248 lignes, 258 désormais) ; `:143`, `:145` et `:243` sont identiques à la base, octet pour octet (même sha256 des trois lignes : `e5f25ed7`).
- `apps/site/lib/dojo-live.ts`, sha256 `71ff57bc222c48127540b9d36d5c98fb5984649f91fb699bdfe87cdf1a586db6` (3 lignes modifiées depuis la base, 306 lignes) :
  `:240` `let l: unknown = null; try { l = JSON.parse(raw); canonical(l); } catch { l = null; }` ; `:300` `JSON.parse` dans le `try` ; `:294` la note.
- `apps/dojo/scripts/dojo-verify.mjs` : inchangé depuis le §2 (sha256 `7b707cbb`). Aucune barre oblique inverse ajoutée (18 dans le chargeur, comme à la base).

### 8.4 Tests de la suite (3 neufs ; 10 en tout pour le lot)

8. `apps/dojo/test/dojo-verify.test.ts` (sha256 `62688bc2a62399da141c12e60aabd89fc62322c50b393c2b9e5eaf4582472b16`, +117 lignes depuis la base) :
   `dojo_verify_names_a_value_nested_too_deep` (Q-5) : une ligne de chronologie et une ligne de fichier de lignes portant une valeur imbriquée sur
   200 000 niveaux : `timeline_malformed @12`, puis `line_malformed @12` avec fichier et ligne. **F2P** contre la base `8aaba460` (la base lève
   `RangeError`) ; épingle seulement au regard du gel de la première passe, qui la nommait déjà. Dépend de la pile de V8 : mesuré sur Node 24.15.0
   (`JSON.parse` tient 200 000 niveaux, `canonical` non). Tuerie `dojo-verify.mjs:175 CONST "canonical(l); return l;" -> "return l;"`.
9. `test/dojo-live.test.ts` (sha256 `9e4f89db4c3a36e1426698510cc3c36e83289da800a89522408e9e248c7a89f8`, +78 lignes depuis la base) :
   `dojo_served_build_names_a_line_the_walk_cannot_hash` (Q-3) : 1e400 (ligne 12), -1e400 (ligne 3, imbriqué) et une valeur à 200 000 niveaux
   (ligne 5) : le build rejette par le message exact `dojo served: the timeline does not walk under the committed keyring (seq <n>:
   timeline_malformed)`. Tuerie `dojo-served-load.ts:256 CONST "lineHash(l);" -> "void l;"`.
10. `dojo_live_falls_back_by_name_on_a_line_that_is_not_json` (Q-6) : une ligne de chronologie hors JSON (ligne neuve 12, ligne 3 du préfixe) :
   `{ kind: "fallback", seq, why: "timeline_malformed" }` ; une ligne du fichier de la tête hors JSON : repli `line_malformed` à la seq 12 et
   `bindDojoLines` rend `"line_malformed"` ; chaque cas recoupé avec l'outil du lecteur (`toolSays`). Tuerie `dojo-live.ts:240 CONST
   "let l: unknown = null; try { l = JSON.parse(raw);" -> "let l: unknown = JSON.parse(raw); try {"`.
- Le test 6 emploie désormais l'aide `toolSays` (même assertion, trois lignes de moins) ; la tuerie du test 7 est réancrée (§8.2).

### 8.5 Site → fichier → test, ajouts de la suite

| Site ou entrée (base) | Garde (fichier:ligne) | Test |
|---|---|---|
| `dojo-served-load.ts:199` (`deps.walk`), entrée atteinte | G-5 `dojo-served-load.ts:198`, `:256` | 9 (1e400, -1e400, profondeur) |
| valeur trop profonde, chronologie et `lines/` | G-1 `dojo-verify.mjs:175`, G-2 `:152-153` | 8 |
| ligne hors JSON, relecture (`dojo-live.ts:240`, `:300`) | G-6 `dojo-live.ts:240`, `:300` | 10 |

### 8.6 Exécution de la suite (clone neuf `F:/tmp/dojo/nonfinite/gel2`, flux sous `F:/tmp/dojo/nonfinite/runs2/`)

- `gel2` : base, plus `gel2.patch` (sha256 `6a203134143aa0b468f8b621f1b39ee51f26cce5574b4e6904c5c1cb3aeeedee`), plus le journal ; fichiers du lot égaux
  au worktree (sha256) ; `node_modules` par `mk-nm.ps1`.
- Tests : 227, dont 226 verts, 0 rouge et 1 ignoré par conception : les deux fichiers touchés, 60/60 (`gel2-touched.tap`
  `72c4de30589ac76d97cb610c16f0a09c403b982eeb8e21f0274512e69d078969`) ; les 19 autres fichiers du Dōjō, 166 verts et 1 ignoré (`gel2-others.tap`
  `f1ff91568ce84e43f8a7dbbc0eb1d252cf295acce777d86f0bab309495bffec9`), dont `dojo_live_never_renders_why` (Q-8).
- `red-proof.mjs` du tronc (`--draw 10 --seed 20261001`, 2026-10-01T01:35:55Z) : `F:/tmp/dojo/nonfinite/red-proof-2/RED-PROOF.json`
  sha256 `8b8043bd15dbe84b332709f83a2f9376c7bd9187a446ac109d3f19ec8463a86c` (digest du gel `678bf5f2`) : 10 jugés, 9 F2P, 1 refusé (l'épingle
  « clé », retenue en (a)) ; 9 tueries tirées sur 9 admises, 9 tuées par `ERR_ASSERTION`, fichiers restaurés. Sortie 1, du seul fait de l'épingle.
- Tuerie de l'épingle rejouée sur `gel2` : `probe/killer-key2.mjs` (`2e0f91e9`), sortie `killer-key2.out` `8a19e301`, identique au premier passage.
- Validité des tueries sur `gel2` : 359 lignes (349 et 10 neuves), les 26 mêmes invalides qu'à la base (`gel2-killers.json` `986485dd`).
- Sondes après la suite, sur `gel2` : `gel2-probe-d.json` `ab188cd1`, `gel2-probe-e.json` `6cd53092`, `gel2-probe-f.json` `ba60ce25` : le build nomme
  1e400 et la profondeur (`seq 12: timeline_malformed`) ; le vérificateur et la relecture nomment la profondeur ; la relecture nomme le hors-JSON
  à sa seq. Non-régression de la première passe : `gel2-probe.json` `795fbb74`, 32 cas, 0 exception, égal au premier gel.

### 8.7 Portes et R-25 de la suite

Oracle du tronc `--role G1 --static-only`, code et tests finaux, 2026-10-01T01:38:15Z :
`F:/tmp/oracle-results/8aaba4600702269b2940f55f523d5561539c828b-437d8501bdabb80d-G1-20261001T013815Z-294960.json`,
sha256 `99870676d949f0316f4b524702b4728277d5e6b42a9580d47f770e73816d87c9` : sortie 0, `typecheck`, `lint`, `lint:ratchet` (69/69), `lang:gate`,
`export:check`, `gate:vocab`, `lint-model-pinning`, `r25` à 0. R-25 par `r25.mjs` : 213 insertions et 8 suppressions, **221** lignes (borne de la
mission 1 150, porte 1 205) ; par fichier : `dojo-verify.mjs` 4 et 4, `dojo-live.ts` 3 et 3, `dojo-served-load.ts` 11 et 1, tests 117 et 78.
Le rejeu sur l'arbre final, ce journal achevé, est cité dans `REPONSE.md`.

### 8.8 Q-n après la suite

- **Q-2** : décidée en (a) par l'orchestrateur : l'épingle « clé » reste ; `red-proof` sort 1 de son seul fait (attendu, déclaré).
- **Q-3 (BUILD-NONFINITE-1), Q-5 (VERIFY-DEPTH-1), Q-6 (LIVE-NOTJSON-1)** : résolues dans ce lot (§8.3 à §8.6) ; les items du §7 sont clos.
- **Q-7, choix du refus du chargeur** : j'ai repris la phrase que le chargeur donne déjà à une ligne que la marche refuse (`:200`), avec le code de la
  marche et de l'outil du lecteur, `timeline_malformed`, à sa seq ; l'autre refus existant, `timeline line <n> is not JSON` (`:183`), reste celui d'une
  ligne hors JSON. Décision demandée seulement si l'orchestrateur préfère l'autre phrase.
- **Q-8, libellé devenu inexact** : `test/dojo-live-surface.test.ts:205` décrit un cas « a served line that is not JSON (the engine's message quotes
  the served text) » ; depuis G-6, le motif de ce repli est `timeline_malformed`, plus le message du moteur. Le test reste vert (il vérifie que la vue
  ne montre jamais le motif ; les cas des lignes 215-216 couvrent encore un motif écrit pour être vu). Je ne l'ai pas modifié (test d'un autre lot ;
  le toucher le ferait juger par `red-proof`, vert à la base). Item proposé, LIVE-SURFACE-LABEL-1 : réécrire ce libellé au prochain lot de la page.
- **Q-9, dépendance à la pile** : les tests de profondeur (8 et 9) supposent que `canonical` épuise la pile à 200 000 niveaux et que `JSON.parse`
  non (mesuré sur Node 24.15.0) ; un moteur à pile beaucoup plus grande rendrait un autre refus nommé (`signature_invalid` pour la ligne non
  re-signée, un écart de palier pour la ligne re-signée) au lieu du refus attendu, et ces tests rougiraient.
  Item proposé, VERIFY-DEPTH-BOUND-1 : une borne de profondeur déclarée, lue avant `canonical`, rendrait ce refus indépendant du moteur.
