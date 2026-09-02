import { HStack, IconButton, Slider } from "@chakra-ui/react"
import { LuRotateCcw } from "react-icons/lu"

interface RotationSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function RotationSlider({ value, onChange, disabled }: RotationSliderProps) {
  return (
    <Slider.Root
      width="full"
      min={-180}
      max={180}
      step={1}
      value={[value]}
      disabled={disabled}
      onValueChange={(details) => onChange(details.value[0])}
    >
      <HStack justify="space-between">
        <Slider.Label>Rotation</Slider.Label>
        <IconButton
          aria-label="Reset rotation"
          size="2xs"
          variant="ghost"
          disabled={disabled || value === 0}
          onClick={() => onChange(0)}
        >
          <LuRotateCcw />
        </IconButton>
      </HStack>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0}>
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
  )
}
