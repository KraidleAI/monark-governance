// Atelier MONARK — serveur LOCAL (127.0.0.1) sans dépendance : rend les 9 états de fixtures/ racine
// côté serveur (état pur + rendu pur, TS strippé nativement par Node ≥ 24) et sert index.html,
// style.css, main.js. Aucun appel sortant, aucune clé, aucun ordre. `npm run atelier`.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRootFixtures, renderAll } from "./src/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PORT = Number(process.env["ATELIER_PORT"] ?? 4173);

const states = loadRootFixtures(join(ROOT, "fixtures"));
const page = readFileSync(join(HERE, "index.html"), "utf8").replace("<!--APP-->", renderAll(states));
const css = readFileSync(join(HERE, "style.css"), "utf8");
const js = readFileSync(join(HERE, "main.js"), "utf8");

createServer((req, res) => {
  const url = req.url ?? "/";
  if (url === "/style.css") return res.writeHead(200, { "content-type": "text/css; charset=utf-8" }).end(css);
  if (url === "/main.js") return res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" }).end(js);
  if (url === "/" || url === "/index.html") return res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page);
  res.writeHead(404).end("not found");
}).listen(PORT, "127.0.0.1", () => {
  console.log(`atelier MONARK — http://127.0.0.1:${PORT}/  (${states.length} états, local seulement)`);
});
