# L — Lecture Hostinger SMTP (relais alerte mail Narabi, sous-lot NARABI-OPS-1b-ii)

## 0. Identité et méthode

- **Modèle résolu (Gate 0)** : `claude-sonnet-5` (Sonnet 5), effort max — conforme au préfixe attendu `claude-sonnet-5`.
- **Rôle** : lecteur/chercheur Sonnet 5, mission NARABI-OPS-1b-ii, prérequis [lu] avant G1 de -1b-ii (C-14 du checkpoint-1, `docs/CHECKPOINT1-lot-narabi-ops-1b.md`).
- **Déclencheur** : le fait 10 du G0 (`docs/G0-lot-narabi-ops-1b.md:17`) est marqué **[lu worker seul]** (WebFetch non relu par le validateur) ; C-14 exige une reconfirmation par un chercheur Sonnet 5, avec items AUTH/tarif/quotas/SPF-DKIM routés vers ce chercheur.
- **Session** : recherche menée le 2026-09-20, horloge UTC (`date -u`) de 18:18:21Z (début) à 18:29:47Z (fin de collecte) et au-delà pour l'écriture.
- **Contraintes tenues** : aucun commit ; aucun compte/login/CAPTCHA franchi (toutes les pages lues sont publiques, aucune authentification hPanel) ; aucun envoi de mail ; **aucune connexion SMTP réelle** — tout accès s'est fait par requêtes HTTPS GET (port 443) vers des pages web publiques via `curl` et un outil de recherche web, **jamais** `openssl s_client` ni `telnet` vers un serveur de mail, **jamais** de contact avec les ports 465/587/25 de `smtp.hostinger.com` ; aucun domaine refusé par un outil au cours de cette recherche (tous les fetches ont renvoyé HTTP 200) ; **advisor intégré non appelé** (règle lecteurs/chercheurs, filtre de régurgitation — CLAUDE.md 2026-09-05 : cette session a lu de larges pages HTML brutes de hostinger.com, un appel advisor aurait risqué le blocage « content filtering » et la perte de la lecture ; aucun blocage n'a d'ailleurs nécessité de consultation) ; citations ≤ 25 mots ; rien écrit sur `C:`.
- **Méthode de vérification** : chaque page candidate a été (a) trouvée via recherche web ciblée (outil de recherche, domaine `hostinger.com` filtré quand possible), puis (b) récupérée en **HTML brut via `curl`** (user-agent navigateur, `-L` pour suivre les redirections) et lue avec `Grep`/`Read` sur le fichier local — c'est le mode **« vérifié curl »** demandé par la mission. Quand une page est fortement rendue côté client (carrousel de prix Vue.js), le texte reste néanmoins présent dans le HTML servi par le serveur (confirmé en le lisant directement) ; les rares cas où seule une extraction de recherche a été utilisée sans re-vérification `curl` complète sont marqués **[2nd/recherche seule]**.
- **Portée des sources** : uniquement des sources **P1 primaires Hostinger** (centre d'aide `hostinger.com/support/...`, tutoriels `hostinger.com/tutorials/...`, pages produit/plan, CGU `hostinger.com/legal/...`). Deux sources tierces (forum Laracasts, Stack Overflow) sont apparues dans les résultats de recherche ; elles sont explicitement marquées **[2nd, P3]**, jamais utilisées comme preuve terminale, seulement comme indices non retenus.
- **Anomalie d'outillage observée** (hors périmètre des 7 questions, consignée pour l'orchestrateur) : le connecteur firecrawl exposé dans cette session porte l'UUID `1e993196-5288-40f1-bf6f-0cb66830757d` (outils `firecrawl_search`, `firecrawl_developer_search`, `firecrawl_research_*`), différent de l'UUID documenté dans CLAUDE.md (amendement 2026-09-19 : `6144e146-7ed5-4073-b7f2-864b9335f725`). Conforme à la fragilité déclarée dans la règle memstack (« à chaque bascule de compte, vérifier l'UUID exposé avant tout lancement de chercheur/lecteur ») — nouvelle rotation non reflétée dans le CLAUDE.md courant, probablement à mettre à jour par le mainteneur. Utilisé tel qu'exposé ; aucun blocage pour cette mission (l'outil de recherche a fonctionné normalement).
- **Distinction de produit à garder en tête (trouvée en cours de lecture, importante pour ne pas confondre les chiffres)** : Hostinger opère **plusieurs familles d'envoi de mail distinctes** sous des noms proches : (a) **Hostinger Mail / Business Email** (Starter/Standard/Premium — notre cas, boîte `narabialerts@monarkgate.tech`, SMTP AUTH sur `smtp.hostinger.com`) ; (b) **Titan Email** (backend tiers historique, limites et noms d'hôtes différents — au moins un fil communautaire trouvé confond les deux) ; (c) **« Server-based email sending »** = `PHP mail()`/sendmail depuis un hébergement web, limité à 10/minute et 100/jour — un chemin totalement différent, non authentifié par boîte ; (d) **Hostinger Reach** = produit d'e-mailing marketing/bulk séparé ; (e) **Hostinger Mail API & CLI** / **Agentic Mail** = fonctionnalités/produits pour l'envoi programmatique. Toutes les valeurs citées ci-dessous concernent (a) sauf mention contraire explicite.

---

## 1. Paramètres SMTP sortants officiels

**Hôte** : `smtp.hostinger.com` [lu, vérifié curl 2026-09-20]. Source : `https://www.hostinger.com/support/4305847-set-up-hostinger-email-on-your-applications-and-devices/` (URL demandée `support.hostinger.com/en/articles/4305847-...` redirige en HTTP 200 vers cette URL `www.hostinger.com/support/...`) et `https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/`.

**Ports / chiffrement** (table officielle, les deux pages ci-dessus, identique) :
- Port **465**, étiqueté **« SSL »** par Hostinger — c'est le port **primaire** listé dans le tableau de configuration (colonne « SMTP (Outgoing) »).
- Callout séparé : *« If you encounter SMTP encryption issues, use TLS or STARTTLS with port 587 instead. »* [lu, vérifié curl] — donc **587 est documenté comme repli**, pas comme option primaire à égalité.
- Remarque de terminologie : Hostinger nomme le 465 « SSL » ; dans l'usage technique actuel ce mode est le **TLS implicite** (« SSL » est un raccourci historique du fournisseur, pas une indication qu'un vrai SSLv3 legacy est utilisé — voir aussi le TLS minimum ci-dessous, qui s'applique explicitement à ce port).

**Mécanismes d'AUTH annoncés (PLAIN/LOGIN ?)** : **NON DOCUMENTÉ** par une source primaire Hostinger. Aucune des pages de configuration, tutoriels ou pages produit lues ne nomme explicitement le mécanisme SASL (`AUTH LOGIN`, `AUTH PLAIN`, etc.). Les exemples de code Hostinger eux-mêmes (tutoriel PHPMailer officiel, voir ci-dessous) se contentent de `SMTPAuth = true` sans préciser le mécanisme — la bibliothèque cliente négocie automatiquement selon ce que le serveur annonce en EHLO, et Hostinger ne documente pas ce que le serveur annonce. **[2nd, P3, non retenu comme preuve]** : un fil Laracasts (support communautaire, pas Hostinger) montre un message d'erreur PHPMailer citant les authentificateurs `"LOGIN"`, `"PLAIN"` tentés contre une boîte Hostinger — indicatif mais non autoritatif, et un fil Stack Overflow voisin sur « Nodemailer + Hostinger » précise explicitement *« Hostinger is not the host, but Titan »* — c'est-à-dire que certains problèmes rapportés concernent le backend **Titan Email** (produit distinct, voir §0), pas nécessairement `smtp.hostinger.com`. Ne pas construire de logique sur ces deux mécanismes sans les avoir vus dans la vraie négociation EHLO au déploiement (item, §Items à vérifier).

**Identifiant = adresse complète ?** OUI, confirmé [lu, vérifié curl] : *« You will also need your complete email address, like name@domain.tld, and your email account password when setting this up. »* (4305847) — cette exigence est énoncée pour la configuration IMAP/POP/SMTP en bloc (pas de distinction par protocole), et le tutoriel PHPMailer officiel de Hostinger le confirme dans son exemple (`$mail->Username = 'your@email.com';`, source : `https://www.hostinger.com/tutorials/how-to-send-emails-using-phpmailer/`, lignes autour de `$mail->SMTPAuth`/`Username`/`Password`/`SMTPSecure`/`Port`). Donc `SMTP_USER` = l'adresse complète de la boîte (`narabialerts@monarkgate.tech`), pas un login séparé.

**Exigences TLS (version minimale)** : **TLS 1.2 minimum, déjà en vigueur** — source dédiée et datée [lu, vérifié curl] : `https://www.hostinger.com/support/end-of-support-for-tls-1-0-and-1-1-protocols/` (« Updated 1 month ago » au 2026-09-20). Citations :
- *« To prevent any interruption to your email service, please verify that your devices... are configured to use TLS 1.2 or a more recent version before the scheduled decommission dates. »*
- Table « Timeline for protocol decommission » : phase-out **March 30, 2026** pour trois catégories de service, dont explicitement **« SMTP SSL, TLS (Outgoing Mail) »** (les deux autres lignes : « APIs, IMAP, POP, and MX records » et « MX (Incoming Mail) »).
- *« As of March 30, 2026, any connection attempt made via TLS 1.0 or 1.1 is automatically rejected. »*
- Comme la date de cette lecture (2026-09-20) est postérieure au 2026-03-30, **cette exigence est déjà effective** : un client SMTP qui négocierait TLS 1.0/1.1 vers `smtp.hostinger.com:465` serait rejeté. Node.js (`node:tls`) a par défaut un `minVersion` ≥ TLS 1.2 depuis plusieurs versions majeures — cohérent avec cette exigence sans configuration additionnelle, mais **à vérifier explicitement** au premier test réel (item).

---

## 2. Limites d'envoi du plan « Business Standard » (= « Standard Business Email »)

Source unique et complète [lu, vérifié curl 2026-09-20] : `https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/` (« Parameters and limits of Hostinger Mail », mise à jour « 3 days ago » au moment de la lecture). Cette page couvre exactement la famille de produit de notre boîte : *« Business Email plans: Standalone, professional email services available as Business Starter, Business Standard, or Business Premium. »* — le nom exact vu dans le G0 (« Standard Business Email ») correspond à **« Business Standard »** dans cette nomenclature (la page produit publique, §6, utilise l'ordre inversé « Standard » sans le mot « Business », mêmes trois paliers).

Table officielle « Business Email Plans » (colonnes Business Starter / **Business Standard** / Business Premium) :

| Paramètre | Business Starter | **Business Standard** | Business Premium |
|---|---|---|---|
| Storage limit | 5 GB | **20 GB** | 50 GB |
| Message limit (units) | 100000 | **200000** | 300000 |
| Daily message rate (Inbound/Outbound) | 1000/day | **3000/day** | 3000/day |
| Recipients per message (To, Cc, Bcc) | 100 | **100** | 100 |
| Forwarders (Hostinger dashboard) | 5 | **20** | 50 |
| Alias limit (per mailbox) | 5 | **10** | 50 |
| Alias limit (per domain) | 100 | **100** | 100 |
| AI Credits | 10/month | **Unlimited** | Unlimited (Fair Use Policy) |

Et, table séparée « Global Email Parameters » (mêmes pour tous les paliers payants) :
- Inbound email size (incl. attachments) : **50 MB**
- Outbound email size (incl. attachments) : **35 MB**
- Outbound attachment size : **25 MB**

**Précisions verbatim importantes** (callout de la page, [lu, vérifié curl]) :
- *« All limits in this article apply per individual mailbox – not per domain or per plan... Daily rates are calculated over a rolling 24-hour period. »* → ce n'est **pas** un compteur remis à zéro à minuit, mais une fenêtre glissante de 24h.
- *« The daily message rate applies separately to incoming and outgoing traffic. For example, a limit of 100 allows for 100 sent messages and 100 received messages in a 24-hour period. »* → donc **3000/jour sortant ET 3000/jour entrant séparément** pour Business Standard (pas un total combiné de 3000).
- *« every mailbox on your domain can send up to 1000 messages per day – the limit is not shared across mailboxes on the same domain »* (exemple donné pour Starter, même principe pour Standard).

**Que se passe-t-il au dépassement (rejet SMTP, code) ?** Hostinger documente le **comportement général** mais **pas le code SMTP précis** : source [lu, vérifié curl] `https://www.hostinger.com/tutorials/email-not-sending/` (« 10 common causes and fixes »), table des messages de rebond, ligne pertinente : *« Daily limit exceeded | You hit your sending quota | Your provider's limits »*. Cette même page renvoie explicitement à des tiers pour les codes précis : *« Gmail and other major mail providers publish their own documentation for SMTP error codes. »* → Hostinger **ne publie pas lui-même** ses codes numériques SMTP (ni pour le dépassement de quota, ni pour un échec d'authentification, voir §5). **NON DOCUMENTÉ** : code exact (550/421/4xx/5xx), et à quel moment le rejet intervient (à la commande `RCPT`/`DATA` d'une session en cours, ou en tant que bounce différé après acceptation).

**Notre besoin (« au plus quelques mails par jour vers la boîte elle-même ») est-il sans ambiguïté sous les limites ?** **OUI, sans ambiguïté, avec une très large marge.** D'après l'adjudication E-3 du G0 (rappel quotidien, un mail par jour UTC maximum tant que `unhealthy`, plus un mail de rétablissement), le pire cas plausible est de l'ordre de **1 à 3 mails/jour** (un rappel + éventuellement un rétablissement le même jour UTC). Même le palier le plus bas (**Business Starter, 1000/jour**) laisse une marge de plus de 300×, et le palier réel (**Business Standard, 3000/jour**) une marge de plus de 1000×. Le total mensuel (~30-90 mails) est négligeable face au « Message limit (units) » de 200000/mailbox. Point non résolu : la définition exacte de l'« unité » du « Message limit (units) » n'est **pas explicitée** sur la page (pourrait ne pas être un message = 1 unité pour tous les cas) — **NON DOCUMENTÉ**, mais sans conséquence pratique vu la marge.

**Distinction à ne pas confondre** (voir §0) : la limite « **10/minute et max 100/jour** » qui apparaît dans une AUTRE page Hostinger (« Parameters and limits of hosting plans in Hostinger », `6976044`) concerne le **« Server-based email sending »** (PHP `mail()`/sendmail d'un hébergement web), un chemin **différent** de notre SMTP AUTH authentifié vers `smtp.hostinger.com`. Notre sonde n'emprunte pas ce chemin (elle s'authentifie directement en SMTP avec la boîte dédiée), donc cette limite de 100/jour **ne s'applique pas** à notre cas — à ne pas confondre au moment d'écrire le RUNBOOK.

---

## 3. Restrictions sur l'expéditeur (From = compte authentifié ? From = To ? anti-spam)

**Le From doit-il égaler le compte authentifié ?** **NON DOCUMENTÉ explicitement** par une règle technique Hostinger trouvée (aucune page ne dit « le champ From doit être identique au nom d'utilisateur SMTP authentifié » ni l'inverse). Ce qui EST documenté et crée une pression indirecte : les règles d'alignement DMARC (voir §7) exigent que *« the authenticated domain must match the domain in the visible From header »* [lu, vérifié curl, `hostinger.com/tutorials/dns-for-email/`] — donc un From sur un **domaine différent** de la boîte authentifiée casserait l'alignement DKIM/DMARC (mais pas nécessairement SPF, qui vérifie l'IP d'envoi, pas le From). Dans notre cas (décision investisseur : From = To = la boîte elle-même), cette question ne se pose pas : From = boîte authentifiée par construction.

**Envoi « à soi-même » (From = To) accepté ?** **NON DOCUMENTÉ explicitement pour ou contre** — aucune page trouvée n'aborde le cas d'un envoi où l'expéditeur et le destinataire sont la même boîte. Aucune restriction technique n'a été trouvée qui l'interdirait. Le seul filtre général applicable est la politique anti-spam (ci-dessous), dont la définition de « spam » ne couvre pas ce cas (voir §4).

**Règles anti-spam sortantes connues** :
- CGU (« No Spam Policy », clause 12), source [lu, vérifié curl] `https://www.hostinger.com/legal/universal-terms-of-service-agreement` : *« We prohibit the transmission of spam through our Services and monitor all traffic to and from our servers for signs of spamming. »* (≤25 mots, citation exacte). La définition donnée de « spam » dans la même clause : *« unsolicited commercial or bulk messages sent via email... without recipient's prior consent »* — un mail automatisé auto-adressé (From=To, la boîte s'envoie une alerte à elle-même, ~1-3/jour) n'est ni non sollicité pour un tiers, ni commercial, ni bulk : il ne correspond pas à cette définition.
- Contenu/fréquence — guide de « warm-up » [lu, vérifié curl] `https://www.hostinger.com/support/why-new-emails-land-in-spam-and-how-to-warm-up-your-hostinger-mail-domain/` : ce guide cible explicitement le cas d'une **boîte neuve envoyant vers des tiers** (Gmail/Yahoo/Outlook) pour construire une réputation d'expéditeur (« Week 1: 5-10 emails/day to people who will reply », éviter les pics soudains). **Ce guide ne traite pas explicitement le cas d'un envoi vers soi-même sur le même domaine** — un envoi intra-domaine (From et To gérés par le même serveur Hostinger) n'a probablement pas besoin du même « warm-up » que pour atteindre l'inbox d'un tiers, mais **ceci est un raisonnement, pas une citation Hostinger directe** ; marqué explicitement comme item à vérifier empiriquement (§Items à vérifier).

---

## 4. Envoi automatisé/transactionnel depuis un script

**Autorisé par les CGU/AUP du service e-mail ?** **OUI, explicitement et positivement confirmé**, au-delà d'une simple tolérance — source [lu, vérifié curl 2026-09-20] `https://www.hostinger.com/agentic-mail` (FAQ « Is Agentic Mail a separate product I need to purchase? ») :

> *« No, Agentic Mail is built into Hostinger Business Email. You get access to Agentic Mail features with all Business Email plans — Starter, Standard, and Premium. »* (21 mots)

> *« ...built to handle programmatic sending and receiving without platform restrictions, rate limits, or the risk of getting flagged for AI-driven activity. »* (21 mots)

Ceci confirme sans ambiguïté que l'envoi programmatique/automatisé (« Agentic Mail ») est une fonctionnalité **incluse gratuitement** dans le plan Business Email que nous utilisons (Starter/Standard/Premium), pas un produit à part.

**Tension à signaler (ni contradiction avérée ni à trancher ici)** : cette formule marketing (« without... rate limits ») cohabite avec les limites numériques précises documentées au §2 (3000/jour pour Business Standard). Les deux passages viennent du même domaine `hostinger.com` mais de pages de nature différente (page produit marketing vs. page support technique chiffrée). Lecture la plus probable : la formule marketing compare Hostinger aux limitations/signalements opaques de grands fournisseurs (Gmail/Outlook qui peuvent « flag » une activité IA), pas une promesse littérale de zéro quota côté Hostinger — mais je rapporte les deux textes sans trancher, la page support (§2, chiffrée) doit rester la référence de dimensionnement.

**Différence avec le produit distinct d'e-mailing marketing** : oui, explicitement documentée [lu, vérifié curl] même page que §3 (warm-up) : *« Hostinger Mail is built for business correspondence, not bulk sending. For newsletters, promotions, or large lists, use Hostinger Reach — our email marketing product with built-in warm-up and deliverability tools. »* Notre cas (alerte système automatisée, ~1-3/jour, vers une seule boîte) relève sans ambiguïté de la « business correspondence », donc du bon produit (Hostinger Mail / Business Email), pas de Hostinger Reach.

**Produit distinct additionnel trouvé (à noter, non nécessaire pour ce lot)** : Hostinger propose aussi un **« Mail API & CLI »** séparé (« Send and manage email from your terminal, scripts, and automated workflows », à partir de **$16/mois** selon un extrait de recherche **[2nd/recherche seule, non re-vérifié par curl]**, `hostinger.com/mail-api`) — c'est une API REST/CLI distincte du protocole SMTP brut ; notre sonde utilise directement `node:tls`/`node:net` en SMTP (comme conçu au G0), donc ce produit payant additionnel n'est **pas nécessaire** : « Agentic Mail » (l'usage programmatique du SMTP standard inclus) suffit et est gratuit.

**Aucune AUP distincte trouvée** : la recherche n'a pas révélé de document « Acceptable Use Policy » séparé spécifique à l'e-mail chez Hostinger — la clause 12 (« No Spam Policy ») de la `Universal Terms of Service Agreement` fait office de politique d'usage acceptable pour l'e-mail.

---

## 5. Codes et comportements du client SMTP minimal

**Bannière / réponse EHLO attendue** : **NON DOCUMENTÉ**. Aucune source Hostinger primaire trouvée ne publie le texte de bannière de connexion ni la liste des extensions annoncées en réponse à `EHLO`.

**Réponse à une authentification ratée (535 ?)** : **NON DOCUMENTÉ par Hostinger lui-même**, et ce délibérément d'après leur propre documentation : source [lu, vérifié curl] `https://www.hostinger.com/tutorials/email-not-sending/`, section « Review bounce messages and error codes » : *« Gmail and other major mail providers publish their own documentation for SMTP error codes. »* (14 mots) — Hostinger renvoie explicitement l'utilisateur vers la documentation d'autres fournisseurs plutôt que de publier ses propres codes numériques. Cette même page documente seulement des **catégories** de rebond, pas des codes : *« Message rejected | The recipient's server blocked the email | Content, reputation, DNS »* et *« Daily limit exceeded | You hit your sending quota | Your provider's limits »* et *« Message rejected due to SPF/DKIM/DMARC »* (tutoriel PHPMailer). Aucune ne donne un code numérique précis.

**Timeouts ou greylisting documentés ?** **NON DOCUMENTÉ**. Aucune mention de délais d'attente serveur, de politique de greylisting, ni de nombre de tentatives tolérées n'a été trouvée dans les sources Hostinger consultées.

**[2nd, P3, non retenu comme preuve]** : les fils communautaires (Laracasts, Stack Overflow) mentionnés au §1 contiennent des messages d'erreur réels observés par des utilisateurs (ex. authentificateurs « LOGIN », « PLAIN » cités dans un message d'échec), mais ce sont des rapports d'utilisateurs non vérifiés, potentiellement sur le backend Titan plutôt que Hostinger Mail — non consommés comme preuve technique ici.

**Conclusion pour le client SMTP minimal du sous-lot -1b-ii** : la conception doit traiter bannière/EHLO/codes d'erreur comme des **inconnues à découvrir empiriquement** (le factice loopback du G1 peut simuler des codes plausibles standard RFC 5321/4954 — 220 bannière, 250 EHLO/DATA, 235 auth réussie, 535 auth échouée, 550/421/4xx — mais ces valeurs simulées sont des **conventions RFC génériques**, pas des faits Hostinger sourcés) ; le comportement RÉEL de `smtp.hostinger.com` ne pourra être confirmé qu'au premier test réel (item, §Items à vérifier).

---

## 6. Tarif du plan

Prix public lus **sans connexion**, source [lu, vérifié curl 2026-09-20] `https://www.hostinger.com/business-email` (carrousel de prix ; HTML servi contient le texte malgré le rendu client Vue.js — vérifié en lisant le HTML brut directement). Vue par défaut au moment du fetch : **terme 48 mois**, devise USD, « Prices are listed without VAT » (pied de page).

| Palier (`data-qa`) | Prix barré (liste) | Prix affiché (promo, terme 48 mois) | Remise affichée | Renouvellement affiché |
|---|---|---|---|---|
| Starter (`hostinger_mail:pro`) | $2.99/mo | $0.39/mo | 87% off | « Renews at $1.59/mo for 48-month term » |
| **Standard** (`hostinger_mail:standard`, badge « MOST POPULAR ») | $3.99/mo | **$0.99/mo** | 75% off | « Renews at **$2.79/mo** for 48-month term » |
| Premium (`hostinger_mail:premium`) | $5.99/mo | $1.99/mo | 67% off | « Renews at $3.99/mo for 48-month term » |

Tous les prix sont « **per mailbox** » (par boîte, par mois), facturés d'avance pour la durée du terme choisi.

**Écart observé entre deux lectures — signalé, non tranché** : une extraction de recherche indépendante **[2nd/recherche seule]** de la même page a montré, pour le palier Standard, un prix promo affiché de **$1.39/mo** avec la mention « Renews at $2.79/mo for **12-month** term » (au lieu de 48 mois). Le prix de **renouvellement** ($2.79/mo) est identique dans les deux lectures ; seul le prix promotionnel affiché diffère selon la durée d'engagement par défaut présentée par l'interface (probablement un choix d'affichage dynamique côté serveur/région/session, pas une incohérence de ma part). **Je rapporte les deux** sans trancher laquelle est « la » valeur : le prix dépend du terme choisi (12/24/48 mois) et potentiellement de la région/devise.

**Conclusion pour Q6** : prix public affiché sans connexion = **$0.99 à $1.39/mois par boîte** selon le terme choisi pour le palier Standard utilisé (renouvellement standard **$2.79/mois**), hors TVA. **Le tarif RÉELLEMENT appliqué au compte de l'investisseur** (devise, terme choisi à l'achat, remise éventuelle, état de facturation de la boîte `narabialerts@monarkgate.tech` déjà créée) **doit être lu par l'investisseur dans hPanel** — cette lecture documentaire ne peut pas et ne doit pas s'y substituer (hPanel nécessite une connexion, hors périmètre de cet agent).

---

## 7. DMARC `p=none` — recommandation Hostinger et effet sur From=To

**Ce que Hostinger recommande** : `p=none` **est explicitement le point de départ recommandé** par Hostinger, source [lu, vérifié curl 2026-09-20] `https://www.hostinger.com/tutorials/dns-for-email/` :

> *« p=none – take no action on failing messages; only collect reports. The recommended starting point when deploying DMARC for the first time. »*

> *« Starting at p=none gives you a full picture of every source sending email from your domain before you enforce a stricter policy. Move to p=quarantine or p=reject only after confirming that all legitimate senders are authorized in your SPF record and signing with DKIM. »*

**Provisionnement automatique confirmé** : source [lu, vérifié curl] `https://www.hostinger.com/support/why-new-emails-land-in-spam-and-how-to-warm-up-your-hostinger-mail-domain/` : *« If your domain is managed by Hostinger, these [SPF, DKIM, DMARC] are set up automatically when you activate email, so there's nothing to do. »* — ceci explique la configuration déjà observée par l'orchestrateur (SPF/DKIM×3/DMARC `p=none` posés sans action DNS manuelle) : c'est le comportement **par défaut** de Hostinger à l'activation d'une boîte sur un domaine qu'il gère, pas une configuration spéciale.

**Corroboration frappante** : la même page tutoriel (`dns-for-email`) illustre son explication SPF avec une capture d'écran dont le texte alternatif dit littéralement : *« hPanel DNS zone editor filtered by TXT records, showing an SPF record with value v=spf1 include:_spf.mail.hostinger.com ~all and a DMARC record with policy p=none »* — c'est-à-dire que **l'exemple par défaut de Hostinger dans sa propre documentation porte exactement la même valeur SPF et la même politique DMARC** que celles déjà mesurées pour `narabialerts@monarkgate.tech` dans les faits fournis à cette mission. Egalement documenté : les 3 CNAME DKIM suivent le motif `hostingermail-a`, `hostingermail-b`, `hostingermail-c` en sous-domaines sélecteurs (`*._domainkey.domain.tld`) — motif nommé utile si l'orchestrateur veut confirmer les 3 CNAME DKIM déjà posés.

**Effet sur la délivrabilité d'un mail From = To sur le même domaine** — **d'après leurs docs uniquement, avec raisonnement explicite (pas une citation directe pour ce cas précis)** :
- `p=none` signifie qu'**aucune action d'application n'est prise sur un échec** (ni quarantaine ni rejet), quel que soit l'expéditeur — donc même dans l'hypothèse d'un échec d'alignement (non attendu ici), `p=none` ne bloquerait pas le message.
- L'alignement DMARC exige que *« the authenticated domain must match the domain in the visible From header »* — dans le cas From=To=`narabialerts@monarkgate.tech`, le domaine authentifié (SMTP AUTH sur la boîte du domaine) et le domaine visible du From sont **identiques par construction**, et Hostinger signe automatiquement en DKIM pour ce domaine et inclut sa plage d'envoi dans le SPF déjà posé — l'alignement SPF et DKIM devrait donc réussir, indépendamment de la valeur de la politique DMARC.
- Ce raisonnement combine des mécanismes documentés (alignement, provisionnement auto) mais **aucune page Hostinger ne traite littéralement le scénario « From=To, même boîte »** — marqué NON DOCUMENTÉ pour ce cas précis, à confirmer empiriquement (item : inspecter les en-têtes `Received-SPF`, `DKIM-Signature`, `Authentication-Results` du premier mail de test réel).
- Conséquence secondaire documentée : parce que `p=none` ne fait qu'observer, il ne fournirait **aucun signal de rejet** si jamais une dérive de configuration cassait l'alignement plus tard — seul le rapport agrégé DMARC (adresse `rua=`, non configurée à ce jour d'après les faits fournis) le révélerait. Ceci n'est pas un risque nouveau à traiter dans ce lot (c'est un sujet de gouvernance DNS distinct, déjà hors périmètre de -1b-ii).

---

## Table récapitulative — paramètres à mettre en variables d'environnement

**Aucun secret dans cette table ni dans ce fichier.** `SMTP_PASS` n'est mentionné que comme nom de variable, jamais avec une valeur.

| Variable | Valeur suggérée (sourcée) | Source / section |
|---|---|---|
| `SMTP_HOST` | `smtp.hostinger.com` | §1 [lu] 4305847 / 1575756 |
| `SMTP_PORT` | `465` (primaire, table officielle) ; `587` documenté comme repli si « encryption issues » (item formé côté G0, déclencheur « 465 refusé au mail de test ») | §1 [lu] 4305847 |
| `SMTP_TLS` | `implicit` pour le port 465 (étiqueté « SSL » par Hostinger = TLS implicite) ; **TLS ≥ 1.2 obligatoire** (legacy rejeté depuis le 2026-03-30, déjà en vigueur) | §1 [lu] end-of-support-for-tls-1-0-and-1-1-protocols |
| `SMTP_USER` | adresse complète de la boîte, ex. `narabialerts@monarkgate.tech` (format = adresse e-mail complète, **pas** un login séparé) | §1 [lu] 4305847 + tutoriel PHPMailer |
| `SMTP_PASS` | **[SECRET — jamais ici]** ; posé hors bande par l'investisseur (cf. G0 §Plan de déploiement, C-11 : `/etc/monark/probe.env` ou stdin SSH, vérifié par sha256 des deux côtés, jamais affiché) | n/a — hors périmètre de cette lecture |
| `ALERT_FROM` | `narabialerts@monarkgate.tech` (= `SMTP_USER`, décision « From = To ») | G0 corps + checkpoint-1 |
| `ALERT_TO` | `narabialerts@monarkgate.tech` (= `SMTP_USER`) | idem |

---

## Contradictions

1. **Prix promotionnel Standard selon le terme d'engagement affiché par défaut** — $0.99/mo (48 mois, lecture `curl` directe) vs $1.39/mo (12 mois, extrait de recherche indépendant). Le prix de renouvellement ($2.79/mo) est identique dans les deux cas ; seule la remise promotionnelle affichée diffère. Rapporté sans trancher — voir §6.
2. **« Sans limite de débit » (marketing Agentic Mail) vs limites numériques précises (support KB, 3000/jour Business Standard)** — les deux textes viennent de `hostinger.com` mais de pages de nature différente (marketing vs support technique chiffré). Rapporté sans trancher — voir §4. La page support chiffrée doit rester la référence de dimensionnement.

---

## NON TROUVÉ / NON DOCUMENTÉ (liste consolidée)

- Mécanisme SASL exact (`AUTH LOGIN` / `AUTH PLAIN`) offert par `smtp.hostinger.com` — non nommé par une source Hostinger primaire (§1).
- Texte de bannière de connexion SMTP et contenu exact de la réponse EHLO — non publié (§5).
- Code SMTP numérique exact pour un dépassement de quota ou un échec d'authentification (535 ou autre) — Hostinger renvoie explicitement vers la documentation d'autres fournisseurs plutôt que de publier ses propres codes (§2, §5).
- Politique de timeout et de greylisting — aucune mention trouvée (§5).
- Définition précise de l'« unité » dans « Message limit (units) » — non explicitée (§2).
- Effet documenté littéralement pour le scénario précis « From = To, même boîte, même domaine » — seulement un raisonnement à partir de mécanismes documentés séparément (alignement DMARC, provisionnement auto) ; aucune page ne traite ce cas nommément (§3, §7).
- Tarif et statut de facturation réels du compte/boîte déjà créé (nécessite hPanel, hors périmètre — accès par connexion exclu par la mission) (§6).
- Existence d'une AUP distincte de la Universal Terms of Service — non trouvée ; la clause 12 (« No Spam Policy ») semble en tenir lieu (§4).

Aucune de ces lacunes n'a nécessité de demande de procurement : toutes les sources visées ont été atteintes publiquement, sans authentification ni CAPTCHA, sans document introuvable (PDF, papier). Il ne s'agit pas d'un défaut d'acquisition mais de sujets que Hostinger ne documente simplement pas publiquement.

---

## Ce que cette lecture n'établit pas

- Le comportement RÉEL observé de `smtp.hostinger.com` lors d'une vraie session SMTP (aucune connexion SMTP n'a été faite, par contrainte de mission) — tout ce qui précède est déduit de documentation, pas d'une observation de protocole.
- La délivrabilité effective (boîte de réception vs spam) d'un mail réel From=To sur `narabialerts@monarkgate.tech`.
- Le tarif et le statut de facturation réels du compte de l'investisseur (nécessite hPanel).
- Que les 3 enregistrements DKIM CNAME et le SPF déjà mesurés par l'orchestrateur pour `monarkgate.tech` correspondent exactement aux valeurs attendues (cette lecture documente le *motif* attendu — `hostingermail-{a,b,c}._domainkey`, `include:_spf.mail.hostinger.com` — mais ne revérifie pas elle-même le DNS live de `monarkgate.tech`, qui est une mesure déjà faite par l'orchestrateur et hors du périmètre bibliographique de cet agent).
- Si un envoi automatisé répété et fréquent (au-delà de notre volume prévu) déclencherait une détection anti-abus non documentée (heuristiques internes non publiées).

---

## Items à vérifier au premier mail de test réel (déploiement, go investisseur)

1. Capturer et consigner au RUNBOOK la bannière de connexion réelle et la liste d'extensions EHLO annoncées par `smtp.hostinger.com` (lève le NON DOCUMENTÉ du §5).
2. Confirmer quel(s) mécanisme(s) AUTH le serveur propose réellement (`AUTH LOGIN`/`AUTH PLAIN`/autre) — sans jamais imprimer `SMTP_PASS`.
3. Confirmer la négociation TLS 1.2+ réussie sur le port 465 en implicite avec `node:tls` (comportement par défaut attendu, à vérifier explicitement) ; confirmer qu'un nom d'hôte erroné est bien refusé (C-11 du checkpoint-1).
4. Inspecter les en-têtes du mail reçu (`Received-SPF`, `DKIM-Signature`, `Authentication-Results`) pour confirmer l'alignement SPF/DKIM/DMARC réel sur le scénario From=To (lève le NON DOCUMENTÉ du §7).
5. Confirmer si le mail atterrit en boîte de réception ou en spam pour ce cas d'auto-envoi neuf (le guide de warm-up Hostinger ne couvre pas explicitement ce scénario intra-domaine, §3).
6. Si jamais 465 est refusé, activer le repli 587 STARTTLS (item déjà formé côté G0, déclencheur explicite « 465 refusé au mail de test »).
7. Lire dans hPanel (investisseur) le tarif et le statut de facturation réels de la boîte, pour clore définitivement Q6/E-2 (« 0 $ » suspendu tant que non confirmé par le propriétaire du compte).
8. Si un test de charge ou un incident anormal approchait un jour les limites documentées au §2 (peu probable vu la marge), consigner le comportement exact observé (code, moment du rejet) — lève le NON DOCUMENTÉ du §2/§5.

---

## Journal des URL (toutes en succès HTTP 200 ; aucun refus rencontré)

Toutes les requêtes ci-dessous sont des `GET` HTTPS sur des pages publiques, via `curl` (user-agent navigateur, `-L`) sauf mention « recherche seule ».

- `https://support.hostinger.com/en/articles/4305847-how-to-use-hostinger-smtp-relay` → redirige HTTP 200 vers `https://www.hostinger.com/support/4305847-set-up-hostinger-email-on-your-applications-and-devices/` — §1.
- `https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/` — §1.
- `https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/` — §2.
- `https://www.hostinger.com/support/8412851-how-to-add-a-dmarc-record-for-hostinger-email/` — §7 (contexte, page-outil de création DMARC, peu de contenu explicatif propre).
- `https://www.hostinger.com/business-email` — §6.
- `https://www.hostinger.com/legal/universal-terms-of-service-agreement` — §3/§4.
- `https://www.hostinger.com/tutorials/dns-for-email/` — §7, corroboration §1 (motif DKIM).
- `https://www.hostinger.com/support/why-new-emails-land-in-spam-and-how-to-warm-up-your-hostinger-mail-domain/` — §3/§4/§7.
- `https://www.hostinger.com/support/end-of-support-for-tls-1-0-and-1-1-protocols/` — §1.
- `https://www.hostinger.com/mail-api` — §4 (contexte produit, peu de texte exploitable en HTML brut, complété par extrait de recherche).
- `https://www.hostinger.com/agentic-mail` — §4 (FAQ décisive).
- `https://www.hostinger.com/tutorials/email-not-sending/` — §2/§5.
- `https://www.hostinger.com/tutorials/how-to-send-emails-using-phpmailer/` — §1/§5.
- Recherches web ciblées (outil de recherche, domaine `hostinger.com` filtré la plupart du temps) : limites d'envoi, tarifs Business Email, DMARC/SPF/DKIM, AUP/spam, AUTH SMTP, TLS minimum, Mail API/Agentic Mail — toutes ont renvoyé des résultats exploitables, recoupés ensuite par `curl` sauf le prix « terme 12 mois » (§6, gardé comme extrait de recherche seul, signalé comme tel) et le prix « $16/mois » du Mail API (§4, signalé comme tel).
- Aucune page hors `hostinger.com` n'a été retenue comme preuve (Laracasts, Stack Overflow, InMotion Hosting, Scribd vus dans les résultats de recherche — écartés, [2nd]/hors sujet, jamais fetchés en brut).
- Aucun domaine refusé par un outil ; aucune page derrière un login/CAPTCHA n'a été tentée (hPanel jamais approché).

---

## Demande de consultation formée

**Aucune.** Les 7 questions ont toutes reçu une réponse sourcée (valeur documentée, NON DOCUMENTÉ explicite, ou les deux termes d'une tension/écart signalés sans trancher). Aucun blocage méthodologique, aucune source illisible, aucun arbitrage de niveau [lu]/[abs]/[2nd] douteux n'a nécessité de faire remonter une consultation à l'orchestrateur.
