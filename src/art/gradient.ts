export interface GradientLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Endpoints of a linear-gradient line spanning edge-to-edge across a rect at the given angle,
 * using the same projection formula CSS linear-gradient() uses (length = width*|cos| + height*|sin|)
 * so stops land flush on the rect boundary at any angle instead of leaving unsaturated margins at
 * cardinal angles.
 *
 * Degrees, clockwise-positive from +x (0 = right, 90 = down) - matches this codebase's existing
 * ctx.rotate()/SVG rotate() convention for image rotation.
 */
export function computeGradientLine(x: number, y: number, width: number, height: number, angleDeg: number): GradientLine {
  const angleRad = (angleDeg * Math.PI) / 180
  const dx = Math.cos(angleRad)
  const dy = Math.sin(angleRad)
  const cx = x + width / 2
  const cy = y + height / 2
  const length = Math.abs(width * dx) + Math.abs(height * dy)
  return {
    x1: cx - (dx * length) / 2,
    y1: cy - (dy * length) / 2,
    x2: cx + (dx * length) / 2,
    y2: cy + (dy * length) / 2,
  }
}

/** Evenly-spaced [0..1] stop offsets for the given number of colors. A single color yields one stop at 0, which both Canvas and SVG render as a solid fill. */
export function gradientStopOffsets(count: number): number[] {
  if (count <= 1) return [0]
  return Array.from({ length: count }, (_, i) => i / (count - 1))
}
