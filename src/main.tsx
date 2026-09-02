import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "./components/ui/color-mode.tsx"
import "./index.css"
import { App } from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme="dark">
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>,
)
