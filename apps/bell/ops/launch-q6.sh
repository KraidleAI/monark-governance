#!/usr/bin/env bash
# MONARK Bell -- Q6 course launcher, ONE script for every mint (ADR-BELL-CASH-LEG-1 D5 + C-4, C-5, C-7, C-9). It replaces the
# volatile launch-q6-fast-<MINT>.sh of seq 1 (identical up to the mint). Fast variant (decision 150): two paid Solana operators,
# --operators helius,chainstack. Run by the ORCHESTRATOR only (R-20), from the execution tree itself:
#   Q6_DRYRUN=1 bash "$Q6_EXEC_TREE/apps/bell/ops/launch-q6.sh" <MINT> <mode> --out <dir>   guards + cost pre-flight, writes nothing
#   bash "$Q6_EXEC_TREE/apps/bell/ops/launch-q6.sh" <MINT> <mode> --out <dir>               the course (detached, RUNBOOK-SUP-3)
# MINT: TSLAx | AAPLx | SPYx | NVDAx. mode (ET; ADV month = August 2026 for every session, rule P-11 of PRECONDITIONS):
#   smoke Wed 2026-09-16 14:00:00-14:14:59 (15 min, never cited) | W1 Monday 09-14 04:00 -> Monday 09-21 03:59:59 | W2 Fri 09-18 04:00
#   -> Monday 09-21 03:59:59 | W3 Wed 09-16 04:00 -> Thu 09-17 03:59:59 | W4 Wed 09-16 09:30 -> 15:59:59 (one regular session).
# --out is REQUIRED; the script stops if <out>/state.json exists (never an overwrite: move the previous attempt, it is proof).
# The inputs that name the G7 of the course are never committed (a commit cannot carry its own SHA); the orchestrator exports
#   Q6_SHA_G7 (40 hex), Q6_EXEC_TREE (clean tree at Q6_SHA_G7, node_modules installed), Q6_TRAJ_FILE + Q6_TRAJ_SHA256 (a produce
#   <= 12 h old) and Q6_FLOOR_CHAINSTACK_RU (canonical ledger sum + a declared margin). None is a secret: the DRYRUN line prints them.
# Environment (C-5; least privilege, G2 M7): the collector reads BELL_SOLANA_RPC (set below), HELIUS_API_KEY, CHAINSTACK_SOLANA_URL,
#   POLYGON_API_KEY (the cross-check and the ADV bars) and DATABENTO_API_KEY (the reference close, D1: no longer removed). Removed:
#   what it reads but this course does not need (CHAINSTACK_ETH_URL, the --eth leg only; BELL_HALTS_CSV, off for Q6 as in seq 1)
#   and the paid endpoints it never reads (CHAINSTACK_BASE_URL, CHAINSTACK_BSC_URL, CHAINSTACK_ROBINHOOD_URL). No key value is
#   ever printed nor copied (A-7): xtrace is forced off and only lengths are taken.
# After the exit: node "$Q6_EXEC_TREE/apps/bell/ops/q6-controls.mjs" --variant fast --mint <MINT> --mode <mode> --out <dir> \
#   --exec-tree "$Q6_EXEC_TREE" --ledger-cycle-dir F:/monark-ledger/helius-2026-09-19 --seq1-state <seq 1 state.json>
#   (exit 0 = no FAIL; C14 close_ref_present blocks the publication, C-6).
set -u
{ set +x; } 2>/dev/null
usage() { echo "usage: bash launch-q6.sh <TSLAx|AAPLx|SPYx|NVDAx> <smoke|W1|W2|W3|W4> --out <dir>" >&2; exit 2; }
MINT="${1:-}"; MODE="${2:-}"; OUT=""
[ $# -ge 2 ] && shift 2 || usage
while [ $# -gt 0 ]; do
  case "$1" in
    --out) [ $# -ge 2 ] && [ -n "$2" ] && [ "${2#--}" = "$2" ] || usage; OUT="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[ -n "$OUT" ] || usage
case "$MINT" in TSLAx) UNDERLYING=TSLA ;; AAPLx) UNDERLYING=AAPL ;; SPYx) UNDERLYING=SPY ;; NVDAx) UNDERLYING=NVDA ;; *) usage ;; esac

