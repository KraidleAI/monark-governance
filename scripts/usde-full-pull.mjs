// usde-full-pull.mjs — F2-B calibration data acquisition (Narabi ADR-M008 D7bis, USDe/Ethena).
// Motif = msusd-full-pull.mjs, RPC layer hardened (endpoint pool + per-endpoint cooldown on rate-limit,
// getLogs split-on-result-limit). DAILY 24h UTC windows, read-only public RPCs (no key), resumable JSONL.
// Per window: burns (Transfer->0x0), mints (Transfer 0x0->), supply_close/open (totalSupply), C1 identity,
// v_t = burns/(S_open*24). Out-of-tool acquisition (K-8), NOT run by CI — committed so the published
// "Reproduce" method is not hollow (C-18): it regenerates the sha-pinned committed series root
// fixtures/usde-calib-series.json. Exclusions (S_floor, theta_stress) live in the RECORDER, not here.
//
// USAGE (needs live public RPC; read-only, no key):
//   node scripts/usde-full-pull.mjs verify   -> pull ONLY the 3 C-6 reference windows, assert magnitudes.
//   node scripts/usde-full-pull.mjs          -> full pull [genesis .. 2025-10-16), regime calm(<10-10)/run(10-10..15).

import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const OUT = new URL('./usde-windows.jsonl', import.meta.url);              // resumable per-window cache (intermediate)
const FIXTURE = new URL('../fixtures/usde-calib-series.json', import.meta.url); // the committed sha-pinned series root
const TOKEN = '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3'; // USDe (Ethena), mainnet
const DEPLOY_BLOCK = 18571358; // found 2023-11-14T16:32:35Z (verify run)
const ZERO40 = '0'.repeat(40);
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const DECIMALS = 18n, SCALE = 10n ** DECIMALS;
const toUnits = (raw) => Number(raw / (SCALE / 1000000n)) / 1000000;

// Broad archive-capable public pool. Each entry gets benched on rate-limit.
const ENDPOINTS = [
  'https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com', 'https://eth.drpc.org',
  'https://rpc.mevblocker.io', 'https://eth-mainnet.public.blastapi.io', 'https://rpc.ankr.com/eth',
  'https://1rpc.io/eth', 'https://eth.rpc.blxrbdn.com', 'https://ethereum.publicnode.com',
];
const cooldownUntil = new Map();          // url -> epoch ms until benched
let rr = 0;                                // round-robin pointer
let callCount = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toHexBlock = (n) => '0x' + BigInt(n).toString(16);
const now = () => Date.now();
const isRateLimit = (m) => /usage limit|rate.?limit|-32001|\b429\b|too many|plan|quota|capacity|exceeded the/i.test(m);
const isResultLimit = (m) => /more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size/i.test(m);

function pickEndpoint() {
  for (let i = 0; i < ENDPOINTS.length; i++) {
    const url = ENDPOINTS[(rr + i) % ENDPOINTS.length];
    if ((cooldownUntil.get(url) || 0) <= now()) { rr = (rr + i + 1) % ENDPOINTS.length; return url; }
  }
  return null; // all benched
}
// dispatcher: rate-limit -> bench endpoint + retry elsewhere; result-limit/other -> throw tagged.
async function rpcCall(method, params, maxTries = 24) {
  callCount++;
  let lastErr;
  for (let t = 0; t < maxTries; t++) {
    let url = pickEndpoint();
    if (!url) { await sleep(1500); url = ENDPOINTS[rr++ % ENDPOINTS.length]; } // all benched: wait, force one
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: callCount, method, params }) });
      if (!res.ok) { const m = `HTTP ${res.status} ${url}`; if (res.status === 429 || res.status === 503) { cooldownUntil.set(url, now() + 25000); lastErr = new Error(m); await sleep(300); continue; } throw new Error(m); }
      const json = await res.json();
      if (json.error) { const m = `${JSON.stringify(json.error)} @${url}`; if (isRateLimit(m)) { cooldownUntil.set(url, now() + 25000); lastErr = new Error(m); await sleep(300); continue; } const e = new Error(m); e.resultLimit = isResultLimit(m); throw e; }
      if (json.result === undefined) throw new Error(`no result @${url}`);
      return json.result;
    } catch (e) { lastErr = e; if (e.resultLimit) throw e; cooldownUntil.set(url, now() + 8000); await sleep(200 * (t % 5 + 1)); }
  }
  throw new Error(`rpcCall failed ${maxTries}x: ${method} :: ${lastErr}`);
}
async function getBlockTs(n) { const b = await rpcCall('eth_getBlockByNumber', [toHexBlock(n), false]); return b ? parseInt(b.timestamp, 16) : null; }
async function totalSupplyAt(n) { return BigInt(await rpcCall('eth_call', [{ to: TOKEN, data: '0x18160ddd' }, toHexBlock(n)])); }

