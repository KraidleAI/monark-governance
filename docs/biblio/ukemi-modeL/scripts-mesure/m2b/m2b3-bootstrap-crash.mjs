// M-2b.3 — Rejeu EXACT du bootstrap bloc-mobile de M-2 (lead-lag), decomposition par le bucket de Q max ("krach").
// Worker claude-opus-4-8[1m], 2026-09-19. R-20. Read-only public RPC + Binance public. Mirrors m2-lambda.mjs leadlag.
// Pre-enregistrement: MESURES-M2b-sources-2026-09-19.md §3.3. Verrou: b/lo/hi doivent egaler m2-results.json.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { sel, rpc, pad, hexBlock, mulberry32, ols } from './lib-m2b.mjs';

const started=new Date().toISOString();
const RAW='F:/Monark/docs/census-2026-09-18/data/A-rawlogs.jsonl';
const LO=23543616, HI=23557920, WETH='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ORACLE='0x54586bE62E3c3580375aE3723C145253060Ca0C2';
const SEL_PRICE=sel('getAssetPrice(address)');
const SEED=20251010, BUCKET_SEC=900, BOOT=2000, BLOCK_LEN=4;
// M-2 reference values (m2-results.json) for the fidelity lock
const REF={ market:{b:0.000012431941728499656, lo:-0.000051224071164199977, hi:0.00020502223129203922},
           oracle:{b:0.000010787426962049334, lo:-0.00009366191053782448, hi:0.00012284671938795567} };

const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const priceAt=(series,ts)=>{ let lo=0,hi=series.length-1,ans=null; while(lo<=hi){const m=(lo+hi)>>1; if(series[m].t<=ts){ans=series[m];lo=m+1;}else hi=m-1;} return ans?ans.close:(series[0]?series[0].close:null); };
async function binanceKlines(sym,startMs,endMs){ const out=[]; let cur=startMs;
  while(cur<endMs){ const u=`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1m&startTime=${cur}&endTime=${endMs}&limit=1000`; const r=await fetch(u); if(!r.ok) throw new Error('binance HTTP '+r.status); const k=await r.json(); if(!Array.isArray(k)||!k.length)break; for(const c of k) out.push({t:Math.floor(c[0]/1000),close:+c[4],vol:+c[5]}); cur=k[k.length-1][0]+60000; if(k.length<1000)break; }
  return {src:'binance',rows:out}; }

// ---- events + per-block ts (bmeta) ----
const ev=readFileSync(RAW,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l))
  .filter(r=>r.block>=LO&&r.block<=HI&&r.collateral.toLowerCase()===WETH).sort((a,b)=>a.block-b.block||a.logIndex-b.logIndex)
  .map(r=>({block:r.block,q:Number(BigInt(r.liquidatedCollateralAmount))/1e18}));
const blocks=[...new Set(ev.map(e=>e.block))].sort((a,b)=>a-b);
const bmeta=new Map();
for(const b of blocks){ const hdr=await rpc('eth_getBlockByNumber',[hexBlock(b),false]); bmeta.set(b,{ts:parseInt(hdr.timestamp,16)}); }
const t0=bmeta.get(blocks[0]).ts, t1=bmeta.get(blocks[blocks.length-1]).ts;
if(t0!==1760072207||t1!==1760216819) throw new Error('ts window self-test FAILED: '+t0+','+t1);
const S=ev.map(e=>({t:bmeta.get(e.block).ts, q:e.q}));

// ---- dense oracle at bucket-end blocks (EXACT mirror of m2-lambda) ----
const nb=Math.floor((t1-t0)/BUCKET_SEC)+1; const firstBlk=blocks[0]; const denseOracle=[];
for(let k=0;k<nb;k++){ const btEnd=t0+(k+1)*BUCKET_SEC; const blk=Math.min(HI, Math.max(firstBlk, firstBlk+Math.round((btEnd-t0)/12)));
  const hdr=await rpc('eth_getBlockByNumber',[hexBlock(blk),false]); const ts=parseInt(hdr.timestamp,16);
  const praw=await rpc('eth_call',[{to:ORACLE,data:SEL_PRICE+pad(WETH)},hexBlock(blk)]); denseOracle.push({t:ts,close:Number(BigInt(praw))/1e8}); }
denseOracle.sort((a,b)=>a.t-b.t);

// ---- market klines ----
const mkt=await binanceKlines('ETHUSDT',(t0-300)*1000,(t1+300)*1000);

// ---- buckets ----
const buckets=[]; for(let k=0;k<nb;k++){ const bt0=t0+k*BUCKET_SEC, bt1=bt0+BUCKET_SEC; const q=S.filter(s=>s.t>=bt0&&s.t<bt1).reduce((a,x)=>a+x.q,0);
  const pm=priceAt(mkt.rows,bt1); const po=priceAt(denseOracle,bt1); buckets.push({k,t:bt1,q,mkt:pm,oracle:po}); }

function buildRows(feedKey){ const rows=[]; for(let k=1;k<buckets.length-1;k++){ const p0=buckets[k-1][feedKey],p1=buckets[k][feedKey],p2=buckets[k+1][feedKey]; if(!(p0>0&&p1>0&&p2>0))continue;
    rows.push({dNext:Math.log(p2)-Math.log(p1), dPrev:Math.log(p1)-Math.log(p0), Q:buckets[k].q, kbucket:buckets[k].k}); } return rows; }
const fitB=(rs)=>ols(rs.map(r=>[1,r.Q,r.dPrev]),rs.map(r=>r.dNext));

