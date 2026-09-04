import { Container, Heading, Text, Stack } from "@chakra-ui/react"
import { SlorgEditor } from "./features/slorg-editor/SlorgEditor"
import { Footer } from "./components/layout/Footer"
import { ColorModeButton } from "./components/ui/color-mode"

export function App() {
  return (
    <Stack gap="0" minHeight="100vh">
      <Container py="10" display="flex" justifyContent="center" flex="1" position="relative">
        <ColorModeButton position="absolute" top="4" right="4" />
        <Stack gap="8" align="center" width="full" maxWidth="4xl">
          <Stack gap="1" textAlign="center">
            <Heading size="2xl">Slorg Studio</Heading>
            <Text color="fg.muted">Customize a Slorg and export a PNG.</Text>
          </Stack>
          <SlorgEditor />
        </Stack>
      </Container>
      <Footer />
    </Stack>
  )
}
