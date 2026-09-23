import Link from "next/link";

// Charter C common footer (charte-C.md §3; ruling Q5: the Narabi and Ukemi footers are uniformised on it): the
// four fixed phrases, then the site links. No status, no number, no third-party name. The two legal phrases follow
// the text validated by the investor's lawyer (decision 147; orchestrator ruling V1: "Facts witnessed, not investment
// advice. A signature attests origin, not truth.", charter lower case kept); the other two are the charter's.
const PHRASES: readonly string[] = [
  "facts witnessed, not investment advice",
  "a signature attests origin, not truth",
  "no endorsement of or by any venue, issuer or data source",
  "never a probability of being right",
];

const LINKS: readonly { href: string; label: string }[] = [
  { href: "/fleet", label: "Fleet register" },
  { href: "/products", label: "Products" },
  { href: "/how", label: "How it works" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/token", label: "Token" },
  { href: "/integrators", label: "For integrators" },
  { href: "/writing", label: "Writing" },
];

export function SiteFooter() {
  return (
    <footer className="c-footer">
      <div className="c-footer__phrases">
        {PHRASES.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
      <nav aria-label="Footer" className="c-footer__links">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/console">Console · upcoming</Link>
        <a href="https://github.com/KraidleAI/monark" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
    </footer>
  );
}
