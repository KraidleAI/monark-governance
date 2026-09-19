// M-2b.2 — Test intra-bloc: variation de la source d'oracle Aave WETH au bloc de liquidation vs bloc precedent,
// vs temoins (uniforme + apparie). Worker claude-opus-4-8[1m], 2026-09-19. R-20. Read-only public RPC (quorum-2).
// Pre-enregistrement: MESURES-M2b-sources-2026-09-19.md §3.2. JSON hache SANS horodatage.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { sel, keccak256, rpc, rpcQuorum, pad, hexBlock, mulberry32 } from './lib-m2b.mjs';

const started=new Date().toISOString();
const RAW='F:/Monark/docs/census-2026-09-18/data/A-rawlogs.jsonl';
const LO=23543616, HI=23557920, WETH='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ORACLE='0x54586bE62E3c3580375aE3723C145253060Ca0C2';
const AGG='0x7c7fdfca295a787ded12bb5c1a49a8d2cc20e3f8';       // aggregator behind Aave WETH source 0x5424384b (orientation §2.3)
const SEL_PRICE=sel('getAssetPrice(address)');
const ANSWERUPDATED=keccak256('AnswerUpdated(int256,uint256,uint256)');
const SEED=20251010, NPERM=10000;
const priceData=(b)=>SEL_PRICE+pad(WETH);

// ---- all liquidation blocks (any collateral) in window; WETH liq blocks + first-tx per block ----
const all=readFileSync(RAW,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l)).filter(r=>r.block>=LO&&r.block<=HI);
const allLiqBlocks=new Set(all.map(r=>r.block));
const wethRows=all.filter(r=>r.collateral.toLowerCase()===WETH);
const wethBlocks=[...new Set(wethRows.map(r=>r.block))].sort((a,b)=>a-b);
// first liquidation tx (min logIndex) per WETH liq block, for the order sub-test
const firstTx=new Map();
for(const r of wethRows){ const cur=firstTx.get(r.block); if(!cur||r.logIndex<cur.logIndex) firstTx.set(r.block,{tx:r.tx,logIndex:r.logIndex}); }

// ---- seeded controls ----
const rng=mulberry32(SEED);
// uniform: shuffle candidate blocks [LO,HI] \ allLiqBlocks, take 119
const cand=[]; for(let b=LO;b<=HI;b++) if(!allLiqBlocks.has(b)) cand.push(b);
for(let i=cand.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [cand[i],cand[j]]=[cand[j],cand[i]]; }
const uniformCtrl=cand.slice(0,wethBlocks.length).sort((a,b)=>a-b);
// matched: for each WETH liq block, a seeded non-liq block in [b-50,b+50], unique
const used=new Set(); const matchedCtrl=[];
for(const b of wethBlocks){ const pool=[]; for(let x=b-50;x<=b+50;x++){ if(x<LO||x>HI)continue; if(allLiqBlocks.has(x))continue; if(used.has(x))continue; pool.push(x); }
  if(!pool.length){ matchedCtrl.push(null); continue; } const pick=pool[Math.floor(rng()*pool.length)]; used.add(pick); matchedCtrl.push(pick); }

// ---- price reader (quorum-2), cached; returns {hex,int} ----
const cache=new Map();
async function priceHex(b){ if(cache.has(b))return cache.get(b); const q=await rpcQuorum('eth_call',[{to:ORACLE,data:priceData(b)},hexBlock(b)]); const v={hex:q.value, int:BigInt(q.value)}; cache.set(b,v); return v; }
async function deltas(blocks){ const rows=[]; for(const b of blocks){ if(b==null){ rows.push(null); continue; } const pb=await priceHex(b), pp=await priceHex(b-1);
    const eq = pb.hex===pp.hex; const d = pb.int - pp.int; const sign = eq?0:(d<0n?-1:1);
    const pbF=Number(pb.int)/1e8, ppF=Number(pp.int)/1e8; rows.push({block:b, sign, eq, dUSD:pbF-ppF, dPct:ppF!==0?((pbF/ppF-1)*100):0, pB:pbF}); } return rows; }

console.log('[M-2b.2] WETH liq blocks=',wethBlocks.length,' uniformCtrl=',uniformCtrl.length,' matchedCtrl=',matchedCtrl.filter(Boolean).length);
const liq=await deltas(wethBlocks);
const uni=(await deltas(uniformCtrl));
const mat=(await deltas(matchedCtrl)).filter(Boolean);

