import { HStack, IconButton, Text } from "@chakra-ui/react"
import { LuFlipHorizontal2, LuFlipVertical2 } from "react-icons/lu"

interface FlipButtonsProps {
  flipHorizontal: boolean
  flipVertical: boolean
  onFlipHorizontalChange: (value: boolean) => void
  onFlipVerticalChange: (value: boolean) => void
  disabled?: boolean
}

export function FlipButtons({
  flipHorizontal,
  flipVertical,
  onFlipHorizontalChange,
  onFlipVerticalChange,
  disabled,
}: FlipButtonsProps) {
  return (
    <HStack justify="space-between">
      <Text fontWeight="medium" fontSize="sm">
        Flip
      </Text>
      <HStack gap="1">
        <IconButton
          aria-label="Flip horizontal"
          aria-pressed={flipHorizontal}
          size="sm"
          variant={flipHorizontal ? "solid" : "outline"}
          disabled={disabled}
          onClick={() => onFlipHorizontalChange(!flipHorizontal)}
        >
          <LuFlipHorizontal2 />
        </IconButton>
        <IconButton
          aria-label="Flip vertical"
          aria-pressed={flipVertical}
          size="sm"
          variant={flipVertical ? "solid" : "outline"}
          disabled={disabled}
          onClick={() => onFlipVerticalChange(!flipVertical)}
        >
          <LuFlipVertical2 />
        </IconButton>
      </HStack>
    </HStack>
  )
}
