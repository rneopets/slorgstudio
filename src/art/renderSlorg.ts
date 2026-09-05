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

function premultiplyAlpha(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255
    data[i] *= a
    data[i + 1] *= a
    data[i + 2] *= a
  }
}

function unpremultiplyAlpha(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a === 0) continue
    const factor = 255 / a
    data[i] *= factor
    data[i + 1] *= factor
    data[i + 2] *= factor
  }
}

// One box-blur sweep along rows (horizontal) or columns (vertical), via a sliding
// window sum so cost stays O(width * height) regardless of radius. Edge pixels are
// clamped (extended) rather than wrapped.
function boxBlurPass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  horizontal: boolean,
) {
  const windowSize = radius * 2 + 1
  const lineLength = horizontal ? width : height
  const lineCount = horizontal ? height : width

  for (let line = 0; line < lineCount; line++) {
    let sumR = 0
    let sumG = 0
    let sumB = 0
    let sumA = 0
    for (let i = -radius; i <= radius; i++) {
      const pos = Math.min(lineLength - 1, Math.max(0, i))
      const idx = horizontal ? (line * width + pos) * 4 : (pos * width + line) * 4
      sumR += src[idx]
      sumG += src[idx + 1]
      sumB += src[idx + 2]
      sumA += src[idx + 3]
    }
    for (let pos = 0; pos < lineLength; pos++) {
      const outIdx = horizontal ? (line * width + pos) * 4 : (pos * width + line) * 4
      dst[outIdx] = sumR / windowSize
      dst[outIdx + 1] = sumG / windowSize
      dst[outIdx + 2] = sumB / windowSize
      dst[outIdx + 3] = sumA / windowSize

      const addPos = Math.min(lineLength - 1, pos + radius + 1)
      const subPos = Math.max(0, pos - radius)
      const addIdx = horizontal ? (line * width + addPos) * 4 : (addPos * width + line) * 4
      const subIdx = horizontal ? (line * width + subPos) * 4 : (subPos * width + line) * 4
      sumR += src[addIdx] - src[subIdx]
      sumG += src[addIdx + 1] - src[subIdx + 1]
      sumB += src[addIdx + 2] - src[subIdx + 2]
      sumA += src[addIdx + 3] - src[subIdx + 3]
    }
  }
}

// Three box-blur passes (horizontal + vertical each) closely approximate a true
// Gaussian blur of the same radius - the standard cheap alternative to a real
// Gaussian convolution.
function boxBlurImageData(imageData: ImageData, radius: number) {
  const { width, height, data } = imageData
  let src = data
  let dst = new Uint8ClampedArray(data.length)
  for (let pass = 0; pass < 3; pass++) {
    boxBlurPass(src, dst, width, height, radius, true)
    ;[src, dst] = [dst, src]
    boxBlurPass(src, dst, width, height, radius, false)
    ;[src, dst] = [dst, src]
  }
}

// Working resolution is capped so blur cost stays bounded regardless of the export
// size (up to 8192px) - the blur radius is scaled down to match, and detail lost by
// blurring at a lower resolution is imperceptible once the result is soft anyway.
const MAX_BLUR_DIMENSION = 512

// ctx.filter = "blur(...)" is silently ignored on iOS Safari (and unreliable on other
// WebKit builds), so blur is computed manually via a triple box-blur on pixel data -
// this only relies on drawImage/getImageData/putImageData, which are reliable
// everywhere.
function blurredImageSource(
  image: CanvasImageSource,
  pixelWidth: number,
  pixelHeight: number,
  blurPx: number,
): HTMLCanvasElement {
  const workScale = Math.min(1, MAX_BLUR_DIMENSION / Math.max(pixelWidth, pixelHeight))
  const workWidth = Math.max(1, Math.round(pixelWidth * workScale))
  const workHeight = Math.max(1, Math.round(pixelHeight * workScale))
  const radius = Math.max(1, Math.round(blurPx * workScale))

  const canvas = document.createElement("canvas")
  canvas.width = workWidth
  canvas.height = workHeight
  const offCtx = canvas.getContext("2d")
  if (!offCtx) throw new Error("Canvas 2D context unavailable")
  offCtx.imageSmoothingEnabled = true
  offCtx.imageSmoothingQuality = "high"
  offCtx.drawImage(image, 0, 0, workWidth, workHeight)

  const imageData = offCtx.getImageData(0, 0, workWidth, workHeight)
  premultiplyAlpha(imageData.data)
  boxBlurImageData(imageData, radius)
  unpremultiplyAlpha(imageData.data)
  offCtx.putImageData(imageData, 0, 0)
  return canvas
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
    ctx.globalAlpha = imageTransform.opacity
    const blurPx = imageTransform.blur * viewboxToCanvasScale
    let source: CanvasImageSource = image
    if (blurPx > 0) {
      source = blurredImageSource(image, rect.width * viewboxToCanvasScale, rect.height * viewboxToCanvasScale, blurPx)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
    }
    ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height)
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
