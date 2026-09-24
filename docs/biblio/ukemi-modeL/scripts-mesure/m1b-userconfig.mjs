// M-1b — per-asset book cost WITHOUT UiPoolDataProvider (current addr not code@B): getUserConfiguration@B.
// Bounds the per-account per-asset multiplier (used reserves). Worker claude-opus-4-8[1m] 2026-09-19. R-20.
import { writeFileSync, readFileSync } from 'node:fs';
// keccak-256 (same self-tested impl as m1-archive-cost.mjs / census)
const RC=[[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],[0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],[0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],[0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],[0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],[0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO=[0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){ for(let r=0;r<24;r++){ const C=new Array(10); for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; } const D=new Array(10); for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; } for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; } const B=new Array(50); for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; } for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); } s[0]^=RC[r][0]; s[1]^=RC[r][1]; } }
function keccak256(input){ const bytes=typeof input==='string'?Buffer.from(input,'utf8'):Buffer.from(input); const rate=136,s=new Array(50).fill(0); const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate); bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80; for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); } const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex'); }
if(keccak256('')!=='0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED');
const sel=(s)=>keccak256(s).slice(0,10);

const B_HEX='0x'+(23545087).toString(16);
const POOL='0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const URL='https://eth.drpc.org';
const USERS=['0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4','0xe0c20053d20c8d6d6de243af2093b222eb3e9c03','0x00dbcc59e6bb596cf2a1cff9326c5f80618875c3'];
const pad=(a)=>a.toLowerCase().replace(/^0x/,'').padStart(64,'0');
const SEL_CFG=sel('getUserConfiguration(address)');
const SEL_RL=sel('getReservesList()');
async function call(data,to=POOL){ const r=await (await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_call',params:[{to,data},B_HEX]})})).json(); if(r.error)throw new Error(JSON.stringify(r.error)); return r.result; }
(async()=>{
  console.log('SEL getUserConfiguration=',SEL_CFG,' getReservesList=',SEL_RL);
  const rl=await call(SEL_RL); const body=rl.replace(/^0x/,''); const n=parseInt(body.slice(64,128),16);
  console.log('reservesList count=',n);
  const out={block:23545087,provider:'drpc',users:[]};
  for(const u of USERS){
    const cfg=await call(SEL_CFG+pad(u)); const bits=BigInt(cfg);
    let coll=0,borrow=0,used=new Set();
    for(let i=0;i<n;i++){ const b=(bits>>BigInt(2*i))&1n, c=(bits>>BigInt(2*i+1))&1n; if(b){borrow++;used.add(i);} if(c){coll++;used.add(i);} }
    out.users.push({user:u,collateral_reserves:coll,borrow_reserves:borrow,used_reserves:used.size,cfg});
    console.log(`${u} collateral=${coll} borrow=${borrow} usedReserves=${used.size}`);
  }
  const avgUsed=out.users.reduce((s,x)=>s+x.used_reserves,0)/out.users.length;
  out.avg_used_reserves=avgUsed;
  out.note='per-asset book via on-chain path = 1 getReservesList (global) + 67 getReserveData (global, token addrs) + per user: 1 getUserConfiguration + used_reserves balanceOf. Multiplier per account ~= 1 + used_reserves.';
  writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/out/m1b-userconfig.json',JSON.stringify(out,null,2));
  console.log('avg used reserves/user=',avgUsed,'-> per-asset book multiplier ~=',(1+avgUsed).toFixed(1),'calls/user');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
