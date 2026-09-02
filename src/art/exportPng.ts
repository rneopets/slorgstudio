import { renderSlorg, type RenderOptions } from "./renderSlorg"
import { detectTrimFraction } from "./trimBounds"
import type { ImageTransform } from "./coverFit"
import type { SlorgAppearance } from "./slorgArt"
import { downloadBlob } from "../lib/downloadBlob"

export const EXPORT_SIZE_OPTIONS = [512, 1024, 2048, 4096] as const
export const DEFAULT_EXPORT_SIZE_PX = 2048

// Conservative cap under typical browser canvas-dimension limits (implementations commonly cap
// around 16384px per side; staying well under that avoids silent clamping/blank canvases).
const MAX_WORKING_SIZE_PX = 8192

export async function exportSlorgPng(
  image: HTMLImageElement | null,
  transform: ImageTransform,
  options: SlorgAppearance & { sizePx: number },
): Promise<void> {
  const renderOptionsFor = (size: number): RenderOptions => ({
    canvasWidth: size,
    canvasHeight: size,
    image,
    imageTransform: transform,
    backgroundColor: options.backgroundColor,
    madEyes: options.madEyes,
    spots: options.spots,
    spotColor: options.spotColor,
    spotOpacity: options.spotOpacity,
  })

  // Render once at a fixed detection resolution to find the tight bounding box of non-transparent
  // pixels (varies with Mad Eyes, since the tears extend past the plain body silhouette), then
  // render again at whatever working resolution makes that trimmed region's longer side equal
  // sizePx, and crop to it - so the export has no wasted transparent margin at any toggle state.
  const trim = detectTrimFraction((ctx, size) => renderSlorg(ctx, renderOptionsFor(size)))

  const workingSize = Math.min(MAX_WORKING_SIZE_PX, Math.round(options.sizePx / Math.max(trim.width, trim.height)))
  const working = document.createElement("canvas")
  working.width = workingSize
  working.height = workingSize
  const workingCtx = working.getContext("2d")
  if (!workingCtx) throw new Error("Canvas 2D context unavailable")
  renderSlorg(workingCtx, renderOptionsFor(workingSize))

  const outWidth = Math.round(trim.width * workingSize)
  const outHeight = Math.round(trim.height * workingSize)
  const canvas = document.createElement("canvas")
  canvas.width = outWidth
  canvas.height = outHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")
  ctx.drawImage(
    working,
    trim.x * workingSize,
    trim.y * workingSize,
    outWidth,
    outHeight,
    0,
    0,
    outWidth,
    outHeight,
  )

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("Failed to encode PNG")

  downloadBlob(blob, "slorg.png")
}
