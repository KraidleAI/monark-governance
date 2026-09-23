import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Charter C typefaces (decision 145; OFL, decisions 105/107): Space Grotesk (variable) for the interface and
// prose, JetBrains Mono (variable) for data, Archivo Black for the wordmarks, Newsreader (variable, upright and
// italic) for the long-form serif (/writing, KEPT by ruling Q6; OFL copy procured from google/fonts, decision 148).
// All SELF-HOSTED from the committed OFL files in app/fonts/ (licences beside them) through next/font/local — no
// font host is contacted, at build or at run time. Newsreader's fallback metrics are computed against Times New
// Roman, the serif base the Google loader used for it (the next/font/local default, Arial, is sans-serif).
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-wght.ttf",
  weight: "300 700",
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-wght.ttf",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const archivoBlack = localFont({
  src: "./fonts/ArchivoBlack-Regular.ttf",
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});
const newsreader = localFont({
  src: [
    { path: "./fonts/Newsreader-opsz-wght.ttf", weight: "200 800", style: "normal" },
    { path: "./fonts/Newsreader-Italic-opsz-wght.ttf", weight: "200 800", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  // Not preloaded (decision 146 ruling): from the root layout both files would be preloaded on every route. Measured:
  // /writing and /products draw it; / also fetches the upright file (its kanji try this face first: no CJK glyph).
  preload: false,
});

// Static metadata only (honesty lint scans title/description; no digits). No generateMetadata (gate
// no_generate_metadata_in_apps_site). Description reprised from the existing shell, unchanged.
export const metadata: Metadata = {
  title: "MONARK",
  description:
    "MONARK — a company of agent-products on one coverage-controlled gate that emits commit, defer, or abstain, and a depletable authorization budget.",
};

// Apply the theme before first paint (ruling Q5): the stored explicit choice if any, else the system preference
// (prefers-color-scheme). try/catch for privacy-mode safety. The client ThemeProvider then syncs React state.
const themeInit =
  "(function(){try{var d=document.documentElement,s=null;try{s=localStorage.getItem('monark-theme')}catch(e){}var t=(s==='dark'||s==='light')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark'){d.classList.add('dark')}d.style.colorScheme=t}catch(e){}})();";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${archivoBlack.variable} ${newsreader.variable} font-sans`}
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
