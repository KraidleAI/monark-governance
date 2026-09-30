// apps/site/lib/dojo-copy.ts -- the public texts of /dojo, a closed list, each rendered as written. No figure is typed here: a
// {name} in a sentence stands for the figure of that name, which the page renders by property access from the committed record
// (lib/dojo-served.ts) and the build check reads from the same record. The tier names live in ONE constant, in their order, and
// every sentence that names them reads it. Pure data (no React or Next import): the root tests and scripts/assert-fleet-html.mjs
// import it. No digit anywhere in this file, except in the two names SHA-256 and Ed25519. The five sentences of the reread are
// rendered by the reread component only; the built page carries the first of them, never another.
export const DOJO_ROUTE = "/dojo";
/** The program's name, beside the status of its register on the page. */
export const DOJO_NAME = "Dōjō";
/** The title of the page, and the label of the link to it from /token. */
export const DOJO_TITLE = "Dōjō · hold snapshot";
/** The tier names: a closed list, in this order. */
export const DOJO_TIER_NAMES = ["Egg", "Caterpillar", "Chrysalis", "Monarch", "Migration"] as const;
const [EGG, CATERPILLAR, CHRYSALIS, MONARCH, MIGRATION] = DOJO_TIER_NAMES;
const TIERS = `${EGG}, ${CATERPILLAR}, ${CHRYSALIS}, ${MONARCH}, ${MIGRATION}`;

/** The sentences, by role; which of them the page shows depends on the state of the committed record. */
export const DOJO_TEXT = {
  lead:
    "A dated, public record of the MONARK token balances held by each address, read from the chain through two distinct " +
    "operators, with a hold score per address. Every line is published, signed and chained, and anyone can recompute it.",
  counted: "Latest snapshot: {day} UTC · {reads_done} of {k_reads} scheduled readings between slots {slot_min} and {slot_max} · {lines_count} lines · Merkle root {root}",
  abstained: "Latest snapshot: {day} UTC · abstained: that day is not counted.",
  totals: "Total hold score: {score_total} · validated: {validated_total}",
  holders:
    "{holders_count} holders hold at least {dust_threshold_tokens} tokens, the dust threshold of the version in force; smaller lines " +
    "are published and not counted.",
  holder:
    "{holders_count} holder holds at least {dust_threshold_tokens} tokens, the dust threshold of the version in force; smaller lines " +
    "are published and not counted.",
  tiers:
    `Tiers: ${TIERS}, each a number of units; ${EGG} is the first. One unit is {threshold_unit_token_days} validated token-days in ` +
    "the version in force, set from a fixed objective published in advance and converted each week from two daily series read on " +
    "the chain, the pool's reserves and a second on-chain rate; a new version applies from the next day, never backwards, and the " +
    "units of an address follow it, up or down.",
  noVersion:
    `Tiers: ${TIERS}, each a number of units; ${EGG} is the first. No unit version is in force yet: the first one needs seven ` +
    "counted days with both daily series read on the chain, and until it applies no address holds a unit or a tier.",
  tier:
    `Tier of an address: the highest of ${EGG}, ${CATERPILLAR}, ${CHRYSALIS}, ${MONARCH} and ${MIGRATION} whose number of units ` +
    `it holds, ${MIGRATION} counting only the parts held for at least one hundred and eighty days, read from its line.`,
  method:
    "Each day, every address is read at instants drawn from a seed committed in advance and revealed afterwards; the day counts " +
    "the smallest reading, and an account no longer found counts as zero. When a balance decreases, the part that left starts " +
    "again from zero, newest first. The hold score is the sum, over the days counted, of the part still held. Points become " +
    "validated once the part that produced them has been held for sixty days in a row, and stay provisional until then.",
  exclusion:
    "An address off the Ed25519 curve is a program address, such as a pool or an escrow, or an address no key can sign for: its " +
    "line is published with the class program and a hold score of zero.",
  bounds:
    "What a snapshot shows: the balances two distinct operators reported for each address at the recorded slots, and the hold " +
    "score computed from them. What it does not show: that an address belongs to one person, the balance between two readings, " +
    "or anything to come.",
  check:
    "Check it yourself: download the signed timeline and a day's lines file; its SHA-256 must equal the value the signed line " +
    "carries. Rebuild the Merkle root from the lines, sorted by address. Recompute your line from the previous day's line and the " +
    "day's readings, and the unit and the dust threshold from the anchor line's objective and the two daily series the version " +
    "line publishes. Check the signature with the published key. The check does not read the chain.",
  tree: "The Merkle tree hashes each line with a leaf prefix and each pair with a node prefix, and splits at the largest power of two below the count.",
  beacon:
    "The instants of a day also depend on the signature of a public randomness beacon, published with that day's snapshot; this " +
    "page does not check that signature, and any client of that beacon can, with the key named in the anchor line.",
  // The reread of the head of the day (components/dojo/dojo-live.tsx): the first paint says the figures were committed and what a
  // browser that can then does; after the reread, exactly one of the four others says what is shown, never why a reread was refused.
  rereadFirst:
    "These figures were committed with this page. A browser that runs its script and can check Ed25519 signatures then rereads " +
    "the published timeline and lines file, and replaces these figures only when every check holds.",
  rereadDone:
    "Reread in your browser from the published files: each new line chains to the committed record by its SHA-256, its Ed25519 " +
    "signature matches a committed key, and the lines file's SHA-256 and Merkle root match the signed line.",
  rereadNoCheck:
    "This browser cannot check Ed25519 signatures, so the published files were not reread here: the figures shown are those " +
    "committed with this page.",
  rereadFallback:
    "The published files could not be reread, or did not match the committed record, in your browser: the figures shown are " +
    "those committed with this page.",
  rereadKeyChange:
    "The new lines carry a key change, which this page does not follow in your browser: the figures shown are those committed " +
    "with this page.",
} as const;
