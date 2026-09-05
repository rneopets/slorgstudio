// Rasterizes public/favicon.svg into the PNG PWA icons (and a padded maskable variant), so all
// app icons stay in sync with the favicon. Run once from the repo root:
//   bun run scripts/generate-pwa-icons.mjs
// Requires Inkscape on PATH for rasterization (only needed when regenerating). Generated files
// are committed; CI does not regenerate them.
import { execFileSync } from "node:child_process"
import { readFileSync, unlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const publicDir = fileURLToPath(new URL("../public/", import.meta.url))
const svg = readFileSync(path.join(publicDir, "favicon.svg"), "utf8")

// The favicon's viewBox (e.g. "0 0 170.66667 170.66667") - needed to center the maskable variant.
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
if (!viewBoxMatch) throw new Error("favicon.svg has no viewBox")
const [vbX, vbY, vbW, vbH] = viewBoxMatch[1].split(/\s+/).map(Number)

function rasterize(svgText, sizePx, outPath) {
  const tmp = path.join(publicDir, `.icon-tmp-${sizePx}.svg`)
  writeFileSync(tmp, svgText)
  try {
    execFileSync("inkscape", [tmp, "--export-type=png", `--export-width=${sizePx}`, `--export-filename=${outPath}`], { stdio: "inherit" })
  } finally {
    unlinkSync(tmp)
  }
}

// Raster icons, full-bleed like the favicon.
rasterize(svg, 192, path.join(publicDir, "icon-192.png"))
rasterize(svg, 512, path.join(publicDir, "icon-512.png"))

// Maskable variant: the art is scaled to 80% of the canvas and centered, so it survives
// circular/squircle masking on Android and other platforms.
const canvas = 512
const art = Math.round(canvas * 0.8)
const scale = art / Math.max(vbW, vbH)
const tx = (canvas - vbW * scale) / 2 - vbX * scale
const ty = (canvas - vbH * scale) / 2 - vbY * scale
// Wrap the favicon's contents in a padded, centered group (the XML prolog stays as-is).
const maskableSvg = svg.replace(
  /<svg([^>]*)>/,
  (_match, attrs) => {
    const cleanAttrs = attrs.replace(/\s(width|height|viewBox)="[^"]*"/g, "")
    return `<svg${cleanAttrs} width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}"><g transform="translate(${tx} ${ty}) scale(${scale})">`
  },
).replace(/<\/svg>$/, `</g></svg>`)

rasterize(maskableSvg, canvas, path.join(publicDir, "icon-512-maskable.png"))

console.log("Wrote: icon-192.png, icon-512.png, icon-512-maskable.png (from favicon.svg)")