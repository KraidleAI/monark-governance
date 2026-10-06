// MONARK Dojo -- PR-1b-5b (ADR-DOJO-PR-1B-5, PLI-1): the reader's verifier CLI and its URL transport, moved out of dojo-verify.mjs so
// that the verifier core, which the publisher is to load (ADR-DOJO-PR-3 D-5), holds no network code (DOJO-VERIFY-CORE-NO-NET-1).
// Here only: the one GET, through the runtime's global fetch, and the one read of the environment, both in urlSource (PR-1b-4 T-10).
// The checks, the bounds and the refusals are the core's, imported and never copied (one DojoVerifyError class). The old command,
// node apps/dojo/scripts/dojo-verify.mjs, runs nothing and names this one (PLI-1 bis). Built-ins only.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { DojoVerifyError, VERIFY_BOUNDS, dayOk, dirSource, readJson, verifyDojoServed } from "./dojo-verify.mjs";

const refuse = (code, seq, day, detail) => { throw new DojoVerifyError(code, seq, day, detail); };

/** Transport policy (PR-1b-4 T-1, bell-verify.mjs:30-32), read on the RAW string before any normalization: https (no userinfo)
 *  anywhere, http ONLY on the loopback literals 127.0.0.1 or [::1]; and no ? nor # anywhere in the base (T-2, declared divergence). */
