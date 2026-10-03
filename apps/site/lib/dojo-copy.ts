// apps/site/lib/dojo-copy.ts -- the public texts of /dojo, a closed list, each rendered as written. No figure is typed here: a
// {name} in a sentence stands for the figure of that name, which the page renders by property access from the committed record
// (lib/dojo-served.ts) and the build check reads from the same record. The tier names live in ONE constant, in their order, and
// every sentence that names them reads it. Pure data (no React or Next import): the root tests and scripts/assert-fleet-html.mjs
// import it. No digit anywhere in this file, except in the two names SHA-256 and Ed25519. The five sentences of the reread are
// rendered by the reread component only, the built page carrying the first of them; so for the table's sentences and words.
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
    `it holds, ${MIGRATION} counting only the parts held for at least {migration_days} days, read from its line.`,
  method:
    "Each day, every address is read at instants drawn from a seed committed in advance and revealed afterwards; the day counts " +
    "the smallest reading, and an account no longer found counts as zero. When a balance decreases, the part that left starts " +
    "again from zero, newest first. The hold score is the sum, over the days counted, of the part still held. Points become " +
    "validated once the part that produced them has been held for {validation_days} days in a row, and stay provisional until then.",
  // The days before the first day read, rebuilt once from the history: rendered in the fold "How it is counted" right after the method,
  // in every state; no figure of the history file is rendered.
  retro:
    "The days before the first day read, from the token's creation on, were rebuilt once from the token's transaction history, " +
    "read through two distinct operators: each such day counts the smallest balance each address held that day, at the start of " +
    "the day or after any of its transactions. They are published in the history file that a signed line of the timeline names " +
    "by its SHA-256, and the first day read continues from them as from a previous day's line.",
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
    "This browser cannot check Ed25519 signatures, so the published timeline was not reread here: the figures shown are those " +
    "committed with this page.",
  rereadFallback:
    "The published files could not be reread, or did not match the committed record, in your browser: the figures shown are " +
    "those committed with this page.",
  rereadKeyChange:
    "The new lines carry a key change, which this page does not follow in your browser: the figures shown are those committed " +
    "with this page.",
  // The table of the lines (components/dojo/dojo-table.tsx): the first paint says what a browser that runs its script then lists; once
  // the lines file is bound, the table, its dust rule, its order and the look-up; if it cannot be bound, no line and the sentence that says so.
  table:
    "A browser that runs its script lists here the lines of the snapshot shown above, once the lines file's SHA-256, count and " +
    "Merkle root match the signed line.",
  tableDone:
    "The lines of the snapshot shown above, read in your browser from the published lines file, whose SHA-256, count and Merkle " +
    "root match the signed line; hold scores and points are in token-days.",
  tableOrder: "Listed by hold score, highest first; equal hold scores by address.",
  tableDust:
    "Lines under the dust threshold of the version in force are published and not listed here; the look-up below searches " +
    "every line.",
  tableNoVersion:
    "No unit version is in force yet, so every line is listed; once the first one applies, lines under its dust threshold " +
    "are published and not listed here.",
  tableRefused:
    "The lines file of the snapshot shown above could not be read in your browser, did not match the signed line, or carries a " +
    "line out of form: no line is listed.",
  lookup:
    "Look up an address among the lines of the snapshot shown above: your browser searches them here, and the address you enter " +
    "is not sent anywhere.",
  lookupInvalid: "This is not a valid address.",
  lookupAbsent: "No line for this address in the snapshot shown above.",
  lookupDust: "This line is under the dust threshold of the version in force, so it is not listed among the others.",
  // The labels of the two folds of the page, below the table, each a native fold that any browser opens without a script: how the
  // figures above are counted, then how anyone checks them.
  foldCounted: "How it is counted",
  foldCheck: "Check it yourself",
} as const;

/** The words of the table of the lines of the snapshot shown (components/dojo/dojo-table.tsx), where the lines under the dust threshold
 *  of the version in force are published and not listed: its columns, the two classes, the tier of an address that holds none, and its
 *  buttons. The tier names are those of DOJO_TIER_NAMES, never written twice. */
export const DOJO_TABLE = {
  address: "Address", class: "Class", holdScore: "Hold score", validated: "Validated", provisional: "Provisional", units: "Units",
  tier: "Tier", holder: "holder", program: "program", none: "none", showMore: "Show more lines", lookUp: "Look up",
  showAll: "Show all lines",
} as const;
