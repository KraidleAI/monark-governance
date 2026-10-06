// test/helpers/self-signed.ts -- a self-signed certificate built on the fly (a fresh key, none committed), trusted only where a
// test says so (setDefaultCACertificates in process, NODE_EXTRA_CA_CERTS in a child). Moved from test/l2-rest-tls.test.ts (its first
// user) for test/verify-harness-liq.test.ts (lot T0-TOOLING-1): one source.
import { generateKeyPairSync, sign, X509Certificate } from "node:crypto";

/** One DER element: tag, length (short form, or 0x81 / 0x82 long form), content. */
const der = (tag: number, ...parts: Buffer[]): Buffer => {
  const body = Buffer.concat(parts), n = body.length;
  return Buffer.concat([Buffer.from([tag, ...(n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255])]), body]);
};
const seq = (...parts: Buffer[]): Buffer => der(0x30, ...parts), hex = (h: string): Buffer => Buffer.from(h, "hex");
/** A self-signed X.509 v3 certificate on a fresh P-256 key: CN `cn`, subjectAltName DNS:localhost, basicConstraints CA, ecdsa-with-SHA256. */
export function selfSigned(cn: string): { key: string; cert: string; fingerprint: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const alg = seq(hex("06082a8648ce3d040302")), name = seq(der(0x31, seq(hex("0603550403"), der(0x0c, Buffer.from(cn)))));
  const ext = der(0xa3, seq(seq(hex("0603551d11"), der(0x04, seq(der(0x82, Buffer.from("localhost"))))), seq(hex("0603551d13"), der(0x04, seq(hex("0101ff"))))));
  const tbs = seq(hex("a003020102"), der(0x02, Buffer.from([1 + cn.length])), alg, name, seq(der(0x17, Buffer.from("250101000000Z")),
    der(0x17, Buffer.from("491231235959Z"))), name, publicKey.export({ type: "spki", format: "der" }), ext);
  const x = new X509Certificate(seq(tbs, alg, der(0x03, Buffer.from([0]), sign("sha256", tbs, privateKey))));
  return { key: String(privateKey.export({ type: "pkcs8", format: "pem" })), cert: x.toString(), fingerprint: x.fingerprint256 };
}
