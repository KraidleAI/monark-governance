// M-2 — Impact prix Λ ≠ 0 ? Cluster WETH, événement 2025-10-10/11. Worker claude-opus-4-8[1m] 2026-09-19. R-20.
// Pré-enregistrement: docs/biblio/ukemi-modeL/MESURES-prealables-2026-09-19.md §4. Read-only public RPC + Binance/Coinbase public.
// Selectors via inline keccak (self-tested). Q en WETH (liquidatedCollateralAmount/1e18). Bootstrap moving-block, seed 20251010.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// keccak-256 (self-tested, same impl as census)
const RC=[[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],[0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],[0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],[0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],[0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],[0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO=[0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){ for(let r=0;r<24;r++){ const C=new Array(10); for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; } const D=new Array(10); for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; } for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; } const B=new Array(50); for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; } for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); } s[0]^=RC[r][0]; s[1]^=RC[r][1]; } }
function keccak256(input){ const bytes=typeof input==='string'?Buffer.from(input,'utf8'):Buffer.from(input); const rate=136,s=new Array(50).fill(0); const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate); bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80; for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); } const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex'); }
if(keccak256('')!=='0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED');
const sel=(s)=>keccak256(s).slice(0,10);

// ---- pinned ----
const LO=23543616, HI=23557920, WETH='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ORACLE='0x54586bE62E3c3580375aE3723C145253060Ca0C2';
const SEL_PRICE=sel('getAssetPrice(address)');
const SEED=20251010, BUCKET_SEC=900, BOOT=2000, BLOCK_LEN=4; // 15-min buckets, moving-block bootstrap 1h blocks
const RPCS=['https://eth.drpc.org','https://rpc.mevblocker.io','https://eth-mainnet.public.blastapi.io'];
const pad=(a)=>a.toLowerCase().replace(/^0x/,'').padStart(64,'0');
const hexBlock=(n)=>'0x'+n.toString(16);
let rr=0; const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function rpc(method,params,tries=6){ let last; for(let i=0;i<tries;i++){ const url=RPCS[(rr++)%RPCS.length]; try{ const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),15000); const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:ctl.signal}); clearTimeout(to); if(!res.ok){last='HTTP '+res.status; await sleep(200); continue;} const j=await res.json(); if(j.error){last=JSON.stringify(j.error); await sleep(200); continue;} return j.result; }catch(e){ last=e.message; await sleep(200);} } throw new Error('rpc '+method+' failed: '+last); }

// ---- mulberry32 PRNG (seeded, deterministic; NEVER Math.random) ----
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// ---- OLS via normal equations (Gaussian elimination); returns coeffs + R^2 ----
function ols(Xrows,y){ const n=Xrows.length,k=Xrows[0].length; const XtX=Array.from({length:k},()=>new Array(k).fill(0)); const Xty=new Array(k).fill(0);
  for(let i=0;i<n;i++){ for(let a=0;a<k;a++){ Xty[a]+=Xrows[i][a]*y[i]; for(let b=0;b<k;b++) XtX[a][b]+=Xrows[i][a]*Xrows[i][b]; } }
  const M=XtX.map((row,i)=>[...row,Xty[i]]); // augmented
  for(let c=0;c<k;c++){ let piv=c; for(let r=c+1;r<k;r++) if(Math.abs(M[r][c])>Math.abs(M[piv][c]))piv=r; [M[c],M[piv]]=[M[piv],M[c]]; const d=M[c][c]||1e-12; for(let j=c;j<=k;j++)M[c][j]/=d; for(let r=0;r<k;r++){ if(r===c)continue; const f=M[r][c]; for(let j=c;j<=k;j++)M[r][j]-=f*M[c][j]; } }
  const beta=M.map(row=>row[k]);
  const ybar=y.reduce((s,v)=>s+v,0)/n; let sstot=0,ssres=0; for(let i=0;i<n;i++){ let yh=0; for(let a=0;a<k;a++)yh+=beta[a]*Xrows[i][a]; ssres+=(y[i]-yh)**2; sstot+=(y[i]-ybar)**2; }
  return { beta, r2: sstot>0?1-ssres/sstot:NaN, n }; }
function corr(a,b){ const n=a.length,ma=a.reduce((s,v)=>s+v,0)/n,mb=b.reduce((s,v)=>s+v,0)/n; let num=0,da=0,db=0; for(let i=0;i<n;i++){const u=a[i]-ma,v=b[i]-mb;num+=u*v;da+=u*u;db+=v*v;} return num/Math.sqrt(da*db); }
// self-test OLS: y=2+3x exact -> beta ~ [2,3], r2=1
{ const X=[[1,0],[1,1],[1,2],[1,3]], y=[2,5,8,11]; const f=ols(X,y); if(Math.abs(f.beta[0]-2)>1e-6||Math.abs(f.beta[1]-3)>1e-6||Math.abs(f.r2-1)>1e-9) throw new Error('OLS self-test FAILED '+JSON.stringify(f)); }

