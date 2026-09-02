export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageTransform {
  /** Multiplier on top of the base cover-fit scale. 1 = tightest cover fit. */
  userScale: number
  /** Pan offset in viewBox units, relative to the bbox center. */
  offsetX: number
  offsetY: number
  /** Rotation in degrees, applied around the drawn image's own center. Range -180..180, 0 = none. */
  rotation: number
}

export const DEFAULT_TRANSFORM: ImageTransform = { userScale: 1, offsetX: 0, offsetY: 0, rotation: 0 }

/** The "background-size: cover" base scale that makes an image of naturalW x naturalH fully cover bbox. */
export function baseCoverScale(naturalWidth: number, naturalHeight: number, bbox: Rect): number {
  return Math.max(bbox.width / naturalWidth, bbox.height / naturalHeight)
}

/** Destination rect (viewBox units) to draw the image at, given its natural size and the current pan/zoom transform. */
export function computeCoverRect(
  naturalWidth: number,
  naturalHeight: number,
  bbox: Rect,
  transform: ImageTransform,
): Rect {
  const effScale = baseCoverScale(naturalWidth, naturalHeight, bbox) * transform.userScale
  const width = naturalWidth * effScale
  const height = naturalHeight * effScale
  const centerX = bbox.x + bbox.width / 2 + transform.offsetX
  const centerY = bbox.y + bbox.height / 2 + transform.offsetY
  return { x: centerX - width / 2, y: centerY - height / 2, width, height }
}

/** Max allowed |offset| per axis so the drawn image can't be panned to reveal space outside bbox. */
export function maxOffset(naturalWidth: number, naturalHeight: number, bbox: Rect, userScale: number) {
  const effScale = baseCoverScale(naturalWidth, naturalHeight, bbox) * userScale
  const drawnW = naturalWidth * effScale
  const drawnH = naturalHeight * effScale
  return {
    x: Math.max(0, (drawnW - bbox.width) / 2),
    y: Math.max(0, (drawnH - bbox.height) / 2),
  }
}

export function clampOffset(
  naturalWidth: number,
  naturalHeight: number,
  bbox: Rect,
  userScale: number,
  offsetX: number,
  offsetY: number,
): { offsetX: number; offsetY: number } {
  const max = maxOffset(naturalWidth, naturalHeight, bbox, userScale)
  return {
    offsetX: Math.min(max.x, Math.max(-max.x, offsetX)),
    offsetY: Math.min(max.y, Math.max(-max.y, offsetY)),
  }
}
