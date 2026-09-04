// Renders the app's default Slorg (the same artwork used by the SVG exporter) into static PWA
// icons, so the icon is always in sync with src/art/slorgArt.ts. Run once from the repo root:
//   bun run scripts/generate-pwa-icons.mjs
// Requires Inkscape on PATH for rasterization (only needed when regenerating). Generated files
// are committed; CI does not regenerate them.
import { execFileSync } from "node:child_process"
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { buildSlorgSvg } from "../src/art/exportSvg.ts"
import { DEFAULT_BODY_COLOR, PADDED_VIEWBOX, SPOT_COLOR, SPOT_OPACITY } from "../src/art/slorgArt.ts"
import { DEFAULT_TRANSFORM } from "../src/art/coverFit.ts"

const publicDir = fileURLToPath(new URL("../public/", import.meta.url))

// Same defaults the editor starts with (SlorgEditor.tsx).
const appearance = {
  backgroundColors: [DEFAULT_BODY_COLOR],
  colorGradientAngle: 45,
  colorOpacity: 1,
  colorLayer: "back",
  madEyes: false,
  spots: true,
  spotColor: SPOT_COLOR,
  spotOpacity: SPOT_OPACITY,
}

const svg = buildSlorgSvg(null, DEFAULT_TRANSFORM, appearance)

function rasterize(svgText, sizePx, outPath) {
  const tmp = path.join(publicDir, `.icon-tmp-${sizePx}.svg`)
  writeFileSync(tmp, svgText)
  try {
    execFileSync("inkscape", [tmp, "--export-type=png", `--export-width=${sizePx}`, `--export-filename=${outPath}`], { stdio: "inherit" })
  } finally {
    unlinkSync(tmp)
  }
}

mkdirSync(publicDir, { recursive: true })

// Vector icon (favicon + manifest "any" entry).
writeFileSync(path.join(publicDir, "icon.svg"), svg)

// Raster icons. The maskable variant pads the art to 80% of the canvas so it survives
// circular/squircle masking on Android and other platforms.
rasterize(svg, 192, path.join(publicDir, "icon-192.png"))
rasterize(svg, 512, path.join(publicDir, "icon-512.png"))

const canvas = 512
const art = Math.round(canvas * 0.8)
const offset = (canvas - art) / 2
// Wrap the generated SVG's contents in a padded, centered group (the XML prolog stays as-is).
const maskableSvg = svg.replace(
  /<svg([^>]*)>/,
  (_match, attrs) => {
    const cleanAttrs = attrs.replace(/\s(width|height|viewBox)="[^"]*"/g, "")
    return `<svg${cleanAttrs} width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}"><g transform="translate(${offset} ${offset}) scale(${art / PADDED_VIEWBOX.width})">`
  },
).replace(/<\/svg>$/, `</g></svg>`)

rasterize(maskableSvg, canvas, path.join(publicDir, "icon-512-maskable.png"))

console.log("Wrote: icon.svg, icon-192.png, icon-512.png, icon-512-maskable.png")