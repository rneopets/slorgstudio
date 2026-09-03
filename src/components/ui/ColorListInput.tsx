import { HStack, IconButton } from "@chakra-ui/react"
import { LuPlus, LuX } from "react-icons/lu"
import { ColorSwatchInput } from "./ColorSwatchInput"
import { randomHslHex } from "../../lib/randomColor"

interface ColorListInputProps {
  colors: string[]
  onChange: (colors: string[]) => void
  disabled?: boolean
}

export function ColorListInput({ colors, onChange, disabled }: ColorListInputProps) {
  function handleColorChange(index: number, color: string) {
    onChange(colors.map((c, i) => (i === index ? color : c)))
  }

  function handleRemove(index: number) {
    onChange(colors.filter((_, i) => i !== index))
  }

  function handleAdd() {
    onChange([...colors, randomHslHex()])
  }

  return (
    <HStack gap="2" flexWrap="wrap">
      {colors.map((color, index) => (
        <HStack key={index} gap="1">
          <ColorSwatchInput value={color} onChange={(c) => handleColorChange(index, c)} disabled={disabled} />
          <IconButton
            aria-label="Remove color"
            size="sm"
            variant="ghost"
            disabled={disabled || colors.length <= 1}
            onClick={() => handleRemove(index)}
          >
            <LuX />
          </IconButton>
        </HStack>
      ))}
      <IconButton aria-label="Add color" size="sm" variant="outline" disabled={disabled} onClick={handleAdd}>
        <LuPlus />
      </IconButton>
    </HStack>
  )
}
