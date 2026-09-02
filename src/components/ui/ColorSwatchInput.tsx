import { HStack, IconButton, chakra } from "@chakra-ui/react"
import { randomHslHex } from "../../lib/randomColor"

const RawColorInput = chakra("input")

const ShuffleIcon = chakra("svg", {
  base: {
    boxSize: "4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
})

interface ColorSwatchInputProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorSwatchInput({ value, onChange, disabled }: ColorSwatchInputProps) {
  return (
    <HStack gap="2">
      <RawColorInput
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        width="10"
        height="8"
        padding="0"
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        cursor="pointer"
      />
      <IconButton
        aria-label="Random color"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onChange(randomHslHex())}
      >
        <ShuffleIcon viewBox="0 0 24 24">
          <path d="m18 4 3 3-3 3" />
          <path d="M3 7h8l5 10h5" />
          <path d="m18 20 3-3-3-3" />
          <path d="M3 17h8l2.5-5" />
        </ShuffleIcon>
      </IconButton>
    </HStack>
  )
}
