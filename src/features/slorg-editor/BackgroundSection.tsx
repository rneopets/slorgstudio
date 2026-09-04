import { Collapsible, Separator, Stack, Text } from "@chakra-ui/react"
import { Section } from "../../components/ui/Section"
import { ImageDropzone } from "../../components/ui/ImageDropzone"
import { ZoomSlider } from "../../components/ui/ZoomSlider"
import { RotationSlider } from "../../components/ui/RotationSlider"
import { FlipButtons } from "../../components/ui/FlipButtons"
import { BlurSlider } from "../../components/ui/BlurSlider"
import { OpacitySlider } from "../../components/ui/OpacitySlider"
import { ColorListInput } from "../../components/ui/ColorListInput"
import { GradientAngleSlider } from "../../components/ui/GradientAngleSlider"
import { ColorLayerToggle } from "../../components/ui/ColorLayerToggle"
import type { ImageTransform } from "../../art/coverFit"

interface BackgroundSectionProps {
  onImageReady: (image: HTMLImageElement) => void
  backgroundColors: string[]
  onBackgroundColorsChange: (colors: string[]) => void
  colorGradientAngle: number
  onColorGradientAngleChange: (angle: number) => void
  colorOpacity: number
  onColorOpacityChange: (value: number) => void
  colorLayer: "front" | "back"
  onColorLayerChange: (value: "front" | "back") => void
  transform: ImageTransform
  onTransformChange: (transform: ImageTransform) => void
  hasImage: boolean
}

export function BackgroundSection({
  onImageReady,
  backgroundColors,
  onBackgroundColorsChange,
  colorGradientAngle,
  onColorGradientAngleChange,
  colorOpacity,
  onColorOpacityChange,
  colorLayer,
  onColorLayerChange,
  transform,
  onTransformChange,
  hasImage,
}: BackgroundSectionProps) {
  return (
    <Section title="Base" first>
      <Stack gap="3">
        <Text fontWeight="medium" fontSize="sm">
          Color
        </Text>
        <ColorListInput colors={backgroundColors} onChange={onBackgroundColorsChange} />
        <Collapsible.Root open={backgroundColors.length > 1}>
          <Collapsible.Content>
            <GradientAngleSlider value={colorGradientAngle} onChange={onColorGradientAngleChange} />
          </Collapsible.Content>
        </Collapsible.Root>
        <OpacitySlider label="Color opacity" value={colorOpacity} onChange={onColorOpacityChange} />
        <Collapsible.Root open={hasImage}>
          <Collapsible.Content>
            <ColorLayerToggle value={colorLayer} onChange={onColorLayerChange} />
          </Collapsible.Content>
        </Collapsible.Root>

        <Separator />

        <Text fontWeight="medium" fontSize="sm">
          Image
        </Text>
        <ImageDropzone onImageReady={onImageReady} />
        <Collapsible.Root open={hasImage}>
          <Collapsible.Content>
            <Stack gap="3">
              <ZoomSlider
                value={transform.userScale}
                onChange={(userScale) => onTransformChange({ ...transform, userScale })}
              />
              <RotationSlider
                value={transform.rotation}
                onChange={(rotation) => onTransformChange({ ...transform, rotation })}
              />
              <FlipButtons
                flipHorizontal={transform.flipHorizontal}
                flipVertical={transform.flipVertical}
                onFlipHorizontalChange={(flipHorizontal) => onTransformChange({ ...transform, flipHorizontal })}
                onFlipVerticalChange={(flipVertical) => onTransformChange({ ...transform, flipVertical })}
              />
              <BlurSlider value={transform.blur} onChange={(blur) => onTransformChange({ ...transform, blur })} />
              <OpacitySlider
                label="Image opacity"
                value={transform.opacity}
                onChange={(opacity) => onTransformChange({ ...transform, opacity })}
              />
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </Stack>
    </Section>
  )
}
