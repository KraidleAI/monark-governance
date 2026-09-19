// scripts/census/aave-liquidations.mjs
// ============================================================================================
// Census (A) — Aave V3 Core liquidations on USDe/sUSDe(/PT) collateral (F1) and on USDe debt (F2).
// Pre-registration: docs/PLAN-census-next-piece.md — A-H1 (F1 Σ debtToCover ≈ 0 on every UTC window
// since listing, incl. 2025-10-10/11) and A-H2 (Spearman(y_t=F2, v_t=fixture) on common days, |ρ|<0.2).
// Provenance: model claude-opus-4-8[1m], date 2026-09-18, mission "Census (A)" (MONARK), reviewer = orchestrator.
// Discipline: read-only PUBLIC keyless RPC; NO commit (R-20); NO archive-state eth_call by account (this
//   census uses ONLY eth_getLogs + block headers + symbol()/decimals() at `latest` — why (A) is cheap).
// Reuse:
//   - RPC LAYER motif of scripts/usde-full-pull.mjs: endpoint pool, per-endpoint cooldown, getLogs split.
//   - apps/sentinel/src/windows.ts: daysUTC, firstBlockAtOrAfter, midnightOf (ONE window implementation).
//   - apps/sentinel/src/rpc.ts: providerOf (registrable domain; aliases of one operator = ONE provider),
//     TRANSFER_TOPIC (self-verifies the inlined keccak-256 -> reproducible topic provenance).
// ENDPOINTS (MEASURED 2026-09-18): the usde-full-pull keyless pool has DEGRADED for archival eth_getLogs —
//   publicnode -32602 "Archive requests require a personal token"; eth.llamarpc.com "fetch failed"
//   (unreachable here); blastapi "up to a 10 block range"; ankr key-gated; 1rpc -32001 plan. Working keyless
//   ARCHIVAL getLogs: tenderly.co (result-capped, wide ranges), mevblocker.io & drpc.org (~10000-block cap).
//   mevblocker & drpc were ALREADY in the usde-full-pull pool; tenderly is the sole addition. See report.
// Quorum (mission): each 9990-block CHUNK of LiquidationCall logs is fetched from TWO DISTINCT providers
//   (providerOf) and must yield an IDENTICAL sha256 over the sorted log set. A chunk that DISAGREES -> its
//   symmetric-difference logs' UTC days are marked `disagree`. A chunk served by <2 providers is retried,
//   then, if still unserved, EVERY UTC day it intersects is marked `disagree` (no silent exclusion).
// Cost guard: aborts at MAX_CALLS HTTP requests (every request counted, incl. retries and result-splits).
// Day/month: an event's UTC day is the day whose [fromBlock,toBlock] contains its block (= windows.ts). For
//   blocks <= the committed fixture's last block (2025-10-15) that is a FREE lookup in the sha-pinned
//   fixtures/usde-calib-series.json (same windows.ts; also cross-checks each event falls inside its day).
// ============================================================================================

import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import os from 'node:os';
import { daysUTC, firstBlockAtOrAfter, midnightOf } from '../../apps/sentinel/src/windows.ts';
import { providerOf, TRANSFER_TOPIC } from '../../apps/sentinel/src/rpc.ts';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dir, '..', '..');
const DATA = join(REPO, 'docs', 'census-2026-09-18', 'data');
const FIXTURE = join(REPO, 'fixtures', 'usde-calib-series.json');
const CACHE_FILE = process.env.CENSUS_CACHE || join(os.tmpdir(), 'monark-census-A-chunks.jsonl');

// ---------------- inline keccak-256 (Ethereum) — lanes as [lo,hi] 32-bit pairs ----------------
const RC = [[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],
  [0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],
  [0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],
  [0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],
  [0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],
  [0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO = [0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){
  for(let r=0;r<24;r++){
    const C=new Array(10);
    for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; }
    const D=new Array(10);
    for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; }
    for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; }
    const B=new Array(50);
    for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; }
    for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); }
    s[0]^=RC[r][0]; s[1]^=RC[r][1];
  }
}
function keccak256(input){
  const bytes = typeof input==='string' ? Buffer.from(input,'utf8') : Buffer.from(input);
  const rate=136, s=new Array(50).fill(0);
  const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate);
  bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80;
  for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); }
  const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex');
}
const topic = (sig)=>keccak256(sig);
const sel = (sig)=>keccak256(sig).slice(0,10);
if(keccak256('') !== '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED (empty)');
if(topic('Transfer(address,address,uint256)') !== TRANSFER_TOPIC.toLowerCase()) throw new Error('keccak self-test FAILED: Transfer != rpc.ts TRANSFER_TOPIC');
const LIQ_TOPIC   = topic('LiquidationCall(address,address,address,uint256,uint256,address,bool)');
const RINIT_TOPIC = topic('ReserveInitialized(address,address,address,address,address)');

// ---------------- constants ----------------
const POOL  = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const USDe  = '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3';
const sUSDe = '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497';
const lc = (a)=>a.toLowerCase();
const pad = (a)=>'0x'+'0'.repeat(24)+lc(a).replace(/^0x/,'');
const CHUNK = Number(process.env.CENSUS_CHUNK || 9990);   // <= mevblocker/drpc 10000-block cap (measured)
const MAX_CALLS = 5000;
const AAVE_V3_DEPLOY = 16291127;                          // Aave V3 Ethereum Pool proxy genesis (RINIT lower bound)

