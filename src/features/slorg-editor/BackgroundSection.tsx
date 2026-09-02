import { Stack, Tabs } from "@chakra-ui/react"
import { Section } from "../../components/ui/Section"
import { ImageDropzone } from "../../components/ui/ImageDropzone"
import { ZoomSlider } from "../../components/ui/ZoomSlider"
import { RotationSlider } from "../../components/ui/RotationSlider"
import { ColorSwatchInput } from "../../components/ui/ColorSwatchInput"
import { DEFAULT_BODY_COLOR } from "../../art/slorgArt"
import type { ImageTransform } from "../../art/coverFit"

interface BackgroundSectionProps {
  onImageReady: (image: HTMLImageElement) => void
  backgroundColor: string | null
  onBackgroundColorChange: (color: string) => void
  transform: ImageTransform
  onTransformChange: (transform: ImageTransform) => void
  hasImage: boolean
}

export function BackgroundSection({
  onImageReady,
  backgroundColor,
  onBackgroundColorChange,
  transform,
  onTransformChange,
  hasImage,
}: BackgroundSectionProps) {
  return (
    <Section title="Base" first>
      <Tabs.Root defaultValue="color">
        <Tabs.List>
          <Tabs.Trigger value="color">Color</Tabs.Trigger>
          <Tabs.Trigger value="image">Image</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="color">
          <ColorSwatchInput value={backgroundColor ?? DEFAULT_BODY_COLOR} onChange={onBackgroundColorChange} />
        </Tabs.Content>

        <Tabs.Content value="image">
          <Stack gap="3">
            <ImageDropzone onImageReady={onImageReady} />
            <ZoomSlider
              value={transform.userScale}
              onChange={(userScale) => onTransformChange({ ...transform, userScale })}
              disabled={!hasImage}
            />
            <RotationSlider
              value={transform.rotation}
              onChange={(rotation) => onTransformChange({ ...transform, rotation })}
              disabled={!hasImage}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  )
}
