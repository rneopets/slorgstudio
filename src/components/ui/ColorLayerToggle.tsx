import { Button, HStack, Text } from "@chakra-ui/react"

interface ColorLayerToggleProps {
  value: "front" | "back"
  onChange: (value: "front" | "back") => void
  disabled?: boolean
}

export function ColorLayerToggle({ value, onChange, disabled }: ColorLayerToggleProps) {
  return (
    <HStack justify="space-between">
      <Text fontWeight="medium" fontSize="sm">
        Color layer
      </Text>
      <HStack gap="1">
        <Button
          size="sm"
          variant={value === "back" ? "solid" : "outline"}
          disabled={disabled}
          onClick={() => onChange("back")}
        >
          Background
        </Button>
        <Button
          size="sm"
          variant={value === "front" ? "solid" : "outline"}
          disabled={disabled}
          onClick={() => onChange("front")}
        >
          Foreground
        </Button>
      </HStack>
    </HStack>
  )
}