// ---------------- RPC layer (motif usde-full-pull.mjs) ----------------
const ENDPOINTS = [
  'https://gateway.tenderly.co/public/mainnet', 'https://mainnet.gateway.tenderly.co', // tenderly.co: ONE provider, result-capped, wide ranges
  'https://rpc.mevblocker.io',   // mevblocker.io: 10000-block cap
  'https://eth.drpc.org',        // drpc.org: ~10000-block cap (finicky) — 3rd/fallback provider
];
const PROVIDERS = (()=>{ const m=new Map(); for(const u of ENDPOINTS){ const p=providerOf(u); if(!m.has(p))m.set(p,[]); m.get(p).push(u); } return [...m.entries()].map(([name,urls])=>({name,urls})); })();
const cooldownUntil = new Map();
let callCount = 0, anyRR = 0, provRR = 0;
const now = ()=>Date.now();
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const toHexBlock = (n)=>'0x'+BigInt(n).toString(16);
// TWO distinct getLogs caps (advisor): result-cap -> SPLIT ; range-cap -> BENCH+next provider (never split).
const isRateLimit  = (m)=>/usage limit|rate.?limit|-32001|\b429\b|too many requests|quota|capacity|throughput/i.test(m);
const isResultCap  = (m)=>/query returned more than|more than \d+ results|response size|too many results|result set too large/i.test(m);
const isRangeCap   = (m)=>/ranges? over \d+|range \d+ exceeds|exceeds limit of|not supported on free plan|up to a \d+ block|block range too large|maximum allowed is/i.test(m);
const isAuthDead   = (m)=>/api key|unauthorized|must authenticate|personal token|archive requests require/i.test(m);
const isMethodDead = (m)=>/method not (available|found|supported)|unsupported method|-32601/i.test(m);
const benchMs = (err)=> (err.authDead||err.methodDead) ? 3600_000 : ((err.rateLimit||err.http===429||err.http===503) ? 25_000 : 8_000);
const liveAlias = (prov)=>{ for(const u of prov.urls) if((cooldownUntil.get(u)||0)<=now()) return u; return null; };
function pickAny(){ for(let i=0;i<ENDPOINTS.length;i++){ const u=ENDPOINTS[(anyRR+i)%ENDPOINTS.length]; if((cooldownUntil.get(u)||0)<=now()){ anyRR=(anyRR+i+1)%ENDPOINTS.length; return u; } } return null; }
function orderedProviders(){ const out=[]; for(let i=0;i<PROVIDERS.length;i++) out.push(PROVIDERS[(provRR+i)%PROVIDERS.length]); provRR=(provRR+1)%PROVIDERS.length; return out; }

async function callOn(url, method, params){
  if(callCount>=MAX_CALLS){ const e=new Error(`MAX_CALLS ${MAX_CALLS} reached`); e.budget=true; throw e; }
  callCount++;
  const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(), 18000); // hang guard
  try {
    let res;
    try { res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:callCount,method,params}),signal:ctl.signal}); }
    catch(netErr){ const e=new Error(`net ${netErr.message} @${url}`); e.net=true; throw e; }
    if(!res.ok){ const e=new Error(`HTTP ${res.status} ${url}`); e.http=res.status; throw e; }
    const json = await res.json();
    if(json.error){ const m=JSON.stringify(json.error); const e=new Error(m+' @'+url); e.rpcError=m;
      if(isMethodDead(m))e.methodDead=true; else if(isResultCap(m))e.resultCap=true; else if(isRangeCap(m))e.rangeCap=true; else if(isRateLimit(m))e.rateLimit=true;
      if(isAuthDead(m))e.authDead=true; throw e; }
    if(json.result===undefined) throw new Error(`no result @${url}`);
    return json.result;
  } finally { clearTimeout(to); }
}
async function callAny(method, params, maxTries=24){
  let last;
  for(let t=0;t<maxTries;t++){
    let url=pickAny(); if(!url){ await sleep(1200); url=ENDPOINTS[anyRR++%ENDPOINTS.length]; }
    try { return await callOn(url,method,params); }
    catch(err){ if(err.budget)throw err; last=err; cooldownUntil.set(url,now()+benchMs(err)); await sleep(150); }
  }
  throw last || new Error(`callAny ${method} exhausted`);
}
// getLogs [s,e] from ONE provider; SPLIT only on result-cap; range-cap -> throw (caller uses another provider).
async function providerGetLogs(prov, address, topics, s, e, depth=0){
  let last;
  for(let attempt=0; attempt<8; attempt++){
    const url = liveAlias(prov);
    if(!url) throw last || new Error(`provider ${prov.name}: no live alias`);
    try { return await callOn(url,'eth_getLogs',[{address,fromBlock:toHexBlock(s),toBlock:toHexBlock(e),topics}]); }
    catch(err){
      if(err.budget) throw err;
      last=err;
      if(err.methodDead){ for(const u of prov.urls) cooldownUntil.set(u, now()+3600_000); throw err; }
      if(err.rangeCap){ throw err; }                                   // width exceeds this provider's cap -> caller handles
      if(err.resultCap && e>s && depth<24){                            // too many results -> split range
        const mid=s+Math.floor((e-s)/2);
        const a=await providerGetLogs(prov,address,topics,s,mid,depth+1);
        const b=await providerGetLogs(prov,address,topics,mid+1,e,depth+1);
        return [...a,...b];
      }
      cooldownUntil.set(url, now()+benchMs(err)); await sleep(150);    // transient (rate/http/net) -> bench, retry
    }
  }
  throw last || new Error(`provider ${prov.name}: exhausted [${s},${e}]`);
}
// wide low-result getLogs: the first provider that serves the full range wins (tenderly for wide scans).
async function wideGetLogs(address, topics, from, to){
  let last;
  for(let round=0; round<6; round++){
    for(const prov of orderedProviders()){ if(!liveAlias(prov)) continue; try { return await providerGetLogs(prov,address,topics,from,to); } catch(err){ if(err.budget)throw err; last=err; } }
    await sleep(4000);
  }
  throw last || new Error('wideGetLogs: no provider served');
}
async function getBlockTs(n){ const b=await callAny('eth_getBlockByNumber',[toHexBlock(n),false]); return parseInt(b.timestamp,16); }
async function ethCall(to, data, block='latest'){ return await callAny('eth_call',[{to,data},block]); }

