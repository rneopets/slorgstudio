/** Random hex color generated in HSL space (fixed pleasant saturation/lightness, random hue) so results stay vivid and legible rather than washed out or muddy. */
export function randomHslHex(): string {
  const h = Math.floor(Math.random() * 360)
  const s = 65
  const l = 55
  return hslToHex(h, s, l)
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sNorm * Math.min(lNorm, 1 - lNorm)
  const f = (n: number) => lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}
