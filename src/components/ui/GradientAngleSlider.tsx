import { Slider } from "@chakra-ui/react"

interface GradientAngleSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function GradientAngleSlider({ value, onChange, disabled }: GradientAngleSliderProps) {
  return (
    <Slider.Root
      width="full"
      min={0}
      max={360}
      step={1}
      value={[value]}
      disabled={disabled}
      onValueChange={(details) => onChange(details.value[0])}
    >
      <Slider.Label>Gradient angle</Slider.Label>
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