// ---------------- log canonicalisation + quorum ----------------
const canonLog = (l)=>`${parseInt(l.blockNumber,16)}|${parseInt(l.logIndex,16)}|${l.topics.join(',')}|${l.data}`;
function shaLogs(logs){ return createHash('sha256').update(logs.map(canonLog).sort().join('\n')).digest('hex'); }
async function quorumChunk(s, e){
  const got=[]; const used=new Set(); let last;
  for(const prov of orderedProviders()){
    if(got.length>=2) break;
    if(used.has(prov.name) || !liveAlias(prov)) continue;
    try { const logs=await providerGetLogs(prov,POOL,[LIQ_TOPIC],s,e); got.push({prov:prov.name,logs,sha:shaLogs(logs)}); used.add(prov.name); }
    catch(err){ if(err.budget)throw err; last=err; }
  }
  if(got.length<2){
    const single = got[0]?.logs || [];
    return { fromBlock:s, toBlock:e, quorum:false, reason:`only ${got.length} provider(s) served (last: ${(last?.message||'').slice(0,110)})`,
             provA:got[0]?.prov||null, provB:null, cA:single.length, cB:null, shaA:got[0]?.sha||null, shaB:null, agree:false, logs:single, symdiffBlocks:[] };
  }
  const [A,B]=got; const agree=A.sha===B.sha;
  const union=new Map(); for(const l of A.logs) union.set(canonLog(l),l); for(const l of B.logs) union.set(canonLog(l),l);
  let symdiffBlocks=[];
  if(!agree){ const kA=new Set(A.logs.map(canonLog)), kB=new Set(B.logs.map(canonLog)); const diff=[];
    for(const l of A.logs) if(!kB.has(canonLog(l))) diff.push(l); for(const l of B.logs) if(!kA.has(canonLog(l))) diff.push(l);
    symdiffBlocks=[...new Set(diff.map(l=>parseInt(l.blockNumber,16)))]; }
  return { fromBlock:s, toBlock:e, quorum:true, provA:A.prov, provB:B.prov, cA:A.logs.length, cB:B.logs.length,
           shaA:A.sha, shaB:B.sha, agree, logs:[...union.values()], symdiffBlocks };
}

// ---------------- decode ----------------
function decodeLiq(l){
  const d=l.data.replace(/^0x/,''); const w=(i)=>d.slice(i*64,(i+1)*64);
  return { block: parseInt(l.blockNumber,16), logIndex: parseInt(l.logIndex,16), tx: l.transactionHash,
    collateral: '0x'+l.topics[1].slice(-40), debt: '0x'+l.topics[2].slice(-40), user: '0x'+l.topics[3].slice(-40),
    debtToCover: BigInt('0x'+w(0)), liquidatedCollateralAmount: BigInt('0x'+w(1)), liquidator: '0x'+w(2).slice(24), receiveAToken: BigInt('0x'+w(3))!==0n };
}

// ---------------- Spearman (midrank + Pearson-on-ranks; correct under ties) ----------------
function midranks(xs){ const idx=xs.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]); const r=new Array(xs.length); let i=0;
  while(i<idx.length){ let j=i; while(j+1<idx.length && idx[j+1][0]===idx[i][0]) j++; const rank=(i+j)/2+1; for(let k=i;k<=j;k++) r[idx[k][1]]=rank; i=j+1; } return r; }
function pearson(a,b){ const n=a.length; if(n<2) return NaN; const ma=a.reduce((s,x)=>s+x,0)/n, mb=b.reduce((s,x)=>s+x,0)/n;
  let num=0,da=0,db=0; for(let i=0;i<n;i++){ const u=a[i]-ma, v=b[i]-mb; num+=u*v; da+=u*u; db+=v*v; } return (da===0||db===0)?NaN:num/Math.sqrt(da*db); }
