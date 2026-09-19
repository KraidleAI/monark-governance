// M-2b.4 — Bissection du bloc de bascule de source d'oracle (sUSDe/USDe: USDe/USD -> USDT/USD) + trace on-chain
// de gouvernance (AssetSourceUpdated) + LST/LRT source depuis 2025-01. Worker claude-opus-4-8[1m] 2026-09-19. R-20.
// Pre-enregistrement: MESURES-M2b-sources-2026-09-19.md §3.4. JSON hache SANS horodatage.
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { sel, keccak256, rpc, rpcQuorum, pad, hexBlock, decodeAddress, decodeString } from './lib-m2b.mjs';

const started=new Date().toISOString();
const ORACLE='0x54586bE62E3c3580375aE3723C145253060Ca0C2';
const SEL_SRC=sel('getSourceOfAsset(address)'), SEL_DESC=sel('description()');
const ASSETSRCUPD=keccak256('AssetSourceUpdated(address,address)');
const BLOCK_NOW=26009084; // pinned (no 'latest' in hashed JSON)
const LOB=21895693, HIB=23545087; // 2025-02-21 .. 2025-10-10
const ASSETS={ sUSDe:'0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', USDe:'0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' };
const LSTLRT={ wstETH:'0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', weETH:'0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', rsETH:'0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7' };

const getSource=async(asset,blk)=>decodeAddress(await rpc('eth_call',[{to:ORACLE,data:SEL_SRC+pad(asset)},hexBlock(blk)]));
const getSourceQ=async(asset,blk)=>{ const q=await rpcQuorum('eth_call',[{to:ORACLE,data:SEL_SRC+pad(asset)},hexBlock(blk)]); return {addr:decodeAddress(q.value), quorum:q.quorum}; };
async function getDesc(src,blk){ try{ return decodeString(await rpc('eth_call',[{to:src,data:SEL_DESC},hexBlock(blk)])); }catch(e){ return '<no description(): '+e.message.slice(0,40)+'>'; } }
// find first block in [lo,hi] where pred true (pred monotone false->true)
async function bisectFirstTrue(pred,lo,hi){ let l=lo,h=hi,ans=hi; while(l<=h){ const m=Math.floor((l+h)/2); if(await pred(m)){ ans=m; h=m-1; } else l=m+1; } return ans; }
// find last block where pred true (pred monotone true->false)
async function bisectLastTrue(pred,lo,hi){ let l=lo,h=hi,ans=lo; while(l<=h){ const m=Math.floor((l+h)/2); if(await pred(m)){ ans=m; l=m+1; } else h=m-1; } return ans; }
const blockDateUTC=async(blk)=>new Date(parseInt((await rpc('eth_getBlockByNumber',[hexBlock(blk),false])).timestamp,16)*1000).toISOString();

