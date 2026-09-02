import { Slider } from "@chakra-ui/react"

interface OpacitySliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function OpacitySlider({ value, onChange, disabled }: OpacitySliderProps) {
  return (
    <Slider.Root
      width="full"
      min={0}
      max={1}
      step={0.01}
      value={[value]}
      disabled={disabled}
      onValueChange={(details) => onChange(details.value[0])}
    >
      <Slider.Label>Spot opacity</Slider.Label>
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
