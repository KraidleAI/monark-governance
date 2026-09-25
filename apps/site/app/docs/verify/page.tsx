import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countWord, capitalized } from "@/lib/fleet";
import { loadBellServed, bellServedRepoRoot, BELL_HOST, BELL_PUBKEY_PATH, BELL_TIMELINE_PATH, bellStatePathOf } from "@/lib/bell-served-load";
import { BELL_RESIDUAL_CODES_LISTED, BELL_PUBLIC_REPO_URL } from "@/lib/bell-method";
import { loadAnchors, loadPublications, ANCHORS_ROUTE } from "@/lib/bell-anchors-load";
import { publicationAnchorState } from "@/lib/bell-anchors";
import { loadH5Trace } from "@/lib/harness-served-load";
import { NARABI_ROUTE } from "@/lib/narabi-live";
import { docsRepoRoot } from "@/lib/docs-references-load";
import { DocHeader, Toc, DocSection, Figure, Callout, PrevNext } from "@/components/docs/doc-kit";
import { FlowSchema, type FlowStep } from "@/components/docs/schemas/flow";

// /docs/verify (server component). The checks a third party can run with standard tools and no MONARK account; the files are
// public and any copy serves; the signature check is a separate step through the open verifier. Every host, path, key id, digest and count is read from committed, hashed data (the Bell facts, the served anchors
// register, the recorded trace); the token address is read at build from the committed public file out/mint.txt, the same
// value a root test pins on the token page. The latest published record's timestamp state is derived from the bound publication rows
// (publicationAnchorState), never typed: the last gesture is solid only once a proof covering that record carries a Bitcoin block.
export const metadata: Metadata = {
  title: "Verify it yourself · Docs · MONARK",
  description:
    "Check MONARK yourself with standard tools: the public key, the hash chain, the signatures, the state files, the token address and the timestamps, then the Narabi replay, the site data and the gate's abstention.",
};

/** The committed token address, read from the public file the token page is pinned to (fail-closed on a malformed file). */
function tokenAddress(root: string): string {
  const raw = readFileSync(join(root, "out", "mint.txt"), "utf8").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw)) throw new Error("docs verify: out/mint.txt is not one address (fail-closed)");
  return raw;
}

