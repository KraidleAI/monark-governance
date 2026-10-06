# FAITS-RFC6761-INVALID-1 — RFC 6761 §6.4 « invalid. » lu sur place (orchestrateur, `curl https://www.rfc-editor.org/rfc/rfc6761.txt`, 2026-09-27 14:07:53Z, HTTP 200)

- Titre : RFC 6761, « Special-Use Domain Names », Cheshire & Krochmal, Standards Track, février 2013. Copie brute : `F:\tmp\dojo\rfc6761.txt` (l.471 = §6.4).
- §6.4 (1) [lu] : « Users MAY assume that queries for "invalid" names will always return NXDOMAIN responses. »
- §6.4 (3) [lu] : « Name resolution APIs and libraries SHOULD recognize "invalid" names as special and SHOULD always return immediate negative responses. »
- §6.4 (4) [lu] : les serveurs cache « SHOULD generate immediate NXDOMAIN responses for all such queries ».
- Conséquence pour RPC-GUARD-RECONCILE-1 D-3 (Q-O6) : un hôte `*.invalid` ne résout jamais (garantie de la norme, non de l'implémentation : SHOULD, pas MUST — un résolveur non conforme pourrait envoyer la requête au cache, jamais vers un hôte réel puisque le nom n'existe pas) ; admis comme classe de test helius **avec pièges socket/DNS conservés** dans les tests (défense en profondeur).
