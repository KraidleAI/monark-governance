# FAITS — lettre de commentaire Tyrone V. Ross Jr. (Turnqey), File No. 4-927 — lecture sur place 2026-09-23 00:3x UTC

Lecture SUR PLACE par l'orchestrateur (`claude-fable-5-1`), navigateur interne, en réponse à l'item I-3 du rendu du squelette
(`docs/sec-4927/RENDU.md` : les copies locales `docs/biblio/bell/_txt/sec-4927-comment-*` sont des pages d'erreur WAF de sec.gov,
1 925 octets chacune — aucune lettre n'était donc réellement en dépôt). Niveau **[lu]** ; citations ≤ 25 mots.

- URL : `https://www.sec.gov/comments/4-927/4927-1052379-3611846.html` — titre « Comments of Tyrone V. Ross Jr. », « Subject: File No. 4-927 ».
- Signataire : « Tyrone Ross, Chief Executive Officer, Turnqey » ; Turnqey « builds the data infrastructure that registered investment advisers and wealth platforms use to see, reconcile and report on client crypto and tokenized assets ».
- Position : « We support the Innovation Exemption. » Diagnostic : « The order will fragment trading in tokenized NMS stock by design » ; « no consolidated tape, no central clearing and no single custodian » ; « Fragmentation is not the risk. Unreconcilable fragmentation is. »
- Cinq recommandations (toutes = **auto-publication par le TSV/tokenizer**, jamais un témoin tiers nommé) :
  1. « Require a public, machine readable venue record » (registre des contrats, CUSIP/FIGI, chaîne, adresse, tokenizer ; données de trades et de pools « in a documented, machine readable form ») — « the rights parity verification the order requires is unverifiable from outside ».
  2. Corporate actions « traceable across venues and chains », « in a standard form, keyed to the same identifiers ».
  3. Cost basis / transfer reporting pour l'auto-conservation (« no broker in the middle to carry basis » ; demande à la Commission de travailler avec Treasury).
  4. **« Publish halts and dislocations, not just trades »** : « when a venue's pool price has moved away from the NBBO for the underlying » ; « a public, timestamped event log for halts, pool parameter changes and access-standard changes, published by the TSV ».
  5. « Give the investor's adviser standing » (accès en lecture aux fills/positions sans être participant).

## Conséquences pour la lettre MONARK (analyse, pas un fait de la page)
- La recommandation 4 nomme exactement la grandeur que Bell mesure (écart de prix de pool vs sous-jacent, hors séance) — mais **comme auto-publication par le TSV**. C'est l'objection à traiter (ADR-B0 amendement 2026-09-19 : valeur résiduelle de Bell = indépendance vis-à-vis des venues + rejeu bit-identique + abstention déclarée). La lettre peut citer Ross (≤ 25 mots) comme diagnostic convergent, sans le présenter comme un appui à un témoin tiers.
- Le mot « independent » n'apparaît pas dans l'ordre (mesuré par le worker) ; il n'apparaît pas non plus dans la lettre Ross (« unverifiable from outside » est la formulation la plus proche).
- Item I-3 (procurement des « 3 lettres lues ») : la lettre Ross est désormais [lu] ici ; Borthwick et Delderfield restent NON lues (pages WAF locales ; à relire sur place si la lettre doit les citer — non requis : la lettre ne cite personne d'autre).
