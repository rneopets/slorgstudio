// PWA plumbing: service worker registration and the browser's install prompt.
//
// The install button (InstallButton) only appears when the browser fires `beforeinstallprompt`,
// which Chrome/Edge (desktop and Android) do when the app satisfies the installability criteria.
// Browsers without that event (e.g. Safari) still offer their own native install UI.

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): void
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const installabilityListeners = new Set<() => void>()

function emitInstallabilityChange() {
  for (const listener of installabilityListeners) listener()
}

window.addEventListener("beforeinstallprompt", (event) => {
  // Prevent the browser's default mini-infobar so we can offer our own button instead.
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  emitInstallabilityChange()
})

window.addEventListener("appinstalled", () => {
  deferredPrompt = null
  emitInstallabilityChange()
})

export function isAppInstallable(): boolean {
  return deferredPrompt !== null
}

/** Subscribes to installability changes; returns an unsubscribe function. */
export function onInstallabilityChange(listener: () => void): () => void {
  installabilityListeners.add(listener)
  return () => {
    installabilityListeners.delete(listener)
  }
}

/** Shows the browser's native install prompt. Resolves true if the user accepted it. */
export async function promptInstallApp(): Promise<boolean> {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  if (choice.outcome === "accepted") {
    deferredPrompt = null
    emitInstallabilityChange()
  }
  return choice.outcome === "accepted"
}

/** Registers the service worker in production builds (kept out of dev so it can't interfere with HMR). */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return

  // updateViaCache: "none" so the SW script itself is always revalidated from the network,
  // making updates take effect as soon as they're deployed.
  const register = () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })

  if (document.readyState === "complete") register()
  else window.addEventListener("load", register, { once: true })
}