claude-opus-5-5

# FAITS — émulation mobile par CDP et budget d'une vue mobile (FAITS-CDP-MOBILE-1, FAITS-WEB-PERF-BUDGET-1) — lu sur place le 2026-10-01 vers 19:0x UTC

Lecture sur place par l'orchestrateur (navigateur interne), règle du 2026-09-20 ; items de `docs/adr/ADR-DOJO-PR-4.md` l.496-497, dus
avant la jambe 2 de DOJO-LOOKUP-PAYLOAD-1 et le volet navigateur de DOJO-LIVE-RENDER-ORACLE-1 (journal G1 de SITE-PREP, §9 (c)).
Citations de 25 mots au plus. Aucun budget n'est posé ici : ce fichier donne les sources ; le verdict de la jambe 2 les applique.

## FAITS-CDP-MOBILE-1 : méthodes CDP et facteur de référence

Source 1 : https://chromedevtools.github.io/devtools-protocol/tot/Emulation/ (version « tot », lue à 19:0x UTC) [lu].

- **C-1 (bridage du processeur)** : `Emulation.setCPUThrottlingRate`, « Enables CPU throttling to emulate slow CPUs » ; paramètre
  `rate`, « Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc). »
- **C-2 (écran)** : `Emulation.setDeviceMetricsOverride` (`width`, `height`, `deviceScaleFactor`, `mobile`) ; `mobile` : « Whether to
  emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more. »
- **C-3 (toucher)** : `Emulation.setTouchEmulationEnabled` (`enabled`, `maxTouchPoints`, un par défaut).
- Le motif `F:/tmp/site-docs-1/g2/tools/mobile375.mjs` pose C-2 (375 × 812, facteur 2, `mobile` vrai) et C-3, jamais C-1 : la jambe 2
  ajoute `Emulation.setCPUThrottlingRate`.

Source 2 : https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md (branche `main`, lue à 19:0x UTC) [lu].

- **C-4 (facteur de référence)** : « By default, Lighthouse uses a constant 4x CPU multiplier which moves a typical run in the
  high-end desktop bracket somewhere into the mid-tier mobile bracket. »
- **C-5 (table des facteurs)** : depuis un ordinateur haut de gamme, 4x (plage 2 à 10) vise un mobile moyen (exemple : Moto G4), 10x
  (plage 5 à 20) un mobile d'entrée de gamme ; la page propose de calibrer par le `benchmarkIndex` de la machine.
- Conséquence pour la jambe 2 : facteur 4 (référence de Lighthouse), et `benchmarkIndex` de la machine de mesure écrit au journal ; si la
  machine n'est pas dans la tranche haut de gamme, le facteur suit la table C-5, déclaré.

## FAITS-WEB-PERF-BUDGET-1 : budget d'une vue mobile

Source 3 : https://web.dev/articles/vitals (« Last updated: October 31, 2024 », lue à 19:0x UTC) [lu].

- **B-1 (premier contenu utile)** : « LCP should occur within 2.5 seconds of when the page first starts loading. »
- **B-2 (réactivité)** : « pages should have a INP of 200 milliseconds or less. »
- **B-3 (percentile)** : seuil à mesurer au 75e centile des chargements, « segmented across mobile and desktop devices ».

Source 4 : https://w3c.github.io/longtasks/ (Editor's Draft, 19 March 2026, lue à 19:0x UTC) [lu].

- **B-4 (tâche longue)** : « Long task refers to any of the following occurrences whose duration exceeds 50ms » ; une page sans tâche
  longue répond à une entrée en moins de 100 ms.

Source 5 : https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time (« Last updated 2019-10-09 », lue à
19:0x UTC) [lu].

- **B-5 (temps de blocage total, mobile)** : 0 à 200 ms vert, 200 à 600 ms orange, au-delà de 600 ms rouge (table « Lighthouse mobile
  TBT thresholds ») ; sur ordinateur : 150 et 350 ms.

## Conséquences pour le verdict de la jambe 2 (proposées ; le verdict les applique)

- Premier contenu utile de la page (la phrase d'état et la première tranche de la table) en 2,5 s au plus, sous bridage C-4 (B-1) ;
  temps de blocage total sous 200 ms (B-5) ; chaque tâche de plus de 50 ms comptée et nommée (B-4).
- Une mesure en boucle locale n'est pas un 75e centile de vrais chargements (B-3) : elle est déclarée comme mesure de laboratoire.
- Non établi ici : le réseau mobile (la boucle locale n'a ni latence ni débit bridés) ; à déclarer, ou à poser par
  `Network.emulateNetworkConditions` après lecture de sa page.
