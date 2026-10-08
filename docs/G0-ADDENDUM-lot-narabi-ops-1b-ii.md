# G0 ADDENDUM (PLIÉ checkpoint-1 delta) — sous-lot NARABI-OPS-1b-ii (ALERTE mail SMTP + rappel quotidien de la sonde externe Narabi)

Rédaction worker **`claude-opus-4-8[1m]`**, effort max, 2026-09-21 (horloge `date -u` = `2026-09-21T00:11Z`), à la demande de l'orchestrateur.
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme ; l'orchestrateur vérifie ce préfixe avant de consommer cette sortie comme preuve.
R-20 : le worker ne committe pas, ne déclenche aucun workflow, n'exécute AUCUNE action sortante (ni ssh, mail, DNS, TLS réel, appel payant) ; tout est offline/loopback. R-21 : sortie vérifiée adversarialement — chaque affirmation porte sa preuve `fichier:ligne` (ouverte first-hand) ou sa mesure reproductible.

**Nature de ce document (pli).** Ce document **REMPLACE** le brouillon pré-checkpoint-1-delta (commit `21111de`, sha256 `77d1d883be966f856ee45b75407c55a143786bce7bc36e846c408d3fd2ec1e8a`). Il PLIE l'avis du `validateur-humain` (`claude-fable-5-1`, 2026-09-20 23:41→23:54 UTC) : **ACCEPTE-AVEC-CORRECTIONS, scindée, + ESCALADES-INVESTISSEUR E-4 et E-5**. Le pli est fait par un worker à contexte frais SOUS l'avis du validateur (le brouillon disait « ne s'auto-amende pas » ; c'est l'orchestrateur qui a relayé l'avis et lancé ce pli). Les 13 items renvoyés par -1b-i sont tous **tranchés ou formés** ; les questions Q1..Q10 sont **tranchées** (voir §Questions) ; ne restent ouvertes que **E-4 et E-5** (escalades formées avec reco + déclencheur, verbatim en fin de document — aucune réponse présumée). Les corrections du validateur sont indexées section par section dans la **table finale « PLI checkpoint-1 delta »**.

**Portée.** Cet addendum TRANCHE ou FORME, un par un, les dix chantiers que -1b-i a renvoyés à « G0 -1b-ii » + les trois re-déclenchés au checkpoint-2 / checkpoint-2 delta de -1b-i. **Le seam est désormais FERME** (Q5, C-15) et scindé en **DEUX sous-lots séquentiels** :
- **-1b-ii-a = ALERTE** (Bell) : machine à états schema 2 + client SMTP built-ins (mail, AUTH, TLS) + rappel quotidien UTC + composition + assainissement + `monark-probe.service`. C'est le mail — le déclencheur `upcoming → built`.
- **-1b-ii-b = DURCISSEMENT DE LA DÉTECTION** : 2ᵉ GET borné `state.json` + `state_mismatch` + `state_unreachable`, `monark-sentinel.service TimeoutStartSec` + test inter-unités, **tueur du réessai GET (item 4, DÉPLACÉ en -b)**, `last_line_hash` si retenu.

Il **complète** (ne remplace pas) `docs/G0-lot-narabi-ops-1b.md` (corps + Amendement checkpoint-1 §C-2/C-3/C-7/C-8/C-15 + Adjudications au pli, qui FONT FOI sur -1b-ii) et `docs/CHECKPOINT1-lot-narabi-ops-1b.md`.