// moving-block bootstrap CI on a regression coefficient index `ci` of ols(buildX(rows), y(rows))
function blockBootstrapCI(rows, fit, coefIdx, rng){ const n=rows.length, nb=Math.ceil(n/BLOCK_LEN), betas=[];
  for(let b=0;b<BOOT;b++){ const res=[]; while(res.length<n){ const start=Math.floor(rng()*(n-BLOCK_LEN+1)); for(let j=0;j<BLOCK_LEN&&res.length<n;j++) res.push(rows[start+j]); } const f=fit(res); if(f&&Number.isFinite(f.beta[coefIdx])) betas.push(f.beta[coefIdx]); }
  betas.sort((a,b)=>a-b); const q=(p)=>betas[Math.min(betas.length-1,Math.max(0,Math.floor(p*betas.length)))];
  return { lo:q(0.025), hi:q(0.975), median:q(0.5), reps:betas.length }; }

async function binanceKlines(sym,startMs,endMs){ // paginate 1m klines; fallback coinbase
  const out=[]; let cur=startMs;
  try{ while(cur<endMs){ const u=`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1m&startTime=${cur}&endTime=${endMs}&limit=1000`; const r=await fetch(u); if(!r.ok) throw new Error('binance HTTP '+r.status); const k=await r.json(); if(!Array.isArray(k)||!k.length)break; for(const c of k) out.push({t:Math.floor(c[0]/1000),close:+c[4],vol:+c[5]}); cur=k[k.length-1][0]+60000; if(k.length<1000)break; } if(out.length) return {src:'binance',rows:out}; }catch(e){ console.log('  binance failed:',e.message); }
  // coinbase fallback: ETH-USD 60s candles, max 300/req
  try{ const cb=[]; let s=Math.floor(startMs/1000); const e=Math.floor(endMs/1000); while(s<e){ const seg=Math.min(e,s+300*60); const u=`https://api.exchange.coinbase.com/products/ETH-USD/candles?granularity=60&start=${new Date(s*1000).toISOString()}&end=${new Date(seg*1000).toISOString()}`; const r=await fetch(u,{headers:{'User-Agent':'monark-measure'}}); if(!r.ok)throw new Error('coinbase HTTP '+r.status); const k=await r.json(); for(const c of k) cb.push({t:c[0],close:+c[4],vol:+c[5]}); s=seg; await sleep(300);} cb.sort((a,b)=>a.t-b.t); if(cb.length) return {src:'coinbase',rows:cb}; }catch(e){ console.log('  coinbase failed:',e.message); }
  return {src:'none',rows:[]};
}
const priceAt=(series,ts)=>{ // last close at or before ts (carry-forward)
  let lo=0,hi=series.length-1,ans=null; while(lo<=hi){const m=(lo+hi)>>1; if(series[m].t<=ts){ans=series[m];lo=m+1;}else hi=m-1;} return ans?ans.close:(series[0]?series[0].close:null); };

