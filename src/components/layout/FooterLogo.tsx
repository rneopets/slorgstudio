import { useLayoutEffect, useRef, useState } from "react"
import { Box, chakra } from "@chakra-ui/react"
import { renderSlorg } from "../../art/renderSlorg"
import { DEFAULT_BODY_COLOR, SPOT_COLOR, SPOT_OPACITY } from "../../art/slorgArt"
import { sizeCanvasForDpr } from "../../art/canvasSizing"

const ChakraCanvas = chakra("canvas")

const FLIP_DURATION_MS = 600
const CLICKS_TO_REVEAL_MAD_EYES = 5

interface FooterLogoProps {
  size?: number
}

export function FooterLogo({ size = 64 }: FooterLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spins, setSpins] = useState(0)
  const [madEyes, setMadEyes] = useState(false)
  const lastClickRef = useRef(0)
  const streakRef = useRef(0)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pixelSize = sizeCanvasForDpr(canvas, size)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    renderSlorg(ctx, {
      canvasWidth: pixelSize,
      canvasHeight: pixelSize,
      image: null,
      backgroundColor: DEFAULT_BODY_COLOR,
      madEyes,
      spots: true,
      spotColor: SPOT_COLOR,
      spotOpacity: SPOT_OPACITY,
    })
  }, [size, madEyes])

  function handleClick() {
    setSpins((n) => n + 1)

    // "Rapidly" means back-to-back clicks each landing before the previous flip finishes.
    const now = performance.now()
    streakRef.current = now - lastClickRef.current < FLIP_DURATION_MS ? streakRef.current + 1 : 1
    lastClickRef.current = now
    if (streakRef.current >= CLICKS_TO_REVEAL_MAD_EYES) setMadEyes(true)
  }

  return (
    <Box style={{ perspective: "400px" }}>
      <ChakraCanvas
        ref={canvasRef}
        width={`${size}px`}
        height={`${size}px`}
        display="block"
        cursor="pointer"
        userSelect="none"
        onClick={handleClick}
        style={{ transform: `rotateY(${spins * 360}deg)`, transition: "transform 0.6s ease" }}
      />
    </Box>
  )
}