**Base / branche / ordre de fusion (advisor #7, avis validateur base/branche).**
- **Base de -1b-ii = `lot/etude-suite` APRÈS fusion `--no-ff` de -1b-i ET de `lot/ci-site`.** Les deux modifient la **MÊME ligne** `vocab-banned.json:111` (`files[]` du scope `sentinel`) : -1b-i y ajoute `deploy/monark-probe.{service,timer}`, `scripts/probe-narabi.mjs`, `test/probe-narabi.test.ts` (mesuré : `git diff lot/etude-suite...lot/narabi-ops-1b-i -- vocab-banned.json` = 2 insertions/2 suppressions) ; `lot/ci-site` (HEAD `b0bf54c`) y ajoute `apps/sentinel/README.md` (mesuré : 1 insertion/1 suppression). **Conflit réel.** Résolution du second fusionné = **UNION** de `files[]` (`monark-probe.{service,timer}` + `probe-narabi.mjs` + `probe-narabi.test.ts` + `apps/sentinel/README.md`), puis **`gate:vocab` rejoué** avec un mutant injectant une phrase interdite sur **chaque fichier ajouté** (preuve que le scope les couvre bien — test `vocab_sentinel_scope_scans_src_test_deploy`, `vocab-banned.json:108`). Propriétaire = orchestrateur, au moment de la 2ᵉ fusion.
- **-1b-ii NE TOUCHE PAS `vocab-banned.json`** : il édite `probe-narabi.mjs`, `test/probe-narabi.test.ts`, `monark-probe.service`, `monark-sentinel.service` — **tous déjà listés** dans `files[]` (scope `sentinel`) — et **ajoute** le sidecar `scripts/probe-narabi.d.mts`. **Inférence déclarée (rédacteur, R-21)** : le sidecar est **hors `files[]`** (déclaration de types pure, sans prose ; le lang-gate `scripts/` couvre déjà son anglais) ⇒ pas d'ajout à `vocab-banned.json`, donc -1b-ii reste **clair** du conflit ci-site↔-1b-i. **Déclencheur formé** : si le `.d.mts` gagne un jour de la prose revendicative, l'ajouter à `files[]` (= une ligne d'ADR).
- **-1b-ii-a et -1b-ii-b sont SÉQUENTIELS** (advisor #7) : ils éditent tous deux `probe-narabi.mjs` ET `test/probe-narabi.test.ts`. **-b part de la base contenant -a fusionné** ; **deux worktrees neufs, un worker chacun**. Ordre : -a → G2 dédiée → checkpoint-2 → G7 → fusion → -b (même chaîne). Déploiement Bell **après G7 + checkpoint-2 des DEUX** (décision 72).

**Dépendance d'escalade.** E-3 (rappel quotidien) est **RÉPONDUE** (investisseur, `CHANTIERS.md:188` ; adjudication `G0-lot-narabi-ops-1b.md:178`). E-1 (dead-man) et E-2 (boîte/coût) sont répondues et ne gatent que le **déploiement**. **E-4** (politique d'alerte sur l'ensemble fermé `unhealthy`) et **E-5** (redéploiement du sentinel sur le VPS SITE) sont **ouvertes** : le CODE démarre sous les reco (E-4 « aucune exception » ; E-5 non requis pour le code de -b, seulement pour son déploiement) ; **réponse E-4 due AVANT le gel de -a**.

---

## 0. Faits mesurés first-hand (relecture du code + ADR + décisions + snapshot + lecture SMTP, re-vérifiés au pli le 2026-09-21)

Chaque `fichier:ligne` ci-dessous a été **ouvert first-hand DANS CETTE SESSION du pli** (2026-09-21) — faits **1-15 et 17-20** — sauf le **fait 16** (lecture biblio Hostinger par un chercheur `claude-sonnet-5` : **[2nd] pour ce rédacteur**, non ré-ouvert ; à traiter comme tel). `fichier:ligne` dans le worktree `F:\Monark-wt-narabi1b` (HEAD `331c169`) sauf préfixe `F:\Monark\` explicite. **Les faits 1, 5, 6 sont CORRIGÉS au pli (C-NB-1, C-NB-11) ; les faits 17-20 sont AJOUTÉS (ils portent les corrections bloquantes).**

1. **[lu, code] Zéro dépendance runtime ; « pas de npm sur Bell » = auto-cité (C-NB-1).** `package.json:25-32` ne porte qu'un bloc `devDependencies` ; **aucun bloc `dependencies`** ; `"type":"module"` (`:6`), `engines.node ">=24"` (`:11-13`). La claim **sourçable** est **« `@monark/*` n'est pas installable sur Bell »** (`probe-narabi.mjs:4` verbatim « Node BUILT-INS ONLY: @monark/* is not installable on Bell » + G0 `docs/G0-lot-narabi-ops-1b.md` fait 4). La formule **« no npm on Bell »** est **auto-citée** : elle ne vient que d'un commentaire écrit par le worker -1b-i (`monark-probe.service:6-7`), pas d'une mesure de l'hôte Bell. **Conséquence R-8 inchangée** : un client SMTP par dépendance (nodemailer/…) serait la **première** dépendance runtime ; le client SMTP est donc **en built-ins** (`node:tls`/`node:net`/`node:crypto`), argument porté par la claim sourçable (« `@monark/*` non installable » + « 0 dépendance runtime dans `package.json` »), pas par « no npm ».
2. **[lu, code] `narabi.json` est WRITE-ONLY en -1b-i, schema 1** — `probe-narabi.mjs:13-15` : `{schema, checked_at, last_day, lag_days, chain_ok, reachable, chainstack_present, provider, status, reason, publish_latency}` ; `SCHEMA = 1` (`:22`). La sonde -1b-i **n'ouvre aucun chemin de lecture** de l'état antérieur ; le chemin de lecture (`alerted`/`alert_error`) arrive en -1b-ii-a et **bump `schema` à 2**.
3. **[lu, code] Boucle de réessai GET** — `probe-narabi.mjs:246` : `for (let attempt = 0; attempt <= retries; attempt++)` dans `fetchTimeline` (GET). Le mutant **`attempt <= retries + 1`** SURVIT en -1b-i (aucun test ne pinne le nombre d'essais sur le chemin d'échec). **Tueur DÉPLACÉ en -1b-ii-b** (item 4). `transportBounds` (`:214-232`) : `retries = num(env.PROBE_RETRIES, DEFAULT_RETRIES=2, MAX_RETRIES=4, floor 0)` — `PROBE_RETRIES=0` explicite conservé.
4. **[lu, code] Client d'atomicité + repli E/S** — `probe-narabi.mjs:357-372` : écriture temp `${out}.tmp-${pid}-${randomBytes(8)}` puis `renameSync` (`:360-363`) ; sur faute E/S, `unlinkSync(tmp)` puis **écriture DIRECTE non atomique** d'un état `probe_error` (`:369-370` : `writeFileSync(out, …)` SANS temp+rename), `return {exitCode:1}`, jamais de FATAL. `evaluate` (`:280-309`) : précédence « cannot-evaluate > chain > lag » ; `probe_error` naît en deux endroits : distant (`:292` parse, `:294` zéro ligne) et **local** (`:346` `--now` invalide, `:369` faute E/S). Le repli `:370` est **best-effort** (non atomique) ⇒ borne dégradée déclarée en C-B-5.
5. **[lu+MESURÉ, code] `state.json` = 398 octets ; invariant `state.digest === last.digest_T` VRAI ; dates UTC (C-NB-11).** `run.ts:189` écrit `state.json`, `:191` le copie dans `public/` (servi `/narabi/state.json`, `RUNBOOK-sentinel.md:118`) ; `timeline.ts` : `stateSummary` retourne `{tracker, digest, projected_bound_leq_target_T, replay_q}` avec `digest = trackerDigest(...)`. **MESURÉ first-hand (2026-09-21, `node --input-type=module` import de `apps/site/lib/narabi-snapshot.ts`, offline)** : `Buffer.byteLength(NARABI_SNAPSHOT.stateJson,'utf8')` = **398 octets** (l'addendum pré-pli disait « ≈ 300 o » : **FAUX**) ; `sha256(stateJson)` recalculé = `86c33c4251bef4b3…` **== `stateSha256` committé** (le snapshot est bien les octets publiés). Sur la paire committée (2 lignes, jours **UTC** 2026-09-17 et 2026-09-18) : `JSON.parse(stateJson).digest` = `9b5f89fdd49c69e0…` ; `digest_T` de la ligne **2026-09-18** = `9b5f89fdd49c69e0…` ; `digest_T` de la ligne **2026-09-17** = `48d40651eb2e69c3…`. Donc **`state.digest === dernière_ligne.digest_T` (`9b5f89fd…`)** est un invariant à **oracle committé**.
6. **[lu, code] Copie publique en QUATRE écritures — ordre RÉEL et fenêtre de partialité CORRIGÉS (C-NB-11).** Ordre exact `run.ts` (relu `:186-196`) : **`:188`** `appendFileSync(tl, …)` (timeline privée), **`:189`** `writeFileSync(join(dir,"state.json"), …)` (state privé), **`:190`** `copyFileSync(tl, public/timeline.jsonl)` (copie timeline publique), **`:191`** `copyFileSync(state.json, public/state.json)` (copie state publique). **La fenêtre de partialité est entre `:190` et `:191`** : après `:190` la timeline PUBLIQUE est fraîche mais `public/state.json` est encore PÉRIMÉ ⇒ sur la surface servie **`state.digest ≠ dernière_ligne.digest_T`**. C'est exactement ce que le cross-check (item 2) attrape et qu'un contrôle du seul `timeline.jsonl` ne voit pas. *(L'addendum pré-pli narrait « `:188`→`:190` puis `:189`→`:191` » — il inversait `:189` et `:190`.)*
7. **[lu, unités] `monark-probe` (Bell)** — `monark-probe.service:15` `Type=oneshot` ; `:17` `WorkingDirectory=/opt/monark-probe` ; `:23` `EnvironmentFile=-/etc/monark/probe.env` (le `-` = **optionnel**, à RETIRER en -1b-ii, commentaire `:21`) ; `:29` **`TimeoutStartSec=90`** ; `:41` `MemoryMax=128M`. `monark-probe.timer:17-19` : `OnCalendar` 10:30/12:30/16:30 UTC, `:22` `Persistent=true`.
8. **[lu, unités] `monark-sentinel`** — `monark-sentinel.service:15` `Type=oneshot`, **AUCUN `TimeoutStartSec`** ; `:42` `MemoryMax=512M`. `monark-sentinel.timer:16-19` : `OnCalendar` 00:30/03:30/06:30/09:30 UTC, `:22` `RandomizedDelaySec=1800`, `:23` `Persistent=true`. Dernier créneau **09:30 UTC** ; pire départ = 09:30 + 1800 s = **10:00 UTC**.
9. **[lu, code] `DEADLINE` de la sonde** — `probe-narabi.mjs:37` `DEADLINE_UTC="10:30"` (source unique), `:44` `DEADLINE_UTC_MINUTES` (dérivée). Interdite de surcharge par env (couplée au timer). **10:30 reste une hypothèse déclarée** jusqu'à la mesure D.
10. **[lu, code] Garde de transport + bornes** — `urlTransportAllowed` (`:194-210`) : `https` partout ; `http` **loopback strict SEUL** ; sinon `insecure_url`, **zéro dial**. Bornes plafonnées dur : `MAX_TIMEOUT_MS=10_000` (`:54`), `MAX_MAX_BYTES=8 Mio` (`:57`), `MAX_RETRIES=4` (`:58`). Patron réutilisé par le client SMTP (garde loopback pour le plaintext de test) et par le 2ᵉ GET (-b).
11. **[lu, garde-secrets] `F:\Monark\test\no-secret-in-repo.test.ts`** — `:34` rougit sur `-----BEGIN … PRIVATE KEY-----` ⇒ **aucun certificat/clé TLS de test committable** ; `:49-51` chainstack/p2pify/wss ; `:55` `Bearer …{16,}` ; `:58` `*_API_KEY=…`. `SMTP_PASS` n'entre jamais dans le dépôt.
12. **[lu, gate] `vocab-banned.json` scope `sentinel` (`:107-121`)** — `dirs:[apps/sentinel/src, apps/sentinel/test]` (`.ts`) + `files[]` (`:111`) incluant `deploy/monark-sentinel.{service,timer}`, `deploy/monark-probe.{service,timer}`, `scripts/probe-narabi.mjs`, `test/probe-narabi.test.ts`. Banni dans ce scope (`:113-118`) : `adaptive (cover|guarantee|region|gate)`, `(coverage|region|gate) adapt`, `\bcascade\b`, `(Λ|lambda)=0`, `would have alerted`, `reference price`. **`apps/sentinel/src` utilise « scores » partout** (`timeline.ts`) ⇒ **on ne peut PAS ajouter `\bscore\b` au scope** — le vocabulaire du MAIL est policé par un test DÉDIÉ. `exemptPhrases:["attest, gate, cascade, calibrate"]` (`:121`).
13. **[lu, RUNBOOK] `F:\Monark-wt-narabi1b\docs\RUNBOOK-sentinel.md`** — `:186-191` §« Sonde externe » dit encore **« deferred to pli NARABI-OPS-1b »** (`:189`) ; `:124-130` §6 « Redeploy … archiving from `main` HEAD … never from a lot worktree branch » (`:129-130`), cible **`ssh -i ~/.ssh/monark_vps root@monarkgate.tech`** (le VPS SITE) ; `:82-91` = pose d'un secret par **ssh STDIN** + vérif **sha256 des deux côtés** (jamais `cat` distant, jamais `set -x`) ; `:118` `curl -sI …/narabi/state.json`. La divergence branche `main HEAD` vs branche d'intégration est **réconciliée** (L-6a amende §6 « commit fusionné de la branche d'intégration, par SHA » — ratifié **décision 72**, `CHANTIERS.md:211`).
14. **[lu, ADR] `F:\Monark\docs\adr\ADR-NARABI-OPS-1.md` table des tuyaux (`:75-82`)** : ligne `timeline → probe → narabi.json` État **« absent — pli NARABI-OPS-1b »** (`:81`) ; ligne `probe → alerte` État **« upcoming »**, déclencheur « investor picks the channel » (`:82`). §Deferral of L-5 `:84-104`.
15. **[lu, décisions] `F:\Monark\docs\CHANTIERS.md`** — **57** (`:120`) le VPS Bell (KVM 2, **`bell.monarkgate.tech`**) est **dédié à Bell** et n'accueille QUE Bell + la sonde externe (hôte distinct du sentinel surveillé, sur `monarkgate.tech`). **58** (`:121`, verbatim « canal d alerte mail ») : alerte e-mail si `lag_days>0` ou chaîne rompue ; identifiants hors dépôt (`/etc/monark/probe.env`, `0640`) ; **« Déclencheur `upcoming → built` = premier mail reçu sur un lag réel ou simulé »**. **66 close** (`:190`) : **`ALERT_TO = narabialerts@monarkgate.tech`** (plan « Standard Business Email », exp. 2026-10-20 ; **l'investisseur a saisi le mot de passe lui-même**). **72** (`:211`, verbatim « déploiement accordé narabo ») : **GO de déploiement accordé d'avance**, après G7 + checkpoint-2 de -1b-i ET -1b-ii, archive du commit fusionné **par SHA**, **secret SMTP posé par l'investisseur par stdin** ; **vaut ratification de RUNBOOK §6**. **75** (`:212`) une seule fenêtre publique au release, **release gate = zéro dette**, cartographie totale. E-1/E-2/E-3 répondues (`:188`) ; SPF posé, DNS `monarkgate.tech` clos (`:192`).
16. **[lu, biblio] `F:\Monark\docs\biblio\narabi\L-lecture-hostinger-smtp-2026-09-20.md`** (chercheur `claude-sonnet-5`) — `smtp.hostinger.com` ; **465 TLS implicite = PRIMAIRE**, 587 STARTTLS = repli documenté ; **TLS ≥ 1.2 obligatoire, déjà en vigueur** ; `SMTP_USER` = adresse complète ; **mécanisme AUTH (LOGIN/PLAIN) NON DOCUMENTÉ** par une source primaire (item à confirmer au 1er mail) ; **Business Standard = 3 000/jour sortant** (fenêtre 24 h) ; envoi programmatique inclus ; From=To même domaine s'aligne (DKIM/SPF auto, DMARC `p=none`) ; **code SMTP numérique de rejet non publié** par Hostinger.
17. **[lu, code] AJOUTÉ — la sortie journalisée porte l'état ET l'objet erreur (fonde C-B-1).** `main()` imprime l'état sur **stdout** via `console.log(JSON.stringify(state, null, 2))` (`probe-narabi.mjs:390`) ⇒ tout ce qui est dans `state` (dont un futur `alert_error`) va au **journalctl**. Le garde d'exécution imprime l'**objet erreur** via `console.error("probe FATAL", e)` (`:396`). **Conséquence** : `alert_error` doit être un **ensemble FERMÉ** ; jamais la ligne serveur brute ni un `Error` construit depuis une commande/réponse SMTP (sinon la réponse serveur fuit au journal).
18. **[lu, code] AJOUTÉ — `parseArgs` ne connaît que 4 flags et ignore SILENCIEUSEMENT l'inconnu (fonde C-B-13).** `parseArgs` (`:376-386`) reconnaît **uniquement** `--file`, `--now`, `--url`, `--out` ; la boucle `for` **n'a pas de branche `else`** ⇒ un flag inconnu (`--state`, `--state-file`) est **ignoré sans erreur**. Un `--state <scratch>` de simulation serait donc muet et la sonde écrirait le `narabi.json` de **production**.
19. **[lu, code] AJOUTÉ — le seul champ distant libre atteignant le mail est `last_day`/`day` (fonde C-B-3).** Dans `evaluate`, `provider = chainstackProviderOf(last.endpoints)` (`:297`) renvoie une valeur de l'**ensemble FERMÉ** `CHAINSTACK_PROVIDERS = ["chainstack.com","p2pify.com"]` (`:79`, fonction `:88-95`) ou `null` ⇒ une charge injectée dans `endpoints` **n'atteint jamais** le corps du mail. `last_day = last.day` est **recopié tel quel, y compris sous `chain_broken`** (`:300`). Donc le vecteur d'injection CR/LF réaliste passe par **`day`** (le champ distant libre), pas par `provider`/`endpoints`.
20. **[lu, unités] AJOUTÉ — `monark-sentinel.service` est l'unité du VPS SITE, pas de Bell (fonde C-B-11/E-5).** `monark-sentinel.service` : `WorkingDirectory=/opt/monark-harness` (`:18`), `User=sentinel` (`:31`), `MemoryMax=512M` (`:42`), déployée par RUNBOOK §6 en `ssh root@monarkgate.tech` (le VPS harness/vitrine/sentinel). `monark-probe.service` : `WorkingDirectory=/opt/monark-probe` (`:17`), Bell (`bell.monarkgate.tech`, décision 57). **Les deux unités vivent sur des HÔTES DISTINCTS.** Éditer + déployer `monark-sentinel.service` touche donc le **VPS SITE de production**, que le GO 72 (Bell seul) ne couvre pas ⇒ **E-5**.

---

## 1. Item 1 — L-5 (docs) → **L-6 SCINDÉ en L-6a / L-6b (C-B-9)**

Le validateur a scindé L-6 pour ne pas mêler docs d'orchestrateur (au G7 de -1b-i) et docs de worker (dans -1b-ii), et pour lever la contradiction L-6↔C-D-2 (AM-1).

**L-6a — orchestrateur, docs seuls, au G7 de -1b-i** (hors -1b-ii, hors R-25 -1b-ii) :
- **flip `RUNBOOK-sentinel.md:189`** « deferred to pli NARABI-OPS-1b » → « **détection livrée par -1b-i (gelée) ; alerte assignée à NARABI-OPS-1b-ii-a** ».
- **`ADR-NARABI-OPS-1.md:81`** (ligne `timeline → probe → narabi.json`) : « absent — pli NARABI-OPS-1b » → « **code + test non-LLM (-1b-i, gelé) ; wired at deploy ; `upcoming` jusqu'au premier mail (décision 58)** ».
- **amendement §6 par SHA** (fait 13) : « déploiement = archive du **commit fusionné de la branche d'intégration `lot/etude-suite`, désigné par SHA consigné au JOURNAL** ; jamais une branche de lot ; jamais `main HEAD` sans passer par ce commit » — ratifié décision 72.

**L-6b — dans -1b-ii (worker), docs** (exclus R-25, `.md`) :
- **`ADR-NARABI-OPS-1.md:82`** (ligne `probe → alerte`) : « upcoming / investor picks the channel » → **canal FIXÉ = mail SMTP (décisions 58/65/66)** ; Entrée = `narabi.json` (transition d'état, schema 2) ; Sortie = `MAIL/RCPT/DATA` sur le relais Hostinger → `narabialerts@monarkgate.tech` ; État **`upcoming → built` au premier mail réel** ; **test nommé = `probe_alert_composition_from_fixture`**.
- **amendement daté de l'ADR** : `narabi.json` **schema 2** ; ensembles FERMÉS `reason` (`… | state_mismatch | state_unreachable`) et `alert_error` (voir C-B-1).
- **résiduel en toutes lettres (C-10)** au RUNBOOK : « **sonde morte = silence** : aucune alerte ne part si Bell ou la sonde meurt, tant que l'item dead-man (E-1, surveillance croisée à T-1b) est ouvert » + « **une faute disque sur Bell ne produit aucun mail ce run-là** » (résiduel E-4/C-NB-10).
- **commandes de déploiement** (§10.5) ; **PLI** (`docs/PLI-lot-narabi-ops-1b-ii-{a,b}.md`).

*Preuve C-D-2* : au G7 de -1b-i, `grep "deferred to pli NARABI-OPS-1b" docs/RUNBOOK-sentinel.md` = **0** (L-6a) ; au G7 de -1b-ii, ADR `:82` + amendement schema 2 portés (L-6b). **L-6 ne contredit plus C-D-2** : L-6a (registre honnête, orchestrateur, G7 -1b-i) et L-6b (canal + schema, worker, -1b-ii) sont disjoints. **Test/mutant** : n-a (docs).

---

## 2. Item 2 — `state.digest == digest_T` (cross-check) — **INCLUS en -1b-ii-b, oracle committé**

*Conception.* En **mode URL**, la sonde fait un **2ᵉ GET borné** de `/narabi/state.json` (env `PROBE_STATE_URL`, **défaut = `PROBE_URL` avec le basename remplacé par `state.json`**), parse, et vérifie **`state.digest === dernière_ligne_timeline.digest_T`** (invariant fait 5, MESURÉ). Divergence ⇒ **`reason:"state_mismatch"`** (unhealthy). Détecte la **publication partielle** (fait 6 : fenêtre `:190`→`:191`).

*Dérivation par défaut EXERCÉE (C-B-12).* Le test **`probe_state_digest_cross_check`** exerce la **dérivation par défaut** de `PROBE_STATE_URL` : **UN seul serveur loopback** `node:http` sert les DEUX chemins (`/narabi/timeline.jsonl` et `/narabi/state.json`), **sans** passer `PROBE_STATE_URL` — le remplacement de basename doit fonctionner tout seul.

*Bornes propres (BLOQUANT RSS/timeout, C-NB-7).* Le 2ᵉ GET a **ses PROPRES bornes** : `STATE_MAX_BYTES` **exportée, plafonnée** (petit — `state.json` réel = **398 octets**, fait 5 ; ex. 64 Kio) et un `STATE_TIMEOUT_MS` court. Réutilise `urlTransportAllowed` + le patron de `fetchTimeline` (garde loopback + `redirect:"manual"` + réessai borné). **Assertion RSS élargie (C-NB-7)** : `MemoryMax ≥ 13 × (MAX_MAX_BYTES + STATE_MAX_BYTES)` (deux corps possibles en vol).

*Échec du 2ᵉ GET (Q4 TRANCHÉE).* Le surface est un tout ⇒ **unhealthy**, **raison DISTINCTE `state_unreachable`** (pas `unreachable`, pour la distinguer d'un GET₁ mort). **Précédence FERMÉE (advisor #8)** : `insecure_url`/`unreachable`/`too_large`/`probe_error` (cannot-evaluate) **>** `chain_broken` **>** **`state_unreachable`** **>** **`state_mismatch`** **>** `lag`. **Test qui l'épingle** : `probe_state_unreachable_precedence` (GET₁ sain + GET₂ mort ⇒ `state_unreachable`, jamais `state_mismatch` ni `lag`).

*Course GET₁/GET₂ (C-NB-4) — TRANCHÉE = résiduel déclaré.* Une publication qui atterrit dans la fenêtre sous-seconde entre GET₁ (timeline) et GET₂ (state.json) peut produire un **`state_mismatch` transitoire** (faux positif) qui **s'auto-guérit au tir suivant** (le flap est acceptable, C-B-7). **Résiduel déclaré, non une dette.** *Option de durcissement FORMÉE* : relire une fois la timeline avant de conclure `state_mismatch` — **non codée en -b** (elle ajouterait un GET₃ dans la dérivation `TimeoutStartSec` + l'assertion RSS) ; déclencheur = premier faux `state_mismatch` observé au déploiement ; propriétaire orchestrateur.

*Mode `--file` (BLOQUANT).* En mode `--file`, **PAS de `state.json` requis** : un `--state-file` OPTIONNEL injecte un `state.json` local pour le test ; absent ⇒ `state_checked:false`, **aucun `state_mismatch` possible** — les 8 sous-cas `--file` de `probe_narabi_detects_lag` (-1b-i) restent VERTS.

*Test NOMMÉ* : **`probe_state_digest_cross_check`** — oracle = paire committée `NARABI_SNAPSHOT` (`state.digest 9b5f89fd… === dernière ligne digest_T`) servie par UN serveur loopback sur les deux chemins ⇒ healthy ; `state.json` au digest trafiqué **en scratch** ⇒ `state_mismatch` ; mode `--file` sans `--state-file` ⇒ `state_checked:false`. *Mutant* **M-ii-9** (cross-check sauté ⇒ state trafiqué passe ⇒ RED).

*Nommage des deux « states » (advisor #5).* `narabi.json` = l'état de la **SONDE** (lu ET écrit, chemin `--out`) ; `state.json` = le résumé du **SENTINEL** (lu par le 2ᵉ GET, ou injecté par `--state-file` en mode `--file`). **Deux fichiers distincts, jamais confondus dans le code ni les docs.**

---

## 3. Item 3 — `TimeoutStartSec` de `monark-sentinel.service` + test inter-unités — **INCLUS en -1b-ii-b, paramétré par D ; redéploiement = E-5**

*Constat (fait 20).* `monark-sentinel.service` est l'unité du **VPS SITE** (`WorkingDirectory=/opt/monark-harness`, `User=sentinel`, RUNBOOK §6, `ssh root@monarkgate.tech`), `Type=oneshot` **SANS** `TimeoutStartSec`. **L'ÉDITER + le tester est dans -1b-ii-b ; le DÉPLOYER touche le VPS SITE** (E-5, décision 72 ne couvre que Bell).

*Livrable code (-b).* **ajouter `TimeoutStartSec=<T_s>` à `monark-sentinel.service`** (déjà sous le scope `sentinel`). **Formule FERMÉE pré-enregistrée AVANT de lire D (C-NB-5)** : **`T_s = max(300, ⌈3·D/60⌉·60)` secondes** (= `3×D` arrondi à la minute supérieure, **plancher 300 s**). D = durée horloge d'un run PUBLIANT, mesurée par l'orchestrateur après 00:30 UTC le 2026-09-21 (**je n'estime pas D**), **committée comme constante nommée `RUN_DURATION_D_SEC`** dans le test inter-unités, **commentaire = sha du bloc JOURNAL** qui la porte (provenance).
*Cohérence inter-unités* : `DEADLINE_instant ≥ (dernier créneau sentinel 09:30) + RandomizedDelaySec (1800 s) + T_s`, soit `DEADLINE_UTC_MINUTES ≥ 570 + 30 + T_s/60`.

*Test NOMMÉ* : **`probe_sentinel_timeoutstartsec_inter_unit_coherence`** — lit `monark-sentinel.timer` (dernier `OnCalendar` + `RandomizedDelaySec`), `monark-sentinel.service` (`TimeoutStartSec`), `DEADLINE_UTC_MINUTES` et `RUN_DURATION_D_SEC`, asserte **en UTC** LES DEUX bornes :
- **borne HAUTE** — `DEADLINE ≥ 10:00 + T_s` — *mutant* **M-ii-13** (`T_s` porté au-delà de la borne ⇒ RED) ;
- **borne BASSE** — `T_s ≥ 3·D` (plancher 300 s) — *mutant* **M-ii-14** (`T_s < 3D` ⇒ RED). *(Numéro M-ii-14 réservé par le validateur, C-NB-5, à la borne basse ; les six mutants -a ajoutés prennent M-ii-15..21 — voir §10.3.)*

*Couplage DEADLINE (Q9 TRANCHÉE).* Un éventuel **déplacement de DEADLINE** (si D > 600 s) appartient à **-1b-i AVANT son G7** — **jamais rejoué dans -1b-ii**. -1b-ii-b **possède** l'édition de `monark-sentinel.service` et le test inter-unités ; il ne **possède PAS** le déplacement de DEADLINE (qui reste un delta -1b-i : `probe-narabi.mjs:37` + `monark-probe.timer` + oracles + relecteur Opus 4.8 séparé).

*Risque MAST (E-5).* Si `T_s` fire au milieu de l'append `run.ts:188-191`, l'écriture d'un fichier **append-only chaîné** peut se **déchirer** ⇒ `T_s` **bien** au-dessus de D (le plancher 3×D y aide) ; **risque déclaré**, et c'est l'objet de **E-5**.

---

## 4. Item 4 — Réessai GET : mutant `attempt <= retries + 1` @`:246` — **DÉPLACÉ en -1b-ii-b (test tueur)**

*Analyse (fait 3).* Le survivant `attempt <= retries + 1` fait **un essai de plus** ; il ne se manifeste que quand la sonde **épuise** ses essais (réel = `retries+1` essais puis abandon ; mutant = `retries+2`).

*Test NOMMÉ tueur* : **`probe_get_retries_exactly_n_plus_one`** — serveur loopback `node:http` qui **échoue exactement `retries+1` fois** puis servirait au `(retries+2)`ᵉ contact ; compteur `hits` :
- **réel** : abandonne à `retries+1` ⇒ `reason:"unreachable"`, **`hits === retries + 1`** ;
- **mutant** : un essai de plus ⇒ atteint le service ⇒ `status:"healthy"`, `hits === retries + 2` ⇒ **RED** ;
- sous-cas `PROBE_RETRIES=0` (⇒ **1 hit**) ET `PROBE_RETRIES=2` (⇒ **3 hits**) ; **port fermé côté GET** (ECONNREFUSED immédiat) ⇒ `unreachable`, `hits === 0`. *Mutant* **M-ii-10**.

*Clarification de traçabilité (Doute-1, R-21).* Le nom C-3 `probe_unreachable_closed_port_and_timeout` se **SCINDE par transport** : GET hang-timeout = `probe_get_over_loopback_http_executes` (-1b-i) ; **GET port-fermé** = sous-cas ci-dessus (-b) ; **SMTP port-fermé + timeout** = `probe_smtp_unreachable_closed_port_and_timeout` (-a, item 6). Scission déclarée pour qu'un validateur greppant le nom ne tombe pas sur le mauvais transport.

---

## 5. Item 5 — `probe_error` d'une panne LOCALE déclenche-t-il un mail ? — **SUPERSÉDÉ par E-4 ; Q7 uniforme TRANCHÉE ; ordre d'écriture C-NB-10**

*Q1 (pré-pli) est SUPERSÉDÉE par E-4 (advisor #17).* Le validateur **généralise** la question : la sonde écrit sur **TOUT état `unhealthy`** de l'ensemble FERMÉ (retard `lag`, chaîne rompue `chain_broken`, surface injoignable `unreachable`, corps trop gros `too_large`, URL refusée `insecure_url`, timeline illisible `probe_error`, `state_mismatch`, `state_unreachable`). La décision 58 ne nommait que retard et chaîne rompue. **E-4** demande à l'investisseur s'il veut une **exception (journal seul, pas de mail)** pour l'un de ces cas. **Reco = AUCUNE exception** ; **le code démarre sous « aucune exception »** ; réponse **due avant le gel de -a**. *Résiduel* : une **faute disque** sur Bell ne produit **aucun mail ce run-là** (le repli `:370` mute `probe_error` APRÈS la décision d'envoi ; borné, couvert par la surveillance croisée E-1/T-1b).

*Q7 TRANCHÉE = `probe_error` UNIFORME.* On **ne scinde PAS** `probe_error` distant/local (scinder toucherait le test -1b-i `probe_io_fault_cleans_tmp_and_falls_back`). Un `probe_error` (d'où qu'il vienne, dès qu'il est connu AVANT la décision d'envoi) déclenche un mail sous « aucune exception ».

*Ordre d'écriture — UNE option choisie (C-NB-10, advisor #6) = OPTION 2.* On **conserve l'ordre** évaluer → décider l'envoi → envoyer → 250 → écrire `narabi.json`, et on **PROUVE par test** que **tout échec SMTP laisse `narabi.json` écrit** avec un `alert_error` de l'ensemble fermé — **exception SYNCHRONE du connecteur comprise** (`tls.connect`/`net.connect` qui jette en pleine construction). Le send est enveloppé d'un `try/catch` ; **aucun `Error` ne sort vers `:396`**. *(On NE choisit PAS l'option « écrire narabi.json AVANT l'envoi » : elle rendrait la faute disque visible pré-envoi et changerait le résiduel E-4.)* Test NOMMÉ **`probe_smtp_failure_leaves_narabi_written`** ; *mutant* **M-ii-20** (le connecteur jette ⇒ FATAL non attrapé ⇒ `narabi.json` non écrit avec `alert_error` ⇒ RED).

---

## 6. Item 6 — Client SMTP built-ins ; secret ; TLS ; AUTH — **-1b-ii-a (R-8) + corrections C-B-1/2/8, C-NB-8/9**

*Décision R-8 (fait 1).* **Client SMTP en built-ins Node** (`node:tls` SMTPS 465 implicite, `node:net` plaintext-loopback de test, `node:crypto` déjà importé), **AUCUNE dépendance nouvelle** ; conversation minimale (EHLO / AUTH / MAIL FROM / RCPT TO / DATA / QUIT sur TLS implicite 465) ; **pas** de machine STARTTLS (un mode d'échec MAST de moins).

*C-B-1 — `alert_error` = ensemble FERMÉ, JAMAIS la réponse serveur brute.* `alert_error ∈ { smtp_unconfigured | smtp_unreachable | smtp_timeout | smtp_tls_failed | smtp_auth_failed | smtp_rejected }` (+ `null`). **Jamais** la ligne serveur brute, **jamais** un message d'`Error` construit depuis une commande/réponse (fait 17 : `main()` imprime l'état `:390` sur stdout → journalctl ; le catch imprime l'objet erreur `:396`). *Test NOMMÉ* **`probe_secret_never_printed`** ÉTENDU : le factice répond **`535` en renvoyant en ÉCHO la charge AUTH** et **ferme en pleine AUTH** ; oracle = les jetons **RÉELLEMENT capturés sur le fil par le factice** (jeton PLAIN `\0user\0pass`, les **deux** jetons LOGIN base64) **+ le mot de passe brut**, TOUS absents de stdout, stderr, `narabi.json` — sachant qu'**un base64 du mot de passe seul n'est PAS une sous-chaîne du jeton PLAIN** (l'assertion teste bien les jetons du fil, pas un base64 naïf). *Mutant* **M-ii-3** (secret/base64 imprimé ⇒ RED) et *mutant* **M-ii-15** (réponse serveur brute copiée dans `alert_error`/un message ⇒ fuit au journal ⇒ RED).

*C-B-2 — échéance GLOBALE unique de la conversation SMTP.* **`MAX_SMTP_DEADLINE_MS` exportée et plafonnée** (une échéance pour TOUTE la conversation ~9 allers-retours, **PAS** un timeout par opération) + **borne d'octets par réponse ET au total**. *Tests* : factice **goutte-à-goutte** (`250-` toutes les N ms, sans fin) ET factice **muet après DATA** ⇒ `smtp_timeout`, `narabi.json` écrit, exit 1, **dans la borne** (test **`probe_smtp_global_deadline`**). *Mutant* **M-ii-16** (timeout d'inactivité seul, sans échéance globale ⇒ le goutte-à-goutte pend ⇒ RED). La sonde `TimeoutStartSec` de -a se calcule depuis les constantes (voir tuyaux/§10.5).

*Sécurité TLS (C-B-8, à épingler G2 C-11) — PROUVÉE PAR EXÉCUTION sans certificat.* Fait 11 : aucun X.509 committable, Node ne self-signe pas en built-ins. Donc :
- *Test d'exécution* **`probe_smtp_implicit_tls_never_speaks_plaintext`** : `SMTP_TLS=implicit` vers un factice **`node:net` EN CLAIR** ⇒ la **poignée de main TLS échoue**, `alert_error:"smtp_tls_failed"`, et le factice **n'a reçu NI `EHLO` NI `AUTH`**. *Mutants* **M-ii-19** (« `net.connect` partout » OU « `EHLO` avant TLS » ⇒ le factice voit `EHLO`/`AUTH` en clair ⇒ RED).
- *Test d'aiguillage épinglé* **`probe_smtp_tls_options_pinned`** : le connecteur par défaut construit `{ minVersion:"TLSv1.2", rejectUnauthorized:true, servername:host }` ; hôte **non loopback** ⇒ connecteur **`tls`** ; **`SMTP_TLS=none` hors loopback ⇒ REFUS SANS connexion** (même garde que `http` loopback). *Mutants* **M-ii-7** (`rejectUnauthorized:false` ⇒ RED), **M-ii-12** (`minVersion` retiré ⇒ RED), **M-ii-4** (plaintext admis hors loopback ⇒ RED).
- **jamais** `rejectUnauthorized:false`, **jamais** `NODE_TLS_REJECT_UNAUTHORIZED=0`. Q3 acceptée sous cette condition ; **poignée de main réelle + essai à nom d'hôte erroné = items de déploiement** (§10.5).

*AUTH (fait 16).* Hostinger ne documente pas le mécanisme ⇒ **`AUTH PLAIN` ET `AUTH LOGIN`**, **négociés depuis la réponse EHLO** ; parser les **continuations multi-ligne `250-`**. Test **`probe_smtp_auth_plain_and_login`** (factice annonçant un seul mécanisme à la fois) ; *mutant* **M-ii-11** (parseur EHLO mono-ligne ⇒ manque les mécanismes ⇒ RED).

*Secret (Q2 TRANCHÉE = `EnvironmentFile` SANS `-`).* Lu de **`EnvironmentFile=/etc/monark/probe.env` (SANS `-`, C-8)** posé par l'investisseur **par ssh STDIN** (calque `RUNBOOK:82-91`, décision 72), vérifié par **sha256 des deux côtés**, jamais `cat` distant, jamais `set -x`, jamais vu par un agent. **`LoadCredential=` = item de DURCISSEMENT FORMÉ** (déclencheur : `systemctl --version ≥ 247` lu au déploiement ; propriétaire orchestrateur). *C-NB-9* : fichier secret **`0600 root:root`** (lu par PID 1) ; le RUNBOOK **prescrit le QUOTAGE de `SMTP_PASS`** (le parseur systemd altère `"`, `\`, `#`, espaces) — sur un `535` au premier mail, **vérifier le quotage d'abord**. `SMTP_PASS` **jamais imprimé** (ni le corps AUTH base64).

*En-têtes du mail (C-NB-8).* `Date` **déterministe sous `--now`**, `From`, `To`, `Subject` (CONSTANT, C-7), `Message-ID`, `MIME-Version: 1.0`, `Content-Type: text/plain; charset=us-ascii` ; **validation de forme de `ALERT_TO`/`ALERT_FROM`** sinon `smtp_unconfigured`. Test **`probe_smtp_headers_wellformed`**.

---

## 7. Item 7 — Machine à états, rappel quotidien, anti-tempête, contenu — **-1b-ii-a ; borne VRAIE C-B-7, bootstrap C-B-5, injection C-B-3/4, no-real-mail C-B-6**

`narabi.json` passe **schema 2** : schema 1 + `{ alerted:boolean, alert_error:(ensemble fermé C-B-1)|null, last_alert_day:string|null (UTC YYYY-MM-DD), state_checked:boolean }`.

*Bootstrap de lecture d'état (C-B-5) — sémantique déclarée.* Un `narabi.json` **absent, corrompu, ou de schéma inconnu** (y compris `alerted:true` avec `last_alert_day:null`, et `schema > 2`) est lu comme **bootstrap `alerted:false`**. Test **`probe_reads_missing_or_corrupt_state_as_bootstrap`**, avec le **sous-cas nommé `probe_reads_schema1_state_without_crash`** (**Doute-4 mandaté par le checkpoint-2 de -1b-i** : un `narabi.json` **schema 1** laissé par une sonde -1b-i déployée — format CONNU, ni absent ni corrompu — est lu comme bootstrap `alerted:false`, **sans crash**, puis **ré-écrit schema 2**) ; *mutant* **M-ii-18** (crash sur JSON invalide ⇒ RED). *Borne dégradée déclarée* : **≤ 1 mail par tir** tant que l'état reste illisible (le repli `:370` de -1b-i est une écriture directe **non atomique**, fait 4).

*Ordre d'écriture (C-2, advisor #5) + at-least-once.* `alerted:=true` **ET** `last_alert_day:=jour UTC courant` **seulement APRÈS DATA 250** ; un envoi échoué **laisse les deux intacts** ⇒ le tir suivant du même jour **réessaie**. Rétablissement ssi `healthy && prev.alerted`, puis `alerted:=false`, `last_alert_day:=null` (après 250 du mail de rétablissement). *Fuseau : UTC strict.* *Crash entre 250 et `renameSync` (Q9/résiduel)* ⇒ double mail **borné ≤ +1/jour ACCEPTABLE** (at-least-once ; exactly-once impossible sans transaction).

*Anti-tempête — DEUX prédicats explicites.*
- (i) **alerte** ssi `unhealthy && !alerted` → envoi (première détection OU réessai du même jour après échec) ;
- (ii) **rappel** ssi `unhealthy && alerted && jour_UTC_courant > last_alert_day` → envoi (une fois par nouveau jour UTC de panne).
Un **changement de `reason`** en restant `unhealthy` le même jour ⇒ **0 mail** (ni (i) car `alerted`, ni (ii) car même jour).

*Borne VRAIE (C-B-7) — « ≤ 2 mails/jour » RÉFUTÉ.* Contre-exemple mesurable : 10:30 unhealthy ⇒ alerte ; 12:30 healthy ⇒ rétablissement + reset ; 16:30 unhealthy ⇒ **nouvelle alerte = 3 mails le même jour UTC**. **Borne VRAIE = ≤ 1 mail par TIR** (3 tirs/jour + rattrapage `Persistent` + lancements manuels) ; **1/jour UTC en panne SOUTENUE** ; conditionnée à la **persistance de l'état**. **Le flap est ACCEPTABLE.** §10.6 réécrite en conséquence. *Test* **`probe_alert_daily_reminder_once_per_utc_day`** avec DEUX sous-cas :
- **panne soutenue** : 3 tirs le même jour UTC ⇒ **1 mail** ; jour UTC suivant toujours en panne ⇒ **1 rappel** ;
- **FLAP** : 10:30 unhealthy / 12:30 healthy / 16:30 unhealthy ⇒ **exactement 3 mails** (pinne la borne vraie « ≤ 1 par tir »).
*Mutants* **M-ii-8** (« rappel à chaque tir » ⇒ RED ; « aucun rappel » ⇒ RED), **M-ii-2** (ré-alerte sur changement de `reason` même jour ⇒ RED, test `probe_alert_reason_change_same_day_no_mail`).

*Assainissement du contenu (C-B-3, C-B-4).* Le corps porte des champs distants ; le **seul champ distant LIBRE** atteignant le mail est **`last_day`/`day`** (fait 19 : `provider` ∈ liste fermée, une charge dans `endpoints` n'atteint jamais le mail). *Test* **`probe_smtp_injection_crlf_sanitized`** : porte la charge `\r\n.\r\nRCPT TO:<x>` dans **`day`** (copie scratch) ⇒ **exactement 1 message, 1 destinataire, 0 commande injectée**. **Assainissement** = liste blanche **ASCII imprimable** + **longueur bornée** (règle aussi le 8-bit/MIME). *Mutant* **M-ii-5** (assainissement CR/LF retiré sur `day` ⇒ commande injectée ⇒ RED). **Dot-stuffing (C-B-4)** : *test PUR de l'encodeur DATA exporté* **`probe_smtp_dot_stuffing`** (ligne commençant par `.`, ligne `.` seule, fins de ligne normalisées CRLF) ; *mutant* **M-ii-17** (dot-stuffing retiré ⇒ RED).

*Vocabulaire du mail (fait 12).* PAS d'ajout de `\bscore\b` au walk (rougirait « scores » du tracker) ⇒ **test DÉDIÉ** **`probe_alert_mail_has_no_forbidden_vocab`** : sujet + corps composés pour **chaque** `reason` ne contiennent aucun de `/partner|autonomous|guarantee|verified|score/i` ni les patterns du scope `sentinel` (`cascade`, `would have alerted`, `reference price`, `adaptive …`).

*Aucun vrai mail pendant les tests (C-B-6) — POINT DE CONTRÔLE G2 NOMMÉ.* **Tout sous-processus de test** (`spawn`/`execFile`), **y compris les tests HÉRITÉS de -1b-i**, reçoit un **`env` EXPLICITE** purgé des `SMTP_*`/`ALERT_*` **ou** pointé sur loopback. Sans cela, un `SMTP_PASS` en variable **User-scope** sur la machine de l'orchestrateur (C-11 l'autorise) suffirait à faire partir un vrai mail depuis un test hérité. **Point de contrôle G2 nommé : `g2_no_test_can_send_real_mail`** (la G2 vérifie que chaque `spawn` du fichier de test porte un `env` explicite). *Réponse à Q10 (advisor)* : sur les sous-cas `--file` unhealthy **hérités**, asserter **`alert_error:"smtp_unconfigured"`** (env purgé) — **sans factice par sous-cas**, **sans `deepEqual` sur l'état complet** (qui casserait sur les nouveaux champs schema 2).

*Repli port 587 (C-NB-2).* **Item FORMÉ** (Q6 -1b : « 465 TLS implicite SEUL ; repli 587 STARTTLS = item, déclencheur "465 refusé au mail de test" ») ; **non codé** (pas de code mort STARTTLS non testé) ; propriétaire orchestrateur ; **porté dans la table §8** avec propriétaire + déclencheur.

*Dead-man / heartbeat (C-NB-2).* Résiduel « sonde morte = silence » au RUNBOOK (L-6b) — E-1 = surveillance croisée à **T-1b** + contrôle manuel du journal. **Heartbeat hebdomadaire = OPTION FORMÉE** (Q8 tranchée = former) sous E-1 ; **non codé** (time-driven, casse « piloté par l'état ») ; déclencheur = G0 T-1b ; propriétaire orchestrateur ; **porté dans la table §8**.

---

## 8. Item 8 — Items formés (classés, avec propriétaire + déclencheur)

| Sujet | Verdict | Détail (déclencheur + propriétaire) |
|---|---|---|
| **`health.json`** (Q1 du G0) | **ITEM FORMÉ** | touche `run.ts` + redéploiement live du site (hors périmètre) ; déclencheur : 1er incident qu'un créneau FATAL sur jour sain aurait masqué ; propriétaire orchestrateur |
| **`STUB_SRC`** (stub `fetch` copié) | **ITEM FORMÉ** | les tests -1b-ii utilisent un **factice SMTP `node:net`**, pas ce stub ; déclencheur : toute évolution du stub ; propriétaire orchestrateur |
| **Couplage ordre-de-hash dupliqué** (31 champs) | **ITEM FORMÉ (garde vivante)** | `probe_hashed_fields_order_equals_sentinel` rougira si l'ordre dérive ; propriétaire orchestrateur |
| **Dernier `line_hash`** (anti-réécriture) — **C-B-10, re-formé NON circulaire** | **ITEM FORMÉ** | **Déclencheur (corrigé, non circulaire)** : « **G0 T-1b (surveillance croisée) OU premier incident de réécriture** » ; propriétaire orchestrateur. **Argument de subsomption CORRIGÉ** : le digest cross-check attrape une réécriture de la **dernière ligne** (son `digest_T` change) MAIS **PAS une réécriture COHÉRENTE de tout l'historique** si `state.json` est réécrit **de pair** (alors `state.digest === digest_T` reste vrai) ⇒ le dernier `line_hash` mémorisé dans `narabi.json` sert **précisément** contre cette réécriture cohérente que le cross-check ne voit pas. **Q6 tranché = FORMER** (pas d'inclusion en -1b-ii). |
| **587 STARTTLS + dead-man/heartbeat** (C-NB-2) | **ITEMS FORMÉS** | 587 : déclencheur « 465 refusé au mail de test » ; heartbeat : déclencheur G0 T-1b ; propriétaire orchestrateur |
| **RSS Linux** (C-V-3, C-NB-7) | **ITEM FORMÉ + assertion -b** | confirmer au **premier run DÉPLOYÉ** (`journalctl`/`systemd-cgtop`) ; **-b assert `MemoryMax ≥ 13 × (MAX_MAX_BYTES + STATE_MAX_BYTES)`** vu le 2ᵉ GET ; propriétaire orchestrateur |
| **Preuve Linux fuseau CI-UTC + injection `--import`** | **ITEM FORMÉ** | non mesurable sur Windows = **premier run CI** sur le commit plié ; propriétaire orchestrateur |

---

## 9. Item 9 — Tuyaux (règle de Branchement) — **DÉCLARÉS par sous-lot + test d'intégration NON-LLM**

| Tuyau | Sous-lot | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|---|
| décision → mail SMTP | **-a** | `narabi.json` (transition, schema 2) écrit par la **vraie sonde** (-1b-i) | message `MAIL/RCPT/DATA` → relais Hostinger → `narabialerts@monarkgate.tech` | code + test ; **`upcoming → built` au PREMIER MAIL RÉEL** (décision 58) | **`probe_alert_composition_from_fixture`** |
| `monark-probe.service` `TimeoutStartSec` ← constantes | **-a puis -b** | `MAX_SMTP_DEADLINE_MS` + bornes GET (`:54`) | l'unité `:29` (relevée en -a, **RE-relevée en -b** avec `+GET₂`) | code + test | `probe_timer_multiple_shots` (recalcul depuis les constantes) |
| surface `state.json` → cross-check | **-b** | `state.json` publié (`run.ts:189-191`) | `narabi.json` `{state_checked, reason:"state_mismatch"?}` | code + test ; `upcoming` | `probe_state_digest_cross_check` (oracle `NARABI_SNAPSHOT`) |
| `monark-sentinel.service` `TimeoutStartSec` | **-b (édition+test) ; déploiement = E-5** | `RUN_DURATION_D_SEC` + timer | l'unité du **VPS SITE** | **code + test ; wired au redéploiement SITE (E-5)** | `probe_sentinel_timeoutstartsec_inter_unit_coherence` |

*Note tuyau `TimeoutStartSec` probe (advisor #7).* Il est **touché deux fois** : fixé en **-a** depuis `GET₁ + SMTP_DEADLINE + marge`, puis **REHAUSSÉ en -b** pour `+ GET₂` ; `probe_timer_multiple_shots` recalcule depuis les constantes exportées à chaque sous-lot. Déclaré pour ne pas laisser une pièce sans fil.

*État de registre.* **Rien n'est « built »** avant le premier mail réel (décision 58, CA-11 ; `fleet.ts` INTACT). Le tuyau `monark-sentinel TimeoutStartSec` est **« code + test ; wired au redéploiement SITE »** (E-5) — distinct de Bell.

*Test NOMMÉ `probe_alert_composition_from_fixture` (CA-11 durci, BRANCHÉ)* : sous-processus de la **vraie sonde** avec `--file` = fixture timeline RÉELLE + `--now` produisant un `lag` → la sonde **écrit un vrai `narabi.json`** ET, sur la transition →unhealthy, se connecte à un **factice SMTP `node:net` loopback** (env EXPLICITE, C-B-6) qui **capture `MAIL/RCPT/DATA`** portant `ALERT_TO` + `reason` ; **re-run même jour UTC** ⇒ **0 nouveau mail** ; **rétablissement piloté par l'état** ⇒ **1 mail « recovered »** puis silence. La composition **EXÉCUTE depuis l'artefact réel**.

---

## 10. Livrables, tests, mutants, R-25, déploiement, MAST — **PAR SOUS-LOT**

### 10.1 Livrables (liste fermée, par sous-lot)
| # | Fichier | Contenu | Sous-lot |
|---|---|---|---|
| L-1a | `scripts/probe-narabi.mjs` | schema 2 (lecture bootstrap C-B-5) ; transitions →unhealthy/→healthy (C-2, ordre après 250) ; rappel quotidien UTC (E-3) ; anti-tempête (borne VRAIE C-B-7) ; **client SMTP built-ins** `node:tls` 465 implicite, AUTH PLAIN+LOGIN, TLS≥1.2 cert vérifié, **`MAX_SMTP_DEADLINE_MS`** + bornes octets (C-B-2), **`alert_error` ensemble fermé** (C-B-1), assainissement CR/LF sur `day` + **dot-stuffing** (C-B-3/4), sujet constant + **en-têtes** (C-NB-8) ; **garde flag inconnu ⇒ erreur** (C-B-13) ; connecteur INJECTABLE | -1b-ii-a |
| L-1a′ | `scripts/probe-narabi.d.mts` | **OBLIGATOIRE (typecheck G1)** : exports du client SMTP, `evaluate` élargie, type schema 2, enum `alert_error`, `reason` gagne `state_mismatch`/`state_unreachable` (calque C-G2D-4) ; **hors `vocab-banned.json`** (type-only) | -1b-ii-a |
| L-2a | `test/probe-narabi.test.ts` | tests -a (§10.2) ; **réconciliation des tests -1b-i hérités** (env explicite C-B-6, `alert_error:"smtp_unconfigured"`, pas de `deepEqual` complet — Q10) ; **point de contrôle G2 `g2_no_test_can_send_real_mail`** | -1b-ii-a |
| L-3a | `deploy/monark-probe.service` | `EnvironmentFile=/etc/monark/probe.env` **SANS `-`** (C-8) ; **`TimeoutStartSec` relevé** = `GET₁+SMTP_DEADLINE+marge` | -1b-ii-a |
| L-1b | `scripts/probe-narabi.mjs` (2ᵉ passe) | 2ᵉ GET borné `state.json` (`PROBE_STATE_URL` défaut C-B-12) + `state_mismatch` + **`state_unreachable`** (Q4) + précédence (advisor #8) ; **tueur réessai GET** (item 4) ; `STATE_MAX_BYTES`/`STATE_TIMEOUT_MS` exportées | -1b-ii-b |
| L-1b′ | `scripts/probe-narabi.d.mts` (2ᵉ passe) | `STATE_MAX_BYTES`/`STATE_TIMEOUT_MS`, `RUN_DURATION_D_SEC` | -1b-ii-b |
| L-2b | `test/probe-narabi.test.ts` (2ᵉ passe) | tests -b (§10.2) | -1b-ii-b |
| L-3b | `deploy/monark-probe.service` (2ᵉ passe) | **`TimeoutStartSec` de Bell RECALCULÉ `+GET₂`** (advisor #7 : l'unité Bell est touchée DEUX fois — L-3a `GET₁+SMTP_DEADLINE+marge`, puis L-3b `+GET₂`) ; `probe_timer_multiple_shots` recalcule depuis les constantes | -1b-ii-b |
| L-4b | `deploy/monark-sentinel.service` | ajout `TimeoutStartSec = max(300, ⌈3D/60⌉·60)` (item 3, C-NB-5) — **VPS SITE, déploiement = E-5** | -1b-ii-b |
| L-6a | docs (RUNBOOK `:189`, ADR `:81`, §6 par SHA) | **orchestrateur, au G7 de -1b-i** | (hors -1b-ii) |
| L-6b | docs (ADR `:82`, schema 2, résiduels, commandes déploiement, PLI) | dans -1b-ii | -1b-ii-a/-b |

### 10.2 Tests nommés (built-ins ; sous-processus + factices loopback, env EXPLICITE C-B-6)
**-1b-ii-a** : `probe_alert_composition_from_fixture` (CA-11) ; `probe_alert_retries_until_delivered` (C-2, exactement 1 mail) ; `probe_alert_daily_reminder_once_per_utc_day` (E-3 + **sous-cas FLAP** C-B-7) ; `probe_alert_reason_change_same_day_no_mail` (C-3) ; `probe_secret_never_printed` (C-B-1, jetons du fil + mot de passe brut) ; `probe_smtp_global_deadline` (C-B-2, goutte-à-goutte + muet-après-DATA) ; `probe_smtp_injection_crlf_sanitized` (C-B-3, vecteur `day`) ; `probe_smtp_dot_stuffing` (C-B-4, encodeur pur) ; `probe_smtp_unconfigured_is_noisy` (C-8) ; `probe_smtp_unreachable_closed_port_and_timeout` (C-3 SMTP) ; `probe_smtp_implicit_tls_never_speaks_plaintext` (C-B-8) ; `probe_smtp_tls_options_pinned` (C-B-8) ; `probe_smtp_refuses_plaintext_off_loopback` ; `probe_smtp_auth_plain_and_login` (fait 16) ; `probe_smtp_headers_wellformed` (C-NB-8) ; `probe_reads_missing_or_corrupt_state_as_bootstrap` (C-B-5) + sous-cas `probe_reads_schema1_state_without_crash` (Doute-4 mandaté) ; `probe_smtp_failure_leaves_narabi_written` (C-NB-10) ; `probe_alert_mail_has_no_forbidden_vocab` (fait 12) ; `probe_timer_multiple_shots` MAJ (env obligatoire + `TimeoutStartSec` -a) ; point de contrôle `g2_no_test_can_send_real_mail`.
**-1b-ii-b** : `probe_state_digest_cross_check` (item 2, dérivation par défaut C-B-12) ; `probe_state_unreachable_precedence` (Q4, advisor #8) ; `probe_get_retries_exactly_n_plus_one` (item 4) ; `probe_sentinel_timeoutstartsec_inter_unit_coherence` (item 3, bornes haute ET basse) ; `probe_timer_multiple_shots` RE-MAJ (`+GET₂`).

### 10.3 Mutants imposés (liste fermée par sous-lot ; chacun RED puis restauré sha-exact, jamais `git checkout`)
**-1b-ii-a (17)** : **M-ii-1** `alerted:=true` avant 250 (C-2) ; **M-ii-2** ré-alerte sur `reason` même jour (C-3) ; **M-ii-3** `SMTP_PASS`/base64 imprimé (C-B-1) ; **M-ii-4** plaintext hors loopback (C-B-8) ; **M-ii-5** assainissement CR/LF retiré sur `day` ⇒ injection (C-B-3) ; **M-ii-6** `smtp_unconfigured` sauté (exit 0) (C-8) ; **M-ii-7** `rejectUnauthorized:false` (C-B-8) ; **M-ii-8** « rappel à chaque tir » / « aucun rappel » (E-3) ; **M-ii-11** parseur EHLO mono-ligne (AUTH) ; **M-ii-12** `minVersion` TLS retiré (C-B-8) ; **M-ii-15** réponse serveur brute copiée dans `alert_error`/message (C-B-1) ; **M-ii-16** timeout d'inactivité seul, sans échéance globale (C-B-2) ; **M-ii-17** dot-stuffing retiré (C-B-4) ; **M-ii-18** crash sur JSON d'état invalide (C-B-5) ; **M-ii-19** `net.connect` partout / EHLO avant TLS (C-B-8) ; **M-ii-20** connecteur SMTP jette ⇒ FATAL, `narabi.json` non écrit (C-NB-10) ; **M-ii-21** flag CLI inconnu ignoré (pas d'erreur) (C-B-13).
**-1b-ii-b (5)** : **M-ii-9** cross-check digest sauté (item 2) ; **M-ii-10** `attempt <= retries + 1` @`:246` (item 4) ; **M-ii-13** `TimeoutStartSec` sentinel > borne HAUTE (item 3) ; **M-ii-14** `T_s < 3D`, borne BASSE (C-NB-5) ; **M-ii-22** précédence `state_unreachable` fausse (Q4).
*(Renumérotation déclarée, R-21 : `M-ii-14` est réservé par le validateur, C-NB-5, à la borne basse `T_s < 3D` ; les six mutants -a ajoutés au pli prennent donc `M-ii-15..21`, et la précédence `state_unreachable` `M-ii-22`.)*

### 10.4 Projection R-25 PAR SOUS-LOT (pathspec `ci.yml:65` : `git diff --shortstat origin/<base>...HEAD -- .` avec `docs/**/*.md`, `fixtures/**` exclus ; plafond **1 205** `ci.yml:43`)
**Méthode.** Projection brut par composant (granularité §10.4 pré-pli) **× le facteur d'inflation MESURÉ sur -1b-i = 2,08** (projeté 525 brut ⇒ mesuré 1 094, avis validateur). **Ce facteur SUPERSÈDE la bande ×1,07–1,7** du brouillon (réfutée par AM-1, précédent ×2,08). Le R-25 qui **fait foi** = `git diff --shortstat` sous la pathspec **au gel de CHAQUE sous-lot** (base = branche APRÈS fusion de -1b-i **et** ci-site pour -a ; base = branche APRÈS fusion de -a pour -b).

| Sous-lot | Brut projeté (composants) | × 2,08 ⇒ attendu au gel | vs plafond 1 205 |
|---|---|---|---|
| **-1b-ii-a** | src alerte+SMTP ~180-210 + sidecar ~15 + tests -a ~240-270 + `monark-probe.service` ~5 = **~440-500** | **~915-1 040** | **< 1 205** (marge ~165-290) ; au-dessus de la cible 700, **sous le seuil d'alerte ~1 100** |
| **-1b-ii-b** | src 2ᵉ GET+state_mismatch+state_unreachable+tueur réessai ~40-55 + sidecar ~5-8 + tests -b ~80 + `monark-sentinel.service` ~3 + `monark-probe.service` (2ᵉ passe) ~2 = **~130-148** | **~270-308** | **< 1 205** (large) |
| **Combiné (si UN lot)** | ~570-648 | **~1 186-1 348** | **> 1 205 ⇒ SCISSION OBLIGATOIRE** (confirme ~1 110-1 250 du validateur ; l'écart au brouillon vient du scope ajouté par le pli) |

**G2 dédiée par sous-lot (C-NB-6)** : une **G2 SMTP dédiée par un relecteur Opus 4.8 séparé** pour **-a ET -b** (le client SMTP et les cross-checks méritent chacun une revue fraîche).

### 10.5 Plan de déploiement (SÉPARÉ ; orchestrateur seul ; décision 72 = GO Bell d'avance ; le worker n'exécute JAMAIS)
S'exécute **après G7 + checkpoint-2 de -1b-ii-a ET -1b-ii-b** (les deux, décision 72). Deux surfaces distinctes :

**A. VPS Bell (GO 72 couvre)** — `bell.monarkgate.tech`, décision 57 :
1. `git archive` du **commit fusionné `--no-ff` de `lot/etude-suite`, par SHA consigné** (RUNBOOK §6 amendé L-6a) → `/opt/monark-probe/probe-narabi.mjs` (built-ins) + `probe-narabi.d.mts` + unités ; `useradd --system probe` ; `install -d -o probe /var/lib/monark-probe`.
2. **Secret (l'INVESTISSEUR le fait)** : pose `/etc/monark/probe.env` **`0600 root:root`** (C-NB-9, lu par PID 1) **par ssh STDIN** — `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER=narabialerts@monarkgate.tech`, **`SMTP_PASS="<mot de passe qu'il a saisi, CHANTIERS:190 — QUOTÉ, C-NB-9>"`**, `SMTP_TLS=implicit`, `ALERT_FROM=narabialerts@monarkgate.tech`, `ALERT_TO=narabialerts@monarkgate.tech` — vérifié par **sha256 des deux côtés**, jamais `cat`, jamais `set -x`, jamais vu par un agent. L'investisseur **confirme le coût du plan Hostinger** (E-2). L'orchestrateur **annonce le créneau et donne la commande**.
3. **Timer + SIMULATION (C-B-13 — `--state` RAYÉ)** : `systemd-analyze calendar` (≥ 10:30) ; `enable --now` ; **simulation par `systemd-run --uid=probe -p EnvironmentFile=/etc/monark/probe.env node /opt/monark-probe/probe-narabi.mjs --file <fixture de lag livrée dans l'archive> --now <J+2>`** (OU mode URL avec `--now` à J+2), écrivant un `narabi.json` en **`--out <scratch>`** — **JAMAIS** un `source` du fichier d'environnement dans le shell de l'orchestrateur (le secret serait vu par un agent). **Le flag `--state` N'EXISTE PAS** (fait 18) et est **RAYÉ partout** ; `--out <scratch>` = chemin lu ET écrit par la machine à états ; `--state-file` réservé à l'injection de `state.json`. ⇒ **premier mail reçu** = déclencheur **`upcoming → built`** ; le `narabi.json` de PRODUCTION reste intact.
4. **Rétablissement** : un retour sain envoie **un** mail « recovered » puis se tait.
5. **Confirmations orchestrateur au déploiement (items ouverts)** : URL sert **200 directement** (aucune 3xx) ; **TLS 1.2+ réel sur 465 + hostname erroné refusé** (jamais `rejectUnauthorized:false`) ; **mécanisme AUTH observé** (PLAIN/LOGIN, sans imprimer `SMTP_PASS`) ; **RSS pas d'OOM** ; **preuve Linux fuseau + `--import`** (premier run CI) ; en-têtes `Authentication-Results`/`DKIM-Signature`/`Received-SPF` du 1er mail ; **capture réelle post-déploiement sha-pinnée `chainstack.com` vs `p2pify.com`** (item hérité C-5 (b), C-NB-3).

**B. VPS SITE (E-5 — GO 72 NE couvre PAS)** — `monarkgate.tech`, redéploiement de `monark-sentinel.service` :
6. **Après G7 + checkpoint-2 de -1b-ii-b, SOUS go investisseur E-5** : redéploiement de l'unité selon **RUNBOOK §6** (`git archive` du commit fusionné par SHA, `daemon-reload`, `restart`), puis **`systemctl show -p TimeoutStartUSec monark-sentinel.service`** (vérifie `T_s`). **Propriétaire orchestrateur.** **Risque déclaré** : un kill systemd au milieu d'un `appendFileSync` (`run.ts:188-191`) sur un fichier append-only chaîné peut **déchirer la timeline** ⇒ `T_s = 3×D` (plancher 300 s) le tient loin de D.

### 10.6 Risques (MAST — 14 modes ; RÉÉCRIT C-B-7)
- **Alerte perdue à jamais sur échec SMTP** ⇒ C-2 at-least-once (`alerted:=true` après 250 seul) ; `probe_alert_retries_until_delivered`, M-ii-1.
- **Tempête d'alertes** ⇒ rappel quotidien UTC + anti-tempête ; **borne VRAIE = ≤ 1 mail/tir** (3/jour + rattrapage + manuels ; 1/jour UTC en panne soutenue ; flap acceptable) ; M-ii-2/M-ii-8, sous-cas FLAP.
- **Secret en log / dépôt** ⇒ `EnvironmentFile 0600 root:root` hors dépôt, quoté (C-NB-9), jamais imprimé (mot de passe **ni** base64 AUTH) ; **`alert_error` ensemble fermé, jamais la réponse serveur** (C-B-1) ; `no_secret_in_repo` ; M-ii-3/M-ii-15, `probe_secret_never_printed`.
- **Cert TLS non vérifié / downgrade / plaintext** ⇒ `rejectUnauthorized:true` + `minVersion TLSv1.2` + `servername` ; **prouvé par EXÉCUTION sans cert** (M-ii-19), aiguillage épinglé (M-ii-4/7/12) ; handshake réel = item déploiement.
- **Injection SMTP (CR/LF)** ⇒ assainissement du **seul champ libre `day`** + dot-stuffing + sujet constant ; M-ii-5/M-ii-17.
- **Config SMTP absente ⇒ muette** ⇒ `smtp_unconfigured` bruyant (exit 1) + validation `ALERT_TO/FROM` ; C-8/C-NB-8, M-ii-6.
- **Goutte-à-goutte / serveur muet** ⇒ **`MAX_SMTP_DEADLINE_MS` globale** + bornes octets ; M-ii-16, `probe_smtp_global_deadline`.
- **État déchiré / illisible** ⇒ bootstrap `alerted:false` (M-ii-18) ; borne dégradée ≤ 1 mail/tir déclarée.
- **Vrai mail pendant les tests** ⇒ env EXPLICITE purgé/loopback sur **tout** `spawn` (hérités compris) ; point de contrôle G2 `g2_no_test_can_send_real_mail` (C-B-6).
- **AUTH mal négocié** ⇒ PLAIN+LOGIN + parse `250-` ; M-ii-11 ; réel confirmé au déploiement.
- **Sonde muette (dead-man)** ⇒ résiduel « sonde morte = silence » + E-1 croisée à T-1b ; heartbeat = option formée.
- **Double-envoi sur crash entre 250 et persist** ⇒ résiduel borné ≤ +1/jour ACCEPTABLE (at-least-once).
- **`probe_error` local sans mail ce run-là** ⇒ résiduel E-4 déclaré (faute disque Bell) ; option A « aucune exception » par défaut.
- **`TimeoutStartSec` sentinel tue un run au milieu de l'append** ⇒ `T_s = 3×D`, plancher 300 s ; **E-5** ; M-ii-13/M-ii-14.
- **Publication partielle non vue** ⇒ digest cross-check `state_mismatch` (fenêtre `:190`→`:191`) + `state_unreachable` (Q4) ; M-ii-9/M-ii-22.
- **Flag fantôme `--state` écrasant la production** ⇒ RAYÉ + garde flag inconnu ⇒ erreur ; M-ii-21 (C-B-13).
- **Dépassement quota Hostinger** ⇒ ≤ 1 mail/tir ≪ 3 000/jour (fait 16).
- **Régression des tests -1b-i hérités** ⇒ réconciliation L-2a (Q10), G1 + G2.
- **Pièce sans fil (`monark-sentinel` non redéployé)** ⇒ tuyau « wired au redéploiement SITE (E-5) » ; registre honnête.

---

## Questions Q1..Q10 — **TRANCHÉES** (zéro dette : chacune close ou formée)
- **Q1 (probe_error local → mail)** — **SUPERSÉDÉE par E-4** (généralisée à tout l'ensemble fermé `unhealthy`). Code démarre « aucune exception » ; réponse E-4 due avant le gel de -a.
- **Q2 (secret)** — **TRANCHÉ = `EnvironmentFile` SANS `-`** ; `LoadCredential` = item de durcissement formé (déclencheur `systemctl --version ≥ 247`).
- **Q3 (TLS test)** — **TRANCHÉ = plaintext-loopback + test d'exécution `probe_smtp_implicit_tls_never_speaks_plaintext` + aiguillage épinglé** (sans cert) ; handshake réel = item déploiement (C-B-8).
- **Q4 (2ᵉ GET)** — **TRANCHÉ = unhealthy, raison distincte `state_unreachable`** ; précédence `state_unreachable > state_mismatch`, épinglée par `probe_state_unreachable_precedence`.
- **Q5 (seam)** — **TRANCHÉ = FERME** ; -a (alerte) puis -b (durcissement), séquentiels.
- **Q6 (`last_line_hash`)** — **TRANCHÉ = FORMER** ; déclencheur non circulaire (C-B-10) ; argument de subsomption corrigé.
- **Q7 (`probe_error` uniforme)** — **TRANCHÉ = UNIFORME** (ne pas scinder ; n'ébranle pas `probe_io_fault…` de -1b-i).
- **Q8 (heartbeat)** — **TRANCHÉ = FORMER** (déclencheur G0 T-1b) ; non codé.
- **Q9 (`TimeoutStartSec` sentinel)** — **TRANCHÉ** : -1b-ii-b **possède** l'édition + le test inter-unités, **PAS** le déploiement (E-5) ni le déplacement de DEADLINE (qui reste dans -1b-i avant son G7) ; crash entre 250 et écriture ⇒ double mail borné ACCEPTABLE.
- **Q10 (tests -1b-i hérités)** — **TRANCHÉ** : asserter `alert_error:"smtp_unconfigured"` (env purgé C-B-6), **sans factice par sous-cas**, **sans `deepEqual` complet** ; tâche d'intégration G1/G2 (L-2a).

## Escalades EN ATTENTE — **E-4, E-5** (verbatim ; aucune réponse présumée)
- **E-4** (verbatim) : « La sonde vous écrit sur TOUT état "unhealthy", liste fermée : retard (`lag`), chaîne rompue, surface injoignable, corps trop gros, URL refusée, timeline illisible (`probe_error`), `state.json` incohérent ou injoignable. Votre décision 58 ne nommait que retard et chaîne rompue. Voulez-vous une exception — journal seul, pas de mail — pour l'un de ces cas ? » — **reco : aucune exception** ; le code démarre sous « aucune exception » ; **réponse due avant le gel de -a** ; résiduel : une faute disque sur Bell ne produit aucun mail ce run-là.
- **E-5** (verbatim) : « Votre GO 72 couvre Bell. Borner le démarrage du sentinel (`TimeoutStartSec`) exige de redéployer son unité sur le VPS du site, service de production. La borne protège la cohérence de l'échéance, mais un kill en plein append peut déchirer la timeline chaînée. Accordez-vous ce redéploiement, après G7 et checkpoint-2 de -1b-ii-b, selon RUNBOOK §6 ? » — **reco : oui, avec `T_s = 3×D` et vérification `systemctl show`.**

## PLI checkpoint-1 delta — table correction → section
| Correction | Type | Pliée dans |
|---|---|---|
| **C-B-1** `alert_error` ensemble fermé, jamais réponse serveur brute | Bloq. | Fait 17 ; §6 (C-B-1) ; §10.2/10.3 (`probe_secret_never_printed`, M-ii-3/M-ii-15) ; §10.6 |
| **C-B-2** échéance GLOBALE `MAX_SMTP_DEADLINE_MS` + bornes octets | Bloq. | §6 (C-B-2) ; §10.2 (`probe_smtp_global_deadline`) ; M-ii-16 ; tuyau `TimeoutStartSec` probe |
| **C-B-3** vecteur d'injection = `day` (pas `provider`/`endpoints`) | Bloq. | Fait 19 ; §7 ; `probe_smtp_injection_crlf_sanitized` ; M-ii-5 |
| **C-B-4** dot-stuffing (test pur de l'encodeur) | Bloq. | §7 ; `probe_smtp_dot_stuffing` ; M-ii-17 |
| **C-B-5** lecture d'état absent/corrompu/schéma inconnu = bootstrap | Bloq. | §7 ; `probe_reads_missing_or_corrupt_state_as_bootstrap` ; M-ii-18 ; borne dégradée |
| **C-B-6** aucun test n'envoie un vrai mail (env explicite, hérités compris) | Bloq. | §7 ; L-2a ; `g2_no_test_can_send_real_mail` ; réponse Q10 |
| **C-B-7** « ≤ 2 mails/jour » FAUX ⇒ borne VRAIE ≤ 1/tir ; §7 & §10.6 réécrites | Bloq. | §7 (borne VRAIE + FLAP) ; §10.6 |
| **C-B-8** TLS prouvé PAR EXÉCUTION sans cert + aiguillage épinglé | Bloq. | §6 (C-B-8) ; `probe_smtp_implicit_tls_never_speaks_plaintext`/`_tls_options_pinned` ; M-ii-4/7/12/19 |
| **C-B-9** scinder L-6 en L-6a (G7 -1b-i) / L-6b (-1b-ii) | Bloq. | §1 ; §10.1 |
| **C-B-10** dernier `line_hash` : déclencheur non circulaire + subsomption corrigée | Bloq. | §8 (ligne dédiée) ; Q6 |
| **C-B-11** `monark-sentinel.service` = VPS SITE ⇒ étape déploiement SITE + E-5 | Bloq. | Fait 20 ; §3 ; §9 ; §10.5-B ; E-5 |
| **C-B-12** cross-check exerce la dérivation par défaut (un serveur, sans `PROBE_STATE_URL`) | Bloq. | §2 ; `probe_state_digest_cross_check` |
| **C-B-13** `--state` n'existe pas ⇒ rayé + `systemd-run` + garde flag inconnu | Bloq. | Fait 18 ; §10.5-A-3 ; M-ii-21 ; L-1a |
| **C-NB-1** fait 1 « no npm » auto-cité ou sourcé | Non-b. | Fait 1 |
| **C-NB-2** 587 + dead-man/heartbeat dans la table §8 (propriétaire+déclencheur) | Non-b. | §7 ; §8 |
| **C-NB-3** capture réelle post-déploiement sha-pinnée (C-5 b) | Non-b. | §10.5-A-5 |
| **C-NB-4** course GET₁/GET₂ : résiduel + précédence `state_unreachable` épinglée | Non-b. | §2 |
| **C-NB-5** formule fermée `T_s = max(300, ⌈3D/60⌉·60)` + borne basse M-ii-14 | Non-b. | §3 ; §10.3 |
| **C-NB-6** G2 SMTP dédiée par relecteur Opus 4.8 séparé, -a ET -b | Non-b. | §10.4 |
| **C-NB-7** assertion RSS `MemoryMax ≥ 13 × (MAX_MAX_BYTES + STATE_MAX_BYTES)` | Non-b. | §2 ; §8 (RSS) |
| **C-NB-8** en-têtes du mail + validation `ALERT_TO/FROM` | Non-b. | §6 ; `probe_smtp_headers_wellformed` |
| **C-NB-9** secret `0600 root:root` + quotage `SMTP_PASS` au RUNBOOK | Non-b. | §6 ; §10.5-A-2 |
| **C-NB-10** échec SMTP laisse `narabi.json` écrit (exception synchrone comprise) | Non-b. | §5 ; `probe_smtp_failure_leaves_narabi_written` ; M-ii-20 |
| **C-NB-11** fait 6 (ordre `:188-:191`) + 398 octets + dates UTC | Non-b. | Faits 5, 6 |
| **Q1..Q10** tranchées | — | §Questions |
| **E-4, E-5** escalades formées | — | §Escalades |

## Provenance
Généré par worker rédacteur du PLI checkpoint-1 delta **`claude-opus-4-8[1m]`**, effort max, 2026-09-21 (horloge `2026-09-21T00:11Z`), à la demande de l'orchestrateur `claude-fable-5-1`. R-20 (aucun commit, aucun workflow, aucune action sortante — lecture des dépôts `F:\Monark` (HEAD `2ca72e7`) + `F:\Monark-wt-narabi1b` (HEAD `331c169`) + `node` offline pour mesurer les 398 octets de `state.json` et re-vérifier `sha256(stateJson)==stateSha256` et l'invariant digest ; aucun réseau ; rien sur C:). R-21 (chaque fait porte son `fichier:ligne` ouvert first-hand ou sa mesure ; sha du fichier source vérifié `77d1d883…`). Avis plié : `validateur-humain` `claude-fable-5-1`, 2026-09-20 23:41→23:54 UTC, sur l'artefact `21111de`/`77d1d883…`. Advisor intégré (Fable 5.1) consulté AVANT rédaction (18 points de cohérence intégrés : cible tmp lue avant écrasement ; `ci.yml:43/65` vérifiés ; deux « states » nommés ; C-NB-10 option 2 ; -a/-b séquentiels + `TimeoutStartSec` probe touché deux fois ; précédence `state_unreachable` + course GET₁/GET₂ ; sous-cas FLAP ; env explicite hérités ; `T_s` fermé + bornes ; renumérotation mutants ; sidecar hors vocab-scope). Plans qui font foi : `docs/G0-lot-narabi-ops-1b.md`, `docs/CHECKPOINT1-lot-narabi-ops-1b.md`, `docs/PLI-lot-narabi-ops-1b-i.md` (CHANTIERS/JOURNAL), `docs/CHECKPOINT2-lot-narabi-ops-1b-i.md`, `docs/CHECKPOINT2-DELTA-lot-narabi-ops-1b-i.md`, `docs/G2-DELTA2-lot-narabi-ops-1b-i.md`.


## Décisions investisseur reçues après le pli (2026-09-21, `docs/CHANTIERS.md` décisions 88 et 92 — consigné par l'orchestrateur)
- **E-4 — RÉPONDUE : aucune exception** (décision 88, verbatim « ta reco ») : un mail pour tout état « unhealthy » de la liste fermée. Le code de -1b-ii-a garde donc le prédicat sous lequel il démarre.
- **E-5 — RÉPONDUE : redéploiement ACCORDÉ** (décision 92, verbatim « oui pour le redéploiment ») : unité `monark-sentinel.service` sur le VPS site, après G7 et checkpoint-2 de -1b-ii-b, RUNBOOK §6, `T_s = max(300, ⌈3D/60⌉·60)`, vérification `systemctl show -p TimeoutStartUSec`.
