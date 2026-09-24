# CONFIDENTIEL — investisseur, orchestrateur, juriste. Jamais exporté (docs/** hors whitelist du miroir public), jamais cité sur une surface publique, dans le thread, le skill, le MCP ni la lettre SEC.

## Décision investisseur 165 (2026-09-24 01:07 UTC, verbatim)
« on ne change pas de source. je vais acheter la licence dans quelques semaines, une fois que la plateforme sera complète, on a 3 mois pour. avis juriste. cette discussion ne doit pas être publique, entre toi et moi et mon juriste. on peut tout afficher sans licence pendant 3 mois. »

## Lecture opératoire
1. Source de la jambe cash : **Databento EQUS.SUMMARY** (close consolidé Nasdaq NLS+, `ohlcv-1d`, historique « next day » sans licence d'accès — FAITS 2026-09-23). Aucun changement de source ; procurements P-MAS/P-TNG/P-TD/P-EOD/P-CBOE/P-NYSE/P-POL/P-NDL/P-NDQ-WEB **gelés** (non retirés : ils restent des demandes formées si la question rouvre).
2. **Licence de redistribution** : achat par l'investisseur dans quelques semaines, une fois la plateforme complète ; horizon **3 mois** à compter de ce jour ⇒ **butoir 2026-12-24** (item LIC-DBN-1, propriétaire investisseur, déclencheur = plateforme complète OU 2026-12-10 au plus tard pour laisser deux semaines).
3. **Avis juriste** : la question « une valeur mono-titre inversible (gap %) publiée ≥ 24 h après clôture est-elle une redistribution soumise à licence, et existe-t-il une fenêtre d'usage sans licence ? » est portée au juriste (acte novembre, décision 147 ; à avancer si possible). L'écrit Databento P-DBN-1 n'est **pas** envoyé (décision investisseur : discussion non publique) — il reste rédigé en réserve pour le juriste.
4. **Publication** : par décision investisseur, Bell publie `g_t`, `vwap`, `volumeBase`, `vol_ratio` et les drapeaux comme conçus (ADR-B0 ESC-1 (c) inchangé) pendant la fenêtre ; l'offset `earliest_publish_utc = 16:00 ET + 24 h` est conservé (RUNBOOK G-b). La forme binnée de l'avis advisor-defi (retrait de `g_t`) n'est **pas** adoptée ; elle reste la solution de repli si le juriste conclut autrement (item ESC-1-REWRITE, déclencheur = avis juriste défavorable).
5. **Confidentialité** : ce dossier, l'avis advisor-defi, les FAITS licence et la recherche « sources de clôture » restent sous `docs/` (privé). CHANTIERS ne porte qu'un pointeur. Le nom du fournisseur n'apparaît sur aucune surface publique (décision 69 + Terms Databento « avoid any specific data provider's name ») : item FAULTS-PROVIDER-NAME-1 (b) à corriger avant seq 2 (`provenance.json` servi nomme encore `databento`).

## Réserve de l'orchestrateur (honnêteté, une phrase)
Aucun texte lu sur place (Databento FAQ §1.1/§1.7/§1.8, définitions Nasdaq §1.8/§1.18 et UTP « Derived Data », fiche portail EQUS.SUMMARY) ne mentionne une fenêtre de trois mois sans licence pour l'affichage d'une valeur inversible ; la couverture de cette fenêtre repose donc sur l'avis du juriste, pas sur une clause lue — c'est la décision et le risque de l'investisseur, consignés tels quels.

## Questions pour le juriste (brouillon orchestrateur, à relire par l'investisseur avant envoi)
1. Pour EQUS.SUMMARY (Nasdaq NLS+ end-of-day, distribué par Databento sous licence d'accès « non requise » pour l'historique J+1), la publication d'un écart `g_t = ln(VWAP_onchain / close_consolidé)` par instrument, dont le close se recalcule à partir d'un VWAP public, constitue-t-elle une « redistribution » ou un « Derived Data » au sens (a) des conditions Databento (FAQ prix « redistributed after 24 hours » vs FAQ licence §1.7), (b) de la Nasdaq Global Data Agreement §1.8/§1.18, (c) de l'UTP Plan ?
2. Existe-t-il une période d'usage sans licence (tolérance, essai, exemption de volume ou d'usage non commercial) couvrant un affichage public pendant environ trois mois avant souscription ?
3. Quelle licence exacte souscrire (Databento « Plus » 1 750 $/mois « External distribution » ; ou licence directe Nasdaq/UTP « Derived Data » / display) pour publier `g_t`, `vwap`, `vol_ratio` par instrument à J+1 ?
4. La mention du fournisseur : les Terms Bell disent « avoid any specific data provider's name » ; la provenance publiée doit-elle rester anonyme (étiquette générique « cash-leg ») ou une attribution est-elle exigée par la licence ?
5. Conséquences si la licence n'est pas obtenue au butoir : retrait de `g_t` (forme binnée) suffit-il, ou faut-il retirer l'historique publié ?

## Conséquences sur les lots
- **BELL-CASH-LEG-1** (backend, G0/cp-1) : réactiver la jambe cash du collecteur avec `close_ref` Databento (clé présente en env, jamais affichée), résidu `no_close_ref` → 0 sur les fenêtres couvertes, `faults[].provider` → étiquette générique (FAULTS-PROVIDER-NAME-1 b), publication **seq 2** (TSLAx/AAPLx/SPYx), `sync-bell-served.mjs`, upload.
- **Pages** : `/bell` et `/bell/method` montrent `g_t` réel et les seuils (METHOD-THRESHOLDS-1 : aligner 1/2/5 %), sans aucun nom de fournisseur ; aucune mention de licence, de fenêtre ou de juriste.
- **Calendrier** : LIC-DBN-1 rappel à l'investisseur le 2026-11-24 et le 2026-12-10 (CHANTIERS §E).
