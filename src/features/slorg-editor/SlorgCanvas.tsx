import { useLayoutEffect, useRef, useState } from "react"
import { chakra } from "@chakra-ui/react"
import { renderSlorg } from "../../art/renderSlorg"
import { BODY_BBOX, PADDED_VIEWBOX, type SlorgAppearance } from "../../art/slorgArt"
import { clampOffset, type ImageTransform } from "../../art/coverFit"
import { sizeCanvasForDpr } from "../../art/canvasSizing"

const ChakraCanvas = chakra("canvas")

interface SlorgCanvasProps extends SlorgAppearance {
  image: HTMLImageElement | null
  transform: ImageTransform
  onTransformChange: (transform: ImageTransform) => void
  size?: number
}

export function SlorgCanvas({
  image,
  transform,
  onTransformChange,
  backgroundColor,
  colorOpacity,
  colorLayer,
  madEyes,
  spots,
  spotColor,
  spotOpacity,
  size = 400,
}: SlorgCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pixelSize = sizeCanvasForDpr(canvas, size)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    renderSlorg(ctx, {
      canvasWidth: pixelSize,
      canvasHeight: pixelSize,
      image,
      imageTransform: transform,
      backgroundColor,
      colorOpacity,
      colorLayer,
      madEyes,
      spots,
      spotColor,
      spotOpacity,
    })
  }, [
    image,
    transform,
    backgroundColor,
    colorOpacity,
    colorLayer,
    madEyes,
    spots,
    spotColor,
    spotOpacity,
    size,
  ])

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!image) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: transform.offsetX,
      startOffsetY: transform.offsetY,
    }
    setIsDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragState.current || !image) return
    // Measure the live rendered size rather than trusting the `size` prop, since the canvas can
    // shrink below it via maxWidth on narrow viewports.
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const unitsPerCssPx = PADDED_VIEWBOX.width / rect.width
    const deltaX = (e.clientX - dragState.current.startX) * unitsPerCssPx
    const deltaY = (e.clientY - dragState.current.startY) * unitsPerCssPx
    const rawOffsetX = dragState.current.startOffsetX + deltaX
    const rawOffsetY = dragState.current.startOffsetY + deltaY
    const clamped = clampOffset(
      image.naturalWidth,
      image.naturalHeight,
      BODY_BBOX,
      transform.userScale,
      rawOffsetX,
      rawOffsetY,
    )
    onTransformChange({ ...transform, ...clamped })
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragState.current) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }
    dragState.current = null
    setIsDragging(false)
  }

  return (
    <ChakraCanvas
      ref={canvasRef}
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      display="block"
      mx="auto"
      bg="gray.100"
      _dark={{ bg: "gray.800" }}
      width={`${size}px`}
      maxWidth="100%"
      aspectRatio="1"
      touchAction="none"
      cursor={image ? (isDragging ? "grabbing" : "grab") : "default"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  )
}