# ---- constants measured for seq 1 and still valid (evidence: the seq 1 RENDU-FAST.md; a floor is a max with the ledger sum) ----
LOT_TIP=70bb716c03627cb0b3a65a7ae75f40ee1ff73f34        # lot BELL-ADV-1: must be an ancestor of the G7
REF_TRAJ=F:/PRODUITS/etude-2026-09-20/bell-b1bis-raws/scan/rebase-trajectory.json
REF_TRAJ_SHA256=dd165fbfd50f9658619355b77f44a018d955df1c16105de2ccf0882602af0195
TRAJ_MAX_AGE_H=12
LEDGER_DIR=F:/monark-ledger                                # option B: helius on its canonical cycle ledger
CYCLE=helius-2026-09-19
CANON_CS_CYCLE_DIR=F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19   # canonical chainstack ledger (Ukemi/prober)
FLOOR_HELIUS=60938
HELIUS_ENDPOINT='https://mainnet.helius-rpc.com/'
ANCHORS=F:/Monark/docs/course-bell/ANCHORS.md
SPYX_R2_START=2026-09-23T04:38:54Z                         # the SPYx stop anchor must be later (P-1, decision 150)
LOGDIR=F:/course-bell/logs
MAX_PAGES=20000; CAP_GSFA=20000; CAP_GAI=20; CAP_GTFA=1; BODY_SAMPLE=5
MIN_INTERVAL=25                                            # D-n FAST-1: <= 40 req/s at zero latency (80 % of the Helius plan)
COST_CAP_USD=1                                             # C-7: Databento metadata.get_cost ceiling per course

case "$MODE" in
  smoke) FROM=1789581600000; TO=1789582499000; LOG=$LOGDIR/q6-$MINT-fastsmoke.log; MAX_CREDITS=20000;  CAP_GTX=20000;  MAX_CALLS=60000;  MAX_RU=50000 ;;
  W1)    FROM=1789372800000; TO=1789977599000; LOG=$LOGDIR/q6-$MINT.log;           MAX_CREDITS=150000; CAP_GTX=150000; MAX_CALLS=400000; MAX_RU=110000 ;;
  W2)    FROM=1789718400000; TO=1789977599000; LOG=$LOGDIR/q6-$MINT.log;           MAX_CREDITS=150000; CAP_GTX=150000; MAX_CALLS=400000; MAX_RU=110000 ;;
  W3)    FROM=1789545600000; TO=1789631999000; LOG=$LOGDIR/q6-$MINT.log;           MAX_CREDITS=150000; CAP_GTX=150000; MAX_CALLS=400000; MAX_RU=110000 ;;
  W4)    FROM=1789565400000; TO=1789588799000; LOG=$LOGDIR/q6-$MINT.log;           MAX_CREDITS=150000; CAP_GTX=150000; MAX_CALLS=400000; MAX_RU=110000 ;;
  *) usage ;;
esac

stop() { echo "STOP [q6 $MINT $MODE]: $*" >&2; exit 3; }
export GIT_OPTIONAL_LOCKS=0
[ -e "$OUT/state.json" ] && stop "$OUT/state.json exists: move the previous attempt (proof), never an overwrite"

