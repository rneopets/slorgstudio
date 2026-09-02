export interface TrimFraction {
  x: number
  y: number
  width: number
  height: number
}

const DETECTION_SIZE = 1024

/** Scans a square canvas for the tightest bounding box of non-transparent pixels, returned as fractions of the full canvas (0-1). */
export function computeTrimFraction(ctx: CanvasRenderingContext2D, size: number): TrimFraction {
  const { data } = ctx.getImageData(0, 0, size, size)

  let minX = size
  let minY = size
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < size; y++) {
    const rowOffset = y * size * 4
    for (let x = 0; x < size; x++) {
      if (data[rowOffset + x * 4 + 3] > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX) return { x: 0, y: 0, width: 1, height: 1 }

  // 1px safety margin so antialiased edge pixels never get clipped.
  const pad = 1
  const x0 = Math.max(0, minX - pad)
  const y0 = Math.max(0, minY - pad)
  const x1 = Math.min(size, maxX + 1 + pad)
  const y1 = Math.min(size, maxY + 1 + pad)

  return {
    x: x0 / size,
    y: y0 / size,
    width: (x1 - x0) / size,
    height: (y1 - y0) / size,
  }
}

/** Renders via the given callback onto a fixed-resolution detection canvas and returns the trim fraction. */
export function detectTrimFraction(render: (ctx: CanvasRenderingContext2D, size: number) => void): TrimFraction {
  const canvas = document.createElement("canvas")
  canvas.width = DETECTION_SIZE
  canvas.height = DETECTION_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")
  render(ctx, DETECTION_SIZE)
  return computeTrimFraction(ctx, DETECTION_SIZE)
}
