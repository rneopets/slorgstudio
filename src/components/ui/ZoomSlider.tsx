import { Slider } from "@chakra-ui/react"

interface ZoomSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function ZoomSlider({ value, onChange, disabled }: ZoomSliderProps) {
  return (
    <Slider.Root
      width="full"
      min={1}
      max={4}
      step={0.01}
      value={[value]}
      disabled={disabled}
      onValueChange={(details) => onChange(details.value[0])}
    >
      <Slider.Label>Zoom</Slider.Label>
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
