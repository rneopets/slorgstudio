import { useState } from "react"
import { Flex, Stack } from "@chakra-ui/react"
import { SlorgCanvas } from "./SlorgCanvas"
import { BackgroundSection } from "./BackgroundSection"
import { CharacterSection } from "./CharacterSection"
import { Section } from "../../components/ui/Section"
import { ExportButton } from "./ExportButton"
import { DEFAULT_TRANSFORM, type ImageTransform } from "../../art/coverFit"
import { DEFAULT_BODY_COLOR, SPOT_COLOR, SPOT_OPACITY } from "../../art/slorgArt"

export function SlorgEditor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM)
  const [backgroundColor, setBackgroundColor] = useState<string | null>(DEFAULT_BODY_COLOR)
  const [colorOpacity, setColorOpacity] = useState(1)
  const [colorLayer, setColorLayer] = useState<"front" | "back">("back")
  const [madEyes, setMadEyes] = useState(false)
  const [spots, setSpots] = useState(true)
  const [spotColor, setSpotColor] = useState(SPOT_COLOR)
  const [spotOpacity, setSpotOpacity] = useState(SPOT_OPACITY)

  function handleImageReady(nextImage: HTMLImageElement) {
    setImage(nextImage)
    setTransform(DEFAULT_TRANSFORM)
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap="8" align={{ base: "center", md: "flex-start" }} width="full">
      <Stack width={{ base: "full", md: "400px" }} flexShrink="0" gap="0">
        <SlorgCanvas
          image={image}
          transform={transform}
          onTransformChange={setTransform}
          backgroundColor={backgroundColor}
          colorOpacity={colorOpacity}
          colorLayer={colorLayer}
          madEyes={madEyes}
          spots={spots}
          spotColor={spotColor}
          spotOpacity={spotOpacity}
        />

        <Section title="Export">
          <ExportButton
            image={image}
            transform={transform}
            backgroundColor={backgroundColor}
            colorOpacity={colorOpacity}
            colorLayer={colorLayer}
            madEyes={madEyes}
            spots={spots}
            spotColor={spotColor}
            spotOpacity={spotOpacity}
          />
        </Section>
      </Stack>

      <Stack flex="1" width="full" gap="0" borderWidth="1px" borderColor="border" borderRadius="lg" p="5">
        <BackgroundSection
          onImageReady={handleImageReady}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          colorOpacity={colorOpacity}
          onColorOpacityChange={setColorOpacity}
          colorLayer={colorLayer}
          onColorLayerChange={setColorLayer}
          transform={transform}
          onTransformChange={setTransform}
          hasImage={!!image}
        />

        <CharacterSection
          madEyes={madEyes}
          onMadEyesChange={setMadEyes}
          spots={spots}
          onSpotsChange={setSpots}
          spotColor={spotColor}
          onSpotColorChange={setSpotColor}
          spotOpacity={spotOpacity}
          onSpotOpacityChange={setSpotOpacity}
        />
      </Stack>
    </Flex>
  )
}