const switches={};
for(const [name,asset] of Object.entries(ASSETS)){
  const OLD=await getSource(asset,LOB), NEW=await getSource(asset,HIB);
  const firstNEW=await bisectFirstTrue(async m=>(await getSource(asset,m))===NEW, LOB, HIB);
  const lastOLD =await bisectLastTrue (async m=>(await getSource(asset,m))===OLD, LOB, HIB);
  // quorum-2 confirm boundary
  const qNm1=await getSourceQ(asset,firstNEW-1), qN=await getSourceQ(asset,firstNEW);
  const contiguous=(lastOLD+1===firstNEW);
  let intermediate=null; if(!contiguous){ intermediate=await getSource(asset,lastOLD+1); }
  const descOld=await getDesc(OLD,lastOLD), descNew=await getDesc(NEW,firstNEW);
  const dateN=await blockDateUTC(firstNEW);
  // on-chain governance: AssetSourceUpdated log at firstNEW for this asset
  let gov=null;
  try{ const logs=await rpc('eth_getLogs',[{fromBlock:hexBlock(firstNEW),toBlock:hexBlock(firstNEW),address:ORACLE,topics:[ASSETSRCUPD,pad(asset)]}]);
    if(logs.length){ const l=logs[0]; const rec=await rpc('eth_getTransactionReceipt',[l.transactionHash]);
      gov={ txHash:l.transactionHash, source_in_log:decodeAddress(l.topics[2]), tx_to:rec.to, tx_from:rec.from, n_logs_in_tx:rec.logs.length,
        other_emitters:[...new Set(rec.logs.map(x=>x.address.toLowerCase()))] }; }
    else gov={note:'no AssetSourceUpdated log at firstNEW for this asset (source set via different path/block)'};
  }catch(e){ gov={error:e.message.slice(0,80)}; }
  switches[name]={ asset, OLD_source:OLD, NEW_source:NEW, desc_old:descOld, desc_new:descNew,
    lastOLD_block:lastOLD, firstNEW_block:firstNEW, switch_block:firstNEW, switch_date_utc:dateN,
    contiguous_single_transition:contiguous, intermediate_source:intermediate,
    quorum_confirm:{ ['block_'+(firstNEW-1)]:qNm1, ['block_'+firstNEW]:qN }, governance_onchain:gov };
  console.log(`[${name}] OLD=${OLD} -> NEW=${NEW}`);
  console.log(`  lastOLD=${lastOLD} firstNEW=${firstNEW} contiguous=${contiguous} date(N)=${dateN}`);
  console.log(`  desc_old="${descOld}" desc_new="${descNew}"`);
  console.log(`  quorum N-1: ${qNm1.addr}(q${qNm1.quorum})  N: ${qN.addr}(q${qN.quorum})`);
  console.log(`  gov: ${JSON.stringify(gov)}`);
}

// ---- LST/LRT: source now + since 2025-01 ----
// find block near 2025-01-15T00:00Z (ts=1736899200) by ts-bisection
const targetTs=1736899200;
const tsAt=async(blk)=>parseInt((await rpc('eth_getBlockByNumber',[hexBlock(blk),false])).timestamp,16);
const blk2025Jan=await bisectLastTrue(async m=>(await tsAt(m))<=targetTs, 21000000, 21895693);
const ts2025Jan=await tsAt(blk2025Jan);
const lstlrt={};
for(const [name,asset] of Object.entries(LSTLRT)){
  const srcNow=await getSource(asset,BLOCK_NOW), srcJan=await getSource(asset,blk2025Jan);
  const descNow=await getDesc(srcNow,BLOCK_NOW);
  const listedJan = srcJan!=='0x0000000000000000000000000000000000000000';
  lstlrt[name]={ asset, source_now:srcNow, desc_now:descNow, source_2025jan:srcJan, listed_2025jan:listedJan, changed_since_2025jan: listedJan? (srcNow!==srcJan) : 'not_listed_in_2025jan' };
  console.log(`[LST/LRT ${name}] now=${srcNow} "${descNow}" | 2025-01=${srcJan} changed=${lstlrt[name].changed_since_2025jan}`);
}

const out={ measure:'M-2b.4 oracle source bisection + governance + LST/LRT', model:'claude-opus-4-8[1m]',
  aave_oracle:ORACLE, oracle_verified_via:'PoolAddressesProvider.getPriceOracle()', block_now:BLOCK_NOW,
  bisection_range:[LOB,HIB], switches, lst_lrt:{ block_2025jan:blk2025Jan, ts_2025jan_utc:new Date(ts2025Jan*1000).toISOString(), assets:lstlrt } };
const p='F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b4-source-bisect.json';
writeFileSync(p, JSON.stringify(out,null,2));
const sha=createHash('sha256').update(Buffer.from(JSON.stringify(out,null,2))).digest('hex');
const finished=new Date().toISOString();
writeFileSync('F:/Monark/docs/biblio/ukemi-modeL/scripts-mesure/m2b/out/m2b4-source-bisect.timing.txt',
  `started=${started}\nfinished=${finished}\njson_sha256=${sha}\n`);
console.log('\njson_sha256=',sha);
