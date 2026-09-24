// lib-m2b.mjs — shared infra for M-2b (event WETH 2025-10-10/11 + oracle-source bisection).
// Worker claude-opus-4-8[1m], 2026-09-19. R-20 (no commit). Read-only public RPC.
// Reuses verbatim: keccak-256 (self-tested, same impl as census/m1/m2), provider set drpc/mevblocker/blastapi/nodies,
// mulberry32 PRNG, OLS(normal-eq), moving-block bootstrap. Selectors computed via keccak, never hardcoded.

// ---------- keccak-256 (self-tested) ----------
const RC=[[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],[0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],[0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],[0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],[0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],[0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO=[0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){ for(let r=0;r<24;r++){ const C=new Array(10); for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; } const D=new Array(10); for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; } for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; } const B=new Array(50); for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; } for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); } s[0]^=RC[r][0]; s[1]^=RC[r][1]; } }
export function keccak256(input){ const bytes=typeof input==='string'?Buffer.from(input,'utf8'):Buffer.from(input); const rate=136,s=new Array(50).fill(0); const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate); bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80; for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); } const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex'); }
if(keccak256('')!=='0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED');
if(keccak256('Transfer(address,address,uint256)')!=='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') throw new Error('keccak Transfer self-test FAILED');
export const sel=(sig)=>keccak256(sig).slice(0,10);

// ---------- RPC (rotation over the four archive-OK keyless providers; quorum-2 helper) ----------
export const RPCS=['https://eth.drpc.org','https://rpc.mevblocker.io','https://eth-mainnet.public.blastapi.io','https://eth-pokt.nodies.app'];
export const pad=(a)=>a.toLowerCase().replace(/^0x/,'').padStart(64,'0');
export const hexBlock=(n)=>'0x'+n.toString(16);
export const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
let rr=0;
export async function rpc(method,params,tries=8){ let last; for(let i=0;i<tries;i++){ const url=RPCS[(rr++)%RPCS.length]; try{ const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),20000); const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:ctl.signal}); clearTimeout(to); if(!res.ok){last='HTTP '+res.status+' @'+url; await sleep(250); continue;} const j=await res.json(); if(j.error){last=JSON.stringify(j.error)+' @'+url; await sleep(250); continue;} return j.result; }catch(e){ last=e.message+' @'+url; await sleep(250);} } throw new Error('rpc '+method+' failed: '+last); }
// quorum-2: query providers (rotating start) until TWO return byte-identical results; economical (stops at 2 agree).
// Deterministic in OUTPUT (the agreed bytes are the on-chain truth); returns {value, quorum, providers, distinct}.
let qstart=0;
export async function rpcQuorum(method,params){ const n=RPCS.length; const order=[]; for(let k=0;k<n;k++) order.push((qstart+k)%n); qstart=(qstart+1)%n;
  let vals=new Map();
  for(const gi of order){ const url=RPCS[gi]; try{ const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),20000); const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:ctl.signal}); clearTimeout(to); if(!res.ok)continue; const j=await res.json(); if(j.error)continue; const v=JSON.stringify(j.result); vals.set(gi,v);
      const counts=new Map(); for(const vv of vals.values()) counts.set(vv,(counts.get(vv)||0)+1);
      for(const [vv,c] of counts){ if(c>=2){ const provs=[...vals.entries()].filter(([,x])=>x===vv).map(([i])=>i); return { value:JSON.parse(vv), quorum:c, providers:provs, distinct:counts.size }; } }
    }catch{ await sleep(150); } }
  throw new Error('quorum-2 FAILED for '+method+' '+JSON.stringify(params)+' (responders='+vals.size+')'); }

// ---------- ABI decode helpers ----------
export const decUint=(hex)=>BigInt(hex);
export function decodeString(hex){ // dynamic string return: [offset][len][bytes...]
  const d=hex.replace(/^0x/,''); if(d.length<128) return '';
  const off=Number(BigInt('0x'+d.slice(0,64)))*2; const len=Number(BigInt('0x'+d.slice(off,off+64)))*2;
  const body=d.slice(off+64, off+64+len); return Buffer.from(body,'hex').toString('utf8'); }
export function decodeAddress(hex){ const d=hex.replace(/^0x/,''); return '0x'+d.slice(24,64); } // last 20 bytes of the 32-byte word

// ---------- mulberry32 PRNG (seeded; NEVER Math.random) ----------
export function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// ---------- OLS via normal equations; returns beta + R^2 ----------
export function ols(Xrows,y){ const n=Xrows.length,k=Xrows[0].length; const XtX=Array.from({length:k},()=>new Array(k).fill(0)); const Xty=new Array(k).fill(0);
  for(let i=0;i<n;i++){ for(let a=0;a<k;a++){ Xty[a]+=Xrows[i][a]*y[i]; for(let b=0;b<k;b++) XtX[a][b]+=Xrows[i][a]*Xrows[i][b]; } }
  const M=XtX.map((row,i)=>[...row,Xty[i]]);
  for(let c=0;c<k;c++){ let piv=c; for(let r=c+1;r<k;r++) if(Math.abs(M[r][c])>Math.abs(M[piv][c]))piv=r; [M[c],M[piv]]=[M[piv],M[c]]; const d=M[c][c]||1e-12; for(let j=c;j<=k;j++)M[c][j]/=d; for(let r=0;r<k;r++){ if(r===c)continue; const f=M[r][c]; for(let j=c;j<=k;j++)M[r][j]-=f*M[c][j]; } }
  const beta=M.map(row=>row[k]);
  const ybar=y.reduce((s,v)=>s+v,0)/n; let sstot=0,ssres=0; for(let i=0;i<n;i++){ let yh=0; for(let a=0;a<k;a++)yh+=beta[a]*Xrows[i][a]; ssres+=(y[i]-yh)**2; sstot+=(y[i]-ybar)**2; }
  return { beta, r2: sstot>0?1-ssres/sstot:NaN, n }; }
// self-test: y=2+3x exact
{ const X=[[1,0],[1,1],[1,2],[1,3]], y=[2,5,8,11]; const f=ols(X,y); if(Math.abs(f.beta[0]-2)>1e-6||Math.abs(f.beta[1]-3)>1e-6||Math.abs(f.r2-1)>1e-9) throw new Error('OLS self-test FAILED'); }

export function corr(a,b){ const n=a.length,ma=a.reduce((s,v)=>s+v,0)/n,mb=b.reduce((s,v)=>s+v,0)/n; let num=0,da=0,db=0; for(let i=0;i<n;i++){const u=a[i]-ma,v=b[i]-mb;num+=u*v;da+=u*u;db+=v*v;} return num/Math.sqrt(da*db); }
export const quantile=(sorted,p)=>sorted[Math.min(sorted.length-1,Math.max(0,Math.floor(p*sorted.length)))];
