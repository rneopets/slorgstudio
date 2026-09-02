import { useState } from "react"
import { Button, HStack, NativeSelect } from "@chakra-ui/react"
import { DEFAULT_EXPORT_SIZE_PX, EXPORT_SIZE_OPTIONS, exportSlorgPng } from "../../art/exportPng"
import { exportSlorgSvg } from "../../art/exportSvg"
import type { ImageTransform } from "../../art/coverFit"
import type { SlorgAppearance } from "../../art/slorgArt"

interface ExportButtonProps extends SlorgAppearance {
  image: HTMLImageElement | null
  transform: ImageTransform
}

export function ExportButton({ image, transform, ...appearance }: ExportButtonProps) {
  const [sizePx, setSizePx] = useState(DEFAULT_EXPORT_SIZE_PX)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [isExportingSvg, setIsExportingSvg] = useState(false)
  const canExport = !!image || !!appearance.backgroundColor

  async function handleExportPng() {
    if (!canExport) return
    setIsExportingPng(true)
    try {
      await exportSlorgPng(image, transform, { ...appearance, sizePx })
    } finally {
      setIsExportingPng(false)
    }
  }

  async function handleExportSvg() {
    if (!canExport) return
    setIsExportingSvg(true)
    try {
      await exportSlorgSvg(image, transform, appearance)
    } finally {
      setIsExportingSvg(false)
    }
  }

  return (
    <HStack gap="2" width="full">
      <NativeSelect.Root size="sm" width="24" flexShrink="0" disabled={!canExport}>
        <NativeSelect.Field value={sizePx} onChange={(e) => setSizePx(Number(e.target.value))}>
          {EXPORT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <Button onClick={handleExportSvg} disabled={!canExport} loading={isExportingSvg} variant="outline" flex="1">
        Export SVG
      </Button>

      <Button onClick={handleExportPng} disabled={!canExport} loading={isExportingPng} colorPalette="purple" flex="1">
        Export PNG
      </Button>
    </HStack>
  )
}