// bootstrap that mirrors blockBootstrapCI EXACTLY, plus per-replicate crash-row membership
function bootWithCrash(rows, crashIdx, seed){ const n=rows.length; const rng=mulberry32(seed);
  const betasAll=[], betasWith=[], betasWithout=[]; let containsCount=0, finiteWith=0, finiteWithout=0, degWith=0, degWithout=0;
  for(let b=0;b<BOOT;b++){ const res=[]; const idxSet=new Set(); while(res.length<n){ const start=Math.floor(rng()*(n-BLOCK_LEN+1)); for(let j=0;j<BLOCK_LEN&&res.length<n;j++){ res.push(rows[start+j]); idxSet.add(start+j); } }
    const contains=idxSet.has(crashIdx); if(contains)containsCount++;
    const f=fitB(res); const finite=f&&Number.isFinite(f.beta[1]);
    if(finite){ betasAll.push(f.beta[1]); if(contains){betasWith.push(f.beta[1]);finiteWith++;} else {betasWithout.push(f.beta[1]);finiteWithout++;} }
    else { if(contains)degWith++; else degWithout++; } }
  const ci=(arr)=>{ if(!arr.length)return{lo:null,hi:null,median:null,reps:0}; const s=[...arr].sort((a,b)=>a-b); const q=(p)=>s[Math.min(s.length-1,Math.max(0,Math.floor(p*s.length)))]; return {lo:q(0.025),hi:q(0.975),median:q(0.5),reps:s.length}; };
  return { fraction_contains_crash:containsCount/BOOT, contains_count:containsCount,
    ci_all:ci(betasAll), ci_with_crash:ci(betasWith), ci_without_crash:ci(betasWithout),
    finite_with:finiteWith, finite_without:finiteWithout, degenerate_with:degWith, degenerate_without:degWithout }; }

const result={}; const fidelity={};
for(const feed of ['market','oracle']){ const feedKey=feed==='market'?'mkt':'oracle'; const rows=buildRows(feedKey);
  const f=fitB(rows); const b=f.beta[1];
  // crash row = max Q
  let crashIdx=0; for(let i=1;i<rows.length;i++) if(rows[i].Q>rows[crashIdx].Q) crashIdx=i;
  const boot=bootWithCrash(rows, crashIdx, SEED);
  // fidelity lock vs M-2
  const okB=Math.abs(b-REF[feed].b)<1e-18||b===REF[feed].b;
  const okLo=boot.ci_all.lo===REF[feed].lo, okHi=boot.ci_all.hi===REF[feed].hi;
  fidelity[feed]={ b_repro:b, b_ref:REF[feed].b, b_match:okB, lo_repro:boot.ci_all.lo, lo_ref:REF[feed].lo, lo_match:okLo, hi_repro:boot.ci_all.hi, hi_ref:REF[feed].hi, hi_match:okHi };
  result[feed]={ n_rows:rows.length, b, crash_row_index:crashIdx, crash_bucket_k:rows[crashIdx].kbucket,
    crash_bucket_ts_utc:new Date(buckets[rows[crashIdx].kbucket].t*1000).toISOString(), crash_bucket_Q:rows[crashIdx].Q, ...boot };
  console.log(`[${feed}] b=${b} (ref ${REF[feed].b}) match=${okB}`);
  console.log(`  ci_all lo=${boot.ci_all.lo} (ref ${REF[feed].lo}) match=${okLo} | hi=${boot.ci_all.hi} match=${okHi}`);
  console.log(`  crash row idx=${crashIdx} kbucket=${rows[crashIdx].kbucket} ts=${new Date(buckets[rows[crashIdx].kbucket].t*1000).toISOString()} Q=${rows[crashIdx].Q.toFixed(1)}`);
  console.log(`  fraction reps containing crash bucket=${(boot.fraction_contains_crash*100).toFixed(2)}%`);
  console.log(`  ci WITH crash: [${boot.ci_with_crash.lo}, ${boot.ci_with_crash.hi}] reps=${boot.ci_with_crash.reps}`);
  console.log(`  ci WITHOUT crash: [${boot.ci_without_crash.lo}, ${boot.ci_without_crash.hi}] reps=${boot.ci_without_crash.reps} (degenerate=${boot.degenerate_without})`);
}
// buckets overlapping the crash hour [21:00,22:00Z) for reference
const T2100=1760130000,T2200=1760133600; const overlap=buckets.filter(bk=>{const s=bk.t-BUCKET_SEC; return s<T2200 && bk.t>T2100;}).map(bk=>({k:bk.k, end_utc:new Date(bk.t*1000).toISOString(), q:Number(bk.q.toFixed(2))}));

const fidelity_ok=Object.values(fidelity).every(f=>f.b_match&&f.lo_match&&f.hi_match);
const out={ measure:'M-2b.3 moving-block bootstrap crash-bucket decomposition', model:'claude-opus-4-8[1m]',
  seed:SEED, bucket_sec:BUCKET_SEC, boot:BOOT, block_len:BLOCK_LEN, n_buckets:nb,
  fidelity_lock:fidelity, fidelity_all_match:fidelity_ok,
  buckets_overlapping_crash_hour:overlap, result };
const p='F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b3-bootstrap-crash.json';
writeFileSync(p, JSON.stringify(out,null,2));
const sha=createHash('sha256').update(readFileSync(p)).digest('hex');
const finished=new Date().toISOString();
writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b3-bootstrap-crash.timing.txt',
  `started=${started}\nfinished=${finished}\njson_sha256=${sha}\nfidelity_all_match=${fidelity_ok}\n`);
console.log('\nFIDELITY all match (b,lo,hi vs M-2):',fidelity_ok);
if(!fidelity_ok) console.log('*** FIDELITY LOCK FAILED — bootstrap is NOT the same as M-2; do not trust labeling ***');
console.log('json_sha256=',sha);
