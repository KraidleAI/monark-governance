# G0 ADDENDUM — sous-lot NARABI-OPS-1b-ii (ALERTE mail SMTP + rappel quotidien de la sonde externe Narabi)

Rédaction worker **`claude-opus-4-8[1m]`**, effort max, 2026-09-21, à la demande de l'orchestrateur.
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme ; l'orchestrateur vérifie ce préfixe avant de consommer cette sortie comme preuve.
R-20 : le worker ne committe pas, ne déclenche aucun workflow, n'exécute AUCUNE action sortante (ni ssh, mail, DNS, TLS réel, appel payant) ; tout est offline/loopback. R-21 : sortie vérifiée adversarialement — chaque affirmation porte sa preuve `fichier:ligne` (ouvert first-hand) ou sa mesure reproductible. **Brouillon PRÉ-checkpoint-1-delta** : les questions Q1..Q10 en fin de document sont tranchées par le validateur/orchestrateur AVANT tout code de -1b-ii ; ce document ne s'auto-amende pas.

**Portée.** Cet addendum TRANCHE ou FORME, un par un, les dix chantiers que -1b-i a renvoyés à « G0 -1b-ii » (blocs « ▼ BLOC EXACT » CHANTIERS/JOURNAL de `docs/PLI-lot-narabi-ops-1b-i.md`, checkpoint-2 C-V-5 et checkpoint-2 delta C-D-3). Il **complète** (ne remplace pas) `docs/G0-lot-narabi-ops-1b.md` (corps + Amendement checkpoint-1 §C-2/C-3/C-7/C-8/C-15 + Adjudications au pli, qui FONT FOI sur -1b-ii) et `docs/CHECKPOINT1-lot-narabi-ops-1b.md`.

**Base / branche.** -1b-i clos côté code (worktree `F:\Monark-wt-narabi1b`, branche `lot/narabi-ops-1b-i`, HEAD `331c169`, G7 en attente de la mesure D). -1b-ii = **lot séquentiel SÉPARÉ** (C-15, seam FERME) : nouvelle branche `lot/narabi-ops-1b-ii`, worktree neuf `F:\Monark-wt-narabiops1bii`, base = `lot/etude-suite` HEAD **APRÈS** la fusion `--no-ff` de -1b-i (donc après la mesure D + le G7 de -1b-i). **Un worker, un worktree neuf.** -1b-ii étend le même `scripts/probe-narabi.mjs` (built-ins Node seuls, un fichier déployé sur Bell) et son test racine `test/probe-narabi.test.ts`, modifie `deploy/monark-probe.service` (C-8) et `deploy/monark-sentinel.service` (item 3), et amende les docs (L-5).

