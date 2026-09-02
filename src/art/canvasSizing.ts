/** Sizes a canvas's backing store for the display's pixel ratio, given its CSS size in px. Returns the resulting backing-store size (in device pixels) for use as the render target dimensions. */
export function sizeCanvasForDpr(canvas: HTMLCanvasElement, cssSize: number): number {
  const dpr = window.devicePixelRatio || 1
  const pixelSize = Math.round(cssSize * dpr)
  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize
    canvas.height = pixelSize
  }
  return pixelSize
}
