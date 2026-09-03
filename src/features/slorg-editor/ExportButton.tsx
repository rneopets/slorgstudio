import { useRef, useState } from "react"
import { Button, HStack, IconButton, Menu, NativeSelect, Portal, Stack } from "@chakra-ui/react"
import { LuCheck, LuChevronDown, LuClipboardCopy, LuFileCode, LuFileImage } from "react-icons/lu"
import { DEFAULT_EXPORT_SIZE_PX, EXPORT_SIZE_OPTIONS, copySlorgPngToClipboard, exportSlorgPng } from "../../art/exportPng"
import { exportSlorgSvg } from "../../art/exportSvg"
import type { ImageTransform } from "../../art/coverFit"
import type { SlorgAppearance } from "../../art/slorgArt"

const COPIED_LABEL_DURATION_MS = 1500

interface ExportButtonProps extends SlorgAppearance {
  image: HTMLImageElement | null
  transform: ImageTransform
}

export function ExportButton({ image, transform, ...appearance }: ExportButtonProps) {
  const [sizePx, setSizePx] = useState(DEFAULT_EXPORT_SIZE_PX)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [isExportingSvg, setIsExportingSvg] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [justCopied, setJustCopied] = useState(false)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canExport = !!image || appearance.backgroundColors.length > 0

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

  async function handleCopy() {
    if (!canExport) return
    setIsCopying(true)
    try {
      await copySlorgPngToClipboard(image, transform, { ...appearance, sizePx })
      setJustCopied(true)
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
      copiedTimeoutRef.current = setTimeout(() => setJustCopied(false), COPIED_LABEL_DURATION_MS)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Stack direction={{ base: "column", sm: "row" }} align="stretch" gap="2" width="full">
      <NativeSelect.Root size="sm" width={{ base: "full", sm: "24" }} flexShrink="0" disabled={!canExport}>
        <NativeSelect.Field value={sizePx} onChange={(e) => setSizePx(Number(e.target.value))}>
          {EXPORT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <Button
        onClick={handleCopy}
        disabled={!canExport}
        loading={isCopying}
        variant="outline"
        flex={{ base: "none", sm: "1" }}
      >
        {justCopied ? <LuCheck /> : <LuClipboardCopy />} {justCopied ? "Copied!" : "Copy PNG"}
      </Button>

      <HStack gap="0" flex={{ base: "none", sm: "1" }}>
        <Button
          onClick={handleExportPng}
          disabled={!canExport}
          loading={isExportingPng}
          colorPalette="purple"
          flex="1"
          borderEndRadius="0"
        >
          <LuFileImage /> Export PNG
        </Button>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              colorPalette="purple"
              disabled={!canExport}
              aria-label="More export options"
              borderStartRadius="0"
              borderStartWidth="1px"
              borderStartColor="blackAlpha.400"
            >
              <LuChevronDown />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="svg" onClick={handleExportSvg} disabled={isExportingSvg}>
                  <LuFileCode /> Export SVG
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>
    </Stack>
  )
}