function summarize(rows){ const r=rows.filter(Boolean); const down=r.filter(x=>x.sign<0).length, up=r.filter(x=>x.sign>0).length, eq=r.filter(x=>x.sign===0).length;
  const move=down+up; const dUSD=r.filter(x=>!x.eq).map(x=>x.dUSD);
  return { n:r.length, down, equal:eq, up, P_move:move/r.length, P_down_given_move: move>0?down/move:null,
    dUSD_min: dUSD.length?Math.min(...dUSD):null, dUSD_max: dUSD.length?Math.max(...dUSD):null,
    dUSD_median: median(dUSD) }; }
function median(a){ if(!a.length)return null; const s=[...a].sort((x,y)=>x-y); const n=s.length; return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; }
// histogram of Δ ($) bins for liq
function hist(rows){ const edges=[-200,-100,-50,-20,-10,-5,-1,-0.0001,0.0001,1,5,10,20,50,100,200]; const labels=[]; const counts=new Array(edges.length+1).fill(0);
  const r=rows.filter(Boolean); for(const x of r){ let placed=false; for(let i=0;i<edges.length;i++){ if(x.dUSD<edges[i]){ counts[i]++; placed=true; break; } } if(!placed) counts[edges.length]++; }
  const lab=[]; lab.push('(-inf,'+edges[0]+')'); for(let i=0;i<edges.length-1;i++) lab.push('['+edges[i]+','+edges[i+1]+')'); lab.push('['+edges[edges.length-1]+',+inf)');
  const out={}; for(let i=0;i<counts.length;i++) out[lab[i]]=counts[i]; return out; }

const S_liq=summarize(liq), S_uni=summarize(uni), S_mat=summarize(mat);

// ---- binomial exact two-sided on liq (down vs up among non-eq), H0 p=0.5 ----
function binomTwoSided(k,n){ if(n===0)return null; // pmf
  const pmf=(i)=>{ let lp=0; for(let a=1;a<=i;a++) lp+=Math.log(n-a+1)-Math.log(a); lp+=n*Math.log(0.5); return Math.exp(lp); };
  const pk=pmf(k); let p=0; for(let i=0;i<=n;i++){ const pi=pmf(i); if(pi<=pk*(1+1e-9)) p+=pi; } return Math.min(1,p); }
const binom_liq=binomTwoSided(S_liq.down, S_liq.down+S_liq.up);

