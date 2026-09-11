# Contributing to MONARK

MONARK is open source and we want your feedback. Whether you are integrating the
gate into an agent, stress-testing the coverage math, or just reading the code —
your reports shape what ships next.

## Where to talk

- **Issues** — bugs, unexpected behaviour, missing pieces, documentation gaps.
  One issue per topic; include what you ran, what you expected, and what happened.
- **Discussions** — questions, ideas, integration notes, and anything not yet a
  concrete bug. Start here if you are unsure whether something is a defect.

## Try it on your own predictor (BYO)

The fastest way to kick the tyres is the bring-your-own loop — you calibrate on
your own nonconformity scores, gate your own prediction under that calibration,
and check that the audit closes:

1. `calibrate` your score array at a chosen miscoverage α → you get back the
   split-conformal quantile and a digest over exactly those scores.
2. `gate` your prediction, passing the same scores as the calibration → the gate
   conforms against them and returns **commit / defer / abstain** with a verdict
   digest.
3. The loop closes when the verdict's calibration digest equals the digest the
   calibrate step returned — the decision was gated against the exact scores you
   provided, and nothing else.

The full walkthrough, with a recorded byte-for-byte trace, lives in
`skills/monark/DEMO.md`. The MCP endpoint is `https://mcp.monarkgate.tech/mcp`.

If you find a case where the loop does not close, or the gate behaves in a way the
docs do not describe, open an issue with the request bodies — that is exactly the
kind of report we want.

## Pull requests

- Keep them small and focused — one change per pull request.
- Run the checks locally before opening (`npm run ci`).
- Explain the *why*, not just the *what*, in the description.

## Ground rules

Be respectful and assume good faith. MONARK returns a coverage decision over a
region you can audit — never a probability of being right — and the project holds
itself to that same honesty in its docs and its claims. Reports that hold us to it
are welcome.
