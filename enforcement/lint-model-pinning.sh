#!/usr/bin/env bash
# VibeGates gate G1/R-1/R-4 — model-pinning linter (ADR-0002).
# A bare model tier (opus, sonnet, haiku, fable, inherit, default, opusplan)
# resolves to whatever the platform decides at call time. Measured incident,
# 2026-08-05: a bare `opus` in an agent definition silently resolved to a
# service variant of a different model than the one policy required; recurred
# 2026-08-13 through an agent-tool tier enum. Pinned identifiers only
# (e.g. claude-opus-4-8, claude-haiku-4-5-20251001). Tier matching is case-
# insensitive; the ADR- reference token is case-SENSITIVE (uppercase convention).
# Scans: the YAML FRONTMATTER (first `---` block) of .claude/agents/**/*.md and
#        .claude/skills/**/*.md — body prose and code examples are not linted;
#        .claude/settings.json and .claude/settings.local.json.
# Exemption, visible at point of use (an undocumented exception is a
# defect): a bare tier passes only if its own line carries an ADR reference —
#   frontmatter:  model: fable   # ADR-0003
#   JSON (no comments): list the value in .claude/model-exceptions.txt, one
#   per line, each line carrying its ADR reference:  advisorModel=fable ADR-0003
#   (the value must be followed by whitespace or end-of-line: an exception for
#   `opusplan` never exempts `opus` — boundary proven by fixture, independent review.)
# Known residual limit: values built dynamically (env expansion, scripts) are
# invisible to a textual linter; the resolution control at first launch
# (R-1, pass methodology §1.5) remains mandatory and is not replaced by this.
# BAN ENFORCEMENT (ADR-0002 amendment, ban enforcement; maintainer decision
#   2026-08-14): beyond the bare-tier rule, a *pinned* identifier the maintainer
#   has BANNED is blocked outright wherever it is used as a model value. A ban is
#   ABSOLUTE — it admits NO exemption: an ADR annotation on the line does NOT
#   exempt it, and listing it in model-exceptions.txt does NOT exempt it (only
#   the maintainer may derogate). The banned id is built at RUNTIME by
#   concatenation so this source never contains its contiguous literal (invariant:
#   a grep of the banned id over enforcement/ = 0). Matching is value-boundary-
#   bounded: it flags `model: <id>` and `model: "<id>"` but NOT a longer id
#   (…5x / …50) and NOT a different pinned id (…4-8). The check runs in BOTH scan
#   passes below (frontmatter and settings JSON) — a frontmatter-only ban is a
#   half-gate.
# Usage: lint-model-pinning.sh [repo-root]     Exit 2 = block.

set -u
ROOT="${1:-.}"
TIERS='opus|sonnet|haiku|fable|inherit|default|opusplan'
# Banned pinned id — built at RUNTIME (source stays grep-clean); maintainer
# decision 2026-08-14, ADR-0002 amendment (ban enforcement).
BANNED="claude-opus-""5"
EXCEPTIONS="$ROOT/.claude/model-exceptions.txt"
FAIL=0
SCANNED=0

# 1) Frontmatter `model:` in agent/skill definitions — bare tier without ADR ref
#    on the line. Only the leading `---` block is scanned (original line numbers kept).
while IFS= read -r f; do
  [ -f "$f" ] || continue
  SCANNED=$((SCANNED + 1))
  # Strip a leading UTF-8 BOM (Fix 2026-08-20, G2 finding 3): a BOM before the
  # first `---` makes awk's NR==1 gate miss the frontmatter and skip the WHOLE
  # file (ban + bare-tier); the .ps1 twin already strips it. sed keeps line
  # numbers intact (it edits line 1's bytes, not the line count) so the reported
  # frontmatter line numbers stay correct.
  FM="$(sed '1s/^\xEF\xBB\xBF//' "$f" | awk 'NR==1 { if ($0 !~ /^---[[:space:]]*$/) exit; fm=1; next }
             fm    { if ($0 ~ /^---[[:space:]]*$/) exit; print NR ":" $0 }')"
  [ -z "$FM" ] && continue
  # BAN (2026-08-14, ADR-0002 amendment): un-exemptable — there is deliberately
  # NO `grep -v ADR-` here, so an ADR annotation on the line does NOT exempt it.
  # Boundary-bounded: a longer id (…5x/…50) and a different id (…4-8) do NOT match.
  # `model[[:space:]]*:` tolerates whitespace before the colon (Fix G2 finding 1:
  # YAML `model : x` resolves the model, so it must be linted) without broadening
  # to look-alike keys (`models:` / `model_x:` still do NOT match).
  BANHITS="$(printf '%s\n' "$FM" | grep -iE "^[0-9]+:[[:space:]]*model[[:space:]]*:[[:space:]]*[\"']?${BANNED}[\"']?[[:space:]]*(#.*)?$" || true)"
  if [ -n "$BANHITS" ]; then
    FAIL=1
    echo "BLOCKED (VibeGates R-1/ban): banned model id in $f — maintainer ban decision 2026-08-14 (ADR-0002 amendment, ban enforcement); a ban admits no ADR exemption." >&2
    printf '%s\n' "$BANHITS" | head -5 >&2
  fi
  HITS="$(printf '%s\n' "$FM" | grep -iE "^[0-9]+:[[:space:]]*model[[:space:]]*:[[:space:]]*[\"']?(${TIERS})[\"']?[[:space:]]*(#.*)?$" | grep -v 'ADR-' || true)"
  if [ -n "$HITS" ]; then
    FAIL=1
    echo "BLOCKED (VibeGates R-1/R-4): bare model tier in $f — pin the exact identifier or annotate the line with its ADR:" >&2
    printf '%s\n' "$HITS" | head -5 >&2
  fi
