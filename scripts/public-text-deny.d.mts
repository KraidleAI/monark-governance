// scripts/public-text-deny.d.mts — type surface of scripts/public-text-deny.mjs, the public free-text gate
// (ADR-PUBLIC-CADENCE-1 D1.3), so the root type-checked tests import it without executing anything and stay free of the
// ratcheted no-unsafe rules (release-public.d.mts precedent). Runtime implementation = public-text-deny.mjs; Node ignores
// this file. Governance-only: neither file is whitelisted for the public export (CA-1.5).
/** A vendor name or kitchen form; `sample` is one text it matches (tests build their vectors from it, naming no vendor of their own). */
export interface NameForm { re: RegExp; why: string; sample: string }
export type PublicTextKind = "message" | "notes" | "issue";
/** `rule`: "a".."h", "k", "p", "cf", "q3", "title", "kind" or "empty"; `word`: the matched text (FM-2.4), a rule-g credential shape as prefix + length only. */
export interface PublicTextViolation { rule: string; line: number; word: string }
export interface PublicTextResult { ok: boolean; violations: PublicTextViolation[] }

export const DATA_SOURCE_FORMS: readonly NameForm[];
export const DATA_SOURCE_STEMS: readonly RegExp[];
export const DATA_SOURCE_MENTIONS: readonly string[];
export const OPERATOR_FORMS: readonly NameForm[];
export const HOSTING_FORMS: readonly NameForm[];
/** KITCHEN-PUBLIC-1 forms (rule k; test/site-build-fleet.test.ts indexes them in this order). */
export const KITCHEN_FORMS: readonly NameForm[];
/** bell-publish KEY_SHAPES without its bare "://" rule (rule g). */
export const SECRET_SHAPES: readonly RegExp[];
export const PUBLIC_TEXT_KINDS: readonly PublicTextKind[];
export const TITLE_MAX_CODE_POINTS: number;

/** True iff `tag` is a v0.MINOR.PATCH tag (0.x only; MAJOR>=1 refused). Pure. */
export function isSemverTag(tag: string): boolean;
/** The storefront bar (rule a): language gate + GLOBAL, site, skills and bell vocab bans; empty text refused. */
export function checkReleaseText(text: string): { ok: boolean; hits: unknown[] };
/** The public free-text gate; `kind` outside PUBLIC_TEXT_KINDS is a violation, never a throw. */
export function checkPublicText(text: string, kind: string): PublicTextResult;
/** docs/public-notes/** path -> kind, or null (refused) for any other path. */
export function kindForPath(rel: string): PublicTextKind | null;
