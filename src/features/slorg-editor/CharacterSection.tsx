import { Collapsible, HStack, Switch } from "@chakra-ui/react"
import { Section } from "../../components/ui/Section"
import { OpacitySlider } from "../../components/ui/OpacitySlider"
import { ColorSwatchInput } from "../../components/ui/ColorSwatchInput"

interface CharacterSectionProps {
  madEyes: boolean
  onMadEyesChange: (value: boolean) => void
  spots: boolean
  onSpotsChange: (value: boolean) => void
  spotColor: string
  onSpotColorChange: (color: string) => void
  spotOpacity: number
  onSpotOpacityChange: (value: number) => void
}

export function CharacterSection({
  madEyes,
  onMadEyesChange,
  spots,
  onSpotsChange,
  spotColor,
  onSpotColorChange,
  spotOpacity,
  onSpotOpacityChange,
}: CharacterSectionProps) {
  return (
    <Section title="Character">
      <Switch.Root checked={madEyes} onCheckedChange={(details) => onMadEyesChange(details.checked)}>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Mad Slorg eyes</Switch.Label>
      </Switch.Root>

      <HStack justify="space-between">
        <Switch.Root checked={spots} onCheckedChange={(details) => onSpotsChange(details.checked)}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>Show spots</Switch.Label>
        </Switch.Root>

        <ColorSwatchInput value={spotColor} onChange={onSpotColorChange} disabled={!spots} />
      </HStack>

      <Collapsible.Root open={spots}>
        <Collapsible.Content>
          <OpacitySlider label="Spot opacity" value={spotOpacity} onChange={onSpotOpacityChange} />
        </Collapsible.Content>
      </Collapsible.Root>
    </Section>
  )
}