export default function DocsVerifyPage() {
  const root = docsRepoRoot();
  const served = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const anchors = loadAnchors();
  const h5 = loadH5Trace(root);
  const address = tokenAddress(root);
  const head = served.head;
  const first = served.first_record;
  const anchorState = publicationAnchorState(served.head, served.lines, loadPublications(served.lines).bound);
  const abstained = h5.decisions.find((d) => d.action !== "commit");
  const pub = `${BELL_HOST}${BELL_PUBKEY_PATH}`;
  const timeline = `${BELL_HOST}${BELL_TIMELINE_PATH}`;
  const keyring = "apps/bell/keys/bell-keyring.json";
  const steps: FlowStep[] = [
    { head: "The key", body: "fetch the public key and compare its id with the committed keyring", today: true, source: "served" },
    { head: "The chain", body: "hash each line and follow the previous-line hash back to the genesis value", today: true, source: "served" },
    { head: "The signatures", body: "check every line's Ed25519 signature under the committed keyring", today: true, source: "public verifier" },
    { head: "The state files", body: "hash the immutable state and provenance files named by the line", today: true, source: "served" },
    { head: "The token address", body: "compare the address on the token page with the committed public file", today: true, source: "public repository" },
    { head: "The timestamps", body: "verify the anchor of a published line against a Bitcoin node of your choice", today: anchorState.state === "anchored", source: "publication register" },
  ];
  const toc = [
    { id: "gestures", label: "The gestures" },
    { id: "key", label: "The key" },
    { id: "chain", label: "The chain" },
    { id: "signatures", label: "The signatures" },
    { id: "state", label: "The state files" },
    { id: "token", label: "The token address" },
    { id: "timestamps", label: "The timestamps" },
    { id: "more", label: "More checks" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · verify it yourself" title="Do not trust us. Recompute.">
        <p>
          Everything MONARK publishes is set up so that you can recompute it with standard tools and a copy of the public files, with
          no MONARK account: the files are public, any copy serves. The signature check is a separate step, through the open verifier
          of the public repository or your own implementation of the canonical form. A signature attests origin, never truth: the
          check of a fact is always the recompute from the ledger.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="gestures" title="The gestures">
        <p>
          {capitalized(countWord(steps.length))} gestures on MONARK Bell&rsquo;s published record and on the token, in order. The last
          one is drawn dashed until a proof covering the latest published record carries a Bitcoin block: that state is read from the
          publication register.
        </p>
        <Figure caption={<>The gestures, in order. A dashed step cannot be completed yet on the latest published record; its state is read from the publication register.</>}>
          <FlowSchema label="The verification gestures: the key, the chain, the signatures, the state files, the token address, the timestamps." steps={steps} footer="Keep a copy of the timeline: a later change to a published line shows at recomputation." />
        </Figure>
      </DocSection>

      <DocSection id="key" title="The key">
        <pre className="c-code">{`curl -s ${pub}`}</pre>
        <p>
          The key id served there must equal the id in the committed keyring, <code>{keyring}</code>: today{" "}
          <span className="c-mono">{head.key_id}</span>, as read from the host at {served.read_at}. The site links the key and serves
          no copy of it.
        </p>
      </DocSection>

      <DocSection id="chain" title="The chain">
        <pre className="c-code">{`curl -s ${timeline} -o timeline.jsonl\nsed -n '<n>p' timeline.jsonl | tr -d '\\n' | sha256sum`}</pre>
        <p>
          The hash of line n, without its line feed, is its <code>line_hash</code>. Each line names the hash of the one before it in{" "}
          <code>prev_line_hash</code>; the first names the genesis value <span className="c-mono">{first.prev_line_hash}</span>. The
          latest line, number {head.seq}, carries <span className="c-mono">{head.line_hash}</span>.
        </p>
      </DocSection>

      <DocSection id="signatures" title="The signatures">
        <pre className="c-code">{`node apps/bell/scripts/bell-verify.mjs --url ${BELL_HOST} --keyring ${keyring}`}</pre>
        <p>
          Run from the <a href={BELL_PUBLIC_REPO_URL}>public repository</a>, the reader-side verifier re-derives the chain and every
          signature, the key schedule, and the binding of the state file to the head line. Its success status reads{" "}
          <code>consistent_with_supplied_keyring</code>; without a keyring it reports <code>self_consistent_only</code>, never an
          unqualified success. The deployment check runs the same verifier against the served host: {served.deploy_check.checks_passed} of{" "}
          {served.deploy_check.checks_total} controls passed at {served.deploy_check.checked_at}.
        </p>
      </DocSection>

      <DocSection id="state" title="The state files">
        <pre className="c-code">{`curl -s ${BELL_HOST}${bellStatePathOf(head.state_sha256)} | sha256sum`}</pre>
        <p>
          A line names the SHA-256 of its state file and of its provenance file, and the host serves each one, unchanged, at an address
          made of that hash. The hash of the file must equal its name. For the latest line: state{" "}
          <span className="c-mono">{head.state_sha256}</span>, provenance <span className="c-mono">{head.provenance_sha256}</span>.
        </p>
      </DocSection>

      <DocSection id="token" title="The token address">
        <p>
          The token&rsquo;s contract address is shown on the <Link href="/token">token page</Link> as an address only, with no price and
          no buy call. It is also the single line of <code>out/mint.txt</code> in the public repository, and a test pins the two equal
          on every change. Read from that file when this page was built:
        </p>
        <pre className="c-code">{address}</pre>
      </DocSection>

      <DocSection id="timestamps" title="The timestamps">
        <p>
          The published records are signed and chained. Their timestamp anchoring is read from the publication register: none, pending
          while the proof carries calendar attestations only, anchored once it carries a Bitcoin block; this gesture applies to an
          anchored line.
        </p>
        <p>
          Today the anchors cover the manifests of the counter-verification run of the multiplier history: {anchors.rows.length} lines
          in the register, {anchors.withBitcoin} of {anchors.proofs} proofs carrying a Bitcoin block record. For each, download the
          manifest and its proof from the <Link href={ANCHORS_ROUTE}>anchors register</Link>, hash the manifest, and run an open
          OpenTimestamps client on the proof against a Bitcoin node of your choice: it names the block before which the manifest
          existed.
        </p>
        <Callout tone="limit" title="What an anchor shows, and what it does not">
          <p>
            An anchor shows that the bytes existed before a block. It does not show that the facts are true, when the record was
            published, or when its data was collected. A pending proof depends on a calendar until it records a block.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="more" title="More checks">
        <ul className="d-bullets">
          <li>
            <strong>Narabi.</strong> Pull the two published files, recompute any window from its block range with the logs and the
            supply of the token, and re-derive the tracker from the score column; the <Link href={NARABI_ROUTE}>Narabi page</Link> runs
            the integrity checks in your browser.
          </li>
          <li>
            <strong>The site&rsquo;s data.</strong> The facts these pages print are read from committed files, never typed. The data files
            under <code>apps/site/data/</code>, the committed figures and the recorded traces are pinned by hash in{" "}
            <code>manifest.sha256.json</code>; a mismatch stops the build.
          </li>
          <li>
            <strong>The gate&rsquo;s abstention.</strong> Call the gate outside a committed class and watch it abstain.
            {abstained !== undefined ? (
              <>
                {" "}As recorded: the step <code>{abstained.step}</code> on <code>{abstained.task_class}</code> answered{" "}
                <code>
                  {abstained.action} · {abstained.reason}
                </code>
                .
              </>
            ) : null}
          </li>
          <li>
            <strong>The contracts.</strong> Try to serialise a contract carrying a forbidden key: it throws instead of serialising.
          </li>
        </ul>
      </DocSection>

      <PrevNext href="/docs/verify" />
    </article>
  );
}
