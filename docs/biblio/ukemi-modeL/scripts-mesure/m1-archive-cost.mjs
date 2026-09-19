// M-1 — Coût/faisabilité eth_call ARCHIVE keyless pour reconstruire le book d'un cluster Aave v3 à un bloc archive.
// Worker claude-opus-4-8[1m], 2026-09-19, mission mesure préalable Ukemi. NO commit (R-20). Read-only public RPC.
// Pré-enregistrement: docs/biblio/ukemi-modeL/MESURES-prealables-2026-09-19.md §3.
// Selectors computed in-script via inline keccak-256 (self-tested), NOT hardcoded.
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ---------------- inline keccak-256 (copied verbatim from scripts/census/aave-liquidations.mjs; self-tested) ----------------
const RC=[[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],[0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],[0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],[0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],[0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],[0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO=[0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){ for(let r=0;r<24;r++){ const C=new Array(10); for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; } const D=new Array(10); for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; } for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; } const B=new Array(50); for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; } for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); } s[0]^=RC[r][0]; s[1]^=RC[r][1]; } }
function keccak256(input){ const bytes=typeof input==='string'?Buffer.from(input,'utf8'):Buffer.from(input); const rate=136,s=new Array(50).fill(0); const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate); bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80; for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); } const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex'); }
if(keccak256('')!=='0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED');
if(keccak256('Transfer(address,address,uint256)')!=='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') throw new Error('keccak Transfer self-test FAILED');
const sel=(sig)=>keccak256(sig).slice(0,10);

// ---------------- pinned constants (pre-registration §2) ----------------
const B = 23545087;                        // pre-cascade WETH-cluster block
const B_HEX = '0x'+B.toString(16);
const POOL='0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const ADDRPROV='0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';
const UIPOOL='0x2dAd8162A989cd99D673dE4425Bb2298Db1E1aA2';
const PROBE_USERS=['0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4','0xe0c20053d20c8d6d6de243af2093b222eb3e9c03','0x00dbcc59e6bb596cf2a1cff9326c5f80618875c3'];
const pad=(a)=>a.toLowerCase().replace(/^0x/,'').padStart(64,'0');
const SEL_UAD = sel('getUserAccountData(address)');           // Pool
const SEL_URD = sel('getUserReservesData(address,address)');  // UiPoolDataProvider(provider,user)
const dataUAD=(user)=>SEL_UAD+pad(user);
const dataURD=(user)=>SEL_URD+pad(ADDRPROV)+pad(user);

const ENDPOINTS=[
  ['publicnode','https://ethereum-rpc.publicnode.com'],
  ['publicnode','https://ethereum.publicnode.com'],
  ['llamarpc','https://eth.llamarpc.com'],
  ['drpc','https://eth.drpc.org'],
  ['ankr','https://rpc.ankr.com/eth'],
  ['1rpc','https://1rpc.io/eth'],
  ['tenderly','https://gateway.tenderly.co/public/mainnet'],
  ['tenderly','https://mainnet.gateway.tenderly.co'],
  ['mevblocker','https://rpc.mevblocker.io'],
  ['blastapi','https://eth-mainnet.public.blastapi.io'],
  ['blxrbdn','https://eth.rpc.blxrbdn.com'],
  ['nodies','https://eth-pokt.nodies.app'],
];
const isRateLimit=(m)=>/usage limit|rate.?limit|-32001|\b429\b|too many requests|quota|capacity|throughput/i.test(m);
const isAuthDead=(m)=>/api key|unauthorized|must authenticate|personal token|archive requests require|forbidden/i.test(m);
const isRangeCap=(m)=>/ranges? over \d+|range \d+ exceeds|exceeds limit of|not supported on free plan|up to a \d+ block|block range too large|maximum allowed is|archive/i.test(m);
const isMethodDead=(m)=>/method not (available|found|supported)|unsupported method|-32601/i.test(m);
function classifyErr(m,http){ if(http===429||isRateLimit(m))return'rate'; if(isAuthDead(m))return'auth'; if(isMethodDead(m))return'method'; if(isRangeCap(m))return'archive_gated'; if(http)return'http'+http; return'err'; }