export const urlAllowed = (u) => typeof u === "string" && !/[?#]/.test(u)
  && (/^https:\/\/[^/?#@\s\\]+(?:[/?#]|$)/i.test(u) || /^http:\/\/(?:127\.0\.0\.1|\[::1\])(?::\d{1,5})?(?:\/|$)/.test(u));
const SERVED = /^(?:timeline\.jsonl|dojo\/pubkey\.json|(?:lines|history)\/[0-9a-f]{64}\.jsonl)$/; // T-8: the closed list (mere D-9 l.254)
const TLS_ENV = ["NODE_EXTRA_CA_CERTS", "NODE_USE_SYSTEM_CA", "NODE_USE_ENV_PROXY"]; // extend the trust or route the GETs (FAITS F-2, F-4, F-5)
/** A served base URL (PR-1b-4 D-1, T-3 to T-10; bell-verify.mjs:47-68): one GET per file of the closed list, resent only by replayOf, redirect "manual", any
 *  3xx refused (never followed), 200 only, the body counted as it streams (content-length never read) and cancelled on any refusal (FAITS F-6), one timer per
 *  file over its tries, headers and body; the check's totals counted here (Q-V-1). Every refusal comes at a get, before its request, so verifyDojoServed
 *  reports it; NODE_TLS_REJECT_UNAUTHORIZED at 0 disables the certificate check (FAITS F-1): refused (T-9 amended). `note` names the TLS variables present,
 *  never a value (the CLI's detail). FAITS F-7, measured on Node 24.15.0 (G2 of PR-1b-4): fetch yields the body DECODED, which T-6 bounds (gzip bombs too). */
export function urlSource(base, bounds = VERIFY_BOUNDS) {
  const env = process.env, root = String(base).replace(/\/+$/, ""), set = TLS_ENV.filter((k) => env[k] !== undefined);
  let files = 0, bytes = 0;
  return {
    note: set.length === 0 ? null : `TLS environment: ${set.join(", ")}`,
    get: async (rel) => {
      if (env.NODE_TLS_REJECT_UNAUTHORIZED === "0") refuse("insecure_url", null, null, "NODE_TLS_REJECT_UNAUTHORIZED");
      if (!urlAllowed(base)) refuse("insecure_url", null, null, "--url");
      if (!SERVED.test(rel)) refuse("insecure_url", null, null, rel);
      if (++files > bounds.MAX_FILES) refuse("too_large", null, null, "total files");
      const ctl = new AbortController(), timer = setTimeout(() => { ctl.abort(); }, bounds.TIMEOUT_MS);
      let res = null, tries = 0; // replayOf: the same GET once more, only if the connection failed before any answer
      try {
        while (res === null) res = await fetch(`${root}/${rel}`, { redirect: "manual", signal: ctl.signal }).catch((e) => replayOf(e, ++tries, ctl.signal));
        if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) refuse("redirect_refused", null, null, rel);
        if (res.status !== 200 || res.body === null) refuse("http_status", null, null, rel);
        const chunks = [];
        let n = 0;
        for await (const c of res.body) {
          if ((n += c.length) > bounds.MAX_BODY_BYTES) refuse("too_large", null, null, rel);
          if ((bytes += c.length) > bounds.MAX_TOTAL_BYTES) refuse("too_large", null, null, "total bytes");
          chunks.push(c);
        }
        return Buffer.concat(chunks);
      } catch (e) {
        await res?.body?.cancel().catch(() => undefined); // F-6: a refused body is cancelled, never left to the collector
        if (e instanceof DojoVerifyError) throw e;
        return refuse("unreachable", null, null, rel);
      } finally { clearTimeout(timer); }
    },
  };
}

const USAGE = "dojo/verify: usage: node apps/dojo/scripts/dojo-verify-cli.mjs (<served tree> | --url <base>) (--keyring <file> | --self-consistent-only)"
  + " [--address <address>] [--day <YYYY-MM-DD>]\n";
/** CLI (D-10 l.250; mission of PR-1b-2; PR-1b-4 D-1): one source, a served tree (a directory) or --url <base>, and a trust root
 *  chosen explicitly, --keyring <file> or --self-consistent-only; neither, both, a flag twice, a dangling or unknown flag, zero or
 *  two sources, a --day out of form: usage on stderr, nothing on stdout, exit 1. Otherwise one canonical JSON line on stdout, exit 0
 *  iff ok; a keyring file unreadable or not an object is keyring_invalid, never a run without a root. Under --url, the detail of a
 *  success names the TLS variables of the environment (T-9 amended), never their values. */
export async function runVerifyCli(argv) {
  const opt = new Map(), trees = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], valued = ["--keyring", "--address", "--url", "--day"].includes(a);
    if (opt.has(a) || (a.startsWith("--") && !valued && a !== "--self-consistent-only") || (valued && (argv[i + 1] ?? "--").startsWith("--"))) {
      process.stderr.write(USAGE);
      return 1;
    }
    if (a === "--self-consistent-only") opt.set(a, true);
    else if (valued) opt.set(a, argv[++i]);
    else trees.push(a);
  }
  if (trees.length + (opt.has("--url") ? 1 : 0) !== 1 || opt.has("--keyring") === opt.has("--self-consistent-only")
    || (opt.has("--day") && !dayOk(opt.get("--day")))) { process.stderr.write(USAGE); return 1; }
  try {
    let keyring = null;
    if (opt.has("--keyring")) { try { keyring = readJson(readFileSync(opt.get("--keyring"), "utf8")); } catch { keyring = undefined; } }
    const source = opt.has("--url") ? urlSource(opt.get("--url")) : dirSource(trees[0]);
    const r = opt.has("--keyring") && (keyring === null || typeof keyring !== "object")
      ? { ok: false, reason: "keyring_invalid", seq: null, day: null, detail: "--keyring" }
      : await verifyDojoServed({ source, keyring, address: opt.get("--address") ?? null, day: opt.get("--day") ?? null });
    process.stdout.write(`${canonical(r.ok ? { ...r, detail: source.note ?? null } : r)}\n`);
    return r.ok ? 0 : 1;
  } catch (e) {
    process.stderr.write(`dojo/verify: fatal: ${String(e?.name ?? "error")}\n`);
    return 1;
  }
}

// C-G2-1 (G2 of PR-1b-5b): REAL paths compared, so a launch through a directory link runs it; argv[1] absent or unreadable: an import, no throw.
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) process.exitCode = await runVerifyCli(process.argv.slice(2));

/** The replay rule of one GET of urlSource: null (the same GET is sent once more) when its FIRST try failed before any answer on a
 *  closed connection (a kept-alive connection the host closed while the check computed; the runtime drops that socket, so the replay
 *  opens a new one); else the error, rethrown. Never on the GET's timer (its signal aborted), never once an answer came (a refusal, a
 *  status or a body cut short are read after this), never for another error (a refused or unresolved host); the replayed bytes are
 *  hashed against the signed lines like any others. Hoisted, declared last so that no line above it moves (killers name its lines). */
function replayOf(e, tries, signal) {
  if (tries > 1 || signal.aborted || !["UND_ERR_SOCKET", "ECONNRESET"].includes(e?.cause?.code)) throw e; // the codes of a closed or reset socket
  return null;
}