async function firstBlockAtOrAfter(targetTs, lo, hi) {
  while (lo < hi) { const mid = lo + Math.floor((hi - lo) / 2); const ts = await getBlockTs(mid); if (ts < targetTs) lo = mid + 1; else hi = mid; }
  return lo;
}
// getLogs for [s,e], splitting recursively if an endpoint reports a result/range limit.
async function getLogsRange(s, e, depth = 0) {
  try {
    return await rpcCall('eth_getLogs', [{ address: TOKEN, fromBlock: toHexBlock(s), toBlock: toHexBlock(e), topics: [TRANSFER_TOPIC] }]);
  } catch (err) {
    if ((err.resultLimit || isResultLimit(String(err.message))) && e > s && depth < 16) {
      const mid = s + Math.floor((e - s) / 2);
      const [a, b] = await Promise.all([getLogsRange(s, mid, depth + 1), getLogsRange(mid + 1, e, depth + 1)]);
      return [...a, ...b];
    }
    throw err;
  }
}
async function fetchLogs(fromBlock, toBlock, chunk = 900, conc = 3) {
  const chunks = [];
  for (let s = fromBlock; s <= toBlock; s += chunk) chunks.push([s, Math.min(s + chunk - 1, toBlock)]);
  const out = new Array(chunks.length); let next = 0;
  async function worker() { while (true) { const my = next++; if (my >= chunks.length) return; const [s, e] = chunks[my]; out[my] = await getLogsRange(s, e); await sleep(30); } }
  await Promise.all(Array.from({ length: conc }, () => worker()));
  return out.flat();
}
function sumBurnsMints(logs) {
  let burns = 0n, mints = 0n, burnEvents = 0, mintEvents = 0; const byFrom = {};
  for (const l of logs) { const from = l.topics[1].slice(-40), to = l.topics[2].slice(-40), v = BigInt(l.data);
    if (to === ZERO40) { burns += v; burnEvents++; byFrom[from] = (byFrom[from] || 0n) + v; } if (from === ZERO40) { mints += v; mintEvents++; } }
  const top = Object.entries(byFrom).sort((a, b) => (b[1] > a[1] ? 1 : -1)).slice(0, 3).map(([a, r]) => ({ addr: '0x' + a, raw: r.toString() }));
  return { burns, mints, top, burnEvents, mintEvents, logCount: logs.length };
}
function daysUTC(startIso, endExclIso) {
  const out = []; let d = new Date(startIso + 'T00:00:00Z'); const end = new Date(endExclIso + 'T00:00:00Z');
  while (d < end) { const n = new Date(d.getTime() + 86400000); out.push([Math.floor(d / 1000), Math.floor(n / 1000), d.toISOString().slice(0, 10)]); d = n; }
  return out;
}
function makeMidnightCache(startBlock, latest) {
  let prevBlock = startBlock; const boundary = new Map();
  return async function midnightBlock(ts) {
    if (boundary.has(ts)) return boundary.get(ts);
    const hi = Math.min(latest, prevBlock + 500000);
    const b = await firstBlockAtOrAfter(ts, prevBlock, hi); boundary.set(ts, b); prevBlock = b; return b;
  };
}
async function pullWindow(fromTs, toTs, day, regime, midnightBlock) {
  const fromBlock = await midnightBlock(fromTs);
  const toBlock = (await midnightBlock(toTs)) - 1;
  const logs = await fetchLogs(fromBlock, toBlock);
  const { burns, mints, top, burnEvents, mintEvents, logCount } = sumBurnsMints(logs);
  const supplyClose = await totalSupplyAt(toBlock);
  const supplyOpen = await totalSupplyAt(fromBlock - 1);
  const computedOpen = supplyClose + burns - mints;
  const vNum = supplyOpen > 0n ? Number((burns * 1000000n) / supplyOpen) / 1000000 / 24 : null;
  return { day, regime, fromBlock, toBlock, logCount, burnEvents, mintEvents,
    burns: burns.toString(), mints: mints.toString(), supplyClose: supplyClose.toString(), supplyOpen: supplyOpen.toString(),
    burnsUnits: toUnits(burns), supplyOpenUnits: toUnits(supplyOpen), supplyCloseUnits: toUnits(supplyClose),
    c1_ok: computedOpen === supplyOpen, c1_diff: (supplyOpen - computedOpen).toString(), v_t_per_hr: vNum, top };
}

