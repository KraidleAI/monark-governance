# MONARK Bell: export the collector core

MONARK Bell publishes a signed, hash-chained record: each line is chained to the one before it and signed with a key whose public part is committed in this repository.

What this piece brings: the collector core, exported to this repository, so that a third party recomputes the digests of a record offline from the same public inputs and compares them with the signed line, bit for bit.

What you can do today: check the origin and the chain of every published line with the verifier in this repository (`apps/bell/scripts/bell-verify.mjs`), against the committed public keyring (`apps/bell/keys/bell-keyring.json`).

This issue tracks the piece. It is closed when the collector core ships in a tagged release. Questions and ideas are welcome in Discussions.