// ---- permutation tests (seeded) liq vs matched ----
function permTest(aInd,bInd,seed){ // difference in mean(indicator): group A(liq) - group B(matched)
  const A=aInd.length, B=bInd.length, pool=[...aInd,...bInd]; const obs=aInd.reduce((s,v)=>s+v,0)/A - bInd.reduce((s,v)=>s+v,0)/B;
  const r=mulberry32(seed); let geTwo=0, geOne=0; const N=pool.length;
  for(let p=0;p<NPERM;p++){ const idx=[...pool.keys()]; for(let i=N-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
    let sa=0; for(let i=0;i<A;i++) sa+=pool[idx[i]]; let sb=0; for(let i=A;i<N;i++) sb+=pool[idx[i]]; const d=sa/A - sb/B;
    if(Math.abs(d)>=Math.abs(obs)-1e-12) geTwo++; if(d>=obs-1e-12) geOne++; }
  return { obs_diff:obs, p_two_sided:geTwo/NPERM, p_one_sided_liq_gt:geOne/NPERM, nA:A, nB:B }; }
const liqMoveInd=liq.filter(Boolean).map(x=>x.eq?0:1), matMoveInd=mat.map(x=>x.eq?0:1);
const liqDownInd=liq.filter(Boolean).map(x=>x.sign<0?1:0), matDownInd=mat.map(x=>x.sign<0?1:0);
// conditional P(down|move): restrict to non-eq blocks
const liqDownCond=liq.filter(x=>x&&!x.eq).map(x=>x.sign<0?1:0), matDownCond=mat.filter(x=>!x.eq).map(x=>x.sign<0?1:0);
const perm_move = permTest(liqMoveInd, matMoveInd, SEED);
const perm_down = permTest(liqDownInd, matDownInd, SEED+1);
const perm_downcond = (liqDownCond.length&&matDownCond.length)? permTest(liqDownCond, matDownCond, SEED+2) : {skip:'insufficient non-eq in a group'};

// ---- order self-test: for Δ!=0 liq blocks, AnswerUpdated(agg) with current==P@b ; report match rate + order where matched ----
let order_tested=0, order_matched=0, order_update_before_liq=0, order_update_after_liq=0, order_no_log=0, order_multi=0;
for(const x of liq.filter(y=>y&&!y.eq)){ order_tested++;
  const logs=await rpc('eth_getLogs',[{fromBlock:hexBlock(x.block),toBlock:hexBlock(x.block),address:AGG,topics:[ANSWERUPDATED]}]);
  if(!logs.length){ order_no_log++; continue; } if(logs.length>1) order_multi++;
  const m=logs.find(l=>Math.abs(Number(BigInt(l.topics[1]))/1e8 - x.pB)<1e-6);
  if(!m) continue; order_matched++;
  const updIdx=parseInt(m.transactionIndex,16); const ft=firstTx.get(x.block);
  let liqIdx=null; try{ const rec=await rpc('eth_getTransactionReceipt',[ft.tx]); liqIdx=parseInt(rec.transactionIndex,16); }catch{}
  if(liqIdx!=null){ if(updIdx<liqIdx) order_update_before_liq++; else order_update_after_liq++; } }

// ---- decision (pre-registered §3.2) ----
let conclusion;
if(S_liq.down+S_liq.up < 10){ conclusion='indetermine (sous-puissance: <10 blocs de liq avec Delta!=0)'; }
else if(perm_down.p_one_sided_liq_gt<0.05 && binom_liq!=null && binom_liq<0.05 && S_liq.down>S_liq.up){ conclusion='oui (baisse dominante ET P(Delta<0|liq) > temoin apparie, permutation p<0.05)'; }
else { conclusion='non (pas de difference significative de P(Delta<0) vs temoin apparie)'; }

const out={
  measure:'M-2b.2 intra-block oracle update (Aave WETH source, getAssetPrice)',
  model:'claude-opus-4-8[1m]',
  window_blocks:[LO,HI], weth_source:'0x5424384b256154046e9667ddfaaa5e550145215e', aggregator:AGG,
  n_weth_liq_blocks:wethBlocks.length,
  liq:S_liq, control_uniform:S_uni, control_matched:S_mat,
  delta_hist_usd_liq:hist(liq), delta_hist_usd_matched:hist(mat), delta_hist_usd_uniform:hist(uni),
  binomial_liq_down_vs_up:{ down:S_liq.down, up:S_liq.up, p_two_sided:binom_liq, H0:'p=0.5' },
  permutation_P_move_liq_vs_matched:perm_move,
  permutation_P_down_liq_vs_matched:perm_down,
  permutation_P_down_given_move_liq_vs_matched:perm_downcond,
  order_selftest:{ tested_delta_ne0:order_tested, answerupdated_matches_price:order_matched, no_answerupdated_log:order_no_log,
    multi_log_blocks:order_multi, update_before_liq_tx:order_update_before_liq, update_after_liq_tx:order_update_after_liq,
    note:'faible taux d appariement = la source Aave (0x5424384b) retarde son aggregator (~1 round); ordre intra-bloc NON defini pour cette source' },
  conclusion_negative_oracle_update_at_liq_block:conclusion,
  interpretation:'un OUI = motif consequence (baisse d oracle -> liquidation), PAS un canal endogene; le prix lu retarde l aggregator (orientation §2.3)',
  seed:SEED, nperm:NPERM
};
const p='F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b2-intrablock.json';
writeFileSync(p, JSON.stringify(out,null,2));
const sha=createHash('sha256').update(readFileSync(p)).digest('hex');
const finished=new Date().toISOString();
writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b2-intrablock.timing.txt',
  `started=${started}\nfinished=${finished}\njson_sha256=${sha}\nprice_reads_cached=${cache.size}\n`);
console.log('\nLIQ    :',JSON.stringify(S_liq));
console.log('UNIFORM:',JSON.stringify(S_uni));
console.log('MATCHED:',JSON.stringify(S_mat));
console.log('binom(down vs up | liq, H0=0.5) p=',binom_liq);
console.log('perm P(move) liq-matched:',JSON.stringify(perm_move));
console.log('perm P(down) liq-matched:',JSON.stringify(perm_down));
console.log('perm P(down|move) liq-matched:',JSON.stringify(perm_downcond));
console.log('order self-test:',JSON.stringify(out.order_selftest));
console.log('CONCLUSION:',conclusion);
console.log('json_sha256=',sha);
