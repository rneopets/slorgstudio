import {
  BODY_BBOX,
  BODY_OUTLINE,
  DEFAULT_GRADIENT_ANGLE,
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
  SPOT_COLOR,
  SPOT_OPACITY,
  SPOT_PATHS,
  type SlorgAppearance,
  type SlorgPath,
} from "./slorgArt"
import { computeCoverRect, DEFAULT_TRANSFORM, type ImageTransform } from "./coverFit"
import { computeGradientLine, gradientStopOffsets } from "./gradient"

function pathWithTransform(spec: SlorgPath): Path2D {
  const [a, b, c, d, e, f] = spec.transform
  const matrix = new DOMMatrix([a, b, c, d, e, f])
  const path = new Path2D()
  path.addPath(new Path2D(spec.d), matrix)
  return path
}

function drawSlorgPath(
  ctx: CanvasRenderingContext2D,
  spec: SlorgPath,
  overrides?: { fill?: string; suppressStroke?: boolean },
) {
  const path = pathWithTransform(spec)
  const fill = overrides?.fill ?? spec.fill
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill(path)
  }
  if (spec.stroke && !overrides?.suppressStroke) {
    ctx.strokeStyle = spec.stroke
    ctx.lineWidth = spec.strokeWidth ?? 1
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.stroke(path)
  }
}

function drawSpotsOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  color: string,
  opacity: number,
) {
  // Paint each spot at full opacity onto an offscreen mask (so overlaps just overwrite, never
  // stack), then composite that mask once at the given opacity - avoids both alpha-stacking in
  // overlap regions and the "holes" that combining differently-wound paths into a single
  // nonzero-rule fill can produce.
  const mask = document.createElement("canvas")
  mask.width = canvasWidth
  mask.height = canvasHeight
  const maskCtx = mask.getContext("2d")
  if (!maskCtx) throw new Error("Canvas 2D context unavailable")
  maskCtx.setTransform(ctx.getTransform())
  maskCtx.fillStyle = color
  for (const spot of SPOT_PATHS) maskCtx.fill(pathWithTransform(spot))

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = opacity
  ctx.drawImage(mask, 0, 0)
  ctx.restore()
}

let checkerPattern: CanvasPattern | null = null
function getCheckerPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  if (checkerPattern) return checkerPattern
  const tile = document.createElement("canvas")
  const size = 16
  tile.width = size
  tile.height = size
  const tctx = tile.getContext("2d")
  if (!tctx) throw new Error("Canvas 2D context unavailable")
  tctx.fillStyle = "#e2e8f0"
  tctx.fillRect(0, 0, size, size)
  tctx.fillStyle = "#cbd5e1"
  tctx.fillRect(0, 0, size / 2, size / 2)
  tctx.fillRect(size / 2, size / 2, size / 2, size / 2)
  const pattern = ctx.createPattern(tile, "repeat")
  if (!pattern) throw new Error("Failed to create checker pattern")
  checkerPattern = pattern
  return checkerPattern
}

export interface RenderOptions extends Partial<SlorgAppearance> {
  canvasWidth: number
  canvasHeight: number
  image: HTMLImageElement | null
  imageTransform?: ImageTransform
}

export function renderSlorg(ctx: CanvasRenderingContext2D, options: RenderOptions) {
  const {
    canvasWidth,
    canvasHeight,
    image,
    imageTransform = DEFAULT_TRANSFORM,
    backgroundColors = [],
    colorGradientAngle = DEFAULT_GRADIENT_ANGLE,
    colorOpacity = 1,
    colorLayer = "back",
    madEyes = false,
    spots = true,
    spotColor = SPOT_COLOR,
    spotOpacity = SPOT_OPACITY,
  } = options

  const viewboxToCanvasScale = canvasWidth / PADDED_VIEWBOX.width

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.save()
  ctx.scale(viewboxToCanvasScale, canvasHeight / PADDED_VIEWBOX.height)
  ctx.translate(PADDING, PADDING)

  const bodyClip = pathWithTransform(BODY_OUTLINE)

  function paintImage() {
    if (!image) return
    const rect = computeCoverRect(image.naturalWidth, image.naturalHeight, BODY_BBOX, imageTransform)
    const cx = rect.x + rect.width / 2
    const cy = rect.y + rect.height / 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((imageTransform.rotation * Math.PI) / 180)
    ctx.scale(imageTransform.flipHorizontal ? -1 : 1, imageTransform.flipVertical ? -1 : 1)
    ctx.translate(-cx, -cy)
    ctx.filter = imageTransform.blur > 0 ? `blur(${imageTransform.blur * viewboxToCanvasScale}px)` : "none"
    ctx.globalAlpha = imageTransform.opacity
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height)
    ctx.restore()
  }

  function paintColor() {
    if (backgroundColors.length === 0) return
    // Overfill past the body's true bounds and let the clip trim it to the silhouette, rather
    // than relying on BODY_BBOX being pixel-exact - guarantees no gap between the fill and the
    // outline on any side.
    ctx.save()
    ctx.globalAlpha = colorOpacity
    const line = computeGradientLine(-PADDING, -PADDING, PADDED_VIEWBOX.width, PADDED_VIEWBOX.height, colorGradientAngle)
    const gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2)
    const offsets = gradientStopOffsets(backgroundColors.length)
    backgroundColors.forEach((color, i) => gradient.addColorStop(offsets[i], color))
    ctx.fillStyle = gradient
    ctx.fillRect(-PADDING, -PADDING, PADDED_VIEWBOX.width, PADDED_VIEWBOX.height)
    ctx.restore()
  }

  ctx.save()
  ctx.clip(bodyClip)
  if (!image && backgroundColors.length === 0) {
    ctx.fillStyle = getCheckerPattern(ctx)
    ctx.fillRect(-PADDING, -PADDING, PADDED_VIEWBOX.width, PADDED_VIEWBOX.height)
  } else if (colorLayer === "front") {
    paintImage()
    paintColor()
  } else {
    paintColor()
    paintImage()
  }
  if (spots) drawSpotsOverlay(ctx, canvasWidth, canvasHeight, spotColor, spotOpacity)
  ctx.restore()

  ctx.strokeStyle = BODY_OUTLINE.stroke ?? "#000000"
  ctx.lineWidth = BODY_OUTLINE.strokeWidth ?? 1
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.stroke(bodyClip)

  for (const path of MOUTH_PATHS) drawSlorgPath(ctx, path)
  // Tears run out from behind the eye white, so they're drawn first and let EYE_PATHS crop them.
  if (madEyes) for (const path of MAD_TEAR_PATHS) drawSlorgPath(ctx, path)
  for (const path of EYE_PATHS) {
    if (madEyes && HIGHLIGHT_PATH_IDS.has(path.id)) continue
    const isPupil = madEyes && PUPIL_PATH_IDS.has(path.id)
    const spec = isPupil && path.id in MAD_PUPIL_TRANSFORMS ? { ...path, transform: MAD_PUPIL_TRANSFORMS[path.id] } : path
    // Mad Eyes has no outline on the sclera or pupils, unlike the normal eyes.
    drawSlorgPath(ctx, spec, madEyes ? { fill: isPupil ? MAD_PUPIL_FILL : undefined, suppressStroke: true } : undefined)
  }
  // Eyebrows sit in front of the eye white, so they're drawn last.
  if (madEyes) for (const path of MAD_EYEBROW_PATHS) drawSlorgPath(ctx, path)

  ctx.restore()
}
