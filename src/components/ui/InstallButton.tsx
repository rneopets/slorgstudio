import { useEffect, useState } from "react"
import { Button } from "@chakra-ui/react"
import { LuDownload } from "react-icons/lu"
import { isAppInstallable, onInstallabilityChange, promptInstallApp } from "../../pwa"

/**
 * "Install app" button that only appears when the browser fires `beforeinstallprompt`
 * (Chrome/Edge on desktop and Android). Other browsers offer their own install UI.
 */
export function InstallButton() {
  const [installable, setInstallable] = useState(isAppInstallable())

  useEffect(() => onInstallabilityChange(() => setInstallable(isAppInstallable())), [])

  if (!installable) return null

  return (
    <Button size="sm" variant="outline" onClick={() => void promptInstallApp()}>
      <LuDownload /> Install app
    </Button>
  )
}