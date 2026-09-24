# CRA vulnerability and incident notification procedure

Internal runbook for Regulation (EU) 2024/2847 (the Cyber Resilience Act), Article 14
(reporting of actively exploited vulnerabilities and severe incidents). This is an
operational runbook, not a legal opinion, and it is written conditionally: it applies
only if MONARK is in scope as a manufacturer under the Regulation. Whether that
condition holds is undetermined and is a question for counsel (see the entry audit and
ADR-CRA-B); the runbook states what MONARK would do if it holds, so the clocks are
ready rather than improvised.

## When this procedure fires

It fires only if MONARK is in scope as a manufacturer and either an actively exploited
vulnerability or a severe incident affecting a product within scope is detected.
Article 14 has applied since 11 September 2026 for a product within scope (Article
71(2)), so if the condition holds the clocks below are already live.

## The Article 14 clocks

Two tracks, each with three steps. Every deadline runs from the moment the manufacturer
becomes aware. Read in the primary EUR-Lex text [lu] Regulation (EU) 2024/2847, Article
14 (`cra-2024-2847-EN.txt`, lines 2361-2405).

Actively exploited vulnerability (Article 14(2)):

- early warning: 24 h;
- notification: 72 h;
- final report: 14 days after a corrective or mitigating measure.

Severe incident (Article 14(4)):

- early warning: 24 h;
- notification: 72 h;
- final report: one month after the incident notification.

Every notification goes to the coordinating CSIRT and, at the same time, to ENISA
through the single reporting platform (Article 14; the ENISA single reporting platform
has been live since 11 September 2026).

## Who does what

- The maintainer triggers this procedure and owns every clock.
- What to transmit: the content Article 14 lists for each step (the early warning, then
  the notification, then the final report), nothing beyond it.
- Where to record it: one dated line in `docs/JOURNAL-PROVENANCE.md` per step sent.

## Reporting channel (inbound)

Vulnerability reports reach MONARK through GitHub Security Advisories only (see the
repository security policy `SECURITY.md`); the maintainer triages them and, when a
report meets the Article 14 threshold and the condition above holds, starts the clocks.

## CSIRT and cross-border fallback

CSIRT: undetermined for a US manufacturer without an EU representative, see counsel Q1.
The Article 14(7) fallback order (authorised representative, then importer, then
distributor, then users) and the competent national CSIRT both rest on an EU anchor that
MONARK does not yet have; this procedure names no specific CSIRT until counsel resolves
it.