const CROSSCHECKS = [
  { day: '2025-10-11', burnsUnits: 1595045831.80, events: 908, kind: 'burns' },
  { day: '2025-03-01', burnsUnits: 267874594.64, events: 66, kind: 'burns' },
  { day: '2025-02-21', netDeltaUnits: -123260000, kind: 'netdelta' },
];
async function verifyMode(latest) {
  console.log(`DEPLOY=${DEPLOY_BLOCK}; latest=${latest}`);
  console.log(`--- C-6 cross-checks (mag +/-0.5%, events +/-2) ---`);
  let allPass = true;
  for (const cc of CROSSCHECKS) {
    const nextDay = new Date(new Date(cc.day + 'T00:00:00Z').getTime() + 86400000).toISOString().slice(0, 10);
    const [fromTs, toTs] = daysUTC(cc.day, nextDay)[0];
    // verify: isolated 2025 dates -> full-range block finder (NOT the +500000-capped marching cache).
    const mid = (ts) => firstBlockAtOrAfter(ts, DEPLOY_BLOCK, latest);
    const rec = await pullWindow(fromTs, toTs, cc.day, 'verify', mid);
    if (cc.kind === 'burns') {
      const magOk = Math.abs(rec.burnsUnits - cc.burnsUnits) / cc.burnsUnits <= 0.005, evOk = Math.abs(rec.burnEvents - cc.events) <= 2;
      allPass = allPass && magOk && evOk;
      console.log(`${cc.day}: burns=${rec.burnsUnits.toFixed(2)} (exp ${cc.burnsUnits} ${magOk ? 'OK' : 'FAIL'}) events=${rec.burnEvents} (exp ${cc.events} ${evOk ? 'OK' : 'FAIL'}) c1=${rec.c1_ok}`);
    } else {
      const nd = rec.supplyCloseUnits - rec.supplyOpenUnits, magOk = Math.abs(nd - cc.netDeltaUnits) / Math.abs(cc.netDeltaUnits) <= 0.05;
      allPass = allPass && magOk;
      console.log(`${cc.day}: netDelta=${nd.toFixed(0)} (exp ~${cc.netDeltaUnits} ${magOk ? 'OK' : 'FAIL'}) burns=${rec.burnsUnits.toFixed(0)} c1=${rec.c1_ok}`);
    }
  }
  console.log(`\nC-6 GATE: ${allPass ? 'PASS' : 'FAIL'} | calls=${callCount}`);
  return allPass;
}
async function fullPull(latest) {
  const dts = await getBlockTs(DEPLOY_BLOCK);
  const genesisDay = new Date((dts + 86400) * 1000).toISOString().slice(0, 10);
  console.log(`genesis calm start ${genesisDay}; latest=${latest}`);
  const done = new Set();
  if (existsSync(OUT)) for (const line of readFileSync(OUT, 'utf8').split('\n')) { if (!line.trim()) continue; try { done.add(JSON.parse(line).day); } catch {} }
  console.log(`resume: ${done.size} days done`);
  const all = [...daysUTC(genesisDay, '2025-10-10').map((w) => [...w, 'calm']), ...daysUTC('2025-10-10', '2025-10-16').map((w) => [...w, 'run'])];
  const midnightBlock = makeMidnightCache(DEPLOY_BLOCK, latest);
  for (const [fromTs, toTs, day, regime] of all) {
    if (done.has(day)) { await midnightBlock(toTs).catch(() => {}); continue; }
    let rec;
    try { rec = await pullWindow(fromTs, toTs, day, regime, midnightBlock); }
    catch (e) { rec = { day, regime, error: String(e.message || e) }; }
    appendFileSync(OUT, JSON.stringify(rec) + '\n');
    console.log(`${day} [${regime}] ${rec.error ? 'ERROR ' + rec.error : `v=${rec.v_t_per_hr?.toExponential(3)} c1=${rec.c1_ok} burns=${rec.burnsUnits?.toFixed(0)} bev=${rec.burnEvents}`} | calls=${callCount}`);
  }
  const rows = readFileSync(OUT, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const ordered = all.map(([, , day]) => byDay.get(day)).filter(Boolean);
  const errors = ordered.filter((r) => r.error), c1Fail = ordered.filter((r) => !r.error && !r.c1_ok);
  const fixture = { source: 'USDe (Ethena)', token: TOKEN, chain: 'ethereum-mainnet', decimals: 18, deploy_block: DEPLOY_BLOCK, genesis_day: genesisDay,
    calm_days: ordered.filter((r) => r.regime === 'calm' && !r.error).length, run_days: ordered.filter((r) => r.regime === 'run' && !r.error).length,
    errors: errors.length, c1_fail: c1Fail.length, windows: ordered };
  const body = JSON.stringify(fixture, null, 2); writeFileSync(FIXTURE, body);
  const sha = createHash('sha256').update(body.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
  console.log(`\nFIXTURE: ${fixture.calm_days} calm + ${fixture.run_days} run, ${errors.length} err, ${c1Fail.length} c1-fail. sha256=${sha}. calls=${callCount}`);
}
async function main() {
  const latest = parseInt(await rpcCall('eth_blockNumber', []), 16);
  if (process.argv[2] === 'verify') await verifyMode(latest); else await fullPull(latest);
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });
