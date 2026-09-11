// apps/site/postcss.config.mjs — Tailwind CSS v4 ships as a PostCSS plugin (@tailwindcss/postcss).
// v4 is CSS-first: the utility layer comes from `@import "tailwindcss";` in app/globals.css, no
// tailwind.config.js is required, and vendor-prefixing is built in (no autoprefixer dependency).
// Versions pinned exact in package.json.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
