// M-2b — sUSDe 2025-02-21 raw form (secondary): oracle sUSDe/USDe move around the event, first-hand archive eth_call.
// Worker claude-opus-4-8[1m] 2026-09-19. R-20. n=5 liquidations in 2 blocks -> NO regression, raw form only.
import { writeFileSync } from 'node:fs';
// keccak-256 (self-tested, same impl as census/m1/m2)
const RC=[[0x00000001,0x00000000],[0x00008082,0x00000000],[0x0000808a,0x80000000],[0x80008000,0x80000000],[0x0000808b,0x00000000],[0x80000001,0x00000000],[0x80008081,0x80000000],[0x00008009,0x80000000],[0x0000008a,0x00000000],[0x00000088,0x00000000],[0x80008009,0x00000000],[0x8000000a,0x00000000],[0x8000808b,0x00000000],[0x0000008b,0x80000000],[0x00008089,0x80000000],[0x00008003,0x80000000],[0x00008002,0x80000000],[0x00000080,0x80000000],[0x0000800a,0x00000000],[0x8000000a,0x80000000],[0x80008081,0x80000000],[0x00008080,0x80000000],[0x80000001,0x00000000],[0x80008008,0x80000000]];
const RHO=[0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
function rotl(lo,hi,n){ if(n===0)return[lo,hi]; if(n<32)return[(lo<<n)|(hi>>>(32-n)),(hi<<n)|(lo>>>(32-n))]; n-=32; return[(hi<<n)|(lo>>>(32-n)),(lo<<n)|(hi>>>(32-n))]; }
function keccakF(s){ for(let r=0;r<24;r++){ const C=new Array(10); for(let x=0;x<5;x++){ C[2*x]=s[2*x]^s[2*(x+5)]^s[2*(x+10)]^s[2*(x+15)]^s[2*(x+20)]; C[2*x+1]=s[2*x+1]^s[2*(x+5)+1]^s[2*(x+10)+1]^s[2*(x+15)+1]^s[2*(x+20)+1]; } const D=new Array(10); for(let x=0;x<5;x++){ const[rl,rh]=rotl(C[2*((x+1)%5)],C[2*((x+1)%5)+1],1); D[2*x]=C[2*((x+4)%5)]^rl; D[2*x+1]=C[2*((x+4)%5)+1]^rh; } for(let i=0;i<25;i++){ s[2*i]^=D[2*(i%5)]; s[2*i+1]^=D[2*(i%5)+1]; } const B=new Array(50); for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y, j=y+5*((2*x+3*y)%5); const[rl,rh]=rotl(s[2*i],s[2*i+1],RHO[i]); B[2*j]=rl; B[2*j+1]=rh; } for(let x=0;x<5;x++)for(let y=0;y<5;y++){ const i=x+5*y; s[2*i]=B[2*i]^((~B[2*(((x+1)%5)+5*y)])&B[2*(((x+2)%5)+5*y)]); s[2*i+1]=B[2*i+1]^((~B[2*(((x+1)%5)+5*y)+1])&B[2*(((x+2)%5)+5*y)+1]); } s[0]^=RC[r][0]; s[1]^=RC[r][1]; } }
function keccak256(input){ const bytes=typeof input==='string'?Buffer.from(input,'utf8'):Buffer.from(input); const rate=136,s=new Array(50).fill(0); const padded=Buffer.alloc(Math.ceil((bytes.length+1)/rate)*rate); bytes.copy(padded); padded[bytes.length]^=0x01; padded[padded.length-1]^=0x80; for(let off=0;off<padded.length;off+=rate){ for(let i=0;i<rate/8;i++){ s[2*i]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8,true); s[2*i+1]^=new DataView(padded.buffer,padded.byteOffset,padded.byteLength).getUint32(off+i*8+4,true); } keccakF(s); } const out=Buffer.alloc(32); for(let i=0;i<4;i++){ new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8,s[2*i]>>>0,true); new DataView(out.buffer,out.byteOffset,out.byteLength).setUint32(i*8+4,s[2*i+1]>>>0,true); } return '0x'+out.toString('hex'); }
if(keccak256('')!=='0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') throw new Error('keccak self-test FAILED');
const sel=(s)=>keccak256(s).slice(0,10);
const SEL_PRICE=sel('getAssetPrice(address)');

const ORACLE='0x54586bE62E3c3580375aE3723C145253060Ca0C2';
const sUSDe='0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', USDe='0x4c9EDD5852cd905f086C759E8383e09bff1E68B3';
const EVENT=21895693, CTRL=EVENT-7150; // ~24h earlier (control J-1)
const RPCS=['https://eth.drpc.org','https://rpc.mevblocker.io'];
const pad=(a)=>a.toLowerCase().replace(/^0x/,'').padStart(64,'0'); const hexBlock=(n)=>'0x'+n.toString(16); let rr=0;
async function rpc(method,params){ let last; for(let i=0;i<6;i++){ const url=RPCS[(rr++)%RPCS.length]; try{ const r=await(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})})).json(); if(r.error){last=JSON.stringify(r.error);continue;} return r.result; }catch(e){last=e.message;} } throw new Error('rpc '+method+': '+last); }
const price=async(tok,blk)=>Number(BigInt(await rpc('eth_call',[{to:ORACLE,data:SEL_PRICE+pad(tok)},hexBlock(blk)])))/1e8;
(async()=>{
  console.log('SEL getAssetPrice=',SEL_PRICE);
  const tsE=parseInt((await rpc('eth_getBlockByNumber',[hexBlock(EVENT),false])).timestamp,16);
  const tsC=parseInt((await rpc('eth_getBlockByNumber',[hexBlock(CTRL),false])).timestamp,16);
  const out={block_event:EVENT, block_ctrl:CTRL, ts_event:new Date(tsE*1000).toISOString(), ts_ctrl:new Date(tsC*1000).toISOString(),
    sUSDe:{ctrl:await price(sUSDe,CTRL), event:await price(sUSDe,EVENT)}, USDe:{ctrl:await price(USDe,CTRL), event:await price(USDe,EVENT)} };
  out.sUSDe.pct=((out.sUSDe.event/out.sUSDe.ctrl-1)*100);
  out.USDe.pct=((out.USDe.event/out.USDe.ctrl-1)*100);
  console.log(`sUSDe oracle J-1(${out.ts_ctrl.slice(0,10)})=${out.sUSDe.ctrl.toFixed(4)} -> event=${out.sUSDe.event.toFixed(4)} (${out.sUSDe.pct.toFixed(2)}%)`);
  console.log(`USDe  oracle J-1=${out.USDe.ctrl.toFixed(4)} -> event=${out.USDe.event.toFixed(4)} (${out.USDe.pct.toFixed(2)}%)`);
  writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/out/m2b-susde-0221.json',JSON.stringify(out,null,2));
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