async function rpc(url,method,params,timeoutMs=15000){
  const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),timeoutMs); const t0=Date.now();
  try{
    let res;
    try{ res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:ctl.signal}); }
    catch(e){ return {ok:false,ms:Date.now()-t0,cat:'net',msg:String(e.message).slice(0,120)}; }
    const ms=Date.now()-t0;
    if(!res.ok){ let body=''; try{body=(await res.text()).slice(0,160);}catch{} return {ok:false,ms,http:res.status,cat:classifyErr(body,res.status),msg:`HTTP ${res.status} ${body.slice(0,100)}`}; }
    let json; try{ json=await res.json(); }catch(e){ return {ok:false,ms,cat:'parse',msg:'bad json'}; }
    if(json.error){ const m=JSON.stringify(json.error); return {ok:false,ms,cat:classifyErr(m),msg:m.slice(0,150)}; }
    if(json.result===undefined) return {ok:false,ms,cat:'noresult',msg:'no result field'};
    return {ok:true,ms,result:json.result};
  } finally { clearTimeout(to); }
}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const median=(a)=>{ const s=[...a].sort((x,y)=>x-y); const n=s.length; return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):null; };
const pct=(a,p)=>{ const s=[...a].sort((x,y)=>x-y); if(!s.length)return null; const i=Math.min(s.length-1,Math.floor(p/100*s.length)); return s[i]; };
function decodeUAD(hex){ const d=hex.replace(/^0x/,''); const w=(i)=>BigInt('0x'+d.slice(i*64,(i+1)*64)); return { totalCollateralBase:w(0), totalDebtBase:w(1), availableBorrowsBase:w(2), liqThreshold:w(3), ltv:w(4), healthFactor:w(5) }; }
function urdArrayLen(hex){ try{ const d=hex.replace(/^0x/,''); const off=Number(BigInt('0x'+d.slice(0,64))); const len=Number(BigInt('0x'+d.slice(off*2,off*2+64))); return len; }catch{ return null; } }