function spearman(a,b){ return pearson(midranks(a),midranks(b)); }
(()=>{ const s=spearman([1,2,2,3,4],[10,20,20,30,40]); if(Math.abs(s-1)>1e-9) throw new Error('spearman self-test FAILED (+1): '+s);
       const s2=spearman([1,2,3,4],[4,3,2,1]); if(Math.abs(s2+1)>1e-9) throw new Error('spearman self-test FAILED (-1): '+s2); })();

// ---------------- fixture day/month map (free lookup for blocks <= 2025-10-15) ----------------
const fixture = JSON.parse(readFileSync(FIXTURE,'utf8'));
const fixtureSha = createHash('sha256').update(readFileSync(FIXTURE)).digest('hex');
const FIXWINS = fixture.windows.filter(w=>typeof w.fromBlock==='number' && typeof w.toBlock==='number').sort((a,b)=>a.fromBlock-b.fromBlock);
const FIX_MIN = FIXWINS[0].fromBlock, FIX_MAX = FIXWINS[FIXWINS.length-1].toBlock, FIX_LASTDAY = FIXWINS[FIXWINS.length-1].day;
function fixtureDay(block){ if(block<FIX_MIN || block>FIX_MAX) return null;
  let lo=0,hi=FIXWINS.length-1; while(lo<=hi){ const m=(lo+hi)>>1; const w=FIXWINS[m]; if(block<w.fromBlock) hi=m-1; else if(block>w.toBlock) lo=m+1; else return w.day; } return null; }
const nextDayISO = (d)=> new Date(new Date(d+'T00:00:00Z').getTime()+86400000).toISOString().slice(0,10);

