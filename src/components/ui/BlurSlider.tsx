import { HStack, IconButton, Slider } from "@chakra-ui/react"
import { LuRotateCcw } from "react-icons/lu"

interface BlurSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function BlurSlider({ value, onChange, disabled }: BlurSliderProps) {
  return (
    <Slider.Root
      width="full"
      min={0}
      max={20}
      step={0.5}
      value={[value]}
      disabled={disabled}
      onValueChange={(details) => onChange(details.value[0])}
    >
      <HStack justify="space-between">
        <Slider.Label>Blur</Slider.Label>
        <IconButton
          aria-label="Reset blur"
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
