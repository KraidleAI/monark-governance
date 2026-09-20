# Security policy

This policy covers the MONARK public repository (`KraidleAI/Monark`) and the hosted
service reachable at `monarkgate.tech` (the harness endpoints `mcp.monarkgate.tech`
and `api.monarkgate.tech`, and the storefront site). It states how to report a
vulnerability, which versions receive fixes, the response windows, the product scope,
and the data the service handles. It makes no statement about whether any specific
regulation applies to MONARK.

## Reporting a vulnerability

Report a suspected vulnerability privately through GitHub Security Advisories: open a
report at https://github.com/KraidleAI/Monark/security/advisories/new (the "Report a
vulnerability" button on the repository Security tab). This is the only reporting
channel — there is no e-mail address and no bug-bounty reward. Please do not open a
public issue for a vulnerability.

## Scope

- The engine source published under Apache-2.0 in this repository.
- The hosted harness (MCP and JSON served by one loopback listener behind a reverse
  proxy) and the storefront site.

Governance material (architecture decision records, the provenance journal, review
records) lives outside the published surface and is not part of this policy.

## Supported versions

Fixes target the latest tagged release on `KraidleAI/Monark` (the version source of truth
is the git tag, ADR-M010); an older tag is superseded by the next, not maintained in
parallel.

## Timelines

The maintainer acknowledges a report within 72 hours and works toward a coordinated
public disclosure within 90 days of that acknowledgement, together with the reporter.
These windows are MONARK's own commitment, aligned with the coordinated vulnerability
disclosure practice of ISO/IEC 29147:2018; they are a response target, not a promise to
ship a fix within that time.

## Data

No personal data is required to use the service (no account, e-mail, or wallet). Operating
the hosted endpoints produces a reverse-proxy access log (`deploy/Caddyfile.monark-harness`,
a commented block documenting the 2026-09-18 deployment): Caddy's JSON access log format,
rotated (10 MiB x 5) and kept at most 720 h, with nothing retained beyond that window. The
JSON format is not field-restricted, so the log includes the client address; no request body
is logged. The storefront site is served on the same VPS behind Caddy; per
`deploy/Caddyfile.monark-narabi.snippet`, its site block carries the same JSON access log
format and rotation (10 MiB x 5, kept at most 720 h), with nothing shipped anywhere.
