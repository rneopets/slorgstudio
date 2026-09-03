import { Separator, Stack, Text } from "@chakra-ui/react"
import { Section } from "../../components/ui/Section"
import { ImageDropzone } from "../../components/ui/ImageDropzone"
import { ZoomSlider } from "../../components/ui/ZoomSlider"
import { RotationSlider } from "../../components/ui/RotationSlider"
import { FlipButtons } from "../../components/ui/FlipButtons"
import { BlurSlider } from "../../components/ui/BlurSlider"
import { OpacitySlider } from "../../components/ui/OpacitySlider"
import { ColorSwatchInput } from "../../components/ui/ColorSwatchInput"
import { ColorLayerToggle } from "../../components/ui/ColorLayerToggle"
import { DEFAULT_BODY_COLOR } from "../../art/slorgArt"
import type { ImageTransform } from "../../art/coverFit"

interface BackgroundSectionProps {
  onImageReady: (image: HTMLImageElement) => void
  backgroundColor: string | null
  onBackgroundColorChange: (color: string) => void
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
  backgroundColor,
  onBackgroundColorChange,
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
        <ColorSwatchInput value={backgroundColor ?? DEFAULT_BODY_COLOR} onChange={onBackgroundColorChange} />
        <OpacitySlider label="Color opacity" value={colorOpacity} onChange={onColorOpacityChange} />
        <ColorLayerToggle value={colorLayer} onChange={onColorLayerChange} disabled={!hasImage} />

        <Separator />

        <Text fontWeight="medium" fontSize="sm">
          Image
        </Text>
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
        <FlipButtons
          flipHorizontal={transform.flipHorizontal}
          flipVertical={transform.flipVertical}
          onFlipHorizontalChange={(flipHorizontal) => onTransformChange({ ...transform, flipHorizontal })}
          onFlipVerticalChange={(flipVertical) => onTransformChange({ ...transform, flipVertical })}
          disabled={!hasImage}
        />
        <BlurSlider
          value={transform.blur}
          onChange={(blur) => onTransformChange({ ...transform, blur })}
          disabled={!hasImage}
        />
        <OpacitySlider
          label="Image opacity"
          value={transform.opacity}
          onChange={(opacity) => onTransformChange({ ...transform, opacity })}
          disabled={!hasImage}
        />
      </Stack>
    </Section>
  )
}
