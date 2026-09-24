v0.6.0 - MONARK Bell served: first signed session record

This release follows the v0.5.0 pre-release of the same day. It carries the Bell host and the pieces that make its record verifiable by anyone.

What is served

- A dedicated host publishes, as plain files, one state, one signed timeline, one provenance record and one public key. Each timeline line is chained to the previous one and signed with Ed25519; the public key is committed in this repository as the trust root (the Bell publisher, its chain library, the verifier and the public keyring are exported to the public mirror with this release; the collector, the host unit and its runbook stay in the private tree until their provider names are purged).
- The first record is a session record for one tokenised equity, read on a public ledger over one full New York trading day (regular session included, split into sessions). It carries the fill count, the number of sessions and the quorum coverage of the read, and it names what is missing: the cash-market leg is off by design, so no gap and no close are served.
- A verifier script in this repository re-reads the served files against the committed key and runs twelve named checks (schema, chain, signature, key root, headers, no listing, cache rules, TLS, no private material, host configuration equal to the released bytes, probe untouched). Its result for the first publication is committed as a JSON file.

What changed in the code

- Bell publisher: bundle validation with a type-derived whitelist, whole-lot refusal before the earliest publication time, duplicate refusal, durable staged writes, chained and signed timeline, key generation on the host only, cross-signed rotation and revocation, fail-closed command line.
- Bell verifier: library and command line, root of trust by a supplied keyring, closed status set.
- Host configuration (private tree): a systemd unit with a credential-loaded key and no network, a Caddy file in a closed subset that the tests model, a runbook whose every step carries its command, its expected output and its rollback; the host root now redirects to the Bell page of the site.
- Site: Bell moves to "built" in the public register by the founder's decision of the day; the Bell pages state what is served and how to verify it. The home page hero is the MONARK core.

Reading rules (unchanged): facts witnessed, not investment advice; a signature attests origin, not truth; no endorsement of or by any venue, issuer or data source; never a probability of being right.