// ---------------- main ----------------
async function main(){
  const startedAt = new Date().toISOString();
  mkdirSync(DATA,{recursive:true});
  console.log(`[A] start ${startedAt} chunk=${CHUNK} cache=${CACHE_FILE}`);
  console.log(`[A] providers=${PROVIDERS.map(p=>p.name).join(', ')}`);
  console.log(`[A] topics LIQ=${LIQ_TOPIC} RINIT=${RINIT_TOPIC}`);
  console.log(`[A] fixture sha256=${fixtureSha} cover [${FIX_MIN},${FIX_MAX}] lastDay=${FIX_LASTDAY}`);

  const fin = await callAny('eth_getBlockByNumber',['finalized',false]);
  const finBlk = parseInt(fin.number,16), finTs = parseInt(fin.timestamp,16);
  const todayUTC = new Date(finTs*1000).toISOString().slice(0,10);
  console.log(`[A] finalized=${finBlk} ts=${finTs} (${new Date(finTs*1000).toISOString()})`);

  // ---- FACTS [lu]: reserves, addresses provider, configurator ----
  const rlRaw = await ethCall(POOL, sel('getReservesList()'));
  const body = rlRaw.replace(/^0x/,''); const nRes = parseInt(body.slice(64,128),16);
  const reserves=[]; for(let i=0;i<nRes;i++) reserves.push('0x'+body.slice(128+i*64+24,128+(i+1)*64));
  const addrProvider='0x'+(await ethCall(POOL, sel('ADDRESSES_PROVIDER()'))).slice(-40);
  const configurator='0x'+(await ethCall(addrProvider, sel('getPoolConfigurator()'))).slice(-40);
  console.log(`[A] reserves=${nRes} addressesProvider=${addrProvider} configurator=${configurator}`);
  if(!reserves.map(lc).includes(lc(USDe)) || !reserves.map(lc).includes(lc(sUSDe))) throw new Error('USDe/sUSDe not in getReservesList — abort');

  const decodeStr=(hex)=>{ hex=hex.replace(/^0x/,''); if(hex.length<=64) return Buffer.from(hex,'hex').toString('utf8').replace(/\0+$/,''); const len=parseInt(hex.slice(64,128),16); return Buffer.from(hex.slice(128,128+len*2),'hex').toString('utf8'); };
  const meta = new Map();
  async function loadMeta(a){ let symbol='?',decimals=null; try{ symbol=decodeStr(await ethCall(a, sel('symbol()'))); }catch{} try{ decimals=parseInt(await ethCall(a, sel('decimals()')),16); }catch{} meta.set(lc(a),{symbol,decimals}); }
  { const q=[...reserves]; let done=0; const worker=async()=>{ while(q.length){ await loadMeta(q.shift()); if(++done%25===0) console.log(`  meta ${done}/${reserves.length} calls=${callCount}`); } }; await Promise.all(Array.from({length:4},()=>worker())); }
  console.log(`[A] meta loaded ${meta.size} | calls=${callCount}`);

  // ---- RINIT scan (tenderly, wide) + assets==reserves self-consistency ----
  console.log(`[A] RINIT scan [${AAVE_V3_DEPLOY},${finBlk}] ...`);
  const rinitLogs = await wideGetLogs(configurator, [RINIT_TOPIC], AAVE_V3_DEPLOY, finBlk);
  const initAssets = new Map();
  for(const l of rinitLogs){ const a=lc('0x'+l.topics[1].slice(-40)); const b=parseInt(l.blockNumber,16); if(!initAssets.has(a)||b<initAssets.get(a).block) initAssets.set(a,{block:b,tx:l.transactionHash}); }
  const resSet=new Set(reserves.map(lc)), initSet=new Set(initAssets.keys());
  const initNotRes=[...initSet].filter(a=>!resSet.has(a)), resNotInit=[...resSet].filter(a=>!initSet.has(a));
  console.log(`[A] RINIT events=${rinitLogs.length} distinctAssets=${initSet.size} | init∉reserves=${initNotRes.length} reserves∉init=${resNotInit.length}`);
  for(const a of initNotRes){ if(!meta.has(a)) await loadMeta(a); } // delisted assets: fetch their symbols too
  const listUSDe = initAssets.get(lc(USDe)), listSUSDe = initAssets.get(lc(sUSDe));
  if(!listUSDe||!listSUSDe) throw new Error('RINIT not found for USDe/sUSDe — abort');

  // ---- verify listing blocks + mevblocker ARCHIVAL DEPTH at 20.0M (advisor Q2) ----
  const mev = PROVIDERS.find(p=>p.name==='mevblocker.io');
  async function verifyListing(nm, tok, blk){ try{ const w=await providerGetLogs(mev, configurator, [RINIT_TOPIC, pad(tok)], blk-4990, blk+4990); // 9981 blocks <= mevblocker 10000 cap (was 10001, off-by-one)
      const b=w.length?parseInt(w[0].blockNumber,16):null; console.log(`  verify ${nm}: mevblocker block=${b} (tenderly=${blk}) ${b===blk?'MATCH':'MISMATCH'}`); return b===blk; }
    catch(e){ console.log(`  verify ${nm}: mevblocker FAILED (${String(e.message).slice(0,80)})`); return false; } }
  const vU = await verifyListing('USDe', USDe, listUSDe.block);
  const vS = await verifyListing('sUSDe', sUSDe, listSUSDe.block);
  const usdeListDay = fixtureDay(listUSDe.block) || new Date((await getBlockTs(listUSDe.block))*1000).toISOString().slice(0,10);
  const susdeListDay = fixtureDay(listSUSDe.block) || new Date((await getBlockTs(listSUSDe.block))*1000).toISOString().slice(0,10);
  const startBlock = Math.min(listUSDe.block, listSUSDe.block);
  console.log(`[A] listing USDe=${listUSDe.block}(${usdeListDay}) tx=${listUSDe.tx}`);
  console.log(`[A] listing sUSDe=${listSUSDe.block}(${susdeListDay}) tx=${listSUSDe.tx}`);
  console.log(`[A] pull [${startBlock},${finBlk}] span=${finBlk-startBlock} (~${((finBlk-startBlock)/7150).toFixed(0)}d) | calls=${callCount}`);

  // ---- collateral classification: F1 (pre-registered verdict basis) vs F1ext (descriptive) ----
  const isF1sym    = (s)=> s==='USDe' || s==='sUSDe' || /^PT-sUSDE-/i.test(s) || /^PT-USDe-/i.test(s);
  const isF1extSym = (s)=> s==='eUSDe' || /^PT-eUSDE-/i.test(s) || /^PT-srUSDe-/i.test(s);
  const F1=new Map(), F1ext=new Map();
  for(const [a,m] of meta){ if(isF1sym(m.symbol)) F1.set(a,m.symbol); else if(isF1extSym(m.symbol)) F1ext.set(a,m.symbol); }
  console.log(`[A] F1 (${F1.size}): ${[...F1.values()].join(', ')}`);
  console.log(`[A] F1ext (${F1ext.size}): ${[...F1ext.values()].join(', ')}`);

  // ---- PULL: quorum per 9990-block chunk; cache ONLY quorum:true; retry quorum:false ----
  const cachedTrue = new Map(); // fromBlock -> rec
  if(existsSync(CACHE_FILE)) for(const line of readFileSync(CACHE_FILE,'utf8').split('\n')){ if(!line.trim())continue; try{ const r=JSON.parse(line); if(r.quorum) cachedTrue.set(r.fromBlock,r); }catch{} }
  const chunkStarts=[]; for(let s=startBlock; s<=finBlk; s+=CHUNK) chunkStarts.push(s);
  console.log(`[A] pull: ${chunkStarts.length} chunks (${cachedTrue.size} cached) | calls=${callCount}`);
  const unavailable = new Map(); // fromBlock -> rec (quorum:false)
  let aborted=false, abortReason='';
  async function pass(list, label){
    let i=0;
    for(const s of list){
      if(cachedTrue.has(s)) continue;
      const e=Math.min(s+CHUNK-1, finBlk);
      let rec;
      try { rec = await quorumChunk(s,e); }
      catch(err){ if(err.budget){ aborted=true; abortReason=err.message; return; } rec={fromBlock:s,toBlock:e,quorum:false,reason:'exception: '+String(err.message).slice(0,140),provA:null,provB:null,cA:null,cB:null,shaA:null,shaB:null,agree:false,logs:[],symdiffBlocks:[]}; }
      if(rec.quorum){ appendFileSync(CACHE_FILE, JSON.stringify(rec)+'\n'); cachedTrue.set(s,rec); unavailable.delete(s);
        if(!rec.agree) console.log(`  [${label}] chunk[${s},${e}] DISAGREE cA=${rec.cA} cB=${rec.cB} symdiffBlocks=${rec.symdiffBlocks.length} | calls=${callCount}`); }
      else { unavailable.set(s,rec); console.log(`  [${label}] chunk[${s},${e}] quorum_unavailable: ${rec.reason} | calls=${callCount}`); }
      if((++i%25)===0) console.log(`  [${label}] ${i}/${list.length} done | cached=${cachedTrue.size} unavail=${unavailable.size} | calls=${callCount}`);
      await sleep(100);
    }
  }
  await pass(chunkStarts, 'P1');
  if(!aborted && unavailable.size){ console.log(`[A] second pass on ${unavailable.size} quorum_unavailable chunks`); await pass([...unavailable.keys()], 'P2'); }
  if(aborted){ console.log(`\n[A] ABORTED at MAX_CALLS: ${abortReason}. cache persisted; re-run to resume. calls=${callCount}`); }

  // ---- rebuild ----
  const chunks = [...cachedTrue.values()].concat([...unavailable.values()]).sort((a,b)=>a.fromBlock-b.fromBlock);
  const cachedStarts = new Set(cachedTrue.keys());
  const missing = chunkStarts.filter(s=>!cachedStarts.has(s) && !unavailable.has(s));
  const unionLogs = new Map(); for(const c of cachedTrue.values()) for(const l of c.logs) unionLogs.set(canonLog(l), l);
  const allLiq = [...unionLogs.values()].map(decodeLiq).sort((a,b)=> a.block-b.block || a.logIndex-b.logIndex);
  console.log(`[A] cached=${cachedTrue.size} unavailable=${unavailable.size} missing=${missing.length} totalLiquidationCall=${allLiq.length}`);

  // ---- day-of-block: fixture (free) else per-block ts quorum-2 ----
  const tsCache=new Map();
  async function tsQuorum(b){ if(tsCache.has(b)) return tsCache.get(b);
    const vals=new Map(); for(const prov of orderedProviders()){ if(vals.size>=2) break; const url=liveAlias(prov); if(!url) continue;
      try{ const blk=await callOn(url,'eth_getBlockByNumber',[toHexBlock(b),false]); vals.set(prov.name, parseInt(blk.timestamp,16)); }catch(e){ if(e.budget)throw e; } }
    const arr=[...vals.values()]; const out={ts:arr[0]??null, agree: arr.length>=2 && arr.every(v=>v===arr[0]), providers:arr.length}; tsCache.set(b,out); return out; }
  async function dayOfBlock(b){ const fd=fixtureDay(b); if(fd) return {day:fd, source:'fixture', agree:true}; const q=await tsQuorum(b); return {day: q.ts!=null?new Date(q.ts*1000).toISOString().slice(0,10):'UNKNOWN', source:'ts', agree:q.agree}; }
  async function daysIntersecting(s,e){ const out=new Set();
    for(const w of FIXWINS){ if(w.fromBlock<=e && w.toBlock>=s) out.add(w.day); }
    if(e>FIX_MAX){ const s2=Math.max(s,FIX_MAX+1); const d1=(await dayOfBlock(s2)).day, d2=(await dayOfBlock(e)).day; for(const t of daysUTC(d1, nextDayISO(d2))) out.add(t[2]); }
    return [...out]; }

  // ---- month boundaries: fixture-free for months whose 1st day <= FIX_LASTDAY; RPC beyond ----
  function firstDaysOfMonths(fromDay, toDay){ const out=[]; let d=new Date(fromDay.slice(0,7)+'-01T00:00:00Z'); const end=new Date(toDay.slice(0,7)+'-01T00:00:00Z');
    while(d<=end){ out.push(d.toISOString().slice(0,10)); d=new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1)); } return out; }
  const monthBoundary=[]; let prevB=startBlock;
  for(const fd of firstDaysOfMonths(fixtureDay(startBlock)||usdeListDay, todayUTC)){
    const month=fd.slice(0,7); const fw=FIXWINS.find(w=>w.day===fd); let block;
    if(fw) block=fw.fromBlock;
    else { const target=midnightOf(fd); let lo=prevB, hi=Math.min(finBlk, prevB+40*7200); while(hi<finBlk && (await getBlockTs(hi))<target){ lo=hi; hi=Math.min(finBlk, hi+40*7200); } block=await firstBlockAtOrAfter(target, lo, hi, getBlockTs); }
    monthBoundary.push({month,block}); prevB=block;
  }
  monthBoundary.sort((a,b)=>a.block-b.block);
  const monthOfBlock=(b)=>{ let m=monthBoundary[0].month; for(const mb of monthBoundary){ if(b>=mb.block) m=mb.month; else break; } return m; };
  console.log(`[A] month boundaries=${monthBoundary.length} | calls=${callCount}`);

  // ---- classify + date F1/F1ext/F2 events ----
  const usdeLc=lc(USDe);
  const events=[];
  for(const ev of allLiq){ const cLc=lc(ev.collateral); const inF1=F1.has(cLc), inF1ext=F1ext.has(cLc), inF2=lc(ev.debt)===usdeLc; if(!inF1&&!inF1ext&&!inF2) continue;
    const d=await dayOfBlock(ev.block);
    events.push({ block:ev.block, logIndex:ev.logIndex, tx:ev.tx, collateral:ev.collateral, debt:ev.debt, user:ev.user,
      debtToCover:ev.debtToCover.toString(), liquidatedCollateralAmount:ev.liquidatedCollateralAmount.toString(), liquidator:ev.liquidator, receiveAToken:ev.receiveAToken,
      day:d.day, month:monthOfBlock(ev.block), day_source:d.source, day_agree:d.agree,
      collateralSymbol: meta.get(cLc)?.symbol||'?', debtSymbol: meta.get(lc(ev.debt))?.symbol||'?', debtDecimals: meta.get(lc(ev.debt))?.decimals??null,
      F1:inF1, F1ext:inF1ext, F2:inF2 }); }
  console.log(`[A] events F1=${events.filter(e=>e.F1).length} F1ext=${events.filter(e=>e.F1ext).length} F2=${events.filter(e=>e.F2).length}`);

  // ---- disagree DAYS: symdiff-log days + quorum_unavailable intersecting days (no silent exclusion) ----
  const disagreeDays=new Set();
  for(const c of cachedTrue.values()){ if(!c.agree){ for(const b of (c.symdiffBlocks||[])){ disagreeDays.add((await dayOfBlock(b)).day); } } }
  const unavailableRanges=[];
  for(const c of unavailable.values()){ unavailableRanges.push([c.fromBlock,c.toBlock]); for(const d of await daysIntersecting(c.fromBlock,c.toBlock)) disagreeDays.add(d); }
  console.log(`[A] disagreeDays=${disagreeDays.size} unavailableRanges=${unavailableRanges.length}`);

  // ---- aggregates ----
  const STABLE = new Set(['USDe','USDC','USDT','DAI','USDS','GHO','PYUSD','FRAX','RLUSD','USDtb','crvUSD','LUSD','EURC','USDG','mUSD','eUSDe','sUSDe','USDe.','sDAI']);
  const scaleUnits=(raw,dec)=>{ dec=dec??18; const d=BigInt(dec); return Number(raw*1000000n/(10n**d))/1e6; };
  function aggregate(period, flag){
    const map=new Map();
    for(const e of events){ if(!e[flag]) continue; const k=period==='day'?e.day:e.month; if(!map.has(k)) map.set(k,{key:k,events:0,users:new Set(),byDebt:new Map()});
      const g=map.get(k); g.events++; g.users.add(lc(e.user)); const dk=e.debtSymbol+'@'+lc(e.debt); g.byDebt.set(dk,(g.byDebt.get(dk)||0n)+BigInt(e.debtToCover)); }
    return [...map.values()].map(g=>({ period, filter:flag, key:g.key, events:g.events, users:g.users.size,
      sumByDebt:[...g.byDebt.entries()].map(([dk,v])=>{ const [sym,addr]=dk.split('@'); const dec=meta.get(addr)?.decimals??18; return {debtSymbol:sym,debt:addr,decimals:dec,sumRaw:v.toString(),sum:scaleUnits(v,dec)}; }),
      disagree: period==='day' ? disagreeDays.has(g.key) : [...disagreeDays].some(d=>d.startsWith(g.key)),
      total_liquidations: period==='month' ? 0 : undefined })).sort((a,b)=>a.key<b.key?-1:1);
  }
  const totalByMonth=new Map(); for(const ev of allLiq){ const m=monthOfBlock(ev.block); totalByMonth.set(m,(totalByMonth.get(m)||0)+1); }
  const windows=[];
  for(const flt of ['F1','F1ext','F2']) for(const period of ['day','month']){ for(const r of aggregate(period,flt)){ if(period==='month') r.total_liquidations=totalByMonth.get(r.key)||0; windows.push(r); } }

  // ---- A-H1: any UTC day with F1 Σ debtToCover >= 1e6 USD-eq (stable debt only) ----
  const f1day = windows.filter(w=>w.period==='day'&&w.filter==='F1');
  const stableUsd=(row)=> row.sumByDebt.reduce((s,d)=> s + (STABLE.has(d.debtSymbol)?d.sum:0), 0);
  const f1Breaches = f1day.filter(r=>stableUsd(r)>=1e6);
  const f1NonStableDebt = events.filter(e=>e.F1 && !STABLE.has(e.debtSymbol));
  const A_H1 = { f1_events_total: events.filter(e=>e.F1).length, breach_windows: f1Breaches.map(r=>({day:r.key,usd:stableUsd(r),byDebt:r.sumByDebt})),
    verdict: f1Breaches.length===0 ? 'HELD (no F1 UTC day with Σ debtToCover ≥ 1e6 USD-eq)' : 'FALSIFIED', nonStableDebtEvents: f1NonStableDebt.length,
    f1_events_detail: events.filter(e=>e.F1).map(e=>({day:e.day,tx:e.tx,collateral:e.collateralSymbol,debt:e.debtSymbol,debtToCover:e.debtToCover})) };

  // ---- A-H2: Spearman(y_t=F2 Σ debtToCover/day, v_t=fixture v_t_per_hr) on common days [usdeListDay..FIX_LASTDAY] ----
  const f2ByDay=new Map(), f2CntByDay=new Map();
  for(const e of events){ if(e.F2 && e.day>=usdeListDay && e.day<=FIX_LASTDAY){ f2ByDay.set(e.day,(f2ByDay.get(e.day)||0n)+BigInt(e.debtToCover)); f2CntByDay.set(e.day,(f2CntByDay.get(e.day)||0)+1); } }
  const xs=[], ysSum=[], ysCnt=[]; let droppedNull=0, nZero=0;
  for(const w of FIXWINS){ if(w.day<usdeListDay||w.day>FIX_LASTDAY) continue; if(w.v_t_per_hr==null){ droppedNull++; continue; }
    xs.push(w.v_t_per_hr); const yv=Number(f2ByDay.get(w.day)||0n)/1e18; ysSum.push(yv); if(yv===0)nZero++; ysCnt.push(f2CntByDay.get(w.day)||0); }
  const rhoSum=spearman(xs,ysSum), rhoCnt=spearman(xs,ysCnt);
  const A_H2 = { common_days:xs.length, dropped_null_vt:droppedNull, zero_y_days:nZero, rho_sum_debtToCover:rhoSum, rho_event_count:rhoCnt,
    verdict: Number.isFinite(rhoSum) ? (Math.abs(rhoSum)<0.2?'HELD (|ρ|<0.2)':'FALSIFIED (|ρ|≥0.2)') : 'DEGENERATE (ρ undefined — zero variance in y_t; report as no evidence of association)' };

  // ---- write deliverables ----
  const w = (name, lines)=>{ const p=join(DATA,name); writeFileSync(p, lines.map(x=>JSON.stringify(x)).join('\n')+(lines.length?'\n':'')); return { name, sha256: createHash('sha256').update(readFileSync(p)).digest('hex'), lines: lines.length }; };
  const rawlogsOut = allLiq.map(e=>({ block:e.block, logIndex:e.logIndex, tx:e.tx, collateral:e.collateral, debt:e.debt, user:e.user, debtToCover:e.debtToCover.toString(), liquidatedCollateralAmount:e.liquidatedCollateralAmount.toString(), liquidator:e.liquidator, receiveAToken:e.receiveAToken }));
  const chunksOut = chunks.map(c=>({ fromBlock:c.fromBlock, toBlock:c.toBlock, quorum:c.quorum, provA:c.provA, provB:c.provB, cA:c.cA, cB:c.cB, shaA:c.shaA, shaB:c.shaB, agree:c.agree, symdiffBlocks:c.symdiffBlocks||[], reason:c.reason||null }));
  const shaRaw=w('A-rawlogs.jsonl',rawlogsOut), shaChunks=w('A-chunks.jsonl',chunksOut), shaEvents=w('A-events.jsonl',events), shaWindows=w('A-windows.jsonl',windows);

  const summary = { startedAt, finishedAt:new Date().toISOString(), model:'claude-opus-4-8[1m]', todayUTC, finalizedBlock:finBlk, calls:callCount, aborted, abortReason,
    providers:PROVIDERS.map(p=>p.name), chunkSize:CHUNK, chunksTotal:chunkStarts.length, cachedChunks:cachedTrue.size, quorumUnavailable:unavailable.size, unavailableRanges,
    chunkDisagreements:[...cachedTrue.values()].filter(c=>!c.agree).length, disagreeDays:[...disagreeDays].sort(), missingChunks:missing.length,
    topics:{LiquidationCall:LIQ_TOPIC,ReserveInitialized:RINIT_TOPIC}, addressesProvider:addrProvider, configurator, reservesCount:nRes,
    rinit:{events:rinitLogs.length, distinctAssets:initSet.size, init_not_in_reserves:initNotRes, reserves_not_in_init:resNotInit},
    listing:{USDe:{block:listUSDe.block,day:usdeListDay,tx:listUSDe.tx,mevblocker_verified:vU}, sUSDe:{block:listSUSDe.block,day:susdeListDay,tx:listSUSDe.tx,mevblocker_verified:vS}}, startBlock,
    F1:[...F1.entries()].map(([a,s])=>({addr:a,symbol:s})), F1ext:[...F1ext.entries()].map(([a,s])=>({addr:a,symbol:s})),
    totals:{ totalLiquidationCall:allLiq.length, F1events:events.filter(e=>e.F1).length, F1extEvents:events.filter(e=>e.F1ext).length, F2events:events.filter(e=>e.F2).length,
      F2distinctBlocks:[...new Set(events.filter(e=>e.F2).map(e=>e.block))].length, F2eventsAfterFixture:events.filter(e=>e.F2&&e.block>FIX_MAX).length, tsFetchedBlocks:tsCache.size },
    A_H1, A_H2, fixtureSha, files:[shaRaw,shaChunks,shaEvents,shaWindows], cacheFile:CACHE_FILE };
  console.log('\n===SUMMARY_JSON_BEGIN===\n'+JSON.stringify(summary,null,2)+'\n===SUMMARY_JSON_END===');
}
main().catch(e=>{ console.error('FATAL', e); process.exit(1); });
