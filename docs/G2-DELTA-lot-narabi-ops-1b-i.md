claude-opus-4-8[1m]  (modèle résolu — R-1 ; effort max ; RELECTEUR G2 DELTA à contexte frais, instance SÉPARÉE de l'implémenteur ET du premier relecteur G2)

# G2 DELTA — revue 100 % du pli C-G2-1..8 — sous-lot NARABI-OPS-1b-i (DÉTECTION)

R-20 (je ne committe pas, ne déclenche aucun workflow, ne modifie AUCUN fichier du worktree). R-21 (chaque affirmation
porte sa preuve reproductible). Objet jugé : le DELTA `git diff 69eb943 9d845d5` (pli des findings C-G2-1..8 de
`docs/G2-lot-narabi-ops-1b-i.md`, verdict initial ACCEPTE-AVEC-CORRECTIONS). Rejeux sur COPIE `F:\tmp\g2d-narabi1b\`
(`git archive 9d845d5 | tar -x`, `npm ci` **exit 0**, TMP/TEMP=F:\tmp — rien sur C:). Aucune action sortante : loopback /
hôtes `.invalid` seulement. Node v24.15.0 (== CI node 24 ; type-stripping TS natif, aucun loader).

## Verdict : **ACCEPTE-AVEC-CORRECTIONS**
Les **8 findings C-G2-1..8 sont RÉELLEMENT fermés** (pas seulement testés) : j'ai rejoué les **9 mutants annoncés** (M-G2-1,
M-G2-2/M4, M-G2-2/M10, M-G2-3..8) — **9/9 RED sous un parent `TZ=UTC`** (l'environnement même que C-G2-2 disait laisser
survivre les mutants d'heure/date locale) — plus **1 contrôle négatif GREEN** (le harnais discrimine), et j'ai **inventé 4
mutants adversariaux** sur la nouvelle surface de garde. La garde de transport résiste à une **batterie de 62 URL hostiles**
(0 fuite). Arbre restauré sha-exact après CHAQUE mutant (`c872ccc…` == pristine). R-25 = **970** (mesuré, == pli). Reste
**4 OBSERVATIONS** (une ligne d'un helper EXPORTÉ — le contrôle d'octet >255 de `isLoopbackHost`, injoignable via la garde
câblée — non pinnée : mutant N-G2-d **SURVIVED** ; résidu `.tmp` non nettoyé sur erreur d'E/S ; borne basse d'env `0`/`""`
→ 0 ; `fetchTimeline` exporté sans auto-garde loopback). **Aucune n'est une faille, un bypass, ni un défaut du chemin de
production (https).** Une seule correction de code/test est demandée — triviale (pinner le helper, C-G2D-1) ; les 3 autres
sont des **items formés** (déclencheurs -1b-ii). L'orchestrateur (R-21/G7) tranche.

---

## VÉRIFICATION DE CHAQUE FINDING (fermé ⇔ mutant annoncé RED + essais indépendants)

### C-G2-1 (garde loopback, MAJEUR d'origine) — **FERMÉ**
`isLoopbackHost` strict (`localhost`/`::1` exacts, ou dotted-quad 127/8 canonique : 4 octets ≤255, sans zéro en tête,
1er=127) ; `rawUrlHost` lit l'hôte brut AVANT normalisation WHATWG ; `urlTransportAllowed` admet http ssi **pas de
userinfo ET `isLoopbackHost(u.hostname)` ET `isLoopbackHost(rawUrlHost(url))`**.
- **Propriété de sûreté prouvée empiriquement** (`_battery.mjs`, 62 URL) : *toute* URL http admise a un `u.hostname`
  (= l'hôte réellement composé par `fetch`) qui est un loopback réel ⇒ **0 fuite**. L'invariant tient parce que la garde
  teste `isLoopbackHost(u.hostname)`, et `u.hostname` EST la cible de `fetch` (pas de TOCTOU : la garde et `fetch`
  parsent la même chaîne `url` via le même WHATWG). `rawUrlHost` **resserre** (jamais n'élargit) — un ET, pas un OU.
- Bypass d'origine **refusés** : `127.0.0.1.evil.com`, `127.evil.com` (hostname = nom DNS). Raccourcis numériques que
  `u.hostname` seul normaliserait en 127.0.0.1 **refusés par `rawUrlHost`** : `127.1`, `0x7f.0.0.1`, `2130706433`,
  `0177.0.0.1`, `127.00.0.1`. Vecteurs mission tous couverts : casse (`HTTP://`, `LOCALHOST` → admis, dialLoopback=true),
  point final (`localhost.`, `127.0.0.1.` → refusés, over-restrictif sûr), IPv6 (`[::1]` admis ; `[0:0:0:0:0:0:0:1]`,
  `[::ffff:127.0.0.1]`, `[fe80::1]`, zone-id → refusés), `%`-encodage (`%31%32%37.0.0.1`, `127.0.0.1%2f@evil.com` →
  refusés), Unicode/IDN (`127。0。0。1`, fullwidth, homographe `locał` → refusés), tab/CR (`127.0.0.1\t.evil.com` →
  WHATWG le NETTOIE en `127.0.0.1.evil.com` ⇒ **refusé par le contrôle `u.hostname`**), backslash (`127.0.0.1\@evil.com`
  → `\` = séparateur de chemin WHATWG ⇒ compose 127.0.0.1, admis & sûr ; `evil.com\@127.0.0.1` → hostname evil.com,
  refusé), double `@` (hostname=evil.com, refusé), port vide (`127.0.0.1:` admis, compose loopback), `http:/127.0.0.1`
  (refusé par `rawUrlHost`, fail-safe), espaces (`127.0.0.1 @evil.com` → hostname evil.com, refusé ; `  http://…` →
  refusé). **SSRF-métadonnées `169.254.169.254`, `192.168.*`, `10.*`, `0.0.0.0`, `file://`, `ftp://`, `gopher://`,
  `data:` tous refusés.** `https://` vers n'importe quel hôte reste admis (prévu). `PROBE_URL` vient de
  `opts.url(--url) ?? process.env.PROBE_URL ?? DEFAULT_URL` — env/CLI/défaut seulement.
- **Mutant annoncé M-G2-1** (`if(!m) return false` → `/^127\./.test(h)`) ⇒ **RED**. **Inventés RED** : **N-G2-a**
  (2ᵉ contrôle `rawUrlHost` retiré) ⇒ RED (127.1 & co. redeviennent admis) ; **N-G2-b** (contrôle userinfo retiré) ⇒
  RED (`user:pass@127.0.0.1` admis) ; **N-G2-c** (contrôle zéro-en-tête retiré) ⇒ RED (`127.00.0.1` admis). Chaque
  composant de la garde est donc **porteur** (démontré, pas asserté).

### C-G2-2 (mutants de fuseau sur CI UTC, MINEUR majorable) — **FERMÉ** *(c'était le risque le plus subtil)*
`runProbe`/`runProbeAsync` figent `TZ` de l'enfant (défaut `Etc/GMT-11` = UTC+11) et le test C-4 rejoue la matrice sous
**est (UTC+11) ET ouest (UTC−11)**. **Node honore-t-il `TZ` sur CETTE machine Windows ?** — PROUVÉ first-hand : un enfant
`spawn` avec `env.TZ` imprime `getTimezoneOffset()` = **−660** (`Etc/GMT-11`), **+660** (`Etc/GMT+11`), **0** (`UTC`) ;
et `new Date("2026-09-20T23:30:00Z").getHours()` = 10 / 12 / 23 respectivement. (Le piège MSYS `TZ=Etc/GMT-11 node` en
shell donne −60 — mangling de la valeur à cause du `/` — mais c'est **hors du chemin du test** : `runProbe` passe `TZ`
via `spawnSync(env)`, non via un shell MSYS ; distinction mesurée, donc le fix est réel ici.) **Limite déclarée (R-21,
non deviné)** : Linux CI n'est **pas mesurable depuis cet hôte** (Windows ; outbound interdit) — je n'affirme AUCUN
chiffre Linux. Le mécanisme est le même `spawn(env.TZ)`, portable ; Node lit `TZ` via V8/ICU (pas via une lib libc
particulière) ; la preuve Linux = le **premier run CI sur `9d845d5`** (item orchestrateur). **Preuve décisive ICI** : sous
**parent `TZ=UTC` (offset 0 mesuré)**, la suite passe
**14/14**, ET les mutants **M-G2-2/M4** (heure locale) et **M-G2-2/M10** (date locale) ⇒ **RED** — donc ils meurent
**indépendamment du fuseau du parent**, exactement ce que le finding exigeait. `toISOString` reste UTC ⇒ verdicts
TZ-invariants.

### C-G2-3 (`--now` invalide n'écrivait pas `narabi.json`, MINEUR) — **FERMÉ**
`probe()` : `nowValid = !Number.isNaN(Date.parse(providedNow))` ; si invalide, `nowIso` **retombe sur l'horloge réelle**
(donc `checked_at`/`publish_latency` du catch ne lèvent jamais) et un `throw` interne ⇒ `probe_error`, exit 1,
`narabi.json` **toujours** écrit, jamais FATAL. `nowIso` est prouvablement toujours une ISO valide (valide ? providedNow :
horloge) ⇒ le `catch` ne re-throw plus. Test `probe_invalid_now_still_writes_narabi_json` (assert `narabi.json` existe,
`checked_at` réel, `doesNotMatch(stderr,/FATAL/)`) ⇒ vert. **Mutant M-G2-3** (repli retiré) ⇒ le catch re-throw sur
`new Date(NaN).toISOString()` ⇒ fichier non écrit ⇒ **RED**.

### C-G2-4 (redirections suivies, MINEUR) — **FERMÉ, ÉTENDU À TOUS LES CODES**
`fetch(..., { redirect: "manual" })` + `if (res.type==="opaqueredirect" || (status∈[300,400))) return unreachable`.
J'ai vérifié **au-delà du test** (qui ne teste que 302) : serveur redirecteur loopback → cible loopback, pour
**301/302/303/307/308/300/304** ⇒ **tous `unreachable`, `targetHit=false`** (cible JAMAIS composée ; `_redir.mjs`).
Réponse opaque gérée ; aucun suivi de `Location` (relatif ou absolu). **Mutant M-G2-4** (`redirect:"manual"` retiré) ⇒
302 suivi, cible composée ⇒ **RED**.

### C-G2-5 (double constante DEADLINE, MINEUR) — **FERMÉ**
`DEADLINE_UTC="10:30"` source unique ; `DEADLINE_UTC_MINUTES = hhmmToMinutes(DEADLINE_UTC)` **dérivée** (plus de `630`
littéral). Oracle `publish_latency` pinné (0 à 10:30Z, +300 à 10:35Z, −3600 à 09:30Z). Test
`probe_deadline_single_source_and_publish_latency_oracle` ⇒ vert. **Mutant M-G2-5** (minutes désync `629`) ⇒ **RED**.

### C-G2-6 (écriture non atomique, OBSERVATION) — **FERMÉ** (voir C-G2D-2 pour le résidu sur échec)
`tmp = ${out}.tmp-${pid}-${Date.now()}` (MÊME répertoire que `out` = `dirname(out)` mkdir'd) puis `renameSync(tmp,out)`.
Collision entre deux tirs : `pid` distinct par process ; tirs du timer à 2 h d'écart ; nom non prévisible. Test
`probe_writes_narabi_json_atomically` (2 runs sur le même `--out`, `readdirSync===["narabi.json"]`, aucun résidu `.tmp`)
⇒ vert. Compat systemd : `tmp` est dans `/var/lib/monark-probe` = `ReadWritePaths` ⇒ rename atomique OK sous
`ProtectSystem=strict`. **Mutant M-G2-6** (`renameSync` retiré) ⇒ `narabi.json` absent / résidu `.tmp` ⇒ **RED**.

### C-G2-7 (env transport non plafonné, OBSERVATION) — **FERMÉ** (voir C-G2D-3 pour la borne basse)
`transportBounds(env)` plafonne dur : `PROBE_TIMEOUT_MS≤10000`, `PROBE_RETRIES≤4`, `PROBE_MAX_BYTES≤64 Mio`. Pire-cas
plafonné = 10000×(4+1)+10000 marge = **60 s < TimeoutStartSec 90 s**. Le test `probe_timer_multiple_shots` **lit l'unité
réelle** (`readFileSync deploy/monark-probe.service`, regex `TimeoutStartSec=(\d+)`), asserte `> 60` (pire-cas plafonné)
ET `transportBounds({PROBE_TIMEOUT_MS:"99999999"}).timeoutMs===10000`, `{PROBE_RETRIES:"99999"}.retries===4`. Mesuré :
`"1e9"` ⇒ 10000/67108864/4 (plafonné). **Mutant M-G2-7** (`Math.min(n,max)`→`n`) ⇒ **RED**.

### C-G2-8 (`--file` non borné, OBSERVATION) — **FERMÉ**
`--file` borné par `statSync(opts.file).size > maxBytes` ⇒ `too_large` (même borne que le GET), jamais lu entier. Test
`probe_file_input_is_size_bounded` (`PROBE_MAX_BYTES=64` ⇒ too_large) ⇒ vert. **Mutant M-G2-8** (contrôle retiré) ⇒ lu
entier ⇒ healthy ⇒ **RED**.

---

## FINDINGS DELTA (nouveaux ; aucun ne ré-ouvre un finding fermé)

### C-G2D-1 — Le contrôle d'octet `>255` de `isLoopbackHost` (helper exporté) n'est pinné par AUCUN test — **OBSERVATION**
**Preuve (mutation, RED attendu, obtenu GREEN=SURVIVED).** Mutant **N-G2-d** : `if (Number(p) > 255) return false;` →
`if (false) …` dans `isLoopbackHost` ⇒ la suite reste **VERTE** (`probe_refuses_http_off_loopback` pass=1 fail=0). La
ligne est donc **non pinnée** : une régression future la supprimant passerait le CI. **Précision (mesurée, corrige une
première formulation)** : cette ligne est **injoignable via la garde câblée** `urlTransportAllowed`. Un dotted-quad hors
plage fait **lever `new URL`** (mesuré : `new URL("http://127.0.0.256/x")` throws=true, comme `127.0.0.999`/`127.300.0.1`
dans la batterie, ligne `proto=<throws>`) ⇒ `urlTransportAllowed` retourne `insecure_url` **depuis son `catch`, AVANT**
d'appeler `isLoopbackHost`. Vérifié sous le mutant : `urlTransportAllowed("http://127.0.0.256/x")` = **`insecure_url`
même avec N-G2-d appliqué** ⇒ **aucune admission, aucune fuite** par la garde. La ligne n'est atteignable que par un
**appel DIRECT** au helper exporté (sous N-G2-d : `isLoopbackHost("127.0.0.256")` passe de `false` à **`true`**). Donc :
lacune de couverture sur un **helper exporté** qu'un consommateur -1b-ii pourrait appeler directement — pas un bypass de
la sonde -1b-i. **Correction demandée** (zéro dette au release, triviale) : pinner le helper —
`isLoopbackHost("127.0.0.256")===false` (et par symétrie `"127.0.0.1"`/`"127.255.255.255"`===true) ; N-G2-d rougit
alors. **error_origin = worker** (test-coverage). ~2 assertions, ~0 ligne R-25 nette.

### C-G2D-2 — Résidu `.tmp` non nettoyé + FATAL sur erreur d'E/S : l'invariant « toujours écrit » retombe sur une panne disque — **OBSERVATION**
`writeFileSync(tmp,…)` puis `renameSync(tmp,out)` (`:348-349`) ne sont PAS dans un `try/catch`. Si `renameSync` échoue
(ou si `writeFileSync` échoue en cours), le `.tmp` reste orphelin ET l'erreur s'échappe de `probe()` ⇒ `main().catch`
imprime `probe FATAL` ⇒ `narabi.json` **non écrit**. C'est le MÊME invariant « narabi.json ALWAYS written » que C-G2-3
vient de renforcer, mais sur un **chemin distinct** (erreur d'E/S, plus rare que `--now` invalide). **Précision d'origine
(fair error_origin)** : le FATAL-sur-E/S n'est PAS nouveau — le `writeFileSync(out,…)` **pré-delta** était tout aussi
non-enveloppé (un disque plein aurait déjà FATAL) ; **seul le résidu `.tmp` orphelin est neuf** (introduit par le
temp+rename du pli C-G2-6). Bénin en -1b-i (aucun lecteur), mais la machine -1b-ii LIRA `narabi.json` et pourrait
tomber sur un `.tmp` traînant ou un fichier absent. **Recommandation** : envelopper write+rename d'un `try/catch` qui
`unlink(tmp)` et écrit un dernier état `probe_error` best-effort ; OU accepter comme **structurel** (panne disque hors
contrôle de la sonde) via un **item formé** — le lecteur -1b-ii tolère `narabi.json` absent + ignore les `*.tmp-*`.
**error_origin = worker.** Déclencheur : -1b-ii (le read path).

### C-G2D-3 — Borne BASSE d'env : `PROBE_TIMEOUT_MS`/`PROBE_MAX_BYTES` = `0`/`""`/`"  "` ⇒ 0 (pas le défaut) ⇒ always-unhealthy silencieux — **OBSERVATION**
**Mesuré** (`transportBounds`) : `"0"`, `""`, `"  "` ⇒ `timeoutMs=0, maxBytes=0, retries=0` (car `Number("")===0`, fini,
≥0). `timeoutMs=0` ⇒ chaque `fetch` s'abort instantanément ⇒ **toujours `unreachable`** ; `maxBytes=0` ⇒ tout corps ⇒
`too_large`. `"-5"`/`"abc"` ⇒ défaut (correct). Fail-safe (état unhealthy écrit, aucun crash/fuite), **pré-existant**
(le `numEnv` G1 avait le même comportement ⇒ **pas une régression du delta**), et l'`EnvironmentFile` -1b-i ne porte que
`PROBE_URL`. Mais un env numérique vide rend la sonde **muette-unhealthy** sans le dire. **Recommandation** (optionnelle) :
traiter `0`/blanc comme « défaut », ou plancher à un minimum sain (p.ex. `timeoutMs≥1000`). **error_origin = worker/plan**
(hors mandat strict, robustesse).

### C-G2D-4 — `fetchTimeline` exporté n'auto-applique PAS `urlTransportAllowed` (garde loopback au seul niveau `probe()`) — **OBSERVATION**
La garde loopback vit dans `probe()` ; `fetchTimeline` (exporté) ne porte QUE la garde de redirection. En -1b-i, l'unique
appelant est `probe()` (garde d'abord) ⇒ correctement branché, aucun risque. Mais un appelant -1b-ii qui utiliserait
`fetchTimeline` directement contournerait la garde loopback. **Recommandation** : item formé — tout nouvel appelant de
`fetchTimeline` doit passer par `urlTransportAllowed`, OU déplacer la garde dans `fetchTimeline`. **error_origin = plan**
(concern -1b-ii). Déclencheur : -1b-ii.

*(Notes mineures, non-findings : `localhost` dans l'ensemble admis dépend de l'intégrité `/etc/hosts` — hors modèle de
menace « PROBE_URL mal réglé », et la production est en https ; l'unité utilise `ReadWritePaths=/var/lib/monark-probe`
et non `StateDirectory` ⇒ le répertoire doit être pré-créé au déploiement — item de déploiement **pré-existant**, non
touché par le delta.)*

---

## TABLEAU DES MUTANTS (parent `TZ=UTC` ; remplacement unique asserté ; restauré sha-exact `c872ccc…` après CHACUN)
Harnais `F:\tmp\g2d-narabi1b\_mutants.mjs` + `_g1mutants.mjs` (occurrence unique assertée, jamais `git checkout`).

| # | Mutation | Cible | Test tueur | Verdict | Attendu |
|---|---|---|---|---|---|
| M-G2-1 | `if(!m) return false` → `/^127\./.test(h)` | isLoopbackHost | probe_refuses_http_off_loopback | **RED** | RED |
| M-G2-2/M4 | `getUTC{Hours,Minutes}`→`get*` (heure locale) | expectedLastDay | probe_narabi_detects_lag | **RED** (sous parent UTC) | RED |
| M-G2-2/M10 | `todayUTC` en date locale (offset) | expectedLastDay | probe_narabi_detects_lag | **RED** (sous parent UTC) | RED |
| M-G2-3 | repli horloge retiré (`nowIso=providedNow`) | probe | probe_invalid_now_still_writes_narabi_json | **RED** | RED |
| M-G2-4 | `redirect:"manual"` retiré | fetchTimeline | probe_does_not_follow_redirects | **RED** | RED |
| M-G2-5 | `DEADLINE_UTC_MINUTES`=629 (désync) | const | probe_deadline_single_source… | **RED** | RED |
| M-G2-6 | `renameSync` retiré | probe | probe_writes_narabi_json_atomically | **RED** | RED |
| M-G2-7 | `Math.min(n,max)`→`n` (plafond retiré) | transportBounds | probe_timer_multiple_shots | **RED** | RED |
| M-G2-8 | contrôle taille `--file` retiré | probe | probe_file_input_is_size_bounded | **RED** | RED |
| **N-G2-a** (inventé) | 2ᵉ contrôle `rawUrlHost` retiré | urlTransportAllowed | probe_refuses_http_off_loopback | **RED** | RED |
| **N-G2-b** (inventé) | contrôle userinfo retiré | urlTransportAllowed | probe_refuses_http_off_loopback | **RED** | RED |
| **N-G2-c** (inventé) | contrôle zéro-en-tête retiré | isLoopbackHost | probe_refuses_http_off_loopback | **RED** | RED |
| **N-G2-d** (inventé) | contrôle octet `>255` retiré | isLoopbackHost | probe_refuses_http_off_loopback | **GREEN = SURVIVED** | ⇒ C-G2D-1 |
| CTRL-noop | commentaire seul | const DAY_MS | probe_narabi_detects_lag | **GREEN** (harnais discrimine) | GREEN |
| G1-perm | swap 2 des 31 champs | hashedFieldsOf | probe_hashed_fields_order_equals_sentinel | **RED** | RED (G1 intact) |
| G1-chain-last | boucle chaîne = dernière ligne | checkChain | probe_recomputes_full_chain | **RED** | RED (G1 intact) |
| G1-provider-pos | `.some(∈)`→`endpoints[8]` | chainstackPresent | probe_provider_of_matches_sentinel | **RED** | RED (G1 intact) |
| G1-lag-nonstrict | `lag<=0`→`lag<0` | evaluate | probe_narabi_detects_lag | **RED** | RED (G1 intact) |

**Bilan** : 9 mutants annoncés = 9 RED ; 3 inventés porteurs = 3 RED ; 1 inventé coverage = SURVIVED (⇒ C-G2D-1) ;
1 CTRL = GREEN ; 4 mutants G1 = RED (les 9 oracles G1 restent **significatifs** après le delta). Arbre final
`c872ccc…` == pristine.

## R-25 (pathspec `STAT=` de `.github/workflows/ci.yml:65`, `git diff --shortstat 298aa5c 9d845d5` avec les excludes)
**7 fichiers, 966 insertions, 4 suppressions = 970 lignes** ⇒ **≤ 1205** (plafond) et **< 1100** (seuil d'alerte, ~130 de
marge). **== la valeur 970 déclarée au pli** (`docs/PLI` §R-25). Répartition (`--numstat`) : probe.test.ts 439 · probe.mjs
374 · probe.d.mts 70 · service +42 · timer +26 · sentinel-retry +13/−2 · vocab +2/−2. Delta pli sur G1 (793) = +177 net.
`docs/**/*.md` exclus. **Conforme.**

## ORACLES / GATES REJOUÉS (copie, un à un)
typecheck `tsc --noEmit` **0** · `eslint .` **0** · `gate:vocab` OK (178 fichiers ; `scripts/probe-narabi.mjs` &
`test/probe-narabi.test.ts` **confirmés dans `scan.sentinel.files`**) · `export:check` OK · `lang:gate` OK ·
`lint:ratchet` **69/69** · `probe-narabi.test.ts` **14/14** (sous parent TZ=UTC) · **PLI « 32/32 » réconcilié** : ci-gates
+ no-secret + sentinel-retry seuls = **32/32** (mesuré, == pli) ; ma mesure 38/38 y ajoute `narabi-live` (+6). **L-4** :
delta de répertoires `narabi-retry-*` = **0** (mesuré 61→61 autour
d'un run isolé de sentinel-retry ; les 61 sont un débris pré-existant de sessions antérieures, horodatés avant mes runs).

## HYGIÈNE / BRANCHEMENT
- **sha256 des 5 livrés == table PLI G2** : probe.mjs `c872ccc…`, test `b830bb6…`, service `35fba87…`, timer
  `39335a1…`, d.mts `2a183e9…` (re-hashés sur la copie). **Le pli dit vrai** sur chaque sha et chaque compte (14 tests,
  9 mutants RED + 1 CTRL, R-25 970, 4 fichiers code touchés).
- **Aucun secret / URL à clé** : `no-secret-in-repo` vert ; `DEFAULT_URL` = `https://monarkgate.tech/narabi/timeline.jsonl`
  (public, keyless) ; les « hits » d'un grep secret sont des faux positifs (prose « aucun secret », le code
  `u.password === ""`, le nom de test `no-secret-in-repo`).
- **Rien « built »** : le delta ne touche que 5 fichiers (service, PLI, probe.d.mts, probe.mjs, test) — `fleet.ts`,
  README, site, aucun registre public touché. Tuyaux `upcoming` (déc. 58), inchangé.

## MODES MAST (risque résiduel)
- **FM-3.3 (vérification incorrecte)** — résiduel : une ligne d'un helper EXPORTÉ (octet >255), injoignable via la garde
  câblée, non pinnée (C-G2D-1). Fermé par l'ajout d'une assertion sur le helper.
- **FM-1.3 (robustesse partielle)** — résiduel : `.tmp`/FATAL sur E/S (C-G2D-2), borne basse d'env (C-G2D-3) — fail-safe,
  items formés.

## error_origin (récap DELTA)
C-G2D-1 worker (coverage) · C-G2D-2 worker · C-G2D-3 worker/plan · C-G2D-4 plan (-1b-ii).

## PROVENANCE
Réviseur `claude-opus-4-8[1m]` effort max, 2026-09-20, contexte frais (instance séparée de l'implémenteur et du 1er
relecteur G2). Copie `F:\tmp\g2d-narabi1b\` (archive `9d845d5`, `npm ci` exit 0). Node v24.15.0. Baseline sha256
probe.mjs `c872cccec7cec8b48ad98b54a2469efae6f45892e4642a8eb9f22bb545238ee8`, re-vérifiée == pristine après TOUS les
mutants. Aucune action sortante (loopback / `.invalid` seulement) ; worktree NON modifié (rejeux sur copie). Harnais
reproductibles : `_battery.mjs` (62 URL), `_mutants.mjs` (14 mutations), `_g1mutants.mjs` (4), `_redir.mjs` (7 codes 3xx).
