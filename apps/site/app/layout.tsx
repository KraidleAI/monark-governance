import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Brand typefaces (ADR-M004 D15): Sora for logotypes/UI, IBM Plex Mono for data, Newsreader serif for
// long-form reading. Self-hosted by next/font at build time, exposed as CSS variables consumed by
// app/globals.css (--font-sora / --font-ibm-plex-mono / --font-newsreader).
// RESERVE (D15, C-2): next/font/google fetches the font files from Google at BUILD time; they are not
// pinned by hash, so an offline build reds here. The @fontsource alternative (R-8) is left to the
// orchestrator — do not switch without instruction.
const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Static metadata only (honesty lint scans title/description; no digits). No generateMetadata (gate
// no_generate_metadata_in_apps_site). Description reprised from the existing shell, unchanged.
export const metadata: Metadata = {
  title: "MONARK",
  description:
    "MONARK — a company of agent-products on one coverage-controlled gate that emits commit, defer, or abstain, and a depletable authorization budget.",
};

// Apply the stored theme class before first paint, so a dark-mode visitor sees no light flash. Reads
// localStorage only and defaults to the paper (light) brand when nothing is stored; wrapped in
// try/catch for privacy-mode safety. The client ThemeProvider then syncs React state from this class.
const themeInit =
  "(function(){try{if(localStorage.getItem('monark-theme')==='dark'){var e=document.documentElement;e.classList.add('dark');e.style.colorScheme='dark';}}catch(e){}})();";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} ${newsreader.variable} font-sans`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