JS_TRAJ='const fs=require("fs");const [,tf,rf,m]=process.argv;
const T=JSON.parse(fs.readFileSync(tf,"utf8")),R=JSON.parse(fs.readFileSync(rf,"utf8"));const t=T[m],r=R[m];
if(!t||t.scanComplete!==true||t.scanMethod!=="authority"||!Array.isArray(t.events)){console.error("entry "+m+" absent or incomplete (scanComplete="+(t&&t.scanComplete)+")");process.exit(3);}
if(!r||!Array.isArray(r.events)){console.error("reference without "+m);process.exit(3);}
const K=e=>[e.kind,e.multiplier,e.multiplierBitsHex,e.effectiveTimestampSec,e.blockTimeSec,e.slot,e.instructionIndex,e.signature].join("|");
if(t.events.length<r.events.length){console.error("fewer events than the reference");process.exit(3);}
for(let i=0;i<r.events.length;i++)if(K(t.events[i])!==K(r.events[i])){console.error("event "+i+" differs from the reference");process.exit(3);}
console.log("traj_"+m+"_events="+t.events.length+" ref="+r.events.length+" new="+(t.events.length-r.events.length));'
# C-7 cost pre-flight: the FREE metadata.get_cost over every reference-close day the window can reach (the upper bound of the
# collector's range request), built by the collector's own close.ts (query and host). The key is read from the environment only
# (never argv) and sent as the Basic username; ONLY the cost is printed. Exit 3 = no key / HTTP error / not a number, 4 = over the cap.
JS_COST='import { pathToFileURL } from "node:url"; import { join } from "node:path";
const [tree, sym, from, to, cap] = process.argv.slice(1);
const cl = await import(pathToFileURL(join(tree, "apps/bell/src/close.ts")).href), ss = await import(pathToFileURL(join(tree, "apps/bell/src/sessions.ts")).href);
const days = new Set();
for (let ms = Number(from); ms <= Number(to); ms += 60000) { const c = ss.classifySession(ms); days.add(ss.refCloseDateOf(c.session, c.sessionDateET)); }
const d = [...days].sort(), end = new Date(Date.parse(d[d.length - 1] + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
const key = process.env.DATABENTO_API_KEY ?? "";
if (key === "") { console.error("cost pre-flight: no DATABENTO_API_KEY"); process.exit(3); }
const res = await fetch(cl.DATABENTO_HIST + cl.databentoCostPath([sym], d[0], end), { headers: { Authorization: "Basic " + Buffer.from(key + ":").toString("base64") } });
if (!res.ok) { console.error("cost pre-flight: HTTP " + res.status); process.exit(3); }
let v; try { v = JSON.parse(await res.text()); } catch { console.error("cost pre-flight: not JSON"); process.exit(3); }
const cost = Number(v);
if (!Number.isFinite(cost)) { console.error("cost pre-flight: not a number"); process.exit(3); }
console.log("cost_usd=" + cost);
if (cost > Number(cap)) process.exit(4);'

# ---- GUARDS (read-only; NOTHING is written before they all pass) ----
SHA_G7="${Q6_SHA_G7:-}"; EXEC_TREE="${Q6_EXEC_TREE:-}"; TRAJ_FILE="${Q6_TRAJ_FILE:-}"; TRAJ_SHA256="${Q6_TRAJ_SHA256:-}"; FLOOR_CHAINSTACK_RU="${Q6_FLOOR_CHAINSTACK_RU:-}"
[[ "$SHA_G7" =~ ^[0-9a-f]{40}$ ]] || stop "Q6_SHA_G7 is not a 40-hex sha1"
[[ "$TRAJ_SHA256" =~ ^[0-9a-f]{64}$ ]] || stop "Q6_TRAJ_SHA256 is not a 64-hex sha256"
[[ "$FLOOR_CHAINSTACK_RU" =~ ^[0-9]+$ ]] || stop "Q6_FLOOR_CHAINSTACK_RU is not an integer"
[ -n "$EXEC_TREE" ] && [ -d "$EXEC_TREE" ] || stop "Q6_EXEC_TREE is not a directory"
# P-1 (decision 150): no --rebase-crosscheck draw alive, and the SPYx stop anchored
NCROSS=$(powershell -NoProfile -Command "@(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -like '*--rebase-crosscheck*' }).Count" 2>/dev/null | tr -d '\r')
[ "$NCROSS" = "0" ] || stop "a --rebase-crosscheck draw is alive (count=$NCROSS): the SPYx draw must be STOPPED (RUNBOOK-SUP-2)"
LASTSTOP=$(awk -F'|' '$3 ~ /^ *mint_(resume|end) *$/ && $4 ~ /^ *SPYx *$/ { d=$2; gsub(/ /,"",d); if (d > m) m=d } END { print m }' "$ANCHORS" 2>/dev/null)
[ -n "$LASTSTOP" ] && [[ "$LASTSTOP" > "$SPYX_R2_START" ]] || stop "no SPYx mint_resume/mint_end anchor later than $SPYX_R2_START in ANCHORS.md"
HEAD=$(git -C "$EXEC_TREE" rev-parse HEAD 2>/dev/null) || stop "Q6_EXEC_TREE is not a git tree"
[ "$HEAD" = "$SHA_G7" ] || stop "HEAD of Q6_EXEC_TREE ($HEAD) != Q6_SHA_G7"
git -C "$EXEC_TREE" merge-base --is-ancestor "$LOT_TIP" HEAD || stop "lot BELL-ADV-1 ($LOT_TIP) is not an ancestor of the G7"
[ -z "$(git -C "$EXEC_TREE" status --porcelain)" ] || stop "the execution tree is not clean"
cmp -s "${BASH_SOURCE[0]}" "$EXEC_TREE/apps/bell/ops/launch-q6.sh" || stop "this script differs from the G7 copy: run $EXEC_TREE/apps/bell/ops/launch-q6.sh"
NODEV=$(node -p "process.versions.node" 2>/dev/null) || stop "node not found"
[ "${NODEV%%.*}" = "24" ] || stop "node $NODEV (expected 24.x)"
( cd "$EXEC_TREE" && node -e 'const p=require.resolve("@monark/rpc-guard");if(!p.toLowerCase().startsWith((process.cwd()+require("path").sep).toLowerCase())){console.error("outside the tree: "+p);process.exit(3)}' ) || stop "@monark/rpc-guard does not resolve inside Q6_EXEC_TREE"
# lengths only, never a copy (G2 B2): each variable is tested set, then measured in place
[ -n "${HELIUS_API_KEY+x}" ] && [ "${#HELIUS_API_KEY}" -eq 36 ] || stop "HELIUS_API_KEY absent or of length ${HELIUS_API_KEY+${#HELIUS_API_KEY}} (expected 36)"
[ -n "${POLYGON_API_KEY+x}" ] && [ "${#POLYGON_API_KEY}" -eq 32 ] || stop "POLYGON_API_KEY absent or of length ${POLYGON_API_KEY+${#POLYGON_API_KEY}} (expected 32)"
[ -n "${CHAINSTACK_SOLANA_URL+x}" ] && [ "${#CHAINSTACK_SOLANA_URL}" -eq 75 ] || stop "CHAINSTACK_SOLANA_URL absent or of length ${CHAINSTACK_SOLANA_URL+${#CHAINSTACK_SOLANA_URL}} (expected 75, measured 2026-09-23)"
[ -n "${DATABENTO_API_KEY+x}" ] && [ "${#DATABENTO_API_KEY}" -eq 32 ] || stop "DATABENTO_API_KEY absent or of length ${DATABENTO_API_KEY+${#DATABENTO_API_KEY}} (expected 32: the cash leg is ON, D1)"
[ -d "$LEDGER_DIR/$CYCLE" ] || stop "cycle directory $LEDGER_DIR/$CYCLE absent"
if ls "$LEDGER_DIR/$CYCLE/"*.lock >/dev/null 2>&1; then stop "a lock is held in $LEDGER_DIR/$CYCLE (another Helius course is alive)"; fi
if ls "$CANON_CS_CYCLE_DIR/"*.lock >/dev/null 2>&1; then stop "a lock is held in $CANON_CS_CYCLE_DIR: never two Chainstack courses at once (121 d)"; fi
[ -f "$TRAJ_FILE" ] || stop "Q6_TRAJ_FILE absent"
[ "$(sha256sum "$TRAJ_FILE" | cut -c1-64)" = "$TRAJ_SHA256" ] || stop "sha256(Q6_TRAJ_FILE) != Q6_TRAJ_SHA256"
[ "$(sha256sum "$REF_TRAJ" | cut -c1-64)" = "$REF_TRAJ_SHA256" ] || stop "the 2026-09-20 reference trajectory is altered or absent"
AGE_S=$(( $(date +%s) - $(stat -c %Y "$TRAJ_FILE") ))
[ "$AGE_S" -le $(( TRAJ_MAX_AGE_H * 3600 )) ] || stop "trajectory $(( AGE_S / 3600 )) h old > $TRAJ_MAX_AGE_H h: re-run the produce"
TRAJ_CHECK=$(node -e "$JS_TRAJ" "$TRAJ_FILE" "$REF_TRAJ" "$MINT") || stop "trajectory check failed"
COST=$(node --input-type=module -e "$JS_COST" -- "$EXEC_TREE" "$UNDERLYING" "$FROM" "$TO" "$COST_CAP_USD") || stop "cost pre-flight refused (${COST:-no cost}; cap $COST_CAP_USD USD)"
echo "$COST"
if [ "${Q6_DRYRUN:-0}" = "1" ]; then
  echo "DRYRUN OK [q6 $MINT $MODE] guards passed: head=$HEAD node=v$NODEV $TRAJ_CHECK $COST spyx_stop_anchor=$LASTSTOP from=$FROM to=$TO out=$OUT log=$LOG max_credits=$MAX_CREDITS max_ru=$MAX_RU max_calls=$MAX_CALLS min_interval=$MIN_INTERVAL floor_chainstack=$FLOOR_CHAINSTACK_RU traj=$TRAJ_FILE"
  exit 0
fi

# ---- LAUNCH (the only section that writes) ----
mkdir -p "$LOGDIR" "$(dirname "$OUT")" || stop "mkdir"
START=$(date -u +%FT%TZ)
HDR="q6-launch mint=$MINT mode=$MODE variant=fast operators=helius,chainstack from=$FROM to=$TO start=$START head=$HEAD traj_sha256=$TRAJ_SHA256 floor_chainstack=$FLOOR_CHAINSTACK_RU node=v$NODEV $COST out=$OUT wrapper_pid=$$"
echo "$HDR" >> "$LOG"
echo "$HDR log=$LOG $TRAJ_CHECK" >> "$LOGDIR/q6-launch.log"
cd "$EXEC_TREE" || stop "cd Q6_EXEC_TREE"
export BELL_SOLANA_RPC="$HELIUS_ENDPOINT"
env -u CHAINSTACK_ETH_URL -u BELL_HALTS_CSV -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL \
  node apps/bell/src/collect.ts --pools "$MINT" \
  --from-utc "$FROM" --to-utc "$TO" \
  --rebase-trajectory "$TRAJ_FILE" \
  --operators helius,chainstack \
  --ledger-dir "$LEDGER_DIR" --cycle "$CYCLE" --floor "helius=$FLOOR_HELIUS,chainstack=$FLOOR_CHAINSTACK_RU" \
  --method-caps "getSignaturesForAddress=$CAP_GSFA,getTransaction=$CAP_GTX,getAccountInfo=$CAP_GAI,getTransactionsForAddress=$CAP_GTFA" \
  --max-credits "$MAX_CREDITS" --max-ru "$MAX_RU" --max-calls "$MAX_CALLS" --max-pages "$MAX_PAGES" \
  --body-sample "$BODY_SAMPLE" --min-interval "$MIN_INTERVAL" \
  --out "$OUT" \
  >> "$LOG" 2>&1
RC=$?
echo "exit=$RC $(date -u +%FT%TZ)" >> "$LOG"
exit $RC
