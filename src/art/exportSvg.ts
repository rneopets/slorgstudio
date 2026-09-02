import {
  BODY_BBOX,
  BODY_OUTLINE,
  EYE_PATHS,
  HIGHLIGHT_PATH_IDS,
  MAD_EYEBROW_PATHS,
  MAD_PUPIL_FILL,
  MAD_PUPIL_TRANSFORMS,
  MAD_TEAR_PATHS,
  MOUTH_PATHS,
  PADDED_VIEWBOX,
  PADDING,
  PUPIL_PATH_IDS,
  SPOT_PATHS,
  type SlorgAppearance,
  type SlorgPath,
} from "./slorgArt"
import { computeCoverRect, type ImageTransform } from "./coverFit"
import { computeTrimFraction } from "./trimBounds"
import { downloadBlob } from "../lib/downloadBlob"

function pathTag(spec: SlorgPath, overrides?: { fill?: string; suppressStroke?: boolean }): string {
  const fill = overrides?.fill ?? spec.fill ?? "none"
  const [a, b, c, d, e, f] = spec.transform
  const strokeAttrs =
    spec.stroke && !overrides?.suppressStroke
      ? ` stroke="${spec.stroke}" stroke-width="${spec.strokeWidth ?? 1}" stroke-linejoin="round" stroke-linecap="round"`
      : ""
  return `<path d="${spec.d}" transform="matrix(${a},${b},${c},${d},${e},${f})" fill="${fill}"${strokeAttrs}/>`
}

function imageToDataUrl(image: HTMLImageElement): string {
  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")
  ctx.drawImage(image, 0, 0)
  return canvas.toDataURL("image/png")
}

export function buildSlorgSvg(image: HTMLImageElement | null, transform: ImageTransform, options: SlorgAppearance): string {
  const { backgroundColor, madEyes, spots, spotColor, spotOpacity } = options
  const [oa, ob, oc, od, oe, of] = BODY_OUTLINE.transform
  const outlineStroke = BODY_OUTLINE.stroke ?? "#000000"
  const outlineWidth = BODY_OUTLINE.strokeWidth ?? 1

  let backgroundMarkup = ""
  if (image) {
    const rect = computeCoverRect(image.naturalWidth, image.naturalHeight, BODY_BBOX, transform)
    const href = imageToDataUrl(image)
    backgroundMarkup = `<image href="${href}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" preserveAspectRatio="none"/>`
  } else if (backgroundColor) {
    // Overfill past the body's true bounds and let the clip trim it to the silhouette, rather
    // than relying on BODY_BBOX being pixel-exact - guarantees no gap between the fill and the
    // outline on any side.
    backgroundMarkup = `<rect x="${-PADDING}" y="${-PADDING}" width="${PADDED_VIEWBOX.width}" height="${PADDED_VIEWBOX.height}" fill="${backgroundColor}"/>`
  }

  // Group opacity (not per-path fill-opacity) composites the whole layer once, so overlapping
  // spots don't stack alpha - mirrors the offscreen-mask technique used by the canvas renderer.
  const spotsMarkup = spots
    ? `<g fill="${spotColor}" opacity="${spotOpacity}">${SPOT_PATHS.map((p) => pathTag(p, { fill: spotColor })).join("")}</g>`
    : ""

  const mouthMarkup = MOUTH_PATHS.map((p) => pathTag(p)).join("")

  const eyesMarkup = EYE_PATHS.filter((p) => !(madEyes && HIGHLIGHT_PATH_IDS.has(p.id)))
    .map((p) => {
      const isPupil = madEyes && PUPIL_PATH_IDS.has(p.id)
      const spec = isPupil && p.id in MAD_PUPIL_TRANSFORMS ? { ...p, transform: MAD_PUPIL_TRANSFORMS[p.id] } : p
      // Mad Eyes has no outline on the sclera or pupils, unlike the normal eyes.
      return pathTag(spec, madEyes ? { fill: isPupil ? MAD_PUPIL_FILL : undefined, suppressStroke: true } : undefined)
    })
    .join("")

  // Tears run out from behind the eye white (drawn before eyesMarkup, cropped by it); eyebrows
  // sit in front of it (drawn after).
  const madTearsMarkup = madEyes ? MAD_TEAR_PATHS.map((p) => pathTag(p)).join("") : ""
  const madEyebrowsMarkup = madEyes ? MAD_EYEBROW_PATHS.map((p) => pathTag(p)).join("") : ""

  // clipPath content is defined in the user space of the element that references it
  // (the <g clip-path="..."> below), which already sits inside the translate(PADDING,PADDING)
  // group - so it only needs the path's own matrix, not a second translate.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${PADDED_VIEWBOX.width}" height="${PADDED_VIEWBOX.height}" viewBox="0 0 ${PADDED_VIEWBOX.width} ${PADDED_VIEWBOX.height}">
<defs>
<clipPath id="slorg-body-clip">
<path d="${BODY_OUTLINE.d}" transform="matrix(${oa},${ob},${oc},${od},${oe},${of})"/>
</clipPath>
</defs>
<g transform="translate(${PADDING},${PADDING})">
<g clip-path="url(#slorg-body-clip)">
${backgroundMarkup}
${spotsMarkup}
</g>
<path d="${BODY_OUTLINE.d}" transform="matrix(${oa},${ob},${oc},${od},${oe},${of})" fill="none" stroke="${outlineStroke}" stroke-width="${outlineWidth}" stroke-linejoin="round" stroke-linecap="round"/>
${mouthMarkup}
${madTearsMarkup}
${eyesMarkup}
${madEyebrowsMarkup}
</g>
</svg>`
}

function withViewBox(svg: string, rect: { x: number; y: number; width: number; height: number }): string {
  return svg.replace(
    /width="[^"]*" height="[^"]*" viewBox="[^"]*"/,
    `width="${rect.width}" height="${rect.height}" viewBox="${rect.x} ${rect.y} ${rect.width} ${rect.height}"`,
  )
}

/** Loads an SVG string into an Image and rasterizes it at a fixed resolution purely to detect the trim bounds. */
async function detectSvgTrimFraction(svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()

    const size = 1024
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context unavailable")
    ctx.drawImage(image, 0, 0, size, size)
    return computeTrimFraction(ctx, size)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function exportSlorgSvg(
  image: HTMLImageElement | null,
  transform: ImageTransform,
  options: SlorgAppearance,
): Promise<void> {
  const svg = buildSlorgSvg(image, transform, options)

  // Detect the tight bounding box of non-transparent pixels (varies with Mad Eyes) and crop the
  // SVG's viewBox/width/height to it, rather than shipping the full padded canvas every time.
  const trim = await detectSvgTrimFraction(svg)
  const trimmedSvg = withViewBox(svg, {
    x: trim.x * PADDED_VIEWBOX.width,
    y: trim.y * PADDED_VIEWBOX.height,
    width: trim.width * PADDED_VIEWBOX.width,
    height: trim.height * PADDED_VIEWBOX.height,
  })

  const blob = new Blob([trimmedSvg], { type: "image/svg+xml" })
  downloadBlob(blob, "slorg.svg")
}