done <<EOF_FILES
$(find "$ROOT/.claude/agents" "$ROOT/.claude/skills" -name '*.md' 2>/dev/null)
EOF_FILES

# 2) Settings JSON — "model"/"advisorModel" bare-tier values, unless excepted
#    with an ADR ref. Every key:value pair on a line is checked, not only the first.
#    KNOWN LIMITATION (consigned 2026-08-20, G2 finding 4; lowest likelihood - JSON
#    formatters keep a scalar key:value on one line): this JSON scan is LINE-BASED,
#    so a key and value SPLIT across two lines evades it (the .ps1 twin reads -Raw
#    and DOES catch it - a declared parity divergence). Fix = a raw multi-line read;
#    deferred as disproportionate for the rarest case.
for f in "$ROOT/.claude/settings.json" "$ROOT/.claude/settings.local.json"; do
  [ -f "$f" ] || continue
  SCANNED=$((SCANNED + 1))
  # BAN (2026-08-14, ADR-0002 amendment): checked BEFORE the bare-tier pass so a
  # settings file carrying ONLY the banned id (no tier pair) is still caught —
  # the bare-tier pass below `continue`s when no tier pair is present. Un-exemptable:
  # the exceptions file is deliberately NOT consulted here.
  BANPAIRS="$(grep -ioE "\"(model|advisorModel)\"[[:space:]]*:[[:space:]]*\"${BANNED}\"" "$f" 2>/dev/null || true)"
  if [ -n "$BANPAIRS" ]; then
    while IFS= read -r bp; do
      [ -z "$bp" ] && continue
      BKEY="$(printf '%s' "$bp" | grep -ioE '"(model|advisorModel)"' | tr -d '"' | head -1)"
      FAIL=1
      echo "BLOCKED (VibeGates R-1/ban): banned model id in $f ($BKEY) — maintainer ban decision 2026-08-14 (ADR-0002 amendment, ban enforcement); only the maintainer may derogate." >&2
    done <<EOF_BAN
$BANPAIRS
EOF_BAN
  fi
  PAIRS="$(grep -ioE "\"(model|advisorModel)\"[[:space:]]*:[[:space:]]*\"(${TIERS})\"" "$f" 2>/dev/null || true)"
  [ -z "$PAIRS" ] && continue
  while IFS= read -r pair; do
    [ -z "$pair" ] && continue
    KEY="$(printf '%s' "$pair" | grep -ioE '"(model|advisorModel)"' | tr -d '"' | head -1)"
    VAL="$(printf '%s' "$pair" | grep -ioE ":[[:space:]]*\"(${TIERS})\"" | grep -ioE "(${TIERS})" | head -1)"
    # Boundary after VALUE is required (space or EOL), THEN the ADR ref on that line.
    if [ -f "$EXCEPTIONS" ] && grep -iE "^${KEY}=${VAL}([[:space:]]|\$)" "$EXCEPTIONS" 2>/dev/null | grep -q 'ADR-'; then
      continue
    fi
    FAIL=1
    echo "BLOCKED (VibeGates R-1/R-4): bare model tier in $f (${KEY}: ${VAL}) — pin it, or add '${KEY}=${VAL} ADR-XXXX' to .claude/model-exceptions.txt" >&2
  done <<EOF_PAIRS
$PAIRS
EOF_PAIRS
done

# 3) The exceptions file itself: every line must carry an ADR reference.
if [ -f "$EXCEPTIONS" ]; then
  NAKED="$(grep -vE '(^[[:space:]]*$|^#|ADR-)' "$EXCEPTIONS" || true)"
  if [ -n "$NAKED" ]; then
    FAIL=1
    echo "BLOCKED (VibeGates R-23): exception without ADR reference in $EXCEPTIONS:" >&2
    printf '%s\n' "$NAKED" | head -5 >&2
  fi
fi

if [ "$FAIL" -ne 0 ]; then
  echo "A bare tier resolves to whatever the platform decides (measured 2026-08-05). Pin the catalogue identifier." >&2
  exit 2
fi
if [ "$SCANNED" -eq 0 ]; then
  echo "OK (R-1/R-4): nothing in scope — 0 agent/skill/settings files found under $ROOT/.claude (green by absence, not by verification)."
else
  echo "OK (R-1/R-4): no bare model tiers in $SCANNED scanned file(s); exceptions all ADR-referenced."
fi
exit 0