async function main(){
  const started=new Date().toISOString();
  // ---- WETH events (offline) ----
  const ev=readFileSync('F:/Monark/docs/census-2026-09-18/data/A-rawlogs.jsonl','utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l))
    .filter(r=>r.block>=LO&&r.block<=HI&&r.collateral.toLowerCase()===WETH).sort((a,b)=>a.block-b.block||a.logIndex-b.logIndex)
    .map(r=>({block:r.block,logIndex:r.logIndex,q:Number(BigInt(r.liquidatedCollateralAmount))/1e18,user:r.user}));
  const blocks=[...new Set(ev.map(e=>e.block))].sort((a,b)=>a-b);
  console.log(`[M-2] WETH events=${ev.length} distinctBlocks=${blocks.length} SigmaWETH=${ev.reduce((s,e)=>s+e.q,0).toFixed(2)}`);

  // ---- per-block ts + oracle price (archive eth_call) ----
  const bmeta=new Map(); let i=0;
  for(const b of blocks){ const hdr=await rpc('eth_getBlockByNumber',[hexBlock(b),false]); const ts=parseInt(hdr.timestamp,16);
    const praw=await rpc('eth_call',[{to:ORACLE,data:SEL_PRICE+pad(WETH)},hexBlock(b)]); const p=Number(BigInt(praw))/1e8;
    bmeta.set(b,{ts,oracle:p}); if(++i%30===0)console.log(`  priced ${i}/${blocks.length}`); }
  const t0=bmeta.get(blocks[0]).ts, t1=bmeta.get(blocks[blocks.length-1]).ts;
  console.log(`[M-2] window ts [${t0},${t1}] = ${new Date(t0*1000).toISOString()} .. ${new Date(t1*1000).toISOString()} (${((t1-t0)/3600).toFixed(1)}h)`);
  console.log(`[M-2] oracle WETH price: first=${bmeta.get(blocks[0]).oracle.toFixed(2)} last=${bmeta.get(blocks[blocks.length-1]).oracle.toFixed(2)}`);

  // ---- market witness (Binance/Coinbase 1m) over window +/- 5min ----
  const mkt=await binanceKlines('ETHUSDT',(t0-300)*1000,(t1+300)*1000);
  console.log(`[M-2] market series src=${mkt.src} rows=${mkt.rows.length}`);
  const mktVol=mkt.rows.filter(r=>r.t>=t0&&r.t<=t1).reduce((s,r)=>s+r.vol,0);

  // ---- event-level series: cumulative Q, oracle P, market P ----
  let cum=0; const S=ev.map(e=>{ cum+=e.q; const m=bmeta.get(e.block); const pm=mkt.rows.length?priceAt(mkt.rows,m.ts):null; return {t:m.ts, dt:(m.ts-t0), q:e.q, Qcum:cum, oracle:m.oracle, mkt:pm}; });
  const SigmaQ=cum;

  // ---- LEVEL regressions on both feeds: logP ~ Qcum ; ~ t ; ~ Qcum+t ; corr(Qcum,t) ----
  const feeds={ oracle:S.map(s=>s.oracle), market:S.map(s=>s.mkt) };
  const Qcum=S.map(s=>s.Qcum), tt=S.map(s=>s.dt/3600); // hours
  const rQt=corr(Qcum,tt);
  const level={};
  for(const [name,Pser] of Object.entries(feeds)){ if(Pser.some(p=>p==null||!(p>0))){ level[name]={skip:'missing prices'}; continue; }
    const logP=Pser.map(p=>Math.log(p));
    const mQ=ols(S.map(s=>[1,s.Qcum]),logP), mT=ols(tt.map(h=>[1,h]),logP), mQT=ols(S.map((s,i)=>[1,s.Qcum,tt[i]]),logP);
    level[name]={ beta_Qcum_only:mQ.beta[1], r2_Qcum:mQ.r2, beta_t_only:mT.beta[1], r2_t:mT.r2,
      beta_Qcum_ctrlT:mQT.beta[1], beta_t_ctrlQ:mQT.beta[2], r2_QcumT:mQT.r2, n:mQ.n }; }

  // ---- LEAD-LAG on 15-min buckets ----
  const nb=Math.floor((t1-t0)/BUCKET_SEC)+1;
  // DENSE oracle series sampled at bucket-end blocks (fix advisor #1: event-sampled oracle undersamples
  // between liquidation blocks; Chainlink updates on 0.5%/1h between them). Estimate block ~12.09s/blk, fetch real ts.
  const firstBlk=blocks[0];
  const denseOracle=[];
  for(let k=0;k<nb;k++){ const btEnd=t0+(k+1)*BUCKET_SEC; const blk=Math.min(HI, Math.max(firstBlk, firstBlk+Math.round((btEnd-t0)/12)));
    const hdr=await rpc('eth_getBlockByNumber',[hexBlock(blk),false]); const ts=parseInt(hdr.timestamp,16);
    const praw=await rpc('eth_call',[{to:ORACLE,data:SEL_PRICE+pad(WETH)},hexBlock(blk)]); denseOracle.push({t:ts,close:Number(BigInt(praw))/1e8}); }
  denseOracle.sort((a,b)=>a.t-b.t);
  console.log(`[M-2] dense oracle samples=${denseOracle.length} (bucket-end blocks) first=${denseOracle[0].close.toFixed(2)} last=${denseOracle[denseOracle.length-1].close.toFixed(2)}`);
  const buckets=[]; for(let k=0;k<nb;k++){ const bt0=t0+k*BUCKET_SEC, bt1=bt0+BUCKET_SEC; const q=S.filter(s=>s.t>=bt0&&s.t<bt1).reduce((s,x)=>s+x.q,0);
    const pm=mkt.rows.length?priceAt(mkt.rows,bt1):null; const po=priceAt(denseOracle,bt1);
    buckets.push({k,t:bt1,q,mkt:pm,oracle:po}); }
  function leadlag(feedKey){ const rows=[]; for(let k=1;k<buckets.length-1;k++){ const p0=buckets[k-1][feedKey],p1=buckets[k][feedKey],p2=buckets[k+1][feedKey]; if(!(p0>0&&p1>0&&p2>0))continue;
      const dNext=Math.log(p2)-Math.log(p1), dPrev=Math.log(p1)-Math.log(p0), Q=buckets[k].q; rows.push({dNext,dPrev,Q,kbucket:buckets[k].k}); }
    const nonzero=rows.filter(r=>r.Q>0).length;
    const fitB=(rs)=>ols(rs.map(r=>[1,r.Q,r.dPrev]),rs.map(r=>r.dNext)); // dNext = a + b*Q + c*dPrev(AR1)
    const fitBt=(rs)=>ols(rs.map(r=>[1,r.Q,r.dPrev,r.kbucket]),rs.map(r=>r.dNext)); // + explicit time trend
    const f=fitB(rows), ft=fitBt(rows); const rng=mulberry32(SEED); const ci=blockBootstrapCI(rows,fitB,1,rng); const cit=blockBootstrapCI(rows,fitBt,1,mulberry32(SEED));
    return { n_buckets:rows.length, n_nonzero:nonzero, b_Q:f.beta[1], c_prevret:f.beta[2], a:f.beta[0], r2:f.r2, ci95_b:ci,
      b_Q_ctrl_t:ft.beta[1], r2_ctrl_t:ft.r2, ci95_b_ctrl_t:cit, SigmaQ }; }
  const ll_market = mkt.rows.length? leadlag('mkt') : {skip:'no market series'};
  const ll_oracle = leadlag('oracle');

  // ---- scale ratio ----
  const scale={ SigmaWETH_aave:SigmaQ, market_src:mkt.src, market_base_vol_window:mktVol, ratio_aave_over_market: mktVol>0? SigmaQ/mktVol : null };

  // ---- raw form: WETH liquidated per hour vs price ----
  const hourly=[]; const H0=Math.floor(t0/3600)*3600; for(let h=H0; h<=t1; h+=3600){ const q=S.filter(s=>s.t>=h&&s.t<h+3600).reduce((s,x)=>s+x.q,0); const po=priceAt([...bmeta.entries()].map(([b,m])=>({t:m.ts,close:m.oracle})).sort((a,b)=>a.t-b.t),h+3599); const pm=mkt.rows.length?priceAt(mkt.rows,h+3599):null; if(q>0||true) hourly.push({hourUTC:new Date(h*1000).toISOString().slice(0,16)+'Z', q_weth:Number(q.toFixed(2)), oracle:po?Number(po.toFixed(2)):null, market:pm?Number(pm.toFixed(2)):null}); }

  const out={ model:'claude-opus-4-8[1m]', started, finished:new Date().toISOString(), cluster:'WETH', window_blocks:[LO,HI],
    n_events:ev.length, n_blocks:blocks.length, SigmaWETH:SigmaQ, ts_window:[t0,t1], hours:Number(((t1-t0)/3600).toFixed(2)),
    oracle_price_first_last:[bmeta.get(blocks[0]).oracle, bmeta.get(blocks[blocks.length-1]).oracle],
    corr_Qcum_t:rQt, level_regressions:level, leadlag_market:ll_market, leadlag_oracle:ll_oracle, scale, hourly,
    oracle_leadlag_sampling:'dense: getAssetPrice at 159 bucket-end blocks (not only liquidation blocks)',
    level_oracle_sampling:'event: getAssetPrice at each liquidation block (correct for level regression)',
    seed:SEED, bucket_sec:BUCKET_SEC, boot:BOOT, block_len:BLOCK_LEN };
  const __dir=dirname(fileURLToPath(import.meta.url)); mkdirSync(join(__dir,'out'),{recursive:true});
  const p=join(__dir,'out','m2-results.json'); writeFileSync(p,JSON.stringify(out,null,2));
  const sha=createHash('sha256').update(readFileSync(p)).digest('hex');
  console.log(`\n[M-2] wrote ${p}\n[M-2] sha256=${sha}`);
  console.log('===M2_SUMMARY_BEGIN===\n'+JSON.stringify({corr_Qcum_t:rQt, level_regressions:level, leadlag_market:ll_market, leadlag_oracle:ll_oracle, scale},null,2)+'\n===M2_SUMMARY_END===');
}
main().catch(e=>{ console.error('FATAL',e); process.exit(1); });