async function main(){
  const started=new Date().toISOString();
  console.log(`[M-1] start ${started} B=${B} (${B_HEX})`);
  console.log(`[M-1] SEL getUserAccountData=${SEL_UAD} getUserReservesData=${SEL_URD}`);
  const results=[];

  // ---- Phase A: per endpoint, archive classification via getUserAccountData(user0)@B vs @latest ----
  for(const [prov,url] of ENDPOINTS){
    const rec={provider:prov,url,archive:null,ms_at_B:null,ms_latest:null,notes:[],uad_B_bytes:null};
    const u0=PROBE_USERS[0];
    const atB=await rpc(url,'eth_call',[{to:POOL,data:dataUAD(u0)},B_HEX]);
    await sleep(120);
    const atL=await rpc(url,'eth_call',[{to:POOL,data:dataUAD(u0)},'latest']);
    rec.ms_at_B=atB.ms; rec.ms_latest=atL.ms;
    if(!atB.ok){ rec.archive='refus'; rec.notes.push(`@B ${atB.cat}: ${atB.msg}`); results.push(rec); console.log(`  ${prov.padEnd(11)} REFUS(@B ${atB.cat})`); continue; }
    rec.uad_B_bytes=atB.result;
    if(!atL.ok){ // B ok, latest failed — still archive-capable, note it
      rec.archive='archive_ok'; rec.notes.push(`@latest ${atL.cat}`);
    } else {
      const same = atB.result===atL.result;
      const debtB = decodeUAD(atB.result).totalDebtBase;
      if(same){ rec.archive='latest_silencieux'; rec.notes.push('bytes(B)==bytes(latest) → tag bloc ignoré'); }
      else if(debtB>0n){ rec.archive='archive_ok'; }
      else { rec.archive='archive_ok_zero_debt'; rec.notes.push('bytes differ but totalDebt(B)=0 (user re-check)'); }
    }
    // multi-user robustness: require >=1 user with bytes(B)!=bytes(latest) & debt>0
    let archiveEvidence=0, silentAll=0;
    for(const u of PROBE_USERS){
      const rb=await rpc(url,'eth_call',[{to:POOL,data:dataUAD(u)},B_HEX]); await sleep(80);
      const rl=await rpc(url,'eth_call',[{to:POOL,data:dataUAD(u)},'latest']); await sleep(80);
      if(rb.ok&&rl.ok){ if(rb.result!==rl.result && decodeUAD(rb.result).totalDebtBase>0n) archiveEvidence++; if(rb.result===rl.result) silentAll++; }
    }
    rec.archive_evidence_users=archiveEvidence; rec.silent_users=silentAll;
    if(archiveEvidence===0 && silentAll===PROBE_USERS.length){ rec.archive='latest_silencieux'; }
    if(archiveEvidence>0){ rec.archive='archive_ok'; const dec=decodeUAD(rec.uad_B_bytes); rec.sample_user0={totalCollateralBase_usd:Number(dec.totalCollateralBase)/1e8, totalDebtBase_usd:Number(dec.totalDebtBase)/1e8, healthFactor:Number(dec.healthFactor)/1e18}; }
    results.push(rec);
    console.log(`  ${prov.padEnd(11)} ${rec.archive} (evid=${archiveEvidence}/3 silent=${silentAll}/3, ms@B=${atB.ms})`);
  }

  const archiveOk=results.filter(r=>r.archive==='archive_ok');
  // ---- quorum-2: archive-ok providers must agree on bytes(B) for user0 ----
  const byteSet=new Set(archiveOk.map(r=>r.uad_B_bytes));
  const quorum = { providers:archiveOk.map(r=>r.provider), distinct_byte_values:byteSet.size, agree: byteSet.size<=1 };
  console.log(`[M-1] quorum bytes(B) user0 across ${archiveOk.length} archive-ok: ${quorum.agree?'AGREE':'DISAGREE'} (${byteSet.size} distinct)`);

  // ---- Phase B+C: latency (>=10 probes) + cap (<=100 seq, stop at 2 consec rate) on archive-ok ----
  for(const r of archiveOk){
    const lat=[]; for(let i=0;i<12;i++){ const u=PROBE_USERS[i%3]; const x=await rpc(r.url,'eth_call',[{to:POOL,data:dataUAD(u)},B_HEX]); if(x.ok)lat.push(x.ms); await sleep(60); }
    r.latency_ms={n:lat.length, median:median(lat), p90:pct(lat,90)};
    // cap: burst up to 100 back-to-back, stop at 2 consecutive rate/refus
    let fired=0, ok=0, consecFail=0, firstRate=null; const t0=Date.now();
    for(let i=0;i<100;i++){ const u=PROBE_USERS[i%3]; const x=await rpc(r.url,'eth_call',[{to:POOL,data:dataUAD(u)},B_HEX]); fired++;
      if(x.ok){ ok++; consecFail=0; } else { consecFail++; if((x.cat==='rate'||x.http===429)&&firstRate===null)firstRate=fired; if(consecFail>=2)break; } }
    const elapsedMin=(Date.now()-t0)/60000;
    r.cap={fired, ok, firstRateAt:firstRate, elapsedMin:Number(elapsedMin.toFixed(3)), rate_ok_per_min: elapsedMin>0?Math.round(ok/elapsedMin):null};
    // UiPoolDataProvider: code@B + getUserReservesData(user0)@B
    const code=await rpc(r.url,'eth_getCode',[UIPOOL,B_HEX]); await sleep(80);
    r.uipool_code_at_B = code.ok ? (code.result && code.result!=='0x' ? 'present' : 'ABSENT') : 'err:'+code.cat;
    if(r.uipool_code_at_B==='present'){ const urdLat=[]; let urdBytes=null, urdLen=null;
      for(let i=0;i<6;i++){ const x=await rpc(r.url,'eth_call',[{to:UIPOOL,data:dataURD(PROBE_USERS[0])},B_HEX]); if(x.ok){ urdLat.push(x.ms); urdBytes=(x.result.length-2)/2; urdLen=urdArrayLen(x.result); } await sleep(80); }
      r.uipool_URD={ok:urdLat.length>0, median_ms:median(urdLat), resp_bytes:urdBytes, reserves_in_book:urdLen};
    }
    console.log(`  [cap] ${r.provider.padEnd(11)} lat_med=${r.latency_ms.median}ms p90=${r.latency_ms.p90} | cap ok=${r.cap.ok}/${r.cap.fired} rate@${r.cap.firstRateAt} ~${r.cap.rate_ok_per_min}/min | UI:${r.uipool_code_at_B}${r.uipool_URD?` URD ${r.uipool_URD.median_ms}ms/${r.uipool_URD.resp_bytes}B/${r.uipool_URD.reserves_in_book}res`:''}`);
  }

  // ---- extrapolation ----
  const best = archiveOk.slice().sort((a,b)=>(b.cap?.rate_ok_per_min||0)-(a.cap?.rate_ok_per_min||0))[0]||null;
  const extrapolate=(N)=>{ if(!best)return null; const calls=N+2; const min=best.cap.rate_ok_per_min? (calls/best.cap.rate_ok_per_min):null; return {N, calls, provider:best.provider, rate_per_min:best.cap.rate_ok_per_min, minutes: min!=null?Number(min.toFixed(1)):null}; };
  const summary={ model:'claude-opus-4-8[1m]', started, finished:new Date().toISOString(), block_B:B, selectors:{getUserAccountData:SEL_UAD,getUserReservesData:SEL_URD},
    endpoints_tested:ENDPOINTS.length, archive_ok:archiveOk.map(r=>r.provider), quorum, results,
    extrapolation:{ event_623: extrapolate(623), weth_cluster_213: extrapolate(213), best_provider:best?.provider||null,
      caveat:'N depuis LiquidationCall = comptes DÉJÀ liquidés ; le cluster à-risque réel (détenteurs aWETH via Transfer logs) est plus grand → N sous-estime le coût U-1.' } };
  const __dir=dirname(fileURLToPath(import.meta.url)); const OUT=join(__dir,'out'); mkdirSync(OUT,{recursive:true});
  const p=join(OUT,'m1-results.json'); writeFileSync(p, JSON.stringify(summary,(k,v)=>typeof v==='bigint'?v.toString():v,2));
  const sha=createHash('sha256').update(readFileSync(p)).digest('hex');
  console.log(`\n[M-1] wrote ${p}\n[M-1] sha256=${sha}`);
  console.log('===M1_SUMMARY_BEGIN===\n'+JSON.stringify({archive_ok:summary.archive_ok, quorum:summary.quorum, extrapolation:summary.extrapolation},null,2)+'\n===M1_SUMMARY_END===');
}
main().catch(e=>{ console.error('FATAL',e); process.exit(1); });