**Dépendance d'escalade.** E-3 (rappel quotidien) est **RÉPONDUE** (investisseur, `CHANTIERS.md:188` ; adjudication `G0-lot-narabi-ops-1b.md:178`) ⇒ le code de -1b-ii n'est plus gaté par une escalade ouverte. E-1 (dead-man) et E-2 (boîte/coût) sont répondues et ne gatent que le **déploiement**, pas le code (`ALERT_TO` est d'env).

---

## 0. Faits mesurés first-hand (relecture du code + ADR + décisions + lecture SMTP, 2026-09-21)

Chaque fait ci-dessous a été vérifié en ouvrant le fichier ; les `fichier:ligne` sont dans le worktree `F:\Monark-wt-narabi1b` sauf préfixe `F:\Monark\` explicite.

1. **[lu, code] Zéro dépendance runtime** — `package.json:25-32` ne porte qu'un bloc `devDependencies` (`@types/node`, `ajv`, `ajv-formats`, `eslint`, `typescript`, `typescript-eslint`) ; **aucun bloc `dependencies`** ; `"type":"module"` (`:6`), `engines.node ">=24"` (`:11-13`). **Conséquence R-8 : un client SMTP par dépendance (nodemailer/…) SERAIT une première dépendance runtime** — et Bell n'a pas de `npm` (« Node BUILT-INS ONLY: @monark/* is not installable on Bell », `probe-narabi.mjs:4` ; « Node BUILT-INS only (no npm on Bell). 0 new dependency (R-8) », `monark-probe.service:6-7`). Le client SMTP est donc **en built-ins** (`node:tls`/`node:net`/`node:crypto`).
2. **[lu, code] `narabi.json` est WRITE-ONLY en -1b-i, schema 1** — `probe-narabi.mjs:13-15` : `{schema, checked_at, last_day, lag_days, chain_ok, reachable, chainstack_present, provider, status, reason, publish_latency}` ; `SCHEMA = 1` (`:22`) ; « the state-machine read path (alerted/alert_error) lands in -1b-ii, which bumps `schema` » (`:15`). La sonde -1b-i **n'ouvre aucun chemin de lecture** de l'état antérieur (déviation 1 du PLI, `error_origin` plan).
3. **[lu, code] Boucle de réessai GET** — `probe-narabi.mjs:246` : `for (let attempt = 0; attempt <= retries; attempt++)` dans `fetchTimeline` (GET, pas SMTP). Le mutant **`attempt <= retries + 1`** (NEW-3 du G2 delta-2, `G2-DELTA2-lot-narabi-ops-1b-i.md:40` ; C-G2D2-2 `:119-121` ; re-déclenché C-D-3 `CHECKPOINT2-DELTA-lot-narabi-ops-1b-i.md:16`) **SURVIT** : aucun test ne pinne le nombre d'essais sur le chemin d'échec. `transportBounds` (`:214-232`) : `retries = num(env.PROBE_RETRIES, DEFAULT_RETRIES=2, MAX_RETRIES=4, floor 0)` — un `PROBE_RETRIES=0` explicite est conservé (déviation acceptée `CHECKPOINT2…:19`).
4. **[lu, code] Client d'atomicité + repli E/S déjà présents** — `probe-narabi.mjs:357-372` : écriture temp `${out}.tmp-${pid}-${randomBytes(8)}` puis `renameSync` ; sur faute E/S, `unlinkSync(tmp)` puis **écriture directe best-effort** d'un état `probe_error` (`:369-370`), `return {exitCode:1}`, jamais de FATAL. `evaluate` (`:280-309`) : précédence « cannot-evaluate > chain > lag » ; `probe_error` naît en **deux endroits** : distant-malformé (`:292` parse, `:294` zéro ligne) et **local** (`:346` `--now` invalide → RangeError ; `:369` faute E/S). Le repli `:370` est **best-effort** — sous une faute disque, `narabi.json` peut ne pas être ré-écrit avec un état à jour.
5. **[lu, code] `state.json` et `digest_T`** — `run.ts:189` écrit `state.json`, `:191` le copie dans `public/` (servi `/narabi/state.json`, `RUNBOOK-sentinel.md:118`) ; `timeline.ts:176-180` : `stateSummary` retourne `{tracker, digest, projected_bound_leq_target_T, replay_q}` avec `digest = trackerDigest(q1, params, scores)` (`:180`). La ligne timeline porte `digest_T` (`timeline.ts:61`, dans `hashedFields` `:99`, `= trackerDigest(q1, p, next.scores)` `:162`). **INVARIANT VÉRIFIÉ first-hand (2026-09-21, `node` import de `apps/site/lib/narabi-snapshot.ts`)** : sur la paire committée `NARABI_SNAPSHOT` (`narabi-snapshot.ts:19-23`), `JSON.parse(stateJson).digest === dernière ligne .digest_T` — les deux `= 9b5f89fdd49c69e059ea50f94cdd6c00ace0ab93b95f61d01b6b59323735d633` (2 lignes, jours 2026-09-17/-18, `digest_T` distincts par ligne `48d40651…`|`9b5f89fd…`, `params {alpha:0.1,c:0.0416…,eps:0.1,t0:0,B:0.0416…}`). **`state.digest === dernière_ligne.digest_T` est donc un invariant à oracle committé** (le `digest` d'état = le `digest_T` du dernier jour, tous deux sur tous les scores jusqu'à ce jour).
6. **[lu, code] Copie publique en deux temps (fenêtre de partialité)** — la publication est `timeline.jsonl` append (`run.ts:188` par fait 2 du G0) → copie publique (`:190`), puis `state.json` (`:189`) → copie publique (`:191`). Un crash **entre** ces écritures laisse `public/` avec un fichier frais et l'autre périmé ⇒ **`state.digest ≠ dernière_ligne.digest_T`** : c'est exactement ce que le cross-check de l'item 2 attrape (au-delà du lag, C-9 précisé).
7. **[lu, unités] `monark-probe`** — `monark-probe.service:15` `Type=oneshot` ; `:23` `EnvironmentFile=-/etc/monark/probe.env` (le `-` = **optionnel**, toléré en -1b-i car aucun secret) ; `:29` **`TimeoutStartSec=90`** (justifié « fetch worst case ≤ 60 s < 90 s » `:25-28`, pour **UN** GET) ; `:41` `MemoryMax=128M`. `monark-probe.timer:17-19` : `OnCalendar` 10:30/12:30/16:30 UTC, `:22` `Persistent=true`.
8. **[lu, unités] `monark-sentinel`** — `monark-sentinel.service:15` `Type=oneshot`, **AUCUN `TimeoutStartSec`** (aucune borne structurelle de départ), `:42` `MemoryMax=512M`. `monark-sentinel.timer:16-19` : `OnCalendar` 00:30/03:30/06:30/09:30 UTC, `:22` `RandomizedDelaySec=1800`, `:23` `Persistent=true`. Dernier créneau **09:30** ; pire départ = 09:30 + 1800 s = **10:00 UTC**.
9. **[lu, code] `DEADLINE` de la sonde** — `probe-narabi.mjs:37` `DEADLINE_UTC="10:30"` (source unique), `:44` `DEADLINE_UTC_MINUTES = hhmmToMinutes(…)` (dérivée, C-G2-5). Interdite de surcharge par env (`:31,:47`) car couplée au timer (`probe_timer_oncalendar_ge_deadline`). **10:30 reste une hypothèse déclarée** jusqu'à la mesure D (`:32-34`, `monark-probe.timer:7-8`).
10. **[lu, code] Garde de transport + bornes** — `urlTransportAllowed` (`:194-210`) : `https` partout ; `http` **loopback strict SEUL** (`isLoopbackHost` `:167-180` + `rawUrlHost` `:184-193`, sans userinfo) ; sinon `insecure_url`, **zéro dial**. Bornes env plafonnées dur (C-G2-7) : `MAX_TIMEOUT_MS=10_000` (`:54`), `MAX_MAX_BYTES=8 Mio == DEFAULT_MAX_BYTES` (`:57`, env ne peut qu'ABAISSER ; assertion RSS `MemoryMax ≥ 13×MAX_MAX_BYTES`), `MAX_RETRIES=4` (`:58`). C'est le patron que le client SMTP réutilise (garde loopback pour le plaintext de test).
11. **[lu, garde-secrets] `F:\Monark\test\no-secret-in-repo.test.ts`** — `:34` rougit sur `-----BEGIN … PRIVATE KEY-----` ⇒ **aucun certificat/clé TLS de test committable** ; Node ne fabrique pas de X.509 sans openssl (G0 fait 8). `:49-51` couvrent chainstack/p2pify/wss ; `:55` `Bearer …{16,}` ; `:58` `*_API_KEY=…`. `SMTP_PASS` n'entre jamais dans le dépôt.
12. **[lu, gate] `vocab-banned.json` scope `sentinel`** (`:107-121`) — `dirs:[apps/sentinel/src, apps/sentinel/test]` (`.ts`) + `files[]` (`:111`) incluant `deploy/monark-sentinel.{service,timer}`, **`deploy/monark-probe.{service,timer}`, `scripts/probe-narabi.mjs`, `test/probe-narabi.test.ts`** (ajoutés en -1b-i). Banni dans ce scope (`:113-118`) : `adaptive (cover|guarantee|region|gate)`, `(coverage|region|gate) adapt`, `\bcascade\b`, `(Λ|lambda)=0`, `would have alerted`, `reference price`. **NE SONT PAS bannis dans ce scope** : `partner`, `autonomous`, `guarantee`, `verified`, `score`. Piège mesuré : `apps/sentinel/src` (dans le walk) **utilise « scores » partout** (`timeline.ts:70,180`) ⇒ **on ne peut PAS ajouter `\bscore\b` au scope `sentinel`** (il rougirait le tracker). Ces mots (bannis en scope `bell` `:128-131` et `site/harness/skills`) sont policés dans le MAIL par un test DÉDIÉ, jamais par le walk.
13. **[lu, RUNBOOK] `F:\Monark-wt-narabi1b\docs\RUNBOOK-sentinel.md`** — `:186-191` §« Sonde externe — pli NARABI-OPS-1b » dit encore **« deferred to pli NARABI-OPS-1b »** (`:189`) ; `:124-130` §6 dit **« archiving from `main` HEAD … never from a lot worktree branch »** (`:129-130`) ; `:82-91` = pose d'un secret par **ssh STDIN** + vérif **sha256 des deux côtés** (jamais `cat` distant, jamais `set -x`) ; `:118` `curl -sI …/narabi/state.json`. La divergence branche `main HEAD` vs branche d'intégration est **réconciliée** par le doute-3 (`PLI…:183` / adjudication) : L-5 amende §6 en « commit fusionné de la branche d'intégration, par SHA consigné au JOURNAL ; jamais une branche de lot » (ratifié par **décision 72**, `CHANTIERS.md:211`).
14. **[lu, ADR] `F:\Monark\docs\adr\ADR-NARABI-OPS-1.md`** table des tuyaux (`:75-82`) : ligne `timeline → probe → narabi.json` État **« absent — pli NARABI-OPS-1b »** (`:81`) ; ligne `probe → alerte` État **« upcoming »**, déclencheur « investor picks the channel » (`:82`). §Deferral of L-5 `:84-104` (spec de reprise).
15. **[lu, décisions] `F:\Monark\docs\CHANTIERS.md`** — **58** (`:121`) « canal d'alerte mail » : alerte par e-mail si `lag_days>0` ou chaîne rompue ; identifiants hors dépôt (`/etc/monark/probe.env`, `0640`) ; **« Déclencheur upcoming → built de la sonde = premier mail reçu sur un lag réel ou simulé »**. **65** (`:170`) relais = Hostinger. **66** (`:177`) boîte dédiée Hostinger ; **close** (`:190`) : **`ALERT_TO = narabialerts@monarkgate.tech`** (plan « Standard Business Email », exp. 2026-10-20 ; **l'investisseur a saisi le mot de passe lui-même**). **72** (`:211`, verbatim « déploiement accordé narabo ») : **GO de déploiement accordé d'avance**, s'exécute après G7 + checkpoint-2 de -1b-i ET -1b-ii, archive du commit fusionné **par SHA**, **secret SMTP posé par l'investisseur par stdin** (l'orchestrateur annonce le créneau et donne la commande) ; **vaut ratification de RUNBOOK §6 « commit fusionné de la branche d'intégration, par SHA »**. **75** (`:212`) une seule fenêtre publique au release, **release gate = zéro dette**, cartographie totale avant release. E-1/E-2/E-3 répondues (`:188`) ; SPF posé, DNS `monarkgate.tech` clos (`:192` : MX/DKIM×3/DMARC `p=none` en place, `ALERT_TO=narabialerts@monarkgate.tech`).
16. **[lu, biblio] `F:\Monark\docs\biblio\narabi\L-lecture-hostinger-smtp-2026-09-20.md`** (chercheur `claude-sonnet-5`) — `smtp.hostinger.com` ; **465 « SSL »/TLS implicite = PRIMAIRE** (table off.), 587 STARTTLS = repli documenté ; **TLS ≥ 1.2 obligatoire, déjà en vigueur** (rejet TLS 1.0/1.1 depuis le 2026-03-30) ; `SMTP_USER` = **adresse complète** ; **mécanisme AUTH (LOGIN/PLAIN) NON DOCUMENTÉ** par une source primaire (§1, item à confirmer au 1er mail) ; **Business Standard = 3 000/jour sortant** (fenêtre glissante 24 h) ; envoi programmatique **inclus** (« Agentic Mail ») ; From=To même domaine **s'aligne** (DKIM/SPF auto, DMARC `p=none`) ; code SMTP numérique de rejet **non publié** par Hostinger.

---

## 1. Item 1 — L-5 (docs) assigné nommément à -1b-ii — **TRANCHÉ (livrable L-6)**

Livrable **L-6** (docs, exclus R-25), sur `lot/etude-suite` post-fusion, échéance **« avant le go de déploiement »** :

1. **`docs/adr/ADR-NARABI-OPS-1.md` — amendement daté** de la table des tuyaux (`:75-82`) :
   - ligne `timeline → probe → narabi.json` (`:81`) : État « absent — pli NARABI-OPS-1b » → **« code + test non-LLM (-1b-i, gelé) ; wired at deploy ; `upcoming` jusqu'au premier mail (décision 58) »** ; déclencheur = « pli NARABI-OPS-1b-i fusionné ».
   - ligne `probe → alerte` (`:82`) : État « upcoming », « investor picks the channel » → **canal FIXÉ = mail SMTP (décisions 58/65/66)** ; Entrée = `narabi.json` (transition d'état) ; Sortie = message `MAIL/RCPT/DATA` sur le relais Hostinger → boîte `narabialerts@monarkgate.tech` ; État **`upcoming → built` au premier mail réel** ; test = `probe_alert_composition_from_fixture`.
2. **`docs/RUNBOOK-sentinel.md`** :
   - **flip `:189`** « deferred to pli NARABI-OPS-1b » → « **assigné à NARABI-OPS-1b-ii ; détection livrée par -1b-i (gelée)** » ; §Sonde externe (`:186-191`) étoffé : commande de déploiement, unités, secret par stdin.
   - **résiduel en toutes lettres (C-10)** : « **sonde morte = silence : aucune alerte ne part si le VPS Bell ou la sonde meurt, tant que l'item dead-man (E-1, surveillance croisée à T-1b) est ouvert** ».
   - **amendement §6 par SHA** (fait 13) : « déploiement = archive du **commit fusionné de la branche d'intégration `lot/etude-suite`, désigné par SHA consigné au JOURNAL** ; jamais une branche de lot ; jamais `main HEAD` sans passer par ce commit » — ratifié décision 72.
3. **`docs/PLI-lot-narabi-ops-1b-ii.md`** (le PLI du worker G1, non ce document) : R-25 par livrable, sha, oracles rejoués, items formés.

*Preuve C-D-2 (checkpoint-2 delta)* : au G7, `grep "deferred to pli NARABI-OPS-1b" docs/RUNBOOK-sentinel.md` = **0** ; table des tuyaux ADR + §6 amendés par SHA ; blocs CHANTIERS/JOURNAL portés. **Test/mutant** : n-a (docs, `.md` exclus R-25 ; lang-gate anglais dans `deploy/`,`scripts/`).

---

## 2. Item 2 — `digest == digest_T` (déclencheur échu, re-formé) — **TRANCHÉ = INCLUS en -1b-ii (design + test), oracle committé**

*Conception.* En **mode URL seul**, la sonde fait un **2ᵉ GET borné** de `/narabi/state.json` (env `PROBE_STATE_URL`, défaut = `PROBE_URL` avec le basename remplacé par `state.json`), parse, et vérifie **`state.digest === dernière_ligne_timeline.digest_T`** (invariant fait 5, VÉRIFIÉ). Divergence ⇒ **nouveau `reason:"state_mismatch"`** (unhealthy). Détecte une **publication partielle** (fait 6 : crash entre `run.ts:188` et `:191`) qu'un simple contrôle de fraîcheur/chaîne du seul `timeline.jsonl` ne voit pas.

*Bornes propres (advisor #1, BLOQUANT RSS/timeout).* Le 2ᵉ GET a **ses PROPRES bornes** : `STATE_MAX_BYTES` petit (**64 Kio** ; `state.json` réel ≈ 300 o, `narabi-snapshot.ts:22`) et un `STATE_TIMEOUT_MS` court — pour (a) ne pas laisser **deux corps de 8 Mio** en vol dépasser `MemoryMax=128M` (garde l'assertion `k=13` honnête, fait 10), et (b) borner le pire-cas de démarrage (voir item 3 / advisor #1). Réutilise `urlTransportAllowed` + `fetchTimeline` (garde loopback + `redirect:"manual"` + réessai borné).

*Précédence.* cannot-evaluate (`insecure_url`/`unreachable`/`too_large`/`probe_error`) > `chain_broken` > **`state_mismatch`** > `lag`.

*Mode `--file` (advisor #3, BLOQUANT).* En mode `--file`, **PAS de state.json requis** : un nouvel `--state-file` OPTIONNEL injecte un `state.json` local pour le test ; absent ⇒ `state_checked:false`, **aucun `state_mismatch` possible** — les 8 sous-cas `--file` de `probe_narabi_detects_lag` (-1b-i) restent VERTS sans changement.

*Défaut d'accessibilité du 2ᵉ GET* → **Q4** (voir §Questions) : `unreachable` (le surface est un tout) vs best-effort `state_checked:false`.

*Test NOMMÉ* : **`probe_state_digest_cross_check`** — oracle = paire committée `NARABI_SNAPSHOT` (`state.digest 9b5f89fd… === dernière ligne digest_T`) servie sur deux serveurs loopback ⇒ healthy ; `state.json` au digest trafiqué **en scratch** ⇒ `state_mismatch` ; mode `--file` sans `--state-file` ⇒ `state_checked:false`, pas de `state_mismatch`. *Mutant imposé* **M-ii-9** : cross-check sauté ⇒ state trafiqué passe ⇒ **RED**.

*Item connexe formé (pas inclus)* : **mémoriser le dernier `line_hash`** (anti-réécriture, C-9 ii) — subsumé partiellement par le digest cross-check (une réécriture de la dernière ligne change son `digest_T` ⇒ `state_mismatch`) ; une réécriture d'un jour du MILIEU reste hors portée des deux ⇒ **item formé** (voir §8, Q6).

---

## 3. Item 3 — `TimeoutStartSec` de `monark-sentinel.service` + test de cohérence INTER-UNITÉS — **TRANCHÉ (paramétré par D)**

*Constat (fait 8)* : `monark-sentinel.service` est `Type=oneshot` **SANS** `TimeoutStartSec` — aucune borne structurelle de départ d'un run publiant.

*Livrable* : **ajouter `TimeoutStartSec=<T_s>` à `monark-sentinel.service`** (édité dans -1b-ii, il est déjà sous le scope `sentinel` de `vocab-banned.json:111`). Contrainte **paramétrée par la mesure D** (D = durée horloge d'un run PUBLIANT, mesurée par l'orchestrateur après 00:30 UTC le 2026-09-21 ; **je n'estime pas D**) :
- **T_s > D** (avec marge) — sinon un run publiant sain serait tué avant `run.ts:190-191`.
- **cohérence inter-unités** : `DEADLINE_instant ≥ (dernier créneau sentinel 09:30) + RandomizedDelaySec (1800 s) + T_s`, soit `DEADLINE_UTC_MINUTES ≥ 570 + 30 + T_s/60`.
- Branche **10:30 conservé** (critère checkpoint : D ≤ 600 s) ⇒ `630 ≥ 600 + T_s/60` ⇒ **T_s ≤ 1800 s** ; comme D ≤ 600, `T_s ∈ (D, 1800] s` (ex. 900 s, à fixer une fois D lu).
- Branche **DEADLINE déplacé** (D > 600 s ⇒ nouvelle échéance = 10:00 + 3D arrondie au quart d'heure sup., checkpoint-2 clause (c)) ⇒ `T_s ∈ (D, 3D]`. **Un déplacement de DEADLINE est un delta sur 3 fichiers** (`probe-narabi.mjs:37`, `monark-probe.timer` 3 tirs, oracles de test) + relecteur Opus 4.8 séparé + note checkpoint-2 delta (checkpoint-2 -1b-i `:15,:22`, `PLI…:297`) — le `T_s` du sentinel est **couplé** à cette re-dérivation.

*Test NOMMÉ* : **`probe_sentinel_timeoutstartsec_inter_unit_coherence`** — lit `monark-sentinel.timer` (dernier `OnCalendar` + `RandomizedDelaySec`), `monark-sentinel.service` (`TimeoutStartSec`) et la constante `DEADLINE_UTC_MINUTES`, asserte l'inégalité ci-dessus **explicitement en UTC**. *Mutant imposé* **M-ii-13** : `TimeoutStartSec` du sentinel porté au-delà de la borne (ex. 1900 s à DEADLINE 10:30) ⇒ **RED**.

*Risque MAST (advisor, non bloquant)* : si `T_s` fire au milieu de l'append `run.ts:188-191`, l'écriture peut se **déchirer** (l'atomicité y n'est pas établie dans ce qui a été lu) ⇒ choisir `T_s` **bien** au-dessus de D ; consigné en §Risques.

---

## 4. Item 4 — Réessai GET : mutant survivant `attempt <= retries + 1` à `probe-narabi.mjs:246` — **TRANCHÉ (test tueur + réessai différencié)**

*Analyse du mutant (fait 3).* Le survivant `attempt <= retries + 1` fait **un essai de plus** que voulu. Un serveur « échoue N fois puis sert » ne le distingue PAS si N ≤ retries (les deux réussissent au même essai). Il ne se manifeste que quand la sonde **épuise** ses essais : réel = `retries+1` essais puis abandon ; mutant = `retries+2` essais.

*Test NOMMÉ tueur* : **`probe_get_retries_exactly_n_plus_one`** — serveur loopback `node:http` qui **échoue exactement `retries+1` fois** (503/fermeture) **puis servirait** au `(retries+2)`ᵉ contact ; compteur `hits` côté serveur :
- **réel** : abandonne à `retries+1` essais ⇒ `reason:"unreachable"`, **`hits === retries + 1`** (n'atteint jamais le service).
- **mutant `attempt <= retries + 1`** : un essai de plus ⇒ atteint le service ⇒ `status:"healthy"`, `hits === retries + 2` ⇒ **RED**.
- **réessai différencié** : sous-cas `PROBE_RETRIES=0` (⇒ **1 hit**, `unreachable`) ET `PROBE_RETRIES=2` (⇒ **3 hits**, `unreachable`) — chacun porteur (calque du compteur `okHits` `test:309-329`). *Mutant imposé* **M-ii-10**. (Le tueur N4 de -1b-i — `attempt < retries` — reste couvert par le sous-cas `retries=0`, `PLI…:273`.)
- **port fermé côté GET (Doute-1)** : sous-cas listener loopback **fermé** (ECONNREFUSED immédiat, distinct du hang) ⇒ `unreachable` borné, `hits === 0`.

*Clarification de traçabilité (Doute-1, R-21).* L'adjudication `G0…:181` a nommé UN test C-3 `probe_unreachable_closed_port_and_timeout` ; -1b-i ne l'a pas livré tel quel (`probe_get_over_loopback_http_executes` couvre le **hang**-timeout GET, pas un port fermé). Ce nom se **SCINDE par transport** : GET hang-timeout = `probe_get_over_loopback_http_executes` (-1b-i, existant) ; **GET port-fermé** = sous-cas ci-dessus ; **SMTP port-fermé + timeout** = `probe_smtp_unreachable_closed_port_and_timeout` (item 6). Scission déclarée pour qu'un validateur greppant le nom Doute-1 ne tombe pas sur le mauvais transport (défaut C-D-3 évité).

*Rattachement* : cet item est le mutant GET survivant re-déclenché en -1b-ii (C-D-3) ; il vit dans le lot -1b-ii même si le transport SMTP est conçu à part (le réessai GET reste à couvrir).

---

## 5. Item 5 — VALEUR : un `probe_error` d'une panne d'E/S LOCALE déclenche-t-il un mail ? — **FORMÉ = Q1 (décision investisseur, défaut orchestrateur recommandé)**

*Cadrage exact (advisor #4).* `probe_error` naît en **deux moments distincts** (fait 4), et l'ordre d'exécution de -1b-ii (item 7 : évaluer → décider l'envoi → envoyer → 250 → écrire `narabi.json`) est décisif :
- **voie evaluate (ALERTABLE)** : `:292`/`:294` (corps timeline illisible — vrai signal Narabi) et `:346` (`--now` invalide). Ces `probe_error` sont **connus AVANT la décision d'envoi** ⇒ Option A peut les mailer.
- **voie écriture (NON alertable le run même)** : `:369` (faute disque au `renameSync`). Le repli `:370` mute l'état en `probe_error` **APRÈS** que l'envoi a déjà été décidé sur l'état évalué (possiblement `healthy`) ⇒ **aucun mail ne part pour la faute disque ce run-là**, et le run suivant lit `prev.alerted=false` ⇒ pas de rétablissement non plus. De plus, sous faute disque, `last_alert_day` **ne peut pas être persisté** (repli best-effort) ⇒ si un rappel partait, le plafond « 1/jour » dégraderait à **≤ 3/jour** (les 3 tirs).

*Options.*
| # | Politique | Pour | Contre |
|---|---|---|---|
| A | `probe_error` **voie evaluate** → **mail** ; faute disque `:369` = journal/exit-1 seul (résiduel) | échec d'évaluation silencieux = exactement ce que le lot combat ; ne touche PAS le test -1b-i ; ordre inchangé | la faute disque `:369` reste sans mail ce run-là (résiduel déclaré) |
| A′ | comme A **+** tenter un envoi sur la faute `:369` (post-faute, SANS persistance) | couvre aussi la faute disque | ≤ 3 mails/jour sous faute persistante (borne dégradée, ≪ 3 000/j) ; ordre send↔write à réorganiser |
| B | `probe_error` → **PAS de mail** (journal/systemd seul) | zéro bruit sur incident local | une sonde qui ne peut plus évaluer devient **muette** — le mode d'échec que ce lot existe pour empêcher |
| C | **Scinder** `probe_error` distant vs local | ciblage fin | **touche le test -1b-i** `probe_io_fault_cleans_tmp_and_falls_back` (`test:499`) ⇒ delta à déclarer (Q7) |

*Recommandation* : **Option A** — alerter sur le `probe_error` de la voie **evaluate** (le seul disponible avant l'envoi, sans réorganiser l'ordre ni toucher le test -1b-i), **déclarer la faute disque `:369` comme résiduel journal/exit-1** (bornée, la surveillance croisée E-1/T-1b + le contrôle manuel du journal la couvrent). C'est cohérent avec E-1 « sonde morte = silence » sans sur-promettre : la sonde n'alerte que quand elle **peut** (voie evaluate). Ne pas scinder `probe_error` (Q7).

*Nature de la décision* : **valeur → escalade INVESTISSEUR** (elle change ce qui arrive dans SA boîte, comme E-3) avec **défaut orchestrateur** = Option A si non tranchée avant le code L-1. `error_origin` orchestrateur si renversée. **Q1**.

---

## 6. Item 6 — Transport SMTP : client built-ins vs dépendance ; secret ; TLS — **TRANCHÉ (built-ins, R-8) + déviation TLS déclarée**

*Décision R-8 (fait 1)* : **client SMTP en built-ins Node** (`node:tls` pour le SMTPS 465 implicite, `node:net` pour le plaintext-loopback de test, `node:crypto` déjà importé `:16`), **AUCUNE dépendance nouvelle**. Arguments (R-8) : (a) `package.json` n'a **aucune** dépendance runtime — nodemailer serait la première + une surface supply-chain ; (b) **Bell n'a pas de `npm`** (fait 1) — un seul `.mjs` déployé ; (c) la conversation nécessaire est **minimale** (EHLO / AUTH / MAIL FROM / RCPT TO / DATA / QUIT sur TLS implicite 465) ; (d) `node:tls` **vérifie le certificat par défaut** (`rejectUnauthorized` défaut `true`) et négocie **TLS ≥ 1.2 par défaut** — aligné sur Hostinger (fait 16) **sans** dépendance ; (e) contre les built-ins : SMTP fait main est délicat (injection, dot-stuffing, parse des réponses) — **mitigé** par les tests C-7/AUTH ci-dessous et par le périmètre étroit (465 implicite seul ; **pas** de machine STARTTLS — un mode d'échec MAST de moins).

*Sécurité TLS (à épingler, G2 C-11)* : `tls.connect({ host, port:465, servername: host, minVersion:"TLSv1.2", rejectUnauthorized:true })` ; **jamais** `rejectUnauthorized:false`, **jamais** `NODE_TLS_REJECT_UNAUTHORIZED=0` ; timeouts socket + connexion bornés par une **constante exportée plafonnée `MAX_SMTP_TIMEOUT_MS`** (calque `MAX_TIMEOUT_MS` `:54`), pour que `probe_timer_multiple_shots` calcule le pire-cas de démarrage `GET₁+GET₂+SMTP+marge` **depuis les constantes** (advisor #1) ; aucune redirection (SMTP n'en a pas ; connexion bornée). `SMTP_USER` = adresse complète (fait 16).

*AUTH (advisor #6)* : Hostinger ne documente PAS le mécanisme (fait 16) ⇒ implémenter **`AUTH PLAIN` ET `AUTH LOGIN`**, **négociés depuis la réponse EHLO** ; parser les **continuations multi-ligne `250-`** (le factice les émet). Une branche AUTH non exercée serait du code non branché (règle Branchement) ⇒ les deux sont exercées par un factice qui n'annonce qu'un mécanisme à la fois.

*Secret — jamais dans le dépôt ni en argument CLI.* Lu d'un fichier d'environnement systemd **`EnvironmentFile=/etc/monark/probe.env` (SANS `-`, C-8)** posé par l'investisseur **par ssh STDIN** (calque `RUNBOOK-sentinel.md:82-91`, décision 72), vérifié par **sha256 des deux côtés**, jamais `cat` distant, jamais `set -x`, jamais vu par un agent. `SMTP_PASS` **jamais imprimé** (ni stdout/stderr, ni `narabi.json`, ni journal) ; le **corps AUTH** (base64) n'est jamais journalisé.

*Alternative `LoadCredential=` (comparaison, advisor + item 6).*
| Critère | `EnvironmentFile=/etc/monark/probe.env` | `LoadCredential=smtp_pass:/etc/monark/probe-smtp-pass` |
|---|---|---|
| Où vit le secret | variable d'environnement du process | tmpfs `$CREDENTIALS_DIRECTORY/smtp_pass`, hors env |
| Exposition | lisible via `/proc/PID/environ`, hérité par les enfants | **pas dans l'env**, pas hérité, isolé par service, nettoyé |
| `systemctl show -p Environment` | ne montre PAS les valeurs `EnvironmentFile` | n'expose rien |
| Prérequis | universel | systemd ≥ 247 (**[abs]** ; Bell Ubuntu 26.04 ⇒ vraisemblable ; à confirmer `systemctl --version` au déploiement) |
| Cohérence projet | **calque du sentinel** `/etc/monark/sentinel.env` + flux « investisseur pose par stdin » (déc. 72) | nouveau motif ; scinderait `SMTP_PASS` du reste des `SMTP_*` |
| Impact code | `process.env.SMTP_PASS` | lire un fichier `$CREDENTIALS_DIRECTORY/smtp_pass` |

*Recommandation* : **`EnvironmentFile` par défaut** (décision de session 72 + précédent sentinel + un seul flux stdin pour tous les `SMTP_*`) ; **`LoadCredential` = item de DURCISSEMENT formé** (le mail est plus sensible que l'URL Chainstack ⇒ « secret hors env » a de la valeur) → **Q2**.

*Test de fuite NOMMÉ* : **`probe_secret_never_printed`** (C-3) — `SMTP_PASS` **absent** de stdout/stderr/`narabi.json`, présent **seulement** dans la commande AUTH sur le fil du factice ; **fuite par longueur/motif** : aucune ligne de log ne contient le mot de passe brut **ni son base64** (même tronqué) ; `ALERT_TO` absent de stdout/`narabi.json` (sur le fil dans `RCPT TO` seul). *Mutant imposé* **M-ii-3** (secret imprimé ⇒ RED). *TLS* : **`probe_smtp_tls_options_pinned`** (le connecteur par défaut construit `minVersion TLSv1.2` + `rejectUnauthorized:true` + `servername=host` ; mutants **M-ii-7** `rejectUnauthorized:false` ⇒ RED, **M-ii-12** `minVersion` retiré ⇒ RED). *AUTH* : **`probe_smtp_auth_plain_and_login`** (factice annonçant PLAIN seul ⇒ client PLAIN ; LOGIN seul ⇒ client LOGIN ; multi-ligne `250-` parsé ; mutant **M-ii-11** parseur mono-ligne ⇒ RED).

*Déviation déclarée (R-21) vis-à-vis du littéral « TLS de test » de la mission* : **fact 8/11 — aucun certificat X.509 committable, Node ne self-signe pas en built-ins**. Donc la **conversation SMTP est exercée en PLAINTEXT sur loopback** (`SMTP_TLS=none` **REFUSÉ sauf hôte ∈ {127.0.0.1, ::1, localhost}**, même garde que `http` loopback, fait 10) via un **factice `node:net`** ; les **options TLS** (465 implicite) sont épinglées par un **test pur du connecteur injecté** (`probe_smtp_tls_options_pinned`, sans handshake réel) ; le **handshake TLS réel** sur `smtp.hostinger.com:465` est un **item de déploiement** (mail de test, go investisseur ; lecture SMTP items 1-6). Variante « cert openssl éphémère au runtime pour un vrai TLS loopback en CI » = **Q3** (le CI Linux a openssl, l'hôte dev Windows non garanti ⇒ non retenue par défaut, pour le déterminisme).

---

## 7. Item 7 — Rappel quotidien (E-3), machine à états, anti-tempête, contenu — **TRANCHÉ**

E-3 = **rappel quotidien** (répondu investisseur, fait 15). `narabi.json` passe **schema 2** (Doute-4) : schema 1 + `{ alerted:boolean, alert_error:string|null, last_alert_day:string|null (UTC YYYY-MM-DD), state_checked:boolean }`.

*État — où il vit, atomicité, crash, fuseau.* `last_alert_day` vit dans `narabi.json` (l'unique état de la sonde, `:27-28`), écrit **atomiquement** par le `temp + renameSync` existant (`:357-363`). **Fuseau : UTC strict** (`floor` UTC de `checked_at`, réutilise `expectedLastDay`/`toISOString().slice(0,10)`, `:132`). **Ordre d'écriture (C-2, advisor #5)** : `alerted:=true` **ET** `last_alert_day:=jour UTC courant` **seulement APRÈS DATA 250** ; un envoi échoué **laisse les deux intacts** ⇒ le tir suivant du même jour **réessaie** ; rétablissement ssi `healthy && prev.alerted`, puis `alerted:=false`, `last_alert_day:=null` (après 250 du mail de rétablissement).

*Comportement au crash (résiduel déclaré, R-21).* Crash **entre** le DATA 250 et le `renameSync` de `narabi.json` ⇒ le repli best-effort `:370` peut ne pas mémoriser `last_alert_day` ⇒ le tir suivant du même jour peut ré-envoyer **un** rappel. **Double borné à ≤ +1/jour** (rare, ≪ 3 000/j) : impossibilité d'un exactly-once sans transaction ; C-2 (« jamais perdue ») impose l'at-least-once. Résiduel déclaré, non une dette.

*Anti-tempête / rappel — DEUX prédicats explicites (advisor).*
- (i) **alerte** ssi `unhealthy && !alerted` → envoi (première détection OU réessai du même jour après un envoi échoué, C-2) ;
- (ii) **rappel** ssi `unhealthy && alerted && jour_UTC_courant > last_alert_day` → envoi (une fois par nouveau jour UTC de panne).

Dans le MÊME jour UTC, les tirs 12:30/16:30 **n'envoient rien** (prédicat (ii) faux). Un **changement de `reason`** en restant `unhealthy` le même jour ⇒ **0 mail** (C-3, ni (i) car `alerted`, ni (ii) car même jour). Machine **pilotée par l'état + le jour UTC** (pas par l'ordre des tirs). **Plafond prouvé ≤ 2 mails/jour UTC** (1 rappel + au plus 1 rétablissement) ⇒ ≪ 3 000/jour (fait 16) — pas de compteur d'envois séparé (le plafond découle des prédicats, asserté par le test).

*Rétablissement = 1 mail « recovered »* : oui, sur transition →healthy (C-2), puis silence.

*Repli port 587.* **Item formé** (Q6 tranché en -1b : « 465 TLS implicite SEUL dans ce lot ; repli 587 STARTTLS = item, déclencheur "465 refusé au mail de test" »). **Non codé en -1b-ii** (pas de code mort STARTTLS non testé ; règle Branchement). Les env `SMTP_PORT`/`SMTP_TLS` sont lus, donc un 587 futur est un petit ajout.

*Contenu du mail.* **Sujet CONSTANT** (C-7) ; **corps** = champs `reason`, `last_day`, `lag_days`, `chainstack_present`, `provider`, `checked_at` (aucun secret, **aucune URL à clé** — les endpoints publiés sont déjà expurgés, fait 14/D4). **Aucun mot interdit** : ni `partner`, `autonomous`, `guarantee`, `verified`, `score`, ni le vocabulaire du scope `sentinel` (`cascade`, `would have alerted`, `reference price`, `adaptive …`, fait 12). **Mécanisme (fait 12)** : PAS d'ajout de `\bscore\b` au walk `apps/sentinel/src` (rougirait « scores » du tracker) ⇒ un **test DÉDIÉ** sur le mail composé. Test NOMMÉ **`probe_alert_mail_has_no_forbidden_vocab`** : le sujet + le corps composés pour **chaque** `reason` ne contiennent aucun de `/partner|autonomous|guarantee|verified|score/i` **ni** les patterns du scope `sentinel`.

*Dead-man (« sonde morte = silence »).* **Résiduel déclaré** au RUNBOOK (item 1 / L-6) — E-1 répondu = surveillance croisée à **T-1b** + contrôle manuel du journal par l'orchestrateur d'ici là. **Heartbeat hebdomadaire = OPTION formée** sous l'item E-1 (déclencheur : si l'investisseur préfère un heartbeat à la surveillance croisée) — **non codé en -1b-ii** (time-driven, casse « pilotée par l'état », bruit d'inbox ; E-1 déjà répondu). **Q8**.

*Tests NOMMÉS (item 7)* : **`probe_alert_daily_reminder_once_per_utc_day`** (3 tirs le même jour UTC ⇒ 1 mail ; jour suivant toujours en panne ⇒ 1 rappel — mutant **M-ii-8** « rappel à chaque tir » ⇒ RED, « aucun rappel » ⇒ RED) ; **`probe_alert_reason_change_same_day_no_mail`** (lag→chain_broken même jour UTC ⇒ 0 mail — mutant **M-ii-2** ré-alerte sur `reason` ⇒ RED) ; **`probe_reads_schema1_state_without_crash`** (Doute-4 mandaté : un `narabi.json` schema 1 laissé par une sonde -1b-i déployée est lu comme bootstrap `alerted:false`, sans crash, ré-écrit schema 2).

---

## 8. Item 8 — `health.json`, `STUB_SRC`, couplage ordre-de-hash, dernier `line_hash`, RSS Linux, preuve Linux fuseau/`--import` — **classés un par un**

| Sujet | Verdict | Détail (déclencheur + propriétaire) |
|---|---|---|
| **`health.json`** (Q1 du G0) | **ITEM FORMÉ** (pas -1b-ii) | touche `run.ts` + redéploiement live du site (hors périmètre) ; déclencheur : 1er incident qu'un créneau FATAL sur jour sain (`run.ts:201`) aurait masqué ; propriétaire orchestrateur |
| **`STUB_SRC`** (stub `fetch` ~40 l. copié de `sentinel-retry.test.ts` dans `test/probe-narabi.test.ts`, `:226`, couplage C-5) | **ITEM FORMÉ** (pas -1b-ii par défaut) | factoriser en helper partagé rougirait/toucherait `sentinel-retry.test.ts` (gelé sauf L-4) ; les tests -1b-ii utilisent un **factice SMTP `node:net`**, pas ce stub ; déclencheur : toute évolution du stub ; propriétaire orchestrateur |
| **Couplage ordre-de-hash dupliqué** (sonde vs `timeline.ts hashedFields`, 31 champs) | **ITEM FORMÉ** (garde vivante) | `probe_hashed_fields_order_equals_sentinel` rougira au prochain rejeu si l'ordre dérive ; déclencheur : toute évolution de `timeline.ts` ; propriétaire orchestrateur |
| **Dernier `line_hash`** (anti-réécriture, C-9 ii) | **ITEM FORMÉ** | partiellement subsumé par le digest cross-check (item 2) ; une réécriture d'un jour du milieu reste hors portée ; **inclure en -1b-ii SEULEMENT si R-25 le permet** après le client SMTP ; déclencheur -1b-ii ; propriétaire worker/orchestrateur → **Q6** |
| **RSS Linux** (8 Mio ⇒ pire GET ~100 MiB, 22 % sous `MemoryMax=128M` ; kill cgroup Linux INFÉRÉ, C-V-3) | **ITEM FORMÉ** (non recodé en -1b-ii) | confirmer au **premier run DÉPLOYÉ** (pas d'OOM : `journalctl -u monark-probe`/`systemd-cgtop`) ; propriétaire orchestrateur ; déclencheur : premier run déployé. **-1b-ii doit re-vérifier le budget RSS** vu le 2ᵉ GET (item 2 : cap petit `state.json`) — advisor #1 |
| **Preuve Linux fuseau CI-UTC + injection `--import` de `renameSync`** | **ITEM FORMÉ** | non mesurable sur l'hôte Windows ; = **premier run CI** sur le commit -1b-ii plié (même précédent C-G2-2 / C-G2D-2) ; propriétaire orchestrateur ; déclencheur : premier run CI |

---

## 9. Item 9 — Tuyaux (règle de Branchement) — **DÉCLARÉS + test d'intégration NON-LLM**

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM (compo. EXÉCUTÉE depuis l'artefact réel) |
|---|---|---|---|---|
| décision → mail SMTP | `narabi.json` (transition d'état, schema 2) écrit par la **vraie sonde** (-1b-i) | message `MAIL FROM`/`RCPT TO`/`DATA` sur le relais → boîte `narabialerts@monarkgate.tech` | code + test non-LLM ; **`upcoming → built` au PREMIER MAIL RÉEL** (décision 58) | **`probe_alert_composition_from_fixture`** (ci-dessous) |
| surface `state.json` → cross-check | `state.json` publié (`run.ts:189-191`) | `narabi.json` `{state_checked, reason:"state_mismatch"?}` | code + test non-LLM ; `upcoming` jusqu'au 1er mail | `probe_state_digest_cross_check` (oracle `NARABI_SNAPSHOT`) |

*État de registre.* **Rien n'est déclaré « built »** avant le premier mail réel (décision 58, CA-11 ; `fleet.ts` INTACT). La sonde reste un outil d'exploitation ; l'axe « test exécute la compo depuis l'artefact réel » (CA-11 durci) est **distinct** de l'axe « état de registre » (réconciliation C-5↔C-10). Ce qui reste **`upcoming` jusqu'au premier mail réel** : le tuyau `décision → mail`.

*Test NOMMÉ `probe_alert_composition_from_fixture` (CA-11 durci, BRANCHÉ)* : sous-processus de la **vraie sonde** avec `--file` = fixture timeline RÉELLE (`apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl`, last=2026-09-19) + `--now 2026-09-21T10:35Z` (expected=09-20 ⇒ `lag` ⇒ unhealthy) → la sonde **écrit un vrai `narabi.json`** ET, sur la transition →unhealthy, se connecte à un **factice SMTP `node:net` loopback** (`127.0.0.1:0`, plaintext-loopback autorisé) qui **capture `MAIL FROM`/`RCPT TO`/`DATA`** portant `ALERT_TO` + `reason` ; **re-run même jour UTC** ⇒ **0 nouveau mail** (prédicat rappel faux) ; **rétablissement piloté par l'état** (calque G0 L-2 : `--now 2026-09-20T10:35Z` sur l'état laissé `unhealthy` — expected=09-19 == last ⇒ `healthy` ; le temps « recule » en test, la machine est pilotée par l'état, `last_alert_day` ne gate PAS le rétablissement) ⇒ **1 mail de rétablissement** (`healthy && prev.alerted`) puis silence. La composition **EXÉCUTE depuis l'artefact réel** (le `narabi.json` produit par la vraie sonde ; une seule fixture suffit).

---

## 10. Item 10 — Livrables, tests, mutants, R-25, déploiement, MAST, questions

### 10.1 Livrables (liste fermée)
| # | Fichier | Contenu | Sous-lot |
|---|---|---|---|
| L-1 | `scripts/probe-narabi.mjs` (**machine à états + client SMTP**, même fichier) | schema 2 (`alerted`/`alert_error`/`last_alert_day`/`state_checked`) ; transitions →unhealthy/→healthy (C-2, ordre après DATA 250) ; rappel quotidien UTC (E-3) ; anti-tempête ; client SMTP built-ins `node:tls` (465 implicit, AUTH PLAIN+LOGIN, TLS≥1.2, cert vérifié, timeouts, assainissement CR/LF + dot-stuffing + sujet constant C-7) ; 2ᵉ GET borné `state.json` + `state_mismatch` (item 2) ; connecteur INJECTABLE (test) | -1b-ii-a |
| L-1′ | `scripts/probe-narabi.d.mts` (sidecar TS7016, consommé par le test racine) | **OBLIGATOIRE (typecheck G1)** : exports du client SMTP, signature `evaluate` élargie (nouvel argument `stateText`), type schema 2, `reason` gagne `"state_mismatch"` — **calque C-G2D-4** qui a dû ajouter `"insecure_url"` à `FetchResult` ; sans lui `tsc --noEmit` échoue | -1b-ii-a |
| L-2 | `test/probe-narabi.test.ts` (racine) | tests nommés ci-dessous ; **réconciliation des tests -1b-i hérités** (advisor #3 : transitions sur `--out` frais tentent un mail ⇒ injecter un factice SMTP loopback OU asserter `alert_error:"smtp_unconfigured"` explicitement ; vérifier qu'aucun `deepEqual` sur l'état complet ne casse) | -1b-ii-a |
| L-3 | `deploy/monark-probe.service` | `EnvironmentFile=/etc/monark/probe.env` **SANS `-`** (C-8) ; **`TimeoutStartSec` relevé** (advisor #1 : `GET₁+GET₂+SMTP+marge`, ex. 180 s — tirs à 2 h, marge gratuite) | -1b-ii-a |
| L-4 | `deploy/monark-sentinel.service` | ajout `TimeoutStartSec=<T_s>` paramétré par D (item 3) | -1b-ii-b |
| L-5 | `test/probe-narabi.test.ts` (inter-unités) | `probe_sentinel_timeoutstartsec_inter_unit_coherence` (item 3) ; MAJ `probe_timer_multiple_shots` (env obligatoire + nouveau `TimeoutStartSec` probe, advisor #1/#2) | -1b-ii-b |
| L-6 | docs (ADR tuyaux, RUNBOOK §Sonde/§6, PLI) | item 1 | -1b-ii |

### 10.2 Tests nommés (built-ins ; sous-processus + factices loopback)
`probe_alert_composition_from_fixture` (item 9, CA-11) ; `probe_alert_retries_until_delivered` (C-2 ; factice refuse run1 535/fermeture, accepte run2 ⇒ **exactement 1 mail** ; `alerted:=true` après 250 seul) ; `probe_alert_daily_reminder_once_per_utc_day` (E-3) ; `probe_alert_reason_change_same_day_no_mail` (C-3) ; `probe_secret_never_printed` (C-3, fuite longueur/motif) ; `probe_smtp_unreachable_closed_port_and_timeout` (C-3 côté SMTP, port fermé + timeout ⇒ `alert_error`, exit 1) ; `probe_smtp_injection_crlf_sanitized` (C-7, `\r\n.\r\nRCPT TO:<x>` ⇒ exactement 1 message, 1 destinataire, 0 commande injectée) ; `probe_smtp_unconfigured_is_noisy` (C-8, `SMTP_HOST` ou `ALERT_TO` manquant à une transition ⇒ `alert_error:"smtp_unconfigured"`, exit 1, `alerted:false`, pas de crash) ; `probe_smtp_refuses_plaintext_off_loopback` ; `probe_smtp_tls_options_pinned` (item 6) ; `probe_smtp_auth_plain_and_login` (item 6) ; `probe_state_digest_cross_check` (item 2) ; `probe_get_retries_exactly_n_plus_one` (item 4) ; `probe_reads_schema1_state_without_crash` (Doute-4) ; `probe_sentinel_timeoutstartsec_inter_unit_coherence` (item 3) ; `probe_alert_mail_has_no_forbidden_vocab` (item 7) ; `probe_timer_multiple_shots` MAJ (advisor #1/#2).

### 10.3 Mutants imposés (≥ 6 ; ici 13 — chacun RED puis restauré sha-exact, jamais `git checkout`)
M-ii-1 `alerted:=true` **avant** 250 ⇒ alerte perdue (C-2) ; M-ii-2 ré-alerte sur changement de `reason` même jour (C-3) ; M-ii-3 `SMTP_PASS`/base64 imprimé (C-3) ; M-ii-4 plaintext hors loopback admis ; M-ii-5 assainissement CR/LF retiré ⇒ commande injectée (C-7) ; M-ii-6 `smtp_unconfigured` silencieusement sauté (exit 0) (C-8) ; M-ii-7 `rejectUnauthorized:false` ; M-ii-8 « rappel à chaque tir » / « aucun rappel » (E-3) ; M-ii-9 cross-check digest sauté (item 2) ; M-ii-10 `attempt <= retries + 1` @`:246` (item 4) ; M-ii-11 parseur EHLO mono-ligne (item 6) ; M-ii-12 `minVersion` TLS retiré (item 6) ; M-ii-13 `TimeoutStartSec` sentinel > borne inter-unités (item 3).

### 10.4 Projection R-25 (pathspec `STAT=` `ci.yml:65` ; `docs/**/*.md` et `fixtures/**/*` exclus ; bande ×1,07–×1,7)
Base = `lot/etude-suite` **post-fusion -1b-i** (le compteur -1b-ii ne recompte PAS les ~1 094 lignes de -1b-i). Brut estimé : src `.mjs` (machine à états + SMTP 465/AUTH + 2ᵉ GET + state_mismatch) ~180-210 ; **sidecar `.d.mts` ~20** (L-1′) ; tests (factice SMTP `node:net` ~80 + composition ~40 + C-2/C-3/C-7/C-8 ~90 + TLS/AUTH ~40 + retry-count + port-fermé GET ~25 + digest cross-check ~25 + schema1 ~15 + inter-unités ~15 + vocab mail ~15) ~255-285 ; unités (`monark-probe.service` sans `-` + `TimeoutStartSec` ; `monark-sentinel.service` `TimeoutStartSec`) ~10. **Brut ~465-525 ⇒ ~500-895** — **sous le plafond 1 205**, possiblement au-dessus de la cible 700 en haut de bande.

**Seam interne CONTINGENT** (tiré SEULEMENT si le mesuré au gel dépasse le seuil d'alerte ~1 100, ou sur décision orchestrateur) : **-1b-ii-a = ALERTE** (machine à états + client SMTP + rappel quotidien + composition + C-2/C-3/C-7/C-8 + TLS/AUTH + retry-count GET + `monark-probe.service`) — c'est le mail, le déclencheur `upcoming→built` ; **-1b-ii-b = DURCISSEMENT DÉTECTION** (2ᵉ GET `state.json`/`state_mismatch` + `monark-sentinel.service TimeoutStartSec` + test inter-unités + `last_line_hash` si retenu). -1b-ii-b ne bloque pas le premier mail. Par défaut **un seul lot -1b-ii** ; **Q5**.

### 10.5 Plan de déploiement (SÉPARÉ ; orchestrateur seul ; décision 72 = GO d'avance ; le worker n'exécute JAMAIS)
S'exécute **après G7 + checkpoint-2 de -1b-i ET -1b-ii** ; **une seule campagne** (défaut ; un déploiement -1b-i anticipé = Doute-5, décidé au G7 de -1b-i).
1. **Bell** : `git archive` du **commit fusionné `--no-ff` de `lot/etude-suite`, par SHA consigné** (RUNBOOK §6 amendé, déc. 72 ; jamais une branche de lot) → `/opt/monark-probe/probe-narabi.mjs` (built-ins) + unités ; `ExecStart=/usr/bin/env node /opt/monark-probe/probe-narabi.mjs` ; `useradd --system probe` ; `install -d -o probe /var/lib/monark-probe`.
2. **Secret (ce que l'INVESTISSEUR fait lui-même)** : l'investisseur **pose `/etc/monark/probe.env` (`root:probe 0640`) par ssh STDIN** (calque `RUNBOOK:82-91`) — `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER=narabialerts@monarkgate.tech`, **`SMTP_PASS=<le mot de passe de la boîte qu'il a saisi lui-même, CHANTIERS:190>`**, `SMTP_TLS=implicit`, `ALERT_FROM=narabialerts@monarkgate.tech`, `ALERT_TO=narabialerts@monarkgate.tech` — vérifié par **sha256 des deux côtés**, jamais `cat`, jamais `set -x`, jamais vu par un agent. L'investisseur **confirme aussi le coût du plan Hostinger dans hPanel** (E-2 ; « 0 $ » suspendu tant que non lu). (SPF déjà posé, DNS clos, `CHANTIERS:192`.) L'orchestrateur **annonce le créneau et donne la commande** (déc. 72).
3. **Timer** : `systemd-analyze calendar` sur les `OnCalendar` (≥ 10:30) ; `enable --now` ; **run de simulation `--state <scratch>` + `--file` de lag** ⇒ **premier mail reçu** = déclencheur **`upcoming → built`** (décision 58) ; la production reste `healthy` (`narabi.json` de prod intact).
4. **Rétablissement** : un retour sain envoie **un** mail de rétablissement puis se tait.
5. **Confirmations orchestrateur au déploiement** (items ouverts) : URL sert **200 directement** (aucune 3xx, `redirect:"manual"`, item G2 -1b-i) ; **TLS 1.2+ réel sur 465** + **hostname erroné refusé** (jamais `rejectUnauthorized:false`) ; **mécanisme AUTH observé** (PLAIN/LOGIN, sans imprimer `SMTP_PASS`) ; **RSS pas d'OOM Linux** (C-V-3) ; **preuve Linux fuseau + `--import`** (premier run CI) ; en-têtes `Authentication-Results`/`DKIM-Signature`/`Received-SPF` du 1er mail (alignement From=To, lecture SMTP item 4).

### 10.6 Risques (MAST — checklist des 14 modes)
- **Alerte perdue à jamais sur échec SMTP** ⇒ C-2 at-least-once (`alerted:=true` après 250 seul, `alert_error`+exit 1) ; `probe_alert_retries_until_delivered`, M-ii-1.
- **Tempête d'alertes** ⇒ rappel quotidien UTC + anti-tempête (≤ 2 mails/jour prouvé) ; M-ii-2/M-ii-8.
- **Secret en log / dépôt** ⇒ `EnvironmentFile 0640` hors dépôt, jamais imprimé (mot de passe **ni** base64 AUTH) ; `no_secret_in_repo` ; aucun cert committé ; M-ii-3, `probe_secret_never_printed`.
- **Cert TLS non vérifié / downgrade** ⇒ `rejectUnauthorized:true` défaut + `minVersion TLSv1.2` + `servername` ; jamais `NODE_TLS_REJECT_UNAUTHORIZED` ; M-ii-7/M-ii-12 ; handshake réel = item déploiement.
- **Plaintext hors loopback** ⇒ garde loopback + `probe_smtp_refuses_plaintext_off_loopback` ; M-ii-4.
- **Injection SMTP (CR/LF depuis contenu distant)** ⇒ assainissement + dot-stuffing + sujet constant ; C-7, M-ii-5.
- **Config SMTP absente ⇒ muette** ⇒ `smtp_unconfigured` bruyant (exit 1) ; C-8, M-ii-6.
- **AUTH mal négocié (Hostinger non documenté)** ⇒ PLAIN+LOGIN + parse `250-` ; M-ii-11 ; réel confirmé au déploiement.
- **Sonde muette (dead-man)** ⇒ résiduel « sonde morte = silence » (RUNBOOK) + E-1 croisée à T-1b ; heartbeat = option formée (Q8).
- **Double-envoi sur crash entre 250 et persist** ⇒ résiduel déclaré, borné ≤ +1/jour.
- **`probe_error` local dégrade le plafond à ≤ 3/jour** ⇒ Q1 (option A recommandée, résiduel déclaré).
- **`TimeoutStartSec` sentinel tue un run au milieu de l'append** (déchirure `run.ts:188-191`) ⇒ `T_s` bien > D ; risque déclaré (item 3).
- **Publication partielle non vue** ⇒ digest cross-check `state_mismatch` (item 2), M-ii-9.
- **Vocabulaire interdit dans le mail** ⇒ sujet constant + `probe_alert_mail_has_no_forbidden_vocab`.
- **Dépassement quota Hostinger** ⇒ ≤ 2 mails/jour ≪ 3 000/jour (fait 16) — sans ambiguïté.
- **Régression des tests -1b-i hérités** (transitions sur `--out` frais tentent un mail) ⇒ réconciliation L-2 (advisor #3), G1 + G2.

---

## Questions ouvertes — checkpoint-1 delta (à trancher AVANT le code de -1b-ii ; zéro dette : chacune formée)
- **Q1 (item 5, VALEUR)** — un `probe_error` d'E/S LOCALE déclenche-t-il un mail ? Reco **Option A (alerter, uniforme)** ; **décision investisseur** (impact inbox), défaut orchestrateur = A ; ne PAS scinder `probe_error` (évite de toucher le test -1b-i). **DUE avant le code L-1.**
- **Q2 (item 6, secret)** — `EnvironmentFile` (défaut, session déc. 72 + précédent sentinel) vs `LoadCredential` (durcissement « secret hors env ») ? Reco EnvironmentFile ; LoadCredential = item de durcissement.
- **Q3 (item 6, TLS test)** — plaintext-loopback + test pur du connecteur injecté (défaut, déterministe, sans cert — fait 8) vs cert openssl éphémère au runtime pour un vrai TLS loopback en CI ? Reco le premier ; handshake réel = item déploiement.
- **Q4 (item 2)** — échec du 2ᵉ GET `state.json` (timeline OK) = `unreachable` (surface = un tout ; **double la surface d'échec transitoire**) vs best-effort `state_checked:false` (moins de faux positifs) ? Reco à trancher par l'orchestrateur.
- **Q5 (item 10.4)** — tirer le seam contingent -1b-ii-a (alerte+rappel) / -1b-ii-b (cross-checks détection + `TimeoutStartSec` sentinel) SEULEMENT si le gel mesuré > seuil d'alerte ? Confirmer le point de coupe.
- **Q6 (item 8)** — `last_line_hash` anti-réécriture : **former** (défaut ; subsumé partiellement par digest cross-check) ou **inclure en -1b-ii** si R-25 le permet ?
- **Q7 (item 5)** — garder `probe_error` **uniforme** (défaut, n'ébranle pas `probe_io_fault…` de -1b-i) ou le **scinder** distant/local (delta déclaré) ?
- **Q8 (item 7)** — **heartbeat hebdomadaire** : former comme option E-1 (défaut) ou coder en -1b-ii ? Reco former.
- **Q9 (item 3)** — `TimeoutStartSec` du sentinel : -1b-ii **possède** l'édition de `monark-sentinel.service` ? valeur `T_s` fixée **après** la mesure D (paramétrée) ; test inter-unités dans `test/probe-narabi.test.ts` ; couplage avec un éventuel déplacement de DEADLINE (delta 3 fichiers + relecteur séparé + note checkpoint-2 delta).
- **Q10 (item 10.1 L-2, advisor #3)** — réconciliation des tests -1b-i hérités (transitions sur `--out` frais ⇒ mail tenté) : injecter un factice SMTP loopback dans les sous-cas `--file` unhealthy, ou asserter `alert_error:"smtp_unconfigured"` explicitement ? (tâche d'intégration G1/G2 ; confirmer l'approche pour ne casser aucun `deepEqual`).

## Décisions à ESCALADER (investisseur)
- **Q1** (probe_error local → mail) — décision de valeur (impact inbox), comme E-3.
- Rappel des dus investisseur au **déploiement** (déc. 72, non bloquants pour le code) : pose du **secret SMTP par stdin** ; confirmation du **coût du plan Hostinger** dans hPanel (E-2, « 0 $ » suspendu).

## Provenance
Généré par worker implémenteur (rédacteur G0-addendum) **`claude-opus-4-8[1m]`**, effort max, 2026-09-21, à la demande de l'orchestrateur `claude-fable-5-1`. R-20 (aucun commit, aucun workflow, aucune action sortante — lecture du dépôt + `node` offline sur `narabi-snapshot.ts` pour vérifier l'invariant digest, aucun réseau, rien sur C:). **Fichier de vérification écrit (R-21, transparence, NON un livrable)** : `…/scratchpad/checkdigest.mjs` (session scratchpad, import de `narabi-snapshot.ts`, comparaison `state.digest`/`digest_T` — l'outil de la mesure du fait 5). R-21 (chaque fait porte son `fichier:ligne` ouvert first-hand ou sa mesure). Plans qui font foi : `docs/G0-lot-narabi-ops-1b.md`, `docs/CHECKPOINT1-lot-narabi-ops-1b.md`, blocs CHANTIERS/JOURNAL de `docs/PLI-lot-narabi-ops-1b-i.md`, `docs/CHECKPOINT2-lot-narabi-ops-1b-i.md`, `docs/CHECKPOINT2-DELTA-lot-narabi-ops-1b-i.md`, `docs/G2-DELTA2-lot-narabi-ops-1b-i.md`. Advisor intégré consulté avant rédaction (6 angles morts, 3 bloquants intégrés : `TimeoutStartSec` probe, `EnvironmentFile` sans `-`, `--file` sans `state.json`).
