import Link from "next/link";

// Charter C common footer (the Narabi and Ukemi footers are uniformised on it): the four fixed phrases, then the site
// links. No status, no number, no third-party name: a page carries its own status (the console page says it is
// upcoming), so no link here repeats a status word. The two legal phrases follow the text validated by counsel
// ("Facts witnessed, not investment advice. A signature attests origin, not truth.", charter lower case kept); the
// other two are the charter's.
const PHRASES: readonly string[] = [
  "facts witnessed, not investment advice",
  "a signature attests origin, not truth",
  "no endorsement of or by any venue, issuer or data source",
  "never a probability of being right",
];

const LINKS: readonly { href: string; label: string }[] = [
  { href: "/fleet", label: "Fleet register" },
  { href: "/applications", label: "Applications" },
  { href: "/how", label: "How it works" },
  { href: "/roadmap", label: "Building" },
  { href: "/token", label: "Token" },
  { href: "/integrators", label: "For integrators" },
  { href: "/docs", label: "Docs" },
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
        <Link href="/console">Console</Link>
        <a href="https://github.com/KraidleAI/monark" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
    </footer>
  );
}
