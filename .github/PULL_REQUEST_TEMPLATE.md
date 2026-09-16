<!-- MONARK governance pull request. The public mirror takes no PRs (a PR merged on the mirror is
     reverted at the next sync); this template lives on the governance repo only and is never exported
     (it is not whitelisted by scripts/export-public.mjs). Keep it English. -->

## Summary

<!-- One or two sentences: what changes, and why. -->

## Governance

- **Attached ADR:** <!-- ADR-Mxxx — every code change hangs off a spec/ADR (G0). -->
- **Frozen schema touched?** no <!-- y/n; default no. A schemas/*.json change thaws a frozen contract and needs an explicit ADR decision. -->
- **Tool surface touched?** <!-- y/n — the four MCP tools or their descriptions. -->
- **G2 reviewer:** <!-- the reviewing instance (reviewer is not the generator). -->
- **Test count before / after:** <!-- e.g. 180 / 184. -->

## Checklist

- [ ] Small and focused — one change per pull request (R-25).
- [ ] `npm run ci` is green locally.
- [ ] No bare TODO/FIXME left behind (R-13).
