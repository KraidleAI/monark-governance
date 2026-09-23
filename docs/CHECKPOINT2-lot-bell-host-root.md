# CHECKPOINT-2 — lot BELL-HOST-ROOT-1 (lot/bell-host-root @ bdd6c66, base d7c60a2)

Validateur-humain, modèle résolu **`claude-fable-5-1`** (R-1), contexte frais (fil du worker et G2 non lus). Date 2026-09-23.
Rejeu sous `F:\tmp\cp2-bellroot\wt` (`git archive bdd6c66`), `npm ci --offline --cache F:/tmp/npm-cache` (283 paquets, exit 0),
TEMP/TMP/TMPDIR=`F:/tmp/cp2-bellroot/tmp`, ceinture A-7 (`env -u HELIUS_API_KEY … -u DATABENTO_API_KEY`) sur chaque exécution.
Aucun accès à l'hôte Bell ni au site ; aucune écriture sous `F:\Monark*` ; aucun `git` mutatif.

## 1. Artefacts lus
- `F:\tmp\bellroot\RENDU.md` (sha `6a5d025f…0cae`, égal à l'annonce), `PLI.diff` (`6221b957…43ee`), `DELIVERED.sha256`, `R25.txt`, `gates\EXITS*.txt`, `mutants\PREDICTIONS.md`, `mutants\COMPARE.txt`.
- Dépôt à `bdd6c66` : les 7 fichiers du lot, `test/verify-bell.test.ts` (composition), `apps/bell/test/helpers/bell-served.ts` et `bell-served-e2e.test.ts` (second lecteur), `docs/adr/ADR-T1b-backend.md` D10/D11/D13.5, `docs/SPRINT-BACKLOG-lot-t1b-backend.md` S-8, `docs/CHANTIERS.md` (décisions 149, 155 ; `/bell` 200 après SITE-CHARTE-C, l.1207), `.github/workflows/ci.yml` (pathspecs R-25).

## 2. Rejeu indépendant (preuves dans `F:\tmp\cp2-bellroot\`)
| Contrôle | Attendu (RENDU) | Rejoué par moi | Preuve |
|---|---|---|---|
| sha des 7 fichiers vs blobs `bdd6c66` | 7 égaux | **7/7 égaux** (`git show bdd6c66:<f>` puis sha256sum) | `DELIVERED.sha256` recoupé |
| sha de `git diff d7c60a2 bdd6c66` | = sha `PLI.diff` | **`6221b957…43ee` égal** | — |
| Tests ciblés (bell-deploy-config, verify-bell, bell-served-e2e) | 13/13 | **13 pass / 0 fail / 0 skip, exit 0** | `targeted.tap` sha `d16ab2f5…0689` |
| Suite complète (7e porte) | 1171/1169/0/2 | **1171 / 1169 / 0 / 2** (skips préexistants : SIGTERM win32 ; artefacts u4b absents), exit 0 | `full.tap` sha `ad9e641f…9ef9` |
| gate:vocab / lang:gate / typecheck / lint / lint:ratchet / export:check | 0 x6 | **0 x6** (vocab 251 fichiers ; ratchet 69/69) | `gate-*.log` |
| R-25 forme CI (pathspecs `ci.yml` à l'identique) | 104 | **6 files, +89/-15 = 104** <= 1 150 | — |
| Fins de ligne | 0 CR | **0 CR** sur les 7 blobs | — |
| Mutants exigés par la mission | M1/M2/M3 rouges | **M1** rouge = [A,B,C] ; **M2** = [A,B,C,D,E] ; **M3** = [A,B,C,D,E] ; **M12** (c07 sans prédicat racine) = [C] — ensembles rouges **identiques aux prédictions** écrites avant exécution ; restauration octet-exacte vérifiée par sha après chacun | `mut-M1..M3.tap`, `mut-M12.tap` |
| Anti-close (amendement Bell) | scan du diff | **fait** : seuls littéraux décimaux du diff = octets de l'IP du VPS déjà committée dans le RUNBOOK ; aucun prix, close, VWAP ; lot sans donnée de marché | — |
| Secrets / clés dans le diff | 0 | **0** (grep HELIUS/CHAINSTACK/POLYGON/DATABENTO/api_key/secret : seule la mention « no secret » du RUNBOOK) | — |
| Dépôt inchangé par mon rejeu | — | **sha des 7 fichiers AVANT == APRÈS** ; `git status --short` vide dans `F:\Monark-wt-bellroot` (HEAD `bdd6c66`) et `F:\Monark` (HEAD `a4e926c`) | `SHA-BEFORE.txt`, `SHA-AFTER.txt` |

Tous les chiffres du RENDU sont reproduits ; aucun ne diverge.

## 3. Checklist règle par règle
- **CA-1 (falsifiabilité, reformulation)** — conforme a posteriori. Une phrase par tâche : (1) le Caddyfile répond 302 `Location https://monarkgate.tech/bell` sur `/` exactement et rien d'autre ne change ; (2) le modèle fermé n'admet que cette forme (9 formes de `redir` + 4 matchers refusés, rejoués verts) ; (3) la CA c07 exige `/ => 302 + Location` en plus de « pas de listing » ; (4) le RUNBOOK rejoue l'étape 7 (`.bak-bell-2`) et attend `302 0 <cible>` à l'étape 8. Chaque phrase a un test localisable (S-8 nouveau, cas c07 isolés, liaison RUNBOOK dans le test B).
- **CA-2 (valeur)** — conforme : la décision de valeur (rediriger la racine vers la page Bell du site) est celle de l'investisseur (155) ; le lot n'en tranche aucune nouvelle.
- **CA-3 (ADR de rattachement, gates non suspendus)** — **correction C-1** : le choix structurant (une directive de plus dans le Caddyfile, la CA c07 redéfinie) n'a pas d'ADR au moment du lot ; l'item ADR-AMEND-BELL-HOST-ROOT-1 est formé mais « à faire au G7 ». Exigé : dans le MÊME G7 (même fusion), pas après. Absence de cp-1 : voir §5.
- **CA-4 (fan-out)** — n-a : un worker, un G2, pas de fan-out dans le lot.
- **CA-5 (MAST)** — n-a pour la topologie (mono-worker) ; le risque résiduel pertinent est « vérification prématurée » (CA passée contre l'hôte avant le rejeu de l'étape 7 => c07 rouge par construction) — déclaré par le worker (item 3), porté en C-2.
- **CA-6 (oracle + revue G2)** — conforme sous condition : trace d'oracle rejouée par moi (§2) ; G2 fraîche en cours, non lue. Si le G2 rend une catégorie différente de la mienne, l'orchestrateur applique la frontière (divergence => escalade).
- **CA-7 (zéro dette)** — conforme : les 4 items du RENDU sont formés (ADR-AMEND avec déclencheur G7 ; Caddy local absent => demande formée `docker pull caddy:2.11.4` + `caddy adapt`, non bloquante car `caddy validate` avant `mv` avec retour arrière est l'oracle fail-closed de l'étape 7 ; séquencement 7->8->11 ; second lecteur). Précisions C-2/C-3 ci-dessous.
- **CA-8 (provenance)** — conforme avec réserve déclarée : worker `claude-opus-5-5[1m]` (préfixe conforme au roster 2026-09-22), effort max, horodatages, sources [lu] avec sha, incident python3 consigné. « Générateur différent du relecteur » = affirmation de l'orchestrateur, non vérifiable depuis les artefacts (je le dis). `error_origin` non encore assigné => C-5.
- **CA-9 (vérification imposée par le système)** — conforme : instance séparée, contexte frais, rejeu sous copie hors dépôt (AM-2 ter), mutants rejoués par moi et non seulement lus dans COMPARE.txt.
- **CA-10 (anti-vitesse, lots petits)** — conforme : aucun argument de vitesse dans le RENDU ; R-25 104.
- **CA-11 / CA-11 durci (branchement = composition exécutée)** — conforme **dans le dépôt** : `test/verify-bell.test.ts:30` lit le Caddyfile COMMITTÉ, `served()` -> `parseCaddyfile` -> `serveCaddy` loopback -> `runCa` réel (12/12 à la ligne 154 ; c07 rouge quand `redir` est retiré ou la cible changée, rejoué). Le `get()` de S-8 (`http.request`) et `httpGet` de la CA ne suivent pas les redirections (piège `fetch` évité). Rétrécissement déclaré : le modèle n'est pas Caddy ; la preuve sur le chemin SERVI réel est c07 à l'étape 11 après rejeu de l'étape 7 — **pas encore faite** => C-2 (condition de clôture). Sortie consommée : un lecteur humain atterrit sur `https://monarkgate.tech/bell`, servi 200 (CHANTIERS l.1207, 16/16 après SITE-CHARTE-C).
- **Anti-close / anti-close bis** — conforme (scan fait, §2).

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)
- **C-1 (bloquante au G7)** : `ADR-AMEND-BELL-HOST-ROOT-1` committé dans la même fusion G7, citant la décision 155, portant : amendements ADR-T1b D10 (bloc Caddy), D11 (contrôle 7 : « pas de listing ET `/ => 302 Location BELL_ROOT_REDIRECT` »), D13.5 (sous-ensemble du modèle + `redir`), backlog S-8 ; le contenu cp-1 a posteriori (les 4 phrases de CA-1, fan-out n-a, MAST n-a) ; la **déclaration des tuyaux** (entrée = blob `deploy/Caddyfile.monark-bell` au nouveau G7 ; état = `/etc/caddy/Caddyfile` sha == blob, c11 b ; sortie = 302 `Location` consommée par le navigateur vers le site `/bell` servi 200 ; tests = `bell_caddyfile_root_redirects_to_site_bell_page` + c07 live à l'étape 11).
- **C-2 (bloquante pour la clôture de la décision 155, pas pour la fusion)** : l'entrée JOURNAL-PROVENANCE du G7 dit explicitement que la redirection **n'est pas encore servie** à la fusion ; la décision 155 ne se clôt qu'après rejeu 7 -> 8 -> 11 et commit du `docs/deploy-CA-bell.json` recapturé (détail c07 `root_location=...`) au nouveau G7 — item formé, propriétaire orchestrateur, déclencheur = immédiatement après la fusion. Aucune mention publique « racine en ligne » avant. Consigner aussi l'aléa d'ordre : la CA fusionnée lancée contre l'hôte AVANT l'étape 7 rend c07 rouge par construction (fail-closed voulu, prouvé par mon rejeu M1). Jambe « sortie consommée » : c07 ne compare que la chaîne `Location`, jamais la réponse de la cible ; le rejeu de l'étape 8 (ou l'entrée JOURNAL du G7) consigne en plus `curl -sS -o /dev/null -w "%{http_code}" https://monarkgate.tech/bell` = 200 à côté de la ligne `302 0 <cible>` — une redirection vers une page morte serait branchée en forme, pas en substance (la mention CHANTIERS l.1207 est un document du jour, pas une mesure).
- **C-3 (item formé, non bloquant)** : `apps/bell/test/helpers/bell-served.ts` est un second lecteur du Caddyfile qui ignore `redir` en silence (non fail-closed sur une directive hors sous-ensemble, contrairement à `bell-caddy.ts`). Déclencheur : prochaine touche de ce helper ou du Caddyfile — soit réutiliser `bell-caddy.ts`, soit lever sur directive inconnue ; tout `fetch` sur `/` avec `redirect: "manual"`.
- **C-4 (ruling sur le point laissé à l'orchestrateur)** : le remplacement de la sonde `/state.json` par `/no-such-file.json => 404` à l'étape 8 est accepté : `/state.json` 200 est prouvé par c01 à l'étape 11 ; l'étape 8 reste vraie à la première installation comme au rejeu ; `%{redirect_url}` prouve la cible sans suivre la redirection (manpage lue).
- **C-5 (`error_origin`, à assigner au G7)** : la racine en 404 était **par conception** au G0 de T-1b (D11 contrôle 7 satisfait par un 404, aucun atterrissage humain prévu) => origine planificateur/orchestrateur, pas worker. Incident python3 : worker, sans effet sur les artefacts.

## 5. Absence de G0/cp-1 — ruling demandé
Acceptable **a posteriori** pour CE lot, au motif que la substance du cp-1 est entièrement satisfaite après coup (CA-1 reformulé ci-dessus, CA-2 chez l'investisseur, CA-4/CA-5 n-a mono-worker) et portée par C-1 dans le G7. Je n'exige pas un document G0 séparé : l'ADR-AMEND est le G0 a posteriori. **Réserve consignée** : la décision 149 est un ordre d'urgence et de fan-out, pas un régime de dérogation aux gates ; R-22 dit qu'aucune urgence ne suspend un gate. Déviation ponctuelle déclarée dans le JOURNAL, sans valeur de précédent.
**Question à l'investisseur (frontière : dérogation à un gate ; non bloquante pour CETTE fusion, à router par l'orchestrateur AVANT tout autre lot sans cp-1)** : le régime « lot correctif court sans checkpoint-1 » est-il ratifié par une décision datée, ou R-22 s'applique-t-il au prochain lot ? Le cp-1 de ce lot, sauté sous 149, est reconstitué a posteriori dans l'ADR-AMEND (C-1).

## 6. AM-1 — ce que la checklist a attrapé
Tous les chiffres du worker reproduits (aucun écart code). Attrapé : (i) condition de clôture — le lot est « built » dans le dépôt mais la redirection n'est pas servie tant que l'étape 7 n'est pas rejouée (CA-11 : registre différent du chemin servi) ; (ii) cp-1 sauté sous 149 vs R-22 ; (iii) ADR-AMEND « au G7 » précisé en « dans la même fusion ». Manqué : à signaler par l'orchestrateur a posteriori.

## 7. Empreintes
Rejeu : `F:\tmp\cp2-bellroot\wt` ; preuves `targeted.tap`, `full.tap`, `gate-*.log`, `mut-M1.tap`, `mut-M2.tap`, `mut-M3.tap`, `mut-M12.tap`, `SHA-BEFORE.txt`, `SHA-AFTER.txt`. Aucune valeur brute citée.
