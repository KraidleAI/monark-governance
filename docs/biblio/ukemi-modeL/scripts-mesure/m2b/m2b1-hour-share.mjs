// M-2b.1 — Part de l'heure de krach 2025-10-10T21:00Z dans le volume spot Binance ETHUSDT de cette heure.
// Worker claude-opus-4-8[1m], 2026-09-19. R-20 (no commit). Read-only public RPC + Binance public klines.
// Pré-enregistrement: MESURES-M2b-sources-2026-09-19.md §3.1. JSON haché SANS horodatage (timing dans .timing.txt).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { rpc, hexBlock } from './lib-m2b.mjs';

const started=new Date().toISOString();
const RAW='F:/Monark/docs/census-2026-09-18/data/A-rawlogs.jsonl';
const LO=23543616, HI=23557920, WETH='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const T2100=1760130000, T2200=1760133600;                 // 2025-10-10T21:00Z .. 22:00Z (UTC)
const START_MS=1760130000000;                              // Binance startTime
// pre-registered self-test: 1760054400 is 2025-10-10T00:00Z (divisible by 86400), +75600s = 21:00Z
if(1760054400%86400!==0) throw new Error('midnight self-test FAILED');
if(1760054400+75600!==T2100) throw new Error('21:00Z self-test FAILED');
// M-2 lead-lag IC95 lower bounds (from m2-results.json)
const BLO={ market:-0.000051224071164199977, oracle:-0.00009366191053782448 };

// ---- WETH events + per-block ts (recompute Q from raw, NOT from hourly) ----
const ev=readFileSync(RAW,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l))
  .filter(r=>r.block>=LO&&r.block<=HI&&r.collateral.toLowerCase()===WETH)
  .map(r=>({block:r.block, q:Number(BigInt(r.liquidatedCollateralAmount))/1e18}));
const blocks=[...new Set(ev.map(e=>e.block))].sort((a,b)=>a-b);
const tsOf=new Map();
for(const b of blocks){ const h=await rpc('eth_getBlockByNumber',[hexBlock(b),false]); tsOf.set(b,parseInt(h.timestamp,16)); }
const SigmaWETH=ev.reduce((s,e)=>s+e.q,0);
// Q in the crash hour, from block ts
let Q_hour=0; const inHour=ev.filter(e=>{ const t=tsOf.get(e.block); return t>=T2100&&t<T2200; });
Q_hour=inHour.reduce((s,e)=>s+e.q,0);
// 4 UTC-aligned 15-min sub-buckets of the hour
const sub=[0,1,2,3].map(k=>({from:T2100+k*900, to:T2100+(k+1)*900, label:new Date((T2100+k*900)*1000).toISOString().slice(11,16)+'Z', q:0}));
for(const e of inHour){ const t=tsOf.get(e.block); const k=Math.floor((t-T2100)/900); if(k>=0&&k<4) sub[k].q+=e.q; }
const Q_max_bucket=Math.max(...sub.map(s=>s.q));
const n_blocks_hour=[...new Set(inHour.map(e=>e.block))].length;

// ---- Binance 1h kline (pinned startTime) + raw-body sha ----
const url1h=`https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&startTime=${START_MS}&limit=1`;
const r1h=await fetch(url1h); const body1h=await r1h.text(); const sha1h=createHash('sha256').update(body1h).digest('hex');
const k1h=JSON.parse(body1h)[0];
const openTime=k1h[0], V_base_1h=+k1h[5], V_quote_1h=+k1h[7], closeTime=k1h[6];
if(openTime!==START_MS) throw new Error('kline openTime mismatch: '+openTime);
// cross-check: sum of 60 1-min klines base volume of that hour
const url1m=`https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&startTime=${START_MS}&endTime=${START_MS+3600000-1}&limit=60`;
const r1m=await fetch(url1m); const body1m=await r1m.text(); const sha1m=createHash('sha256').update(body1m).digest('hex');
const arr1m=JSON.parse(body1m); const V_base_1m_sum=arr1m.reduce((s,c)=>s+ +c[5],0); const n1m=arr1m.length;
const crosscheck_ok=Math.abs(V_base_1m_sum-V_base_1h)/V_base_1h<1e-6;

// ---- ratio + borne haute honnête ----
const ratio_hour=Q_hour/V_base_1h;
const bh=(blo,Q)=>{ const logimp=blo*Q; return { log:logimp, pct:(Math.exp(logimp)-1)*100 }; };
const borne_haute={};
for(const feed of ['market','oracle']){ borne_haute[feed]={ Qhour:bh(BLO[feed],Q_hour), Qmaxbucket:bh(BLO[feed],Q_max_bucket) }; }

const out={
  measure:'M-2b.1 hour-share 2025-10-10T21:00Z',
  model:'claude-opus-4-8[1m]',
  window_blocks:[LO,HI], hour_utc:'2025-10-10T21:00Z', hour_ts:[T2100,T2200],
  SigmaWETH_event:SigmaWETH, n_events_event:ev.length, n_blocks_event:blocks.length,
  Q_hour_WETH:Q_hour, n_events_hour:inHour.length, n_blocks_hour,
  sub_buckets_15min:sub.map(s=>({label:s.label, q_weth:s.q})), Q_max_bucket_WETH:Q_max_bucket,
  binance:{ url_1h:url1h, sha256_body_1h:sha1h, openTime:openTime, closeTime, V_base_ETH_1h:V_base_1h, V_quote_USDT_1h:V_quote_1h,
            url_1m:url1m, sha256_body_1m:sha1m, n_1m:n1m, V_base_ETH_1m_sum:V_base_1m_sum, crosscheck_1m_eq_1h:crosscheck_ok },
  ratio_Q_over_binanceBase_hour:ratio_hour, ratio_pct:ratio_hour*100, bascule_threshold_pct:5.0, exceeds_bascule:ratio_hour*100>5.0,
  IC95_lo_M2:BLO,
  borne_haute_honnete:borne_haute,
  note:'borne_haute = IC95_lo(M-2 lead-lag b, par bucket 15min) x Q ; point-estime M-2 POSITIF, donc borne pessimiste (edge de CI), pas un effet detecte.'
};
const p='F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b1-hour-share.json';
writeFileSync(p, JSON.stringify(out,null,2));
const sha=createHash('sha256').update(readFileSync(p)).digest('hex');
const finished=new Date().toISOString();
writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b1-hour-share.timing.txt',
  `started=${started}\nfinished=${finished}\njson_sha256=${sha}\n`);
console.log('Q_hour(21:00Z)=',Q_hour.toFixed(2),'WETH  n_events=',inHour.length,' n_blocks=',n_blocks_hour);
console.log('sub-buckets:',sub.map(s=>`${s.label}=${s.q.toFixed(1)}`).join(' '),' Q_max_bucket=',Q_max_bucket.toFixed(2));
console.log('Binance V_base_1h=',V_base_1h,'ETH  crosscheck_1m_sum=',V_base_1m_sum.toFixed(2),'ok=',crosscheck_ok,' body_sha=',sha1h.slice(0,16));
console.log('ratio=',(ratio_hour*100).toFixed(4),'%  exceeds 5%?',ratio_hour*100>5.0);
for(const f of ['market','oracle']) console.log(`borne_haute[${f}] Qhour: ${borne_haute[f].Qhour.log.toFixed(4)} log = ${borne_haute[f].Qhour.pct.toFixed(2)}%  | Qmaxbucket: ${borne_haute[f].Qmaxbucket.log.toFixed(4)} log = ${borne_haute[f].Qmaxbucket.pct.toFixed(2)}%`);
console.log('json_sha256=',sha);
